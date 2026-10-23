# The coverage matrix nightly (IMPROVEMENT_PLAN §1.6.2, §1.6.7 E1)

The nightly is a scheduled task: its own cloud session, on the tip of the integration branch
`claude/sweet-newton-c8wrv1`, running `tests/scripts/ws-matrix-nightly.sh`. **This file only defines it; no scheduled
task has been created.** The lane lead creates it (one task, or eight with `SHARD=i/8` when the rows exceed a night).

## What a night runs

- **First run** (no nightly run file `<date>.json` here yet): every row of every live skill, writing the per-row
  baseline into `baseline.json` (with shards, `baseline.shard-i-of-n.json`; every reader merges them). The rows
  already in `baseline.json` (the E1 builder check pinned `addition:add_100_regroup` and `addition:add_20_regroup`
  on 2026-10-23) are re-pinned at the nightly's commit. Add a STATUS note with the
  counts (the lane lead writes it; the session does not edit `design/STATUS.md`).
- **Every later night**: the rows the commits since the last nightly reach (`--affected <last>..HEAD`) plus the
  rotating seventh of all rows (`--seventh <UTC weekday mod 7>`), so every row runs at least weekly. Rows already OK
  in `cache.json` for the same dependency hash are skipped. A **red row** is any count above the per-row baseline,
  or a render error.
- **Before M4** (no record / replay) a change to any print input reaches every print row, so such a night is the
  full matrix: 10,922 printable rows = 32,766 documents on 2026-10-23 (`ws-coverage-matrix --all --list`), about
  29 h on two slots at the 0.31 documents/s measured on a real mixed run (below) - more than one night, so it is
  sharded over eight sessions (`SHARD=1/8` ... `SHARD=8/8`, about 3.7 h each). A night whose commits touch only
  planning files, tests, generated documents, `search-terms.js` or the `index.html` stamp runs only its seventh
  (about 1,560 rows = 4,700 documents, about 4.2 h on two slots).
- **Options pin** (after the matrix): `tests/scripts/ws-options-pin.cjs --check` runs `ws-options-verify` on every
  live skill (batches of 25, two at a time) against `design/audit/baselines/options-verify.json` and writes
  `design/audit/matrix/options-pin-<date>.json` (new failing pairs, fixed pairs, timings). On the first run, unsharded,
  it is `--write` instead and re-pins every live skill into that baseline file (the one file the night may commit
  outside this folder); with `SHARD`, each shard checks its share of the batches. New pairs do not stop the night;
  the commit message carries the tally. Measured 2026-10-23 (714 live skills, 29 batches, `--deadline 600000`,
  two slots shared with other sessions): about 1 h 52 min wall, about 16.8 s of slot time a skill (browser start
  included, slot waits excluded; 8 to 35 s a skill by batch, the mixed pools and count_by_* slowest), 21 min of it
  waiting for a slot. The matrix and the pin share the two slots, so a night runs both one after the other.
- Output: `design/audit/matrix/<UTC date>.json` (`<date>.shard-i-of-n.json` per shard): the commit, the selection,
  every row with its per-size counts, status (OK / CACHED / RED / PENDING(step) / N/A) and dependency hash, and the
  timing. The deploy gate (S5 session 3) refuses a deploy when the newest nightly is older than 24 hours or a row of
  a live skill is RED.

## The scheduled task's prompt (exact text)

> You are the MathQuest coverage-matrix nightly. Work only in a fresh clone of the repository. Steps:
> 1. `git fetch origin claude/sweet-newton-c8wrv1 && git checkout -B matrix-nightly origin/claude/sweet-newton-c8wrv1`.
> 2. If `/tmp/mq-browser-run.sh` is missing: `cp tests/scripts/mq-browser-run.sh /tmp/ && chmod +x /tmp/mq-browser-run.sh`.
>    Install nothing beyond what the repository's setup provides; if Chromium or PyMuPDF is missing, stop and report it.
> 3. Run `tests/scripts/ws-matrix-nightly.sh` (with `SHARD=<i>/<n>` in the environment if this task is a shard; the
>    task's name says which). Do not pass any other flags and do not edit any file yourself.
> 4. It prints a commit message and the files to commit (all under `design/audit/matrix/`). Commit exactly those files
>    with that message, ending the message with the attribution lines your session instructions give.
>    Then `git pull --rebase origin claude/sweet-newton-c8wrv1` and `git push origin HEAD:claude/sweet-newton-c8wrv1`;
>    if the push is refused because the tip moved, rebase and push again (at most three times). Never force-push.
> 5. Reply with: the date, the commit the matrix ran on, the mode line, the tally line (OK / CACHED / RED / PENDING /
>    N/A / ERROR), the documents/s line, the ids of the first 20 RED rows with their first rise, and the options pin's
>    `against ...` line with its first 20 NEW pairs. If the script
>    failed, reply with its last 30 lines instead and commit nothing.
> Never change the baseline after the first run, never delete a run file, and never touch files outside
> `design/audit/matrix/` (the script's first-run options pin `design/audit/baselines/options-verify.json` is the one
> exception, and it is in the files it prints).

Schedule: daily at 01:13 UTC (`CRON_TZ=UTC 13 1 * * *`), one session per shard; shards share the date, so the
deploy gate reads all `<date>.shard-*.json` of the newest date.

## Measured cost (2026-10-23, this container, two shared browser slots)

| Run | Documents | Wall | Documents/s |
|---|---|---|---|
| 4 Single skill rows of `addition:add_20_regroup`, `--slots 1 --batch 1` (a browser start per document) | 12 | 85.1 s | 0.141 |
| the same, `--slots 1 --batch 12` (one browser start) | 12 | 52.9 s | 0.227 |
| the same, `--slots 2 --batch 1` | 12 | 48.1 s | 0.249 |
| the same, `--slots 2 --batch 6` | 12 | 31.4 s | 0.382 |
| every printable row of `addition:add_100_regroup` and `addition:add_20_regroup` (34 rows, Sections pages up to 10 + 5 key pages), `--slots 2 --batch 9` | 102 | 326.7 s | 0.312 |

Batching saves about 2.9 s a document (one browser start and app boot); two slots add about 1.7x. No time in these
four comparison runs was spent waiting for a slot another session held (the runner's wait log); the 102-document run
predates the wait accounting, and one of its batches took 97.9 s against about 50 s for the others.
