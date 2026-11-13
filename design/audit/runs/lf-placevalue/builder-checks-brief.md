# lf-placevalue builder: checks pass (owner 2026-11-13, "save everything to automatic checks") + identify place-heads ruling

You are on Opus medium (`mq-opus-medium`).

## Setup
- Branch `claude/lf-placevalue-w2` (head fb05bcb1). Work in this tree.
- Commit after EACH step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then run `git push -q origin claude/lf-placevalue-w2`. Never force-push.

## Rules
- Never edit design/STATUS.md.
- Never run ws-stamp-assets or ws-chromebook-perf.
- CSS changes are additive only. Shared registries are append-only.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check` on every JS file you change.
- Do NOT change compare's layout. A lead ruling on CL-4d vs H13 is pending.

## The lead's rule (owner 2026-11-13)
Every finding from a critic, the owner or a lead ruling becomes an automatic check before its fix lands:
1. the check FAILS on the bad commit and PASSES on the fix;
2. a `tests/fixtures/precritic/backtests.json` row that `node tests/scripts/ws-backtest.mjs --row <id>` proves;
3. the check is on precritic's path: the lf-placevalue lane in `tests/fixtures/precritic/opt-in-rules.json`, or a default gate. `node tests/scripts/ws-precritic-plan.mjs` must list it OK;
4. a row in `design/lessons-first/CHECKS_FROM_CRITICS.md`, in that file's table format.

## 1. Ledger catch-up: one CHECKS_FROM_CRITICS row per lf-placevalue finding since 2026-11-09
Build the list from:
- `design/status/lf-placevalue.md` (Log and the findings → checks tables);
- `design/audit/runs/lf-placevalue/critic-nwf{1,2,3}.md`, `critic-pvdebt.md`, `critic-compare1.md`;
- the builder reports in the Log;
- the backtest ids starting `pv-` in backtests.json.

It includes at least:
- number_word_form N1–N12:
  - WORDS-WRONG-RATE, WORDS-STEPS-TRUE (ws-words-checks);
  - CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y (ws-cell-checks --words-rules);
  - EB-PARITY;
  - chant-box;
  - to_words side band;
  - the rowy-1000 row;
  - N12 "1 ones" (still open: give the reason, or build the plural lint).
- pv debt: the three side-band rows; tightRows.
- EB-GRIDFOOT (F1 of pvdebt) and the CL-2c teacher-columns tolerance.
- The capacity re-pin rulings (combine S 28→27, test S 20→18). These are rulings with no new check; ws-capacity-pin is the check. Say so.
- compare r1 F1–F6 rows:
  - pv-compare-thinking-bands, -eq-live, -close-depth, -mixed-1digit, -m6-wrong, -worked-step-does, -m6-shown, -eq-model, -state-marks, -chant-fit;
  - the pages3 / gridfoot / exgroup rows.
- compare r3 CL-4d: pv-compare-cl4d-stretched-top and -unstretched-centred.
- PT-ENG-6 middle-page ruling (25 %): a ruling with no check. Give the reason, or add a check.
- The A-over-B width read (lf-roles' check, ri-ink-inner): list it under lf-roles with "see lf-roles".

## 2. Ledger line 21: give each part a real check
The row is "unit_form worksheet host 32 % band; identify L warm-up EB-SIDE 31 %; vocab cell grows into freed height", and today it reads "none yet". lf-checks' sweep flagged it.
- Today's pixel ws-empty-band (`--hosts worksheet`, and the lesson role) may already measure the first two. If so, point at it and add backtest rows that FAIL on a commit that had the defect and PASS today, or on its fix. Find the commits with `git log -S` / the Log.
- If a defect is still present today, it is an open red. Record it as such, with its owner: hosts / lf-engine are D3.
- For the vocab cell growth: the proposed check is EB-BAND on `.mq-lvocabcell`; see whether `--vocab-ink` (EB-VOCAB) covers it.

## 3. Comma-role backtest rows
precritic `--role` rejects a comma list, so these rows are off the path (`ws-precritic-plan`: "--role test,review --dry-run failed: usage"). Find every pv row whose command passes `--roles a,b`, such as pv-gridfoot-combine-test-s and pv-gridfoot-teacher-cols.
- Either split each into one row per role (preferred: no shared code change),
- or, if precritic's plan derives `--role` from the command in a way that can take a list, fix the derivation in the smallest way and say so.
- Re-prove each row with ws-backtest.

## 4. Lead ruling (PEDAGOGY 4.1a, already recorded): identify's place heads
On `placevalue:identify`'s Review and Test (and Check / pre-skill-check), on paper AND on screen, drop the T/O place heads. The answer is the place name, and those pages are unaided.
- identify's own lesson Practice and Mixed keep them as taught support.
- Today the default support `labels` prints the heads on Review / Test. Make the support follow the role there.
- Check: a "name the place" item on Review / Test / Check with place heads = FAIL. Its backtest FAILs on current master (`git rev-parse origin/master`) and PASSes on your fix.
- The screen hosts: a quiz / worksheet set marked as a test or review, if the app has that notion. Otherwise state what "screen" means here and check it.
- Re-run ws-empty-band and ws-print-lint for identify at S/M/L on review / test; no new reds.

## Before you report
These must be OK:
- `ws-precritic-plan` (its count of rows off the path must not rise; name every pv row still off the path);
- `ws-boot-smoke`, `ws-providers-unit`, `ws-code-snapshot`, `ws-capacity-pin --check`;
- ws-detailed-lesson lesson 1 `--check` and `--repeats`.

Report:
- your commits;
- the ledger rows added (count, and any finding still without a check, with the reason);
- line 21 per part;
- the comma rows fixed;
- identify: the check id, its backtest and PASS;
- your spend estimate.
