# Y6 (US Grade 5) WRM tagging: independent critic, round 3

Critic lane: fresh independent critic (Opus, medium). I did not write the work. Inputs:
`data/curriculum/links/Y6.json` and `Y6-report.md`, graded against `BRIEF.md` ("For each step, decide", "Output", "Quality").

## Method
- **Sample.** 28 steps drawn at random with seed 3141 (a new draw), plus 4 re-checks of round 2's lowest steps
  (B9.S7, B7.S4, B13.S1, B2.S15). I graded all 32 and swapped none out.
- **Step records.** For each step I read its record in `data/curriculum/wrm-steps.json` (title, CCSS, notes).
- **Skill keys.** I loaded `SKILLS` from `js/modules/data.js` in node. Every key in direct, partial, pre and related
  across all 114 steps is live, and none is a tombstone. Every `build` and `preBuild` id exists in `proposals`. No
  related entry repeats a direct skill, and no list is longer than 8.
- **Items.** I generated items in the browser with `generateQuestionFor` through the `ws-harness`. The browser ran
  one gate at a time, with seeded items, using each entry's own `opts`. I did this for 45 skills, among them
  mult_placeholder_zero (at Max Number 100 and 10,000), multiply, area_model_mult_hard, number_word_names and
  pv_digit_drag (at range 10M), divisibility_sort, exponents_simple {step:[0]}, the fraction_of_set family, compare_frac_lcd,
  order_fractions, add/sub_frac_unlike_nv, mass_volume_liquid, unit_conversions {units:[0]}, capacity {units:[1]},
  length_metric, estimate_length {forms:[0]}, percent_of_number {forms:[0]}, the six f/d/p converters,
  evaluate_expression(_hard), write_expression, coordinate_q1, composite_shapes {forms:[1]}, mult_comparison, the
  four OoO direct skills with their opts, count_by_step_down, temperature, ratio_tables and classify_triangles. I also
  ran `ws-content-audit --skill mult_placeholder_zero --n 12 --report-only --json` (OK).
- **Options.** I checked every entry's `opts` key against `js/modules/skill-options.js`: `forms` (from
  _p12Match/_p12Variants), `units`, `step` and `source`.
- **Prior learning.** I read the school prior-learning lists from the xlsx, sheet "Grade 5": col 0 is the week, col 6
  the lesson, and col 14 the prior list on the first lesson row of each week.
- **tagFixes.** For each sampled step I took the diff between direct/partial and the live `SKILL_WRM` in
  `js/modules/wrm.js`, and compared it with the step's tagFixes. All 32 match exactly (add, partial and remove).
- **Format.** Every step has all 10 keys. Verdicts are consistent: a full step has empty build, missing and
  partial; a partial or gap step has a build; a gap step has no skills. Every proposal has the full shape plus
  `reused`. The report's counts (114 = 25 full / 69 partial / 20 gap) match the file.
- **Earlier rounds.** I formed the scores first. Only then did I read `Y6-critic.md` and `Y6-critic-r2.md`. Every
  round-1 and round-2 defect on my sampled steps is resolved:
  - B9.S7 is partial, with the 33% bug and pct_one_step.
  - B7.S4 is partial, with expr_two_letters.
  - B13.S1 no longer has coordinate_graph as direct.
  - B2.S15 has its pre grounded in W11, plus mult_three.
  - B6.S6 is a gap.
  - B5.S1 has estimate_length {forms:[0]} and pre from W21.
  - B2.S6 names the size clause and has mult_three.
  - B2.S1, B2.S4 and B10.S2 are fixed.

Scores are 0–10 on (a) direct skills, (b) honest verdict, (c) pre and related, and (d) proposals. Each step gets
one overall score.

## Scores

| Step | Score | Weakest | Defects |
|---|---|---|---|
| Y6.B1.S3 Read and write numbers to 10,000,000 | 7.5 | d | The partial `pv_digit_drag` has no `opts`, yet its note and `missing` both rest on the words source. It should carry `{"source":"word"}`. `big_numbers` and `vis_pv_bands_millions` both claim the same 9,999,999 band on `number_word_names` and `compare`, so that build is listed twice. `vis_pv_bands_millions.teaches` is a copy of its representation, not what the pupil learns. Verdict and pre are sound: number_word_names never goes past 999,999 at range 10M (verified). |
| Y6.B1.S8 Negative numbers | 8 | c | Partial is honest. negative_count is sound (thermometer cell, difference across 0). Two pre whys overclaim. `patterns:count_by_step_down` never reaches 0 (sampled 29→26, 74, 167→131), so it is Y1 "count backwards", not "Count through zero". `measurement:temperature` scales never go below 0 °C. Say so in the whys. The real nearest prior is the preBuild `negative_count`. |
| Y6.B2.S1 Add and subtract integers | 8.5 | d | Sound. big_numbers reuse is right. |
| Y6.B2.S4 Rules of divisibility | 8.5 | – | Sound. Verified: the divisors are 2–12 and 25 never appears. Pre is grounded in W10. |
| Y6.B2.S6 Square and cube numbers | 8.5 | – | Sound. exponents_simple {step:[0]} deals 54², 24³ and 21³ (verified), and the missing clause names it. square_cube is a good B&W cell. |
| Y6.B2.S7 Multiply 4-digit by 2-digit | 7 | b/d | (1) The `mult_placeholder_zero` missing clause is wrong. At Max Number 100 and 10,000 it always deals a 2-digit × 2-digit item (65 × 13, 84 × 42). Its answer is only the placeholder digit (ans 0), so the pupil never completes a product. It is not "top number at most 3 digits". (2) The reused `long_mult` bundles long multiplication, 4-digit short division and "efficient division" under the id `long_multiplication_4x2`. The name contradicts the content, and it breaks one-new-thing-per-step. Split it, or keep this step's part as its own option. (3) The W03 list names Y5 "Multiply a 3-digit / 4-digit number by a 2-digit number" (gaps). Pre does not cite them or list `long_mult` as preBuild. |
| Y6.B3.S3 Compare and order (denominator) | 8.5 | – | Full verified: compare_frac_lcd shows an LCD frame, and order_fractions orders 3–6 unlike fractions. |
| Y6.B3.S6 Add and subtract any two fractions | 8.5 | – | Full verified: non-multiple denominators (2/5 + 5/6) and answers above 1. |
| Y6.B4.S7 Fraction of an amount – find the whole | 7.5 | d | (1) The partial `fraction_of_set_hard_nv` has no `opts`, though only `forms:[1]` ("Find the whole") teaches the step (verified "3/6 of a number is 18"). Add `{"forms":[1]}`. (2) `frac_find_whole` puts a bar model on a "(No Visuals)" skill, which contradicts its name. Make it a find-the-whole form of `fractions:fraction_of_set_hard` (Visual), or an option on `algebra:tape_diagram`. (3) The W18 "Y5 Find the whole" lesson is not cited in pre. |
| Y6.B5.S1 Metric measures | 7 | a | `mass_volume_liquid` is direct with `opts {}`. The step's own note documents that every "mass in kg" scale item has answer 0. I confirmed it: "Read the scale. What is the mass in kg? → 0", an empty dial. A full verdict must not rest on a form that marks pupils wrong. Give it `{"forms":[0,2]}` (cylinder and sort) until the bug is fixed, or move it to partial. Pre `reading_ruler` reads inches, so it is a weak stand-in for the W21 "Measure length in cm" lesson. |
| Y6.B5.S2 Convert metric measures | 8.5 | – | Honest partial, verified: capacity deals 0.5 and 1.5 L, while length_metric and unit_conversions deal whole amounts. metric_decimal_convert is a good cell. |
| Y6.B5.S4 Miles and kilometres | 8.5 | – | Sound. Gap, with a double-number-line cell. |
| Y6.B5.S5 Imperial measures | 7.5 | a/d | The step is imperial, but the partials `unit_conversions` and `capacity` carry no `opts`. By default they also deal metric. Set `unit_conversions {"units":[1]}` and `capacity {"units":[0]}`. `metric_imperial.representation` gives "1 foot = 12 inches" as its fact box, which is within the system, not imperial ↔ metric. Its `teaches` drops the stone that `missing` names. |
| Y6.B6.S1 Add or multiply | 8 | – | Sound. add_or_mult is a good table cell. |
| Y6.B6.S6 Use scale factors | 8 | d | Gap is right. The reused `scale` spans S5–S7; options must split drawing, factor and similar. |
| Y6.B6.S7 Similar shapes | 8 | – | Sound. |
| Y6.B6.S10 Recipes | 8 | – | Honest partial. ratio_tables does one pair per table (verified). |
| Y6.B7.S3 Form expressions | 7.5 | c | Pre leads with `function_table_hard` as "Y6.B7.S2 previous step". In the school order, Form expressions is W11 and 2-step function machines is W12, so that skill is taught after this step. Lead with the W11 list instead (missing numbers, bar model, build_expr). The `missing` text "no algebraic convention (3n)" is partly false. The click form deals "twice a number n → 2n" as a correct answer and "3n" as a distractor, so the convention is recognised but never produced. Reword it to "never written by the pupil". |
| Y6.B9.S5 Equivalent FDP | 8.5 | – | Honest partial. Pools verified (f_to_d 1/2, 1/4, 7/10, 1/100; p_to_f 10/25/50%). |
| Y6.B9.S8 Percentage – multi-step | 8 | – | Sound. |
| Y6.B10.S2 Area and perimeter | 8 | – | Sound. composite_shapes {forms:[1]} measures one shape (verified). |
| Y6.B10.S3 Area of a triangle – counting squares | 8.5 | – | Sound. area_triangle_grid and the area_estimate preBuild are right. |
| Y6.B10.S6 Area of a parallelogram | 8 | c | Pre whys cite "prior learning wk W23/W25". This step's list is on W24 (Y3 Parallel and perpendicular, Y4 Quadrilaterals, Y4 Count squares), which is what the pre uses. Fix the citation. |
| Y6.B10.S7 Volume – counting cubes | 8.5 | – | Sound. |
| Y6.B11.S1 Line graphs | 8 | – | Sound. Pre is short (3), but it is the W30 list. |
| Y6.B11.S2 Dual bar charts | 8.5 | – | Sound. |
| Y6.B12.S5 Angles in a triangle – special cases | 7.5 | c | Pre `identify_lines` (parallel/perpendicular) is not a prerequisite for using equal base angles or a right angle. Use `angles_lines:identify_angles` (right angle = 90°) instead. The nearest prior (S4, 180°) is correctly the preBuild `angle_rules`. The classify_triangles partial is generous but defensible. |
| Y6.B12.S10 Draw shapes accurately | 8.5 | – | Sound. The draw_angles preBuild is right. |
| Y6.B9.S7 (re-check) | 8.5 | – | Fixed. 33% of 60 = 20 confirmed as a bug and recorded. pct_one_step is a good option. |
| Y6.B7.S4 (re-check) | 8.5 | – | Fixed. One varName per item confirmed (gen-algebraic.js:4809, :4940). expr_two_letters is good. |
| Y6.B13.S1 (re-check) | 8.5 | – | Fixed. coordinate_graph moved to related and the remove tagFix added. |
| Y6.B2.S15 (re-check) | 8 | a | Fixed pre. Not noted: `three_ops_no_paren` at Max 100 can deal a negative answer (16 + 8 × 2 − 42 = −10, 1 in 40), which is beyond G5. Name it in the note next to the Max Number advice. |

**Mean: 259 / 32 = 8.09.** **Minimum: 7** (Y6.B2.S7, Y6.B5.S1). No step is below 6.

**tagFixes:** all 32 sampled steps equal the diff against the live `SKILL_WRM`. **Format:** conforms to the brief.

## Required fixes
- **Y6.B2.S7**
  - Change the `mult_placeholder_zero` `missing` to: "always 2-digit × 2-digit at any Max Number; the pupil writes only the placeholder 0, never the product".
  - Split `long_mult` so that this step's id teaches long multiplication only (4-digit × 2-digit). Move short division and "efficient division" to their own option or id.
  - Cite the W03 lessons "Y5 Multiply a 3-digit / 4-digit number by a 2-digit number" in pre, and add `long_mult` to `preBuild`.
- **Y6.B5.S1**
  - Set `mass_volume_liquid` `opts` to `{"forms":[0,2]}` (drop the broken kg scale). Or move it to `partial` with missing "the kg scale items are broken (answer 0)".
  - Keep the generator bug in the note for the lead.
- **Y6.B4.S7**
  - Add `"opts":{"forms":[1]}` to the partial `fraction_of_set_hard_nv`.
  - Re-target `frac_find_whole` to `fractions:fraction_of_set_hard` (Visual) or `algebra:tape_diagram`, not a No-Visuals skill.
  - Cite the W18 "Y5 Find the whole" lesson in pre.
- **Y6.B5.S5**
  - Set `unit_conversions` to `"opts":{"units":[1]}` and `capacity` to `"opts":{"units":[0]}`.
  - In the `metric_imperial` representation, use a cross-system fact (1 inch ≈ 2.5 cm, 1 kg ≈ 2.2 lb), and add stone to `teaches`.
- **Y6.B1.S3**
  - Add `"opts":{"source":"word"}` to the partial `pv_digit_drag`.
  - Remove the duplicate 9,999,999 band on `number_word_names` and `compare` from one of `big_numbers` / `vis_pv_bands_millions`.
  - Give `vis_pv_bands_millions` a real `teaches`.
- **Y6.B7.S3**
  - Re-order pre to the W11 list first (`algebra:tape_diagram`, `algebra:build_expr_*`, `subtraction:missing_add_sub`). Move `function_table_hard` down, or to related (it is taught in W12).
  - Change `missing` to "algebraic notation (3n) is recognised in the click form but never written".
- **Y6.B12.S5**: replace pre `angles_lines:identify_lines` with `angles_lines:identify_angles` (right angle).
- **Y6.B1.S8**: correct the whys for pre `count_by_step_down` (counts down, never through 0) and `temperature` (scales never go below 0 °C).
- **Y6.B10.S6**: change the pre citations "wk W23/W25" to "wk W24".
- **Y6.B2.S15**: in the note, name the negative answers `three_ops_no_paren` can deal at Max 100 (−10).

OVERALL: 8.09/10 — PASS

---
## Lead follow-up after this PASS (round 3)
Applied after the grade: B5.S1 `mass_volume_liquid` opts `{forms:[0,2]}` + bug note; B5.S5 partial opts
(`unit_conversions {units:[1]}`, `capacity {units:[0]}`), `metric_imperial` fact box now 1 inch ≈ 2.5 cm and
stone added; B1.S3 `pv_digit_drag {source:'word'}`; B1.S8 pre whys corrected; B12.S5 pre `identify_lines` →
`identify_angles`; B10.S6 pre cites W24; B2.S15 negative-answer caution; B7.S3 missing clause and pre order
(W11 list first); B4.S7 `{forms:[1]}`; B2.S7 `mult_placeholder_zero` missing clause. Left to the lead (they
change EXISTING proposals, which helper lanes do not own): split `long_mult` (multiplication vs division),
re-home `frac_find_whole` off the No-Visuals skill, de-duplicate the 9,999,999 band between `big_numbers` and
`vis_pv_bands_millions`. Earlier rounds: Y6-critic-r1.md (7.47 FAIL), Y6-critic-r2.md (7.50 FAIL).
