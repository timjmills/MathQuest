# Speed audit — is the new process faster? (2026-10-23, round 1)

Independent speed auditor, session_01T7zzpeR4bhG52jVYftrgTw, for the lead (session_01HVwpAE3g6EZH8idgErP6LP).
Owner's ask: "audit the speed to make sure we have indeed sped up on both our skill making and on our worksheet making and
anything else. Intervene if we have not." Targets and triggers: `design/IMPROVEMENT_PLAN.md` §1.4 "Expected effect",
§1.6.7 "Expected effect", §4.4.

Measured at 10:30–11:00 UTC on 2026-10-23. The four lanes started 10:04–10:28 UTC, so they are 10–60 minutes old.
Scripts and raw logs: `tests/audit-runs/speed/` (git-ignored folder; the timing script and its JSON are force-added).

## Verdict

| Area | Verdict | Numbers | Why |
|---|---|---|---|
| Skill making (rounds to PASS, skills per lane-week) | **Not yet measurable** | baseline: median 3 rounds to PASS (mean 4.4, range 1–15, 36 passed runs); ≈ 1.5 h a round on skill and screen lanes; target 2 rounds | no skill has gone through the new process; `ws-precritic` is not built yet (W0-A phase 2, queued) |
| Worksheet making (one sheet for a teacher) | **Already fast; not the bottleneck** | `buildSheet` with its key: 0.3–2.8 s a document (60 cases: 5 skills × 4 roles × S/M/L, 3 runs each) | nothing to speed up for teachers; the cost of *making a worksheet type* is the critic loop, which is the skill-making row |
| Worksheet checking (`ws-print-lint --source kit`) | **Same as before (no tool change yet)** | full `redone` sweep, 225 documents: **20.1 min, 5.4 s a document** (plan says 3–4 s); 458 findings in 33 documents once 17 rows that failed for a missing `pymupdf` are removed, which is exactly the pinned baseline | E1 `--affected` and the coverage matrix are not built yet |
| Deploy gates | **Not yet measurable** | baseline ≈ 80 min one after another (§1.1); `ws-screen-slots` alone 23.1 min here (22 in the log); target ≤ 30 min | `ws-deploy-gates.sh` and the `--category` / `--shard` flags are still being built (W0-A, running) |
| The lanes themselves | **On plan so far** | 4 lanes, 10–60 min old; every builder and critic call so far on `mq-opus-medium` (Q-S7 met); W0-B has built 5 of its 5 tools in ≈ 25 min and is in critic r1 | too early for rounds; see "Lanes" |
| New tools already built | **Fast, as the plan asks** | `ws-node-lint` 0.4 s for one skill, 46 s for every live skill (target: seconds — met); `ws-backtest` 3.9 s (5 PASS, 5 PENDING); `ws-envelope --self-test` 2.4 s, `--engine all` 1.4 s; `ws-spec-card` checks 0.06–0.6 s; `ws-status-index --self-test` 0.8 s; `ws-integrate --self-test` 10.2 s; stack spec card 39 KB (≈ 10 k tokens) vs ≈ 600 KB of standards | the brief-size target (≈ 185 k → ≈ 10 k tokens) is met by the one card that exists |

**Plainly:** nothing has yet gone through the new process, so there is no measured speed-up in skill making and no measured
slowdown. The plan's own trigger (§4.4) cannot fire until the first family made as data runs; the pilot below is how to get
that number early instead of waiting for E3.

## 1. Baseline (before Wave 0)

W0-B's `design/status/metrics.md` is not pushed yet; these are derived from git history (full history, 1,793 commits) and
W0-B's `design/status/defect-reports.csv` (219 report rounds, 69 runs). When `metrics.md` lands, the next round of this
audit reconciles the two.

### 1.1 Critic rounds to PASS

| Measure | Value | Note |
|---|---|---|
| Runs with a recorded PASS | 36 of 69 | 33 never passed in the record (paused lanes, one-off regrades) |
| Rounds to first PASS | **median 3, mean 4.4**, range 1–15 | the plan's §1.1 says "median ≈ 5"; over every run in the tally the median is 3. The mean (4.4) is closer to 5 because of the long WRM tagging runs (12, 12, 15) |
| Skill / print / screen lanes only (not WRM tagging) | median 3.5 (number line 7, small fixes 7, wave1-C2 8, search terms 6, answer-key options 5, div-facts 4, the 5 new CCSS skills 3–4) | |
| Findings open per round | falls slowly: e.g. number line 9 → 7 → 6 → 4 → 3 → 3 → 5 → 4; WRM Y2–Y3 11 → 19 → 22 → … → 9; small fixes 6 → 7 → 7 → 5 → 6 → 7 → 5 | rounds that do not shrink the list are the cost the precritic must remove |

**Consequence for the target:** "median 5 → 2" overstates the gain. Measured against the real median of 3, the target of 2
is a one-third cut in rounds, not 60 %. The ≥ 5× throughput claim cannot rest on fewer rounds; it rests on making skills as
data (E3) and certifying drawings once.

### 1.2 Hours per round

Time between consecutive critic reports of one run, from the commits that added them (gaps over 12 h dropped as pauses):

| Lane kind | Median hours a round | Examples |
|---|---|---|
| All runs (107 gaps) | 0.7 h (mean 1.8 h) | |
| WRM tagging (data, text) | 0.3–0.8 h | R-Y1 0.3, Y4 0.3, MAP 0.2 |
| Skill, print and screen lanes | **≈ 1.5 h** (0.3–10 h) | new CCSS skills 0.3–1.2; div-facts 1.5–2.0; small fixes 1.1–2.1; number line 3.9–8.3; answer-key options 4.7–10.3 |

This matches the plan's "1–2 h a round" for the work that matters.

### 1.3 Skills per lane-week

Live skills (not retired) on the main line, counted by importing `data.js` at each date:

| Date | Live skills | Change |
|---|---|---|
| 2026-09-19 | 573 | |
| 2026-09-26 | 601 | +28 (new skills, several lanes) |
| 2026-10-03 / 10-10 | 601 | 0 new ids (lanes redid existing skills: count-by, place value, number line support, answer keys …) |
| 2026-10-17 | 715 | +114 presets, made in two builder runs |
| 2026-10-23 | 715 | |

Proxy rate before Wave 0, 2026-09-24 → 2026-10-17 (12 working days with commits, ≈ 3 lanes at a time ≈ 7 lane-weeks):
**new non-preset skills ≈ 28 / 7 ≈ 4 a lane-week; presets ≈ 57 a builder run; runs reaching PASS ≈ 36 / 7 ≈ 5 a lane-week**
(a run is a lane's piece of work, usually 1–10 skills or one screen). This is a proxy; W0-B's metrics.md should replace it with
skills passed per lane-week counted from STATUS. The plan's pace target is "well above" this rate.

### 1.4 Time to make a worksheet (measured today, this container, Chromium headless)

`window.buildSheet(req)` with `key: true`, one skill, one section, default count, seeds 1000–1002, app already booted
(boot 5.9 s). Script: `tests/audit-runs/speed/time-buildsheet.cjs`; data: `buildsheet-times.json`.

| Role | S | M | L | (mean ms over 5 skills) |
|---|---|---|---|---|
| independent | 1,917 | 1,392 | 1,368 | |
| guided | 2,090 | 2,144 | 2,100 | |
| review | 2,082 | 2,179 | 2,050 | |
| test | 800 | 678 | 617 | |

Skills: addition:add_20_regroup, multiplication:multiply, fractions:equiv_frac_visual, placevalue:identify,
multiplication:count_by_tables. Slowest single case: count_by_tables guided L, 2.8 s; fastest: equiv_frac_visual test, 0.3 s.
Every document printed 1 or 2 pupil pages plus its key.

**A teacher waits 1–3 s for any sheet. Worksheet *making* for teachers is not slow.** The speed problem is entirely in
building and approving a new skill or page type.

### 1.5 Checking worksheets: `ws-print-lint --source kit`

`node tests/scripts/ws-print-lint.cjs --source kit` (default family `redone`, 225 skills, independent role, size L, key on),
run alone in one browser slot: **20 min 6 s wall, 5.4 s a document** (boot included). The plan's §1.6.1 figure of "≈ 3–4 s a
document" is about 40 % low for the full sweep in a cloud container. The verdict was FAIL, 475 findings in 50 documents; 17
documents failed with `ModuleNotFoundError: pymupdf` before it was installed mid-run (one finding each), so the real result
is **458 findings in 33 documents, exactly the pinned baseline** (§1.1). The tool is unchanged; the speed-up the plan expects
here comes from linting only the rows a change reaches (`--affected`, E1), not from a faster linter.

### 1.6 Deploy gates

Baseline from the last deploy log (§1.1): ≈ 80 min one after another; screen-slots 22, chromebook-fit 17.4, teacher-wrm
12 + 12. Re-measured here: `ws-screen-slots` full sweep (723 skills, 2,892 host renders), run alone
in the second slot while print-lint ran in the first: **23 min 9 s**, FAIL on the one known item (`reading_ruler_hard` doubled
answer area, S9 is queued to fix it). So the 80-minute baseline still holds; I did not re-run chromebook-fit or teacher-wrm
(≈ 41 min more) because the two figures above already agree with the log within 5 %. The ≤ 30 min target needs W0-A's
sharding (S5); nothing faster exists to time yet.

## 2. Running lanes

| Lane | Session | Age at audit | Builder profile (from the transcript) | Rounds | Tools built / timed | On plan? |
|---|---|---|---|---|---|---|
| W0-A checks and gates | session_016Gxj2ZzYbcQ9N3c7cKK3cq | ≈ 35 min | `mq-opus-medium` on every Agent call (first builds, Q-S7 ✓); S9 fix planned at `mq-opus-low` (a fix with a known defect: correct by §1.7) | 0 | `ws-envelope` merged (self-test 2.4 s, `--engine all` 1.4 s, re-timed here); `ws-node-lint`, `ws-deploy-gates.sh`, golden renders running; **`ws-precritic` queued (phase 2)** | yes; phase 1 is four parallel builders |
| W0-B process | session_012ezCBagXXDUEGLRrqYHnqz | ≈ 35 min | `mq-opus-medium` on every call | critic r1 running | S6 `ws-status-index` (0.8 s), S3 `ws-spec-card` (checks 0.06–0.6 s; stack card 39 KB, unsigned), S7 rules, S8 tally (7,878 findings / 219 rounds), E5 `ws-integrate` (self-test 10.2 s; dry run rebuilt 150 skills from manifests with no diff) | yes, ahead: all five items built in ≈ 25 min; `metrics.md` not yet pushed |
| T1 teacher mock-up | session_016hL18AgyxsUYPBST63Xeki | ≈ 35 min | `mq-opus-medium` on every call | 0 (critic next) | branch not pushed yet | yes |
| M1 mixed pages | session_01RuYxwfvfX8VUGCMUV6TTs2 | ≈ 10 min | `mq-opus-medium` on every call | 0 | branch not pushed yet | yes |

Note on cost: W0-B has spent the most (≈ $55 by the session's own counter at 10:37, vs ≈ $26 W0-A, $9 T1, $3.5 M1). The
defect-tally reading is a counting job that §1.7 puts at `mq-opus-low` ("explorers and small one-off checks"); running it at
medium cost money, not wall time. Not an intervention, a note for the next tally refresh.

## 3. Pilot plan (for the lead to start; I do not build it)

**When — the exact readiness condition** (all five true on the W0 branches; checked by the commands given):

1. **`ws-precritic` exists and runs on a pilot skill.** `tests/scripts/ws-precritic.cjs` is committed on
   `claude/sweet-newton-c8wrv1-wip-wave0-gates`, and `node tests/scripts/ws-precritic.cjs --skill subtraction:sub_100_no_regroup`
   prints its PASS / FAIL table and exits 0 on that tip. Its `--skill` row runs at least `ws-node-lint`,
   `ws-providers-unit --skill`, `ws-content-audit --skill`, `ws-print-lint --source kit --baseline` at S / M / L, `ws-screen-slots
   --baseline`, `ws-chromebook-fit --skills`, `ws-code-snapshot` and `ws-boot-smoke`, with the pinned baselines
   (`design/audit/baselines/print-lint.json`, `screen-slots.json`) committed. (`ws-coverage-matrix` rows are not required:
   E1 is not a pilot dependency.)
2. **Every S2 check is proved.** `node tests/scripts/ws-backtest.mjs` prints `OK` with **0 PENDING** — all 10 rows of
   `tests/fixtures/precritic/backtests.json`, including the five browser commit-pair rows (lone item, text ≠ generator × 2,
   Chromebook viewport, repeats). At 11:05 UTC today: 5 PASS (the node fixtures), 0 FAIL, 5 PENDING.
3. **A signed SU-C card.** `node tests/scripts/ws-spec-card.mjs --family subtraction` (scoped to the six skills) writes the
   card on `claude/sweet-newton-c8wrv1-wip-wave0-process`; `--check-coverage <card>` OK and `--check-signed <card>` OK
   (the owner has signed it).
4. **One base.** The pilot branches from a merge of both W0 branches into `claude/sweet-newton-c8wrv1`, so precritic and the
   card run against the same tree.
5. **No open S9 red** on the pilot's own skills: `ws-screen-slots --skills <the six>` is green (the standing red,
   `reading_ruler_hard`, is not in the family, so this should already hold).

Not required: S4 golden renders, S5 deploy runner, E1 coverage matrix, M4, or a critic PASS on the W0 tools (a false green in
precritic is what condition 2 guards against). The pilot measures the *process* (card → one builder run → precritic → one
critic), which is what the §4.4 trigger is about.

**Family: SU-C, column subtraction without regrouping, six skills on the `stack` template** —
`subtraction:sub_50_no_regroup`, `sub_100_no_regroup`, `sub_1k_no_regroup`, `sub_10k_no_regroup`, `sub_100k_no_regroup`,
`sub_1m_no_regroup` (`design/catalogue/subtraction.md` rows 145–160: all six "fix", same defect list).

Why this family:
- **Existing template with the only spec card that exists** (`design/cards/stack/stack.md`); `stack` × Single skill is the
  first pair the plan certifies, so the pilot's card is reused, not thrown away.
- **Pure data ladder:** the six skills differ only in range (one delta per step, P-1), with one shared defect list
  (wording "borrow"/colour, `minVal = maxVal/10` hides the ragged 2d − 1d and 3d − 2d cases, no place-value letters above
  3 digits, 6 digits tight at 2 columns). That is exactly "a family as data on an approved drawing".
- **Small and bounded:** 6 skills, one generator path (`generateSubPair`), no new answer type, no screen-host novelty.
- **No collision:** not touched by the four running lanes; Lane B answer boxes (held branch, addition/subtraction `ansBox`)
  overlaps the family's answer boxes — rebase the pilot on main and tell whoever revives Lane B.
- Avoid the regrouping skills for the pilot: `sub_100_regroup` has the known `100 − n` generator bug (worst problem 1),
  which would turn a process pilot into a bug hunt.

**Steps and what to time** (each start/end time written to `design/status/pilot-su-c.md` by the pilot lane):

| # | Step | Profile | Target | Measure |
|---|---|---|---|---|
| 1 | `ws-spec-card --family subtraction` scoped to SU-C, open questions answered, owner signs | — | owner time ≤ 15 min | wall time card → signed |
| 2 | One builder run for all six skills, from the card only (no 740 KB of standards) | `mq-opus-low` (copies on an existing drawing; the drawing is not new) | **1 run** | builder wall time, tokens; tokens read by the builder |
| 3 | `ws-precritic --skill` × 6 until green | — | ≈ 5–6 min a skill (§S1) | wall time per skill and total; red rows per pass |
| 4 | Critic: batch reading of the six + full grade of 1 in 5 pages (Q-S4) | `mq-opus-medium` | **≤ 2 rounds** | rounds, findings per round, findings a machine check should have caught |
| 5 | Fix rounds, if any | `mq-opus-medium` after a failed round (Q-S1) | 0–1 | as above |

**Compared with the baseline:** rounds (median 3, ≈ 1.5 h each) and builder runs for a comparable lane — the five new CCSS
skills of 2026-10-17 took 3–4 rounds each, 0.6–2.4 h of critic time each, one lane per skill.
**Pass:** ≤ 2 critic rounds, 1 builder run, total wall time ≤ 4 h for six skills (≈ 1.5 skill-hours against ≈ 2–5 today).
**Fail (§4.4 trigger):** > 2 rounds or > 1 builder run → the next audit names the cause from the round's findings (a missing
machine check, a card gap, or a weak builder) and the plan changes before the next family.

## 4. Interventions

None needed yet: every lane is on plan and on the right profile. Ranked by expected impact on speed, things to fix now so the
measurements are real when they come:

1. **Fix the baseline before using it (high).** §1.1's "median ≈ 5 rounds" is 3 over every run in W0-B's tally (mean 4.4).
   W0-B's `metrics.md` should state median *and* mean and use 3 as the round baseline; otherwise "5 → 2" will report a
   60 % gain where the real one is a third. Owner: W0-B (S8), a two-line change.
2. **Re-time S5 session 3 with the measured 5.4 s a document (high).** The plan sizes session 3 at "≤ 500 documents,
   ≈ 15 min", which assumes ≈ 1.8 s a document. At the 5.4 s measured here, 500 documents take ≈ 45 min in one slot and
   ≈ 23 min in two, plus ≈ 8 min of digests: the 30-minute deploy target is missed unless session 3 uses both slots and
   keeps the affected rows near 300, or `ws-print-lint` gets cheaper per document (one browser and one PDF pass per batch
   rather than per document). Owner: W0-A (S5 and the E1 coverage matrix) — measure a 500-row run before promising 30 min.
3. **Pull `ws-precritic` forward in W0-A (high).** It is queued in phase 2 behind four phase-1 builders; the pilot, every
   §4.4 measurement and the orchestrator's "refuse a report without the table" rule all wait on it. Start it as soon as
   `ws-node-lint` merges, before the golden renders (S4) finish.
4. **Install `pymupdf` in the environment's setup script (medium).** A fresh container runs `ws-print-lint --source kit`
   without it and every document's PDF check fails (seen here; STATUS §7 already notes it). Each lane rediscovers it.
5. **Start the SU-C pilot the moment `ws-precritic` lands (medium).** It gives the §4.4 number weeks before E3.
6. **Record times in the lane files (low).** Lane files have no start/end times for builder runs and critic rounds; add a
   `Times:` line per run (start, end, profile) so the next audit reads them instead of inferring them from commits.

## Round 1b — check-ins, 11:56 → 14:00 UTC

| Item | Then | Now |
|---|---|---|
| Rounds baseline (intervention 1) | plan said median ≈ 5 | done: `metrics.md` reports per lane median 4 / mean 4.8, per run 3 / 4.4 |
| `ws-precritic` (intervention 3) | queued in W0-A | done: brought forward, then queued 1 h 48 min for a browser slot (three builders sharing two slots); the lead moved it to its own branch `-wip-wave0-precritic` (5ebe5d24, 13:34) |
| Times in lane files (intervention 6) | none | done: W0-A and W0-B lane files carry a Times table |
| W0-B | building | critic r2 PASS (2 rounds; tool work, not a skill measurement) |
| W0-A build times (its Times table) | — | E1 envelope 19 min, S4 golden 29, S2 part 1 31, **S5 deploy runner 185**, **S2 part 2 145** (one S5 shard starved 90 min by the slot queue, fixed in bfdbd901), S9 fix 13 (low effort) |

**Measured on a scratch merge of main + `-wip-wave0-gates` 88d27e72 + `-wip-wave0-precritic` 5ebe5d24 (one container, two
browser slots):**

| Tool | Target | Measured |
|---|---|---|
| `ws-precritic --skill`, one skill (sub_100_no_regroup) | ≈ 5–6 min a skill | **208 s**, green on 12 of 13 gates (coverage matrix SKIPPED-NOT-BUILT) |
| `ws-precritic --skill`, the six SU-C skills | ≈ 30–36 min | **604 s (≈ 1.7 min a skill)**; chromebook-fit 376 s of it |
| `ws-backtest` (all S2 checks) | backtests green | **10 PASS, 0 PENDING**, 387 s |
| `ws-node-lint` | seconds | 0.4 s a skill, 46 s for every live skill |

**Pilot readiness (§3) at 14:00:** 1 partial · 2 yes · 3 yes (signed f0df0a00) · 4 **no** · 5 yes.
- **Blocker A (condition 4):** `-wip-wave0-gates` and `-wip-wave0-precritic` both add `design/audit/baselines/screen-slots.json`
  in two different formats (S5: `standing` / `dark-student:card:contrast`; S1: `<host>:doubled`). One format, read by both tools,
  then merge both into the main line.
- **Blocker B (condition 1):** `ws-options-verify` FAILS on 5 of the 6 pilot skills (72 NEW: the inert number-line options
  `nlOn` / `nlFrom` / `nlTo` / `nlStep` … "change nothing" in generation — pre-existing on main). It reads as NEW because
  `design/audit/baselines/options-verify.json` pins only 21 skills (the role sample + sub_100_no_regroup). **Any lane touching
  an unpinned skill starts red for a reason outside its scope**, which buys back the round the precritic is meant to save.
  Fix: pin options-verify for every live skill (per-skill batches; the full sweep hangs), as print-lint is pinned for 721
  documents — or fix the inert nl* options.

**Verdict change:** the tools already timed are fast enough. `ws-precritic` comes in at about a third of its time budget per
skill. Skill making is still **not yet measurable**; the pilot starts once A and B are fixed.
