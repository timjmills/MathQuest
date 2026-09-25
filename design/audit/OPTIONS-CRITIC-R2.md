# Option Panel Critic — Round 2 (2026-09-25)

Independent critic. **Rubric:** `design/audit/OPTIONS-RUBRIC.md` (O1 sense · O2 difficulty · O3 support · O4 works ·
O5 clarity; pass = every criterion ≥ 8 and no cap). **Previous round:** `design/audit/OPTIONS-AUDIT.md` (0 / 256 pass).
Report only: no app code was changed.

**Tree measured:** `ea62d7b` (HEAD moved to `0de3edd` during the run; `git diff ea62d7b 0de3edd -- js` is empty, so the
measured JavaScript is HEAD's). Working tree clean under `js/`. Default Max Number 100, Decimals 0.

## Method and evidence

| Evidence | How | Scope |
|---|---|---|
| Machine (O4) | `node tests/scripts/ws-options-verify.cjs --report` (rewrote `design/audit/OPTIONS-VERIFY.md`); `mult_chart_easy` timed out under load and was re-run alone (27 / 27 values pass) | 589 skills with a panel, 4,043 values |
| Option model (O1, O2, O5) | `offeredOptionsFor()` dumped for every live skill in bare node (ids, labels, values, defaults, help line, group) | all 596 live skills |
| Live panel (O1–O3, O5) | teacher mode → Sets → the skill's real **Options** button → `openSkillOptionsPanel` popover, at **1280** and **420**; measured control count, off-screen / clipped selects, horizontal overflow, the sample question before and after changing the first control, console errors | **100 skills, every category** (● in the table); 22 screenshotted at both widths in the scratchpad `opt-critic/` folder |
| Promise probes (O4) | seeded `generateQuestionFor` + `buildSheet` with chosen values and combinations the verifier does not try | money, subtraction across zeros, decimals, multiply, fact titles, + / − bands |

## 1. Results

| | |
|---|---|
| Skills graded | **596** (every live skill; 100 of them opened live) |
| **Pass (O1–O5 all ≥ 8, no cap)** | **65** |
| Fail | 531 |
| Live sample pass / fail | 16 / 84 |
| Verifier: values pass / fail | 4042 / 1 (the one failure is a load time-out that passes on re-run) |
| Verifier: values it could **not** check for a difference ("generator not reproducible") | 605 values on 46 skills |
| Verifier soft warnings the rubric treats as hard (OC4 "Up to N" but the answer exceeds N) | 68 values on 52 skills |
| Panels with **no support control** | 436 of 589 |

Fail reasons (a skill can fail on several): **O3** 439 · **O1** 202 · **O2** 314 · **O4** 70 · **O5** 98.

Round 1 → round 2: panels went from 210 / 583 skills to **589 / 596**, and 4,042 / 4,043 values now pass the machine gate. The
panels exist; what is missing is the **support** half of the owner's rule (O3 fails on 3 of every 4 skills), a real
**difficulty ladder** on ~200 skills whose only control is the measured Max Number or "What the items ask", and several
controls that **break the skill's own name** without renaming the sheet.

### Average score per family

| Family | Skills | Pass | O1 | O2 | O3 | O4 | O5 |
|---|---|---|---|---|---|---|---|
| counting | 4 | 2 | 8.5 | 7.8 | 7.3 | 8.0 | 9.0 |
| comparing | 4 | 1 | 8.5 | 7.5 | 6.5 | 9.3 | 9.0 |
| composing | 17 | 0 | 8.6 | 7.5 | 5.8 | 9.5 | 8.9 |
| counting_mixed | 1 | 0 | 7.0 | 5.0 | 5.0 | 4.0 | 9.0 |
| addition | 59 | 6 | 8.6 | 7.3 | 7.7 | 9.4 | 7.8 |
| subtraction | 54 | 2 | 8.6 | 7.2 | 7.7 | 8.9 | 7.6 |
| multiplication | 23 | 3 | 8.7 | 7.8 | 6.8 | 8.3 | 8.9 |
| division | 22 | 0 | 8.0 | 7.6 | 6.0 | 8.4 | 8.9 |
| integers | 10 | 0 | 8.0 | 7.3 | 5.6 | 9.7 | 9.0 |
| number_ops_mixed | 7 | 1 | 6.7 | 6.0 | 6.0 | 7.4 | 9.0 |
| fractions | 27 | 0 | 8.7 | 7.9 | 5.8 | 9.4 | 9.0 |
| fraction_operations | 39 | 13 | 8.8 | 8.0 | 6.9 | 9.6 | 9.0 |
| decimals | 11 | 0 | 7.2 | 6.6 | 5.8 | 9.5 | 7.4 |
| conversions | 16 | 0 | 8.3 | 7.4 | 5.9 | 9.7 | 9.0 |
| frac_dec_mixed | 4 | 0 | 7.0 | 5.0 | 5.0 | 8.5 | 7.8 |
| shapes_early | 17 | 3 | 8.4 | 7.1 | 6.3 | 9.9 | 8.8 |
| area_perimeter | 13 | 0 | 7.9 | 7.7 | 5.8 | 6.5 | 9.0 |
| angles_lines | 7 | 0 | 7.9 | 6.3 | 5.9 | 9.7 | 9.0 |
| shapes_classify | 6 | 1 | 7.8 | 6.5 | 6.2 | 10.0 | 8.8 |
| coordinates | 10 | 0 | 7.8 | 7.3 | 5.9 | 9.7 | 9.0 |
| measurement | 47 | 11 | 8.6 | 7.6 | 7.1 | 9.3 | 8.9 |
| geo_mixed | 3 | 0 | 7.0 | 5.0 | 5.0 | 8.3 | 7.7 |
| graphs | 10 | 0 | 7.8 | 7.1 | 5.9 | 9.8 | 9.0 |
| data_analysis | 9 | 1 | 8.2 | 7.7 | 6.1 | 9.3 | 8.9 |
| probability | 2 | 1 | 7.5 | 7.0 | 7.0 | 10.0 | 8.5 |
| data_mixed | 1 | 0 | 7.0 | 5.0 | 5.0 | 10.0 | 9.0 |
| patterns | 16 | 1 | 8.4 | 8.2 | 6.1 | 8.5 | 9.0 |
| algebra | 23 | 0 | 8.2 | 8.0 | 5.9 | 6.5 | 8.7 |
| order_of_operations | 12 | 0 | 7.8 | 7.3 | 5.9 | 7.8 | 9.0 |
| placevalue | 16 | 6 | 8.9 | 8.6 | 7.0 | 9.6 | 8.9 |
| number_sense | 27 | 13 | 8.6 | 8.0 | 7.8 | 9.1 | 9.0 |
| number_theory | 14 | 0 | 6.9 | 6.7 | 5.9 | 5.3 | 9.0 |
| algebra_mixed | 7 | 0 | 7.0 | 5.0 | 5.0 | 7.6 | 8.7 |
| all_mixed | 8 | 0 | 7.0 | 5.0 | 5.0 | 8.3 | 7.0 |
| vocabulary | 50 | 0 | 7.0 | 6.0 | 6.0 | 10.0 | 9.0 |

## 2. What the machine gate does not see

The verifier says 4,042 / 4,043 values pass. That number overstates O4:

1. **"Differs from the default" is not "does what it says".** `measurement:money_count` What to count = "Notes, totals to
   500" passes (the items differ) while, in Plain currency, every total is 2–40 and no note appears; in US dollars the printed
   sheet shows twelve $100 notes (1,200 > 500) although "Coins at most" is 6, under the header "I Can count coins".
2. **605 values on 46 skills were never checked for a difference** — the generator ignores the seed, so the verifier fell
   back to predicates only (every mixed pool, `nl_add`, `nl_sub`, the `*_nv` fraction twins, `seq_2`, `seq_10`,
   `solve_eq_addsub`, `area_unit_squares` …). "Pass" there is no evidence the control changes the page.
3. **68 values say "Up to N" and deal answers above N** (logged as warnings; the rubric's OC4 makes them hard):
   `sub_across_zeros` "Up to 100" deals 408 − 89 = 319, `div_zero_in_quotient` 912 ÷ … = 405, `number_ops_mixed:mixed` "Up to 10"
   → 55, `counting_all` "Up to 10" → 327, every `number_theory` factor skill, most of `algebra`, `area_perimeter`,
   `order_of_operations`. The measured Max Number bounds an operand there, not the answer.
4. **The printed title ignores the fact set (P-31) — still open from round 1 (#28).** 124 values on 14 skills: `add_facts`
   Add = {6} prints "I Can add facts to 20"; the same for `sub_facts`, `mult_facts`, `div_facts`, `mult_chart`, `nl_mult`,
   `nl_div`, `count_by_tables`, `div_remainders`, `box_division_*`, `area_model_div_*`, `remainder_too_big`.
5. **Combinations are never tried.** Subtraction "Across zeros: Every item" + "Regrouping: Never" deals no zero at all;
   "Totals to 25" + "Notes, totals to 500" is accepted.

## 3. Scores — skill × O1–O5

● = opened live at 1280 and 420. Caps: rubric §3. Defect lines for every failing skill are in §5.

| Skill | Options shown | O1 | O2 | O3 | O4 | O5 | Caps | Pass |
|---|---|---|---|---|---|---|---|---|
| ● `counting:count_objects` | band, objects, orientation, level | 9 | 8 | 9 | 9 | 9 |  | **pass** |
| ● `counting:count_sequence` | band, dir, level | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| ● `counting:number_seq_fill` | step, dir, shape, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| ● `counting:mixed_counting` | members, range, level | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| ● `comparing:compare_groups` | dir, band, level | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| ● `comparing:compare_objects` | dir, task | 9 | 7 | 6 | 9 | 9 |  | fail |
| ● `comparing:classify_count` | band, tiles | 9 | 9 | 6 | 10 | 9 |  | fail |
| `comparing:mixed_comparing` | members, level | 7 | 5 | 5 | 9 | 9 |  | fail |
| ● `composing:number_bonds` | band, unknown | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| ● `composing:make_ten` | level | 9 | 7 | 9 | 10 | 9 |  | fail |
| `composing:teen_compose` | level | 9 | 7 | 9 | 10 | 9 |  | fail |
| `composing:tens_foundation_visual` | band | 9 | 8 | 6 | 9 | 9 |  | fail |
| `composing:hundreds_chart_fill` | band, tiles | 9 | 9 | 6 | 9 | 9 |  | fail |
| ● `composing:ten_frame_build` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `composing:ten_frame_build_teen` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| ● `composing:base10_build` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `composing:base10_regroup` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `composing:base10_build_hundreds` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| ● `composing:odd_even` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `composing:select_even_odd` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| ● `composing:number_word_form` | wordform, range | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `composing:fraction_number_line` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `composing:whole_as_fraction` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `composing:compose_whole` | parts | 9 | 7 | 6 | 10 | 9 |  | fail |
| `composing:mixed_composing` | members, level | 7 | 5 | 5 | 9 | 9 |  | fail |
| `counting_mixed:counting_all` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| ● `addition:add_facts` | constant, notation, band, support | 9 | 9 | 9 | 7 | 9 |  | fail |
| `addition:add_sub_10s` | task, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `addition:add_sub_100s` | task, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `addition:add` | notation, band, regroup, unknown | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `addition:add_word_problems` | response, pictures, forms, range | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `addition:add_word_problems_plain` | forms, range | 9 | 9 | 5 | 9 | 9 | OC8 | fail |
| ● `addition:add_sub_fact_family` | range | 5 | 5 | 6 | 9 | 9 | OC9 | fail |
| `addition:number_families_add` | band, level | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| ● `addition:add_three` | band, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `addition:comparison_word` | response, range | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `addition:equal_sign` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| ● `addition:add_5_pictures` | pictures | 9 | 7 | 9 | 10 | 9 |  | fail |
| `addition:add_10_no_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| ● `addition:add_10_regroup` | notation, band, regroup, level | 9 | 9 | 9 | 10 | 7 |  | fail |
| `addition:add_10_mixed` | notation, band, regroup, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_20_no_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_20_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_20_mixed` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_50_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| ● `addition:add_50_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_50_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| ● `addition:add_1k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_1k_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_1k_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_10k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_10k_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_10k_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100k_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_100k_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `addition:add_1m_no_regroup` | band, regroup, level | 9 | 9 | 9 | 9 | 7 |  | fail |
| `addition:add_1m_regroup` | band, regroup, level | 9 | 9 | 9 | 9 | 7 |  | fail |
| `addition:add_1m_mixed` | band, regroup, level | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `addition:add_wp_10` | pictures, band | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `addition:add_wp_10_plain` | band | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| ● `addition:add_wp_20` | band, pictures, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_wp_20_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_50` | band, pictures, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_wp_50_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_100` | band, pictures, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_wp_100_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_1k` | band, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| ● `addition:add_wp_1k_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_10k` | band, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_wp_10k_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_100k` | band, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `addition:add_wp_100k_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `addition:add_wp_1m` | band, support | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `addition:add_wp_1m_plain` | band | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `addition:nl_add` | unknown, range | 9 | 9 | 5 | 8 | 9 | OC8 | fail |
| `addition:number_line_add` | range | 5 | 5 | 5 | 10 | 9 | OC9 OC8 | fail |
| `addition:cloze_addition` | range | 5 | 5 | 6 | 9 | 9 | OC9 | fail |
| ● `addition:mixed_addition` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| ● `addition:add_column_multi` | tiles | 9 | 7 | 6 | 10 | 9 |  | fail |
| `addition:add_missing_digit` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| `addition:fact_family_sort` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| ● `subtraction:sub_facts` | constant, notation, band, support | 9 | 9 | 9 | 7 | 9 |  | fail |
| `subtraction:subtract` | notation, band, regroup, unknown | 9 | 9 | 6 | 9 | 9 |  | fail |
| `subtraction:sub_word_problems` | response, pictures, forms, range | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `subtraction:sub_word_problems_plain` | forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| ● `subtraction:missing_add_sub` | unknown, task, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| `subtraction:sub_5_pictures` | pictures | 9 | 7 | 9 | 9 | 9 |  | fail |
| `subtraction:unknown_start_wp` | range | 5 | 5 | 5 | 4 | 9 | OC9 OC8 OC4 | fail |
| `subtraction:sub_10_no_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `subtraction:sub_10_regroup` | notation, band, regroup, level | 9 | 9 | 9 | 10 | 7 |  | fail |
| `subtraction:sub_10_mixed` | notation, band, regroup, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_20_no_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_20_regroup` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `subtraction:sub_20_mixed` | notation, band, regroup, support | 9 | 7 | 9 | 10 | 7 |  | fail |
| `subtraction:sub_50_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_50_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_50_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100_mixed` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_1k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| ● `subtraction:sub_1k_regroup` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_1k_mixed` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_10k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_10k_regroup` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_10k_mixed` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100k_no_regroup` | band, regroup, level | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100k_regroup` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_100k_mixed` | band, regroup, level, zeroPlace | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_1m_no_regroup` | band, regroup, level | 9 | 9 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_1m_regroup` | band, regroup, level, zeroPlace | 9 | 9 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_1m_mixed` | band, regroup, level, zeroPlace | 9 | 9 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_10` | band, pictures, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_10_plain` | band | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| `subtraction:sub_wp_20` | band, pictures, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_20_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| ● `subtraction:sub_wp_50` | band, pictures, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_50_plain` | band | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| `subtraction:sub_wp_100` | band, pictures, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_100_plain` | band | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| `subtraction:sub_wp_1k` | band, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_1k_plain` | band | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| `subtraction:sub_wp_10k` | band, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_10k_plain` | band | 9 | 7 | 5 | 9 | 7 | OC8 | fail |
| `subtraction:sub_wp_100k` | band, support | 9 | 7 | 9 | 9 | 7 |  | fail |
| `subtraction:sub_wp_100k_plain` | band | 9 | 7 | 5 | 10 | 7 | OC8 | fail |
| `subtraction:sub_wp_1m` | band, support | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `subtraction:sub_wp_1m_plain` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `subtraction:nl_sub` | unknown, range | 9 | 9 | 5 | 8 | 9 | OC8 | fail |
| `subtraction:number_line_sub` | range | 5 | 5 | 5 | 10 | 9 | OC9 OC8 | fail |
| `subtraction:mixed_add_sub` | task, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `subtraction:mixed_subtraction` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| ● `subtraction:sub_across_zeros` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `subtraction:sub_missing_digit` | range | 5 | 5 | 6 | 9 | 9 | OC9 | fail |
| `subtraction:sub_check_by_adding` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| ● `multiplication:mult_facts` | constant, notation, band, support | 9 | 9 | 9 | 7 | 9 |  | fail |
| ● `multiplication:multiply` | notation, tiles, range | 9 | 9 | 6 | 4 | 6 | OC11 OC4 | fail |
| ● `multiplication:arrays_groups` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| `multiplication:dot_array_mult` | band, support | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `multiplication:mult_properties` | forms, pictures | 9 | 7 | 9 | 9 | 9 |  | fail |
| ● `multiplication:mult_word_problems` | response, forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `multiplication:mult_word_problems_plain` | forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `multiplication:mult_comparison` | response, range | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `multiplication:mult_comparison_plain` | range | 5 | 5 | 5 | 10 | 9 | OC9 OC8 | fail |
| ● `multiplication:area_model_mult` | tiles | 9 | 7 | 5 | 8 | 9 | OC8 | fail |
| `multiplication:area_model_mult_hard` | tiles | 9 | 7 | 5 | 8 | 9 | OC8 | fail |
| `multiplication:mult_div_fact_family` | notation | 9 | 7 | 6 | 10 | 9 |  | fail |
| `multiplication:number_families_mult` | band, level | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| ● `multiplication:mult_chart` | chart, band, missing, constant, task | 9 | 9 | 9 | 7 | 9 |  | fail |
| `multiplication:mult_chart_easy` | level, band, missing, constant, task | 9 | 9 | 9 | 2 | 9 | OC12 | fail |
| ● `multiplication:nl_mult` | constant, band, ticks, response, support | 9 | 8 | 9 | 7 | 9 |  | fail |
| `multiplication:mixed_multiplication` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `multiplication:repeated_add_to_mult` | band, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `multiplication:equal_or_unequal_groups` | forms, step | 9 | 9 | 6 | 10 | 9 |  | fail |
| `multiplication:mult_zeros` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `multiplication:mult_placeholder_zero` | tiles | 9 | 7 | 6 | 10 | 9 |  | fail |
| `multiplication:mult_missing_digit` | tiles | 9 | 7 | 6 | 9 | 9 |  | fail |
| ● `multiplication:count_by_tables` | constant, missing, order, shape | 9 | 9 | 9 | 7 | 9 |  | fail |
| ● `division:div_facts` | constant, notation, band, support | 9 | 9 | 9 | 7 | 9 |  | fail |
| ● `division:divide` | notation, tiles, regroup, range | 9 | 9 | 6 | 9 | 6 | OC11 | fail |
| ● `division:div_remainders` | constant | 9 | 8 | 6 | 7 | 9 |  | fail |
| `division:div_word_problems` | response, forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `division:div_word_problems_plain` | forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `division:remainder_interpret` | range | 5 | 5 | 5 | 9 | 9 | OC9 OC8 | fail |
| `division:remainder_contexts` | range | 5 | 5 | 5 | 9 | 9 | OC9 OC8 | fail |
| ● `division:box_division_easy` | constant, regroup | 9 | 9 | 6 | 7 | 9 |  | fail |
| `division:box_division_hard` | constant, regroup | 9 | 9 | 6 | 7 | 9 |  | fail |
| `division:area_model_div_2by1` | constant | 9 | 8 | 5 | 7 | 9 | OC8 | fail |
| `division:area_model_div_3by1` | constant | 9 | 8 | 5 | 7 | 9 | OC8 | fail |
| ● `division:long_div_2digit` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| `division:missing_mult_div` | notation, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| `division:nl_div` | constant, band, ticks, response, support | 9 | 8 | 9 | 7 | 9 |  | fail |
| `division:mixed_mult_div` | task, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `division:mixed_division` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| ● `division:share_into_groups` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `division:div_equation_parts` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `division:div_zero_in_quotient` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `division:remainder_too_big` | forms, constant, band | 9 | 9 | 6 | 7 | 9 |  | fail |
| `division:div_check_by_multiplying` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| `division:div_fix_estimate` | forms, tiles | 9 | 7 | 6 | 10 | 9 |  | fail |
| `integers:number_line_int` | forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| ● `integers:compare_int` | forms, shapes, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `integers:add_int` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `integers:sub_int` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `integers:order_negatives` | points, range | 9 | 8 | 6 | 10 | 9 |  | fail |
| `integers:integer_nl_drag` | forms | 7 | 6 | 5 | 9 | 9 | OC8 | fail |
| `integers:mixed_integers` | members, range | 7 | 5 | 5 | 9 | 9 |  | fail |
| `integers:abs_value` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `integers:opposite_numbers` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `integers:ordering_rationals` | forms | 7 | 6 | 5 | 9 | 9 | OC8 | fail |
| `number_ops_mixed:mixed` | task, range, decimals | 7 | 9 | 6 | 4 | 9 | OC4 | fail |
| ● `number_ops_mixed:word_problems_mixed` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `number_ops_mixed:word_problems_mixed_plain` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `number_ops_mixed:number_families_mixed` | band, level | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `number_ops_mixed:operations_all` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `number_ops_mixed:which_sign` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_ops_mixed:missing_factor_or_addend` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| ● `fractions:identify` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fractions:write_fraction` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| ● `fractions:shade_fraction` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:equiv_frac_visual` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:equiv_frac_nv` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:select_equiv_frac` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:equivalent` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `fractions:fraction_of_set` | denoms, range | 9 | 8 | 6 | 9 | 9 |  | fail |
| `fractions:fraction_of_set_hard` | denoms, range | 9 | 8 | 6 | 4 | 9 | OC4 | fail |
| `fractions:compare` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `fractions:simplify` | forms | 7 | 6 | 6 | 8 | 9 |  | fail |
| `fractions:improper_mixed` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:mixed_improper_visual` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:mixed_fractions` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `fractions:compose_target_frac` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:identify_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fractions:fraction_of_set_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fractions:fraction_of_set_hard_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fractions:order_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `fractions:order_frac_numline` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fractions:benchmark_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `fractions:compare_frac_lcd` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:graph_fractions` | denoms | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `fractions:round_fractions` | denoms | 9 | 8 | 6 | 9 | 9 |  | fail |
| `fractions:fraction_bar_ops` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `fractions:fraction_nl_drag` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fractions:mixed_nl_drag` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| ● `fraction_operations:add_fractions_like` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:sub_fractions_like` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:add_mixed_like` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:sub_mixed_like` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:mult_frac_whole` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:decompose_fractions` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| ● `fraction_operations:frac_word_problems` | denoms | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `fraction_operations:frac_word_problems_plain` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fraction_operations:frac_10_100` | pictures | 9 | 7 | 9 | 10 | 9 |  | fail |
| `fraction_operations:add_frac_unlike` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:sub_frac_unlike` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:add_mixed_unlike` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:sub_mixed_unlike` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| ● `fraction_operations:add_frac_like_nv` | denoms, forms | 9 | 9 | 6 | 9 | 9 |  | fail |
| `fraction_operations:sub_frac_like_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:add_frac_unlike_nv` | denoms, forms | 9 | 9 | 6 | 9 | 9 |  | fail |
| `fraction_operations:sub_frac_unlike_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fraction_operations:add_mixed_like_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:sub_mixed_like_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:add_mixed_unlike_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:sub_mixed_unlike_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:mult_frac_whole_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:decompose_frac_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fraction_operations:frac_10_100_nv` | forms | 7 | 6 | 6 | 8 | 9 |  | fail |
| `fraction_operations:mult_frac_frac_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fraction_operations:div_unit_frac_nv` | denoms, forms | 9 | 9 | 6 | 8 | 9 |  | fail |
| `fraction_operations:frac_as_div_nv` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| `fraction_operations:frac_as_div_word` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fraction_operations:mult_scaling_nv` | forms | 7 | 6 | 6 | 8 | 9 |  | fail |
| `fraction_operations:mult_frac_frac` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:div_unit_fraction` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:frac_as_division` | denoms, pictures | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `fraction_operations:mult_scaling` | pictures | 9 | 7 | 9 | 10 | 9 |  | fail |
| `fraction_operations:frac_mult_word` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fraction_operations:frac_mult_word_plain` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fraction_operations:frac_word_mixed` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| `fraction_operations:frac_word_mixed_plain` | denoms | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `fraction_operations:mixed_fraction_ops` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| ● `fraction_operations:estimate_frac_ops` | task | 9 | 7 | 6 | 10 | 9 |  | fail |
| ● `decimals:add_decimal` | range, decimals | 5 | 5 | 6 | 7 | 6 | OC9 | fail |
| `decimals:sub_decimal` | range, decimals | 5 | 5 | 6 | 10 | 6 | OC9 | fail |
| `decimals:mult_decimal` | range, decimals | 5 | 5 | 6 | 10 | 6 | OC9 | fail |
| `decimals:div_decimal` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `decimals:compare_decimal` | forms, range, decimals | 9 | 9 | 6 | 10 | 6 |  | fail |
| `decimals:compare_thousandths` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| ● `decimals:round_decimals` | precision, range | 9 | 8 | 6 | 10 | 9 |  | fail |
| `decimals:round_thousandths` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `decimals:order_decimals` | dir, forms, range, decimals | 9 | 9 | 6 | 10 | 6 |  | fail |
| `decimals:decimal_nl_drag` | forms | 7 | 6 | 5 | 10 | 9 | OC8 | fail |
| `decimals:mixed_decimals` | members, range, decimals | 7 | 5 | 5 | 8 | 6 |  | fail |
| `conversions:f_to_d` | denoms | 9 | 8 | 6 | 10 | 9 |  | fail |
| `conversions:d_to_f` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `conversions:f_to_p` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `conversions:p_to_f` | denoms, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `conversions:d_to_p` | digits | 9 | 8 | 6 | 10 | 9 |  | fail |
| `conversions:p_to_d` | digits | 9 | 8 | 6 | 10 | 9 |  | fail |
| `conversions:percent_visual` | forms | 7 | 6 | 6 | 8 | 9 |  | fail |
| ● `conversions:percent_of_number` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `conversions:find_whole_from_pct` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `conversions:order_fdp` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `conversions:ratio_intro` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `conversions:unit_rate_intro` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `conversions:double_num_line` | band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `conversions:mixed_conversions` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `conversions:equiv_ratios` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `conversions:ratio_tables` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `frac_dec_mixed:fractions_all` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `frac_dec_mixed:decimals_all` | members, range, decimals | 7 | 5 | 5 | 8 | 6 |  | fail |
| `frac_dec_mixed:conversions_all` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| `frac_dec_mixed:fdp_all` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| ● `shapes_early:name_2d_shapes` | forms, shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:name_3d_shapes` | forms, shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:shape_name_match_2d` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `shapes_early:shape_name_match_3d` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `shapes_early:shape_positions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `shapes_early:shape_corners_count` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `shapes_early:count_edges_faces_vertices` | forms, shapes | 9 | 7 | 6 | 9 | 9 |  | fail |
| `shapes_early:count_sides_vertices_2d` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `shapes_early:order_objects_length` | tiles | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:measure_nonstandard` | units, band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `shapes_early:compose_shapes` | shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:compose_hexagon` | shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:compose_rect_from_squares` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `shapes_early:partition_shapes` | forms, parts | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_early:shape_attributes` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `shapes_early:compose_from_attributes` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `shapes_early:mixed_shapes_early` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `area_perimeter:perimeter_intro` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `area_perimeter:area_unit_squares` | forms, band | 9 | 9 | 6 | 8 | 9 |  | fail |
| ● `area_perimeter:perimeter_grid` | forms, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `area_perimeter:perimeter` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| ● `area_perimeter:area` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `area_perimeter:area_perimeter` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| `area_perimeter:area_distributive_visual` | range | 5 | 5 | 5 | 4 | 9 | OC9 OC8 OC4 | fail |
| `area_perimeter:area_triangle` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `area_perimeter:area_polygon_decompose` | shapes, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `area_perimeter:composite_shapes` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `area_perimeter:volume` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `area_perimeter:volume_composite` | shapes, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `area_perimeter:mixed_area_perimeter` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `angles_lines:identify_angles` | forms, shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| ● `angles_lines:measure_angles` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `angles_lines:identify_lines` | forms, shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `angles_lines:symmetry` | forms | 7 | 6 | 6 | 9 | 9 |  | fail |
| `angles_lines:place_symmetry_lines` | shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `angles_lines:additive_angles` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `angles_lines:mixed_angles_lines` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `shapes_classify:classify_triangles` | forms, shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_classify:classify_quads` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `shapes_classify:hotspot_quads` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `shapes_classify:net_identify` | shapes | 9 | 7 | 6 | 10 | 9 |  | fail |
| `shapes_classify:cross_section_3d` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `shapes_classify:mixed_shapes` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| ● `coordinates:coordinate_q1` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `coordinates:coordinate_all` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `coordinates:coordinate_graph` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `coordinates:coord_distance_q1` | range | 5 | 5 | 6 | 9 | 9 | OC9 | fail |
| `coordinates:coord_polygon` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `coordinates:net_surface_area` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `coordinates:geo_reflect` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `coordinates:geo_rotate` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `coordinates:geo_translate` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `coordinates:mixed_coordinates` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `measurement:time_hour` | response, stimulus, numerals | 9 | 7 | 9 | 10 | 9 |  | fail |
| `measurement:time_half_hour` | response, review, stimulus, numerals | 9 | 7 | 9 | 10 | 9 |  | fail |
| ● `measurement:time_quarter` | response, quarters, review, stimulus, numerals | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| ● `measurement:time_5min` | response, review, support, stimulus, numerals | 9 | 7 | 9 | 10 | 9 |  | fail |
| `measurement:time_1min` | response, review, support, stimulus, numerals | 9 | 7 | 9 | 10 | 9 |  | fail |
| `measurement:time_analog_digital` | dir, precision, numerals | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `measurement:time_match_clock` | precision, words, numerals | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `measurement:order_clocks_analog_asc` | tiles, precision, numerals, noon | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `measurement:order_clocks_analog_desc` | tiles, precision, numerals, noon | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `measurement:order_clocks_digital_asc` | tiles, precision, noon | 9 | 9 | 6 | 9 | 9 |  | fail |
| `measurement:order_clocks_digital_desc` | tiles, precision, noon | 9 | 9 | 6 | 9 | 9 |  | fail |
| `measurement:elapsed_30min` | dir, support | 9 | 7 | 9 | 10 | 9 |  | fail |
| ● `measurement:elapsed_hour` | dir, hours, support, response | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `measurement:elapsed_15min` | dir, step, support | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `measurement:elapsed_mixed` | hours, step, support, noon | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `measurement:elapsed_find_duration` | response, hours, step, support, noon | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `measurement:elapsed_visual_easy` | notation, support | 9 | 7 | 9 | 9 | 9 |  | fail |
| `measurement:elapsed_visual_medium` | notation, support | 9 | 7 | 9 | 9 | 9 |  | fail |
| `measurement:elapsed_visual_hard` | notation, support | 9 | 7 | 9 | 9 | 9 |  | fail |
| `measurement:heavier_lighter_visual` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:pictograph_intro` | forms | 7 | 6 | 5 | 9 | 9 | OC8 | fail |
| `measurement:bar_graph_intro` | forms | 7 | 6 | 6 | 9 | 9 |  | fail |
| ● `measurement:reading_ruler` | parts | 9 | 7 | 6 | 9 | 9 |  | fail |
| `measurement:reading_ruler_hard` | parts | 9 | 7 | 6 | 9 | 9 |  | fail |
| ● `measurement:money_count` | currency, kind, values, band, tiles, order, support | 9 | 9 | 9 | 4 | 5 | OC4 OC11 | fail |
| `measurement:money` | currency, band, step, regroup | 9 | 9 | 5 | 9 | 9 | OC8 | fail |
| `measurement:equiv_coin_sets` | currency, band, values | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `measurement:enough_money` | currency, band, gap, values | 9 | 9 | 5 | 9 | 9 | OC8 | fail |
| `measurement:make_change_least_coins` | currency, band, values | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| ● `measurement:temperature` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:capacity` | units, forms | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `measurement:unit_conversions` | units, forms | 9 | 9 | 6 | 9 | 9 |  | fail |
| `measurement:length_customary` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:length_metric` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:unit_conversion_word` | units | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| `measurement:mass_volume_liquid` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:estimate_length` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `measurement:mixed_measurement` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `measurement:mixed_time` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `measurement:clock_parts` | task | 9 | 7 | 6 | 9 | 9 |  | fail |
| `measurement:time_fives_ring` | task | 9 | 7 | 9 | 9 | 9 |  | fail |
| `measurement:time_sense` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `measurement:elapsed_find_start` | hours, step, support, noon | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `measurement:coin_value` | currency, task | 9 | 7 | 5 | 9 | 9 | OC8 | fail |
| `measurement:money_notation` | currency, task | 9 | 7 | 5 | 10 | 9 | OC8 | fail |
| ● `measurement:money_change` | currency, band, step, regroup, paid | 9 | 9 | 5 | 9 | 9 | OC8 | fail |
| `measurement:money_compare` | currency, band, response, values | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| `geo_mixed:geometry_all` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `geo_mixed:measurement_all` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `geo_mixed:geo_meas_all` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| ● `graphs:bar_graph` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `graphs:build_bar_graph` | tiles, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `graphs:pictograph` | forms, scale, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `graphs:build_pictograph` | tiles, band | 9 | 9 | 6 | 10 | 9 |  | fail |
| `graphs:tally_chart` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `graphs:line_plot` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `graphs:line_plot_g2` | forms | 7 | 6 | 6 | 9 | 9 |  | fail |
| `graphs:line_plot_fractions` | forms | 7 | 6 | 6 | 9 | 9 |  | fail |
| `graphs:pie_chart` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `graphs:mixed_graphs` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| ● `data_analysis:mean` | forms, points, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `data_analysis:median` | forms, points, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `data_analysis:mode` | forms, points, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `data_analysis:range` | forms, points, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `data_analysis:box_plot_intro` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `data_analysis:histogram_read` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `data_analysis:mad` | points | 9 | 8 | 6 | 10 | 9 |  | fail |
| `data_analysis:statistical_question` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `data_analysis:mixed_data_analysis` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| ● `probability:probability_basic` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `probability:mixed_probability` | (none) | 8 | 8 | 8 | 10 | 8 |  | **pass** |
| `data_mixed:data_stats_all` | members, range | 7 | 5 | 5 | 10 | 9 |  | fail |
| `patterns:seq_2` | forms, unknown, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| ● `patterns:seq_5` | forms, unknown, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `patterns:seq_10` | forms, unknown, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `patterns:count_by_fill` | forms, step | 9 | 9 | 6 | 10 | 9 |  | fail |
| `patterns:skip_count_line` | step, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `patterns:skip_count_grid` | step | 9 | 9 | 6 | 10 | 9 |  | fail |
| `patterns:count_by_step_up` | step, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `patterns:count_by_step_down` | step, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `patterns:count_by_powers_of_10` | step, dir | 9 | 9 | 6 | 10 | 9 |  | fail |
| `patterns:double` | range | 5 | 5 | 6 | 10 | 9 | OC9 | fail |
| `patterns:halve` | range | 5 | 5 | 6 | 9 | 9 | OC9 | fail |
| `patterns:shape_pattern` | points | 9 | 8 | 6 | 10 | 9 |  | fail |
| `patterns:number_pattern` | forms, range | 9 | 9 | 6 | 8 | 9 |  | fail |
| `patterns:pattern_relationship` | forms, task, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| `patterns:mixed_patterns` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| ● `patterns:number_patterns_rule` | pattern, places, missing, rule, shape | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| ● `algebra:tape_diagram` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| `algebra:tape_diagram_plain` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| `algebra:multi_step_word` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| `algebra:multi_step_word_plain` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| ● `algebra:solve_unknown` | forms, range, decimals | 7 | 9 | 6 | 4 | 9 | OC4 | fail |
| `algebra:balance_addsub` | unknown, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| `algebra:write_expression` | task, forms, range | 9 | 9 | 5 | 10 | 9 | OC8 | fail |
| `algebra:evaluate_expression` | forms, range, decimals | 7 | 9 | 6 | 4 | 9 | OC4 | fail |
| `algebra:evaluate_expression_hard` | forms | 7 | 6 | 6 | 9 | 9 |  | fail |
| `algebra:inequalities` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `algebra:combine_like_terms` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `algebra:distributive_expr` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| ● `algebra:function_table_easy` | task, ops, step, band, tiles, order, support, pictures, response | 9 | 9 | 9 | 9 | 5 |  | fail |
| `algebra:function_table_hard` | task, ops, step, band, tiles, order, support, pictures, response | 9 | 9 | 9 | 9 | 5 |  | fail |
| `algebra:algebra_word_mixed` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| `algebra:algebra_word_mixed_plain` | range | 5 | 5 | 5 | 4 | 9 | OC9 OC8 OC4 | fail |
| `algebra:solve_eq_addsub` | forms, range | 9 | 9 | 6 | 8 | 9 |  | fail |
| `algebra:solve_eq_multdiv` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `algebra:solve_eq_twostep` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `algebra:write_equation` | forms, range | 9 | 9 | 5 | 4 | 9 | OC8 OC4 | fail |
| `algebra:build_expr_addsub` | task, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `algebra:build_expr_multdiv` | task | 9 | 7 | 6 | 10 | 9 |  | fail |
| `algebra:mixed_algebra` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| ● `order_of_operations:oop_easy` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `order_of_operations:oop_medium` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `order_of_operations:oop_hard` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `order_of_operations:two_ops_no_paren` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `order_of_operations:three_ops_no_paren` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `order_of_operations:multi_ops_no_paren` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `order_of_operations:paren_simple` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `order_of_operations:paren_multi` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `order_of_operations:nested_complex` | band | 9 | 8 | 6 | 9 | 9 |  | fail |
| `order_of_operations:exponents_simple` | forms, step, range | 9 | 9 | 6 | 9 | 9 |  | fail |
| `order_of_operations:compare_expressions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `order_of_operations:mixed_order_ops` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| `placevalue:more_less_10` | step, dir, band, support, unknown | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| ● `placevalue:more_less_100` | step, dir, support, unknown | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `placevalue:place_value_disks` | band, task, zeroPlace | 9 | 9 | 6 | 9 | 9 |  | fail |
| `placevalue:pv_disks_build` | band, zeroPlace | 9 | 9 | 6 | 9 | 9 |  | fail |
| `placevalue:pv_digit_drag` | band, source | 9 | 8 | 6 | 10 | 9 |  | fail |
| `placevalue:number_word_names` | band | 9 | 8 | 5 | 10 | 9 | OC8 | fail |
| ● `placevalue:place_value_10x` | op, power, band, decimals, support | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| ● `placevalue:identify` | band, places, support, response, repeatDigit | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `placevalue:value` | band, support, form, zeroDigit | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| ● `placevalue:compare` | band, closeness, lengths | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `placevalue:expand` | band, zeroPlace, frame, form | 9 | 9 | 9 | 10 | 8 |  | **pass** |
| `placevalue:combine` | band, zeroPlace, order | 9 | 9 | 6 | 10 | 9 |  | fail |
| `placevalue:order_least_to_greatest` | band, count, closeness, lengths | 9 | 9 | 6 | 9 | 9 |  | fail |
| `placevalue:order_greatest_to_least` | band, count, closeness, lengths | 9 | 9 | 6 | 9 | 9 |  | fail |
| `placevalue:mixed_placevalue` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `placevalue:unit_form` | band, rename | 9 | 9 | 6 | 10 | 9 |  | fail |
| ● `number_sense:rounding_visual` | place, band, midpoint, line, midLabel | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `number_sense:nearest_10` | band, midpoint, support, response, responseScope | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| ● `number_sense:nearest_100` | band, midpoint, support, response, responseScope | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `number_sense:nearest_1000` | band, midpoint, support, response, responseScope | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `number_sense:nearest_10000` | band, midpoint, support, response, responseScope | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `number_sense:nearest_100000` | band, midpoint, support, response, responseScope | 9 | 9 | 9 | 9 | 9 |  | **pass** |
| `number_sense:nearest_million` | midpoint, support, response, responseScope | 9 | 7 | 9 | 9 | 9 |  | fail |
| `number_sense:round_sort_10` | band, tiles, midpoint, support, bins | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `number_sense:round_sort_100` | band, tiles, midpoint, support, bins | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| ● `number_sense:round_sort_1000` | band, tiles, midpoint, support, bins | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `number_sense:round_sort_10000` | band, tiles, midpoint, support, bins | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `number_sense:round_sort_100000` | band, tiles, midpoint, support, bins | 9 | 9 | 9 | 10 | 9 |  | **pass** |
| `number_sense:round_sort_million` | tiles, midpoint, support, bins | 9 | 7 | 9 | 10 | 9 |  | fail |
| `number_sense:round_sort_tenths` | tiles, midpoint, support | 9 | 7 | 9 | 10 | 9 |  | fail |
| `number_sense:round_sort_hundredths` | tiles, midpoint, support | 9 | 7 | 9 | 10 | 9 |  | fail |
| `number_sense:estimate_sum` | place, support | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| `number_sense:estimate_diff` | place, support | 9 | 8 | 9 | 10 | 9 |  | **pass** |
| ● `number_sense:estimate_sums_diffs` | place, task | 9 | 9 | 6 | 9 | 9 |  | fail |
| `number_sense:estimate_products` | place, task | 9 | 9 | 6 | 9 | 9 |  | fail |
| `number_sense:estimate_quotient` | place, task | 9 | 9 | 6 | 9 | 9 |  | fail |
| `number_sense:rounding_table` | places, blank | 9 | 8 | 6 | 9 | 9 |  | fail |
| `number_sense:make_a_ten` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `number_sense:doubles_near_doubles` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| ● `number_sense:compensation` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_sense:mixed_number_sense` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| `number_sense:between_tens` | band | 9 | 8 | 6 | 10 | 9 |  | fail |
| `number_sense:place_on_number_line` | span, band | 9 | 8 | 5 | 9 | 9 | OC8 | fail |
| ● `number_theory:prime_composite` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `number_theory:factors_identify` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| ● `number_theory:factor_tchart_easy` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:factor_tchart_medium` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:factor_tchart_hard` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:factor_links_easy` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:factor_links_medium` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:factor_links_hard` | range | 5 | 5 | 6 | 4 | 9 | OC9 OC4 | fail |
| `number_theory:multiples` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `number_theory:gcf_easy` | forms, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `number_theory:gcf_hard` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `number_theory:lcm` | forms, range | 9 | 9 | 6 | 4 | 9 | OC4 | fail |
| `number_theory:divisibility_sort` | step, range | 9 | 9 | 6 | 10 | 9 |  | fail |
| `number_theory:mixed_number_theory` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| `algebra_mixed:patterns_all` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| `algebra_mixed:algebra_all` | members | 7 | 5 | 5 | 8 | 9 |  | fail |
| `algebra_mixed:order_ops_all` | members, range | 7 | 5 | 5 | 4 | 9 | OC4 | fail |
| ● `algebra_mixed:placevalue_all` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `algebra_mixed:number_sense_all` | members | 7 | 5 | 5 | 9 | 9 |  | fail |
| `algebra_mixed:number_theory_all` | members | 7 | 5 | 5 | 10 | 9 |  | fail |
| `algebra_mixed:algebraic_all` | members | 7 | 5 | 5 | 9 | 7 |  | fail |
| `all_mixed:all_domains_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `all_mixed:grade_k_mixed` | members | 7 | 5 | 5 | 9 | 7 |  | fail |
| `all_mixed:grade_1_mixed` | members | 7 | 5 | 5 | 9 | 7 |  | fail |
| ● `all_mixed:grade_2_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `all_mixed:grade_3_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `all_mixed:grade_4_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `all_mixed:grade_5_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `all_mixed:grade_6_mixed` | members | 7 | 5 | 5 | 8 | 7 |  | fail |
| `vocabulary:vocab_grade_K` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| ● `vocabulary:vocab_grade_2` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_counting` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_K_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_counting` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_1_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_counting` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_2_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_3_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_4_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_5_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_operations` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_fractions` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_geometry` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_data` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_algebra` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |
| `vocabulary:vocab_grade_6_measurement` | forms | 7 | 6 | 6 | 10 | 9 |  | fail |

## 4. Per-family summaries

**counting** (2 / 4 pass). Real K ladders now (Count to, Arrangement, Objects, Support level). `number_seq_fill` has no support control; `mixed_counting` "Up to 10" deals 18.

**comparing** (1 / 4 pass). `compare_groups` passes (Compare by · Count to · Support level). `compare_objects` has no size and no support; `classify_count` has no support; the pool has only Which skills.

**composing** (0 / 17 pass). Worst K family. Six ten-frame / base-10 skills show only "Numbers to" — the frame, dots and blocks they draw are hint scaffolds with no fade; `make_ten` / `teen_compose` show only Support level (no easier / harder); fractions-in-composing show only Denominators; `number_bonds` "Bonds to 20" is outside "within 10" with the title unchanged.

**counting_mixed** (0 / 1 pass). Pool: Which skills + a measured Max Number that is broken ("Up to 10" deals 327).

**addition** (6 / 59 pass). Fact drill (`add_facts`) is a model panel but fails O4 on the printed title (P-31). The 18-id column ladder and the 16 story ids now carry Numbers to · Regrouping · Support level, but **every band runs to 1,000,000 on skills named "within 10 / 20 / 50 …"**, and Regrouping offers "Never" on "With Regrouping" ids — the sheet keeps the id's title ("I Can add within 50 (with regrouping)" over 6-digit sums with no carrying). The `_plain` story twins lost the bar-model support their pictured twins have. Six skills are still measured-Max-Number only (`add_sub_fact_family`, `equal_sign`, `number_line_add`, `cloze_addition`, `add_missing_digit`, `fact_family_sort`).

**subtraction** (2 / 54 pass). As addition, plus: "Across zeros" is a dead control whenever Regrouping = Never (8 × `sub_1k…1m_*`), `sub_across_zeros` / `number_line_sub` / `sub_missing_digit` / `sub_check_by_adding` / `unknown_start_wp` are Max-Number-only, and `sub_across_zeros` "Up to 100" deals 408 − 89.

**multiplication** (3 / 23 pass). `mult_facts` good but P-31 title. `multiply` has two size controls (Digits × digits and Max Number) and Max Number "Up to 100" still deals 12 × 11. Area-model and missing-digit skills show only `tiles`; no support anywhere outside the facts / number line / dot array.

**division** (0 / 22 pass). Weakest of + − × ÷ on support: 19 / 22 panels have no support control (no think box, no multiplication-fact strip, no long-division step frame). `divide` duplicates size (Digits ÷ digit + Max Number). Five long-division skills are Max-Number-only. Every constant-bearing skill fails the printed P-31 title.

**integers** (0 / 10 pass). Item-kind sets only ("What the items ask"); no number line on/off, no size ladder except measured Max Number.

**number_ops_mixed** (1 / 7 pass). Pools with Which skills only; `mixed` offers Decimal places on a K-5 mix; `which_sign` / `missing_factor_or_addend` Max-Number-only and over their bound.

**fractions** (0 / 27 pass). Denominators is the right difficulty control and it works, but 26 / 27 have no support: no pictures on/off, no fraction-strip or number-line hint, no labelled-partition fade.

**fraction_operations** (13 / 39 pass). Best-supported non-P9 family: the 13 pictured operations have Denominators + Pictures and pass. The `_nv` twins, word problems and scaling skills have no support control; six `_nv` skills could not be verified (generator ignores the seed).

**decimals** (0 / 11 pass). No decimal family passes. Add / subtract / multiply decimal show only measured Max Number + Decimal places, whose default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal. No place-value grid / decimal-point-alignment support.

**conversions** (0 / 16 pass). One control each (forms, digits or band); no support (no hundredths grid, no double number line hint) on 15 / 16.

**frac_dec_mixed** (0 / 4 pass). Pools; `decimals_all` repeats the "now whole numbers" lie; `fdp_all` members are raw category ids.

**shapes_early** (3 / 17 pass). Three justified no-panel skills pass. The rest are item-kind or shape-set only: no size ladder (sides 3-6 / 3-8), no support (labels / dot corners / tracing).

**area_perimeter** (0 / 13 pass). Measured Max Number bounds side lengths, not the area / perimeter it claims (7 skills OC4: "Up to 10" → area 25). No grid on/off or labelled-sides support.

**angles_lines** (0 / 7 pass). Item kinds and shape sets only; no protractor-type / benchmark-angle support.

**shapes_classify** (1 / 6 pass). `hotspot_quads` justified no-panel. Others: forms / shapes only.

**coordinates** (0 / 10 pass). Forms + measured Max Number; no grid-labels or first-quadrant-only support.

**measurement** (11 / 47 pass). Time is a model panel (steps, review, stimulus, numerals as support, response) and 11 time skills pass. Money has the right ideas but `money_count` has 7 controls, two contradicting size controls and a broken "Notes to 500". Rulers, capacity, temperature and conversions are one-control panels with no support.

**geo_mixed** (0 / 3 pass). Pools only; raw category-id labels.

**graphs** (0 / 10 pass). Forms (+ Max Number) only; no scale / key-size ladder except `pictograph`, no gridline or read-across-line support.

**data_analysis** (1 / 9 pass). Forms + points + Max Number; no ordered-list / tally support for mean / median / mode.

**probability** (1 / 2 pass). One forms control; `mixed_probability` justified empty.

**data_mixed** (0 / 1 pass). Pool only.

**patterns** (1 / 16 pass). Steps and directions are sensible; 13 / 16 have no support (no hundreds-chart / number-line hint on skip counting). `seq_2`/`seq_5`/`seq_10` "Up to 10" deal 40.

**algebra** (0 / 23 pass). Function tables have the richest panel in the app but 9 controls (limit 5) and a clipped select at 420. Tape diagrams / multi-step words: no bar-model fade, and Max Number bounds operands only (OC4 on 9 skills).

**order_of_operations** (0 / 12 pass). Forms / Max Number only; "Up to 10" deals 89; no step-by-step (underline the first operation) support.

**placevalue** (6 / 16 pass). Round-1 gating defects are fixed: bands now stand in for Max Number and six skills pass. The rest lack a place-value chart / labels support control (`compare`, `order_*`, `combine`, `pv_disks_build`, `pv_digit_drag`, `number_word_names`, `unit_form`).

**number_sense** (13 / 27 pass). Best family (13 / 27): the rounding panels are exemplary. Estimation-by-task, `rounding_table`, `make_a_ten`, `doubles_near_doubles`, `between_tens`, `place_on_number_line` lack support; `compensation` "Up to 10" deals 100.

**number_theory** (0 / 14 pass). No skill passes. Seven are Max-Number-only, and Max Number bounds nothing it says ("Up to 10" → factors of 24, lcm 70). No factor-rainbow / multiplication-chart support.

**algebra_mixed** (0 / 7 pass). Pools; Max Number broken on `patterns_all` / `order_ops_all`.

**all_mixed** (0 / 8 pass). Grade reviews: Which topics only, labelled with raw category ids ("Number ops mixed", "Placevalue"); no easier / harder or support.

**vocabulary** (0 / 50 pass). 50 identical panels: one "What the items ask" set. No word-count / word-set ladder, no picture or word-bank support. This is the single largest block of failures (50).


## 5. Defects grouped by the file that must change, with fixes

### js/modules/skill-options.js (the registry)

1. **O2/O5 — + / − band values outside the skill's name (67 skills).** `_opsBand` is attached with the full
   `[20 … 1,000,000]` list to `add_10_* … add_100k_*`, `sub_10_* … sub_100k_*` and `add_wp_*` / `sub_wp_*`, so "Add within 50"
   offers 1,000,000 and prints 6-digit sums under "I Can add within 50 (with regrouping)". **Fix:** offer only the bands at or
   below the id's own (50 → 10 / 20 / 50) — the next skill up is the harder step — or, if the ids are to become one configured
   skill, retitle the sheet from the band (see print-sheet.js) and retire the ids with aliases.
2. **O5 — Regrouping contradicts the id (32 skills).** `_opsRegroup` on `*_no_regroup` / `*_regroup` ids offers the
   opposite value. **Fix:** on those ids drop the control (the id is the value) or restrict it to the id's value + "Some items".
3. **O5 — dead Across zeros.** `_opsAcrossZeros` on `sub_1k … sub_1m_regroup/_mixed` does nothing at Regrouping = Never.
   **Fix:** `appliesTo: cur => cur.regroup !== 'none'`.
4. **O3 — support is absent on 436 of 589 panels.** Attach the existing `picturesOption` / `levelSubset` / a per-family
   `support` enum where the generator draws a hint: fractions (strip / labelled partitions), decimals (place-value grid),
   division (think box, fact strip), ten-frame / base-10 composing (dots → none), graphs (read-across line), number theory
   (factor rainbow), patterns (hundreds-chart strip), order of operations (underline first step), vocabulary (picture / word bank).
5. **O2 — "What the items ask" is the only control on 104 skills** (50 vocabulary, integers, geometry, graphs, OoO). Add a
   size ladder per family (vocabulary: 4 / 6 / 8 words or core / all words; integers: −10…10 / −20…20 / −100…100;
   shapes: sides to 4 / 6 / 8).
6. **O5 — `money_count` has 7 controls and two size controls.** "Totals to" and the "Notes, totals to 20/100/500" kinds
   contradict. **Fix:** split kind into "What to count" (coins / notes / both) and let "Totals to" carry 25 … 500; move
   "Coins at most" and "Coins set out" behind the support/layout group or drop one — ≤ 5 controls.
7. **O5 — function tables have 9 controls.** Fold "Function machine picture" into Support (frame / line / machine), make
   "Rows" a fixed 4 and fold "Check row" into Task → 6, then drop Order into the Task list → 5.
8. **O5 — `multiply` / `divide` show "Digits × digits" and "Max Number" side by side.** Hide the measured range when the
   skill owns a `tiles` digits control (add `tiles` to `OWNS_ITS_NUMBERS`).
9. **O5 — decimals: "Use the Decimals setting (now whole numbers)"** is the default label on `add_decimal`, `sub_decimal`,
   `mult_decimal`, `compare_decimal`, `order_decimals`, `mixed_decimals`, `decimals_all`, all of which deal decimals at 0.
   **Fix:** for the decimals category the null value reads "Tenths and hundredths (this skill's own)" (`_liveDef` in the UI
   takes its text from the def).
10. **O2 — `number_bonds` "Bonds to 20"** on a skill named within 10: either rename or cap at 10.
11. **O2 — `make_ten` / `teen_compose`: Support level is the only control.** Add a target (make 5 / 10 / 20) or teen range.

### js/modules/skill-options-derived.js ← tests/scripts/ws-options-derive.cjs (the measured Max Number)

12. **O4 / OC4 — measured "Up to N" does not bound the answer on 52 skills** (68 values): number theory (all), algebra
    (tape diagrams, multi-step, solve / evaluate), area / perimeter (sides, not area), order of operations, `seq_*`,
    `sub_across_zeros`, `div_zero_in_quotient`, `multiply` (12 × 11 under "Up to 100"), `counting_all` (327 under 10).
    **Fix:** after deriving, drop any value whose seeded answers exceed it (the verifier already computes this) — or relabel
    the control "Largest number used" where the bound is an operand by design and remove the "biggest number" help.
13. **O1 — measured-only panels (39 skills)** are the weakest panels in the app (O1/O2 5): give each an own option (§3 of
    round 1) and stop showing Max Number where an own band exists.
14. **O1 — measured Decimal places on `number_ops_mixed:mixed`, `solve_unknown`, `evaluate_expression`.** Drop it.

### js/modules/print-sheet.js (sheet header) — P-31

15. **O4 — the sheet title ignores the fact set (124 values, 14 skills), open since round 1 #28.** `buildSheet` prints
    "I Can add facts to 20" for Add = {6}. `toPrintProblem` already sets `skillOptionTitle`; the header ("I Can …") must use
    `factSetTitle()` when it is non-empty. The same resolver should use the band when a + / − id's band differs from its name.

### js/modules/gen-time-money.js + js/modules/sheet/providers/time-money.js

16. **O4 / OC4 — `money_count` notes.** In Plain currency `c.notes` stops at 20, so "Notes, totals to 100 / 500" deal
    2–40; in US dollars the print provider draws twelve $100 notes (1,200) ignoring `noteCap` and "Coins at most: 6", under
    "Count the coins" / "I Can count coins". **Fix:** give Plain notes up to 100 (or hide notes kinds in Plain), cap the
    printed notes by `noteCap` and `tiles`, and switch the instruction to "Count the money".

### js/modules/gen-operations.js

17. **O4 — `multiply` range.** "Up to 100" deals the same eight items as the default (11 × 1, 12 × 7, 12 × 11 = 132): the
    measured range is not read on this path. Read it as the product bound, or remove it (see 8).
18. **O4 — `sub_across_zeros` "Up to 100"** deals 408 − 89: the bound must cap the minuend.

### js/modules/skill-options-pools.js

19. **O5 — pool labels are category ids** (`_catLabel` title-cases `number_ops_mixed` → "Number ops mixed", `placevalue`
    → "Placevalue", `shapes_early` → "Shapes early"). **Fix:** take the label from `DOMAINS` / the category's display name.
20. **O2 / O3 — every pool (56 skills) offers only Which skills.** Add one pool-level size ("Easier / As set / Harder",
    passed to each member's band) and one pool-level support (members' support level 2 / 1 / 0), so a review can be
    pitched without opening every member.

### js/modules/skill-options-ui.js (the panel)

21. **O5 — clipped select at 420** (`function_table_*` Support: "Frame (the rule on each In number; the rule box x ○ □)").
    Show the full label of the chosen value as a line under the select when it overflows.
22. **O5 — generic band help.** `_opsBand`'s help ("the sum for +, the number you take from for −, the product for ×, the
    number shared for ÷") is shown on single-operation skills; give each operation its own sentence.
23. **O5 — the sample frame overflows** at 1280 on `placevalue:expand` (horizontal scrollbar inside the popover); scale
    the sample to the frame. The `add_decimal` sample draws the stack upside-down (rule above, stray "." as the answer line).

### tests/scripts/ws-options-verify.cjs (the gate)

24. **The gate passes values it has not checked.** Promote "Up to N but the answer reaches M" and "sheet is not titled"
    from warnings to failures (the rubric already caps them), fail "generator not reproducible" for non-pool skills (seed
    the generator instead), and add a combination pass (each enum value × each other control's extreme) — it would have
    caught Across zeros × Never and Totals to × Notes to 500. Add a kind predicate for money (a notes kind must draw notes).

## 6. Top 15 fixes (in order of skills unblocked)

1. Add a support control to every family that draws a hint (fix 4) — unblocks O3 on ~430 skills.
2. Vocabulary: add a word-set size and a picture / word-bank support (fix 4, 5) — 50 skills.
3. + / − ids: restrict bands to the id's name and drop the contradicting Regrouping values (fix 1, 2) — 67 skills.
4. Measured Max Number: drop values whose answers exceed them; relabel where it bounds an operand (fix 12) — 52 skills.
5. Pools: pool-level Easier/Harder and Support, real category names (fixes 19, 20) — 56 skills.
6. Print the fact-set title in the sheet header (fix 15) — 14 skills, P-31.
7. Give the 39 measured-only skills an own size / complexity option (fix 13).
8. Give the 104 forms-only skills a size ladder (fix 5).
9. Decimals: honest default label + a place-value grid support (fixes 9, 4).
10. `money_count`: repair notes kinds in print and Plain, merge the two size controls, ≤ 5 controls (fixes 6, 16).
11. Function tables: fold to ≤ 5 controls; fix the clipped select (fixes 7, 21).
12. Hide Across zeros when Regrouping = Never (fix 3).
13. `multiply` / `divide`: one size control, and make Max Number bound the product (fixes 8, 17).
14. Composing: support fade on ten frames / base-10; a target ladder on `make_ten` / `teen_compose`; cap `number_bonds` (fixes 4, 10, 11).
15. Harden the verifier (fix 24) so the next round's O4 is evidence, not a difference count.


## 7. Per-skill defect lines (every failing skill)

| Skill | Defects |
|---|---|
| `counting:number_seq_fill` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `counting:mixed_counting` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 18 and the numbers 18 (the help promises "The biggest number") |
| `comparing:compare_objects` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `comparing:classify_count` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `comparing:mixed_comparing` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `composing:number_bonds` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Bonds to" offers up to 20 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10") |
| `composing:make_ten` | O2: no number-size control<br>O2 (live): the only control is Support level 1/0; no "Make 5 / Make 10 / Make 20" or "missing addend vs both parts" ladder — the teacher cannot go easier or harder |
| `composing:teen_compose` | O2: no number-size control<br>O2: Support level is the only control; no teen range (11-15 / 11-19) or unknown-position ladder |
| `composing:tens_foundation_visual` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:hundreds_chart_fill` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:ten_frame_build` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:ten_frame_build_teen` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:base10_build` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:base10_regroup` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:base10_build_hundreds` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:odd_even` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:select_even_odd` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:number_word_form` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:fraction_number_line` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `composing:whole_as_fraction` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:compose_whole` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `composing:mixed_composing` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `counting_mixed:counting_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10, range=20, range=100 — "Up to 10" but the answer reaches 327 and the numbers 327 (the help promises "The biggest number") |
| `addition:add_facts` | O4 (print, P-31): 14 fact-set values print the generic title (e.g. "sheet is not titled "Add 0" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `addition:add_sub_10s` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:add_sub_100s` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:add` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:add_word_problems_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `addition:add_sub_fact_family` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:comparison_word` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `addition:equal_sign` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:add_5_pictures` | O2: no number-size control |
| `addition:add_10_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_10_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_10_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10") |
| `addition:add_20_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_20_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_20_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `addition:add_50_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_50_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_50_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `addition:add_100_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_100_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_100_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `addition:add_1k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_1k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_1k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000") |
| `addition:add_10k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_10k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_10k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000") |
| `addition:add_100k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_100k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_100k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000") |
| `addition:add_1m_no_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_1m_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `addition:add_wp_10_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `addition:add_wp_20` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `addition:add_wp_20_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `addition:add_wp_50` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `addition:add_wp_50_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `addition:add_wp_100` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `addition:add_wp_100_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `addition:add_wp_1k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000") |
| `addition:add_wp_1k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000") |
| `addition:add_wp_10k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000") |
| `addition:add_wp_10k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000") |
| `addition:add_wp_100k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000") |
| `addition:add_wp_100k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000") |
| `addition:add_wp_1m_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `addition:nl_add` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `addition:number_line_add` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `addition:cloze_addition` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:mixed_addition` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 58 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `addition:add_column_multi` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:add_missing_digit` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `addition:fact_family_sort` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 13 (the help promises "The biggest number") |
| `subtraction:sub_facts` | O4 (print, P-31): 14 fact-set values print the generic title (e.g. "sheet is not titled "Subtract 0" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `subtraction:subtract` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `subtraction:sub_word_problems_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `subtraction:missing_add_sub` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `subtraction:sub_5_pictures` | O2: no number-size control |
| `subtraction:unknown_start_wp` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 16 and the numbers 19 (the help promises "The biggest number") |
| `subtraction:sub_10_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_10_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_10_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10") |
| `subtraction:sub_20_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_20_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_20_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `subtraction:sub_50_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_50_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_50_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `subtraction:sub_100_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_100_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_100_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `subtraction:sub_1k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_1k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_1k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000")<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_10k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_10k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_10k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000")<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_100k_no_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_100k_regroup` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000")<br>O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_100k_mixed` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000")<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_1m_no_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow |
| `subtraction:sub_1m_regroup` | O5: Regrouping offers the opposite of the skill name (Never on a "With Regrouping" skill, Every item on "No Regrouping"); title does not follow<br>O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_1m_mixed` | O5 (probe): "Across zeros: Every item" does nothing when Regrouping = Never (8 items, no zero crossed) — the control should hide (appliesTo) or force regrouping |
| `subtraction:sub_wp_10` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10")<br>O5: sibling inconsistency — add_wp_10 offers "Total to 5/7/10", sub_wp_10 offers "Numbers to 10 … 1,000,000" for the same K story family |
| `subtraction:sub_wp_10_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10"; the sheet keeps the old title ("I Can … within 10") |
| `subtraction:sub_wp_20` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `subtraction:sub_wp_20_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 20"; the sheet keeps the old title ("I Can … within 20") |
| `subtraction:sub_wp_50` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `subtraction:sub_wp_50_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 50"; the sheet keeps the old title ("I Can … within 50") |
| `subtraction:sub_wp_100` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `subtraction:sub_wp_100_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100"; the sheet keeps the old title ("I Can … within 100") |
| `subtraction:sub_wp_1k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000") |
| `subtraction:sub_wp_1k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 1,000"; the sheet keeps the old title ("I Can … within 1,000") |
| `subtraction:sub_wp_10k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000") |
| `subtraction:sub_wp_10k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 10,000"; the sheet keeps the old title ("I Can … within 10,000") |
| `subtraction:sub_wp_100k` | O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000") |
| `subtraction:sub_wp_100k_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O2/O5: "Numbers to" offers up to 1,000,000 on a skill named "within 100,000"; the sheet keeps the old title ("I Can … within 100,000") |
| `subtraction:sub_wp_1m_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `subtraction:nl_sub` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `subtraction:number_line_sub` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `subtraction:mixed_add_sub` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `subtraction:mixed_subtraction` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 52 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `subtraction:sub_across_zeros` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=100 — "Up to 100" but the answer reaches 319 and the numbers 408 (the help promises "The biggest number") |
| `subtraction:sub_missing_digit` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `subtraction:sub_check_by_adding` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:mult_facts` | O4 (print, P-31): 13 fact-set values print the generic title (e.g. "sheet is not titled "Multiply by 0" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `multiplication:multiply` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5: two number-size controls (a "Digits"/"Numbers to" control and the measured Max Number) that override each other<br>O4 (probe): Max Number "Up to 100" still deals 12 × 11 = 132 (and the same 8 items as the default); the measured Max Number bounds a factor, not the product (breaks "bounds the answer") |
| `multiplication:arrays_groups` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 25 and the numbers null (the help promises "The biggest number") |
| `multiplication:mult_properties` | O2: no number-size control |
| `multiplication:mult_word_problems` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `multiplication:mult_word_problems_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `multiplication:mult_comparison` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `multiplication:mult_comparison_plain` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `multiplication:area_model_mult` | O2: no number-size control<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (unverified): 2 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `multiplication:area_model_mult_hard` | O2: no number-size control<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (unverified): 2 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `multiplication:mult_div_fact_family` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:mult_chart` | O4 (print, P-31): 12 fact-set values print the generic title (e.g. "sheet is not titled "Times tables 1" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `multiplication:mult_chart_easy` | O4: *="*" — verifier: timed out after 60000 ms |
| `multiplication:nl_mult` | O4 (print, P-31): 11 fact-set values print the generic title (e.g. "sheet is not titled "Hops of 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `multiplication:mixed_multiplication` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 22 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `multiplication:equal_or_unequal_groups` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:mult_zeros` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:mult_placeholder_zero` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:mult_missing_digit` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `multiplication:count_by_tables` | O4 (print, P-31): 12 fact-set values print the generic title (e.g. "sheet is not titled "Count by 1" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:div_facts` | O4 (print, P-31): 13 fact-set values print the generic title (e.g. "sheet is not titled "Zero divided by a number" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:divide` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5: two number-size controls (a "Digits"/"Numbers to" control and the measured Max Number) that override each other |
| `division:div_remainders` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (print, P-31): 8 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:div_word_problems` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `division:div_word_problems_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `division:remainder_interpret` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `division:remainder_contexts` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `division:box_division_easy` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (print, P-31): 8 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:box_division_hard` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (print, P-31): 8 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:area_model_div_2by1` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (print, P-31): 8 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:area_model_div_3by1` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (print, P-31): 8 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:long_div_2digit` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:missing_mult_div` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:nl_div` | O4 (print, P-31): 11 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 2" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:mixed_mult_div` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:mixed_division` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 19 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `division:share_into_groups` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:div_equation_parts` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:div_zero_in_quotient` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=100, range=1000 — "Up to 100" but the answer reaches 405 and the numbers 912 (the help promises "The biggest number") |
| `division:remainder_too_big` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (print, P-31): 7 fact-set values print the generic title (e.g. "sheet is not titled "Divide by 3" (P-31)") — screen and the per-cell label follow the set, the sheet header does not |
| `division:div_check_by_multiplying` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `division:div_fix_estimate` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:number_line_int` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `integers:compare_int` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:add_int` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:sub_int` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:order_negatives` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:integer_nl_drag` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `integers:mixed_integers` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `integers:abs_value` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:opposite_numbers` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `integers:ordering_rationals` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `number_ops_mixed:mixed` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O1: measured Decimal places on a skill whose name does not say decimals<br>O4 (OC4): range=10, range=20, range=50 — "Up to 10" but the answer reaches 42 and the numbers 55 (the help promises "The biggest number") |
| `number_ops_mixed:word_problems_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `number_ops_mixed:word_problems_mixed_plain` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `number_ops_mixed:operations_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `number_ops_mixed:which_sign` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 20 (the help promises "The biggest number") |
| `number_ops_mixed:missing_factor_or_addend` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:identify` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:write_fraction` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:shade_fraction` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:equiv_frac_visual` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:equiv_frac_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:select_equiv_frac` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:equivalent` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:fraction_of_set` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:fraction_of_set_hard` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20 — "Up to 10" but the answer reaches 18 and the numbers 24 (the help promises "The biggest number") |
| `fractions:compare` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:simplify` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 3 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fractions:improper_mixed` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:mixed_improper_visual` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:mixed_fractions` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 26 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fractions:compose_target_frac` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:identify_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:fraction_of_set_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 7 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fractions:fraction_of_set_hard_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 6 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fractions:order_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:order_frac_numline` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fractions:benchmark_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:compare_frac_lcd` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:graph_fractions` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fractions:round_fractions` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:fraction_bar_ops` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fractions:fraction_nl_drag` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fractions:mixed_nl_drag` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:frac_word_problems` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:frac_word_problems_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:frac_10_100` | O2: no number-size control |
| `fraction_operations:add_frac_like_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:sub_frac_like_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:add_frac_unlike_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:sub_frac_unlike_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 6 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:add_mixed_like_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:sub_mixed_like_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:add_mixed_unlike_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:sub_mixed_unlike_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:mult_frac_whole_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:decompose_frac_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 7 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:frac_10_100_nv` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 4 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:mult_frac_frac_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 6 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:div_unit_frac_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 7 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:frac_as_div_nv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `fraction_operations:frac_as_div_word` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:mult_scaling_nv` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 3 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:mult_scaling` | O2: no number-size control |
| `fraction_operations:frac_mult_word` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:frac_mult_word_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:frac_word_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `fraction_operations:frac_word_mixed_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `fraction_operations:mixed_fraction_ops` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 38 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `fraction_operations:estimate_frac_ops` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `decimals:add_decimal` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)"<br>O4 (live, 1280 + 420): the panel sample draws the stacked sum wrongly — the rule sits ABOVE the numbers and a stray "." is the answer line; the screen card for the default is not the printed layout |
| `decimals:sub_decimal` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)" |
| `decimals:mult_decimal` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)" |
| `decimals:div_decimal` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `decimals:compare_decimal` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)" |
| `decimals:compare_thousandths` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `decimals:round_decimals` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `decimals:round_thousandths` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `decimals:order_decimals` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)" |
| `decimals:decimal_nl_drag` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `decimals:mixed_decimals` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 15 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): the Decimal places default reads "Use the Decimals setting (now whole numbers)" while every item is a decimal (8.69 + 8.02); "Whole numbers" is a lie on a decimals skill — default should read "Tenths and hundredths (this skill's own)" |
| `conversions:f_to_d` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:d_to_f` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:f_to_p` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:p_to_f` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:d_to_p` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:p_to_d` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:percent_visual` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 4 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `conversions:percent_of_number` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:find_whole_from_pct` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:order_fdp` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:ratio_intro` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:unit_rate_intro` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:double_num_line` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `conversions:mixed_conversions` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 15 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `conversions:equiv_ratios` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `conversions:ratio_tables` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `frac_dec_mixed:fractions_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 26 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `frac_dec_mixed:decimals_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 15 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5: Decimal places default "(now whole numbers)" on a decimals pool |
| `frac_dec_mixed:conversions_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `frac_dec_mixed:fdp_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 4 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5: pool member labels are raw category ids |
| `shapes_early:name_2d_shapes` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:name_3d_shapes` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:shape_positions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:shape_corners_count` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:count_edges_faces_vertices` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:count_sides_vertices_2d` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:order_objects_length` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:measure_nonstandard` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:compose_shapes` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:compose_hexagon` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:partition_shapes` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:shape_attributes` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:compose_from_attributes` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_early:mixed_shapes_early` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `area_perimeter:perimeter_intro` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `area_perimeter:area_unit_squares` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 4 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `area_perimeter:perimeter_grid` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `area_perimeter:perimeter` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 16 and the numbers 16 (the help promises "The biggest number") |
| `area_perimeter:area` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 20 and the numbers 25 (the help promises "The biggest number") |
| `area_perimeter:area_perimeter` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `area_perimeter:area_distributive_visual` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 49 and the numbers null (the help promises "The biggest number") |
| `area_perimeter:area_triangle` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 28 and the numbers null (the help promises "The biggest number") |
| `area_perimeter:area_polygon_decompose` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 26 and the numbers null (the help promises "The biggest number") |
| `area_perimeter:composite_shapes` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 38 and the numbers null (the help promises "The biggest number") |
| `area_perimeter:volume` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 12 and the numbers 12 (the help promises "The biggest number") |
| `area_perimeter:volume_composite` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `area_perimeter:mixed_area_perimeter` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 12 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `angles_lines:identify_angles` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:measure_angles` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:identify_lines` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:symmetry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:place_symmetry_lines` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:additive_angles` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `angles_lines:mixed_angles_lines` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `shapes_classify:classify_triangles` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_classify:classify_quads` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_classify:net_identify` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_classify:cross_section_3d` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `shapes_classify:mixed_shapes` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `coordinates:coordinate_q1` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:coordinate_all` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:coordinate_graph` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:coord_distance_q1` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:coord_polygon` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:net_surface_area` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:geo_reflect` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:geo_rotate` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:geo_translate` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `coordinates:mixed_coordinates` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 9 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `measurement:time_hour` | O2: no number-size control |
| `measurement:time_half_hour` | O2: no number-size control |
| `measurement:time_5min` | O2: no number-size control |
| `measurement:time_1min` | O2: no number-size control |
| `measurement:order_clocks_digital_asc` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:order_clocks_digital_desc` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:elapsed_30min` | O2: no number-size control |
| `measurement:elapsed_visual_easy` | O2: no number-size control |
| `measurement:elapsed_visual_medium` | O2: no number-size control |
| `measurement:elapsed_visual_hard` | O2: no number-size control |
| `measurement:heavier_lighter_visual` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:pictograph_intro` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:bar_graph_intro` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:reading_ruler` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:reading_ruler_hard` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:money_count` | O5: 7 controls (> 5)<br>O4 (probe): What to count = "Notes, totals to 500" with Currency = Plain deals totals of 2-40 (never notes to 500); with US dollar the printed sheet shows 12 × $100 notes (1,200 > 500) although "Coins at most" is 6; the sheet still says "Count the coins" / "I Can count coins"<br>O5: "Totals to" (25/50/100) and the "Notes, totals to 20/100/500" values of "What to count" are two number-size controls that contradict each other |
| `measurement:money` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:equiv_coin_sets` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:enough_money` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:make_change_least_coins` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:temperature` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:capacity` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:unit_conversions` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:length_customary` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:length_metric` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:unit_conversion_word` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:mass_volume_liquid` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:estimate_length` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:mixed_measurement` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `measurement:mixed_time` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `measurement:clock_parts` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `measurement:time_fives_ring` | O2: no number-size control |
| `measurement:coin_value` | O2: no number-size control<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:money_notation` | O2: no number-size control<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:money_change` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `measurement:money_compare` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `geo_mixed:geometry_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5: pool member labels are raw category ids |
| `geo_mixed:measurement_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `geo_mixed:geo_meas_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 6 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5: pool member labels are raw category ids |
| `graphs:bar_graph` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:build_bar_graph` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:pictograph` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:build_pictograph` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:tally_chart` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:line_plot` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:line_plot_g2` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:line_plot_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:pie_chart` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `graphs:mixed_graphs` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `data_analysis:mean` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:median` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:mode` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:range` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:box_plot_intro` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:histogram_read` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:mad` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_analysis:mixed_data_analysis` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 15 and the numbers 12 (the help promises "The biggest number") |
| `probability:probability_basic` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `data_mixed:data_stats_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `patterns:seq_2` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 16 and the numbers 15 (the help promises "The biggest number")<br>O4 (unverified): 13 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `patterns:seq_5` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 24 and the numbers 22 (the help promises "The biggest number") |
| `patterns:seq_10` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=50, range=100 — "Up to 10" but the answer reaches 39 and the numbers 40 (the help promises "The biggest number")<br>O4 (unverified): 12 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `patterns:count_by_fill` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:skip_count_line` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `patterns:skip_count_grid` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:count_by_step_up` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:count_by_step_down` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:count_by_powers_of_10` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:double` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:halve` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:shape_pattern` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:number_pattern` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 10 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `patterns:pattern_relationship` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `patterns:mixed_patterns` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `algebra:tape_diagram` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 20 and the numbers 20 (the help promises "The biggest number") |
| `algebra:tape_diagram_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 20 and the numbers 20 (the help promises "The biggest number") |
| `algebra:multi_step_word` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 27 and the numbers 37 (the help promises "The biggest number") |
| `algebra:multi_step_word_plain` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 36 and the numbers 44 (the help promises "The biggest number") |
| `algebra:solve_unknown` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O1: measured Decimal places on a skill whose name does not say decimals<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 12 and the numbers 90 (the help promises "The biggest number") |
| `algebra:balance_addsub` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:write_expression` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `algebra:evaluate_expression` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O1: measured Decimal places on a skill whose name does not say decimals<br>O4 (OC4): range=10, range=20 — "Up to 10" but the answer reaches 64 and the numbers 24 (the help promises "The biggest number") |
| `algebra:evaluate_expression_hard` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:inequalities` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 20 and the numbers 20 (the help promises "The biggest number") |
| `algebra:combine_like_terms` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:distributive_expr` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:function_table_easy` | O5: 9 controls (> 5)<br>O5 (live 420): 9 controls; the selected Support value "Frame (the rule on each In number; the rule box x ○ □)" is clipped in the select; "Task" sits under Layout although it changes what the pupil does |
| `algebra:function_table_hard` | O5: 9 controls (> 5)<br>O5 (live 420): 9 controls; the selected Support value "Frame (the rule on each In number; the rule box x ○ □)" is clipped in the select; "Task" sits under Layout although it changes what the pupil does |
| `algebra:algebra_word_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10, range=50, range=100 — "Up to 10" but the answer reaches 35 and the numbers 43 (the help promises "The biggest number")<br>O4 (unverified): 5 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `algebra:algebra_word_mixed_plain` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 23 and the numbers 30 (the help promises "The biggest number") |
| `algebra:solve_eq_addsub` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (unverified): 8 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `algebra:solve_eq_multdiv` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 14 and the numbers 16 (the help promises "The biggest number") |
| `algebra:solve_eq_twostep` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20 — "Up to 10" but the answer reaches 19 and the numbers 20 (the help promises "The biggest number") |
| `algebra:write_equation` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 20 (the help promises "The biggest number") |
| `algebra:build_expr_addsub` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:build_expr_multdiv` | O2: no number-size control<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `algebra:mixed_algebra` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 22 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `order_of_operations:oop_easy` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:oop_medium` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:oop_hard` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:two_ops_no_paren` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 89 and the numbers 45 (the help promises "The biggest number") |
| `order_of_operations:three_ops_no_paren` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:multi_ops_no_paren` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 60 and the numbers 35 (the help promises "The biggest number") |
| `order_of_operations:paren_simple` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 56 and the numbers 46 (the help promises "The biggest number") |
| `order_of_operations:paren_multi` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:nested_complex` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:exponents_simple` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:compare_expressions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `order_of_operations:mixed_order_ops` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 60 and the numbers 16 (the help promises "The biggest number") |
| `placevalue:place_value_disks` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:pv_disks_build` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:pv_digit_drag` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:number_word_names` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `placevalue:compare` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:combine` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:order_least_to_greatest` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:order_greatest_to_least` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `placevalue:mixed_placevalue` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `placevalue:unit_form` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:nearest_million` | O2: no number-size control |
| `number_sense:round_sort_million` | O2: no number-size control |
| `number_sense:round_sort_tenths` | O2: no number-size control |
| `number_sense:round_sort_hundredths` | O2: no number-size control |
| `number_sense:estimate_sums_diffs` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:estimate_products` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:estimate_quotient` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:rounding_table` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:make_a_ten` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:doubles_near_doubles` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:compensation` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10, range=20, range=50 — "Up to 10" but the answer reaches 100 and the numbers 97 (the help promises "The biggest number") |
| `number_sense:mixed_number_sense` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 90 and the numbers 11 (the help promises "The biggest number") |
| `number_sense:between_tens` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_sense:place_on_number_line` | O3: the item carries a hint scaffold (picture / model / line) that cannot be faded or added from the panel |
| `number_theory:prime_composite` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 20 and the numbers 20 (the help promises "The biggest number") |
| `number_theory:factors_identify` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 12 (the help promises "The biggest number") |
| `number_theory:factor_tchart_easy` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 12 (the help promises "The biggest number") |
| `number_theory:factor_tchart_medium` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 18 (the help promises "The biggest number") |
| `number_theory:factor_tchart_hard` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 24 (the help promises "The biggest number") |
| `number_theory:factor_links_easy` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 12 (the help promises "The biggest number") |
| `number_theory:factor_links_medium` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 18 (the help promises "The biggest number") |
| `number_theory:factor_links_hard` | O1/O2: only the measured Max Number / Decimals override; the family essentials (size ladder, complexity, representation) are not on the panel<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 24 (the help promises "The biggest number") |
| `number_theory:multiples` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches null and the numbers 12 (the help promises "The biggest number") |
| `number_theory:gcf_easy` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_theory:gcf_hard` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 12 and the numbers 36 (the help promises "The biggest number") |
| `number_theory:lcm` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support)<br>O4 (OC4): range=10 — "Up to 10" but the answer reaches 70 and the numbers 41 (the help promises "The biggest number") |
| `number_theory:divisibility_sort` | O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `number_theory:mixed_number_theory` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `algebra_mixed:patterns_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10, range=20, range=50 — "Up to 10" but the answer reaches 37 and the numbers 32 (the help promises "The biggest number") |
| `algebra_mixed:algebra_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 22 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page |
| `algebra_mixed:order_ops_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (OC4): range=10, range=20, range=50, range=100 — "Up to 10" but the answer reaches 125 and the numbers 27 (the help promises "The biggest number") |
| `algebra_mixed:placevalue_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `algebra_mixed:number_sense_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `algebra_mixed:number_theory_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support |
| `algebra_mixed:algebraic_all` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O5: pool member labels are raw category ids |
| `all_mixed:all_domains_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 28 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_k_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_1_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_2_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 12 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_3_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 15 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_4_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 21 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_5_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 17 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `all_mixed:grade_6_mixed` | O2/O3: a pool offers only "Which skills"; no way to make the whole review easier/harder or give more/less support<br>O4 (unverified): 12 value(s) could not be checked for a difference because the generator ignores the seed — the verifier only checked predicates, so "pass" is not evidence the value changes the page<br>O5 (live): "Which topics" values are category ids title-cased ("Number ops mixed", "Placevalue", "Shapes early") — use the DOMAINS names ("Mixed operations", "Place value", "Early shapes") |
| `vocabulary:vocab_grade_K` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_counting` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_K_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_counting` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_1_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_counting` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_2_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_3_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_4_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_5_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_operations` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_fractions` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_geometry` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_data` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_algebra` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
| `vocabulary:vocab_grade_6_measurement` | O2: only "What the items ask" (item kinds); no number-size or difficulty ladder<br>O3: no support control — the teacher cannot add a worked example / hint or fade to bare (owner rule: every panel gives more or less support) |
