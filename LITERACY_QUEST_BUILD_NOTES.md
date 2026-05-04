# Literacy Quest Build Notes

This document records the branch isolation strategy, deploy mechanism, feature flag plan, and working-style rules for the Literacy Quest expansion. Read it before contributing.

## Project status

**Phase 0 (study) — IN PROGRESS.** Reference documents read; STUDY_NOTES.md being assembled by parallel research agents. No feature code written yet.

## Branch strategy

- **Production branch**: `master` — auto-deploys to https://math.cultivatingthedigital.org via GitHub Pages (custom domain set by `CNAME` file at repo root).
- **Working branch**: `literacy-quest-expansion` — all Literacy Quest work happens here. Do NOT merge to `master` until Phase 3 pre-merge checklist is complete and the user has explicitly approved.
- **Live page is untouched** while we work on this branch because GitHub Pages serves only `master`. Anyone hitting the live URL gets the existing Math Quest only.
- **Local preview**: `npx serve .` from the project root, then open `http://localhost:3000`. Test the literacy routes locally; never push them to `master` until merge.
- **Commit prefix**: every commit on this branch starts with `[LiteracyQuest]`.

## Feature flag

A single feature flag gates every new route, navigation entry, and component:

```js
// js/modules/features.js
export const FEATURES = {
    LITERACY_QUEST_ENABLED: false,
};
```

Rules:
- Default to `false`. Anything visible to a production user must be behind this flag.
- The Quest hub (Math / Reading / Language picker) is gated.
- All `/reading-quest`, `/language-quest`, `/map-quest/reading-*`, `/map-quest/language-*` routes are gated.
- All `/data/literacy-skills/` imports are deferred behind the flag so they don't add to the production bundle when off.
- To flip the flag during testing or after merge: edit `js/modules/features.js` and set `LITERACY_QUEST_ENABLED: true`.
- After full merge & rollout: the flag stays in the codebase (we don't ship dead-code-elimination), and the rollback path is to flip it back to `false`.

## Math Quest preservation

- Math Quest routes, components, data shapes, and styling stay untouched **except** to extract genuinely shared infrastructure into `/js/modules/shared/quest-core/`.
- The 8 generator modules (`gen-operations`, `gen-fractions`, `gen-geometry`, `gen-measurement`, `gen-data-stats`, `gen-algebraic`, `gen-counting`, `gen-number-theory`) are MATH-ONLY and not touched by Literacy Quest.
- `data.js` `DOMAINS`/`SKILLS` definitions are not modified — Literacy Quest adds its own catalogs in `/data/literacy-skills/`.
- The math-only widgets (numpad with digits, T-chart factor pairs, area-model with grid, fraction circles, base-10 blocks, number lines, clock SVGs) stay where they are.
- If a Math Quest assumption blocks reuse, surface the conflict and ask before refactoring. Never modify Math Quest's behavior without explicit approval.

## Folder map for new code

| Folder | Contents |
|---|---|
| `/docs/literacy-quest/` | All design documentation (STUDY_NOTES.md, ARCHITECTURE.md, DATA_MODEL.md, QUESTION_TYPES.md, FEATURES.md, QUESTION_SKILL_MATRIX.md, BUILD_LOG.md). |
| `/docs/literacy-quest/references/` | Mirror or symlinks to the four reference markdown files + the example images. |
| `/js/modules/shared/quest-core/` | Extracted reusable Math Quest infrastructure (state pattern, storage, gamification, MAP engine, retry pipeline, etc.) — anything Math Quest, Reading Quest, and Language Quest all use. |
| `/js/modules/literacy/` | All Literacy Quest application modules (gen-reading, gen-language, render-passage, item-set, map-engine-reading, etc.). |
| `/js/modules/literacy/widgets/` | New literacy-specific widgets (sound-box, build-with-tiles, hot-text-passage, two-button-binary, etc.). |
| `/data/literacy-skills/` | TypeScript skill catalogs by strand, mirroring Parts 1-9 of the K-5 ELA Scope and Sequence document. |
| `/css/literacy-quest.css` | Literacy Quest visual styles (loaded conditionally on the flag). |

## Working style

- **Commit early and often.** Each commit on `literacy-quest-expansion` starts with `[LiteracyQuest]`.
- **BUILD_LOG.md** at `/docs/literacy-quest/BUILD_LOG.md` gets a dated entry every working session: what was done, what was discovered, what blocked progress, what is next.
- **After every phase, stop and ask the user for review.** Do not silently continue. Phases:
  1. Phase 0 — Study (this phase). Output: STUDY_NOTES.md.
  2. Phase 1 — Architecture & skill mapping. Output: 5 design docs + skill inventory files.
  3. Phase 2 — Build (only after Phase 1 approved).
  4. Phase 3 — Pre-merge checklist + PR.
- **TypeScript strictly; no `any` in new code.** (Note: existing Math Quest is JS, not TS. Literacy Quest's new files use TS where practical, JSDoc types where TS interop is awkward in this no-bundler setup.)
- **Components small and composable.** Each widget is a standalone module with `renderX` + `checkX` exports, mirroring the existing Math Quest widget pattern.
- **Accessibility-first.** ALT text, keyboard nav, screen reader Z-order, audio playback per element, OpenDyslexic toggle, high-contrast, line reader, font scaling. Build these in from day one — do not retrofit.
- **Conflict resolution.** If the K-5 ELA reference, MAP reference, or Boom catalog disagree, surface the conflict and ask. Don't silently pick one.

## End-state target

A Grade 5 teacher in Doha sits a 2-3-years-behind ELL student down at a tablet. The student picks Reading Quest, drills phonics for 12 minutes with audio support and Elkonin sound boxes, switches to MAP Quest mode for a 10-item targeted practice on Reading 2-5 RIT 181-190 main idea items, then ends with a Language Quest "Capitalize or No Capital?" deck. The student goes home having practiced specific, leveled, scaffolded, joyful skills.

Build with that student in mind.
