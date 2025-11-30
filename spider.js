/**
 * Spider - Araña vectorial con 8 patas articuladas
 * Basada en imagen de referencia
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tamaños del cuerpo (según referencia)
        this.cephalothoraxRadius = 15;
        this.abdomenWidth = 12;
        this.abdomenLength = 35;

        // Configuración de patas (8 patas)
        this.legs = [];
        this.initializeLegs();
    }
/**
 * Spider - Araña vectorial con 8 patas articuladas
 * Basada en imagen de referencia
 */

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tamaños del cuerpo (según referencia)
        this.cephalothoraxRadius = 15;
        this.abdomenWidth = 12;
        this.abdomenLength = 35;

        // Configuración de patas (8 patas)
        this.legs = [];
        this.initializeLegs();
    }

    /**
     * Inicializa las 8 patas con sus segmentos
     */
    initializeLegs() {
        const legConfig = [
            // [ángulo base, lado, walkingGroup]
            { angle: -Math.PI * 0.7, side: 'left', group: 0 },   // Pata 0 - Grupo 0
            { angle: -Math.PI * 0.5, side: 'left', group: 2 },   // Pata 1 - Grupo 2
            { angle: -Math.PI * 0.3, side: 'left', group: 1 },   // Pata 2 - Grupo 1
            { angle: -Math.PI * 0.1, side: 'left', group: 3 },   // Pata 3 - Grupo 3
            { angle: Math.PI * 0.1, side: 'right', group: 3 },   // Pata 4 - Grupo 3
            { angle: Math.PI * 0.3, side: 'right', group: 1 },   // Pata 5 - Grupo 1
            { angle: Math.PI * 0.5, side: 'right', group: 2 },   // Pata 6 - Grupo 2
            { angle: Math.PI * 0.7, side: 'right', group: 0 }    // Pata 7 - Grupo 0
        ];

        legConfig.forEach((config, index) => {
            this.legs.push({
                index: index,
                baseAngle: config.angle,
                side: config.side,
                walkingGroup: config.group,  // FFF-425: Walking Groups

                // Longitudes de segmentos
                segment1Length: 30,
                segment2Length: 35,
                segment3Length: 25,

                // Estado de stepping
                isLifted: false,
                liftProgress: 0,
                targetX: 0,
                targetY: 0,

                // Ángulos de articulación
                angle1: config.angle,
                angle2: config.angle - Math.PI / 4,
                angle3: config.angle - Math.PI / 3,

                // Posiciones
                joint1X: 0,
                joint1Y: 0,
                joint2X: 0,
                joint2Y: 0,
                tipX: 0,
                tipY: 0
            });
        });

        // FFF-425: Walking Groups control
        this.currentWalkingGroup = 0;
        this.walkCycle = 0;
        this.isWalking = true;
    }

    /**
     * FFF-425: Sistema IK simple para posicionar las patas
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

        // Limitar alcance
        let finalDist = Math.min(distance, maxReach);
        const angleToTarget = Math.atan2(dy, dx);

        // Ley de cosenos para IK
        const cosAngle = (l1 * l1 + finalDist * finalDist - l2 * l2) / (2 * l1 * finalDist);
        const angle1Offset = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

        leg.angle1 = angleToTarget - angle1Offset;
        leg.angle2 = Math.atan2(
            targetY - (attachY + Math.sin(leg.angle1) * l1),
            targetX - (attachX + Math.cos(leg.angle1) * l1)
        );
    }

    /**
     * Actualiza las posiciones de las articulaciones de las patas
     */
    updateLegPositions() {
        this.legs.forEach(leg => {
            const attachX = this.x + Math.cos(leg.baseAngle) * this.cephalothoraxRadius * 0.7;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.cephalothoraxRadius * 0.7;

            // Primera articulación
            leg.joint1X = attachX + Math.cos(leg.angle1) * leg.segment1Length;
            leg.joint1Y = attachY + Math.sin(leg.angle1) * leg.segment1Length;

            // Segunda articulación
            leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * leg.segment2Length;
            leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * leg.segment2Length;

            // Punta de la pata
            leg.angle3 = leg.angle2 - Math.PI / 6;
            leg.tipX = leg.joint2X + Math.cos(leg.angle3) * leg.segment3Length;
            leg.tipY = leg.joint2Y + Math.sin(leg.angle3) * leg.segment3Length;
        });
    }

    /**
     * FFF-425: Actualizar walking groups
     */
    updateWalkingGroups() {
        if (!this.isWalking) return;

        this.walkCycle += 0.03;

        // Cambiar grupo cada cierto tiempo
        if (this.walkCycle > Math.PI * 2) {
            this.walkCycle = 0;
            this.currentWalkingGroup = (this.currentWalkingGroup + 1) % 4;
        }

        // Actualizar patas del grupo actual
        this.legs.forEach(leg => {
            if (leg.walkingGroup === this.currentWalkingGroup) {
                this.updateLegStepping(leg);
            }
        });
    }

    /**
     * FFF-425: Stepping de una pata individual
     */
    updateLegStepping(leg) {
        const restDistance = 70; // Distancia en reposo

        // Calcular posición objetivo
        leg.targetX = this.x + Math.cos(leg.baseAngle) * restDistance;
        leg.targetY = this.y + Math.sin(leg.baseAngle) * restDistance;

        // Animar paso si está levantada
        if (leg.isLifted) {
            leg.liftProgress += 0.15;

            if (leg.liftProgress >= 1) {
                leg.isLifted = false;
                leg.liftProgress = 0;
            }

            // Interpolación con arco
            const t = leg.liftProgress;
            const currentX = leg.tipX + (leg.targetX - leg.tipX) * t;
            const currentY = leg.tipY + (leg.targetY - leg.tipY) * t;

            // Aplicar IK a posición con elevación
            const liftHeight = Math.sin(t * Math.PI) * 15;
            this.solveIK(leg, currentX, currentY - liftHeight);

        } else {
            // Verificar si necesita dar un paso
            const dist = Math.hypot(leg.tipX - leg.targetX, leg.tipY - leg.targetY);

            if (dist > 30) {
                leg.isLifted = true;
                leg.liftProgress = 0;
            } else {
                // Mantener posición con IK
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

        // Dibujar segmentos
        ctx.beginPath();
        ctx.moveTo(attachX, attachY);
        ctx.lineTo(leg.joint1X, leg.joint1Y);
        ctx.lineTo(leg.joint2X, leg.joint2Y);
        ctx.lineTo(leg.tipX, leg.tipY);
        ctx.stroke();

        // Articulaciones
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(leg.joint1X, leg.joint1Y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(leg.joint2X, leg.joint2Y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja el cefalotórax
     */
    drawCephalothorax(ctx) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.cephalothoraxRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja el abdomen
     */
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
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    /**
     * Actualiza la araña
     */
    update() {
        this.updateWalkingGroups();  // FFF-425
        this.updateLegPositions();
    }

    /**
     * Dibuja la araña completa
     */
    draw(ctx) {
        // Patas traseras
        for (let i = 0; i < 4; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }

        this.drawAbdomen(ctx);
        this.drawCephalothorax(ctx);

        // Patas delanteras
        for (let i = 4; i < 8; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }
    }
}
