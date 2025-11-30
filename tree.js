/**
 * Tree - Árbol con rama única integrada y sub-ramas
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
        this.branchLength = (canvasWidth * (2 / 3) + 40) / Math.abs(Math.cos(Math.PI + 0.1)) - 30;
        this.branchAngle = Math.PI + 0.1;
        this.branchStartX = this.x + 40;

        const branchEndX = this.branchStartX + Math.cos(this.branchAngle) * this.branchLength;
        const branchEndY = this.branchY + Math.sin(this.branchAngle) * this.branchLength;

        // Rama principal
        this.branches = [{
            startX: this.branchStartX,
            startY: this.branchY,
            endX: branchEndX,
            endY: branchEndY,
            angle: this.branchAngle,
            length: this.branchLength,
            thickness: 70
        }];

        // Sub-rama 1: Diagonal hacia ABAJO (30% a lo largo de la rama principal)
        const sub1T = 0.3;
        const sub1BaseX = this.branchStartX + (branchEndX - this.branchStartX) * sub1T;
        const sub1BaseY = this.branchY + (branchEndY - this.branchY) * sub1T;
        const sub1Angle = this.branchAngle - 0.7;
        const sub1Length = 240;

        this.branches.push({
            startX: sub1BaseX,
            startY: sub1BaseY,
            endX: sub1BaseX + Math.cos(sub1Angle) * sub1Length,
            endY: sub1BaseY + Math.sin(sub1Angle) * sub1Length,
            angle: sub1Angle,
            length: sub1Length,
            thickness: 25
        });

        // Sub-rama 2: Diagonal hacia ARRIBA (60% a lo largo de la rama principal)
        const sub2T = 0.6;
        const sub2BaseX = this.branchStartX + (branchEndX - this.branchStartX) * sub2T;
        const sub2BaseY = this.branchY + (branchEndY - this.branchY) * sub2T;
        const sub2Angle = this.branchAngle + 0.6;
        const sub2Length = 70;

        this.branches.push({
            startX: sub2BaseX,
            startY: sub2BaseY,
            endX: sub2BaseX + Math.cos(sub2Angle) * sub2Length,
            endY: sub2BaseY + Math.sin(sub2Angle) * sub2Length,
            angle: sub2Angle,
            length: sub2Length,
            thickness: 20
        });
    }

    draw(ctx) {
        ctx.fillStyle = '#D3D3D3';

        const branchBaseWidth = 70;
        const branchTipWidth = 20;
        const branchEndX = this.branchStartX + Math.cos(this.branchAngle) * this.branchLength;
        const branchEndY = this.branchY + Math.sin(this.branchAngle) * this.branchLength;
        const perpX = -Math.sin(this.branchAngle);
        const perpY = Math.cos(this.branchAngle);

        ctx.beginPath();

        // 1. Esquina superior derecha
        ctx.moveTo(this.x + this.trunkWidth, this.y);

        // 2. Borde derecho
        const rightSteps = 25;
        for (let i = 0; i <= rightSteps; i++) {
            const t = i / rightSteps;
            const yPos = this.y + this.trunkHeight * t;
            const curve = Math.sin(t * Math.PI * 2.5) * 4;
            ctx.lineTo(this.x + this.trunkWidth + curve, yPos);
        }

        // 3. Base
        const baseSteps = 8;
        for (let i = 0; i <= baseSteps; i++) {
            const t = i / baseSteps;
            const xPos = (this.x + this.trunkWidth) - (this.trunkWidth * t);
            const curve = Math.sin(t * Math.PI) * 3;
            ctx.lineTo(xPos, this.trunkHeight - curve);
        }

        // 4. Borde izquierdo inferior hasta donde empieza la rama
        const leftLowerSteps = 20;
        const branchBottomY = this.branchY - branchBaseWidth / 2;
        for (let i = 0; i <= leftLowerSteps; i++) {
            const t = i / leftLowerSteps;
            const yPos = this.trunkHeight - ((this.trunkHeight - branchBottomY) * t);
            const curve = Math.sin(t * Math.PI * 3) * 2;
            ctx.lineTo(this.x + curve, yPos);
        }

        // 5. RAMA - Lado inferior
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const baseX = this.branchStartX + (branchEndX - this.branchStartX) * t;
            const baseY = this.branchY + (branchEndY - this.branchY) * t;

            const width = branchBaseWidth - (branchBaseWidth - branchTipWidth) * t;

            const wave1 = Math.sin(t * Math.PI * 2.2) * 12 * (1 - t * 0.6);
            const wave2 = Math.sin(t * Math.PI * 1.5 + 0.8) * 8 * (1 - t * 0.4);
            const totalWave = wave1 + wave2;

            ctx.lineTo(
                baseX - perpX * width / 2 + totalWave * perpY,
                baseY - perpY * width / 2 - totalWave * perpX
            );
        }

        // 6. Punta afilada
        ctx.lineTo(branchEndX, branchEndY);

        // 7. Lado superior (volviendo)
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const baseX = this.branchStartX + (branchEndX - this.branchStartX) * t;
            const baseY = this.branchY + (branchEndY - this.branchY) * t;

            const width = branchBaseWidth - (branchBaseWidth - branchTipWidth) * t;

            const wave1 = Math.sin(t * Math.PI * 2.2 + Math.PI) * 12 * (1 - t * 0.6);
            const wave2 = Math.sin(t * Math.PI * 1.5 - 0.8) * 8 * (1 - t * 0.4);
            const totalWave = wave1 + wave2;

            ctx.lineTo(
                baseX + perpX * width / 2 + totalWave * perpY,
                baseY + perpY * width / 2 - totalWave * perpX
            );
        }

        // 8. Borde izquierdo superior del tronco
        const leftUpperSteps = 20;
        const branchTopY = this.branchY + branchBaseWidth / 2;
        for (let i = 0; i <= leftUpperSteps; i++) {
            const t = i / leftUpperSteps;
            const yPos = branchTopY - (branchTopY * t);
            const curve = Math.sin(t * Math.PI * 3 + Math.PI) * 2;
            ctx.lineTo(this.x + curve, yPos);
        }

        // 9. Cerrar
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.trunkWidth, this.y);

        ctx.closePath();
        ctx.fill();

        // SUB-RAMAS (dibujadas por separado)

        // Sub-rama 1: Diagonal hacia ABAJO (30% a lo largo de la rama principal)
        const sub1T = 0.3;
        const sub1BaseX = this.branchStartX + (branchEndX - this.branchStartX) * sub1T;
        const sub1BaseY = this.branchY + (branchEndY - this.branchY) * sub1T;
        const sub1Angle = this.branchAngle - 0.7; // Hacia abajo
        const sub1Length = 240;
        const sub1Width = 25;

        this.drawSubBranch(ctx, sub1BaseX, sub1BaseY, sub1Angle, sub1Length, sub1Width);

        // Sub-rama 2: Diagonal hacia ARRIBA (60% a lo largo de la rama principal)
        const sub2T = 0.6;
        const sub2BaseX = this.branchStartX + (branchEndX - this.branchStartX) * sub2T;
        const sub2BaseY = this.branchY + (branchEndY - this.branchY) * sub2T;
        const sub2Angle = this.branchAngle + 0.6; // Hacia arriba
        const sub2Length = 70;
        const sub2Width = 20;

        this.drawSubBranch(ctx, sub2BaseX, sub2BaseY, sub2Angle, sub2Length, sub2Width);

        // Dibujar el nido dentro del tronco
        this.drawNest(ctx);
    }

    drawSubBranch(ctx, startX, startY, angle, length, baseWidth) {
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        const tipWidth = 5;
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);

        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();

        // Lado inferior
        const steps = 15;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            const width = baseWidth - (baseWidth - tipWidth) * t;

            ctx.lineTo(x - perpX * width / 2, y - perpY * width / 2);
        }

        // Punta
        ctx.lineTo(endX, endY);

        // Lado superior
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            const width = baseWidth - (baseWidth - tipWidth) * t;

            ctx.lineTo(x + perpX * width / 2, y + perpY * width / 2);
        }

        ctx.closePath();
        ctx.fill();
    }

    drawNest(ctx) {
        // Posición y tamaño del nido (doble de grande, expandiendo hacia abajo)
        const nestX = this.x + this.trunkWidth * 0.6;
        const nestY = this.trunkHeight * 0.35;
        const nestWidth = this.trunkWidth * 0.5;
        const nestHeight = this.trunkHeight * 0.5; // Doble de altura

        // Dibujar la cavidad orgánica
        ctx.fillStyle = '#B8B8B8'; // Más oscuro que el tronco
        ctx.beginPath();

        // Crear forma orgánica usando curvas Bézier
        const centerX = nestX;
        const centerY = nestY;

        // Puntos de control para forma irregular
        const points = [
            { x: centerX - nestWidth * 0.4, y: centerY - nestHeight * 0.3 },
            { x: centerX + nestWidth * 0.2, y: centerY - nestHeight * 0.4 },
            { x: centerX + nestWidth * 0.5, y: centerY - nestHeight * 0.1 },
            { x: centerX + nestWidth * 0.4, y: centerY + nestHeight * 0.3 },
            { x: centerX + nestWidth * 0.1, y: centerY + nestHeight * 0.5 },
            { x: centerX - nestWidth * 0.3, y: centerY + nestHeight * 0.4 },
            { x: centerX - nestWidth * 0.5, y: centerY + nestHeight * 0.1 },
            { x: centerX - nestWidth * 0.4, y: centerY - nestHeight * 0.2 }
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
}

