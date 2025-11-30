/**
 * Tree - Árbol orgánico con curvas Bézier
 * Diseño minimalista y fluido
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

        this.mainBranches = [];
        this.generateMainBranches();
    }

    generateMainBranches() {
        const branchCount = 3; // Siempre 3 ramas

        for (let i = 0; i < branchCount; i++) {
            const yPos = 150 + (this.trunkHeight - 300) * (i / Math.max(1, branchCount - 1));

            // Primera rama (indice 0) sale completamente de la pantalla
            // Las otras 2 ramas (indices 1, 2) casi llegan al borde pero no se salen
            const isOffscreen = (i === 0);
            const mainLength = isOffscreen ? 900 + Math.random() * 150 : 280 + Math.random() * 40;
            const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2);

            const mainBranch = {
                startX: this.x,
                startY: yPos,
                length: mainLength,
                baseAngle: baseAngle,
                thickness: 80, // Grosor coherente con árbol y araña
                // Puntos de control para curva Bézier
                cp1X: this.x + Math.cos(baseAngle + 0.3) * mainLength * 0.4,
                cp1Y: yPos + Math.sin(baseAngle + 0.3) * mainLength * 0.4,
                cp2X: this.x + Math.cos(baseAngle - 0.2) * mainLength * 0.7,
                cp2Y: yPos + Math.sin(baseAngle - 0.2) * mainLength * 0.7,
                endX: this.x + Math.cos(baseAngle) * mainLength,
                endY: yPos + Math.sin(baseAngle) * mainLength,
                subBranches: []
            };

            // Sub-ramas orgánicas
            const subCount = Math.floor(Math.random() * 2) + 1;
            for (let j = 0; j < subCount; j++) {
                const t = 0.6 + Math.random() * 0.3;
                const subStartX = mainBranch.cp2X + (mainBranch.endX - mainBranch.cp2X) * t;
                const subStartY = mainBranch.cp2Y + (mainBranch.endY - mainBranch.cp2Y) * t;
                const subAngle = baseAngle + (Math.random() * 0.8 - 0.4);
                const subLength = 30 + Math.random() * 30;

                mainBranch.subBranches.push({
                    startX: subStartX,
                    startY: subStartY,
                    length: subLength,
                    baseAngle: subAngle,
                    thickness: 35, // Grosor coherente
                    cp1X: subStartX + Math.cos(subAngle + 0.4) * subLength * 0.5,
                    cp1Y: subStartY + Math.sin(subAngle + 0.4) * subLength * 0.5,
                    endX: subStartX + Math.cos(subAngle) * subLength,
                    endY: subStartY + Math.sin(subAngle) * subLength
                });
            }

            this.mainBranches.push(mainBranch);
        }

        this.branches = [];
        this.mainBranches.forEach(main => {
            this.branches.push(main);
            this.branches.push(...main.subBranches);
        });
    }

    drawTrunk(ctx) {
        ctx.fillStyle = '#D3D3D3';

        // Tronco con bordes curvos orgánicos
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);

        // Borde izquierdo con ondulación sutil
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const yPos = this.y + this.trunkHeight * t;
            const wave = Math.sin(t * Math.PI * 3) * 5;
            ctx.lineTo(this.x + wave, yPos);
        }

        // Borde derecho
        ctx.lineTo(this.x + this.trunkWidth, this.trunkHeight);
        ctx.lineTo(this.x + this.trunkWidth, this.y);
        ctx.closePath();
        ctx.fill();

        // Borde izquierdo más marcado
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const yPos = this.y + this.trunkHeight * t;
            const wave = Math.sin(t * Math.PI * 3) * 5;
            ctx.lineTo(this.x + wave, yPos);
        }
        ctx.stroke();
    }

    drawBranch(ctx, branch) {
        // Dibujar rama como forma cerrada orgánica (no solo línea)
        // La rama se adelgaza del inicio al final naturalmente

        const startThickness = branch.thickness;
        const endThickness = branch.thickness * 0.3; // Se adelgaza al 30% al final

        // Calcular puntos del contorno superior e inferior
        const points = [];
        const steps = 30;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;

            // Interpolar espesor (más grueso al inicio, más delgado al final)
            const currentThickness = startThickness + (endThickness - startThickness) * t;

            // Posición en la curva Bézier
            let x, y;
            if (branch.cp2X !== undefined) {
                // Bézier cúbica
                const t1 = 1 - t;
                x = t1 * t1 * t1 * branch.startX +
                    3 * t1 * t1 * t * branch.cp1X +
                    3 * t1 * t * t * branch.cp2X +
                    t * t * t * branch.endX;
                y = t1 * t1 * t1 * branch.startY +
                    3 * t1 * t1 * t * branch.cp1Y +
                    3 * t1 * t * t * branch.cp2Y +
                    t * t * t * branch.endY;
            } else {
                // Bézier cuadrática
                const t1 = 1 - t;
                x = t1 * t1 * branch.startX +
                    2 * t1 * t * branch.cp1X +
                    t * t * branch.endX;
                y = t1 * t1 * branch.startY +
                    2 * t1 * t * branch.cp1Y +
                    t * t * branch.endY;
            }

            // Calcular normal (perpendicular a la tangente)
            let dx, dy;
            if (branch.cp2X !== undefined) {
                const t1 = 1 - t;
                dx = 3 * t1 * t1 * (branch.cp1X - branch.startX) +
                    6 * t1 * t * (branch.cp2X - branch.cp1X) +
                    3 * t * t * (branch.endX - branch.cp2X);
                dy = 3 * t1 * t1 * (branch.cp1Y - branch.startY) +
                    6 * t1 * t * (branch.cp2Y - branch.cp1Y) +
                    3 * t * t * (branch.endY - branch.cp2Y);
            } else {
                const t1 = 1 - t;
                dx = 2 * t1 * (branch.cp1X - branch.startX) +
                    2 * t * (branch.endX - branch.cp1X);
                dy = 2 * t1 * (branch.cp1Y - branch.startY) +
                    2 * t * (branch.endY - branch.cp1Y);
            }

            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
            }

            // Normal perpendicular (rotar 90°)
            const nx = -dy;
            const ny = dx;

            // Punto superior e inferior
            points.push({
                top: { x: x + nx * currentThickness / 2, y: y + ny * currentThickness / 2 },
                bottom: { x: x - nx * currentThickness / 2, y: y - ny * currentThickness / 2 }
            });
        }

        // Dibujar forma cerrada
        ctx.fillStyle = '#B0B0B0';
        ctx.beginPath();

        // Contorno superior
        ctx.moveTo(points[0].top.x, points[0].top.y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].top.x, points[i].top.y);
        }

        // Contorno inferior (en reversa)
        for (let i = points.length - 1; i >= 0; i--) {
            ctx.lineTo(points[i].bottom.x, points[i].bottom.y);
        }

        ctx.closePath();
        ctx.fill();

        // Borde sutil para definir mejor la forma
        ctx.strokeStyle = '#909090';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    draw(ctx) {
        this.drawTrunk(ctx);

        this.mainBranches.forEach(mainBranch => {
            this.drawBranch(ctx, mainBranch);
            mainBranch.subBranches.forEach(subBranch => {
                this.drawBranch(ctx, subBranch);
            });
        });
    }
}
