/**
    /**
     * Genera 1-3 ramas principales con sub-ramas
     */
generateMainBranches() {
    const branchCount = Math.floor(Math.random() * 3) + 1; // 1-3

    for (let i = 0; i < branchCount; i++) {
        // Distribuir a lo largo del tronco
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
