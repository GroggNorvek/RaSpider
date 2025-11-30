/**
 * Tree - Árbol con rama única integrada
 * Una sola forma vectorial unificada
 */

class Tree {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Tronco ocupa el tercio derecho
        this.trunkWidth = canvasWidth / 3;
        this.trunkHeight = canvasHeight;
        this.x = canvasWidth * (2 / 3);
        this.y = 0;

        // Rama única larga
        this.branchY = 200;
        this.branchLength = 950;
        this.branchAngle = Math.PI + 0.1;

        // Generar lista de branches para collision
        this.branches = [{
            startX: this.x,
            startY: this.branchY,
            endX: this.x + Math.cos(this.branchAngle) * this.branchLength,
            endY: this.branchY + Math.sin(this.branchAngle) * this.branchLength,
            angle: this.branchAngle,
            length: this.branchLength,
            thickness: 70
        }];
    }

    draw(ctx) {
        // UNA ÚNICA FORMA VECTORIAL: Tronco + Rama
        ctx.fillStyle = '#D3D3D3';
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 2;

        const branchBaseWidth = 70;
        const branchTipWidth = 20;
        const branchEndX = this.x + Math.cos(this.branchAngle) * this.branchLength;
        const branchEndY = this.branchY + Math.sin(this.branchAngle) * this.branchLength;
        const perpX = -Math.sin(this.branchAngle);
        const perpY = Math.cos(this.branchAngle);

        ctx.beginPath();

        // ===== CONTORNO COMPLETO EN SENTIDO HORARIO =====

        // 1. Esquina superior derecha del tronco
        ctx.moveTo(this.x + this.trunkWidth, this.y);

        // 2. Borde derecho del tronco (bajando)
        ctx.lineTo(this.x + this.trunkWidth, this.trunkHeight);

        // 3. Base del tronco (de derecha a izquierda)
        ctx.lineTo(this.x, this.trunkHeight);

        // 4. Borde izquierdo del tronco inferior (subiendo hasta la rama)
        const steps = 40;
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const yPos = this.branchY + (this.trunkHeight - this.branchY) * t;
            ctx.lineTo(this.x, yPos);
        }

        // 5. RAMA - Contorno inferior (de la base a la punta)
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            ctx.lineTo(x - perpX * width / 2, y - perpY * width / 2);
        }

        // 6. Punta redondeada de la rama
        ctx.arc(
            branchEndX, branchEndY,
            branchTipWidth / 2,
            this.branchAngle - Math.PI / 2,
            this.branchAngle + Math.PI / 2,
            false
        );

        // 7. RAMA - Contorno superior (de la punta a la base)
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            ctx.lineTo(x + perpX * width / 2, y + perpY * width / 2);
        }

        // 8. Borde izquierdo del tronco superior (bajando desde la rama hasta arriba)
        for (let i = this.branchY; i >= 0; i -= 10) {
            ctx.lineTo(this.x, i);
        }

        // 9. Completar - borde superior del tronco
        ctx.lineTo(this.x, this.y);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
