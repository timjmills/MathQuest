# Critic r7: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 720e5af6b (frozen)

Independent critic, Opus medium, 2026-11-13. Worktree /tmp/claude-0/wt-eb7. Browser runs one at a time through /tmp/mq-browser-run.sh; probes in the critic's scratchpad. No tracked file edited except this report.

**VERDICT: PASS.** C1 9 · C2 8 · C3 8 · C4 8. It may land on master.

## Evidence so far (runs)
| Run | Result |
|---|---|
| `ws-empty-band --self-test` | OK (19 rules/cases with a row; EB-ROLE exempt with reason; EB-FOOT pairing 21 + columns 3) |
| `ws-screen-answer --focus-gap-self-test` | OK (10 cases + 3 ink calibrations) |
| `ws-precritic-plan` | OK (144 rows on the lane's path) |
| r6 q1 (faint top, 2 px #000 bottom) / q2 (2 px top, faint bottom) | FAIL / FAIL ✓ |
| r6 q3 (dark top + bottom) / q4 (faint slot beside a dark closed box) | OK / OK ✓ |
| q5 = wide-slot-faint.fail / q6 = wide-slot-invisible.fail | FAIL / FAIL ✓ (D1 fixed); screen-side.pass OK ✓ |
| u1: 95 mm input, dark 2 px underline only | OK ✓ (the underline is drawn across the side) |
| u2: 95 mm input, dark 2 px LEFT edge only | FAIL EB-SIDE 97.0 mm (60.8 %) ✓ |
| u3: 95 mm input, dark RIGHT edge only | OK (the far-right stroke is real ink; the 85 mm hole in the middle is not a side band: see m2) |
| c1 / c2 / c3: faint 95 mm input, text-align centre / right / left | FAIL 48.6 mm (30.5 %) / OK / FAIL 93.3 mm ✓ (digit placed by text-align) |
| `git diff origin/master -- css/screen-cell.css` | 64 lines added, 0 removed ✓ additive |
| FOCUS-GAP probe: 2-line wrapped label above the box, line 2 at the ring / 12 px clear | finding 3 px / none ✓ |
| FOCUS-GAP probe: wrapped label, box mid-line, word flush / 12 px clear | finding −5 px / none ✓ |
| **FOCUS-GAP probe: a 2-line text node under the ring, line 1 x-height only ("wer once"), line 2 "Tall"; pixels 5 px clear** | **finding "0 px"** ✗ (false alarm, m1); the same node without "Tall": no finding ✓ |

## Static review notes (so far)
- `--slot-ink off` port vs master's DOM version: the pixel tool skips a PRINT slot's virtual ink and lets its drawn pixels speak (a closed box's side edges ink every row; an underline only its line). Faithful to the critic's row scan, and stricter than master on an underline-only slot (master counted any stroked slot whole). Differences: the top pad is still excluded from the band above (master: "padding included"), the per-run `slot ink on/off` note is gone, and the legacy note lost its measured %.
- EB-FOOT multi-item cells: `b.combo` is never produced (no writer in print-sheet.js or the tool), so every multi-item cell is a NOTE, never judged. Honest in the code ("none today"), but claim (b) "judges every indexed grid cell, multi-item cells included" overstates it.
| `ws-backtest --row` (all 39 main-table rows calling ws-empty-band or ws-screen-answer; 2369 s) | 34 PASS, 3 FAIL, 2 PENDING. FAIL: eb-fact-roles (known, facts lane); **eb-vocab-match3-guided** (pass state 6cec18b7 FAILs EB-GDPCAP 2, a rule newer than the row; the row has no `--only EB-BAND`); **vocab-r9-gdpcap** (pass state b28f3960 FAILs EB-ROLE 3: the card offers Stretch, the app at that commit does not compose it). Both rows arrived from master in this merge, are master's rules, and are not in the lane's KNOWN list (m3). PENDING: eb-foot-gridcols-patterns, eb-foot-review-add-facts. All new rows (wide-slot-faint/invisible, faint-slot, sa-focus-gap-cellslot-ws, sa-focus-gap-ibcell-card, sa-focus-gap-unit-form, eb-vocab-pick3-ea-s-critic) PASS |
| `--slot-ink on/off`, print cell 50 mm with a 30 mm empty slot: closed box / underline only / no stroke | on: OK / OK / OK; off: OK / FAIL / FAIL ✓ (a closed box's side edges ink every row; an underline only its own line) |
| Review index pairing: `add_facts --roles review --sizes S --no-baseline --only EB-FOOT` | 16 cells of 28 dealt, no fallback note; cells 13-16 judged against items 25-28 (17 % over) ✓ |
| facts pin `--skill add_facts,mult_facts,div_facts --vocab-ink --page-fill` | OK (276 renders, 2555 cells, 828 within the pin; 9 "tighten the pin" notes) |
| `ws-screen-answer --focus-gap-all` | OK, no FOCUS-GAP finding on any host |
| `ws-phone-card --skills placevalue:unit_form,division:div_facts` | OK (12 of 12; A14 siblings clean; 78 s) |
| `ws-boot-smoke` | OK |

## Verified since r6
- **D1:** a screen slot is ink across its width only where it draws a dark top or bottom line. A dark side edge counts only at that edge, and a slot with no dark edge counts as one digit placed by text-align. q5 and q6 now FAIL, u2 (left edge only) FAILs, and c1/c2/c3 place the digit correctly. q1-q4 are unchanged.
- **r6 m1:** every pairing that is not a fully judged index page prints its mode (self-test, 21 cases).
- **r6 m2:** FOCUS-GAP measures to glyph ink above and below the ring. The probes pass: a 2-line wrapped label above the box, and a box mid-line beside a word that is flush or 12 px clear.
- **(a)** The CSS change is additive (64 lines added, 0 removed), and the rows sa-focus-gap-cellslot-ws and sa-focus-gap-ibcell-card PASS.
- **(b)** Review index pairing judges each drawn cell against its own item.
- **`--slot-ink off`** is ported faithfully to the pixel scan, and eb-vocab-pick3-ea-s-critic PASSES.

## Defects (all minor; none below 8)
- **m1 (C2) FOCUS-GAP false alarm on a wrapped text node.** `ink()` measures the WHOLE node's text and applies it to every line rect. Probe: under the ring, line 1 "wer once" (x-height letters only) and line 2 "Tall". The pixels are 5 px clear, but the tool reports "0 px". **Check:** measure each rect's own substring (a Range per line), plus a self-test case "x-height line 5 px under the ring, ascenders on line 2: no finding".
- **m2 (C3) two red rows the lane did not list.** eb-vocab-match3-guided fails EB-GDPCAP on its pass state and needs `--only EB-BAND`. vocab-r9-gdpcap fails EB-ROLE (Stretch) and needs `--only EB-GDPCAP`. Both came from master. **Check:** pre-flight runs `ws-backtest --row` over every row that calls the tool, and lists every red row as known or routed.
- **m3 (C4) the `--slot-ink` port drops two outputs from master.** The per-run "slot ink on/off" note is gone, and the legacy note no longer gives its %. The top pad is still excluded under off (master said "padding included"); this is undocumented. **Check:** a note naming the mode, and a self-test assertion on it.
- **m4 (C1/C4) multi-item cells are never judged.** No code produces `b.combo`, so every multi-item cell is only a note. Claim (b) overstates this. **Check:** either the bridge emits the measure for each combination, or the status file says "multi-item cells: noted, not judged".
- **m5 (C1, scope) an empty middle is not judged.** u3 is a 95 mm slot with only its right edge drawn. It reads OK, with an 85 mm hole between the box and that edge. EB-SIDE judges the outer bands only. **Check (optional):** a horizontal "between" band, the twin of EB-BAND between.

## Scores
- **C1 9:** every D1 probe reads right, as do the print slot-ink probes and the Review index pairing.
- **C2 8:** one rare FOCUS-GAP false alarm (m1); no false alarm elsewhere.
- **C3 8:** self-test, plan, 34 of 37 live rows green; eb-fact-roles routed; m2 open.
- **C4 8:** messages are clear and the CSS is additive; m3 and m4 are gaps in what the output says.
