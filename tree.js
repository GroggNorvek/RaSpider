/**
 * Tree - Árbol procedural con ramas
 */

class Tree {
    constructor(x, y) {
        this.x = x; // Posición base del tronco
        this.y = y;

        // Dimensiones del tronco
        this.trunkWidth = 80;
        this.trunkHeight = 500;

        // Ramas
        this.branches = [];
        this.generateBranches();
    }

    /**
     * Genera entre 3 y 7 ramas proceduralmente
     */
    generateBranches() {
        const branchCount = Math.floor(Math.random() * 5) + 3; // 3-7 ramas

        for (let i = 0; i < branchCount; i++) {
            // Distribuir ramas a lo largo del tronco
            const yPos = this.y + 100 + (this.trunkHeight - 200) * (i / (branchCount - 1));

            // Alternar lados (izquierda/derecha)
            const side = i % 2 === 0 ? -1 : 1;

            // Longitud aleatoria de la rama
            const length = 80 + Math.random() * 60; // 80-140 px

            // Ángulo de la rama (-45 a -20 grados hacia arriba)
            const angle = -Math.PI / 4 + Math.random() * Math.PI / 8;

            this.branches.push({
                startX: this.x + (this.trunkWidth / 2) * side,
                startY: yPos,
                length: length,
                angle: angle * side,
                thickness: 15 + Math.random() * 10,
                side: side
            });
        }
    }

    /**
     * Dibuja el tronco del árbol
     */
    drawTrunk(ctx) {
        // Gradiente para el tronco
        const gradient = ctx.createLinearGradient(
            this.x - this.trunkWidth / 2, 0,
            this.x + this.trunkWidth / 2, 0
        );
        gradient.addColorStop(0, '#3d2817');
        gradient.addColorStop(0.5, '#5a3d2b');
        gradient.addColorStop(1, '#3d2817');

        ctx.fillStyle = gradient;

        // Tronco principal
        ctx.beginPath();
        ctx.rect(
            this.x - this.trunkWidth / 2,
            this.y,
            this.trunkWidth,
            this.trunkHeight
        );
        ctx.fill();

        // Bordes del tronco
        ctx.strokeStyle = '#2a1810';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Textura de corteza (líneas verticales)
        ctx.strokeStyle = '#2a1810';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const xOffset = -this.trunkWidth / 2 + (this.trunkWidth / 5) * i;
            ctx.beginPath();
            ctx.moveTo(this.x + xOffset, this.y);
            ctx.lineTo(this.x + xOffset, this.y + this.trunkHeight);
            ctx.stroke();
        }
    }

    /**
     * Dibuja una rama individual
     */
    drawBranch(ctx, branch) {
        const endX = branch.startX + Math.cos(branch.angle) * branch.length;
        const endY = branch.startY + Math.sin(branch.angle) * branch.length;

        // Gradiente de la rama
        const gradient = ctx.createLinearGradient(
            branch.startX, branch.startY,
            endX, endY
        );
        gradient.addColorStop(0, '#5a3d2b');
        gradient.addColorStop(1, '#3d2817');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = branch.thickness;
        ctx.lineCap = 'round';

        // Rama principal
        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Pequeñas ramitas al final
        const twigLength = 15;
        const twigAngle1 = branch.angle - Math.PI / 6;
        const twigAngle2 = branch.angle + Math.PI / 6;

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3d2817';

        // Ramita 1
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX + Math.cos(twigAngle1) * twigLength,
            endY + Math.sin(twigAngle1) * twigLength
        );
        ctx.stroke();

        // Ramita 2
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX + Math.cos(twigAngle2) * twigLength,
            endY + Math.sin(twigAngle2) * twigLength
        );
        ctx.stroke();
    }

    /**
     * Dibuja el árbol completo
     */
    draw(ctx) {
        // Dibujar tronco
        this.drawTrunk(ctx);

        // Dibujar todas las ramas
        this.branches.forEach(branch => {
            this.drawBranch(ctx, branch);
        });
    }
}
