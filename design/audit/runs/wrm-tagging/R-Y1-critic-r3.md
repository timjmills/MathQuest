# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 3

Independent critic. The tagging data was not edited. Tree `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `a3fe6ba3`.
Read: BRIEF rules 1-18 (rule 13 revised, rule 18 per step + content/layout + school week), `R-Y1-critic-r2.md`, the round-3
`R-report.md` / `Y1-report.md`, `R-Y1-items.md`, `data/curriculum/links/R.json`, `Y1.json`, the generator
(`tests/scripts/wrm-tagging/gen.py`, `spec.py`, `items.mjs`, `maxdealt.mjs`) and the tagger's scratch checks.

## Verdict: FAIL

| Year | Steps scored | Mean | 6 | 7 | 8 |
|---|---|---|---|---|---|
| R | 25 (20 random + 5 hard) | **7.36** | 3 | 10 | 12 |
| Y1 | 25 (20 random + 5 hard) | **7.36** | 2 | 12 | 11 |

- The random draws alone score **R 7.30** and **Y1 7.35** (round 2: 7.40 / 7.15).
- Round 3 fixed what round 2 asked for. Every one of round 2's twelve R7 range steps is now partial with a build. Every pre
  and related link carries opts. The 51 opts-less links that dealt 2- and 3-digit numbers are gone. The values that
  already existed are used (Max Number 20). The word-work cells are out of R. Most round-2 failing steps now score 8
  (list below).
- It still fails on one **systematic defect** and on many single 7s:
  1. **Rule 18 content was never applied to shape skills.** `spec.FIT` says "a key not listed deals no numbers past 20
     at its defaults (shapes, clocks, measures) and keeps `{}`". So shape links were exempt from every check, both size
     and content. As a result:
     - 17 pre / related links use `shape_attributes {}`, and 3 partials use it too. Its items are "4 right angles",
       "at least one pair of parallel sides" and "vertices of an octagon".
     - 15 Reception related links drag written shape names.
     - 5 Reception related links count the vertices of octagons and pentagons.
     - Option values that would fit already exist: `{forms:[0], band:4}`.
     - One partial is simply false. `R.B15.S1 shape_attributes {forms:[1]}` claims "it rolls, it stacks, it fits", but 0 of
       its 40 generated items do that.
  2. Many 7s come from pre lists that miss the main building block or rank it last (rule 14), and from notes that the
     generator writes without checking them.
- The `< 3 pre` and empty-related notes are **mostly honest** (sampled 15 of each: 13 / 15 hold up in both). The
  tagger is not avoiding work. But the notes come from a template, and the failures are real (see below).

## Method

- **Sample.** I used a new seed, `random.Random(90210).sample(steps, 20)`, in the step order of each links file.
  - R random: B1.S1, B1.S6, B2.S6, B3.S3, B4.S1, B5.S2, B6.S4, B7.S1, B9.S8, B11.S2, B11.S7, B11.S12, B12.S1, B13.S1,
    B15.S2, B15.S4, B16.S1, B16.S4, B18.S1, B18.S2.
  - R hard: B9.S3 (`number_focus`), B11.S8, B14.S2 (change unknown), B13.S6 (oral), B16.S5.
  - Y1 random: B1.S1, B1.S6, B1.S13, B2.S1, B2.S5, B2.S10, B2.S11, B3.S2, B3.S3, B5.S5, B6.S5, B7.S2, B8.S4, B8.S6,
    B9.S6, B10.S8, B11.S2, B12.S1, B12.S2, B12.S5.
  - Y1 hard: B2.S9 (`add_wp_10`, owner Q2), B2.S4 (`family_add_only`), B6.S1 (`count_start_at`), B9.S2 (10s to 100),
    B13.S3 (notes).
  - Every step that scored under 8 in round 2 was re-checked (26 R + Y1 steps).
- **Generation.** I used my own generator (`generateQuestionFor`, seeds 61001 + 31i and 70001 + 31i, 7-8 items) for every
  direct and partial skill+opts of every sampled step, and 30-40 seeds where a distribution mattered. The items log was
  checked, not trusted:
  - It covers all 222 direct and partial entries (0 missing).
  - All 1,160 opts values in the two files are valid ids and values in `skill-options.js` (0 invalid).
- **Whole-file link scan (my own, not `maxdealt.json`).** Every one of the 145 distinct skill+opts signatures in the two
  files was generated with 24 new seeds (50021 + 31i). For each one I recorded:
  - the largest number dealt (text, answer and cell payload)
  - content flags: × ÷, parallel / right angle, vertices, octagon / pentagon / quadrilateral, column / regroup, metric
    or customary units, fractions other than halves, coordinates, typed words, drag
- **Per-step ceilings (the lead's point 1).** Ceilings are the step's own, not the block's.
  - A step's own ceiling is the largest of:
    - the numbers in its title
    - what its direct and partial number skills deal
    - for a non-number step, the school-week level, which is the largest number met so far in school order (xlsx
      Kindergarten weeks for Y1), capped at 20
  - A pre link is judged against the step it cites and the step itself.
  - A related link is judged against the step alone.
  - Tolerance is the tagger's own: max(1.5c, c + 2).
- **Notes.** I counted the steps with fewer than 3 pre and the steps with no related, then sampled 15 of each
  (seeds 7331, 7332) and checked them by hand against the live skills.
- **Scripts.** All scripts are in the critic scratch folder (`wrm-critic-ry1-r3/`):
  - `scan.mjs`: generates every signature
  - `linkfit.py`, `scan2.py`: the per-step fit
  - `optcheck.mjs`: opts validity
  - `stepitems.mjs`: items per step

## Per-step scores (every step below 8 has its fix)

### Reception

| Step | Score | Finding (from generated items) | Fix |
|---|---|---|---|
| R.B1.S1 Match objects | 8 | The gap is honest. 0 pre is right (first step). | none |
| R.B1.S6 Create sorting rules | 8 | Right. The note names R.B1.S1 as a gap, but its build `match_same` is not in `preBuild`. | Add `match_same` to `preBuild`. |
| R.B2.S6 Create simple patterns | 8 | The gap is honest. 0 pre is right: the only earlier pattern skill is the typed-name `shape_pattern`, which is barred. | none |
| R.B3.S3 Represent 1, 2 and 3 | 7 | The partial and `band_3` are right. The note "no other live skill teaches an earlier step" is false: `count_objects {band:5, objects:'pictures'}` (R.B3.S1) was dropped because its key was already used (dice), and `classify_count {band:3}` (R.B1.S4, counting one kind to 3) is live. | Pre: `count_objects {band:5, objects:'pictures'}`, `classify_count {band:3}`. |
| R.B4.S1 Circles and triangles | 6 | Direct `name_2d_shapes {forms:[1], shapes:[0,1]}` is right. **3 of 4 related links do not fit a 4-year-old:** `shape_attributes {}` (parallel sides, right angles, 6-sided shapes), `count_sides_vertices_2d {}` (octagon vertices, answers to 9) and `shape_name_match_2d {}` (drag written names). | Related: `shape_corners_count {band:4}`, `shape_attributes {forms:[0], band:4}`. Drop the written-name drag. |
| R.B5.S2 Subitise 4 and 5 | 8 | The partial and `subitise` are right. | none |
| R.B6.S4 My day and night | 7 | The gap is honest. Related `time_hour` / `time_half_hour` read clock faces. That is not the same idea (ordering a day) and is a Y1.B14 response (rule 18). | Related: none, plus a note. Pre: none (first time step). |
| R.B7.S1 Introduce zero | 8 | Right; the pre (frame 5, dice 5, count back) leads to zero. | none |
| R.B9.S8 Double to 8 (make) | 8 | `double {band:20}` deals "Double 9 = 18" in 6 of 8 items. 20 is its lowest band, and the partial says the skill is abstract. Honest. | none |
| R.B11.S2 Compare numbers to 10 | 7 | The direct `compare_groups` and `compare_small` are right. **The partial `placevalue:compare {band:99}` deals 81 _ 52 and 66 _ 56 with < > = symbols.** None of its items falls within 10, and the response is not a PK one. A partial tag would send it to PK4 pupils. | Make it a tagFix `remove`, not `partial`. The same applies to Y1.B1.S13 and Y1.B4.S11. |
| R.B11.S7 Composition to 10 | 7 | `number_bonds {band:10}` full is right (wholes 4-10). Pre has 2 entries. The note says the other earlier skills "deal numbers past this step" or have no skill, but the main building blocks `ten_frame_build {band:10}` (R.B11.S3) and `count_objects {band:10}` (R.B11.S1) are live and fit. | Add both as pre. |
| R.B11.S12 Doubles to 10 (make) | 7 | The partial is honest. Pre is `add_three` (an abstract 3-addend sum), `ten_frame_build` and `make_ten`. These are bond skills, not doubles. The building blocks given to R.B9.S7 / S8 (count each group, the groups are the same) are missing. | Pre: `count_objects {band:10, objects:'frame'}`, `compare_groups {band:10}`. Drop `add_three`. |
| R.B12.S1 Recognise 3-D shapes | 7 | Direct `name_3d_shapes {forms:[1]}` (tap) is right. Pre `shape_attributes {}` is 2-D, with parallel sides and right angles. The related `shape_name_match_3d` is, in the tagger's own words, "a Year 1 response (rule 8)", yet it is still linked (rule 18 covers related links). | Pre: `name_2d_shapes {forms:[1], shapes:[0,1,2]}`. Related: none, or the `shapes_world` build. |
| R.B13.S1 Numbers 10-13 | 7 | The partials and `teen_bands` are right. Related `hundreds_chart_fill {band:30}` goes to 30 for a 10-13 step: the block ceiling of 20 lets it through (the lead's point 1). Pre `count_sequence {dir:'back'}` is not a building block of teen numbers. | Related `hundreds_chart_fill {band:20}`. Pre `count_sequence {band:10, dir:'forward'}`. |
| R.B15.S2 Rotate shapes | 6 | The partial is honest. **Pre `shape_attributes {forms:[1]}`:** "4 right angles" in 17 of 40 items and "parallel sides" in 8 of 40. **Related links:** octagon vertices, a written-name drag. | As R.B4.S1. |
| R.B15.S4 Explain shape arrangements | 6 | The partial `compose_shapes` is fine. Pre `shape_attributes {forms:[1]}` and related `shape_name_match_2d` misfit (as above). | As R.B4.S1. |
| R.B16.S1 Explore sharing | 8 | Right. | none |
| R.B16.S4 Grouping | 8 | `share_into_groups {band:12}` (12 counters, groups of 4) is right. The empty related could hold `halve {band:10}` (sharing between two). | optional |
| R.B18.S1 Deepen understanding | 8 | The review pre list is sensible. | none |
| R.B18.S2 Patterns and relationships | 7 | The partial `shape_pattern {points:[0]}` asks for typed shape names. The tagger itself bars that for Reception (R.B12.S5, `R_NOLINK`), but this partial does not name the response defect. Pre `doubles_near_doubles {forms:[0]}` deals 9 + 9 (doubles to 18, past R's 10). | Name the typed response in `missing`. Pre: `double` → `halve {band:10}`, or drop it. |
| R.B9.S3 1 more (hard) | 8 | `more_less_pictures` + `number_focus` close it together. The pre are right. | none |
| R.B11.S8 Bonds to 10, 2 parts (hard) | 7 | `make_ten {band:10}` ("the frame shows 8, how many more make 10") is right. Pre has 2 entries. The note again says the other earlier skills deal past the step, but `ten_frame_build {band:10}` (R.B11.S3, the full frame) is the main building block and fits. | Add it, and `count_objects {band:10, objects:'frame'}`. |
| R.B14.S2 How many did I add (hard) | 7 | The partial and `pictures_change_unknown` are right. Pre is `add_three` (abstract), `ten_frame_build` and `make_ten`. Counting on, the building block of "how many did I add", is missing: `count_sequence {band:10, dir:'forward'}` (R.B11.S5). So is R.B14.S1. | Pre: `count_sequence {band:10, dir:'forward'}`, `number_bonds {band:10}`. Drop `add_three`. |
| R.B13.S6 Verbal counting patterns (hard) | 8 | The partial and `oral_count` are right. | none |
| R.B16.S5 Even and odd sharing (hard) | 8 | Right. | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S1 Sort objects | 8 | Right. | none |
| Y1.B1.S6 Count on from any number | 7 | Full is right ("what comes after 8", tracks to 10). None of the pre is a building block of counting on: `ten_frame_build {band:5}`, `number_word_form` (which deals only "ten", a known generator bug) and `count_objects`. | Pre: `count_sequence {band:20}` (R.B13.S4), `number_seq_fill {step:1, range:20}` (R.B13.S2 / S4). |
| Y1.B1.S13 Compare numbers | 7 | The partial `placevalue:compare {band:99}` deals only 2-digit numbers with symbols, and none of its items is within 10. | tagFix `remove`. Keep `compare_small`. |
| Y1.B2.S1 Parts and wholes | 8 | Right. | none |
| Y1.B2.S5 Number bonds within 10 | 8 | Right. | none |
| Y1.B2.S10 Addition problems | 7 | The content is right (stories within 10, pictures). **The layout is not Kindergarten.** The word-work cell prints a column digit-box stack, a + − × ÷ sign row and a three-word unit bank ("days, apples, boxes"). See owner question 2. `add_wp_10_plain` deals the same items as `add_wp_10` (the picture row is off). | Partial: missing "a Kindergarten response: a pictured story and one answer box, with no sign row, columns or label bank". Build: a `k_story` layout option (see Q2). |
| Y1.B2.S11 Find a part | 8 | Right. | none |
| Y1.B3.S2 Sort 3-D shapes | 6 | The gap is honest. Pre `shape_attributes {}` (2-D: parallel sides, right angles) is not a 3-D building block. Related `shape_name_match_2d` (2-D naming) is not the same idea. | Pre: `name_3d_shapes {forms:[1]}`, `classify_count {band:6}` (Y1.B1.S1 sorting). Related: none. |
| Y1.B3.S3 Name 2-D shapes | 7 | Full is right (pentagons are bundled with hexagons, as noted). Pre `shape_attributes {}` deals parallel sides and right angles. | Pre `shape_attributes {forms:[0], band:4}`. |
| Y1.B5.S5 Near doubles | 8 | Right. | none |
| Y1.B6.S5 Partition into tens and ones | 8 | `base10_build {band:50}` is right. | none |
| Y1.B7.S2 Measure length using objects | 8 | Right (crayons, clips, cubes). Pre `heavier_lighter_visual` is weak, and `count_objects` is missing. | optional |
| Y1.B8.S4 Full and empty | 7 | The gap is honest. Pre `reading_ruler` (Y1.B7.S3, cm) is not a building block of full / empty. | Drop it. Pre: `compare_objects {}`, `heavier_lighter_visual` (kept). |
| Y1.B8.S6 Measure capacity | 6 | The gap is honest. Pre is size, mass and a cm ruler. **The measuring building block `measure_nonstandard` (Y1.B7.S2) is missing.** The tagger used it for mass (Y1.B8.S2), not for capacity. | Pre: `measure_nonstandard`, `count_objects {band:20}`. Drop `reading_ruler`. |
| Y1.B9.S6 Make arrays | 8 | Right ("___ rows of ___ make ___", to 20). | none |
| Y1.B10.S8 Quarter of a quantity | 8 | The partial names the option leak honestly. | none |
| Y1.B11.S2 Left and right | 7 | `shape_positions {}` deals only above, below, beside and between, never left or right. So it teaches no part of the step: it is a gap, not a partial. | Verdict `gap` with build `position_map`. Keep the skill as a pre. |
| Y1.B12.S1 Count from 50 to 100 | 7 | The partial and `count_start_at` are right. **The main building blocks are ranked 6th and 7th** (Y1.B6.S1 tracks / chart to 50), behind R ten-frame "arrangements of 10" and "1 more" (rule 14). | Order: `number_seq_fill {range:50}`, `hundreds_chart_fill {band:50}`, `tens_foundation_visual {band:50}`, then the R week items. |
| Y1.B12.S2 Tens to 100 | 7 | The partial and `tens_name_100` are right. Pre lacks counting in 10s (Y1.B9.S2, school week 9, before this step) and the tens-to-50 rung (`tens_foundation_visual {band:50}`). R "arrangements of 10" and "1 more" come first. | Pre: `skip_count_line {step:[0], band:50}`, `tens_foundation_visual {band:50}`, `hundreds_chart_fill {band:100, gaps:'column'}`. |
| Y1.B12.S5 1 more, 1 less (to 100) | 7 | Full is right. Pre `placevalue:compare {band:99}` cites R.B11.S2 "Compare numbers to 10". It is not a building block of 1 more, and the cited step never taught 2-digit symbols. The link only passes because of the wrong partial tag on R.B11.S2. | Drop it. |
| Y1.B2.S9 Add more (hard) | 7 | `number_line_add {range:10}` is right. `add_wp_10` has the same layout defect as S10. Pre lacks counting on (`count_sequence {band:10}`, Y1.B1.S6), the building block of "add more". | As S10. Add the count-on pre. |
| Y1.B2.S4 Addition facts (hard) | 8 | Partial is right: both skills deal "9, 9, 2, 7" families with subtraction rows. `family_add_only` closes it. | none |
| Y1.B6.S1 Count 20 to 50 (hard) | 7 | The partial and `count_start_at` are right. Pre ranks the R ten-frame items first. The main building block, counting on to 20 (`count_sequence {band:20}`, `number_seq_fill {range:20}`), is missing. | Add both, first. |
| Y1.B9.S2 Count in 10s (hard) | 7 | The partial is honest. But `skip_count_line {step:[0], band:50}` dealt **10s in only 2 of 30 items** (19 were 2s, 9 were 5s). The `missing` text should say so: at present the 10s step has almost no 10s items. | Say "10s are 2 of 30 items" in `missing`. |
| Y1.B13.S3 Recognise notes (hard) | 8 | Partial is right. | none |

### Re-check of the round-2 failing steps

- **Now 8 (fixed):**
  - R: B3.S4, B3.S5, B3.S6, B5.S1, B5.S6, B5.S7, B9.S9, B11.S5, B13.S4, B14.S1, B14.S3, B16.S3, B17.S7.
  - Y1: B1.S7, B2.S4, B2.S8, B2.S15, B4.S8 (the school-week note is good), B5.S7, B5.S10, B6.S2, B6.S8, B8.S2,
    B9.S1, B9.S3, B10.S3, B10.S7, B13.S1, B13.S2, B13.S4, B14.S6.
- **Still 7:**
  - R.B3.S1: 1 pre. `classify_count {band:3}` (R.B1.S4) is live, so the note is false.
  - R.B7.S7: the builds do not close "5 = 5 + 0". `band_3`'s zero part covers only wholes 1-3, and `zero` is
    counting an empty set. Give `number_bonds` a zero-part value usable at band 5.
  - Y1.B1.S13, B5.S1, B9.S2, B11.S2, B12.S1, B12.S2, B6.S1: see the tables.
  - Y1.B5.S1: the count-on pre is missing.
  - Y1.B5.S8: round 2's example of a building block, `compare_groups` (compare two groups, then the difference), is
    still not a pre.
  - Y1.B14.S3: related `time_match_clock` is still not the same idea as the months.

## Systematic defects, counted across the WHOLE files

The tagger's counts were checked. My own scan used new seeds.

| Check | R | Y1 | Status |
|---|---|---|---|
| Opts values invalid | 0 | 0 | ok (1,160 checked) |
| Direct and partial entries missing from the items log | 0 | 0 | ok (222) |
| Number-size fit, pre judged against the cited step and the step | 1 (R.B18.S1 `count_objects {band:20}` cites R.B11.S1; it is a review step, so this is fine) | 0 | ok |
| Number-size fit, related judged against the step itself | 2 (R.B13.S1 / S2 `hundreds_chart_fill {band:30}` on 10-13 / 10-13 steps: the block ceiling) | 0 real (13 flags are steps whose own number is the picture size, 5, inside a to-10 block; they are fine) | minor |
| Hidden by measurement: `tens_foundation_visual {band:90}` reads "9" but shows 9 tens = 90 | 0 | 6 (Y1.B4.S2-S6 teen steps, Y1.B6.S3) | minor; `maxdealt` should count rods × 10 |
| **Rule 18 content, shape links never checked** (`FIT` exempts shapes) | `shape_attributes` 13 links + 2 partials; `count_sides_vertices_2d` 5; written-name drag 15 | `shape_attributes` 4 links + 1 partial | **FAIL: 37 links, 3 partials** |
| False partial (0 items do the claimed part) | R.B15.S1 (0 of 40 items "roll / stack") | Y1.B11.S2 (0 items left / right) | fix |
| 2-digit symbol compare tagged partial on a within-10 / within-20 step | R.B11.S2 | Y1.B1.S13, Y1.B4.S11 | fix (remove the tag) |
| Word-work layout (columns, + − × ÷, label bank) as a K direct | 0 (R: partial with the defect named) | Y1.B2.S9, S10 | owner Q2 |
| Pre whose `why` names a step the school teaches later | 2 hand-written whys (R.B9.S6-S8 cite R.B11.S2 / S3) | 11 promoted entries read "(earlier step; the next step on this idea: <later step>)" | cosmetic: drop the second clause |
| `< 3 pre` steps without a note | 0 of 42 | 0 of 8 | ok |
| Empty related without a note | 0 of 45 | 0 of 36 | ok |
| Rule 14 ranking: the nearest same-idea Y1 block comes after 3 or more R-week items | n/a | 26 steps flagged; by hand about 8 have the main block last or missing (Y1.B1.S6, B5.S1, B5.S8, B6.S1, B12.S1, B12.S2, B2.S9, B8.S6) | fix |

### The notes on fewer than 3 pre and on empty related (lead's point 2)

- **Fewer than 3 pre: 50 steps (R 42, Y1 8), each with a note.** I sampled 15 (seed 7331): R.B1.S1, B1.S5, B2.S2, B2.S3,
  B2.S4, B3.S1, B4.S1, B4.S2, B4.S3, B4.S4, B10.S1, B11.S13, B17.S3, Y1.B14.S3, Y1.B14.S5.
  - **13 are honest.** They are first steps on an idea, earlier steps that are gaps, or the only earlier skill is barred
    (typed names).
  - **2 are not:**
    - R.B3.S1: "no other live skill …", yet `classify_count {band:3}` is live.
    - R.B11.S13: "the earlier steps use this step's own skill", yet `count_objects {band:10}` is a live building block.
  - Outside the sample, R.B11.S7 and R.B11.S8 have the same false "deal numbers past this step" note.
  - Cause: the note is written by `gen.py` from its topic classifier (`SUBS`). A building block in another sub-topic
    (count → bond, sort → count) is never looked for, so the note says "none" when one exists.
- **Empty related: 81 steps (R 45, Y1 36).**
  - 24 are gaps ("no live skill shows this idea in another form yet").
  - 57 say "every other live form of this idea is already a pre-skill or a direct skill". **That sentence is a
    template:** `gen.py` writes it whenever the related list comes out empty and the step is not a gap. It is never
    checked.
  - I sampled 15 (seed 7332): R.B2.S3, B5.S1, B5.S2, B7.S1, B7.S7, B7.S8, B8.S2, B8.S3, B8.S4, B12.S5, B16.S2, B17.S10,
    Y1.B8.S2, Y1.B9.S6, Y1.B11.S1.
  - **13 are honest. 2 are not:**
    - R.B7.S7: `add_5_pictures`, a whole from two pictured parts to 5, is not taught before R.B9.
    - R.B16.S2: `halve {band:10}` is sharing between two.
  - Outside the sample, R.B16.S4 has the same false note as R.B16.S2.
- **Verdict:** the tagger is not avoiding work. The large counts are mostly honest, because Reception has many
  first-of-idea and gap steps and rule 14 moves every earlier skill to pre. But the template sentence must be replaced
  by the real reason, or by the missing link.

## Proposals asked about (lead's point 3)

- **`number_focus`: accept.** It is a `focus` window option (4-5 / 6-8 / 9-10) on `count_objects`,
  `ten_frame_build`, `number_bonds` and `count_sequence`. Its `closes` entries are step-specific and correct; R.B9.S3 /
  S4 also need `more_less_pictures`, and they list it.
  - **Owner Q1:** yes, one option id. Fold the next two proposals into the same `focus` id on their own skills, because
    a window is a window. Keep `band` as the cap.
    - `teen_bands`: values 10-13 and 14-20. The proposal's 14-16 / 17-20 split serves no R step: R.B13.S3 and S4 are
      both 14-20.
    - `count_start_at`: 20-50 and 50-100.
  - They can stay as separate proposal entries for the build lanes.
- **`band_3`: accept, with one gap.** Value 3 on `count_objects`, `ten_frame_build` and `number_bonds`, and value 5 on
  `count_sequence`, closes the 1-3 steps (with `more_less_pictures` for the more / less steps).
  - It does **not** close R.B7.S7's "5 = 5 + 0": its zero part covers only wholes to 3.
  - `zero` (`counting:zero_none`) counts an empty set; it does not deal bonds.
  - Fix: make the zero part a `number_bonds` value usable at band 5 (or list R.B7.S7 against a separate `zero_part`
    option).
- **`teen_bands`: accept** with the value change above. Its `closes` names R.B13.S1-S4 correctly, including "20 as two
  full tens".
- **`family_add_only`: accept.** `add_sub_fact_family {range:10}` dealt "9, 9, 2, 7": every family includes the
  subtraction rows. The option closes Y1.B2.S4 exactly.
- **`count_start_at`: accept** as a `focus` value (see above). Both partial skills are capped windows that start below
  20 / 50. I generated 8 items each: `number_seq_fill {range:50}` gave 5, 7, 10 and 3 (start values); the chart gave rows
  0-2.
- **`tens_name_100`: accept.** It adds band 100 and asks for the number as well as "how many tens". Both are needed:
  band 90 gave 1-9 tens and never "20".
- **Rule 13 short form:** every proposal checked has `name`, `kind`, `teaches`, step-specific `closes` and
  `representation`. No `closes` copies `teaches` (rule 16 holds).

## Owner question 2: `add_wp_10` on Y1.B2.S9 / S10

My view: **hiding × and ÷ is not enough.** The word-work cell, as its own header documents, also prints:

- a column digit-box stack (2 tracks) with the answer as its bottom row
- a three-word unit-label bank to copy from ("days, apples, boxes")

That is the column layout and the written-word response that rule 8 and rule 18 bar for Kindergarten, and the tagger
itself bars word-work from every R / Y1 link for this reason (`NOLINK`). Keeping it as a K direct contradicts that.

- Mark Y1.B2.S9 / S10 partial, missing "a Kindergarten response".
- Propose a `k_story` layout option on the word-work skills (or a story line on the proposed `add_10_pictures`):
  - the story with its picture row, read aloud
  - one answer box
  - no sign row (or + / − only), no column boxes, no label bank
- The story content of `add_wp_10 {band:10}` is right and can stay.

## To pass round 4

1. **Shapes, rule 18 content (the systematic defect).** Remove the shape exemption from `spec.FIT`:
   - Every `shape_attributes` link: `{forms:[0], band:4}` (sides of triangles, squares and rectangles only), or drop it.
   - Every R `count_sides_vertices_2d` link: `{band:4}`, or `shape_corners_count {band:4}`.
   - Every R `shape_name_match_2d` / `_3d` link: drop it.
   - R.B15.S1: gap, not partial (`shape_attributes` never selects a shape for a purpose).
   - R.B4.S2 and Y1.B3.S4 partials: use `{band:4}`, and name what still leaks.
2. **False partials:**
   - R.B15.S1 → gap. Y1.B11.S2 → gap.
   - Remove `placevalue:compare {band:99}` from R.B11.S2, Y1.B1.S13 and Y1.B4.S11 (as tagFix `remove`), and from the
     Y1.B12.S5 pre.
3. **Main building blocks (rule 14), first in the list:**
   - count on before "add more" / "count on within 20" / "how many did I add" (Y1.B2.S9, Y1.B5.S1, R.B14.S2)
   - compare groups before "difference" (Y1.B5.S8)
   - `measure_nonstandard` before capacity (Y1.B8.S6)
   - count to 20 / 50 before counting 20-50 / 50-100, and count in 10s before tens to 100 (Y1.B6.S1, B12.S1, B12.S2)
   - frame and count before bonds to 10 (R.B11.S7, S8)
   - equal groups before doubles (R.B11.S11, S12)
   - Drop `add_three` and `reading_ruler` where they are not building blocks.
   - Rank pre links by building block, not R-week first.
4. **Notes:**
   - Look for building blocks across sub-topics before writing "no other live skill …".
   - Replace the "every other live form …" template with the real reason, or add the missing related link (R.B7.S7,
     R.B16.S2, R.B16.S4).
5. **Proposals:**
   - Fold `teen_bands` (10-13 / 14-20) and `count_start_at` into the `focus` option id.
   - Give `number_bonds` a zero part at band 5 for R.B7.S7.
   - Answer Q2 as above, and make Y1.B2.S9 / S10 partial.
6. **Smaller items:**
   - `hundreds_chart_fill {band:20}` on R.B13.S1 / S2.
   - Count `tens_foundation_visual` rods × 10 in `maxdealt`, and re-fit the six teen and tens links.
   - Drop the second clause, "(…; the next step on this idea: <later step>)", from promoted `why` texts.
   - Note that `skip_count_line` deals 10s in only 2 of 30 items (Y1.B9.S2).
