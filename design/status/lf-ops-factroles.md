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
