# Wave 0 lane B (process tools): independent critic, round 1

Critic profile: mq-opus-medium. Graded tree: `2c4c318` (branch `claude/sweet-newton-c8wrv1-wip-wave0-process`), lane commits `85f5078..HEAD`.
Graded against `design/IMPROVEMENT_PLAN.md` §1.1, §1.3, §1.4 (S3, S6, S7, S8, the spec card format, the gate table), §1.6.3 step 6, §1.6.6, §1.6.7 E5, §1.7 and §4.1–§4.3.

## Verdict: FAIL

| Criterion | Score |
|---|---|
| 1 Accuracy of the tally | **7** |
| 2 Usability of the tools | **7** |
| 3 Fidelity to the plan | **8** |

### 1. Accuracy of the tally: 7

**What I checked.** I drew 28 findings at random with seed 20261023, weighted so every group was sampled: G1 3, G2 3, G3 3, G4 3, G5 3, G6 4 and G7 9. I checked each one against its source report or `grades.jsonl`.

**Sample results.**
- All 28 defects exist and are open in the round given.
- Severity and `carried` are right on all 28.
- The class fits on 25 of 28 (D2).
- `rule_ids` are right on 26 of 28. Rows 2402 and 6695 carry `H4` because the reader copied the version's cap, not anything the defect cites (D1).
- **Full-row agreement is 23/28 (82 %).**

**Completeness.** I counted the open defects in six reports and found none missed:
- g1-oa1 critic-r2: 14/14
- MAP-critic-r1: 11/11
- steps-box-r1: 10/10
- chromebook-fit CRITIC-R3: 12/12
- wave1-C2 critic, round 4: defect 1 is present
- Y2-Y3-critic-r7: 14 rows for its systematic defects

For G7, I recounted every grade run as distinct (skill, defect text). The tally sits at or below that count. The rows that are left out are observations, "FIXED" notes and "inherits from the pupil page" duplicates. I spot-checked rows that looked missed (the regrade4 "ones" wrap, the broken story grammar, the figures-r8 repeated tally_chart question). All of them are in the tally, worded differently.

**Reproduction.**
- `merge.py` rerun in a scratch copy gives byte-identical CSVs.
- The class × report matrix matches `defect-findings.csv` cell for cell (0 mismatches).
- `metrics.py` reproduces §1 and §2 of `metrics.md`: 82.6 % / 80.5 % machine share, and rounds to PASS median 4, quartiles 2.25–6, range 1–15, over 36 lanes.
- `ws-wrm --report-only` reproduces the WRM baseline: 513/872 covered, 149 partial, 210 gap, 392 tagged, 162 proposals. `git status` stayed clean.

**Why 7.** The `rule_ids` column of the 5,832 grade-run rows is systematically wrong (D1). That column is what the card-coverage test reads. The hours and lane-week numbers cannot be checked from the repository (D4).

### 2. Usability of the tools: 7

**Commands that ran green:**
- `ws-spec-card --self-test` (25/25)
- `--index --check`
- `--check-coverage --all --require-findings` (it warns on H0, LR-4 and LR-6)
- `--template stack` (unchanged)
- `ws-status-index --self-test`, `--check`, `--owner-go --json` (it prints `[]`) and `--verify-lines 85f5078` (609/609 lines, byte-for-byte suffix)
- `ws-integrate --self-test` (26/26)
- `--dry-run`: green, 29 s, with ws-code-snapshot, ws-standards, ws-search-terms and ws-presets-unit green in both rebuilds
- `ws-boot-smoke: OK` and `ws-code-snapshot: OK`, with 722 codes
- `node --input-type=module --check` on all three scripts

`--check-signed design/cards/stack/stack.md` FAILs, as it should, because the card is unsigned. After all runs, `git status` was clean except for this report.

**Adversarial runs (scratch clone):**

| Tool | Case | Result |
|---|---|---|
| spec-card | rule text changed (AX-4) | caught by coverage and by `--index --check` |
| spec-card | cited RP-1 deleted from the card | caught |
| status-index | malformed and impossible-date go lines | caught |
| status-index | lane file edited, index not rebuilt | `--check` reports it stale |
| integrate | code reuse | refused |
| integrate | reorder after apply | refused by the ledger |
| integrate | second lane reusing a first lane's code | refused |

Holes found:
- `--check-signed` passes a signed card that is stale or hand-edited (D5).
- Coverage is matched by family, so it ignores the card's own multiplication skills (D6).
- The card's rule section is 17 KB, against the plan's 3–5 KB (D7).
- Unknown family ids are accepted on go lines (N1).

The READMEs are followable.

### 3. Fidelity to the plan: 8

What matches the plan:
- The card has the 9 sections and the `Signed:` line.
- The near-miss trigger is based on the minimum score: "every failed score is a 7 and no score below 7".
- The Q-S4 wording, the batch critic safeguards (20 %, a full grade when the code path differs), the order of checks in 6 steps, flakes logged and blocking on a second flake, and the 5 % (at least 10 pages) inheritance audit all match §1.3, §1.6.4 and §1.7.
- The integrator stamps only on an explicit `--stamp` and refuses to stamp in `--dry-run`, `--self-test` and `--preview`. Lanes are told never to stamp.
- STATUS.md is fully preserved.
- CLAUDE.md gains 2 lines.
- `git diff --stat 85f5078..HEAD` touches only lane-owned files plus the S7 rule texts.

What falls short:
- The dry run rebuilds 150 of 722 skills: every skill pinned from T6 on, which is every skill appended since the codes were frozen. That covers every skill a lane manifest could ever add, and step (f) shows the data alone is enough. So it meets the intent. But `DRY_RUN.md` never says why the 572 frozen skills are out of scope, and "rebuilds today's tree" overstates it (D8).
- The lane's own status file is stale (D9).

## Defects

**D1 · blocking · UNTRUE_TEXT · §1.3 (the card-coverage test reads "rule ids a critic cited"), §1.4 S8.** The G7 reader copies each graded version's `caps` onto every defect of that version as `rule_ids`.
- Row 2402 (baseline, number_line_add, card-1280): the defect "Instruction and input sit to the right" gets `rule_ids=H4`. H4 is colour or font (RUBRIC:170). The source defect cites nothing; the version has `"caps": ["H4"]`.
- Row 6695 ("Tiles wrap 4 + 2") is the same.
- 362 G7 rows carry H4 on a class other than INK_FONT. H13, with 704 rows, has the same pattern.
- **Fix:** in `tally-src/findings-G7.csv`, take `rule_ids` only from what the defect itself cites. Put version caps in a separate `caps` column. Re-run `merge.py` and `ws-spec-card --check-coverage --all`.

**D2 · minor · OTHER (class assignment) · `defect-classes.md`.** Class misfits in the sample:
- Row 137 (R-Y1 r2 U44, "nl_20 proposed though range 20 already draws it") and MAP-critic-r1 D7 (a duplicate proposal) are classed REPEAT. REPEAT covers the same problem twice on a page; these should be UNTRUE_TEXT or MISSING.
- Row 795 (a typo, "one a cell") is classed UNTRUE_TEXT; it should be PLAIN_WORDS.
- Row 1866 (a pinned step tab covering an answer box at 390) is classed CLIP_OVERLAP. `defect-classes.md` puts "sticky header over the answer" under VIEWPORT.
- **Fix:** add a scope line to REPEAT ("on a page or packet, not duplicate proposals"). Add a `merge.py` rule for the WRM duplicate-proposal pattern, or re-class in a new group file.

**D3 · minor · UNTRUE_TEXT · S8 "class × report".** `wrm-tagging/Y5-critic.md` has findings in rounds 1 and 2 (21 and 13) but only one report row (round 3, `n_open` 46). So rounds 1 and 2 have a blank verdict in `defect-tally.csv`: 219 rounds against 217 report rows. Also, wave1-E round 1 keeps `n_open` 11 after `merge.py` drops the 6 superseded rows; 5 are counted.
- **Fix:** give each round of a file that holds several rounds its own report row. Recompute `n_open` after the drop rules.

**D4 · minor · PROCESS · S8 ("counted from STATUS and git history"), §1.1.** The hours table and the lane-week counts in `metrics.md` §3–§4 rely on a full clone, which is not in the repository, and on "a scratch script (git log + regex per lane)" that was not committed (metrics.md §3, last bullet). They cannot be reproduced from the tree. I could not verify them: cloning the remote was refused in this session.
- **Fix:** commit the lane-regex helper to `tally-src/` (for example `hours.py`) with its raw output, as `metrics.py` already does for §1–§2.

**D5 · blocking · MISSING · §1.3 (the card-coverage test "runs again against the current rule-id index when each build starts"), §1.4 S3 (the build starts only after signing), README "the build-start gate".** `--check-signed` checks only the last line. Scratch clone:
- AX-4 edited in WORKSHEET_DESIGN_STANDARD.md, then the card signed: `ws-spec-card: OK — … Signed: owner, 2026-10-23`, although coverage FAILs on the same card.
- Line 204 (RP-1) deleted from a signed card by hand: `--check-signed` still OK.
- `Signed: owner, 2026-99-99`: OK.

A lane that runs the documented build-start gate alone starts on a stale or tampered card.
- **Fix:** make `--check-signed` also run the coverage and rule-sha checks for that card. Store a hash of the generated body in the machine block and compare it. Validate the date.

**D6 · minor · MISSING · §1.3 ("rule id that a critic cited for that family").** `design/cards/stack/card.json` has `findingsMatch.families` = addition and subtraction. The card itself lists 6 multiplication skills: `mult_2by1_column`, `mult_2by2_standard`, `mult_3by1_column`, `mult_missing_digit`, `multiply`, `mixed_multiplication`. Adding multiplication to the match makes coverage FAIL with 3 missing ids (for example TY-10a). Matching by family is also too broad: it pulls in `countby-arrows` and the word-problem findings. 6,951 of 7,878 findings (88 %) have an empty `template` column.
- **Fix:** match findings by the card's own skill keys (the `run` column holds `cat:skill` for G7 rows, `family` for the others). Derive the families from the skill list, not by hand.

**D7 · minor · OTHER · §1.2 row 8 ("builders read 3–5 KB of the right rules"), §1.4 (≈ 10 k tokens).** `stack.md` is 39,329 bytes. Section 4 (rules) alone is 17,013 bytes, against 3–5 KB. The whole card is about 10 k tokens, so the token target is met, and it is about 19× smaller than 740 KB. It does not defeat the purpose, but the rules part is 3–5× the plan.
- **Fix:** lower the `chars` caps in `ruleGroups`. List "Also cited in the template source" as ids only, unless the rule is in a group.

**D8 · minor · UNTRUE_TEXT · §1.6.6 ("a dry run that rebuilds today's tree").** The dry run rebuilds 150 of 722 skills: `--cut T6`, 36 real skills plus 114 presets. `DRY_RUN.md` and `README.md` say "rebuild today's tree" without saying why the 572 skills in the frozen tables are excluded. They are frozen history that no manifest can add.
- **Fix:** add that sentence to `DRY_RUN.md` and the README "The gate". Otherwise, show that `--cut` at the first code also rebuilds.

**D9 · minor · PROCESS · S6.** `design/status/wave0-b.md` still says "S8 defect tally in progress … Next: S3 spec cards, S7 process rules, E5" after all of them were committed (2771316…2c4c318). The generated STATUS index shows the lane as `building` with 0 critic rounds.
- **Fix:** update the Now and Log sections at the lane's handover, then re-run `ws-status-index`.

## Nits

- **N1.** `Owner go: notafamily, 2026-10-23` is accepted and listed by `--owner-go --json`, and future dates are accepted. Validate the family against the SKILLS categories or families, and reject dates after today.
- **N2.** `--check-signed` accepts impossible dates ("2026-99-99"); see D5.
- **N3.** RUBRIC §6 adds the "Tag every finding" bullet, but the JSON example above it still has no `class` or `rule_ids` fields.
- **N4.** LR-4, LR-6 (V22 lesson rules) and H0 are warned as unknown on every coverage run. Either index the lesson-rule source or add an alias list, so the warning stays meaningful.
- **N5.** `metrics.md` says the shallow clone has "69 commits"; it has 71 now. The brief's "723 skills" is 722 codes per ws-code-snapshot.
