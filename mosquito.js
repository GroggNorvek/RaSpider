/**
 * Mosquito - Prey system
 * Mosquitos spawn from screen edges and fly erratically across screen
 * Get trapped in spider webs
 */

class Mosquito {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;

        // Calculate base velocity toward target
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.hypot(dx, dy);
        const speed = 1.5; // Base speed

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;

        // Erratic movement
        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.1;
        this.wobbleAmount = 0.5;

        // State
        this.state = 'FLYING'; // FLYING, TRAPPED
        this.trappedWeb = null;
        this.vibrationOffset = 0;

        // Size
        this.size = 3;
    }

    update() {
        if (this.state === 'FLYING') {
            // Erratic wobble
            this.wobbleAngle += this.wobbleSpeed;
            const wobbleX = Math.cos(this.wobbleAngle) * this.wobbleAmount;
            const wobbleY = Math.sin(this.wobbleAngle * 1.3) * this.wobbleAmount;

            // Update position with wobble
            this.x += this.vx + wobbleX;
            this.y += this.vy + wobbleY;

        } else if (this.state === 'TRAPPED') {
            // Vibration animation
            this.vibrationOffset = Math.sin(Date.now() * 0.02) * 2;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.state === 'TRAPPED') {
            ctx.translate(this.vibrationOffset, 0);
        }

        // Body (small dark oval)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings (simple lines)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 0.5;

        // Left wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size * 1.5, -this.size);
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size * 1.5, -this.size);
        ctx.stroke();

        ctx.restore();
    }

    trap(web) {
        this.state = 'TRAPPED';
        this.trappedWeb = web;
    }

    isOffScreen(width, height) {
        const margin = 50;
        return this.x < -margin || this.x > width + margin ||
            this.y < -margin || this.y > height + margin;
    }
}

class MosquitoManager {
    constructor(canvasWidth, canvasHeight, webManager) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.webManager = webManager;

        this.mosquitos = [];
        this.spawnTimer = 0;
        this.spawnInterval = 3000; // 3 seconds
        this.lastSpawnTime = Date.now();
    }

    spawnMosquito() {
        // Random edge: 0=TOP, 1=RIGHT, 2=BOTTOM, 3=LEFT
        const edge = Math.floor(Math.random() * 4);
        let x, y, targetX, targetY;

        switch (edge) {
            case 0: // TOP
                x = Math.random() * this.canvasWidth;
                y = -20;
                targetX = Math.random() * this.canvasWidth;
                targetY = this.canvasHeight + 20;
                break;
            case 1: // RIGHT
                x = this.canvasWidth + 20;
                y = Math.random() * this.canvasHeight;
                targetX = -20;
                targetY = Math.random() * this.canvasHeight;
                break;
            case 2: // BOTTOM
                x = Math.random() * this.canvasWidth;
                y = this.canvasHeight + 20;
                targetX = Math.random() * this.canvasWidth;
                targetY = -20;
                break;
            case 3: // LEFT
                x = -20;
                y = Math.random() * this.canvasHeight;
                targetX = this.canvasWidth + 20;
                targetY = Math.random() * this.canvasHeight;
                break;
        }

        const mosquito = new Mosquito(x, y, targetX, targetY);
        this.mosquitos.push(mosquito);
        console.log('🦟 Mosquito spawned');
    }

    update() {
        // Spawn timer
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnMosquito();
            this.lastSpawnTime = now;
        }

        // Update all mosquitos
        for (let i = this.mosquitos.length - 1; i >= 0; i--) {
            const mosquito = this.mosquitos[i];
            mosquito.update();

            // Check web collision for flying mosquitos
            if (mosquito.state === 'FLYING') {
                const web = this.webManager.findWebAt(mosquito.x, mosquito.y);
                if (web) {
                    mosquito.trap(web);
                    console.log('🕸️ Mosquito trapped!');
                }
            }

            // Remove if off-screen (only if flying)
            if (mosquito.state === 'FLYING' && mosquito.isOffScreen(this.canvasWidth, this.canvasHeight)) {
                this.mosquitos.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const mosquito of this.mosquitos) {
            mosquito.draw(ctx);
        }
    }
}

// Export
window.Mosquito = Mosquito;
window.MosquitoManager = MosquitoManager;
