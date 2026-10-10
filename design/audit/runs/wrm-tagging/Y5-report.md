# Wave 2 tagging: Year 5 (US Grade 4)

Output: `data/curriculum/links/Y5.json`. Brief: `BRIEF.md`. Critic reports: `Y5-critic.md` (round 3 passed at 8.00/10).
Prior learning comes from sheet "Grade 4" of `data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx`. All 136 steps
were matched to a school lesson, and their weeks' prior-learning lists were resolved to WRM step ids.

## Counts

| Block | Name | Steps | Full | Partial | Gap |
|---|---|---|---|---|---|
| Y5.B1 | Place value | 14 | 6 | 7 | 1 |
| Y5.B2 | Addition and subtraction | 8 | 2 | 6 | 0 |
| Y5.B3 | Multiplication and division A | 10 | 5 | 5 | 0 |
| Y5.B4 | Fractions A | 17 | 8 | 8 | 1 |
| Y5.B5 | Multiplication and division B | 11 | 4 | 7 | 0 |
| Y5.B6 | Fractions B | 7 | 3 | 3 | 1 |
| Y5.B7 | Decimals and percentages | 15 | 8 | 5 | 2 |
| Y5.B8 | Perimeter and area | 6 | 3 | 2 | 1 |
| Y5.B9 | Statistics | 5 | 0 | 0 | 5 |
| Y5.B10 | Shape | 10 | 0 | 8 | 2 |
| Y5.B11 | Position and direction | 6 | 2 | 4 | 0 |
| Y5.B12 | Decimals | 12 | 2 | 5 | 5 |
| Y5.B13 | Negative numbers | 5 | 1 | 2 | 2 |
| Y5.B14 | Converting units | 6 | 0 | 4 | 2 |
| Y5.B15 | Volume | 4 | 0 | 1 | 3 |
| **Total** | | **136** | **44** | **67** | **25** |

- **Proposals:** 84 referenced. 65 are reused existing ids (from WRM_PROPOSALS, STANDARD_PROPOSALS, VISUAL_BUILDS or
  WRM_EXTENSIONS), and 19 are new. All 19 new ones are OPTIONS on live skills; no new skill ids. 8 of the reused ids are
  needed only as pre-skill builds (`preBuild`), so their `steps` list is empty: ruler_cm, symmetry_complete, mass_scales,
  roman_12, roman_100, bonds_100, mult_three and correspondence.
- **Tag fixes:** 114, made up of 57 add, 53 partial (an existing full tag downgraded, with the missing clause) and 4 remove.
- The block supplements (pattern rules, multiplicative comparison, line plots with fractions, customary units, measurement
  word problems) are Awsaj lessons, not WRM steps, so they are not in `steps`.

### New proposals (all options)
| id | on | steps |
|---|---|---|
| pv_words_write | placevalue:number_word_names: write the words from a word bank (not multiple choice) | B1.S5 |
| estimate_big_place | number_sense:estimate_sums_diffs: round to 10,000 / 100,000 | B2.S4 |
| mult_wp_multidigit | multiplication:mult_word_problems_plain: 4-digit × 1-digit and 2-digit × 2-digit | B5.S6, B5.S11 |
| equiv_from_unit | fractions:equivalent: start from a unit fraction, fraction-wall support | B4.S1 |
| improper_direction | fractions:improper_mixed: one direction only | B4.S4, B4.S5 |
| frac_total_band | fraction_operations:add_frac_unlike: total within 1 or greater than 1 | B4.S10 |
| mixed_plus_frac | fraction_operations:add_mixed_like (+ sub): mixed number ± fraction | B4.S12, S15, S16 |
| frac_whole_minuend | fraction_operations:sub_frac_unlike: from a whole or an improper fraction | B4.S14 |
| mult_unit_frac_int | fraction_operations:mult_frac_whole: unit fractions only, repeated-addition bar | B6.S1 |
| fd_place_band | conversions:d_to_f / f_to_d: tenths or hundredths | B7.S2 |
| dec_compare_same | decimals:compare_decimal / order_decimals: same decimal places, same whole part | B7.S8 |
| dec_across_one | decimals:add_decimal / sub_decimal: within 1 / across 1 | B12.S3 |
| dec_dp_match | decimals:add_decimal / sub_decimal: same or different decimal places | B12.S4–S7 |
| reflex_angles | angles_lines:identify_angles: add reflex | B10.S2 |
| angle_estimate | angles_lines:measure_angles: estimate form | B10.S3 |
| coord_missing_vertex | coordinates:coord_polygon: write the missing vertex | B11.S2 (+ Y4.B14.S3) |
| kg_g_convert | measurement:unit_conversions: kg and g both ways, mixed units | B14.S1 |
| l_ml_convert | measurement:capacity: l and ml both ways, mixed units | B14.S2 |
| capacity_estimate | measurement:capacity: estimate form | B15.S4 |

## Notes for the lead (merging into wrm.js / build-list.js)
- **`extendNote` on reused proposals:** each says what the proposal must add for its Y5 steps.
  - inverse_check: the missing-number form.
  - long_mult: 3-digit × 2-digit.
  - multi_step_four_ops: numbers to 1,000,000.
  - div_factors: split 1-digit divisors into factors.
  - km_m and mm_cm_m: convert smaller units to larger.
  - missing_lengths: could be a composite_shapes form option instead.
- **`mult_multiples` contradicts itself in WRM_PROPOSALS.** It hosts the option on `mult_zeros` but describes a task on
  `number_theory:multiples`. Our copy is rewritten to the `mult_zeros` host only.
- **Steps to take off old proposals.**
  - Y5.B11.S2 is listed under `translate_grid`; it is now closed by `coord_missing_vertex`.
  - Y5.B15.S4 is listed under `volume_cubes`; it is now closed by `capacity_estimate`.
- **`translate_grid` overlaps `vis_migrate_coordinates`.** The migration already redraws `geo_translate` with the image drawn
  and the move described. Suggest merging them (this affects B11.S3 and B11.S4).
- **Generator bugs found while sampling (not fixed; outside this lane):**
  - `measurement:length_metric` at Max Number 1,000 asks "How many m are in 10 km?" and gives 1000 as the answer.
  - `measurement:mass_volume_liquid` sometimes deals "What is the mass in kg?" with the answer 0.

## Hardest calls
1. **Unit-fraction-only steps (B4.S1 equivalents from a unit fraction, B6.S1 unit fraction × integer) are partial.** The skills
   deal unit-fraction items, but always mixed with non-unit ones and with no option to separate them. For pupils who need one new
   thing per step, that separation is the point of the WRM step.
2. **Decimal steps that depend on the global Decimal Places setting (B7.S8, B12.S4–S7) are partial.** At 2–3 decimal places the
   generators mix "same" and "different" decimal places at random, so neither step can be printed on its own. This is why the
   option proposals `dec_dp_match` and `dec_compare_same` exist.
3. **B1.S5 "Read and write numbers to 1,000,000" is partial.** Reading is covered (`pv_digit_drag` with `source:word`). Writing
   is not: `number_word_names` only chooses among printed word names, and the design contract says a production item is never
   multiple choice.
4. **B5.S7 "Short division" is partial, but B5.S8 and B5.S9 are full.** `division:divide` with `tiles:41` really deals 4-digit ÷
   1-digit, with remainders, in a long-division grid. No skill draws the bus-stop layout with exchange digits, which
   `vis_division_layouts` closes.
5. **B8.S2 perimeter of rectilinear shapes is partial.** The perimeter-and-area form labels only some sides, but there is no
   perimeter-only page where the pupil finds unlabelled sides first.

## Owner questions (with suggested answers)
1. **Y5.B1.S1 Roman numerals to 1,000 (non-CCSS) is a gap. The school schedules it in W01. Build `roman_1000`?**
   *Suggested:* yes, but low priority. It is a small extension of `roman_100` (which closes Y3/Y4 too), and the school teaches it.
2. **The whole Statistics block (B9: line graphs, tables, two-way tables, timetables) is a gap. Build it now?**
   *Suggested:* yes, starting with `line_graph` and `table_data`. They carry 5.G.A.2 and 4.OA.A.3 and serve Y6 as well.
   Timetables should follow, together with B14.S6.
3. **B14.S4 metric ↔ imperial: the school is US, and customary units are taught in the Awsaj supplements. Build
   `metric_imperial`?**
   *Suggested:* build the customary supplements first (they carry 4.MD.A.1). Keep `metric_imperial` as a light option on
   `unit_conversions`.
4. **B15 Volume (5.MD.C, above grade) is mostly a gap. Build `volume_cubes` for Grade 4?**
   *Suggested:* yes. It serves Y6 Grade 5 directly, so one build closes both years.
5. **Should unit-fraction-only and same-decimal-places steps stay partial, or count as full because the next step covers the
   mix?**
   *Suggested:* keep them partial. Our pupils need the isolated step, and each fix is a small option on a live skill.
