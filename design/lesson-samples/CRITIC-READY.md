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

## Known open (from `ws-lesson-samples --check --force-check`)
PC-H13 only: add L cell 2 (the shorter of a pair, 38 % tall); sub L cell 5 and round L cell 8 / round S cell 10 (a lone
short item in its measured row, 31-33 %); sub S cell 5 (a lone expanded form across the full width, 33 % wide); sub S
check foot 9 %; lesson sheet feet add S 9 %, sub S 11 % (as on master). LR-6: sub check repeats an item (11 - 3; 39) -
N4's LR-6 flags do not reach these refs.

## r2 side by side
`git show 7744c2b4:design/lesson-samples/<packet>/pupil-p1.png > /tmp/r2-p1.png` (same for any page / `S/`), or
`git worktree add /tmp/r2 7744c2b4` and open both folders.
