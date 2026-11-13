Lane: lf-hosts
Title: Screen hosts: 0-cell guard, 390 touch targets, quiz label ink, two-step host parity, SIZE-REF / SIZE-WIDTH
Session: session_013pHDnQ4fgVajj5vZ6fwpwV
Branch: claude/sweet-newton-c8wrv1-lf-hosts (item 4: claude/sweet-newton-c8wrv1-lf-hosts-twostep, on lf-algebra 8438ca59d+)
Owner of files: screen host code (screen-cell / practice card / quiz host) for items 1-4; host checks for items 1-5 (ws-screen-ink-size SIZE-REF / SIZE-WIDTH)
State: passed
Updated: 2026-11-13
Builder profile: mq-opus-medium
Critic rounds: 3, PASS r3 (8/8/8/8 card, worksheet, quiz)

## Now
- Items 1-3 PASSED critic r3 (8/8/8/8 on card, worksheet, quiz at 820/1024/1280/1366). Deploy head sent to the lead (see Log).
- Item 4 (two-step) done on claude/sweet-newton-c8wrv1-lf-hosts-twostep @ 5719fe9b6 (on lf-algebra, no master); lead routed it to lf-algebra (merge master, then take the branch).
- Lane folds into lf-checks (owner fast plan). Remainder handed to lf-checks: see "Hand-over".

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
- 2026-11-13: critic r3 PASS on 9a880edf1; master a8258e3f3 merged after (conflicts unions, 390 backtest rows, none dropped); deploy head sent with 8 before/after PNGs in design/status/lf-hosts/deploy/.
- 2026-11-13: critic r2 FAIL (C1 7): F1 real taps hit the neighbour box (overflow wrapper clipped the 48 px padding) -> TOUCH-HIT; F2 precritic screen gates at 390 -> ws-screen-widths-plan; F3 CELL-READ by construction; F4 quiz flake; F5 WS-REFLOW growth-only. All fixed with rows.
- 2026-11-13: critic r1 FAIL (worksheet C3 5): F1 worksheet digit raise reflowed passed skills -> raise removed, WS-REFLOW ratchet; F2 conflict markers committed by my merge -> ws-conflict-markers gate (landed via lf-checks); F3 yellow focus ring; F4 1 px overlapping hit areas -> TOUCH-UNIQUE; F5 fixed sleeps.
- 2026-11-13: owner plan: no phone width (820/1024/1280/1366), print sizes M/L; lane folds into lf-checks after this round.
- 2026-11-13: usage limit hit; builders and critic stopped. WIP saved and pushed (g9 9d6ef44a4, twostep 6449153cb). No critic verdict yet; nothing ready to deploy.
- 2026-11-13: lead ruling: worksheet contract floor = 29 px (SP table, TY-10b count rows); card/quiz 40/48/56; hand-off 1's worksheet raise kept + ratcheted if r1 passes. Hand-off 2 cherry-picked (not merged: -r2 under its own critic) on claude/sweet-newton-c8wrv1-lf-hosts-g9 with the G9 fix + ink-size CELL-READ (builder running).
- 2026-11-13: merged lf-checks hand-off 1 (0b862753) into 3c7b548a; backtests.json conflict resolved as a union (313 rows, none dropped). touch-target-sub-wp-390 read FAIL on its pass state once in a 6-row batch, PASS alone: flakiness under critic review.
- 2026-11-13: lane opened by the lead; branch cut from origin/master 77f0aca.
