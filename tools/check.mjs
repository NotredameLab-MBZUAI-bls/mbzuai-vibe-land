#!/usr/bin/env node
// Checks every realm and crew file against the rules in AGENTS.md.
// Usage: node tools/check.mjs          (CI runs the same on every pull request)
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { checkCrew, checkRealm, checkMapOverlaps, checkSprite } from '../src/validate.js';
import * as registry from '../registry.js';

const root = new URL('..', import.meta.url);
const errors = [];

// Self-test of the validator on known-bad input.
assert.ok(checkSprite({ palette: { a: '#ffffff' }, frames: [['ab']] }, 'x').some(e => e.includes('"b"')));
assert.ok(checkSprite({ palette: { a: 'red' }, frames: [['a']] }, 'x').some(e => e.includes('#a1b2c3')));
assert.ok(checkSprite({ palette: { a: '#ffffff' }, frames: [['a'.repeat(17)]] }, 'x').some(e => e.includes('limit')));
assert.ok(checkCrew({ id: 'bob' }, 'alice', []).some(e => e.includes('id must be "alice"')));
assert.ok(checkMapOverlaps([{ id: 'a', map: { x: 318, y: 196, rx: 10, ry: 10 } }]).length === 1);

// Every file on disk is registered, and every registered id has a file.
const dirs = readdirSync(new URL('realms/', root)).filter(d => statSync(new URL(`realms/${d}`, root)).isDirectory());
const files = readdirSync(new URL('crew/', root)).filter(f => f.endsWith('.js') && !f.startsWith('_')).map(f => f.slice(0, -3));
for (const d of dirs) if (!registry.realms.includes(d)) errors.push(`realms/${d}/ is not listed in registry.js`);
for (const f of files) if (!registry.crew.includes(f)) errors.push(`crew/${f}.js is not listed in registry.js`);
for (const [name, list] of [['realms', registry.realms], ['crew', registry.crew]]) {
  if (new Set(list).size !== list.length) errors.push(`registry.js: ${name} has a duplicate id`);
  if (list.join() !== [...list].sort().join()) errors.push(`registry.js: keep ${name} in alphabetical order`);
}

// A contributed file stays small and keeps to itself: no network, no globals, no DOM.
const FORBIDDEN = /\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|document|window|eval|Function|importScripts)\b|import\s*\(/;
function source(path) {
  const text = readFileSync(new URL(path, root), 'utf8');
  if (text.length > 40_000) errors.push(`${path}: ${text.length} bytes; keep it under 40 kB`);
  const code = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hit = code.match(FORBIDDEN);
  if (hit) errors.push(`${path}: "${hit[0]}" is not allowed (no network, storage, DOM or eval)`);
}

async function load(path) {
  try { return (await import(new URL(path, root))).default; }
  catch (e) { errors.push(`${path}: ${e.message}`); return null; }
}

const realms = [];
for (const id of registry.realms) {
  const path = `realms/${id}/realm.js`;
  source(path);
  const r = await load(path);
  if (!r) continue;
  const errs = checkRealm(r, id);
  errors.push(...errs);
  if (!errs.length) realms.push(r);
}
errors.push(...checkMapOverlaps(realms));

for (const id of [...registry.crew, '_template']) {
  const path = `crew/${id}.js`;
  source(path);
  const c = await load(path);
  if (c) errors.push(...checkCrew(c, id === '_template' ? 'your-name' : id, registry.realms));
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem${errors.length > 1 ? 's' : ''}:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${realms.length} realms and ${registry.crew.length} crew members follow the rules`);
