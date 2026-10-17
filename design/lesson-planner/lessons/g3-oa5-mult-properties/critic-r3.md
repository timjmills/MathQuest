# Detailed lesson 3a (g3-oa5-mult-properties): independent critic, round 3

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `22c95411`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I graded the committed pack only: 23 PNGs, `pack.html` and SELF-CHECK
(43 / 43). No browser was run. I also re-graded the six lesson 1 pages that the generic chart-grid fix changed.

What I checked:
- I read all 23 PNGs.
- I re-multiplied every fact, product, key answer and T6 wrong-answer row.
- I counted every array and its turn. All are right:
  - chart: 3 rows of 2 turned to 2 rows of 3;
  - Guided: 3 × 4 turned to 4 rows of 3, and 4 × 5 turned to 5 rows of 4;
  - P4-1: a 3 × 5 turned to 5 rows of 3, b 2 × 4 turned to 4 rows of 2, c 4 × 4, d 5 × 2 turned to 2 rows of 5;
  - P0: f is 5 rows of 5, g is 2 rows of 2;
  - Vocabulary: a 3 × 3 array, a ringed row of 4, and 1 row of 3 turned to 3 rows of 1.
- I measured the chart's rules from the PNG pixels (at x = 200 and x = 700):
  - the panel rule (y 624), the new rule above the step-5 band (y 1083) and the column line all carry the same ink, about 290;
  - the rule above step 5 runs from the left border to the right border (x 51–856);
  - panels ③ and ④ both span y 624–1083.
- I read the E24b × / ÷ gate and the `edgeOnly` gate in `tests/scripts/ws-detailed-lesson.cjs` (lines 396–411), and
  `edgeOnlyLast: 'arrSquare'` in the lesson file.
- I listed every unordered pair in the pack. All 33 are distinct:
  - chart {2,3}; Guided {3,4}, {4,5}; Check Question {3,7};
  - spaced retrieval {5,8}, {2,10}, {5,10};
  - P0 {2,7}, {2,9}, {2,8}, {2,6}, {5,5}, {2,2};
  - P4-1 {3,5}, {2,4}, {4,4}, {2,5};
  - P4-2 {7,9}, {3,8}, {4,7}, {3,6}, {6,9}, {4,8}, {8,9}, {6,8}, {7,7}, {5,7};
  - P5 {5,6}; exit {3,9}, {6,7}, {5,9}.
  - Vocabulary {3,3} and {1,3} are pictures, not items.

## Verdict: PASS (every page ≥ 8 on every criterion)

Lowest score per criterion: **C1 8 · C2 8 · C3 8 · C4 9.**

- **r2 D1 is fixed.** The chart's 2 × 2 grid is now closed and regular: panels ③ and ④ are equal in height, and one
  full-width rule at panel weight sits above the ⑤ band. The extra-weight stub under ③ is gone. P2-key mirrors the page.
- **The m1 and m3 rulings are met and gated.**
  - m1: no first factor appears twice in a grid row on P4-1, P4-2 or P6, and E24b now tests it on all 17 × items.
  - m3: there is one square per Practice page, and it is on the ★★★ last row (P4-1 c 4 × 4, P4-2 i 7 × 7). The
    `edgeOnly` gate enforces this.

## r2 status

| r2 | Status | Evidence |
|---|---|---|
| D1 chart grid | **Fixed** | Panels ③ / ④ both end at y 1083. There is one full-width rule there at the panel stroke (darkness 290 vs 291 for the panel rule). The heavy rule now sits only above the Say band, as on gold charts. P2-key is the same. |
| m1 × near twins | **Fixed (ruling)** | The ruling is applied: P4-1 row 1 is 3 × 5 / 2 × 4, the recommended swap. P4-2 rows read 7/8, 4/6, 9/8, 8/6, 7/5. Exit a (9 × 3) and c (9 × 5) are in different grid rows. E24b's line now says what it tests. |
| m2 factors to 9 on P4-2 | Open (accepted) | The page tests the property, not recall. Not a defect. |
| m3 square only last row | **Fixed + gated** | `edgeOnlyLast: 'arrSquare'`. E24b reports "arrSquare only on the last row, at most one a page". |
| m4 P5 rows of 6 | Partly fixed | The Workspace now holds a labelled frame ("6 in each row", "5 rows") to draw in. The story is still 5 rows of 6, so free-drawn counters go past rows of 5. Still a nit. |
| m5 Vocabulary re-uses {2,3} | **Fixed** | The pictures are now 3 × 3, a ringed row of 4, and 1 × 3 → 3 × 1, with the labels shuffled for matching. The key's lines are right. |
| m6 counters | **Fixed** | T1 Materials reads "20 counters on a tray or card". |
| m7 P5 glance | **Fixed** | T6 row: "5 · 5 × 6 = 30 · 6 × 5 = 30". T5 §9 asks for 6 rows and 5 in each, matching the story. |

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | |
| T2 Teacher 2 | 9 | 9 | 9 | 9 | |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 9 | 9 | 9 | |
| T4 Teacher 4 | 9 | 9 | 9 | 9 | thumbnail shows the closed chart |
| T5 Teacher 5 | 9 | 9 | 9 | 9 | |
| P0 Prerequisite | 9 | 8 | 9 | 9 | |
| P1 Number sense | 9 | 8 | 9 | 9 | n2 |
| P2 Anchor chart | 9 | 9 | 9 | 9 | n1 |
| P3 Lesson 1 | 9 | 9 | 9 | 9 | |
| P4-1 Practice 1 | 9 | 9 | 9 | 9 | |
| P4-2 Practice 2 | 9 | 8 | 9 | 9 | m2, n3 |
| P5 Word problem | 8 | 8 | 9 | 9 | m4 |
| P6 Exit slip | 9 | 9 | 8 | 9 | bottom ~15 % of each half blank; within E9 |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 9 | 9 | 9 | n1 |
| P3 key | 9 | 9 | 9 | 9 | |
| P4-1 key | 9 | 9 | 9 | 9 | |
| P4-2 key | 9 | 8 | 9 | 9 | |
| P5 key | 9 | 8 | 9 | 9 | |
| P6 key | 9 | 9 | 8 | 9 | |
| T6 Answer Key | 9 | 9 | 9 | 9 | |

## Defects

None. No score is below 8.

## Nits (do not block)

**n1. P2 / P2-key: panel ④'s title wraps.**
- "Write the new / fact." runs to two lines, so panel ④'s content starts about 10 px (about 2 mm) lower than panel ③'s.
- As a result the captions "Turn the array: 2 rows of 3." and "Write the new fact: 2 × 3 = 6." do not share a baseline.
- The grid itself is equal and closed. A shorter title ("Write the new fact.") on one line, or a one-line title width,
  would align the two captions.

**n2. P1 item 10: the black "10" number tag touches the "W" of "Write".** A two-digit tag is wider than the one-digit
tags. Pre-existing and cosmetic.

**n3. P4-2: first factor 8 appears on b, f and g, with f and g one after the other across a row break.**
- This is within the ruling ("no first factor twice in a grid row").
- If the + rule's "never three running" is ever carried over to ×, this page is one swap away from it.

**m4 (open).** P5 is still 5 rows of 6. The frame helps, but a story with rows ≤ 5 (re-dealt to a pair the pack does not
use), or "Draw the turned tray", would remove the last counter-width exception.

**Source nit (not graded on a page).** Two comments in the lesson file are stale:
- "no pool … so ONE Practice page" sits beside `practicePages: 2`;
- the Practice 1 comment "a square or a 5 in every place" no longer describes the deal.

## Lesson 1 (g2-nbt3-read-write-1000): the six pages the chart-grid fix changed

I compared each page with `7ed41056`:
- On the charts (pages 10, 11, 21, 22), the old double / heavy rule above the step-4 band (chart 1) and the step-3 band
  (chart 2) is now the single panel-weight rule: darkness 278 / 275 against 290 for the panel rules.
- The heavy rule that separates the step routine from the "Another example" band stays.
- Pages 05 and 06 change only in the chart thumbnail.

Nothing else moved, and every number, key and grey fade is unchanged.

| Page | Role | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|---|
| 05 | T4 (5a / 6a) | 9 | 9 | 9 | 9 | thumbnail only |
| 06 | T4 cont. (5b / 6b) | 9 | 9 | 9 | 9 | thumbnail only |
| 10 | P2 chart 1 (539) | 9 | 9 | 9 | 9 | step-4 band now flush with the panel grid |
| 11 | P2 chart 2 (567) | 9 | 9 | 9 | 9 | step-3 band now flush with the panel grid |
| 21 | P2 chart 1 key | 9 | 9 | 9 | 9 | mirrors 10 |
| 22 | P2 chart 2 key | 9 | 9 | 9 | 9 | mirrors 11 |

All six still score ≥ 8 on all four criteria. The fix improves them, and lesson 1's PASS stands.
