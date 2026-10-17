# Critic round 12: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2), with site lessons

Critic run on 2026-10-16 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 71444565, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I graded only: the tagging data, the site files and the tooling were not
edited.

## Verdict: FAIL (narrowly)

| Set | Graded | Mean | Min | Notes |
|---|---|---|---|---|
| Y2 steps | 26 | **7.96** | **7** | random 20: 8.00; hard 5: 7.80; r11 seven (B2.S15): 8 |
| Y3 steps | 26 | **8.00** | 8 | random 20: 8.00; hard 5: 8.00; r11 seven (B7.S1): 8 |
| Y2 lessons | 11 (all) | **8.00** | 8 | |
| Y3 lessons | 25 (all) | **8.00** | 8 | |

| Gate | Result |
|---|---|
| Every graded step and lesson ≥ 8 | **No.** One seven: **Y2.B8.S12** Recognise the equivalence of a half and two quarters (N12, below) |
| Each year's means ≥ 8 | Y2 steps **No** (7.96). Y3 steps, Y2 lessons and Y3 lessons: yes |
| 0 real merge conflicts | **Yes.** My own simulation, all seven in-repo lanes against live `wrm.js`, both orders: 1 key\|step written by two lanes (the known Y2/Y4 duplicate on Y2.B1.S15), identical outcome, so 0 real conflicts (§5) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds, plus a third with the committed Y2.json / Y3.json deleted first: all byte-identical to the committed files (§4) |
| Site coverage complete | **Yes.** The `lessons` sections hold exactly the 11 / 25 Y2 / Y3 entries of `site-lessons.json`; the steps are exactly the 124 / 134 of `wrm-steps.json`; `ws-wrm-extract --site … --check` exit 0 (§3) |

Score distribution:
- **Y2 steps:** 8 ×25 · 7 ×1
- **Y3 steps:** 8 ×26
- **Lessons:** 8 ×36

Every r11 row landed and holds on fresh seeds. The new gates are real checks: each fired on mutations of my own (§2). The site
lessons are all 8. One defect keeps the round from passing: **N12**. The round-12 report says every `denoms` link was
regenerated with "0 off-family". That is false for `equiv_frac_visual {denoms:[2]}`. Its = / ≠ items carry their fractions
only in the cell payload, so neither the generator's `denoms` filter nor the lane's check sees them. On a Grade 1 W17 halves step,
the partial clause no longer says what is dealt.

## 1. The r11 rows on fresh seeds

Seeds: `30707+227i` ×30, `51829+239i` ×30, `70913+251i` ×20 (`generateQuestionFor`, print path), new to this round.

| r11 row | Result |
|---|---|
| A1 / N11, pre ranked by building block | **Landed.** `bbRank` and BBCHECK in `build.mjs`. Y2.B2.S15 leads with `add_sub_10s` (Y2.B2.S4), then `base10_build {band:99}`, `unit_form`, the ones `add_20_no_regroup`. Y3.B2.S13 / S14 lead with `add_100_regroup` (Y2.B2.S16, "the same exchange of 10 ones, one band lower"), then `add_1k_no_regroup` (Y3.B2.S11). Y2.B2.S10 leads with `sub_20_no_regroup`, the counting-back lines, `make_ten` and `make_a_ten` (the bridge through 10). I scanned every lead pre of both files: no addition step leads with a subtraction, and no non-problem step leads with a word problem |
| A2 / N10, kg dials | **Landed** (generator fixed by PR #8). `mass_volume_liquid {forms:[1]}`: 39 kg dials and 41 gram dials of 80, **0 answers of 0**; kg dials 0-10 kg with every mark labelled, gram dials 100 or 200 g a mark. `{forms:[0,1]}`: 38 mL / 25 kg / 17 g. The clauses of Y2.B7.S2 / S3, Y3.B7.S1 / S2 / S3 now describe exactly this. The answer-0 notes are gone. The `{forms:[1]}` pres read "a dial in g or kg (every mark labelled)", which is true |
| A3, residual `sameItems` | **Landed** for the r11 cases. Y2.B2.S5 now has the K rung `number_line_add {range:10}`, and Y2.B2.S21 has no pre equal to its directs. One case is left (structure note, §6 row 3) |
| Y2.B2.S15 (r11: 7) | **8.** The rows above |
| Y3.B7.S1 (r11: 7) | **8.** The clause reads "one scale at a time: a cylinder in mL … or a dial in g or kg (every mark labelled); working out what each interval is worth from labels several marks apart … is not dealt". That is true of the items |
| Y2.B7.S3, Y3.B7.S3, Y2.B7.S2 | **Landed.** The clauses are true (counts above) |
| Y2.B11.S2 | **Landed.** "a quarter of a shape is the quarter turn" |

**PR #8 follow-up: Y2.B7.S3 Measure in kilograms stays partial. I agree.** About half of `{forms:[1]}` is gram dials, and no
option keeps a page to kilograms. The kg dials are 1 kg a mark with every mark labelled. WRM Year 2 reads kilogram scales
with steps of 1, 2, 5 and 10 and unlabelled marks, so the clause and the `mass_scales` build are the right call.

## 2. The new gates: real checks or rubber stamps?

I ran each mutation in its own fresh `git archive HEAD` tree.

| Mutation | Result |
|---|---|
| **OPTGATE m1:** drop one approved `markerFixOk` entry (Y3.B4.S4 `mult_zeros {forms:[0,2]} → {forms:[0]}`) | **exit 1**: `OPTGATE Y3.B4.S4 pre markerFix not approved`, with the spec why and the new why printed |
| **OPTGATE m2:** a silent re-option inside the step pass, after the spec snapshot (Y2.B2.S15 / Y3.B2.S13 `base10_build` and `add_100_regroup` → `band:50`) | **exit 1**: 1 and 2 `changed by no named rule` lines |
| **OPTGATE m3:** the same re-option placed **after** the OPTGATE loop (before the write) | **exit 0, not caught.** The written Y2.json carries `band:50`. The gate checks links at the end of each step's pass. Unlike the Y5 lane's `specopts`, it does not compare the written file with the spec snapshot. No code after the gate assigns opts today (I read l.545–665: lessons take their links straight from `lessons.mjs`), so no live link is affected. Gate-only minor (§6 M1) |
| **BBCHECK m4:** reverse every addition / subtraction and multiplication / division pre list after `bbSort` | **exit 1**: 14 Y2 and 13 Y3 steps flagged (word-problem lead, inverse lead, a fact family first). A good ranking is still not enforced beyond these classes (a class-2 rung may lead), which matches what the gate says it checks |
| **TITLECLAIM m5:** `whyFix` makes Y2.B7.S7's `mass_volume_liquid {forms:[1]}` cite "Y2.B7.S6 Measure in millilitres" (the key is direct there; the items are g / kg) | **exit 1**: `TITLECLAIM … false: millilitres` |
| **Sweep** (`sweep()` imported, mutated copies of Y2.json / Y3.json) | Caught 9 of 11: a "number line" claim on `add_sub_10s` (0/30), a "bar model" claim (0/30), a cited title "Count in notes" on base-10 items (money 0/30), "litres" on a g/kg dial, "times as many" on unit form, "sort" on a calculation, "coins" on a count, an inch ruler related on a metres step (rule b), and "never subtracts" on a `sub_50_regroup` clause (a-neg 30/30). **Not caught:** "never subtracts" on the `sub_wp_20` story clause (a-neg reads only a "7 − 4" sign, and stories carry none), and "reads kilogram dials only; never grams" (a-neg covers operations only). Both are by design, the same as the Y5 lane. Minor M2 |

**The 13 approved `markerFixOk` re-options**, re-read on items:
- `partition_shapes {parts:[0,2]}` on Y2.B8.S1 / S2 / S9 / S10 / S12 and Y2.B11.S3: 80 items give 48 halves items and 32 quarters items (1/4, 2/4, 3/4). "Shapes cut into 2 or 4 equal parts … (1/2, 1/4)" is true.
- `time_half_hour` on Y2.B8.S10 / S12 and Y2.B11.S3 / S4: every item is half past. "half way round the clock" is true.
- Y3.B3.S4 `div_facts {constant:[2,5,10], band:100}`: 16 ÷ 2, 30 ÷ 10, 50 ÷ 5. True.
- Y3.B4.S4 `mult_zeros {forms:[0]}`: n × 10 only. True.
- Y3.B4.S11 `repeated_add_to_mult {band:25}`: 5 + 5 + 5 = 3 × 5. True, though it is a thin rung for "How many ways".

All 13 are sound.

**Spot check of whys and clauses.** I read 34 links drawn at random (an LCG seeded 161018 over all 2,145 pre / related /
partial entries of both files, steps and lessons) on fresh items, plus every link of the 52 graded steps and 36 lessons. All
34 random entries are true. Among the graded entries, five whys overstate:
- the Y3.B6.S9 pre (N12);
- the Y2.B11.S4 / S5 / S2 and Y3.B7.S10 related links (M3–M5).

The sweep cannot see any of them.

## 3. Site coverage

- `site-lessons.json` has 143 lessons. Those with `wrmYear` Y2 (11) and Y3 (25) are exactly the keys of each file's
  `lessons` section, and the titles match.
- The `steps` sections are exactly the 124 / 134 Y2 / Y3 step ids of `wrm-steps.json`, in its order.
- `node tests/scripts/ws-wrm-extract.cjs --site …/scratchpad/site/index.html --check`: "wrm-steps.json up to date",
  "site-lessons.json up to date", exit 0.
- The lane's own checks pass: `linkscan.mjs Y2 Y3` OK; `sweep.mjs Y2 Y3` OK (a 0, a-neg 0, b 0, c 55 / 63);
  `mergecheck23.mjs` 0 / 0.

## 4. Reproducibility

| Build | Result |
|---|---|
| A and B: two clean `git archive HEAD` trees, `env -u WRM_TAG_DATA`, a scratch `TMPDIR`, `build.mjs Y2 --dropped` then Y3 | Exit 0 ×4. The logs are identical (Y2 124 = 63 / 36 / 25, 11 lessons 6 / 5 / 0; Y3 134 = 49 / 55 / 30, 25 lessons 8 / 12 / 5; mergecheck, optgate, titleclaim, lessons and bbcheck all 0 problems). The files were rewritten (new mtime) |
| C: tree B with `links/Y2.json` and `Y3.json` deleted, Y3 built before Y2 | Exit 0. Same output |
| sha256 | Y2 `010b47e6…dd08c3`, Y3 `9cea8c53…db84c4` for A, B, C and the committed files |

The tooling has no absolute or scratch paths. The build reads only the repository: `xlsx.py` reads the xlsx in
`data/curriculum/source/`, and the other lanes' files come from `data/curriculum/links/`.

## 5. Merge (my own `merge12.mjs`)

Inputs: in-repo `data/curriculum/links/{R,Y1,Y2,Y3,Y4,Y5,Y6}.json` against live `js/modules/wrm.js`. Each tagFix becomes an
outcome (full / partial + opts / opts only / removed). Lane orders: R→Y6, and Y6→R.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 66, Y3 71, Y4 166, Y5 175, Y6 148 |
| Result independent of lane order | **Yes** |
| key\|step written by 2+ lanes | **1**: `patterns:count_by_step_up\|Y2.B1.S15`, Y2 and Y4 both partial with `{step:[0]}` and the same clause. Identical outcome, so **0 real conflicts** |
| Each lane's own steps (direct = full, partial = partial, no stray live tag), alone and merged | R 0/0, Y1 0/0, **Y2 0/0, Y3 0/0**, Y4 0/0, Y5 0/0, Y6 0/0 |
| Proposal ids shared by 2+ lanes | 113, none with a different skill or kind |
| The lane's `mergeall.mjs`, both orders | 1,040 tags, 0 problems (the duplicate is a NOTE) |

**Format note for the lead (not a conflict).** Y2 and Y3 use only `add` / `partial` / `remove`, like R and Y1. A direct or
partial whose tag is already live carries its opts only in the step entry, not in a tagFix. This affects Y2 43 and Y3 39
entries (R 76, Y1 103). Y4–Y6 use `action:'opts'`. When merging these four lanes, take the opts from the steps' `direct` /
`partial`. This is the same convention the passed R/Y1 lane uses, so it is not graded.

## 6. New defect and minors

### N12: `equiv_frac_visual {denoms:[2]}` deals other families in its = / ≠ items, and the lane's claims miss it

**Generator.** On 80 fresh items, 33 have a fraction outside the halves family (2 / 4 / 8 / 16). About 20 of them are
fractions the Y2.B8.S12 clause never names:
- 1/5 ≠ 3/7;
- 3/5 = 12/20, 4/5 = 16/20, 2/5 = 8/20;
- 2/3 = 6/9;
- 1/3 = 4/12;
- 5/6 = 10/24, 4/6 = 12/18.

The `denoms` acceptor (`generate-question.js` `itemDenominators`) reads the question text, the picture markup, the options
and the answer. The = / ≠ items draw their circles from `q.cell.payload.terms` alone, so the filter passes them. The same
items appear at the r11 commit, so this is old content. But round 12 claims "every `denoms` link (15 key + opts) regenerated,
60 items each: 0 off-family on the families". That check evidently read the same fields.

**Where it lands:**

| Entry | Text | Problem |
|---|---|---|
| **Y2.B8.S12** Recognise the equivalence of a half and two quarters (W17), partial clause | "denoms [2] is the halves family: it deals 3/4 = 12/16, sixths, twelfths and eighths (and 5/3 choices)" | About a quarter of the items are thirds, fifths, sevenths, ninths and twentieths, on a Grade 1 halves step. The clause names none of them. **Graded 7.** The verdict (partial) and the build (`single_fraction`) are right, but the clause is the lane's claim about what is dealt, the r11 N10 class. Round 5 scored this same step 7 for the same class |
| Y3.B6.S9 pre | "this step's skill as it was met then (denominators: halves, quarters, eighths)" | False for about 40% of the items |
| Y3.B6.S8, Y3.B8.S2 pres | cite "Y2.B8.S12 Recognise the equivalence of a half and two quarters" | The content (any denominators at Y3 W37) is fine for Year 3, but the cited title claims halves. Graded steps, minor (8) |

The distractor-only cousin is minor: `identify {denoms:[2]}` / `{denoms:[2,3]}` "pick the model" shows 1/6 or 4/5 among the
choices. Y2.B8.S13's clause names this; Y2.B8.S10's does not.

### Minors (none changes a grade)

| # | Where | Note |
|---|---|---|
| M1 | OPTGATE (gate only) | A re-option after the gate loop is not caught (m3). Compare the written file with the spec snapshot, as the Y5 lane's `specopts` does |
| M2 | sweep a-neg (gate only) | A "never subtracts / adds" clause on a story skill is not checked (the sign regex). A "never grams"-style unit negation is not read |
| M3 | Y2.B11.S5 related `number_pattern {band:50}` | "continuing a repeating pattern": the items are growing number sequences and "drag in reverse counting order", not a repeating pattern |
| M4 | Y2.B11.S2 / S4 related `place_on_number_line {span:10, band:20}` | `band:20` changes nothing (tap 57, 67 on a 50-60 line). "moving … along a line by a number of steps" is not dealt (the pupil taps one number) |
| M5 | Y3.B7.S10 related `money_compare` | "the same <, > and = with units": the items ring the set with more money; there is no sign |
| M6 | Y3 inch-ruler lessons (Compare units, Record in a table, Longer by / Shorter by) | `reading_ruler` cites "Y3.B5.S2 Measure in millimetres" with a nearest-live-practice marker. Citing Y2.B6.S1 (the Grade 1 inch ruler) would read better |
| M7 | Count on to 120 (lesson) | Related `number_chart_fill {band:200}` deals 101–200 windows. It could stand as a second partial (it reaches past 120) beside `chart_120`. Either reading is defensible |

## 7. The sample

**Method.** Items come from the print path on the seeds of §1: D/P links 40 items, links 16. The random samples are drawn
from steps not graded in r10 or r11: `random.Random(161016)` for Y2 (61 in the pool) and `random.Random(161017)` for Y3 (76 in
the pool). The hard 5 per year are my own choice: the r11 ungraded N11 steps, the PR #8 steps, the self-check's moved leads,
the markerFix steps and a fraction partial. Scripts are in
`/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r12c/`:
- `lib.mjs`, `dump.mjs` and the `d-*.txt` dumps;
- `kg.mjs`, `ps.mjs`, `den*.mjs`, `efv.mjs`, `old.mjs` (N12 at r11), `bar.mjs`, `ms*.mjs`;
- `mfo.mjs` (markerFixOk), `rw.mjs` / `rw.txt` (the random 34);
- `mutsw*.mjs` (sweep mutations), `m1`–`m5` (gate mutation trees and logs);
- `merge12.mjs`;
- `a`, `b` (the build trees) and their `*.log`.

### Y2 (Grade 1) steps: mean 7.96

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **r11 seven** | | | |
| B2.S15 Add two 2-digit numbers, not across a 10 (W6) | full | **8** | Adding 10s leads, then partition and the ones (N11 fixed) |
| **Hard 5** | | | |
| B2.S10 Subtract across 10 (W11) | full | 8 | `sub_20_no_regroup` leads, then counting back, bonds to 10 and the make-10 bridge |
| B7.S3 Measure in kilograms (W35) | partial | 8 | PR #8 clause true (about half kg dials, every mark labelled); partial is right |
| **B8.S12 Half and two quarters (W17)** | partial | **7** | **N12**: about a quarter of the partial's items are thirds, fifths, sevenths, ninths and twentieths; the clause says "the halves family … sixths, twelfths". The pres are a little thin (grouping and "same or not" as analogies) |
| B4.S8 Make a pound (W34) | partial | 8 | Clause true (checks coins to 95 cents); the same check to 50 cents leads |
| B2.S5 Add and subtract 1s (W10) | partial | 8 | Two honest partials; the K 1-more rung and the line to 10 lead |
| **Random 20** | | | |
| B9.S1 O'clock and half past | full | 8 | Hour and half-hour clocks. Note true (quarter and 5-minute times come later) |
| B8.S6 Find a quarter | partial | 8 | Honest clause; the quarters rung leads |
| B5.S2 Make equal groups | gap | 8 | `equal_groups_early`; the recognise-equal-groups step leads. The last two pres (pictures +/−) are padding |
| B3.S9 Count edges on 3-D shapes | full | 8 | |
| B2.S18 Subtract two 2-digit numbers, across a 10 | full | 8 | The no-exchange step leads, then 10s and partition |
| B5.S7 Make equal groups – grouping | full | 8 | |
| B3.S5 Lines of symmetry | partial | 8 | Honest (diagonals and counts; no vertical-only page) |
| B1.S1 Numbers to 20 | full | 8 | |
| B2.S11 Subtract from a 10 | gap | 8 | "10 − 3 = 7, so 40 − 3 = 37" leads, then subtract across 10 |
| B2.S19 Mixed addition and subtraction | full | 8 | |
| B11.S5 Shape patterns with turns | gap | 8 | M3 on the related |
| B3.S2 Count sides on 2-D shapes | full | 8 | |
| B3.S1 Recognise 2-D and 3-D shapes | full | 8 | |
| B4.S7 Calculate with money | partial | 8 | Honest (whole-dollar sums only) |
| B2.S14 Add and subtract 10s | partial | 8 | Honest; 10 more / 10 less leads |
| B6.S4 Order lengths and heights | partial | 8 | Honest |
| B3.S3 Count vertices on 2-D shapes | full | 8 | |
| B8.S5 Recognise a quarter | full | 8 | Quarters of shapes (1/4, 2/4, 3/4) |
| B1.S14 Order objects and numbers | partial | 8 | Honest; compare leads |
| B11.S4 Describe movement and turns | gap | 8 | M4 on the related |

Sum 207 / 26 = **7.96**.

### Y3 (Grade 2) steps: mean 8.00

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **r11 seven** | | | |
| B7.S1 Use scales (W34) | partial | **8** | Clause true on fresh items (no answer-0) |
| **Hard 5** | | | |
| B2.S13 Add across a 10 (W6) | partial | 8 | `add_100_regroup` leads, then `add_1k_no_regroup` (N11 fixed) |
| B2.S14 Add across a 100 (W6) | partial | 8 | The same building blocks |
| B4.S10 Scaling (W33) | partial | 8 | Honest (×6/7/9 beyond Grade 2). Doubling leads. The pres stop at the 2s (the W33 list), which is thin but true |
| B7.S3 Mass in kg and g (W35) | partial | 8 | Honest. Pres: count in 100s, the number line to 1,000, m and cm |
| B3.S4 Multiples of 5 and 10 (W9) | partial | 8 | The count from 0 in 5s and 10s leads; the approved ÷2/5/10 why is true |
| **Random 20** | | | |
| B5.S6 Equivalent lengths (cm, mm) | partial | 8 | m ↔ cm leads |
| B2.S10 Make connections | partial | 8 | |
| B4.S5 2-digit × 1-digit with exchange | partial | 8 | Honest clause (no-exchange and ×6/7/9 items named) |
| B7.S10 Compare capacity and volume | gap | 8 | M5 on the related |
| B1.S9 Find 1, 10 or 100 more or less | partial | 8 | |
| B9.S1 Pounds and pence | full | 8 | Dollars and cents, both counted and written |
| B2.S6 Add 1s across a 10 | partial | 8 | `add_10_regroup` leads |
| B10.S2 Time to 5 minutes | full | 8 | |
| B6.S8 Count in fractions on a number line | gap | 8 | N12 cite on one pre (the content suits Year 3 W37) |
| B1.S2 Partition numbers to 100 | full | 8 | |
| B10.S9 Hours and minutes – durations | full | 8 | |
| B4.S7 2-digit ÷ 1-digit, no exchange | partial | 8 | Honest clause (75 ÷ 5 named) |
| B8.S2 Subtract fractions | partial | 8 | Honest two-part clause; add fractions leads. N12 cite on one pre |
| B4.S11 How many ways | gap | 8 | |
| B3.S6 Multiply by 3 | full | 8 | |
| B12.S2 Draw pictograms | partial | 8 | Honest (no key of 2/5/10) |
| B7.S8 Capacity in l and ml | partial | 8 | Honest. Only 3 pres, one a K compare (thin) |
| B6.S7 Fractions on a number line | full | 8 | |
| B2.S21 Inverse operations | full | 8 | Check by adding; fact families lead (the inverse is this step's idea) |
| B11.S5 Horizontal and vertical | gap | 8 | |

Sum 208 / 26 = **8.00**.

### Lessons: all 36, mean 8.00

**Y2 (Grade 1), 11 lessons: 88 / 11 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| One-step word problems within 20, bar models (W03) | partial | 8 | `support:'bar'` draws the bar on 20 of 20 items; the clause (result unknown only) is true |
| Count on to 120 (W08) | partial | 8 | Honest; `chart_120`. M7 |
| Compose and recompose shapes (W15) | partial | 8 | 2-D only, said |
| Bonds to 10 (Support, Reception) | full | 8 | |
| Compare mass (1) / (2) (Support, Reception) | full / full | 8 / 8 | Few pres, with a note |
| Count money – notes and coins (above) | full | 8 | |
| Doubling (up to 5+5) (Support) | partial | 8 | Honest (abstract, to 10 + 10) |
| Find the total (above) | full | 8 | Adds two prices in dollars and cents to $5 |
| Length and height (Support) | full | 8 | |
| Select money (above) | partial | 8 | |

**Y3 (Grade 2), 25 lessons: 200 / 25 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Read and write numbers to 1,000 (W02) | full | 8 | Words both ways and expanded form |
| Add up to four two-digit numbers (W09) | full | 8 | |
| One-step word problems, bar models (W09) | partial | 8 | |
| Two-step word problems, both operations (W09) | full | 8 | The cell asks the pupil to circle the operation for Step 1 and Step 2 (40 of 40); numbers to 50 |
| Odd and even numbers (W12) | partial | 8 | |
| Number line jumps of tens and ones (W13) | partial | 8 | New `nl_tens_ones_jumps` closes it |
| Compare units: in, ft, yd, cm (W17) | gap | 8 | M6 |
| Measure and estimate in inches and feet (W17) | partial | 8 | |
| Measure a set of objects (W17) | partial | 8 | |
| Record measurement data in a table (W17) | gap | 8 | |
| Show measurement data on a line plot (W18) | partial | 8 | |
| Longer by / Shorter by, bar models (W18) | gap / gap | 8 / 8 | |
| Partition a rectangle into rows and columns (W26) | partial | 8 | |
| Compare capacity (1) (Support) | gap | 8 | |
| Compare mass (1) / (2) (Support) | full / full | 8 / 8 | |
| Compare size, mass and capacity (Support) | partial | 8 | |
| Count money – notes and coins (Support) | full | 8 | |
| Even and odd, fair shares (Support) | partial | 8 | |
| Find the total (Support) | full | 8 | |
| Group equally (Support) | full | 8 | |
| Record results, tally or picture graph (Support) | partial | 8 | |
| Select money (Support) | partial | 8 | |
| Share equally (Support) | partial | 8 | Grouping only, said |

## 8. Fix list

### A. Generator and checks (lane tooling)

1. **N12, read the fractions in the cell payload.**
   - The lane's `denoms` check (and the claim checker) must read `q.cell.payload.terms[].d`, not only the text, picture,
     options and answer.
   - Re-run it on every `denoms` link and re-word each clause and why that names a family.
   - Lead, outside the lane: `p12Acceptor` / `itemDenominators` in `js/modules/generate-question.js` has the same blind spot
     for any item whose fractions live only in the payload (the = / ≠ form of `equiv_frac_visual`). When it is fixed, the
     clauses revert.
2. **M1 (optional).** OPTGATE: compare the written file one to one with the spec snapshot (the Y5 `specopts` shape), so a
   change after the step pass is caught too.
3. **Structure.** On Y2.B1.S11 the lead pre `place_on_number_line {span:10, band:100}` ("Y1.B12.S4 the number line to 100") has
   the same key and opts as the step's own partial, so it adds no rung. Drop it, or deal the K line another way.

### B. Step fixes

| Step | Fix |
|---|---|
| **Y2.B8.S12** | Partial clause: "deals 1/2 = 2/4, 1/4 = 2/8 and 3/4 = 12/16 in the halves family, but the = / ≠ items (about half) also compare thirds, fifths, sevenths, ninths and twentieths (1/5 ≠ 3/7, 3/5 = 12/20), and sixths and twelfths appear; a page of 1/2 = 2/4 only is not available" (or whatever the payload count gives) |
| Y3.B6.S9 | Pre why: drop "denominators: halves, quarters, eighths", or say "mostly the halves family; the = / ≠ items use other families" |
| Y3.B6.S8, Y3.B8.S2 | Pre `equiv_frac_visual {denoms:[2]}`: say what it deals (equivalence pictures, mostly halves-family), not only the cited halves title |
| Y2.B11.S5 (M3) | Related why: "growing number patterns (the rule continued)", or drop it |
| Y2.B11.S2 / S4 (M4) | Related `place_on_number_line`: drop `band:20` (it does nothing), and re-word as "a number line in tens and ones" or drop it |
| Y3.B7.S10 (M5) | Related `money_compare` why: "which set holds more money: the compare idea with units" |

### Expected scores

| Fix | Lifts | Step |
|---|---|---|
| A1 + the Y2.B8.S12 row | 1 seven | Y2.B8.S12 (Y2 steps to 8.00) |

With the Y2.B8.S12 clause true, both step samples reach 8.0 and no graded step or lesson is below 8. Merge, reproducibility
and site coverage already pass.
