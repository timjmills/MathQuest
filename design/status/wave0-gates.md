# Wave 0 part A — checks and deploy gates (lane status)

Lane lead: session_016Gxj2ZzYbcQ9N3c7cKK3cq · branch `claude/sweet-newton-c8wrv1-wip-wave0-gates` · started 2026-10-23
Scope: `design/IMPROVEMENT_PLAN.md` §1.4 S1, S2, S4, S5, S9 and the E1 tools buildable before M4 (§1.6.7).

## Environment (fresh container)
- `tests/scripts/mq-browser-run.sh` is the two-slot browser runner; `ws-precritic` copies it to `/tmp/mq-browser-run.sh`
  when that path is missing. Slots are `flock` locks `/tmp/mq-browser-slot.{1,2}.lock`.
- Chromium trusts the proxy CA (STATUS §8); the legacy print path needs `pip install pymupdf`.

## Progress
Builders run in their own git worktrees and the lead merges them here.

| Phase | Work | Builder | State |
|---|---|---|---|
| 1 | S2 part 1: `ws-node-lint.mjs`, seeded fixtures, `ws-backtest.mjs` + `backtests.json` | mq-opus-medium (first build) | merged 3add77b8 — 715 skills in node in 51 s, OK on its baseline (`design/audit/baselines/node-lint.json`: NOTATION 2919, L1 90, L3 87, L6 111, L10 10, REPEATS 211 pinned, many are real defects for their families); 5/5 fixture backtests FAIL→PASS in 3.9 s; commit-pair rows pending part 2. L1's grid check runs in node only for the 50 statically sized kit cells (665 need the browser: the coverage matrix covers them) |
| 1 | E1: `ws-envelope.mjs` (`--engine`, `--self-test`, `--diff`, `--envelope`) | mq-opus-medium | merged 94c97814 — Single skill 17 and stack 18 match the plan; Mixed practice walks 17, not 18 (`paginate.js` is reached only by the Single/Sections composer; the plan's list overstates it); self-test 320 checks 2.5 s; `--engine all` 1.1 s; voiding dry run: layout.js voids 126/126 pairs, a provider 0, `cells/clock.js` 3 (clock only) |
| 1 | S5: `ws-deploy-gates.sh`; `ws-screen-slots` / `ws-chromebook-fit` `--category`, `--skills`, `--shard`, `--baseline`, `--bigboard`, `--dark` | mq-opus-medium | running |
| 1 | S4: golden renders, manifest, diff, contact sheets; `ws-grade-render --template`, `--envelope` | mq-opus-medium | merged 42610832 — DOM content hash stable over 3 runs (pixel diffs were not: 23/30 untouched pages differed); a one-line cell edit flags exactly the 2 pages it changes; golden for `function-table` committed (manifest only, PNGs git-ignored); write 78 s, diff 62 s. Open: `--envelope` must read ws-envelope's `sample.print` / `sample.screen` rows (flat fields), not yet adapted |
| 2 | S1: `ws-precritic.cjs`, `role-sample.json`, `ws-providers-unit --skill`, `ws-teacher-wrm --grade --lesson`, print-lint per-skill baseline | mq-opus-medium | moved to the lead's own session (branch `claude/sweet-newton-c8wrv1-wip-wave0-precritic`, 12:50); this lane's builder stopped at 12:51 with local commits ce202fcd, b1c50244 (per-skill print-lint baseline: 721 documents, deploy scope 458 / 33, all live 6614 / 384) offered to the lead |
| 2 | E1: `ws-coverage-matrix.cjs`; `ws-print-lint` `--kind`, `--pages`, `--bring-back`, `--sections`, `--anchors top|first` docs | mq-opus-medium | queued |
| 2 | S2 part 2: browser checks with real commit backtests (text ≠ generator, lone item, repeats, Chromebook viewport — ordered by the W0-B defect tally) | mq-opus-medium | running |
| 2 | S9: `reading_ruler_hard` doubled answer area; print-lint per-skill baseline | mq-opus-low (fix) | queued |
| 3 | Independent critic of the tools | mq-opus-medium | — |

## Times (every builder run and critic round)

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| E1 `ws-envelope` build | mq-opus-medium | 10:08 | 10:27 | 19 |
| S4 golden renders build | mq-opus-medium | 10:08 | 10:37 | 29 |
| S2 part 1 `ws-node-lint` build | mq-opus-medium | 10:08 | 10:39 | 31 |
| S5 deploy gates build | mq-opus-medium | 10:08 | — | — |
| S2 part 2 browser checks build | mq-opus-medium | 10:38 | — | — |
| S1 `ws-precritic` build (brought forward by the lead, 11:02; stopped: moved to the lead's session) | mq-opus-medium | 11:03 | 12:51 | 108 |
