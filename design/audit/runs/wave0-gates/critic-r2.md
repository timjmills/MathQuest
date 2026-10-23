# Wave 0 part A (checks and deploy gates): independent critic, round 2

- **Critic:** independent, mq-opus-medium. I built none of this work.
- **Tree:** `5845e36b` on `claude/sweet-newton-c8wrv1-wip-wave0-gates`. HEAD moved to `bda2b0c9` during the round, but
  that commit changes only the status file.
- **Date:** 2026-10-23.
- **Scope:** S2, S4, S5, S9, and the E1 tools that can be built before M4 (`ws-envelope`, `ws-coverage-matrix`, the
  nightly definition, the print-lint flags).
- **Out of scope:** S1 `ws-precritic`, M4 record/replay and `ws-packer-proof`. For the last two, only the hooks were
  checked.
- **Method:** every claim below was checked by running it. Every browser process went through
  `/tmp/mq-browser-run.sh`.

## Verdict: FAIL

| Criterion | Score | Why |
|---|---|---|
| 1. Does what the plan says | **7** | All eight round-1 defects are fixed and proved by running them. But the deploy's nightly rule can still pass a deploy while a live skill's row is red, and it is skipped altogether when the affected rows fit the budget (new defect D1). §1.6.2 says without condition: "the deploy is refused when the latest nightly is older than 24 hours or any row of a live skill is red." |
| 2. The backtests are real | **8** | `ws-backtest` gives 12 / 12 PASS in 2131 s. I re-ran the WRM-page fail commit by hand (191 findings, the critic's own). I also re-proved S9 by reverting its one line in a scratch worktree: 6 doubled answer areas, FAIL. The fixture `node-lint-keys` is a real backtest: it runs the real tool on a real fixture and a real baseline. `mc-production` proves only the judgement. It feeds pre-built "sampler output" to `mcJudge`, so it would not notice if the in-page sampler stopped reading `q.options` or drew the wrong cell (N3). |
| 3. Usable by a builder | **8** | Unknown names and empty selections now fail and say why, in all four tools. The deploy verdicts are honest: OK, INCOMPLETE (exit 2) or FAIL. The over-budget path prints the exact tasks to fire. Two things make it harder to use: the MC-ALL section prints `FAIL <skill>` lines for findings that are pinned, while its verdict is OK (N4); and L3 is now blind to a common data shape (N2). |

PASS needs 8 or more on all three, so this round is a **FAIL**. Only one defect blocks, and the fix is small.

## Round-1 defects: each one re-checked

| Defect | Fixed? | Evidence (what I ran) |
|---|---|---|
| D1 deploy budget and nightly rule | **Yes, as specified in round 1** (the new D1 below is a gap that remains) | `ws-coverage-matrix --all --affected 60c4fa53..HEAD --max-docs 500` prints `OVER-BUDGET 32766 documents (budget 500)` and exits 3 in 6.5 s. A real `ws-deploy-gates.sh --session 3` finishes in 17 s: the matrix is over budget, then `nightly: REFUSED - no nightly run file`, so `ws-deploy-gates: FAIL`. `--self-test` passes, with 16 nightly and budget cases and the fallback to `--list` on an old tree. NIGHTLY.md "At deploy" matches the code. |
| D2 SKIPPED counted as a pass | Yes | In the self-test, SKIPPED, NOT YET, NEEDS-SHARDED-RUN and NOTHING RUN each give `INCOMPLETE`, exit 2. ACCEPTED is taken only by name: `--accept-notyet nosuch` is refused, and an acceptance is logged in the timings line. "No gate ran" gives INCOMPLETE. |
| D3 OK with nothing checked | Yes | Each of these fails and names its error: screen-slots `--category measurment`, screen-slots `--skills nosuch:skill`, screen-slots `--skills a,nosuch:skill`, screen-slots `--hosts bogus` ("0 host renders"), screen-slots `--shard 9/4`; chromebook-fit `--skills nosuch:skill`, `--category measurment`, `--shard 3/2`; matrix `--rows single/defualts`, `--kind bogus`, `--skills nosuch:skill`. Matrix `--kind quiz` gives `INCOMPLETE (all 3 rows pending)`, exit 2. A `--need-ans` value that was not dealt gives FAIL ("MISSING 9/9"). |
| D4 render errors pinned | Yes | `ws-coverage-matrix --self-test` passes 84 assertions. A row with `L-SPLIT RENDER` or a crashed batch is ERROR whatever the baseline says. `pinRows` never pins such a row and strips render keys from rows it does pin. |
| D5 count baseline in node-lint | Yes | The baseline is now keyed `rule\|kind\|#item\|signature`, with 6,835 keys. The swap fixture FAILs ("1 new key, 1 pinned key gone"); the pin fixture passes. The full run is OK in 35 s. |
| D6 global page-error pin | Yes | Chromebook-fit with `--dark` on `add_sub_fact_family` and the sample baseline passes, with the error pinned only as `dark-student:worksheet:1366x650`. The same skill without the pin FAILs. In light mode on `--hosts card,worksheet,quiz` it FAILs with 2 NEW findings, so the pin does not reach other hosts. The error is still a real app defect; that skill is not in the default fit list. |
| D7 H8 multiple-choice check for every family | Yes | `ws-content-audit` now samples all 715 live skills (60 items each) and pins 26 skills. I probed four pinned skills on the live practice card: `f_to_p` (5 of 6 renders), `estimate_frac_ops` (6 of 6) and `make_a_ten` (3 of 6) really show a row of number buttons, so these are real defects. The default family output is byte-identical to `acffe85b`'s (61 lines inserted, 0 removed or changed). |
| D8 critic sample size | Handled honestly; **needs a plan ruling** | See below. |

### D8: is the fixer's evidence sound?

**The plan's "tens of pages a pair" cannot hold for `stack` × Single skill. Yes, the evidence is sound.**
- A row is one skill with one value per option. So a skill that offers both `nlStep` (20 values) and `nlLabels` (7
  values) needs at least 20 × 7 = 140 rows to cover that one pair. No pairwise design can do better.
- The second bound is also valid. Eight skills offer values that no other skill offers, so each of them needs rows of
  its own. That gives a lower bound of 165 rows.
- The strict set is 369 rows (503 pages). I checked its coverage flags (`criticCoversAllPairs: true`) and looked at
  the rows.

**The tool handles it honestly:**
- `sample.critic` stays the strict set.
- It prints `OVER BUDGET`, three measured bounded alternatives and "ruling needed".
- The 20 % / 40-page random part now exists and is capped.
- The lane status lists this as a question for the plan.

**Recommendation for the ruling:** take `sample.criticBounded`, which is boundary values plus 6 representative skills
(85 pages). Two refinements would shrink the strict set honestly:
- model conditional options. The `nl*` options mean nothing when `nlOn` is false, yet they are paired with
  `nlOn: false`;
- never cross an option's min and max into an impossible pair. A random row has `nlFrom` 1,000,000 with `nlTo`
  −1,000,000, so a critic would grade a degenerate page (N5).

### Round-1 nits

| Nit | State |
|---|---|
| N1 unknown anchor mode | Fixed for `--source kit`: it now reports "unknown anchors mode". A legacy-source run silently ignores `--anchors bogus` and runs the full lint (N6). |
| N2 snippets cut mid-word | Fixed |
| N3 `--list` last line | Fixed: it now prints `LIST`, not a verdict |
| N5 deploy list | Fixed: viewport, text-vs-gen, the fixture backtests and the repeats lessons are on it |
| N6 silent `HEAD~1` base | Fixed |
| N8 deterministic S9 check | Fixed and proved, both ways |
| N9 golden rule set | Fixed: the current `ruleSetVersion` equals the manifest's `ba0d584c` |
| N10 cache key ignores the baseline | Fixed |
| N11 two counts of live skills | Fixed: both say 715 |
| N12 L3 precision | Done, but see N2 below |
| N4 CLAUDE.md "Checks to run" | Still open, with no recorded owner |
| N7 print-lint per-skill baseline | Still open: `design/audit/baselines/print-lint.json` is absent, so session 1 still judges print-lint by the 461 / 33 limit |

### Default behaviour: regressions checked

- `ws-content-audit`: the family output is unchanged (above).
- `ws-print-lint --self-test`: OK, 52 assertions and 40 planted defects.
- `ws-envelope --self-test`: OK, 335 checks.
- `ws-node-lint`: OK on its baseline.
- `ws-screen-slots` and `ws-chromebook-fit`: the selection code is refactored into `selectSkills` with a node
  self-test. The only change to default selection is that entries flagged `retired: true` are now dropped, which is
  intended (N11).
- `ws-deploy-gates.sh`: I restored `design/audit/baselines/deploy-gate-timings.jsonl` after my real session-3 run.

## Blocking defect

**D1. The nightly rule can pass a deploy while a live skill's row is red, and it does not run when the affected rows
fit the budget.**

**Where:**
- `tests/scripts/ws-deploy-gates.sh:164` and `:234` (`nightly_check`): only the newest run's own rows are read.
- `tests/scripts/ws-deploy-gates.sh:288` (`matrix_gate`): the nightly is consulted only on exit 3.
- `tests/scripts/ws-matrix-nightly.sh:73`: a later night runs `--affected LAST..HEAD` plus a seventh.

**Why this fails:**
- A night re-runs only the rows affected since the last night plus a rotating seventh.
- RED rows are never cached, but nothing selects them again.
- So a row that was red on night N and is not in night N+1's selection vanishes. The deploy reads only the newest
  stamp, finds no red, sees that the run "covers HEAD", and prints `nightly: OK`.
- The self-test row "a fired run (T0900) on HEAD supersedes that date's red run: OK" asserts exactly this. The fired
  files do not contain the red row `addition:add_20_regroup|single/ex-each` at all.
- A fired run on an unchanged tip has `--affected HEAD..HEAD` = 0 rows, so it runs only a seventh. That is precisely
  the "fire the run" step that `sharded_run_help` tells the lead to take after a refusal.

**Reproduce** (the scratch fixture is two run files on HEAD: 10-22 with that row RED, 10-23 green without it):

```
MQ_NOW=2026-10-23T12:00:00Z bash -c 'source tests/scripts/ws-deploy-gates.sh --source-only; nightly_check <dir> 0'
```

It prints `nightly: the sharded run of 2026-10-23 covers HEAD … nightly: OK` and exits 0.

**Second part:** when the affected rows fit the budget, the rows run inline and no nightly is read at all. The
simplest case is a deploy that changes only screen, test or planning files: the matrix reaches 0 rows and prints
`OK (nothing reached …)`. Such a deploy passes with no nightly ever run and with red live rows standing. This
contradicts §1.6.2. Reproduce:

```
node tests/scripts/ws-coverage-matrix.cjs --all --affected 36561f62~1..36561f62 --max-docs 500
```

It prints OK, exit 0, and `matrix_gate` returns 0 without calling `nightly_check`.

**Fix:**
1. Keep every row's last-known state across run files: a row stays red until a later run lists it OK.
2. In `ws-matrix-nightly.sh`, add the previous red / ERROR ids to the selection: `--rows` or a `--red-from` flag.
3. In `matrix_gate`, apply the age and red-row refusal on every deploy, not only over the budget. Within the budget,
   the inline run can then stand in for "covers HEAD".
4. Replace the "fired run supersedes red" fixture with one that fails when the red row was not re-run.

## Nits

- **N1.** The matrix baseline still counts per (row, size, lint rule). A new print-lint finding that replaces a fixed
  one of the same rule on the same row stays green. This is the D5 class at a finer grain. Key it as `ws-node-lint`
  now does, or record why counts are enough there.
- **N2.** L3 is now blind when the answer is stored under a common data key: `value`, `values`, `size`, `start`,
  `target`, `step`, `each` … (`ws-node-lint.mjs:330`, `:770`).
  - Probe: a cell that captions its own answer is found when the payload key is `shown` (6 findings), but skipped
    when it is `value` (6 × "answer equals a number the item's data gives").
  - "What number do the blocks show?" with `payload.value` is a real giveaway shape.
  - Narrow the skip to keys that are operands of the question, or require that the question text also prints the
    number.
- **N3.** The `mc-production` backtest exercises `mcJudge` on pre-built items, not the in-page sampler. Add a row that
  runs `--mc-all --skill` on one pinned live skill against a scratch baseline without that skill: it should FAIL,
  then PASS with the baseline.
- **N4.** MC-ALL prints `FAIL integers/ordering_rationals …` for the 26 pinned skills, while its verdict line says OK.
  Label pinned ones `PINNED` and reserve `FAIL` for new findings.
- **N5.** The envelope sample crosses option boundary values into impossible pairs (`nlFrom` 1,000,000 with `nlTo`
  −1,000,000) and pairs the `nl*` values with `nlOn: false`.
- **N6.** `ws-print-lint --anchors bogus` without `--source kit` runs the whole legacy lint and ignores the flag.
- **N7.** In a flake retry, an inline matrix FAIL re-runs up to 500 documents (≈ 15 min). Session 3 can then double
  past its budget. Either retry only the red rows or exclude the matrix from the blind retry.
- **N8.** In `ws-screen-slots`, a card render whose evaluation throws returns `false` and is skipped silently: it is
  not counted as an error. With `--seeds`, a generator throw for one seed is invisible unless `--need-ans` happens to
  depend on it. This predates the round, but the seeded mode makes it matter.
- **N9.** S5 is not yet done: the "three timed runs ≤ 30 min" are still to do, as the status says. Not graded as a
  fix defect.
- **N10.** The nightly OK message says "the sharded run … covers HEAD" for an unsharded affected-plus-seventh run.
  The wording overstates what ran.

## What I ran

| Command | Result |
|---|---|
| `MQ_BACKTEST_TMP=<scratch> node tests/scripts/ws-backtest.mjs` | 12 PASS, 2130.8 s |
| `ws-text-vs-gen --looks --root <848d7d3f worktree>` | FAIL (191) |
| `ws-deploy-gates.sh --self-test` / real `--session 3` / `--list` | OK / FAIL (no nightly; 17 s) / printed |
| `ws-coverage-matrix --self-test`, the D1 and D3 commands | OK (84) / exits 3, 1, 1, 1, 2 |
| `ws-screen-slots`: S9 seeds 1–40 on HEAD / on a scratch worktree with the S9 line reverted | OK / FAIL, 6 doubled |
| `ws-screen-slots` and `ws-chromebook-fit` negatives (9 commands) | all FAIL with a named reason |
| `ws-chromebook-fit` on `add_sub_fact_family` (3 variants) | pinned host passes; other hosts and no baseline fail |
| `ws-node-lint` (full, the key fixtures, an L3 probe) | OK 35 s; FAIL / OK; blind on `value` |
| `ws-content-audit` old (`acffe85b`) vs new default; `--mc-fixture` fail / pass; a live screen probe | only insertions; FAIL / OK; buttons confirmed |
| `ws-envelope --envelope stack--single`, `--self-test` | 543-page strict sample, ruling flagged / OK (335) |
| `ws-print-lint --self-test`; `--source kit --anchors bogus` | OK (52); unknown mode |
