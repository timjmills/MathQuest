# lf-placevalue critic r4 — narrow re-grade (independent critic, Opus medium)

Branch `claude/lf-placevalue-r4`, code at 98fb4236 (HEAD 8d630ae2 adds only the brief). Renders under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r4/` (root R below), one browser
command at a time, print only (`--no-screen`; the screen hosts are unchanged by this round). Grades from r3 / r3b / r3c STAND for
every page not listed here. Every PNG below was looked at; numbers are measured (pixels at 96 dpi, 1 px = 0.265 mm, and
`ws-empty-band` DOM measures).

## Byte comparison against the graded rounds

- identify lesson (R/A): only p2 and key p2 changed at S, M and L. p1, p3, L p4 and their keys are byte-identical (cmp) to
  `critic-r3c/lessons/placevalue__identify/`. S p2 = M p2 (md5 f03b47…): lesson S = M is ENGINE E1, as before.
- unit_form lesson (R/C): only p2 and key p2 changed. p1, p3 and keys are byte-identical to `critic-r3b/main/placevalue__unit_form/`.
- unit_form rename=more independent L (R/B-ML): byte-identical to `critic-r3b/opt-uf-more/…/independent-L-p1.png` (the change is
  S only, as the brief says).

## Grade table (C1-C2-C3-C4)

| Page | S | M | L | Measured |
|---|---|---|---|---|
| identify lesson p2 (vocab + warm-up) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Vocab cell is now 40.5 mm tall at S/M (was 60.9 mm), 41.5 mm at L (was 65.1 mm). Top band above the ink 6.1 mm at S/M (was 26.5 mm), 5.6 mm at L (was 28.6 mm); empty fraction of the cell 28 % (S/M), 20 % (L). The "ones" picture is 4 unit squares in one row (each about 3.2 mm, span 17.5 mm). Matches: "4 7 2" -> digit, "H T O" -> place, squares -> ones; one right line each (key p2 checked at M and L). Warm-up unchanged. ENGINE: L p2 ends at y 653 px, so the page body below it is about 43 % empty (lesson.js page split; was 33 % in r3c, it grew because the vocab row shrank and p3 does not reflow up) |
| identify lesson p1, p3, L p4, keys | r3c stands (8-8-8-8) | same | same | byte-identical |
| identify lesson key p2 / key L p3 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Guided 175 -> ones / 5, 629 -> tens / 20; independent 714 -> hundreds 700, 472 -> tens 70, 166 -> hundreds 100; 17 = 1 ten 7 ones, 93 = 9 tens 3 ones. All right |
| unit_form rename=more independent | 8-8-8-8 | 8-8-8-8 (control) | 8-8-8-8 (r3b, byte-identical) | S: 15 rows (1 x 15). "539 = ____ tens 9 ones" ink spans x 258-536 px (was 265-528); write line 28.6 mm. ws-empty-band EB-SIDE max 29.9 % (53.5 mm of a 178.9 mm inner width; r3b was 30-31 %, 54.3 mm). "7 hundreds 12 tens = ____" rows 29.2-29.3 %. M max 25.8 %, L 20.2 % |
| unit_form rename=more more-practice | 8-8-8-8 | - | - | S 15 rows; EB-SIDE max 29.2 % |
| unit_form rename=more test | 8-8-8-8 | - | - | S 12 rows; EB-SIDE max 29.9 % (M 25.8 %, L 20.2 % by ws-empty-band). Key right: 554 -> 55, 1 hundred 10 tens = 200, 2 h 19 t = 390, 466 -> 46, 7 h 15 t = 850, 795 -> 79, 6 h 18 t = 780, 707 -> 70, 1 h 18 t = 280, 251 -> 25 (tens 1 one), 5 h 10 t = 600 |
| unit_form rename=more review | 8-8-8-8 | - | - | S 10 rename rows + 6 Mixed Review cells (600 + 10 + 1 = ___ …); EB-SIDE max 29.9 % (M 25.8 %, L 26.4 %); mixed cells 7-9 % |
| unit_form lesson p2 (vocab + warm-up) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Vocab: "300", 3 ten-rods, 4 unit squares (now one cube tall). Key: 300 -> hundreds, rods -> tens, squares -> ones; one right match each. Vocab cell 65.6 mm (S/M) / 68.5 mm (L): the rods set its height; the squares no longer reserve rod height. Bottom of p2 at y 989 (S) / 999 (L) px, above the footer. Warm-up keys right (129 tens, 658 ones, 871 hundreds, 573 ones; 79 = 7 t 9 o, 97 = 9 t 7 o; guided 213, 424) |
| unit_form lesson p1, p3, keys | r3b stands | same | same | byte-identical |
| unit_form error-analysis (out of bar, info) | 8-6-8-8 (r3b) | - | - | G5 still present (see below) |

`ws-empty-band --skill placevalue:unit_form --opts '{"rename":"more"}' --roles independent,more-practice,test,review --sizes S,M,L
--hosts none`: OK (EB-BAND, EB-SIDE, EB-FOOT, EB-READ, EB-VOCAB all PASS). With hosts on, EB-BAND FAIL 1 on the worksheet host
at 1280 px (cell 1, 32.0 %, `[legacy]`): a screen-host legacy item, not changed by this round; the screen hosts' r3 grades stand.

## Finding status

- **E-A1 (identify lesson p2 vocab top band 43-44 %): FIXED.** Top band 6.1 mm / 5.6 mm, cell empty fraction 28 % (S/M) and
  20 % (L), under H13's 30 %. The unit_form lesson's ones picture is compact too.
- **G2 (unit_form rename=more S, H13 width, C3 6): FIXED, at the limit.** EB-SIDE is 29.9 % at worst on independent, test and
  review S (more-practice 29.2 %); r3b measured 30-31 % and the gate failed on 8 of 15 cells; it now passes. The margin is 0.1 pp
  (see N-r4-1). M and L controls pass (25.8 % / 20.2 %); L is byte-identical to r3b.
- **G5 (unit_form error-analysis Fix-it frame word, out of bar): STILL HOLDS.** Item 1 "193 = 100 hundreds 90 tens 3 ones" prints
  the Fix-it frame "[ ] hundred [ ] tens [ ] ones": the singular "hundred" tells the pupil the answer is 1. Items 2-6 print
  "hundreds". Information only; it does not hold the verdict.

## New findings

- **N-r4-1 (pv, minor, no grade change): G2 passes by 0.1 percentage point.** The S rename row grew by 15 px (4 mm). The widest side
  band went from 54.3 mm to 53.5 mm of a 178.9 mm inner width (29.9 %). Any glyph-metric or padding change flips it back to FAIL.
  Rule: RUBRIC H13 (measured; it passes as measured, as r3b passed the 29 % rows). Suggest the L-width write line (40 mm) at S, or
  2 columns. Check: `ws-empty-band` should print a NEAR warning for EB-SIDE / EB-BAND between 28 % and 30 % so a lane sees
  threshold-hugging fixes before a critic.
- **E-r4-1 (ENGINE-ROLES, lesson.js page split): identify lesson L p2 is about 43 % empty under the warm-up** (content ends at
  y 653 of a body that runs to about y 1040). It was 33 % in r3c; the shorter vocab row freed space that the next page's Guided
  block does not move into. Ruled ENGINE by D3 (lesson.js page split); not counted against pv. Check: ws-empty-band EB-FOOT on the
  lesson role at L (it passes today, so its page-foot limit does not see a lesson page's last section).

## VERDICT

- **placevalue:identify — VERDICT: PASS.** E-A1 fixed; lesson p2 8 or better at S, M and L on every criterion; every other identify
  page keeps its r3 / r3c grade (all pv-owned grades 8 or better).
- **placevalue:unit_form — VERDICT: PASS.** G2 fixed (EB-SIDE 29.9 % at worst, gate green); the rename=more pages at S and the M / L
  controls are 8 on every criterion; the lesson's reflowed p2 is 8 at S, M and L; every other unit_form page keeps its r3 / r3b
  grade. G5 is out of bar and still open; N-r4-1 should be hardened.

### PNG list for placevalue:identify (PASS)

Root R = `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r4/`
- `R/A/placevalue__identify/lesson-{S,M}-p{1,2,3}.png`, `lesson-L-p{1,2,3,4}.png`
- `R/A/placevalue__identify/lesson-{S,M}-key-p{1,2,3}.png`, `lesson-L-key-p{1,2,3,4}.png`
- plus the r3 / r3c renders for every other identify page.

### PNG list for placevalue:unit_form (PASS)

- `R/B-S/placevalue__unit_form/{independent,more-practice,test,review}-p1.png` and `{…}-key-p1.png` (rename=more, S)
- `R/B-ML/placevalue__unit_form/independent-{M,L}-p1.png`, `independent-{M,L}-key-p1.png` (controls)
- `R/C/placevalue__unit_form/lesson-{S,M,L}-p{1,2,3}.png`, `lesson-{S,M,L}-key-p{1,2,3}.png`
- `R/D/placevalue__unit_form/error-analysis-p1.png` (G5, information)
- plus the r3 / r3b renders for every other unit_form page.
