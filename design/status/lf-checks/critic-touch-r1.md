# lf-checks TOUCH-HIT de-flake + WS-REFLOW slot x: independent critic r1

Critic: Opus 5.5 medium (narrow tools critic). Date 2026-11-13. Graded `git diff d23e42fa6..436d83373` only
(branch claude/sweet-newton-c8wrv1-lf-tools-touch).

## Verdict: PASS. C1 9 / C2 9 / C3 8 / C4 8

## What I ran (one browser gate at a time, through /tmp/mq-browser-run.sh)

| Check | Result |
|---|---|
| Planted true misses, `--fixture <f> --only TOUCH-HIT`, de-flaked tap vs `--no-retap` | every one FAILs in both modes: **flee** (box jumps away on mouseover) 8 findings; **offscreen** (box 30 px off the left edge, cannot scroll in) 5; **sticky** (fixed 72 px header over the box, page cannot scroll) 3; **blur-flash** (overlay for 150 ms after each blur) 1 (old tap: 3); **first-tap-veil** (overlay for 400 ms after the first tap) 3 |
| **blink** (an overlay over the bottom 12 px, on half of every 46 ms) x 5 per mode | de-flaked: FAIL 4 of 5 (plus 1 of 1 earlier); old tap: FAIL 4 of 5. Caught about as often as before |
| TOUCH-HIT on sub_100_no_regroup + placevalue:expand, 4 widths x card / worksheet / quiz, 3 runs | OK 3 of 3, "re-taps that held 0" every time (371 s, 388 s, 376 s) |
| The same with `--no-retap` | FAIL, 3 misses: two land on the NEIGHBOUR box (typed box 1, column-answer-input bottom edge), one on body (ib-cell). This confirms the cause the builder names: the tap point was stale, and settling alone removes it |
| `ws-backtest --row touch-hit-settle-retap,touch-hit-overlay-true-miss` | 2 PASS (FAIL to OK on each) |
| `ws-backtest --row ws-reflow-slot-x`; `ws-worksheet-reflow --self-test` | PASS; 17 cases OK (1 px holds, 2 px fails, a lost slot fails) |
| `ws-worksheet-reflow` (full, HEAD) | OK on 6 skills x 4 widths |
| `ws-worksheet-reflow --sample-only subtraction:sub_word_problems` on master a8258e3f3 (MQ_ROOT) vs this baseline | FAIL, 18 slots moved 3.0-4.3 px at every width (e.g. 820 card 1 slot 11 132.7 -> 137). This is the lf-hosts r2 F1 column gap `max(4px, ...)` in css/screen-cell.css, which passed critic r3, so the re-pin from d23e42fa6 is justified. Every other baseline field is byte-identical to d23e42fa6 (only `slotXs` / `slotXsFrom` were added; 20 keys from a8258e3f3, 4 sub_word_problems keys from d23e42fa6) |
| `ws-backtest --help` | usage printed, exit 0, runs no row; `--self-test` asserts it |
| `ws-touch-diff --skills subtraction:sub_100_no_regroup --sizes 1280x900 --items 1`; `--self-test` | OK (no cell differs vs origin/master 88cc98b00), 38 s, temporary worktree removed; self-test OK |
| `ws-precritic-plan --checks-from-critics` | OK; 142 pass / 36 exempt / 15 fail. The 15 are earlier rows (lf-ops, lf-vocab, lf-roles, lead); none of the 3 new rows is dropped |
| `ws-no-phone-width` | OK |
| On precritic's path | yes: `phone-card` and `worksheet-reflow` gates in ws-precritic.cjs (lines 1080-1081) |

Code read: the judge works slot by slot, on x only (`Math.abs(now[j] - x) > TOL_X`, TOL_X = 1.5). A different slot count per card
fails. A baseline key without `slotXs` is not judged, but all 24 keys carry it. The re-tap only runs after a miss, reads the point
again after a fresh settle, and reports the finding only when the second tap also misses. `--no-retap` turns off both the settle
and the re-tap.

## Defects (none blocking)

1. **m1 (C3): runtime +62 %, slightly over the 20-60 % bound.** On the same two skills, TOUCH-HIT took 376 s on average
   with the settle vs 231 s with `--no-retap`. Most of the cost comes from the minimum of 2 frames per probe (8 probes per box).
   The status note does not give the cost. *Automatic check:* make ws-phone-card's last line print the TOUCH-HIT seconds, and
   have ws-precritic warn when the phone-card gate's time grows more than 50 % over its recorded median (an append to
   `metrics.md`). *Speed-up:* skip the settle loop for the second and later probes of the same box when the first probe found
   the page still (the scroll position is unchanged).
2. **m2 (C1, residual): one repeat is now needed to report a miss.** An intermittent overlay (blink) is caught about 80 % of
   the time, the same as the old tap here. A miss that comes and goes therefore needs two misses on the same probe. This is
   the right trade-off for a gate that has to stay deterministic, but no row covers it. *Automatic check:* a backtest row
   `touch-hit-blink` that runs the blink fixture 3 times and expects at least 2 FAILs, or a `--touch-debug` count of misses
   that held, reported as a warning when it is above 0 on a lane's own skills.
3. **n1 (C4): the reflow tail line still says "hold against 77f0acad2".** That is the pin of the other fields. The slot x
   values come from a8258e3f3 / d23e42fa6. *Fix:* print the `slotXsFrom` set in the OK line.
4. **n2 (C4): the lf-hosts critic r3 said "the r1 F4 gap moves boxes <= 1 px".** On sub_word_problems the move is 3.0-4.3 px,
   because it adds up across columns. The builder's note says 3-4 px, which is correct. The 1.5 px tolerance still holds for
   the other 20 keys on HEAD.
5. **Process (not graded against this diff): the branch is NOT merged with the current master** 88cc98b00. It conflicts in
   CHECKS_FROM_CRITICS.md, speed-audit.md, backtests.json and ws-precritic.cjs (append-tail tables and lf-hosts code). Under
   "clean before critic", the lead must merge, re-run precritic `--strict` and `ws-backtest --row` on the 3 new rows before
   the deploy train. *Automatic check:* ws-precritic should refuse to report OK when `git merge-base --is-ancestor
   origin/master HEAD` is false.

## Speed notes from this round
- The planted fixtures (flee, offscreen, sticky, blur-flash, first-tap-veil, blink) took about 1 s each through `--fixture
  --only TOUCH-HIT`. Adversarial planting is cheap; future touch changes should ship two or three of them as rows.
- ws-touch-diff on one skill at one width took 38 s, against 6 min for a full TOUCH-HIT run. Use it as the first look.
