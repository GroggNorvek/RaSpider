/**
 * Colony Sim - Nido de Arañas
 * Loop principal del juego
 */

// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Crear árbol (tercio derecho)
const tree = new Tree(canvas.width, canvas.height);

// Crear araña en el tronco
const spider = new Spider(canvas.width * 0.83, 300);

// Crear sistema de movimiento
const movementSystem = new MovementSystem(tree);
const controller = new SpiderController(spider, movementSystem);

// Crear sistema de telas de araña
const webManager = new WebManager(tree);
const inputHandler = new InputHandler(canvas, webManager);

/**
 * Loop principal del juego
 */
function gameLoop() {
    // Limpiar canvas (blanco)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar árbol
    tree.draw(ctx);

    // Actualizar y dibujar sistema de webs
    webManager.update();
    webManager.draw(ctx);

    // Dibujar preview del input
    inputHandler.draw(ctx);

    // Actualizar controlador (mueve la araña)
    controller.update();

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
console.log('🕸️ Sistema de telas de araña activado');
gameLoop();
