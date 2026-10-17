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

## Presets made (first batch, 2026-10-17)

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

### Ask owner (a real lesson in some curricula, but the split is a judgment call)

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

Build-list `kind: 'option'` entries marked `preset: true`: `multiplication:multiply` 4×1 (`mult_4x1`) and
`decimals:mult_decimal` decimal × decimal (`mult_dec_dec`) — make the preset when the option is built;
`addition:add_three` word-problem form, `measurement:unit_conversions` conversion table,
`angles_lines:measure_angles` read the protractor, `conversions:ratio_tables` plot the pairs,
`placevalue:value` ten times / one tenth, `number_theory:gcf_easy` sum as a product,
`algebra:inequalities` write it / show it — ask the owner. Every other option entry is `preset: false`.

### Plain options (no preset)

Everything that changes size *within* a class (`band`, `range`, `decimals`, `constant`, `tables`),
the scaffolds and supports (`level`, `support`, touch dots, frames, `pictures`, `numerals`, `face`),
`notation` (across / stacked / bracket), `regroup` (some / all — the regroup family is already
separate skills), `unknown` position on a basic fact, `response` (write / choose / build), item counts
and chart sizes (`tiles` on graphs, sorts, ordering, hundred charts), the K-2 object kinds, currency,
`denoms` families, review / mixed-pool members, the vocabulary forms, and the click / drag / sort
response forms (a production item is never turned into choice; those forms are a host format, not a lesson).
