# Critic: ws-merge-master, round 5 (narrow, Opus medium), 2026-11-19

Graded: `git diff 4166d24db..HEAD` at eb5073286 (0-match `--only` FAIL, caught bad regex, two self-test cases, backtest row
merge-master-only-empty), plus the whole tool against the r1-r4 record.

## Evidence run
- `--self-test --only '^nothing$'`: `FAIL (--only /^nothing$/ matched 0 cases)`, exit 1. r4 finding 1 fixed.
- `--self-test --only '('`: `FAIL (--only is not a valid regex: ... Unterminated group)`, exit 2, no stack. r4 finding 2 fixed.
- `--self-test`: OK (28 cases), exit 0; the two new r4 cases (0-match exit 1; bad regex exit 2, no `at` frames) run and pass. r4 finding 3 fixed.
- `ws-backtest --row merge-master-only-empty,merge-master-r1,merge-master-crlf`: 3 PASS, 0 FAIL (fail states FAIL, pass states OK).
- Deploy gate: `ws-deploy-gates.sh:909` runs `ws-merge-master.mjs --self-test` with no `--only`: the full 28 cases.
- r1-r3 fixes (row merge, 3-way union, scope, CRLF) still covered by the unfiltered self-test and the r1 / crlf rows.

## Findings (none blocking)
1. (minor) The two r4 cases spawn this file (`import.meta.url`), not `--target`, so a `--self-test --target <old copy>` run tests
   the current tool's `--only`, not the target's. Harmless for the gate (no target); worth a comment.
2. (minor) `--only` with no value or an empty string still falls back silently to all cases (r4 note; not a false green).
3. (note) `ONLY_RE` is still module state rather than a `selfTest` argument; readable enough at this size.

## Scores
| Criterion | Score | Why |
|---|---|---|
| C1 correctness | 9 | Both r4 defects fixed with the exact exit codes asked; nothing regressed |
| C2 checks prove it | 9 | Self-test cases for both bad-input paths plus a commit-pair backtest that fails on 877580b42 and passes now |
| C3 safety | 9 | Typo'd filter can no longer go green; deploy gate unfiltered |
| C4 clarity | 8 | Small, commented diff; module-level flag and SELF-only subprocess cases slightly indirect |

**Verdict: PASS (round 5).** The whole tool passes: every r1-r4 finding is closed and proven by a check on the gate's path.

## Automatic checks / speed notes
- r4's proposed pre-flight rule (every filter flag FAILs on 0 selected cases, plus a self-test case per flag's bad-input path) is
  what closed this round; keep it in LESSONS_LEARNED.
- Speed: this tool took 5 rounds for CLI-edge defects a flag checklist would have caught in round 1.
