# lf-roles critic r5c (independent critic, 2026-11-13)

Branch `claude/sweet-newton-c8wrv1-lf-roles` @ HEAD vs `3b324bcc`. PNGs in this folder. Graded against RUBRIC.md,
PAGE_TYPES PT-MOD-1..5, PT-ERR-4, §2.10 Pre-skill check + lead ruling R13, PEDAGOGY P-LC-9, WORKSHEET_DESIGN_STANDARD
INK-31 / VA-13. Measurements at 800 px / 210 mm = 3.81 px/mm.

## Verdict: PASS for the changes (no counted defect; every changed page is better than before)

| Page set | C1 | C2 | C3 | C4 | vs before |
|---|---|---|---|---|---|
| function_table_easy scripted-model S | 9 | 9 | 8 | 9 | better |
| function_table_easy scripted-model M | 9 | 9 | 8 | 9 | better |
| function_table_easy scripted-model L (3 pages) | 8 | 9 | 8 (PT-MOD-5 excuse, see P1) | 9 | better |
| number_patterns_rule scripted-model M (2 pages) | 8 | 8 | 8 | 9 | better |
| function_table_easy error-analysis M | 8 | 8 | 8 | 9 | better |
| function_table_easy error-analysis L | 8 | 8 | 8 | 9 | better |
| number_patterns_rule error-analysis M | 8 | 8 | 8 | 9 | better (small) |
| sub_wp_20 pre-skill-check L + key (2 pages) | 8 | 8 | 8 | 9 | better |
| sub_wp_10_plain pre-skill-check M (1 page) | 8 | 8 | 8 | 8 | same (pixel-identical: the one-page path is untouched) |
| identify pre-skill-check L (2 pages) | 8 | 8 | 8 | 9 | better |

(Error Analysis and stand-alone Pre-skill check sit outside the skill pass bar per RUBRIC scope notes; scored here as role pages.)

## 1. Scripted Model (critic r5b D2) - fixed

- fte S/M/L: each state now prints the earlier steps' Out answers BLACK (bold, thick box) and only the newest one in trace
  grey: step 2 grey 13; step 3 black 13 + grey 15; step 4 black 13, 15 + grey 17; step 5 black 13, 15, 17 + grey 19. Matches
  PT-MOD-1 and P-LC-9 exactly. Ink sampled: only #000, #fff and #949494 inside the page.
- npr M: step 4 now black 39 + grey 49 (before: both grey); step 5 black 39, 49 + grey 59, 69, 79 and grey rule 10. Correct.
- Before, the final "fill in every row" state was all grey, which reads as "trace everything" and hid which mark was new; after,
  the eye lands on the one new group. Real teaching gain (C2 8 -> 9 on fte).

## 2. Error Analysis "<Name> wrote:" label - fixed

Label foot -> first ink of the work (measured, item 1 column):

| Page | before | after | PT-ERR-4 lead rule 2-4 mm |
|---|---|---|---|
| fte EA M | 17 px = 4.5 mm | 9 px = 2.4 mm | now in |
| fte EA L | 21 px = 5.5 mm | 9 px = 2.4 mm | now in |
| npr EA M | 7 px = 1.8 mm | 9 px = 2.4 mm | now in |

The label now visibly belongs to the grey work. Table and label moved up together (~1.3 mm), no collision with the number tab
(label top 4.7 mm / 2.9 mm under the tab).

## 3. Pre-skill Check two-page split (R13) - fixed

- sub_wp_20 L: before 3 bands + 1 band (page 2 = 2 items, short header: Name only, no Date/Score/title). After 2 + 2 bands
  (8 items / 4 items), both pages carry Name, Date, Score /12 and the title; strip scores 4+4+2+2 = 12. Key: same split, "Answer
  Key" in the Name field on both pages, footer "Key · Form A", every answer correct (5, 4, 2, 8, 5, 5, 15, 16; 4−1=3, 7−4=3,
  3−2=1, 5−3=2), INK-31 orange on answers only.
- identify L: before 3 bands + a page holding ONE item (6) under a Name-only header. After 2 + 2 bands (items 1-4 / 5-6), full
  header on both. No prerequisite dropped (more_less_10, more_less_100, place_value_disks + 1 all present).
- sub_wp_10_plain M: fits one page, unchanged (diff empty) - the ruling's "one page when it fits" holds.
- White space: each two-page check leaves ~50-55 % of each page blank. Under R13 this is allowed; it reads as two calm, equal
  pages with the same header, which is better than a full page plus a stub. See P6 for the improvement the space invites.

## Counted defects

None.

## Nits (not counted)

| Id | Page / place | Rule | Automatic check |
|---|---|---|---|
| N1 | fte scripted-model S/M/L step 5 text "Fill in every row the same way." while the state now adds only the last row (19) | PT-MOD-2 / P-LC-9: step sentence describes this redraw's marks | ws-cell-checks MODTEXT: a step whose text says "every" must have >= 2 new marks (`traceNew.length`), else reword ("Fill in the last row the same way.") |
| N2 | npr scripted-model M steps 1-2 add no mark (state identical to the given); the rule box is only filled at step 5 although step 1 states the rule | PT-MOD-1 "exactly one new mark group per state" | roles-unit: every Model state but the first has `traceNew.length >= 1` |

N2 is the same in before and after (pre-existing in substance), listed here because it sits on the page being graded.

## Pre-existing (identical in before and after; not counted against this change)

| Id | Page / place | Rule | Automatic check |
|---|---|---|---|
| P1 | fte scripted-model L page 3: one state + Say band, ~70 % of the page blank | H5 / PT-MOD-3 (excused by PT-MOD-5 ruling for fte L) | ws-page-fill on Model continuation pages, with the PT-MOD-5 exemption listed by skill |
| P2 | fte scripted-model S and M: ~20-25 % blank below the Say band | C3 page fill | ws-page-fill (Model role) |
| P3 | All EA pages: "<Name> wrote:" label ~9-10 pt, below the 11 pt a pupil must read | RUBRIC C1 (text >= 11 pt) | L-FONT min size on `.mq-pupiltag` |
| P4 | fte EA M/L: work vertically centred, ~16 mm empty above the label in each cell (under the 30 % H13 line) | C3 "problem in the top half" | ws-empty-band top-band report |
| P5 | fte EA: one Correct / Fix it judgement per 4-row table while Fix is a per-row column (R15, open) | PT-ERR-2 | (lead ruling R15 pending) |
| P6 | Two-page PSC (sub_wp_20 L, identify L): bands keep their one-page height, so each page is ~half blank; the detailed lesson check already grows bands to the body (flex, <= 1.45 x content) | C3 white space (allowed by R13) | ws-page-fill on PSC pages > 1, after a ruling on whether R13 pages should share the spare height |
| P7 | sub_wp_20 L key items 1-6: regroup boxes left empty | VA-13 / AK-2: the key fills regroup boxes with the working | key check: every regroup box on a key cell whose item regroups carries a `data-ws-key-ans` mark |
| P8 | sub_wp_20 L items 7-8 (17−2, 17−1) and sub_wp_10_plain M items 9-12 (6−4 ...) carry regroup boxes no item uses | H15 dead part | ws-cell-checks DEADPART: regroup box on a non-regrouping item |
| P9 | sub_wp_10_plain M: band 1 sets the minus tight to the digit, band 2 sets it in its own track - two looks of the same operator on one sheet | AX-4 / VA operator track | L-STACK: operator track width equal across stack cells on a sheet |
| P10 | PSC footers: skill list wraps to two lines ("... K.OA.2") | frame footer one line | L-FOOT: footer left fits one line |
| P11 | npr EA M: "Sam wrote:" on items 1 and 3; items 1 and 3 show the same misconception | PT-ERR-1 variety | EA unit: distinct names and distinct `wrongAnswer` kinds per page |

## Speed / check notes

- The two fixed findings now have machine checks on precritic's path per the lane (backtest row `model-marks-ink`; PSC
  `paginateBands` unit). Recommend adding the label-gap measurement (2-4 mm) as a numeric assertion in ws-cell-checks PUPILTAG
  so the next EA template change cannot drift (it drifted on three templates this round).
