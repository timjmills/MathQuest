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
