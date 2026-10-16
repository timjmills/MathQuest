# Critic: Wave 2 tagging for R (Reception / PK4) and Y1 (Kindergarten), round 12

Independent critic (Opus, medium effort). I did not edit the tagging data.

- **Tree:** `claude/sweet-newton-c8wrv1-wip-wrm-tag-r-y1` at `6f6faa4d`.
- **What I read:**
  - BRIEF rules 1-19 and the owner rulings
  - `R-Y1-critic-r11.md`
  - the round-12 sections of `R-report.md` and `Y1-report.md`
  - `R.json` and `Y1.json` at r12, compared step by step with r11 (`27f4cd56`) and r10 (`a2810ca5`)
  - the r12 diffs of `gen.py`, `spec.py` and `maxdealt.mjs`, plus the new `mergecheck.mjs` and `wholes.mjs`
  - the Kindergarten and Grade 1 sheets of the xlsx
- **Scripts:** in the critic scratch folder `wrm-critic-ry1-r12/`. These are the r11 checks, re-seeded, plus:
  - `msim.py` and `dumpwrm.mjs`: my own merge simulation (section 2)
  - `mut.py` and `inj.py`: the mutations of a scratch `gen.py` used to test both merge checks
  - `d20.mjs`: which "1 less than n" facts the backward track asks
  - `ends.mjs`: the answers that every direct link of every `full` step asks, from end to end
  - `wh12.mjs`: the `number_bonds` wholes
  - `diff12.py`: every change from r11 to r12, step by step
  - `show12.py` and `it12.mjs`: the graded-step viewer
  - `regen/`, `fresh/`, `mut_*/` and `inj_*/`: scratch copies of the tree
- **Browser:** none was needed. Every item came through `generateQuestionFor`, the print path.
- **Reproducibility:** `gen.py` on a scratch copy writes `R.json` and `Y1.json` byte for byte. This holds from the
  cached item table and again from a fresh cache (`maxdealt.json` deleted). The counts match both reports:
  - R: 15 full, 71 partial, 33 gap; 33 proposals (11 new); 76 tag fixes
  - Y1: 44 full, 50 partial, 22 gap; 47 proposals (11 new); 80 tag fixes

## Verdict: PASS

| Year | Steps scored | Mean | Scored 7 | Scored 8 | Random 20 only |
|---|---|---|---|---|---|
| R | 28 (20 random, 5 hard, 3 changed this round) | **8.00** | 0 | 28 | 8.00 |
| Y1 | 37 (20 random, 5 hard, Y1.B1.S9, 11 changed this round) | **8.00** | 0 | 37 | 8.00 |

- **The r11 seven is fixed.** D20, on Y1.B1.S9, now scores 8. The backward number track asks "1 less than" every
  number from 1 to 10, on three fresh bases (section 1).
- **The N7r regression is closed.** The four judged-false blocks are gone. The 25 re-audited steps hold no
  judged-false block claim.
- **M10-M14 are in.** One related wholes text (N12-1), which `wholes.mjs` cannot read, and one more `share_into_groups`
  why (N12-2) remain. Both are text only.
- **The merge holds.** My own simulation applies the R and Y1 tag fixes to the live `SKILL_WRM`. It reproduces every
  step's verdict, every tag and every partial clause, with 0 problems.
- **`mergecheck.mjs` catches every misreading I planted.** Two of them can only be caught when a step has two rungs of
  one skill, and no step has that today (section 2).
- **No systematic class is open.** The four new findings are single-text defects with no effect on any score.

## 1. Round-11 defects, re-checked on the print path with fresh seeds

Every link was generated 64 times on two bases that no earlier round used, 4310007 and 4370013 (`fix12.mjs`). D20
also used a third base, 4430021. The wholes used 128 items on each of bases 4610003 and 4670011.

| r11 item | Status | Evidence (round 12) |
|---|---|---|
| **D20, Y1.B1.S9 "1 less"** | **fixed** | The step is `full` on `count_sequence {band:10, dir:'back'}` and on `number_seq_fill {step:1, dir:'back', range:10}`. `d20.mjs` reads each blank that sits after a number. The counts for "1 less than n" (all blanks, and those where n itself is printed) are below. The tracks start at 4-10, and the hint reads "Each number is 1 less than …". `count_sequence back` answers 0-6 only, so it asks "1 less than 1-7", as the note says. The note is true. |
| Y1.B1.S7 window note | **fixed, true** | `count_sequence {band:10, dir:'forward'}` answers 4-10 on both bases, so it asks "1 more than 3-9", as the note now says. |
| Range-end assertion | **works** | In a scratch spec I removed the track from Y1.B1.S9. `gen.py` then stops with `AssertionError: ('Y1.B1.S9', ['top: reaches 7 of 10'])`. Its scope is limited: it reads the "within N" in a step's title or block, and no Reception block has one. So I ran `ends.mjs` over all 74 direct links of the 59 full steps (base 4510003, 96 items each). Every link reaches the top of its step's range, and every sequence step reaches its bottom. |
| N7r, the block tier | **fixed** | The four `BLOCK_EXCEPT` entries are in. The changes it makes are listed below. |
| The 25 re-audited steps | **hold** | I rebuilt the list myself: the steps whose pre count changed from r10 to r11. There are exactly 25. I listed every pre added since r10 on them. Each is either a link that r11 accepted, or one of the new block-tier fills judged above. None of them is an r8 N7a or r9 judged-false block. Y1.B3.S3 and S4 keep `name_3d_shapes` "name the solids". That is defensible: WRM Y1 meets 2-D shapes as the faces of 3-D shapes, and r11 scored both steps 8. |
| M10, the stale wholes texts | **fixed, one related text left (N12-1)** | `band_3.why` now reads "never deals whole 1 or a zero part (band 5 deals wholes 2-5)". The R.B11.S8 tag fix reads "deals wholes 2-10". Both are true. Band 5 dealt wholes {2:5, 3:19, 4:21, 5:83} and {2:5, 3:55, 4:19, 5:49}, with 0 zero parts. Band 10 dealt wholes 3-10 and 2-10. `wholes.mjs` says OK, from 32 claims. |
| M11 | **fixed** | Y1.B14.S6 now reads "the order of the numbers to 20 (1 to 12 on the clock)". The items go to 20. |
| M12 | **fixed on S2, S5, S6, S7 and S8 as asked; one more why left (N12-2)** | — |
| M13 | **fixed** | Y1.B10.S6 has `halve {band:10, range:10}` again, as "Y1.B10.S4 half of a quantity". Y1.B10.S4 is W38, the same week but earlier. The items are "Half of n", with answers 1-5. |
| M14 | **fixed** | R.B1.S4 and S5 now use `classify_count {band:3, objects:'pictures'}`, and S4 adds `tiles:2`. The items count only the flowers, apples, balls or fish, with answers 1-3 and no shapes. `tiles:2` gives 2 kinds, against 2 or 3 by default, so it is a true easier rung. R.B5.S1 and S2 name `classify_count` as rejected (see N12-3). |
| Y1.B2.S9 (found by the tagger's merge check) | **fixed, honest** | `number_line_add {range:10}` is now partial, with "a bare 0-10 number-line sum … no story or picture". The items read "Use the number line: 7 + 3 = ?", with the hint "Start at 7 … jump forward 3". The clause is true, and the step stays partial with `k_story`. |

**D20 counts** (`d20.mjs`, 64 items per base):

| Base | 1 less than 8 | 1 less than 9 | 1 less than 10 |
|---|---|---|---|
| 4310007 | 8 (6) | 8 (5) | 4 (4) |
| 4370013 | 17 (16) | 2 (2) | 3 (1) |
| 4430021 | 13 (9) | 6 (4) | 3 (2) |

The first number counts every blank. The number in brackets counts the blanks where n itself is printed.

**N7r changes:**
- Y1.B1.S2 and S3 lose `count_sequence back`. In its place they take `compare_groups {band:10, level:[1]}`. This is
  the "find" block that r11 accepted on R.B9.S1, R.B11.S1 and Y1.B1.S4: level 1 is "Match them one to one".
- Y1.B1.S11 loses the backward track and takes `count_objects {band:10}`, "count a group". That is a true block of
  comparing groups.
- Y1.B3.S3 loses `compose_shapes` and keeps 4 pre.
- Y1.B4.S7 loses `compare_groups {band:10}` and keeps 4 sound pre.
- Y1.B12.S5 gains the backward track, cited to Y1.B1.S9, which is W03, before W09.

## 2. Merge simulation (my own, `msim.py`)

**The method.**
- `dumpwrm.mjs` loads the live `SKILL_WRM` from `js/modules/wrm.js`, and the live skills from `data.js`.
- `msim.py` then applies each year's `tagFixes` in file order, keeping every entry in wrm.js, duplicates included:
  - `add` tags the key full.
  - `partial` tags it partial, with the clause taken from `why`.
  - `remove` deletes the tag, and flags it if the key was never tagged.
- It then asserts, for every step:
  - Each direct key is tagged full.
  - Each key that appears only as partial is tagged partial. Its clause holds every rung's `missing` and nothing
    else, compared without regard to order.
  - Nothing else is tagged to the step.
  - The verdict that follows from the merged tags equals the file's verdict.
  - Every key is live, and no tag fix touches a step outside its year.
- It also flags any key that has two entries for one step in wrm.js before the merge.

**The result.** `R: 119 steps, 76 tagFixes, 94 merged tags; 0 problems` and
`Y1: 116 steps, 80 tagFixes, 121 merged tags; 0 problems`.
- There are no duplicate wrm.js entries, and no wrm.js tag points at an unknown step id.
- I also ran a "misreading" mode, in which the lead treats `add` on an existing tag as a no-op. It also gives 0
  problems, because none of the 2 adds lands on an existing tag.
- `mergecheck.mjs` agrees: 94 and 121 tags, 0 problems.

**Would `mergecheck.mjs` catch a misreading?** I broke a scratch copy of `gen.py` six ways and rebuilt each one.

| Mutation of `gen.py` | Files change? | mergecheck | msim |
|---|---|---|---|
| M1: do not re-send a changed partial clause (the r11 behaviour) | yes, −16 R and −6 Y1 fixes | FAIL, R 16 / Y1 6 | FAIL, 16 / 6 |
| M2: collapse two partial rungs of one key to the first clause | **no**, because no step has two partial rungs of one key | OK (dormant) | OK (dormant) |
| M3: let a partial rung override a direct of the same key | **no**, because no step has both | OK (dormant) | OK (dormant) |
| M4: drop every `remove` | yes | FAIL, R 10 / Y1 41 | FAIL |
| M5: send a new direct skill as `partial` | yes | FAIL, Y1 2 | FAIL, Y1 2 |
| M6: reword the re-sent clauses | yes | FAIL, R 66 / Y1 39 | FAIL |
| `inj.py` + M2: inject a second rung on R.B1.S4 | yes | **FAIL**: clause differs, R.B1.S4 `classify_count` | FAIL |
| `inj.py` + M3: inject a partial rung of a direct on Y1.B1.S9 | yes | **FAIL**: Y1.B1.S9 `count_sequence` partial, file says full | FAIL |
| `inj.py` alone (correct `gen.py`) | yes | OK | OK |

**Conclusion.** `mergecheck.mjs` catches every misreading of the tag-fix vocabulary that changes the merged result.
Its limits:
1. It compares against wrm.js as it is now. It must be re-run if another lane changes R or Y1 tags before the lead
   merges.
2. It reads wrm.js into a `Map`, so a duplicate entry for one key and step would be hidden silently. There are none
   today.
3. The `; ` it uses to join rungs also occurs inside single clauses, so the joined clause cannot be split back
   mechanically.

The "two rungs collapsed" fix is correct, but nothing in the current files exercises it.

## 3. New defects (all text only; no score effect, no class)

- **N12-1. R.B3.S6: the clause on the partial link, and its tag fix, say "wholes of 2 and 3 only (band 5 deals wholes
  4 and 5)".**
  - Band 5 also deals whole 2 (5/128 on both bases) and whole 3 (19/128 and 55/128). Those are the very wholes the
    step needs.
  - The verdict, partial, is right. The text reads as though the skill never deals 2 or 3.
  - `wholes.mjs` reads "deals wholes A and B" as "each appears", so it passes this. It is the same class as M10.
  - Fix: `spec.py` R.B3.S6 `P(NB, …)` → "whole 1 and a zero part never appear; band 5 deals wholes 2-5, mostly 4 and
    5". In `wholes.mjs`, read "deals wholes A and B" without "also" as the exact set.
- **N12-2. Y1.B10.S8: the `share_into_groups {band:12}` why reads "Y1.B9.S9 share into equal groups".**
  - All 64 items read "Make groups of n. How many groups are there?", which is grouping. M12 fixed S2, S5 and S6 but
    not this one.
  - Fix: "Y1.B9.S8 make equal groups (how many groups of n): equal parts".
- **N12-3. R.B5.S1 and R.B5.S2 reject `classify_count` as "not a building block of this step".**
  - Counting one kind out of a mixed bag is close to "find a group of 4". The true reason is size: `{band:3}` deals
    answers 1-3 only.
  - Fix: "classify_count (band 3: counts 1-3 only, below this step's 4 and 5)".
- **N12-4. R.B1.S6: the pre `classify_count {band:3, objects:'pictures'}` is cited to "R.B1.S4".**
  - Those are R.B1.S5's opts. R.B1.S4's are `{band:3, tiles:2, objects:'pictures'}`.
  - Fix: cite "R.B1.S5 sort and count one kind (pictures)".

## 4. Other checks, across the whole files

| Check | R | Y1 | Status |
|---|---|---|---|
| School week (Kindergarten sheet, plus the Grade 1 sheet's "Y1/KG" support lists and its two "COPIED IN" K rows) | n/a | Every Y1 step maps to a K-sheet lesson. `priorwk` 153/153; 0 pre cite a step the school teaches later. Y1.B7.S2 is "COPIED IN" to Grade 1 at W20-21; that does not change its K week, W24. | ok |
| Content weeks (`r19`, base 4030001) | n/a | 0 | ok |
| Range (`rceil` 0, `scan2` A 0, `linkfit`, `optmax` at base 4040003, `ends.mjs` at 4510003) | 0 | 0 true flags; the same 7 row-B flags as at r11 (accepted) | ok |
| Whole-file scan (144 signatures × 60 items, base 4020011) | 0 errors | | ok |
| Response mode (`dpflags`) | Only the counts changed since r11; every typed-name or word-work partial names it | | ok |
| Verdicts (graded steps, base 4710007) | ok | ok | ok |
| Proposals (rule 13: name, kind, teaches, closes and representation present; `closes` ≠ `teaches`; every build lists the step; the step's `closes` segment equals its `missing`) | 33, 0 faults | 47, 0 faults | ok |
| Notes (`notefacts`, `sameidea`, `sameidea2`, `onidea`) | 0 false of 93, 125 and 141; `onidea` 0 bad | | ok, apart from N12-1 (a clause, not a note) |
| Structure (`chkstruct`) | Unchanged from r11 | | ok |
| ≥ 3 pre or a true note (`few`, `sib3`) | All noted; `sib3` 37 rows, 0 unnamed | | ok |
| Accepted classes (`stalewhy` 8, `tmpl` 1, `bb`) | Unchanged; `bb` shows only M13's `halve` added | | ok |

## 5. Per-step scores

**Sample.**
- Random draw: `random.Random(121012).sample(steps, 20)` per year, in file order.
- Fresh seeds, unused by any earlier round:

  | Check | Base |
  |---|---|
  | Whole-file scan | 4020011 |
  | Rule 19 | 4030001 |
  | Option maxima | 4040003 |
  | Fix links | 4310007 and 4370013 |
  | D20 | the fix-link bases, plus 4430021 |
  | Full-step ends | 4510003 |
  | Wholes | 4610003 and 4670011 |
  | Graded-step items | 4710007 |
  | `classify_count` kinds | 4810009 |

- **Scale.** The r1-r11 scale, unchanged. A false or weak reason on a link that is in-domain, in-week and the right
  size is a text defect. A generous verdict, an out-of-domain pre, or a missed building block under a note that reads
  as complete scores 7.

### Reception

| Step | Score | Finding |
|---|---|---|
| R.B1.S5 Explore sorting techniques | 8 | M14 fixed: pictures opts. Its one pre is R.B1.S4's easier rung. |
| R.B1.S6 Create sorting rules | 8 | The gap is right. N12-4 (text). |
| R.B2.S6 Create simple patterns | 8 | The gap is right; the 0-pre note is true. |
| R.B4.S3 Shapes in the environment | 8 | The gap is right. |
| R.B5.S6 Composition of 4 and 5 | 8 | The partial and its wholes text are true. |
| R.B5.S7 Composition of 1-5 | 8 | True: whole 1 and a zero part are never dealt. |
| R.B6.S4 My day and night | 8 | The gap is right. |
| R.B7.S6 1 less | 8 | The partial covers the window. |
| R.B7.S7 Composition | 8 | Right. |
| R.B7.S8 Conceptual subitising to 5 | 8 | The gap is right. |
| R.B9.S1 Find 6, 7 and 8 | 8 | Partial plus `number_focus`. |
| R.B9.S9 Combine 2 groups | 8 | Both partial clauses are true. |
| R.B9.S10 Conceptual subitising | 8 | The gap is right. |
| R.B11.S1 Find 9 and 10 | 8 | Right. |
| R.B11.S2 Compare numbers to 10 | 8 | The partial (groups, not numerals) is right. |
| R.B11.S8 Bonds to 10 | 8 | Full on `make_ten`; the M10 tag-fix text is now true. |
| R.B12.S5 Identify more complex patterns | 8 | The typed-names partial is right. |
| R.B15.S4 Explain shape arrangements | 8 | Right. |
| R.B17.S3 Explore own pattern rules | 8 | The gap is right. |
| R.B18.S1 Deepen understanding | 8 | The gap plus `consolidate` is right. |
| R.B3.S6 Composition of 1, 2 and 3 (hard) | 8 | The partial is honest. N12-1 (text). |
| R.B9.S4 1 less (hard) | 8 | The missing clause covers the window. |
| R.B11.S9 Arrangements of 10 (hard) | 8 | Right. |
| R.B14.S2 How many did I add (hard) | 8 | Right; `pictures_change_unknown`. |
| R.B16.S6 Play with and build doubles (hard) | 8 | Right. |
| R.B1.S4 Sort objects to a type (changed) | 8 | M14 fixed. |
| R.B5.S1 Find 4 and 5 (changed note) | 8 | N12-3 (text). |
| R.B5.S2 Subitise 4 and 5 (changed note) | 8 | N12-3 (text). |

### Year 1 (Kindergarten)

| Step | Score | Finding |
|---|---|---|
| Y1.B1.S2 Count objects (W01) | 8 | N7r fixed; `compare_groups` level 1 is the accepted find block. |
| Y1.B1.S5 Recognise numbers as words (W02) | 8 | The partial (generator bug) is honest. |
| Y1.B1.S6 Count on from any number (W02) | 8 | Full; the track covers 0-10. |
| Y1.B1.S13 Compare numbers (W04) | 8 | The gap is right. |
| Y1.B2.S7 Number bonds to 10 (W14) | 8 | Full on `make_ten`. |
| Y1.B2.S14 Take away, cross out (W15) | 8 | The partial (stops at 5) is right. |
| Y1.B2.S15 Take away, how many left (W15) | 8 | Right. |
| Y1.B3.S2 Sort 3-D shapes (W31) | 8 | The gap is right. |
| Y1.B4.S3 Understand 11, 12 and 13 (W21) | 8 | Partial plus `number_focus`. |
| Y1.B4.S4 Understand 14, 15 and 16 (W21) | 8 | The same. |
| Y1.B4.S5 Understand 17, 18 and 19 (W21) | 8 | The same. |
| Y1.B4.S10 Estimate on a number line to 20 (W06) | 8 | The gap is right. |
| Y1.B5.S6 Subtract ones using bonds (W18) | 8 | The partial (abstract) is right. |
| Y1.B5.S7 Subtraction, counting back (W18) | 8 | Full on a 0-20 line. |
| Y1.B6.S4 Groups of tens and ones (W22) | 8 | Full; answers 11-49. |
| Y1.B6.S5 Partition into tens and ones (W23) | 8 | Full. |
| Y1.B7.S3 Measure in centimetres (W25) | 8 | The partial (inches) is right. |
| Y1.B9.S3 Count in 5s (W33) | 8 | The partial is right. |
| Y1.B11.S2 Position: left and right (W29) | 8 | The gap is right; the rejection is true. |
| Y1.B13.S3 Recognise notes (W35) | 8 | The partial is right. |
| **Y1.B1.S9 1 less (W03, r11 seven)** | **8** | D20 fixed: 1 less than 8, 9 and 10 are asked on 3 fresh bases. |
| Y1.B1.S3 Count from a larger group (W01, hard) | 8 | N7r fixed; the partial (counting out) is right. |
| Y1.B2.S9 Add more (W14, hard) | 8 | Both clauses are true; the verdict follows from the tags. |
| Y1.B4.S7 1 more and 1 less (W05, hard) | 8 | Full; 0-20 at both ends. |
| Y1.B10.S6 Find a quarter of a shape (W38, hard) | 8 | M13 fixed. |
| Y1.B12.S5 1 more, 1 less (W09, hard) | 8 | Full at band 100; the added track is sound. |
| Y1.B1.S1 Sort objects (W23, changed) | 8 | M14 opts carried to the pre. |
| Y1.B1.S7 1 more (W02, changed) | 8 | The window note is true. |
| Y1.B1.S11 Fewer, more, same (W03, changed) | 8 | N7r fixed; `count_objects` is a true block. |
| Y1.B1.S12 <, >, = (W04, changed why) | 8 | Right. |
| Y1.B1.S14 Order objects and numbers (W04, changed why) | 8 | The gap is right. |
| Y1.B3.S3 Name 2-D shapes (W31, changed) | 8 | N7r fixed. |
| Y1.B10.S2 Find a half of a shape (W37, changed) | 8 | M12 fixed. |
| Y1.B10.S5 Recognise a quarter of a shape (W37, changed) | 8 | M12 fixed. |
| Y1.B10.S7 Recognise a quarter of a quantity (W38, changed) | 8 | M12 fixed. |
| Y1.B10.S8 Find a quarter of a quantity (W38, changed) | 8 | M12 fixed for `double`; N12-2 (text). |
| Y1.B14.S6 Time to the half hour (W36, changed) | 8 | M11 fixed. |

**Distribution.**
- R: 8 × 28, mean 8.00. The random 20 alone give 8.00.
- Y1: 8 × 37, mean 8.00. The random 20 alone give 8.00.

Both means are at least 8, no step is below 7 (none is below 8), and no systematic class is open. **R and Y1 pass.**

## Optional clean-up (text only; not required for the pass)

1. **N12-1.** `spec.py` R.B3.S6: change the partial clause to "whole 1 and a zero part never appear; band 5 deals
   wholes 2-5, mostly 4 and 5". In `wholes.mjs`, treat "deals wholes A and B" (without "also") as the exact set.
2. **N12-2.** Y1.B10.S8 `share_into_groups {band:12}` why → "Y1.B9.S8 make equal groups (how many groups of n):
   equal parts".
3. **N12-3.** R.B5.S1 and R.B5.S2 note → "classify_count (band 3: counts 1-3 only, below this step's 4 and 5)".
4. **N12-4.** R.B1.S6 pre why → "R.B1.S5 sort and count one kind (pictures)".
5. **Before the lead merges:** re-run `mergecheck.mjs` against the wrm.js the lead merges into, not only today's.
