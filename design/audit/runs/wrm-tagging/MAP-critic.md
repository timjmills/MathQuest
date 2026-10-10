# MAP Growth builds audit: independent critic, round 5 (2026-10-10)

What I graded: `data/curriculum/links/MAP.json` (261 rows, 114 proposals: 40 new and 74 reused, plus 57 `regrades`) and
`MAP-report.md`. I graded them against `MAP-BRIEF.md`, `BRIEF.md` (proposal shape), CLAUDE.md ("A skill's NAME is its
declaration"), and the round-1 to round-4 critic reports.

How I checked it:
- **Structure.**
  - `map-parts/merge.cjs` prints `MAP merge: OK`.
  - My own checks:
    - 0 partial or missing rows lack `proposal` or `closes`.
    - 0 proposals are unused.
    - 196 rows carry a URL, as the report says.
    - The status, source and kind counts match the report: 123 / 30 / 66 / 42; new 40, WRM 40, STANDARD 28, VISUAL 6;
      option 70, new 38, band 1, repair 2, template 3.
    - No row or proposal names a `map_*` id that does not exist (the report does: D-6).
- **Reuse is verbatim.** I loaded the live `WRM_PROPOSALS`, `STANDARD_PROPOSALS`, `VISUAL_BUILDS` and `WRM_EXTENSIONS` and
  compared every reused proposal key by key. There are 0 differences in source fields. The only extras are `ccss`, `why`,
  and (where the source lacks them) `representation`, `teaches` and `family`. That is acceptable, but one added `why` is
  stale (D-5).
- **Items generated.** I ran `ws-sample-items.cjs` (seeded, n = 5–10) on 120 skills, with
  `--fields answerType,interactiveType`. I read `skill-options.txt` for every host I judged.
- **Drawings.** For "(Visual)" hosts I read the generator source or `--fields cell`: `decompose_fractions` (gen-fractions.js
  691–712: a colour bar with each shaded part labelled 1/den), `heavier_lighter_visual` (emoji, no cell) and `elapsed_*`
  (a timeline cell with no story).
- **Labels.** I grepped all SKILLS labels for every sampled missing or partial row (true/false, expression, sentence, ratio,
  mixed, table, money, elapsed, polygon, parallelogram, tally, number line).
- **Reuse sweep by picture.** I grepped `wrm.js` and `build-list.js` for the picture or tool each touched proposal needs
  (emoji, balance, ruler, statement, number line + decimal, greatest/least, turn-around/commutative, Carroll/sort, change +
  coin). This is what found D-1.
- **Evidence.** I checked the NWEA brochure text the auditors downloaded (`nw/b.txt`). These items are really there: "Show
  the change that Julia should receive", "Choose ALL the objects that have six faces", "equal shares", "Choose ALL the shapes
  that show one-third shaded", "measurements that are equal to 5 hours" and "Move the shapes to the correct part of the chart".

## Scores

| Criterion | Score | Why |
|---|---|---|
| 1. Status correctness | **9** | 2 of the 101 sampled rows are wrong, and in both the task text claims more than its exists-ok skill deals: #207 (parallelogram) and #42 ("properties of addition"; D-4). Every other status matches what I generated, including all 29 Wave 6.2 rows. The round-4 fixes (#108, #117, #159) are right. |
| 2. Real MAP task types / evidence | **9** | Every round-4 evidence defect is fixed: rows say "not found; kept because <CCSS>" where no public item exists. The brochure items I spot-checked are real and are cited on the right rows. |
| 3. Proposal quality | **8** | The specs are complete and consistently good: one-change ladders, structural vs hint scaffolds, production screen modes and real misconceptions. All four round-4 defect classes are closed. There is no rebuilt live content and no name violations of substance. One duplicate is left, on a proposal touched in round 6 (D-1: `map_heavier_lighter_bw` repeats VISUAL_BUILDS `vis_migrate_measures`). The rest are one-minute nits (D-2, D-3, D-7). One duplicate in about 30 graded proposals is isolated, not systematic. |
| 4. Completeness and report quality | **8** | The report is generated and its counts are right. The 6.2 table, strand walk, 6.4 audit, regrades, full specs, bugs and owner questions are all there. I found no missing K–5 MAP task type that would matter. Stale text remains in 3 places (D-5, D-6). |
| **Overall (minimum)** | **8 — PASS** | |

## Round-4 defect check

| R4 defect | Fixed? | Evidence today |
|---|---|---|
| D-1 `map_frac_unit_build` rebuilt live content; #108 / #159 graded too low | **Yes** | #159 is `exists-regrade`; its note says model → sum is in `decompose_fractions` and sum → model is in `compose_target_frac`, and records the accent-cyan legacy visual. The option is re-hosted on `decompose_fractions`, narrowed to labels off, a "how many unit parts?" count and models past 1. The `why` is now true: I confirmed the source draws 1/den labels and goes no higher than 6/6. The #108 `closes` is rewritten. |
| D-2 `map_tally_build`, `map_decimal_grid` duplicates | **Yes** | Both are deleted. #238 → reused `collect_data` (mapClause: K-2 tally only). #149 → `decimal_pv` + `vis_hundred_square`. |
| D-3 four name violations | **Yes** | `map_nl_read_decimal` is now a new skill, `decimals:read_decimal_number_line`, whose name declares reading. `add_three_forms` mapClause has three addends only; two-addend turn-arounds moved to `map_add_turnaround` on `add_facts`. Eighths are dropped from `map_shape_partition_pick`. Choose-all time moved to `map_conv_time_choose_all` on `unit_conversions`. |
| D-4 #214 not fully closed | **Mostly** | `also: [partition_draw, fraction_parts]` and `closes` now names all three. Residue: the representation of `map_shape_partition_pick` still describes a "cut form … draw a cut line" (D-3). |
| D-5 #117 borderline | **Yes** | Now `exists-regrade`. Confirmed: `mixed_improper_visual` deals 23/6, 12/5 and 14/3 from models, as a mixed number AND an improper fraction. |
| D-6 nits (money_build fewest coins, compare_pick band, graph sentence on pictograph) | **Yes** | Fewest coins is dropped (its `why` cites `make_change_least_coins`). `compare_pick` declares "bands compare already has (99 and up)". `map_graph_sentence_picto` is added; its text is copied without adapting (D-2). |
| D-7 stale text (#8, `map_nl_jumps…` why, #260, `decimal_pv` missing) | **Yes** | All four are fixed. `decimal_pv` is in MAP.json and in the `also` of #129, #160 and #161. |
| D-8 evidence (#129, #160, #174, #178, #79) | **Yes** | All five now say "not found in public NWEA material; kept because <CCSS>". |

## Sample table (101 rows: all 29 Wave 6.2 rows plus 72 others, all seven strands and all four statuses)

OK means agreed; X means a defect, with its number from the list below.

| # | Row task (short) | Status | Verdict | What I generated / checked |
|---|---|---|---|---|
| 0 | One-step equations | regrade | OK | "Solve: a − 3 = 36"; yes/no bins (dnd-generic). |
| 1 | Order whole + decimals mixed | partial | OK | order_decimals: decimal-only sets, both forms. |
| 2 | Pick the lesser / greater | partial | OK | compare: symbol only (5/5). |
| 3 | >, <, = | regrade | OK | "Compare: 722 ___ 892". |
| 4 | Compare expressions without computing | partial | OK | compare_expressions: evaluate each side (MC and bins). |
| 5 | Order of operations | regrade | OK | paren_simple at range 100 deals "34 × (70 − 28)" (large); the report lists this as a bug. |
| 6 | Multi-digit addition | regrade | OK | Column stacks. |
| 7 | Base-ten model → number | regrade | OK | place_value_disks: "What number do the disks show?" |
| 8 | Two-step change problems | regrade | OK | multi_step_word: gave/found, got/lost, gave/lost patterns. The stale note is fixed. |
| 71 | Ratios from pictures | partial | OK | ratio_intro: text only. |
| 72, 73 | Share N among M / make groups by drag | partial | OK | share_into_groups: 5/5 "make groups of k" with number entry. |
| 74 | Picture ↔ × equation | partial | OK | arrays_groups: inline sentence frame. |
| 75 | Compare / order decimals | regrade | OK | Symbol choice, drag order, click-all less than. |
| 76 | Fraction × with models | regrade | OK | frac-model, bins, click-all. |
| 77 | Adding decimals | regrade | OK | col-arith. |
| 78 | Equal groups total | regrade | OK | arrays_groups. |
| 162 | Symmetry: compare two shapes | partial | OK | One shape per item. |
| 163 | Symmetry: is this line correct? | partial | OK | Count / click-all shapes / click-all lines. |
| 164 | Area: pick the picture with area N | partial | OK | area_unit_squares: one shape. |
| 165 | Nets | regrade | OK | net_identify A–D. |
| 166 | Missing angle in a triangle | missing | OK | The source text of reused `angle_rules` includes "angles in a triangle (180°)". |
| 167 | Volume by unit cubes | partial | OK | volume: l, w, h text; missing edge. |
| 168 | Perimeter | regrade | OK | Rectangle, missing side, story. |
| 169 | Reading clocks | ok | OK | — |
| 170 | Minutes → hours | partial | OK | unit_conversion_word: "6 hr → min" (large → small only). |
| 171 | Line / dot plots | regrade | OK | line_plot: read only. |
| 172 | Ordering times | ok | OK | — |
| 173 | Coordinate point in context | missing | OK | coordinate_q1: abstract A, B points. |
| 9 | Count objects to 20 | ok | OK | counters cell, 5–19. |
| 10 | Count on / before / after | ok | OK | — |
| 13 | Teen numbers as ten and ones | ok | OK | "10 and what number make 19?" |
| 14 | Skip count | ok | OK | — |
| 15 | Odd / even select all | ok | OK | multi-select-check. |
| 16 | Number chart to 1,000 | ok | OK | number_chart_fill: 113–178 windows. |
| 17 | 10 more / 10 less | ok | OK | — |
| 20 | Expanded / standard / unit form | ok | OK | expand, combine, unit_form. |
| 22 | Place value to millions | partial | OK | pv_digit_drag: 5 digits. |
| 23 | Compare to 20 with pictures | partial | OK | compare band minimum is 99. |
| 24 | Order 3–4 whole numbers | ok | OK | interactive order. |
| 26 | Place a number on a number line | regrade | OK | "Tap 88" on 0–100. |
| 28 | Integers | ok | OK | — |
| 30 | Estimate sums | ok | OK | "81 + 84 ≈ ___ + ___". |
| 31 | Add / sub within 20 | ok | OK | add_facts. |
| 32 | Add with pictures | ok | OK | — |
| 35 | Change-unknown stories | partial | OK / X (D-6) | `closes` still says vis_story_strip "cannot be carried", though it is in `also`. |
| 36 | Compare stories, difference unknown | ok | OK | comparison_word: MORE / FEWER. |
| 39 | Missing addend | ok | OK | All positions. |
| 40 | True / false equations | missing | OK | equal_sign deals "19 + 5 = ?" column addition (the bug is confirmed). |
| 41 | Balance equations | ok | OK | "28 + 12 = ___ + 13". |
| 42 | Add three numbers / properties of addition | ok | X (D-4) | add_three computes only; properties are row #43's job. |
| 43 | Property of addition | missing | OK | No form. `add_three_forms` (three addends) + `map_add_turnaround` (two addends) close it. |
| 44 | Fact families | ok | OK | — |
| 47 | Number patterns | ok | OK | Fill + drag. |
| 48 | Shape patterns | ok | OK | — |
| 49 | Two patterns | ok | OK | MC rule + drag. |
| 51 | Numeric expression with brackets | missing | OK | write_expression: variables only. |
| 54 | Tape diagrams | ok | OK | — |
| 55 | Add / sub 10s mentally | regrade | OK | ±10 only; `tens_any` residual. |
| 56 | Subtract across zeros | ok | OK | — |
| 57 | Picture ↔ +/− equation | partial | OK | Equation given; pupil computes. |
| 59 | Story ↔ +/− equation | partial | OK | build_expr_addsub: result-unknown only (5/5). |
| 60 | Number line ↔ number | partial | OK | Place only. |
| 63 | Expanded ↔ standard | ok | OK | — |
| 65 | Show another way to make | partial | OK | number_bonds: one missing part. |
| 67 | 1 more / 1 less than a teen | ok | OK | Production entry (stronger than MAP's pick). |
| 70 | Multi-step, four operations, letter | partial | OK | multi_step_word: + / − only. |
| 82–85, 87–89 | Facts, unknown factor, families, hops, stories | ok | OK | missing_mult_div "99 ÷ ___ = 11"; div stories. |
| 90 | Choose the × / ÷ equation | regrade | OK | build_expr_multdiv builds. |
| 92 | × by 10 / multiples of 10 | ok | OK | "4 × 30". |
| 93, 94 | Area model / standard algorithm | ok / partial | OK | — |
| 95, 98 | Remainders; 2-digit divisor | ok / regrade | OK | div_remainders "4 R 3". |
| 99–103 | Factors, multiples, prime, GCF, divisibility | ok | OK | Multiples fill / click-all / list; prime sort. |
| 107, 109 | Fraction of shape / of set | ok | OK | fraction_of_set compute / click / missing numerator. |
| 108 | Build from unit fractions | partial | OK | Narrowed residual; confirmed in source. |
| 111–114, 116 | Read fraction on a line, whole as fraction, equivalent, compare, order | ok | OK | fraction_number_line "9/5 at the arrow"; whole_as_fraction 6/6. |
| 115 | Benchmark 1/2 | partial | OK | compare: one fraction vs 1/2 is live. |
| 117 | Fractions > 1 from models | regrade | OK | mixed_improper_visual 23/6, 12/5. |
| 118–125, 127 | Mixed ↔ improper, + − fractions, ÷ unit fraction, scaling | ok | OK | add_mixed_like, div_unit_fraction, mult_scaling, frac_as_division sampled. |
| 128, 130–133, 135 | Decimal family | ok | OK | decimal_nl_drag places only (#130 "place" is right); compare_thousandths. |
| 137, 138, 140, 141 | Percent grid, FDP, unit rate, ratio tables | ok | OK | — |
| 142 | Ratio stories with a bar | missing | OK | Labels: no ratio-bar skill. |
| 143 | Line plot with fractions | ok | OK | Read only; the total is row #252. |
| 147, 150 | Number line ↔ × / fractions | ok | OK | — |
| 149 | Decimal grids ↔ number | missing | OK | percent_visual: percent / fraction only. |
| 151 | Decimal number line ↔ number | partial | OK | Place only. The new read skill is right (nl_20 is whole numbers only). |
| 152 | Story ↔ fraction operation | partial | OK | — |
| 155 | Select all factors | ok | OK | factors_identify: production fill. |
| 156 | Mixed number × whole | missing | OK | mult_frac_whole: 10/10 a/b × n. |
| 157 | Equalise two groups | missing | OK | — |
| 159 | Model ↔ unit-fraction sum | regrade | OK | Both directions live; confirmed. |
| 160, 161 | Decimal expanded / word form | missing | OK | — |
| 174 | Graph ↔ sentence | missing | OK | bar_graph / pictograph / tally: one-number questions. |
| 175, 177 | Shape ↔ property; ruler ↔ number | ok | OK | — |
| 178, 179 | Area equation; unit cubes | partial | OK | — |
| 180, 182 | Order by length; non-standard units | ok | OK | dnd order; "How many crayons long". |
| 184 | Measure an object not at 0 | partial | OK (proposal nit, D-7) | reading_ruler: an arrow from 0. |
| 186 | Estimate length | ok | OK | MC + click-all reasonable. |
| 190, 191 | Convert large → small; conversion table | ok / missing | OK | — |
| 192, 193 | Coins value; make an amount | ok / partial | OK | equiv_coin_sets yes/no; fewest coins only. |
| 195 | Money two-step | missing | OK | money "Add the prices", enough_money, remainder_contexts: one step. |
| 196, 198 | Clocks K-1; elapsed time | ok | OK | — |
| 199 | Elapsed time stories | partial | OK | 5 elapsed skills: "Use the time line" with no story; the cell payload has times only. |
| 200, 203, 205 | Thermometer, rectilinear area, prism volume | ok | OK | volume has the missing-edge item. |
| 202 | Same area, different perimeter | partial | OK | dual P / A of one shape. |
| 207 | Area of triangle / parallelogram | ok | X (D-4) | area_triangle only; no parallelogram skill in SKILLS. |
| 208–211 | Name 2-D / 3-D, positions, count faces | ok | OK | — |
| 214 | Partition into equal shares | partial | OK / X (D-3) | `also` fixed; representation residue. |
| 215 | Regular / irregular polygons | partial | OK | — |
| 217, 218, 221–224 | Lines, angles, additive, triangles, quads, symmetry | ok | OK | Click-all and hot-spot forms. |
| 219 | Protractor | regrade | OK | — |
| 225, 228 | 3-D properties; four quadrants | partial | OK | — |
| 226, 231, 234, 235, 243 | Coordinates, sort, bar graph read / build, mean | ok | OK | — |
| 233, 236 | Keyed pictograph build; scaled bar build | partial | OK | build_pictograph options: tiles / band only. |
| 238 | Tally from data | missing | OK | → collect_data. |
| 244 | Heavier / lighter B&W | regrade | OK / X (D-1) | Emoji answers confirmed. The proposal duplicates `vis_migrate_measures`. |
| 245 | Choose ALL equal to a time | partial | OK | unit_conversions form 1 "Click ALL equivalent to 1 foot"; units metric / customary only. |
| 246, 248, 249 | Volume expressions; two-attribute sort; choose terms | missing / missing / ok | OK | — |
| 251 | Show change with coins | partial | OK | money_change: "Subtract to find the change" (number). |
| 256, 257, 258 | Grid ↔ pair; table ↔ graph; composite volume | ok / partial / missing | OK | volume_composite: 5/5 single prisms (the bug is confirmed). |

**Proposals graded (31).**
- **Touched in round 6, all checked:**
  - `map_add_turnaround` — sound. The host name covers two addends, and it is distinct from `equal_sign_repair`.
  - `map_compare_pick` — sound.
  - The `decompose_fractions` option (`map_frac_unit_build`) — sound; D-7 nit.
  - `read_decimal_number_line` (`map_nl_read_decimal`) — sound. It is a new skill because `nl_20` / number_line_scales is
    whole numbers only.
  - `map_conv_time_choose_all` — sound. "Measurement Conversions" covers time, and form 1 is the live click-all.
  - `map_money_build` — sound.
  - `map_graph_sentence` — sound. `map_graph_sentence_picto` has a D-2 nit.
  - `map_shape_partition_pick` — D-3 nit.
  - `map_heavier_lighter_bw` — **D-1**.
  - `map_shape_attribute_sort` — sound. The reuse sweep names `vis_sort_diagrams` and WRM `shape_sort`. The example is
    right: every non-square kite has an acute angle.
- **Other new proposals:**
  - Sound: `map_order_whole_decimal_mixed` (L1 nit), `map_symmetry_check_line`, `map_area_pick`, `map_volume_expressions`,
    `map_function_table_context`, `map_units_to_number`, `map_another_way_to_make`, `map_mult_prop_grouping`,
    `map_compose_solids`, `map_equal_frac_build` and `map_change_unknown_story`.
  - Nit: `map_div_tens` and `map_ruler_measure_object` (D-7).
- **Reused, checked against their sources:** `add_three_forms` (mapClause correct), `time_convert` (D-5), `angle_rules`,
  `collect_data`, `money_uk`, `nl_20`, `decimal_pv`, `dec_pv_within1`, `thousandths_pv` and `partition_draw`.

## Defects

1. **`map_heavier_lighter_bw` (row #244) duplicates a build-list entry and makes B&W optional.**
   - VISUAL_BUILDS `vis_migrate_measures` (build-list.js:953) already plans "heavier_lighter_visual (a pan balance, not
     emoji)" and hosts `measurement:heavier_lighter_visual`.
   - The MAP proposal re-specifies that redraw as an opt-in `look "bw"`. That would leave the colour emoji as the default,
     against the B&W contract, which applies on every page and every host.
   - Its `why` also says "the pan-balance form is WRM balance … not repeated here", yet its option text and its example are
     a pan balance.
   - Fix:
     - Point #244 at reused `vis_migrate_measures`, with a mapClause: label answer from a bank on paper and click the object
       on screen.
     - Keep only "order three, lightest → heaviest" as a small option, or drop the proposal.
     - Rewrite the `why`.
2. **`map_graph_sentence_picto` is copied without adapting it to its host.**
   - The representation says "single grey bars", and the misconception says "reads the bar length in squares".
   - L1 asks for "key 1", but `graphs:pictograph` has `scale` 2 / 5 / 10 / 25 only. The key-1 picture graph is
     `pictograph_intro`.
   - Fix: say "picture rows", use a key-misreading misconception ("counts pictures, ignores the key"), and start L1 at key 2
     (or say that pictograph_intro supplies key 1).
3. **Round-4 D-4 residue.** The representation of `map_shape_partition_pick` still says "or one blank shape the pupil cuts
   with a pencil line (cut form) … draw a cut line (production), never MC for the cut form". Cutting is `partition_draw`.
   Fix: delete the cut-form clauses.
4. **Two exists-ok rows whose task text claims more than the skill deals.**
   - #207 "Area of a triangle / parallelogram": no skill deals parallelogram area (area_triangle only).
   - #42 "Add three numbers / properties of addition": add_three only computes, and #43 marks properties as missing.
   - Fix: trim the tasks to "Area of a triangle" and "Add three numbers". Alternatively, make #207 partial with a proposal
     for 6.G.A.1 parallelograms, and note that it is grade 6.
5. **Reused `time_convert` has a stale added `why`.** It says "MAP adds the decimal/mixed-hours **and choose-all** clauses",
   but choose-all now lives on `map_conv_time_choose_all` and the mapClause is decimal and mixed hours only. Fix: drop
   "and choose-all".
6. **Stale text in the report and a row.**
   - `report-tail.md` (and so MAP-report.md, "Bugs found") cites deleted `map_volume_two_prisms`. It should be
     `volume_composite_repair`.
   - The `closes` of #35 still says vis_story_strip is "a merge-tool kind the part cannot carry; the lead should link it",
     but it is already in `also`. Fix: drop that sentence.
7. **Proposal nits** (a minute each):
   - **`map_div_tens`** ("divisor multiple of 10", "Divide by Multiples of Ten"): L1 and problem type 2 are 360 ÷ 4, a
     one-digit divisor. Either drop them (that is tens ÷ ones) or word the option "a multiple of ten in the dividend or the
     divisor".
   - **`map_frac_unit_build`** (labels off, models past 1) and **`map_ruler_measure_object`** (offset start, cm): their
     drawings come from `vis_frac_bar_modes` (`labels`, `wholes`) and `vis_migrate_measures` + WRM `ruler_cm`. List them as
     `after` so the lead orders the builds.
   - **`map_order_whole_decimal_mixed`** L1 says "same whole part" but its example includes 6.9 among 7 and 7.4.

## Verdict

**PASS (8).** Every round-4 defect is fixed, and the root causes behind them are fixed too: visual sweeps, verbatim reuse
and host names. The statuses hold up under fresh generation. D-1 is the one substantive item left, and fixing it is a
re-point. D-2 to D-7 are cleanup a lead can do while merging.

## After the pass: round-5 defects fixed (lead, 2026-10-10)

All seven round-5 defects were fixed after this report; `merge.cjs` prints OK afterwards.
1. Heavier/lighter row → reused `vis_migrate_measures` + mapClause (label or clicked object, never emoji); `map_heavier_lighter_bw` kept only for "order three by mass" (in `also`).
2. `map_graph_sentence_picto` rewritten for picture graphs; key ladder 2 → 5 → 10/25 (key 1 is `pictograph_intro`).
3. Cut form removed from `map_shape_partition_pick`'s representation (cutting is `partition_draw`).
4. "Add three numbers (sum within 20)" no longer claims properties; triangle/parallelogram area row → partial, reused WRM `parallelogram`.
5. `time_convert`'s added `why` carries only the decimal/mixed-hours clause; choose-all is `map_conv_time_choose_all`.
6. report-tail names `volume_composite_repair`; row 35's `closes` matches its `also` (`vis_story_strip`).
7. `map_div_tens` divides by multiples of ten throughout; `map_frac_unit_build` after `vis_frac_bar_modes`; `map_ruler_measure_object` after `vis_migrate_measures`, `ruler_cm`; `map_order_whole_decimal_mixed` L1 example (7, 7.4, 7.25).
