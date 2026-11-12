# lf-ops-props - BUILD lesson #4 "Properties of multiplication" (3.OA.B.5), fresh builder (Opus medium, rebuild after rule 7)

Skills: multiplication:mult_properties, multiplication:arrays_groups, multiplication:count_by_tables.
Branch: claude/sweet-newton-c8wrv1-lf-ops-props (from master d34311d5; master 73e96fc1 merged in at 71d1109c).

## Status: STOPPED (rule 7) - the empty-band class is not fixed; no critic

## Step 1 - ported from lf-ops-fix4 (27ceb360), cherry-picked with -x
- fe484180 mult_properties forms 1-3 on kit cells (split array, x1 / x0 equation cell), provider hooks; forms default [0]
  (skill-options: appended after master's lf-ops div_facts block, both kept).
- 3fd42807, 69f8a829, 0e186f6a arrays_groups picture box / banding, CL-40 spacers, arrays lessonStepState; options-render pin
  count_by_tables jumps=15 (merged beside master's placevalue pins).
- 3d8bca1b, f31a5b7d, a3e49292 count-row wrap on the row's live width, shaped tiles keep the box pitch, twin tiles >= 44 px.
- 54bcf16c titles / Rule / vocab from options; countby "I Can count by 2s to 12s"; test measured at its level
  (print-sheet buildLesson kept master's library path and passes the skill's opts to it).
- 0fac67ea True or False? / Reason It one corrected number, wide Reason It items; 8faaef11 error-analysis tags outside;
  e2a7e9ee boxes >= 14 mm one width a section; b499e33d phone tap wording (additive CSS); 32ded9b6, 27ceb360 arrays-turn 2 columns.
- 0f2aeecb titlerep (lessonfit reads the split payload); 42c92dac ws-cell-checks TITLE / LESSON-OPT (opt-in here: --rules ...,TITLE,LESSON-OPT,
  so other lanes' default runs are unchanged) + tests/fixtures/precritic/card-titles.json.
- Lesson data: master moved lesson records to lessons/families/*.js, so the prereqs.js hunks were re-made as library records:
  routines `mult-arrays-count`, `mult-turn-array` and lessons `skill:multiplication:arrays_groups`, `skill:multiplication:mult_properties`
  in families/multdiv.js (prereqsPending, casesPending, iconsPending); `byOption` (forms 1 / unit / mixed) read by
  prereqs.js optionLesson, applied in lessonFor(cat, skill, opts) and in print-sheet buildLesson's library record.
- Cards: design/cards/ops-tables and count-row copied unchanged from 7f06c72d (signed 2026-11-07). On master they FAIL
  ws-spec-card --check-signed: rule text drift (TY-10b; PT-FRW-5/6), regenerated body differs, ops-tables `band=36` undecided.
  A re-sign by the owner is needed; this lane may not edit a signed card.
- Not ported: interim BAND / SLOT / GRIDEVEN (1965d75, 2afcb9f; master has H13-ABS / GRID-EVEN-ALL / ws-empty-band), the card-plan
  precritic rows and PG-23 sections sheet (already on master), the fix4 backtest rows for checks master already carries.
- After the port: ws-boot-smoke OK, ws-code-snapshot OK (732 codes), ws-lesson-coverage OK.

## Step 2 - checks
- The empty-band check exists on master: ws-empty-band (EB-BAND / EB-SIDE / EB-FOOT / EB-EDGE) renders every role the signed card
  offers x S/M/L for ANY template, arrays / arrays-turn / count-row included. Nothing new was needed to see the class.
- Backtest: tests/fixtures/precritic/backtests-empty-band.json row `eb-lfops-props-arrays-turn` - FAILS on 27ceb360 and on this
  branch (EB-BAND 27 on mult_properties); pass commit TBD (pending), because the fix was not made.

## Precritic before (partial: run on 1ecc4f2e, stopped once the tree changed under it; logs scratchpad precritic-before-dir)
FAIL: node-lint S1 (LESSON-DATA / OPTION-HELP / WRONG-FITS), spec-card --check-signed (above), empty-band (EB-BAND 153, EB-SIDE 15,
EB-EDGE 15, EB-FOOT 68), print-lint lesson L and S, print-lint sections S and L (PG-23), grade-render --gate (lesson/test/independent),
sibling-compare, cell-checks (mult_properties, arrays_groups), grade-render other roles (mult_properties).
PASS: node-lint, providers-unit, code-snapshot, visual-quality, content-audit, lessonfit, options-verify (baseline), presets-unit,
print-lint kit S/M/L, coverage-matrix, grade-render other roles (arrays_groups, count_by_tables), screen-slots.

## Step 3 - two attempts at the band class, both with NO measurable effect (reverted; diff kept in the lane scratchpad)
1. `dealtFloor` in the arrays / arrays-turn / count-row footprints and, in buildSheet's independent / more-practice count loop, the
   section floor taken from the items HELD (as a mixed pool's) instead of probe + items. ws-empty-band on mult_properties: identical
   numbers (27 findings, same cells, same mm).
2. groupByHeight's 1.2 x spread for dealtFloor items (as for in-place cells). Identical numbers again.

## Root cause (what the measurements show; for the next builder or the lead)
- mult_properties independent L deals THREE pairs: a row of two small pairs (4 x 2, 3 x 2; about 60 mm measured) stretched to a
  106 mm row (FILL_CAP 1.8), then one 5 x 4 pair full width (item 3, D-MP-3). The band is ROW STRETCH on a page whose COUNT is too low,
  not a too-tall floor in the row: the count comes from the capacity the layout gives the probe (16 items, a 5 x 5 pair does not fit
  two across at L, so the section plans 1-column rows), and the rows are then stretched to fill the page.
- Lesson Practice (lesson S/M p3: 4 pairs in 2 x 2 cells of 105 mm, 47 %) and lesson p2 Warm-up / Guided (fact cells of 41.5 mm,
  36-41 %) are sized by the lesson builder, not by buildSheet's count loop: the Practice section is `noCap` (cellH = the page / rows)
  and practiceShapes' [8,2] / [6,2] are rejected as `clamped` (sized from the probe's worst case), so [4,2] wins and stretches.
- count_by_tables lesson S/M/L: chart / Warm-up / Guided count rows 33-58 % plus EB-EDGE (ink 23-39 mm across the cell border:
  the lesson chart panel's row overflows its cell).
- Why attempts 1-2 changed nothing is NOT proven: the in-browser probe of buildSheet's fits (scratchpad probe.cjs) hung for 15 min
  and was killed. First thing to check: that the dealtFloor path is reached (the item's `footprint` may not carry the template's
  extra keys, or `shared[si]` / `sec.count` are set for these pages).
- The fix the evidence points to: (a) arrays-turn at L - cap the dealt pair size so two pairs fit across (or deal every pair full
  width and size the row to it), so the count is not set by a pair that cannot share a row; (b) the lesson Practice / Guided rows of
  these templates `noStretch` (rows to their measured height, the page's white below - EB-PAGE does not judge the last page);
  (c) the count-row lesson chart panel measured at the panel's width.

## Findings -> checks
| Finding | Check that catches it | Backtest |
|---|---|---|
| D-MP-1 bands on independent / test / guided / lesson | ws-empty-band EB-BAND (every card role, S/M/L) | eb-lfops-props-arrays-turn (pending) |
| D-AG-1 band between picture and slots | ws-empty-band EB-BAND / EB-FOOT (arrays_groups EB-FOOT 20-63 %) | - |
| D-CB-4/5 count_by_tables Error analysis / Guided / lesson bands | ws-empty-band EB-BAND, EB-EDGE | - |
| D-MP-3 GRID-EVEN at L | print-lint GRID-EVEN-ALL (opt-in) | - |
| card drift | ws-spec-card --check-signed | - |

## Not done (by the rule 7 stop)
GRID-EVEN at L, forms-1 / mixed lesson overflow, count_by_tables lesson overflow (times=each/given, jumps=15), Reason It one row a page,
Test S mixed-forms overflow, pre-skill-check L key overflow, D-AG-4, D-CB-7/8, D-MP-9/14/15; full precritic --strict, --role lesson,
ws-detailed-lesson --check, ws-backtest, content-audit / search-terms / standards / wrm gates on the final tree.
