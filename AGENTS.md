# AGENTS.md

**MBZUAI Vibe Land** is the Notredame Lab at MBZUAI as a pixel-art world map. Each lab project is an island (a *realm*) and each lab member is a walking avatar (a *crew member*). Lab members and their coding agents add themselves and their projects here, so this file is for both.

It is a static site: plain HTML, CSS and JavaScript modules, a 640×360 canvas scaled up crisp. There is no build step and no dependencies.

## Run it

```bash
python3 -m http.server 8000     # then open http://localhost:8000
node tools/check.mjs            # checks every realm and crew file; CI runs it on every pull request
```

Opening `index.html` as a file does not work: browsers only load JavaScript modules over HTTP. After you edit a file, hard-reload (Ctrl+Shift+R), because browsers cache modules.

A file the page skips shows as a red box at the bottom left and as a console warning prefixed `[vibe-land]`. Check both after every change.

Pushing a change under `.github/workflows/` over HTTPS with a `gh` token needs the `workflow` scope (`gh auth refresh -s workflow`); an SSH remote works without it (2026-11-25).

## Deploy

The repo lives in the lab org [NotredameLab-MBZUAI-bls](https://github.com/NotredameLab-MBZUAI-bls) (moved from `vagkaratzas` on 2026-11-26). GitHub Pages serves `main` from the repo root, with no build step: https://notredamelab-mbzuai-bls.github.io/mbzuai-vibe-land/. A merge to `main` is live a minute later.

## Layout

| Path | What |
|---|---|
| `registry.js` | The lists of realm ids and crew ids the page loads. Alphabetical, one id per line. |
| `crew/<id>.js` | One crew member: card text, pixel sprite, optional effects. |
| `crew/_template.js` | The file to copy when you join. |
| `realms/<id>/realm.js` | One realm: text, quests, links, island art on the world map, the inside scene. |
| `src/pixel.js` | The painter (`p.rect`, `p.px`, `p.line`, `p.oval`, `p.disc`, `p.pattern`, `p.alpha`, `p.at`, `p.island`) and shared props (`hazard`, `palm`). |
| `src/overworld.js` | The world map: sea, channels, the lab HQ, the uncharted plot, the sea dragon. |
| `src/main.js` | Loading, scenes, walking, hover, clicks, the realm panel and the cards. |
| `src/validate.js` | The rules below as code. The page skips a file that breaks them; `tools/check.mjs` fails on it. |

## Join the crew

1. Copy `crew/_template.js` to `crew/<your-id>.js`. Use your first name or GitHub username, in lowercase, as the id.
2. Fill in the fields and draw yourself (rules below).
3. Add `'<your-id>'` to `crew` in `registry.js`, in alphabetical order.
4. Run `node tools/check.mjs`, look at yourself in the browser, and open a pull request.

### The fields

| Field | Required | Rule |
|---|---|---|
| `id` | yes | Same as the file name: lowercase letters, digits and dashes. |
| `name` | yes | Up to 40 characters. |
| `class` | yes | Your RPG class, up to 32 characters ("Cyber-Bioinformatician", "Pipette Paladin"). |
| `motto` | yes | Your speech bubble, up to 90 characters. |
| `realms` | yes | Ids of the realms you work in, e.g. `['robotics', 'egp']`. You walk around inside each one and show in its party. `[]` keeps you at HQ. |
| `github` | no | Your GitHub username; your card links to it. |
| `stats` | no | Up to 6 stats, each a whole number from 1 to 10, names up to 12 characters. |
| `skills` | no | Up to 8 short strings. |
| `sprite` | yes | Your pixel art (below). |
| `fx` | no | A function that draws effects on top of you every frame (below). |

### The sprite

- At most **16 pixels wide and 24 tall**. Every row of every frame has the same length.
- One character per pixel. `.` is transparent. Every other character must be a key in `palette`, and every colour must be a hex code like `#a1b2c3`.
- Face the viewer. The game mirrors you when you walk left, so put anything one-sided (a weapon, a bag) on the right side of the picture.
- `frames[0]` is standing still. Up to 3 more frames play in turn while you walk (legs apart is enough).
- Give yourself a dark outline (`#14141c` or similar), so you read on sand, grass and lab floors alike.
- Keep it friendly and work-safe: it is the lab's public page.

### Effects (`fx`)

`fx(p, { x, y, w, h, flip, t, moving })` runs every frame after your sprite is drawn. `x, y` is the top-left of your sprite, `flip` is true when you face left, `t` is the time in seconds. Draw with the painter only: `p.px`, `p.rect`, `p.line`, `p.disc`, `p.alpha(a, () => ...)` (see `src/pixel.js`). Glows, sparks, a pet, a hovering drone: all fine. Rules:

- Stay within about 10 pixels of your sprite.
- Cheap: a few dozen pixels per frame, no loops over the whole screen.
- No `document`, `window`, `fetch`, storage, `eval` or dynamic `import()`. The checker rejects them. Your file draws, nothing else.

If `fx` throws, the page turns it off and carries on. `crew/vangelis.js` has a worked example: an omni-tool that flickers, sparks, and forms a blade every six seconds.

### Ask your agent

Point your coding agent at this file and describe yourself. For example:

> Read AGENTS.md and crew/_template.js. Make me a crew member: id `vangelis`, Vangelis Karatzas, GitHub `vagkaratzas`, in the robotics realm. A half-cyborg: white, male, black hair, the right half of the face metal with a glowing optic, with a Mass Effect style omni-tool on the forearm as a weapon. Add an fx that makes the omni-tool flicker. Then run node tools/check.mjs.

## Raise a realm (a new lab project)

1. Copy a realm folder: `realms/robotics/` for an active project, `realms/egp/` for one under construction. Rename it to `realms/<id>/` (short, lowercase).
2. In `realm.js`, change every field (table below), then draw the island and the scene.
3. Add `'<id>'` to `realms` in `registry.js`, in alphabetical order.
4. Pick a free spot on the map. The checker rejects an island that overlaps another, the lab HQ, or the map edge. The dashed "Uncharted waters" plot (around `x: 130, y: 282`) is free and disappears once a realm sits there.
5. Run `node tools/check.mjs`, check the map and the scene in the browser, and open a pull request.

| Field | Rule |
|---|---|
| `id` | Same as the folder name. |
| `name`, `tag` | Up to 40 and 16 characters. `tag` is the short code in the panel. |
| `status` | `'active'` or `'construction'`. A construction realm shows a hazard badge and a progress bar. |
| `progress` | 0-100, for construction realms. |
| `blurb` | One line for the hover tip, up to 140 characters. |
| `about` | A list of paragraphs for the panel. |
| `quests` | `[{ title, done }]`: milestones; `done: true` ticks one. |
| `links` | `[{ label, url }]`, https only. |
| `map` | `{ x, y, rx, ry }`: the island's centre and radii on the 640×360 world map. |
| `walk` | `{ x, y, w, h }`: the box inside the scene where the realm's crew walk (their feet). |
| `drawIsland(p, t)` | Draws the island on the world map, with the origin at the island's centre. Start with `p.island(0, 0, rx, ry, { ground, sand })`. Stay inside the radii. |
| `drawScene(p, t)` | Draws the whole 640×360 scene inside the realm. |

Scene rules:

- **The info panel covers the right third (x > 410).** Keep what matters left of it; let the background run underneath.
- Paint the whole canvas every frame, back to front: sky or wall first.
- Shared props come from the painter module: `import { hazard, palm } from '../../src/pixel.js';`.
- No text in the canvas: names, quests and links go in the fields, and the panel shows them.
- Same limits as crew files: painter only, no DOM, network, storage or `eval`; keep the file under 40 kB.

### Update a realm

Most updates are text: tick a quest, add a paragraph, add a link, raise `progress`, or switch `status` to `'active'` once a project is under way. Edit `realms/<id>/realm.js` and open a pull request. To join a realm, add its id to `realms` in your own crew file.

## House rules

- **The page is public.** No secrets, no unpublished results, and never any participant or patient data: EGP and HPP are human cohorts. Describe the project, not the data.
- Edit your own crew file and the realms you work on. Change someone else's file only with their OK.
- One feature per pull request (yourself, or one realm). `node tools/check.mjs` must pass.
- The checker is a guard rail, not a sandbox: crew and realm files run as code in visitors' browsers. Reviewers read each file before merging.
- Stay in the look: pixel art, flat colours, a dark outline, no images or external assets. The sea dragon stays.
