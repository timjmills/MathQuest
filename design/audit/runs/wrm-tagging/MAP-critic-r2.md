# MAP Growth builds audit: independent critic, round 2 (2026-10-10)

What I graded: `data/curriculum/links/MAP.json` (258 rows, 101 proposals, `regrades` map of 52 skills) and `MAP-report.md`,
against `MAP-BRIEF.md`, the round-1 report, and the owner rule added since round 1 ("every partial or missing row names the
skill yet to be made that fully closes it").

How I checked it:
- **Structure.** `merge.cjs` runs clean (`MAP merge: OK`). I also ran my own checks. Every partial or missing row has both a
  `proposal` and a `closes` field (0 lacking). Every new proposal has `problemTypes`, `levels`, `example`, `misconceptions`,
  `representation`, `ccss` and `map` (0 lacking). There are no unused or dangling ids.
- **Items generated.** I ran `tests/scripts/ws-sample-items.cjs` on 75 skills: n = 6 to 40, plus `--dist 200` on 5 of them.
- **`missing` rows.** I dumped all 602 live skill labels from `SKILLS` and grepped them by keyword for every `missing` row I
  sampled (length, mass, money, compare, word, ordinal, zero, table, tally, graph, ray, horizontal, angle, attribute,
  decimal, three, ratio, turn, triangle, property, expression, share/group, ten times).
- **Evidence.** I downloaded the NWEA RIT Reference brochure (cdn.nwea.org) into scratch only and read the K–2 and 2–5 sample
  items, then compared the bands and wordings the rows cite against it.
- **Reuse.** I grepped `wrm.js` WRM_PROPOSALS and `build-list.js` for overlaps with the new proposals.

## Scores

| Criterion | Score | Why |
|---|---|---|
| 1. Status correctness | **7** | All 11 round-1 status defects are fixed. In a fresh sample of 63 rows, 6 are wrong or contradict another row. Two `missing` rows are already partly dealt by `addition:add_word_problems`, which the audit never sampled. One `missing` row is partly dealt by `share_into_groups`, which deals grouping. The other three: one exists-ok match row is inconsistent with its × twin, one exists-ok row misreads the MAP item, and one pair of rows has the same content with different statuses. |
| 2. Real MAP task types / evidence | **7** | The task types are real, and the brochure items I checked are quoted correctly. But about 12 rows cite a brochure item that does not show their task. The header says teach.mapnwea.org is "not cited", yet 6 rows cite it from a "search summary". One band is wrong. |
| 3. Proposal quality | **6** | The specs are complete and the design wording is good (B&W boxed cell, production modes kept). But three options would make a skill deal what its own NAME forbids, which the `ws-content-audit` gate fails. Four proposals duplicate each other or existing WRM ids. One row points at the wrong proposal, and one reused proposal does not cover the `closes` text. |
| 4. Completeness and report quality | **7** | The report is clear and generated from the data. It has a separate re-grades table, every new skill in full, bugs, and owner questions. But two MAP 2–5 task types are absent (composite volume, decimal word/expanded form), and there are two duplicate rows. The kind counts do not add up (37 + 62 ≠ 101). |
| **Overall (minimum)** | **6 — FAIL** (pass is 8 or more) | |

## Round-1 defect check

| R1 | Fixed? | Evidence today |
|---|---|---|
| D1 function tables | Yes | #46 `exists-regrade` with function_table_hard (sampled 8/8 "Find the rule. Write the rule."). #64 is `partial` with a real-world residual (`map_function_table_context`). |
| D2 estimate products | Yes | #105 `exists-regrade` with number_sense:estimate_products/quotient. The collision is gone; `map_est_both_factors` is an option on the live skill. |
| D3 contradicting rows | Yes | #34 is renamed "Start-unknown" (exists-ok). #106 and #213 are both `partial` and both point at `map_shape_partition_pick`. Fixing it created a new duplicate: D-6 below. |
| D4 story ↔ equation | Partly | It is collapsed into one option, `map_story_equation_match`. But that option sits on `build_expr_addsub` and widens it to × ÷ (D-4), and a second option was added on the same skill (D-7). |
| D5 word form | Yes | #21 and #62 add `composing:number_word_form`. The residual is a millions band on it (`map_word_form_millions`). |
| D6 map_regrade_* | Yes | Removed. The `regrades` map holds 52 skills and the report has a Re-grades table. The small-number band is its own option (`map_oop_small_band`). |
| D7 time_convert / share | Yes | `time_convert` is reused with a `mapClause`. The K–2 `share_group` vs Grade 3 `map_share_among` split is stated on rows #72, #73 and #80. |
| D8 wrong pointers | Yes | #86 points at `map_mult_prop_grouping`, #147 at `map_nl_hops_equation`, and #76 has no proposal (mixed × whole is its own row, #156). #163 (nets) has no proposal. |
| D9 missing task types | Yes | All five are added: #70, #253, #254, #157 and #158. |
| D10 6.4 pairs and row-2 evidence | Yes | #159, #255 and #256 are added. Row #2 now cites DesCartes NO_160. |
| D11 owner Q6 | Yes | Zero (#11, K.CC.A.3) and ordinals (#12, low priority) are split, and Q5 is corrected. |

## Sample table

There are 63 rows: all 29 Wave 6.2 rows plus 34 others from all seven strands and all four statuses. Row numbers are
indices into `rows`. In the Verdict column, OK means agreed; X means a defect, with its number from the list below.

| # | Row task | Status | Verdict | What I sampled / checked |
|---|---|---|---|---|
| 0 | One-step equations | exists-regrade | OK | solve_eq_addsub n=8: "Solve: a − 3 = 36" plus a yes/no bin drag. solve_unknown deals entry and click-all. |
| 1 | Order whole + decimals mixed | partial | OK | order_decimals n=8: decimal-only sets. order_least_to_greatest: whole numbers only. |
| 2 | Pick the lesser / greater | partial | OK | compare n=8: symbol only. The evidence is now NO_160. |
| 3 | >, <, = | exists-regrade | OK | compare: "Compare: 722 ___ 892". Brochure K–2 181–190 "Put the correct symbol" matches. |
| 4 | Compare expressions without computing | partial | OK | compare_expressions n=8: evaluates both sides, MC plus bins. |
| 5 | Order of operations | exists-regrade | OK | paren_simple n=8: 1428, 2280 … The brochure 221–230 item = 35, so the small band is justified. |
| 6 | Multi-digit addition | exists-regrade | OK | Note checked. |
| 7 | Base-ten model → number | exists-regrade | OK | place_value_disks n=6 reads; base10_build builds; tens_foundation "How many tens?". |
| 8 | Two-step change (+ teacher option) | exists-regrade | OK | multi_step_word n=10: got/gave/lost/found, all four patterns. |
| 71 | Ratios from pictures | partial | X (D-9) | ratio_intro n=6: text only, so the status is fine. The evidence cites the 6+ unit-price (rate) item, not a picture ratio. |
| 72 | Share N among M | partial | OK | share_into_groups n=6: 6/6 "Make groups of 4. How many groups?" (quotitive). Brochure 181–190 Sonja/Kai matches. |
| 73 | Division by making groups (drag) | partial | OK | Same skill; number entry only. |
| 74 | Picture ↔ × equation | exists-regrade | OK | arrays_groups n=6: "___ rows of ___ make ___". |
| 75 | Compare / order decimals | exists-regrade | OK | compare_decimal n=6: choice, dnd order, click-all. |
| 76 | Fraction × with models | exists-regrade | OK | mult_frac_frac and mult_frac_whole n=6: frac-model, sort bins, click-all. |
| 77 | Adding decimals | exists-regrade | OK | add_decimal n=6: col-arith. |
| 78 | Equal groups total | exists-regrade | OK | arrays_groups / mult_word_problems. |
| 160 | Symmetry: compare two shapes | partial | OK | symmetry n=6: count / click-all / hot-spot lines. No two-shape compare. |
| 161 | Symmetry: is this line correct? | partial | OK (see D-3) | The hot-spot asks the pupil to click candidate lines; no item judges a single drawn line. |
| 162 | Area: pick picture with area N | partial | OK | area_unit_squares n=6: one shape each. |
| 163 | Nets | exists-regrade | OK | net_identify n=6: "Which net folds into a cube?" A–D. |
| 164 | Missing angle in a triangle | missing | OK (note) | Grep found no triangle-sum skill. The evidence line cites 4.MD.C.7 / 7.G.B.5; triangle sum is 8.G.A.5 (`angle_rules` has it right). |
| 165 | Volume by unit cubes | partial | X (D-2) | volume n=6: dimensions / missing edge. Its twin row #177 says `missing`. |
| 166 | Perimeter | exists-regrade | OK | perimeter n=6: rectangle, missing side, trim story. |
| 167 | Reading clocks | exists-ok | OK | Note checked. |
| 168 | Minutes → hours | partial | OK | unit_conversion_word n=20: large → small only. Reuses `time_convert` with a mapClause. |
| 169 | Line / dot plots | exists-regrade | OK | line_plot_fractions n=6: read only. |
| 170 | Ordering times | exists-ok | X (D-9) | The status is fine. The evidence cites teach.mapnwea.org "search summary; PDF 503". |
| 171 | Coordinate point in context | missing | OK | coordinate_q1 n=6: abstract A, B only. No other coordinate skill has context. |
| 172 | Match graph ↔ sentence | missing | OK | pictograph and tally_chart n=6: single numeric/name questions. |
| 173 | Match shape ↔ property | exists-ok | OK | Note checked (click-all four right angles, quads multi-select). |
| 174 | Match clock ↔ time words | exists-ok | OK | — |
| 175 | Match ruler ↔ number | exists-ok | OK | — |
| 9 | Count objects to 20 | exists-ok | OK | Brochure K–2 below 131 "How many superheroes". |
| 11 | Zero as a count | missing | OK | Grep "zero": only sub_across_zeros, mult_zeros, placeholder zero, zero in quotient. |
| 12 | Ordinals | missing | OK | Grep ordinal/position/first: none (shape_positions is above/below). |
| 19 | Digit is ten times the digit to its right | missing | OK | No form compares two digit values; reuses `value_ten_times`. |
| 27 | Read a number at a point on a line | partial | OK | Reuses nl_20 / number_line_scales; its source text includes "write the number at the arrow". |
| 35 | Change-unknown stories | missing | X (D-1) | add_word_problems dist 200 deals "Zara has # crayons. Zara wants # crayons. How many more does Zara need?" (≈8/200 openings, change-unknown with "need"). Not sampled by the audit. |
| 37 | Compare, bigger / smaller unknown | missing | X (D-1) | add_word_problems n=40: 10/40 bigger-unknown ("Ben has 35 stamps. Lena has 42 more stamps than Ben. How many stamps does Lena have?"). 0/40 smaller-unknown. |
| 38 | Part-whole, both addends unknown | partial | X (D-6) | number_bonds n=8: one missing part. The status is fine. Its proposal duplicates WRM `bonds_in_order`. |
| 43 | Identify the property (+) | missing | OK (see D-6) | Grep "propert": only mult_properties and distributive_expr. |
| 46 | Find the rule | exists-regrade | OK | function_table_hard n=8: 8/8 find and write the rule. |
| 61 | Match number line ↔ +/− equation | exists-ok | X (D-3) | number_line_add n=8: "Use the number line: 15 + 5 = ?". The equation is given and the pupil only computes. Row #147 (× hops) calls the same gap a residual. |
| 67 | 1 more / 1 less than a teen | exists-ok | OK | more_less_10 n=8: "What is 1 more than 18?". Brochure 151–160 matches. |
| 68 | Units → number | partial | OK | unit_form n=8: 8/8 number → units. |
| 80 | Make equal groups (K–2) | missing | X (D-1) | share_into_groups n=6: "There are 12 counters. Make groups of 4. How many groups?". This is K–2 grouping with counters and no ÷ sign, so grouping is dealt and only sharing is missing. |
| 86 | Properties of × | exists-regrade | X (D-6) | mult_properties: order, breaking apart, ×0, ×1. The residual overlaps `mult_three` and `map_properties_equivalent` L4. |
| 104 | Multiply three numbers | missing | OK | Grep "three": add_three, add_column_multi, three_ops_no_paren; no × of three. |
| 105 | Estimate products / quotients | exists-regrade | OK | Note checked. |
| 106 | Equal parts of shapes | partial | OK | partition_shapes n=6: "How many equal parts?", "What fraction is shaded?". |
| 126 | Divide fraction by fraction | missing | OK | Grep: only div_unit_fraction / div_unit_frac_nv. |
| 129 | Decimal place value | missing | X (D-8) | Grep "decimal": no place-value skill, so the status is fine. The reused `decimal_pv` teaches tenths and hundredths in a chart, but `closes` claims thousandths and the value of a digit. |
| 147 | Match number line ↔ × hops | exists-regrade | OK | Note checked; consistent with R1 D8. |
| 149 | Match decimal grid ↔ number | missing | OK | percent_visual dist 200: percent / fraction / click-all-% only. |
| 153 | Divide by a multiple of 10 | missing | OK | Grep: no ÷-tens skill (division list checked). |
| 158 | Choose ALL shapes one-third shaded | partial | X (D-6) | identify n=6: "Which model shows 1/3?" A–D, so the status is fine. The proposal duplicates `map_shape_partition_pick`. |
| 179 | What can be measured | missing | OK | compare_objects n=12: "Which bar is thicker / line longer"; it never names the attribute. |
| 181 | How much longer | missing | OK | compare_objects: pick only. |
| 183 | Two objects on a ruler: difference | missing | OK / X (D-9) | Status fine. The evidence ("How long is the pencil?") does not show a difference task. |
| 185 | Heavier / lighter (K) | exists-regrade | X (D-5) | Duplicate of row #243. It points at `mass_scales` (Y2–Y3 reading of g/kg scales), which is unrelated. |
| 186 | Read a scale or jug | partial | OK | mass_volume_liquid n=12: 6/12 "Read the scale … kg" give ans = 0 (the bug is confirmed). |
| 187 | Mass / liquid word problems | missing | OK | capacity, mass_volume_liquid, unit_conversion_word: convert / read / sort only. |
| 188 | Length word problems | missing | OK | length_customary / length_metric n=12: conversions only. perimeter trim stories are perimeter. |
| 194 | Money two-step | missing | OK | money (Add the prices), enough_money, money_change, add_word_problems dollars: one step only. |
| 211 | Defining attributes | missing | OK / X (D-9) | Grep "attribute": shape_attributes, compose_from_attributes, compare_objects; no defining / non-defining sort. The evidence is a generic shapes item. |
| 215 | Points, lines, rays | missing | OK | Grep ray/segment/point: none. |
| 228 | Horizontal / vertical | missing | OK | Grep: none. |
| 232 | Picture graph key 2/5/10: build | partial | OK | build_pictograph n=6: 6/6 "each picture = 1". pictograph reads scaled keys. |
| 237 | Complete a tally chart | missing | OK | tally_chart n=6: read only. |
| 238 | Read a table of data | missing | OK | Grep "table": ratio_tables, function tables, rounding_table; no data table. |
| 241 | Line graphs | missing | OK | Grep "graph": no line graph. |
| 246 | Choose ALL figures that SHOW a line of symmetry | exists-ok | X (D-3) | symmetry: "Click ALL shapes that HAVE a line of symmetry". The brochure 191–200 item is "Some figures are shown. Choose all the figures that show a line of symmetry" (a drawn line to judge), which is row #161's task. |
| 251 | Picture graph key = 1, who has most | exists-ok | X (D-5) | Duplicate of row #231. |
| 157 | Move cubes to make two groups equal | missing | X (D-9) | Status fine (no skill moves objects). The brochure puts the item at K–2 Number & Operations **141–150**, not 161–180 in Multiplication & division. |

Proposals checked (24):
- **Sound:** `map_order_whole_decimal_mixed`, `map_compare_pick`, `map_oop_small_band`, `map_function_table_context`,
  `map_word_form_millions`, `map_array_to_eq`, `map_share_among`, `map_decimal_grid`, `map_div_tens`, `map_symmetry_check_line`,
  `map_graph_sentence`, `map_money_build`, `map_tally_build`, `map_heavier_lighter_bw`. Among the reused proposals, `zero`,
  `nl_20`, `value_ten_times`, `time_convert` (mapClause), `equal_groups_early` (mapClause), `money_2step`, `length_ops`,
  `mass_scales` (only on row #186) and `four_quadrants` are also sound.
- **Defective:** `map_story_equation_match`, `map_change_unknown_story`, `map_compare_bigger_unknown` (D-4).
  `map_frac_choose_all_shaded`, `map_mult_prop_grouping`, `map_properties_equivalent` (L4), `map_another_way_to_make` (L4) (D-6).
  `map_measure_story_equation` (D-7). `decimal_pv` as used on row #129 (D-8). `mass_scales` on row #185 (D-5).

## Defects

1. **Three `missing` rows are partly dealt by live skills.**
   - **Row #35 (change-unknown).** `addition:add_word_problems` deals "Zara has 82 crayons. Zara wants 84 crayons. How many more
     does Zara need?", which is change-unknown in its "need" form.
   - **Row #37 (bigger / smaller unknown).** `add_word_problems` deals bigger-unknown on 10 of 40 items ("Lena has 42 more stamps
     than Ben").
   - **Row #80 (make equal groups, K–2).** `division:share_into_groups` already makes groups of a size with counters and no ÷ sign.

   Fix: set all three to `partial`. Add `addition:add_word_problems` to #35 and #37, and `division:share_into_groups` to #80. Make
   `closes` name only the residuals: the past-tense join/separate change unknown; the smaller unknown ("fewer than"); sharing
   one-by-one.

   Round 3 must sample add_word_problems, sub_word_problems and word_problems_mixed for every story row; none of them appears in
   any note.
2. **Rows #165 and #177 contradict each other.** They have the same content (unit cubes ↔ volume), the same skill
   (`area_perimeter:volume`) and the same proposal (`volume_cubes`), but one says `partial` and the other `missing`. Fix: give
   both the same status (`partial`, because volume deals cubic units from edges) or merge the 6.4 row into #165.
3. **Two match rows are graded `exists-ok` on a form MAP does not use.**
   - **Row #61 (number line ↔ +/− equation).** number_line_add gives the equation and asks only for the answer. Row #147 calls
     exactly this a residual for ×. Fix: set #61 to `partial`, and add a "write the equation the jumps show" option on
     `addition:number_line_add` and `subtraction:number_line_sub` (or widen `map_nl_hops_equation` to +/−, declared on each skill
     separately).
   - **Row #246.** The MAP item asks whether a DRAWN line is a line of symmetry, across several figures. Our symmetry skill asks
     which shapes HAVE a line of symmetry. Fix: set #246 to `partial` → `map_symmetry_check_line` (its problem type 3, "sort",
     already is this item), and move the brochure citation from #161 to #246.
4. **Three options would make a skill contradict its own name** (CLAUDE.md: "A skill's NAME is its declaration";
   `ws-content-audit` fails them).
   - **`map_story_equation_match`** is an option on `algebra:build_expr_addsub` ("Build the Expression: +/−") that widens the pool
     to × ÷ and fraction × stories.
   - **`map_change_unknown_story`** puts change-unknown stories on `subtraction:unknown_start_wp` ("Unknown Start Word Problems").
   - **`map_compare_bigger_unknown`** puts "How many shells does Tom have?" on `addition:comparison_word` ("How Many More/Fewer?").

   Fix:
   - Split `map_story_equation_match` into a +/− pool option on build_expr_addsub (unknown in any position, compare, like-fraction
     +/−) and a ×/÷ pool option on build_expr_multdiv (unknown factor, sharing, fraction × whole). Each declares only the
     operations in its own name.
   - Move the change-unknown option to `addition:add_word_problems` / `subtraction:sub_word_problems` (option "unknown: change"),
     or make it a new skill, `addition:change_unknown_wp`.
   - Move bigger/smaller-unknown to add_word_problems / sub_word_problems as an option "unknown: bigger / smaller", or rename the
     target in the proposal.
5. **Two rows are duplicates, and one of them points at the wrong proposal.**
   - Row #185 (Heavier / lighter, `exists-regrade` → `mass_scales`) duplicates row #243 (→ `map_heavier_lighter_bw`).
     `mass_scales` (read g/kg/ml/l scales, Y2–Y3) does not touch K heavier/lighter. Fix: delete #185, or point it at
     `map_heavier_lighter_bw` and drop `mass_scales` from it.
   - Row #251 duplicates row #231 (read a picture graph, key 1). Fix: merge them.
6. **Four duplicate or overlapping proposals.**
   - (a) **`map_frac_choose_all_shaded`** (option on fractions:identify: choose ALL models showing a/b with unequal-part
     distractors) is the same item as the "choose all that show a fraction" form of **`map_shape_partition_pick`** (its L4 and
     problem type 3). Fix: keep one, the partition option for 1/2, 1/3 and 1/4 of shapes (G.A.3). Limit the identify option to
     what the partition option lacks (non-unit fractions and sets), and say so in both.
   - (b) **The associative property of × is proposed three times:** `map_mult_prop_grouping` (grouping form on mult_properties),
     reused `mult_three` (row #104, "2 × 5 × 7 = 10 × 7") and `map_properties_equivalent` L4 ("× versions … (2 × 5) × 3 and
     choose-all"). Fix: restrict `map_properties_equivalent` to + (rename it "Properties of Addition"). Let `mult_three` own
     three-factor products. Cut `map_mult_prop_grouping` to the "choose ALL equal products" response.
   - (c) **`map_another_way_to_make` L4 / problem type 2** ("list all pairs for a number in an ordered table") duplicates WRM
     `bonds_in_order` (wrm.js:2136, "listing all the bonds of a number systematically"). Fix: reuse `bonds_in_order` on row #38 for
     the list-all clause, and keep `map_another_way_to_make` to the open "show a different way" domino form.
   - (d) See D-7.
7. **`map_measure_story_equation` is a second option on `algebra:build_expr_addsub` for the same task** (story → equation)
   as `map_story_equation_match`, differing only in the pool. Fix: make "measurement" one value of the same pool option, and give
   it ×/÷ measurement stories on build_expr_multdiv per D-4.
8. **Row #129: the reused `decimal_pv` does not fully close the row.** The source teaches tenths and hundredths in a place-value
   chart, but the row's `closes` claims "the value of a digit in tenths/hundredths/thousandths". Fix: add a `mapClause` to
   `decimal_pv` ("value of a digit to thousandths: the 7 in 3.072 is 7 hundredths"), or point thousandths at a band on
   `map_decimal_grid` / `vis_hundred_square` `grid: 1000`.
9. **Evidence problems.**
   - (a) **Misapplied citations.** These rows cite an item that does not show their task:
     - #71 (ratio from a picture) cites the 6+ unit-price item (rate).
     - #183 (difference on a ruler) cites "How long is the pencil?".
     - #190 (conversion table) and #194 (money two-step) cite one-step items.
     - #211 and #214 (defining attributes, regular polygons) cite "which shape has only 3 sides?".
     - #218, #219 and #220 (protractor, draw angle, additive angles) cite "classify acute/right/obtuse".

     Fix: cite a matching DesCartes or chart statement, or mark these rows "not found; kept because <CCSS>" the way 18 other rows do.
     Then correct the "236 rows cite public NWEA material" count.
   - (b) **teach.mapnwea.org is cited.** The report header says those PDFs "returned 503 … so they are not cited", but rows #170,
     #197, #198, #236, #237 and #238 cite `teach.mapnwea.org/impl/RIT2ConceptK2.pdf` from a "search summary". Fix: remove those
     citations, or change the header to say they are search-summary citations.
   - (c) **Row #157 has the wrong band and strand.** The brochure puts "Move cubes to the circles to make the groups equal" at K–2
     Number & Operations 141–150. Fix: set ritBand 141-150 and strand Number & place value, or say why it is filed under ×/÷.
10. **Completeness: two MAP 2–5 task types are absent.**
    - (a) **Volume of a composite solid by adding two prisms** (5.MD.C.5c; DesCartes M&D 211–230). `area_perimeter:volume_composite`
      ("Composite 3D Volume") deals 0/200 composite figures (143 rectangular prisms, 57 cubes), which is also a name ≠ content
      bug. Fix: add the row, list the bug, and propose a "two prisms" form on volume_composite.
    - (b) **Decimals in word and expanded form** (5.NBT.A.3a; the DesCartes 211–220 statement already quoted on row #129). Fix:
      add the row with a proposal (a decimal band on number_word_form / expand, or a mapClause on `decimal_pv`).
11. **Report detail.** "Proposals by kind: new 37, option 62" sums to 99 of 101: it omits `band` (`vis_pv_bands_millions`) and
    `repair` (`equal_sign_repair`). The note on row #164 cites 7.G.B.5 for the triangle sum (it is 8.G.A.5). Fix both in
    `report.cjs` / part C.

To reach 8:
- fix D-1 to D-7 (statuses, name-rule violations, duplicates);
- clean up the evidence (D-9);
- add the two rows (D-10).

The structure, the full specs and the re-grade separation are already at pass level.
