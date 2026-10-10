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

## Owner decision (2026-10-10): everything below is TO BE BUILT, recorded now, not built now

The owner has ruled that every gap and partial is to be built. This wave records what must be built; it builds nothing. The
earlier questions are therefore closed:
- Roman numerals to 1,000 is to be built (`roman_1000`).
- The whole Statistics block is to be built (`line_graph`, `table_data`, `two_way`, `timetables`).
- Metric ↔ imperial is to be built (`metric_imperial`).
- Volume is to be built (`volume_cubes`).
- The unit-fraction-only and same-decimal-places options are to be built (the steps stay partial until they are).

### The Y5 build record: 84 entries (19 new, 65 reused), by family

"Closes" lists the Y5 steps the entry makes full. "Pre-skill for" lists the steps that need it as a prerequisite only.
Each entry's full spec (`teaches`, `representation`, `why`, `ccss`, and `extendNote` where a reused entry must grow)
is in `data/curriculum/links/Y5.json` → `proposals`.

### algebra

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `multi_step_four_ops` | reused | option | `algebra:multi_step_word` | Two-Step Problems With All Four Operations (option) | B2.S6, B5.S6, B5.S11 | — |

### data

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `line_graph` | reused | new | `graphs:line_graphs` | Line Graphs | B9.S1, B9.S2 | — |
| `table_data` | reused | new | `graphs:read_and_make_tables` | Tables | B9.S3 | B9.S4, B9.S5 |
| `two_way` | reused | new | `graphs:two_way_tables` | Two-Way Tables | B9.S4 | — |

### decimals

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `dec_across_one` | **new** | option | `decimals:add_decimal` | Add and Subtract Decimals Across 1 (option) | B12.S3 | B12.S4 |
| `dec_compare_same` | **new** | option | `decimals:compare_decimal` | Compare and Order Decimals: Same Decimal Places (option) | B7.S8 | — |
| `dec_dp_match` | **new** | option | `decimals:add_decimal` | Add and Subtract Decimals: Same or Different Decimal Places (option) | B12.S4, B12.S5, B12.S6, B12.S7 | B7.S9, B12.S8 |
| `dec_known_facts` | reused | new | `decimals:decimal_known_facts` | Decimals from Known Facts | B12.S1, B12.S2, B12.S8 | B12.S3, B12.S4, B12.S9 |
| `dec_sequence` | reused | new | `patterns:decimal_sequences` | Decimal Sequences | B12.S9 | B12.S10 |
| `decimal_models` | reused | option | `decimals:add_decimal` | Decimal Operations With Models (option) | B12.S3, B12.S4, B12.S5 | B12.S6 |
| `decimal_pv` | reused | new | `decimals:decimal_place_value` | Tenths and Hundredths in a Place-Value Chart | B7.S1 | B7.S2, B7.S3, B7.S5, B7.S6, B7.S7, B12.S1, B12.S4 |
| `decimal_whole` | reused | new | `decimals:make_a_whole` | Make a Whole with Decimals | — | B7.S1, B12.S2, B12.S3 |
| `fd_place_band` | **new** | option | `conversions:d_to_f` | Fractions and Decimals by Place (option) | B7.S2 | B7.S3, B7.S6 |
| `round_whole` | reused | option | `decimals:round_decimals` | Round Decimals to the Nearest Whole (option) | B7.S10 | B7.S11 |
| `thousandths_pv` | reused | option | `decimals:decimal_place_value` | Thousandths (option) | B7.S5, B7.S6, B7.S7 | B7.S8 |

### fractions

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `equiv_from_unit` | **new** | option | `fractions:equivalent` | Equivalent Fractions From a Unit Fraction (option) | B4.S1 | B4.S2 |
| `frac_beyond_1` | reused | new | `fractions:mixed_numbers_intro` | Fractions Beyond 1 | — | B4.S4, B4.S8 |
| `frac_compare_gt1` | reused | option | `fractions:compare` | Compare and Order Fractions Greater Than 1 (option) | B4.S8 | B4.S9 |
| `frac_find_whole` | reused | option | `fractions:fraction_of_set_hard_nv` | Fraction of an Amount: Find the Whole (option) | B6.S6 | B6.S7 |
| `frac_operator` | reused | new | `fractions:fraction_as_operator` | Fractions as Operators | B6.S7 | — |
| `frac_total_band` | **new** | option | `fraction_operations:add_frac_unlike` | Add Fractions: Total Within 1 or Greater Than 1 (option) | B4.S10 | B4.S11 |
| `frac_whole_minuend` | **new** | option | `fraction_operations:sub_frac_unlike` | Subtract a Fraction From a Whole or an Improper Fraction (option) | B4.S14 | B4.S15 |
| `improper_direction` | **new** | option | `fractions:improper_mixed` | Improper ↔ Mixed: One Direction (option) | B4.S4, B4.S5 | B4.S6 |
| `mixed_plus_frac` | **new** | option | `fraction_operations:add_mixed_like` | Add or Subtract a Fraction and a Mixed Number (option) | B4.S12, B4.S15, B4.S16 | B4.S13, B4.S17 |
| `mult_mixed_int` | reused | option | `fraction_operations:mult_frac_whole` | Multiply a Mixed Number by an Integer (option) | B6.S3 | — |
| `mult_unit_frac_int` | **new** | option | `fraction_operations:mult_frac_whole` | Unit Fraction × Integer (option) | B6.S1 | B6.S2 |
| `sub_break_whole` | reused | option | `fraction_operations:sub_mixed_like` | Subtract from a Mixed Number: Break the Whole (option) | B4.S16 | B4.S17 |

### geometry

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `angle_estimate` | **new** | option | `angles_lines:measure_angles` | Estimate Angles (option) | B10.S3 | B10.S4 |
| `angles_point` | reused | option | `angles_lines:additive_angles` | Angles Around a Point and on a Line (option) | B10.S6, B10.S7 | — |
| `coord_missing_vertex` | **new** | option | `coordinates:coord_polygon` | Find the Missing Vertex (option) | B11.S2 | — |
| `draw_angles` | reused | new | `angles_lines:draw_angles` | Draw Angles and Lines | B10.S5 | — |
| `lengths_angles_shapes` | reused | new | `shapes_classify:angles_in_shapes` | Lengths and Angles in Shapes | B10.S8 | — |
| `polygons` | reused | new | `shapes_classify:regular_irregular_polygons` | Regular and Irregular Polygons | B10.S9 | — |
| `protractor_read` | reused | option | `angles_lines:measure_angles` | Measure With a Protractor (option) | B10.S4 | B10.S5 |
| `reflect_grid` | reused | new | `coordinates:reflect_on_grid` | Reflect on a Grid | B11.S6 | — |
| `reflex_angles` | **new** | option | `angles_lines:identify_angles` | Reflex Angles (option) | B10.S2 | B10.S3 |
| `shapes_3d_props` | reused | new | `shapes_classify:3d_shape_properties` | 3-D Shapes: Names and Properties | B10.S10 | — |
| `symmetry_complete` | reused | new | `angles_lines:complete_symmetric_shape` | Complete the Symmetric Shape | — | B11.S6 |
| `translate_grid` | reused | new | `coordinates:translate_on_grid` | Translate on a Grid | B11.S3, B11.S4 | — |
| `turns_angles` | reused | new | `angles_lines:turns_and_angles` | Turns and Angles | B10.S1 | — |

### integers

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `negative_count` | reused | new | `integers:count_through_zero` | Count Through Zero | B13.S1, B13.S2, B13.S3, B13.S5 | B13.S4 |

### measurement

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `area_estimate` | reused | new | `area_perimeter:estimate_area` | Estimate Area | B8.S6 | — |
| `capacity_estimate` | **new** | option | `measurement:capacity` | Estimate Capacity (option) | B15.S4 | — |
| `kg_g_convert` | **new** | option | `measurement:unit_conversions` | Kilograms and Grams (option) | B14.S1 | — |
| `km_m` | reused | option | `measurement:length_metric` | Kilometres and Metres (option) | B14.S1, B14.S3 | — |
| `l_ml_convert` | **new** | option | `measurement:capacity` | Litres and Millilitres (option) | B14.S2 | — |
| `mass_scales` | reused | new | `measurement:read_scales` | Read Scales (g, kg, ml, l) | — | B14.S1, B14.S2, B15.S4 |
| `metric_imperial` | reused | new | `measurement:metric_imperial` | Metric and Imperial Units | B14.S4 | — |
| `missing_lengths` | reused | new | `area_perimeter:rectilinear_missing_sides` | Missing Lengths in Rectilinear Shapes | B8.S2 | — |
| `mm_cm_m` | reused | option | `measurement:length_metric` | Metres, Centimetres, Millimetres (option) | B14.S2, B14.S3 | — |
| `regular_polygon` | reused | option | `area_perimeter:perimeter` | Perimeter of Regular Polygons (option) | B8.S3 | — |
| `roman_12` | reused | new | `measurement:roman_numerals_clock` | Roman Numerals to 12 | — | B1.S1 |
| `ruler_cm` | reused | option | `measurement:reading_ruler` | Read a Centimetre Ruler (option) | — | B10.S5, B14.S2 |
| `time_convert` | reused | option | `measurement:unit_conversion_word` | Convert Units of Time (option) | B14.S5 | B14.S6 |
| `timetables` | reused | new | `measurement:read_timetables` | Timetables | B9.S5, B14.S6 | — |
| `volume_cubes` | reused | new | `area_perimeter:volume_counting_cubes` | Volume by Counting Cubes | B15.S1, B15.S2, B15.S3 | — |

### number_theory

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `common_mf` | reused | option | `number_theory:multiples` | Common Multiples and Common Factors (option) | B3.S2, B3.S4 | — |
| `square_cube` | reused | new | `number_theory:square_and_cube_numbers` | Square and Cube Numbers | B3.S6, B3.S7 | — |

### operations

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `bonds_100` | reused | new | `addition:bonds_to_100` | Bonds to 100 | — | B2.S1 |
| `compare_calcs` | reused | new | `algebra:compare_calculations` | Compare Calculations | B2.S7 | — |
| `correspondence` | reused | new | `multiplication:correspondence_problems` | Correspondence Problems | — | B5.S6, B5.S11 |
| `div_factors` | reused | new | `division:divide_using_factors` | Division Using Factors | B5.S10 | — |
| `inverse_check` | reused | option | `subtraction:sub_check_by_adding` | Inverse Operations (option) | B2.S5, B2.S8 | — |
| `long_mult` | reused | new | `multiplication:long_multiplication_4x2` | Long Multiplication and Division (4-digit) | B5.S4, B5.S5, B5.S10 | — |
| `mental_add_sub` | reused | new | `addition:mental_strategies` | Mental Addition and Subtraction | B2.S1 | — |
| `mult_4x1` | reused | option | `multiplication:multiply` | Multiply a 4-Digit Number by a 1-Digit Number (option) | B5.S1 | — |
| `mult_multiples` | reused | option | `multiplication:mult_zeros` | Multiples of 10, 100 and 1,000 (option) | B3.S10 | — |
| `mult_three` | reused | new | `multiplication:multiply_three_numbers` | Multiply Three Numbers | — | B3.S7 |
| `mult_wp_multidigit` | **new** | option | `multiplication:mult_word_problems_plain` | Multiplication Problems With Larger Numbers (option) | B5.S6, B5.S11 | — |
| `vis_bar_family` | reused | template | `division:share_into_groups` | The Bar-Model Family (every WRM bar) | B2.S6, B2.S8 | — |
| `vis_division_layouts` | reused | option | `division:long_div_2digit` | Division Layouts: Bus Stop, Notes, Missing Digits | B5.S7 | — |

### placevalue

| id | new/reused | kind | on skill | name | closes (build) | pre-skill for |
|---|---|---|---|---|---|---|
| `dec_missing` | reused | option | `placevalue:place_value_10x` | Multiply and Divide Decimals: Missing Values (option) | B12.S12 | — |
| `estimate_big_place` | **new** | option | `number_sense:estimate_sums_diffs` | Estimate With Large Numbers (option) | B2.S4 | — |
| `flex_partition` | reused | new | `placevalue:flexible_partition` | Partition Numbers Flexibly | B1.S8 | — |
| `nl_20` | reused | new | `number_sense:number_line_scales` | Numbers on a Number Line (any scale) | B1.S9 | B1.S10 |
| `pv10_exponents` | reused | option | `placevalue:place_value_10x` | Powers of Ten With Exponents (option) | B1.S6 | — |
| `pv_more_less_big` | reused | option | `placevalue:more_less_100` | 10,000 and 100,000 More or Less (option) | B1.S7 | — |
| `pv_words_write` | **new** | option | `placevalue:number_word_names` | Write Numbers in Words (option) | B1.S5 | — |
| `roman_100` | reused | new | `placevalue:roman_numerals` | Roman Numerals | — | B1.S1 |
| `roman_1000` | reused | option | `placevalue:roman_numerals` | Roman Numerals to 1,000 (option) | B1.S1 | — |
| `value_ten_times` | reused | option | `placevalue:value` | Ten Times the Place to the Right (option) | B1.S6 | — |
| `vis_gattegno` | reused | template | `placevalue:place_value_10x` | Gattegno Chart | B1.S6 | — |
| `vis_more_less_table` | reused | option | `placevalue:more_less_10` | "−n | Number | +n" Table | B1.S7 | — |
| `vis_pv_bands_millions` | reused | band | `placevalue:place_value_disks` | Widen Place Value to 7 Digits (millions) | B1.S3, B1.S4 | B1.S5 |

### Also to record (fixes, not new skills)
- **Bug:** `measurement:length_metric` at Max Number 1,000 asks "How many m are in 10 km?" and gives 1000 as the answer.
- **Bug:** `measurement:mass_volume_liquid` sometimes deals "What is the mass in kg?" with the answer 0.
- **WRM_PROPOSALS clean-up:**
  - `mult_multiples` needs one host skill.
  - Y5.B11.S2 comes off `translate_grid`.
  - Y5.B15.S4 comes off `volume_cubes`.
  - `translate_grid` merges into `vis_migrate_coordinates`.
