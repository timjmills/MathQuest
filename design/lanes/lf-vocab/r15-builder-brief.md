# lf-vocab r15 builder brief: the three critic r14 minors (lead, 2026-11-13). Vocabulary is deployed on master a3eb9d25.

Branch: claude/lf-vocab-r15, cut from master a3eb9d25. Step: follow-on fixes on an approved, deployed model (Opus low).
The lane's manifest is part of master now; ws-integrate is a no-op.

Read design/lanes/lf-vocab/critic-r14-narrow.md, then:
- js/modules/sheet/graphics/vocab-pictures.js (PIC_FEAT, VOCAB_DEFS, the readers, the key underlay code);
- js/modules/sheet/lesson-pages/vocab-words.js;
- js/modules/gen-vocabulary.js;
- tests/scripts/ws-vocab-unit.mjs.

Each item gets its own commit and push, a check, and a backtest row. The row FAILs on a3eb9d25 and PASSes on the fix.

1. **V-TWIN ones-cycle.** A run whose visible ones digits repeat (5, 10, 15 → 5, 0, 5), or whose step divides 10, draws a
   `ones-cycle` feature that satisfies "cycle". The check FAILs set 6 {product, sequence, cycle}.
   Fix: draw sequence as a run whose ones digits do not repeat (e.g. 4, 7, 10, 13) and update its explain line, OR make
   sequence and cycle notWith and re-pick set 6 in place. Pick the option that keeps set 6's trios clean.
2. **Key underlay lint.** Every key underlay must sit inside its focal group's outline (+0.5 mm). A `focal: 'all'` underlay
   that covers more than 60 % of the picture is flagged. The lint FAILs the hundred chart key (set 4 pick3).
   Fix: clip each underlay to its cell, or draw it on the cell rectangle, so no white specks show. Give the hundred chart
   one row as its focal part.
3. **Page repeat lint.** No two items on one page may match the same pictures to the same letters. FAIL on set 5 Match 3
   page 1. Fix: when a trio repeats on a page, shuffle its picture order too.

## Gates (run them one at a time)
- ws-vocab-unit and --browser: re-pin V23 only for the pages that move, with their cause.
- ws-next-box.
- Both ws-empty-band modes.
- ws-boot-smoke.
- ws-backtest --row for each new row.
- precritic --strict on both skills, after the LAST fix. Only sibling-compare, plus the 4 ruled SIZE-REF findings
  (design/status/lf-vocab.md "Known findings"), may fail.
- Then run `node tests/scripts/ws-vocab-set-renders.mjs --since a3eb9d25 --out
  /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r15/sets`. Also render the hundred
  chart key.

## Rules
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after EVERY commit (`git push -u origin claude/lf-vocab-r15`). Containers restart.
- Append an r15 section to design/status/lf-vocab.md.

Report: a per-item table (item | check id | backtest row fail → pass | on precritic's path | rounds saved), the gate lines,
the commits, the V23 re-pins, and the render paths.
