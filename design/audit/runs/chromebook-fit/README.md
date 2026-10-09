# Chromebook fit (lane, 2026-10-09)

Owner goal: at 1366 x 650 and 1280 x 600 of visible page, during pupil play (the practice card, boss, race, the online
worksheet and the quiz), the problem, its answer box and Check / Next show without scrolling for typical skills.

- Code: `css/play-compact.css`, `js/modules/play-compact.js`, plus small changes in `js/modules/active-box.js`,
  `js/modules/quiz-take.js` (a typed answer is recorded in place) and `js/modules/progress.js` (the notice gets a class).
- Gate: `node tests/scripts/ws-chromebook-fit.cjs`. Last full run: `fit-full.log` (OK).
- Critic: `CRITIC-R1.md` (FAIL), `CRITIC-R2.md` (FAIL, quiz), `CRITIC-R3.md` (PASS, 8+ on every cell).
- Screenshots: `shots/`.

## Before and after: bottom of the first answer box at 1366 x 650 (viewport bottom = 650)

| Skill | Card before | Card after | Quiz before | Quiz after | Worksheet cards in full, after |
|---|---|---|---|---|---|
| addition:add | 879 | 391 | 705 | 360 | 6 |
| addition:add_column_multi | 999 | 512 | 892 | 547 | 3 |
| subtraction:subtract | 879 | 391 | 705 | 360 | 6 |
| multiplication:mult_facts | 879 | 391 | 705 | 360 | 6 |
| division:long_div_2digit | 731 | 243 | 563 | 218 | 2 |
| counting:count_objects | 791 | 303 | 685 | 341 | 3 |
| addition:add_wp_10 | 1193 | 706 (tall: scrolls, box brought into view) | 890 | 545 | 0 |
| addition:number_line_add | 934 | 446 | 766 | 421 | 1 |
| graphs:bar_graph | Check at 1006 | 279 | Check at 1596 | 876 (tall) | 0 |
| fractions:identify | 880 | 393 | 802 | 457 | 3 |

Before = commit 4970e4b, measured with the same gate.
