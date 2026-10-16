# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 6

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `aa955ad4`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r5.md`
  - the round-6 sections of `R-report.md` and `Y1-report.md`, and `R-Y1-items.md`
  - `data/curriculum/links/R.json` and `Y1.json`
  - `gen.py` (`SUBS`, `topic2`, the related fallback, `check_claims`), `spec.py` and `maxdealt.mjs`
  - the Kindergarten and Grade 1 sheets of `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r6/`. The r5 scans were re-run, and five new scans were added:
  - `rel.py`: every related link with its why and the step's school week
  - `tmpl.py`: every "at this step's size" why
  - `norel.py`: the steps with no related link, and a seeded sample of 15
  - `bb.py`: earlier same-idea Y1 skills missing from pre
  - the inline "(see preBuild)" and "past this step (N)" note checks
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.

## Verdict: FAIL

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 28 (20 random + 5 hard + 3 more r5 sevens) | **7.86** | 4 | 24 | 7.95 |
| Y1 | 34 (20 random + 5 hard + 9 more r5 sevens) | **7.79** | 7 | 27 | 7.80 |

- **Means and floor.** Both means are below 8. No step scores below 7.
- **Round-5 steps that scored 7.** 15 were re-scored (R 4, Y1 11). 12 now score 8. Three stay at 7: Y1.B2.S7, Y1.B2.S10 and
  Y1.B5.S1, all because of M1 below.
- **What is fixed.** N2, N3, M2, M3 and M4 are fully fixed on fresh seeds. Every mechanical scan is still at 0: size,
  school week, prior-learning list, option validity and structure.
- **Systematic classes.** There are three, plus four minor items:
  1. **N1r.** The round-5 N1 fix only moved the check from family to sub-idea. `topic2` gives every unmatched title the
     default sub-idea `count`, and `shape2d` covers naming, comparing and composing alike. As a result, 10 Reception
     related links still claim "a later step on this idea" or "the same idea" for a different idea.
     - This includes the two links that round 5 asked to be dropped (R.B9.S10 and R.B11.S4). The R report says they
       were dropped. They were not.
  2. **N4. The new refit why, "the same idea in another form: <label>, at this step's size", is false in 9 of its 13
     uses.**
     - `compose_shapes {shapes:[0,1]}` is a triangle or square/rectangle composite. It sits on the circle-and-triangle
       steps, and 40 of its 60 answers are "Square" or "Rectangle".
     - Band-10 tracks sit on the 10-13 step.
     - `base10_build {band:20}` never builds 20, yet it sits on "Understand 20".
  3. **M1r.** `nl_add {range:10}` has no `unknown`. It is on 8 Kindergarten related links, and deals start- and
     change-unknown items in 20 of 60 items. The Y1 report says "every link" got `{unknown:'answer'}`; only `nl_sub` did.
- **The 141 steps without a related link (section 3).** These are mostly honest. Of the 15 sampled, 14 are right and 1
  has a missed link (Y1.B5.S8). Outside the sample I found 3 more steps whose stated reason is false and which hide a
  fitting link (Y1.B6.S3, Y1.B2.S14, Y1.B2.S8).

## Method

- **Sample.**
  - Random draw: `random.Random(60606).sample(steps, 20)`, in file order.
  - R random: B3.S2, B5.S6, B6.S3, B7.S2, B7.S4, B9.S2, B9.S3, B10.S1, B10.S6, B13.S4, B13.S5, B14.S3, B15.S2, B15.S3,
    B15.S6, B15.S7, B16.S3, B16.S5, B17.S5, B17.S9.
  - R hard: B9.S10 (subitising), B4.S1 (first shape step), B13.S1 (10-13), B11.S10 (3-part bonds), B16.S6 (doubles).
  - R round-5 sevens: B10.S5, B10.S6 (in the random draw), B11.S2, B16.S1.
  - Y1 random: B1.S15, B2.S14, B3.S1, B3.S4, B4.S1, B4.S11, B4.S12, B5.S8, B6.S3, B9.S9, B10.S1, B10.S5, B10.S8,
    B11.S1, B11.S4, B11.S5, B12.S4, B12.S6, B14.S1, B14.S5.
  - Y1 hard: B5.S1 (W16), B9.S7 (W20), B10.S4 (W38), B13.S4 (coins, W11), B6.S7 (estimate to 50, W09).
  - Y1 round-5 sevens: B1.S12, B2.S7, B2.S10, B2.S16, B4.S4, B5.S4, B10.S5 and B12.S4 (both in the random draw), B12.S1,
    B12.S2, B12.S7.
  - No-related spot check: `random.Random(66066).sample(no_related_steps, 15)`.
- **Generation.** I used seeds that no earlier round had used:
  - **Whole-file scan:** all 145 distinct skill+opts signatures in the two files, 60 items each, seeds 240021 + 31i
    (`sigs.json`, 0 errors).
  - **Rule-19 content classes:** 108 Y1 link signatures, 60 items each, seeds 250001 + 31i (`r19sig.json`).
  - **Sampled steps and spot checks:** seeds 330001 + 31i and 360001 + 31i. 60 items were generated for every claim
    judged in this report: `nl_add`, `nl_sub`, `pictograph_intro` forms 0 and 1, `compose_shapes {shapes:[0,1]}`,
    `equal_sign`, `compare_groups`, `skip_count_line`, `more_less_10` and `base10_build` (80 items).
- **Option labels read from `skill-options.js`.**
  - `compose_shapes.shapes`: 0 = "A triangle", 1 = "A square or a rectangle", 2 = "A hexagon".
  - `pictograph_intro.forms`: 0 = "How many?", 1 = "How many more?".
  - `nl_add` and `nl_sub` `unknown`: `answer` = "Where it lands". The default is `mixed`.
- **Scale.** The same 6 / 7 / 8 scale as rounds 1-5. An 8 means right in every respect the brief asks.

## 1. Round-5 defects, re-checked on the print path with fresh seeds

| Round-5 item | Status | Evidence (round 6) |
|---|---|---|
| N1, gen.py fallback | **partly fixed** | The same-block, same-family branch is gone, and `famonly.py` (gen.py's own `SUBS`) is at 0. But the sub-idea test inherits two coarse buckets. `topic2` returns `('count','count')` for any title no rule matches: Find 6, 7 and 8; Represent; Subitise; Conceptual subitising; Count on from any number. `shape2d` matches naming, comparing, combining and composing. The 10 links this lets through are in section 2 (N1r). |
| N1, R.B9.S10 / R.B11.S4 `number_seq_fill` | **not fixed** | Both still relate `number_seq_fill {step:1, dir:'forward', range:10}`, with the why "a later step on this idea: Y1.B1.S6 Count on from any number". The R report says "R.B9.S10 / R.B11.S4 drop `number_seq_fill`". That is false. |
| N1, Y1 links named in round 5 | fixed | `comparison_word` is gone from Y1.B5.S1-S3. `nl_sub` is gone from Y1.B2.S7 / S9 / S10, and `add_10_mixed` from Y1.B2.S7. `compare {band:99}` is gone from Y1.B12.S1-S4. |
| N2, `pictograph_intro` | **fixed** | 12 links, all `{forms:[0]}`. 0 of 60 items ask "how many more". The whys are true ("count two rows", "the sorted groups … counted"). It is dropped from Y1.B12.S6 / S7. |
| N3, Reception clock and groups-of links | **fixed** | 0 `measurement:time_*`, `clock_*` or `multiplication:*` links in any R pre or related list. |
| M1, `nl_sub` | fixed | Y1.B2.S16 and Y1.B5.S7 use `{unknown:'answer'}`. 60 of 60 items are "a − b = ?". |
| M1, `nl_add` | **not fixed** | `nl_add {range:10}` with no `unknown` is a related link on Y1.B2.S7, S9, S10, S17 and Y1.B5.S1, S2, S3, S6. Over 60 items, 20 are "? + b = c" or "a + ? = c". The Y1 report says "every link" got `unknown:'answer'`. |
| M2, count-to-100 pre on teen steps | **fixed** | Y1.B4.S2-S6 carry `count_sequence {band:20, dir:'forward'}` and the teen frames. `tens_foundation_visual` is on Y1.B4.S2 only. |
| M3, typed fraction notation | **fixed** | Y1.B10.S1 and S5 are partial, with `halves_quarters_only`. 0 `partition_shapes` pre remain on S4 and S6-S8. (The proposal itself still does not close S1 / S5. See D5.) |
| M4, `add_three` | **fixed** | It is not a pre or related link anywhere in R or Y1. |
| Text items | **fixed** | Y1.B14.S3 has one Related clause. The R.B1 notes read "a counting skill; this step has no numbers". R.B13.S1's whys were re-cited, but the new text is false (N4). |
| Mechanical scans | ok | All at 0: `rceil`, `r19` (60 items per signature), `scan2`, `linkfit` and `famonly`. `notefacts` checked 482 claims and found 0 false. `priorwk` matched 159 of 159 to the step's xlsx week and its prior-learning list. `optcheck` checked 1,164 values, 0 invalid. `chkstruct` finds 0 caps, overlaps or verdict errors; its 9 flags are the known title-regex false positives (see 3c). |

## 2. New defects

### N1r: "later step on this idea" or "the same idea" for a different idea (systematic in R, 10 links)

| Step | Related link | Why it is not the idea |
|---|---|---|
| R.B9.S10 Conceptual subitising | `number_seq_fill {range:10}`, "a later step on this idea: Y1.B1.S6 Count on" | Round 5 named this link and the report says it was dropped. Subitising is not counting on. |
| R.B11.S4 Conceptual subitising to 10 | as above | as above |
| R.B9.S1 Find 6, 7 and 8; R.B9.S2 Represent 6, 7 and 8; R.B11.S1 Find 9 and 10; R.B11.S3 Represent 9 and 10 | as above | Finding or representing a quantity is cardinality. Filling a track from a start number is the count sequence. All five titles match no `SUBS` rule, so they fall to the default `count`, as "Count on from any number" does. |
| R.B4.S1 Identify circles and triangles; R.B4.S2 Compare circles and triangles; R.B4.S3 Shapes in the environment; R.B6.S1 Shapes with 4 sides | `compose_shapes {shapes:[0,1]}`, "the same idea in another form: Combine Shapes (Visual), at this step's size" | Composing two shapes into one is R.B15, a different idea. On the three R.B4 steps, 40 of 60 answers are "Square" (21) or "Rectangle" (19), and 4-sided shapes are first taught at R.B6.S1 (rule 18 content). `shapes:[0,1]` reads as "circles and triangles" on `name_2d_shapes`, but on `compose_shapes` it means "triangle; square or rectangle". |

**Cause.** In gen.py `topic2`, an unmatched title falls back to `return 'count', 'count'`. The `shape2d` regex (`shape|circle|triangle|2-d|sides`) puts identify, compare, combine and compose into one sub-idea. `check_claims` therefore passes these links.

### N4: the refit why "…, at this step's size" is false in 9 of 13 uses

gen.py line 333 writes this why whenever a later step's own opts do not fit and `fit()` picks a smaller rung. Nothing
checks that the refitted rung still shows the step's idea or numbers.

| Step | Link | What it deals |
|---|---|---|
| R.B4.S1, S2, S3, R.B6.S1 | related `compose_shapes {shapes:[0,1]}` | composites (see N1r) |
| R.B13.S1 Build numbers beyond 10 (10-13) | related `number_seq_fill {step:1, range:10}` and `hundreds_chart_fill {band:10}` | 1-10 only. In 120 items, 0 reach 11-13. "At this step's size" is false. Round 5 asked for "… to 10". |
| R.B13.S1 | pre `count_objects {band:10, objects:'frame'}`, "(an earlier step; the same idea in another form: Count Objects (1-20) (Visual), at this step's size)" | It counts to 10. The why also prints a skill label in place of a reason. |
| Y1.B4.S6 Understand 20 | related `base10_build {band:20}`, "at this step's size" | Answers 11-19. Over 80 items it never builds 20. |
| Y1.B4.S1 Count within 20 | pre `number_seq_fill {dir:'back', range:10}`, "at this step's size" | 0-10 only. |

The 4 true uses: R.B13.S3 `hundreds_chart_fill {band:30}`, Y1.B2.S13 `missing_add_sub` and `cloze_addition {range:10}`, and Y1.B4.S1 `hundreds_chart_fill {band:20}`.

### M1r: `nl_add` mixed unknowns (8 Kindergarten related links)

The links are on Y1.B2.S7, Y1.B2.S9, Y1.B2.S10, Y1.B2.S17, Y1.B5.S1, Y1.B5.S2, Y1.B5.S3 and Y1.B5.S6.

- They all carry `addition:nl_add {range:10}`, with whys such as "the parts as two jumps on a 0-10 line".
- Over 60 items: 40 are "a + b = ?", 10 are "? + b = c" and 10 are "a + ? = c". Start-unknown is 1.OA.D.8.
- The option exists: `_opsUnknown`, with `answer` = "Where it lands".

### Minor (not systematic on their own; fix with the round)

- **D1. Whys that the items contradict.**
  - Y1.B5.S1 related `addition:equal_sign {range:10}`, "is the sentence true? the = sign". All 60 of 60 items are
    "a + b = ?" (for example "10 + 6 = ? → 16"). No item is true or false, and none shows = as a balance.
  - Y1.B5.S8 pre `comparing:compare_groups {band:10}`, "compare two groups: how many more". 0 of 60 items ask "how many
    more". It asks same or not, more or fewer.
  - Y1.B13.S1, S2 and S3 pre `skip_count_line {step:[0], band:50}`, "count in 5s and 10s". Over 60 items: 26 are 2s,
    24 are 5s and 10 are 10s. Say "count in 2s, 5s and 10s".
- **D2. Notes that point to an empty `preBuild`.** 11 steps say "the earlier steps … have no live skill yet (see
  preBuild)", but their `preBuild` lacks those steps' builds. The steps are R.B8.S1, R.B8.S2, R.B10.S1, R.B10.S2,
  R.B12.S1, R.B15.S4, R.B15.S5, R.B15.S6, Y1.B1.S1, Y1.B2.S3 and Y1.B9.S5.
  - On the R.B8 and R.B10 steps, the cited "earlier steps on this idea" are capacity steps (R.B2.S3, R.B8.S3, R.B8.S4)
    on mass and length steps, so the claim is false twice over.
- **D3. A false exclusion reason.**
  - On Y1.B1.S7 and Y1.B1.S9 the note gives `more_less_10 (< > symbols are taught from week 4)`. Over 60 items there are
    0 `<` or `>` signs: the frame is "1 more than 9 is ___".
  - The cause is the `lt` content regex in `maxdealt.mjs`, `/[<>]|greater than|less than/`, which matches "1 less than".
  - The true reason is size: the lowest band, 20, is past the step's 10.
- **D4. A step's ceiling taken from a partial skill's short range.**
  - Y1.B2.S8 "Add together (totals to 10)" and Y1.B2.S14 "Take away … from amounts to 10" use ceiling 5, which is the
    dealt maximum of the `*_5_pictures` partial. The notes then say "nl_sub / add_10_mixed: past this step (5)".
  - This contradicts each step's own `missing`. It hides the next-step links (section 3).
- **D5. `halves_quarters_only` does not close what it claims.**
  - Its `closes` names Y1.B10.S1 and S5: "a half as one of 2 equal parts, **equal or not equal, without written fraction
    notation**".
  - But its `teaches` and `representation` only restrict `shade_fraction` and `fraction_of_set` to halves or quarters.
  - Nothing in it asks "is this a half?" of an unequal split, and nothing removes the typed 1/2 (rule 13: the proposal must
    really close the step).
- **D6. Y1.B12.S6 "Compare numbers with the same number of tens" (W34) lacks its main building block (rule 14).**
  - Its 3 pre are Reception or teen rows from the xlsx list: `compare_groups {band:5}` and `teen_compose` /
    `ten_frame_build_teen {band:15}`.
  - Tens and ones (`unit_form {band:99}`, Y1.B12.S3, W23) is missing. Y1.B12.S7 has it, but `prepre` was only applied
    to S7.
- **D7. Structure.** R.B11.S2 is `partial`, but its only skill is listed under `direct`. Move it to `partial` with the
  missing clause.
- **Observation (as in round 5).** The degenerate check still ignores the picture.
  - It refuses `partition_shapes {parts:[0]}` (the Y1.B10.S1 partial) as a pre of Y1.B10.S2, and `{parts:[2]}` on
    Y1.B10.S6. Y1.B10.S6 is left with 1 pre, `halve`, which works on a quantity rather than a shape.
  - This is acceptable for now. Hashing the cell payload would fix it.

## 3. The tagger's claims

**(a) "N1, N2, N3 and M1-M4 are fixed, with a `check_claims` guard."**
- N2, N3, M2, M3 and M4 are fixed.
- N1 is fixed only as far as `SUBS` allows, and two of its named links were not dropped (N1r).
- M1 is half fixed (M1r).
- `check_claims` is real and runs at write time. It can only be as good as `topic2`, and it does not test refit whys
  (N4) or links without opts.

**(b) "Y1.B5.S4 cannot take `doubles_near_doubles` as related because it is its own direct skill; it has a note
instead."**
- Accepted.
- `patterns:double {band:20}` is already a pre.
- `halve` is excluded because halving is first taught at W36 and the step is at W17. That is rule 18 content judged by
  school week, and the note says so.
- No other live same-idea skill fits. Score 8.

**(c) "`stalewhy.py`'s 9 flags are false: rods are tens, so 5 rods = 50."**
- Accepted. `tens_foundation_visual {band:50}` asks "How many tens?" with answers 1-5, and the cited steps are about
  tens.
- One why still overstates the skill: Y1.B9.S3's "counting in 10s first: two 5s make each ten". No item shows 5s.

**`chkstruct`'s title check:** accepted. The 9 flags are the same "Composition **of 1**, 2 and 3" misreading. The links
deal to 5 and 10, within `max(1.5c, c+2)` of the true ceilings 3, 5 and 8.

**(d) "141 steps have no related link, and every one has a note giving its single reason."**
- Every one has a note. The question is whether the reasons are true and no plausible link was missed.
- The steps split as 69 in R and 72 in Y1. Half are gaps or partials on ideas that have no second live form: position,
  maps, capacity, time talk, 3-D tasks and patterns.

Spot check of 15 (`Random(66066)`):

| Step | Note's reason | My judgement | Related link that fits |
|---|---|---|---|
| R.B1.S2 Match pictures and objects | no numbers | honest | none |
| R.B1.S3 Identify a set | no numbers | honest | none |
| R.B7.S6 1 less (to 5) | tracks deal to 10, past 5 | honest (size) | none at 5 (`count_sequence` band 5 is not live; that is the `band_3` proposal) |
| R.B11.S10 Bonds to 10 (3 parts) | the others are pre or symbol equations | honest | none |
| R.B15.S7 Copy 2-D shape pictures | compose and name are pre | honest | none |
| R.B15.S8 2-D shapes within 3-D | `name_3d_shapes` is pre | honest | none (`count_edges_faces_vertices` is Grade 2) |
| R.B17.S1 Units of repeating patterns | the others are pre or direct | honest | none |
| R.B17.S6 Describe positions | the others are pre or direct | honest | none |
| R.B17.S9 Represent maps with models | no live form | honest | none |
| R.B17.S10 Own maps | no live form | honest | none |
| Y1.B1.S5 Numbers as words (W02) | the others are pre | honest | none |
| **Y1.B5.S8 Finding the difference (W18)** | "the other forms … are compare_groups (a pre-skill here)" | **missed** | `measurement:pictograph_intro {forms:[1]}`: "How many more X than Y?", answers 1-4, read off two picture rows. That is the difference in another form, and differences start at W18, this step's week. |
| Y1.B6.S5 Partition tens and ones (W23) | `unit_form` deals to 98, past 48 | honest (size; `unit_form`'s lowest band is 99) | none |
| Y1.B11.S2 Left and right | `shape_positions` is pre | honest | none |
| Y1.B11.S3 Forwards and backwards | `shape_positions` is pre | honest | none |

**Result: 14 of 15 are honest.**

Outside the sample, the note's reason is false and hides a fitting link on these steps:
- **Y1.B6.S3 Count by making groups of tens (W22).**
  - The note says "base10_build (left out here (rules 8 and 18))". In fact `spec.py:763` excludes it with the comment
    "critic scans count rods, not tens", which is a workaround for a scan rather than a rule.
  - `base10_build {band:50}` is the direct skill of the next step, Y1.B6.S4, taught in the same week.
  - Link: related `composing:base10_build {band:50}`, why "the next step on this idea: Y1.B6.S4 Groups of tens and ones".
- **Y1.B2.S14 Take away, cross out (W14).**
  - The ceiling is 5, which is false (D4).
  - Link: related `subtraction:nl_sub {range:10, unknown:'answer'}`, why "the next step on this idea: Y1.B2.S16
    Subtraction on a number line". Y1.B2.S15 already carries this exact link.
- **Y1.B2.S8 Add together (W14).**
  - The same ceiling defect (D4).
  - Link: related `addition:nl_add {range:10, unknown:'answer'}`, why "the same addition as jumps on a 0-10 line".

Verdict on (d): **largely honest**. I count 4 missed links in 141 steps (about 3%). Each traces to D1, D4 or a spec
workaround, not to a lack of skills.

## 4. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | All 116 Y1 steps map to a K-sheet lesson. Week order is used for "earlier"; for example, Y1.B1.S1 "Sort objects" is W23 on the sheet. | ok |
| xlsx prior-learning pre (`priorwk`) | n/a | 159 / 159 match the week and its list | ok |
| Grade 1 sheet | The Rec/PK4 rows appear only as prior learning | The Y1/KG rows appear as Grade 1 prior learning; no Y1 step is re-taught in Grade 1 | consistent |
| Range against the step (`rceil`, `scan2`) | 0 | 0 | ok (but see D4: two Y1 ceilings are too *low*) |
| Response mode for the age | 0 equation, number-line, clock or groups-of links in R | 0 rule-19 content violations at 60 items | ok |
| Pre count is at least 3, or a note says why | 66 steps have fewer than 3 pre; all 66 carry "Pre: n only" with the right n | | ok (11 of those notes misstate `preBuild`, D2) |
| Verdicts | Full verdicts hold on the items. R.B11.S2's list form is wrong (D7). | Full verdicts hold. Y1.B10.S1 / S5 are now honestly partial. | ok |
| Proposals (rule 13 short spec) | 32, all with `name`, `kind`, `teaches`, `closes`, `representation`; none unused or undefined | 45, the same | ok, except D5 |
| Related whys against the items | N1r 10, N4 6 | N4 3, M1r 8, D1 4 | **FAIL** |

## 5. Per-step scores (every step below 8 has its fix)

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B3.S2 Subitise 1-3 | 8 | The partial is honest. A frame as a related form of subitising is fair. | none |
| R.B5.S6 Composition of 4 and 5 | 8 | Full: wholes 3-5, mostly 5. | none |
| R.B6.S3 Shapes in the environment | 8 | The gap is right. | none |
| R.B7.S2 Find 0-5 | 8 | The partial names zero. | none |
| R.B7.S4 Represent 0-5 | 8 | Right. | none |
| R.B9.S2 Represent 6, 7 and 8 | 7 | **N1r:** related `number_seq_fill`, "a later step on this idea: Count on from any number". | Drop it. Related: none, with a note. Or use the why "the counting order to 10 on a track". |
| R.B9.S3 1 more | 8 | A track for 1 more is fair. | none |
| R.B10.S1 Explore length | 8 | Full. The note cites capacity steps and an empty `preBuild` (D2). | text: see D2 |
| R.B10.S6 Order and sequence time | 8 | The round-5 fix is in. | none |
| R.B13.S4 Teens 14-20 patterns | 8 | The partials are honest. The "1 more than" frame to 20 fits. | none |
| R.B13.S5 Verbal counting beyond 20 | 8 | Right. | none |
| R.B14.S3 Take away | 8 | Right. | none |
| R.B15.S2 Rotate shapes | 8 | Right. | none |
| R.B15.S3 Manipulate shapes | 8 | Full. | none |
| R.B15.S6 Decompose shapes | 8 | Right. D2 note. | text |
| R.B15.S7 Copy 2-D shape pictures | 8 | The gap is right. | none |
| R.B16.S3 Explore grouping | 8 | Right. | none |
| R.B16.S5 Even and odd sharing | 8 | Right. | none |
| R.B17.S5 Visualise from positions | 8 | Right. | none |
| R.B17.S9 Maps with models | 8 | Right. | none |
| R.B9.S10 Conceptual subitising (hard) | 7 | **N1r:** the link round 5 named is still there, and the report says it was dropped. | Drop `counting:number_seq_fill` from related. Related: none. |
| R.B4.S1 Circles and triangles (hard) | 7 | **N1r / N4:** related `compose_shapes {shapes:[0,1]}`. Composing is a different idea, and 40 of 60 answers are squares or rectangles before R.B6. | Drop it, and on R.B4.S2, R.B4.S3 and R.B6.S1 too. Note: "compose_shapes is R.B15's idea; its shapes:[0,1] composites are squares and rectangles". |
| R.B13.S1 Build 10-13 (hard) | 7 | **N4:** two related whys say "at this step's size" for links that deal 1-10. The pre why prints a skill label. | Why: "the counting order to 10 on a track / the hundred square (the step continues it past 10)". Pre why: "R.B11.S1 count a group to 10". |
| R.B11.S10 Bonds to 10, 3 parts (hard) | 8 | Right. | none |
| R.B16.S6 Build doubles (hard) | 8 | Right. | none |
| R.B10.S5 Talk about time (r5 7) | 8 | Fixed. | none |
| R.B11.S2 Compare numbers to 10 (r5 7) | 8 | Fixed. D7 structure. | Move `compare_groups` to `partial`. |
| R.B16.S1 Explore sharing (r5 7) | 8 | Fixed. | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S15 The number line (W05) | 8 | The gap and its week reasons are right. | none |
| Y1.B2.S14 Take away, cross out (W14) | 7 | **D4:** ceiling 5 against its own "amounts to 10". The next-step link is hidden. | Ceiling 10. Related `subtraction:nl_sub {range:10, unknown:'answer'}`, "the next step on this idea: Y1.B2.S16". |
| Y1.B3.S1 Name 3-D shapes (W31) | 8 | Full. The pre `compose_shapes` is a weak block. | optional: drop it |
| Y1.B3.S4 Sort 2-D shapes (W32) | 8 | The partial is honest. | none |
| Y1.B4.S1 Count within 20 (W05) | 8 | Full. One "at this step's size" pre why (N4). | Why: "Y1.B1.S8 count back within 10 on a track". |
| Y1.B4.S11 Compare to 20 (W07) | 8 | The gap is right. The picture-graph why is now true. | none |
| Y1.B4.S12 Order to 20 (W07) | 8 | as above | none |
| Y1.B5.S8 Finding the difference (W18) | 7 | **D1:** the pre why "how many more" is false (0 of 60). The related `pictograph_intro {forms:[1]}` is missed, and the note says the only other form is `compare_groups`. | Pre why: "compare two groups: more, fewer, same". Related: `measurement:pictograph_intro {forms:[1]}`, "the difference read from two picture-graph rows (how many more)". |
| Y1.B6.S3 Groups of tens (W22) | 7 | The `base10_build` exclusion reason is false (`spec.py:763` is a scan workaround). | Remove `B10` from `S['Y1.B6.S3']['xr']`. Related: `composing:base10_build {band:50}`, "the next step on this idea: Y1.B6.S4". |
| Y1.B9.S9 Sharing (W33) | 8 | Right. Its note's "(see preBuild)" is its own build. | none |
| Y1.B10.S1 Recognise a half (W36) | 8 | Now partial. The proposal is weak (D5). | see D5 |
| Y1.B10.S5 Recognise a quarter (W37) | 8 | as above | see D5 |
| Y1.B10.S8 Quarter of a quantity (W38) | 8 | The partial names the leak. | none |
| Y1.B11.S1 Turns | 8 | The gap is right. | none |
| Y1.B11.S4 Above and below | 8 | Full: forms 0. | none |
| Y1.B11.S5 Ordinal numbers | 8 | The gap is right. Beyond CCSS. | none |
| Y1.B12.S4 Number line to 100 (W10) | 8 | The round-5 fix is in: the track and chart to 100 come first. | none |
| Y1.B12.S6 Compare, same tens (W34) | 7 | **D6:** no tens-and-ones pre; the 3 pre are Reception and teen rows. | `prepre` `placevalue:unit_form {band:99}` ("Y1.B12.S3 tens and ones: the main building block") and `composing:base10_build {band:50}` ("Y1.B6.S4"), before the xlsx rows. |
| Y1.B14.S1 Before and after | 8 | The gap is right. | none |
| Y1.B14.S5 Time to the hour (W36) | 8 | Full. | none |
| Y1.B5.S1 Counting on within 20 (hard, W16) | 7 | **M1r:** `nl_add` mixed unknowns. **D1:** the `equal_sign` why is false. | `nl_add {range:10, unknown:'answer'}`. Drop `addition:equal_sign`, which deals "a + b = ?" only and duplicates the direct skill. |
| Y1.B9.S7 Make doubles (hard, W20) | 8 | Right. `halve` is excluded by week (W36). | none |
| Y1.B10.S4 Half of a quantity (hard, W38) | 8 | Full. 2 pre, with a true note. | none |
| Y1.B13.S4 Count in coins (hard, W11) | 8 | Full. The school teaches it at W11. | none |
| Y1.B6.S7 Estimate to 50 (hard, W09) | 8 | The partial is honest. | none |
| Y1.B1.S12 < > = (r5 7) | 8 | Fixed. | none |
| Y1.B2.S7 Bonds to 10 (r5 7) | 7 | `add_three` is gone. **M1r:** related `nl_add` mixed unknowns. | `nl_add {range:10, unknown:'answer'}`. |
| Y1.B2.S10 Addition problems (r5 7) | 7 | `nl_sub` is gone. **M1r:** `nl_add` mixed. | as above |
| Y1.B2.S16 Subtraction on a line (r5 7) | 8 | Fixed: 60 of 60 result-unknown. | none |
| Y1.B4.S4 Understand 14-16 (r5 7) | 8 | Fixed. | none |
| Y1.B5.S4 Doubles (r5 7) | 8 | Claim (b) is accepted. | none |
| Y1.B12.S1 Count 50-100 (r5 7) | 8 | Fixed. | none |
| Y1.B12.S2 Tens to 100 (r5 7) | 8 | Fixed. | none |
| Y1.B12.S7 Compare any two (r5 7) | 8 | Fixed. | none |

**Distribution.**
- R: 7 × 4 and 8 × 24, mean 7.86. The random 20 alone give 7.95.
- Y1: 7 × 7 and 8 × 27, mean 7.79. The random 20 alone give 7.80.

## Fix list for round 7 (skill, opts, step)

1. **N1r (gen.py `SUBS` / `topic2`).**
   - Give the default its own sub-idea that never matches another step, for example `return 'count', 'other:' + step`.
   - Add these sub-ideas:
     - `('count','find', r'^find \d|^represent|count objects')`
     - `('count','subitise', r'subitis')`
     - `('count','sequence', r'count on|count backwards|count from|within 20')`
     - `('shape','compose', r'combine|compose|decompose|manipulate|copy')`, placed before `shape2d`
   - Then:
     - Drop `counting:number_seq_fill` from related on R.B9.S10 and R.B11.S4.
     - On R.B9.S1, S2 and R.B11.S1, S3, drop it or re-why it as "the counting order to 10 on a track".
     - Drop `shapes_early:compose_shapes {shapes:[0,1]}` from related on R.B4.S1, R.B4.S2, R.B4.S3 and R.B6.S1.
2. **N4 (gen.py line 333).** Write "at this step's size" only when the refitted rung deals the step's title numbers or
   shapes. Otherwise name what it really deals, or drop the link.
   - R.B13.S1: related `number_seq_fill {step:1, range:10}` and `hundreds_chart_fill {band:10}`, why "the counting order
     to 10 on a track / the hundred square (the step continues it past 10)". Pre `count_objects`, why "R.B11.S1 count a
     group to 10".
   - Y1.B4.S6: related `base10_build {band:20}`, why "build 11-19 with a rod and ones (the skill stops at 19)". Or drop it.
   - Y1.B4.S1: pre `number_seq_fill {dir:'back', range:10}`, why "Y1.B1.S8 count back within 10 on a track".
   - `fit()` for `compose_shapes` must read its own `shapes` labels (0 = triangle, 1 = square/rectangle), not
     `name_2d_shapes`'.
3. **M1r.** Use `addition:nl_add {range:10, unknown:'answer'}` on the related lists of Y1.B2.S7, S9, S10, S17 and
   Y1.B5.S1, S2, S3, S6. Add a `check_claims` assertion: every `nl_add` / `nl_sub` link carries `unknown:'answer'`.
4. **D1 whys.**
   - Y1.B5.S1: drop `addition:equal_sign {range:10}`.
   - Y1.B5.S8: pre `compare_groups {band:10}`, why "Y1.B1.S11 compare two groups: more, fewer, same".
   - Y1.B13.S1, S2 and S3: the `skip_count_line {step:[0], band:50}` why becomes "count in 2s, 5s and 10s".
   - Y1.B9.S3: the `tens_foundation_visual` why becomes "Y1.B9.S2 counting in 10s first".
5. **Missed related links.**
   - Y1.B5.S8: `measurement:pictograph_intro {forms:[1]}`.
   - Y1.B6.S3: `composing:base10_build {band:50}`. Remove the `spec.py:763` exclusion.
   - Y1.B2.S14: `subtraction:nl_sub {range:10, unknown:'answer'}`.
   - Y1.B2.S8: `addition:nl_add {range:10, unknown:'answer'}`.
   - For Y1.B2.S8 and Y1.B2.S14, take the ceiling from the title and the step's `missing` (10), never from a partial
     skill's dealt maximum (D4).
6. **D6.** Y1.B12.S6 `prepre`: `placevalue:unit_form {band:99}` ("Y1.B12.S3 tens and ones: the main building block of
   comparing 2-digit numbers"), then `composing:base10_build {band:50}` ("Y1.B6.S4 groups of tens and ones"), then the
   xlsx rows.
7. **D2 notes.**
   - Add the cited builds to `preBuild` where they are the idea's building block:
     - R.B12.S1: `shapes_world`
     - R.B15.S5: `shape_3d_tasks`, `shapes_world`
     - R.B15.S6: `shapes_world`
     - Y1.B1.S1: `match_same`, `odd_one_out`
     - Y1.B2.S3: `subitise`
   - Remove the capacity steps from the "earlier steps on this idea" clause on R.B8.S1, R.B8.S2, R.B10.S1 and R.B10.S2.
   - Never write "(see preBuild)" when `preBuild` lacks the build.
8. **D3.**
   - In `maxdealt.mjs`, change the `lt` regex to `/[<>]|\b(greater|less) than\b(?! \d+ is)/`, or test the symbols only.
   - Y1.B1.S7 / S9 note: "more_less_10 (its lowest band, 20, is past this step (10))".
9. **D5.** Re-scope `halves_quarters_only` so that it closes Y1.B10.S1 and S5. Add an option on
   `shapes_early:partition_shapes`: `ask: 'is_half'`.
   - The item shows equal and unequal splits; the pupil ticks "a half" or "not a half" (or "a quarter" / "not a quarter").
   - There is no fraction notation and no typed answer.
   - Or write it as a separate `partition_words` option, and keep `halves_quarters_only` for S2, S3, S6, S7 and S8.
10. **D7.** R.B11.S2: move `comparing:compare_groups {band:10, level:[1]}` from `direct` to `partial`, with the missing
    clause "comparing two numerals to 10 (not groups) with more / fewer".

Once fixes 1-3 and 5-6 are in, every step scored 7 in section 5 would score 8. The means would then be R 8.00 and
Y1 8.00 on this sample.
