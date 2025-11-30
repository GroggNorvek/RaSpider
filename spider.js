/**
 * Spider - Araña minimalista
 * Octógono con 8 patas articuladas desde cada vértice
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tamaño del octógono
        this.bodyRadius = 12;

        // Patas
        this.legs = [];
        this.initializeLegs();
    }

    /**
     * Inicializa las 8 patas desde los vértices del octógono
     */
    initializeLegs() {
        // 8 patas, una en cada vértice del octógono
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 2; // Empezar desde arriba

            this.legs.push({
                index: i,
                baseAngle: angle,
                walkingGroup: i % 4, // 4 grupos
                segment1Length: 25,
                segment2Length: 30,
                segment3Length: 20,
                isLifted: false,
                liftProgress: 0,
                targetX: 0,
                targetY: 0,
                angle1: angle,
                angle2: angle - Math.PI / 4,
                angle3: angle - Math.PI / 3,
                joint1X: 0,
                joint1Y: 0,
                joint2X: 0,
                joint2Y: 0,
                tipX: 0,
                tipY: 0
            });
        }

        this.currentWalkingGroup = 0;
        this.walkCycle = 0;
        this.isWalking = true;
    }

    /**
     * IK solver
     */
    solveIK(leg, targetX, targetY) {
        // Punto de anclaje en el vértice del octógono
        const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
        const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

        const dx = targetX - attachX;
        const dy = targetY - attachY;
        const distance = Math.hypot(dx, dy);

        const l1 = leg.segment1Length;
        const l2 = leg.segment2Length;
        const maxReach = l1 + l2 - 5;

        let finalDist = Math.min(distance, maxReach);
        const angleToTarget = Math.atan2(dy, dx);

        const cosAngle = (l1 * l1 + finalDist * finalDist - l2 * l2) / (2 * l1 * finalDist);
        const angle1Offset = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

        leg.angle1 = angleToTarget - angle1Offset;
        leg.angle2 = Math.atan2(
            targetY - (attachY + Math.sin(leg.angle1) * l1),
            targetX - (attachX + Math.cos(leg.angle1) * l1)
        );
    }

    updateLegPositions() {
        this.legs.forEach(leg => {
            const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

            leg.joint1X = attachX + Math.cos(leg.angle1) * leg.segment1Length;
            leg.joint1Y = attachY + Math.sin(leg.angle1) * leg.segment1Length;

            leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * leg.segment2Length;
            leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * leg.segment2Length;

            leg.angle3 = leg.angle2 - Math.PI / 6;
            leg.tipX = leg.joint2X + Math.cos(leg.angle3) * leg.segment3Length;
            leg.tipY = leg.joint2Y + Math.sin(leg.angle3) * leg.segment3Length;
        });
    }

    updateWalkingGroups() {
        if (!this.isWalking) return;

        this.walkCycle += 0.03;

        if (this.walkCycle > Math.PI * 2) {
            this.walkCycle = 0;
            this.currentWalkingGroup = (this.currentWalkingGroup + 1) % 4;
        }

        this.legs.forEach(leg => {
            if (leg.walkingGroup === this.currentWalkingGroup) {
                this.updateLegStepping(leg);
            }
        });
    }

    updateLegStepping(leg) {
        const restDistance = 60;

        leg.targetX = this.x + Math.cos(leg.baseAngle) * restDistance;
        leg.targetY = this.y + Math.sin(leg.baseAngle) * restDistance;

        if (leg.isLifted) {
            leg.liftProgress += 0.15;

            if (leg.liftProgress >= 1) {
                leg.isLifted = false;
                leg.liftProgress = 0;
            }

            const t = leg.liftProgress;
            const currentX = leg.tipX + (leg.targetX - leg.tipX) * t;
            const currentY = leg.tipY + (leg.targetY - leg.tipY) * t;
            const liftHeight = Math.sin(t * Math.PI) * 12;

            this.solveIK(leg, currentX, currentY - liftHeight);

        } else {
            const dist = Math.hypot(leg.tipX - leg.targetX, leg.tipY - leg.targetY);

            if (dist > 25) {
                leg.isLifted = true;
                leg.liftProgress = 0;
            } else {
                this.solveIK(leg, leg.tipX, leg.tipY);
            }
        }
    }

    /**
     * Dibuja una pata (minimalista)
     */
    drawLeg(ctx, leg) {
        const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
        const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(attachX, attachY);
        ctx.lineTo(leg.joint1X, leg.joint1Y);
        ctx.lineTo(leg.joint2X, leg.joint2Y);
        ctx.lineTo(leg.tipX, leg.tipY);
        ctx.stroke();
    }

    /**
     * Dibuja el octógono (cuerpo)
     */
    drawBody(ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
            const px = this.x + Math.cos(angle) * this.bodyRadius;
            const py = this.y + Math.sin(angle) * this.bodyRadius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.updateWalkingGroups();
        this.updateLegPositions();
    }

    draw(ctx) {
        // Patas traseras
        for (let i = 0; i < 4; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }

        this.drawBody(ctx);

        // Patas delanteras
        for (let i = 4; i < 8; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }
    }
}
