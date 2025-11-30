/**
 * Spider - Araña vectorial con 8 patas articuladas
 * Animación con Walking Groups (Factorio FFF-425)
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tamaños del cuerpo
        this.cephalothoraxRadius = 15;
        this.abdomenWidth = 12;
        this.abdomenLength = 35;

        // Patas
        this.legs = [];
        this.initializeLegs();
    }

    /**
     * Inicializa las 8 patas con Walking Groups
     */
    initializeLegs() {
        const legConfig = [
            // [ángulo, lado, grupo]
            { angle: -Math.PI * 0.7, side: 'left', group: 0 },
            { angle: -Math.PI * 0.5, side: 'left', group: 2 },
            { angle: -Math.PI * 0.3, side: 'left', group: 1 },
            { angle: -Math.PI * 0.1, side: 'left', group: 3 },
            { angle: Math.PI * 0.1, side: 'right', group: 3 },
            { angle: Math.PI * 0.3, side: 'right', group: 1 },
            { angle: Math.PI * 0.5, side: 'right', group: 2 },
            { angle: Math.PI * 0.7, side: 'right', group: 0 }
        ];

        legConfig.forEach((config, index) => {
            this.legs.push({
                index,
                baseAngle: config.angle,
                walkingGroup: config.group,
                segment1Length: 30,
                segment2Length: 35,
                segment3Length: 25,
                isLifted: false,
                liftProgress: 0,
                targetX: 0,
                targetY: 0,
                angle1: config.angle,
                angle2: config.angle - Math.PI / 4,
                angle3: config.angle - Math.PI / 3,
                joint1X: 0,
                joint1Y: 0,
                joint2X: 0,
                joint2Y: 0,
                tipX: 0,
                tipY: 0
            });
        });

        this.currentWalkingGroup = 0;
        this.walkCycle = 0;
        this.isWalking = true;
    }

    /**
     * IK solver (FFF-425)
     */
    solveIK(leg, targetX, targetY) {
        const attachX = this.x + Math.cos(leg.baseAngle) * this.cephalothoraxRadius * 0.7;
        const attachY = this.y + Math.sin(leg.baseAngle) * this.cephalothoraxRadius * 0.7;

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

    /**
     * Actualiza posiciones de articulaciones
     */
    updateLegPositions() {
        this.legs.forEach(leg => {
            const attachX = this.x + Math.cos(leg.baseAngle) * this.cephalothoraxRadius * 0.7;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.cephalothoraxRadius * 0.7;

            leg.joint1X = attachX + Math.cos(leg.angle1) * leg.segment1Length;
            leg.joint1Y = attachY + Math.sin(leg.angle1) * leg.segment1Length;

            leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * leg.segment2Length;
            leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * leg.segment2Length;

            leg.angle3 = leg.angle2 - Math.PI / 6;
            leg.tipX = leg.joint2X + Math.cos(leg.angle3) * leg.segment3Length;
            leg.tipY = leg.joint2Y + Math.sin(leg.angle3) * leg.segment3Length;
        });
    }

    /**
     * Walking Groups (FFF-425)
     */
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

    /**
     * Stepping individual (FFF-425)
     */
    updateLegStepping(leg) {
        const restDistance = 70;

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
            const liftHeight = Math.sin(t * Math.PI) * 15;

            this.solveIK(leg, currentX, currentY - liftHeight);

        } else {
            const dist = Math.hypot(leg.tipX - leg.targetX, leg.tipY - leg.targetY);

            if (dist > 30) {
                leg.isLifted = true;
                leg.liftProgress = 0;
            } else {
                this.solveIK(leg, leg.tipX, leg.tipY);
            }
        }
    }

    /**
     * Dibuja una pata
     */
    drawLeg(ctx, leg) {
        const attachX = this.x + Math.cos(leg.baseAngle) * this.cephalothoraxRadius * 0.7;
        const attachY = this.y + Math.sin(leg.baseAngle) * this.cephalothoraxRadius * 0.7;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(attachX, attachY);
        ctx.lineTo(leg.joint1X, leg.joint1Y);
        ctx.lineTo(leg.joint2X, leg.joint2Y);
        ctx.lineTo(leg.tipX, leg.tipY);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(leg.joint1X, leg.joint1Y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(leg.joint2X, leg.joint2Y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCephalothorax(ctx) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.cephalothoraxRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAbdomen(ctx) {
        const abdomenX = this.x;
        const abdomenY = this.y + this.cephalothoraxRadius;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(
            abdomenX,
            abdomenY + this.abdomenLength / 2,
            this.abdomenWidth,
            this.abdomenLength,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    update() {
        this.updateWalkingGroups();
        this.updateLegPositions();
    }

    draw(ctx) {
        for (let i = 0; i < 4; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }

        this.drawAbdomen(ctx);
        this.drawCephalothorax(ctx);

        for (let i = 4; i < 8; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }
    }
}
