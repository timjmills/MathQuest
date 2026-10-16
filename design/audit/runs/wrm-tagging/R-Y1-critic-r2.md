# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 2

Independent critic. The tagging data was not edited. Tree `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `e518c787`.
Checked: `data/curriculum/links/R.json`, `Y1.json`, `R-report.md`, `Y1-report.md`, `R-Y1-items.md`, and the round-1 critic (`R-Y1-critic.md`, 6.80 / 6.23).
Also checked: rules 14-17 from the lead branch's BRIEF, counted at the lead's request.

## Verdict: FAIL

| Year | Steps scored | Mean | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|
| R | 25 (20 random + 5 hard) | **7.28** | 3 | 2 | 5 | 15 |
| Y1 | 25 (20 random + 5 hard) | **7.12** | 1 | 1 | 17 | 6 |

- The random draws alone score **R 7.40** and **Y1 7.15**.
- Round 2 is a real improvement: R went from 6.80 to 7.28 and Y1 from 6.23 to 7.12. The worst round-1 failures are fixed:
  - the bands for 1-2-3 and 6-7-8
  - counting in 2s, 5s and 10s
  - halves and quarters
  - the bridging skills in Y1.B5.S2
  - the column layouts
  - pre = related, and same-block padding
- Both years still fail on two counts:
  - **R7 range:** 12 `full` steps deal mostly numbers outside the step.
  - **A new systematic defect:** pre and related links carry no opts, so the skill's defaults deal 2- and 3-digit numbers to 4- and 5-year-olds (51 entries).
- Y1 also misses option values that already exist (Max Number 20) and keeps proposals for them.
- The pre lists are thin. That is rules 14-15; the tagger had not yet seen them.

## Method

- **Sample.** `random.Random(4417).sample(steps, 20)` per year, in the step order of the links file. This is a new seed; round 1 used 20261010.
  - R random: B2.S6, B3.S2, B3.S5, B4.S4, B5.S1, B5.S6, B8.S3, B9.S1, B9.S10, B10.S5, B11.S5, B11.S10, B12.S3, B12.S5, B13.S4, B14.S1, B15.S1, B17.S1, B17.S7, B17.S10.
  - R hard: B3.S6 (1-2-3), B7.S7 (composition 0-5), B9.S9 (combine), B6.S1 (shapes), B13.S5 (oral).
  - Y1 random: B1.S13, B1.S15, B2.S3, B2.S8, B2.S9, B2.S14, B4.S8, B4.S10, B5.S7, B6.S2, B6.S8, B8.S2, B9.S1, B9.S3, B9.S9, B10.S3, B10.S7, B13.S1, B14.S3, B14.S6.
  - Y1 hard: B9.S2 (10s), B13.S4 (coins), B1.S7 (1 more), B11.S2 (position), B5.S1 (count on).
  - Every round-1 step that scored under 8 was re-checked, plus 3 steps found by the whole-file scans (Y1.B2.S4, Y1.B12.S1, Y1.B5.S10).
- **Generation.** Items were made with node + `generateQuestionFor`, with new seeds (31337 + 101i, 8 items; 55001 + 7i for the option-effect tests). The items log was not trusted. Coverage:
  - every direct and partial skill+opts in both files (114 signatures, 0 errors), with Max Number taken from `range`
  - extra runs with 20-30 seeds where a distribution mattered
  - default-opts runs for keys used in pre and related
- **Option checks.** Every opts value in direct, partial, pre and related was checked against `skill-options.js` (0 invalid). For each opt, the opt was dropped and the items regenerated (rule 17). `range` was tested both as Max Number and as the skill's own `range` option; both read the same.
- **Sources.** Each sampled step was read in `wrm-steps.json`. For Y1, the step's week row and support list were also read in the xlsx Kindergarten sheet.
- **Whole-file scans.** Scripts counted S1-S7, R7-R10, `closes`, opts-less links and the option-effect test across both files.

## Per-step scores (every step below 8 has its fix)

### Reception

| Step | Score | Finding (from generated items) | Fix |
|---|---|---|---|
| R.B2.S6 Create simple patterns | 8 | The gap is honest and `pattern_make` closes it. | none |
| R.B3.S2 Subitise 1, 2 and 3 | 8 | The partial is right; `subitise` and `band_3` fit. | none |
| R.B3.S5 1 less | 7 | The partial and builds are right. **Related `placevalue:more_less_10 {}`** deals "1 more than 69" and "10 more than 90". | Give related links their opts (`more_less_10 {step:1, band:20}`), or drop it. |
| R.B4.S4 Describe position | 8 | The partial is right (above, below, beside and between only). | none |
| R.B5.S1 Find 4 and 5 | 6 | **R7:** `count_objects {band:5}` dealt 5, 3, 2, 1, 4, 5, 3, 2, so 5 of 8 items are 1-3 and do not practise 4 or 5. The note justifies this as "inside the block". The same reasoning made R.B3.S1 partial. | **partial**, missing "groups of 4 and 5". Extend the band proposal to a 4-5 focus (see owner question 1). |
| R.B5.S6 Composition of 4 and 5 | 7 | `number_bonds {band:5}` over 30 seeds gave wholes 3:3, 4:7 and 5:20. That is close enough to `full`. The only pre is `count_objects {}` (default band 20); the R.B3.S6 bond and `ten_frame_build {band:5}` are missing. | Pre: `number_bonds {band:5}` (R.B3.S6), `ten_frame_build {band:5}`. |
| R.B8.S3 Explore capacity | 8 | The gap is honest; `capacity_early` fits. | none |
| R.B9.S1 Find 6, 7 and 8 | 8 | The partial is right; `band_6_8` fits. | none |
| R.B9.S10 Conceptual subitising | 8 | The gap is honest. | none |
| R.B10.S5 Talk about time | 8 | The gap is honest; `time_talk` fits. | none |
| R.B11.S5 1 more | 7 | The partial is right. The related `more_less_10 {}` deals to 100. | As R.B3.S5. |
| R.B11.S10 Bonds to 10 (3 parts) | 8 | Right; `bonds_3_parts` fits. | none |
| R.B12.S3 Use 3-D shapes for tasks | 8 | The gap is honest. | none |
| R.B12.S5 Identify more complex patterns | 8 | The partial is right (typed names). | none |
| R.B13.S4 Continue patterns beyond 10 (14-20) | 5 | **R7:** `count_sequence {band:20}` gives "after 4, 6, 8 …" (5 of 8 below 14). `number_seq_fill {range:20}` tracks are "4, 5", "7, 8" (6 of 8 below 14). R.B13.S2 (10-13) is `partial` with the **same** two skills. Related `more_less_10 {}` and `hundreds_chart_fill {}` deal to 100. | **partial**, missing "continuing 14-20 only". Build `teen_bands` (it already lists `count_sequence`); add R.B13.S4 to it. |
| R.B14.S1 Add more | 5 | `add_5_pictures` is "How many in all? 1 + 2" (combining, to 5). `add_wp_10` is a word-work cell: text lines, an **operation bank + − × ÷** and a **unit-word bank** ("days, fish, boxes"). That is not a Reception response (R8). This is unchanged from round 1. Pre `count_objects {}` and `number_bonds {}` have no opts. | **partial**, missing "add more with pictures to 10". Reuse `add_10_pictures` (Y1) with a join-more form, or `pictures_change_unknown`'s start-change picture. |
| R.B15.S1 Select shapes for a purpose | 8 | Right. | none |
| R.B17.S1 Identify units of repeating patterns | 8 | Fixed: pre now holds R.B12.S5 and S7. | none |
| R.B17.S7 Give instructions to build | 7 | The partial is right. **Pre is empty.** The note says the earlier steps "use this same skill", but `shape_positions {forms:[0]}` and the R.B4 shape names are earlier learning (rule 15). | Pre: `shape_positions {forms:[0]}`, `name_2d_shapes {forms:[1]}`. |
| R.B17.S10 Create own maps | 8 | The gap is honest. | none |
| R.B3.S6 Composition of 1, 2 and 3 (hard) | 7 | The partial and `band_3` are right. Pre `count_objects {}` and `ten_frame_build {}` carry no opts (band 20 and band 10). | Pre opts `{band:5}` (until `band_3` exists). |
| R.B7.S7 Composition, 0-5 block (hard) | 6 | **R7:** `number_bonds {band:5}` over 30 seeds: wholes are only 3, 4 and 5, and **no part is ever 0**. The block is "0 to 5" and introduces zero. | **partial**, missing "wholes 1-2 and a zero part". Add it to `band_3` (whole down to 1) and `zero`. |
| R.B9.S9 Combine 2 groups (hard) | 5 | **R7 + R8:** `add_wp_10` gives totals of 9 and 10 in 3 of 8 items (the block is 6-8), as a word-work cell with an operation bank that includes × and ÷. `add_5_pictures` stops at 5. Pre are the doubles skills; the bond and count skills, the real building blocks, sit in related (S6). | **partial**, missing "combine two pictured groups to 8". Build `add_10_pictures {band 8}`. Pre: `number_bonds {band:5}`, `count_objects {band:10}`. |
| R.B6.S1 4-sided shapes (hard) | 8 | `name_2d_shapes {forms:[1], shapes:[2]}` deals only squares and rectangles (tap). Right. | none |
| R.B13.S5 Verbal counting beyond 20 (hard) | 8 | The partial and `oral_count` are right; range 50 deals 22-46. | none |

### Year 1

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S13 Compare numbers | 7 | The partial and `compare_small` are right. Only 2 pre; Y1.B1.S12 is missing. Related `order_least_to_greatest {}` orders 3-digit numbers (286, 625, 725). | Related opts `{band:99}` or drop it. Pre: `compare_groups {band:10}`. |
| Y1.B1.S15 The number line | 8 | The gap is honest; `nl_20` lists Y1.B1.S15 in `closes`. | none |
| Y1.B2.S3 Write number sentences | 8 | Right (the picture skills print the sentence). | none |
| Y1.B2.S8 Add together | 7 | The partial and `add_10_pictures` are right. Related `add_10_mixed {}` is labelled "(across)", but default opts draw "Column Addition … carrying". | Related opts `{notation:['across']}`. |
| Y1.B2.S9 Add more | 8 | `add_wp_10 {band:10}` (pictured stories) and `number_line_add` at Max 10. Acceptable for K.OA.A.2. | none |
| Y1.B2.S14 Take away, cross out | 8 | Right; `sub_10_pictures`. | none |
| Y1.B4.S8 The number line to 20 | 7 | The gap is right. Pre `placevalue:compare {band:99}` (2-digit symbols) is not a building block. The real one, adding on the 0-10 line (`number_line_add`, Y1.B2.S9), is only in related (S6). | Pre: `number_line_add {range:10}`, the Y1.B1.S15 build. Drop `compare`. |
| Y1.B4.S10 Estimate on a line to 20 | 8 | Right. | none |
| Y1.B5.S7 Subtraction, counting back | 5 | **An existing value was missed (rule 5).** At Max Number 20, `nl_sub` and `number_line_sub` draw a **0-20 line** (payload min 0, max 20) with items like 15 − 3, 16 − 6 and 17 − 6. The step is `full` with `{range:20}`, and `nl_20` is not needed here. The main building block, counting back (Y1.B1.S8, `count_sequence {dir:'back'}`), is not a pre. | **full**: `nl_sub {range:20}`, `number_line_sub {range:20}`. Pre: `count_sequence {band:20, dir:'back'}`, `nl_sub {range:10}`. |
| Y1.B6.S2 20, 30, 40 and 50 | 7 | `tens_foundation_visual {band:50}` asks "How many tens?" and the answer is 1-5. The pupil never writes or says 20, 30, 40 or 50. Near-full. | Note it, or mark partial ("name the multiple of ten"). |
| Y1.B6.S8 1 more, 1 less | 7 | `more_less_10 {step:1, band:50}` is right. Pre includes `compare_groups` and `placevalue:compare` (from the week list, not building blocks). The Y1.B6.S1 count to 50 is missing. | Pre: `number_seq_fill {step:1, range:50}`. |
| Y1.B8.S2 Measure mass | 6 | The gap is right. Pre is mass and size comparison. The measuring building block, `measure_nonstandard` (Y1.B7.S2, cubes for length), is only related (S6, rule 15). `preBuild capacity_early` is not a building block of mass. | Pre: `measure_nonstandard`, `count_objects {band:20}`. Drop `capacity_early`. |
| Y1.B9.S1 Count in 2s | 7 | The partial and `multiples_from_0` are right; `skip_count_line {step:[0]}` gives true multiples, mixed 2s and 5s. Related "tens as rods" is not the same idea. | Pre: R.B9.S8 doubles (`double {band:20}`), `number_seq_fill {range:50}`. |
| Y1.B9.S3 Count in 5s | 7 | Same as S1. | Pre: the count-in-2s and count-in-10s skills (rule 15). |
| Y1.B9.S9 Sharing | 8 | Right. | none |
| Y1.B10.S3 Recognise a half of a quantity | 7 | The partial is honest, but the tagged partial skill is far from the step. `fraction_of_set {denoms:[2]}` deals "?/6 of 18 = 3", "?/3 of 9 = 6" and "?/5 of 15" in 4 of 12 items: **the denoms value is ignored in the missing-numerator form (rule 17).** | Keep partial. Say in `missing` that the option leaks thirds, fifths and sixths. Prefer `partition_shapes`/`halve` as related. |
| Y1.B10.S7 Recognise a quarter of a quantity | 7 | Same as S3. | Same. |
| Y1.B13.S1 Unitising | 7 | The partial and `unitise_coins` are right. Pre `count_objects {}` and `base10_build {}` (default to 99). Counting in 5s and 10s, the building block of coin value, is missing (rule 15). | Pre: `skip_count_line {step:[0], band:50}`. |
| Y1.B14.S3 Months of the year | 7 | The gap is right. The related `time_hour` is not the same idea. | Related: none, or the `time_talk` days build. |
| Y1.B14.S6 Time to the half hour | 7 | `time_half_hour` is right ("4:30"). There is 1 pre. Half of a shape (`partition_shapes {parts:[0]}`) and `clock_parts` are missing. | Add both as pre. |
| Y1.B9.S2 Count in 10s (hard) | 7 | The partial is honest. `skip_count_line` has no single-count value: `{step:[2]}` gave 3s, 4s and 6s, and 10s exceeded band 50. | Pre: `tens_foundation_visual {band:90}`, `hundreds_chart_fill {band:100, gaps:'column'}`. |
| Y1.B13.S4 Count in coins (hard) | 7 | `money_count {kind:'like', values:[1,5,10], band:50}` deals 5 dimes = 50, 4 nickels = 20 and pennies. Full is right. Pre lacks counting in 5s and 10s (rule 15). | Pre: `skip_count_line {step:[0], band:50}`. |
| Y1.B1.S7 1 more (hard) | 7 | Full is right for K ("what comes after 6", within 10). The related `more_less_10 {}` deals "10 more than 90", although the note says it is beyond the block. | Drop it, or give it `{step:1, band:20}`. |
| Y1.B11.S2 Left and right (hard) | 7 | The partial is right. **Pre is empty**, although R.B4.S4 and R.B17.S6 are earlier learning (`shape_positions {forms:[0]}`). | Pre: `shape_positions {forms:[0,1]}`. |
| Y1.B5.S1 Add by counting on within 20 (hard) | 7 | `add_20_no_regroup` (13 + 5, 11 + 8) is right. The partial `number_line_add {range:10}` "stops at 10", but **`{range:20}` draws the 0-20 line** (13 + 2, 14 + 4). | Set `number_line_add {range:20}`; it can move to direct. |

### Re-check of every round-1 failing step

- **Fixed (8):**
  - R: B9.S5, B10.S3, B12.S6, B13.S3, B15.S2, B15.S6, B2.S5, B13.S6, B17.S1.
  - Y1: B1.S1, B2.S7, B4.S5, B5.S2, B5.S3, B9.S4, B10.S8, B11.S4, B10.S2, B14.S5.
- **Improved to 7:**
  - R: B16.S3 (one weak pre), B3.S1 (one pre), B3.S4 (related `more_less_10 {}` to 100).
  - Y1: B2.S8 and B2.S15 (related `add_10_mixed {}` / `sub_10_mixed {}` draw columns), B9.S1-S3, B13.S1.
- **Still failing:**
  - **R.B14.S1** (5): see above.
  - **R.B5.S7** "Composition of 1-5" (6): `full`, but the note itself says "Wholes 3-5". Over 30 seeds, wholes 1 and 2 never appear. Fix: **partial**, missing "wholes 1 and 2"; build `band_3`.
  - **Y1.B5.S10** "Missing number problems" (5): `partial` + `missing_20`, but **the option is already built**. At Max Number 20, `missing_add_sub` deals 12 − __ = 7, 7 + 9 and 15 − __ = 7, and `cloze_addition` deals "make 16" and "make 17". The `missing` text ("Max Number 10 or 100 only") is wrong. Fix: **full** with `{range:20}` on both. Withdraw `missing_20` (rule 5).
  - **Y1.B12.S2** "Tens to 100" (7): see owner question 2 below.
  - **Y1.B13.S2** "Recognise coins" (6): pre is still only `tens_foundation_visual` (rods). Fix: pre `count_objects {band:20}`, `skip_count_line {step:[0], band:50}`, Y1.B13.S1's `coin_value`.
- **Found by the whole-file scan:**
  - **Y1.B2.S4** "Fact families - addition facts" (5): `full`, but **both** skills deal subtraction facts ("8 − 6 =", "6 − 4 ="), which is S13's content. Neither writes "8 = 6 + 2". Fix: **partial**, missing "the addition facts only, both orders and = on the left". Add an option proposal (an addition-only family).
  - **Y1.B12.S1** "Count from 50 to 100" (5): **R7**. `number_seq_fill {range:100}` dealt 21-22, 32-33, 44-46, 30-29 and 36 (6 of 8 below 50); `hundreds_chart_fill {band:100}` dealt 5 of 8 below 50. Fix: **partial** + a start-at-50 option.
  - **Y1.B6.S1** "Count from 20 to 50": `number_seq_fill {range:50}` dealt 5 of 8 below 20; `hundreds_chart_fill {band:50}` dealt 2 of 8 below 20. Same fix.

## Systematic defects, counted across the WHOLE files (scripts)

| Rule | R | Y1 | Status |
|---|---|---|---|
| S1: pre from an unrelated area | 0 | 19 flagged; 17 are the same idea (halves of a shape and of a quantity; patterns); 2 are weak (rods as the pre of coins and notes, Y1.B13.S2/S3) | fixed |
| S2: options as notes | 0 (every opts value is valid: 0 invalid ids or values) | 0 | fixed |
| S3: verdicts not generated | 0 (every direct and partial skill is in the items log) | 0 | fixed |
| S4: related padded with "same block / CCSS" | 0 | 0 | fixed |
| S5: own build in preBuild | 0 | 0 | ok |
| **R7: range** (`full` but most items outside the step, or the top value never dealt) | **8**: B5.S1, B5.S3, B5.S7, B7.S7, B9.S9, B11.S1, B11.S3, B13.S4 | **4**: B2.S4 (content), B6.S1, B12.S1, B12.S2 | **FAIL** |
| **R8: response mode** | **4**: B9.S9, B14.S1, B14.S3 (word-work with a + − × ÷ operation bank and a unit-word bank); B12.S1 `shape_name_match_3d` (drag written names) | **1**: B2.S13 `fact_family_sort` ("Write yes or no", typed) | FAIL in R |
| R9: multiples | 0 (`skip_count_line {step:[0]}` and like coins give true multiples) | 0 | fixed |
| R10: pre = related | 0 | 0 | fixed |
| **NEW: opts-less links whose defaults deal far past the step** | 20 entries (`more_less_10 {}` ×12 to 100, `hundreds_chart_fill {}`, `base10_build {}`, `placevalue:compare {}` / `order_* {}` to 999) | 31 entries (the same, plus `add_10_mixed {}` / `sub_10_mixed {}` columns and `unit_form {}` hundreds) | **FAIL**: 51 entries. All 251 related entries and 130 of 601 pre entries carry no opts. |
| **Rule 5: proposal or option already built** | 0 | **4 steps**: B5.S10 (`missing_20`: Max 20 works), B5.S7 and B4.S9 (`nl_20` for add/sub on a 0-20 line: Max 20 works), B5.S1 (`number_line_add` at range 10, not 20) | FAIL |

Rules 14-17 were added to the brief after this round was tagged. They are counted as the lead asked:

| Rule | R | Y1 | Note |
|---|---|---|---|
| **S6 (rule 14): earlier-step skill listed only as related** | 28 flagged | 40 flagged | 68 in all; by hand, **about 26 are main building blocks**. Examples: number bond → combine (R.B9.S9); add on a 0-10 line → number line to 20 (Y1.B4.S8 ×2); count back → 1 less (Y1.B1.S9); compare groups → difference (Y1.B5.S8); measure length with cubes → measure mass (Y1.B8.S2); double → halve (Y1.B10.S4); naming shapes → shape patterns (R.B12.S5-S7). The rest are other forms of the idea, which is a fair reason to keep them as related. |
| **S7 (rule 15): fewer than 3 pre and no "why not" note** | 87 of 102 steps with fewer than 3 pre | 38 of 43 | 125 steps. A few early R steps truly have little before them (R.B1-R.B2). Most do have earlier learning: every 1 more / 1 less, every composition and every position step. |
| Rule 16: `closes` copied from `teaches` | 0 | 0 | Every `closes` names each of its steps with that step's own missing clause. 6 Y1 entries (`consolidate`, `subitise`, `zero`, `shape_3d_tasks`, `shapes_world`, `scenes`) have an empty `closes`, but they are only in `preBuild`, so this is ok. |
| Rule 17: option values that do not change what is dealt as intended | 0 harmful | **5 steps**: Y1.B1.S5 `number_word_form {wordform:['to_number'], range:10}` deals **"Write the numeral: ten" in 20 of 20 seeds**; Y1.B10.S3/S4/S7/S8 `fraction_of_set {denoms:[2]}` leaks ?/3, ?/5 and ?/6 | Harmless no-ops (a value equal to the default; `name_2d_shapes {shapes:[0,1,2,4]}`; `double`/`halve` band = default): 50. These are generator bugs, not tagging bugs, but the items log showed them and the tagger did not flag them. |

## The 17 new proposals

- **Accepted, closes its steps:** `band_6_8`, `more_less_pictures`, `doubles_pictured`, `bonds_3_parts`, `oral_count`, `pictures_change_unknown` (now split correctly), `decompose_shapes`, `add_10_pictures`, `sub_10_pictures`, `teen_bands`, `ones_bonds_teen`, `multiples_from_0`, `halves_quarters_only`, `unitise_coins`.
  - Each has a name, a kind, `teaches`, a step-specific `closes` and a representation (rule 13).
  - `halves_quarters_only` is not built: `denoms` has only the family values 2, 3 and 5.
  - `multiples_from_0` is not built: `skip_count_line` cannot isolate one count, and `seq_10` has no band of 100. Add band 100 to the proposal for Y1.B9.S2 "to 100".
- **`band_3`:** accepted, but it is under-scoped. It must also cover:
  - wholes 1-2 and a zero part (R.B5.S7, R.B7.S7)
  - a 4-5 focus (R.B5.S1, S3) and a 9-10 focus (R.B11.S1, S3), the same R7 defect as 1-2-3
- **`missing_20`:** **reject.** It is already built (Max Number 20).
- **`teen_bands`:** add R.B13.S4 to its steps.

## Owner questions (answered from the evidence)

**R question 1: one shared band option (`band_3`, `band_6_8`) or one per skill?**
Answer: **neither a new shared option nor one new option per skill.** Add the values to each skill's existing `band` option, because options live on the skill (CLAUDE.md):

| Skill | `band` values today | Add |
|---|---|---|
| `count_objects` | 5 / 10 / 20 | 3 |
| `ten_frame_build` | 5 / 10 | 3 |
| `number_bonds` | 5 / 10 | 3, with whole ≥ 1 and an optional zero part |
| `count_sequence` | 10 / 20 / 100 | 5 |

- "Band" means a cap ("within N bounds the answer"). `band_6_8`, and the 4-5 and 9-10 cases, are a different kind: a **focus** window (numbers 6-8 only, with smaller numbers as at most one review item). Give these a separate `focus` option on the same four skills, not a band value.
- One proposal entry may still list all four skills, so the build lane does the work once.

**R question 2: should the oral steps (R.B13.S5 and S6) be closed by `oral_count`?**
Answer: **yes.** `number_seq_fill {range:50 / 100}` deals written tracks (22-46; 45-94), which check writing, not saying. A track the teacher ticks while the pupil points and says is the only checkable form of an oral step. Keep the written track as the partial.

**Y1 question 1: `multiples_from_0` on `seq_2`/`seq_5`/`seq_10`, or a single-count choice on `skip_count_line`?**
Answer: **on `seq_*`, as suggested.**
- The `skip_count_line` `step` option is a shared `_skipBy` group: value 0 means "2s, 5s, 10s" together, and it is index-based. Splitting it would change what saved option values mean.
- `seq_*` are already one count per page. The missing parts are "start at 0" and a band. `seq_10` has only bands 50 and 1000, so add 100 for "Count in 10s" (to 100).

**Y1 question 2: is Y1.B12.S2 "Tens to 100" full at band 90?**
Answer: **no.**
- Rule 7's own example is "14-20 must include 20". Over all seeds, `tens_foundation_visual {band:90}` deals 1-9 tens, and 100 as ten tens never appears.
- The step's point is the decade count reaching 100. Mark it **partial**, missing "100 as ten tens".
- Propose a band value of 100 on `tens_foundation_visual`: a small option.

**Owner ruling check (keep every WRM step).** Every non-`full` step in both files has at least one build (0 uncovered). R.B18.S1/S2 keep `consolidate`.

## To pass round 3

1. **R7:**
   - Mark these 12 steps partial: R.B5.S1, B5.S3, B5.S7, B7.S7, B9.S9, B11.S1, B11.S3, B13.S4; Y1.B2.S4, B6.S1, B12.S1, B12.S2.
   - Widen `band_3` (wholes 1-2, zero) and add a `focus` proposal (4-5, 6-8, 9-10, 50-100, 20-50).
   - Add R.B13.S4 to `teen_bands`.
2. **R8:** Make R.B9.S9, R.B14.S1 and R.B14.S3 partial: word-work with a + − × ÷ bank is not a Reception response. Reuse `add_10_pictures` and `sub_10_pictures` (to 8 or 10). Drop `shape_name_match_3d` from R.B12.S1 or mark it partial. Mark `fact_family_sort` in Y1.B2.S13 partial.
3. **Values that exist:**
   - Y1.B5.S10 is full with `{range:20}`; withdraw `missing_20`.
   - Y1.B5.S7 is full with `nl_sub`/`number_line_sub {range:20}`.
   - Y1.B5.S1 and Y1.B4.S9 should use `{range:20}`.
4. **Give every pre and related link its opts**, so that what it deals fits the step (51 entries deal 2- or 3-digit numbers or columns to PK/K).
5. **Rules 14-15:**
   - Move the ~26 building-block skills from related to pre.
   - Bring every step with earlier learning to ≥ 3 pre, or give a reason (125 steps). Building blocks first: count back before counting back on a line; cubes for length before mass; counting in 5s and 10s before coins and time; half a shape before half past.
6. **Rule 17:** Flag in `missing` (and to the lead, as generator bugs):
   - `number_word_form` at Max 10 deals only "ten"
   - `fraction_of_set {denoms:[2]}` leaks thirds, fifths and sixths in its missing-numerator form
   - `shape_positions {forms:[0]}` answered "Below" in 7 of 8 items (it gives the answer away)
