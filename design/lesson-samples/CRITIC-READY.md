# Short lessons: Prerequisite Check ON (lf-engine PC round, 2026-11-12)

Rendered with the check forced on (`node tests/scripts/ws-lesson-samples.cjs --force-check`, buildSheet `prereqsForce`;
the committed records keep `prereqsLive: false` until this critic passes). Seed 4242. L in `<packet>/`, S printed at M in
`<packet>/S/`, for add-within-10, subtract-2-digit-regroup and round-nearest-10.

| File | Page |
|---|---|
| pupil-p1 | Prerequisite Check (one page) |
| key-p1 | its key |
| key-p2 | routing page "Prerequisite Check: where next" |
| pupil-p2 / key-p3 | anchor chart (and chart-grey.png) |
| pupil-p3 / key-p4 | lesson sheet (Vocabulary, Remember, We Do, Independent) |
| pupil-p4 / key-p5 | Practice |
| pupil-p5 / key-p6 | Mixed |

## What changed since r2 (7744c2b4)
- **One-page check (lead ruling A, LR-17a (2))**: after the N2 floor the check ran to two pages at L (all three) and at S
  (add). Now a question that is not two-choice may print ONE item when two do not fit; two-choice questions (compare,
  "circle ones or tens") always keep 2; the question whose drop saves the most height gives first; an item that costs no
  height is taken back. Gate: PC-PAGES, backtest `lesson-check-one-page`.
- **N5**: no item 3+ across may wrap past 1.15 x its one-column height (`ROUTE_REFLOW`): round S "10 more than 30 is __"
  no longer wraps onto its tab.
- **N6**: a paired row's strips take the taller height (add Q1 / Q2: "Count. Write the number." beside a two-line strip).
- **N7**: the sub check title keeps a topic ("Prerequisite Check: subtracting with regrouping", `checkTopic`).
- **N8**: sub sheet Independent column subtractions keep the T O heads and the answer boxes Guided draws (LR-17b
  `indepFrame`).
- **PC-SCAFFOLD**: the sub check's column subtractions print plain at level 0 (no heads, no answer boxes).
- **PC-NAME**: sub Q2 / Q4 `checks` text rewritten.
- Routed cells are centred (a lone item no longer sits at the top of a 31-37 % band); tag padding 0.8 mm (cell gap 16 -> 15 mm).
- **Practice / Mixed fill: unchanged (decision).** Practice keeps the one-number ceiling of 15 (WORKSHEET_DESIGN_STANDARD
  12.1 / PAGE_TYPES Independent: whole rows, never a smaller cell to fill the page); round L Practice still shows a 49 %
  band inside its rounding cells - left for the critic to rule on, no page-type rule asks for more items.

## This pass (lf-engine PC fix, 2026-11-13; check pages and their keys only - every other page unchanged)
- **LR-6**: the sub check no longer prints 11 - 3 twice or 39 twice: a routed question drops an item whose given numbers
  repeat an earlier one (`itemNumberKey`). Sub Q2 now prints one expanded form, Q3 three subtractions. Gate PC-LR6,
  backtest `lesson-check-lr6`.
- **H13**: routed cells are now really centred (CL-4b's top start was winning over `mq-lvcenter`) and drop CL-40's tab
  spacer where the content clears the tab; rows grow up to 1.15 x, capped so a centred item's band stays under 29 %
  (LR-17a (5) updated). Cleared: add L cell 2 (38 %), sub L lone expanded form (32 %), round L cell 8 (31 %), sub S check foot.

## Known open (`ws-lesson-samples --check --force-check`, two attempts each - rule 7)
- round S check cell 10 (34 % tall): "10 less than 15 is __" at S under a two-digit tab: content 80.5 of a 92 mm cell
  leaves no room beside the w2 tab, so CL-40's spacer stays, and the page has no height to grow that row to the 19.5 mm
  that would let it drop.
- sub S check cell 1 (31 % wide): the two "circle ones / tens" items (two-choice: floor 2) are 36 mm wide in 92 mm cells.
- Lesson sheet feet add S 9 %, sub S 11 % (pupil-p3): as on master, not part of the check.

## r2 side by side
`git show 7744c2b4:design/lesson-samples/<packet>/pupil-p1.png > /tmp/r2-p1.png` (same for any page / `S/`), or
`git worktree add /tmp/r2 7744c2b4` and open both folders.
