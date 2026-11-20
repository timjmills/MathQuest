# Critic eblast r2 — EB-LASTPAGE + CAP-PARITY (ws-empty-band --page-fill)

Independent critic (Opus medium), 2026-11-20. Graded `git diff 68e6c3566..7c7d487c1` on claude/sweet-newton-c8wrv1-lf-tools-eblast
(the gate change is 1c70049cc + 7c7d487c1; the rest of the range is the master merge).

**Verdict: FAIL** — C1 6, C2 8, C3 4, C4 7.

## Runs
- `ws-empty-band --self-test`: OK (r1 cases + r2 gap 6, count 6, PG-23 4, notes 2).
- `ws-backtest --row eb-lastpage-cbt-pre-skill-check,cap-parity-cbt-pre-skill-check,eb-lastpage-fixture-pre-skill-check,cap-parity-fixture-row-gap,eb-lastpage-fixture-test-pg23`: 5 PASS, 0 FAIL.
- `ws-precritic-plan --checks-from-critics`: OK (346 pass, 90 exempt, 0 fail).
- `ws-empty-band --skill placevalue:value --roles mixed-practice,pre-skill-check --page-fill --only EB-LASTPAGE,CAP-PARITY`: FAIL 3 (the routed reds).
- `ws-empty-band --skill multiplication:count_by_tables,addition:add_facts,placevalue:identify,division:div_facts,subtraction:sub_100_no_regroup
  --hosts none --page-fill --no-baseline --only EB-LASTPAGE,CAP-PARITY`: **FAIL (11)**. count_by_tables: clean. Every other skill red:
  - EB-LASTPAGE: add_facts pre-skill-check M / L (78 %, routed); **placevalue:identify pre-skill-check L p2 36 %; div_facts pre-skill-check M 82 % / L 79 %; sub_100_no_regroup pre-skill-check L p2 39 %** (not routed).
  - CAP-PARITY: **placevalue:identify scripted-model 6 vs 10; sub_100_no_regroup scripted-model 4 vs 8; div_facts mixed-practice 10 vs 21; placevalue:identify pre-skill-check 4 vs 8; sub_100_no_regroup pre-skill-check 6 vs 16** (none routed).

## The disputed measurement (placevalue:value mixed-practice L)
Rendered it myself (buildSheet, seed 7, A4, print media; `.ws-body` 239.0 mm). One band, one strip (8.0 mm), 5 rows of 37.2 mm,
2 across, gaps 0.5 mm; last row bottom 198.7 mm, band bottom 199.2 mm, white 39.8 mm. M: 7 rows of 31.0 mm x 3 across = 21.
**The builder's geometry is right: a 6th 37.2 + 0.5 mm row fits (2.1 mm spare), on the same shelf, no new strip needed.**
**The red is still FALSE.** WORKSHEET_DESIGN_STANDARD §12.1 "Ceilings by page role": *Mixed practice | 9 rows | 7 rows | 5 rows*,
and "A ceiling is never exceeded; a smaller count is always allowed". The packer enforces it (`mixed-practice.js` `maxShelves
{S: 9, M: 7, L: 5}`, `MAX_SHELVES` citing §12.1). The L page is AT its ceiling, so it is full by contract; the fix CAP-PARITY asks for
(15 items = 8 rows of 2) is forbidden. The same false red fires on division:div_facts (10 vs 21). Do not route it to lf-placevalue.

## Findings
- **G1 (C1, C3) "full" ignores the role's published ceiling.** `full = !rowFits(pg)` is geometry only. A page at its §12.1 L ceiling is
  full whatever white remains. Mixed practice (5 rows) is the live case; by the same table True or False (6 -> 4, needs 5), Reason It,
  Error analysis (4 -> 2-4) and Wide-visual rows (4 -> 3) need ceil(0.7 x M) above or at the L ceiling, so any of them with a short
  row would go red. Fix: `need = min(ceil(0.7 x M), the role's L ceiling)` (or `full` when the L page holds its ceiling), the ceiling
  read from one table that cites §12.1; self-test cases at mixed 5 rows x 2 = 10 vs 21 (pass) and true-false 4 vs 6 (pass).
- **G2 (C1, C3) CAP-PARITY judges fixed-layout roles.** F2's test is "has a `counts()` export", which scripted-model, opener, review,
  lesson, stretch, fact-probe all have. Scripted model is "1 problem, 3-6 frames, same" at every size (§12.1): its frames are not a
  capacity, so 6 vs 10 / 4 vs 8 are false reds on two passed skills. The EB-LASTPAGE note already calls these roles "not a
  fixed-capacity role (PT-ENG-3 banded / fixed layout)" — CAP-PARITY must use the same classification. Restrict CAP-PARITY to the
  fixed-capacity roles with a §12.1 L ceiling (pre-skill-check, test, true-false, reason-it, error-analysis, mixed-practice under G1),
  note the rest. `counts()` presence is a proxy for "the role chooses the count", not for "the role fills its page".
- **G3 (C3, C4) The collateral count is wrong again (r1 F6 recurs).** The status lists 7 reds on 3 skills and says lanes "see them".
  A 5-skill sample finds 11 more on 4 other passed skills; 3 are G1/G2 false reds, 6 are the pre-skill-check family (div_facts M/L,
  identify L p2, sub_100 L p2, identify and sub_100 parity). The r1 automatic check ("run the new rule over every id in
  redesign-passed.js and list each red") was not run. Since precritic adds `--page-fill` by default (ws-precritic.cjs:927), every lane
  on these skills is blocked by an unlisted red. Run the whole passed list, list each red, route the real ones, fix the false ones.
- **G4 (C1, note) The pre-skill-check reds look systemic, not per-skill.** Every pre-skill-check render in the sample is red: one-row
  pages at M (78-82 %) and a spill to 2 pages at L. That is a role-composer defect (PT-PRE-1 four quadrants / PT-PRE-2 grids) to route
  once to the pre-skill-check owner, not per skill to lf-ops and lf-placevalue. Not a gate defect; the gate is right to fire.

## F1-F7 check
- F1 (row + gap): correct, and the measure is now the tallest row. Verified by hand above.
- F2: right for independent / more-practice (no `counts()`, PG-23 teacher count) and `--columns`; wrong for fixed-layout roles (G2).
- F3: matches PG-23 (WORKSHEET_DESIGN_STANDARD.md:130 — the status cites it as if in PAGE_TYPES; it is not there) and PT-PRE-1
  (PAGE_TYPES.md:651, four quadrants on one body). The self-test holds the 1/3 boundary. Pass.
- F4 / F5 fixtures: honest. Each page is a full A4 page of real boxed cells (15-23 cells, real geometry), no empty pages; the pairs
  flip the same role. cap-parity's pair flips on the gap alone (3 mm -> 5 mm), the exact F1 boundary. Pass. The cbt rows are
  correctly labelled INTERIM.
- F7 notes: fixed.

## Automatic checks that would have caught these
- G1: a self-test row per §12.1 role with L at its ceiling and room for a row (must pass); a lint that CAP-PARITY's role list and a
  ceiling table cite §12.1.
- G2: a self-test row `capParity('scripted-model', ...)` must be "not judged"; one classifier shared by EB-LASTPAGE notes and CAP-PARITY.
- G3: `ws-empty-band --page-fill --only EB-LASTPAGE,CAP-PARITY` over every id in `redesign-passed.js`, its red list diffed against the
  status note's routed list, as a pre-report step for this lane.

## Speed
Round 2 lost to the same class as r1 F6 (collateral not swept). The sweep of the passed list (~32 skills, ~1.4 min each) is the
missing step; it costs less than a critic round.
