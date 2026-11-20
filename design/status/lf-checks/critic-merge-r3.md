# Critic: ws-merge-master, round 3 (narrow, CRLF fix): FAIL (C1 9 / C2 6 / C3 9 / C4 8)

Graded: `git diff a0fc71d43..HEAD` at de69c5f69 (union3 CRLF handling, the self-test, row `merge-master-crlf`), and the
whole tool. Probes ran only in disposable `/tmp/claude-0/crit3-mm-*` worktrees, removed after.

## What I ran

| Probe | Result |
|---|---|
| `--self-test` | OK, 26 cases |
| `ws-backtest --row merge-master-crlf` | PASS (FAIL on a0fc71d43, OK on the fix) |
| `ws-backtest --row merge-master-r1` | **FAIL**: pass state aa404bb5c now fails 2 of 26 (the new "r2 git CRLF" cases) |
| git: CRLF ledger, lane and master each append | both appends kept (master first), CRLF kept, exit 0 |
| pure: CRLF same-row clash | conflict reported, markers written with CRLF (self-test covers the git exit-1 case) |
| git: MIXED ledger (`\r\n` and `\n` lines), both append | nothing lost; the WHOLE file is rewritten CRLF, including untouched LF lines |
| git: MIXED status file, both append | nothing lost; whole file becomes CRLF |
| pure: mixed same-row clash (the `=` separator carrying `\r`, sides with different endings) | conflict reported, not silent |
| git: CRLF `backtests.json`, both add a row | all 3 rows kept, exit 0; the file is written back LF (every line churns) |

## Findings

1. **C2 blocker: the fix broke the r1 backtest row.** `merge-master-r1` runs the CURRENT self-test against its
   pass commit aa404bb5c via `--target`. The two new "r2 git CRLF" cases fail on that older tool, so the row now reads
   FAIL/FAIL and `ws-backtest` (full run, deploy gate path) exits 1. Every row must keep failing on its fail state and
   passing on its fix. Fix: let `--self-test` take a case filter or a round tag (`--only r1`) and use it in the r1 row,
   or pin each row to the self-test of its own pass commit. Then re-run `--row merge-master-r1` and the whole
   `ws-backtest`.
2. Minor (C1): a mixed-ending file is normalised to all-CRLF as soon as one `\r\n` appears, so every LF line shows
   as changed in the diff. No content is lost. Accept it, or keep each line's own ending. Say which in the tool's header.
3. Minor (C1): a CRLF `backtests.json` comes back LF. The rows are intact, but the whole file churns. Keep the
   file's own line ends, as union3 now does.

## r2 line-order / blank-line note

Accepted. Master-first order follows the spec. One stray blank line in a union is cosmetic and cannot lose a row.

## Grades

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / no data loss | 9 | CRLF and mixed files keep both sides; clashes are never silent; only line ends churn (findings 2, 3) |
| C2 checks prove it | 6 | the new row is good, but an existing backtest row went red (finding 1) |
| C3 safety | 9 | no force, no commit without the trailer, exit 1 on clash |
| C4 clarity | 8 | the CRLF comment, the ledger row and the status line are clear; mixed-file behaviour is not documented |

**Verdict: FAIL** (C2 < 8). Round 4: fix finding 1 (it is a check defect, not a merge defect) and re-grade narrowly.

Process (rule 00): the lane ran only its own new row, not `ws-backtest` over every `merge-master-*` row. A new
self-test case that older `--target`s cannot pass breaks every earlier commit-pair row. Pre-flight check to add:
after changing a `--self-test` that rows run with `--target`, run `ws-backtest --row` for EVERY row that uses that rule.
