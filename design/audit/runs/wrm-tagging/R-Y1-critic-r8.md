# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 8

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `e18332ee`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r7.md`
  - the round-8 and loose-ends sections of `R-report.md` and `Y1-report.md`, and `R-Y1-items.md`
  - `data/curriculum/links/R.json` and `Y1.json`
  - `gen.py` (the pre / related builder, `check_claims`, `ctypes`, `SENT`), `content_weeks.json` and `maxdealt.mjs`
  - the Kindergarten and Grade 1 sheets of the xlsx
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r8/`. These are my r7 scripts with new seeds, plus five new
  ones:
  - `sameidea2.py`: every "same idea" why, checked against the sub-idea of the step it cites (r7 checked only the label)
  - `bblist.py`: every "(X: a building block)" why, listed for judgement
  - `optmax.mjs`: the dealt maximum, now including the numbers on answer options and in the visual
  - `onidea.py` and `notes2.py`: the "on this idea" note claims
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.

## Verdict: FAIL

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 27 (20 random + 5 hard + 2 r7 sevens) | **7.89** | 3 | 24 | 7.95 |
| Y1 | 27 (20 random + 5 hard + 2 r7 sevens) | **7.93** | 2 | 25 | 7.95 |

- **Means and floor.** Both means are below 8. No step scores below 7.
- **Round-7 steps that scored 7.** All 4 now score 8: R.B9.S8, R.B17.S8, Y1.B2.S1 and Y1.B1.S15.
- **What is fixed.** All 10 r7 fixes are in, and each holds on fresh seeds: N5 (the label path), N6, D2r, D8, D9, D10,
  D11, D12, the R.B13.S2 why and the report counts. The three rewritten related whys are true.
- **Mechanical scans.** All at 0 again:
  - range and content: `rceil`, `r19` and `scan2` row A
  - prior learning: `priorwk` matches 155 of 155
  - notes: `notefacts` finds 0 false in 400 claims
  - pointers: 39 "(see build)" / "(see preBuild)" pointers, 0 false
  - structure: `chkstruct` finds no caps, overlaps or verdict errors
  - sub-ideas: `famonly` is at 0
  - proposals: every proposal has all 5 rule-13 fields, `closes` differs from `teaches`, and no step list is missing
    a step
- **Why it fails.** Two classes remain, both in pre-link whys. Each one blocks a PASS on its own.
  1. **N5r.** The r7 class "a same-idea claim on a different idea" is closed on the `(earlier, same idea: X)` path, but
     it survives on a second path: `(an earlier step; the same idea)` is false in 11 of 11 uses. `check_claims` does
     not test that path.
  2. **N7.** The new `FORM_LABEL` template writes "(X: a building block)" for every neighbouring-idea candidate,
     without judging it. 27 of its 155 uses name a skill that is not a building block of the step, such as counting
     back for "Find 4 and 5", or composing 2-D shapes for "Name 3-D shapes". 6 more misdescribe what the skill deals,
     such as `odd_even` "pairs" or `make_ten {band:20}` "the parts of 10".
- **One new range defect the scanners missed.** `select_even_odd {range:10}` deals 11-20 in every item: the generator
  has a floor of 20. It is related on 3 Reception steps with the why "to 10". The max-dealt scans read only the text
  and the answer, not the answer options; `optmax.mjs` now reads them, and this is its only hit.

## Method

- **Sample.**
  - Random draw: `random.Random(80808).sample(steps, 20)`, in file order.
  - R random: B2.S4, B2.S6, B4.S2, B4.S3, B6.S3, B7.S7, B9.S7, B10.S1, B10.S2, B11.S2, B11.S4, B11.S6, B11.S9,
    B11.S10, B11.S11, B15.S1, B15.S2, B16.S5, B16.S6, B17.S1.
  - R hard: B16.S1 (sharing, `odd_even` pre), B13.S5 (beyond 20), B9.S6 (pairs), B12.S2 (2-D in 3-D), B14.S2 (change
    unknown).
  - R round-7 sevens: B9.S8 and B17.S8.
  - Y1 random: B1.S11, B1.S13, B2.S6, B2.S7, B3.S1, B4.S4, B5.S4, B5.S8, B5.S9, B6.S5, B6.S7, B7.S1, B8.S1, B8.S2,
    B8.S3, B10.S7, B10.S8, B12.S6, B12.S7, B13.S1.
  - Y1 hard: B2.S11 (new related link), B2.S12 (D11), B2.S5 (new N6 pre), B9.S9 (sharing, W33), B13.S4 (coins, W11).
  - Y1 round-7 sevens: B2.S1 and B1.S15.
  - No-related spot check: `random.Random(88088).sample(no_related_steps, 15)`.
- **Seeds.** No earlier round used these:
  - whole-file scan: all 145 signatures, 60 items each, base 620011, step 37 (0 errors)
  - rule-19 content classes: base 630001, step 37
  - option and visual maxima: base 640003, step 37
  - judged claims: 64 items each, base 710001, step 37; the key defects were confirmed again at base 720001
- **Scale.** The same 6 / 7 / 8 scale as rounds 1-7. An 8 means right in every respect the brief asks.
- **Scoring rule, unchanged from r7.**
  - A false "same idea" or "building block" reason on a link that still shares the step's CCSS domain is a text
    defect. It does not lower that step's score, but the class blocks a PASS.
  - A why that misdescribes what the skill deals scores 7, as does a link that breaks rule 18.

## 1. Round-7 defects, re-checked on the print path with fresh seeds

| Round-7 item | Status | Evidence (round 8) |
|---|---|---|
| N5, the "(earlier, same idea: X)" label | **fixed on that path** | `sameidea.py` finds 0 false in 121 claims. "Every earlier step on this idea" notes cite 6 steps, all on the same sub-idea; 7 notes now say "neighbouring ideas". A second path is still false (N5r, below). |
| N6, the content weeks | **fixed** | `content_weeks.json` has addition sentences at 11 and subtraction sentences at 12. `diff` is `how many (more\|fewer) … than`, and `make_ten` items ("How many more make 10?") no longer match it. `bb.py` is down from 14 flags to 13, and Y1.B2.S5's flag has cleared. The only "differences" reason left is Y1.B2.S16 `comparison_word` (W16 < W18), which is true. |
| N6, the links | **in** | Y1.B2.S5 pre has `make_ten {band:10}` and `number_families_add {band:10}`. Y1.B2.S12 pre has `make_ten`. Y1.B2.S11 has the related `missing_add_sub` (its opts are wrong: D15). Y1.B2.S1, S2 and S6 have `make_ten` as a pre. |
| D2r, pointers | fixed | 39 pointers checked, 0 false. |
| D8, `halves_quarters_only` | fixed | The `representation` says "the prompt names the part in words (shade a half / a quarter), no 1/2 symbol". |
| D9, `halve` in R.B9 / R.B11 | fixed | It is gone from R.B9.S7, S8 and R.B11.S11, S12, each with the note "Halving is met as sharing at R.B16". It stays on R.B16.S2, S4, S6 and R.B18.S2. |
| D10, `compose_shapes` whys | fixed | It is gone from R.B17.S5 and S8-S11. On R.B17.S4 and S6 the why reads "R.B15.S5 two shapes put together make a new shape". |
| D11, Y1.B2.S12 | fixed | `missing_add_sub` is out of `direct`, and there is a `tagFixes` remove entry. The step stays full on `number_bonds {band:10, unknown:'second'}`: 64 of 64 items are "# + ? = #". |
| D12, Y1.B1.S15 | fixed | The first pre is `number_seq_fill {step:1, dir:'forward', range:10}`, "the number track: a line is a track of equal steps". |
| R.B13.S2 why | fixed | "the hundred square to 10 (the step continues past 10)". |
| Report counts | fixed | R 17 / 69 / 33 with 32 proposals (10 new). Y1 44 / 50 / 22 with 47 proposals (11 new). Both match the files. |

## 2. The tagger's claims

| Claim | Judgement |
|---|---|
| All 10 r7 fixes are in | **True** (section 1). N5 is closed on the path r7 named, but not on a second path (N5r). |
| `sameidea` 0 / 121 | **True.** It checks only the label X. The new `sameidea2.py` checks the step that each "same idea" why cites, and finds 11 false, all on `(an earlier step; the same idea)`. |
| `notefacts` 0 / 400 | **True.** |
| 34 build / preBuild claims are true | **True.** My scan reads 39 pointers and finds 0 false. |
| The 3 relwhy whys are rewritten | **True**, on 64 items each. `hundreds_chart_fill {band:30}` is always a 3-row window of 1-30, rows 0-2. Every `share_into_groups {band:12}` item reads "N counters, make groups of k". Every `halve {band:10}` item reads "Half of n". |
| The 9 `linkfit` / `scan2` row B flags are false | **Accepted, all 9.** The script's ceiling of 5 is a partial's or a rod count's maximum, and the steps work to 10 (Y1.B2) or 50 (Y1.B6.S3). One content point remains: `number_families_add {band:10}` deals subtraction facts on 60 of 60 items ("5 − 3 ="). On Y1.B2.S1 and S2 (W11) it is related as "another form", a week before the file's own subtraction week (W12). gen.py's `SENT` classes a skill by its key prefix (`addition:`), so the `minus` content is missed. On Y1.B2.S3 it is a "next step" link, which is fine. This is a minor finding (M1) and does not lower a score. |
| `make_ten` is a pre, not related, on Y1.B2.S1, S2 and S6 | **Accepted.** R.B11.S8 is on the W11 and W13 prior-learning lists (`priorwk` confirms). Rule 14 then makes it a pre. |

## 3. New defects

### N5r. "(an earlier step; the same idea)" on a different idea (11 of 11 false)

gen.py line 332 promotes a related link that an earlier step teaches into a pre (rule 14). When the related why began
"the next step", "a later step" or "the same idea in another form", it rewrites the base as "the same idea", whatever
the cited step's sub-idea. `check_claims` tests only `earlier, same idea: X`, so this path is never checked.

| Step (sub-idea) | Pre | Cited step (sub-idea) |
|---|---|---|
| R.B11.S9 Make arrangements of 10 (bond) | `count_objects {band:10, objects:'frame'}` | R.B11.S1 Find 9 and 10 (find) |
| R.B13.S3 Build 14-20 (tens) | `ten_frame_build {band:10}` | R.B11.S9 Make arrangements of 10 (bond) |
| Y1.B1.S8 Count backwards within 10 (sequence) | `count_objects` | Y1.B1.S3 Count objects from a larger group (find) |
| Y1.B2.S11 Find a part (bond) | `number_families_add {band:10}` | Y1.B2.S4 Fact families (fact) |
| Y1.B2.S12 Subtraction - find a part (bond) | `number_families_add {band:10}` | Y1.B2.S4 (fact) |
| Y1.B4.S1 Count within 20 (sequence) | `ten_frame_build` | Y1.B1.S4 Represent objects (find) |
| Y1.B4.S7 1 more and 1 less (more1) | `number_seq_fill` | Y1.B1.S8 Count backwards (sequence) |
| Y1.B5.S2 Add ones using number bonds (bond) | `number_line_add` | Y1.B5.S1 Add by counting on (add) |
| Y1.B6.S8 1 more, 1 less (more1) | `hundreds_chart_fill` | Y1.B6.S1 Count from 20 to 50 (sequence) |
| Y1.B12.S2 Tens to 100 (tens) | `ten_frame_build` | Y1.B1.S4 Represent objects (find) |
| Y1.B12.S5 1 more, 1 less (more1) | `hundreds_chart_fill` | Y1.B6.S1 (sequence) |

The links themselves are fair pre-skills. The reason they print is false.

### N7. "(X: a building block)" written without judging the link (33 of 155 uses)

My r7 fix proposed this wording for the rank-1 (neighbouring-idea) candidates that rule 15 uses to reach 3 pre. gen.py
line 315 now writes it for every such candidate. Most uses are true, for example "count a group" before subitising,
"show the amount on a frame" before 1 more, "name the flat shapes" before composing, and "the compare words" before
comparing capacity. These are not:

**(a) The skill is not a building block of the step (27 uses).**

| Pre (label) | Steps | Why it is not a block |
|---|---|---|
| `count_sequence {band:10, dir:'back'}` "count back" (11) | R.B5.S1 Find 4 and 5, R.B5.S2 Subitise 4 and 5, R.B5.S3 Represent 4 and 5, R.B7.S3 Subitise 0-5, R.B7.S4 Represent 0-5, R.B7.S8 Conceptual subitising to 5, R.B9.S1 Find 6-8, R.B9.S2 Represent 6-8, R.B11.S1 Find 9 and 10, R.B11.S9 Make arrangements of 10, R.B13.S1 Build 10-13 | Every item is "What number comes before n?". Finding, subitising and representing an amount build on counting forward and cardinality, not on saying the number before. It is a fair block for R.B7.S1 Introduce zero, R.B7.S2 Find 0 to 5 and R.B11.S2 Compare numbers. |
| `compose_shapes {shapes:[0,1]}` "two shapes make a new shape" (8) | R.B12.S1, S2, S3, S4, R.B15.S1, R.B15.S8, Y1.B3.S1, Y1.B3.S2 | Every item is "What shape do you make when you put these two shapes together?". Combining two flat shapes is not a block of naming, finding or sorting solids. |
| `name_3d_shapes {forms:[1]}` "name the solids" (6) | R.B15.S2 Rotate shapes, S3 Manipulate shapes, S4 Explain shape arrangements, S5 Compose shapes, S6 Decompose shapes, S7 Copy 2-D shape pictures | These are 2-D steps. Naming solids is not a block of turning, composing or copying flat shapes. R.B15.S1, "Select shapes for a purpose" (it rolls, it stacks), keeps it. |
| `measure_nonstandard {}` "measure with units" (2) | Y1.B8.S1 Heavier and lighter, Y1.B8.S4 Full and empty | Every item measures length in cubes, clips or crayons. Comparing by feel or on a balance, or full and empty, does not use units. On Y1.B8.S2, S6 and S7 the hand-written whys ("the same measuring, now with cups") are right. |

**(b) The label misdescribes what the skill deals (6 uses; each such step scores 7).**

| Pre (label) | Steps | What 64 items show |
|---|---|---|
| `composing:odd_even {forms:[2], range:10}` "pairs: odd and even" | R.B16.S1, S2, S3, S4 | 64 of 64 items are "Which number is even / odd?", with the hint "Even numbers end in 0, 2, 4, 6, or 8". It shows no pairs and no objects. The steps' own `partial` on R.B9.S6 and R.B11.S13 already says so: "the skill names odd or even numbers". |
| `composing:make_ten {band:20}` "the parts of 10 on a frame" | Y1.B5.S4 Doubles, Y1.B5.S5 Near doubles | 64 of 64 items are "The frame shows n. How many more make **20**?" (n = 11-19). `FORM_LABEL` is keyed by the skill, not the opts. |

Two more labels are raw skill labels rather than a reason: `cloze_addition` "Pick the Missing Addends" (Y1.B9.S7)
and `order_objects_length` "Order Objects by Length (Visual)" (Y1.B8.S1, S3).

### D14. `select_even_odd {range:10}` deals to 20 (3 Reception steps)

- `gen-algebraic.js` line 1293 has `seoMax = Math.max(20, Math.min(range, 100))`, so range 10 is ignored.
- Over 64 items, all 64 show numbers above 10 among their six options: the largest is 20 in 18 items, 19 in 16, and
  13-18 in the rest.
- It is related on R.B9.S6 (block 6-8), R.B11.S13 and R.B16.S5, with the why "circle the even or the odd numbers to
  10". That breaks rule 18 for Reception and makes the why false.
- Rounds 1-7 missed it, and so does gen.py's own check: both max-dealt scans read only the text and the answer, and
  this skill's answer is a list of option ids. `optmax.mjs` reads the option labels and the visual for all 145
  signatures, and this is its only hit.

### D15. Y1.B2.S11's related `missing_add_sub {range:10, unknown:[1]}` asks for the whole in 1 item in 4

- The why is "find a part in a number sentence (Y1.B2.S12, the same week)".
- Over 64 items: 17 are "___ − # = #" (the whole is unknown), 21 "# − ___ = #", 14 "___ + # = #" and 12 "# + ___ = #".
  A second seed gives 14 of 64 whole-unknown.
- These are the same items that D11 took out of Y1.B2.S12's direct skills. My r7 fix proposed these opts, so the
  error is mine as well. The tested fix is `{range:10, unknown:[1], task:[0]}`: 64 of 64 items have a part unknown
  (35 "___ + # = #", 29 "# + ___ = #"), with a maximum of 10.

### Minor (no score effect)

- **M1. `SENT` classes content by the key prefix.** `addition:number_families_add` and `addition:add_sub_fact_family`
  deal subtraction facts on 60 of 60 items, but gen.py classes them as addition sentences only. The effect is
  related `number_families_add` on Y1.B2.S1 and S2 (W11), a week before subtraction sentences (W12). Use the
  `minus` class that `maxdealt.mjs` already counts.
- **M2.** `maxdealt.mjs` should read `q.options` labels, so that D14's class is caught by the generator's own check.

## 4. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | 116 / 116 steps map to a K-sheet lesson. `priorwk`: 155 / 155. | ok |
| Content weeks (rule 19) | n/a | `r19` finds 0. The sheet weeks for sentences are now right. M1 is a one-week slip on 2 related links. | ok |
| Grade 1 sheet | The Rec/PK4 rows appear only as prior learning | No Y1 step is re-taught in Grade 1 | ok |
| Range (`rceil`, `scan2`, `linkfit`, `optmax`) | **D14** (3 links) | 0 true flags (the 9 flags are false, section 2) | D14 |
| Response mode for the age | 0 equation, number-line or word-work links | 0 rule-19 violations | ok |
| ≥ 3 pre, or a note | 49 steps below 3, all with a "Pre: n only" note | 20 steps below 3, all noted | ok. N7 fixes will add a few short-pre notes. |
| Verdicts | Full verdicts hold on 64 items | Full verdicts hold, including Y1.B2.S12 after D11 | ok |
| Proposals (rule 13 short spec) | 32 (10 new), all 5 fields | 47 (11 new), all 5 fields | ok |
| Related whys against the items | D14 (3) | D15 (1) | defects |
| Pre whys against the step | N5r and N7, across both years | | **FAIL** |
| No-related steps (15 drawn) | R.B1.S2, R.B3.S3, R.B4.S3, R.B10.S6, R.B12.S5, R.B15.S2, R.B15.S4, R.B15.S5, R.B17.S4 | Y1.B3.S3, Y1.B4.S10, Y1.B5.S5, Y1.B8.S4, Y1.B10.S7, Y1.B11.S2 | All 15 related reasons are honest. |

## 5. Per-step scores (every step below 8 has its fix)

N5r and N7(a) are text fixes; they apply to the steps listed in section 3 and are not repeated per row.

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B2.S4 Explore simple patterns | 8 | The partial is honest (typed names). | none |
| R.B2.S6 Create simple patterns | 8 | The gap is right. | none |
| R.B4.S2 Compare circles and triangles | 8 | The partial is honest. | none |
| R.B4.S3 Shapes in the environment | 8 | Right. | none |
| R.B6.S3 Shapes in the environment | 8 | `compose_shapes` (combining 4-sided shapes) is a fair block here. | none |
| R.B7.S7 Composition | 8 | Right. | none |
| R.B9.S7 Find a double to 8 | 8 | `halve` is gone. | none |
| R.B10.S1 Explore length | 8 | Full. | none |
| R.B10.S2 Compare length | 8 | Full. | none |
| R.B11.S2 Compare numbers to 10 | 8 | Count back fits "compare" (the number before is less). | none |
| R.B11.S4 Conceptual subitising to 10 | 8 | Right. | none |
| R.B11.S6 1 less | 8 | Right. | none |
| R.B11.S9 Make arrangements of 10 | 8 | N5r (`count_objects`); N7 (count back). | text |
| R.B11.S10 Bonds to 10, 3 parts | 8 | Right. | none |
| R.B11.S11 Find a double to 10 | 8 | Right. | none |
| R.B15.S1 Select shapes for a purpose | 8 | N7 (`compose_shapes`). | text |
| R.B15.S2 Rotate shapes | 8 | N7 (`name_3d_shapes`). | text |
| R.B16.S5 Even and odd sharing | **7** | **D14:** related `select_even_odd {range:10}` "to 10" deals 11-20 in every item. | Drop it (or see the fix list). |
| R.B16.S6 Build doubles | 8 | Right. | none |
| R.B17.S1 Units of repeating patterns | 8 | Right. | none |
| R.B16.S1 Explore sharing (hard) | **7** | **N7(b):** pre `odd_even` "pairs: odd and even: a building block". The skill shows no pairs; it is a last-digit rule. | Drop it from R.B16.S1-S4. |
| R.B13.S5 Verbal counting past 20 (hard) | 8 | Right. | none |
| R.B9.S6 Make pairs (hard) | **7** | **D14:** related `select_even_odd` deals to 20 in a block about 6-8. | Drop it. |
| R.B12.S2 2-D within 3-D (hard) | 8 | N7 (`compose_shapes`). | text |
| R.B14.S2 How many did I add (hard) | 8 | Right. | none |
| R.B9.S8 Make a double to 8 (r7 7) | 8 | Fixed. | none |
| R.B17.S8 Explore mapping (r7 7) | 8 | Fixed. | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S11 Fewer, more, same (W03) | 8 | Full. | none |
| Y1.B1.S13 Compare numbers (W04) | 8 | The gap is right. | none |
| Y1.B2.S6 Systematic bonds (W13) | 8 | The `make_ten` pre is right. | none |
| Y1.B2.S7 Bonds to 10 (W14) | 8 | Full. | none |
| Y1.B3.S1 Name 3-D shapes (W31) | 8 | N7 (`compose_shapes`). | text |
| Y1.B4.S4 Understand 14-16 (W21) | 8 | The partial is right. | none |
| Y1.B5.S4 Doubles (W17) | **7** | **N7(b):** pre `make_ten {band:20}` "the parts of 10 on a frame"; it deals "make 20". | See fix 3. |
| Y1.B5.S8 Difference (W18) | 8 | Right. | none |
| Y1.B5.S9 Related facts (W18) | 8 | Full. | none |
| Y1.B6.S5 Partition into tens and ones (W23) | 8 | Full. | none |
| Y1.B6.S7 Estimate on a line to 50 (W09) | 8 | Right. | none |
| Y1.B7.S1 Compare lengths and heights (W23) | 8 | Full. | none |
| Y1.B8.S1 Heavier and lighter (W25) | 8 | N7 (`measure_nonstandard`), and a raw label. `compare_objects` carries the compare words. | text |
| Y1.B8.S2 Measure mass (W26) | 8 | Right. | none |
| Y1.B8.S3 Compare mass (W26) | 8 | A raw label. | text |
| Y1.B10.S7 Recognise a quarter of a quantity (W38) | 8 | Right. | none |
| Y1.B10.S8 Find a quarter of a quantity (W38) | 8 | Right. | none |
| Y1.B12.S6 Same tens (W34) | 8 | Right. | none |
| Y1.B12.S7 Compare any two numbers (W34) | 8 | Full. | none |
| Y1.B13.S1 Unitising (W34) | 8 | Right. | none |
| Y1.B2.S11 Find a part (W12, hard) | **7** | **D15:** the related `missing_add_sub {range:10, unknown:[1]}` asks for the whole in 17 of 64 items; the why says "find a part". It also has N5r. | Opts `{range:10, unknown:[1], task:[0]}`. |
| Y1.B2.S12 Subtraction - find a part (W12, hard) | 8 | D11 is fixed. N5r. | text |
| Y1.B2.S5 Bonds within 10 (W13, hard) | 8 | The N6 links are in. | none |
| Y1.B9.S9 Sharing (W33, hard) | 8 | Right. | none |
| Y1.B13.S4 Count in coins (W11, hard) | 8 | Full. | none |
| Y1.B2.S1 Parts and wholes (W11, r7 7) | 8 | Fixed. M1 applies to its `number_families_add` link. | M1 |
| Y1.B1.S15 The number line (W05, r7 7) | 8 | Fixed. | none |

**Distribution.**
- R: 7 × 3 and 8 × 24, mean 7.89. The random 20 alone give 7.95.
- Y1: 7 × 2 and 8 × 25, mean 7.93. The random 20 alone give 7.95.
- Y1.B5.S5 (not drawn) has the same `make_ten {band:20}` label as Y1.B5.S4, and would score 7.

## Fix list for round 9 (skill, opts, step)

1. **N5r (gen.py line 332).**
   - Write `base = 'the same idea'` only when `related_topic(step, x) == 2`. Otherwise use `form_label(k, use)` with
     the rule-from-fix-2 judgement, or keep the related why's own text.
   - Extend `check_claims`: every why that contains "same idea" must cite only steps x with
     `related_topic(step, x) == 2`. Run `sameidea2.py` from the critic folder; it must report 0 of 150.
   - The 11 links are listed in section 3. With a correct label, each one can stay.
2. **N7(a) (gen.py line 311).**
   - Write "(X: a building block)" only when the pair (skill, the step's sub-idea) is in an explicit `BLOCKS` table in
     spec.py. Any other rank-1 candidate is not added, and the note says "Pre: n only; …" (rule 15 allows this).
   - Remove these links:
     - `counting:count_sequence {band:10, dir:'back'}` from the pre of R.B5.S1, R.B5.S2, R.B5.S3, R.B7.S3, R.B7.S4,
       R.B7.S8, R.B9.S1, R.B9.S2, R.B11.S1, R.B11.S9 and R.B13.S1. Keep it on R.B7.S1, R.B7.S2 and R.B11.S2.
     - `shapes_early:compose_shapes {shapes:[0,1]}` from the pre of R.B12.S1, R.B12.S2, R.B12.S3, R.B12.S4, R.B15.S1,
       R.B15.S8, Y1.B3.S1 and Y1.B3.S2.
     - `shapes_early:name_3d_shapes {forms:[1]}` from the pre of R.B15.S2, R.B15.S3, R.B15.S4, R.B15.S5, R.B15.S6
       and R.B15.S7.
     - `shapes_early:measure_nonstandard {}` from the pre of Y1.B8.S1 and Y1.B8.S4.
   - On Y1.B8.S3 and S5, the `measure_nonstandard` why becomes "Y1.B7.S2 measure length with cubes: the same
     measuring with units".
   - Give real `FORM_LABEL` entries to `cloze_addition` ("pick two numbers that make the total") and
     `order_objects_length` ("order three by length: the compare words").
3. **N7(b), misdescribing labels.**
   - Drop `composing:odd_even {forms:[2], range:10}` from the pre of R.B16.S1, R.B16.S2, R.B16.S3 and R.B16.S4. The
     skill is a last-digit rule, not pairs or sharing. Note: "odd_even names numbers by their last digit; sharing
     builds on counting and comparing groups".
   - On Y1.B5.S4 and Y1.B5.S5, replace `composing:make_ten {band:20}` with `composing:make_ten {band:10}` and the why
     "R.B11.S8 / Y1.B2.S7 the two parts of 10 on a frame", which is true on 64 of 64 items. Alternatively, keep band
     20 with the why "Y1.B5.S3 bonds to 20 on two frames".
   - Key `FORM_LABEL` lookups with the opts first (`form_label` already tries `k + opts`), so that a band-20 entry
     cannot borrow the band-10 text.
4. **D14.**
   - Drop `composing:select_even_odd {range:10}` from the related links of R.B9.S6, R.B11.S13 and R.B16.S5. Note:
     "select_even_odd deals 1-20 whatever the range (generator floor 20)".
   - Optionally, add an option proposal: `select_even_odd` with a `band:10` that lowers the floor to 10, closing those
     three related links.
   - Make `maxdealt.mjs` read the numbers on `q.options` labels (M2).
5. **D15.** On Y1.B2.S11, change the related `subtraction:missing_add_sub` opts to
   `{range:10, unknown:[1], task:[0]}`. The why stays "find a part in a number sentence (Y1.B2.S12, the same week)".
6. **M1.** In gen.py `ctypes`, add 'subtraction sentences' when `c19.minus >= 3`. Then either drop
   `number_families_add {band:10}` from the related links of Y1.B2.S1 and S2, or give it the why "the next week's
   family (Y1.B2.S4, W12)".

**Outlook.** Fixes 3, 4 and 5 lift the five steps scored 7 (plus Y1.B5.S5), which puts both means at 8.00 on this
sample. Fixes 1 and 2 close the two systematic classes. Both are mechanical changes in gen.py and spec.py, each with an
assertion. With them in place and no new class, round 9 should pass.
