# Critic: Wave 2 tagging of Y4 (Grade 3), round 3

This critic run is dated 2026-10-10. It checks `data/curriculum/links/Y4.json` at commit 9904ef79 (round 3, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y4`). I did not edit the tagging data. I am independent of the tagger and of
the round-2 critic.

## Verdict: FAIL (narrowly)

| Steps graded | Mean | Random 25 | Hard 7 | Round-2 failures re-checked (13) | Steps under 8 |
|---|---|---|---|---|---|
| 41 | **7.98** | 7.92 | 8.00 | 8.00 | 4 |

Distribution: 9 ×4 · 8 ×33 · 7 ×3 · 6 ×1.

Round 3 fixes almost everything round 2 asked for:
- There are no keys in both pre and related.
- No step lists its own build in `preBuild`.
- Every step has at least 3 pre-skills.
- Every partial or gap step has a complete envisioned skill, and no `closes` copies a proposal's `teaches`.
- The owner rulings are met.
- 12 of the 13 round-2 failures now score 8 or 9.

I found **no systematic defect**: every defect class below is isolated, with 2–8 instances in 129 steps. The mean,
however, is 0.02 under the bar, so the strict rule (mean ≥ 8 and no systematic defect) gives a FAIL. Four steps, listed
under "What a pass needs", are enough to pass.

## Method

- **Sample.** `random.Random(20261017).sample(step_ids, 25)` over the 129 step ids in file order. This is a new seed
  (neither 20261012 nor 20261014). I added 7 hard steps and all 13 round-2 failures, which makes 41 distinct steps.
  - Hard steps: B2.S4 (exchange count), B8.S10 (÷ 100), B7.S7 (mixed → improper), B14.S1 (coordinates), B1.S13 (Roman
    numerals), B4.S9 (11 times-table) and B11.S2 (time).
  - Round-2 failures: B1.S6, B1.S10, B3.S3, B4.S10, B6.S9, B7.S4, B9.S5, B13.S3, B14.S2, B2.S7, B8.S4, B8.S6 and
    B7.S8.
- **For each step.** I read the title, CCSS, notes and vocabulary from `wrm-steps.json`. From the Grade 3 sheet of the
  xlsx (openpyxl), I read the row for each week and that week's prior-learning list.
- **Generating items.** I generated 8 items for every direct and partial skill, with the tagged opts and `maxNumber`, on
  the PRINT path (`generateQuestionFor` with `itemIndex` and `itemCount`, seeds 31337 + 29i). I also swept every other
  `full` step, 6 items each. I did not use the items log.
- **Option schemas.** I read the schema of every skill involved (`optionsFor`), to check option values and whether a
  proposal is already built.
- **Whole-file scripts:**
  - `defects.py`: rules 10, 13, 14, 15, 16, S5, liveness, pre `why` labels, and verdict consistency.
  - The CCSS-domain pre check.
  - `matchcheck.mjs`: every `match`-type option in the file, on the print path.
  - The tagger's `optcheck.mjs`, re-run: 316 opts entries, 0 problems.
  - `coord.mjs`: the coordinate bug.
- **Scratch:** `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r3/`
  (`ctx.py`, `ctx-Y4.txt`, `genall.mjs`, `items.txt`, `fulls_items.txt`, `defects.py`, `matchcheck.mjs`, `coord.mjs`,
  `schema*.mjs`).

## The coordinate_q1 print-path bug: REAL

I generated 40 items per run, with seeds 500 + 7i:

| opts | live play (no `itemIndex`) | print path (`itemIndex`) |
|---|---|---|
| `{forms:[0]}` read | 40 read / 0 plot | **20 read / 20 plot** |
| `{forms:[1]}` plot | 0 read / 40 plot | **20 read / 20 plot** |

`print-sheet.js` (line 253) generates with `itemIndex`. In `generate-question.js`, the `forms` option is a P12 `match`
filter (`p12Acceptor`, which redraws up to 80 times and keeps the last draw). On the print path the variant is fixed by
the item index, so every redraw gets the same variant, and the filter cannot change it. The tagger's diagnosis and
`coord_forms_fix` are right, and partial on B14.S1 and S2 is the honest verdict.

A related observation that does not change any verdict:
- `count_by_powers_of_10 {step:[2]}` passes its own filter on only 9 of 12 print items. Its regex `by \d+,?\d{3}s`
  cannot match "by 1,000,000s".
- The items are still "1,000s and more", and B1.S4 is partial anyway.
- The lead could fix the regex alongside `coord_forms_fix`.

Every other `match` option in the file is honoured on the print path (12/12): `length_metric`, `bar_graph`,
`compare_decimal`, `unit_conversion_word` and `count_by_step_up`.

## Whole-file defect counts

| Id | Defect | Count (whole file) | Systematic? |
|---|---|---|---|
| S1 | Noise pre-skills (no building block) | The crude domain check flags 108 of 570; by hand almost all are real building blocks (facts for perimeter, ×60 for time, place value for decimals). **About 7 are noise:** B12.S3 ← `symmetry`, `compose_shapes`; B1.S13 ← `time_hour`; B9.S4 ← `equiv_frac_visual`; B14.S2 and B14.S4 ← `count_sequence`; B3.S4 ← `compare_groups` | No |
| S2 | Option missing or not real | 0 schema problems. Missing where one is obvious: B8.S2 `d_to_f {}` (it has `denoms`; `f_to_d` beside it has `[5]`). `coordinate_q1` items reach 18–20 because Max Number 10,000 leaks in, and no `maxNumber` or band is set (the step is partial anyway) | No |
| S3 | Full claimed but not dealt, or a proposal already built | **1 in the sample.** B7.S4: `mixed_nl_drag {}` never asks "what mixed number is at the arrow?", and 2 of 8 items have no mixed number ("1/3, 2/3" and "2/3, 1"). B8.S4 is marked partial for exactly the missing read form. In the full-step sweep, two are worth a look: B7.S1 `whole_as_fraction` (half its items are "6 = 6/1") and B7.S13 `sub_fractions_like` (asks to simplify: 10/12 − 2/12 = 2/3). **No new proposal is already built:** every NEW option's target schema was checked | No |
| S4 | Related empty or padded | 0 empty. 16 steps have 1 related skill, which is fine. Padded: B12.S3 ← `order_least_to_greatest` ("the ordering routine") | No |
| S5 | Own build in preBuild | 0 | No |
| S6 | Pre `why` label false | B13.S3 and B13.S4 cite B14 as "earlier block this year" (B14 comes later). B8.S6 cites B8.S5 for `place_value_10x {band:1000}`, which is the whole-number ÷ 10 of B5.S5. B6.S9 cites B6.S8 for `perimeter_intro {labels:'some'}`, but B6.S8 uses `{}`. B8.S2 cites wk W29, which is a Test row (the list is W30). B4.S9 and B4.S10 cite the later B4.S11, but say why (same school week) | No (≈ 7) |
| S7 | Envisioned skill incomplete | 0 missing fields; 0 `closes` = `teaches`; 3 of 98 `closes` overlap the step's `missing` only loosely, and all 3 are defensible (B5.S8, B6.S8, B7.S9). B7.S5's second build `frac_beyond_1` "closes" ordering on a line, which `mixed_nl_drag` already shows | No |
| R7 | Range wider than the step | B2.S7 `sub_across_zeros {band:10000}` also deals 100 − 29 (2-digit), though the clause says 3-digit; it is partial anyway. Coordinates to 20 (see S2) | No |
| R8 | Response mode | B11.S3 `to-analog` is "check one of three clocks" on paper. Drawing the hands has no live skill, so this is noted, not counted against the score | No |
| R9 | Multiples | `count_by_tables {constant:[n]}` deals true multiples of n (checked for 3, 6, 7, 9, 11 and 12) | No |
| R10 | Same key in pre and related | **0** | No |
| 14 | Earlier-step skill left only in related | 130 related keys are skills of an earlier step; I judged each one. Almost all are another form, the inverse, or the next step, and their `why` says so. Two are real building blocks left out of pre: B6.S9 ← `composite_shapes` (rectilinear perimeter, B6.S5 and B6.S7), and B9.S4, which has no decimal pre at all (`f_to_d`/`d_to_f` from B8.S2 and B8.S8) | No |
| 15 | Fewer than 3 pre | 0 | No |
| 16 | `closes` = `teaches` | 0 | No |
| 17 | Option changes nothing | 0 (re-ran the tagger's checks: `optcheck` 0 problems). `f_to_d {denoms:[5]}` still deals 25/100, 1/5 and a halves/quarters sort, but the step is partial with that exact clause | No |

Liveness: every key is live; none is retired. Every non-full step has a build, and no gap step lists a skill.

## Owner rulings

- **One `roman_numerals`.** Bands 12, 100, 1,000 and 3,999; read and write; `supersedes` roman_12, roman_100 and
  roman_1000. No other reference to those ids remains in the file. **Met.**
- **Exchange count on every band.** `exchange_count_add` and `exchange_count_sub` each list the 100, 1k, 10k, 100k and
  1m `*_regroup` skills. **Met.** `add_10k_regroup` and `sub_10k_regroup` have only `band` and `zeroPlace`, so the
  option is not built yet.
- **`improper_mixed` one direction.** `improper_mixed_dir` (`dir: to-improper | to-mixed | both`) is on B7.S7 and B7.S8.
  The schema has only `denoms` and `level`, so it is not built yet. **Met.**
- **`tables_to_15`.** No Y4 step asks for the 13–15 tables. B4.S9 and B4.S10 point to it in their notes. **Met.**
- **24-hour clock.** `time_24h_convert` is on B11.S4 and B11.S5. **Met.**

## Scores

The criteria are:
- (a) direct skills right, with real opts, judged on the print path;
- (b) an honest verdict;
- (c) no missed live skill or built option;
- (d) the envisioned proposal closes the step's clause;
- (e) pre-skills are earlier building blocks, ranked, at least 3;
- (f) related skills share the idea, are not padded, and are not pre;
- (g) keys are live.

### Random 25 (seed 20261017)

| Step | Verdict | Score | Finding |
|---|---|---|---|
| B1.S8 1, 10, 100, 1,000 more/less | partial | 8 | Honest. `more_less_10 {step:0}` stays within 100; `more_less_100` with step 1,000 deals 4-digit numbers and with step 100 deals 3-digit only. `more_less_all` is right |
| B1.S12 Order to 10,000 | full | 9 | Both directions, all 4-digit; good pre ranking |
| B1.S16 Round to 1,000 | full | 9 | Three forms (number, line, sort); 4,500 and 6,500 edge cases dealt |
| B2.S6 Subtract, one exchange | partial | 8 | Honest: 8,211 − 4,746 has three exchanges, and 7,740 − 183 is 4-digit minus 3-digit |
| B2.S7 Subtract, 2+ exchanges | partial | 8 | Honest. The across-zeros clause should also say "and 2-digit" (100 − 29) |
| B4.S12 Divide by 1 and itself | partial | 8 | `mult_properties {forms:[2]}` is ×1 only; `div_facts {constant:[1]}` is n ÷ 1 only. `div_by_itself` is right |
| B5.S7 Related facts | partial | 8 | Multiplication only (7 × 30); `scaled_fact_family` fits |
| B5.S13 3-digit ÷ 1-digit | full | 8 | No remainders on any of the three skills; the note is exact |
| B6.S3 Perimeter on a grid | full | 8 | Right |
| B6.S4 Perimeter of a rectangle | full | 8 | Forms 0 and 1 dealt (find the perimeter, find a missing side) |
| B6.S7 Perimeter of rectilinear shapes | partial | 8 | Honest (every side labelled). Thin pre: add a subtraction pre for finding a missing length |
| B6.S8 Perimeter of regular polygons | partial | 8 | Honest; `regular_polygon` + `polygons` |
| B6.S9 Perimeter of polygons | partial | 8 | Honest (squares and rectangles only). Move related `composite_shapes` to pre (rule 14). Pre #2 cites B6.S8 with opts B6.S8 does not use |
| B7.S3 Partition a mixed number | gap | 8 | Right gap; preBuild `frac_whole_partition` |
| **B7.S4 Mixed numbers on a line** | full | **7** | **Over-claim (S3).** `mixed_nl_drag {}` is place-only: there is no "what is at the arrow?" form, and 2 of 8 items have no mixed number ("1/3, 2/3"; "2/3, 1"). B8.S4 is partial for the same missing read form. Make it partial; build `frac_beyond_1` or a read-form option on `mixed_nl_drag` |
| B7.S5 Compare/order mixed numbers | partial | 8 | Honest. The second build, `frac_beyond_1` ("order on a line"), closes nothing `mixed_nl_drag` does not already show |
| B7.S8 Improper → mixed | partial | 8 | Honest (3 of 8 items are "convert to a mixed number"); `improper_mixed_dir` is right |
| B8.S2 Tenths as decimals | partial | 8 | Honest. Give `d_to_f` the opts `{denoms:[5]}` as well. The W29 label points to a Test row |
| **B9.S4 Flexibly partition decimals** | gap | **7** | Right gap and build. **Pre has no decimal skill:** add `f_to_d`/`d_to_f` (B8.S8 hundredths as decimals) and preBuild `decimal_pv` for B9.S3 (rule 14). Drop `equiv_frac_visual` (noise) |
| B10.S1 Write money with decimals | full | 8 | USD coins and bills, written with the point |
| B11.S3 Analogue ↔ digital | full | 8 | Right, at precision 1. `to-analog` is choose-a-clock (there is no draw-hands skill), and the am/pm vocabulary is never dealt |
| **B12.S3 Compare and order angles** | partial | **6** | Honest verdict and build. **Pre is noise:** `symmetry` and `compose_shapes` do not build angle comparison, and `name_2d_shapes` (R) is far. Add preBuild `turns` (Y3 "Turns and angles", in the W28 list). Related `order_least_to_greatest` is padding |
| B12.S8 Complete a symmetric figure | gap | 8 | Right gap. `perimeter_grid` as a pre is borderline (counting squares on a grid) |
| B13.S2 Comparison, sum, difference | full | 8 | `bar_graph` forms 2 and 3, plus `pictograph` |
| B14.S5 Describe translation | partial | 8 | Honest: the pupil picks the image and never describes the move |

### Hard 7

| Step | Verdict | Score | Finding |
|---|---|---|---|
| B2.S4 Add, 2+ exchanges | partial | 8 | Honest (397 + 7,027 is 3-digit + 4-digit). The envisioned option is on every band |
| B8.S10 ÷ 100 | partial | 8 | Honest: 697 ÷ 100 and 734 ÷ 100 are 3-digit. The envision adds the tenths and hundredths columns |
| B7.S7 Mixed → improper | partial | 8 | Honest; same skill and proposal as B7.S8 |
| B14.S1 Describe position | partial | 8 | Honest. The print bug is verified real (20/40). No band or `maxNumber` is set: items reach (18, 19) |
| **B1.S13 Roman numerals** | gap | **7** | The proposal is right (one skill, bands, read and write). Pre `time_hour` ("Y3 Roman numerals to 12") is a forced mapping: the clock face shows 1–12, not Roman numerals. Use place value and addition pre (`expand`, `combine`, `add_three`), with the note |
| B4.S9 11 times-table | full | 9 | Every item is an 11 fact, both ways, plus counting in 11s. Pre ×10 and ×1 are the building blocks of ×11 |
| B11.S2 Hours, minutes, seconds | partial | 8 | `units:[0]` deals h → min and min → s only; honest clause. preBuild `time_units` |

### Round-2 failures, re-checked

| Step | R2 | R3 | Status |
|---|---|---|---|
| B1.S6 Partition to 10,000 | 7 | 8 | R10 fixed |
| B1.S10 Estimate to 10,000 | 7 | 8 | Partial with `place_on_number_line {span:1000}`; fixed |
| B3.S3 Make shapes | 7 | 8 | Noise pre dropped |
| B4.S10 12 times-table | 7 | 9 | Fact family moved to related; every item is a 12 fact |
| B6.S9 Perimeter of polygons | 7 | 8 | Partial; Y3 perimeter added to pre |
| B7.S4 Mixed numbers on a line | 7 | **7** | The round-2 item is fixed (`fraction_number_line` moved to pre), but there is a new over-claim (see above) |
| B9.S5 Compare decimals | 6 | 8 | `{decimals:2, forms:[0]}` at Max Number 10; honest same-whole clause |
| B13.S3 Interpret line graphs | 7 | 8 | `line_plot` dropped. A pre label calls B14 an "earlier block" |
| B14.S2 Plot coordinates | 6 | 8 | `forms:[1]`; partial for the real print bug |
| B2.S7 Subtract, 2+ exchanges | 7 | 8 | Partial with the 3-digit clause |
| B8.S4 Tenths on a line | 6 | 8 | `ticks:'some'`, partial; `dec_nl_past_1` |
| B8.S6 2-digit ÷ 10 | 7 | 8 | R10 fixed. A pre label cites B8.S5 for the whole-number opts |
| B7.S8 Improper → mixed | 5 | 8 | Partial + `improper_mixed_dir` |

## What a pass needs (round 4, small)

These four steps are under 8, and they decide the result:
1. **B7.S4.** Mark it partial: `mixed_nl_drag {}` "places only; never reads the mixed number at a point; some items have
   no mixed number". Build a read form, either through `frac_beyond_1` or as a `forms` option on `mixed_nl_drag`.
2. **B12.S3.** Drop the pre-skills `symmetry` and `compose_shapes`. Add preBuild `turns` (Y3 Turns and angles, W28). Keep
   `name_2d_shapes` only if a building block cannot be found, and say so in the note. Drop the related
   `order_least_to_greatest`.
3. **B9.S4.** Add the decimal pre-skills `f_to_d`/`d_to_f` (B8.S8) and preBuild `decimal_pv` (B9.S3). Drop
   `equiv_frac_visual`.
4. **B1.S13.** Replace pre `time_hour` with place-value and addition building blocks, and say why in the note.

Housekeeping (the score does not depend on it):
- Fix the pre `why` labels on B13.S3 and B13.S4 ("later block, same school week W37"), B8.S6, B6.S9 and B8.S2.
- B6.S9: move `composite_shapes` from related to pre.
- B8.S2: add `d_to_f {denoms:[5]}`.
- B2.S7: add "and 2-digit" to the `sub_across_zeros` clause.
- Look again at B7.S1 (`whole_as_fraction` deals n/1) and B7.S13 (simplified answers), found in the full-step sweep.
- The lead: fix the `count_by_powers_of_10` "1,000s and more" regex together with `coord_forms_fix`.
