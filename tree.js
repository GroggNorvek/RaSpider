/**
 * Tree - Árbol con rama única integrada
 * Una sola forma vectorial - contorno exterior completo
 */

class Tree {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.trunkWidth = canvasWidth / 3;
        this.trunkHeight = canvasHeight;
        this.x = canvasWidth * (2 / 3);
        this.y = 0;

        this.branchY = 200;
        this.branchLength = 950;
        this.branchAngle = Math.PI + 0.1;

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
        ctx.fillStyle = '#D3D3D3';
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 2;

        const branchBaseWidth = 70;
        const branchTipWidth = 20;
        const branchEndX = this.x + Math.cos(this.branchAngle) * this.branchLength;
        const branchEndY = this.branchY + Math.sin(this.branchAngle) * this.branchLength;
        const perpX = -Math.sin(this.branchAngle);
        const perpY = Math.cos(this.branchAngle);

        // Puntos clave de la rama
        const branchTopBase = {
            x: this.x + perpX * branchBaseWidth / 2,
            y: this.branchY + perpY * branchBaseWidth / 2
        };
        const branchBottomBase = {
            x: this.x - perpX * branchBaseWidth / 2,
            y: this.branchY - perpY * branchBaseWidth / 2
        };

        ctx.beginPath();

        // ===== CONTORNO EXTERIOR COMPLETO (sentido horario) =====

        // 1. Empezar en esquina superior derecha
        ctx.moveTo(this.x + this.trunkWidth, this.y);

        // 2. Bajar por borde derecho del tronco
        ctx.lineTo(this.x + this.trunkWidth, this.trunkHeight);

        // 3. Base del tronco (de derecha a izquierda)
        ctx.lineTo(this.x, this.trunkHeight);

        // 4. Subir por borde izquierdo hasta donde sale la rama (parte inferior)
        ctx.lineTo(this.x, branchBottomBase.y);

        // 5. RAMA - lado inferior (de base a punta)
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            ctx.lineTo(x - perpX * width / 2, y - perpY * width / 2);
        }

        // 6. Rodear punta de la rama
        ctx.arc(
            branchEndX, branchEndY,
            branchTipWidth / 2,
            this.branchAngle - Math.PI / 2,
            this.branchAngle + Math.PI / 2,
            false
        );

        // 7. RAMA - lado superior (de punta a base)
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            ctx.lineTo(x + perpX * width / 2, y + perpY * width / 2);
        }

        // 8. Continuar subiendo por borde izquierdo del tronco (desde rama hasta arriba)
        ctx.lineTo(this.x, this.y);

        // 9. Cerrar recorriendo borde superior
        ctx.lineTo(this.x + this.trunkWidth, this.y);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
