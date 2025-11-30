/**
 * Colony Sim - Nido de Arañas
 * Loop principal del juego
 */

// Configuración del canvas
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

/**
 * Loop principal del juego
 */
function gameLoop() {
    // Limpiar canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar árbol
    tree.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
console.log('🕷️ Colony Sim iniciado');
console.log('🌳 Árbol procedural generado con', tree.branches.length, 'ramas');
gameLoop();
