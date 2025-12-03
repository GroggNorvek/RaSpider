/**
 * Nest - Nido de arañas dentro del tronco
 * Módulo independiente para gestionar el nido
 */

class Nest {
    constructor(tree) {
        // Calcular posición centrada en el tronco
        const trunkCenterX = tree.x + tree.trunkWidth / 2;
        const trunkCenterY = tree.trunkHeight / 2;

        // Centro del nido
        this.x = trunkCenterX;
        this.y = trunkCenterY;

        // Tamaño del nido
        this.width = tree.trunkWidth * 0.4;  // 40% del ancho del tronco
        this.height = tree.trunkHeight * 0.3; // 30% de la altura del tronco
    }

    draw(ctx) {
        // Dibujar cavidad orgánica oscura
        ctx.fillStyle = '#B8B8B8'; // Más oscuro que el tronco
        ctx.beginPath();

        // Crear forma orgánica usando curvas Bézier
        const centerX = this.x;
        const centerY = this.y;
        const w = this.width;
        const h = this.height;

        // Puntos de control para forma irregular (óvalo acentuado arriba/abajo)
        const points = [
            { x: centerX - w * 0.4, y: centerY - h * 0.3 },
            { x: centerX + w * 0.2, y: centerY - h * 0.4 },
            { x: centerX + w * 0.5, y: centerY - h * 0.1 },
            { x: centerX + w * 0.4, y: centerY + h * 0.3 },
            { x: centerX + w * 0.1, y: centerY + h * 0.5 },
            { x: centerX - w * 0.3, y: centerY + h * 0.4 },
            { x: centerX - w * 0.5, y: centerY + h * 0.1 },
            { x: centerX - w * 0.4, y: centerY - h * 0.2 }
        ];

        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];

            const cp1x = p1.x + (p2.x - p1.x) * 0.5;
            const cp1y = p1.y + (p2.y - p1.y) * 0.5;
            const cp2x = p2.x - (p3.x - p2.x) * 0.3;
            const cp2y = p2.y - (p3.y - p2.y) * 0.3;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        ctx.closePath();
        ctx.fill();
    }

    // Verificar si un punto está dentro del nido (elipse)
    isPointInside(x, y, margin = 1.0) {
        const dx = (x - this.x) / ((this.width / 2) * margin);
        const dy = (y - this.y) / ((this.height / 2) * margin);
        return (dx * dx + dy * dy) <= 1;
    }
}
