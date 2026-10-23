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
- **Options pin** (after the matrix): `tests/scripts/ws-options-pin.cjs --check --shard <tonight's slice>/28` runs
  `ws-options-verify` on slice i of 28 of the live skills against `design/audit/baselines/options-verify.json` (every
  live skill pinned 2026-10-23: 714 skills, 115 with 335 failing pairs).
  - **Slices by hash (critic r4 N8).** A skill's slice is a hash of its skill id (SHA-256 of `options-pin:<id>`, mod 28).
    Appending a skill never moves another one to another slice; the old split by position in `SKILLS` could skip or
    repeat skills over a 28-night cycle. A slice is about 25 skills, one or two balanced batches (≈ 7 min on two slots).
  - It writes `design/audit/matrix/options-pin-<date>.json` (`<date>T<HHMM>` when that exists; never overwritten): the
    newest failing pairs of every skill it ran, the new and fixed pairs against the pin, `finished`, `commit`, `dirty`,
    `complete` and the slice (`ws-options-pin` header, THE RUN FILE). New pairs do not stop the night; the commit
    message carries the tally.
  - **The deploy never runs the pin (critic r4 D1).** The whole pin, measured 2026-10-23 (29 batches,
    `--deadline 600000`), is ≈ 1 h 52 min wall on two shared slots, ≈ 16.8 s of slot time a skill. Session 1 of the
    deploy instead runs the read-only gate `ws-options-pin --gate design/audit/matrix` (node only, no browser slot,
    under a second), described under "At deploy" below.
  - The night never re-writes that baseline; a lane re-pins its own skills with `ws-options-pin --write --skills ...`.
    `OPTIONS_PIN=0` skips the step. `DRY=1` prints the step's command.

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
   - Only rows that **printed** and have **no entry in the merged baseline** are pinned (I1, below). For each size
     they pin the lint counts and the finding keys (N1). A row that already has an entry (one of the 127 pilot rows in
     `baseline.json`, or a row pinned by an earlier night) is judged against that entry and is never pinned again, so
     a regression on it is **RED** in the run file. A row that could not print stays **ERROR** and is listed under
     "NOT pinned".
   - The slice file is written even when it pins nothing new, so the night counts as done.
   - **N4 (critic r4):** a `--slice` run narrowed by `--skills`, `--kind`, `--rows` or `--shard` (a lane's own check)
     writes `baseline.slice-i-of-28.partial.json` instead. Every reader merges it, but it never counts as the slice
     done, so the slice's full night still runs.
   - **N5 (critic r4):** the run file is written first, then the slice file, each atomically (a temporary file, then a
     rename). A crash between the two leaves no slice file: the night is retried, and no row is pinned without the run
     that judged it.
   - The rows that are RED or ERROR in the folded state (below) also run, because `--slice` implies `--red-from`.
     They are **never pinned** (I2).
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

`DRY=1 tests/scripts/ws-matrix-nightly.sh` prints the selection and runs nothing. On 2026-10-23 (fix round 4) it gave
"first baseline: slice 1/28", 883 rows and 1,272 documents, then the options-pin step's command (N8):
`node tests/scripts/ws-options-pin.cjs --check --resume --slots 2 --out design/audit/matrix/options-pin-2026-10-23.json
--report-only --shard 1/28`. `--slice i/28` runs that slice in place of the night's slice.

## Baseline invariants (critic r3 D1)

Round 3 found that each baseline night re-pinned rows that already had an entry, and rows re-selected as red, so a
real regression was written into the baseline and reported OK. The root cause was that "write the baseline" meant
"pin whatever this run printed". These five rules now hold. Each is written down in the `ws-coverage-matrix` header
("BASELINE INVARIANTS"), tested case by case in its `--self-test` (#15), and checked as a property after every night
of 300 generated sequences of runs, pins, regressions, swapped findings, crashes and re-pins on synthetic rows
(#16: 3,600 nights, 25,200 row-night checks, 0 violations on 2026-10-23). Undoing any one of them makes the self-test
FAIL.

| | Rule |
|---|---|
| **I1** | A pin is written only for a row with **no entry in the merged baseline**. `--write-baseline` and `--pin-new` are both pin-new-only; they differ only in the file they write. An existing entry changes only through `--repin <ids> --reason "<why>"`: a named, per-row action that logs the date, the commit, the reason and the old pin in the entry's `repinned` list. No nightly passes it. |
| **I2** | A row selected by `--red-from` is never pinned, even when it has no entry. |
| **I3** | The run file records the verdict judged **before** any pin. Every row is judged against the merged baseline as it was loaded; then the pins are written; no row is judged again. A newly pinned row keeps its status (PENDING(no-baseline) or OK) with `pinned: true`. |
| **I4** | The merged baseline **refuses** a row pinned in two files with different contents. The matrix and the deploy gate both FAIL, naming both files. An identical duplicate is a WARNING. File-name order never decides. A re-pin rewrites only the file that owns the entry. |
| **I5** | Nothing a night does turns a RED or ERROR row non-red. In the fold, a red row leaves the red set only when: a later run lists it OK, judged against its existing entry; it is re-pinned (`--repin`, REPINNED); or it is retired (`--retire`, RETIRED). A row printed with no entry, PENDING(no-baseline), does **not** clear it. Critic r4 tightened what "later" and "judged against its entry" mean: see "The folded state" (D2, N2, N3) and "Row statuses" (N9). |

The backtest row `baseline-night-keeps-red` (`tests/fixtures/precritic/backtests.json`) runs the critic's two
reproduce cases through the real tool, node only, with a stub print-lint. It FAILs on `53f46e10`, the tree the critic
graded, and passes on the fix.

## Row statuses

A row's status is one of these:
- **RED:** a lint count, or (N1) a finding key, is above the row's own baseline entry.
- **ERROR:** the row did not print. Either it has a render error (`L-SPLIT RENDER`, a `buildSheet` throw or a
  crashed batch), or print-lint refused its flags. No baseline forgives an ERROR row.
  - **N6: an ERROR row holds every deploy from the first slice night on**, before the full baseline as after it. This
    follows round 1's D4: no baseline forgives a render error. Owner decision (b) relaxes only rows with *findings*
    and no entry, not rows that do not print. So the first slice night that meets a render crash in any live skill
    holds all deploys until the crash is fixed. The lead should expect this during the 28 nights.
  - How a lane clears one is under "Clearing a red row" below.
- **PENDING(no-baseline):** the row has findings but no baseline entry of its own (owner 2026-10-23). This status is
  **never red**. The row printed; there is nothing yet to compare it with. The first full baseline or `--pin-new`
  pins it. It does **not** clear a row that is already red (I5).
- **PENDING(step):** the row needs a later build step.
- **N/A:** the row does not apply to its skill.
- **N9 (critic r4): a red row that turns PENDING(step) or N/A stays red**, shown as "not re-run (now N/A)", until a run
  lists it OK. It was not judged, so it is not a fix. If the row is gone for good, the lead retires it with `--retire`
  (allowed for a row that is red and was last seen N/A or PENDING(step)). A row that has a baseline entry and is now
  N/A is flagged in the fold as a WARNING: its entry checks nothing any more.
- **N1 (critic r4): a crashed batch is run once more.** When print-lint or the runner dies and leaves documents
  without a result, those documents run once more before any row is judged. A single transient crash no longer makes
  rows ERROR (which held every deploy until the lead re-pinned them).
- In a `--repin` run, a re-pinned row keeps the status it was judged with (RED, I3) and carries `repinned`. The fold
  reads it as **REPINNED**, which is not red. A `--retire` run lists the gone row as **RETIRED**.

## The pilot baseline: 127 rows without finding keys (N2)

`design/audit/matrix/baseline.json` holds the 127 rows pinned on 2026-10-23 by the pilot run. They were pinned before
finding keys (N1) existed, so **none of them carries `keys`**.
- They are compared **by counts** only. A new finding that replaces a fixed one of the same rule at the same size is
  not caught on these rows.
- The first-baseline nights do not re-pin them (I1), so they stay count-only.
- They gain keys only when the lead re-pins them, row by row, with `--repin <ids> --reason "add finding keys (N1)"`
  and a STATUS note. That is a deliberate choice, made after a look at each row's current findings. It is not done
  in this round, and the rows are not re-run here.

## Clearing a red row

| The row is | What clears it |
|---|---|
| RED (a rise over its entry) | Fix the skill and merge it to the integration branch. The next night re-selects the row (`--red-from`) and lists it OK. A lane can also run the row itself on a clean tree: `node tests/scripts/ws-coverage-matrix.cjs --skills <cat:skill> --rows '<id>' --red-from design/audit/matrix --baseline design/audit/matrix/baseline.json --out auto`. Then commit the run file; `auto` never overwrites a night's file. |
| RED, and the change was deliberate (the page is meant to look different now) | The lead re-pins it: `node tests/scripts/ws-coverage-matrix.cjs --repin '<id>[,<id>...]' --reason "<why>"`. Commit the baseline file it rewrote, the run file it wrote, and a STATUS note. |
| ERROR (it did not print) (N6) | Fix the render error. The next night, or the lane's own run above, prints it. If it then prints with **no findings**, it is OK and cleared. If it prints **with findings and no entry**, it stays red, because unjudged findings are not a fix (I5), and nothing pins a re-selected red row (I2). The lane looks at those findings and asks the lead for `--repin '<id>' --reason "first pin after the render fix"`. |
| RED, and it is now N/A or PENDING(step) (N9) | Make it checkable again and let a night list it OK, or, if the row is gone for good, `node tests/scripts/ws-coverage-matrix.cjs --retire '<id>' --reason "<why>"` on a clean tree, and commit the run file it writes. |
| Any red row, cleared by a lane's own run | The run must be on a **clean tree** (N3: a run file with `dirty: true` never clears a red row) and judged against **this directory's baseline** (N2: `--baseline design/audit/matrix/baseline.json`; an OK judged against another baseline is ignored, with a WARNING at deploy). `--repin` refuses a `--baseline` outside its `--out` directory. |
| Its id no longer exists (an option renamed or removed) (N1) | If the skill is live and a current row has the same kind and the same flags, the red state **maps** to that row. That row is re-run under its new id and judged against the old entry, and the old id clears once it runs OK. Otherwise the deploy gate and `--red-from` print **RETIRED-ROW**: a warning, never a refusal. To clear the warning, run `node tests/scripts/ws-coverage-matrix.cjs --retire '<id>' --reason "<why it is gone>"` and commit the run file it writes. `--retire` refuses an id that is a row today, or that maps to one. |
| Of a skill that is not live | It is ignored (already the rule). |

## The folded state (critic r2 D1)

A night does not run every row. So no single run file says which rows are red. Instead, the deploy and the night's
`--red-from` read **every** run file in `design/audit/matrix/`, in the order they finished, and fold them.
- **N5: a run file is any `.json` there that carries `commit`, `finished` and `rows`**, whatever its name. A file
  named as a nightly (`<date>[T<HHMM>][.shard-i-of-n].json`) is always folded. A file under another name is folded too:
  `pilot-baseline-2026-10-23.json` is one. Every other `.json` is **listed** with why it was skipped. Baseline, cache
  and options-pin files are listed in one line. Any other skipped file, such as `e1-check-2026-10-23.json`, which has
  no `finished`, gets its own WARNING line.
- **D2 (critic r4): every run file is ordered by `finished`**, whatever its name; ties are broken by file name. A
  nightly-named file without a `finished` is placed at its name's time (`<date>` = 00:00 UTC, `<date>T<HHMM>` = that
  time, which is the run's start). Before this fix a nightly file was ordered by its date alone, so a lane's OK that
  finished at 00:30 overrode the nightly's RED that finished at 02:10 the same day. The property test now generates
  run files under other names whose finish times interleave with the nightly's; sorting by the date in the name makes
  it FAIL.
- **N2 (critic r4): a clearing OK must have been judged against this directory's baseline.** Every run file records
  `baseline` (the merged baseline file, its directory, its files and a hash) and each row's `baselineKey` (the key of
  the entry it was judged against). An OK clears a red row only when the run's baseline is this directory's and the
  row's key is the key of its current entry here. An OK with a stale key still clears when the row's recorded
  findings, re-judged against the current entry, do not rise. A REPINNED record clears only while the entry it wrote
  is the current one. An OK that may not clear is ignored and named in a WARNING. `baseline: null` (a run with no
  `--baseline`, where any finding was red, so OK means no findings at all) clears. A run file written before N2 (no
  `baseline` field) clears as before, and the fold names it in a WARNING.
- **N3 (critic r4): a run file with `dirty: true` never clears a red row.** It can still make a row red.
- The age of the newest nightly, and whether it covers the tip, are judged on the nightly's own names only. A lane's
  run under another name changes the state of its rows, but it is not "the newest nightly".
- **A row's state is its status in the most recent run that ran it.** A run ran a row when it lists the row in `rows`
  or in `red`.
- A RED or ERROR row therefore stays red through every later run that did not select it. It stops being red only
  under I5: a later clean run lists it OK against this directory's entry, or it is REPINNED or RETIRED.
  PENDING(no-baseline), PENDING(step) and N/A do not clear it (N9).
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
only, and the WARNING does not claim coverage it does not have (N4).
- The matrix writes `<logdir>/matrix-inline.over-budget.json`. It lists which affected rows **have** a baseline
  entry; these include the 127 pilot rows. It also lists which have none.
- The WARNING gives both counts and names the first rows. A baselined row is **NOT checked at this deploy**: nothing
  checks it until the full baseline exists, or until a change fits in the 500-document budget.
- A row with no entry is PENDING(no-baseline).
- The lanes' precritic covers their own skills.

## The run file (read by the deploy)

`ws-coverage-matrix` writes the run file (`--out`); its header documents the shape under "THE RUN FILE".

**Top-level fields:**
- `commit`: the full sha the rows ran on.
- `dirty`: true when the tree had local edits. Such a run never clears a red row (N3).
- `baseline` (N2): the merged baseline the rows were judged against: `file`, `dir` (relative to the repository root),
  `files`, `entries` and `hash`; `null` without `--baseline`.
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
- `baselineKey` (N2): the key of the entry the row was judged against; `judgedAgainst` for a renamed row (the old id
  whose entry judged it); `repinned.key` for a re-pinned row (the entry the re-pin wrote).

`selection.redFrom.reselected` lists only the red rows this run actually ran (N6): with `--kind`, `--rows` or
`--shard`, the red rows they leave out are named in the log as NOT run, and they stay red.

## At deploy: the options gate (S5 session 1, critic r4 D1)

Session 1 never runs the options pin. Its gate is `node tests/scripts/ws-options-pin.cjs --gate design/audit/matrix`:
node only, no browser slot, under a second (a node worker; `ws-deploy-gates.sh --list | grep -i options` shows it).
It folds every `design/audit/matrix/options-pin-*.json`, ordered by `finished` (ties by name), into each skill's
newest result, and judges it against the **current** pin `design/audit/baselines/options-verify.json`.

| Result | When |
|---|---|
| **FAIL** | A live skill's newest result has a failing pair the pin does not list: a NEW pair that no later check fixed. A file with `dirty: true` can add a NEW pair but never clears one. An unreadable options-pin file. Once all 28 slices have been checked: no file, or the newest finished more than 24 h ago. |
| **WARNING** (passes) | No options-pin file yet; fewer than 28 slices checked (a slice counts when a complete, clean, hash-batched run of `i/28` exists; a complete clean full run counts as all 28); or the newest file is more than 24 h old before all 28 are checked. This mirrors the matrix's rule before its first full baseline. |
| **OK** | Otherwise. |

A NEW pair is cleared by a later check that no longer fails it (the next night of its slice, or a lane's own
`ws-options-pin --check --skills <cat:skill> --out design/audit/matrix/options-pin-<date>T<HHMM>.json` on a clean tree),
or by a deliberate re-pin with a STATUS note (`ws-options-pin --write --skills <cat:skill>`). The self-tests are
`node tests/scripts/ws-options-pin.cjs --self-test` (the hash batching and the fold) and the fixture directories in
`tests/fixtures/precritic/deploy/options-pin/` that `ws-deploy-gates.sh --self-test` runs.

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
   - **FAIL:** a row of a live skill is RED or ERROR in the folded state, or the inline run fails. A red id renamed
     to a current row of the same kind and flags still fails, named under its new id, until that row runs OK (N1).
   - **FAIL (I4):** the merged baseline pins a row in two files with different contents.
   - **WARNING (critic r4 N2, N3, N9):** an OK that may not clear a red row (judged against another baseline or a
     stale entry, or from a dirty run; the row stays red), a run file written before N2 that cleared a row unchecked,
     and a row with a baseline entry that is now N/A.
   - **WARNING (N1):** a red id of a live skill that is no longer a row and maps to none is RETIRED-ROW. It never
     refuses, and the warning says how to `--retire` it.
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
>    - the ids of the first 20 RED or ERROR rows, each with its first rise or error;
>    - the options pin's `against ...` line and its first 20 NEW pairs.
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
