# chart_120 fix — precritic diff, branch vs clean master (2026-11-13)

Branch `claude/sweet-newton-c8wrv1-lf-builds` merged with origin/master `8a50aa9d9` (824ace90c). Master = a clean
`origin/master` worktree (`8a50aa9d9`) with the signed card `design/cards/chartwindow/` copied in (master has no card, so
its gates would fall back to the 9 default roles; the copy makes the render plan identical). Logs: `logs/`.

Lead rule: red on master is baseline only when the count is IDENTICAL on the branch and pinned with evidence; a count that
rises is the lane's. No sibling exemption (L23).

## r1 (before this fix round, branch 824ace90c)

| Gate | master | branch (hcf) | branch (chart_to_120) | new? | action |
|---|---|---|---|---|---|
| node-lint LESSON-DATA / OPTION-HELP / WRONG-FITS | 2 (LESSON-DATA, OPTION-HELP band 6) | 1 (LESSON-DATA) | 1 (LESSON-DATA) | hcf: no (fell 2 → 1); c120: yes | pinned LESSON-DATA for both with evidence: card §7a `role:lesson` signs the FALLBACK lesson ("this role must still pass on the fallback warm-up"); the Count on to 120 lesson is the lessons-first engine's |
| empty-band EB-FOOT | 60 | 60 (identical lines) | 36 (default roles only) | c120: yes | ROOT: the tool read a centred cell's row stretch as drawn height (chartwindow is `justify-content: safe center`; 59 mm of window in a 76.5 mm row reads "drawn 67.5"). Tool fix: centring comes off EB-FOOT; the white above + under is ONE band for EB-BAND (self-test). → 0 |
| empty-band EB-SIDE (review S, pre-skill-check S, `counters` cells of the earlier skills) | 4 | 4 (identical) | 0 | no | not a chartwindow cell: the Review / Pre-skill pages deal earlier skills (count_objects counters at 30.5 % of the width). Baseline-identical; open for the counters owner |
| empty-band EB-EDGE true-false L | 0 | 0 | 1 (`1,011` across the square) | yes | ROOT: 'writes-ten-ten' (1011) is 4 digits = 17.7 mm at L in a 17 mm square, printed with a comma. Not dealt in a chart square any more; WRONG-FITS now judges chart squares (backtest c120-wrong-fits) |
| cell-checks TAGINK error-analysis L | 4 | 4 | 8 (after the card-plan fix) | c120: yes | ROOT: the A / B tag sat on the written number's text box. `css/sheet-kit.css` gives a lettered chart square its tag's height of top room (backtest c120-tagink) |
| cell-checks OVERFLOW lesson {band: 10} | 54 | 54 | — (band set by the preset) | no | ROOT: the fallback lesson drew a 170 mm row of ten in a 92 mm anchor-chart panel and beside the Steps. lesson.js `chartDataOf`: a fallback lesson whose example is wider than half the page takes `chartWide` → 0 |
| cell-checks OVERFLOW lesson {grid: rows}, lesson {grid: whole}, guided {grid: whole} | 66 + 72 + 32 | identical | 54 + 72 + 32 (after card-plan fix) | c120: yes (same root) | OPEN, root cause below (engine) |
| sibling-compare NO-SIBLING (13 matrix rows: PAGEFILL / DN-2 / PG-23 on sections/*) | n/a | 13 | 13 | — | first family on the chartwindow template (LESSONS_LEARNED process rule 2026-11-07): recorded SKIPPED "first family on template; critic grades the named pages"; pages listed for the critic |
| cell-checks KEYJOIN true-false | 0 | 0 (was 8 before the master merge) | 0 | — | fixed on master (merge) |

## Tool gap found on the way (fixed): the preset was never graded on its card

`composing:chart_to_120` had no card of its own, so every card-plan gate fell back to 9 default roles and no option
values: opener, scripted-model, pre-skill-check, mixed-practice, stretch and grid=rows / whole at band 120 were never
rendered. `tests/lib/ws-card-plan.mjs` now plans a preset from its host's signed card (roles and hosts, the host's other
option values over the preset's own); self-test case added.

## OPEN — root cause, not fixed (two roles × two option values; master-identical on hundreds_chart_fill)

1. **grid=whole on lesson / guided** (and grid=rows on lesson): the whole chart is one cell to a page by design (195 mm of
   squares: 19.5 mm × 10 rows, 16.25 × 12). Guided puts a Steps band and the Model's three work lines on the same page
   (model cell 232 mm > page); the lesson's anchor chart draws FOUR states of it (and of the 3 × 10 rows chart). Content
   never shrinks, so no cell size fixes it. Needs a lead / owner ruling: either the card hides grid=whole (and rows) on
   lesson / guided (a §7a amendment), or the anchor chart and Guided Model draw the window around the gaps instead of the
   whole chart (engine).
2. **Guided Model row (EB-BAND, now measured)**: a 3 × 5 window beside the Model with its three work lines sits in a
   115 mm row: 42 % white around it at M, 36 % at L (hcf and chart_to_120 alike; master too once the band is measured both
   sides). Guided's sheetFit drops the spanning Model whenever it costs page 1 its third try (round-4 rule). Engine.
3. **cell-checks --card-opts covers option values on 5 roles only** (lesson, independent, guided, test, review): band 10
   on opener and reason-it overflows (10 findings, master too), found by a backtest command. PROPOSED: every card role.
4. **writes-ten-ten** (card §3 / §7a error-analysis line) is no longer dealt: four digits do not fit a chart square at L.
   The card line needs the lead's ruling (drop it, or deal it only where a square holds four digits).
