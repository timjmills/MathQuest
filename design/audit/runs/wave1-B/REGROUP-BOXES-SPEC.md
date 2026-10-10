# Regroup boxes must be filled (owner request 2026-10-10) — build with Lane B

Owner: "On regrouping make them have to put the numbers in the regrouping boxes too, and somehow indicate
that they need a number in that box as well. When the number goes in that box, if it's subtraction the
original numbers get crossed out, so 8 is crossed and 18 is written, and 7 is crossed in the tens and 6 is
written."

## Owner answers (2026-10-10)
1. **Mark only the regroup box(es).** On screen (practice card, online worksheet, quiz), the regroup / carry
   box(es) that the item actually needs are REQUIRED and visibly marked as needing a number (same yellow
   pulse / active-box treatment as the next answer box, plus a small cue). The pupil must fill them before
   the item counts as right. Boxes over columns that do not regroup stay as quiet scratch space.
   A per-skill teacher option (skill-options.js, appended, default = marked): `marked` (default) /
   `unmarked` (required, no hint where; ladder: "Did you regroup? Write the new number in the box.") /
   `optional` (today's behaviour). Share codes must stay stable (append the option, never reorder).
2. **Crossing:** when a subtraction regroup box holds the RIGHT new number (78 − 29: tens box 6, ones box
   18), the old top digit it replaces is crossed out live with one diagonal (same VA-23 strike as the Model
   cell). A wrong number in the box goes red like other wrong digits and crosses nothing. Addition: the
   carried 1, no crossing. Paper keys / Model pages keep today's behaviour (they already fill + cross).
3. **When:** next session, built together with Lane B (answer boxes, branch wip-af686f163db04a00a), which
   owns the same screen boxes (active-box order, per-digit marking).

## Today (code facts)
- `js/modules/sheet/cells/stack.js`: `regroupSlot` is `graded:false`, order 100+i, "never auto-focused"
  (VA-13 / SCC-T17); VA-10 draws a box over EVERY column so boxes reveal nothing; the subtraction ones box
  is `rg-wide` (two digits). `regroupWorking(p, t)` gives the right values + strikes (used by keys/Models).
- These rules (VA-10, VA-13, SCC-T17) change for screen hosts under this request: update
  WORKSHEET_DESIGN_STANDARD.md / SKILL_CELL_CONTRACT.md wording in the same change.

## Open design points for the builder (decide, note in STATUS)
- Caret order: regroup box BEFORE the digit of the column it feeds (subtraction: tens box + ones box
  first, then the ones answer), or the pupil's own order — follow how a teacher models it on paper.
- Grading: item right only when answer AND required regroup boxes are right; per-digit marks on the boxes.
- Every skill using the stack with regroup (add/sub regroup families, column multi) on all three hosts at
  1366x650 / 1280x600 with touch; paper unchanged.
