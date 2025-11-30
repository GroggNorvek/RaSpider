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
            // [ángulo base, lado]
            { angle: -Math.PI * 0.7, side: 'left' },   // Pata 0 - frontal izq
            { angle: -Math.PI * 0.5, side: 'left' },   // Pata 1 - media-frontal izq
            { angle: -Math.PI * 0.3, side: 'left' },   // Pata 2 - media-trasera izq
            { angle: -Math.PI * 0.1, side: 'left' },   // Pata 3 - trasera izq
            { angle: Math.PI * 0.1, side: 'right' },   // Pata 4 - trasera der
            { angle: Math.PI * 0.3, side: 'right' },   // Pata 5 - media-trasera der
            { angle: Math.PI * 0.5, side: 'right' },   // Pata 6 - media-frontal der
            { angle: Math.PI * 0.7, side: 'right' }    // Pata 7 - frontal der
        ];

        legConfig.forEach((config, index) => {
            this.legs.push({
                index: index,
                baseAngle: config.angle,
                side: config.side,

                // Longitudes de segmentos (según referencia: patas largas)
                segment1Length: 30,
                segment2Length: 35,
                segment3Length: 25,

                // Ángulos de articulación (valores por defecto)
                angle1: config.angle,
                angle2: config.angle - Math.PI / 4,
                angle3: config.angle - Math.PI / 3,

                // Posiciones de articulaciones (se calculan en update)
                joint1X: 0,
                joint1Y: 0,
                joint2X: 0,
                joint2Y: 0,
                tipX: 0,
                tipY: 0
            });
        });
    }

    /**
     * Actualiza las posiciones de las articulaciones de las patas
     */
    updateLegPositions() {
        this.legs.forEach(leg => {
            // Punto de anclaje en el cuerpo
            const attachX = this.x + Math.cos(leg.baseAngle) * this.cephalothoraxRadius * 0.7;
            const attachY = this.y + Math.sin(leg.baseAngle) * this.cephalothoraxRadius * 0.7;

            // Primera articulación
            leg.joint1X = attachX + Math.cos(leg.angle1) * leg.segment1Length;
            leg.joint1Y = attachY + Math.sin(leg.angle1) * leg.segment1Length;

            // Segunda articulación
            leg.joint2X = leg.joint1X + Math.cos(leg.angle2) * leg.segment2Length;
            leg.joint2Y = leg.joint1Y + Math.sin(leg.angle2) * leg.segment2Length;

            // Punta de la pata
            leg.tipX = leg.joint2X + Math.cos(leg.angle3) * leg.segment3Length;
            leg.tipY = leg.joint2Y + Math.sin(leg.angle3) * leg.segment3Length;
        });
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

        // Dibujar segmentos de la pata
        ctx.beginPath();
        ctx.moveTo(attachX, attachY);
        ctx.lineTo(leg.joint1X, leg.joint1Y);
        ctx.lineTo(leg.joint2X, leg.joint2Y);
        ctx.lineTo(leg.tipX, leg.tipY);
        ctx.stroke();

        // Articulaciones (pequeños círculos)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(leg.joint1X, leg.joint1Y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(leg.joint2X, leg.joint2Y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja el cefalotórax (cuerpo principal)
     */
    drawCephalothorax(ctx) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.cephalothoraxRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja el abdomen (parte trasera alargada)
     */
    drawAbdomen(ctx) {
        // Posición del abdomen (detrás del cefalotórax)
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
        this.updateLegPositions();
    }

    /**
     * Dibuja la araña completa
     */
    draw(ctx) {
        // Dibujar patas traseras primero (4 patas de un lado)
        for (let i = 0; i < 4; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }

        // Dibujar abdomen
        this.drawAbdomen(ctx);

        // Dibujar cefalotórax
        this.drawCephalothorax(ctx);

        // Dibujar patas delanteras (otras 4 patas)
        for (let i = 4; i < 8; i++) {
            this.drawLeg(ctx, this.legs[i]);
        }
    }
}
