# Y5 (US Grade 4) WRM tagging — independent critic, round 6 (brief rules 1–19 + owner rule 2026-10-16)

Critic: independent critic (Opus, medium effort), 2026-10-16. Grading only: `Y5.json`, `site-lessons.json`, `wrm-steps.json`
and the tooling were not edited.
Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y5` at 616981dd (`data/curriculum/links/Y5.json`: 136 steps, 21 site
lessons, 101 proposals, 175 tagFixes, 874 links; the X1 extractor change; the round-4 linkfit gates G / F / H).
Follows `Y5-critic-r5.md` (FAIL: B12.S11 = 6; B1.S2 / B1.S9 / B10.S3 = 7; lessons mean 7.82).

## Verdict: FAIL (narrowly)

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** Sampled: **Y5.B15.S4 = 7** (related link deals customary units under a "metric" why). Two more found by a scan of the same class: **B15.S1 = 7, B15.S3 = 7** |
| Step means ≥ 8 | r5 rows (7 steps) **8.00**; new random 20 **7.95**; hardest 5 **8.20**; all 32 sampled **8.00**; with the 2 scan finds (34) **7.94** |
| Every lesson ≥ 8, mean ≥ 8 | **No.** All 21 graded: mean **7.95** (167 / 21), min **7** (lesson 7 "unknown multiplier": new false why; lesson 10 "Add tenths and hundredths": an existing option missed) |
| 0 real merge conflicts | **Yes.** Y5 + R, Y1, Y4, Y6 against live `wrm.js`: 0 key\|step written by two lanes, 0 own-step mismatches alone or merged, 0 Y5 lesson tagFixes |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds (one with `WRM_TAG_DATA`, one with a scratch `TMPDIR`): identical logs, sha256 `1aca56d8…` = committed Y5.json |
| Site coverage complete | **Yes.** Every pacing / curriculum / Support title on the site is a step, a step record or a site lesson; `ws-wrm-extract --check` exit 0 |

Every r5 row landed and holds on fresh seeds, and the extractor change is correct. Three new classes keep the round below 8:

- **K. Customary content on metric steps after W33.** The rule-18 "no customary units on a metric step" check exists only for
  Support lessons (gate H); B15.S1 / S3 / S4 (W34–W37) pass linkfit with ft / in / oz / gal links.
- **L. A false why on a bar-model link.** Lesson 7's new related `tape_diagram {}` claims "the bar model a times-as-many story is
  drawn with"; every item is an additive part-whole bar.
- **M. An existing option missed (rule 5).** Lesson 10 says no skill adds a tenths and a hundredths fraction; `frac_10_100_nv`
  deals exactly `3/10 + 5/100 = ?/100` and has a "Add tenths and hundredths" forms value.

## Method

- **Items:** print path (`generateQuestionFor`, seeded, `itemIndex`, `itemCount: 20`), seeds new to this round:
  directs/partials 8 items (60617, +53); links 5 items (83311, +71); probes 12–40 items (31337 / 5150 / 7001 / 4447, +43);
  unit scan 30 items per link (51151, +89). Scripts in the scratch folder `…/scratchpad/r6/` (`dump5.mjs` re-seeded,
  `probe.mjs`, `unitscan.mjs`, `unitscan2.mjs`, `merge6.mjs` (new), `siteaudit.cjs`, `mt.mjs`). School weeks: `prior.json`
  from my clean build.
- **Sample:** the r5 rows (B12.S11, B1.S2, B1.S3, B1.S9, B10.S3, B5.S11, B2.S6); a new random 20, `random.Random(61017)` over
  the 44 steps graded by neither r4 nor r5 nor the builder's self-check; the 5 hardest of that pool; all 21 lessons.
- **Criteria** as r4 / r5: right directs and opts; an honest verdict and clause; pre-skills useful, filtered, in week order,
  at least 3 (or a note), led by the main building block; related skills that share the idea and fit (rule 18 content).

## 1. The r5 rows on fresh seeds, and the new gates

| r5 row | Status at 616981dd |
|---|---|
| G B12.S11 | **Landed.** Partial, clause "whole-number dividends only (689 ÷ 10 = 68.9); never a decimal divided by 10, 100, 1,000"; fresh items 554 ÷ 10, 251 ÷ 1,000 (all whole dividends). New option `div10_decimal_dividend`; first pre `place_value_10x {op:'x', decimals:true}` deals 94.1 × 10 (the inverse) |
| F B1.S2 / B1.S3 / B1.S9 / B10.S3 | **Landed.** B1.S2 pre are `{band:999}` (994, 974 = 9 hundreds 7 tens 4 ones); B1.S3 pre `pv_digit_drag` / `expand` / `unit_form {band:9999}`; B1.S9 pre `place_on_number_line {span:100, band:1000}`, `more_less_100`, `pv_digit_drag {band:999999}`; B10.S3 one pre plus an honest "few" note |
| H lessons 15 / 18 / 22 | **Landed.** Customary length & weight: pre `length_metric {forms:[3]}`, `reading_ruler`, `mult_facts {constant:[12]}`. Compare / Order fractions: pre `identify {forms:[1]}`, `shade_fraction`, `fraction_number_line`, `equiv_frac_visual`; the unlike-pair `compare` / `compare_frac_lcd` sit in related with forward whys. Lesson 21 is now a step record (X1.3) |
| Minor | Lessons 2 / 6 / 7 `div_facts` why "every table" ✓; B5.S11 clause "12–19" ✓ (fresh items 14, 16); B3.S7 `exponents_simple {forms:[0], step:[0]}` ✓; Divide 1-digit by 100 pre `d_to_f {forms:[0]}` re-cited ✓ |
| X1 | **Landed and correct** (section 4) |

**Are the new linkfit gates real?** I mutated a copy of Y5.json and ran `linkfit.mjs` on it:

| Gate | Mutation | Fired? |
|---|---|---|
| G decimal operand | B12.S11 back to FULL with `{op:'/', decimals:true}` | **Yes** ("block names decimals, but no direct item has a decimal in its question") |
| F own repeat | B10.S3 pre `measure_angles {}` (its own partial); customary lesson pre `unit_conversions {units:[1], forms:[0]}`; and `{units:[1]}` (other opts, same items) | **Yes, all three** (key+opts, and the item signature) |
| H unlike compare | Order fractions pre `fractions:compare {}` | **Yes** |
| H unlike compare | Compare fractions pre `fractions:order_fractions {}` with why "Y3.B6.S5 Compare fractions" | **No.** `unlikeCompare` reads only text + tiles and needs "compar / order / greater / less": `order_fractions` says "Drag … from greatest to least" (no match) or puts the fractions only in the answer. Caught only when the why says "unit fractions" |
| H why unit | "Y3.B7.S4 Equivalent masses (kilograms and grams)" on customary items | **No.** The cited title is cut at "(", so the r5 example itself is not read; it was caught by F only |
| H customary on metric | Hundredths lesson related `estimate_length {forms:[2]}` | Yes (Support lessons only). **The same check does not run on ordinary metric steps**, which is class K |

So G and F are real checks. H is real for its main case but has two holes, and its customary check is scoped to Support
lessons only. The build's own `own_repeats` pass reports "0 stepped / 0 dropped": it is a no-op today because
`spec_zz_r5.py` fixed the rows by hand, but the linkfit F gate behind it is real.

## 2. Step grades

### The r5 rows

| Step | Score | Reasons |
|---|---|---|
| B12.S11 Divide by 10, 100 and 1,000 | 8 | Honest partial (above). 4 pre (the inverse first). One related (`d_to_f {forms:[0]}`, decimal ↔ fraction): thin but true |
| B1.S2 Numbers to 10,000 | 8 | Exact directs at 9,999; 3 distinct pre at 999; 5 related (value, identify, combine, word names, compare) |
| B1.S3 Numbers to 100,000 | 8 | Partials honest (counters stop at 9,999). 3 pre |
| B1.S9 Number line to 1,000,000 | 8 | Two honest partials; 3 pre; related lines at 10,000 / 1,000 and compare / order to 1,000,000 |
| B10.S3 Estimate angles | 8 | One pre and a true "few" note (`turns_and_angles` is still only a proposal). Could add `turns_and_angles` to preBuild (minor) |
| B5.S11 × ÷ problems | 8 | Clause fixed. Minor: related `tape_diagram {}` is additive bars for a × ÷ step (see L) |
| B2.S6 Multi-step + − | 8 | Minor: related `tape_diagram_plain` is the plain twin of the step's own partial, and `algebra_word_mixed` deals the same multi_step_word / tape_diagram items. The F gate lets pools and plain twins through by design. 2 other related are good |

Sum 56 / 7 = **8.00**.

### New random 20 (seed 61017)

| Step | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|
| B1.S14 Round within 1,000,000 | W08 | full | 9 | Four exact directs at 6 digits; pre the 100,000 step first |
| B2.S2 Add > 4 digits | W08 | full | 8 | 5- and 6-digit column addition; 5 pre from 4-digit columns down |
| B2.S8 Find missing numbers | W01 | partial | 8 | Clauses honest (facts within 20; 2-digit unknowns); build `inverse_check` |
| B3.S2 Common multiples | W01 | partial | 8 | `lcm {forms:[1]}` click-all; build `common_mf`; tables pre |
| B3.S3 Factors | W01 | full | 8 | Factor fill / T-chart / links to 100. Minor: pre `mult_properties {}` why "× 1 and commutative" deals zero and distributive properties |
| B3.S4 Common factors | W02 | partial | 8 | `gcf_easy {forms:[1]}`; previous step's skills as pre |
| B5.S4 3-digit × 2-digit | W34 | partial | 8 | Placeholder zero and area model; `long_mult` |
| B6.S2 Non-unit fraction × integer | W19 | full | 8 | `mult_frac_whole(_nv)` deal 4 × 4/6, 5 × 5/7 |
| B6.S4 Fraction of a quantity | W20 | full | 8 | `fraction_of_set`, `_nv {forms:[0,1]}`; 5 pre |
| B7.S7 Thousandths on a PV chart | W13 | gap | 8 | `thousandths_pv`; pre `value {band:99}` is thin, preBuild `decimal_pv` |
| B8.S6 Estimate area | W30 | gap | 8 | `area_estimate`; unit squares, area, compound shapes |
| B10.S4 Measure angles to 180° | W25 | partial | 8 | `protractor_read`; pre `temperature {forms:[1]}` (reading a scale) is a good find |
| B10.S5 Draw lines and angles | W25 | gap | 8 | `draw_angles`; two pre and a true note |
| B10.S6 Angles around a point | W31 | partial | 8 | `additive_angles {}` honest (two parts of 360°); `angles_point` |
| B11.S6 Reflection | W28 | partial | 8 | `geo_reflect` clause names the axes / later-grade form; `reflect_grid` |
| B12.S7 Subtract decimals, different dp | W14 | partial | 8 | Clause "different dp only some of the time" is what the items show |
| B12.S10 Multiply by 10, 100, 1,000 | W10 | full | 8 | 55.4 × 10, 25.1 × 1,000 and whole numbers |
| B13.S3 Count through zero in multiples | W38 | gap | 8 | `negative_count`; count in 2s / 5s / 10s, integer lines |
| B13.S4 Compare and order negatives | W38 | full | 8 | `compare_int`, `order_negatives` |
| **B15.S4 Estimate capacity** | W34 | partial | **7** | **Class K.** Its only related, `unit_conversions {units:[1]}`, has the why "metric conversions: L ↔ mL beside m and g", but `units:[1]` is customary: 30 of 30 fresh items are oz / lb / qt / gal / yd. `{units:[0]}` deals exactly the why (5 L = 5,000 mL, 3,000 g = 3 kg). Pre `area_unit_squares` is weak for capacity |

Sum 159 / 20 = **7.95**.

### Hardest 5 (from the ungraded pool)

| Step | Score | Reasons |
|---|---|---|
| B5.S3 2-digit × 2-digit | 8 | `multiply {tiles:22}` (95 × 67); the placeholder-zero partial is honest |
| B5.S8 4-digit ÷ 1-digit | 8 | `divide {tiles:41, regroup:'none'}` (6,741 ÷ 9); `box_division_hard` partial honest; the note puts the bus-stop layout on `vis_division_layouts` |
| B5.S9 Divide with remainders | 8 | `{regroup:'always'}` deals 4-digit remainders; `remainder_interpret`, `remainder_too_big` related |
| B7.S15 Equivalent F/D/P | 8 | Four directs. Minor: `order_fdp` includes thirds (2/3 vs 3/4 vs 80%), past the Y5 denominators |
| B1.S12 Round to 10, 100, 1,000 | 9 | Five exact directs; `rounding_table {places:[10,100,1000]}` |

Sum 41 / 5 = **8.20**. **All 32 sampled: 256 / 32 = 8.00; min 7.**

### Scan finds (class K: customary links on metric steps, every link of B8 / B10 / B14 / B15 scanned, 30 items each)

| Step | Score | Reasons |
|---|---|---|
| B15.S1 Cubic centimetres (W36) | 7 | Its only related, `area_perimeter:volume {band:30}`, deals 20 of 30 items in ft / in ("2 ft long, 2 ft wide, 3 ft tall") on a cm³ step. `{forms:[0], band:30}` deals "length = 3, width = 3, height = 2 … cubic units" |
| B15.S3 Estimate volume (W37) | 7 | The same related link and opts |
| B15.S4 | (above) | |

No other metric step has a customary link whose clause or why does not name it. With these, 34 steps: 270 / 34 = **7.94**.

## 3. Site lessons: all 21 graded

| # | Lesson (G4) | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|---|
| 1 | Place value: 10 times and one tenth | W05 | partial | 8 | `value {band:9999}`, `place_value_10x {power:[10]}` honest; `value_ten_times` |
| 2 | Multiply / divide multiples of 10 | W06 | partial | 8 | `mult_zeros {forms:[2]}` (6 × 20 only); `facts_times_tens`; why fixed |
| 3 | Extend growing shape patterns | W09 | partial | 8 | Number rule only; `growing_shape_patterns`. Minor: `count_by_step_up {step:[1]}` "Count in 3s" deals 3s and 4s |
| 4 | Find emergent features | W09 | partial | 8 | `patterns_notice`; related `pattern_relationship` |
| 5 | Follow a given rule | W09 | full | 9 | `number_patterns_rule {rule:false}` prints the rule; exact |
| 6 | Times as many | W10 | partial | 8 | Clause honest; `comparison_statements` |
| 7 | **How many times as many? (unknown multiplier)** | W10 | partial | **7** | **Class L.** Its only related, `algebra:tape_diagram {}` (new this round, replacing the F-dropped `mult_comparison_plain`), has the why "the bar model a times-as-many story is drawn with: one bar cut into equal parts beside the other". Every item (and every value of its `forms` option: joining, taking away, how many more) is an additive part-whole bar ("Lily has 70 cards and gets 68 more"). False why; the link does not share the idea |
| 8 | Divide and interpret the remainder | W11 | partial | 8 | Two honest partials; `remainder_too_big` related |
| 9 | Decompose a fraction | W13 | full | 8 | `decompose_fractions` with bars and click-all |
| 10 | **Add tenths and hundredths** | W18 | partial | **7** | **Class M (rule 5).** The partial is `frac_10_100 {}` with "never adds a tenths and a hundredths fraction", and the build proposes that form on `frac_10_100` **and** `frac_10_100_nv`. But `frac_10_100_nv` already deals it: 9 of 40 default items are `3/10 + 5/100 = ?/100 → 35/100`, and its schema already has forms value 2 "Add tenths and hundredths". The lesson lists that skill only as a related, with the why "renaming tenths as hundredths with no hundred square", which hides the additions. (On the print path `{forms:[2]}` does not filter: it still deals all four kinds, 6 of 20 additions — a generator defect, see section 6.) Correct entry: partial `frac_10_100_nv {forms:[2]}` "adds tenths and hundredths in numbers, but the forms value does not keep the page to them, and there is no hundred-square picture"; the build is "make forms:[2] filter + the pictured form on `frac_10_100`". Minor (carried from r5): related `add_decimal {decimals:2}` why "0.3 + 0.04" deals 94.7 + 34.66 |
| 11 | Points, lines, segments, rays | W21 | gap | 8 | `points_lines_rays` |
| 12 | Angles are additive | W28 | full | 8 | `additive_angles` exact |
| 13 | Line plots with fractions | W28 | partial | 8 | Reads only; `make_line_plot` |
| 14 | Customary capacity | W30 | partial | 8 | Minor (carried): pre `mass_volume_liquid {forms:[2]}` why "capacity" also sorts g / kg |
| 15 | Customary length and weight | W31 | partial | 8 | r5 row landed |
| 16 | Measurement word problems | W31 | partial | 8 | Two honest partials; `measure_word_four_ops` |
| 17 | 3D shapes (Reception source) | W38 | full | 8 | `name_3d_shapes` |
| 18 | Compare fractions (G2 source) | W38 | partial | 8 | r5 row landed; pre at Year 3 content |
| 19 | Divide a 1-digit number by 100 (G3 source) | W38 | partial | 8 | Clause honest (3-digit ÷ 100); `div10_small_numbers` |
| 20 | Hundredths (G3 source) | W38 | partial | 8 | `decimal_pv` |
| 21 | Order fractions (G2 source) | W38 | partial | 8 | r5 row landed; related `order_frac_numline` (same-denominator drag) fits |

Sum 167 / 21 = **7.95**; min 7.

The lessons section holds exactly the 21 Y5 entries of `site-lessons.json` (16 committee + 5 Support), with no tagFixes.
12 proposals used only by lessons have `steps: []` and carry `lessons` + `closes` (the lead must merge them by `lessons`
too, or into `STANDARD_PROPOSALS`).

## 4. Extraction audit (X1)

- **`ws-wrm-extract --site … --check`:** `wrm-steps.json up to date`, `site-lessons.json up to date`, **exit 0**.
- **Independent audit** (`siteaudit.cjs` on my own decode of the site's `__data` block): every own-grade pacing entry
  resolves to a step with the same title; every step is paced; every SUP / committee / no-block entry is a site lesson with
  its week and track; every exam / MAP entry is an assessment; every Support title is on a step's `supportIn` or is a lesson.
- **X1.1 Core titles with no WRM step:** G1 "Select money (US)", "Find the total (US)", "Count money - notes and coins (US)"
  (flag `above`) and G3 "Pounds, tens, ones and pence (US)" (`native`) are now site lessons with the site's flag. **Correct.**
  (The four G5 core titles "End-of-year investigation projects" etc. were already lessons, flag `other`.)
- **X1.2 Reviews by this grade's numbers:** G1 W28 (b4, s2, `rv`) → `Y2.B4.S2.site.taughtIn` review; G3 W22 (b10, s1) →
  `Y4.B10.S1.site.taughtIn` review; each with a disagreement naming the retitle ("Count money - notes and coins" vs
  "Count money - pounds (notes and coins)"; "Pounds, tens, ones and pence" vs "Write money using decimals"). The numbering
  matches each grade's own Money block, so this is the right reading; the second retitle is a large one and the
  disagreement says so. **Correct.**
- **X1.3 Support titles matching another grade's step:** the site has two G3 "Measure in grams" Support entries (sources G1
  and G2) and two G4 "Measure in centimetres" (sources K and G1). The G1-source ones already matched; the G2 / K ones are now
  recorded on `Y2.B7.S2` (supportIn G3) and `Y2.B6.S1` (supportIn G4) with a disagreement each. **Correct.**
- **Disagreements 14:** 8 EE-map gaps, 1 Teaching Guide file name, Y6.B11.S6 CCSS, the 2 review retitles and the 2 Support
  source mismatches. All real.
- **Ids stable:** against 0b06c22b, `site-lessons.json` removes exactly `G3|-|measureingrams`, `G4|-|measureincentimetres`,
  adds exactly the 4 money ids, and changes no other entry (field or note); the 34 assessments are identical.
  `wrm-steps.json`: the same 872 step ids; only `Y2.B4.S2.site` and `Y4.B10.S1.site` change (the review records).
- **Nothing on the site unaccounted for.**
- **The report's note on Y4 is inaccurate.** "The Y4 lane's links file still has a lesson for G3 'Measure in grams'": no
  `Y4.json` (in-repo, or on `origin/…-wip-wrm-tag-y4`) has a `lessons` section at all. The real lead action: when the Y4 lane
  adds lessons it takes the 23 `wrmYear: Y4` entries of `site-lessons.json`; "Measure in grams" (G2 source) is `Y2.B7.S2`,
  tagged by the Y2 lane. The same holds for Y1 (39 lessons) and Y6 (24): none of those lanes has a lessons section yet.

## 5. Merge (`merge6.mjs`, my own, plus a check of proposals)

In-repo `data/curriculum/links/{R,Y1,Y4,Y6}.json` and live `js/modules/wrm.js`, each lane read in its own encoding
(R / Y1: the partial clause in `why`, format-only).

| Check | Result |
|---|---|
| tagFixes | Y5 175, R 76, Y1 80, Y4 166, Y6 148 |
| key\|step written by 2+ lanes | **0**, so **0 real conflicts** |
| Each lane's own steps (direct = FULL, partial = PARTIAL, no stray live tag), alone / merged | Y5 0 / 0, R 0 / 0, Y1 0 / 0, Y4 0 / 0, Y6 0 / 0; none introduced by the merge |
| Foreign-year tagFixes | Y5 0. Y4 writes `patterns:count_by_step_up\|Y2.B1.S15` (Y4's, known) |
| Y5 tagFixes on a lesson | 0 |
| Proposal ids shared by 2+ lanes | 74, none with a different skill or kind |
| Y5 "reused" ids not in live `WRM_PROPOSALS` | 21; all exist in build-list.js or in Y4's file (`roman_numerals`, `improper_mixed_dir`, `dec_same_whole`, `coord_polygon_draw`, `div10_small_numbers`) |

**Real conflicts: 0.** Y4 vs the new step record: no conflict is possible today (Y4 has no lessons); see section 4.

## 6. Reproducibility

`git archive HEAD` unpacked twice into clean folders, built once with `WRM_TAG_DATA` and once with only a scratch `TMPDIR`.
Both logs are identical (136 steps 36 / 75 / 25; 21 lessons 4 / 16 / 1; 175 tagFixes; mergecheck OK; linkfit 874 links,
0 misfits; optcheck 0; OK) and both outputs have sha256 `1aca56d87b2c…`, identical to the committed Y5.json. No absolute
paths; no dependency outside the branch.

**Generator defect (record only, not Y5's to fix):** `fraction_operations:frac_10_100_nv {forms:[2]}` does not filter on the
print path: `itemMatchText` gives "6/10 + 6/100 = ?/100 => 66/100", which matches the form's pattern, yet the deal still
mixes all four kinds (6 of 20 additions). The forms acceptor is not applied to this skill.

## 7. Fix table (FAIL)

### Build-level

| # | Class | Change | Affected |
|---|---|---|---|
| K | Customary on metric steps | In `linkfit.mjs`, run the "customary units on a metric unit" check on **every** unit whose title or block is metric (Y5.B8, B10, B14 except S4, B15; and the metric site lessons), not only Support lessons, for pre **and** related (rule 18). Extend the why check: a why that says "metric", "L", "mL", "m", "g" must be true of the items | B15.S1, B15.S3, B15.S4 |
| L | False why on bar models | Why check: a why that claims "times as many" / "equal parts" / "multiplicative" must be true of the items (`tape_diagram` is additive in every form). Re-read every `tape_diagram` / `tape_diagram_plain` link | Lesson 7; B5.S11 (minor) |
| M | Existing option missed | Before a lesson or step says "never X", search the skill family's option schemas for X (`frac_10_100_nv` forms value 2). Rule 5 for lessons too | Lesson 10 |
| H′ | Gate holes | `unlikeCompare`: read the answer and payload too, and the words "greatest / least / order"; why-unit check: read the cited title's parentheses ("Equivalent masses (kilograms and grams)") | gate only |
| Doc | Report | Replace the "Y4 file still has a Measure in grams lesson" note with the real lead action (section 4) | Y5-report.md |

### Per entry (expected after the fix)

| Entry | Change | Expected |
|---|---|---|
| Y5.B15.S4 Estimate capacity | Related `unit_conversions {units:[1]}` → `{units:[0]}` (5 L = 5,000 mL, 3,000 g = 3 kg: exactly its why) | 8 |
| Y5.B15.S1 Cubic centimetres | Related `area_perimeter:volume {band:30}` → `{forms:[0], band:30}` ("cubic units", no ft / in) | 8 |
| Y5.B15.S3 Estimate volume | The same | 8 |
| Lesson 7 Unknown multiplier | Drop related `tape_diagram {}` (or replace it with `division:div_word_problems_plain {range:100}`: "how many times as many" is solved by dividing, 42 ÷ 7), and fix the note | 8 |
| Lesson 10 Add tenths and hundredths | Partial `fraction_operations:frac_10_100_nv {forms:[2]}` with the clause above; drop it from related; rescope `add_tenths_hundredths` to "make forms:[2] filter + a pictured add form on frac_10_100"; record the generator defect | 8 |
| B5.S11 | Drop related `tape_diagram {}` (additive bars on a × ÷ step) | (minor) |
| B2.S6 | Drop related `tape_diagram_plain` (own partial's plain twin) and `algebra_word_mixed` (deals the own partials' items), or say why | (minor) |
| B3.S3 | Pre `mult_properties {}` why "× 1 and commutative": set a form that deals those, or re-cite | (minor) |
| Lesson 10 / lesson 14 | Carried r5 minors: `add_decimal {decimals:2}` why "0.3 + 0.04"; `mass_volume_liquid {forms:[2]}` why "capacity" | (minor) |
| B10.S3 | Add `turns_and_angles` (Y3.B11.S1) to preBuild | (minor) |

With K, L and M fixed, every graded step and lesson is expected at 8 or better: step mean about 8.05, lesson mean about 8.05.

## What is right

- Every r5 row (G, F, H, minors, X1) landed at the source and holds on fresh seeds.
- The G and F gates are real checks (they fire on mutation); H is real for its main case.
- The extractor change is correct, deterministic, keeps every id stable and leaves nothing on the site unaccounted for.
- The build is reproducible from the branch alone, and the merge with every in-repo lane has 0 real conflicts.
