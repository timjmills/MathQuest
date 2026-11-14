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
- 2026-11-14 01:00Z: +$40 granted (stop at $609.70), for the chart_120 r2 fixer and its r2 critic ONLY.
- chart_120 (this branch): critic r1 FAIL (critic-r1.md, 28096aaa7). The r2 fixer is running on the F1 class (wrongAnswer / Steps / Say / hints on every gap), F2, F4, F5, F6, F9 and F10. F8 was decided by the lead: 101–110 only (LEAD_DECISIONS).
- word-stories: PARKED at 16b5d8ccd (-lf-builds-stories) until the reset (Thu 2026-11-19 22:00Z) or until budget frees. Resume notes below.

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
