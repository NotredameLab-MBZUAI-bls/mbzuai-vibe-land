// Gabriele: an abyssal bio-wraith from protein-embedding space. Tall and narrow, a crooked
// pointed hood over a void with violet eyes, and hands that are vectors: thin cyan arrows.
// fx: digits orbit him when he stands; when he moves he leaves a dark halo and a stream
// of digits that fade, as if the embedding were losing dimensions.

const palette = {
  k: '#05050a', // outline
  h: '#1c1630', H: '#352a52', // cloak, fold highlight
  v: '#08060e', // the void under the hood
  E: '#f3d9ff', e: '#b05cff', // eye core, eye glow
  a: '#4ef2ff', // vector hands
  c: '#2fa6bf', // numbers etched in the cloak
};

const body = [
  '..........k.....',
  '.........kk.....',
  '........khk.....',
  '.......khk......',
  '......khhk......',
  '.....khHhhk.....',
  '....khHhhhhk....',
  '....khHvvvhk....',
  '....khvEvEvk....',
  '....khvevevk....',
  '....khvvvvvk....',
  '....khhvvvhk....',
  '...kkhhhvhhhk...',
  '..akhHhhhhhhka..',
  '.a.khHhhchhhk.a.',
  'aa.khHhhhhchk.aa',
  'a..khHhchhhhk..a',
  '...khHhhhhhhk...',
  '...khHhhhchhk...',
  '...khchhhhhhk...',
  '...khHhhhhchk...',
];

// 3x5 pixel digits, one string per row.
const DIGITS = [
  ['###', '#.#', '#.#', '#.#', '###'], ['.#.', '##.', '.#.', '.#.', '###'],
  ['##.', '..#', '.#.', '#..', '###'], ['##.', '..#', '.#.', '..#', '##.'],
  ['#.#', '#.#', '###', '..#', '..#'], ['###', '#..', '##.', '..#', '##.'],
  ['.##', '#..', '###', '#.#', '###'], ['###', '..#', '.#.', '.#.', '.#.'],
  ['###', '#.#', '###', '#.#', '###'], ['###', '#.#', '###', '..#', '##.'],
];

export default {
  id: 'gabriele',
  name: 'Gabriele Vazzana',
  github: 'gabryvzz',
  class: 'Abyssal Bio-Wraith',
  motto: "It's Embedding time!",
  realms: [],
  skills: ['Embedding', 'Procrastinating', 'Lunch', 'More embedding'],
  sprite: {
    palette,
    frames: [
      [...body,
        '...khhkhhkhhk...',
        '...kk.khk.kkk...',
        '...k...k...k....'],
      [...body,
        '...khhhkhhkhhk..',
        '...khk.kk.khk...',
        '....k...k...k...'],
    ],
  },

  fx(p, { x, y, w, flip, t, moving }) {
    const back = flip ? 1 : -1, cx = x + w / 2 - 1;
    // Dark halo left behind while he moves.
    if (moving) for (let k = 0; k < 5; k++)
      p.alpha(0.22 * (1 - k / 5), () => p.rect(cx + back * (5 + k * 2) - 1, y + 8 + k, 3, 14 - k * 2, '#120a20'));
    // Pulsing eyes and vector tips.
    p.alpha(0.3 + 0.25 * Math.sin(t * 5), () => { p.rect(x + 7, y + 7, 1, 3, '#b05cff'); p.rect(x + 9, y + 7, 1, 3, '#b05cff'); });
    p.alpha(0.4 + 0.4 * Math.sin(t * 7), () => { p.px(x, y + 16, '#e0fdff'); p.px(x + 15, y + 16, '#e0fdff'); });
    // Flying digits: an orbit around the waist when still, a fading stream behind when moving.
    for (let i = 0; i < 3; i++) {
      const glyph = DIGITS[(Math.floor(t * 0.5 + i * 0.37) * 7 + i * 3) % 10];
      let gx, gy, a;
      if (moving) {
        const ph = (t * 1.1 + i / 3) % 1;
        gx = cx + back * (5 + ph * 7); gy = y + 7 + i * 5 + ph * 3; a = 0.9 * (1 - ph);
      } else {
        const ang = t * 1.4 + i * 2.094;
        gx = cx + Math.cos(ang) * 10; gy = y + 14 + Math.sin(ang) * 3; a = Math.sin(ang) > 0 ? 0.9 : 0.35;
      }
      p.alpha(a, () => glyph.forEach((row, r) => {
        for (let c = 0; c < 3; c++) if (row[c] === '#') p.px(Math.round(gx) + c, Math.round(gy) + r, i === 1 ? '#c98bff' : '#4ef2ff');
      }));
    }
  },
};
