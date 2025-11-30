/**
 * Movement System - Sistema de navegación por árbol
 * Permite a la araña moverse por tronco y ramas
 */

class MovementSystem {
    constructor(tree) {
        this.tree = tree;
    }

    /**
     * Verifica si un punto está sobre el tronco
     */
    isOnTrunk(x, y) {
        const trunkLeft = this.tree.x - this.tree.trunkWidth / 2;
        const trunkRight = this.tree.x + this.tree.trunkWidth / 2;
        const trunkTop = this.tree.y;
        const trunkBottom = this.tree.y + this.tree.trunkHeight;

        return x >= trunkLeft && x <= trunkRight && y >= trunkTop && y <= trunkBottom;
    }

    /**
     * Verifica si un punto está sobre una rama
     */
    isOnBranch(x, y, branch) {
        // Distancia del punto a la línea de la rama
        const endX = branch.startX + Math.cos(branch.angle) * branch.length;
        const endY = branch.startY + Math.sin(branch.angle) * branch.length;

        // Vectores
        const dx = endX - branch.startX;
        const dy = endY - branch.startY;
        const length = Math.hypot(dx, dy);

        // Proyección del punto sobre la rama
        const t = Math.max(0, Math.min(1,
            ((x - branch.startX) * dx + (y - branch.startY) * dy) / (length * length)
        ));

        const closestX = branch.startX + t * dx;
        const closestY = branch.startY + t * dy;

        const distance = Math.hypot(x - closestX, y - closestY);

        return distance < branch.thickness / 2 + 10; // 10px de tolerancia
    }

    /**
     * Encuentra la rama más cercana a un punto
     */
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

    /**
     * Obtiene la superficie en un punto
     */
    getSurfaceAt(x, y) {
        // Primero verificar ramas (tienen prioridad)
        const branch = this.findNearestBranch(x, y);
        if (branch) {
            return { type: 'branch', branch: branch };
        }

        // Luego verificar tronco
        if (this.isOnTrunk(x, y)) {
            return { type: 'trunk' };
        }

        return { type: 'none' };
    }

    /**
     * Mueve la araña manteniéndola en la superficie
     */
    constrainToSurface(spider) {
        const surface = this.getSurfaceAt(spider.x, spider.y);

        if (surface.type === 'trunk') {
            // Mantener dentro del tronco
            const trunkLeft = this.tree.x - this.tree.trunkWidth / 2 + 20;
            const trunkRight = this.tree.x + this.tree.trunkWidth / 2 - 20;

            spider.x = Math.max(trunkLeft, Math.min(trunkRight, spider.x));

        } else if (surface.type === 'branch') {
            // Mantener sobre la rama
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

/**
 * Spider Controller - Control de movimiento de la araña
 */
class SpiderController {
    constructor(spider, movementSystem) {
        this.spider = spider;
        this.movement = movementSystem;

        this.direction = 1; // 1 = abajo, -1 = arriba
        this.speed = 0.5;
        this.walkTimer = 0;
        this.walkDuration = 200;
    }

    update() {
        this.walkTimer++;

        // Cambiar dirección periódicamente
        if (this.walkTimer >= this.walkDuration) {
            this.direction *= -1;
            this.walkTimer = 0;
            this.walkDuration = Math.random() * 150 + 100;
        }

        // Mover araña
        const surface = this.movement.getSurfaceAt(this.spider.x, this.spider.y);

        if (surface.type === 'trunk') {
            // Moverse verticalmente en el tronco
            this.spider.y += this.speed * this.direction;

            // Limitar al tronco
            const trunkTop = this.movement.tree.y + 50;
            const trunkBottom = this.movement.tree.y + this.movement.tree.trunkHeight - 50;

            if (this.spider.y < trunkTop) {
                this.spider.y = trunkTop;
                this.direction = 1;
            }
            if (this.spider.y > trunkBottom) {
                this.spider.y = trunkBottom;
                this.direction = -1;
            }

        } else if (surface.type === 'branch') {
            // Moverse a lo largo de la rama
            const branch = surface.branch;
            const angle = branch.angle;

            this.spider.x += Math.cos(angle) * this.speed * this.direction;
            this.spider.y += Math.sin(angle) * this.speed * this.direction;

            // Verificar si llegó al final de la rama
            const distToEnd = Math.hypot(
                this.spider.x - (branch.startX + Math.cos(angle) * branch.length),
                this.spider.y - (branch.startY + Math.sin(angle) * branch.length)
            );

            if (distToEnd < 20 || Math.hypot(this.spider.x - branch.startX, this.spider.y - branch.startY) < 20) {
                this.direction *= -1;
            }
        }

        // Asegurar que está en superficie
        this.movement.constrainToSurface(this.spider);
    }
}
