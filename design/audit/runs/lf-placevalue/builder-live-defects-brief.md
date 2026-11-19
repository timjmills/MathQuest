# lf-placevalue builder: live defects on passed skills (Opus medium, because this rebuilds after critic FAILs)

## Setup
- Branch `claude/lf-placevalue-w2` (head ffcba24b, deploy-ready).
- Do NOT disturb the deploy head. Work on a NEW branch from it:
  `git checkout -b claude/lf-placevalue-live1 ffcba24b`
  Push it with `git push -u origin claude/lf-placevalue-live1`.
- Commit after each step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Never force-push.
- Budget: about $35. Keep it lean, because rate-limit status is "allowed_warning". If you get HTTP 429, stop, push what you have, and report.

## Rules
- Print sizes are M and L only (owner: S is dropped). No 390 px.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check` on every JS file you change.
- Never edit design/STATUS.md.
- CSS changes are additive only.

## The rule for every finding (owner rule)
Each finding goes through these steps:
1. Write the CHECK first. It FAILS on ffcba24b.
2. Fix the code.
3. The check PASSES on the fix.
4. Add a backtests.json row and prove it with `ws-backtest --row`.
5. Put the check on precritic's path. The lf-placevalue opt-in rows in tests/fixtures/precritic/opt-in-rules.json run with `--skills <skill>`. `ws-precritic-plan` must report it OK.
6. Add a `design/lessons-first/CHECKS_FROM_CRITICS.md` row. The `ws-precritic-plan --checks-from-critics` sweep must show 0 failing lf-placevalue rows.

## Findings
Source: lf-roles critic r8b, `git show origin/claude/sweet-newton-c8wrv1-lf-roles:design/status/lf-roles/critic-r8b.md`, sections D2–D4.

### 1. D3 · composing:number_word_form Guided: the grey hint gives the answer away
- The hint reads `"twenty-six": 2 tens, 6 ones.`. PT §2.3 says the first try row's hint must be the problem's own first worked step holding NONE of its answer, as a gapped frame ("twenty means ___ tens").
- Check **GUIDED-HINT-LEAK**: rebuild the number from every place phrase in a hint. Fail when the hint names every digit of the answer.
  - Put it in ws-roles-unit if that fits, or as an opt-in in an existing pv check.
  - Run it at M / L on the Guided page, every band.

### 2. D4 · number_word_form Guided: "eleven" mixed into a page whose Steps read "tens word / ones word"
- PT §2.3 rule: one kind of problem per page.
- Check **GUIDED-ONE-KIND**: tag each item as teen, decade or two-word. Fail when a Guided page mixes kinds its Steps do not cover.
- Fix the Guided deal for this skill, or the Steps.

### 3. D2 · number_word_form Guided: EB-BAND in every cell
- Measured: M 35–50 %, L 35–49 %. 75 mm (M) and 102 mm (L) of the page is blank under the grid.
- The existing check `ws-empty-band --skill composing:number_word_form --roles guided --sizes M,L --hosts none --no-baseline` already FAILs 15 cells, so the check exists. Add the backtest row.
- Fix the pv words cell's Guided geometry, never shrinking the words. compare's fix offers patterns to reuse:
  - footprint `inkHMm`;
  - the CL-4d centring of a one-line cell;
  - tightRows;
  - Guided rows sized as pads + line.

### 4. placevalue:expand online-worksheet numerals at 18 px, under the 29 px worksheet floor
Source: lf-hosts critic, via the lead.
- Check: `ws-screen-slots --skills placevalue:expand`, and/or lf-checks' `ws-screen-ink-size`. Use whichever reports it.
- Fix it in the expand screen twin (screen-cell.js / the pv screen sizing). Print must stay byte-identical.

### Optional (minor, n3 / n6), only if cheap
- n3: "6" / "ones." orphan wrap on number_word_form. Join the number to its unit.
- n6: row-1 word misaligned by the tab keep-out (same as master).

### Out of scope
D1 (Guided fit counts rows at the measured height, not the drawn height: expand / unit_form M/L, combine L) is lf-roles' fit code. Leave it to them.

## Before you report
- These must be OK:
  - `ws-boot-smoke`
  - `ws-providers-unit`
  - `ws-words-checks`
  - `ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check` and `--repeats` (it deals number_word_form)
  - `ws-capacity-pin --check`
  - `ws-precritic-plan`
- Run `ws-precritic --skill composing:number_word_form --strict` once, and save it as `design/audit/runs/lf-placevalue/precritic-nwf-live1.md` with each red row marked pv / D3 / ruled.
- Report:
  - your commits;
  - each finding FIXED / NOT FIXED;
  - each check with its backtest row and PASS;
  - which passed pages changed (for the narrow critic);
  - your spend estimate.
