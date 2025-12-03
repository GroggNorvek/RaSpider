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

// Crear 3 Workers en el tronco
const workers = [
    new Spider(canvas.width * 0.83, 250, 'Worker'),
    new Spider(canvas.width * 0.83, 350, 'Worker'),
    new Spider(canvas.width * 0.83, 450, 'Worker')
];

// Array de arañas para el sistema de webs
const spiders = [matriarch, ...workers];

// Crear sistema de movimiento
const movementSystem = new MovementSystem(tree);
const matriarchController = new MatriarchController(matriarch, movementSystem, tree);

// Crear controladores para cada Worker
const workerControllers = workers.map(worker => new SpiderController(worker, movementSystem));

const webManager = new WebManager(tree, spiders);
const inputHandler = new InputHandler(canvas, webManager);

// Crear sistema de mosquitos (presas)
const mosquitoManager = new MosquitoManager(canvas.width, canvas.height, webManager);

// Conectar webManager con movementSystem para detección de webs
movementSystem.setWebManager(webManager);

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

    // Actualizar y dibujar mosquitos
    mosquitoManager.update();
    mosquitoManager.draw(ctx);

    // Dibujar preview del input
    inputHandler.draw(ctx);

    // Actualizar controladores
    matriarchController.update();
    workerControllers.forEach(controller => controller.update());

    // Actualizar y dibujar arañas
    matriarch.update();
    matriarch.draw(ctx);

    workers.forEach(worker => {
        worker.update();
        worker.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
console.log('🕷️ Colony Sim iniciado');
console.log('🌳 Árbol procedural generado con', tree.branches.length, 'ramas');
console.log('👑 Matriarch (grande) en el nido');
console.log(`🐜 ${workers.length} Workers (pequeñas) en el tronco`);
console.log('🚶 Sistema de movimiento activado');
console.log('🕸️ Sistema de telas de araña activado');
gameLoop();
