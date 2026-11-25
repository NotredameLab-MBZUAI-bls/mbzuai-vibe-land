// Vangelis: half-cyborg bioinformatician. Left half of the face human (black hair),
// right half plated metal with a cyan optic. An orange omni-tool on the right forearm
// flickers, and every few seconds it forms an omni-blade.

const palette = {
  k: '#14141c', // outline
  h: '#16161e', H: '#3a3a4c', // black hair, highlight
  s: '#f2c9a5', S: '#d9a785', // skin, shade
  e: '#1b1b1b', // human eye
  m: '#9aa6b8', M: '#5d6778', // metal plate
  c: '#4ef2ff', // optic, circuitry, chest light
  a: '#2d3340', A: '#4a5366', // armour
  o: '#ff8a1f', O: '#ffc46b', // omni-tool
  p: '#1f2430', b: '#0d0d12', // trousers, boots
};

const head = [
  '....kkkkkkkk....',
  '...khhhHhhhhk...',
  '...khhHhhhhhk...',
  '...khhhhhhmmk...',
  '...khsssmMmmk...',
  '...kssesMcmmk...',
  '...ksssSMmcmk...',
  '...kssksMmMmk...',
  '....kssSmmMk....',
  '.....kksMkk.....',
  '..kkaAaaaaAakk..',
  '.kaaaAacaaAaaak.',
  '.kaakAaccaAkaak.',
  '.kaakaaAAaakaak.',
  '.kaakaaaaaakoOk.',
  '.kaakAAAAAAkOok.',
  '.ksskppppppkssk.',
  '..kkkppppppkkk..',
];

export default {
  id: 'vangelis',
  name: 'Vangelis Karatzas',
  github: 'vagkaratzas',
  class: 'Cyber-Bioinformatician',
  motto: 'If a robot can pipette it, Nextflow can schedule it.',
  realms: ['robotics'],
  stats: { NEXTFLOW: 10, ROBOTICS: 8, NF_CORE: 9, COFFEE: 7 },
  skills: ['Nextflow', 'nf-core', 'PyLabRobot', 'Protein families', 'Omni-tool'],
  sprite: {
    palette,
    frames: [
      [...head,
        '....kppkkppk....',
        '....kppkkppk....',
        '....kppkkppk....',
        '....kbbkkbbk....',
        '...kbbbkkbbbk...',
        '...kkkk..kkkk...'],
      [...head,
        '....kppkkppk....',
        '...kppk..kppk...',
        '...kppk..kppk...',
        '..kbbk....kbbk..',
        '..kbbbk...kbbbk.',
        '..kkkk....kkkk..'],
    ],
  },

  // Omni-tool hologram on the right forearm (sprite column 12-13, row 14-15).
  fx(p, { x, y, flip, t }) {
    const ax = flip ? x + 2 : x + 13, ay = y + 14, dir = flip ? -1 : 1;
    const flicker = 0.5 + 0.35 * Math.sin(t * 23) * Math.sin(t * 7);
    p.alpha(flicker, () => {
      p.rect(ax - 2, ay - 1, 4, 1, '#ff8a1f');
      p.rect(ax - 2, ay + 2, 4, 1, '#ff8a1f');
      p.px(ax + dir * 2, ay, '#ffc46b');
    });
    // Every 6 seconds: the omni-blade, for one second.
    const c = t % 6;
    if (c < 1) {
      const len = Math.min(7, Math.floor(c * 30));
      p.alpha(0.9, () => { for (let i = 1; i <= len; i++) p.px(ax + dir * (1 + i), ay + 1 - (i >> 2), i === len ? '#fff1d6' : '#ff9d3c'); });
    }
    // Sparks drifting up from the tool.
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i / 3) % 1;
      p.alpha(1 - ph, () => p.px(ax + Math.round(Math.sin(ph * 9 + i) * 2), ay - 1 - Math.round(ph * 8), '#ffc46b'));
    }
  },
};
