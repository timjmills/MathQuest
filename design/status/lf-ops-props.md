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

## Round r3b (2026-11-13, resumed builder, Opus medium) - on the merge of origin/master 79aaacf4 (ab5ee3ef)
Logs: /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/props-r3b/

### The killed builder's WIP (1c6766cd4), judged
- arrays-turn width test (colW from `ctx.columns`, else 2 columns): measured with a buildSheet probe (scratchpad tools/probe.cjs) on
  mult_properties more-practice L: the first dot stayed at 6.8 mm across, 4.8 mm down - the spacer never applied (CL40-INK 4 kept).
  Making it unconditional (as arrays does) fixed the dot but cost 4 mm a cell: the page fell from 6 pairs to 4 in 106-118 mm rows (a band).
  Both dropped; replaced by c1c54b5c (below).
- layout.js (groupByHeight 1.2 x for `noStretch`; rowShape cap at 1.25 x the shortest problem for `noStretch` rows): no measured
  effect on the arrays_groups H13-ROW at L (print-lint before and after: the same x2 at 38-39 %). Kept (harmless, a sound rule), not credited.

### Step 1 - re-measure after the centring drop (932a9cda)
- print-lint kit, independent / guided / more-practice / test, three skills: L-TOPSTART 0 at S, M and L (was every page).
  Left: L CL40-INK 4 (mult_properties more-practice), L H13-ROW 2 + 2 (arrays_groups independent / test p1 cell 2: a 2-row array
  beside a 5-row one, 38-39 %), S H13-ROW 2 + 4 (arrays_groups guided / test); M clean.

### Fixes (r3b)
| Fix | Commit | Before -> after |
|---|---|---|
| merge origin/master 79aaacf4 (cell-checks TITLE + words-rules kept; buildLesson optionLesson + dealPracticeOpts kept) | ab5ee3ef | - |
| arrays-turn CL-40: a pair whose first array is the taller is set in from the left by --ws-koin + 0.5 mm (no width test; cell height unchanged) | c1c54b5c | mult_properties more-practice L CL40-INK 4 -> 0 (first dot 6.8 -> 10.2 mm across); print-lint kit L / M four grid roles 0 |
| backtest row pl-cl40-arrays-turn-mp | 584c43ac | FAIL fc981d0c7, OK c1c54b5c: PASS |
| Reason It: a count-row TRAIN wider than half the cell wraps to its own panel (pair form + cellLiveMm), replacing lf-algebra's interim revert 2cfeb1d7; an arcs row keeps `full` | 77187c6e | number_patterns_rule Reason It L 1 -> 2 items a page; a first try that wrapped arcs rows too: count_by_tables Reason It S TY-21 60 / TY-12 52 (reverted to trains only) |
| Reason It A/B panels start at --ws-koin | 77187c6e | print-lint reason-it L CL40-INK 4 (count_by_tables 2, number_patterns_rule 2) -> 0; four skills S / L 0 |
| count-row slot width from the band's widest number (payload.bandDigits, number patterns) | 77187c6e | independent S / L of count_by_tables and number_patterns_rule: 0 findings (not measured per row) |

### Not reached (budget $28)
Step 2 overflows (arrays_groups test M +2.6 mm; mult_properties cell-checks OVERFLOW forms 1 / mixed lesson, test S mixed, pre-skill-check
L key; SIZE-S 5; options-render forms=1 / task=1 at L); count_by_tables phone-card 390, lesson TY-12 / PAGEFILL / PG-23, options-verify
capacity; the screen train (lf-algebra F2) - unmeasured; arrays_groups H13-ROW at L (independent / test p1 cell 2) and S (guided / test);
EB-FOOT re-measure on the guarded tool (lf-checks e5aa5ae1 is not on master); step 4; the 8 TBD-lf-ops-fix4 backtest rows (not filled:
no -props commit has been run against them; cc-title / cc-title-cbt still need their check or row fixed).

### Findings -> checks (r3b)
| Finding | Check that catches it | Backtest |
|---|---|---|
| arrays-turn dot in the label keep-out (a width test on ctx.columns, which a grid role does not carry) | ws-print-lint L-OVERLAP CL40-INK --roles more-practice | pl-cl40-arrays-turn-mp (PASS) |
| Reason It panel corner in the keep-out | ws-print-lint --roles reason-it L-OVERLAP | - (add: fail ab5ee3ef, pass 77187c6e) |
| wrapping an arcs count row in a narrow panel shrinks its boxes | ws-print-lint L-ANSAREA TY-21 / L-OVERFLOW TY-12 on reason-it | - |
| Speed: a backtest run under mq-browser-run deadlocks (it wraps its own commands) - run ws-backtest and ws-precritic directly | - | - |
| Speed: a 40-line buildSheet probe (scratchpad tools/probe.cjs: cell size, ink bottom, first-dot position) settled the WIP in one run | - | - |

### Gates on 77187c6e (r3b final, logs in the scratchpad props-r3b/)
- ws-boot-smoke OK; ws-code-snapshot OK (732 codes); node --input-type=module --check OK on arrays-turn.js, layout.js, reason-it.js,
  count-row.js, gen-mult-patterns.js, print-sheet.js; ws-backtest --row pl-cl40-arrays-turn-mp PASS.
- precritic --skill mult_properties --strict: FAIL 7 / PASS 23 (was 11 FAIL / 17 PASS): empty-band (EB-BAND 70, EB-FOOT 28, EB-SIDE 2),
  screen-ink-size (22, a master gate new to this branch), sibling-compare (no approved sibling), print-lint lesson L, render-gate other
  roles, cell-checks (OVERFLOW / SIZE-S 5), options-render (forms=1 at L: 4 items where the default prints 6). print-lint kit S/M/L PASS.
- precritic --skill arrays_groups --strict: FAIL 6 / PASS 24 (was 11 / 18): empty-band (EB-BAND 42, EB-SIDE 13, EB-FOOT 43 - master's
  tool), screen-ink-size, print-lint lesson S, render-gate (test M overflow), cell-checks, sibling-compare. print-lint kit S/M/L PASS.
- precritic --skill count_by_tables and --role lesson: started after the above (precritic-count_by_tables.log / precritic-lesson.log);
  not read before the budget stop.
- EB-BAND rose on both skills after 932a9cda (the centring drop, owner rule CL-4b): a top-started cell in a row sized for a taller one
  now shows its band at the foot. The cure is the row sizing (step 2 / H13-ROW), not centring.

## Round r4 (2026-11-13, fresh builder, Opus medium) - step 1 feasibility probe of lead ruling (a): STOPPED before building

Brief: group the dealt items by height class (1-2 rows vs 3-5 rows) so a row never mixes them; fallback (b) only if the probe
proves (a) cannot get the bands under 20 %. No code changed in r4. Logs and tools (outside the repo):
/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/props-r4/ (eb-before.json / .log: master's
ws-empty-band on 8f0e93e2a; rows-before.json: every kit cell's page / top / height / needed height and the items' measured heights,
pupil and key, from tools/rowprobe.cjs; model-ABCD.txt, model-B2.txt, spread-1.25.txt: the models below).

### Before (8f0e93e2a, master's ws-empty-band, both skills, every card role S/M/L + 6 variants + hosts)
EB-BAND 113, EB-FOOT 71, EB-SIDE 15 (mult_properties BAND 70 / FOOT 28 / SIDE 2 is the r3b figure; this run counts per skill:
mult_properties independent L 26 BAND (16 of them `forms: 3` equation cells at 30.1 %), lesson 15 (12 = p2 Warm-up fact cells),
scripted-model 15; arrays_groups scripted-model 12, opener 6, pre-skill-check 6).
Every EB-FOOT on arrays_groups and on the default mult_properties pages is a PAIRING artefact, not a drawn-height defect: the
drawn heights of a page are a permutation of its items' footprints (independent S: drawn 63,63,48,39,39,46,36,46 vs footprints
48,39,39,63,63,46,36,46) - groupByHeight reorders the page, ws-empty-band pairs cells with buildSheet's items in deal order.

### The model (per grid page: independent, more-practice, test, mixed-practice; band = (row H - cell's needed height) / row H)
Inputs measured in the browser (rows-before.json); the rows recomputed in node (tools/model.js, model2.js):
| Scenario | cells >= 30 % (EB-BAND) | cells > 20 % | worst |
|---|--:|--:|--:|
| A  now (measured) | 16 | 53 | 45 % |
| B2 (a) regrouped by height class, each page's current row stretch kept | 16 | 53 | 41 % |
| B  (a) regrouped, today's practice SPREAD (k <= 1.7, a row <= 1.7 x its shortest) | 40 | 79 | 41 % |
| D  deal order kept, a `noStretch` row never past 1.25 x its shortest (ruling 2026-11-12 (b), which the SPREAD skips) | 3 | 18 | 39 % |
| C  (a) + that 1.25 cap | 4 | 18 | 34 % |

So (a) alone does not move the count (B2 = A) and with today's spread makes it worse (B): once a row holds one height class the
spread stretches it fully. The bands have two causes, and (a) addresses only the smaller:
1. ROW STRETCH (the larger): practice.js `spreadRows` (SPREAD_CAP 1.7) stretches a lone page's rows to fill it and checks only the
   SECTION's `noStretch`, not the footprint's; arrays / arrays-turn / count-row are top-started (CL-4b), so every stretched row is
   a foot band. Measured: mult_properties independent L rows at 1.45 x their tallest (63.8 / 72.8 mm in 105.8 mm; 81.8 + 81.8 in
   118.9 mm: 31 % with no height mix at all), independent S / more-practice S at 1.28 x, more-practice L 1.37 x; guided M 1.47 x;
   lesson Practice p3 1.21 x. These are rows of ONE class: no regrouping reaches them.
2. MIXED ROWS (the smaller): boundary rows that remain when a page's class counts are odd (mult_properties S/M 47+61, 56+72;
   arrays_groups test S 38+38+54, 48+48+63; mixed-practice L 53+80). A 2-column page with 3 short + 3 tall items always keeps one.

Even C / D are not under 20 % everywhere: a `noStretch` row at 1.25 x its shortest leaves that item exactly 20 %, and 18 cells
remain at 20-34 % on rows whose items differ by more than 1.25 x.

### What fallback (b) needs (a per-page height spread cap of 1.25 x; tools/spread.js)
74 of 240 array cells (31 %) on these pages sit outside the best 1.25 x window of their page: mult_properties 1-2 a page
(spread 1.28-1.30 at S/M/L; review S/M 3 of 7, spread 1.61-1.65), arrays_groups 2-4 a page (spread 1.52-1.77; test S 7 of 12).
A 1.25 cap would re-deal a third of the items, i.e. cut the easy or the hard end of the ladder off every page (arrays_groups:
2-row arrays and 5-row arrays could no longer share a page). For EB-BAND's 30 % gate the cap that suffices is about 1.4 x.

### Decision needed from the lead (not built, per the brief)
- Honouring ruling 2026-11-12 (b) in the practice SPREAD (and the guided / lesson Practice stretch) for footprint `noStretch` cells
  is the lever that moves EB-BAND (16 -> 3 cells >= 30 % on the grid pages modelled), independent of (a).
- (a) on top adds nothing measurable (C 4 vs D 3) unless the boundary rows are avoided (leave a cell empty, or let the deal even
  the class counts), which the "nothing dropped, same count" rule forbids.
- Strictly under 20 % needs (b) at 1.25 x (a third of the items re-dealt, the ladder cut per page) or a row room under 1.25 x.

## Round r4b (2026-11-13, fresh builder, Opus medium) - BUILT ruling (b) + (a); the band fixes, the screen train, the checks

Head after the work: see `git log`. The r4b probe (step 1) confirmed the main cause: row STRETCH, not mixed heights.

### The fixes
| # | Fix | File |
|---|---|---|
| 1 | **ROW-STRETCH** (ws-print-lint, opt-in `--rules ROW-STRETCH`): a row of `noStretch` templates (arrays, arrays-turn, count-row) is at most 1.25 x its tallest content (1.42 on a `pageCap` page, class `mq-pagecap`), and its shortest cell's band is <= 20 % (H13); a cell's need is its own content or, when larger, its facsimile key cell's. Backtest `pl-row-stretch-mp-s`. Wired on precritic (opt-in-rules.json: print-lint-kit L/S/M + print-lint-rowstretch-L/S/M + the lesson rows). | `tests/scripts/ws-print-lint.cjs` |
| 2 | **spreadRows honours the footprint's noStretch** (practice.js): a lone page's rows of noStretch cells grow to NO_STRETCH_ROOM x their shortest, not SPREAD_CAP; `capFillShape` caps a capFill page's rows the same way, but ONLY when the page still fills to 92 % (E9b); the GUIDED rows (guided.js) and the MIXED-PRACTICE shelves (mixed-practice.js) cap the same way. | practice.js, guided.js, mixed-practice.js |
| 3 | **Score-chosen height order (ruling (a)) for noStretch sections** (layout.js groupByHeight): a noStretch section takes the row order (tallest-first classes / deal order / short-to-tall height classes) with the lowest bands - only where it is strictly better; nothing dropped, same count, boundary rows stay mixed. Also in test.js (rows set short-to-tall when their own heights overrun the grid - the arrays_groups Test M +2.6 mm overflow) and mixed-practice.js. | layout.js, test.js, mixed-practice.js |
| 4 | **noStretch pages keep their columns** (print-sheet.js): the fill relay no longer re-lays an arrays page from 4 problems in 2 columns to 3 in 1 (a 31 % band beside each array). | print-sheet.js |
| 5 | **The count-row SCREEN train** (lead ruling (a) 2026-11-13): a box train (number_patterns_rule) draws its numerals at the host digit size (SCREEN-DIGIT 40/48/56 px) and its tiles hold the 44 px input - no overprinted caption, no clipped rule box; the ARCS train (count_by_tables) wraps at the digit floor (3-4 a line, the jump arrow carrying the count on, print's pair form), no swipe row, no horizontal scroll. Worksheet cards holding a wrapping train keep the host digit size (CSS `:has(.k2-countrow-wrap)`). | count-row.js, shapes.js, k2kit (D), screen-cell.css |
| 6 | **TRAIN-FIT** (ws-screen-slots, with `--screen-digit` or `--train-fit`): a count-row screen train at the SCREEN-DIGIT floor, no sideways scroll, no ink past its cell, on card 390/820/1280 + worksheet + quiz. Backtest `ss-train-fit-cbt`. Opt-in on precritic (screen-slots `--screen-digit`). | ws-screen-slots.cjs |
| 7 | **Guided noStretch cells** (we-do.js): a Guided cell of a noStretch template is at most 1.25 x its content, not the Steps list's height beside it (number_patterns_rule / count_by_tables lesson p2 EB-BAND 45-56 %). | we-do.js |

### Numbers, before (8f0e93e2a) -> after
ws-print-lint `--rules ROW-STRETCH --lints ROW-STRETCH` on the 6 grid roles, with the 1 mm measurement tolerance (ROW-STRETCH / H13 / other):
| Size | before ROW-STRETCH | after | before H13 | after | notes |
|---|--:|--:|--:|--:|---|
| S | 24 | 11 | 10 | 4 | mult_properties more-practice S 6 -> 0; guided H13 2 -> 0 |
| M | 17 | 9 | 0 | 0 | |
| L | 22 | 15 | 8 | 8 | arrays_groups guided 5 -> 4 |

Probe model (per grid page, EB-BAND >= 30 % / > 20 %, measured in the browser, tools/model.js): A now (before) **16 / 53**; after the build (rows-after.json) **4 / 34**. The spread no longer stretches one-class rows.

ws-empty-band (master's NEW data-eb-item tool, merged 70fa12c2 / a3eb9d25), all three skills, every role + hosts, after:
EB-BAND 71, EB-SIDE 11, EB-EDGE 10, EB-FOOT 26 (mult_properties independent 18, count_by_tables review 8), the rest PASS. The EB-BAND
that remain are on roles this lane's steps do not size (opener, pre-skill-check, scripted-model, reason-it) and the lesson
pages below; the array / grid practice-role bands that were the r4 finding are gone.

### Cells still > 20 % that need a LEAD ruling (not decided here, per the brief)
- **mult_properties / arrays_groups MIXED rows** (mixed-practice S/M/L, test M, independent S/M): a 2-column page with 3 short +
  3 tall noStretch items keeps ONE boundary row mixed; its short cell sits at 21-45 %. Grouping cannot avoid it without dropping
  an item or re-dealing (forbidden). Needs: a per-page height cap (b) or a row allowance.
- **The lesson pages** (mult_properties lesson 12, count_by_tables lesson 10, mult_properties independent 16 at L): the `pageCap`
  Practice page and the chart / Warm-up cells can bands when the page must both fill and keep rows under 1.42 x content. The
  capFill guard keeps E9b green (fill wins); the band is reported. Needs: the (b) per-page height cap, or the row allowance.
- **EB-FOOT mult_properties independent 18** at 12 %: the `forms: 3` equation form (times 1 / times 0, an equation not an array)
  draws 19.5 mm where its static footprint says 17.4 mm - a footprint-accuracy fix on the equation form, not a stretch defect.
- **count_by_tables arcs train on paper** (lesson ROW-STRETCH 2, PAGEFILL, PG-23, TY-12): pre-existing on 8f0e93e2a (same counts on
  the before tree); the arcs Guided row and the count-row label clipping are a separate count-by paper item.

### Findings -> checks (r4b)
| Finding | Check that catches it | Backtest |
|---|---|---|
| a lone page's noStretch rows stretched to 1.28-1.47 x their content (the spread ignores the footprint's noStretch) | ws-print-lint `--rules ROW-STRETCH` | pl-row-stretch-mp-s (PASS) |
| the count-row screen train shrunk under SCREEN-DIGIT / swiped / ran past its cell | ws-screen-slots TRAIN-FIT (`--screen-digit` / `--train-fit`) | ss-train-fit-cbt (PASS) |
| ws-empty-band paired cells in DEAL order (false EB-FOOT on a height-grouped page) | master's data-eb-item pairing (70fa12c2 / a3eb9d25), now merged | - (its own self-test) |
| the capFill row cap traded a cell band for a PAGEFILL / E9b strip | the capFill 92 %-fill guard; ws-detailed-lesson --check E9b | - |

### D-MP-6 (the wrong-answer frame wording from fix4 8586745a8) - NOT needed on this branch
master's True or False? / Reason It now use the `answerPlace` / `answerFrameCls` system (per-slot answers): a multi-box item
writes ONE value a box, never "15, 15" in one blank. That replaces fix4's `wrong.frame` wording. The merge took master's
true-false.js and reason-it.js; the providers still carry the `frame: {stem, value}` fields, now harmless dead data (chooseWrong
passes them through, no role reads them). So D-MP-6 is closed by master's frames; no port needed.

### Screen-ink-size gap (reported to main, for lf-checks)
ws-screen-ink-size does NOT flag the count-row card digits (18-29 px): its rules judge repeated PICTURE marks only (SVG groups,
HTML leaf marks) and touch numerals (svg[data-digit]); the count-row train's digits are plain text, so no rule sees them and
SIZE-REF never fires (no mark group). The check that DOES catch them is ws-screen-slots `--screen-digit` (SCREEN-DIGIT) and the
new TRAIN-FIT. lf-checks is making SCREEN-DIGIT default-on in precritic.
