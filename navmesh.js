/**
 * NavMesh - Navigation Mesh System
 * Malla invisible de alta densidad para navegaciÃ³n realista de araÃ±as
 */

class NavNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.surface = null; // 'trunk', 'branch', 'web', o null
        this.surfaceRef = null; // Referencia al objeto de superficie (branch/web)
        this.neighbors = []; // Array de {node, distance}
        this.walkable = false;

        // Para A* pathfinding
        this.g = 0; // Distancia desde inicio
        this.h = 0; // HeurÃ­stica (distancia estimada a objetivo)
        this.f = 0; // g + h
        this.parent = null;
    }

    addNeighbor(node, distance) {
        this.neighbors.push({ node, distance });
    }

    reset() {
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

class NavMesh {
    constructor(tree, canvasWidth, canvasHeight, nodeSpacing = 15, nest = null) {
        this.tree = tree;
        this.nest = nest; // AÃ±adido: referencia al nido
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.nodeSpacing = nodeSpacing; // Alta densidad: 15px para movimiento exquisito

        this.nodes = []; // Todos los nodos de la malla
        this.walkableNodes = []; // Solo nodos caminables
        this.nodeGrid = {}; // Mapeo rÃ¡pido por coordenadas "x,y" -> node

        this.webManager = null; // Se establecerÃ¡ despuÃ©s
    }

    setWebManager(webManager) {
        this.webManager = webManager;
    }

    /**
     * Construir malla completa - samplear todas las superficies
     */
    buildMesh() {
        console.log('ðŸ•¸ï¸ Construyendo NavMesh de alta densidad...');
        const startTime = performance.now();

        // 1. Crear grid de nodos
        this.createNodeGrid();

        // 2. Samplear superficies y marcar nodos walkable
        this.sampleSurfaces();

        // 3. Conectar nodos adyacentes
        this.buildConnections();

        const endTime = performance.now();
        console.log(`✅ NavMesh construida: ${this.walkableNodes.length} nodos walkable de ${this.nodes.length} totales en ${(endTime - startTime).toFixed(2)}ms`);
    }

    /**
     * Crear grid uniforme de nodos en todo el canvas
     */
    createNodeGrid() {
        for (let x = 0; x < this.canvasWidth; x += this.nodeSpacing) {
            for (let y = 0; y < this.canvasHeight; y += this.nodeSpacing) {
                const node = new NavNode(x, y);
                this.nodes.push(node);
                this.nodeGrid[`${x},${y}`] = node;
            }
        }
    }

    /**
     * Samplear todas las superficies y marcar nodos como walkable
     */
    sampleSurfaces() {
        for (const node of this.nodes) {
            // Comprobar nest (PRIMERO - tiene prioridad)
            if (this.nest && this.isInNest(node.x, node.y)) {
                node.walkable = true;
                node.surface = 'nest';
                node.surfaceRef = this.nest;
                this.walkableNodes.push(node);
                continue;
            }

            // Comprobar tronco
            if (this.isOnTrunk(node.x, node.y)) {
                node.walkable = true;
                node.surface = 'trunk';
                this.walkableNodes.push(node);
                continue;
            }

            // Comprobar ramas
            const branch = this.findBranchAt(node.x, node.y);
            if (branch) {
                node.walkable = true;
                node.surface = 'branch';
                node.surfaceRef = branch;
                this.walkableNodes.push(node);
                continue;
            }

            // Webs se aÃ±adirÃ¡n dinÃ¡micamente
        }
    }

    /**
     * Conectar nodos adyacentes que estÃ¡n en superficies compatibles
     */
    buildConnections() {
        const directions = [
            { dx: 1, dy: 0 },   // Derecha
            { dx: -1, dy: 0 },  // Izquierda
            { dx: 0, dy: 1 },   // Abajo
            { dx: 0, dy: -1 },  // Arriba
            { dx: 1, dy: 1 },   // Diagonal abajo-derecha
            { dx: -1, dy: 1 },  // Diagonal abajo-izquierda
            { dx: 1, dy: -1 },  // Diagonal arriba-derecha
            { dx: -1, dy: -1 }  // Diagonal arriba-izquierda
        ];

        for (const node of this.walkableNodes) {
            for (const dir of directions) {
                const nx = node.x + dir.dx * this.nodeSpacing;
                const ny = node.y + dir.dy * this.nodeSpacing;
                const neighbor = this.nodeGrid[`${nx},${ny}`];

                if (neighbor && neighbor.walkable) {
                    // Conectar si estÃ¡n en la misma superficie O en superficies que se tocan
                    if (this.canConnect(node, neighbor)) {
                        const distance = Math.hypot(nx - node.x, ny - node.y);
                        node.addNeighbor(neighbor, distance);
                    }
                }
            }
        }
    }

    /**
     * Determinar si dos nodos pueden conectarse
     */
    canConnect(node1, node2) {
        // Mismo tipo de superficie: siempre conectar
        if (node1.surface === node2.surface) {
            // Si son ramas, verificar que sean la misma rama
            if (node1.surface === 'branch') {
                return node1.surfaceRef === node2.surfaceRef;
            }
            // Si son webs, verificar que sean la misma web
            if (node1.surface === 'web') {
                return node1.surfaceRef === node2.surfaceRef;
            }
            return true;
        }

        // Superficies diferentes: conectar si estÃ¡n realmente "tocÃ¡ndose"
        // Trunk-Branch: conectar si la rama sale del tronco
        if ((node1.surface === 'trunk' && node2.surface === 'branch') ||
            (node1.surface === 'branch' && node2.surface === 'trunk')) {
            return Math.hypot(node1.x - node2.x, node1.y - node2.y) < this.nodeSpacing * 1.5;
        }

        // Trunk-Web o Branch-Web: conectar si estÃ¡n muy cerca
        if (node1.surface === 'web' || node2.surface === 'web') {
            return Math.hypot(node1.x - node2.x, node1.y - node2.y) < this.nodeSpacing * 1.5;
        }

        return false;
    }

    /**
     * AÃ±adir web a la malla dinÃ¡micamente
     */
    addWebToMesh(web) {
        const newNodes = [];

        // Samplear la lÃ­nea de la web
        const dx = web.endPoint.x - web.startPoint.x;
        const dy = web.endPoint.y - web.startPoint.y;
        const length = Math.hypot(dx, dy);
        const steps = Math.ceil(length / this.nodeSpacing);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round((web.startPoint.x + dx * t) / this.nodeSpacing) * this.nodeSpacing;
            const y = Math.round((web.startPoint.y + dy * t) / this.nodeSpacing) * this.nodeSpacing;

            // Si el nodo ya existe, actualizar; si no, crear
            let node = this.nodeGrid[`${x},${y}`];
            if (!node) {
                node = new NavNode(x, y);
                this.nodes.push(node);
                this.nodeGrid[`${x},${y}`] = node;
            }

            // Marcar como web
            if (!node.walkable) {
                node.walkable = true;
                this.walkableNodes.push(node);
            }
            node.surface = 'web';
            node.surfaceRef = web;
            newNodes.push(node);
        }

        // Reconectar: conectar nuevos nodos entre sÃ­ y con vecinos existentes
        this.rebuildConnectionsForNodes(newNodes);

        console.log(`Web aÃ±adida a NavMesh: ${newNodes.length} nodos nuevos`);
    }

    /**
     * Reconstruir conexiones para un conjunto de nodos
     */
    rebuildConnectionsForNodes(nodesToUpdate) {
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
            { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }
        ];

        for (const node of nodesToUpdate) {
            // Limpiar y reconstruir vecinos
            node.neighbors = [];

            for (const dir of directions) {
                const nx = node.x + dir.dx * this.nodeSpacing;
                const ny = node.y + dir.dy * this.nodeSpacing;
                const neighbor = this.nodeGrid[`${nx},${ny}`];

                if (neighbor && neighbor.walkable && this.canConnect(node, neighbor)) {
                    const distance = Math.hypot(nx - node.x, ny - node.y);
                    node.addNeighbor(neighbor, distance);
                }
            }
        }

        // TambiÃ©n actualizar vecinos de nodos adyacentes
        for (const node of nodesToUpdate) {
            for (const dir of directions) {
                const nx = node.x + dir.dx * this.nodeSpacing;
                const ny = node.y + dir.dy * this.nodeSpacing;
                const neighbor = this.nodeGrid[`${nx},${ny}`];

                if (neighbor && neighbor.walkable && this.canConnect(neighbor, node)) {
                    // AÃ±adir conexiÃ³n si no existe
                    const exists = neighbor.neighbors.some(n => n.node === node);
                    if (!exists) {
                        const distance = Math.hypot(nx - node.x, ny - node.y);
                        neighbor.addNeighbor(node, distance);
                    }
                }
            }
        }
    }

    /**
     * Encontrar nodo mÃ¡s cercano a una posiciÃ³n
     */
    findNearestNode(x, y, walkableOnly = true) {
        let nearest = null;
        let minDist = Infinity;

        const candidates = walkableOnly ? this.walkableNodes : this.nodes;

        for (const node of candidates) {
            const dist = Math.hypot(x - node.x, y - node.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = node;
            }
        }

        return nearest;
    }

    /**
     * A* Pathfinding - Encontrar ruta entre dos nodos
     */
    findPath(startNode, endNode) {
        if (!startNode || !endNode) return [];
        if (startNode === endNode) return [startNode];

        // Reset todos los nodos
        for (const node of this.walkableNodes) {
            node.reset();
        }

        const openSet = [startNode];
        const closedSet = new Set();

        startNode.g = 0;
        startNode.h = this.heuristic(startNode, endNode);
        startNode.f = startNode.h;

        while (openSet.length > 0) {
            // Encontrar nodo con menor f
            let current = openSet[0];
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // Si llegamos al objetivo, reconstruir path
            if (current === endNode) {
                return this.reconstructPath(endNode);
            }

            // Mover current de open a closed
            openSet.splice(currentIndex, 1);
            closedSet.add(current);

            // Explorar vecinos
            for (const neighborData of current.neighbors) {
                const neighbor = neighborData.node;

                if (closedSet.has(neighbor)) continue;

                const tentativeG = current.g + neighborData.distance;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }

                // Este path es el mejor hasta ahora
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }

        // No hay path
        return [];
    }

    heuristic(node1, node2) {
        // Distancia Euclidiana
        return Math.hypot(node1.x - node2.x, node1.y - node2.y);
    }

    reconstructPath(endNode) {
        const path = [];
        let current = endNode;

        while (current) {
            path.unshift(current);
            current = current.parent;
        }

        return path;
    }

    /**
     * Helpers de detecciÃ³n de superficie (copiados de MovementSystem)
     */
    isOnTrunk(x, y) {
        const trunkLeft = this.tree.x;
        const trunkRight = this.tree.x + this.tree.trunkWidth;
        const trunkTop = this.tree.y;
        const trunkBottom = this.tree.y + this.tree.trunkHeight;
        return x >= trunkLeft && x <= trunkRight && y >= trunkTop && y <= trunkBottom;
    }

    findBranchAt(x, y) {
        for (const branch of this.tree.branches) {
            if (this.isOnBranch(x, y, branch)) {
                return branch;
            }
        }
        return null;
    }

    isOnBranch(x, y, branch) {
        const endX = branch.startX + Math.cos(branch.angle) * branch.length;
        const endY = branch.startY + Math.sin(branch.angle) * branch.length;

        const dx = endX - branch.startX;
        const dy = endY - branch.startY;
        const length = Math.hypot(dx, dy);

        const t = Math.max(0, Math.min(1,
            ((x - branch.startX) * dx + (y - branch.startY) * dy) / (length * length)
        ));

        const closestX = branch.startX + t * dx;
        const closestY = branch.startY + t * dy;
        const distance = Math.hypot(x - closestX, y - closestY);

        return distance < branch.thickness / 2 + 5;
    }

    isInNest(x, y) {
        if (!this.nest) return false;

        // El nest es un cÃ­rculo centrado en el tronco
        const nestCenterX = this.nest.x;
        const nestCenterY = this.nest.y;
        const nestRadius = this.nest.size;

        const dist = Math.hypot(x - nestCenterX, y - nestCenterY);
        return dist <= nestRadius;
    }

    /**
     * VisualizaciÃ³n para debugging
     */
    draw(ctx, debug = false) {
        if (!debug) return;

        // Dibujar todos los nodos walkable
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        for (const node of this.walkableNodes) {
            ctx.fillRect(node.x - 2, node.y - 2, 4, 4);
        }

        // Dibujar conexiones
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 1;
        for (const node of this.walkableNodes) {
            for (const neighborData of node.neighbors) {
                const neighbor = neighborData.node;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(neighbor.x, neighbor.y);
                ctx.stroke();
            }
        }
    }

    /**
     * AÃ±adir sitio de construcciÃ³n temporal para WebOrder pending
     */
    addTemporaryConstructionSite(order) {
        if (!order.id) {
            order.id = "order_${Date.now()}_${Math.random()}";
        }

        const tempNodes = [];

        // Crear nodos temporales en nearPoint y farPoint
        for (const point of [order.startPoint, order.endPoint]) {
            const x = Math.round(point.x / this.nodeSpacing) * this.nodeSpacing;
            const y = Math.round(point.y / this.nodeSpacing) * this.nodeSpacing;

            let node = this.nodeGrid[`${x},${y}`];
            if (!node) {
                node = new NavNode(x, y);
                this.nodes.push(node);
                this.nodeGrid[`${x},${y}`] = node;
            }

            if (!node.walkable) {
                node.walkable = true;
                this.walkableNodes.push(node);
            }
            node.surface = 'construction';
            node.surfaceRef = order;
            tempNodes.push(node);
        }

        // Guardar referencia para limpieza posterior
        if (!this.constructionSites) {
            this.constructionSites = new Map();
        }
        this.constructionSites.set(order.id, tempNodes);

        // Conectar nodos temporales
        this.rebuildConnectionsForNodes(tempNodes);

        console.log(`Sitio de construcción temporal añadido para orden ${order.id}`);
    }

    /**
     * Remover sitio de construcciÃ³n temporal cuando web se completa
     */
    removeTemporaryConstructionSite(order) {
        if (!this.constructionSites || !order.id) return;

        const tempNodes = this.constructionSites.get(order.id);
        if (tempNodes) {
            for (const node of tempNodes) {
                if (node.surface === 'construction' && node.surfaceRef === order) {
                    const onOtherSurface = this.isOnTrunk(node.x, node.y) ||
                        this.findBranchAt(node.x, node.y) ||
                        (this.nest && this.isInNest(node.x, node.y));

                    if (!onOtherSurface) {
                        node.walkable = false;
                        const index = this.walkableNodes.indexOf(node);
                        if (index > -1) {
                            this.walkableNodes.splice(index, 1);
                        }
                    }

                    node.surface = null;
                    node.surfaceRef = null;
                    node.neighbors = [];
                }
            }

            this.constructionSites.delete(order.id);
            console.log(`Sitio de construcción temporal removido para orden ${order.id}`);
        }
    }
}



