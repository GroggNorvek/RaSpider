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
            const mainLength = isOffscreen ? 650 + Math.random() * 100 : 280 + Math.random() * 40;
            const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2);

            const mainBranch = {
                startX: this.x,
                startY: yPos,
                length: mainLength,
                baseAngle: baseAngle,
                thickness: 275, // Muchísimo más anchas - coherente con el tronco
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
                    thickness: 100, // Proporcionalmente más anchas
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
        ctx.strokeStyle = '#B0B0B0';
        ctx.lineWidth = branch.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);

        if (branch.cp2X !== undefined) {
            // Rama principal con curva Bézier cúbica
            ctx.bezierCurveTo(
                branch.cp1X, branch.cp1Y,
                branch.cp2X, branch.cp2Y,
                branch.endX, branch.endY
            );
        } else {
            // Sub-rama con curva Bézier cuadrática
            ctx.quadraticCurveTo(
                branch.cp1X, branch.cp1Y,
                branch.endX, branch.endY
            );
        }

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
