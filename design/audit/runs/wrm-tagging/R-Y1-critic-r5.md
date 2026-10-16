# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 5

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `1d7d6956`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r4.md`
  - the round-5 sections of `R-report.md` and `Y1-report.md`
  - `data/curriculum/links/R.json` and `Y1.json`
  - `gen.py`, `spec.py`, `maxdealt.mjs` and `content_weeks.json`
  - the Kindergarten sheet of `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r5/`.

## Verdict: FAIL

| Year | Steps scored | Mean | 7 | 8 |
|---|---|---|---|---|
| R | 25 (20 random + 5 hard) | **7.84** | 4 | 21 |
| Y1 | 25 (20 random + 5 hard) | **7.64** | 9 | 16 |

- **Means.**
  - Random draws alone: R **7.90**, Y1 **7.75** (round 4: 7.70 / 7.85).
  - The round-4 failing steps were re-checked separately. R: 10 of 10 now score 8. Y1: 4 of 6 score 8; Y1.B12.S7 and Y1.B12.S2 stay at 7, for the new defects below.
  - No step scores below 7.
- **Every round-4 defect is fixed.** This covers D1, D2 and D3 and the whole minor list (section 1). The tagger's six scans
  are at 0 on my fresh re-run as well.
- **The tagger's two "false positive" claims.**
  - (b) is right.
  - (a) is right about the word, but the link behind it is not clean (section 2).
- **Three new systematic defect classes, and four minor ones.** None of them is a size or school-week error: those
  checks are clean. All three main classes are related-link and why defects that the generator's checks do not look at:
  1. **N1: block padding passed off as "a later step on this idea" (rule 4 / rule 10).** There are 28 related links where
     the cited step is a different idea. About 17 of them plainly do not share the idea: "Doubles" related to a word
     problem about the difference, "Number bonds to 10" related to subtraction on a line, "Count from 50 to 100" related
     to < > compare. The cause is the `len(rel) < 2` fallback in `gen.py`. It accepts any later step of the same
     *family* in the same block, and labels it "on this idea".
  2. **N2: `pictograph_intro {}` has a false why on 14 links (R 4, Y1 10).**
     - The why is "compare two rows of pictures: which has more" or "the sorted groups … counted".
     - Over 60 items, the skill never asks "which has more". 25 of the 60 ask "How many MORE fish than cats?", which is a
       difference (subtraction) question.
     - The skill has a `forms` option, and `{forms:[0]}` gives "How many?" only (0 of 30 items ask "how many more").
  3. **N3: Reception related links to written Kindergarten responses (rule 18).**
     - `time_hour` and `time_half_hour` ("Write the time. 12:30") are related on R.B10.S5 and R.B10.S6.
     - `arrays_groups {forms:[1]}` ("___ groups of ___ make ___ in all", totals to 25) is related on R.B16.S1.
     - The tagger's own note on R.B6.S4 rules out the same three time skills as "left out here (rules 8 and 18)". The
       files contradict themselves.

## Method

- **Sample.** I used a new seed, `random.Random(55055).sample(steps, 20)`, in file order.
  - R random: B1.S3, B2.S5, B3.S2, B5.S2, B5.S5, B6.S1, B7.S1, B7.S7, B10.S1, B10.S5, B11.S2, B11.S12, B12.S6, B14.S4,
    B15.S3, B15.S5, B16.S3, B16.S4, B17.S7, B17.S8.
  - R hard: B16.S1 (sharing), B10.S6 (time), B11.S4 (subitising to 10), B13.S4 (teens), B18.S2 (patterns review).
  - Y1 random: B1.S3, B1.S12, B1.S15, B2.S10, B2.S13, B2.S16, B3.S3, B4.S4, B5.S8, B6.S2, B6.S5, B8.S4, B9.S4, B10.S6,
    B11.S1, B11.S3, B12.S4, B12.S5, B14.S3, B14.S4.
  - Y1 hard: B5.S4 (doubles, W17), B10.S5 (quarter, W37), B12.S1 (W10), B2.S7 (bonds to 10, W14), B9.S8 (grouping, W33).
  - The round-4 failing steps were all re-checked: R.B5.S4, B7.S5, B9.S9, B11.S3, B11.S10, B16.S6, B15.S2, B11.S12, B14.S4,
    B9.S10; Y1.B6.S6, B12.S7, B12.S2, B13.S4, B9.S4, B4.S9.
- **Generation.** Every item came through `generateQuestionFor`, the print path. I used seeds the earlier rounds had not
  used:
  - **Sampled steps:** 8 items per direct and partial skill+opts, seeds 160001 + 31i (`itemsR.txt`, `itemsY.txt`).
  - **Whole-file scan:** every one of the 143 distinct skill+opts signatures in the two files, 60 items each, seeds
    140021 + 31i (`sigs.json`, 0 errors).
  - **Rule-19 content classes:** 60 items per Y1 link signature, seeds 150001 + 31i (`r19sig.json`).
- **Whole-file scans.** These were re-run:
  - `rceil`, `r19`, `y1eq`, `scan2`, `notefacts` (469 claims), `optcheck` (1,177 values), `linkfit`, `chkstruct`,
    `dpflags`.
  - New this round:
    - `eqweek.py`: every Y1 equation, number-line and skip-count link against its school week.
    - `priorwk.py`: every "school prior learning, week Wnn" pre against the xlsx week and its prior-learning list.
    - `stalewhy.py`: whys that cite a step whose numbers the link does not reach.
    - `famonly.py`: "later step on this idea" links whose cited step is a different idea, using gen.py's own `SUBS`.
    - `whys.txt`: every distinct why per signature, read against the items.
    - `where.py`: where a key is used.
- **Scale.** The same 6 / 7 / 8 scale as rounds 1-4. An 8 means right in every respect the brief asks.

## 1. Round-4 defects: all fixed (fresh seeds)

| Round-4 item | Status | Evidence (round 5) |
|---|---|---|
| D1. R equation and number-line links | **fixed** | `rceil`: 0 links. No `nl_*`, `number_line_*`, `missing_add_sub`, `add_three`, `add_10_*`, `number_families_add` or `cloze_addition` key appears in any R pre or related link (the 53 R link signatures were listed by hand). "One jump" whys: 0. |
| D1. R ceilings by title or block | fixed | 0 links over `max(1.5c, c+2)` for the block ceilings (B3 = 3, B5 / B7 = 5, B9 = 8, B11 = 10, B16 = 12). |
| D2. `content_weeks.json` | **fixed** | It matches the Kindergarten sheet: number line W05; Count in 10s W09; Write number sentences W11; add / take away W14; equal groups W19; Make arrays W20; Measure using objects W24; Count in 2s / 5s W33; notes W35; clock W36; half W36. The sheet's "Subtraction - find a part" is W12, so W14 for subtraction sentences is stricter than needed. That is harmless. |
| D2. 18 links and Y1.B4.S9 | **fixed** | `r19` (60 items per signature) is at 0 and `y1eq` is at 0. `eqweek.py`: every Y1 equation or number-line pre now sits at W14 or later, and every `skip_count_line {step:[0]}` pre at W33 or later. Y1.B4.S9 is partial, names the sentence leak, and builds `nl_20`. |
| D3. `number_word_form {range:10}` | **fixed** | It is linked nowhere. `maxdealt.mjs` records `distinct`, and links with fewer than 3 distinct items in 24 are refused. |
| `halve` band 10; doubles to 20 out of R pre | fixed | No `halve {band:20}`, `double` or `doubles_near_doubles` appears in any R link. |
| R.B14.S4 | fixed | Count back is first, then the count and the add-more picture. The doubles are gone. |
| R.B16.S6 | fixed | The pre are count frame, same groups and add-more. `missing` says the skill deals doubles to 20. |
| R.B9.S10 | fixed | The dice subitising pre comes first. |
| R.B15.S2 | fixed | `{forms:[1], shapes:[0,1,2]}`. |
| R.B11.S10 | fixed | Related: none. The note gives each reason; `make_ten` is now a pre. |
| R.B1.S6 | fixed | `preBuild` is `['match_same','odd_one_out']`. |
| Y1.B12.S7 | fixed | `unit_form {band:99}` is first, then `base10_build`, then `more_less_10`. See N2 for its related link. |
| Y1.B6.S6 | fixed | The pre are the track and chart to 50. `missing` names the 51-100 leak (W10). |
| Y1.B3.S4 | fixed | The partial is `{forms:[0], band:4}`. |
| Y1.B12.S2 / B13.S4 / B9.S4 | fixed | 0 pre on 2s or 5s before W33. `tens_foundation_visual {band:50}` leads, and `multiples_from_0` is in `preBuild`. |
| Y1.B9.S9 `halve {band:10}` | **accepted as not added** | Halving a quantity is Kindergarten W38, and `halve` is no Reception step's direct skill. The tagger's rule-19 reason holds. |
| "size, content or school week" wording | fixed | 0 occurrences. Each reason is now one fact. |
| Notes, mechanical claims | ok | `notefacts`: 469 claims, 0 false. `priorwk.py`: 173 "school prior learning" pre, and 173 of 173 match the step's xlsx week and appear in that week's prior-learning list. `scan2`: 0 pre cite a step the school teaches later. |
| Structure | ok | `chkstruct`: 0 caps over 8, 0 pre ∩ related, 0 direct in related, 0 build in preBuild, 0 verdict inconsistencies. `optcheck`: 1,177 values, 0 invalid. |

## 2. The tagger's two "false positive" claims

### (a) `linkfit`: 4 `partition_shapes {parts:[2]}` pre links on Y1.B10 flagged for "divided"

- **About the word, the claim is right.** "How many equal parts is this shape divided into?" is not division, so the × ÷
  flag is spurious.
- **But the scan hid a real problem.** `linkfit` exempts `partition_shapes` from the fraction flag.
  - `parts:[2]` is the **Fourths** value.
  - 30 of 60 items are "What fraction of the shape is shaded?" with typed answers "2/4" (14), "1/4" (9) and "3/4" (7).
  - These are written, non-unit fractions for a Kindergarten pupil. WRM Y1 says "a quarter", one of four equal parts,
    with no notation. The same holds for the direct skill (see M3).
  - On Y1.B10.S4 "Find a half of a quantity", the link is a quarter-of-a-shape skill. It is not a building block of
    halving a quantity.
- **The fix is not a different form.** `{parts:[2], forms:[0]}` gives one item ("How many equal parts? 4") 30 times, so the
  degenerate check would refuse it. Drop the four pre links (see the fix list).

### (b) `chkstruct`: 9 links on R.B3.S6, R.B5.S7 and R.B9.S5

- **The claim is right.** The regex reads "Composition **of 1**, 2 and 3" as ceiling 1. The real ceilings are 3, 5 and 8.
- **The links:**
  - On R.B3.S6: `count_objects {band:5}`, `ten_frame_build {band:5}` and `compare_groups {band:5}`. They deal to 5, which
    is the lowest live band and within `max(1.5×3, 3+2) = 5`. The why says "band 5 until band 3 exists".
  - On R.B9.S5: the band-10 links deal to 10, which is within 12.
- No action is needed. The regex should take the largest number in the title.

## 3. New defects

### N1: related "later step on this idea" that is not this idea (systematic, rule 4 / rule 10)

**Cause.** `gen.py` lines 320-323: when a step has fewer than 2 related links, it adds any later step for which
`related_topic(step, x)` is non-zero **and** `info[x]['block'] == s['block']`. That means a step of the same *family*
("calc") in the same block, so doubles, bonds, add, sub and fact are all one family. The why is still written "a later
step on this idea".

**Size.** `famonly.py`, which uses gen.py's own `SUBS`, finds 28 such links where the sub-idea differs.

The clearly wrong ones:

| Step (week) | Related link | Cited step | Why it is not the idea |
|---|---|---|---|
| Y1.B5.S4 Doubles (W17) | `sub_20_no_regroup`, `comparison_word` | B5.S6 Subtract ones; B5.S8 Finding the difference | Doubles are neither subtraction nor a comparison word problem. |
| Y1.B5.S5 Near doubles (W17) | the same two | the same | as above |
| Y1.B5.S1 Add by counting on (W16) | `comparison_word` | B5.S8 | "How many FEWER trees does James have than Amir?" is not counting on. |
| Y1.B5.S2 Add ones using bonds (W16) | `comparison_word` | B5.S8 | as above |
| Y1.B5.S3 Bonds to 20 (W17) | `comparison_word` | B5.S8 | as above. `sub_20_no_regroup` (B5.S6 subtract ones using bonds) does share the idea; keep it. |
| Y1.B2.S7 Number bonds to 10 (W14) | `nl_sub`, `add_10_mixed` | B2.S16 Subtraction on a line; B2.S17 Add or subtract 1 or 2 | Neither is a bond. |
| Y1.B2.S9 Add more (W14) | `nl_sub` | B2.S16 | Subtraction on a line is not adding more. |
| Y1.B2.S10 Addition problems (W15) | `nl_sub` | B2.S16 | as above |
| Y1.B12.S1 Count from 50 to 100 (W10) | `compare {band:99}` | B12.S6 Compare same tens (W34) | Counting is not comparing. |
| Y1.B12.S2 Tens to 100 (W10) | `compare {band:99}` | B12.S6 | as above |
| Y1.B12.S3 / B12.S4 | `compare {band:99}` | B12.S6 | B12.S3 is partitioning and B12.S4 is the 0-100 line; both are weaker still. |
| R.B9.S10 / R.B11.S4 (subitising) | `number_seq_fill` | Y1.B1.S6 Count on from any number | Subitising is not counting on. |

**Acceptable**, though the link is family-only: R.B9.S5 / S7 / S8 → `add_5_pictures` (a double is two equal groups
combined), Y1.B10.S1 / S2 → `halve` (half of a quantity), Y1.B5.S6-S9 → `cloze_addition` (missing-number facts), and
Y1.B2.S13 → `nl_sub` (the family's subtraction facts on a line).

### N2: `pictograph_intro {}`: a false why, and difference items (systematic, 14 links)

**Where.**
- R related: B1.S4, B1.S5, B1.S7, B11.S2.
- Y1 related: B1.S1, B1.S10, B1.S11, B1.S12, B1.S13, B1.S14, B4.S11, B4.S12, B12.S6, B12.S7.

**What it deals.** Over 60 items, 25 are "How many more X than Y?" (a difference) and 35 are "How many X?". None asks
which row has more.

**Why this matters.** The whys say "which has more" or "counted". For PK4 / K sort and compare steps (W03-W07), a
"how many more" difference is the comparison-subtraction of Y1.B5.S8 (W18).

### N3: Reception related links with written Kindergarten responses (rule 18; 5 links, 3 steps)

| Step | Link | What it deals |
|---|---|---|
| R.B10.S5 Talk about time | `time_hour`, `time_half_hour` | "Write the time." Answers 12:00 and 12:30 (a K W36 skill) |
| R.B10.S6 Order and sequence time | as above | as above |
| R.B16.S1 Explore sharing | `arrays_groups {forms:[1], range:10}` | "___ groups of ___ make ___ in all": three blanks, totals 4-25. `range:10` is ignored; the skill has no band. |

- The tagger leaves out the same time skills on R.B6.S4 "My day and night", with the reason "rules 8 and 18". It also
  leaves out `arrays_groups` on R.B16.S3 ("it deals numbers to 25, past this step (12)").
- The R block ceiling scan misses these because `measurement:time_*` and `multiplication:` are outside the number-skill
  pattern.

### Minor (not systematic; fix with the round)

- **M1. `nl_sub` with mixed unknowns on Kindergarten full directs.**
  - Y1.B2.S16 "Subtraction on a number line" (W16) and Y1.B5.S7 "Subtraction - counting back" (W18) use `nl_sub {range}`.
  - The default `unknown:'mixed'` deals "? − 4 = 3" and "8 − ? = 4" in 20 of 60 items. Start-unknown is 1.OA.D.8, not
    the K step.
  - `{unknown:'answer'}` exists, and gives 20 of 20 "8 − 3 = ?".
  - The same applies to the 8 `nl_sub` / `nl_add` pre and related links.
- **M2. Teen steps padded with counting to 100 (rule 3 filter).**
  - Y1.B4.S2, S3, S4, S5 and S6 (W21-22, "Understand 10 … 20") each take `number_seq_fill {range:100}` and
    `hundreds_chart_fill {band:100}` as pre, citing "Y1.B12.S1 Count from 50 to 100 (earlier, same idea: tens)".
  - The size is legal by school week (W10). But counting from 50 to 100 on a track is not a building block of "14 is a ten
    and 4 ones", and it is a different cluster (K.CC.A.1 against K.NBT.A.1). Items such as "What number goes in the
    empty box? 72" sit on a teens step.
- **M3. `partition_shapes`: typed fraction notation on Kindergarten `full` steps.**
  - Y1.B10.S5 "Recognise a quarter" is full with `{parts:[2]}`. Half its items need the typed answers "1/4", "2/4" or
    "3/4", which are non-unit fractions with notation.
  - Y1.B10.S1 "Recognise a half" is full with `{parts:[0]}`. Half its items need the typed answer "1/2".
  - Neither step's skill ever shows an unequal split ("is this a half?").
  - Both should be partial, and the existing `halves_quarters_only` proposal should close them.
- **M4. `add_three` as a pre in Kindergarten.**
  - Y1.B2.S7 (W14), B5.S2 (W16) and B5.S6 (W18) take `add_three {band:10}` ("5 + 1 + 4 = ?"), citing R.B11.S10.
  - A three-addend sum is 1.OA.A.2, and it is not a building block of two-part bonds. R.B11.S10 itself marks this skill
    as abstract.
- **Small text items.**
  - R.B13.S1 has two related whys, "the next step on this idea: Y1.B6.S1 Count from 20 to 50". The links
    (`number_seq_fill {range:10}`, `hundreds_chart_fill {band:10}`) deal 1-10.
  - Y1.B14.S3's note has two "Related:" clauses that contradict each other ("no live skill orders the months …" and then
    "Related: none; the other forms …").
  - Notes on R.B1.S1-S6 say "it deals numbers to 3, past this step (0)". That is true, but it reads oddly; say "a counting
    skill; this step has no numbers".
  - Y1.B12.S4 "The number line to 100" (W10) has 3 weak pre (count to 10, frame to 10, how many tens). The track and
    chart to 100 of Y1.B12.S1 (taught earlier in W10) and the track to 50 are missing.
- **Observation, not a defect.** The degenerate check counts distinct text plus answer. So `shape_corners_count {band:4}`
  (triangle, square and rectangle pictures, answers 3 or 4) is refused as "2 different items". Its pictures do differ.
  Losing it as a link costs nothing, but `maxdealt.mjs` could hash the cell payload or visual as well.

## 4. Per-step scores (every step under 8 has its fix)

### Reception

| Step | Score | Finding (from generated items) | Fix |
|---|---|---|---|
| R.B1.S3 Identify a set | 8 | The gap is honest, and 0 pre is true (the earlier steps are gaps). | none |
| R.B2.S5 Copy and continue patterns | 8 | The partial names the typed shape names. | none |
| R.B3.S2 Subitise 1, 2, 3 | 8 | `count_objects {band:5, objects:'dice'}` deals 1-5, and `missing` names 4 and 5. | none |
| R.B5.S2 Subitise 4 and 5 | 8 | The partial is honest. Pre `count_sequence {dir:'back'}` (1 less) is a weak block. | optional: replace it with `compare_groups {band:5}` |
| R.B5.S5 1 less | 8 | The partial says the skill deals to 10 with no objects. | none |
| R.B6.S1 Shapes with 4 sides | 8 | Full: tap squares and rectangles. | none |
| R.B7.S1 Introduce zero | 8 | The gap and `zero` build are right. | none |
| R.B7.S7 Composition | 8 | Wholes 3-5 only; `band_3` is right. | none |
| R.B10.S1 Explore length | 8 | Full. | none |
| R.B10.S5 Talk about time | 7 | **N3:** related `time_hour` / `time_half_hour`: "Write the time 12:30" for PK4. | Related: none. Note: "clock reading is Kindergarten W36; a written time is not a Reception response". |
| R.B11.S2 Compare numbers to 10 | 7 | **N2:** related `pictograph_intro {}`, "which has more". 25 of 60 items are "how many more". | `pictograph_intro {forms:[0]}`, with the why "count two rows of a picture graph". Or drop it. |
| R.B11.S12 Make a double to 10 | 8 | The round-4 fix is in. | none |
| R.B12.S6 Copy and continue patterns | 8 | Right. | none |
| R.B14.S4 How many did I take away | 8 | The round-4 fix is in (count back first). | none |
| R.B15.S3 Manipulate shapes | 8 | Full; pattern-block hexagons. | none |
| R.B15.S5 Compose shapes | 8 | Full. `compose_hexagon` is a picture-block drag. | none |
| R.B16.S3 Explore grouping | 8 | The partial is honest. | none |
| R.B16.S4 Grouping | 8 | Full: groups from 12 counters, pictured. | none |
| R.B17.S7 Give instructions | 8 | Right. | none |
| R.B17.S8 Explore mapping | 8 | Right. | none |
| R.B16.S1 Explore sharing (hard) | 7 | **N3:** related `arrays_groups {forms:[1]}`: three blanks, totals to 25, for PK4. | Drop it. Related: `share_into_groups {band:12}` only. |
| R.B10.S6 Order and sequence time (hard) | 7 | **N3**, as R.B10.S5. | As R.B10.S5. |
| R.B11.S4 Subitising to 10 (hard) | 8 | The gap is honest. Related `make_ten` (parts seen at a glance) is fair. `number_seq_fill` "count on" is weak (N1). | Drop `number_seq_fill`. |
| R.B13.S4 Teens 14-20 (hard) | 8 | The partials name the leak below 14. | none |
| R.B18.S2 Patterns and relationships (hard) | 8 | The partial names the typed-name response. `consolidate` is right. | none |

All 10 re-checked round-4 failing steps score 8 (section 1).

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S3 Count from a larger group | 8 | The partial is honest (counting out). | none |
| Y1.B1.S12 < > = (W04) | 7 | **N2:** `pictograph_intro {}` related. | `{forms:[0]}` with a true why, or drop it. |
| Y1.B1.S15 The number line (W05) | 8 | The gap is right. The note gives the right week reasons. | none |
| Y1.B2.S10 Addition problems (W15) | 7 | **N1:** related `nl_sub` as "a later step on this idea". | Drop `nl_sub`. Keep `add_10_mixed`. |
| Y1.B2.S13 Fact families (W15) | 8 | Full. `nl_sub` is acceptable here (the family's subtraction facts). | Set `{unknown:'answer'}` on `nl_sub` (M1). |
| Y1.B2.S16 Subtraction on a line (W16) | 7 | **M1:** the full direct `nl_sub {range:10}` deals start and change unknowns in 20 of 60 items. | `nl_sub {range:10, unknown:'answer'}`. |
| Y1.B3.S3 Name 2-D shapes (W31) | 8 | Full. Pentagons and hexagons are in the WRM step. | none |
| Y1.B4.S4 Understand 14-16 (W21) | 7 | **M2:** pre `number_seq_fill {range:100}` and `hundreds_chart_fill {band:100}` (counting 50-100) on a teens step. | Drop both. Add `count_sequence {band:20, dir:'forward'}` (Y1.B4.S1, W05). |
| Y1.B5.S8 Finding the difference (W18) | 8 | The partial is honest. | none |
| Y1.B6.S2 20, 30, 40, 50 (W08) | 8 | The partial names "how many tens only". | none |
| Y1.B6.S5 Partition tens and ones (W23) | 8 | Full: `base10_build {band:50}`. The hundred-square pre is fair here (rows of ten). | none |
| Y1.B8.S4 Full and empty | 8 | The gap is right. | none |
| Y1.B9.S4 Equal groups (W19) | 8 | The round-4 fix is in. | none |
| Y1.B10.S6 Find a quarter (W38) | 8 | The partial names the halves and eighths leak. The pre `partition_shapes` carries M3. | See M3. |
| Y1.B11.S1 Turns | 8 | The gap is right. | none |
| Y1.B11.S3 Forwards / backwards | 8 | The gap is right. | none |
| Y1.B12.S4 The number line to 100 (W10) | 7 | The pre are thin and from Reception (count to 10, frame to 10). The track and chart to 100 (Y1.B12.S1, earlier in W10) are missing. Related `compare` (N1). | Pre: `number_seq_fill {range:100}`, `hundreds_chart_fill {band:100}`, `number_seq_fill {range:50}`, then `tens_foundation_visual {band:90}`. Drop `compare`. |
| Y1.B12.S5 1 more / 1 less to 100 (W09) | 8 | Right. | none |
| Y1.B14.S3 Months of the year | 8 | The gap is right. The note's duplicated "Related:" is a text fix. | Merge the note. |
| Y1.B14.S4 Hours, minutes, seconds | 8 | The gap is right. | none |
| Y1.B5.S4 Doubles (hard, W17) | 7 | **N1:** both related links (`sub_20_no_regroup`, `comparison_word`) are a different idea. | Related: `doubles_near_doubles {forms:[1,2]}`, "the next step on this idea: Y1.B5.S5 Near doubles". |
| Y1.B10.S5 Recognise a quarter (hard, W37) | 7 | **M3:** full, but 30 of 60 items need the typed answers "1/4", "2/4" or "3/4". | Partial, with missing "a quarter as one of four equal parts without fraction notation; equal or not equal". Build `halves_quarters_only` (reuse). |
| Y1.B12.S1 Count from 50 to 100 (hard, W10) | 7 | The partial and pre are right. Related `compare {band:99}` (N1). | Drop `compare`. Keep `unit_form`. |
| Y1.B2.S7 Bonds to 10 (hard, W14) | 7 | **M4:** pre `add_three`. **N1:** related `nl_sub` and `add_10_mixed`. | Drop `add_three`. Related: none (note why), or `number_bonds {band:10, unknown:'second'}`. |
| Y1.B9.S8 Grouping (hard, W33) | 8 | Full. 2 pre, with a true note. | none |

Round-4 failing steps, re-checked:

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B6.S6 | 8 | Fixed. | none |
| Y1.B13.S4 | 8 | Fixed. | none |
| Y1.B9.S4 | 8 | Fixed. | none |
| Y1.B4.S9 | 8 | Fixed. | none |
| Y1.B12.S7 | 7 | Its pre are fixed. N2 `pictograph_intro` related (dot rows to 5 on a 2-digit compare step). | Drop it. |
| Y1.B12.S2 | 7 | Its pre are fixed. N1 `compare` related. | Drop it. |

## 5. Systematic checks, counted across the WHOLE files

| Check | R | Y1 | Status |
|---|---|---|---|
| Opts values invalid | 0 | 0 | ok (1,177) |
| Structure (`chkstruct`) | 0 | 0 | ok (9 title-regex false positives) |
| Equation / number-line links in R (`rceil`) | 0 | n/a | **fixed** |
| Rule 19 content and size by week (`r19` at 60 items, `y1eq`, `eqweek`) | n/a | 0 | **fixed** |
| xlsx prior-learning pre: week and list (`priorwk`) | n/a | 173 / 173 match | ok |
| Pre citing a school-later step | 0 | 0 | ok |
| Degenerate links (fewer than 3 distinct items) | 0 | 0 | **fixed** |
| Notes, mechanical claims (`notefacts`) | 0 false of 469 | | ok |
| Shape, × ÷, fraction, unit flags in links (`linkfit`) | 0 | 4 (`partition_shapes` "divided"; the fraction content is real, see 2a) | M3 |
| **N1: "later step on this idea" with a different idea** | 6 (4 acceptable) | 22 (about 17 wrong) | **FAIL** (systematic, gen.py fallback) |
| **N2: `pictograph_intro {}` false why and difference items** | 4 | 10 | **FAIL** (systematic) |
| **N3: R related to written K responses** | 5 links, 3 steps | n/a | **FAIL** (contradicts R.B6.S4's own note) |
| M1: `nl_sub` / `nl_add` mixed unknowns | n/a | 2 full directs + 8 links | minor |
| M2: count-to-100 pre on teen steps | n/a | 10 links, 5 steps | minor |
| M3: typed fraction notation on full K steps | n/a | 2 directs + 4 pre | minor |
| M4: `add_three` pre in K | n/a | 3 | minor |

## Fix list for round 6 (skill, opts, step)

1. **N1 (gen.py).**
   - In the `len(rel) < 2` fallback (lines 320-323), require `related_topic(step, x) == 2` (the same sub-idea), and drop
     the `or (related_topic(step, x) and same block)` branch.
   - Then re-check these steps. Each should be left with related: none plus a note, or a real same-idea link:
     - Y1.B5.S4 Doubles: `number_sense:doubles_near_doubles {forms:[1,2]}`, why "the next step on this idea: Y1.B5.S5
       Near doubles".
     - Y1.B5.S5 Near doubles: `patterns:double {band:20}`, why "the double the near double comes from", but only if it
       is not already a pre. Otherwise related: none.
     - Y1.B5.S1, S2, S3: drop `comparison_word`. Y1.B5.S1 keeps `sub_20_no_regroup` (the inverse). Y1.B5.S3 keeps
       `sub_20_no_regroup` (subtract ones using bonds).
     - Y1.B2.S7, S9, S10: drop `nl_sub`. On Y1.B2.S7 also drop `add_10_mixed`.
     - Y1.B12.S1, S2, S3, S4: drop `placevalue:compare {band:99}`.
     - R.B9.S10 and R.B11.S4: drop `number_seq_fill`, which is "count on".
   - Keep the acceptable family links named in section 3, with a precise why: "a double is two equal groups combined",
     "half of a shape, then half of a quantity".
2. **N2.** Every `measurement:pictograph_intro` link becomes `{forms:[0]}`.
   - Why on sort steps (R.B1.S4 / S5, Y1.B1.S1): "the sorted groups as rows of a picture graph, counted".
   - Why on compare steps (R.B1.S7, R.B11.S2, Y1.B1.S10-S14, Y1.B4.S11 / S12): "count two rows of a picture graph".
   - Drop it on Y1.B12.S6 / S7, which are 2-digit compare.
   - Add `pictograph_intro` to the content classifier: a `how many more` item is a difference, and the school teaches it
     at W18.
3. **N3.**
   - Remove `measurement:time_hour` and `measurement:time_half_hour` from related on R.B10.S5 and R.B10.S6. Use the same
     note as R.B6.S4: "left out here (rules 8 and 18)".
   - Remove `multiplication:arrays_groups` from R.B16.S1.
   - In gen.py, put `measurement:time_*`, `measurement:clock_*` and `multiplication:*` into the Reception no-link set, and
     into the R ceiling check.
4. **M1.** Add `unknown:'answer'`:
   - `subtraction:nl_sub {range:10, unknown:'answer'}` on Y1.B2.S16
   - `{range:20, unknown:'answer'}` on Y1.B5.S7
   - every `nl_sub` / `nl_add` pre and related link (Y1.B2.S7 / S9 / S10 / S13 / S15 / S17, Y1.B5.S7 / S8)
5. **M2.**
   - Y1.B4.S2-S6: drop the `number_seq_fill {range:100}` and `hundreds_chart_fill {band:100}` pre. Keep the teen frames.
   - Add `counting:count_sequence {band:20, dir:'forward'}` (Y1.B4.S1, W05) where a slot is free.
   - Keep `tens_foundation_visual` only on Y1.B4.S2 "Understand 10", where it is the idea of one ten.
6. **M3.**
   - Y1.B10.S1 and Y1.B10.S5 become partial, with the missing clause "recognising a half (a quarter) as one of 2 (4) equal
     parts, and equal or not equal, without written fraction notation (half the items ask for typed 1/2, or 1/4, 2/4,
     3/4)". Reuse `halves_quarters_only`.
   - Drop the `partition_shapes {parts:[2]}` pre on Y1.B10.S4, S6, S7 and S8. With `forms:[0]` it is degenerate.
7. **M4.**
   - Drop the `addition:add_three` pre on Y1.B2.S7, Y1.B5.S2 and Y1.B5.S6.
   - Y1.B2.S7's bond building blocks are already there (`number_bonds {band:5}`, `ten_frame_build {band:10}`).
8. **Text.**
   - R.B13.S1: re-cite both related whys as "the same idea in another form: the number track / the hundred square to 10".
   - Y1.B14.S3: merge its two "Related:" clauses.
   - R.B1 notes: replace "past this step (0)" with "a counting skill; this step has no numbers".
9. **Scan fix.** In `chkstruct` (critic) and any tagger copy, take the title ceiling as the largest number in the title,
   not the first number after "of".

On round 6, the means would reach R ≥ 8.0 and Y1 ≥ 8.0 once N1-N3 are fixed. Every 7 in section 4 traces to N1, N2, N3,
M1, M2, M3 or M4.
