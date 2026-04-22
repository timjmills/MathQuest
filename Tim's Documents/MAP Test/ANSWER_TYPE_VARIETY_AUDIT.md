# Answer-Type Variety Audit — Existing MathQuest Skills

**Date:** 2026-04-22
**Source:** `js/modules/data.js` (SKILLS + SKILL_GRADES) cross-referenced against `gen-*.js` answerType usage and the MAP item-interaction taxonomy in `MAP_MODE_PLAN.md` §4.1–4.2.

**Goal:** Identify which existing MathQuest skills should be EXTENDED with one or more additional answer modes so MAP Practice mode can rotate answer modes within a session, mirroring real NWEA MAP item-type distribution.

---

## Summary

- **Total skills audited:** ~250 skill IDs across 8 domains
- **Skills recommended for variety expansion:** **78**
- **Effort distribution:** easy 31 / medium 36 / hard 11
- **Top 20 highest-impact skills (by frequency on real MAP and learning value):**

  1. `compare` (place value compare) — gets `multi-select-check` + `dnd-order` + `hot-text`
  2. `placevalue:identify` — gets `hot-text` + `dnd-categorize`
  3. `value` (digit value) — gets `hot-text` + `multi-select-check`
  4. `nearest_10` / `nearest_100` / `nearest_1000` — get `multi-select-check` + `number-line-extended`
  5. `expand` / `combine` — get `dnd-order` + `cloze-dropdown`
  6. `fractions:identify` / `identify_nv` — get `fraction-bar-shade` + `multi-select-check`
  7. `fractions:compare` / `compare_frac_lcd` — get `dnd-order` + `multi-select-check` + `hot-text`
  8. `compare_decimal` / `order_decimals` — get `dnd-order` + `multi-select-check`
  9. `equiv_frac_visual` / `equivalent` — get `fraction-bar-shade` + `dnd-categorize`
  10. `time_hour` … `time_1min` — get `clock-set` + `multi-select-check`
  11. `time_match_clock` / `time_analog_digital` — get `dnd-categorize`
  12. `money_count` / `money` — get `coin-builder` + `multi-select-check`
  13. `count_objects` / `count_sequence` — get `ten-frame` + `numpad-input`
  14. `compare_groups` — get `multi-select-check` + `dnd-categorize`
  15. `name_2d_shapes` / `name_3d_shapes` — get `multi-select-check` + `hot-spot`
  16. `classify_triangles` / `classify_quads` — get `multi-select-check` + `dnd-categorize`
  17. `coordinate_q1` / `coordinate_all` / `coordinate_graph` — get `coord-plot`
  18. `bar_graph` / `pictograph` / `tally_chart` — get `graph-builder` + `hot-spot`
  19. `seq_2/5/10` / `count_by_fill` / `number_pattern` — get `dnd-order` + `cloze-dropdown`
  20. `multi_step_word` (and word problems generally) — get `multi-select-check` for "click numbers needed"

---

## Recommendations by Domain

### Counting & Cardinality (NO/OA — K-2 anchor)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `count_objects` | multiple-choice | `ten-frame` (count by filling), `numpad-input` | MAP K-2 uses tap-the-dots and fill-the-frame heavily | medium |
| `count_sequence` | number | `cloze-dropdown` (___, 6, 7), `dnd-order` (drag missing into sequence) | Sequence completion is a top MAP K-2 item type | easy |
| `compare_groups` | multiple-choice | `multi-select-check` ("click ALL groups with 5"), `dnd-categorize` (more/less/same buckets) | Multi-select on grouped images is a primary MAP K item | medium |
| `compare_objects` | multiple-choice | `hot-spot` (tap the longer/heavier object) | Hot-spot on attribute is the MAP K format | medium |
| `classify_count` | multiple-choice | `dnd-categorize` (sort items into bins, then count), `multi-select-check` | Sort-and-count requires DnD on real MAP | medium |
| `number_bonds` | number | `ten-frame` (drag counters), `numpad-input` | K students manipulate the frame, not type | medium |
| `make_ten` | number | `ten-frame` (fill to 10), `numpad-input` | Same: MAP K shows the frame, asks for missing | medium |
| `teen_compose` | number | `base-10-builder` (1 ten + N ones), `ten-frame` (two frames) | Teen decomposition is built, not typed | hard |
| `odd_even` | odd-even-select | `multi-select-check` (already similar — generalize), `hot-text` ("click the odd ones in 21, 36, 47, 50") | hot-text on a list is a common MAP item | easy |
| `more_less_10` | number | `numpad-input`, `hot-spot` (tap the +1/-1/+10/-10 cell on a 100-chart) | 100-chart hot-spot is a MAP G1 staple | medium |
| `more_less_100` | number | `numpad-input`, `hot-spot` (tap the cell that is 100 more) | Same — Grade 2 chart navigation | medium |
| `fraction_number_line` | number-line-place | (already varied — keep, but add `numpad-input` companion) | Already a placement widget; companion entry for number-line answers | easy |
| `whole_as_fraction` | text | `fraction-bar-shade` (shade ALL parts to make 1), `multi-select-check` | Fraction = 1 visual interaction is core | medium |
| `number_word_form` | text | `cloze-dropdown` (assemble word from chips), `dnd-order` (drag word-parts) | Word-form assembly avoids spelling penalty | easy |

### Number & Operations — Place Value (NO)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `placevalue:identify` | text/multiple-choice | `hot-text` ("click the digit in the hundreds place"), `dnd-categorize` (drag digits into PV table) | Hot-text on digits is the highest-fidelity MAP PV item | easy |
| `value` | number | `hot-text` ("click the digit worth 200"), `multi-select-check` ("click all digits worth less than 100") | Same skill, different question framing per MAP | easy |
| `placevalue:compare` (`compare`) | choice (>,<,=) | `multi-select-check` ("click all numbers > 450"), `dnd-order`, `hot-text` (click the symbol) | MAP rarely shows just a symbol picker — varies the framing | easy |
| `expand` | text | `dnd-order` (drag 200, 30, 4 in order), `cloze-dropdown` (___+30+4 = 234) | Expanded form is a perfect dnd-order use case | medium |
| `combine` | text | `numpad-input`, `cloze-dropdown` (combine 200+30+4 = ___) | Variants on a single-skill card | easy |
| `place_value_disks` | number | `base-10-builder` (build the number with disks), `numpad-input` | Build-the-number is the canonical PV interactive | hard |
| `place_value_10x` | number | `multi-select-check` ("which expressions equal 30×10?"), `cloze-dropdown` | Variety beats numeric drill on relationship reasoning | easy |

### Number & Operations — Comparing & Number Sense (NO)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `compare_int` | choice (symbol) | `multi-select-check` ("click all integers > -3"), `dnd-order` (drag integers least→greatest), `hot-text` | Integer ordering on number line is the MAP 6+ item | easy |
| `compare_decimal` | choice | `multi-select-check`, `dnd-order` (order 0.4, 0.41, 0.04), `number-line-extended` | Decimals MUST be ordered, not just compared in pairs | easy |
| `order_decimals` | interactive (ordering) | `dnd-order` (replace existing widget), `number-line-extended` (place each then read order) | Modernize existing ordering widget to generic `dnd-order` | medium |
| `nearest_10` | number | `multi-select-check` ("click ALL that round to 50"), `number-line-extended` (place then identify nearest) | "Click all" is ~30% of MAP rounding items | easy |
| `nearest_100` | number | `multi-select-check`, `number-line-extended` | Same | easy |
| `nearest_1000` | number | `multi-select-check`, `number-line-extended` | Same | easy |
| `rounding_visual` | number | `number-line-extended` (drag/place then read), `hot-text` (click rounding-decision digit) | Already visual; add interactive placement | medium |
| `rounding_table` | text | `cloze-dropdown` (fill cells of a 3-col table), `dnd-categorize` | Table-fill is more MAP-authentic than typing | medium |
| `estimate_sum`/`estimate_diff`/`estimate_sums_diffs`/`estimate_products` | number | `multi-select-check` (which estimates are reasonable?), `cloze-dropdown` | Front-end estimation MAP items use rounding chips | easy |
| `make_a_ten` | number | `dnd-order` (compose: drag 6+4 chips to make 10), `cloze-dropdown` | Strategy demonstration > final number | medium |
| `doubles_near_doubles` | number | `cloze-dropdown` ("near double = ___ + 1"), `multi-select-check` | Reveals strategy use | easy |
| `compensation` | number | `cloze-dropdown` (fill steps), `multi-select-check` (which strategy is shown?) | Same | easy |

### Number & Operations — Operations (OA)

NOTE: Pure speed-drill skills (`add_facts`, `sub_facts`, `mult_facts`, `div_facts`) are **deliberately excluded** — they should remain numeric entry (with optional `numpad-input` overlay for K-2 only).

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `missing_add_sub` | number | `cloze-dropdown` (drop number into ___+5=12), `numpad-input` | Cloze framing varies a single skill | easy |
| `missing_mult_div` | number | `cloze-dropdown`, `numpad-input` | Same | easy |
| `add_sub_fact_family` | fact-family | `dnd-order` (drag 4 facts into family), `multi-select-check` ("click ALL facts in this family") | More authentic than typing 4 numbers | medium |
| `mult_div_fact_family` | fact-family | `dnd-order`, `multi-select-check` | Same | medium |
| `equal_sign` | choice | `multi-select-check` ("click all TRUE equations"), `dnd-categorize` (true/false bins) | True/false sort is a MAP G1 item | easy |
| `comparison_word` | number | `multi-select-check` ("which numbers tell how many MORE?") | Variation on word problem framing | easy |
| `arrays_groups` | number | `grid-shade` (build the array on a grid), `multi-select-check` (which arrays = 12?) | Grid-shade IS array building | hard |
| `mult_properties` | multiple-choice | `dnd-categorize` (sort by property: distributive/associative/commutative), `hot-text` (click the regrouped factor) | Property identification suits sort | easy |
| `area_model_mult` / `area_model_mult_hard` | area-model | `grid-shade` (shade the area model), `numpad-input` | Already interactive; add shade variant | medium |
| `area_model_div_2by1` / `area_model_div_3by1` | area-model-div | `grid-shade`, `numpad-input` | Same | medium |
| `mult_chart` | choice | `hot-spot` (tap the cell on a multiplication chart), `multi-select-check` | Hot-spot on a chart matches MAP exactly | medium |
| `dot_array_mult` | number | `grid-shade` (build the dots), `ten-frame`-style cluster | Build-the-array variant | medium |
| `nl_add` / `nl_sub` / `nl_mult` / `nl_div` | varies (mostly text/number) | `number-line-extended` (replace static SVG with draggable jumps) | Number-line ops should be drawn, not typed | hard |
| `number_line_add` / `number_line_sub` (B&W versions) | number | `number-line-extended` | Same | hard |
| All `add_*_mixed`, `sub_*_mixed`, etc. column math | number | `numpad-input` (K-2 only); `cloze-dropdown` for "fill in the regrouped tens" | Numpad for K-2; cloze for partial-product steps | easy |
| All `*_word_problems` (`add_word_problems`, `sub_word_problems`, `mult_word_problems`, `div_word_problems`, plus `_plain` and ranged variants) | number | `multi-select-check` ("click ALL the numbers needed to solve"), `dnd-categorize` (operation chooser: + − × ÷) | Item-prep skill — pick relevant info first | easy |
| `mult_comparison` / `mult_comparison_plain` | number | `dnd-order` (assemble equation from chips), `multi-select-check` | Multiplicative comparison framing varies | easy |
| `add_three` | number | `cloze-dropdown` (group two: ___+__=10, then +N), `numpad-input` | Reveals make-a-ten strategy | easy |
| `long_div_2digit` | number | `cloze-dropdown` (fill each step), `numpad-input` | Step-by-step fill is more diagnostic | medium |
| `div_remainders` | number | `cloze-dropdown` (q rem r), `multi-select-check` | Remainder framing varies | easy |

### Integers (NO)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `number_line_int` | text | `number-line-extended` (place an integer), `hot-spot` (click correct point) | Number line for negatives is the MAP 6 item | medium |
| `add_int` / `sub_int` | number | `number-line-extended` (draw the jump), `cloze-dropdown` | Drawing the jump matches MAP integer items | hard |

### Fractions, Decimals & Percents (NO)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `fractions:identify` | text | `fraction-bar-shade` (shade to match), `multi-select-check` ("click ALL bars showing 3/4") | Identify always pairs with shade on MAP | medium |
| `identify_nv` | text | `multi-select-check`, `cloze-dropdown` (numerator/denominator chips) | Cloze for parts of a fraction | easy |
| `equiv_frac_visual` | text | `fraction-bar-shade` (shade the equivalent bar), `dnd-categorize` (sort into equivalence classes) | Shade-to-match is the MAP equivalence interaction | medium |
| `equiv_frac_nv` | text | `multi-select-check` ("click all fractions equal to 1/2"), `dnd-categorize` | Multi-select on equivalence is core | easy |
| `equivalent` | text | `multi-select-check`, `cloze-dropdown` (1/2 = ___/4) | Cloze for missing part | easy |
| `fraction_of_set` | number | `multi-select-check` ("click 1/3 of the apples"), `grid-shade` | Click-the-set is the canonical MAP item | medium |
| `fraction_of_set_hard` | number | `multi-select-check`, `grid-shade` | Same | medium |
| `fraction_of_set_nv` / `fraction_of_set_hard_nv` | text | `cloze-dropdown`, `multi-select-check` | Variation framing | easy |
| `fractions:compare` (`compare`) | text | `dnd-order` (order 3 fractions), `multi-select-check` ("click all > 1/2"), `hot-text` (click symbol) | Already a top-20 priority | easy |
| `compare_frac_lcd` | text | `dnd-order`, `cloze-dropdown` (drop the LCD), `multi-select-check` | Reveals LCD reasoning vs. just comparison answer | medium |
| `simplify` | text | `cloze-dropdown` (drop the GCF, then result), `multi-select-check` ("click all already in simplest form") | Step-cloze beats single-answer | easy |
| `improper_mixed` | text | `dnd-order` (assemble: whole | num | denom), `cloze-dropdown` | Assembly is more authentic than typing | easy |
| `mixed_improper_visual` | text | `fraction-bar-shade` (shade pizza wedges), `multi-select-check` | Pizza-bar interactive is a top MAP item | medium |
| `order_fractions` | interactive (ordering) | `dnd-order` (replace with generic widget), `number-line-extended` | Modernize existing ordering | medium |
| `order_frac_numline` | text | `number-line-extended` (place fractions then read), `dnd-order` | Number line + ordering is paired on MAP | medium |
| `benchmark_fractions` | text | `multi-select-check` ("click all fractions closer to 1/2 than 1"), `dnd-categorize` (bins: 0, 1/2, 1) | Categorize against benchmarks IS the skill | easy |
| `graph_fractions` | number-line-place | `number-line-extended` (replace specialized widget), `numpad-input` | Migrate to generic widget | medium |
| `round_fractions` | text | `number-line-extended` (place mixed number, then round), `multi-select-check` | Same pattern as decimals | medium |
| `fraction_bar_ops` | varies | `fraction-bar-shade` (interactive), `grid-shade` | Already partially interactive | medium |
| `add_fractions_like` / `sub_fractions_like` | text | `fraction-bar-shade` (build then read), `cloze-dropdown` | Build-then-read bars | medium |
| `add_frac_unlike` / `sub_frac_unlike` | text | `cloze-dropdown` (drop LCD step, then sum), `numpad-input` | Step-cloze diagnostics | easy |
| `add_mixed_like` / `sub_mixed_like` | text | `cloze-dropdown` (whole / fraction parts), `numpad-input` | Same | easy |
| `add_mixed_unlike` / `sub_mixed_unlike` | text | `cloze-dropdown`, `numpad-input` | Same | easy |
| `decompose_fractions` / `decompose_frac_nv` | text | `dnd-order` (drag unit fractions into sum), `multi-select-check` | Decomposition = chip assembly | easy |
| `mult_frac_whole` / `mult_frac_whole_nv` | text | `fraction-bar-shade` (n copies of bar), `cloze-dropdown` | Repeated-bar visual + cloze | medium |
| `mult_frac_frac` / `mult_frac_frac_nv` | text | `grid-shade` (overlap-shade area model), `cloze-dropdown` | Area-model shade is the MAP item | hard |
| `div_unit_fraction` / `div_unit_frac_nv` | text | `fraction-bar-shade` (segment the bar), `cloze-dropdown` | Segmenting bars > typing | medium |
| `mult_scaling` / `mult_scaling_nv` | text | `multi-select-check` ("click all results larger than 5"), `dnd-categorize` (larger/smaller/same bins) | Categorize-by-effect IS the skill | easy |
| `frac_as_division` / `frac_as_div_nv` | text | `cloze-dropdown` (a/b = a ÷ b cloze), `numpad-input` | Cloze framing for the conversion | easy |
| `frac_10_100` / `frac_10_100_nv` | text | `grid-shade` (shade hundreds grid to convert), `cloze-dropdown` | 10×10 grid is the canonical visual | medium |
| `frac_word_problems` / `_plain` and `frac_word_mixed` / `_plain` and `frac_mult_word` / `_plain` | text | `multi-select-check` ("click numbers needed"), `dnd-categorize` (operation) | Same WP framing as integer WPs | easy |
| `add_decimal` / `sub_decimal` / `mult_decimal` / `div_decimal` | number | `cloze-dropdown` (place decimal step), `numpad-input` | Decimal-place placement step is MAP-canonical | easy |
| `round_decimals` | number | `number-line-extended` (place decimal, identify nearest), `multi-select-check` | Same pattern as integer rounding | medium |
| `f_to_d` / `d_to_f` / `f_to_p` / `p_to_f` / `d_to_p` / `p_to_d` | text | `dnd-categorize` (match form-pairs), `cloze-dropdown`, `multi-select-check` ("click all equivalent to 1/4") | Match/categorize across forms IS MAP | easy |
| `percent_visual` | text | `grid-shade` (shade % of 10×10), `multi-select-check` | Shade-the-grid is the canonical MAP percent | medium |
| `percent_of_number` | number | `cloze-dropdown` (×N/100 cloze), `numpad-input` | Step-cloze | easy |
| `find_whole_from_pct` | number | `cloze-dropdown`, `numpad-input` | Same | easy |
| `order_fdp` | text | `dnd-order` (mixed-form ordering), `multi-select-check` | Cross-form ordering = signature MAP item | medium |

### Geometry & Measurement — Shapes (G)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `name_2d_shapes` | choice | `multi-select-check` ("click ALL triangles"), `hot-spot` (click the rectangle in this composite figure) | Multi-select shapes is the MAP K-G2 staple | easy |
| `name_3d_shapes` | choice | `multi-select-check`, `hot-spot` (click 3D shape with N edges) | Same | easy |
| `shape_positions` | choice | `hot-spot` (click the shape ABOVE the box) | Position requires spatial click | medium |
| `compose_shapes` | choice | `dnd-order` (assemble target shape from parts), `dnd-categorize` | Composition = assembly | hard |
| `partition_shapes` | choice | `fraction-bar-shade` (partition then shade), `grid-shade` | Partitioning is interactive on MAP | medium |
| `shape_attributes` | choice | `multi-select-check` ("click ALL shapes with 4 right angles"), `dnd-categorize` | Attribute-sort matches MAP | easy |
| `order_objects_length` | choice | `dnd-order` (drag objects shortest→longest), `hot-spot` | Visual ordering = drag | medium |
| `measure_nonstandard` | number | `numpad-input`, `hot-spot` (click correct count) | Numpad on K-2 measure items | easy |
| `classify_triangles` | choice | `multi-select-check` ("click ALL right triangles"), `dnd-categorize` (bins: acute/right/obtuse OR scalene/iso/equi), `hot-text` | Classification = sort | easy |
| `classify_quads` | choice | `multi-select-check`, `dnd-categorize` (parallelogram/rhombus/etc.), `hot-text` | Same | easy |
| `identify_lines` | choice | `multi-select-check` ("click all parallel pairs"), `hot-spot` (click the perpendicular pair) | Click-on-figure beats MC for line ID | easy |
| `symmetry` | text/number | `hot-spot` (click lines of symmetry on shape), `multi-select-check` ("which shapes have ≥2 lines of sym?") | Click-line-on-shape is MAP-authentic | medium |
| `identify_angles` | text | `hot-spot` (click all obtuse angles in figure), `multi-select-check` | Click-the-angle is the MAP item | medium |
| `measure_angles` | number | `numpad-input`, `cloze-dropdown` (between 30°-60°) | Numpad for protractor reading | easy |
| `additive_angles` | number | `cloze-dropdown` (a + ___ = 90°), `numpad-input` | Step-cloze | easy |

### Geometry & Measurement — Area, Perimeter, Volume (MD)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `area_unit_squares` | number | `grid-shade` (count by tapping squares), `multi-select-check` | Tap-to-count on a grid is the MAP G3 item | medium |
| `perimeter_grid` | number | `hot-spot` (tap edges around shape), `numpad-input` | Tap-the-edges variant | medium |
| `perimeter` | number | `cloze-dropdown` (sides shown — drop sum), `numpad-input` | Cloze on sums | easy |
| `area` | number | `cloze-dropdown` (l × w cloze), `grid-shade` | Cloze + grid for build-up | easy |
| `area_perimeter` | dual | `cloze-dropdown`, `numpad-input` | Already dual; add cloze for steps | easy |
| `composite_shapes` | dual | `grid-shade` (decompose), `numpad-input` | Decomposition through shading | medium |
| `volume` | number | `cloze-dropdown` (l × w × h), `numpad-input` | Step cloze for 3-factor | easy |
| `volume_composite` | number | `numpad-input`, `cloze-dropdown` | Same | easy |

### Geometry & Measurement — Coordinates (G)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `coordinate_q1` | choice | `coord-plot` (click to plot a point), `multi-select-check` ("click all points in Q1") | Plot-the-point IS the MAP item | medium |
| `coordinate_all` | choice | `coord-plot`, `multi-select-check` | Same | medium |
| `coordinate_graph` | coordinate-multi | `coord-plot` (replace with generic widget), `dnd-order` (plot in order) | Modernize existing widget | medium |

### Measurement — Time (MD)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `time_hour` | text | `clock-set` (set the clock to N o'clock), `multi-select-check` ("click ALL clocks showing 3:00") | Set-the-clock is the canonical MAP K-1 item | hard |
| `time_half_hour` | text | `clock-set`, `multi-select-check` | Same | hard |
| `time_quarter` | text | `clock-set`, `multi-select-check` | Same | hard |
| `time_5min` | text | `clock-set`, `multi-select-check` | Same | hard |
| `time_1min` | text | `clock-set`, `multi-select-check` | Same | hard |
| `time_analog_digital` | text | `dnd-categorize` (match analog ↔ digital pairs), `multi-select-check` | Match-pairs is a primary MAP G2 item | medium |
| `time_match_clock` | clock-choice | `dnd-categorize` (match column A clocks to column B times), `multi-select-check` | Modernize the picker | medium |
| `elapsed_30min` / `elapsed_hour` / `elapsed_15min` / `elapsed_mixed` / `elapsed_find_duration` | text | `clock-set` (set the END clock), `cloze-dropdown` (h ___ min cloze) | Set-end-clock is MAP-authentic | hard |
| `elapsed_visual_easy` / `medium` / `hard` | text | `clock-set` (set END clock to match elapsed), `numpad-input` | Same; visual already shown | hard |

### Measurement — Money & Other (MD)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `money_count` | number | `coin-builder` (build the amount with coin buttons), `multi-select-check` ("click coins totaling 75¢") | Coin-builder IS the canonical MAP money item | hard |
| `money` | number | `coin-builder` (build change), `numpad-input` | Same | hard |
| `reading_ruler` | text | `ruler-drag` (align ruler to object), `numpad-input` | Drag-the-ruler is the MAP G2-3 item | hard |
| `reading_ruler_hard` | text | `ruler-drag`, `numpad-input` | Same | hard |
| `temperature` | text | `numpad-input`, `hot-spot` (click the matching thermometer) | Numpad / image-pick variants | easy |
| `capacity` | text | `multi-select-check` ("click all containers > 1 L"), `dnd-order` (smallest to largest) | Multi-select / order on capacity items | easy |
| `unit_conversions` | text | `cloze-dropdown` (× factor cloze), `numpad-input` | Step-cloze | easy |
| `mass_volume_liquid` | text | `multi-select-check`, `numpad-input` | MC variation | easy |
| `estimate_length` | choice | `multi-select-check` ("click all reasonable estimates"), `dnd-categorize` | Reasonable-estimate sort | easy |

### Data & Statistics (MD)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `bar_graph` | text | `graph-builder` (build bars from data table), `hot-spot` (click bar to read value), `multi-select-check` | Build-the-graph is a flagship MAP item | hard |
| `pictograph` | text | `graph-builder` (add icons to category), `hot-spot`, `multi-select-check` | Same | hard |
| `tally_chart` | text | `graph-builder` (build tallies), `multi-select-check`, `numpad-input` | Build-the-tally | medium |
| `line_plot` | text | `graph-builder` (place X marks on line), `hot-spot` | Place X marks IS the MAP item | hard |
| `line_plot_fractions` | text | `graph-builder` (fraction line plot), `number-line-extended` | Same with fraction marks | hard |
| `pie_chart` | text | `multi-select-check`, `hot-spot` (click sector matching value) | Sector-click is canonical | medium |
| `mean` / `median` / `mode` / `range` | number | `cloze-dropdown` (drop the middle / sum/n cloze), `numpad-input`, `dnd-order` (median = order then pick middle) | Cloze and order reveal procedure | easy |
| `probability_basic` | text | `multi-select-check` ("click all events with prob > 1/2"), `dnd-categorize` (likely/unlikely/impossible bins) | Categorize-by-likelihood IS the skill | easy |

### Algebraic Thinking — Patterns & Algebra (OA)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `seq_2` / `seq_5` / `seq_10` | text | `cloze-dropdown` (___, 10, 15, 20), `dnd-order` (drag missing terms in) | Cloze-fill on sequences = MAP item | easy |
| `count_by_fill` | text | `dnd-order`, `cloze-dropdown` | Same | easy |
| `skip_count_line` / `skip_count_grid` | text | `hot-spot` (click each skip on chart), `number-line-extended` | Tap-the-jumps on a chart | medium |
| `double` / `halve` | text | `numpad-input`, `multi-select-check` | Variations | easy |
| `shape_pattern` | text | `dnd-order` (drag pattern unit into next slot), `multi-select-check` | Pattern continuation = drag | medium |
| `number_pattern` | text | `cloze-dropdown` (multiple blanks), `dnd-order`, `multi-select-check` ("click all rule = +3") | Multi-mode on patterns | easy |
| `pattern_relationship` | text | `cloze-dropdown` (rule = ___), `multi-select-check` | Rule-naming variants | easy |
| `function_table_easy` / `function_table_hard` | text | `cloze-dropdown` (fill missing cells), `dnd-categorize` (which rule fits?) | Cell-fill on tables = MAP-authentic | medium |
| `solve_unknown` | text | `cloze-dropdown` (x = ___), `numpad-input` | Variation | easy |
| `solve_eq_addsub` / `solve_eq_multdiv` / `solve_eq_twostep` | text | `dnd-order` (drag steps in correct order), `cloze-dropdown` | Step ordering reveals reasoning | medium |
| `write_expression` / `write_equation` | text | `dnd-order` (assemble expression from chips), `cloze-dropdown` | Chip-assembly avoids typing penalty | medium |
| `evaluate_expression` / `evaluate_expression_hard` | text | `cloze-dropdown` (substitute step), `numpad-input` | Sub-step cloze | easy |
| `inequalities` | text | `multi-select-check` ("click all values that satisfy"), `number-line-extended` (shade inequality) | MAP shows shaded number line | medium |
| `tape_diagram` / `tape_diagram_plain` | text/dual | `grid-shade` (shade the tape segments), `cloze-dropdown` | Shade-the-segments is MAP-authentic | medium |
| `multi_step_word` / `multi_step_word_plain` | text/word_problem | `multi-select-check` ("click numbers needed"), `dnd-order` (order the operations) | Step-ordering & info-selection variations | easy |
| `algebra_word_mixed` / `_plain` | scaffolded_word | `cloze-dropdown` (per-step), `multi-select-check` | Already scaffolded; add cloze | easy |

### Algebraic Thinking — Order of Operations (OA)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `oop_easy` / `oop_medium` / `oop_hard` | text | `dnd-order` (drag operations in correct order), `cloze-dropdown` (sub-step), `numpad-input` | Order-the-steps reveals reasoning | medium |
| `two_ops_no_paren` / `three_ops_no_paren` / `multi_ops_no_paren` | text | `cloze-dropdown`, `numpad-input` | Same | easy |
| `paren_simple` / `paren_multi` / `nested_complex` | text | `hot-text` (click which step to do first), `cloze-dropdown` | Click-first-step = MAP grade-6 | medium |
| `exponents_simple` | text | `numpad-input`, `cloze-dropdown` | Same | easy |
| `compare_expressions` | choice | `multi-select-check` ("click all true comparisons"), `hot-text` | Multi-true variant | easy |

### Number Theory (NO)

| Skill ID | Current answerType | Add answerTypes | Why | Effort |
|---|---|---|---|---|
| `prime_composite` | classification | `multi-select-check` ("click all primes from 11-30"), `dnd-categorize` (already has bins; reuse generic widget) | Multi-select on a list = MAP item | easy |
| `factors_identify` | choice | `multi-select-check` ("click ALL factors of 24"), `hot-text` | Already multi-select-conceptually; widget swap | easy |
| `factor_tchart_easy` / `_medium` / `_hard` | t-chart | `tchart-drag` already exists — generalize to `dnd-categorize` | Modernize widget | medium |
| `factor_links_easy` / `_medium` / `_hard` | factor-links | `dnd-order` (drag factors into pairs), `multi-select-check` | Reframe link puzzle as drag-pair | medium |
| `multiples` | text | `multi-select-check` ("click all multiples of 6 up to 50"), `hot-text` (on a 100-chart) | Multiples = multi-select on chart | easy |
| `gcf_easy` / `gcf_hard` | text | `multi-select-check` (click common factors first), `cloze-dropdown` | Reveal common-factor step | easy |
| `lcm` | text | `multi-select-check` (click common multiples first), `cloze-dropdown` | Same | easy |
| `divisibility_sort` | divisibility-sort | `dnd-categorize` (already similar — generalize widget), `multi-select-check` | Modernize to generic widget | easy |

---

## Implementation order (suggested)

### Phase A — high-impact, low-effort (pure generator changes, no new widgets)

These reuse `multiple-choice` / `text` / `number` and just emit different framings. They unlock variety on ~25 skills with zero widget work:

- `compare`, `compare_int`, `compare_decimal`, `placevalue:compare` — multi-true MC
- `nearest_10`, `nearest_100`, `nearest_1000` — "which round to N?" MC
- `placevalue:identify`, `value` — already partly MC; rotate framings
- `equiv_frac_nv`, `benchmark_fractions`, `mult_scaling`, `probability_basic`, `prime_composite`, `multiples` — "click all" framing already implied
- All `*_word_problems` — add a "select the numbers needed" question type variant via MC
- All `seq_*`, `count_by_fill`, `number_pattern`, `pattern_relationship` — cloze-style MC ("which goes in the blank?")

### Phase B — needs P0 widgets (multi-select-check, numpad-input, dnd-order, dnd-categorize, hot-spot, number-line-extended, ten-frame)

After Phase 4 of MAP_MODE_PLAN ships P0:

- All "click ALL" rounding/comparison/factor/multiple/equivalence skills → `multi-select-check`
- All ordering skills (`order_decimals`, `order_fractions`, `order_fdp`, `compare_decimal/int/frac` ordering variants, `seq_*`, `function_table_*`) → `dnd-order`
- `dnd-categorize`: classification skills (`classify_triangles/quads`, `prime_composite`, `mult_properties`, `time_analog_digital` matches, `f↔d↔p` matches, `factor_tchart_*`, `divisibility_sort` swap)
- `hot-spot`: chart/figure skills (`mult_chart`, `100-chart` skip count, `identify_lines`, `identify_angles`, `symmetry`, `compare_objects`, `pie_chart` sectors)
- `number-line-extended`: rounding placement, integer placement, fraction placement, decimal placement, inequalities shading
- `ten-frame`: `count_objects`, `count_sequence`, `number_bonds`, `make_ten`, `teen_compose`
- `numpad-input` overlay: all K-2 numeric entry items (auto-toggled by tier setting)

### Phase C — needs P1 widgets (grid-shade, base-10-builder, fraction-bar-shade, clock-set, coord-plot, hot-text)

- `grid-shade`: `arrays_groups`, `area_model_*`, `area_unit_squares`, `dot_array_mult`, `partition_shapes`, `mult_frac_frac`, `frac_10_100`, `percent_visual`, `tape_diagram`, `composite_shapes`
- `base-10-builder`: `place_value_disks`, `teen_compose`, large-place-value identify problems
- `fraction-bar-shade`: `fractions:identify`, `equiv_frac_visual`, `whole_as_fraction`, `mixed_improper_visual`, `add_fractions_like`, `mult_frac_whole`, `div_unit_fraction`, `fraction_bar_ops`
- `clock-set`: all `time_*` and all `elapsed_*` skills (huge bundle: ~13 skills)
- `coord-plot`: `coordinate_q1`, `coordinate_all`, `coordinate_graph`
- `hot-text`: `placevalue:identify`, `value`, `compare`, `odd_even`, `paren_simple/multi`, `factors_identify`, `multiples`, `classify_triangles/quads`

### Phase D — needs P2 widgets (cloze-dropdown, coin-builder, ruler-drag, graph-builder)

- `cloze-dropdown` opens variety on **every step-based skill** (~30 skills): all multi-step ops (long division, regrouping addition, fraction addition with LCD, decimal arithmetic, percent of number, all algebra solve/evaluate, OoO, expansion/combination of place value)
- `coin-builder`: `money_count`, `money`
- `ruler-drag`: `reading_ruler`, `reading_ruler_hard`
- `graph-builder`: `bar_graph`, `pictograph`, `tally_chart`, `line_plot`, `line_plot_fractions`

---

## Skills explicitly NOT recommended for change

These should stay single-mode either because they're pure speed/fact drills (where multi-mode reduces practice density) or already inherently varied (mixed/`_all` aggregators):

**Pure speed drills (keep numeric-entry only — `numpad-input` overlay OK for K-2 tier):**
- `add_facts`, `sub_facts`, `mult_facts`, `div_facts`
- All `add_*_no_regroup`, `add_*_regroup`, `add_*_mixed` (and matching subtraction/divsion variants) — these are intentional column-arithmetic drills; cloze on regrouping steps is a Phase D bonus, not required
- `multiply`, `divide`, `subtract` (basic, plain numeric entry)

**Already inherently varied (aggregators / mixed pools — variety comes from the pool itself):**
- All `mixed_*` (e.g., `mixed_addition`, `mixed_fractions`, `mixed_geometry`, etc.)
- All `*_all` (e.g., `operations_all`, `fractions_all`, `geometry_all`, `algebraic_all`)
- All `grade_*_mixed`, `all_domains_mixed`, `custom_mixed`

**Specialized widget already optimal — skip unless redesigning:**
- `nl_add`/`nl_sub`/`nl_mult`/`nl_div`, `number_line_add`/`sub` — earmarked for `number-line-extended` *replacement* in Phase B; they don't need an *additional* mode beyond that swap
- `area_model_mult`, `area_model_div_*` — `area-model` widget is already the right shape; only add `grid-shade` if Phase C ships it as a generalization
- `tchart-drag` (existing) and `divisibility-sort` (existing) — already drag-categorize; widget upgrade is a Phase B refactor not a "new mode"
- `factor_links_*` — existing `factor-links` widget is fine; `dnd-order` is a "nice to have" not required
