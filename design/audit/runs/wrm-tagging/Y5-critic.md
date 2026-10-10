# Critic 1: Wave 2 WRM tagging, Y5 (US Grade 4): data/curriculum/links/Y5.json

What I checked: 28 sampled steps, against BRIEF.md's Quality section and its per-step rules.
- Every direct and partial claim was checked by generating items with sample.mjs at the stated options. RANGE was 1e6, or 10–1000 where the skill is small. DEC was 0–3.
- Option ids were checked against skill-options.js.
- Existing tags were checked against SKILL_WRM in wrm.js.
- Prior learning was checked against y5prior.json.
- Proposals were checked against wrm.js WRM_PROPOSALS and build-list.js.

## Per-step scores (0–10)

| Step | Score | Reason |
|---|---|---|
| Y5.B1.S7 | 8.5 | The partial verdict is right. more_less_100 with step 1000 caps at 10,000 (checked). pv_more_less_big and vis_more_less_table are reused correctly. `pre` lists more_less_100 twice. |
| Y5.B2.S3 | 7.5 | The full verdict is right through sub_100k_regroup, sub_1m_regroup and sub_1m_mixed (5–6 digits, checked). But sub_across_zeros with band 10000 deals 3- and 4-digit items (400−155, 4,000−2,369), not "more than four digits". It is listed as direct and given an `add` tagFix. It is a pre-skill. |
| Y5.B2.S6 | 7 | The partial verdict is honest: multi_step_word stays under about 150 (checked). But the new proposal multi_step_big is a second number-size option on algebra:multi_step_word. That skill already has build-list `multi_step_four_ops`, whose ladder is "within 100 → 1,000". Extend that ladder to 1,000,000 and add Y5.B2.S6 to it instead. |
| Y5.B3.S10 | 6.5 | The partial skill is weak. divisibility_sort {step:[0]} mixes ÷2, ÷5 and ÷10, so only about a third of items are about 10 and none are about 100 or 1,000. mult_zeros {forms:[0,1]} (generates ×10 and ×100 multiples) is the closer partial and is not tagged. `pre` repeats number_theory:multiples. The reused mult_multiples contradicts itself (skill = mult_zeros, representation = number_theory:multiples) and this was not flagged. |
| Y5.B4.S3 | 8.5 | select_equiv_frac, equivalent {forms:[1]} and equiv_frac_nv all recognise equivalence (checked). The pre list is sensible, with the previous step first. |
| Y5.B4.S7 | 8.5 | order_fractions orders fractions under 1 with unlike denominators (checked). The previous-step pre-skills come first. The add/subtract pre-skills taken from the xlsx list are weak but allowed. |
| Y5.B4.S14 | 6 | The verdict is "full", but the step's own note says WRM includes subtracting from a whole or an improper fraction, and no tagged skill deals that. The samples were 3/4−1/2, 2/3−1/3 and 9/9−1/9, all within 1. This should be partial, with that clause and a build. |
| Y5.B5.S2 | 9 | area_model_mult_hard {tiles:22} gives exactly 2×2 area models (checked). Good pre-skills. |
| Y5.B5.S4 | 7 | The partial verdict is honest. The area model {tiles:23} gives 3×2 (checked), and long_mult is reused. But the "previous step Y5.B5.S3" pre is multiplication:multiply, which is not B5.S3's skill; mult_placeholder_zero is. multiply appears twice in `pre`. The tagFix says "upgrade the partial tag", but the existing tag is already full. |
| Y5.B5.S9 | 7.5 | divide {tiles:41, regroup:'always'} and box_division_hard are correct (checked). div_remainders is a Y3-level item (23 ÷ 5, ring the groups) and is a pre-skill, not direct; it is also in `pre` twice. divide is in both direct and pre. |
| Y5.B6.S1 | 7 | The partial verdict and the mult_unit_frac_int option are good and fit the design. But `pre` is not nearest-first: sub_mixed_like and add_mixed_like come before add_fractions_like and repeated_add_to_mult. Also no tagFix demotes the existing full tag `mult_frac_whole {step:'Y5.B6.S1', note:'unit fractions'}`. |
| Y5.B7.S1 | 8 | Honest partials (checked: the number line is tenths only, and d_to_f has no chart). decimal_pv and decimal_whole are reused well. |
| Y5.B7.S7 | 7 | The gap verdict and the thousandths_pv reuse are right. The pre list is padded from the W13 list (make_ten, add_1k_regroup, add_10k_regroup), which does not help with a thousandths chart. It is missing the whole-number place-value chart (placevalue:pv_digit_drag / value) and the B7.S5/S6 skills. |
| Y5.B7.S8 | 6 | The verdict is "full", but order_decimals at 2 dp mixes 1 and 2 dp (6.88, 7.7, 8.5; checked) and the step's own note admits it. compare_decimal pairs usually differ in the whole part (6.88 vs 0.43), so the decimal digits are never compared. This should be partial: "same number of decimal places, same whole part" control. |
| Y5.B7.S9 | 8.5 | compare_thousandths (0.340 vs 0.34) and order_decimals at 3 dp (mixed dp) are a genuine fit (checked). |
| Y5.B8.S2 | 7 | The partial verdict is honest and missing_lengths is reused. But no tagFix demotes the existing full tag `composite_shapes {step:'Y5.B8.S2', note:'perimeter'}`. `preBuild` lists missing_lengths, which is this step's own build, so it is circular. `pre` is thin. |
| Y5.B8.S5 | 7.5 | area_polygon_decompose is right (checked). composite_shapes opts `{"composite_shapes":["dual_pa"]}` is not a real option key: with it the page deals perimeter-only items (checked). The real setting is `{"forms":[1]}`, which gives P+A dual items (checked). |
| Y5.B9.S5 | 8.5 | The gap verdict is right, timetables is reused, the time pre-skills are good, table_data is in preBuild, and the note honestly explains the week mismatch. |
| Y5.B10.S9 | 8 | The gap verdict is defensible because regular/irregular is the core. But shapes_early:name_2d_shapes does name pentagons and hexagons (checked), so it could be a partial for the naming clause. |
| Y5.B11.S3 | 7 | The partial for geo_translate (multiple choice only, checked) is right. But reused translate_grid (a new skill) overlaps build-list `vis_migrate_coordinates`, which already moves geo_translate onto coord-grid "with the image drawn and the move described". That overlap was not flagged. `pre` is thin: it misses coord_polygon (W27 "Draw 2-D shapes on a grid") and position language. |
| Y5.B12.S3 | 7 | The partial verdict is honest. But the build decimal_models adds models and has no "across 1" item control, so the named missing clause is not closed. decimal_whole (Y5.B12.S2 Complements to 1, the step before) is missing from pre/preBuild. |
| Y5.B12.S5 | 6.5 | sub_decimal sits in `direct` while the verdict is partial. It belongs in `partial` with its missing clause (at 2 dp: 43.53 − 41.4, checked). No tagFix demotes the existing full tag. `pre` lacks whole-number column subtraction with exchange (sub_10k_regroup). |
| Y5.B12.S7 | 7 | The partial verdict and the dec_dp_match reuse are good. No tagFix demotes the existing full tag `sub_decimal {step:'Y5.B12.S7', note:'different decimal places'}`. `pre` misses sub_across_zeros (5 − 1.23 is an exchange across zeros) and sub_decimal (B12.S5). |
| Y5.B12.S12 | 6 | The gap verdict and the dec_missing reuse are right, since place_value_10x has no unknown option (checked). But 4 of the 7 pre-skills are bar graphs, measurement:mass_volume_liquid and area_unit_squares, copied from the unrelated W36 enrichment list. Missing: place_value_10x {decimals:true}, division:missing_mult_div, multiplication:mult_zeros. |
| Y5.B13.S4 | 8.5 | compare_int and order_negatives are right (checked). negative_count is in preBuild. Minor: measurement:temperature (W38 prior) is not used. |
| Y5.B14.S2 | 7 | The partial verdicts and builds are reasonable. No tagFix for length_metric (existing full tag, note 'mm'). The capacity tagFix says "existing partial tag confirmed", but it is full (note 'mL'). Neither partial uses the existing option that removes customary units (capacity `units`). The reading_ruler pre is labelled "Measure in millimetres", but the skill reads inches only (as ruler_cm says). |
| Y5.B14.S3 | 7.5 | The partial verdict is honest. unit_conversions is tagged direct with `{}`: the default deals quarts, ounces and feet (checked). It needs `{"units":[0]}`, and even then it mixes in g and L, so it is better as a partial than a direct. |
| Y5.B15.S4 | 8 | Honest. capacity_estimate is a sensible new option, and the overlap with volume_cubes is flagged to the lead. `pre` is thin: estimate_length is not used as a pre-skill. |

**Mean: 208 / 28 = 7.43 → FAIL (8 or more needed).**
Steps under 8: 17 of 28. Steps under 7: 5 (B3.S10, B4.S14, B7.S8, B12.S5, B12.S12).

## Concrete defects (step, field: what is wrong, what it should be)

1. **Y5.B2.S3, direct + tagFixes:** sub_across_zeros {band:10000} deals ≤ 4-digit items. Move it to `pre` and drop the `add` tagFix.
2. **Y5.B2.S6, build:** multi_step_big duplicates the existing build-list option `multi_step_four_ops` on the same skill. Reuse multi_step_four_ops: add Y5.B2.S6 and extend its band ladder to 1,000,000. If the bar is needed, keep vis_bar_family.
3. **Y5.B3.S10, partial:**
   - Add multiplication:mult_zeros {forms:[0,1]} as a partial, missing "×1,000 and recognising multiples of 100/1,000".
   - Keep divisibility_sort as related or pre, not partial.
   - Remove the duplicate number_theory:multiples from `pre`.
   - mult_multiples: make the skill and the representation agree (one host skill), and tell the lead.
4. **Y5.B4.S14, verdict:** `full` → `partial`, missing "subtracting from a whole or an improper fraction with related denominators (2 − 3/4, 7/4 − 1/2)". Add a build: an option on sub_frac_unlike for whole/improper minuends, or reuse an existing B4.S15/S16 proposal if one fits.
5. **Y5.B5.S4, pre:** the previous-step skill should be multiplication:mult_placeholder_zero {tiles:22}, not multiply. Remove the duplicate multiply. **tagFixes:** the area_model_mult_hard "upgrade the partial tag" note is wrong; the tag already exists, so the fix is a no-op.
6. **Y5.B5.S9, direct:** move division:div_remainders to `pre` only, once. Remove division:divide from `pre`, since it is already direct.
7. **Y5.B6.S1:**
   - tagFixes: add `{key:'fraction_operations:mult_frac_whole', step:'Y5.B6.S1', action:'partial'}`.
   - pre: reorder so add_fractions_like and repeated_add_to_mult come before sub_mixed_like and add_mixed_like.
8. **Y5.B7.S7, pre:** replace make_ten, add_1k_regroup and add_10k_regroup with placevalue:pv_digit_drag / placevalue:value and the B7.S5/S6 skills (conversions:d_to_f, decimals:compare_thousandths).
9. **Y5.B7.S8, verdict:** `full` → `partial`, missing "a page where every number has the same number of decimal places and the same whole part". Add a build: reuse or extend dec_dp_match to compare_decimal and order_decimals, or a new "same dp" option.
10. **Y5.B8.S2:**
    - tagFixes: add `{key:'area_perimeter:composite_shapes', step:'Y5.B8.S2', action:'partial'}`.
    - preBuild: remove missing_lengths, which is the step's own build.
11. **Y5.B8.S5, direct opts:** composite_shapes `{"composite_shapes":["dual_pa"]}` → `{"forms":[1]}`.
    The same invalid variant-key pattern appears elsewhere in Y5.json, outside the sample: `area_perimeter:area {"area":[...]}` and `area_perimeter:perimeter {"perimeter":[...]}`. All three are variant-style options, whose setting key is `forms` with index values. Fix them file-wide.
12. **Y5.B10.S9, partial:** consider shapes_early:name_2d_shapes as a partial for "naming polygons", with the missing clause "regular vs irregular".
13. **Y5.B11.S3:**
    - build: note the overlap of translate_grid with vis_migrate_coordinates. The geo_translate upgrade there may close it without a new skill id; ask the lead.
    - pre: add coordinates:coord_polygon (W27) and shapes_early:shape_positions.
14. **Y5.B12.S3:**
    - build: decimal_models does not add an "across 1" control. Add that clause to the proposal, or name an across-1 option.
    - preBuild: add decimal_whole (Y5.B12.S2 Complements to 1).
15. **Y5.B12.S5:**
    - Move sub_decimal from `direct` to `partial`, missing "same dp at 2–3 dp".
    - tagFixes: add `{key:'decimals:sub_decimal', step:'Y5.B12.S5', action:'partial'}`.
    - pre: add subtraction:sub_10k_regroup.
16. **Y5.B12.S7:**
    - tagFixes: add `{key:'decimals:sub_decimal', step:'Y5.B12.S7', action:'partial'}`; the existing tag is full.
    - pre: add subtraction:sub_across_zeros and decimals:sub_decimal.
17. **Y5.B12.S12, pre:** remove graphs:bar_graph, graphs:build_bar_graph, measurement:bar_graph_intro, measurement:mass_volume_liquid and area_perimeter:area_unit_squares. Add placevalue:place_value_10x {decimals:true}, division:missing_mult_div and multiplication:mult_zeros.
18. **Y5.B14.S2:**
    - tagFixes: add `{key:'measurement:length_metric', step:'Y5.B14.S2', action:'partial'}`. Correct the capacity tagFix "why": the existing tag is full (note 'mL'), not partial.
    - partial: give capacity `{"units":[1]}` (metric).
    - pre: the reading_ruler label is wrong, since the skill reads inches only. Use measurement:length_metric {forms:[0]} (cm → mm) and keep ruler_cm in preBuild.
19. **Y5.B14.S3, direct:** unit_conversions needs `{"units":[0]}`. Even then it mixes mass and capacity in with length, so it belongs in `partial` with that clause.
20. **Systemic:**
    - **Pre-skills copied from an unrelated week:** when the week's prior-learning list does not fit the step (assessment, enrichment or mismatched week: B7.S7, B12.S12), the tagger still copies it. The brief asks for *useful* pre-skills for ELL/SPED pupils, nearest first. Prior-list entries that do not support the step should be dropped.
    - **Demoted tags without a tagFix:** several steps demote an existing full SKILL_WRM tag to partial with no tagFix (B6.S1, B8.S2, B12.S5, B12.S7, B14.S2). The lead merges only tagFixes, so these demotions would be lost. Sweep the whole file: every key in `partial` that is a full tag in wrm.js needs a `partial` tagFix.

## What is good
- Gap and partial verdicts mostly name a precise missing clause.
- Proposals are mostly reused (timetables, polygons, decimal_pv, thousandths_pv, dec_dp_match, missing_lengths, long_mult).
- New option proposals (mult_unit_frac_int, capacity_estimate, l_ml_convert) are described in our B&W boxed-cell grammar.
- Notes are honest about week mismatches.
- No invalid skill keys were found in the sample.

## Overall
Mean 7.43 / 10. **Verdict: FAIL.**
To pass, fix the two generous "full" verdicts (B4.S14, B7.S8), the missing demotion tagFixes, the invalid option keys (file-wide), and the unrelated pre-skill lists (B12.S12, B7.S7). With those fixed, the sample would land around 8.
# Critic round 2 — Y5 (US Grade 4) WRM tagging, data/curriculum/links/Y5.json

Method: read each sampled step's WRM title/CCSS/notes and its school prior-learning list, generated items for every
direct/partial skill with the stated options (sample.mjs, RANGE=1000000), read optionsFor for each, and checked
the sampled tagFixes against SKILL_WRM in js/modules/wrm.js. Proposal ids were checked against wrm.js /
build-list.js / build-specs.js for reuse.

## Per-step scores (0-10)

| Step | Score | Reason |
|---|---|---|
| Y5.B1.S1 Roman numerals to 1,000 | 8 | Honest gap; roman_1000 reuses the roman_100 entry; roman_12/roman_100 in preBuild. Pre-skills are thin stand-ins (expand, missing-number). |
| Y5.B1.S2 Numbers to 10,000 | 7 | Direct correct (sampled band 9999: disks, chart, unit form, expanded). But all 4 pre-skills are the 4 direct skills again with no lower-band opts, so the pre list adds nothing. |
| Y5.B1.S11 Compare/order to 1,000,000 | 7 | Direct correct (sampled 6-digit compare and order). Pre repeats direct compare and order_least_to_greatest without a lower band. |
| Y5.B1.S13 Round within 100,000 | 7 | Verdict full is right only with options the entry does not give: nearest_1000 is listed with opts {} and deals 4-digit numbers (default band 10,000). rounding_table {places:[10,100,1000,10000]} deals 5-digit numbers to every place but is put in pre/related, not direct. |
| Y5.B2.S1 Mental strategies | 8 | Honest partial (compensation is 2-digit, add_sub_100s whole hundreds). mental_add_sub reused; bonds_100 preBuild good. |
| Y5.B3.S5 Prime numbers | 8 | prime_composite sampled, all four forms, to about 100. Full is right. gcf_easy is a weak pre-skill. |
| Y5.B3.S9 Divide by 10, 100, 1,000 | 8 | place_value_10x op "/" with shift chart sampled, whole-number answers, matches the autumn lesson. No missing-number form, which is fine here. |
| Y5.B4.S1 Equivalent to a unit fraction | 9 | Honest partial, confirmed by sampling (2/4 = 6/__ appears). equiv_from_unit is new, specific and written as a B&W cell. Pre list is good. |
| Y5.B4.S5 Mixed to improper | 7 | improper_mixed has no direction option and deals improper to mixed as well (sampled 14/4 to 3 2/4). S4 and S5 have identical direct lists, so neither step can be printed on its own. "Full" needs a note or a direction-option proposal. Pre is thin (2 entries) and leaves out the previous step's idea (count in fractions past 1, number line). |
| Y5.B4.S9 Add/sub same denominator | 8 | Sampled: sums within and beyond 1. Full is fair. decompose_fractions appears in both pre and related. |
| Y5.B5.S2 2-digit × 2-digit (area model) | 9 | tiles 22 sampled as a 2 × 2 grid. Good pre chain. |
| Y5.B5.S9 Divide with remainders | 8 | divide tiles 41, regroup always, sampled 4-digit ÷ 1-digit R. The div_remainders remove fix is right. remainder_too_big (a 2-digit check task, to 119) belongs in related or pre, not direct. |
| Y5.B6.S3 Mixed number × integer | 7 | Gap verified: mult_frac_whole deals proper/improper fractions only. The reused proposal is thin ("a mixed-number band on mult_frac_whole", "closes the listed Y5 steps"), with no B&W cell shape. Related is 3 of 4 copies of pre. |
| Y5.B7.S12 Understand percentages | 8 | percent_visual sampled: hundred grid with % / fraction / count / click forms. Full is acceptable. |
| Y5.B7.S15 Equivalent FDP | 8 | f_to_p, d_to_p, order_fdp and f_to_d sampled. Fine. Pre and related share all three items. |
| Y5.B8.S5 Area of compound shapes | 7 | Direct correct. composite_shapes forms [1] also asks for the perimeter, which is acceptable. composite_shapes is listed as a direct skill and as a pre-skill, and addition:add is a weak pre-skill. |
| Y5.B8.S6 Estimate area | 8 | Correct gap; area_estimate reused. Related is thin. |
| Y5.B11.S2 Problem solving with coordinates | 8 | Honest partial (coord_polygon sampled: side lengths and perimeter only). coord_missing_vertex is new, concrete and B&W. Only 2 pre-skills. |
| Y5.B11.S5 Lines of symmetry | 7 | Direct correct (sampled). The pre list is the direct skill symmetry again, plus partition_shapes, and nothing else. |
| Y5.B12.S4 Add decimals, same dp | 7 | Partial confirmed (DEC=2 gives 43.53 + 41.4). Pre skips the block's own earlier steps (S1–S3 known facts, complements to 1, across 1, which are gaps) and has no preBuild (dec_known_facts / dec_across_one / decimal_pv). compare_decimal's related "why: column method" is wrong. |
| Y5.B12.S6 Add decimals, different dp | 8 | Honest partial; dec_dp_match describes the place-holder 0 as a fading grey hint. Good. |
| Y5.B12.S12 × ÷ decimals, missing values | 8 | Correct gap; dec_missing reused; pre has place_value_10x {decimals:true}. Dropping the off-topic W36 xlsx list is noted. |
| Y5.B13.S5 Find the difference | 8 | Honest partial. sub_int forms [1] on a number line (sampled 2 − (−6)) is close, so the partial entry should carry opts {forms:[1]}. negative_count reused. |
| Y5.B14.S3 Convert units of length | 7 | The partials are right (sampled: unit_conversions mixes g/L; length_metric goes larger to smaller only). But the stated missing clause, smaller to larger, is not clearly closed by km_m / mm_cm_m, whose specs name mixed units only. Related is 2 items, one of which repeats pre. |
| Y5.B14.S5 Convert units of time | 8 | unit_conversion_word units [0] sampled: hr to min/sec only. Honest; time_convert reused. |
| Y5.B14.S6 Calculate with timetables | 8 | Correct gap; timetables reused; time_convert in preBuild. |
| Y5.B15.S1 Cubic centimetres | 8 | Gap is defensible: area_perimeter:volume is l × w × h, not counting cm³ cubes. A note on volume band 12 as a later bridge would help. Related is thin. |
| Y5.B15.S4 Estimate capacity | 8 | Partial confirmed (capacity forms [1] is only "click containers larger than 1 litre"). capacity_estimate is new and B&W; the mass_scales preBuild fits. |

**Mean: 217 / 28 = 7.75 (pass is 8 or more): FAIL.** No step scored below 7. The fails come from pre/related usefulness and a few option slips, not from wrong verdicts. Verdicts are honest throughout the sample.

## Concrete defects (step, field: what is wrong → what it should be)

1. **Y5.B1.S13, direct:** nearest_1000 has opts {}, which deals 4-digit numbers → set opts {band:100000}. Add number_sense:rounding_table {places:[10,100,1000,10000]} as direct, since it rounds 5-digit numbers to 10/100/1,000/10,000, which is the WRM lesson. Optionally add nearest_100 / nearest_10 with {band:100000}. Fix the B1.S13 tagFix for nearest_1000 to carry the band.
2. **Y5.B1.S2, pre:** the 4 pre-skills equal the 4 direct skills with no opts → give them a lower band ({band:999}, the Y4 numbers to 1,000 steps), or use other skills (placevalue:value / identify at 999, more_less_100).
3. **Y5.B1.S11, pre:** compare and order_least_to_greatest repeat direct → give them {band:99999} (the previous step, B1.S10) or drop them; add placevalue:value {band:999999} as the "first differing place" pre-skill.
4. **Y5.B4.S5 (and S4), verdict/build:** improper_mixed and mixed_improper_visual cannot isolate one direction, so a page for this step also deals improper to mixed → either keep full with a note, or add an option proposal `direction: mixed→improper | improper→mixed` on improper_mixed. Pre: add the S4 idea (fractions:mixed_nl_drag, counting in fractions past 1) and fraction_operations:add_fractions_like (wholes as n/n).
5. **Y5.B5.S9, direct:** remainder_too_big (2-digit check-the-remainder, band to 119) is a misconception/check task, not 4-digit division with remainders → move it to related, or keep it with a note.
6. **Y5.B6.S3, proposal mult_mixed_int:** representation "a mixed-number band on mult_frac_whole" and why "closes the listed Y5 steps" are placeholders → write the B&W cell, e.g. "boxed cell: 2 1/3 × 4 with a part-whole bar (4 × 2 wholes + 4 × 1/3), write the answer as a mixed number in boxes; partition hint fades". Related: replace the copies of pre with mult_frac_whole_nv / frac_mult_word / add_mixed_like_nv.
7. **Y5.B8.S5, pre:** composite_shapes is both direct and pre → drop it from pre; replace addition:add with area_perimeter:area_distributive_visual (split a rectangle), or a missing-lengths pre-skill (missing_lengths, preBuild).
8. **Y5.B11.S5, pre:** angles_lines:symmetry is both direct and pre → use shape-property pre-skills (shapes_classify:classify_quads, a shape-naming skill, partition_shapes) and the Y4 step with forms [0] only, if that is the point.
9. **Y5.B12.S4, pre/preBuild:** add the block's own earlier steps: dec_known_facts, dec_across_one and decimal_pv in preBuild (they are gaps), plus decimals:decimal_nl_drag. Fix the related why for compare_decimal ("column method" is wrong; it compares decimals).
10. **Y5.B13.S5, partial:** integers:sub_int → add opts {forms:[1], band:10, ticks:"one"} (positive minus negative on a drawn line), which is the closest current item.
11. **Y5.B14.S3, build:** the missing clause "smaller to larger" (2,500 m = 2.5 km / 2 km 500 m; 350 cm = 3 m 50 cm) is not named in km_m or mm_cm_m → add a `direction` value to those option specs, or a separate option on length_metric. Related: add measurement:unit_conversion_word {units:[1]} or measurement:mass_volume_liquid as the parallel mass/capacity conversion.
12. **File-wide (systemic):** 49 of 136 steps list a direct or partial skill again as a pre-skill without lower-band opts, and 77 steps repeat pre-skills in related. Pre-skills must be different skills, or the same skill with an easier opts value written in the entry. Related lists should not echo pre.

## tagFixes spot-check (sampled steps, against SKILL_WRM)
- Correct: B1.S2 add disks/unit_form; B1.S11 add order_greatest_to_least; B2.S1 add the two partials; B4.S1 equivalent → partial, remove equiv_frac_nv, add equiv_frac_visual partial; B4.S9 add the two _nv; B5.S9 add divide, remove div_remainders (Y3-level); B7.S15 add f_to_d; B12.S4 and B12.S6 add_decimal → partial (existing tags are full); B14.S3 length_metric and unit_conversion_word → partial, add unit_conversions; B14.S5 add unit_conversion_word partial.
- Defect: B1.S13 add nearest_1000 has no band (see defect 1). The B4.S1 fix text mentions opts {"forms":[0]}, but the partial entry has no opts, so the two should agree.
- Not needed: B11.S2, B13.S5 and B15.S4 already carry partial tags that match the file.

## Verdict
**FAIL (mean 7.75).** Verdicts, missing clauses and proposal reuse are strong: every proposal id checked exists or is new for a reason, and no duplicates were found. Fix defects 1–11 and the systemic pre/related duplication (12), then re-grade.
