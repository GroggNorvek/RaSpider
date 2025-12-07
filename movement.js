/**
 * Movement System - Sistema de navegación por árbol
 */

class MovementSystem {
    constructor(tree) {
        this.tree = tree;
        this.webManager = null; // Se establecerá después
        this.navMesh = null; // Se establecerá después
    }

    setWebManager(webManager) {
        this.webManager = webManager;
    }

    setNavMesh(navMesh) {
        this.navMesh = navMesh;
    }

    isOnTrunk(x, y) {
        const trunkLeft = this.tree.x;
        const trunkRight = this.tree.x + this.tree.trunkWidth;
        const trunkTop = this.tree.y;
        const trunkBottom = this.tree.y + this.tree.trunkHeight;

        return x >= trunkLeft && x <= trunkRight && y >= trunkTop && y <= trunkBottom;
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

        // Umbral ajustado: solo thickness/2 + margen pequeño (5px en lugar de 10)
        // Esto previene que ramas finas bloqueen el movimiento
        return distance < branch.thickness / 2 + 5;
    }

    findNearestBranch(x, y) {
        let nearestBranch = null;
        let minDistance = Infinity;

        this.tree.branches.forEach(branch => {
            if (this.isOnBranch(x, y, branch)) {
                const dx = x - branch.startX;
                const dy = y - branch.startY;
                const distance = Math.hypot(dx, dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBranch = branch;
                }
            }
        });

        return nearestBranch;
    }

    getSurfaceAt(x, y) {
        // Detectar TODAS las superficies disponibles (sin prioridad)
        const availableSurfaces = [];

        // Comprobar ramas
        const branch = this.findNearestBranch(x, y);
        if (branch) {
            availableSurfaces.push({ type: 'branch', branch: branch });
        }

        // Comprobar tronco
        if (this.isOnTrunk(x, y)) {
            availableSurfaces.push({ type: 'trunk' });
        }

        // Comprobar webs
        if (this.webManager) {
            const web = this.webManager.findWebAt(x, y);
            if (web) {
                availableSurfaces.push({ type: 'web', web: web });
            }
        }

        // Si no hay superficies, retornar none
        if (availableSurfaces.length === 0) {
            return { type: 'none' };
        }

        // Si solo hay una superficie, retornarla
        if (availableSurfaces.length === 1) {
            return availableSurfaces[0];
        }

        // Si hay múltiples superficies: elección procedural
        // Retornar la primera que NO sea web (permite salir de webs)
        for (const surface of availableSurfaces) {
            if (surface.type !== 'web') {
                return surface;
            }
        }

        // Si todas son webs, retornar la primera
        return availableSurfaces[0];
    }

    constrainToSurface(spider) {
        const surface = this.getSurfaceAt(spider.x, spider.y);

        if (surface.type === 'trunk') {
            const trunkLeft = this.tree.x + 20;
            const trunkRight = this.tree.x + this.tree.trunkWidth - 20;
            spider.x = Math.max(trunkLeft, Math.min(trunkRight, spider.x));
        } else if (surface.type === 'branch') {
            const branch = surface.branch;
            const endX = branch.startX + Math.cos(branch.angle) * branch.length;
            const endY = branch.startY + Math.sin(branch.angle) * branch.length;

            const dx = endX - branch.startX;
            const dy = endY - branch.startY;
            const length = Math.hypot(dx, dy);

            const t = Math.max(0, Math.min(1,
                ((spider.x - branch.startX) * dx + (spider.y - branch.startY) * dy) / (length * length)
            ));

            spider.x = branch.startX + t * dx;
            spider.y = branch.startY + t * dy;
        } else if (surface.type === 'web') {
            // Constrain a la web - proyectar sobre la línea
            const web = surface.web;
            const closest = web.getClosestPoint(spider.x, spider.y);
            spider.x = closest.x;
            spider.y = closest.y;
        }
    }
}

class SpiderController {
    constructor(spider, movementSystem) {
        this.spider = spider;
        this.movement = movementSystem;

        // Worker: 3x más rápido
        this.speed = 0.9;

        // Dirección 2D aleatoria
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        // NavMesh pathfinding
        this.currentPath = [];
        this.pathIndex = 0;
        this.targetNode = null;
        this.retargetTimer = 0;
        this.retargetInterval = 180; // Cambiar objetivo cada 3 segundos (60fps)

        // Pathfinding para construcción de webs
        this.constructionPath = null;
        this.constructionPathIndex = 0;
    }

    handleWebConstruction() {
        if (!this.spider.currentTask) return false;

        const task = this.spider.currentTask;

        // Si la tarea ya está completa, liberar la araña
        if (task.status === 'complete') {
            this.spider.currentTask = null;
            this.constructionPath = null;
            this.constructionPathIndex = 0;
            return false;
        }

        // Usar nearPoint y farPoint almacenados en la tarea (calculados al inicio)
        // Esto evita que se intercambien a mitad de camino causando bloqueo
        const nearPoint = task.nearPoint;
        const farPoint = task.farPoint;

        // Calcular punto de progreso en la web
        const progress = task.silkProgress / task.silkRequired;
        const dx = farPoint.x - nearPoint.x;
        const dy = farPoint.y - nearPoint.y;

        // Punto objetivo = donde debería estar Worker según progreso
        const targetX = nearPoint.x + dx * progress;
        const targetY = nearPoint.y + dy * progress;
        const dist = Math.hypot(this.spider.x - targetX, this.spider.y - targetY);

        // Si está lejos del punto de progreso, moverse hacia allí USANDO NAVMESH
        if (dist > 20) {
            // Si tenemos NavMesh, usar pathfinding; si no, movimiento directo como fallback
            if (this.movement.navMesh) {
                // Si no tenemos path o el objetivo cambió significativamente, recalcular
                if (!this.constructionPath || this.constructionPath.length === 0) {
                    const currentNode = this.movement.navMesh.findNearestNode(this.spider.x, this.spider.y);
                    const targetNode = this.movement.navMesh.findNearestNode(targetX, targetY);

                    if (currentNode && targetNode) {
                        this.constructionPath = this.movement.navMesh.findPath(currentNode, targetNode);
                        this.constructionPathIndex = 0;
                    }
                }

                // Seguir el path si existe
                if (this.constructionPath && this.constructionPath.length > 0 && this.constructionPathIndex < this.constructionPath.length) {
                    const pathTargetNode = this.constructionPath[this.constructionPathIndex];
                    const pathDx = pathTargetNode.x - this.spider.x;
                    const pathDy = pathTargetNode.y - this.spider.y;
                    const pathDist = Math.hypot(pathDx, pathDy);

                    // Si llegamos al nodo actual del path, avanzar al siguiente
                    if (pathDist < 5) {
                        this.constructionPathIndex++;
                    } else {
                        // Moverse hacia el nodo del path
                        this.angle = Math.atan2(pathDy, pathDx);
                        this.vx = Math.cos(this.angle) * this.speed;
                        this.vy = Math.sin(this.angle) * this.speed;

                        this.spider.x += this.vx;
                        this.spider.y += this.vy;
                        this.spider.velocity = this.vx;
                        this.spider.velocityY = this.vy;
                    }

                    return true; // Está trabajando en la tarea
                } else {
                    // No hay path válido - recalcular en siguiente frame
                    this.constructionPath = null;
                    return true;
                }
            } else {
                // Fallback: movimiento directo si no hay NavMesh
                const angleToTarget = Math.atan2(targetY - this.spider.y, targetX - this.spider.x);
                this.angle = angleToTarget;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                this.spider.x += this.vx;
                this.spider.y += this.vy;
                this.spider.velocity = this.vx;
                this.spider.velocityY = this.vy;

                return true;
            }
        }

        // Está en posición sobre la web, aportar silk
        if (this.spider.silk > 0) {
            const silkContribution = Math.min(0.5, this.spider.silk); // 0.5 silk por frame
            this.spider.silk -= silkContribution;

            const completed = task.addSilk(silkContribution);

            if (completed) {
                this.spider.currentTask = null;
                this.constructionPath = null;
                this.constructionPathIndex = 0;
                return false;
            }
        } else {
            // Silk = 0: marcar orden como pending para que otra Worker pueda continuar
            if (task.silkProgress < task.silkRequired) {
                task.status = 'pending';
                // Limpiar lista de Workers asignadas para permitir reasignación
                task.assignedSpiders = [];
            }
            this.spider.currentTask = null;
            this.constructionPath = null;
            this.constructionPathIndex = 0;
            return false;
        }

        return true; // Sigue trabajando
    }

    update() {
        // Prioridad: si tiene una tarea asignada, trabajar en ella
        if (this.handleWebConstruction()) {
            // NO constrain - handleWebConstruction ya maneja el movimiento
            return;
        }

        // NavMesh pathfinding si está disponible
        if (this.movement.navMesh) {
            this.updateWithNavMesh();
        } else {
            // Fallback: movimiento aleatorio antiguo
            this.updateLegacyMovement();
        }
    }

    updateWithNavMesh() {
        const navMesh = this.movement.navMesh;

        // Incrementar timer de retarget
        this.retargetTimer++;

        // Necesitamos un nuevo objetivo?
        if (!this.targetNode || this.currentPath.length === 0 || this.retargetTimer >= this.retargetInterval) {
            // Elegir un nodo aleatorio como objetivo
            const randomIndex = Math.floor(Math.random() * navMesh.walkableNodes.length);
            this.targetNode = navMesh.walkableNodes[randomIndex];

            // Encontrar nodo más cercano a posición actual
            const currentNode = navMesh.findNearestNode(this.spider.x, this.spider.y);

            if (currentNode && this.targetNode) {
                // Buscar path
                this.currentPath = navMesh.findPath(currentNode, this.targetNode);
                this.pathIndex = 0;
                this.retargetTimer = 0;
            }
        }

        // Seguir el path si existe
        if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
            const targetNode = this.currentPath[this.pathIndex];
            const dx = targetNode.x - this.spider.x;
            const dy = targetNode.y - this.spider.y;
            const dist = Math.hypot(dx, dy);

            // Si llegamos al nodo actual, avanzar al siguiente
            if (dist < 5) {
                this.pathIndex++;
                if (this.pathIndex >= this.currentPath.length) {
                    // Path completado, elegir nuevo objetivo pronto
                    this.retargetTimer = this.retargetInterval - 10;
                }
            } else {
                // Moverse hacia el nodo
                this.angle = Math.atan2(dy, dx);
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                this.spider.x += this.vx;
                this.spider.y += this.vy;
                this.spider.velocity = this.vx;
                this.spider.velocityY = this.vy;
            }
        } else {
            // No hay path, forzar retarget
            this.retargetTimer = this.retargetInterval;
        }
    }

    updateLegacyMovement() {
        // Movimiento normal si no hay tareas
        const surface = this.movement.getSurfaceAt(this.spider.x, this.spider.y);

        // Movimiento aleatorio en TODAS las superficies (tronco, rama, subrama, web)
        this.angle += (Math.random() - 0.5) * 0.2; // Cambios aleatorios continuos
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        this.spider.x += this.vx;
        this.spider.y += this.vy;
        this.spider.velocity = this.vx;
        this.spider.velocityY = this.vy;

        // LÍMITES DE PANTALLA - evitar que Worker salga del canvas
        const canvasWidth = 1200; // Del main.js
        const canvasHeight = 800;
        const margin = 10; // Pequeño margen

        this.spider.x = Math.max(margin, Math.min(this.spider.x, canvasWidth - margin));
        this.spider.y = Math.max(margin, Math.min(this.spider.y, canvasHeight - margin));

        // Salida especial solo para webs parciales por nearPoint
        if (surface.type === 'web') {
            const web = surface.web;

            if (this.movement.webManager) {
                for (const order of this.movement.webManager.orders) {
                    if (order.partialWeb === web && order.nearPoint) {
                        const distToNearPoint = Math.hypot(
                            this.spider.x - order.nearPoint.x,
                            this.spider.y - order.nearPoint.y
                        );
                        if (distToNearPoint < 20) {
                            return; // Permitir salida por nearPoint
                        }
                    }
                }
            }
        }

        this.movement.constrainToSurface(this.spider);
    }
}

// Controlador para Matriarch - Movimiento restringido al nido
class MatriarchController {
    constructor(spider, movementSystem, tree) {
        this.spider = spider;
        this.movement = movementSystem;
        this.tree = tree;

        this.speed = 0.5; // Velocidad original de Matriarch
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        // Movimiento aleatorio suave (LÓGICA ORIGINAL)
        this.angle += (Math.random() - 0.5) * 0.15;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.spider.x += vx;
        this.spider.y += vy;

        // Pasar velocidades a spider INMEDIATAMENTE (clave para evitar glitch)
        this.spider.velocity = vx;
        this.spider.velocityY = vy;

        // Constrain al tronco completo
        const trunkLeft = this.tree.x + 20;
        const trunkRight = this.tree.x + this.tree.trunkWidth - 20;
        const trunkTop = this.tree.y + 50;
        const trunkBottom = this.tree.y + this.tree.trunkHeight - 50;

        this.spider.x = Math.max(trunkLeft, Math.min(trunkRight, this.spider.x));
        this.spider.y = Math.max(trunkTop, Math.min(trunkBottom, this.spider.y));

        // Rebotar en bordes (simple, como original)
        if (this.spider.x <= trunkLeft + 10 || this.spider.x >= trunkRight - 10) {
            this.angle = Math.PI - this.angle;
        }
        if (this.spider.y <= trunkTop + 10 || this.spider.y >= trunkBottom - 10) {
            this.angle = -this.angle;
        }

        // Evitar zona de rama (simple rebote)
        const branchY = this.tree.branchY;
        if (Math.abs(this.spider.y - branchY) < 60 && this.spider.x > trunkLeft + 100) {
            this.angle = -this.angle;
        }
    }
}
