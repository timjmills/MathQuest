# Y4 (Grade 3) tagging: independent critic, round 11

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 05eda937. Data: `data/curriculum/links/Y4.json` (747 pre/related links, 591 unique key + opts + why).

Scope:
- every r10 fix and every other r11 change (`diff.out`, r10 → r11: 61 touched steps);
- the 39 automatic re-cites made by `build.py` G18;
- B6.S5 and B6.S7 (verdict, clauses, proposal);
- a fresh full scan of all 747 links, with every new or changed `why` read against its items;
- grades for the touched steps plus a random 15.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r11/`. Two seed sets, both new:

| Seeds | Scripts | What they do |
|---|---|---|
| `7300013 + 173i`, 150 items a link | `samp.mjs` → `s/*.txt` | Every changed or re-cited link, read on the print path: options, payload, visual and hint |
| `913337 + 131i`, 150 items, all 747 links | `own11.mjs` → `own11.out`, `own11.json`; `uniq11.txt` | Every own10 check, plus the r11 reads in §4 |

`recite.mjs` lists the 39 re-cites, `cite.mjs` lists pre links whose cited step is not tagged to the skill, and `diff.mjs` holds the r10 → r11 diff.

None of these seeds was used before:
- tagger: `9100+17i`, `777+53i`, `31337+101i`, `4242+29i`, `61+7i`, `424243+59i`;
- r8: `50021+97i`, `31337+71i`;
- r9: `271828+163i`, `160001+37i`;
- r10: `600011+211i`, `424243+59i`.

## Verdict: FAIL

**The r10 fix list holds up on fresh seeds (§1).**
- Classes D, T′ and C are closed on the print path.
- B2.S10 and B6.S8 are clean.
- The span and money `why` texts are exact.
- The tagger's checks reproduce:
  - `build.py --check` OK (44 full / 64 partial / 21 gap, 39 G18 re-cites);
  - `linkfit` 0 of 747;
  - every step keeps at least 3 pre and at least 1 related, with no key in both.

**New defects.**

| Class | Links / steps | What is wrong |
|---|---|---|
| **C′** (systematic: one mechanism) | 4 pre, 4 steps | The automatic G18 re-cite picks a step the skill is tagged to without reading the link's options, so the cited title names content these options never deal. In all four, the r10 label was right. |
| **P** (one skill misread) | 3 steps | `perimeter_grid {}` is read as grid-only. It deals written side lengths in 61 of 150 items, and its `{forms:[3]}` option already deals whole-number L-shapes. B6.S5's missing clause is wrong as a result. |
| **W** (isolated) | 2 `why` texts | B5.S8's new related link cites "23 × 4", but the items are only facts to 6 × 6. B1.S4 says "in 10s along a line", but the items count in 2s, 5s and 10s, with no line. |

**Scores.**
- Touched 61: mean 8.87. One step at 7 (B6.S5).
- Random 15: mean 8.87. None below 8.

The pass rule is not met: one step is below 8, and there are two systematic classes (C′, P).

## 1. The r10 fixes and the r11 changes on the print path (seeds 7300013 + 173i, 150 items a link)

| Change | Generated | Fit |
|---|---|---|
| D: B6.S6, S8, S9 pre `composite_shapes` → `perimeter_grid {}` | 0 of 150 decimals anywhere (text, labels, hint). Shapes: rectangles counted, L-shapes counted, written rectangles and written L-shapes (6 sides) | Clean. The cited B6.S5 / B6.S7 have it as a partial. The control `composite_shapes {forms:[0]}` still labels 2.5 / 3.5 in 39 of 150 |
| T′: `dot_array_mult {band:25}` (B4.S1, S2) | Rows and columns 2–5 in 150 of 150 | Clean at W01 |
| T′: B4.S2 rel `mult_chart {task:'fill', constant:[6], band:100}` | 450 of 450 blanks on the 6 line; factors at most 10 | Clean. "The 6 row of the chart" is exact |
| C: `identify_lines {}` → "Y3.B11.S6 Parallel and perpendicular (…)" (7 steps) | 150 of 150 parallel / perpendicular / intersecting; 0 horizontal or vertical | Exact, and the gap is named |
| C: B11.S1 `time_sense {}` → "Y3.B10.S5 Use a.m. and p.m. (…)" | 150 of 150 a.m. / p.m. | Exact. `time_calendar` is B11.S1's build |
| C: `clock_parts {}` → "the clock face: the numbers 1-12 in their places" | 150 of 150 "Write the missing numbers on the clock" | Exact |
| C: B5.S14 `mult_word_problems {range:100}` → "equal-groups stories (…)" | Equal-groups stories in 150 of 150 | Exact. `correspondence` is B5.S14's build |
| B6.S8 rel `classify_triangles` → `shape_attributes {}` | Sides and vertices, parallel sides, right angles; 0 acute or obtuse | Clean |
| B5.S8 rel `area_distributive_visual` → `repeated_add_to_mult {}` | Facts n × m with n, m ≤ 6 (150 of 150); no 2-digit addend | The content is a fair related link. **The `why` "23 × 4 as 23 + 23 + 23 + 23" is never dealt (W)** |
| B2.S10, B5.S11, B5.S12 rel `div_check_by_multiplying` dropped | — | Accepted (§2). Related counts left: 1, 2 and 1 |
| B9.S6 pre `decimal_nl_drag {ticks:'some'}`; rel `order_decimals {decimals:1}@10` | Tenths on 0–1 (2,212 of 2,212 numbers have 1 dp); tenths to 9.9 | Clean. The cite (B8.S4, W30) is before W32 |
| `why` spans: B1.S8, B1.S9, B6.S1, B6.S2 "a line between two thousands"; B1.S3 "a 100-wide piece" | `lo`/`hi` are consecutive thousands in 150 of 150, or consecutive hundreds in 150 of 150. On B1.S8 every mark is a multiple of 100 and never an end | Exact |
| B5.S9 rel `mult_word_problems {}` "equal-groups stories: the facts each column … uses" | 141 of 150 are table facts | Exact |
| Money `why` texts (B8.S2, B8.S9, B9.S3) | Notes and coins written with the point | Exact. No dime claims are left |
| Links dropped after own10 (÷10/÷100 before W35, area before W18, `remainder_too_big`, `compare_decimal` 0.75) | — | Each drop removes a flagged link, and the minimums still hold |

## 2. The tagger's three departures from the r10 fix list

1. **"A line between two thousands".** Accepted.
   - It is exact: 150 of 150 lines run from one thousand to the next.
   - r10's wording ("a 1,000-wide piece of the 0-10,000 line") was also true. Either one passes.
2. **`div_check_by_multiplying` dropped instead of capped.** Accepted.
   - At Max Number 100 the skill still deals dividends of 100–116 (r10 minor list).
   - It has no 2-digit-dividend option, so dropping it is the clean choice.
   - B2.S10, B5.S11 and B5.S12 keep 1, 2 and 1 related links.
3. **B5.S8 uses `repeated_add_to_mult`.** The substitution is accepted, but its `why` is not.
   - Area is first taught at W18, and `area_distributive_visual {band:50}` still says "area" at W05, so the reason is real.
   - The new `why` cites a 2-digit example the skill never deals (W).

## 3. The tagger's three own10 "false positives"

All three are confirmed.

| Hit | Fresh items | Ruling |
|---|---|---|
| 11 "prime / composite" | All 11 links match only the phrase "composite shape"; with that phrase excluded, 0 links match | False positive |
| 100 hits for "3-digit ÷ before W36" on B5.S6 pre `place_value_10x {op:'/', power:[10], band:10000}` | 150 of 150 whole-number ÷ 10, all exact, dividends ≤ 9,999 | False positive. This is B5.S5's own direct skill (Divide by 10, W35), and the `why` cites it as taught the same week |
| 1 hit for "divisor ≥ 13" on B6.S2 pre `place_value_10x {op:'/', power:[10,100], band:10000}` (3,400 ÷ 100) | 75 ÷ 10 and 75 ÷ 100, all exact | False positive. ÷ 100 is B5.S6 (W35), before B6.S2 (W36) |

## 4. The 39 automatic re-cites

`build.py --check` reports 39, and `recite.mjs` finds the same 39: 52 pre `why` changes, less 11 hand-written C fixes and the 2 hand-named table gaps.

- **22 re-cite to another step.** All 22 cite a step the skill is tagged to, and every Y4 cite is taught by the step's week (checked against the Grade 3 sheet):
  - B2.S3 W14 for B2.S4 W15;
  - B2.S6 W15 for B2.S7 W16;
  - B12.S6 W27 for B12.S4 W28.
- **17 keep their title and name the gap** ("nearest live practice: … is not tagged to …"). `cite.mjs` now finds no pre that is untagged and silent.

The problem is the title. Of the 22 re-cites, **4 cite a title the link's options never deal (C′)**.

| Step [wk] | Link | New cite | Fresh items (150) | The r10 label |
|---|---|---|---|---|
| B1.S3 [W18] | pre `count_by_step_up {step:[0], range:1000}` | Y2.B1.S16 **Count in 3s** | `step:[0]` is the "2s, 5s and 10s" ladder step (`_SKIP_GROUPS.step`): 52 count in 10s, 46 in 2s, 52 in 5s, **0 in 3s**. The skill's only tag (Y2.B1.S16) is for its 3s step | "Y2.B1.S15 Count in 2s, 5s and 10s": exact |
| B2.S4 [W15] | pre `add_10k_regroup {band:1000}` | Y4.B2.S3 Add two **4-digit** numbers - one exchange | 132 of 150 add two 3-digit numbers and 18 add a 2-digit number; **0 have a 4-digit addend** | "Y3.B2.S14 Add two numbers (across a 100)": exact |
| B2.S7 [W16] | pre `sub_10k_regroup {band:1000}` | Y4.B2.S6 Subtract two **4-digit** numbers - one exchange | 150 of 150 are 3-digit; 0 are 4-digit | "Y3.B2.S16 Subtract two numbers (across a 100)": exact |
| B5.S12 [W06] | pre `unit_form {band:99, rename:'more'}` | Y3.B1.S8 **Hundreds**, tens and ones | "8 tens 18 ones = ___", maximum 98; **0 hundreds** | It cited Y3.B4.S8, which is untagged. The tagged Y2.B1.S5 "Partition numbers to 100" is exact |

**The cause.** `build.py`'s G18 checks that the cited step is tagged to the key, not to the key with these options. So a skill tagged at one ladder step or band gets cited for another. The scan rule G18 is satisfied, but the label is wrong.

**The other 18 re-cites are clean**, apart from the minor range notes below. Verified on fresh items:
- `unit_form {band:999}` → HTO;
- `value {}` → HTO;
- `place_on_number_line {span:100, band:1000}` → Number line to 1,000;
- `perimeter_intro` → What is perimeter;
- `fraction_number_line` → Fractions on a number line;
- `expand {band:99}` → Write numbers to 100 in expanded form;
- `time_fives_ring` → Tell the time to 5 minutes;
- `shape_attributes` → Y4.B12.S6 Polygons;
- `pictograph_intro` → Interpret pictograms (1-1): `scale:1` in 150 of 150.

**Minor (not counted; range, not content):**
- B7.S4 `place_on_number_line {}` cites "The number line to 50", but 89 of 150 lines end above 50 (they run 10–100). Y1.B12.S4 "The number line to 100" is tagged and exact.
- B8.S3 and B8.S9 `place_value_disks {band:99}` cite "Represent numbers to 1,000", but the items are tens and ones only.
- `hundreds_chart_fill` cites "Count from 50 to 100", but the windows cover 1–100.
- B4.S2 `count_by_tables {constant:[3]}` could cite the tagged Y3.B3.S8 "The 3 times-table" instead of naming a gap.

## 5. B6.S5 and B6.S7

| | Finding |
|---|---|
| `composite_shapes {forms:[0]}` partial clause (both steps) | Honest: 39 of 150 T-shapes label 2.5 / 3.5 |
| **`perimeter_grid` partial clause** | B6.S5 says "never a shape with its side lengths written", and B6.S7 says "on a grid only (lengths counted, not calculated)". **Both are false.** `perimeter_grid {}` deals 33 written rectangles ("12 12 6 6") and 28 written L-shapes ("7 2 3 6 10 8") in 150, and **`perimeter_grid {forms:[3]}` deals 150 of 150 L-shapes with written whole-number sides** (6 sides, 0 decimals) |
| B6.S5 verdict and missing clause | `partial` is still right: no option deals T- or U-shapes (8 sides) with whole sides. But "perimeter of rectilinear shapes from written whole-number side lengths" is not missing: L-shapes are dealt. Rule 5 (check that it is not already built) was missed |
| `composite_whole_sides` | It has a rule-13 short spec (name, kind, teaches, closes, representation) on both steps. It still closes a real gap (T- and U-shapes with whole sides), but its scope should be narrowed. On B6.S7, `closes` reads "decimal side lengths before W29", not the step's clause, and `teaches` says "so the missing side is a whole number", although `composite_shapes` never asks for a missing side (that is `missing_lengths`) |
| B6.S7 verdict and missing clause | Honest. The main gap, finding unstated sides first, is right |
| B6.S3 (random sample; same skill) | Marked `full` with `perimeter_grid {}`. But 61 of 150 items are written lengths, not a grid. `{forms:[0,1]}` gives 150 of 150 grid counting (89 rectangles, 61 L-shapes) |

## 6. Full scan (own11, seeds 913337 + 131i, 747 links × 150)

Every own10 check is kept, with "composite shape" excluded from the prime check. The r11 reads added:
- a cited "Count in Ns" against counting by N;
- a cited "4-digit" against 4-digit operands;
- a cited "Hundreds" against hundreds dealt;
- a cited "number line to N" against line ends;
- a 2-digit "a × b" example in a `why` against the factors dealt.

What it finds:
- **All own10 checks:** nothing beyond the three ruled false positives (§3). Clear: customary units, negatives, degrees, percent, GCF, ratio, nets, volume, probability, denominators over 12, unlike-denominator ±, decimal ±, thousandths, quarters as decimals before W33, column layouts before their week, untaught tables in every form, story divisors, 3-digit ÷ before W36, 2-digit × 2-digit area models, area before W18, decimals in visuals before W29, line spans, dime `why` texts.
- **r11 reads:**
  - the 4 C′ links;
  - B5.S8's `why`;
  - B7.S4's line range (minor).
  - Ruled out:
    - `seq_10` "Count in 10s" (B2.S8, B5.S3): it counts with "+10" arrows, so a regex miss;
    - B1.S8 `value {band:9999}` "Hundreds, tens and ones": 4-digit place values, a superset;
    - "facts to 10 × 10" and "10 × 7" `why` texts: table facts.
- **The 49 new unique `why` texts** (`uniq11.txt`, marked NEW) were all read against their items, with the result above.
- **Unchanged links.** No generator changed between 294037a9 and 05eda937 (`git diff --stat`: data, build.py, linkfit and specs only). The 542 unchanged unique `why` texts deal what r10 read, and the fresh scan confirms them.
- **Missed by r10's read.** B1.S4's pre `count_by_step_up {step:[0], range:1000}` says "counting on in 10s along a line to 1,000". Only 52 of 150 items count in 10s (the rest count in 2s and 5s), and no line is drawn.

## 7. Scores (rules 18–19 and step honesty; the r5–r10 rule)

| Score | When |
|---|---|
| 9 | Clean |
| 8 | One related link misfits, a `why` overclaims or cites a title the link never deals, or one false partial clause |
| 7 | A pre link misfits in content, the step's own missing clause is wrong, or two or more misfits |

**Touched steps (61): mean 8.87.**

| Score | Steps |
|---|---|
| 9 (54) | B1.S7, B1.S8, B1.S9, B1.S10, B1.S14, B2.S9, B2.S10, B4.S1, B4.S2, B4.S4, B4.S5, B4.S7, B5.S1, B5.S3, B5.S4, B5.S7, B5.S9, B5.S11, B5.S14, B5.S15, B6.S1, B6.S2, B6.S6, B6.S8, B6.S9, B7.S4, B7.S6, B7.S9, B7.S10, B8.S2, B8.S3, B8.S4, B8.S7, B8.S8, B8.S9, B8.S10, B9.S3, B9.S4, B9.S6, B10.S4, B10.S6, B11.S1, B11.S2, B11.S3, B12.S1–S6, B13.S1, B13.S2, B14.S1, B14.S2 |
| 8 (6) | B1.S3, B2.S4, B2.S7, B5.S12 (C′); B5.S8 (W); B6.S7 (false `perimeter_grid` clause) |
| **7 (1)** | **B6.S5**: false `perimeter_grid` clause, and the step's missing clause names L-shape content that `perimeter_grid {forms:[3]}` already deals (rule 5) |

**Random 15 (Python `random.seed(20261111)`, sampled from the 68 untouched steps): mean 8.87.**

| Score | Steps |
|---|---|
| 9 (13) | B1.S6, B1.S13, B2.S1, B3.S4, B7.S2, B7.S8, B7.S13, B8.S5, B9.S2, B10.S2, B10.S5, B13.S4, B14.S5 |
| 8 (2) | B1.S4 (`why` "in 10s along a line"); B6.S3 (`full` with `perimeter_grid {}`, of which 61 of 150 items are not on a grid) |

The pass rule is not met:
- B6.S5 is at 7;
- C′ is one mechanism producing 4 misfits;
- P is one skill misread on 3 steps.

There are 2 isolated misfits (B5.S8, B1.S4), which is within the limit of 3.

## Fix list (round 12)

**C′. Re-cites that ignore the options.**

| Step | Link | Fix |
|---|---|---|
| B1.S3 | pre `count_by_step_up {step:[0], range:1000}` | "Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18; nearest live practice: count_by_step_up is tagged only for its 3s step)". Lead: tag `count_by_step_up {step:[0]}` to Y2.B1.S15 |
| B2.S4 | pre `add_10k_regroup {band:1000}` | "Y3.B2.S14 Add two numbers (across a 100) (prior learning wk W15; nearest live practice: add_10k_regroup at band 1,000 deals 3-digit sums and is not tagged to it)" |
| B2.S7 | pre `sub_10k_regroup {band:1000}` | "Y3.B2.S16 Subtract two numbers (across a 100) (prior learning wk W16; nearest live practice: sub_10k_regroup at band 1,000 …)" |
| B5.S12 | pre `unit_form {band:99, rename:'more'}` | "Y2.B1.S5 Partition numbers to 100 (lower grade, same idea)". Tagged, and exact: "8 tens 18 ones" |

**`build.py` G18 and `linkfit` G19.**
- A re-cite must keep the cited title true for the link's options. Read the items for:
  - "Count in Ns" against step N;
  - "N-digit" against operand digits;
  - "Hundreds" against 3-digit content;
  - "number line to N" against the line ends.
- If no tagged step's title fits, name the gap, keeping the r10 title.

**P. `perimeter_grid` deals written sides.**

| Step | Fix |
|---|---|
| B6.S5 | Partial `perimeter_grid` → opts `{forms:[1,3]}`. Clause: "L-shapes only (six sides), counted on a grid or with written whole-number sides; no T- or U-shapes". Step missing: "perimeter of rectilinear shapes with more than six sides (T- and U-shapes) from written whole-number side lengths". `composite_whole_sides` stays; narrow its `teaches` to T- and U-shapes |
| B6.S7 | `perimeter_grid` clause: "every side length is given (counted on a grid, or written on rectangles and L-shapes); no side has to be found first". Envision `composite_whole_sides`: `closes` = "the composite shapes must have whole-number sides (no 2.5 / 3.5 before W29)"; drop "so the missing side is a whole number" from `teaches` |
| B6.S3 | Direct `perimeter_grid {}` → `{forms:[0,1]}`. That gives 150 of 150 grid counting, and the verdict stays `full` |

**W. `why` texts.**
- B5.S8 rel `repeated_add_to_mult {}`: "equal groups as repeated addition (3 + 3 + 3 + 3 = 4 × 3): the idea the partitioned method shortens". The items are facts to 6 × 6.
- B1.S4 pre `count_by_step_up {step:[0], range:1000}`: "counting on in 2s, 5s and 10s to 1,000 (Y3.B1.S14 counts in 50s, which no live skill deals: count_50s is this step's build)".

**Optional (minor).**
- B7.S4: cite Y1.B12.S4 "The number line to 100".
- B8.S3 and B8.S9: add "(tens and ones)" to the `place_value_disks {band:99}` label.
- B4.S2: cite Y3.B3.S8 "The 3 times-table".

Then re-run `linkfit` and `build.py --check` on fresh seeds.
