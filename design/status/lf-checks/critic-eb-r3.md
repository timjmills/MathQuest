# Critic r3: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 602692b7 (frozen)

Independent critic, Opus medium, 2026-11-12. All runs were made on the frozen tree. The only exceptions were scratch worktrees,
since removed: origin/master d34311d5 for the plan comparison, and 6e962016 run with MQ_ROOT. Probe fixtures and screenshots
are in the critic's scratchpad. No tracked file was edited except this report.

**VERDICT: FAIL.** C1 6 · C2 8 · C3 6 · C4 7

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `ws-empty-band --self-test` | OK (9 EB-GDPCAP + 6 PT-MOD-3 + 6 EB-GAP) | - |
| `ws-backtest --row eb-fixture-band` / `eb-fixture-svg-black` | PASS / PASS | 51 / 75 s (with waiting) |
| `ws-backtest --row pv-unit-form-rename-side` / `pv-combine-side-band` | PASS / PASS | 81 / 81 s |
| `ws-backtest --row eb-fact-roles` | **FAIL**. The pass state 6e962016 is FAIL (25) | 146 s |
| The same command at 6e962016 (MQ_ROOT) | EB-BAND PASS, EB-SIDE PASS, EB-EDGE FAIL 10, EB-GDPCAP FAIL 15 | 65 s |
| `ws-precritic-plan` | **FAIL (21 of 110 rows not on the lane's path)**. 11 of them are ws-empty-band rows. Master gives the same result (21 of 111) | - |
| Probe `--html` fixtures (mine) | 55 % above the ink: FAIL ✓. 56 % between the blocks: FAIL ✓. Blank cell next to a good cell: **OK** ✗. Wrapper with a transparent border and text at the top (~70 % band): **OK** ✗ | - |
| `--skill placevalue:unit_form` (pinned) | FAIL 9: opener S/M/L bands (real, checked on pixels), and worksheet 1280 at rename=more (the known Q-W1 case) | 120 s, 80 renders |
| `--skill multiplication:mult_properties --no-baseline` | FAIL 76. EB-EDGE error-analysis L "5.4 mm across" is real: the B box runs past the cell (screenshot). The black arrays are now ink | 68 s |
| Card 390 px, unit_form, Puppeteer at DPR 1 | Content centred and filling the card. The tool reports no EB-SIDE. **It matches what the pupil sees** | - |

## Changes since r2: verified
- The card host is measured (.mq-scell). Black SVG ink counts: the paints() alpha regex is fixed, and the fixture row passes.
  The bands under, between and above the ink are all read (my top and between fixtures fail). A host that does not render
  gives EB-READ. Screen hosts run at every variant. EB-EDGE is skipped on screen cells. The print/screen split of EB-SIDE and
  the scripted-model between band are as briefed. The precritic defaults are as briefed.

## Defects
**D1 (C1): EB-BAND and EB-SIDE measure from the cell's padding box and to the text line box, not to the visible ink. They
under-read by up to 18 points.**
- `inner` subtracts the padding, and `box.b` is the bottom of the line box, leading included. The band is then divided by the
  full cell height.
- unit_form opener S, seed 7, as measured in the page:
  - **Cell 1:** height 108.4 px, padding-bottom 11.3 px, text bottom 69.5 px. The tool reads 7.3 mm / 25.4 % → PASS.
    The pixel band is 40 px / **37.0 % → a missed H13 failure.**
  - **Cell 2:** the tool reads 40.6 %, the pixels read 58.6 %.
- RUBRIC H13 counts the band of the cell's height. EB-GAP already moved to pixels for exactly this reason.
- **Check:** a `--html` fixture with padding-bottom 25 % and line-height 2, where the visible band is 35 %, must FAIL. Then
  measure from the border box, or take the bands from the pixels (`ws-ink.cjs`).

**D2 (C1, r2 D7 fix left undone): a cell with no measured ink is dropped (`if (!box) return`).**
- My probe page held one good cell and one blank cell, and the result was `ws-empty-band: OK (1 cells)`.
- When every cell is blank, the message says "no kit cell read", which is wrong: the cells were read and found empty.
- **Check:** a blank-cell fixture row that must FAIL with EB-READ "cell N has no ink".

**D3 (C3): the backtest row for this tool is red.**
- `eb-fact-roles` FAILs. Its pass state is red only on rules added later (EB-EDGE and EB-GDPCAP from lf-ops). The row's own
  rules, EB-BAND and EB-SIDE, PASS there.
- This is not a measurement defect. It is the tool lane's row, and `--only EB-BAND,EB-SIDE`, which already exists, fixes it.
- **Check:** `ws-backtest` runs every row whose command calls a script changed in the diff.

**D4 (C3): `ws-precritic-plan` is FAIL, and 11 ws-empty-band rows are "not on the lane's path".**
- `pv-combine-side-band`, `pv-unit-form-rename-side` and `eb-fact-roles` give `--role a,b` to precritic, which rejects it with
  "FAIL (usage)".
- `ws-precritic --role guided` and `--role scripted-model` plan no ws-empty-band at all. That leaves the rule rows for
  GDPCAP, EDGE, MOD-* and GAP off that path, as well as the VOCAB/PAGE rows.
- **Check:** `ws-precritic-plan` green, run as a gate in this lane.

**D5 (C3): rules with no backtest row.**
- EB-FOOT, EB-ROLE and EB-READ have none.
- So do the screen "pinned to one side" EB-SIDE split, and the bands above and between the ink (my fixtures show they work,
  but no row holds them).
- **Check:** a ws-backtest-coverage check that lists every rule in `rules[]` and fails a rule with no row.

**D6 (C4): the messages do not name the real limit.**
- EB-SIDE prints no limit. Under `--margin 2` a "28 %" finding reads as below 30 %.
- On print cells it says "content pinned to one side", which is not the print rule.
- Its % is of the inner width, while the message names the outer width: 66.7 / 183.9 mm printed as "37 %".
- EB-FOOT does not name its 10 % limit.
- **Check:** a self-test asserting that every `F()` message contains "limit".

## Minors
- **m1:** Transparent-bordered elements count as ink (`stroked` ignores the border colour). pv.js, frac-model.js and
  long-division.js use them, but only on small ring boxes today.
- **m2:** SVG `fill-opacity:0` counts as ink.
- **m3:** `--html` ignores `--report-only`, `--json` and `--only`.
- **m4:** precritic drops `--margin 2` for every skill in a run when any one skill is pinned.
- **m5:** The screen EB-SIDE does not flag an off-centre 45 % / 12 % layout.

## Scores
- **C1 6:** The class is caught on fixtures and on the real head. The measure is lenient by up to 18 points (D1), and blank
  cells pass (D2).
- **C2 8:** No false alarm in the samples I checked (opener bands, EB-EDGE overflow, card 390).
- **C3 6:** D3, D4 and D5.
- **C4 7:** Runtime is good (68-120 s per skill). The DOM measure duplicates the pixel one, and the messages fall short (D6).
