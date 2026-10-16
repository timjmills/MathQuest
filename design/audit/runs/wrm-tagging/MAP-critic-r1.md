# MAP Growth builds audit: independent critic, round 1 (2026-10-10)

What I graded: `data/curriculum/links/MAP.json` (247 rows, 100 proposals) and `MAP-report.md`, against `MAP-BRIEF.md`.

How I checked it:
- **Items generated.** I ran `tests/scripts/ws-sample-items.cjs`, n = 6–12 per skill, on 45 skills.
- **Skill list.** I dumped every live skill (602, from `SKILLS` in data.js) and searched it for skills the audit missed.
- **Reused ids.** I confirmed that every reused id exists in `wrm.js` or `build-list.js` (56 of 56). I also checked every new proposal's skill key against the live skill ids.
- **Evidence.** I downloaded the NWEA RIT Reference brochure (cdn.nwea.org, kept in scratch only) and read its sample items. I also checked the DesCartes M2_OAT_190/210, M2_NO_210/220/230 statements the rows quote.

## Scores

| Criterion | Score | Why |
|---|---|---|
| 1. Status correctness | **6** | 9 of the 61 sampled rows have the wrong status or the wrong skill. Most of them say `missing` while a live skill already deals the task (function_table_hard, estimate_products/estimate_quotient, partition_shapes, build_expr_*, number_word_form). Two pairs of rows contradict each other. |
| 2. Real MAP task types / evidence | **8** | The quoted evidence is real. The brochure items (coatracks, share toys, 5 hours = 300 min, volume expressions, the symmetry/acute chart, digit tiles, the equal-shares choose-all) and the DesCartes statements all checked out. 18 rows are honestly marked "not found". One citation is misapplied (row 2). |
| 3. Proposal quality | **6** | One new skill collides with a live skill id (`map_mult_estimate` would make `multiplication:estimate_products`, but `number_sense:estimate_products` is live). There are three story→equation proposals that ignore the live `build_expr_*` skills. Two more duplicate existing work (`map_word_to_number_entry`, `map_minutes_to_hours`), and two rows point at the wrong proposal. The design and answer-mode wording is good: B&W boxed cell, hot-spot/drag kept, not turned into MC. |
| 4. Completeness and report quality | **7** | The report is clear and generated from the data, and it has useful bug and owner-question sections. But at least five MAP K–5 task types are missing, and the 6.4 audit does not cover each pair in each strand. |
| **Overall (minimum)** | **6 — FAIL** (pass is 8 or more) | |

## Sample table

There are 61 rows: all 29 Wave 6.2 rows plus 32 others from all seven strands and all four statuses. In the Verdict column, OK means agreed; X means a defect, with its number from the list below.

| # | Row task | Status given | Verdict | What I sampled / checked |
|---|---|---|---|---|
| 0 | One-step equations | exists-regrade | OK | solve_eq_addsub n=8: "Solve: a − 3 = 36" entry + yes/no bin drag |
| 1 | Order whole + decimals mixed | partial | OK | order_decimals n=8: decimal-only sets |
| 2 | Pick the lesser / greater | partial | X (D10) | Status fine; the evidence (coatrack fewest coats) is the picture-groups item that row 65 marks exists-ok via compare_groups (sampled: "Which group has fewer counters?") |
| 3 | >, <, = | exists-regrade | OK | placevalue:compare options band starts at 99 |
| 4 | Compare expressions without computing | partial | OK | compare_expressions n=8: computes both sides |
| 5 | Order of operations 47 − (2 × 8) | exists-regrade | OK (note) | paren_simple n=8: 34 × (70 − 28) = 1428. Far heavier than MAP; the proposal's "MAP band" is really an option, not a re-grade |
| 6 | Multi-digit addition | exists-regrade | OK | note checked |
| 7 | Base-ten model → number | exists-regrade | OK | place_value_disks n=8: "What number do the disks show?" |
| 8 | Two-step change problems + option | exists-regrade | OK | multi_step_word n=8: add-add, add-sub, sub-add, sub-sub all dealt; the option is the teacher pick |
| 69 | Ratios from pictures | partial | OK | ratio_intro n=8: text only |
| 70 | Equal sharing "share N among M" | partial | OK | share_into_groups n=8: quotitive only |
| 71 | Division by making equal groups (drag) | partial | OK | same; number entry only |
| 72 | Picture ↔ × equation | exists-regrade | OK | arrays_groups n=8: "___ rows of ___ make ___" |
| 73 | Compare / order decimals | exists-regrade | OK | compare_decimal n=8: symbol, drag order, choose-all |
| 74 | Fraction × with visual models | exists-regrade | X (D8) | mult_frac_frac n=8: frac-model, sort, choose-all. The proposal `mult_mixed_int` is not the residual of this row |
| 75 | Adding decimals | exists-regrade | OK | add_decimal n=8: col-arith |
| 76 | Equal groups total | exists-regrade | OK | arrays_groups |
| 154 | Symmetry: compare shapes | partial | OK | symmetry n=8: count / choose-all / click lines; no two-shape compare |
| 155 | Symmetry: is this line correct? | partial | OK | the hot-spot "Click ALL the lines of symmetry" exists; partial is fair |
| 156 | Area: pick picture with area N | partial | OK | area_unit_squares n=8: one shape, count |
| 157 | Nets of 3-D solids | exists-regrade | OK | net_identify n=8: "Which net folds into…" A–D |
| 158 | Missing angle in a triangle | missing | OK | angles_lines list: no triangle-sum skill |
| 159 | Volume by unit cubes | partial | OK | volume n=8: dimensions only |
| 160 | Perimeter | exists-regrade | OK | perimeter n=8: incl. missing side of a rectangle |
| 161 | Reading clocks | exists-ok | OK | skill list |
| 162 | Minutes → hours | partial | X (D7) | unit_conversion_word n=8: large → small only, so the status is fine; the proposal duplicates WRM `time_convert` (report owner Q4 admits it) |
| 163 | Line / dot plots | exists-regrade | OK | line_plot n=8: read only |
| 164 | Ordering times | exists-ok | OK | skill list |
| 165 | Coordinate point in context | missing | OK | coordinate_q1 n=8: abstract A, B |
| 166 | Match graph ↔ sentence | missing | OK | bar_graph n=8: number entry questions only |
| 167 | Match shape ↔ property | exists-ok | OK | shape_attributes n=6: choose-all with 4 right angles |
| 168 | Match clock ↔ time words | exists-ok | OK | — |
| 169 | Match ruler/scale ↔ number | exists-ok | OK | reading_ruler n=6 |
| 170 | Match area picture ↔ equation | partial | OK | — |
| 171 | Match unit cubes ↔ number | missing | OK | volume |
| 11 | Zero as a count; ordinals | missing | OK (report error) | no ordinal skill. Owner Q6 says zero is "not CCSS"; it is K.CC.A.3 (D11) |
| 20 | Word form ↔ number to millions | exists-regrade | X (D5) | number_word_names = MC only; missed `composing:number_word_form` (words → numeral entry, to 9,999, option `wordform`) |
| 21 | Place value to millions | partial | OK | pv_digit_drag n=6: 5 digits |
| 33 | Change-unknown and start-unknown WPs | exists-ok | X (D3) | unknown_start_wp n=12: start-unknown only; row 34 says change-unknown is missing |
| 34 | Change-unknown WPs | missing | OK | missing_add_sub n=8: bare equations |
| 36 | Compare, bigger/smaller unknown | missing | OK | comparison_word n=12: difference only |
| 39 | Equal sign true/false | missing | OK | equal_sign n=12: "19 + 5 = ?" 12/12, a real bug, rightly flagged |
| 45 | Find the rule of an in-out table | missing | X (D1) | missed `algebra:function_table_hard` n=12: "Find the rule. Write the rule." 12/12 |
| 58 | Match story ↔ operation (+/−) | missing | X (D4) | missed `algebra:build_expr_addsub` n=8: story → build "89 − 3 = 86" (build-expr) |
| 61 | Match word form ↔ number | exists-regrade | X (D5) | as row 20 |
| 63 | Match table ↔ rule | missing | X (D1) | as row 45 |
| 65 | Pick group with fewest/most | exists-ok | OK | compare_groups n=8 |
| 84 | Properties of multiplication | exists-regrade | X (D8) | mult_properties n=8: commutative, zero, distributive entry; the proposal `map_array_to_eq` (picture → equation) is unrelated |
| 88 | Choose the equation for a ×/÷ story | missing | X (D4) | missed `algebra:build_expr_multdiv` n=8: "4 × 7 = 28" built from the story |
| 103 | Estimate products and quotients | missing | X (D2) | missed `number_sense:estimate_products` / `estimate_quotient` n=8: "81 × 8 ≈ ___ × ___ = ___" |
| 104 | Equal parts / halves and quarters | missing | X (D3) | `shapes_early:partition_shapes` n=12: "How many equal parts", "What fraction is shaded"; row 207 calls the same skill partial |
| 113 | Compare fractions with benchmark ½ | partial | OK | benchmark_fractions n=6: closest benchmark only |
| 132 | Multiply decimals | partial | OK | mult_decimal n=6: decimal × whole only |
| 144 | Match story ↔ operation (×/÷) | missing | X (D4) | as row 88 |
| 145 | Match number line ↔ × (hops) | exists-regrade | X (D8) | nl_mult n=8: "3 × 7 = ?" on hops; the proposal `map_array_to_eq` is the array option, not a number-line one |
| 147 | Match decimal grid ↔ number | missing | OK | percent_visual n=8: percent/fraction only |
| 176 | Measure object not at 0 | partial | OK | reading_ruler n=6: arrow from 0 |
| 179 / 237 | Heavier / lighter | exists-regrade | OK | heavier_lighter_visual n=6: emoji answers confirmed |
| 186 | Make an amount with coins | partial | OK | make_change_least_coins n=6: write counts, no drag build |
| 192 | Elapsed-time stories | partial | OK | elapsed_mixed n=6: time line, no story |
| 207 | Partition into equal shares | partial | OK | partition_shapes, as above |
| 211 | Classify angles | exists-ok | OK | identify_angles n=6: incl. "Click ALL the obtuse angles" (matches the brochure) |
| 221 | Four quadrants problems | partial | OK | coordinate_all n=6: read/plot only |
| 226 | Picture graph with key 2/5/10 | partial | OK | build_pictograph n=6: key = 1 only |
| 228 | Build a bar graph | exists-ok | OK | build_bar_graph n=6: graph-builder (brochure "move the square to make a bar graph") |
| 231 | Complete a tally chart | missing | OK | tally_chart n=6: read only |

Proposals checked (19):
- **Sound:** `map_compare_pick`, `compare_sentences` (reused), `map_change_unknown_story`, `map_compare_bigger_unknown`, `equal_sign_repair` (reused), `map_share_among`, `map_area_pick`, `map_symmetry_check_line`, `map_volume_expressions`, `map_shape_attribute_sort`, `map_money_build`, `pictogram_scale` (reused).
- **Defective:** `map_mult_estimate`, `map_story_equation_match`, `map_equation_story`, `map_frac_story_op`, `map_word_to_number_entry`, `map_minutes_to_hours`, `map_array_to_eq` (as used on rows 84 and 145).

## Defects

1. **Rows 45 and 63 (find the rule / match table ↔ rule): status `missing` is wrong.** `algebra:function_table_hard` deals "Find the rule. Write the rule." on 12 of 12 items; the audit sampled only `function_table_easy`. Fix: set both rows to `exists-regrade` (or `exists-ok`) with skills `algebra:function_table_hard`, `algebra:function_table_easy`. Keep `function_machine` only if it adds something hard does not (a rule-choice form, or the real-world table of DesCartes 211–220), and say so in the note.
2. **Row 103 (estimate products and quotients): status `missing` is wrong, and the proposal collides with a live skill.** `number_sense:estimate_products` and `number_sense:estimate_quotient` are live and deal "81 × 8 ≈ ___ × ___ = ___". `map_mult_estimate` proposes a new `multiplication:estimate_products`, which is the same id in another category. Fix: set the row to `exists-regrade` or `partial` with those two skills. Replace `map_mult_estimate` with an `option` on `number_sense:estimate_products` that adds the missing clause (3-/4-digit × 2-digit, "is the answer reasonable?"), or drop it.
3. **Rows 33/34 and 104/207 contradict each other.**
   - Row 33 says change-unknown and start-unknown are `exists-ok`, but its own note says only start-unknown is dealt, and row 34 says change-unknown is `missing`. Fix: rename row 33 to "Start-unknown word problems", keeping `exists-ok`.
   - Row 104 (equal parts / halves and quarters) is `missing` with no skills, while `shapes_early:partition_shapes` deals "How many equal parts?" and "What fraction is shaded?", and row 207 tags it `partial`. Fix: set row 104 to `partial` with `shapes_early:partition_shapes`. Its residual (equal vs unequal parts) is the same as `map_shape_partition_pick` / `fraction_parts`, so merge the two rows or point both at one proposal.
4. **Rows 58, 88 and 144 (story ↔ equation, choose the equation for a story): status `missing` is wrong.** `algebra:build_expr_addsub` and `algebra:build_expr_multdiv` already make the pupil build the equation from a story ("89 − 3 = 86", "4 × 7 = 28", answerType `build-expr`). That is a production form, better than MAP's choose-one. The three new proposals `map_story_equation_match` (option on write_equation), `map_equation_story` (option on mult_word_problems) and `map_frac_story_op` (option on frac_word_problems) are one task type spread over three skills. Fix: set rows 58, 88 and 144 to `exists-regrade` or `partial` with the `build_expr_*` keys. Collapse the proposals into one option on `build_expr_*` ("operation only, no solving", plus a fractions pool for row 150) and drop the other two.
5. **Rows 20 and 61 (word form ↔ number): the existing words→digits skill was missed.** `composing:number_word_form` deals "Write the numeral: eighty-two" (number entry; option `wordform` to_number / to_words; to 9,999). `map_word_to_number_entry` proposes the same direction as a new option on the MC-only `number_word_names`. Fix: add `composing:number_word_form` to both rows. Replace the proposal with a band option on `number_word_form` (to 999,999 / millions; MAP 191–210), so the existing production skill grows instead of a second one.
6. **The `map_regrade_*` proposals (5 in the data, "six" in owner Q8) are not builds.** They record "re-grade, no new content" as `kind: option` and would put non-builds on the build list. Fix: remove them from `proposals`, keep the rows at `exists-regrade` with `proposal` empty, and list the re-grades in a separate `regrades` array (or the Wave 5 lane). The one real option inside them, the small-number "MAP band" in `map_regrade_oop`, becomes its own option proposal on `order_of_operations:paren_simple`.
7. **`map_minutes_to_hours` duplicates WRM `time_convert` (wrm.js:2034).** The brief says to reuse, never duplicate, and owner Q4 admits the overlap. Fix: reuse `time_convert` (add the `map` facet and the "decimal and mixed hours, choose all equal" clause to its `teaches`) on rows 162 and 238, and delete `map_minutes_to_hours`. Similarly, row 78 uses `share_group` while rows 70/71 use `map_share_among` for the same MAP item ("Sonja and Kai share the toys"). Point all three rows at one proposal, or state the split (K–2 two-group sharing vs Grade 3 ÷).
8. **Four rows point at the wrong proposal.**
   - Row 84 (properties of multiplication) → `map_array_to_eq`. Should be an option on `multiplication:mult_properties` (choose all equivalent products, associative with three factors), or extend `map_properties_equivalent` to ×.
   - Row 145 (number line ↔ × hops) → `map_array_to_eq`. Should be a "write the equation the hops show / which hops show 3 × 7" form on `multiplication:nl_mult`, or set the row to exists-ok with no proposal.
   - Row 74 (fraction × with visual models) → `mult_mixed_int`. That is a different clause; the row should be exists-regrade with no proposal, and mixed × whole should be its own row.
   - Row 157 (nets) → `shapes_3d_props`. State what residual it closes, or leave it empty.
9. **Completeness: MAP K–5 task types missing from the audit** (add a row and a proposal or skill for each):
   - (a) Multi-step word problems with all four operations and a letter for the unknown (4.OA.A.3; DesCartes "multi-step real-world problems", 201–220). `number_ops_mixed:word_problems_mixed` and `algebra:multi_step_word` were not audited for it.
   - (b) An angle as a turn / degrees as a fraction of 360 (4.MD.C.5).
   - (c) Area of a rectangle with fractional sides (5.NF.B.4b).
   - (d) The K–2 brochure item "Move cubes to the circles to make the groups equal" (equalise two groups).
   - (e) "Choose ALL the shapes that show one-third shaded" (brochure K–2 Geometry): row 207's proposal covers equal shares only. Add the fraction-shaded choose-all clause.
10. **6.4 audit is not complete per strand.**
    - **Pairs missing from the table:** fractions picture ↔ equation (a model ↔ 1/4 + 1/4 + 1/4 = 3/4; `decompose_fractions` partly does it), measurement story ↔ operation (length/money stories ↔ equation), and geometry/coordinates grid ↔ ordered pair.
    - **Row 2's evidence** cites the coatrack "fewest coats" item, which is the picture-groups task of row 65 (exists-ok, `compare_groups`), not a number comparison. Cite a "which number is greater" item or the DesCartes NO_140 statement instead.
11. **Report owner Q6 is wrong.** It says "ordinal numbers and zero are not CCSS". Zero as a count is K.CC.A.3 (the row's own evidence line says so). Fix the question text, and split row 11 into "zero as a count" (CCSS, normal priority) and "ordinals" (non-CCSS, low priority).

Round 2 should re-run `ws-sample-items` for every row marked `missing`, against all skills whose label shares a keyword (grep `SKILLS` labels), before accepting `missing`.
