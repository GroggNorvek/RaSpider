/**
 * Spider - Patrón de marcha tetrapod natural
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.bodyRadius = 12;

        this.legs = [];
        this.initializeLegs();

        this.walkCycle = 0;
        this.isWalking = true;
    }

    initializeLegs() {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;

            this.legs.push({
                index: i,
                baseAngle: angle,
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
    }

    solveIK(leg, targetX, targetY) {
        const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
        const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

        const dx = targetX - attachX;
        const dy = targetY - attachY;
        const distance = Math.hypot(dx, dy);

        const l1 = leg.segment1Length;
        const l2 = leg.segment2Length;
        const l3 = leg.segment3Length;

        const maxReach = l1 + l2 + l3 - 10;
        const minReach = 15;

        let finalDist = Math.max(minReach, Math.min(distance, maxReach));
        const angleToTarget = Math.atan2(dy, dx);

        const cosAngle1 = (l1 * l1 + finalDist * finalDist - l2 * l2) / (2 * l1 * finalDist);
        const bendAngle1 = Math.acos(Math.max(-1, Math.min(1, cosAngle1)));

        const bendDirection = leg.baseAngle > 0 ? -1 : 1;
        leg.angle1 = angleToTarget - bendAngle1 * bendDirection * 0.7;

        leg.joint1X = attachX + Math.cos(leg.angle1) * l1;
        leg.joint1Y = attachY + Math.sin(leg.angle1) * l1;

        const dx2 = targetX - leg.joint1X;
        const dy2 = targetY - leg.joint1Y;
        const dist2 = Math.hypot(dx2, dy2);

        const cosAngle2 = (l2 * l2 + dist2 * dist2 - l3 * l3) / (2 * l2 * dist2);
        const bendAngle2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));

        const angleToTarget2 = Math.atan2(dy2, dx2);
        leg.angle2 = angleToTarget2 - bendAngle2 * bendDirection * 0.5;

        leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * l2;
        leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * l2;

        leg.angle3 = Math.atan2(targetY - leg.joint2Y, targetX - leg.joint2X);
        leg.angle3 += bendDirection * 0.1;
    }

    updateLegPositions() {
        this.legs.forEach(leg => {
            const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

            leg.joint1X = attachX + Math.cos(leg.angle1) * leg.segment1Length;
            leg.joint1Y = attachY + Math.sin(leg.angle1) * leg.segment1Length;

            leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * leg.segment2Length;
            leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * leg.segment2Length;

            leg.tipX = leg.joint2X + Math.cos(leg.angle3) * leg.segment3Length;
            const attachX = this.x + Math.cos(leg.baseAngle) * this.bodyRadius;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.bodyRadius;

            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(attachX, attachY);

            const cp1X = attachX + (leg.joint1X - attachX) * 0.5;
            const cp1Y = attachY + (leg.joint1Y - attachY) * 0.5 - 3;
            ctx.quadraticCurveTo(cp1X, cp1Y, leg.joint1X, leg.joint1Y);

            const cp2X = leg.joint1X + (leg.joint2X - leg.joint1X) * 0.5;
            const cp2Y = leg.joint1Y + (leg.joint2Y - leg.joint1Y) * 0.5 + 2;
            ctx.quadraticCurveTo(cp2X, cp2Y, leg.joint2X, leg.joint2Y);

            ctx.quadraticCurveTo(
                leg.joint2X + (leg.tipX - leg.joint2X) * 0.6,
                leg.joint2Y + (leg.tipY - leg.joint2Y) * 0.6,
                leg.tipX, leg.tipY
            );

            ctx.stroke();
        }

    drawBody(ctx) {
            ctx.fillStyle = '#1a1a1a';
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1;

            ctx.beginPath();

            const r = this.bodyRadius;
            const smoothness = 0.55;
            const offset = r * smoothness;

            ctx.moveTo(this.x, this.y - r);

            ctx.bezierCurveTo(
                this.x + offset, this.y - r,
                this.x + r, this.y - offset,
                this.x + r, this.y
            );
            ctx.bezierCurveTo(
                this.x + r, this.y + offset,
                this.x + offset, this.y + r,
                this.x, this.y + r
            );
            ctx.bezierCurveTo(
                this.x - offset, this.y + r,
                this.x - r, this.y + offset,
                this.x - r, this.y
            );
            ctx.bezierCurveTo(
                this.x - r, this.y - offset,
                this.x - offset, this.y - r,
                this.x, this.y - r
            );

            ctx.fill();
            ctx.stroke();
        }

    update() {
            this.updateWalkingGroups();
            this.updateLegPositions();
        }

    draw(ctx) {
            for(let i = 0; i< 4; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }

        this.drawBody(ctx);

        for (let i = 4; i < 8; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }
    }
}
