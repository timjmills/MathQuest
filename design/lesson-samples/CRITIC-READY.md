# Short lessons: Prerequisite Check ON (lf-engine PC round, 2026-11-12; r3 rebuild 2026-11-13)

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

## r4 pass (lf-engine PC r4, 2026-11-13): the check's dealing held to the lead ruling
Rendered again (check forced on, seed 4242, L root, S at M in `S/`). Changed pages: add pupil-p4 / p5 (Practice, Mixed) and
keys, round pupil-p3 / p4 / p5 (sheet, Practice, Mixed) and keys, sub S pupil-p5 (Mixed) and key; every other page as r3.
- **(a) a dry pool never turns its own item round** (lead ruling): the re-dealt sheet's facts are given up first (turned round
  before exact), then the chart's, one place at a time; the check's own facts never; never outside the declared range (no
  "0 + 2"), never a same-page turnaround. Gate: ws-lesson-samples **PG-TURN** (every page, every lesson, forced and unforced;
  backtest lesson-pg-turn). add Practice turnarounds of its own items: 41 -> 0.
- **(b) the sheet's Independent band keeps LR-6 / LR-7** (near twins, an answer twice, the library's caps) and no chart
  example; Practice / Mixed lesson items too (check on). Gate: **PG-LR67** (backtest lesson-pg-lr67). sub sheet LR-6 9 -> 0,
  LR-7 9 -> 0.
- **(c)** a number bond read as a sum is keyed as that sum: the check puts the chart's sums last (add L 1629), Mixed partners
  never print the lead's sum turned round; the sheet's Guided cells leave out a chart example and one-number near twins
  (round L had the chart's 96, then 47 / 74).

`ws-lesson-check` forced vs unforced (25 seeds, L / S): **118 vs 428 findings, every class at or below master's**; the 19
LR-5 left are the LR-18 part-refresh builds, which run unforced (identical to master). Cross-page soft repeats (a sheet
fact turned round on Practice) 337 vs 159 unforced: the ruling's step 2, by design.

Known, for the critic to rule on (not rule reds): round sheet Independent 43 / 34 (the 6-item pool has no other); round
Practice 11 / 12 and 97 / 98 (Practice near numbers are not an LR-6 rule for rounding); sub chart cell 6 30 % band (as r3).

## Every page of the packet, its gate, the r3 finding it closes (lf-engine PC r3 rebuild, 2026-11-13)
Rendered on branch `claude/sweet-newton-c8wrv1-lf-engine-pc` after merging lf-engine-live-pm2 (1b2d38f05). Check forced on,
seed 4242, L at the packet root, S printed at M in `S/`. "Rule-gated" = `ws-lesson-samples --check --force-check` (8 seeds,
L / S; precritic `lesson-samples-check`), every rule PASS on this tree. Print-lint = `ws-print-lint --roles lesson` (L-KEY,
L-OVERLAP; precritic `lesson-samples-key-L / -S`).

| Page (pupil / key) | Part | Gates | r3 findings closed here |
|---|---|---|---|
| pupil-p1 / key-p1 | Prerequisite Check (one page) | PC-RANGE, PC-NAME, PC-SLOTS, PC-SCAFFOLD, PC-LR6 (exact + near twins), PC-H13 (bands, gaps, foot), PC-CLIP (headings, ink above each tag), PC-FRAME, PC-PV, PC-PAGES; print-lint L-KEY / L-OVERLAP | F1 (PC-PV), F2 (PC-CLIP ink, PC-FRAME), F13 (PC-LR6 near twins: sub S now 77 / 51, not 77 / 27 / 71; round 75 / 45 no longer together) |
| key-p2 | routing page "Prerequisite Check: where next" | PC-FRAME, PC-CLIP twin geometry; print-lint L-KEY | - |
| pupil-p2 / key-p3 | anchor chart (and chart-grey.png) | PC-CLIP, PC-FRAME; print-lint | - |
| pupil-p3 / key-p4 | lesson sheet (Vocabulary, Remember, Guided, Independent) | PC-H13 (blank foot), PC-FRAME, PC-CLIP, SHEET-2PG, PC-LR5 (its items not again on Practice / Mixed); print-lint L-DENSITY H13 | F3 (PC-FRAME), F4 (PC-LR5); add S foot 9 % (carried into r3 as a known red) now filled - with the check on, the Vocabulary band takes the spare |
| pupil-p4 / key-p5 | Practice | PM-H13, TAB-CLEAR, PM-CONT, LIVE-PART, PC-FRAME, PC-LR5 | F5 / F7 (PM-H13, fixed on live-pm2, merged), F6 (LIVE-PART) |
| pupil-p5 / key-p6 | Mixed | PM-H13, TAB-CLEAR, PM-CONT, LIVE-PART, PC-FRAME, PC-LR5 | F5 (merged); the check's printed facts are now a hard avoid of the Mixed partners (ws-lesson-check: "on prereq and mixed" 8 -> 0) |

Live packets (check off, `prereqsLive: false`): `ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --per-lesson
--check` against a baseline written on 1b2d38f05: OK, 1,556 hashes identical.

## Known open (not closed by this pass)
- r3 F8-F12, F14 were not in this brief (see the r3 REPORT); F13 is closed.
- `ws-lesson-check --force-check` (not on precritic): r4 118 findings vs 428 unforced (r3: 354); no forced-only class left
  (see "r4 pass" above).
- precritic `--role lesson --strict` reds identical on 1b2d38f05: print-lint role lesson L (28 counts above the pin) and S
  (29), lesson-samples-key-L (nearest_10 L, 12 findings, live packet).

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
