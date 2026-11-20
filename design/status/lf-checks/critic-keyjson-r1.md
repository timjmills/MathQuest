# Critic r1 - ws-key-json sweep retry (narrow, Opus medium)

Graded `git diff d38308824..07f40e323` on `claude/sweet-newton-c8wrv1-lf-tools-keyjson` (2026-11-20).
Files: `tests/scripts/ws-key-json.cjs`, `tests/lib/ws-harness.cjs` (`protocolTimeout` option), backtest row
`key-json-retry`, CHECKS_FROM_CRITICS row, `design/status/lf-checks.md`.

## Verdict: PASS (C1 9, C2 8, C3 9, C4 8)

## What I ran (planted tree = detached worktree at HEAD, removed afterwards)

| Test | Result |
|---|---|
| Planted raw JSON `[{"x":3}]` in every key of `multiplication:multiply` (arrangeKey), 4 skills, no crash | `FAIL - 3 finding(s) in 1 skill(s)`, exit 1 |
| Same plant + `MQ_KEYJSON_CRASH_AT=2` (browser killed on multiply's first try) | `retried 1`, same 3 findings, `FAIL` - the retry does not hide the defect |
| Same plant + browser killed on BOTH tries of `subtraction:subtract_within_10` (local-only edit of the crash hook) | `subtract_within_10 not measured (crashed or timed out twice)` counted as a finding; `FAIL - 4 finding(s) in 2 skill(s)` - not skipped |
| 30-skill subset (every 25th live skill + `coordinates:coordinate_q1`, `shapes_early:shape_name_match_3d`), old d38308824 script vs new, clean tree | verdict lines byte-identical apart from the new `sweep:` line: `ws-key-json: OK (30 skills, 381 sheets)` both, exit 0 both |
| `node tests/scripts/ws-backtest.mjs --row key-json-retry` | FAIL 75.0 s / OK 76.3 s, PASS, `ws-backtest: OK` |
| `ws-precritic-plan --checks-from-critics` | 343 pass, 90 exempt, 0 fail - none dropped |

Why a retry cannot hide a defect: a retry happens only when `page.evaluate` throws; a result that comes back is always
scanned, and sheets are seeded, so the retried build is the same sheet. A skill with no result after two tries becomes a
finding, so the exit is 1.

## Notes (none block the pass)

1. **C2 - the backtest is weak on its FAIL side.** The command greps for `retried 1`. The old script ignores
   `MQ_KEYJSON_CRASH_AT` and never prints `retried`, so FAIL on d38308824 shows the feature is missing. It does not show
   that the old gate died on a crash. The OK side also does not assert the closing `ws-key-json: OK` line. A tighter
   row would plant the crash and require `retried 1` AND `ws-key-json: OK` on the pass commit, and the TargetCloseError
   on the fail commit.
2. **C4 - the fail-state wording is inaccurate.** The backtest row and the brief say "one browser for the whole sweep".
   d38308824 already restarted every 40 skills and ran one evaluate per skill. What it lacked was crash recovery, a
   retry and the 120 s protocol timeout.
3. If `H.open` itself fails inside `fresh()` (after a crash), the rejection is unhandled and the run exits non-zero
   without a verdict line. That is loud, not a false OK. It is acceptable, but a `FAIL - browser would not restart`
   line would be clearer.
4. The `restarts` counter also counts the extra `fresh()` after a second failure. It is cosmetic.

C3: the harness change is additive (`protocolTimeout` is spread only when given), so other callers do not change. The
30-skill comparison shows no change in verdicts.
