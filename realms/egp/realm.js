// Emirati Genome Project: under construction.
// Island: desert dunes, palms, a falcon, and a helix tower in scaffolding.
// Scene: golden-hour desert where a crane is still stacking the DNA tower.
import { hazard, palm } from '../../src/pixel.js';

const PROGRESS = 15;
const BASES = ['#ef4444', '#22c55e', '#3b82f6', '#eab308']; // A, T, G, C

function falcon(p, x, y, t, s = 1) {
  const up = Math.floor(t * 6) % 2;
  p.rect(x - s, y, 3 * s, 2 * s, '#5b3a1e');
  p.rect(x - 4 * s, y - (up ? s : -s), 3 * s, s, '#7c5530');
  p.rect(x + 2 * s, y - (up ? s : -s), 3 * s, s, '#7c5530');
  p.rect(x + 2 * s, y, s, s, '#facc15');
}

function helix(p, x, base, height, t, w, step) {
  for (let k = 0; k * step < height; k++) {
    const y = base - k * step, s = Math.sin(k * 0.55 + t * 1.5) * w;
    p.line(x - s, y, x + s, y, BASES[k % 4]);
    p.rect(x - s - 1, y - 1, 3, 3, '#f8fafc');
    p.rect(x + s - 1, y - 1, 3, 3, '#cbd5e1');
  }
}

export default {
  id: 'egp',
  name: 'Emirati Genome Project',
  tag: 'EGP',
  status: 'construction',
  progress: PROGRESS,
  blurb: 'Under construction: the genomes of the UAE, read at scale.',
  about: [
    'This realm is still being built. The scaffolding goes up as the lab writes in what the project is, who is on it and what comes next.',
    'Working on EGP? Add a paragraph here, list the quests, link the repos, and put yourself in the party (see AGENTS.md).',
  ],
  quests: [
    { title: 'Write the realm: what EGP is and our part in it', done: false },
    { title: 'List the first quests and the people on them', done: false },
    { title: 'Link the repos and docs', done: false },
  ],
  links: [],
  map: { x: 520, y: 118, rx: 80, ry: 54 },
  walk: { x: 40, y: 296, w: 330, h: 44 },

  drawIsland(p, t) {
    p.island(0, 0, 80, 54, { ground: '#e3c27a', sand: '#f2dca0' });
    for (const [x, y, rx] of [[-38, 14, 26], [20, 26, 30], [36, -14, 22]]) { p.oval(x, y, rx, 7, '#d4a95a'); p.oval(x, y - 2, rx - 4, 5, '#e6c47f'); }
    palm(p, -58, 4, t); palm(p, -50, 12, t); palm(p, 58, 18, t);
    p.oval(-54, 16, 9, 3, '#38bdf8');
    // Helix tower in scaffolding; a crane keeps adding rungs.
    for (let x = -8; x <= 8; x += 8) p.rect(x, -44, 1, 44, '#8b5e34');
    for (let y = -40; y <= 0; y += 10) p.rect(-8, y, 17, 1, '#8b5e34');
    helix(p, 0, -2, 26, t, 4, 3);
    p.rect(22, -56, 2, 50, '#f59e0b');
    p.rect(-6, -56, 34, 2, '#f59e0b');
    const drop = 8 + Math.abs(Math.sin(t * 0.8)) * 10;
    p.rect(-2, -54, 1, drop, '#374151');
    p.rect(-4, -54 + drop, 5, 3, BASES[Math.floor(t * 0.8 / Math.PI) % 4]);
    hazard(p, -24, 34, 48, 5, t);
    const a = t * 0.9;
    falcon(p, Math.cos(a) * 46, -34 + Math.sin(a) * 12, t);
  },

  drawScene(p, t) {
    // Golden-hour sky in bands, sun, far skyline, dunes.
    ['#fcd9a8', '#fbbf80', '#f8a86a', '#f39159', '#e97b4f'].forEach((c, i) => p.rect(0, i * 36, 640, 36, c));
    p.disc(470, 120, 30, '#fff1c7');
    p.disc(470, 120, 26, '#ffe29a');
    const sky = [[20, 40], [44, 26], [60, 58], [84, 30], [100, 44], [520, 36], [540, 70], [566, 28], [590, 50]];
    for (const [x, h] of sky) p.rect(x, 180 - h, 18, h, '#c7685a');
    p.oval(140, 210, 260, 40, '#e0a45e');
    p.oval(520, 214, 220, 36, '#d99a55');
    p.rect(0, 210, 640, 150, '#ebbd75');
    p.oval(320, 250, 360, 36, '#f0c886');
    p.rect(0, 270, 640, 90, '#f3d095');
    // A camel caravan crossing the far dunes.
    const cx = ((t * 8) % 760) - 60;
    for (let i = 0; i < 3; i++) {
      const x = cx - i * 22, y = 198;
      p.rect(x, y, 12, 4, '#8a5a32'); p.rect(x + 3, y - 3, 4, 3, '#8a5a32');
      p.rect(x + 11, y - 5, 2, 6, '#8a5a32'); p.rect(x + 12, y - 6, 4, 2, '#8a5a32');
      const st = Math.floor(t * 4 + i) % 2;
      p.rect(x + 1 + st, y + 4, 1, 4, '#6b4423'); p.rect(x + 9 - st, y + 4, 1, 4, '#6b4423');
    }
    // The DNA tower: built up to the project's progress, the top rung blinking.
    const base = 290, full = 230, built = Math.max(30, full * PROGRESS / 100);
    for (let x = 150; x <= 230; x += 20) p.rect(x, base - full - 10, 2, full + 10, '#8b5e34');
    for (let y = base; y > base - full - 10; y -= 24) p.rect(150, y, 82, 2, '#8b5e34');
    for (let y = base; y > base - full; y -= 24) p.line(150, y, 230, y - 24, '#a47148');
    helix(p, 190, base, built, t, 26, 7);
    if (Math.floor(t * 3) % 2) p.rect(162, base - built - 4, 56, 2, '#fff7cc');
    // Crane lowering the next base pair.
    p.rect(300, 40, 6, 250, '#f59e0b');
    for (let y = 44; y < 290; y += 10) p.line(300, y, 306, y + 10, '#b45309');
    p.rect(170, 34, 180, 6, '#f59e0b');
    p.rect(330, 26, 20, 14, '#374151');
    const hook = 60 + (Math.sin(t * 0.7) * 0.5 + 0.5) * (base - built - 80);
    p.rect(195, 40, 1, hook - 40, '#1f2937');
    p.rect(182, hook, 28, 6, BASES[Math.floor(t * 0.7 / (Math.PI * 2)) % 4]);
    // Falcon circling the site.
    falcon(p, 230 + Math.cos(t * 0.6) * 140, 80 + Math.sin(t * 0.6) * 30, t, 2);
    // Palms, barrier, sign.
    palm(p, 40, 300, t, 3); palm(p, 400, 296, t, 2);
    hazard(p, 120, 300, 140, 10, t);
    p.rect(64, 236, 3, 40, '#5b4636');
    hazard(p, 40, 222, 54, 16, t * 0.3);
  },
};
