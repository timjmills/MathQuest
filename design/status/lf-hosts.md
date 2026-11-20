Lane: lf-hosts
Title: Screen hosts: 0-cell guard, 390 touch targets, quiz label ink, two-step host parity, SIZE-REF / SIZE-WIDTH
Session: session_013pHDnQ4fgVajj5vZ6fwpwV
Branch: claude/sweet-newton-c8wrv1-lf-hosts (item 4: claude/sweet-newton-c8wrv1-lf-hosts-twostep, on lf-algebra 8438ca59d+)
Owner of files: screen host code (screen-cell / practice card / quiz host) for items 1-4; host checks for items 1-5 (ws-screen-ink-size SIZE-REF / SIZE-WIDTH)
State: paused
Updated: 2026-11-20
Builder profile: mq-opus-medium
Critic rounds: 3, PASS r3 (8/8/8/8 card, worksheet, quiz)

## Now
- 2026-11-20: lesson player slice 1 LIVE (I do, board, add-within-10, D11 part bar; 4 critic rounds: r1 FAIL, r2 FAIL, cap root cause -> stage-fill check, r3 FAIL at 820 only, A26/A26b fix, narrow 820 PASS; all widths >= 8). Parked. NEXT WEEK: slice 2 (We do) at medium, then the remaining parts; D12 itemsFor(req) stays a clean public function for My Worksheets.
- 2026-11-20 STOPPED at the round cap: lesson player slice 1 (claude/sweet-newton-c8wrv1-lf-hosts-player-s1 @ 68b6ba366). Critic r3: board 1920, desktop 1280/1366 and tablet 1024 all >= 8; FAIL only at 820 (C2 7 / C4 7): in the stacked layout the count-on hops (5 6 7) sit directly above the sum and can read as a top row of the addition (paper puts them beside). Fix: hops below the answer row or beside the drawing at 820; check: --render asserts hops never above / overlapping the drawing in a stacked layout. Lead decides: fix next round, or ship without 820.
- Digit-floor fix (35f9fc8ae) with the lead for deploy.
- 2026-11-20 (resumed, +$50): host fit digit floor + fit reset (lf-algebra fitk2 ported) - deploy head 35f9fc8ae sent, lead deploying after lf-engine; new ws-fit-floor, rows fit-floor / twin-fit-reset. Lesson player card SIGNED with D11 (any part, any order) and D12 (any sheet -> interactive; itemsFor(req) stays a clean public function for My Worksheets) on claude/sweet-newton-c8wrv1-lf-hosts-player. Parked after the deploy.
- NEXT WEEK, first item: lesson player slice 1 (I do, board, add-within-10, part bar jumps) at medium, full critic.
- 2026-11-20: Skip button (every student mode), keyboard end-of-run fix, infinite-Finish count and card/add_wp_20 48 px touch targets are LIVE on master 398bb4902. Lane stopped for the week (lead).
- Next week (lead): (1) DIGIT FLOOR in the screen-cell.js host fit pass - never shrink a drawn twin's digits below the 29 px worksheet floor; wrap first, else one column (with lf-algebra, count-row twin to >= 29 px). (2) Interactive lesson player mock (card first).
- Routed, open: ws-worksheet-reflow FAILS on master (placevalue:expand 2 -> 1 columns at 1024; number_patterns_rule numerals 26.2 -> 22.9 px); not re-pinned; owners asked via the lead; proposed for deploy session 1.

## Hand-over to lf-checks
- r3 m1: ws-phone-card TOUCH-HIT timing flake on untouched cells (sub_100_no_regroup / expand bottom edges, add_facts quiz corner; 2-3 random misses a run). Proposed: re-tap a miss after 2 rAF, report repeats only; backtest = 3 runs on sub_100_no_regroup give the same result.
- r3 info: WS-REFLOW per-slot x tolerance 1.5 px (the r1 F4 gap moves boxes <= 1 px).
- Host reds master also has (lead: ours after the round, now lf-checks'): sub_word_problems first focus on the spare hundreds box (FOCUS x8); placevalue:expand quiz inputs 104x46; placevalue:unit_form worksheet boxes 50x46; add_wp_20 bottom-edge taps (fixed on this branch by r2 F1).
- Touch-target residue to re-check at 820/1024: box_division_hard, time_hour, money, vocab pictures, mult_chart*, long_div_2digit, order_negatives, fact families, arrays (r1 sample at 390).
- Speed-ups: tap3-style one-command master diff; `ws-backtest --help` runs every row (should print usage).

## Owner go

## Open questions
- none (worksheet digit floor ruled by the lead 15:35Z, see Log)

## To do after critic r1
- If the worksheet 40/48/56 raise passes r1 with no layout breakage: pin it as a no-regression ratchet (gate fails when a worksheet digit falls below what it prints after the raise); the contract floor stays 29 px.

## Times
Times: critic r3, start 2026-11-13T20:00Z, end 2026-11-13T21:05Z, profile mq-opus-medium (PASS)
Times: fixer r2, start 2026-11-13T19:15Z, end 2026-11-13T20:30Z, profile mq-opus-medium
Times: critic r2, start 2026-11-13T18:50Z, end 2026-11-13T19:10Z, profile mq-opus-medium (FAIL C1 7)
Times: fixer r1, start 2026-11-13T17:20Z, end 2026-11-13T18:45Z, profile mq-opus-medium
Times: critic r1, start 2026-11-13T15:30Z, end 2026-11-13T17:15Z (paused by the usage limit), profile mq-opus-medium (FAIL C3 5)
Times: (all three runs ended ~15:50Z by the usage limit)
Times: critic r1 hand-off 1, start 2026-11-13T15:34Z, end —, profile mq-opus-medium
Times: builder items 1-3 (stopped, superseded by lf-checks hand-off), start 2026-11-13T15:23Z, end —, profile mq-opus-medium
Times: builder item 4, start 2026-11-13T15:23Z, end —, profile mq-opus-medium

## Log
- 2026-11-20: Skip: build, narrow critic r1 FAIL (card C1 5: run ended under the intro; total off by one; timer; quiz count; blank = wrong; wrong try hidden), r2 PASS (8/8/8/8, MAP 9). r2 follow-ups: ws-skip waits on state (10 rows 3x PASS), pupil results read Skipped, skip-return re-pointed to 96f23a96c. Lead ruling: MAP still-skipped = incorrect for RIT. End-run bug (3 end modals on Enter) and touch targets fixed as bug fixes with checks (ws-end-run, TOUCH-TARGET tool buttons). Deployed 398bb4902.
- 2026-11-13: critic r3 PASS on 9a880edf1; master a8258e3f3 merged after (conflicts unions, 390 backtest rows, none dropped); deploy head sent with 8 before/after PNGs in design/status/lf-hosts/deploy/.
- 2026-11-13: critic r2 FAIL (C1 7): F1 real taps hit the neighbour box (overflow wrapper clipped the 48 px padding) -> TOUCH-HIT; F2 precritic screen gates at 390 -> ws-screen-widths-plan; F3 CELL-READ by construction; F4 quiz flake; F5 WS-REFLOW growth-only. All fixed with rows.
- 2026-11-13: critic r1 FAIL (worksheet C3 5): F1 worksheet digit raise reflowed passed skills -> raise removed, WS-REFLOW ratchet; F2 conflict markers committed by my merge -> ws-conflict-markers gate (landed via lf-checks); F3 yellow focus ring; F4 1 px overlapping hit areas -> TOUCH-UNIQUE; F5 fixed sleeps.
- 2026-11-13: owner plan: no phone width (820/1024/1280/1366), print sizes M/L; lane folds into lf-checks after this round.
- 2026-11-13: usage limit hit; builders and critic stopped. WIP saved and pushed (g9 9d6ef44a4, twostep 6449153cb). No critic verdict yet; nothing ready to deploy.
- 2026-11-13: lead ruling: worksheet contract floor = 29 px (SP table, TY-10b count rows); card/quiz 40/48/56; hand-off 1's worksheet raise kept + ratcheted if r1 passes. Hand-off 2 cherry-picked (not merged: -r2 under its own critic) on claude/sweet-newton-c8wrv1-lf-hosts-g9 with the G9 fix + ink-size CELL-READ (builder running).
- 2026-11-13: merged lf-checks hand-off 1 (0b862753) into 3c7b548a; backtests.json conflict resolved as a union (313 rows, none dropped). touch-target-sub-wp-390 read FAIL on its pass state once in a 6-row batch, PASS alone: flakiness under critic review.
- 2026-11-13: lane opened by the lead; branch cut from origin/master 77f0aca.
