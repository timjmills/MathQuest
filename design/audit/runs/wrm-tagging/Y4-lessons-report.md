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
| Lesson links | 88 pre / related links, plus 29 direct / partial links (round 2: lesson 5's related dropped) |

## Round 4 (lessons critic r3: FAIL, mean 7.96; lesson 8 at 7). Builder escalated to mq-opus-medium

The builder was escalated from mq-opus-low to mq-opus-medium (CLAUDE.md rule): lesson 8's related why failed two builder rounds (r2 "every side given", r3 "two sides unlabelled", false for the T). The escalation is recorded in `design/STATUS.md`. The steps, the tagFixes and the step proposals are still frozen (frozen gate OK; the step build writes sha `d4d03a36…`).

### F5: the lesson 8 related why, measured per shape

The why was not copied from the r3 fix table. I generated 240 items of `composite_shapes {forms: [1], band: 25}` (seeds 40961 / 59, 70117 / 31 and 12011 / 83, `l4r4/f5.mjs`). Each item was counted on screen (`q.visual`, `createLShapeSVG` / `createTShapeSVG`) and in print (`formatProblemForPrint`, the `geometry-composite` branch):

| Shape | Items | Sides (outline vertices) | Labelled: screen / print | Unlabelled, worked out by the pupil | Areas | Perimeters |
|---|---|---|---|---|---|---|
| L | 158 | 6 | 4 / 4 (top width, top height, bottom width, total height) | 2: the step (bottom width − top width) and the lower right side (total height − top height). The area also needs total height − top height | 14-24 | 18-24 |
| T | 82 | 8 | 4 / 4 (top width, top height, stem width, stem height) | 4: the other end of the bar (= top height), the other side of the stem (= stem height) and the two undersides, each (top width − stem width) ÷ 2. On **36 of 82** T's that is a half (2.5, 1.5). The area needs no working out: top width × top height + stem width × stem height | 18-24 | 22-24 |

Every item asks "Find BOTH the perimeter AND area of this L- / T-shape" (answer type `dual`). The largest number is 24.

New why: "the perimeter and the area of a small L- or T-shape (areas 14 to 24); not every side is labelled (2 of the L's 6 sides, 4 of the T's 8 sides), so the missing lengths are worked out from the labelled ones first; the T's two undersides together are its top width take away its stem width (one underside alone can be a half, such as 2.5)".
- Every clause is true on all 240 items.
- It names the halves, because about 2 T's in 5 have half-unit undersides (Grade 3 pupils add whole numbers here). The pupil can avoid the half: the two undersides together are a whole number.
- The link is kept. It is the lesson's only practice of perimeter and area on a composite shape, and the why now tells the teacher what the pupil meets.

### Gates (lessonfit)

| Row | Change | Proof |
|---|---|---|
| G7 | `layoutChecks` reads a composite shape's sides (L 6, T / U 8) and its labelled sides: the number labels the picture draws, or else its dims. (1) "every / each / all side(s) given / labelled / shown", "no side to work out" and "no missing / unknown side(s)" need every side labelled. A "not every side" before it is excluded, so it is no longer read as "every side". (2) "not every side is labelled" needs no fully labelled item. (3) A count, overall ("two side lengths are not labelled", "one side is missing") or per shape ("2 of the L's 6 sides, 4 of the T's 8 sides", "2 sides of the L, 4 of the T"), must equal the unlabelled sides of every item of that shape, and its total when given. A per-shape list must name every shape the items deal | The r3 why fails: "G7: says "2 side lengths are not labelled", but 8 of 40 items leave 4 sides unlabelled (T-shapes)". The new why passes. Also caught: "one side length is not labelled", "with no unknown sides", "(2 sides of the L)" (T left out), "2 of the T's 8 sides" and "the T's 6 sides". Control: the critic's "(2 sides of the L, 4 of the T)" passes |
| G8 lists | `groupLists` reads "groups of 3, 4 or 5", "groups of 3 to 5" (a range), number words ("groups of three, four or five") and the postfix "3, 4 or 5 in each group". Every named size (for a range, both ends) must be dealt (G3). The list must be complete (G4), unless it follows "such as / like / for example" | The critic's Q6-Q9 are caught. The control Q10 passes |
| G8 coins | `coinsOf` walks the whole payload, so nested `a.coins` / `b.coins` (money_compare) are read. `coinDenials` reads a denial before the coin ("never a quarter") or after it ("quarters are never used"). "only dimes and pennies" must hold every dealt coin. A coin named positively must be dealt. On a money link, "quarters" is a coin, not the fraction family, and the "money" claim reads the payload coins | Q11-Q14 and Q16 are caught by the coin rules. "quarters are never used" now fails as a G4 coin denial only. The control "never a half-dollar" passes |
| G8 / G5 tables | A Support link's dealt facts are read from the items: "a × b" and "a ÷ b" in the question, the kit payload's a / b / op, a story's steps, and a count-by-tables step. A × fact needs a factor in the source year's tables. A ÷ fact needs the divisor or the quotient. This covers table skills with no table option | `mult_facts {}` and `div_facts {}` at lesson 14 (Grade 2) are caught (Q18, Q24). ×5 at Grade 1 passes |
| G6 | SIZE takes the lesson's own maximum, and a cited unit's maximum, from a FIXED 200-item probe (4 seed sets × 50), never from the `--seeds` / `--n` sample under test | Lesson 4's own maximum is now 194, so its limit is 291. `tape_diagram` reaches 200. 0 findings at the critic's flapping seeds `[[83117,47],[29303,67]]` (n 40 and n 60). Also 0 at 3 fresh sets, `[[64013,71],[22307,43]]`, `[[90121,53],[37019,89]]` and `[[15551,61],[70709,37]]`, each at n 40 and n 60. Also 0 at the default seeds, `[[77711,53],[15013,79]]` and `[[70001,43],[51229,61]]` (n 60) |
| n7b | `citeCheck` reads a bare "W09" or "(W09)" in a pre why, as well as "wk" / "week" | Q26 is caught |
| n8 | Lesson 4's `multi_step_word` clause now reads "numbers to 150 (most below 110)". 3,000 items: p90 106, p99 135, max 149. The generator's bound is a start of 100 plus 50. The "numbers to 150" bound is gated strictly | |

### The round-4 sweep: per-shape and per-form claims

I dumped every link of the 23 lessons. For each link I took 120 items, grouped by sub-kind (variant, shape, template + payload kind, answer type, stem), and read every why and clause against every kind (`l4r4/kinds.mjs`). I then tallied 300 items for each claim in doubt (`chk*.mjs`). Each finding below is true for only some item kinds, the class behind F5 and r1's lesson 10. All are fixed:

| Lesson | Link | Was | Measured (300 items) | Now |
|---|---|---|---|---|
| 3 | related `dot_array_mult {band: 25}` | "…the product of the turned array is the same" | No item turns an array (one array, rows × columns) | "a dot array read as rows times columns, one array at a time (products to 25): the array the lesson then turns" |
| 9 | partial `mass_volume_liquid {forms: [2]}` | "sorts or picks objects by the unit … (g, kg, mL, L)" | The pick form (179 / 300) is always "best measured in grams (not kilograms)". Only the sort form has mL / L | "sorts objects by the unit … (g, kg, mL or L), or clicks every object best measured in grams rather than kilograms" |
| 11 | partial `line_plot_fractions {}` | "measurements in halves and quarters, some in eighths" | Halves only on 139 / 300 plots, quarters only 8, quarters + eighths 13 | "measurements in halves, quarters or eighths, many of the plots in halves only" |
| 18, 19 | pre `compare_objects {task: all}` | "longer, taller, shorter" | thicker / thinner bars on 100 / 300 items | "longer or shorter lines, taller or shorter towers, thicker or thinner bars" |
| 21 | pre `placevalue:identify {band: 999}` | "hundreds, tens and ones in a place-value chart" | The pv `place` kind draws an underlined numeral and a ring row. There is no chart | "naming the place of an underlined digit: hundreds, tens or ones" |
| 21 | related `money_compare {response: sign}` | "which of two amounts is more, written with < or >" | "=" on 53 / 300 | "which of two sets of coins is worth more, or that they are equal, written with <, > or =" |

Checked and true on every kind:
- the bar on every `tape_diagram` item;
- two analogue faces on every `elapsed_visual_easy` item;
- three wholes on every `mixed_nl_drag` line;
- the "Multiply the sides" hint on every `area_unit_squares` forms 0 item;
- multiples from 3 on every `count_by_tables` ×3 row;
- an L on every `area_unit_squares` forms 1 item;
- L, T and U all dealt by `area_polygon_decompose`;
- 1 whole on every `compose_whole` item;
- "Across the N row, add N" with 2 blanks on every `mult_chart` pattern item.

### Mutations and post-finish edits

| Run | Result |
|---|---|
| `lessonmut.py` (round 4 adds 16 mutations and 4 controls) | **137 mutations and controls, 0 missed** (clean tree A) |
| Critic r1 / r2 lessonfit mutations (`mymut.py`, `mymut2.py`, seeds `[[70001,43],[51229,61]]`) | 43 / 43 caught, each for the intended reason. Controls clean |
| Critic r3 mutations (`mymut3.py`, same seeds) | 23 / 23 caught. The 4 controls (Q0, Q10, Q15, Q21) pass. Q5 (count), Q4 ("no unknown sides"), Q7-Q9 (lists), Q13 / Q14 / Q16 (coins), Q18 / Q24 (tables) and Q26 ("W09") were the r3 holes |
| Post-finish edits (`postmut.py`, clean tree C) | p1-p31 plus p32 (the r3 lesson 8 why restored) and p33 (the old lesson 4 clause restored): **33 / 33 caught**. The control exits 0 with sha `e4363da0…` |

## Round 3 (lessons critic r2: FAIL, mean 7.96; lesson 8 at 7)

The steps, the tagFixes and the step proposals are still frozen (frozen gate OK; the step build writes sha `d4d03a36…`).

| Row | Change | Checked on items |
|---|---|---|
| F4 (lesson 8) | The related `composite_shapes {forms: [1], band: 25}` why now says what the items do: "the perimeter and the area of a small L- or T-shape (areas 14 to 24); two side lengths are not labelled and are worked out from the others first". The link is kept, because it is the lesson's only perimeter-and-area practice on a composite shape. The why says that the missing sides come first (Y4.B6.S6, W20, is a gap step) | 60 fresh items (seed 91813, stride 53): areas 14-24, 42 L and 18 T. Every item labels 4 sides: 4 `<text>` labels in the screen SVG, and `geometryData.dims` has 4 entries. Print draws the same `createLShapeSVG` / `createTShapeSVG` from those dims (`print-generate.js` 9857-9860) |
| G4 (lessonfit) | `claimLists` adds four checks. (1) A layout claim ("every / each / all side(s) (length) given / labelled / shown", "no side to work out", "no missing side", "nothing to work out") is read against `geometryData`: an L with fewer than 6 labelled dims, or a T / U with fewer than 8, fails. (2) A list "groups of 3, 4 or 5" is complete: a group size outside it that is dealt (`payload.size`, or "groups of N" / "N in each" in the text) fails, unless the list follows "such as / like / for example / including". (3) A coin denial on a money skill ("never a quarter", "no 25-cent coins", "never uses dimes or nickels") is read against the payload's coins (`values` with `counts` > 0, `coins` / `set` / `given`, coin words in the text). The coin must be the denial's own object, so "never the amount split into tens, ones, dimes and pennies" is not read as a coin denial. A money clause is no longer matched to a time skill's option (class M skips TIME keys when the lesson has no time link), so "never a quarter" no longer fails for the wrong reason. (4) "the other models show …" and "all the other models show …" are read like "are all in …" | The critic's N15, N15b, N18, N19, N19b, N26 and N27 are now caught by G4 |
| G5 (lessonfit) | `supportTables`: a Support lesson's pre or related fails when it uses a times table its source year has not met. The table comes from `opts.constant` / `tables` / `table` / `factors`, or from "N times-table" in the why. Grade 2 (WRM Y3) knows 2, 5, 10, 3, 4 and 8. Grade 1 (WRM Y2) knows 2, 5 and 10 (WRM Y2 teaches those tables; the critic's "every × at Grade 1" would fail lesson 15's true counting in 5s and 10s pres, both cited to Y2 steps). Kindergarten and below know none | N5b is caught ("the 7 times-table is beyond … Y3") |
| n7 | `citeCheck` reads "week N" and "wk N" as well as "wk Wnn", and compares the week numbers | N25 ("week 9" for a W02 step) is caught |

**Round-3 sweep.** Every why and clause of all 23 lessons was re-read with the new rules, and lessonfit was run at n = 60 on 3 fresh seed sets: `[[31337,59],[80021,41]]`, `[[45007,67],[19993,29]]` and `[[60661,83],[27011,37]]`. Each gave 0 findings. The first build under the new rules found 3 findings, all false positives of the new checks, so the checks were fixed and the data was left as it was:
1. G5 at Grade 1. Lesson 15's pres `count_by_tables` ×5 and ×10 cite Y2.B5.S15 / S13, which are Grade 1 steps. The Grade 1 table set is now 2, 5 and 10.
2. G4 coins. Lesson 21's clause "never the amount split into tens, ones, dimes and pennies" denies a split, not a coin. The coin must now be the denial's own object.

I also grepped every why and clause for layout, list, coin, week and table wording. Every hit is true on its items. This includes lesson 23's "groups of 3, 4, 5 or 6", which is a complete list, and lesson 22's coin set.

**Mutations.** Every critic r2 lessonfit mutation was re-run in this tree (`mymut.py` and `mymut2.py`, seeds `[[70001,43],[51229,61]]`). The controls are clean, and 42 of 43 are caught, each for the right reason. The 43rd, N26, was an "in file" no-op that is now a re-injection. Re-injected by hand and in `lessonmut.py`, it is caught by G4. `lessonmut.py` gains 11 mutations: 2 layout, 2 lists, 3 coins, 1 "show", 2 G5 and 1 n7. The total is **117 mutations and controls, 0 missed**. The critic's post-finish edits (`postmut.py`, clean tree C) were re-run with 2 more: p26 restores the old lesson 8 why, and p27 adds "never a quarter" to lesson 22. **27 / 27 are caught**, and the control exits 0 with sha `1bed00da…`.

## Round 2 (lessons critic r1: FAIL, mean 7.87; lessons 4, 8 and 10 at 7)

Every row of the critic's fix table is done. The steps, the tagFixes and the step proposals are still frozen (frozen gate OK, sha `d4d03a36…` after strip).

| Row | Change | Checked on items |
|---|---|---|
| F1 (lesson 4) | The pre `division:div_word_problems` gets `{range: 100}`, the step lane's option; its why says "dividing by 2 to 8". The partial `word_problems_mixed` gets Max Number 100 and its clause now names the factors and divisors within the tables and the "times as many" comparisons (about 1 in 5, 4.OA.A.2, Grade 4 content) | 200 items at range 100: divisors 2-8 only, 0 past 12. `word_problems_mixed` at 100, 300 items: every × / ÷ factor or divisor 3-10; "times as many" 37 / 200 |
| F2 (lesson 8) | The related `composite_shapes {forms: [1]}` gets `band: 25`; its why says "a small L- or T-shape with every side length given (areas 14 to 24)" | 600 items: areas 14-24, perimeters 22-24, largest number 24 (the lesson's own items stop at 30) |
| F3 (lesson 10) | The pre `identify {forms: [1], denoms: [2]}` why: "…halves, quarters or eighths; some of the other models are in thirds, fifths or sixths" | The new G3 gate reads every distractor of the payload's `terms` |
| G1 (lessonfit) | SIZE holds every pre / related to the lesson's own dealt maximum (its direct and partial items; the CEIL bound only for a gap lesson), and a pre also to its cited unit's maximum, with max(1.5 × c, c + 2). A story cell's `steps[]` (a × b, a ÷ b) with a factor, divisor or quotient past 12, or of tables untaught by the week, is a finding. A function table's In / Out numbers (`rows[].x / y`, skipped as layout before) now count | Mutation 1 and F2 fail; the per-lesson rule found 5 more relateds (below) |
| G2 | New `boundBreaks`: "<areas / products / sums / totals / quotients / differences / answers / perimeters> A to B" is read both ways (an item below A or above B fails), "… to N" one way, "never / no … more than / past / above N" against the largest number, "never … by more than N" against the divisors and factors, "dividing by A to B" against the divisors, "within the tables" against the story steps | Mutations 2, 3, 6, 7, 14 fail |
| G3 | New `claimLists`: every size in "groups of 2, 3 … or 6" is dealt; a negated fraction family ("never thirds") holds on any skill, not only one with a `denoms` option; a $N bill named or denied holds against the payload's `notes`; "the other models (are) in …" holds for every distractor unless the why says "some" | Mutations 4, 8, 9, 12 fail |
| n1 (lesson 7) | "areas 4 to 48" restored | 400 items: 4 to 48 (G2 now gates it both ways) |
| n2 (lesson 9) | `estimate_mass_volume`'s why and lesson 9's rule-5 record name Y5's `capacity_estimate` (the volume half, 3.MD.A.2) and say why the option is still needed (the mass half). **The lead reconciles at merge** | |
| n3 (lesson 13) | The related `time_sense` (a.m. / p.m.) is replaced by `elapsed_hour`: "a time on a time line 1, 2 or 3 hours later or earlier than a start time". `compare_durations.closes` now equals the clause it closes ("which took longer"; "by how much" is gone) | 60 items: intervals 60 / 120 / 180 min, later and earlier |
| n4 (lesson 15) | The audit row says "totals to about 100 dollars ($100.46 is dealt)" | |
| n5 (lesson 21) | `money_place_value`'s why and lesson 21's rule-5 record name VISUAL_BUILDS `vis_coin_options` (a coin chart £1 / 10p / 1p) and `money_convert`'s place chart $ \| ¢, and say why a chart with a tens column of dollars to $99.99 is still a separate option. **The lead reconciles at merge** | |
| n6 (lesson 23) | Left as is (optional): the R lane's own R.B11.S12 link, its why true, no band below 20 | |

**Round-2 sweep.** Every why and clause of all 23 lessons was re-read against 45 fresh items a link (seed 424243, stride 67) and run through the new rules on the default seeds and 3 fresh seed sets at n=60. The new rules found 6 links; all are fixed:

| Lesson | Finding | Fix |
|---|---|---|
| 1 Find the rule | `number_patterns_rule` held to 30: a gate fault, the function table's In / Out numbers were skipped as layout keys | The gate reads `rows[].x / y` (the lesson deals to 99) |
| 3 Properties of multiplication | related `dot_array_mult {band: 100}` deals 90; the lesson's items stop at 20 | `band: 25` (products to 25) |
| 5 Partition shapes | related `whole_as_fraction` writes wholes to 10; the lesson's parts are 2 to 4 | Dropped, with a "No related" note (the other fraction skills duplicate the pre) |
| 8 Distributive area | the new why said "areas 18 to 24"; 14 is dealt | "areas 14 to 24" |
| 10 Measure to the inch | related `line_plot_fractions` totals to 11; the lesson deals to 6 | `tiles: 6` (to 8) |
| 11 Build a line plot | related `bar_graph {forms: [0, 1]}` values to 45; the lesson deals to 11 | `most: 10` |
| 13 Compare durations | the first `elapsed_hour` why said "duration"; the items ask for a time | Reworded to the time later or earlier |

**Mutations.** The critic's 19 lessonfit mutations were re-run (`mymut2.py`, re-injecting the three in-file defects): all 18 valid ones and 6 more variants are caught, the control is clean. `lessonmut.py` keeps 14 of them (106 mutations, 0 missed). The critic's 19 post-finish edits (`postmut.py`, run in clean tree A, p1 now strips the range) are all caught; the control exits 0 with sha `2596565b…`.

**Merge.** `lessonmerge.mjs` with all lanes (Y1 from /home/user/wt-l1 with 39 lessons, Y2 / Y3 from /home/user/MathQuest) and the critic's `merge.mjs`: 0 real conflicts, order independent, 0 lesson tagFixes, every lessons section exact and in order; the 41 differing core fields are the same as round 1 (none a value Y4 contributes).

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
| Two clean `git archive` builds (dump, step build, lessons build) | Byte-identical: sha256 `e4363da04f8ed1cd8aa518554e47bafecf482655e0b3122057feb06f4f5502de` (round 4; round 3 `1bed00da…`; round 2 `2596565b…`; build B deleted Y4.json first and ran with a fresh data dir and no `WRM_TAG_DATA`) |
| Frozen gate | OK |
| lessonspec | 0 differences |
| lessoncheck | 0 differences |
| lessonfit | Round 4: 0 findings at the default seeds, the critic's r3 seeds `[[83117,47],[29303,67]]` (n 40 / 60), `[[77711,53],[15013,79]]`, `[[70001,43],[51229,61]]` and 3 fresh sets (`[[64013,71],[22307,43]]`, `[[90121,53],[37019,89]]`, `[[15551,61],[70709,37]]`; n 40 and 60). Round 2: 0 findings at the default seeds and on 3 fresh seed sets at n=60 (`[[13579,41],[24680,43]]`, `[[31415,47],[27182,53]]`, `[[11111,59],[99991,61]]`) |
| lessonmut | Round 4 (clean tree A): **137 mutations and controls, 0 missed** (round 3's 117, plus 16 mutations and 4 controls for F5 / G7 / G8 / n7b and the sweep; the G1 dot_array message now reads the fixed-probe maximum 25). Round 3: 117 mutations and controls, 0 missed (round 2's 106 plus 11 for G4, G5 and n7) |
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
| Mass and volume | `mass_volume_liquid` 0-2; `capacity` units / forms; `unit_conversions`; `unit_conversion_word`; `estimate_length`; `heavier_lighter`; overlap (round 2, n2): Y5's proposal `capacity_estimate` covers the volume half of `estimate_mass_volume`, for the lead to reconcile |
| Half / quarter inch | `reading_ruler` parts / labels; `reading_ruler_hard`; `estimate_length`; `length_customary`; make_line_plot / ruler_difference (builds) |
| Line plot | `line_plot` 0 / 1; `line_plot_g2` 0-2; `line_plot_fractions` 0-2; `build_bar_graph`; `build_pictograph` |
| Compare durations | `elapsed_visual_*`; `elapsed_find_duration`; `elapsed_hour` / 30min / 15min; `order_clocks_*`; `time_sense` |
| Comparing multiplication statements | `compare_expressions` 0 / 1 (order of operations, above Grade 2); `placevalue:compare`; `equal_sign`; `balance_addsub`; `mult_properties` 0 |
| Capacity | `capacity` (units, conversions); `mass_volume_liquid` 0; `compare_objects`; `heavier_lighter` |
| Weight | `heavier_lighter` 0 / 1; `mass_volume_liquid` 1; `compare_objects` |
| Order fractions | `order_fractions` 0-2; `order_frac_numline`; `compare` denoms / forms; `compare_frac_lcd` |
| Pounds, tens, ones | `money_notation` collection / words; `money_count` kinds; `coin_value`; `money_compare`; money_convert (Y4, its spec's place chart $ \| ¢); VISUAL_BUILDS `vis_coin_options` (a coin chart, no tens of dollars); `placevalue:identify`; overlap (round 2, n5) for the lead to reconcile |
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
