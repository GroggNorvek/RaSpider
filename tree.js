/**
 * Tree - Árbol minimalista
 * Tronco en tercio derecho, ramas hacia la izquierda
 */

class Tree {
    constructor(canvasWidth, canvasHeight) {
        // Tronco en el tercio derecho
        this.x = canvasWidth * 0.83; // 83% hacia la derecha
        this.y = 0;

        this.trunkWidth = 60;
        this.trunkHeight = canvasHeight;

        // Ramas principales (1-3)
        this.mainBranches = [];
        this.generateMainBranches();
    }

    /**
     * Genera 1-3 ramas principales con sub-ramas
     */
    generateMainBranches() {
        const branchCount = Math.floor(Math.random() * 3) + 1; // 1-3

        for (let i = 0; i < branchCount; i++) {
            // Distribuir a lo largo del tronco
            const yPos = 150 + (this.trunkHeight - 300) * (i / Math.max(1, branchCount - 1));

            // Rama principal hacia la izquierda
            const mainLength = 120 + Math.random() * 80; // 120-200px
            const mainAngle = Math.PI + (Math.random() * 0.4 - 0.2); // Aprox. hacia izquierda

            const mainBranch = {
                startX: this.x - this.trunkWidth / 2,
                startY: yPos,
                length: mainLength,
                angle: mainAngle,
                thickness: 8,
                subBranches: []
            };

            // Generar 1-2 sub-ramas pequeñas
            const subCount = Math.floor(Math.random() * 2) + 1;
            for (let j = 0; j < subCount; j++) {
                const t = 0.5 + Math.random() * 0.4; // Posición en rama principal
                const subStartX = mainBranch.startX + Math.cos(mainAngle) * mainLength * t;
                const subStartY = mainBranch.startY + Math.sin(mainAngle) * mainLength * t;

                mainBranch.subBranches.push({
                    startX: subStartX,
                    startY: subStartY,
                    length: 30 + Math.random() * 30,
                    angle: mainAngle + (Math.random() * 0.6 - 0.3),
                    thickness: 3
                });
            }

            this.mainBranches.push(mainBranch);
        }

        // Crear array plano de todas las ramas para compatibilidad
        this.branches = [];
        this.mainBranches.forEach(main => {
            this.branches.push(main);
            this.branches.push(...main.subBranches);
        });
    }

    /**
     * Dibuja el tronco (minimalista)
     */
    drawTrunk(ctx) {
        ctx.fillStyle = '#3d2817';
        ctx.strokeStyle = '#2a1810';
        ctx.lineWidth = 1;

        // Rectángulo simple
        ctx.fillRect(
            this.x - this.trunkWidth / 2,
            this.y,
            this.trunkWidth,
            this.trunkHeight
        );

        // Borde izquierdo
        ctx.beginPath();
        ctx.moveTo(this.x - this.trunkWidth / 2, this.y);
        ctx.lineTo(this.x - this.trunkWidth / 2, this.y + this.trunkHeight);
        ctx.stroke();
    }

    /**
     * Dibuja una rama (minimalista)
     */
    drawBranch(ctx, branch) {
        const endX = branch.startX + Math.cos(branch.angle) * branch.length;
        const endY = branch.startY + Math.sin(branch.angle) * branch.length;

        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = branch.thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    /**
     * Dibuja el árbol completo
     */
    draw(ctx) {
        this.drawTrunk(ctx);

        // Dibujar ramas principales y sub-ramas
        this.mainBranches.forEach(mainBranch => {
            this.drawBranch(ctx, mainBranch);
            mainBranch.subBranches.forEach(subBranch => {
                this.drawBranch(ctx, subBranch);
            });
        });
    }
}
