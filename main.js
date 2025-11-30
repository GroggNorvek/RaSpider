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

// Crear Matriarch en el nido
const nestCenterX = tree.nest.x;
const nestCenterY = tree.nest.y + 100; // Un poco abajo del centro
const matriarch = new Spider(nestCenterX, nestCenterY, 'Matriarch');

// Crear Worker en el tronco
const worker = new Spider(canvas.width * 0.83, 300, 'Worker');

// Crear sistema de movimiento
const movementSystem = new MovementSystem(tree);
const matriarchController = new MatriarchController(matriarch, movementSystem, tree);
const workerController = new SpiderController(worker, movementSystem);

// Array de arañas para el sistema de webs
const spiders = [matriarch, worker];

// Crear sistema de telas de araña (pasar array de arañas)
const webManager = new WebManager(tree, spiders);
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

    // Actualizar controladores
    matriarchController.update();
    workerController.update();

    // Actualizar y dibujar arañas
    matriarch.update();
    matriarch.draw(ctx);

    worker.update();
    worker.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
console.log('🕷️ Colony Sim iniciado');
console.log('🌳 Árbol procedural generado con', tree.branches.length, 'ramas');
console.log('👑 Matriarch (grande) en el nido');
console.log('🐜 Worker (pequeña) en el tronco');
console.log('🚶 Sistema de movimiento activado');
console.log('🕸️ Sistema de telas de araña activado');
gameLoop();
