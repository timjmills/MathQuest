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
- PAUSED for rulings (cost_usd $104.50 at 2026-11-13T04:10Z of the $140 approved; weekly-limit warning showing).
- word-stories fix round 2 done on claude/sweet-newton-c8wrv1-lf-builds-stories at e02c6cd66. Precritic r3 has 18 FAIL vs master's 22 on the hosts. Every FAIL left is at master's level or class, or pinned with evidence (design/audit/runs/lf-builds/stories/precritic-diff.md). Fixed: the hosts' lesson overflow (grade-render 48 → 0), preset lesson data. ws-lesson-baseline --all-lessons: 1556 hashes identical. g1-oa1 --check E9/E35 as master, --repeats OK; g3-oa8 OK. 6 PNGs committed.
- Blocking a critic: (a) Reason It on the sentence-layout stories prints the "added" wrong answer under a − sign (11 − 2 = 13): reason-it.js does not pass shownSlots, a role-wide engine fix; (b) owner rulings: the band null default (re-sign or pin), and compare-preset capacity 9 vs 11 at S; (c) presets missing from the card's rulings block (card-rulings INCOMPLETE; needs a re-sign).
- chart_120 still red (see the 2026-11-13 log); not resumed. times-as-many and partition are not started.
## Owner go

## Open questions
- Lead: confirm the order above and the hand-off of patterns_notice / growing_shape_patterns / multi_step_four_ops to the algebra lane.

## Times
Times: fix word-stories r2, start 2026-11-13T00:58Z, end 2026-11-13T04:05Z (one restart), profile mq-opus-medium
Times: builder word-stories, start 2026-11-12T23:15Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-medium
Times: builder chart_120, start 2026-11-12T23:12Z, end 2026-11-13T00:50Z (killed by restart), profile mq-opus-low
Times: builder cards partition / times-as-many / word-stories (parallel), start 2026-11-12T22:20Z, end 2026-11-12T22:35Z, profile mq-opus-medium
Times: builder chartwindow card, start 2026-11-12T22:05Z, end 2026-11-12T22:12Z, profile mq-opus-medium

## Log
- 2026-11-13: word-stories fix r2 brought precritic to master level; a critic is blocked on a Reason It engine defect and on owner rulings.
- 2026-11-13: paused at budget (precritic red on both builds); two container restarts lost the final gate runs.
- 2026-11-12: owner approved all four cards as recommended; lead signed them (9f2d3ea5); cap raised to $80.
- 2026-11-12: four cards drafted and sent to the lead; lead confirmed the order and the algebra hand-off.
- 2026-11-12: lane started from master d34311d; scope check sent to the lead.
