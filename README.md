# MBZUAI Vibe Land

The Notredame Lab at MBZUAI as a pixel-art world. Every lab project is an island on the map, and every lab member is an avatar walking around it. Click an island to dive into the project: what it is, its quests, its party, its links.

**Play:** https://vagkaratzas.github.io/mbzuai-vibe-land/

| Realm | Status |
|---|---|
| Nextflow Robotics: wet-lab robots as steps of a Nextflow pipeline | active |
| Emirati Genome Project (EGP) | under construction |
| Human Phenotype Project (HPP) | under construction |

## Join in

Everyone vibe-codes their own character and their projects' realms. Point your coding agent at [AGENTS.md](AGENTS.md) and describe yourself, then open a pull request. The rules (sprite size, palette, effects, where islands go) are there, and `node tools/check.mjs` checks them.

```bash
python3 -m http.server 8000     # http://localhost:8000
node tools/check.mjs
```

Inspired by Michelle Bu's [Fewer slides, more dragons](https://www.breakingchange.blog/p/fewer-slides-more-dragons): a village that people kept adding to, with git keeping it sane. Here be dragons too; watch the sea.
