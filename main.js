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
 * Loop principal del juego
 */
function gameLoop() {
    // Limpiar canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto temporal
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Colony Sim - Nido de Arañas', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillText('Fase 1: Setup Inicial Completo', canvas.width / 2, canvas.height / 2 + 30);

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
console.log('🕷️ Colony Sim iniciado');
gameLoop();
