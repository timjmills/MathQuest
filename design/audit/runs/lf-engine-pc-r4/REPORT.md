# lf-engine Prerequisite Check: critic r4 (2026-11-13)

Independent critic (mq-opus-medium), tree claude/sweet-newton-c8wrv1-lf-engine-pc @ 6a9c268ce, committed packet PNGs (check
forced on, seed 4242; L at the packet root, S printed at M in S/), every page of the three packets, and the engine diff
316102081..HEAD. Grades: `grades.jsonl`. The critic could not write this file; the lane lead saved it in substance. Node
gate ws-lesson-unit OK (270) - catches none of the findings.

**VERDICT: FAIL (min 6).** 12 of 36 page versions and the engine fail.

| Packet | Size | Check | Routing | Chart | Sheet | Practice | Mixed |
|---|---|---|---|---|---|---|---|
| add | L | 8 | 8 | 8 | 8 | 8 | 8 |
| add | S@M | 8 | 8 | 8 | 7 (C3) | 8 | 8 |
| sub | L | 6 (C2) | 8 | 6 (C3) | 8 | 8 | 8 |
| sub | S@M | 6 (C2) | 8 | 6 (C3) | 8 | 8 | 8 |
| round | L | 7 (C2) | 8 | 8 | 8 | 7 (C2) | 7 (C2) |
| round | S@M | 7 (C2) | 8 | 8 | 7 (C2) | 7 (C2) | 7 (C2) |

Engine: correctness 6, design fit 7, maintainability 6, gates 6.

## Blocking findings
| # | Sev | Where | Defect | Fix | Automatic check |
|---|---|---|---|---|---|
| N1 | major, regression | sub L Q9, sub S Q10 | "20 − 11" under the Y2.B2.S10 question (ref minTop 11, maxTop 18, maxBottom 9; "1-digit from a teen, across 10"): the lesson's own skill, routes a miss to the wrong lesson. 4th item came with ROUTE_DEAL = 8 and the relaxed last try `pass(false, true, true)` keeping no floor (print-sheet.js ~L1125) | route-ref floors hard on every try of a routed check; print fewer items rather than out-of-range | PC-RANGE reads the ref's declared floors (minTop / maxTop / maxBottom / minOperand); backtest sub_100_regroup 4242 L, S |
| N2 | major | sub Q1-4, round L Q3-6, round S Q4-7 | r3 F1 fix lines "tens" under the tens digit and "ones" under the ones digit: the nearest word is always the answer; round alternates tens / ones | fixed word order NOT aligned with the digits (e.g. stacked bank right of the number); never constant or strictly alternating underlined places | PC-PV both ways: nearest word neither always key nor always wrong; answers not constant / strictly alternating |
| N3 | major, H13 | sub chart pupil-p2 / key-p3, L and S | step cells 5, 6: 32.6 % / 31.7 % bands (declared known; measured over the line, C3 capped 6) | centre cell content or shrink the row, spare to Say / Rule | H13 on anchor-chart cells, blocking |
| N4 | major | round Practice L (11/12, 97/98, four in the 60s; answers 40 ×3, 60 ×3), S; Mixed L (47 45 49, 50 ×3 of 6), S | one-number near twins on Practice and Mixed: `nearSplit` runs on check and sheet only; LR-6 holds per page | same twin split on Practice and Mixed per page; ≤ 2 items in one ten on a 15-item page | PG-LR6 one-number twins on every lesson page; backtest nearest_10 4242 L, S |
| N5 | major (r3 F11 open) | round S sheet Independent | 74/47, 43/34, 88/89, 95/98, answers 100 ×2, 90 ×2 of 9 - unchanged from r3 | larger pool before `indepRuled` falls back; nearSplit across Guided + Independent | PG-LR6 on the sheet Independent band |
| N6 | minor (C3 7) | add S sheet Vocabulary band | r3 F8 foot moved into the band: 29.7 % below the labels vs 28 px above | centre in the grown band or share the spare | PC-H13 lopsided gaps (> 2:1 with the larger ≥ 25 %) in grown bands |

## Other findings
N7 (r3 F12, L): round L Q9 one item "10 more than 30" under "10 more or 10 less". N8 (tooling): every packet's
chart-grey.png is the check page in grey (RASTER_PY page index not moved when the check is page 1). N9 (lead ruling):
Mixed "Place Value" partner prints T O heads over the digits - the give-away F1 removed from the check; may be a structural
scaffold on practice. F14 open: "Write the missing numbers" over one blank (add L Q2); round L Q1 widow "boxes.". Nits: add
sheet Independent answers 10 9 8 8 10 8; add Mixed 7 ×3; add Mixed additions all turnarounds of Practice (forced, 21 facts
for 26+ places); sub S Mixed 80 − 75 / 90 − 74; heavy round Guided frame.

## r3 findings
F1 fixed as specified, superseded by N2. F2, F3, F4, F5, F6, F7, F9, F10, F13 fixed. F8 fixed for sub S, moved for add S
(N6). F11 not fixed at S (N5), nit at L. F12 fixed at S, open at L (N7). F14 not fixed.

## Engine
Correctness 6 (soft route floors on the last try; prepare() places words without checking alignment; twin rule missing on
Practice / Mixed). Design fit 7 (right moves; three near-twin definitions: nearNum practice.js, nearNumbers / nearKeys
pre-skill-check.js, lrNearTwins lesson-rules - thresholds ≤ 2, ≤ 3, one place; prepare() mutates in place). Maintainability
6 (print-sheet.js 6,764 lines; refCoreOk / refAccepts duplicate floors; 7-tier dealer, last try untested; chart-sum regex
twice). Gates 6 (none caught N1-N4, N8).

## Automatic checks
1 PC-RANGE on the ref's floors (N1). 2 PC-PV both ways (N2). 3 H13 on anchor-chart cells (N3). 4 PG-LR6 one-number twins
on every lesson page (N4, N5). 5 PC-H13 lopsided gaps in grown bands (N6). 6 chart-grey.png text = chart page text (N8).

## Speed-ups
1 when a deal count changes, re-run the range gate on the ref's floors. 2 test a critic-proposed fix's condition both ways
(r3's check was one-sided). 3 measure and fix a known item at a hard-cap threshold before the critic. 4 one near-twin module
for every page. 5 after any dealing change, re-read every page of the packet for variety.
