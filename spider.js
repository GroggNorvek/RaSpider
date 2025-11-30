/**
 * Spider - Araña orgánica con curvas Bézier
 * Diseño minimalista y fluido
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.bodyRadius = 12;

        this.legs = [];
        this.initializeLegs();
    }

    initializeLegs() {
        // 8 patas distribuidas radialmente
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;

            this.legs.push({
                index: i,
                baseAngle: angle,
                walkingGroup: i % 4,
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
     * Dibuja pata con curvas Bézier orgánicas
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

            // Curva orgánica para el primer segmento
            const cp1X = attachX + (leg.joint1X - attachX) * 0.5;
            const cp1Y = attachY + (leg.joint1Y - attachY) * 0.5 - 3;
            ctx.quadraticCurveTo(cp1X, cp1Y, leg.joint1X, leg.joint1Y);

            // Curva para el segundo segmento
            const cp2X = leg.joint1X + (leg.joint2X - leg.joint1X) * 0.5;
            const cp2Y = leg.joint1Y + (leg.joint2Y - leg.joint1Y) * 0.5 + 2;
            ctx.quadraticCurveTo(cp2X, cp2Y, leg.joint2X, leg.joint2Y);

            // Curva para el tercer segmento
            ctx.quadraticCurveTo(
                leg.joint2X + (leg.tipX - leg.joint2X) * 0.6,
                leg.joint2Y + (leg.tipY - leg.joint2Y) * 0.6,
                leg.tipX, leg.tipY
            );

            ctx.stroke();
        }

        /**
         * Dibuja cuerpo orgánico con curvas
         */
        drawBody(ctx) {
            ctx.fillStyle = '#1a1a1a';
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1;

            // Cuerpo orgánico con curvas Bézier
            ctx.beginPath();

            const r = this.bodyRadius;
            const smoothness = 0.55; // Factor de suavizado para círculo perfecto con Bézier
            const offset = r * smoothness;

            ctx.moveTo(this.x, this.y - r);

            // Curvas Bézier para crear forma orgánica suave
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
