# Lane S1 — card gate ("hosts and roles") and the 11 generic checks

Lane: S1 · branch `claude/sweet-newton-c8wrv1-wip-s1-checks` · lead session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-24 05:15 UTC
Base: origin/claude/sweet-newton-c8wrv1 (e371ec9) + merge of `-wip-wave0-gates` (the 5 pilot-lesson checks, critic r7 7/9/7) → 4fbc80c.

## Builders (mq-opus-medium: new checks and tools, Q-S1/Q-S7)

| Builder | Scope | Start | End |
|---|---|---|---|
| A node checks | 1 zero-case predicates, 2 dealer uniformity, 5 lesson-data presence, 6 option-help truth, 9 presets item check, 10 wrongAnswer fits slot | 05:21 | 06:10 (450 k tokens, merged 4cb3825) |
| B print-lint rules | 3 L-ANSAREA 4.4 mm, 4 L-OVERLAP, 11 operator line end, 8 H13 on lesson roles, D1 attribution | 05:21 | 08:47 (368 k tokens, merged 42f9140) |
| C card tool + options render | Task A (hosts and roles, --check-signed, 02c5308e, D2), 7 options-verify render | 05:21 | 06:14 (408 k tokens, merged 02eedf5) |

## Lead integration notes
- 06:20 ws-content-audit card rulings: an unscoped / --category / --family sweep (the deploy gate) enforces SIGNED cards only;
  a --skill run (precritic) enforces every card that rules on the skill. Without this, merging S1 turned the full content-audit
  gate red on main for the six SU-C skills, whose unsigned card describes the unmerged pilot. Verified: `--category subtraction`
  OK, `--skill sub_50_no_regroup` FAIL (3 card-ruling).
- 08:55 builder B merged (backtests.json unioned by row id: 36 rows); branch merged with origin/claude/sweet-newton-c8wrv1 75a6a25.
  Node self-tests and unit gates green on the merged tree (spec-card 76/76, index current, card-rulings, dealer-uniform,
  node-lint self-test + full, content-audit self-test, sibling-compare, envelope, layout 535, anchors 322, panes, supports,
  providers, wrm-page-unit, code-snapshot 722, standards, search-terms).
- Known, accepted: the coverage-matrix pins are NOT re-pinned for the new rules (L-ANSAREA TY-21, L-OVERLAP, L-WRAP, H13-ROW).
  A matrix row that hits a pre-existing true positive goes RED, and rule 0b's sibling comparison decides whether it blocks the
  lane (it does only where the lane's skill is worse than its approved siblings, which show 0 for every new rule). print-lint's
  per-size pins carry the pre-existing findings per skill (never the pilot skills).
- 09:50 ws-backtest on the merged tree: 34 PASS, 2 FAIL in 2746 s; the 2 (text-generator-wrm-tagging, repeats-lesson, both
  pre-existing rows) failed only because the cloud clone was shallow (commit not present). After unshallow + fetch of every
  branch: 2/2 PASS (221 s) → **36/36 PASS**. ws-backtest now names the shallow clone and the fix instead of a bare git error.
- 09:50 ws-precritic could not find Chromium (it looked for chrome-linux/, this container has chrome-linux64/): fixed to read
  both layouts like tests/lib/ws-harness.cjs.
- 10:05 **Cross-lane, routed to the lead:** precritic --strict on the APPROVED `subtraction:sub_100_regroup` on main 75a6a25
  fails rule 0b in 7 matrix rows (single/layout-fact-rows S PG-12 x180; single/ex-each S/M TY-11 28, S/M/L H13 6;
  sections/ex-group; mixed/defaults L H13 4; more-cols2+... H13). The SAME counts come out of main's own tools (a worktree of
  75a6a25, ws-coverage-matrix on the same rows): app state on main, not an S1 check.
- 10:05 ws-precritic: `ws-grade-render` (no --golden) prints `done, N units`, never OK/FAIL, so the --role / --template
  render rows were always "unparsed" FAIL: new PARSE.gradeRender (PASS when every unit rendered with no ERROR line).
- 10:05 Lesson role pages pinned (they were in no pin, so --role lesson could never be green): the 20 role-sample skills
  `#lesson` at L (382 findings) and S (368) appended to print-lint.json / print-lint.S.json, on main 75a6a25. Largest classes:
  TY-1 150, TY-7 70, TY-2 36, INK-7 32, H13 26 / 16, AK-4 26 / 22, PG-12 15, WRAP-OP 13.
- 10:05 D1 on REAL data (lead's pointer: the 7 sections/ex-each RED rows on the pilot ids come from the partner
  algebra:tape_diagram): every finding of a real Sections row carries skill "" (bySkill {"": ...}), so partner findings still
  block; the fixture row passed only because its fixture had skills filled in. Builder B fix round 1 (medium).
- 10:46 Builder B D1 fix round 1 merged (956bc20a; +63 k tokens, 10:14–10:45): root cause, the Sections / Mixed composers draw
  cells without `data-ws-skill` (sheet/cell.js writes it only when a composer passes `skill`; practice.js planItem does not),
  so every finding read page-level. print-lint now tags cells from buildSheet's own items / anchors.examples before linting.
  Real sub_50 sections/ex-each: tape_diagram PG-12 x8 a size (partner, non-blocking), 0 cell findings without a skill.
  New: ERROR when > half a multi-skill row's cell findings name no skill. Rows d1-real-partner, d1-real-unattributed PASS.
  **App-hook suggestion for the lead:** pass `skill` from practice.js planItem (and the mixed composer) into cell(), so the
  page carries the attribution itself and print-lint's matching becomes a cross-check.
- 10:47 Critic r1 started (mq-opus-medium), at 956bc20a.

## Critic rounds

| Round | Start | End | Result | Tokens |
|---|---|---|---|---|
| r1 (mq-opus-medium) | 10:47 | 11:03 | **FAIL 7 / 8 / 7**: D1 dealer-uniform fails every no-number skill; D2 checks 8 and 11 never reach the lane skill's own lesson page through precritic; D3 presets check passes the pilot's real D8 and its backtest is seeded; nits N1–N5 | 197 k |

Report: design/audit/runs/s1-checks/critic-r1.md.

### Fix round 1 (11:05 –)
- D2 (lead, 11:05–11:35): precritic --skill adds `print-lint-lesson-L` / `-S` on the lane skills' own lesson pages (lesson pins;
  an unpinned lesson page must be clean); `--role R --skill X` adds X to the role sample. New **ws-precritic-plan**: every
  backtest row's tool (and role) on the row's skills must be planned by `ws-precritic --skill <them>` (or `--role R` for a
  non-lesson role; a tool precritic never plans may pass on the deploy path). Mutation test: with the lesson gate disabled,
  wrap-op-pilot and h13-lesson-warmup-pilot FAIL; restored, 20 rows OK, 18 n/a. ws-backtest runs it after a full table.
- D1, D3, N2, N4: builder A (resumed, medium).
- N3: the app hook (pass `skill` from practice.js planItem into cell()) is with the lead (10:46 note).
- N1 (spec-card §7b data source read from comments): left for the card tool's next change; recorded here.
- D1, D3, N2, N4 (builder A, 11:04–11:16, merged): dealer-uniform N/A (exit 4) for skills that deal no numbers, unknown /
  all-error still FAIL; presets D8 instruction key + minuend spread, real pair 27577cf FAIL / ff471fd OK (heading part is the
  mixed lane's); unknown skill FAILS in options-verify and spec-card; no-card stays N/A with a note (README: only a build
  starts after signing; older families have no card).
- Lead: ws-presets-unit pins the 44 D8 findings already on the base (tests/fixtures/precritic/presets-d8.baseline.json), so a
  lane touching a preset fails only on a new one; backtests s1-presets-obey and -seeded PASS with the pin in place.
- Merged main 7bf5f587. All node + browser self-tests and unit gates green on the merged tree; ws-precritic-plan 20 OK.
- Critic r2 started.
- 11:25–12:05 Lead ruling (rule 0b compares SAME-SHAPE siblings): ws-sibling-compare measures each skill's shape (template +
  digit tracks over 24 seeded items), keeps only same-shape siblings, and falls back to the lead-named same-shape `peers`
  (siblings.json: sub_100_no_regroup, sub_50_no_regroup), measured fresh like siblings (their pins predate L-WRAP / H13-ROW /
  TY-21). Self-test 20 → 24 cases (add_100_regroup 3 tracks is never sub_100_regroup's 2-track sibling). Real check on the 7
  disputed sub_100_regroup rows: 20 counts at or below the peers, ABOVE only single/ex-each S/M TY-11 28 vs 24 — the one real
  difference the lead's bisect named. Commit 96f5fcc2, added to critic r2's scope.
| r2 (mq-opus-medium) | 11:25 | 11:46 | **PASS 9 / 9 / 8** (incl. the same-shape ruling 96f5fcc2); no blocking; nits N-r2-1…5 | 175 k |

Report: design/audit/runs/s1-checks/critic-r2.md. N-r2-2 (the D8 pin reader held non-D8 lines) was a defect in the lead's own
fix-round code: fixed after the PASS (only "(pilot D8)" pin lines are ever held). N-r2-1 (precritic-plan cannot see the presets /
spec-card gates, whose rows name no skill), N-r2-3 (no stale-pin report for the 44 D8 pins), N-r2-4 (dealer N/A also covers ×
skills such as arrays, count_by; no fractions backtest row), N-r2-5 (shape compares tracks, the template is matched by the
candidate list) stay open as recorded follow-ups.

## Totals
- Wall time 05:15 → 11:50 UTC, **≈ 6.6 h** (builders 05:21–08:47, the longest B at 3 h 26 m; fix round 11:04–11:35; critics 16 + 21 min).
- Agent tokens ≈ **1.71 M**: builder A 498 k (build + fix r1), B 431 k (build + D1 real-data fix), C 408 k, critic r1 197 k, r2 175 k.
- Critic rounds: **2** (target ≤ 2: met). Builder runs: 3 first builds + 2 resumed fixes (A, B), all medium.

## Checks delivered (all wired into ws-precritic; every one backtested FAIL → PASS on a real pilot commit pair or fixture)
| # | Check | Tool / flag | Backtest |
|---|---|---|---|
| A | Card hosts-and-roles section; --check-signed fails on an undecided line or a new option / role / host; rulings + decisions hashed under the signature (r7 D2); 02c5308e folded in | ws-spec-card §7a/§7b, precritic `spec-card-signed` | card-gate-decisions, card-gate-rulings (fixtures) |
| 1 | Zero-case rate / card numeric rulings as content-audit predicates (--skill enforces every card; unscoped sweeps signed cards only) | ws-content-audit `card-ruling` | s1-zero-case-content-audit 27577cf / ff471fd |
| 2 | Dealer uniformity (±2σ digits / values, page caps, no fixed position; N/A without numbers) | ws-dealer-uniform | s1-dealer-uniform 03eda45 / a930c43 |
| 3 | Answer box ≥ 4.4 mm (TY-21), shared probe | ws-print-lint L-ANSAREA, tests/lib/ws-geom-probe.cjs | ansarea-ty21-pilot 27577cf / ff471fd |
| 4 | Head labels ≥ 1 mm apart (H2) | ws-print-lint L-OVERLAP | overlap-d7-pilot, overlap-n8-pilot |
| 5 | Lesson data present | ws-node-lint LESSON-DATA | s1-lesson-data 27577cf / ff471fd |
| 6 | Option help names only offered values | ws-node-lint OPTION-HELP | s1-option-help 03eda45 / a930c43 |
| 7 | Every offered appearance value rendered at S / L through print-lint | ws-options-verify --render | options-render-pilot 03eda45 / a930c43 |
| 8 | H13 on lesson pages (role sample AND the lane skills' own lesson pages, L and S) | ws-print-lint H13 / H13-ROW, precritic print-lint-lesson-L/S | h13-lesson-warmup-pilot |
| 9 | Presets obey their values, differ from the host default, D8 instruction key + spread | ws-presets-unit | s1-presets-obey 27577cf / ff471fd, -seeded |
| 10 | wrongAnswer fits its slot | ws-node-lint WRONG-FITS | s1-wrong-fits 27577cf / ff471fd |
| 11 | No wrapped line ends in an operator | ws-print-lint L-WRAP | wrap-op-pilot 03eda45 / a930c43 |
| D1 | Findings attributed by cell; partner skills non-blocking; > half unattributed = ERROR | ws-sibling-compare, ws-slot-clip, print-lint attributeCells | d1-partner-attribution, d1-real-partner, d1-real-unattributed |
| 0b | Same-shape siblings (lead ruling) | ws-sibling-compare shapesOf / peers | self-test (real shapes) |
| — | Every backtested check is on precritic's path | ws-precritic-plan (run by ws-backtest) | mutation test |

## Speed reflection (process rule 00)
- **Measure.** 2 critic rounds (target met), ≈ 6.6 h, ≈ 1.71 M tokens. r1 lost one round (7 / 8 / 7) to three defects.
- **Causes of the lost round and the lost hours.**
  1. *A check off the lane's path* (r1 D2): the lesson checks were backtested by calling print-lint directly, so green
     backtests hid that precritic never ran them on the lane skill. → **ws-precritic-plan** (built; ws-backtest runs it).
  2. *A new check never run on a non-numeric skill* (r1 D1): builder A tested on stack siblings only. → rule: a new
     per-skill gate is run on one skill of each kit family (fact, stack, fraction, clock, legacy) before the critic; the
     builder brief names them. (Owner: lead, LESSONS_LEARNED, before the next tool wave.)
  3. *Fixture-only backtest where a real pair existed* (r1 D3, and D1 of r7 again): fixtures carried the data the real page
     lacks (skills filled in). → rule: a fixture row is allowed only when the status file says no real pair exists; the
     lead checks each fixture row against the real run before the critic (found D1's empty attribution in 1 run).
  4. *Hours:* builder B's three full-size print-lint sweeps (≈ 3.5 h) and browser-slot waits (one backtest 59 min). → a
     print-lint mode that prints each page once and lints it at S / M / L (B's proposal; owner: S1 next change); and run
     backtests' browser rows in their own session when > 10 browser rows queue.
  5. *Setup traps found by the lead, not a check:* precritic missed chrome-linux64; ws-backtest failed on a shallow clone;
     precritic could not parse ws-grade-render; lesson pages were in no pin; a new check (D8) turned the presets gate red on
     main (44 pre-existing). All fixed in the lane. → rule: "clean on the merged tree" includes one real precritic run of an
     approved sibling and of `--role lesson` before the critic (it caught 4 of the 5).
- **Speed-ups seen.** Three parallel builders with disjoint files merged with two trivial conflicts (backtests.json union by
  row id is now the standard merge); narrow-scope critic r2 took 21 min against r1's 16 min for the full lane.
