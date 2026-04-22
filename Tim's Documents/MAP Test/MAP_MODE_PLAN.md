# MAP Test Practice Mode — Comprehensive Build Plan

**Status:** Plan only. No code written yet.
**Audience:** Tim Mills (project owner) + Claude Code (implementer).
**Scope:** Two new practice modes — **K-2 MAP** and **3-5 MAP** — with adaptive RIT-band/domain selection, every existing answering modality the real test uses, and a paper/print version of every MAP skill.
**Authority for content/RIT mapping:** the four research docs in `Tim's Documents/MAP Test/` (Build Reference, Implementation Guide, Framework Development, Research). Sample-item language and band → skill assignments below come directly from those.

---

## 0. Hard requirements (from user)

1. **Two distinct practice modes**: K-2 MAP and 3-5 MAP, selectable separately.
2. Selection UI organized around **both RIT bands AND domains**, multi-select with deselect.
3. **Cover every content area and every interaction modality** that appears on real MAP K-2 and Math 2-5 — no omissions.
4. Update existing skills (and add new ones) until question types AND answer modes match MAP fidelity.
5. **Every MAP skill must be a normal MathQuest skill** (registered in `data.js → SKILLS`, listed in Skills Navigator, queueable, etc.). MAP mode is a *view onto* the canonical skill set, not a parallel content silo.
6. **Every MAP skill must have a paper/print version** (entry in `SKILL_PRINT_SIZE`, handler in `print-generate.js` if visual).
7. Research-driven: check work at every stage, no gaps, errors, or bugs.

---

## 1. Mode architecture (two sibling modes)

The home view gets two new entry cards (alongside Start Game / Skills Navigator / Quiz Builder / Dashboard):

| Card | Color | Routes to | Pool |
|------|-------|-----------|------|
| 🅰 **MAP Practice K-2** | Cyan-orange (matches K-2 grade band) | `mapTestView` with `state.mapTier = "k2"` | RIT 141-220 skills |
| 🅱 **MAP Practice 3-5** | Red-purple (matches 3-5 grade band) | `mapTestView` with `state.mapTier = "35"` | RIT 181-230+ skills |

K-2 vs 3-5 differ in:

| Dimension | K-2 | 3-5 |
|-----------|-----|-----|
| Default RIT bands offered | 141-150, 151-160, 161-170, 171-180, 181-190, 191-200, 201-210, (211-220 ceiling) | (181-190 floor), 191-200, 201-210, 211-220, 221-230 |
| Audio | **Auto-play on every item**; large speaker replay button | Audio is opt-in (TTS toggle); item stems are text-first |
| Item visuals | Image-rich, large hit boxes (≥56px), 3-option MC for K | Text-heavier, 4-option MC, fraction/decimal/coordinate visuals |
| Calculator | **Never** | Hidden; only appears on items tagged `calculator: true` (only RIT 211+ Grade-6-standard items) |
| Manipulatives | Heavy (ten frame, base-10 blocks, counters, coins, ruler, analog clock) | Lighter (fraction bars, area models, number lines, coord plane) |
| Crossover rule | If session estimated RIT > 200 at end → suggest moving up to 3-5 | If estimated RIT < 170 at end → suggest moving down to K-2 |
| Default item count | 15 (Simulation) / 20 (Practice) | 20 (Simulation) / 25 (Practice) |
| Time cap | 25 min | 45 min |
| Back-nav, skip | Disabled (faithful to MAP) | Disabled |

Both modes share the same selector → session → results pipeline; everything below applies to both unless noted.

---

## 2. RIT bands and the band-grid UI

The selector view (id `mapSelectorView`) renders, for each tier, a **band grid** and a **domain grid**, both multi-select chips with a "Select all" / "Clear" toggle.

### 2.1 Band chip definitions

K-2 chips (8 chips, default: all selected):

| Chip | Typical grade/season | Norm anchor (Spring) |
|------|----------------------|----------------------|
| `< 150` (141-150) | Mid K | K mid-year |
| `151-160` | Late K / Grade 1 fall | K spring 157 |
| `161-170` | Grade 1 | Gr 1 fall 160 |
| `171-180` | Grade 1 spring / Grade 2 fall | Gr 1 spring 176 |
| `181-190` | Grade 2 | Gr 2 spring 189 |
| `191-200` | Grade 2 end / Grade 3 fall | Gr 2 ceiling |
| `201-210` | Advanced Grade 2 / typical Grade 3 | (3-5 territory) |
| `211-220 (ceiling)` | High K-2 ceiling | Migrate to 3-5 |

3-5 chips (6 chips, default: bands matching enrolled grade ±1):

| Chip | Typical grade/season |
|------|----------------------|
| `181-190 (floor)` | Grade 2 end / Grade 3 fall |
| `191-200` | Grade 3 |
| `201-210` | Grade 3 end / Grade 4 |
| `211-220` | Grade 4 end / Grade 5 |
| `221-230` | Grade 5 end / Grade 6 entry |
| `231+ (advanced)` | Highly advanced — Math 6+ pool |

Each chip shows the band, the typical grade label, and a count of skills matched given the current domain selection ("12 skills"). Clicking deselects.

### 2.2 Domain chips (4)

Both tiers share the same four NWEA goal areas:

| Code | Name | Maps to MathQuest categories |
|------|------|------------------------------|
| **OA** | Operations & Algebraic Thinking | `addition`, `subtraction`, `multiplication`, `division`, `number_ops_mixed`, `patterns`, `algebra`, `order_of_operations` |
| **NO** | Number & Operations | `counting`, `comparing`, `composing`, `placevalue`, `number_sense`, `number_theory`, `fractions`, `fraction_operations`, `decimals`, `conversions`, `integers` |
| **MD** | Measurement & Data | `measurement`, `area_perimeter`, `graphs`, `data_analysis`, `probability` |
| **G** | Geometry | `shapes_early`, `angles_lines`, `shapes_classify`, `coordinates` |

Default: all four selected. Deselecting hides chip-matched skills from the band counts.

### 2.3 Mode toggle

Two buttons under the chips:

* **Simulation** — adaptive, no feedback during, no hints, no retry. End-of-session report. (Models real test-day experience for ELL/anxious students.)
* **Practice** — adaptive within selected bands, immediate feedback, hints (2-3 per item), worked solution after 2 misses on same skill, retry until correct.

### 2.4 Session-length controls

Three quick presets (10 / 20 / 30 items) plus a custom slider (5-43). Default per tier listed above. A "Untimed" checkbox (default on) lets the time cap be removed.

---

## 3. Content inventory — what we have, what we need

**Source for "what NWEA expects":** Implementation Guide §1B, §1C, §1D (K-2) and §2B, §2C, §2D (3-5); Build Reference Part 3 (RIT 141-230 skill catalog); Framework Development bands 161-230.

**Source for "what we have":** `js/modules/data.js → SKILLS` (~250 skills indexed) and `SKILL_GRADES`.

For each RIT band I list (a) NWEA expectations, (b) existing MathQuest skills that already cover them, (c) **gaps** — missing skills we must add or extend.

> **Convention.** Skill IDs in `code style` are existing skills in `data.js`. Skill IDs in **bold** are new skills to add. All new skills must follow the existing skill checklist (CLAUDE.md): add to `DOMAINS` + `SKILLS`, add `SKILL_GRADES` entry, add `SKILL_PRINT_SIZE`, add `SKILL_TIME_CATEGORY`, register in the appropriate `gen-*.js`, add an `answerType`-specific renderer if new, add a print handler in `print-generate.js`, add to worksheet card class arrays in `worksheet.js`.

### 3.1 K-2 RIT band coverage

#### Band <151 (early K)

| NWEA expectation (Implementation Guide §1C) | Existing MathQuest | Gap |
|---|---|---|
| OA: add/sub within 5; combine with pictures | `add_10_no_regroup`, `sub_10_no_regroup`, `add_facts` (need range cap to 5) | **`add_5_pictures`** (add within 5 with image counters, MC 3-image options); **`sub_5_pictures`** |
| NO: count 1-20; compare quantities (most/more/same); teen numbers as emerging | `count_objects`, `count_sequence`, `compare_groups`, `teen_compose` | OK — verify all support audio + MC-3 image variant |
| MD: compare size; weight vocab; pictograph categories | `compare_objects`, `classify_count`, `pictograph` (too advanced for this band) | **`heavier_lighter_visual`** (3-image MC); **`pictograph_intro`** (1-to-1 picture graph, K-friendly) |
| G: name circle/triangle/square/rectangle/cone; positional words | `name_2d_shapes`, `name_3d_shapes`, `shape_positions` | OK |

#### Band 151-160 (mid-late K)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: subtract within 10; put-together / take-apart with diagrams | `sub_10_mixed`, `number_bonds` | OK |
| NO: groups of tens (PV foundation); "fewer" as compare term | `more_less_10`, `place_value_disks` (Grade 2 currently) | **`tens_foundation_visual`** — show base-10 rods, ask "how many tens?" (Grade K) |
| MD: centimeters; simple picture/bar graphs | `measure_nonstandard`, `bar_graph` (Grade 3 currently) | **`bar_graph_intro`** (single-unit, ≤5 categories, K-friendly) |
| G: fourths introduced; 3-D faces and corners; "next to" | `partition_shapes`, `name_3d_shapes` | **`shape_corners_count`** (count corners on solid; tap-to-count) |

#### Band 161-170 (Grade 1)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: add/sub within 20; missing addend; equal sign; relate add/sub | `add_20_mixed`, `sub_20_mixed`, `missing_add_sub`, `equal_sign`, `add_sub_fact_family` | OK |
| NO: add/sub within 100 no regrouping; ten more/less; hundreds chart; skip-count 5/10; numbers to 120 | `add_100_no_regroup`, `sub_100_no_regroup`, `more_less_100`, `seq_5`, `seq_10`, `skip_count_grid` | **`hundreds_chart_fill`** (click missing number on hundreds chart — interactive) |
| MD: tell time hour & half-hour; whole dollars; non-standard length; perimeter intro | `time_hour`, `time_half_hour`, `money_count`, `measure_nonstandard`, `perimeter` (Grade 3) | **`perimeter_intro`** (count sides on rectangle, Grade 1 friendly) |
| G: halves; polygons; sphere; compose/decompose | `partition_shapes`, `compose_shapes` | OK |

#### Band 171-180 (Grade 1 end / Grade 2)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: word problems within 20, unknown start; estimate | `add_wp_20`, `sub_wp_20`, `multi_step_word` (too advanced), `estimate_sum`, `estimate_diff` | **`unknown_start_wp`** (e.g. "Maya had ___ crayons; gave 7 away; now has 8") |
| NO: ten less; intro regrouping; rounding emerges; <,>,= symbols | `add_100_regroup`, `sub_100_regroup`, `nearest_10`, `compare` | OK |
| MD: bills + coin collections; analog clock to 5 min | `money_count`, `money`, `time_5min`, `time_quarter` | OK |
| G: edges/vertices on 3-D shapes | (none) | **`count_edges_faces_vertices`** (3-D shape, ask for one of E/F/V; tap-to-count) |

#### Band 181-190 (Grade 2 / Grade 3 start)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: multiplication facts intro; inverse op | `mult_facts`, `mult_div_fact_family`, `arrays_groups`, `dot_array_mult` | OK |
| NO: 3-digit PV; expanded form; compare 3-digit; unit fractions | `place_value_disks`, `expand`, `combine`, `identify` (in fractions), `fractions:identify` | OK |
| MD: area via unit squares; line plots; elapsed time; bar/pictographs | `area_unit_squares`, `line_plot`, `elapsed_30min`, `bar_graph`, `pictograph` | OK |
| G: thirds; quadrilateral | `partition_shapes`, `classify_quads` | OK |

#### Band 191-200 (Grade 2 end / Grade 3)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: meaning of mult; arrays; 2-step word problems; basic mult facts; patterns | `arrays_groups`, `mult_facts`, `mult_word_problems`, `multi_step_word`, `number_pattern` | OK |
| NO: round to nearest 10/100; add within 1000; unit fractions; fractions on number line; compare same-denominator | `nearest_10`, `nearest_100`, `add_1k_mixed`, `fraction_number_line`, `fractions:compare` | OK |
| MD: time to minute; multi-unit graphs; change from a dollar; area by counting unit squares | `time_1min`, `bar_graph`, `money`, `area_unit_squares` | OK |
| G: categorize quadrilaterals; partition shapes | `classify_quads`, `partition_shapes` | OK |

#### Band 201-210 (Grade 3 end / Grade 4)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: division; quotient; ×↔÷ relation; 2-step missing-factor | `div_facts`, `divide`, `mult_div_fact_family`, `missing_mult_div` | OK |
| NO: subtract within 1000; equivalent fractions on a number line | `sub_1k_mixed`, `equiv_frac_visual`, `equivalent`, `order_frac_numline` | OK |
| MD: area via distributive property; decompose figures; missing side from area/perimeter; create multi-unit graphs | `area_perimeter`, `composite_shapes`, `area_model_mult` | **`area_distributive_visual`** (rectangle split into two parts, find area of each, sum) |
| G: one-quarter; partition into equal parts | `partition_shapes`, `fraction_number_line` | OK |

#### Band 211-220 (K-2 ceiling)

| NWEA expectation | Existing | Gap |
|---|---|---|
| Equivalent fractions in simpler form; subtle quadrilateral attributes; missing-factor rare on K-2 | `simplify`, `equivalent`, `classify_quads`, `missing_mult_div` | OK — at this RIT, item pool thins for K-2; algorithm should prefer 3-5 items |

### 3.2 3-5 RIT band coverage

#### Band 181-190 (3-5 floor — overlaps with K-2 ceiling)

Same skills as K-2 181-190; both modes pull from the same pool. The 3-5 selector also offers higher difficulty per skill (larger numbers via `state.range`).

#### Band 191-200 (Grade 3)

Same as K-2 191-200 (above) — already covered.

#### Band 201-210 (Grade 3 end / Grade 4 / Grade 5 fall)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: patterns w/ rule; prime/composite ≤20; factor pairs; multiples | `number_pattern`, `prime_composite`, `factors_identify`, `multiples`, `factor_tchart_easy` | OK |
| NO: read/write/compare multi-digit; round to any place; multi-digit ×/÷; equivalent fractions a/b=na/nb; tenths/hundredths as decimals; compare decimals | `place_value_disks`, `nearest_1000`, `multiply`, `divide`, `area_model_mult`, `equivalent`, `f_to_d`, `compare_decimal` | OK |
| MD: customary/metric unit relative sizes; conversions larger→smaller; multi-step distance/time/volume/mass/money problems; area & perimeter formulas; angles in degrees with protractor; line plots in halves/fourths/eighths; mean/median/mode/outliers intro | `unit_conversions`, `multi_step_word`, `area_perimeter`, `measure_angles`, `line_plot_fractions`, `mean`, `median`, `mode`, `range` (currently Grade 6) | **`unit_conversion_word`** (multi-step: "2.5 km to meters") — extend `unit_conversions`. Drop `mean/median/mode` to Grade 4-5 in `SKILL_GRADES` |
| G: points/lines/segments/rays/angles; parallel/perpendicular; classify triangles by angle/side; quadrilateral types; symmetry | `identify_lines`, `identify_angles`, `classify_triangles`, `classify_quads`, `symmetry` | OK |

#### Band 211-220 (Grade 4 end / Grade 5)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA: parens/brackets/braces; evaluate expressions; write/interpret numerical expressions; generate two patterns from rules; ordered pairs | `oop_easy`, `oop_medium`, `paren_simple`, `paren_multi`, `pattern_relationship`, `coordinate_q1`, `coordinate_graph` | OK |
| NO: 10× / 1/10 across PVs; powers of 10; decimals to thousandths; round decimals; multi-digit ×; multi-digit ÷ w/ 2-digit divisors; +-×÷ decimals to hundredths; +- fractions unlike incl mixed; fraction as division; ×fraction (or whole) by fraction; ÷ unit fraction by whole and whole by unit; improper/mixed | `place_value_10x`, `add_decimal`, `sub_decimal`, `mult_decimal`, `area_model_mult_hard`, `long_div_2digit`, `add_frac_unlike`, `sub_frac_unlike`, `add_mixed_unlike`, `sub_mixed_unlike`, `frac_as_division`, `mult_frac_frac`, `div_unit_fraction`, `mult_scaling`, `improper_mixed` | OK |
| MD: convert within system; multi-step real-world conversion; volume of right rect prisms (V=lwh, V=bh); decompose solids; line plots in fractions; box plot/quartiles intro | `unit_conversions`, `volume`, `volume_composite`, `line_plot_fractions` | **`box_plot_intro`** (read box plot, identify median/quartile/range — multi-choice) |
| G: coordinate axes; first quadrant graphing; distance between points sharing a coord; classify in attribute hierarchy | `coordinate_q1`, `coordinate_graph`, `classify_quads` | **`coord_distance_q1`** (e.g., "A(2,5) to B(2,1) — distance?") |

#### Band 221-230 (Grade 5 end / Grade 6)

| NWEA expectation | Existing | Gap |
|---|---|---|
| OA (6.EE): write/evaluate expr w/ exponents; letters for numbers; substitution; one-step + two-step equations; inequalities x>c, x<c; vary-together (table+graph+equation); independent/dependent vars | `exponents_simple`, `solve_eq_addsub`, `solve_eq_multdiv`, `solve_eq_twostep`, `evaluate_expression_hard`, `inequalities`, `function_table_easy`, `function_table_hard`, `pattern_relationship` | OK |
| NO: divide fractions by fractions; multi-digit ÷ standard algorithm; all 4 ops on decimals; GCF ≤100; LCM ≤12; positive/negative numbers; rational on number line; ratios + unit rates; double number lines/tables/tape diagrams | `div_decimal`, `gcf_easy`, `gcf_hard`, `lcm`, `compare_int`, `add_int`, `sub_int`, `tape_diagram` | **`ratio_intro`** (write a:b for a comparison); **`unit_rate_intro`** (e.g., $12 / 4 hr = $3/hr); **`double_num_line`** (visual ratio aid) |
| MD: area of triangles, special quads, polygons by composing/decomposing; volume of prism w/ fractional edges; statistical questions; dot/histogram/box plots; mean/IQR/MAD; inferences from random samples; experimental vs theoretical probability | `composite_shapes`, `volume_composite`, `mean`, `median`, `mode`, `range`, `probability_basic` | **`area_triangle`** (b×h÷2); **`area_polygon_decompose`**; **`histogram_read`** (currently no histogram skill — add) |
| G: polygons on coord plane (vertices given, find side lengths); nets → surface area; integers on horizontal+vertical number lines; cross-sections | `coordinate_q1`, `coordinate_all` | **`coord_polygon`** (plot polygon from vertices and find perimeter); **`net_surface_area`** (intro: identify net of cube/prism, find SA) |

#### Band 231+ (advanced ceiling, optional)

NWEA Math 6+ content. Out of K-5 scope but flagged for advanced 5th-graders. Existing `solve_eq_twostep`, `inequalities`, `evaluate_expression_hard`, `coordinate_all`, `mult_decimal` cover most of this. Defer additions until 6+ is in scope.

### 3.3 New skills summary (from 3.1 + 3.2)

The complete list of **new MathQuest skills** required to fully cover MAP K-5:

| Skill ID | Tier band | Domain | Rationale |
|----------|-----------|--------|-----------|
| `add_5_pictures` | <151 | OA | Sums to 5 with 3-image MC (K) |
| `sub_5_pictures` | <151 | OA | Differences to 5 with 3-image MC |
| `heavier_lighter_visual` | <151 | MD | Weight comparison MC-3 |
| `pictograph_intro` | <151 | MD | 1-to-1 picture graph for K |
| `tens_foundation_visual` | 151-160 | NO | "How many tens?" with rods |
| `bar_graph_intro` | 151-160 | MD | Single-unit bar graph K-friendly |
| `shape_corners_count` | 151-160 | G | Tap-to-count corners on solid |
| `hundreds_chart_fill` | 161-170 | NO | Click missing number on 100-chart |
| `perimeter_intro` | 161-170 | MD | Count sides for perimeter |
| `unknown_start_wp` | 171-180 | OA | Word problems with unknown start (numeric or MC) |
| `count_edges_faces_vertices` | 171-180 | G | Tap-to-count E/F/V on solid |
| `area_distributive_visual` | 201-210 | MD | Distributive area model |
| `unit_conversion_word` | 201-210 | MD | Extend unit_conversions to word problems |
| `box_plot_intro` | 211-220 | MD | Read box plot |
| `coord_distance_q1` | 211-220 | G | Distance between points w/ shared coord |
| `ratio_intro` | 221-230 | NO | Write ratio a:b |
| `unit_rate_intro` | 221-230 | NO | Calculate unit rate |
| `double_num_line` | 221-230 | NO | Double number line for ratios |
| `area_triangle` | 221-230 | MD | b×h÷2 |
| `area_polygon_decompose` | 221-230 | MD | Decompose polygon, sum areas |
| `histogram_read` | 221-230 | MD | Read histogram |
| `coord_polygon` | 221-230 | G | Polygon on coord grid + side lengths |
| `net_surface_area` | 221-230 | G | Net → SA intro |

**Total: 23 new skills.** Each gets the full registration checklist (data.js → DOMAINS, SKILLS, SKILL_GRADES, SKILL_PRINT_SIZE, SKILL_TIME_CATEGORY; gen-*.js handler; print-generate.js handler; worksheet.js card class; SVG visual where applicable).

---

## 4. Answer-mode inventory — what we have, what we need

**Source for "what MAP uses":** Build Reference Part 6, Implementation Guide Part 3, Framework "Digital Interaction Design".

The 13 MAP item types and existing MathQuest coverage (from the answer-type audit):

| # | MAP item type | Existing widget | Status | Action |
|---|---|---|---|---|
| 1 | **Multiple choice (single)** — 3-opt for K, 4-opt later | `multiple-choice`, `choice`, `symbol`, `clock-choice` | **Done** | Add `mc-image-3` variant (3 large image options) for K-2 visual MC items |
| 2 | **Multi-select (checkboxes)** — "click ALL that apply" | `odd-even-select` (skill-specific) | **Partial** | Build generic `multi-select-check` widget — checkbox grid, "X of Y selected" counter, all-or-nothing scoring |
| 3 | **Numeric entry** — type a number (often with on-screen numpad) | `number` (plain `<input>`) | **Partial** | Add **on-screen numpad** for K-2 (10 digits + backspace + submit). Accept fractions as `n/d`, decimals as `0.5` or `.5`. |
| 4 | **Inline dropdown / cloze** — sentence with `<select>` blanks | None | **Missing** | Build `cloze-dropdown` widget — text segments + inline `<button>` pills (not `<select>`, per a11y guidance) |
| 5 | **Drag-and-drop (order, categorize, match)** | `tchart-drag` (factor pairs), `divisibility-sort` (categorize) | **Partial** | Build generic `dnd-order`, `dnd-categorize`, `dnd-match` modes using dnd-kit pattern (or vanilla pointer events). Always provide click-and-click fallback. |
| 6 | **Click-and-pop / hot spot** — click region of image | `odd-even-select`, `number-line-place` (specialized) | **Partial** | Generic `hot-spot` widget — invisible SVG polygons over background image, each is `<button role="checkbox">` |
| 7 | **Hot text** — click words/digits in text | None | **Missing** | Build `hot-text` — split stem into selectable spans, toggle `aria-pressed`. Used for "click the hundreds digit", "click the error", "click all even numbers". |
| 8 | **Number line click** | `number-line-place` (tick-snap, fractions) | **Partial** | Extend to support: integer ticks, decimal ticks, negative ranges, drag (continuous w/ snap), arrow-key keyboard nav |
| 9 | **Coordinate plane click** | `coordinate-multi`, `coordinate_q1` (visual+input) | **Partial** | Extend to **click-to-plot** (snap to lattice point), multi-point, plot-and-connect for polygons |
| 10 | **Grid shade** — toggle cells in a grid | None | **Missing** | Build `grid-shade` widget — N×M `<button>` cells, click toggles fill. Used for fraction shading, array building, tile counting. |
| 11 | **Ten-frame / counter manipulative** | None | **Missing** | Build `ten-frame` — 5×2 cells, tap to fill or drag counters from tray. Aria-live count announcements. |
| 12 | **Base-10 blocks** | `svg-base10.js` (static visual) | **Partial** | Build `base-10-builder` — +/− buttons per type (units / rods / flats / cubes), lane snap, double-click rod → 10 units (regrouping) |
| 13 | **Fraction bar / area model interactive** | `area-model` (multiplication only), static fraction visuals | **Partial** | Build `fraction-bar-shade` — bar split into N parts, click to shade/unshade. Aria-live: "2 of 4 parts shaded." |
| 14 | **Interactive clock** | `svg-clock.js` (static) | **Missing** | Build `clock-set` — drag hour/minute hands or +/− buttons. Used for "set the clock to 3:45." |
| 15 | **Coin/bill builder** | None | **Missing** | Build `coin-builder` — buttons for penny/nickel/dime/quarter/dollar; running total. |
| 16 | **Draggable ruler** | `reading_ruler` (static) | **Missing (interactive)** | Build `ruler-drag` — drag a virtual ruler to align with object; companion numeric entry |
| 17 | **Bar/picture graph builder** | None | **Missing** | Build `graph-builder` — +/− per category bar; pictograph: click category to add icon |

### 4.1 Equation editor

MAP equation editor is for higher grades (RIT 211+). MathLive is overkill for K-5. **Decision: skip.** Use numeric entry + numpad with `/` for fractions and `^` only on `exponents_simple` items.

### 4.2 New widgets to build (priority order)

The Implementation Guide §3M priority matrix maps to this build order:

**P0 (must-have for MVP MAP launch):**
1. `multi-select-check` — generic checkboxes
2. `numpad-input` — on-screen K-2 numpad (overlay on `number` answerType)
3. `dnd-order`, `dnd-categorize` — generic drag-drop with click-click fallback
4. `hot-spot` — generic image-overlay regions
5. `number-line-extended` — integers/decimals/negatives/drag
6. `ten-frame` — K manipulative

**P1 (full MAP fidelity):**
7. `grid-shade` — fraction & array shading
8. `base-10-builder` — interactive blocks
9. `fraction-bar-shade` — partition + shade
10. `clock-set` — drag hands
11. `coord-plot` — click-to-plot (extend coordinate widget)
12. `hot-text` — click words/digits

**P2 (nice-to-have):**
13. `cloze-dropdown` — inline dropdowns
14. `coin-builder`, `ruler-drag` — measurement manipulatives
15. `graph-builder` — bar/picture builder

### 4.3 Print versions of new answer modes

Per "every MAP skill must have a paper version", every new widget must have a paper analog. Print formats:

| Widget | Print analog |
|---|---|
| `multi-select-check` | "Circle ALL that apply: ☐ ☐ ☐ ☐" — empty boxes |
| `numpad-input` | Standard answer blank `_____` |
| `dnd-order` | "Number these from least to greatest: 1=___ 2=___ 3=___ 4=___" |
| `dnd-categorize` | Two boxes labeled "Even" / "Odd" with blank lines |
| `hot-spot` | "Circle the ___" on a printed image |
| `number-line-extended` | Number line + arrow to draw a mark |
| `ten-frame` | Empty ten frame to color in |
| `grid-shade` | Grid to shade with pencil |
| `base-10-builder` | "Draw the blocks" or "Show with ⏑ rods and . units" |
| `fraction-bar-shade` | Pre-partitioned bar to shade |
| `clock-set` | Empty clock face to draw hands on |
| `coord-plot` | Coord grid to plot points on |
| `hot-text` | "Underline the ___" |
| `coin-builder` | "Draw the coins to make $___" |
| `ruler-drag` | Static ruler image; student measures and writes |
| `graph-builder` | Empty axes to draw bars on |

All these use the existing `print-generate.js` infrastructure — most fall under existing print formats (`fraction-shade`, `grid-shade`, `clock-blank`, `coord-grid`). Where a format is missing, add it to `PRINT_FORMAT_SIZE` in `data.js` and add a handler in `print-generate.js`.

---

## 5. RIT-band → skill mapping table (data.js additions)

Add these constants near the bottom of `data.js`:

```js
// RIT band → list of skill IDs eligible for that band (K-2 pool)
export const RIT_BAND_SKILLS_K2 = {
  '141-150': ['count_objects','count_sequence','compare_groups','compare_objects','classify_count',
              'add_5_pictures','sub_5_pictures','number_bonds','make_ten',
              'name_2d_shapes','name_3d_shapes','shape_positions',
              'heavier_lighter_visual','pictograph_intro'],
  '151-160': ['add_10_no_regroup','sub_10_no_regroup','add_10_mixed','sub_10_mixed',
              'teen_compose','number_bonds','more_less_10','tens_foundation_visual',
              'measure_nonstandard','bar_graph_intro','partition_shapes','shape_corners_count',
              'compose_shapes'],
  '161-170': ['add_facts','sub_facts','add_20_mixed','sub_20_mixed','missing_add_sub','equal_sign',
              'add_sub_fact_family','add_three',
              'add_50_no_regroup','sub_50_no_regroup','add_100_no_regroup','sub_100_no_regroup',
              'more_less_100','seq_5','seq_10','skip_count_grid','hundreds_chart_fill',
              'time_hour','time_half_hour','money_count','perimeter_intro',
              'partition_shapes','compose_shapes','shape_attributes'],
  '171-180': ['add_wp_20','sub_wp_20','add_wp_20_plain','sub_wp_20_plain',
              'add_100_regroup','sub_100_regroup','add_100_mixed','sub_100_mixed',
              'nearest_10','compare','compare_objects','unknown_start_wp',
              'estimate_sum','estimate_diff',
              'time_5min','time_quarter','money','reading_ruler',
              'count_edges_faces_vertices','partition_shapes'],
  '181-190': ['mult_facts','arrays_groups','dot_array_mult','mult_div_fact_family',
              'place_value_disks','expand','combine','more_less_100',
              'fractions:identify','fraction_of_set',
              'area_unit_squares','line_plot','elapsed_30min','bar_graph','pictograph','tally_chart',
              'classify_quads','partition_shapes'],
  '191-200': ['mult_word_problems','mult_word_problems_plain','arrays_groups',
              'multi_step_word','multi_step_word_plain','number_pattern',
              'nearest_10','nearest_100','add_1k_mixed',
              'fraction_number_line','fractions:compare','equiv_frac_visual',
              'time_1min','money','area_unit_squares',
              'classify_quads','partition_shapes'],
  '201-210': ['div_facts','divide','mult_div_fact_family','missing_mult_div',
              'sub_1k_mixed','order_frac_numline','equivalent','equiv_frac_visual',
              'area_perimeter','composite_shapes','area_distributive_visual','area_model_mult',
              'unit_conversions','unit_conversion_word'],
  '211-220': ['simplify','equivalent','classify_quads','missing_mult_div'],
};

// 3-5 pool (extend down into K-2 ceiling)
export const RIT_BAND_SKILLS_35 = {
  '181-190': RIT_BAND_SKILLS_K2['181-190'],   // shared floor
  '191-200': RIT_BAND_SKILLS_K2['191-200'],
  '201-210': [
    ...RIT_BAND_SKILLS_K2['201-210'],
    'number_pattern','prime_composite','factors_identify','multiples','factor_tchart_easy',
    'place_value_disks','nearest_1000','multiply','area_model_mult',
    'f_to_d','compare_decimal',
    'measure_angles','identify_angles','identify_lines','classify_triangles','symmetry',
    'line_plot_fractions','mean','median','mode','range'
  ],
  '211-220': ['oop_easy','oop_medium','paren_simple','paren_multi','pattern_relationship',
              'coordinate_q1','coordinate_graph',
              'place_value_10x','add_decimal','sub_decimal','mult_decimal',
              'area_model_mult_hard','long_div_2digit',
              'add_frac_unlike','sub_frac_unlike','add_mixed_unlike','sub_mixed_unlike',
              'frac_as_division','mult_frac_frac','div_unit_fraction','mult_scaling','improper_mixed',
              'unit_conversions','unit_conversion_word','volume','volume_composite',
              'line_plot_fractions','box_plot_intro',
              'classify_quads','coord_distance_q1'],
  '221-230': ['exponents_simple','solve_eq_addsub','solve_eq_multdiv','solve_eq_twostep',
              'evaluate_expression_hard','inequalities','function_table_easy','function_table_hard',
              'pattern_relationship',
              'div_decimal','gcf_easy','gcf_hard','lcm',
              'compare_int','add_int','sub_int','tape_diagram',
              'ratio_intro','unit_rate_intro','double_num_line',
              'composite_shapes','volume_composite',
              'area_triangle','area_polygon_decompose',
              'mean','median','mode','range','histogram_read','probability_basic',
              'coord_polygon','net_surface_area','coordinate_q1','coordinate_all'],
  '231+': ['solve_eq_twostep','inequalities','evaluate_expression_hard',
           'coordinate_all','mult_decimal','div_decimal','probability_basic'],
};

// Domain → list of MathQuest categories
export const MAP_DOMAIN_CATEGORIES = {
  OA: ['addition','subtraction','multiplication','division','number_ops_mixed',
       'patterns','algebra','order_of_operations'],
  NO: ['counting','comparing','composing','placevalue','number_sense','number_theory',
       'fractions','fraction_operations','decimals','conversions','integers'],
  MD: ['measurement','area_perimeter','graphs','data_analysis','probability'],
  G:  ['shapes_early','angles_lines','shapes_classify','coordinates'],
};

// Per-skill MAP domain (skills can belong to one domain only here)
// Built by reverse lookup over MAP_DOMAIN_CATEGORIES + getCategoryForSkill.
export function getMapDomain(skillId) {
  const cat = getCategoryForSkill(skillId);
  for (const [d, cats] of Object.entries(MAP_DOMAIN_CATEGORIES)) {
    if (cats.includes(cat)) return d;
  }
  return null;
}
```

---

## 6. Adaptive engine

### 6.1 Algorithm (simplified Rasch)

Each skill in the pool has a **band midpoint** (e.g., a skill in `181-190` has b=185). The engine:

```
1. Initialize: currentRit = mean of selected bands  (e.g., 185 if user picked 181-190)
              correctStreak = 0; incorrectStreak = 0
              perDomainItems = { OA: 0, NO: 0, MD: 0, G: 0 }

2. For each item slot in the session:
   a. Pick target b ≈ currentRit - 0.85 logits (≈ 70% expected correct)
      In RIT terms: target = currentRit - 4
   b. Among skills whose [bandLow,bandHigh] ∩ [target-5, target+5] ≠ ∅:
        filter by selectedDomains
        filter by allowedTier (K-2 or 3-5 pool)
        prefer the under-represented domain (rotate)
        randomesque: pick one of top 3-5 closest
   c. Generate the question via existing generateQuestion(skill, ...)
   d. Show item, capture response
   e. Update:
        if correct:  currentRit += 3 + Math.min(correctStreak, 5)        // +3..+8
                     correctStreak++; incorrectStreak = 0
        else:        currentRit -= 3 + Math.min(incorrectStreak, 5)     // -3..-8
                     incorrectStreak++; correctStreak = 0
        perDomainItems[domain]++
        perDomainCorrect[domain] += correct ? 1 : 0
        history.push({skillId, domain, b: itemMidpoint, correct, ritBefore, ritAfter})

3. Stopping:
   - Items completed >= sessionLength, OR
   - Time elapsed >= timeCap (if set), OR
   - Min 2 items per selected domain (defer stop until met)

4. Final RIT: information-weighted average of last 8 items' currentRit
   SE estimate: 10 / sqrt(itemsCompleted)  // rough; report as RIT ± SE
   Per-domain RIT: average ritBefore for that domain's items
```

### 6.2 State fields (`state.js` additions)

```js
// MAP mode (added to state object)
mapMode: false,
mapTier: null,                  // 'k2' | '35'
mapSessionMode: null,           // 'simulation' | 'practice'
mapSelectedBands: [],           // ['181-190', '191-200', ...]
mapSelectedDomains: [],         // ['OA','NO','MD','G']
mapItemCount: 0,
mapItemCountTarget: 20,
mapCurrentRit: 170,
mapCorrectStreak: 0,
mapIncorrectStreak: 0,
mapPerDomainItems: { OA:0, NO:0, MD:0, G:0 },
mapPerDomainCorrect: { OA:0, NO:0, MD:0, G:0 },
mapPerDomainRitSum: { OA:0, NO:0, MD:0, G:0 },
mapHistory: [],                 // per-item record
mapStartedAt: null,
mapEndedAt: null,
mapTimeCapMs: 0,                // 0 = no cap
```

### 6.3 New module: `js/modules/map-engine.js`

Single file, exports:

* `startMapSession({tier, mode, bands, domains, itemCount, timeCap})` — sets state, kicks off `nextMapItem()`.
* `nextMapItem()` — chooses next item per algorithm above, calls `generateQuestion(skill,...)`, hands off to `renderQuestion()`.
* `recordMapAnswer({correct})` — updates RIT estimate, triggers next item or finalize.
* `finalizeMapSession()` — computes final RIT, per-domain breakdown, writes results to `state.lastMapResult`, calls `showView('mapResultsView')`.

Reuses (no changes needed):
* `generateQuestion()` from `generate-question.js`
* `renderQuestion()` from `question-render.js`
* `submitAnswer()` / `checkAnswer()` from `answer-check.js` — but Simulation mode bypasses feedback display.

---

## 7. Views, HTML, and CSS

### 7.1 New views in `index.html`

Add after the `quizResultsView` block:

```html
<!-- MAP Selector — choose K-2 or 3-5, bands, domains, mode -->
<div class="view" id="mapSelectorView">
  <header class="map-header">
    <button class="back-btn" onclick="goHome()">← Home</button>
    <h2>MAP Practice</h2>
  </header>
  <section class="map-tier-picker">
    <button class="map-tier-card map-tier-k2" onclick="selectMapTier('k2')">
      <div class="tier-icon">🅰</div>
      <div class="tier-title">K-2 MAP</div>
      <div class="tier-sub">Audio + visuals · RIT 141-220</div>
    </button>
    <button class="map-tier-card map-tier-35" onclick="selectMapTier('35')">
      <div class="tier-icon">🅱</div>
      <div class="tier-title">3-5 MAP</div>
      <div class="tier-sub">Multi-step · RIT 181-230</div>
    </button>
  </section>
  <section id="mapBandPicker" class="map-section" hidden>...</section>
  <section id="mapDomainPicker" class="map-section" hidden>...</section>
  <section id="mapModePicker" class="map-section" hidden>...</section>
  <button id="mapStartBtn" class="primary-btn" onclick="startMapFromUI()" hidden>Start</button>
</div>

<!-- MAP Session — adaptive, looks like gameView but with map-specific banner -->
<div class="view" id="mapSessionView">
  <div class="map-session-banner">
    <div>Item <span id="mapItemNum">1</span> of <span id="mapItemTotal">20</span></div>
    <div class="domain-rotation">OA · NO · MD · G</div>
    <div class="map-mode-tag" id="mapModeTag">SIMULATION</div>
  </div>
  <div id="mapQuestionContainer"><!-- renderQuestion injects here --></div>
  <!-- No back/skip buttons (faithful to MAP) -->
</div>

<!-- MAP Results — RIT report + Ready-to-Learn -->
<div class="view" id="mapResultsView">
  <header><button class="back-btn" onclick="goHome()">← Home</button></header>
  <section class="rit-summary">
    <div class="rit-overall">
      <div class="rit-label">Estimated RIT</div>
      <div class="rit-value" id="mapFinalRit">--</div>
      <div class="rit-band" id="mapFinalSE">± --</div>
    </div>
    <div class="rit-domains" id="mapPerDomain"><!-- 4 cards --></div>
  </section>
  <section class="rit-ready">
    <h3>Ready to Learn</h3>
    <div id="mapReadyToLearn"><!-- 3 columns: Reinforce / Develop / Introduce --></div>
  </section>
  <section class="rit-actions">
    <button class="primary-btn" onclick="printMapSession()">🖨 Print this session as worksheet</button>
    <button class="secondary-btn" onclick="restartMapSession()">Try another session</button>
    <button class="secondary-btn" onclick="goHome()">Home</button>
  </section>
</div>
```

### 7.2 Home-view entries (`index.html` ~line 690)

Add to `.start-buttons-container`:

```html
<button class="map-launch-btn map-launch-k2" onclick="openMapTest('k2')">
  📊 MAP K-2
</button>
<button class="map-launch-btn map-launch-35" onclick="openMapTest('35')">
  📊 MAP 3-5
</button>
```

(`openMapTest(tier)` → sets `state.mapTier=tier`, calls `showView('mapSelectorView')`, skips the tier picker step.)

### 7.3 New CSS file: `css/map-mode.css`

Add `<link rel="stylesheet" href="css/map-mode.css">` to `index.html` head.

Defines:
* `.map-launch-btn`, `.map-launch-k2` (cyan→orange gradient), `.map-launch-35` (red→purple gradient)
* `.map-tier-card` — large hero cards
* `.rit-chip` — selectable chip with band label + count
* `.domain-chip` — selectable chip with domain badge color
* `.map-session-banner` — bar shown above item, with item counter and domain dots
* `.rit-overall`, `.rit-value` — large central RIT display
* `.rit-domains` — 4-column grid of domain cards with color-coded confidence bands
* `.rit-ready` — three-column grid (Reinforce / Develop / Introduce)
* `.map-mode-tag` — Simulation/Practice badge

Follows the visual grammar from `quiz-mode.css` and `skills-organizer.css`.

---

## 8. Universal-features context (accessibility)

Add a single global object `state.mapFeatures` reused by every MAP item renderer:

```js
mapFeatures: {
  ttsEnabled: state.ttsEnabled,            // already in state
  audioAutoPlay: false,                    // K-2 default true
  largeTargets: false,                     // K-2 default true (≥56px hit boxes)
  highContrast: 'default',
  fontScale: 1.0,
  reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  clickClickOnly: false,                   // disable native drag, force click-source-then-click-target
  numpadOnly: false,                       // K-2 default true (no QWERTY)
  answerEliminator: false,                 // strikethrough MC options (toggle in session)
  scratchpadOpen: false,
  calculatorEnabled: false,                // only if item.calculator === true
  language: 'en',
}
```

K-2 defaults: `audioAutoPlay`, `largeTargets`, `numpadOnly` all on. 3-5 defaults: all off.

The session banner exposes a small "♿ Tools" button that opens a panel for toggles (TTS, font scale, reduce motion, click-only, numpad). Persist toggles per user via cookie (`mathquest_map_features`).

---

## 9. Print / paper integration

### 9.1 New skills' print versions

Every new skill in §3.3 gets:
1. `SKILL_PRINT_SIZE[id] = 'compact' | 'standard' | 'medium' | 'wide' | 'spacious'` (per CLAUDE.md decision rules)
2. A `printFormat` value emitted by its generator
3. A handler in `print-generate.js` if the visual is non-standard
4. A card class in `worksheet.js` (`card-simple` / `card-medium-visual` / etc.)

Example for `area_distributive_visual`: `printFormat: 'area-distributive', SKILL_PRINT_SIZE: 'medium'`. New handler in `print-generate.js` renders the rectangle split with "Part 1: ___ × ___ = ___" "Part 2: ___ × ___ = ___" "Total: ___".

### 9.2 Print a MAP session as a worksheet

On the results screen, "🖨 Print this session as worksheet" calls a new helper in `js/modules/print-settings.js`:

```js
export function printMapSessionAsWorksheet(sessionHistory) {
  // 1. Take all unique skillIds the user encountered
  // 2. Build window.printSections — one section per domain
  // 3. Each section: 6 problems per skill, weighted by difficulty
  // 4. Open print preview
}
```

This produces a printable practice worksheet of just-finished MAP content — high value for at-home reinforcement.

### 9.3 Print a MAP-style "mock test" worksheet

Add a separate entry on the home view (or inside the MAP selector) — "Print a MAP-Style Practice Test." Uses the same selector (tier + bands + domains) but skips the session and goes directly to a printable worksheet of 25-40 problems matching the selection. Sequenced by domain (OA → NO → MD → G), 2-column layout.

This satisfies the user requirement that paper versions exist for every MAP skill — and lets teachers hand out MAP-style packets without device access.

---

## 10. Phased implementation plan

Each phase is a discrete PR-sized chunk. Each ends with a working, syntax-checked, smoke-tested build.

### Phase 1: scaffolding & data (no UI yet)

1. Add `RIT_BAND_SKILLS_K2`, `RIT_BAND_SKILLS_35`, `MAP_DOMAIN_CATEGORIES`, `getMapDomain()` to `data.js`.
2. Add MAP state fields to `state.js`.
3. Create empty modules: `map-engine.js`, `map-mode-ui.js`, `map-results.js`.
4. Add `<link>` for `css/map-mode.css`.
5. Add empty home buttons (visible only with `?map=1` URL flag for now).
6. Add empty views (`mapSelectorView`, `mapSessionView`, `mapResultsView`) in `index.html`.
7. Wire `showView()` cases.

**Verification:** `node --input-type=module --check < data.js` etc.; visit `?map=1`, click MAP K-2, see the empty selector view.

### Phase 2: selector UI

1. Render tier card (skip when launched with explicit tier).
2. Render band-chip grid; chip click toggles `state.mapSelectedBands`; live count of matching skills.
3. Render domain-chip grid same way.
4. Render mode toggle (Simulation/Practice).
5. Render item-count slider (5-43, default 20 / 25).
6. "Start" button enabled when ≥1 band + ≥1 domain selected.

**Verification:** Click through full selector; counts match expected (eyeball against the band tables in §3).

### Phase 3: adaptive engine (no new widgets yet)

1. Implement `startMapSession()` and `nextMapItem()` in `map-engine.js`.
2. Reuse existing `generateQuestion()` and `renderQuestion()` to display items in `mapSessionView`.
3. Hook `recordMapAnswer()` into the existing `submitAnswer()` flow via a `state.mapMode` branch.
4. Implement `finalizeMapSession()` and the basic results view (RIT number + per-domain bars).
5. Disable hints, feedback, retry in Simulation mode.

**Verification:** Run a 10-item session in each tier with all bands+domains selected; confirm: items rotate domains, RIT moves up/down, results show plausible RIT ± SE, per-domain RIT non-zero where attempted.

### Phase 4: P0 widgets (six new answer modes)

In order:

1. `multi-select-check` — generic; replace `odd-even-select` with this when possible
2. `numpad-input` — K-2 numpad overlay on `number` items
3. `dnd-order` and `dnd-categorize` — generic drag-drop with click-click fallback
4. `hot-spot` — image overlay
5. `number-line-extended` — drag, integers, decimals, negatives
6. `ten-frame` — K manipulative

For each: build widget → integrate into `question-render.js` answerType branch → add to `answer-check.js` → add print analog → write test items in MAP mode.

### Phase 5: New skills (23 from §3.3)

Implement in this order (band-low → band-high) so each phase ends with a runnable session at that band:

* Band <151: `add_5_pictures`, `sub_5_pictures`, `heavier_lighter_visual`, `pictograph_intro`
* Band 151-160: `tens_foundation_visual`, `bar_graph_intro`, `shape_corners_count`
* Band 161-170: `hundreds_chart_fill`, `perimeter_intro`
* Band 171-180: `unknown_start_wp`, `count_edges_faces_vertices`
* Band 201-210: `area_distributive_visual`, `unit_conversion_word`
* Band 211-220: `box_plot_intro`, `coord_distance_q1`
* Band 221-230: `ratio_intro`, `unit_rate_intro`, `double_num_line`, `area_triangle`, `area_polygon_decompose`, `histogram_read`, `coord_polygon`, `net_surface_area`

Each new skill requires the full registration checklist (data.js × 4 places, gen-*.js, print-generate.js, worksheet.js).

### Phase 6: P1 widgets

Build `grid-shade`, `base-10-builder`, `fraction-bar-shade`, `clock-set`, `coord-plot`, `hot-text`. Re-skin existing skills to use them where they improve fidelity (e.g., `partition_shapes` → `fraction-bar-shade`; `time_*` skills → `clock-set` for "set the clock" variants).

### Phase 7: Universal features panel

Build the `mapFeatures` toggles panel + persistence cookie. Verify K-2 defaults (audio, large targets, numpad) all activate correctly.

### Phase 8: Results & "Ready to Learn" panel

* Implement Reinforce / Develop / Introduce skill cards on the results view (each card → click to push that skill onto `window.skillQueue` for follow-up practice).
* Implement "🖨 Print this session as worksheet" using `printMapSessionAsWorksheet()`.
* Implement "Print a MAP-Style Practice Test" entry on home/selector.

### Phase 9: P2 widgets (optional polish)

Build `cloze-dropdown`, `coin-builder`, `ruler-drag`, `graph-builder`. Most coverage of band 201+ MD/G skills.

### Phase 10: QA pass

* Run a full 25-item session at each tier, all bands.
* Validate that every new skill renders, accepts an answer, scores correctly, prints correctly.
* Validate accessibility (keyboard-only, TTS on, reduce-motion on, large-target mode).
* Confirm cross-tier crossover prompts trigger correctly (K-2 → suggest 3-5 if RIT ≥ 200; vice versa if ≤ 170).

---

## 11. File-by-file summary of changes

### New files (12)

| Path | Purpose |
|------|---------|
| `css/map-mode.css` | All MAP-specific styling |
| `js/modules/map-engine.js` | Adaptive item-selection engine + state machine |
| `js/modules/map-mode-ui.js` | Selector view rendering, chip interactions |
| `js/modules/map-results.js` | Results report + Ready-to-Learn |
| `js/modules/widgets/multi-select-check.js` | P0 widget |
| `js/modules/widgets/numpad-input.js` | P0 widget |
| `js/modules/widgets/dnd-generic.js` | P0 — drag-drop with click-click |
| `js/modules/widgets/hot-spot.js` | P0 widget |
| `js/modules/widgets/number-line-extended.js` | P0 widget (replaces tick-only) |
| `js/modules/widgets/ten-frame.js` | P0 widget |
| `js/modules/widgets/grid-shade.js` | P1 widget |
| `js/modules/widgets/base-10-builder.js` | P1 widget |
| `js/modules/widgets/fraction-bar-shade.js` | P1 widget |
| `js/modules/widgets/clock-set.js` | P1 widget |
| `js/modules/widgets/coord-plot.js` | P1 widget |
| `js/modules/widgets/hot-text.js` | P1 widget |

(P2 widgets later: `cloze-dropdown.js`, `coin-builder.js`, `ruler-drag.js`, `graph-builder.js`.)

### Edited files

| Path | Change |
|------|--------|
| `index.html` | + 2 home buttons, 3 new view divs, 1 new CSS link |
| `js/modules/state.js` | + ~15 MAP state fields + `mapFeatures` object |
| `js/modules/data.js` | + RIT band tables, domain tables, getMapDomain helper, + 23 new skill entries × 4 tables (DOMAINS/SKILLS/SKILL_GRADES/SKILL_PRINT_SIZE/SKILL_TIME_CATEGORY) |
| `js/modules/navigation.js` | + 3 view-init branches |
| `js/modules/globals.js` | + import all new modules + Object.assign(window, ...) for new functions |
| `js/modules/question-render.js` | + answerType branches for each new widget |
| `js/modules/answer-check.js` | + scoring for new answerTypes; + `state.mapMode` branch in `submitAnswer` |
| `js/modules/generate-question.js` | + routing for new skills |
| `js/modules/gen-counting.js`, `gen-operations.js`, `gen-fractions.js`, `gen-geometry.js`, `gen-measurement.js`, `gen-data-stats.js`, `gen-algebraic.js`, `gen-number-theory.js` | + generators for each new skill in their domain |
| `js/modules/print-settings.js` | + `printMapSessionAsWorksheet()`, + "Print MAP-Style Test" handler |
| `js/modules/print-generate.js` | + handlers for each new printFormat |
| `js/modules/worksheet.js` | + new visual skill IDs in `newVisualSkillFormats` and `wideVisualFormats` arrays (both occurrences) |

---

## 12. Open questions for Tim

Before I start implementing, please confirm:

1. **Branding.** OK with the names "MAP Practice K-2" and "MAP Practice 3-5" on the home view? (NWEA owns "MAP" — for a public-facing app you may want "MAP-Style Practice" to avoid trademark issues. For an internal/personal-use deployment it's fine.)
2. **Initial RIT seeding.** Should we (a) ask the user to enter a previous RIT, (b) infer from enrolled grade + season using 2020/2025 norms, or (c) always start at the band midpoint of the user's selected bands? Recommend (b) with (c) as fallback.
3. **Calculator policy.** I currently propose: never in K-2; in 3-5, only on items tagged `calculator: true` (RIT 211+ Grade-6-standard). Confirm. (Default policy matches NWEA's actual rule per Framework §"Calculator Availability".)
4. **Audio.** K-2 must auto-read items. Are we OK using Web Speech API (browser TTS) by default, with a future upgrade path to pre-recorded audio per item? Pre-recorded is dramatically better but requires a substantial recording effort.
5. **Skill order in band tables.** Have I assigned each skill to the right band? Take a quick eyeball pass on §3.1 and §3.2 — corrections are cheap now, expensive later.
6. **Phase 4 scope.** Phase 4 (P0 widgets) is the biggest piece of work — about 1-2 weeks of focused effort. Do you want me to implement it as a single PR or split it widget-by-widget?
7. **Print-test entry point.** Do you want "Print a MAP-Style Practice Test" as (a) its own home button, (b) a section in the existing Print dialog, or (c) only accessible from the MAP selector?

Once you confirm or adjust, I'll begin Phase 1.
