# lf-placevalue: vocab deploy blockers on claude/lf-placevalue-vocab-deploy (Opus medium, new week)

## Setup
- Worktree `/home/user/mq-vocab`, branch `claude/lf-placevalue-vocab-deploy` @ f5ae12001 (plus this brief).
- Push only this branch. Never force-push.
- Commit after each step, with these trailers:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
- HARD budget about $30. If you get HTTP 429, stop and push.
- Sizes are M/L only; no 390.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Never edit design/STATUS.md. CSS changes are additive only.

## Read first
`design/status/lf-placevalue.md`, the two newest Log entries (the vocab + rowcap head "NOT deploy-clean"), and the builder report summarised there.

## Steps
1. **Merge `origin/master`** (d38308824 or newer).
   - Keep both sides.
   - For backtests, opt-in and the ledger: take master's version and append ours.
   - If master already contains lf-engine rowcap (3b0fdbcbb), say so. In that case master's lesson pin already covers the rowcap-caused groups.
2. **Lesson baseline: no unexplained re-pin** (the "never re-pin an unexplained difference" rule).
   - f5ae12001 re-pinned a rowcap-caused group without rendering it: master's newer algebra / patterns lessons p2–p5, g3-oa9-input-output-rule p06/p08/p14/p22, and pick3 M p6 / L p7.
   - After the merge, take master's design/audit/baselines/lesson-baseline.json as the base. Re-run `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check`.
   - For EVERY group still differing, render it on both trees (master and this head) and attribute it: our vocab change, the pagesOf fix, or rowcap.
   - Re-pin only what you rendered and explained, naming the groups in the commit message. Anything you can't explain, report and do not pin.
3. **V23:** 14 vocab_grade_pictures pupil pins (independent / more-practice / test M+L, guided L) moved with the rowcap rows.
   - Render each one, confirm the change is the rowcap row height and nothing else, then re-pin those 14 in tests/fixtures/precritic/vocab-pupil-hashes.json, naming them.
4. **EB-PAGE:** vocab_grade_pictures scripted-model L p1 is 32 % empty (limit 30).
   - Find the cause. If it is our provider's worked-step count or the cell, fix it there (e.g. a second worked example, as PT-MOD ruled for facts). If it is the scripted-model engine, record it as D3 with evidence.
   - The check comes first. Add a backtest row and a ledger row.
5. **Gates:**
   - `ws-boot-smoke`, `ws-code-snapshot`, `ws-redesign-passed`, `ws-vocab-unit` and `--browser`, `ws-next-box`, `ws-no-phone-width`, `ws-precritic-plan` (0 lane ledger fails).
   - `ws-empty-band` on both vocab skills with lane flags at M and L.
   - `ws-grade-render --gate --quiz-builder` on both vocab skills.
   - The lesson baseline check.
   - Do NOT run the full precritic.

The `mixed-practice.js` `pagesOf` engine fix stays as it is; the lead is sending it to lf-engine for review.

## Report
- the head;
- each step's result;
- the exact list of pages that changed, for the narrow critic: vocab pages, plus the add_wp_10 L / two_step_letter_equation M Mixed pages moved by pagesOf;
- any reds left;
- your spend.
