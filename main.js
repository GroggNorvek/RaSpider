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

// Crear nido (dentro del tronco)
const nest = new Nest(tree);

// Crear Matriarch en el nido
const nestCenterX = nest.x;
const nestCenterY = nest.y;
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

const webManager = new WebManager(tree, nest, spiders);
const inputHandler = new InputHandler(canvas, webManager);

// Crear sistema de mosquitos (presas)
const mosquitoManager = new MosquitoManager(canvas.width, canvas.height, webManager);

// Crear NavMesh de alta densidad
console.log('🕸️ Inicializando NavMesh...');
const navMesh = new NavMesh(tree, canvas.width, canvas.height, 15); // 15px spacing para movimiento exquisito
navMesh.buildMesh();

// Conectar webManager con movementSystem para detección de webs
movementSystem.setWebManager(webManager);

// Conectar NavMesh con movementSystem
movementSystem.setNavMesh(navMesh);

// Conectar NavMesh con webManager para actualizaciones dinámicas
webManager.setNavMesh(navMesh);

// Debug mode para visualizar NavMesh
let debugMode = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') {
        debugMode = !debugMode;
        console.log(`🐛 Debug mode: ${debugMode ? 'ON' : 'OFF'}`);
    }
});

/**
 * Loop principal del juego
 */
function gameLoop() {
    // Limpiar canvas (blanco)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar árbol
    tree.draw(ctx);

    // Dibujar NavMesh si debug está activado
    if (debugMode) {
        navMesh.draw(ctx, true);
    }

    // Dibujar nido (ANTES de las webs para que las webs aparezcan encima)
    nest.draw(ctx);

    // Actualizar y dibujar sistema de webs
    webManager.update();

    // Actualizar vibración de webs según mosquitos atrapados
    for (const web of webManager.webs) {
        web.vibration = 0; // Reset vibration
    }
    for (const mosquito of mosquitoManager.mosquitos) {
        if (mosquito.state === 'TRAPPED' && mosquito.trappedWeb) {
            mosquito.trappedWeb.vibration = Math.sin(Date.now() * 0.02) * 1.5;
        }
    }

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
