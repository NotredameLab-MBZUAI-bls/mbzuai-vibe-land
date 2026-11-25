// Nextflow Robotics: wet-lab robots as steps of a Nextflow pipeline.
// Island: a steel isle with a factory, a robot arm and a conveyor of plates.
// Scene: the automated lab floor, with a live pipeline DAG on the wall.

const NF = '#0dc09d', NF_DARK = '#087f6a', STEEL = '#6f7f8c', ORANGE = '#f59e0b';

function arm(p, bx, by, t, l1, l2, speed = 1.5) {
  const a1 = -1.9 + Math.sin(t * speed) * 0.6;
  const a2 = a1 + 1.5 + Math.sin(t * speed + 1.2) * 0.5;
  const ex = bx + Math.cos(a1) * l1, ey = by + Math.sin(a1) * l1;
  const hx = ex + Math.cos(a2) * l2, hy = ey + Math.sin(a2) * l2;
  for (const d of [0, 1]) { p.line(bx + d, by, ex + d, ey, ORANGE); p.line(ex + d, ey, hx + d, hy, '#fbbf24'); }
  p.rect(ex - 1, ey - 1, 3, 3, '#374151');
  p.rect(hx - 1, hy, 4, 3, '#9ca3af');
  return [hx, hy];
}

function plate(p, x, y, s = 1) {
  p.rect(x, y, 8 * s, 5 * s, '#f3f4f6');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) p.rect(x + (1 + i * 2.3) * s, y + (1 + j * 2) * s, s, s, (i + j) % 2 ? NF : '#60a5fa');
}

export default {
  id: 'robotics',
  name: 'Nextflow Robotics',
  tag: 'NF-ROBOTICS',
  status: 'active',
  blurb: 'Wet-lab robots as steps of a Nextflow pipeline: one run, wet and dry.',
  about: [
    'One pipeline mixes wet steps (a robot transfers a plate, extracts RNA, runs a PCR) and dry ones (analysis), with no change to the Nextflow language.',
    'A wet step never runs twice: not on retry, -resume or a new launch directory. Aborting a run safe-stops a robot instead of killing it mid-protocol, and every wet task\'s provenance (device, protocol version, samples) lands in Nextflow lineage.',
    'Today it is a prototype against simulated machines (PyLabRobot); next, a real instrument at MBZUAI.',
  ],
  quests: [
    { title: 'Prototype handed over: talk, nf-labrobotics 0.1.0, roadmap', done: true },
    { title: 'Show the lab the vision, the demo and the open questions', done: true },
    { title: 'Present it to the MBZUAI Robotics department', done: false },
    { title: 'Connect a real wet-lab instrument at MBZUAI', done: false },
    { title: 'That instrument in a pipeline; nf-labrobotics 1.0.0', done: false },
  ],
  links: [
    { label: 'Take the tour', url: 'https://vagkaratzas.github.io/nf-labrobotics/' },
    { label: 'nf-labrobotics on GitHub', url: 'https://github.com/vagkaratzas/nf-labrobotics' },
  ],
  map: { x: 128, y: 130, rx: 82, ry: 52 },
  walk: { x: 40, y: 262, w: 320, h: 70 },

  drawIsland(p, t) {
    p.island(0, 0, 82, 52, { ground: STEEL, sand: '#d9c58f' });
    p.oval(0, 2, 66, 38, '#7d8d9a');
    // Factory with a smokestack puffing green pixels.
    p.rect(-52, -34, 46, 26, '#8b95a1');
    p.rect(-52, -38, 46, 4, '#4b5563');
    for (let i = 0; i < 4; i++) p.rect(-48 + i * 11, -28, 6, 5, (Math.floor(t * 3 + i) % 4) ? '#9ff5e3' : '#e8fffa');
    p.rect(-30, -14, 8, 6, '#374151');
    p.rect(-44, -54, 6, 16, '#6b7280');
    p.rect(-44, -56, 6, 2, '#374151');
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.5 + i / 6) % 1;
      p.alpha(1 - ph, () => p.rect(-42 + Math.sin(ph * 6 + i) * 3, -58 - ph * 26, 3 - ph * 2, 3 - ph * 2, NF));
    }
    // Conveyor belt with plates.
    p.rect(-40, 14, 84, 7, '#374151');
    for (let x = -40; x < 44; x += 4) p.px(x + (Math.floor(t * 8) % 4), 17, '#6b7280');
    for (let i = 0; i < 3; i++) plate(p, -40 + ((t * 12 + i * 28) % 78), 11);
    // Robot arm.
    p.rect(30, 6, 10, 6, '#374151');
    arm(p, 35, 6, t, 14, 12);
    // Status beacon.
    p.rect(52, -22, 2, 10, '#4b5563');
    p.disc(53, -24, 2, Math.floor(t * 2) % 2 ? NF : NF_DARK);
  },

  drawScene(p, t) {
    // Wall.
    p.rect(0, 0, 640, 150, '#1e2836');
    for (let x = 0; x < 640; x += 40) p.rect(x, 0, 1, 150, '#243142');
    p.rect(0, 146, 640, 4, '#0f172a');
    // Floor tiles.
    p.rect(0, 150, 640, 210, '#2b3440');
    for (let x = 0; x < 640; x += 24) p.rect(x, 150, 1, 210, '#323d4a');
    for (let y = 150; y < 360; y += 24) p.rect(0, y, 640, 1, '#323d4a');
    // Wall screen: a pipeline DAG whose processes light up in turn, like a run.
    p.rect(30, 18, 340, 104, '#0b1220');
    p.rect(32, 20, 336, 100, '#0f1a2e');
    const nodes = [[60, 70], [120, 40], [120, 100], [190, 40], [190, 100], [260, 70], [330, 70]];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6]];
    const step = (t * 0.8) % (nodes.length + 2);
    for (const [a, b] of edges) p.line(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], step > b ? NF : '#334155');
    nodes.forEach(([x, y], i) => {
      const done = step > i + 1, running = !done && step > i;
      const c = done ? NF : running ? (Math.floor(t * 6) % 2 ? '#fde047' : '#facc15') : '#475569';
      p.rect(x - 9, y - 6, 18, 12, '#0b1220');
      p.rect(x - 8, y - 5, 16, 10, c);
      p.rect(x - 5, y - 2, i % 2 ? 4 : 10, 1, '#0b1220');
    });
    // Wet-step marker: a droplet icon on the robot processes.
    for (const i of [1, 3]) p.disc(nodes[i][0] + 12, nodes[i][1] - 8, 2, '#60a5fa');

    // Bench with three instruments along a conveyor.
    p.rect(20, 196, 380, 40, '#4b5563');
    p.rect(20, 196, 380, 4, '#6b7280');
    p.rect(20, 214, 380, 10, '#1f2937');
    for (let x = 20; x < 396; x += 6) p.rect(x + (Math.floor(t * 10) % 6), 218, 2, 2, '#4b5563');
    for (let i = 0; i < 5; i++) plate(p, 20 + ((t * 22 + i * 74) % 372), 208, 1);
    // Liquid handler: a gantry whose pipette head shuttles and dips.
    p.rect(40, 130, 110, 70, '#cbd5e1');
    p.rect(44, 134, 102, 50, '#0f172a');
    const hx = 60 + (Math.sin(t * 1.2) * 0.5 + 0.5) * 66, dip = Math.max(0, Math.sin(t * 4)) * 10;
    p.rect(46, 140, 98, 3, '#94a3b8');
    p.rect(hx, 143, 10, 8, ORANGE);
    for (let k = 0; k < 4; k++) p.rect(hx + 1 + k * 2, 151, 1, 8 + dip, '#e5e7eb');
    plate(p, 66, 172, 2); plate(p, 104, 172, 2);
    // Thermocycler: an LED that cycles hot and cold.
    p.rect(180, 156, 70, 44, '#e2e8f0');
    p.rect(184, 160, 62, 12, '#94a3b8');
    const hot = Math.sin(t * 1.5) > 0;
    p.rect(190, 180, 20, 6, hot ? '#ef4444' : '#3b82f6');
    p.rect(214, 180, 26, 6, '#0f172a');
    p.rect(215, 181, Math.round((Math.sin(t * 1.5) * 0.5 + 0.5) * 24), 4, hot ? '#f87171' : '#60a5fa');
    // Plate reader.
    p.rect(280, 166, 60, 34, '#cbd5e1');
    p.rect(286, 172, 48, 8, '#0f172a');
    for (let k = 0; k < 6; k++) p.rect(288 + k * 7, 174, 4, 4, Math.floor(t * 5 + k) % 3 ? '#1e293b' : NF);
    // Big arm moving plates on and off the line.
    p.rect(344, 186, 24, 14, '#374151');
    const [gx, gy] = arm(p, 356, 186, t, 34, 30, 1.1);
    plate(p, gx - 4, gy + 3);
    // E-stop on a pedestal, pulsing.
    p.rect(384, 262, 10, 40, '#6b7280');
    p.rect(378, 256, 22, 8, '#fde047');
    p.disc(389, 254, 6, '#991b1b');
    p.disc(389, 253, 5 + (Math.floor(t * 2) % 2), '#ef4444');
  },
};
