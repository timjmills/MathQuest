# js/modules/literacy/

Literacy Quest application modules — Reading Quest, Language Quest, and Literacy MAP Quest. **All exports are gated behind `FEATURES.LITERACY_QUEST_ENABLED` at the routing entry points.** Math Quest does not import from this folder.

Folder layout (see `/docs/literacy-quest/ARCHITECTURE.md` for the canonical spec):

- `literacy-init.js` — bootstrap, gated on the feature flag
- `literacy-navigation.js` — view show/hide for the literacy hub
- `literacy-question-render.js` — dispatch a Question to the right widget
- `literacy-answer-check.js` — dispatch a submitted answer to the right checker
- `literacy-skill-codes.js` — extends the existing `?code=` URL share to support `M:` / `R:` / `L:` subject prefixes
- `literacy-dashboard.js` — per-subject progress, RIT estimate, mastery tracker
- `gen-phonemic-awareness.js`, `gen-phonics.js`, `gen-fluency.js`, `gen-vocabulary.js`, `gen-comp-literature.js`, `gen-comp-info.js`, `gen-grammar.js`, `gen-sentence-structure.js`, `gen-mechanics.js`, `gen-writing.js` — procedural item generators (mirror Math Quest's `gen-*.js` pattern; one generator per ELA strand domain)
- `passage-render.js` — wraps a Passage object as line-numbered, paragraph-numbered, word-tokenized HTML for hot-text and item-set support
- `item-set-controller.js` — manages a passage-anchored session (one passage, 3-5 items, shared state, no reload) — the largest architectural addition vs Math Quest
- `map-engine-literacy.js` — port of `map-engine.js` Rasch 1PL with per-instructional-area balance and EISA grade-level weighting
- `widgets/` — Literacy-specific interactive widgets (see `widgets/README.md`)

Importing pattern (matches Math Quest convention):

```js
// from globals.js
import { FEATURES } from './modules/features.js';
if (FEATURES.LITERACY_QUEST_ENABLED) {
    import('./modules/literacy/literacy-init.js').then(m => m.initLiteracy());
}
```
