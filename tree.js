/**
 * Tree - Árbol con rama única integrada
 * Forma vectorial única con trazado orgánico
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

        ctx.beginPath();

        // ===== CONTORNO EXTERIOR COMPLETO (orgánico) =====

        // 1. Esquina superior derecha con curva suave
        ctx.moveTo(this.x + this.trunkWidth, this.y);

        // 2. Borde derecho con ligera ondulación orgánica
        const rightSteps = 25;
        for (let i = 0; i <= rightSteps; i++) {
            const t = i / rightSteps;
            const yPos = this.y + this.trunkHeight * t;
            const curve = Math.sin(t * Math.PI * 2.5) * 4;
            ctx.lineTo(this.x + this.trunkWidth + curve, yPos);
        }

        // 3. Base con curva suave
        const baseSteps = 8;
        for (let i = 0; i <= baseSteps; i++) {
            const t = i / baseSteps;
            const xPos = (this.x + this.trunkWidth) - (this.trunkWidth * t);
            const curve = Math.sin(t * Math.PI) * 3;
            ctx.lineTo(xPos, this.trunkHeight - curve);
        }

        // 4. Borde izquierdo inferior con ondulación hasta la rama
        const leftLowerSteps = 20;
        const branchBottomY = this.branchY - branchBaseWidth / 2;
        for (let i = 0; i <= leftLowerSteps; i++) {
            const t = i / leftLowerSteps;
            const yPos = this.trunkHeight - ((this.trunkHeight - branchBottomY) * t);
            const curve = Math.sin(t * Math.PI * 3) * 2;
            ctx.lineTo(this.x + curve, yPos);
        }

        // 5. RAMA - lado inferior con adelgazamiento natural
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            // Ligera ondulación en la rama
            const wave = Math.sin(t * Math.PI * 3) * (2 * (1 - t));

            ctx.lineTo(
                x - perpX * width / 2 + wave * perpY,
                y - perpY * width / 2 - wave * perpX
            );
        }

        // 6. Punta redondeada
        ctx.arc(
            branchEndX, branchEndY,
            branchTipWidth / 2,
            this.branchAngle - Math.PI / 2,
            this.branchAngle + Math.PI / 2,
            false
        );

        // 7. RAMA - lado superior
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const x = this.x + (branchEndX - this.x) * t;
            const y = this.branchY + (branchEndY - this.branchY) * t;
            const width = branchBaseWidth + (branchTipWidth - branchBaseWidth) * t;

            const wave = Math.sin(t * Math.PI * 3 + Math.PI) * (2 * (1 - t));

            ctx.lineTo(
                x + perpX * width / 2 + wave * perpY,
                y + perpY * width / 2 - wave * perpX
            );
        }

        // 8. Borde izquierdo superior con ondulación desde la rama
        const leftUpperSteps = 20;
        const branchTopY = this.branchY + branchBaseWidth / 2;
        for (let i = 0; i <= leftUpperSteps; i++) {
            const t = i / leftUpperSteps;
            const yPos = branchTopY - (branchTopY * t);
            const curve = Math.sin(t * Math.PI * 3 + Math.PI) * 2;
            ctx.lineTo(this.x + curve, yPos);
        }

        // 9. Cerrar con borde superior
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.trunkWidth, this.y);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
