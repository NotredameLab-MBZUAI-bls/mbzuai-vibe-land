// The world map: sea, channels between islands, the lab HQ, the realms' islands,
// an uncharted plot waiting for the next project, and a sea dragon.
import { W, H, HQ, rng, palm } from './pixel.js';

// Where the next realm could go; hidden once a realm sits there.
export const UNCHARTED = { x: 130, y: 282, rx: 70, ry: 38 };
// Where the crew stroll on the HQ plaza (feet positions).
export const PLAZA = { x: HQ.x - 56, y: HQ.y + 10, w: 112, h: 22 };

const SEA = '#2a6f97';
const near = (a, b, pad = 8) => Math.abs(a.x - b.x) < a.rx + b.rx + pad && Math.abs(a.y - b.y) < a.ry + b.ry + pad;
export const unchartedFree = realms => !realms.some(r => near(r.map, UNCHARTED));

const inside = (x, y, o, pad = 0) => ((x - o.x) / (o.rx + pad)) ** 2 + ((y - o.y) / (o.ry + pad)) ** 2 <= 1;
export const hitIsland = (x, y, o) => inside(x, y, o, 4);

const BOAT = ['...w...', '...ww..', '...www.', 'bbbbbbb', '.bbbbb.'];
const BOAT_PAL = { w: '#f4f1e8', b: '#7a4a2a' };

function route(a, b) {
  // A gentle curve from the HQ to an island, sampled every few pixels.
  const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.18, my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
  const pts = [];
  for (let k = 0; k <= 1.0001; k += 0.01) {
    const u = 1 - k;
    pts.push([u * u * a.x + 2 * u * k * mx + k * k * b.x, u * u * a.y + 2 * u * k * my + k * k * b.y]);
  }
  return pts;
}

function drawSea(p, t, islands) {
  p.rect(0, 0, W, H, SEA);
  for (const o of islands) {
    p.oval(o.x, o.y + 2, o.rx + 18, o.ry + 14, '#317ea8');
    p.oval(o.x, o.y + 2, o.rx + 9, o.ry + 7, '#3e93bd');
  }
  const r = rng(7);
  for (let i = 0; i < 150; i++) {
    const x = (r() * W + Math.sin(t * 0.7 + i) * 3) | 0, y = (r() * H) | 0;
    if (islands.some(o => inside(x, y, o, 10))) continue;
    const c = (Math.floor(t * 1.5 + i) % 4) ? '#5fa9cf' : '#8fd0ea';
    p.px(x, y, c); p.px(x + 1, y - 1, c); p.px(x + 2, y - 1, c); p.px(x + 3, y, c);
  }
}

function drawChannels(p, t, realms, islands) {
  realms.forEach((rl, i) => {
    const pts = route(HQ, rl.map).filter(([x, y]) => !islands.some(o => inside(x, y, o, 2)));
    const shift = Math.floor(t * 6) % 3;
    pts.forEach(([x, y], k) => { if ((k + shift) % 3 === 0) p.rect(x, y, 2, 2, 'rgba(240,250,255,0.75)'); });
    if (pts.length < 2) return;
    // A boat (a Nextflow task, if you like) shuttles along each channel.
    const ph = (t * 0.04 + i * 0.37) % 2, k = ph < 1 ? ph : 2 - ph;
    const j = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1)));
    const [x, y] = pts[j], [x2] = pts[j + 1];
    const goingRight = (x2 > x) === (ph < 1);
    p.alpha(0.3, () => p.oval(x, y + 3, 4, 1, '#0b2a3d'));
    p.pattern(BOAT, BOAT_PAL, x - 3, y - 4 + (Math.sin(t * 3 + i) > 0.6 ? 1 : 0), { flip: !goingRight });
  });
}

function drawHQ(p, t) {
  const { x, rx, ry } = HQ, y0 = HQ.y, y = y0 + 10; // the lab sits on the island, not on its rim
  p.island(x, y0, rx, ry, { ground: '#6fbf5a' });
  p.oval(x, y0 + 14, 66, 24, '#e9dcc0');
  p.oval(x, y0 + 14, 60, 20, '#efe4cc');
  // The lab: twin towers, a rose window with a turning helix (yes, it's a pun on the PI's name).
  const stone = '#ddd6c6', shade = '#b9b09d', roof = '#3e4a5c';
  p.rect(x - 26, y - 44, 52, 30, stone);
  p.rect(x - 26, y - 16, 52, 2, shade);
  for (const tx of [x - 36, x + 24]) {
    p.rect(tx, y - 60, 12, 46, stone);
    p.rect(tx + 10, y - 60, 2, 46, shade);
    for (let k = 0; k < 9; k++) p.rect(tx + 6 - (k >> 1) - 1, y - 61 - 9 + k, 2 + 2 * (k >> 1), 1, roof);
    p.rect(tx + 4, y - 50, 4, 6, '#2b3a67');
    p.px(tx + 5, y - 49, '#ffd66b');
  }
  const fx = x - 30 + 1;
  p.rect(fx, y - 80, 1, 12, '#5b4636');
  for (let k = 0; k < 6; k++) p.rect(fx + 1 + k, y - 80 + Math.round(Math.sin(t * 5 + k * 0.7) * 0.8), 1, 4, k % 2 ? '#14b8a6' : '#2dd4bf');
  p.disc(x, y - 33, 8, '#2b3a67');
  p.disc(x, y - 33, 7, '#1c2547');
  for (let dy = -6; dy <= 6; dy++) {
    const s = Math.sin(dy * 0.7 + t * 2.5) * 4;
    p.px(x + s, y - 33 + dy, '#ff6b6b');
    p.px(x - s, y - 33 + dy, '#4ecdc4');
    if (dy % 2 === 0) p.line(x + s, y - 33 + dy, x - s, y - 33 + dy, 'rgba(255,255,255,0.25)');
  }
  p.rect(x - 5, y - 24, 10, 10, '#4a3527');
  p.rect(x - 4, y - 23, 8, 9, '#6b4c35');
  // Palms and lamps around the plaza.
  for (const [px, py] of [[x - 70, y0 + 4], [x + 68, y0 + 2], [x - 58, y0 + 30], [x + 56, y0 + 32]]) palm(p, px, py, t);
  for (const lx of [x - 44, x + 44]) {
    p.rect(lx, y - 10, 1, 12, '#3b3b3b');
    p.rect(lx - 1, y - 12, 3, 2, (Math.floor(t * 2) % 5) ? '#ffe08a' : '#fff4c4');
  }
}

function drawUncharted(p, t) {
  const { x, y, rx, ry } = UNCHARTED;
  for (let a = 0; a < Math.PI * 2; a += 0.08) {
    if (Math.floor(a * 12 + t * 2) % 2) continue;
    p.rect(x + Math.cos(a) * rx, y + Math.sin(a) * ry, 2, 2, 'rgba(230,245,255,0.55)');
  }
  p.alpha(0.18 + 0.06 * Math.sin(t * 1.5), () => p.oval(x, y, rx - 6, ry - 6, '#e8f6ff'));
  const Q = ['.qqqq.', 'qq..qq', '....qq', '...qq.', '..qq..', '..qq..', '......', '..qq..'];
  p.pattern(Q, { q: '#f4f9ff' }, x - 9, y - 12 + Math.round(Math.sin(t * 2) * 2), { scale: 3 });
}

function drawDragon(p, t) {
  // Here be dragons: the serpent surfaces every 14 seconds.
  const cycle = t % 14;
  if (cycle > 6) return;
  const rise = Math.sin((cycle / 6) * Math.PI) * 7, wx = 290, wy = 334;
  const { ctx } = p;
  ctx.save();
  ctx.beginPath(); ctx.rect(wx - 40, wy - 30, 90, 30); ctx.clip();
  for (const [dx, r] of [[-24, 5], [-10, 6], [4, 5]]) p.disc(wx + dx, wy + 7 - rise, r, '#2e8b57');
  p.disc(wx + 22, wy + 2 - rise, 6, '#2e8b57');
  p.rect(wx + 26, wy - 1 - rise, 8, 4, '#2e8b57');
  p.px(wx + 23, wy - 1 - rise, '#ffde59');
  p.px(wx + 23, wy - 2 - rise, '#ffde59');
  for (const dx of [-24, -10, 4, 16]) p.px(wx + dx, wy + 1 - rise - (dx === 16 ? 7 : 5), '#a7f3d0');
  ctx.restore();
  for (let dx = -32; dx < 36; dx += 3) p.px(wx + dx + (Math.floor(t * 6) % 3), wy, '#e6f6ff');
}

function drawCompass(p, t) {
  const x = 606, y = 322, c = '#f1e3c0';
  p.line(x, y - 12, x, y + 12, c); p.line(x - 12, y, x + 12, y, c);
  p.line(x - 6, y - 6, x + 6, y + 6, '#c9b98f'); p.line(x - 6, y + 6, x + 6, y - 6, '#c9b98f');
  p.disc(x, y, 2, c);
  p.rect(x - 1, y - 15, 3, 3, Math.floor(t * 2) % 2 ? '#ef4444' : '#f87171');
}

export function drawClouds(p, t) {
  const r = rng(21);
  for (let i = 0; i < 4; i++) {
    const span = W + 120, x = ((r() * span + t * (4 + i * 1.5)) % span) - 60, y = 60 + r() * 240;
    p.alpha(0.18, () => { p.oval(x + 6, y + 22, 22, 5, '#0b2a3d'); });
    p.alpha(0.85, () => { p.disc(x - 10, y + 2, 7, '#ffffff'); p.disc(x, y - 2, 9, '#ffffff'); p.disc(x + 11, y + 2, 6, '#ffffff'); p.rect(x - 16, y + 2, 32, 7, '#ffffff'); });
  }
}

export function drawFrame(p) {
  p.rect(0, 0, W, 4, '#3b2a1a'); p.rect(0, H - 4, W, 4, '#3b2a1a');
  p.rect(0, 0, 4, H, '#3b2a1a'); p.rect(W - 4, 0, 4, H, '#3b2a1a');
  p.rect(4, 4, W - 8, 1, '#d9b26f'); p.rect(4, H - 5, W - 8, 1, '#d9b26f');
  p.rect(4, 4, 1, H - 8, '#d9b26f'); p.rect(W - 5, 4, 1, H - 8, '#d9b26f');
}

export function drawOverworld(p, t, realms, hover) {
  const islands = [HQ, ...realms.map(r => r.map)];
  const free = unchartedFree(realms);
  if (free) islands.push(UNCHARTED);
  drawSea(p, t, islands);
  drawChannels(p, t, realms, islands);
  drawDragon(p, t);
  drawCompass(p, t);
  if (free) drawUncharted(p, t);
  drawHQ(p, t);
  for (const r of realms) {
    const { x, y, rx, ry } = r.map;
    if (hover === r) p.alpha(0.35 + 0.15 * Math.sin(t * 6), () => p.oval(x, y + 1, rx + 7, ry + 7, '#fff7cc'));
    p.at(x, y, () => {
      try { r.drawIsland(p, t); } catch (e) { console.warn(`realms/${r.id}: drawIsland failed`, e); }
    });
  }
}
