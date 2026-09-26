# Lessons r3 — independent critic grades (2026-09-26)

**Result: 38 of 48 pages pass** (r2 22, r1 4). 3 lessons × 2 sizes × 8 pages (chart, lesson sheet, practice, mixed, each
+ key); pass = C1–C4 all ≥ 8, no cap. Add-within-10 passes every page at both sizes; round-nearest-10 passes every page at
L. No H-cap fires anywhere. Tree `56eb699`; render `node tests/scripts/ws-lesson-samples.cjs --out
tests/audit-runs/critic-lessons-r3 --stats` (seed 4242, L + S, 110 dpi). Per-page grades: `grades.jsonl` (critic commit
95835cd).

| Lesson | Size | chart (+key) | lesson sheet (+key) | practice (+key) | mixed (+key) |
|---|---|---|---|---|---|
| add-within-10 | L | PASS 9 8 9 9 | PASS 9 8 8 9 | PASS 9 8 8 9 | PASS 9 8 8 8 |
| add-within-10 | S→M | PASS 9 8 9 9 | PASS 9 8 8 9 | PASS 9 8 8 9 | PASS 9 8 8 8 |
| subtract-2-digit-regroup | L | 9 7 9 8 | PASS 8 8 8 8 | PASS 8 8 8 8 | PASS 8 8 8 8 |
| subtract-2-digit-regroup | S→M | 9 7 9 8 | PASS 8 8 8 8 | PASS 8 8 8 8 | 8 7 8 8 |
| round-nearest-10 | L | PASS 9 8 9 8 | PASS 8 8 8 8 | PASS 9 8 8 9 | PASS 9 8 8 9 |
| round-nearest-10 | S→M | PASS 9 8 9 8 | PASS 8 8 8 8 | 9 8 7 8 | 9 6 8 9 |

## Measured
- Empty bands (pixel scan, grey < 215 = ink): no key cell reaches 30 % (largest 28–29 %). Pupil-page bands ≥ 30 % are only
  the open answer rows under column rules (19–28 % once written). H13 applies nowhere.
- Sizes (L / M): add digits 7.2 / 7.2; subtract digits 7.4 / 5.5; regroup box 8.1 / 6.9; subtract Guided answer box
  12.0 / 9.7; subtract practice answer row 20 mm; round Guided tens boxes 12.2 × 21.2 / 9.9 × 17.5; chart digits 9.2–9.7.
- Keys: on all 24 pairs every pupil-page pixel is on its key (true facsimiles); every answer, regroup, carry and Check
  checked arithmetically — none wrong.
- Accent #5B2A86 prints grey 66 vs trace 147 vs black 0; only on step numerals, circles, icons.
- S→M notice (live Chromium): shows under the Size control and in the fits box at 1280 / 820 / 390, goes away for
  Independent, no console errors. Nit: fits line says "46 problems on 3 pages" for ~13 (it counts item pools).
- Charts byte-identical at L and S; always L type.

## r2 defects re-checked
1. Chart drops its second example — fixed (add 2 + 5; subtract 70 − 23 "0 ones? Regroup a ten."; round 42 down, 55 ends
   in 5). New gap: root cause 1.
2. Round Guided — fixed (96 up, 54 down, 15 ends in 5; tens boxes 12.2 / 9.9 mm, 3 digits wide; given tens grey).
3. Weak mixed partners — fixed (2-digit carry additions, no 11 − 6; lesson skill half the page on 5 of 6). New: root
   causes 2 and 3.
4. Add Steps panel H13 — fixed (≤ 15 %).
5. Subtract practice L step strip — fixed.
6. Answer row / key drift — fixed.
7. Minor: fixed — add 3 + 0, "Check:" twice, minuend 36 twice, round step 1 black, round M 2 columns, S→M signal. Open —
   add chart step 2 no hops, number bonds headed "Number Sense", subtract M same 6 items as L, round warm-up wraps at M,
   M warm-up fact digits 1.3 × column digits.

## The checks asked for
- Anchor chart usable for every practice problem: add yes (except doubles 1 + 1, 2 + 2, 3 + 3 — no "big number"); round
  yes (90s → 100 not on the chart, Guided a models it); **subtract no** — never shows a one-digit take-away (67 − 9,
  78 − 9, 21 − 4, 22 − 5: 3 of 9 lesson items at L, 4 of 12 at M, plus Guided c) or an answer under 10 with the tens left
  blank (36 − 29 = 7).
- L6 steps / icons / Say match: yes. Keys complete and correct: yes. L3 no give-away: yes. L11 steps never squeezed (side
  panels 62–66 mm).
- **L10 pattern exists:** every place-value pair asks tens then ones; round Mixed M runs tens, ones, tens, ones.
- H13: none. Mixed: earlier skills only, sensible 2-digit partners; lesson skill ≥ half except round M (6 of 13).
- SPED sizes adequate; weakest subtract M (5.5 mm digits, 6.9 mm regroup, 9.7 mm answer box) and round Guided number
  lines (31–35 mm wide, 3 mm ticks).

## Defects by root cause (file)
1. **Subtract chart lacks a one-digit take-away** — `lessons/prereqs.js` (sub_100_regroup `second`), `sheet/roles/lesson.js`
   `chartPage` grid3. C2 = 7 on 4 chart pages. Step 4 only shows "5 − 1 = 4". Fix: other example 70 − 8 (0 in the ones and
   an empty tens place) or a third example; add "0 tens? Leave it empty."
2. **Subtract Mixed M repeats itself** — `print-sheet.js` `buildLesson` mixed (~1951), floors in `prereqs.js`. C2 = 7 on 2
   pages. 21 − 4 and 22 − 5 both 17; 51 − 44 ≈ 53 − 45; 96 − 18 copied from Practice e; 3 of 6 one-digit take-aways. Fix:
   distinct answers, no Practice repeats, ≤ 1 one-digit take-away per page (also helps Mixed L).
3. **Round Mixed M** — `print-sheet.js` `buildLesson` mixed (~1951–1958), `gen-pv.js` 182–184. C2 = 6 on 2 pages. Lesson
   skill 6 of 13 (weight `withSkills.length + 0.5` not enforced after packing); pv items cycle tens / ones (`blockOrder`
   same order every block). Fix: lesson skill ≥ half the placed items; shuffle the asked place per item seed.
4. **Round practice M prints 18** — `print-sheet.js` 1924 `dense: rounding ? { S: 18, M: 18, L: 15 }` with `noCap`. C3 = 7
   on 2 pages; over the 12.1 ceiling (16) and the lesson's own 15. Fix: 15 at every size.
5. **Minor (fail no page)** — add: no hops in chart step 2, no doubles rule, Guided "+ 2" twice, Independent M turnaround
   1 + 9 / 9 + 1, bonds headed "Number Sense". Subtract: Guided "− 39" twice, open rows on Practice vs boxes on Guided, M =
   L items, warm-up digit sizes 1.3 ×. Round: 90s → 100 not on chart, other-example answers small and bold, Guided line
   31 mm, warm-up wraps at M. Subtract and round: Rule boxes have rounded corners.

## Top fixes by pages recovered
| # | Fix | File | Pages |
|---|---|---|---|
| 1 | Subtract chart: one-digit take-away example (70 − 8) | `lessons/prereqs.js`, `sheet/roles/lesson.js` | 4 |
| 2 | Subtract Mixed: distinct answers, no Practice repeats, ≤ 1 one-digit take-away | `print-sheet.js`, `lessons/prereqs.js` | 2 |
| 3 | Round Mixed: lesson skill ≥ half; shuffle the place-value target | `print-sheet.js`, `gen-pv.js` | 2 |
| 4 | Round practice: 15 at every size | `print-sheet.js` 1924 | 2 |

Fixes 1–4 recover all 10 failing pages.
