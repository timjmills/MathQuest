# Preset skills — a distinct option is ALSO a findable skill

Owner rule, 2026-10-17 (CLAUDE.md, "A distinct option is ALSO a findable skill").

## The rule

When an option value makes a skill teach something **different enough to be its own lesson or page**
— a different problem type, representation, operation size class or task — that value set is ALSO a
named skill: its own label, grade, `SKILL_STANDARDS` / `SKILL_WRM` tags, search terms and an appended
share code. It is a **preset**: choosing it opens the HOST skill with those option values already set,
and the options stay editable. It is **not** a copy of the generator.

Small tweaks stay plain options: item count, Max Number / band within the same size class, a scaffold
or support on/off, pictures on/off, notation (across / stacked), the currency, how many rows or tiles a
chart shows, a review mix.

The test we used for "different enough": *would a teacher plan, print and title this as its own
lesson, and does a curriculum (CCSS cluster, WRM small step) name it separately?* If yes on both,
make it now. If only one, ask the owner.

## The mechanism

| Piece | Where | What it does |
|---|---|---|
| The table | `js/modules/skill-presets.js` | `SKILL_PRESETS['category:presetId'] = { skill: hostId, opts }`. Pure (imports nothing): data.js, the sheet kit and node gates all read it. `presetOf(cat, id)`, `isPreset`, `presetsOfHost`. |
| The skill id | `js/modules/data.js` `SKILLS[cat]` | Each preset is a normal entry **appended at the end** of its category, with `presetOf: '<host>'`. Grade in `SKILL_GRADES`. Print size and time category are **inherited** from the host by a loop after `SKILL_PRINT_SIZE`. |
| Share code | `js/modules/skill-codes-frozen.js` | Pinned at the code the auto-assigner gave it (`VA`…`VQ`; `VH` unused, a dropped draft), after pinning `composing:number_chart_fill` at its existing `U9`. ws-code-snapshot: count rises only. |
| Options | `js/modules/skill-options.js` | `ownOptionsFor` / `optionsFor` / `offeredOptionsFor` of a preset are the HOST's controls with the preset values as their **defaults** (`presetValue: true` on those defs). So `normalizeOptions(cat, preset, opts)` is "preset values under the explicit opts — explicit wins", `packOptions` / a share code carry only what the teacher changed, and the options panel opened from a preset shows the host's controls set to the preset values. The host's `OPTION_FOLDS` apply. |
| Option codec | `js/modules/skill-option-codec.js` | One addition: an enum whose legal values include `null` (e.g. multiply `tiles`, "Tables facts") can now write `null` as the token `X` when null is not the default — only a preset ever needs it ("2-digit × 2-digit" turned back to "Tables facts"). Old decoders skip the field (the preset's value). |
| Generation | `js/modules/generate-question.js` `generateQuestion()` | First thing: a preset is swapped to its host for this one call, with `normalizeOptions(host, normalizeOptions(preset, given))` where *given* is the caller's options or the teacher's set for the preset; state is restored in `finally`. Every surface goes through it: live play, worksheet, quiz, `generateQuestionFor` (print `buildSheet`, previews, audits), share codes, mixed play. The item carries `skillId` = host (so every host-keyed lookup — providers, cells, answer check — works), `presetId` and `requestedSkillId` = the preset. |
| Provider | `js/modules/sheet/contract.js` `getProvider()` | A preset without a provider of its own answers with its host's (`presetOf` set on the returned object). |
| Mixed pools | `data.js` `getMixedPoolSkills()` | Presets are left out of a category's mixed pool: the host is already in it, so a preset would only double its share. A preset picked by name in a custom mix generates normally. |
| Search | `js/modules/search-terms.js` | Each preset has its own `SKILL_TERMS` (≥ 5) and joins the host's concept (`column_mult`, `long_division` …). |
| Tags | `standards.js`, `wrm.js` | `SKILL_STANDARDS` (primary CCSS first + EE) and `SKILL_WRM` for the host steps that the preset's values ARE. |
| Library | `js/modules/teacher-library.js` | The detail panel of a preset says "Uses *host* with set options (you can change them)." Organizer / WRM page lists show it as a normal skill. |
| Gate | `tests/scripts/ws-presets-unit.mjs` | Host live, values legal, appended, defaults = preset values, explicit wins, seeded items identical to host-with-opts items, grade / print size / standards / terms / pinned code, the provider is the host's, option changes (incl. null) round-trip, not in a mixed pool. |
| Build list | `js/modules/build-list.js` | Every `kind: 'option'` standards entry carries `preset: true/false`: true when the option, once built, also becomes a preset (or is listed below for the owner). |

To add a preset: append the `SKILLS` entry (with `presetOf`), add the `SKILL_PRESETS` row, pin its code,
add `SKILL_GRADES`, `SKILL_STANDARDS`, `SKILL_WRM` (where a step fits) and `SKILL_TERMS`, then run
`ws-presets-unit`, `ws-code-snapshot`, `ws-search-terms`, `ws-standards`, `ws-content-audit --skill <id>`.

## Presets made (first batch, 2026-10-17; the second batch is under the audit below)

| Preset id | Label | Host + opts | Grade | CCSS (primary first) | EE | WRM |
|---|---|---|---|---|---|---|
| multiplication:mult_2by1_column | Multiply 2-Digit by 1-Digit Numbers (Column) | multiply `tiles: 21` | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y3.B4.S4, Y3.B4.S5, Y4.B5.S9 |
| multiplication:mult_3by1_column | Multiply 3-Digit by 1-Digit Numbers (Column) | multiply `tiles: 31` | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y4.B5.S10 |
| multiplication:mult_2by2_standard | Multiply 2-Digit by 2-Digit Numbers (Standard Algorithm) | multiply `tiles: 22` | 5 | 5.NBT.B.5, 4.NBT.B.5 | M.EE.5.NBT.5 | Y5.B5.S3 |
| multiplication:mult_chart_shade | Multiplication Chart: Shade the Multiples | mult_chart `task: 'shade'` | 3 | 3.OA.D.9 | M.EE.3.OA.8 | — |
| multiplication:mult_chart_pattern | Multiplication Chart: Find the Pattern in a Row | mult_chart `task: 'pattern'` | 3 | 3.OA.D.9 | M.EE.3.OA.8 | Y4.B4.S6 (partial) |
| multiplication:mult_chart_headers | Multiplication Chart: Find the Missing Factors | mult_chart `task: 'headers'` | 3 | 3.OA.A.4, 3.OA.C.7 | M.EE.3.OA.6 | — |
| multiplication:mult_multiples_of_ten | Multiply by Multiples of Ten (6 × 40) | mult_zeros `forms: [2]` | 3 | 3.NBT.A.3 | M.EE.3.NBT.3 | Y3.B4.S2 |
| division:div_2by1_long | Divide 2-Digit by 1-Digit Numbers (Long Division) | divide `tiles: 21` | 4 | 4.NBT.B.6 | M.EE.5.NBT.6 | Y3.B4.S7, Y4.B5.S11, Y4.B5.S12 |
| division:div_3by1_long | Divide 3-Digit by 1-Digit Numbers (Long Division) | divide `tiles: 31` | 4 | 4.NBT.B.6 | M.EE.5.NBT.6 | Y4.B5.S13 |
| division:div_4by1_long | Divide 4-Digit by 1-Digit Numbers (Long Division) | divide `tiles: 41` | 4 | 4.NBT.B.6 | M.EE.5.NBT.6 | Y5.B5.S7 (partial) |
| division:div_3by2_long | Divide 3-Digit by 2-Digit Numbers (Long Division) | divide `tiles: 32` | 5 | 5.NBT.B.6 | M.EE.5.NBT.6 | Y6.B2.S11 |
| fractions:compare_to_half | Compare Fractions to One Half | compare `forms: [2]` | 4 | 4.NF.A.2 | M.EE.4.NF.2 | — |
| placevalue:expanded_notation | Write Numbers in Expanded Notation | expand `form: 'notation'` | 4 | 4.NBT.A.2, 2.NBT.A.3 | M.EE.4.NBT.2 | — |
| number_sense:near_doubles | Near Doubles (Doubles Plus One, Doubles Minus One) | doubles_near_doubles `forms: [1, 2]` | 1 | 1.OA.C.6 | — | Y1.B5.S5 |

`mult_standard` (build list, Multi-Digit Multiplication: Standard Algorithm) records that 2×1, 3×1 and
2×2 now exist as presets; only the 4×1 (`mult_4x1`) and 3×2 sizes remain to build.

## The audit of `skill-options.js`

Every task / form / size / representation option was read (`ownOptionsFor` for every live skill; the
`forms` sets of the word-problem, integer, fraction, geometry, data and algebra skills; `task`, `form`,
`kind`, `model`, `tiles`, `mode`). Verdicts:

### Make now (built above)

multiply `tiles` 21 / 31 / 22 · divide `tiles` 21 / 31 / 41 / 32 · mult_chart `task` shade / pattern /
headers · mult_zeros `forms` [2] · fractions:compare `forms` [2] ·
doubles_near_doubles `forms` [1, 2] · placevalue:expand `form` notation.

### The rows that were "ask owner" (record; all decided 2026-10-17, see below)

| Host | Option values | Proposed preset label | Grade | CCSS | Why it is not "make now" |
|---|---|---|---|---|---|
| multiplication:mult_properties | `forms` [1] | Break Apart a Fact (Distributive Property) | 3 | 3.OA.B.5 | a clear lesson, but drafted then held back: the host prints an answer key with slots its pupil page lacks (print-lint AK-4 on mult_properties), and a preset would copy that defect onto a new page. Make it once the host key is fixed. |
| multiplication:area_model_mult | `tiles` 21 / 31 | Area Model: 2-Digit × 1-Digit / 3-Digit × 1-Digit | 4 | 4.NBT.B.5 | size split of an existing visual skill; the area model is already its own skill |
| multiplication:area_model_mult_hard | `tiles` 22 / 23 | Area Model: 2 × 2 Grid / 2 × 3 Grid | 5 | 5.NBT.B.5 | as above |
| multiplication:arrays_groups | `forms` [0] / [1] | Arrays (Rows of Dots) / Equal Groups (Rings) | 2–3 | 2.OA.C.4 / 3.OA.A.1 | WRM splits them; `dot_array_mult` already covers arrays |
| multiplication:mult_zeros | `forms` [0] / [1] | Multiply by 10 / Multiply by 100 | 3–4 | 3.NBT.A.3 | WRM Y4.B5.S3 / S4 are separate steps; CCSS is one |
| multiplication:count_by_tables | per-table `rows` | Count by 3s … Count by 12s | 2–3 | 3.OA.C.7 | 12 near-identical presets; the row builder already titles the page |
| multiplication:mult_word_problems | `forms` [2] | Multiplicative Comparison Word Problems | 4 | 4.OA.A.2 | `mult_comparison` already exists |
| division:div_word_problems | `forms` [0] / [1] | Sharing / Grouping Word Problems | 3 | 3.OA.A.2 | WRM teaches both in one step |
| division:div_word_problems | `forms` [2] | Interpret the Remainder | 4 | 4.OA.A.3 | `remainder_interpret` exists |
| addition / subtraction word problems | `forms` (start / part / difference unknown) | Start-Unknown Word Problems, Compare (How Many More?) | 1–2 | 1.OA.A.1 | the problem-type taxonomy is one CCSS standard |
| integers:add_int / sub_int | `forms` single sign case | Add a Negative Number, Subtract a Negative Number | 7 | 7.NS.A.1 | outside K-6 core; a sign case may be too small |
| fractions:identify / write_fraction / compare | `model` line | Fractions on a Number Line (identify / compare) | 3 | 3.NF.A.2 | representation change; existing NL skills overlap |
| fractions:equivalent | `forms` [1] | Equivalent or Not? | 4 | 4.NF.A.1 | a task kind; error-analysis role covers it |
| fractions:simplify | `forms` [2] | Simplify Using the Greatest Common Factor | 6 | 6.NS.B.4 | a strategy, not a new task |
| fraction_operations:div_unit_frac_nv | `forms` [0, 1] / [2, 3] | Unit Fraction ÷ Whole / Whole ÷ Unit Fraction | 5 | 5.NF.B.7a / 7b | CCSS splits them (7a, 7b) — strong candidate |
| decimals:div_decimal | `forms` [0] / [1, 2] | Divide a Decimal by a Whole / by a Decimal | 5–6 | 5.NBT.B.7 / 6.NS.B.3 | different grade standards — strong candidate |
| decimals:round_thousandths | `forms` [0] / [1] | Round to the Nearest Tenth / Hundredth | 5 | 5.NBT.A.4 | small tweak in most curricula |
| conversions:ratio_intro / equiv_ratios | `forms` | Write a Ratio / Simplest-Form Ratios | 6 | 6.RP.A.1, 6.RP.A.3 | task kinds of one lesson |
| area_perimeter:area / perimeter / volume | `forms` [1] | Find a Missing Side from the Area / Perimeter; Missing Edge from Volume | 3–5 | 3.MD.D.8, 5.MD.C.5b | CCSS names "unknown side lengths" explicitly — strong candidate |
| area_perimeter:composite_shapes | `forms` [1] | Area of Composite Shapes | 3 | 3.MD.C.7d | different measure |
| angles_lines:additive_angles | `forms` | Angles on a Straight Line / Around a Point | 4 | 4.MD.C.7 | WRM-style split |
| coordinates:coordinate_q1 / all | `forms` [1] | Plot Points on a Coordinate Grid | 5 | 5.G.A.2 | read vs plot — strong candidate |
| coordinates:geo_reflect / rotate / translate | `forms` | Reflect in the x-axis … | 6+ | 8.G.A.1 | small tweak within one transformation |
| graphs:pictograph / bar_graph / tally_chart | `forms` [3] / [2] | How Many More? (graph questions) | 2–3 | 2.MD.D.10, 3.MD.B.3 | question kinds of one graph |
| data_analysis:box_plot_intro | `forms` [3] | Quartiles from a Box Plot | 6 | 6.SP.B.5c | |
| algebra:solve_eq_addsub / multdiv / twostep | `forms` | Solve x + a = b; Solve ax = b … | 6 | 6.EE.B.7 | one standard, several forms |
| algebra:write_equation | `forms` [2, 3] | Write an Equation for a Story | 6 | 6.EE.B.7 | |
| algebra:distributive_expr | `forms` [2] | Factor Out the Greatest Common Factor | 6 | 6.NS.B.4, 6.EE.A.3 | a different operation (factor vs expand) — strong candidate |
| algebra:function_table_easy / hard | `ftTable` / `task` modes (find outputs / find the rule) | Function Tables: Find the Rule | 3–5 | 4.OA.C.5, 5.OA.B.3 | the easy/hard twins already split by task |
| order_of_operations:exponents_simple | `forms` [1] | Cube Numbers | 5–6 | 6.EE.A.1 | small |
| number_sense:estimate_sums_diffs / products / quotient | `task` reasonable | Is the Answer Reasonable? | 3–4 | 3.OA.D.8, 4.OA.A.3 | a task kind across three skills |
| placevalue:value | `form` unit / notation | Value of a Digit in Unit Form | 2–4 | 2.NBT.A.1 | `unit_form` already exists |
| placevalue:place_value_disks | `task` count | Count the Place-Value Disks | 2 | 2.NBT.A.1 | |
| composing:number_word_form | the form choice (numeral ↔ word) | Write Numbers in Words | 2 | 2.NBT.A.3 | direction of one task |
| measurement:money_count | `kind` note / both | Count Notes (Bills) | 2 | 2.MD.C.8 | currency-dependent |
| measurement:length_customary / length_metric | `forms` | Feet to Inches … | 4 | 4.MD.A.1 | small tweak |
| measurement:clock_parts / time_fives_ring / coin_value / money_notation | `task` | (each task) | 1–2 | — | tasks of a K-2 lesson |
| number_theory:prime_composite / multiples / gcf / lcm | `forms` | (click / sort / list) | 4–6 | — | response formats, not lessons → probably plain |

### Owner decision, 2026-10-17: every "ask owner" row is a preset (second batch)

"Make them all separate skills as well as options." Every row this audit had marked *ask owner* is now
either **made** (below, one preset per distinct value) or **made when the option deals what it says**
(the short list after the table). Nothing is left to ask.

Each preset was sampled (12 seeded items, two pages) and held to its own name before it was kept; the
content audit then ran in full. Where a host's option did not deal what its own label said, the host was
fixed if the fix was small and safe (see *Host fixes* below), else the preset was not made.

#### Made (second batch: 100 presets, codes `VT` … `Y5`)

| Preset id | Label | Host + opts | Code | Grade | CCSS (primary first) | EE | WRM |
|---|---|---|---|---|---|---|---|
| multiplication:mult_break_apart | Break Apart a Fact (Distributive Property) | mult_properties `forms: [1]` | VV | 3 | 3.OA.B.5 | — | Y4.B5.S15 (partial) |
| multiplication:area_model_2by1 | Area Model: Multiply 2-Digit by 1-Digit | area_model_mult `tiles: 21` | VW | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y3.B4.S4, Y4.B5.S9 |
| multiplication:area_model_3by1 | Area Model: Multiply 3-Digit by 1-Digit | area_model_mult `tiles: 31` | VX | 4 | 4.NBT.B.5 | M.EE.5.NBT.5 | Y4.B5.S10 |
| multiplication:mult_arrays | Arrays: Rows of Dots | arrays_groups `forms: [0]` | V2 | 2 | 2.OA.C.4, 3.OA.A.1 | M.EE.2.OA.4, M.EE.3.OA.1 | Y1.B9.S6, Y2.B5.S6, Y3.B3.S2 |
| multiplication:mult_equal_groups | Equal Groups: Rings of Dots | arrays_groups `forms: [1]` | V3 | 3 | 3.OA.A.1, 2.OA.C.4 | M.EE.3.OA.1 | Y1.B9.S5, Y2.B5.S3, Y3.B3.S1 |
| multiplication:mult_by_ten | Multiply by 10 | mult_zeros `forms: [0]` | V4 | 3 | 3.NBT.A.3, 4.NBT.A.1 | M.EE.3.NBT.3 | Y3.B4.S1, Y4.B5.S3 |
| multiplication:mult_by_hundred | Multiply by 100 | mult_zeros `forms: [1]` | V5 | 4 | 4.NBT.A.1, 3.NBT.A.3 | M.EE.3.NBT.3 | Y4.B5.S4 |
| multiplication:count_by_2s | Count by 2s | count_by_tables `rows: [{'step':2, 'start':'step', 'dir':'up'}]` | V6 | 2 | 2.NBT.A.2, 3.OA.C.7 | M.EE.2.NBT.2 | Y2.B5.S9 |
| multiplication:count_by_3s | Count by 3s | count_by_tables `rows: [{'step':3, 'start':'step', 'dir':'up'}]` | V7 | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | Y3.B3.S8 |
| multiplication:count_by_4s | Count by 4s | count_by_tables `rows: [{'step':4, 'start':'step', 'dir':'up'}]` | V8 | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | Y3.B3.S11 |
| multiplication:count_by_5s | Count by 5s | count_by_tables `rows: [{'step':5, 'start':'step', 'dir':'up'}]` | V9 | 2 | 2.NBT.A.2, 3.OA.C.7 | M.EE.2.NBT.2 | Y2.B5.S15 |
| multiplication:count_by_6s | Count by 6s | count_by_tables `rows: [{'step':6, 'start':'step', 'dir':'up'}]` | WA | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | — |
| multiplication:count_by_7s | Count by 7s | count_by_tables `rows: [{'step':7, 'start':'step', 'dir':'up'}]` | WB | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | — |
| multiplication:count_by_8s | Count by 8s | count_by_tables `rows: [{'step':8, 'start':'step', 'dir':'up'}]` | WC | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | Y3.B3.S14 |
| multiplication:count_by_9s | Count by 9s | count_by_tables `rows: [{'step':9, 'start':'step', 'dir':'up'}]` | WD | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | — |
| multiplication:count_by_10s | Count by 10s | count_by_tables `rows: [{'step':10, 'start':'step', 'dir':'up'}]` | WE | 2 | 2.NBT.A.2, 3.OA.C.7 | M.EE.2.NBT.2 | Y2.B5.S13 |
| multiplication:count_by_11s | Count by 11s | count_by_tables `rows: [{'step':11, 'start':'step', 'dir':'up'}]` | WF | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | — |
| multiplication:count_by_12s | Count by 12s | count_by_tables `rows: [{'step':12, 'start':'step', 'dir':'up'}]` | WG | 3 | 3.OA.C.7, 3.OA.D.9 | M.EE.3.OA.8 | — |
| division:div_sharing_word_problems | Division Word Problems: Sharing | div_word_problems `forms: [0]` | WJ | 3 | 3.OA.A.2, 3.OA.A.3 | M.EE.3.OA.2 | Y3.B3.S5 |
| division:div_grouping_word_problems | Division Word Problems: Grouping | div_word_problems `forms: [1]` | WK | 3 | 3.OA.A.2, 3.OA.A.3 | M.EE.3.OA.2 | Y3.B3.S5 |
| subtraction:sub_wp_compare | Subtraction Word Problems: How Many More? | sub_word_problems `forms: [1]` | VT | 1 | 1.OA.A.1, 2.OA.A.1 | M.EE.1.OA.1 | — |
| subtraction:sub_wp_start_unknown | Subtraction Word Problems: Find the Start | sub_word_problems `forms: [2]` | VU | 2 | 1.OA.A.1, 2.OA.A.1 | M.EE.1.OA.1 | — |
| integers:add_negative | Add a Negative Number | add_int `forms: [1]` | WM | 6 | 6.NS.C.5, 6.NS.C.6a (approx) | M.EE.6.NS.5, M.EE.6.NS.6 | — |
| integers:sub_negative | Subtract a Negative Number | sub_int `forms: [1]` | WN | 6 | 6.NS.C.5, 6.NS.C.6a (approx) | M.EE.6.NS.5, M.EE.6.NS.6 | — |
| fractions:identify_fraction_nl | Identify Fractions on a Number Line | identify `model: ['line'], forms: [0]` | WP | 3 | 3.NF.A.2, 3.NF.A.1 | M.EE.3.NF.2 | — |
| fractions:write_fraction_nl | Write the Fraction Shown on a Number Line | write_fraction `model: ['line']` | WQ | 3 | 3.NF.A.2, 3.NF.A.1 | M.EE.3.NF.2 | — |
| fractions:compare_fractions_nl | Compare Fractions on a Number Line | compare `model: ['line'], forms: [0]` | WR | 3 | 3.NF.A.3d, 3.NF.A.2 | M.EE.3.NF.3 | — |
| fractions:equivalent_or_not | Equivalent Fractions: Yes or No? | equivalent `forms: [1]` | WS | 4 | 4.NF.A.1 | M.EE.4.NF.1 | — |
| fractions:simplify_with_gcf | Simplify Fractions Using the Greatest Common Factor | simplify `forms: [2]` | WT | 6 | 6.NS.B.4, 4.NF.A.1 | M.EE.4.NF.1 | Y6.B3.S1 |
| fraction_operations:unit_frac_div_whole | Divide a Unit Fraction by a Whole Number | div_unit_frac_nv `forms: [2, 3]` | WU | 5 | 5.NF.B.7a | — | Y6.B4.S3 |
| fraction_operations:whole_div_unit_frac | Divide a Whole Number by a Unit Fraction | div_unit_frac_nv `forms: [0, 1]` | WV | 5 | 5.NF.B.7b | — | — |
| decimals:div_decimal_by_whole | Divide a Decimal by a Whole Number | div_decimal `forms: [0]` | WW | 5 | 5.NBT.B.7 | M.EE.5.NBT.7 | Y6.B8.S8 |
| decimals:div_by_decimal | Divide by a Decimal | div_decimal `forms: [1, 2]` | WX | 6 | 6.NS.B.3, 5.NBT.B.7 | M.EE.6.NS.3 | — |
| decimals:round_to_tenth | Round Decimals to the Nearest Tenth | round_thousandths `forms: [0]` | WY | 5 | 5.NBT.A.4 | M.EE.5.NBT.4 | Y5.B7.S11 |
| decimals:round_to_hundredth | Round Decimals to the Nearest Hundredth | round_thousandths `forms: [1]` | WZ | 5 | 5.NBT.A.4 | M.EE.5.NBT.4 | Y6.B8.S3 |
| conversions:ratio_part_to_part | Write a Part-to-Part Ratio | ratio_intro `forms: [0]` | W2 | 6 | 6.RP.A.1 | M.EE.6.RP.1 | Y6.B6.S2 |
| conversions:ratio_simplest_form | Write a Ratio in Simplest Form | equiv_ratios `forms: [2]` | W4 | 6 | 6.RP.A.3a, 6.RP.A.1 | M.EE.6.RP.1 | — |
| conversions:ratio_equivalent_or_not | Equivalent Ratios: Yes or No? | equiv_ratios `forms: [1]` | W5 | 6 | 6.RP.A.3a | — | — |
| area_perimeter:area_missing_side | Find a Missing Side from the Area | area `forms: [1]` | W6 | 3 | 3.MD.C.7b, 4.MD.A.3 | M.EE.4.MD.3 | — |
| area_perimeter:perimeter_missing_side | Find a Missing Side from the Perimeter | perimeter `forms: [1]` | W7 | 3 | 3.MD.D.8, 4.MD.A.3 | M.EE.4.MD.3 | — |
| area_perimeter:volume_missing_edge | Find a Missing Edge from the Volume | volume `forms: [1]` | W8 | 5 | 5.MD.C.5b | M.EE.5.MD.5 | — |
| area_perimeter:composite_area_perimeter | Area and Perimeter of Composite Shapes | composite_shapes `forms: [1]` | W9 | 3 | 3.MD.C.7d, 6.G.A.1 | M.EE.6.G.1 | Y5.B8.S5 |
| angles_lines:angles_in_right_angle | Missing Angle in a Right Angle (90°) | additive_angles `forms: [0]` | XA | 4 | 4.MD.C.7 | — | — |
| angles_lines:angles_on_straight_line | Angles on a Straight Line (180°) | additive_angles `forms: [1]` | XB | 4 | 4.MD.C.7 | — | Y5.B10.S7 (partial) |
| angles_lines:angles_around_point | Angles Around a Point (360°) | additive_angles `forms: [2]` | XC | 4 | 4.MD.C.7 | — | Y5.B10.S6 (partial) |
| coordinates:coordinates_read_q1 | Read Coordinates in the First Quadrant | coordinate_q1 `forms: [0]` | XD | 5 | 5.G.A.2, 5.G.A.1 | M.EE.5.G.1 | Y4.B14.S1, Y5.B11.S1 |
| coordinates:coordinates_plot_q1 | Plot Points in the First Quadrant | coordinate_q1 `forms: [1]` | XE | 5 | 5.G.A.1, 5.G.A.2 | M.EE.5.G.1 | Y4.B14.S2 |
| coordinates:coordinates_read_all | Read Coordinates in All Four Quadrants | coordinate_all `forms: [0]` | Y2 | 6 | 6.NS.C.6c, 6.NS.C.8 | M.EE.6.NS.6 | Y6.B13.S2 |
| coordinates:coordinates_plot_all | Plot Points in All Four Quadrants | coordinate_all `forms: [1]` | Y3 | 6 | 6.NS.C.6c, 6.NS.C.8 | M.EE.6.NS.6 | Y6.B13.S2 |
| coordinates:reflect_x_axis | Reflect a Shape in the x-Axis | geo_reflect `forms: [0]` | XF | 5 | 6.NS.C.6b (approx) | M.EE.6.NS.6 | Y6.B13.S5 |
| coordinates:reflect_y_axis | Reflect a Shape in the y-Axis | geo_reflect `forms: [1]` | XG | 5 | 6.NS.C.6b (approx) | M.EE.6.NS.6 | Y6.B13.S5 |
| coordinates:rotate_half_turn | Rotate a Shape a Half Turn (180°) | geo_rotate `forms: [0]` | XH | 5 | 4.MD.C.5a (approx) | — | — |
| coordinates:rotate_quarter_turn | Rotate a Shape a Quarter Turn (90°) | geo_rotate `forms: [1]` | XJ | 5 | 4.MD.C.5a (approx) | — | — |
| coordinates:rotate_three_quarter_turn | Rotate a Shape a Three-Quarter Turn (270°) | geo_rotate `forms: [2]` | XK | 5 | 4.MD.C.5a (approx) | — | — |
| coordinates:translate_right_up | Translate a Shape Right and Up | geo_translate `forms: [0]` | XL | 5 | 5.G.A.1 (approx) | M.EE.5.G.1 | Y5.B11.S3 |
| coordinates:translate_left_up | Translate a Shape Left and Up | geo_translate `forms: [1]` | XM | 5 | 5.G.A.1 (approx) | M.EE.5.G.1 | Y5.B11.S3 |
| coordinates:translate_right_down | Translate a Shape Right and Down | geo_translate `forms: [2]` | XN | 5 | 5.G.A.1 (approx) | M.EE.5.G.1 | Y5.B11.S3 |
| coordinates:translate_left_down | Translate a Shape Left and Down | geo_translate `forms: [3]` | XP | 5 | 5.G.A.1 (approx) | M.EE.5.G.1 | Y5.B11.S3 |
| graphs:pictograph_how_many_more | Pictographs: How Many More? | pictograph `forms: [3]` | X5 | 3 | 3.MD.B.3 | M.EE.3.MD.3 | — |
| graphs:bar_graph_how_many_more | Bar Graphs: How Many More? | bar_graph `forms: [2]` | X6 | 3 | 3.MD.B.3, 2.MD.D.10 | M.EE.3.MD.3 | Y4.B13.S2 (partial) |
| graphs:tally_how_many_more | Tally Charts: How Many More? | tally_chart `forms: [3]` | X7 | 2 | 2.MD.D.10, 1.MD.C.4 | M.EE.1.MD.4 | — |
| data_analysis:box_plot_quartiles | Quartiles and the Interquartile Range (Box Plot) | box_plot_intro `forms: [3]` | X8 | 6 | 6.SP.B.5c, 6.SP.B.4 | M.EE.6.SP.5 | — |
| algebra:solve_x_plus_a | Solve x + a = b | solve_eq_addsub `forms: [1]` | X9 | 6 | 6.EE.B.7 | M.EE.6.EE.5-7 | Y6.B7.S7 |
| algebra:solve_x_minus_a | Solve x − a = b | solve_eq_addsub `forms: [2]` | YA | 6 | 6.EE.B.7 | M.EE.6.EE.5-7 | Y6.B7.S7 |
| algebra:solve_ax_eq_b | Solve ax = b | solve_eq_multdiv `forms: [1, 2]` | YB | 6 | 6.EE.B.7 | M.EE.6.EE.5-7 | Y6.B7.S7 |
| algebra:solve_x_div_a | Solve x ÷ a = b | solve_eq_multdiv `forms: [3]` | YC | 6 | 6.EE.B.7 | M.EE.6.EE.5-7 | Y6.B7.S7 |
| algebra:solve_ax_plus_b | Solve ax + b = c | solve_eq_twostep `forms: [0]` | YD | 6 | 6.EE.B.7 (approx) | M.EE.6.EE.5-7 | Y6.B7.S8 |
| algebra:solve_ax_minus_b | Solve ax − b = c | solve_eq_twostep `forms: [2]` | YE | 6 | 6.EE.B.7 (approx) | M.EE.6.EE.5-7 | Y6.B7.S8 |
| algebra:solve_x_div_a_plus_b | Solve x ÷ a + b = c | solve_eq_twostep `forms: [3]` | YF | 6 | 6.EE.B.7 (approx) | M.EE.6.EE.5-7 | — |
| algebra:solve_bracket_div | Solve (x − b) ÷ a = c | solve_eq_twostep `forms: [1]` | YG | 6 | 6.EE.B.7 (approx) | M.EE.6.EE.5-7 | — |
| algebra:write_equation_story | Write an Equation for a Story | write_equation `forms: [2, 3]` | YH | 6 | 6.EE.B.7, 6.EE.B.6 | M.EE.6.EE.5-7 | Y6.B7.S6 |
| algebra:factor_out_gcf | Factor Out the Greatest Common Factor | distributive_expr `forms: [2]` | YJ | 6 | 6.NS.B.4, 6.EE.A.3 | M.EE.6.EE.3 | — |
| algebra:function_table_find_rule | Function Tables: Find the Rule | function_table_easy `ftTask: 'rule'` | YK | 4 | 4.OA.C.5, 5.OA.B.3 | M.EE.4.OA.5 | — |
| algebra:function_table_find_inputs | Function Tables: Find the Missing In Numbers | function_table_easy `ftTask: 'inputs'` | YL | 4 | 4.OA.C.5, 5.OA.B.3 | M.EE.4.OA.5 | — |
| order_of_operations:square_numbers | Square Numbers (5²) | exponents_simple `forms: [0], step: [0]` | YM | 5 | 6.EE.A.1 | M.EE.6.EE.1-2 | Y5.B3.S6 (partial) |
| order_of_operations:cube_numbers | Cube Numbers (5³) | exponents_simple `forms: [1], step: [0]` | YN | 5 | 6.EE.A.1 | M.EE.6.EE.1-2 | — |
| number_sense:reasonable_quotients | Is the Quotient Reasonable? | estimate_quotient `task: 'reasonable'` | YU | 4 | 4.OA.A.3, 4.NBT.B.6 | M.EE.4.OA.3 | — |
| placevalue:digit_value_unit_form | Value of a Digit in Unit Form (7 Hundreds) | value `form: 'unit'` | YP | 2 | 2.NBT.A.1, 4.NBT.A.1 | M.EE.2.NBT.1 | Y2.B1.S4 |
| placevalue:digit_value_notation | Value of a Digit in Expanded Notation (7 × 100) | value `form: 'notation'` | YQ | 4 | 4.NBT.A.2, 2.NBT.A.1 | M.EE.4.NBT.2 | — |
| placevalue:count_pv_disks | Count the Place-Value Disks in One Place | place_value_disks `task: 'count'` | YR | 2 | 2.NBT.A.1 | M.EE.2.NBT.1 | — |
| composing:write_numbers_in_words | Write Numbers in Words | number_word_form `wordform: ['to_words']` | Y5 | 2 | 2.NBT.A.3 | M.EE.2.NBT.3 | Y2.B1.S6 |
| measurement:count_notes | Count Notes (Bills) | money_count `kind: 'note'` | XQ | 2 | 2.MD.C.8 | M.EE.2.MD.8 | Y2.B4.S2 (partial) |
| measurement:count_notes_and_coins | Count Notes and Coins | money_count `kind: 'both'` | XR | 2 | 2.MD.C.8 | M.EE.2.MD.8 | Y2.B4.S3 (partial) |
| measurement:convert_feet_to_inches | Convert Feet to Inches | length_customary `forms: [0]` | XS | 4 | 4.MD.A.1 | M.EE.4.MD.1 | — |
| measurement:convert_yards_to_feet | Convert Yards to Feet | length_customary `forms: [1]` | XT | 4 | 4.MD.A.1 | M.EE.4.MD.1 | — |
| measurement:convert_yards_to_inches | Convert Yards to Inches | length_customary `forms: [2]` | XU | 4 | 4.MD.A.1 | M.EE.4.MD.1 | — |
| measurement:convert_miles_to_feet | Convert Miles to Feet | length_customary `forms: [3]` | XV | 4 | 4.MD.A.1 | M.EE.4.MD.1 | — |
| measurement:convert_cm_to_mm | Convert Centimeters to Millimeters | length_metric `forms: [0]` | XW | 4 | 4.MD.A.1 | M.EE.4.MD.1 | Y3.B5.S6 |
| measurement:convert_m_to_cm | Convert Meters to Centimeters | length_metric `forms: [1]` | XX | 4 | 4.MD.A.1 | M.EE.4.MD.1 | Y3.B5.S5 |
| measurement:convert_m_to_mm | Convert Meters to Millimeters | length_metric `forms: [2]` | XY | 4 | 4.MD.A.1 | M.EE.4.MD.1 | — |
| measurement:convert_km_to_m | Convert Kilometers to Meters | length_metric `forms: [3]` | XZ | 4 | 4.MD.A.1 | M.EE.4.MD.1 | Y4.B6.S2 |
| measurement:clock_hands | The Hour Hand and the Minute Hand | clock_parts `task: 'hands'` | X2 | 1 | 1.MD.B.3 (approx) | M.EE.1.MD.3 | — |
| measurement:minutes_by_fives_all | Write All the Minutes by Fives | time_fives_ring `task: 'all'` | Y4 | 2 | 2.MD.C.7, 2.NBT.A.2 | M.EE.2.MD.7 | Y2.B9.S5 |
| measurement:order_notes | Put Notes in Order by Value | coin_value `task: 'order'` | X3 | 1 | 2.MD.C.8 | M.EE.2.MD.8 | — |
| measurement:money_amount_in_words | Write an Amount of Money from Words | money_notation `task: 'words'` | X4 | 2 | 2.MD.C.8, 4.MD.A.2 | M.EE.2.MD.8 | — |
| number_theory:sort_prime_composite | Sort Numbers into Prime and Composite | prime_composite `forms: [3]` | YV | 4 | 4.OA.B.4 | M.EE.4.OA.4 | — |
| number_theory:list_multiples | List the First Multiples of a Number | multiples `forms: [0]` | YW | 4 | 4.OA.B.4 | M.EE.4.OA.4 | Y5.B3.S1 |
| number_theory:missing_multiples | Fill In the Missing Multiples | multiples `forms: [3]` | YX | 4 | 4.OA.B.4 | M.EE.4.OA.4 | — |
| number_theory:common_factors | Find Every Common Factor | gcf_easy `forms: [1]` | YY | 5 | 6.NS.B.4, 4.OA.B.4 | — | Y5.B3.S4 (partial), Y6.B2.S2 (partial) |
| number_theory:common_multiples | Find Every Common Multiple | lcm `forms: [1]` | YZ | 5 | 6.NS.B.4, 4.OA.B.4 | — | Y5.B3.S2 (partial), Y6.B2.S3 (partial) |

Where one row meant several presets: `count_by_tables` is one preset per table (2 … 12, `rows` with that
one row); the function tables are Find the Rule and Find the Missing In Numbers (`ftTask`; complete the
table is the host's own default); the word problems split by story kind (sharing, grouping, how many more, find the start); area / perimeter / volume each
have their missing-side preset; coordinates have read and plot in both grids; `div_unit_frac_nv` is 7a
(unit fraction ÷ whole) and 7b (whole ÷ unit fraction); `div_decimal` is by a whole and by a decimal;
`mult_zeros` is × 10 and × 100 (× a multiple of ten was batch 1); the area models are 2-digit × 1-digit and 3-digit × 1-digit (the 2 × 2 and 2 × 3 grids wait, below); arrays and equal groups are separate; "is it reasonable?" is Is the Quotient Reasonable? (sums / differences and products wait, below);
`distributive_expr` has Factor Out the GCF. The number-theory response forms that are only another way of
answering the same task (click the primes, circle / click the multiples) stay with the host and the
presets made for those tasks (sort, list, fill in, every common factor / multiple).

Notes on the second batch:
- `multiplication:mult_by_ten` / `mult_by_hundred` spell the number: an id ending `_10` / `_100` is read by
  the content audit as "within 10 / 100" (the answer), which every × 10 and × 100 item breaks.
- `composing:write_numbers_in_words` is pinned at `Y5`, not `VH`: `VH` (a dropped batch-1 draft) stays
  unused. `VR`, `VS`, `WH`, `WL`, `W3`, `YS`, `YT`, `VY`, `VZ` are unused too (the nine presets dropped below were
  drafted on them and never published).
- `algebra:solve_x_div_a_plus_b` and `algebra:solve_bracket_div` carry no `SKILL_WRM` tag: the step's
  words ("two-step") made a search for "÷ 2" show them before Division Facts. Their step stays covered by
  the host and by the other two two-step presets.
- The geometry transformations and integer operations are grade 7-8 in CCSS; their tags are the closest
  K-6 standard, marked `approx` with a note, as their hosts are.
- `number_theory:common_factors` / `common_multiples` tag their WRM steps as *partial* (the pupil picks
  every common factor from a set; the step also writes the list).

#### Made when the option deals what it says (not made now)

| Row | Why not now |
|---|---|
| multiplication:mult_word_problems `forms` [2] (Multiplicative Comparison Word Problems) | every story is retold by the word-work cell (word-work.js) as equal groups: 12 of 12 items were "4 bags of 6". `multiplication:mult_comparison` (Times as Many Word Problems) already teaches the lesson. |
| division:div_word_problems `forms` [2] (Interpret the Remainder) | the retold stories divide exactly: 0 of 12 had a remainder. `division:remainder_interpret` already teaches it. |
| addition:add_word_problems `forms` [1] / [2] (Find the Start / Find the Missing Part) | the retold stories follow their own kinds: `[1]` dealt "13 more than" compare stories and joins, `[2]` mixed missing-addend and start-unknown stories. |
| conversions:ratio_intro `forms` [1] (Write a Part-to-Whole Ratio) | 3 of 12 items asked a part-to-part ratio ("red apples to green apples"). |
| number_sense:estimate_sums_diffs / estimate_products `task` reasonable (Is the Sum or Difference / the Product Reasonable?) | the content audit fails them (pv-band): the "not reasonable" answers the task prints (36 + 22 = 580, 36 × 9 = 3,240) run past the host's default band of 100 on 104 / 180 of 240 items. Is the Quotient Reasonable? passes and is made. |
| multiplication:area_model_mult_hard `tiles` 22 / 23 (Area Model: 2-Digit × 2-Digit / 3-Digit × 2-Digit) | the host's print page fails ws-print-lint (8 L-FONT TY-1: "−" and other runs not in Andika, 1 L-KEY); each preset would add those 9 findings again, and print-lint may not rise. Made when the host page is clean. |

These are host defects (the option's own label is not what it deals, or its items break the band the
content audit holds the skill to), listed for the word-problem, ratio and estimation owners; the preset is
made in the change that fixes the host.

#### Host fixes made for this batch

- **mult_properties "break apart" key (AK-4).** The pupil page drew the missing number as a plain
  underline (no slot) and the key stamped an extra "Answer:" line with a slot, so the key had a slot the
  pupil page lacked. The generator now marks that item `printSlot`, and the legacy print branch draws its
  one `___` as a real `line` slot (`data-ws-slot="answer"`); the key writes the answer on it.
  `ws-print-lint --source kit --skills multiplication:mult_properties`: AK-4 gone (the PAGEFILL finding on
  the host's default page is unchanged); with `forms: [1]` the page is clean.
- **The P12 accept layer on a page** (generate-question.js, page-deal.js). On a page, item *k* was dealt the
  same slot on every redraw, so an option checked by the item's words ("x + a = b", "Plot the points") came
  back the wrong kind 80 times and the wrong kind was printed. A redraw now deals each choice as a plain
  seeded draw (`setRedraw`), so it reaches the asked kind and the page still reproduces. The first draw is
  unchanged, so a page with the options at their defaults deals exactly as before.
- **div_unit_frac_nv option labels.** Values 0 / 1 deal whole ÷ unit fraction and 2 / 3 unit fraction ÷
  whole; the labels said the opposite. The labels now say what is dealt (values and saved codes unchanged).
- **Two click-all branches** (`div_unit_frac_nv`, `simplify`) no longer appear on a page whose ticked forms
  leave their kind out (they ignored `forms`). At the defaults nothing changes.
- **Share codes:** an empty `rows` list that is not the default (a count-by preset turned back to the
  host's "Tables 2 to 12") is written as `X` (decodes to `[]`); old decoders read the preset's row.
- **ws-presets-unit** compares a page of the preset with a page of the host (page-deal caches decks per
  page, so item-by-item interleaving compared two different pages), and ignores the area model's
  `Date.now()` input ids.

Build-list `kind: 'option'` entries marked `preset: true` (each option's text now says it is also a named
preset skill once built): `multiplication:multiply` 4×1 (`mult_4x1`), `decimals:mult_decimal` decimal ×
decimal (`mult_dec_dec`), `addition:add_three` word problems and make a ten first, `measurement:unit_conversions`
conversion table, `angles_lines:measure_angles` read the protractor, `conversions:ratio_tables` plot the
pairs, `placevalue:value` ten times / one tenth, `number_theory:gcf_easy` sum as a product,
`algebra:inequalities` write it / show it. Make the preset in the change that builds the option. Every
other option entry is `preset: false`.

### Plain options (no preset)

Everything that changes size *within* a class (`band`, `range`, `decimals`, `constant`, `tables`),
the scaffolds and supports (`level`, `support`, touch dots, frames, `pictures`, `numerals`, `face`),
`notation` (across / stacked / bracket), `regroup` (some / all — the regroup family is already
separate skills), `unknown` position on a basic fact, `response` (write / choose / build), item counts
and chart sizes (`tiles` on graphs, sorts, ordering, hundred charts), the K-2 object kinds, currency,
`denoms` families, review / mixed-pool members, the vocabulary forms, and the click / drag / sort
response forms (a production item is never turned into choice; those forms are a host format, not a lesson).
