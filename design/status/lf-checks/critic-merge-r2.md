# Critic r2 — ws-merge-master (independent, Opus medium, 2026-11-19)

Graded: `tests/scripts/ws-merge-master.mjs` as `git diff 3354f8173..db50fb82b`, and whether the whole tool passes. Every
attack ran in throwaway repos or detached worktrees under `/tmp/claude-0/crit2-mm-*`. All of them have been removed.

## Verdict: FAIL (C1 7, C2 7, C3 8, C4 8). One defect: a CRLF ledger or status file loses master's side silently.

## The r1 findings, re-run

| r1 | Re-run | Result |
|---|---|---|
| F1 same id added on both sides | lane n=7, master n=9 | Exit 1. The file stays `UU` with both versions between markers. **Fixed** |
| F2 keyed row edited on both sides / restored deletions | the self-test git cases, plus my B and B2 below | It conflicts on the same key. A deletion stays deleted. **Fixed** |
| F3 outside git | `node ../d/tests/scripts/ws-merge-master.mjs` from a non-git directory | Exit 2. No MERGE_HEAD in `d`. **Fixed** |
| F3 markers gate | markers left in `x.js` in a fixture that has no ws-conflict-markers of its own | The sibling copy is run with `--root`: "FAIL - 2 marker line(s)". **Fixed** |
| F4 both-changed row staged | rows changed differently on both sides | `UU`, not staged, both versions in the file. **Fixed** |
| F5 `--commit` with no trailer | the variable unset, and the variable set to blanks | Exit 2 both times; nothing merged. The subject now says only what happened ("reports regenerated" / "clean merge"). **Fixed** |
| F6 crashes | master deleted the file; add/add with no base; the lane deleted the file | No stack trace. Rows are kept and the delete is named in the output. **Fixed** |
| F7 regeneration over conflicted sources / WRM_COVERAGE / duplicate ids | the self-test cases, plus my D below | **Fixed**. WRM_COVERAGE is now in GENERATED |
| F8 the self-test | `--self-test`: OK, 22 cases, including git fixtures that run the target. `ws-backtest --row merge-master-r1`: FAIL 5.0 s -> OK 1.9 s, PASS | **Fixed** |

## New attacks

- **A. Two conflicting rows at once, plus new rows on each side.** Row `a` was changed on both sides and row `n` was
  added on both sides.
  - Both rows get their own marker block. The new rows M (master) and L (lane) are kept. The file is `UU`, exit 1.
  - ws-conflict-markers reports 4 marker lines.
  - Taking either block gives valid JSON, because each block carries its own trailing comma.
- **B. The lane inserts a row next to a row master deleted.** The result is `A1, N1 (lane), A3`: the deleted row stays
  gone and the insert is kept.
- **B2. The lane deletes a paragraph and master appends right after it.** The result is `para one, para three`.
  Correct.
- **C. The lane hand-edited a generated report, master changed its source, and there was no textual conflict.** The hand
  edit survives and is not regenerated. This is out of the tool's stated scope (it regenerates only conflicted reports).
  It is noted for the report's own gate.
- **D. The only conflict is a generated report**, with `--commit` and a trailer. The tool takes master's copy, runs the
  generator, stages the result and commits. The tree is clean, and the message is "reports regenerated" plus the
  trailer. Correct.
- **E. CRLF ledger: DATA LOSS, exit 0 (finding G1).**
- **F. Performance with 40 000 rows of about 230 bytes each.**
  - A clean textual merge took 1.75 s (this includes the duplicate-id scan).
  - The row-merge path, with a conflict on the last row, took 0.89 s. The file had 40 002 rows and one marker block.
  - No problem.
- **Replays of two real merges.** The tool's result was compared with the hand-resolved commit.
  - `b77b1dd9b` (LEAD_DECISIONS, CHECKS_FROM_CRITICS, backtests): the tree is **identical** to the hand merge.
  - `7c7c41bfe` (7 files):
    - backtests: 643 rows, with the same ids and the same content as the hand merge.
    - CHECKS_FROM_CRITICS and speed-audit: the same lines in spec order (master first).
    - lf-checks.md: the same lines plus one extra blank line.
    - The three source files were correctly LEFT, the markers line said FAIL, exit 1, and nothing was committed.

## Is "conflict left between markers" in backtests.json a sane state?

Yes, it is sane.

- The file is `UU`, so git refuses to commit it.
- ws-conflict-markers fails on it, and the tool says so.
- The duplicate-id check is skipped, so the lane is not told about a parse error on top of the conflict.
- The LEFT line names the row ids and says "pick one, then git add".

Two nits:
- The marker trailer reads "changed on both sides" for a row that was ADDED on both sides.
- The LEFT line does not warn that `git checkout --theirs/--ours` on this file throws away the whole other side.

## Findings

**G1 (C1 and C3, silent data loss): a UNION file with CRLF line endings loses master's side of the hunk and exits 0.**

What I ran:
- A CRLF `CHECKS_FROM_CRITICS.md` where the lane appended `| A2 | lane |` and master appended `| A3 | master |`. The
  result is lane-only: `"# L\r\n| A1 | x |\r\n| A2 | lane |\r\n"`. Master's row is gone. The tool printed OK and the
  status was clean.
- The same file with `A1` changed differently on both sides. The lane's text silently won, with no conflict.

The cause:
- `git merge-file` writes CRLF marker lines. `union3` splits the output on `\n`, so the separator line is
  `"===================\r"`, and `src[i] === mk('=')` never matches it.
- Master's lines are therefore read as part of the base. T becomes empty, and `mergeHunk` returns the lane's lines
  only. The start and end markers still match, because they are tested with `startsWith`.

How likely it is:
- Every file in UNION scope is LF today (`git ls-files --eol`).
- One Windows editor, or one pasted CRLF block, arms it, and the failure is a silent OK.

The fix is a few lines:
- Either compare `src[i].replace(/\r$/, '')` everywhere in `union3`;
- or LEFT any UNION file whose sides contain `\r` ("CRLF: resolve by hand").

The fix needs a CRLF git fixture in `--self-test` and a backtest row that FAILs on db50fb82b.

**G2 (minor, C4):**
- `--ref <full sha>` prints the sha twice ("merging d383…087 d38308824").
- A union can add one stray blank line (seen in the 7c7c41bfe replay, lf-checks.md).
- Re-running the tool mid-merge says "uncommitted changes: commit or stash", not "a merge is in progress".

## Grades

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / no data loss | 7 | Every r1 loss is closed, and the real replays and the 40k-row case are faithful. G1 is a silent loss of master's rows (and of a conflict) with exit 0 |
| C2 checks prove it | 7 | 22 cases with real git fixtures and a backtest row, but no line-ending case. The class "the marker parser assumes LF" was not planted |
| C3 safety | 8 | Outside git, `--commit` with no trailer, crashes and staged conflicts are all fixed. Under G1, though, a hidden conflict passes the markers gate, because the resolved text has no markers |
| C4 clarity | 8 | Clear per-file lines, LEFT list and next step; the G2 nits |

## Machine checks that would have caught G1

- A `--self-test` git fixture with CRLF ledger appends on both sides, expecting both rows (or a LEFT) and never a silent
  lane-only result.
- A general rule for every hand-written marker parser: normalise `\r` before comparing whole lines, or refuse input that
  contains `\r`.
