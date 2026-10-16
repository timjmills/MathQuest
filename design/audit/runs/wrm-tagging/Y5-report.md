# Wave 2 tagging: Year 5 (US Grade 4) — round 6: critic r7 rows, the fit loop made a report (2026-10-16)

Critic r7 (FAIL narrowly: steps 8.00 and lessons 8.00, but Y5.B15.S2 = 7 and lesson 2 = 7, both class N). Builder still at
Opus medium (the ceiling; `design/STATUS.md`). Every row is fixed at the source (`build.py`, `linkfit.mjs`, `claims.mjs`, the new
`specopts.py` and `spec_zz_r7.py`). No hand JSON.

## Class N, the structural fix: no build pass changes a link's opts
Three rounds in a row a false why came from the same place: `linkfit --fit` re-optioned a failing link (or dropped it) inside
the build, and only the rule claims were re-checked. From this round:

| Piece | What it does |
|---|---|
| `linkfit.mjs --fit` | a **report only**. For each link that fails at its spec opts it prints the failures and the first candidate option set that passes every check **and every claim of the why** (gated and swept: claims.mjs `claimHits` on all claims), with 8 of its items to re-read. It writes nothing into the build |
| `build.py` pass 4 | applies nothing. A link that does not fit at its spec opts is a build error naming the report's suggestion (or "none fits"); the report is `fit-report.txt` in the build folder. The F pass (a link repeating the unit's own direct / partial: was stepped a band down or dropped silently), the duplicate pass (was removed silently) and the 8-link cap (was truncated silently) are errors too |
| `specopts.py` (new gate) | `build.py` writes `spec-links.json` right after the spec files run; every built pre / related link must match a spec link of the same unit and role with the same key, opts and Max Number, one to one. A pass that re-options or drops a link fails the build |
| `spec_zz_r7.py` | writes **by hand** what the old fit loop did silently: 143 RELINK rows (spec opts → chosen opts, each with the why re-read on generated items and rewritten where it was not true) and 96 DROP rows (94 the old loop dropped, 2 duplicates), plus the critic's per-entry rows |
| `linkfit.mjs --try '<unit> ~ <role> ~ <key> ~ <opts>[@max] ~ <why>'` | the hand re-read helper: every build check, every claim (gated or swept) and 12 items for one link before it is written into a spec |

### Gate changes (N, N′, M′)
| Class | Change |
|---|---|
| N form claims | `claims.mjs`: **sorts, clicks, drags, converts, renamed unit form** ("45 hundreds", "30 hundreds", "renaming … tens") are claims, judged on the question, template and payload. linkfit now gates every rule, representation and form claim (`gateOnly`); operations and "story" stay in the swept, hand-read set |
| N′ representations | every representation claim (number line, bar model, array, scale / cylinder / ruler, graph, clock …) is judged on the **question stem, the picture, its raw markup, the template and the payload only**: option, tile and answer text never count ("Milk jug" in a unit sort no longer satisfies "scale"). Number line no longer matches any "tick" (a bar graph's axis is not a number line); the circle-model claim needs "circle model / fraction circle / pie", not a shape name |
| M′(1) | a skill is excused from M only when the unit's text names its full key, its id in backticks, or an underscore id (`frac_10_100_nv`), never an ordinary word ("capacity", "compare", "value", "volume") |
| M′(2) | M reads **every** option with labelled values (not only forms / units / task / kind / model), except the support group and size bands; a Yes / On value is read as its control label ("More than 9 of one place", unit_form `rename`) and its example separately; a No / Off / None value is skipped; a label that is only an action and its object ("Click or sort containers") keeps its action verbs |

### Each new gate proven on a mutated scratch copy
`mut8.py` (scratch) re-applies the critic's five `mut7.json` mutations to the new Y5.json and adds six, all in one copy
(`mut8.json`), then runs the new linkfit and the r7 (HEAD 2031ff4f) linkfit on it:

| Mutation | New linkfit | r7 linkfit |
|---|---|---|
| critic: money claim on `add_decimal {decimals:2}` | fires | fires |
| critic: K customary `length_customary` on B14.S1 | fires | fires |
| critic / M′(2): lesson 1 clause "never more than 9 of one place (47 tens 6 ones)" | **fires** (unit_form rename="more") | missed |
| critic: L tape_diagram "times-as-many" on lesson 6 | fires | fires |
| critic / M′(1): lesson 14 "never clicks or sorts containers" | **fires** (capacity forms=1) | missed |
| N′: B15.S2 the r7 unit sort under "read on a scale" | **fires** (scale 0 / 100) | missed |
| N: B14.S4 convert items under "sort containers" | **fires** (sorts 0 / 100) | missed |
| N: lesson 2 standard unit form under "45 hundreds" | **fires** (renamed unit form 0 / 100) | missed |
| N: B10.S9 click-all under "sort" | **fires** | missed |
| N: B14.S5 facts under "conversion" | **fires** | missed |
| N′: B11.S1 bar graph under "number line" | **fires** | missed |

Build-level mutations on a scratch tree copy: (A) a spec file restoring B15.S2 `mass_volume_liquid {forms:[0]}` and B14.S4
`capacity {units:[0], forms:[1]}` with their r7 whys, a pre equal to B1.S2's own direct, a duplicate pre on B3.S1 and 9 related
on B1.S1: the build **exits 1** with "does not fit at its spec opts" for both links ("no option set fits": the unit sort the old
loop chose for B15.S2 is no longer suggested, its "scale" claim is false), the F, duplicate and more-than-8 errors, and the
written file still carries the spec opts (nothing re-optioned). (B) `build.py` with a pass that silently sets B15.S2's volume
link to `band:12`: the build **exits 1** at specopts ("not in the spec (spec has band 30)").

## The 18 links whose spec set explicit opts that the old fit changed (re-read by hand, fresh seeds)
| # | Unit | Link | Spec opts (old) | Now in the spec | Why, verified on the items |
|---|---|---|---|---|---|
| 1 | Y5.B3.S1 | pre `patterns:seq_5` | band 1000 | band 50 | "Count in 2s, 5s and 10s" (Y2.B1.S15): 34, 39, ___, 49; reverse-order drags to 28. True |
| 2 | Y5.B3.S1 | pre `patterns:seq_10` | band 1000 | band 50 | same cite: 19, 29, ___, 49. True |
| 3 | Y5.B3.S2 | pre `multiplication:mult_facts` | constant [3,6,9] | constant [9], band 100 | pass 3 re-cites it to "Y4.B4.S5 9 times-table … (the multiplication half)"; [3,6,9] dealt 9s in 41 / 100. Now 9 × 4, 9 × 3, 9 × 9. True |
| 4 | Y5.B5.S1 | pre `mult_facts` | [3,6,9] | [9] | same cite: 9 × 5, 9 × 11. True |
| 5 | Y5.B5.S6 | pre `mult_facts` | [6,7,9] | [7] | "Y4.B4.S8 7 times-table …": 7 × 5, 7 × 4. True |
| 6 | Y5.B12.S9 | pre `patterns:count_by_step_up` | range 1000 | range 50 | "count up in steps (4.OA.C.5)": count up by 5s, 3s, 2s to 50 (range 1000 reached 1,255). True |
| 7 | Y5.B12.S12 | pre `mult_facts` | [3,6,9] | [9] | as 3. True |
| 8 | Y5.B14.S3 | pre `measurement:mass_volume_liquid` | forms [0] | forms [2] | the cylinder (to 1,000 mL) is too big here; **why rewritten**: "this form chooses the unit for an object, g or kg, mL or L, by sorting and clicking: the sense of size behind a change of metric unit" (it had said "choose the unit … before converting": the old why's "converting" is now a false form claim) |
| 9 | Y5.B14.S4 | related `measurement:capacity` | units [0], forms [1] | units [0], forms [0] | **critic row: why rewritten** "customary capacity conversions one a cell (4 pints = 2 quarts, 6 cups = 3 pints)" (was "sort containers"): 12 quarts = ___ gallons, 6 cups = ___ pints |
| 10 | Y5.B15.S2 | related `mass_volume_liquid` | forms [0] | **replaced**: `area_perimeter:volume {forms:[0], band:30}` | **critic row**: "working out each cuboid's volume in cubic units (length × width × height), then comparing two volumes": l = 3, w = 2, h = 2 → 12 cubic units |
| 11 | lesson 2 | pre `placevalue:place_value_10x` | op x, power [10,100], band 10000 | band 1000 | "Y4.B5.S4 Multiply by 100": 7 × 10, 10 × 100, 82 × 10 on the shift chart. True |
| 12 | lesson 2 | related `placevalue:unit_form` | band 9999 | band 999, **rename 'more'** | **critic row**: "renaming in unit form (454 = 45 tens 4 ones; 3 hundreds 14 tens = 440): the step inside 9 tens times 5 tens = 45 hundreds = 4,500": 975 = ___ tens 5 ones, 1 hundred 15 tens = ___ |
| 13 | lesson 3 | pre `count_by_step_up` | step [1] | step [1], range 100 | **why gets** "this option counts on in 3s and in 4s" (critic carried minor; the skill's step [1] is "3s and 4s", no 3s-only value) |
| 14 | lesson 4 | pre `skip_count_line` | step [0] | step [0], band 50 | **why gets** "skip counts in 2s, 5s and 10s" (step [0] is that set; 2s in about a third) |
| 15 | lesson 5 | pre `skip_count_line` | step [0] | step [0], band 50 | as 14 |
| 16 | lesson 5 | pre `count_by_step_up` | step [1] | step [1], range 1000 | as 13 |
| 17 | lesson 14 | pre `measurement:capacity` | units [1], forms [0] | units [1], forms [1] | **critic minor: re-cited honestly**: convert (3 L = 3,000 mL) is past the lesson's size and capacity has no band (Max Number does not change it, tried), so the why says "this form clicks the metric containers larger than 1 litre, a bucket of 8 L against a can of 355 mL: the sense of a litre before cups, pints, quarts and gallons" |
| 18 | lesson 15 | pre `measurement:length_metric` | forms [1] | forms [3] | **why rewritten**: "converting km to m, 2 km = 2,000 m: a larger unit changed into a smaller one" (forms 1 failed "kilometres") |

## Per-entry rows (critic r7 fix table)
| Entry | Change |
|---|---|
| Y5.B15.S2 | related `volume {forms:[0], band:30}` (row 10 above); the r7 pre `volume {}` stays dropped (inches / feet in its mix) |
| Lesson 2 | related `unit_form {band:999, rename:'more'}` (row 12) |
| Lesson 1 | related `unit_form {band:9999, rename:'more'}`, why "renaming a number in a smaller unit (7,576 = 757 tens 6 ones; 4 thousands 16 hundreds = 5,600)" |
| Y5.B14.S4 | why rewritten (row 9); no "metric" in it |
| Lesson 14 | capacity pre re-cited honestly (row 17) |
| B6.S2 / S3 / S5 / S7 | `frac_mult_word {denoms:[5]}`: measured 52 / 100 serving stories (fraction × whole) and 48 / 100 "how many 1/5 m pieces in 3 m" (Grade 5, 5.NF.B.7c). The skill's only option is the denominator family, so the why names both: "fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre". Generator note: a × / ÷ story filter on `frac_mult_word` would make it a clean × link |
| B5.S5 | pre `make_ten` dropped (unfiltered week-list entry) |
| B4.S4 (and B4.S14 / S16) | `whole_as_fraction` deals 54 / 100 "1 = n/n" and 46 / 100 "9 = 9/1": the whys say both |
| Lesson 3 | count_by_step_up why names 3s and 4s (row 13); skip_count_line names 2s, 5s and 10s |
| B10.S9 | `hotspot_quads` why "click every quadrilateral among other shapes …" (was "sort") |
| B10.S10 (M′ found) | the M gate, now reading `net_identify`'s `shapes` option ("Pyramids and triangular prisms"), flagged the `name_3d_shapes` clause; the clause now names `shapes_classify:net_identify` ("has them, as nets to fold, not as solids to name"), which is true: net_identify {} already deals the square pyramid and triangular prism nets |
| Gate-found whys | the new form / representation claims and the re-read found these whys false at their opts; rewritten: B14.S5 mult_facts ("conversion"), B6.S1 fraction_of_set ("1/n" on 6/8 of 16), B8.S1 multiply ("× 2 facts and doubling" on mixed facts), B10.S4 / S8 additive_angles ("measure two parts and add", "a whole turn or a straight line" on parts of 90°), B11.S5 partition_shapes ("halves" on halves and quarters), B12.S1 add_fractions_like ("3/10 + 4/10" on click-the-sums-to-1), B7.S1 / S3 write_fraction (fifths and tenths named), B14.S1 / S3 related capacity moved to the convert form `{units:[1], forms:[0]}` (the "1,000 rule" the why names) |

## Counts and gates
- 136 steps (37 full / 74 partial / 25 gap), 21 lessons (4 / 16 / 1), 101 proposals, 175 tagFixes, **874 links** (875 − make_ten).
- `build.py`: 0 links that do not fit at their spec opts, 0 duplicates, 0 own repeats; **specopts 874 links, 0 differences**;
  linkfit 0 misfits; optcheck 0; mergecheck (Y5 + R, Y1, Y4, Y6) OK.
- `sweep.mjs` (fresh seeds): 874 links, 148 clauses, 806 claims: **a 0, a-neg 0, b 0**, c 32 (the same 32 the critic accepted).
- critic's `merge7.mjs`: order-independent, 0 key|step written by 2 lanes, own-step mismatches 0 / 0 for every lane, Y5 opts
  that do not land 0.
- Self-check: every touched entry re-dumped on fresh seeds (80923 + 61 i, 41077 + 71 i, the critic's dump script): B15.S2,
  B14.S1 / S3 / S4 / S5, lessons 1 / 2 / 3 / 4 / 5 / 14 / 15, B3.S1, B4.S4 / S14 / S16, B5.S5, B6.S1 / S2 / S7, B7.S1, B8.S1,
  B10.S4 / S8 / S9 / S10, B11.S5, B12.S1: each why read true on its items; I grade every one 8 (B15.S2 and lesson 2 now 8:
  their related deal exactly what the why says).

## Every link the old fit loop changed, now written in the spec (`spec_zz_r7.py` RELINK)
Generated from the fit report's suggestion, re-read on its items, the why rewritten where it was not true (the rows above).

| # | Unit | Role | Skill | Spec opts (old) | Opts now in the spec | Why (re-read on the items) |
|---|---|---|---|---|---|---|
| 1 | Y5.B1.S1 | related | `placevalue:number_word_names` | `{}` | `{"band": 999}` | another way of writing the same number (words) |
| 2 | Y5.B1.S2 | related | `placevalue:value` | `{}` | `{"band": 9999}` | value of a digit in a 4-digit number |
| 3 | Y5.B1.S2 | related | `placevalue:number_word_names` | `{}` | `{"band": 9999}` | the number in words |
| 4 | Y5.B1.S3 | related | `placevalue:number_word_names` | `{}` | `{"band": 99999}` | 5-digit numbers in words |
| 5 | Y5.B1.S7 | pre | `placevalue:value` | `{}` | `{"band": 999999}` | Y5.B1.S4 Numbers to 1,000,000 (earlier Y5 step) |
| 6 | Y5.B1.S10 | pre | `placevalue:identify` | `{}` | `{"band": 99999}` | Y5.B1.S3 Numbers to 100,000 (earlier Y5 step) |
| 7 | Y5.B1.S10 | related | `placevalue:number_word_names` | `{}` | `{"band": 99999}` | the same 5-digit numbers named in words, read before they are compared |
| 8 | Y5.B1.S11 | pre | `placevalue:identify` | `{}` | `{"band": 999999}` | Y5.B1.S4 Numbers to 1,000,000 (earlier Y5 step) |
| 9 | Y5.B2.S3 | pre | `subtraction:sub_across_zeros` | `{}` | `{"band": 10000}` | Y4.B2.S7 Subtract two 4-digit numbers - more than one exchange (prior learning wk W09): exchanging across zeros, ≤ 4 digits |
| 10 | Y5.B2.S7 | pre | `placevalue:compare` | `{}` | `{"band": 999999}` | Y5.B1.S11 Compare and order numbers to 1,000,000 (earlier Y5 step) |
| 11 | Y5.B3.S1 | pre | `patterns:seq_5` | `{"band": 1000}` | `{"band": 50}` | Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W01) |
| 12 | Y5.B3.S1 | pre | `patterns:seq_10` | `{"band": 1000}` | `{"band": 50}` | Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W01) |
| 13 | Y5.B3.S2 | pre | `multiplication:count_by_tables` | `{}` | `{"constant": [3]}` | Y4.B4.S1 Multiples of 3 (prior learning wk W01) |
| 14 | Y5.B3.S2 | pre | `multiplication:mult_facts` | `{"constant": [3, 6, 9]}` | `{"constant": [9], "band": 100}` | Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half) |
| 15 | Y5.B3.S2 | related | `number_theory:divisibility_sort` | `{}` | `{"band": 50}` | sort by divisor |
| 16 | Y5.B3.S5 | pre | `multiplication:mult_facts` | `{}` | `{"constant": [2, 4, 8]}` | Y3.B3.S15 The 2, 4 and 8 times-tables (prior learning wk W02) |
| 17 | Y5.B3.S5 | related | `number_theory:divisibility_sort` | `{}` | `{"band": 50}` | divisibility rules rule numbers out |
| 18 | Y5.B3.S5 | related | `number_theory:mixed_number_theory` | `{}` | `{}` @100 | mixed review |
| 19 | Y5.B3.S7 | pre | `multiplication:mult_facts` | `{}` | `{"constant": [2, 4, 8]}` | Y3.B3.S15 The 2, 4 and 8 times-tables (lower grade, same cluster CCSS 3.OA.C.7) |
| 20 | Y5.B3.S8 | pre | `multiplication:count_by_tables` | `{}` | `{"constant": [10]}` | Y2.B5.S13 The 10 times-table (prior learning wk W10) |
| 21 | Y5.B3.S8 | pre | `patterns:seq_10` | `{}` | `{"band": 1000}` | Y1.B9.S2 Count in 10s (prior learning wk W10) |
| 22 | Y5.B3.S9 | pre | `division:div_facts` | `{}` | `{"constant": [10]}` | Y2.B5.S14 Divide by 10 (prior learning wk W10) |
| 23 | Y5.B3.S9 | related | `division:divide` | `{}` | `{"range": 100}` | division facts and beyond |
| 24 | Y5.B4.S1 | pre | `fractions:equiv_frac_nv` | `{}` | `{"denoms": [2]}` | Y4.B7.S10 Equivalent fraction families (prior learning wk W15) |
| 25 | Y5.B4.S1 | pre | `fractions:identify` | `{}` | `{"forms": [1]}` | Y2.B8.S10 Unit fractions (prior learning wk W15) |
| 26 | Y5.B4.S1 | related | `fractions:select_equiv_frac` | `{}` | `{"denoms": [3]}` | recognise equivalents (next step Y5.B4.S3) |
| 27 | Y5.B4.S1 | related | `fractions:simplify` | `{}` | `{"forms": [1]}` | the inverse: simplify to the unit fraction |
| 28 | Y5.B4.S2 | related | `fractions:select_equiv_frac` | `{}` | `{"denoms": [3]}` | recognise equivalents (next step) |
| 29 | Y5.B4.S2 | related | `fractions:simplify` | `{}` | `{"forms": [1]}` | inverse: simplify |
| 30 | Y5.B4.S3 | related | `fractions:simplify` | `{}` | `{"forms": [1]}` | simplest form |
| 31 | Y5.B4.S11 | related | `fraction_operations:sub_frac_unlike` | `{}` | `{"denoms": [2]}` | inverse |
| 32 | Y5.B5.S1 | pre | `multiplication:mult_facts` | `{"constant": [3, 6, 9]}` | `{"constant": [9]}` | Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half) |
| 33 | Y5.B5.S1 | related | `division:divide` | `{}` | `{"range": 100}` | the inverse: division facts and 2-digit ÷ 1-digit, before 4-digit ÷ 1-digit (Y5.B5.S8) |
| 34 | Y5.B5.S6 | pre | `multiplication:mult_facts` | `{"constant": [6, 7, 9]}` | `{"constant": [7]}` | Y4.B4.S8 7 times-table and division facts (lower grade, same idea; the multiplication half) |
| 35 | Y5.B5.S6 | related | `division:div_word_problems_plain` | `{}` | `{"range": 100}` | the inverse: one-step division stories |
| 36 | Y5.B5.S7 | pre | `division:missing_mult_div` | `{}` | `{"range": 100}` | Y3.B4.S6 Link multiplication and division (prior learning wk W12) |
| 37 | Y5.B5.S7 | pre | `division:div_facts` | `{}` | `{"constant": [10]}` | Y2.B5.S14 Divide by 10 (lower grade, same cluster CCSS 3.OA.C.7) |
| 38 | Y5.B5.S8 | pre | `division:missing_mult_div` | `{}` | `{"range": 100}` | Y3.B4.S6 Link multiplication and division (prior learning wk W12) |
| 39 | Y5.B5.S8 | related | `division:div_word_problems_plain` | `{}` | `{"range": 100}` | division stories |
| 40 | Y5.B5.S9 | related | `division:remainder_interpret` | `{}` | `{"range": 100}` | what the remainder means in a story |
| 41 | Y5.B5.S10 | pre | `division:missing_mult_div` | `{}` | `{"range": 100}` | Y3.B4.S6 Link multiplication and division (prior learning wk W12) |
| 42 | Y5.B5.S10 | related | `division:div_check_by_multiplying` | `{}` | `{"range": 100}` | check the result |
| 43 | Y5.B5.S11 | related | `division:div_word_problems_plain` | `{}` | `{"range": 100}` | one-step division stories |
| 44 | Y5.B6.S1 | related | `fractions:fraction_of_set_nv` | `{}` | `{"denoms": [2]}` | a fraction of an amount (1/2 of 12, 6/8 of 16): halves, quarters and eighths, unit and non-unit |
| 45 | Y5.B6.S2 | related | `fraction_operations:frac_mult_word` | `{}` | `{"denoms": [5]}` | fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre |
| 46 | Y5.B6.S3 | related | `fraction_operations:frac_mult_word` | `{}` | `{"denoms": [5]}` | fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre |
| 47 | Y5.B6.S3 | related | `fractions:fraction_of_set_nv` | `{}` | `{"denoms": [2]}` | next step: a fraction of a quantity |
| 48 | Y5.B6.S4 | pre | `division:div_word_problems` | `{}` | `{"range": 100}` | divide by the denominator (prior learning wk W20) |
| 49 | Y5.B6.S4 | pre | `patterns:halve` | `{}` | `{"band": 50}` | halving (prior learning wk W20) |
| 50 | Y5.B6.S4 | related | `fractions:fraction_of_set_hard_nv` | `{}` | `{"denoms": [2]}` | Y5.B6.S5 Fraction of an amount (next step) |
| 51 | Y5.B6.S5 | pre | `fractions:fraction_of_set_nv` | `{}` | `{"denoms": [2]}` | Y5.B6.S4 (previous step) |
| 52 | Y5.B6.S5 | pre | `division:div_word_problems` | `{}` | `{"range": 100}` | divide by the denominator (prior learning wk W20) |
| 53 | Y5.B6.S5 | pre | `multiplication:mult_facts` | `{}` | `{"constant": [12]}` | Y4.B4.S10 12 times-table and division facts (lower grade, same idea; multiply the unit part back up; the multiplication half) |
| 54 | Y5.B6.S5 | related | `fraction_operations:frac_mult_word` | `{}` | `{"denoms": [5]}` | fraction × whole number in stories (each serving uses 2/5 L: 3 servings = 1 1/5 L), some asking which numbers are needed; about half are 'how many 1/5 m pieces in 3 m' stories (Grade 5, 5.NF.B.7c), worked here by counting 5 fifths in each metre |
| 55 | Y5.B6.S6 | pre | `fractions:fraction_of_set_nv` | `{}` | `{"denoms": [2]}` | Y5.B6.S4 (earlier step) |
| 56 | Y5.B6.S6 | pre | `division:missing_mult_div` | `{}` | `{"range": 100}` | inverse operations (CCSS 3.OA.A.4) |
| 57 | Y5.B6.S6 | pre | `multiplication:mult_facts` | `{}` | `{"constant": [12]}` | Y4.B4.S10 12 times-table and division facts (lower grade, same idea; multiply the unit part back up; the multiplication half) |
| 58 | Y5.B6.S7 | pre | `division:div_word_problems` | `{}` | `{"range": 100}` | ÷ by the denominator (prior learning wk W20) |
| 59 | Y5.B7.S1 | pre | `conversions:f_to_d` | `{}` | `{"denoms": [5]}` | Y4.B8.S2 Tenths as decimals (prior learning wk W21) |
| 60 | Y5.B7.S1 | pre | `fractions:write_fraction` | `{}` | `{"denoms": [5]}` | Y4.B8.S1 Tenths as fractions (prior learning wk W21; shaded fifths and tenths, as 3/5 and 2/10) |
| 61 | Y5.B7.S1 | pre | `placevalue:value` | `{}` | `{"band": 99}` | whole-number place value (CCSS 4.NBT.A.2) |
| 62 | Y5.B7.S3 | pre | `fractions:write_fraction` | `{}` | `{"denoms": [5]}` | Y4.B8.S1 Tenths as fractions (lower grade, same idea; shaded fifths and tenths, as 3/5 and 2/10) |
| 63 | Y5.B7.S4 | pre | `fractions:simplify` | `{}` | `{"forms": [1]}` | simplest form (CCSS 4.NF.A.1) |
| 64 | Y5.B7.S6 | pre | `placevalue:value` | `{}` | `{"band": 99}` | value of a digit (CCSS 4.NBT.A.2) |
| 65 | Y5.B7.S7 | pre | `placevalue:value` | `{}` | `{"band": 99}` | value of a digit (CCSS 4.NBT.A.2) |
| 66 | Y5.B7.S8 | pre | `conversions:d_to_f` | `{}` | `{"forms": [1]}` | Y4.B8.S8 Hundredths as decimals (lower grade, same idea) |
| 67 | Y5.B7.S9 | pre | `placevalue:compare` | `{}` | `{"band": 99}` | compare whole numbers (prior learning wk W22) |
| 68 | Y5.B7.S13 | pre | `fractions:simplify` | `{}` | `{"forms": [1]}` | simplest form (CCSS 4.NF.A.1) |
| 69 | Y5.B8.S1 | pre | `multiplication:multiply` | `{}` | `{"range": 100}` | multiplication facts within 100 (8 × 5, 11 × 2): a perimeter uses the × 2 fact, a rectangle has two of each side (CCSS 3.OA.C.7) |
| 70 | Y5.B8.S1 | related | `area_perimeter:area` | `{}` | `{"forms": [1]}` | Y5.B8.S4 Area of rectangles (next idea, same shape) |
| 71 | Y5.B8.S1 | related | `area_perimeter:area_perimeter` | `{}` | `{"band": 50}` | both measures of one rectangle |
| 72 | Y5.B8.S2 | related | `area_perimeter:area_polygon_decompose` | `{}` | `{"band": 50}` | same L/T/U shapes, area instead of perimeter |
| 73 | Y5.B8.S3 | pre | `area_perimeter:composite_shapes` | `{}` | `{"band": 40}` | Y5.B8.S2 Perimeter of rectilinear shapes (previous step) |
| 74 | Y5.B8.S4 | related | `area_perimeter:area_perimeter` | `{}` | `{"band": 50}` | area and perimeter of one rectangle |
| 75 | Y5.B8.S4 | related | `area_perimeter:area_distributive_visual` | `{}` | `{"band": 50}` | split a rectangle to multiply |
| 76 | Y5.B8.S4 | related | `area_perimeter:area_polygon_decompose` | `{}` | `{"band": 50}` | Y5.B8.S5 compound shapes (next step) |
| 77 | Y5.B8.S5 | pre | `area_perimeter:area` | `{}` | `{"forms": [1]}` | Y5.B8.S4 Area of rectangles (previous step) |
| 78 | Y5.B8.S5 | pre | `area_perimeter:area_distributive_visual` | `{}` | `{"band": 50}` | split a rectangle into two parts (lower grade, CCSS 3.MD.C.7c) |
| 79 | Y5.B8.S6 | pre | `area_perimeter:area` | `{}` | `{"forms": [1], "band": 25}` | Y5.B8.S4 Area of rectangles |
| 80 | Y5.B8.S6 | related | `area_perimeter:area_perimeter` | `{}` | `{"band": 50}` | the exact area of a rectangle, to check an estimate against |
| 81 | Y5.B9.S1 | pre | `graphs:bar_graph` | `{}` | `{"forms": [0]}` | Y3/Gr.2 Interpret bar charts (prior learning wk W36) |
| 82 | Y5.B9.S2 | pre | `graphs:bar_graph` | `{}` | `{"forms": [0]}` | Y3/Gr.2 Interpret bar charts (prior learning wk W36) |
| 83 | Y5.B9.S3 | pre | `graphs:bar_graph` | `{}` | `{"forms": [0]}` | Y3/Gr.2 Interpret bar charts (prior learning wk W04) |
| 84 | Y5.B9.S4 | pre | `graphs:bar_graph` | `{}` | `{"forms": [0]}` | Y3/Gr.2 Interpret bar charts (prior learning wk W04) |
| 85 | Y5.B9.S4 | related | `graphs:pictograph` | `{}` | `{"forms": [0]}` | the same counts as a picture graph |
| 86 | Y5.B10.S3 | related | `angles_lines:additive_angles` | `{}` | `{"forms": [0]}` | benchmark 90° plus a part |
| 87 | Y5.B10.S4 | pre | `measurement:temperature` | `{}` | `{"forms": [1]}` | Y2.B7.S9 Temperature (lower grade, same idea) |
| 88 | Y5.B10.S4 | related | `angles_lines:additive_angles` | `{}` | `{"forms": [0]}` | two parts that make a right angle: find the missing part (80° and ? make 90°) |
| 89 | Y5.B10.S6 | pre | `subtraction:sub_1k_regroup` | `{}` | `{"band": 100}` | Y3.B2.S15 Subtract two numbers (across a 10) (lower grade, same idea; subtraction with an exchange, the step behind 360 − 145) |
| 90 | Y5.B10.S7 | pre | `subtraction:sub_1k_regroup` | `{}` | `{"band": 100}` | Y3.B2.S15 Subtract two numbers (across a 10) (lower grade, same idea; subtraction with an exchange, the step behind 180 − 45) |
| 91 | Y5.B10.S8 | related | `area_perimeter:composite_shapes` | `{}` | `{"band": 40}` | missing lengths in rectilinear shapes |
| 92 | Y5.B10.S8 | related | `angles_lines:additive_angles` | `{}` | `{"forms": [0]}` | angles that add up: the missing part of a right angle (46° and ? make 90°), the idea a missing angle in a shape is found with (Y5.B10.S6) |
| 93 | Y5.B11.S1 | pre | `graphs:bar_graph` | `{}` | `{"forms": [0]}` | reading values off an axis |
| 94 | Y5.B11.S3 | related | `coordinates:geo_rotate` | `{}` | `{"forms": [1]}` | another transformation |
| 95 | Y5.B11.S5 | pre | `shapes_early:partition_shapes` | `{}` | `{"forms": [1]}` | equal parts of shapes, halves and quarters (lower grade, same cluster CCSS 2.G.A.3) |
| 96 | Y5.B11.S6 | related | `coordinates:geo_rotate` | `{}` | `{"forms": [1]}` | another transformation |
| 97 | Y5.B12.S1 | related | `decimals:add_decimal` | `{}` | `{"range": 100}` | decimal addition written in a line (23.2 + 64.4): the written sums known facts make quick |
| 98 | Y5.B12.S1 | related | `fraction_operations:add_fractions_like` | `{}` | `{"denoms": [5]}` | the same facts with fractions: 4/10 + 6/10 = 1, as 0.4 + 0.6 = 1 (fifths and tenths, click the sums that make 1) |
| 99 | Y5.B12.S2 | related | `decimals:add_decimal` | `{}` | `{"range": 100}` | Y5.B12.S3 Add and subtract decimals across 1 (next step; the adding half) |
| 100 | Y5.B12.S3 | pre | `addition:add_1k_regroup` | `{}` | `{"band": 100}` | Y3 Add two numbers (across a 10) (prior learning wk W13) |
| 101 | Y5.B12.S3 | pre | `conversions:d_to_f` | `{}` | `{"forms": [0]}` | Y4.B8.S8 (prior learning wk W13) |
| 102 | Y5.B12.S4 | pre | `addition:add_1k_regroup` | `{}` | `{"band": 100}` | Y3 Add two numbers (across a 10) (prior learning wk W13) |
| 103 | Y5.B12.S5 | pre | `subtraction:sub_10k_regroup` | `{}` | `{"band": 100}` | column subtraction with exchange (prior learning wk W14) |
| 104 | Y5.B12.S6 | pre | `addition:add_10k_regroup` | `{}` | `{"band": 100}` | column addition with exchange (prior learning wk W14) |
| 105 | Y5.B12.S9 | pre | `patterns:count_by_step_up` | `{"range": 1000}` | `{"range": 50}` | count up in steps (lower grade, same cluster CCSS 4.OA.C.5) |
| 106 | Y5.B12.S9 | pre | `patterns:count_by_step_down` | `{}` | `{"range": 50}` | count back in steps (CCSS 4.OA.C.5) |
| 107 | Y5.B12.S9 | pre | `patterns:number_pattern` | `{}` | `{"band": 50}` | find the rule (CCSS 4.OA.C.5) |
| 108 | Y5.B12.S10 | pre | `conversions:d_to_f` | `{}` | `{"forms": [0]}` | tenths written as a decimal and as a fraction (0.7 = 7/10), lower grade (Y4.B8 tenths) |
| 109 | Y5.B12.S11 | pre | `division:div_facts` | `{}` | `{"constant": [10]}` | Y2.B5.S14 Divide by 10 (prior learning wk W10) |
| 110 | Y5.B12.S11 | related | `conversions:d_to_f` | `{}` | `{"forms": [0]}` | decimal to fraction |
| 111 | Y5.B12.S12 | pre | `multiplication:mult_zeros` | `{}` | `{"forms": [0]}` | × multiples of 10 (CCSS 4.NBT.B.5) |
| 112 | Y5.B12.S12 | pre | `multiplication:mult_facts` | `{"constant": [3, 6, 9]}` | `{"constant": [9]}` | Y4.B4.S5 9 times-table and division facts (lower grade, same idea; the multiplication half) |
| 113 | Y5.B13.S1 | pre | `placevalue:compare` | `{}` | `{"band": 99}` | Y2/Gr.1 compare numbers (prior learning) |
| 114 | Y5.B13.S1 | pre | `counting:number_seq_fill` | `{}` | `{"range": 100}` | fill a counting sequence (prior learning) |
| 115 | Y5.B13.S2 | pre | `counting:number_seq_fill` | `{}` | `{"range": 100}` | fill a counting sequence (prior learning) |
| 116 | Y5.B13.S2 | pre | `patterns:seq_10` | `{}` | `{"band": 50}` | counting sequences (prior learning) |
| 117 | Y5.B13.S3 | pre | `patterns:seq_2` | `{}` | `{"band": 50}` | count in 2s (prior learning) |
| 118 | Y5.B13.S3 | pre | `patterns:seq_5` | `{}` | `{"band": 50}` | count in 5s (prior learning) |
| 119 | Y5.B13.S3 | pre | `patterns:seq_10` | `{}` | `{"band": 50}` | count in 10s (prior learning) |
| 120 | Y5.B13.S4 | pre | `placevalue:compare` | `{}` | `{"band": 99}` | Y2/Gr.1 compare numbers (prior learning) |
| 121 | Y5.B13.S4 | pre | `placevalue:order_least_to_greatest` | `{}` | `{"band": 99}` | order numbers (prior learning) |
| 122 | Y5.B14.S1 | related | `measurement:capacity` | `{}` | `{"units": [1], "forms": [0]}` | the same 1,000 rule for litres: 2 L = 2,000 mL, 250 mL = 0.25 L |
| 123 | Y5.B14.S3 | pre | `measurement:mass_volume_liquid` | `{"forms": [0]}` | `{"forms": [2]}` | Y3.B7.S8 Measure capacity and volume in litres and millilitres (lower grade, same idea; this form chooses the unit for an object, g or kg, mL or L, by sorting and clicking: the sense of size behind a change of metric unit) |
| 124 | Y5.B14.S4 | pre | `measurement:length_customary` | `{}` | `{"forms": [0]}` | customary lengths (lower grade, same CCSS 4.MD.A.1) |
| 125 | lesson multiplyanddividemultiplesof10usingbasicf | pre | `placevalue:place_value_10x` | `{"op": "x", "power": [10, 100], "band": 10000}` | `{"op": "x", "power": [10, 100], "band": 1000}` | Y4.B5.S4 Multiply by 100 (lower grade, same idea) |
| 126 | lesson extendgrowingshapepatterns | pre | `patterns:count_by_step_up` | `{"step": [1]}` | `{"step": [1], "range": 100}` | Y2.B1.S16 Count in 3s (lower grade, same idea; this option counts on in 3s and in 4s) |
| 127 | lesson findemergentfeaturesegunitsdigitcycle | pre | `patterns:skip_count_line` | `{"step": [0]}` | `{"step": [0], "band": 50}` | Y1.B9.S1 Count in 2s (lower grade, same idea; this option skip counts in 2s, 5s and 10s) |
| 128 | lesson followagivenruletoextendanumberpattern | pre | `patterns:skip_count_line` | `{"step": [0]}` | `{"step": [0], "band": 50}` | Y1.B9.S1 Count in 2s (lower grade, same idea; this option skip counts in 2s, 5s and 10s) |
| 129 | lesson followagivenruletoextendanumberpattern | pre | `patterns:count_by_step_up` | `{"step": [1]}` | `{"step": [1], "range": 1000}` | Y2.B1.S16 Count in 3s (lower grade, same idea; this option counts on in 3s and in 4s) |
| 130 | lesson followagivenruletoextendanumberpattern | related | `patterns:number_pattern` | `{}` | `{"band": 1000}` | find the rule yourself and fill the gaps: the inverse task |
| 131 | lesson multiplicativecomparisontimesasmany | pre | `multiplication:multiply` | `{}` | `{"range": 100}` | Y4.B5.S9 Multiply a 2-digit number by a 1-digit number (lower grade, same idea) |
| 132 | lesson multiplicativecomparisontimesasmany | related | `number_ops_mixed:word_problems_mixed` | `{}` | `{}` @100 | times-as-many stories among other multiplication and division stories (Y5.B5.S11) |
| 133 | lesson multiplicativecomparisonwordproblemshowma | pre | `division:div_word_problems` | `{}` | `{"range": 100}` | Y3.B3.S5 Sharing and grouping (lower grade, same idea) |
| 134 | lesson multistepwordproblemsdivideandinterpretth | pre | `division:div_word_problems` | `{}` | `{"range": 100}` | Y3.B3.S5 Sharing and grouping (lower grade, same idea) |
| 135 | lesson multistepwordproblemsdivideandinterpretth | pre | `number_ops_mixed:word_problems_mixed` | `{}` | `{}` @100 | Y5.B5.S11 Solve problems with multiplication and division (taught earlier this year, wk W03) |
| 136 | lesson pointslineslinesegmentsandrays | related | `angles_lines:identify_angles` | `{}` | `{"forms": [1]}` | two rays from one point make an angle: the next idea (Y5.B10.S2) |
| 137 | lesson customarycapacitycupspintsquartsandgallon | pre | `division:div_facts` | `{}` | `{"constant": [4]}` | Y3.B3.S10 Divide by 4 (lower grade, same idea) |
| 138 | lesson customarycapacitycupspintsquartsandgallon | pre | `measurement:capacity` | `{"units": [1], "forms": [0]}` | `{"units": [1], "forms": [1]}` | Y3.B7.S9 Equivalent capacities and volumes (litres and millilitres) (lower grade, same idea; this form clicks the metric containers larger than 1 litre, a bucket of 8 L against a can of 355 mL: the sense of a litre before cups, pints, quarts and gallons) |
| 139 | lesson customarylengthandweightinchesfeetyardsou | pre | `measurement:length_metric` | `{"forms": [1]}` | `{"forms": [3]}` | Y4.B6.S1 Measure in kilometres and metres (lower grade, same idea; converting km to m, 2 km = 2,000 m: a larger unit changed into a smaller one, as the lesson does with its own units) |
| 140 | lesson comparefractions | pre | `fractions:identify` | `{}` | `{"forms": [1]}` | Y3.B6.S1 Understand the denominators of unit fractions (lower grade, same idea) |
| 141 | lesson dividea1digitnumberby100 | pre | `division:div_facts` | `{}` | `{"constant": [10]}` | Y2.B5.S14 Divide by 10 (lower grade, same idea) |
| 142 | lesson hundredths | related | `decimals:compare_decimal` | `{}` | `{"forms": [1]}` | comparing hundredths once they are on the chart |
| 143 | lesson orderfractions | pre | `fractions:identify` | `{}` | `{"forms": [1]}` | Y3.B6.S1 Understand the denominators of unit fractions (lower grade, same idea) |

DROP rows (no option set fits; the r7 build dropped the same 94 links silently): Y5.B1.S4 pre `place_value_10x`; Y5.B1.S6 related `exponents_simple`; Y5.B1.S7 related `place_value_10x`; Y5.B1.S10 related `order_negatives`; Y5.B1.S12 related `nearest_10000`; Y5.B1.S13 related `nearest_100000`; Y5.B1.S14 related `nearest_million`; Y5.B2.S8 pre `tape_diagram`; Y5.B3.S3 related `prime_composite`; Y5.B3.S3 related `mult_div_fact_family`; Y5.B3.S10 pre `place_value_10x`; Y5.B4.S1 pre `write_fraction`; Y5.B4.S1 related `frac_10_100`; Y5.B4.S2 related `frac_10_100`; Y5.B4.S3 related `frac_10_100`; Y5.B4.S4 pre `mult_facts`; Y5.B4.S4 related `round_fractions`; Y5.B4.S5 pre `mult_facts`; Y5.B4.S5 related `mult_frac_whole`; Y5.B4.S5 related `round_fractions`; Y5.B4.S8 related `round_fractions`; Y5.B4.S10 related `estimate_frac_ops`; Y5.B4.S17 related `frac_word_mixed`; Y5.B4.S17 related `mixed_fraction_ops`; Y5.B5.S3 pre `area_model_mult_hard`; Y5.B5.S4 related `long_div_2digit`; Y5.B5.S5 pre `mult_placeholder_zero`; Y5.B5.S5 related `mult_decimal`; Y5.B5.S5 related `long_div_2digit`; Y5.B5.S9 related `remainder_contexts`; Y5.B5.S11 related `remainder_contexts`; Y5.B6.S2 related `mult_frac_frac`; Y5.B6.S7 related `percent_of_number`; Y5.B7.S1 related `percent_visual`; Y5.B7.S2 related `percent_visual`; Y5.B7.S2 related `f_to_p`; Y5.B7.S2 related `frac_10_100_nv`; Y5.B7.S3 related `percent_visual`; Y5.B7.S3 related `p_to_d`; Y5.B7.S4 related `order_fdp`; Y5.B7.S4 related `f_to_p`; Y5.B7.S4 related `frac_10_100_nv`; Y5.B7.S5 related `round_thousandths`; Y5.B7.S5 related `place_value_10x`; Y5.B7.S6 pre `d_to_f`; Y5.B7.S6 pre `f_to_d`; Y5.B7.S6 pre `pv_digit_drag`; Y5.B7.S7 pre `d_to_f`; Y5.B7.S7 pre `pv_digit_drag`; Y5.B7.S7 related `place_value_10x`; Y5.B7.S7 related `round_thousandths`; Y5.B7.S10 pre `rounding_table`; Y5.B7.S12 related `d_to_p`; Y5.B7.S13 related `d_to_p`; Y5.B7.S13 related `p_to_d`; Y5.B7.S15 related `mixed_conversions`; Y5.B7.S15 related `frac_10_100`; Y5.B8.S3 pre `multiply`; Y5.B8.S4 related `area_model_mult`; Y5.B8.S5 related `volume_composite`; Y5.B8.S5 related `mixed_area_perimeter`; Y5.B8.S5 related `area_model_mult`; Y5.B8.S6 related `estimate_length`; Y5.B8.S6 related `area_triangle`; Y5.B9.S3 related `mixed_graphs`; Y5.B10.S3 pre `estimate_length`; Y5.B10.S4 pre `reading_ruler`; Y5.B10.S5 pre `reading_ruler`; Y5.B10.S5 pre `length_metric`; Y5.B11.S1 related `coordinate_graph`; Y5.B11.S3 related `geo_reflect`; Y5.B11.S4 related `geo_reflect`; Y5.B11.S5 related `geo_reflect`; Y5.B12.S1 pre `d_to_f`; Y5.B12.S3 related `place_value_10x`; Y5.B12.S3 related `number_bonds`; Y5.B12.S4 pre `d_to_f`; Y5.B12.S7 pre `sub_across_zeros`; Y5.B12.S8 related `estimate_sums_diffs`; Y5.B12.S10 pre `count_by_powers_of_10`; Y5.B12.S10 related `mult_decimal`; Y5.B12.S10 related `compare_thousandths`; Y5.B12.S11 related `div_decimal`; Y5.B12.S11 related `count_by_powers_of_10`; Y5.B12.S12 related `mult_decimal`; Y5.B12.S12 related `div_decimal`; Y5.B13.S4 related `ordering_rationals`; Y5.B14.S2 pre `unit_conversions`; Y5.B14.S2 related `unit_conversion_word`; Y5.B14.S3 pre `reading_ruler`; Y5.B14.S3 related `length_customary`; Y5.B14.S4 related `unit_conversion_word`; Y5.B15.S2 pre `volume`; lesson dividea1digitnumberby100 related `frac_10_100`


# (round 5) Wave 2 tagging: Year 5 (US Grade 4) — round 5: critic r6 rows + root-cause sweep (2026-10-16)

Critic r6 (FAIL narrowly: steps 7.94 with B15.S4 / B15.S1 / B15.S3 = 7; lessons 7.95 with lesson 7 and lesson 10 = 7). Builder
**escalated to Opus medium** (false whys / unit-mismatched links survived rounds 2-4; recorded in `design/STATUS.md`). Every row
is fixed at the source: `linkfit.mjs`, the new `claims.mjs` (claim rules) and `sweep.mjs` (the sweep), `build.py` pass 3b, and
`spec_zz_r6.py` (applied after `spec_zz_r5.py`). The branch also merges `origin/claude/sweet-newton-c8wrv1` (PR #8 generator
fixes, f18041bd) and re-judges the fraction clauses against regenerated items. No hand JSON.

## Root cause
The whys were checked only for a few words (a cited "Count in 3s", a table, a unit spelled out in the cited title cut at "(").
`linkfit --fit` re-options a failing link to the first option set that passes size and week checks, and **nothing checked that
the new option set still dealt what the why said**. That is how B15.S4's r2 link `unit_conversions {units:[0]}` (metric, why
"L ↔ mL") became `{units:[1]}` (customary): 5,000 mL passed nothing, quarts passed everything. The fix makes every why a set of
claims that the items must bear out, inside the fit loop, so a re-option can no longer make a why false.

## Build-level classes
| Class | Fix (at the source) |
|---|---|
| K customary on metric | `linkfit.mjs` `content()`: on EVERY metric or time unit (Y5.B8, B10, B14 except S4, B15, and any unit whose title names a metric measure) a pre or related link with a customary unit fails; and (the lead's "vice versa") a metric-only link on a customary unit fails unless it is a pre whose why names the metric measure it brings (Grade 3 litres before customary capacity). The Support-only H check is folded in |
| K why units, L multiplicative, H′ title | `claims.mjs` CLAIMS with `rule: true`, run by `linkfit.mjs whyCheck` on the why's **claim text**: the cited step's FULL title from `wrm-steps.json` (parentheses included: "Equivalent masses (kilograms and grams)") plus the builder's own words, negated parts removed ("no pictures", "never …"). Rules: metric, customary, each metric unit, cups/pints/quarts/gallons, ounces/pounds, inches/feet/yards/miles, minutes/hours, degrees, money, **times as many / equal groups** (must be multiplicative in a third of the items), equal parts, fractions, decimals, 3 dp, negatives, percent, Roman numerals. A list of several units is judged as a mix |
| H′ unlikeCompare | reads the answer, the payload and the tiles, and "greatest / least / biggest / order" (order_fractions {forms:[1]} and the drag form now fail on a Year 3 Support lesson) |
| M existing option missed | `linkfit.mjs missedOptions()`: every "never X" / "no X" / "without X" part of a unit's clauses is read against the forms / units / task / kind / model value labels of every skill the unit lists and every skill of its direct / partial categories; a label whose content words are all in the part (two words: next to each other) fails unless the unit uses that key + value, or its note or a clause names the skill (says why not) |
| "A and B" titles | `build.py` pass 3b: a link citing "Add and subtract …" / "… times-table and division facts" whose skill deals one half gets "; the adding half)" etc. (23 links); skills that deal both (add_sub_100s, missing_mult_div, sub_check_by_adding, families) are not marked, and `linkfit` fails a marker whose items deal the other half |
| Later-taught pre | `linkfit.mjs`: a pre whose skill this year first teaches after the unit's week, and that no lower year is tagged with, fails (B10.S8 W26 had additive_angles, W31) |

### Each gate proven on a mutated scratch copy (`mut.py`, scratch folder; the old r6 linkfit missed K, L and H′ unlike)
| Mutation | Fired |
|---|---|
| B15.S4 related back to `unit_conversions {units:[1]}` with the r6 why | yes: K customary (quarts) + why claims metric / mL / L |
| B15.S1 related back to `volume {band:30}` | yes: K customary (inches) |
| metric-only `unit_conversions {units:[0],forms:[0]}` related on the customary capacity lesson | yes: K metric-only |
| lesson 7 related `tape_diagram {}` with the times-as-many why | yes: why claims "times-as-many", 0 of 100 |
| lesson 10 back to `frac_10_100` "never adds a tenths and a hundredths fraction" | yes: M, frac_10_100_nv forms value 2 "Add tenths and hundredths" |
| Compare fractions (G2 source) pre `order_fractions {forms:[1]}` ("greatest to least"), and `{forms:[2]}` (drag) | yes, both: H unlike compare |
| customary lesson pre `length_customary` with why "Y3.B7.S4 Equivalent masses (kilograms and grams)" | yes: why claims "kilograms" |
| "the adding half" on `add_sub_100s`; "the subtracting half" on `sub_check_by_adding` | yes, both |
| B10.S8 pre `additive_angles` | yes: first taught W31, after W26 |
| B15.S1 pre why "1 mL of water fills 1 cm³" on cylinder items | yes: why claims "cm" |

## Rows
| Entry | Change |
|---|---|
| K Y5.B15.S4 | related `unit_conversions {units:[0], forms:[0]}` (metric, one conversion a cell: no "1 mile" click-all distractor), why names only "metric"; pre `area_unit_squares` out, `capacity {units:[1], forms:[0]}` in (Y3.B7.S9, 1 L = 1,000 mL); the step's missing clause names its range (a bucket ≈ 5 l = 5,000 ml) |
| K Y5.B15.S1 / S3 | related `volume {forms:[0], band:30}` ("length = 3, width = 3, height = 2", cubic units, no ft / in); B15.S1 pre `mass_volume_liquid {forms:[0]}` (millilitres on a cylinder, not the sort that mixes in grams) |
| L lesson 7 | related `tape_diagram` out; `div_word_problems_plain {forms:[1], range:100}` (grouping: 42 is how many 6s) and `missing_mult_div @100` (___ × 7 = 42). B5.S11 related `tape_diagram` out |
| M lesson 10 | partial **`frac_10_100_nv {forms:[2]}`** "adds a tenths and a hundredths fraction in numbers (3/10 + 5/100), but the forms value does not keep the page to them … and there is no hundred-square picture"; `frac_10_100` clause "has no add form"; `add_tenths_hundredths` rescoped to the true remainder: the pictured add form on `frac_10_100` and making `_nv` forms value 2 filter on the print path |
| Report | the Y4 "Measure in grams" note replaced (below) |
| B2.S6 | related `tape_diagram_plain` and `algebra_word_mixed` out (2 related left) |
| B3.S3 | pre `mult_properties {forms:[0,2]}` (order and × 1), cited "Y4.B4.S12 … (the multiplication half: …)"; B3.S5 `{forms:[2]}`, B3.S7 `{forms:[0]}` likewise |
| Lessons 10 / 14 (carried) | `add_decimal {decimals:2}` why now what it deals (76.28 + 18.2); lesson 14 pre `mass_volume_liquid {forms:[0]}` (the millilitre cylinder), not the sort with grams |
| B10.S3 | preBuild + `turns_angles` (quarter / half / whole turns); note says so |

## The root-cause sweep (`sweep.mjs`)
Every pre / related why (875 links) and every partial clause (148) of Y5.json, steps and lessons, against **30 items on fresh
seeds** (73013 + 59 i; linkfit uses five other seed sets) with the link's opts: (a) every claim word of `claims.mjs` (all claims,
not only the rule ones: operations, representations, contexts too), and every "never / no" operation in a clause against the
signs in the items; (b) customary on metric and metric-only on customary; (c) a pre past 1.5 × its entry's ceiling, or taught
later in the year and in no lower year.

| Pass | Claims checked | Findings |
|---|---|---|
| first rule set, r6 file | 929 | 227 raw (most were rule noise: "times-tables" read as a table, "L-shapes" as litres, nouns after "no") |
| refined rules, r6 file | 778 | 112: a 76, a-neg 0, b 3, c 33 |
| after the fixes (this commit) | 753 | **32: a 0, a-neg 0, b 0, c 32** |

**Fixed from the sweep** (46 per-entry rows in `spec_zz_r6.py` section S, plus 23 half markers): clauses that named what the items
do not deal (B1.S6 "decimal results"; B12.S3 "column items"; B7.S2 / B7.S3 f_to_d after PR #8); whys naming a representation the
items lack ("column method" on line sums B12.S1 / S2; "area model" B5.S2 / S4; "protractor" B10.S4; "bar models" on the circle
model of `equiv_frac_visual` → `{model:['bar']}` on Compare fractions); a cited title in parentheses the opts did not deal
(B14.S4 `length_metric` cm→mm under "metres and centimetres" → `{forms:[1]}`; measurement word problems `{forms:[1]}` under
"kilometres and metres" → `{forms:[3]}`; B7.S4 / B7.S13 `equivalent` "to /10" → `{denoms:[5]}`; B7.S8 `d_to_f` cited
"Thousandths as fractions" → re-cited Y4.B8.S8); false operations / contexts (B3.S9 "round then divide" on a compatible-numbers
skill; B5.S9 "+ remainder" on a no-remainder check; B5.S10 "remainders"; B4.S4 "fraction left"; B11.S4 "coordinate" on plain sums;
stories, "table" for times-tables); unit words in whys used as examples (B8.S3 "7 cm", customary lesson "1 ft = 12 in", B15.S1
"cm³"); (c) B10.S8 additive_angles moved to related, B8.S4 perimeter `{band:20}`, line plots bar_graph `{most:10}`.

**Rule (a) and (b) are now linkfit rules** (the `rule: true` claims, the half markers, K both ways, M, later-taught pre). Operation,
representation and context claims stay in the sweep: they need a reader (e.g. "the place-value reading rounding needs" is a
purpose, not a claim about the items), and the sweep's list was read entry by entry.

**The 32 remaining (c) findings, reviewed, none harder:** a pre with larger numbers but an easier task (6-digit place value before
"100,000 more or less"; 98,000 = 98 × 1,000 before ÷ 1,000; reading 800 mL on a cylinder before customary cups; bar-graph scales;
area_model 2-digit × 3-digit before 4-digit × 2-digit, whose products are larger), thousandths distractors in `frac_10_100`
click-all items on steps after W12 (no forms option to leave them out), decimal sums (94.48 + 93.5 = 188), and number artefacts
(count-by sequences "888,891" read as one number, coordinate payloads).

## PR #8 generator fixes (merged): re-judged
Regenerated, 60 items each with `{denoms:[2]}`: `add_frac_unlike`, `add_frac_unlike_nv`, `add_mixed_unlike`, `sub_frac_unlike`,
`sub_frac_unlike_nv`, `sub_mixed_unlike` deal **0** items outside halves / quarters / eighths on every form (calculate,
click-all, sort).
- B4.S10, B4.S11, B4.S12, B4.S14, B4.S15: the "click-all and sort items ignore {denoms:[2]}" caveat is gone (B4.S11's "45 of 60"
  unrelated pairs with it); the remaining clauses are the real gaps (total within 1 / greater than 1, mixed + proper form, whole
  or improper minuend). `linkfit`'s "unrelated denominators" check now finds none on these partials without the clause naming it.
- **`denoms_all_forms` retired** (built by PR #8): off every build list; not emitted.
- **B4.S17 → FULL**: `sub_mixed_unlike {denoms:[2]}` (0 of 100 off-family). The school teaches it in W16, a week before its first
  unlike addition; the step is itself the first related-denominator lesson (linkfit OWN, as B14.S4 is for customary units).
- **B4.S13 stays partial** on a new, narrower clause: the sort form writes an addend with a zero whole ("2 1/2 + 0 3/4", 13 of
  100 items, also at default opts), which is not a mixed number. New option proposal `mixed_sort_whole`.
- `conversions:f_to_d {denoms:[5]}` no longer deals the halves-and-quarters percent bin (0 of 30): B7.S2 / B7.S3 clauses rewritten.
  B7.S4 (`f_to_d {}`) still has it, so `f_to_d_forms` stays.
- `select_equiv_frac`, `equivalent`, `compare_frac_lcd`, `order_fractions` entries (28: 21 links, 7 direct / partial) re-checked by linkfit and the sweep on the
  new generator: 0 misfits, 0 claim findings. Remaining exception (PR #8 note): a form naming an off-family benchmark is redrawn
  as another form, so a few pages have no click-all / sort item; no Y5 clause depends on those forms.

## Generator defects (record only, round 5)
1. `fraction_operations:frac_10_100_nv {forms:[2]}` does not filter on the print path: a page still deals renaming and click-all
   items (about 6 of 20 are additions). Lesson 10's partial clause and `add_tenths_hundredths` name it.
2. `division:div_word_problems(_plain) {forms:[2]}` ("A remainder to interpret") deals sharing stories with no remainder (12 of
   12); the multi-step remainder lesson's note says why it is not listed.
3. `fraction_operations:add_mixed_unlike` sort form writes "0 3/4" as an addend (13 of 100) — proposal `mixed_sort_whole`.
The round-2 list below is updated: its items 1 (denoms on click-all / sort) and 4 (kg dial answering 0) are **fixed by PR #8**.

## For the lead (replaces the round-4 note on Y4)
No Y4 / Y1 / Y6 links file has a `lessons` section yet (only Y5). When a lane adds one it takes **its own `wrmYear` entries of
`data/curriculum/site-lessons.json`** (Y4: 23, Y1: 39, Y6: 24) and nothing else; "Measure in grams" (G2 source) is a step record
on `Y2.B7.S2`, tagged by the Y2 lane, not a lesson. **12 lesson-only proposals have empty `steps`** (`lessons` + `closes[<lesson
id>]`): a WRM_PROPOSALS merge that reads only `steps` would drop them.

## Counts and gates
136 steps (37 full / 74 partial / 25 gap), 21 lessons (4 / 16 / 1), 175 tagFixes, 101 proposals (29 new, 72 reused), 875 links.
linkfit 0 misfits, optcheck 0, sweep a / b 0 (c 32 reviewed), mergecheck Y5 + R + Y1 + Y4 + Y6 0 problems, critic `merge6.mjs`
0 real conflicts / 0 own-step mismatches / 0 Y5 lesson tagFixes, `ws-wrm-extract --check` exit 0, `ws-boot-smoke` OK, two clean
`git archive` builds byte-identical to the committed Y5.json.

---

# Wave 2 tagging: Year 5 (US Grade 4) — round 4: critic r5 rows (2026-10-16)

Critic r5 (FAIL: B12.S11 = 6; B1.S2 / B1.S9 / B10.S3 = 7; lessons mean 7.82, customary length and weight 6, Compare fractions /
Order fractions / Measure in centimetres 7). Every row is fixed at the source: `linkfit.mjs`, `build.py`, `keys.mjs`, the new
`spec_zz_r5.py` (applied after `spec_z_lessons.py`) and the extractor. No hand JSON.

## Build-level classes
| Class | Fix |
|---|---|
| G overstated FULL | `linkfit.mjs` gate: a FULL unit whose title, WRM block (a percentage step of "Decimals and percentages" excepted) or EVERY CCSS code names decimals must have a decimal in a direct item's **question** (689 ÷ 10 = 68.9 is a whole-number dividend). Run over all 136 steps and the lessons: it finds only **B12.S11**. B3.S9 (same title, Autumn block, 4.NBT.A.1 + 5.NBT.A.2) is the whole-number half and passes by rule; its decimal half is B12.S11 |
| F pre = own direct/partial | `build.py own_repeats()`, run before AND after the linkfit pass (the fit pass had re-optioned the customary lesson's metric pre onto its own partial): a pre / related with the unit's own direct or partial key + opts + Max Number steps one band down (a pre with a numeric band; `keys.mjs` now exports each skill's band values) or is dropped; the rule-15 count / "few" note is re-checked after it. `linkfit.mjs` fails a link that deals the same items, drawn the same way, as an own direct/partial (a `_plain` twin with no picture is the fade, not a repeat). It found 3 more: B2.S6 related `multi_step_word_plain`, B5.S11 pre `mult_comparison_plain`, lesson 7 related `mult_comparison_plain` (all dropped) |
| H Support lessons at W38 | `linkfit.mjs` reads each Support (enrich-native) lesson's SOURCE grade from `site-lessons.json` ("Source: G2.") and judges its pre / related links against it: no Grade-4 first-taught content at all, no compare/order of unlike fractions in a pre below a Grade-4 source (4.NF.A.2), numbers within the source year's range, no customary units on a metric title, no pre citing a WRM year above the source year. The lesson's own direct/partial stays judged at W38. Why checks: a cited "unit fractions" step must be true of a third of the items; every unit a why names must be in a fifth of the items (the false "kilograms and grams" why) |

## Rows
| Entry | Change |
|---|---|
| Y5.B12.S11 | partial: `place_value_10x {op:'/', decimals:true}` "whole-number dividends only (689 ÷ 10 = 68.9); never a decimal divided by 10, 100 or 1,000 (3.4 ÷ 10 = 0.34)". New option proposal **`div10_decimal_dividend`** on `place_value_10x` (decimal dividends on ÷), closes "dividing a decimal by 10, 100 and 1,000". New first pre `place_value_10x {op:'x', decimals:true}` (B12.S10, the inverse, 6.5 × 10) |
| Y5.B1.S2 | pre = `place_value_disks {band:999}` (Y4.B1.S1), `unit_form {band:999}`, `expand {band:999}` (Y4.B1.S2): numbers to 1,000, the step below |
| Y5.B1.S3 | pre disks (own partial) dropped; + `unit_form {band:9999}` (Y5.B1.S2). 3 pre |
| Y5.B1.S9 | own-partial number line dropped; + `place_on_number_line {span:100, band:1000}` (Y4.B1.S3). 3 pre |
| Y5.B10.S3 | pre `measure_angles` (own partial) dropped; the "few" note says why one pre |
| Y5.B5.S11 | `remainder_interpret` clause "12-19"; pre `mult_comparison_plain` dropped (same items as its partial); 3 pre |
| Y5.B2.S6 | related `multi_step_word_plain` dropped (same items as its partial) |
| Customary length and weight | the pre the fit had re-optioned onto the lesson's own partial (false "kilograms and grams" why) is dropped; + `mult_facts {constant:[12]}` (Y4.B4.S10, 1 ft = 12 in) |
| Compare fractions (G2 source) | pre `order_fractions {}` and `equivalent` (Y4) out; pre `identify` (Y3.B6.S1), `shade_fraction` (Y3.B6.S3), `fraction_number_line` (Y3.B6.S7), `equiv_frac_visual` (Y3.B6.S10) |
| Order fractions (G2 source) | pre `compare {}` and `equivalent` out; pre `identify`, `shade_fraction`, `fraction_number_line`; `compare` is related, its why names the frac_compare_same_part option |
| Divide a 1-digit number by 100 (G3 source) | pre `d_to_f {forms:[0]}` re-cited "Y4.B8.S2 Tenths as decimals" (0.3 = 3/10); related `frac_10_100` dropped by the source-grade check (it deals thousandths), the note says why no related fits |
| Lessons 2, 6, 7 | pre `div_facts {}` why: "division facts to 12 × 12, every table" |
| Lesson 7 | related `mult_comparison_plain` (same items as its partial) -> `tape_diagram` |
| Measure in centimetres | **no longer a site lesson** (X1.3 below): the extractor records it on Y2.B6.S1 (`site.supportIn` G4). The `lessons` section is now **21** (16 committee + 5 Support) |

The other Support lessons were re-checked under the source-grade rules: 3D shapes (Reception source), Hundredths (G3) pass
unchanged.

## Extractor (X1, `tests/scripts/ws-wrm-extract.cjs`)
1. **Curriculum core titles that match no WRM step** of any grade and are not scheduled as a step are now site lessons with the
   site's flag (`above` / `native`): G1 "Select money (US)", "Find the total (US)", "Count money - notes and coins (US)",
   G3 "Pounds, tens, ones and pence (US)". The note names the step where the pacing reviews it.
2. **Review entries (`st.rv`) are resolved by this grade's (year, block, step) first**, then by title: G1 W28 -> Y2.B4.S2
   `taughtIn` review, G3 W22 -> Y4.B10.S1 `taughtIn` review, each with a disagreement naming the retitle.
3. **A Support title that matches no step of its stated source grade but exactly matches a step of another grade** is recorded
   on that step's `site.supportIn` with a disagreement: G4 "Measure in centimetres" -> Y2.B6.S1 (site says K), G3 "Measure in
   grams" -> Y2.B7.S2 (site says G2).

Counts: disagreements 12 -> 14 (2 "review matches no step" replaced by 2 retitle notes, + 2 Support source mismatches);
site-lessons 141 -> 143 (+4 core titles, -2 Support titles now on steps); Support titles matched to steps 1,202 -> 1,204,
unmatched 73 -> 71. `--check` reproduces both files (exit 0).

(Round-4 note on Y4 "Measure in grams" withdrawn: it was inaccurate; see round 5 "For the lead".)

## Counts and gates
136 steps (36 full / 75 partial / 25 gap), 21 lessons (4 full / 16 partial / 1 gap), 175 tagFixes, 101 proposals (29 new,
72 reused), 874 links. linkfit 0 misfits, optcheck 0, mergecheck (Y5 + R, Y1, Y4, Y6) 0 real, critic `merge5.mjs` 0 conflicts /
0 Y5 status mismatches / 0 lesson tagFixes, `ws-wrm-extract --check` exit 0, `ws-boot-smoke` OK, two clean `git archive` builds
byte-identical to the committed Y5.json.

## Self-check (fresh seeds 71003 / 91219, the critic's dump script)
B12.S11 8 (partial is honest: every ÷ item has a whole dividend; the new pre deals 6.5 × 10), B1.S2 8, B1.S3 8, B1.S9 8,
B10.S3 8; random 10 (seed 61016: B7.S11, B4.S6, B9.S5, B7.S3, B14.S4, B2.S6, B14.S5, B10.S9, B6.S7, B11.S3) all 8, unchanged
from r5 except B2.S6 (one fewer related). Lessons: customary length and weight 8, Compare fractions 8, Order fractions 8
(related `compare` deals unlike pairs; it is a forward link with an honest why), Divide by 100 8; the other 17 unchanged at 8-9.

# Wave 2 tagging: Year 5 (US Grade 4) — round 3: tooling, site re-extract, site lessons (2026-10-16)

## Round 3 what changed
1. **Tooling** lives in `tests/scripts/wrm-tagging/Y5/` (owner/lead rule: one folder per year); main merged (Y6, R/Y1/Y4/Y6
   links). `mergecheck.mjs` now merges Y5 with every in-repo links file (`build.py` passes R, Y1, Y4, Y6): 0 problems; the 119
   R/Y1 rows that keep a partial clause in `why` with no `partial` field are counted as **format-only** and accepted.
   Two clean `git archive` builds are byte-identical, and the steps / tagFixes are byte-identical to round 2.
2. **Site re-extract** (`tests/scripts/ws-wrm-extract.cjs`): the 872 steps, titles and CCSS of every Y5 step are unchanged.
   Two extractor bugs fixed: a copied-in (`st.g`) or review (`st.rv`) pacing entry carries its OWN grade's block/step numbers
   and used to overwrite this grade's step (wrong week, power flag, US-money flag); and the site now paces by CCSS domain, so a
   domain unit no longer names a WRM block. Disagreements 10 -> 12 (the lead's raw trial had ~152, almost all from those
   two bugs). Y5 steps gain only `enrichment` (29 steps: the pacing badge "ENRICHMENT · GRADE n STANDARD") and `site`
   (27 steps: `supportIn` grades / `taughtIn` copied-in or review uses). New `data/curriculum/site-lessons.json`.
   Y5's build passes against the refresh with no change to any step.
3. **Site lessons**: a top-level `lessons` section in `data/curriculum/links/Y5.json` (below).

## Site lessons (owner rule 2026-10-16: every site lesson tagged)
Source: `data/curriculum/site-lessons.json`, the 22 entries with `wrmYear: "Y5"` (school Grade 4): 16 committee (CCSS custom,
"build required"; all 16 scheduled as `SUP` in the pacing) and 6 Support (enrich-native) titles that match no
WRM step. HELPERS.md's five Awsaj supplements are all present: pattern rules (follow a rule; emergent features; growing shape
patterns), multiplicative comparison (times as many; unknown multiplier), fraction line plots, customary units (capacity;
length and weight), measurement word problems. The other 8 committee lessons are the domain-test builds ("so the domain test only
asks what has been taught").

| Verdict | Lessons |
|---|---|
| full | 4: follow a given rule (number_patterns_rule {pattern:[add,sub], places:[10,100], rule:false}), decompose a fraction (decompose_fractions), angles are additive (additive_angles), 3-D shapes (name_3d_shapes) |
| partial | 17 |
| gap | 1: points, lines, line segments and rays |

Proposals used by lessons: 17 (10 reused: value_ten_times, multi_step_four_ops, decimal_pv, ruler_cm, patterns_notice,
comparison_statements, points_lines_rays, make_line_plot, conversion_table, and Y4's div10_small_numbers; 7 new:
facts_times_tens, growing_shape_patterns, comparison_unknown, add_tenths_hundredths, weight_customary, measure_word_four_ops,
frac_compare_same_part). Every verdict was judged from generated items with the listed opts (e.g. mult_comparison: 4 of 8
items ask "how many times as many?"; remainder_interpret deals divisors to 19; capacity {units:[0],forms:[0]} converts cups,
pints, quarts, gallons one item at a time). Every pre / related link passes `linkfit.mjs` exactly as a step's (the lesson's
first school week; a Support lesson with no week is judged at W38); 880 links, 0 misfits.

**Decision: lessons tag nothing into SKILL_WRM.** A site lesson is not a WRM small step, so it has no `tagFixes`, and a
proposal it needs lists it under `lessons` (never `steps`, which the lead merges into WRM_PROPOSALS); `mergecheck.mjs`
fails a tagFix that names a lesson and checks the section holds exactly the year's site lessons.

### The `lessons` JSON shape (contract for the White Rose page lane)
```
"lessons": {
  "<site lesson id>": {                 // id = data/curriculum/site-lessons.json id: "<school grade>|-|<title slug>"
    "title": "...",                     // the site title
    "site": { "flag": "committee" | "enrich-native" | "other", "supplement": bool, "firstWeek": "W28" | null,
              "ccss": [...], "ee": [...], "domain": "MD", "unit": "Awsaj supplement lessons", "block": "Y5.B9" | null,
              "power": bool },
    "direct":  [{"key", "opts", "maxNumber"?}],             // as a step
    "partial": [{"key", "opts"?, "maxNumber"?, "missing"}],
    "verdict": "full" | "partial" | "gap", "missing": "...",
    "build": ["proposalId"], "pre": [{"key", "opts"?, "why"}], "preBuild": [...], "related": [{"key", "opts"?, "why"}],
    "note": "...", "envision": [{"proposal", "name", "kind", "teaches", "closes", "representation"}]   // partial / gap only
  } }
```
Order: the site's (school week, then id). A proposal used by a lesson carries `"lessons": [ids]` and `closes[<lesson id>]`.

### Owner questions (recommendation)
1. **Support lessons that are really WRM steps under another title** (Hundredths = Y4.B8.S7-S9, Divide a 1-digit number by 100
   = Y4.B8.S10, Compare / Order fractions = Y3.B6.S2 / S5, Measure in centimetres = Y1.B7.S3, 3D shapes = R.B12.S1): should the
   site use the WRM titles so they resolve to the step? *Recommend yes; until then they are tagged here as lessons and the
   note names the WRM step.*
2. **Customary units come before the xlsx's first customary week** (site lessons W30-W31; the xlsx sheet's first customary
   week is W33). *Recommend the site's weeks; linkfit lets these three lessons link customary content.*
3. **Domain-test build lessons with no block** (8): place them in a WRM block (the site leaves `block` null)? *Recommend the
   block the domain test closes, e.g. 4.NF.C.5 tenths + hundredths into Y5.B7 (Decimals).*
4. **Two-column conversion tables** (conversion_table) are asked by both customary lessons: one option on unit_conversions,
   or also on capacity / length_customary? *Recommend one shared form on all three.*

# (Round 2) Wave 2 tagging: Year 5 (US Grade 4) — round 2 fixes (critic r4)

Output: `data/curriculum/links/Y5.json`, generated by `tests/scripts/wrm-tagging/Y5/build.py`. Base: `y5_r0.json`. Hand fixes:
`spec_a_crossyear.py`, `spec_r1.py` (local critic r1), **`spec_r2.py` (this round: every row of `Y5-critic-r4.md`)**.
Round 1 is kept below for history.

## Round 2 counts
| Block | Steps | Full | Partial | Gap |
|---|---|---|---|---|
| Y5.B1 | 14 | 6 | 7 | 1 |
| Y5.B2 | 8 | 2 | 6 | 0 |
| Y5.B3 | 10 | 4 | 6 | 0 |
| Y5.B4 | 17 | 5 | 11 | 1 |
| Y5.B5 | 11 | 4 | 7 | 0 |
| Y5.B6 | 7 | 3 | 3 | 1 |
| Y5.B7 | 15 | 6 | 7 | 2 |
| Y5.B8 | 6 | 2 | 3 | 1 |
| Y5.B9 | 5 | 0 | 0 | 5 |
| Y5.B10 | 10 | 0 | 8 | 2 |
| Y5.B11 | 6 | 2 | 4 | 0 |
| Y5.B12 | 12 | 2 | 5 | 5 |
| Y5.B13 | 5 | 1 | 2 | 2 |
| Y5.B14 | 6 | 0 | 4 | 2 |
| Y5.B15 | 4 | 0 | 1 | 3 |
| **Total** | **136** | **37** | **74** | **25** |

Proposals 87 (21 new, 66 reused); tagFixes 175 (55 add, 93 partial, 21 opts, 6 remove); links 790, 222 with opts.
Three FULL verdicts became partial (B4.S13, B4.S17, B7.S4): their generated items do not teach the whole step.

## Build-level fixes (at the source, not hand JSON)
| Class | Change |
|---|---|
| A — `denoms` ignored by click-all / sort | `linkfit.mjs` `laterGrade`: "unrelated denominators ± (5.NF.A.1)" (a/b ± c/d where neither denominator divides the other). The content and week checks now run on every **direct and partial** too: a direct may not deal later-grade or not-yet-taught content; a partial may, only when its clause names it. New option proposal `denoms_all_forms`. B4.S13 and B4.S17 → partial; every B4.S10–S17 clause says "related on the calculate items only". The 13 B4.S9–S16 links that dealt unrelated pairs were replaced by their like-denominator twins or dropped |
| B — notes instead of opts | `optcheck.mjs`: any option value a clause, why or note names (`{denoms:[5]}`, `units [0]`, `Decimal Places 2`) must equal the entry's opts (35 named values checked, 0 problems). B14.S1–S3 metric `units`; B14.S1 `length_metric {forms:[3]}`, B14.S2 `{forms:[0,2]}`; B7.S2 `f_to_d {denoms:[5]}`; B7.S1/S2/S4 `d_to_f {forms:[0]}` (no percent sort); B12.S5 `{decimals:1}`, B12.S6 `{decimals:2}`; B8.S1 `perimeter {forms:[0,1]}` (no ft stories at W28) |
| C — size rule dropped building blocks | `linkfit.mjs` `clauseCeil`: a partial or gap step is sized from its title **or the example in its own clause** ("4-digit × 1-digit" = 9,999 × 9). A why that names a list of tables ("2, 4 and 8 times-tables") is no longer read as its last table alone, and the named-table constant is tried **before** any band. Restored: `multiply {tiles:21}` first on B5.S6 / B5.S11, `area_model_mult {tiles:21}` on B5.S6, `mult_facts` on B8.S3 (`{band:100}`), B3.S1 (`{constant:[2,4,8]}`), B3.S5, B3.S7, `missing_mult_div {range:100}` on B12.S12 |
| D — stale whys | `linkfit.mjs` `whyCheck`: a size the why claims ("to 100,000", "1,000 more", "N-digit", anywhere in the why) must be dealt, so a re-optioned link can no longer keep a stale why (the fit pass rejects that option set). ~25 whys rewritten or re-banded (B1.S2–S14, B2.S1, B2.S6, B5.S1, B5.S3, B5.S4, B5.S8, B5.S10 …); 5 false-content whys fixed (B2.S7 `equal_sign` dropped, B10.S6/S7 `pie_chart` dropped, B5.S2/S4 `mult_properties` → `{forms:[1]}` breaking apart, B12.S5–S7 `order_decimals` "size") |
| E — duplicates | `build.py` dedupes pre / related by key + opts; `linkfit.mjs` fails two links of one role that deal the same items. B3.S1 `count_by_tables`, B15.S3 `area_unit_squares`, B12.S4 `add_10k_regroup`, B7.S10/S11 `nearest_10` (same items as `rounding_visual`) removed |
| Also | linkfit reads the divisor of a division **story** ("puts 16 in each", "each car holds 15"), not only "÷ 13"; the decimal × whole check reads "1,000" correctly; a "Cup (240 mL)" container is no longer counted as a customary unit; B12.S11 (÷ 1,000 is its own title) may deal thousandths at W10 |

## Step rows (critic r4 table)
| Step | Change |
|---|---|
| B4.S13 / B4.S17 | partial: `add/sub_mixed_unlike {denoms:[2]}` "related on the calculate items only …", `add/sub_mixed_like(_nv)` "like denominators only"; build `denoms_all_forms` |
| B4.S10, S11, S12, S14, S15 | clauses rewritten; build += `denoms_all_forms`; B4.S11 related `add_mixed_like`; notes no longer claim `{denoms:[2]}` keeps every item related |
| B14.S1 | `unit_conversions {units:[0]}`, `unit_conversion_word {units:[1]}`, `length_metric {forms:[3]}`; related `capacity {units:[1]}` (× 1,000 for litres) replaces `multiply {}`; pre `mass_volume_liquid {forms:[2]}` (no "0 kg" scale) |
| B14.S2, B14.S3 | metric `units` on `capacity`, `unit_conversions`, `unit_conversion_word`; `length_metric {forms:[0,2]}` on S2 |
| B5.S6, B5.S11 | pre `multiply {tiles:21}` first (Y4.B5.S9); B5.S11 clause names 4-digit × / ÷ and the 12–17 divisors; B5.S6 related `div_word_problems_plain` |
| B8.S3 | pre `mult_facts {band:100}` first ("sides × side length") |
| B3.S1 | duplicate removed; `count_by_tables {constant:[3]}`, `mult_facts {constant:[2,4,8]}`, `mult_chart {constant:[3,6,9]}` |
| B3.S10 | `multiples` why no longer names 5 and 10; related `more_less_100 {step:1000}` |
| B2.S1 | pre `more_less_100 {step:1000}` ("1,000 more or less"); `add_sub_10s` dropped |
| B2.S7 | `equal_sign` dropped; `balance_addsub` moved to pre; related `estimate_sums_diffs` (the critic's `compare_expressions` is the step's own partial) |
| B1.S3 | pre `place_value_disks` / `expand {band:9999}`; related `compare {band:99999}` |
| B12.S4 | `add_10k_regroup` dropped; `compare_decimal {decimals:1}` moved to pre (Y4.B9.S5) |
| B12.S3 | related `money_change {currency:"usd"}` (change from a whole dollar, the same crossing of 1); the critic's `add/sub_decimal` are this step's own partials |
| B10.S7 | `pie_chart` dropped (note says why no related fits); pre `sub_1k_regroup` |
| B13.S5 | related `add_int` dropped (also on B13.S2, B13.S3) |
| B14.S5 | pre `mult_facts {constant:[6,7]}` |
| B7.S8 | build folded into Y4's `dec_same_whole` (spec copied verbatim, the "same places" value carried as `addValue` for the lead); filler `placevalue:compare` dropped |
| B15.S3 | duplicate removed; pre `estimate_length {forms:[0]}` (metric benchmark estimates); the clause carries the step's own range |
| B11.S2 | clause is the missing vertex only, which `coord_polygon_draw` closes |

## Full sweep
Every direct / partial (3 items) and every link (2 items) was generated with its opts on fresh seeds and read against its
clause or why (3,364 lines). Beyond the critic's rows it found and fixed: B1.S2 / B1.S5 / B1.S9 / B1.S10 related whys,
B3.S6 / S7 / S10 related whys, B5.S2 `distributive_expr` (6.EE letters, dropped), B5.S3 / B5.S4 / B5.S7 / B14.S1–S3
`place_value_10x` and `multiply` opts matched to their cited step, B5.S9 / B5.S11 `remainder_contexts` (15-children cars:
2-digit divisor, dropped by the new story check), B6.S1 / B6.S7 `mult_scaling` (5.NF.B.5) and B7.S12 `percent_of_number`
(6.RP) dropped, B10.S6 `pie_chart`, B12.S1 / S2 / S10 / S11 whys that cited a later step or described another item,
B14.S4 `capacity {units:[0], forms:[1]}`, B15.S2 / B15.S4 opts and whys (B15.S4 related was customary under a "l↔ml" why).
96 links are dropped by linkfit (content before its week, later-grade content, or no option set fits); the 24 dropped pre
were re-audited for lost building blocks and those in class C restored.

## Self-grade (rule 6), fresh seed 90210
B4 (all 17), B14.S1–S3 and a random 10 (seed 20261017: B1.S4, B2.S2, B3.S2, B5.S4, B7.S7, B7.S13, B8.S3, B10.S9,
B12.S10, B15.S3), each re-read from generated items. Every verdict, clause and opts matches the items; every pre list has
≥ 3 (or a "Pre-skills are few" note) with the building block first; related links share the idea or a note says why
none fits. One fix came out of it (B15.S3 estimate link, above). I would grade each 8.

## Gates
- `build.py` twice from two clean `git archive` folders: byte-identical to the committed Y5.json.
- linkfit 0 misfits (790 links plus every direct / partial); optcheck 0 problems; mergecheck OK.
- Critic's `mergesim.mjs` with R, Y1 (06320cc4) and Y4 (7314ee1e): Y5 0 in both encodings; R 69 / Y1 50 are the known
  format-only R/Y1 clause encoding; the one "real" line is Y4 writing a Y2 step, outside Y5.
- Critic's `dscan.mjs`: the remaining hits are partial clauses that name the issue (B4 unrelated pairs, B7 percent tiles,
  B14 customary length key) or regex false positives ("around … 3.5" read as rounding, "90°-180°" read as negative,
  "Cup (240 mL)" read as customary). `whysize.mjs`: 2 hits on `identify`, whose number sits in the cell payload, which
  the script does not read; the claim is true.

## Generator defects found (record only; app code not edited)
1. ~~**`denoms` ignored by click-all and sort forms.**~~ **Fixed by PR #8 (round 5):** `generate-question.js` `itemDenominators` / `itemPlainText` read only
   `q.text` / `q.printText`, not `q.options` / `q.tiles` labels, so the "Click ALL sums greater than 1" and drag-sort forms
   of `add/sub_frac_unlike(_nv)` and `add/sub_mixed_unlike` (`gen-fractions.js` ~932, 996, 1070, 1107, 1182, 1416, 1499;
   their dPool is `[2,3,4,5,6,8]`) pass the family filter with unrelated pairs (3/5 + 3/8). Fix: filter the option labels too,
   or draw dPool from the ticked family. Proposal `denoms_all_forms`.
2. `measurement:unit_conversions {units:[0]}` (metric): the "equivalent to 1 kilometer" click-all offers "1 mile".
3. `measurement:unit_conversion_word {units:[1]}` (metric): the Length Key beside every story lists 1 ft = 12 in, 1 yd = 3 ft.
4. ~~`measurement:mass_volume_liquid` form 1 answers 0 for sub-kilogram masses.~~ **Fixed by PR #8 (round 5)**: kg dials step in whole kilograms.
5. `division:remainder_interpret`, `remainder_contexts` and `number_ops_mixed:word_problems_mixed` deal division stories with
   2-digit divisors (13–19) at default range; `{range:100}` removes them from `remainder_interpret` only.
6. `conversions:f_to_d` has no `forms` option (its twin `d_to_f` has one), so its percent drag-bin cannot be left out
   (proposal `f_to_d_forms`).
7. `order_of_operations:exponents_simple` deals bases far above 12 (49², 22³) (in the B3.S6 / S7 clauses).
8. Carried from round 1: `length_metric` at Max Number 1,000 answered "How many m in 10 km?" with 1,000.

## Owner questions (recommendation adopted)
1. **Click-all / sort forms that ignore the denominator family:** fix the filter (generator) or add an option?
   **Recommended:** fix the filter so `denoms` holds on every form (`denoms_all_forms` is written as an option so the lead can
   schedule it; it needs no new UI). Until then B4.S10–S17 stay partial.
2. **B4.S17 is taught in W16, a week before unlike denominators (W17).** Keep the school order and link only like-denominator
   pre-skills? **Recommended:** yes; the clause records it.
3. **Y5 `dec_compare_same` vs Y4 `dec_same_whole`:** one option with two values ("same whole part", "same whole part, same
   places")? **Recommended:** yes; Y5 now reuses `dec_same_whole` with an `addValue` note.
4. **f_to_d percent tiles one week before percent (W22):** partial now, or accept as minor? **Recommended:** partial with the
   small `f_to_d_forms` option, so B7.S4 is honest and closes cheaply.
5. **Gap steps sized by their clause example** (B2.S7, B5.S11, B15.S3): acceptable? **Recommended:** yes, the example is the
   step's own WRM range; the alternative is dropping the building blocks the critic asked to keep.


---

# Round 1 (history): Year 5 (US Grade 4) — round 1 fixes

Output: `data/curriculum/links/Y5.json`, now **generated** by `tests/scripts/wrm-tagging/Y5/build.py` (ported from the Y4 lane,
critic r13). Base: `y5_r0.json` (the round-0 hand-authored file, a181f8a4). Hand fixes: `spec_a_crossyear.py`,
`spec_r1.py`. Fixes the defects of `Y5-critic-local-r1.md` (FAIL 6.30). Earlier rounds: `Y5-critic.md`.

## How to rebuild and check
```
python3 tests/scripts/wrm-tagging/Y5/build.py     # exit 1 on any problem; byte-identical output run to run
node tests/scripts/wrm-tagging/Y5/mergecheck.mjs data/curriculum/links/Y5.json <R.json> <Y1.json> <Y4.json> [...]
node tests/scripts/wrm-tagging/Y5/items.mjs <out.md> [stepIds]   # 6 print-path items per direct/partial skill
```
The build runs these passes:
1. keys.mjs and prior.mjs: live keys, tags and proposals; the Grade 4 sheet weeks. "3D shapes" is pinned to W26 for B10.S10.
2. The spec fixes.
3. A pre must cite a step its skill is tagged to, and that step must be taught by this school week. Otherwise it is
   re-cited, or labelled "nearest live practice".
4. `linkfit.mjs --fit` generates 100 print-path items for every pre and related link (5 seed sets). Each link must pass:
   - the size rule;
   - the Grade-4 first-taught table from the critic (W01 to W38);
   - later-grade content (decimal × decimal, fraction × fraction, triangle area, ratio, axis reflection, two-digit divisors…);
   - a degenerate-link test;
   - the why claims.
   A link that fails gets the nearest option set that passes: band or range, forms, units, decimals, or the table named in
   its why. If none passes, the link is dropped.
5. tagFixes are derived from a diff against live SKILL_WRM.
6. Every partial and gap step gets `envision` (name, kind, teaches, closes, representation), and every build proposal gets
   `closes`.
7. Gates: mergecheck, linkfit (0 misfits), optcheck.

## Counts
| Block | Steps | Full | Partial | Gap |
|---|---|---|---|---|
| Y5.B1 | 14 | 6 | 7 | 1 |
| Y5.B2 | 8 | 2 | 6 | 0 |
| Y5.B3 | 10 | 4 | 6 | 0 |
| Y5.B4 | 17 | 7 | 9 | 1 |
| Y5.B5 | 11 | 4 | 7 | 0 |
| Y5.B6 | 7 | 3 | 3 | 1 |
| Y5.B7 | 15 | 7 | 6 | 2 |
| Y5.B8 | 6 | 2 | 3 | 1 |
| Y5.B9 | 5 | 0 | 0 | 5 |
| Y5.B10 | 10 | 0 | 8 | 2 |
| Y5.B11 | 6 | 2 | 4 | 0 |
| Y5.B12 | 12 | 2 | 5 | 5 |
| Y5.B13 | 5 | 1 | 2 | 2 |
| Y5.B14 | 6 | 0 | 4 | 2 |
| Y5.B15 | 4 | 0 | 1 | 3 |
| **Total** | **136** | **40** | **71** | **25** |

- **Proposals:** 85. 20 are new, all options on live skills, plus 65 reused. Of the reused, 3 come from Y4.json:
  `roman_numerals`, `improper_mixed_dir` and `coord_polygon_draw`. They are linked, not redefined.
- **tagFixes:** 170 (55 add, 87 partial, 22 opts, 6 remove). They are derived; every partial carries its clause.
- **Links:** 805. 196 of them carry opts or a Max Number. Each of the other 609 was generated with its defaults: 100
  items, and it fits the step on size, school week and content.
- **Gates:** two builds give byte-identical output. mergecheck reports 0 problems, both for Y5 alone and with R, Y1, Y4,
  Y2 and Y3. linkfit reports 0 misfits; optcheck reports 0 problems.

## Critic r1 defects: what changed
| # | Class | Fix |
|---|---|---|
| 1 | Links without opts | linkfit --fit gives every link the nearest option set whose items fit; 148 links were re-optioned |
| 2, 3, 18 | Content taught too early; pre cites a later step | The Grade-4 week table is in linkfit; 107 links that cannot fit were dropped; 30 pre were re-cited by school week |
| 4 | Range beyond the step | The linkfit size rule (1.5 × the step ceiling, or the cited ceiling) |
| 5 | Later-grade content | The linkfit later-grade checks. The named links were also removed by hand: mixed_decimals, div/mult_decimal, mult_frac_frac, mixed_fraction_ops, geo_reflect, mixed_conversions, mixed_area_perimeter, area_triangle |
| 6, 13 | False or stale why; cites an untagged step | whyCheck covers tables, digits, "to N", fraction families and units. The re-cite pass handles untagged steps. Round-0 "easier: {…}" notes were removed from the whys |
| 7 | Overstated FULL | B3.S1, B4.S11, B8.S4 and B7.S3 are now partial, with new builds `multiples_2digit`, `frac_total_band`, `area_rect_only` and `frac_hundredths_dec` |
| 8 | tagFix derivation | tagFixes are derived from SKILL_WRM; mergecheck is 0 |
| 9 | Partial step with full directs | B1.S3, B1.S4, B1.S5, B1.S8, B5.S4, B5.S7 and B5.S11: each direct is now a partial with its own clause |
| 10 | Notes used as opts | B6.S6 `{forms:[1]}`; B8.S2 `{forms:[0]}`; B4.S10/12/14/15 `{denoms:[2]}`; B7.S11 `{forms:[0]}`; B7.S9 `{decimals:3}`; B12.S4 `{decimals:1}`; B14.S5 `{units:[0]}` |
| 11 | Own build in preBuild | Removed by the build |
| 12 | Fewer than 3 pre | Filled with links that fit the week, or a "Pre-skills are few:" note that says why (B10.S3, B10.S4, B10.S5) |
| 14 | Degenerate links | compose_rect_from_squares, shape_name_match_3d and time_sense were removed; linkfit tests every link for this |
| 15 | No `closes` | `closes` (the step's missing clause) on every build proposal, plus `envision` on every partial and gap step |
| 16 | Owner rulings | roman_12, roman_100 and roman_1000 are folded into `roman_numerals` (Y4's spec: bands 12 / 100 / 1,000 / 3,999, read and write). improper_direction is now `improper_mixed_dir`. `thousandths_pv` is patched to sit on the decimal_pv proposal |
| 17 | time_convert already partly built | Patched to cover only days, weeks, months and years, and smaller to larger. B14.S5's partial carries `{units:[0]}` |
| 19 | Building block listed as related | Moved to pre: B1.S1 combine; B3.S7 mult_properties; B10.S4–S6 identify_angles and temperature; B11.S2 coord_distance_q1; B15.S2 compare |

All the per-step fixes the critic sampled were applied in `spec_r1.py`: B1.S1, B1.S11, B4.S11, B4.S13, B5.S1, B5.S11,
B6.S5, B6.S6, B7.S9, B8.S2, B8.S3, B9.S1, B9.S2, B10.S8, B10.S10, B12.S4, B12.S8, B14.S6, B3.S1, B3.S10, B5.S6, B12.S9
and B7.S6.

HELPERS leftovers:
- **Multiples of 25 and 15 (B3.S1):** the step is now partial, with the new option `multiples_2digit`.
- **fd_place_band vs thousandths_pv (B7.S5):** `fd_place_band` now covers tenths and hundredths only, and thousandths
  belong to `thousandths_pv` alone.

Proposal ids for the lead to merge:
- `coord_missing_vertex` is dropped. Y4 never had that id: Y4's `coord_polygon_draw` already includes "find the missing
  vertex", so B11.S2 links to it.
- `PATCH`ed live proposals (`thousandths_pv`, `time_convert`, `mult_multiples`) carry `corrected` and `correctionWhy`.

## Self-check (rule 6)
I generated 6 items each for the directs and partials of 10 random steps (seed 20261016): B2.S5, B11.S4, B7.S9, B7.S2,
B10.S3, B10.S7, B5.S6, B7.S8, B4.S7 and B5.S10. Every verdict and clause matched the items. One caveat: in B7.S9,
order_decimals `{decimals:3}` uses 2-digit whole parts (94.255).

## Hardest calls
- **Customary units:** the critic dates them to W33, but Imperial units (B14.S4) is W32. That step alone is exempt.
- **Gap steps** have no items, so their size ceiling is 100 unless the title names a number. This dropped several useful
  links, for example on B12.S12. Notes say why.
- **A full step may list a partial skill beside its full directs** (B5.S3, B5.S8, B7.S11). This is honest and
  merge-safe.

## Owner questions (recommendation adopted)
1. Should Imperial units (B14.S4, W32) count as the first customary week, so that W32 links may use customary units?
   **Recommended:** exempt that step only and keep W33 for every other step. Adopted.
2. Should multiples of 15, 25 and 50 be an option on number_theory:multiples, or a new skill? **Recommended:** an option
   (`multiples_2digit`). Adopted.
3. Should Roman numerals stay on the list even though they are beyond CCSS? **Recommended:** yes, as one `roman_numerals`
   skill with bands 12 / 100 / 1,000 / 3,999 (owner ruling). Adopted, and the Y3/Y4 prior-learning lessons point to the
   same skill.
4. Area of rectangles: a rectangle-only option on `area`, or a new skill? **Recommended:** an option (`area_rect_only`).
   Adopted.

## Merge check across years (lead's gate)
- Y5 alone: 0 problems. Y5 + Y4: 0. Y5 + Y4 + Y2 + Y3: 0.
- Y5 + R + Y1 + Y4: 119 problems, **all on R and Y1 steps** (69 R, 50 Y1). R.json and Y1.json fail this mergecheck on their own too: their
  `partial` tagFixes predate the `partial: <clause>` field (merged clause comes out undefined). None involves a Y5 step;
  the R/Y1 lane's tagFixes need the clause field before the lead merges them with this checker.
