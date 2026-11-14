# Narrow critic — LDIV-ROOM, bigger long-division work boxes (owner request 2026-11-14)

Independent critic (Opus medium). Candidate 8a92b7390, parent d82acc06f. Evidence is in the session scratchpad crit-room/ (session-local).

**Verdict: PASS.** C1 9, C2 9, C3 8, C4 9. Nothing blocking.

- **Bigger writing boxes.** At M, 4 a page, a box is about 11.8 × 16.9 mm, against about 9 mm before. At L the rows are 17.0 mm.
- **Centred.** White is 5.4 mm top and bottom and 18.3 mm left and right at M.
- **Grid fill.** The grid fills 93 % of the free height at M and 94 % at L. Nothing overflows, and the cell number label is clear.
- **Correct.** Every key answer and partial is correct and in its right column. Printed digits stay at their size tokens (22 pt at M, 28 pt at L). The bracket is straight and joined, and its bar spans the quotient.
- **6 a page** at M: pupil page and key are byte-identical to the parent.
- **Count 8** paginates 4 + 4, so those pages grow too ("never smaller" holds).

Gates:
- `ws-ldiv-hug --room`: OK. M4 93 % (1.87×), L4 94 % (1.54×), M6 71 % (1.00×, unchanged).
- `--join --raster --shape`: OK. 610 arcs; gap and step 0.00 mm; bow 0.34 mm; brightest bar pixel 0.

Findings:
- **N1 (minor, C3).** The dividend's tracks widen with the grid but the divisor's do not, so "37 ⟌ 3 3 3" reads as spaced. If the owner finds it odd, cap how far the dividend tracks widen; do not grow the digits.
- **N2 (minor, C3).** The quotient strip is about 17.9 mm tall at M, taller than it needs to be.
- **N3 (out of scope; also on the parent).** `divide` with notation bracket at range 1000 renders on the old non-kit template: an orphan cell 4, empty space, and an offset quotient box. This needs a separate ticket.
- **N4.** The builder should confirm in one line that the lesson baseline does not pin long_div at L with 4 a page. The status says both "1772 identical" and "Lesson L changed".

Builder's questions:
- (a) The lesson page's practice part at L grows: **accept**, once N4 is confirmed and the lesson L page has been looked at once.
- (b) Cap the quotient and remainder boxes at about 13 mm tall at M: **recommended** as a refinement. It returns about 5 mm to the grid and brings the quotient closer to the dividend.
