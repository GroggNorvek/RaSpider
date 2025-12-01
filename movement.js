/**
 * Movement System - Sistema de navegación por árbol
 */

class MovementSystem {
    constructor(tree) {
        this.tree = tree;
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

        return distance < branch.thickness / 2 + 10;
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
        const branch = this.findNearestBranch(x, y);
        if (branch) {
            return { type: 'branch', branch: branch };
        }

        if (this.isOnTrunk(x, y)) {
            return { type: 'trunk' };
        }

        return { type: 'none' };
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
    }

    handleWebConstruction() {
        if (!this.spider.currentTask) return false;

        const task = this.spider.currentTask;

        // Si la tarea ya está completa, liberar la araña
        if (task.status === 'complete') {
            this.spider.currentTask = null;
            return false;
        }

        // Moverse hacia el punto inicial de la web
        const targetX = task.startPoint.x;
        const targetY = task.startPoint.y;
        const dist = Math.hypot(this.spider.x - targetX, this.spider.y - targetY);

        // Si está lejos, moverse hacia allí
        if (dist > 15) {
            const angleToTarget = Math.atan2(targetY - this.spider.y, targetX - this.spider.x);
            this.angle = angleToTarget;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;

            this.spider.x += this.vx;
            this.spider.y += this.vy;
            this.spider.velocity = this.vx;
            this.spider.velocityY = this.vy;

            return true; // Está trabajando en la tarea
        }

        // Está en posición, aportar silk
        if (this.spider.silk > 0) {
            const silkContribution = Math.min(0.5, this.spider.silk); // 0.5 silk por frame
            this.spider.silk -= silkContribution;

            const completed = task.addSilk(silkContribution);

            if (completed) {
                this.spider.currentTask = null;
                return false;
            }
        } else {
            // Sin silk, abandonar tarea
            this.spider.currentTask = null;
            return false;
        }

        return true; // Sigue trabajando
    }

    update() {
        // Prioridad: si tiene una tarea asignada, trabajar en ella
        if (this.handleWebConstruction()) {
            // Constrain to surface mientras construye
            this.movement.constrainToSurface(this.spider);
            return;
        }

        // Movimiento normal si no hay tareas
        const surface = this.movement.getSurfaceAt(this.spider.x, this.spider.y);

        if (surface.type === 'trunk') {
            const trunkLeft = this.movement.tree.x + 30;
            const trunkRight = this.movement.tree.x + this.movement.tree.trunkWidth - 30;
            const trunkTop = this.movement.tree.y + 50;
            const trunkBottom = this.movement.tree.y + this.movement.tree.trunkHeight - 50;

            // DETECCIÓN ANTICIPADA: calcular distancias a los bordes
            const distToLeft = this.spider.x - trunkLeft;
            const distToRight = trunkRight - this.spider.x;
            const distToTop = this.spider.y - trunkTop;
            const distToBottom = trunkBottom - this.spider.y;

            // Zona de anticipación: 60 píxeles antes del borde
            const anticipationZone = 60;

            // Calcular fuerza de giro basada en proximidad al borde
            let turnForce = 0;
            let targetAngle = this.angle;

            // Detectar proximidad a CUALQUIER borde
            if (distToLeft < anticipationZone || distToRight < anticipationZone ||
                distToTop < anticipationZone || distToBottom < anticipationZone) {

                // Calcular ángulo hacia el centro
                const centerX = this.movement.tree.x + this.movement.tree.trunkWidth / 2;
                const centerY = this.movement.tree.y + this.movement.tree.trunkHeight / 2;
                const angleToCenter = Math.atan2(centerY - this.spider.y, centerX - this.spider.x);

                // Calcular qué tan cerca está del borde (0 = lejos, 1 = muy cerca)
                const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
                const proximity = 1 - (minDist / anticipationZone);

                // Interpolar gradualmente hacia el centro
                // Cuanto más cerca del borde, más fuerte el giro
                targetAngle = angleToCenter;
                turnForce = proximity * 0.08; // Giro muy gradual
            }

            // Aplicar giro gradual (no instantáneo)
            if (turnForce > 0) {
                // Interpolar ángulo suavemente
                let angleDiff = targetAngle - this.angle;

                // Normalizar diferencia de ángulo
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                // Girar gradualmente
                this.angle += angleDiff * turnForce;

                // Actualizar velocidades
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
            }

            // Aplicar movimiento
            this.spider.x += this.vx;
            this.spider.y += this.vy;

            // Pasar velocidad a spider para detección 2D de patas
            this.spider.velocity = this.vx;
            this.spider.velocityY = this.vy;

            // Límites estrictos (por si acaso)
            this.spider.x = Math.max(trunkLeft, Math.min(trunkRight, this.spider.x));
            this.spider.y = Math.max(trunkTop, Math.min(trunkBottom, this.spider.y));

        } else if (surface.type === 'branch') {
            const branch = surface.branch;
            const angle = branch.angle;

            // Calcular posiciones de extremos
            const branchEndX = branch.startX + Math.cos(angle) * branch.length;
            const branchEndY = branch.startY + Math.sin(angle) * branch.length;

            const distToEnd = Math.hypot(this.spider.x - branchEndX, this.spider.y - branchEndY);
            const distToStart = Math.hypot(this.spider.x - branch.startX, this.spider.y - branch.startY);

            // Si está muy cerca del inicio, redirigir hacia el centro del tronco para salir de la rama
            if (distToStart < 30) {
                // Calcular centro del tronco
                const trunkCenterX = this.movement.tree.x + this.movement.tree.trunkWidth / 2;
                const trunkCenterY = this.movement.tree.y + this.movement.tree.trunkHeight / 2;

                // Dirigirse hacia el centro del tronco
                const angleToCenter = Math.atan2(trunkCenterY - this.spider.y, trunkCenterX - this.spider.x);
                this.angle = angleToCenter;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;

                // Movimiento hacia el tronco
                this.spider.x += this.vx;
                this.spider.y += this.vy;

                // NO constrain - dejar que salga de la rama
                return;
            } else if (distToEnd < 20) {
                // Llegó al final - invertir dirección completamente
                this.angle = angle + Math.PI; // 180 grados
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
            }

            // Movimiento normal
            this.spider.x += this.vx;
            this.spider.y += this.vy;
        }

        this.movement.constrainToSurface(this.spider);
    }
}

// Controlador para Matriarch - Movimiento restringido al nido
class MatriarchController {
    constructor(spider, movementSystem, tree) {
        this.spider = spider;
        this.movement = movementSystem;
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
