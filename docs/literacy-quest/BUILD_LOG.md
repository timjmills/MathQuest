# Literacy Quest Build Log

## 2026-05-03 — Phase 0 study phase

**What I did**

- Created branch `literacy-quest-expansion` off `master` (clean working tree).
- Set up `/docs/literacy-quest/` with `_drafts/` and `references/` subfolders.
- Wrote `LITERACY_QUEST_BUILD_NOTES.md` at repo root: branch isolation strategy (GitHub Pages auto-deploys only `master`; this branch stays unpushed-to-master until Phase 3), single feature flag plan (`FEATURES.LITERACY_QUEST_ENABLED = false`), folder map, working-style rules, end-state target.
- Spawned 6 parallel research agents:
  1. K-5 ELA Scope and Sequence study (981-line reference) → produced `_drafts/k5-ela-synthesis.md`
  2. MAP Growth reference study (557 lines) → `_drafts/map-growth-synthesis.md`
  3. Boom Cards comprehensive catalog (322 lines) → `_drafts/boom-comprehensive-synthesis.md`
  4. Boom Cards basic catalog (239 lines) → `_drafts/boom-basic-synthesis.md`
  5. Math Quest codebase inventory (Explore agent) → `_drafts/math-quest-architecture.md`
  6. 8 example images analysis (visual baseline) → `_drafts/example-images-synthesis.md`
- Reconciled all six syntheses into `STUDY_NOTES.md` with: triangle synthesis (Skills × Mechanics × Engine), per-document summaries, cross-document tensions and resolutions, top 25 implications for Phase 1, and 8 open questions for the user.

**What I discovered**

- All four reference documents already exist in `Tim's Documents/Literacy Quest/` (relative to project root). All 8 example images are there too (Example Image 1-8, with #5 misspelled as "Exapmle Image 5").
- The "single largest architectural departure from Math Quest" is item-set passage management for Reading 2-5: the current Math Quest engine generates one question and discards it; Reading 2-5 needs a passage-anchored session object with shared state across 3-5 items.
- The K-5 ELA reference does not actually use a literal `is_map_tested` boolean in the schema — `rit_band` + `rit_test` populated together serve that purpose.
- Five tensions surfaced between the reference docs (audio defaults K-2 vs 2-5, mastery thresholds 0.85 vs 0.70, 2020 vs 2025 norms, six-syllable-types as 12 atoms vs 1 widget, single-skill decks vs mechanic variety) — all resolved in §8 of `STUDY_NOTES.md`.
- Math Quest's `map-engine.js` Rasch 1PL implementation is a near-direct port to literacy. The same `P = 1 / (1 + exp(-(θ - b)))` formula applies; what's new is per-instructional-area balance enforcement and EISA grade-level weighting.
- The two innovations visible in the example images that are NOT standard Boom primitives: (a) color-coded word tagging from Image 4 (Grammar Detective) — a hybrid hotspot+categorization widget for sentence-level POS; (b) audio-cued drag-to-spell from Image 6 (Consonant Digraph) — combines phonemic awareness with orthographic production. Both are Stage 2 priorities.

**What blocked progress**

- Nothing blocked Phase 0 itself. The 8 open questions in §10 of `STUDY_NOTES.md` need user resolution before Phase 1 architecture can be finalized — most importantly the build-order priority (Phonics first per user's classroom focus, vs strict Parts 1-4 sequence per the ELA reference), and the audio pipeline budget decision (pre-rendered Polly Neural ~$5 first-render vs live Web Speech API for MVP).

**What is next**

- Stop and ask user for review of `STUDY_NOTES.md` and answers to the 8 open questions.
- After approval, begin Phase 1: write `ARCHITECTURE.md`, `DATA_MODEL.md`, `QUESTION_TYPES.md`, `FEATURES.md`, `QUESTION_SKILL_MATRIX.md`, and the skill inventory TypeScript files in `/data/literacy-skills/`. Stop again for review before Phase 2 build.

## 2026-05-03 (continued) — Phase 1 design docs complete

**What I did**

- User reviewed `STUDY_NOTES.md` and answered all 8 open questions. Recorded as `PHASE_0_DECISIONS.md`:
  1. Build order: builder's call (going Phonics first per Tim's classroom focus)
  2. Audio: free Web Speech API (no Polly Neural)
  3. Norms: 2025 (default; no 2020 toggle)
  4. Voice Memo: dropped entirely
  5. Content: AI-generated procedural generators (mirrors `gen-*.js` math pattern)
  6. Codes: unified `?code=` with subject prefix (`M:` / `R:` / `L:`)
  7. Roster: same anonymous setup as MAP Quest math (no login, no class lists)
  8. Placement: dropped (manual RIT band picker instead)

- Spawned 5 design-doc agents in 2 waves:
  - Wave 1 (parallel): `ARCHITECTURE.md` (672 lines, 31 KB), `DATA_MODEL.md` (622 lines, 29 KB), `QUESTION_TYPES.md` (740 lines, 46 KB).
  - Wave 2 (parallel after Wave 1): `FEATURES.md` (40 KB), `QUESTION_SKILL_MATRIX.md` (65 KB).

- Set up folder skeleton with READMEs:
  - `js/modules/features.js` — single feature flag `LITERACY_QUEST_ENABLED: false`
  - `js/modules/literacy/` + `widgets/` (with READMEs documenting Stages 1-4 widget list)
  - `js/modules/shared/quest-core/` (with README listing the 19 reusable Math Quest modules)
  - `data/literacy-skills/{reading,language,map-quest}/` (with README documenting build priority + example SkillAtom)

- Wrote `data/literacy-skills/map-quest/filter.js` — computed filtered views by `rit_test`, plus `atomsForRitWindow(testVariant, ritRange)` and `groupByInstructionalArea(atoms)` helpers for the adaptive engine.

- Spawned 4 skill-inventory agents in parallel:
  - `reading/phonics.js` (70-90 atoms — the priority, biggest payoff for Tim's class)
  - `reading/phonemic-awareness.js` (20-25 atoms — foundational, scaffolds phonics)
  - `language/mechanics.js` (30-40 atoms — capitalization+punctuation+spelling, includes Image 8 "Capitalize or No Capital?" mapping to two-button-binary widget)
  - Combined agent for the other 7 strands (`fluency`, `vocabulary`, `comprehension-literature`, `comprehension-informational`, `grammar`, `sentence-structure`, `writing`) — 8-15 atoms each, plus the `HASBROUCK_TINDAL_ORF_2017` named export in fluency.js

**What I discovered**

- The 5 design docs total ~3,800 lines / ~250 KB. Heavy use of tables (especially QUESTION_SKILL_MATRIX.md's 79-skill cross-reference) and code blocks (DATA_MODEL.md's full TS interfaces).
- ARCHITECTURE.md's biggest decision: reuse `gameView` and `mapView` with `state.subject` / `state.mapVariant` discriminators rather than duplicating views. Avoids duplicating timer/XP/banner chrome.
- DATA_MODEL.md's biggest decision: `is_map_tested` is computed (not stored) — a getter on the SkillAtom that returns `rit_test != null && rit_band != null && rit_band !== "n/a"`. Cleaner than maintaining a redundant boolean.
- QUESTION_TYPES.md catalogs 23 widgets total: 6 Stage 1 + 14 Stage 2 + 7 Stage 3 + 2 Stage 4 (deferred). Voice Memo explicitly NOT in the list per Q4.
- FEATURES.md's vertical slice for MVP: `phonics_short_a_initial` (Reading) + `mechanics_capitalize_proper_noun` (Language, matches Image 8). Both with ≥3 mechanics, both end-to-end playable.
- QUESTION_SKILL_MATRIX.md documented 79 skill atoms with their `question_types[]` arrays — these flow directly into the skill inventory files agents are now writing.

**What blocked progress**

- Nothing. Smooth Phase 1 execution. The skill inventory agents are running with all 5 design docs as authoritative reference.

**What is next**

- Wait for the 4 skill inventory agents to complete (10 files total).
- Verify each file parses with `node --input-type=module --check < <file>`.
- Create the `index.js` rollup that re-exports all skills + filter helpers.
- Update BUILD_LOG with skill inventory details.
- Commit Phase 1 deliverables and push to `literacy-quest-expansion`.
- Stop and ask user for review before Phase 2 build begins.

## 2026-05-03 (continued) — Phase 1 skill inventory complete

**What I did**

- Spawned 4 parallel skill-inventory agents:
  - phonemic-awareness.js — 26 atoms (passed)
  - mechanics.js — 34 atoms (passed)
  - 7-strand combined agent — 65 atoms across fluency / vocabulary / comp-lit / comp-info / grammar / sentence-structure / writing (passed)
  - phonics agent — **failed mid-stream with 32K output token cap**. No partial file landed.
- Wrote phonics.js directly with 50 representative atoms (concise format, shared SoR_DECODING / SoR_SYLLABLES / SoR_MORPHOLOGY / SoR_HEART constants, shared ELL/SPED scaffold strings, shared MASTERY constants). Covers: single consonants, all 5 short vowels (initial/medial/final for short_a; medial-only for e/i/o/u; mixed), VCe long vowels (a/i/o + mixed), 4 digraphs (sh/ch/th/wh), 4 blends (l/r/s/final), 3 vowel teams (ai-ay/ee-ea/oa-ow), 3 r-controlled (ar/or/er-ir-ur), 2 diphthongs (oi-oy/ou-ow), y-as-vowel, soft-c, soft-g, schwa, all 6 syllable types, 2 syllable-division patterns (vc/cv + v/cv), 3 heart words, 2 multisyllabic, 4 morphology atoms (un-/re-, -ed/-ing, dis-/pre-, Greek/Latin roots).
- Fixed one dangling internal DAG ref (`reading_phonics_short_a_in_blends` removed from `reading_phonics_short_a_medial.next_skill_ids`).
- Wrote `data/literacy-skills/index.js` rollup — single import point, exports `ALL_SKILLS`, `SKILLS_BY_ID`, per-strand named exports, `walkSkillGraph`, `validateCatalog`. Plus re-exports the 5 MAP filter helpers from `map-quest/filter.js`.
- Validated all 11 skill JS files parse cleanly with `node --input-type=module --check`.
- Validated full catalog via `index.js validateCatalog()`.

**Final Phase 1 stats**

- 5 design docs (~3,800 lines / 250 KB): STUDY_NOTES, PHASE_0_DECISIONS, ARCHITECTURE, DATA_MODEL, QUESTION_TYPES, FEATURES, QUESTION_SKILL_MATRIX.
- 11 skill catalog files in `/data/literacy-skills/` totaling **175 atoms**:
  - phonemic_awareness: 26
  - phonics: 50 ← priority strand for Tim's class
  - fluency: 8 (+ HASBROUCK_TINDAL_ORF_2017 norms table)
  - vocabulary: 12
  - comprehension_lit: 10
  - comprehension_info: 9
  - grammar: 11
  - sentence_structure: 7
  - mechanics: 34 (incl. 12 capitalization atoms feeding the Image 8 two-button-binary widget)
  - writing: 8
- MAP filter views computed correctly: Reading K-2 (71 atoms), Reading 2-5 (40 atoms), Language Usage (60 atoms).
- 7 dangling DAG refs remain — all point to atoms not built in the Phase 1 sample (e.g., `reading_phonics_letter_sound_a` is referenced by fluency LNF but only `reading_phonics_letter_sound_consonant_basic` was built). All will resolve when Phase 2 expands sub-domains. Document via `validateCatalog()` warnings, not errors.
- Folder skeleton ready: `/js/modules/features.js`, `/js/modules/literacy/{,widgets/}/README.md`, `/js/modules/shared/quest-core/README.md`.

**What I discovered**

- Single-shot agent generation of 70-90 atoms with full prose for every field exceeds the 32K output token budget. Strategy for future bulk content generation: split sub-domains across multiple agents, OR use shared constants for repeated prose (the approach I took for the direct phonics.js write).
- The variety rule is satisfied across all 175 atoms (every atom has ≥3 question_types).
- The DAG works as intended — `walkSkillGraph()` can traverse prereq/next chains for the practice loader's early-success priming.

**What blocked progress**

- The phonics agent token cap. Resolved by writing the file directly with a compact format.

**What is next**

- Commit Phase 1 to `literacy-quest-expansion` branch.
- Push to remote (no production impact — master deploys, this branch doesn't).
- Stop and ask user for review of Phase 1 deliverables before Phase 2 build begins.
