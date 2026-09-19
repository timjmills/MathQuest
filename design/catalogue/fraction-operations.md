# Family review: fraction-operations

Category reviewed: `fraction_operations` (39 skills). Generator: `js/modules/gen-fractions.js` (all line numbers below are in that file unless another file is named). Routing: `js/modules/generate-question.js`. Evidence: code reading, `tests/compliance/catalogue.json`, and the baseline screenshots in `tests/compliance/baseline/2026-09-19-before/`. No app code was changed.

## Summary

1. Verdicts: keep 0, fix 9, redo 3, split 9, merge 18. Total 39 of 39.
2. Worst problem 1, answer leaks in the picture. `mult_frac_frac` prints "overlap = 3/36" under every problem (L3006, seen in the print baseline). `decompose_fractions` prints the answer tiles "1/5 + 1/5" under the bar (L665-667). `add_fractions_like` and `sub_fractions_like` draw the answer bar already shaded (L201-203, L285-286). `div_unit_fraction` prints "Count all pieces: 3 x 3 = ?" (L3089).
3. Worst problem 2, silent type mixing in almost every skill. A 25% "Click ALL ..." multi-select (38 such prompts in the file), a 20% drag-to-bins sort, and a 3-way variant rotation sit inside the computing skills. The sorts are estimation tasks ("sums greater than 3"), not the skill on the label. The rotation names are wrong in the code ('missing' means "with regrouping" at L1609 and L1664; 'missing_num' means "common denominator already shown" at L1475). Two side variants can also land on the same printed page as two of six items (`add_frac_like_nv` print baseline, items 1 and 4), so a third of the page is not the skill. The printed multi-select reads "Circle ALL ..." beside check boxes, which contradicts the "Check" verb ruling twice over.
4. Worst problem 3, no isolation of the hard step. Sum within 1 and sum past 1, regroup and no regroup, related and unrelated denominators, n / (1/b) and (1/b) / n are all drawn at random inside one id. The pictures then announce the decision ("regroup!" L408, "Need to borrow!" L497, "Borrowing needed!" L1254), which also breaks the "regroup, never borrow" ruling.
5. Worst problem 4, broken output. `estimate_frac_ops` prints negative differences ("1/6 - 1/5", item 5 of the print baseline; "-0.5" as the keyed answer in catalogue.json) and keys "1.5" while offering "1 1/2" as a wrong option (L4991-5010). Exact trigger: the guard at L4993 re-rolls `n2 = rng(1, max(1, floor(val1 * d2)))`, so when `val1 * d2 < 1` the floor is 0 and `n2` is forced to 1, which can still exceed `val1`; L4995 then benchmarks a *third* random value (`actualVal2`) that is not the fraction printed. The key can therefore disagree with the item and can be negative. The drag-to-bins variant prints as one sentence with no tiles and no bins (print baselines of `add_frac_like_nv`, `mult_scaling_nv`). The mixed-number print blank is a fraction box with nowhere to write the whole (`sub_mixed_like_nv` print, item 2). `sub_mixed_like` on screen draws bars about 2000 px tall.
6. Worst problem 5, answers that cannot be marked or that leak through the widget. Typed sums such as "1/4 + 1/4 + 1/4" go to `fractionAnswersMatch`, which cannot parse a sum, so they are always marked wrong (`answer-check.js:665-672` with `isFractionSkill` at L907-926; read from code, confirm in a browser). The same path makes the `<`, `>`, `=` answers of `mult_scaling_nv` unmarkable. On screen the input flips between stacked fraction boxes and a plain text box depending on whether the keyed answer is a proper fraction (`generate-question.js:541-548`), which tells the pupil whether the sum passes 1.
7. No skill in the family reads `state.range`, and none uses the grade denominator cap that the file defines at L65-71. Like-denominator skills use `rng(2, 12)`, so 7, 9 and 11 appear and 1/2 + 1/2 is the only item for denominator 2.
8. Twins: 15 picture / "No Visuals" pairs and 3 "No Pictures" word-problem pairs are the same skill at two scaffold levels. The plain twins already generate through their base (`generate-question.js:27-30`).
9. Already good: answer checking accepts equivalent fractions and mixed or improper forms; `add_frac_unlike_nv` and the mixed unlike skills use a curated list of denominator pairs with small common denominators (L1122, L1458); `frac_as_div_word` has three clean story types with measurement contexts; the NV skills already contain unknown-position items and a regroup / no-regroup separation that only needs to be exposed; the print form of `estimate_frac_ops` (round each fraction, then estimate) is a better item than the screen form.
10. Nothing here can be reused as `workedSteps` without rewriting. No skill in the family sets `q.fractionData`, so the structured solution in `solution-display.js:140-176` never runs; the "worked" text the catalogue counted is the hint split into sentences, and the hints are run-on and say "borrow".

## Proposed ladders

One strategy per ladder. Each step has one delta. "opt" means an option on an existing id, not a new id. Review after every 2-3 steps and Test A/B at the end are implied.

### FO-A Add and subtract fractions, like denominators (Level 4). Strategy: count unit fractions on a bar; the denominator names the piece and does not change.

| Step | Kind | Skill (option) | Delta |
|---|---|---|---|
| 0 | pre-skill check | `fractions:identify`, fractions equal to 1 | start |
| 1 | concept | `decompose_fractions` (form: unit, fill-in template under a bar) | start |
| 2 | concept | `decompose_fractions` (form: two addends, more than one way) | unknown |
| 3 | bridging | `add_fractions_like` (sum: within 1, model: bar, pupil shades the answer bar) | representation |
| 4 | procedure | `add_fractions_like` (model: none) = old `add_frac_like_nv` | scaffold |
| 5 | bridging | `sub_fractions_like` (model: bar, pupil crosses out) | opMix (new operation) |
| 6 | procedure | `sub_fractions_like` (model: none) = old `sub_frac_like_nv` | scaffold |
| 7 | case | sums equal to 1; subtract from 1 written as b/b, then as 1 | range. GAP: `sub_frac_from_whole` |
| 8 | case | `add_fractions_like` (sum: past 1, improper then mixed) | range |
| 9 | procedure | missing numerator, first then second position, sum not simplified | unknown |
| 10 | discriminate | error analysis "adds the denominators too" | base page |
| 11 | apply | `frac_word_problems` (one schema per set) | format |

### FO-B Mixed numbers, like denominators (Level 4). Strategy: wholes and parts separately; regroup 1 whole as b/b. (See owner question 2.)

| Step | Kind | Skill (option) | Delta |
|---|---|---|---|
| 1 | bridging | `add_mixed_like` (regroup: none, model: bar) | start |
| 2 | procedure | `add_mixed_like` (regroup: none, model: none) | scaffold |
| 3 | decide | "Do the parts make a new whole?" Check a box. Do not solve. | responseScope |
| 4 | case | parts make exactly 1 (3 2/4 + 1 2/4) | range |
| 5 | procedure | `add_mixed_like` (regroup: yes) | range |
| 6 | procedure | `sub_mixed_like` (regroup: none) | opMix |
| 7 | case | equal parts (whole-number answer); mixed minus whole | range |
| 8 | decide | "Is the top fraction big enough?" Check a box. Do not solve. | responseScope |
| 9 | notate | rename only: 4 1/5 = 3 6/5. Do not subtract. | responseScope |
| 10 | procedure | `sub_mixed_like` (regroup: yes) | range |
| 11 | case | whole minus fraction, whole minus mixed (5 - 2 3/8) | range. GAP: `sub_frac_from_whole` |
| 12 | procedure | missing addend / missing subtrahend | unknown |

### FO-C Unlike denominators (Level 5). Strategy: rename with an equivalent fraction so the denominators match; find the common denominator by listing multiples. (See owner question 5.)

| Step | Kind | Skill (option) | Delta |
|---|---|---|---|
| 0 | pre-skill check | `fractions:equiv_frac_nv` missing numerator; multiples | start |
| 1 | decide | "Can you add these yet?" same / different denominators | start. GAP: FO-02, supplied as the `decision` member |
| 2 | notate | related pair (2 and 4, 3 and 6, 5 and 10): rename one fraction. Do not add. | responseScope |
| 3 | procedure | `add_frac_unlike` (pairs: related, sum within 1, fill-in frame) | responseScope: full |
| 4 | procedure | `sub_frac_unlike` (pairs: related) | opMix |
| 5 | notate | unrelated pair (2 and 3, 3 and 4, 2 and 5): list multiples, rename both. Do not add. | range |
| 6 | procedure | `add_frac_unlike` (pairs: unrelated) | responseScope: full |
| 7 | procedure | `sub_frac_unlike` (pairs: unrelated) | opMix |
| 8 | range | pairs with a shared factor (4 and 6, 6 and 8) | range |
| 9 | case | sum past 1; difference of equal values (0); answer that simplifies | range |
| 10 | fade | frame removed | scaffold |
| 11 | procedure | `add_mixed_unlike` (regroup: none) | range |
| 12 | procedure | `add_mixed_unlike` (regroup: yes) | range |
| 13 | procedure | `sub_mixed_unlike` (regroup: none) | opMix |
| 14 | procedure | `sub_mixed_unlike` (regroup: yes) | range |
| 15 | discriminate | `estimate_frac_ops` as a reasonableness check | format |
| 16 | apply | stories with unlike denominators | GAP: `frac_word_unlike` |

### FO-D Multiply fractions (Levels 4-5). Strategy: repeated addition, then "of" with an area square, then multiply numerators and denominators.

| Step | Kind | Skill (option) | Delta |
|---|---|---|---|
| 1 | concept | `mult_frac_whole` (unit fractions only, bars, write the addition and the product) | start |
| 2 | procedure | `mult_frac_whole` (a/b, product within 1) | range |
| 3 | case | product is a whole number; product past 1 | range |
| 4 | second orientation | a/b x n read as "a/b of n" | format |
| 5 | concept | `mult_frac_frac` (unit x unit, pupil shades the area square) | start of part 2 |
| 6 | bridging | `mult_frac_frac` (a/b x c/d with the square) | range |
| 7 | procedure | `mult_frac_frac` (model: none) = old `mult_frac_frac_nv` | scaffold |
| 8 | case | factor equal to 1 (n/n); product that simplifies | range |
| 9 | concept | `mult_scaling` (bigger / smaller / the same) | format |
| 10 | procedure | mixed number x whole, mixed x fraction | GAP: `mult_mixed_numbers` |
| 11 | apply | `frac_mult_word` (schema: equal groups), then (schema: area / "of") | format |

### FO-E Divide with unit fractions (Level 5). Strategy: "How many 1/b are in n?" counted on bars; "1/b shared by n" as cutting one piece. No invert-and-multiply at this Level.

| Step | Kind | Skill (option) | Delta |
|---|---|---|---|
| 1 | concept | `div_unit_fraction` (direction: whole by unit, bars, pupil counts) | start |
| 2 | procedure | same, model: none | scaffold |
| 3 | concept | `div_unit_fraction` (direction: unit by whole, one bar cut) | opMix |
| 4 | procedure | same, model: none | scaffold |
| 5 | discriminate | both directions on one page: "Is the answer more than 1 or less than 1?" | opMix |
| 6 | procedure | missing dividend / missing divisor | unknown |
| 7 | apply | `frac_mult_word` (schema: how many pieces) | format |

### FO-F Fraction as division (Level 5)

| Step | Kind | Skill | Delta |
|---|---|---|---|
| 1 | concept | `frac_as_division` (a less than b, sharing picture) | start |
| 2 | procedure | `frac_as_div_nv` (a / b written as a fraction, then the reverse) | representation |
| 3 | case | a greater than b (mixed number); a equal to b; a a multiple of b | range |
| 4 | apply | `frac_as_division` (pictures: off) = old `frac_as_div_word` | format |
| 5 | concept | "Between which two whole numbers?" | GAP: option on `frac_as_div_nv` |

### FO-G Tenths and hundredths (Level 4)

| Step | Kind | Skill | Delta |
|---|---|---|---|
| 1 | bridging | `frac_10_100` (strip and blank hundred grid; pupil shades, then writes) | start |
| 2 | procedure | `frac_10_100` (model: none, both directions: 3/10 = ?/100 and 30/100 = ?/10) | unknown |
| 3 | procedure | add tenths and hundredths | GAP: `add_tenths_hundredths` |

### Skills that belong to no ladder

`mixed_fraction_ops`, `frac_word_mixed`, `frac_word_mixed_plain`. They are mixed-review pools. The Mixed practice, Review and Daily Spiral page roles now do this job; the ids stay for share codes.

## Skill table

Tag columns list the tags the skill should carry after this review. "Auth" points to the authoring pack below (A1 to A9). All skills also need: colour removed from question content, the purple screen title removed, and the multi-select and drag-to-bins side variants removed from the practice generator (they become thinking-page content).

| Skill id | Gr | Host | Special tags | Verdict | Defects (short) | To author |
|---|---|---|---|---|---|---|
| `add_fractions_like` | 4 | visual-grid | none | split | answer bar pre-shaded L201-203; sum within 1 / equal 1 / past 1 mixed at random; den `rng(2,12)` L176 gives 7, 9, 11; 25% "sums equal to 1" multi-select L138; input widget leaks answer size | A1 |
| `sub_fractions_like` | 4 | visual-grid | none | fix | answer bar pre-shaded L285-286; start of n/n printed as "5/5" at random, never as 1; den `rng(2,12)` L250; 25% "less than 1/2" multi-select L207 | A1 |
| `add_mixed_like` | 4 | visual-grid | sub-decide | split | regroup / no regroup random; picture prints "regroup!" L408; sort variant builds "0 3/4" as a mixed number (L334-346); catalogue host was equation-drill but it draws bars | A2 |
| `sub_mixed_like` | 4 | visual-grid | sub-decide, sub-notate | split | regroup random; "Need to borrow!" L497 and hint L474; no whole minus fraction; screen bars about 2000 px tall (screen baseline) | A2 |
| `mult_frac_whole` | 4 | visual-grid | hands-match | fix | unit and non-unit fractions mixed; product within 1 and past 1 mixed; multi-select counts "W / D" as correct (L511), a Level 5 idea; order flipped at random L557 | A4 |
| `decompose_fractions` | 4 | visual-grid | hands-match | redo | answer tiles printed L665-667; n/n glut (4 of 6 in print baseline) from L636-637, and items 1 and 2 are the identical "Write 2/2 ..." item on one page; shaded part prints as one solid black block with no partition lines, so the unit fractions cannot be counted; typed sum cannot be marked (`answer-check.js:665`); only one decomposition type | A1 |
| `frac_word_problems` | 4 | word-problems | schema-story, sub-decide | redo | two story templates, food only (L713-745); "ate 2/8 of it" reads as a fraction of the remainder; result-unknown only; 37-word distractor variant L671-712 | A8 |
| `frac_word_problems_plain` | 4 | word-problems | schema-story, sub-decide | merge | twin of `frac_word_problems` (`generate-question.js:27`) | as target |
| `frac_10_100` | 4 | visual-grid | hands-match | fix | only 9 possible items L825 (10 distinct of 12); hundred grid pre-shaded with the answer L847-853; multi-select asks about decimals 0.30 (another skill) L773-822; one direction only | A6 |
| `add_frac_unlike` | 5 | visual-grid | sub-decide, sub-notate | split | any two of [2..12] L913-916: common denominators to 60, related and unrelated pairs mixed; renamed bars pre-shaded L945-946; sum past 1 random | A3 |
| `sub_frac_unlike` | 5 | visual-grid | sub-decide, sub-notate | split | as above L994-1004; equal values give 0 by accident (swap only when less, L1004) | A3 |
| `add_mixed_unlike` | 5 | visual-grid | sub-decide, sub-notate | split | regroup random; sort variant builds "0 1/2" L1085-1097; good pair list L1122 | A3 + A2 |
| `sub_mixed_unlike` | 5 | visual-grid | sub-decide, sub-notate | split | regroup random; "Borrowing needed!" L1254, hint L1231 | A3 + A2 |
| `add_frac_like_nv` | 4 | equation-drill | none | merge | into `add_fractions_like`; missing numerator shown against a simplified or mixed sum L1321; 'straight' and 'simplify' are the same item L1313 / L1329; sort variant prints empty; print garbles "?/9" (print baseline) | as target |
| `sub_frac_like_nv` | 4 | equation-drill | none | merge | into `sub_fractions_like`; same defects L1376-1414 | as target |
| `add_frac_unlike_nv` | 5 | equation-drill | sub-decide, sub-notate | merge | into `add_frac_unlike`; keep its pair list L1458; variant names wrong L1463-1490; missing numerator against a mixed sum L1490 | as target |
| `sub_frac_unlike_nv` | 5 | equation-drill | sub-decide, sub-notate | merge | into `sub_frac_unlike` L1546-1588 | as target |
| `add_mixed_like_nv` | 4 | equation-drill | sub-decide | merge | into `add_mixed_like`; wholes to 9 while the step is new L1600; variant 'missing' is "with regrouping" L1609 | as target |
| `sub_mixed_like_nv` | 4 | equation-drill | sub-decide, sub-notate | merge | into `sub_mixed_like`; already separates no-regroup / regroup / missing subtrahend (L1650, L1664, L1676) under wrong names; print blank cannot take a mixed number | as target |
| `add_mixed_unlike_nv` | 5 | equation-drill | sub-decide, sub-notate | merge | into `add_mixed_unlike` L1703-1761 | as target |
| `sub_mixed_unlike_nv` | 5 | equation-drill | sub-decide, sub-notate | merge | into `sub_mixed_unlike` L1762-1863; hints say "borrow" | as target |
| `mult_frac_whole_nv` | 4 | equation-drill | hands-match | merge | into `mult_frac_whole`; den `rng(2,8)` includes 7 L2144; whole to 9 L2146; missing-factor item against a simplified product L2165 | as target |
| `decompose_frac_nv` | 4 | equation-drill | hands-match | merge | into `decompose_fractions`; den 2 gives `rng(2,1)` L2231-2232; "two different fractions" has one keyed answer and is impossible for 2/b L2249-2252; keep "How many 1/b make a/b?" L2256 | as target |
| `frac_10_100_nv` | 4 | equation-drill | hands-match | merge | into `frac_10_100`; its tenths + hundredths item L2336-2341 becomes the new skill | as target |
| `mult_frac_frac_nv` | 5 | equation-drill | none | merge | into `mult_frac_frac`; missing numerator against a simplified product L2418 | as target |
| `div_unit_frac_nv` | 5 | equation-drill | none | merge | into `div_unit_fraction`; four variants rotate both directions L2488 | as target |
| `frac_as_div_nv` | 5 | equation-drill | hands-match | fix | independent `rng` L2592-2593 gives 6 / 3 = 2, 5 / 5 = 1, 9 / 2 = 4 1/2 with no warning; type 2 is a story (belongs to the word skill) L2598-2609; type 3 is improper-to-mixed in a 14-word sentence L2617; no reverse direction | A5 |
| `frac_as_div_word` | 5 | word-problems | schema-story | merge | into `frac_as_division` (pictures: off); its generator L2626-2692 is the better one and should become the target's body; catalogue host was equation-drill | as target |
| `mult_scaling_nv` | 5 | equation-drill | hands-sort | merge | into `mult_scaling`; type 1 is always "Less than", type 2 always "Greater than" and is the only one that says "Without calculating" L2818-2829; print splits the sentence around the fraction (print baseline) | as target |
| `mult_frac_frac` | 5 | visual-grid | none | fix | prints the answer "overlap = n/d" L3006; three regions told apart by colour only (same grey in print); unit x unit not first; 25% multi-select L2865 and 20% sort L2913 | A4 |
| `div_unit_fraction` | 5 | visual-grid | none | split | direction chosen by coin flip L3060; "Count all pieces: w x d = ?" L3089; whole can be 1 (duplicate "1 / 1/6" in samples); print bars solid black with unreadable labels | A5 |
| `frac_as_division` | 5 | word-problems | schema-story | fix | every item is a share story, so host is word-problems; a from `rng(1, min(b+2, 8))` L3173 mixes proper, equal to 1 and mixed answers; no unit word in the answer; orange pizzas | A5 |
| `mult_scaling` | 5 | visual-grid | hands-sort | fix | core item sound L3342-3364; "equal" case rare (n = d only); 30% sort and 30% multi-select mixed in L3232-3341; long stem for ELL pupils (12 words plus three options) | A7 |
| `frac_mult_word` | 5 | word-problems | schema-story, sub-decide | split | four templates across three schemas picked at random L3444-3495 (equal groups, area, how many pieces); unsimplified fractions in stories ("2/4 of a liter"); 39-word distractor variant L3396-3441 | A8 |
| `frac_mult_word_plain` | 5 | word-problems | schema-story, sub-decide | merge | twin (`generate-question.js:28`) | as target |
| `frac_word_mixed` | 4 | word-problems | sub-decide | fix | pool is `frac_word_problems` + `frac_mult_word` (`generate-question.js:46`), so a Level 4 id serves Level 5 content; cannot serve a one-schema page, so `schema-story` comes off | A8 (decision lines only) |
| `frac_word_mixed_plain` | 4 | word-problems | sub-decide | merge | twin (`generate-question.js:30`) | as target |
| `mixed_fraction_ops` | 5 | equation-drill | none | fix | pool is every playable skill in the category (`generate-question.js:198-210`): stories, scaling, estimation and sorts land in one equation grid; 8 distinct of 12; sample "decompose 3/3" | none (draws from its members) |
| `estimate_frac_ops` | 5 | visual-grid | hands-sort | redo | negative differences and a value that does not match the printed fraction L4991-4995; keys "1.5" / "-0.5" L5010 while "1 1/2" is a wrong option; 1/4 and 3/4 rounded by an arbitrary rule L4998-5002; print is a production item, screen is multiple choice | A9 |

## Authoring pack

Existing hint text is raw material only. Every step below is an imperative of 10 words or fewer and says "regroup".

**A1 Like denominators (add, subtract, decompose).**
workedSteps (add): 1 Check the denominators are the same. 2 Add the numerators. 3 Keep the denominator. 4 (past 1 only) Write the improper fraction as a mixed number. Subtract: replace step 2 with "Subtract the numerators." Decompose: 1 Read the denominator. 2 Write one unit fraction for each shaded part. 3 Count: the numerators add to the top number.
wrongAnswer: adds the denominators too (1/4 + 2/4 = 3/8); subtracts the denominators (5/8 - 2/8 = 3/0); in 1 - 3/8 treats 1 as 1/8 (answer 2/8); in a missing-numerator item adds the two numbers shown.
Say: "__ fifths plus __ fifths equals __ fifths." Vocabulary: numerator, denominator, unit fraction.

**A2 Mixed numbers.**
workedSteps (add, regroup): 1 Add the fraction parts. 2 Regroup b/b as 1 whole. 3 Add the wholes and the new whole. 4 Write the mixed number. (Subtract, regroup): 1 Compare the fraction parts. 2 Regroup 1 whole as b/b. 3 Subtract the fraction parts. 4 Subtract the wholes. 5 Write the mixed number.
decision lines: "Do the parts make a new whole? Yes / No." "Is the top fraction big enough? Yes: subtract. No: regroup first."
notate: cross out the whole, write one less, write the new numerator (4 1/5 becomes 3 6/5).
wrongAnswer: subtracts the smaller fraction from the larger whatever the order (4 1/5 - 1 3/5 = 3 2/5); regroups as ten (4 1/5 becomes 3 11/5); regroups but does not reduce the whole (answer one too big); leaves 3 7/5 unregrouped or drops the extra whole (3 2/5).
Say: "__ wholes and __ parts. I regroup 1 whole as __ __s." Vocabulary: mixed number, whole, regroup.

**A3 Unlike denominators.**
workedSteps: 1 Look at the denominators. 2 List multiples. Circle the first one they share. 3 Rename each fraction. 4 Add (or subtract) the numerators. 5 Keep the denominator.
decision lines: "Can you add these yet? Same denominators: yes. Different: rename first." Second decision for related pairs: "Rename one fraction or both?"
notate: write the common denominator and the two renamed fractions in the frame. Do not add.
wrongAnswer: adds across (1/2 + 1/3 = 2/5); changes the denominators but not the numerators (1/6 + 1/6); renames only one fraction; subtracts the denominators after renaming.
Say: "__ is the same as __. Now the denominators match." Vocabulary: common denominator, equivalent fraction, multiple.

**A4 Multiply.**
workedSteps (fraction x whole): 1 Write the whole number as groups. 2 Multiply the numerator by the whole number. 3 Keep the denominator. 4 Write a mixed number if it is past 1. (fraction x fraction): 1 Shade the first fraction across. 2 Shade the second fraction down. 3 Count the parts shaded twice. 4 Count all the parts. 5 Write the fraction.
wrongAnswer: multiplies numerator and denominator by the whole (3 x 2/5 = 6/15); adds the whole to the numerator (5/5); for fraction x fraction finds a common denominator and multiplies only the numerators; adds instead of multiplying.
Say: "__ groups of __ equals __." and "__ of __ is __." Vocabulary: product, factor, unit fraction.

**A5 Divide with unit fractions; fraction as division.**
workedSteps (n / 1/b): 1 Draw n wholes. 2 Cut each whole into b parts. 3 Count all the parts. (1/b / n): 1 Shade 1/b of the bar. 2 Cut that part into n equal parts. 3 Count how many parts fit in the whole. 4 Write one part as a fraction. (a / b): 1 Write the number shared on top. 2 Write the number of groups below. 3 Write a mixed number if it is past 1.
wrongAnswer: divides the whole by the denominator (4 / 1/2 = 2); gives n/b for 1/b / n; inverts a / b (3 / 4 = 4/3); writes a remainder (7 / 2 = 3 r 1).
Say: "There are __ one-__s in __." "One __ shared by __ is one __." "__ shared by __ is __ over __." Vocabulary: divide, unit fraction, share equally.

**A6 Tenths and hundredths.**
workedSteps: 1 Multiply the numerator by 10. 2 Multiply the denominator by 10. 3 Write the new fraction. (add): 1 Rename the tenths as hundredths. 2 Add the numerators. 3 Keep 100 as the denominator.
wrongAnswer: changes only the denominator (3/10 = 3/100); changes only the numerator (30/10); adds without renaming (3/10 + 4/100 = 7/100 or 7/110).
Say: "__ tenths is the same as __ hundredths." Vocabulary: tenths, hundredths, equivalent.

**A7 Scaling.** The skill is itself a decision, so it needs rule lines rather than a sub-decide page: "Factor less than 1: smaller. Factor equal to 1: the same. Factor more than 1: bigger."
workedSteps: 1 Find the fraction factor. 2 Compare it to 1. 3 Check the box: bigger, smaller or the same.
wrongAnswer: "multiplying always makes bigger"; compares the numerator with the whole number; calls n/n "bigger".
Say: "__ is less than 1, so the product is smaller than __." Vocabulary: factor, product, scale. `claims[]` for Reason It: "Multiplying makes a number bigger" (sometimes).

**A8 Word problems.** Story lines, schema id and unit word per template; neutral contexts beyond food (lengths, time, distance, capacity). One schema per set: join, separate, compare (Level 4, like denominators); equal groups, area / "of", how many pieces (Level 5). Unknown positions: result first, then change.
decision lines: "Put together: add. Take away or compare: subtract. Equal groups or part of a part: multiply. How many pieces or share equally: divide."
wrongAnswer: adds when the story separates; uses a whole number from the story that is not needed; multiplies n x 1/b where the story asks how many 1/b are in n.
Say: "I know __ and __. I need to find __. I will __." Vocabulary: in all, left, each.

**A9 Estimation.**
workedSteps: 1 Mark each fraction on the 0 to 1 line. 2 Circle the closest of 0, 1/2, 1. 3 Add or subtract the circled numbers.
wrongAnswer: rounds every fraction to 1; adds numerators and denominators, then rounds; looks at the numerator only.
Say: "__ is close to __." Vocabulary: estimate, benchmark, about.

## Details

**add_fractions_like (split).** Variants to isolate: sum within 1; sum equal to 1; sum past 1 (improper, then mixed). The last needs an extra worked step, so it cannot share a set with the first while new. Replace `rng(2,12)` with the family denominator set. The third bar must be blank with dotted partitions for the pupil to shade; today it is the answer. Absorb from the NV twin: missing numerator, with the sum printed over the same denominator, never simplified.

**sub_fractions_like (fix).** Same picture fix: the pupil crosses out parts on the first bar; the "remaining" bar goes. Seed, do not randomise, the n/n start, and add the form "1 - a/b". Move "differences less than 1/2" to a thinking page.

**add_mixed_like (split).** Variants: no regroup; parts make exactly 1; regroup. Remove the "regroup!" caption: it answers the decide step. The drag variant must never build a mixed number with a 0 whole. Host is visual-grid (bars), not equation-drill.

**sub_mixed_like (split).** Variants: no regroup; equal parts; regroup; whole minus fraction or mixed (not generated today). Remove "Need to borrow!" and every "borrow" in hints. Fix the screen bar sizing (the SVGs stretch to the card width). This skill is the fraction family's analogue of subtracting across zeros and needs its notate step (rename only).

**mult_frac_whole (fix).** Add an option for unit fractions only, used first. Separate product within 1 from product past 1 by step. Make operand order an option (second-orientation step), not a coin flip. Drop "W / D" from the multi-select, or move that variant to Level 5.

**decompose_fractions (redo).** The picture gives the full answer and the typed answer cannot be marked. Rebuild as a template item: bar above, "a/b = []/b + []/b + []/b" below, one box per unit fraction; second form "two addends" accepts any pair that sums correctly (the checker must add, not compare strings); third form "How many 1/b make a/b?" from the NV twin. Exclude n/n except as a seeded edge case. Add mixed-number decomposition (2 1/4 = 1 + 1 + 1/4) as a later range step.

**frac_word_problems (redo).** Two sentences about eating is not a word-problem skill. Needs a template bank by schema (join, separate, compare; then change-unknown), several neutral contexts, fixed unit words, and wording that cannot be read as "a fraction of what is left". The "which numbers do you need" variant is a separate, heavier reading task and leaves the practice generator.

**frac_word_problems_plain, frac_mult_word_plain, frac_word_mixed_plain (merge).** Already generated from the base with the picture stripped (`generate-question.js:27-30`, L525-531). Alias each to its base with option `pictures: false`.

**frac_10_100 (fix).** Nine possible items. Add the reverse direction and the n/n multiplier frame (FR-15). Print the hundred grid blank for the pupil to shade. The decimal multi-select belongs to `decimals`.

**add_frac_unlike, sub_frac_unlike (split).** Variants: related denominators (rename one); unrelated (rename both); shared factor (common denominator is not the product); sum past 1 / difference 0 as seeded cases. Use the curated pair list from the NV twin, grouped by variant. The renamed bars must be blank. The NV "common denominator shown" item (L1475-1484) is the fill-in frame at scaffold level 3 and should be produced by the scaffold system, not by a rotating variant.

**add_mixed_unlike, sub_mixed_unlike (split).** Variants: no regroup; regroup. Pair lists are already sensible. Same caption and wording fixes as the like-denominator mixed skills.

**The eight add/sub NV twins (merge).** Each aliases to its picture skill with option `model: none`. Content to carry over before retiring the code: missing-numerator and missing-addend items (unknown-position steps), the curated denominator pairs, and the no-regroup / regroup separation in `sub_mixed_like_nv`. Defects not to carry over: unknown shown against a simplified or mixed total (L1321, L1398, L1490, L1629); duplicate 'straight' / 'simplify' items (the checker accepts unsimplified answers, so "simplify" is not enforced); wholes to 9 on a new step; print blanks that cannot hold a mixed number.

**mult_frac_whole_nv, decompose_frac_nv, frac_10_100_nv, mult_frac_frac_nv, div_unit_frac_nv, mult_scaling_nv (merge).** Same rule: alias to the picture skill with `model: none`. `decompose_frac_nv` has a crash-prone range (`rng(2, den-1)` with den 2). `mult_scaling_nv` leaks the answer through its wording and should not survive as separate code.

**frac_as_div_nv (fix).** Keep as the symbolic step: "a / b = []/[]" and the reverse "a/b = [] / []". Control a and b together: a less than b first; a greater than b, a equal to b and a a multiple of b only as named cases. Remove the story type (duplicate of the word skill) and the improper-to-mixed type (duplicate of `fractions:improper_mixed`).

**frac_as_div_word (merge) and frac_as_division (fix).** One share-story skill with a pictures option. Use the `frac_as_div_word` generator (three types, measurement contexts, control of a against b) as the body and the sharing picture as the scaffold. Answer line needs the unit word ("__ of a pizza").

**mult_frac_frac (fix).** Delete the legend line that prints the product. Draw the two shadings as two hatch directions so the overlap reads in black and white, or leave the square blank for the pupil to shade. Unit x unit first.

**div_unit_fraction (split).** Two directions are two procedures with different pictures and different answer types (whole number against unit fraction). Remove the "Count all pieces" line. Wholes from 2. Print bars need outline segments with readable labels.

**mult_scaling (fix).** Core is sound and is the right home for the sort page (bigger / smaller / the same is a real classification). Seed the "equal" case. Shorten the stem: "5/2 x 13 is [] than 13" with three check boxes.

**frac_mult_word (split).** Variants by schema: equal groups (fraction x whole); area or "part of a part" (fraction x fraction); how many pieces (whole / unit fraction). One schema per set; the mixed set is what `frac_word_mixed` is for. Print fractions in lowest terms inside stories.

**frac_word_mixed (fix).** Set grade to 5 (it serves 5.NF content). It is the natural decide-only page ("Which operation? Check a box. Do not solve."). Remove `schema-story`: a mixed pool cannot fill a one-schema page.

**mixed_fraction_ops (fix).** Restrict the pool to the bare computation skills so the cells share a footprint, or let the Mixed practice page role replace it. Inherits every member's fixes.

**estimate_frac_ops (redo).** Generator bug: when the first value is smaller, `n2` is re-rolled but the benchmark uses a different random value (`actualVal2`, L4995), so the key can disagree with the printed fraction and can be negative. Keys are decimals while options are fractions. Rebuild: fractions chosen clearly near 0, 1/2 or 1 (never 1/4 or 3/4); first fraction at least as large for subtraction; item = mark on a 0 to 1 line, circle the benchmark, write the estimate (the print form today); screen mirrors that production item instead of four options. This is also the home for the "sums greater than 1" sorts removed from the computing skills.

## New skills needed

| Proposed id | Level | What | Ladder step |
|---|---|---|---|
| `sub_frac_from_whole` | 4 | 1 - a/b, n - a/b, n - mixed number | FO-A 7, FO-B 11 |
| `add_tenths_hundredths` | 4 | a/10 + b/100, answer over 100 (from `frac_10_100_nv` type 3) | FO-G 3 |
| `frac_word_unlike` (or option `denominators: unlike` on `frac_word_problems`) | 5 | add / subtract stories with unlike denominators | FO-C 16 |
| `mult_mixed_numbers` | 5 | mixed x whole, mixed x fraction | FO-D 10 |
| `frac_area_rect` | 5 | area of a rectangle with fraction sides, tiled square | FO-D, after step 7 |
| `frac_rule_discriminate` | 5 | multiply rule against add rule, two rule strips (FO-08) | FO-D, after step 8 |

Not new ids, but new members: the FO-02 "Can you add these yet?" page is the `decision` member of `add_frac_unlike`; "Between which two whole numbers?" is an option on `frac_as_div_nv`. New ids are appended to the end of the category so share-code positions do not move.

## Questions research must answer (no reference file exists for this family)

1. Do MathWorksheets4Kids and IXL separate "sum within 1" from "sum past 1" for like denominators, and which comes with pictures?
2. Mixed numbers: is the first layout horizontal or stacked vertically, and is the first method wholes-and-parts or improper fractions?
3. Unlike denominators: which denominator pairs open the sequence, and which method for the common denominator is shown (list multiples, multiply the denominators, other)?
4. Fraction x whole: circles, bars or number-line hops as the first model?
5. Dividing with unit fractions: bar or number line; does any Level 5 source show invert-and-multiply?
6. Word problems: which schemas and contexts appear, and how long are the sentences?
7. Estimation: which benchmark set, which response format, and how are 1/4 and 3/4 handled?
8. Answer conventions: mixed or improper accepted; slash or stacked in print. (Simplest form is settled: any equivalent is accepted unless the instruction asks for simplest form — owner ruling 2026-09-19, question 1 below. Research only needs to say how the sites word that instruction.)

## Questions for the owner

1. **RULED (owner, 2026-09-19): any equivalent answer is accepted unless the instruction asks for simplest form.** CCSS does not require simplest form, so the default check accepts every equivalent. "Write the answer in simplest form" is its own step with its own instruction string (`simplest-form`, `PEDAGOGY_STANDARD.md` P-LG-15), and that step is the only place the check is strict. The 'simplify' variants that do not differ from 'straight' are deleted, and the hints and stems that say "Simplify" on an unconstrained item are rewritten.
2. **One strategy for mixed numbers.** Wholes-and-parts with regrouping, or convert to improper fractions? Recommendation: wholes-and-parts. It matches the "regroup" language, the FO-03 template (whole box beside a fraction frame) and the decide / notate steps. Improper conversion can be a separate later ladder.
3. **RULED (owner, 2026-09-19): merge the twins.** 15 picture / no-picture pairs, 3 plain word pairs and `frac_as_div_word` become aliases with options `model: none` or `pictures: false`; the picture is a scaffold level, and the ladders above depend on it. Old ids stay in place for share codes, and any easy / medium / hard trio in this family merges the same way behind a practice level (P-AT-9).
4. **What "Max Number" means for fractions.** No skill reads `state.range`. Recommendation: `range` limits the whole-number parts and whole-number factors only (default small: wholes to 5), and a new family option "denominators" chooses the set: 2, 4, 8 / 2, 3, 4, 6 / 2, 3, 4, 5, 6, 8, 10, 12 / with 100. 7, 9 and 11 leave the default set.
5. **Common denominator method.** Recommendation: list multiples and circle the first shared one, inside the FO-04 frame; do not teach "multiply the denominators" as the default because it breaks on pairs such as 4 and 6.
6. **Side variants.** Recommendation: remove the multi-select and drag-to-bins variants from every computing generator. Their content moves to Error analysis, True or False?, the sort page of `estimate_frac_ops` and `mult_scaling`, and the decide pages.
7. **`frac_word_mixed` grade.** It is tagged 4 and serves Level 5 multiplication and division stories. Recommendation: set it to 5, or restrict its pool by the grade filter in use.
