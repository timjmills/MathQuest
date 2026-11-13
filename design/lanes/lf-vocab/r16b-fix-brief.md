# lf-vocab r16b fix brief: gates red after r16 (2026-11-13). Rule 0b: the r15+r16 critic PASS is void until these are green.

Branch: claude/lf-vocab-r16 (head 9fa898ed). Step: fix a regression (Opus MEDIUM). Under the owner's FOCUS rule, this is
the only work: make the gates green, then the deploy head goes to the lead.

The final gates on 9fa898ed found:
1. **CL-4b L-TOPSTART regression (r16).** On Match 3 cells at L, the first printed row starts 3.4-10.7 mm below the top
   pad. ws-options-verify --render fails for vocabGrade 1/2/4 and vocabSet 4/5/7/8/10 at L (0 → 2-6 findings), and
   print-lint --kind lesson L ratchets up by 1 count. The likely cause is r16 item 1 (V-LETTER, 0defd42f) or item 4
   (V-CAPTION, 9878b2a62). Bisect it.
   - Fix: the content starts at the top of the box (CL-4b, owner ruling 2026-10-23), and the letter stays at the top-left
     anchor (V-LETTER must still pass).
   - Check: L-TOPSTART already exists. Add a backtest row that FAILs on 9fa898ed and PASSes on the fix (browser row,
     ws-print-lint or ws-options-verify on vocab_grade_pictures at L with a failing value). Add a CHECKS_FROM_CRITICS row.
2. **V23: 36 pupil hashes differ** (ws-vocab-unit --browser). r15 pinned on a3eb9d25 (ade0824c8), and r16 never re-pinned.
   AFTER fix 1:
   - prove the cause: run the V23 hashes on 7d720ad3, the r15 head, which must match the pins;
   - list which r16 commit moves which pages;
   - re-pin, with a note in design/status/lf-vocab.md.
   If any moved page is NOT explained by an r16 drawing change (e.g. master markup), say so. lf-checks asked for this
   distinction.
3. **ws-empty-band --slot-ink off: FAIL (3)** standalone on 9fa898ed (inside precritic the critic band passed). Run it
   alone, read the 3 findings and fix them, or show they are the known pinned ones.
   Command: `node tests/scripts/ws-empty-band.cjs --skills vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --slot-ink off`.

Then run every gate, one at a time:
- ws-vocab-unit, plus --browser;
- ws-next-box;
- both ws-empty-band modes;
- ws-boot-smoke;
- ws-options-verify --render for both skills;
- every r15/r16 backtest row plus the new one;
- precritic --strict on both skills.
Only sibling-compare and the ruled ws-screen-ink-size SIZE-REF findings may fail.

Wait until no `ws-precritic` process is running before your first browser run (`pgrep -f ws-precritic`).

## Rules
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after EVERY commit.

Report: the cause of each failure, the fix commits, the backtest row, the V23 cause table, and the final gate lines.
