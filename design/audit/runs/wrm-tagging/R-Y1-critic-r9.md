# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 9

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `fb8e2b1d`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r8.md`
  - the round-9 sections of `R-report.md` and `Y1-report.md`, and `R-Y1-items.md`
  - `data/curriculum/links/R.json` and `Y1.json`, at r9 and at r8 (`b5277a42`, for the diff)
  - `gen.py` (`build`, `addp`, `is_block`, `check_claims`, `SUBS`), and the r9 block of `spec.py` (`BLOCKS`, `BLOCK_EXCEPT`)
  - the Kindergarten and Grade 1 sheets of the xlsx
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r9/`. These are my r8 scripts with new seeds, the tagger's
  `relaudit.mjs` with a new seed, and these new ones:
  - `r8fix.py`: every r8 removal and rewrite, checked in the files
  - `preaudit.py`: every distinct pre link (skill + opts) with all its whys, beside 60 generated items
  - `subs.py`: the sub-idea that `gen.py`'s `SUBS` gives every step (the "same idea" and BLOCKS checks rely on it)
  - `few.py` and `dropped.out`: the steps with fewer than 3 pre, and every pre link dropped between r8 and r9
  - `priormiss.py`: the xlsx prior-learning entries a step does not cite
  - `cnt.mjs` and `d15.mjs`: 64-item summaries on fresh seeds
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.

## Verdict: FAIL

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 27 (20 random + 5 hard + 2 r8 sevens) | **7.78** | 6 | 21 | 7.85 |
| Y1 | 26 (20 random + 5 hard + 1 r8 seven not drawn) | **7.85** | 4 | 22 | 7.90 |

- **Means and floor.** Both means are below 8. No step scores below 7.
- **Round-8 steps that scored 7.** All 6 now score 8: R.B16.S1, R.B16.S5, R.B9.S6, Y1.B5.S4, Y1.B5.S5 and Y1.B2.S11.
- **What is fixed.** All six r8 items (N5r, N7a, N7b, D14, D15, M1) are in, and each holds on fresh seeds (section 1).
- **Mechanical scans.** All at 0 true flags:
  - range and content: `rceil`, `r19` and `scan2` row A are 0
  - option and visual maxima: `optmax` is 0 of 144
  - prior learning: `priorwk` matches 154 of 154
  - notes: `notefacts` finds 0 false in 112 claims
  - "same idea": `sameidea2` finds 0 false in 137 cited-step claims
  - structure: `chkstruct` finds no caps, overlaps or verdict errors
  - The accepted classes are unchanged: `scan2` row B 7, `stalewhy` 8, `tmpl` 1, `bb` 13.
- **Why it fails.** One new systematic class, and it is the one the lead asked about.
  - **S1.** Steps with fewer than 3 pre often miss a real building block that exists at the right size. The cause is
    mechanical. In my 20-step sample of these steps, 3 miss one outright and 3 more are borderline. Across all 86 such
    steps I find 9 clear misses (section 3).
  - Two smaller defects score 7 as well:
    - R.B17.S9 takes counting pre-skills under a false "same idea" reason (D16).
    - R.B15.S3 is marked `full` although no item turns or flips a shape (D17).

## 1. Round-8 defects, re-checked on the print path with fresh seeds

| Round-8 item | Status | Evidence (round 9) |
|---|---|---|
| N5r, "(an earlier step; the same idea)" | **fixed** | The phrase is in 0 whys. `sameidea2`: 0 false in 137. Of the 11 links r8 listed, 4 stay with a block label (R.B13.S3, Y1.B1.S8, Y1.B4.S7, Y1.B12.S2) and 7 are dropped. One drop takes away a real pre (R.B11.S9, see S1). |
| N7(a), unjudged "a building block" | **fixed, 3 residual uses** | Every r8-listed link is gone: count back on 11 steps (kept on R.B7.S1, R.B7.S2 and R.B11.S2), `compose_shapes` on 8, `name_3d_shapes` on 6, `measure_nonstandard` on Y1.B8.S1 and S4. 137 block claims remain, and I judged each one. Three are still not blocks: Y1.B1.S4 count back for "Represent objects" (`BLOCK_EXCEPT` lists only the R "find" steps); Y1.B3.S4 `compose_shapes` for "Sort 2-D shapes" (`CMP` is blocked for every `shape2d` step); and, weaker, Y1.B1.S10 `number_seq_fill` back for "Compare groups by matching". These are text defects (r8 scoring rule), listed in the fix list. |
| N7(b), misdescribing labels | **fixed** | `odd_even` is off R.B16.S1-S4, with the r8 note. Y1.B5.S4 and S5 carry `make_ten {band:10}` "the two parts of 10 on a frame": 64 of 64 items are "The frame shows n. How many more make 10?" (seed 1220011). `cloze_addition` and `order_objects_length` have real labels. |
| D14, `select_even_odd` | **fixed** | It is on no R step and on no Y1 pre or related link. The note "deals 1-20 whatever the range (generator floor 20)" is on R.B9.S6, R.B11.S13 and R.B16.S5. `optmax` reads option labels: 0 hits. |
| D15, Y1.B2.S11 related `missing_add_sub` | **fixed** | The opts are `{range:10, unknown:[1], task:[0]}`. 64 of 64 items have a part unknown on two fresh seeds: 27 "# + ___ = #" and 37 "___ + # = #" at 1210007; 34 and 30 at 1290001. The maximum is 10. |
| M1, the family skills' subtraction content | **fixed** | `number_families_add` is no longer related on Y1.B2.S1 or S2. `r19` finds 0. |
| Y1.B8.S3 / S5 `measure_nonstandard` why | fixed | "Y1.B7.S2 measure length with cubes: the same measuring with units". |

## 2. The tagger's claims

| Claim | Judgement |
|---|---|
| All 6 r8 fixes are in | **True** (section 1). |
| A hand-judged `spec.BLOCKS` table gates "a building block" | **True, but too narrow and slightly leaky.** It gates every claim (`check_claims` asserts it). Three false uses remain (section 1). Several real blocks are missing from it, for example `compare_groups` for `share` and `count_objects` for `bond` (S1). |
| A template hunt rewrote every unchecked relation phrase | **Mostly true.** One gap: the sub-idea classifier itself. `SUBS` puts R.B17.S9 "Represent maps with models" under `find` (the word "Represent"), so two counting skills are written as "earlier, same idea: find" on a mapping step (D16). `sameidea2` cannot catch this, because it uses the same `SUBS`. Y1.B11.S5 "Ordinal numbers" sits under `position` as well. Its "same idea" pre is above / below; WRM teaches it in the position block, so I count it as text only. |
| Every related link and hand-written pre why was checked on 60 items | **True.** I re-ran the related audit (61 distinct links, seed 1310009) and audited all 367 distinct pre whys on 91 pre links (`preaudit.py`). No why misdescribes what its skill deals (D16 is a sub-idea error, not a content one). One small slip stays: `pictograph_intro {forms:[0]}` "count two rows of a picture graph" (9 steps), whose items ask about one row ("How many cars?"). It does not change any score. |
| The remaining flags are the accepted classes | **True.** `scan2` row B 7, `stalewhy` 8, `tmpl` 1 and `bb` 13 are the same lists as r8 accepted. |
| Report counts | **True.** R: 17 full, 69 partial, 33 gap, 32 proposals (10 new), 58 tag fixes, 63 below 3 pre, 82 with no related link. Y1: 44 / 50 / 22, 47 proposals (11 new), 72 tag fixes, 23 below 3 pre, 62 with no related link. |

## 3. Fewer than 3 pre (the lead's question)

Steps below 3 pre rose from 49 to 63 in R and from 20 to 23 in Y1. 17 steps are newly below 3. Of those, 13 lost a false
link that r8 named (count back, `compose_shapes`, `name_3d_shapes`, `odd_even`, `measure_nonstandard`), which is right.
But two mechanisms also keep out real blocks:

1. **The key-level de-duplication.** In `gen.py`, `addp` has `if k in seen_keys and k not in own: return False`. Once a
   skill is in the pre list with one set of opts, a second set is refused unless the skill is a direct skill of the step.
   So "Represent N" never gets the Subitise step's `count_objects {objects:'dice'}`, because `count_objects {pictures}`
   is already there. "Find 4 and 5" does get it, because `count_objects` is its own skill.
2. **The BLOCKS table is narrow, and the N5r fix dropped links instead of relabelling them.** `CG` (`compare_groups`) is
   not a block for `share`, `CO` (`count_objects`) is not a block for `bond`, and there is no `count_sequence {band:10,
   dir:'forward'}` entry for `tens`. r8 said the 11 N5r links "are fair pre-skills … with a correct label each one can
   stay". One of the seven dropped, R.B11.S9's `count_objects`, leaves its step at 2.

**Sample.** `random.Random(90909).sample(steps_with_fewer_than_3_pre, 20)`:

| Step | Pre now | Real block missed? |
|---|---|---|
| R.B1.S4 Sort objects to a type | 0 | No. It is block 1, and R.B1.S1-S3 are gaps. |
| R.B3.S1 Find 1, 2 and 3 | 1 | No, by the tagger's own content rule. `classify_count {band:3}` counts 1-3, but it shows squares, which R meets at block 6. That rule sits awkwardly beside R.B1.S4, whose own skill is this one. |
| **R.B5.S3 Represent 4 and 5** | 2 | **Yes.** `counting:count_objects {band:5, objects:'dice'}`, from R.B5.S2 Subitise 4 and 5, the step just before (mechanism 1). |
| R.B6.S1 Shapes with 4 sides | 1 | Borderline. `shape_attributes {forms:[0], band:4}` asks "How many sides does a square have?" in about half its items. It is left out because of the vertex questions. Defensible. |
| R.B6.S2 Combine shapes with 4 sides | 1 | No. |
| R.B6.S3 Shapes in the environment | 2 | No. |
| R.B10.S2 Compare length | 2 | No. |
| R.B10.S6 Order and sequence time | 0 | No. The earlier time steps are gaps. |
| R.B12.S2 Find 2-D within 3-D | 2 | No new key. Minor: its `name_2d_shapes` opts are `shapes:[2]`; `[0,1,2]` would include the circles and triangles on cones, cylinders and pyramids. |
| R.B12.S6 Copy and continue patterns | 1 | No. `shape_pattern {points:[0]}` is left out because its response is typed names, which is consistent. |
| **R.B13.S1 Build 10-13** | 2 | **Yes.** `counting:count_sequence {band:10, dir:'forward'}`, from R.B11.S5 1 more. "The number after", and 10 and 1 more is 11; the direct `teen_compose` asks exactly "10 and 1 more". |
| R.B16.S2 Sharing | 2 | Borderline. A double is two equal shares, but `doubles_near_doubles {forms:[0]}` deals to 20, past R. |
| R.B17.S7 Give instructions to build | 2 | No. |
| R.B17.S8 Explore mapping | 2 | No. |
| Y1.B3.S1 Recognise and name 3-D shapes | 2 | No. |
| Y1.B8.S4 Full and empty | 2 | No. |
| **Y1.B9.S8 Make equal groups, grouping (W33)** | 2 | **Yes.** `comparing:compare_groups {band:10}`, "are the groups the same?", which is Y1.B9.S4's own pre (W19). Also `counting:count_objects {band:20}`, count the total. |
| Y1.B11.S2 Left and right | 2 | No. |
| Y1.B14.S1 Before and after | 0 | Borderline. `count_sequence {band:10, dir:'mixed'}` teaches the words before and after, but in number order, not event order. |
| Y1.B14.S2 Days of the week | 0 | No. The repeating-pattern skill is typed names. |

**Result.** 3 of 20 miss a real pre outright (15%), and 3 more are borderline. Every step marked "No" has an honest note.

**Across all 86 steps** (the same check, by hand, on the classes the mechanisms produce), there are 9 clear misses:

| Step | Missed pre (skill, opts) | Why it is a block |
|---|---|---|
| R.B3.S3 Represent 1, 2 and 3 | `counting:count_objects {band:5, objects:'dice'}` | R.B3.S2 subitise the amount first |
| R.B5.S3 Represent 4 and 5 | `counting:count_objects {band:5, objects:'dice'}` | R.B5.S2 subitise 4 and 5 |
| R.B7.S4 Represent 0 to 5 | `counting:count_objects {band:5, objects:'dice'}` | R.B7.S3 subitise 0 to 5 |
| R.B11.S9 Make arrangements of 10 | `counting:count_objects {band:10, objects:'frame'}` | R.B11.S1 count that each arrangement is still 10 |
| R.B13.S1 Build 10-13 | `counting:count_sequence {band:10, dir:'forward'}` | R.B11.S5 the number after: 10 and 1 more |
| Y1.B9.S5 Add equal groups (W19) | `comparing:compare_groups {band:10}`; `counting:count_objects {band:20}` | Y1.B9.S4 are the groups equal? Count the total |
| Y1.B9.S8 Make equal groups, grouping (W33) | the same two | the same |
| Y1.B9.S9 Make equal groups, sharing (W33) | the same two | the same |
| Y1.B10.S6 Find a quarter of a shape (W38) | `shapes_early:name_2d_shapes {forms:[1], shapes:[0,1,2]}` | "name the shape being split", the pre of its siblings Y1.B10.S1, S2 and S5 |

Each of these steps carries a note that gives the short pre list as complete ("Pre: 2 only; the earlier steps on this
idea use this step's own skill"). Rule 15 then fails in substance, and for the Represent steps rule 14 fails too (the
step just before's skill is a building block). I score such a step 7.

## 4. New defects

### S1. Real building blocks missed on short-pre steps (9 steps; systematic)

See section 3. The fix is items 1-3 of the fix list.

### D16. R.B17.S9 "Represent maps with models": counting pre-skills under "same idea: find"

- `SUBS` matches "represent", so the step is classed `find`.
- Its pre gets `composing:ten_frame_build {band:10}` "R.B11.S3 Represent 9 and 10 (earlier, same idea: find)" and
  `counting:count_objects {band:10, objects:'frame'}` "R.B11.S1 Find 9 and 10 (earlier, same idea: find)".
- Both claims are false, and both links come from an unrelated domain (rule 3). Score 7.
- The other 266 classifications in `subs.out` are right, apart from Y1.B11.S5 Ordinal numbers (`position`; text only).

### D17. R.B15.S3 "Manipulate shapes" is `full` on `compose_shapes {}`

- The WRM vocabulary is "turn, flip, fit".
- All 64 items are "What shape do you make when you put these two shapes together?", a 4-way choice of shape names
  (seed 1510007): Hexagon 19, Rectangle 17, Square 16, Triangle 12. No item turns, flips or fits a shape.
- Rounds 5 and 6 accepted it. On the items, it is `partial` with the missing clause "turning or flipping a shape so it
  fits". Score 7.

### Minor (no score effect)

- **M3.** `pictograph_intro {forms:[0]}` "count two rows of a picture graph" (9 steps). The items ask about one row.
- **M4.** R.B12.S2, S3 and S4: `name_2d_shapes {shapes:[2]}`. Use `[0,1,2]`, so that the circles and triangles of 3-D
  faces are included.
- **M5.** The Grade 1 sheet titles that match Y1 titles (20) are Y2 steps with the same name, so nothing is re-taught.
  The 312 Grade 1 prior entries that name KG lessons all map, apart from a "(US: dollars & cents)" suffix.

## 5. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week against the Kindergarten sheet | n/a | 116 / 116 steps map to a K-sheet lesson. `priorwk` 154 / 154. No pre cites a step the school teaches later. | ok |
| Content weeks (rule 19) | n/a | `r19` (seed 930001) finds 0 | ok |
| Range (`rceil`, `scan2` A, `linkfit`, `optmax`, seeds 920011 and 940003) | 0 | 0 true flags (7 row-B flags accepted) | ok |
| Response mode for the age | `dpflags` lists the same typed-name and word-work partials, each with its honest missing clause | | ok |
| Verdicts (sample items regenerated on 37 direct / partial signatures, seed 1510007) | D17 | ok | D17 |
| Proposals (rule 13 short spec) | 32, all 5 fields, `closes` ≠ `teaches`, every step list consistent | 47, the same | ok |
| Pre whys against the items (`preaudit`, 367 whys) | D16 | N7 residual ×2 | defects |
| Related whys against the items (`relaudit`, 61 links) | M3 | M3 | ok |
| ≥ 3 pre, or a true note | **S1** | **S1** | **FAIL** |

## 6. Per-step scores

**Sample.**
- Random draw: `random.Random(90901).sample(steps, 20)`, per year, in file order.
- Fresh seeds, unused by any earlier round:
  - whole-file scan: base 920011, 60 items per signature, 144 signatures, 0 errors
  - rule 19: base 930001
  - option and visual maxima: base 940003
  - related audit: base 1310009
  - sample items: base 1510007, 64 each
  - D15: bases 1210007 and 1290001
- **Scale.** The r1-r8 scale, unchanged. A false "same idea" or "building block" reason on a link that still shares
  the step's domain is a text defect and does not lower the score. A pre from an unrelated domain, a generous verdict,
  or a missed building block under a note that says the list is complete scores 7.

### Reception

| Step | Score | Finding | Fix |
|---|---|---|---|
| R.B2.S6 Create simple patterns | 8 | The gap and the 0-pre note are honest. | none |
| R.B5.S1 Find 4 and 5 | 8 | The partial is honest. | none |
| R.B5.S3 Represent 4 and 5 | **7** | S1: no `count_objects {objects:'dice'}` from R.B5.S2. | Fix 1 |
| R.B5.S5 1 less | 8 | Right. | none |
| R.B7.S2 Find 0 to 5 | 8 | Count back kept, as r8 asked. | none |
| R.B8.S2 Find a balance | 8 | 1 pre, honest. | none |
| R.B9.S4 1 less | 8 | Right. | none |
| R.B9.S8 Make a double to 8 | 8 | Right. | none |
| R.B11.S1 Find 9 and 10 | 8 | Right. | none |
| R.B11.S2 Compare numbers to 10 | 8 | M3. | none |
| R.B11.S4 Conceptual subitising to 10 | 8 | Right. | none |
| R.B12.S7 Patterns in the environment | 8 | Right. | none |
| R.B14.S2 How many did I add | 8 | Right. | none |
| R.B14.S4 How many did I take away | 8 | Right. | none |
| R.B15.S1 Select shapes for a purpose | 8 | The gap is right, and 2 pre is honest. | none |
| R.B15.S3 Manipulate shapes | **7** | D17: `full`, but no item turns or flips a shape. | Fix 5 |
| R.B15.S4 Explain shape arrangements | 8 | Right. | none |
| R.B15.S7 Copy 2-D shape pictures | 8 | Right. | none |
| R.B17.S9 Represent maps with models | **7** | D16: counting pre under a false "same idea: find". | Fix 4 |
| R.B17.S11 Create own maps from stories | 8 | Right. | none |
| R.B11.S9 Make arrangements of 10 (hard) | **7** | S1: the N5r fix dropped `count_objects {frame}`; 2 pre left. | Fix 2 |
| R.B13.S1 Build 10-13 (hard) | **7** | S1: no `count_sequence {band:10, dir:'forward'}`. | Fix 2 |
| R.B7.S4 Represent 0 to 5 (hard) | **7** | S1: no dice subitise from R.B7.S3. | Fix 1 |
| R.B12.S2 2-D within 3-D (hard) | 8 | M4. | M4 |
| R.B16.S1 Explore sharing (hard, r8 7) | 8 | Fixed: `odd_even` is gone, and the note is true. | none |
| R.B16.S5 Even and odd sharing (r8 7) | 8 | Fixed (D14). | none |
| R.B9.S6 Make pairs (r8 7) | 8 | Fixed (D14). | none |

### Year 1 (Kindergarten)

| Step | Score | Finding | Fix |
|---|---|---|---|
| Y1.B1.S13 Compare numbers (W04) | 8 | The gap is right. | none |
| Y1.B2.S6 Systematic bonds (W13) | 8 | Right. | none |
| Y1.B2.S9 Add more (W14) | 8 | The partial is honest. | none |
| Y1.B2.S11 Find a part (W12, r8 7) | 8 | D15 is fixed. | none |
| Y1.B2.S13 Fact families (W15) | 8 | Full. | none |
| Y1.B3.S4 Sort 2-D shapes (W32) | 8 | N7 residual: `compose_shapes` "a building block" (text). | Fix 6 |
| Y1.B4.S7 1 more and 1 less (W05) | 8 | Full. | none |
| Y1.B5.S1 Add by counting on (W16) | 8 | Full. | none |
| Y1.B5.S5 Near doubles (W17, r8 flag) | 8 | `make_ten {band:10}` fixed. | none |
| Y1.B6.S4 Groups of tens and ones (W22) | 8 | Full. | none |
| Y1.B6.S5 Partition into tens and ones (W23) | 8 | Full. | none |
| Y1.B6.S7 Estimate on a line to 50 (W09) | 8 | The partial is honest. | none |
| Y1.B9.S5 Add equal groups (W19) | **7** | S1: no `compare_groups {band:10}` or `count_objects {band:20}`. | Fix 3 |
| Y1.B10.S4 Find a half of a quantity (W38) | 8 | Right. | none |
| Y1.B10.S6 Find a quarter of a shape (W38) | **7** | S1: 1 pre; no `name_2d_shapes`, which its siblings have. | Fix 3 |
| Y1.B10.S7 Recognise a quarter of a quantity (W38) | 8 | Right. | none |
| Y1.B11.S1 Describe turns (W29) | 8 | Right. | none |
| Y1.B11.S2 Left and right (W29) | 8 | Right. | none |
| Y1.B11.S5 Ordinal numbers (W31) | 8 | Its "same idea: position" pre is coarse (text). | none |
| Y1.B14.S5 Tell the time to the hour (W36) | 8 | Full. | none |
| Y1.B9.S8 Make equal groups, grouping (W33, hard) | **7** | S1 (as Y1.B9.S5). | Fix 3 |
| Y1.B9.S9 Make equal groups, sharing (W33, hard) | **7** | S1. | Fix 3 |
| Y1.B1.S4 Represent objects (W01, hard) | 8 | N7 residual: count back "a building block" (text). | Fix 6 |
| Y1.B3.S1 Name 3-D shapes (W31, hard) | 8 | Right. | none |
| Y1.B8.S1 Heavier and lighter (W25, hard) | 8 | Right. | none |
| Y1.B5.S4 Doubles (W17, r8 7) | 8 | Fixed. | none |

**Distribution.**
- R: 7 × 6 and 8 × 21, mean 7.78. The random 20 alone give 7.85.
- Y1: 7 × 4 and 8 × 22, mean 7.85. The random 20 alone give 7.90.

## Fix list for round 10 (skill, opts, step)

1. **S1, Represent steps (mechanism 1).**
   - In `gen.py` `addp`, allow a second opts of a key that is already a pre when the opts change the representation
     (`objects`). Alternatively, add the links by hand with `prepre`.
   - Add `counting:count_objects {band:5, objects:'dice'}` to the pre of:
     - R.B3.S3, why "R.B3.S2 Subitise 1, 2 and 3: see the amount, then build it"
     - R.B5.S3, why "R.B5.S2 …"
     - R.B7.S4, why "R.B7.S3 …"
2. **S1, R.B11.S9 and R.B13.S1.**
   - R.B11.S9: restore `counting:count_objects {band:10, objects:'frame'}`, why "R.B11.S1 count that each arrangement
     is still 10 (count a group: a building block)". Add `'bond'` to `BLOCKS[CO]`, or `prepre` it.
   - R.B13.S1: add `counting:count_sequence {band:10, dir:'forward'}`, why "R.B11.S5 the number after: 10 and 1 more
     is 11". Add a `BLOCKS` entry for `CS + {band:10, dir:'forward'}` with `tens`.
3. **S1, Y1.B9 and Y1.B10.**
   - Add `'share'` to `BLOCKS[CG]` and `BLOCKS[CO]`.
   - On Y1.B9.S5, S8 and S9 add `comparing:compare_groups {band:10}`, why "Y1.B9.S4 / Y1.B1.S11 are the groups the
     same?", and `counting:count_objects {band:20}`, why "count the total, to 20".
   - On Y1.B10.S6 add `shapes_early:name_2d_shapes {forms:[1], shapes:[0,1,2]}`, why "name the shape being split", as
     on Y1.B10.S5.
4. **D16.**
   - In `SUBS`, test the position / map words before `represent`, so that R.B17.S9 is classed `position`.
   - Its pre then loses `ten_frame_build` and `count_objects`. Keep `shape_positions {forms:[0]}` and
     `name_3d_shapes {forms:[1]}`, and note "Pre: 2 only".
   - Add an assertion that no step whose title has map / position / turn words is classed under a counting sub-idea.
5. **D17.**
   - R.B15.S3 becomes `partial`: `compose_shapes {}` with the missing clause "turning or flipping a shape so it fits a
     space".
   - Add a build: reuse `scenes` if its `teaches` covers fitting shapes into an outline; otherwise add a new short
     option proposal, for example `shape_fit_turn`, "turn or flip a pictured shape to fit its outline; tap the turned
     shape that fits", with `closes` taken from the missing clause above.
6. **N7 residual (text).**
   - Add `(CSB, 'Y1.B1.S4')` to `BLOCK_EXCEPT`.
   - Remove `'shape2d'` from `BLOCKS[CMP]` for the sort steps: add `(CMP, 'Y1.B3.S4')` to `BLOCK_EXCEPT`.
   - Optionally, add `(NSF + back, 'Y1.B1.S10')`: matching two groups does not use the number track.
7. **Minor.**
   - M3: rewrite the why as "count a row of a picture graph".
   - M4: use `shapes:[0,1,2]` on R.B12.S2, S3 and S4.
   - Re-run `few.py` afterwards. Every step still below 3 should carry a note naming the candidates it rejects and why,
     as the honest notes in section 3 already do.

**Outlook.** Fixes 1-5 lift all 10 steps scored 7 to 8, which puts both means at 8.00 on this sample, and they close S1
with a mechanical change plus 12 hand links. Fix 4 adds the assertion that would have caught D16. With these in place
and no new class, round 10 should pass.
