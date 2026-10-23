# The coverage matrix nightly (IMPROVEMENT_PLAN §1.6.2, §1.6.7 E1)

The nightly is a set of scheduled tasks. Each one is its own cloud session on the tip of the integration branch
`claude/sweet-newton-c8wrv1`, and each runs `tests/scripts/ws-matrix-nightly.sh`. **This file only defines them; no
scheduled task has been created yet.** The lane lead creates them.

Before M4, every night that follows a print-input change is the full matrix, which is more than one night on two
slots (below). So the nightly is **eight shard tasks**, `matrix-nightly 1/8` … `matrix-nightly 8/8`. Each task runs the
script with `SHARD=i/8` in its environment, which gives sixteen slots between them.

## What a night runs (what `ws-matrix-nightly.sh` does)

1. **It refuses unless HEAD is the fetched tip** of `origin/claude/sweet-newton-c8wrv1`, because the run file records
   that commit (`ALLOW_NOT_TIP=1` is for testing only).
2. **First run.** This is the case when `design/audit/matrix/` holds no run file of **this shard** with a commit yet
   (`<date>[T<HHMM>].shard-i-of-8.json`). The check is per shard, so a shard that starts after another shard of the
   first night has pushed still pins its own baseline.
   - It runs `ws-coverage-matrix --all --write-baseline --baseline design/audit/matrix/baseline.json --report-only`,
     so every row of every live skill (715 on 2026-10-23) runs.
   - Each shard writes its own baseline file, `baseline.shard-i-of-8.json`. Every reader merges `baseline.json` with
     all the shard files beside it.
   - Only rows that **printed** are pinned: their lint counts per size, with render keys stripped.
   - A row that could not print stays **ERROR** and is listed under "NOT pinned (cannot print or not checked; they
     stay red)" and in the run file's `notPinned`. Such a row has a render error (`L-SPLIT RENDER`, a `buildSheet`
     throw or a crashed batch). The baseline never forgives it, so it stays red until it prints (H11, §1.6.3).
   - A PENDING or N/A row is never pinned.
   - The rows already in `baseline.json` are re-pinned at the nightly's commit if they printed. These are
     `addition:add_100_regroup` and `addition:add_20_regroup`, from the E1 builder check of 2026-10-23.
   - The lane lead writes the STATUS note with the counts: pinned, NOT pinned, and the tally line. The session does
     not edit `design/STATUS.md`.
3. **Every later run.**
   - It runs the rows that the commits since the last run reach: `--affected <last run's commit>..HEAD`. The last
     run's commit comes from the shard's newest run file that is not `dirty`.
   - It adds the rotating seventh of all rows (`--seventh <UTC weekday mod 7>`), so every row runs at least once a
     week.
   - A row is skipped when it is already OK in `cache[.shard-i-of-8].json` **for the same dependency hash and the same
     baseline entry**. The cache key includes the row's own pinned counts, so a row cached under one baseline is
     re-run under another.
   - **RED** means a lint count above the per-row baseline. **ERROR** means the row did not print, or print-lint
     refused its flags.
   - Before M4 (no record / replay) a change to any print input reaches every print row, so such a night is the full
     matrix. On 2026-10-23 that was 10,922 printable rows = 32,766 documents
     (`ws-coverage-matrix --all --affected 60c4fa53..HEAD --list`). That is about 4,100 documents a shard, about
     3.7 h a shard on two slots at 0.31 documents/s.
   - A night whose commits touch only planning files, tests, generated documents, `search-terms.js` or the
     `index.html` stamp runs only its seventh: about 1,560 rows = 4,700 documents in all, about 590 a shard.
4. **It writes the run file** `design/audit/matrix/<UTC date>.shard-i-of-8.json` and the cache, and prints the commit
   message and the files to commit. If a run file for that date and shard already exists (a fired run, below), it
   writes `<UTC date>T<HHMM>.shard-i-of-8.json` beside it. No run file is ever overwritten.
5. **It exits 0 even with red rows** (`--report-only`), because the deploy reads the red rows from the run files. A
   crash exits non-zero, and the session then commits nothing.

## The full run as a fired scheduled task

Each of the eight shard tasks runs on its own schedule. Any of them can also be **fired** on demand outside the
schedule; the scheduled-task tool calls this "fire". Firing all eight runs the sharded full run without waiting for
the night. The fired session does exactly what the scheduled one does (same prompt, same script):
- it runs the rows affected since the newest run file's commit, plus that day's seventh;
- it skips the rows already OK in the cache for the same hash;
- it writes `<date>T<HHMM>.shard-i-of-8.json`, because that date already has a run file.

So "the full run" before M4 is eight fired shard tasks on a tip whose print inputs changed. It is complete when all
eight shard files of one run (same date and time stamp, same `commit`) carry `finished`.

## The run file (read by the deploy)

`ws-coverage-matrix` writes it (`--out`), and its header documents the shape under "THE RUN FILE". The fields a reader
needs are:
- top level:
  - `commit`: the full sha the rows ran on;
  - `dirty`: true when the tree had local edits;
  - `started` and `finished`: ISO times;
  - `totals`: the count of `OK`, `CACHED`, `RED`, `PENDING`, `N/A` and `ERROR` rows;
  - `red`: the ids of every RED **and** ERROR row;
  - `notPinned`: on a baseline run, the rows that could not be pinned;
  - `liveSkills`: the number of live skills;
  - `selection`, including the `--affected` range and its files;
  - `timing`.
- per row:
  - `id`: `cat:skill|kind/row`;
  - `skill`;
  - `status`: one of `OK`, `RED`, `PENDING`, `N/A` or `ERROR`. A cached row is `OK` with `cached: <date>`;
  - `rises`, `errors`, `step` and `reason`;
  - the S / M / L counts.

A row of a live skill is red when its status is `RED` or `ERROR`.

## At deploy (S5 session 3)

*(This paragraph belongs to the deploy-runner fix, which writes how `ws-deploy-gates.sh` uses the files above.)* The
matrix side is as follows:
- `ws-coverage-matrix --all --affected <base>..HEAD --max-docs 500 --baseline design/audit/matrix/baseline.json
  --slots 2` counts the documents the affected, non-cached rows would print.
- Above 500 it runs nothing, prints `ws-coverage-matrix: OVER-BUDGET <n> documents (budget 500)` and exits **3**. The
  caller then reads the newest run files above.
- Within the budget it runs the rows. It exits 0 on `OK`, 1 on `FAIL` (any RED or ERROR row) and 2 on `INCOMPLETE`
  (rows selected, none checkable).
- An affected range that reaches no row prints `OK (nothing reached …)`.
- Measured on 2026-10-23: `--all --affected 60c4fa53..HEAD --max-docs 500` gave `OVER-BUDGET 32766 documents (budget
  500)`, exit 3, in 6.3 s of node. A status-file-only range (`36561f62..dad0f3a5`) gave `OK (nothing reached …)`, exit
  0.

## The scheduled task's prompt (exact text; one task a shard, `<i>` = 1 … 8)

> You are the MathQuest coverage-matrix nightly, shard <i> of 8. Work only in a fresh clone of the repository. Steps:
> 1. `git fetch origin claude/sweet-newton-c8wrv1 && git checkout -B matrix-nightly origin/claude/sweet-newton-c8wrv1`.
> 2. If `/tmp/mq-browser-run.sh` is missing: `cp tests/scripts/mq-browser-run.sh /tmp/ && chmod +x /tmp/mq-browser-run.sh`.
>    Install nothing beyond what the repository's setup provides; if Chromium or PyMuPDF is missing, stop and report it.
> 3. Run `SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh`. Do not pass any other flags and do not edit any file yourself.
> 4. It prints a commit message and the files to commit (all under `design/audit/matrix/`). Commit exactly those files
>    with that message, ending the message with the attribution lines your session instructions give.
>    Then `git pull --rebase origin claude/sweet-newton-c8wrv1` and `git push origin HEAD:claude/sweet-newton-c8wrv1`;
>    if the push is refused because the tip moved, rebase and push again (at most three times). Never force-push.
> 5. Reply with:
>    - the date;
>    - the commit the matrix ran on;
>    - the mode line;
>    - the tally line (OK / CACHED / RED / PENDING / N/A / ERROR);
>    - the documents/s line;
>    - on a first run, the count of rows NOT pinned;
>    - the ids of the first 20 RED or ERROR rows, each with its first rise or error.
>
>    If the script failed, reply with its last 30 lines instead and commit nothing.
>
> Never change the baseline after the first run, never delete or overwrite a run file, and never touch files outside
> `design/audit/matrix/`.

Schedule: daily at 01:13 UTC (`CRON_TZ=UTC 13 1 * * *`), one task a shard. The shards of one run share the date (and
the time stamp when fired), so a reader takes every `<date>[T<HHMM>].shard-*.json` of the newest run.

## Measured cost (2026-10-23, this container, two shared browser slots)

| Run | Documents | Wall | Documents/s |
|---|---|---|---|
| 4 Single skill rows of `addition:add_20_regroup`, `--slots 1 --batch 1` (a browser start per document) | 12 | 85.1 s | 0.141 |
| the same, `--slots 1 --batch 12` (one browser start) | 12 | 52.9 s | 0.227 |
| the same, `--slots 2 --batch 1` | 12 | 48.1 s | 0.249 |
| the same, `--slots 2 --batch 6` | 12 | 31.4 s | 0.382 |
| every printable row of `addition:add_100_regroup` and `addition:add_20_regroup` (34 rows, Sections pages up to 10 + 5 key pages), `--slots 2 --batch 9` | 102 | 326.7 s | 0.312 |
| fix round 1: `addition:add_100_regroup` rows `single/defaults` + `single/ex-each`, `--slots 1 --batch 6`, against the baseline (OK 2) | 6 | 175.8 s, of which 149 s was waiting for a slot another session held | 0.034 wall (≈ 0.22 without the wait) |
| the same again with the same `--cache` | 0 | 1 s (CACHED 2) | — |

Batching saves about 2.9 s a document (one browser start and app boot), and two slots add about 1.7×. The first four
comparison runs spent no time waiting for a slot that another session held (the runner's wait log). The 102-document
run predates the wait accounting, and one of its batches took 97.9 s against about 50 s for the others.
