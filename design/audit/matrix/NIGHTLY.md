# Repeated check: the coverage matrix every night (IMPROVEMENT_PLAN §1.6.2, §1.6.7 E1)

The **Repeated check** is one scheduled task. Each night it starts its own cloud session on the tip of the
integration branch `claude/sweet-newton-c8wrv1` and runs `tests/scripts/ws-matrix-nightly.sh`. **This file only
defines the task; no scheduled task has been created yet.** The lane lead creates it after the merge.

The owner set the shape on 2026-10-23: one session a night, and each night checks one twenty-eighth of all rows.
- For the first 28 nights it builds the first full baseline, one slice a night.
- After that, each night runs:
  - the rows the day's changes reach;
  - every row that is still red;
  - one rotating slice of the rows.

  So every row is checked again at least once every four weeks.

## The rows in a slice

`ws-coverage-matrix --slice i/28` selects slice `i` of 28. A row belongs to slice `i` when a hash of the row's id gives
`i − 1` (mod 28). The hash is the first 32 bits of SHA-256.
- The slice depends only on the row's id. Appending a skill never moves an existing row to another slice; a split by
  position would move rows.
- FNV is not used: its low bits are poorly mixed. With FNV, slice 2/28 crossed with shard 1/2 held 0 rows.
- A slice is 816 to 883 rows, or 1,134 to 1,272 documents. That was measured with `--list` on 2026-10-23 for slices
  1, 2, 3 and 28. At 0.31 documents/s on two slots, one slice takes about 1 hour.
- `--seventh d` is kept as an alias of `--slice <d+1>/7`. No nightly ever ran with the old FNV seventh, so no run
  file depends on its rows.

## What a night runs (what `ws-matrix-nightly.sh` does)

1. **It refuses unless HEAD is the fetched tip** of `origin/claude/sweet-newton-c8wrv1`, because the run file records
   that commit. `ALLOW_NOT_TIP=1` is for testing only.
2. **The first baseline: nights 1 to 28.** This phase lasts until the first full baseline is complete.
   - The baseline is complete when `design/audit/matrix/baseline.json` says `"complete": true`, or when all 28 slice
     files `baseline.slice-i-of-28.json` are present. `ws-coverage-matrix` `baselineComplete` checks this, and the
     deploy reads the same check.
   - Each night runs `--all --slice i/28 --write-baseline`. Slice `i` is the lowest slice that has no baseline file
     yet, so a night that fails is tried again the next night. The run writes `baseline.slice-i-of-28.json`.
   - Every reader merges `baseline.json` with every `baseline.<part>.json` file beside it.
   - Only rows that **printed** are pinned. For each size they pin the lint counts and the finding keys (N1). A row
     that could not print stays **ERROR** and is listed under "NOT pinned".
   - The rows that are RED or ERROR in the folded state (below) also run, because `--slice` implies `--red-from`.
3. **Every later night**, once the first full baseline is complete, runs these rows:
   - **The affected rows.** These are the rows that the commits since the last affected run reach
     (`--affected <LAST>..HEAD`).
     - `LAST` is the commit of the newest run file that ran its affected rows: not dirty, and not dropped over the cap.
       When there is no such file, `LAST` is the commit of the oldest slice baseline.
     - The rows are **capped** at `MQ_NIGHTLY_AFFECTED_CAP` documents (default 1,200, about 1 hour).
     - Above the cap, the affected rows are dropped for that night. The run file records
       `selection.affected.droppedOverCap`, and the next night tries again from the same `LAST`.
     - Before M4, a change to any print input reaches every row, so most such nights are over the cap. The slice
       still covers each row within 28 nights.
   - **Every row that is RED or ERROR in the folded state** (`--red-from design/audit/matrix`). Such a row always runs.
     The cache never skips it.
   - **The rotating slice** `--slice <days since 1970-01-01 mod 28 + 1>/28`.
   - **`--pin-new`.** This pins rows that printed and have no baseline entry yet (skills appended since the baseline)
     into `baseline.added.json`. A row that already has an entry is never pinned again.
   - A row is skipped when it is already OK in `cache.json` for the same dependency hash and the same baseline entry.
4. **It writes the run file** `design/audit/matrix/<UTC date>.json` and the cache. It prints the commit message and the
   files to commit. A second run on the same date writes `<UTC date>T<HHMM>.json`. No run file is ever overwritten.
5. **It exits 0 even with red rows** (`--report-only`), because the deploy reads the red rows from the run files. A
   crash exits non-zero, and the session then commits nothing.

`DRY=1 tests/scripts/ws-matrix-nightly.sh` prints the selection and runs nothing. On 2026-10-23 it gave "first
baseline: slice 1/28", 802 rows and 1,134 documents. `--slice i/28` runs that slice in place of the night's slice.

## Row statuses

A row's status is one of these:
- **RED:** a lint count, or (N1) a finding key, is above the row's own baseline entry.
- **ERROR:** the row did not print. Either it has a render error (`L-SPLIT RENDER`, a `buildSheet` throw or a
  crashed batch), or print-lint refused its flags. No baseline forgives an ERROR row.
- **PENDING(no-baseline):** the row has findings but no baseline entry of its own (owner 2026-10-23). This status is
  **never red**. The row printed; there is nothing yet to compare it with. The first full baseline or `--pin-new`
  pins it.
- **PENDING(step):** the row needs a later build step.
- **N/A:** the row does not apply to its skill.

## The folded state (critic r2 D1)

A night does not run every row. So no single run file says which rows are red. Instead, the deploy and the night's
`--red-from` read **every** run file in `design/audit/matrix/`, oldest first, and fold them.
- **A row's state is its status in the most recent run that ran it.** A run ran a row when it lists the row in `rows`
  or in `red`.
- A RED or ERROR row therefore stays red through every later run that did not select it. It stops being red only when
  a later run lists it with another status (OK, or PENDING / N/A when the row can no longer be checked).
- `--red-from` re-selects every red row every night, so a fixed row turns OK on the next night.
- The deploy's own inline run is folded in last, so a deploy that re-ran a red row OK clears that row.
- `ws-coverage-matrix --self-test` tests the fold (`foldRuns`).
- `ws-deploy-gates.sh --self-test` tests it on fixture directories. It includes the critic's reproduce case: a row
  RED on 10-22 and absent from 10-23 stays red.

## The full run when a deploy needs it

Once the first full baseline exists, a deploy can still find its affected rows over the 500-document budget, with no
complete run on its tip. The gate then says **NEEDS-SHARDED-RUN**. The lead fires eight one-off sessions:

```
SHARD=<i>/8 tests/scripts/ws-matrix-nightly.sh --full     # i = 1 … 8, one session each ("Repeated check 3/8" …)
```

- Each session runs `--affected <LAST>..HEAD` with no cap, plus the red rows, plus `--pin-new`, for its shard.
- Shards split the rows by a separately salted SHA-256 hash of the row id, so the eight sessions partition the rows
  whatever each one selects.
- Each writes `<date>[T<HHMM>].shard-i-of-8.json`.
- The run is complete when all eight files of one stamp, all on one commit, carry `finished`.

Before the first full baseline exists, a deploy over the budget is **not held** (owner 2026-10-23). It gets a WARNING
only: the affected rows are PENDING(no-baseline), and the lanes' precritic covers them.

## The run file (read by the deploy)

`ws-coverage-matrix` writes the run file (`--out`); its header documents the shape under "THE RUN FILE".

**Top-level fields:**
- `commit`: the full sha the rows ran on.
- `dirty`: true when the tree had local edits.
- `started` and `finished`: ISO times.
- `totals`: the counts of `OK`, `CACHED`, `RED`, `PENDING`, `N/A` and `ERROR` rows.
- `red`: the ids of every RED and ERROR row.
- `notPinned`: on a baseline run, the rows that could not be pinned.
- `liveSkills`: the number of live skills.
- `selection`, which says what ran: `affected` {`from`, `to`, `files`, `reached`, `run`, `droppedOverCap`}, `slice`,
  `seventh`, `shard`, `redFrom` {`dir`, `reselected`}.
- `timing`.

**Per-row fields:**
- `id`: `cat:skill|kind/row`.
- `skill`.
- `status`: OK, RED, PENDING, N/A or ERROR. A cached row is OK with `cached: <date>`. `step` holds `no-baseline` for
  a PENDING(no-baseline) row.
- `rises`, `errors` and `reason`.
- The S / M / L counts and finding keys.

## At deploy (S5 session 3)

The deploy gate is `matrix_gate` in `tests/scripts/ws-deploy-gates.sh` (session 3).

1. **It runs the inline matrix:** `ws-coverage-matrix --all --affected <base>..HEAD --red-from design/audit/matrix
   --baseline design/audit/matrix/baseline.json --slots 2 --batch 9 --max-docs 500 --out <logdir>/matrix-inline.json`.
   - `MQ_MATRIX_BUDGET` changes the 500.
   - `<base>` is `MQ_DEPLOY_BASE`, else the merge base with `origin/master`. Without that the gate FAILS (it never
     guesses).
   - Within the budget the rows run inline, red rows included. Over the budget the matrix runs nothing and exits 3.
2. **On every deploy, within the budget or not** (critic r2 D1.3), the nightly rule folds every run file plus the
   inline run, then:
   - **FAIL:** a row of a live skill is RED or ERROR in the folded state, or the inline run fails.
   - **FAIL, once the first full baseline exists:** there is no run file, or the newest run finished more than 24
     hours ago. Before the full baseline exists, these two cases give a **WARNING**: the gate passes and the lead
     reads it.
   - **Within the budget:** the inline run stands in for "covers HEAD". The gate is OK, or WARNING.
   - **Over the budget, before the full baseline:** WARNING, and the deploy is not held.
   - **Over the budget, after the full baseline:** OK when the newest run is complete, on one clean commit that the
     tip differs from only in `design/audit/matrix/`, and did not drop its affected rows. Otherwise the gate gives
     **NEEDS-SHARDED-RUN** (INCOMPLETE): the lead fires the eight `--full` sessions above.
   - The OK line names the run and what it ran: the affected range and how many rows it reached, the slice, the number
     of red rows re-selected, the shard, and the tallies (N10).
3. **The flake re-run (N7)** re-runs only the rows that the first inline run found red (`--rows <ids>`), never the
   whole budget. When the failure came from the nightly rule, which is deterministic, the re-run reads only the rule
   again.

`bash tests/scripts/ws-deploy-gates.sh --self-test` proves each case on fixture runs in
`tests/fixtures/precritic/deploy/nightly/` with a stub matrix. A directory holding `baseline.json` with
`complete: true` stands for the state after the full baseline.

## The scheduled task (exact text): "Repeated check"

One task, named **Repeated check**. Schedule: daily at 01:13 UTC (`CRON_TZ=UTC 13 1 * * *`). The eight `--full`
sessions are one-off sessions the lead starts when a deploy asks for them ("Repeated check 1/8" … "Repeated check
8/8"). They are not scheduled.

> You are the MathQuest Repeated check (the coverage matrix's nightly run). Work only in a fresh clone of the
> repository. Steps:
> 1. `git fetch origin claude/sweet-newton-c8wrv1 && git checkout -B repeated-check origin/claude/sweet-newton-c8wrv1`.
> 2. If `/tmp/mq-browser-run.sh` is missing: `cp tests/scripts/mq-browser-run.sh /tmp/ && chmod +x /tmp/mq-browser-run.sh`.
>    Install nothing beyond what the repository's setup provides. If Chromium or PyMuPDF is missing, stop and report it.
> 3. Run `tests/scripts/ws-matrix-nightly.sh`. Do not pass any flags and do not edit any file yourself.
> 4. The script prints a commit message and the files to commit, all under `design/audit/matrix/`. Commit exactly
>    those files with that message, and end the message with the attribution lines your session instructions give.
>    Then run `git pull --rebase origin claude/sweet-newton-c8wrv1` and `git push origin HEAD:claude/sweet-newton-c8wrv1`.
>    If the push is refused because the tip moved, rebase and push again, at most three times. Never force-push.
> 5. Reply with:
>    - the date;
>    - the commit the matrix ran on;
>    - the mode line (first baseline: slice i/28, or affected + red rows + slice);
>    - the tally line (OK / CACHED / RED / PENDING / N/A / ERROR);
>    - the documents/s line;
>    - on a baseline night, the count of rows NOT pinned;
>    - whether the affected rows were dropped over the cap;
>    - the ids of the first 20 RED or ERROR rows, each with its first rise or error.
>
>    If the script failed, reply with its last 30 lines instead and commit nothing.
>
> Never edit a baseline file yourself; the script writes them. Never delete or overwrite a run file, and never touch
> files outside `design/audit/matrix/`.

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
