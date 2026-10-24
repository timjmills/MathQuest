# Wave 0 part A (checks and deploy gates): independent critic, round 5

- **Critic:** independent, mq-opus-medium. I built none of this work.
- **Tree:** `20fba5e9` on `claude/sweet-newton-c8wrv1-wip-wave0-gates`. During the round the lead committed `102de402`
  (ws-harness: an aborted font load is not a page error). That change is outside this scope. I did not touch it.
- **Date:** 2026-10-23.
- **Graded against:** the plan as amended by the owner decisions in `design/status/wave0-gates.md`:
  - the nightly runs one 1/28 slice a night, and builds the first full baseline over 28 nights;
  - a row with no baseline is PENDING, not RED;
  - a stale nightly is a WARNING until the full baseline exists.
- **Scope:** S2, S4, S5, S9, the E1 tools before M4, and `ws-options-pin` with its read-only deploy gate.
- **Method:**
  - Mutations and stub runs used a temporary worktree and sandboxes in the scratchpad. All of them are removed.
  - Browser work went through `/tmp/mq-browser-run.sh`, one gate at a time. ws-options-pin ran unwrapped.
  - No tracked file was edited. This report is the only repo file I wrote.
  - No processes are left running.

## Verdict: PASS

| Criterion | Score | Why |
|---|---|---|
| 1. Does what the plan (as amended) says | **9** | Both r4 defects are fixed at the root. **D1:** deploy session 1 no longer runs the pin. It runs `ws-options-pin --gate design/audit/matrix`, which reads results only (node, no slot, 0.05 s). That gate follows the matrix's owner rule: a WARNING before all 28 slices are checked or while the file is stale, a FAIL on any NEW pair. **D2:** every run file is folded by `finished`, and the r4 reproduce now refuses. The clearing rules hold (another baseline, a dirty run, N/A or PENDING, a renamed row). Minus: three nits on hand-made or stale-tool run files (N1–N3). |
| 2. The backtests are real | **9** | All 7 fixture rows FAIL→PASS (3.6 s). `baseline-night-keeps-red` passes on its commit pair (9.5 s), and also against HEAD's own matrix. The browser row `lone-item` FAILs on `359802c5` and passes on `b19172b4` (17.9 s). I made five mutations of my own, and every one fails its self-test (details below). Carried: the mc-production backtest still bypasses the in-page sampler (r2 N3). |
| 3. Usable by a builder | **8** | The refusals name the file, the reason and the command that clears it, for example the full `--write --skills` re-pin and `--retire` lines. NIGHTLY.md has an "At deploy: the options gate" section and a clean-tree rule in "Clearing a red row". Minus: CLAUDE.md "Checks to run" still names neither `ws-deploy-gates.sh` nor `ws-backtest` (carried). A legacy run file can clear a red row with only a WARNING (N2). |

PASS needs 8 or more on all three criteria. This round passes, with no blocking defect.

## 1. Critic r4 D1 and D2

| Check | Result |
|---|---|
| `bash tests/scripts/ws-deploy-gates.sh --list \| grep -i options` | `1 nfn ws-options-pin --gate (read-only: nightly results) node tests/scripts/ws-options-pin.cjs --gate design/audit/matrix`. No `--check` is on the list. `ws-share-options` is unrelated |
| `ws-options-pin --gate design/audit/matrix` (real dir) | 0.05 s. WARNING (exit 4): no options-pin file yet, so nothing is refused until all 28 slices are checked. This matches the owner rule |
| Options fixtures (7 cases: `none`, `new-pair`, `new-then-fixed`, `stale`, `stale-covered`, `dirty-clear`, `order`) | Each gives the expected verdict. `order` is the D2 class for options: a clean lane file at 00:30 does not override the nightly's NEW pair at 02:10 |
| End to end, real browser: `--check --skills composing:number_word_form,subtraction:sub_50_no_regroup --out <scratch>` (42.6 s) | The run file has `finished`, `commit`, `dirty: false`, `complete`, `subset: true`, `batching: hash-v1`, and the pin's sha256. Results by pin: <ul><li>`--gate` with the real pin gives WARNING (no NEW pair, 0 of 28 slices).</li><li>`--gate` with a copy of the pin that drops `zeroPlace="always"` gives FAIL, naming the NEW pair and the fix command.</li></ul> The gate re-judges against the current pin, so un-pinning a fixed pair is also caught |
| r4 D2 reproduce: `MQ_NOW=2026-10-23T03:00:00Z nightly_check nightly/fold-order 0 fresh` | REFUSED: `RED since run 2026-10-23 (S L-DENSITY PG-23: 0 -> 2)`, exit 1. The reverse case (`fold-order-reverse`) is OK, with no false refusal |
| `ws-coverage-matrix --self-test` | OK, 161 assertions (6.2 s). Property test: 25,200 row-night checks, including 526 D2 interleaved-name cases, 363 N2 cases and 346 N3 cases. 0 violations |
| `ws-options-pin --self-test` | OK, 57 assertions (0.9 s) |
| `ws-deploy-gates.sh --self-test` | OK, 76 ok lines (29.9 s), including the r4 D2, N2, N3 and N9 fixtures and the options-gate cases |

### My own mutations (temporary worktree)

| Mutant | Result |
|---|---|
| Fold sorted by name stamp (the r4 bug) | Matrix self-test FAIL, 18 property violations |
| Drop the dirty-run rule in `clears` | FAIL, 14 |
| Drop the baseline-directory match (N2) | FAIL, 1 |
| Let N/A or PENDING clear a red row (N9) | FAIL, 3 |
| Options gate sorted by file name | Options self-test FAIL on the D1/D2 order case |

### Hand-made run files against the fold (copies of `fold-order`, a nightly RED at 02:10)

| Added file | Verdict | Correct? |
|---|---|---|
| `lane.json` OK, `dirty: "yes"` | REFUSED, with a WARNING that the dirty OK is ignored | yes |
| `2026-10-23T0100.json` OK, finished 01:00 (a named file, earlier) | REFUSED | yes |
| `2026-10-23T0230.json` OK, no `finished` (ordered by the name's time) | OK | yes: 02:30 is after 02:10 |
| `zzz.json` OK, same finish second as the nightly | OK: ties go by name | arbitrary, but not reachable in practice |
| `lane.json` OK, `dirty: null`, `baseline: null` | OK | by design: no baseline means any finding is red, so OK means zero findings |
| `lane.json` OK, **no `baseline` field** (a legacy file) | **WARNING, and the deploy passes**: "records no baseline (written before N2): its OK cleared 1 red row unchecked" | N2 below |
| `lane.json` OK, **`finished: 2027-01-01`** (in the future) | **OK, silently** | N1 below |

### Real sandbox runs (the checkout's matrix with a stub print-lint)

- **Clean OK clears the row.** A red row (from a hand-made fold) was re-run clean with `--rows R --red-from`, judged against the directory's baseline. The fold cleared it, and the other red row stayed red.
- **Dirty run does not clear.** The same run on a dirty tree did not clear the row. That tree was dirty for real: another session's edit of `tests/lib/ws-harness.cjs`, since committed as `102de402`. The deploy would show it as a WARNING.
- **Different writer root.** With a different `MQ_ROOT` the recorded `baseline.dir` does not resolve to the same directory. The fold then falls back to re-judging the recorded sizes against the current entry, which is safe.

## 2. r4 nits claimed fixed

| Nit | State | Evidence |
|---|---|---|
| N1 retry of a crashed batch | Fixed | A stub print-lint that exits 3 without JSON on its first call: the log shows `3 document(s) had no result (print-lint crashed); running them once more`, then `batch 2/2`. The row is OK, not ERROR |
| N2 baseline recorded; `--repin` with a `--baseline` outside the `--out` dir | Fixed | The run file records `baseline {file, dir, files, entries, hash}` and the per-row `baselineKey`. `--repin … --baseline <other dir>` is refused before any browser starts, and nothing is written. The `foreign-ok` fixture refuses |
| N3 dirty run | Fixed | The `dirty-ok` fixture, my `dirty: "yes"` file and the real dirty sandbox run all keep the row red |
| N4 partial slice | Fixed | `--slice 3/28 --write-baseline --rows R` writes `baseline.slice-3-of-28.partial.json`. `baselineComplete` stays `complete: false` with `have: 0` |
| N5 write order | Fixed | The run file is written before the slice file, each one atomically |
| N6 `--red-from` with `--rows` | Fixed | The log says `1 red row(s) re-selected and run; 1 outside --kind / --rows / --shard are NOT run by this run (they stay red)`. `selection.redFrom.reselected` lists only the row that ran |
| N8 options batches by hash; DRY shows the step | Fixed | The self-test checks that the 28 slices partition the skills and that appending 60 skills moves none. The `DRY=1 ALLOW_NOT_TIP=1` nightly prints `then the options pin: … --check --resume --slots 2 --out design/audit/matrix/options-pin-2026-10-23.json --report-only --shard 1/28` |
| N9 N/A or PENDING keeps red; a pinned row turned N/A warns | Fixed | The `turned-na` fixture refuses ("not re-run (now N/A)"). The `pinned-na` fixture gives a WARNING |

## 3. Backtests

| Command | Result |
|---|---|
| `node tests/scripts/ws-backtest.mjs --kind fixture` | 7 PASS, 3.6 s |
| `--row baseline-night-keeps-red` | PASS: FAIL 2.0 s on the bad commit, OK 2.1 s on the fix. `baseline-night.cjs --root <HEAD>` is also OK, so HEAD keeps the row red |
| `--row lone-item` (browser commit pair, my choice) | PASS: FAIL 6.2 s on `359802c5`, OK 5.8 s on `b19172b4`. The worktrees were removed |

## 4. Earlier-passed parts (regression check)

| Command | Result |
|---|---|
| `ws-print-lint --self-test` (runner) | OK: 52 assertions, 40 planted defects (97.7 s) |
| `ws-screen-slots --self-test` | OK |
| `ws-chromebook-fit --self-test` | OK |
| `ws-node-lint --self-test` | OK |
| `ws-envelope --self-test` | OK (2.4 s) |
| `ws-content-audit --self-test` | OK: 138 assertions |

## Blocking defects

None.

## Nits

- **N1. A run file whose `finished` is in the future wins the fold for good, silently.**
  - Where: `ws-coverage-matrix.cjs:935-954` and `ws-options-pin.cjs:136-139`.
  - Neither fold checks `finished` against the clock or against `started`.
  - Reproduce: `fold-order` plus `lane.json` (OK, `finished: 2027-01-01`). `nightly_check … fresh` prints `nightly: OK`.
  - Only a hand edit or a skewed clock can produce this.
  - Fix: refuse, or at least warn on, any `finished` later than now plus a few minutes, or earlier than `started`.
- **N2. A run file with no `baseline` field still clears a red row, with only a WARNING.**
  - Where: `ws-coverage-matrix.cjs:968`.
  - The rule exists for the two run files written before N2. But a lane on a branch older than `b261abf0` still runs the
    old tool. Its OK judged against another baseline (the r4 N2 class) then clears a red row, and the deploy passes with a
    warning.
  - Fix: accept the legacy clear only for files that finished before the fix-r4 merge (2026-10-23T19:46Z), and refuse
    after that.
- **N3. `--resume` reuses an earlier run's batches from the same day.**
  - Where: `ws-options-pin.cjs:390`, `:458`.
  - The nightly always passes `--resume`. The tmp dir is keyed by UTC date and shard, not by commit. A second run on the
    same date in the same container reuses the earlier batch JSON and records the new HEAD.
  - The second run could be a fired nightly after a lane's fix, or a lane's own `--check`.
  - Effects:
    - A fixed pair can stay NEW. That is a false refusal, which is safe.
    - A new pair at the newer commit can be missed until the slice comes round again.
  - Fresh-session nightlies start with an empty `/tmp`, so this is rare.
  - Fix: key the tmp dir by the commit, or by a hash of the print inputs.
- **N4. A missed options slice is not re-run during the first baseline.**
  - The options slice follows the matrix's `NEXT_SLICE`. If the matrix slice succeeds but its options-pin step crashes,
    the next night moves on, so that options slice is not re-checked until the rotation after the full baseline.
  - The options gate stays WARNING (at most 27 of 28) and says so, so nothing passes silently. The cost is a longer
    WARNING period.
- **N5 (carried).**
  - r2 N3: the mc-production backtest still feeds `mcJudge` directly.
  - r1/r3/r4 N7: CLAUDE.md "Checks to run" still names neither `ws-deploy-gates.sh` (with `--self-test`) nor `ws-backtest`.
- **N6 (carried, r4 N7).** A renamed (mapped) row never gets its own entry, so it is re-mapped every night. It works, but
  it never settles.

## What I ran

| Command | Result |
|---|---|
| `ws-deploy-gates.sh --list \| grep -i options` | The read-only `--gate`, nfn, session 1 |
| `ws-options-pin --gate` on the real dir and on 7 fixtures; `--check --skills` (2 skills, real browser), then `--gate` against the real pin and a modified pin | As above |
| `nightly_check` on `fold-order`, `fold-order-reverse`, and 7 hand-made variants | As above |
| `ws-coverage-matrix --self-test`; `ws-options-pin --self-test`; `ws-deploy-gates.sh --self-test` | OK (161 assertions); OK (57); OK (76 ok lines) |
| 5 mutants (temporary worktree) | Each one FAILs its self-test |
| Stub-print-lint sandbox: N1 crash retry, N4 partial slice, N6 `--red-from` with `--rows`, clean vs dirty clearing, N2 `--repin` refusal | As above |
| `DRY=1 ALLOW_NOT_TIP=1 ws-matrix-nightly.sh` | Slice 1/28, 883 rows, plus the options-pin command |
| `ws-backtest --kind fixture`, `--row baseline-night-keeps-red`, `--row lone-item` | 7 / 1 / 1 PASS |
| Regression self-tests (6 tools) | All OK |
