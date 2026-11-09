# Lesson 3a live fix: narrow critic (2026-11-07)

Independent critic (mq-opus-medium). Lesson g3-oa5-mult-properties, after the owner rulings (every family once, arrays to
6 × 6, Practice 1 one item a row, two pages, one cell height). Graded from the PNGs `design/lessons/proof/live-2026-11-07/
g3-oa5-mult-properties/{before,after}/` (before = master 03197e60; after = -live 0b8ffb14). Grades: `grades.jsonl`. The
critic could not write this file; the lane lead saved its report here verbatim in substance.

**VERDICT: FAIL (min 6)**: two regressions (T5 Watch box; P4-2 H13).

Right: every fact family once across the pack (every array / fact read on P0, P2-P6, T3 / T5); 6-wide arrays read correctly
(1.5 mm 5-group gap, rows countable); both Practice 1 pages one cell height; P0 × 2 facts 2 × 6 to 2 × 10; keys true facsimiles;
nothing given away.

| Page | C1 | C2 | C3 | C4 | min | Note |
|---|---|---|---|---|---|---|
| P0 / P0-key | 9 | 8-9 | 6 | 9 | 6 | item 7 (2 × 2 beside 5 × 5) 53 % empty: pre-existing |
| P4-1 / key | 9 | 8-9 | 8 | 9 | 8 | item 2 32 % (tolerance) |
| P4-2 / key | 9 | 8-9 | 6 | 9 | 6 | **item 4 41 % empty: regression** |
| P4-3 / key | 9 | 9 | 8 | 9 | 8 | master's passed Practice 2 layout |
| P5 / key | 9 | 9 | 8 | 9 | 8 | |
| P6 / key | 9 | 9 | 7 | 9 | 7 | cells 2-3 42 % empty: unchanged from master (pre-existing) |
| T3 | 9 | 9 | 8 | 9 | 8 | |
| T5 | 7 | 6 | 8 | 8 | 6 | **Watch box wrong: regression** |
| T6 | 9 | 8 | 8 | 9 | 8 | naming / star-order notes |
| P1-P3 keys | 9 | 9 | 9 | 9 | 9 | unchanged |

| # | Where | Rule | Defect | Fix | Automatic check |
|---|---|---|---|---|---|
| 1 blocking | T5 §8 Watch | C2 | "Practice 1: 10; Practice 2: 16; Practice 3: 49, 35" - no Practice 3; 16 is Practice 1's last row. `{p4.last}` (print-sheet.js ~5359-5381) counts k once per PAGE of each practice plan, not once per Practice SHEET - every detailed lesson with a multi-page Practice sheet | k once per partPlan('practice') entry; the last row from the sheet's last page | T-page truth: every "Practice N" named exists; each {p4.last} item is on its sheet's last page |
| 2 blocking | P4-2 item 4 (+ key) | H13 | 4 × 4 array in a cell sized for P4-1's 6-row array: 41 % band (item 3 32 %); content top-anchored | keep the shared height (ruling), centre the array pair + equation vertically; or trim the bottom reserve | H13 / L-DENSITY re-run on cells `equalPages` stretched, S/M/L |
| 3 pre-existing | P0 item 7; stacks 2-5 ≈ 33 % | H13 | 2 × 2 beside 5 × 5 in one row: 53 % | arrays of similar height for items 6-7, or centre | H13 on pre-skill-check |
| 4 pre-existing | P6 cells 2-3 | H13 | 42 % band below two-line facts | shrink the row or centre | H13 on the exit slip |
| 5 minor | Practice 1 stars; T6 | P-1, naming | stars ★★ ★★★ ★★ ★★★ across the two pages (the 5 × 2 edge item ends page 1); T6 says P4-1/2/3, T5 says Practice 1/2 | edgeLast per sheet, not per page; one naming scheme | stars never decrease within a sheet; T-page naming consistency |
| 6 minor, pre-existing | P0 | LR-6 | 25 is both a count-by answer and item 6's total | distinctAnswer on the check | LR-6 on pre-skill-check |

Band measure: per cell, the longest run of pixel rows with no ink darker than 200, over cell height, edges inset 4 px; 32-34 %
is within tolerance (master's passed Practice 2 reads 33 %); ≥ 41 % is a clear fail.

Automatic checks: {p4.last} truth; H13 after equalPages; star ramp per sheet; T-page naming. Speed-ups: a multi-page Practice
sheet fixture in ws-lesson-unit ({p4.last}, edgeLast and stars all assumed one page per sheet); a pixel-band probe in
ws-detailed-lesson --check so the builder sees a 41 % band before hand-over.
