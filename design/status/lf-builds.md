Lane: lf-builds
Title: New skills for the next CCSS BUILD short lessons (chart_120, map_* bar-model stories, comparison_statements, partition_draw)
Session: session_013pHDnMSgfoUzyk67mk3yjW
Branch: claude/sweet-newton-c8wrv1-lf-builds
Owner of files: design/cards/chartwindow/*, the chart_120 band on composing:hundreds_chart_fill (gen-counting.js chart branch, skill-options.js band list, chartwindow.js widths), design/status/lf-builds.md
State: building (chart_120) / parked (word-stories)
Updated: 2026-11-13
Builder profile: mq-opus-medium (first card on the chartwindow template)
Critic rounds: 1, word-stories r1 FAIL

## Now
- 2026-11-14: STOPPED at the owner's budget stop (cost_usd ≈ $600 of $609.70). The lane folds into lf-algebra's "patterns + word problems" lane per the lead.
- chart_120: critic r2 FAIL (design/audit/runs/lf-builds/chart120/critic-r2.md, 77c32817f). F1–F10 are all closed. Every page type passes at ≥ 8 (M/L) except the three below. Branch HEAD on -lf-builds; card signed at 03c811eed.
  - N1 major: the Model/anchor names a value it does not draw on 2-gap items. Fix: add chartwindow to TRACE_TEMPLATES (scripted-model.js:49).
  - N2 major (F4 class again): screen worksheet and quiz repeat a band-120 window. Fix: run print-sheet's repeat-skip in the screen deal.
  - N3 (F3 class again): the opener's unfilled Say frame is singular (k2.js:481).
  - Round cap: N2 and N3 repeat round-1 classes, so this is a root-cause stop. Build the 3 checks in CHECKS_FROM_CRITICS (2026-11-14 rows, PROPOSED), fix, then ONE more critic round.
  - Not rendered in r2: worksheet/quiz at 1366/820 (the renderer gave 1280 only), hcf {band:120}, grid=whole.

## Resume notes — chart_120 (stopped 2026-11-14)
- Next: one low/medium fixer for N1–N3 with backtests (FAIL 03c811eed → PASS), precritic on both skills, then critic r3 (narrow: N1–N3 + the screen hosts at 1366/820), then the deploy branch with PNGs.
- Routed reds (lf-engine / lf-roles / lf-checks) are listed in chart120/precritic-diff.md.

## Resume notes — word-stories (parked 2026-11-14)
- State: r3 at 16b5d8ccd. The last full precritic (ff819443c) showed 16 FAIL. Table: design/audit/runs/lf-builds/stories/precritic-diff.md "Fix round 3". Critic r1 report: critic-r1.md. Under round cap 2, critic r2 is the last round.
- Lead rulings 2026-11-14:
  (a) sections L PAGEFILL p6/p7 is routed to lf-engine (placeSections in roles/practice.js lays 4-item sub-sections as one-row grids over two pages).
  (b) SCREEN-DIGIT governs answer and working numerals only; numerals in story text follow the TEXT-SIZE text floor. TO DO: scope the check, with a backtest showing a 2-digit story-text number no longer hits while an answer numeral still does.
  (c) Preset forms 4/5 at 5 a page at L: accepted if measured fit (L may hold fewer than M). TO DO: pin it as ruled, with the measurement.
  (d) The Prerequisite Check / guided-band class goes to lf-roles' queue.
- TO DO at resume: merge current master, and re-pin empty-band against current master (not 76bc11c61). Fix the hosts' independent/test M band (2→3) and the host Model spreading to 2 pages. Re-run the full precritic --strict on the 7 skills, then ws-backtest (eb-guided pass state against master's new measure), lesson baseline (the 24 EA-PAD pages are intended), then critic r2 (M/L, 1366/1280/1024/820).
- Open minors with no check: F10 (model page fill, engine), F13, F14, F15 (see critic-r1.md).

## Budget
- Week from 2026-11-13: allocation $200 above the session cost_usd baseline $369.70 (stop new agents at $569.70; lead, design/status/usage-week-2026-11-13.md).

## Open questions
- Lead: confirm the order above and the hand-off of patterns_notice / growing_shape_patterns / multi_step_four_ops to the algebra lane.

## Times
Times: critic word-stories r1, start 2026-11-13T06:40Z, end 2026-11-13T07:50Z, profile mq-opus-medium
Times: fix word-stories empty-band r3, start 2026-11-13T04:45Z, end 2026-11-13T05:50Z, profile mq-opus-low
Times: fix word-stories r2, start 2026-11-13T00:58Z, end 2026-11-13T04:05Z (one restart), profile mq-opus-medium
Times: builder word-stories, start 2026-11-12T23:15Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-medium
Times: builder chart_120, start 2026-11-12T23:12Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-low
Times: builder cards partition / times-as-many / word-stories (parallel), start 2026-11-12T22:20Z, end 2026-11-12T22:35Z, profile mq-opus-medium
Times: builder chartwindow card, start 2026-11-12T22:05Z, end 2026-11-12T22:12Z, profile mq-opus-medium

## Log
- 2026-11-13: word-stories critic r1 FAIL (F1 critical, new); findings → checks rows in CHECKS_FROM_CRITICS.md; paused at budget.
- 2026-11-13: word-stories fix r2 brought precritic to master level; a critic is blocked on a Reason It engine defect and on owner rulings.
- 2026-11-13: paused at budget (precritic red on both builds); two container restarts lost the final gate runs.
- 2026-11-12: owner approved all four cards as recommended; lead signed them (9f2d3ea5); cap raised to $80.
- 2026-11-12: four cards drafted and sent to the lead; lead confirmed the order and the algebra hand-off.
- 2026-11-12: lane started from master d34311d; scope check sent to the lead.
