# Y4 (US Grade 3) site lessons: independent critic, round 2

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y4.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y4` at 49b89304. The file is `data/curriculum/links/Y4.json` (sha256 `2596565b…`), section `lessons`:

- 23 lessons: 7 full, 14 partial, 2 gap;
- 117 lesson links (88 pre / related);
- 20 proposals used by lessons: 5 new and 15 reused.

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **7**: lesson 8 (F4, a new false why written in round 2) |
| Mean ≥ 8 | **No.** 183 / 23 = **7.96** |
| Steps frozen | **Yes** (§3) |
| 0 real merge conflicts | **Yes.** 0 real conflicts and 0 lesson tagFixes (§5) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§4) |
| Coverage complete | **Yes.** 23 / 23 site lessons. `ws-wrm-extract --check --site …` exits 0 |

Every r1 row landed and holds on my fresh seeds: F1-F3, G1-G3 and n1-n5. Lessons 4 and 10 now score 8.

Lesson 8 still scores 7, for a new reason:

- **F4.** The F2 fix gave the related `composite_shapes {forms:[1], band:25}` the why "a small L- or T-shape with every side length given (areas 14 to 24)".
- The areas are right. "Every side length given" is false on every item: the L-shape has 6 sides and the T-shape 8, and both show only 4 labels. The pupil must work out 2 sides before adding the perimeter.
- This wording came from my own r1 fix table ("say in the why that the side lengths are given"), which was wrong. The r1 text above the table had it right ("T-shapes whose missing sides must be found").

This is a one-line fix. The gates, the merge and the build all hold.

## Method

- **Fresh seeds.** None of these is in the report or in the r1 or builder tooling. Scripts and logs are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y4lc2/`.
  - **Every link.** `samp.mjs` read every link of every lesson through `generateQuestionFor`: the print path, the link's opts and Max Number, and `itemIndex` / `itemCount`. It took 48 items a link (seed 73331, stride 47), with the question, the answer, the options and the kit payload or the visual (`s1.txt`, 5,756 lines).
  - **Size.** `maxes.mjs` found the largest number of every link at seed 52711 / 71, 50 items a link (`maxes1.txt`).
  - **Probes.** `probe.mjs` ran 120-300 items per link for every changed link and every clause in doubt, at seeds 90121, 33071, 61403 and 27449 (`*.jl`). It covered:
    - `word_problems_mixed` @100;
    - `div_word_problems` with and without `range`;
    - `multi_step_word`;
    - `composite_shapes` band 25 (and its SVG source, `createLShapeSVG` / `createTShapeSVG`, screen and print);
    - the `identify` distractor families;
    - `dot_array_mult`, `line_plot_fractions` tiles 6 and `bar_graph` most 10;
    - `elapsed_hour` and `elapsed_visual_easy`;
    - `area_unit_squares`;
    - `share_into_groups`, `partition_shapes`, `doubles_near_doubles` and `order_fractions`;
    - `money_notation`, `make_change_least_coins` and `money_count`;
    - `mult_properties` and `area_distributive_visual`.
  - **lessonfit.** `lessonfit --n 60` ran on the committed file at `[[88811,47],[12347,53]]` and `[[64601,37],[29411,71]]`, and the mutation runs used `[[70001,43],[51229,61]]`. Each gave **0 findings** on the committed file.
- **Rubric (the brief's).** I used the method of `Y1-lessons-critic-r3.md`:
  - Each FULL lesson was read against every clause of its title, its CCSS descriptor and its `full_audit.json` row.
  - Each partial / gap clause was checked as true and complete.
  - The rule-5 records were spot-checked in `skill-options.js` for 11 lessons: 2, 4, 5, 7, 8, 9, 10, 20, 21, 22 and 23 (§1).
  - Every pre / related why was read against at least 48 items.
  - Every pre was checked as earlier and not harder.
  - Support lessons were checked at their source year.
  - The proposals were checked (§1, last part).

## 0. The r1 rows on fresh items

| Row | Landed and holds? |
|---|---|
| F1 (lesson 4) | **Yes.** Two links changed:<br>• `div_word_problems {range:100}`: 300 items divide by 2-8 only (2:48, 3:45, 4:35, 5:40, 6:50, 7:39, 8:43) and the largest number is 64. The same seeds without `range` divide by 11-15 in 31 / 300 (112 ÷ 14, 117 ÷ 13). The why "dividing by 2 to 8" is exact.<br>• `word_problems_mixed` @100, 300 items: every × / ÷ factor and divisor is 2-10, with 0 past 12. "Times as many" comes up 62 / 300 ("about 1 in 5" holds). Every item is one step. Sums reach 192 (95 + 97); the clause claims no bound on them |
| F2 (lesson 8) | **Partly.** The size is fixed: band 25 gives areas 14-24 and perimeters 18-24 in 200 items, with the largest side 7. The why is now false: see **F4** |
| F3 (lesson 10) | **Yes.** The targets are halves / quarters / eighths only (46 / 56 / 48 in 150). 143 of 150 items show at least one third, fifth or sixth, and 118 also show another halves / quarters / eighths model. "Some of the other models are in thirds, fifths or sixths" is true |
| G1 | **Yes, and the checks are real.** Each of these fails, each from its own rule:<br>• my r1 mutation 1 (no `range`): G1 story step "112 ÷ 8" and G2 "dividing by 2 to 8, but an item uses 15";<br>• r1-18;<br>• new N3 (an unranged `word_problems_mixed` as a related);<br>• N4 (the partial loses its Max Number);<br>• N1 (`count_objects` band 20 at a lesson to 5);<br>• N2 (`count_sequence` band 100 at a lesson to 20);<br>• N6 (`area_model_mult` at default: "6 × 293"). |
| G2 | **Yes.** All 13 bound mutations fail with the gate's own message:<br>• "areas 6 to 48" and "areas 4 to 30", read both ways;<br>• "products to 90";<br>• "areas to 30", "areas up to 20" and "areas 10 to 20";<br>• "dividing by 2 to 6";<br>• "quotients to 5" and "sums to 12";<br>• "never more than 50";<br>• "numbers to 50";<br>• "never dividing by more than 12";<br>• "within the tables". |
| G3 | **Mostly.** These fail:<br>• "groups of 2, 3 …" and "… 6 or 8";<br>• "never thirds" and "never fourths";<br>• "never a $5 bill" and "never a $1 bill";<br>• "(the other models in …)" and "the other models are all in …".<br>Three phrasings pass (G4 below):<br>• an incomplete list ("groups of 3, 4 or 5"; "groups of 3 or 4");<br>• a coin denial ("never a 25-cent coin");<br>• "all the other models show thirds …" |
| The two extra checks | **Real.**<br>• *Duration claim.* It fires on new wording and new lessons: "how long it takes from a start time to an end time" on lesson 13's `elapsed_hour`, and "the duration between two times" on lesson 17's `elapsed_30min`, each "0 of 40 items ask for a duration". It passes the true whys.<br>• *wk Wnn.* It reads the cited step's week both ways: "wk W04" for a W02 step (later) and "wk W17" for a W19 step (earlier) both fail. Free text such as "week 9" is not read (minor) |
| n1 (lesson 7) | **Yes.** "Areas 4 to 48": 120 items give 4-48 (4 three times, 48 once). G2 now holds it both ways |
| n2 (lesson 9) | **Yes.** `estimate_mass_volume.why` and the rule-5 record name Y5's `capacity_estimate` as the volume half, and say the mass half is still needed. Lead to reconcile |
| n3 (lesson 13) | **Yes.** The related is now `elapsed_hour`. In 120 items: later or earlier by 60, 120 or 180 minutes, with starts on :00, :15, :30 and :45. The quarter-past times are covered by the lesson's own pre `time_quarter`. The why is exact. `compare_durations.closes` is "… which took longer", and with `time_units.closes` it covers the lesson's `missing` |
| n4 (lesson 15) | **Yes.** The row says "about 100 dollars"; I saw $100.30 dealt |
| n5 (lesson 21) | **Yes.** `money_place_value.why` and the rule-5 record name `vis_coin_options` and `money_convert`'s chart, and give the reason for a separate option: a tens column of dollars, to $99.99 |
| n6 (lesson 23) | Left, as allowed. It is the R lane's own R.B11.S12 link, and its why is true |

## 1. Lesson grades: all 23

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Find the rule in an input-output table (W05) | full | 8 | **+ / − link:** in 150 items, rules + 1 to + 30 and − 1 to − 30, every number to 100. **× / ÷ link:** × 2-5 and ÷ 2-5, every number ≤ 20, so every row is a fact. The pres are W01 / W02 tables. The related `number_patterns_rule` gives add-rule sequences to 79, as its why says. Its In / Out rows are now held by the gate |
| 2 | Patterns on the multiplication table (W05) | partial | 8 | `{task:pattern}`: "Fill in the 6 row. Write the rule." with ruleBox "Across the 6 row, add 6 each time". `{task:even}`: "Tap every even product". Both clauses are true. Rule 5 holds (`chart` / `task` enums). The pres are W01-W03 |
| 3 | Properties of multiplication (W05) | full | 8 | In 200 items: turn 68, distributive 65 ("6 × 7 = 3 × 7 + ___ × 7"), identity 67. The new related `dot_array_mult {band:25}` gives products 4-25 (lesson to 20), "rows × columns": true |
| 4 | Two-step word problems, four operations (W06) | partial | **8** | F1 fixed (§0). The `multi_step_word` clause is true: + / − only, 400 steps in 200 items, numbers to 131 ("about 120"). The pres are within the tables. The related `tape_diagram` is a one-step bar model, as said. Rule 5 holds: `multi_step_word` has only 4 + / − variants plus band 30 / 50 |
| 5 | Partition shapes into equal areas (W07) | partial | 8 | In 200 items the answers are 2 / 3 / 4 and 1/2, 1/3, 2/3, 2/4, 3/4, 1/4. Never sixths or eighths, never a cut: true. Rule 5 holds (`parts`: halves / thirds / fourths). "No related" is explained in the note; the dropped `whole_as_fraction` dealt wholes to 10 |
| 6 | Add / subtract word problems within 1,000, bar models (W17) | full | 8 | Join, put-together and take-away stories to 985, with the bar on every item. The pres are Grade 2 3-digit columns, `nearest_100` (W13) and `add_wp_100`. The related `comparison_word` deals numbers to 20, as said |
| 7 | Area as multiplication (W20) | partial | 8 | n1 fixed. `area` forms 2 at 100: carpet, wall, patio and garden in feet, to 90: true, and never tiled. Rule 5 holds (`area_unit_squares` 2 variants). The related `area_distributive_visual` reaches 30 |
| 8 | Distributive and additive area (W20) | partial | **7** | **F4.** The related why says "with every side length given". `composite_shapes` dual_pa draws `createLShapeSVG` / `createTShapeSVG`, on screen and in print (`print-generate.js` 9859-9860). Each labels 4 sides: topWidth, topHeight, bottomWidth / stemWidth, totalHeight / stemHeight. The L has 6 sides and the T 8.<br>So on every item 2 sides are unlabelled, and the pupil finds them before the perimeter ("7 2 2 3" for a T; "2 4 5 6" for an L). That is Y4.B6.S6 "Find missing lengths in rectilinear shapes" (W20), a **gap** step, so no skill practises it.<br>The rest holds:<br>• the two partial clauses are true;<br>• the areas are 12-30 and 14-24 (200 and 150 items);<br>• the pres hold (`mult_properties` forms 1 breaks the rows: "7 × 9 = 1 × 9 + ___ × 9");<br>• `area_model_mult` products reach 882, which is the cited W17 step's own content;<br>• rule 5 holds (bands 30 / 50 and 25 / 50) |
| 9 | Mass and liquid volume (W22) | partial | 8 | The cylinder scales are 100 / 200 / 500 / 1,000 mL (36 / 31 / 45 / 38 in 150). The dial goes to 1,000 / 2,000 g or 5 / 10 kg. Forms 2 sorts or clicks by unit. All three clauses are true. Rule 5 holds (forms 0-2 only; `capacity_estimate` overlap recorded) |
| 10 | Measure to the half and quarter inch (W27) | partial | **8** | F3 fixed (§0). The `reading_ruler` clause is true: a 6-inch ruler, arrows at 1/2, 3 3/4, 5 1/2. The related `line_plot_fractions {tiles:6}` holds 6-8 marks, within the lesson's 6. The pres are W08 and Grade 1-2 fraction lines |
| 11 | Build a line plot from inch measurements (W28) | partial | 8 | The plot is read only (most common, total, how many at a mark), in halves, quarters and some eighths: true. The related `bar_graph {forms:[0,1], most:10}` has values ≤ 10 (lesson to 15), "another way to show counted data". The pres are W27, W25 and W08 |
| 12 | Compare amounts | full | 8 | Groups 1-5; more / fewer / same are all asked. The pre `classify_count` counts one kind among 3-5 pictures |
| 13 | Compare durations of time | partial | 8 | n3 fixed. The `elapsed_visual_easy` clause is true: one duration of 30-180 minutes in half-hour steps (18-22 of each in 120), with starts on :00 / :30 |
| 14 | Comparing multiplication statements | gap | 8 | An honest gap. The pres are the ×4 / ×8 tables (Grade 2) and 2-digit compare. The related is the array turn |
| 15 | Count money - notes and coins | full | 8 | $1-$50 bills and all coins; the pupil writes both numbers; totals to $100.30 |
| 16 | Doubles and near doubles within 20 | full | 8 | In 200 items: doubles 70, +1 60, −1 70; sums 2-20 |
| 17 | Find durations of time | full | 8 | Whole and half hours on a labelled time line. The related `elapsed_30min` gives the time 30 minutes later or earlier, as said |
| 18 | Introduce capacity and volume | gap | 8 | An honest gap. The pres are compare length / thickness, heavier / lighter and compare groups, all R |
| 19 | Introduce weight and mass | partial | 8 | Heavier / lighter of 3 pictures, never a balance: true |
| 20 | Order fractions | partial | 8 | 3-6 fractions with unlike denominators, some in larger terms ("1/12, 1/4, 5/6, 2/5, 1/2"; 6/10 for 3/5): true. Rule 5 holds (3 forms) |
| 21 | Pounds, tens, ones and pence (US) | partial | 8 | `money_notation`: totals to $8.95, from $1 and $5 bills only (340 / 101 in 200): "under $10 … never a $10 bill" is true. Rule 5 holds (`task`: collection / words) |
| 22 | Select money | partial | 8 | The fewest coins for 15¢-50¢, no bills: true. Rule 5 holds (`equiv_coin_sets` has band / coin set but no make task) |
| 23 | Sharing and grouping (fair shares) | partial | 8 | In 200 items: 8 / 9 / 10 / 12 counters in groups of 3, 4, 5 or 6, every item "Make groups of": true. Rule 5 holds (band 12 / 24) |

**Sum 183 / 23 = 7.96; min 7; 22 at 8, 1 at 7.**

### The 7 FULL lessons

All 7 hold on their titles. The `full_audit.json` rows are true, including n4. The descriptor clauses that the titles do not name are recorded as missing on a sibling lesson or step, as in r1 (owner Q1).

### Proposals

- **Copies.** I re-ran my `srceq.mjs`. Every reused copy equals its source in every field except the lesson fields:
  - 8 WRM_PROPOSALS: `balance`, `capacity_early`, `compare_sentences`, `mass_ops`, `mass_scales`, `share_group`, plus `time_units` through the Y4 base (where it only gains `lessons` and `closes`);
  - 6 STANDARD_PROPOSALS;
  - `make_amount_notes`, which equals Y3.json;
  - `frac_compare_same_part`, which equals Y5.json.
- **closes.** Every `closes[<lesson>]` equals the lesson's `missing`, or splits it. Lessons 9, 13 and 19 have more than one build, and each split covers its clause.
- **lessons.** Every proposal lists exactly the lessons that build it.
- **The 5 new options** (`estimate_mass_volume`, `money_place_value`, `compare_durations`, `ruler_object_inch` and `area_split_tiles`) each sit on the lesson's own skill, with a B&W boxed cell, and each closes its clause.

## 2. Gates: my mutations, old and new

- **Builder's `lessonmut.py`.** Run in clean tree A: **106 mutations and controls, 0 missed** (§2a).
- **Post-`finish()` edits (`postmut.py`).** Run in clean tree C, from my own step build: Y4.json without lessons, sha `d4d03a36…`, equal to origin. **25 edits, 25 caught.** The control exits 0 with sha `2596565b…`.
  - p1-p19 are my r1 edits. p1 now strips the `range`.
  - The six new edits:
    - p20: the L8 related band dropped;
    - p21: the L4 partial Max Number dropped;
    - p22: the L10 why reverted to its r1 text;
    - p23: a `rule5` record deleted;
    - p24: two lessons swapped in order;
    - p25: the L13 related swapped back to `time_sense`.
  - Each is caught by lessonspec and / or lessoncheck.
- **My lessonfit mutations (`mymut.py` + `mymut2.py`, tree B, `--n 40`, seeds `[[70001,43],[51229,61]]`).** Two controls, both clean, plus 43 mutations:

| Group | Result |
|---|---|
| My r1 mutations, with the 3 r1 defects re-injected (r1-1, 2, 3, 4, 6, 8, 9, 10, 12, 14, 18, 19) | **12 / 12 caught**, each by the intended rule |
| G1 new (N1-N4, N6) | 5 / 5 caught |
| G2 new (N7-N14) | 8 / 8 caught |
| G3 new (N16, N17, N18b, N20) | 4 caught |
| G3 new, missed (N15, N15b) | "groups of 3, 4 or 5" and "groups of 3 or 4": an incomplete list (6, or 5 and 6, dealt) passes |
| G3 new, missed (N18) | "all the other models show thirds, fifths or sixths" passes; "are all in …" is caught |
| G3 new, wrong reason (N19, N19b) | "never a quarter" is caught only because M matched `time_quarter`'s "Quarter to"; "never a 25-cent coin" passes. Coin denials are not read |
| Extra checks (N21-N24) | 4 / 4 caught (duration ×2, wk later, wk earlier) |
| N25 | "week 9" as free text passes (minor) |
| N5 | A Grade 2-source Support pre with ×7 and a "4 times-table" why: caught, by the why / opts mismatch |
| N5b | The same ×7 pre with a "7 times-table" why **passes**. Rule 19 says tables beyond the grade (×6 / 7 / 9 at Grade 2) are never linked, and the SUPPORT source-year check does not read tables |
| N26 (in file), N27 | The layout claims "every side length given" and "no side to work out" pass: F4 |

So 34 of the 43 are caught for the right reason: the 12 r1, 5 G1, 8 G2, 4 G3, 4 extra, plus N5. N19 is caught for the wrong reason. Eight pass: N15, N15b, N18, N19b, N25 and N5b, plus the two layout claims N26 (in the file) and N27. These are the gate holes in G4 and G5 of §6.

### 2a. Builder's lessonmut.py

Run in clean `git archive` tree A after build A. Result: "lessonmut: 106 mutations and controls, 0 missed", exit 0. These are the 92 of round 1 plus 14 for G1-G3. The tree's Y4.json was restored to `2596565b…` afterwards.

## 3. Frozen steps

Origin `claude/sweet-newton-c8wrv1` is at 42919723. Its Y4.json is sha256 `d4d03a36…`, the pinned FROZEN_SHA256, and it is unchanged since the lane's merge-base ad3e534c.

| Part of the lane's Y4.json | Against origin |
|---|---|
| `year`, `generatedBy`, `tagFixes` (166) | Equal |
| `steps` (129) | Equal, in the same order and with the same key order |
| The 74 base proposals | Present in the same order. 73 are byte-equal. 1 (`time_units`) only gains `lessons` and `closes` |
| Lesson-only proposals | 19, appended after the base proposals |

- **My step build.** It ran in tree C and wrote sha `d4d03a36…` exactly.
- **What the lane changes.** Against the merge-base, the lane changes only `data/curriculum/links/Y4.json`, its own `tests/scripts/wrm-tagging/Y4/` tooling and its reports.
- **Unchanged on origin since the base:** `site-lessons.json`, `wrm-steps.json`, `wrm.js` and `build-list.js`.

## 4. Coverage and reproducibility

- **Coverage.** `lessons` = the 23 `wrmYear: "Y4"` entries of `site-lessons.json`: the same ids and order, and the same title, flag, firstWeek and ccss on every lesson (0 field differences). `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` exits 0 ("wrm-steps.json up to date", "site-lessons.json up to date").
- **Reproducibility.** The documented order was followed: `keys.mjs`, `prior.mjs`, `Y4/build.py`, `lessons_build.py`.
  - **Build A.** A clean `git archive HEAD` tree with a fresh `WRM_TAG_DATA`.
  - **Build B.** A second clean tree, with Y4.json deleted first. The lessons build ran under `env -u WRM_TAG_DATA` with a scratch `TMPDIR`.
  - **Gates.** Both exit 0 with every gate at 0: frozen OK, lessonspec 0 (117 links), lessoncheck 0, lessonmerge 0 real problems (each lane and all at once), lessonfit 0.
  - **Output.** Both write sha256 `2596565b25ae80c2ac19ecbe76fb8653a6de840ddb61b54b0135193e6c9e52a8`, which equals the committed file. `diff -rq` against a third clean tree shows no other file changed.

## 5. Merge (`merge.mjs`, my r1 simulation)

The lanes, all merged against live `/home/user/MathQuest/js/modules/wrm.js`, which equals origin's:

- Y4 (this branch);
- R, Y5 and Y6 from the worktree, which equal origin (Y6 is `4da8c4f9`, with 24 lessons);
- Y1 from `/home/user/wt-l1` (`e6f63aeb`, 39 lessons, equal to origin);
- Y2 and Y3 from `/home/user/MathQuest`.

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
| Shared ids with a differing core field | 41, as in r1 |

- **None of the 41 is a value Y4 contributes.** Y4's shared lesson proposals are verbatim copies of WRM_PROPOSALS or STANDARD_PROPOSALS, so Y4 holds null where other lanes enriched `ccss` or `representation`.
- **Non-null disagreements among the other lanes.** These pre-date this lane. For the lead's union:
  - `capacity_early.ccss`;
  - `share_group.ccss`;
  - `make_line_plot.representation`.
- **Self-test.** I mutated a copy of Y4 with:
  - an R `remove`;
  - a tagFix naming `G3|-|selectmoney`;
  - `share_group.skill` changed;
  - `capacity_early.ccss` changed;
  - one lesson deleted.

  The script reports 1 real conflict (order-dependent), 1 lesson tagFix, 1 differing skill and Y4 22/23 DIFF. So the zeros are real.

## 6. Fix table (FAIL)

| # | Lesson(s) | Fix |
|---|---|---|
| F4 | 8 (7) | Rewrite the related `composite_shapes {forms:[1], band:25}` why. It should say what the items do, for example: "the perimeter and the area of a small L- or T-shape (areas 14 to 24); two side lengths are not labelled and are worked out from the others first". Or drop the link: Y4.B6.S6 (missing lengths, W20) is a gap step, so the pupil has no practice for it. This is my r1 wording error. Re-read the pictures (4 labels on 6 or 8 sides), not only the numbers |
| G4 | lessonfit claims | Add three checks. A layout check, so that F4 fails: a "every side length given" / "no side to work out" claim on `composite_shapes`, `perimeter*` or `area_polygon_decompose` is read against `geometryData.dims` (4 labels against 6 or 8 sides). A complete-list check: "groups of 3, 4 or 5" fails when a size outside the list is dealt (N15, N15b). A coin-denial check: "never a quarter / 25-cent coin / dime …" is read against the payload's `coins` (N19b), and the denial must not be matched to the `time_quarter` option (N19's wrong-reason catch). Also read "all the other models show …" (N18) like "are all in …" |
| G5 | lessonfit SUPPORT | At a Support lesson's source year, a pre or related on a times table beyond that year fails: ×6 / 7 / 9 / 11 / 12 at Grade 2, every × at Grade 1 or below (brief rule 19; N5b passes today) |
| n7 | any | Optional. Read a free-text week ("week 9") in a why like "wk W09" (N25) |

**Owner questions.** Q1-Q5 of the report stand; my r1 answers are unchanged.
