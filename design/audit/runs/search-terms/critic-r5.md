# Critic round 5: Search terms for every skill (lane a21ec3ef403026c80, head 05e4a30)

Independent critic, 2026-10-09. I read and tested only; I did not edit any code.

**Verdict: FAIL.** Coverage **9**, Precision **8**, Ranking **9**, No regression (speed, UI, console, merge) **7**.
A pass needs 8 or more on all four.

The r4 fixes are real:
- U-B: the student box's "Showing results for …" line is now the dropdown's first row. It is the topmost element at
  1366×768, 1280×720 and 1366×650.
- U-C: the Sets notice no longer covers "Level".
- The view-change hide now works.
- corner, decimals ↔ fractions and commutative property are fixed.
- The new visibility gate fails under all three of my mutations.

The round still fails on the same goal as r4: a pupil must be able to read what their word was corrected to. Two cases
break it, and neither is caught by the gate:

- **U-F (blocking): in the Skills Navigator the corrected word is cut off at Chromebook size.** At 1280×720 and at
  1366×650 the Navigator box is 160 px wide, and the notice's `max-width` is the box width with `text-overflow:
  ellipsis`. So every correction reads "Showing results for p…" or "Showing results for ti…": 5 of 5 typos are
  truncated at both sizes. At 1366×768, 3 of 5 are truncated (subtraction, multiplication, probability). The Navigator
  is the pupil-side view. The notice says a correction happened, but not what the word became.
- **U-D: the student box loses its notice when the list rebuilds without typing.** If you click "+" on a result, or
  click away and then back into the box, `handleSkillSearch` rewrites `#skillSearchResults.innerHTML` (through `onfocus`
  → `showSearchResults`, and through `addToSkillQueue`). That deletes the notice row. The list still shows the
  corrected results for "tme", but nothing explains them. Typing one more letter brings it back.

## What I ran

| Check | Result |
|---|---|
| `node --input-type=module --check` search-notice.js, search-terms.js | clean |
| `ws-search-terms` | OK: 232/232 queries, 149 primary queries rank 1 in the list and the grouped pickers, 592 skills |
| `ws-search-order` | OK (18 queries × 2 views, 6 notices, the new visibility block at 1366×650 and 1280×720) |
| `ws-boot-smoke`, `ws-teacher-library` | OK, OK |
| `ws-teacher-shell` | FAIL under load (the known Andika woff2 font-abort); **OK** rerun alone (`--exclusive`) |
| Merge into `claude/sweet-newton-c8wrv1` (now f9da3c1) | `git merge-tree` is clean. Main gained only an asset stamp and refreshed screenshots since 6055aa1. |
| Gate mutation, served with `MQ_ROOT` from scratch copies (the tree was not touched) | m1: student notice left outside the dropdown (the r4 behaviour) → **FAIL** "HIDDEN under DIV" at both sizes. m2: no line reserved in Sets → **FAIL** "COVERS the Level label" (1366×650). m3: dropdown `z-index:5000` plus a cover over its first 60 px → **FAIL** "HIDDEN under mutCover". The gate is real. |
| Node diff r4 (abd70a4) → r5, top 3 over **1,172 queries** (every SKILL_TERMS term, every PRIMARY_SKILLS phrase and every live label from both rounds) | 12 top-1 changes, **0 top-2/3 changes elsewhere, 0 queries lost**. All 12 are the intended fixes (list below). |
| Puppeteer, real keystrokes, all six boxes × {1366×768, 1280×720, 1366×650} × {tme, perimter}: elementFromPoint at the notice's left, centre and right, with pointer-events on | 36/36 topmost and in view; screenshots of all six boxes at each size in the scratchpad (`r5/shots/`) |
| Same boxes × 5 typos: `scrollWidth > clientWidth` on the notice | Navigator truncated (U-F); the other five boxes are never truncated |
| Console errors | 0 |
| Speed | 1–30 ms per query in Node (most under 5); no lag in any box |

## r4 defects, re-proved

| Item | Result |
|---|---|
| **U-B** student notice hidden by the dropdown | **Fixed.** The notice is `skillSearchResults`'s first child: "Showing results for **perimeter**" as a 36 px row above "Geometry & Measurement". Topmost at all three sizes. The Chromebook-fit compact bar is scoped to `html.mq-play` (play views only), so it does not apply on the home screen. At 1366×650 the home box sits at y ≈ 507 and the notice row is in view at y 528. New issue: U-D, above. |
| **U-C** Sets notice over "Level" | **Fixed.** No overlap at any size: notice bottom 309, Level top 327 at 1366×768; 273 / 305 at 1280×720. Minor: the line is reserved only while a correction shows, so the Level row and the list below jump 24 px down when a typo appears and back up when it is fixed (U-E, cosmetic). |
| View-change hide | **Fixed.** After a real "← Back" click in the Navigator, `soSearchInputFix.hidden = true`. After a real "Skills library" sidebar click from the print picker, `tvPick0Fix.hidden = true`. No notice is left un-hidden. |
| Print picker overlap | Unchanged and cosmetic: the line sits on the top border of the results list and is fully readable. |
| R-D corner | **Fixed**: Count Corners on a Shape, then Count Sides & Vertices ("corner", "corners", "count corners"). |
| R-E decimals to fractions | **Fixed**: d_to_f first for all five "decimal(s) to fraction(s)" forms, and f_to_d first for the reverse. |
| C-F commutative property | **Fixed**: commutative, commutative property, turnaround facts → Multiplication Properties. See P-E for associative. |
| Owner ruling: skip counting | count_by_tables, skip_count_line, skip_count_grid (Node and all six boxes) |

## New precision and ranking notes (minor, not blocking)

- **P-E (minor):** "associative" and "associative property" now lead to Multiplication Properties. That skill deals
  commutative, distributive, identity and zero (`_mpTypes` in gen-operations.js), never associative. A skill's name
  and content are its declaration, so the honest answer is 0 results, or a skill that really deals it. (The r4 report asked for "associative" to reach this skill, but the generator does not deal associative items,
  so that request was wrong.) Similarly,
  "commutative addition", "associative property of addition" and "turnaround facts addition" return only the
  multiplication skill, while Addition Fact Families (1.OA.B.3) teaches addition turnarounds.
- **R-F (minor):** "distributive property" puts Multiplication Properties above *Distributive Property of
  Expressions*, whose own label contains both words. The skill does deal distributive items (3.OA.5), so this is
  defensible for grade 3, but the label match should stay first or at least tie.
- **C-G (minor):** "zero property" and "identity property" return 0, although Multiplication Properties deals both.
  "identity property" is also corrected to "identify property" and then finds nothing, so the correction notice
  explains a dead end. That one predates r5.

## 40 fresh queries (none used in r1–r4)

38 of the 39 answerable queries put a right skill first:
ten frame, count objects to 10, one more one less, doubles facts, make 10, missing addend, number bonds to 20 (only a
within-10 bonds skill exists), tally marks, coins, dollars and cents, measure length with a ruler, inches, centimetres,
volume of a cube, cubic units, line of symmetry, quadrilaterals, polygon names, 3d shapes, faces edges vertices,
perpendicular lines, protractor, coordinate plane, ordered pairs, multiply by 10, long multiplication, mixed numbers,
add fractions with like denominators, unit fractions, compare decimals, percent of a number, ratio, unit rate,
negative numbers, absolute value, exponents (OoO Brackets & Exponents first, Level 7: Exponents second; acceptable),
expanded form, line plot.

1 query returns 0 results, which is honest because no skill exists: lattice multiplication.

1 miss (minor, R-G): "multi digit multiplication" puts *Find the Missing Digit (Multiplication)* first, because of the
word "digit". Basic Multiplication, the multi-digit column skill, comes second.

## Scores

| Criterion | Score | Why |
|---|---|---|
| Coverage | **9** | 38/39 fresh queries are right first; commutative and turnaround now reach a skill. Left: zero / identity property, bonds to 100. |
| Precision | **8** | No real word is rewritten, nothing was lost in the 1,172-query diff, and 592/592 self-labels hold. New: associative points to a skill that never deals it (P-E), and addition-property queries land on a multiplication-only skill. |
| Ranking | **9** | All 12 top-1 changes are intended. Minor: distributive property (R-F), multi digit multiplication (R-G). |
| No regression (speed, UI, console, merge) | **7** | Fast, 0 console errors, clean merge, and no box hides its notice. However, the pupil Navigator cuts off the corrected word at both Chromebook sizes (U-F). The student box drops the notice after "+" or after refocusing (U-D). The gate checks that the notice is visible, but not that it can be read in full. |

## To pass

1. **U-F:** the whole notice must be readable at 1366×768, 1280×720 and 1366×650 in every box. Let it run wider than
   the box (for example, max-width up to its positioned container, or wrap onto a second line) instead of using an
   ellipsis at the box width. Add a gate check that `scrollWidth <= clientWidth` for long corrections such as
   "multiplcation" and "probabilty" at those sizes, in all six boxes.
2. **U-D:** re-apply the notice whenever the student list is rebuilt, for example by calling `updateSearchNotice(input)`
   at the end of `handleSkillSearch`, or on `focus` and after `addToSkillQueue`. Gate it: type "tme", click "+" on the
   first result and also blur and refocus, then the notice must still be the topmost first row.
3. Optional: give associative 0 results, or a skill that deals it (P-E); keep the "distributive property" label match
   first (R-F); add "zero property" / "identity property" terms and stop correcting "identity" (C-G); reserve the Sets
   line permanently or animate it (U-E).
