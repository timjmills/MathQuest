# Detailed lesson 4 (g3-oa9-mult-table-patterns): independent critic, round 2

Critic: Opus, medium effort, 2026-10-17. I graded the committed pack at `0e482153` cold. I ran no browser.

Pack: `design/lesson-samples/detailed/g3-oa9-mult-table-patterns/`. It has 21 PNGs, seed 4242, and SELF-CHECK passes
44 / 44. 19 of the 21 PNGs changed since r1 (P1 and its key did not change, and T2b did not change).

What I checked:
- I read all 21 PNGs.
- I re-multiplied every box of every window, on every pupil page and every key:
  - the anchor chart, 4–5 × 6–9;
  - Guided 11–12 × 5–8 and 2–3 × 2–5;
  - Independent 8–9 × 4–7 and 2–3 × 6–9;
  - Practice a 7–8 × 4–6, b 3–4 × 3–5, c 7–8 × 2–4, d 2–3 × 5–7, e 6–7 × 7–9 and f 11–12 × 4–6;
  - the exit, a 5–6 × 5–7, b 11–12 × 2–4 and c 8–9 × 7–9;
  - P0 f, 2–3 × 4–6;
  - the Check Question, 3–4 × 5–7.
- On every key, I checked every box against the parity of its product. Every even product is shaded and every odd
  product is white. Every header is right, and every product matches its headers.
- I checked every T3–T6 expected answer, every T2 / T6 wrong-answer row and every routing quote against the pupil page
  it names.
- I counted the shared boxes, turned boxes included, for every pair of windows on a page. I also counted them for every
  Practice, exit and Check Question window against every earlier window.
- I read the lesson file, the window rule (`gridFresh`, `gridRevisit` and `gridOverHalf` in print-sheet.js) and
  `chartTrap` / `chartEdge` in roles/lesson.js.

## Verdict: FAIL (2 of 21 pages: one new defect, a layout regression on P0)

Lowest score per criterion: **C1 9 · C2 8 · C3 7 · C4 9.**

All eight r1 defects are fixed. The only failure is D9:
- P0 dropped its second "Fill in the missing products" item.
- That leaves an empty bordered half-cell beside f, on P0 and on its key.
- r1 scored the same defect C3 7 on the exit slip (D4).
- The fix is one line. Once it is in, I expect the pack to pass.

## r1 status

| r1 | Defect | Status at r2 |
|---|---|---|
| D1 | P5 Say printed the answer 28 | **Fixed.** The Say band is now "One number is even. So the product is ___." It shows no product. |
| D2 | The exit Say coached item b | **Fixed.** There is no Say band on the exit, and T5 §10 says "No help". |
| D3 | Exit b / c shared boxes; 11 / 12 never modelled; the Check Question was stale | **Fixed.** Exit b (11–12 × 2–4) and exit c (8–9 × 7–9) share no box. Rows 11–12 are modelled on P3 Guided 1, with T4 §6 saying "11 is odd. 6 is even. So 66 is even.", and again on Practice f before the exit. Under the lead's rule, no single earlier window holds more than half of a Check Question or exit window's boxes. |
| D4 | The exit had an empty quadrant | **Fixed.** a runs full width, with b and c below, as in 3a. |
| D5 | Practice copied P3; boxes repeated on the page; the ★★★ row was not an edge | **Fixed, one residual (n6).** No Practice window is the top of a P3 window. Two windows of the page share at most 2 of 6 boxes, turned boxes counted. The last row is `chartEdge`: e holds 54 and 56 (an even product with an odd tens digit), and f holds rows 11–12 and the odd 55. Every window above that row holds at most one trap. |
| D6 | Guided = Independent, so no fade | **Fixed.** Guided 1: even headers ringed grey and the 12 row traced (pre-shaded). Guided 2: rings only. Independent: plain. That is a real ★ → ★★ fade. |
| D7 | Check Question distractor B was no one's answer | **Fixed.** B shades all six boxes, which is odd × odd = even. A shades the 4 row only. T5 §7 says to draw the window three times. |
| D8 | The cube demonstration disagreed across pages | **Fixed.** T1 Tip, T2 atom 5, T4 §5 steps 2 / 7 / 8 and the T5 §7 reteach all say "4 rows of 6, 12 and 12". Materials lists a teacher set of 60. |
| n1 | Panel ① "rows" for one row | Persists. Panel ① still reads "The even row numbers: 4." No score effect. |
| n2 | T2 "Columns only" quoted chart numbers | **Fixed.** It now quotes exit a: "the 6 column shaded, the 6 row white". |
| n3 | T6 P5 row lacks "even" | Persists. |
| n4 | The T6 "Columns only" row | **Fixed.** It now reads "The even columns shaded, the 6 row white". |

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | Materials, Tip and chart (2 × 4 window) agree |
| T2 Teacher 2 | 9 | 8 | 9 | 9 | n6, n7 |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 9 | 9 | 9 | P0 a 14, 16 · b–e 14, 12, 16, 36 · f 8, 12, 12 ✓ |
| T4 Teacher 4 | 9 | 9 | 9 | 9 | Chart script ✓ (30 even, 45 odd); Guided expected answers ✓ |
| T5 Teacher 5 | 9 | 9 | 9 | 9 | CQ A / B / C ✓; exit expected answers ✓; n8 |
| P0 Prerequisite | 9 | 8 | **7** | 9 | **D9** |
| P1 Number sense | 9 | 8 | 9 | 9 | unchanged |
| P2 Anchor chart | 9 | 8 | 9 | 9 | n1; a grey newest mark on all 3 panels |
| P3 Lesson 1 | 9 | 8 | 9 | 9 | fade fixed; n9 |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | gridRevisit (below) |
| P5 Word problem | 9 | 8 | 9 | 9 | n10 |
| P6 Exit slip | 9 | 8 | 9 | 9 | n11 |
| P0 key | 9 | 8 | **7** | 9 | **D9** (mirrors); 14, 16 · 14 · 12 · 16 · 36 · 8, 12, 12 ✓ |
| P1 key | 9 | 8 | 9 | 9 | unchanged |
| P2 key | 9 | 8 | 9 | 9 | no answer marks ✓ |
| P3 key | 9 | 8 | 9 | 9 | every box ✓; vocabulary lines ✓ |
| P4-1 key | 9 | 8 | 9 | 9 | every box of a–f ✓ |
| P5 key | 9 | 8 | 9 | 9 | 4 × 7 = 28, "even" ✓ |
| P6 key | 9 | 8 | 9 | 9 | a 30, 30, 36, 42 · b 22, 44, 24, 36, 48 · c 56, 64, 72, 72 ✓ |
| T6 Answer Key | 9 | 8 | 9 | 9 | every Answers-at-a-glance list ✓; every wrong-answer row on exit b / c / a ✓; n3 |

## Defects (each one causes a score below 8)

**D9. P0 and the P0 key: an empty bordered half-cell** (RUBRIC C3 "no lone item or half-empty band when more would
fit"; LESSONS_LEARNED "wasted space"; r1 D4 precedent, C3 7).
- In r4 the prerequisite `atom: 3` went from `items: 2` to `items: 1`, which removed r1's g window.
- The "Fill in the missing products." band is still laid out two-up. f sits in the left half, and the right half is an
  empty box with a border that reads as a missing item.
- The gates miss it:
  - E20 passes because the page has six items.
  - E11 passes because the empty half is not a cell.
- **Fix (either one):**
  - Give the f band `cols: 1`, so f is centred full width, as exit a is.
  - Or restore a second fill window that the window rule allows, such as a turned revisit of a lesson window that no
    exit or Check Question window draws on.
- **Gate:** add an E-check that fails a band whose grid has an empty track. A band of n items laid out in more than n
  columns fails.

## Nits (no score effect)

- **n6.** T2 atom 7 ("Odd × odd is odd") still says "The last Practice row only".
  - Odd × odd boxes are in every window on every page, and anchor-chart step 3 teaches them.
  - It should read "Anchor chart step 3; every window" (r1 D5 asked for this correction).
- **n7.** T2 Common mistakes still quotes chart numbers for two rows that are caught elsewhere:
  - "Any odd factor is odd: 5 × 6 left white" is caught by exit b. Quote exit b instead: "22 left white (11 is odd)",
    which is what T6 already says.
  - "Tens digit decides: 30 left white" is caught by Practice 1, but 30 is not on Practice 1. Quote "54 or 56 left
    white" (Practice e).
- **n8.** The T5 §8 Watch box lists shaded products followed by "(odd × odd stays white)", which reads oddly. Name the
  traps instead: "e: 54 and 56 are even (tens digit odd); f: 55 stays white."
- **n9.** P3 Guided 1 is both the first We Do cell and the first appearance of the 11 / 12 headers. The lead ruled this,
  and it is acceptable:
  - the routine is not new, because the anchor chart modelled it;
  - step 1 is traced;
  - T4 §6 step 4 models "11 is odd".

  If a round has room, Guided 2 (2–3 × 2–5) could come first, so that the two-digit header is the one new thing on
  the second cell.
- **n10.** P5's Say frame "One number is even. So the product is ___." fits only an even item, so it leans towards the
  word "even". It shows no product and no non-given answer, so it passes E16c and fixes D1.
- **n11.** Exit a (5–6 × 5–7) contains 5 × 6 = 30, the I Do Critical Atom example from T4 §5 step 5, and its
  turn-around 6 × 5. With 5 × 7, that puts 3 of exit a's 6 boxes on the anchor chart. This is exactly half, so the rule
  allows it. Better: add the chart's named examples (`chart.cp`, `chart.op`, `chart.wp`) and their turn-arounds to the
  exit's forbidden boxes.

## The gridRevisit judgement

The six Practice windows revisit earlier ground heavily:

| Window | Boxes seen on an earlier page | Where |
|---|---|---|
| a | 5 of 6 | anchor turned, Independent a's 8 row |
| b | 4 of 6 | Guided 2 |
| c | 6 of 6 | Independent b turned, anchor turned, Independent a |
| d | 6 of 6 | Independent b, Guided 2 |
| e | 4 of 6 | Independent a turned |
| f | 4 of 6 | Guided 1 |

To a pupil, most of this does not read as repetition:
- Every window has its own header set.
- No window is a copy, and none is the top of an earlier window, so the shading pattern changes from window to window.
- The turned revisits (a, c, e) look new, because the facts come back in a different picture.

Three windows show a visible sub-block of an earlier window in the same orientation, shifted by one column:
- a holds Independent a's "8: 32 40 48";
- d holds Independent b's "2, 3 × 6, 7";
- f holds Guided 1's "11, 12 × 5, 6".

That does not give an answer away, because the shading still has to be read from the headers. The cost is some
variety, not correctness.

**Judgement: acceptable, scored C2 8, not 9.** The 2–12 chart without the 10 row really is too small for six fresh
2 × 3 windows that also leave the exit and Check Question fresh. For a later round, prefer turned revisits over
same-orientation sub-blocks when `gridRevisit` deals: transpose the window when its rows equal an earlier window's rows.

## Rulings checked

- **Same-page windows share at most half, turned boxes counted:** true on P3, P4-1 and P6. The most shared is 2 of 6 on
  P4-1, and b / c share 0 on P6.
- **No window copies an earlier page's window:** true for every task.
- **Exit and Check Question windows are fresh** (no single earlier window holds more than half their boxes): true.
  - Exit a shares 3 of 6 with the anchor.
  - Exit b shares 2 with Practice f.
  - Exit c shares 2 with Independent a.
  - The Check Question shares 2 with the anchor and 2 with Independent b (Practice d, which comes after it, shares 3).
- **The 10 row is unused:** true on every page.
- **Rows 11–12 are modelled on P3 Guided 1 and Practice f before the exit:** true.
- **★★★ row:** e meets `chartTrap` (54, 56). f meets `chartEdge` through `chartBigOdd` (55), not through `chartTrap`
  (72 is its only odd-tens even). This matches the code (`chartEdge` = trap OR big odd) but not the brief's wording
  ("two even products in the 30s / 50s / 70s / 90s"). Practice a and c each hold one 32, which is below the trap's
  threshold of two. I accept it, and record the difference.
- **EE M.EE.3.OA.8 (repo) versus M.EE.3.OA.9 (owner):** recorded, not graded.

## PART B: lesson 2 (g1-oa1-bar-model-wp-20), P6 Say band re-check

The change I compared against `7ed41056` is the Say band on both halves:
- The old band was "b. The answer is ___ beads." It named item b and walked its answer.
- The new band is "I add the parts to find the ___." The key's answer is "whole".

The new line:
- has no item letter;
- shows no number;
- is the lesson's own chant and the P5 Say line ("Parts below. Whole on top. Add the parts.");
- does not give away an operation, because the lesson's scope is the whole-unknown only (RESEARCH.md), so "add" decides
  nothing that is assessed.

The rest of both pages is unchanged:
- a: 8 + 6 = 14 stamps; b: 4 + 9 = 13 beads.
- The bar slots and the answer boxes are as they were.
- On the key, the Say band sits about 1 mm higher than on the pupil page. That is invisible in use.

| Page | C1 | C2 | C3 | C4 | r4 | Note |
|---|---|---|---|---|---|---|
| 13 P6 Exit slip | 9 | 9 | 8 | 8 | 9 / 9 / 8 / 8 | generic frame, no item or answer; E16c clean |
| 20 P6 key | 9 | 9 | 8 | 8 | 9 / 9 / 8 / 8 | 8, 6, 14 · 4, 9, 13 · "whole" ✓ |

**Lesson 2 verdict: the PASS stands.** Every page is still at 8 or above on every criterion, and the two changed pages
are no worse than at r4. They are cleaner on C2, because the frame no longer coaches item b.
