# Critic round 15: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2), with site lessons

Critic run on 2026-10-17 against `data/curriculum/links/Y2.json` and `Y3.json` at commit d2597d72, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I graded only. I did not edit the tagging data, the site files or the tooling.

## Verdict: PASS

| Set | Graded | Mean | Min | Notes |
|---|---|---|---|---|
| Y2 steps | 30 | **8.00** | 8 | 9 random FULL, the 8 demoted, the 3 kept full with an option, 10 random partial / gap |
| Y3 steps | 32 | **8.00** | 8 | 16 random FULL, the 4 demoted, the 2 kept full with an option, 10 random partial / gap |
| Y2 lessons | 9 | **8.00** | 8 | 3 full, 6 random |
| Y3 lessons | 11 | **8.00** | 8 | 4 full, 6 random, and the line-plot lesson (added, §6 M23) |

| Gate | Result |
|---|---|
| Every graded step and lesson ≥ 8 | **Yes.** 82 entries, all 8 |
| Each year's means ≥ 8 | **Yes.** 8.00 for steps and lessons in both years |
| 0 real merge conflicts | **Yes.** My own `merge15.mjs`: 7 lanes on live `wrm.js`, both orders identical (1,042 tags, 0 problems). One key\|step has two writers (`count_by_step_up\|Y2.B1.S15`, Y2 and Y4), with the same clause and opts, so the merged clause is coherent (§5) |
| Reproducible | **Yes.** Three clean `git archive HEAD` builds (one with Y2 / Y3 deleted and built Y3 first) are byte-identical to the committed files (§4) |
| Site coverage complete | **Yes.** Lessons 11 / 25 equal the Y2 / Y3 entries of `site-lessons.json`; steps 124 / 134 in `wrm-steps.json` order; `ws-wrm-extract --check` exits 0 (§3) |

**The main question: did the full audit end the false-FULL class?** On my evidence, yes.
- **Random 25.** I graded 25 FULL steps. All 8 that no round from r10 to r14 had graded are in the 25, and the other 17 were drawn at random. None overstates its title or its CCSS clause at the step's range.
- **Whole set.** I also read the generated items of **all 95 remaining FULL steps** (`fullscan.mjs`: shapes, maximum and a sample per direct). None is a new N15 / N16 / N17.
- **Demotions.** The 12 demoted steps' clauses are true on fresh seeds, and their builds would close them.
- **Kept full.** The 5 options that keep a step full do what the audit says.

**What is left** is minors (§6):
- **The new verb gate is weaker than its doc.** A typed number counts as "production", so "Make the same amount" on a count-the-coins skill passes.
- **The clause gate has a loophole.** RANGECHECK's clause test accepts any "over".
- **RANGECHECK reads direct and partial links only.** Pre links still deal gram dials to 1,800 g at Grade 1.
- **Wording and links.** Some clause wording, one M19-type why on a lesson, and the opts of three r15 option links, which the merged tags do not carry.

None lowers a grade.

## 1. N15–N17 and M15–M20 on fresh seeds

**Seeds.** All new this round:
- `generateQuestionFor` with 61813 + 389 i ×30, 27457 + 313 i ×30 and 84559 + 409 i ×20.
- Probes with 71993 + 433 i ×200–400.
- The gates with 61813 / 389 and 27457 / 313.

I checked each seed against the r8–r14 reports and the builder's r15 scripts; 50503 had been used in r3, so I replaced it.

| Row | Result |
|---|---|
| **N15 Y2.B10.S1** "Make tally charts" | **Landed.** `tally_chart {}` is now partial. On 200 items, every one reads a drawn chart ("How many children …" 65, "How many more" 52 …). The clause "reads a given tally chart …; recording data as tally marks to make the chart is not dealt" is true. Build `collect_data` (WRM_PROPOSALS, `closes` for the step). tagFix `partial`. **8** |
| **N16 Y2.B4.S5** "Make the same amount" | **Landed.** `equiv_coin_sets {currency:'usd'}` is partial and is "Do the coins make the amount? Check one box" on 40 / 40 items. Build `make_amount_notes`, shared with Y3 and identical there. tagFix `partial`. **8** (M21: the clause says "making an amount with coins … not dealt", though the live `make_change_least_coins` does make one, the fewest-coins way) |
| **N17 Y3.B5.S4** "m, cm and mm" | **Landed.** Partial. 111 of 300 answers pass 1,000 (37%), which matches "about 2 in 5 … up to 12,000". Builds `mm_cm_m` (reused; the same skill and kind in Y5) and the new `length_band_1000`. No band option exists on `length_metric` today, so the new proposal is not a duplicate. **8** |
| M15 Y2.B9.S2 | Landed: a second direct `time_quarter {stimulus:'words-past'}` ("quarter to four" → 3:45) |
| M16 Y3.B10.S4 | Landed: `time_analog_digital {dir:'to-analog'}`, a digital time read and the clock checked, 40 / 40 |
| M17 Y3.B8.S1 | Landed: the lead pre is `write_fraction {denoms:[2,3]}`, "a non-unit fraction counts unit fractions" |
| M18 Y2.B4.S6 | Landed: `add_wp_10_plain` is gone from the pres |
| M19 Y3.B12.S5 / S6 | Landed: the `tally_chart` whys now say "reading the counts of a tally chart". A residue sits on one lesson (M23) |
| M20 | Recorded in `GENERATOR-FIXES-2026-10-16.md` §3. Still present on my seeds: `equiv_frac_nv {denoms:[2]}` keys 2 of 30 equal pairs "no". It is linked only as related, so the record is the right handling |

## 2. The new gates under my own mutations

`scratchpad/r15c/mut.mjs` runs each gate on an in-memory copy holding only the mutated entry, with seed 61813 + 389 i and 40 items. All 25 mutations are new; none repeats a builder or r14 case.

| # | Gate | Mutation | Expected | Result |
|---|---|---|---|---|
| a3 | TITLEREP verb | Y3.B12.S4 "Draw bar charts" full on `bar_graph_intro` (reads) | caught | caught (construct 0 / 40) |
| a4 | TITLEREP verb | Y2.B10.S4 "Draw pictograms" full on `pictograph {scale:[0]}` | caught | caught |
| a6 | TITLEREP clause | Y2.B10.S1 partial, the clause never says recording is missing | caught | caught (CLAUSE) |
| b1 | clock | "O'clock and half past" on `time_half_hour` only | caught | caught (o'clock 0 / 40) |
| b2 | clock | "Quarter past and quarter to" on `{quarters:['to']}` | caught | caught (quarter past 0 / 40) |
| b3 | clock | "to 5 minutes" on `time_quarter` | caught | caught |
| b4 | clock | "to the minute" on `time_quarter` + `time_5min` | caught | caught (0 / 80) |
| b6 | measure | Y2.B6.S1 "Measure in centimetres" on `length_metric {forms:[0]}` (no tool) | caught | caught |
| b7 | problems | Y3.B10.S12 partial, the clause names no story or context | caught | caught (CLAUSE) |
| c1 | RANGECHECK | Y2.B2.S15 (no title bound, W6) on `add_10k_no_regroup` | caught | caught (40 / 40 past 100) |
| c5 | RANGECHECK | Y3.B1.S12 "to 1,000" on `compare {band:9999}` | caught | caught (title bound 1,000) |
| b5, x1–x6 | both | `to-analog` alone on the digital step; Y2.B9.S2, Y3.B10.S4, Y3.B5.S4, Y2.B5.S5, Y2.B10.S7 and Y3.B4.S9 as they are | silent | silent ×7 |
| **a1** | TITLEREP verb | Y2.B4.S5 "Make the same amount" full on `money_count {currency:'usd'}` ("Count the coins. Write the total.") | caught | **silent** |
| **a2** | TITLEREP verb | Y2.B5.S8 "Make equal groups – sharing" full on `div_facts {constant:[2]}` | caught | **silent** |
| **a5** | TITLEREP verb | Y2.B1.S6 "Write numbers to 100 in words" on `number_word_form {wordform:['to_number']}` (reads words, writes the numeral) | caught | **silent** |
| **c3** | RANGECHECK clause | Y3.B5.S5 clause "… turning over to mixed units … is not dealt" (no overshoot named) | caught | **silent** |
| c2, c4, c6 | RANGECHECK | `base10_build {band:999}`, `mult_facts {range:1000}`, `more_less_10 {step:100}` | — | void: the generator ignores these values (the items stay in range), so silent is right |

**Verdict on the gates.** They are real checks:
- **Caught:** 11 of the 15 effective positive mutations.
- **Silent:** all 7 controls.

**The verb claim is weaker than the report's description of it.** `isProduction` treats any typed answer that is not a check or a pick as "production". That causes three misses:
- **a1:** a count of a drawn set satisfies "Make".
- **a2:** a bare fact satisfies "Make equal groups".
- **a5:** writing a numeral from words satisfies "Write … in words".

**RANGECHECK's clause test** accepts the bare word "over" (c3).

Neither weakness lets a defect through in the data as it stands. The hand audit, and my scan of all 95 remaining FULL steps, found none of these shapes. These are gate minors (M24).

**Standalone, fresh seeds.** Each run gives 0 findings:
- `titlerep.mjs Y2 Y3 --seed 27457 --step 313`
- `rangegate.mjs Y2 Y3 --seed 61813 --step 389` (7 / 8 links pass their ceiling, and each one is said in its clause)
- `denoms.mjs Y2 Y3`
- `linkscan` OK.

## 3. Site coverage

- **Lessons.** `site-lessons.json` entries with `wrmYear` Y2 (11) and Y3 (25) are exactly the keys of each file's `lessons` section: 0 missing, 0 extra, 0 title mismatches.
- **Steps.** 124 / 134, in `wrm-steps.json` order.
- **Extract check.** `node tests/scripts/ws-wrm-extract.cjs --site …/scratchpad/site/index.html --check` prints both "up to date" lines and exits **0**.
- **Live keys.** 0 links in Y2 / Y3 and 0 tagFixes in any lane use a non-live skill key.

## 4. Reproducibility

| Build | Result |
|---|---|
| A, B: fresh `git archive HEAD` trees, `env -u WRM_TAG_DATA`, scratch `TMPDIR`, `build.mjs Y2 --dropped` then Y3 | exit 0 ×4 |
| C: as A, with `links/Y2.json` and `Y3.json` deleted first, Y3 built before Y2 | exit 0 ×2 |
| sha256 | Y2 `d4b5a0bf…cbfb6c84` and Y3 `e9ee695d…ad3fd8263b` for A, B, C and the committed files (`cmp` identical ×6) |
| In-build gates (log) | specopts 0 (1,073 links in Y2), denomcheck 0, titlerep 0, **rangecheck 0**, mergecheck 0, optgate 0, titleclaim 0, lessons 0, bbcheck 0; Y2 55 / 44 / 25 |

## 5. Merge (my own `merge15.mjs`, written this round)

**Inputs:**
- the in-repo `data/curriculum/links/{R,Y1,Y2,Y3,Y4,Y5,Y6}.json`;
- live `js/modules/wrm.js` `SKILL_WRM` as the base.

**How the actions apply:**
- `remove`, `add`, `partial` and `full` set the status and clause and carry the opts.
- `opts` changes only the opts of an existing tag.
- Both orders are applied.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| R→Y6 against Y6→R (status, clause, opts) | **Identical**, 1,042 tags, 0 problems (no remove or opts on an untagged pair, no unknown action) |
| key\|step written by 2+ lanes | **1**: `patterns:count_by_step_up\|Y2.B1.S15`. Y2 sends `partial`, Y4 sends `add` with `partial`, both with `{step:[0]}` and the clause "counts on in 2s, 5s and 10s from any number (381, 386 …), not the multiples from 0; answers pass 100 even at Max Number 100 (to 190)". The merged tag is partial with that clause in both orders. It sits beside the step's other partial (`count_by_tables` rows from 0 that end at 110 at W4), and the two clauses describe two different skills without contradicting each other, so the merged step is coherent. **0 real conflicts** |
| Own steps after the full merge | Y2: 0 mismatches, 54 / 54 partial clauses verbatim. Y3: 0 mismatches, 74 / 74 |
| The 12 demoted steps | Every one merges as partial (for example `tally_chart\|Y2.B10.S1`, `length_metric\|Y3.B5.S4 {forms:[0,1,2]}`, `perimeter_grid\|Y3.B5.S11`, both elapsed skills on Y3.B10.S12) |
| Proposal ids shared by 2+ lanes | 115, none with a different skill or kind. `teen_structure` (R / Y1 / Y2), `half_or_not` (Y1 / Y2), `frac_nl_equiv` (Y3 / Y4 / Y6), `mm_cm_m` (Y3 / Y5) and `make_amount_notes` / `collect_data` / `fraction_parts` (Y2 / Y3) agree |

**One observation, not a conflict (M25).** Three r15 option links are not carried into the merged tags:
- **Y2.B10.S7** `pictograph {range:20, scale:[0,1,2]}`. The verdict depends on this option, because the default range deals totals to 210.
- **The second directs of Y2.B9.S2 and Y3.B10.S4**: the same key with other opts.

In each case the merged tag is a bare `full`. The lane emitted `tagOpts` for Y3.B6.S10 in r14 for exactly this reason. Lane-wide, 38 of 44 Y2 full directs with opts carry none into `SKILL_WRM`. That convention was accepted in r14, and the links files, which the WRM page reads, hold the opts. So I record it, not grade it.

## 6. Minors (none changes a grade)

| # | Where | Note |
|---|---|---|
| M21 | Y2.B4.S5 clause | "making an amount with coins, and making the same amount in two different ways, are not dealt". The live `make_change_least_coins {currency:'usd'}` does make an amount with coins: "Use the fewest coins. Write how many of each.", amounts to 50¢. The build drops it as "taught later" (Y2.B4.S4 is W33, S5 is W32). That is right for a pre, but not for the clause. Say "making an amount any way other than the fewest coins (taught W33), and the same amount in two ways, are not dealt" |
| M22 | Y2.B8.S5 clause | "names the shaded fraction, which is 1/4 in only a quarter of those items". On 400 items, 1/4 is 77 of 202 shaded-fraction items (38%); 3/4 is 70 and 2/4 is 55. The point holds (most items are not 1/4), but the share is about a third, not a quarter |
| M23 | Y3 lesson "Show measurement data on a line plot", pres | The `tally_chart {most:10}` why is "Y2.B10.S1 Make tally charts (Grade 1): counting data into a tally chart". The skill only reads charts (N15 / M19 class; S5 / S6 were fixed, this lesson was not). The `pictograph {range:50, scale:[0,1,2]}` pre cites Y2.B10.S7, whose own spec is now `{range:20}` |
| M24 (gate) | `titlerep.mjs` `isProduction`; `rangegate.mjs` `NAMES_OVER` | Verb: for "make / build" with a set object (amount, groups), require a built set (a make / ring / build / show task, or a tally of counts). For "write … in words", require words in the answer. Clause: drop the bare "over" (keep "pass / above / beyond", or a number above the ceiling) (a1, a2, a5, c3) |
| M25 (merge) | tagFixes | Emit the `opts` of a full direct whose verdict depends on them (Y2.B10.S7 `{range:20}`), as `tagOpts` did for Y3.B6.S10. Name in the report that `SKILL_WRM` holds one opts per key\|step, so the second `time_quarter` / `time_analog_digital` direct lives only in the links file |
| M26 (rule 18) | pre links, which RANGECHECK does not read | Gram dials to 1,800 g (`mass_volume_liquid {forms:[1]}`, 12 of 40 items past 120) are a pre of Grade 1 Y2.B7.S4, S6 and S7, and the cylinder to 800 mL is a pre of Y2.B7.S8. The lane demoted Y2.B7.S6 for exactly that overshoot. The 100s row to 1,100 is a pre of Y3.B1.S10 / S11 (23 of 40 past 1,000). Run `rangeFinds` over pre links too, or say the overshoot in the why. Most other pre overshoots (`linkrange.mjs`: Y2 26 / 669, Y3 15 / 776) are earlier-grade content the pupil has met (bonds to 20 before bonds to 10, numbers to 99 from Grade K) and are fine |
| M27 | Y2 lesson "Count on to 120" | The related `number_chart_fill {band:200}` deals windows from 101, with blanks ≤ 120 in 46 of 200 items. The clause "reading and writing the numerals 101 to 120" is not quite "never dealt"; it could add this as a partial link with "most windows pass 120" |
| M28 (optional) | Y3.B5.S12 "Calculate perimeter" | `perimeter {forms:[0,1]}` is text only ("length = 10, width = 5", no picture and no unit in form 0). `perimeter_intro {labels:'some'}` draws a rectangle with one length and one width labelled, which is WRM's point (opposite sides are equal) and would sit well as a second direct |

## 7. The sample and the grades

**Method.**
- **Items.** `dumpS.mjs`: 40 items per direct or partial link and 16 per pre or related link, on the §1 seeds. Probes up to 400 items with `big.mjs` and `pr.mjs`.
- **FULL 25.** Every FULL step not graded in r10–r14 (8: the excluded set is r14's `sample.json` plus r14's own rows), plus 17 drawn with `random.Random(151501)` from the rest. The 5 kept-full steps were graded separately.
- **Partial / gap.** `random.Random(151502)`: 10 per year from the non-full steps that are not demoted, preferring steps never graded. Y2 has only 4 such steps, Y3 has 9; the rest were drawn from all.
- **Lessons.**
  - The full lessons were drawn with `random.Random(151501)`: 3 for Y2 and 4 for Y3, 7 in all, which meets the ≥ 6 the task asks.
  - The other lessons: 6 per year. For Y2 they were drawn with `random.Random(151503)`. For Y3 I chose six lessons that r13 and r14 did not grade.
  - The Y3 line-plot lesson was added because the scan of whys flagged it (M23).
- **Each entry** was judged against every clause of its WRM title and of the CCSS standard it teaches, at the step's range and school week. A CCSS code that spans many steps is not held against one step.

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r15c/`:
- `lib.mjs`, `dumpS.mjs`, `pr.mjs`, `big.mjs`, `peek.mjs`;
- `fullscan.mjs` and `fullscan.txt` (every FULL step);
- `mut.mjs` (§2), `linkrange.mjs` (M26), `optsfix.mjs` (M25);
- `merge15.mjs`, `b.sh` with trees `a`–`c` and their logs, `repro.out`;
- `sample.json`.

### Y2 (Grade 1) steps: 30, mean 8.00

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **FULL, never graded r10–r14** | | | |
| B1.S3 Recognise tens and ones (W1) | full | 8 | "How many tens?" 1–9 tens, plus building 2-digit numbers with rods and units |
| B9.S5 Tell the time to 5 minutes (W37) | full | 8 | 5-minute times, never a quarter (80 / 80), plus the minutes ring in 5s |
| **FULL, random** | | | |
| B2.S1 Bonds to 10 (W9) | full | 8 | Ten frame shows 1–9, "how many more make 10": every bond |
| B2.S17 Subtract two 2-digit numbers, no exchange (W6) | full | 8 | 64 / 80 2-digit − 2-digit; the rest 2-digit − 1-digit |
| B3.S9 Count edges on 3-D shapes (W14) | full | 8 | |
| B5.S6 Use arrays (W29) | full | 8 | Rows of … make … in all, plus counting arrays |
| B5.S10 Divide by 2 (W30) | full | 8 | ÷2 facts to 24 |
| B5.S11 Doubling and halving (W30) | full | 8 | Double and half to 20, the half on a split bar |
| B5.S13 The 10 times-table (W26) | full | 8 | ×10 to 120 at W26 (the 120 band) |
| **Demoted in r15** | | | |
| B1.S1 Numbers to 20 (W1) | partial | 8 | True: `teen_compose` deals 1–9 and 11–19 (no 20), and `base10_build {band:20}` stops at 19. `teen_structure` is reused verbatim from the R / Y1 lanes |
| B1.S15 Count in 2s, 5s and 10s (W4) | partial | 8 | True: the 10s row ends at 110. `count_row_end` is new and is not built (`count_by_tables` has no end option) |
| B4.S5 Make the same amount (W32) | partial | 8 | N16 (§1); M21 |
| B7.S6 Measure in millilitres (W36) | partial | 8 | True: 148 of 300 readings pass 120. `scale_band_100` is new; no band option exists |
| B8.S3 Recognise a half (W17) | partial | 8 | True: 40 / 40 "1/2" and 40 / 40 "2 parts". `half_or_not` (Y1) closes "is it a half?" |
| B8.S5 Recognise a quarter (W18) | partial | 8 | Clause true in substance; M22 (the share is about a third, not a quarter) |
| B8.S7 Recognise a third (W31) | partial | 8 | True; `fraction_parts` (WRM_PROPOSALS) decides equal or unequal parts |
| B10.S1 Make tally charts (W24) | partial | 8 | N15 (§1) |
| **Kept full with a live option** | | | |
| B5.S5 Multiplication sentences (W28) | full | 8 | `nl_mult {response:'sentence'}`: "Look at the hops. Write the multiplication sentence" (7, 2, 14), with hops of 2, 5 and 10 |
| B9.S2 Quarter past and quarter to (W36) | full | 8 | :15 and :45 read from a clock, plus "quarter past five" and "quarter to four" written as times |
| B10.S7 Interpret pictograms (2, 5 and 10) (W38) | full | 8 | `{range:20}`: keys 2 / 5 / 10 at 138 / 137 / 125 of 400, every answer within 120. M25 |
| **Partial / gap, random** | | | |
| B1.S7 Flexibly partition numbers to 100 (W2) | gap | 8 | `flex_partition` |
| B1.S12 Compare objects (W3) | partial | 8 | `compare_groups` to 10; the clause names what is missing |
| B3.S7 Sort 2-D shapes (W14) | partial | 8 | True: right angles and parallel sides are above Grade 1 |
| B4.S10 Two-step problems (W34) | gap | 8 | `money_2step` |
| B6.S5 Four operations with lengths and heights (W34) | gap | 8 | `length_ops` |
| B7.S4 Four operations with mass (W35) | gap | 8 | M26: the lead pre's gram dials reach 1,800 g |
| B7.S5 Compare volume and capacity (W23) | gap | 8 | No live capacity compare skill (checked `compare_objects` tasks); `capacity_early` |
| B8.S13 Recognise three-quarters (W17) | partial | 8 | Both clauses true |
| B9.S7 Hours in a day (W23) | gap | 8 | `time_facts` |
| B10.S3 Block diagrams (W25) | partial | 8 | |

Sum 240 / 30 = **8.00**.

### Y3 (Grade 2) steps: 32, mean 8.00

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **FULL, never graded r10–r14** | | | |
| B1.S1 Represent numbers to 100 (W1) | full | 8 | Base-10 builds and tens-and-ones form of 2-digit numbers. 100 itself is the next step but two ("Hundreds") |
| B1.S12 Compare numbers to 1,000 (W2) | full | 8 | 3-digit pairs with <, >, =, the largest 977 |
| B3.S9 Multiply by 4 (W11) | full | 8 | ×4 facts to 48 |
| B3.S10 Divide by 4 (W31) | full | 8 | ÷4 facts |
| B5.S12 Calculate perimeter (W16) | full | 8 | Rectangles and squares from the sides, and a missing side from the perimeter; M28 |
| B11.S7 Recognise and describe 2-D shapes (W27) | full | 8 | Name, pick all, count sides and vertices |
| **FULL, random** | | | |
| B1.S6 Partition numbers to 1,000 (W2) | full | 8 | |
| B1.S14 Count in 50s (W3) | full | 8 | 0 to 550 from 0; past 550 and counting back are not dealt (not title claims) |
| B3.S1 Multiplication, equal groups (W10) | full | 8 | |
| B6.S3 Understand the numerators of non-unit fractions (W26) | full | 8 | 52 / 80 non-unit, written and shaded |
| B7.S7 Measure capacity and volume in millilitres (W36) | full | 8 | Cylinder readings to 900, all ≤ 1,000 |
| B9.S3 Add money (W19) | full | 8 | |
| B9.S5 Find change (W20) | full | 8 | Change from $1 / $5 in dollars and cents |
| B10.S5 Use a.m. and p.m. (W21) | full | 8 | |
| B10.S9 Hours and minutes, use durations (W22) | full | 8 | End time from a duration (`elapsed_mixed` 80 / 80 "later"), plus durations |
| B11.S6 Parallel and perpendicular (W29) | full | 8 | Names and clicks parallel, perpendicular and intersecting |
| **Demoted in r15** | | | |
| B2.S21 Inverse operations (W8) | partial | 8 | True: 290 / 300 2-digit minuends, subtraction checks only. `inverse_check_1000` is new (Y4's `inverse_check` is 5–6-digit) |
| B5.S4 Metres, centimetres and millimetres (W14) | partial | 8 | N17 (§1) |
| B5.S11 Measure perimeter (W16) | partial | 8 | True: 187 / 300 count edges, 113 add written sides, none measures. `perimeter_measure` is new |
| B10.S12 Solve problems with time (W23) | partial | 8 | True: time lines only, no story. `time_stories` is new, and no live elapsed skill deals stories |
| **Kept full with a live option** | | | |
| B4.S9 Divide 2-digit by 1-digit with remainders (W32) | full | 8 | `box_division_easy {regroup:'always'}`: 300 / 300 with a remainder (68 ÷ 3 = 22 R 2), plus ringing counters |
| B10.S4 Read time on a digital clock (W21) | full | 8 | `{dir:'to-analog'}` shows the digital time in the stimulus, 40 / 40 |
| **Partial / gap, random** | | | |
| B1.S7 Flexible partitioning to 1,000 (W2) | gap | 8 | |
| B2.S2 Add and subtract 1s (W3) | gap | 8 | `more_less_1_3digit` |
| B2.S4 Add and subtract 100s (W4) | partial | 8 | |
| B2.S7 Add 10s across a 100 (W5) | gap | 8 | `cross_100` |
| B3.S15 The 2, 4 and 8 times-tables (W32) | partial | 8 | The doubling link clause is true |
| B4.S2 Related calculations (W30) | partial | 8 | |
| B4.S3 Reasoning about multiplication (W12) | partial | 8 | |
| B7.S11 Add and subtract capacity and volume (W35) | gap | 8 | |
| B9.S2 Convert pounds and pence (W19) | partial | 8 | |
| B10.S10 Minutes and seconds (W22) | gap | 8 | |

Sum 256 / 32 = **8.00**.

### Lessons: 20, mean 8.00

**Y2 (Grade 1), 9 lessons: 72 / 9 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Find the total (US) (above) | full | 8 | Two prices to $5 |
| Compare mass (1) (Support) | full | 8 | |
| Bonds to 10 (Support) | full | 8 | |
| Compose and recompose shapes (W15) | partial | 8 | Both clauses true |
| Compare mass (2) (Support) | full | 8 | |
| Length and height, compare and order (Support) | full | 8 | |
| Doubling up to 5 + 5 (Support) | partial | 8 | |
| One-step word problems within 20, bar models (W03) | partial | 8 | |
| Count on to 120 (W08) | partial | 8 | M27 |

**Y3 (Grade 2), 11 lessons: 88 / 11 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Solve two-step word problems identifying both operations (W09) | full | 8 | Add-then-subtract and subtract-then-add within 50 |
| Add up to four two-digit numbers (W09) | full | 8 | Three or four 2-digit addends in a column |
| Find the total (Support) | full | 8 | |
| Compare mass (2) (Support) | full | 8 | |
| One-step word problems, bar models (W09) | partial | 8 | |
| Add and subtract within 100 on a number line, tens and ones (W13) | partial | 8 | |
| Partition a rectangle into rows and columns (W26) | partial | 8 | |
| Compare capacity (1) (Support) | gap | 8 | |
| Compare size, mass and capacity informally (Support) | partial | 8 | |
| Select money (Support) | partial | 8 | |
| Show measurement data on a line plot (W18) | partial | 8 | M23 |

## 8. Fix list (optional: the round passes)

| Row | Fix |
|---|---|
| M21 | Y2.B4.S5 clause, as in §6 |
| M22 | Y2.B8.S5: "1/4 in about a third of those items" |
| M23 | Line-plot lesson: the `tally_chart` why reads charts. Align or drop the `pictograph {range:50}` cite |
| M24 | `isProduction` for set objects and "in words"; drop the bare "over" in `NAMES_OVER` |
| M25 | `tagOpts` for Y2.B10.S7 `{range:20}`; note the one-opts-per-key\|step limit in the report |
| M26 | RANGECHECK over pre links, or say the overshoot in the why (Y2.B7.S4 / S6 / S7 / S8, Y3.B1.S10 / S11) |
| M27, M28 | Optional link additions |
