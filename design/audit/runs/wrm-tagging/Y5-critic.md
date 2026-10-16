# Y5 (US Grade 4) WRM tagging: independent critic reports

Three independent critics (fresh mq-opus-medium agents, each on its own random sample of 28 steps), graded against the Quality
section of BRIEF.md. Pass mark: mean ≥ 8/10.

| Round | Sample seed | Mean | Verdict | What changed afterwards |
|---|---|---|---|---|
| 1 | 5510 | 7.43 | FAIL | A context bug was fixed: `{step, note}` tags had been read as partial; they are full. All tag fixes were re-checked; option keys that do not exist were fixed (`forms`); two generous fulls were downgraded; off-topic pre-skills were dropped |
| 2 | 2026 | 7.75 | FAIL | File-wide: a pre-skill is never the step's own skill unless it has an easier option; related lists never repeat pre; size options were added (e.g. `nearest_1000 {band:100000}`); `extendNote` was added where a reused proposal misses the step's clause |
| 3 | 77 | **8.00** | **PASS** | The lead then fixed every listed defect: mult_zeros moved to related on B3.S8; `fd_place_band` was limited to tenths and hundredths; `dec_compare_same` was split from `dec_dp_match`; B7.S8, B6.S2, B6.S4 and B3.S3 pre lists fixed; B8.S2 missing clause corrected; Y4.B14.S3 added to `coord_missing_vertex` |

The validator run by the lead after every round reports 0 ERRORS, 0 TAG-CONSISTENCY and 0 REPEATS. It checks: every key is live;
option keys are real; every non-full step has a build; every build id has a proposal; every tag change against SKILL_WRM has a
tagFix; no duplicate pre or related keys; no pre-skill repeats the step's own skill without an easier option; no related skill
repeats a pre-skill.

---


<!-- critic round 3 -->
# Critic round 3 — Wave 2 WRM tagging, Y5 (US Grade 4)

Work graded: data/curriculum/links/Y5.json (136 steps). 28-step sample. Items generated with sample.mjs (seeded) for
every direct/partial skill named in the sample; options checked in skill-options.js; tags checked in wrm.js;
prior learning checked in y5prior.json.

Structural checks (whole file): every direct/partial/pre/related key is a live SKILLS key (0 bad); every build /
preBuild id resolves to a proposal; no related skill repeats a direct skill.

## Per-step scores

| Step | Score | Reason |
|---|---|---|
| Y5.B1.S1 Roman numerals to 1,000 | 8 | Honest gap; roman_1000 reuses the wrm.js entry; preBuild roman_12/roman_100 right. Pre missing_add_sub / cloze_addition are xlsx-sourced but add little |
| Y5.B1.S4 Numbers to 1,000,000 | 8 | Sampled value/identify/pv_digit_drag band 999999 give 6-digit charts; partial (counters stop at 9,999, which is true) is honest; vis_pv_bands_millions is the right reuse |
| Y5.B2.S5 Inverse operations | 8 | sub_check_by_adding gives 3-digit subtractions only, so partial is right; inverse_check reused; pre and related are sensible |
| Y5.B3.S1 Multiples | 8 | multiples deals fill/list/click forms; full is fair. The tables only reach x9, so WRM's multiples of 25 and 15 are not dealt (not noted) |
| Y5.B3.S2 Common multiples | 9 | lcm forms[1] is click-from-a-set with small pairs, so partial is right with the precise clause; common_mf reused |
| Y5.B3.S3 Factors | 8 | factors_identify, tchart and links all teach it; one weak pre (see defects) |
| Y5.B3.S8 Multiply by 10, 100, 1,000 | 7 | place_value_10x op x with all three powers is the right direct. mult_zeros forms [0,1] is also listed as full, but it has no x1,000 and only 1-digit x 10/100 (sampled 8x10, 4x100) |
| Y5.B4.S4 Improper to mixed | 8 | Sampled improper_mixed: it mixes both directions plus click-all, so partial is honest; improper_direction is new and needed; div_remainders is a good pre |
| Y5.B5.S1 4-digit x 1-digit | 9 | multiply/area_model tiles 31 stop at 3-digit x 1-digit (sampled 815 x 8), so partial is honest; mult_4x1 reuses the build-list entry; easier-option pre is good |
| Y5.B5.S2 2-digit x 2-digit (area model) | 9 | area_model_mult_hard tiles 22 deals exactly this; full is right; pre chain is good |
| Y5.B6.S1 Unit fraction x integer | 9 | No unit-only control (options are denoms and strip only); partial plus the tagFix that downgrades wrm.js's full {note:'unit fractions'} is correct; proposal fits the bar cell |
| Y5.B6.S2 Non-unit fraction x integer | 8 | Full is fair; decompose_fractions (3/5 = 1/5+1/5+1/5) is a real prerequisite but is only listed as related |
| Y5.B6.S4 Fraction of a quantity | 8 | fraction_of_set / _nv teach it; preBuild mult_mixed_int is not a prerequisite of a fraction of a quantity |
| Y5.B6.S5 Fraction of an amount | 8 | hard / hard_nv deal 3/4 of 76 and stories; full is fair |
| Y5.B7.S5 Thousandths as fractions | 7 | Partial is honest (d_to_f sampled at dp 3 gives tenths/hundredths and 3/5 only). Two proposals for the same clause: the new fd_place_band (thousandths band) overlaps the reused thousandths_pv |
| Y5.B7.S8 Order/compare decimals (same dp) | 7 | Verdict partial is right. Pre compare_thousandths is harder than this step. The new dec_dp_match puts the compare/order "same whole part" option under an add/subtract proposal name |
| Y5.B7.S14 Percentages as decimals | 8 | d_to_p and p_to_d are an exact fit; good pre chain from S12 and S13 |
| Y5.B8.S2 Perimeter of rectilinear shapes | 7 | Verdict partial is defensible, but the stated missing clause is factually wrong (see defects) |
| Y5.B8.S3 Perimeter of polygons | 8 | perimeter_intro gives triangles and rectangles only, so partial is right; regular_polygon reused; related list is thin (1) |
| Y5.B10.S9 Regular/irregular polygons | 8 | name_2d_shapes partial is honest; polygons reused; good pre (classify_triangles: equilateral = regular) |
| Y5.B11.S2 Problem solving with coordinates | 8 | coord_polygon only measures sides, so partial is right; coord_missing_vertex is a good new option, but it should also list Y4.B14.S3 |
| Y5.B11.S4 Translation with coordinates | 8 | geo_translate is multiple choice only, so partial is right; translate_grid reused |
| Y5.B11.S6 Reflection in h/v lines | 8 | geo_reflect is multiple choice over the axes only, so partial is right; reflect_grid and symmetry_complete reused |
| Y5.B12.S9 Decimal sequences | 8 | Honest gap (number_pattern/count_by_step ignore decimals, checked at DEC=1); dec_sequence reused; related list thin (1) |
| Y5.B13.S1 Understand negative numbers | 8 | number_line_int / integer_nl_drag read and place integers with no context, so partial is right; negative_count reused |
| Y5.B13.S2 Count through zero in 1s | 8 | Honest gap; temperature (above 0) and number_seq_fill are sensible pres |
| Y5.B14.S6 Calculate with timetables | 8 | Honest gap (no timetable generator); elapsed-time pres are well chosen (unit_conversion_word does deal time items) |
| Y5.B15.S4 Estimate capacity | 8 | capacity sorts into bins and asks ">1 litre", with no estimate in ml/l, so partial is accurate; new capacity_estimate fits the cell; pre/related thin (2/1) |

**Mean: 224 / 28 = 8.00. Verdict: PASS (borderline).** 4 steps score 7. No step is below 7.

## Concrete defects

1. **Y5.B3.S8, direct + tagFix (add multiplication:mult_zeros).**
   - What is wrong: mult_zeros forms [0,1] has no x1,000 option (only x10, x100 and a multiple of ten) and deals only 1-digit numbers. A full tag overclaims.
   - What it should be: move it to `partial` with missing "x 1,000 and multi-digit numbers", or move it to related. The tagFix becomes action `partial`.
2. **Y5.B8.S2, partial[composite_shapes].missing and step `missing`.**
   - What is wrong: "every side is labelled, so the pupil never finds the missing lengths" is false. The dual_pa form labels only 4 sides of an L/T shape (sampled: L "2;7;7;10" P=34; T "7;2;2;3" P=24), so the pupil already finds missing sides. Only the perim_only form labels every side.
   - What it should be: "missing lengths appear only in the perimeter-and-area form; no perimeter-only page with unlabelled sides". Also say that missing_lengths could be a form option on composite_shapes rather than a new skill (the lead's call, since the id is reused).
3. **Y5.B7.S5, build.**
   - What is wrong: fd_place_band (new, reused:false) and thousandths_pv (reused) both claim to close "thousandths as fractions" for this step.
   - What it should be: keep thousandths_pv for S5 and limit fd_place_band to tenths/hundredths (Y5.B7.S2). Otherwise merge the thousandths band into thousandths_pv.
4. **Y5.B7.S8, build dec_dp_match.**
   - What is wrong: the proposal is named and specified as "Add and Subtract Decimals: Same or Different Decimal Places", and the compare/order option "same whole part" is bolted onto it through `also`. A builder reading the name or teaches line would not build the compare/order page.
   - What it should be: split out a compare/order option (on compare_decimal / order_decimals: "same number of decimal places, same whole part", e.g. 0.47 vs 0.43; 3.6, 3.2, 3.9), or rename the proposal and extend `teaches` to cover compare/order.
5. **Y5.B7.S8, pre[0] decimals:compare_thousandths.**
   - What is wrong: it is labelled "Y5.B7.S6–S7 thousandths (earlier steps)", but it compares 3-dp decimals. That is harder than a same-dp comparison, not an easier prerequisite.
   - What it should be: order_decimals at DEC=1 (1 dp only, sampled), or decimal_nl_drag first. Move compare_thousandths to related.
6. **Y5.B3.S3, pre multiplication:mult_properties.**
   - What is wrong: its "why" is "Y4.B4.S12 Divide a number by 1 and itself", but the samples deal zero, commutative and distributive items, never division by 1 or by itself.
   - What it should be: drop it or relabel the why. division:div_facts or mult_facts is nearer.
7. **Y5.B6.S4, preBuild mult_mixed_int.**
   - What is wrong: multiplying a mixed number by an integer (Y5.B6.S3) is not a prerequisite for a fraction of a quantity, and no pre entry uses it.
   - What it should be: remove it from preBuild. If the block order should be shown, mention it in related.
8. **Y5.B6.S2, pre.** fraction_operations:decompose_fractions (3/5 = 1/5 + 1/5 + 1/5) is the real stepping stone for non-unit x integer, but it sits in related. Move it to pre, just after the unit-fraction step.
9. **Y5.B11.S2, proposal coord_missing_vertex steps.**
   - What is wrong: the same clause is already a partial tag in wrm.js for Y4.B14.S3 (coord_polygon: "...finding a missing vertex"), but only Y5.B11.S2 is listed.
   - What it should be: add Y4.B14.S3, so the Y4 tagger and the lead reuse this id rather than inventing another.
10. **Y5.B3.S1, note (minor).** Not a verdict error, but the gap goes unrecorded: multiples only deals tables up to x9 (sampled 4, 6, 8, 9), while WRM Y5 also uses multiples of 25, 50 and 15. Add a note, or record a band option, if the lead wants it.
11. **Thin related lists (minor).** Y5.B8.S3 (1), Y5.B12.S9 (1), Y5.B15.S4 (1) and Y5.B4.S4 (2) could take the inverse or next-step skills, e.g. count_by_step_down and place_value_10x at decimals for B12.S9, and measurement:mass_volume_liquid / unit_conversions for B15.S4.

Side finding (not the tagger's work): measurement:mass_volume_liquid produced "Read the scale. What is the mass in kg?" with answer 0 on seeds 1000, 1003 and 1005. That looks like a generator bug to log.

## TagFix spot-check (sampled steps)
All 16 tagFixes for sampled steps match wrm.js and the samples, except the mult_zeros "add" for Y5.B3.S8 (defect 1).
- Y5.B6.S1: correctly downgrades wrm.js's full `{step, note:'unit fractions'}` on mult_frac_whole to partial.
- Y5.B8.S2: correctly downgrades composite_shapes `{note:'perimeter'}` to partial (the reason text needs the fix in defect 2).
- Y5.B4.S4 (improper_mixed, mixed_improper_visual), Y5.B7.S8 (compare_decimal, order_decimals) and Y5.B13.S1 (number_line_int, integer_nl_drag): downgrades are justified by the samples.
- Adds for factor_links_medium (B3.S3), value/identify band 999999 (B1.S4), area_model_mult partial (B5.S1) and name_2d_shapes partial (B10.S9) are right.

---

<!-- critic round 2 -->
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

---

<!-- critic round 1 -->
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

---
