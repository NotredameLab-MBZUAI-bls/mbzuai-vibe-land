// Human Phenotype Project: under construction.
// Island: a small city with cranes and a scanning beacon.
// Scene: a night plaza where a hologram body is scanned while the towers go up.
import { hazard } from '../../src/pixel.js';

const PROGRESS = 10;
const HOLO = '#5ef2ff';
const BODY = [
  '.....xxxx.....', '....xxxxxx....', '....xxxxxx....', '....xxxxxx....', '.....xxxx.....',
  '......xx......', '..xxxxxxxxxx..', '.xxxxxxxxxxxx.', '.xxxxxxxxxxxx.', 'xxx.xxxxxx.xxx',
  'xx..xxxxxx..xx', 'xx..xxxxxx..xx', 'xx..xxxxxx..xx', 'xx..xxxxxx..xx', 'xx..xxxxxx..xx',
  'xx..xxxxxx..xx', 'x...xxxxxx...x', '....xxxxxx....', '....xxxxxx....', '....xx..xx....',
  '....xx..xx....', '....xx..xx....', '....xx..xx....', '....xx..xx....', '....xx..xx....',
  '....xx..xx....', '....xx..xx....', '...xxx..xxx...',
];

function tower(p, x, y, w, h, t, lit, seed) {
  p.rect(x, y - h, w, h, '#1e293b');
  p.rect(x + w - 2, y - h, 2, h, '#0f172a');
  for (let wy = y - h + 4; wy < y - 4; wy += 6)
    for (let wx = x + 3; wx < x + w - 4; wx += 5)
      if (((wx * 7 + wy * 13 + seed) % 5) < lit) p.rect(wx, wy, 2, 3, (Math.floor(t * 0.5 + wx + wy) % 9) ? '#fde68a' : '#fef3c7');
}

function scaffold(p, x, y, w, h) {
  for (let sx = x; sx <= x + w; sx += 10) p.rect(sx, y - h, 1, h, '#a16207');
  for (let sy = y; sy >= y - h; sy -= 12) p.rect(x, sy, w + 1, 1, '#a16207');
  for (let sy = y; sy > y - h; sy -= 12) p.line(x, sy, x + w, sy - 12, '#854d0e');
}

function cone(p, x, y) {
  p.rect(x - 1, y - 6, 3, 2, '#f97316'); p.rect(x - 2, y - 4, 5, 2, '#fafafa'); p.rect(x - 3, y - 2, 7, 2, '#f97316'); p.rect(x - 4, y, 9, 1, '#7c2d12');
}

export default {
  id: 'hpp',
  name: 'Human Phenotype Project',
  tag: 'HPP',
  status: 'construction',
  progress: PROGRESS,
  blurb: 'Under construction: deep phenotypes, from a scan to a story.',
  about: [
    'This realm is still being built. The towers go up as the lab writes in what the project is, who is on it and what comes next.',
    'Working on HPP? Add a paragraph here, list the quests, link the repos, and put yourself in the party (see AGENTS.md).',
  ],
  quests: [
    { title: 'Write the realm: what HPP is and our part in it', done: false },
    { title: 'List the first quests and the people on them', done: false },
    { title: 'Link the repos and docs', done: false },
  ],
  links: [],
  map: { x: 500, y: 282, rx: 84, ry: 44 },
  walk: { x: 40, y: 296, w: 330, h: 44 },

  drawIsland(p, t) {
    p.island(0, 0, 84, 44, { ground: '#8a9a7b', sand: '#e8d9a8' });
    p.oval(0, 2, 70, 32, '#9ca3af');
    tower(p, -56, 18, 16, 30, t, 2, 1); tower(p, -36, 12, 14, 44, t, 3, 2); tower(p, 36, 16, 14, 36, t, 2, 3);
    scaffold(p, 52, 22, 20, 28);
    // Beacon: a little hologram person, scanned top to bottom.
    p.rect(-10, 18, 20, 4, '#334155');
    p.alpha(0.6, () => p.pattern(BODY, { x: HOLO }, -7, -12));
    const sy = -12 + ((t * 14) % 30);
    p.alpha(0.9, () => p.rect(-10, sy, 20, 1, '#ffffff'));
    // Crane.
    p.rect(20, -30, 2, 44, '#f59e0b'); p.rect(4, -30, 34, 2, '#f59e0b');
    p.rect(30, -28, 1, 10 + Math.sin(t) * 4, '#374151');
    hazard(p, -26, 28, 52, 4, t);
    cone(p, -38, 30); cone(p, 34, 30);
  },

  drawScene(p, t) {
    // Night sky with twinkling stars, then a skyline.
    p.rect(0, 0, 640, 360, '#0b1026');
    p.rect(0, 120, 640, 120, '#111a3a');
    for (let i = 0; i < 70; i++) {
      const x = (i * 97) % 640, y = (i * 53) % 150;
      if ((Math.floor(t * 2) + i) % 7) p.px(x, y, i % 5 ? '#94a3b8' : '#e2e8f0');
    }
    p.disc(560, 50, 14, '#e2e8f0'); p.disc(566, 46, 13, '#0b1026');
    [[10, 60, 120], [80, 46, 170], [140, 70, 110], [430, 54, 160], [500, 70, 120], [580, 50, 190]]
      .forEach(([x, w, h], i) => tower(p, x, 260, w, h, t, 2, i));
    // The new tower, still in scaffolding, its height set by the project's progress.
    const newH = 40 + 160 * PROGRESS / 100;
    tower(p, 330, 260, 60, newH, t, 0, 9);
    scaffold(p, 326, 260, 70, newH + 50);
    p.rect(398, 20, 5, 240, '#f59e0b');
    p.rect(290, 16, 113, 5, '#f59e0b');
    const hook = 30 + (Math.sin(t * 0.6) * 0.5 + 0.5) * 120;
    p.rect(350, 21, 1, hook, '#cbd5e1');
    p.rect(340, 21 + hook, 22, 5, '#64748b');
    // Plaza.
    p.rect(0, 260, 640, 100, '#1f2937');
    for (let x = 0; x < 640; x += 32) p.rect(x, 260, 1, 100, '#273244');
    // Hologram platform: a body scanned top to bottom, readouts on the side.
    const hx = 210, hy = 252;
    p.oval(hx, hy + 4, 46, 8, '#0e7490');
    p.oval(hx, hy + 2, 40, 6, '#155e75');
    p.alpha(0.15, () => { p.ctx.fillStyle = HOLO; p.ctx.beginPath(); p.ctx.moveTo(hx - 36, hy); p.ctx.lineTo(hx + 36, hy); p.ctx.lineTo(hx + 30, hy - 130); p.ctx.lineTo(hx - 30, hy - 130); p.ctx.fill(); });
    const flick = 0.55 + 0.1 * Math.sin(t * 17);
    p.alpha(flick, () => p.pattern(BODY, { x: HOLO }, hx - 28, hy - 120, { scale: 4 }));
    const sy = hy - 122 + ((t * 40) % 124);
    p.alpha(0.9, () => p.rect(hx - 34, sy, 68, 2, '#ffffff'));
    // Readouts: a heartbeat trace and bars that tick along.
    p.rect(40, 120, 92, 50, '#0b1220'); p.rect(41, 121, 90, 48, '#0f1a2e');
    let prev = null;
    for (let x = 0; x < 86; x++) {
      const ph = (x + t * 40) % 43, y = ph > 20 && ph < 24 ? (ph < 22 ? -14 : 10) : Math.sin(ph) * 1;
      const pt = [43 + x, 146 + y];
      if (prev) p.line(prev[0], prev[1], pt[0], pt[1], '#4ade80');
      prev = pt;
    }
    p.rect(290, 120, 64, 50, '#0b1220'); p.rect(291, 121, 62, 48, '#0f1a2e');
    for (let i = 0; i < 7; i++) {
      const h = 8 + Math.abs(Math.sin(t * 0.8 + i * 1.7)) * 30;
      p.rect(296 + i * 8, 164 - h, 5, h, i % 2 ? HOLO : '#a78bfa');
    }
    hazard(p, 262, 300, 130, 10, t);
    for (const x of [252, 402]) cone(p, x, 312);
  },
};
