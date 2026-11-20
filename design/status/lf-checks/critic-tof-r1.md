# Critic: ws-tof-stem sweep hardening, round 1 (independent, Opus medium, 2026-11-19)

Graded: `git diff 448bc5e74..369950bb0` (tests/scripts/ws-tof-stem.cjs, tests/lib/ws-harness.cjs, backtests.json row
`tof-stem-retry`, CHECKS_FROM_CRITICS row, status note).

## Verdict: PASS (C1 9, C2 8, C3 9, C4 8)

## What I ran
| Check | Result |
|---|---|
| A. Real defect, no crash: new script with `MQ_ROOT` set to the TOF-STEM fail tree 05dbd1149 (count_by_tables, add_missing_digit, add_three, seeds 7,23) | `FAIL - 18 finding(s) in 3 skill(s)` |
| B. Same defect, browser killed on the defective skill's first try (`MQ_TOF_CRASH_AT=0`) | `FAIL - 18 finding(s) in 3 skill(s)`, retried 1, restarts 1: the retry does not hide the defect (a stem violation is a returned finding, never an exception, so it is never retried away) |
| C. Crash on BOTH tries (scratch copy without the `attempt === 0` guard, deleted afterwards) | `FAIL subtraction:subtract_within_10: not measured (crashed or timed out twice)`, `FAIL - 1 finding(s)`, exit 1; the other 2 skills were still measured |
| D. 33-skill subset (30 spread over the live list + the 3 tof-stem fixtures): old script (448bc5e74) vs new `--restart-every 1000` vs new `--restart-every 3` (10 restarts) | verdict lines byte-identical after dropping `sweep:`: `OK (33 skills, 32 with frames, 395 frames, 126 equation stems)` |
| `ws-backtest --row tof-stem-retry` | FAIL side FAIL, PASS side OK: `ws-backtest: OK` |
| Full sweep via /tmp/mq-browser-run.sh | `728 skills measured 728, browser restarts 18, retried 0, 456.6 s`; `ws-tof-stem: OK (728 skills, 701 with frames, 7623 frames, 2103 equation stems)` (the builder saw 348 s; the slower time here comes from a busy container with other gates running) |
| `ws-precritic-plan --checks-from-critics` | `298 pass, 82 exempt, 0 fail`, OK (none dropped) |

## Criteria
- **C1 correctness 9.** Real fails still fail, even when a crash hits the failing skill. A skill lost twice is a FAIL that is named, and it counts in `skills hit` (the trailing colon is stripped). On a clean subset the results match the old single-evaluate run exactly. Not tested: a subset that FAILs, compared old vs new. Run B matches run A, which covers most of that gap.
- **C2 checks prove it 8.** The backtest row proves that a crash is retried. It does not prove: (a) that the skill lost twice is a FAIL; there is no env hook for a second crash, so I needed a scratch copy; (b) that a retried skill still reports its findings; (c) that all 4 skills were measured. The grep `retried 1` would also match `retried 10`. It would be better to grep `measured 4, .* retried 1,` together with the verdict.
- **C3 no collateral 9.** The `protocolTimeout` option in `open()` is spread into the launch options only when it is set. Every other caller of `open()` gets exactly the old launch options. The verdict lines are unchanged. `MQ_TOF_CRASH_AT` is read only in this script.
- **C4 clarity 8.** The header comment, the `sweep:` line and the retry log lines are clear. Small points:
  - The first skill-list `evaluate` has no retry, so a crash there exits with no verdict line.
  - After a skill's second failure the script launches one more browser than it needs.
  - On the TOF fail-commit side the backtest took 510 s. The likely cause is waiting in the browser queue on a shared container. It is worth watching against the backtest TIMEOUT.

## Automatic checks this round suggests (for the lane, not blocking)
1. Add `MQ_TOF_CRASH_AT=<n>:2` (crash on both tries) and a backtest row that expects `not measured (crashed or timed out twice)` plus `FAIL`.
2. Tighten the `tof-stem-retry` grep to `measured 4, .*retried 1,`.
