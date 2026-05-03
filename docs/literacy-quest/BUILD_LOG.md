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
