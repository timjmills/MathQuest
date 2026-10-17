# Y4 (US Grade 3) site lessons: independent critic, round 4

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y4.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y4` at 17c92d49. The file is `data/curriculum/links/Y4.json` (sha256 `e4363da0…`), section `lessons`:

- 23 lessons: 7 full, 14 partial, 2 gap;
- 117 lesson links (88 pre / related);
- 20 proposals used by lessons: 5 new and 15 reused.

Against round 3 (f65b3f49) the data changes in 9 strings: the lesson 8 related why (F5), the lesson 4 `multi_step_word` clause (n8), and the builder's sweep of 6 partial-truth claims (lessons 3, 9, 11, 18, 19 and 21, two of them the same pre). The gate work is G6, G7, G8, n7b in `lessonfit.mjs` and 20 more cases in `lessonmut.py`.

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **7**: lesson 7 (F6). Its `area {forms:[2]}` clause names "a floor, patio or wall", but 1 item in 5 is a garden bed |
| Mean ≥ 8 | **No.** 183 / 23 = **7.96** |
| Steps frozen | **Yes** (§3) |
| 0 real merge conflicts | **Yes, in the data.** 0 real conflicts and 0 lesson tagFixes (§5). But the merge has a **code hazard** (M1): main's generator fix 8fbe02c4 makes the lesson 10 pre why false on 1 item in 10 |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§4) |
| Coverage complete | **Yes.** 23 / 23 site lessons. `ws-wrm-extract --check --site …` exits 0 |

**F5 is fixed.** The new lesson 8 why is true word for word on 320 fresh items, counted on screen and in print (§0).

The verdict now turns on a defect from the same class, in a lesson no round has flagged:

- **F6 (lesson 7, partial `area_perimeter:area {forms:[2]}` @100).** The clause reads "a story of a rectangular floor, patio or wall in feet …". The generator tells exactly five stories:
  - kitchen floor (tiling);
  - room (carpeting);
  - patio;
  - wall;
  - **garden bed** (covering it in mulch).
- The garden bed is none of the three objects named. In 600 fresh items at seed 70913 / 11 it is 1 item in 5 (gen-geometry.js 2177: `{ obj: 'garden bed', verb: 'covering', … }`).
- That is the precedent of r1 lesson 10 ("the other models in thirds, fifths or sixths", a parenthetical list false on some items, scored 7) and r3 lesson 8 (F5). The brief asks that a clause be true for EVERY item kind, so this scores 7.
- My own r3 table described these items as "floor, wall and garden stories" and still gave the lesson 8. That was a miss on my part, not a pass on the clause.
- The fix is one string (§6).

## Method

- **Fresh seeds.** None of these is in the report, in the r1-r3 critic tooling or in the builder's round-4 sweep. Scripts and logs are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y4lc4/`.
  - **Every link.** `samp.mjs` read every link through `generateQuestionFor`, with the link's opts, Max Number and `itemIndex` / `itemCount`. It took 42 items a link at seed 47353 / 71 (`s1.txt`, 5,054 lines, 0 errors).
  - **Item kinds.** `kinds.mjs` took 120 items a link at seed 61417 / 37 and grouped them by kind: variant, answer type, template, print format and the digit-masked stem. It printed every kind with its count and two examples, payload included (`k1.txt`).
  - **Claims.** Every why and clause was read against every kind. Each claim that names a list, a count, a range or a form was then tallied on 200-2,000 more items (`p1.mjs` … `p11.mjs`, `l4.mjs`) at seeds 72923, 18913, 55117, 40427, 27751, 61231, 70913, 88301, 24071, 30757, 19391, 77003, 90031 and 47353.
  - **Lesson 8.** `l8.mjs` used 320 items at seeds 81233 / 47, 26641 / 97, 50387 / 19 and 93719 / 61. For each item it took the outline polygon of the screen SVG (`q.visual`) and of the print cell (`formatProblemForPrint`), and assigned every numeric `<text>` label to its nearest side. It counted sides, labels and unlabelled sides per shape on both.
- **lessonfit on the committed file.** n = 60 at `[[47353,71],[61417,37]]`, `[[84211,29],[13331,59]]` and the r3 flapping set `[[83117,47],[29303,67]]`: **0 findings** each time. Lesson 7's object list is outside every gate class (§2).
- **Rubric (the brief's).** I used the method of `Y1-lessons-critic-r3.md`:
  - Each FULL lesson was read against its title, its CCSS descriptor and its `full_audit.json` row.
  - Each partial / gap clause was checked as true for every item kind, and complete.
  - The rule-5 records were spot-checked in `skill-options.js` for 10 lessons: 2, 4, 5, 7, 9, 10, 20, 21, 22 and 23.
  - Every pre / related why was read against at least 42 items and every kind of 120.
  - Every pre was checked as earlier and not harder.
  - Support lessons were checked at their source year.
  - The proposal copies were checked against their sources (`srceq.mjs`).

## 0. Lesson 8 and the round-4 rows on fresh items

**Lesson 8, related `composite_shapes {forms:[1], band:25}`.** These are 320 items, all `dual_pa` (answer type `dual`), with two stems: "Find BOTH the perimeter AND area of this L-shape." and "… T-shape.".

| Shape | Items | Outline sides (screen / print) | Number labels (screen / print) | Sides with no label (screen / print) | Half-unit undersides | Areas | Perimeters | Largest number |
|---|---|---|---|---|---|---|---|---|
| L | 213 | 6 / 6 on every item | 4 / 4 on every item | 2 / 2 on every item (the step and the lower right side) | none | 14-24 | 18-24 | 24 |
| T | 107 | 8 / 8 on every item | 4 / 4 on every item | 4 / 4 on every item (the right end of the bar, both undersides and the left side of the stem) | **46 of 107** (2.5 or 1.5) | 18-24 | 22-24 | 24 |

The new why, clause by clause:

| Clause | True? |
|---|---|
| "the perimeter and the area of a small L- or T-shape" | Yes. Every item asks for both, and only L and T are dealt |
| "(areas 14 to 24)" | Yes. L 14-24, T 18-24 |
| "not every side is labelled (2 of the L's 6 sides, 4 of the T's 8 sides)" | Yes, on every item, screen and print. Both draw `createLShapeSVG` / `createTShapeSVG`: print with `showDecomposition: false`, screen with the shaded pieces. Neither adds a side label |
| "so the missing lengths are worked out from the labelled ones first" | Yes for the perimeter, which both shapes need. The T's area needs no missing length; "first" only orders the work |
| "the T's two undersides together are its top width take away its stem width" | Yes. Each underside is (topWidth − stemWidth) ÷ 2 |
| "(one underside alone can be a half, such as 2.5)" | Yes. 46 of 107 T's, with values 2.5 and 1.5 |

**Lesson 8 scores 8.**

**The other round-4 rows, on fresh items:**

| Row | Landed and holds? |
|---|---|
| G6 | **Yes.** At the r3 flapping seeds, n = 60, the committed file gives 0 findings. Lesson 4's own maximum now comes from the fixed 200-item probe |
| G7 | **Yes.** My R1 (counts swapped), R2 ("3 of the T's 8 sides") and R5 (adds an undealt U) are caught for the right reason. R4 (the halves note dropped, still true) passes, correctly. The r3 Q4 and Q5 are caught |
| G8 lists / coins / tables | **Yes.** All the r3 Q6-Q9, Q11-Q14, Q16, Q18 and Q24 are caught (§2). The controls Q10, Q15 and Q21 pass |
| n7b | **Yes.** Q26 ("W09", no "wk") is caught |
| n8 (lesson 4) | **True.** 2,000 items: + − 668, − + 662, + + 337, − − 333. There is never a × or ÷ step and never a letter. Every item has two steps. The largest number (intermediates included) is p50 77, p90 107, p99 138, max 149. 178 items reach 110 or more (9 %), so "numbers to 150 (most below 110)" holds |
| Sweep, lesson 3 related | **True.** "Count the array: 5 rows × 5 columns = ?", one array, products to 25 |
| Sweep, lesson 9 forms 2 | **True.** Sort 111 / click-grams 189 in 300. The sort has g 175, kg 169, mL 164 and L 158 |
| Sweep, lesson 11 partial | **True.** 5 kinds (most common, in all, at a fraction / whole / mixed mark), with halves, quarters and eighths |
| Sweep, lessons 18 / 19 pre | **True.** Line longer / shorter, tower taller / shorter, bar thicker / thinner: 6 kinds, about 20 each in 120 |
| Sweep, lesson 21 pre | **True.** "Which place is the underlined digit in?" with ones, tens or hundreds, and no chart |
| Sweep, lesson 21 related | **True.** `response: sign` gives A 125, B 126 and equal 49 in 300 |

## 1. Lesson grades: all 23

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Find the rule in an input-output table (W05) | full | 8 | **+ / − link:** "Find the rule. Write the rule.", every row filled, In / Out numbers to 99, rules + / − up to 30. **× / ÷ link:** × 2-5 and ÷ 2-5, every number ≤ 20. The pres are W01 / W02. The related `number_patterns_rule` gives "Rule: add N each time" rows |
| 2 | Patterns on the multiplication table (W05) | partial | 8 | "Fill in the 4 row. Write the rule." with two blanks and the ruleBox "Across the 4 row, add 4 each time". "Tap every even product" in a 4 × 5 window. Both clauses are true. Rule 5 holds: `_chartTask` is fill, headers, shade, pattern or even, and none asks why. The pres are the ×3 count row and the ×9 / ×7 facts |
| 3 | Properties of multiplication (W05) | full | 8 | In 120 items: turn 41, identity 41, distributive 38. The related why is true (§0). The pres are W03 / W04 and the Grade 2 arrays |
| 4 | Two-step word problems, four operations (W06) | partial | 8 | `multi_step_word`: see n8 (§0).<br>`word_problems_mixed` @100 (600 items): × 168, ÷ 190, + 136, − 106, one step on every item, factors and divisors 2-10, "times as many" 104 / 600 (about 1 in 6, "about 1 in 5" holds).<br>The pre `div_word_problems {range:100}`: divisors 2-8 only, with sharing ("shares them equally among N friends", "into N equal groups") and grouping ("puts N in each jar"). Both kinds are dealt, so "sharing and grouping stories" holds.<br>The related `tape_diagram`: one-step join / take-away / how-many-more stories, with the bar on every item (numbers to 197, inside the lesson's own probe maximum) |
| 5 | Partition shapes into equal areas (W07) | partial | 8 | Count parts 100 and fraction shaded 100 (with 2-3 options) in 200. The answers are 2 / 3 / 4 and 1/2, 1/3, 2/3, 1/4, 2/4, 3/4. Never sixths or eighths, never a cut. Rule 5 holds (the `partition_shapes` parts are halves, thirds and fourths). The pres are Grade 2 |
| 6 | Add / subtract word problems within 1,000, bar models (W17) | full | 8 | `add_wp_1k` schema join (both "gets more" and "in all") 300 / 300 and `sub_wp_1k` separate 300 / 300, with `bar: true` on all 600, to 1,000. The pres are 3-digit columns, `nearest_100` (W13) and `add_wp_100`. The related `comparison_word`: how many more 163, fewer 137, numbers to 20, as said |
| 7 | Area as multiplication (W20) | partial | **7** | **F6.** The `area {forms:[2]}` @100 clause "a story of a rectangular floor, patio or wall in feet" is false on the garden-bed stories (5 kinds in 600 items: kitchen floor, room, patio, wall, garden bed, about 1 in 5 each). The rest holds:<br>• every story is in ft (400 / 400), areas 6-90, never tiled;<br>• `area_unit_squares {forms:[0]}` gives areas 4-48 under the printed "Multiply the sides";<br>• rule 5 holds;<br>• the pres are W19 / W02 / Grade 2;<br>• the related `area_distributive_visual {band:30}` is the next lesson's split rectangle |
| 8 | Distributive and additive area (W20) | partial | 8 | F5 is fixed: every clause holds (§0).<br>`area_distributive_visual`: 2 rects + 1 split line, no grid, no "( )" (100 / 100).<br>`area_polygon_decompose {band:25}`: T 54, L 65, U 31 in 150, drawn as 2 or 3 rectangles, areas to 24, never a story.<br>The pres are W18 / W05 / W17 (the distributive pre gives "8 × 7 = 6 × 7 + ___ × 7").<br>Rule 5 holds |
| 9 | Mass and liquid volume (W22) | partial | 8 | The cylinder tops are 100 / 200 / 500 / 1,000 mL (81 / 83 / 65 / 71 in 300), never L. The scale tops are g 1,000 / 2,000 and kg 5 / 10. Forms 2: see §0. All three clauses are true. Rule 5 holds |
| 10 | Measure to the half and quarter inch (W27) | partial | 8 | A 6-inch ruler, `res: 4` on every item, with answers at halves 157 and quarters 143 in 300. Never an object.<br>The pre `identify {forms:[1], denoms:[2]}`: targets d = 2 / 4 / 8 (109 / 101 / 90), and 288 / 300 have a third, fifth or sixth among the others, so "some" is true. **On this branch.** M1: after the merge with main this why turns false on 1 item in 10 (§5).<br>The related `line_plot_fractions {tiles:6}` holds |
| 11 | Build a line plot from inch measurements (W28) | partial | 8 | Read only (5 kinds), never made. The pres are W27 (the site lesson), W25 and W08. The related `bar_graph {most:10}` has values ≤ 11 |
| 12 | Compare amounts | full | 8 | More 40, fewer 41, same 39 in 120, with groups of 1-5. The pre `classify_count` gives "Count only the balls." among pictures, to 3 |
| 13 | Compare durations of time | partial | 8 | `elapsed_visual_easy`: one duration of 30-180 min in half hours (about 50 each in 300), on two analogue faces, never compared. The related `elapsed_hour`: later or earlier by 60 / 120 / 180 min, both directions. The pres are Grade 1 clock reading |
| 14 | Comparing multiplication statements | gap | 8 | An honest gap. The pres are ×4 and ×8 (Grade 2) and compare to 99. The related is the array turn (products ≤ 20) |
| 15 | Count money - notes and coins | full | 8 | "Count the notes, then the coins. Write both numbers." in usd. The pre is `coin_value` "Circle every coin worth the number". The related `money_compare` (default, ring): A / B only, never equal (147 / 153), so "which of two sets of coins is worth more" holds |
| 16 | Doubles and near doubles within 20 | full | 8 | Doubles 105, + 1 105, − 1 90 in 300; sums 2-20 |
| 17 | Find durations of time | full | 8 | As lesson 13's direct items. The related `elapsed_30min`: earlier 149, later 151, always 30 min |
| 18 | Introduce capacity and volume | gap | 8 | An honest gap. The pres are Pre-K comparisons (6 kinds, §0), heavier / lighter and more / fewer |
| 19 | Introduce weight and mass | partial | 8 | Heavier / lighter of 2 or 3 pictures, never a balance. Rule 5 holds (`heavier_lighter_visual` has only heavier / lighter) |
| 20 | Order fractions | partial | 8 | 3-6 fractions (50 / 87 / 104 / 59 in 300). One-denominator items: 0. All-unit items: 3 / 300, two of them shown in larger terms (5/10, 2/12, 2/4). 163 / 300 of the written-order items show a fraction in larger terms. "Most with unlike denominators" and "a page of unit fractions … is not dealt" hold |
| 21 | Pounds, tens, ones and pence (US) | partial | 8 | `money_notation`: $5 and / or $1 bills and / or coins, max $8.95, never $10 (0 / 300). The bills inventory "from $5 and $1 bills and coins" is true (no other denomination). Rule 5 holds (task is collection or words). The pre and the related: §0 |
| 22 | Select money | partial | 8 | Fewest coins for 15¢-50¢ with rows 25 / 10 / 5 / 1, no bills. The pre `equiv_coin_sets`: makes yes 149, no 151 |
| 23 | Sharing and grouping (fair shares) | partial | 8 | 8 / 9 / 10 / 12 counters (11 never; "8 to 12" is a range) in groups of 3 / 4 / 5 / 6 (149 / 89 / 25 / 37), all "Make groups of". The pres are R.B11. The related `odd_even {forms:[2]}` @10: "Which number is even / odd?" to 10 |

**Sum 183 / 23 = 7.96; min 7; 22 at 8, 1 at 7.**

**The 7 FULL lessons** (1, 3, 6, 12, 15, 16 and 17) hold on their titles, their site CCSS descriptors and their `full_audit.json` rows, as in r1-r3. Their data is unchanged except lesson 3's related why.

**Proposals.** `srceq.mjs` against origin's Y4.json, `WRM_PROPOSALS`, `STANDARD_PROPOSALS`, Y3.json and Y5.json:
- the 15 reused proposals are equal to their sources (`time_units` only gains `lessons` and `closes`);
- 5 are new;
- every `lessons` list is exact (0 mismatches);
- every `closes` equals or splits its lesson's `missing`.

## 2. Gates: my mutations, old and new

- **Builder's `lessonmut.py`** (clean tree A): **137 mutations and controls, 0 missed**, exit 0. The file is restored to `e4363da0…`
- **Post-`finish()` edits** (`postmut.py`, clean tree C, from my own step build, sha `d4d03a36…` = origin): **38 edits, 38 caught** (lessonspec, lessoncheck, FROZEN or lessonmerge). The control exits 0 with sha `e4363da0…`, and the tree is restored to the step-build sha `d4d03a36…`
  - p1-p31 are the r2 / r3 edits, plus the builder's p32 and p33.
  - My new edits:
    - p34: lesson 8 counts swapped;
    - p35: lesson 3 related why reverted;
    - p36: lesson 21 `response` dropped;
    - p37: `area_split_tiles.closes` edited;
    - p38: the lesson 7 object list narrowed.
- **r1 / r2 lessonfit mutations** (`mymut.py` + `mymut2.py`, tree B, n 40, my fresh seeds `[[47353,71],[61417,37]]`): the controls are clean, and **42 / 43 are caught**, each for the intended reason. The 43rd is r1-6 ("areas 6 to 48" on lesson 7, where 4-48 is dealt). It passes at these seeds only because 8 of 400 items fall below 6 and the 80 sampled items miss them. It was caught at the r1-r3 seeds. This is sampling, not a lost check (see R11 below and G9)
- **r3 mutations** (`mymut3.py`, same seeds): **23 / 23 are caught**, each for the intended reason. The 4 controls (Q0, Q10, Q15 and Q21) pass.
- **New round-4 mutations** (`mymut4.py`, same seeds, 18 mutations and 2 controls):

| Group | Caught | Passed (gate holes) |
|---|---|---|
| G7 (lesson 8) | R1 counts swapped, R2 "3 of the T's 8 sides", R5 an undealt U | **R3 "one underside alone is always a whole number"** (false on 46 / 107 T's): no check reads a half-unit claim |
| Units | R7 lesson 7 "in metres" | none |
| **Object / scale lists** | none | **R6 lesson 7 "floor or wall"**: the F6 class, no check reads a story's object list. **R10** lesson 9 "scales to 100, 200 or 500 mL" (1,000 dealt) |
| Counts and ranges in a clause | none | R14 lesson 20 "three to five fractions" (6 dealt), R15 lesson 23 "8 to 10 counters" (12 dealt), R17 lesson 22 "to 25 cents" (50 dealt), R16 lesson 10 "12-inch ruler" |
| Direction / interval lists | none | R8 lesson 13 related "1 or 2 hours" (3 dealt), R13 lesson 17 related "30 minutes later" (earlier on half the items), R18 lesson 13 "in whole hours" (half hours dealt) |
| Fraction families, positive | none | R12 lesson 11 "halves or quarters" (eighths dealt) |
| Sample-sensitive bounds | none | R11 lesson 4 "numbers to 140" (max 149, but p99 138, so 40 items rarely reach it). R9 lesson 9 "(to 5 kg)" (10 kg dealt on about half the kg items, not read). Also my r1-6 "areas 6 to 48" passes at these seeds: only 8 / 400 items are below 6, and 80 sampled items can miss them. G2 bounds are read on the sample, not on the fixed probe G6 uses |

These holes do not change a grade. Every data string they model was checked by hand above, and only F6 is false. But F6 is exactly the R6 class, and the gate let it through four rounds. G9 (§6) asks for the list and range classes to be read.

## 3. Frozen steps

Origin `claude/sweet-newton-c8wrv1` is now at bf378b7b. Its Y4.json is still sha256 `d4d03a36…`, the pinned FROZEN_SHA256.

| Part of the lane's Y4.json | Against origin |
|---|---|
| `year`, `generatedBy`, `tagFixes` (166) | Equal |
| `steps` (129) | Equal, in the same order |
| The 74 base proposals | Present in the same order. 73 are equal. 1 (`time_units`) only gains `lessons` and `closes` |
| Lesson-only proposals | 19, appended |

- **My step build** (tree C) wrote sha `d4d03a36…` exactly.
- **What the lane changes.** Against the merge-base ad3e534c, the lane changes only `data/curriculum/links/Y4.json`, its own `tests/scripts/wrm-tagging/Y4/` tooling, its reports and one `design/STATUS.md` line (the escalation record).

## 4. Coverage and reproducibility

- **Coverage.** `lessons` = the 23 `wrmYear: "Y4"` entries of `site-lessons.json`: the same ids and order, and the same title, flag, firstWeek and ccss (0 field differences). `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` exits 0 ("wrm-steps.json up to date", "site-lessons.json up to date").
- **Reproducibility.** The order was `keys.mjs`, `prior.mjs`, `Y4/build.py`, `lessons_build.py`.
  - **Build A.** A clean `git archive HEAD` tree with a fresh `WRM_TAG_DATA`.
  - **Build B.** A second clean tree, with Y4.json deleted first. The lessons build ran under `env -u WRM_TAG_DATA` with a scratch `TMPDIR`.
  - **Gates.** Both exit 0: lessonspec 0 (117 links), lessoncheck 0, lessonmerge 0 real problems (each lane and all at once), lessonfit 0.
  - **Output.** Both write sha256 `e4363da04f8ed1cd8aa518554e47bafecf482655e0b3122057feb06f4f5502de`, which equals the committed file. `diff -rq` of tree A against a third clean tree C shows no other file changed.

## 5. Merge

**Data (`merge.mjs`).** The lanes, all merged against live `/home/user/MathQuest/js/modules/wrm.js` (= origin's):
- Y4 (this branch);
- R, Y5 and Y6 from the worktree (= origin);
- Y1 from `/home/user/wt-l1` (`e6f63aeb`, 39 lessons, = origin);
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
| Shared ids with a differing core field | 41, as in r1-r3. None is a value Y4 contributes (Y4 holds the verbatim source copies) |

**Self-test.** I mutated a copy of Y4 with an R `remove` on the shared key, a tagFix naming `G3|-|selectmoney`, `share_group.skill` changed and one lesson deleted. The script reports 1 real conflict (order-dependent), 1 lesson tagFix, 1 differing skill and Y4 22/23 DIFF. So the zeros are real.

**Code hazard M1 (new since r3).** Main moved from 42919723 to bf378b7b with 8fbe02c4, "Fix five generator bugs". One of the five makes `itemDenominators` (generate-question.js) walk the kit payload's `{n, d}` terms. The `denoms` option filter therefore now rejects distractors too.

I built a merge preview (`archM`: origin's tree plus this branch's Y4.json and Y4 tooling) and diffed 40 items a link against the branch at the same seed:

- **3 links change:**
  - `mult_properties` in lessons 3 and 8: only the glyph, "x" → "×". The whys already write ×;
  - lesson 10's pre `fractions:identify {forms:[1], denoms:[2]}`.
- **The lesson 10 pre after the merge.** In 300 items:
  - the targets are d = 2 / 4 / 8 on 270 items;
  - **30 items (1 in 10) ask for a third, fifth or sixth** ("Which model shows 4/5?", "… 2/6?", "… 1/3?"). The rejection sampler gives up and keeps an unfiltered item;
  - only 45 / 300 still have a third, fifth or sixth among the other models.
- **Effect on the why.** Its "picking the model that shows halves, quarters or eighths" becomes false on those items.
- **The gate misses it.** `lessonfit` on the preview tree gives 0 findings, because no check reads a positive fraction-family claim (the R12 hole).

This is not a data conflict, but lesson 10 would drop to 7 the moment the branch merges.

## 6. Fix table (FAIL)

Every wording below was measured on items before I wrote it.

| # | Lesson(s) | Fix |
|---|---|---|
| **F6** | 7 (7) | Rewrite the `area_perimeter:area {forms:[2]}` @100 clause's object list so that it names all five stories. For example: "a story of a rectangular kitchen floor, room, patio, wall or garden bed in feet whose area is the side lengths multiplied (8 ft by 5 ft: 40 square feet); never tiled".<br>**Measured:** 600 items at seed 70913 / 11 deal exactly these five objects; 400 / 400 items are in ft; areas 6-90; 8 ft × 5 ft is in range.<br>Or drop the list: "a story of one rectangle in feet …" |
| **M1** | 10 (merge) | Before merging, rebase on main (8fbe02c4) and re-measure the lesson 10 pre `identify {forms:[1], denoms:[2]}`. On the merge preview the targets are d = 2 / 4 / 8 on 270 / 300 items and 3 / 5 / 6 on 30 / 300, and 45 / 300 have a third, fifth or sixth among the others. A why that is true there is "picking the model that shows a fraction, most in halves, quarters or eighths (about 1 in 10 in thirds, fifths or sixths)". Better still, choose opts that keep the target in the halves family, and re-run every gate on the rebased tree |
| G9 | lessonfit | Read the classes that let F6 through (my R-mutations, §2):<br>(1) a story's object list ("a floor, patio or wall") against the stems' objects;<br>(2) a list or range of scale tops, counts or amounts ("scales to 100, 200 or 500 mL", "three to five fractions", "8 to 10 counters", "to 25 cents", "a 12-inch ruler") against the payload, both ways for a range;<br>(3) an interval or direction list ("1 or 2 hours", "later" when earlier is dealt, "in whole hours");<br>(4) a positive fraction family ("halves or quarters", "shows halves, quarters or eighths") against the targets;<br>(5) a half-unit claim on a composite shape.<br>Read the G2 bounds on the fixed G6 probe, not on the `--seeds` sample (R11, r1-6). F6 and the M1 why must fail before their fixes |
| n9 | 10 | Optional. "a 6-inch ruler marked in halves or quarters": every ruler is drawn to quarter inches (`res: 4`, 300 / 300). The half-inch answers sit on the same quarter-marked ruler. "marked in quarters; the arrow at a half or a quarter inch" is exact |

F6 alone decides the verdict. M1 must be done before the merge, or lesson 10 fails on main. G9 is gate work: the next critic will re-run the R-mutations.

**Owner questions.** Q1-Q5 of the report stand; my r1 answers are unchanged.
