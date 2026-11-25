// Pixel painter: the only drawing API realms and crew need.
// Every coordinate is in world pixels (the canvas is 640x360, scaled up crisp).

export const W = 640, H = 360;
// The lab's home island on the world map; realms must not overlap it.
export const HQ = { x: 318, y: 196, rx: 84, ry: 46 };

// Deterministic random numbers, so decorations stay put between frames.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const spriteCache = new WeakMap();

// A frame is an array of equal-length strings; each char is a palette key, '.' is transparent.
function frameCanvas(rows, palette) {
  let byPalette = spriteCache.get(rows);
  if (!byPalette) spriteCache.set(rows, (byPalette = new WeakMap()));
  let c = byPalette.get(palette);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.' || !palette[ch]) return;
    g.fillStyle = palette[ch];
    g.fillRect(x, y, 1, 1);
  }));
  byPalette.set(palette, c);
  return c;
}

export function painter(ctx) {
  const p = {
    ctx,
    rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    px(x, y, c) { p.rect(x, y, 1, 1, c); },
    // Filled ellipse drawn as horizontal spans, so edges stay pixel-sharp.
    oval(cx, cy, rx, ry, c) {
      cx = Math.round(cx); cy = Math.round(cy);
      for (let dy = -ry; dy <= ry; dy++) {
        const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
        p.rect(cx - w, cy + dy, 2 * w + 1, 1, c);
      }
    },
    disc(cx, cy, r, c) { p.oval(cx, cy, r, r, c); },
    line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        p.px(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    // Draw a string-map picture (see crew/_template.js) at x,y.
    pattern(rows, palette, x, y, { flip = false, scale = 1 } = {}) {
      const c = frameCanvas(rows, palette);
      ctx.save();
      ctx.translate(Math.round(x) + (flip ? c.width * scale : 0), Math.round(y));
      ctx.scale(flip ? -scale : scale, scale);
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    },
    alpha(a, fn) { const o = ctx.globalAlpha; ctx.globalAlpha = o * a; fn(); ctx.globalAlpha = o; },
    at(x, y, fn) { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); fn(); ctx.restore(); },
    // An island: sand rim, ground, darker lip underneath. Origin is its centre.
    island(cx, cy, rx, ry, { ground = '#5fae4b', sand = '#e8d39a', lip = '#3a6f8f' } = {}) {
      p.oval(cx, cy + 3, rx + 2, ry + 1, lip);
      p.oval(cx, cy, rx + 2, ry + 2, sand);
      p.oval(cx, cy - 1, rx - 3, ry - 3, ground);
    },
  };
  return p;
}

// Yellow-black construction stripes, used by realms that are still being built.
export function hazard(p, x, y, w, h, t = 0) {
  const { ctx } = p;
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.round(x), Math.round(y), w, h);
  ctx.clip();
  p.rect(x, y, w, h, '#f5c518');
  const off = Math.floor(t * 8) % 8;
  for (let i = -h - 8; i < w + 8; i += 8)
    for (let k = 0; k < 4; k++) p.line(x + i + k + off, y + h - 1, x + i + k + off + h - 1, y, '#1d1d1d');
  ctx.restore();
}

// A palm tree with its feet at x,y; s scales it.
export function palm(p, x, y, t, s = 1) {
  const tw = s > 1 ? s + 1 : 2, top = y - 12 * s, cx = x + (tw >> 1);
  p.rect(x, top, tw, 12 * s, '#8a5a32');
  for (let k = 3 * s; k < 12 * s; k += 3 * s) p.rect(x, top + k, tw, 1, '#6e4426');
  const sway = Math.round(Math.sin(t * 1.3 + x) * s);
  for (const [dx, dy] of [[-6, 1], [6, 1], [-4, -2], [4, -2], [0, -3]])
    for (let k = 0; k < s; k++) p.line(cx, top + k, cx + dx * s + sway, top + dy * s + 2 + k, k ? '#267a30' : '#2f8f3a');
  p.rect(cx - (s >> 1), top, s, s, '#5a3b1e');
}
