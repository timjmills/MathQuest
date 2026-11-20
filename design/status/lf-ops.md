# lf-ops — hand-over at the owner's budget stop (2026-11-14)

The lane stopped on the lead's order: only 1–2 % of the week was left. Resume after the Thursday 22:00 UTC reset.
Spend at the stop: session cost_usd $1,216.42 (2026-11-15) (baseline $756.09).

## Live (lead, 2026-11-15: mixfacts 5c005e18d with the simple-print rule amended to ruling (a); tables-15 d38308824 with D1 fixed by the lead, re-check C2 9)
| Work | Branch @ head | State |
|---|---|---|
| div_facts / add_facts arrays (divship) | -lf-ops-divship | LIVE (master e9cb5797c) |
| Long-division bracket: joined (LDIV-JOIN, -RASTER), near-straight (LDIV-SHAPE), bigger work boxes at 4 a page (LDIV-ROOM) | -lf-ops-ldiv @ 0b98813ea | every narrow critic PASS; owner approved the boxes as they are; lead deploying |
| Mixed facts: ÷ inside the shared grid (MIXED-ALL-OPS), room above fact brackets (LDIV-FACT-ROOM) | -lf-ops-mixfacts @ 638971967 | narrow critic PASS 9/9/8/9. **Deploy NOT pushed** (lead, 2026-11-15): merged with master 55cbe72d2, ws-simple-print FAILs 6 rows on the OWNER ÷ Mix p1 c9 grid-2 cases (mixed and sections): MIXBASE (baselines 4.8 mm apart, items 2.9 mm off centre) and SLOTPOS (quotient slot 4.8 mm off the top digit line). Ruling (a) contradicts simple-print's one-baseline rule. **First item after the reset:** update MIXBASE / SLOTPOS to ruling (a) (bracket rows in Mix grids are measured against the bracket's own baseline, still ±1 mm among the brackets), drop simple-print's S cases (no-size-s), add a FAIL / OK backtest, rerun the gates and send the head to the lead. |

## In progress or parked, in resume order
1. **count_by_tables r4** (FIRST on resume: the hash proof, then the narrow critic) (-lf-ops-props @ 4c249ee1d, with lf-checks eblast 2225965ce merged). F1 (Pre-skill check L 10 → 14 items) and m1–m3 are fixed, each check first (backtests 5/5). Precritic reds are routed classes only.
   **Before its narrow critic:**
   - hash-prove that passed skills are unchanged, because the pre-skill-check role and the print-sheet.js retitle are shared code;
   - send every changed passed Pre-skill Check page to the critic, add_facts included. If it now fills, the add_facts open defect closes.
   - eblast must reach master, or merge with it.
2. **area_model_div_4by2**: PARKED as built (-lf-ops-amdiv @ a910a45f5; card signed d96ee4579). Its area-model-div TEMPLATE round, covering 2by1 / 3by1 / 4by2, comes first after the reset (lead), then its full critic. Do NOT merge it toward master before then: its template change alters the live 2by1 and 3by1 pages ungraded.
3. Queued:
   - add_int number-line LABEL-GAP;
   - divide bracket at range 1000 still on the old template (ldiv-room N3);
   - add_facts Prerequisite Check fill, if item 2 does not close it.
4. Next build list: the multiplication size pairs (in lf-ops-props.md) — area_model_4by1, mult_4by1_column, area_model_2by2, area_model_3by2, mult_3by2_standard.

## Rules carried forward
- Every finding gets a check that fails on the bad commit and passes on the fix, a backtest, a place on precritic's path, and a ledger row.
- Never write a card's "Signed:" line; the lead signs.
- Run browser gates one at a time. ws-precritic and ws-backtest are never wrapped.

## Queued after the reset (lead 2026-11-20)
- **count_by_tables Pre-skill Check at L: narrow re-grade.** It now prints the lf-roles deployed fill: 10 items, legal under ruling 1c (ceiling 8). Run it together with lf-roles' PSC trim pass. Re-arm the backtests `eb-lastpage-cbt-pre-skill-check` and `cap-parity-cbt-pre-skill-check`, which are pending, superseded by 1c, with a fail state below the ceiling.
- **area-model-div template round 3:** start with the two root-cause tools (see lf-ops-amdiv.md).
- **Bugs branch** (-lf-ops-bugs 9e8d06c83):
  - the division-cell fact-size side band (H13 on divide bracket, tiles=21, regroup=mixed);
  - the add_facts precritic;
  - a narrow critic on the changed pages.
- **Sizes** (-lf-ops-sizes 4783d88b7; card signed 55f7c31d4):
  - the 6 lessons;
  - mult_3by2_standard Reason It L OVERFLOW;
  - area_model_4by1 LONE-PAGE;
  - record the confirmed 4x1 deal decision in the card;
  - the full critic.
