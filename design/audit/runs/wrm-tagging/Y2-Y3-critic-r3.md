# Critic round 3: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit fcad351b, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL (close; one new systematic defect)

| Year | Steps graded | Mean | Random 20 | Round-2 failures | Hard 5 | Round 2 mean | Steps under 8 |
|---|---|---|---|---|---|---|---|
| Y2 | 40 | **7.55** | 7.55 | 7.73 (15) | 7.00 | 7.53 | 17 |
| Y3 | 43 | **7.60** | 7.80 | 7.56 (18) | 7.00 | 7.45 | 15 |

Distribution:
- **Y2:** 8 ×23 · 7 ×16 · 6 ×1
- **Y3:** 8 ×28 · 7 ×13 · 6 ×2

Round 2's systematic defects are fixed across both whole files:
- **S6:** no related entry is an earlier step's skill, and the building block now leads pre (`make_ten`, `seq_10`,
  `compare`, `expand`, 3-D naming, `tally_chart`, subtraction before change).
- **S7:** no step has fewer than 3 pre entries.
- **Rules 14 to 17:** clean.
- **S8:** 9 of the 11 step fixes are right.

The direct skills and verdicts are now honest on almost every step. No step scores below 6.

It still fails for two reasons:
- **Both means are below 8.**
- **Rule 18 has a new systematic defect, S9.** The pre and related links carry opts now, but about 62 Y2 links and 26
  Y3 links still deal content a pupil of that step cannot do: eighths at Grade 1, comparing unlike fractions at
  Grade 2, coordinate transformations, × and ÷ at Grade 1, and customary-unit conversions. The tagger's own
  `linkscan.mjs` cannot see this, for the reasons explained in the rule 18 section.

## Method

- **Sample.**
  - New seeds: `random.Random(50503)` for Y2 and `random.Random(60607)` for Y3. Each draws 20 steps from the steps
    outside the round-2 failure list.
  - 5 hard steps per year.
  - Every round-2 failing step: 15 in Y2 and 18 in Y3.
- **For each step:**
  - I read the title, CCSS, vocabulary, note and US adaptation in `wrm-steps.json`.
  - I read the lesson row and that week's prior-learning list from the Grade 1 or Grade 2 sheet of
    `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`.
  - I generated 6 items of every direct and partial skill with its recorded opts on the print path
    (`generateQuestionFor` with `itemIndex`). The seeds are new (80021 + 173i); I did not use the items log.
  - I read each skill's option schema.
  - I checked every pre and related entry with its opts.
- **Whole-file scripts** (scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3-r3/`):

  | Script | What it checks |
  |---|---|
  | `sys.py`, `sys3.py` | S2, S4, S5, R10 and rules 15 and 16; pre entries that cite a later step; money links without `usd`; repeated direct keys |
  | `swap.py` | S6 / rule 14 |
  | `s1.py` | S1, off-topic pre by key family |
  | `scan.mjs` | R7, the direct title range, and degenerate items |
  | `optcheck.mjs` | Rule 17: every opts key is a declared option of its skill |
  | `steplink.mjs` | Every link against a per-block number limit, and column layouts before the year's first column step |
  | `relfit.mjs` | The coordinator's step-relative scan, in two modes: `step` (the step's own dealt ceiling) and `week` (the ceiling the pupil has met by that school week) |
  | `fit.mjs` | Rule 18 content fit: fraction denominators, unlike-fraction compares, coordinate and transformation skills, × and ÷, customary conversions |

## Whole-file defect counts (both years)

| Defect | Y2 | Y3 | Status |
|---|---|---|---|
| S1 pre from an unrelated domain (`s1.py` strict key family) | 16 flags / 14 steps | 16 / 16 | All are real building blocks (count in 5s and 10s for money, time and charts; reading a ruler for drawing). **0 real** |
| S2 `opts.note` | 0 | 0 | Pass |
| Money link without `usd` | 2 (`enough_money` on B4.S7 and B4.S10) | 0 | Minor: add `currency:'usd'` if the skill takes it |
| S4 empty related | 0 | 0 | Pass |
| S5 own build in preBuild | 0 | 0 | Pass |
| S6 / rule 14: related is an earlier step's skill in the block | 0 | 0 | **Fixed** |
| S7 / rule 15: pre < 3 | 0 | 0 | **Fixed** |
| Pre cites a LATER step | 1 (Y2.B10.S3 ← `pictograph_intro`, S5) | 0 | Minor |
| R7 direct leaves the step's title range | 0 | 0 | Pass |
| R10 pre = related | 0 | 0 | Pass |
| Rule 16: gap `closes` = `teaches`; a build with no `closes` | 0 | 0 | Pass |
| Rule 17: undeclared opts keys (ignored silently) | 0 | 0 | Pass |
| Full verdict with partial entries; gap with skills; non-full with no build | 0 | 0 | Pass |
| Duplicated clause in `missing` | 1 (Y2.B1.S14) | 0 | Cosmetic |
| **S9 / rule 18: link content a pupil of the step cannot do** | **≈ 62 links / ≈ 33 steps** | **≈ 26 links / ≈ 23 steps** | **NEW, systematic** (see below) |

## Rule 18: links, opts and scale

### Is the tagger's year-wide limit acceptable? No, although its number check is nearly right

`linkscan.mjs` checks the largest number of each link against one year limit (Y2 120, Y3 1,000; units Y2 2,000, Y3
5,000). I ran it and it prints `linkscan: OK`.

The coordinator asked for links to be judged against the STEP's own dealt maximum and its school week, not the year
limit. I measured both:

- **`relfit.mjs step`** (link max > max(1.5 × the step's own ceiling, 20)) flags:
  - Y2: 44 pre and 38 related links on 38 steps.
  - Y3: 49 pre and 38 related links on 42 steps.

  Most of these are numbers the pupil met earlier in the school year, so they are false alarms for pre:
  - In Grade 1 the school teaches place value and counting to 100 in weeks W01–W04, and Y1 (K) already counted to
    100. So `seq_5` to 50 before "Make equal groups" is fine.
  - In Grade 2, numbers to 1,000 come in W01–W03.
  - Several step ceilings are artefacts. Y3.B2.S2 "Add and subtract 1s" is a gap step, so its ceiling is read from
    "1"; the Y3.B4.S9 "remainders" probe reads 6.
- **`relfit.mjs week`** (the ceiling is the largest number the pupil has met by that week: the step plus every step
  taught in an earlier school week, from the xlsx order) flags:
  - **Y2: 11 links on 6 steps.**
    - Y2.B1.S1 "Numbers to 20" pre `unit_form` / `seq_10` / `number_seq_fill` / `hundreds_chart_fill` to 100. This is
      K (Y1.B12) learning, so it is acceptable.
    - **`balance_addsub {}`**: "91 + 92 = __ + 160", sums to 183 at Grade 1, on B2.S20 and B2.S21.
    - **`geo_rotate`** "270° clockwise around the origin", on B11.S3, S4 and S5.
  - **Y3: 3 links on 2 steps.** Related `place_value_disks` / `base10_build_hundreds` to 956 on "Represent numbers to
    100" (Y3.B1.S1, S2). These next-step relateds are tolerable.

So on number size alone the year limit happens to work for Grade 1 and 2, because place value is taught first.

It is still **not acceptable as the rule-18 check**, for three reasons:
1. **It skips the worst links.** Clock, angle, shape and all `coordinates:` skills are skipped as "fixed domain".
   But `geo_translate`, `geo_rotate`, `geo_reflect`, `coordinate_q1` and `coord_polygon` are Grade 5–8 coordinate
   work, linked from Y2.B3.S6, Y2.B11.S1–S5, Y3.B11.S5, S8 and Y3.B12.S6.
2. **It checks magnitude, not content.**
   - Eighths are tiny numbers: `identify {denoms:[2]}` deals 6/8 and 2/8, with fifths as distractors.
   - Comparing 3/5 with 2/3 is "small".
   - So is "18 feet to yards".
3. **Layouts are not checked.**
   - At Grade 1, `add_10_regroup` and similar 1-digit facts are stacked by default ("9 above + 9"). That is an
     ordinary vertical-facts layout and I accept it. I would still prefer `notation:['across']` on the B2.S1–S12 pre
     links, because WRM Y2 writes these as sentences and part-whole models.
   - **5 pre links put 2-digit column-with-regrouping work before the column steps:**
     - Y2.B2.S10 and S12: `add_50_regroup`.
     - Y2.B2.S13: `sub_50_regroup`.
     - Y2.B2.S14: both.

     They deal 28 + 19 and 44 − 26, which is S16 and S18 content. They are inherited from the partial skills of S9
     and S12, which deal 2-digit + 2-digit as well as the step's 1-digit items.

### S9: rule-18 content defects (`fit.mjs` plus the hand checks above)

**Y2 (about 62 links):**
- **Fractions, 42 links on 17 steps** (B7.S5, B8.S1–S15, B11.S3):
  - `shade_fraction {denoms:[2]}` deals 6/8.
  - `identify {denoms:[2]}` / `{denoms:[2,3]}` deals 6/8 and 2/8, with 2/5 and 9ths shown as choices.
  - `write_fraction {denoms:[2,3]}` deals 1/6 and 7/8.
  - `equiv_frac_visual {denoms:[2]}` deals 2/3 = 2/9 and 12/16.
  - `select_equiv_frac`, `compose_whole {}` (sixths, eighths) and `fraction_number_line {}` (fifths, sixths).

  Grade 1 (1.G.A.3) and WRM Y2 cover halves, quarters and thirds only. The tagger's own Y2 report says `denoms`
  picks a FAMILY, so the year default `denoms:[2]` in `linkOpts` cannot work.
- **Coordinates:** 7 links (above).
- **Other links:**
  - `which_sign {}` deals × and ÷ (9 ? 8 = 72), on Y2.B2.S20.
  - `balance_addsub {}`: 2 links.
  - Related `pictograph {range:20}` on B10.S1, S3–S6 still totals 150 (`range` does not bound the totals): 5 links.
  - Column pre: 5 links.

**Y3 (about 26 links):**
- **`fractions:compare`, 8 links.** `forms:[0]` and `forms:[1]` deal unlike numerators AND denominators on 6 of 8
  items (3/5 vs 2/3, 3/4 vs 5/6). That is 4.NF.A.2, but the links are pre for Y3.B6.S3–S10 and related for S1.
- **`order_fractions {}`, 4 links** (7/10, 3/5, 1/2, 1/3, 3/10): Y3.B1.S13, B6.S1, S3, S6.
- **`missing_mult_div {range:100}`, 6 links.** It deals "__ × 12 = 144"; `range` is ignored, and the 12 times-table
  is not taught in Y3. On B3.S7, S10, S13 and B4.S4, S5, S7.
- **`unit_conversions {}`, 5 links.** It deals feet to yards, ounces to pounds and km. Related on B7.S4, B7.S9,
  B9.S2, B10.S10 and B10.S11; the last two are time steps, where it does not even share the idea.
- **Coordinates:** 3 links.

### Spot-check: 15 links generated with their recorded opts

| # | Link (step) | Items | Pupil of this step can do it? |
|---|---|---|---|
| 1 | `subtraction:sub_50_regroup {band:50}` (Y2.B2.S14 pre) | 21 − 7, 34 − 16, 22 − 15 | Partly: the 2-digit − 2-digit items are S18 work |
| 2 | `addition:add_50_regroup {}` (Y2.B2.S10 pre) | 16 + 18, 34 + 16 stacked | No: S16 column work |
| 3 | `algebra:tape_diagram {band:50}` (Y2.B4.S9 rel) | 34 − 16, 20 + 19 stories | Yes |
| 4 | `algebra:multi_step_word {band:50}` (Y2.B4.S10 rel) | 50 − 11 − 11 | Yes |
| 5 | `measurement:money {currency:'usd'}` (Y2.B4.S9 pre) | $6 + $2, $12 + $4 | Yes |
| 6 | `number_sense:place_on_number_line {}` (Y2.B7.S7 pre) | 52 on 50–60 | Yes |
| 7 | `fractions:identify {denoms:[2]}` (Y2.B8.S3 rel) | 6/8, 2/8; 2/5 as a choice | **No** (eighths and fifths) |
| 8 | `composing:compose_whole {}` (Y2.B8.S15 rel) | sixths and eighths to 1 whole | **No** |
| 9 | `coordinates:geo_rotate {}` (Y2.B11.S4 rel) | 90° and 270° about the origin | **No** (Grade 8) |
| 10 | `number_ops_mixed:which_sign {}` (Y2.B2.S20 rel) | 18 ? 6 = 3, 9 ? 8 = 72 | **No** (× ÷) |
| 11 | `fractions:compare {forms:[1]}` (Y3.B6.S7 pre) | 3/4 vs 5/6, 1/3 vs 4/8 | **No** (4.NF.A.2) |
| 12 | `fractions:order_fractions {}` (Y3.B6.S6 pre) | 7/10, 3/5, 1/2, 1/3, 3/10 | **No** |
| 13 | `measurement:unit_conversions {}` (Y3.B10.S11 rel) | 18 ft to yd, 16 oz to lb | **No**, and off-topic |
| 14 | `coordinates:coordinate_q1 {}` (Y3.B11.S5 rel) | plot (9, 9), (10, 6) | **No** (Grade 5) |
| 15 | `multiplication:dot_array_mult {band:25}` (Y3.B3.S2 pre) | 4 × 2, 4 × 4 arrays | Yes |

Result: 6 of 15 can be done and 9 cannot. That is the systematic S9.

### Fix for S9 (in `overrides.mjs` / `build.mjs`)

1. **Y2 fraction links.** Use `shapes_early:partition_shapes {parts:[0]|[1]|[2]}` (halves, thirds, quarters only)
   and `patterns:halve {band:20}`. Drop `identify`, `write_fraction`, `shade_fraction`, `equiv_frac_visual`,
   `select_equiv_frac`, `compose_whole` and `fraction_number_line` from Y2 links, and put `single_fraction` in
   `preBuild` where the link was the only rung.

   Rule 12 (keep an earlier partial as pre) yields to rule 18 when the partial's excess is above the pupil.
2. **Y3.** Drop `fractions:compare` (all forms) and `order_fractions` from B1 and B6 links, and put `compare_kind`
   in `preBuild`. Replace `missing_mult_div` with `mult_div_fact_family` or `div_facts {constant:[...]}`. Drop
   `unit_conversions` from every Y3 link.
3. **Both years.** Drop every `coordinates:` link. For Y2.B11 use `shape_positions` and `partition_shapes` (quarter
   turns); for Y3.B11 use `identify_lines`.
4. **Y2.B2.S20.** Drop `which_sign` and `balance_addsub` (and B2.S21's `balance_addsub`), or set a band if one exists.
5. **Y2 related `pictograph`.** Use `pictograph_intro`, or drop the link.
6. **Y2.B2.S10–S14 pre.** Replace `add_50_regroup` / `sub_50_regroup` with the 1-digit-across-10 skills
   (`add_10_regroup`, `sub_10_regroup`, `number_line_add` / `nl_sub`), or with `one_digit_addend` in `preBuild`.
7. **Extend `linkscan.mjs`.**
   - Stop skipping `coordinates:`.
   - Add the step-relative / week mode (`relfit.mjs week`).
   - Add a content check: Y2 denominators in {2, 3, 4}; Y3 compares must share a numerator or a denominator; no ×
     or ÷ in Y2 number links; no customary units.
   - Flag stacked 2-digit items in Y2 links before B2.S15.

## Step-level findings (not systematic, but each costs points)

| Step | Problem | Fix |
|---|---|---|
| Y2.B7.S1 Compare mass | Full with `heavier_lighter_visual`: picture judgments ("which is heavier, car or apple"). No balance scales and no "equal / same mass", although these are in the vocabulary. Y3.B7.S5 marks the same skill **partial** | Partial; build `compare_measures` (balance-scale form) |
| Y2.B2.S20 Compare number sentences | `addition:equal_sign {}` deals plain sums (12 + 12 = ?, 16 + 20 = ?) on 12 of 12 items. It compares nothing, so the missing clause "the skill judges true/false" is wrong | Gap; keep `compare_sentences` |
| Y2.B3.S5 Lines of symmetry | Full, but `symmetry` and `place_symmetry_lines` deal diagonal lines and "this square has 4": Y4 (4.G.A.3). WRM Y2 asks for vertical lines only | Partial plus an option "vertical line only" |
| Y2.B3.S12 Patterns with 2-D and 3-D shapes | `shape_pattern` uses 2-D shapes and stars only; no 3-D shapes | Partial; option: 3-D shape pictures |
| Y2.B10.S7 Interpret pictograms (2, 5 and 10) | `pictograph {}` gives totals of 180 and values of 80 at Grade 1 | Set `range` (and check that it bounds totals), or partial |
| Y2.B2.S11 Subtract from a 10 | Pre lacks bonds to 10 (`make_ten` / `number_bonds`), the building block for 40 − 3 (10 − 3 = 7). It is crowded out by missing-number and fact-family skills | Make `make_ten` tier 1 (`core`) |
| Y2.B9.S5 Time to 5 minutes | Pre has 3 clock skills and no counting in 5s, although the xlsx lists it (rule 15 names it) | Add `count_by_tables` 5s |
| Y2.B10.S6 Draw pictograms (2, 5, 10) | No counting in 2s, 5s and 10s in pre, although the key needs it | Add `count_by_tables` 2/5/10 |
| Y3.B2.S20 Estimate answers | Full, but both skills round 2-digit numbers only (56 + 24). The Y3 step estimates 3-digit sums. Pre has no rounding or number-line rung (`place_on_number_line {span:100, band:1000}` from Y3.B1.S11) | Partial (3-digit not dealt) with an option; put the number-line estimate first in pre |
| Y3.B6.S6 Fractions and scales | Pre is `compare {forms:[1]}`, `order_fractions` (both above the step) and `shape_corners_count` (unrelated). It has no scale or number-line rung | Pre: `place_on_number_line`, `reading_ruler`, `partition_shapes`, plus `frac_count` in `preBuild` |
| Y3.B3.S2 Use arrays | Direct `dot_array_mult {band:100}` deals 7 × 8 and 8 × 6 arrays. 2.OA.C.4 caps arrays at 5 × 5, and `band:25` exists (used on the Y3 links) | `band:25` |
| Y3.B2.S16 Subtract across a 100 | Direct `sub_across_zeros {band:500}` (302 − 264, 200 − 66) is the zero-tens double exchange, not the step's one exchange from the hundreds | Move it to related; the verdict stays partial (`exchange_count`) |
| Y3.B7.S3 Measure kg and g | Partial `mass_volume_liquid {forms:[1]}` still gives 3 of 6 "kg" items with an answer key of **0**. This is a generator bug, flagged in round 2 and not mentioned. The pre `count_by_tables` says "counting in 100s" but its opts are 2/5/10 | Owner bug; set the rows to 100s |
| Y3.B7.S7 Measure in ml | Pre `capacity {units:[1], forms:[0]}` deals 3 L = 3000 mL, which is S9 content | Use `place_on_number_line` and count in 10s/100s; `nonstandard_capacity` as `preBuild` |
| Y3.B11.S3 / S2 / S7 | Related `reading_ruler` beside angles (round 2: noise) | Drop it |
| Y3.B9.S2 / B7.S4 / B7.S9 / B10.S10–S11 | Related `unit_conversions` (S9) | Drop it |

S8 from round 2 is checked on every step:
- **Y2.B4.S9:** the opts now deal $1–$10 change from $5, $10 and $20.
- **Y3.B9.S5:** `paid:'note'` gives $0.25–$3.65 from $1 and $5.
- **Y2.B6.S3 / S4:** now use `compare_measures`.
- **Y2.B2.S11:** gap, with `sub_from_ten`.
- **Y3.B2.S2:** gap, with `more_less_1_3digit`.
- **Y3.B11.S3:** partial, with `identify_angles`.
- **Y2.B10.S3:** partial, with `bar_graph_intro`.
- **Y3.B9.S2:** partial, with `money_notation`.
- **Y3.B8.S2:** partial.
- **Y2.B1.S14:** partial.
- **Y3.B4.S10:** pre is cleaned.

All are right.

## Scores
Criteria: (a) direct skills right and complete, (b) honest verdict, (c) no missed live skill, (d) proposals close the gap
and fit B&W cells, (e) pre-skills are real earlier learning a pupil of this step can do, (f) related skills share the idea
and fit the pupil (rule 18), (g) keys and opts live.

### Y2 (Grade 1): mean 7.55

| Step | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20 (seed 50503)** | | | |
| Y2.B7.S1 Compare mass | full | 7 | Picture judgments only; no balance or "equal" (partial; Y3.B7.S5 says partial) |
| Y2.B8.S9 Find the whole | gap | 7 | Gap and pre right; related `identify` / `write_fraction` deal 5ths, 6ths, 8ths, 9ths (S9) |
| Y2.B7.S9 Temperature | full | 8 | °C thermometer, 5s scale; pre has the scale, counting and comparing |
| Y2.B8.S12 Half = two quarters | partial | 7 | Honest partial. 3 pre links deal sixths and eighths (S9) |
| Y2.B2.S21 Missing number problems | full | 8 | Within 20 (1.OA.D.8); pre is 8 entries. Related `balance_addsub` is S9 |
| Y2.B5.S8 Equal groups: sharing | partial | 8 | Honest |
| Y2.B4.S6 Compare money | full | 8 | Right (no US option on `money_compare`, noted) |
| Y2.B10.S7 Pictograms (2, 5, 10) | full | 7 | Totals 180, values 80 at Grade 1; `range` not set |
| Y2.B1.S2 Count objects by making 10s | partial | 8 | Honest; pre is a good K ladder |
| Y2.B9.S4 Time to the hour | partial | 8 | Honest; `time_past_to` fits |
| Y2.B11.S4 Movement and turns | gap | 7 | Gap right; related `geo_translate` / `geo_rotate` are Grade 8 (S9) |
| Y2.B2.S14 Add and subtract 10s | partial | 7 | Honest. Pre `sub_50_regroup` / `add_50_regroup` deal 2-digit column regrouping (S9) |
| Y2.B3.S5 Lines of symmetry | full | 7 | Diagonal lines and "4 lines": partial |
| Y2.B8.S3 Recognise a half | full | 7 | Direct right; its only related, `identify {denoms:[2]}`, deals eighths and fifths (S9) |
| Y2.B5.S9 The 2 times-table | full | 8 | Right; good pre |
| Y2.B4.S10 Two-step problems | gap | 8 | Right |
| Y2.B3.S12 Patterns with shapes | full | 7 | No 3-D shapes: partial |
| Y2.B2.S15 Add 2-digit (no exchange) | full | 8 | Right |
| Y2.B9.S2 Quarter past and to | full | 8 | Right |
| Y2.B2.S2 Fact families within 20 | full | 8 | Right (the xlsx row is a Test, so pre falls back correctly) |
| **Round-2 failures** | | | |
| Y2.B7.S7 Measure in litres | partial | 8 | Fixed (3 pre rungs) |
| Y2.B2.S6 Add by making 10 | full | 8 | Fixed (`make_ten` and `number_bonds` lead pre) |
| Y2.B2.S11 Subtract from a 10 | gap | 7 | Fixed gap and clause; pre lacks bonds to 10 |
| Y2.B1.S14 Order objects and numbers | partial | 8 | Fixed (missing clause duplicated) |
| Y2.B5.S13 The 10 times-table | full | 8 | Fixed (`seq_10` first) |
| Y2.B10.S3 Block diagrams | partial | 8 | Fixed (`bar_graph_intro`, `tally_chart` first). Pre `pictograph_intro` cites the later S5 |
| Y2.B3.S6 Complete with symmetry | gap | 7 | Related `geo_reflect` (Grade 5+) (S9) |
| Y2.B8.S6 Find a quarter | partial | 7 | Clause fixed; related deal eighths and fifths (S9) |
| Y2.B4.S9 Find change | full | 8 | Fixed opts and pre |
| Y2.B3.S8 Count faces | full | 8 | Fixed (3-D naming in pre) |
| Y2.B3.S9 Count edges | full | 8 | Fixed |
| Y2.B4.S2 Count money: notes | full | 8 | Fixed (count in 5s and 10s first) |
| Y2.B4.S3 Notes and coins | full | 8 | Fixed |
| Y2.B8.S8 Find a third | partial | 7 | Clause fixed; related `identify` / `write_fraction` deal 5ths to 9ths (S9) |
| Y2.B4.S4 Choose notes and coins | partial | 8 | Fixed |
| **Hard 5** | | | |
| Y2.B2.S13 10 more, 10 less | full | 8 | Right; base-10 and the tens digit in pre |
| Y2.B8.S15 Count in fractions | gap | 7 | Gap right; related `compose_whole` / `fraction_number_line` deal 5ths to 8ths, and pre deals 8ths (S9) |
| Y2.B9.S5 Time to 5 minutes | full | 7 | No counting in 5s in pre |
| Y2.B10.S6 Draw pictograms (2, 5, 10) | partial | 7 | No counting in 2s, 5s and 10s in pre |
| Y2.B2.S20 Compare number sentences | partial | 6 | `equal_sign` deals plain sums: wrong partial and wrong clause; related `which_sign` ×÷ (S9) |

### Y3 (Grade 2): mean 7.60

| Step | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20 (seed 60607)** | | | |
| Y3.B4.S2 Related calculations | full | 8 | Right (30 × 6, 7 × 100) |
| Y3.B11.S7 Describe 2-D shapes | full | 8 | Right |
| Y3.B3.S11 The 4 times-table | full | 8 | Right |
| Y3.B9.S3 Add money | full | 8 | Right |
| Y3.B10.S12 Problems with time | full | 8 | Acceptable |
| Y3.B3.S9 Multiply by 4 | full | 8 | Right |
| Y3.B6.S7 Fractions on a number line | full | 7 | Direct right; pre `compare {forms:[1]}` is 4.NF.A.2 (S9) |
| Y3.B4.S11 How many ways | gap | 8 | Right |
| Y3.B1.S10 Number line to 1,000 | partial | 8 | Right |
| Y3.B10.S4 Digital clock | full | 8 | Right |
| Y3.B3.S2 Use arrays | full | 7 | `dot_array_mult {band:100}` deals 7 × 8 arrays; `band:25` fits 2.OA.C.4 |
| Y3.B2.S21 Inverse operations | full | 8 | Right |
| Y3.B2.S5 Spot the pattern | gap | 8 | Right |
| Y3.B5.S8 Add lengths | gap | 8 | Right |
| Y3.B2.S16 Subtract across a 100 | partial | 7 | Direct `sub_across_zeros` is the zero double exchange, not this step |
| Y3.B1.S4 Hundreds | partial | 8 | Honest |
| Y3.B5.S5 m and cm | partial | 8 | Honest |
| Y3.B2.S11 Add (no exchange) | full | 8 | Right |
| Y3.B11.S2 Right angles | partial | 7 | Honest; related `reading_ruler` is noise |
| Y3.B11.S10 Make 3-D shapes | gap | 8 | Right |
| **Round-2 failures** | | | |
| Y3.B9.S4 Subtract money | partial | 8 | Fixed (subtraction in pre) |
| Y3.B4.S5 2-digit × 1-digit (exchange) | partial | 8 | Fixed (`expand`, `mult_zeros` first) |
| Y3.B2.S2 Add and subtract 1s | gap | 8 | Fixed |
| Y3.B12.S5 Collect and represent data | gap | 8 | Fixed (`tally_chart`) |
| Y3.B7.S3 Measure kg and g | partial | 7 | "0 kg" keys still unflagged; the count-in-100s pre has 2/5/10 opts |
| Y3.B9.S2 Convert dollars and cents | partial | 7 | Fixed partial; related `unit_conversions` (S9) |
| Y3.B9.S5 Find change | full | 8 | Fixed (`paid:'note'`) |
| Y3.B7.S7 Measure in ml | full | 7 | Pre `capacity` deals L ↔ mL (S9 content, a later step) |
| Y3.B8.S2 Subtract fractions | partial | 8 | Fixed |
| Y3.B1.S13 Order to 1,000 | full | 7 | Fixed pre; only related is `order_fractions` (unlike fractions, S9) |
| Y3.B2.S19 Complements to 100 | gap | 8 | Fixed related |
| Y3.B7.S5 Compare mass | partial | 8 | Fixed (`compare` in pre) |
| Y3.B7.S8 l and ml | partial | 8 | Fixed (3 pre) |
| Y3.B11.S3 Compare angles | partial | 7 | Fixed partial; related `reading_ruler` is still there |
| Y3.B11.S5 Horizontal and vertical | gap | 7 | Pre better; related `coordinate_q1` (Grade 5, S9) |
| Y3.B11.S8 Draw polygons | gap | 7 | Pre good; related `coord_polygon` (Grade 6, S9) |
| Y3.B4.S10 Scaling | full | 8 | Fixed pre |
| Y3.B7.S9 l and ml equivalence | partial | 7 | Pre fixed; related `unit_conversions` (customary, S9) |
| **Hard 5** | | | |
| Y3.B2.S20 Estimate answers | full | 6 | 2-digit only (partial); no rounding or number-line pre |
| Y3.B6.S6 Fractions and scales | gap | 6 | Pre is unlike compare / order (S9) and corners count; no scale rung |
| Y3.B7.S4 Equivalent masses | gap | 7 | Gap and pre right; related customary conversions (S9) and a K picture skill as "next step" |
| Y3.B10.S8 Start and end times | full | 8 | Right |
| Y3.B2.S18 Subtract 2-digit from 3-digit | partial | 8 | Honest |

## What a pass needs
1. **S9 (rule 18 content), whole files.** Apply the 7 fixes above. Then:
   - re-run `fit.mjs` and `relfit.mjs week` in the scratch folder; target 0 and 0 (the K-learning flags on
     Y2.B1.S1 may stay, with a note);
   - extend `linkscan.mjs` so it checks content and coordinates, not only the year's largest number.
2. **Step fixes:**
   - Y2.B7.S1, Y2.B3.S5, Y2.B3.S12 and Y3.B2.S20 become partial, each with an option or proposal.
   - Y2.B2.S20 becomes a gap.
   - Y3.B3.S2 gets `band:25`.
   - Y3.B2.S16 moves `sub_across_zeros` to related.
   - Pre rungs: bonds to 10 (Y2.B2.S11), count in 5s (Y2.B9.S5), count in 2s, 5s and 10s (Y2.B10.S6), a number line
     or scale (Y3.B2.S20, Y3.B6.S6, Y3.B7.S7).
   - Drop related `reading_ruler` beside angles.
   - Make the Y3.B7.S3 `count_by_tables` rows 100s.
3. **Owner bug list:** add `mass_volume_liquid {forms:[1]}` "kg" items with answer 0, and `range` ignored by
   `missing_mult_div` (deals × 12 = 144) and by `pictograph` totals.

About 17 of the 32 steps under 8 lose points only to an S9 link. The other 15 need the step fixes in item 2. With both
done, every graded step reaches 8, and both means reach 8.0 on these samples.
