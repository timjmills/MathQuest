# Atomisation Lesson Planner V21: independent critic, round 6

Critic: Opus, medium effort, 2026-10-16. I graded commit `e027b5c0` cold.

## Verdict

- **Pages: PASS.** No pupil or teacher page has changed since round 5.
- **V21 document: FAIL by one point.** D1 (fidelity) is 7 and D4 (checkability) is 8. The cause is R6-1: V21's
  small-pool exception, its make-10 worked example and its E24 check all let an anchor-chart example come back on
  another page in a different representation. The site's rule LR-5 forbids this.
- **The fix is two lines** (§3).

## 1. What I verified, by running it

| Check | Result |
|---|---|
| PNGs changed since round 5 (`git diff e551956d e027b5c0 -- '*.png'`) | **0** |
| `pack.html` changes | only the new `data-rep` attributes |
| Both packs' self-check: V21 `v21-selfcheck` fence, Chromium 1194, my own run | **34 / 34** and **34 / 34** |
| `timeSlot()` colon gap | 5 mm, as R5-2 asked |
| Make-10 example count | "7 facts left for the pages" plus the 2 chart examples as places; the fixture computes usable 9 |

### The builder's 4 fixtures, re-run with `node selfcheck.mjs --fixture`

| Fixture | Result | Matches §9.5 |
|---|---|---|
| `make10` | PASS | yes |
| `make10-repeat` | FAIL (1 + 9, stack, twice) | yes |
| `time` | PASS | yes |
| `time-repeat` | FAIL (7:30, clock, twice) | yes |

### 6 fixtures of my own, using the plain-list form the builder did not exercise

Pool: `{"kind":"list","items":[circle, square, triangle, rectangle, hexagon, pentagon]}`. The 20-item pool in D is
`{"kind":"list","items":["0".."19"]}`.

| Fixture | Expected by §9.5 / LR-5 | E24 | Verdict |
|---|---|---|---|
| A. List pool, valid deal; one cross-representation repeat on another page (small pool) | PASS | PASS | correct |
| B. **Same fact, two representations, same page** | FAIL | FAIL ("square (word) P3") | correct |
| C. Declared list differs from the listed pool | FAIL | FAIL (MISMATCH) | correct |
| D. 20-item pool (not small); same fact, another representation, another page | FAIL | FAIL | correct |
| E. **A chart example comes back on the exit slip in another representation** (small pool) | FAIL (LR-5: "a chart example never comes back") | **PASS** | **wrong** |
| F. An item with no `data-rep` | FAIL | FAIL | correct |

## 2. The V21 document

| Criterion | r5 | r6 | Pass |
|---|---|---|---|
| D1 Fidelity to the site profile | 8 | **7** | FAIL (R6-1) |
| D2 Completeness and self-containment | 8 | 8 | PASS |
| D3 Decision-rule clarity | 8 | 8 | PASS |
| D4 Checkability | 7 | 8 | PASS |

**D4 is now 8.**
- The pool declaration is data and covers + / − / exact sum / time / list.
- Each item is keyed by fact, representation and page.
- The check fails without a pool and fails a pool that does not match its declaration. It handles skills beyond the
  two samples, as fixtures A–D and F show.
- It would be 9 if it caught E (R6-1).

**D1 drops to 7.**
- §9.5 point (3) says "the same fact in a different representation is a different item only on a different page".
  It makes no exception for chart examples.
- The make-10 example (line 3009) and `fixtures/make10.json` deal the chart example 7 + 3 again as a ten frame on
  the exit slip.
- Site LR-5 (`design/LESSON_RULES.md`, wip-lessons branch): "a chart example never comes back, not even turned
  round". This is the same class of LR-5 breach that cost D1 a point in round 3.

## 3. Defect R6-1 (major, D1): a chart example may return in another representation

- **Where:**
  - V21 §9.5, the small-pool rule, point (3);
  - the make-10 example (lines 3006–3010);
  - Appendix F.3;
  - `fixtures/make10.json` (P6, `7+3 tenframe`);
  - `poolCheck()` in Appendix E.
- **Fix:**
  1. **§9.5 (3):** add "…except a chart example, which never comes back in any representation (LR-5)".
  2. **The make-10 example:** use 9 + 1, 8 + 2, 10 + 0 and 5 + 5 as ten frames on the exit slip. These are facts
     dealt on Practice, now in another representation on another page.
  3. **`poolCheck()`:** collect the items on page `P2`, the anchor chart, and push any later occurrence of them, in any
     representation, into `rep` (a hard repeat).
- **Check:** my fixture E (P2 circle/picture, P6 circle/word) FAILS E24. `make10.json` with the corrected exit slip
  PASSES.

## 4. What would raise each criterion to 10

- **D1:** R6-1.
- **D2:** add a one-line note in F.3 on what representations count as "different" (stack, equation, bond, ten frame,
  picture, word, clock, digital), so `data-rep` values are a closed list.
- **D3:** state that a small-pool skill's places may exceed the usable pool *only* through cross-representation
  repeats on other pages. The code already allows this (`small || places ≤ usable`), but the text does not say it.
- **D4:** add fixture E to F.3 as a FAIL case.
