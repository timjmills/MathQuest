# Y4 (US Grade 3) site lessons: independent critic, round 1

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y4.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y4` at a46bb4fb. The file is `data/curriculum/links/Y4.json` (sha256 `092c0eb1…`), section `lessons`:

- 23 lessons: 7 full, 14 partial, 2 gap (11 committee, 11 Support, 1 native);
- 118 links (89 pre / related);
- 20 proposals used by lessons: 5 new (`estimate_mass_volume`, `ruler_object_inch`, `money_place_value`, `area_split_tiles`, `compare_durations`) and 15 reused.

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **7**: lessons 4, 8 and 10 |
| Mean ≥ 8 | **No.** 181 / 23 = **7.87** |
| Steps frozen | **Yes** (§3) |
| 0 real merge conflicts | **Yes.** 0 real conflicts and 0 lesson tagFixes (§5) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§4) |
| Coverage complete | **Yes.** 23 / 23 site lessons, with the same ids, order, titles, flag, firstWeek and ccss. `ws-wrm-extract --check --site …` exits 0 |

The structure is sound. The frozen gate, the post-finish snapshot, the source-equality gates and the merge are strong: my 19 post-finish edits are all caught. The FULL verdicts hold. Twenty lessons are right.

Three lessons have a link defect that the gates cannot see:

- **F1, lesson 4.** A pre is harder than the lesson: it divides by 13, 14 and 15.
- **F2, lesson 8.** A related deals areas about 6 times larger than the lesson's, although a band option that fits exists.
- **F3, lesson 10.** A pre why makes a false claim about the distractor models.

Each defect sits in a class that lessonfit does not gate (G1-G3, §2).

## Method

- **Fresh seeds.** None of these is in the report or the builder's tooling. Scripts and logs are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y4lc1/`.
  - **Every link.** `samp.mjs` read every link of every lesson through `generateQuestionFor`: the print path, the link's opts and Max Number, and `itemIndex` / `itemCount`. It took 45 items a link (seed 60917, stride 43), with the question, the answer, the options and the kit payload or the visual (`s1.txt`, 5,455 lines).
  - **Size.** `maxes.mjs` found the largest number of every link at seed 42421 / 59, 50 items a link.
  - **Probes.** `g.mjs` and `vis.mjs` ran 60-400 items a skill at seeds 91919, 31337, 77003, 1234, 8080, 2468, 1357, 5511 and 7777, for the questions in doubt:
    - divisors in the story skills;
    - "times as many";
    - composite-shape areas;
    - the distractor families of `identify`;
    - the low end of the `area_unit_squares` areas;
    - doubles;
    - the `share_into_groups` sizes;
    - the `mult_properties` form split;
    - the `money_count` totals;
    - the `doubles_near_doubles` sums.
  - **lessonfit.** `lessonfit --n 60` ran on `[[60917,43],[42421,59]]`, `[[77003,31],[8080,29]]` and `[[1357,7],[91919,37]]`. Each gave **0 findings**: the gates do not flap.
- **Rubric (the brief's).**
  - Each FULL lesson was read against every clause of its title AND its CCSS descriptor (`ccss-math.json`), and against its `full_audit.json` row.
  - Each partial / gap clause was checked as true and complete.
  - The rule-5 claims were spot-checked in `skill-options.js` and the SKILLS labels for 15 lessons: 2, 4, 5, 7, 8, 9, 10, 11, 13, 14, 19, 20, 21, 22 and 23.
  - Every pre / related why was read against at least 45 items.
  - Every pre was checked as earlier and not harder. I mapped each cited step to its school week from `prior.json`: every committee pre is earlier than its lesson's week. Support lessons were checked at their source year.
  - The proposals were checked (§1, last part).

## 1. Lesson grades: all 23

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Find the rule in an input-output table (W05) | full | 8 | **+ / − link:** 4 filled rows, rules + 1 to + 30 and − 2 to − 29, every number to 99. **× / ÷ link:** × 2-5 and ÷ 2-5, every number ≤ 20, so every row is a table fact (24 × and 21 ÷ in 45). The title is dealt. 3.OA.D.9 "identify" is dealt; "explain" is recorded as missing on lesson 2 (owner Q1, §6). The pres are W01 / W02. The related `number_patterns_rule` gives add-rule sequences, as its why says |
| 2 | Patterns on the multiplication table (W05) | partial | 8 | `mult_chart {task:pattern}`: "Fill in the 5 row. Write the rule." with ruleBox "add 5 each time". `{task:even}`: "Tap every even product" (`shade: 2`). Both clauses are true. Rule 5 holds: the task enum is fill / headers / shade / pattern / even, and none explains. The default 12 × 12 window is fine at W05, because the school teaches the 11 and 12 tables at W03 |
| 3 | Properties of multiplication (W05) | full | 8 | In 150 items: commutative (array turn) 49, distributive 48 ("5 x 7 = 3 x 7 + ___ x 7"), identity 53 (8 × 1 … 1 × 12). The title's three properties are dealt, and the audit row is true. Associative is recorded as Y4.B4.S13 / `mult_three` (owner Q1) |
| 4 | Two-step word problems, four operations (W06) | partial | **7** | **F1.** The pre `div_word_problems` carries no opts, so it runs at Max Number 10,000. It cites a Grade 2 step, but it divides by 13, 14 and 15 in 15 of 100 items (126 ÷ 14, 117 ÷ 13, 150 ÷ 15) and 4 of 45 at my main seed. That is harder than any Grade 3 table at W06. The Y4 step lane links the same skill with `{range: 100}`, which removes every such item (0 / 100). The partial `word_problems_mixed` clause is true as far as it goes, but it hides two things: "times as many" comparisons (20 / 100; 4.OA.A.2, Grade 4) and factors past the tables at the default Max Number (14 × 3, 13 × 8, 126 ÷ 14). At Max Number 100 the factors are gone; "times as many" stays. The `multi_step_word` clause is true (+ / − only, 45 / 45; numbers to 128) |
| 5 | Partition shapes into equal areas (W07) | partial | 8 | Answers in 120: counts 2 / 3 / 4, and shaded 1/2, 1/3, 1/4, 2/3, 2/4, 3/4. Never sixths or eighths, and never a cut: true. Rule 5 holds: the only partition skills are `partition_shapes`, `share_into_groups` and `halve`. The pres' fifths / tenths are Grade 2 (WRM Y3) content, cited at Y3.B6 |
| 6 | Add / subtract word problems within 1,000, bar models (W17) | full | 8 | `bar: true` on 45 / 45. Join, put-together and take-away stories with every number ≤ 997. The title is dealt (owner Q2 on 3.OA.D.8). The pres are Y3.B2 3-digit columns, `nearest_100` (W13) and `add_wp_100`. The related `comparison_word` deals numbers to 20, as its why says |
| 7 | Area as multiplication (W20) | partial | 8 | `area` forms 2 at 100: patio, wall and room stories in feet, never tiled: true. Rule 5 holds (`area_unit_squares` forms 0 / 1 with bands 12 / 24; `area` forms 0-2). n1: the `area_unit_squares` clause says "areas 6 to 48", but the generator draws 2-8 × 2-6 and deals area 4 in 7 of 400 items. The report's sweep turned a true "4 to 48" into the false "6 to 48" |
| 8 | Distributive and additive area (W20) | partial | **7** | **F2.** The related `composite_shapes {forms:[1]}` runs at the default band. Its areas are 22-195 (median 88 in 60 items), with perimeters to 56 on T-shapes whose missing sides must be found. The lesson's own items stop at 30. The skill has `band: 25 / 40`, and band 25 deals areas 14-24. This is brief rule 18, which is checked per lesson (Y4 critic r4), with an option that fits missed. The two partial clauses are true: `area_distributive_visual` draws no grid line (SVG read), and `polygon_decompose` tells no story. The pres are true: forms 1 breaks the rows (5 × 8 = 1 × 8 + 4 × 8), and the `area_model_mult` products to 711 are the cited W17 step's own content |
| 9 | Mass and liquid volume (W22) | partial | 8 | The cylinder is scaled to 100 / 200 / 500 / 1,000 mL, and the dial to 1,000 / 2,000 g or 5 / 10 kg. Forms 2 sorts or clicks by unit. The three clauses are true. Rule 5 holds: the SKILLS search for mass / capacity / litre / scale finds only `mass_volume_liquid`, `capacity` and `heavier_lighter_visual`. n2 on `estimate_mass_volume` (§1, proposals) |
| 10 | Measure to the half and quarter inch (W27) | partial | **7** | **F3.** The pre `identify {forms:[1], denoms:[2]}` has the why "…halves, quarters or eighths (the other models in thirds, fifths or sixths)". In 100 items, 80 show another halves / quarters / eighths model among the distractors: 1/4 and 2/4 for 7/8, 5/8 and 3/8 for 6/8, and so on. The why is false. It was written to satisfy the DENOMS gate (report sweep item 6) and over-states it. The `reading_ruler` clause is true. Rule 5 holds: `reading_ruler_hard` also only reads an arrow, `estimate_length` is metric and multiple choice, and no skill draws an object on a ruler |
| 11 | Build a line plot from inch measurements (W28) | partial | 8 | `line_plot_fractions` reads only (total, most common, how many at a mark), with halves, quarters and some eighths: true. Rule 5 holds (`line_plot` / `_g2` / `_fractions`, `build_bar_graph`, `build_pictograph`). The pres are W27, W25 and W08 |
| 12 | Compare amounts | full | 8 | Groups 1-5, level 1, with more / fewer / same all asked. Holds at Reception. The note "pre-skills are few" holds |
| 13 | Compare durations of time | partial | 8 | `elapsed_visual_easy` gives one duration, in half-hour steps, 0 h 30 min to 3 h 0 min: true. Rule 5 holds (`elapsed_*`, `order_clocks_*`). n3: the related `time_sense` (a.m. / p.m.) is a weak fit for comparing durations (rule 4). `compare_durations`' closes adds "and by how much", which `missing` does not say |
| 14 | Comparing multiplication statements | gap | 8 | `compare_expressions` forms 0 / 1 mixes + and × under the order of operations ("6 + 2 × 2 ◻ 9 + 21 ÷ 7"), so the gap is honest. The pres are Grade 2 tables and Grade 1 compare. The related is the commutative array |
| 15 | Count money - notes and coins | full | 8 | $1-$50 bills and coins; the pupil writes both numbers. As the Y3 lane judged. n4: the audit row says "totals to 100 dollars", but $100.46 is dealt |
| 16 | Doubles and near doubles within 20 | full | 8 | In 200 items: doubles 70, +1 70, −1 60; sums 2-20 (none of 3). The title is dealt; the 2.OA.B.2 subtraction site tag is noted |
| 17 | Find durations of time | full | 8 | Durations are whole and half hours on a labelled time line. FULL holds at the Grade 1 source (owner Q3). The related `elapsed_30min` is true |
| 18 | Introduce capacity and volume | gap | 8 | No K capacity item exists: an honest gap, built by `capacity_early`. The `compare_objects` pre deals longer / taller / thicker, 20 each in 120, as its why says |
| 19 | Introduce weight and mass | partial | 8 | Heavier / lighter only, never a balance: true. `measurable_attributes` and `balance` split the `missing` |
| 20 | Order fractions | partial | 8 | Unlike denominators throughout; "2/8, 2/4, 2/6" is ordered as 1/4, 1/2, 1/3 (larger terms). True. Rule 5 holds: `order_fractions` has only forms 0-2, and `compare` is pairs |
| 21 | Pounds, tens, ones and pence (US) | partial | 8 | `money_notation {usd}`: amounts under $10, $5 / $1 bills, the point. Clause true. n5 on `money_place_value` (§1, proposals) |
| 22 | Select money | partial | 8 | The fewest coins to 50¢, no bills: true. As the Y3 lane. Rule 5 holds (`equiv_coin_sets` has no make task) |
| 23 | Sharing and grouping (fair shares) | partial | 8 | In 200 items: 8-12 counters in groups of 3, 4, 5 or 6, grouping only, always fair: true. The pres are R.B11, before Phase 10 (R.B16). n6: the `double {band:20}` pre doubles to 20 (25 % past 10) at Reception. That is the R lane's own partial for R.B11.S12, and the why ("two equal bars") is true |

**Sum 181 / 23 = 7.87; min 7; 20 at 8, 3 at 7.**

### The 7 FULL lessons and owner question 1

I re-read each FULL lesson against its title, its CCSS descriptor and its `full_audit.json` row. All 7 hold on the title. The rows are true, apart from n4 (lesson 15's "$100").

On owner question 1, I agree that FULL is right for lessons 1, 3 and 6. The descriptor clauses the titles do not name are not lost:

- 3.OA.D.9 "explain" is lesson 2's `missing` (build `patterns_notice`).
- 3.OA.B.5 associative is Y4.B4.S13 (gap, `mult_three`).
- 3.OA.D.8 two-step is lesson 4's `missing` (`multi_step_four_ops`).

Each row names its site tag. This is the precedent of Y1 r3 (lesson 32, the 2.NBT site tag).

### Proposals

- **Copies.** Every reused copy equals its source in every field except the lesson fields:
  - 7 WRM_PROPOSALS (`balance`, `capacity_early`, `compare_sentences`, `mass_ops`, `mass_scales`, `share_group`, and `time_units` through the Y4 base);
  - 6 STANDARD_PROPOSALS;
  - `make_amount_notes`, which equals Y3.json;
  - `frac_compare_same_part`, which equals Y5.json.

  I checked this with my own `srceq.mjs`.
- **closes and lessons.** Every proposal's `closes[<lesson>]` equals its lesson's `missing`, or splits it where a lesson has two builds. Every proposal a lesson builds lists that lesson.
- **The 5 new ones.** All are options on the lesson's own skill, with a B&W boxed-cell representation, and each closes its clause. Two overlap existing entries that the rule-5 records do not name. The overlaps are non-blocking, as in Y1 r3 n11:
  - **n2.** Y5.json `capacity_estimate` ("Estimate Capacity (option)", 3.MD.A.2) already covers the liquid-volume half of `estimate_mass_volume`.
  - **n5.** VISUAL_BUILDS `vis_coin_options` already plans "a place-value chart of coins (£1 / 10p / 1p)", and Y4's own `money_convert` spec has "place chart $ | ¢". `money_place_value` should name both, and say why a separate option is still needed (the tens column of dollars).

## 2. Gates: my mutations, old and new

- **Builder's `lessonmut.py`.** Run in clean tree A: **92 mutations and controls, 0 missed** (6 min 35 s). The tree's Y4.json was restored to `092c0eb1…`.
- **Post-`finish()` edits (`postmut.py`).** Run in clean `git archive` tree B. Each edit was inserted right after `out['lessons'] = lessons`, and the full `lessons_build.py` was run. **19 edits, 19 caught; the control exits 0 with the committed sha.**

| # | Edit after finish() | Caught by |
|---|---|---|
| p1 | L4 pre re-optioned `{range:100}` | lessonspec, lessoncheck |
| p2 | L19 verdict → full | lessoncheck |
| p3 | `money_place_value.closes[L21]` rewritten | lessoncheck |
| p4 | `ruler_object_inch.lessons` emptied | lessoncheck |
| p5 | L23 `missing` rewritten | lessoncheck |
| p6 | a step verdict changed | FROZEN (output) |
| p7 | FULL L16 given a build | lessoncheck |
| p8 | L1 pre why gains a bound | lessoncheck |
| p9 | new proposal `compare_durations.teaches` edited | lessoncheck |
| p10 | reused copy `make_amount_notes.name` edited | lessoncheck, lessonmerge Y2 / Y3 |
| p11 | orphan lesson-only proposal added | lessoncheck |
| p12 | a lesson deleted | lessonspec, lessoncheck, lessonmerge |
| p13 | L10 `site.firstWeek` edited | lessoncheck |
| p14 | an unused base proposal edited | FROZEN |
| p15 | a tagFix naming a lesson appended | FROZEN |
| p16 | base `time_units.teaches` edited | FROZEN |
| p17 | a related added | lessonspec, lessoncheck |
| p18 | a build dropped | lessoncheck |
| p19 | a proposal lists a lesson that does not build it | lessoncheck |

**My lessonfit mutations (`mymut.py`, tree B, `--n 40`).** 20 runs: a control plus 19 mutations. Mutation 17 is invalid, because area (first taught W18) at a W17 lesson is within the 2-week related window. Of the 18 that remain, 5 are caught, 1 is caught for an unrelated reason, and 12 are missed. Three of the 12 are the defects already in the file.

| # | Mutation | Result |
|---|---|---|
| 1 | (in file) L4 pre `div_word_problems` ÷ 13 / 14 / 15 | **missed** (G1) |
| 2 | L4 pre why "never dividing by more than 12" | **missed** (G2) |
| 3 | L8 related why "areas to 30" (190 dealt) | **missed** (G2) |
| 4 | (in file) L10 why "the other models in thirds, fifths or sixths" | **missed** (G3) |
| 5 | L10 why "never another quarter or eighth model" | caught (DENOMS) |
| 6, 7 | (in file) L7 "areas 6 to 48"; mutated to "areas 9 to 48" | **missed** (G2) |
| 8 | L23 clause "groups of 2, 3, 4, 5 or 6" (2 never dealt) | **missed** (G3) |
| 9 | L5 clause "never thirds" (thirds dealt) | **missed** (G3) |
| 10 | L13 related why "how long an activity takes, in minutes" | **missed** (free text) |
| 11 | L11 related why "the same inch measurements as a line plot" | caught (claims) |
| 12 | L21 clause "never a $5 bill" ($5 dealt) | **missed** (G3) |
| 13 | L9 forms 1 "kilograms only … never grams" | caught (NEVERUNIT) |
| 14 | L2 pre why "products to 90" (108 dealt) | **missed** (G2) |
| 15 | L16 FULL on `double` | caught (TITLEREP) |
| 16 | L3 FULL on forms [0] only | caught (TITLEREP) |
| 18 | L4 pre `word_problems_mixed` (times as many, ÷ 14) | caught, but only by CITE / OWN, never by content (G1) |
| 19 | L1 pre why text "wk W09" (the cited step is W02) | **missed** (CITE reads the step id, not the text; minor) |

The gate holes:

- **G1: size and tables in stories.** SIZE uses a year-wide Grade 3 ceiling of 1,000. Rule 19's table check reads only "a × b" in the question text. A story that divides 126 by 14, or a related with areas to 195 at a lesson that stops at 30, passes. Brief rule 18 asks for the check per lesson (Y4 critic r4). Two fixes:
  - read the story cell's `steps[].a/b/op` for divisors and factors past 12 (and past the tables taught by the week);
  - compare each pre / related link's largest number with the lesson's own dealt maximum, max(1.5 × c, c + 2), or with the cited unit's maximum for a pre.
- **G2: bounds the items break.** G5 fails only a bound larger than 1.5 × the largest dealt. It does not fail:
  - a bound the items exceed ("products to 90" with 108 dealt; "areas to 30" with 195);
  - a lower bound the items go below ("areas 6 / 9 to 48" with 4 dealt);
  - "never more than N".
- **G3: positive and negative claims outside the fraction and unit families.** These pass:
  - "groups of 2 …" when 2 is never dealt;
  - "never thirds" on a non-fraction skill whose answers are 1/3;
  - "never a $5 bill" when $5 is dealt;
  - a distractor family stated as "the other models in …" (DENOMS checks that a family is named, not that the statement is true).

## 3. Frozen steps

Origin `claude/sweet-newton-c8wrv1` is now 42919723. Its `Y4.json` is sha256 `d4d03a36…`, the pinned FROZEN_SHA256.

| Part of the lane's Y4.json | Against origin |
|---|---|
| `year`, `generatedBy`, `tagFixes` (166) | Equal |
| `steps` (129) | Equal, in the same order |
| The 74 base proposals | Present in the same order. 73 are byte-equal. 1 (`time_units`) only gains `lessons` and `closes`; no base field changed |
| Lesson-only proposals | 19, appended after the base proposals |

The lane changes only `Y4.json` among the data files, plus its tooling and reports. `git diff` against origin deletes 2 lines, and both come back with a trailing comma: the last line of `time_units` (`"source": "WRM_PROPOSALS"`), and the closing `]` of `tagFixes`, which `lessons` now follows.

## 4. Coverage and reproducibility

- **Coverage.** `lessons` = the 23 `wrmYear: "Y4"` entries of `site-lessons.json`: the same ids and order, and the same title, flag, firstWeek and ccss on every lesson. `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` exits 0 ("wrm-steps.json up to date", "site-lessons.json up to date").
- **Reproducibility.** Both builds follow the documented order (`lessons_build.py` docstring): `keys.mjs`, `prior.mjs`, `Y4/build.py`, `lessons_build.py`.
  - **Build A.** A clean `git archive HEAD` tree, with a fresh `WRM_TAG_DATA`.
  - **Build B.** A second clean tree, with Y4.json deleted first. The step build used a fresh data dir; the lessons build ran under `env -u WRM_TAG_DATA` with a scratch `TMPDIR`.
  - **Results.** Both exit 0, with every gate at 0 (step build mergecheck OK, lessonspec 0, lessoncheck 0, lessonmerge OK one by one and all at once, lessonfit 0). Both outputs are sha256 `092c0eb18cf28c749531b80eaf9c1d40af0bd831f0be0a6ab98415b5ee19a1cf`, which equals the committed file. No other data file changed in either tree.

## 5. Merge (`merge.mjs`, the Y1 critic's simulation extended to every core proposal field)

The lanes:

- Y4 (this branch).
- R, Y2, Y3, Y5 and Y6 from the worktree. All equal origin; Y6 has its 24 lessons.
- Y1 from `/home/user/wt-l1`, with its 39 lessons; equal to origin's Y1.json.

All are merged against live `js/modules/wrm.js`, which equals origin's.

| Check | Result |
|---|---|
| tagFixes | Y4 166, R 76, Y1 80, Y2 75, Y3 78, Y5 175, Y6 148 |
| key\|step written by 2+ lanes | 1: `patterns:count_by_step_up\|Y2.B1.S15` (Y2 and Y4, the same partial; the known frozen overlap) |
| **Real conflicts** | **0** |
| Result independent of lane order | Yes |
| Own-step status after the merge | 0 mismatches in every lane |
| **tagFixes naming a site lesson** | **0** |
| Lessons sections = site entries | Y4 23, Y1 39, Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 127, 0 with a differing skill or kind |
| Shared ids with a differing core field | 41 (name, teaches, representation, option, family, ccss) |

The 41 ids with a differing core field:

- **None is a value Y4 contributes.** Y4's 9 shared lesson proposals are verbatim copies of WRM_PROPOSALS or STANDARD_PROPOSALS, which have no `ccss` / `representation`. So Y4 holds null where other lanes enriched the field.
- **The 3 non-null disagreements are between other passed lanes:**
  - `capacity_early.ccss`: R / Y1 against Y2 / Y3;
  - `share_group.ccss`: R / Y1 against Y2 / Y3;
  - `make_line_plot.representation`: Y3 against Y5 / Y6.

  They pre-date this lane. The lead's merge should take the union.

**Self-test.** I mutated a copy of Y4 with:

- a `remove` on R's `classify_count|R.B1.S4`;
- a tagFix naming `G3|-|selectmoney`;
- `share_group.skill` changed;
- `capacity_early.ccss` changed;
- lesson "Select money" deleted.

The script reports 1 real conflict (the result becomes order-dependent), 1 lesson-naming tagFix, 1 differing skill, an extra non-null difference and Y4 22/23 DIFF. So the zeros above are real.

## 6. Fix table (FAIL)

| # | Lesson(s) | Fix |
|---|---|---|
| F1 | 4 (7) | Give the pre `division:div_word_problems` the step lane's `{range: 100}`. 0 of 100 items then divide past 12; without it, 15 / 100 divide by 13-15. Rewrite the `word_problems_mixed` clause to say what it deals: one-step stories in +, −, × and ÷, including "times as many" comparisons (about 1 in 5). Add `maxNumber: 100` to the link, so that no factor or divisor passes the tables (14 × 3, 126 ÷ 14 at the default). Or replace the link with `mult_word_problems {forms:[0,1]}` plus `div_word_problems {range:100}` and say "times as many" is left out |
| F2 | 8 (7) | Give the related `composite_shapes {forms:[1]}` `band: 25` (areas 14-24 in 60 items, against 22-195 now). Or drop it. Say in the why that the side lengths are given |
| F3 | 10 (7) | Rewrite the pre `identify {forms:[1], denoms:[2]}` why: "picking the model that shows halves, quarters or eighths; some of the other models are in thirds, fifths or sixths". In 100 items, 80 also show another halves / quarters / eighths model |
| G1 | lessonfit SIZE / rule 19 | Read the story cell's `steps[].a/b/op`: a divisor or factor past 12, or past the tables taught by the lesson's week, is a finding. Hold every pre / related to the lesson's own dealt maximum, or to the cited unit's maximum for a pre, with max(1.5 × c, c + 2), not the Grade 3 ceiling of 1,000 (rule 18 per lesson; Y4 critic r4). Mutation 1 and F2 must then fail |
| G2 | lessonfit bounds | Fail a stated bound that the items exceed ("products to 90", "areas to 30"), a stated lower bound the items go below ("areas 6 / 9 to 48"), and "never more than N" |
| G3 | lessonfit claims | Gate positive number lists ("groups of 2, 3 …") against the dealt sizes. Gate "never thirds / sixths …" on every skill whose answers or options show that denominator. Gate money denominations ("$5 bill") against `notes` / `coins`. Gate a distractor family stated as all of "the other models" against the payload's `terms` |
| n1 | 7 | Restore "areas 4 to 48" (2 × 2 is dealt, 7 / 400) |
| n2 | 9 | `estimate_mass_volume`: cite Y5 `capacity_estimate` (3.MD.A.2, the volume half), or reuse it for the volume half and keep the new option for mass |
| n3 | 13 | Replace or justify the related `time_sense` (a.m. / p.m. is not the idea of comparing durations). Align `compare_durations`' closes with `missing` ("by how much" is not in it) |
| n4 | 15 | Audit row: "totals to about 100 dollars" ($100.46 is dealt) |
| n5 | 21 | `money_place_value`: name `vis_coin_options` (a PV chart of coins) and `money_convert` (place chart $ \| ¢) in the rule-5 record, and say why a tens-of-dollars chart is still a separate option |
| n6 | 23 | Optional. The `double {band:20}` pre deals doubles past 10 (25 %) at Reception. It is the R lane's own R.B11.S12 link and its why is true. No band below 20 exists |

**Owner questions.**

- **Q1 (FULL despite unnamed clauses of 3.OA.D.9 / 3.OA.B.5 / 3.OA.D.8).** I agree. The titles are dealt, and each unnamed clause is recorded as missing with a build on a sibling lesson or step (§1).
- **Q2-Q5.** The recommendations are sound. On Q4, "Pounds, tens, ones and pence" matches the WRM place-value chart of money, so the place-value reading is right; see n5 for the overlap.
