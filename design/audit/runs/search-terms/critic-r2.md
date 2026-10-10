# Critic round 2: Search terms for every skill (lane a21ec3ef403026c80, head 45013b3)

Independent critic, 2026-10-09. I read and tested only; I did not edit any code.

**Verdict: FAIL.** Coverage scores 8, Ranking 8 and No regression 9, but Precision scores **7**. A pass needs 8 or more on
all four.

Every round 1 defect is fixed in all six real search boxes. The owner's case ("skip counting" → Count by 1–12 first) holds
everywhere, and there are no console errors. The fail comes from the new typo correction. It rewrites correctly spelt
words that are not in the vocabulary to the nearest word that is, without telling the user. So "tile", "tiles",
"compass", "east" and "days" now return confident wrong results. Round 1's "divide by 2" fix is a phrase pin, so close
variants ("divided by 2", "÷2") still lead with the old wrong skills.

## What I ran

| Check | Result |
|---|---|
| `node tests/scripts/ws-search-terms.cjs` | OK: 592 skills, 232/232 queries, 62/62 rank-1, 127 primary queries rank 1 (1.3 s) |
| `ws-search-order` (new) | OK, 13 queries × 2 views |
| `ws-boot-smoke`, `ws-teacher-library` | OK, OK |
| `node --input-type=module --check` on the 9 changed JS files | clean |
| `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` | clean (main c91cc8b is already an ancestor) |
| Node probe through `findSkills`: the r1 defects, 40 fresh queries, about 200 correctly spelt words, 25 misspellings | below |
| Puppeteer on the real DOM: 32 queries in **all six** boxes (student, Skills Navigator, Quiz builder, Teacher library, Teacher sets picker, print "Add a skill" picker) | the boxes agree with `findSkills` (the grouped pickers reorder by domain, as designed); **0 console errors** |
| Cold start: "3.OA.7" typed in the Teacher library 0.5 s after boot | mult_facts first, both before and after the curriculum terms load (N2 fixed) |
| Speed | 9–36 ms per query in the Navigator and Quiz builder; 12–83 ms in the library (render included); 1–17 ms in Node |

## Round 1 defects, re-proved in the six real boxes

| r1 | Query | Now #1 (all boxes unless noted) | Status |
|---|---|---|---|
| P1 | skip counting | count_by_tables, then skip_count_line, skip_count_grid; mult_zeros is gone | fixed |
| P1 | factors and multiples / prime / multiples | factors_identify / prime_composite / number_theory:multiples | fixed |
| P2 | column subtraction | sub_100_regroup; no Addition skill in the first 3 | fixed |
| P3 | divide by 2 | halve | fixed (by a pin; see P-B) |
| P3 | round to the nearest hundred | nearest_100 | fixed |
| P3 | number bonds to 20 | number_bonds | fixed |
| P3 | less | more_less_10 | fixed |
| P3 | square numbers | exponents_simple | fixed |
| P3 | counting to 10 | count_objects | fixed |
| P3 | multiply by 1 digit / multiplication 2 digit by 1 digit | multiply | fixed |
| C1 | short multiplication / standard algorithm multiplication / column multiplication / formal written method | multiply | fixed (see P-C) |
| C2 | subitizing / subitising | count_objects | fixed |
| C3 | `*` | mult_facts (the student box needs 2 characters, which is existing behaviour) | fixed |
| C4 | compound shapes | composite_shapes | fixed |
| C5 | making change / decimals / percentages | money_change / decimal_nl_drag / percent_visual | fixed |
| R1 | subtracton / rouding / perimter / telling tme | sub_facts / nearest_10 / perimeter / time_hour | fixed |
| N1 | unused imports | none left | fixed |
| N2 | curriculum terms load late | the index is built in `warmSkillSearch`, and every teacher screen re-runs its search | fixed |
| N3 | junk `MISSPELLINGS` keys | none left | fixed |
| N4 | no browser check of the grouped order | `ws-search-order` added | fixed |

## Scores

| Criterion | Score | Why |
|---|---|---|
| Coverage | **8** | 37 of the 40 fresh queries reach the right skill. CCSS and EE codes work (3.OA.7, 2.NBT.5, K.CC.4, 5.NF.1, EE.3.OA.1, M.EE.3.OA.1, 3.MD.7). UK/US pairs, years, reception and kindergarten all work. Gaps: C-A to C-C. |
| Precision | **7** | The typo rewrite turns about 10 of the 200 correctly spelt words I tried into a different word (P-A). Close variants of "divide by 2" still lead with 2-digit division (P-B). |
| Ranking (40 fresh queries) | **8** | 36 of 40 put the right skill first, and ties now resolve sensibly. Misses: R-A, R-B. |
| No regression (speed, UI, console, merge) | **9** | Fast, 0 console errors in all six boxes, a clean merge, and a new browser gate. |

## Defects

### Precision

- **P-A: the typo rewrite changes correctly spelt words** (`searchIndex` in `js/modules/search-terms.js`, the `fuzz` block).
  When a word is missing from the vocabulary, the search swaps in the nearest vocabulary word. The swap is silent:
  nothing on screen says "showing results for …". These are realistic teacher words:

  | Typed | Rewritten to (by the results) | #1 in every box | What the teacher wanted |
  |---|---|---|---|
  | tile | time | Time to the Hour (107 hits) | area by tiling (CCSS 3.MD.7a says "by tiling it") |
  | tiles | times | Multiplication Facts | area_unit_squares |
  | compass | compare | Compare Attributes (55 hits) | position and direction (no skill: 0 results would be honest) |
  | east / west / north | past / rest / worth | Time to Half Hour / Number Families / Value of a Digit | position and direction |
  | days | ways | Number Bonds within 10 | calendar (no skill) |
  | bead | read | Reading a Ruler | bead strings or rekenrek (no skill) |
  | root | foot | Order Objects by Length | square root (no skill) |
  | full | fill | Number Sequence: Fill Missing | capacity |

  "tiling" itself returns 0 results, so an area query is lost both ways. Fix:
  1. Rewrite only when the nearest word shares the first letter **and** the edit is a likely keyboard slip (one dropped,
     doubled or swapped letter).
  2. Otherwise keep the fuzzy word as a low-score match, not a rewrite.
  3. Keep a small `REAL_WORDS` set (tile, tiles, tiling, compass, north, east, south, west, days, week, month, root,
     full, empty, bead) that is never rewritten.
  4. When a rewrite does happen, show it in the result header ("Showing results for *time*").
  5. Give `area_perimeter:area_unit_squares` and `area` the terms tile, tiles, tiling, tiled.
  6. Add tile → area, compass → 0 hits or position, and days → no time_* skill as rank checks in `ws-search-terms`.
- **P-B: "divide by 2" is a pinned phrase, so the cause of r1 P3 is still there.** "divided by 2" and "÷2" give Box
  Method Division (2÷1 digit), then Area Model Division (2÷1 digit), then Divide by 2-Digit Numbers. Area of a Triangle
  (b×h÷2) is #4 and Halving #5, and Division Facts is not in the top 5 in any of the three queries. The "2" matches the
  "2" in "2÷1 digit" and "2-Digit". `labelPhrase` guards only the exact phrase "divide by 2". Fix: a bare number after
  "divide(d) by" / "÷" should not match the "N" in "N÷1 digit", "N-digit" or "b×h÷2". Also add div_facts to the expected
  top 3 for "divide by 2", "divided by 2" and "÷2".
- **P-C (minor): `column_mult` reaches the grid method.** Area Model (2×2 and 2×3) is #3 for "short multiplication",
  "standard algorithm multiplication" and "multiply by 1 digit". It is #1 for "3*4", ahead of Multiplication Facts. The
  area or grid model is not short or column multiplication: drop `area_model_mult_hard` from the `column_mult` rule.
  "3*4" should give mult_facts first (a fact-sized product).

### Coverage

- **C-A: "analogue" (the UK spelling) misses Analog and Digital Time.** "analog clock" puts `time_analog_digital` first.
  "analogue clock" does not have it in the top 5: Find the Clock leads, or Put Clocks in Order in the grouped pickers.
  "analogue" on its own gives Time to the Hour. Map analogue → analog in `ROOTS`/`MISSPELLINGS`, or add it to that skill's
  terms.
- **C-B: tiling and tile are missing** (see P-A).
- **C-C (minor):** "position and direction" (a WRM block title) and "compass directions" return 0, though
  `shapes_early:shape_positions` exists. "aera" (an easy transposition of "area") returns 0, because Levenshtein counts a
  swap as 2 edits.

### Ranking

- **R-A:** "part whole model" puts Tape Diagrams first and Number Bonds #3. In WRM and UK schools the part-whole model is
  the cherry diagram (number_bonds). Put number_bonds first, or tie it with tape_diagram.
- **R-B (minor):** "grade 4 fractions" and "kindergarten counting" put a Math Vocabulary skill first, because its label
  matches the phrase exactly. The `demote` of 0.4 does not offset the label bonus. A teacher wants the teaching skills
  first, so demote vocab more strongly whenever any other skill matches.

### 40 fresh queries (none used in r1)

These 36 put the right skill first:
3.OA.7, 2.NBT.5, K.CC.4, 5.NF.1, EE.3.OA.4 (0 results; correct, as no skill carries that EE), year 2 subtraction,
reception shapes, partitioning, place value year 3, greater than less than, odd and even, ten more ten less, doubles,
near doubles, fact family, inverse, missing number, bar model, number line addition, times tables 8, 8 times table,
divide by 10, grid method, bus stop method (box division is the nearest skill), remainders, simplify fractions, improper
fractions, fraction of an amount, unit fractions, decimal place value, tenths and hundredths, o'clock, 24 hour clock
(0 results; correct, as there is no skill), metres and centimetres, capacity, mass grams.

These 4 failed: grade 4 fractions, kindergarten counting (R-B), part whole model (R-A), analogue clock (C-A).

These misspellings all land correctly: fractoins, multipication, divsion, geomety, measurment, symetry, equivelent,
decimels, perimiter, nuber line, clok, mony, ods and evens, tims tables, placevalue, place valu, colum addition,
regroupping, nuber bonds, skip couting. Short words are safe: ten, odd, area, sum, net and mode are never rewritten.

## The builder's choices

- **"decimals" → decimal_nl_drag: agree.** It is the Grade 4 entry skill. There is no decimal place-value skill, and the
  four operation skills are Grade 5–6. compare_decimal (also Grade 4) would be equally defensible.
- **"less" → more_less_10: agree.** A pupil who types the single word "less" is most likely in the "1 less / 10 less"
  step. "less than" correctly goes to Compare Numbers, and "one less" to count_sequence or more_less_10.
- **"divide by 2" → halve: agree for the phrase, but not as done.** Halving is the right first card for a K–2 pupil.
  Division Facts should be #2, and the same order should hold for "divided by 2" and "÷2" (P-B). Pinning one phrase
  hides the cause.

## To pass

1. Fix P-A: guard the rewrite, keep the never-rewrite set, show a "showing results for" notice, and add the tile terms.
2. Fix P-B and C-A.
3. Add tile, tiles, compass, days, divided by 2, ÷2, analogue clock and 3*4 to the `TOP1` and `QUERIES` tables with
   their expected first skill, or with an expected 0 results.
4. Nice to have: R-A, R-B, P-C.
