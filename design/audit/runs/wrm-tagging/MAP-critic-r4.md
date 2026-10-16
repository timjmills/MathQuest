# MAP Growth builds audit: independent critic, round 4 (2026-10-10)

What I graded: `data/curriculum/links/MAP.json` (261 rows, 105 proposals: 39 new and 66 reused, plus `regrades`) and
`MAP-report.md`, against `MAP-BRIEF.md`, `BRIEF.md` (proposal shape), CLAUDE.md ("A skill's NAME is its declaration") and the
round-1 to round-3 critic reports.

How I checked it:
- **Structure.**
  - `map-parts/merge.cjs` runs clean (`MAP merge: OK`).
  - My own checks: 0 partial or missing rows lack `proposal` or `closes`, and 0 new proposals lack problemTypes, levels,
    example, misconceptions, representation, ccss or map. No task text is duplicated.
  - 201 rows carry a URL, which matches the report. The kind and source counts match the report (option 65, new 37, band 1,
    repair 2; new 39, reused 66).
  - **Every reused proposal is verbatim from its source.** I compared every key against the live `WRM_PROPOSALS`,
    `STANDARD_PROPOSALS` and `VISUAL_BUILDS`: 0 differences.
- **Items generated.**
  - I ran `ws-sample-items.cjs` on 147 skills (n = 8) for the sampled rows. I added option-aware runs (`--opts`, e.g. fractions:compare
    `forms:[2]`) and n = 60–80 sweeps where a row says "never dealt": change-unknown, smaller-unknown and money.
  - I read `skill-options.txt` for every host I judged, and read the generator source where a skill's visual matters,
    because `ws-sample-items` prints text only: `decompose_fractions`, `volume`, `volume_composite` and `create3DBoxSVG`.
- **Labels.** I grepped all 610 SKILLS labels by keyword for every sampled missing or partial row (decimal, grid, tenths, ratio,
  tally, table, graph, money, length, measure, ordinal, zero, three, triangle, ray, horizontal, compose, solid, ten).
- **Reuse.** I grepped `wrm.js` and `build-list.js` (STANDARD_PROPOSALS, WRM_EXTENSIONS, VISUAL_BUILDS) for every new proposal I sampled.

## Scores

| Criterion | Score | Why |
|---|---|---|
| 1. Status correctness | **8** | Every round-3 status defect is fixed, and the notes now cite option values. In a fresh 124-row sample, one status is wrong (#159, D-1) and #108 overstates its residual. Both come from one root cause: the sampler prints only `q.text`, and the model is in `q.visual`. #117 is borderline. |
| 2. Real MAP task types / evidence | **8** | The task types are real. The brochure items, chart items and DesCartes statements are cited correctly on the rows I checked. A few rows cite a statement that does not show the row's own task (D-8). |
| 3. Proposal quality | **7** | The specs are complete and consistently good: one-change ladders, structural vs hint scaffolds, production screen modes and real misconceptions. But three defect classes from round 3 recur in the proposals I sampled. One proposal again rebuilds a live skill (D-1, the same proposal as round-3 D-5). Two duplicate an existing build-list entry (D-2). Four put content on a host whose NAME does not cover it (D-3). Each fix is small, but it is the same class again, so it counts as systematic. |
| 4. Completeness and report quality | **8** | The report is generated and its counts are right. The 6.2 table, strand walk, 6.4 audit, regrades, full specs, bugs and owner questions are all there. Round-3 D-9 is closed (#259, #260). Small hygiene nits remain (D-7). I found no missing K-5 MAP task type that would matter. |
| **Overall (minimum)** | **7 — FAIL** (pass is 8 or more) | |

## Earlier-defect check (rounds 1–3)

| Defect | Fixed? | Evidence today |
|---|---|---|
| R1 D1–D11, R2 D1–D11 | Yes | Still in place, as round 3 confirmed: #34 start-unknown, #46 rule, #72/#80 split, the 6.4 pairs, the regrades map and the report counts. |
| R3 D-1a (#147 nl_mult `response: sentence`) | Yes | #147 is `exists-ok` (nl_mult and nl_div). `map_nl_hops_equation` is deleted. Residue: the `why` of `map_nl_jumps_equation_addsub` still names it (D-7). |
| R3 D-1b (#136 powers of ten) | Yes | #136 is `partial` → reused `pv10_exponents`. `map_power10_exponent` is deleted. |
| R3 D-2 (#74 vs #144, #241 vs #252, #197) | Yes | #74 and #144 are both `partial`. #241 is `partial` → `make_line_plot` (mapClause total/difference). #197 is `partial` → reused `time_units`. |
| R3 D-3 (decimal place value duplicates) | Yes | #129 → `dec_pv_within1`. #160 and #161 → `thousandths_pv` (mapClause holds the screen forms). The two new options and the `decimal_pv` mapClause are gone. Nit: the host skill's own proposal `decimal_pv` is not in MAP.json (D-7). |
| R3 D-4 (name: area_equation, equal_frac_build) | Yes | `map_area_equation` is on `area_perimeter` ("Area AND Perimeter"). `map_equal_frac_build` is on `improper_mixed` and has mixed-number targets only. |
| R3 D-5 (#108 `compose_target_frac`) | Partly | `compose_target_frac` and `compose_whole` are now listed on #108 and #159. But `map_frac_unit_build`'s remaining "model → sum" type is **also live** in `decompose_fractions` (D-1). |
| R3 D-6 (#94, #72 skill lists) | Yes | #94 lists `mult_placeholder_zero` and `mult_missing_digit`. #72 lists `div_word_problems`, and `closes` says "from a picture". |
| R3 D-7 (story option overlap) | Yes | `map_story_equation_addsub` sends fraction stories to `_frac`. |
| R3 D-8 (stale notes, family, id) | Yes | #152, #165 and #253 are fixed. Families are fixed. The id is renamed to `map_compare_smaller_unknown`. New stale items are listed in D-7. |
| R3 D-9 (two task types) | Yes | #259 (2.MD.A.2) → reused `measure_two_units`. #260 (1.G.A.2) → `map_compose_solids`. |
| R3 D-10 (evidence #170, #202, #227) | Yes | All three now say "not found; kept because <CCSS>". |

## Sample table

There are 124 rows: all 29 Wave 6.2 rows plus 95 others from all seven strands and all four statuses (most not sampled in round 3).
OK means agreed; X means a defect, with its number from the list below. Rows that were OK with nothing to note are grouped at the end.

| # | Row task | Status | Verdict | What I sampled / checked |
|---|---|---|---|---|
| 0 | One-step equations | exists-regrade | OK | solve_eq_addsub "a − 3 = 36" plus yes/no bins; solve_unknown click-all. |
| 1 | Order whole + decimals mixed | partial | OK | order_decimals decimal-only. Also checked ordering_rationals and order_fdp: no whole numbers. |
| 2 | Pick the lesser / greater | partial | OK (proposal nit, D-6) | compare: symbol only. |
| 3 | >, <, = | exists-regrade | OK | "Compare: 722 ___ 892". |
| 4 | Compare expressions without computing | partial | OK | compare_expressions evaluates both sides. |
| 5 | Order of operations | exists-regrade | OK | paren_simple / oop_medium. |
| 6 | Multi-digit addition | exists-regrade | OK | Column stacks. |
| 7 | Base-ten model → number | exists-regrade | OK | place_value_disks read; base10_build. |
| 8 | Two-step change problems | exists-regrade | OK / X (D-7) | All four patterns dealt. The note names the deleted `map_change_patterns`. |
| 71 | Ratios from pictures | partial | OK | ratio_intro forms 0/1/2 are text only. |
| 72 | Share N among M | partial | OK | Partitive sharing in words is live in div_word_problems; the residual is "from a picture". |
| 73 | Division by making groups (drag) | partial | OK | Number entry only. |
| 74 | Picture ↔ × equation | partial | OK | arrays_groups sentence frame. |
| 75 | Compare / order decimals | exists-regrade | OK | Choice, drag order, click-all. |
| 76 | Fraction × with models | exists-regrade | OK | frac-model, bins, click-all. |
| 77 | Adding decimals | exists-regrade | OK | col-arith. |
| 78 | Equal groups total | exists-regrade | OK | arrays_groups / mult_word_problems. |
| 162 | Symmetry: compare two shapes | partial | OK | One shape per item in every form. |
| 163 | Symmetry: is this line correct? | partial | OK | Click-all lines; no single yes/no line. |
| 164 | Area: pick picture with area N | partial | OK | One shape per item. |
| 165 | Nets | exists-regrade | OK | net_identify A–D. |
| 166 | Missing angle in a triangle | missing | OK | Grep "triangle": classify_triangles and area_triangle only. |
| 167 | Volume by unit cubes | partial | OK | create3DBoxSVG draws no cubes (source read). |
| 168 | Perimeter | exists-regrade | OK | perimeter, perimeter_grid, perimeter_intro. |
| 169 | Reading clocks | exists-ok | OK | Kit clock; write, draw and match. |
| 170 | Minutes → hours | partial | OK (proposal nit, D-6) | Every time item is large → small. Evidence is now "not found". |
| 171 | Line / dot plots | exists-regrade | OK | Read only; the build is in #240. |
| 172 | Ordering times | exists-ok | OK | Clocks 1-2-3; time line. |
| 173 | Coordinate point in context | missing | OK | Abstract points only. |
| 11 | Zero as a count | missing | OK | count_objects counts 2–20. |
| 12 | Ordinal positions | missing | OK | Grep "ordinal / first": none. |
| 18 | Value of a digit | exists-ok | OK | value / identify. |
| 19 | Ten times the digit to the right | missing | OK | value forms value / unit / notation: one digit at a time. |
| 21 | Word form ↔ number to millions | partial | OK | pv_digit_drag `source=word` to 999,999; number_word_names MC. `big_numbers` widens both. |
| 27 | Read a number on a number line | partial | OK | place_on_number_line taps only. |
| 35 | Change-unknown stories | partial | OK | add/sub_word_problems n = 80: start-unknown and "wants … needs" only. |
| 37 | Compare: bigger / smaller unknown | partial | OK | n = 60 on 4 skills: 0 "fewer than" with the smaller unknown. |
| 38 | Part-whole, both unknown | partial | OK | number_bonds: one part always given. |
| 43 | Property of addition / equivalent sum | missing | OK (proposal X, D-3) | No live form. |
| 46 | Find the rule | exists-regrade | OK | function_table_hard `ftTask` rule. |
| 53 | Inequalities | exists-regrade | OK | True/false, bins, drag a marker. The residual proposal is attached. |
| 58 | Match model ↔ number (base ten) | partial | OK | One model at a time. |
| 61 | Number line ↔ +/− equation | partial | OK | Equation always given (ticks options). |
| 64 | Table ↔ rule | partial | OK | Bare In/Out tables. |
| 68 | Number from unit words | partial | OK | unit_form goes number → units only. |
| 80 | Make equal groups (K-2) | partial | OK | Grouping is live; sharing into plates is not. |
| 81 | Repeated addition ↔ × | exists-regrade | OK | Equation printed; the pupil computes. |
| 86 | Properties of × | exists-regrade | OK | forms 0–3, number entry. |
| 91 | Times as many | exists-regrade | OK | Compute only. |
| 104 | Multiply three numbers | missing | OK | Grep "three": addition only. |
| 105 | Estimate products | exists-regrade | OK | Rounds only the bigger factor. |
| 106 | Equal parts of shapes | partial | OK | Count parts or name the fraction. |
| 108 | Unit fractions / build from unit fractions | partial | X (D-1) | decompose_fractions (Visual) draws the shaded bar and asks for the unit-fraction sum. |
| 115 | Compare with benchmark 1/2 | partial | OK | compare `forms:[2]`: "7/10 and 1/2" (one fraction vs 1/2 is live, as the note says). |
| 117 | Fractions > 1 from models | partial | Borderline (D-5) | mixed_improper_visual already writes the improper fraction from a model > 1. |
| 126 | Fraction ÷ fraction | missing | OK | div_unit_fraction only. |
| 129 | Decimal place value | missing | OK / X (D-8) | No decimal_place_value skill. The evidence statement does not show "value of a digit". |
| 134 | Multiply decimals | partial | OK | Decimal × whole only. |
| 139 | Percent of a number | exists-regrade | OK | Number plus click-all. |
| 146 | Story ↔ × / ÷ | exists-regrade | OK | build_expr_multdiv builds and solves. |
| 148 | Fraction models ↔ numbers | partial | OK | identify forms 0–2: single pick. |
| 149 | Decimal grids ↔ numbers | missing | OK (proposal X, D-2) | percent_visual percent or fraction only; frac_10_100 is symbolic. |
| 151 | Decimal number line ↔ number | partial | OK (proposal X, D-3) | Placing only. |
| 153 | ÷ by multiple of 10 | missing | OK | divide facts; long_div_2digit has random divisors and no tens strategy. |
| 154 | Fractions equal to a whole or mixed number | partial | OK | Whole targets are live; the mixed-number targets are on improper_mixed. |
| 158 | Choose ALL showing 1/3 | partial | OK | identify single pick. |
| 159 | Match model ↔ unit-fraction sum | partial | X (D-1) | Model → sum is live in decompose_fractions (bar model with the parts shaded), and sum → model is live in compose_target_frac. |
| 160, 161 | Decimal expanded / word form | missing | OK / X (D-8) | No decimal forms. #160 cites a words-and-numerals statement for expanded form. |
| 174 | Graph ↔ sentence | missing | OK / X (D-8) | bar_graph and pictograph forms ask one number. The evidence is generic. |
| 176 | Clock ↔ time words | exists-ok | OK | time_5min `stimulus: words/words-past/words-oh`; time_match_clock `words`. |
| 178 | Picture ↔ area/perimeter equation | partial | OK / X (D-8) | The distributive model computes only. The evidence is loose. |
| 179 | Unit cubes ↔ number | partial | OK | As #167. |
| 181 | What can be measured | missing | OK | compare_objects compares; nothing names the attribute. |
| 183, 185 | How much longer / two objects on a ruler | missing | OK | order_objects_length and reading_ruler: no difference. |
| 187 | Read a scale / jug | partial | OK | The kg answer-0 bug is confirmed (ans = 0). |
| 189 | Length word problems | missing | OK | length_* and unit_conversion_word convert only. |
| 194 | Money: change and compare | exists-ok | OK | money_change, money_compare, enough_money. |
| 204 | Missing side | partial | OK | Rectangles only. |
| 212 | Defining attributes | missing | OK | — |
| 213 | Compose 2-D shapes | exists-ok | OK | compose_shapes, hexagon, rectangle. |
| 214 | Partition into equal shares | partial | X (D-4) | `closes` claims "cutting", which the proposal leaves to partition_draw. |
| 216, 220, 229 | Rays / draw angles / horizontal–vertical | missing | OK | Labels grep: none. |
| 238 | Complete a tally chart | missing | OK (proposal X, D-2) | tally_chart forms 0–3 all read. |
| 239, 242 | Data tables / line graphs | missing | OK | — |
| 240 | Make a line plot | missing | OK | 36/36 read only. |
| 244 | Heavier / lighter B&W | exists-regrade | OK | The answers are emoji (📕 🐕). |
| 247 | Choose ALL figures showing a line | partial | OK | Click-all "has a line" is a different question. |
| 250 | Choose ALL with six faces | partial | OK | One-solid counts only. |
| 254 | Area with fractional sides | partial | OK | Garden stories and an overlap model; no tiling. |
| 255 | Measurement story ↔ operation | partial | OK | — |
| 257 | Table ↔ graph | partial | OK | Counts inline, no table. |
| 259 | Measure in two units | missing | OK | One unit per item; the ruler is inches only. |
| 260 | Compose 3-D shapes | missing | OK / X (D-7) | 2-D only. The note says compose_shapes has "no options", but it has `shapes`. |

These rows were also sampled and OK, with no notes: 25, 29, 33, 34, 39, 45, 50, 62, 66, 69, 79, 96, 97, 110, 118, 201, 206, 217, 223,
227, 230, 232, 233, 234, 237. Row 124 is OK too; its status was checked from the row's own note.

**Proposals checked (38).**
- **Sound:** `map_frac_compare_reason`, `map_frac_model_match`, `map_compare_smaller_unknown`, `map_change_unknown_story`,
  `map_symmetry_compare`, `map_symmetry_check_line`, `map_area_pick`, `map_volume_expressions`, `map_frac_side_area`,
  `map_div_tens`, `map_est_both_factors`, `map_share_among`, `map_array_to_eq`, `map_ratio_picture`, `map_percent_of_grid_bar`,
  `map_story_equation_addsub`, `map_story_equation_multdiv`, `map_story_equation_frac`, `map_shape_attribute_sort`,
  `map_heavier_lighter_bw`, `map_match_model_number`, `map_ruler_measure_object`, `map_graph_sentence`, `map_area_equation`,
  `map_equal_frac_build` and `map_compose_solids`.
- **Reused, all verbatim:** `dec_pv_within1`, `thousandths_pv`, `big_numbers`, `vis_pv_bands_millions`, `make_line_plot`,
  `equal_groups_early`, `turns_angles` and `shapes_3d_props`.
- **Defective:** `map_frac_unit_build` (D-1); `map_tally_build` and `map_decimal_grid` (D-2); `map_nl_read_decimal`, the
  `add_three_forms` mapClause and `map_shape_partition_pick` (D-3); `map_money_build`, `map_compare_pick` and the `time_convert`
  mapClause (D-6, nits).

## Defects

1. **`map_frac_unit_build` rebuilds live content, and rows #108 and #159 are graded too low.** This is round-3 D-5 again.
   - `fraction_operations:decompose_fractions` ("Decompose to Unit Fractions (Visual)", gen-fractions.js:691–712) draws a bar cut into
     `den` parts with `num` shaded, each shaded part labelled 1/den, and asks "Write 3/4 as a sum of unit fractions". That is
     problem type 1 (model → sum) and level L2 of the option.
   - The proposal's `why` ("decompose_fractions asks for the sum from a number, with no model") is false. The sampler printed only
     `q.text`, so the model was missed.
   - The option is also hosted on "Shade the Fraction", where the pupil does not shade (a name problem).
   - Fix:
     - Set #159 to `exists-regrade`: model → equation is in decompose_fractions, and equation → model is in compose_target_frac.
       The regrade note should record that the legacy visual is colour (`accent-cyan`).
     - Re-host the residual on `decompose_fractions` as an option: part labels off (a hint that fades), "how many fifths?", and
       models past 1. Narrow the problem types and levels to that.
     - Rewrite `why`, and the `closes` of #108 and #159.
2. **Two new proposals duplicate existing build-list entries (reuse sweep missed them).**
   - **`map_tally_build`** (option on graphs:tally_chart, "make the tally from a list or picture"; #238) is WRM **`collect_data`**
     (wrm.js:1279, "a list of raw data; tally it, then draw the chart"). WRM **`table_data`** also covers "tally-to-number tables".
     Fix: point #238 at reused `collect_data` with a mapClause for the K-2 two-category tally. Alternatively, keep the option and
     state in `why` why the K-2 step differs from collect_data.
   - **`map_decimal_grid`** (new skill decimals:decimal_grid_model; #149) overlaps **`vis_hundred_square`** (build-list.js:922). That
     entry gives a hundred-square template with "shade or read, labels decimal | fraction | percent" and **hosts
     `decimals:decimal_place_value`** (WRM `decimal_pv`, flat = 1). Problem types 1 and 2 (grid → decimal, decimal → shade) are what
     that pair delivers. Fix: point #149 at `vis_hundred_square` + `decimal_pv`. Keep only the match-three type, as an option on
     `decimal_place_value`, or justify a separate skill in `why`.
3. **Four proposals put content on a host whose NAME does not cover it.**
   - **`map_nl_read_decimal`** is on decimals:decimal_nl_drag, "**Place** Decimals on a Number Line". Reading is not placing. Fix:
     rename the skill label to "Decimals on a Number Line". Its WRM step Y4.B8.S4 "Tenths on a number line" covers both
     directions. Otherwise, host the option on `nl_20`'s number_line_scales.
   - **`add_three_forms` mapClause** adds "write the turn-around (8 + 5 = ☐ + ☐)" on addition:add_three, "Add **Three** Numbers (≤20)".
     Two-addend items break the name, and the band 191–220 sits on a ≤20 grade-1 skill. Fix: limit the clause to three-addend
     reorderings ((6 + 4) + 9 = 6 + (4 + 9), choose ALL equal sums of three numbers). Put the two-addend commutative form on
     add_facts, or keep it in a separate "Properties of Addition" option.
   - **`map_shape_partition_pick`** adds eighths (L5, the "choose ALL eighths" example) to shapes_early:partition_shapes,
     "Halves/Thirds/Fourths". Fix: drop eighths, or rename the label.
   - **`time_convert` mapClause** puts "choose ALL measurements equal to a time" on unit_conversion_word, "Unit Conversion **Word
     Problems**". Choose-all is not a story. The live click-every-equal form is on `measurement:unit_conversions`. Fix: put the
     choose-all clause there, with a units value of "time", and leave the small → large stories on unit_conversion_word.
4. **Row #214 ("Partition shapes into equal shares") is not fully closed by its proposal.**
   - `closes` says it "adds equal-vs-unequal, cutting shapes into halves/quarters, and choose ALL". But `map_shape_partition_pick`'s
     own `why` hands cutting to STANDARD `partition_draw` and equal-vs-unequal to WRM `fraction_parts`. Its problem types are
     choose-all only, although its representation still mentions a "cut form".
   - Fix: either add `partition_draw` and `fraction_parts` to the row (a row may need a second proposal), or make `closes` say
     choose-ALL only and add a row for "draw the cuts" (2.G.A.3). Also drop "cut form" from the representation.
5. **Row #117 ("Fractions greater than 1 from models") is borderline.**
   - mixed_improper_visual already shows a model past 1 and asks for the improper fraction. Fractions past 1 are also read and
     placed on lines in fraction_number_line and mixed_nl_drag.
   - Fix: say in `closes` exactly what `frac_beyond_1` adds (bar and area models, counting unit parts past 1 before naming), or
     set the row to `exists-regrade`.
6. **Proposal nits** (a lead fixes each in a minute):
   - `map_money_build` problem type 3 "fewest coins" is the live `make_change_least_coins` ("Use the fewest coins. Write how many
     of each"). Drop it.
   - `map_compare_pick` L1–L2 (numbers to 10/20 with ten frames) is the band of the reused `compare_small` on the same host. Start
     L1 at the live band, or say that compare_small supplies it.
   - `map_graph_sentence` (host "Bar Graphs") also takes picture graphs. Declare the same option on `graphs:pictograph`.
7. **Stale or wrong text** (hygiene):
   - #8's note ends "so map_change_patterns only re-grades": that proposal is deleted.
   - The `why` of `map_nl_jumps_equation_addsub` says "Matches the ×-twin option map_nl_hops_equation". That option is deleted. It
     should say "matches the live `response: sentence` on nl_mult / nl_div".
   - #260 says "no options on compose_shapes". It has `shapes` (triangle / square / hexagon).
   - #129, #160 and #161 rely on options of the unbuilt `decimals:decimal_place_value`. Add WRM `decimal_pv` to MAP.json (with its
     map facet) or list it as `after`, so the lead tags the host build too.
8. **Evidence that does not show the row's task:**
   - #129 (value of a digit) and #160 (expanded form) cite "represents a decimal to the hundredths place in words and numerals".
   - #174 (graph ↔ sentence) cites "use the graph to answer".
   - #178 cites "area figure and volume expressions items pair a picture with a number".
   - #79 (equal or unequal groups) cites "divides a small set into groups of equal size".
   - Fix: cite a statement that shows the task, or mark the row "not found; kept because <CCSS>" as other rows do.

## To reach 8

- Fix D-1, D-2 and D-3. These are the substantive ones, and each is a re-host, re-point or narrowing, not a rewrite.
- Before the next round, run one sweep that reads **`q.visual` / `q.cell` as well as `q.text`** for every partial or missing row
  whose host is a "(Visual)" skill. D-1 escaped because the sampler shows text only.
- Run one sweep that greps `WRM_PROPOSALS` and `VISUAL_BUILDS` by the row's *representation* words (tally, hundred square, grid, ruler,
  scale), not only by skill id.
- Clean up D-4 to D-8.

The structure, the full specs, the verbatim reuse and the report are already at pass level; the earlier rounds' status work holds.
