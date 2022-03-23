// Import stylesheets
import './style.css';

// Write TypeScript code!

const canvas = document.getElementById('#canvas') as HTMLCanvasElement;

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'black';

ctx.fillRect(40, 40, 40, 40);
