# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 7

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `bde90000`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r6.md`
  - the round-7 sections of `R-report.md` and `Y1-report.md`, and `R-Y1-items.md`
  - `data/curriculum/links/R.json` and `Y1.json`
  - `gen.py` (`SUBS`, `topic2`, `check_claims`, `CONTENT_WEEKS`, `ctypes`, the pre and related builders) and `maxdealt.mjs`
  - the Kindergarten and Grade 1 sheets of `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r7/`. These are my r6 scripts with new seeds, plus four new
  ones:
  - `sameidea.py`: every "(earlier, same idea: X)" why, checked against the step's own sub-idea from gen.py's `SUBS`
  - `v.mjs`: item distributions per skill+opts
  - the content-week exclusion scan (inline)
  - the "(see preBuild)" pointer scan (inline)
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.

## Verdict: FAIL

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 27 (20 random + 5 hard + 2 more r6 sevens) | **7.93** | 2 | 25 | 7.95 |
| Y1 | 29 (20 random + 5 hard + 4 more r6 sevens) | **7.93** | 2 | 27 | 7.95 |

- **Means and floor.** Both means are below 8. No step scores below 7.
- **Round-6 steps that scored 7.** All 11 now score 8: R.B9.S2, R.B9.S10, R.B4.S1, R.B13.S1, Y1.B2.S7, Y1.B2.S10,
  Y1.B2.S14, Y1.B5.S1, Y1.B5.S8, Y1.B6.S3 and Y1.B12.S6.
- **What is fixed.** Every r6 defect class is fixed on fresh seeds: N1r, N4, M1r, D1, D3, D4, D5, D6 and D7. All 4
  missed related links are in. D2 is fixed in substance; one wording slip remains (D2r below).
- **Mechanical scans.** All at 0 again:
  - size and range: `rceil`, `r19` (60 items per signature) and `scan2` row A
  - prior learning: `priorwk` matches 151 of 151 to the step's xlsx week and its prior-learning list
  - notes: `notefacts` checked 430 claims and found 0 false
  - structure: `chkstruct` finds no caps, overlaps or verdict errors
  - sub-ideas: `famonly` is at 0
- **Two systematic classes are new to this report.** Rounds 1-6 missed both. Each blocks a PASS on its own.
  1. **N5. The pre-link why "(earlier, same idea: X)" is false in 156 of its 281 uses.** gen.py writes it for every
     earlier candidate, including those that share only the family. Since round 7's finer sub-ideas, X is visibly a
     different idea: "Explore capacity ← R.B8.S2 Find a balance (earlier, same idea: **mass**)".
  2. **N6. The content-week table contradicts the Kindergarten sheet and the tagger's own tags.** This produces false
     exclusion reasons on 10 Y1 steps in weeks 11-16, and it hides fitting links on 6 of them.
     - The table says "addition / subtraction sentences are taught from week 14". The sheet teaches Write number
       sentences in W11, and Subtraction - find a part and Fact families - addition facts in W12.
     - Y1.B2.S12 (W12) is `full` on `missing_add_sub`, which deals sentences.
     - The `diff` regex reads `make_ten`'s "How many more make 10?" as a difference. That bond skill is taught in
       Reception.

## Method

- **Sample.**
  - Random draw: `random.Random(70707).sample(steps, 20)`, in file order.
  - R random: B1.S1, B1.S5, B2.S1, B2.S3, B5.S5, B6.S2, B7.S3, B8.S3, B9.S3, B9.S8, B10.S1, B10.S4, B11.S5, B11.S10,
    B12.S2, B13.S2, B14.S4, B15.S2, B16.S5, B18.S2.
  - R hard: B12.S1 (3-D, compose pre), B13.S1 (10-13), B9.S10 (subitising), B4.S2 (circles and triangles with a 4-sided
    partial), B17.S8 (maps).
  - R round-6 sevens: B9.S2 and B4.S1 (B9.S10 and B13.S1 are in the hard set).
  - Y1 random: B1.S1, B1.S5, B1.S8, B1.S10, B2.S1, B2.S13, B2.S17, B3.S5, B4.S8, B4.S12, B5.S5, B5.S8, B6.S1, B6.S8,
    B8.S2, B8.S7, B9.S7, B10.S6, B10.S8, B12.S6.
  - Y1 hard: B1.S15 (number line, W05), B10.S1 (`half_or_not`), B6.S3 (W22), B2.S8 (D4 ceiling), B13.S3 (bills, bb
    flags).
  - Y1 round-6 sevens: B2.S14, B5.S1, B2.S7 and B2.S10. B5.S8 and B12.S6 are in the random draw, and B6.S3 is in the
    hard set.
  - No-related spot check: `random.Random(77077).sample(no_related_steps, 15)`.
- **Seeds.** No earlier round used these:
  - whole-file scan: all 144 signatures, 60 items each, seeds 420021 + 31i (`sigs.json`, 0 errors)
  - rule-19 content classes: seeds 430001 + 31i (`r19sig.json`)
  - judged claims: 64 items each, seeds 510001 + 31i (`v.mjs`)
- **Scale.** The same 6 / 7 / 8 scale as rounds 1-6. An 8 means right in every respect the brief asks.
- **How N5 is scored.** A false "same idea" label on a link that still shares the step's CCSS domain is a text defect.
  It does not lower that step's score; the class blocks a PASS on its own. A why that misdescribes what the skill
  deals scores 7, as in r6.

## 1. Round-6 defects, re-checked on the print path with fresh seeds

| Round-6 item | Status | Evidence (round 7) |
|---|---|---|
| N1r, `topic2` | **fixed** | Unmatched titles get `other:<step>`. The `subitise`, `find`, `sequence` and `compose` sub-ideas exist, and `compose` sits ahead of `shape2d`. `number_seq_fill` is gone from related on R.B9.S1, S2, S10 and R.B11.S1, S3, S4. It stays only on the 1 more / 1 less steps, with the why "the number track". `compose_shapes` is gone from related on R.B4.S1-S3 and R.B6.S1. `check_claims` asserts that "next / later step on this idea" links share the sub-idea; `famonly` is at 0. |
| N4, refit whys | **fixed** | "At this step's size" appears once: Y1.B4.S1 `hundreds_chart_fill {band:20}`. That use is true (it deals to 20). Y1.B4.S6 reads "to 19 (this step continues past 19)", which is true: 64 items give answers 11-19. R.B13.S1's refitted links are gone, and its pre leads with "R.B11.S1 count a group to 10". |
| M1r, `nl_add` | **fixed** | 13 `nl_add` / `nl_sub` links in Y1, and every one carries `unknown:'answer'`. Over 64 items each: 64 of 64 are "a + b = ?", and 64 of 64 are "a − b = ?". `check_claims` asserts it. |
| D1, whys | fixed | Y1.B5.S1 has no `equal_sign`. Y1.B5.S8's `compare_groups` reads "more, fewer, same", which fits 64 items (same / more / fewer). Y1.B13.S1-S3 read "count in 2s, 5s and 10s": over 64 items, 32 are 2s, 23 are 5s and 9 are 10s. Y1.B9.S3 reads "Y1.B9.S2 counting in 10s first". |
| D2, preBuild notes | **fixed in substance** | No note cites an empty `preBuild` for another step's build. Two wording points remain (see D2r): "(see preBuild)" still appears on 12 steps whose `preBuild` is empty because the cited step's build is the step's own `build`, and R.B10.S1 lists mass steps as "earlier steps on this idea" (see N5). |
| D3, `lt` regex | fixed | Y1.B1.S7 and S9 now read "more_less_10 (it deals numbers to 20, past this step (10))". That is true. |
| D4, ceilings | fixed | Y1.B2.S8 and S14 use ceiling 10. `linkfit` / `scan2` row B flag 4 links, and I judge all 4 false (section 3a). |
| D5, `halves_quarters_only` | **fixed** | The new `half_or_not` is an option `ask:'is_half' / 'is_quarter'` on `partition_shapes`. It has equal and unequal splits, word tick boxes, no notation, and a correct `closes` for Y1.B10.S1 and S5. `halves_quarters_only` now covers S2, S6 and S8 only (see D8 for one remaining gap). |
| D6, Y1.B12.S6 | fixed | The pre leads with `unit_form {band:99}`, "the main building block", then `base10_build {band:50}`. |
| D7, R.B11.S2 | fixed | `compare_groups` is a partial, with the missing clause. |
| Missed related links (4) | **all in** | Y1.B5.S8 `pictograph_intro {forms:[1]}`: 64 of 64 items ask "how many more X than Y", answers 1-4. Y1.B6.S3 `base10_build {band:50}`: answers 11-49, the next step, the same week. Y1.B2.S14 `nl_sub {unknown:'answer'}`. Y1.B2.S8 `nl_add {unknown:'answer'}`. |

## 2. New defects

### N5: "(earlier, same idea: X)" names a different idea (systematic, 156 of 281 pre whys)

gen.py line 302 builds every earlier-step pre with `f"{fmt_step(x)} (earlier, same idea: {topic(x)})"`. The
candidates `cands` include rank-1 steps that share only the family (`related_topic == 1`), and rule 15 lets them fill a
step up to 3 pre. The why still says "same idea" and prints the earlier step's own sub-idea.

`sameidea.py` uses gen.py's own `SUBS`. It finds 156 false claims on about 100 steps in R and Y1. The same template was
already false in 164 of 292 claims at `aa955ad4`, so round 6 missed it too.

| Pair (step's idea ← claimed idea) | Count | Example |
|---|---|---|
| more1 ← find / subitise / compare | 25 | R.B5.S5 1 less ← "R.B5.S3 Represent 4 and 5 (earlier, same idea: find)" |
| shape3d / compose / shape2d ← each other | 27 | R.B12.S1 Name 3-D shapes ← `compose_shapes`, "R.B6.S2 Combine shapes with 4 sides (earlier, same idea: compose)" |
| capacity / length / mass ← each other | 20 | R.B8.S3 Explore capacity ← `heavier_lighter_visual`, "R.B8.S2 Find a balance (earlier, same idea: mass)" |
| oral / tens / bond ← each other | 13 | R.B13.S2 Continue patterns 10-13 ← `ten_frame_build`, "R.B11.S9 (earlier, same idea: bond)" |
| double ← bond / fact / add | 9 | Y1.B9.S7 Make doubles ← `cloze_addition {range:20}`, "Y1.B5.S10 Missing number problems (earlier, same idea: fact)" |
| others | 62 | Y1.B10.S6 Quarter of a shape ← `halve`, "(earlier, same idea: fracqty)" |

The same coarseness shows in the generated notes. For example, R.B10.S1 Explore length: "every earlier step on this
idea (R.B2.S1, **R.B8.S2, R.B8.S1, R.B2.S2**) is represented". Those three are mass steps. R.B2.S3 (capacity) says the
same of a mass step and a size step.

**Effect.** Most of these links are acceptable pre-skills under rules 4 and 15: they share the step's CCSS domain and
are often real building blocks, such as comparing mass before comparing capacity. But each why states a false reason,
and rule 3 says "state why". The White Rose page prints these whys to teachers.

### N6: content weeks that contradict the sheet and the tagger's own tags (10 Y1 steps, W11-W16)

- **The table.** `CONTENT_WEEKS` has `'addition sentences': 14, 'subtraction sentences': 14`. `ctypes` gives any `SENT`
  key both "number sentences" (week 11) and one of these. The Kindergarten sheet shows the lessons come earlier:
  - W11: Write number sentences (K.OA.A.1)
  - W12: Subtraction - find a part, and Fact families - addition facts
  - W14: Addition - add together
- **The tagger's own tags disagree with the table too:**
  - Y1.B2.S4 (W12) is partial on `number_families_add` / `add_sub_fact_family`.
  - Y1.B2.S12 (W12) is **full** on `subtraction:missing_add_sub {range:10}`. Over 64 items: 17 "# + ___ = #", 15
    "___ + # = #", 15 "# − ___ = #" and 7 "___ − # = #". Those are addition and subtraction sentences, two weeks
    before the table's week 14.
- **The `diff` regex.** `/how many (more|fewer)|how many less/` matches `composing:make_ten {band:10}`. All 64 of its
  items are "The frame shows 2. How many more make 10?", a bond to 10. It is the direct skill of R.B11.S8 (Reception)
  and Y1.B2.S7 (W14). The regex labels it "differences (how many more) is taught from week 18".
- **Where the false reasons land.** These Y1 steps cite one or both reasons:
  - Y1.B2.S1 (W11), S2 (W11), S3 (W11), S4 (W12), S5 (W13), S6 (W13), S11 (W12) and S12 (W12)
  - Y1.B2.S16 (W16): `comparison_word`'s "differences" reason. The week is right there.
  - Y1.B1.S15 (W05): the sentences reason, which is harmless at W05.
- **Hidden links.** These would fit by rule 14 (the pupil met them in Reception or the week before):
  - Y1.B2.S1, S2: related `make_ten {band:10}`
  - Y1.B2.S5: pre `make_ten {band:10}` and `number_families_add {band:10}`
  - Y1.B2.S6: related `make_ten {band:10}`, the next step Y1.B2.S7
  - Y1.B2.S11: related `missing_add_sub`, Y1.B2.S12 in the same week
  - Y1.B2.S12: pre `make_ten`

### Minor (fix with the round)

- **D2r. Wrong pointer.** 12 notes say "(see preBuild)" while `preBuild` is empty: R.B1.S2, R.B6.S3, R.B8.S3, R.B8.S4,
  R.B12.S5-S7, R.B17.S1-S3, Y1.B3.S5 and Y1.B9.S9. In each, the cited earlier step's build is this step's own `build`.
  Write "(see build)".
- **D8. Notation left in.** `halves_quarters_only` keeps the symbol. `shade_fraction {denoms:[2]}` prints "Show 1/2 on
  the model" in 64 of 64 items. The proposal restricts the denominator but keeps "1/2" in the prompt. The file itself
  treats notation as wrong at W36-38: it leaves `shade_fraction` out of the S3, S4 and S7 links as "it shows fractions",
  and `half_or_not` exists to remove notation. Add "the prompt names the part in words (shade a half / a quarter)".
- **D9. `halve` before sharing in Reception.** `patterns:halve {band:10}` ("Half of 8", typed, no picture) is related on
  R.B9.S7, R.B9.S8, R.B11.S11 and R.B11.S12. Reception first meets halving as sharing at R.B16. The Y1 file leaves
  `halve` out until W36 for the same reason (rule 18 judged by what has been met). The R.B16 and R.B18 links are fine.
- **D10. Whys that misdescribe `compose_shapes`.** `compose_shapes {shapes:[0,1]}` asks "What shape do you make when you
  put these two shapes together?" in 64 of 64 items. The answers are Rectangle 29, Triangle 18 and Square 17.
  - On R.B17.S5 and S6 its why is "R.B15.S5 arrange shapes to make a picture".
  - On R.B17.S8, S9, S10 and S11 it is "R.B15.S5 arrange shapes to show a place".
  - It makes no picture and no place, and it is not a building block of maps.
- **D11. Y1.B2.S12 "find a part" is full on `missing_add_sub {range:10}`.** 7 of 64 items ask for the whole
  ("___ − 2 = 5", start-unknown, 1.OA.D.8). The skill's `unknown` and `task` options cannot remove them; I tested
  `{task:[1], unknown:[1]}`, which gives 26 of 64. `number_bonds {band:10, unknown:'second'}` alone teaches the step.
- **D12. Y1.B1.S15 The number line (W05) lacks its main building block (rule 14).** It has no number track pre.
  - `number_seq_fill {step:1, dir:'forward', range:10}` is Y1.B1.S6's direct skill (W02).
  - Its third pre is `compare_groups`, "(earlier, same idea: compare)" (N5).
  - Y1.B4.S8 / S9 do list the track first ("the line is a track of equal steps").
- **Report.** The Counts tables at the top of both reports are stale:
  - R says 17 / 70 / 32; the file has 17 / 69 / 33.
  - Y1 says 49 / 50 / 17; the file has 44 / 50 / 22.
  - The round-7 bullets are right.

## 3. The tagger's claims

**(a) "linkfit / scan2 row B (4) are false: the ceiling comes from a partial."** Accepted, all 4.
- Y1.B2.S8 `add_10_mixed {across}` and `nl_add`, and Y1.B2.S14 `nl_sub`: the steps' own `missing` says "totals / amounts
  to 10". The script's ceiling of 5 is the `*_5_pictures` partial's maximum, the same mistake as D4.
- Y1.B6.S3 `base10_build {band:50}`: it answers 11-49. The step is in the "within 50" block, and the next step is in
  the same week (W22). The script's ceiling of 5 is the rod count of `tens_foundation_visual`.

**(b) "stalewhy (8) is false: rods are tens."** Accepted.
- `tens_foundation_visual {band:50 / 90}` asks "How many tens?" in 64 of 64 items.
- Every cited step is earlier by school week: Y1.B12.S2 is W10 and Y1.B6.S2 is W08. They are cited from W21 and later
  steps, or from W09 / W10 steps.

**(c) "tmpl (1) is false."** Accepted. Y1.B4.S1's `hundreds_chart_fill {band:20}` deals to 20 and the step is "within 20".

**(d) "bb (14) are deliberate exclusions, each with a reason."** 13 of 14 reasons are true:
- Y1.B4.S10, Y1.B6.S6, S7 and Y1.B12.S4 (W06-W10): the number-line skills deal sentences, which come after the step's
  week.
- Y1.B9.S5, S6, S8 and S9: `equal_or_unequal_groups` asks the pupil to write "multiply" / "add". `arrays_groups`
  deals to 25, past S8 / S9's 12.
- Y1.B10.S2, S5 and S6: `partition_shapes {forms:[0]}` shows only 2 different items.
- Y1.B10.S4: `fraction_of_set` prints fractions.
- Y1.B13.S3: a rod is not money.
- **Y1.B2.S5 is false (N6).** It excludes `missing_add_sub` and `number_families_add` as "taught from week 14", but
  Y1.B2.S12 and S4 teach them in W12, a week before.

**(e) "149 no-related steps, each with a note."**
- Every one has a note.
- In the 15 drawn by `Random(77077)` (R.B1.S3, R.B3.S4, R.B6.S3, R.B9.S1, R.B12.S1, R.B15.S2, R.B15.S8, Y1.B1.S15,
  Y1.B5.S5, Y1.B7.S1, Y1.B8.S4, Y1.B9.S4, Y1.B10.S8, Y1.B12.S3, Y1.B14.S3), all 15 related reasons are honest.
  - Y1.B1.S15's gap is a pre (D12), not a related link.
- Outside the sample, 5 no-related steps hide a fitting related link behind the false N6 reasons: Y1.B2.S1, S2, S6,
  S11 and S12. Y1.B2.S5 also loses its `make_ten` and `number_families_add` pre to N6.

## 4. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | All 116 Y1 steps map to a K-sheet lesson. `priorwk`: 151 / 151. | ok |
| Content weeks (rule 19) against the sheet | n/a | Sentences (14 against the sheet's 11 / 12) and `diff` (`make_ten`) are wrong | **FAIL (N6)** |
| Grade 1 sheet | The Rec/PK4 rows appear only as prior learning | 38 Grade 1 rows cite KG prior learning; no Y1 step is re-taught in Grade 1 | consistent |
| Range (`rceil`, `scan2`, `linkfit`) | 0 | 0 true flags (4 false, section 3a) | ok |
| Response mode for the age | 0 equation, number-line, clock or groups-of links | 0 rule-19 violations at 60 items | ok, except D9 (`halve` at R.B9 / B11) |
| Pre count ≥ 3, or a note | 46 steps below 3; all say "Pre: n only" | 21 steps below 3; all noted | ok (N5 makes some "every earlier step on this idea" lists false) |
| Verdicts | Full verdicts hold on 64 items. R.B4.S2 is honestly partial, though its skill shows squares. | Full verdicts hold except Y1.B2.S12 (D11) | minor |
| Proposals (rule 13 short spec) | 32 (10 new); all 5 fields; none unused or undefined | 47 (11 new); all 5 fields; `half_or_not` is right | ok, D8 |
| Related whys against the items | 0 false | 0 false | ok |
| Pre whys against the step | 156 false "same idea" labels across both years; 7 `compose_shapes` whys misdescribe the skill (D10) | | **FAIL (N5)** |

## 5. Per-step scores (every step below 8 has its fix)

N5 text fixes apply to most steps and are not repeated per row.

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B1.S1 Match objects | 8 | The gap is right. | none |
| R.B1.S5 Explore sorting | 8 | Right. | none |
| R.B2.S1 Compare size | 8 | Right. | none |
| R.B2.S3 Compare capacity | 8 | The mass and size compares are fair pre-skills; the whys and note are N5. | N5 text |
| R.B5.S5 1 less | 8 | Right. | N5 text |
| R.B6.S2 Combine 4-sided shapes | 8 | Full. | none |
| R.B7.S3 Subitise 0-5 | 8 | The pre `count_sequence` back is weak (K.CC). | N5 text |
| R.B8.S3 Explore capacity | 8 | D2r pointer. | "(see build)" |
| R.B9.S3 1 more | 8 | Right. | none |
| R.B9.S8 Make a double to 8 | 7 | **D9:** related `patterns:halve {band:10}` ("Half of 8", typed) at R.B9, before halving is met as sharing (R.B16). | Drop it, or note "halving comes at R.B16". |
| R.B10.S1 Explore length | 8 | Full. The note lists mass steps "on this idea" (N5). | N5 text |
| R.B10.S4 Compare height | 8 | Full. | N5 text |
| R.B11.S5 1 more | 8 | Right. | none |
| R.B11.S10 Bonds to 10, 3 parts | 8 | Right. | none |
| R.B12.S2 2-D within 3-D | 8 | The gap is right. `compose_shapes` pre is weak (K.G). | N5 text |
| R.B13.S2 Patterns 10-13 | 8 | Right. Related `hundreds_chart_fill {band:10}` stops at 10. | why "the hundred square to 10 (the step continues past 10)" |
| R.B14.S4 How many taken away | 8 | Right. | none |
| R.B15.S2 Rotate shapes | 8 | Right. | N5 text |
| R.B16.S5 Even and odd sharing | 8 | Right. | none |
| R.B18.S2 Patterns and relationships | 8 | Right. `halve` follows R.B16. | none |
| R.B12.S1 Name 3-D (hard) | 8 | Full. `compose_shapes` pre is weak. | N5 text |
| R.B13.S1 Build 10-13 (hard, r6 7) | 8 | Fixed. | none |
| R.B9.S10 Conceptual subitising (hard, r6 7) | 8 | Fixed. Pre `add_5_pictures` / `number_bonds` are real blocks of seeing parts. | N5 text |
| R.B4.S2 Circles and triangles (hard) | 8 | Partial is honest. The missing clause names the 4-sided items. | none |
| R.B17.S8 Explore mapping (hard) | 7 | **D10:** pre `compose_shapes` "R.B15.S5 arrange shapes to show a place"; the skill asks what two shapes make. | Drop it on R.B17.S5 and S8-S11. Pre: none, or note "Pre: 2 only". |
| R.B9.S2 Represent 6-8 (r6 7) | 8 | Fixed. | N5 text |
| R.B4.S1 Circles and triangles (r6 7) | 8 | Fixed. | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S1 Sort objects (W23) | 8 | Right. | none |
| Y1.B1.S5 Numbers as words (W02) | 8 | The partial names the generator bug. | none |
| Y1.B1.S8 Count back within 10 | 8 | Full. | none |
| Y1.B1.S10 Compare by matching | 8 | Full. | none |
| Y1.B2.S1 Parts and wholes (W11) | 7 | **N6:** the note leaves out `make_ten` as "differences, week 18" and the sentence skills as "week 14". Both are false; `make_ten` (R.B11.S8) is a part-whole on a frame. | Related `composing:make_ten {band:10}`, why "the whole 10 and its two parts on a frame". |
| Y1.B2.S13 Fact families (W15) | 8 | Full. | none |
| Y1.B2.S17 Add or subtract 1 or 2 | 8 | Right. | none |
| Y1.B3.S5 2-D and 3-D patterns | 8 | D2r pointer. | "(see build)" |
| Y1.B4.S8 Number line to 20 (W06) | 8 | Right. | none |
| Y1.B4.S12 Order to 20 (W07) | 8 | The gap is right. | N5 text |
| Y1.B5.S5 Near doubles (W17) | 8 | Full. | N5 text |
| Y1.B5.S8 Difference (W18, r6 7) | 8 | Fixed. | none |
| Y1.B6.S1 Count 20-50 (W08) | 8 | Right. | none |
| Y1.B6.S8 1 more, 1 less to 50 | 8 | Full. | none |
| Y1.B8.S2 Measure mass | 8 | Right. | none |
| Y1.B8.S7 Compare capacity | 8 | Right. | N5 text |
| Y1.B9.S7 Make doubles (W20) | 8 | Full. `cloze_addition` / `missing_add_sub` are weak pre (OA). | N5 text |
| Y1.B10.S6 Quarter of a shape | 8 | Right. Halving as a block of quartering is real. | N5 text |
| Y1.B10.S8 Quarter of a quantity | 8 | Right. | none |
| Y1.B12.S6 Same tens (W34, r6 7) | 8 | Fixed. | none |
| Y1.B1.S15 The number line (W05, hard) | 7 | **D12:** no number-track pre (rule 14). The third pre is `compare_groups`, with an N5 why. | Pre `counting:number_seq_fill {step:1, dir:'forward', range:10}`, why "Y1.B1.S6 the number track: a line is a track of equal steps", placed first. |
| Y1.B10.S1 Recognise a half (hard) | 8 | `half_or_not` closes it. | none |
| Y1.B6.S3 Groups of tens (hard, r6 7) | 8 | Fixed. | none |
| Y1.B2.S8 Add together (hard) | 8 | Fixed. | none |
| Y1.B13.S3 Recognise notes (hard) | 8 | The bb exclusion is right. | none |
| Y1.B2.S14 Take away (r6 7) | 8 | Fixed. | none |
| Y1.B5.S1 Count on within 20 (r6 7) | 8 | Fixed. | none |
| Y1.B2.S7 Bonds to 10 (r6 7) | 8 | Fixed. | none |
| Y1.B2.S10 Addition problems (r6 7) | 8 | Fixed. | none |

**Distribution.**
- R: 7 × 2 and 8 × 25, mean 7.93. The random 20 alone give 7.95.
- Y1: 7 × 2 and 8 × 27, mean 7.93. The random 20 alone give 7.95.

## Fix list for round 8 (skill, opts, step)

1. **N5 (gen.py line 302, plus the note builder at about line 397).**
   - Write "(earlier, same idea: X)" only when `related_topic(step, x) == 2`.
   - For a rank-1 candidate, name what the link gives the step, for example
     `f"{fmt_step(x)} ({FORM_LABEL[k]}: a building block)"`.
     - `heavier_lighter_visual` → "compare two objects: the compare words"
     - `count_sequence {dir:'back'}` → "count back"
     - `ten_frame_build` → "show the amount on a frame"
     - `compose_shapes` → "two shapes make a new shape"
   - In the note, "every earlier step on this idea (…)" lists only steps with `related_topic == 2`. Otherwise it says
     "earlier steps on neighbouring ideas".
   - Add a `check_claims` assertion that every "(earlier, same idea: X)" has X equal to `topic(step)`. It must pass on
     all 281 claims.
2. **N6 (gen.py `CONTENT_WEEKS` and `maxdealt.mjs` `diff`).**
   - Set `'addition sentences': 11` and `'subtraction sentences': 12`, from the Kindergarten sheet: Write number
     sentences W11; Subtraction - find a part and Fact families - addition facts W12.
   - Change `diff` to `/how many (more|fewer) \w+ than|how many less/`, so that `make_ten`'s "How many more make 10?"
     is a bond, not a difference.
   - Then:
     - Y1.B2.S1 and S2: related `composing:make_ten {band:10}`, "the whole 10 and its two parts on a frame".
     - Y1.B2.S5: pre `composing:make_ten {band:10}` ("R.B11.S8 bonds to 10 (2 parts)") and
       `addition:number_families_add {band:10}` ("Y1.B2.S4 the facts of one bond").
     - Y1.B2.S6: related `composing:make_ten {band:10}`, "the next step on this idea: Y1.B2.S7 Number bonds to 10".
     - Y1.B2.S11: related `subtraction:missing_add_sub {range:10, unknown:[1]}`, "find a part in a number sentence
       (Y1.B2.S12, the same week)".
     - Y1.B2.S12: pre `composing:make_ten {band:10}`, "R.B11.S8 find the part that makes 10".
     - Re-run `bb.py`: Y1.B2.S5's flag must clear.
3. **D9.** Drop `patterns:halve {band:10}` from related on R.B9.S7, R.B9.S8, R.B11.S11 and R.B11.S12.
   - Note: "halving is met as sharing at R.B16".
   - Keep it on R.B16.S2, S4, S6 and R.B18.S2.
4. **D10.**
   - Drop `shapes_early:compose_shapes {shapes:[0,1]}` from pre on R.B17.S5 and R.B17.S8-S11.
   - On R.B17.S4 and S6, the why becomes "R.B15.S5 two shapes put together make a new shape".
5. **D11.**
   - Y1.B2.S12: remove `subtraction:missing_add_sub {range:10}` from `direct`, with a `tagFixes` entry `remove`: "7 of
     64 items ask for the whole (___ − 2 = 5, 1.OA.D.8)". The step stays full on `composing:number_bonds {band:10,
     unknown:'second'}`.
   - Optionally, propose an `unknown:'change'` option on `missing_add_sub`.
6. **D12.** Y1.B1.S15: add pre `counting:number_seq_fill {step:1, dir:'forward', range:10}` first, with the why "Y1.B1.S6
   the number track: a line is a track of equal steps".
7. **D8.** In `halves_quarters_only`, add to `representation`: "the prompt names the part in words (shade a half / a
   quarter), no 1/2 symbol". `shade_fraction {denoms:[2]}` prints "Show 1/2 on the model" in 64 of 64 items.
8. **D2r.** Write "(see build)" in place of "(see preBuild)" when the cited step's build is in the step's own `build`.
   The steps are R.B1.S2, R.B6.S3, R.B8.S3, R.B8.S4, R.B12.S5-S7, R.B17.S1-S3, Y1.B3.S5 and Y1.B9.S9.
9. **R.B13.S2.** The related `hundreds_chart_fill {band:10}` why becomes "the hundred square to 10 (the step continues
   past 10)".
10. **Reports.** Correct the Counts tables: R is 17 / 69 / 33 and Y1 is 44 / 50 / 22.

**Outlook.** Fixes 3, 4, 2 and 6 lift the four steps scored 7, which puts both means at 8.00 on this sample. Fixes 1 and
2 close the two systematic classes. Both are mechanical changes in gen.py, with an assertion each.
