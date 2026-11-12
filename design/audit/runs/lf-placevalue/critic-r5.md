# lf-placevalue critic r5 — narrow re-grade (independent critic, Opus medium)

Branch `claude/lf-placevalue-r5` at d61b6817 (code at 07634a75 + the r5 brief). Renders under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r5/` (root R), print only
(`--no-screen`), one browser command at a time. Every PNG listed was looked at. Numbers come from `ws-empty-band` (DOM, mm) unless
marked "px" (pixel rows at 96 dpi, 1 px = 0.265 mm). The grades from r3 / r3b / r3c / r4 STAND for every page not listed here.

## Byte comparison against r4

- identify lesson: p1 at S/M/L and key p1 are byte-identical to r4. The new p3 at S/M/L and key p3 are byte-identical to r4 S/M p3 and
  L p4 (the Independent page, already graded). Only p2 changed: S = M (md5 e43c5d…, ENGINE E1 as before) and L (3001ee…). L now has
  3 pages, not 4.
- unit_form rename=more S: all four roles re-rendered (the line length changed). Error-analysis re-rendered at S, M and L.

## Grade table (C1-C2-C3-C4)

| Page | S | M | L | Measured |
|---|---|---|---|---|
| unit_form rename=more independent | 8-8-8-8 | r4 stands | r4 stands | 15 rows, 1 x 15. Write line about 145 px (38 mm), the same on every row, so it does not give away the answer. Widest side band 49 mm of a 184.9 mm cell = **27 %** (r4: 29.9 %) |
| unit_form rename=more more-practice | 8-8-8-8 | - | - | 15 rows. Every side band under 27 % (no row reached the 27 % margin line) |
| unit_form rename=more test + key | 8-8-8-8 | - | - | 12 rows. Widest side band 27 %. Key right: 554 -> 55, 1 h 10 t = 200, 608 -> 60, 2 h 19 t = 390, 466 -> 46, 7 h 15 t = 850, 795 -> 79, 6 h 18 t = 780, 707 -> 70, 1 h 18 t = 280, 251 -> 25, 5 h 10 t = 600 |
| unit_form rename=more review | 8-8-8-8 | - | - | 10 rename rows (widest 27 %) + 6 Mixed Review cells: 600 + 10 + 1 = ___ and similar, side band 15.5 mm of 61.5 mm = 28 % (under 30 %; for information) |
| unit_form error-analysis + key | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | **G5 fixed**: S item 1 "193 = 100 hundreds 90 tens 3 ones" now prints the Fix-it frame "[ ] hundreds [ ] tens [ ] ones", the same word as items 2-6 and as the work shown. Keys right: S 193 -> fix 1/9/3, 732 (2/3/7) -> fix 7/3/2, 802 correct, 867 (7/6/8) -> fix 8/6/7, 763 correct, 625 correct; M/L 193 correct, 732 correct, 802 (2/0/8) -> fix 8/0/2, 401 (400/0/1) -> fix 4/0/1. ws-empty-band on error-analysis S/M/L: all rules PASS. Note: at L the work-shown "400" fills its grey box edge to edge (still legible) |
| identify lesson p2 (vocab, warm-up, Guided) + key | 8-8-8-8 | 8-8-8-8 | 8-8-**6**-8 ENGINE | **E-r4-1 fixed**: the Guided cells (175, 629) now sit two across under the steps strip, so Guided moved up from p3 and L is 3 pages. L p2 ink now ends at about y 1000 px (r4: y 653; about 43 % of the body was empty). At S/M p2 the ink ends at y 890 px, so about 15 % of the body is empty at the foot. Keys right: 472 -> digit, H T O -> place, squares -> ones; warm-up 56 -> tens, 53 -> ones, 38 -> tens, 85 -> ones; 17 = 1 ten 7 ones, 93 = 9 tens 3 ones; Guided 175 -> ones / 5, 629 -> tens / 20. L C3 6: ws-empty-band EB-SIDE FAIL on L p2 warm-up cells 1 and 2, with 26.7 mm beside the ink of a 91.8 mm cell (**31 %**, RUBRIC H13). This is ENGINE-ROLES (see N-r5-1) |
| identify lesson p1, p3, keys | r4 / r3c stand | same | same | byte-identical (p3 = r4 S/M p3 and L p4) |

## Finding status

- **N-r4-1 (unit_form rename=more S, H13 side band at 29.9 %): FIXED.** The widest side band is now 27 % (49 mm of 184.9 mm) on
  independent, test and review at S. It clears 30 % by 3 points: `ws-empty-band … --margin 3` lists those rows at exactly 27 %, and
  `--margin 0` passes with the pin. M and L are unchanged (25.8 % / 20.2 % in r4).
- **G5 (error-analysis Fix-it frame word): FIXED.** The Fix-it words come from the frame ("hundreds") on every item at S, M and L. The
  key is right on all 14 items.
- **E-r4-1 (identify lesson L p2 43 % empty, the page split): FIXED.** Guided cells are two across (`guidedCols`). L goes from 4 pages
  to 3, and L p2 is full to the foot.

## New findings

- **N-r5-1 (ENGINE-ROLES under D3, already in r4, measured for the first time): the identify lesson's L warm-up cells have a 31 % side band.**
  At L the warm-up places its two "Circle the place" cells two across (91.8 mm each). Each item ("T O / 5 6 / ones tens") is about
  38 mm of ink, which leaves 26.7 mm empty on each side (31 % ≥ 30 %, RUBRIC H13, C3 ≤ 6). r4 had the same layout. r4 graded it 8,
  but nobody ran ws-empty-band on the identify lesson role. lesson.js picks the column count. At L the cells would fit three across,
  or four as at S/M. Rule H13. Check: precritic should run `ws-empty-band --roles lesson` on every lane skill that has a lesson
  (`ws-empty-band --skill placevalue:identify --roles lesson --sizes L --hosts none` FAILs 2 today, pin included). Under D3 this
  does not hold pv.
- **N-r5-2 (ENGINE-ROLES, threshold, no grade change): the S/M identify vocab cell took the space Guided freed.** On S/M p2 the vocab
  match cell grew from 156 px (41 mm) to 192 px (50.8 mm). lesson.js gives the vocab band up to 30 % of a page's spare height
  (`capIfEmpty: 0.3`, lesson.js ~1721). All of the extra height sits under the word labels. The band under the ink is 57-58 px, which
  is **29.7-30.2 %** of the cell by pixel rows (r4: 21 px, 13.5 %). Above and below the ink together, about 43 % of the cell is now
  empty again: the E-A1 class, split into two bands. Inside the cell's padding (the ws-empty-band convention) the band is about
  24 %, so H13 holds. ws-empty-band does not measure this cell, because the vocab block is not a `[data-ws-cell]` and EB-VOCAB
  measures only the picture box. At L the band is 46 px of 193 px (23.8 %). Rule H13. Check: give EB-BAND the lesson vocab band, or
  have lesson.js send the spare to the page foot when the vocab row is already its measured height.
- No new pv-owned finding.

## VERDICT

- **placevalue:identify — VERDICT: PASS.** E-r4-1 is fixed. Every changed pv-owned page is 8 or better on every criterion at S, M and L.
  Under D3, the L p2 C3 6 (N-r5-1, warm-up column count) and N-r5-2 (vocab spare height) are ENGINE-ROLES and do not hold pv. Fix
  them in lesson.js.
- **placevalue:unit_form — VERDICT: PASS.** N-r4-1 is fixed with a 3-point margin (27 %). G5 is fixed at S, M and L and the keys are
  right. The rename=more pages at S score 8 on every criterion. The worksheet host's legacy band was not in this round.

### PNG list (root R above)

placevalue:unit_form:
- `R/B-S/placevalue__unit_form/{independent,more-practice,test,review}-p1.png` and `{…}-key-p1.png` (rename=more, S)
- `R/D/placevalue__unit_form/error-analysis-{S,M,L}-p1.png`, `error-analysis-{S,M,L}-key-p1.png`

placevalue:identify:
- `R/A/placevalue__identify/lesson-{S,M,L}-p{1,2,3}.png`, `lesson-{S,M,L}-key-p{1,2,3}.png`
