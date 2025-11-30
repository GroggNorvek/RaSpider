/**
 * Tree - Árbol minimalista
 * Tronco ocupa todo el tercio derecho
 */

class Tree {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Tronco ocupa TODO el tercio derecho
        this.trunkWidth = canvasWidth / 3;
        this.trunkHeight = canvasHeight;
        this.x = canvasWidth * (2 / 3); // Borde izquierdo del tronco
        this.y = 0;

        this.mainBranches = [];
        this.generateMainBranches();
    }

    generateMainBranches() {
        const branchCount = Math.floor(Math.random() * 3) + 1; // 1-3

        for (let i = 0; i < branchCount; i++) {
            const yPos = 150 + (this.trunkHeight - 300) * (i / Math.max(1, branchCount - 1));
            const mainLength = 120 + Math.random() * 80;
            const mainAngle = Math.PI + (Math.random() * 0.4 - 0.2);

            const mainBranch = {
                startX: this.x,
                startY: yPos,
                length: mainLength,
                angle: mainAngle,
                thickness: 8,
                subBranches: []
            };

            const subCount = Math.floor(Math.random() * 2) + 1;
            for (let j = 0; j < subCount; j++) {
                const t = 0.5 + Math.random() * 0.4;
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

        this.branches = [];
        this.mainBranches.forEach(main => {
            this.branches.push(main);
            this.branches.push(...main.subBranches);
        });
    }

    drawTrunk(ctx) {
        ctx.fillStyle = '#D3D3D3'; // Gris claro
        ctx.strokeStyle = '#A9A9A9'; // Gris medio para borde
        ctx.lineWidth = 1;

        ctx.fillRect(this.x, this.y, this.trunkWidth, this.trunkHeight);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.trunkHeight);
        ctx.stroke();
    }

    drawBranch(ctx, branch) {
        const endX = branch.startX + Math.cos(branch.angle) * branch.length;
        const endY = branch.startY + Math.sin(branch.angle) * branch.length;

        ctx.strokeStyle = '#B0B0B0'; // Gris claro para ramas
        ctx.lineWidth = branch.thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(endX, endY);
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
