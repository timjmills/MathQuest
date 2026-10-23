# Wave 0 part A (checks and deploy gates): independent critic, round 1

Critic: independent, mq-opus-medium. Tree `acffe85b` on `claude/sweet-newton-c8wrv1-wip-wave0-gates`. The commits after it
up to `19c39a63` change only the status file. Date 2026-10-23.
Scope: S2, S4, S5, S9 (the one-line fix) and the E1 tools that can be built before M4. Not graded: S1 `ws-precritic`,
which moved to another session, M4 record/replay and `ws-packer-proof`. Everything below was checked by running it. Every
browser process went through `/tmp/mq-browser-run.sh`.

## Verdict: FAIL

| Criterion | Score | Why |
|---|---|---|
| 1. Does what the plan says (per step, in scope) | **6** | The tools exist, run, and fail closed on most flags that need a later M-step. But S5 session 3 cannot meet the plan: it has no budget and does not check the nightly (D1). SKIPPED gates count as a pass (D2). One S2 item is missing with no note: the H8 multiple-choice check for every family, with its backtest (D7). The E1 all-pairs sample is an order of magnitude bigger than the plan's "tens of pages a pair" and has no 20 % / 40-page part (D8). |
| 2. The backtests are real | **8** | `ws-backtest`: 10 / 10 PASS in 254 s. I re-ran all five commit-pair rows by hand. Each fails on the bad commit for the reason the critic gave and passes on the fix (details below). The fixtures are minimal and are not special-cased in the lint code. Held at 8 for two reasons: the H8 backtest the plan requires does not exist, and S9 has no deterministic regression check, only a screen sweep that is unseeded. |
| 3. Usable by a builder | **6** | The output tables are clear, failure lines name the skill, rule and item, and flags that need a later step fail with the reason. But four gates print OK without having checked anything (D3). Two baselines can hide new findings (D5, D6). The matrix can pin a render error so it stays green for good (D4). |

PASS needs 8 or more on all three, so this round is a FAIL.

## What I ran (results)

| Command | Result |
|---|---|
| `MQ_BACKTEST_TMP=<scratch> node tests/scripts/ws-backtest.mjs` | `ws-backtest: OK`, 10 PASS, 253.7 s |
| `node tests/scripts/ws-node-lint.mjs` | OK against its baseline in 42 s. Totals: NOTATION 2919, L1 90, L3 87, L6 111, L10 10, REPEATS 211 |
| `node tests/scripts/ws-envelope.mjs --self-test` / `--engine all` | OK (320 checks, 1.8 s) / lists 126 pairs. The data-leaf rule is proved on fixture leaves; `sheet/instructions.js` is not in the tree yet, so it is skipped |
| `ws-envelope --voids c87755a1~1..c87755a1` (a `layout.js` change) / `--voids 88d27e72~3..88d27e72` (the S9 dispatcher change) | voids every pair / voids 0 of 126: correct |
| `ws-coverage-matrix --self-test` / `--skills addition:add_missing_digit --list` | OK, 64 assertions / 33 rows (RUN 15, PENDING 14, N/A 4) with the M-step for each pending row |
| `ws-coverage-matrix --skills addition:add_100_regroup --rows single/defaults,sections/ex-each,mixed/defaults,single/layout-timed --baseline … --slots 2 --batch 3` | 4 rows, 12 documents in 37 s (0.34 documents/s), all OK against the pinned baseline |
| `ws-deploy-gates.sh --list` / `--self-test` / `--deploy-check` | list printed / OK (owner-go refusal works, FLAKE then BLOCKED) / OK, because `design/lanes/` does not exist yet |
| `ws-grade-render --template function-table --golden diff` | 32 pages: 0 changed, 32 never graded, OK. In a scratch worktree, a one-line stroke-width edit in `cells/function-table.js` flagged all 32 pages as changed (the line is in every cell). Reverting it gave 0 changed, so the content hash is stable and sensitive. |
| `ws-grade-render --envelope stack--single --limit 3 --contact-sheet --out <scratch>` | the adapter reads `sample.print` / `sample.screen`; 55 rows were skipped as waiting for an engine field; 5 contact sheets written |
| `ws-print-lint --self-test` | OK: 52 assertions, 40 planted defects, every lint covered |
| `ws-print-lint` with `--anchors top` / `first`, `--kind sections --sections grouped` / `parts`, `--kind sections --bring-back`, `--kind mixed --pages 3`, `--fade problems` | each fails at once and names its step (M4 / M2 / a `req.bringBack` field / a coverage value). Nothing is silently ignored. |

### The commit-pair backtests, checked by hand

| Row | Fail commit (critic finding) | What the check reports | Pass commit |
|---|---|---|---|
| lone-item | 359802c5 (skip-count critic r4 D12: 3 pages, a lone state) | `L-DENSITY LONE` on p1 and p3: "sheet pages 1 + 2 + 1: the 4 cells fit on 2 page(s) of 2". This is D12 exactly. | b19172b4: 2+1 pages, OK |
| text-generator-wrm-page | 848d7d3f (WRM page critic r8 M12) | 191 RESPONSE/DRAWING findings, including the critic's own examples `map_share_among` (circles vs drag), `mult_4x1` (matches vs write in the grid) and `patterns_notice` (shaded fraction pictures) | d515aa05: 234 composed lines checked, 0 findings. It is not vacuous. |
| text-generator-wrm-tagging | c3d08a69 (critic r13 N13) | `Y3.B6.S10 "Equivalent fractions as bar models" is full, but the bar model is drawn in 0 of 300 items` | 89f30a64: 66 claims, 0 findings |
| chromebook-viewport | e189119f (number line critic r7 R7-D1) | 7 × UNDER-HEADER at 1280×600 and 1366×650. The band tops are 3, 10 and 53 px under a bar ending at 59, matching critic r8's "pre-fix 3–56 / 10–63; 1366×650: 53" | 789f23f7: OK |
| repeats-lesson | c2a6d8b4 (detailed lesson 6 critic r1 D2) | 8 findings: R-ANSWER / R-TURN from P2 (Guided) returning on P6 (exit slip) | f0990693: 35 places, 0 findings |

None of these is a tautology tuned to one commit: each is the general rule, run with the critic's own skill, options and sizes.

### Spot-check of 17 pinned `ws-node-lint` findings (3 a rule, seeded sample)

- **Real (11):**
  - L1, legacy fixed-px SVG: `cross_section_3d`, `count_sides_vertices_2d`, `geo_rotate`.
  - REPEATS: `reading_ruler` (an identical item, payload included), `add_5_pictures` (2 + 2 twice).
  - NOTATION, inline fractions in cells: `fractions_all` "7 4/6", `ordering_rationals` "-1/2", `frac_word_mixed_plain` "2/4 of".
  - L6, a fixed worked step "7 hundreds is 700" on all 30 items: `digit_value_unit_form` (×2).
  - L10: `compose_whole`, where the constant answer "1 whole" is a data fault.
- **False positives (4):**
  - L3 `pictograph_intro`: the "= 1" in the key is a scale label.
  - L3 `compose_whole`: the target is printed as the answer.
  - L3 `equal_or_unequal_groups`: "multiply" appears in the instruction text.
  - L6 `time_fives_ring`: "Count on 5 … 5, 10, 15" is a count-by of one.
- **Unsure (2):**
  - L10 `shape_name_match_3d`: the matching map is constant, which is real only if the bank is not shuffled on the page.
  - L10 `mult_placeholder_zero`: the answer is "0" by design.

The pinned set is mostly real. L3 is the weakest rule: about two of its three findings are false positives.

## Defects (blocking)

**D1. Deploy session 3 cannot finish and does not do what the plan and NIGHTLY.md say.**
`tests/scripts/ws-deploy-gates.sh:186-195` runs
`ws-coverage-matrix --all --affected <merge-base>..HEAD --baseline design/audit/matrix/baseline.json --slots 2` with no
document budget. Before M4, any change to a print input reaches every row.
- Reproduce: `node tests/scripts/ws-coverage-matrix.cjs --all --affected 60c4fa53..HEAD --list` gives "rows reached
  21599 of 21599 … RUN 10922 · documents to run 32766". At the measured 0.31–0.38 documents/s that is about 24–29 h
  inline, inside a "≤ 30 min" deploy.
- §1.6.2 asks for three things at this point:
  - a budget of 500 documents;
  - above the budget, "the deploy triggers the sharded full run and waits for it";
  - "the deploy is refused when the latest nightly is older than 24 hours or any row of a live skill is red".
- None of the three is in the runner (`grep -n nightly tests/scripts/ws-deploy-gates.sh` finds nothing), yet
  `design/audit/matrix/NIGHTLY.md` says "The deploy gate (S5 session 3) refuses a deploy when the newest nightly is older
  than 24 hours …".
- The per-row baseline holds 2 skills, so even a finished run is red on almost every row.

Session 3 today either runs for a day or fails. Fix:
- cap the affected rows at the budget;
- above the budget, read the newest `design/audit/matrix/<date>*.json`: refuse when it is older than 24 h or holds a RED
  row of a live skill, else report "sharded run required";
- make NIGHTLY.md describe what the code actually does.

**D2. A SKIPPED or NOT YET gate counts as a pass, and the run still prints `ws-deploy-gates: OK`.**
- `ws-deploy-gates.sh:223-224` sets `rc=0` for `skip` and `notyet`, and lines 356-361 fail only on FAIL / BLOCKED.
- Evidence: `design/audit/baselines/deploy-gate-timings.jsonl` line 3 is the "all OK, 26.4 min" session 1, and it had
  `ws-node-lint` and `ws-envelope --self-test` SKIPPED.
- Any gate whose file is renamed or deleted silently becomes SKIPPED and the deploy passes. S5 says "same gates, nothing
  skipped".
- Fix: SKIPPED is a FAIL unless the gate is on an explicit, dated allow-list printed in the table. NOT YET may stay
  non-failing, but the last line should then be `OK (n NOT YET)`.

**D3. Four gates print OK when they checked nothing.** Each of these is a precritic or deploy input:
- `/tmp/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --category measurment` (a typo) prints
  "0 skills, 0 host renders … ws-screen-slots: OK". There is no empty-selection guard at `ws-screen-slots.cjs:256-260`.
  The same happens with an unknown `--skills` value, because it is filtered out.
- `/tmp/mq-browser-run.sh node tests/scripts/ws-chromebook-fit.cjs --skills nosuch:skill` "measures" `nosuch:skill` at
  1366×650 and 1280×600 on all five hosts (the app falls back to some question) and prints OK. `--skills` is never
  checked against `SKILLS` (`ws-chromebook-fit.cjs:227`; only the default list is filtered by `known`).
- `node tests/scripts/ws-coverage-matrix.cjs --skills addition:add_100_regroup --rows single/defualts` prints "OK (0 row(s),
  0 run)", exit 0.
- `node tests/scripts/ws-coverage-matrix.cjs --skills addition:add_100_regroup --kind quiz` prints OK with every row
  PENDING (`ws-coverage-matrix.cjs:717-720`).

Fix: an unknown skill, category or row name is an error; zero checked items is FAIL. When every selected row is PENDING
or N/A, the matrix prints `NOTHING RUN`, not OK.

**D4. The matrix's `--write-baseline` pins render errors.**
- `ws-coverage-matrix.cjs:661` pins every row whose status is `RED` as well as `OK`.
- A document that did not render is counted as `L-SPLIT RENDER: 1`: from print-lint (`ws-print-lint.cjs:1921, 1990`), and
  for a crashed batch, l.474.
- So the first nightly (`ws-matrix-nightly.sh`, first run uses `--write-baseline`) makes every row that cannot print
  permanently green. That defeats H11, "a page type the skill must support cannot be produced", which is the matrix's
  whole purpose (§1.6.3).
- The plan says a red row is a finding beyond the baseline "or any other gate failure on the row".

Fix: never pin `L-SPLIT RENDER` (or any `error`). `verdict()` should make a row with an error RED whatever the baseline
says.

**D5. The `ws-node-lint` baseline counts findings per (skill, rule), so it hides new findings.**
- `design/audit/baselines/node-lint.json` pins counts: 67 skills have NOTATION ≥ 30, which is saturated at n = 30.
- A new finding in a pinned skill passes in two cases:
  - it replaces one that was fixed in the same change;
  - it is a different kind under the same rule (for example a new `x`-for-times in a skill pinned for inline fractions).
- §1.3 says "any NEW finding fails". Items are dealt by seed (`hashSeed(category:skill)` + index), so the findings are
  stable and can be keyed.
- Fix: pin `(skill, rule, kind, item, detail-hash)` keys, as `screen-slots.json` and `viewport-check.json` already do.

**D6. The chromebook-fit page-error pin is global.**
- `tests/fixtures/precritic/sweep-sample.json` → `chromebookFit.problems` pins the message substring "Cannot read
  properties of null (reading 'numberFamilyData')".
- `ws-chromebook-fit.cjs:416-421` waives every page error that contains it, from any skill, in every shard, because the
  default shards also use `--baseline sweep-sample.json`.
- A new skill that throws the same error class passes.
- Fix: pin it per skill and host (`addition:add_sub_fact_family` card → worksheet / quiz), like the scroll pins.

**D7. An S2 item is missing and not recorded.**
- §1.6.3, row H8, gives this to S2: "`ws-content-audit` (P-29) checks operations and K-2 today; S2 extends it to every
  other family … with a backtest (a seeded production item offered as buttons)".
- `ws-content-audit.cjs` is unchanged on this branch.
- `tests/fixtures/precritic/backtests.json` has no such row.
- `design/status/wave0-gates.md` does not mention it.

Either build it with its backtest or record it as moved, with an owner.

**D8. The E1 all-pairs sample is not a critic sample.**
- `node tests/scripts/ws-envelope.mjs --envelope stack--single --out x.json` writes 660 print rows and 165 screen rows.
- §1.6.2 says "all-pairs sampling: tens of pages per pair, not thousands, plus a random 20 % of the remaining envelope at
  full scale, capped at 40 pages a pair".
- No 20 % part and no 40-page cap exist (`grep -n "20 %\|cap" tests/scripts/ws-envelope.mjs` finds nothing).
- The size comes from crossing every skill's own options (310 options, 1513 values) into the pair's sample.

Either split the sample into the pair's own all-pairs set (kind options × size × a few skills: tens of pages) plus the
per-skill rows that the instance gates and the matrix prove, or get a ruling and update the plan. Then add the 20 % /
40-page part.

## Nits (optional)

- **N1.** `ws-print-lint --anchors bogus` says "needs M4", which misreports a typo. Unknown values should fail as unknown.
- **N2.** `ws-node-lint` snippets are cut mid-word ("l shows 2/3. Write", "ng uses 2/4 of a li"). Cut at word boundaries,
  or print the whole short text.
- **N3.** `ws-coverage-matrix --list` ends with `ws-coverage-matrix: OK (list, nothing run)`. A runner that parses the
  last line (`ws-backtest` does) would read it as a pass. Use a non-verdict line.
- **N4.** The S5 Files column names CLAUDE.md "Checks to run", but it does not mention `ws-deploy-gates.sh` as the one
  list. This may be an owner-gated edit; record who makes it.
- **N5.** The new S2 checks (`ws-viewport-check --baseline`, `ws-text-vs-gen`, `ws-detailed-lesson --repeats`) are not in
  the deploy list, so the R7-D1 class (which `ws-chromebook-fit` cannot see) is not checked at deploy.
- **N6.** The deploy base falls back to `HEAD~1` when `origin/master` is not fetched (`ws-deploy-gates.sh:191`), which
  silently narrows `--affected`. Fail instead.
- **N7.** Until the per-skill print-lint baseline (b1c50244, on the precritic branch) is merged, session 1 judges
  print-lint by the total count limit 461/33, which hides new findings while the total stays under it. Merge order
  matters for S1.
- **N8.** The `ws-screen-slots` card host deals with the unseeded `generateQuestion()`, so which item a skill gets depends
  on the shard or category composition. That is the `reading_ruler_hard` intermittency class. The S9 fix (correct root
  cause, `generate-question.js:1099`) has no deterministic check: a node or browser loop over seeds asserting "no
  `fraction-input` when the cell draws its own fraction boxes" would make it permanent.
- **N9.** `design/audit/golden/function-table/manifest.json` records rule set `ba0d584c`; today it is `6490d9b7`, so the
  diff reports every score stale on the day it was written. This is harmless while nothing is graded; re-write the golden
  after rule-file edits.
- **N10.** The matrix cache key ignores the baseline file: a row cached OK stays CACHED under a different `--baseline`.
- **N11.** `sweep-sample.json` says `liveSkills 723` and `ws-node-lint` counts 715 live skills: two definitions of "live".
- **N12.** L3's false-positive rate is high (2 of 3 in my sample: key and scale labels, a printed target, an instruction
  word). Worth tightening before it gates new skills.

## Does anything here block S1 (`ws-precritic`)?

Yes, two things:
- D3: the precritic passes `--skills` / `--category` straight to these tools, so a misspelled skill would pass its
  screen gates.
- D4 / D5: the precritic compares against these baselines.

Otherwise the flag shapes the precritic needs exist and match: `--skills`, `--category`, `--baseline` on screen-slots and
chromebook-fit; `ws-coverage-matrix --skills`; `ws-grade-render --template`.
