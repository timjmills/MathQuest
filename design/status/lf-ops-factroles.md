# lf-ops — facts-roles task (2026-11-12)

Branch `claude/sweet-newton-c8wrv1-lf-ops-factroles`, from origin/master 7e0c074b.

**Goal.** Close the empty bands (RUBRIC H13) on the shared Guided and Scripted Model pages of the fact skills:
`addition:add_facts`, `subtraction:sub_facts`, `multiplication:mult_facts`, `division:div_facts_long`, `division:div_facts`.

**Check first (152f879c).** Guided / scripted-model pins in `design/audit/baselines/empty-band.json` lowered to 0 (were 115 findings
on add / mult / div_facts). `ws-empty-band --roles guided,scripted-model --hosts none` on 7e0c074b: FAIL 200 (EB-BAND 110, EB-SIDE 90).

| skill | guided before → after | scripted-model before → after |
|---|---|---|
| add_facts | 24 → 0 | 27 → 0 |
| sub_facts | 24 → 0 | 27 → 0 |
| mult_facts | 12 → 0 | 32 → 0 |
| div_facts_long | 11 → 0 | 23 → 0 |
| div_facts | 13 → 0 | 7 → 0 |

**Fix (2f5328a6, 6e962016; scoped by `factRows(input)` in `sheet/roles/compose.js`, a page whose skills are all five).**
- Guided: rows take their measured height (FACT_STRETCH 1, no stretch); the Model row is as tall as the taller of its trace and the
  tries' hint, not the two added; more tries fill the page instead (FACT_CEILING 31 / 23 / 19); one more column where facts fit
  (FACT_COLS 5 / 4 / 4), the column count whose narrowest fact leaves the least side band; facts far narrower than the rest
  (one-digit dividends of div_facts_long) leave the Guided grid only (`factCalm`), never below the Model and 3 tries.
- Scripted Model: the states stand side by side, one column a state, the step text over each at one height (2 + 2 when the fact is too
  wide for 4 across: div_facts at L). measureCols adds 4.

**Unchanged (hash, PNG + HTML, seed 7, A4, vs 7e0c074b):** 52 renders identical — the five skills × independent / test / review × S/M/L,
`addition:add` and `placevalue:identify` × guided / scripted-model at M, and add / mult / div_facts × lesson at M.
`ws-detailed-lesson --check` on g3-oa5-mult-properties, g3-oa9-mult-table-patterns, g3-oa9-input-output-rule, g4-nbt1-ten-times-value:
OK, output identical to 7e0c074b. `ws-boot-smoke`: OK. Backtest row `eb-fact-roles` (fail 7e0c074b, pass 6e962016).

**Critic render:** `node tests/scripts/ws-empty-band.cjs --skill <cat:skill> --roles guided,scripted-model --hosts none` (measure), and
`buildSheet({role: 'guided'|'scripted-model', sections: [{skills: [{categoryId, skillId}]}], size: 'S'|'M'|'L', paper: 'A4', seed: 7, key: true})`
for the pages (ws-grade-render / the role render of the lane).

## Lead ruling option b (2026-11-12, second round)

The ruling: keep the PAGE_TYPES §12.1 ceiling (10 / 8 / 6 tries plus the Model) on Guided; fact rows grow to at most 1.42 x content
(band under 30 %, H13) with the rest under the grid; keep div_facts_long's one-digit dividends; leave the Scripted Model as it is.

**Check first (a4b8a8c2).** `ws-empty-band` rule **EB-GDPCAP**: a Guided render whose `plan.meta.scoreOutOf` exceeds 10 / 8 / 6 at
S / M / L fails (`--self-test`: 9 cases, no browser). On 4edbe292: FAIL 15 (every fact skill at every size; S 29-31, M 11-23, L 11-15
tries). Backtest row `guided-cap-facts` (fail 4edbe292, pass 31418ea0).

**Fix (31418ea0, `sheet/roles/guided.js`, fact pages only via `factRows`).**
- FACT_CEILING removed: the ceiling is the shared 10 / 8 / 6.
- A fact row grows to at most FACT_STRETCH 1.42 x its content (the shortest cell's measure less CELL_PAD_MM), within the page;
  the Model's row (and the hinted row) keeps its measured height; the rest of the page stays under the grid.
- The tries beside the Model start under the tab's keep-out (inline `padding-top`, the Model's own), so the facts of row 1 line up
  and each try's hint ends near the Model's (was a 31.5 % band under mult_facts L try 2).
- `factCalm` removed: the one-digit dividends ("8 ) 0") are dealt again (div_facts_long Guided S and M seed 7 deal "8 ) 0").
  The grid is the column count, with the pool that fits it, whose first page holds the most tries among those where no fact the
  page holds leaves FACT_SIDE (0.29) of its column beside it; Guided measures 5 columns at S (div_facts_long S: 5 columns).
- Tries (seed 7): S 9 on all five; M 8 (add, sub, mult, div_facts), 7 (div_facts_long); L 5 on all five.

**Gates.** `ws-empty-band --roles guided,scripted-model --hosts none --no-baseline` on the five skills: OK (EB-BAND, EB-SIDE,
EB-GDPCAP PASS; 30 renders).
Hash (`hash2.cjs`, PNG + HTML, seed 7, A4) vs 7e0c074b: the same 52 renders identical (0 differ). `ws-detailed-lesson --lesson <id>
--check` on g3-oa5-mult-properties, g3-oa9-mult-table-patterns, g3-oa9-input-output-rule, g4-nbt1-ten-times-value: OK, output
identical to 7e0c074b. `ws-boot-smoke`: OK. Syntax: guided.js (`--input-type=module --check`), ws-empty-band.cjs OK.
`ws-empty-band --self-test`: OK.


## Critic factroles r1 (narrow, 343e0b78, 2026-11-12) - FAIL, lowest 6 (C3); only Guided M of add / sub / mult facts passes
Report design/audit/runs/lf-ops/critic-factroles-r1.md; 4 renders in design/audit/runs/lf-ops/factroles-r1-renders/.
Pass: the fade (PT-GDP-1), nothing given away, keys 27 / 27, TY-30 digits, CL-40, cell bands < 30 %, reading order, Say frames.
| Finding | Check that would catch it (to build) | Backtest state | Note |
|---|---|---|---|
| G1 Guided S add / sub: the hinted row 1 does not fit 5 columns (dot tile clipped, cell-5 tile across the frame) | EB-EDGE (ink within 1.5 mm of or across a divider / frame, any row) | fail 343e0b78 add / sub Guided S | lane fix: choose S columns from the hinted row, or the tile under the fact |
| G2 Guided div_facts_long / div_facts S, M pages 38-46 % used | EB-PAGE (page used < 50 % FAIL, < 70 % WARN) | fail 343e0b78 div_facts S | from ruling (b): LEAD |
| G3 other Guided S / L pages 56-69 % used | EB-PAGE (WARN) | - | from ruling (b): LEAD |
| S1 every Scripted Model: states 1..n-1 the same picture, no new grey mark (PT-MOD-1); sub_facts Model 10-5=5 ambiguous | MOD-MARKS (adjacent states differ in ink) + provider unit test (workedSteps marks) + dealer predicate MODEL-UNAMBIGUOUS | fail 343e0b78 | lane fix |
| S2 Scripted Model step text over 2 lines (mult step 2: 4-5 lines) (PT-MOD-2) | MOD-LINES (step text <= 2 line boxes) | fail 343e0b78 | lane fix |
| S3 Scripted Model pages 23-42 % used | EB-PAGE | fail 343e0b78 | LEAD |
Speed-up: ask the page-fill question before the build: ruling (b) fixed ceiling, stretch and leftover together, and the critic was first to measure the page used.
- r2 step 1 done @ f5b77f7a (EB-EDGE + Guided +/- S columns from the hinted row; backtest guided-edge-facts); next: step 2 MOD-MARKS
- r2 steps 2-4 done @ fcf13401 (one commit: the three share the Model code). Checks first, each FAIL on 343e0b78: ws-empty-band
  `--model-states` (opt-in, lf-ops entry in opt-in-rules.json) MOD-MARKS 24, MOD-LINES 16, EB-PAGE (Scripted Model page < 70 % used) 15;
  ws-providers-unit MODEL_DRAWS + modelOk (FAIL on 343e0b78: 418 + predicate missing). Fix: providers' `drawStep` (short text +
  grey draw marks, kept apart from `marks` so lesson / key pages are unchanged); scripted-model `factModel`: cumulative jots / count
  list / dot tile each step (not-yet marks hidden in place, the problem stands still), unambiguous Model (`modelOk`), a second worked
  example of the same strategy (a third at div S), rows <= 1.4 x content. Guided exempt from EB-PAGE (lead ruling, PT-GDP / §12.1),
  noted in ws-empty-band. Backtest rows model-marks-facts, model-lines-facts, model-fill-facts (fail 343e0b78 / pass fcf13401).
- r2 step 5 gates: ws-empty-band guided + scripted-model, five skills, --model-states: OK (EB-EDGE, MOD-*, EB-PAGE, EB-GDPCAP PASS);
  hash3 (hash2 + Guided S of addition:add and placevalue:identify) vs 7e0c074b: 54 / 54 identical; ws-detailed-lesson --check on the
  4 lessons: OK, outputs (pack.html + page PNGs) identical to 7e0c074b; ws-boot-smoke OK; ws-providers-unit OK; syntax OK.
  Next: independent critic r2 (Guided S + / - at 4 columns; Scripted Model of the five).


## Critic factroles r2 (narrow, f960e549) - FAIL, lowest 6 (C3) on 2 of 25 pages; the other 23 score 8 everywhere
Report design/audit/runs/lf-ops/critic-factroles-r2.md; renders design/audit/runs/lf-ops/factroles-r2-renders/. All r1 defects fixed: G1 (Guided S + / - at 3 columns, nearest ink 2.4 mm), S1 (every state adds a grey mark; the sub Model is 10 - 2), S2 (no step over 2 lines), S3 (Model pages 75-94 % used). Second examples unambiguous, Say lines, fade, nothing given away, keys 26 / 26.
| Finding | Check that would catch it | Backtest state | Note |
|---|---|---|---|
| S4 Scripted Model L, mult_facts and div_facts: 4 states laid 3 + 1 in 3 columns, 2 empty state cells (~62 x 102 mm each) and no second example | MOD-GRID: no empty state cell in a Model grid (EB-PAGE passed: state 4's ink carries the page to 91-93 %) | fail f960e549 mult / div Model L | fix: each example 2 + 2, example 2 on a continuation page |
| state 1's 30-34 % bottom band (room kept for later marks) | accepted by the critic | - | RULING NEEDED: write the exception into H13 / PT-MOD |
- r3 step 1 done: MOD-GRID in ws-empty-band (--model-states): a Model grid cell with no text and no drawing FAILS; on f960e549 4 findings (mult_facts / div_facts Model L, cells 5-6 empty, 61 x 101-104 mm), the other 13 Model renders clean. Backtest row model-grid-facts (fail f960e549, pass = the step 2 fix). Next: step 2 the 2 + 2 fix
- r3 step 2 done: scripted-model factModel - an even state count is never laid unevenly (4 states: 2 a row, never 3 + 1); when one example fills the page at 2 + 2 the second example goes on a continuation page, the Say band (reading that page's example) on the last page; the rows fill to FACT_FILL + 3 %; a column fact (mult) holds its jots beside it (EB-SIDE), an equation (div) keeps them under it, the drawing set 5 mm low. mult_facts / div_facts Model L: 2 pages, 2 x 2, MOD-GRID 0. ws-empty-band guided + scripted-model, five skills, --model-states: OK (and OK at --margin 1 on mult / div L). Next: step 3 PT-MOD-3
- r3 step 3 done: PT-MOD-3 (lead ruling) in ws-empty-band EB-BAND (modBandOk): a scripted-model state, not its example's last, band <= 35 %, and a later state of the same example inks that band - excused; else 30 % as before. --self-test: 9 EB-GDPCAP + 6 PT-MOD-3 cases OK (later ink: excused; never, > 35 %, Guided, last state, ink only in the next example: FAIL). LESSONS_LEARNED entry PT-MOD-3. Backtest model-grid-facts pass = 966292ff: ws-backtest --row model-grid-facts PASS (FAIL on f960e549, OK on 966292ff). Next: step 4 gates
- r3 step 4 gates @ f7b2d7e8: ws-empty-band guided + scripted-model, five skills, --model-states (pin on): OK (30 renders, 238 cells; every rule PASS incl. MOD-GRID); --self-test OK (9 + 6 cases);
  hash3 vs 7e0c074b: 54 / 54 identical (HTML + PNG); ws-detailed-lesson --check on g3-oa5-mult-properties, g3-oa9-mult-table-patterns,
  g3-oa9-input-output-rule, g4-nbt1-ten-times-value: OK, pack.html (stylesheet paths normalised), page PNGs and build.json identical to 7e0c074b;
  ws-backtest --row model-grid-facts PASS; ws-boot-smoke OK; syntax OK (scripted-model.js, ws-empty-band.cjs).
  Critic render of S4: `node tests/scripts/ws-grade-render.cjs --skills multiplication:mult_facts,division:div_facts --roles scripted-model --size L --no-screen --out <dir>` (2 pages each, 2 x 2).
  Next: independent critic r3 (mult_facts / div_facts Scripted Model L).


## Critic factroles r3 (narrow re-check, 9f7983dd) - mult_facts Model L PASS 8 / 8 / 8 / 8; div_facts Model L FAIL 6 (C3)
Report design/audit/runs/lf-ops/critic-factroles-r3.md; renders design/audit/runs/lf-ops/factroles-r3-renders/. S4 fixed on both (2 + 2, no empty state cell, a mark a state, 1-line steps, clear second examples 4 x 12 and 6 ÷ 3, page 2 reads as a page, keys correct).
| Finding | Check that would catch it | Backtest state | Note |
|---|---|---|---|
| S5 div_facts Model L: the band between the step text and the problem is 24.6-25.1 mm of 81.2 mm (30.3-30.9 %, H13 30 %) in all 8 state cells; mult_facts 27.6 % | EB-GAP interior band (an empty band BETWEEN step text and the problem, not only under the ink) >= 30 % | fail 9f7983dd div_facts Model L | fix: raise the problem ~3 mm and open its gap to the first mark (1.3 mm now) to ~4 mm; ws-empty-band missed it: its interior band test does not cover the Model's text-to-problem gap |
- r4 step 1 (S5 check first): ws-empty-band EB-GAP (with --model-states): the band from a Scripted Model state's step text to
  the next ink under it, read on the pixels (the DOM line boxes read 19.3 mm where the glyphs leave 24.8 mm), FAILS at >= 30 % of
  the cell (--margin applies); PT-MOD-3 excuses it as EB-BAND (not the last state, <= 35 %, a later state inks the band).
  --self-test: 9 + 6 + 6 EB-GAP cases OK. On 9f7983dd: div_facts Model L FAIL 8 (24.6-25.1 mm of 81 mm, 30.4-31.0 %, every state
  cell, matches the critic); mult_facts 27.2 % PASS. Backtest row model-interior-band-facts (fail 9f7983dd, pass = step 2 fix).
- r4 step 2 (S5 fix): scripted-model factModel, the continuation-page 'low' row (an equation fact: div_facts L): the drawing 7 mm
  under the step text (was 10 mm) and 5.5 mm from the problem to its first mark (was the shared 1.5 mm). div_facts Model L, pixels:
  step-text-to-problem band 25.8-26.8 % (was 30.4-31.0 %), the problem 3.4 mm higher; state 1's band under its last mark 34.3 %
  (was 35.2 %). mult_facts ('beside' row) unchanged, 27.2 %. ws-empty-band div_facts / mult_facts Model L --model-states: OK.
- r4 step 3 gates @ 04683166: ws-empty-band --roles guided,scripted-model, five fact skills, --model-states (pin on): OK (30 renders,
  238 cells, every rule PASS incl. EB-GAP); --self-test OK (9 + 6 + 6); hash3 vs 7e0c074b: 54 / 54 identical (HTML + PNG);
  ws-backtest --row model-interior-band-facts PASS (FAIL 9f7983dd, OK 04683166); ws-boot-smoke OK; syntax OK (scripted-model.js,
  ws-empty-band.cjs). Next: independent critic r4 (div_facts Model L; mult_facts Model L unchanged).


## Critic factroles r4 (one-page re-check, b606e68a) - PASS, div_facts Scripted Model L 8 / 8 / 8 / 8 on both pages and keys
Report design/audit/runs/lf-ops/critic-factroles-r4.md; renders design/audit/runs/lf-ops/factroles-r4-renders/. S5 fixed: step-text-to-problem band 25.9-26.9 % (r3 30.3-30.9 %); state 1 bottom band 34.4 % inside PT-MOD-3; mult_facts PNGs byte-identical to r3. No defect.
Result of the facts-roles task (r1-r4): every graded Guided (S, M, L) and Scripted Model (S, M, L) page of add_facts, sub_facts, mult_facts, div_facts_long and div_facts scores >= 8 (r2 23 pages; r3 mult Model L; r4 div Model L).

## Next week's order (lead, 2026-11-12 evening; cap $45; branch claude/sweet-newton-c8wrv1-lf-ops-divscreen from master d34311d5)
1. division:div_facts screen hosts (practice card, online worksheet, quiz) for every support, critic >= 8 -> add div_facts to js/modules/redesign-passed.js with its evidence line.
2. Stories / g3-oa8: E9b / E12 (the regression on the lane branch claude/sweet-newton-c8wrv1-lf-ops) and E35.
3. MAIN ops skills of the next short lessons, in order: multiplication:mult_properties + arrays_groups + count_by_tables (Properties of multiplication; the #4 fresh-builder brief is in design/status/lf-ops.md on claude/sweet-newton-c8wrv1-lf-ops); multiplication:mult_chart; mult / div_word_problems_plain; addition:add_column_multi. Each: 8/10 critic, deploy branch with PNGs.

## div_facts screen hosts, critic r1 fix round (builder, Opus medium, 2026-11-12)
- Step 1 (checks): new tests/scripts/ws-screen-support-eq.cjs (SCREEN-SUPPORT-EQ D1/D2, SCREEN-CUE-SIZE D3, SCREEN-SUPPORT-PLACE D4; --self-test 12/12), on precritic's path (gate screen-support-eq). On 1428a84c: FAIL (68) = EQ 22 (array loose pane on every host, nothing on 0 ÷ n in the quiz), CUE 44 (skip 0.19-0.27, think 0.22-0.31 x the fact digit vs paper 0.37 / 0.46), PLACE 2 (touch worksheet 1280 / 820: beside and under mixed).
