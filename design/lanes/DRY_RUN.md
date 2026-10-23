# Integrator dry run — the E5 gate (IMPROVEMENT_PLAN §1.6.6)

`node tests/scripts/ws-integrate.mjs --dry-run` rebuilds today's tree from manifests in a temporary `git worktree`
of HEAD and requires no diff and the four gates green. The main working tree is never modified (the worktree is
removed afterwards). Re-run it after any change to the integrator or to the registry files' shape.

## Run of 2026-10-23

| | |
|---|---|
| Commit | `dbdbf14c13398baa9a55417988977aef7b2de7ad` (branch `claude/sweet-newton-c8wrv1-wip-wave0-process`) |
| Cut | every skill pinned from share code `T6` on (the P4 appends, 2026-09-20) |
| Skills covered | **150** over **23** categories: 36 real skills (P4 19, P9 3, count-by + number patterns 2, P10 time and money 8, round on a number line 3, `number_chart_fill`) and all **114 presets** (batch 1: 14, batch 2: 100) |
| Manifests | 7, one per share-code pin section of `skill-codes-frozen.js`, applied in that order (merge order 10 … 70) |
| Blocks | 105 layout blocks over 7 files: `data.js`, `skill-codes-frozen.js`, `skill-presets.js`, `standards.js`, `wrm.js`, `search-terms.js`, `generate-question.js` |
| Data per skill | entry 150, code 150, grade 150, standards 150, terms 123, wrm 89, printSize 35, timeCategory 8, concepts 6, primaryTerms 4, mixedPoolExclude 1, generatorCategory 1, preset 114 |

| Step | Result | Time |
|---|---|---|
| worktree of HEAD | created under the scratch folder (`WS_INTEGRATE_SCRATCH`) | 5.9 s |
| (a) extract | 150 skills → 7 manifests | 0.2 s |
| (b) peel → the base | 7 files, 954 lines removed; every file parses (`node --input-type=module --check`); `data.js` imports; `ws-code-snapshot` on the base: `35 FAILURE(S)` (expected: the pins are gone) | 1.5 s |
| (c) apply in merge order | 7 manifests, 105 blocks inserted | 1.4 s |
| (d) `git diff --exit-code` | **empty** (and `git status --porcelain` clean) | — |
| re-apply (idempotence) | no-op, no file changed | 0.3 s |
| (e) `ws-code-snapshot.mjs` | `ws-code-snapshot: OK (722 codes, 35 categories, +150 appended since the pinned baseline of 572, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, 3089 option round trips)` | 0.8 s |
| (e) `ws-standards.cjs` | `ws-standards: OK` | 0.2 s |
| (e) `ws-search-terms.cjs` | `ws-search-terms: OK` | 4.0 s |
| (e) `ws-presets-unit.mjs` (browser) | `ws-presets-unit: OK (114 presets: host live, values legal, defaults = preset, explicit wins, seeded items = host items, tags + terms + print size + pinned code, options round-trip)` | 6.0 s |
| (f) data-only rebuild | peel again, apply the manifests **without** their layout (every line rendered by the integrator at the end of its registry): share codes and positions identical to HEAD (the text differs by design: 455+ / 428−); `ws-code-snapshot`, `ws-standards`, `ws-search-terms`, `ws-presets-unit` all OK again | 12.7 s |
| **Total** | `ws-integrate: OK` | **33.7 s** |

Step (f) is what shows the manifests' **data** is complete, not only their text: a new lane writes data only, and
the same gates pass on a tree whose lines the integrator wrote itself.

## What stayed in the base for these skills (and why that is right)

- `SKILL_TIME_CATEGORY` and `SKILL_PRINT_SIZE` for `number_chart_fill`: packed on one line with `hundreds_chart_fill`
  (a base skill), so the extractor left that line whole (reported as a note). A lane writing data gets its own line.
- `FROZEN_CATEGORY_ORDER` entries of the 36 real skills: frozen history; new skills never get one.
- Lane code: generator branches and skill-id lists in `gen-*.js`, provider bodies, cell templates, `skill-options.js`
  schemas and `skill-option-keys.js` keys, existing `CONCEPT_RULES` regexes that name these skills among base ones,
  `build-list.js` / `standards-audit.js` citations, curriculum link JSON, tests, design docs (README "Not yet
  manifest data").

## Self-test (same day)

`node tests/scripts/ws-integrate.mjs --self-test`: **26/26 checks pass**, 7 s. Seeded fixtures (mulberry32, seed
20261023) on copies of the real registry files in a temp dir: apply + idempotent re-apply (byte-identical), only
lines inserted, codes decode and nothing moves, two lanes in merge order = one combined manifest, `--order file`,
conflicting duplicate id / pinned code / existing skill refused, reorder and delete refused by the ledger, unknown
(remove) field refused, a mid-category SKILLS insertion refused, a refused manifest leaves the tree untouched, layout
text that disagrees with the data refused, a new skill that would move an existing share code refused and rolled
back, a skill without its pinned code refused, extract → peel → apply round trip byte for byte, `--stamp` refused
with `--dry-run`, `--self-test`, `--preview` and `--peel`, and the repository's registry files unchanged.
