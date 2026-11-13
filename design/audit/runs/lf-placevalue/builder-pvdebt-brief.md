# lf-placevalue builder — pv debt (lead 2026-11-13; Opus medium: rebuild of work a check now fails)

Branch `claude/lf-placevalue-w2` (HEAD after 6062b0d4). Commit after EACH fix with a message ending in
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP`,
push (`git push -q origin claude/lf-placevalue-w2`). Spend cap ~$16. Never edit design/STATUS.md; never run ws-stamp-assets /
ws-chromebook-perf; CSS additive only; browser gates one at a time via `tests/scripts/mq-browser-run.sh`; `node --input-type=module
--check < file.js` on every JS file you change. Do not launch sub-agents.

**The measure:** lf-checks' pixel-accurate `ws-empty-band` (commit 1c64a449, branch origin/claude/sweet-newton-c8wrv1-lf-checks) — NOT the
copy in this tree. A worktree of it exists at
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/wt-lfc`; run it from there against this tree:
`cd <wt-lfc> && MQ_ROOT=/home/user/MathQuest bash tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill <k> [--opts <json>] --roles independent,more-practice,test,review --hosts none --no-baseline --report-only`

**The four items (each red on the pixels; their backtest rows pv-combine-side-band, pv-unit-form-rename-side, pv-unit-form-rename-margin are red):**
1. `placevalue:combine` — EB-BAND 140 (independent S cells ~37 %, 12 mm under the ink of a 32 mm cell); also the side band at S.
2. `placevalue:unit_form` at S — EB-BAND 302 at 32.5 %.
3. `placevalue:unit_form` `{"rename":"more"}` — the side band and the 3-point margin (`--margin 3` with this tree's flag semantics if the
   lf-checks tool has it; otherwise report the worst side % and it must be <= 27 %).

The same class was just fixed for `composing:number_word_form` (`js/modules/sheet/cells/words.js` footprint: `inPlace`, `denseRoom`, `hardCap`,
columns capped by size so rows sit at the item's own height instead of being stretched to fill a capped page). The pv cells live in
`js/modules/sheet/cells/pv.js` (footprint near line 950: `inPlace`, `rowOnly`, `twoPart`, `wideIn`); read
`design/audit/LESSONS_LEARNED.md` lf-placevalue sections first. Do not change what the items ask (the skills already passed their critics):
only the geometry (rows / columns / cell padding / the space the frame takes), keeping digits at the size's own pt.

**Before you report:** for each item the pixel tool's EB-BAND / EB-SIDE result before and after at S / M / L; `ws-cell-checks --skills
placevalue:combine,placevalue:unit_form --card --card-opts` (this tree) no new OVERFLOW; `ws-detailed-lesson --check` and `--repeats`
(lesson 1) OK; `ws-lesson-baseline --all-lessons --check /tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/lb-master.json`
(say which lessons changed); boot-smoke OK. Reply: the fix commit per item, the numbers, anything not fixed and why, spend estimate.
