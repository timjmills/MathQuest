# Critic r1 — ws-merge-master (independent, Opus medium, 2026-11-19)

Graded: `tests/scripts/ws-merge-master.mjs`, its deploy-gate line (`ws-deploy-gates.sh` session 1) and the
`design/status/lf-checks.md` note, as `git diff 448bc5e74..b2f08a3f1`. Every attack ran in disposable worktrees or
throwaway repos under `/tmp/claude-0/crit-mm-*`. All of them have been removed.

## Verdict: FAIL (C1 6, C2 6, C3 6, C4 8)

## What holds (evidence)

- **Replays of four real hand-resolved merges.** In each one the tool ran from the replay worktree, using the wt-merge
  copy with `--ref <parent2>`.
  - `80a3444e0` (lf-algebra, 2 files): the tree is **identical** to the hand result.
  - `eeb03c94a` (lf-ops-t15, 2 files): it has the same 598 backtest rows with the same content. Only the order
    differs: master is first, as the spec says, where the hand merge put the branch first. The two ledger lines are
    in the same spec order.
  - `002ca8d87` (4 files): the ledger, the decisions file and the backtests match the hand result.
    `lesson-baseline.json`, a file not on the list, was correctly LEFT. It exited 1 and did not commit.
  - `d57c126e3` (7 files): BUILD_LIST and STANDARDS_COVERAGE were regenerated and are byte-identical to the hand
    result. The backtests match. The four other files were LEFT.
- **Other checks that pass:**
  - A dirty tree gives exit 2.
  - "Already up to date" gives exit 0 for both an ancestor ref and an equal ref.
  - Running from a subdirectory (`js/`) works.
  - diff3 conflict style is unioned correctly.
  - It never pushes, and `design/STATUS.md` is in NEVER.
  - `--self-test` reports OK (7 cases).

## Findings

**F1 (C1, data loss): a row both sides ADDED with the same id is silently lost from the branch.**
- The case: there is no base row, and both sides have the row with different content.
- What happens: `mergeRows` returns master's row (`if (!b || ...) return t`). The branch's row is skipped because
  `have.has(id)`. It is not listed in `conflicts`.
- Reproduced: the lane had `n=7` and master had `n=9`. The result is `n=9`, with no LEFT line and nothing in the
  output.
- When this happens in practice: a lane row reaches master by cherry-pick or squash, and the lane then edits it
  further.
- Fix: when `!b && o && !same(o, t)`, record a conflict.

**F2 (C1): the union keeps both versions of a line that both sides EDITED, and brings back lines that one side
removed.**
- Reproduced with this base row: `| A1 | old text |`. Master changed it to `master text` and the lane changed it to
  `lane text`.
- The result has two `A1` rows with different text, and it exits 0. The same thing happens when master fixes a line
  next to a lane's append: the old line is kept beside the new one.
- What the fix needs: for files with keyed tables, a key-aware union, or flagging a hunk whose sides share a key but
  differ in text.
- Also: one side can delete a line inside a hunk, and the union restores it without saying so.

**F3 (C3): the ROOT fix is incomplete.**
- When the current directory is not a git repo, the `catch` branch falls back to the script's own tree. That is the
  exact bug the fix says it closed.
- Reproduced: run from a directory outside git, with `node ../d/tests/scripts/ws-merge-master.mjs`. It fetched and
  started a merge inside `d`, leaving a half-merged index there.
- Fix: exit 2 when `git rev-parse` fails.
- The `ws-conflict-markers` fallback has the same class of problem. It uses the script directory's copy, and that copy
  greps ITS OWN tree. With unresolved markers in the merged repo it printed "OK". The LEFT list still caught the
  conflict, but the gate line was false.

**F4 (C3): a row both sides changed is staged as resolved, with master's version.**
- `git add` runs on it, so `git status` shows `M`, not `UU`. The lane's version disappears from the working tree.
- The only reminder is a LEFT line. A lane that fixes the other conflicts and then runs `git commit` silently drops
  its own change.
- Fix: leave the file unstaged, or write a marker or `_conflict` entry so that `ws-conflict-markers` fails until the
  lane decides.

**F5 (C3): `--commit` without `MQ_COMMIT_TRAILER` commits with NO attribution.** This was reproduced.
- Every lane must end its commits with the session footer. If an env var is forgotten, the result is a non-compliant
  commit and no warning.
- Safer default: refuse `--commit` (exit 2) when the trailer is unset, or require `--trailer-file`.
- The subject line also always says "generated reports regenerated", even when none were.

**F6 (C3, robustness): a modify/delete or add/add conflict on `backtests.json` crashes the tool with a Node stack
trace.**
- The cause: `git show HEAD:...` or `base:...` throws.
- The tool has already resolved and staged the earlier files, so the merge is left half-resolved with no FAIL line.
- Fix: catch the error and LEFT the file.

**F7 (C1, minor):**
- Regeneration runs while other conflicted SOURCES still hold markers, so a report can be built from conflicted
  sources. Fix: regenerate only after `left` is empty, or tell the lane to re-run.
- `design/WRM_COVERAGE.md` is a generated report and conflicted in real merge `d57c126e3`, but it is not in
  GENERATED.
- Files that merged cleanly are never validated: duplicate row ids in `backtests.json`, or stale reports.

**F8 (C2): the self-test covers only the pure helpers.** It has no case for:
- F1 (same id added on both sides);
- a union with the same key edited on both sides;
- the ROOT and cwd behaviour, which is the fix this round claims;
- the regen path;
- a git-level fixture of a tiny repo with a run of `main()`.

The status note's proof rests on one replay. Each finding above needs a planted case that FAILs on b2f08a3f1.

## Grades

| Criterion | Score | Why |
|---|---|---|
| C1 correctness / no data loss | 6 | Real replays are faithful, but F1 is silent loss, F2 silently duplicates keyed lines, and F7 |
| C2 checks prove it | 6 | 7 pure cases; nothing tests main(), ROOT, F1, F2, or regen |
| C3 safety | 6 | F3 merges into the wrong tree, F4 hides a conflict, F5 has no attribution by default, F6 crashes mid-merge |
| C4 clarity | 8 | Clear header, per-file lines and LEFT list; a misleading commit subject; the markers line can be false (F3) |

## Machine checks that would have caught these

- A self-test case `mergeRows(base without n, ours n=7, theirs n=9)` that expects `conflicts ['n']` (F1).
- A union case with the same `| A1 |` key and different text that expects a flagged hunk (F2).
- A git fixture: `cd $(mktemp -d)` followed by `node <script> --ref x` that expects exit 2 and no change to the
  script's tree (F3).
- `--commit` with the env var unset that expects a refusal (F5).
- A modify/delete fixture that expects a LEFT line and no stack trace (F6).
