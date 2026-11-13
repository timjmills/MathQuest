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

## This pass (lf-engine PC r3 fix, 2026-11-13; critic r3 F1-F4 - the check pages, the sub sheet and the deal; check-on only)
- **F1** routed check place cells ("circle the place of the underlined digit", sub Q1-3, round): no T O heads (they named the
  answer) and the words in the number's place order, tens before ones, one row under the number (`prepare()`). Gate PC-PV.
- **F2** a routed check also measures its items at 3 columns (`measureCols(ctx.routed)`): rows laid 3 across were sized from
  the 4-column measure - sub S "15 - 6" cells drew 38-40 mm in a 37.6 mm row and hid their tag. Gates PC-CLIP on ink (each
  band's grid ink above its tag, every tag drawn) and PC-FRAME.
- **F3** sub sheet Independent row at least a Guided cell's measured height (LR-17b `indepFrame`: same heads, exchange row and
  boxes) - it was 64.8 mm for 68.7 mm cells and the PDF drew them past the band's bottom rule. Gate PC-FRAME (every page, pupil
  and key: no fixed grid row shorter than its cells' natural height - the screen squeezes, the PDF does not).
- **F4** with the check on the sheet re-deals; its fact keys (hard) and texts (soft) are avoided by Practice and the Mixed
  partners: no "50 - 36" twice. Gate PC-LR5 (placed sheet items vs Practice / Mixed, 8 seeds).
- **F5 not changed here**: the add L Mixed 52 % band is on the live packet too (`ws-lesson-samples --check` without
  --force-check) - the live-fix builder owns it, with F6 / F7. PC-H13P (new, Practice and Mixed) lists them.
- Live packets: `ws-lesson-baseline --all-lessons` 1,556 hashes identical.

## Known open (`ws-lesson-samples --check --force-check`, 8 seeds)
- PC-H13P (live pages, owned by the live-fix branch): add L Mixed 52 % (F5), add S Practice 30 %, round L / S Practice 49 % (F7).
  F6 (dead hundreds carry box) is the live-fix builder's too.
- PC-H13 add S lesson sheet foot 9 % (F8, as on master).
- F13 (near-twin numbers in a check question: 77 / 27 / 71) not changed: `itemNumberKey` still drops exact repeats only.

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

## This pass (lf-engine PC fix 2, 2026-11-13; check pages and their keys only - every other page unchanged)
- **sub S cells 1-5 (31-33 % wide)**: a lone question whose items leave a side band of 29 % or more in equal columns now
  lies in a NATURAL-WIDTH grid - each cell its widest item + the tab room, at least ink / 0.6 - centred as a group in
  its band (`ROUTE_NAT_BAND`, `mq-lprenat`): the two "circle ones / tens" items 58 mm cells (21 %), the three expanded
  forms 105 mm cells (27 %).
- **round S "10 more / less than N is __" (34 % tall)**: the ROW-HEIGHT TRADE (`ROUTE_TRADE_MAX`): a row the CL-40 spacer
  pushes past the band takes the height that drops it (content + the tab clear, 19.7 mm) from the page's spare height,
  else from other rows' growth past their measured height; all or none. The page had the height: the planner charged a
  3 mm gap between bands the kit draws as one shared border (`ROUTE_GAP_MM` 0; drawn foot was 17-18 mm at S).
- **LR-6 page-wide**: with the height back, round S kept a fourth "between" item, "27 is between __ and __" under
  "27: circle the tens"; an item repeating an EARLIER question's numbers is dropped too (PC-LR6 reads the whole page).
- Gate: `ws-lesson-samples --check --force-check` PC-H13 0 on every check page (L and S, 8 seeds), every PC-* PASS but
  the two sheet feet below; live packets 0 differences (`ws-lesson-baseline --all-lessons`, 1,556 hashes).

## Known open at r3 (`ws-lesson-samples --check --force-check`)
- Lesson sheet feet add S 9 %, sub S 11 % (pupil-p3; the sheet with the check on has no Warm-up). As on master; not
  closed by a small change: the sheet's spare goes only to its Independent band (cap 10 %); letting its bands grow as on
  a page with no Independent rows (tried, gated to a live check) cleared both feet (3.5 %) but grew the top-started
  We Do / fact cells (growth lands under the item, CL-4b) to 29 % (add) and 33 % (sub We Do cell 2) - a new H13. Closing
  it needs those cells centred in a grown row (the routed check's `mq-lprectr` move) - a lesson-sheet change for the
  sheet's own lane.
- (closed in the r3 fix: sub S check Q6-8 fact cells taller than their row - F2.)

## r2 side by side
`git show 7744c2b4:design/lesson-samples/<packet>/pupil-p1.png > /tmp/r2-p1.png` (same for any page / `S/`), or
`git worktree add /tmp/r2 7744c2b4` and open both folders.
