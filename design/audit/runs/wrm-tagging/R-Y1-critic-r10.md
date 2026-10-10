# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 10

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `a2810ca5`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r9.md`
  - the round-10 sections of `R-report.md` and `Y1-report.md`, and `R-Y1-items.md`
  - `R.json` and `Y1.json` at r10 and at r9 (`5ed27d15`, for a step-by-step diff)
  - the r10 diff of `gen.py` (`addp`, `SUBS`, the D16 assert, the short-pre note) and `spec.py`
  - the `number_bonds` branch of `gen-counting.js`
  - the Kindergarten sheet of the xlsx
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r10/`. These are the r9 scripts with new seeds, plus these new ones:
  - `diff10.py`: every change between r9 and r10, step by step
  - `fix10.mjs`: 64 items on two fresh bases for every r9 fix link, reading the text, the cell payload, the visual,
    the hint and the options
  - `sib.py`: for each step with fewer than 3 pre, the pre links its block siblings carry and it lacks
  - `wholes.mjs`: the wholes that `number_bonds` deals
  - `regen/`: a scratch copy of the tree, in which `gen.py` was run again
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.
- **Reproducibility:** `gen.py` run on a scratch copy of `a2810ca5` exits 0, so the new D16 assertion passes. It
  writes `R.json` and `Y1.json` byte for byte. Its counts match both reports: R 16 / 70 / 33 and Y1 44 / 50 / 22;
  proposals 33 (11 new) and 47 (11 new); tag fixes 59 and 72.

## Verdict: FAIL (narrowly)

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 30 (20 random + 5 hard + 5 r9 sevens not drawn) | **7.97** | 1 | 29 | 7.95 |
| Y1 | 29 (20 random + 5 hard + 4 r9 sevens) | **7.97** | 1 | 28 | 8.00 |

- **Means and floor.** Both means are below 8, because of one step in each year. No step scores below 7.
- **Round-9 steps that scored 7.** All 10 now score 8:
  - R: R.B5.S3, R.B7.S4, R.B11.S9, R.B13.S1, R.B15.S3 and R.B17.S9
  - Y1: Y1.B9.S5, Y1.B9.S8, Y1.B9.S9 and Y1.B10.S6
- **What is fixed.** Every r9 fix item is in and holds on fresh seeds (section 1).
- **The two sevens.** Each is a single step with a precise fix:
  - **D19, R.B5.S6 "Composition of 4 and 5".** It is `full`, but `number_bonds {band:5}` deals wholes of 2 and 3 in
    12 of 64 and 30 of 64 items. The R steps "Find 4 and 5" and "Represent 4 and 5" are partial plus `number_focus`
    for exactly this reason. Its note ("wholes 3, 4 and 5, mostly 5") is false, and the same wrong fact sits in 4
    other texts.
  - **S1 residual, Y1.B3.S4 "Sort 2-D shapes".** It has 2 pre, and its main building block is missing: sorting with
    `classify_count`. The school's own W32 prior list names R.B1.S4-S6 (sorting); the skill's items sort a bag of
    circles, squares and triangles; and the sibling step Y1.B3.S2 carries it. Its note lists the rejected candidates
    without this one, so the short list reads as complete.
- **A regression from fix 1 (D18, not scored).** The new second rung of `count_objects` uses one of the three
  building-block slots. On four "1 more" / "1 less" steps it pushes out `compare_groups` (more / fewer / same). The
  three pre left are true blocks, so I do not lower the scores, but the fix is mechanical and should go in with the
  others.
- **Accepted classes.** Unchanged and still accepted:
  - `scan2` row B 7, `stalewhy` 8, `tmpl` 1, `bb` 13
  - `chkstruct` "link past the title number" 9, the same 9 as at r9

Fixes 1 and 2 below lift both sevens to 8. That puts both means at 8.00 on this sample with no step below 8.

## 1. Round-9 defects, re-checked on the print path with fresh seeds

Every link was generated 64 times on two bases never used before, 2410001 and 2470013 (`fix10.mjs`).

| r9 item | Status | Evidence (round 10) |
|---|---|---|
| Fix 1: S1 on the Represent steps (dice rung) | **fixed** | R.B3.S3, R.B5.S3 and R.B7.S4 carry `count_objects {band:5, objects:'dice'}`, each citing its Subitise step. 128 of 128 items: "How many dots are there?", a die face, maximum 5, number entry, hint "Touch each one as you count". `addp` now accepts a second opts of a listed key only when `objects` differs. |
| Fix 2: R.B11.S9 and R.B13.S1 | **fixed** | R.B11.S9 has `count_objects {band:10, objects:'frame'}` "count that each arrangement is still 10": 128 of 128 frame items, maximum 10. R.B13.S1 has `count_sequence {band:10, dir:'forward'}` "R.B11.S5 the number after: 10 and 1 more is 11": 128 of 128 "What number comes after #?", maximum 10. |
| Fix 3: Y1.B9 and Y1.B10.S6 | **fixed, two text slips** | Y1.B9.S5, S8 and S9 carry `compare_groups {band:10}`: one third each of more, fewer and same, maximum 10, hint "Match them one to one". Y1.B9.S5 has `count_objects {band:20}`, maximum 20. On S8 and S9, `fit()` lowered the band to 10 (the steps deal to 12), but the why still says "count the total, to 20" (M7). Y1.B10.S6 has `name_2d_shapes {forms:[1], shapes:[0,1,2]}`: circles, triangles, squares and rectangles, tap all. |
| Fix 4: D16 | **fixed** | `SUBS` now tests position, map, turn, scene and instruction words before "represent". Against r9, only R.B17.S9 changes class (find → position). The assert runs and passes on the regeneration. R.B17.S9 keeps `shape_positions {forms:[0]}` and `name_3d_shapes {forms:[1]}`, and its note is true. As a side effect, the stray `preBuild ['position_map']` is gone from Y1.B1.S2, S3 and S4, which is right. |
| Fix 5: D17 | **fixed** | R.B15.S3 is partial with "turning or flipping a shape so it fits a space". `compose_shapes {}` on 128 items still only asks "What shape do you make …?", so the partial is honest. The new `shape_fit_turn` has all the rule-13 fields, and its `closes` is the step's clause, not its `teaches`. A new proposal is right: `scenes` is about copying a picture, with "rotated" only as a level. |
| Fix 6: N7 residual | **fixed** | `BLOCK_EXCEPT` removes count back from Y1.B1.S4, `compose_shapes` from Y1.B3.S4 and the number track from Y1.B1.S10. |
| Fix 7: minor (M3, M4) | **fixed** | The picture-graph why is now "count a row of a picture graph". The items ask about one row ("How many cars?", "How many children like plums?"). R.B12.S2, S3 and S4 use `shapes:[0,1,2]`. |
| Sort-count links use pictures | **true** | `classify_count {band:3, objects:'pictures'}`: 128 items of apples, fish, balls and flowers, maximum 3. No squares appear before R.B6. |

## 2. The tagger's claims

| Claim | Judgement |
|---|---|
| All 7 r9 fixes are in | **True** (section 1). |
| `addp` takes a second opts when it changes the representation | **True.** It has one side effect (D18). |
| The building blocks were added | **True** for every step r9 named. |
| D16 (SUBS order and the assert) | **True.** |
| D17 (`shape_fit_turn`) | **True.** |
| All 79 short-pre steps were reviewed, and every note names what it rejected | **Mostly true.** In my sample of 20, no block is missing and every note is honest (section 3). Across all 79, one clear miss remains: Y1.B3.S4. Some notes give "this step's own skill" as the reason where the earlier rung has other opts and the real reason is the response mode (M8). |
| Y1.B9.S8 and S9: `{band:20}` not added because `{band:10}` is already a pre | **The outcome is right, but the account is not.** At r9 neither step had any `count_objects` pre. The hand-added `{band:20}` link was lowered to `{band:10}` by `fit()`, because the steps deal to 12, and it kept the why "to 20" (M7). |
| The remaining flags are the accepted classes | **True:** `scan2` B 7, `stalewhy` 8, `tmpl` 1, `bb` 13. |

## 3. Fewer than 3 pre (the lead's question, round 2)

Steps with fewer than 3 pre fell from 63 to 58 in R and from 23 to 21 in Y1.

**Sample.** `random.Random(101010).sample(steps_with_fewer_than_3_pre, 20)`:

| Step | Pre | Real block missing? | Note honest? |
|---|---|---|---|
| R.B1.S6 Create sorting rules | 1 | No. The earlier steps are gaps. | Yes |
| R.B1.S7 Compare amounts | 1 | No. It is the first compare step. | Yes |
| R.B2.S1 Compare size | 0 | No. It is the first step. | Yes |
| R.B2.S2 Compare mass | 1 | No. | Yes |
| R.B3.S2 Subitise 1, 2 and 3 | 2 | No. | Yes |
| R.B6.S3 Shapes in the environment | 2 | No. | Yes |
| R.B12.S1 Recognise 3-D shapes | 1 | No. | Yes; it names `compose_shapes` and `shape_attributes` |
| R.B12.S3 Use 3-D shapes for tasks | 2 | No. | Yes |
| R.B12.S5 More complex patterns | 1 | No. The AB rung of `shape_pattern` is a typed-name response. | Text only: it says "own skill" (M8) |
| R.B15.S7 Copy 2-D shape pictures | 2 | No. | Yes |
| R.B15.S8 2-D within 3-D | 2 | No. | Yes |
| R.B16.S1 Explore sharing | 2 | No. `odd_even` is rightly rejected: its items are "Which number is even?". | Yes |
| R.B17.S7 Give instructions to build | 2 | No. | Yes |
| R.B17.S8 Explore mapping | 2 | No. | Yes |
| R.B17.S11 Maps from stories | 2 | No. | Yes |
| Y1.B8.S1 Heavier and lighter | 2 | No. Its earlier steps use its own skill. | Yes |
| Y1.B10.S5 Recognise a quarter of a shape | 2 | No. The halves rung `partition_shapes {parts:[0]}` asks for a typed 1/2. | Text only (M8) |
| Y1.B10.S6 Find a quarter of a shape | 2 | No. `name_2d_shapes` was added. | Yes |
| Y1.B10.S8 Find a quarter of a quantity | 2 | No. | Yes |
| Y1.B14.S5 Time to the hour | 2 | No. Y1.B14.S1-S4 are gaps. | Yes |

**Result.** 0 of 20 miss a block, against 3 of 20 at r9. The notes are honest in substance.

**Across all 79** (`sib.py` plus the uncited school prior entries of every Y1 short-pre step, judged by hand), one
clear miss remains: **Y1.B3.S4 "Sort 2-D shapes" (W32)**.
- Its pre are `name_2d_shapes {shapes:[0,1]}` and `name_3d_shapes`.
- The school's W32 prior list names R.B1.S4 "Sort objects to a type", R.B1.S5 and R.B1.S6.
- `classify_count {band:6}` deals "Count only the squares." from a bag of circles, squares, triangles and stars, which
  is a shape sort.
- Y1.B1.S1 "Sort objects" teaches it at W23, and the sibling Y1.B3.S2 "Sort 3-D shapes" carries it.
- The note names `shape_name_match_3d`, `compose_shapes` and `compose_hexagon` as rejected, but not this skill.
- **The cause.** `related_topic(sort, shape2d)` is 0, and `BLOCKS[classify_count]` has no shape-sort entry. So
  neither the xlsx loop nor the block tier reaches it.
- **Score.** 7, on the r9 scale (a missed block under a note that reads as complete).

## 4. New defects

### D19. `number_bonds {band:5}` deals wholes 2-5, not 3-5. R.B5.S6 is a generous `full` (scored)

- **The generator** (`gen-counting.js`, `number_bonds`):
  - When the whole is the unknown, it is 3..band.
  - When a part is the unknown, the whole is `rng(answer + 1, band)`, so a whole of 2 (1 + 1) occurs.
- **The counts** (`wholes.mjs`):

  | Base | Whole 2 | Whole 3 | Whole 4 | Whole 5 |
  |---|---|---|---|---|
  | 2510007 | 5 | 7 | 31 | 21 |
  | 2610011 | 3 | 27 | 15 | 19 |

  At `{band:10}` the wholes are 3-10, and whole 2 is possible.
- **R.B5.S6 "Composition of 4 and 5"** is `full` on `number_bonds {band:5}`.
  - Wholes 2 and 3 are 12 and 30 of 64 items.
  - Rule 7, and the tagger's own precedent, make it partial: "Find 4 and 5" (R.B5.S1), "Represent 4 and 5"
    (R.B5.S3) and "Composition of 6, 7 and 8" (R.B9.S5) are all partial for a band that is wider than the window.
  - Its note, "30 seeds: wholes 3, 4 and 5, mostly 5", is false on both counts.
  - **Score 7.**
- **The same wrong fact in other texts.** These do not change a verdict, because each step is partial for another
  reason:
  - R.B5.S7, the step `missing` and the partial: "the wholes 1 and 2 never appear (band 5 deals wholes 3-5)"
  - R.B7.S7, the partial: "band 5 deals wholes 3-5"
  - R.B9.S5, the partial: "band 10 dealt wholes 4-10"
- **The check.** `notefacts` did not catch this, because it does not read "wholes" claims. Add the claim to it.
- **Scope.** No other `full` step has a number window in its title. I listed all 15 `full` steps with a number in
  the title, and the rest are "to N" or "within N" caps that their skills keep.

### D18. The second rung uses up the block tier (regression from r9 fix 1; not scored)

- **The mechanism.** In `gen.py` (around line 330) the block tier stops at `len(pre) >= 3`.
  - The new rule lets `count_objects` enter twice: dice from the Subitise step, and pictures from the Find step.
  - On these steps the second rung takes the third slot, which `compare_groups {band:5, level:[1]}` held at r9:
    - the 1 more step R.B3.S4
    - the 1 less steps R.B3.S5, R.B5.S5 and R.B7.S6
- **Why it matters.** Those steps lose the "more / fewer / same" block. Their siblings keep it: R.B11.S5 and S6 still
  have it. Each step is left with three counting representations (frame, dice, pictures) and nothing on comparison.
- **The Represent steps.** R.B3.S3, R.B9.S2 and R.B11.S3 also lose `compare_groups`, but there it was a weak block.
- **Scoring.** The three remaining pre are true blocks, so I score these steps 8. Rule 14 (rank by how directly it is a
  block) favours the comparison over a second representation of the same count.

### Minor (no score effect)

- **M6. Rule 12 on Y1.B9.S5, S8 and S9.**
  - The hand-added pair (`compare_groups`, `count_objects`) now fills two slots before the xlsx loop runs.
  - That loop admits a neighbouring-idea prior step only while `len(pre) < 2`. So the school's own W19 / W33 prior
    entry R.B9.S6 "Make pairs" (`odd_even {forms:[2], range:10}`, which r9 cited) is now neither cited nor named.
  - Its items are "Which number is even?", so it is a weak block. Either restore it, or name it in the note as rejected.
  - The same steps also no longer mention R.B16.S1 "Explore sharing" (a gap) in the note.
  - Y1.B9.S6 still cites "Make pairs" from the same school list.
- **M7.** Y1.B9.S8 and S9: `count_objects {band:10}` has the why "count the total, to 20".
- **M8. Notes that blame the step's own skill.** These notes say "the earlier steps on this idea use this step's own
  skill", where the earlier rung has different opts and is left out for its response mode (typed names or typed
  fraction notation):
  - Y1.B10.S5 (`partition_shapes {parts:[0]}`)
  - R.B12.S5 to S7 and R.B17.S1 (`shape_pattern {points:[0]}`)
- **M9.** R.B6.S2 is `full` on `compose_shapes {shapes:[1]}`, which deals exactly 2 distinct items, Square and
  Rectangle, on 128 of 128 items. The spec refuses this same signature as a link for that reason ("2 distinct, so it is
  not linked"). The content is right. Say so in the note, or add a variety option to the skill's build list.

## 5. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | 116 / 116 steps map to a K-sheet lesson. `priorwk` 153 / 153. No pre cites a Y1 step the school teaches later. | ok |
| Content weeks (`r19`, seed 2030001) | n/a | 0 | ok |
| Range (`rceil`, `scan2` A, `linkfit`, `optmax`; seeds 2020011 and 2040003) | 0 | 0 true flags (7 row-B flags accepted) | ok |
| Whole-file scan | 145 signatures, 60 items each, 0 errors | | ok |
| Response mode | `dpflags` is identical to r9: each typed-name or word-work partial names its missing clause | | ok |
| Verdicts (items regenerated for every graded step, seed 2510007) | **D19** | Y1.B3.S4 (pre, not a verdict) | defects |
| Proposals (rule 13 short spec, including `shape_fit_turn`) | 33, all fields, `closes` ≠ `teaches` | 47, the same | ok |
| Notes: `notefacts`, `sameidea`, `sameidea2`, `onidea` | 0 false of 111, 122 and 138; `onidea` 0 bad | | ok, apart from D19's "wholes" claim, which they do not read |
| Related whys (`relaudit`, 61 links, seed 2310009) | Unchanged from r9 except M3, which is now fixed | | ok |
| Structure (`chkstruct`) | No caps over 8, no pre ∩ related, no direct in related, no build in preBuild, no verdict inconsistencies | | ok |
| ≥ 3 pre, or a true note | Y1.B3.S4 | | 1 miss |

## 6. Per-step scores

**Sample.**
- Random draw: `random.Random(101001).sample(steps, 20)` per year, in file order.
- Fresh seeds, unused by any earlier round:
  - whole-file scan: base 2020011, 60 items per signature
  - rule 19: base 2030001
  - option and visual maxima: base 2040003
  - related audit: base 2310009
  - fix links: bases 2410001 and 2470013, 64 items each
  - graded-step items: base 2510007
  - bond wholes: bases 2510007 and 2610011
  - short-pre sample: `Random(101010)`
- **Scale.** The r1-r9 scale, unchanged:
  - A false "same idea" or "building block" reason on a link that still shares the step's domain is a text defect and
    does not lower the score.
  - A generous verdict, a pre from an unrelated domain, or a missed building block under a note that reads as
    complete scores 7.

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B1.S2 Match pictures and objects | 8 | The gap and the 0-pre note are honest. | none |
| R.B2.S2 Compare mass | 8 | Full; tap heavier or lighter. | none |
| R.B2.S5 Copy and continue simple patterns | 8 | The partial (typed names) is honest. | none |
| R.B4.S2 Compare circles and triangles | 8 | The partial is honest. | none |
| R.B4.S4 Describe position | 8 | The partial is honest. | none |
| R.B5.S4 1 more | 8 | Right. | none |
| **R.B5.S6 Composition of 4 and 5** | **7** | D19: `full`, but wholes 2-3 are 19-47% of items; the note is false. | Fix 1 |
| R.B7.S8 Conceptual subitising to 5 | 8 | The gap is right. | none |
| R.B9.S3 1 more | 8 | Right. | none |
| R.B9.S8 Make a double | 8 | The partial is right. | none |
| R.B9.S9 Combine 2 groups | 8 | The partial is right. | none |
| R.B10.S3 Explore height | 8 | Full. | none |
| R.B10.S5 Talk about time | 8 | The gap is right. | none |
| R.B10.S6 Order and sequence time | 8 | The gap is right. | none |
| R.B12.S5 Identify more complex patterns | 8 | M8 (text). | M8 |
| R.B13.S1 Build 10-13 (r9 7) | 8 | Fixed: `count_sequence` forward. | none |
| R.B14.S2 How many did I add | 8 | The partial is right. | none |
| R.B16.S3 Explore grouping | 8 | Right. | none |
| R.B16.S4 Grouping | 8 | Full. | none |
| R.B17.S2 Create own pattern rules | 8 | The gap is right. | none |
| R.B3.S4 1 more (hard) | 8 | D18: `compare_groups` pushed out (not scored). | Fix 3 |
| R.B3.S5 1 less (hard) | 8 | D18. | Fix 3 |
| R.B7.S6 1 less (hard) | 8 | D18. | Fix 3 |
| R.B11.S13 Explore even and odd (hard) | 8 | The frame count was added; the note is true. | none |
| R.B16.S1 Explore sharing (hard) | 8 | `odd_even` is rejected for a true reason. | none |
| R.B5.S3 Represent 4 and 5 (r9 7) | 8 | Fixed: the dice rung. | none |
| R.B7.S4 Represent 0 to 5 (r9 7) | 8 | Fixed. | none |
| R.B11.S9 Arrangements of 10 (r9 7) | 8 | Fixed. | none |
| R.B15.S3 Manipulate shapes (r9 7) | 8 | Fixed: partial plus `shape_fit_turn`. | none |
| R.B17.S9 Represent maps with models (r9 7) | 8 | Fixed (D16). | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S2 Count objects (W01) | 8 | Full. | none |
| Y1.B1.S9 1 less (W03) | 8 | Full. | none |
| Y1.B1.S12 <, >, = (W04) | 8 | The partial is honest. | none |
| Y1.B2.S6 Systematic bonds (W13) | 8 | The gap is right. | none |
| Y1.B2.S8 Add together (W14) | 8 | The partial is right. | none |
| Y1.B2.S12 Subtraction: find a part (W12) | 8 | Full. | none |
| Y1.B2.S14 Take away, cross out (W14) | 8 | The partial is right. | none |
| Y1.B4.S5 Understand 17, 18 and 19 (W21) | 8 | Partial plus `number_focus`. | none |
| Y1.B4.S12 Order numbers to 20 (W07) | 8 | The gap is right. | none |
| Y1.B5.S5 Near doubles (W17) | 8 | Full. | none |
| Y1.B5.S6 Subtract ones using bonds (W18) | 8 | The partial is right. | none |
| Y1.B5.S10 Missing number problems (W19) | 8 | Full at Max Number 20. | none |
| Y1.B6.S2 20, 30, 40 and 50 (W08) | 8 | The partial is right. | none |
| Y1.B6.S3 Count by making groups of tens (W22) | 8 | The partial is right. | none |
| Y1.B9.S3 Count in 5s (W33) | 8 | The partial is right. | none |
| Y1.B9.S6 Make arrays (W20) | 8 | Full. | none |
| Y1.B10.S4 Find a half of a quantity (W38) | 8 | Full. | none |
| Y1.B12.S4 The number line to 100 (W10) | 8 | Partial; `nl_20` covers the 0-100 line. | none |
| Y1.B12.S5 1 more, 1 less (W09) | 8 | Full. | none |
| Y1.B13.S2 Recognise coins (W35) | 8 | Full (US coins). | none |
| **Y1.B3.S4 Sort 2-D shapes (W32, hard)** | **7** | S1 residual: no `classify_count`. | Fix 2 |
| Y1.B1.S4 Represent objects (W01, hard) | 8 | Count back removed; 5 true pre. | none |
| Y1.B1.S10 Compare groups by matching (W03, hard) | 8 | The number track removed. | none |
| Y1.B10.S5 Recognise a quarter of a shape (W37, hard) | 8 | M8 (text). | M8 |
| Y1.B14.S6 Time to the half hour (W36, hard) | 8 | Right. | none |
| Y1.B9.S5 Add equal groups (W19, r9 7) | 8 | Fixed. M6. | Fix 4 |
| Y1.B9.S8 Equal groups: grouping (W33, r9 7) | 8 | Fixed. M6, M7. | Fix 4 |
| Y1.B9.S9 Equal groups: sharing (W33, r9 7) | 8 | Fixed. M6, M7. | Fix 4 |
| Y1.B10.S6 Find a quarter of a shape (W38, r9 7) | 8 | Fixed. | none |

**Distribution.**
- R: 7 × 1 and 8 × 29, mean 7.97. The random 20 alone give 7.95.
- Y1: 7 × 1 and 8 × 28, mean 7.97. The random 20 alone give 8.00.

## Fix list for round 11 (skill, opts, step)

1. **D19, R.B5.S6 and the bond texts.**
   - R.B5.S6 becomes `partial`:
     - partial: `composing:number_bonds {band:5}`, with the missing clause "the wholes 4 and 5 only (band 5 also deals
       wholes 2 and 3)"
     - build: reuse `number_focus` (it already lists `number_bonds`; add R.B5.S6 to its steps, `closes` "R.B5.S6:
       composing only the wholes 4 and 5")
     - note: replace "30 seeds: wholes 3, 4 and 5, mostly 5" with "wholes 2-5; never 1 and never a zero part".
   - Correct the other texts. Every verdict stays partial:
     - R.B5.S7: "whole 1 and a zero part never appear (band 5 deals wholes 2-5)", in both the step `missing` and the
       partial
     - R.B7.S7: "whole 1 and a zero part (5 = 5 + 0) never appear; band 5 deals wholes 2-5"
     - R.B9.S5: "band 10 deals wholes 2-10"
   - Add the "wholes" claims to the note-fact check.
2. **S1 residual, Y1.B3.S4.**
   - Add `comparing:classify_count {band:6}` as the first pre, with the why "Y1.B1.S1 Sort objects / R.B1.S4-S6 (school
     prior learning, week W32): sort a bag of shapes, count one kind".
   - Either add a sort-of-shapes entry to `BLOCKS[classify_count]` (a 'shape2d' step whose title says "sort"), or
     `prepre` it.
   - Re-run `sib.py`, or an equivalent: any skill a block sibling carries that a short-pre step lacks.
3. **D18, the second rung and the block tier.**
   - In `gen.py`, do not let a second rung of an already-listed key count toward the block tier's `len(pre) >= 3` stop.
     For example, count distinct keys there.
   - Or add a second rung only on Find, Represent or Subitise steps.
   - Restore `comparing:compare_groups {band:5, level:[1]}` with the why "R.B1.S7 compare two groups: more, fewer,
     same" on R.B3.S4, R.B3.S5, R.B5.S5 and R.B7.S6.
4. **M6 and M7, Y1.B9.S5, S8 and S9.**
   - Run the xlsx prior loop before the hand-added `S[_s]['p']` links. Alternatively, do not count the hand links in
     its `len(pre) < 2` test.
   - Then R.B9.S6 "Make pairs" (`composing:odd_even {forms:[2], range:10}`, prior W19 / W33) is back, as on Y1.B9.S6.
     If it is judged not a block, name it in the note.
   - On S8 and S9, change the why on `count_objects {band:10}` to "count the total, to 10".
5. **Minor.**
   - M8: where the earlier rung has other opts, the note should give the real reason ("its response is typed names" or
     "typed fraction notation"), not "this step's own skill":
     - Y1.B10.S5
     - R.B12.S5, S6 and S7
     - R.B17.S1
   - M9: R.B6.S2's note should say that `compose_shapes {shapes:[1]}` deals two items (square, rectangle).

**Outlook.** Fixes 1 and 2 are two steps and a handful of texts. They lift both sevens, which puts both means at 8.00
on this sample with no step below 8. Fix 3 is a two-line change in `gen.py` that undoes the one regression this round
introduced. Fix 4 restores a school prior-learning citation. With these in place, round 11 should pass.
