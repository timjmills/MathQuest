# Critic r4: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 53ba39fb (frozen)

Independent critic, Opus medium, 2026-11-13. Every run was made on the frozen tree, except one scratch worktree at deb9e426 (run
with MQ_ROOT, then removed). The probe fixtures and screenshots are in the critic's scratchpad. No tracked file was edited except
this report.

**VERDICT: FAIL.** C1 7 · C2 8 · C3 7 · C4 7

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `ws-empty-band --self-test` | OK. Rule coverage: 15 rules and cases have a row; EB-ROLE is exempt, with a reason | - |
| `ws-precritic-plan` | **OK** (112 rows on the lane's path) | - |
| `ws-backtest --row` padding-leading, blank-cell, band-above, band-between, screen-side | 5 PASS | 348 s (most of it waiting for a slot) |
| `ws-backtest --row pv-combine-side-band` | FAIL. The pass state deb9e426 gives 179 findings | 87 s |
| deb9e426, combine, independent S, MQ_ROOT, with a screenshot | EB-BAND 37 % under "= ____" (real on the pixels). The row's own rule, EB-SIDE, **PASSES**. The lead's claim holds | 11 s |
| My `--html` probe (9 cells) | 58.7 % band above: FAIL ✓. 28 % below: OK ✓. Thin 0.5 px SVG stroke: OK ✓. 1 px #949494 line only: BAND ✓. Transparent-border wrapper: BAND ✓ (m1 fixed). fill-opacity 0: BAND ✓ (m2 fixed). Pinned left at 45 %: SIDE ✓. White text only: EB-READ ✓. 1 px #eee line only: EB-READ "nothing drawn" (see D4) | ~10 s |
| `--skill placevalue:unit_form` (pinned) | **FAIL 305**: EB-BAND 302 (independent S, 4.9 mm above the boxes in a 15.1 mm strip = 32.5 %, real on the screenshot) and EB-SIDE 3. **0 within the pin** | 136 s, 80 renders |
| unit_form worksheet host at 1280, rename=more, screenshot and pixel rows | Cells 3 and 5: **47.9 % blank above the digits** (58 of 121 px); the tool reads OK | - |

## Verified since r3
- D1: the bands are read on the pixels, from the border box. D2: a blank cell gives EB-READ. D5: the rows exist and pass, and the
  self-test fails any rule with no row. D4: the plan is OK. m1, m2 and m3 are fixed.
- D6: EB-SIDE and EB-FOOT now name their limit, and EB-SIDE uses the interior width.

## Defects
**D1 (C1): the CL-4b input excuse hides a visible band.**
- In da17b9ba the 48 px worksheet input keeps `data-ws-slot`. Only its 2 px underline and the typed digits are ever drawn: it has no
  top border and a white background.
- On unit_form rename=more, a pupil sees 47.9 % of the tile empty above "970 = ___". The tool counts the whole invisible box as ink
  and reads OK.
- WORKSHEET_DESIGN_STANDARD (451207ab) rules only the centring. The slot marking is a fixer's change, and row
  eb-wsheet-cl4b-stretch now pins it as a pass.
- **Check:** a screen fixture with a centred one-line problem and a 48 px underline-only input in a 123 px `.mq-scell` must FAIL.
  On screen hosts, count a slot only by its drawn extent: its border, plus the height of one written digit (Hw).

**D2 (C3): the frozen head is red on a skill that passed the redesign, and this is not disclosed.**
- placevalue:unit_form is listed in redesign-passed.js. Its run now FAILs with 305 findings, and none of them is pinned.
- The status file and the brief name only the facts pin and the 4 red rows.
- **Check:** when a measure changes, run `ws-empty-band` on every skill in redesign-passed.js that the lane touched, and report each
  new count. Pin it or route it before the critic.

**D3 (C4): "(30 %; limit 30 %)".**
- The integer rounding makes a finding over the limit read as being at the limit (unit_form review S, 30.4 %).
- **Check:** a self-test asserting that a finding's printed % is greater than or equal to the printed limit, at one decimal, as
  EB-BAND does.

**D4 (C4): EB-READ says "nothing drawn in it" for a cell whose only ink is too faint to count.**
- My probe cell held a 1 px #eee line, which is lighter than the 225 threshold.
- **Check:** a fixture with that faint line, whose message must name the threshold.

## Minor
- **m1:** the bands include the kit's mandatory top pad, so a small strip cell (15 mm at S) fails at about 1 mm off centre. This
  follows the literal wording of H13, so it is not scored. It is worth a lead ruling.

## Scores
- **C1 7:** the measure is now honest on every fixture, but D1 lets a 48 % band that the pupil sees pass on a real host.
- **C2 8:** no false alarm on 9 probes; the unit_form and combine bands are real on the pixels.
- **C3 7:** self-test, plan and rows are good. D2.
- **C4 7:** runtime is good (136 s per skill). D3 and D4.
