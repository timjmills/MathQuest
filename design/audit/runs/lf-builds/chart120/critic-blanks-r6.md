# hundreds_chart_fill band 100: narrow independent critic r6, "chart blanks" G1

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `b92659664`. The critic changed no code.
- **How it was rendered:**
  - `tests/lib/ws-harness.cjs` `open()` under `tests/scripts/mq-browser-run.sh`.
  - Call: `window.buildSheet({role:'lesson', sections:[{skills:[{categoryId:'composing', skillId:'hundreds_chart_fill', opts:{band:100}}]}], size:'M', paper:'A4', seed, key:true, practicePages:1, mixed:false})`, then `sheetDocument` for the pupil pages and the key, print media, each `section.ws-page` shot.
  - The app page logged 0 console errors. The pupil document's own tab logged one 404 for a resource; it is a harness tab artefact, not graded.
- **Graded:** p2 (the teaching sheet) and p3 (the practice page), each with its key, at M, seeds 1 and 4242. p1 was rendered only to check for giveaways.
- **Machine reads:** every `table.k2-chart` on the pupil and key pages. Squares come from the key; blanks are the pupil's empty slots.
  - **Key arithmetic** (every square = first + 10·row + col): 0 wrong.
  - **Step cover** (left neighbour printed, square above printed, or top row with the square below printed): 0 failures.
  - **Earlier-page giveaway** (a gap printed on an earlier page or earlier on the same page): 0.
  - **Later givens** (p2 gaps printed on p3): these are all A13 givens. Seed 1: 42, 45, 52, 54, 2, 4, 11, 15, 22, 71, 73, 82, 84, 31, 35. Seed 4242: 79, 87, 90, 1, 3, 12, 22, 24, 42, 52, 54, 50, 56, 58.
  - **Givens styling:** every printed square on p3, givens included, has one computed style (400, rgb(0,0,0), 23.47 px Andika, 1 px border, no fill), the same as every other printed number. The key prints them plain, as given. The markup is the same `<td>` path as any non-blank square (`chartwindow.js`).
  - **p3 re-asks** (of p1/p2 answers): 0/19 (seed 1), 0/14 (seed 4242).
  - **p2 internal re-asks** (an Independent answer that a Guided window on the same sheet already asks): seed 1, 4/10 (42, 45, 64, 22). Seed 4242, 2/10 (67, 70).
  - **Empty band above the footer:** p2 76/926 px (8.2 %) and 77/926 (8.3 %); p3 58/926 (6.2 %, 6.3 %).
  - **Blanks per window:**

| Page | Seed 1 | Seed 4242 |
|---|---|---|
| p2 | 5·5·5·5, Score /12 = 2 warm-up + 10 Independent ✓ | 5·5·5·5, Score /12 ✓ |
| p3 | 9·5·5, Score /19 ✓ | 5·8·**1**, Score /14 ✓ |

- **PNGs:** `blanks-r10/` (list at the end).

## Verdict: **FAIL**

r5's G1 is closed: the teaching sheet prints Guided plus 2 Independent at M again, Score /12, and the page is full. A13 works as ruled: the givens cannot be told from other printed numbers, and real re-asks on p3 are 0. Two new defects come from the band-100 slot list and the givens, one on each graded page type.

## Scores (C1 ease · C2 teaching · C3 spacing/density · C4 standard)

| Page | Scores | Pass |
|---|---|---|
| p2 teaching sheet, s1 | 8·**7**·8·8 | **no** (H1) |
| p2 teaching sheet, s4242 | 8·8·8·8 | yes (H1 is present but within 1/3) |
| p2 keys, s1 / s4242 | 9·9·9·9 | yes |
| p3 practice, s1 | 9·8·8·8 | yes (H3 note) |
| p3 practice, s4242 | 9·**6**·**6**·**7** | **no** (H2) |
| p3 keys, s1 / s4242 | 9·9·9·9 | yes |

## Findings

### H2 (fails): seed 4242 p3 grid 3 (31–60) has one blank in 30 squares

- **Where:** `hcf100-lesson-M-p3-s4242.png`, item 3. Only 34 is blank. Rows 41–50 and 51–60 are printed in full.
- **The page:** Score /14 against /19 at seed 1. r5's rows-of-ten grids carried 8–9 blanks each.
- **Why it fails:**
  - C2 6: a full-width item asks for one answer, which is not practice.
  - C3 6: a third of the page is a grid with no work in it.
  - C4 7: below the blank floor every other rows-of-ten grid meets.
- **Root cause:** at seed 4242 nearly every square of 31–60 is already printed earlier in the packet, so the giveaway rule forbids blanking it.
  - p1 anchor 25–49 prints 35–39 and 45–49.
  - p2 Independent 41–65 and 46–70 print rows 41–60.
  - Only 31, 32, 33, 34 and 40 are free. The deal chose the grid band first and then took what was left.
  - A13 turns the p2 gaps into givens, but it adds no fresh squares.
- **Fix (either):**
  - (a) Choose the three rows-of-ten bands by their count of fresh squares (not printed, not asked earlier in the packet), with a floor of 5 blanks per grid. Here 11–40 or 71–100 plus 1–30 beat 31–60. If no band meets the floor, fail loudly.
  - (b) Lead ruling: let a later grid blank a square that an earlier page only *printed*, never asked. This is the reverse of A13. Then 31–60 can carry 8–9 blanks again.
- **Automatic check:** **GRID-BLANK-FLOOR** (`ws-guided-echo` lesson packet, or `ws-print-lint`): every rows-of-ten grid on a lesson practice page has at least 5 blanks.
  - Fails on `b92659664` hcf band 100 M seed 4242 p3 item 3 (1 blank).
  - Passes on seed 1 (9/5/5).
  - Run it on a seed sweep (for example 1–200), not only on seeds 1 and 4242.

### H1 (fails at seed 1): Independent Practice re-asks the Guided windows' answers in identical rows on the same sheet

- **Where:** `hcf100-lesson-M-p2-s1.png`.
  - Guided 1 (41–65) prints the row `41 _ 43 44 _`. Independent 4 (21–45) prints the same row with the same gaps 42 and 45.
  - Guided 1's 64 is blank again in Independent 3 (61–85), in the identical row `61 62 63 _ 65`.
  - Guided 2's 22 is blank again in Independent 4.
  - So **4 of 10** Independent answers were just done with the teacher a few centimetres above.
  - Seed 4242 (`hcf100-lesson-M-p2-s4242.png`): Guided 1 (66–90) and Independent 4 (46–70) both print `66 _ 68 69 _` (67, 70). That is 2 of 10.
- **Why it fails at seed 1:** C2 7. The pupil can copy the "you do" from the corrected "we do" on the same page, and 40 % is over the 1/3 re-ask bar. r4/r5's Independent windows shared no answer with anything.
- **Root cause:** the new slot list puts Independent windows that share a whole row with a Guided window (61–85 against 41–65, 21–45 against 41–65 and 1–25, 46–70 against 66–90), and the deal blanks that row the same way in both.
  - NEAR-TWIN does not trip, because the overlap is 33 % of the squares.
  - ANSWER-REUSE does not trip, because it counts the practice page against earlier pages, not within the teaching sheet.
- **Fix (any one):**
  - When an Independent window shares squares with a Guided window, deal the shared row's blanks so no Guided gap is blanked again. A13-style givens are fine.
  - Or require shared-row blanks to differ.
  - Or choose slots whose rows do not meet. 41–65 with 46–70 is disjoint; 61–85 against 41–65 is not.
- **Automatic check:** **SHEET-REASK** (`ws-guided-echo`): on a lesson teaching sheet, the Independent answers that a Guided window on the same sheet also asks are at most 1 per window. Strictest form: 0.
  - Fails on `b92659664` seed 1 (4/10).
  - Passes on r5 c120 p2 seeds 1/4242/777 (0).
  - At seed 4242 (2/10) it fails the strict form and passes the per-window form.

### H3 (note, scored within 8): the builder's question, seed 1 p3 grid 1 (1–30)

- **What it prints:** columns 6, 8 and 10 are blank all the way down (6, 16, 26 / 8, 18, 28 / 10, 20, 30), and columns 1–5 are wholly given (A13).
- **Ruling:** acceptable, not a giveaway. Every gap is solvable by "Look left. Add 1." The full column also shows the +10 pattern.
- **But it is the weakest item on the graded pages:**
  - Its 9 answers use only three ones digits.
  - "Look up" and "Top row? Look down" are never needed.
  - Half the grid is a stripe pattern.
  - 16 of the page's 19 gaps sit in vertical runs (the grid 2 column 80/90/100 and grid 3's 36/46 and 39/49 included).
- **Fix:** cap full-height blank columns at one per rows-of-ten grid, and spread the rest so at least one gap per grid needs the square above.
- **Check:** **COL-RUN**: at most 1 column blank in every row of a rows-of-ten grid. It fails on seed 1 p3 grid 1 (3 columns).

### Still open, not scored

- **r2 n1, numeral baseline.**
  - A printed number directly under a heavy-bordered blank square rides about 2 px low:
    - 97 (under 87) and 56 (under 46) in `hcf100-lesson-M-p3-s1.png`;
    - 92 (under 82) in `-p3-s4242.png`;
    - 62 (under 52) in `-p2-s1.png`.
  - This is unrelated to A13: the givens themselves sit on the baseline. Check: BASELINE, each row's span tops within 1 px.
- **r2 n2, the practice-page footer seed** (7920 / 12161 instead of the packet seed): FOOTER-SEED.

## What would close it

- H2: no rows-of-ten grid on the lesson practice page has fewer than 5 blanks, swept over seeds.
- H1: the teaching sheet's Independent windows re-ask at most 1 Guided answer each (0 preferred).
- Re-grade hcf band-100 lesson p2 and p3 with keys at M, seeds 1 and 4242, plus one sweep seed that the GRID-BLANK-FLOOR sweep flags as the worst.

## PNGs (`design/audit/runs/lf-builds/chart120/blanks-r10/`, 8 files)

- `hcf100-lesson-M-p2-s1.png`, `hcf100-lesson-M-p2-key-s1.png`
- `hcf100-lesson-M-p3-s1.png`, `hcf100-lesson-M-p3-key-s1.png`
- `hcf100-lesson-M-p2-s4242.png`, `hcf100-lesson-M-p2-key-s4242.png`
- `hcf100-lesson-M-p3-s4242.png`, `hcf100-lesson-M-p3-key-s4242.png`
