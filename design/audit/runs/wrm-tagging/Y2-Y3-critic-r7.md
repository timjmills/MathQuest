# Critic round 7: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 5d0df48a, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-6 steps below 8 | Round 6 mean |
|---|---|---|---|---|---|---|
| Y2 | 33 | **7.88** | 7.90 | 7.80 | 7.88 (8) | 7.73 |
| Y3 | 42 | **7.74** | 7.70 | 7.80 | 7.76 (17) | 7.53 |

Score distribution:
- **Y2:** 8 ×29 · 7 ×4
- **Y3:** 8 ×31 · 7 ×11

Both means rose, and no step is below 7. The run still fails on two counts:
- Both means are below 8.
- Two new systematic classes were found (S12, S13). Two of the claimed fixes are not in the output.

The r6 classes it was asked to close are closed:
- **S10 (content never met in the grade) is closed:**
  - the inch ruler is gone from every pre;
  - skip counts stay within the grade;
  - `div_word_problems` is gone from every link;
  - `mult_frac_whole` is gone.
- **S11 (the why names content the link does not deal) is closed** for units, tables and count steps.

What fails now is new:
1. **S13.** "Next step" related links are ordered by WRM block, not by school week. 28 links say "next step" or "a later step" about a step the pupil was taught weeks earlier.
2. **S12.** The r7 why rewriter swapped informative whys for catalogue labels:
   - it made one why false;
   - it stripped the reason from about 15 more.
3. **Claimed fixes missing from the output:**
   - Y2.B8.S13's related link is still there;
   - Y3.B4.S2's known-fact pre is silently dropped.
4. **A rule-14 cluster.** Main building blocks are missing on the Y3 times-table and measuring steps.

## 1. The tagger's round-7 claims

| Claim | Check | Result |
|---|---|---|
| Fixes A–E are in the generator; the files rebuild | Copied HEAD to scratch, ran `build.mjs Y2` and `build.mjs Y3` | **Both rebuild byte-identical** |
| No skill exempted by name | `markers.mjs` and `linkscan.mjs` read | **True**: the `reading_ruler` exemption is gone; markers read the visual, `screenInstr`, the hint and the payload |
| Every why is checked against 60 items and rewritten if it fails | Diffed every why between r6 (2c00d711) and r7 | True, but the rewrite overshoots: see S12. Y2 changed 32 whys and Y3 changed 37. Label-led whys rose from 9 to 35 (Y2) and from 14 to 36 (Y3), against the report's "not with the skill's catalogue label" |
| `vscan` finds 0 links | r6 `vscan` with fresh seeds | **True.** The only 3 lines are the direct `reading_ruler` partials (Y2.B6.S1, Y3.B5.S2, Y3.B11.S4), and each clause names the inch ruler |
| scan9's remaining hits are `share_into_groups` and 5×8 / 4×8 | `scan9` with the `reading_ruler` exemption removed in my copy | **True.** Links: `share_into_groups {band:12}` "12 counters, groups of 3" on 13 Grade 1 pre (counters, K content, as r6 allowed); `mult_facts {5}`, `{5,10}` and `{4}` dealing 5 × 8, 10 × 8 and 4 × 8, which are facts of the 5, 10 and 4 tables. Every direct hit is a partial whose clause names it |
| stepscan's lines are elapsed-time ticks | Read the payloads | **True.** All 26 lines are `elapsed_*` with `"step":15` / `30` minutes between time-line ticks. No skip count beyond the grade on any link. `skip_count_line {step:[0], band:50}` deals 2s 30, 5s 44 and 10s 6 per 80 |
| whyscan's lines are false positives | Read the items | **True for C** (64 lines): `count_by_tables` rows are 0, N, 2N … in the payload; `time_quarter` deals :15 and :45; `seq_10` / `seq_5` count in 10s or 5s from any number. **A** (1): `add_sub_fact_family` cites Y2.B2.S3, which is tagged to the S2 key (minor). **B**: true as far as it goes, but it only tests "cites a step taught later". The reverse case is the new S13 |
| Y3.B3.S5, B6.S1 now partial; B3.S3/S4 and B12.S1 re-clausing | Data and 80 items | **True.** B3.S5 is partial with `muldiv_tables` (its `skills` now include `div_word_problems`). B6.S1 is partial with `single_fraction` (`unit_only`). B3.S3/S4 name multiples of 6, 7 and 9. B12.S1 is `pictograph {scale:[0,1,2]}` (keys 5 and 10, values ≤ 80) |
| `seq_10` uses band 50 | Items | True and fine. It counts on in 10s from any number up to 48 |
| D: Y3.B4.S2 leads with the known fact and unit form | Output, plus `build.mjs --dropped` | **Not in the output.** The hand `core` entry `mult_facts {constant:[2,3,4,5,8,10]}` cites Y3.B3.S15 (W32). The step is W30, so `citesLater` drops it: `DROPPED Y3.B4.S2 multiplication:mult_facts (taught later)`. Pre is still led by unit form, then `share_into_groups`; the known table fact is absent |
| E: Y2.B8.S13 note (quarter to is W36), related removed | Output | **Not in the output.** `related` is still `time_half_hour` ("half past: a half turn") and `note` is empty. The override sets `related: []`, but the `relR3` hand entry `time_quarter` comes back through `handRelAll`. `markerFix` then turns it into `time_half_hour`, and the `relNote` is suppressed because `related` is not empty |

Re-run checks, all clean:

| Check | Result |
|---|---|
| `linkscan` (week mode) | OK |
| `prewk` | cite-later 0 / 0; key-later 0 / 0 |
| `optcheck` | 0 |
| Pre ≥ 3 | Pass |
| No key in both pre and related | Pass |
| No direct key as a link | Pass |
| Every partial or gap step has a `build` | Pass |
| No step has its own `build` in `preBuild` | Pass |
| Every step with empty related has a note | Pass |
| Rule 13 | Every `build` and `preBuild` proposal (Y2 47, Y3 60) has `name`, `kind`, `teaches`, `representation` and `closes[step]` ≠ `teaches` |
| xlsx re-dumped with openpyxl | Identical to r6: Grade 1 197 rows, Grade 2 219 rows |
| Spot checks against the xlsx | Weeks reproduce, e.g. Grade 1 "Find change" W12, "Compare amounts of money" W08/W09; Grade 2 "Hundreds" W01, "Fractions on a number line" W18/W19 |

## 2. Method

**Seeds.** All are fresh: none appears in `markers.mjs` (33331, 5501, 91193, 64007, 12011) or in any earlier critic round.
- Item seeds: `71129+211i` ×30, `15461+149i` ×30 and `98317+277i` ×20. That is 80 items per link, on the print path through `generateQuestionFor`.
- The scans read the question text, option labels, `cell.payload`, the answer key, the drawn visual, `screenInstr` and the hint.
- The sample uses `random.Random(70771)` (Y2) and `random.Random(70772)` (Y3), drawn over all steps minus my hard 5 and minus r6's below-8 steps.

**Scripts** are in `…/scratchpad/wrm-critic-y2y3-r7/`:
- `gen.mjs`, `scan9.mjs` (exemption removed), `vscan`, `stepscan`, `whyscan`, `range`, `prewk`, `optcheck` and `ctx7`;
- new in r7:
  - `citescan.mjs`: a why citing a step whose own opts differ;
  - `nextscan.mjs`: a "next/later step" why citing a step taught earlier;
  - `labwhy.mjs`: label-led whys;
  - `struct.mjs`: the structural rules;
  - the why diff r6 → r7.

## 3. New systematic defects

### S13: related "next step" links follow WRM order, not school week (28 links, 18 steps)

`build.mjs` adds related links with `b.steps[i+d]` (d = 1…4), which is WRM block order, and labels each one "(next step / a later step of the block: the same idea one step further)". Rule 19 orders everything by school week. These 28 links cite a step the pupil was taught earlier, sometimes much earlier:

| Step (week) | Related key | Cites (week) |
|---|---|---|
| Y2.B4.S8 (W34) | `money_change` | Y2.B4.S9 Find change (**W12**) |
| Y2.B4.S4 (W33), Y2.B4.S5 (W32) | `money_compare` | Y2.B4.S6 (**W8**) |
| Y2.B2.S2 (W9), Y2.B2.S3 (W10) | `add_sub_10s` | Y2.B2.S4 (W5) |
| Y2.B2.S16 (W7) | `sub_100_no_regroup`, `sub_100_regroup` | Y2.B2.S17 / S18 (W6) |
| Y2.B3.S1 (W15) | `count_sides_vertices_2d`, `shape_corners_count` | Y2.B3.S2 / S3 (W13) |
| Y3.B1.S3 (W13) | `base10_build_hundreds`, `place_value_disks` | Y3.B1.S4 / S5 (**W1**) |
| Y3.B1.S10 (W13), Y3.B1.S11 (W13) | `compare` | Y3.B1.S12 (**W2**) |
| Y3.B2.S1 (W9) | `more_less_100` | Y3.B2.S3 (W3) |
| Y3.B4.S6 (W33) | `box_division_easy`, `area_model_div_2by1` | Y3.B4.S7 / S8 (W32) |
| Y3.B6.S2 (W36) | `compose_whole` | Y3.B6.S4 (W27) |
| Y3.B6.S3 (W26), S4 (W27), S5 (W36), S6 (W27) | `fraction_number_line`, `graph_fractions` | Y3.B6.S7 (**W18**) |
| Y3.B11.S6 (W29) | `name_2d_shapes`, `name_3d_shapes`, `count_edges_faces_vertices` | Y3.B11.S7 / S9 (W27–W28) |

The why is false: it calls the step a later one. By rule 14, an earlier step's skill that the step builds on is a pre, never only related. On Y3.B6.S5, for example, fractions on a number line (W18) is a building block for comparing non-unit fractions (W36). `whyscan` B tests only the opposite direction, so r6 did not see this.

### S12: the r7 why rewrite strips the reason, or cites the wrong step

`whyMismatch` cannot see a count in a number-track payload, and it reads an explanatory analogy as a content claim (kg, dollars, "the 4 times-table"). When it fires, `descWhy` writes `label — taughtAt(step)`. `taughtAt` ignores the link's opts. The results:

**False (1):**
- Y2.B5.S12 related `number_seq_fill {step:2, range:20}`.
  - Before: "counting in 2s fills in the even numbers".
  - Now: "Number Sequence: Fill Missing (Grid) — Y1.B12.S1 Count from 50 to 100". The link deals a count in 2s to 20.

**Reason lost.** These whys are true but no longer say why the skill is linked (r6 text in brackets):
- Y3.B5.S5, B7.S4, B7.S9 and B9.S2 `unit_form` → "Unit Form (4 hundreds 7 tens 6 ones) — Y3.B1.S8". [r6 text: "1 kg = 1,000 g is the same exchange as 1 thousand = 10 hundreds"; "345 cents = 3 dollars 45 cents"]
- Y3.B9.S1 and B4.S5 `expand` → "Expanded Form — Y3.B1.S6". [r6 text: "dollars and cents as two parts of one amount"; "24 × 4 = 20 × 4 + 4 × 4"]
- Y3.B3.S14 pre and B4.S3 related `double` → "Doubling — Y2.B5.S11". [r6 text: "the 4 times-table doubled"]
  - On B3.S14 the link is `double {}`, which deals "Double 78". Y2.B5.S11 is doubling within 20.
- Y3.B7.S3 `count_by_tables {100s}` → "Count by 1–12 (counting in 100s from 0) — Y3.B1.S4 Hundreds". [r6 text: "to read a kg scale marked in 100 g"]
- Y3.B1.S14 `more_less_100` → "10 More, 10 Less, 100 More, 100 Less — Y3.B1.S9". [r6 text: "two 50s make 100"]
- Y2.B4.S1 `count_by_tables`, `count_objects`, `seq_5` and `seq_10`. [The coin context — "5-cent and 10-cent coins", "1-cent coins" — is gone]
- "— earlier learning" on related links that are the same school week, not earlier:
  - Y2.B5.S13 and S15 `mult_chart_easy {5,10}` (both W26);
  - Y2.B10.S3 and S4 `pictograph_intro` (W25, the same week as B10.S5).
- 7 whys still begin with the catalogue label "Count by 1–12" (Y2 5, Y3 2). On Y3.B7.S3 it reads "Count by 1–12 (counting in 100s from 0)".

**"Builds on" suffix citing the wrong step (4).** The suffix "(earlier step this builds on: X)" names the step's own `core` step, not the link's:
- Y2.B2.S13 and S14 `count_by_tables {10s}` → "Y2.B1.S16 Count in 3s" (it should be Y2.B1.S15);
- Y3.B3.S4 `count_by_tables {5s, 10s}` → "Y3.B1.S14 Count in 50s";
- Y3.B3.S13 `count_by_tables {8s}` → "Y3.B3.S11 The 4 times-table" (S12 is the 8s).

### Rule-14 cluster: the main building block is absent

| Step | What is missing |
|---|---|
| **Y3.B3.S14** The 8 times-table (W31) | No 4 times-table rung (×8 = double ×4). The lead pre is `double {}` (2-digit doubling). Cause: `mult_facts` and `count_by_tables` are this step's direct keys, so `mult_facts {constant:[4]}` cannot be a pre (the build excludes by key, not key + opts) |
| Y3.B3.S15 (W32) | Same: no 4s |
| Y3.B3.S9 Multiply by 4 | Led by counting in 3s; no 2s / ×2 rung |
| **Y3.B3.S3** Multiples of 2 (W10) | No counting in 2s and no 2 times-table. Pre is filled with addition and subtraction word problems and missing numbers (another domain, rule 3) |
| **Y3.B5.S1, B5.S3** Measure in m/cm, cm/mm (W13–W14) | After the inch ruler was dropped, pre is K-level picture compare/order plus `measure_nonstandard` (S1) or m ↔ cm (S3). The r6 refill `place_on_number_line {span:10, band:100}` ("a ruler is a number line") and counting in 10s (10 mm = 1 cm) went to Y2 only. The xlsx W13 list names "10s on the number line to 100" |
| **Y3.B11.S4** Measure and draw accurately (W23) | The geometry topic ladder refilled pre with naming 2-D and 3-D shapes. No length pre at all |
| **Y3.B5.S10** What is perimeter (W16) | Pre is cm ↔ mm plus picture compare/order. The xlsx-listed building blocks `count_sides_vertices_2d` (Y2.B3.S2) and `add_three` (Y2.B2.S7) are absent |
| **Y3.B4.S2** Related calculations | The known table fact is dropped (claim D above) |
| **Y2.B1.S7** Flexibly partition (W2) | The lead pre is `number_word_form` (number words). The main building block, `expand {band:99}` (Y2.B1.S5 Partition), is ranked 8th |

### Scans that are clean

| Scan | Result |
|---|---|
| Range | `range.mjs` flags only its own digit-joining on ordering answers ("91,73,33"); no link is above its week ceiling. No full verdict deals past its title range |
| Response mode | `compare_groups` uses Same / Not the same boxes. `number_word_form` typed words appear only on and after Y2.B1.S6 (the words step). `equal_or_unequal_groups` asks the pupil to write "multiply" or "add" (both shown) from W27 on, after × (W26), as r6 allowed |
| Notes | Every r7 note checked against items and `skill-options.js` is true. Examples: `skip_count_line` groups are 2/5/10, 3/4/6 and 25, with no lone 3s and no 50s; Y3.B12.S1 keys of 2, 5 and 10 |
| Verdicts | Every never-in-grade direct item is a partial whose clause names it: Y2.B3.S7; Y2.B6.S1; Y3.B3.S5; Y3.B4.S2–S6 and S10; Y3.B5.S2; Y3.B7.S9; Y3.B11.S4. Y3.B8.S5's only hit is a "10 ÷ 6" distractor, named in its note |

## 4. The sample

### Y2 (Grade 1): mean 7.88

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B5.S12 Odd and even (W30) | full | **7** | Its only related link has a false why (S12): it cites "Count from 50 to 100" for a count in 2s to 20 |
| B2.S13 10 more, 10 less (W7) | full | 8 | Minor: `count_by_tables {10s}` says it "builds on Y2.B1.S16 Count in 3s" |
| B8.S11 Non-unit fractions (W38) | partial | 8 | Clause honest; quarter-past related shares the idea |
| B4.S1 Count money, cents (W32) | full | 8 | Minor: the coin reason was stripped from 4 pre whys (S12) |
| B6.S1 Measure in cm (W20) | partial | 8 | Honest ("inches only") |
| **Round-6 steps below 8** | | | |
| B3.S7 Sort 2-D shapes | partial | **8** | Pre leads with sides, corners and 2-D names (fixed) |
| B5.S11 Doubling and halving | full | **8** | 4s/6s count gone |
| B1.S11 Estimate on a number line | partial | **8** | 10s and counting-to-100 rungs added; number words gone |
| B1.S16 Count in 3s | full | **8** | Related empty with a true note |
| B8.S13 Three-quarters (W17) | partial | **7** | Fix E not in the output: related is still `time_half_hour`, note empty |
| B6.S2, B6.S3, B6.S5 | gap/partial/gap | **8 / 8 / 8** | Inch ruler gone; nonstandard measuring, number line, compare |
| **Random 20** | | | |
| B7.S1 Compare mass | partial | 8 | Note true |
| B11.S2 Describe movement | gap | 8 | |
| B8.S6 Find a quarter | partial | 8 | |
| B9.S1 O'clock and half past | full | 8 | |
| B1.S6 Numbers in words | full | 8 | |
| B1.S15 Count in 2s, 5s, 10s | full | 8 | `skip_count_line {step:[0]}` gives 2s, 5s and 10s only |
| B4.S7 Calculate with money | partial | 8 | |
| B6.S4 Order lengths | partial | 8 | |
| B8.S9 Find the whole | gap | 8 | |
| B4.S8 Make a dollar (W34) | partial | **7** | S13: its only related link, `money_change`, is called "next step", but Find change was taught in W12. It is a pre |
| B5.S1 Recognise equal groups | full | 8 | |
| B8.S10 Unit fractions | partial | 8 | |
| B7.S8 Four operations with capacity | gap | 8 | |
| B1.S12 Compare objects | partial | 8 | |
| B2.S12 Subtract across a 10 | partial | 8 | |
| B3.S6 Complete symmetric shapes | gap | 8 | |
| B3.S4 Draw 2-D shapes | gap | 8 | |
| B5.S4 The × symbol | full | 8 | |
| B4.S3 Count dollars and cents | full | 8 | |
| B1.S7 Flexibly partition (W2) | gap | **7** | Rule 14: the lead pre is number words; Partition (`expand`, Y2.B1.S5) is 8th |

### Y3 (Grade 2): mean 7.74

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B7.S4 kg ↔ g (W35) | gap | 8 | The `unit_form` why lost its reason (S12) |
| B12.S1 Interpret pictograms | full | 8 | Keys 5 and 10 |
| B3.S4 Multiples of 5 and 10 | partial | 8 | Minor: the 5s/10s count "builds on Count in 50s". The `money_count {like}` "nickels and dimes" why fits 40 of 80 items (quarters 27, pennies 13) |
| B3.S14 The 8 times-table (W31) | full | **7** | No 4 times-table rung. The lead `double {}` deals 2-digit doubles with a "Y2 doubling" why |
| B1.S14 Count in 50s | full | 8 | Why "(opts constant [5])" is bookkeeping text |
| **Round-6 steps below 8** | | | |
| B3.S5 Sharing and grouping | partial | **8** | Honest partial |
| B4.S6 Link × and ÷ | partial | **8** | Tables lead pre. Minor S13 (related taught 1 week before) |
| B5.S2 Measure in mm | partial | **8** | Clause names the inch ruler |
| B4.S8 2-digit ÷ 1-digit, partitioning | full | **8** | ÷3/4/8 added |
| B6.S7 Fractions on a number line | full | **8** | |
| B8.S6 Fractions of an amount | partial | **8** | Grade 4 link gone |
| B5.S10 What is perimeter (W16) | full | **7** | Inch ruler gone, but pre lacks counting sides and adding three numbers (rule 14) |
| B3.S2 Use arrays | full | **8** | |
| B11.S10 Make 3-D shapes | gap | **8** | |
| B3.S1 Equal groups | full | **8** | |
| B5.S7 Compare lengths | gap | **8** | |
| B6.S1 Unit-fraction denominators | partial | **8** | Now partial |
| B4.S4 2-digit × 1-digit, no exchange | partial | **8** | ×3/4/8 added |
| B4.S2 Related calculations (W30) | partial | **7** | Fix D dropped by `citesLater`: no known-fact pre |
| B5.S1 Measure m and cm (W13) | partial | **7** | Pre is picture compare/order and nonstandard measuring only; no number-line or 10s rung |
| B5.S3 Measure cm and mm (W14) | gap | **7** | Same |
| B5.S5 Equivalent lengths m and cm | partial | **8** | Lead `unit_form` is right; its why lost the reason |
| **Random 20** | | | |
| B8.S5 Non-unit fractions of a set | partial | 8 | |
| B1.S12 Compare to 1,000 | full | 8 | |
| B2.S16 Subtract across 100 | partial | 8 | |
| B2.S22 Make decisions | gap | 8 | |
| B7.S7 Capacity in mL | full | 8 | |
| B11.S6 Parallel and perpendicular (W29) | full | **7** | S13: all 3 related are "next/later step" but were taught W27–W28. They are pre |
| B6.S2 Compare unit fractions (W36) | partial | **7** | S13: its only related, `compose_whole`, is "a later step" but was taught W27. Pre has no number-line rung (W18) |
| B6.S5 Compare non-unit fractions (W36) | partial | **7** | S13: fractions on a number line (W18) are listed as related "a later step"; it is the building block |
| B8.S3 Partition the whole | gap | 8 | |
| B7.S10 Compare capacity | gap | 8 | |
| B2.S6 Add 1s across a 10 | partial | 8 | |
| B7.S1 Use scales | partial | 8 | |
| B11.S4 Measure and draw accurately (W23) | partial | **7** | Pre is 2-D and 3-D naming (geometry ladder); no length pre |
| B9.S1 Dollars and cents | full | 8 | The lead pre `expand` lost its reason |
| B7.S2 Measure in grams | partial | 8 | |
| B3.S3 Multiples of 2 (W10) | partial | **7** | No 2s count or ×2. Pre is padded with ± word problems |
| B2.S11 Add, no exchange | full | 8 | |
| B1.S1 Represent numbers to 100 | full | 8 | |
| B1.S11 Estimate to 1,000 (W13) | partial | **7** | S13: every related link was taught W2–W3 and is called "next step"; pre has only 3 |
| B2.S18 Subtract 2-digit from 3-digit | partial | 8 | |

## 5. Fix list (skill, opts, step)

### A. Generator (`tests/scripts/wrm-tagging/build.mjs`, `overrides.mjs`)

1. **S13: build related links in school-week order.**
   - Take "next step" candidates only from block steps with `SWK[nx] > SWK[s]`.
   - A block step taught earlier goes to pre when it is a building block. Otherwise its why says "taught earlier (W18): …", never "next step".
   - Add `nextscan.mjs` (or its rule) to the build checks. Target: 0.
2. **S12: the why rewrite.**
   - `whyMismatch` must read `cell.payload` values (number tracks, count rows) before calling a count step absent. It must ignore analogy clauses ("the same exchange as …", "… : counting 5-cent coins").
   - `descWhy` must use `whyText` for every key, never the catalogue label. Add `whyText` for `count_by_tables` ("counting in Ns from 0"), `unit_form`, `expand`, `double`, `number_seq_fill`, `count_objects`, `pictograph_intro`, `order_*`, `div_facts`, `mult_facts`, `more_less_100` and `repeated_add_to_mult`. It must also keep the old why's reason after the colon.
   - `taughtAt` must match the link's opts.
   - Restore the r6 whys on the S12 list above.
   - Write "the same week" instead of "earlier learning" when the step's week equals the link's week.
3. **The "builds on" suffix** must name the step that owns the link's key and opts:
   - Y2.B2.S13 and S14 → Y2.B1.S15;
   - Y3.B3.S4 → Y2.B1.S15 and Y2.B5.S17;
   - Y3.B3.S13 → Y3.B3.S12.
4. **`relOnly` with `related: []`** must also clear `extraRelated` and `relR3` entries. Y2.B8.S13 then gets its `relNote`.
5. **A hand `core` pre must never be dropped silently.** Make `DROPPED … (taught later)` on a `core` key a build error.
6. **Pre exclusion by key + opts, not by key.** `mult_facts {constant:[4]}` is a different ladder step from the direct `mult_facts {constant:[8]}` (rule 2: options are values). A pre that equals a direct in key and opts stays excluded.

### B. Step fixes

| Step | Fix |
|---|---|
| Y2.B5.S12 | Related `counting:number_seq_fill {step:2, range:20}`: why "counting in 2s along a number track: the even and odd numbers in order" |
| Y2.B8.S13 | `related: []`; note "no related skill met by W17: three-quarters of a turn (quarter to) comes in W36" (fix A4) |
| Y2.B4.S8 | Move `measurement:money_change {currency:'usd', step:100, paid:'note', band:2000}` to pre: "Y2.B4.S9 Find change (W12): change from a dollar". Related: `measurement:enough_money {currency:'usd'}` "is there enough to make a dollar?" |
| Y2.B4.S4, S5 | Move `money_compare` to pre (Y2.B4.S6, W8) |
| Y2.B2.S2, S3, S16; Y2.B3.S1 | Move the S13 related links to pre (taught W5–W13), or reword them as "taught earlier" |
| Y2.B1.S7 | Pre order: `placevalue:expand {band:99}` (Y2.B1.S5), `placevalue:unit_form {band:99}`, `composing:base10_build`, then the rest; `number_word_form` last or dropped |
| Y3.B3.S14, S15 | Lead pre `multiplication:mult_facts {constant:[4]}`, "Y3.B3.S11 the 4 times-table (W11): double each fact for the 8s" (needs A6). Otherwise `multiplication:nl_mult {constant:[4], band:50}`. `patterns:double {band:50}` with why "doubling a 4s fact gives the 8s fact" |
| Y3.B3.S9 | Lead pre `multiplication:mult_facts {constant:[2]}` (Y2.B5.S9, ×4 = double ×2) and `count_by_tables {rows:[{step:2, start:'zero', dir:'up'}]}`. Counting in 3s goes down |
| Y3.B3.S3 | Lead pre `count_by_tables {rows:[{step:2, start:'zero', dir:'up'}]}` (Y2.B1.S15) and `mult_facts {constant:[2]}` (Y2.B5.S9). Drop `add_wp_100`, `sub_wp_100`, `cloze_addition` and `missing_add_sub` |
| Y3.B4.S2 | Core `multiplication:mult_facts {constant:[2,3,4,5,10]}`, why "Y3.B3.S8 / S11 and Y2.B5: the known fact (3 × 4 = 12)". This cites W11 / Grade 1, so `citesLater` keeps it. Drop `share_into_groups` |
| Y3.B5.S1, S3 | Add `number_sense:place_on_number_line {span:10, band:100}` ("a ruler is a number line marked in equal steps", Y2.B1.S10) and `multiplication:count_by_tables {rows:[{step:10, start:'zero', dir:'up'}]}` ("10 mm make 1 cm; 100 cm make 1 m") ahead of the picture compare/order |
| Y3.B5.S5 | `unit_form` why: "1 m = 100 cm is the same exchange as 1 hundred = 100 ones". Add `count_by_tables {rows:[{step:100, start:'zero', dir:'up'}]}` |
| Y3.B5.S10 | Lead pre `shapes_early:count_sides_vertices_2d {forms:[0]}` (Y2.B3.S2) and `addition:add_three {}` (Y2.B2.S7), then `length_metric {forms:[0]}` |
| Y3.B11.S4 | Replace the geometry-ladder pre with `measurement:length_metric {forms:[0]}` (Y3.B5.S6), `number_sense:place_on_number_line {span:10, band:100}`, `shapes_early:measure_nonstandard {}` and `count_by_tables {2s, 5s, 10s}` |
| Y3.B6.S2, S5 | Move `composing:fraction_number_line {}` and `fractions:graph_fractions {}` to pre ("Y3.B6.S7 fractions on a number line, W18"). On S2, move `compose_whole` to pre or reword it as "taught earlier (W27)" |
| Y3.B6.S3, S4, S6 | Same: fractions on a number line (W18) is pre, not "a later step" |
| Y3.B11.S6 | Move `name_2d_shapes`, `name_3d_shapes` and `count_edges_faces_vertices` (W27–W28) to pre. Related: `shapes_early:compose_from_attributes {}` ("sorting shapes by parallel sides", the same week), or none with a note |
| Y3.B1.S10, S11 | Move `placevalue:compare {band:999}` and `order_*` (W2–W3) to pre. Related: none with a note, or the `nl_20` build |
| Y3.B1.S3, Y3.B2.S1 | Move the S13 related links to pre (taught W1–W3) |
| Y3.B3.S4 | Related `money_count {currency:'usd', kind:'like'}`: why "counting coins of one kind: nickels, dimes and quarters are multiples of 5". Pennies are 13 of 80, so name them too |
| Y3.B1.S14 | Remove "(opts constant [5])" from the `mult_facts` why. Restore "100 is two 50s" on `more_less_100` |
| Y3.B7.S3 | `count_by_tables {100s}` why: "counting in 100s to read a kg scale marked in 100 g" |

### Expected scores

| Fix | Lifts | Steps |
|---|---|---|
| A1 + the S13 moves | 5 sevens | Y2.B4.S8; Y3.B11.S6, B6.S2, B6.S5, B1.S11 |
| A2 / B on whys | 1 seven | Y2.B5.S12 |
| A4 | 1 seven | Y2.B8.S13 |
| A5 / B | 1 seven | Y3.B4.S2 |
| The rule-14 rows | 7 sevens | Y3.B3.S14, B3.S3, B5.S1, B5.S3, B5.S10, B11.S4; Y2.B1.S7 |

With A and B done, both samples reach 8.0 with no step below 8.
