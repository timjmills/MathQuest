# lf-placevalue critic pvdebt: narrow re-grade brief (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade only; do not fix anything. Hard limit: 20 minutes, about $6.
- AFTER = this tree, branch `claude/lf-placevalue-w2` at cbbbdade. Do not pull.
- BEFORE = `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/wt-before` (16014137), read-only.
- Earlier grades stand for every page not listed. These skills had passed (`js/modules/redesign-passed.js`).
- Read `design/audit/RUBRIC.md` (C1–C4, and the caps on them) first.

**What changed** (commits 668f6a8c, 1f18505d):
- A new footprint flag, `tightRows`, is set on:
  - combine's ghost-frame rows;
  - unit_form's standard rows and rename rows;
  - expand's rows.
- With `tightRows`, a row is held to the height of its ink on every role: `layout.js` has no 0.82·G fill floor; `practice.js` never spreads these rows; `review.js` bands keep their rows' own height; `test.js` no longer sets `fill` on a 1-column Test that P-23 cut. The spare height now sits under the grid.
- Write lines are longer:
  - combine at S: +2 digits, or +1 in a full-width row;
  - unit_form rename rows at S: +4 digits.
- Item text and digit sizes are unchanged.

**What to grade.** Render AFTER, and BEFORE only where you need a comparison, with `node tests/scripts/ws-grade-render.cjs --roles ... --size S|M|L --skills ...`. See `--help` for the options.
- Write output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-pvdebt/{after,before}/`.
- Run one browser command at a time, through `tests/scripts/mq-browser-run.sh`.
- For BEFORE, run the tool from inside the wt-before tree.

Pages:
1. `placevalue:combine`: independent / more-practice / test / review at S, M and L, each with its key.
2. `placevalue:unit_form`: the same roles at S, M and L. Also `{"rename":"more"}` on the same roles at S.
3. `placevalue:expand`: the same roles at S and L. Its rows changed as a side effect.
4. The `placevalue:combine` lesson (role `lesson`) at M and L, every page and its key. These are the 28 changed baseline hashes.

**What to look for:**
- Does the spare height now under the grid read as a deliberate page, or as wasted space? Is it better or worse than BEFORE's stretched rows?
- Is each row's spacing still generous enough for writing (WORKSHEET_DESIGN_STANDARD cell geometry)?
- Is the longer write line ever a giveaway, or ever too short for the answer?
- Do the keys still match their pupil pages?

A pixel measure (`node tests/scripts/ws-empty-band.cjs --skill <id> --roles <r> --hosts none --no-baseline`) is available if you want numbers.

Lead D3 still holds: engine and role layouts are graded and recorded as ENGINE-ROLES, but are not held against pv. Known and not in this round:
- combine review S: the expand cells in its Mixed Review band sit at 27 % side band;
- the old unit_form OVERFLOW in its lesson {rename:more} and reason-it pages.

**Write** `design/audit/runs/lf-placevalue/critic-pvdebt.md` with:
- a grade table (skill × role × size → C1–C4);
- before vs after notes;
- the findings;
- `VERDICT: PASS` / `FAIL` for each of combine, unit_form and expand;
- the PNG paths you graded.

Edit no other file.
