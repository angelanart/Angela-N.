const TAU = Math.PI * 2;

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function drawHero(canvas, time) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, width, height);

  const count = Math.floor(width / 10);
  for (let i = 0; i < count; i += 1) {
    const x = (i / count) * width;
    const phase = time * 0.00028 + i * 0.17;
    const hue = i % 5 === 0 ? "#e6533f" : i % 7 === 0 ? "#d6a62a" : "#f8f5ef";
    ctx.beginPath();
    for (let y = -20; y <= height + 24; y += 18) {
      const drift = Math.sin(y * 0.009 + phase) * 42 + Math.cos(i * 0.22 + phase) * 28;
      const px = x + drift + Math.sin(y * 0.022 + time * 0.0002) * 14;
      if (y === -20) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = hue;
    ctx.globalAlpha = i % 5 === 0 ? 0.42 : 0.16;
    ctx.lineWidth = i % 5 === 0 ? 1.4 : 0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawField(canvas, time) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < 56; row += 1) {
    const y = 24 + row * ((height - 48) / 55);
    ctx.beginPath();
    for (let x = 16; x <= width - 16; x += 8) {
      const wave =
        Math.sin(x * 0.018 + row * 0.31 + time * 0.00045) * 18 +
        Math.cos(x * 0.041 + row * 0.18) * 8;
      if (x === 16) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = row % 9 === 0 ? "#e6533f" : "#151514";
    ctx.globalAlpha = row % 9 === 0 ? 0.7 : 0.24;
    ctx.lineWidth = row % 9 === 0 ? 1.6 : 0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBloom(canvas, time) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.fillStyle = "#151514";
  ctx.fillRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;

  for (let ring = 0; ring < 10; ring += 1) {
    const points = 18 + ring * 7;
    const radius = (ring / 9) * maxR + 18;
    for (let i = 0; i < points; i += 1) {
      const angle = (i / points) * TAU + ring * 0.22 + time * 0.00018;
      const pulse = Math.sin(time * 0.0012 + i * 0.5 + ring) * 0.5 + 0.5;
      const x = cx + Math.cos(angle) * (radius + pulse * 16);
      const y = cy + Math.sin(angle) * (radius + pulse * 16);
      ctx.beginPath();
      ctx.arc(x, y, 1.8 + pulse * 4.5, 0, TAU);
      ctx.fillStyle = ring % 3 === 0 ? "#e6533f" : ring % 3 === 1 ? "#d6a62a" : "#41c496";
      ctx.globalAlpha = 0.18 + pulse * 0.55;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawAtlas(canvas, time) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.fillStyle = "#f8f5ef";
  ctx.fillRect(0, 0, width, height);
  const cell = Math.max(12, Math.floor(width / 34));

  for (let y = 0; y < height + cell; y += cell) {
    for (let x = 0; x < width + cell; x += cell) {
      const value =
        Math.sin(x * 0.028 + time * 0.00035) +
        Math.cos(y * 0.035 - time * 0.00025) +
        Math.sin((x + y) * 0.014);
      const alpha = Math.max(0.06, Math.min(0.82, (value + 3) / 6));
      ctx.fillStyle = value > 1.35 ? "#2058d8" : value < -0.6 ? "#0b8f65" : "#151514";
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, cell - 2, cell - 2);
    }
  }

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#e6533f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const y = height * 0.52 + Math.sin(x * 0.026 + time * 0.0005) * height * 0.17;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

const drawers = {
  hero: drawHero,
  field: drawField,
  bloom: drawBloom,
  atlas: drawAtlas,
};

const canvases = [...document.querySelectorAll("canvas[data-art]")];
let rafId = 0;

function frame(time) {
  for (const canvas of canvases) {
    drawers[canvas.dataset.art](canvas, time);
  }
  rafId = requestAnimationFrame(frame);
}

window.addEventListener("resize", () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
});

rafId = requestAnimationFrame(frame);
