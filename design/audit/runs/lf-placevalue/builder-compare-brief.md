# lf-placevalue builder: placevalue:compare to 8/10, plus the F1 check

You are on Opus medium, because this is the first build of compare on the kit to the 8/10 bar (CLAUDE.md "Agents").

Setup:
- Branch `claude/lf-placevalue-w2` (head a837b8d4). Work in this tree.
- Commit after EACH step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then run `git push -q origin claude/lf-placevalue-w2`.
- Your spend cap is about $22.

Rules:
- Never edit design/STATUS.md.
- Never run ws-stamp-assets or ws-chromebook-perf.
- CSS changes are additive only. Shared registries are append-only.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check < file.js` on every JS file you change.
- Never force-push.

**Read first:**
- `CLAUDE.md`, the design contract section.
- `design/audit/LESSONS_LEARNED.md`: the PRE-FLIGHT checklist.
- `design/cards/pv/pv.md`: the signed card. PV-04 is compare. Step 5 is "far, same length → close → different lengths; '=' one item in six". M6 is its misconception.
- `js/modules/gen-pv.js` `genCompare`; `js/modules/sheet/providers/pv.js` `registerSkill('placevalue:compare'`; the compare template (grep `compare` under `js/modules/sheet/cells/`); its options in `js/modules/skill-options.js` (`placevalue:compare`: band, closeness, lengths).
- The pv-debt fix: commits 668f6a8c and 1f18505d. Its footprint flag `tightRows` holds in-place rows to their ink on every role. That is very likely the tool for most of the empty bands below.

**The red list:** `design/audit/runs/lf-placevalue/precritic-compare-r0.md` (precritic --strict on a837b8d4). It has 9 FAIL rows:
1. `ws-empty-band`: EB-BAND 254, EB-SIDE 5 (with `--vocab-ink --page-fill --screen-parity`).
2. `ws-print-lint --source kit` at M and L, independent and lesson at S and L: H13-ABS / GRID-EVEN-ALL. The lesson pages are not pinned and must be clean.
3. `ws-options-verify --render --bands --band-h13`: band=999999 at S (43 % band under the ink), band=99 at L (41 %).
4. `ws-screen-slots --screen-digit`: 3 new.
5. `ws-node-lint` WRONG-FITS-SLOTS / WRONG-FILL: 1.
6. `ws-sibling-compare`: 3 counts worse than the approved siblings.

Fix each pv-owned finding at its source: the template, the provider, the generator, or the lesson data in `js/modules/lessons/families/placevalue.js`. Where a finding is an engine / role layout (lead D3: test.js / review.js bands, the guided Model tab, the scripted-model / opener / error-analysis / reason-it / mixed layouts, lesson.js warm-up), record it and do not chase it. Never shrink content to fit; the digits keep each size's pt.

**Also build the F1 check** (lead-approved). On a one-page Test or Review, the white under the grid is at most one row's height, OR the page uses no more columns than the Independent page at that size. Steps:
- Make it an opt-in rule of `tests/scripts/ws-empty-band.cjs`, for example `--grid-foot`, rule EB-GRIDFOOT, judged with `--rule-skills`.
- Add a commit-pair row to `tests/fixtures/precritic/backtests.json`: fail = a837b8d4 (combine Test S, 4 columns, about 45 % white under the grid); pass = your fix commit. Append the row and keep the file's 1-space indent.
- Fix combine Test S / Review S / Review M so they pass. Likely fix: use the Independent page's column count.
- Put the rule on the lane's precritic path in `tests/fixtures/precritic/opt-in-rules.json` (lane `lf-placevalue`).

Every other new check you add follows the same pattern: a commit-pair backtest row (FAIL on a837b8d4, PASS on your fix; `node tests/scripts/ws-backtest.mjs --row <id>`) and a place on the lane's opt-in path.

## Before you report
- Re-run `node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict`. List every remaining red row and say whether it is pv-owned or D3 engine.
- These must be OK: `ws-boot-smoke`, `ws-providers-unit`, `ws-code-snapshot`, `ws-content-audit --skill placevalue:compare`.
- The detailed lessons must be unaffected: `ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check` and `--repeats` OK.
- `ws-empty-band` on combine / unit_form / expand (independent, more-practice, test, review; `--hosts none`) must still be OK.
- Reply with:
  - your commits;
  - each red row FIXED / NOT FIXED, with the reason;
  - each new check id, its backtest row, and PASS;
  - before → after numbers;
  - your spend.
