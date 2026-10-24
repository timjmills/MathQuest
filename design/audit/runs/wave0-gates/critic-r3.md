# Wave 0 part A (checks and deploy gates): independent critic, round 3

- **Critic:** independent, mq-opus-medium. I built none of this work.
- **Tree:** `eee32b89` on `claude/sweet-newton-c8wrv1-wip-wave0-gates`. HEAD moved to `0be0e63f` during the round; that
  commit changes only the status file.
- **Date:** 2026-10-23.
- **Graded against:** the plan as amended by the two owner decisions of 2026-10-23 recorded in
  `design/status/wave0-gates.md`:
  - (a) the "Repeated check" nightly runs one 1/28 slice a night, builds the first full baseline over 28 nights, and
    then runs affected + red + a rotating slice;
  - (b) a row with no baseline is PENDING, not RED, and a stale nightly is only a WARNING until the full baseline exists.
- **Scope:** S2, S4, S5, S9 and the E1 tools before M4.
- **Out of scope:** ws-precritic, M4 record/replay, ws-packer-proof and the three timed deploy runs.
- **Method:** every browser process went through `/tmp/mq-browser-run.sh`; ws-coverage-matrix was run without it. I
  restored the tracked timings file after my real session-3 run. I removed my scratch worktrees.

## Verdict: FAIL

| Criterion | Score | Why |
|---|---|---|
| 1. Does what the plan (as amended) says | **7** | Critic r2's D1 is fixed. The fold, the `--red-from` re-selection, the check on every deploy and the owner's WARNING rules all work, and I proved each by running it. But the owner's 28-night baseline phase has a new hole (D1 below). Each night's `--write-baseline` re-pins rows that already have an entry, and rows re-selected as red. So a real regression on a pinned row is absorbed into the baseline and reported OK. Nothing records it. |
| 2. The backtests are real | **8** | All 7 fixture rows FAIL→PASS (4.5 s). `lone-item` and `text-generator-wrm-tagging` FAIL on the bad commit and PASS on the fix (295 s). I re-proved both sweep-gap claims on the pre-fix trees with HEAD's tools: the board at 1280×720 FAILs the same 7 skills on `0bb50b2~1`, and the dark scan catches the 2.18:1 current quiz dot on `07bc08d1~1`. Not covered: no backtest exercises the baseline-writing path where D1 lives, and N3 from round 2 is still open. |
| 3. Usable by a builder | **8** | The verdicts are honest: OK, WARNING, INCOMPLETE or FAIL. The refusal names the row and the run it went red in. A real session 3 takes 11 s and prints exactly why it gives WARNING. N4 (PINNED vs FAIL) is fixed. Minus: a red row whose id no longer exists blocks every deploy, and no command clears it (N1). |

PASS needs 8 or more on all three criteria. This round is a **FAIL** on criterion 1, from one blocking defect.

## Critic r2 D1: fixed (verified)

| Check | Result |
|---|---|
| r2's reproduce, verbatim: `MQ_NOW=2026-10-23T12:00:00Z … nightly_check tests/fixtures/…/reproduce 0` | `REFUSED - … addition:add_20_regroup\|single/ex-each RED since run 2026-10-22`, exit 1 |
| My own copy of the two run files, with **no** baseline (the real pre-baseline state), in modes full and fresh | REFUSED, exit 1 in both: a red row refuses before the full baseline too |
| `ws-deploy-gates.sh --self-test` | OK in 21 s. It has 21 nightly cases, including D1.4 (a fired run that did not re-run the red row is refused) and the r2 command |
| Real `--session 3` | INCOMPLETE in 11 s: the M4 digests are NOT YET, and the matrix gives WARNING. Over budget (32,766 documents), with no nightly and no full baseline, it gives WARNING, as the owner ruled |
| Real `matrix_gate` within the budget (`MQ_DEPLOY_BASE=HEAD~1`, a status-only commit: 0 rows) | The nightly rule is still read. The result is WARNING (exit 4): no nightly, before the full baseline. r2's second part is fixed |
| `ws-coverage-matrix --self-test` | OK, 106 assertions |
| `--all --slice 3/28 --list` twice | Byte-identical, 816 rows and 1,152 documents (21,599 / 28 = 771). Slice 1 is 883 rows and 1,272 documents (`DRY=1` nightly) |
| `--red-from` on the reproduce fixture / on a missing directory | Re-selects exactly the 1 red row / `FAIL - no such directory` |

### The owner decisions

- (a) is implemented as ruled:
  - the nightly picks the lowest slice that has no baseline file;
  - `baselineComplete` needs all 28 slice files, or `complete: true`;
  - the rows are hashed by id (SHA-256), so appending a skill moves no row;
  - after the baseline phase, a night runs affected (capped) + red + the rotating slice + `--pin-new`.
- (b) is implemented as ruled:
  - a row that printed and has no entry is PENDING(no-baseline). It counts as printed, so a deploy within the budget
    is not made INCOMPLETE;
  - an ERROR row is never forgiven;
  - before the full baseline, an old or missing nightly is a WARNING (exit 4, shown in the verdict); after it, a
    refusal.
- What the owner decisions do **not** cover: they cannot excuse a row that already had a baseline entry. That is D1.

## Round-2 nits claimed fixed

| Nit | State | Evidence |
|---|---|---|
| N1 matrix finding keys | Fixed in code (`risesOf` compares keys; self-test #14) | **But** all 127 pinned rows in `design/audit/matrix/baseline.json` have `keys` absent (0 / 127). So the only real baseline is still compared by counts until it is re-pinned (N2 below) |
| N2 L3 common data keys | Fixed | A single `payload.value` no longer counts as given; a list of values does. `ws-node-lint --self-test` OK; the full run OK in 38.6 s |
| N4 MC-ALL PINNED | Fixed | `--mc-all --skill f_to_p` prints `PINNED conversions/f_to_p … pinned [mc-production]`. The verdict is OK: 1 pinned, 0 new |
| N5 envelope validity | Fixed | `--envelope stack--single` has 0 rows with `nlFrom ≥ nlTo` in the critic, bounded and print samples. 29 critic rows have `nlOn:false`, but every nl* value on them is at its default. Critic sample: 297 pages |
| N6 `--anchors` on legacy | Fixed | `ws-print-lint --anchors bogus` gives `FAIL - unknown anchors mode` |
| N7 flake re-run scope | Fixed | Self-test: the re-run uses `--rows <the red ids>` only; a nightly-rule failure re-reads the rule only |
| N10 OK message | Fixed | The line names the stamp and what ran: affected range, slice, re-selected red, shard |

### Sweep gaps

| Gap | Result |
|---|---|
| Board at 1280×720 + nested clip | HEAD, `chromebook-fit --bigboard --skills add_20_regroup,reading_ruler_hard`: OK on 1280×720, 1366×768 and 1920×1080. Backtest with HEAD's tool (`MQ_ROOT`) on `0bb50b2~1` at 1280×720: FAIL on 7 skills (6 `#visualAid` nested clips of +27 to +201 px, 1 board scroll of +34 px). This matches the claim |
| Dark scan of the whole view | HEAD, `screen-slots --dark --skills` (2 skills): OK, 12 host renders. On `07bc08d1~1`: FAIL, `dot current 2.18:1 … 4.64:1 without dark`, student and teacher. This matches the claim |
| Animation wait, chrome-linux64 | Code read. The board's `waitForFunction` on finished animations runs before the measure. No board run of mine showed a control off screen |
| Self-tests | `ws-print-lint` OK (52 / 40), `ws-screen-slots` OK, `ws-chromebook-fit` OK, `ws-envelope` OK (343) |

## Blocking defect

**D1. The baseline phase re-pins rows that already have a baseline entry, and rows re-selected as red. A real
regression is written into the baseline and reported OK.**

**Where:**
- `tests/scripts/ws-coverage-matrix.cjs:1084`: `pinRows(cur, toRun)` pins every printed row of the run, including RED
  rows. That covers the slice's rows that already have an entry (in `baseline.json` or another part), and the rows
  `--red-from` re-selected from other slices.
- `:1094`: every row is then re-judged against the new pin, so the run file says OK and its `red` list is empty.
- `:472-478`: `loadBaseline` merges `baseline.json` first, then every `baseline.<part>.json` in **lexical** order, with
  the later file winning. So a slice file always overrides `baseline.json`, and `baseline.slice-4…` overrides
  `baseline.slice-3…`.
- `tests/scripts/ws-matrix-nightly.sh:112`: every baseline-phase night runs `--slice S --red-from DIR --write-baseline`.

**Reproduce 1: a pinned row regresses before its slice's night.** This is the case for the 127 pilot rows in
`baseline.json`, of which 1 to 9 fall in every slice; slice 1, tonight's, holds 3. Scratch dir: `baseline.json` pins
`subtraction:sub_50_no_regroup|single/layout-timed` at zero findings; the real row has 2 L-DENSITY PG-23 at L.

```
node tests/scripts/ws-coverage-matrix.cjs --skills subtraction:sub_50_no_regroup --kind single --slice 3/28 \
  --red-from <dir> --write-baseline --baseline <dir>/baseline.json --slots 1 --out <dir>/2026-10-23.json
```

This prints `red now: 0 RED`, the status is OK, and the run file has totals RED 0 and `red: []`. The rise is now the
baseline in `baseline.slice-3-of-28.json`, and nothing records that it happened. Without `--write-baseline`, the same
row is RED (`L L-DENSITY PG-23: 0 -> 2`).

**Reproduce 2: a red row is re-selected by a later baseline night.**

1. Set up a scratch dir with `baseline.slice-3-of-28.json` (the row at zero) and `2026-10-22.json` (the row RED).
2. Run the slice-4 night: `--skills subtraction:sub_50_no_regroup --slice 4/28 --red-from <dir> --write-baseline`. The
   row is re-selected and stays RED that night, but its findings are pinned into `baseline.slice-4-of-28.json`.
3. Run the next re-run of the red row, `--rows '<row>' --red-from <dir> --baseline <dir>/baseline.json`. It gives
   **OK**, because slice-4 sorts after slice-3 and wins the merge.
4. Then run `nightly_check <dir> 0 fresh`. It gives `nightly: no RED / ERROR row … nightly: OK`, exit 0.

The red row disappears, and nothing was fixed.

**Why this is blocking:**
- §1.6.2 says "a red row is any finding beyond that baseline".
- NIGHTLY.md says a red row "stops being red only when a later run lists it OK".
- Both fail during the 28 nights that start now, which are also the nights the pilot skills are being worked on.
- The owner's "no baseline → PENDING" ruling does not cover these rows: they had a baseline.

**Fix (small):**
1. With `--write-baseline`, pin only rows that have **no** entry in the merged baseline. That is `pinRows(…, { onlyNew:
   true })` against `loadBaseline(bf)`, not against the target file alone.
2. Never pin a row that was re-selected by `--red-from`.
3. Judge every row before pinning and keep that verdict in the run file. A row that is RED against an existing entry
   stays RED.
4. Make the merge refuse, or at least warn about, a row id pinned in two files, instead of resolving it by file-name
   order.
5. Add a fixture backtest: a pinned row with a rise, through a `--slice --write-baseline` night, must stay RED.

## Nits

- **N1.** A red row whose id is no longer a row can never be cleared.
  - The "more-" row names come from the factors a skill offers (`more-cols2+nline+short`). So adding or removing an
    option renames them.
  - Once such a row is RED, `--red-from` reports it as `1 outside the selected skills or no longer a row`, and no run
    can list it again. `nightly_check` refuses every deploy for good.
  - Reproduce: a run file with `addition:add_20_regroup|single/more-oldname` RED gives `--red-from … 0 re-selected` and
    `nightly: REFUSED`.
  - Fix: let the fold mark a live skill's red id that is not in the current row table as N/A (gone), reported. Or
    document how the lead retires it.
- **N2.** The pilot baseline (127 rows) carries no finding keys, so the N1 swap check is inactive for every row
  baselined today. Re-pin it with keys (with a STATUS note), or say so in the status.
- **N3** (round 2, still open). The `mc-production` backtest feeds pre-built items to `mcJudge`, not the in-page
  sampler.
- **N4.** Before the full baseline, the over-budget WARNING says the affected rows "are PENDING(no-baseline)". That is
  false for the 127 rows that are baselined: nothing checks them at deploy until the baseline is complete or the change
  fits in 500 documents. The owner's ruling allows not holding the deploy; the message should not claim coverage.
- **N5.** `foldRuns` reads only files that match `<date>[T<HHMM>][.shard].json`. A run file a lane writes under another
  name (as `pilot-baseline-2026-10-23.json` and `e1-check-2026-10-23.json` are today; both have 0 red) is ignored
  silently. Print the ignored files, or refuse unknown `*.json` that carry `tool: ws-coverage-matrix`.
- **N6.** ERROR rows refuse every deploy from the first slice night on, even before the full baseline. That follows
  round 1's D4 ("no baseline forgives an ERROR"), but under owner decision (b) the lead should expect it: the first
  slice night that meets a render crash in any live skill holds all deploys until it is fixed. Record it in NIGHTLY.md
  "Row statuses".
- **N7** (round 1, N4 in both reports). CLAUDE.md "Checks to run" still does not name `ws-deploy-gates.sh`, though S5
  lists it.

## What I ran

| Command | Result |
|---|---|
| `nightly_check` on r2's reproduce: verbatim, with no baseline, in mode fresh | REFUSED ×3 |
| `ws-deploy-gates.sh --self-test` | OK, 21 s |
| `ws-deploy-gates.sh --session 3` (real) | INCOMPLETE (NOT YET digests, WARNING matrix), 11 s |
| `matrix_gate` with `MQ_DEPLOY_BASE=HEAD~1` | WARNING, exit 4 (nightly read on a 0-row deploy) |
| `ws-coverage-matrix --self-test`; `--slice 3/28 --list` ×2; `DRY=1 ws-matrix-nightly.sh` | OK (106); identical 816 / 1,152; slice 1/28: 883 / 1,272 |
| D1 reproduce 1 and 2 (real print-lint runs, 1 row each) | OK on a regressed pinned row; a red row turned OK, deploy `nightly: OK` |
| Ghost red row (N1) | re-selected 0, REFUSED |
| `ws-node-lint --self-test`, full | OK, OK 38.6 s |
| `ws-content-audit --mc-all --skill f_to_p` | PINNED, OK |
| `ws-envelope --envelope stack--single`, `--self-test` | 297 critic pages, 0 impossible rows; OK (343) |
| `ws-print-lint --self-test`, `--anchors bogus` | OK (52 / 40); FAIL, unknown mode |
| `ws-screen-slots --self-test`, `ws-chromebook-fit --self-test` | OK, OK |
| `chromebook-fit --bigboard --skills` (2) on HEAD / `--bigboard --sizes 1280x720` on `0bb50b2~1` | OK / FAIL (7 skills) |
| `screen-slots --dark --skills` (2) on HEAD / (1) on `07bc08d1~1` | OK / FAIL (2.18:1 dot) |
| `ws-backtest --kind fixture` | 7 PASS, 4.5 s |
| `ws-backtest --row lone-item,text-generator-wrm-tagging` | 2 PASS, 295 s |
