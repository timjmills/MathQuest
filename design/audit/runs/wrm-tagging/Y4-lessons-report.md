# Y4 (US Grade 3) site lessons: builder report

Branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y4`. The owner rule of 2026-10-16 is that every site lesson is tagged. This lane tags the 23 `wrmYear: "Y4"` entries of `data/curriculum/site-lessons.json`. They go in a new top-level `lessons` section of `data/curriculum/links/Y4.json`, in the Y5 shape.

The Y4 WRM steps passed the Y4 lane's critic r13 and are **frozen**. The steps, the tagFixes and every step proposal are byte-for-byte equal to the base. A Y4 base proposal that a lesson builds gains only `lessons` and `closes[<lesson id>]`, appended at the end; the frozen gate strips both.

The tooling is ported from the Y1 lessons lane, which passed critic r3: its gates and failure classes, the post-finish snapshot and the source-equality gates. The Support source-year rules come from the Y6 lane.

## Counts

| | |
|---|---|
| Lessons | 23: 11 committee, 11 Support, 1 native |
| Verdicts | **7 full, 14 partial, 2 gap** |
| Proposals used by lessons | **20: 5 new, 15 reused** |
| Reused proposals | 1 Y4 base (`time_units`), 8 WRM_PROPOSALS, 6 STANDARD_PROPOSALS, 2 copied verbatim from passed lanes (`make_amount_notes` from Y3.json, `frac_compare_same_part` from Y5.json) |
| New proposals | `estimate_mass_volume`, `ruler_object_inch`, `money_place_value`, `area_split_tiles`, `compare_durations` |
| Lesson tagFixes | 0 |
| Lesson links | 89 pre / related links, plus 29 direct / partial links |

## Build and gates

The documented order, in `lessons_build.py`:

1. `keys.mjs`
2. `prior.mjs`
3. `Y4/build.py` (the frozen step build, which writes Y4.json without lessons)
4. `Y4/lessons_build.py`, last

The new files are all in `tests/scripts/wrm-tagging/Y4/`:

| File | What it holds |
|---|---|
| `lessons_build.py` | The lessons build. It runs the frozen gate (sha `d4d03a36…`) on input and on output, then runs every gate below |
| `lessons_spec.py` | The 23 lessons. The name avoids `spec*.py`, which `build.py` globs |
| `lessons.py` | The shape and the checks, including rule 5: a non-full lesson must carry a search record, written as `rule5` |
| `lessonspec.py` | The spec gate |
| `lessoncheck.py` | The post-finish snapshot of every lesson field and every field of every proposal a lesson uses. It also gates a copy against its source: a lane file or the live lists |
| `lessonfit.mjs` | Every rule class of the Y1 lane, plus the Grade 3 FIRST and tables rule 19, the Support source-year content and citing rules, DENOMS, G, and two new classes, NEVERUNIT and BETWEEN |
| `claims.mjs`, `titlerep.mjs` | Ported from Y1, with Y4 title claims added |
| `full_audit.json` | The hand-audit rows of the 7 FULL lessons |
| `lessonmerge.mjs` | The merge check |
| `lessonmut.py` | The mutations |
| `lessonitems.mjs`, `phases.json` | The item dump and the Reception phases |

| Gate | Result |
|---|---|
| Two clean `git archive` builds (dump, step build, lessons build) | Byte-identical: sha256 `092c0eb1…` |
| Frozen gate | OK |
| lessonspec | 0 differences |
| lessoncheck | 0 differences |
| lessonfit | 0 findings on 5 seed sets (default, and `[[13579,41],[24680,59]]`, `[[31337,29],[70707,61]]`, `[[11213,31],[98765,67]]`, `[[61001,37],[90907,53]]` at n=60) |
| lessonmut | **92 mutations and controls, 0 missed**: lessonfit classes, audit rows, lessons.py checks, lessonspec, frozen, lessonmerge, post-finish edits and source gates |
| lessonmerge Y4 alone, and Y4 with R, Y1, Y2, Y3, Y5, Y6 one by one | 0 problems |
| lessonmerge all seven at once | 0 real conflicts, 0 lesson tagFixes |
| lessonmerge with Y1 from /home/user/wt-l1 (with its lessons) | 0 problems |
| lessonmerge with Y2 / Y3 from /home/user/MathQuest | 0 problems (byte-equal to the in-repo files) |
| `ws-wrm-extract --check` | Exit 0 |
| `ws-boot-smoke` | OK |

Notes on the merge and the gates:
- **The Y2 / Y4 overlap.** The known overlap `patterns:count_by_step_up|Y2.B1.S15` is a frozen hand fix in both passed step lanes. `lessonmerge.mjs` lists it as KNOWN_FOREIGN.
- **Two gates were tightened during the sweep:**
  - `claims.mjs` negatedHits now reads the story cell's payload operation, and allows at most 1 item in 10.
  - UK "pounds" beside pence or notes is now read as money, not as a mass.

## Audit table (verdict, links and why)

| Lesson | Week / source | Verdict | Direct / partial (opts) | Build |
|---|---|---|---|---|
| Find the rule in an input-output table | W05 | full | `function_table_easy {ftTask:rule, ftRules:[+,−], band:100}`, `{ftTask:rule, ftRules:[×,÷], band:20}` | - |
| Patterns on the multiplication table | W05 | partial | `mult_chart {task:pattern}`, `{task:even}` | patterns_notice |
| Properties of multiplication | W05 | full | `mult_properties {forms:[0,1,2]}` | - |
| Two-step word problems, four operations | W06 | partial | `multi_step_word {}` (+ / − only), `word_problems_mixed {}` (one step) | multi_step_four_ops |
| Partition shapes into equal areas | W07 | partial | `partition_shapes {}` | partition_draw |
| Add / subtract word problems within 1,000, bar models | W17 | full | `add_wp_1k` / `sub_wp_1k {band:1000, support:bar}` | - |
| Area as multiplication | W20 | partial | `area_unit_squares {forms:[0]}`, `area {forms:[2]} @100` | area_tile_multiply |
| Distributive and additive area | W20 | partial | `area_distributive_visual {band:30}`, `area_polygon_decompose {band:25}` | area_split_tiles |
| Mass and liquid volume | W22 | partial | `mass_volume_liquid` forms 0, 1, 2 | mass_scales, estimate_mass_volume, mass_ops |
| Measure to the half and quarter inch | W27 | partial | `reading_ruler {parts:[1,2]}` | ruler_object_inch |
| Build a line plot from inch measurements | W28 | partial | `line_plot_fractions {}` | make_line_plot |
| Compare amounts (more, fewer, same) | Support, R | full | `compare_groups {band:5, level:[1]}` | - |
| Compare durations of time | Support, Y2 | partial | `elapsed_visual_easy {}` (one duration) | time_units, compare_durations |
| Comparing multiplication statements | Support, Y3 | gap | - | compare_sentences |
| Count money: notes and coins | Support, Y2 | full | `money_count {usd, kind:both}`, as the Y3 lane | - |
| Doubles and near doubles within 20 | Support, Y3 | full | `doubles_near_doubles {}` | - |
| Find durations of time | Support, Y2 | full | `elapsed_visual_easy {}` | - |
| Introduce capacity and volume | Support, Y1 | gap | - | capacity_early |
| Introduce weight and mass | Support, Y1 | partial | `heavier_lighter_visual {}` | measurable_attributes, balance |
| Order fractions | Support, Y3 | partial | `order_fractions {}` (unlike denominators) | frac_compare_same_part, as the Y5 lane |
| Pounds, tens, ones and pence (dollars and cents) | native, the week of Y4.B10.S1 (W37) | partial | `money_notation {usd}` (amounts under $10, no chart) | money_place_value |
| Select money | Support, Y2 | partial | `make_change_least_coins {usd}`, as the Y3 lane | make_amount_notes |
| Sharing and grouping (fair shares) | Support, R, Phase 10 | partial | `share_into_groups {band:12}` (grouping only) | share_group |

Each lesson has at least 3 pre, except one. Every pre is cited by a step or lesson taught earlier: a Y4 step of an earlier week, a lower year, or a site lesson. The line-plot lesson cites the W27 inch lesson.

The exception is "Compare amounts". It is a Reception first-block lesson, so it has 1 pre and a "Pre-skills are few" note.

**Support lessons** cite only their source year or below. The Phase 10 lesson cites only R blocks before R.B16.

**FULL lessons** each have a row in `full_audit.json`. The row reads the title and every site CCSS code. A code clause that the title does not name is marked "site tag" with its reason:
- **3.OA.D.9** "explain": that is the partial patterns lesson.
- **3.OA.B.5** associative: Y4.B4.S13, a gap (mult_three).
- **3.OA.D.8** two-step: the W06 lesson.
- **2.OA.B.2** subtraction: not dealt here.
- **3.MD.A.1** to the minute: above the Grade 1 source.

## Rule 5 table (search for an existing skill and options)

Every partial or gap lesson carries the search record in `lessons[...].rule5`. In summary:

| Lesson | Searched (none delivers the missing clause) |
|---|---|
| Patterns on mult table | `mult_chart` tasks fill / headers / shade / pattern / even; `mult_chart_easy`; `mult_properties` 0-3; `count_by_tables`; `number_patterns_rule` |
| Two-step | `multi_step_word` 0-3 and `wpBar`; `_plain`; `word_problems_mixed`; `algebra_word_mixed`; `mult_word_problems` 0-2; `money` |
| Partition | `partition_shapes` forms / parts; `identify` / `shade` / `write_fraction`; `compose_whole`; `whole_as_fraction`; `half_or_not` |
| Area as mult | `area_unit_squares` 0 / 1; `area` 0-2 (forms 0 includes triangles); `area_perimeter`; `compose_rect_from_squares`; `dot_array_mult` / `arrays_groups` |
| Distributive area | `area_distributive_visual` 30 / 50; `area_polygon_decompose` 0-2; `composite_shapes` 0 / 1; `area` forms 2; `mult_properties` 1 |
| Mass and volume | `mass_volume_liquid` 0-2; `capacity` units / forms; `unit_conversions`; `unit_conversion_word`; `estimate_length`; `heavier_lighter` |
| Half / quarter inch | `reading_ruler` parts / labels; `reading_ruler_hard`; `estimate_length`; `length_customary`; make_line_plot / ruler_difference (builds) |
| Line plot | `line_plot` 0 / 1; `line_plot_g2` 0-2; `line_plot_fractions` 0-2; `build_bar_graph`; `build_pictograph` |
| Compare durations | `elapsed_visual_*`; `elapsed_find_duration`; `elapsed_hour` / 30min / 15min; `order_clocks_*`; `time_sense` |
| Comparing multiplication statements | `compare_expressions` 0 / 1 (order of operations, above Grade 2); `placevalue:compare`; `equal_sign`; `balance_addsub`; `mult_properties` 0 |
| Capacity | `capacity` (units, conversions); `mass_volume_liquid` 0; `compare_objects`; `heavier_lighter` |
| Weight | `heavier_lighter` 0 / 1; `mass_volume_liquid` 1; `compare_objects` |
| Order fractions | `order_fractions` 0-2; `order_frac_numline`; `compare` denoms / forms; `compare_frac_lcd` |
| Pounds, tens, ones | `money_notation` collection / words; `money_count` kinds; `coin_value`; `money_compare`; money_convert (Y4); `placevalue:identify` |
| Select money | `make_change_least_coins`; `equiv_coin_sets`; `money_count`; `money`; `enough_money` |
| Sharing and grouping | `share_into_groups` 12 / 24; `div_word_problems`; `fraction_of_set`; `odd_even` |

## Root-cause sweep findings (all fixed)

I read every link against 40 or more fresh-seed items (seed 55511, with the question, the answer and the payload or visual). Every FULL lesson was also read against each clause of its title and of its CCSS descriptor. Found and fixed:

1. **Mass and volume, forms 1.** The clause said "a kilogram scale; never grams", but 18 of 40 items read grams on a scale to 2,000 g. The clause, the `missing` text and the `mass_scales` closes were rewritten.
   - New gate NEVERUNIT: a negated unit that the items show is a failure.
2. **Find the rule, × / ÷ rules.** At band 100, 55 in 100 × / ÷ rows leave the tables (87 ÷ 3 is taught in W06). The lesson is now split into two links: + / − to 100, and × / ÷ at band 20, where every row is a fact. The note said "× 9: 2 → 18", but band 20 deals × 2 to × 5 only. The note and the audit row were corrected.
3. **Partition.** The clause said "never names one part as a unit fraction", but items answer 1/4 with one part shaded. Rewritten.
4. **Distributive pre.** The example "6 × 7 = 6 × 5 + 6 × 2" splits the wrong factor; the items break the rows (5 × 8 = 4 × 8 + 1 × 8). Fixed in the why, the note and the audit row. The option label of `mult_properties` forms 1 has the same mismatch; that is a skill-catalogue item.
5. **Fraction number line pre.** The why said "between 0 and 1", but items deal 5/2.
   - New gate BETWEEN.
6. **identify pre.** The why said "halves and quarters", but items show 5/6. It now uses `{denoms:[2]}` and names the distractor families (DENOMS).
7. **Bar-model lesson pres.** The 4-digit column pres were harder than a within-1,000 lesson. They were replaced by the Grade 2 Y3.B2.S14 / S16 skills and `nearest_100`. The related `sub_check_by_adding` showed a 1,643 distractor; it was replaced by `comparison_word`.
8. **Inflated or false examples.**
   - "Three to five fractions" is now "three to six, some in larger terms".
   - "12 counters, groups of 3, 4 or 6" is now "8 to 12 counters, groups of 3-6".
   - The cylinder scales are now "100, 200, 500 or 1,000 mL".
   - "areas 4 to 48" is now "6 to 48".
   - The story examples in the word-problem clauses were replaced by dealt ones.
   - "counting nickels" was dropped.
   - "recording" a tally chart is now "reading".
   - "one whole as n/n" now reads "a whole number as a fraction" (5/1 is dealt).
9. **Introduce weight and mass.** It was first partial on the balance alone. It is now also held to K.MD.A.1, "several attributes of one object", which no item deals; build measurable_attributes. This is consistent with Y1.B8.S1 being FULL on the same skill for the comparison only.
10. **Compare durations.** time_units, which gives a sense of which activity is longer, did not close "two start / end durations compared". The new option `compare_durations` was added.
11. **Gate false positives found and fixed.**
    - Money payload cents (805 for $8.05) were counted as numbers, and money decimals as Grade 4 decimals.
    - UK "pounds and pence" was read as a mass.
    - The K "properties" title claim fired on "properties of multiplication".

## Owner questions (with recommendations)

1. **Site tags on FULL lessons.** Three committee lessons are tagged with a code whose clause the title does not name: find the rule (3.OA.D.9 "explain"), properties (associative) and bar models (3.OA.D.8 two-step). *Recommendation:* keep them full on their titles. The clauses are dealt by the same week's patterns lesson, by Y4.B4.S13, and by the W06 two-step lesson.
2. **Bar models within 1,000.** The domain test may ask two-step stories (3.OA.D.8). *Recommendation:* if it does, retitle the lesson or move 3.OA.D.8 to the two-step lesson only.
3. **Grade 3 codes on Support lessons.** Find durations, sharing and grouping, and the others carry a Grade 3 code but are judged at their source year. *Recommendation:* keep the Support judgement; the Grade 3 code describes where the lesson leads.
4. **The native "Pounds, tens, ones and pence".** It is read as the place value of money: tens and ones of dollars, dimes and pennies. *Recommendation:* confirm the reading. If it means only "write money with a point", it is FULL on `money_notation`, like Y4.B10.S1.
5. **Merge.** No Y4 base proposal had `closes` before. Lessons add `closes = {lesson id: clause}`, the same dict form as Y5 and Y6.
