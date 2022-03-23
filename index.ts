// Import stylesheets
import './style.css';

// Write TypeScript code!
import SimplexNoise from 'simplex-noise';

let alteration = 0;

const width = window.outerWidth;
const height = window.innerHeight;

let simplex = new SimplexNoise();
const hsla = (h: number, s: number, l: number, a: number) =>
  `hsl(${h}, ${s}%, ${l}%, ${a})`;
const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');
ctx.fillStyle = rgba(0, 0, 0, 0);
ctx.fillRect(0, 0, width, height);

// modify these to change render
const constants = Object.freeze({
  count: 100, // increasing this can cause browser to crash
  margin: width * 0.2, // * max 1
  blur: 0.2, // max 1
  pointWidth: 3,
  pointHeight: 3,
  rotationIncrement: 0.00005,
  heightIncrement: 0.000401,
  widthIncrement: 0.00001,
});

const createPointsState = () => {
  const { count } = constants;

  const rotation = 0;
  const points = [];
  for (let x = 0; x < count; x += 1) {
    const defaultHue = (count - x) * (360 / 100);

    for (let y = 0; y < count; y += 1) {
      points.push({
        h: defaultHue,
        x: (x + 1) / count,
        y: (y + 1) / count,
        r: 0,
      });
    }
  }

  return {
    rotation,
    points,
  };
};

let pointsState = createPointsState();
const globalState = {
  alpha: 0,
};

function setState() {
  if (globalState.alpha < 1) {
    globalState.alpha += 0.01;
  }
  const userAlteration = alteration / 20000;

  pointsState.points = pointsState.points.map(({ x, y, r, h }) => {
    const noise = simplex.noise2D(x * x, y * y);

    const xAlteration = x + noise * constants.widthIncrement;
    const yAlteration = y + noise * constants.heightIncrement;
    const rAlteration = r + noise * constants.rotationIncrement;

    return {
      h: h + 1,
      x: userAlteration === 0 ? x : xAlteration + userAlteration,
      y: userAlteration === 0 ? y : yAlteration + userAlteration,
      r: userAlteration === 0 ? r : rAlteration + userAlteration,
    };
  });
}

function cleanSlate() {
  let blur = constants.blur;

  if (alteration === 0) {
    blur *= 2;
  }

  ctx.fillStyle = rgba(255, 255, 255, blur);
  ctx.fillRect(0, 0, width, height);
}

function renderGrid() {
  const { margin } = constants;
  ctx.save();

  pointsState.points.forEach(({ x, y, r, h }) => {
    ctx.rotate((r * Math.PI) / 180);

    ctx.fillStyle = hsla(h, 50, 80, globalState.alpha);
    ctx.fillRect(
      lerp(margin, width - margin, x),
      lerp(margin, height - margin, y),
      constants.pointWidth,
      constants.pointHeight
    );
  });

  ctx.restore();
}

function render() {
  setState();
  cleanSlate();
  renderGrid();

  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

(() => {
  const reverseButton = document.getElementById('reverse-button');
  const plusButton = document.getElementById('plus-button');
  const minusButton = document.getElementById('minus-button');
  const resetButton = document.getElementById('reset-button');
  const pauseButton = document.getElementById('pause-button');

  reverseButton.onclick = () => {
    reverseButton.innerHTML = reverseButton.innerHTML === '⏩' ? '⏪' : '⏩';

    alteration = -alteration;
  };

  plusButton.onclick = () => {
    alteration = Math.min(4, alteration + 1);

    if (alteration === 0) {
      alteration = 1;
    }
  };

  minusButton.onclick = () => {
    alteration = Math.max(-4, alteration - 1);

    if (alteration === 0) {
      alteration = -1;
    }
  };

  resetButton.onclick = () => {
    pointsState = createPointsState();
    simplex = new SimplexNoise();
    alteration = 0;
  };

  pauseButton.onclick = () => {
    pauseButton.innerHTML = pauseButton.innerHTML === '▶️' ? '⏸' : '▶️';

    if (alteration === 0) {
      alteration += 1;
    } else {
      alteration = 0;
    }
  };
})();
