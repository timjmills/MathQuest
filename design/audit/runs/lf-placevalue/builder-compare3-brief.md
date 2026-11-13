# lf-placevalue builder compare r3: lead ruling on centring, then the last pv reds (Opus medium)

## Setup
- Branch `claude/lf-placevalue-w2` (head 023cafca). Work in this tree.
- Commit after EACH step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then run `git push -q origin claude/lf-placevalue-w2`. Never force-push.
- There is no $ cap, but do not run the full precritic more than twice. Run single gates while iterating, and never edit files while a long gate is running.

## Rules
- Never edit design/STATUS.md.
- Never run ws-stamp-assets or ws-chromebook-perf.
- CSS changes are additive only. Shared registries are append-only.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check < file.js` on every JS file you change.

## Read first
- `design/audit/runs/lf-placevalue/precritic-compare-r3.md`
- `design/audit/runs/lf-placevalue/critic-compare1.md`
- WORKSHEET_DESIGN_STANDARD CL-4 / CL-4b / CL-4c (lines ~365-371)
- `tests/scripts/ws-print-lint.cjs` L-TOPSTART (~line 999)

## 1. Lead ruling 2026-11-13: CL-4b stretch exception
A cell starts at the top unless its row stretches it by 30 % or more; then it is centred. A one-line in-place compare cell in a PAGEFILL row is exactly that case.

What to do:
- Record the ruling as **CL-4d** in WORKSHEET_DESIGN_STANDARD. Append it after CL-4c, citing "lead, delegated approval, 2026-11-13".
- (1) Centre one-line cells whose row is at least 30 % taller than their content. Use an opt-in footprint / attribute, starting with compare; do not apply it to every skill. Then remeasure the pixel EB-BAND on compare independent / more-practice (was 144 / 72):
  ```
  cd /tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/wt-lfc && git pull -q
  MQ_ROOT=/home/user/MathQuest /home/user/MathQuest/tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:compare --vocab-ink --page-fill --margin 2 --no-baseline [--roles ... --sizes ... --hosts none]
  ```
- (2) Fix L-TOPSTART so it applies the stretch exception: measure content height against row height. Required behaviour:

  | Cell | L-TOPSTART |
  |---|---|
  | stretched (≥ 30 %), centred | PASS |
  | stretched, top-start, with a band ≥ 30 % | FAIL |
  | unstretched, centred | FAIL |

  - Add self-test cases if the tool has a self-test.
  - Add a backtest row. Use real commits where possible: the fail state is a stretched top-start compare cell (023cafca), the pass state is your fix. Add a row for the "unstretched centred = FAIL" case too.
  - Put the rows on the lf-placevalue opt-in path.
  - L-TOPSTART lives in ws-print-lint (last touched by lf-engine-land). Carry the patch here; I will send it to its owner. Report the exact hunk.

## 2. coverage single/ex-group L PAGEFILL
A 48 mm strip (21 %), new in r2. The cause is unconfirmed. Find it and fix it. Its check is coverage-matrix `--red-no-baseline PAGEFILL`, already on the path; add a backtest row (fail 023cafca → pass fix).

## 3. Lesson S, Guided row 2
30.0 % (H13-ABS at the limit; the we-do rows split the Steps panel height). Clear it with a margin of at least 2 points.

## 4. Guided Model reserve bands
25 bands remain on compare guided: the Model row reserve and `HINT_MM`. lf-roles fixed their part in 8307219c (tightRows keep their measured height). The rest is pv: compare's measured height carries about 6–7 mm of pad around a one-line compare (22 mm cell, 15 mm ink), and the hint row reserves more than a one-line hint needs.
- Trim compare's template / measured heights. Never shrink the digits.
- Measure with lf-roles' fix in a SCRATCH worktree: `git worktree add <scratch> 023cafca`, then `git merge origin/claude/sweet-newton-c8wrv1-lf-roles` inside it. Never merge it into this branch.

## Before you report
- One precritic run: `node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict`. Save it as `design/audit/runs/lf-placevalue/precritic-compare-r4.md`, with each red row marked pv or D3.
- The pixel ws-empty-band compare totals, before (023cafca) and after.
- These must be OK:
  - `ws-boot-smoke`
  - `ws-providers-unit`
  - `ws-code-snapshot`
  - `ws-lesson-unit`
  - `ws-capacity-pin --check`
  - `ws-detailed-lesson` lesson 1 `--check` and `--repeats`
  - `ws-print-lint --source kit` for combine / unit_form / expand / identify / value at S/M/L: no new L-TOPSTART findings anywhere.
- Report:
  - your commits;
  - each item FIXED / NOT FIXED (why);
  - the checks with their backtest rows and PASS;
  - the L-TOPSTART hunk;
  - your spend estimate.
