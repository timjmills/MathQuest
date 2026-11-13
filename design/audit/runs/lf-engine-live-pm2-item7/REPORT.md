# lf-engine live-pm2 — item 7 critic (independent, Opus medium)

Fix graded: `addition:add_wp_10` lesson packet, size L, Mixed continuation page (p5) used to end about 72 % blank. The fix: Mixed shelves fill the pages they take.
Branch `claude/sweet-newton-c8wrv1-lf-engine-live-pm2` @ 1b2d38f05. Evidence: committed PNGs in
`design/lessons/proof/live-2026-11-13b/add-wp-10/{before,after}/`. I did no rendering. I graded from the PNGs only.

## VERDICT: PASS (min 8)

| Page | C1 | C2 | C3 | C4 | Caps | vs before |
|---|---|---|---|---|---|---|
| L pupil p5 (Mixed 2/2) | 9 | 8 | 8 | 8 | none | much better (before H5: 1 row, ~72 % blank → C3 ≤ 5) |
| L key p5 | 9 | 8 | 8 | 8 | none | much better (facsimile; all 10 answers correct) |
| L pupil p4 (Mixed 1/2), balance glance | 9 | 8 | 8 | 8 | none | equal/better (4 word problems; score /14 matches items 1–14) |
| L key p4, glance | 9 | 8 | 8 | 8 | none | equal |
| S pupil/key p3, p4 (regression glance) | — | — | — | — | none | p3 slightly better (content now centred in cells); p4 same layout, same items |

## Measurements (dark-row scan, body = top 93 % of page)
- After L p5: last body row y=1094/1287, blank foot 8.6 %. Before, it held only the Subtraction row and ended at y≈408, so about 72 % of the page was blank.
- After L p4: blank foot 14.8 %. Before it was ≈ 22 %.
- Subtraction cells on p5 are 258 px tall. The written answer sits under the rule (key y≈1015). The empty band below the answer is about 58 px, about 22 % of the cell, which is under the H13 limit of 30 %. The cell height is the same as before.
- Number-bond cells (p5 items 7–8): the drawing fills the 280 px cell. No band reaches 30 %.

## Checks
- **Repeated items:** none across the two pages (p4: 2+2, 2+7, 2+8, 4+2; p5: 4+3, 3+7, bonds 1+5, 9−2, subtraction set). The S Mixed page uses the same seed and shares items with the L Mixed page by design.
- **Key:** it is a facsimile of the pupil page on both pages, with the same geometry. Every answer is correct (4, 9, 10, 6, 7, 10; bonds 6 and 7; 2, 3, 4, 2, 1, 2). Sums stay within 10.
- **Tab / header:** no strand tab touches content. The continuation page carries Name and the section header "Addition", so the section that runs on from p4 is labelled.
- **Page balance:** both Mixed pages are now 85 % or more used. p4 holds 4 tall items and p5 holds 10 items in 3 sections. Acceptable.

## Non-blocking findings (minor)
1. **L p4, items 3 and 4 do not line up (C4 −1 headroom).** Item 4's story starts about 25 px lower than item 3's because each cell's content is centred on its own height. Item 3 draws 3 rows of apples and item 4 draws 2. Fix: top-align the text block in cells that share a shelf row. Check: on each shelf row, the y of the first text line must be equal across cells (within 2 px).
2. **L p4, items 3 and 4 use the same context** ("I have N apples. I get M more apples.") side by side (C2 headroom). Check: no two adjacent word-problem items in a section share both noun and frame.
3. **What would raise C3 to 10:** p4 still has a foot of about 15 %. The pages could balance better, for example by moving one of the p5 addition items onto p4 so the two pages are filled to about the same level. Check: the difference in fill between consecutive pages of a section that spans pages is at most 10 %.

## Automatic check that would have caught the original defect
`lesson-sheet-continuation-fill`: on any continuation page of a packet role, the blank foot must be under 50 % (H5). The scan used here does this check: find the last dark row above the footer band.
