# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 1

This is an independent critic. The tagging data was not edited. The tree is
`claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at head `7308c1e8`.

It checks `data/curriculum/links/R.json` and `Y1.json`, the two reports, and the decisions in
`tests/scripts/wrm-tagging/spec.py` and `gen.py`.

## Verdict: FAIL

| Year | Steps scored | Mean | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| R | 25 (20 random + 5 chosen) | **6.80** | 1 | 0 | 4 | 4 | 5 | 11 |
| Y1 | 26 (20 random + 6 chosen) | **6.23** | 3 | 3 | 0 | 6 | 7 | 7 |

The random draws alone score R 7.25 and Y1 6.75. Both are below 8.

The `gap` and `partial` verdicts are mostly honest, and the reused proposals mostly fit. The `full` verdicts are where the work fails:

- In R, the 11 sampled `full` steps average **5.8**.
- In Y1, almost every `full` step is the old `SKILL_WRM` tag carried over without a check: **50 of 50** in R and **67 of 69** in Y1.

The tagger says the verdicts were judged by reading the code, without generating items. That is not good enough here. When the items are generated, many `full` claims do not hold.

## Method

- **Sample.** Python `random.Random(20261010).sample(steps, 20)` per year, over the step order of each links file.
  - R random: B1.S1, B1.S6, B4.S3, B4.S4, B5.S7, B6.S3, B7.S8, B8.S1, B8.S3, B8.S4, B9.S5, B9.S6, B10.S3, B12.S6, B13.S3, B15.S2, B15.S6, B16.S1, B16.S3, B17.S1.
  - R chosen: B3.S1 and B3.S4 (the "1, 2, 3" steps), B2.S5 (patterns), B13.S6 (oral counting), B14.S1 (add more).
  - Y1 random: B1.S1, B1.S6, B2.S7, B2.S8, B2.S15, B3.S1, B4.S5, B4.S6, B4.S8, B4.S9, B5.S2, B5.S3, B5.S10, B9.S4, B9.S8, B10.S8, B11.S4, B12.S2, B12.S4, B13.S1.
  - Y1 chosen: B9.S1, B9.S2 and B9.S3 (count in 2s, 10s and 5s), B13.S2 (coins), B14.S5 (time), B10.S2 (half of a shape).
- **Generation.** Every direct and partial skill of every sampled step was generated with the opts the tag gives. This was done in the real app (puppeteer through `tests/lib/ws-harness.cjs`, then `window.generateQuestionFor`): 8 items per skill, seeds 9000-9007, at Max Number 10 and at Max Number 100.
  - A further 27 skill/option pairs were generated to test the alternatives named below.
  - There were 0 console errors.
- **Sources.** Each step was read in `wrm-steps.json` (title, CCSS, notes, vocab). The Y1 steps were also read in the Kindergarten sheet of the school xlsx.
- **Scale.** Each step was scored 0-10 on: (a) direct skills, (b) honest verdict, (c) missed live skill, (d) proposals, (e) pre-skills, (f) related, (g) live keys. All keys are live.

## Per-step scores (every step below 8 has its fix)

### Reception

| Step | Score | Finding (from generated items) | Fix |
|---|---|---|---|
| R.B1.S1 Match objects | 8 | Gap is honest; `match_same` fits. | none |
| R.B1.S6 Create sorting rules | 8 | Gap is honest; `sort_groups` includes "say the rule". | none |
| R.B4.S3 Shapes in the environment | 8 | Gap is honest; `shapes_world` fits. | none |
| R.B4.S4 Describe position | 8 | Partial is right: `shape_positions` deals above, below, beside and between, but not in front, behind or under. | none |
| R.B5.S7 Composition of 1-5 | 7 | `number_bonds {band:5, unknown:mixed}` deals wholes 3-5, as numerals in a bond only. No pictured parts. The only pre-skill is "1 less" (`count_sequence`), which is not a building block. | Pre: `count_objects {band:5}`, `ten_frame_build {band:5}`. Note: no pictured parts. |
| R.B6.S3 Shapes in the environment | 8 | Honest gap. | none |
| R.B7.S8 Conceptual subitising to 5 | 8 | Honest gap; `subitise` fits. | none |
| R.B8.S1 Compare mass | 8 | `heavier_lighter_visual` asks "Which is heavier?" about pictured objects. It is acceptable for this step; the balance comes in S2. | none |
| R.B8.S3 / R.B8.S4 Capacity | 8 / 8 | Honest gaps; `capacity_early` fits. The `preBuild balance` entry is noise. | Drop `balance` from `preBuild`. |
| R.B9.S5 Composition of 6, 7 and 8 | 6 | `number_bonds {band:10}` dealt wholes of 6, 10, 4, 10, 7, 7, 4 and 8. Three of the 8 are outside 6-8. The only pre-skill is "1 less". | Make it **partial**, missing "wholes 6-8 only, pictured parts". Pre: R.B7.S7 and R.B5.S7 bonds, `count_objects {band:10}`. |
| R.B9.S6 Make pairs | 8 | Partial is right: `odd_even` decides by the last digit ("ends in 9"). | none |
| R.B10.S3 Explore height | 7 | The direct skill is right. **pre and related are empty.** | Pre: `compare_objects {task:length}` (R.B10.S1). Related: `order_objects_length`. |
| R.B12.S6 Copy and continue patterns | 5 | `shape_pattern` is a 4.OA.C.5 skill. The pupil **types shape names** ("circle, triangle, circle") into 2-3 blanks, and nothing asks to *copy* a pattern. The pre-skills are 3-D shape skills and `preBuild shapes_world`, which are unrelated. | Make it **partial**, missing "copying; a response a 4-year-old can give (draw or choose)". Build `pattern_make`. Pre: R.B2.S5 and R.B12.S5. |
| R.B13.S3 Build numbers 14-20 | 6 | `teen_compose {band:19}` dealt 11-18. 20 never appears, and 11-13 do. The note admits 20 is missing, but the verdict is still `full`. | Make it **partial**, missing "20 as two tens". Build `teen_structure`. |
| R.B15.S2 Rotate shapes | 6 | The partial is right. But `compare_shapes` (sides, corners, curved) does not teach "a turned shape is the same shape", so the build does not close the gap. The pre-skills are 3-D shapes. | Add a rotation option to `compare_shapes`, or a new `shape_turned` option on `name_2d_shapes`. Pre: R.B6.S1 and R.B4.S1. |
| R.B15.S6 Decompose shapes | 6 | The proposal `scenes` teaches copying and viewpoints, not decomposing, so it does not close the gap. | Add "find the shapes inside a shape" to a proposal (a reverse mode of `compose_shapes`). |
| R.B16.S1 Explore sharing | 8 | Honest gap. | none |
| R.B16.S3 Explore grouping | 7 | Tagged `gap`, but `share_into_groups {band:12}` deals "make groups of 3" and is tagged `full` for R.B16.S4. | Make it **partial** with `share_into_groups {band:12}`. |
| R.B17.S1 Identify units of repeating patterns | 7 | Partial and `pattern_make` are right. **pre is empty.** | Pre: R.B12.S5 and S6 (`shape_pattern`). |
| R.B3.S1 Find 1, 2 and 3 | 5 | `count_objects {band:5}` dealt 2, 5, 4, 3, 1, 2, 5, 4. **Five of the 8 are above 3.** The note admits it, but the verdict is still `full`. | **partial** until there is a count-to-3 band (see owner question 2). |
| R.B3.S4 1 more | 3 | `count_sequence {band:10, dir:forward}` dealt "after 3, 9, 8, 9, 5, 8, 4, 4". **Seven of the 8 are outside 1-3.** It is also a number-name track, not one more *object*. | **partial**: `count_sequence {band:10}` deals beyond 3 and has no objects. Build a band-3/5 option plus pictured "one more". The same applies to R.B3.S5, R.B5.S4/S5 and R.B7.S5/S6. |
| R.B2.S5 Copy and continue simple patterns | 5 | `shape_pattern {points:[0]}` has the same typed-name response and no copying. The pre-skills (mass, size) and `preBuild capacity_early` are unrelated. | **partial**, `pattern_make`. Fix pre and `preBuild`. |
| R.B13.S6 Verbal counting patterns | 5 | `number_seq_fill {step:1}` stays within 10 at Max 10. `seq_10` dealt "1, 11, 21, 31" and "9, 19, 29, 39" at Max 10, and "87, 97, 107, 117" at Max 100. That is not Reception counting patterns. | **partial**. Drop `seq_10`. Use `number_seq_fill {step:1}` at range 20 and 100, and record the range. |
| R.B14.S1 Add more | 7 | `add_5_pictures` deals "how many in all" (combining) to 5. `add_wp_10` mixes "get more" and "in all" stories that need reading. The pre-skills are doubles and `add_three`, which come later in idea. | Pre: `count_objects`, `number_bonds {band:5}`, R.B9.S9. Note the reading load. |

### Year 1

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S1 Sort objects | 6 | The verdict and build are right. The pre-skills are `number_bonds`, `ten_frame_build`, `teen_compose` and `number_seq_fill`. But the xlsx week W23 *lists the three R sorting steps*, and their only skill, `classify_count`, is a partial, so `gen.py` dropped it. | Take the partial skills of prior steps. Pre: `classify_count {band:3}`. |
| Y1.B1.S6 Count on from any number | 8 | The direct skills are right within 10. The pre `seq_10` is noise. | Drop `seq_10`. |
| Y1.B2.S7 Number bonds to 10 | 7 | `number_bonds {band:10, unknown:second}` dealt 2+?=9, 7+?=9, 1+?=7 and 2+?=7: **4 of the 8 are not bonds to 10.** `make_ten {band:10}` is right. | Keep `make_ten`; mark `number_bonds` partial ("wholes other than 10"). |
| Y1.B2.S8 Add together | 6 | `add_5_pictures` stops at 5. `add_10_mixed` draws a **"Column Addition, type in boxes"** layout, which is wrong for a Kindergarten part-whole step. | **partial**, missing "pictured parts to 10". |
| Y1.B2.S15 Take away (how many left) | 6 | `sub_10_mixed` is column subtraction. `sub_wp_10` is word stories with no pictures. | **partial**, missing "pictured take-away to 10". Reuse the S14 build. |
| Y1.B3.S1 3-D shapes | 8 | Right. | none |
| Y1.B4.S5 Understand 17, 18 and 19 | 7 | `teen_compose {band:19}` deals all teens, never isolating 17-19. | Note it; acceptable as near-full. |
| Y1.B4.S6, B4.S8, B4.S9, B12.S4 (number line and 20) | 8 each | Honest partial or gap verdicts; `nl_20` and `teen_structure` fit. | none |
| Y1.B5.S2 Add ones using number bonds | 3 | **Wrong skill.** `add_10_regroup` ("Bridging Ten", 6+5 and 8+9 in columns) and `make_a_ten` both bridge 10. That is **Y2.B2.S6 "Add by making 10"**. Y1 adds ones without crossing 10 (13 + 4 using 3 + 4). The live skill **`addition:add_20_no_regroup` was missed**: it dealt 13+5, 11+8 and 10+7. | Tag fix: **remove** `add_10_regroup` and `make_a_ten` from Y1.B5.S2. **Add** `add_20_no_regroup` as partial (abstract; no ten-frame or part-whole). Do the same for Y1.B5.S6: remove `sub_10_regroup`, add `sub_20_no_regroup`. |
| Y1.B5.S3 Bonds to 20 | 7 | The partial and `bonds_20` are right. The pre-skills inherit the wrong bridging skills from S2. | Fix the pre-skills after the S2 fix. |
| Y1.B5.S10 Missing number problems | 7 | `missing_add_sub` and `cloze_addition` stayed within 10 in the items generated. The block is "within 20". | **partial** ("within 20"), or record a range or band that reaches 20. |
| Y1.B9.S4 Recognise equal groups | 6 | `equal_or_unequal_groups` asks the pupil to **write "multiply" or "add"**, with up to 24 counters. That is not Kindergarten language. | **partial**, missing "say equal / not equal". Use `{step:6}`. |
| Y1.B9.S8 Grouping | 8 | Right. | none |
| Y1.B10.S8 Find a quarter of a quantity | 4 | `fraction_of_set {}` dealt 2/5 of 15, ?/6 of 18 and 3/5 of 10. Even `{denoms:[2]}` dealt 1/4, 2/4 and a stray ?/6 or ?/5. | **partial** with `{denoms:[2]}`. Needs a quarters-only option (new). |
| Y1.B11.S4 Above and below | 7 | `shape_positions {}` also deals beside and between. The option **`{forms:[0]}` exists** ("Above and below"). | Set `opts {forms:[0]}`. |
| Y1.B12.S2 Tens to 100 | 7 | `tens_foundation_visual {band:90}` is right. `seq_10` deals off-multiples (2, 12, 22; 73, 83, 93, 103). | Drop `seq_10`, or replace it with `skip_count_line {step:[0], band:100}`. |
| Y1.B13.S1 Unitising | 6 | `coin_value` is "circle every coin worth N", which is coin recognition. The stronger unitising skill, `tens_foundation_visual` ("one rod is one ten"), is missing. | **partial**. Add `tens_foundation_visual`. |
| Y1.B9.S1 Count in 2s | 4 | `seq_2` dealt 1, 3, 5, 7 and 9, 11, 13 at Max 10, and 87, 89, 91, 93 at Max 100. `skip_count_line {}` dealt 4s and 6s. | **partial**: `skip_count_line {step:[0], band:50}` (true multiples from 0 or 2 within 50, but 2s, 5s and 10s are mixed on one page and there are no pictured pairs). Drop `seq_2`. |
| Y1.B9.S2 Count in 10s | 3 | `seq_10`: 1, 11, 21, 31. The **tag-fix add** `number_seq_fill {step:10}`: 1, 11, 21, 31, 41 at Max 10, and 46, 56, 66 at Max 100. **None of these are multiples of ten.** | Reject the tag-fix add. Same fix as B9.S1. |
| Y1.B9.S3 Count in 5s | 3 | `seq_5`: 1, 6, 11 and 9, 14. The tag-fix add `number_seq_fill {step:5}`: 1, 6, 11, 16, 21 and 61, 66, 71. | Reject the tag-fix add. Same fix as B9.S1. |
| Y1.B13.S2 Recognise coins | 7 | Acceptable. The pre-skills `seq_10` and `number_seq_fill` are noise. | Fix pre. |
| Y1.B14.S5 Time to the hour | 6 | `time_hour` is right (it writes 3:00). The pre-skills are **`share_into_groups` and `compose_shapes`**, taken from the W36 week list of the "half" lesson. `clock_parts` is missing as a pre-skill. | Pre: `clock_parts`. Keep `preBuild time_talk` and `day_order`. |
| Y1.B10.S2 Find a half of a shape | 4 | `shade_fraction {}` dealt 4/6, 2/4, 7/10, 2/3, 6/8, 1/2, 2/6 and 5/6: **1 of the 8 is a half.** The note says "Denominator 2", but the opts are empty. The same holds for B10.S6 (quarter). For B10.S1 and S5, `partition_shapes {parts:[0]}` (or `[2]`) gives halves or fourths only. | **partial** for S2 and S6 (needs a halves-only or quarters-only option). Set the `parts` opts on S1 and S5. |

## Systematic defects

1. **The `full` verdicts were inherited, not generated.** Every R `full` (50/50) and 67/69 Y1 `full` verdicts are exactly the old `SKILL_WRM` tags. Generation disproves many of them: the 1-2-3 and 4-5 band overreach, count in 2s/5s/10s, halves and quarters, and bridging in Y1.B5.S2.
2. **A band that overreaches the step is accepted as `full`.** In the "1, 2, 3", "4 and 5" and "6, 7 and 8" steps, the bands deal 4-5 or 9-10. R.B3.S4 deals 7 of 8 items out of range. The notes admit this and the verdicts ignore it.
3. **Options exist but were not set**, or were written as notes. This applies to:
   - `partition_shapes {parts}`
   - `shape_positions {forms:[0]}`
   - `skip_count_line {step:[0], band:50}`
   - `coin_value {task:'order'}` and `money_count {kind:'note'}` for notes
   - the "Denominator 2" note on `shade_fraction`

   Links also carry no Max Number (range), yet `seq_*`, `number_seq_fill`, `double`, `halve` and `missing_add_sub` change with it.
4. **The pre-skills are mechanical.**
   - Y1 takes the whole xlsx week list without a filter: **130 pre entries in 56 Y1 steps come from another CCSS domain**. It also drops the prior steps whose only skill is partial (Y1.B1.S1).
   - R falls back to "the step just before in the block" whatever the topic (patterns get mass; rotating shapes gets 3-D). It counts only 8 cross-domain entries, because most R steps carry no CCSS. Two sampled R steps have no pre at all.
   - `preBuild` carries unrelated proposals (`capacity_early` on a pattern step, `balance` on capacity).
5. **Related is padded, and duplicates pre.**
   - 253/340 (R) and 316/423 (Y1) related entries are justified only by "same block" or "same CCSS".
   - **89/119 R and 87/116 Y1 steps list the same key in both pre and related.**
   - 2 R and 4 Y1 steps have no related entries.
6. **The response mode for a 4- or 5-year-old was not judged.** Examples: typed shape names (`shape_pattern`), column addition layouts (`add_10_mixed`, `add_10_regroup`), and "write multiply / add".

## The new MANDATORY rules (lead note)

| Rule | R | Y1 |
|---|---|---|
| S1: pre from an unrelated domain (unfiltered week list) | 8 entries / 8 steps (CCSS-measurable); the block fallback adds topic noise on non-CCSS steps | **130 entries / 56 steps** |
| S2: options as notes instead of `opts` on `full` steps | R.B6.S1, plus the R.B3 notes "no 3-only band" and "band 10 is the smallest" | B2.S4, B10.S2, B10.S6, B12.S2, B13.S1; and unset opts on B10.S1, B10.S5, B11.S4 and B9.S1 |
| S3: verdicts inherited from old tags, not generated | **50 / 50** `full` | **67 / 69** `full` |
| S4: related padded with same block or cluster | 253 / 340 entries | 316 / 423 entries |
| S5: a step's own build in its `preBuild` | 0 | 0 |

## The three new proposals

- **`doubles_pictured`** (an option on `doubles_near_doubles`: two equal rows of counters, to 8 and to 10). This closes R.B9.S7/S8, R.B11.S11/S12 and R.B16.S6. It fits the black-and-white boxed cell. Accepted.
- **`bonds_3_parts`** (`number_bonds {parts:3}`). This closes R.B11.S10, and it is right that `add_three` is not a bond. Accepted.
- **`pictures_change_unknown`** is **not acceptable as written**:
  - It puts two changes in one option: change-unknown, and lifting the band to 10. That breaks PEDAGOGY P-1.
  - Lifting `add_5_pictures` / `sub_5_pictures` ("Add/Subtract **Within 5** with Pictures") to 10 contradicts the skill's own name, and `ws-content-audit` would fail it.
  - One option cannot live on two skills.
  - Y1.B2.S14 (take away by crossing out, to 10) is not change-unknown.

  Fix: split it in two.
  1. `pictures_change_unknown`: change-unknown only, on both picture skills, within 5.
  2. A separate new skill, `sub_10_pictures` and its addition twin (crossing out to 10), for Y1.B2.S14/S15 and Y1.B2.S8.

## Tag fixes

- **R (7 fixes): all correct.** Generation confirms each one.
  - `shape_positions` has no in front, behind or under.
  - `doubles_near_doubles` and `double` are abstract (9+9; "Double 7" as a bar).
  - `placevalue:compare` has no band within 10.

  The report's wording is muddled: R.B16.S6 is counted twice, as "six plus a seventh".
- **Y1 (9 fixes): 6 are correct and 3 are wrong.**
  - Correct: `number_bonds` partial in B2.S1, the two picture skills in B2.S3, `shape_pattern` in B3.S5, `number_line_sub` in B4.S9, and `shape_positions` in B11.S2.
  - **Wrong:** both `add` fixes, `number_seq_fill {step:10}` in B9.S2 and `{step:5}` in B9.S3. They deal 1, 11, 21 … and 46, 56 …, which are not counts in tens or fives.
  - **Wrong reason:** `coin_value` in B13.S3 is marked partial because "no notes", but `coin_value {task:'order'}` orders notes ("Write 1, 2, 3 under the notes"), and `money_count {kind:'note'}` counts notes (5, 10, 20, 50).
    - Recognise notes should be partial with `coin_value {task:'order'}` and `money_count {kind:'note'}`.
    - `money_notes` then shrinks to "name each note's value".
- **Fixes the tagger missed:**
  - Remove `add_10_regroup` and `make_a_ten` from Y1.B5.S2, and remove `sub_10_regroup` and `make_a_ten` from Y1.B5.S6 (bridging is Y2.B2.S6 and S10).
  - Add `add_20_no_regroup` and `sub_20_no_regroup` instead.
  - Mark `seq_2`, `seq_5` and `seq_10` partial in Y1.B9.S1-S3 and Y1.B12.S2.
  - Mark `shade_fraction` and `fraction_of_set` partial in Y1.B10.S2, S6 and S8.

## Owner questions asked of the critic

**Question 2 (R report): is band 5 good enough for the "1, 2, 3" steps? Answer: no.** The generated evidence:

| Skill (opts) | Items above 3 |
|---|---|
| `count_objects {band:5, objects:'pictures'}` | 5 of 8 (2, 5, 4, 3, 1, 2, 5, 4) |
| `number_bonds {band:5}` | wholes of 4-5 in most items |
| `count_sequence {band:10}` | 7 of 8 outside 1-3 |
| `ten_frame_build {band:5}` | 4 and 5 appear |

A third of a six-item page outside the step is not `full`. Recommended:

- Mark these steps `partial` (R.B3.S1, S3, S4, S5 and S6; R.B5.S4 and S5 for 4-5 with band 10).
- Add one option proposal, `band_3`: a count-to-3 value on `count_objects`, `ten_frame_build` and `number_bonds`, and count-to-5 on `count_sequence`.

This is a small change to the schema, and it makes the steps honestly `full`.

**Question 8 (Y1 report, question 4): count in 2s, 5s and 10s is `full` with `seq_*`, even though it goes past 100. Answer: do not accept this.** Going past 100 is the smaller problem. The skills do not count in 2s, 5s or 10s as WRM means it (multiples, starting from 0):

| Skill | At Max 10 | At Max 100 |
|---|---|---|
| `seq_2` | 1, 3, 5 / 9, 11 | 87 … 93 |
| `seq_5` | 1, 6, 11 / 9, 14 | 87 … 97 |
| `seq_10` | 1, 11, 21 / 9, 19 | 87, 97, 107, 117 |
| `number_seq_fill {step:5 / 10}` | 1, 6, 11 / 1, 11, 21 | 61, 66 / 46, 56 |

`skip_count_line {step:[0], band:50}` is the nearest live fit. It deals true multiples from 0, 2, 5 or 10 within 50, but it cannot keep a page to one count (2s, 5s and 10s come together), and it has no pictured pairs, hands or ten frames.

Recommended:

- Mark Y1.B9.S1-S3 `partial` with that skill.
- Add one option proposal on `seq_2`, `seq_5` and `seq_10`: "start at 0 (multiples only)" plus a `band 20 / 50 / 100`.
- Or add a single-step choice to `skip_count_line`.

This blocks the three steps. It is not a small follow-up.

## To pass round 2

1. Generate every `full` step's skills with the listed opts and a recorded range, and re-judge it (rule 1).
2. Set the opts that exist (rule 2).
3. Apply the tag fixes above.
4. Filter Y1 pre-skills by domain and use the partial skills of prior steps. In R, replace the "step before in the block" fallback with same-idea earlier steps (rule 3).
5. Remove pre/related duplicates and same-block padding (rule 4).
6. Split `pictures_change_unknown`.
7. Add the `band_3` and multiples-only proposals.

## Owner ruling 2026-10-10: keep every WRM step (checked)

The ruling: every White Rose step stays, even beyond CCSS. That covers oral steps, days and months, UK money changed to US, and above-grade steps. Each one is covered or has a build proposal; none is dropped or called "not needed".

- **All 235 steps meet the ruling.** Every R and Y1 step that is not `full` has at least one `build` entry: 0 steps are uncovered. No note or `missing` text drops a step.
- The above-grade Y1 blocks are tagged as WRM teaches them.
- These steps all keep a proposal:
  - the oral steps (R.B13.S5, R.B10.S5)
  - days and months (Y1.B14.S2/S3, `time_talk`)
  - notes (Y1.B13.S3, `money_notes`, USD default)
- **One conflict: owner question 4 in the R report.** Its suggested answer, to make R.B18 a page role and drop the `consolidate` proposal, would leave R.B18.S1/S2 with no build. Under the ruling, reject that answer: R.B18.S1/S2 keep `consolidate` (or a named review skill) as their build.
- Y1 report question 1 (the xlsx-only "Build and draw shapes" and "Compose shapes") is not a WRM step and is unaffected.
- Y1 report question 2 (US bills) agrees with the ruling.
