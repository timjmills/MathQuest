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
| 1 | S5: `ws-deploy-gates.sh`; `ws-screen-slots` / `ws-chromebook-fit` `--category`, `--skills`, `--shard`, `--baseline`, `--bigboard`, `--dark` | mq-opus-medium | merged ed879035 — `--self-test` OK (flake → BLOCKED, owner-go refusal on a no-go fixture). Session 1 in full: all OK, 26.4 min (with slot contention). Session 2: no clean single run yet (one shard starved 90 min by other builders; alone it passed in 7.1 min); its browser work without waits ≈ 3628 slot-s ≈ 30.2 min on two slots — just over target, fixes: `MQ_FIT_SHARDS=3`, trim fit `--dark`. print-lint on two slots: 0.43 docs/s (≈4.6 s/doc/slot) → 500 matrix rows ≈ 19.5 min. The three timed ≤ 30 min runs are still to do on a quiet container. New sweeps found real, unowned defects (pinned): dark-mode practice-card skill title 2.55:1 and online-worksheet problem number 1.59:1 on all 39 sample skills; the big board (1.6× zoom on `#questionPaper`) scrolls for 17/39 skills at 1366×768; page error `numberFamilyData` of null when the add_sub_fact_family card is followed by the worksheet or quiz |
| 1 | S4: golden renders, manifest, diff, contact sheets; `ws-grade-render --template`, `--envelope` | mq-opus-medium | merged 42610832 — DOM content hash stable over 3 runs (pixel diffs were not: 23/30 untouched pages differed); a one-line cell edit flags exactly the 2 pages it changes; golden for `function-table` committed (manifest only, PNGs git-ignored); write 78 s, diff 62 s. Open: `--envelope` must read ws-envelope's `sample.print` / `sample.screen` rows (flat fields), not yet adapted |
| 2 | S1: `ws-precritic.cjs`, `role-sample.json`, `ws-providers-unit --skill`, `ws-teacher-wrm --grade --lesson`, print-lint per-skill baseline | mq-opus-medium | moved to the lead's own session (branch `claude/sweet-newton-c8wrv1-wip-wave0-precritic`, 12:50); this lane's builder stopped at 12:51 with local commits ce202fcd, b1c50244 (per-skill print-lint baseline: 721 documents, deploy scope 458 / 33, all live 6614 / 384) offered to the lead |
| 2 | E1: `ws-coverage-matrix.cjs` (+ nightly job definition, per-row baseline, `--affected` by file until M4); `ws-print-lint` `--kind`, `--pages`, `--bring-back`, `--sections`, `--anchors top|first` docs; the `ws-grade-render --envelope` adapter | mq-opus-medium | merged 7a50e436, f2491aaa — self-test 64 assertions; rows a skill: Single 15–16 (plan 12–15: the More options as one row per factor), Sections 10, Mixed 5, Quiz 3 PENDING(T3); flags needing a later step fail before a browser starts (`--anchors top|first` needs M4: `normaliseAnchors()` turns them into off today; `--sections grouped|parts` needs M4; `--pages` on Mixed needs M2; `--bring-back` needs a `req.bringBack` field no step names; Faded problems needs a coverage value in `sheet/supports.js`, row 2b). 2 skills (stack + legacy) ran 68 rows: 34 run, 30 pending, 4 n/a, 102 docs in 327 s; per-row baseline pinned (`design/audit/matrix/baseline.json`); a seeded blue ink and a lowered baseline count each turn a row red; cache re-run 2 s. docs/s: 0.14 (1 slot) → 0.38 (2 slots, batch 6). Whole matrix 10,922 printable rows ≈ 29 h on two slots → the 8-shard nightly. `--affected`: search-terms.js 0 rows, status file 0 rows, print-generate.js 21,599/21,599. Before M4 every `sheet/*` file is also a generator input (generators import the kit barrel), so any kit change reaches every row. Nightly prompt in `design/audit/matrix/NIGHTLY.md` (no scheduled task made; push policy for the lead to confirm). Lead fix after merge: deploy session 3 ran the matrix as `--affected --shard i/n` inside a browser slot (wrong argument, and a slot deadlock with the matrix's own slots); it now runs `--all --affected <deploy base>..HEAD --baseline … --slots 2 --batch 9` as a node gate |
| 2 | S2 part 2: browser checks with real commit backtests (text ≠ generator, lone item, repeats, Chromebook viewport — ordered by the W0-B defect tally) | mq-opus-medium | merged 6eaa0ccd, 588266bf — all 10 backtest rows ready; the 5 commit-pair rows FAIL on the bad commit, PASS on the fix (`ws-backtest: OK`, 3220 s incl. slot waits; the node rows re-run by the lead 31 s). New: `ws-text-vs-gen.mjs` (`--wrm`, `--looks`; today 0 findings, 16.6 s), print-lint L-LONE (today 0 on 359 docs), `ws-detailed-lesson --repeats` (today 0 on 5 lessons), `ws-viewport-check.cjs` (today 8 findings pinned in `design/audit/baselines/viewport-check.json`: `add_word_problems` under the sticky header at 1366×768 / 1280×720, `long_div_2digit` at 1280×600 — same class as R7-D1, need an owner) |
| 2 | S9: `reading_ruler_hard` doubled answer area; print-lint per-skill baseline | mq-opus-low (fix) | merged d62a9dde — root cause in the dispatcher (`generate-question.js` ~l.1092): a bare-fraction text answer (readings under an inch: 1/4, 1/2, 3/4) became `fraction-input`, so the card showed the host field beside the ruler cell's own boxes; intermittent because the card deals unseeded. The `ruler` cell is now excluded like `frac-model` / `nl-place` (one line). Gates: screen-slots `--category measurement` clean 3 runs in a row, screen-answer OK, content-audit `--category measurement` OK (it does not sample reading_ruler_hard: `--skill` says no skill matched), print-lint kit S and L 0 findings, boot-smoke, code-snapshot, search-terms, node-lint OK. The screen-slots pin is removed. The per-skill print-lint baseline (b1c50244) is on the lead's precritic seed branch |
| 3 | Independent critic of the tools | mq-opus-medium | — |

## Times (every builder run and critic round)

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| E1 `ws-envelope` build | mq-opus-medium | 10:08 | 10:27 | 19 |
| S4 golden renders build | mq-opus-medium | 10:08 | 10:37 | 29 |
| S2 part 1 `ws-node-lint` build | mq-opus-medium | 10:08 | 10:39 | 31 |
| S5 deploy gates build | mq-opus-medium | 10:08 | 13:13 | 185 |
| S2 part 2 browser checks build | mq-opus-medium | 10:38 | 13:03 | 145 |
| E1 `ws-coverage-matrix` build | mq-opus-medium | 13:05 | 13:41 | 36 |
| S9 `reading_ruler_hard` fix | mq-opus-low | 13:16 | 13:29 | 13 |
| Options-verify pin for every live skill (`ws-options-pin.cjs`, lead request 13:57) | mq-opus-medium | 13:59 | — | — |
| Critic r1 (tools vs plan): FAIL 6 / 8 / 6, D1–D8 | mq-opus-medium | 13:43 | 14:11 | 28 |
| Fix r1 A: deploy runner + screen gates (D1 runner, D2, D3 screen, D6, N5, N6, N8, N11) — merged e11450ab | mq-opus-medium (rebuild after a failed round) | 14:13 | 15:17 | — |
| Fix r1 B: matrix + envelope critic sample (D1 matrix, D3 matrix, D4, D8, N1, N3, N10, N11) — merged 24aa7410 | mq-opus-medium (rebuild after a failed round) | 14:13 | 15:05 | 52 |
| Fix r1 C: node-lint per-finding baseline, H8 multiple choice for every family (D5, D7, N2, N9, N12) | mq-opus-medium (rebuild after a failed round) | 15:04 | 15:47 | — |
| Critic r2 (fresh critic): FAIL 7 / 8 / 8, one blocking defect | mq-opus-medium | 15:47 | 17:07 | — |
| Fix r2: nightly red-row rule (critic r2 D1) + nits + owner decisions (Repeated check in 28 slices; no-baseline rows PENDING) — merged dea73ab7 | mq-opus-medium (rebuild after a failed round) | 17:05 | 17:37 | — |
| Sweep gaps from the W0-defects lane (board 1280×720 + nested clip, dark scan whole host, board animation, chrome-linux64) | mq-opus-low (change to built tools) | 17:09 | 18:08 | — |
| Pilot six-skill matrix baseline (lead run) | — | 16:17 | 17:12 | 55 |
| Critic r3 (fresh critic): FAIL 7 / 8 / 8, one blocking defect | mq-opus-medium | 18:09 | 18:44 | — |
| Fix r3: baseline invariants (root cause of r1 D4, r2 D1, r3 D1) — merged 8d0a7a5a | mq-opus-medium (rebuild after a failed round) | 18:41 | — | — |
| Timed deploy runs: three cloud sessions (gate sessions 1, 2, 3 in parallel; each repeats its session 3×) on eee32b89 | timing runners (session_01HZreUmm66xVrS2AYyY32uD, session_016eCsVCbtn3q8SkotuDG1Xp, session_01FLRx8vV9wbkgLuukh57VyK) | 18:09 | — | — |
| Critic r4: FAIL 7 / 8 / 8 (D1 deploy session 1 ran the whole options pin; D2 fold order by name) | mq-opus-medium | 19:05 | 19:19 | — |
| Fix r4: read-only options gate at deploy, fold every run file by finish time + nits — merged b261abf0 | mq-opus-medium (rebuild after a failed round) | 19:19 | — | — |
| Critic r5: **PASS 9 / 9 / 8**, no blocking defects | mq-opus-medium | 20:00 | 19:56 | — |
| Precritic additions from the pilot's critic r1 (sibling compare, SLOT/CLIP on every matrix row, 390 px card, card rulings, not-offered options), lead request 20:00 | mq-opus-medium (first build) | 20:01 | 21:07 | — |
| S1 `ws-precritic` build (brought forward by the lead, 11:02; stopped: moved to the lead's session) | mq-opus-medium | 11:03 | 12:51 | 108 |

## Critic r1 (2026-10-23, `design/audit/runs/wave0-gates/critic-r1.md`): FAIL — plan 6, backtests 8, usable 6
All 10 backtests verified real by hand. Blocking: D1 deploy session 3 has no 500-document budget / nightly-age refusal;
D2 SKIPPED counts as pass; D3 four gates print OK on 0 checked; D4 matrix baseline pins render errors; D5 node-lint
count baseline hides new findings; D6 global page-error pin; D7 H8 multiple-choice check for every family not built;
D8 envelope sample is not a critic sample. Fix round 1 at Opus medium (failed-round rule): A = D1 runner, D2, D3 screen,
D6; B = D1 matrix, D3 matrix, D4, D8; C = D5, D7 (+ N2, N9, N12) starts when a browser slot frees (two-slot rule).

Fix r1 B results: `--max-docs N` → OVER-BUDGET exit 3 (60c4fa53..HEAD = 32,766 docs refused in 6 s); unknown rows / kinds / skills
and 0-row selections FAIL, all-pending runs are INCOMPLETE (exit 2); `--write-baseline` never pins a row that cannot print;
the cache key includes the row's baseline entry; 715 live skills is right (8 retired entries kept for share codes).
**Plan question (D8):** no set covering every pair of option values reaches "tens of pages": `stack` × Single skill's strict
all-pairs set is 369 rows / 503 pages (lower bound 165 rows: nlLabels × nlStep alone is 140 pairs). Measured bounds: boundary
values on every skill 207 pages; with values paired only with size 126; on 6 representative skills 85 (`sample.criticBounded`).
Proposed for the plan: boundary values + representative skills + values paired with size only; the rest to the machine sample
and the matrix. Until ruled, `sample.critic` stays the strict set.

Fix r1 A results: deploy verdict is OK / INCOMPLETE (exit 2: a gate SKIPPED, NOT YET, NEEDS-SHARDED-RUN or NOTHING RUN) /
FAIL; the M4 digests hook is accepted only by name per run (`--accept-notyet digests`, logged). Session 3: matrix with
`--max-docs 500`; over budget it reads the newest nightly (FAIL if none, > 24 h old, or a RED/ERROR row of a live skill;
OK if complete on HEAD-equivalent; else NEEDS-SHARDED-RUN with the 8 shard tasks to fire) — real run today: FAIL, no
nightly yet (17 s). Unknown / empty selections FAIL in screen-slots and chromebook-fit; page errors pinned per skill,
size and host; deterministic S9 regression (`--seeds 1-40 --need-ans 1/4,1/2,3/4`: 0 doubled now, 6 on the pre-fix tree);
no silent HEAD~1 base. New deploy-list gates: ws-text-vs-gen, ws-backtest --kind fixture, ws-detailed-lesson --repeats
(5 lessons), ws-viewport-check.

Fix r1 C results: node-lint baseline is per finding key (`rule|kind|#item|signature`, 6,835 keys; a swapped finding now
FAILs — backtest row `node-lint-keys`); L3 false positives 95 % → the whole population is 5 findings, 2 real + 3 borderline.
H8 (D7): `ws-content-audit` MC-ALL samples all 715 skills (60 items) — **26 skills offer production items as buttons**, pinned
in `design/audit/baselines/content-audit-mc.json`, need owners: fractions simplify / improper_mixed / mixed_fractions /
estimate_frac_ops (60/60); conversions d_to_f, f_to_p, p_to_f, mixed_conversions (+ 3 pools); partition_shapes (+ 2 pools);
angles measure_angles (60/60, + 2 pools); measurement estimate_length (+ pool); integers ordering_rationals (60/60, + 2 pools);
number_sense make_a_ten (+ 2 pools). Backtest row `mc-production` (fixture). Default content-audit output unchanged for the
≈310 family skills apart from the inserted MC-ALL block. Golden rule-set hash ignores dated status notes (N9).

## Critic r2 (`design/audit/runs/wave0-gates/critic-r2.md`): FAIL — plan 7, backtests 8, usable 8
All eight r1 defects verified fixed; `ws-backtest` 12/12 PASS (2131 s). One blocking defect: **D1** the nightly rule reads only
the newest run (a red row that the next night does not re-select vanishes; a fired run on an unchanged tip runs only a
seventh) and is skipped when the deploy is within budget (a deploy reaching no row passes with no nightly). Critic recommends
ruling D8 for the bounded critic sample (85 pages). Nits N1–N10 (matrix baseline per-count at row grain, L3 blind on common
data keys, mc-production backtest skips the in-page sampler, N9 the timed runs still to do).

## Pilot support (lead requests 2026-10-23)
- Merged `claude/sweet-newton-c8wrv1` (gates, ws-precritic, the nl* options-verify fix) into the lane.
- **First per-row matrix baseline for the six pilot skills** (`subtraction:sub_50/100/1k/10k/100k/1m_no_regroup`): 201 rows,
  93 run and pinned, 0 RED, 0 ERROR, 84 PENDING (M2/M4/T3 fields), 24 N/A; 279 documents in 2993 s (most of it slot waits
  behind critic r2). `design/audit/matrix/baseline.json` now 127 rows; run file `design/audit/matrix/pilot-baseline-2026-10-23.json`.
- `ws-precritic` passes `ws-options-verify --deadline 600000` (`MQ_OV_DEADLINE`).
- **For the mixed-pages lane (engine findings, not fixed in Wave 0):** every pilot skill's `sections/defaults` row has the same
  10 / 10 / 17 findings at S / M / L — L-OVERFLOW PG-12 ×8 at every size, L-DENSITY PG-23 ×2 at S and M, L-INK ILLEGIBLE ×8 and
  L-DENSITY PAGEFILL ×1 at L. They come from the Sections composer with the fixed partner `algebra:tape_diagram` (its legacy
  story cell overhangs its 46 mm cell by ≈ 19.9 mm), so they are composer / partner findings, identical across the six skills.

Fix r2 results: every run file is folded (a row's state = its last run; RED/ERROR persists until a later run lists it OK);
`--red-from` re-selects red rows (nightly and deploy); session 3 checks the nightly on every run. Owner decisions: the
"Repeated check" runs `--slice i/28` (stable SHA-256 of the row id; 816–883 rows ≈ 1,134–1,272 docs ≈ 1 h a night), first
baseline over 28 nights into `baseline.slice-i-of-28.json`, then affected + red + a rotating slice; a row with no baseline is
PENDING(no-baseline), never RED; before the full baseline a stale or missing nightly is a WARNING (deploy still OK, shown).
Envelope samples drop impossible option rows (strict critic set 543 → 297 pages; bounded 57 rows). L3 no longer blind on
common data keys; MC-ALL prints PINNED for pinned skills; matrix pins carry finding keys.

Sweep gaps (merged 85ff9293): `--bigboard` covers 1280×720 / 1366×768 / 1920×1080 and fails on nested clipping > 12 px inside
`#questionPaper` (today 117/117 OK; on `0bb50b2~1` 1280×720 FAILs 7 skills); the dark scan covers the whole host view incl.
quiz-dot states, WCAG AA, blended translucent fills, transitions off for the light re-check (today OK 234 renders; on
`07bc08d1~1` catches the 2.18:1 current dot). Limitation, left as designed: the dark scan reports only what dark mode made
worse, so the 3.10:1 answered dot on `0bb50b2~1` (low in light mode too then) is not flagged — a light-mode contrast scan
would be a separate gate. The board waits for animations before measuring (6/6 repeats clean); `chromePath()` finds
`chrome-linux64/` or `chrome-linux/`.

Options pin merged (ws-options-pin.cjs, 714 skills pinned: 115 skills / 335 failing pairs; 5,165 inert nl* pins gone with the
speed audit's options-verify fix). Real option defects it lists, need owners: (1) behaviour options change dealt items
(calculator / skipAfter on number_seq_fill, mixed_counting, compare_groups, number_bonds, fraction_of_set, …; nl* controls
change items on number_seq_fill / mixed_counting); (2) values outside the teacher's choice (compare_to_half denoms=[3] deals
8, 2, 5, 10; place_value_10x band=1000 reaches 10000; coordinates_plot_q1 band=5 reaches 8; cube_numbers step=[1];
number_word_form zeroPlace=always); (3) practice ignores skipAfter on 11 mixed pools, calculator on algebraic_all, onePage
on count_by_*; Skip at the wrong count on number_families_* and factor_links_*; (4) notation "across" ignored on
mult_2by1_column, mult_3by1_column, mult_2by2_standard and the long-division skills; (5) nlOn=true draws no line on 21
skills. The Repeated check runs the options pin as one 1/28 batch slice a night (≈ 7 min), the whole pin ≈ 1 h 52 min.

## Critic r3 (`design/audit/runs/wave0-gates/critic-r3.md`): FAIL — plan 7, backtests 8, usable 8
r2 D1 fixed and both owner decisions implemented as ruled; sweep-gap fixes and backtests re-verified against the pre-fix
trees. Blocking D1: a first-baseline night `--write-baseline` re-pins rows that already had a baseline (and rows
re-selected as red), so a real regression reads OK. Same area as r1 D4 and r2 D1 (three rounds, three different defects in
the baseline state), so fix r3 is briefed on the root cause: five written invariants (pin new rows only; never pin a
re-selected red row; verdict before any pin; refuse conflicting duplicate pins; only an OK re-run or an explicit, logged
re-pin clears a red row), each property-tested, plus a backtest.

Fix r3 results: judging and pinning are one step (`judgeAndPin`: judge against the baseline as loaded, then pin only rows
with no entry, never re-judge). Invariants I1–I5 in the ws-coverage-matrix header, each property-tested (300 random
sequences × 12 nights × 7 rows = 25,200 row-night checks, 0 violations; undoing any rule makes the self-test FAIL). Re-pin
only by `--repin <ids> --reason`, logged per entry. Both critic r3 reproduce cases keep the row RED / refuse with the real
print-lint. Backtest `baseline-night-keeps-red` FAILs on 53f46e10, passes on the fix. Renamed rows map to their new id;
rows that no longer exist are a RETIRED-ROW warning cleared with `--retire`. Over-budget warnings name which affected rows
have a baseline (unchecked) and which have none.

## Critic r4 (`design/audit/runs/wave0-gates/critic-r4.md`): FAIL — plan 7, backtests 8, usable 8
r3 D1 verified fixed at the root (r3 reproduce cases RED/refuse; five mutations of the invariants each fail the self-test).
Blocking: D1 — the fix-r1 rule "add ws-options-pin --check to session 1 once the tool exists" switched on when the pin
merged, so deploy session 1 would run the whole pin (≈ 1 h 52 min): a lead integration miss; at deploy the gate must read
the Repeated check's results instead. D2 — the fold sorted nightly files by date name and other run files by finish time,
so an earlier OK could fold after a later RED. The three timed runs (on eee32b89) predate the pin merge, so they are not
affected by D1.

Fix r4 results: deploy session 1's options gate is read-only (`ws-options-pin --gate design/audit/matrix`, 0.06 s, no slot):
folds every options-pin-*.json by finish time against the current pin; refuses a NEW pair of a live skill; WARNING before
all 28 slices are checked (a stale file refuses only after, as for the matrix). The matrix fold orders every run file by
`finished`; run files record the baseline they were judged against (an OK against another baseline, or from a dirty tree,
never clears red); narrowed slice runs write `.partial` slice files that never count as complete; run file written before
pins (atomic); red rows that turn N/A stay red; options-pin slices cut by a hash of the skill id; a crashed print-lint batch
is retried once. Matrix self-test 161 assertions (property test incl. 526 interleaved-name cases, 0 violations; the r4 sort
mutant fails it). Lanes must commit before a clearing run (a dirty run never clears red) — in NIGHTLY.md.

## Timed deploy-gate runs (S5), three cloud sessions in parallel on 0be0e63 (= eee32b89 + status)
| Gate session | Run 1 | Run 2 | Run 3 | Notes |
|---|---|---|---|---|
| 1 (node gates, content-audit, print-lint kit, teacher-*, screen-answer, share-options, lesson repeats) | FAIL 27.9 min | FAIL 28.4 min | OK (1 FLAKE) 26.4 min | 0 s slot waits; print-lint ≈ 1,000 s and teacher-wrm ≈ 870 s set the length. The only non-OK gate: `ws-teacher-shell`, aborted Andika .woff2 loads (`net::ERR_ABORTED`) counted as console errors — a harness defect, fixed (`tests/lib/ws-harness.cjs` ignores aborted font loads only; 3/3 solo runs OK after) |
| 2 (screen-slots + chromebook-fit sharded, big-board and dark sweeps, viewport, S9 check) | OK 34.1 min | OK 34.3 min | OK 34.3 min | every gate OK, 0 s slot waits; browser work 4,027 s = 33.6 min floor on two slots, so it cannot meet 30 min as listed. Rebalanced: `ws-viewport-check` (≈ 690 s) moved to session 3 (`MQ_VIEWPORT_SESSION`), session 2 ≈ 27.8 min computed from the measured gate times, session 3 ≈ 22 min matrix budget + the viewport check on its free slot ≈ 28 min; confirmation runs below |
| 3 (coverage matrix affected rows, digests hook, owner go) | OK (1 WARNING) 9.0 s | OK 8.6 s | OK 8.8 s | over budget (32,766 docs) with no nightly and no full baseline → the owner's WARNING; nothing rendered, so this times the verdict, not a render |

## Critic r5 (`design/audit/runs/wave0-gates/critic-r5.md`): **PASS** — plan 9, backtests 9, usable 8
r4 D1/D2 fixed; clearing rules hold against hand-made run files; five fresh mutations each fail their self-test; real-browser
options-pin check + gate end to end. Open nits (not blocking): N1 a run file with a future `finished` wins the fold; N2 a
legacy run file without `baseline` still clears red with a WARNING; N3 options-pin `--resume` tmp keyed by date not commit;
N4 a crashed options-pin slice is not re-run before the full baseline (gate stays WARNING); N5 mc-production backtest feeds
the judge directly, and CLAUDE.md "Checks to run" does not name ws-deploy-gates.sh / ws-backtest (lead's file); N6 renamed
rows re-map nightly and never settle.

Owner rule for the Repeated check ("if there is no credit when it runs, save that day for the next possible time"), merged
d4771778: the steady-phase slice is the one after the last COMPLETED slice (newest finished, not-dirty run file), not the
date's; the affected range already diffs from the last successful run. `ws-matrix-nightly.sh --self-test` (10 cases: one and
two missed nights resume at the next slice and cover both nights' changes; dirty / unfinished runs don't count; 28 wraps to 1).
Known behaviour: a forced `--slice k/28` re-run that completes resets the rotation to k+1 (use it only for the missed slice).

## Precritic additions from the pilot's critic r1 (merged 27e67da4)
Five checks in ws-precritic, each backtested: BAD = the pilot tree critic r1 graded (b3948d88), GOOD = b3948d88 + a seeded
minimal fix patch (`tests/fixtures/precritic/pilot-su-c/good.patch`, never committed as app code; the pilot had no fix
commit yet). `ws-backtest --row …-pilot`: 5/5 PASS (283 s).
1. `ws-sibling-compare.cjs` — a red matrix row above the approved siblings' max (same row, size, rule) is FAIL; at or
   below is engine red (rule 0b). Siblings in `tests/fixtures/precritic/siblings.json` (8 stack skills — to confirm).
2. `ws-slot-clip.cjs` — L-ANSAREA / L-OVERFLOW on every matrix row × S/M/L + a probe for answer-box segment width ≥ 4.4 mm
   (TY-21) and overlapping place-value heads (H2); the pilot's 4.06 mm segments at S are caught.
3. `ws-phone-card.cjs` — the practice card at 390×844 / 390×664: no sideways clip, focus on the first (ones) box, in view.
4. `ws-card-rulings.mjs --check rulings` — a card's `<!-- rulings {json} -->` block asserted over 300 seeded items a skill
   (pilot: zero cases 55 % on sub_50 vs the 10 % bound).
5. `--check offered` — the option panel offers nothing the card's `notOffered` lists (pilot: `band` on all 7 skills).
Precritic on HEAD for subtraction:sub_100_no_regroup: OK, 15 PASS (2 baseline), 1 N/A, 2 SKIPPED (no rulings block on the
card — the card owners need to add one; `--strict` makes that INCOMPLETE), 1581 s wall (1048 s of it a needless sibling
measurement, since removed). The SLOT-W / HEADS probe lives in ws-slot-clip, not ws-print-lint yet.

## Per-round findings (LESSONS_LEARNED rule 00)

### Wave 0 part A (gates lane) — critic rounds r1–r5 (2026-10-23)

| Round | Result | (1) Automatic checks the findings point to | (2) Speed-ups |
|---|---|---|---|
| r1 | FAIL 6 / 8 / 6 (D1–D8) | **A1 "checked nothing" self-check in every gate**: unknown `--skills` / `--category` / `--rows` and 0 checked items must FAIL (D3, four gates printed OK on nothing) — a shared helper in `tests/lib` so new tools get it free. **A2 verdict lint for runners**: SKIPPED / NOT YET never ends a run OK (D2). **A3 baseline-grain check**: a baseline pins findings by key, never a count (D5); a test that a swapped finding fails, for every tool with a baseline. **A4 per-skill pins only** (D6). **A5 plan-flag coverage**: grep the plan's named flags (§1.4, §1.6.7) against each tool's usage text (D7 missed: H8 multiple choice). | Brief every new tool with the cross-cutting contract up front (exit codes 0/1/2/3, INCOMPLETE, unknown-id FAIL, key-based baselines, run-file fields): r1–r4 found the same contract gaps tool by tool. Give interface contracts between tools in the brief (matrix ↔ deploy runner) — done from r1 on, it removed merge rework. |
| r2 | FAIL 7 / 8 / 8 (D1) | **A6 state-fold property test** for any tool that reads run history (newest-only reads let red rows vanish). | A defect in shared state logic needs the invariants written first; fixing symptoms took r2→r4 (three rounds, one area). Rule: on the 2nd defect in the same area, brief the root cause and a property test (done at r3). |
| r3 | FAIL 7 / 8 / 8 (D1) | **A7 baseline invariants I1–I5 as a reusable property test** (pin-new-only, verdict before pin, no re-pin by a nightly) — applies to node-lint, options-pin and matrix baselines alike. | Same as r2: escalate to "root cause + invariants" one round earlier. |
| r4 | FAIL 7 / 8 / 8 (D1, D2) | **A8 deploy-list time budget**: `ws-deploy-gates --list` sums each gate's last measured seconds per session and FAILS when a session exceeds 30 min (would have caught the options pin auto-joining session 1, and session 2's 33.6-min floor). **A9 fold-order mutation in the property test** (sort by name vs `finished`). | Lead integration rule: a "switch on when the tool exists" line must be reviewed at merge (D1 was the lead's merge). Time each gate once and keep the table in the runner so rebalancing is arithmetic, not a 90-min timed run. |
| r5 | **PASS 9 / 9 / 8** | Nits → checks: **A10** reject run files with a future `finished` (clock skew); **A11** legacy run files (no `baseline` field) clear nothing after a cut-off; **A12** options-pin `--resume` keyed by commit. | Run critics on the narrowest scope (r5 scoped to "r4 defects + regressions" took 10 min vs 29 min for r1). Timed deploy runs in parallel child sessions: three sessions × 3 runs in ≈ 1.5 h wall instead of ≈ 4.5 h serial. |

**Queue of automatic checks this lane owns** (owner rule: the main owner of new checks; other lanes' "Automatic checks"
items join here in priority order): A8 deploy-list time budget; A1 shared "checked nothing" helper; A3 key-based baseline
test for every baselined tool; A10–A12; then other lanes' items as they are listed in speed-audit.md "Per-round findings".

### Critic r6 (`design/audit/runs/wave0-gates/critic-r6.md`): FAIL 6 / 8 / 7 — the five pilot-lesson checks
All five BAD states fail for the r1 defect's own reason (D1, D3, D5, D6 of pilot r1) and `good.patch` is a fair stand-in.
Blocking: D1 sibling-compare only compares RED rows, but unpinned rows are PENDING(no-baseline), so a new skill (e.g. the
pilot's `sub_2d_1d`, 38 counts above siblings) is never compared; D2 ws-phone-card picks the wrong "ones" box on legacy
column cells (3–4 px raised active box) and false-FAILs approved 4–6-digit regroup skills; D3 ws-card-rulings prints OK when
only part of the scope has rulings. Lead decision on N1: compare with the paired same-size siblings by default (as the lead's
own comparison did). Fix r6 at Opus medium.

| Round | Result | (1) Automatic checks the findings point to | (2) Speed-ups |
|---|---|---|---|
| r6 | FAIL 6 / 8 / 7 | **A13** every rule-0b tool must judge unpinned rows too (a "status filter" test: a fixture with only PENDING(no-baseline) rows must still be compared); **A14** every new screen probe is run on the approved siblings before it gates (a "siblings clean" self-check: an approved skill failing a new probe means the probe is wrong, not the skill); **A15** partial-scope = INCOMPLETE for any scoped check. | Run a new check on approved siblings in the builder's own loop (would have caught D2 before the critic); slot-clip costs ≈ 19 min of a precritic — batch its print-lint jobs with the matrix's own render (one render, two lints). |

Queue items A8, A10–A12 merged (d9cd5f4a): `ws-deploy-gates.sh --budget` (and the first row of every session run) predicts
each session's wall clock from the newest measured gate times (list-order scheduling on the 2 browser slots + 2 node
workers; the matrix as 500 docs × 5.26 slot-s) and FAILs a session over 30 min (`MQ_SESSION_BUDGET_MIN`); prediction vs
measured: session 2 old list 2058 s vs 2057.8 s. Old list (viewport in session 2) FAIL 34.3 min; options-pin --check in
session 1 FAIL 139 min; today's list 27.3 / 28.1 / 27.8 min. The 2026-10-23 timed runs' lines (sessions 1 and 2, transcribed
from the child sessions' reports — they were never committed there) are now in `design/audit/baselines/deploy-gate-timings.jsonl`.
A10 future-dated run files clear nothing; A11 run files without `baseline` after 2026-10-23T19:46Z clear nothing; A12
options-pin `--resume` keyed by commit. Self-tests: deploy 91, matrix 171 (A10/A11 mutations each fail it), options-pin 67.

## Timed deploy-gate runs, confirmation (on ab511284, viewport-check moved to session 3)
| Gate session | Runs | Wall clock | Verdict |
|---|---|---|---|
| 1 | 1 | 26.1 min | OK (1 FLAKE: ws-teacher-shell, an aborted `css/fonts/andika.css` load — the harness exemption covered only .woff files; widened to css/fonts/, 3/3 solo runs OK) |
| 2 | 3 | 28.4 / 28.4 / 28.4 min | OK, every gate OK, 0 s slot waits |
| 3 | 3 | 10.8 / 10.8 / 10.8 min | OK (matrix WARNING per the owner ruling: no nightly / full baseline yet; viewport-check ≈ 648 s) |
With the earlier session 1 runs (27.9 / 28.4 / 26.4 min), every session has three timed runs ≤ 30 min. Session 3 will
grow to ≈ 28 min (predicted by `--budget`) once the matrix renders its ≤ 500 documents after the full baseline.

## Lead decisions 2026-10-23 22:05
- "Repeated check" scheduled task created by the lead (daily 01:13 UTC, prompt from NIGHTLY.md).
- D8: the critic sample is the bounded all-pairs set + 20 %, capped at 40 pages a pair (builder at low effort).
- Approved siblings confirmed (`tests/fixtures/precritic/siblings.json`), template `stack`: add_100_regroup,
  sub_100_regroup, add_1k_regroup, sub_1k_regroup, add_10k_regroup, sub_10k_regroup, sub_100k_regroup, sub_1m_regroup.
  Pairs (same size band): sub_50_no_regroup, sub_100_no_regroup, sub_2d_1d → add_100_regroup + sub_100_regroup;
  sub_1k_no_regroup → add_1k_regroup + sub_1k_regroup; sub_10k_no_regroup → add_10k_regroup + sub_10k_regroup;
  sub_100k_no_regroup → sub_100k_regroup; sub_1m_no_regroup → sub_1m_regroup.
- Spec-card rulings block: this lane's (ws-spec-card + README; stack and subtraction cards regenerated layout-only).
- CLAUDE.md "Checks to run": the lead writes it from the draft after merge.
- "Needs owners" defects go to each family's redo: per-skill pointer lines appended to design/audit/SKILL_UPGRADE_LIST.md.
- Merged claude/sweet-newton-c8wrv1 (incl. 0b79cea1, the W0-defects viewport fix); ws-viewport-check re-run pending.
- Rulings block (merged 471af9c2): ws-spec-card writes `<!-- rulings {json} -->` into every card from `card.json` "rulings"
  (each entry cites its card section) with a `todo` list of prose rulings not yet machine-checked; `--rulings-only` adds the
  block without touching signed text (the block is excluded from the signed-body compare but covered by bodySha, so a hand
  edit is caught). Subtraction card: 16 rulings + N-BAND; today `ws-card-rulings` FAILs sub_100_no_regroup on R-BAND-100
  (118/300), R-SAME-LENGTH (40/300), R-ZERO-NOT-SEEDED (44.3 % vs ≤ 10 %) and N-BAND (band offered) — the pilot's own fixes
  are not merged yet. Stack card regenerated (unsigned). **For the lead:** the subtraction card's signature already fails
  `--check-signed` because DN-34's excerpt changed upstream after signing — it needs `--resign` + your re-sign after the pilot.
- D8 applied (merged 8aabacc0): `sample.critic` = bounded all-pairs (representatives) + 20 % random, total ≤ 40 pages a pair.
  On stack × Single skill the bounded all-pairs alone fills the cap: 21 rows / 40 pages kept, 0 random, 36 all-pairs rows
  cut → 531 of 656 bounded pairs covered (125 uncovered; uncapped it would be ≈ 76 pages). The page states the cut.
  **For the lead:** keep the cap (125 pairs left to the machine sample) or allow ≈ 76 pages for this pair.
- SKILL_UPGRADE_LIST.md: 346 pointer lines appended (292 skills), a "Wave 0 pinned defects (2026-10-23)" block under each
  family: 26 MC-on-screen, 115 option-verify, 205 node-lint lines.
- ws-viewport-check re-run after merging the W0-defects fix (0b79cea1): 64 sessions, 0 findings, OK (665 s); its baseline is already empty — add_word_problems and long_div_2digit leave "needs owners".
