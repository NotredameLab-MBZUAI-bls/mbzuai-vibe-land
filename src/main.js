// Vibe Land: loads the registry, runs the world map and the realm scenes,
// and keeps the DOM overlays (labels, panel, cards) in sync with the canvas.
import { W, H, HQ, painter } from './pixel.js';
import { checkCrew, checkRealm, checkMapOverlaps } from './validate.js';
import * as registry from '../registry.js';
import { drawOverworld, drawClouds, drawFrame, hitIsland, unchartedFree, UNCHARTED, PLAZA } from './overworld.js';

const $ = id => document.getElementById(id);
const canvas = $('screen'), ctx = canvas.getContext('2d'), p = painter(ctx);
const stage = $('stage'), layer = $('layer'), tip = $('tip'), bubble = $('bubble'), card = $('card');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text; // never innerHTML: crew and realm text is user content
  return e;
}

// ---------- Load every realm and crew member; a broken file is skipped, not fatal.
const problems = [];
async function loadEach(ids, path, check) {
  const mods = await Promise.all(ids.map(async id => {
    try {
      const m = (await import(path(id))).default;
      const errs = check(m, id);
      if (errs.length) { problems.push(...errs); return null; }
      return m;
    } catch (e) {
      problems.push(`${path(id).slice(3)}: ${e.message}`);
      return null;
    }
  }));
  return mods.filter(Boolean);
}
const realms = await loadEach(registry.realms, id => `../realms/${id}/realm.js`, checkRealm);
problems.push(...checkMapOverlaps(realms));
const crew = await loadEach(registry.crew, id => `../crew/${id}.js`, (c, id) => checkCrew(c, id, registry.realms));

if (problems.length) {
  problems.forEach(m => console.warn('[vibe-land]', m));
  const toast = $('toast');
  toast.append(el('summary', '', `⚠ ${problems.length} problem${problems.length > 1 ? 's' : ''}: some files were skipped`));
  const ul = el('ul');
  problems.forEach(m => ul.append(el('li', '', m)));
  toast.append(ul);
  toast.hidden = false;
}

// ---------- Crew walking around.
function makeWalkers(members, box) {
  // shortcut: everyone shares one box and may overlap; give big labs a few boxes when that gets crowded.
  return members.map(c => {
    const x = box.x + Math.random() * box.w, y = box.y + Math.random() * box.h;
    return { c, x, y, tx: x, ty: y, wait: Math.random() * 3, flip: Math.random() < 0.5, moving: false };
  });
}

function stepWalkers(ws, box, dt) {
  for (const w of ws) {
    if (w.wait > 0) { w.wait -= dt; w.moving = false; continue; }
    const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
    if (d < 1) {
      w.tx = box.x + Math.random() * box.w; w.ty = box.y + Math.random() * box.h;
      w.wait = 1 + Math.random() * 4; w.moving = false;
      continue;
    }
    const v = Math.min(d, 16 * dt);
    w.x += (dx / d) * v; w.y += (dy / d) * v;
    if (Math.abs(dx) > 0.5) w.flip = dx < 0;
    w.moving = true;
  }
}

const dims = c => ({ sw: c.sprite.frames[0][0].length, sh: c.sprite.frames[0].length });

function drawCrew(pp, c, x, y, t, { flip = false, moving = false } = {}) {
  const fr = c.sprite.frames, i = moving ? Math.floor(t * 6) % fr.length : 0;
  pp.pattern(fr[i], c.sprite.palette, x, y, { flip });
  if (!c.fx) return;
  const { sw, sh } = dims(c);
  pp.ctx.save();
  try { c.fx(pp, { x, y, w: sw, h: sh, flip, t, moving }); }
  catch (e) { console.warn(`[vibe-land] crew/${c.id}.js: fx failed, turned off`, e); c.fx = undefined; }
  pp.ctx.restore();
}

function drawWalker(w, t, hovered) {
  const { sw, sh } = dims(w.c);
  const bob = w.moving && Math.floor(t * 6) % 2 ? 1 : 0;
  const x = Math.round(w.x - sw / 2), y = Math.round(w.y - sh - bob);
  p.alpha(0.3, () => p.oval(w.x, w.y, Math.max(3, sw / 2 - 2), 1, '#000000'));
  drawCrew(p, w.c, x, y, t, w);
  if (hovered) {
    const ay = y - 6 + Math.round(Math.sin(t * 6));
    p.rect(w.x - 2, ay, 5, 1, '#fde047'); p.rect(w.x - 1, ay + 1, 3, 1, '#fde047'); p.px(w.x, ay + 2, '#fde047');
  }
}

// ---------- Scenes.
const scene = { kind: 'map', realm: null, walkers: [], box: PLAZA };

function enter(kind, realm) {
  scene.kind = kind;
  scene.realm = realm;
  scene.box = kind === 'map' ? PLAZA : realm.walk;
  scene.walkers = makeWalkers(kind === 'map' ? crew : crew.filter(c => c.realms.includes(realm.id)), scene.box);
  closeCard();
  bubbleState.w = null;
  bubble.hidden = true;
  buildLayer();
  document.title = kind === 'map' ? 'MBZUAI Vibe Land' : `${realm.name} · MBZUAI Vibe Land`;
}

function route() {
  const m = location.hash.match(/^#\/realm\/([a-z0-9-]+)$/);
  const r = m && realms.find(x => x.id === m[1]);
  return r ? ['realm', r] : ['map', null];
}

let trans = null, lastAt = null;
function transition(kind, realm) {
  const at = lastAt || { x: W / 2, y: H / 2 };
  lastAt = null;
  trans = { phase: 'close', t: 0, kind, realm, cx: at.x, cy: at.y };
}
window.addEventListener('hashchange', () => transition(...route()));
const goRealm = (r, at) => { lastAt = at || { x: r.map.x, y: r.map.y }; location.hash = `#/realm/${r.id}`; };
const goMap = () => { location.hash = '#/'; };

function drawIris(dt) {
  if (!trans) return;
  trans.t += dt;
  const k = Math.min(1, trans.t / 0.38), R = Math.hypot(W, H);
  const r = trans.phase === 'close' ? R * (1 - k) ** 2 : R * k * k;
  ctx.fillStyle = '#05070d';
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(trans.cx, trans.cy, Math.max(0.1, r), 0, Math.PI * 2); ctx.fill('evenodd');
  if (k < 1) return;
  if (trans.phase === 'close') { enter(trans.kind, trans.realm); Object.assign(trans, { phase: 'open', t: 0, cx: W / 2, cy: H / 2 }); }
  else trans = null;
}

// ---------- DOM overlays, positioned in world pixels (the stage scales them with the canvas).
function place(e, x, y) { e.style.left = `${x}px`; e.style.top = `${y}px`; return e; }
const plateAt = (e, o) => place(e, o.x, Math.min(o.y + o.ry + 5, H - 30));

function buildLayer() {
  layer.replaceChildren();
  if (scene.kind === 'map') {
    const banner = el('div', 'banner');
    banner.append(el('div', 'banner-title', 'MBZUAI VIBE LAND'), el('div', 'banner-sub', 'Notredame Lab · Abu Dhabi'));
    layer.append(banner);
    const log = el('div', 'questlog');
    log.append(el('div', 'questlog-title', `HOW TO PLAY · CREW ${crew.length} · REALMS ${realms.length}`));
    for (const line of ['Click an island to travel', 'Click a crewmate for their card', 'Click HQ for the whole crew', 'Join in: read AGENTS.md']) log.append(el('div', '', `▸ ${line}`));
    layer.append(log);
    for (const r of realms) {
      const b = plateAt(el('button', `plate ${r.status}`), r.map);
      b.append(el('span', 'plate-name', r.name));
      const n = crew.filter(c => c.realms.includes(r.id)).length;
      b.append(el('span', 'plate-sub', r.status === 'active' ? `● ACTIVE · ${n} crew` : `🚧 UNDER CONSTRUCTION`));
      b.addEventListener('click', () => goRealm(r));
      layer.append(b);
    }
    const hq = plateAt(el('button', 'plate hq'), HQ);
    hq.append(el('span', 'plate-name', 'Notredame Lab HQ'));
    hq.addEventListener('click', openRoster);
    layer.append(hq);
    if (unchartedFree(realms)) {
      const u = plateAt(el('button', 'plate uncharted'), UNCHARTED);
      u.append(el('span', 'plate-name', 'Uncharted waters'), el('span', 'plate-sub', 'your project here?'));
      u.addEventListener('click', openUncharted);
      layer.append(u);
    }
    return;
  }
  const r = scene.realm;
  const back = el('button', 'back', '◀ WORLD MAP');
  back.addEventListener('click', goMap);
  layer.append(back);
  layer.append(realmPanel(r));
}

function miniAvatar(c, scale = 2) {
  const { sw, sh } = dims(c), cv = el('canvas', 'mini');
  cv.width = sw; cv.height = sh;
  cv.style.width = `${sw * scale}px`; cv.style.height = `${sh * scale}px`;
  painter(cv.getContext('2d')).pattern(c.sprite.frames[0], c.sprite.palette, 0, 0);
  return cv;
}

function crewButton(c) {
  const b = el('button', 'crew-chip');
  b.append(miniAvatar(c), el('span', '', c.name));
  b.addEventListener('click', () => openCard(c));
  return b;
}

function realmPanel(r) {
  const panel = el('aside', 'panel');
  const head = el('div', 'panel-head');
  head.append(el('span', 'tag', r.tag), el('span', `status ${r.status}`, r.status === 'active' ? 'ACTIVE' : 'UNDER CONSTRUCTION'));
  panel.append(head, el('h2', '', r.name));
  if (r.status === 'construction') {
    const bar = el('div', 'progress');
    const fill = el('div', 'progress-fill');
    fill.style.width = `${r.progress ?? 0}%`;
    bar.append(fill, el('span', '', `${r.progress ?? 0}% built`));
    panel.append(bar);
  }
  r.about.forEach(t => panel.append(el('p', '', t)));
  panel.append(el('h3', '', 'QUESTS'));
  const ul = el('ul', 'quests');
  r.quests.forEach(q => ul.append(el('li', q.done ? 'done' : '', `${q.done ? '☑' : '☐'} ${q.title}`)));
  panel.append(ul);
  panel.append(el('h3', '', 'PARTY'));
  const party = crew.filter(c => c.realms.includes(r.id));
  const pd = el('div', 'party');
  if (party.length) party.forEach(c => pd.append(crewButton(c)));
  else pd.append(el('p', 'muted', `No one here yet. Be the first: add '${r.id}' to your realms.`));
  panel.append(pd);
  if (r.links.length) {
    panel.append(el('h3', '', 'LINKS'));
    const links = el('div', 'links');
    r.links.forEach(l => { const a = el('a', '', `↗ ${l.label}`); a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; links.append(a); });
    panel.append(links);
  }
  return panel;
}

// ---------- Cards (modal over the stage).
let cardAvatar = null;

function openShell(title) {
  card.replaceChildren();
  cardAvatar = null;
  const x = el('button', 'card-close', '✕');
  x.setAttribute('aria-label', 'Close');
  x.addEventListener('click', closeCard);
  card.append(x, el('h2', '', title));
  card.hidden = false;
  x.focus();
}
function closeCard() { card.hidden = true; cardAvatar = null; }

function openCard(c) {
  openShell(c.name);
  const { sw, sh } = dims(c);
  const cv = el('canvas', 'avatar');
  cv.width = sw + 16; cv.height = sh + 12;
  cv.style.width = `${(sw + 16) * 4}px`; cv.style.height = `${(sh + 12) * 4}px`;
  cardAvatar = { c, cv, pp: painter(cv.getContext('2d')) };
  const body = el('div', 'card-body'), info = el('div', 'card-info');
  info.append(el('div', 'class', c.class), el('q', 'motto', c.motto));
  if (c.stats) {
    const st = el('div', 'stats');
    for (const [k, v] of Object.entries(c.stats)) {
      const row = el('div', 'stat');
      row.append(el('span', 'stat-name', k), el('span', 'stat-bar', '■'.repeat(v) + '□'.repeat(10 - v)));
      st.append(row);
    }
    info.append(st);
  }
  if (c.skills?.length) {
    const sk = el('div', 'chips');
    c.skills.forEach(s => sk.append(el('span', 'chip', s)));
    info.append(sk);
  }
  const rl = el('div', 'chips');
  for (const id of c.realms) {
    const r = realms.find(x => x.id === id);
    if (!r) continue;
    const b = el('button', 'chip realm-chip', `⚑ ${r.name}`);
    b.addEventListener('click', () => { closeCard(); goRealm(r, { x: W / 2, y: H / 2 }); });
    rl.append(b);
  }
  if (!c.realms.length) rl.append(el('span', 'muted', 'Hangs out at HQ'));
  info.append(rl);
  if (c.github) {
    const a = el('a', 'gh', `↗ github.com/${c.github}`);
    a.href = `https://github.com/${c.github}`; a.target = '_blank'; a.rel = 'noopener';
    info.append(a);
  }
  body.append(cv, info);
  card.append(body);
}

function openRoster() {
  openShell(`The crew (${crew.length})`);
  const list = el('div', 'roster');
  crew.forEach(c => list.append(crewButton(c)));
  card.append(list, el('p', 'muted', 'Not here yet? Copy crew/_template.js, draw yourself, and open a pull request. AGENTS.md has the rules.'));
}

function openUncharted() {
  openShell('Uncharted waters');
  card.append(el('p', '', 'A new lab project gets its own island here. To raise one:'));
  const ol = el('ol', 'steps');
  ['Copy a realm folder: realms/robotics → realms/<your-id>.', 'Change its id, name, text and quests; draw its island and its scene.', "Pick a free spot on the map (map: { x, y, rx, ry }).", "Add '<your-id>' to registry.js and run: node tools/check.mjs", 'Open a pull request. Full rules: AGENTS.md › Raise a realm.']
    .forEach(s => ol.append(el('li', '', s)));
  card.append(ol);
}

function drawCardAvatar(t) {
  if (!cardAvatar) return;
  const { c, cv, pp } = cardAvatar;
  pp.ctx.clearRect(0, 0, cv.width, cv.height);
  pp.alpha(0.25, () => pp.oval(cv.width / 2, cv.height - 4, 6, 1, '#000000'));
  drawCrew(pp, c, 8, 6, t, { moving: Math.floor(t / 3) % 2 === 1 });
}

// ---------- Pointer: hover tips, clicks.
let mouse = null, hover = null;
function toWorld(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}
function pick(m) {
  if (!m || trans) return null;
  for (const w of [...scene.walkers].sort((a, b) => b.y - a.y)) {
    const { sw, sh } = dims(w.c);
    if (m.x >= w.x - sw / 2 && m.x <= w.x + sw / 2 && m.y >= w.y - sh && m.y <= w.y) return { type: 'crew', c: w.c, w };
  }
  if (scene.kind !== 'map') return null;
  for (const r of realms) if (hitIsland(m.x, m.y, r.map)) return { type: 'realm', r };
  if (unchartedFree(realms) && hitIsland(m.x, m.y, UNCHARTED)) return { type: 'uncharted' };
  if (hitIsland(m.x, m.y, HQ)) return { type: 'hq' };
  return null;
}
canvas.addEventListener('pointermove', e => { mouse = toWorld(e); });
canvas.addEventListener('pointerleave', () => { mouse = null; });
canvas.addEventListener('click', e => {
  const m = toWorld(e), h = pick(m);
  if (!h) return;
  if (h.type === 'crew') openCard(h.c);
  else if (h.type === 'realm') goRealm(h.r, m);
  else if (h.type === 'uncharted') openUncharted();
  else if (h.type === 'hq') openRoster();
});
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!card.hidden) closeCard();
  else if (scene.kind !== 'map') goMap();
});

function updateTip() {
  const text = !hover ? '' :
    hover.type === 'crew' ? `${hover.c.name} · ${hover.c.class}` :
    hover.type === 'realm' ? `${hover.r.name}: ${hover.r.blurb}` :
    hover.type === 'uncharted' ? 'Uncharted waters: the next lab project lands here' :
    'Notredame Lab HQ: meet the whole crew';
  tip.hidden = !text;
  if (!text) return;
  if (tip.textContent !== text) tip.textContent = text;
  place(tip, Math.min(mouse.x + 8, W - 150), Math.min(mouse.y + 10, H - 30));
}

// Every few seconds someone says their motto, like the speech bubbles in a village game.
const bubbleState = { w: null, left: 0, next: 2 };
function updateBubble(dt) {
  const b = bubbleState;
  if (b.w) {
    b.left -= dt;
    if (b.left <= 0 || !scene.walkers.includes(b.w)) { b.w = null; bubble.hidden = true; }
    else place(bubble, b.w.x, b.w.y - dims(b.w.c).sh - 4);
    return;
  }
  b.next -= dt;
  if (b.next > 0 || !scene.walkers.length || trans) return;
  b.w = scene.walkers[Math.floor(Math.random() * scene.walkers.length)];
  b.left = 4.5; b.next = 3 + Math.random() * 4;
  bubble.textContent = b.w.c.motto;
  bubble.hidden = false;
}

// ---------- Fit the stage to the window, then run.
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
addEventListener('resize', fit);
fit();

enter(...route());
trans = { phase: 'open', t: 0, cx: W / 2, cy: H / 2 };

let last = performance.now(), T = 0, sceneFailed = null;
function frame(now) {
  requestAnimationFrame(frame); // first, so one bad frame never stops the world
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); // the first rAF stamp can predate performance.now()
  last = now; T += dt;
  stepWalkers(scene.walkers, scene.box, dt);
  hover = pick(mouse);
  canvas.style.cursor = hover ? 'pointer' : 'default';
  ctx.save();
  if (scene.kind === 'map') drawOverworld(p, T, realms, hover?.type === 'realm' ? hover.r : null);
  else {
    try { scene.realm.drawScene(p, T); }
    catch (e) {
      if (sceneFailed !== scene.realm) { console.warn(`[vibe-land] realms/${scene.realm.id}: drawScene failed`, e); sceneFailed = scene.realm; }
      p.rect(0, 0, W, H, '#1e1b2e');
    }
  }
  ctx.restore();
  for (const w of [...scene.walkers].sort((a, b) => a.y - b.y)) drawWalker(w, T, hover?.w === w);
  if (scene.kind === 'map') drawClouds(p, T);
  drawFrame(p);
  drawIris(dt);
  updateTip();
  updateBubble(dt);
  drawCardAvatar(T);
}
requestAnimationFrame(frame);
