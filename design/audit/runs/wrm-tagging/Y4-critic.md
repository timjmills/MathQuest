# Critic: Wave 2 tagging of Y4 (Grade 3), round 2

Critic run on 2026-10-10 against `data/curriculum/links/Y4.json` at commit f6015c72 (round 2, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y4`). The tagging data was not edited. I began on 66ab220d (round 1); every
sampled step was re-checked on f6015c72. Only round-2 results are graded here.

## Verdict: FAIL

| Steps graded | Mean | Mean, random 25 | Mean, chosen 10 | Steps under 8 |
|---|---|---|---|---|
| 35 | **7.57** | 7.60 | 7.50 | 13 |

Distribution: 9 ×3 · 8 ×19 · 7 ×9 · 6 ×3 · 5 ×1.

Round 2 is much better than Y2–Y3 r1. Liveness is clean, there are no `note` opts, no step lists its own build in
`preBuild`, no step has an empty pre or related list, money is in US dollars with real option values, and the decimals
÷ 10 / ÷ 100 steps are honestly partial. It fails for two reasons: the mean is under 8, and two defect patterns
repeat across the whole file (R10 and S3 below).

## Method

- **Sample:** `random.Random(20261012).sample(step_ids, 25)` over the 129 step ids in file order. I chose 10 hard steps:
  B2.S3 and B2.S7 (4-digit exchange), B8.S4, S5, S6 and S10 (decimals), B7.S8 (fractions > 1), B11.S3 (time),
  B10.S5 (money) and B3.S1 (area).
- **For each step:** I read the title, CCSS, notes and vocabulary in `wrm-steps.json`, and the Grade 3 xlsx row with its
  week's prior-learning list. I generated 6 items for every direct and partial skill with the tagged opts
  (`generateQuestionFor`, range 10,000, seeds 7000 + 13i). I read each skill's schema (`optionsFor`), then generated
  again with the real option values wherever an option looked relevant.
- **Whole-file scripts:** liveness, option ids against the schema, `normalizeOptions` drift, pre and related overlap,
  build vs preBuild, CCSS-domain cross-check of pre-skills, empty lists, and proposals already built (`skill-options.js`).
- **Tag fixes:** I checked 15 of 76 (`random.Random(20261013)`) against `SKILL_WRM` and the generated items.

Scratch files: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4/`
(`gen.mjs`, `ctx.py`, `stats.py`, `opts.mjs`, `built.mjs`, `emptyopts.mjs`, `tf.mjs`, `items2.txt`, `ctx-Y4.txt`).

## Answer to the caveat: does decimals-on `place_value_10x` deal 7 ÷ 10 = 0.7?

**No.** `{op:'/', power:[10], decimals:true}` deals 990 ÷ 10, 298 ÷ 10 = 29.8, 809 ÷ 10 and 845 ÷ 10. Every dividend
has 3 digits, and two of the six have whole-number answers. `band:1000` and Max Number 10 or 100 change nothing.
`power:[100]` deals 298 ÷ 100 = 2.98. On decimal items the shift chart is dropped: the cell shows H T O only, with no
tenths column. Round 2 marks B8.S5, S6 and S10 partial with the new option `div10_small_numbers`, which is correct.
The proposal should also say that the shift chart gains a tenths and a hundredths column.

## Whole-file defect counts

| Id | Defect | Count (whole file) | Systematic? |
|---|---|---|---|
| S1 | Off-domain or noise pre-skills | The crude CCSS-domain check flags 104 of 528. By hand, about 10 are noise (for example B3.S3 and B3.S4 ← `placevalue:compare` Y1, B8.S10 ← `missing_add_sub`, B4.S7–S10 ← `placevalue:expand`). The rest are real building blocks (facts for perimeter, place value for decimals). | No |
| S2 | Option values missing or not real | 0 `note` opts. Missing: `coordinate_q1` `forms` on B14.S1 and S2; `nearest_10` with no band on B1.S14 (2-digit only); `compare_decimal` and `order_decimals` without `decimals` (B9.S5, S6); `more_less_10 {step:[1,10]}` is not a legal enum value (it falls back to "both", B1.S8). Not wrong: `count_by_tables {constant:[n]}` (5 steps) uses the hidden legacy control, which folds into `rows` and generates correctly. | No (6 steps) |
| S3 | Full claimed but not dealt, or a proposal that is already built | **13 steps.** `mult_div_fact_family {}` is direct on five times-table steps (B4.S3, S5, S8, S9, S10), but it deals any table (5 × 10, 11 × 2) and has no table option. `improper_mixed {}` is full on B7.S7 and B7.S8, but it deals both directions on one page. B8.S4 (see below). B14.S1 and S2 mix reading and plotting. B6.S9 deals only triangles and rectangles. Already built: `dec_compare_2dp` and `dec_order_2dp` (both skills have `decimals` 1/2 and `range`) and `time_convert` (`unit_conversion_word {units:[0]}` converts h → min → s, so B11.S2 is partial, not gap). | **Yes** |
| S4 | Related padded or empty | 0 empty. A few are weak (B13.S3 `line_plot`, which is "a different chart"). | No |
| S5 | Own build in preBuild | 0 (14 in round 1, now fixed and enforced by `build.py`) | No |
| R10 | Same key in pre and related (BRIEF rule 10) | **16 steps.** 7 have identical key and opts: B4.S1 `mult_facts {constant:[3]}`, B4.S4 `multiples`, B7.S8 `add_fractions_like`, B7.S15 `add_mixed_like`, B12.S2 `identify_lines`, B13.S2 `comparison_word`, B13.S4 `build_bar_graph`. 9 differ only in opts: B1.S5, B1.S6, B1.S10, B1.S11, B5.S4, B5.S5, B5.S6, B7.S5, B8.S6. | **Yes** |
| R7 | Range wider than the step | 2: B1.S14 `nearest_10 {}` (2-digit only, but the step is to 1,000); B2.S7 `sub_across_zeros {band:10000}` deals 900 − 205 and 800 − 351 (3-digit). | No |

Liveness: 1,085 keys, 0 dead, 0 retired. Every non-full step has a build, and every beyond-CCSS step (24-hour clock,
Roman numerals, 11 and 12 times-tables, the above-grade steps) is covered or proposed. None is dropped.

## Owner rulings of 2026-10-10, checked against the Y4 proposals

- **24-hour clock:** kept as `time_24h_convert` on B11.S4 and S5. Pass.
- **Roman numerals:** B1.S13 reuses `roman_100` and `roman_12`, two skills. The ruling asks for one `roman_numerals` skill
  with bands to 12 / 100 / 1,000 / 3,999, read and write. **Re-point B1.S13 to that single proposal.**
- **Times-tables to 15:** no Y4 step asks beyond 12, so the step has nothing to change. The B4 block could list
  `tables_to_15` as related for the 11 and 12 steps.
- **`improper_mixed` one direction:** the report asks it as owner question 4, but B7.S7 and B7.S8 stay `full` with no
  proposal. **Make both partial with a new option proposal (`improper_mixed` `dir: to-mixed | to-improper`).**
- **Exchange count on every regroup band:** `exchange_count_add` and `exchange_count_sub` target only the 10k skills.
  **Widen them to every `*_regroup` band (100, 1k, 10k, 100k), as one shared option.**

## Tag fixes (15 of 76 checked)

14 of 15 are right in substance. #58 (`order_decimals` B9.S6 partial, "thousandths") gives a false reason: the
`decimals` option already holds the page to 1 or 2 places. A housekeeping issue for the lead: the `action` words are
used loosely. `add` also means "upgrade to full" or "add opts" (#22, 51, 72, 74, 75 are already tagged full).
`partial` is used for keys that have no tag yet (#44 `mixed_nl_drag` B7.S5, #46 `fraction_number_line` B7.S2, #68
`count_by_powers_of_10` B1.S4), where `add` (partial) is meant.

## Scores

Criteria: (a) direct skills right and complete with real opts, (b) honest verdict, (c) no missed live skill or built
option, (d) proposals close the gap and fit B&W cells, (e) pre-skills are real earlier learning, (f) related share the
idea and do not repeat pre, (g) keys live.

| Step | Verdict | Score | Finding and fix |
|---|---|---|---|
| B1.S1 Represent to 1,000 | full | 8 | Right; band 999 on all three. `teen_compose` (R) is a far pre |
| B1.S3 Number line to 1,000 | partial | 8 | Honest; `place_on_number_line {span:100, band:1000}` marks multiples of 10 |
| B1.S6 Partition to 10,000 | full | **7** | Direct right (4-digit expand/combine/unit form). `placevalue:value` is in both pre and related (R10) |
| B1.S7 Flexible partitioning to 10,000 | partial | 8 | Honest: `unit_form {rename:'more'}` deals "3 thousands 19 hundreds"; `flex_partition` fits |
| B1.S9 Number line to 10,000 | partial | 8 | Honest |
| B1.S10 Estimate on a line to 10,000 | gap | **7** | `place_on_number_line {span:1000, band:10000}` (mark 9,700 between thousands) is a partial cover. `placevalue:compare` is in both pre and related (R10) |
| B2.S5 Subtract 4-digit, no exchange | full | 8 | Right; pre `sub_10_mixed` (take-away within 10) is far |
| B3.S2 Count squares | partial | 9 | Honest. `area_half_squares` is the right option; `partition_shapes` (halves) is a good pre |
| B3.S3 Make shapes | partial | **7** | Honest (every item is the same 2 × 3 rectangle). Drop pre `placevalue:compare` (Y1) |
| B4.S10 12 times-table | full | **7** | `mult_div_fact_family {}` deals 5 × 10 and 11 × 2, not the 12 table. Move it to related, or partial with a `constant` option proposal (S3) |
| B5.S7 Related facts | partial | 8 | Honest; `scaled_fact_family` closes it |
| B6.S9 Perimeter of polygons | full | **7** | `perimeter_intro` deals triangles, rectangles and squares only; no 5- or 6-sided polygons. Partial, or add it to the `regular_polygon`/`polygons` proposal. Pre is thin: add `perimeter {forms:[0]}` (Y3 Calculate perimeter, W21) |
| B7.S2 Count beyond 1 | partial | 8 | Honest; W07 is a Test row and the fallback is right |
| B7.S4 Mixed numbers on a line | full | **7** | `mixed_nl_drag` fits. `fraction_number_line {}` mostly deals 0–1 lines: give it `denoms` or move it to related |
| B7.S10 Equivalent fraction families | full | 8 | Right; the pre facts and multiplication chart are a fair building block |
| B8.S1 Tenths as fractions | partial | 8 | Honest; `tenths_only` fits |
| B8.S3 Tenths on a place-value chart | gap | 8 | Right gap; `decimal_pv` is not built |
| B9.S5 Compare decimals | partial | **6** | The missing clause "cannot be held to 1 or 2 decimal places" is false. `compare_decimal {decimals:2, forms:[0]}` with Max Number 10 deals 6.36 vs 5.99 and 6.1 vs 2.88. Tag those opts and drop `dec_compare_2dp`, which is already built; keep `dec_compare_model` for the same-whole and model items (S3, S2) |
| B10.S1 Write money with decimals | full | 8 | `money_notation {currency:'usd'}` is right. Pre `place_on_number_line` is noise |
| B10.S4 Estimate with money | gap | 8 | Right gap; good pre |
| B11.S5 From the 24-hour clock | gap | 8 | Kept as the owner ruled; `time_24h_convert` is right |
| B12.S1 Angles as turns | gap | 8 | Right; `turns_angles` with preBuild `turns` |
| B13.S3 Interpret line graphs | gap | **7** | Right gap. Related `line_plot` is "a different chart" by the tagger's own words: drop it |
| B14.S2 Plot coordinates | full | **6** | `coordinate_q1 {}` deals half "read the coordinates". Set `forms:[1]` (and `forms:[0]` on B14.S1) (S2) |
| B14.S5 Describe translation | partial | 8 | Honest; `translate_grid` fits |
| B2.S3 Add, one exchange (chosen) | partial | 8 | Honest: the items mix one and several exchanges. Widen `exchange_count_add` to every band (owner ruling) |
| B2.S7 Subtract, more than one exchange (chosen) | partial | **7** | `sub_across_zeros {band:10000}` deals 900 − 205 and 800 − 351, not two 4-digit numbers (R7). Mark it partial with that clause |
| B8.S4 Tenths on a number line (chosen) | full | **6** | With `ticks:'one'`, every tick is labelled except the answer's, so the answer is given away. Lines run 0–1 only, but the note admits WRM goes past 1. Use `ticks:'some'` and mark partial, with an option for 0–2 lines |
| B8.S5 1-digit ÷ 10 (chosen) | partial | 8 | Honest (see the caveat answer). Add the tenths column to `div10_small_numbers` |
| B8.S6 2-digit ÷ 10 (chosen) | partial | **7** | Honest, but `place_value_10x` is in both pre and related (R10) |
| B8.S10 ÷ 100 (chosen) | partial | 8 | Honest. Pre `missing_add_sub` is noise |
| B7.S8 Improper → mixed (chosen) | full | **5** | `improper_mixed {}` deals both directions ("improper AND mixed", "click all equal to 2 3/6"). Mark it partial with a direction-option proposal (owner ruling). `add_fractions_like` is in both pre and related (S3, R10) |
| B11.S3 Analogue ↔ digital (chosen) | full | 9 | `time_analog_digital` to-digital and to-analog, precision 1: right |
| B10.S5 Calculate with money (chosen) | full | 9 | USD, step 5, add and change: right. Two pre `why`s lack the step title |
| B3.S1 What is area (chosen) | partial | 8 | Honest; `area_compare` closes it |

## What a pass needs (round 3)

1. **R10:** remove every key that is in both pre and related (16 steps). Keep it where it serves better, usually pre.
2. **S3:** take `mult_div_fact_family {}` out of direct on B4.S3, S5, S8, S9 and S10 (related, or a `constant` option
   proposal). Make B7.S7 and B7.S8 partial with an `improper_mixed` direction option. Make B8.S4 partial with
   `ticks:'some'`. Make B6.S9 partial. Tag `compare_decimal {decimals:2}` and `order_decimals {decimals:2}` with Max
   Number 10, and retire `dec_compare_2dp` and `dec_order_2dp` as already built. Make B11.S2 partial through
   `unit_conversion_word {units:[0]}`, and drop `time_convert` as already built.
3. **S2/R7:** `coordinate_q1 {forms:[0]}` / `{forms:[1]}` on B14.S1 / S2; `nearest_10 {band:1000}` on B1.S14;
   `more_less_10 {step:0}`; the 3-digit clause on `sub_across_zeros` for B2.S7.
4. **Owner rulings:** one `roman_numerals` proposal (bands 12 / 100 / 1,000 / 3,999); the exchange-count option on every
   regroup band.
5. **Report:** the "Hardest calls" and "Caveats" sections still describe round 1 (B5.S12 full, B8.S5 decimals full, the
   decimal skills "cannot be held"). Rewrite them to match the data.
