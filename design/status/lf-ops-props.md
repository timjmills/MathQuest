# lf-ops-props - BUILD lesson #4 "Properties of multiplication" (3.OA.B.5), fresh builder (Opus medium, rebuild after rule 7)

Skills: multiplication:mult_properties, multiplication:arrays_groups, multiplication:count_by_tables.
Branch: claude/sweet-newton-c8wrv1-lf-ops-props (from master d34311d5; master 73e96fc1 merged in at 71d1109c).

## Status: REBUILD (fresh builder, Opus medium, 2026-11-13) - the arrays / arrays-turn / count-row band class fixed; leftovers below; no critic yet

(The sections from "Step 1 - ported" to "Not done" are the previous builder's record, kept as written.)

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

## Rebuild (2026-11-13) - cards, call path, fixes, numbers

### Step 0 - cards
- 47605fa5 / 14b3990c: ops-tables and count-row regenerated with `ws-spec-card --resign` on the current rule text. mult_properties
  `band=36` decided "offered at S, pending the post-fix re-measure (must meet the PT-GDP / H13 caps; otherwise not offered)" (lead ruling b);
  panel label "6 (6 x 6, size S)" (skill-options has no per-size gate). Lead signed both cards at 1993c15c.
- band=36 at S, before (a46344e1): EB-GDPCAP / EB-EDGE PASS, EB-BAND 17 (band=25: 21). After (a384a0b4): EB-GDPCAP / EB-EDGE / EB-FOOT PASS,
  EB-BAND 10 + EB-SIDE 2: scripted-model S 5 band + 2 side, lesson S p2 Warm-up facts 4, Reason It S p1 1 - the same leftovers band=25 has
  (band=25 at S has no Reason It finding). So band=36 still FAILS H13 at S; by the ruling it is not offered until those clear.

### Step 1 - the call path (traced in node from the kit modules and the source; the browser probe was not repeated)
- Item count and row height of a grid role (independent / more-practice / test / lesson Practice): print-sheet buildSheetDeal -> generateRun
  (the dealer, one ref per section skill) -> layoutOf -> sheet/layout.js resolveSectionLayout. Columns from `probe(c)`: an item fits c columns
  when its footprint wMm <= cellWidthMm(c).inner (2 columns: 92.3 mm). Rows = min(target, G / hMin), then PAGE FILL. Height:
  `cellH = min(even, fillLimit(hMin))`, then `hMin x FILL_CAP` when the page is under 80 % full; a lesson Practice section is `noCap`
  (practice.js practiceSection), so `capped` is false and `cellH = even = G / rows` - the whole grid, the 47 % bands.
- arrays-turn widths (sheet/cells/arrays-turn.js turnFootprint, node): L 2x2-3x5 and 4x4 89 mm, 4x5 / 5x4 93, 5x5 102, any 6 x n >= 95
  except 2x6; M 5x5 92, 4x6 94; S 6x6 99. At L a 4x5 or 5x5 pair cannot share a row, so the probe planned 1-column rows (3 pairs a page),
  and the rows stretched. That is why `dealtFloor` (attempts 1-2) changed nothing: the count was set by the column probe, not the floor.
- Guided role: roles/guided.js page loop, `Hr = max(x, min(kPage x, fillLimit(min)))` - the row stretch.
- Lesson role: Warm-up sheet/lesson-pages/warm-up.js warmShape (`rows` 1 or 2 per half, `cellH = hW / rows`); Guided we-do.js weDoBand;
  the chart lesson-pages/chart.js (panels; `stateDrawing` re-resolves the ctx with resolveCtx, which keeps only kit keys).
- count-row width: cells/count-row.js geom `live = narrowLive(..., LIVE_MM 186)`; it narrows only for `wrapToCell` cells, so a count row
  in a chart panel or beside the Steps took 186 mm.

### Step 3 - fixes and what each changed (ws-empty-band, the three skills, card plan, S/M/L, variants and hosts)
| Fix | Commit | Measurement before -> after |
|---|---|---|
| (a) arrays-turn order pairs dealt only when two fit across at the page's size (print-sheet `turnFitsTwo`, soft: the last try keeps; refs carry `twoAcross`; detailed pack sheets with `edgeLast` / `onlyKeys` keep their deal) | cb4bcb91, a384a0b4 | mult_properties independent L: 3 pairs (1 + 2 rows) -> 4 pairs in 2 x 2; EB-BAND independent / more-practice / test L 4 (31-40 %) -> 4 at 30.2 % (then 0 with b) |
| (b) footprint `noStretch` on arrays-turn, arrays, count-row: rows = measured x 1.25 (layout.js, the `noCap` lesson Practice included; 1.42 = PT-GDP on a `pageCap` page), guided.js rows <= 1.25 x; content centred (additive sheet-kit.css rule, P4-2) | cb4bcb91, a384a0b4 | mult_properties lesson Practice p3 EB-BAND 3 (32-47 %) -> 0; guided S/M 2 -> 0; independent / more-practice / test S/M/L -> 0 |
| ws-empty-band EB-FOOT: a centred cell judged without its centring offset; a page that sorts rows by height paired by height (both noted in the header) | cb4bcb91, 6d61ff6b | the centring raised EB-FOOT on every centred cell (34 findings on mult_properties alone); arrays_groups EB-FOOT 43 -> 0 (all were reorder pairs: the same heights in another order) |
| (c) count rows measured at their own width: chart panel `cellLiveMm` (chart.js, carried past resolveCtx), Guided beside the Steps (we-do.js weDoRender) | 6d61ff6b | count_by_tables lesson EB-EDGE 15 -> 0 (39 mm and 23 mm across the border) |

Totals (same command, a46344e1 -> a384a0b4): EB-BAND 153 -> 66, EB-SIDE 15 -> 15, EB-EDGE 15 -> 0, EB-FOOT 68 -> 21; 251 -> 102.
Per skill: mult_properties BAND 67 -> 44, FOOT 25 -> 21; arrays_groups BAND 52 -> 13, FOOT 43 -> 0, SIDE 13 -> 13; count_by_tables BAND 34 -> 9, EDGE 15 -> 0.

Tried, no effect, reverted (rule: stop): Warm-up half holding 3 rows when it is a third as tall as the other half (warm-up.js) - the mult_properties
lesson p2 numbers did not move (the guard `pool >= k x 3` most likely fails: the Warm-up pool deals 4 items; not proven).

### Still red (cause)
- Scripted Model (all three skills' arrays): EB-BAND 4-5 a size, EB-SIDE at S - the model role's own state cells; not in ruling (b).
- mult_properties lesson p2 Warm-up: the 2 x n across facts in two rows of 41.5 mm beside the count row (36-41 %), warm-up.js warmShape.
- mult_properties independent L `forms: 3` (x 0, equation cells): EB-BAND 16 / EB-FOOT 16, a 17.4 mm fact in rows sized for other forms; and
  `forms: 0+1+2+3` EB-FOOT 5 (a mixed-template page). Not arrays-turn; present before.
- mult_properties Reason It M p1 (35 %); band=36 adds Reason It S p1.
- arrays_groups review S/M EB-SIDE 7, worksheet 1280 px 1 band.
- count_by_tables lesson chart panels 1-3 EB-BAND 33.5 % (the panels share a row with a taller panel 4).
- Not reached: GRID-EVEN at L (D-MP-3; (a) makes the L pages 2 x 2), forms-1 / mixed lesson overflow, count_by_tables times=each/given and
  jumps=15 lesson overflow, Reason It one row a page, Test S mixed-forms overflow, pre-skill-check L key overflow.

### Gates on a384a0b4
- ws-boot-smoke OK; ws-code-snapshot OK (732 codes); node --input-type=module --check on every changed JS file OK.
- ws-backtest --table backtests-empty-band.json --row eb-lfops-props-arrays-turn: FAIL on 27ceb360, OK on 6d61ff6b -> PASS (row command now
  judges independent / more-practice / test / guided; the lesson role's leftover is the Warm-up fact template).
- ws-detailed-lesson --check: g3-oa5 OK (after a384a0b4: E9b, E24b had failed on cb4bcb91), g3-oa9 x2, g2-nbt3, g3-oa8, g4-nbt1 OK;
  g1-oa1-bar-model-wp-20 FAIL E9 / E35 - the same on a46344e1 (not this lane).
- ws-card-rulings --check offered (ops-tables): 8 broken on word-problem skills, the same before this lane (lead: another lane's).
- NOT run (budget): ws-precritic --skill ... --strict for the three skills, --role lesson --strict, full ws-backtest.

### Findings -> checks (this rebuild)
| Finding | Check that catches it | Backtest |
|---|---|---|
| D-MP-1 arrays-turn bands (count set by a pair too wide for two across) | ws-empty-band EB-BAND | eb-lfops-props-arrays-turn (PASS) |
| lesson Practice `noCap` stretch | ws-empty-band EB-BAND on the lesson role | - (lesson still red on the Warm-up) |
| count row across the panel / cell border | ws-empty-band EB-EDGE | - |
| EB-FOOT false positives (centred cells, height-sorted pages) | ws-empty-band EB-FOOT (fixed in the check) | - |
| detailed lesson regressions from a deal change | ws-detailed-lesson --check E9b / E24b | - |
| Speed: two attempts reached no code that sets the count | trace the call path (column probe, cellH) in node before editing; `ws-empty-band --dump <dir>` writes each render's HTML | - |

## Precritic (2026-11-13, short builder, Opus medium) - on dd42b05c (master merged), card signed 9e2c301a, ws-empty-band = master's (6e6f2f4c)
Card: d1584ed3 mult_properties `band=36` -> **hidden** ("not offered: failed the post-fix re-measure at S (EB-BAND 10, EB-SIDE 2 on a384a0b4)");
skill-options drops 36 from the band values in the appended lf-ops-props block (normalizeOptions decodes an old 36 to 25); ws-card-rulings
--check offered OK (N-D-band-3). Re-generated with --resign; the lead signed it at 9e2c301a.
ws-empty-band: this branch's EB-FOOT change and `--dump` reverted to master's file (6e6f2f4c; lf-checks ported it with a guard, e5aa5ae1).
Logs (outside the repo): /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/props-precritic/
(precritic `<skill>.log/.json`, `eb-master-<skill>.json`, `pl-roles-{S,M,L}.json` = print-lint kit guided / more-practice / test / independent).
Browser gates ran one at a time (MQ_BROWSER_SLOTS=1).

| Skill | Result | Red rows |
|---|---|---|
| mult_properties | FAIL (11 FAIL, 17 PASS) | empty-band, coverage-matrix (13 rows PENDING no-baseline; 0 run of this skill judged), print-lint kit S/M/L (L-TOPSTART), print-lint lesson S/L (L-TOPSTART; L CL40-INK 2), render-gate other roles (pre-skill-check L key overflow), cell-checks (OVERFLOW 69: forms 1 / mixed lesson, test S mixed, pre-skill-check L; SIZE-S 5), sibling-compare (no approved sibling), options-render (forms=1, task=1 @L L-TOPSTART) |
| arrays_groups | FAIL (11 FAIL, 18 PASS) | empty-band, coverage-matrix (as above), print-lint kit S/M/L (L-TOPSTART), print-lint lesson S/L (L-TOPSTART; S PAGEFILL 1), render-gate (test M body overflows 2.6 mm, pupil + key), cell-checks (the same test M overflow), sibling-compare, options-render (forms=0 S/L, forms=1 L: L-TOPSTART) |
| count_by_tables | FAIL (6 FAIL, 23 PASS) | empty-band (BAND 9, FOOT 4), print-lint lesson S/L (L-OVERFLOW TY-12 10, L-TOPSTART 2, PAGEFILL 1, PG-23 1), sibling-compare, phone-card (390 px: CLIP-X 86, FOCUS 4, INVIEW 4), node-lint S1 (LESSON-DATA: no lesson record for count_by_tables) |

EB-FOOT, with / without the gate change (mult_properties, arrays_groups; all roles + variants):
- with this branch's change (the precritic run of mult_properties, before the revert): mult_properties 21 (independent L forms 3 / 0+1+2+3 /
  variants only); arrays_groups 0 (measured on a384a0b4 earlier; not re-run).
- master's file: mult_properties 70, arrays_groups 58 - every independent / more-practice / test page at S / M / L of both skills,
  plus mixed-practice M / L. Cause: master measures the centring offset of the centred arrays / arrays-turn cells as drawn height.
- lf-checks' guarded tool (their tree, per the lead): arrays_groups 19, real (independent M p1 cell 1 68.2 mm drawn for 52.2 mm;
  more-practice S rows 26-28 % over).

### Clean pages for the narrow critic (default options; independent / more-practice / test / guided x S / M / L)
**None of the 24 is clean.** Every one carries L-TOPSTART CL-4b (print-lint kit, pl-roles-*.json): the first row of an arrays /
arrays-turn cell starts 3-18 mm below the top pad. Cause: this branch's additive sheet-kit.css rule that centres those cells
(`justify-content: safe center`, lead ruling (b) / LESSONS_LEARNED P4-2) breaks owner ruling CL-4b ("top of the box is the default").
The two rulings conflict; this needs a lead decision (drop the centring and re-measure EB-BAND, or a CL-4b exemption for
in-cell-answered templates). Not changed here.
Other red rows on those pages:
- mult_properties: independent / more-practice / test S M L EB-FOOT (master's tool, centring offset); more-practice L CL40-INK 4
  (an array dot at 6.8 x 5.3 mm inside the 7 x 7 mm label keep-out, p1-p2 cell 1 and 5). guided S/M/L: L-TOPSTART only.
- arrays_groups: independent / more-practice / test S M L EB-FOOT (master's tool; lf-checks' guarded tool keeps independent M p1 and
  more-practice S as real: next round); test M body overflow 2.6 mm (pupil + key). guided S/M/L: L-TOPSTART only.

### Findings -> checks (this run)
| Finding | Check that catches it | Note |
|---|---|---|
| centred arrays cells vs CL-4b | ws-print-lint L-TOPSTART (already on precritic's path) | the earlier rebuild ran no print-lint after fix (b); rule: run print-lint kit after any cell-alignment CSS |
| EB-FOOT counts a centring offset | ws-empty-band EB-FOOT (lf-checks' guarded version, e5aa5ae1) | reaches master with lf-checks |
| arrays_groups test M overflow 2.6 mm | ws-grade-render --gate, ws-cell-checks | - |
| array dot in the label keep-out (mult_properties more-practice L) | ws-print-lint L-OVERLAP CL40-INK (--roles more-practice; not on precritic's --skill path) | add more-practice to precritic's print-lint roles |
| count_by_tables has no lesson record | ws-node-lint LESSON-DATA | - |
| count_by_tables phone 390 px clip / focus | ws-phone-card | - |
