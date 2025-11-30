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
console.log('🚶 Sistema de movimiento por árbol activado');
gameLoop();
