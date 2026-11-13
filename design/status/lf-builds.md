Lane: lf-builds
Title: New skills for the next CCSS BUILD short lessons (chart_120, map_* bar-model stories, comparison_statements, partition_draw)
Session: session_013pHDnMSgfoUzyk67mk3yjW
Branch: claude/sweet-newton-c8wrv1-lf-builds
Owner of files: design/cards/chartwindow/*, the chart_120 band on composing:hundreds_chart_fill (gen-counting.js chart branch, skill-options.js band list, chartwindow.js widths), design/status/lf-builds.md
State: paused
Updated: 2026-11-13
Builder profile: mq-opus-medium (first card on the chartwindow template)
Critic rounds: 0, none

## Now
- PAUSED at the $80 cap (cost_usd $62.93 at 2026-11-13T00:53Z; remaining budget too small for fix + critic). Two container restarts killed the builders' final gate runs.
- chart_120 built on this branch (2b7749ba3 … e3733905c): band 120 (rows 91–120), preset composing:chart_to_120 (ZG), tags/links/search terms, PNGs. Precritic NOT clean: hundreds_chart_fill 4 FAIL (empty-band 84: EB-BAND 12 / EB-SIDE 12 …; cell-checks 236: OVERFLOW 224, KEYJOIN 8, TAGINK 4; node-lint OPTION-HELP/WRONG-FITS 1; sibling-compare no baseline); chart_to_120 3 FAIL (empty-band EB-FOOT 36, node-lint 1, sibling-compare). Not yet split: which FAILs are pre-existing on master (eb-master.txt / cc-master.txt in the scratchpad were being compared).
- word-stories on claude/sweet-newton-c8wrv1-lf-builds-stories (0c985692a … 9681a9868): live What-is-missing bug repaired, forms 3/4/5, band 10/20/100, First/Then/Now + two-bar drawing (story-bar.js), 3 presets (ZH, ZJ, ZK), card-rulings backtest row. Precritic (pc2, before the last fixes) 11 FAIL: dealer-uniform, node-lint, options-verify, print-lint lesson S/L, print-lint sections S/L, empty-band, grade-render gate ×2, cell-checks. Not re-run after the restart.
- Not started: times-as-many, partition (cards signed).
- Next (fresh budget): fix builder on each branch from the precritic tables (medium: second round), separate master-baseline FAILs first, then critic. ws-detailed-lesson / ws-lesson-baseline results lost in the restarts: re-run.
## Owner go

## Open questions
- Lead: confirm the order above and the hand-off of patterns_notice / growing_shape_patterns / multi_step_four_ops to the algebra lane.

## Times
Times: builder word-stories, start 2026-11-12T23:15Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-medium
Times: builder chart_120, start 2026-11-12T23:12Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-low
Times: builder cards partition / times-as-many / word-stories (parallel), start 2026-11-12T22:20Z, end 2026-11-12T22:35Z, profile mq-opus-medium
Times: builder chartwindow card, start 2026-11-12T22:05Z, end 2026-11-12T22:12Z, profile mq-opus-medium

## Log
- 2026-11-13: paused at budget; two container restarts lost the final gate runs; precritic red on both builds (see Now).
- 2026-11-12: owner approved all four cards as recommended; lead signed them (9f2d3ea5); cap raised to $80.
- 2026-11-12: four cards drafted and sent to the lead; lead confirmed the order and the algebra hand-off.
- 2026-11-12: lane started from master d34311d; scope check sent to the lead.
