/**
 * Web - Sistema de telas de araña
 * Gestiona órdenes de construcción, webs construidas e input del jugador
 */

// Clase para representar una orden de construcción de tela de araña
class WebOrder {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint; // {x, y, surface}
        this.endPoint = endPoint;     // {x, y, surface}
        this.webType = 'REGULAR';     // 'REGULAR' or 'NEST'

        // Calcular longitud y silk requerida
        this.length = Math.hypot(
            endPoint.x - startPoint.x,
            endPoint.y - startPoint.y
        );
        this.silkRequired = Math.ceil(this.length / 10); // 1 silk por cada 10px
        this.silkProgress = 0;

        this.status = 'pending'; // 'pending', 'in_progress', 'complete'
        this.assignedSpiders = [];
        this.buildReversed = false; // true si se construye desde endPoint hacia startPoint

        // Web física parcial que se construye progresivamente
        this.partialWeb = null;
    }

    // Establecer dirección de construcción según posición de Worker
    setBuildDirection(spiderX, spiderY) {
        const distToStart = Math.hypot(spiderX - this.startPoint.x, spiderY - this.startPoint.y);
        const distToEnd = Math.hypot(spiderX - this.endPoint.x, spiderY - this.endPoint.y);
        this.buildReversed = distToEnd < distToStart;
    }

    addSilk(amount) {
        this.silkProgress += amount;

        // Actualizar web física parcial basada en progreso
        if (this.nearPoint && this.farPoint) {
            const progress = Math.min(1, this.silkProgress / this.silkRequired);
            const dx = this.farPoint.x - this.nearPoint.x;
            const dy = this.farPoint.y - this.nearPoint.y;

            const currentEndPoint = {
                x: this.nearPoint.x + dx * progress,
                y: this.nearPoint.y + dy * progress
            };

            // Crear o actualizar web parcial
            this.partialWeb = new Web(this.nearPoint, currentEndPoint);
        }

        if (this.silkProgress >= this.silkRequired) {
            this.status = 'complete';
            return true; // Orden completada
        }
        return false;
    }

    draw(ctx) {
        // Dibujar orden como línea discontinua orgánica
        ctx.save();
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.5)';
        ctx.setLineDash([10, 5]);
        ctx.lineWidth = 0.7; // 1/3 del grosor original

        // Curva orgánica con ligera caída
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.hypot(dx, dy);
        const sag = length * 0.08; // 8% de caída

        const midX = (this.startPoint.x + this.endPoint.x) / 2;
        const midY = (this.startPoint.y + this.endPoint.y) / 2 + sag;

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.quadraticCurveTo(midX, midY, this.endPoint.x, this.endPoint.y);
        ctx.stroke();

        // Mostrar progreso con curva
        if (this.silkProgress > 0) {
            const progress = this.silkProgress / this.silkRequired;
            ctx.strokeStyle = 'rgba(192, 192, 192, 0.8)';
            ctx.setLineDash([]);

            // Determinar puntos según dirección de construcción
            const buildStart = this.buildReversed ? this.endPoint : this.startPoint;
            const buildEnd = this.buildReversed ? this.startPoint : this.endPoint;
            const buildDx = buildEnd.x - buildStart.x;
            const buildDy = buildEnd.y - buildStart.y;

            const progressX = buildStart.x + buildDx * progress;
            const progressY = buildStart.y + buildDy * progress;

            ctx.beginPath();
            ctx.moveTo(buildStart.x, buildStart.y);
            ctx.quadraticCurveTo(
                buildStart.x + (midX - buildStart.x) * progress,
                buildStart.y + (midY - buildStart.y) * progress,
                progressX,
                progressY
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
        this.thickness = 0.7; // 1/3 del grosor original (era 2)
        this.strength = 100;
        this.vibration = 0; // Vibración causada por presas atrapadas
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.8)';
        ctx.setLineDash([]);
        ctx.lineWidth = this.thickness;

        // Curva orgánica con ligera caída por gravedad
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.hypot(dx, dy);
        const sag = length * 0.08; // 8% de caída

        const midX = (this.startPoint.x + this.endPoint.x) / 2;
        const midY = (this.startPoint.y + this.endPoint.y) / 2 + sag;

        // Aplicar vibración si existe
        const vibrationOffset = this.vibration;

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.quadraticCurveTo(midX + vibrationOffset, midY + vibrationOffset, this.endPoint.x, this.endPoint.y);
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

// Clase para WebNido - almacenamiento de mosquitos en el nido
class WebNido extends Web {
    constructor(startPoint, endPoint) {
        super(startPoint, endPoint);
        this.type = 'NEST_WEB';
        this.storedMosquitos = [];
        this.capacity = 5;
        this.thickness = 1.5; // Más gruesa que web normal
    }

    addMosquito(mosquito) {
        if (!this.isFull()) {
            this.storedMosquitos.push(mosquito);
            mosquito.state = 'STORED';
            mosquito.storageWeb = this;
            return true;
        }
        return false;
    }

    isFull() {
        return this.storedMosquitos.length >= this.capacity;
    }

    draw(ctx) {
        ctx.save();
        // Color blanco/marfil para WebNido
        ctx.strokeStyle = 'rgba(255, 248, 220, 0.9)';
        ctx.setLineDash([]);
        ctx.lineWidth = this.thickness;

        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const length = Math.hypot(dx, dy);
        const sag = length * 0.08;

        const midX = (this.startPoint.x + this.endPoint.x) / 2;
        const midY = (this.startPoint.y + this.endPoint.y) / 2 + sag;

        const vibrationOffset = this.vibration;

        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.quadraticCurveTo(midX + vibrationOffset, midY + vibrationOffset, this.endPoint.x, this.endPoint.y);
        ctx.stroke();

        // Mostrar contador de mosquitos almacenados
        if (this.storedMosquitos.length > 0) {
            ctx.fillStyle = this.isFull() ? '#FFD700' : '#FFF';
            ctx.font = '10px Arial';
            ctx.fillText(`${this.storedMosquitos.length}/${this.capacity}`, midX + 5, midY - 5);
        }

        ctx.restore();
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

    createOrder(startPoint, endPoint, webType = 'REGULAR') {
        const order = new WebOrder(startPoint, endPoint);
        order.webType = webType;
        this.orders.push(order);

        // Intentar asignar araña inmediatamente
        this.assignSpiderToOrder(order);

        return order;
    }

    assignSpiderToOrder(order) {
        // Buscar araña disponible (solo Workers pueden construir)
        let nearestSpider = null;
        let minDist = Infinity;

        for (const spider of this.spiders) {
            // Solo Workers pueden construir telas
            if (spider.type === 'Worker' && !spider.currentTask && spider.silk > 0) {
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
            // Establecer dirección de construcción según posición de Worker
            order.setBuildDirection(nearestSpider.x, nearestSpider.y);

            nearestSpider.currentTask = order;

            // Calcular y almacenar nearPoint/farPoint FIJOS - evita flip a mitad de camino
            const distToStart = Math.hypot(nearestSpider.x - order.startPoint.x, nearestSpider.y - order.startPoint.y);
            const distToEnd = Math.hypot(nearestSpider.x - order.endPoint.x, nearestSpider.y - order.endPoint.y);
            order.nearPoint = distToStart < distToEnd ? order.startPoint : order.endPoint;
            order.farPoint = distToStart < distToEnd ? order.endPoint : order.startPoint;

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

    // Encontrar web en un punto dado (para detección de superficie transitable)
    findWebAt(x, y) {
        // 1. Comprobar webs parciales de órdenes en progreso
        for (const order of this.orders) {
            if (order.partialWeb && order.partialWeb.isNear(x, y, 10)) {
                return order.partialWeb;
            }
        }

        // 2. Comprobar webs completas
        for (const web of this.webs) {
            if (web.isNear(x, y, 10)) {
                return web;
            }
        }
        return null;
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
            if (this.isOnBranch(x, y, branch)) {
                return { type: 'branch', branch, point: { x, y } }; // Punto exacto
            }
        }

        // 4. Comprobar EXTREMO IZQUIERDO DEL TRONCO (solo un margen de 30px)
        const trunkLeft = this.tree.x;
        const trunkEdgeMargin = 30; // Solo 30px desde el borde izquierdo
        if (x >= trunkLeft && x <= (trunkLeft + trunkEdgeMargin) && y >= 0 && y <= this.tree.trunkHeight) {
            return { type: 'trunk', point: { x, y } }; // Punto exacto en el borde
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

    isOnBranch(x, y, branch) {
        const dist = this.distanceToLine(x, y,
            { x: branch.startX, y: branch.startY },
            { x: branch.endX, y: branch.endY }
        );
        // Usar el grosor real de la rama (thickness / 2 como radio)
        return dist < (branch.thickness / 2);
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
        // Dibujar preview durante el drag con estética orgánica
        if (this.isDragging && this.dragStart && this.dragCurrent) {
            ctx.save();
            ctx.strokeStyle = 'rgba(192, 192, 192, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 0.7; // Mismo grosor que las webs

            // Curva orgánica para preview
            const dx = this.dragCurrent.x - this.dragStart.x;
            const dy = this.dragCurrent.y - this.dragStart.y;
            const length = Math.hypot(dx, dy);
            const sag = length * 0.08;

            const midX = (this.dragStart.x + this.dragCurrent.x) / 2;
            const midY = (this.dragStart.y + this.dragCurrent.y) / 2 + sag;

            ctx.beginPath();
            ctx.moveTo(this.dragStart.x, this.dragStart.y);
            ctx.quadraticCurveTo(midX, midY, this.dragCurrent.x, this.dragCurrent.y);
            ctx.stroke();

            ctx.restore();
        }
    }
}
