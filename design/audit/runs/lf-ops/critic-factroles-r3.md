# Critic: facts-roles, narrow round 3 (Scripted Model L, mult_facts and div_facts)

- Critic: independent (built none of it), Opus medium, 2026-11-12.
- Tree: the frozen worktree `critfr4` at 9f7983dd. No source edits.
- Renders: `ws-grade-render --skills multiplication:mult_facts,division:div_facts --roles scripted-model --size L --no-screen`, run
  through `/tmp/mq-browser-run.sh`.
  - Output: `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/fr3-renders/<cat__skill>/scripted-model[-key]-p{1,2}.png`.
  - 2 pupil pages and 2 key pages per skill.
- Measured from the PNG ink: A4 at 96 dpi, 3.78 px/mm, ink is a pixel < 200.
  - Cell bands are measured between the drawn grid lines.
  - Page used = the last ink, over the body from 130 to 1050 px.
- Also ran `ws-empty-band --model-states --roles scripted-model --sizes L --no-baseline`.
  - Print checks all PASS: MOD-GRID, MOD-MARKS, MOD-LINES, EB-BAND and EB-PAGE.
  - One EB-SIDE finding is on the quiz 1280 px screen host, which is out of scope here.
- Read: RUBRIC, including H13 and §6.1; PAGE_TYPES §2.2 PT-MOD-1..4; PT-FRM-2; the r2 report.
- Lead ruling PT-MOD-3 applied: room kept for later marks (≤ 35 %, a state before the last, a later state inks it) is not
  an empty band.
- Only these 4 pages and 4 keys are graded. The other 23 pages passed at r2 and were not regraded.

## VERDICT: FAIL (narrow)

Lowest score **6** (C3), on **div_facts** only, both pages, H13 (defect S5).

mult_facts passes at 8 on every criterion. S4 (the r2 empty state cells) is FIXED for both skills.

## S4 (r2): FIXED

| check | mult_facts | div_facts |
|---|---|---|
| Grid | 2 + 2 on both pages, Z order, no empty state cell (MOD-GRID PASS) | same |
| A new grey mark each state | "8 groups of 10" → skip-count list → "8 × 10 = 80" → grey 80 (example 2: 4 × 12 → 48) | "56 ÷ 7" → "7 × __ = 56" → "7 × 8 = 56" → grey 8 (example 2: 6 ÷ 3 → 2) |
| Step text | 1 line in every state (limit 2) | 1 line in every state |
| Second example | 4 × 12 = 48: a different fact, the same wording, unambiguous | 6 ÷ 3 = 2: the divisor is not the quotient, unambiguous |
| Continuation page | 12 mm header (PT-FRM-2), "Model:" band repeated, page number 2/2, same row height as page 1 (83.3 mm) | same, rows 81.2 mm on both pages |
| Page used, p1 / p2 | 73 % / 72 % | 71 % / 70 % |
| Say band | last page: "4 times 12 equals 48." | last page: "6 divided by 3 equals 2." |
| Keys | facsimiles (byte-identical PNGs); the traced answers 80, 48, 8 and 2 are correct | same |

Page 2 reads as a page.
- It has the Name line, the Model band, 4 states and the Say band.
- About 28 % white is left under it. That is the role's last page, and EB-PAGE (general) exempts the last page.

PT-MOD-4 says "the page ends with the Say band". The Say band is on the last page only, and it names the second example.
That is acceptable: there is one oral frame per sheet, and the brief specifies it.

## Cell bands (H13), measured per state cell

| page | state | cell h | step text → problem gap | bottom band |
|---|---|---|---|---|
| mult p1 | 1 / 2 / 3 / 4 | 83.3 mm | 23.0 mm = **27.6 %** | 33.0 / 33.0 / 26.3 / 21.3 % |
| mult p2 | 1 / 2 / 3 / 4 | 83.1–83.3 mm | 23.0 mm = 27.6–27.7 % | 33.1 / 33.1 / 30.2 / 21.0 % |
| div p1 | 1 / 2 / 3 / 4 | 81.2 mm | 25.1 / 25.1 / 24.9 / 24.6 mm = **30.9 / 30.9 / 30.6 / 30.3 %** | 35.2 / 27.0 / 18.6 / 18.6 % |
| div p2 | 1 / 2 / 3 / 4 | 81.2 mm | 24.9 / 24.9 / 24.9 / 24.6 mm = **30.6 / 30.6 / 30.6 / 30.3 %** | 35.2 / 27.0 / 18.9 / 18.9 % |

Bottom bands of 30–35 % are on states before the last, and a later state inks them. They are excused under PT-MOD-3.
- On div state 1, my pixel measure is 35.2 %, against the ruling's 35 %. The DOM measure (EB-BAND) passes. I record it as
  grazing, not scored.

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

| skill | p1 pupil + key | p2 pupil + key |
|---|---|---|
| mult_facts | 8·8·8·8 | 8·8·8·8 |
| div_facts | 8·8·**6**·8 (S5) | 8·8·**6**·8 (S5) |

## Defects

### S5 · div_facts Scripted Model L: the empty band between step text and problem is ≥ 30 % in every state cell

- **class:** H13 wasted space inside cells.
- **Where:**
  - `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/fr3-renders/division__div_facts/scripted-model-p1.png` and `-p2.png`, all 8 state cells.
  - The keys are the same.
- **Measured:**
  - The band from the bottom of the step text to the top of the problem is 24.6–25.1 mm in an 81.2 mm cell, which is
    30.3–30.9 %.
  - In the same cells, the problem sits only 1.3 mm above its first grey mark, so the slack is all above the problem.
  - mult_facts has the same layout at 27.6 % and passes.
- **Rule:** RUBRIC H13: an empty band ≥ 30 % of the cell height sets C3 ≤ 6. "Measure it; do not eyeball it past."
- **Why it happens:** the row is stretched to 81 mm so that page 1 reaches the Scripted Model 70 % page-fill rule. PT-MOD's L
  row is 54 mm. The extra height lands above the problem.
  - State 1 has ≈ 60 % of its height empty. That empty height splits 31 % above the problem and 35 % below it.
  - The cell cannot shrink much without EB-PAGE failing.
- **Fix:** keep the row height and move the slack, not the page.
  1. Raise the problem by about 3 mm.
  2. Open the gap between the problem and its first mark to about 4 mm. Today it is 1.3 mm, which is also tight to read.
  3. Do not move the marks.
  - Result: the gap above the problem drops to about 22 mm (27 %), and the bottom bands stay as they are, so state 1 stays
    within PT-MOD-3.
  - Alternative: size the row as min(stretch, fullest state ÷ 0.70).
- **Check:** **EB-GAP** in `ws-empty-band`.
  - It measures the largest INTERIOR empty band of a cell, between two ink runs, not only the band under the last ink.
  - FAIL at ≥ 30 %, with `--margin` honoured.
  - Backtest: FAIL on 9f7983dd div_facts Scripted Model L (30.3–30.9 %), PASS on mult_facts (27.6 %).
  - EB-BAND could not catch this, because it reads only the band under the ink.

## Nits (no score effect)

- PT-MOD-1 asks for earlier marks in black. Here they stay grey: the r2 nit, still open for the lead.
- mult state 1's mark "8 groups of 10" repeats its step text word for word. div state 1's mark "56 ÷ 7" repeats the printed
  problem. Both are weak first marks.
- Rows are 81–83 mm against PT-MOD's 54 mm L row height. PT-MOD-3 holds, because the row height is the same across the pages.
  The PT-MOD table should say the rows may stretch for page fill, or EB-PAGE should exempt the Model's last page.

## Rule 00: speed reflection lists

**Automatic checks that would have caught each finding:**
1. S5 → **EB-GAP**: the largest interior empty band in a cell is ≥ 30 % (margin-aware). Add it to `ws-empty-band` and to
   precritic's path. Backtest it on 9f7983dd div_facts L.
2. The grazing state 1 bottom band of div (35.2 % px, the limit is 35 %) → run EB-BAND's PT-MOD-3 branch with `--margin` too, so
   a fix clears the limit rather than sitting on it.
3. The grey-not-black earlier marks → a MOD-INK check: in state k, the marks new in state k-1 are black. It is pending the lead's
   ruling on whether hint ink is grey.

**Speed-ups this round revealed:**
1. Two rules pull on the same space: the Scripted 70 % page fill pushes the rows taller, and H13 / PT-MOD-3 caps each band.
   Before stretching a row, a builder should compute "empty % per cell = 1 − content / row" for the fullest and the emptiest
   state. A one-line precritic print of that number would have shown 60 % empty in div state 1 before the critic did.
2. Grade-render's per-cell band table (top / interior / bottom %) should be written into `meta.json`. The critic would then not
   re-measure from the PNGs: about 5 minutes per round.
3. Narrow rounds work. This round took about 15 minutes for 8 pages. Keep re-checks scoped to the failed pages.
