# Detailed lesson 3a (g3-oa5-mult-properties): independent critic, round 2

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `e7ef284d`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I graded the committed pack only: 23 PNGs, `pack.html` and SELF-CHECK
(43 / 43). The working-tree edits to `g3-oa9-mult-table-patterns.js` and `roles/lesson.js` belong to another lane and were
not graded. No browser was run.

What I checked:
- I read all 23 PNGs and re-multiplied every fact, product and key, including T2 / T5 / T6.
- I counted the rows and columns of every drawn array and its turn. All are right, and each turn really is c × r:
  - chart: 3 rows of 2 turned to 2 rows of 3;
  - Guided: 3 × 4 turned to 4 rows of 3, and 4 × 5 turned to 5 rows of 4;
  - P4-1: 2 × 5 turned to 5 rows of 2, 2 × 4 turned to 4 rows of 2, 4 × 4 (a square), and 5 × 3 turned to 3 rows of 5;
  - P0: f is 5 rows of 5, g is 2 rows of 2.
- I listed every unordered pair in the pack against the r1 ruling (one item = one {a, b}). All 31 are distinct:
  - chart {2,3}; Guided {3,4}, {4,5}; Check Question {3,6};
  - spaced retrieval {5,8}, {2,10}, {5,10};
  - P0 {2,7}, {2,9}, {2,8}, {2,6}, {5,5}, {2,2};
  - P4-1 {2,5}, {2,4}, {4,4}, {3,5};
  - P4-2 {7,9}, {3,8}, {4,7}, {4,9}, {6,9}, {4,8}, {8,9}, {6,8}, {7,7}, {5,7};
  - P5 {5,6}; exit {3,9}, {6,7}, {5,9}.
- I ran a search script on LR-6 near twins for × (scratchpad, not committed). Results below.

## Verdict: FAIL (2 of 23 pages have a criterion below 8)

Lowest score per criterion: **C1 8 · C2 8 · C3 7 · C4 8.**

All seven r1 defects are fixed. Every r1 nit is fixed except one gate request (m3). The teaching is now sound:
- every Practice 1 row-1 item really turns;
- the three-box response is modelled (T4 step 10) and guided (traced first factor) before Practice 1, which then changes
  only the fade;
- step 5 is printed on the chart and in the Steps panel;
- the exit slip measures the property;
- the word problem asks for the turn.

The one remaining defect is in the frame of the anchor chart's new step-5 band. It appears on the chart and on the chart's
key, so it fails two pages.

## r1 defect status

| r1 | Status | Evidence |
|---|---|---|
| D1 squares in P4-1 row 1 | **Fixed** | Row 1 is a 2 × 5 and b 2 × 4, both non-square. The last row is c 4 × 4 (the only square) and d 5 × 3. T6 row 1 reads "5, 2, 10 · 4, 2, 8"; the last row reads "4, 4, 16 · 3, 5, 15" ★★★. T5 §8 names 16 and 15. The gate rule I asked for in r1 was not added (m3). |
| D2 two new things P3 → P4-1 | **Fixed** | T4 step 10 writes three boxes under 3 × 2 = 6 and fills them. Guided cell 2 is "⁵ × ☐ = ☐" with the first factor traced. Practice 1 is the same response with the trace gone. |
| D3 Critical Atom missing | **Fixed** | The chart has a ⑤ band ("Check: same product. Still 6. No recount."). The P3 Steps panel has 5 rows with the check icon, matching T2's 5 routine rows. |
| D4 exit cannot measure | **Fixed** | a is 9 × 3 = 27 with no picture, "☐ × ☐ = ☐". b is 6 × 7 → 7 × 6 = ☐. c is 9 × 5 → 5 × ☐ = 45, non-square with distinct factors. The Say line is generic ("Same two numbers, same product."). |
| D5 word problem off-skill | **Fixed** | 5 rows of 6, turned to 6 rows: "How many in each row now?" (5). The page has two equation lines and a Say frame with both facts ("5 times 6 equals 6 times ___"). 5 × 6 is reachable by the P0 count by 5. Rows of 6 slightly exceed the ≤ 5 counter rule if drawn as given (m4). |
| D6 prerequisites return | **Fixed** | No P0 pair returns in either order. `factId` makes the E24 key the unordered pair, and the `×` / `x` mismatch is gone. |
| D7 atoms ≠ items | **Fixed** | T2 atoms are "Count by 5", "Recall × 2 facts" and "Array fact". T6 routes them to 2.NBT.A.2, 3.OA.C.7 and 2.OA.C.4. The P0 instruction is "Write the rows, the number in each row and the total." |
| n1 | Fixed | P0 instruction matches the cell. |
| n2 | Fixed | The first factors are now 3, 3, 4, 3 (chart, Guided, Check Question). |
| n3 | Fixed | T5 §7 reads "A: A new product". |
| n4 | Fixed | T6 reads "row 1". |
| n5 | Fixed | P4-1 reads "Look at the turned array. Write the new fact." |
| n6 | Fixed | Band B is 3-digit (877, 305, 544 / 565, 103). |
| n7 | Fixed | The T6 exit rows are the four real errors: 36, 9-3-27, 45 and 13. |

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects / nits |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | m6 |
| T2 Teacher 2 | 9 | 9 | 9 | 9 | |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 9 | 9 | 9 | |
| T4 Teacher 4 | 9 | 9 | 9 | 9 | |
| T5 Teacher 5 | 9 | 9 | 9 | 9 | |
| P0 Prerequisite | 9 | 8 | 9 | 9 | |
| P1 Number sense | 9 | 8 | 9 | 9 | |
| P2 Anchor chart | 9 | 9 | **7** | 8 | D1 |
| P3 Lesson 1 | 9 | 9 | 9 | 9 | m5 |
| P4-1 Practice 1 | 9 | 8 | 8 | 9 | m1, m3 |
| P4-2 Practice 2 | 9 | 8 | 9 | 9 | m1, m2 |
| P5 Word problem | 8 | 8 | 9 | 9 | m4 |
| P6 Exit slip | 9 | 9 | 8 | 9 | m1 |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 9 | **7** | 8 | D1 (mirrors) |
| P3 key | 9 | 9 | 9 | 9 | |
| P4-1 key | 9 | 8 | 8 | 9 | |
| P4-2 key | 9 | 8 | 9 | 9 | |
| P5 key | 9 | 8 | 9 | 9 | m7 |
| P6 key | 9 | 9 | 8 | 9 | |
| T6 Answer Key | 9 | 9 | 9 | 9 | m7 |

## Defects (each one causes a score below 8)

**D1. P2 anchor chart (and its key): the new step-5 band breaks the panel grid** (RUBRIC C3 "cells equal in size … in a
regular grid"; WORKSHEET_DESIGN_STANDARD cell geometry and stroke widths).
- The rule under panel ③ is about twice the panel stroke, and it stops at the column line.
- Panel ④ has no bottom rule at all. It runs straight into the ⑤ band, so on the right half "Write the new fact: 2 × 3 = 6."
  and "Still 6. No recount." read as one box.
- Panel ④ is about 6 mm taller than panel ③: its caption sits lower than ③'s. The bottom row of the 2 × 2 grid is no
  longer equal.
- On the one poster the whole I Do is taught from, this reads as unfinished. The step-5 band is the r1 D3 fix, so it is
  the most looked-at line on the page.
- **Fix:**
  - Give panels ③ and ④ one equal height.
  - Close the grid with one full-width rule at the panel stroke above the ⑤ band, as already drawn above the Say band.
  - Drop the extra-weight rule under ③.
  - Re-render P2 and P2-key, and check that E12 measures the chart's panels as a grid.

## Nits (do not by themselves block)

**m1. LR-6 near twins for × are not checked, and SELF-CHECK says they are.**
- E24b runs its near-twin test only when both items are + or − (`A.op === B.op` on the parsed + / − forms). Its "no near
  twins on any page" line therefore says nothing about this pack.
- Read as V22 words it ("numbers each within 2 of the other's"), the pack has many near twins: P4-2 b 8 × 3 / f 8 × 4,
  c 4 × 7 / d 4 × 9, a 7 × 9 / g 8 × 9, i 7 × 7 / j 7 × 5; P4-1 a 2 × 5 / b 2 × 4; exit a 9 × 3 / c 9 × 5.
- My search shows the literal rule cannot be met for a 10-item × page:
  - factors 2–9, the pack's other pairs excluded, distinct products;
  - at most 5 items under the either-order rule;
  - at most 8 under the narrowed shared-factor rule used for + in lesson g1-oa1.
- The ×-page rule needs the lead's ruling. I propose the + analogue: no first factor twice in one grid row, and never three
  running.
- Under that rule, P4-2 row 2 (c 4 × 7, d 4 × 9) and P4-1 row 1 (a 2 × 5, b 2 × 4) fail. P4-1 row 1 is also two "2 rows of
  n" shapes side by side.
- A fix that costs nothing: P4-1 row 1 becomes 2 × 4 and 3 × 5, and the last row becomes 4 × 4 and 5 rows of 2. The pictured
  ≤ 5 × 5 non-squares are all used, so this is a swap, not a new pair.
- Make the self-check line state what it actually tested.

**m2.** P4-2 uses factors to 9 (8 × 9, 7 × 9). Pupils answer from the given fact, and recall is not needed, so this is
fine. Still, a Grade 3 pupil seeing "8 × 9 = 72" is meeting a fact well past this term's × 2, 5, 10. It is acceptable
because the page tests the property, not recall.

**m3.** r1 asked for "a square only on the last row, at most one per page" as a gate. It is not in
`ws-detailed-lesson.cjs`. `arrP1` still admits `arrBigSquare` in any row, so the correct deal is a property of this seed,
not a guarantee.

**m4.** P5 "Draw it": 5 rows of 6 is a 6-wide row, past the pack's rows-of-≤ 5 counters (E27). The pupil can draw the turned
6 rows of 5 instead, so this does not block. A ≤ 5 story ({3,5} and {4,5} are used, so it would need re-dealing) or the
note "Draw the turned tray" would remove it.

**m5.** The P3 Vocabulary pictures (2 rows of 3, and its turn to 3 rows of 2) are the chart's {2,3} again. They are not
items, so LR-5 is not broken, but a fresh pair would keep the chart example off pupil pages, as T1's rule implies.

**m6.** T1 Materials says "12 counters on a tray". Guided cell 2 is 4 × 5 = 20, and the T4 Feedback move is "turn the tray
again". Say 20 counters.

**m7.** T6 "Answers at a glance" for P5 lists only the two facts. The asked answer "5 (in each row)" and the Say blank (5)
appear only under Accepted answers. Add "5 in each row" to the glance row. Lesson 1 (passed) has the same pattern, so this
is minor.

## To pass round 3

- Fix D1 and re-render P2 and its key.
- Recommended, in the same re-deal: the P4-1 row swap in m1, which costs nothing.
- m1 needs a lead ruling on the × near-twin rule before it is gated.
