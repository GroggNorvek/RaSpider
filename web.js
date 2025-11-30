/**
 * Web - Sistema de telas de araña
 * Gestiona órdenes de construcción, webs construidas e input del jugador
 */

// Clase para representar una orden de construcción de tela de araña
class WebOrder {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint; // {x, y, surface}
        this.endPoint = endPoint;     // {x, y, surface}

        // Calcular longitud y silk requerida
        this.length = Math.hypot(
            endPoint.x - startPoint.x,
            endPoint.y - startPoint.y
        );
        this.silkRequired = Math.ceil(this.length / 10); // 1 silk por cada 10px
        this.silkProgress = 0;

        this.status = 'pending'; // 'pending', 'in_progress', 'complete'
        this.assignedSpiders = [];
    }

    addSilk(amount) {
        this.silkProgress += amount;
        if (this.silkProgress >= this.silkRequired) {
            this.status = 'complete';
            return true; // Orden completada
        }
        return false;
    }

    draw(ctx) {
        // Dibujar orden como línea discontinua
        ctx.save();
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.5)'; // Gris plata
        ctx.setLineDash([10, 5]);
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
        ctx.stroke();

        // Mostrar progreso
        if (this.silkProgress > 0) {
            const progress = this.silkProgress / this.silkRequired;
            ctx.strokeStyle = 'rgba(192, 192, 192, 0.8)'; // Gris plata
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(this.startPoint.x, this.startPoint.y);
            ctx.lineTo(
                this.startPoint.x + (this.endPoint.x - this.startPoint.x) * progress,
                this.startPoint.y + (this.endPoint.y - this.startPoint.y) * progress
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Clase para representar una tela de araña construida
class Web {
    constructor(startPoint, endPoint) {
        this.startPoint = { x: startPoint.x, y: startPoint.y };
        this.endPoint = { x: endPoint.x, y: endPoint.y };
        this.thickness = 2;
        this.strength = 100;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.8)'; // Gris plata
        ctx.setLineDash([]);
        ctx.lineWidth = this.thickness;

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
        ctx.stroke();

        ctx.restore();
    }

    // Comprobar si un punto está cerca de esta web
    isNear(x, y, threshold = 10) {
        const dist = this.distanceToPoint(x, y);
        return dist < threshold;
    }

    // Calcular distancia de un punto a esta línea
    distanceToPoint(x, y) {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.hypot(dx, dy);

        if (length === 0) return Math.hypot(x - this.startPoint.x, y - this.startPoint.y);

        const t = Math.max(0, Math.min(1,
            ((x - this.startPoint.x) * dx + (y - this.startPoint.y) * dy) / (length * length)
        ));

        const projX = this.startPoint.x + t * dx;
        const projY = this.startPoint.y + t * dy;

        return Math.hypot(x - projX, y - projY);
    }

    // Obtener punto más cercano en esta web
    getClosestPoint(x, y) {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.hypot(dx, dy);

        if (length === 0) return { x: this.startPoint.x, y: this.startPoint.y };

        const t = Math.max(0, Math.min(1,
            ((x - this.startPoint.x) * dx + (y - this.startPoint.y) * dy) / (length * length)
        ));

        return {
            x: this.startPoint.x + t * dx,
            y: this.startPoint.y + t * dy
        };
    }
}

// Clase para gestionar todas las órdenes y webs
class WebManager {
    constructor(tree, spiders = []) {
        this.tree = tree;
        this.spiders = spiders; // Array de arañas disponibles
        this.orders = [];
        this.webs = [];
    }

    createOrder(startPoint, endPoint) {
        const order = new WebOrder(startPoint, endPoint);
        this.orders.push(order);

        // Intentar asignar araña inmediatamente
        this.assignSpiderToOrder(order);

        return order;
    }

    assignSpiderToOrder(order) {
        // Buscar araña disponible (sin currentTask)
        let nearestSpider = null;
        let minDist = Infinity;

        for (const spider of this.spiders) {
            if (!spider.currentTask && spider.silk > 0) {
                const dist = Math.hypot(
                    spider.x - order.startPoint.x,
                    spider.y - order.startPoint.y
                );

                if (dist < minDist) {
                    minDist = dist;
                    nearestSpider = spider;
                }
            }
        }

        // Asignar la araña más cercana
        if (nearestSpider) {
            nearestSpider.currentTask = order;
            order.assignedSpiders.push(nearestSpider);
            order.status = 'in_progress';
        }
    }

    completeOrder(order) {
        const web = new Web(order.startPoint, order.endPoint);
        this.webs.push(web);

        // Eliminar orden de la lista
        const index = this.orders.indexOf(order);
        if (index > -1) {
            this.orders.splice(index, 1);
        }

        return web;
    }

    findSurfaceAt(x, y) {
        const threshold = 15; // Radio de detección

        // 1. Comprobar ÓRDENES PENDIENTES (WebOrder)
        for (const order of this.orders) {
            // Verificar si el click está cerca de la línea de la orden
            const dist = this.distanceToLine(x, y, order.startPoint, order.endPoint);
            if (dist < threshold) {
                return { type: 'order', order, point: { x, y } }; // Punto exacto
            }
        }

        // 2. Comprobar WEBS CONSTRUIDAS
        for (const web of this.webs) {
            if (web.isNear(x, y, threshold)) {
                return { type: 'web', web, point: { x, y } }; // Punto exacto
            }
        }

        // 3. Comprobar TODAS LAS RAMAS Y SUB-RAMAS
        for (const branch of this.tree.branches) {
            if (this.isOnBranch(x, y, branch, threshold)) {
                return { type: 'branch', branch, point: { x, y } }; // Punto exacto
            }
        }

        // 4. Comprobar TRONCO (incluyendo extremo izquierdo)
        const trunkLeft = this.tree.x;
        const trunkRight = this.tree.x + this.tree.trunkWidth;
        if (x >= trunkLeft && x <= trunkRight && y >= 0 && y <= this.tree.trunkHeight) {
            return { type: 'trunk', point: { x, y } }; // Punto exacto
        }

        return null; // No hay superficie válida
    }

    // Nueva función helper para calcular distancia a una línea
    distanceToLine(x, y, start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.hypot(dx, dy);

        if (length === 0) return Math.hypot(x - start.x, y - start.y);

        const t = Math.max(0, Math.min(1,
            ((x - start.x) * dx + (y - start.y) * dy) / (length * length)
        ));

        const projX = start.x + t * dx;
        const projY = start.y + t * dy;

        return Math.hypot(x - projX, y - projY);
    }

    isOnBranch(x, y, branch, threshold = 15) {
        const dist = this.distanceToLine(x, y,
            { x: branch.startX, y: branch.startY },
            { x: branch.endX, y: branch.endY }
        );
        return dist < threshold;
    }


    update() {
        // Intentar asignar arañas a órdenes pendientes sin asignar
        for (const order of this.orders) {
            if (order.status === 'pending' && order.assignedSpiders.length === 0) {
                this.assignSpiderToOrder(order);
            }
        }

        // Comprobar órdenes completadas
        for (let i = this.orders.length - 1; i >= 0; i--) {
            const order = this.orders[i];
            if (order.status === 'complete') {
                this.completeOrder(order);
            }
        }
    }

    draw(ctx) {
        // Dibujar webs construidas
        for (const web of this.webs) {
            web.draw(ctx);
        }

        // Dibujar órdenes pendientes
        for (const order of this.orders) {
            order.draw(ctx);
        }
    }
}

// Clase para manejar el input del jugador
class InputHandler {
    constructor(canvas, webManager) {
        this.canvas = canvas;
        this.webManager = webManager;

        this.isDragging = false;
        this.dragStart = null;
        this.dragCurrent = null;
        this.startSurface = null;

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const surface = this.webManager.findSurfaceAt(pos.x, pos.y);

        if (surface) {
            this.isDragging = true;
            this.dragStart = surface.point;
            this.startSurface = surface;
        }
    }

    onMouseMove(e) {
        if (this.isDragging) {
            const pos = this.getMousePos(e);
            this.dragCurrent = pos;
        }
    }

    onMouseUp(e) {
        if (this.isDragging) {
            const pos = this.getMousePos(e);
            const endSurface = this.webManager.findSurfaceAt(pos.x, pos.y);

            if (endSurface && this.dragStart) {
                // Crear orden de construcción
                this.webManager.createOrder(this.dragStart, endSurface.point);
            }

            this.isDragging = false;
            this.dragStart = null;
            this.dragCurrent = null;
            this.startSurface = null;
        }
    }

    draw(ctx) {
        // Dibujar preview durante el drag
        if (this.isDragging && this.dragStart && this.dragCurrent) {
            ctx.save();
            ctx.strokeStyle = 'rgba(192, 192, 192, 0.3)'; // Gris plata
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(this.dragStart.x, this.dragStart.y);
            ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
            ctx.stroke();

            ctx.restore();
        }
    }
}
