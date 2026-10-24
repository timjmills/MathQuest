# Critic r1: lane S1, the card gate "hosts and roles" and the 11 generic checks

Critic: independent, mq-opus-medium. Round 1, 2026-10-24, 10:46–11:03 UTC. Branch `claude/sweet-newton-c8wrv1-wip-s1-checks` at 956bc20a.

Scope:
- Task A: `ws-spec-card` §7a / §7b (decisions; hosts, roles and options), `--check-signed` (e), the 02c5308e fold-in, and the W0-A r7 D2 fix (rulings under the signature).
- Task B: the 11 checks, their backtest rows, and how `ws-precritic` wires them.
- W0-A r7 D1 (partner attribution), r7 N1–N4, `--strict` in rule 0b, and CLAUDE.md "Checks to run".

I edited no tracked file. Scratch work went to detached worktrees under /tmp (956bc20a twice, and 27577cf, ff471fd, 03eda45), all removed afterwards. This report is the only file I created, and it is uncommitted.

Not counted, as the lead ruled: the sub_100_regroup rule 0b red on main, the SU-C skills failing on main, the unsigned subtraction / stack cards, and the matrix pins not being re-pinned.

## Verdict: FAIL

| Criterion | Score |
|---|---|
| 1. Does what the lead asked | 7 |
| 2. The backtests are real | 8 |
| 3. Usable by a builder | 7 |

## What I ran

**Backtests.** I ran `MQ_BACKTEST_TMP=/tmp/s1crit-bt node tests/scripts/ws-backtest.mjs --row <the 17 S1 rows>`. Result: **17/17 PASS**, 525 s. The rows were:
- s1-zero-case-content-audit, s1-dealer-uniform, s1-lesson-data, s1-option-help, s1-wrong-fits, s1-presets-obey
- options-render-pilot
- card-gate-decisions, card-gate-rulings
- ansarea-ty21-pilot, overlap-d7-pilot, overlap-n8-pilot
- wrap-op-pilot, h13-lesson-warmup-pilot
- d1-partner-attribution, d1-real-partner, d1-real-unattributed

**Self-tests, all OK:**
- `ws-sibling-compare`: 20 cases
- `ws-card-rulings`: 22 cases
- `ws-dealer-uniform`: 15 cases
- `ws-node-lint --self-test`
- `ws-spec-card`: 76/76
- `ws-content-audit`: 141 assertions
- `ws-print-lint`: 64 assertions, 52 planted defects
- `ws-slot-clip`: 7 fixture pages
- `ws-presets-unit`: 7 predicate cases

**Fail states re-run by hand.** Each one is the defect the critic named:

| Row | Command | Result |
|---|---|---|
| dealer at 03eda45 | `ws-dealer-uniform --root <03eda45> --rulings …/pilot-su-c/rulings.json --skill sub_50,sub_100,sub_2d_1d` | FAIL. b ones digit over-dealt (χ² 68.6 on 7 df); the zero case at 7 mod 10 (8 of 8 items); minuend 47 five times on page 5. This is critic r2 N1 exactly |
| options render at 03eda45 | `ws-options-verify --render --root <03eda45> --skill subtraction:sub_100_no_regroup` | FAIL on `notation="across"` @S only: 12 items on its fullest page against the default 20 (H13). This is critic r2 N4's value |
| add_three, the TY-21 true positive | `ws-print-lint --source kit --skills addition:add_three --size S --opts '{"notation":["stacked"]}' --lints L-ANSAREA` | FAIL, 80 × "answer segment 4.06 mm". The default (across) page is clean at S, M and L |

**D2 on the real card.** In a scratch worktree I signed `design/cards/subtraction/subtraction.md` by hand. `--check-signed` gave OK. I then set R-ZERO-NOT-SEEDED `max` from 0.1 to 0.6 in card.json:

| Step | Result |
|---|---|
| `--rulings-only` | refused: "is SIGNED … nothing written. Re-run with --resign" |
| `--check-signed` | 3 FAIL: configSha; "signed rulings … CHANGED … R:R-ZERO-NOT-SEEDED"; body differs |

`ws-card-rulings` reads the md block, not card.json, so a hand edit of that block trips bodySha. Precritic runs `--check-signed --skill`, which is the `spec-card-signed` row. **r7 D2 is fixed.**

**Task A on the committed card:**
- §7b lists 55 option values (the `_ap4*` notation and the nl* sub-controls included), 17 roles each with a data source (`role:lesson` "prereqs.js 0/6 (FALLBACK …)") and 8 hosts. Each line carries a marker.
- `--check-signed` on the committed card ends `UNSIGNED … everything else green`, with 80 PROPOSED and 0 undecided.
- On the stack card, 118 undecided lines give FAIL (2 problems), not INCOMPLETE. That is correct.
- `--family subtraction` regenerates the card byte-identical. The card is unsigned, as asked.

**r7 D1.**
- Partner findings are reported, never blocking.
- Unnamed findings stay with the lane, which is the conservative choice.
- When more than half of a row's findings are unattributed, the row is an ERROR.
- Siblings are compared on their own share.
- The three D1 rows run on fixtures built from real runs. **Fixed.** See N3.

**Precritic wiring (`--dry-run`).**
- `--skill` adds these rows: dealer-uniform, node-lint-s1 (LESSON-DATA, OPTION-HELP, WRONG-FITS, on a pinned baseline), spec-card-signed, options-verify --render, and presets (only when a preset or host is touched).
- `--role lesson` adds grade-render and print-lint at L and at S.
- Under `--strict`, SKIPPED / INCOMPLETE rows, including an UNSIGNED card, end exit 3.
- Rule 0b in LESSONS_LEARNED now names `--strict` and "merged with main".
- CLAUDE.md lists precritic `--strict`, `--role lesson`, `--check-signed` and `ws-backtest`.

## Blocking defects

### D1. ws-dealer-uniform FAILs every skill that deals no operands, and precritic runs it on every `--skill`

Precritic adds `dealer-uniform` for every lane skill (`ws-precritic.cjs` l. 689). The tool turns "nothing to read" into a FAIL.

**Evidence:**
```
$ node tests/scripts/ws-dealer-uniform.mjs --skill area_perimeter:perimeter_intro,placevalue:more_less_10,measurement:time_hour,algebra:tape_diagram,fractions:identify
  FAIL area_perimeter:perimeter_intro (0/120 read)
      FAIL 0 of 120 items read (0 threw, 120 without operands): nothing checked
  … the same for more_less_10, time_hour, tape_diagram, identify
ws-dealer-uniform: FAIL - …
$ node tests/scripts/ws-precritic.cjs --skill fractions:identify --dry-run | grep dealer
  [node] ws-dealer-uniform … --skill fractions:identify
```

**Effect.** Every lane outside the + − × ÷ dealers gets a red precritic row it cannot fix: fractions, geometry, measurement, place value, algebra and time. It breaks rule 0b for most of the coming lanes.

The tool's own principle is right: never PASS on nothing checked. But the right verdict here is N/A, the way options-verify reports "nothing to render" as N/A.

**Smallest fix.** When 0 items carry operands, print `ws-dealer-uniform: N/A - no operand-dealt items: <skills>` and exit 4. Map that to N/A in `PARSE.dealerUniform`. Keep FAIL when *some* items read and others throw. Add a self-test case and a backtest row: a fractions skill gives N/A, not FAIL.

**Automatic check that would have caught it:** a precritic "A14 every family" dry run: run each new precritic gate once on one approved skill per DOMAIN (not only on the subtraction siblings), and require PASS or N/A.

### D2. Checks 8 and 11 never reach the lane skill's own lesson page through precritic

The lead's queue (wave0-gates status, item 8) says "precritic --role lesson **on touched skills**". The implementation only lints the 20 fixed role-sample skills.

**Evidence:**
- `ws-precritic.cjs --skill subtraction:sub_50_no_regroup --role lesson --dry-run`: both lesson print-lint rows use `--skills composing:number_bonds,…,vocabulary:vocab_grade_K`. sub_50 is not in the list.
- The coverage matrix has no lesson row: the rows are single / sections / mixed / quiz, and the only `--roles` rows are fact-rows, fact-probe and todays-number.

**Effect.**
- The defects behind checks 8 and 11 sat on the pilot's OWN lesson pages:
  - N2: the sub_50 lesson Warm-up, which is H13.
  - N6 and N7: the sub_1m lesson, which is WRAP-OP.
- A rerun of precritic on such a lane still ends OK. The backtests pass only because they call print-lint on the lane skill directly.

**Smallest fix.** When `--skill` is given, add a `print-lint-lesson-<skill>` gate: `ws-print-lint --source kit --roles lesson --skills <keys>` at L and at S, on the lesson pins. Do the same for `--role lesson --skill`, which should use the union of the sample and the keys. Point the h13-lesson-warmup and wrap-op backtest rows at a precritic `--skill … --dry-run` plan assertion, or add one self-test that the plan contains the lane skill's lesson.

**Automatic check that would have caught it:** a precritic plan self-test. For every backtest row whose command names `--skills X --roles R`, assert that `ws-precritic --skill X --dry-run` plans a gate that renders role R for X. A check that is not on the lane's path is not wired.

### D3. Check 9 (presets) passes the pilot's real preset defect, and its backtest is seeded although a real pair exists

The queued spec reads "presets-unit item check (instruction key + declared band)". The real defect is pilot critic r1 D8: the `sub_2d_1d` preset dealt a narrow set (minuends 51–99) and did not use the provider's `subtract` instruction. Critic r2 marked D8 fixed.

The new check 6 tests only that "items obey the preset values (tiles / lengths / band)". It cannot see either half of D8.

**Evidence.** Both the D8 state and the fixed state pass:
```
$ MQ_ROOT=<27577cf> mq-browser-run.sh node tests/scripts/ws-presets-unit.mjs
ws-presets-unit: OK (115 presets: … 48 item×value predicate checks (tiles / lengths / band), 666 value(s) with no predicate …)
$ MQ_ROOT=<ff471fd> …  →  ws-presets-unit: OK (same)
```

The backtest row `s1-presets-obey` instead uses a SEEDED mutant on multiply (`mult_2by1_column` dealing 2 × 2). It is honestly labelled. But it is the only one of the 11 checks without a pilot-commit backtest, and nothing in `design/status/s1-checks.md` records the deviation for the lead.

**Smallest fix (either):**
- (a) Add the two D8 predicates:
  - the preset's instruction key is the host provider's key, not a generic one;
  - the preset's items span the band its card / declared range gives (min and max within the band's first and last decile).
  
  Then re-point the row to 27577cf (fail) and ff471fd (pass).
- (b) If D8 is not machine-checkable, record it in the status as a lead decision ("check 9 = option obedience only; D8 stays with the critic"), and keep the seeded row.

**Automatic check that would have caught it:** ws-backtest `--list` flags any row of kind `fixture`/SEEDED whose `check` cites a defect that has a real commit pair in `backtests.json`'s source branch. The simplest form is a required `realPair: none (why)` field on seeded rows.

## Nits

- **N1.** The §7b role data source is a regex over the role file *including comments*. `role:fact-rows` reads "provider stories: real 2/6", from the comment "stories, remainders and long division stay out" (`sheet/roles/fact-rows.js` l. 72). `stripComments(full)` exists; match the members on `code`, not `full`. The listing is informational, but the owner signs decisions from it.
  - Check: a spec-card self-test case where a role names a member only in a comment.
- **N2.** Unknown skills give OK or NO-CARD from the standalone tools:
  - `ws-options-verify --render --skill subtraction:nope` gives "OK (nothing to render)";
  - `ws-spec-card --check-signed --skill subtraction:nope` gives "NO-CARD".
  
  Precritic validates live skills first, so this is not reachable from there, but a builder running the tool alone gets a green answer on a typo. Reject unknown skills, as ws-dealer-uniform does.
- **N3.** D1 attribution is inferred after the fact in test code (`attributeCells`: letters or order, plus a ≥ 80 % number match). This happens because `practice.js` `planItem` does not pass `skill` to `cell.js`, so multi-skill cells carry no `data-ws-skill`. It fails closed, which is good. The root fix is one line in the kit: pass `skill` through `planItem`. That is an app change for a kit lane; route it.
- **N4.** A lane with no spec card gets `spec-card-signed` N/A, which `--strict` accepts. Only the card-rulings SKIPPED row makes such a lane red under `--strict`. If "card signed at build start" is a gate, NO-CARD should be INCOMPLETE under `--strict`, or the rule 0b text should say the card gate is enforced through card-rulings.
- **N5.** `design/status/s1-checks.md` ends at "Builder B fix round 1 (medium)". The D1 fix r1 outcome (c5725c66, merged 956bc20a) and the 17-row backtest are not recorded. The r7 N3 owner line (approved sub_1m_regroup head overlap at level 3 S) is still not in SKILL_UPGRADE_LIST.

## Re-grade of the wave0-gates pilot checks and r7

| Item | Status |
|---|---|
| r7 D1 (partner attribution) | **fixed**: fixture + 2 real-data rows PASS; the attribution gap is an ERROR, not a silent pass |
| r7 D2 (rulings under the signature) | **fixed**: per-entry hashes in `entries`; `--rulings-only` refuses on a signed card; precritic runs `--check-signed` |
| r7 N1 (`--strict` a condition of clean) | fixed (rule 0b, CLAUDE.md) |
| r7 N2 (`--report-only` on INCOMPLETE) | fixed (header l. 47) |
| r7 N3 (sub_1m_regroup owner line) | open (N5 above) |
| r7 N4 (siblingCompare "nothing ran") | open, minor: still "no printed matrix row with findings to compare" without a row count |

The 5 pilot checks (sibling-compare, slot-clip, phone-card, card-rulings, card-not-offered) would now score 9 / 9 / 8 on their own.

## Per-round findings: the automatic check for each

| Finding | Check that would have caught it |
|---|---|
| D1 | precritic "every domain" smoke: each new gate on one approved skill per domain, PASS or N/A required |
| D2 | precritic plan self-test: every backtest row's (skill, role) pair is planned by `--skill <skill> --dry-run` |
| D3 | backtest rows of kind fixture/SEEDED must name `realPair` (or why none); the lint flags a seeded row whose defect has a real pair |
| N1 | spec-card self-test: a member named only in a comment is not a data source |
| N2 | every tool's self-test: an unknown `--skill` is a usage FAIL |

Speed-ups the round revealed:
- Run the backtest rows in the background while reading the code. The node rows take < 10 s; only the browser rows cost time (525 s in all).
- The "every domain" smoke is a cheap node-only first pass that would have caught D1 in 5 s.

## To pass round 2

1. D1: N/A for skills that deal no operands, with a self-test and a backtest row.
2. D2: lint the lane skill's own lesson page in precritic `--skill` (L and S), with a plan self-test.
3. D3: either the D8 predicates with a 27577cf / ff471fd row, or a recorded lead decision.
