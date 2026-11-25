// Copy me to crew/<your-id>.js, change everything, then add '<your-id>' to registry.js.
// Full rules: AGENTS.md › "Join the crew". Check your file with: node tools/check.mjs

export default {
  id: 'your-name',            // = the file name, lowercase letters, digits and dashes
  name: 'Your Name',          // shown on your card, 40 characters max
  github: 'your-github',      // optional; links your card to GitHub
  class: 'Pipeline Druid',    // your RPG class, 32 characters max
  motto: 'Hello, Vibe Land!', // your speech bubble, 90 characters max
  realms: [],                 // realm ids you work in, e.g. ['robotics']; [] = HQ only
  stats: { WETLAB: 5, CODE: 5, COFFEE: 5 }, // optional, up to 6, each 1-10
  skills: ['Python'],         // optional, up to 8

  // Pixel art, up to 16 wide and 24 tall. One character per pixel, '.' is transparent.
  // Face the viewer; the game mirrors you when you walk left.
  // Frame 0 is standing; frames 1-3 (optional) play in turn while you walk.
  sprite: {
    palette: {
      k: '#1a1a1a', // outline
      h: '#7b4a2a', // hair
      s: '#e8b48f', // skin
      e: '#1a1a1a', // eyes
      w: '#f4f4f5', W: '#cfd2d8', // lab coat, shade
      t: '#3b82f6', // shirt
      p: '#334155', b: '#111111', // trousers, shoes
    },
    frames: [
      [
        '.....kkkkkk.....',
        '....khhhhhhk....',
        '...khhhhhhhhk...',
        '...khsssssshk...',
        '...kssessessk...',
        '...kssssssssk...',
        '...kssskksssk...',
        '....kssssssk....',
        '......kssk......',
        '...kkwwttwwkk...',
        '..kwwwwttwwwwk..',
        '..kwwkwttwkwwk..',
        '..kwwkwttwkwwk..',
        '..kwwkwwwwkwwk..',
        '..kskkWwwWkksk..',
        '...k.kwwwwk.k...',
        '.....kppppk.....',
        '.....kppppk.....',
        '.....kpkkpk.....',
        '.....kpkkpk.....',
        '.....kpkkpk.....',
        '....kbbkkbbk....',
        '....kkk..kkk....',
      ],
    ],
  },

  // Optional: draw effects on top of your sprite every frame (a pet, sparkles, a weapon glow).
  // p is the pixel painter (p.px, p.rect, p.line, p.disc, p.alpha ...), see src/pixel.js.
  // x, y = top-left of your sprite; flip = facing left; t = seconds.
  // fx(p, { x, y, flip, t, moving }) {
  //   p.px(x + 8, y - 3 - Math.round(Math.sin(t * 4)), '#facc15');
  // },
};
