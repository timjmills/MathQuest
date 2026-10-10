# Y4 (Grade 3) tagging — independent critic, round 10

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 294037a9. Data: `data/curriculum/links/Y4.json` (760 pre/related links, 300 unique skill + opts).
Scope:
- the round-10 link changes (`diff.out`: the r9 → r10 diff, 37 touched steps);
- rules 18–19 on every link;
- every unique `why` read against its items;
- the blind spots of `linkfit.mjs` after G13–G15.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r10/`. Two seed sets, both new:

| Seeds | Scripts | What they do |
|---|---|---|
| `600011 + 211i`, 150 items a link | `samp.mjs`, `chart.mjs`, `vis.mjs`, `facts.mjs`, `tables.mjs` | Every changed link, read on the print path (options, payload, visual, hint) |
| `424243 + 59i`, 150 items, all 760 links | `own10.mjs` → `own10.out`, `own10.json`; `uniq.txt` | Every r9 check, plus the new reads listed in §3 |

`uniq.txt` holds every unique link with all its `why` texts and its item types; it was read in full. `cite.mjs` lists every pre whose cited step is not a step the skill is tagged to.

None of these seeds was used before:
- tagger: `9100+17i`, `777+53i`, `31337+101i`, `4242+29i`, `61+7i`;
- r8: `50021+97i`, `31337+71i`;
- r9: `271828+163i`, `160001+37i`.

## Verdict: FAIL

**The round-10 work holds up on fresh seeds.**
- The whole r9 fix table is applied, and every r9 fix is clean (§1).
- The extra cited-title relabels are clean. That includes "the times-table facts to 10 × 10" on `mult_facts {band:100}`: 150 items, factors 0–10 only.
- The tagger's checks reproduce:
  - `build.py --check` OK (45 full / 63 partial / 21 gap);
  - `linkfit` 0 of 760;
  - `own9`'s checks give only the 11 "composite shape" false positives.
- Every step keeps at least 3 pre and at least 1 related, with no key in both.

**Fresh reads find defects that linkfit and every earlier critic missed** (§2):

| Class | Links | What is wrong |
|---|---|---|
| **D** | 3 pre | `composite_shapes {forms:[0]}` labels sides 2.5 and 3.5 in a quarter of its items, at W20–W21. Decimals start at W29 |
| **T′** | 2 pre, 1 related | Untaught 7s and 9s at W01: arrays "9 rows × 7 columns" and a story "7 boxes … 7 books each" |
| **C** | 11 whys on 10 steps | The cited prior step names a topic the skill never deals ("Horizontal and vertical" on a parallel / perpendicular skill) |

**Isolated misfits** (3):
- B2.S10: 3-digit ÷ 1-digit at W16, from a Grade 4 skill;
- B5.S8: 2-digit × 2-digit area models;
- B6.S8: triangles classified by angle at W21.

**Two other `why` texts overclaim:** B1.S8, where r9's own proposed wording was wrong, and B5.S9.

**Scores.**
- Touched steps: mean 8.89, one step at 7 (B6.S8).
- Random 15: mean 8.60, two steps at 7 (B4.S1, B6.S9).

The pass rule is not met: three systematic classes, and three steps below 8.

## 1. The r9 fixes and the r10 changes on the print path (seeds 600011 + 211i, 150 items a link)

| Change | Generated | Fit (content, week, size, layout, `why`) |
|---|---|---|
| B4.S4, B4.S7 pre `number_families_mult {}` (cites Y3.B4.S6) | Factors 2–5 and 10, products 25 or less | Clean. Every fact is taught by W02, and "Link multiplication and division" is what it deals |
| B4.S5 related `mult_div_fact_family` dropped | — | B4.S5 keeps 3 related links |
| B4.S5 pre `count_by_tables {constant:[5,10]}` | Count by 5 in 75, by 10 in 75, up to 120 | Clean. The cited "Multiples of 5 and 10" is exact |
| B4.S4 / B4.S5 rel `mult_chart {task:'fill', constant:[9], band:100}` | 450 of 450 blanks on the 9 line; windows within 1–10 | Clean. "The 9 row of the chart" is exact |
| B4.S6 rel `mult_chart {task:'fill', constant:[3,6,9], band:100}` | 450 of 450 blanks on a 3, 6 or 9 line | Clean. Its partial is `mult_chart {task:'pattern'}`: a different ladder step, so not a repeat |
| B4.S4 / B4.S7 rel `nl_mult {constant:[9]}` / `{constant:[7]}` | `"step"` is 9 (or 7) in 150 of 150; hops up to 11 or 12 (99, 84) | Clean, by the agreed rule that one factor is taught. "Hops of N" is exact |
| B4.S9 / B4.S10 rel `mult_chart {task:'fill', constant:[11]/[12], band:144}` | 450 of 450 blanks on the 11 (or 12) line | Clean at W03 |
| `div_word_problems {range:100}` (B4.S3, S5, S8, S9, S10, B5.S11) | Divisors 2–8 (largest dividend 64); every divide is a fact | Clean at W02–W06 |
| `mult_word_problems {range:100}` (B4.S4, S7, B5.S14 and others) | Factors 2–8, products 64 or less | Clean at W02 and later. **At W01 (B4.S2) it is not clean: 3 of 150 are 7 × 7 (§2 T′)** |
| `remainder_interpret {range:100}` (B5.S13) | Divisors 3–12, dividends up to 118, all with remainders | Clean at W36 |
| B9.S7 rel `round_sort_10 {}` | 2-digit numbers sorted into the tens 10–100 | Clean. The `why` is exact |
| B9.S8 pre `partition_shapes {parts:[0,2], forms:[0]}` | Count-parts answers: 2 (halves) in 73, 4 in 77 | Clean. "Recognise a half" is dealt in half the items |
| `partition_shapes {parts:[0]}` (B3.S2, B7.S1, B8.S1, B12.S7) | Halves only: "1/2" 75, "2 parts" 75 | Clean |
| `mult_facts {band:100}` (6 steps), "facts to 10 × 10" | Factors 0–10 only, every one dealt | Clean, and the `why` is exact. All the citing steps are W04 or later |
| `div_facts {band:100}` (B5.S11, B6.S8, B7.S8), "to 100 ÷ 10" | Divisors 2–10 | Clean |
| `mult_facts {constant:[2,5,10]}` / `{constant:[3,6,9]}` "anchors for the 7s" (B4.S7, B4.S8) | A named table is a factor in 150 of 150; partners up to 12 | Clean |
| `write_fraction {denoms:[5]}` "tenths and fifths" (10 steps) | /5 in 79, /10 in 71 | Clean, and exact |
| `mult_zeros {forms:[0]}` (B8.S6; B5.S3's duplicate of its own direct dropped) | n × 10, n = 2–9 | Clean. B5.S3 keeps 3 pre |
| B7.S10 pre `mult_chart {band:100}` | Mixed blanks, factors 1–10 | Clean |
| `money_notation {currency:'usd'}` (6 related) | $ amounts $0.75–$8.90; quarters in 217 coins, a dime in 30 of 150 items (37 on the scan seeds) | The content is a forward related link (r9 accepted it). The whys "dimes as tenths of a dollar" (B8.S2) and "$3.45 = 3 dollars 4 dimes 5 cents" (B9.S3) still name dimes that a quarter of the items show. Minor, as in r9, not counted |
| B1.S8 rel `place_on_number_line {span:1000, band:10000}`, "4-digit numbers placed on a 0-10,000 line (where 1,000 more lands)" | Every line is 1,000 wide, e.g. 3,000–4,000 ticked in hundreds: `lo`/`hi` in the payload, and `genPlaceOnLine` draws `[lo, lo + span]`. The mark is never an end | **Overclaim.** "1,000 more" always lands off the line. This was r9's own proposed wording; r9 never read `lo`/`hi`. See §2 W |
| B4.S12 rel `whole_as_fraction` dropped | — | B4.S12 keeps 1 related (`div_equation_parts`) |

## 2. Misfits that `linkfit` cannot see

### D. Half-unit side lengths at W20–W21 (3 pre links)

`area_perimeter:composite_shapes {forms:[0]}`, fresh seeds:
- 37 of 150 items label the T-shape's shelves 2.5 or 3.5 ("7, 2, 2.5, 3, 2, 3, 2.5, 2 → 24").
- The cause is in `gen-geometry.js`: `sideShlfRt = (tTW − tSW) / 2` is a half whenever the two widths differ by an odd number.
- The labels are in the SVG the legacy print cell draws.
- Decimals are first taught at W29.
- `{band:25}` still gives 2 of 150 and `{band:40}` 34 of 150, so no option makes the skill clean.

| Step [wk] | Link |
|---|---|
| B6.S6 [W20] | pre `composite_shapes {forms:[0]}` (cites Y4.B6.S5) |
| B6.S8 [W21] | pre `composite_shapes {forms:[0]}` (cites Y4.B6.S7) |
| B6.S9 [W21] | pre `composite_shapes {forms:[0]}` (cites Y4.B6.S7) |

**Why linkfit passed these:**
- its decimal guard reads the text, the answer and the options, never a drawing's labels;
- a pre that cites a same-week Y4 step inherits that step's content.

**Step-level (for the lead, not counted against the links).**
- B6.S5's `full` verdict rests on this skill as a direct, and B6.S7 has it as a partial. A quarter of their items have half units.
- Fix the generator so that `tTW − tSW` is even.

### T′. Untaught tables at W01, in forms G13 does not read (2 pre links, 1 related)

The tagger's `tablesBy` puts the 7s and 9s in W02.

| Step [wk] | Link | Fresh items |
|---|---|---|
| B4.S1 [W01] | **pre** `dot_array_mult {}` | 12 of 150 are arrays with both sides 7 or 9: "Count the array: 7 rows × 9 columns", "9 rows × 9 columns". Confirmed with 7 of 150 on the own10 seeds |
| B4.S2 [W01] | **pre** `dot_array_mult {}` | The same items |
| B4.S2 [W01] | rel `mult_word_problems {range:100}` | 3 of 150 are 7 × 7: "Zara has 7 boxes. Each box has 7 books." Confirmed with 2 of 150 on the own10 seeds |

**Why linkfit passed these.** G13 reads `a × b`, "Fact Family", "count by", hops and grid blanks. It does not read:
- "n rows × m columns";
- the word-work `"a"`/`"b"` steps of a story.

### C. Cited prior steps the linked skill never deals (11 `why` texts on 10 steps)

This is the r9 B9.S8 case (it cited "Recognise a half" and dealt no half), now on non-number topics. In each row below, the cited step is not a step the skill is tagged to (`cite.mjs`), and generating confirms that the topic is absent.

| Link | Cited step | What it deals (150 items) | Steps |
|---|---|---|---|
| pre `angles_lines:identify_lines {}` | Y3.B11.S5 Horizontal and vertical | Parallel, perpendicular and intersecting only; 0 of 150 say horizontal or vertical | B12.S1, B12.S2, B12.S3, B12.S5, B12.S6, B14.S1, B14.S2 |
| pre `measurement:time_sense {}` | Y3.B10.S6 Years, months and days | a.m. / p.m. only (the skill is tagged to Y3.B10.S5); 0 of 150 name a year, month, week or day | B11.S1 |
| pre `measurement:clock_parts {}` | Y1.B14.S6 Tell the time to the half hour | "Write the missing numbers on the clock"; no time is read | B11.S3, B12.S1 |
| pre `multiplication:mult_word_problems {range:100}` | Y3.B4.S11 How many ways | Equal-groups stories; no "how many ways" or combination item | B5.S14 |

The cited steps (Y3.B10.S6, Y3.B11.S5, Y3.B4.S11) have no live skill. The nearest skill is a fair pre, but the label must say what it deals.

### Isolated misfits (3 related links)

| Step [wk] | Link | Fresh items | Why it misfits |
|---|---|---|---|
| B2.S10 [W16] Checking strategies | rel `division:div_check_by_multiplying {}` ("the same inverse check for division") | 134 of 150 are a 3-digit number ÷ 1 digit, checked by 2-digit × 1-digit: "356 ÷ 4 = 89", "648 ÷ 8 = 81". When the answer shown is wrong, the pupil must redo the division | 3-digit ÷ 1-digit is W36 (B5.S13), and the skill is graded 4 in `data.js` (4.NBT.B.6). B5.S11 and S12 already use this skill with Max Number 100, which is clean |
| B5.S8 [W05] Informal written methods for multiplication | rel `area_perimeter:area_distributive_visual {}` ("the distributive area picture") | 80 of 150 are 2-digit × 2-digit: width 18 × (12 + 8) = 360, 18 × (11 + 6) = 306 | 4.NBT.B.5, which is never Grade 3 content. linkfit's 2-digit × 2-digit guard reads only `a × b` text, never an area model's labels. `{band:50}` gives a width of 8 or less and parts of 2–4 (150 of 150 clean) |
| B6.S8 [W21] Perimeter of regular polygons | rel `shapes_classify:classify_triangles {}` ("equilateral triangles are regular") | 67 to 78 of 150 classify triangles as acute, right or obtuse | Angle classes are first taught at W27 (B12.S2), and classifying triangles by angle is 4.G.A.2. The angle guard covers only pre links. This is the only related link before W27 that deals angle types. The skill has no sides-only option |

### W. Other `why` overclaims (2)

| Step | Link | `why` | Items |
|---|---|---|---|
| B1.S8 | rel `place_on_number_line {span:1000, band:10000}` | "4-digit numbers placed on a 0-10,000 line (where 1,000 more lands)" | A 1,000-wide line ticked in hundreds; 1,000 more is never on it (§1) |
| B5.S9 | rel `mult_word_problems {}` | "stories with 2-digit × 1-digit" | Only 9 of 150 have a factor of 13 or more; 119 are table facts. No option deals 2-digit stories (`{range:…}` does not change it) |

### Minor (not counted, as in r9)

- **"0-10,000 line" wording.** The same span wording is on B1.S9 (`round_nl_thousands`), B6.S1 and B6.S2 (`place_on_number_line {span:1000}`), and "0-1,000 line" on B1.S3. The lines are 1,000 (or 100) wide pieces of that range. "A 1,000-wide piece of the 0-10,000 line" would be exact.
- **Money whys.** The dime whys on `money_notation {currency:'usd'}` (§1).
- **Dividends just over 100.** `div_check_by_multiplying {}@100` (B5.S11, S12) and `remainder_too_big {}` (B5.S12) reach dividends of 100–116 in 3 to 10 of 150 items (100 ÷ 2, 108 ÷ 9).
- **Area before W18.** B5.S1's related `area_unit_squares` uses the word "area" at W05. The area model of multiplication is already the step's own partial (`area_model_mult`), so it is accepted as a forward link.
- **Related repeats a direct key with other options.** B4.S1, B4.S6, B5.S2, B5.S3, B5.S4, B5.S12 and B13.S1 each have a related link that uses a direct or partial key with different options, so it is a different ladder step.

## 3. Other scans: clean

`own10` reads all 760 links on 150 fresh items each. It keeps every r9 check and adds:
- tables read in every form: "Fact Family", count by, multiples, hops, `"step"`, `"tab"`;
- story divisors of 13 or more, and factors of 13–19 before W17;
- 3-digit ÷ 1-digit before W36, and 2-digit ÷ 1-digit with a quotient above 12 before W06;
- 2-digit × 1-digit before W05, and 3-digit × 1-digit before W36;
- area-model dimensions;
- "area" before W18;
- decimals in a visual or payload before W29;
- line spans named in a `why`.

Beyond §2, it finds nothing. The remaining hits are known false positives:
- the 11 "composite shape" hits;
- ÷ 10 and ÷ 100 by `place_value_10x`;
- `compare_decimal {decimals:2}` showing 0.75 as a hundredths number at W31–W32.

Every pre cites a step taught in or before its own week. All other r9 classes are clear:
- customary units, negatives, degrees, percent, GCF / ratio;
- nets, volume, probability;
- denominators above 12;
- unlike-denominator ±, decimal ±, thousandths;
- quarters as decimals before W33;
- column layouts before their week;
- 11s and 12s before W03.

## 4. Scores (rules 18–19, links; the r5–r9 scoring rule)

| Score | When |
|---|---|
| 9 | Clean |
| 8 | One related link misfits, or a `why` overclaims |
| 7 | A pre link misfits, or the step has two or more misfit links |
| 6 | Four or more of its links misfit |

**Touched steps (37): mean 8.89.**

| Score | Steps |
|---|---|
| 9 (34) | B3.S2, B4.S4–S10, B4.S12, B4.S13, B5.S1, B5.S3, B5.S11, B5.S13, B7.S1, B7.S7, B7.S8, B7.S10, B8.S1, B8.S2, B8.S6–S10, B9.S2–S8, B10.S1, B12.S7 |
| 8 (2) | B1.S8 (span `why`); B5.S14 (cites "How many ways") |
| **7 (1)** | **B6.S8**: pre `composite_shapes` (D), plus related `classify_triangles` |

**Random 15 (Python `random.seed(20261012)`, sampled from the 92 untouched steps): mean 8.60.**

| Score | Steps |
|---|---|
| 9 (11) | B1.S1, B1.S2, B1.S6, B1.S7, B1.S10, B1.S11, B2.S6, B3.S4, B7.S3, B10.S3, B13.S3 |
| 8 (2) | B11.S1 (cites "Years, months and days"); B12.S2 (cites "Horizontal and vertical") |
| **7 (2)** | **B4.S1** (pre `dot_array_mult`: 9 × 7 arrays at W01); **B6.S9** (pre `composite_shapes`, D) |

**Outside both samples:**
- B4.S2 and B6.S6 score 7;
- B2.S10, B5.S8, B5.S9, B11.S3, B12.S1, B12.S3, B12.S5, B12.S6, B14.S1 and B14.S2 score 8.

## Fix list (round 11, links only)

**D. Half-unit sides.**
- On B6.S6, B6.S8 and B6.S9, change the pre `composite_shapes {forms:[0]}` to `area_perimeter:perimeter_grid {}`.
  - Keep the same cited step: Y4.B6.S5 / B6.S7, of which it is the direct or partial skill.
  - Generated: whole-unit edges only, with 0 of 150 decimals. L-shapes and composite shapes are counted on the grid.
  - None of the three steps has it already.

**T′. The 7s and 9s at W01.**
- On B4.S1 and B4.S2, change the pre `dot_array_mult {}` to `{band:25}`. Generated: rows and columns of 2–5 only, 150 of 150.
- On B4.S2, replace the related `mult_word_problems {range:100}` with `multiplication:mult_chart {task:'fill', constant:[6], band:100}`, "the 6 row of the chart". Generated: 450 of 450 blanks on the 6 line.

**C. Cited titles.** Cite what the skill deals, and name the gap:
- `identify_lines` (7 steps): "Y3.B11.S6 Parallel and perpendicular (lower grade, same CCSS cluster; Y3.B11.S5 Horizontal and vertical has no live skill)".
- B11.S1 `time_sense`: "Y3.B10.S5 Use a.m. and p.m. (lower grade, same CCSS cluster; Y3.B10.S6 Years, months and days is time_calendar, this step's build)".
- B11.S3 and B12.S1 `clock_parts`: "the clock face: the numbers 1–12 in their places (the face every time step reads)".
- B5.S14 `mult_word_problems {range:100}`: "equal-groups stories (Y3.B4.S11 How many ways has no live skill; correspondence is this step's build)".

**Isolated misfits.**

| Step | Fix | Checked on fresh items |
|---|---|---|
| B2.S10 | Set the related `div_check_by_multiplying` to Max Number 100 (`maxNumber: 100`), as on B5.S11 and B5.S12 | Dividends 24–108 |
| B5.S8 | Change the related `area_distributive_visual {}` to `{band:50}` | Width 8 or less, parts of 2–4; 0 of 150 are 2-digit × 2-digit |
| B6.S8 | Drop the related `classify_triangles`, or replace it with `shapes_early:shape_attributes {}`, "sides and vertices of polygons: a regular polygon's sides are all equal" | Right angles only (Y3 content), no acute or obtuse |

**W. `why` texts.**
- B1.S8: "hundreds placed on a 1,000-wide piece of the 0-10,000 line (3,000-4,000, ticks of 100)".
- B5.S9: "equal-groups stories: the facts each column of the multiplication uses".
- Optionally, apply the same span wording on B1.S9, B6.S1 and B6.S2.

**`linkfit.mjs`.**
- **G16.** Read the operation level in every form, against the week:
  - "n rows × m columns", and the word-work `"a"`/`"b"` steps of stories, for untaught tables;
  - 3-digit ÷ 1-digit before W36, in text and judge cells;
  - the labels of an area model (`w × (h1 + h2)`), for 2-digit × 2-digit.
- **G17.** Read decimals in visuals and SVG labels before W29.
- **G18.**
  - A pre's cited step must be a step the skill is tagged to (`SKILL_WRM` or a Y4 direct/partial), unless the `why` names the gap.
  - Angle classes (acute, obtuse) in any role before W27.

Then re-run on fresh seeds.

**Lead (generators and verdicts).**
- `composite_shapes` T-shapes deal half units, so B6.S5's `full` needs a generator fix, or a partial clause.
- `div_check_by_multiplying`, `area_distributive_visual` and `classify_triangles` have no option that holds them to Grade 3 at their defaults: no sides-only form, and no 2-digit dividend band other than Max Number.
- `mult_word_problems` has no table or 2-digit option.
