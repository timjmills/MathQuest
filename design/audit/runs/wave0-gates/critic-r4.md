# Wave 0 part A (checks and deploy gates): independent critic, round 4

- **Critic:** independent, mq-opus-medium. I built none of this work.
- **Tree:** `ac1c696b` on `claude/sweet-newton-c8wrv1-wip-wave0-gates`. Nothing tracked was edited. This file is the only
  repo file I wrote.
- **Date:** 2026-10-23.
- **Graded against:** the plan as amended by the owner decisions in `design/status/wave0-gates.md`:
  - the nightly runs one 1/28 slice a night and builds the first full baseline over 28 nights;
  - a row with no baseline is PENDING, not RED;
  - a stale nightly is a WARNING until the full baseline exists.
- **Scope:** S2, S4, S5, S9, the E1 tools before M4, and `ws-options-pin`.
- **Out of scope:** ws-precritic, M4, ws-packer-proof and the three timed deploy runs.
- **Method:**
  - Browser runs went through `/tmp/mq-browser-run.sh`. ws-coverage-matrix ran unwrapped, as it takes its own slots.
  - Every sandbox used scratch directories. No tracked file changed: `git status` was clean at the end.
  - No processes or temporary worktrees were left behind.

## Verdict: FAIL

| Criterion | Score | Why |
|---|---|---|
| 1. Does what the plan (as amended) says | **7** | Critic r3's D1 is fixed at the root. I1 to I5 hold on every nightly path I tried, with the real print-lint and with stubs. But there are two new defects. **D1:** deploy session 1 now runs the *whole* options pin (≈ 1 h 52 min on the two shared slots), so S5's ≤ 30-minute deploy cannot be met. That contradicts the plan, and the owner's design runs the pin as a nightly 1/28 slice. **D2:** the fold orders a run file under another name (folded since the N5 fix) by its `finished` time, but a nightly's `<date>.json` by its date alone. So an OK from a run that finished *before* the nightly overrides the nightly's RED, which breaks I5. |
| 2. The backtests are real | **8** | All 7 fixture rows FAIL→PASS (3.7 s). `baseline-night-keeps-red` FAILs on `53f46e10` and passes on `a5297660`; it runs the checkout's real matrix with a stub print-lint. `text-generator-wrm-page` passes (5.1 s). Mutation check: undoing I1, I2, I4 or I5 in a copy of the tool makes `--self-test` FAIL (124 to 1,580 property violations), so the property test has teeth. Gaps: the property test only uses `<date>.json` names, so it cannot see D2. r2 N3 (mc-production bypasses the in-page sampler) is still open. |
| 3. Usable by a builder | **8** | The refusals are precise and name the fix: `--repin` / `--retire` misuse, I4 conflicts, RETIRED-ROW, and "printed with no entry … pin it with --repin". The NIGHTLY.md "Clearing a red row" table is clear. Minus: a transient batch crash leaves 3 rows red until the lead re-pins them (N1); `DRY=1` does not show the options-pin step (N8); the `--rows` + `--red-from` log overstates what was re-run (N6). |

PASS needs 8 or more on all three criteria. This round is a **FAIL** on criterion 1, from D1 and D2. Both fixes are small.

## 1. Critic r3 D1: fixed at the root (verified)

| Check | Result |
|---|---|
| r3 reproduce 1, real print-lint. The row is pinned at zero in `baseline.json`; the run is `--slice 3/28 --red-from --write-baseline` | `1 already had an entry and were judged against it, not re-pinned`. The status is **RED** (`L L-DENSITY PG-23: 0 -> 2`). The slice file pins 0 rows, the fold keeps the row red, and the verdict is FAIL (15 s) |
| r3 reproduce 2, real print-lint: `baseline.slice-3-of-28.json` at zero and `2026-10-22.json` RED; slice-4 night, then a re-run, then `nightly_check … 0 fresh` | The slice-4 night is RED with `1 re-selected as red, never pinned (I2)`. The re-run is RED. `nightly: REFUSED - … RED since run 2026-10-23T1200`, exit 1 |
| `ws-coverage-matrix --self-test` | OK, 139 assertions. Property test: 300 sequences, 25,200 row-night checks, 0 violations (4.7 s) |
| Mutation of the tool (in scratch): drop the I2 line; make `pinRows` ignore the merged baseline; drop the "PENDING(no-baseline) does not clear" rule; resolve duplicates by file order; re-judge after the pin | Each one makes the self-test FAIL, naming the invariant (I2 154 violations, I4 1,580, I5 124; the I3 change fails the `--repin` cases) |
| `bash tests/scripts/ws-deploy-gates.sh --self-test` | OK, 60 ok lines, 25.6 s |
| `ws-backtest --row baseline-night-keeps-red` | PASS: FAIL 2.5 s on `53f46e10`, OK 2.2 s on `a5297660` |
| `--repin` / `--retire` CLI misuse: with `--slice`, with `--red-from`, no `--reason`, a reason under 8 characters, `--reason` alone, `--pin-new` with `--write-baseline`, `--retire` of a current row, `ws-matrix-nightly.sh --repin` | Every one is refused with a FAIL naming the clash |
| Renamed row: an old id that is RED, with the flags of a current row (stub print-lint) | MAPPED and judged against the old entry: RED, then OK after the fix (the deploy clears it), then RED again on a new rise. Correct |
| Hand-made I4 conflict | Refused by every run that reads the baseline, naming both files (self-test, and `nightly_check` refuses) |

### Hand-made sequences that still break or bend an invariant

- **The fold's order (D2, below).** This one breaks I5.
- **An OK judged against another baseline clears a red row.** Scenario B, sandbox, real tool:
  - The row is RED in the fold, against an entry of 0.
  - Then `--rows R --baseline <other dir>/baseline.json --out <matrix dir>/2026-10-24.json`, where the other baseline pins
    9, prints **OK**.
  - The fold's red list is now empty.
  - The run file does not record which baseline it was judged against, so the fold cannot tell. (N2)
- **`--repin` with `--baseline` elsewhere still writes REPINNED into the matrix directory.** Scenario C:
  - `--repin R --reason … --baseline <other>/baseline.json --out <matrix dir>/…` rewrites only the other file.
  - The fold reads the row as REPINNED, and the real entry is unchanged.
  - With the default `--out auto`, one wrong `--baseline` does this to the real `design/audit/matrix`. (N2)
- **A dirty run file listing OK clears a red row in the fold.** Only the deploy's inline run is checked for `dirty`. (N3)
- **A crashed row (ERROR, with no entry) that later prints with findings stays red for good.** Scenario A:
  - I2 never pins it, and I5 never clears it, so only `--repin` does.
  - NIGHTLY.md documents this. The cost is in N1.

## 2. Critic r3 nits claimed fixed

| Nit | State | Evidence |
|---|---|---|
| N1 red id that no longer exists | Fixed | A hand-made red `addition:add_20_regroup\|single/more-oldname` gives a `RETIRED-ROW` WARNING, not a refusal, with the exact `--retire` command. `--retire … --reason` writes a RETIRED run file, and the warning is then gone. `--retire` of a current row is refused. Mapping works (above) |
| N4 over-budget message | Fixed | Real run: `--all --affected <css commit> --max-docs 500` gives `OVER-BUDGET 32766` and `<out>.over-budget.json` with 127 `withBaseline` and 10,795 `noBaseline` rows. `nightly_check` full mode quotes both counts and says the baselined rows are NOT checked |
| N5 run files under other names | Fixed, but it introduced D2 | The real dir folds `pilot-baseline-2026-10-23.json`, lists `baseline.json` as skipped, and WARNs that `e1-check-2026-10-23.json` has no `finished` |
| N6 ERROR rows hold every deploy | Documented | NIGHTLY.md "Row statuses" has the N6 paragraph, and "Clearing a red row" has the ERROR row |

### ws-options-pin

| Check | Result |
|---|---|
| `--list` | 714 live skills, all with options; 29 batches of up to 25 (2.4 s, one browser start). `--shard 5/28` gives 1 batch of 25. Shard 1/28 takes batches 0 and 28, so 28 nights cover all 29 batches |
| `--check --skills composing:number_word_form,subtraction:sub_50_no_regroup` (batches through the runner) | 43.6 s; 2 failing pairs, both pinned. `0 new … ws-options-pin: OK` |
| The same check against a copy of the pin with `zeroPlace="always"` removed | `1 new failing pair … NEW: composing:number_word_form zeroPlace="always": … the control does nothing`, then `ws-options-pin: FAIL`. It catches a new pair |
| Pin format against `ws-precritic.cjs` `PARSE.optionsVerify` (`:337-394`) | Matches: `{skills: {"cat:skill": ["option=<JSON>" \| "static:<msg>"]}}`, and the ids are built the same way (`${option}=${JSON.stringify(value)}`, `static:${m}`; a timeout is `*="*"` in both). The pin has 714 skills (115 with 335 pairs) and no `*="*"` today |
| Nightly wiring, `DRY=1 ALLOW_NOT_TIP=1 ws-matrix-nightly.sh` | `first baseline: slice 1/28 … writes baseline.slice-1-of-28.json`, 883 rows and 1,272 documents. By reading the code: the options pin gets `--shard $S` (the same slice, 1/28), `--resume`, `--report-only`, `--out $DIR/options-pin-<date>.json`; with SHARD it gets that shard. The DRY run exits before the options-pin step, so this wiring cannot be seen dry (N8) |

## 3. Backtests

| Command | Result |
|---|---|
| `node tests/scripts/ws-backtest.mjs --kind fixture` | 7 PASS (notation, l1-sizes, l3-key, l6-steps, l10-cycle, node-lint-keys, mc-production), 3.7 s |
| `--row baseline-night-keeps-red` | PASS, 9.9 s |
| `--row text-generator-wrm-page` (my choice of commit pair) | PASS, 5.1 s; the worktrees were removed |

## Blocking defects

**D1. Deploy session 1 runs the whole options pin, about 1 h 52 min, so S5's ≤ 30-minute deploy is impossible.**

**Where:**
- `tests/scripts/ws-deploy-gates.sh:646`:
  `if [ -f tests/scripts/ws-options-pin.cjs ]; then node_gate 1 "ws-options-pin --check" ws-options-pin.cjs --check; fi`
- Header `:37`.

**What happens:**
- Fix r1 added this line "as soon as it is in the tree". The tool is now in the tree, so session 1 checks all 714 skills
  in 29 batches.
- The lane's own measurement (NIGHTLY.md) is ≈ 1 h 52 min wall on two slots, ≈ 16.8 s of slot time a skill.
- It is registered as a **node** gate, but every batch takes a **browser** slot. So it competes with session 1's own
  browser gates for the same two slots.
- The last timed session 1 (`deploy-gate-timings.jsonl`, 13:09) took 1,581 s *without* it.

**Why it is blocking:**
- Plan §1.4 S5 says "three timed runs at ≤ 30 min wall clock, same gates, nothing skipped".
- The plan's deploy list has no full options-verify sweep.
- The owner's design for this pin is a nightly 1/28 slice.

**Reproduce:** `bash tests/scripts/ws-deploy-gates.sh --list | grep options` prints
`1  node  ws-options-pin --check  node tests/scripts/ws-options-pin.cjs --check`.

**Fix:**
- At deploy, check only the skills the deployed range reaches: `--check --skills <affected skills>`, like the matrix's
  affected rows. Rely on the nightly slice for the rest. Or read the newest `options-pin-<date>.json` the way
  `nightly_check` reads the matrix.
- Make it a browser gate, so the session's slot accounting is honest.

**D2. The fold orders run files under other names by time, but nightly files by date only. An earlier OK overrides a
later RED (I5).**

**Where:**
- `tests/scripts/ws-coverage-matrix.cjs:852-886` (`foldRuns`; the stamps at :863 and :871, the sort at :878).
- A `<date>.json` gets the stamp `2026-10-23`.
- A run under another name gets the stamp `2026-10-23T<HHMM>` from `finished`, so it always sorts after that day's
  nightly, even when it finished hours before.
- N5 (folding other names) is what made this reachable.

**Reproduce (node only):**

| File | `finished` | Row R |
|---|---|---|
| `2026-10-22.json` | 02:00 on 10-22 | OK |
| `lane-check.json` | 2026-10-23T00:30 | OK |
| `2026-10-23.json` | 2026-10-23T02:10 | RED (`0 -> 2`) |

- `foldRuns` order: `2026-10-22 -> 2026-10-23 -> lane-check@2026-10-23T0030`, and `red: []`.
- `MQ_NOW=2026-10-23T03:00:00Z nightly_check <dir> 0 fresh` prints
  `nightly: no RED / ERROR row … nightly: OK`.
- The nightly found the row RED *after* the lane's OK, and the deploy passes it.
- The reverse order (an earlier lane RED and a later nightly OK) gives a false refusal.

**When it happens:** the nightly is scheduled at 01:13 UTC and finishes about 02:15. So any lane run written under its
own name between 00:00 and the nightly's finish is folded out of order. Lanes do write such files: today's
`pilot-baseline-2026-10-23.json` and `e1-check-2026-10-23.json`.

**Fix:**
- Order every run file by `finished`, falling back to the name's stamp only when `finished` is missing. Note that
  `<date>T<HHMM>` names carry the *start* time (`autoOut` runs before the run).
- Add generated non-standard names and finish times to the property test.

## Nits

- **N1. A transient crash costs a lead action.**
  - A batch crash (`print-lint exit …`, not a `buildSheet` throw) makes 3 rows ERROR.
  - Once they print again with findings and no entry, they stay red: I2 never pins them, and I5 never clears them.
  - Every deploy is held until the lead runs `--repin` on each one (scenario A, verified).
  - This is documented, but owner decision (b) says a row with no baseline is PENDING.
  - Consider retrying a crashed batch once. Or let a row whose only red state was ERROR with *no* entry be pinned by the
    next pin-new / write-baseline night: it has nothing to regress from.
- **N2. Nothing ties a clearing run to the matrix's own baseline.**
  - The run file does not record the baseline it was judged against: no path and no hash of the row's entry. So the
    fold accepts an OK judged against any baseline (scenario B).
  - `--repin` writes REPINNED into the `--out` directory even when `--baseline` names another directory (scenario C).
  - Fix: record `baseline` and the per-row `baselineKey` in the run file. In the fold, accept OK / REPINNED only when they
    match the folded directory's merged baseline. Refuse `--repin` when `--baseline` is outside the `--out` directory.
- **N3.** A committed run file with `dirty: true` that lists OK clears a red row (scenario D). Only the deploy's inline run
  is checked for `dirty`.
- **N4. A partial slice run marks the whole slice done.**
  - `--slice i/n --write-baseline` with a partial selection (`--skills`, `--kind`, `--rows`) still writes
    `baseline.slice-i-of-n.json`.
  - `baselineComplete` and the nightly's NEXT_SLICE then treat that slice as done for every skill. Seen in both of my
    reproduce runs.
  - The result is a false "complete", and up to 28 nights where those rows have no entry.
  - Fix: record the selection in the slice file, and write it only for `--all` (or ignore partial ones).
- **N5.** `writePins` writes the slice file before the run file (`:1650`, then `:1688`). A crash between the two marks the
  slice done and loses its RED verdicts for rows that already had entries. Write the run file first.
- **N6.** With `--rows`, `--red-from`'s rows outside `--rows` are dropped. The log and `selection.redFrom.reselected`
  still count them as re-selected. NIGHTLY's own lane command uses `--rows` with `--red-from`.
- **N7.** A mapped (renamed) row never gets its own entry: it is in `redIds`, so I2 applies. The old id stays in
  `fold.red` and is re-mapped every night for good. It works, but it never settles.
- **N8. Options-pin batches and the dry run.**
  - The batches are cut by position in SKILLS order (`b.i % n`). A skill appended to a category mid-list shifts every
    later batch boundary, so a 28-night cycle can skip or repeat skills. Hash the skill key, as the matrix slices do.
  - `DRY=1 ws-matrix-nightly.sh` exits before the options-pin step, so its command and shard are never shown.
- **N9.** A row that turns N/A or PENDING(step) clears a red row silently. A row pinned as printable that turns N/A is not
  flagged.
- **N10 (carried).**
  - r2 N3: the mc-production backtest still feeds `mcJudge` directly.
  - r1 / r3 N7: CLAUDE.md "Checks to run" still does not name `ws-deploy-gates.sh` or `ws-backtest`.

## What I ran

| Command | Result |
|---|---|
| `ws-coverage-matrix --self-test` | OK, 139 assertions, 4.7 s |
| Mutation runs of the self-test (5 mutants, in scratch) | Each FAILs on its invariant |
| `ws-deploy-gates.sh --self-test` | OK, 25.6 s |
| r3 reproduce 1 and 2 (real print-lint, scratch dirs) | RED / REFUSED, as required |
| Sandbox scenarios A to D, the renamed row, and the fold order (stub print-lint, scratch) | As reported above |
| `--retire` + `nightly_check` on a gone id | WARNING, then cleared |
| `--all --affected <css commit> --max-docs 500 --out <scratch>` | OVER-BUDGET 32,766, with lists |
| `ws-options-pin --list`, `--check --skills` (×2, one against a modified pin) | As reported above |
| `DRY=1 ALLOW_NOT_TIP=1 ws-matrix-nightly.sh` | Slice 1/28, 883 rows |
| `ws-backtest --kind fixture`, `--row baseline-night-keeps-red`, `--row text-generator-wrm-page` | 7 / 1 / 1 PASS |
| `ws-deploy-gates.sh --list` | Shows D1 |
