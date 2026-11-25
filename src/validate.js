// The rules every crew member and realm file must follow (see AGENTS.md).
// Pure functions: the page uses them to skip a broken file, tools/check.mjs uses them in CI.
import { W, H, HQ } from './pixel.js';

const ID = /^[a-z0-9][a-z0-9-]{0,30}$/;
const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

export function checkSprite(sprite, where) {
  const errs = [];
  if (!sprite || typeof sprite !== 'object') return [`${where}: sprite is missing`];
  const { palette, frames } = sprite;
  if (!palette || typeof palette !== 'object') errs.push(`${where}: sprite.palette must be an object`);
  else for (const [k, v] of Object.entries(palette)) {
    if (k.length !== 1 || k === '.') errs.push(`${where}: palette key "${k}" must be one character, not "."`);
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) errs.push(`${where}: palette colour for "${k}" must look like #a1b2c3`);
  }
  if (!Array.isArray(frames) || frames.length < 1 || frames.length > 4) {
    errs.push(`${where}: sprite.frames must hold 1 to 4 frames`);
    return errs;
  }
  const w = frames[0]?.[0]?.length, h = frames[0]?.length;
  frames.forEach((rows, f) => {
    if (!Array.isArray(rows) || rows.length !== h) return errs.push(`${where}: frame ${f} must have ${h} rows like frame 0`);
    rows.forEach((row, y) => {
      if (typeof row !== 'string' || row.length !== w) return errs.push(`${where}: frame ${f} row ${y} must be ${w} characters`);
      for (const ch of row) if (ch !== '.' && !(palette && ch in palette)) errs.push(`${where}: frame ${f} row ${y} uses "${ch}", which is not in the palette`);
    });
  });
  if (w > 16 || h > 24) errs.push(`${where}: sprite is ${w}x${h}; the limit is 16 wide by 24 tall`);
  return errs;
}

export function checkCrew(c, fileId, realmIds) {
  const where = `crew/${fileId}.js`;
  if (!c || typeof c !== 'object') return [`${where}: must \`export default { ... }\``];
  const errs = [];
  if (c.id !== fileId || !ID.test(c.id)) errs.push(`${where}: id must be "${fileId}" (lowercase, digits, dashes)`);
  if (!str(c.name, 40)) errs.push(`${where}: name is required (40 characters max)`);
  if (!str(c.class, 32)) errs.push(`${where}: class is required (32 characters max)`);
  if (!str(c.motto, 90)) errs.push(`${where}: motto is required (90 characters max)`);
  if (c.github !== undefined && !/^[A-Za-z0-9-]{1,39}$/.test(c.github)) errs.push(`${where}: github must be a GitHub username`);
  if (!Array.isArray(c.realms)) errs.push(`${where}: realms must be a list (it may be empty)`);
  else for (const r of c.realms) if (!realmIds.includes(r)) errs.push(`${where}: unknown realm "${r}"`);
  if (c.stats !== undefined) {
    const e = Object.entries(c.stats || {});
    if (e.length > 6) errs.push(`${where}: at most 6 stats`);
    for (const [k, v] of e) if (!str(k, 12) || !Number.isInteger(v) || v < 1 || v > 10) errs.push(`${where}: stat ${k} must be a whole number 1-10 (name up to 12 characters)`);
  }
  if (c.skills !== undefined && (!Array.isArray(c.skills) || c.skills.length > 8 || !c.skills.every(s => str(s, 24))))
    errs.push(`${where}: skills must be up to 8 short strings`);
  if (c.fx !== undefined && typeof c.fx !== 'function') errs.push(`${where}: fx must be a function`);
  return errs.concat(checkSprite(c.sprite, where));
}

export function checkRealm(r, dirId) {
  const where = `realms/${dirId}/realm.js`;
  if (!r || typeof r !== 'object') return [`${where}: must \`export default { ... }\``];
  const errs = [];
  if (r.id !== dirId || !ID.test(r.id)) errs.push(`${where}: id must be "${dirId}"`);
  if (!str(r.name, 40)) errs.push(`${where}: name is required (40 characters max)`);
  if (!str(r.tag, 16)) errs.push(`${where}: tag is required (16 characters max)`);
  if (!['active', 'construction'].includes(r.status)) errs.push(`${where}: status must be "active" or "construction"`);
  if (!str(r.blurb, 140)) errs.push(`${where}: blurb is required (140 characters max)`);
  if (!Array.isArray(r.about) || !r.about.every(s => str(s, 600))) errs.push(`${where}: about must be a list of paragraphs`);
  if (!Array.isArray(r.quests) || !r.quests.every(q => str(q?.title, 120) && typeof q.done === 'boolean')) errs.push(`${where}: quests must be a list of { title, done }`);
  if (!Array.isArray(r.links) || !r.links.every(l => str(l?.label, 40) && /^https:\/\//.test(l?.url))) errs.push(`${where}: links must be a list of { label, url } with https URLs`);
  if (r.progress !== undefined && !(Number.isInteger(r.progress) && r.progress >= 0 && r.progress <= 100)) errs.push(`${where}: progress must be 0-100`);
  for (const f of ['drawIsland', 'drawScene']) if (typeof r[f] !== 'function') errs.push(`${where}: ${f}(p, t) is required`);
  const m = r.map;
  if (!m || ![m.x, m.y, m.rx, m.ry].every(Number.isFinite)) errs.push(`${where}: map needs x, y, rx, ry`);
  else if (m.x - m.rx < 10 || m.x + m.rx > W - 10 || m.y - m.ry < 44 || m.y + m.ry > H - 12) errs.push(`${where}: the island must fit inside the map (x ${10 + m.rx}-${W - 10 - m.rx}, y ${44 + m.ry}-${H - 12 - m.ry})`);
  const k = r.walk;
  if (!k || ![k.x, k.y, k.w, k.h].every(Number.isFinite) || k.x < 0 || k.y < 0 || k.x + k.w > W || k.y + k.h > H) errs.push(`${where}: walk must be a box { x, y, w, h } inside 640x360`);
  return errs;
}

// Islands may not touch each other or the lab HQ.
export function checkMapOverlaps(realms) {
  const errs = [];
  const boxes = [{ id: 'the lab HQ', ...HQ }, ...realms.map(r => ({ id: r.id, ...r.map }))];
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (Math.abs(a.x - b.x) < a.rx + b.rx + 8 && Math.abs(a.y - b.y) < a.ry + b.ry + 8)
        errs.push(`realms: the islands of ${a.id} and ${b.id} overlap on the map; move one of them`);
    }
  return errs;
}
