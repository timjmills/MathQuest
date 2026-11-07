Lane: lf-engine
Title: Lessons phase 0 fix round, the lesson compiler (E4), and its proof
Session: session_013pHDnLTpMERUWs7oNEgzJ3
Branch: claude/sweet-newton-c8wrv1-lf-engine
Owner of files: lessons/{library,schema,compile}.js, lessons/shapes|units|families, sheet/lesson-pages|lesson-arch, roles/{lesson,detailed-lesson,pre-skill-check}.js, print-sheet buildLesson/buildDetailedLesson, ws-lesson-{card,seed,coverage,hash,unit,baseline}, design/lessons/
Builder profile: mq-opus-medium
State: fix
Updated: 2026-11-07
Critic rounds: 2, FAIL min 6 (r2: N1 sub L sheet lost its Independent row)

## Now
- Critic r2 FAIL min 6 (design/audit/runs/lf-engine-p1-r2/): add + round sheets PASS 8 at L and S; every check / key / routing page 7 (near-miss); sub L sheet 6 (N1, D10 regressed); engine 6. N1-N8 handed to P1b (round 3 on these pages; rule 7 applies).
- P1b running: live lesson defects R1 R2 R4 R5 R10 (lf-checks bisects), lesson 7 D2 enforcement, the samples' Practice / Mixed H13 and LR-5.
- P2 compiler merged (feea00b2): 7 proof cards compile; node gates green; SHAPES.md classifies all 843 queue lessons.
- P2b proof (render diff of lessons 1-5, hold-outs 6 and 7, critic) waits on P1b.
- Pilot command ready: `node tests/scripts/ws-lesson-card.mjs --draft --unit G3-Y4.B4`.

## Owner go

## Open questions
(none: owner ruling 2026-11-07, the lane decides card lines from the standards; decisions are in LESSON_RULES LR-17a and the cards)

## Log
- 2026-11-07 — Merge: phase 0 + integration tip 623fdd6 (744aa9e5); 5 conflicts; master's lesson 6/7 + visual-quality hunks ported into lesson-pages/* and lesson-arch/*; master's new lesson records ported into families/addsub.js, multdiv.js. Oracle ws-lesson-baseline vs master: 183/183 detailed hashes identical, 120 sample hashes differ (LR-17, intended). Lesson 2 errors on master too (R1).
- 2026-11-07 — P2 compiler (fbdd7a08, 33c12857, merged feea00b2): card format (design/lessons/cards/README.md), ws-lesson-card (--draft, --check, --check-decided), compileLesson, shapes/, units/, SHAPES.md, queue reads SHAPES.md; DIFF.md structural diff of 1-7.
- 2026-11-07 — P1 fix round (4d956947..ec654c84): see the builder report below (Per finding).

## Times
- Merge + oracle: 06:25-06:40 UTC (baseline runs 2 × ~5 min).
- P2 builder: 06:33-06:58 UTC (node only, parallel worktree).
- P1 builder: 06:41-08:18 UTC (browser).
- Critic r2 + P1b launched 08:25 UTC.

## P1 per finding (builder report)
| # | Result |
|---|---|
| D1 | fixed (data: number_seq_fill kit track); lint: lf-checks |
| D2 D3 D5 | fixed (pinned options, dealt before choosing) |
| D4 D9 | fixed: one grid (routedLayout), bands 18-27 %, foot 6-9 % at L and S |
| D6 D7 | fixed in data (patterns:skip_count_line multiples of 10) |
| D8 | fixed: no `check: true`, level 0 measured and drawn |
| D10 D11 | fixed on Prerequisite-Check sheets only |
| D12 | fixed + check `lesson-prereq-checks-field`; routing table own key page "Prerequisite Check: where next" |
| D13 | fixed + check `lesson-title-constant` |
| D14 | detailed T6 kept (different columns; moving it changes passed lessons); claim corrected; check `lesson-routing-one-builder` |
| D15 | fixed + check `lesson-route-no-literal-styles` |
| D16 | fixed + check `lesson-routed-plan-units` |
| D17 | fixed + check `lesson-bind-stamps-refuses` |
| D18 | fixed + check `lesson-parts-plugin` (per-part build hooks, registry order, order-7 part lands second) |
| D19 | lf-checks (frame closure) |
| D20 | decided: curriculum order, most basic first (LESSON_RULES LR-17a) |
| L7 D1 | chartPage reports sizing {mode, zoom, fallback, ok}; buildLesson chartSizing, buildDetailedLesson chartsOk; check `lesson-chart-sizing-fails` |

## Precritic (P1, ec654c84)
| Gate | Result |
|---|---|
| ws-precritic --role lesson --strict | FAIL: print-lint +13 over pin (12 also on master: other families' PG-12 / L-OVERLAP; 13th coordinates H13 not reproduced alone); ws-teacher-wrm FAIL = lesson 2 build (R1, master too) |
| ws-lesson-check | FAIL 597 (LR-5 430, LR-13 85, LR-1 62 ...; 572 on the phase 0 head) — Practice / Mixed / chart classes, P1b |
| ws-lesson-baseline | 183 detailed identical; 120 sample differ (intended) |
| ws-lesson-unit (155), ws-layout-unit (1758), ws-lesson-coverage, ws-lesson-seed --check, ws-lesson-compile-unit (45), ws-lesson-card --check, ws-boot-smoke, ws-code-snapshot (732), ws-backtest, ws-precritic-plan | OK |

## Per-round findings (rule 00)
### P1 fix round
Automatic checks: check-page H13 / foot made blocking in precritic (lf-checks); a measured-vs-drawn height probe (legacy / fact cells measure 10-25 mm taller than they draw); LR-5 keys count_objects items by picture, not text; precritic --role lesson runs ws-lesson-unit and ws-lesson-coverage.
Speed-ups: a single-part render harness (`--parts prereq|sheet`, one lesson, PNG + band stats) cut each layout iteration to ~45 s — give ws-lesson-samples a `--parts` flag; dealing every prereq ref before choosing caught three bad choices without a render; background gates need the maximum timeout (a precritic run was killed at 600 s).
### P2 compiler build
Automatic checks: built in — script-vs-page "no X" refusal (L7 D3), placeholder resolution, timing = 60, option values vs schema, range floor vs band, prerequisite lesson ids real. Proposed: a passed lesson's card fails when its `--from-detailed` reseed differs; NEEDS per lane counted in the build list; every provider wrongAnswers id declared in its misconceptions; a backtest row for the D3 refusal on lesson 7 r1 text.
Speed-ups: seed cards from passed lessons (`--from-detailed`); item readers per template, not per shape; shared-section slot rule (−25 lines a lesson); `--render --decided` instead of hand-editing the markdown.

### Critic r2 (FAIL min 6)
Automatic checks: a lesson sheet holds ≥ 1 Independent row + Score at every size, blank foot ≤ 20 % blocking (N1); pre-skill-check plan() unit test — every question ≥ its items, no two-choice item alone (N2); routing page states the miss threshold, routed bands carry __/n (N3); LR-6 over the prereq part (N4); tab-to-content padding and paired-band alignment lints (N5, N6); routed titles carry a topic (N7); Guided and Independent cells of one sheet share structural parts (N8).
Speed-ups: r1 and r2 page side by side for every finding marked fixed; a fix scoped to "some sheets" lists every changed sheet's Independent rows before / after; rule text and code held together by a unit test (ROUTE_ITEMS as a floor); ws-backtest in the background with the maximum timeout; the critic graded PNGs without a browser while P1b held it (parallel, no wait).

## Cost
- 08:20 UTC: session cost_usd $39.56 (≈ 2.0 % of the weekly limit at $20 ≈ 1 %).
