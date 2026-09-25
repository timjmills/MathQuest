# Lessons r2 — independent critic grades (2026-09-25)

**Result: 22 of 48 pages pass** (r1: 4 of 48). 3 lessons × 2 sizes × 8 pages (chart, lesson sheet, practice, mixed, each
+ key); pass = C1–C4 all ≥ 8 and no cap. No lesson passes at every page. Tree `67ccdc9`; render
`node tests/scripts/ws-lesson-samples.cjs --out tests/audit-runs/critic-lessons-r2 --stats` (seed 4242, L + S, 110 dpi,
greyscale charts). Per-page scores and defects: `grades.jsonl` (critic commit 413aa34).

| Lesson | Size | chart (+key) | lesson sheet (+key) | practice (+key) | mixed (+key) |
|---|---|---|---|---|---|
| add-within-10 | L | PASS 9 8 9 9 | 8 8 6 8 (H13) | PASS 9 8 8 9 | PASS 9 8 8 9 |
| add-within-10 | S→M | PASS 9 8 9 9 | 8 8 6 8 (H13) | PASS 9 8 8 9 | PASS 9 8 8 9 |
| subtract-2-digit-regroup | L | 9 7 9 9 | 8 8 7 8 | 8 7 8 8 | 8 7 8 8 |
| subtract-2-digit-regroup | S→M | 9 7 9 9 | PASS 8 8 8 8 | PASS 8 8 8 8 | PASS 8 8 8 8 |
| round-nearest-10 | L | 9 7 8 8 | 7 7 8 8 | PASS 9 8 8 9 | 9 7 8 9 |
| round-nearest-10 | S→M | 9 7 8 8 | 8 7 8 8 | PASS 9 8 8 9 | 9 7 8 9 |

(C1 C2 C3 C4; each key carries its pupil page's scores.)

## r1 defects re-checked
- Chart panels (H13): fixed (bands ≤ 27 % add, ≤ 13 % subtract, ≤ 18 % round); chart at L type at both sizes.
- Number line after the chart (round): fixed; the given tens in Guided cell 1 still print black, not grey.
- Examples and steps: mostly fixed (add 4 + 3 then 2 + 5; practice answers 3–10, 3 of 12 are 10; icons distinct; Check
  line on every subtract item). Still open: round chart step 1 adds no grey mark.
- Keys fill regroup / carry boxes and Check lines (H1): fixed; every answer checked arithmetically.
- Regroup box: fixed (8.1 mm at L, 6.7–7.2 mm at M; ones box two digits wide).
- Practice blank areas and gutters: fixed (one frame, no cell > 28 % empty).
- Mixed practice untaught skill: fixed, but the partner items are weak (root cause 3).
- Minor: icons solid; accent reads in greyscale (tone 66 vs trace grey 147 and black 0). Vocabulary cubes 3.7 mm (were
  2.3); S warm-up fact digits 1.3 × the column digits (were 2 ×).

## The checks asked for
- **I Do chart usable for the rest of the problems:** add yes; subtract and round no — each chart shows one case only.
  The lesson data names a second example (0 in the ones; rounding down) but `chartPage` drops it for room and enlarges
  the panels instead, and practice then deals exactly those cases.
- **Steps / icons / Say match the items (L6):** yes, except the subtract practice page at L has lost its step strip.
- **Keys fill boxes, answers correct:** yes.
- **Answer given away (L3):** no.
- **Empty band ≥ 30 % (H13):** only the add lesson sheet's Steps panel (37 % at L, 46 % at M).
- **S printed at M:** acceptable (S was unreadable in r1; at M column digits 5.5 mm, regroup box 6.7–7.2 mm, answer box
  9.9 mm). **Not signalled:** the note is only in `res.notes` (`print-sheet.js` ~1862); `teacher-print.js` shows only
  `fits.note` (783, 832); the S button stays selectable; the page has no size marker. Fix: show `res.notes` in the
  print panel, or disable S for the Lesson role with the reason as its tooltip.
- **Mixed uses earlier skills only:** yes.
- **SPED sizes:** working digits 7.2 mm at L, 5.5 mm at M; chart digits 9.5 mm. Round Guided tens boxes 10.4 × 7.2 mm
  (below the 10 mm writing height at L); subtract answer row 9.9 mm at L (spec 12) and 9.0 mm at M (spec 10).

## Defects by root cause (file to change)
1. **The chart drops its own second example** — `sheet/roles/lesson.js` `chartPage` (~732). When panels + "Another
   example" row do not fit, the row goes and the room enlarges the panels. Subtract never shows a 0 in the ones (Guided
   80 − 3, practice 50 − 36); round never shows rounding down (5 of 15 practice items) or a number ending in 5.
   C2 = 7 on 8 pages. Fix: reserve the row first, then enlarge panels into what is left (7–18 % spare per panel; round
   chart 6 % blank at its foot).
2. **Round Guided Practice** — `lesson.js` guided selection + rounding cell: two cells, both round up (96 → 100,
   47 → 50); tens boxes 7.2 mm tall; given tens in cell 1 black. C2 = 7 on 4 pages, C1 = 7 at L. Fix: three cells (up,
   down, ends in 5), tens boxes as tall as the answer strip (9.6 / 12 mm) and 3 digits wide.
3. **Weak mixed-practice items** — `lessons/prereqs.js` 143 and 106, mixed item counts in `print-sheet.js`. Round mixed:
   add_100_regroup deals 2 + 8, 6 + 4 in a two-box carry scaffold (L4). Subtract mixed at L: only 2 of 8 items are the
   lesson skill, one is 11 − 6 regrouped as "0 | 11". C2 = 7 on 6 pages. Fix: partner skill with 2-digit operands;
   lesson skill at least half the page.
4. **Add Steps panel empty at the foot (H13)** — `lesson.js` Guided band (~858–884): 37 % at L, 46 % at M. C3 = 6 on
   4 pages. Fix: size the band to its cells, or put the Remember line or the 2 + 5 strip in it.
5. **Subtract practice at L loses its step strip** — `print-sheet.js` 1900–1903 rebuilds without the strip when six L
   cells + strip do not fit. C2 = 7 on 2 pages. Fix: shorten cells by the strip height (~10 mm spare at each cell top).
6. **Subtract answer row too short; key drifts from the pupil page** — `sheet/cells/stack.js` answer row + `lesson.js`
   warm-up band. Answer row 9.9 mm L / 9.0 mm M; L warm-up c–d get 10.6 mm while a–b get 22 mm; the key redraws each
   problem ~5.8 mm higher and its Check line lower. C3 = 7 on the 2 subtract lesson sheets at L, minor on 12 pages. Fix:
   reserve the full answer row (12 / 10 mm) on the pupil page so page and key share one layout.
7. **Minor** — add: 3 + 0 and 0 + 3 under "add 1–3"; chart step-2 drawing has no hops; number-bonds section headed
   "Number Sense". Subtract: "Check:" twice on the step-5 line; minuend 36 used twice; M prints the same 6 items as L.
   Round: chart step 1 black not grey; warm-up instruction wraps at M; M prints 2 columns where L prints 3. S→M switch not
   signalled.

## Top fixes by pages recovered
| # | Fix | Pages |
|---|---|---|
| 1 | Reserve the chart's "Another example" row before enlarging panels | 8 |
| 2 | Round Guided: 3 varied cells, full-height tens boxes | 4 |
| 3 | Mixed partner items: 2-digit addition; lesson skill ≥ half the page | 6 |
| 4 | Fill or shrink the add Steps panel | 4 |
| 5 | Keep the step strip on subtract practice at L | 2 |
| 6 | Full answer row on the pupil page for column problems | 2 |

Fixes 1–6 together recover all 26 failing pages.
