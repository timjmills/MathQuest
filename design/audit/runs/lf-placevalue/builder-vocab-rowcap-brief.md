# lf-placevalue: vocab head + lf-engine rowcap stage 1 + master → ONE deploy head (Opus medium)

## Setup
- Worktree `/home/user/mq-vocab`, branch `claude/lf-placevalue-vocab-deploy` @ 31d41507 (plus this brief).
- Push only this branch. Never force-push.
- Commit after each step, ending each commit message with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
- HARD budget about $18. If you near it, stop, push and report. If you get HTTP 429, stop and push.
- Sizes are M / L only; no 390.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Never edit design/STATUS.md. CSS changes are additive only.

## Steps
1. **Merge `origin/master` (84f8813a1 or newer), then `origin/claude/sweet-newton-c8wrv1-lf-engine-rowcap` (3b0fdbcbb; code at 174c839be).**
   - lf-engine says merging 31d with master conflicted, and their builder applied the branch's JS diff onto 31d41507 by hand. Their proof PNGs are in `design/audit/runs/lf-engine-rowcap/match3-*-after-r2-31d41507+fix.png`.
   - Keep both sides.
   - For backtests / opt-in / ledger: take master's text, then append our rows.
   - Rowcap holds vocab-match3, lesson-vocab and count-row rows to their drawn height + 2–3 mm. Do NOT re-tune it; it is lf-engine's critic-passed code.
2. **EB-FOOT on Match 3 at L (critic r1 on rowcap).** Bring our vocab-match3 L footprint and floor in line with the drawn 52.5 mm, so EB-FOOT passes. Then confirm `ws-empty-band` EB-BAND passes on vocab_grade_pictures independent L; it was 28.1 % and is now 4 rows.
3. **vocab_grade_pictures L lesson now runs to 10 pages.**
   - Render pages 9–10 (`ws-grade-render --roles lesson --size L --skills vocabulary:vocab_grade_pictures`).
   - A near-empty last page fails, so rebalance it. The fix is either the lesson's own practice count or the pagination rebalance for this lesson's data, whichever is ours.
   - Check: L-LONE / PAGEFILL on that lesson. Write the check first, then add a backtest row (FAIL before the fix, PASS after) and a ledger row.
4. **Gates on the merged head:**
   - `ws-boot-smoke`, `ws-code-snapshot`, `ws-redesign-passed`;
   - `ws-vocab-unit` and `--browser`, `ws-next-box`, `ws-no-phone-width`;
   - `ws-grade-render --gate --quiz-builder` on both vocab skills;
   - `ws-precritic-plan` with 0 lane ledger fails;
   - `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check design/audit/baselines/lesson-baseline.json`. Re-pin only pages you can explain, and name them in the commit.
   - Skip the full precritic (about 70 min per skill). Instead run its fast gates on the two vocab skills: empty-band, print-lint kit, and role-cover if under 15 min.

## Report
- the head;
- each step FIXED / NOT FIXED;
- each check and its backtest;
- the pages changed (for the narrow critic), including lesson L pages 9–10;
- reds left;
- spend.
