# Y5 (US Grade 4) WRM tagging — independent critic, round 5 (brief rules 1–19 + owner rule 2026-10-16)

Critic: independent critic (Opus, medium effort), 2026-10-16. I only graded: `Y5.json`, `site-lessons.json`,
`wrm-steps.json` and the tooling were not edited.
Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y5` at caf2a242. That is `data/curriculum/links/Y5.json`
(136 steps, 22 site lessons, 100 proposals, 175 tagFixes, 880 links), the extractor change d812109f and the round-3
lessons section. This round follows `Y5-critic-r4.md` (FAIL 7.58).

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** 1 sampled step is below 8: **Y5.B12.S11 = 6** (overstated FULL). A scan also found 3 steps at 7 (class F) |
| Step means ≥ 8 | **Yes, narrowly.** The r4 rows (34 steps): **8.03**. The new random 20: **8.15**. The hardest 5: **7.60**. All 59 sampled steps: **8.03**. With the 3 scan finds (62 steps): 7.98 |
| Every graded lesson ≥ 8, mean ≥ 8 | **No.** All 22 lessons graded. Mean **7.82**, min **6**. 4 lessons are below 8 |
| 0 real merge conflicts | **Yes.** Merged with R, Y1, Y4 and Y6 against live `wrm.js`: 0 conflicts. No key\|step is written by two lanes. Y5 writes nothing outside Y5, and no lesson tagFixes |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed Y5.json. No dependency outside the branch |
| Site coverage complete | **Yes for Y5.** All 16 committee/SUP lessons and the 6 unmatched Support lessons are present. Whole site: 4 curriculum titles (G1, G3) are in neither file (X1) |

The r4 classes A–E all landed and hold on fresh seeds, and the extractor change is correct. Three things still fail the
round:

- **G. An overstated FULL.** Y5.B12.S11 "Divide by 10, 100 and 1,000" never deals a decimal dividend.
- **F. A pre that is the step's own direct or partial.** The same key and opts are listed in both places, in 7 links.
- **H. Lesson pre-skills checked only at W38.** In the Support and customary lessons, some pre links are harder than
  the lesson or carry a false why.

Each is set out in the fix table at the end.

## Method

- **Items.** Every item came from the print path: `generateQuestionFor`, seeded, with `itemIndex` and `itemCount: 20`.
  The seeds were new to this round:
  - directs and partials: 8 items each (70001, +59);
  - links: 5 items each (90127, +67);
  - scans: 40 items per entry (88411, +37);
  - why-size scan: 20 items (4242, +29).
- **Scripts.** All are in my scratch folder (`…/scratchpad/r5/`), not the repo: `dump5.mjs`, `dscan5.mjs` and
  `whysize5.mjs` (r4's scripts, re-seeded and extended to lessons), `siteaudit.cjs`, `dis.cjs`, `merge5.mjs` and
  `probe.mjs`.
- **School weeks.** From `prior.json` as written by my clean build. It includes the lessons' weeks, with W38 for a
  Support lesson that has no week.
- **Sample.**
  - All 34 steps that r4 scored below 8 or named in its fix table.
  - A new random 20, drawn with `random.Random(50516)` from the 85 steps r4 did not grade.
  - The 5 hardest steps of this round.
  - All 22 site lessons.
- **Criteria** are as in r4: right directs and opts; an honest verdict and clause; pre-skills that are useful, filtered,
  in week order, at least 3, and led by the main building block; related skills that share the idea and fit.

## 1. The r4 classes and step rows, on fresh seeds

| r4 class | Status at caf2a242 |
|---|---|
| A `denoms` ignored by click-all/sort | **Landed.** linkfit now checks for unrelated pairs on directs and partials too. My fresh dscan finds unrelated pairs only in B4 partials whose clauses name them: `add_frac_unlike` 31/40, `_nv` 20/40, `add_mixed_unlike` 25/40, `sub_*` 23–31/40. No FULL step deals an unrelated pair. B4.S13 and B4.S17 are now partial. `denoms_all_forms` closes S10–S17 |
| B Notes used as opts | **Landed.** B14.S1/S3 `unit_conversions {units:[0]}` deals customary content 2/40, the "1 mile" distractor, which the clause names. B14.S1/S3 `unit_conversion_word {units:[1]}` gives 40/40 customary hits: its Length Key lists ft and yd beside metric stories, and the clause says so. B14.S2 `capacity {units:[1]}` shows 12/40 hits, all of them the "Cup (240 mL)" label, a false positive. B7.S2 has `{denoms:[5]}`; B12.S5/S6 have `{decimals:1/2}`; B8.S1 has `{forms:[0,1]}` and no ft stories |
| C Size rule dropped building blocks | **Landed.** `multiply {tiles:21}` is first on B5.S6/B5.S11 (37 × 9, 85 × 8). B8.S3 has `mult_facts {band:100}`; B3.S1 `{constant:[2,4,8]}`; B12.S12 `missing_mult_div {range:100}` |
| D Stale why after re-option | **Landed.** My why-size scan gives 2 hits, both false positives: `identify {band:99999/999999}` shows its 5- or 6-digit number in the chart, and the scan reads it digit by digit |
| E Duplicates | **Landed within a role.** But see the new class F: a pre can still repeat the step's own direct or partial |

All 23 per-step rows from r4 were applied. They hold on fresh items: B4.S10–S17 clauses, B14.S1–S3, B5.S6/S11, B8.S3,
B3.S1, B3.S10, B2.S1, B2.S7, B1.S3, B12.S3/S4, B10.S7, B13.S5, B14.S5, B7.S8 (folded into `dec_same_whole` with
`addValue`), B15.S3 and B11.S2. Minor leftovers, which do not move a score:

- B5.S11: the `remainder_interpret` clause says "12–17", but the items include 19 ("puts 19 apples in each basket").
- B3.S7: pre `exponents_simple {forms:[0]}` deals 56² = 3136 for a squares building block. The previous step's clause
  names the large bases, but the link carries the problem into the step.

## 2. Step grades

### The 34 steps from r4

| Step | Score | Reasons |
|---|---|---|
| B1.S3 | 8 | Pre `place_value_disks` / `expand {band:9999}`; related `compare {band:99999}` (37,295 vs 94,962). Pre disks `{band:9999}` is the same as the step's own partial. r4 prescribed it, so this is noted, not docked |
| B2.S1 | 8 | Pre `more_less_100 {step:1000}` deals 3,426 + 1,000. `add_sub_10s` is gone. `make_a_ten` related is weak but honest |
| B2.S7 | 8 | `equal_sign` is dropped and `balance_addsub` is now pre. One related (`estimate_sums_diffs`) |
| B3.S1 | 8 | `count_by_tables {3}`, `mult_chart {3,6,9}`, `mult_facts {2,4,8}`. No duplicate |
| B3.S10 | 8 | The `multiples` why is fixed; related `more_less_100 {step:1000}` |
| B4.S10 | 8 | Both partials name the unrelated click-all/sort pairs. `frac_total_band` + `denoms_all_forms` |
| B4.S11 | 8 | Same. Related `add_mixed_like` is like-denominator |
| B4.S12 | 8 | `add_mixed_unlike` clause: "related on the calculate items only (1 1/2 + 3 1/3)" |
| B4.S13 | 8 | Partial now. Both like-denominator twins are partial, "never related"; build `denoms_all_forms`. The previous step's build in preBuild is legitimate |
| B4.S14 | 8 | `frac_whole_minuend` + `denoms_all_forms`; pre `whole_as_fraction` |
| B4.S15 | 8 | `mixed_plus_frac`; preBuild `frac_whole_minuend` |
| B4.S17 | 8 | Partial. The clause records that unlike denominators come a week later (W17) |
| B5.S6 | 8 | `multiply {tiles:21}` first, then `area_model_mult {tiles:21}`. Related `div_word_problems_plain {range:100}` |
| B5.S11 | 8 | As above. The divisor range in the clause is slightly understated (19) |
| B7.S2 | 8 | `f_to_d {denoms:[5]}` with an honest clause (fifths, hundredths, percent bins). One related |
| B7.S4 | 8 | Partial now; `f_to_d_forms` closes it cheaply |
| B7.S8 | 8 | Uses Y4's `dec_same_whole` plus an `addValue` "same places" value for the lead. Filler pre is gone |
| B8.S1 | 8 | `perimeter {forms:[0,1]}`: cm stories, no ft. Pre `perimeter_intro`, `add`, `multiply {range:100}` |
| B8.S3 | 8 | `mult_facts {band:100}` first ("5 sides × 7 cm") |
| B10.S7 | 8 | `pie_chart` dropped; the note says why no related link fits; pre `sub_1k_regroup {band:100}` |
| B12.S3 | 8 | Related `money_change {usd}` ($1.00 − $0.50): the same crossing of 1 |
| B12.S4 | 8 | `add_10k_regroup` dropped; 3 pre |
| B12.S5 | 8 | `{decimals:1}` |
| B12.S6 | 8 | `{decimals:2}` |
| B12.S12 | 8 | `missing_mult_div {range:100}` first |
| B13.S5 | 8 | `add_int` dropped; `abs_value`, `temperature` |
| B14.S1 | 8 | Metric units set; the clauses name the "1 mile" distractor and the ft/yd key. Related `capacity {units:[1]}` |
| B14.S2 | 8 | `capacity {units:[1]}`, `length_metric {forms:[0,2]}`. The note says why no related link fits |
| B14.S3 | 8 | Metric units set; clauses honest |
| B14.S5 | 8 | `{units:[0]}`; pre `mult_facts {6,7}` |
| B15.S3 | 8 | Pre `estimate_length {forms:[0]}`, `area_unit_squares`, `dot_array_mult`; no duplicate |
| B11.S2 | 9 | The clause is the missing vertex only, which `coord_polygon_draw` closes exactly |
| B3.S5 | 8 | Unchanged FULL; still right |
| B3.S7 | 8 | Unchanged; the 56² pre is noted above |

Sum 273 / 34 = **8.03**.

### New random 20 (seed 50516)

| Step | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|
| B1.S5 Read and write numbers to 1,000,000 | W06 | partial | 8 | Honest: word names are pick-one-of-four, so the write direction is missing. `pv_words_write` |
| B1.S6 Powers of 10 | W06 | partial | 8 | `place_value_10x` clause honest (÷ 1,000 and decimal results from W10) |
| B1.S7 10 … 100,000 more or less | W06 | partial | 8 | `{step:1000}` stops at 1,000. Related `add_sub_10s` / `add_sub_100s` are thin but share "add one unit of a place" |
| B1.S13 Round within 100,000 | W08 | full | 9 | Five directs, each exact at 5 digits (table, line, sort, 1,000s, 10,000s); pre `nearest_1000 {band:10000}` |
| B2.S6 Multi-step +/− problems | W09 | partial | 8 | Clause honest (stories to about 150); pre 4-digit column, `add_wp_1m_plain` |
| B3.S8 Multiply by 10, 100, 1,000 | W10 | full | 8 | `place_value_10x {op:'x', power:[10,100,1000]}` whole numbers, which is the step |
| B4.S1 Equivalent to a unit fraction | W15 | partial | 8 | `equiv_from_unit`; pre `equiv_frac_nv {denoms:[2]}` |
| B4.S6 Compare fractions < 1 | W16 | full | 8 | `compare` / `compare_frac_lcd` deal unlike pairs, as 4.NF.A.2 asks |
| B4.S7 Order fractions < 1 | W17 | full | 9 | Exact; pre `compare`, `lcd`, `benchmark`; related `order_frac_numline` |
| B4.S16 Breaking the whole | W18 | partial | 8 | `sub_break_whole` |
| B5.S2 2-digit × 2-digit (area model) | W11 | full | 9 | `area_model_mult_hard {tiles:22}` (44 × 37); pre is the 1-digit area model, then × 10 |
| B7.S5 Thousandths as fractions | W22 | partial | 8 | `thousandths_pv`; pre `value {}` is 3-digit filler |
| B7.S14 Percentages as decimals | W23 | full | 8 | `d_to_p` / `p_to_d`; one 0.125 → 12.5% item (minor) |
| B9.S3 Read and interpret tables | W04 | gap | 8 | `table_data`; pre tally, bar, pictograph |
| B9.S5 Read timetables | W29 | gap | 8 | `timetables`; pre elapsed time; preBuild `table_data` |
| B10.S2 Classify angles | W23 | partial | 8 | No reflex angles; `reflex_angles` |
| B11.S1 Read and plot coordinates | W27 | full | 8 | `coordinate_q1` reads and plots; pre `shape_positions` is thin |
| B11.S3 Translation | W27 | partial | 8 | `translate_grid` (overlap note for the lead) |
| B12.S1 Known facts, decimals within 1 | W13 | gap | 8 | `dec_known_facts`; pre bonds and tenths |
| B13.S1 Understand negative numbers | W38 | partial | 8 | No context; `negative_count` |

Sum 163 / 20 = **8.15**.

### Hardest 5 (this round)

| Step | Score | Reasons |
|---|---|---|
| **B12.S11 Divide by 10, 100 and 1,000** | **6** | **Overstated FULL (class G).** `place_value_10x {op:'/', decimals:true}` deals only whole-number dividends (689 ÷ 10, 869 ÷ 1,000; 40 of 40 probe items). 5.NBT.A.2 and the WRM step ("divide whole numbers **and decimals**") need a decimal dividend: 3.4 ÷ 10 = 0.34. With `decimals:true` the × form does deal decimals (68.9 × 10), so the gap is one-sided. Pre: 3, all thin. Related: 1 |
| B1.S10 Compare/order to 100,000 | 8 | Exact directs at `{band:99999}`; the why-size hit on `identify` is a false positive |
| B6.S7 Fractions as operators | 8 | `frac_operator`; related `frac_mult_word {denoms:[5]}` |
| B7.S12 Understand percentages | 8 | `percent_visual` is exact at W22 |
| B4.S9 Add/subtract, same denominator | 8 | Four exact directs; preBuild `frac_compare_gt1` |

Sum 38 / 5 = **7.60**. **All 59 sampled: 474 / 59 = 8.03; min 6.**

### Scan finds (class F: a pre with the same key and opts as the step's own direct or partial)

| Step | Score | Reasons |
|---|---|---|
| B1.S2 Numbers to 10,000 (full) | 7 | 3 of 4 pre (`place_value_disks`, `pv_digit_drag`, `expand {band:9999}`) are the step's own directs and deal the same items. Only 1 distinct pre is left (`unit_form {band:999}`), with no "few" note |
| B1.S9 Number line to 1,000,000 | 7 | Pre `place_on_number_line {span:1000, band:10000}` = its own partial; 2 distinct pre are left |
| B10.S3 Estimate angles | 7 | Pre `measure_angles {}` = its own partial, so only `identify_angles` is a real pre (the "few" note counts 2) |

With these: 62 steps, 495 / 62 = 7.98.

## 3. Site extraction audit

**Independent parse.** I decoded the `__data` block of the saved site myself, then checked every pacing entry (2,400 on
every track), every CURRICULUM core step and every Support (`enrich`) entry against `wrm-steps.json` and
`site-lessons.json` (`siteaudit.cjs`):

- **Pacing.** Every own-grade WRM entry (b, s numeric; not SUP, `st.g` or `st.rv`) resolves to a step with the same
  title (or siteTitle). Every Drive step is paced. Every SUP/committee/no-block entry is a lesson in the file, with its
  week and track. Every exam/MAP entry is an assessment.
- **Y5 = G4.** All 16 committee lessons (all scheduled as SUP) and all 6 Support titles that match no WRM step are in
  `site-lessons.json` and in `Y5.json` `lessons`: 22 = 22, in the same order. The G4 Support titles that do match a
  WRM step (348 entries) are recorded on their step's `site.supportIn`. **Nothing on the G4 site is unaccounted for.**
- **Ids.** `<grade>|-|<slug>` is the site's own tracker key: the site's `trkRow`/`trkTk` build `gid+"|-|"+trkSlug(st.n)`
  for exactly these entries. There are no duplicate ids, and no title collides with another under the slug. `--check`
  reproduces both files byte for byte (deterministic). A retitle on the site is a new id; the doc says so.
- **`ws-wrm-extract --check`:** `wrm-steps.json up to date`, `site-lessons.json up to date`, exit 0. 12 disagreements.

**152 → 12: the change is correct, not hiding anything.** I ran the pre-change extractor (d812109f^) on the same site
and got 152 disagreements. The 140 that disappear are artifacts:

| Old class | n | Verified |
|---|---|---|
| "pacing names it both …" | 70 | All 88 copied-in (`st.g`) entries carry the **source** grade's block/step: 88 of 88 equal the source grade's step title at that (b, s). Across all grades the own-grade entries show **0 title conflicts and 0 CCSS conflicts** |
| Drive lesson file vs site title | 22 | The new code reports 0, because no own-grade entry has a different title. These came from a foreign entry being read first |
| pacing CCSS vs v3 CCSS | 23 → 1 | Same cause. The remaining Y6.B11.S6 (v3 has no CCSS) is real |
| Drive folder vs pacing unit | 28 | K–G5 units are now all `kind: domain/enrich` ("Counting & Cardinality" for Y1.B1). Comparing them to block names is meaningless |

The old code was also **wrong on data**. Run on today's site, it would overwrite 6 Y5 steps' CCSS with another grade's
step:

- B7.S11 → 4.NF.B.3
- B8.S4 → 3.NF.A.2
- B11.S6 → 2.G.A.1
- B12.S1 → 4.MD.C.5
- B12.S2 → 3.G.A.1
- B12.S4 → 3.G.A.1

The new file matches my own derivation from the first own-grade entry for all 872 steps: CCSS, power, usAdaptation and
enrichment, 0 mismatches. Against the previously committed `wrm-steps.json`, no title or CCSS changes. Only `site`,
`enrichment`, 3 Y1 `power` flags and 8 `usAdaptation` flags are added, all from own-grade entries.

The 12 remaining are real: 9 EE-map gaps on the site, 1 Teaching Guide file name, Y6.B11.S6, and 2 review entries.

**Minor extractor findings (not Y5; fix row X1, for the lead):**

1. **Four site titles are in neither file.** They are G1 CURRICULUM core "above" titles "Select money (US)", "Find the
   total (US)" and "Count money - notes and coins (US)", and G3 core "Pounds, tens, ones and pence (US)". The
   curriculum-only pass takes only `flag: committee`, so a core title with no WRM step falls through.
2. **Review entries carry this grade's numbering.** `st.rv` uses the grade's own block/step, not another grade's. G1 W28
   (b4, s2) is Y2.B4.S2 retitled. The code matches reviews by title only, so the review is not recorded on
   Y2.B4.S2.taughtIn; it appears only as a disagreement. The comment "carries ITS OWN grade's numbers" is true for
   `st.g`, not for `st.rv`.
3. **Support titles are matched only inside their stated source grade.** Two exact title matches in an adjacent grade
   become silent lessons rather than disagreements: G4 "Measure in centimetres" (site says K; exactly Y2.B6.S1) and G3
   "Measure in grams" (site says G2; exactly Y2.B7.S2). The Y5 lesson note names the WRM step, so Y5 is honest. The
   extractor should record a disagreement for this case.

## 4. Site lessons: all 22 graded

| # | Lesson (G4) | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|---|
| 1 | Place value: 10 times and one tenth | W05 | partial | 8 | `value {band:9999}` / `place_value_10x {power:[10]}` honest; `value_ten_times` |
| 2 | Multiply/divide multiples of 10 (90 × 50, 300 ÷ 30) | W06 | partial | 8 | `mult_zeros {forms:[2]}` (6 × 40 only); `facts_times_tens`. Pre `div_facts {}` why "Multiply and divide by 9" deals every table (minor) |
| 3 | Extend growing shape patterns | W09 | partial | 8 | Number rule only, no pictures; `growing_shape_patterns`; related `function_table_easy` |
| 4 | Find emergent features | W09 | partial | 8 | `patterns_notice`; related `pattern_relationship` |
| 5 | Follow a given rule | W09 | full | 9 | `number_patterns_rule {rule:false}` prints the rule and the pupil continues it, which is exactly the lesson |
| 6 | Multiplicative comparison: times as many | W10 | partial | 8 | Never reads 35 = 5 × 7 as a comparison; `comparison_statements` |
| 7 | How many times as many? (unknown multiplier) | W10 | partial | 8 | Generated: 2 of 8 items ask the multiplier; clause honest; `comparison_unknown` |
| 8 | Multi-step: divide and interpret the remainder | W11 | partial | 8 | Clause names one-step and divisors to 19; `remainder_too_big` related fits |
| 9 | Decompose a fraction (equations and drawings) | W13 | full | 8 | `decompose_fractions`: unit-fraction sums with bars plus "click all ways". Generous but defensible; mixed numbers sit in Y5.B4 |
| 10 | Add tenths and hundredths | W18 | partial | 8 | `frac_10_100` renames only; `add_tenths_hundredths`. Related `add_decimal {decimals:2}` deals 30.94 + 34.5, not the "0.3 + 0.04" its why shows (minor) |
| 11 | Points, lines, line segments and rays | W21 | gap | 8 | `points_lines_rays`; pre `identify_lines` / shapes |
| 12 | Angles are additive | W28 | full | 8 | `additive_angles` (105° + ? = 180°) is the lesson, with the equation |
| 13 | Line plots with fractions | W28 | partial | 8 | Reads only, never makes the plot; `make_line_plot` |
| 14 | Customary capacity | W30 | partial | 8 | `capacity {units:[0], forms:[0]}`; `conversion_table`; the note says why no related fits. Pre `mass_volume_liquid {forms:[2]}` why says "capacity", but half its items sort g vs kg (minor) |
| 15 | **Customary length and weight** | W31 | partial | **6** | **Class F and a false why.** Pre `unit_conversions {units:[1], forms:[0]}` is the lesson's own partial (same key and opts, same items), cited as "Y3.B7.S4 Equivalent masses (kilograms and grams)" while it deals fl oz, yd, gal, lb. That leaves 2 real pre, one of them metric km → m |
| 16 | Measurement word problems | W31 | partial | 8 | `unit_conversion_word {}` and `money {}` honest; `measure_word_four_ops` |
| 17 | 3D shapes (Reception Support) | W38 | full | 8 | `name_3d_shapes` names the five solids; the note says few pre exist (Reception) |
| 18 | **Compare fractions** (Gr 3 Support, 3.NF.A.3d) | W38 | partial | **7** | **Class H.** Pre `order_fractions {}`, cited as "Y3.B6.S2 Compare and order unit fractions", deals unlike sets (7/12, 7/10, 3/4, 5/6), which is 4.NF.A.2: harder than the lesson it prepares for, under a false why. `compare {denoms:[2,3], forms:[0,1]}` still pairs 5/6 vs 3/5, but the clause says so |
| 19 | Divide a 1-digit number by 100 | W38 | partial | 8 | `div10_small_numbers` reused from Y4. Pre `d_to_f {forms:[1]}` why "hundredths as decimals" deals half/quarter bins (minor) |
| 20 | Hundredths | W38 | partial | 8 | `decimal_pv`; the note names Y4.B8.S7–S9 |
| 21 | **Measure in centimetres** (Y1 Support) | W38 | partial | **7** | **Class H.** Related `estimate_length {forms:[2]}` sorts objects into in/ft/yd/mi: customary units on a centimetre lesson (rule 18 content), under a "before measuring with the ruler" why. Partial `reading_ruler` is inches only (honest) |
| 22 | **Order fractions** (Gr 3 Support) | W38 | partial | **7** | **Class H.** Pre `fractions:compare {}`, cited as "Y3.B6.S2 Compare and order unit fractions", deals unlike pairs (4/6 vs 1/5, 2/3 vs 3/4): above the lesson, with a false why |

Sum 172 / 22 = **7.82**; min 6.

**The decision that lessons emit no tagFixes into SKILL_WRM is right.** SKILL_WRM is keyed by WRM step ids, and a site
lesson is not a small step. Putting a `G4|-|…` key there would corrupt `wrmFor`, `skillsForWrmStep` and the coverage
counts. mergecheck enforces it: 0 lesson tagFixes, and the section holds exactly the 22 site lessons. Proposals carry
`lessons` and `closes[<lesson id>]`; 17 proposals are used by lessons, and every lesson build has its `closes` entry.

The one consequence the lead must handle: 12 proposals used only by lessons have `steps: []`. A WRM_PROPOSALS merge that
keys on `steps` would drop them, so the merge must read `lessons` too, or they go to `STANDARD_PROPOSALS` (all are
CCSS-tagged).

The weakness is in linkfit, not the encoding. A Support lesson with no week is judged at W38, so anything taught all
year passes. A remedial Grade 3 lesson then gets Grade 4 content as its pre (rows 18 and 22). Support lessons need their
**source grade** as the content ceiling (fix H).

## 5. Merge (my own script, `merge5.mjs`, plus r4's `mergesim.mjs`)

These files are byte-identical on the y5 branch and on `origin/claude/sweet-newton-c8wrv1`:

- in-repo `data/curriculum/links/{R,Y1,Y4,Y6}.json`;
- live `js/modules/wrm.js` (blob 0588425).

| Check | Result |
|---|---|
| tagFixes | Y5 175, R 76, Y1 80, Y4 166, Y6 148 |
| key\|step written by two or more lanes | **0**, so **0 conflicts** |
| Y5 tagFix on a non-Y5 step / on a lesson | 0 / 0 |
| Y5 applied to live: every direct tagged FULL, every partial PARTIAL, no live tag on a Y5 step missing from the file | **0 mismatches** |
| r4 `mergesim.mjs`, each lane in its own encoding | Y5 0, R 0, Y1 0, Y4 0, Y6 0; introduced by merge 0 |
| The same, every lane read in the Y5 encoding | Y5 0, Y4 0, Y6 0; R 69 / Y1 50 are the known **format-only** "clause in `why`, no `partial` field" rows. Each lane gives the same count alone and merged |
| Outside Y5 | Y4 writes `patterns:count_by_step_up\|Y2.B1.S15` (not Y5's to fix) |

**Real conflicts: 0.**

## 6. Reproducibility

`git archive HEAD` was unpacked twice into clean folders. One build had `WRM_TAG_DATA` set to a scratch folder, the
other used the default `$TMPDIR/wrm-tag-Y5`. Both printed:

- 136 steps (37 full / 74 partial / 25 gap) and 22 lessons (4 / 17 / 1);
- 175 tagFixes;
- mergecheck OK, linkfit "880 links … 0 misfits", optcheck 0 problems, OK.

Both outputs have sha256 `53b2b425…`, identical to the committed Y5.json. The build scripts reference no absolute
path; the only outside default is `$TMPDIR`. **There is no dependency outside the branch.**

## 7. Fix table (FAIL)

### Build-level

| # | Class | Change | Affected |
|---|---|---|---|
| G | Overstated FULL | Y5.B12.S11 → partial. The `place_value_10x {op:'/', decimals:true}` clause: "whole-number dividends only (689 ÷ 10); never a decimal divided by 10, 100 or 1,000 (3.4 ÷ 10 = 0.34)". New option proposal on `place_value_10x` ("decimal dividends on ÷"), or extend `dec_missing`/`div10_small_numbers` if one fits. closes: "dividing a decimal by 10, 100, 1,000". Add a linkfit/optcheck gate: a FULL step whose title or CCSS names "decimals" must deal a decimal operand. Also check the other ÷ 10 steps | B12.S11 (check B3.S9) |
| F | Pre = own direct/partial | In `build.py`, drop (or re-band one place lower) any pre or related link whose key and opts equal a direct or partial of the same entry. For a repeated lower-grade step (B1.S2 = Y4.B1.S5), take the pre from the step below (`{band:999}`, Y4.B1.S2/S4). Then recount the rule-15 minimum or write the "few" note | B1.S2, B1.S3, B1.S9, B10.S3, lesson 15 (7 links) |
| H | Lesson pre checked only at W38 | For a Support lesson, the linkfit content ceiling is its **source grade** (from the site note "Source: G2" etc.), not W38: no unlike-denominator compare/order for a Grade 3 fraction lesson, no customary units on a metric lesson. A pre may not be harder than the lesson. Re-run the why check: the cited step's content must match the items (`order_fractions {}` is not "unit fractions") | Lessons 18, 21, 22 (scan the other 3 Support lessons too) |
| X1 | Extractor (lead, non-Y5) | (1) The curriculum-only pass should also list core titles that match no WRM step (the 4 G1/G3 money titles). (2) Resolve `st.rv` by this grade's (b, s) before falling back to the title, and record it on `taughtIn`. (3) When a Support title matches a WRM step only outside its stated source grade, record a disagreement | wrm-steps / site-lessons |

### Per entry (expected after the fix)

| Entry | Change | Expected |
|---|---|---|
| Y5.B12.S11 | Class G: partial with the clause above; build the new option; pre `place_value_10x {op:'x', decimals:true}` (B12.S10, the inverse) | 8 |
| Y5.B1.S2 | Pre → `place_value_disks` / `pv_digit_drag` / `expand {band:999}` ("Y4.B1.S2–S4 numbers to 1,000"), `unit_form {band:999}` | 8 |
| Y5.B1.S9 | Drop the duplicate pre; add `number_sense:place_on_number_line {span:100, band:1000}` ("Y4.B1.S9") or a "few" note | 8 |
| Y5.B10.S3 | Drop pre `measure_angles` (own partial); keep `identify_angles` and update the note | 8 |
| Y5.B1.S3 | Drop pre `place_value_disks {band:9999}` (own partial) or keep it with the note "same skill, previous band". It has 2 other pre | 8 |
| Lesson 15 Customary length and weight | Drop pre `unit_conversions {units:[1], forms:[0]}` (own partial, false why). Add `length_customary {forms:[0]}` (ft ↔ in, the length half taught first) or `multiplication:mult_facts {constant:[12]}` ("× 12, × 16") | 8 |
| Lesson 18 Compare fractions | Replace pre `order_fractions {}` with a same-denominator/unit-fraction link (`fractions:identify`, `shade_fraction`, `fraction_nl_drag {}` halves/quarters) | 8 |
| Lesson 22 Order fractions | Replace pre `fractions:compare {}` the same way; relink `compare` as related only after `frac_compare_same_part` | 8 |
| Lesson 21 Measure in centimetres | Replace related `estimate_length {forms:[2]}` with `estimate_length {forms:[0]}` (metric benchmarks) or `measurement:length_metric {forms:[1]}`, or drop it with a note | 8 |
| Lessons 2, 6, 7 | Pre `div_facts {}`: why "Y4.B4.S4 Multiply and divide by 9" → `{constant:[9]}`, or re-cite it as "division facts to 12 × 12" | (minor) |
| B5.S11 | Clause "12–17" → "12–19" | (minor) |

With G, F and H fixed, every graded step and lesson is expected at 8 or better: step mean about 8.1, lesson mean about
8.0.

## What is right

- The r4 classes A–E are all built into the tooling, not patched by hand, and they hold on new seeds.
- The extractor change fixes real data corruption and hides no real disagreement.
- `site-lessons.json` uses the site's own tracker ids and is deterministic. G4 is covered completely.
- All 22 lessons are tagged under the step contract, with envisioned builds and `closes`. The no-tagFix decision is
  sound and enforced.
- The build is reproducible from the branch alone, and the merge with every in-repo lane has 0 real conflicts.
