# Lessons r4 — independent critic grades (2026-09-26)

**Result: 48 of 48 pages pass at seed 4242** (r3 38, r2 22, r1 4). Tree `f7ead37`; render
`node tests/scripts/ws-lesson-samples.cjs --out tests/audit-runs/critic-lessons-r4 --stats` (seed 4242, L and S, 110 dpi),
plus full renders at seeds 1001 and 777 and an items-only sweep over 25 seeds. Pass = C1–C4 all ≥ 8, no cap. No H-cap
fires anywhere. Per-page grades: `grades.jsonl` (48 page lines + 3 robustness lines not counted).

| Lesson | Size | chart (+key) | lesson sheet (+key) | practice (+key) | mixed (+key) |
|---|---|---|---|---|---|
| add-within-10 | L | PASS 9 9 9 9 | PASS 9 8 8 9 | PASS 9 8 8 9 | PASS 9 8 8 8 |
| add-within-10 | S→M | PASS 9 9 9 9 | PASS 9 8 8 9 | PASS 9 8 8 9 | PASS 9 8 8 8 |
| subtract-2-digit-regroup | L | PASS 9 8 9 8 | PASS 8 8 8 8 | PASS 8 8 9 8 | PASS 8 8 8 8 |
| subtract-2-digit-regroup | S→M | PASS 9 8 9 8 | PASS 8 8 8 8 | PASS 8 8 8 8 | PASS 8 8 8 8 |
| round-nearest-10 | L | PASS 8 8 9 8 | PASS 8 8 8 8 | PASS 9 8 8 9 | PASS 9 8 8 9 |
| round-nearest-10 | S→M | PASS 8 8 9 8 | PASS 8 8 8 8 | PASS 9 8 8 9 | PASS 9 8 8 9 |

**Not yet seed-proof:** subtract Practice at L, seed 1001 scores 8 7 9 8 (fail); three repeat-avoidance rules do not hold
across seeds (root causes 1–2).

## Measured
- Empty bands: no key content cell reaches 30 % (except 18 × 18 mm single-digit answer boxes 32–38 % and the round Guided
  strip width 32 %); pupil-page bands ≥ 30 % are only open answer rows (34–41 %, 20–28 % once written). H13 nowhere; page
  foot ≤ 7 %.
- Sizes (L / M): add digits 7.4 / 7.4 (6.0–6.5 in the Mixed fact row); subtract digits 7.4 / 6.0, regroup box 8.1 / 6.9,
  Guided answer box 12.0 / 9.7, Practice answer row 19.6 / 15.7; round digits 7.4, answer line 23, Guided tens boxes
  12.5 × 21.2 / 9.9 × 17.8, Guided number line 31 / 35 wide; chart digits 6.2–7.6, round chart other-example answers 3.7.
- Items (L / M): Practice add 12 / 16, subtract 6 / 6, round 15 / 15; Mixed add 12 / 12, subtract 6 / 9, round 11 / 11.
  Lesson skill ≥ half of every Mixed page in all 150 sweep builds.
- Keys: 0 pupil ink pixels missing from any of 24 keys (true facsimiles); every answer, regroup, carry, Check, bond,
  count and vocabulary recomputed — none wrong.
- Accent: only hue 271–273°; #5B2A86 prints grey 66 vs 147–153 trace grey and 0 black; step numerals, circles, icons only.
- 15 rounding items in L type at every size: acceptable for the pupil (under the 12.1 ceiling of 16; 7.4 mm digits in
  61 × 40 mm cells; bands ≤ 28 %); not signalled to the teacher (the S note says "printed at Medium"; fits note "Dense:
  3 x 5") — minor.

## r3 defects re-checked
1. Subtract chart one-digit take-away — fixed (60 − 3 = 57, 5 | 10, empty tens place; rule "0 tens? Leave it empty." —
   words only, no panel draws a blank-tens answer).
2. Subtract Mixed M repeats — mostly fixed (distinct answers, nothing from Practice, one one-digit take-away); still 51 − 44
   and 53 − 45 near twins, 51 twice (also in 51 + 19).
3. Round Mixed M — fixed (6 of 11; the asked place varies by seed).
4. Round practice 18 at M — fixed (15 at every size, L type).
5. Minor — fixed: add chart hops, doubles rule, round 90s → 100, Guided no repeated addend / subtrahend, fits line counts
   problems. Open: bonds headed "Number Sense"; subtract Practice answer rows vs Guided boxes; subtract M = L six items;
   warm-up digit sizes differ 1.35 ×; round chart other-example answers small and bold; round Guided line 31 mm; round
   warm-up instruction wraps at M; Rule boxes rounded.

## Checks asked for
- Anchor chart covers every practice case: add yes (incl. doubles); round yes (43 down, 55 ends in 5, 98 → 100; practice
  never deals 0 in the ones, < 10 or 3-digit over 25 seeds); subtract yes for 2-digit regroup, one-digit take-away and 0 in
  the ones, but answers under 10 rest on one bold sentence — 21 of 25 seeds deal one, seed 1001 deals four.
- L6 steps / icons / Say match at all three seeds. Keys complete, correct, facsimiles. L10 no pattern. L11 none (62–66 mm
  step lists). H13 nowhere.
- L3: nothing on a page gives its own answer away, but a Practice item can equal a chart worked example (add 1 + 6, round
  55) on 12–16 of 25 seeds.
- Mixed: earlier skills only, lesson ≥ half, distinct within a page but not across the packet.
- SPED sizes adequate; weakest subtract M (6.0 mm digits, 6.9 mm regroup) and round chart other examples (33 mm lines,
  3 mm ticks, 3.7 mm answers).

## Defects by root cause (file)
1. **Subtract answers under 10 frequent but only described** — `sheet/roles/lesson.js` chartPage grid3,
   `lessons/prereqs.js` sub_100_regroup, `print-sheet.js` refAccepts. Seed 1001: 4 of 6 answers < 10, near twins
   62 − 59 / 64 − 59 and 27 − 19 / 77 − 19; 11 of 25 seeds repeat a number taken away. Fix: draw a blank-tens answer on the
   chart; ≤ 2 answers under 10 a page; no repeated subtrahend, no near twins.
2. **Repeats across the packet** — `print-sheet.js` buildLesson: avoid / no-turnaround rules are per page. Practice deals a
   chart example (add 12–15 / 25 seeds, round 16 / 25); add Mixed repeats a Practice fact (5 / 25 at L, 13 / 25 at M) and a
   turnaround on 24–25 / 25; Mixed repeats lesson-sheet items (add 2 + 3 and the 6 squares, round 96); add M lesson-sheet
   Independent repeats 3 Practice facts. Fix: one used-item set for the whole packet, seeded with the chart examples,
   turnarounds included.
3. **Mixed row sizing** — `sheet/roles/mixed-practice.js`: add fact row 60 mm at L (27 % bands) and 43 mm at M with
   6.0–6.5 mm digits; addition columns carry an empty hundreds column; bond section headed "Number Sense".
4. **Round chart other examples small** — `lesson.js` chartPage: 33 mm lines, 3.7 mm bold answers.
5. **Teacher signal** — `print-sheet.js` 1942–1983: nothing says rounding practice prints at Large.
6. **Minor** — rounded Rule boxes (`lesson-css.js`); round Guided key draws a dot and hop never asked for; subtract warm-up
   two layouts in one band; subtract Practice rows vs Guided boxes; round warm-up wraps at M.

## Top fixes
| # | Fix | File | Effect |
|---|---|---|---|
| 1 | Cap subtract answers under 10 (≤ 2 a page); no repeated subtrahend or near twins; draw a blank-tens answer on the chart | `lessons/prereqs.js`, `print-sheet.js`, `sheet/roles/lesson.js` | seed-1001 Practice passes; every case drawn |
| 2 | One avoid set for the whole packet, turnarounds included | `print-sheet.js` buildLesson / refAccepts | removes copyable answers and repeats on 12–25 of 25 seeds |
| 3 | Mixed rows sized to content; no hundreds column within 100 | `sheet/roles/mixed-practice.js`, `sheet/cells/stack.js` | add and subtract Mixed C3 → 9 |
| 4 | Enlarge round chart other examples; signal rounding practice prints at Large | `sheet/roles/lesson.js`, `print-sheet.js` | round chart C1 → 9 |
