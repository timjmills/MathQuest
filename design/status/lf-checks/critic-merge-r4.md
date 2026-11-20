# Critic: ws-merge-master, round 4 (narrow, Opus medium), 2026-11-19

Graded: `git diff dccbcb327..HEAD` at 877580b42 (`--self-test --only <regex>`; backtest rows merge-master-r1 `^(?!r2 )`,
merge-master-crlf `^r2 `), with r1-r3 reports as the record.

## Evidence run
- `ws-backtest --row merge-master-r1,merge-master-crlf`: both PASS (FAIL 8.4 s / OK 4.8 s; FAIL 4.3 s / OK 3.9 s). The r3 defect is fixed.
- `--self-test`: OK (26 cases). `--only '^(?!r2 )'`: OK (22 cases).
- Deploy gate: `ws-deploy-gates.sh:909` runs `ws-merge-master.mjs --self-test` with no `--only`, so the plain gate runs all 26. Safe.
- `--only zzznomatch`: prints `OK (0 cases ...)`, exit 0. **Defect.**
- `--only '('`: uncaught `SyntaxError` stack trace, exit 1, no `ws-merge-master: FAIL` line. **Defect.**
- `--only` with no value: falls back silently to all 26 cases (harmless, but not reported).

## Findings
1. **(blocking) A filter that selects nothing reports OK.** `selfTest` returns 0 when `bad` is empty, whatever `n` is. A typo in a
   future row's `--only` (or a renamed case prefix, e.g. `r2 ` to `r3 `) gives a green self-test proving nothing. The backtest's
   fail state would also read OK, so the row would fail there, but the tool itself still says OK to anyone who runs it by hand.
   Fix: when `ONLY` is set and `n === 0`, print `FAIL (--only <re> matched 0 cases)` and return 1.
2. **(minor) A bad regex crashes** with a stack trace instead of `ws-merge-master: FAIL (bad --only regex: ...)`, exit 2.
3. **(minor) No self-test case covers `--only`** (a match subset count, and the 0-match FAIL). The new flag has no check of its own.
4. (note) `ONLY_RE` is module state set inside `run()`; it works, but passing it to `selfTest(target, only)` would be clearer.

## Scores
| Criterion | Score | Why |
|---|---|---|
| C1 correctness | 7 | Rows fixed; 0-match OK and the regex crash are wrong results |
| C2 checks prove it | 7 | Backtests prove the rows; nothing proves `--only` itself |
| C3 safety | 7 | Deploy gate is unfiltered (good); a typo'd filter is a silent green |
| C4 clarity | 8 | Small, commented diff; module-level flag is a little indirect |

**Verdict: FAIL (round 4).** One fix closes it: 0-match FAIL plus a caught bad regex, each with a self-test case.

## Automatic checks that would have caught this
- Every filter flag on a self-test (`--only`, `--case`, ...) must FAIL on 0 selected cases; add to LESSONS_LEARNED pre-flight.
- A self-test case per new CLI flag, including its bad-input path.
