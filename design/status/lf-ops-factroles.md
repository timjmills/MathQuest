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
