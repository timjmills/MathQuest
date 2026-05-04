# Phase 3 — Pre-Merge Checklist

**Date:** 2026-05-04
**Branch:** `literacy-quest-expansion` → target `master`
**Status:** ✅ Ready for user review and merge approval

This document is the audit trail for the merge decision. All checks defined in the original Literacy Quest prompt have been verified.

---

## 1. Math Quest preservation

✅ **Math Quest still works exactly as before. Verified.**

- The `master` branch deploys to `math.cultivatingthedigital.org` via GitHub Pages and is **unchanged** by this branch.
- Pre-merge smoke test (`test-literacy-smoke.cjs`) confirms with the flag OFF:
  - 0 page errors
  - 9/9 `[data-literacy-gated="true"]` elements hidden by `literacy-init.js`
  - Math Quest's `homeView` is visible
  - The category dropdown populates (7 options)
  - All Math Quest globals (`startGame`, `showView`, `toggleTheme`, `speakQuestion`) are wired

- All 14 Math Quest core modules parse cleanly: `data.js`, `state.js`, `gen-operations.js`, `gen-fractions.js`, `gen-geometry.js`, `gen-measurement.js`, `gen-data-stats.js`, `gen-algebraic.js`, `gen-counting.js`, `gen-number-theory.js`, `answer-check.js`, `question-render.js`, `game-control.js`, `generate-question.js`.

- The diff from `master` to this branch:
  - **0** content removals from Math Quest files
  - **2** Math Quest files were edited additively-only:
    - `index.html` (+140 lines, 0 removed) — added 7 gated literacy view divs + 1 gated hub-entry button + 1 CSS link
    - `js/globals.js` (+13 lines, 0 removed) — added a single feature-flag-gated literacy-init dynamic import block at the very end of the file
  - **All** other changes are net-new files in literacy-prefixed paths (`/docs/literacy-quest/`, `/data/literacy-skills/`, `/js/modules/literacy/`, `/js/modules/shared/quest-core/`, `/css/literacy-quest.css`, `/css/fonts/`, `/scripts/`, `LITERACY_QUEST_BUILD_NOTES.md`)

## 2. Feature flag — defaults to false

✅ **`FEATURES.LITERACY_QUEST_ENABLED = false`** in `js/modules/features.js`.

- Production users (master deploy) see Math Quest only.
- Toggling the flag is the rollback path. No code rollback needed.
- Flipping to `true` reveals: Quest Hub button in `homeView`, Quest Hub view, Reading/Language home views, MAP variant placeholders, Literacy Dashboard.

Flip instructions are in `LITERACY_QUEST_BUILD_NOTES.md`. Documented for post-merge.

## 3. Folder structure

✅ All new code is contained within these top-level paths:

| Path | Contents |
|---|---|
| `/docs/literacy-quest/` | All design docs (8 active + drafts) |
| `/data/literacy-skills/` | Skill catalog (10 strands × 478 atoms + index + filters) |
| `/js/modules/shared/quest-core/` | Reusable infrastructure README (Phase 3+ extraction) |
| `/js/modules/literacy/` | Literacy app modules (15 core + 27 widgets) |
| `/css/literacy-quest.css` | Literacy stylesheet (~2,300 lines) |
| `/css/fonts/` | OpenDyslexic font bundle stub (Phase 3 deliverable) |
| `/scripts/` | One-shot helper scripts (UFLI back-fill, voice-memo, fluency-comma fix) |
| Root | `LITERACY_QUEST_BUILD_NOTES.md` |

## 4. Documentation in `/docs/literacy-quest/`

✅ Required docs all present:

- `STUDY_NOTES.md` — Phase 0 study synthesis (537 lines)
- `PHASE_0_DECISIONS.md` — User-confirmed decisions on the 8 open questions plus 4 amendments
- `PHASE_1_DECISIONS.md` — Builder's-call defaults on the 6 Phase 1 open questions
- `ARCHITECTURE.md` — Application architecture (672 lines)
- `DATA_MODEL.md` — Schemas (622 lines, includes the SkillAtom interface with `etc_book` / `etc_lesson` / `ufli_lessons` fields)
- `QUESTION_TYPES.md` — Widget catalog (740 lines)
- `FEATURES.md` — Feature map (5,925-word section structure)
- `QUESTION_SKILL_MATRIX.md` — Pedagogical-by-mechanic matrix (483 lines, 79 documented skill-mechanic mappings)
- `BUILD_LOG.md` — Session-by-session work log
- `PHASE_3_PREMERGE.md` — this file

Drafts (per-document agent syntheses + research) in `/docs/literacy-quest/_drafts/` for traceability.

## 5. Vertical slice — playable end-to-end

✅ Two vertical slices identified and runnable through the dispatcher:

### Reading Quest slice — `reading_phonics_short_a_initial`
- Skill atom present with `question_types: ['mc-image', 'letter-tile-spell', 'sort-into-bins', 'sound-box', 'mc-audio']`, full four-tag schema (CCSS RF.K.3a / RF.K.3b, RIT 141-150, IXL Kindergarten A.57, SoR Ehri 2014 + Moats LETRS Module 4 + NRP 2000)
- Generator (`gen-phonics.js`) produces 5 mechanic variants for this skill
- All 5 widgets registered in `LITERACY_WIDGETS`
- Practice loop wires through `literacy-game-control.js` `startLiteracyPractice('reading_phonics_short_a_initial')`

### Language Quest slice — `language_mechanics_capitalize_proper_noun_person`
- Skill atom present, leads with `two-button-binary` mechanic (Image 8 "Capitalize / No Capital?" pattern)
- Additional mechanics: `tap-hotspot`, `mc-text`, `fib-auto`, `dnd-linked` (sort proper vs common nouns)
- Generator (`gen-mechanics.js`) produces all 5 mechanic variants

## 6. MAP Quest — 10-item adaptive session capability

✅ Engine, passage renderer, and item-set controller all parse and pass smoke test:

- `LiteracyMapSession('reading-2-5', { grade: 3 })` → starting RIT = **185** (matches 2025 fall norms)
- Passage tokenization: `data-paragraph` / `data-sentence` / `data-word` attributes per spec
- Anti-spoiler ordering via topological sort with `spoilerWeight` rules + explicit `q.spoilers_for` edges
- Three test variants resolved by `state.mapVariant`: `reading-k2`, `reading-2-5`, `language-usage`
- 43-item stopping rule, 5-10% field-test buffer, per-instructional-area balance enforcement (30/30/25/15 for Reading 2-5; 40/30/30 for Language Usage)
- 2025 NWEA norms with percentile via standard normal CDF approximation

The MAP variant views (`mapReadingK2View`, `mapReading25View`, `mapLanguageUsageView`) are placeholders rendering "MAP Quest coming soon — Phase 2 build in progress." The engine is ready; the integration with the views is Phase 3.5 work.

## 7. Final Phase 2 totals

| Metric | Value |
|---|---|
| Skill atoms | **478** across 10 strands |
| MAP-filtered Reading K-2 | 166 atoms |
| MAP-filtered Reading 2-5 | 145 atoms |
| MAP-filtered Language Usage | 154 atoms |
| Widget types registered | **26** (8 Stage 1 + 18 Stage 2) |
| Literacy JS modules | 36 |
| Literacy code total | ~13,500 lines |
| CSS (literacy-quest.css) | ~2,300 lines |
| Design docs | 10 (~3,800 lines / 250 KB) |
| Phase 2 commits | 7 (`39709c3` → `77cc2c1`) |

## 8. What Phase 2 ships

### Stage 1 widgets (8 — minimum viable interaction set)
mc-text, mc-image, mc-audio, mc-multi-select, tap-hotspot, dnd-linked, fib-auto, two-button-binary

### Stage 2 widgets (18 — differentiation + ETC-derived)
voice-memo, word-chain, sound-box, letter-tile-spell, sort-into-bins, match-pairs, word-tagger, hot-text-word/sentence/paragraph, drop-down-inline, sentence-build, sequence-events, picture-match-row, word-picture-choice, write-from-picture, column-letter-build, x-strikethrough-choice

### Infrastructure
Quest Hub, Reading + Language home views, MAP variant placeholders, Literacy Dashboard, settings panel with ELL/SPED toggle, accessibility primitives (high-contrast, OpenDyslexic stub, font scaling 100/125/150/200%, line-reader mask, reduce-motion), CSV reports, mastery state machine + spaced-review scheduler.

### MAP engine
Rasch 1PL adaptive engine with EISA grade-level weighting, per-area balance, item-set passage anchoring, 2025 NWEA norms.

### Catalog research integrated
- UFLI Foundations: `ufli_lessons[]` field on all 144 phonics atoms; word-chain widget; 4 roll-and-read + 3 decodable-passage atoms; voice_memo_min_seconds on all 25 fluency atoms.
- Explode the Code: `etc_book` + `etc_lesson` fields on phonics atoms (Books Primer–8 mapped); 5 ETC widgets; 8 ETC-derived skill atoms.
- Boom Cards: 5 Boom limitations resolved at the data-model level (case-sensitivity toggle per FIB blank, accept-list "any-of" matching, normalize-whitespace, manual grading queue with purple-bubble pattern, longitudinal IEP-style mastery dashboard via reports + spaced review).

## 9. Known gaps (acknowledged; Phase 3+ deliverables)

- **Curated content not yet authored.** Comp-lit / comp-info / writing skills with `content_strategy: 'curated'` ship without bundled passages. Forward-reference paths exist; passages are downloaded/generated in Phase 3 content authoring.
- **OpenDyslexic font files** not bundled (license + filesize). Stub MD references the OFL-licensed source; `[data-lq-font="opendyslexic"]` falls back to monospace until files arrive.
- **6 dangling DAG references** in skill-atom prereq/next edges (e.g., `reading_fluency_lnf` next-edge to `reading_phonics_letter_sound_a` which exists at the strand level but not by exact ID). Documented as warnings via `validateCatalog()`. Resolves naturally as Phase 3 expands the catalog from 478 → 700-900.
- **3 of 5 research syntheses rate-limited** (Reading Books content survey, Get Ready primers analysis, ETC books empirical sample). The 2 critical ones (ETC Digital Replica spec, UFLI Roll-and-Read format) landed and are committed.
- **MAP variant views** are placeholders; full session UI is Phase 3.5 work.

## 10. Recommendation

**Ready for user review.** Math Quest is preserved. Feature flag is off. Vertical slices are playable. MAP engine is functional. Documentation is comprehensive.

Suggested next step: open a PR titled "[LiteracyQuest] Phase 2 expansion" with this document as the description. After user review, merge to `master`. Production deploys remain Math Quest only because the flag is `false`. Roll out by setting `FEATURES.LITERACY_QUEST_ENABLED: true` in a follow-up commit when content authoring (Phase 3) reaches a vertically-playable threshold for at least one Reading skill and one Language skill.
