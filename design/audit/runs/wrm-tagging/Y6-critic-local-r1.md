# Y6 (Grade 5) tagging: independent local critic, round 1 (against BRIEF rules 1–19)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y6` at f2dd7afc. Data: `data/curriculum/links/Y6.json`, which has:
- 114 steps: 25 full, 69 partial, 20 gap;
- 171 direct or partial pairs;
- 507 pre links and 338 related links;
- 121 tagFixes and 79 proposals.

The helper's own critic passed it at 8.09, but under the old brief (rules 1–13). This round judges it against the current `BRIEF.md` on `origin/claude/sweet-newton-c8wrv1`: rules 1–19 plus the owner rulings.

The code is generators and `wrm.js` from `origin/claude/sweet-newton-c8wrv1` at e53677e0. Since the Y6 base (8f0c8114), no generator file and no `wrm.js` has changed.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y6/`.

| Seeds | Script | What it does |
|---|---|---|
| `7151009 + 233i`, 120 items | `tools/entry.mjs` via `tools/pool.mjs` | Every direct and partial entry, with the entry's own opts |
| `4403017 + 191i`, 80 items | same | Every pre and related link, with the link's own opts (`{}` when none) |
| `777 + 53i`, `9001 + 37i`, `50021 + 97i` | `tools/one.mjs` | Spot checks and fix verification |

Each entry runs in its own `node` process. In one process, the 115th entry (`mixed_number_theory`) hangs after the earlier generators have run, so state leaks between generators. Run on its own, it is fine.

Other tools:
- `tools/scan.py` checks the school-week content order, size, why claims and degenerate links.
- `tools/msim.mjs` is the merge simulation.
- `tools/y6weeks.json` holds the first-taught week of each step, from the "Grade 5" sheet of the xlsx.

The 425 unique entries produced 41,280 items. None timed out and none errored.

**Generator script: none.** The helper left nothing under `tests/scripts/wrm-tagging/` on this branch; the report says the tagFixes were "derived mechanically", but the script is not committed. So every fix below is a data fix, and the class-level fixes in §6 name the check to adopt from the other lanes (Y4's `mergecheck.mjs` and `linkfit.mjs`).

## Verdict: FAIL

| Measure | Result | Needed |
|---|---|---|
| Mean of the 25 graded steps | **7.02** | ≥ 8 |
| Steps below 7 | **6** | none |
| Systematic classes | **8** | none |

Distribution: 6 ×2, 6.5 ×4, 7 ×12, 7.5 ×6, 8.5 ×1.

**Why the old PASS does not carry over.** The 8.09 PASS predates rules 14–19. The file has almost no link opts: 844 of its 845 pre/related links carry none. It does not order links by school week, and Grade 5 teaches in a very different order from WRM:
- decimals W05–W09, before fractions W14;
- 2-step equations W12, but 1-step equations W35;
- drawing pie charts W26, but percentages and reading pie charts W36–W37;
- ratio W33–W35, but scale factors W19.

The merge also leaves two partial steps with full direct tags and 14 stale clauses.

## 1. Merge simulation (`tools/msim.mjs`, written from the `wrm.js` header)

**How the simulation reads the data.**
- It reads `SKILL_WRM` from `js/modules/wrm.js` on `origin/claude/sweet-newton-c8wrv1`. A string or `{step, note}` counts as full, and `{step, partial}` counts as partial.
- It applies the 121 tagFixes in order. The tagFixes have no `partial` clause field, so the clause comes from `why`, with the prefix `add as a partial cover: [missing]` stripped. On all 102 `partial` actions this gives exactly the Y6.json clause. The format is fragile, though (§6, class M).

**Transitions:** new→full 12, new→partial 42, full→partial 60, partial→full 2, full→removed 4, partial→removed 1.

**Checks that pass:**
- every key is live and every step exists;
- no pair is listed twice;
- no `add` lands on a full tag;
- no `remove` lands on a key that is still listed;
- nothing else stays tagged to a Y6 step;
- every verdict agrees with the step's build list and its missing clause.

**Result: 16 problems in 2 classes.**

| # | Problem | Pairs |
|---|---|---|
| M1 | **A partial step lists a FULL direct skill.** After the merge, `SKILL_WRM` says these skills fully teach a step that Y6.json itself calls partial | Y6.B1.S6 `integers:compare_int`, `integers:order_negatives` (they deal only the negative half; the 7-digit half is the missing clause). Y6.B9.S5 `conversions:d_to_p`, `conversions:p_to_d` (decimal ↔ percent only; fractions are the missing clause) |
| M2 | **Stale clause after the merge.** The live tag is already partial and Y6.json gives a new clause, but no `partial` tagFix carries it, so the old live clause survives | 14 pairs (below) |

The 14 M2 pairs, with the clause that survives the merge and the clause Y6.json gives:

| Pair | Clause after the merge (wrong) | Y6.json clause |
|---|---|---|
| `divisibility_sort` B2.S4 | "stating and applying the divisibility rules" | no rule for 25; the rule is printed |
| `mult_placeholder_zero` B2.S7 | "the whole 4-digit by 2-digit calculation" | deals only 2-digit × 2-digit and asks for the placeholder 0 |
| `long_div_2digit` B2.S12 | "remainders written as r, a fraction or a decimal" | exact quotients only |
| `estimate_products` B2.S16 | "all four operations" | mental methods for ×; 3-digit × 1-digit |
| `frac_word_problems` B3.S9 | "multi-step problems with unlike denominators" | one-step stories |
| `div_unit_frac_nv` B4.S4 | "a non-unit fraction divided by an integer" | also renaming first |
| `fraction_of_set_hard_nv` B4.S7 | "a page of find-the-whole only, with a bar model" | the bar model |
| `ratio_intro` B6.S4 | "linking a ratio to fractions of the whole" | part : whole but never 3/8 |
| `ratio_tables` B6.S10 | "recipes: scaling a list" | one pair; no non-integer factor |
| `function_table_hard` B7.S2 | "two operations in sequence and working backwards" | +/− first is missing |
| `compare_thousandths` B8.S1 | "the value of each digit within 1" | never digit value or partition |
| `percent_of_number` B9.S9 | "finding the percentage itself" | only the missing part; the 33% items are wrong |
| `pie_chart` B11.S3 | "reading fractions of the whole … tagged approximately" | reads printed percentages only |
| `coord_polygon` B13.S3 | "missing vertices and coordinates problems in four quadrants" | **first quadrant**; side lengths only |

Fix for M2: add a `partial` tagFix carrying the Y6.json clause for each of these 14 pairs.

Fix for M1, either way round:
- **B1.S6:** move `compare_int` and `order_negatives` to `partial` with the clause "comparing and ordering whole numbers to 10,000,000", and turn their tagFixes into `partial`; or make B1.S6 full once `big_numbers` is built.
- **B9.S5:** move `d_to_p` and `p_to_d` to `partial` with "fractions (any denominator) and their decimal and percent equivalents".

## 2. Classes found (whole-file scan plus reading items)

| Class | Count | Examples (step, link: what the items show) |
|---|---|---|
| A. **Links carry no opts** (rule 18) | 844 of 845 links (the one with opts: B13.S1 `number_line_int {forms:[0]}`) | Defaults deal 2- or 3-digit numbers on 6- and 7-digit steps, customary units on metric links, mixed variants. Classes B, E, F and G below follow from it |
| B. **False or stale size and content whys**: the why claims what the default items do not deal | 25 read and confirmed | See the list after this table |
| C. **Direct or partial without the opts its clause relies on** (rules 2, 7, 17) | 11 entries | See the list after this table |
| D. **Pre content taught later in Grade 5** (rule 19) | 13 links | 6 cite a later Y6 step as the source; 7 deal content first taught after the step's week. List after this table |
| E. **Related links far ahead of the school week, or beyond Grade 5** (rule 18: content and layout) | 21 links | See the list after this table |
| F. **Earlier learning listed only as related** (rule 14) | 8 links | B9.S3 `f_to_p`, `p_to_f`; B9.S4 `p_to_f`, `d_to_p`, `order_fdp`; B9.S5 `order_fdp`; B8.S1 `order_decimals`; B7.S9 `coordinate_q1`. Each why itself says "prior learning". Move them to `pre` |
| G. **Own build listed in preBuild** (rule 3: "Never put a step's own build proposal in its preBuild") | 11 steps | B1.S8 `negative_count`, B2.S6 `square_cube`, B10.S4 `area_triangle_grid`, B10.S7 `volume_cubes`, B11.S1 `line_graph`, B12.S5–S8 `angle_rules` (×4), B13.S4 `translate_grid`, B13.S5 `reflect_grid`. Drop the id from `preBuild`, or put the earlier-year proposal there instead (e.g. Y5's own line-graph proposal) |
| H. **Cites a step the skill is not tagged to** (after merging every lane file and SKILL_WRM) | 26 links | See the list after this table |
| I. **Fewer than 3 pre and no note** (rule 15) | 2 steps | B8.S4 (2 pre); B12.S1 (2 pre; its Y5 building blocks `identify_angles` and `measure_angles` are its own partials, so the step needs a note) |
| J. **Main building block missing from pre** (rule 14) | 5 of the 25 graded steps | See the list after this table |
| K. **Per-seed proportion in a clause** | 1 | B7.S4 `evaluate_expression_hard`: "half its coefficient items substitute a negative". On my seeds it is **3 of 25**. Write "some coefficient items" |
| L. **Size beyond the step** | 3 | B1.S1 and B1.S4 related `count_by_powers_of_10` deals up to **15,000,000** and has no band (options are only `step` and `dir`). B1.S1 is `full` at band 999,999, and 1,000,000 itself is never dealt; rule 7 says the step's end number must be dealt ("14–20 must include 20"). Make it partial, or add a 1,000,000 value to the band |
| M. **tagFix format and merge defects** | 16 (§1) | M1 + M2, plus no structured `partial` field (the clause lives in `why`) |

**B. False or stale whys (25).** These follow from class A:
- B1.S1, B1.S3 `combine` "Partition numbers to 1,000,000": items stop at 980.
- B1.S1, B1.S2 `place_value_disks` "Represent numbers to 10,000": 3-digit only.
- B1.S4, B1.S5 `pv_digit_drag` "Numbers to 1,000,000": 5-digit only.
- B1.S5 `compare` "to 1,000,000": 3-digit.
- B1.S6, B1.S7 `place_on_number_line` "Number line to 10,000": 2-digit, "Tap 69".
- B2.S4 `count_by_tables` "Multiples of 3": counts in 1s and 2s.
- B2.S8 `mult_placeholder_zero` "4-digit": 2-digit only.
- B2.S9 `div_remainders` "2-digit": items reach 6.
- B2.S11 `div_zero_in_quotient` "4-digit": 3-digit.
- B2.S7 `multiply` "column multiplication by 1 digit": "3 × 7 = ?" facts, no column.
- B2.S10 `mult_properties` "12 × 5 = 6 × 2 × 5": "What is 1 × 12?" (identity property).
- B9.S3 `missing_add_sub` "Complements to 100: 30% + 70%": "___ − 10 = 9".
- B9.S3, B9.S9, B5.S1 `place_value_10x` "10% and 1%" or "every metric conversion": whole numbers × 10 only.
- B5.S1, B5.S2 `double_num_line` "the double number line WRM draws for 1 kg = 1,000 g": miles/hours, dollars/pounds, "0.5 pancakes".
- B9.S9 `double_num_line` "amount | percent": the same miles/hours items.
- B10.S6 `composite_shapes` "parallelograms inside compound shapes": **0 of 80** parallelograms, all L and T shapes.
- B10.S6 `coord_polygon` "a parallelogram drawn on a grid": 0 of 80.
- B2.S6 `volume` "the volume of a cube": cuboids in cubic inches.
- B1.S4 `exponents_simple` "10² as repeated multiplication": "8² − 73 = −9".
- B8.S6 `unit_conversions` "to the larger unit is ÷ 10, 100, 1,000": fl oz→cups, feet→yards (customary).

**C. Entries without the opts their clause relies on (11).**
- B1.S2 `pv_digit_drag` and `expand`: no band. They deal 5-digit and 3-digit numbers, although the clause says "band stops at 999,999".
- B1.S3 `number_word_names {}`.
- B1.S5 `place_on_number_line {}`: "Tap 41".
- B1.S6 `compare`, `order_least_to_greatest`, `order_greatest_to_least`: 3-digit.
- B4.S3 `div_unit_fraction` and `div_unit_frac_nv`, and B4.S4 `div_unit_frac_nv`: **57–69 of 120** items are whole ÷ unit fraction (5.NF.B.7b, taught W19), not this step's fraction ÷ integer.
- B2.S15 four `order_of_operations` directs: no `range`, although the step's own note says "use Max Number 10–50".

**D. Pre content taught later (13).**
- The 6 that cite a later Y6 step:
  - B7.S3 (W11) `function_table_hard` cites B7.S2 (W12), and the why itself says "after this lesson";
  - B7.S5 (W12) `evaluate_expression` cites B7.S4 (W35);
  - B7.S8 (W12) `solve_eq_addsub` and `solve_eq_multdiv` cite B7.S7 (W35) as "previous step";
  - B7.S9 (W12) `evaluate_expression` cites B7.S4 (W35);
  - B11.S5 (W26) `pie_chart` cites B11.S3 (W37).
- The 7 that deal later content:
  - B7.S5 (W12), B10.S1 (W22) and B10.S2 (W22) `area`: 8 of 80 items are triangle area (W23);
  - B5.S4 (W22) `ratio_tables`: ratio, W33;
  - B2.S12 (W04) `frac_as_division`: W20;
  - B4.S5 (W18) `div_unit_frac_nv`: whole ÷ unit fraction, W19;
  - B3.S9 (W16) `estimate_frac_ops`: negative estimates, "1/5 − 1/3 ≈ −0.5".

**E. Related links far ahead or beyond Grade 5 (21).**
- Beyond Grade 5:
  - B1.S6 (W02) `ordering_rationals`: −1/3, −0.5, 6.NS.C.7;
  - B1.S8 `add_int`: 5 + (−12), 7.NS;
  - B2.S14 (W11) `paren_simple`: (83 + −26) ÷ 19;
  - B7.S2 (W12) and B2.S6 `evaluate_expression_hard`: "(a + 1)² at a = −3", 12 of 80;
  - B1.S4 (W01) `exponents_simple {}`: "8² − 73 = −9";
  - B3.S5, B3.S6, B3.S8 `estimate_frac_ops {}`: negative estimates.
- Percent of an amount (W36):
  - B4.S6 (W18) `percent_of_number`;
  - B11.S5 (W26) `percent_of_number`.
- Ratio (W33):
  - B5.S1, B5.S2, B5.S4, B5.S5 `double_num_line`;
  - B5.S4 and B6.S6 `equiv_ratios`;
  - B6.S1 `ratio_tables`;
  - B8.S9 (W09) `unit_rate_intro`;
  - B9.S5 (W20) `mixed_conversions`: ratio tables, unit rates and "50% of 90".
- Four quadrants (W31): B13.S1 (W13) `coordinate_graph`, a mix the why itself admits.

Not counted: next-step related links one week ahead (rule 5 allows them), such as B2.S7–S10 `long_div_2digit` (W03 → W04).

**H. Cites a step the skill is not tagged to (26).**
- B2.S1 `add_100k_mixed` and `sub_100k_mixed` → Y5.B2.S2 / S3.
- B2.S11 `div_zero_in_quotient` → Y5.B5.S8, and `div_remainders` → Y5.B5.S9.
- B2.S12 `div_remainders` and `remainder_too_big` → Y5.B5.S9.
- B3.S1 and B4.S5 `equiv_frac_nv` → Y5.B4.S1.
- B3.S8 `sub_mixed_like_nv` → Y5.B4.S16.
- B4.S7 `fraction_of_set_nv` → Y5.B6.S5.
- B6.S1 `repeated_add_to_mult` → Y1.B9.S5, and `mult_comparison_plain` → Y3.B4.S10.
- `mult_div_fact_family` → Y4.B5.S7, ×3 (B7.S1, B7.S2, B7.S7).
- B7.S1 `equal_sign` → Y2.B2.S20.
- B7.S9 `add_facts` → Y3.B2.S1.
- B8.S5 `skip_count_line` → Y3.B4.S1.
- B8.S9 `place_value_10x` → Y5.B12.S12.
- `frac_10_100` → Y4.B8.S1, ×6 (B8.S1, B9.S1–S5).
- B13.S1 `seq_2` → Y2.B1.S15.

Fix: either cite a step the skill is tagged to, or add the tag in that year's file.

**J. Main building block missing from pre (5 of 25).**
- B1.S2: no Y5 or B1.S1 6-digit skill; every pre is a Y2 or Y3 3-digit skill.
- B2.S7: no Y5 4-digit × 1-digit.
- B5.S2: no B8.S5 / B8.S6 decimal × and ÷ by 10, taught W07–W09.
- B7.S8: no Grade 4 "Find missing numbers", which is the real earlier block.
- B8.S4: no Y5 decimal + and −.

**Generator bugs found** (record them; do not fix them in this lane):
- `fraction_operations:div_unit_frac_nv`: the **form labels are swapped**.
  - `forms:[0]` "Unit fraction ÷ whole (1/3 ÷ 2)" deals "3 ÷ 1/3".
  - `forms:[2]` "Whole ÷ unit fraction" deals "1/3 ÷ 2".
  - The itemIndex-0 "Click ALL expressions equal to 2 ÷ 1/2" item ignores `forms`. With `{forms:[2,3]}`, 11 of 60 items are still whole ÷ unit fraction.
- `fraction_operations:estimate_frac_ops`: subtracts a larger fraction ("1/10 − 1/8 ≈ −0.5"; 3 of 80). Its option id is `task`, not `forms`. `{task:[0]}` gives 0 negatives in 80.
- `order_of_operations:three_ops_no_paren` / `two_ops_no_paren`: give negative answers ("21 × 2 − 47 + 1 = −4"). Even at Max Number 50: "2 × 13 − 37 = −11".
- `order_of_operations:paren_simple`: deals negative operands ("(62 + −28) ÷ 17"), 3 of 120 at the default and 1 of 150 at Max Number 20.
- `order_of_operations:exponents_simple`: with no `step` option, "8² − 73 = −9". `{step:[0]}` gives 0 negatives.
- `patterns:count_by_powers_of_10`: goes past 10,000,000 (15,000,000); there is no band.
- The helper's three are confirmed open: `percent_of_number` 33%, the `mass_volume_liquid` kg dial, and the `percent_visual` "shade" form.

## 3. Grades

The 20 random steps were drawn with `random.seed(61010)` (Python's `random.sample` over the step ids in file order). The 5 hardest are my choice: B1.S6, B2.S15, B5.S1, B1.S8, B6.S6.

Each score covers four things: direct and opts, an honest verdict, pre and related (rules 14–19), and the build. One overall score per step.

| Step (week) | Score | Defects |
|---|---|---|
| B1.S2 Numbers to 10,000,000 (W01) | 6.5 | The partials `pv_digit_drag` and `expand` have no band (C). All 4 pre are Y2/Y3 3-digit skills; the main block, Y5 numbers to 1,000,000 or B1.S1 at band 999,999, is missing (J). The `place_value_disks` why "to 10,000" is false (B) |
| B1.S5 Number line to 10,000,000 (W02) | 7 | Partial `place_on_number_line {}` deals "Tap 41" (C). The `compare` and `pv_digit_drag` whys claim 1,000,000 but deal 3- and 5-digit numbers (B) |
| B2.S4 Rules of divisibility (W10) | 7.5 | Honest partial. `count_by_tables` "Multiples of 3" counts in 1s and 2s; `multiples` "÷5 and ÷10 rules" deals 9s and 11s (B) |
| B2.S6 Square and cube numbers (W33) | 6.5 | Own build `square_cube` in preBuild (G). Related `evaluate_expression_hard` substitutes negatives (E). The `volume` "cube" items are cuboids (B) |
| B2.S7 4-digit × 2-digit (W03) | 6.5 | Pre `multiply` "column … by 1 digit" deals "3 × 7" (B). No Y5 4-digit × 1-digit pre (J). The 2nd and 3rd pre are fact-sized |
| B2.S10 Division using factors (W03) | 7 | Honest gap. Pre `mult_properties` why "12 × 5 = 6 × 2 × 5" deals "1 × 12" (B) |
| B3.S7 Add mixed numbers (W16) | 8.5 | Full verified (4 2/5 + 1 4/6 = 6 1/15; regrouping). Pre W16-grounded; related fine |
| B4.S5 Mixed questions with fractions (W18) | 7.5 | Honest partial. Pre `div_unit_frac_nv` is half whole ÷ unit fraction (W19) (D) |
| B5.S2 Convert metric measures (W21) | 7 | Related `double_num_line` deals miles/hours, not kg/g, and is ratio content (B, E). No B8.S5/S6 decimal ×/÷ 10 pre (J) |
| B7.S2 2-step function machines (W12) | 7.5 | Partial and clause right. Related `evaluate_expression_hard` "(a + 1)² at a = −3" (E) |
| B7.S8 Solve 2-step equations (W12) | 6.5 | 2 of 6 pre cite B7.S7 (W35) as "previous step" (D). The school teaches 1-step equations 23 weeks later. Grade 4 "Find missing numbers" / `missing_factor_or_addend` is not in pre (J) |
| B8.S2 Place value: integers and decimals (W06) | 7.5 | Honest partial. Pre `compare` "Y1 Less than…" is a weak link; otherwise fine |
| B8.S6 Divide by 10, 100, 1,000 (W07) | 7 | Related `unit_conversions {}` "÷ 10, 100, 1,000" deals customary ÷ 8 and ÷ 3 (B; fix `{units:[0]}`, verified 0 of 60 customary). Related `div_decimal` deals 0.8 ÷ 0.4 |
| B9.S3 Understand percentages (W36) | 7 | `missing_add_sub` "Complements to 100" deals within 20 (B). `f_to_p` / `p_to_f` cited as prior learning but listed as related (F) |
| B9.S5 Equivalent FDP (W20) | 6 | Full direct tags on a partial step (M1). Related `mixed_conversions` deals ratio tables and % of an amount (E). `order_fdp` "prior learning" listed as related (F) |
| B9.S9 Percentages: missing values (W37) | 7 | Related `double_num_line` "amount \| percent" deals miles/hours (B). `place_value_10x` "10% and 1%" deals × 10 whole numbers (B) |
| B10.S6 Area of a parallelogram (W23) | 7 | Honest gap. Both related "parallelogram" whys are false: 0 of 80 each (B) |
| B10.S7 Volume: counting cubes (W25) | 7 | Own build `volume_cubes` in preBuild (G) |
| B11.S1 Line graphs (W30) | 7 | Own build `line_graph` in preBuild (G) |
| B13.S1 The first quadrant (W13) | 7.5 | Full verified (q1, to 10). Related `coordinate_graph` mixes four quadrants (W31) (E) |
| **Hardest:** B1.S6 Compare and order any integers (W02) | 6 | M1: `compare_int` and `order_negatives` are direct on a partial step. The 3 partials have no band and deal 3-digit numbers (C). Related `ordering_rationals` deals negative fractions and decimals (E). The `place_on_number_line` why is false (B) |
| **Hardest:** B2.S15 Order of operations (W11) | 7 | Full, but the direct items include "21 × 2 − 47 + 1 = −4" and "(62 + −28) ÷ 17" (2–3%). No `range` on opts, and even Max Number 50 leaves "2 × 13 − 37 = −11". It should be partial with that clause plus a generator fix, or full only after the fix |
| **Hardest:** B5.S1 Metric measures (W21) | 7 | Full plausible (`mass_volume_liquid {forms:[0,2]}` avoids the kg dial). Pre `reading_ruler` reads inches on a metric step, which rule 18 forbids by name. Related `double_num_line` false (B, E) |
| **Hardest:** B1.S8 Negative numbers (W32) | 7 | Own build in preBuild (G). Partial `sub_int` deals "−3 − (−13)" (7.NS) as a cover. Related `add_int` "5 + (−12)" (E) |
| **Hardest:** B6.S6 Use scale factors (W19) | 7.5 | Honest gap. Related `equiv_ratios` "7 : 2", ratio notation, W33 (E) |

**Mean 7.02** (random 20: 7.05; hardest 5: 6.90). Below 7: B1.S2, B2.S6, B2.S7, B7.S8, B9.S5, B1.S6.

## 4. What is sound

The things the old critic checked hold:
- every key is live;
- no list is longer than 8, and pre ∩ related is empty;
- verdicts are internally consistent;
- full verdicts on fraction ±, mixed numbers, 2-step equations, the first quadrant and common factors/multiples deal what the step asks;
- the missing clauses on partials are mostly exact (the clause derivation reproduces all 102 `partial` actions).

The defects are in the links and the merge, not the direct verdicts.

## 5. Fix list (specific)

**Merge**
- M1 (§1): B1.S6 `compare_int` and `order_negatives` → partial; B9.S5 `d_to_p` and `p_to_d` → partial. Change their tagFixes to `partial` with those clauses.
- M2 (§1): add 14 `partial` tagFixes carrying the Y6.json clauses.
- Give every tagFix a structured `partial` field instead of the clause buried in `why`.

**Opts on direct and partial entries**
- B1.S2 `pv_digit_drag {band:999999}`, `expand {band:999999}` (verified 6-digit).
- B1.S3 `number_word_names {band:999999}`.
- B1.S6 `compare`, `order_least_to_greatest`, `order_greatest_to_least {band:999999}`.
- B1.S5 `place_on_number_line`: the largest span its schema allows, and say so in the clause.
- B4.S3 / B4.S4 `div_unit_frac_nv`:
  - `{forms:[2,3]}`, which is what really deals unit fraction ÷ whole, because of the label bug;
  - say in the clause that the itemIndex-0 click item is still whole ÷ unit fraction;
  - drop `div_unit_fraction` (no variant option) or move it to related for B4.S3.
- B2.S15: add `range:20`, and make the step partial ("1–3% of items give a negative answer or a negative operand") until the order-of-operations generators are fixed.
- B1.S1: partial, or a band value of 1,000,000.

**Pre (rule 19)**
- B7.S8: replace the two B7.S7 cites with `number_ops_mixed:missing_factor_or_addend` (Grade 4 W01 "Find missing numbers") and `algebra:function_table_hard` (B7.S2, W12). Keep `solve_eq_*` as related.
- B7.S5 and B7.S9: drop `evaluate_expression` (B7.S4, W35). Use B7.S1 / B7.S2 `function_table_*` and `two_ops_no_paren {range:20}`.
- B7.S3: drop `function_table_hard` (B7.S2, W12). Use `function_table_easy`.
- B11.S5: drop `pie_chart` (W37). Use `fraction_of_set` and `angles_lines:additive_angles` (360° around a point, Grade 4 W31).
- B7.S5, B10.S1, B10.S2: `area` → `area_unit_squares`, or `area` with a rectangles-only option if one exists (none was found; else propose one).
- B5.S4: drop `ratio_tables`. Use `unit_conversions {units:[0]}` and `length_metric`.
- B2.S12: drop `frac_as_division` (W20).
- B4.S5: `div_unit_frac_nv {forms:[2,3]}`.
- B3.S9: `estimate_frac_ops {task:[0]}` (verified 0 negatives).

**Related (rule 18)**
- Drop, or replace with a W-appropriate link:
  - `ordering_rationals` (B1.S6);
  - `add_int` (B1.S8);
  - `paren_simple` (B2.S14);
  - `percent_of_number` (B4.S6, B11.S5);
  - `double_num_line` (B5.S1, B5.S2, B5.S4, B5.S5, B9.S9);
  - `equiv_ratios` (B5.S4, B6.S6);
  - `ratio_tables` (B6.S1);
  - `unit_rate_intro` (B8.S9);
  - `mixed_conversions` (B9.S5);
  - `coordinate_graph` (B13.S1).
- Fix the opts on these:
  - `evaluate_expression_hard` (B7.S2, B2.S6): drop it, or band `{band:20}` and say "positive values only" after checking;
  - `exponents_simple` (B1.S4): `{step:[0]}`, verified;
  - `estimate_frac_ops` (B3.S5, B3.S6, B3.S8): `{task:[0]}`;
  - `unit_conversions` (B8.S6): `{units:[0]}`.

**Rule 14 moves**
- Move the 8 class F links from related to pre.
- Add the class J building blocks:
  - B1.S2 `pv_digit_drag {band:999999}` (B1.S1);
  - B2.S7 `multiply` at a 4-digit band, or the Y5 4-digit × 1-digit skill;
  - B5.S2 `place_value_10x {op:"x", decimals:true}` (B8.S5, W07);
  - B8.S4 `add_decimal` from Y5 (Grade 4 W13–W14) with a note.

**Whys (class B)**
- Rewrite each of the 25 to what the items deal, or set the band that makes the claim true: `combine {band:999999}`, `place_value_disks {band:9999}`, `compare {band:999999}`.
- Delete the two "parallelogram" related links on B10.S6.

**preBuild (class G):** remove the step's own build id on all 11 steps.

**Citations (class H):** re-cite the 26 links to a step the skill is tagged to, or add the tag in that year's file.

**Rule 15:** add pre or a note on B8.S4 and B12.S1.

**Clause:** B7.S4 `evaluate_expression_hard` "half its coefficient items" → "some coefficient items".

**Range:** B1.S1 and B1.S4 related `count_by_powers_of_10`: drop it (no band; it reaches 15,000,000), or set `{step:[0,1]}`.

## 6. Generator-level fixes

There is no generator script on this branch, so each class fix is a check to commit with the data. Adopt the other lanes' tools; the class letters are the ones in §2.

| Class | Check to add |
|---|---|
| A, B, E, L | A link checker like Y4's `linkfit.mjs` (on `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4`, `tests/scripts/wrm-tagging/`), with a Grade 5 table (below). It generates 80–150 items per link with its opts, flags content first taught after the step's week, and flags any why naming a size, unit, denominator or shape the items do not reach. My `scan.py` is a starting point (its size test needs a Grade 5 rule) |
| C | Reject a direct or partial entry whose clause names a band or variant that its opts do not set |
| D | Reject a pre whose cited step is taught later (`y6weeks.json`) |
| F | Reject a related link whose why says "prior learning" or cites an earlier-year step; it goes to pre |
| G | Reject build ∩ preBuild |
| H | Reject a cite whose step the key is not tagged to, using SKILL_WRM plus every year's links file |
| M | Adopt Y4's `mergecheck.mjs`, generalised to Y6.json. It asserts M1 (no direct on a partial step) and M2 (every changed clause has a `partial` tagFix). Emit `partial` as a field |

Grade 5 first-taught weeks, from the "Grade 5" sheet:

| Week | Content |
|---|---|
| W03 | 4-digit × 2-digit |
| W04 | 2-digit divisor and long division |
| W07 | decimal × integer |
| W08 | decimal ÷ integer, decimal × or ÷ decimal |
| W11 | order of operations, letters |
| W12 | 2-step equations |
| W15–W16 | unlike-denominator ± |
| W17 | fraction × fraction, fraction ÷ integer |
| W19 | whole ÷ unit fraction, scale factor |
| W20 | fraction as division |
| W21 | metric decimal conversions |
| W23 | triangle and parallelogram area |
| W25 | volume formula |
| W26 | mean, pie charts |
| W27–W28 | angle sums, vertically opposite angles |
| W31 | four quadrants |
| W33 | ratio |
| W35 | 1-step equations, substitution |
| W36 | percent of an amount |
| never | negative-number arithmetic |

Content met in Grade 4 is available from W01: numbers to 1,000,000, thousandths, percentages as fractions and decimals, negatives on a line, squares and cubes, first-quadrant coordinates, translation, and customary units.
