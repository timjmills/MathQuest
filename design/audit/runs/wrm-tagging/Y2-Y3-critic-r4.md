# Critic round 4: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 72aaac16, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-3 re-checks | Round 3 mean |
|---|---|---|---|---|---|---|
| Y2 | 39 | **7.64** | 7.85 | 6.60 | 7.71 (14) | 7.55 |
| Y3 | 38 | **7.53** | 7.70 | 6.40 | 7.69 (13) | 7.60 |

Score distribution:
- **Y2:** 8 ×28 · 7 ×8 · 6 ×3
- **Y3:** 8 ×24 · 7 ×10 · 6 ×4

### What round 4 fixed

Every round-3 S9 fix and step fix is in place, and the round-3 scripts are clean:

| Script | Result |
|---|---|
| `linkscan.mjs` | week mode OK |
| `fit.mjs` | 0 |
| `relfit.mjs week` | Y3 0; Y2 6 links, all on Y2.B1.S1 (allowed) |
| `optcheck.mjs` | 0 |
| `swap.py` | 0 / 0 |
| `sys3.py` | Y3 clean; Y2 has 3 empty related, each with a note |

These are gone from every Y2 and Y3 link:
- eighths at Grade 1
- comparisons of unlike fractions
- `missing_mult_div`, `unit_conversions` and `which_sign`
- `balance_addsub` and coordinate skills

### Why it still fails

1. **Both means are below 8.**
2. **S10, a new systematic defect, breaks rule 18: some links deal content the pupil has not met by that school week.**

Round 4 checked content against a **year-wide** list. Two examples:
- Y2 denominators may be 2, 3 or 4.
- Y2 may deal ×/÷ only in sign and balance links.

It checked school weeks only for number size. But the school does not teach in WRM block order, so a skill from
"the step before in the block" is often taught weeks later. Examples from the xlsx:

| Step | School week |
|---|---|
| Y2 thirds | W31 |
| Y2 fraction block | W16–W18 |
| Y2 quarter past / quarter to | W36 |
| Y2 telling the time to 5 minutes | W37 |
| Y2 "Minutes in an hour" | W23 |
| Y2 position and turns | W19–W20 |
| Y2 ÷5 and ÷10 | W31 |
| Y2 5 and 10 times-tables | W26 |
| Y3 ÷3 and ÷4 | W31 |
| Y3 3 and 4 times-tables | W11 |
| Y3 "Fractions on a number line" | W18 |
| Y3 "Compare capacity" | W18 |
| Y3 L ↔ mL | W34 |

On top of that, some links deal content no Grade 1 or Grade 2 pupil meets at any point in the year:
- right angles and parallel sides at Grade 1
- ×6, ×7 and ×9 at Grade 2
- 0.25 L
- sorting objects by feet, miles and inches

**S10 across the whole files:**
- **Y2:** 45 links on 36 steps (28 pre, 17 related).
- **Y3:** 38 links on 23 steps (15 pre, 23 related).

## Method

**Scratch folder.** All scripts are in `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3-r4/`.

**Round-3 scripts.** I re-ran all of them: `fit.mjs`, `relfit.mjs week`, `sys3.py`, `sys.py`, `swap.py`, `s1.py`, `optcheck.mjs` and `steplink.mjs`. I also ran the tagger's `linkscan.mjs`.

**My own independent scans.** These use seeds 33331 + 97i, distinct from the tagger's and from round 3's. Each generates 10 items of every pre and related link with its opts, using `generateQuestionFor` on the print path.

| Script | What it checks |
|---|---|
| `scan4.mjs` | Content and layout features on every link: denominators, unlike fraction compares, decimals, negatives, ×/÷ facts beyond the grade's tables, +/− size against what the pupil has added or subtracted by that week, column layouts before the column steps (with and without exchange), customary units, coordinates, degrees, area, rounding, clock times, a.m./p.m. |
| `scan5.mjs` / `scan6.mjs` | Week-relative content markers. Each marker (thirds, quarter past, 5-minute times, ÷, ×8, ÷3/4/8, fractions beyond quarters, equivalent fractions, parallel/perpendicular, right/acute/obtuse angles, L↔mL, decimals, 2-digit × 1-digit, 2-digit ÷ 1-digit, rounding, perimeter, mm, tally, pictogram, a.m./p.m., tables beyond the grade) gets the school week in which the pupil first meets it, taken from the xlsx first occurrence of its WRM step. A link is flagged when it deals a marker first met more than 2 school weeks after the step's own week. The 2-week tolerance spares next-step related links. |
| `prewk.mjs` | Pre entries whose `why` cites a step taught in a later school week than the step itself. |
| `direct6.mjs` | Direct and partial Y3 skills that deal ×/÷ facts outside the Y3 tables (2, 3, 4, 5, 8, 10). |
| `sys4.py` | The whole-file S10 count, after I removed false positives by hand. |

The false positives removed:
- money decimals after W19 of Grade 2
- `equiv_coin_sets` matched as "equivalent"
- ×8 inside a ×5 or ×10 table
- 4 + 4 + 4 + 4 = 4 × 4 as a Grade 1 equal-groups item
- `combine` "50 + 1" place-value items
- "round the clock"

**Sample.**
- Random 20 steps per year: `random.Random(70711)` for Y2 and `random.Random(80923)` for Y3, with the hard steps excluded.
- 5 hard steps per year, chosen from the scans.
- Every round-3 step scored under 8 that was not already in the sample: 14 in Y2 and 13 in Y3.

**For each step:**
- I read the title, CCSS and vocabulary, and the xlsx week with its prior-learning list.
- I generated 6 items of every direct and partial skill with its recorded opts (`ctx.mjs`, seeds 80021 + 173i).
- I checked every pre and related link against the scans.
- I graded on the criteria of round 3: (a) direct skills, (b) honest verdict, (c) no missed skill, (d) proposals, (e) pre-skills, (f) related fit (rule 18, by school week), (g) live keys and opts.

## Round-3 fixes verified on the print path

| Round-3 item | Round 4 | Verified |
|---|---|---|
| Y2.B7.S1 Compare mass | partial + `compare_measures` | Yes (picture items only). New problem: its only related link, `mass_volume_liquid {forms:[1]}`, reads kg scales with an answer key of 0, and kg comes in W34 against the step's W22 |
| Y2.B2.S20 Compare number sentences | gap + `compare_sentences` | Yes |
| Y2.B3.S5 Lines of symmetry | partial + `symmetry_vertical` | Yes. The lead pre `compose_from_attributes` is S10 |
| Y2.B3.S12 Patterns with 2-D and 3-D shapes | partial + `pattern_3d` | Yes. The lead pre `compose_from_attributes` is S10 |
| Y2.B10.S7 Pictograms (2, 5, 10) | `pictograph {range:50, scale:[0,1,2]}` | Values ≤ 50 with keys 2, 5 and 10. Totals reach 90, which is fine at Grade 1 |
| Y2.B2.S11 / B9.S5 / B10.S6 pre rungs | bonds to 10; counting in 5s; counting in 2s, 5s and 10s | Yes |
| Y2 fraction links | `partition_shapes {parts:[0,1,2]}` | No eighths. **But thirds now appear on 11 steps taught before thirds (W31)** |
| Y2 `pictograph` → `pictograph_intro`; `which_sign` and `balance_addsub` dropped | | Yes |
| Y2.B2.S10–S14 pre across-10 facts written across | | Yes |
| Y3.B2.S20 Estimate answers | partial + `estimate_1000` | Verdict right. The new lead pre `place_on_number_line {span:100, band:1000}` cites Y3.B1.S11, taught in W13, after the step's W08 |
| Y3.B6.S6 Fractions and scales | pre: number line, ruler, halves/thirds/quarters | Yes |
| Y3.B3.S2 Use arrays | `dot_array_mult {band:25}` | Yes (arrays up to 5 × 4) |
| Y3.B2.S16 | `sub_across_zeros` moved to related | Yes |
| Y3.B7.S3 | count-in-100s rows | Yes. The kg "0" generator bug is on the owner list |
| Y3.B7.S7 | pre: jug number line, 10s, compare; no L ↔ mL | Yes |
| Y3.B11.S2 / S3 / S7 | `reading_ruler` related dropped | Yes |
| Y3 `fractions:compare`, `order_fractions`, `missing_mult_div`, `unit_conversions` | dropped | Yes, across the whole files |
| Y3.B5.S12 | `perimeter {forms:[0,1]}` | Yes |

### The 3 open items the tagger listed

1. **Y2.B1.S1 "Numbers to 20" links to 100: accepted.** The xlsx prior-learning list for W01 itself names "Y1/KG Count from 20 to 50" and "Tens to 100". This is K learning.
2. **Y2.B11.S2–S4, empty related with a note: accepted.** Rule 4 allows "or say why not". But the notes justify themselves by saying the time skills are earlier learning, and that is wrong by school week. Quarter past and quarter to come in W36; these steps are taught in W19–W20. So `time_quarter` must leave their pre (S10).
3. **`add_50_regroup` / `sub_50_regroup` columns on Y3.B2.S4–S10: accepted.**
   - The Grade 2 pupil met 2-digit columns with exchange in Grade 1 (Y2.B2.S15–S18, Grade 1 W06–W07).
   - `steplink.mjs` lists these 13 links only because it uses WRM order.
   - The same reasoning makes the round-3 "column before Y2.B2.S15" rule over-strict for Grade 1. In school order S15–S18 come in W06–W07, before S9–S12 (W07–W11). The swap to across-10 facts is still good practice.

## Whole-file defect counts

| Defect | Y2 | Y3 | Status |
|---|---|---|---|
| S2 `opts.note`; S4 empty related; S5 own build in preBuild; R10 pre = related | 0; 3 (noted); 0; 0 | 0; 0; 0; 0 | Pass |
| S6 / rule 14: related is an earlier step's skill | 0 | 0 | Pass |
| S7 / rule 15: pre < 3 | 0 | 0 | Pass |
| Rule 16 (`closes`), rule 17 (undeclared opts) | 0 | 0 | Pass |
| Round-3 S9 (`fit.mjs`), year-ceiling size (`linkscan`), `relfit week` | 0 | 0 | Pass |
| **S10 / rule 18 by school week: link content not met by the step's week (more than 2 weeks later), or never met in the grade** | **45 links / 36 steps** | **38 links / 23 steps** | **NEW, systematic** |
| Pre whose `why` cites a step taught in a LATER school week (`prewk.mjs`) | 45 links / 31 steps | 28 / 21 | Systemic cause of S10 (see below). Most of these are harmless because the content is prior-grade learning |
| Direct or partial skills dealing ×/÷ 6, 7 or 9 at Grade 2 | 0 | 5 entries / 4 steps | Y3.B4.S8 is a **full** verdict (`area_model_div_2by1 {}` deals 42 ÷ 7, 96 ÷ 6 and 81 ÷ 9; `constant` exists). B4.S4, S5 and S7 are partial, but their missing clauses do not name the tables |
| `count_by_tables` rows that do not match the `why` | 0 | 1 (Y3.B3.S10: "counting in 4s", rows step 3) | Minor |

### S10 by kind (`sys4.py`)

**Y2 (45 links)**

| Kind | Links | Where | Example |
|---|---|---|---|
| Thirds before W31 | 11 | `partition_shapes {parts:[0,1,2]}` or `{}`: B7.S5 rel; B8.S1, S2, S9, S10, S12 pre; B9.S1 pre; B11.S2–S5 pre | "What fraction is shaded? 1/3" on B8.S12 "half = two quarters" (W17) |
| Quarter past/to before W36; times to 5 minutes before W37 | 13 | `time_quarter` related on B8.S5, S6, S10, S12, S13 and B9.S1; `time_5min` related on B9.S1; pre on B9.S6 (`time_5min`, `time_quarter`, plus related `elapsed_hour`), B9.S7 (`time_5min`), B11.S3 and S4 (`time_quarter`) | "12:15" as **pre** for "Describe turns" (W20) |
| Right angles, parallel sides, "90°" (never Grade 1) | 10 | `compose_from_attributes {}` (every form) as pre on B3.S1–S5 and S8–S12 | "Click ALL the shapes with exactly 3 sides AND NO RIGHT ANGLES (skip any triangle with a square 90° corner)" |
| Sorting objects by ft, mi and in | 6 | `estimate_length {}` related on B1.S11 and B6.S1–S5 | form 0 sorts ft/mi/in; forms 1–2 are metric |
| ÷ before W30 | 2 | `div_facts {constant:[10]}` / `{constant:[5]}` as pre on B5.S15 and S17 (W26) | — |
| Other | 3 | kg scale on B7.S1 related (W22; answer 0); `tally_chart` pre and `build_pictograph` related on B10.S2 (W20, taught W24–W25) | — |

**Y3 (38 links)**

| Kind | Links | Where | Example |
|---|---|---|---|
| ×6, ×7, ×9 facts (never Grade 2) | 15 | `mult_word_problems {range:100}` on B3.S8, S9, S12 rel, B4.S10 rel and B4.S11 pre; `multiply {tiles:21}` and `area_model_mult {tiles:21}` on B4.S1–S3 rel and B4.S6 pre; `box_division_easy {regroup:'none'}` on B4.S6 rel and B4.S8 pre | "6 bags of 7 buttons", 23 × 9, 7 × 63, 63 ÷ 7 |
| 2-digit × 1-digit related before W33 | (inside the above) | B4.S1–S3 are W09–W30 | — |
| ÷3 / ÷4 before W31 | 4 | `div_facts` on B3.S6 rel and B3.S8, S9, S11 pre (W11) | — |
| ×8 table and 11 × 5 at W11 | 3 | `nl_mult {constant:[2,3,4,5,8,10], band:100}` related on B3.S8, S9, S11 | "7 × 8" |
| Fraction content at W18 / W26 | 5 | Y3.B6.S7 (W18) pre `identify` / `write_fraction {denoms:[2,3]}` (1/8), `compose_whole` (sixths, cites S4 taught W27), related `equiv_frac_visual` (equivalence W37); B6.S1 pre `equiv_frac_visual` | — |
| Decimal litres | 3 | `capacity {units:[1], forms:[0]}` on B7.S8 rel and B7.S10, S11 pre; B7.S10 is also W18, before L ↔ mL (W34) | 0.5 L = 500 mL, 250 mL = 0.25 L |
| Sorting objects by ft, mi and in on metric steps | 6 | `estimate_length {}` on B5.S1–S5 rel and B11.S4 pre | — |
| Angle and line terms before they are taught | 2 | B11.S4 (W23) pre `identify_angles` (acute/obtuse, W28–W29) and related `identify_lines` (W29) | — |

### The systemic cause and the fix

`build.mjs` builds pre in tiers:
- "step before in the block" / "earlier in the block"
- the "topic ladder"
- hand `core` entries

All of these use WRM block order. The `linkSwap` defaults are year-wide (`PS = partition_shapes {parts:[0,1,2]}`), and so are the hand cross-topic related links (time ↔ fractions ↔ turns). Rule 18 asks for the SCHOOL week, and the xlsx order differs from WRM order in every block.

The fix has four parts:
1. **Order the earlier-step tiers by xlsx week.** A step taught in a later school week is never "the step before". Fall back to the previous grade's step on the same topic.
2. **Make `linkSwap` and `linkOpts` week-aware.**
   - On Y2 steps taught before W31, use `partition_shapes {parts:[0,2]}`.
   - Drop time links that deal quarter past/to before W36, or 5-minute times before W37. Use `time_half_hour` (K learning) where a clock link is wanted.
3. **Add week-relative content markers to `linkscan.mjs`.** Each marker should know the week its step is first taught, as in `scan6.mjs`. Add a "tables beyond the grade" check: Y2 2/5/10 for facts; Y3 2/3/4/5/8/10.
4. **Re-run `scan6.mjs` (with `TOL=2`) and `sys4.py`.** The target is 0 and 0.

## Scores

### Y2 (Grade 1): mean 7.64

| Step (school week) | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20 (seed 70711)** | | | |
| Y2.B7.S1 Compare mass (W22) | partial | 7 | Fixed. The only related link is a kg scale (W34) with answer key 0 |
| Y2.B1.S11 Estimate on a number line (W03) | partial | 8 | Honest. 1 of 3 related links (`estimate_length {}`, ft/mi sort) is S10 |
| Y2.B2.S19 Mixed + and − (W08) | full | 8 | Word problems within 100, add and subtract; good pre |
| Y2.B1.S10 10s and 1s on the line (W03) | partial | 8 | Honest |
| Y2.B5.S7 Grouping (W29) | full | 8 | Counters ≤ 24 in groups; good pre |
| Y2.B8.S4 Find a half (W17) | full | 8 | `halve {band:20}`; related half past (K) fits |
| Y2.B5.S13 10 times-table (W26) | full | 8 | Right |
| Y2.B8.S5 Recognise a quarter (W18) | full | 8 | `partition_shapes {parts:[2]}`. 1 of 2 related links (`time_quarter`, W36) is S10 |
| Y2.B2.S2 Fact families within 20 (W09) | full | 8 | Right |
| Y2.B6.S5 Four operations with lengths (W34) | gap | 7 | Gap and pre right; the only related link is `estimate_length {}` (ft/mi sort) |
| Y2.B7.S3 Measure in kg (W35) | partial | 8 | Honest; scale, counting and compare pre |
| Y2.B11.S2 Describe movement (W19) | gap | 7 | Pre `partition_shapes {}` deals thirds (W31) and is weak for movement; related empty with a note |
| Y2.B1.S9 10s on the line (W03) | partial | 8 | Right |
| Y2.B4.S10 Two-step problems (W34) | gap | 8 | Right |
| Y2.B9.S2 Quarter past and to (W36) | full | 8 | Right |
| Y2.B5.S3 Add equal groups (W28) | full | 8 | Right |
| Y2.B1.S4 Place-value chart (W01) | full | 8 | `band:99`; right |
| Y2.B1.S12 Compare objects (W03) | partial | 8 | Honest |
| Y2.B7.S4 Four operations with mass (W35) | gap | 8 | Right |
| Y2.B8.S8 Find a third (W31) | partial | 8 | Honest; thirds pre fits the week |
| **Hard 5** | | | |
| Y2.B3.S5 Lines of symmetry (W13) | partial | 7 | Verdict fixed. The lead pre `compose_from_attributes` deals right angles and parallel sides |
| Y2.B11.S3 Describe turns (W20) | gap | 6 | 2 of 4 pre are S10: `time_quarter` (W36) and thirds; related empty |
| Y2.B9.S6 Minutes in an hour (W23) | gap | 6 | 3 of 5 pre (`time_5min`, `time_fives_ring` cite S5 at W37, plus `time_quarter`) and the only related link (`elapsed_hour`, 4:15) are later learning |
| Y2.B8.S12 Half = two quarters (W17) | partial | 7 | The lead pre `partition_shapes {parts:[0,1,2]}` deals thirds; related `time_quarter` (W36) |
| Y2.B5.S17 5 and 10 times-tables (W26) | full | 7 | The lead pre `div_facts {constant:[5]}` is taught in W31 |
| **Round-3 re-checks** | | | |
| Y2.B2.S20 Compare number sentences | gap | 8 | Fixed |
| Y2.B3.S12 Patterns with shapes | partial | 7 | Verdict fixed. The lead pre `compose_from_attributes` is above grade |
| Y2.B10.S7 Pictograms (2, 5, 10) | full | 8 | Fixed opts |
| Y2.B2.S11 Subtract from a 10 | gap | 8 | Fixed (`make_ten` first) |
| Y2.B9.S5 Time to 5 minutes | full | 8 | Fixed (counting in 5s) |
| Y2.B10.S6 Draw pictograms | partial | 8 | Fixed (counting in 2s, 5s, 10s) |
| Y2.B8.S3 Recognise a half | full | 8 | Fixed (related half past) |
| Y2.B8.S6 Find a quarter | partial | 8 | Fixed. 1 of 2 related links is `time_quarter` |
| Y2.B8.S9 Find the whole (W18) | gap | 7 | The lead pre (thirds) cites S8, taught in W31 |
| Y2.B8.S15 Count in fractions (W38) | gap | 8 | Fine by week |
| Y2.B2.S14 Add and subtract 10s | partial | 8 | Fixed |
| Y2.B11.S4 Movement and turns (W19) | gap | 6 | The lead pre `time_quarter` (W36) and thirds; related empty |
| Y2.B3.S6 Complete with symmetry | gap | 8 | Coordinate related replaced |
| Y2.B2.S21 Missing number problems | full | 8 | `balance_addsub` gone |

### Y3 (Grade 2): mean 7.53

| Step (school week) | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20 (seed 80923)** | | | |
| Y3.B4.S3 Reasoning about multiplication (W12) | full | 6 | Both related links (`multiply` / `area_model_mult`: 23 × 9, 7 × 63) are S10. Pre `mult_zeros` cites S2 (W30). Direct `mult_properties` also deals 7 × 6 = 3 × 6 + 4 × 6 |
| Y3.B12.S5 Collect and represent (W25) | gap | 8 | Right |
| Y3.B5.S7 Compare lengths (W15) | gap | 8 | Right |
| Y3.B11.S3 Compare angles (W29) | partial | 8 | Honest |
| Y3.B12.S2 Draw pictograms (W23) | partial | 8 | Right |
| Y3.B2.S22 Make decisions (W08) | gap | 8 | Right |
| Y3.B3.S11 4 times-table (W11) | full | 7 | The lead pre `div_facts {constant:[4]}` is taught in W31. Related `nl_mult` deals 7 × 8 |
| Y3.B2.S16 Subtract across 100 (W07) | partial | 8 | Fixed |
| Y3.B4.S8 Divide, flexible partitioning (W32) | full | 7 | Direct `area_model_div_2by1 {}` deals 42 ÷ 7, 96 ÷ 6, 81 ÷ 9: set `constant:[2,3,4,5,8]`. Pre `box_division_easy` deals 63 ÷ 7 |
| Y3.B2.S13 Add across 10 (W06) | partial | 8 | Honest; Grade 1 columns in pre are fine |
| Y3.B9.S4 Subtract money (W19) | partial | 8 | Right |
| Y3.B5.S1 m and cm (W13) | partial | 7 | Honest. The only related link is `estimate_length {}` (ft/mi/in sort on a metric step) |
| Y3.B3.S10 Divide by 4 (W31) | full | 7 | Pre "counting in 4s" has `rows step:3` |
| Y3.B10.S1 Roman numerals (W20) | gap | 8 | Right |
| Y3.B8.S4 Unit fractions of a set (W38) | partial | 8 | Honest |
| Y3.B2.S4 Add and subtract 100s (W04) | partial | 8 | Honest |
| Y3.B2.S12 Subtract, no exchange (W06) | full | 8 | Right |
| Y3.B1.S9 1, 10, 100 more or less (W02) | partial | 8 | Honest |
| Y3.B1.S3 Number line to 100 (W13) | partial | 8 | Honest |
| Y3.B7.S6 Add and subtract mass (W35) | gap | 8 | Right |
| **Hard 5** | | | |
| Y3.B4.S1 Multiples of 10 (W09) | full | 7 | Direct right. 2 of 3 related links are 2-digit × 1-digit with ×7 and ×9 (W33, beyond the tables) |
| Y3.B6.S7 Fractions on a number line (W18) | full | 7 | Direct deals 2/5 and 1/6. Pre `write_fraction` deals 1/8; `compose_whole` cites S4 (W27); related equivalence (W37) |
| Y3.B7.S10 Compare capacity (W18) | gap | 6 | The lead pre `capacity` deals 0.25 L and cites S9 (W34); `mass_volume_liquid` cites S8 (W36) |
| Y3.B3.S8 3 times-table (W11) | full | 6 | The lead pre `div_facts {constant:[3]}` is taught in W31. Both related links are S10: `nl_mult` (7 × 8) and `mult_word_problems` (6 × 7, 7 × 7) |
| Y3.B11.S7 Describe 2-D shapes (W27) | full | 6 | 2 of 3 pre (`identify_lines` with parallel/perpendicular, the lead; `identify_angles` with acute/obtuse) are taught in W29 |
| **Round-3 re-checks** | | | |
| Y3.B3.S2 Use arrays | full | 8 | Fixed (`band:25`) |
| Y3.B11.S2 Right angles | partial | 8 | Fixed |
| Y3.B1.S13 Order to 1,000 | full | 7 | The only related link, `order_clocks_digital_asc`, does not share the idea |
| Y3.B7.S3 kg and g | partial | 8 | Fixed rows |
| Y3.B9.S2 Dollars and cents | partial | 8 | Fixed |
| Y3.B7.S7 Measure in ml | full | 8 | Fixed pre |
| Y3.B11.S5 Horizontal and vertical | gap | 8 | Fixed (no coordinates) |
| Y3.B11.S8 Draw polygons | gap | 8 | Fixed |
| Y3.B7.S9 l and ml equivalence (W34) | partial | 7 | Pre `mass_volume_liquid` cites S8 (W36); related `money_notation` does not share the idea |
| Y3.B2.S20 Estimate answers (W08) | partial | 7 | Verdict fixed. The lead pre is the 0–1,000 line (W13) |
| Y3.B6.S6 Fractions and scales | gap | 8 | Fixed |
| Y3.B7.S4 Equivalent masses | gap | 7 | The only related link is still the K picture skill `heavier_lighter_visual` |
| Y3.B10.S10 Minutes and seconds | gap | 8 | Fixed |

## What a pass needs

1. **S10, whole files.** Apply the systemic fix above: week-ordered pre tiers, week-aware swaps, and markers in `linkscan`. In particular:
   - **Y2:**
     - On Y2 steps taught before W31, set `partition_shapes {parts:[0,2]}`.
     - Drop `time_quarter`, `time_5min` and `elapsed_hour` from steps taught before W36 and W37. That covers B8.S5, S6, S10, S12 and S13; B9.S1, S6 and S7; and B11.S3 and S4.
     - Drop `compose_from_attributes` from Y2.B3 pre.
     - Set `estimate_length {forms:[1,2]}` (metric estimates only), or drop it.
     - Drop `div_facts` from Y2.B5.S15 and S17 pre (taught W31).
     - Drop the kg-scale related link on Y2.B7.S1.
     - Move `tally_chart` and `build_pictograph` off Y2.B10.S2 (W20).
   - **Y3:**
     - Drop `mult_word_problems` from Y3 links (it has no `constant` option, and it deals 6 × 7).
     - Drop `multiply` and `area_model_mult` from Y3.B4.S1–S3 related and S6 pre, or add "multipliers 2/3/4/5/8 only" to `exchange_count` and list it in `preBuild`.
     - Set `box_division_easy {regroup:'none', constant:[2,3,4,5,8]}`.
     - Drop `div_facts` ÷3 / ÷4 from Y3.B3.S6–S11 (W11). Use `count_by_tables` 3s or 4s and repeated addition instead.
     - Set the step's own table on `nl_mult`.
     - Drop `capacity {units:[1], forms:[0]}` from every link (it deals 0.25 L).
     - Re-pick pre for Y3.B6.S7 (W18) from halves, thirds and quarters plus the number line.
     - Drop `equiv_frac_visual` from Y3.B6.S1 and S7.
     - Drop `identify_angles` and `identify_lines` from Y3.B11.S4 and from the head of Y3.B11.S7.
   - **Targets:** `scan6.mjs` (`TOL=2`) and `sys4.py` at 0 / 0.
2. **Step fixes:**
   - **Y3.B4.S8:** direct `area_model_div_2by1 {constant:[2,3,4,5,8]}`.
   - **Y3.B4.S4, S5 and S7:** the missing clauses should name the ×/÷ 6, 7 and 9 items.
   - **Y3.B3.S10:** set the counting-in-4s rows to step 4.
   - **Y3.B7.S9 / B7.S4 / B1.S13:** give each a related link that shares the idea, or a note.
   - **Y3.B4.S3:** add a missing clause or an option for the ×6 and ×7 distributive items.
3. **After those fixes, the expected scores:**
   - About 20 of the 25 steps under 8 lose points only to an S10 link or to a pre taught later in the school year. With the fixes, they reach 8.
   - The remaining 5 are Y3.B4.S8, B3.S10, B7.S4, B7.S9 and B1.S13, which need item 2.
   - With both done, both means would reach 8.0 on these samples.
