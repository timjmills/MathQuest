# lf-placevalue (number sense + words): take over the lf-vocab deploy-2 head. Fix master's failing gates only (Opus medium)

## Setup
- Worktree `/home/user/mq-vocab`, branch `claude/lf-placevalue-vocab-deploy`, made from `claude/lf-vocab-deploy-2` @ 3cce171d. That head is critic-passed: lf-vocab r15 + r16 + r16b.
- Push only this branch: `git push -u origin claude/lf-placevalue-vocab-deploy`. Never force-push.
- Commit after each step. End every message with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
- HARD budget about $40. If you near it, stop, push and report. On HTTP 429, stop and push.
- Never edit design/STATUS.md.
- CSS changes are additive only.
- Sizes are M/L only. No 390.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.

## Read first
- `design/status/lf-vocab.md`, the sections "Deploy-2 fixes" and "Deploy-2 head and budget stop". They hold the exact red list and its causes.

## Steps
1. Merge current `origin/master` (7f2ca5e39 or newer).
   - Keep both sides.
   - For backtests.json and opt-in-rules.json, take master's text and append our rows.
   - Run `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures --strict` and the same for `vocabulary:vocab_pick3_words`. Save both outputs as `design/audit/runs/lf-placevalue/precritic-vocab-d2.md`.
2. Fix ONLY what master's gates fail. The lead named four. For each one: write the check first, then add a backtest row that FAILs on 3cce171d and PASSes on your fix, then put it on precritic's path and add a CHECKS_FROM_CRITICS ledger row.
   - (a) **no-phone-width:** a 390 px default in this lane's tools or briefs. Run `node tests/scripts/ws-no-phone-width.mjs` and drop it.
   - (b) **TARGET:** the worksheet-820 vocab letter box is 46 × 46 px; it needs ≥ 48 px of hit area. The global rule `.mq-scell .mq-cellbox:has(> input.mq-cellslot)` (min-height 50px) may not match this box, so extend it additively or add a vocab rule. Gate: `ws-grade-render --gate --quiz-builder --skills vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words`.
   - (c) **FIX-WORDS:** the Match 3 Error Analysis "Fix it" line prints the three bank words, and the rule reads that as giving the answer. Make the Fix-it frame name the task, not the answer words, the same way unit_form's G5 was fixed. Gate: `ws-fixit-words`.
   - (d) **EB-BAND ≤ 28 %** on Match 3 independent L: bands are 28.1–28.2 %. Gate: `ws-empty-band` on vocab_grade_pictures, independent L. Clear 28 % by about 2 points without shrinking pictures or words.
   - If any OTHER gate is still red after the merge (SCREEN-DIGIT numerals inside the pictures, phone-card, next-box under precritic, sibling-compare), do NOT fix it. List it with its cause and whether master has it too.
3. The 30-skill passed-page check must show no passed skill changes outside vocab. Run `ws-role-sweep.cjs`; this tree may not have it, so copy it from origin/claude/lf-placevalue-live2 for the run only, uncommitted. Compare against master on the changed roles, plus `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check design/audit/baselines/lesson-baseline.json`. If lesson pages change, explain every change; re-pin only explained ones, naming them in the commit.
4. Gates:
   - `ws-boot-smoke`, `ws-code-snapshot`, `ws-redesign-passed`, `ws-vocab-unit` and `--browser`, `ws-next-box`;
   - `ws-precritic-plan`, which must show 0 ledger fails for this lane;
   - `ws-no-phone-width`.

## Report
- the head;
- each of (a)–(d) FIXED / NOT FIXED, with its check, backtest and PASS;
- the changed pages, for a narrow critic;
- other reds left, with their causes;
- your spend.
