# Critic r6: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 8dc176e6f (frozen)

Independent critic, Opus medium, 2026-11-13. Every run was made in a worktree at 8dc176e6f (/tmp/claude-0/wt-eb6, removed at the end).
Browser runs went one at a time through /tmp/mq-browser-run.sh. The probe fixtures (q1-q6) and the FOCUS-GAP probe script are in the
critic's scratchpad. No tracked file was edited except this report.

**VERDICT: FAIL.** C1 7 · C2 9 · C3 8 · C4 8

## Evidence (runs)
| Run | Result |
|---|---|
| `ws-empty-band --self-test` | OK. 18 rules and cases have a row; EB-ROLE is exempt, with a reason. The EB-FOOT pairing unit cases pass (swapped by index gives 2, own gives 0, no index falls back to position, two sections or fewer cells are not paired) |
| `ws-precritic-plan` | OK (133 rows on the lane's path) |
| `ws-backtest --row` (all 31 rows in backtests.json whose command calls ws-empty-band or ws-screen-answer) | 28 PASS, 1 FAIL, 2 PENDING. The FAIL is eb-fact-roles (its pass state gives FAIL): known, routed to the facts lane. The PENDING rows are optin-h13-abs and eb-foot-gridcols-patterns (pattern_features is not on master). eb-fixture-faint-slot, sa-focus-gap-unit-form, the three re-pointed pv rows and pv-words-parity all PASS |
| `ws-screen-answer` | OK (346 s) |
| `ws-phone-card --skills placevalue:unit_form,division:div_facts` | OK (12 of 12 renders; A14 siblings clean; 78 s) |
| `ws-boot-smoke` | OK |
| q1: the r5 p3 input, with a faint #eee top edge and a 2 px #000 bottom edge | FAIL 32.5 % ✓ (read as an underline) |
| q2: a 2 px #000 top edge and a faint bottom edge | FAIL 34.5 % ✓ |
| q3: 2 px #000 top and bottom edges, faint sides | OK ✓ (a closed box is writing room) |
| q4: the faint slot beside a real 2 px closed box in the same row | OK ✓ (the real box covers the rows) |
| **q5: the screen-side fail fixture plus a 95 mm wide input with a 1 px #eee border to the right of the answer box** | **OK** ✗ (see D1) |
| **q6: the same with an invisible (border 0, white) 95 mm input** | **OK** ✗ (see D1) |
| FOCUS-GAP probe (the shipped function on synthetic pages): a lone box; a word above it; a word 20 px away; a word on another line | No finding in any of these ✓. No false alarm |
| FOCUS-GAP probe: a word flush on the same line | Found at −5 px ✓ |
| FOCUS-GAP probe: the word "tens" 1 px BELOW the box | No finding ✗ (see m2) |

## Verified since r5
- **D1 (vertical):** a screen slot's top or bottom edge counts only when it is darker than 225. The edge is judged per side, so a faint edge next to a real 2 px edge reads correctly (q1 to q4).
- **D2:** the additive CSS gives 9 px side margins. sa-focus-gap-unit-form fails on 0f1a0bda and is OK on 2af22377. The 3 `--focus-gap-all` findings are listed in the status file and routed.
- **m1:** tagItemIndex matches cells by the question object, and grid.js / cell.js write `data-eb-item`. Index pairing judges each cell against its own item, so a reordered page cannot swap footprints (self-test). An index that is out of range or missing falls back to position pairing. The scope (one section, cells = items) is stated in the code and in the status file. The Review case (16 cells for 28 items, 17–23 % over by index) is reported for a lead ruling. This is honest.
- **r5 D3:** the lead ruled to KEEP the branch, and the ruling is recorded. Note: under the cap, (h − need)/h < 22 % whenever the bottom padding is ≥ 0. So "rarely fires" is really "fires only if a CSS min-height overrides the cap".

## Defects
**D1 (C1): a slot's full WIDTH still counts as ink, even when none of its edges is drawn.**
- The r5 D1 fix judges the darkness of the top and bottom edges only.
- `cols[x] = 1` runs over the whole slot's width for every slot, whether it is faint or invisible.
- In q5 and q6, a 95 mm #eee or borderless input fills a 103 mm empty side, and EB-SIDE reads OK. On screen, that side band is still empty.
- **Check:** fixtures q5 and q6 must FAIL EB-SIDE. Unless a slot draws a dark left or right edge, or a dark underline, count only the width of one written digit (centred, as the vertical rule does).

## Minor
- **m1:** the EB-FOOT fallback is silent.
  - When some cells carry an index and others do not, the tool drops to position pairing and prints no note.
  - In index mode, an unmeasured item (`m[c.item] == null`) is skipped silently. Position mode refuses such a page instead.
  - **Check:** print a note whenever the mode is not 'index' on a kit page, and whenever an indexed cell has no measured footprint. Add a self-test case for each.
- **m2:** FOCUS-GAP judges only words on the box's own line, so a word 1 px under the ring passes.
  - **Check:** also measure the gap to the nearest text rect above and below that overlaps the ring horizontally (≥ 4 px).
- **m3:** the 4 eb-* rows in backtests-empty-band.json were not re-run this round (they are not on the main table).

## Scores
- **C1 7:** the vertical slot rule, the index pairing and the fallbacks are right on every probe but two. D1 is the horizontal twin of r5 D1: a faint or invisible slot still hides a real band, this time a side band.
- **C2 9:** no false alarm. The FOCUS-GAP probe is clean on a lone box, and every pass state is OK.
- **C3 8:** self-test, plan and 28 of 29 live rows are green. The red row is routed. m1 and m3 remain.
- **C4 8:** D2 is fixed and its messages are clear. m2 is a small gap in the legibility check.
