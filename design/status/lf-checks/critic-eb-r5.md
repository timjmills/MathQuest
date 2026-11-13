# Critic r5: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 3cea85a7 (frozen)

Independent critic, Opus medium, 2026-11-13. Every run was made in a worktree at 3cea85a7 (/tmp/claude-0/wt-eb5, removed at the end).
Browser runs went one at a time through /tmp/mq-browser-run.sh. The probe fixtures and screenshots are in the critic's scratchpad. No
tracked file was edited except this report.

**VERDICT: FAIL.** C1 7 · C2 8 · C3 8 · C4 7

## Evidence (runs)
| Run | Result |
|---|---|
| `ws-empty-band --self-test` | OK. 17 rules and cases have a row; EB-ROLE is exempt, with a reason |
| `ws-precritic-plan` | OK (112 rows on the lane's path) |
| `ws-backtest --row` (all 12 eb-* rows) | 11 PASS, 1 FAIL in 592 s. The FAIL is eb-fact-roles: its pass state 6e962016 gives FAIL (6). This is known and routed to the facts lane (status, line 205) |
| `ws-screen-answer` | OK |
| `ws-phone-card --skills placevalue:unit_form,division:div_facts` | OK (12 of 12 renders; A14 siblings clean; 78 s) |
| Probe p1: a 300 px cell, centred, with a digit-height underline input | FAIL, 44.0 % ✓ (the slot rule hides nothing) |
| Probe p2: a 200 px underline-only input at the foot of a 260 px cell | FAIL, 47.2 % above ✓ |
| Probe p5: an invisible white input as the only lower "ink" | FAIL, 65 % between ✓ |
| Probe p4: a screen cell with no tab, padding-top 14 px, a 31 % band | FAIL, 31.1 % ✓ (the top pad exclusion hides nothing here) |
| **Probe p3: a 150 px input with a 1 px #eee closed border, in a 200 px cell, "970 =" at the foot** | **OK** ✗ (see D1) |
| unit_form, rename=more, worksheet at 390, 820 and 1280: screenshots plus a DOM read | No ink is clipped at any width (overflow 0 px on all 18 tiles). `data-mq-stretched` is never set |

## Verified since r4
- r4 D1: the app draws a LINE slot at digit height, and the tool reads a screen slot by what it draws. Row eb-fixture-screen-slot passes, and p1, p2 and p5 show that the rule does not hide a real band.
- r4 minor: the top pad is excluded. Row eb-fixture-toppad-real-band passes, and p4 still fails.
- r4 D2: unit_form is now disclosed and routed. r4 D3 and D4: the % is printed to one decimal, and the message names the 225 threshold.
- (c3): the cap never makes a box shorter than its content, because h ≥ need. At 390 px every box is full. At 1280 and 820 the short box sits on a white card. This is honest and reads as a tidy card, but the bottoms of the boxes in a row no longer line up (this reverses R1-16 by ruling).
- EB-FOOT guard: it pairs by height only on pages whose rows are sorted, and only when that pairing fits every cell. A real foot band still fails (eb-foot-div-facts).

## Defects
**D1 (C1): the edge of a faint slot counts as ink, while the same pixels do not.**
- In `paints()`, any colour that is not white counts as drawn. A closed #eee input therefore counts as one 150 px block of ink.
- Probe p3 reads OK, while its only real ink (above the 225 threshold) is the bottom 18 %.
- **Check:** fixture p3 must FAIL EB-BAND. Count a slot edge only when its colour is darker than the pixel ink threshold (225).

**D2 (C4, legibility, from commit 0f1a0bda's CSS): on the focused LINE slot, the focus rings touch the next word.**
- The yellow and blue rings butt against "tens", with a 0 px gap (unit_form at 1280, 820 and 390, card 1).
- The negative side margin pulls the next word under the ring's offset.
- **Check:** in ws-screen-answer's focus state, the gap between the focus ring's outer edge and the nearest sibling text ink must be ≥ 4 px.

**D3 (C3): the comment in worksheet.js says "CL-4b centring still applies inside the capped box", but the code can never centre.**
- With the cap, h − need < 0.22·h, so the 30 % test can never set `data-mq-stretched`.
- The owner's amended CL-4b is now dead code on the worksheet, and nothing says so.
- **Check:** a unit row that must be able to set `data-mq-stretched` on a capped row. If it cannot, remove the branch and state the ruling in WORKSHEET_DESIGN_STANDARD.

## Minor
- **m1:** the EB-FOOT "sorted" guard is true on any page whose rows are all the same height. On such a page, pairing by rank could hide two footprint errors that swap with each other.
  - **Check:** the kit emits the item index on each cell (`data-eb-item`), and the tool pairs cells to items by that index.

## Scores
- **C1 7:** the slot and top-pad rules are honest on 5 of 6 probes. D1 hides a real band.
- **C2 8:** no false alarm. The worksheet bands are gone on the pixels.
- **C3 8:** self-test, plan and 11 of 12 rows are green, and the one red row is routed. D3.
- **C4 7:** the runtime and messages are good. D2 is a legibility defect.
