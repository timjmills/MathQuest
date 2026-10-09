# Critic round 3: Search terms for every skill (lane a21ec3ef403026c80, head fd7eeab)

Independent critic, 2026-10-09. I read and tested only; I did not edit any code.

**Verdict: FAIL.** Coverage scores 8. Precision scores **6**, Ranking **7** and No regression **6**. A pass needs 8 or
more on all four.

Most round 2 defects are fixed. Typo correction no longer rewrites tile, compass, east, days, bead, root or full. A
"Showing results for …" line appears in all six boxes when a word is corrected. Tiling, analogue, position and
direction, aera and part whole model all work, and skip counting still puts Count by 1–12 first. There are no console
errors.

The round fails for two reasons. First, the new "divide by N" rule (the r2 P-B fix) breaks every division search that
names a digit count. Six skills can no longer be found by typing their own label. Second, in the three grouped pickers
"divide by 2" puts Multiply and Divide by 10, 100, 1,000 second, so Division Facts is not second as the brief requires.

## What I ran

| Check | Result |
|---|---|
| `node tests/scripts/ws-search-terms.cjs` | OK: 592 skills, 232/232 queries, 86/86 rank-1, 130 primary queries, 10 expected-empty, 11 correction checks |
| `ws-search-order` | OK (18 queries × 2 views, 6 correction notices) |
| `ws-boot-smoke`, `ws-teacher-library` | OK, OK |
| `node --input-type=module --check` on init.js, search-notice.js, search-terms.js, skill-finder.js | clean |
| `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` (main 457f0f0) | clean, no conflicts; `ws-search-terms` passes on the merged tree too |
| Puppeteer at **1366×768**: 27 queries typed with real keystrokes into **all six** boxes (student, Skills Navigator, Quiz builder, Teacher library, Teacher sets picker, print "Add a skill") | results below; **0 console errors** |
| Node probe through `findSkills`: about 300 correctly spelt words, 4,243 generated one-slip misspellings, 66 fresh queries, and a self-search of every skill's exact label, compared against r2 (45013b3) | below |
| Speed | 1–22 ms per query in Node; typing in the six boxes shows no lag |

## Round 2 defects, re-proved in the six real boxes (1366×768)

| r2 | Query | Now, all six boxes | Status |
|---|---|---|---|
| P-A | tile / tiles | area_unit_squares, then area | fixed |
| P-A | compass, east, west, north, days, bead, root, full | 0 results, no notice | fixed |
| P-A | tme / aera / perimter | time_hour / area / perimeter, with "Showing results for time / area / perimeter" in every box | fixed |
| P-B | divide by 2, divided by 2, ÷2, ÷ 2 | Halving first everywhere. **Second:** Division Facts in the student list, Library and print picker; **Multiply and Divide by 10, 100, 1,000** in the Navigator, Quiz builder and Sets picker (Division Facts third) | **partly fixed (R-C)** |
| P-C | short multiplication | multiply, then missing digit, then placeholder zero: Area Model is gone | fixed |
| P-C | 3*4 | mult_facts first (Area Model 2×2 and 2×3 is still second) | fixed |
| C-A | analogue clock | time_analog_digital | fixed |
| C-C | position and direction | shape_positions | fixed |
| C-C | aera | area, with a notice | fixed |
| C-C | compass directions | still 0 results ("compass" is a never-rewrite word, and both words must match) | open, minor |
| R-A | part whole model | number_bonds | fixed |
| R-B | grade 4 fractions | Circle the Equivalent Fractions (a Grade 4 teaching skill); no vocabulary skill | fixed |
| R-B | kindergarten counting | count_objects | fixed |
| owner | skip counting | count_by_tables, then skip_count_line, then skip_count_grid | holds |

## Scores

| Criterion | Score | Why |
|---|---|---|
| Coverage | **8** | 37 of my 40 graded fresh queries reach the right skill. CCSS codes 4.NBT.5, 1.OA.6, K.OA.5, 6.EE.2 and 3.NF.2 all work, and so do UK words (block diagram, pounds and pence, dienes, chunking, inverse operations). Gaps: C-D and C-E. |
| Precision | **6** | The r2 rewrite problem is fixed, but the new divide-by rule removes the right skills from division searches (P-D). That is worse than the r2 defect it fixes, because these are ordinary teacher phrasings and exact skill labels. |
| Ranking | **7** | 37 of 40 fresh queries put the right skill first. "divide by 2" has the wrong second card in 3 of 6 boxes (R-C). |
| No regression (speed, UI, console, merge) | **6** | It is fast, there are 0 console errors and the merge is clean. However, 6 skills that r2 found by their own label now return nothing (P-D). The notice also shifts the layout in two boxes (U-A). |

## Defects

### Precision / regression (blocking)

- **P-D: the "divide by N" rule hides the division skills.** In `searchIndex` (`js/modules/search-terms.js`), the
  phrase rewrite `/(?:divide|divided|dividing|divides)(?: by)? (\d+)/ → 'divide by $1'` also fires on "divide **2 digit**…",
  "divide **3** digit…" and on the "÷" inside a label. Then `divNoise` sets `ok = false` for every skill whose label
  contains "N digit", "N divide" or "divide N". That drops exactly the skills the teacher asked for:

  | Query | r2 (45013b3) #1 | r3 (fd7eeab) |
  |---|---|---|
  | divide by 2 digit numbers | long_div_2digit | place_value_10x, div_remainders (long_div_2digit is gone) |
  | Divide by 2-Digit Numbers (the skill's own label) | long_div_2digit | long_div_2digit is gone |
  | divide by 2-digit | long_div_2digit | place_value_10x |
  | divide 2 digit by 1 digit | box_division_easy | place_value_10x (box and area model are gone) |
  | divide 3 digit by 1 digit | box_division_hard | **0 results** |
  | dividing 3 digit numbers | box_division_hard | **0 results** |
  | divide by 1 digit / ÷ 1 digit | box_division_easy | place_value_10x |
  | Box Method Division (2÷1 digit), (3÷1 digit) | box_division_easy / hard | **0 results** |
  | Area Model Division (2÷1 digit), (3÷1 digit) | area_model_div_2by1 / 3by1 | **0 results** |
  | Area of a Triangle (b×h÷2) | area_triangle | **0 results** |

  I confirmed this in the real boxes: "divide by 2 digit numbers" and "Box Method Division (2÷1 digit)" give the same
  wrong results, or none, in all six. A self-search of every skill's exact label finds **6 new misses** (box_division_easy,
  box_division_hard, area_model_div_2by1, area_model_div_3by1, long_div_2digit, area_triangle) on top of r2's 48.

  Fix:
  1. Apply the divisor rule only when the number is the divisor of a fact. It must be followed by the end of the query
     or a non-unit word. It must never apply when followed by "digit", "-digit", "digits" or "numbers", or when the
     query contains "÷" between two numbers ("2÷1").
  2. Demote, do not exclude: a label match on "N-digit" should lose points, not remove the skill.
  3. Add these as gate rows in `ws-search-terms` TOP1: divide by 2 digit numbers → long_div_2digit, divide 2 digit by 1
     digit → box_division_easy or area_model_div_2by1, divide 3 digit by 1 digit → box_division_hard or
     area_model_div_3by1. Also add an "every live label finds its own skill in the top 3" check, or at least a no-new-misses
     check against a pinned list.

### Ranking

- **R-C: "divide by 2" in the grouped pickers.** The Navigator, Quiz builder and Sets picker show Halving, then Multiply
  and Divide by 10, 100, 1,000, then Division Facts, for all four spellings (divide by 2 / divided by 2 / ÷2 / ÷ 2). The
  flat lists (student, Library, print) are right: Halving, then Division Facts. `place_value_10x` matches "divide" in its
  label and "2" from somewhere in its terms. The domain grouping then lifts it over div_facts because both sit in Number
  & Operations. Fix: `place_value_10x` should not match a bare "divide by 2" (its divisors are 10, 100 and 1,000). Also
  add a second-place check (div_facts in the first 2) to `ws-search-order` for these four queries.

### UI (minor)

- **U-A: the notice shifts the filter row.** `search-notice.js` inserts the `<p>` after the input's wrapper. In the
  Teacher library and the Quiz builder that wrapper is a flex row item, so "Showing results for time" appears as a new
  flex item. In the Library it pushes "All domains" onto a second row; in the Quiz builder it narrows the box. Every
  correction then makes the layout jump, and it jumps back when the typo is fixed. In the Skills Navigator the line sits
  outside the white card, on the page background. Fix: give the notice `flex-basis:100%` (or `order` plus `width:100%`)
  in flex rows, or place it under the box inside the same column.

### Coverage (minor, not blocking)

- **C-D: the "(No Pictures)" / "(No Visuals)" variants cannot be found by their label suffix.** "addition word problems
  no pictures", "equivalent fractions no visuals" and "no visuals" return 0. This was already present in r2 (48 labels).
  A teacher looking for the plain version cannot get to it by search. The fix is to stop "no" from killing the match, or
  to give these skills the terms "no pictures", "plain", "text only" and "no visuals".
- **C-E: small gaps:** vertex (vertices works), input output (function table works), clockwise / anticlockwise,
  midnight / noon (time_sense), 10 times bigger (place_value_10x), numicon, bonds to 100, quatre past (quarter past) and
  compass directions (C-C).
- Correction now visibly rewrites a few real words into vocabulary words: lost → lots, tie → time, pond → pound,
  sole → solve, may → many, seed → speed, spit → split, bride → bridge. The notice makes each of these honest, and none
  is a likely search, so this is not blocking. Adding them to `REAL_WORDS` would cost nothing.

## 40 fresh queries (none used in r1 or r2)

These 37 put a right skill first:
number bonds to 10, counting backwards, one more one less, hundreds tens ones, expanded form, estimate on a number line,
count money, pounds and pence, quarter past, quarter to, time to 5 minutes, 2d shapes, 3d shapes, lines of symmetry,
tally chart, block diagram, long multiplication, long division, short division (box division is the nearest skill),
common denominator, add fractions with different denominators, mixed numbers, percent of a number, ratio, negative
numbers, coordinates first quadrant, volume of a cube, 4.NBT.5, 1.OA.6, K.OA.5, 6.EE.2, 3.NF.2, devision facts (notice:
"division facts"), mulitply, hexgon, triangels, related facts.

These 3 missed: bonds to 100 (add_sub_10s only), 10 times bigger (0), numicon (0).

Short words: cm, kg, ml and % land on length, mass, capacity and percent. pi returns 0, which is honest: no skill
covers circles. All 20 r2 misspellings still land, and each correction now shows its notice. The owner's case holds in
all six boxes.

## To pass

1. Fix P-D: the divisor rule must not fire on "N digit", "N-digit", "N÷M" or a label, and it must demote rather than
   exclude. Add the gate rows and a label self-search check.
2. Fix R-C, so that Division Facts is second for divide by 2 / divided by 2 / ÷2 / ÷ 2 in all six boxes. Make
   `ws-search-order` check the second card.
3. Fix U-A, so the notice never moves a filter row.
4. Nice to have: C-D, C-E, and the extra `REAL_WORDS`.
