# lf-engine live-pm — narrow independent critic (Opus medium), 2026-11-13

Branch `claude/sweet-newton-c8wrv1-lf-engine-live-pm` @ 3e70238c3 vs master cf1e5abe. Seed 4242, practicePages 1, mixed, A4,
sizes L and S, pupil + key rendered from each tree (own harness run, `MQ_ROOT` per tree), H13 / page-blank / LIVE-PART
measured with ws-lesson-samples' own `sheetCheck` and `carryMeasure`.

## VERDICT: FAIL on the 8-bar (min 5) — but the FIX itself is safe: no regression, every changed page equal or better

All 28 changed PNGs (14 pupil, 14 key) are Practice / Mixed pages only; nothing else moved. Every failing grade below is a
defect master already has, untouched by this branch. If the gate for this deploy is "no regression + F5/F6/F7 correct",
it passes; if it is "every spot page ≥ 8", it fails on pre-existing defects listed as follow-ups.

| Page | Size | C1 | C2 | C3 | C4 | min | vs master |
|---|---|---|---|---|---|---|---|
| div_facts p4 Mixed | L | 8 | 8 | 6 | 8 | 6 FAIL | better |
| div_facts p4 Mixed | S | 8 | 8 | 6 | 8 | 6 FAIL | equal |
| sub_wp_10 p4 Mixed | L | 8 | 8 | 8 | 8 | 8 PASS | better |
| sub_wp_10 p4 Mixed | S | 8 | 8 | 6 | 8 | 6 FAIL | better |
| fact_family_sort p4 Mixed | L | 8 | 8 | 6 | 8 | 6 FAIL | equal |
| fact_family_sort p5 Mixed cont. | L | 8 | 8 | 5 | 7 | 5 FAIL | better |
| fact_family_sort p4 Mixed | S | 8 | 8 | 8 | 8 | 8 PASS | better |
| add_wp_20 p4 Mixed | L | 8 | 8 | 8 | 8 | 8 PASS | better |
| add_wp_20 p4 Mixed | S | 8 | 8 | 6 | 8 | 6 FAIL | better |
| sub_100_regroup p4 Mixed KEY | L | 8 | 8 | 8 | 8 | 8 PASS | better |
| sub_100_regroup p4 Mixed KEY | S | 8 | 8 | 8 | 8 | 8 PASS | better |
| nearest_10 p5 Mixed KEY | L | 8 | 8 | 7 | 7 | 7 FAIL | better |
| nearest_10 p4 Mixed KEY | S | 8 | 8 | 8 | 8 | 8 PASS | better |
| nearest_10 p4 Practice (F7) | L | 8 | 8 | 8 | 8 | 8 PASS | better |

## What the fix got right (verified)
- F6: on every Mixed KEY the dead hundreds carry box is gone (LIVE-PART dead boxes 1 -> 0 on sub_100_regroup L/S and
  nearest_10 L/S). The tens carry box stays and is filled on every addition stack (79+18, 51+19, 36+28; 69+23, 22+48,
  34+16 all carry). No carry box missing where a sum carries.
- F5: fact / counter stacks on Mixed pages are now centred: band 44% -> 24% (add_wp_20 L, sub_wp_10 L, fact_family_sort L
  p5), 50% -> under 30% (div_facts L cells 7-12), 34-35% -> under 30% (S). Stacks keep right-aligned digits and the answer
  bar under them; nothing floats away from its answer space.
- F7: rounding Practice cells band 49% -> 28% (nearest_10 L p4, S p3).
- Keys are facsimiles of their pupil pages (same geometry, answers in the slots) on every sampled page.

## Blocking findings for the 8-bar (all PRE-EXISTING, not introduced here)
1. H13 equation / missing-factor cells on Mixed: div_facts L cells 13-14 band 53%, S cells 19-22 band 54% (and S cells
   1-12 40%). The F5 centring did not reach the `equation` cells; same class, next fix.
2. H13 word-problem cells at S: sub_wp_10 and add_wp_20 S p4 cell 2 band 37% (92 x 67 mm row sized for the taller story).
3. Mixed pagination: fact_family_sort L puts the 6-cell Subtraction row on a continuation page (p5 72% blank) while p4
   ends 29% blank. Page-blank / H13 row class.
4. nearest_10 L Mixed (p5) rounding cells 1-6: not centred like the S page and the Practice page; T|O hugs the left wall and
   the item label collides with the "T" heading. Same class as F7, only applied to Practice.
- Out of the spot list but seen: div_facts S Practice p3 cells still 47% band (fact cells on Practice not centred at S).

## Checks that would have caught these
- PM-H13 (the branch's new gate) should run on every lesson Mixed / Practice cell of every template (equation, word
  problem, rounding on Mixed), not only fact / counter / rounding-on-Practice.
- A page-blank check on continuation pages of Mixed sheets (a page ≥ 50% blank that follows a page ≥ 20% blank = fail).
- A label-collision check: item label rect vs the first content rect in the cell (overlap or gap < 1 mm).
