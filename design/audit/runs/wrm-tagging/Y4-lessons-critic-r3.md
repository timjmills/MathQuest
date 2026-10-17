# Y4 (US Grade 3) site lessons: independent critic, round 3

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y4.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y4` at f094088f. The file is `data/curriculum/links/Y4.json` (sha256 `1bed00da…`), section `lessons`:

- 23 lessons: 7 full, 14 partial, 2 gap;
- 117 lesson links (88 pre / related);
- 20 proposals used by lessons: 5 new and 15 reused.

Against round 2 (ceed0a24) the data changes in one line: the lesson 8 related why (F4). The rest of the round is gate work: G4, G5 and n7 in `lessonfit.mjs`, and 11 more mutations in `lessonmut.py`.

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **7**: lesson 8 again (F5, the F4 rewrite is false on every T-shape) |
| Mean ≥ 8 | **No.** 183 / 23 = **7.96** |
| Steps frozen | **Yes** (§3) |
| 0 real merge conflicts | **Yes.** 0 real conflicts and 0 lesson tagFixes (§5) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§4) |
| Coverage complete | **Yes.** 23 / 23 site lessons. `ws-wrm-extract --check --site …` exits 0 |

Lesson 8 still scores 7, for a smaller reason than in round 2:

- **F5.** The related `composite_shapes {forms:[1], band:25}` why now reads "…two side lengths are not labelled and are worked out from the others first". This wording was suggested in my own r2 fix table, and it is wrong for the T-shape.
- The L-shape has 6 sides and 4 labels, so 2 sides are unlabelled. The why is true for the L.
- The T-shape has 8 sides and 4 labels (topWidth, topHeight, stemWidth, stemHeight), so **4 sides are unlabelled**:
  - the other side of the bar;
  - the other side of the stem;
  - the two undersides of the bar. Each underside is (topWidth − stemWidth) ÷ 2.
- This is the same on screen and in print. Both draw `createTShapeSVG` (`svg-geometry.js` 596-653; print `print-generate.js` 9857-9860) with the same 4 `<text>` labels. Here is a fresh T item: "Find BOTH the perimeter AND area of this T-shape", labels 7, 2, 3, 3, answer P = 24, A = 23.
- On fresh seeds the T is **41 of 120** items (seed 40961 / 59) and 18 of 60 in the builder's own count. So the count claim is false on about a third of the items. That is the same precedent as r1's lesson 10 at 7 ("the other models in thirds, fifths or sixths", false on some items).

This is a one-line fix (F5). Everything else holds: the other 22 lessons, the gates, the build, the merge and the frozen steps.

## Method

- **Fresh seeds.** None of these is in the report, in the r1 or r2 critic tooling, or in the builder's round-3 sweep. Scripts and logs are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y4lc3/`.
  - **Every link.** `samp.mjs` read every link of every lesson through `generateQuestionFor`: the print path, the link's opts and Max Number, and `itemIndex` / `itemCount`. It took **48 items a link** (seed 58321, stride 61), with the question, the answer, the options and the kit payload or the visual (`s1.txt`, 5,756 lines, 0 errors).
  - **Size.** `maxes.mjs` found the largest number of every link at seed 30223 / 83, 50 items a link (`maxes1.txt`). The flags are the same as in r2, all read and explained there (pupil-number artefacts: money in cents, "110,120" count rows, 3-digit columns of the cited Grade 2 step).
  - **Probes.** `l8.mjs`, `pr.mjs`, `pr2.mjs`, `pr3.mjs` and `pr4.mjs` ran 120-400 items per link for every clause in doubt, at seeds 40961, 66601, 12011, 90001, 55441 and 31907.
  - **lessonfit.** `lessonfit --n 60 --seeds [[77711,53],[15013,79]]` on the committed file gave **0 findings**. At `[[83117,47],[29303,67]]`, n = 40, it gives **1 finding on the committed file** (G6, §2).
- **Rubric (the brief's).** I used the method of `Y1-lessons-critic-r3.md`:
  - Each FULL lesson was read against every clause of its title, its CCSS descriptor and its `full_audit.json` row.
  - Each partial / gap clause was checked as true and complete.
  - The rule-5 records were spot-checked in `skill-options.js` for 9 lessons: 2, 4, 5, 7, 8, 9, 20, 21 and 22.
  - Every pre / related why was read against at least 48 items.
  - Every pre was checked as earlier and not harder.
  - Support lessons were checked at their source year.
  - The proposals were checked by the source gate and the r2 copy check. The data is unchanged since r2, apart from the lesson 8 why.

## 0. The r2 rows on fresh items

| Row | Landed and holds? |
|---|---|
| F4 (lesson 8) | **Landed, but the new text is false for the T-shape: see F5.** The old "every side length given" is gone. The areas are 14-24, with L 79 and T 41 in 120 (seed 40961 / 59) |
| G4 | **Yes, for the forms named in r2.** Each of these fails with the G4 message:<br>• the layout claims "every side length given" (N26 re-injected), "no side to work out" (N27), "all side lengths are labelled" and "each side is shown";<br>• the lists "groups of 3, 4 or 5", "groups of 3 or 4" and "groups of 3, 4 or 6";<br>• the coin denials "never a quarter", "never a 25-cent coin", "never a dime" and "no nickels or pennies";<br>• "all the other models show …" and "the other models show …".<br>"Never a quarter" is now caught for the right reason, and the `time_quarter` match is gone. The control "groups such as 3 or 4" passes, and "never a half-dollar" (true) passes.<br>New holes are listed in §2 |
| G5 | **Yes.** At Grade 2 source, ×6 / ×7 / ×9 fail, including a ×9 related whose why does not say "times-table" (from `opts.constant`). At Grade 1, ×3 fails and ×5 passes. At Pre-K, ×2 fails |
| G5 deviation (Grade 1 = 2, 5, 10) | **Accepted.** WRM Y2 (Grade 1 here) teaches the 2, 5 and 10 times-tables (Y2.B5.S13-S15), and CCSS asks for skip-counting by 5s and 10s by Grade 2 (2.NBT.A.2). Lesson 15's count-by-5 and count-by-10 pres cite those Y2 steps. My r2 wording "every × at Grade 1 or below" was too strict |
| n7 | **Yes.** "week 9" and "wk 17" are read and fail against the cited step's week. "(W09)" with no "wk" / "week" before it is not read (minor) |

## 1. Lesson grades: all 23

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Find the rule in an input-output table (W05) | full | 8 | **+ / − link:** in 150 items, + 75 and − 75, rules to 30, every In / Out to 100. **× / ÷ link:** × / ÷ 2-5, every number ≤ 20. The pres are W01 / W02 (the whys' weeks are right). The related `number_patterns_rule` gives add-rule sequences, as its why says |
| 2 | Patterns on the multiplication table (W05) | partial | 8 | "Fill in the 6 row. Write the rule." with ruleBox "Across the 6 row, add 6 each time", and "Tap every even product". Both clauses are true. Rule 5 holds. The pres are W01-W03 |
| 3 | Properties of multiplication (W05) | full | 8 | In 200 items: turn 67, distributive 64 ("4 x 3 = 2 x 3 + ___ x 3"), identity 69. The related `dot_array_mult {band:25}` gives products to 25, read as rows × columns |
| 4 | Two-step word problems, four operations (W06) | partial | 8 | `div_word_problems {range:100}` divides by 2-8 only (300 items: 42 / 43 / 40 / 47 / 39 / 42 / 47). `word_problems_mixed` @100: one step on every item, × / ÷ factors ≤ 10, "times as many" 62 / 300. `multi_step_word`: + / − only.<br>Its "numbers to about 120" is loose: the p99 is 134-140 and the max 145 in 900 items (n8, optional) |
| 5 | Partition shapes into equal areas (W07) | partial | 8 | In 200 items the answers are 2 / 3 / 4 and 1/2, 1/3, 2/3, 2/4, 3/4, 1/4. Never sixths or eighths, never a cut: true. Rule 5 holds. "No related" is explained |
| 6 | Add / subtract word problems within 1,000, bar models (W17) | full | 8 | Join, put-together and take-away stories to 987, with the bar on every item. The pres are Grade 2 3-digit columns, `nearest_100` (W13) and `add_wp_100`. The related `comparison_word` deals numbers to 20, as said |
| 7 | Area as multiplication (W20) | partial | 8 | `area_unit_squares` areas 4-48 (200 items), as the clause says. `area {forms:[2]}` @100 tells floor, wall and garden stories in ft (150 / 150), areas 6-90, never tiled. The pres are W19 and before |
| 8 | Distributive and additive area (W20) | partial | **7** | **F5.** The related why says "two side lengths are not labelled". That is true for the L (6 sides, 4 labels) and false for the T (8 sides, 4 labels: 4 unlabelled, 2 of them (W − s) ÷ 2). The T is 41 of 120 items. The rest holds:<br>• both partial clauses are true;<br>• `area_distributive_visual` areas 12-30;<br>• `area_polygon_decompose` areas 14-24, T 82, U 60, L 58 in 200;<br>• the pres are W05-W18, and the `mult_properties` forms 1 rows are broken apart;<br>• rule 5 holds |
| 9 | Mass and liquid volume (W22) | partial | 8 | The cylinder scales go to 100 / 200 / 500 / 1,000 mL (26 / 41 / 37 / 46 in 150). The dial goes to 2,000 g or 10 kg. Forms 2 sorts or clicks by unit. All three clauses are true. Rule 5 holds |
| 10 | Measure to the half and quarter inch (W27) | partial | 8 | A 6-inch ruler with halves 81, quarters 69 in 150, never an object. `identify`: the targets are halves / quarters / eighths (49 / 47 / 54). 140 of 150 items have a third, fifth or sixth among the others, so "some of the other models" is true. The related `line_plot_fractions {tiles:6}` holds |
| 11 | Build a line plot from inch measurements (W28) | partial | 8 | The plot is read only (how many at a mark, the most common, the total), never made: true. The related `bar_graph {most:10}` has values ≤ 11. The pres are W27, W25 and W08 |
| 12 | Compare amounts | full | 8 | Groups to 5. More, fewer and same are asked 49 / 51 / 50 in 150. The pre `classify_count` counts one kind among pictures to 3 |
| 13 | Compare durations of time | partial | 8 | `elapsed_visual_easy`: one duration of 30-180 min in half-hour steps (about 25 each in 150), with starts on :00 / :30, never two compared: true. The related `elapsed_hour` gives a time 60 / 120 / 180 min later or earlier, never a duration: as its why says |
| 14 | Comparing multiplication statements | gap | 8 | An honest gap. The pres are the ×4 / ×8 tables (Grade 2) and 2-digit compare. The related is the array turn |
| 15 | Count money - notes and coins | full | 8 | $1, $5, $10, $20 and $50 bills and all four coins. The pupil writes both numbers. Totals to $100.65 ("about 100 dollars") |
| 16 | Doubles and near doubles within 20 | full | 8 | In 200 items: doubles 70, near doubles 130; sums to 20 |
| 17 | Find durations of time | full | 8 | Whole and half hours on a labelled time line. The related `elapsed_30min` is always 30 min, later 74 / earlier 76, as said |
| 18 | Introduce capacity and volume | gap | 8 | An honest gap. The pres are R compare size, heavier / lighter and compare groups |
| 19 | Introduce weight and mass | partial | 8 | Heavier / lighter of 2 or 3 pictures (68 / 82), never a balance (0 / 150): true |
| 20 | Order fractions | partial | 8 | 3-6 fractions, unlike denominators, some in larger terms ("7/8, 2/3, 3/5, 2/5, 1/3"; 4/12, 8/12). Never a one-denominator page (0 / 150): true |
| 21 | Pounds, tens, ones and pence (US) | partial | 8 | `money_notation`: $1 and $5 bills only (367 / 96 in 200), totals to $8.95: "under $10 … never a $10 bill" is true. Rule 5 holds |
| 22 | Select money | partial | 8 | The fewest coins for 15¢-50¢, no bills (200 items), with all four coins used: true |
| 23 | Sharing and grouping (fair shares) | partial | 8 | In 200 items: 8 / 9 / 10 / 12 counters in groups of 3 / 4 / 5 / 6 (95 / 59 / 24 / 22), all "Make groups of", never "share": the list is complete and true |

**Sum 183 / 23 = 7.96; min 7; 22 at 8, 1 at 7.**

**The 7 FULL lessons** all hold on their titles and their `full_audit.json` rows, as in r2.

**Proposals.** These are unchanged since r2:
- the source gate (`lessoncheck`) passes in both builds;
- every `closes` equals or splits its lesson's `missing`;
- every `lessons` list is exact.

## 2. Gates: my mutations, old and new

- **Builder's `lessonmut.py`.** Run in clean tree A: **117 mutations and controls, 0 missed**, exit 0. The file was restored to `1bed00da…`.
- **Post-`finish()` edits (`postmut.py`).** Run in clean tree C, from my own step build (Y4.json without lessons = sha `d4d03a36…`, equal to origin). **31 edits, 31 caught.** The control exits 0 with sha `1bed00da…`.
  - p1-p27 are my r2 edits plus the builder's p26 and p27.
  - My new edits:
    - p28: a Support pre re-optioned to ×7;
    - p29: the L23 list shortened;
    - p30: "week 9";
    - p31: a `closes` edited.
- **The r1 and r2 lessonfit mutations (`mymut.py` + `mymut2.py`, tree B, `--n 40`, seeds `[[70001,43],[51229,61]]`).** The controls are clean. **44 / 44 are caught, each for the intended reason.** That includes the 8 that passed in r2:
  - N15 / N15b (incomplete list);
  - N18 ("all the other models show");
  - N19 / N19b (coin denials, now by G4 and not by `time_quarter`);
  - N25 ("week 9");
  - N5b (×7 at Grade 2, by G5);
  - N26 re-injected and N27 (the layout claims).
- **New round-3 mutations (`mymut3.py`, 26 mutations and a control, same seeds).**

| Group | Caught (right reason) | Passed |
|---|---|---|
| Layout | "all side lengths are labelled", "each side is shown" | **"one side length is not labelled"** (a count claim), "no unknown sides". The count class is the F5 defect itself: no check reads "N sides are not labelled" against the shape's sides minus its labels |
| Lists | "groups of 3, 4 or 6" | "groups of 3 to 5" (a range), "groups of three, four or five" (words), "3, 4 or 5 in each group" (postfix). Control "groups such as 3 or 4" passes, correctly |
| Coins | "never a dime", "no nickels or pennies" | "only dimes and pennies" (a positive-only list), and **"never a quarter" on `money_compare`**: its coins sit in `a.coins` / `b.coins` and are not read. "Quarters are never used" fails, but for a wrong reason: a claims rule says "names quarters but only 0 of 40 items deal it" while quarters are dealt. So a true positive claim about quarters on this skill would fail too. Control "never a half-dollar" passes, correctly |
| Models | "the other models show …" | none |
| G5 | ×6 / ×9 at Grade 2, ×3 at Grade 1, ×2 at Pre-K (each by G5). Control ×5 at Grade 1 passes, correctly | **`mult_facts {}`** (every table 0-12) at Grade 2 is caught only because its why still says "4 times-table". **`div_facts {}`** (every divisor) passes. G5 reads only `constant` / `tables` / `table` / `factors` and "N times-table"; a table skill with no table option is never read |
| n7 | "week 9", "wk 17" | "(W09)" without "wk" / "week" (minor) |

- **G6 (gate stability).** At seeds `[[83117,47],[29303,67]]` lessonfit fails **the committed file**: "related algebra:tape_diagram: size 200 > 195 (the lesson deals to 130)" on lesson 4.
  - It is not a content defect. In 400 items `tape_diagram` reaches 200 (11 items ≥ 195), and the lesson's own `word_problems_mixed` reaches 177-192 (r2 saw 95 + 97). So the related fits the lesson's real range.
  - But the SIZE bound takes the lesson maximum from the same 40 items, so it flaps at the boundary. The "0 findings on fresh seeds" in the report is seed-dependent.

## 3. Frozen steps

Origin `claude/sweet-newton-c8wrv1` is at 42919723. Its Y4.json is sha256 `d4d03a36…`, the pinned FROZEN_SHA256.

| Part of the lane's Y4.json | Against origin |
|---|---|
| `year`, `generatedBy`, `tagFixes` (166) | Equal |
| `steps` (129) | Equal, in the same order (JSON-identical) |
| The 74 base proposals | Present in the same order. 73 are equal. 1 (`time_units`) only gains `lessons` and `closes` |
| Lesson-only proposals | 19, appended after the base proposals |

- **My step build.** It ran in tree C and wrote sha `d4d03a36…` exactly.
- **What the lane changes.** Against the merge-base ad3e534c, the lane changes only `data/curriculum/links/Y4.json`, its own `tests/scripts/wrm-tagging/Y4/` tooling and its reports.
- **What origin changes.** Origin changed only `Y1.json` since the base (the Y1 lessons lane).

## 4. Coverage and reproducibility

- **Coverage.** `lessons` = the 23 `wrmYear: "Y4"` entries of `site-lessons.json`: the same ids and order, and the same title, flag, firstWeek and ccss (0 field differences). `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` exits 0 ("wrm-steps.json up to date", "site-lessons.json up to date").
- **Reproducibility.** The order was `keys.mjs`, `prior.mjs`, `Y4/build.py`, `lessons_build.py`.
  - **Build A.** A clean `git archive HEAD` tree with a fresh `WRM_TAG_DATA`.
  - **Build B.** A second clean tree, with Y4.json deleted first. The lessons build ran under `env -u WRM_TAG_DATA` with a scratch `TMPDIR`.
  - **Gates.** Both exit 0: frozen OK, lessonspec 0 (117 links), lessoncheck 0, lessonmerge 0 real problems (each lane and all at once), lessonfit 0 (default seeds).
  - **Output.** Both write sha256 `1bed00da2aae20dc103ff6f3b92893516f60bee951a0e0eae40a597ef8c7d103`, which equals the committed file. `diff -rq` of trees A and B against a third clean tree C shows no other file changed.

## 5. Merge (`merge.mjs`, my r1 / r2 simulation)

The lanes, all merged against live `/home/user/MathQuest/js/modules/wrm.js`, which equals origin's:

- Y4 (this branch);
- R, Y5 and Y6 from the worktree, which equal origin;
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
| Shared ids with a differing core field | 41, as in r1 / r2. None is a value Y4 contributes: Y4 holds the verbatim source copies (null `ccss` / `representation`) |

**Self-test.** I mutated a copy of Y4 with:
- an R `remove` on the shared key;
- a tagFix naming `G3|-|selectmoney`;
- `share_group.skill` changed;
- one lesson deleted.

The script reports 1 real conflict (order-dependent), 1 lesson tagFix, 1 differing skill and Y4 22/23 DIFF. So the zeros are real.

## 6. Fix table (FAIL)

| # | Lesson(s) | Fix |
|---|---|---|
| **F5** | 8 (7) | Rewrite the related `composite_shapes {forms:[1], band:25}` why so that it is true for both shapes. For example: "the perimeter and the area of a small L- or T-shape (areas 14 to 24); not every side is labelled (2 sides of the L, 4 of the T), and the missing lengths are worked out from the others first". Read the T pictures (4 labels on 8 sides), not only the L. My r2 suggested wording was wrong for the T |
| G7 | lessonfit layout | Read a count claim ("N side(s) (length(s)) not labelled / unlabelled / to work out", "one / two sides are missing") against `geometryData`: L 6 − labels, T / U 8 − labels. Also read "no unknown sides" like "no missing side". F5 must fail before its fix, and the fixed why must pass |
| G8 | lessonfit lists, coins, tables | Lists: also read "groups of A to B", number words ("groups of three, four or five") and the postfix "A, B or C in each group".<br>Coins: read nested coin payloads (`money_compare` `a.coins` / `b.coins`) and a positive-only list ("only dimes and pennies"). The quarters / coins positive-claim rule must read the payload's coins, so "quarters are never used" fails as a G4 coin denial and not as "0 items deal quarters".<br>G5: a table skill with no table option (`mult_facts {}`, `div_facts {}`, `count_by_tables {}`) at a Support lesson fails when its items deal a table beyond the source year (read the dealt factors / divisors) |
| G6 | lessonfit SIZE | Make the SIZE bound seed-stable: take the lesson's own maximum over a fixed, larger probe (for example 200 items at fixed seeds) rather than the same n items. Or band the L4 related `tape_diagram` and say its size in the why. Today the committed file fails at `[[83117,47],[29303,67]]` |
| n7b | any | Optional. Read "(W09)" without "wk" / "week" |
| n8 | 4 | Optional. The `multi_step_word` clause "numbers to about 120": the p99 is about 138 and the max 145. Say "mostly to about 110, a few to 145", or drop the number |

F5 alone decides the verdict. G6-G8 are gate holes found by my mutations. They do not change a grade, but the next critic will re-run them.

**Owner questions.** Q1-Q5 of the report stand; my r1 answers are unchanged.
