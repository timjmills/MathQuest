# Y6 WRM tagging: independent critic, round 2

Critic lane (Opus medium), fresh reader. I edited no repo file except this one. I formed every grade below before
opening `Y6-critic.md`, and read round 1 only at the end to check its fixes.

## Method
- **Spec.** `BRIEF.md`, the sections "For each step, decide", "Output" and "Quality". The work is
  `data/curriculum/links/Y6.json` and `Y6-report.md`.
- **Sample.** 28 steps drawn at random with seed 2027, plus 4 re-checks of round 1's lowest steps (B2.S4, B10.S2,
  B13.S4, B7.S2). That makes 32 steps, all graded.
- **Code checks.**
  - I loaded `data.js` `SKILLS` and `wrm.js` `SKILL_WRM` in node. Every key in the file (direct, partial, pre and
    related, all 114 steps) is live and not retired.
  - I recomputed the diff between the step lists and the live `SKILL_WRM` for all Y6 steps: 103 expected, 103 in
    `tagFixes`, none missing and none extra. **tagFixes are the exact diff.**
  - File format: 114 steps in block order, each with the 10 required keys. pre and related are ≤ 8 and never repeat
    a direct or partial skill. Every build and preBuild id resolves. No "full" step carries a build. Every
    `reused: true` id exists in `wrm.js` / `build-list.js` / `build-specs.js`; the three `reused: false` ids do not.
    **Format conforms.**
  - I sampled items through `window.generateQuestionFor` in the harness browser (seed 900+i). I read
    `skill-options.js` for every option the file cites (`forms`, `units`, `ftRules`/`ftTask`, bands), and read the
    generators for `area_triangle`, `f_to_p`/`f_to_d`, `evaluate_expression*`, the coordinate graphs and the
    percent pool.
  - I read the school sheet "Grade 5" (col 0 week, col 6 lesson, col 14 prior list) for every sampled step's week.
- **Scoring.** Each step is scored 0–10 on (a) direct skills, (b) honest verdict, (c) pre/related, (d) proposals.
  The overall is my judgement, capped by the weakest criterion when that one is a substantive error.

## Grades

| Step | Score | Weakest | Defects |
|---|---|---|---|
| Y6.B1.S2 Numbers to 10,000,000 | 8 | – | Sound. Bands verified: `_PV_PLACE_BANDS` and `pv_digit_drag` stop at 999,999. At range 10M the skills dealt 5-digit and 3-digit numbers. The `big_numbers` / `vis_pv_bands_millions` split is stated. |
| Y6.B2.S1 Add and subtract integers | 8 | – | Sound. `add_1m_mixed` at range 10M still deals ≤ 6 digits. |
| Y6.B2.S2 Common factors | 8 | – | `forms:[1]` verified ("Click ALL common factors of 24 and 36"). Pre is grounded in W09. |
| Y6.B2.S3 Common multiples | 8 | – | `lcm forms:[1]` verified. Pre is grounded in W10. |
| Y6.B2.S6 Square and cube numbers | 8 | a | Partial is right. `missing` omits size: `exponents_simple` deals 45², 15³, 19³, far beyond Y6 (squares to 12², cubes to 5³). It needs its band set or the clause named. The W33 prior "Y4 Multiply three numbers" has an existing proposal `mult_three` that is not used. |
| Y6.B2.S15 Order of operations | 6 | c | Direct is right. Pre is 2 items and ungrounded. `oop_easy` ("Two Ops, No Parens") is the same content as direct `two_ops_no_paren`, so it is a duplicate, not a prerequisite. The W11 prior list (Y5 Multi-step +/−, Y5 Find missing numbers, Y3 Inverse operations, Y4 Multiply three numbers, Y4 Related facts) is not used. |
| Y6.B2.S16 Mental calculations and estimation | 8 | d | Sound and grounded in W10. The `mental_estimate` representation covers the reasonableness tick but not "choose a mental method", which `teaches` claims. |
| Y6.B3.S8 Subtract mixed numbers | 9 | – | Verified: about a third of `sub_mixed_unlike` items and most `_nv` items need a whole exchanged. Pre is grounded in W16. |
| Y6.B4.S2 Multiply fractions by fractions | 9 | – | Sound. Uses the frac-model cell. Pre is grounded in W17. |
| Y6.B4.S3 Divide a fraction by an integer | 8 | – | Partial verified (unit fractions only). `frac_div_int_any` correctly spans S3/S4. Untrimmed `div_unit_fraction` also deals whole ÷ unit fraction (4 ÷ 1/4); the note acknowledges this. |
| Y6.B4.S5 Mixed questions with fractions | 6 | b/d | The analysis is muddled. The step's intent (vocab: perimeter, area, share equally) is choosing operations in context. `mixed_fraction_ops` already deals contextual + − × ÷ items ("garden 1/3 by 1/2 yard: area?", "3 servings of 3/5 L"), yet `frac_word_mixed` is marked partial for being "stories only". The new `mixed_frac_qs` representation prints "the operation sign large so the pupil sees which one it is", which contradicts "choosing the operation" and the existing spec (O3 "operation sign boxed → none", a fading hint). |
| Y6.B5.S1 Metric measures | 7 | a/c | `estimate_length {}` deals customary items on a metric step (sort by in/ft/yd/mi). It needs `forms:[0]` ("About how long?", cm/m answers) or partial. Pre has 2 items although the W21 list is rich (Y3 equivalent masses and capacities). `capacity {units:[1]}` is direct here, so the decimal mL↔L facts it deals are already used. |
| Y6.B5.S3 Calculate with metric measures | 7 | d | Verdict and `metric_calc` are right. The preBuild `metric_decimal_convert` "why" is false: "every metric skill today deals whole amounts, larger unit to smaller". `capacity` units Metric deals 250 mL = 0.25 L and 0.5 L = 500 mL, and `unit_conversions` deals 2000 mL → L. `capacity` (metric) is a true pre-skill but is listed as related. |
| Y6.B5.S4 Miles and kilometres | 8 | – | Gap is verified (no generator uses miles↔km). The B&W double-line cell is good. preBuild `metric_imperial` is grounded in the W22 list. `missing` says "read a conversion graph" but the proposal has none (a small inconsistency). |
| Y6.B6.S6 Use scale factors | 7 | b | `mult_scaling` ("is 7/5 × 6 greater than 6?") teaches none of the step: no enlarging, no finding a scale factor. Keeping it as a partial cover inflates the verdict; it is a gap with `mult_scaling` as related. `scale` (reused) is right. |
| Y6.B7.S4 Substitution | 6 | b | "Full" with a self-admitted hole. The note says two-letter expressions are "rare"; in fact `evaluate_expression` and `evaluate_expression_hard` pick one `varName` and never deal two letters. WRM Substitution includes a + 2b with a = 5, b = 3. The existing `formulae` proposal (wrm.js, letters substituted into p = 2(l + w)) could close it but is not used. |
| Y6.B9.S2 Fractions as division | 8 | – | Verified: no decimal is carried. `f_to_d` has only tenths, hundredths and quarters, no 3/8. `f_to_d_division` is right and B&W. |
| Y6.B9.S4 Fractions to percentages | 7 | b | "Full" is generous. `f_to_p` draws only from denominators 2, 4, 5, 10, 20 and 100. There are no 25ths or 50ths (7/25, 9/50), no fraction that must be simplified first (9/12, 12/40), and no eighths through the division route that S2 just taught (3/8 = 37.5%). |
| Y6.B9.S6 Order FDP | 8 | – | Sound. Mixed F/D/P lists of 3–6 items verified. |
| Y6.B9.S7 Percentage of an amount – one step | **5** | b/d | **Dishonest full.** 40 items with `forms:[0]` dealt 10/15/20/25/33/40/50/60/75%. 1% never appears. 15, 20, 40, 60 and 75% are the next step's multi-step percents. The 33% items have **wrong answers**: "33% of 60 = 20" and "33% of 30 = 10" (`gen-fractions.js:6904`, 33% treated as 1/3). There is no option to restrict the percents. The note's advice ("set the max to 100") does not control them. There is no proposal. |
| Y6.B9.S9 Percentages – missing values | 8 | d | Sound. The reused `percent_multi` representation shows only a two-step story; the missing-percentage item it must also close (12 of 40 = __%) is not drawn. |
| Y6.B10.S1 Shapes – same area | 7 | a/b | `area_perimeter` (one rectangle, P and A) is a thin partial for "same area". WRM S1 counts squares to find or draw rectilinear shapes of equal area. `area_unit_squares` (here a pre) is closer. `missing` leans on the perimeter comparison, which is S2's clause. |
| Y6.B10.S4 Area of a right-angled triangle | 8 | – | Verified: right-angled only, with the formula given in the hint. The partial reasoning (no half-rectangle) is acceptable. Pre is grounded in W23. |
| Y6.B12.S4 Angles in a triangle | 7 | c | Gap verified (no generator sums triangle angles). Related `classify_quads` "next: angles in quadrilaterals" is false: it classifies and never deals angle sums. |
| Y6.B12.S6 … missing angles | 7 | c | Pre is a verbatim copy of S4's. The nearest prerequisite (S4/S5, angles in a triangle) has no skill, so `angle_rules` belongs in `preBuild`. |
| Y6.B12.S7 Angles in quadrilaterals | 7 | c | Related `classify_triangles` "a quadrilateral is two triangles" misdescribes a classify skill. The 180° prerequisite (S4) has no skill, so `preBuild` `angle_rules` is missing. |
| Y6.B12.S9 Circles | 8 | – | Gap verified (no radius/diameter anywhere in gen-*). Pre is grounded in W29. The proposal is B&W and fits. |
| Y6.B13.S1 The first quadrant | 6 | a | **Mis-tag kept.** `coordinate_graph` picks `quadrant1` / `all_quadrants` at random (gen-geometry.js:3377). 6 of 12 sampled items had negative coordinates, and no option restricts it to Q1. It must leave direct (remove; keep as related). Pre is 2 items. `integers:number_line_int` without `forms:[0]` deals negatives, which is irrelevant here. The W13 list (Y4 Describe position, Y5 Problem solving with coordinates) is not used. |
| Y6.B2.S4 Rules of divisibility (re-check) | 8 | c | Round-1 fix applied: `missing` and `divisibility_rules` are re-scoped. Pre omits Y2 odd/even and Y3 multiples of 5 and 10 (the ÷2 / ÷5 rules) from W10. |
| Y6.B10.S2 Area and perimeter (re-check) | 8 | – | Round-1 fix applied: partial, `same_area`, and the composite_shapes add. |
| Y6.B13.S4 Translations (re-check) | 8 | d | Round-1 fix applied. `vis_migrate_coordinates` and `translate_grid` now both promise four-quadrant draw-and-describe translations, which is double-booked. The report's own owner answer says one build. |
| Y6.B7.S2 2-step function machines (re-check) | 9 | – | Round-1 fix applied. Verified: `_FT_RULES` has × / ÷ first only, and the opts are valid. |

**Mean: 240 / 32 = 7.50.** **Minimum: 5** (Y6.B9.S7). Steps at 6: B2.S15, B4.S5, B7.S4, B13.S1.

## Round-1 fixes
I checked every round-1 fix and all of them are applied:
- `nl_millions` deleted, `nl_20` reused.
- B2.S1 is partial.
- B2.S4 is re-scoped.
- B2.S13: `div_word_problems` tagFix added.
- B4.S1: preBuild removed.
- B7.S2 is partial with valid opts.
- B10.S2 is partial.
- B10.S4 and B10.S5 have their partial tagFixes.
- B13.S4: `vis_migrate_coordinates` added, `coordinate_all` is the first pre.
- `tagFixes` are now the exact diff.

## Required fixes (step → exact change)
- **Y6.B9.S7**
  - Verdict → `partial`. Move `conversions:percent_of_number` to partial with `missing`: "one-step percentages
    (50%, 25%, 10%, 1%) on their own page; the pool mixes 15–75% multi-step percents, never deals 1%, and its 33%
    items have wrong answers".
  - Add tagFix `{key: "conversions:percent_of_number", step: "Y6.B9.S7", action: "partial"}`.
  - Build: a new option `pct_one_step` on `conversions:percent_of_number`: a set option "Percents" with values 50,
    25, 10, 1 (default these four for this step); a one-step cell "10% of 60 = 60 ÷ 10 = [ ]" with a 100% bar frame.
    Alternatively, widen the reused `percent_multi` to a percent-set option and add Y6.B9.S7 to its steps.
  - Flag to the lead (not a tagging fix): `gen-fractions.js:6904` gives `{pct:33, base:30, ans:10}` and its
    siblings. Remove these items or relabel them as 1/3.
- **Y6.B7.S4**
  - Verdict → `partial`. `missing`: "substituting two values into an expression with two letters (a + 2b, a = 5,
    b = 3); both skills use one letter only".
  - Build: reuse `formulae` (add Y6.B7.S4 to its steps), or an option on `algebra:evaluate_expression_hard` "two
    letters".
  - Rewrite the note (two-letter items are absent, not rare).
  - Add tagFixes `partial` for both skills.
- **Y6.B13.S1**
  - Remove `coordinates:coordinate_graph` from direct and add it to related ("mixes quadrant I with all four
    quadrants").
  - Add tagFix `{key: "coordinates:coordinate_graph", step: "Y6.B13.S1", action: "remove"}`.
  - Pre: give `integers:number_line_int` `opts {forms:[0]}` (positive), or replace it with a positive number-line
    reading skill. Add `coordinates:coord_distance_q1` or `coord_polygon` only if not related. Cite the W13 list (Y4
    Plot coordinates / Y5 Read and plot coordinates).
- **Y6.B2.S15**
  - Pre: drop `oop_easy` (it duplicates direct `two_ops_no_paren`).
  - Ground pre in W11: `algebra:multi_step_word` (Y5 Multi-step +/−), `number_ops_mixed:missing_factor_or_addend`
    (Y5 Find missing numbers), `subtraction:sub_check_by_adding` (Y3 Inverse operations),
    `multiplication:mult_div_fact_family` (Y4 Related facts).
  - preBuild `mult_three` (Y4 Multiply three numbers, existing proposal).
- **Y6.B4.S5**
  - Re-scope `missing` to the WRM intent: "a mixed page of fraction problems in context (perimeter, area, sharing)
    where the pupil chooses +, −, × or ÷ by an integer; `mixed_fraction_ops` deals such items only inside a random
    pool that also holds missing-numerator and single-operation calculation items".
  - Change `frac_word_mixed` `missing` (stories are the step, not the gap).
  - `mixed_frac_qs` representation: the operation sign is a fading hint (boxed on early pages, absent later), per
    the existing build-spec O3. Never "printed large so the pupil sees which one it is".
- **Y6.B9.S4**
  - Verdict → `partial`. `missing`: "denominators 25 and 50, fractions to simplify first (9/12, 12/40), and eighths
    by division (3/8 = 37.5%); f_to_p deals only halves, quarters, fifths, tenths, twentieths and hundredths".
  - Build: an option on `conversions:f_to_p` (denominator set + "simplify first"), plus `f_to_d_division` for the
    division route.
  - tagFix `partial`.
- **Y6.B6.S6**
  - Verdict → `gap`. Move `fraction_operations:mult_scaling` to related ("compares a product with a factor").
  - Add tagFix `remove` for its live partial tag.
- **Y6.B5.S1**
  - `measurement:estimate_length` opts → `{forms:[0]}` (or partial "the sort form deals inches/feet/yards/miles").
  - Pre: move `measurement:unit_conversion_word` from related to pre (Y5 Convert units of length, W21), add `algebra:multi_step_word`
    (Y5 Multi-step +/− problems, W21), and cite the W21 lessons on the two pre already listed.
- **Y6.B5.S3**
  - Correct the `metric_decimal_convert` "why" to what is actually missing: "length and mass conversions with
    decimal amounts (3.4 km = □ m, 650 g = □ kg); capacity already deals 0.25 L ↔ 250 mL".
  - Move `measurement:capacity` (units Metric) from related to pre.
- **Y6.B10.S1**: `missing` → "finding and drawing rectilinear shapes with the same area by counting squares";
  keep `area_perimeter` partial only with that clause, or demote it to related and make `area_unit_squares` the
  partial.
- **Y6.B12.S4**: replace related `classify_quads` (its why is false) with `angles_lines:mixed_angles_lines` or
  `algebra:solve_eq_addsub`. Do not claim angle sums.
- **Y6.B12.S6**: add `preBuild: ["angle_rules"]` (S4 has no skill). Make pre differ from S4: nearest first
  "Y6.B12.S4 Angles in a triangle (no skill: angle_rules)", then `additive_angles`.
- **Y6.B12.S7**: add `preBuild: ["angle_rules"]` (triangle sum, S4). Rewrite the `classify_triangles` related why
  (it does not teach angle sums).
- **Y6.B2.S6**: add to `missing` "and numbers at Y6 size (`exponents_simple` deals 45², 19³; set its band)". Add
  preBuild `mult_three` (W33 Y4 Multiply three numbers).
- **Y6.B9.S9**: `percent_multi` representation: add the missing-percentage cell ("12 out of 40 = [ ] %", 100% bar
  frame).
- **Y6.B13.S4**: choose one build for the four-quadrant clause (as the report suggests). Keep
  `vis_migrate_coordinates` for Y6 and leave `translate_grid` as the first-quadrant preBuild only, or the reverse.
  Do not list both in `build`.
- **Y6.B2.S16**: `mental_estimate` representation: add the "choose the method" cell (a bank of 2–3 mental methods
  to tick), or drop "choosing mental methods" from `teaches`.

## Summary
The file format is clean and tagFixes are now an exact, mechanical diff. Round 1's defects are all resolved.
Content honesty still slips where a skill's name matches the step but its items do not:
- B9.S7: multi-step percents, no 1%, and wrong 33% answers.
- B7.S4: no two-letter substitution.
- B13.S1: `coordinate_graph` deals four quadrants.
- B6.S6: `mult_scaling` is not scale factors.
- B9.S4: a narrow denominator set.

One step is below 6, so the run fails on the minimum rule even though the mean is 7.5.

OVERALL: 7.50/10 — FAIL
