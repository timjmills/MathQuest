# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 11

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `27f4cd56`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r10.md`
  - the round-11 sections of `R-report.md` and `Y1-report.md`, and the r11 diff of `R-Y1-items.md`
  - `R.json` and `Y1.json` at r11 and at r10 (`2aae1876`), compared step by step
  - the r11 diffs of `gen.py` and `spec.py`, including `pl`, the distinct-key block tier, the M8 note reasons and
    `SIB_REJECT`
  - the tagger's `sib2.py`, `sib2.txt` and `sib2b.txt`
  - the `count_sequence` and `number_bonds` branches of `gen-counting.js`
  - the Kindergarten sheet of the xlsx
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r11/`. These are the r10 scripts with new seeds, plus:
  - `fix11.mjs`: 64 items on two fresh bases for any list of links. It reads the text, the answers, the cell payload,
    the visual, the hint and the options.
  - `diff11.out`: every change between r10 and r11, step by step
  - `sib3.py`: for each step with fewer than 3 pre, every same-sub-idea pre a block sibling carries. It reports whether
    the step adds that pre or names it in its note.
  - `csb.mjs` and `ml.mjs`: the numbers that `count_sequence`, `more_less_10` and `number_seq_fill` actually ask about
  - `regen/`: a scratch copy of the tree, where `gen.py` was run again
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.
- **Reproducibility:** `gen.py` on a scratch copy of `27f4cd56` writes `R.json` and `Y1.json` byte for byte. Its counts
  match both reports:
  - R: 15 full, 71 partial, 33 gap
  - Y1: 44 full, 50 partial, 22 gap
  - proposals: 33 in R (11 new) and 47 in Y1 (11 new)
  - tag fixes: 60 in R and 72 in Y1

## Verdict: FAIL (narrowly, Y1 only)

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 28 (20 random + 5 hard + the r10 seven + 2 that gained links) | **8.00** | 0 | 28 | 8.00 |
| Y1 | 32 (20 random + 5 hard + the r10 seven + 6 that gained links) | **7.97** | 1 | 31 | 8.00 |

- **What is fixed.** Every r10 item is in and holds on fresh seeds (section 1). Both r10 sevens, R.B5.S6 and
  Y1.B3.S4, now score 8.
- **The additions.** All 8 steps that gained links score 8. Every added link fits the step's size and school week,
  and is a defensible building block. Three of the whys need rewording (section 2).
- **The rejections.** I checked 12 of the 19 named rejections against the school weeks and the items, and all 12 are
  true. `sib3.py` finds 37 same-idea sibling candidates on the short-pre steps: none is missing, and none is left
  unnamed.
- **The one seven, Y1.B1.S9 "1 less" (D20, new).** It is `full` on `count_sequence {band:10, dir:'back'}`. The
  generator puts the blank in the first of five boxes, so the number asked about is at most `band − 3`. Over 200 items,
  "1 less than 8", "1 less than 9" and "1 less than 10" never appear. Rule 7 says a `full` step must reach the top of
  its range ("14-20 must include 20"). The step is generous by the same rule the tagger already applies to R.B9.S4,
  whose missing clause names "one less than … 8".
- **A regression (N7r, text only).** The D18 fix lets the block tier keep adding until it has 3 distinct skills. On
  five Y1 steps that already had 3 or more pre, this re-admits "a building block" claims that earlier critics judged
  false (r8 N7a, r9 N7 residual). These are in-domain, in-week and the right size, so on the r1-r10 scale they are text
  defects and do not lower a score. The fix is four `BLOCK_EXCEPT` entries.

Fix 1 below lifts Y1 to 8.00 on this sample, with no step below 8. **Round 12 should then pass, provided Fix 2 (the N7r
entries) goes in with it, so that no regression class remains.**

## 1. Round-10 defects, re-checked on the print path with fresh seeds

Every link was generated 64 times on two bases never used before, 3110003 and 3170011 (`fix11.mjs`). The bond wholes
were also counted on those bases at band 10 (`wholes.mjs`).

| r10 item | Status | Evidence (round 11) |
|---|---|---|
| Fix 1: D19, R.B5.S6 and the bond texts | **fixed, 2 stale texts left** | R.B5.S6 is now partial on `number_bonds {band:5}`, with "the wholes 4 and 5 only (band 5 also deals wholes 2 and 3)". The build is `number_focus`, which lists R.B5.S6 in its steps and has a matching `closes`. The wholes, counted on 64 items per base: at band 5, {2:1, 3:8, 4:30, 5:25} and {2:2, 3:27, 4:15, 5:20}; at band 10, wholes 2-10 on one base and 3-10 on the other. The notes on R.B5.S6, S7, R.B7.S7 and R.B9.S5 ("wholes 2-5", "wholes 2-10") are now true. **Still false (M10):** the `band_3` proposal's why ("number_bonds never deals a whole below 3"), and the R.B11.S8 tag-fix why ("deals wholes 4-10"). The r10 request to teach the note-fact check the "wholes" claims was not done; that is how these two survived. |
| Fix 2: Y1.B3.S4 | **fixed** | Its first pre is `classify_count {band:6}`, with a why that cites the school's W32 prior list. Its 128 items read "Count only the squares / triangles / circles / stars." from a mixed bag of shapes, maximum 6. |
| Fix 3: D18, the second rung and the block tier | **fixed, with a side effect (N7r)** | `compare_groups {band:5, level:[1]}` is back on R.B3.S4, R.B3.S5, R.B5.S5 and R.B7.S6. Its 128 items: one third each of more, fewer and same; maximum 5; hint "Match them one to one". The same rule added sound links on R.B3.S3, R.B9.S1, R.B9.S2, R.B11.S1, R.B11.S3, Y1.B1.S4 and Y1.B4.S7. It also re-admitted the judged-false blocks listed in section 3. |
| Fix 4: M6 and M7, Y1.B9.S5, S8 and S9 | **fixed** | The `pl` hand links now come after the school loop. R.B9.S6 "Make pairs" is named as rejected on all three steps, with a true reason: `odd_even {forms:[2]}` gives 64 of 64 "Which number is even / odd?". On S8 and S9 the why reads "count the total, to 10", and `count_objects {band:10}` deals a maximum of 10. |
| Fix 5: M8 (notes that blamed the step's own skill) | **fixed** | Y1.B10.S5, R.B12.S5, S6, S7 and R.B17.S1 now give the real reason: typed shape names, or typed fraction notation. On R.B12.S7 and R.B17.S1, "own skill" remains only where the earlier rung is the same signature, which is true. |
| Fix 5: M9, R.B6.S2 | **fixed** | The note says that `compose_shapes {shapes:[1]}` deals only square and rectangle. 128 of 128 items agree. |

## 2. The links added from the sibling review

All the cited steps are taught by the step's school week. No pre cites a Y1 step that the school teaches later: 0 of
the checked links (`priorwk` 153 of 153; `scan2` 0).

| Step (week) | Added | What 128 items show | Judgement |
|---|---|---|---|
| R.B17.S4 Replicate and build scenes (gap) | `name_2d_shapes {forms:[1], shapes:[0,1,2]}`, `name_3d_shapes {forms:[1]}` | "Click ALL the triangles / circles / squares / rectangles." and "Click ALL the spheres / cubes / cones / cylinders.", tap all. | **True blocks.** Copying a scene needs the names of its pieces. The links sit with `compose_shapes` and `shape_positions`. |
| R.B17.S7 Give instructions to build (partial) | `name_3d_shapes {forms:[1]}`, `compose_shapes {shapes:[0,1]}` | The solids as above. "What shape do you make when you put these two shapes together?", with triangle, square and rectangle evenly. | **True for the names.** Composing is a weaker block, but it is defensible: an instruction to build says which piece goes where. Positions stay first, as they should. |
| Y1.B10.S2 half of a shape (W37); Y1.B10.S5 quarter of a shape, recognise (W37); Y1.B10.S6 quarter of a shape, find (W38) | `share_into_groups {band:12}`, why "R.B16 grouping into equal groups: equal parts" | "There are 12 counters. Make groups of 3 / 4 / 5 / 6. How many groups are there?" Answers 2-4; maximum 12. | **Accepted as a secondary block.** WRM puts multiplication and division directly before fractions in Y1, so "equal groups" is the precursor of "equal parts". It ranks after the shape blocks on S2 and S5. The why should say what the items do: they are **grouping** (how many groups), not sharing into 2 or 4 parts (M12). |
| Y1.B10.S6 (W38) | `compose_shapes {shapes:[0,1]}` | As above. | **Accepted.** Two shapes make one shape is the inverse of splitting one shape into parts. **Side effect (M13):** with three distinct pre now in place, the block tier stops before `halve {band:10}`, which was a pre here at r10. The note does not name it. Its siblings S7 and S8 keep it, with "a quarter is half of a half". |
| Y1.B10.S7 quarter of a quantity, recognise (W38); Y1.B10.S8 quarter of a quantity, find (W38) | `double {band:20}`, why "Y1.B9.S7 doubles: two equal groups (a quarter is half of a half)" | "Double n", with answers 4-20 and hint "Double means ×2. Think: 8 + 8 = ?". Maximum 20. The steps' own `fraction_of_set` deals up to 18. | **Accepted.** The doubles facts are the facts that halving undoes, and Y1.B9.S7 is W20. But the bracket justifies `halve`, which is already a pre here, not `double`. Reword it, for example "doubles: two equal groups; halving undoes a double" (M12). |
| Y1.B14.S6 time to the half hour (W36) | `count_sequence {band:20, dir:'forward'}`, why "Y1.B4.S7 the order of the numbers 1 to 12 round the clock" | "What number comes after n?", n = 3-19; maximum 20. | **Accepted as a third block** after `time_hour` and `clock_parts`. The why says 1 to 12, but the items go to 20, and `count_sequence` has no band 12. Use the wording that Y1.B14.S5 already has: "the order of the numbers to 20 (1 to 12 on the clock)" (M11). |

**The 19 named rejections.** I checked 12 of them. For the "comes later" reasons I used the school weeks: Y1.B14.S2
and S3 are W28, Y1.B14.S1 is W35, Y1.B14.S4 and S5 are W36, Y1.B10.S3 and S5 are W37, and Y1.B10.S4 is W38. For the
"different idea" reasons I used the items. The 12:
- R.B1.S1-S3, R.B6.S1, R.B15.S1 and R.B17.S8
- Y1.B3.S1, Y1.B8.S1 and Y1.B8.S4
- Y1.B10.S3 and Y1.B10.S5
- Y1.B14.S4

All 12 are true. `sib3.py` over all 70 short-pre steps finds 37 same-idea sibling candidates. Each is either added or
named in the step's note: none is unnamed.

## 3. New defects

### D20. `count_sequence` never asks about the top three numbers going back, or the bottom three going forward. Y1.B1.S9 is a generous `full` (scored)

- **The generator** (`gen-counting.js`, `count_sequence`): the blank is the first or last of a five-box window that
  never clamps.
  - `before`: `anchor = rng(1, top − 3)`
  - `after`: `anchor = rng(3, top − 1)`
- **The counts** (`csb.mjs`, bases 3610001 and 3670009, 100 items each):

  | Opts | Answers dealt | Never dealt |
  |---|---|---|
  | `{band:10, dir:'back'}` | 0-6 | 1 less than 8, 9 and 10 |
  | `{band:10, dir:'forward'}` | 4-10 | 1 more than 0, 1 and 2 |
  | `{band:20}` (mixed) | 0-20 | nothing; the "between" form covers both ends |

- **Y1.B1.S9 "1 less" (W03)** is `full` on `{band:10, dir:'back'}`.
  - Three of the ten facts within 10 never appear, the top one among them.
  - Rule 7 makes this partial. The tagger's own R.B9.S4 already names "one less than … 8" as missing.
  - **Score: 7.**
- **Y1.B1.S7 "1 more" (W02)** does reach the top (1 more than 9 is 10). It misses only 1 more than 0, 1 and 2, the
  easiest facts, which Reception covers. That is a cap, kept as a cap, so the score is 8. Its note should say this.
- **Every other use is fine:**
  - R.B3.S4 to R.B11.S6 are partial, and their missing clauses cover the window.
  - Y1.B1.S6 and S8 also have `number_seq_fill` on range 10, which covers both ends of 0-10. Going back, its tracks
    start at 10, 9 and 8.
  - Y1.B4.S7 is the mixed band 20, and `more_less_10 {step:1, band:20}` asks "1 less than 20" and "1 more than 19".

### N7r. The distinct-key block tier re-admits judged-false "building block" claims (regression from the D18 fix; text, not scored)

- **The mechanism.** `gen.py` now continues the block tier until it has 3 distinct keys. The tier used to stop at 3
  pre.
  - Steps whose 3 or more pre share fewer than 3 keys now take one or two more neighbouring-idea skills.
  - `BLOCKS` admits these skills for the step's sub-idea.
  - `BLOCK_EXCEPT` listed only the r9 sibling cases.
- **The steps.** Each already had 3-4 sound pre:

  | Step | Re-admitted pre | Earlier ruling |
  |---|---|---|
  | Y1.B1.S2 Count objects (W01) | `count_sequence {band:10, dir:'back'}` "count back: a building block" | r8 N7a: finding and counting an amount build on counting forward and cardinality, not on the number before |
  | Y1.B1.S3 Count objects from a larger group (W01) | the same | the same |
  | Y1.B1.S11 Fewer, more, same (W03) | `number_seq_fill {step:1, dir:'back', range:10}` "the number track: a building block" | r9: the same link on Y1.B1.S10 is not a block of comparing groups |
  | Y1.B3.S3 Recognise and name 2-D shapes (W31) | `compose_shapes {shapes:[0,1]}` "two shapes make a new shape: a building block" | r8 N7a: composing uses the names; it is not a block of naming |

- **Y1.B1.S12** "<, >, =" also gained the backward number track. That one is defensible, because later on a track
  means greater.
- **Not scored.** The links are in-domain, in-week and the right size. On the r1-r10 scale a false "building block"
  reason on such a link is a text defect. But it is a regression of a class that two earlier rounds fixed, so it must go
  in Fix 2.

### Minor (no score effect)

- **M10. Stale "wholes" facts** (from D19):
  - `band_3.why`: "number_bonds never deals a whole below 3 or a zero part". Whole 2 appears.
  - The R.B11.S8 tag fix: "number_bonds {band:10} deals wholes 4-10". It deals 2-10 or 3-10.
  - Add the "wholes" claims to the note-fact check, as r10 asked.
- **M11.** Y1.B14.S6: the why on `count_sequence {band:20}` says "1 to 12", but the items go to 20.
- **M12.** The why texts on two added links:
  - Y1.B10.S7 and S8 `double`: the bracket "a quarter is half of a half" justifies `halve`, not `double`.
  - Y1.B10.S2, S5 and S6 `share_into_groups`: the items group (how many groups of n), they do not share.
- **M13.** Y1.B10.S6: `halve {band:10}` was pushed out by the additions and is not named in the note.
- **M14.** R.B1.S4 and S5: the partial `classify_count {band:3, tiles:2}` / `{band:3}` deals squares, stars,
  triangles and circles. The tagger's own content rule keeps squares out of Reception before block 6, and its pre
  links already use `{band:3, objects:'pictures'}` (apples, flowers, balls, fish). Use the pictures opts on the step's
  own partial too. Both steps stay partial.

## 4. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | 116 / 116 steps map to a K-sheet lesson. `priorwk` 153 / 153. 0 pre cite a Y1 step the school teaches later. | ok |
| Content weeks (`r19`, base 3030001) | n/a | 0 | ok |
| Range (`rceil` 0, `scan2` A 0, `linkfit`, `optmax`; bases 3020011 and 3040003) | 0 | 0 true flags; the 7 row-B flags are accepted, as at r10 | ok, apart from D20 (a range end missed inside the cap, which these checks do not test) |
| Whole-file scan (145 signatures, 60 items each) | 0 errors | | ok |
| Response mode (`dpflags`) | Unchanged from r10 apart from counts; each typed-name or word-work partial names its missing clause | | ok |
| Verdicts (items regenerated for every graded step, base 3510007) | ok | **D20** (Y1.B1.S9) | 1 defect |
| Proposals (rule 13: name, kind, teaches, closes, representation; `closes` ≠ `teaches`; every build lists the step) | 33, 0 faults | 47, 0 faults | ok, apart from M10 |
| Notes (`notefacts`, `sameidea`, `sameidea2`, `onidea`) | 0 false of 93, 122 and 138; `onidea` 0 bad | | ok, apart from M10 |
| Structure (`chkstruct`) | No caps over 8, no pre ∩ related, no direct in related, no build in preBuild, no verdict inconsistencies. "Link past the title number": the same 9 as at r10 (accepted). | | ok |
| ≥ 3 pre, or a true note (`few`, `sib3`) | 56 short, all noted | 14 short, all noted | ok |
| Accepted classes (`scan2` B 7, `stalewhy` 8, `tmpl` 1, `bb`) | Unchanged | | ok |

## 5. Per-step scores

**Sample.**
- Random draw: `random.Random(111011).sample(steps, 20)` per year, in file order.
- Fresh seeds, unused by any earlier round:
  - whole-file scan: base 3020011
  - rule 19: base 3030001
  - option maxima: base 3040003
  - fix and added links: bases 3110003 and 3170011, 64 items each
  - extra links: base 3220007
  - graded-step items: base 3510007
  - `count_sequence` and `more_less_10` ends: bases 3610001 and 3670009
- **Scale.** The r1-r10 scale, unchanged:
  - A false "building block" or "same idea" reason on a link that still shares the step's domain is a text defect and
    does not lower the score.
  - A generous verdict, a pre from an unrelated domain, or a missed building block under a note that reads as complete
    scores 7.

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B1.S2 Match pictures and objects | 8 | The gap and the rejection of `classify_count` (taught later) are true. | none |
| R.B1.S4 Sort objects to a type | 8 | The partial is honest. M14 (opts). | M14 |
| R.B1.S6 Create sorting rules | 8 | The gap is right. | none |
| R.B2.S1 Compare size | 8 | The partial is right: length, height and thickness only. | none |
| R.B3.S2 Subitise 1, 2 and 3 | 8 | The partial is right. | none |
| R.B3.S5 1 less | 8 | D18 fixed: `compare_groups` is back. | none |
| R.B6.S2 Combine shapes with 4 sides | 8 | M9 fixed. | none |
| R.B6.S4 My day and night | 8 | The gap is right. | none |
| R.B7.S3 Subitise 0 to 5 | 8 | The partial is right. | none |
| R.B7.S6 1 less | 8 | D18 fixed. | none |
| R.B7.S7 Composition | 8 | The wholes text is now true. | none |
| R.B8.S3 Explore capacity | 8 | The gap is right. | none |
| R.B9.S3 1 more | 8 | The partial is right. | none |
| R.B9.S10 Conceptual subitising | 8 | The gap is right. | none |
| R.B11.S8 Bonds to 10 | 8 | Full. M10, in its tag fix. | M10 |
| R.B11.S9 Arrangements of 10 | 8 | The partial is right. | none |
| R.B11.S13 Explore even and odd | 8 | The partial is right. | none |
| R.B13.S4 Continue patterns (14-20) | 8 | The partial and its counts are right. | none |
| R.B16.S6 Play with and build doubles | 8 | The partial is right. | none |
| R.B17.S2 Create own pattern rules | 8 | The gap is right. | none |
| R.B5.S6 Composition of 4 and 5 (r10 7) | 8 | Fixed (D19). | none |
| R.B3.S6 Composition of 1, 2 and 3 (hard) | 8 | The partial is honest. | none |
| R.B5.S7 Composition of 1-5 (hard) | 8 | The text is now true. | none |
| R.B9.S4 1 less (hard) | 8 | The missing clause covers D20's window ("one less than … 8"). | none |
| R.B9.S5 Composition of 6, 7 and 8 (hard) | 8 | The observed wholes are true. | none |
| R.B11.S3 Represent 9 and 10 (hard) | 8 | Partial plus `number_focus`; `compare_groups` restored. | none |
| R.B17.S4 Replicate scenes (gained links) | 8 | True blocks. | none |
| R.B17.S7 Give instructions to build (gained links) | 8 | Accepted. | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S2 Count objects (W01) | 8 | N7r: count back (text). | Fix 2 |
| Y1.B1.S4 Represent objects (W01) | 8 | Right; `compare_groups` added. | none |
| Y1.B1.S6 Count on from any number (W02) | 8 | Full. | none |
| Y1.B1.S8 Count backwards within 10 (W03) | 8 | Full: the track reaches 10. | none |
| Y1.B1.S15 The number line (W05) | 8 | The gap is right. | none |
| Y1.B2.S3 Write number sentences (W11) | 8 | The partial is right. | none |
| Y1.B2.S17 Add or subtract 1 or 2 (W16) | 8 | The partial is right. | none |
| Y1.B3.S2 Sort 3-D shapes (W31) | 8 | The gap is right. | none |
| Y1.B3.S5 Patterns with 2-D and 3-D shapes (W32) | 8 | The partial is right. | none |
| Y1.B4.S3 Understand 11, 12 and 13 (W21) | 8 | Partial plus `number_focus`. | none |
| Y1.B4.S4 Understand 14, 15 and 16 (W21) | 8 | The same. | none |
| Y1.B4.S8 The number line to 20 (W06) | 8 | The gap is right; the week note is true. | none |
| Y1.B4.S12 Order numbers to 20 (W07) | 8 | The gap is right. | none |
| Y1.B5.S7 Subtraction: counting back (W18) | 8 | Full: a 0-20 line. | none |
| Y1.B7.S3 Measure in centimetres (W25) | 8 | The partial (inches only) is right. | none |
| Y1.B8.S1 Heavier and lighter (W25) | 8 | Full; the rejection is true. | none |
| Y1.B8.S5 Compare volume (W27) | 8 | The gap is right. | none |
| Y1.B9.S9 Equal groups: sharing (W33) | 8 | Fixed (M6, M7). | none |
| Y1.B12.S7 Compare any two numbers (W34) | 8 | Full. | none |
| Y1.B13.S2 Recognise coins (W35) | 8 | Full (US coins). | none |
| Y1.B3.S4 Sort 2-D shapes (W32, r10 7) | 8 | Fixed: `classify_count` comes first. | none |
| **Y1.B1.S9 1 less (W03, hard)** | **7** | D20: `full`, but 1 less than 8, 9 and 10 never appear. | Fix 1 |
| Y1.B1.S3 Count from a larger group (W01, hard) | 8 | N7r (text). | Fix 2 |
| Y1.B1.S11 Fewer, more, same (W03, hard) | 8 | N7r (text). | Fix 2 |
| Y1.B3.S3 Name 2-D shapes (W31, hard) | 8 | N7r: `compose_shapes` (text). | Fix 2 |
| Y1.B9.S5 Add equal groups (W19, hard) | 8 | Fixed (M6). | none |
| Y1.B10.S2 Find a half of a shape (W37, gained) | 8 | Accepted; M12 (text). | M12 |
| Y1.B10.S5 Recognise a quarter of a shape (W37, gained) | 8 | Accepted; M12. | M12 |
| Y1.B10.S6 Find a quarter of a shape (W38, gained) | 8 | Accepted; M12, M13. | M12, M13 |
| Y1.B10.S7 Recognise a quarter of a quantity (W38, gained) | 8 | Accepted; M12. | M12 |
| Y1.B10.S8 Find a quarter of a quantity (W38, gained) | 8 | Accepted; M12. | M12 |
| Y1.B14.S6 Time to the half hour (W36, gained) | 8 | Accepted; M11. | M11 |

**Distribution.**
- R: 8 × 28, mean 8.00. The random 20 alone give 8.00.
- Y1: 7 × 1 and 8 × 31, mean 7.97. The random 20 alone give 8.00.

## Fix list for round 12 (skill, opts, step)

1. **D20, Y1.B1.S9 "1 less".** Choose one of these:
   - **(a) Keep `full`.** Add `counting:number_seq_fill {step:1, dir:'back', range:10}` as a second direct skill.
     - It is Y1.B1.S8's own skill, and it is a pre here today: move it from pre to direct.
     - Its tracks start at 10, 9 and 8 (`ml.mjs`), so it asks "1 less than 10, 9 and 8".
     - Add a note: "count_sequence back asks about 1-7 only (five-box window); the backward track covers 8-10".
   - **(b) Make it `partial`.**
     - Put it on `count_sequence {band:10, dir:'back'}`, with missing "1 less than 8, 9 and 10 (the number asked
       stops at band − 3)".
     - Add a new option proposal `seq_window_ends` on `counting:count_sequence`:
       - teaches: "every anchor is dealt: before 1..band and after 0..band − 1; the five-box window slides instead of
         clipping"
       - closes: "Y1.B1.S9: 1 less than 8, 9 and 10"
       - representation: "the same five-box path, the window shifted to fit"
   - **Either way:**
     - Add to Y1.B1.S7's note: "1 more than 0, 1 and 2 are not dealt (window); Reception covers them".
     - Teach the range check (`rceil` / `linkfit`, or `maxdealt`) the minimum and maximum the skill *asks about*, not
       only the largest number printed.
2. **N7r, the block-tier regression.**
   - Add to `BLOCK_EXCEPT`:
     - `(CS, 'Y1.B1.S2')`
     - `(CS, 'Y1.B1.S3')`
     - `(NSF, 'Y1.B1.S11')`
     - `(CMP, 'Y1.B3.S3')`
   - Then re-run the r10/r11 block-claim audit (`bblist`) over every step whose pre count changed between r10 and r11.
   - Each step keeps 3 or more pre without these links.
3. **Minor.**
   - **M10:**
     - `band_3.why` → "number_bonds never deals whole 1 or a zero part (band 5 deals wholes 2-5)"
     - R.B11.S8 tag fix → "number_bonds {band:10} deals wholes 2-10; bonds to 10 are make_ten"
     - Add the "wholes" claims to `notefacts`.
   - **M11:** Y1.B14.S6 why → "Y1.B4.S7 the order of the numbers to 20 (1 to 12 on the clock)".
   - **M12:**
     - Y1.B10.S7 and S8 `double` why → "Y1.B9.S7 doubles: two equal groups; halving undoes a double"
     - Y1.B10.S2, S5 and S6 `share_into_groups` why → "R.B16.S4 / Y1.B9.S8 make equal groups (how many groups of n):
       equal parts"
   - **M13:** Y1.B10.S6: either restore `halve {band:10, range:10}` "Y1.B10.S4 half of a quantity; a quarter is half
     of a half" (it is taught earlier in W38), or name it in the note.
   - **M14:** R.B1.S4 and R.B1.S5: partial `classify_count` opts → `{band:3, objects:'pictures'}` (R.B1.S4 also keeps
     `tiles:2`). Both stay partial with the same missing clauses.

**Outlook.** Fix 1 is one step and Fix 2 is four lines in `spec.py`. With both in, this sample stands at R 8.00 and Y1
8.00, with no step below 8 and no regression class open. Round 12 should pass.
