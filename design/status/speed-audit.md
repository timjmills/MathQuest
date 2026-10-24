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

## Round 1c — the two pilot blockers fixed (owner request, 2026-10-23 ~14:40–16:30 UTC)

The owner asked the auditor to fix both blockers. Branch `claude/sweet-newton-c8wrv1-wip-speed-audit` now carries
`-wip-wave0-precritic` 5f632ba (which already merges `-wip-wave0-gates`) + the main line + the fix below, so it merges in one step.

- **Blocker A (screen-slots baseline format): fixed by the lead's lane before I started.** 0392cc7 merged the gates
  branch into the precritic branch and kept the S5 file. Both readers use `skills{"cat:skill": ["host:kind"]}`, and the S1
  file's only pin (`reading_ruler_hard card:doubled`) was fixed by S9 (d62a9dde). Nothing more was needed. `ws-precritic.cjs`
  was left alone at the lead's request (its round-2 fixer owns it).
- **Blocker B (options-verify red on the pilot skills): fixed at the cause** in `tests/scripts/ws-options-verify.cjs`
  (+15 lines). The page number line's seven controls (group `nline`) were tested as generation options, and the six that
  shape the line were tried with the line off. They are now render-time tries (items unchanged, printed sheet must differ),
  the six run with `{nlOn: true}`, and a value equal to what Auto chose for that page is a warning. `nlOn` still fails if no
  line is drawn. Results: the six SU-C skills pass **181 / 181** (was 108 failing). The same fix clears the 36 nl* pins on
  each of the 7 role-sample skills that carried them (196 values, all pass). Every nl* pin is now gone from
  `design/audit/baselines/options-verify.json`.

**`ws-precritic` on the six SU-C skills (b4114cdc + the fix): 12 of 13 gates PASS, wall 2,343 s (6.5 min a skill).**
`ws-options-verify` PASS (181 checked, 0 pinned). Node-lint, content-audit, print-lint at S/M/L, screen-slots,
screen-answer, chromebook-fit, code-snapshot and boot-smoke PASS; providers-unit N/A.

**One new red gate, not a pilot fault: `ws-coverage-matrix`** (W0-A's E1 tool, in fix round 1 after its critic FAIL).
- 201 rows, 93 run, 48 RED, 2,335 s (8.4 s a document; 673 s of it waiting for the other browser slot).
- It is red because these rows (Sections, Mixed, fact-rows layout, more-practice options) are being run **for the first
  time and have no per-row baseline**, so every finding counts as new (e.g. `L-OVERFLOW PG-12: 0 -> 8`, `L-SIZE TY-11: 0 -> 20`).
- The Sections rows show the **same counts on all six skills** (`sections/defaults` 10 / 10 / 17 at S / M / L), which points at
  the Sections composer (engine), not the subtraction family.
- So the pilot would start red on rows it cannot fix as a data copy. The plan already says the matrix's first run writes
  its per-row baseline (§1.6.7 E1). **Recommended:** W0-A pins the matrix baseline for the live skills (or at least these
  six) and gives the Sections / Mixed findings to the mixed-pages lane; then the pilot starts.
- Speed: the matrix alone is ≈ 6.5 min a skill here. It is the only gate over the ≈ 5–6 min target, and the S5 deploy
  budget has to allow for 8.4 s a document (intervention 2 of round 1).

**Also found:** `ws-options-verify` needs more than its default 60 s per skill for `add_facts`, `sub_facts` and `f_to_d` in a
cloud container (timeouts with the old and new script alike; 210 s for the three with `--deadline 600000`). ws-precritic
calls it with the default, so a lane touching those skills gets a false FAIL. For W0-A: pass a larger `--deadline` from
precritic.

---

# Reflections (process rule 00), 2026-10-23

One dated section per closed lane: measure → causes → fixes (each with an owner) → record. Times come from each lane's
`Times:` lines and critic reports; hours are wall time from the lane's first build to its PASS, on 2026-10-23. Targets
(§4.4): ≤ 2 critic rounds, 1 builder run per family or tool, and the time budget. Baseline (`metrics.md`): rounds to PASS
median 3 per run / 4 per lane (mean 4.4 / 4.8), ≈ 1.5 h a round on skill and screen lanes.

## 2026-10-23 · Summary table

| Lane | Kind | Wall time | Builder runs (profile) | Critic rounds | Min score at PASS | Against target |
|---|---|---|---|---|---|---|
| W0-B process tools (S3, S6, S7, S8, E5) | tools | **1 h** (10:04–11:03) | 8 parallel builders (medium for new tools, low for the tally readers and rules) + 2 fixers | **2** | 8 / 8 / 8 | **met** |
| `ws-precritic` (S1) | tool | ≈ 4 h (11:03 – about 15:00; 1 h 48 min of it queued for a browser slot) | 1 builder + 1 fixer (medium) | **2** | 8 / 8 / 8 | **met** on rounds; tool speed met (256 s a skill without the six-skill matrix) |
| W0-defects (4 real defects found by the new checks) | fixes | **3 h 35 min** (13:18–16:53) | 6 (A–C low, D–E medium after a failed round, F low) | **3** | ≥ 8 | over by 1 round |
| W0-A checks and gates (S2, S4, S5, S9, E1) | tools | **≈ 10 h** (10:08–19:56) | 9 first builds (medium) + 1 low fix + 6 fix rounds (medium) | **5** | 9 / 9 / 8 | **over by 3 rounds** |
| Mixed pages M1 (interleave, arrangement) | engine | **8 h** (10:27–18:28) | 1 first build + 5 fix rounds (medium; r6 low), 1 escalation to a fresh builder | **6** | ≥ 8 on 16/16 pages | **over by 4 rounds** |
| SU-C pilot (six skills + one preset) | skills as data | open (16:41 –) | 2 so far (low, then medium) | 1 so far, FAIL | — | **trigger fired** (> 1 builder run); section below when it ends |
| T1 teacher mock-up | screen | open | — | — | — | reflection when it closes |

**Reading:** the two lanes whose work was a list of independent tools with a clear spec (W0-B, precritic) met the 2-round
target on the first day of the new rules. The three lanes that lost rounds lost them the same way: **one defect that survived
several rounds before anyone turned it into a machine check or named its root cause** (W0-A baseline invariants, M1 repeats and
size ladder), or **gate gaps the critic found by hand** (W0-defects). No lane lost a round to a wrong builder strength except the
pilot.

## 2026-10-23 · W0-B process tools — PASS in 2 rounds, 1 h

- **Measure.** 10:04 start; eight builders in parallel 10:07–10:33 (S6 6 min, S7 1 min, S3 14 min, E5 20 min, tally readers
  ×7 16 min, metrics 6 min); critic r1 10:33–10:42 FAIL 7/7/8 (D1–D9); two fixers 10:43–10:54; critic r2 10:55–11:03 PASS
  8/8/8. Cost ≈ $55 (the highest of the morning) for the least wall time.
- **Causes.** r1's defects were in the tally's rule-id reading and the `--check-signed` gate (a gate that did not check the
  card body) — both caught by the critic, neither by a test the builder ran.
- **Fixes.** `--check-signed` now checks date, body sha, coverage and regeneration (done, f0eca7b9). Rule for tool lanes: each
  tool ships a `--self-test` with a seeded failure case (W0-B's tools all have one now). **Owner: done.**
- **Lesson worth copying:** split a tool lane into small independent builders run in parallel, each with its own self-test.

## 2026-10-23 · `ws-precritic` — PASS in 2 rounds, ≈ 4 h

- **Measure.** Built in W0-A 11:03–12:51 (108 min) while **queued 1 h 48 min for a browser slot** behind S5 and S2 part 2;
  moved to its own session (the auditor's intervention); critic r1 13:35–13:53 FAIL; fixer 53 min; critic r2 11 min PASS 8/8/8.
  Tool speed: 256 s for one skill with the matrix on two slots (target 5–6 min: met); 1,593 s for the six pilot skills with the
  matrix on one slot (4.4 min a skill).
- **Causes.** The wait, not the build: three browser-using builders shared two slots in one container, and the slot queue was
  unfair (one shard starved 90 min; fixed in bfdbd901).
- **Fixes.** (1) A lane runs at most two browser-using builders at once; a third browser job goes to its own session (its own
  container and two slots). **Owner: lead — add to LESSONS_LEARNED process rules, before the next tool wave.** (2) Fair slot
  queue (done, bfdbd901). (3) ws-precritic passes a longer `--deadline` to ws-options-verify (three skills need > 60 s in a cloud
  container). **Owner: W0-A, next change to ws-precritic.**

## 2026-10-23 · W0-defects — PASS in 3 rounds, 3 h 35 min

- **Measure.** Four real defects found by the new checks (sticky header over the question, dark-mode contrast, big-board zoom
  scrolling, a null page error). Builders A–C (low) 13:18–14:32; critic r1 14:33–15:06 passed defects 1, 2, 4 and failed 3
  (board, C3 7); builder D (medium, rebuild after failure) 15:07–15:28; critic r2 15:28–15:52 found the 1280×720 nested clip and a
  dark answered dot; builder E (medium) 15:54–16:22; critic r3 16:23–16:53 PASS; builder F (low, owner ruling) 4 min.
- **Causes.** Rounds 2 and 3 were spent on things the gates did not measure: the dark scan read only `.qt-question-card`, and
  `--bigboard` covered neither 1280×720 nor clipping inside nested scroll boxes. The critic's own probe script found them.
- **Fixes.** Both gaps closed in the gates (W0-A "sweep gaps", 17:09–18:08: board 1280×720 + nested clip, dark scan of the whole
  host). **Owner: done.** Rule: when a critic writes a probe script to find a defect, that script becomes the check (or is merged
  into the gate) in the same fix round. **Owner: lead — add to LESSONS_LEARNED.**

## 2026-10-23 · W0-A checks and gates — PASS in 5 rounds, ≈ 10 h

- **Measure.** Nine first builds on medium, 10:08–13:41 (envelope 19 min, golden renders 29, node-lint 31, coverage matrix 36,
  S2 part 2 145, **S5 deploy runner 185**). Critic r1 13:43–14:11 FAIL 6/8/6 (D1–D8); three fixers; r2 15:47–17:07 FAIL 7/8/8 (one
  blocking); r3 18:09–18:44 FAIL 7/8/8 (one blocking); r4 19:05–19:19 FAIL 7/8/8; **r5 ≈ 19:56 PASS 9/9/8**.
- **Causes.** (1) **One root cause failed three rounds**: the matrix baseline's invariants (r1 D4 → r2 D1 → r3 D1: nightly red rows
  could vanish). The §1.7 stop rule ("same defect survives two rounds at medium → stop, root-cause, machine check") was applied
  only at r3, one round late. (2) r4 failed on an integration miss: deploy session 1 ran the whole options pin (≈ 1 h 52 min)
  because a branch was merged without its read-only mode. (3) The S5 builder took 3 h, including 90 min starved of a browser slot.
  (4) Deploy speed is **not yet proven**: session 1 takes 26–28 min, session 2 had no clean timed run at the time of writing,
  and session 3 took 9 s because it rendered nothing (no nightly yet).
- **Fixes.** (a) The stop rule is counted per **defect id across rounds**, not per round: the lead checks each FAIL's blocking
  defect against the previous round's list and stops the loop on the second repeat. **Owner: lead — LESSONS_LEARNED, now.**
  (b) Baseline invariants now have a self-test (25,200 row-night checks) and a backtest. **Done.** (c) A merge into a gate lane
  runs `ws-deploy-gates.sh --self-test` before the critic. **Owner: W0-A.** (d) The ≤ 30 min deploy target stays open until three
  timed runs of all three sessions, with session 3 rendering a real affected-row set. **Owner: W0-A; the auditor re-times it.**

## 2026-10-23 · Mixed pages M1 — PASS in 6 rounds, 8 h

- **Measure.** First build of `interleave()` and the mixed arrangement (medium); critic r1 FAIL (S page = L page, legacy sub_facts
  misaligned, repeats in a share); r2 FAIL (I Can doubled letters); r3 FAIL (exact repeats on the 2-skill S page, M = S on the size
  ladder); **escalation**: loop stopped, root causes named, machine check `sheet/mixed-page.check.cjs`, fresh builder; r4 14 / 16
  pages; r5 the three changed pages pass; r6 (low) **PASS on all 16 pages**. Four owner rulings landed mid-lane (13:58–15:00).
- **Causes.** (1) Repeats and the size ladder were judgement-found in r1–r3 although both are measurable; the machine check came
  at round 4. (2) Owner design rulings arrived during fix rounds and were folded in, so rounds 4–5 also re-built behaviour.
- **Fixes.** (a) `mixed-page.check.cjs` (repeats, size ladder, fill) is in the lane; it should become a `ws-precritic --role
  mixed-practice` gate so any later lane gets it. **Owner: W0-A, with the mixed-pages lane, before M2.** (b) Owner ideas during a
  build go on the lane's design list and are built in one batch after PASS — **done: process rule 0**. (c) First builds of an
  engine should ship with their own page check from the start (repeats, size ladder, fill), not after round 3. **Owner: lead —
  brief template for M2–M5.**

## 2026-10-23 · SU-C pilot — interim verdict after critic r2: FAIL against §4.4 (r3 to come)

**Measure** (`design/status/pilot-su-c.md`, `design/audit/runs/pilot-su-c/critic-r1.md`, `critic-r2.md`):

| Step | Time (UTC) | Minutes | Profile | Result |
|---|---|--:|---|---|
| Card gate (`--check-signed`) | 16:43–16:44 | 1 | — | OK (card re-signed by the owner) |
| Builder run 1, six skills + `sub_2d_1d` preset | 16:46–18:28 | 102 | mq-opus-low | 320 k tokens, 139 tool uses; its own precritic pass 1 FAIL (matrix 62 RED) |
| Orchestrator fix pass | 18:28–18:37 | 9 | — | fact-probe column choice, worked steps ≤ 4 |
| Precritic pass 2 | 18:38–19:01 | 23 | — | 12 PASS, matrix 60 RED |
| Critic r1 (started before the pins were checked) | 19:06–19:41 | 35 | mq-opus-medium | **FAIL min 4 / 4 / 6 / 5**, D1–D12; also failed by the lead's ruling |
| Fix run 1 | 19:44–20:55 | 71 | mq-opus-medium | 406 k tokens, 198 tool uses; D1–D11 fixed |
| Precritic pass 3, re-pin 38 rows (lead ruling), pass 4 | 20:56–21:47 | 51 | — | pass 4 GREEN: 13 PASS, matrix 0 RED (rule 0b met) |
| Critic r2 | 21:48–22:20 | 32 | mq-opus-medium | **FAIL min 4 / 7 / 6 / 7**: N4 Across option (H2), N2 lesson Warm-up H13, N3 untrue option help, N1 dealer skew; N5–N8 minor |
| **Total so far** | 16:41–22:20 | **337 (5 h 37 m)** | | 2 rounds, both FAIL; ≈ 1.44 M agent tokens |

**Against target:** rounds 2 (both FAIL, a third coming) vs ≤ 2 to PASS → **missed**; builder runs 2 (+ an orchestrator pass) vs 1
→ **missed**; time 5 h 37 m vs 4 h → **missed**. Time per skill so far 0.8 h; projected 1.0–1.1 h if r3 passes. Fair baseline:
the five single-skill CCSS lanes of 2026-10-17, ≈ 0.6–2.4 h of critic span each (median ≈ 1.3 h), 3–4 rounds each. So the
per-skill gain is ≈ 1.2–2×, almost entirely from batching seven skills into one lane and one critic read; **rounds to PASS did
not improve** (3 if r3 passes = the old median per run). The ≥ 5× claim is not shown.

**Deviations recorded:**
- **The auditor's own error.** My pilot plan (§3, step 2) put the build on `mq-opus-low` as "copies on an existing drawing".
  §1.7 allows low only on a *certified* pair, and `stack` × Single skill has no certificate. Critic r1's minimum of 4 is the
  §1.1 pattern of low-effort first builds. Now rule 0a.
- **The critic started before the gates were clean** (r1 at 19:06, pins unconfirmed). The lead ruled r1 counts only if the
  sibling comparison confirms engine debt; it did not. Now rule 0b.
- **A miscount in the sibling comparison**: the first script read a log that prints at most 6 counts a row; the true pre-fix
  figure was **124** counts above the approved siblings, not the 236 first reported (also by me, 20:00). After fix r1: 84 above the
  paired sibling, 38 above any approved stack skill, re-pinned by the lead's ruling.
- **One wrong pin**: class (a) was pinned at size L where the siblings show 0 (r2 N5); the rate table measured S only.

**Causes, in order of cost:**
1. **The card was silent on what the critic graded.** r1: heads by default, lesson data, the legacy band option, the comma
   screen path. r2: the inherited Across appearance, the option help text, the lesson Warm-up form. A builder cannot decide what
   the card does not list.
2. **Precritic did not reach those surfaces.** About 8 of 12 r1 defects and 6 of 8 r2 defects were machine-measurable; the gates ran
   on Independent pages with default options, not on every offered option value, the lesson roles or the 390 card.
3. **Wrong builder strength on an uncertified pair** (rule 0a now).
4. **Fix r1 opened new surfaces** (lesson data, wide tracks, heads on screen) that nothing checked before r2.
5. **Engine debt the plan assumed was already pinned** (≈ 1 h of sibling comparisons and pins), which the next family should not pay.

**Fixes (owner, state):**

| # | Fix | Owner | State |
|---|---|---|---|
| F1 | Card section generated from the repo: every offered option value (inherited too), every role with its data source, every screen host — each needs a decision; `--check-signed` fails while any is undecided | new tool lane "W0-B2" (W0-B archived), mq-opus-medium | **assigned; must exist before the next family** |
| F2 | Nine checks from the pilot's lists, all generic except head overlap (stack / pv): zero-case rate as card-ruling predicates; digit skew and fixed position; L-ANSAREA ≥ 4.4 mm; L-OVERLAP ≥ 1 mm; lesson-data presence; option-help truth (named values are offered); options-verify render check (every offered appearance through print-lint at S/L); H13 on lesson roles; presets-unit item check. Plus wrongAnswer fits its slot, and an operator at a wrapped line end | W0-A, mq-opus-medium, three parallel builders (≈ 2.5 h wall); backtests from the pilot's commits (27577cf fail / ff471fd pass; the pilot tip for N1–N4) | **assigned; must exist before the next family** |
| F3 | Precritic `--rows-from <red list>` (re-run only red rows after a fix) and `ws-coverage-matrix --compare-with <skills>` (the sibling comparison as a mode, reading the run file, not the log) | W0-A | assigned |
| F4 | Precritic on a fix round runs `--role lesson` and every offered option value of the touched skills | W0-A (precritic) | assigned |
| F5 | Rate tables measure every size they pin | W0-A (matrix) | assigned |
| F6 | Rules 0a (low only on certified pairs) and 0b (clean, incl. sibling comparison, before the critic) | lead | **done** (LESSONS_LEARNED) |
| F7 | If the next family also misses: certify `stack` × Single skill before any further family on it | lead | conditional |

**Per-round findings audit (owner rule):** pilot r1 + r2 listed **18 automatic checks and 10 speed-ups**. Built so far: **3**
(rules 0a, 0b and the per-round findings rule). Real checks built with a backtest: **0**. Every other item has an owner (W0-A for
the checks, W0-B2 for the card, lead for rules). The count is re-taken at each reflection.

**Next test:** the next family runs with F1, F2, rules 0a/0b and F3 in place. Its bar is unchanged: ≤ 2 critic rounds, 1 builder run,
≤ 4 h for six or seven skills.

**Routing (lead, 22:23 UTC):** F1 "W0-B2 card hosts and roles" runs in the pilot session after critic r3 (mq-opus-medium; the owner
caps sessions), folding in W0-B's held 02c5308e. F2 (nine checks + two extras) goes to W0-A after its r7, as three parallel
medium builders with the pilot's backtests and one critic. **The next family does not start until F1 and F2 are merged and the
SU-C card is re-signed under the new gate.** Its bar: ≤ 2 rounds, ≤ 4 h for 6–7 skills; if missed, F7 (certify `stack` × Single
skill) is next.

### Acted-on count (per-round findings → real checks / speed-ups)

| Date | Listed (checks / speed-ups) | Built with backtest | Built (rule / tool, no backtest needed) | Assigned with owner | Dropped |
|---|--:|--:|--:|--:|--:|
| 2026-10-23 22:25 | 18 / 10 (pilot r1 + r2) | 0 | 3 (rules 0a, 0b, per-round findings rule) | 25 (W0-A: checks + F3–F5; pilot session: F1) | 0 |

## 2026-10-24 · Wind-down (owner: "stop after this work, don't try anything new")

### W0-A, second phase (the five pilot-lesson checks, after the r5 PASS) — stopped at critic r7 FAIL

- **Measure.** Pilot-lesson checks built after r5 (sibling comparison, SLOT/CLIP on every matrix row, 390 card, card rulings,
  not-offered options; started 20:01, medium). Critic r6 FAIL 6 / 8 / 7; fix r6 merged 23:05; **critic r7 FAIL 7 / 9 / 7**
  (r6 D1–D3 fixed; 8/8 pilot backtests pass). Stopped on the owner's instruction; no fix round 8 without the lead's go.
  Lane total: 7 critic rounds in about 13.5 h (5 to PASS the gates, then 2 failing rounds on the pilot-lesson checks).
- **Causes.** Two blocking defects, both in how a check decides what it is comparing: (D1) the sibling and slot-clip comparisons
  count findings on multi-skill rows (mixed, sections) without tying them to a skill, so a partner skill's cell can fail the
  lane or hide its defect; (D2) `ws-spec-card --rulings-only` refreshes the body hash, so a ruling on a signed card can be
  weakened unnoticed, and precritic never runs `--check-signed`.
- **Fixes (recorded for later; not started, per the owner):** tie every multi-skill finding to its skill before comparing; never
  refresh a signed card's hash outside `--resign`; make `--strict` part of rule 0b so INCOMPLETE / SKIPPED never end
  precritic OK. **Owner: W0-A, when work resumes.** The 11 generic checks from the pilot verdict and check 12 (CL-4b) stay
  queued, not started.
- **Lesson.** A check that compares counts must first say exactly which skill each count belongs to; that is the same root as the
  pilot's 236 → 124 miscount. Recorded as one class: COMPARE_SCOPE.

### SU-C pilot — FINAL: stopped by the stop rule before critic r3; FAIL against §4.4

- **Measure.** After the interim verdict: fix r2 (N1–N8) 22:24–23:40 on mq-opus-medium (76 min); base merged 00:18;
  precritic pass 5 red only on the side-anchor class (5 matrix rows), so rule 0b blocked critic r3; **stop at 00:56** under
  §1.7 / process rule 7: D12 (r1) → N5 (r2) survived two medium fix rounds. Totals: **16:41–00:56 = 8 h 15 min; 3 builder runs
  (1 low, 2 medium) + 1 orchestrator pass; 2 critic rounds, both FAIL; 5 precritic passes; not passed.** Against §4.4: rounds
  missed (no PASS), builder runs 3 vs 1, time 8 h 15 min vs 4 h.
- **Causes of the stop.** The surviving class is engine debt outside the lane's files: in side-anchor mode the anchor pair is
  laid out 50/50 (`sheet/anchors.js:260`, `print-sheet.js:2150-2153`), so a narrow stack sits in a half-page cell with ≥ 30 %
  empty, and the approved `sub_100_regroup` and `add_50_no_regroup` show the same 6 × 32 %. **The machine check existed** (the
  coverage matrix's ex-each and sections rows at L caught it from r1); the loop failed because nobody routed the fix to the
  owning lane (mixed pages) when it was first seen at 19:41. The lane spent two fix rounds working round a file it could not
  change. N2 (lesson Warm-up at L) has the same shape: it needs the lesson composer.
- **Fixes.**
  - **Rule (lead, when work resumes): a finding whose fix lies outside the lane's files is routed to the owning lane at
    the round it is first seen, with the proposed patch.** The lane pins it as engine debt with that lane's owner and date, and
    its critic does not count it against the lane. One round is lost, not three.
  - F7 now applies: **certify `stack` × Single skill**, which means fixing the side-anchor sizing (the pilot's proposed patch:
    size the pair's columns from content) and the lesson Warm-up cell size in the engine, before any further family on `stack`.
    **Owner: mixed-pages lane (anchors.js, print-sheet.js), when work resumes.**
  - F1 (card section generated from the repo) and F2 (the nine checks + two extras) stay the conditions for the next family.
    They are recorded, not started, per the owner's stop.
- **What the pilot did prove.** The new tools work: precritic caught every regression before r2 and blocked r3 correctly; the
  sibling comparison, once fixed, separated engine debt from lane defects; the stop rule fired as designed. The family's default
  Practice pages and every screen host reached ≥ 8 by r2. What is not shown is the speed: per skill ≈ 1.2 h (8 h 15 min ÷ 7) with
  no PASS, against ≈ 1.3 h a skill and 3–4 rounds before Wave 0.

**Acted-on count, final for 2026-10-23:** listed 18 checks + 10 speed-ups (pilot) + W0-A r6/r7 items. Built and in use: rules
0a, 0b, the per-round findings rule, and W0-A's five pilot-lesson checks (sibling comparison, SLOT/CLIP on matrix rows, 390 card,
card rulings, not-offered options), backtested 8/8 but not yet passed by their critic (r7 FAIL). Assigned and held by the owner's
stop: F1, F2 (11 checks), F3–F5, F7, the routing rule above, and W0-A r7's D1/D2. Dropped: 0.

### T1 teacher mock-up — stopped at critic r6 FAIL (A 7 · B 9 · C 7 · D 8)

- **Measure** (`design/status/teacher-t1.md`). 10:04 → 02:08: **about 16 h, 6 critic rounds, all FAIL**, 6 fix rounds on
  mq-opus-medium, fresh builders from r2 under the stop rule. Lowest scores per round: r1 7, r2 6, r3 7, r4 6, r5 6, r6 7. The
  owner pre-approved the build ("I have seen enough"), so a PASS would have gone straight to a build brief; it stops here instead.
- **Causes, by cost.**
  1. **Thumbnails cost four rounds (r2–r5).** They went from hand-drawn stand-ins, to pictures, to captured DOM, to live
     rendering. Each step fixed the last round's defect and introduced a new one: decoys, drawings that contradicted their names,
     garbled SVG fonts, then crops that hide the drawing on about 1 in 5. The root was copying the app's drawing into a mock-up
     format instead of rendering it with the app's own modules from the start.
  2. **Owner design changes arrived mid-round in r2–r4** (palette, grade badge, page colour, a 40–100-skill tray, popups, weights,
     views, "Each page") and reopened screens the critic had already graded. This led to the batch rule (process rule 0), applied
     from r4.
  3. **r1 lost a round to widths.** The builder checked 1366 and 390; the critic found breaks at 1024 and 820.
  4. **The stop rule was applied at the second repeat, not the first** (chip truncation, r1 → r2).
- **Fixes (recorded; held by the owner's stop).**
  - Mock-up briefs name all five §2.9 widths and require page and in-panel overflow checks from the first build. **Owner: lead,
    brief template.**
  - Mock-ups render real content with the app's own modules (read-only import), or use neutral placeholders. Never hand-drawn
    stand-ins of real content. **Owner: lead, LESSONS_LEARNED.**
  - When a critic finding is measurable, the fix commit includes its check: the stop rule acts at the first repeat. **Owner: lead.**
  - Keep the critics' probe scripts in the lane folder (`design/mockups/teacher-2/critic-tools/`), and builders run them before
    reporting. **Owner: the T1 lane, done for r6.**
  - The r6 defects stay open: about 1 in 5 crops hide the drawing; the held % shows as "Equal" and is released silently; Single
    skill + lock drops a skill; phone headers are tall. The T1 lane lists each with its check. **Owner: T1, when work resumes.**
- **Lesson.** The lane met none of the targets, and nothing about its speed can be judged yet. Every lost round has a named cause
  and a recorded check, and the lane wrote its own per-round findings as the owner rule asks.
