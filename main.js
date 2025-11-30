/**
 * Colony Sim - Nido de Arañas
 * Loop principal del juego
 */

// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

/**
 * Colony Sim - Nido de Arañas
 * Loop principal del juego
 */

// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Crear árbol en el centro
const tree = new Tree(canvas.width / 2, 50);

// Crear araña en el tronco
const spider = new Spider(canvas.width / 2, 300);

// Crear sistema de movimiento
const movementSystem = new MovementSystem(tree);
const spiderController = new SpiderController(spider, movementSystem);

/**
 * Loop principal del juego
 */
function gameLoop() {
    // Limpiar canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar árbol
    tree.draw(ctx);

    // Actualizar controlador de araña
    spiderController.update();

    // Actualizar y dibujar araña
    spider.update();
    spider.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
console.log('🕷️ Colony Sim iniciado');
console.log('🌳 Árbol procedural generado con', tree.branches.length, 'ramas');
console.log('🕷️ Araña vectorial con', spider.legs.length, 'patas articuladas');
console.log('🚶 Sistema de movimiento por árbol activado');
gameLoop();
