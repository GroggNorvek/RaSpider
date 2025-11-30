/**
 * Tree - Árbol con rama única integrada
 * Diseño vectorial orgánico y realista
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
        this.branchAngle = Math.PI + 0.1; // Ligeramente hacia arriba

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
        // Dibujar tronco y rama como una forma vectorial unificada
        ctx.fillStyle = '#D3D3D3';
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 2;

        ctx.beginPath();

        // ===== TRONCO - Borde izquierdo =====
        ctx.moveTo(this.x, this.y);

        // Parte superior del tronco hasta la rama
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const yPos = this.y + this.branchY * t;
            const xOffset = Math.sin(t * Math.PI * 2) * 3;
            ctx.lineTo(this.x + xOffset, yPos);
        }

        // ===== TRANSICIÓN A LA RAMA =====
        // La rama emerge suavemente del lado izquierdo del tronco
        const branchBaseWidth = 70;
        const branchTipWidth = 20;

        // Punto donde comienza la rama (lado izquierdo del tronco)
        const branchStartX = this.x;
        const branchStartY = this.branchY;

        // Punto final de la rama
        const branchEndX = this.x + Math.cos(this.branchAngle) * this.branchLength;
        const branchEndY = this.branchY + Math.sin(this.branchAngle) * this.branchLength;

        // Contorno superior de la rama (adelgazamiento gradual)
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = branchStartX + (branchEndX - branchStartX) * t;
            const y = branchStartY + (branchEndY - branchStartY) * t;

            // Ancho de la rama en este punto
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            // Offset perpendicular hacia arriba
            const perpX = -Math.sin(this.branchAngle);
            const perpY = Math.cos(this.branchAngle);

            ctx.lineTo(x + perpX * width / 2, y + perpY * width / 2);
        }

        // Punta de la rama (redondear)
        ctx.arc(
            branchEndX, branchEndY,
            branchTipWidth / 2,
            this.branchAngle + Math.PI / 2,
            this.branchAngle - Math.PI / 2,
            false
        );

        // Contorno inferior de la rama (volviendo)
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const x = branchStartX + (branchEndX - branchStartX) * t;
            const y = branchStartY + (branchEndY - branchStartY) * t;

            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            const perpX = -Math.sin(this.branchAngle);
            const perpY = Math.cos(this.branchAngle);

            ctx.lineTo(x - perpX * width / 2, y - perpY * width / 2);
        }

        // ===== TRONCO - Continuar borde izquierdo después de la rama =====
        for (let i = 20; i <= 60; i++) {
            const t = i / 60;
            const yPos = this.branchY + (this.trunkHeight - this.branchY) * ((i - 20) / 40);
            const xOffset = Math.sin(t * Math.PI * 2) * 3;
            ctx.lineTo(this.x + xOffset, yPos);
        }

        // ===== TRONCO - Borde inferior =====
        ctx.lineTo(this.x, this.trunkHeight);

        // ===== TRONCO - Borde derecho =====
        ctx.lineTo(this.x + this.trunkWidth, this.trunkHeight);
        ctx.lineTo(this.x + this.trunkWidth, this.y);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
