# Critic round 6: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 2c00d711, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-5 failing steps not in the sample | Round 5 mean |
|---|---|---|---|---|---|---|
| Y2 | 30 | **7.73** | 7.80 | 7.80 | 7.40 (5) | 7.70 |
| Y3 | 40 | **7.53** | 7.55 | 7.00 | 7.67 (15) | 7.44 |

Score distribution:
- **Y2:** 8 ×22 · 7 ×8
- **Y3:** 8 ×23 · 7 ×15 · 6 ×2

The run fails on all three counts:
- Both means are below 8.
- Y3 has two steps below 7: B3.S5 and B5.S2.
- S10 is still systematic, through three marker blind spots that round 5 did not reach. S11 comes back with them.

All of round 5's named defects are fixed. What fails now is new findings of the same two classes.

## 1. The tagger's round-6 claims

Every claim reproduces at 2c00d711.

| Claim | Check | Result |
|---|---|---|
| The r5 fixes are in the generator | Copied the tree to scratch and ran `build.mjs Y2` and `build.mjs Y3` | **Both files rebuild byte-identical** |
| `whyfit` is 0; no `[rule` tags left | r5 `whyfit.mjs`; grep of every `why` | 0 / 0; 0 tags |
| `sys5` prints Y3 6 only because the script injects them | Read `sys5.py`; listed every `*fact_family*` link in the data | **True.** `sys5.py` adds six `mult_div_fact_family` lines unconditionally. The data has that key only as the Y3.B4.S6 partial (`add_sub_fact_family` / `fact_family_sort` are addition skills) |
| `scan8`'s remaining hits are the 4/3 distractor and 5 × 3 | r5 `scan8.mjs` re-run | **True.** Y2: 12 `partition_shapes` lines, all the "4/3" choice. Y3: one `mult_facts {constant:[5]}` "5 × 3". Everything else is a direct or partial whose clause names it |
| Y3.B4.S2, S6, S10 are partial, with `zeros_tables`, `muldiv_tables`, `comparison_tables` | Data and proposals | True. All three proposals have `name`, `kind`, `teaches`, `closes[step]` and `representation` |
| `estimate_length` is `{forms:[0]}` everywhere | Every link | True: Y2 5, Y3 5, all `{forms:[0]}` |
| `nl_mult {constant:[3]}` and `[4]` are restored | Y3.B3.S8 / S9 / S11, 80 items | True. Band 50: 3 × 0 … 12 × 3, 4 × 0 … 12 × 4 |

The r3–r5 checks I re-ran on the r6 data:

| Check | Result |
|---|---|
| `linkscan` (week mode) | OK / OK |
| `prewk` | cite-later 0 / 0, key-later 0 / 0 |
| `optcheck` | 0 |
| Pre ≥ 3 on every step | Pass |
| No key in both pre and related | Pass |
| No direct key repeated as a link | Pass |
| Every partial or gap step has a `build`; no `build` id in its own `preBuild` | Pass |
| Rule 13: every `build` proposal has `name`, `kind`, `teaches`, `closes[step]` (≠ teaches) and `representation` | Pass, both years |
| xlsx re-dumped with openpyxl myself (`xl6.py`) | Identical to the r5 dump: Grade 1 197 rows, Grade 2 219 rows |

## 2. The round-5 failing steps, regenerated

**Method.** Seeds `40417+173i` ×30, `27011+89i` ×30 and `8803+263i` ×20. That is 80 items per link, on the print path through `generateQuestionFor`. None of these seeds is in `markers.mjs` or in r5. The scans read:
- the question text;
- the multiple-choice option labels, including `cell.payload.options`;
- the answer key;
- the cell payload;
- the drawn visual and the hint.

### Y2: 9 failing steps, 4 now at 8

| Step | r5 | r6 | Finding |
|---|---|---|---|
| B3.S7 Sort 2-D shapes | 6 | 7 | Clause now names right angles and parallel sides (65 of 80 items). **New:** the lead pre are `symmetry` / `place_symmetry_lines` plus two 3-D naming skills. The building blocks, counting sides and vertices, come last (rule 14) |
| B6.S2 Measure in metres | 7 | 7 | `estimate_length` fixed. **New:** the lead pre `reading_ruler` is an **inch** ruler, and its why says "Measure in centimetres" (S10/S11 class a) |
| B6.S3 Compare lengths | 7 | 7 | Same inch-ruler pre |
| B6.S5 Four operations with lengths | 7 | 7 | Same inch-ruler pre (the lead one) |
| B8.S12 Half = two quarters | 7 | **8** | Clause names sixths, twelfths and 5/3; why fixed |
| B8.S13 Recognise three-quarters | 7 | 7 | Clauses fixed. The only related link, `time_half_hour` ("half past: a half turn"), does not share the idea of three-quarters (rule 4) |
| B9.S6 Minutes in an hour | 7 | **8** | Counting in 5s leads pre; note true |
| B11.S3 / B11.S4 turns | 7 / 7 | **8 / 8** | The why now reads "half past: the minute hand makes a half turn" |

### Y3: 19 failing steps, 12 now at 8

| Step | r5 | r6 | Finding |
|---|---|---|---|
| B4.S1 Multiples of 10 | 7 | **8** | Related is now the 10 row of the chart |
| B4.S7 2-digit ÷ 1-digit, no exchange | 7 | **8** | `div_facts {constant:[3,4,8]}` and `mult_facts {constant:[2,4,8]}` lead pre |
| B3.S8 / B3.S11 3 and 4 tables | 7 / 7 | **8 / 8** | `nl_mult {constant:[3]}` / `[4]`, band 50; `mult_div_fact_family` gone |
| B2.S21 Inverse operations | 7 | **8** | Fact families and missing numbers lead pre; note true |
| B2.S19 Complements to 100 | 7 | **8** | `money_change` dropped |
| B3.S12 / B3.S13 | 7 / 7 | **8 / 8** | Counting rows match their whys (4s doubled; 8s) |
| B6.S4 Understand the whole | 7 | **8** | Vertex counting dropped |
| B7.S4 Equivalent masses | 7 | **8** | Note corrected. Minor: the `length_metric {forms:[1]}` why cites "Y3.B5.S6 … (centimetres and millimetres)"; m ↔ cm is Y3.B5.S5 |
| B4.S10 Scaling | 6 | **8** | Partial, clause names ×6 and ×9; `comparison_tables` |
| B1.S13 Order to 1,000 | 7 | **8** | Clock link gone; note true |
| B4.S6 Link × and ÷ | 6 | 7 | Verdict fixed. **New (rule 14):** pre carries only ×2 / ÷2 (the Y2 W33 prior-learning tier) and ×10. The Grade 2 tables ×/÷ 3, 4 and 8 (B3, W11–W31), the step's real building blocks, are absent |
| B4.S4 2-digit × 1-digit, no exchange | 6 | 7 | `mult_zeros {forms:[0,2]}` and partitioning lead, `div_remainders` gone. Same gap as B4.S6: no ×3/×4/×8 facts, only ×2 |
| B4.S2 Related calculations | 7 | 7 | Partial fixed. **New:** the lead pre `div_word_problems {range:100}` deals 42 ÷ 6, 36 ÷ 6 and 49 ÷ 7 (class c), and is not a building block of related calculations |
| B3.S5 Sharing and grouping | 7 | **6** | **New:** the `full` verdict's own `div_word_problems {}` deals ×6/×7 facts in 10 of 80 items (42 ÷ 6 = 7, 36 ÷ 6, 49 ÷ 7, 42 ÷ 7), unnamed. This is the r5 B4.S6 / B4.S10 class again |
| B5.S1 m and cm | 7 | 7 | `estimate_length` fixed. **New:** lead pre `reading_ruler` (inches), why "Measure in centimetres" |
| B5.S3 cm and mm | 7 | 7 | Same: lead pre inch ruler, why "Y3.B5.S2 Measure in millimetres" |
| B5.S5 m ↔ cm | 7 | 7 | Same inch-ruler pre |

## 3. Fresh whole-file scans: the new systematic defects

All scripts are in `…/scratchpad/wrm-critic-y2y3-r6/`:

| Script | What it does |
|---|---|
| `gen.mjs` | The fresh seeds, the option-label, payload and visual reader |
| `scan9.mjs` | `markers.mjs` markers, plus independent never-in-grade markers. They parse missing-factor sentences, "N groups of M", "times as many", arrays, and word-problem and sharing payloads (`"a":42,"b":6,"op":"/"`, `"n":24,"size":4`) |
| `vscan.mjs` | Customary units in the drawn cell, visual or hint |
| `stepscan.mjs` | Skip-count steps against the grade, and whys that name a count the link does not deal |
| `whyscan.mjs` | The cited step owns the key; the cited step is not later; the why names no unit, table or band the items lack |
| `range.mjs` | Range against the step and week ceiling; typed-word responses |
| `ctx6.mjs` | Per-step grading context |

### S10: content the pupil never meets in the grade, still systematic

Three marker blind spots, plus one single link:

| Class | Why `markers.mjs` misses it | Y2 | Y3 |
|---|---|---|---|
| **a. Inch ruler.** `measurement:reading_ruler` draws an INCH ruler: the cell reads "The arrow points to [ ] inches." in 80 of 80 items; the hint says "inch". `reading_ruler_hard` is quarter inches with mixed-number answers ("5 3/4") | `markers.mjs` and `linkscan.mjs` exempt `reading_ruler` from `customary` by name. The word "inches" is only in the drawn cell, never in `q.text` | **4 pre**: B6.S2, S3, S4, S5 | **18 pre**: B5.S1, S3–S12, B6.S6, B6.S7, B11.S6–S10. **2 related** (`reading_ruler_hard`): B5.S2, B7.S1 |
| **b. Skip counts beyond the grade.** `patterns:skip_count_line {band:50}` deals "Skip count by 6s" 18 / 80, by 4s 13 / 80, by 10s only 3 / 80. `{}` adds 25s | There is no marker for counting steps; `tablesBeyond` reads only × / ÷ pairs | **11**: B1.S15, B1.S16, B2.S13, B2.S14, B5.S17 related; B5.S6, S7, S8, S10, S11, S12 pre | **1**: B1.S14 related (W3: 2s–25s, 6s, no 50s) |
| **c. Division facts in word problems.** `division:div_word_problems` has no × / ÷ sign in the text. In 80 items the payload deals 42 ÷ 6 ×5, 36 ÷ 6 ×3, 49 ÷ 7 and 42 ÷ 7 (×6/×7, never in Grade 2): 10 / 80. It deals ÷3/÷4/÷8 in 19 / 80 | `beyond()` reads `"op":"*"` payloads only, not `"/"`; `div348` needs a ÷ sign | — | **4 related** at W9–W10 (B3.S1–S4: ÷3/÷4 come at W31, ×6/×7 never). **1 pre**: B4.S2 |
| **d. Grade 4 link** | — | — | **1 related**: B8.S6 `mult_frac_whole {denoms:[2]}` ("5/8 × 4 = 2 1/2"; its why says "(Grade 4)") |
| **Total** | | **15 links on 15 steps** | **27 links on 27 steps** |

**S10 on direct and partial skills (verdicts):**

| Step | Verdict | Defect |
|---|---|---|
| Y3.B3.S5 Sharing and grouping (W30) | full | `div_word_problems {}` deals the ×6/×7 facts above, unnamed. It must be partial |
| Y3.B5.S2 Measure in millimetres | partial | The clause "a ruler in millimetres" does not say the skill reads inches |
| Y3.B11.S4 Measure and draw accurately | partial | The clause "drawing a line…; measuring in mm" does not say the skill reads inches |

Y2.B6.S1's clause is honest: "the skill reads inches only".

**What is clean:**
- `share_into_groups` at Grade 1 W17–W27 (grouping counters, K content).
- `arrays_groups` 3 × 4 at Grade 1 (pictured, counted; equal groups of any size, as r4/r5 allowed).
- The `partition_shapes` 4/3 distractor and the `fraction_of_set_nv` "15 ÷ 6" distractor.
- Range: no link above the step's week ceiling. The only `range.mjs` hits are its own digit-joining on ordering answers.
- No customary unit in any visual except the two ruler skills.

### S11: the why describes content the link does not deal, back with the same links

| Why | Links |
|---|---|
| "Y2.B6.S1 Measure in centimetres" / "Y3.B5.S2 Measure in millimetres" / "measuring on a ruler marked in cm and mm" on the inch ruler | Y2 4; Y3 11 (the B5 pre). The B6.S6 / B6.S7 "reading a scale (a ruler)" and the B11 "Measure and draw accurately" whys are not false, but they link the inch ruler (S10) |
| "a ruler in cm and mm with harder readings" on quarter inches | Y3.B5.S2 |
| "counting in 10s as jumps on a number line" (3 / 80 are 10s) | Y2.B2.S13, B2.S14 |
| "the 5s and 10s as jumps" (mostly 2s, 3s, 4s, 6s) | Y2.B5.S17 |
| "counting in 50s as jumps" (no 50s dealt) | Y3.B1.S14 |
| "Y2.B7.S7 Measure in litres" on `mass_volume_liquid {forms:[0]}`, which reads mL cylinders (minor) | Y3.B7.S9, B7.S11 |

`whyfit.mjs` = 0 because its rules were written for r5's examples. The rebuilt whys come from labels and opts, and these whys are hand entries in `overrides.mjs` (lines 33, 36, 93, 152, 355, 569, 593, 596, 742, 812, and the `length` ladder at 551), so the S11 rebuild never touches them.

### Smaller findings (not systematic)

- **Rule 14 cluster (Y3 B4, W32–W33).** On B4.S4, S5, S6 and S8 the Y2 prior-learning tier fills pre with ×2 / ÷2, doubling and arrays. The Grade 2 ×/÷ 3, 4 and 8 tables, taught W11–W31 in this year, are not linked. B4.S7 was fixed by hand only.
- **Y3.B6.S1 "Understand the denominators of unit fractions": `full` is generous.**
  - `write_fraction {}` deals non-unit fractions in 55 of 80 items (3/5, 2/3).
  - `identify {}` asks "What is the numerator of 5/9?" (18 / 80) and non-unit models.
  - Non-unit numerators are the separate step B6.S3. It should be partial.
- **Y2 B8 (W16–W18): `equal_or_unequal_groups {}` as pre on 10 fraction steps.** The answer to type is "multiply" or "add", ten weeks before × is met (W26). Minor, because the idea of equal or unequal groups is K learning.
- **Y2.B1.S11** has no counting-in-10s or number-line rung in pre (both on the xlsx W03 list), and it carries `number_word_form`.

### Scans that are clean

| Scan | Result |
|---|---|
| Notes | All 30 notes checked against the xlsx weeks and the generated items: true |
| School-week order | No pre cites, or keys, a step taught later. Related "next step" links that are far ahead by week (Y2.B4.S6 W8 → money W33) deal content met by then |
| Response mode | Typed-word answers on links are word-bank choices ("multiply / add", "Enough / Not enough", A / B). None is a free word at Grade 1 |
| Proposals | Rule 13 passes |

## 4. The sample

Seeds `random.Random(60601)` (Y2) and `random.Random(60602)` (Y3) over all steps minus my hard 5. Each step's school week comes from the xlsx. I generated 8 shown items plus the 80-item scans for every direct and partial skill and link. Grading uses the r4/r5 criteria; rule 14 rank is applied when the lead pre is not a building block, or when a named building-block step of this year is absent.

### Y2 (Grade 1): mean 7.73

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B3.S7 Sort 2-D shapes (W14) | partial | 7 | Honest clause; pre rank (symmetry and 3-D naming first) |
| B6.S1 Measure in cm (W20) | partial | 8 | Honest ("inches only"); pre nonstandard, compare, number line |
| B8.S12 Half = two quarters (W17) | partial | 8 | Fixed |
| B9.S6 Minutes in an hour (W23) | gap | 8 | Fixed |
| B5.S4 Introduce × (W28) | full | 8 | Right |
| **Random 20** | | | |
| B5.S11 Doubling and halving (W30) | full | 7 | Pre `skip_count_line {band:50}` "Count in 2s" deals 4s and 6s (class b) |
| B1.S11 Estimate on a number line (W3) | partial | 7 | Honest partial; pre has no 10s / number-line rung, and carries number words |
| B1.S13 Compare numbers (W4) | full | 8 | Right |
| B5.S14 Divide by 10 (W31) | full | 8 | Right |
| B1.S5 Partition to 100 (W2) | full | 8 | Right |
| B1.S16 Count in 3s (W5) | full | 7 | Related `skip_count_line` deals 4s and 6s (class b) |
| B4.S8 Make a dollar (W34) | partial | 8 | Honest |
| B4.S6 Compare money (W8) | full | 8 | Right; note true |
| B4.S2 Count notes (W32) | full | 8 | `money_count {usd, note}` |
| B7.S1 Compare mass (W22) | partial | 8 | Note true |
| B7.S4 Four operations with mass (W35) | gap | 8 | Right |
| B5.S9 2 times-table (W29) | full | 8 | Right |
| B2.S18 Subtract across 10 (W6) | full | 8 | Right |
| B2.S7 Add three 1-digit (W10) | full | 8 | Right |
| B5.S5 Multiplication sentences (W28) | full | 8 | Right |
| B4.S7 Calculate with money (W33) | partial | 8 | Honest |
| B8.S7 Recognise a third (W31) | full | 8 | Right |
| B8.S13 Recognise three-quarters (W17) | partial | 7 | Related does not share the idea |
| B10.S2 Tables (W20) | gap | 8 | Right |
| B1.S8 Expanded form (W2) | full | 8 | Right |
| **Round-5 failing, not in the sample** | | | B6.S2 7, B6.S3 7, B6.S5 7 (inch ruler); B11.S3 8, B11.S4 8 |

### Y3 (Grade 2): mean 7.53

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B3.S5 Sharing and grouping (W30) | full | 6 | `div_word_problems {}` deals ×6/×7 unnamed: it should be partial |
| B4.S6 Link × and ÷ (W33) | partial | 7 | Honest; pre lacks the ×/÷ 3, 4, 8 tables |
| B4.S10 Scaling (W33) | partial | 8 | Fixed |
| B5.S2 Measure in mm (W14) | partial | 6 | The clause hides that the skill reads inches; related `reading_ruler_hard` (quarter inches, "5 3/4") has the false why "cm and mm" |
| B7.S9 L ↔ mL (W34) | partial | 8 | Decimals named; note true |
| **Random 20** | | | |
| B4.S8 2-digit ÷ 1-digit, partitioning (W32) | full | 7 | Pre has ÷2/×2 only; no ÷3/4/8 facts (r5 B4.S7 class) |
| B6.S7 Fractions on a number line (W18) | full | 7 | Pre `reading_ruler` (inches) |
| B7.S10 Compare capacity (W18) | gap | 8 | Right |
| B1.S12 Compare to 1,000 (W2) | full | 8 | Right |
| B7.S7 Capacity in mL (W36) | full | 8 | Right |
| B5.S10 What is perimeter (W16) | full | 7 | Lead pre inch ruler, why "Measure in centimetres" |
| B2.S11 Add, no exchange (W6) | full | 8 | Right |
| B7.S6 Add and subtract mass (W35) | gap | 8 | Right |
| B8.S6 Reasoning with fractions of an amount (W38) | partial | 7 | Related `mult_frac_whole` is Grade 4 (5/8 × 4 = 2 1/2) |
| B10.S4 Digital clock (W21) | full | 8 | Right |
| B2.S22 Make decisions (W8) | gap | 8 | Right |
| B2.S19 Complements to 100 (W8) | gap | 8 | Fixed |
| B3.S2 Use arrays (W10) | full | 7 | Related `div_word_problems` (÷3/4 at W10, ×6/×7) |
| B11.S10 Make 3-D shapes (W28) | gap | 7 | Pre inch ruler |
| B12.S2 Draw pictograms (W23) | partial | 8 | Honest |
| B3.S1 Equal groups (W10) | full | 7 | Related `div_word_problems` |
| B9.S3 Add money (W19) | full | 8 | Right |
| B5.S7 Compare lengths (W15) | gap | 7 | Pre inch ruler |
| B10.S12 Solve problems with time (W23) | full | 8 | Right |
| B6.S1 Denominators of unit fractions (W26) | full | 7 | Generous: the items are mostly non-unit fractions and numerator questions |
| **Round-5 failing, not in the sample** | | | B4.S1 8, B4.S7 8, B3.S8 8, B3.S11 8, B2.S21 8, B3.S12 8, B3.S13 8, B6.S4 8, B7.S4 8, B1.S13 8; B4.S4 7, B4.S2 7, B5.S1 7, B5.S3 7, B5.S5 7 |

## 5. Fix list (skill, opts, step)

### A. Close the three marker blind spots, then re-run the whole files

In `tests/scripts/wrm-tagging/markers.mjs` (and `linkscan.mjs`):
1. **Customary:**
   - Remove the `k!=='measurement:reading_ruler'` exemption in `markers.mjs` (2 places) and `linkscan.mjs` (line 72).
   - Test `strip(q.visual)`, `q.screenInstr` and `q.hint` as well as text and answer, so "The arrow points to [ ] inches." is seen.
2. **Payload operations:**
   - In `beyond()` and `div348`, also read `"a":A,"b":B,"op":"/"` (pair B × A/B) and the sharing payload `"n":N,"size":S` (pair S × N/S).
   - Keep the existing Grade 1 allowance for pictured sharing and arrays.
3. **Counting steps:**
   - Add a marker for `Skip count by Ns`, `Count by N`, `+N each step` and `"step":N` (not time payloads).
   - Allowed steps: Y2 {1, 2, 3, 5, 10}; Y3 {1, 2, 3, 4, 5, 8, 10, 50, 100}, with 4 and 8 from their weeks.
4. **Hand-entry whys:** run the S11 why check on hand-entry whys in `overrides.mjs`, not only on swapped links. The why must name what the 80 generated items deal: unit, count step, table.

Target: my `scan9.mjs`, `vscan.mjs` and `stepscan.mjs` at 0 links, with `linkscan` OK and the files still rebuilding byte-identical.

### B. Link fixes

| Defect | Steps | Fix |
|---|---|---|
| Inch ruler pre | Y2.B6.S2, S3, S4, S5; Y3.B5.S1, S3–S12, B6.S6, B6.S7, B11.S6–S10 | Drop `measurement:reading_ruler`. Add `ruler_cm` to `preBuild`. Refill from metric links: `shapes_early:measure_nonstandard`, `number_sense:place_on_number_line {span:10, band:100}` ("a ruler is a number line"), and on Y3 `measurement:length_metric {forms:[0]}` / `{forms:[1]}`. Edit `overrides.mjs` lines 93, 98, 355, 482, 551, 742, 872 |
| `reading_ruler_hard` related | Y3.B5.S2, B7.S1 | Drop (`overrides.mjs` 593, 596). For B7.S1 keep `temperature`; for B5.S2 use `estimate_length {forms:[0]}` alone |
| `skip_count_line` 4s/6s, Grade 1 | Y2.B5.S6, S7, S8, S10, S11, S12 pre ("Count in 2s") | Drop; `patterns:seq_2 {band:50}` is already the 2s rung |
| `skip_count_line` related, Grade 1 | Y2.B1.S15, B5.S17 | `{step:[0], band:50}` (2s, 5s, 10s only) |
| `skip_count_line` related, Grade 1, counting in 10s | Y2.B2.S13, B2.S14 | Replace with `multiplication:count_by_tables {rows:[{step:10, start:'zero', dir:'up'}]}` or `patterns:seq_10 {band:100}` (why "counting in 10s"). The SCL constant at `overrides.mjs` 812 |
| `skip_count_line` related, Grade 1, counting in 3s | Y2.B1.S16 | Drop it, plus a note. Or propose an option `skip_line_step` (one chosen step) on `patterns:skip_count_line` and put it in `build` |
| `skip_count_line {}` related, Grade 2 | Y3.B1.S14 | Drop and note, or `skip_line_step` (50s) |
| `div_word_problems {range:100}` related | Y3.B3.S1–S4 | Drop. `share_into_groups {}` (a Grade 1 direct) can stay |
| `div_word_problems {range:100}` pre | Y3.B4.S2 | Drop; lead with `mult_facts {constant:[2,3,4,5,8,10]}` and `placevalue:unit_form` |
| `mult_frac_whole {denoms:[2]}` related | Y3.B8.S6 | Drop (Grade 4). `fraction_of_set_hard_nv` remains |
| `equal_or_unequal_groups {}` pre, W16–W18 | Y2.B8.S1–S5, S7, S8, S12, S13 | Minor. Replace with `comparing:compare_groups {}`, or propose a response option "equal / not equal" in place of "multiply / add" |

### C. Verdicts and clauses

| Step | Fix |
|---|---|
| **Y3.B3.S5** | **Partial.** Clause: "`div_word_problems` deals ×6/×7 facts beyond the Grade 2 tables (42 ÷ 6, 36 ÷ 6, 49 ÷ 7)". Build: a `constant` option on `div_word_problems`. Reuse `muldiv_tables` by adding the skill to its `skills`, or write `divwp_tables` |
| **Y3.B5.S2** | Clause: "reads an inch ruler (whole inches); no mm or cm ruler". Keep `ruler_cm` |
| **Y3.B11.S4** | Clause: "reads an inch ruler; drawing a line of a given length and measuring in mm are not dealt" |
| **Y3.B6.S1** | **Partial.** `fractions:identify {}` and `write_fraction {}` deal mostly non-unit fractions and numerator questions. Build: reuse `single_fraction` (a unit-fraction page: 1/2, 1/3, 1/4, 1/5) or a `unit_only` option on `write_fraction` / `identify` |

### D. Pre rank (rule 14)

| Step | Fix |
|---|---|
| Y3.B4.S4, B4.S5 | Add `multiplication:mult_facts {constant:[3,4,8]}` (Y3.B3.S8 / S11 / S12) right after `mult_zeros {forms:[0]}`; drop `div_facts {constant:[2]}` and `halve` |
| Y3.B4.S6 | Lead with `mult_facts {constant:[2,3,4,5,8,10]}` and `div_facts {constant:[2,3,4,5,8,10]}` (Y3.B3.S15 / S13), then `share_into_groups`; drop `double` / `halve` |
| Y3.B4.S8 | Add `div_facts {constant:[3,4,8]}` after `box_division_easy` |
| Y2.B3.S7 | Lead with `count_sides_vertices_2d {forms:[0]}`, `shape_corners_count`, `name_2d_shapes`; drop `name_3d_shapes` and `shape_name_match_3d` |
| Y2.B1.S11 | Add `patterns:seq_10 {band:100}` and `counting:number_seq_fill {range:100}`; drop `number_word_form` |

### E. Small why and note fixes

| Step | Fix |
|---|---|
| Y2.B8.S13 | Replace the related `time_half_hour` with a note: "three-quarters of a turn (quarter to) is W36" |
| Y3.B7.S4 | The `length_metric {forms:[1]}` why cites Y3.B5.S5 (m and cm), not B5.S6 |
| Y3.B7.S9, B7.S11 | `mass_volume_liquid {forms:[0]}` why: "reading a scale in mL" (it does not read litres) |

### Expected scores

Of the 25 graded steps under 8:
- The inch-ruler, skip-count, word-problem and Grade 4 link fixes (A + B) lift these 15:
  - Y2.B6.S2, B6.S3, B6.S5, B5.S11, B1.S16
  - Y3.B5.S1, B5.S3, B5.S5, B5.S7, B5.S10, B6.S7, B11.S10, B3.S1, B3.S2, B8.S6
- The verdict fixes (C) lift Y3.B3.S5, B5.S2 and B6.S1.
- The rank fixes (D) lift Y3.B4.S4, B4.S6, B4.S8, Y2.B3.S7 and B1.S11.
- The related fix (E) lifts Y2.B8.S13.
- Y3.B4.S2 needs both B (drop its lead pre) and D.

With A–E done, both samples reach a mean of 8.0, with no step below 8.
