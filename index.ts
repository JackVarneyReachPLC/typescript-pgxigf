// Import stylesheets
import './style.css';

// Write TypeScript code!
import SimplexNoise from 'simplex-noise';

const width = window.innerWidth;
const height = window.innerHeight;

const simplex = new SimplexNoise();
const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

const constants = Object.freeze({
  count: 100,
  margin: 0,
});

const createPointsState = () => {
  const { count } = constants;

  const rotation = 0;
  const hue = 0;
  const points = [];
  for (let x = 0; x < count; x += 1) {
    for (let y = 0; y < count; y += 1) {
      points.push({
        x: (x + 1) / count,
        y: (y + 1) / count,
        r: 0,
      });
    }
  }

  return {
    rotation,
    hue,
    points,
  };
};

const pointsState = createPointsState();
function setState() {
  pointsState.hue += 1;

  pointsState.points = pointsState.points.map(({ x, y, r }) => ({
    x: x + simplex.noise2D(x, y) * 0.001,
    y: y + simplex.noise2D(x, y) * 0.0001,
    // r: r - simplex.noise2D(x, y) * 0.001,
    r: r,
  }));
}
setInterval(setState, 1);

function render() {
  function cleanSlate() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  }

  function renderGrid() {
    const { margin } = constants;
    ctx.save();

    pointsState.points.forEach(({ x, y, r }) => {
      ctx.rotate((r * Math.PI) / 180);

      if (Math.random() > 0.999999) {
        console.log({ x, y });
      }

      ctx.fillStyle = hsl(pointsState.hue, 100, x * 100);
      ctx.fillRect(
        lerp(margin, width - margin, x),
        lerp(margin, height - margin, y),
        2,
        1
      );
    });

    ctx.restore();
  }

  cleanSlate();

  renderGrid();

  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
