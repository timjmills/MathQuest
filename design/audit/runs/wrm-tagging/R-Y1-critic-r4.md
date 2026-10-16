# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 4

Independent critic. The tagging data was not edited. Tree `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `8493316e`.
Read: BRIEF rules 1-19 (rule 13 revised, rule 18 per step / content / layout, rule 19 school-week order), `R-Y1-critic-r3.md`,
the round-4 sections of `R-report.md` / `Y1-report.md`, `R-Y1-items.md`, `data/curriculum/links/R.json`, `Y1.json`, the
generator (`gen.py`, `spec.py`, `maxdealt.mjs`, `items.mjs`, `content_weeks.json`) and the Kindergarten sheet of
`Awsaj-Domain-Sequence-K-5-2026-27.xlsx`.

## Verdict: FAIL

| Year | Steps scored | Mean | 6 | 7 | 8 |
|---|---|---|---|---|---|
| R | 25 (20 random + 5 hard) | **7.56** | 1 | 9 | 15 |
| Y1 | 25 (20 random + 5 hard) | **7.68** | 2 | 4 | 19 |

- **Random draws alone:** R **7.70**, Y1 **7.85** (round 3: 7.30 / 7.35).
- **Round 3's systematic defect is fixed.** No pre or related link now uses `shape_attributes`, a vertex count or a
  written-name drag.
- **Every listed round-3 fix checks out on generated items**, apart from three small items listed below.
- **The `<3 pre` and empty-related notes are now true:** 337 mechanical claims were checked by script, with 0 false.
- **Three new systematic defects remain.** Each one is a link class that the generator's checks do not see:
  1. **R: equation and number-line links for 4-year-olds.**
     - There are 25 related links on 14 steps: `nl_add`, `number_line_add`, `nl_sub` / `number_line_sub`,
       `missing_add_sub`, `add_three`, `add_10_no_regroup` and `number_families_add`.
     - They deal items such as "? + 8 = 10", "___ − 3 = 4" and "4 + 4 + 1 = ?".
     - 11 of them give the why "one more as one jump on a 0-10 number line". That is false: 0 of the generated items is
       a +1 jump. They are sums and missing addends to 10.
     - On the six "1 more / 1 less" steps of R.B3, R.B5 and R.B7, they also deal numbers to 10 on within-3 and within-5
       steps.
  2. **Y1: rule 19.** `content_weeks.json` gets two content types wrong against the Kindergarten sheet, and 18 links
     plus one verdict follow from that:
     - It lumps 2s and 5s in with 10s at W09.
     - It has no week for addition and subtraction sentences.
  3. **Both years: `number_word_form {range:10}` deals only "ten"** (8 of 8 items). The tagger flags this generator bug
     on Y1.B1.S5. Yet the skill is linked 11 times as pre or related.
- **On my own round-3 rule.** The round-3 per-step ceiling I gave ("what its direct *and partial* number skills deal")
  has a loophole. A range partial over-deals by definition, so it lifts its own step's ceiling, and over-size links pass.
  R.B3.S4 is an example: its partial `count_sequence {band:10}` let `nl_add` to 10 through on a within-3 step. This round
  judges R links against the title or block number instead (R.B3 = 3, R.B5 / R.B7 = 5, R.B9 = 8, R.B11 = 10). The tagger
  followed my wording, so the over-size part of defect 1 is partly the critic's fault. The false whys and the content
  misfit are not.

## Method

- **Sample.** I used a new seed, `random.Random(31337).sample(steps, 20)`, in the step order of each file.
  - R random: B1.S1, B2.S1, B3.S1, B4.S1, B4.S3, B5.S1, B5.S4, B7.S5, B7.S7, B8.S1, B9.S9, B11.S3, B11.S10, B12.S1, B12.S2,
    B13.S6, B15.S4, B16.S6, B17.S9, B17.S11.
  - R hard: B15.S2 (pentagons), B11.S12 (doubles band), B14.S4 (change unknown), B9.S10 (subitising), B13.S4 (teens).
  - Y1 random: B1.S1, B1.S8, B1.S11, B1.S14, B2.S5, B2.S7, B2.S9, B2.S12, B4.S2, B4.S4, B4.S6, B5.S6, B6.S6, B8.S2, B8.S6,
    B8.S7, B10.S2, B11.S2, B12.S7, B14.S5.
  - Y1 hard: B12.S2 (W10), B13.S4 (coins, W11), B9.S4 (W19), B1.S6 (word-form pre), B4.S9 (number line, W06).
- **Generation.** I generated 7 items per direct and partial skill+opts of every sampled step through `generateQuestionFor`,
  the function the print path (`buildSheet`) uses. Seeds were 97001 + 31i, my own and not the tagger's. Where a
  distribution mattered I used 24-30 items. Files: `itemsR.txt`, `itemsY.txt`.
- **Whole-file scans.** Every one of the 148 distinct skill+opts signatures in the two files was regenerated with 24 new
  seeds (50021 + 31i). The checks were:
  - **Content flags:** × ÷, right angles / parallel sides, vertices, polygons, columns, units, fractions, coordinates,
    typed words and drags (`scan.mjs`, `linkfit.py`).
  - **Content on direct and partial entries** as well as links (`dpflags.py`).
  - **Title and block ceilings** for R (`rceil.py`).
  - **Rule 19 for Y1 pre links:** a content classifier per signature (`r19.mjs`, `r19.py`) judged against my reading of
    the xlsx first-taught weeks. A separate equation-before-W11 check (`y1eq.py`).
  - **Structure:** caps of 8, pre ∩ related, direct in related, build in preBuild, verdict consistency (`chkstruct.py`).
  - **The facts in every note** (`notefacts.py`).
  - **Opts validity** (`optcheck.mjs`): 1,228 values, 0 invalid.
- **Notes.** I sampled 15 steps with fewer than 3 pre (seed 5113) and 15 with no related (seed 5114), and checked them by
  hand.
- **Scripts:** all in the critic scratch folder `wrm-critic-ry1-r4/`.
- **Scale.** The same 6 / 7 / 8 scale as rounds 1-3. An 8 means right in every respect the brief asks.

## 1. Round-3 fixes, verified on generated items

| Fix | Status | Evidence |
|---|---|---|
| Shape links: `shape_attributes` → `{forms:[0], band:4}` or dropped; `count_sides_vertices_2d` → `shape_corners_count {band:4}`; no written-name drags | **done** | 0 shape-content links left. Shape link signatures now: `name_2d_shapes {forms:[1], shapes:…}`, `name_3d_shapes {forms:[1]}`, `compose_shapes {shapes:[1] / [0,1]}`, `shape_corners_count {band:4}` (24 of 24 items count 3 or 4 corners), `shape_positions`. The only flagged shape signature is `partition_shapes` ("divided"), which the lead has accepted. |
| R.B4.S2 / Y1.B3.S4 partials at `{band:4}` with the leak named | done | R.B4.S2 names "vertices". Y1.B3.S4 `{forms:[1], band:4}` still asks "4 right angles" or "parallel sides" in 12 of 24 items. This is named in `missing` ("5 of 12"), so the partial is honest, but it is still a direct tag that deals right angles to K. Better: `{forms:[0], band:4}`, as R.B4.S2 has. |
| R.B15.S1 → gap | done | `shape_3d_tasks` build; pre are name 2-D / 3-D and compose. |
| Y1.B11.S2 → gap | done | `position_map`; `shape_positions` kept as pre. |
| Y1.B1.S14 / B4.S12 gap (order), Y1.B1.S13 / B4.S11 gap (compare), R.B11.S2 drops `compare {band:99}` | done | Five tagFix `remove` entries, each with the right reason. Y1.B12.S5 no longer has the compare pre; it keeps it only as related (the next step, W34), which is acceptable. |
| `k_story` on Y1.B2.S9 / S10 | done | Both are partial. The `closes` text is step-specific and the proposal names all three defects. The add-more pre now leads with count on. |
| Rule 14 building blocks | done | Checked one by one: R.B11.S7 / S8 (full frame, count), R.B11.S11 / S12 (count, same groups; `add_three` gone), R.B14.S2 (count on first), Y1.B1.S6, B2.S9, B5.S1, B5.S8 (`compare_groups` first), B6.S1, B8.S6 (`measure_nonstandard` first), B12.S1, B12.S2, B3.S2. |
| `number_focus` folding | done | One `focus` id, with windows 4-5 / 6-8 / 9-10 / 10-13 / 14-20 / 11-13 / 14-16 / 17-19 / 20-50 / 50-100. `teen_bands` and `count_start_at` are gone as ids. |
| `band_3` zero part | done | The option text now says "a zero part (n = n + 0) usable at band 5 on number_bonds", and R.B7.S7 cites it. R.B7.S7 also relates `add_5_pictures`. |
| R.B13.S1 / S2 `hundreds_chart_fill {band:20}` | done | |
| Promoted whys with "the next step on this idea" | done | 0 left. |
| R.B1.S6 `match_same` in `preBuild` | **not done** | `preBuild` is `['odd_one_out']`. Its note says R.B1.S1 (`match_same`) has no live skill and points to preBuild, but `match_same` is not there. |
| Y1.B9.S2 says "10s are 2 of 30 items" | done | |
| `tens_foundation_visual` rods × 10 | done | Y1.B6.S3 `base10_build {band:50}` related is accepted (lead). |

## 2. Rule 19: `content_weeks.json` against the Kindergarten sheet

The first-taught weeks below come from the xlsx Kindergarten sheet ("Lesson" column, week of first appearance).

| Content type | Tagger | Sheet | Judgement |
|---|---|---|---|
| coins and notes | 11 | coins W11 ("Count in coins"); notes W35 | coins right; notes are later than the tagger says, but no link depends on it |
| clock time | 36 | W36 | right |
| halves and quarters | 36 | W36 | right |
| number lines | 6 | **W05** ("The number line"); to 20 W06; to 50 W08; to 100 W10 | off by one. It is stricter than needed and blocks nothing wrongly; fix it for accuracy. |
| tens as rods / base-10 | 8 | W08 ("20, 30, 40 and 50"); W21-22 for tens and ones | acceptable |
| **counting in 2s, 5s, 10s** | **9** | **10s W09; 2s and 5s W33** ("Count in 2s", "Count in 5s", enrichment) | **wrong.** The three must be split. |
| equal groups and arrays | 0 | equal groups 0 (R.B16 grouping); **arrays W20** | arrays should be W20. No pre link is affected. |
| measuring with units | 24 | W24 | right |
| numbers 21-50 | 8 | W08 | right |
| numbers 51-100 | 9 | W10 ("Count from 50 to 100"); W09 only as tens | acceptable |
| **addition / subtraction sentences** | **missing** | number sentences W11; add W14; take away W14-16 | **missing**, so sentences are never checked |

### Scan of every Y1 pre link for content taught after the step's week

My classifier ran on 24 items per signature. Results:

- **2s and 5s before W33.** 4 links, all `skip_count_line {step:[0], band:50}`, which deals 2s in 19-22 of 30 items and 5s
  in about 9:
  - **Y1.B12.S2 (W10).** It is ranked **first**, with the why "count in 10s (week 9)".
  - **Y1.B13.S4 (W11).** Its why is "count in 5s and 10s: the main building block". 5s are W33. The step's own direct
    (`money_count` with nickels at W11) is right, because the school teaches it there.
  - **Y1.B9.S4 and Y1.B9.S5 (W19).**
  - `skip_count_line` has no 10s-only value (`step` values are 2s/5s/10s, 3s/4s/6s, 25s). The 10s pre has to be
    `tens_foundation_visual {band:50}` and the hundred square, plus the `multiples_from_0` build in `preBuild`.
- **Addition and subtraction sentences before W11 / W14.** 12 pre links and 2 related.
  - `number_line_add` / `number_line_sub {range:20}` deal "Use the number line: 18 − 9 = ?" and "3 + 9 = ?". They are pre
    on 6 steps, citing Y1.B4.S9:
    - Y1.B4.S10 (W06)
    - Y1.B4.S11, Y1.B4.S12 (W07)
    - Y1.B6.S6 (W08)
    - Y1.B6.S7 (W09)
    - Y1.B12.S4 (W10)
  - `nl_add {range:10}` ("? + 8 = 10") is related on Y1.B6.S8 and Y1.B12.S5 (W09).
  - The tagger already knows this principle. Y1.B4.S8's note says the 0-10 line jumps "come after this step in the
    school order (weeks 14 and 16), so they are not pre-skills here". The same addition content got in through the 0-20
    line of Y1.B4.S9.
- **Y1.B4.S9 "Use a number line to 20" (W06) is `full`.** That is wrong under rule 19: its two directs deal + / −
  sentences with bridging ("18 − 9") eight weeks before the school teaches addition. The step's vocabulary is "more,
  less, forwards, backwards". It should be partial: missing "moving forwards and backwards along a 0-20 line (counting
  on and back, 1 more / 1 less) without a number sentence". The build would be a `count_along` form on `nl_20`, or a
  `jump_only` option on the number-line skills.
- **Nothing else is taught too early.** There are 0 money, clock, fraction, unit, array or < > links before their weeks,
  and 0 pre citing a step the school teaches later. Number sizes all fit the school week (to 20 before W08, to 50
  before W10).
- **One partial is outside the scan.** Y1.B6.S6's partial `place_on_number_line {span:10, band:100}` (W08) deals 84, 95
  and 81. 100 is its lowest band, so this is honest as a partial, but `missing` does not say that it leaks 51-100,
  which is taught at W10.

## 3. Notes on fewer than 3 pre and on empty related

- **Counts.** R has 41 steps with fewer than 3 pre and Y1 has 12. R has 54 steps with no related and Y1 has 50. Every
  one has a note.
- **The mechanical claims are true.** `notefacts.py` parsed every claim of these kinds:
  - "the earlier steps X have no live skill yet"
  - "a pre-skill here"
  - "a direct skill here"
  - "taught at an earlier step (X)"
  - "use this step's own skill"

  That is 337 claims, and **0 are false**. The round-3 template sentence ("every other live form … is already a pre-skill
  or a direct skill") is gone.
- **Sample of steps with fewer than 3 pre (seed 5113).** R.B10.S1, B12.S7, B10.S6, B4.S1, B17.S1, Y1.B1.S1, R.B8.S1, B1.S7,
  B1.S5, Y1.B14.S1, R.B10.S5, B10.S2, B17.S2, B1.S1, Y1.B10.S6.
  - **15 of 15 hold.** They are first steps on an idea (R.B4.S1, R.B1.S1, R.B1.S7), steps whose earlier steps are gaps
    (time, sorting), or steps whose earlier steps use the same skill (patterns, mass).
- **Sample of steps with no related (seed 5114).** R.B12.S2, Y1.B4.S8, Y1.B2.S1, R.B12.S4, Y1.B7.S2, Y1.B8.S1, Y1.B9.S9,
  Y1.B8.S4, R.B1.S3, R.B15.S4, R.B6.S4, Y1.B5.S10, Y1.B8.S3, R.B12.S3, R.B17.S9.
  - **14 of 15 hold.**
  - Y1.B9.S9 "Sharing" (2 pre: `odd_even`, and a W33 `skip_count_line`) leaves out `halve {band:10}` (sharing between
    two, R.B16.S5). R already links it on R.B16.S2 / S4.
- **One kind of reason is weak, though not false.** The reason "does not fit this step (size, content or school week;
  rules 18-19)" appears 51 times. It is a disjunction, not the one fact that applies. Name which of the three it is.
  For related links, "school week" is not a reason: a related link may be the next step.

## 4. Per-step scores (every step under 8 has its fix)

### Reception

| Step | Score | Finding (from generated items) | Fix |
|---|---|---|---|
| R.B1.S1 Match objects | 8 | The gap is honest. 0 pre is right (first step). | none |
| R.B2.S1 Compare size | 8 | The partial is honest: `compare_objects {}` compares lines, towers and bars, not overall size. | none |
| R.B3.S1 Find 1, 2 and 3 | 8 | The partial is right (4s and 5s in band 5). Pre `classify_count {band:3}` and `compare_groups` are now there. Related `count_sequence {band:10, dir:'back'}` deals to 7 on a within-3 step, but it is the lowest band. | none |
| R.B4.S1 Circles and triangles | 8 | Full and right (tap). Related `shape_corners_count {band:4}` and `compose_shapes {shapes:[1]}` fit. | none |
| R.B4.S3 Shapes in the environment | 8 | The gap and `shapes_world` are honest. | none |
| R.B5.S1 Find 4 and 5 | 8 | The partial and `number_focus` are right (1-3 in 4 of 7 items). | none |
| R.B5.S4 1 more | 7 | The partial is honest. **Related `nl_add {range:10}`** dealt "3 + 5", "2 + ? = 8" and "? + 8 = 10" on a within-5 step, under the why "one more as one jump". | Drop `nl_add`. Related: `number_seq_fill` only, or `more_less_pictures` as a build. |
| R.B7.S5 1 more | 7 | As R.B5.S4. | As R.B5.S4. |
| R.B7.S7 Composition | 8 | The partial is right (wholes 3-5 only, no zero part). `band_3` now closes 5 = 5 + 0. | none |
| R.B8.S1 Compare mass | 8 | Full and right. The single pre is explained truly. | none |
| R.B9.S9 Combine 2 groups | 7 | Both partials are honest. **Pre `doubles_near_doubles {forms:[0]}`** deals "9 + 9" and "10 + 10" on a to-8 step (its why even says "totals to 20: a later form"). **Related `number_line_add {range:10}`** is a Y1 equation on a line. | Drop both. |
| R.B11.S3 Represent 9 and 10 | 7 | The partial is right. **Related `number_word_form {range:10}`** dealt "Write the numeral: ten" 8 times in 8, and the response is a written word for PK4. | Drop it (see defect 3). |
| R.B11.S10 Bonds to 10 (3 parts) | 7 | The partial `add_three` is abstract ("2 + 3 + 4 = ?"), and that is named. **All three related links are symbol-only:** `missing_add_sub` ("10 − ___ = 1"), `add_10_no_regroup` and `nl_add`. | Related: none (`bonds_3_parts` is the build), or `make_ten {band:10}`. |
| R.B12.S1 Recognise 3-D shapes | 8 | Right; the round-3 fixes are in. | none |
| R.B12.S2 2-D shapes in 3-D shapes | 8 | The gap is honest and the pre fit. | none |
| R.B13.S6 Verbal counting patterns | 8 | The partial and `oral_count` are right. The 0-100 track fits "beyond 20". | none |
| R.B15.S4 Explain shape arrangements | 8 | The partial is right. `compose_shapes {}` hexagons are pattern blocks, which is Reception material. | none |
| R.B16.S6 Play with and build doubles | 7 | The partial is honest that the skill is abstract, but it does not say that it deals 9 + 9 and 10 + 10. The pre for building doubles are `double {band:20}`, `sub_5_pictures` and `add_5_pictures`. The count and same-groups blocks that R.B11.S11 / S12 got are missing. Related `halve {band:20}` (18), when band 10 exists. | Pre: `count_objects {band:10, objects:'frame'}`, `compare_groups {band:10}`. Related: `halve {band:10}`. Add "doubles to 20" to `missing`. |
| R.B17.S9 Represent maps with models | 8 | The gap is honest and the pre fit. | none |
| R.B17.S11 Create own maps | 8 | As above. | none |
| R.B15.S2 Rotate shapes (hard) | 7 | Partial `name_2d_shapes {forms:[1]}` dealt "Click ALL the hexagons / pentagons" in 11 of 24 items. That is not Reception, and `missing` does not name it. | `{forms:[1], shapes:[0,1,2]}`, as every R link already uses. |
| R.B11.S12 Doubles to 10, make (hard) | 7 | The partial `double {band:20}` is honest (abstract). Pre `doubles_near_doubles` deals to 20. Related `halve {band:20}` deals "Half of 18" when `halve {band:10}` exists. | Related `halve {band:10}`. Drop the near-doubles pre, or name its size. |
| R.B14.S4 How many did I take away (hard) | 6 | The partial and `pictures_change_unknown` are right. **The pre are wrong (rule 14):** `add_5_pictures`, `double {band:20}` and `doubles_near_doubles`. Two of the three are doubles to 20, which are not building blocks of take-away. Counting back (`count_sequence {band:10, dir:'back'}`, R.B11.S6) is missing, and so is the take-away skill. | Pre: `count_sequence {band:10, dir:'back'}`, `count_objects {band:10}`, `add_5_pictures`. Drop both doubles. |
| R.B9.S10 Conceptual subitising (hard) | 7 | The gap and `subitise` are right. The subitising building block `count_objects {band:5, objects:'dice'}` (R.B5.S2) is missing. Related `number_word_form` deals only "ten". | Add the dice pre. Drop `number_word_form`. |
| R.B13.S4 Continue patterns 14-20 (hard) | 8 | The partials and `number_focus` are right (5 of 8 below 14). | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S1 Sort objects | 8 | The partial is honest (counts one kind). There are 2 pre, and the note is true. | none |
| Y1.B1.S8 Count backwards within 10 | 8 | Both directs deal 1-10 backwards. The pre are right, though `number_word_form {range:10}` (only "ten") is a dead link. | Drop that link. |
| Y1.B1.S11 Fewer, more, same | 8 | Right. | none |
| Y1.B1.S14 Order objects and numbers | 8 | Now a gap with `compare_small`; the tagFix `remove` is right. | none |
| Y1.B2.S5 Number bonds within 10 | 8 | Right. All 7 pre are taught by W13. | none |
| Y1.B2.S7 Number bonds to 10 | 8 | Right. | none |
| Y1.B2.S9 Add more | 8 | `number_line_add {range:10}` is direct at W14, which is right. `k_story` closes the story response. Count on comes first. | none |
| Y1.B2.S12 Find a part | 8 | Right. | none |
| Y1.B4.S2 Understand 10 | 8 | The partial is right. `preBuild: ['subitise']` is odd for "10 as one ten" (`teen_structure` is the build). | optional |
| Y1.B4.S4 Understand 14, 15, 16 | 8 | The partials and `number_focus` are right. | none |
| Y1.B4.S6 Understand 20 | 8 | The partial is honest: band 19 never builds 20. | none |
| Y1.B5.S6 Subtract ones using bonds | 8 | The partial is honest (abstract). | none |
| Y1.B6.S6 The number line to 50 (W08) | 6 | **Pre `number_line_add` / `number_line_sub {range:20}` are + / − sentences at W08** (rule 19). The partial's leak of 51-100 (84, 95, 81) is not named. | Drop both pre. Pre: `number_seq_fill {range:50}`, `hundreds_chart_fill {band:50}`. Name the leak in `missing`. |
| Y1.B8.S2 Measure mass | 8 | The gap is honest. `measure_nonstandard` comes first. | none |
| Y1.B8.S6 Measure capacity | 8 | The round-3 fix is in. | none |
| Y1.B8.S7 Compare capacity | 8 | Right. | none |
| Y1.B10.S2 Find a half of a shape | 8 | The partial names the quarters and eighths leak. | none |
| Y1.B11.S2 Left and right | 8 | Now a gap; right. | none |
| Y1.B12.S7 Compare any two numbers (W34) | 7 | Full `compare {band:99}` is right. **The pre lack the 2-digit building blocks:** tens and ones (`unit_form {band:99}` / `base10_build`, Y1.B12.S3 / B6.S4) and Y1.B12.S6's skill. They are `compare_groups {band:5}` and the teen builders. `preBuild: ['subitise', 'compare_small']` does not fit a 2-digit step. | Pre: `unit_form {band:99}`, `base10_build {band:50}`, `more_less_10 {step:1, band:100}`, then `compare_groups`. |
| Y1.B14.S5 Time to the hour | 8 | Right (W36). | none |
| Y1.B12.S2 Tens to 100 (hard, W10) | 7 | The partial and `tens_name_100` are right. **The first pre is `skip_count_line {step:[0]}`,** which deals 2s and 5s in about 28 of 30 items. They are taught at W33. | Pre: `tens_foundation_visual {band:50}` first, the hundred square, and `multiples_from_0` in `preBuild`. |
| Y1.B13.S4 Count in coins (hard, W11) | 7 | The direct is right. The pre "count in 5s and 10s: the main building block" is a W33 skill at W11. | Drop it. Lead with `tens_foundation_visual {band:50}` and `count_objects {band:20}`, and add `multiples_from_0` to `preBuild`. |
| Y1.B9.S4 Recognise equal groups (hard, W19) | 7 | The partial is honest (it writes "multiply / add"). Pre `skip_count_line` (2s / 5s) is W33. | Drop it. Pre: `compare_groups {band:10}` (are the groups the same?). Arrays are W20, so they cannot be pre here. |
| Y1.B1.S6 Count on (hard) | 8 | The round-3 fix is in (count to 20 first). The `number_word_form` dead link remains. | Drop it. |
| Y1.B4.S9 Use a number line to 20 (hard, W06) | 6 | **`full`, but both directs deal + / − sentences ("18 − 9 = ?", "7 + 6 = ?") at W06.** Addition is W14. The step is counting along the line. This full verdict is also the source of the 12 rule-19 pre links. | Partial, missing "moving along a 0-20 line without a number sentence". Build: a jump-only / count-along option on `nl_20`. |

## 5. Systematic defects, counted across the WHOLE files

| Check | R | Y1 | Status |
|---|---|---|---|
| Opts values invalid | 0 | 0 | ok (1,228) |
| Structure: more than 8 pre or related, pre ∩ related, direct in related, build in preBuild, gap with a direct, non-full without a build | 0 | 0 | ok |
| Shape content in pre / related links (round-3 defect) | 0 | 0 (9 `partition_shapes` "divided" flags, accepted) | **fixed** |
| Number size, pre against the cited step and the step; related against the step (round-3 method) | 0 | 1 (Y1.B6.S3 `base10_build {band:50}`, accepted) | ok by that method |
| **D1 (new). R: symbol-equation / number-line related links** | **25 links, 14 steps** (`nl_add` 11, `add_three` 4, `missing_add_sub` 3, `number_line_add` 2, `number_families_add` 2, `nl_sub` + `number_line_sub` 2, `add_10_no_regroup` 1). 11 have the false why "one more as one jump"; 6 also deal past a within-3 / within-5 block. | n/a | **FAIL** |
| **D2 (new). Y1 rule 19: content taught after the step's week** | n/a | **18 links + 1 verdict:** + / − sentences 12 pre + 2 related (W06-W10); 2s / 5s 4 pre (W10-W19); Y1.B4.S9 `full` | **FAIL** |
| **D3 (new). `number_word_form {range:10}` deals only "ten"** | 6 related | 3 related, 2 pre | **FAIL** (a dead link; rule 17) |
| R doubles size: `halve {band:20}` related when band 10 exists; `double` / `doubles_near_doubles` (to 20) as pre on to-8 / to-10 steps | 5 halve links; 8 pre on R.B9.S8, S9, B11.S11, S12, B14.S2, B14.S4 ×2, B16.S6 | 0 | minor: fix halve to band 10; drop the doubles pre where they are not building blocks (R.B14.S2 / S4) |
| R direct / partial with Y1 content, unnamed | 1 (R.B15.S2 pentagons) | 1 (Y1.B6.S6 51-100) | minor |
| A why that misdescribes its link | 11 (`nl_add` "one jump") | 2 (`hundreds_chart_fill {gaps:'column'}` "the tens column": blanks 26, 24, 36 are any cell of a column, not multiples of 10) | fix the text |
| Notes: mechanical claims false | 0 of 337 claims | | ok |
| R.B1.S6 `preBuild` lacks `match_same` (round-3 item) | 1 | | minor |

## To pass round 5

1. **D1: Reception equation and number-line links.**
   - Add to `spec.NOLINK` for R every link whose items are symbol-only equations, number lines, missing-addend or
     missing-minuend sentences, or three-addend sums: `nl_add`, `nl_sub`, `number_line_add`, `number_line_sub`,
     `missing_add_sub`, `add_three`, `add_10_no_regroup`, `number_families_add`, `cloze_addition`.
   - Reception links stay pictured: `add_5_pictures`, `sub_5_pictures`, `number_bonds`, `make_ten`, frames, tracks.
   - Delete the "one more as one jump" why.
2. **D2: rule 19.**
   - Fix `content_weeks.json`:
     - "counting in 10s" W09 and "counting in 2s / 5s" W33 (two types)
     - "addition / subtraction sentences" W11, with add W14 and take-away / subtraction W14 / W16
     - number lines W05
     - arrays W20
   - Classify `skip_count_line {step:[0]}` as 2s / 5s.
   - Classify `number_line_add` / `number_line_sub` / `nl_add` / `nl_sub` as sentences.
   - Make Y1.B4.S9 partial (see its row).
   - Re-run the link check. The 18 links listed in section 2 must go or be replaced.
3. **D3:** never link `number_word_form {range:10}`, and add a degenerate-sample check to `maxdealt.mjs` (fewer than 3
   distinct items in 24 → no link).
4. **Ceilings:** judge R links against the title / block number, not against a range partial's dealt maximum (my round-3
   wording, now corrected). Put `halve {band:10}` on R.B9.S7 / S8, R.B11.S11 / S12 and R.B16.S6.
5. **Single steps:**
   - R.B14.S4 pre (count back first)
   - R.B16.S6 pre (count, same groups)
   - R.B9.S10 (dice pre)
   - R.B15.S2 shapes `[0,1,2]`
   - Y1.B12.S7 pre (tens and ones first)
   - Y1.B6.S6 `missing` names the 51-100 leak
   - Y1.B3.S4 partial `{forms:[0], band:4}`
   - Y1.B9.S9 pre `halve {band:10}`
   - R.B1.S6 `preBuild` gets `match_same`
6. **Note wording:** replace "size, content or school week" with the one reason that applies. For a related link, school
   week is not a reason.
