# Y5 (US Grade 4) WRM tagging — independent critic, round 4 (brief rules 1–19)

Critic: independent critic (Opus, medium effort), 2026-10-16. Critique only: `Y5.json` and the build were not edited.
Graded: `data/curriculum/links/Y5.json` at f2bf0c31 (branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y5`; 136 steps, 85
proposals, 170 tagFixes, 805 links), against `BRIEF.md` rules 1–19 and the owner rulings, after the builder's fix round
for `Y5-critic-local-r1.md` (FAIL 6.30).

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** 17 of 50 graded steps are below 8; the lowest is **5** (Y5.B14.S1) |
| Mean ≥ 8 | **No.** Random 20: **7.60**. The 25 steps from local r1: **7.60**. All 50 graded (with the 5 hardest): **7.58** |
| 0 real merge conflicts | **Yes.** 0 real conflicts. The 119 problems the builder reports are all format-only, see below |
| Build reproducible | **Yes.** Two clean `git archive` builds are byte-identical to the committed Y5.json. No dependency outside the branch |

This is a big step up from 6.30. Every r1 class is gone or much smaller, and the build, the merge and the proposal
reconciliation are now sound. What still fails is four systematic classes that the builder's gates cannot see:

- **A.** The `denoms` option is ignored by the click-all and sort forms.
- **B.** Notes are still used as opts on the B14 metric partials.
- **C.** The size rule drops true building blocks.
- **D.** Re-optioned links keep a why that names the old range.

Each is described below with its fix.

## Method

- **Items.** Every item came from the print path: `generateQuestionFor`, seeded, with `itemIndex` and `itemCount: 20`.
  The seeds were fresh, none from the builder's runs:
  - directs and partials: 8 items each (seed 61637, +53), plus 40 to 60 per entry in the scans;
  - links: 5 items each (31337, +71) for reading, and 20 to 40 in the scans.

  The scan scripts are in my scratch folder, not the repo:
  - `dscan.mjs` checks school-week content and unrelated denominators on all 805 links and every direct and partial;
  - `whysize.mjs` checks the size a why names against the items;
  - `den*.mjs`, `cust.mjs` and `dp.mjs` are the targeted probes.
- **Sample.**
  - 20 random steps (Python `random.Random(77031)`, drawn from steps not graded in local r1).
  - All 25 steps local r1 graded: every one scored < 8 there except B4.S12, which is included too.
  - The 5 hardest calls in this round: B1.S3, B4.S5, B7.S8, B11.S2, B14.S5.
  - 50 steps in all.
- **School weeks** come from `prior.mjs` on the Grade 4 sheet. It agrees with the r1 critic's table.
- **Criteria** (per step, as in local r1 and Y4 r13): right directs and opts; honest verdict and clause; pre that is useful,
  filtered, in week order, ≥ 3 and has the main building block first; related that shares the idea and fits.

## 1. Previous defects and proposal reconciliation

### Local r1 defect classes

| # | r1 class | Status at f2bf0c31 |
|---|---|---|
| 1 | Links with no opts | **Fixed in form.** 196 links carry opts, and linkfit generates every link. But see class D: 148 links were re-optioned without updating their why |
| 2, 3, 18 | Content taught too early; pre cites a later step | **Fixed** for the r1 content table. The dscan found no customary, percent, negative, decimal-rounding or volume content before its week in any link (only false positives such as "around", "90°-180°") |
| 4 | Range beyond the step | **Fixed.** But the same rule now over-drops (class C) |
| 5 | Later-grade content | **Mostly fixed.** Still present: **unrelated denominators (5.NF.A.1) in 13 links and 10 directs/partials** (class A); `integers:add_int` formal notation (B13.S5 related); `fraction_operations:mult_scaling` (5.NF.B.5, B6.S1 related); 2-digit divisors in `division:remainder_interpret` stories (B5.S6 related; the B5.S11 partial's clause does not name it). linkfit's divisor check reads only "÷ 13" text, not stories |
| 6, 13 | False or stale why | **Partly fixed.** Class D: about 20 whys name a range 10× or more above what the link deals. Plus 5 false content whys (fix table) |
| 7 | Overstated FULL | B3.S1, B4.S11, B8.S4 and B7.S3 are fixed. **New:** B4.S13 and B4.S17 (class A) |
| 8 | tagFix derivation | **Fixed.** Merge is 0 in every combination |
| 9 | Partial step with full directs | **Fixed.** The build fails on it |
| 10 | Notes used as opts | **Not fully fixed.** These still have empty opts while their clauses name the option: B14.S1 `unit_conversions` and `unit_conversion_word`, B14.S2 `capacity`, B14.S3 `unit_conversions` and `unit_conversion_word`, B7.S2 `f_to_d` (clause says `{denoms:[5]}`, opts empty), and B12.S5/S6 ("Decimal Places 1/2"). The B14 ones matter: at W31–W32 they deal **50–80% customary items** (64 oz → lb, 12 gal → qt, pints → quarts). `{units:[0]}` (unit_conversions), `{units:[1]}` (unit_conversion_word) and the metric value on `capacity` give 0 customary items. Also B8.S1 direct `perimeter {}` deals ft stories at W28 (6/40) |
| 11 | Own build in preBuild | **Fixed** |
| 12 | < 3 pre with no note | **Fixed in form.** But duplicate links hide it: B15.S3 lists `area_unit_squares {}` twice (2 distinct pre, no note), and B3.S1 lists `count_by_tables {constant:[3]}` twice |
| 14 | Degenerate links | **Fixed** |
| 15 | Proposals without `closes` | **Fixed.** Every build carries `closes`, and every partial or gap step has `envision` |
| 16 | Owner-ruling conflicts | **Fixed** (see the reconciliation below) |
| 17 | `time_convert` partly built | **Fixed.** Narrowed to days/weeks/months/years and smaller → larger. B14.S5 carries `{units:[0]}` |
| 18 | Division bracket before W11 | **Fixed** |
| 19 | Building block listed as related | **Fixed** for the named cases. But class C drops some building blocks altogether |

### Proposal reconciliation (checked against Y4.json at 7314ee1e, and R/Y1 at 06320cc4)

- **`roman_numerals`** is right. `roman_12`, `roman_100` and `roman_1000` are renamed onto it, and Y5.B1.S1 links it. Its
  spec is byte-identical to Y4's: kind, skill `placevalue:roman_numerals`, option "band 12 | 100 | 1,000 | 3,999;
  direction read | write | both", name, teaches, representation and family. Only steps, reused, source and closes are
  added. This is the owner's single skill with four bands, read and write.
- **`improper_mixed_dir`** is right. `improper_direction` is folded into Y4's option
  (`dir: "to-improper" | "to-mixed" | "both"`), with an identical spec. B4.S4 and B4.S5 each carry their own direction
  clause. B4.S6 is also listed among its steps.
- **`coord_polygon_draw`** is right. Y4.json has no `coord_missing_vertex`. Y4's `coord_polygon_draw` teaches "plotting
  given vertices and joining them … and finding the missing vertex of a square or rectangle", which is exactly the
  B11.S2 lesson (WRM vocab: vertex). Reusing it is better than a new id.
  - One small gap: B11.S2's clause also asks for "points on a line from coordinates", which the proposal does not teach.
  - Either drop that half of the clause, or add it to the envisioned option.
- **No proposal is redefined differently from a passed lane.** All 23 ids Y5 shares with R, Y1, Y4, Y2, Y3 or Y6 are the
  same on kind, skill, option, name, teaches and representation.
  - The exception is `thousandths_pv`. Y5 PATCHes its representation (r1 class 16), while Y6 keeps the live text. The
  lead should take Y5's version.
  - A note for the lead: Y6 redefines `reflex_angles` differently from Y5. Y6 is not a passed lane; this is Y6's to fix.
- **Overlaps with a passed lane under a different id** (the lead should fold these at merge):
  - Y5 `dec_compare_same` and Y4 `dec_same_whole` are two options on `decimals:compare_decimal`/`order_decimals` for
    "same whole part". Y4's version mixes 1 and 2 places; Y5's adds "same number of places". They should be one option
    with values (same whole part / same places).
  - Y5 `estimate_big_place` and Y4 `estimate_within_10k` are two bands of one place/limit option on
    `estimate_sums_diffs`. They are compatible.
  - For information, with the Y2–Y3 lane: Y5 `kg_g_convert` and `l_ml_convert` overlap Y3 `metric_mass_capacity`
    (kg↔g and l↔ml on `capacity`).

## 2. Per-step grades (50 steps)

Each step gets one overall score. Its reasons are on the four criteria: directs/opts, verdict/clause, pre and related.

### Random 20 (seed 77031)

| Step | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|
| B1.S9 Number line to 1,000,000 | W07 | partial | 8 | Honest partials, and the `nl_20` build fits. Pre `place_on_number_line {span:100, band:1000}` cites "to 10,000" but deals 3-digit (minor) |
| B2.S1 Mental strategies | W08 | partial | 7 | Partials are honest (`compensation` is 2-digit; `add_sub_100s` is whole hundreds). Pre `more_less_100 {}` cites B1.S7 "10 … 100,000 more or less" but deals only 10/100 more within 1,000. `{step:1000}` exists and deals 4-digit. Related `add_sub_10s` (50 + 10) is trivial |
| B2.S7 Compare calculations | W09 | partial | 7 | Clause and build are good. Pre `addition:equal_sign {}` is cited as "Compare number sentences", but **all 40 items are "a + b = ?"** (17 + 14 column). That is a false why. Only 1 related |
| B3.S5 Prime numbers | W02 | full | 8 | FULL is right (prime/composite sort, test, click). Pre are factors, GCF, mult_properties and odd/even. Related are T-chart, divisibility, factor links |
| B3.S7 Cube numbers | W37 | partial | 8 | Clause is honest (21³; no cubes of cubes). Pre: squares (B3.S6), arrays, properties. Related `volume {}` is in week (W36) |
| B3.S9 Divide by 10, 100, 1,000 | W10 | full | 8 | `place_value_10x {op:'/', power:[10,100,1000]}` deals whole-number quotients, which is the step. Pre: × 10/100/1,000, ÷ 10 facts, unit form. Related `value {}` (3-digit) is weak |
| B4.S2 Equivalent to a non-unit fraction | W15 | full | 8 | Directs deal non-unit and unit starts; fair. Pre: number line, shade, write a fraction. preBuild `equiv_from_unit` is the previous step's build, which is legitimate |
| B4.S3 Recognise equivalent fractions | W15 | full | 8 | Directs are exact (click-all equivalents; yes/no). Pre and related are good |
| B4.S8 Compare/order fractions > 1 | W17 | gap | 8 | Gap is right. Pre: order, compare, improper ↔ mixed, mixed number line. Related is the next step |
| B5.S10 Efficient division | W12 | partial | 8 | Clause is honest. Pre: divide, factor links, area model 2by1, box division, missing ×/÷. Related: estimate, factors, check |
| B6.S1 Unit fraction × integer | W19 | partial | 8 | Clause and build are exact. Pre is strong: repeated addition, decompose, like ±. Related `mult_scaling` is 5.NF.B.5 (later grade, minor) |
| B7.S3 Fractions and decimals (hundredths) | W21 | partial | 8 | r1 doubt resolved. Partials are honest; the `frac_hundredths_dec` build fits. Pre and related fit the week |
| B7.S4 Equivalent fractions and decimals | W21 | full | 8 | FULL is fair. `f_to_d {}` / `d_to_f {}` show percent tiles in 9/40 items, one week before W22 (minor) |
| B7.S10 Round to the nearest whole | W35 | gap | 8 | Gap and build are right. Pre: compare 3 dp, decimal line, rounding. Related: the next step's rounding skills |
| B8.S4 Area of rectangles | W28 | partial | 8 | r1 fixed: partial `area {forms:[0,1], band:25}` plus `area_rect_only`. Pre: arrays and perimeter. Related: area and perimeter, distributive, decompose |
| B10.S7 Angles on a straight line | W31 | partial | 7 | Clause is fine. Only related is `graphs:pie_chart {}`: its items are percents ("What percent chose Mon?"), not angles. Pre `subtract {}` (18 − 9) for "180 − known parts" is filler |
| B11.S5 Lines of symmetry | W28 | full | 8 | Directs are exact. The note explains why there are no related links. Pre are partition, name and classify shapes |
| B12.S3 Add/subtract decimals across 1 | W13 | partial | 7 | Partials are honest. The only related, `compare_decimal {decimals:1}` (82.5 vs 29.7), does not share the idea ("crossing the whole"). Pre are good |
| B13.S5 Find the difference | W38 | partial | 7 | Partial `sub_int {forms:[1], band:10, ticks:'one'}` is honest. Related `integers:add_int {}` deals the formal 15 + (−22) = −7 (7.NS.A.1) with chips: later grade |
| B14.S1 Kilograms and kilometres | W31 | partial | **5** | Class B: partials `unit_conversions {}` and `unit_conversion_word {}` have no opts. **20/40 and 32/40 items are customary** (oz/lb, gal/qt, ft/in) at W31, on a metric step. The clauses name `units [0]` and "metric kg/km stories", which the opts do not set. Related `multiply {}` "× 1,000" deals 804 × 6. Pre `mass_volume_liquid` item: "0 kg … Mass = ? kg → 0" |

Sum 152 / 20 = **7.60**.

### Steps graded in local r1 (all 25)

| Step | r1 | Score | Reasons |
|---|---|---|---|
| B1.S1 Roman numerals to 1,000 | 6 | 8 | Fixed: `roman_numerals`; combine/expand `{band:999}` in pre; words and unit form in related. `add_sub_100s` pre is a stretch but its why is honest |
| B1.S11 Compare/order to 1,000,000 | 7 | 8 | Fixed: pre carry 99,999 / 999,999 bands. Related `number_word_names` why says "compare numbers given in words", but the items only name |
| B3.S1 Multiples | 5 | 7 | Verdict and build are fixed (`multiples_2digit`). **Pre lists `count_by_tables {constant:[3]}` twice.** `mult_facts` (the times-table building block) was dropped for a why mismatch, not re-optioned to `{constant:[2,4,8]}` as r1 asked |
| B3.S10 Multiples of 10, 100, 1,000 | 5 | 7 | Pre fixed. Pre `multiples {forms:[0]}` says "Multiples of 5 and 10" but deals multiples of 2, 6, 8, 9. Related `more_less_100 {}` says "count in 100s and 1,000s" but deals 10/100 more within 1,000 |
| B4.S11 Add fractions, total > 1 | 5 | 7 | Verdict and build fixed. Class A: `add_frac_unlike {denoms:[2]}` deals 45/60 "click all sums > 1" items that pair **unrelated** denominators (3/5 + 3/8, 4/5 + 5/6). The clause does not say so. Related `add_mixed_unlike {}` (default denoms) is unrelated too |
| B4.S12 Add to a mixed number | 8 | 7 | The clause on `add_mixed_unlike {denoms:[2]}` says "related denominators with {denoms:[2]}", which is false for 25/40 items (1 1/2 + 3 1/3). Pre `add_frac_unlike {denoms:[2]}`: same issue |
| B4.S13 Add two mixed numbers | 6 | **6** | **Overstated FULL (class A).** Direct `add_mixed_unlike {denoms:[2]}` deals 28/60 click-all items with 2 + 3, 4 + 3, 2 + 5 pairs (2 1/3 + 3 1/4). `add_mixed_like` / `_nv` are like denominators only, so related-denominator mixed addition is never dealt cleanly |
| B5.S1 4-digit × 1-digit | 7 | 8 | Fixed: pre `multiply {tiles:31}` / `{tiles:21}`, area 21, × 10, arrays, 9s |
| B5.S11 × and ÷ problems | 5 | 7 | Fixed: directs → partials. Class C: `multiply {tiles:21}` (2-digit × 1-digit, the building block r1 asked for) was **dropped** ("size 873 > 270"). `remainder_interpret` stories divide by 12–17 (5.NBT.B.6) and its clause does not say so |
| B5.S6 Problems with × | 6 | 7 | Same class C drop (`multiply {tiles:21}`, `area_model_mult`). Pre: scaling, properties, 7s. Related `remainder_interpret` (÷ 13, ÷ 17) is later grade |
| B6.S5 Fraction of an amount | 7 | 8 | Fixed: percent related gone; `mult_facts {constant:[12]}` |
| B6.S6 Find the whole | 6 | 8 | Fixed: `{forms:[1]}`; percent related gone |
| B7.S6 Thousandths as decimals | 5 | 8 | Fixed: preBuild, W35 related gone. Pre `value {band:99}` is filler; only 1 related |
| B7.S9 Any decimals ≤ 3 dp | 7 | 8 | `order_decimals {decimals:3}` mixes places in 19/60 items and `compare_thousandths` has 0.290 vs 0.29 (19/60). FULL holds |
| B8.S2 Perimeter of rectilinear shapes | 6 | 8 | Fixed |
| B8.S3 Perimeter of polygons | 6 | 7 | `multiply {}` removed as asked. But the replacement r1 asked for, `mult_facts` (sides × length), was **dropped** ("size 132 > 100", class C), so the regular-polygon building block is gone |
| B9.S1 Draw line graphs | 7 | 8 | Fixed (four-quadrant related gone) |
| B9.S2 Read line graphs | 7 | 8 | Fixed |
| B9.S4 Two-way tables | 7 | 8 | Fine |
| B10.S8 Lengths and angles in shapes | 6 | 8 | Fixed |
| B10.S10 3-D shapes | 5 | 8 | Fixed (3 partials, degenerate link gone, Grade 6 related gone) |
| B12.S4 Add decimals, same dp | 6 | 7 | `{decimals:1}` is recorded. Pre `add_10k_regroup {band:100}` cites "Add two 4-digit numbers" and deals the **same items** as pre `add_1k_regroup {band:100}` (46 + 35): a duplicate in effect, with a false why |
| B12.S8 Efficient decimal strategies | 6 | 8 | Fixed. Single related (`make_a_ten`) is weak |
| B12.S9 Decimal sequences | 5 | 8 | Fixed |
| B14.S6 Calculate with timetables | 6 | 8 | Fixed (`{units:[0]}`) |

Sum 190 / 25 = **7.60**.

### Hardest 5 (this round)

| Step | Score | Reasons |
|---|---|---|
| B1.S3 Numbers to 100,000 | 7 | The directs-to-partials move is right. Class D, 3 false-size whys: pre `place_value_disks {band:999}` cites "Numbers to 10,000"; pre `expand {}` cites "to 10,000" (3-digit); related `compare {}` says "compare to 100,000" (3-digit) |
| B4.S5 Mixed → improper | 8 | `improper_mixed_dir` reuse is right; pre are good |
| B7.S8 Same-dp compare/order | 7 | Clause is honest. Pre `placevalue:compare {band:99}` is filler. Build `dec_compare_same` duplicates Y4's `dec_same_whole` (fold) |
| B11.S2 Coordinates problem solving | 8 | `coord_polygon_draw` reuse is right; "points on a line" in the clause is uncovered (minor) |
| B14.S5 Convert units of time | 7 | Fixed: `{units:[0]}`. Pre `multiply {}` says "× 60, × 24, × 7" but deals 804 × 6 |

Sum 37 / 5. **All 50: 379 / 50 = 7.58. Min 5.**

## 3. Merge simulation (my own script)

My script is `mergesim.mjs` in my scratch folder, not the repo. It merges the tagFixes of Y5 + R + Y1 + Y4 into the live
`js/modules/wrm.js` `SKILL_WRM`. That file is identical, b2860e8b, on the y5, y4 and r-y1 branches. Each lane is read in
its own encoding:

| Lane | `add` | `partial` | `full` | `opts` | `remove` |
|---|---|---|---|---|---|
| R, Y1 (their own mergecheck) | tag FULL, or drop the partial flag | clause = `t.partial ?? t.why` | — | — | remove |
| Y4, Y5 | FULL, or PARTIAL when `partial` is present | clause = `t.partial` | drop the flag | no change | remove |

After the merge, every lane's steps must come out as its file says: status, clause and verdict. Any tagFix a second lane
writes to the same key and step must agree.

| Mode | Y5 | R | Y1 | Y4 | Problems introduced by merging |
|---|---|---|---|---|---|
| Each lane in its own encoding | 0 | 0 | 0 | 0 | 0 |
| Every lane read in the Y5 encoding (the builder's ported checker) | 0 | 69 | 50 | 0 | 0 |

- **Real conflicts: 0.** No two lanes write the same key and step, no lane removes a tag another lane wants, and no Y5
  tagFix touches a non-Y5 step.
- **The builder's 119 are format-only.** All 119 (69 R + 50 Y1) are "clause after the merge = undefined". R/Y1 encode
  the clause in `why` and have no `partial` field. Read in their own encoding, they are 0, and each lane alone gives the
  same count as the merge.
- **Outside Y5:** Y4 writes one tagFix on a Y2 step (`patterns:count_by_step_up` on Y2.B1.S15). It does not touch Y5.
- Merging also with Y2, Y3 and Y6: Y5 stays at 0. Y2 and Y3 have their own clause-format problems, 43 and 66, from the
  same R/Y1 style.

## 4. Reproducibility

`git archive HEAD` was unpacked into two clean folders. In each, `WRM_TAG_DATA=<own dir> python3
tests/scripts/wrm-tagging/build.py` ran in about 80 s. Each build printed: 136 steps (40 full / 71 partial / 25 gap), 85
proposals (20 new / 65 reused), 170 tagFixes, 30 pre re-cited, 148 links re-optioned, 107 dropped, then
`mergecheck: OK`, `linkfit … 0 misfits`, `optcheck … 0 problems` and `OK`.

The two outputs are **byte-identical** to each other and to the committed `data/curriculum/links/Y5.json`. The build
reads only repo files: `wrm-steps.json`, the xlsx, `wrm.js`, `build-list.js` and `y5_r0.json`. It needs python3 with
openpyxl, and its scratch defaults to `$TMPDIR/wrm-tag-Y5`. No dependency outside the branch.

## 5. Dropped and re-optioned links (rule 19, pre ≥ 3)

107 links were dropped: 39 pre and 68 related. Most drops are right (customary or percent before its week, axis
reflection, decimal × decimal). The following lost **true building blocks** (class C):

| Step | Dropped pre | Reason given | Why it is a building block |
|---|---|---|---|
| B5.S6, B5.S11 | `multiplication:multiply` (`{tiles:21}`: 2-digit × 1-digit, Grade 3), `area_model_mult` | "size 873 > 255/270" | The step's ceiling came from the deficient partial (table-fact stories), while the step itself asks for multi-digit × (the clause says so). r1 asked for exactly this link |
| B8.S3 | `multiplication:mult_facts` | "size 132 > 100" | Regular-polygon perimeter is sides × length. The gap and partial ceiling defaulted to 100 |
| B3.S1, B3.S5, B3.S7 | `multiplication:mult_facts` | "why names 8 but only 17 of 100 items" | Should have been re-optioned to the named table (`{constant:[2,4,8]}`), not dropped. Multiples are the times-tables |
| B12.S12 | `division:missing_mult_div` | "size 550 > 100" | Missing values in ×/÷ is the step's idea; `{range:100}` exists |

The 148 re-optioned links keep their old why (class D). About 20 whys name a range at least 10× what the link now deals.
Examples:
- B1.S2, B1.S3, B1.S4 and B1.S5 pre `place_value_disks` / `pv_digit_drag` / `expand` `{band:999}` or `{}`: they cite
  "to 10,000" and deal 3-digit numbers;
- B1.S3, B1.S13 and B1.S14 related `compare {}`: they claim "to 100,000" or "to 1,000,000" and deal 3-digit numbers;
- B1.S4 related `combine {}`: claims "standard form to 1,000,000" and deals 3-digit numbers;
- B2.S6 related `sub_wp_1m_plain {band:100}`: claims "stories to 1,000,000";
- B5.S1 related `divide {}`: "4-digit ÷ 1-digit", items ≤ 98;
- B12.S4 pre `add_10k_regroup {band:100}`: "Add two 4-digit numbers";
- B2.S1 pre `more_less_100 {}`: "… 100,000 more or less", items within 1,000.

The scan is `whysize.mjs`, in my scratch folder (not the repo).

## 6. Fix table (FAIL)

### Build-level (one change each; all affected steps then re-graded)

| # | Class | Change to build.py / linkfit.mjs / spec | Steps affected |
|---|---|---|---|
| A | `denoms` ignored by click-all/sort forms (verified with `{denoms:[2]}`: `add_frac_unlike` 45/60, `sub_frac_unlike` 45/60, `add_frac_unlike_nv` (sort tiles), `add_mixed_unlike` 28/60, `sub_mixed_unlike` 26/60 items with unrelated pairs). No `level` value removes these forms | (1) Add "unrelated denominators ± (5.NF.A.1): a pair a/b ± c/d where neither of b, d divides the other" to linkfit's `laterGrade`. (2) Run the content and week checks on **direct and partial** items too, not only links. (3) Spec: see the step rows below. (4) New option proposal `denoms_all_forms` (option on `fraction_operations:add_frac_unlike`, also `sub_frac_unlike`, `add_mixed_unlike`, `sub_mixed_unlike` and the `_nv` twins): "the denominator family is honoured by the click-all and sort forms too". Its closes: "click-all/sort items pair unrelated denominators (2 1/3 + 3 1/4)" | B4.S9–S17 |
| B | Notes as opts | Spec `setopts`: B14.S1 and B14.S3 `unit_conversions {units:[0]}` and `unit_conversion_word {units:[1]}`; B14.S2 `capacity {units:[<metric value>]}` (check with cust.mjs: 0 customary); B7.S2 `f_to_d {denoms:[5]}` as its clause says, or drop `{denoms:[5]}` from the clause; B12.S5 `sub_decimal {decimals:1}` and B12.S6 `add_decimal {decimals:2}` (the values each clause judged); B8.S1 direct `perimeter {forms:[0,1]}` (no ft stories at W28). Gate: any opts-like token in `missing` (`units [n]`, `{…}`, "Decimal Places n") must equal the entry's opts | B14.S1–S3, B7.S2, B12.S5–S6, B8.S1 |
| C | Size rule drops building blocks | For a partial or gap step, the size ceiling is the step's intended range (title, or the clause's own example: "4-digit × 1-digit" = 9,999 × 9), never the deficient partial's items. A pre whose why names a table is re-optioned to `{constant:[…]}` before it may be dropped. Re-run; expect `multiply {tiles:21}` back in B5.S6/B5.S11, `mult_facts` in B8.S3 and B3.S1 | B3.S1, B3.S5, B3.S7, B5.S6, B5.S11, B8.S3, B12.S12 |
| D | Re-option keeps a stale why | When linkfit changes a link's band or range, rewrite the size words in the why, or cite the lower step that matches the new band (e.g. "Y4.B1.S2 Partition numbers to 1,000" for `{band:999}`). Add the check in `whysize.mjs` (claimed N ≥ 10 × items' max → misfit) to linkfit | ~20 links, mostly B1 |
| E | Duplicates | Dedupe pre and related by key + opts. Treat two links whose 100 items are identical as one (B12.S4 `add_1k_regroup` and `add_10k_regroup {band:100}`) | B3.S1, B15.S3, B12.S4 |

### Per step (exact changes and expected scores)

| Step | Change | Expected |
|---|---|---|
| Y5.B4.S13 | `to_partial('fraction_operations:add_mixed_unlike', "related denominators only on the calculate items; the click-all and sort items ignore {denoms:[2]} and pair unrelated denominators (2 1/3 + 3 1/4)")`. Keep `add_mixed_like` and `add_mixed_like_nv` as **partial** too ("like denominators only"). Verdict: partial; missing: "adding two mixed numbers with related denominators on a page that stays inside one family"; build `denoms_all_forms` | 8 |
| Y5.B4.S17 | The same for `sub_mixed_unlike {denoms:[2]}` ("… (1 1/2 − 3/10 pairs; 26/60 click-all items)"), `sub_mixed_like` and `sub_mixed_like_nv` partial; build `denoms_all_forms` | 8 |
| Y5.B4.S10 | Clauses of `add_frac_unlike` and `_nv`: delete "the denominators are related as WRM wants"; add "click-all and sort items ignore {denoms:[2]} (3/5 + 1/8)". Build += `denoms_all_forms` | 8 |
| Y5.B4.S11 | Same clause addition. Related `add_mixed_unlike {}` → `{denoms:[2]}`; it keeps the click-all issue until `denoms_all_forms`, so the alternative is `add_mixed_like` | 8 |
| Y5.B4.S12, B4.S14, B4.S15 | Clauses: replace "related denominators with {denoms:[2]}" with "related on calculate items only; click-all/sort items pair unrelated denominators". Build += `denoms_all_forms` | 8 |
| Y5.B4.S9, S12, S13, S14, S15, S16 links | Replace `add_frac_unlike` / `sub_frac_unlike {denoms:[2]}` and `add_mixed_unlike` / `sub_mixed_unlike {}` links with `add_fractions_like` / `sub_fractions_like` / `add_mixed_like` / `sub_mixed_like`, or linkfit drops them once A(1) is in | — |
| Y5.B14.S1 | `unit_conversions {units:[0]}`, `unit_conversion_word {units:[1]}`; clauses as now. Related `multiply {}` → `multiplication:mult_zeros {forms:[0]}` with why "× 10, × 100", or `place_value_10x {op:'x', power:[1000]}` "× 1,000". Replace pre `mass_volume_liquid {}` if its "0 kg" item persists | 8 |
| Y5.B14.S2, B14.S3 | The metric `units` value on `capacity`, `unit_conversions` and `unit_conversion_word` | 8 |
| Y5.B5.S6, B5.S11 | Pre `+ multiplication:multiply {tiles:21}` (why "Y4.B5.S9 Multiply a 2-digit number by a 1-digit number, Grade 3"), placed first. B5.S11 clause on `remainder_interpret` += "stories divide by 12–17 (2-digit divisors, 5.NBT.B.6)". Related `remainder_interpret` on B5.S6 → `division:div_word_problems_plain` | 8 |
| Y5.B8.S3 | Pre `+ multiplication:mult_facts {band:100}` (or `{constant:[5,6,8]}`) "sides × length for a regular polygon", placed first | 8 |
| Y5.B3.S1 | Remove the duplicate `count_by_tables`. Pre `+ multiplication:mult_facts {constant:[2,4,8]}` (Y3.B3.S15) and `count_by_tables {constant:[3,6,9]}` | 8 |
| Y5.B3.S10 | Pre `multiples {forms:[0]}`: why → "list multiples (times-table multiples)", or an option set that deals 5 and 10. Related `more_less_100 {step:1000}` with why "1,000 more or less" | 8 |
| Y5.B2.S1 | Pre `more_less_100 {step:1000}` (deals 4-digit ± 1,000). Drop related `add_sub_10s` or replace it with `add_sub_100s`-style 1,000s | 8 |
| Y5.B2.S7 | Drop pre `addition:equal_sign` (it deals a + b = ?). Use `algebra:balance_addsub` in pre (move it from related) and add a related such as `order_of_operations:compare_expressions {}` | 8 |
| Y5.B1.S3 | Pre `place_value_disks {band:9999}` and `expand {band:9999}`, which fit W05 and B1.S2. Related `compare {band:99999}` | 8 |
| Y5.B12.S4 | Drop pre `add_10k_regroup {band:100}` (same items as `add_1k_regroup`), or give it `{band:9999}` with the 4-digit why. Add `decimals:decimal_nl_drag`-style or `frac_10_100` pre to keep ≥ 3 | 8 |
| Y5.B12.S3 | Replace related `compare_decimal` with `decimals:sub_decimal {decimals:1}` / `add_decimal {decimals:1}` ("the column form of the same calculation") | 8 |
| Y5.B10.S7 | Replace related `pie_chart` with `angles_lines:additive_angles {forms:[0]}`-style "angles in a right angle", or `measure_angles`. Pre `subtract` → `subtraction:subtract_100` or similar 3-digit-from-180 | 8 |
| Y5.B13.S5 | Drop related `integers:add_int {}` (formal 7.NS notation). Keep `abs_value` and `temperature` | 8 |
| Y5.B14.S5 | Pre `multiply {}` → `multiplication:mult_facts {constant:[6,7]}` "× 6, × 7 facts (60 = 6 × 10; 7 days)", or fix the why | 8 |
| Y5.B7.S8 | Fold `dec_compare_same` into Y4's `dec_same_whole` as a value "same places" (note it for the lead). Replace pre `placevalue:compare {band:99}` with `decimals:compare_decimal {decimals:1}` | 8 |
| Y5.B15.S3 | Remove the duplicate `area_unit_squares`. Add a third pre (`multiplication:arrays_groups {}` or `area_perimeter:area {forms:[0,1], band:25}`), or a "Pre-skills are few" note | 8 |
| Y5.B11.S2 | Drop "and points on a line" from `missing` and the coord_polygon_draw `closes`, or add it to the envisioned option | 9 |

Then rebuild, run the gates, and have a fresh-seed critic re-grade. With A to E in place, every graded step above is
expected at 8 or better, and the mean at about 8.1.

## What is right

- The build is now a real generator: deterministic, gated by mergecheck, linkfit and optcheck, and reproducible from
  the branch alone.
- tagFixes are derived and merge-safe across every lane.
- Roman numerals, the improper/mixed direction and the coordinate proposals are reconciled exactly with Y4.
- Every partial or gap step has an envisioned build with `closes`.
- The r1 week table is enforced on all 805 links.
- All 23 r1 sampled-step fixes were applied (B3.S1's `mult_facts` was later lost to class C).
- Most of the sample now scores 8.
