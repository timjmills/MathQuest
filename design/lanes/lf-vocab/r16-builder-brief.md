# lf-vocab r16 builder brief: the critic r5 nits as checks, plus the Match 3 review-L footprint (lead, 2026-11-13)

Branch: claude/lf-vocab-r16, cut from claude/lf-vocab-r15 (7d720ad3). Step: follow-on fixes on a deployed model (Opus
MEDIUM, owner rule). DEADLINE: land before 2026-11-14 13:00 UTC. Until then CHECKS_FROM_CRITICS line 31 fails the lead's
sweep.

Owner rule: every finding becomes an automatic check BEFORE its fix lands. For EACH item:
- a check that FAILs on master a3eb9d25 and PASSes on the fix;
- a tests/fixtures/precritic/backtests.json row that `ws-backtest --row` proves;
- the check on precritic's path (ws-vocab-unit, --browser or ws-next-box);
- a row in design/lessons-first/CHECKS_FROM_CRITICS.md.
Each item gets its own commit, pushed straight away.

Read design/lanes/lf-vocab/critic-r5.md ("Nit:" lines and the score notes).

1. **Letter anchor.** On Match 3, the picture letter A/B/C sits at the same anchor (top-left of its picture box) on every
   picture, whatever the picture's height, in print and on card-1280.
2. **card-390 Match 3 boxes.** The letter boxes align in one column (same x), as worksheet-1280 already does, not following
   the centred words.
3. **Repeated pupil name.** No Error Analysis page repeats a pupil name ("Mia wrote" twice) while unused names remain.
4. **Caption size spread.** The captions in one picture row print at one size, within 1 pt (e.g. "2 × 3 = 3 × 2" at
   13 pt beside "5 × 1 = 5" at 20 pt). Content never shrinks to fit.
5. **Guided answer-line y.** On a Guided pick3 row, the answer lines sit at the same y in every cell of the row.
6. **Guided row equality.** Guided rows are equal height at S/M/L on both skills. Check whether V18+ already holds this; if
   it does, cite it and add only the backtest proof.
7. **Match 3 review L EB-FOOT.** The cell draws 57.7 mm against a 50 mm footprint. Fix the footprint or the drawing so
   EB-FOOT passes, and REMOVE the r15 pin from design/audit/baselines/empty-band.json (97a5962d). The backtest FAILs on
   7d720ad3 with the pin removed.

When all items land, update CHECKS_FROM_CRITICS line 31 (the "8 r5 nits" row) with the check ids and backtest rows. Add the
EB-FOOT review-L row as well.

## Gates (one at a time, after the LAST fix)
- ws-vocab-unit and --browser: re-pin V23 only for the pages your changes move, and list them with their cause.
- ws-next-box.
- Both ws-empty-band modes, with no lf-vocab pin left.
- ws-boot-smoke.
- ws-backtest --row for every new row.
- precritic --strict on both skills. Only sibling-compare and the ruled SIZE-REF findings may fail.
- Render the changed pages, for the critic, into
  /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r16/:
  - Match 3 independent, review and error-analysis at S and L;
  - pick3 guided at S, M and L;
  - card-390 and card-1280 for both skills.

## Rules
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after EVERY commit (`git push -u origin claude/lf-vocab-r16`).
- Append an r16 section to design/status/lf-vocab.md.

Report:
- a per-item table (item | check id | backtest row fail → pass | on precritic's path | ledger row);
- the gate lines;
- the commits;
- the V23 re-pins;
- the render paths.
