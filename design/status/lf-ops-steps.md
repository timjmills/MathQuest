# lf-ops-steps — empty Steps panel on the column-multiplication lesson (2026-11-21)

Lane lf-ops (fixer, medium), branch `claude/sweet-newton-c8wrv1-lf-ops-steps` from master e0c90f8ad. Found by the lead on
master; no critic.

## Cause
`multiplication:mult_2by1_column` and `mult_3by1_column` are presets of `multiplication:multiply`, and `multiply` had **no
provider** (`js/modules/sheet/providers/` registered nothing for it). `anchors.js workedStepsOf` returns `[]` for a skill
without a real `workedSteps`, so `roles/lesson.js extras()` made no Steps zone (`zSteps` empty), but
`lesson-pages/we-do.js weDoBand` still drew the "Steps:" band beside Guided Practice, with an empty `.mq-lstepsbox`
(57.9 mm tall at M). The lesson's title fell back to the default "I Can work on basic multiplication" in the provider too.

## Fix (477a7498f)
- `providers/multiplication.js`: a `multiplication:multiply` provider for STACK items only (a whole number of 2+ digits ×
  ONE digit, `q.cell.template === 'stack'`, `op '*'`):
  - `workedSteps`: the column algorithm place by place ("Ones: 6 × 2 = 12. Write 2. Regroup 1 ten." … "The product is
    92."), with the stack's marks (`ones`/`tens`/`hundreds`, `regroup:<place>`, `answer`); expressions joined by no-break
    spaces (WRAP-OP).
  - `strings`: the default adapter's strings unchanged, plus general Steps for a column item (no example numbers, so they
    stand beside every item): 2-digit "Multiply the ones. / 10 or more? Write the ones. Regroup the tens. / Multiply the
    tens. Add the regrouped tens. / Write the product."; 3-digit four steps with one regroup step for every place (five
    steps stood the Guided cells 32 % empty, EB-BAND).
  - Every other multiply item (a fact, a 2-digit multiplier) answers exactly as the default adapter did.
- `roles/practice.js itemInstructionKey`: a provider whose strings keep the default adapter's placeholder key says so
  (`keyIsDefault`) and the host's key stands (else "Multiply." would have turned into the default "Write the answer.").

## Check
`ws-lesson-pages` STEPS-PANEL-EMPTY: every element labelled exactly "Steps:" on a lesson page, pupil and key (a band's
`.ws-strip` label, or the practice pages' `[data-mq-lesson-strip]`), must hold text once the label is taken off.
New modes: `--skills cat:skill,... --seed n --sizes M,L` (the request ws-lesson-baseline builds), `--all-skills` (every
lessons/prereqs.js lesson), `--grade all`. Self-test: 16 cases (3 new). Default rules: all three in `--skills` mode; the
`--grade` sweep keeps its two rules (it would block every precritic `--role lesson` run on the 400 logged lessons below);
`--grade all --rules STEPS-PANEL-EMPTY` is the full sweep. On precritic's path: new gate `lesson-pages-skills` on every
`--skill` run (`--skills <lane skills> --sizes M,L --rules STEPS-PANEL-EMPTY`). Backtest row `lesson-steps-panel-empty`
(FAIL e0c90f8ad → OK 477a7498f, ws-backtest PASS); ledger row in `design/lessons-first/CHECKS_FROM_CRITICS.md`.

## Gates (before e0c90f8ad → after)
| Gate | Before | After |
|---|---|---|
| ws-lesson-pages STEPS-PANEL-EMPTY, mult_2by1/3by1_column M+L seed 506061 | FAIL (4) | OK |
| ws-lesson-pages --all-skills M+L seed 4242 (45 master lessons, 692 pages) | OK | OK |
| ws-lesson-pages --grade 2,3,4 --blocks Y3.B4,Y4.B5,Y5.B5 | 20 flagged | 16 (Y3.B4.S4/S5, Y4.B5.S9/S10 fixed) |
| ws-boot-smoke | — | OK |
| ws-print-lint --source kit --roles lesson, 2by1+3by1, M | FAIL 22 (H13 side x20, PAGEFILL x2: 33 %) | FAIL 22, same classes (PAGEFILL 28 % / 25 %); no new class |
| ws-print-lint … L | FAIL 6 (H13 side x4, PAGEFILL x2: 22 %) | FAIL 4 (H13 side x4; PAGEFILL gone) |
| ws-empty-band --roles lesson M/L, 2by1+3by1 | FAIL 12 (EB-SIDE, pre-existing) | FAIL 12, the same cells; EB-BAND 0 |
| ws-lesson-baseline --all-lessons M,L seeds 4242,1 --unpinned | — | OK (2700 identical; no re-pin) |
| ws-roles-unit | — | OK (115) |
| ws-backtest --row lesson-steps-panel-empty | — | PASS |
| node --input-type=module --check (4 changed JS files) | — | OK |

Hash proof (seed 4242, M and L, pupil + key HTML, base vs head): identical for the lessons of addition:add_100_regroup,
addition:add_facts, division:div_2by1_long, multiplication:mult_2by2_standard; independent multiplication:multiply,
mult_2by2_standard, mult_facts, mult_2by1_column; guided multiplication:multiply. Changed: guided mult_2by1_column only.

## Pages that changed
- Lessons of mult_2by1_column / mult_3by1_column (no pinned lesson): a Model page (the worked steps, 3-4 states and the Say
  line) now opens the lesson; the Steps panel beside Guided Practice names the four steps; the first Guided cell shows the
  first step traced; the Practice page gains the Steps strip over its cells (its empty foot shrinks).
- Guided page of the column presets: a Steps band over the Guided cells.
- None of the 2700 pinned lesson pages.

## Other skills the check flags (logged, not fixed: a provider each)
The `--grade all` sweep of e0c90f8ad (843 WRM lessons, packet request, size M, each lesson's own seed): 840 print a Steps
panel, **404 print it empty**, 145 distinct first skills. Same cause class (no provider worked steps for the item the
lesson models), but each needs its own provider steps, so not cheap. Still open after this fix: Y5.B5.S3 (multiply
2-digit × 2-digit, a `fact` vertical item, which this provider leaves alone), and the rest below. A cheaper engine fix
(no Steps band when there are no steps, cells take the width) would change ~400 lessons' pages; it is the lead's call.

- `counting:count_sequence` (21): R.B3.S4, R.B3.S5, R.B5.S4, R.B5.S5, R.B7.S5, R.B7.S6, R.B9.S3, R.B9.S4, R.B11.S5, R.B11.S6, R.B13.S2, R.B13.S4, Y1.B1.S6, Y1.B1.S7, Y1.B1.S8, Y1.B1.S9, Y1.B4.S7, Y1.B4.S7, Y1.B4.S7, K|-|countingpatternsbeyond10teennumbers, K|-|onemoreandlesswithin5
- `measurement:heavier_lighter_visual` (15): R.B8.S1, R.B8.S2, R.B2.S2, Y1.B8.S1, Y1.B8.S3, Y2.B7.S1, Y3.B7.S5, K|-|comparemass1, G1|-|comparemass1, G2|-|comparemass1, K|-|comparemass2, G1|-|comparemass2, G2|-|comparemass2, K|-|comparesizemassandcapacityinformally, G3|-|introduceweightandmass
- `measurement:mass_volume_liquid` (10): Y2.B7.S2, Y2.B7.S3, Y2.B7.S6, Y2.B7.S7, Y3.B7.S1, Y3.B7.S2, Y3.B7.S3, Y3.B7.S7, Y3.B7.S8, 3:D4:36
- `shapes_early:name_2d_shapes` (10): R.B4.S1, R.B6.S1, R.B15.S2, Y1.B3.S3, Y2.B3.S1, Y3.B11.S7, Y5.B10.S9, K|-|deepeningunderstandingconsolidate2d3dshapes, K|-|explore2dshapescircletrianglerectanglesquare, K|-|shapeswith4sidessquaresandrectangles
- `comparing:compare_objects` (9): R.B10.S1, R.B10.S2, R.B10.S3, R.B10.S4, R.B2.S1, Y1.B7.S1, Y2.B6.S3, G2|-|comparesizemassandcapacityinformally, G1|-|lengthandheightcompareorder
- `number_sense:doubles_near_doubles` (9): R.B9.S7, R.B11.S11, R.B16.S6, Y1.B5.S4, Y1.B5.S5, Y1.B9.S7, G3|-|doublesandneardoubleswithin20, K|-|doublingupto55, G1|-|doublingupto55
- `patterns:shape_pattern` (9): R.B2.S4, R.B2.S5, R.B12.S5, R.B12.S6, R.B12.S7, R.B17.S1, R.B18.S2, Y1.B3.S5, Y2.B3.S12
- `shapes_early:compose_shapes` (9): R.B6.S2, R.B15.S3, R.B15.S4, R.B15.S5, R.B15.S6, K:D5:20, 1:D4:33, K|-|spatialreasoning1matchrotatemanipulate, K|-|spatialreasoning2composeanddecompose
- `conversions:f_to_d` (7): Y4.B8.S2, Y4.B8.S8, Y4.B9.S8, Y5.B7.S2, Y5.B7.S4, Y6.B9.S1, G5|-|writedecimals
- `multiplication:mult_zeros` (7): Y3.B4.S1, Y3.B4.S2, Y4.B5.S3, Y4.B5.S4, Y4.B5.S7, Y5.B3.S10, 4:D2:53
- `shapes_early:partition_shapes` (7): Y1.B10.S1, Y1.B10.S5, Y2.B8.S3, Y2.B8.S5, Y2.B8.S7, Y2.B8.S13, 3:D4:37
- `shapes_early:shape_positions` (7): R.B4.S4, R.B17.S6, R.B17.S7, Y1.B11.S4, Y2.B11.S1, K|-|positionallanguage, K|-|positionallanguageonunderinnextto
- `angles_lines:identify_angles` (6): Y3.B11.S3, Y3.B11.S2, Y4.B12.S2, Y4.B12.S3, Y5.B10.S2, Y6.B12.S1
- `composing:make_ten` (6): R.B11.S8, Y1.B2.S7, Y1.B5.S3, Y2.B2.S1, K|-|bondsto10explorecombinationsthatmake10, G1|-|bondsto10explorecombinationsthatmake10
- `fractions:fraction_of_set` (6): Y1.B10.S3, Y1.B10.S7, Y1.B10.S8, Y3.B8.S4, Y3.B8.S5, Y5.B6.S4
- `measurement:length_metric` (6): Y3.B5.S1, Y3.B5.S4, Y3.B5.S5, Y3.B5.S6, Y4.B6.S1, Y4.B6.S2
- `measurement:unit_conversions` (6): Y5.B14.S1, Y5.B14.S3, Y6.B5.S1, Y6.B5.S2, Y6.B5.S1, Y6.B5.S5
- `coordinates:geo_translate` (5): Y4.B14.S4, Y4.B14.S5, Y5.B11.S3, Y5.B11.S4, Y6.B13.S4
- `multiplication:multiply` (5): Y3.B4.S4 (fixed), Y3.B4.S5 (fixed), Y4.B5.S10 (fixed), Y4.B5.S9 (fixed), Y5.B5.S3
- `shapes_early:name_3d_shapes` (5): R.B12.S1, Y1.B3.S1, Y3.B11.S9, K|-|3dshapescubecuboidsphereconecylinder, G4|-|3dshapescubecuboidsphereconecylinder
- `shapes_early:shape_attributes` (5): R.B4.S2, Y1.B3.S4, K:D5:19, Y4.B12.S6, K|-|circlesandtrianglesproperties
- `addition:add_sub_10s` (4): Y2.B2.S4, Y2.B2.S14, Y3.B2.S1, Y3.B2.S3
- `angles_lines:additive_angles` (4): 4:D4:27, Y5.B10.S6, Y5.B10.S7, Y6.B12.S2
- `area_perimeter:perimeter_grid` (4): Y3.B5.S11, Y4.B6.S3, Y4.B6.S5, Y4.B6.S7
- `conversions:f_to_p` (4): Y5.B7.S13, Y5.B7.S15, Y6.B9.S4, Y6.B9.S5
- `coordinates:coordinate_q1` (4): Y4.B14.S1, Y4.B14.S2, Y5.B11.S1, Y6.B13.S1
- `decimals:add_decimal` (4): Y5.B12.S3, Y5.B12.S4, Y5.B12.S6, Y6.B8.S4
- `decimals:compare_thousandths` (4): Y5.B7.S6, Y5.B7.S9, Y6.B8.S1, Y6.B8.S2
- `fractions:improper_mixed` (4): Y4.B7.S7, Y4.B7.S8, Y5.B4.S4, Y5.B4.S5
- `fractions:order_fractions` (4): Y5.B4.S7, G3|-|orderfractions, G4|-|orderfractions, G5|-|orderfractions
- `graphs:build_pictograph` (4): Y2.B10.S4, Y2.B10.S6, Y3.B12.S2, Y3.B12.S2
- `integers:number_line_int` (4): Y6.B1.S8, Y6.B1.S8, Y5.B13.S1, Y6.B1.S8
- `measurement:capacity` (4): Y3.B7.S9, Y5.B14.S2, Y5.B15.S4, 4:D4:24
- `measurement:unit_conversion_word` (4): Y4.B11.S2, Y5.B14.S5, 4:D4:26, Y6.B5.S3
- `shapes_early:count_edges_faces_vertices` (4): Y2.B3.S8, Y2.B3.S9, Y2.B3.S10, Y5.B10.S10
- `angles_lines:measure_angles` (3): Y5.B10.S1, Y5.B10.S3, Y5.B10.S4
- `angles_lines:symmetry` (3): Y2.B3.S5, Y4.B12.S7, Y5.B11.S5
- `area_perimeter:area_unit_squares` (3): Y4.B3.S2, 3:D4:34, Y6.B10.S1
- `area_perimeter:perimeter` (3): Y3.B5.S12, Y4.B6.S4, Y5.B8.S1
- `conversions:ratio_intro` (3): Y6.B6.S2, Y6.B6.S3, Y6.B6.S4
- `coordinates:coord_polygon` (3): Y4.B14.S3, Y5.B11.S2, Y6.B13.S3
- `decimals:mult_decimal` (3): Y6.B8.S7, Y6.B8.S9, 5:D2:42
- `decimals:round_decimals` (3): Y4.B9.S7, Y5.B7.S11, Y6.B8.S3
- `division:divide` (3): Y4.B5.S13, Y5.B5.S8, Y5.B5.S9
- `fraction_operations:div_unit_frac_nv` (3): Y6.B4.S3, Y6.B4.S4, 5:D3:27
- `fractions:fraction_of_set_hard_nv` (3): Y5.B6.S6, Y6.B4.S6, Y6.B4.S7
- `graphs:line_plot_fractions` (3): 3:D4:38, 4:D4:23, 5:D4:21
- `multiplication:mult_placeholder_zero` (3): Y5.B5.S4, Y5.B5.S5, Y6.B2.S7
- `number_sense:compensation` (3): Y3.B2.S10, Y4.B2.S8, Y5.B2.S1
- `number_theory:factors_identify` (3): Y4.B5.S1, Y5.B3.S3, Y5.B3.S3
- `number_theory:multiples` (3): Y3.B3.S3, Y3.B3.S4, Y5.B3.S1
- `order_of_operations:exponents_simple` (3): Y5.B3.S6, Y5.B3.S7, Y6.B2.S6
- `patterns:double` (3): R.B9.S8, R.B11.S12, Y2.B5.S11
- `subtraction:sub_check_by_adding` (3): Y3.B2.S21, Y4.B2.S10, Y5.B2.S5
- `addition:add_20_no_regroup` (2): Y1.B5.S1, Y1.B5.S2
- `addition:add_sub_100s` (2): Y3.B2.S4, Y4.B2.S1
- `addition:add_three` (2): R.B11.S10, Y2.B2.S7
- `addition:number_families_add` (2): Y1.B5.S9, Y2.B2.S3
- `algebra:write_expression` (2): Y6.B7.S3, 5:D1:28
- `area_perimeter:area_triangle` (2): Y6.B10.S4, Y6.B10.S5
- `area_perimeter:composite_shapes` (2): Y5.B8.S2, Y6.B10.S2
- `conversions:d_to_f` (2): Y5.B7.S3, Y5.B7.S5
- `conversions:percent_of_number` (2): Y6.B9.S7, Y6.B9.S8
- `conversions:percent_visual` (2): Y5.B7.S12, Y6.B9.S3
- `coordinates:geo_reflect` (2): Y5.B11.S6, Y6.B13.S5
- `decimals:compare_decimal` (2): Y4.B9.S5, Y5.B7.S8
- `decimals:div_decimal` (2): Y6.B8.S8, 5:D2:43
- `decimals:sub_decimal` (2): Y5.B12.S5, Y5.B12.S7
- `division:box_division_hard` (2): Y5.B5.S7, Y6.B2.S9
- `fraction_operations:frac_10_100` (2): Y4.B8.S7, G4|-|hundredths
- `fractions:fraction_of_set_hard` (2): Y3.B8.S6, Y5.B6.S5
- `graphs:build_bar_graph` (2): Y3.B12.S4, Y3.B12.S4
- `graphs:pie_chart` (2): Y6.B11.S3, Y6.B11.S4
- `measurement:length_customary` (2): 4:D4:25, 5:D4:22
- `multiplication:equal_or_unequal_groups` (2): Y1.B9.S4, Y2.B5.S1
- `number_theory:gcf_easy` (2): Y5.B3.S4, Y6.B2.S2
- `number_theory:lcm` (2): Y5.B3.S2, Y6.B2.S3
- `number_theory:prime_composite` (2): Y5.B3.S5, Y6.B2.S5
- `order_of_operations:compare_expressions` (2): Y5.B2.S7, 5:D1:24
- `patterns:halve` (2): Y1.B10.S4, Y2.B8.S4
- `shapes_classify:classify_quads` (2): Y4.B12.S5, 5:D5:17
- `shapes_classify:classify_triangles` (2): Y4.B12.S4, Y6.B12.S5
- `subtraction:sub_10k_regroup` (2): Y4.B2.S6, Y4.B2.S7
- `subtraction:sub_1k_regroup` (2): Y3.B2.S15, Y3.B2.S16
- `addition:add_10_mixed` (1): Y1.B2.S17
- `addition:add_10_regroup` (1): Y2.B2.S6
- `addition:add_1m_mixed` (1): Y6.B2.S1
- `addition:comparison_word` (1): Y1.B5.S8
- `algebra:evaluate_expression` (1): Y6.B7.S4
- `algebra:evaluate_expression_hard` (1): Y6.B7.S5
- `algebra:solve_eq_addsub` (1): Y6.B7.S7
- `algebra:solve_eq_twostep` (1): Y6.B7.S8
- `algebra:write_equation` (1): Y6.B7.S6
- `angles_lines:identify_lines` (1): Y3.B11.S6
- `area_perimeter:area` (1): Y5.B8.S4
- `area_perimeter:area_distributive_visual` (1): 3:D4:35
- `area_perimeter:area_polygon_decompose` (1): Y5.B8.S5
- `area_perimeter:volume` (1): Y6.B10.S8
- `conversions:d_to_p` (1): Y5.B7.S14
- `conversions:double_num_line` (1): Y6.B6.S9
- `conversions:equiv_ratios` (1): Y6.B6.S8
- `conversions:find_whole_from_pct` (1): Y6.B9.S9
- `conversions:order_fdp` (1): Y6.B9.S6
- `conversions:ratio_tables` (1): Y6.B6.S10
- `coordinates:coordinate_all` (1): Y6.B13.S2
- `data_analysis:mean` (1): Y6.B11.S6
- `decimals:order_decimals` (1): Y4.B9.S6
- `division:box_division_easy` (1): Y3.B4.S7
- `division:missing_mult_div` (1): Y3.B4.S6
- `fraction_operations:add_frac_unlike_nv` (1): Y6.B3.S6
- `fraction_operations:decompose_fractions` (1): 4:D3:41
- `fraction_operations:frac_10_100_nv` (1): 4:D3:42
- `fraction_operations:frac_as_division` (1): Y6.B9.S2
- `fraction_operations:frac_word_problems` (1): Y6.B3.S9
- `fraction_operations:mult_scaling_nv` (1): 5:D3:26
- `fractions:compare_frac_lcd` (1): Y6.B3.S3
- `fractions:equiv_frac_nv` (1): Y4.B7.S10
- `fractions:equivalent` (1): Y6.B3.S1
- `fractions:fraction_of_set_nv` (1): Y5.B6.S7
- `fractions:graph_fractions` (1): Y6.B3.S2
- `fractions:mixed_improper_visual` (1): Y4.B7.S6
- `fractions:select_equiv_frac` (1): Y5.B4.S3
- `graphs:line_plot_g2` (1): 2:D4:50
- `integers:compare_int` (1): Y5.B13.S4
- `integers:sub_int` (1): Y5.B13.S5
- `multiplication:repeated_add_to_mult` (1): Y2.B5.S4
- `number_ops_mixed:mixed` (1): 5:D1:22
- `number_ops_mixed:word_problems_mixed` (1): Y5.B5.S11
- `number_sense:make_a_ten` (1): Y3.B2.S6
- `number_theory:divisibility_sort` (1): Y6.B2.S4
- `number_theory:factor_tchart_medium` (1): Y6.B7.S9
- `order_of_operations:nested_complex` (1): 5:D1:27
- `order_of_operations:two_ops_no_paren` (1): Y6.B2.S15
- `patterns:pattern_relationship` (1): 5:D1:25
- `shapes_classify:net_identify` (1): Y6.B12.S11
- `shapes_early:compose_from_attributes` (1): Y2.B3.S7
- `shapes_early:count_sides_vertices_2d` (1): Y2.B3.S2
- `shapes_early:measure_nonstandard` (1): Y1.B7.S2
- `shapes_early:order_objects_length` (1): Y2.B6.S4
- `shapes_early:shape_corners_count` (1): Y2.B3.S3
- `subtraction:missing_add_sub` (1): Y5.B2.S8
- `subtraction:sub_100k_regroup` (1): Y5.B2.S3
- `subtraction:sub_10_regroup` (1): Y2.B2.S10
- `subtraction:sub_1k_mixed` (1): Y3.B2.S18
- `subtraction:sub_20_no_regroup` (1): Y1.B5.S6
