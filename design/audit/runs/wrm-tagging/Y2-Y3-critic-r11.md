# Critic round 11: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-16 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 70a97387, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data or the build tooling.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-10 sevens | Round 10 mean |
|---|---|---|---|---|---|---|
| Y2 | 27 | **7.96** | 7.95 | 8.00 | 8.00 (2) | 7.94 |
| Y3 | 26 | **7.96** | 8.00 | 7.80 | 8.00 (1) | 7.97 |

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** Two sevens: Y2.B2.S15 (N11, pre rank) and Y3.B7.S1 (N10, the kg dial clause) |
| Both sample means ≥ 8 | **No** (7.96 / 7.96) |
| Five-year merge (R + Y1 + Y2 + Y3 + Y4, both orders), 0 real conflicts | **Yes.** My `mergeall.mjs` prints 2 lines (3 in reverse order). All of them are the agreeing duplicate on Y2.B1.S15, and the merged tag is identical in every order (§4) |
| Build reproducible | **Yes.** Two builds of each year from `git archive HEAD` are byte-identical to each other and to the committed JSON. The vendored R, Y1 and Y4 inputs are byte-identical to the passed lanes (§1) |

Score distribution:
- **Y2:** 8 ×26 · 7 ×1
- **Y3:** 8 ×25 · 7 ×1

All three round-10 sevens now score 8. Every r10 fix row is in the output and holds on fresh seeds (§2). The merge
and reproducibility gates pass. Two new defects keep the round from passing:
- **N11 (systematic, pre rank, rule 14):** on addition and subtraction steps the "step before" tier and the xlsx tier
  rank by WRM distance, not by building block. An addition step can lead with a subtraction word problem.
- **N10 (a generator bug the clauses do not report):** `mass_volume_liquid` kg dials have answer 0. The lane names this
  on Y3.B7.S2 but not on four other partials, and it links the broken form as a pre on eight steps.

## 1. Build reproducibility and the lane's own gates

| Check | Result |
|---|---|
| `git archive HEAD` to scratch, then `build.mjs Y2 --dropped` and `build.mjs Y3 --dropped`, run twice | Exit 0 every time. Run 1 = run 2 = committed `Y2.json` / `Y3.json`, byte for byte (`cmp`) |
| Build log | `mergecheck Y2: 0 problems`, `mergecheck Y3: 0 problems`. No `NOTECHECK`, `COREDROP` or `COUNTCHECK` line. Counts: Y2 124 steps (63 full / 36 partial / 25 gap), Y3 134 (49 / 55 / 30). New proposals 10 / 17, reused 36 / 43. These match both reports |
| Vendored inputs `design/audit/runs/wrm-tagging/inputs/{R,Y1,Y4}.json` | `cmp` against `/home/user/ref/r-y1/data/curriculum/links/{R,Y1}.json` (R/Y1 lane at 06320cc4, critic r12 passed) and `/home/user/ref/y4/data/curriculum/links/Y4.json` (Y4 lane at 7314ee1e, critic r13 passed): all three are identical |
| `linkscan.mjs Y2 Y3` | `linkscan (week mode): OK` |
| `mergecheck23.mjs Y2 Y3` | Y2: 131 tags, 65 tagFixes, 1 other-lane fix merged before and after, 0 problems. Y3: 140 tags, 71 tagFixes, 0 problems |

## 2. The r10 fix table, row by row

Each row was checked on fresh seeds (§6), reading the generated items.

### A (generator)

| r10 row | Result |
|---|---|
| A1 / N8, rung chooser | **Landed.** `asmet.mjs` now lists 39 "as it was met then" links (52 before). I read every line, and each is the same content in a smaller band (`{band:99}` under `{band:999}`, `{range:10}` words to numeral under `{range:100}` both ways, `equiv_coin_sets` totals to 50 under totals to 100) or a subset of the step's own forms, tables or families (`identify {denoms:[2]}` under the defaults `[2,3,5]`, `mult_zeros {forms:[0]}`, `mass_volume_liquid {forms:[0]}` under `{forms:[0,1]}`). The sibling rungs now say what they deal: "counting in 5s from 0: every multiple of 10 is a multiple of 5" (Y3.B4.S1, the 4th pre and true) and "read the scale (g or kg): the same scale reading in another measure" (Y2.B7.S6 / S7, Y3.B7.S7 / S8). The table chooser takes 10 for 100 (Y3.B1.S4), the 2s/5s/10s count for 3 (Y3.B3.S8) and for 10 (Y2.B5.S13). It never takes 5 for 100, {3, 5} for 10 or 50 for 10 |
| A2 / N9, prior-lane opts | **Landed.** `n9.mjs` goes from 34 rows to 4. I judged the 4 rows (below) |
| A3 merge | **Landed.** (a) Y2.B1.S15 carries Y4's partial word for word. (b) `mergecheck23` merges the other lanes' fixes. (c) The R/Y1 checker gives 0 + 0 (24 before) and the Y4 checker gives 0 + 0 (102 before) (§4) |

**The 4 remaining N9 rows.** All four are deliberate, and I accept them:

| Step | Dropped K rung | Judgement |
|---|---|---|
| Y2.B8.S3 Recognise a half | `partition_shapes {parts:[2]}` (Y1.B10.S5, quarters) | Quarters are not a building block of a half. The K half lesson deals the step's own items, so it adds no rung |
| Y2.B8.S8 Find a third | `shade_fraction {denoms:[2]}` (Y1.B10.S2 and S6, halves family) | Another family. Equal parts of a shape (`partition_shapes {0,1,2}`, which includes halves) is the lead pre, and that covers the idea |
| Y2.B8.S11 Non-unit fractions | `shade_fraction {denoms:[2]}` (Y1.B10.S6) | Halves give no non-unit fraction except 2/2, so this is not a rung for this step |

**Residual (minor, not graded down).** Three pres generate the same items as the step's own skill (40 of 40 seeds,
text, answer, visual and payload compared):
- Y2.B2.S5 `number_line_add {range:20}`;
- Y2.B2.S21 `cloze_addition {range:20}` and `missing_add_sub {range:20}`.

`range` is not in these skills' option schemas, and the defaults already deal within 20, so `effEq` reads them as
different. The citations are true (the same content, met in K), but they add no rung.

### B (step rows)

| r10 row | Result |
|---|---|
| Y2.B4.S1 | **Landed.** The lead pre is `money_count {usd, like, band 50, values [1,5,10]}` "Y1.B13.S4 Count in coins (K, on the W32 list)". It deals 5s and 10s coins to 40. Next is `{kind:'note', band:100}` ($5/$10 bills to $30) |
| Y2.B2.S20 | **Landed.** The lead pre `placevalue:compare {band:99}` deals "Compare: 59 ___ 11" |
| Y3.B1.S4 | **Landed.** The lead pre is the 10s count from 0 (0 … 110) "ten 10s make 100". Then `base10_build {band:99}` "Y2.B1.S2 … on the W1 list" |
| Y3.B4.S1, Y3.B3.S8, Y2.B5.S13, Y2.B7.S6 / S7, Y3.B7.S1–S3 / S7 / S8 | **Landed** (A1). Y2.B5.S13 now leads with the 2s/5s/10s count from 0 |
| Y2.B8.S4, Y2.B2.S21 | **Landed.** `halve {band:10, range:10}` (Half of 2, 4 …). `cloze_addition {range:20}` is the residual above |
| Y2.B1.S15 | **Landed** (A3a) |

## 3. New defects

### N11 (systematic, rule 14): addition and subtraction steps rank pre by distance, not by building block

**Mechanism.** In `build.mjs` (l.243–330):
- Tier 1, "the step before", is the latest same-topic step taught earlier, whatever its operation.
- The same-topic xlsx tier (tier 3) is sorted by WRM distance.

"Addition and subtraction" is one topic. So an addition step leads with subtraction lessons, and its real building
blocks (partition into tens and ones, add 10s, add 1s, the same layout one band lower) sink to the bottom.
`opmis.mjs` lists 8 steps whose lead pre is the other operation or a word problem.

**Graded:**
- **Y2.B2.S15 Add two 2-digit numbers, not across a 10 (W6): 7.** Pre in order:
  1. `comparison_word {range:10}` ("Subtraction – finding the difference": how many more, within 10);
  2. `sub_20_no_regroup`;
  3. `make_ten {band:20}`;
  4. `add_20_no_regroup`;
  5. and 6. two fact families;
  7. `add_sub_10s` (Y2.B2.S4, W5);
  8. `base10_build {band:99}`.

  The lead is not a building block of the step at all. The two main building blocks, partitioning into tens and ones and
  adding 10s, are ranked 7th and 8th. Round 7 scored the same shape 7 (Y2.B1.S7: number words first, partition 8th).

**Ungraded, likely 7:**
- **Y3.B2.S14 Add across a 100:** the lead is `sub_100_no_regroup`.
- **Y3.B2.S13 Add across a 10:** the lead is `sub_1k_no_regroup`.
- **Y2.B2.S10 Subtract across 10:** the lead is `add_three`. Bonds to 10 and the make-10 step (Y2.B2.S9, the inverse
  strategy) are absent.

**Acceptable cases** (the lead is the inverse operation in the same layout or a related strategy, so it is a building block):
- Y3.B2.S11 (`compensation`, then a subtraction; the 2-digit add is 4th). Borderline; I scored it 8.
- Y3.B2.S12, Y3.B2.S15, Y3.B2.S18 and Y3.B2.S8.

### N10 (a generator bug the clauses do not report): `mass_volume_liquid` kg dials have answer 0

**The bug** (`js/modules/gen-measurement.js` l.672–678, unchanged on the base branch):
- For `maxKg` 5 or 10, `maxVal` is 5 or 10 (kg) while the increment is 500 or 1000.
- So `numMarks` is 0.01 and the reading is 0.
- On fresh seeds, `{forms:[1]}` deals 44 of 80 items "What is the mass in kg?" with answer 0, and 36 gram items.
- `{forms:[0,1]}` deals 25 of 80 with answer 0.

This is outside the lane's files, but the clauses are the lane's own claims about what is dealt:

| Step | Clause | Problem |
|---|---|---|
| Y3.B7.S2 Measure mass in grams | "… some items ask the mass in kg (answer 0) on the same scale" | Right. The lane knows the bug |
| Y2.B7.S3 Measure in kilograms | "mostly grams; reading a kilogram scale is not dealt" | "Mostly grams" is false: 55% of the items are kg dials with answer 0 |
| Y2.B7.S2 Measure in grams | "(and some kg items)" | Does not say the kg items are broken |
| **Y3.B7.S1 Use scales (graded, 7)** | "reads one kind of scale each; scales with different intervals are not dealt" | Silent on the 31% of items with answer 0. The verdict and build are right, but the clause no longer describes what is dealt, and the same file says it on S2 |
| Y3.B7.S3 Measure mass in kg and g | "g or kg alone …" | Silent |

`{forms:[1]}` is also a **pre** on 8 steps: Y2.B7.S4, S6, S7 and Y3.B7.S4–S8. A pupil sent to that pre gets 55%
wrong answer keys.
- On the graded Y2.B7.S7 and Y3.B7.S7 it is the last of 3 pres, and its why is true. I scored them 8 and list the
  link in the fix table.

### Minor (not graded down)

- **Y2.B11.S2 Describe movement:** the pre `partition_shapes {parts:[2]}` (a quarter of a shape) has a plain xlsx why.
  It only helps through quarter turns, and the why should say so.
- **Y2.B8.S11:** the S8 rung `shade_fraction {denoms:[3]}` (Find a third, W31) is not linked. The real building block,
  unit fractions only, has no skill yet (`single_fraction` `unit_only`, the step's own build), so the
  `partition_shapes` lead is acceptable.

## 4. Merge (R + Y1 + Y2 + Y3 + Y4)

| Run | Result |
|---|---|
| My `mergeall.mjs`, order R, Y1, Y2, Y3, Y4 | 661 tags. 2 lines: `Y4: fix on another year's step count_by_step_up\|Y2.B1.S15` and `… also fixed by Y2` |
| The same, reversed (Y4 … R) | 661 tags. 3 lines: the two above plus `Y2: no-op partial count_by_step_up\|Y2.B1.S15` |
| The same, order Y2, Y4, Y3, R, Y1 | 2 lines, the same pair |
| The lane's `mergeall5.mjs`, both orders | 661 tags, 0 problems. The same pair appears as NOTE lines |
| R/Y1 lane `mergecheck.mjs` on Y2 / Y3 | 0 / 0 (124 / 134 steps, 131 / 140 tags) |
| Y4 lane `mergecheck.mjs` on Y2 / Y3 | 0 / 0 |
| `mergecheck23.mjs` | 0 / 0 |

**Is the agreeing duplicate a real problem? No.**
- Y4 emits `add` + `partial:` the clause.
- Y2 emits `partial` + the same clause, word for word.
- Whichever merges first, the merged `SKILL_WRM` holds `count_by_step_up` on Y2.B1.S15 as PARTIAL with that one clause.
- No MISSING, VERDICT, CLAUSE, EXTRA or STEP line appears for any year in any order, so every year's file equals the
  merged tags.
- The lines say only that two lanes wrote the same tag. Applying both is idempotent.

**Real conflicts: 0.** My script counts the lines as problems because it was written before this case existed, so the
raw count is 2 (3 in reverse order).

## 5. Structure (re-run)

| Check | Result |
|---|---|
| Pre ≥ 3; caps of 8 | Pass |
| Every partial/gap step has a `build`; no own `build` in `preBuild` | Pass |
| Same key + effective opts in pre and related | 0 |
| Duplicate link within a role | 0 |
| Empty related list without a note | 0. The notes are true by key + opts (`notes.mjs`) |
| Non-live keys, missing proposal ids, cross-lane proposal clashes | 0 |

## 6. Method

**Seeds.** All are fresh; none is used in r1–r10 or in `markers.mjs`.

| Use | Seeds |
|---|---|
| Items, print path via `generateQuestionFor` | `60617+211i` ×30, `79301+193i` ×30, `94427+233i` ×20. D/P links use 40 items; pre/related use 16 (80 for the targeted counts) |
| Grading sample | `random.Random(111981)` (Y2) and `random.Random(111982)` (Y3), over all steps minus the r10 sevens and my hard 5 |

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r11/`:
- `lib.mjs`;
- `asmet.mjs` (N8);
- `n9.mjs`;
- `same.mjs` (pres identical to the step's skill);
- `opmis.mjs` (N11);
- `scan.mjs`;
- `notes.mjs`;
- `mergeall.mjs`;
- `dump.mjs` / `show.mjs` / `gi.mjs`;
- `d-*.txt` (the graded dumps);
- `tree/`: the HEAD archive used for the two rebuilds, plus the R/Y1 and Y4 checkers as `mc_ry1.mjs` / `mc_y4.mjs`.

## 7. The sample

### Y2 (Grade 1): mean 7.96

Random 20 from `random.Random(111981)`: B5.S10 B6.S2 B5.S8 B10.S3 B11.S2 B8.S8 B2.S4 B5.S1 B7.S5 B1.S5 B2.S15
B2.S6 B5.S15 B5.S16 B4.S2 B4.S5 B3.S4 B8.S11 B11.S1 B5.S12.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Round-10 sevens** | | | |
| B4.S1 Count money – pence (W32) | full | **8** | The K coin rung leads (5s/10s coins to 40), then bills |
| B2.S20 Compare number sentences (W11) | gap | **8** | `placevalue:compare` leads |
| **Hard 5** | | | |
| B2.S21 Missing number problems (W11) | full | 8 | Directs deal within 20 (1.OA.D.8). `number_bonds {unknown:'first'}` is the find-a-part rung. Residual: 2 pres equal the direct |
| B5.S13 The 10 times-table (W26) | full | 8 | The 2s/5s/10s count from 0 leads; the why is true |
| B7.S7 Measure in litres (W35) | partial | 8 | Honest clause. Minor N10: the g/kg pre is half answer-0 items |
| B8.S4 Find a half (W17) | full | 8 | The K halving rung within 10 |
| B5.S11 Doubling and halving (W30) | full | 8 | The K halving rung, ÷2, doubles |
| **Random 20** | | | |
| B5.S10 Divide by 2 | full | 8 | |
| B6.S2 Measure in metres | gap | 8 | |
| B5.S8 Equal groups – sharing | partial | 8 | Clause true (grouping only) |
| B10.S3 Block diagrams | partial | 8 | |
| B11.S2 Describe movement | gap | 8 | Minor: the quarter-of-a-shape pre why |
| B8.S8 Find a third | partial | 8 | |
| B2.S4 Bonds to 100 (tens) | partial | 8 | |
| B5.S1 Recognise equal groups (W27) | full | 8 | The K "Recognise equal groups" rung equals the direct (`{step:6}` is the default), so it is correctly dropped |
| B7.S5 Compare volume and capacity | gap | 8 | |
| B1.S5 Partition numbers to 100 | full | 8 | |
| B2.S15 Add two 2-digit numbers, not across a 10 (W6) | full | **7** | N11: the lead pre is a subtraction word problem. Tens-and-ones partition and adding 10s are 7th and 8th |
| B2.S6 Add by making 10 | full | 8 | |
| B5.S15 The 5 times-table | full | 8 | "5 × 4 is half of 10 × 4" |
| B5.S16 Divide by 5 | full | 8 | |
| B4.S2 Count dollars (bills and coins) | full | 8 | |
| B4.S5 Make the same amount | full | 8 | |
| B3.S4 Draw 2-D shapes | gap | 8 | |
| B8.S11 Non-unit fractions (W38) | partial | 8 | Minor: the S8 thirds rung is not linked |
| B11.S1 Language of position | full | 8 | |
| B5.S12 Odd and even numbers | full | 8 | |

### Y3 (Grade 2): mean 7.96

Random 20 from `random.Random(111982)`: B5.S1 B11.S10 B11.S6 B10.S7 B2.S11 B5.S8 B4.S6 B10.S5 B11.S8 B10.S4 B5.S5
B9.S4 B11.S3 B8.S5 B11.S2 B6.S10 B5.S2 B10.S8 B5.S3 B2.S1.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Round-10 seven** | | | |
| B1.S4 Hundreds (W1) | partial | **8** | The 10s count from 0 leads ("ten 10s make 100"), then `base10_build {band:99}` |
| **Hard 5** | | | |
| B4.S1 Multiples of 10 (W9) | full | 8 | ×10 leads. The 5s rung's why is true |
| B3.S8 The 3 times-table (W11) | full | 8 | ×2/5/10, then the count from 0 "that this step makes in 3s" |
| B7.S1 Use scales (W34) | partial | **7** | N10: 25 of 80 items of the partial `{forms:[0,1]}` have answer 0 (kg dials). The clause is silent, though S2 in the same file names it |
| B6.S1 Unit fractions, denominators (W26) | partial | 8 | Honest two-part clause. The rungs are family subsets |
| B7.S7 Measure capacity in mL (W36) | full | 8 | Minor N10 on the g/kg pre |
| **Random 20** | | | |
| B5.S1 Measure in m and cm | partial | 8 | |
| B11.S10 Make 3-D shapes | gap | 8 | |
| B11.S6 Parallel and perpendicular | full | 8 | The right angle leads |
| B10.S7 Days and hours | gap | 8 | |
| B2.S11 Add two numbers, no exchange (W6) | full | 8 | Borderline N11: `compensation` leads, the 2-digit add is 4th |
| B5.S8 Add lengths | gap | 8 | |
| B4.S6 Link × and ÷ | partial | 8 | |
| B10.S5 a.m. and p.m. | full | 8 | |
| B11.S8 Draw polygons | gap | 8 | |
| B10.S4 Digital clock | full | 8 | |
| B5.S5 Equivalent lengths (m, cm) | partial | 8 | |
| B9.S4 Subtract money | partial | 8 | |
| B11.S3 Compare angles | partial | 8 | |
| B8.S5 Non-unit fractions of a set | partial | 8 | |
| B11.S2 Right angles | partial | 8 | |
| B6.S10 Equivalent fractions, bar models | full | 8 | |
| B5.S2 Measure in mm | partial | 8 | |
| B10.S8 Start and end times | full | 8 | |
| B5.S3 Measure in cm and mm | gap | 8 | |
| B2.S1 Apply bonds within 10 | partial | 8 | |

## 8. Fix list

### A. Generator (`tests/scripts/wrm-tagging/build.mjs`)

1. **N11, pre rank on addition and subtraction steps.**
   - When choosing the tier-1 "step before" and ordering the same-topic xlsx tier, rank a candidate by building block before distance:
     - first, the same operation in the same layout one band lower, or with no exchange before exchange;
     - then the place-value parts the step uses (partition into tens and ones, add or subtract 10s, the 1s facts);
     - then the inverse operation in the same layout;
     - word problems and the other operation's facts last.
   - Re-run `opmis.mjs` and read each line. At least these leads change:
     - Y2.B2.S15 → `add_sub_10s` (Y2.B2.S4, W5) and `base10_build {band:99}`, then `add_20_no_regroup`;
     - Y3.B2.S13 / S14 → `add_100_regroup` (Y2.B2.S16) and `add_1k_no_regroup` (Y3.B2.S11);
     - Y2.B2.S10 → `sub_20_no_regroup`, plus a bonds-to-10 / make-10 pre (`make_ten`, `make_a_ten`, Y2.B2.S9).
2. **N10, clauses that read what is dealt.**
   - Every partial whose skill is `mass_volume_liquid` with form 1 names the kg-dial answer-0 items, as Y3.B7.S2
     already does: Y2.B7.S2, Y2.B7.S3 (drop "mostly grams"), Y3.B7.S1 and Y3.B7.S3. Emit the clause tagFixes.
   - For the 8 pre links of `{forms:[1]}` (Y2.B7.S4/S6/S7, Y3.B7.S4–S8), either say in the why that the kg items are
     broken until the generator is fixed, or link `{forms:[0]}` / `temperature {forms:[1]}` instead.
   - Lead: the generator fix itself is outside this lane and is filed as a separate task. When it lands, the clauses
     revert.
3. **Residual (optional).** Drop a pre whose generated items equal the step's own skill even when its opts differ
   (`range` outside the schema). This affects Y2.B2.S5 and Y2.B2.S21 ×2.

### B. Step fixes

| Step | Fix |
|---|---|
| Y2.B2.S15 | Lead pre `addition:add_sub_10s` "Y2.B2.S4 adding 10s (W5): the tens of the sum". Then `composing:base10_build {band:99}` "Y1.B12.S3 / Y2.B1.S2 tens and ones". Then `addition:add_20_no_regroup {band:20, notation:['across']}` "the ones". `comparison_word` and `sub_20_no_regroup` go last or are dropped |
| Y3.B7.S1 | Partial clause: "reads one kind of scale each, and the kg dials have answer 0 (generator bug, 25 of 80 items); scales with different intervals are not dealt" |
| Y2.B7.S3 | Partial clause: "reads gram dials; every kg dial has answer 0 (generator bug), so reading a kilogram scale is not dealt" |
| Y3.B7.S3, Y2.B7.S2 | Add the same answer-0 note to the clause |
| Y3.B2.S13, Y3.B2.S14, Y2.B2.S10 (ungraded, N11) | The leads as in A1 |
| Y2.B11.S2 (minor) | Why on `partition_shapes {parts:[2]}`: "a quarter of a shape: the quarter turn" |

### Expected scores

| Fix | Lifts | Steps |
|---|---|---|
| A1 + the Y2.B2.S15 row | 1 seven | Y2.B2.S15 |
| A2 + the Y3.B7.S1 row | 1 seven | Y3.B7.S1 |

With A1, A2 and the B rows done, both samples reach 8.0 and no graded step is below 8. Merge and reproducibility
already pass.
