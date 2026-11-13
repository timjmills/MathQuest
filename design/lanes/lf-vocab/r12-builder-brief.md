# lf-vocab r12 builder brief (after narrow critic r11: FAIL, min 7). Lead approved, cap $12.

Step: a follow-on fix on an approved model (Opus low). Read design/lanes/lf-vocab/critic-r11-narrow.md, then the V-FEAT
code in js/modules/sheet/graphics/vocab-pictures.js (PIC_FEAT, VOCAB_DEFS), js/modules/sheet/lesson-pages/vocab-words.js
and tests/scripts/ws-vocab-unit.mjs.

## Items (commit and push each, each with a check and a backtest row FAIL on 8d955045 → PASS on the fix)
1. **V-STD (the root-cause check, ws-vocab-unit).** For every set, read its CCSS standard's text from
   data/standards/ccss-math.json, plus the descriptor or example. Any two of the set's bank words named together in that
   text must be notWith, or kept apart by V-FEAT. It FAILs on 8d955045 for product/multiple (4.OA.B.4).
2. **The fixes.**
   - product / multiple go notWith.
   - Add a VOCAB_DEFS alternative: multiple = boxed-answer + times-sign (use the feature names that exist).
   - Re-pick the trios in sets 0, 6 and 9 so V5/V7 pass. The critic's suggestion for set 6: {product, cycle, ones digit}
     and {multiple, sequence, repeat}; for set 9, move multiple into the compare / unknown trio.
   - Edit the sets in place; each set keeps its position.
3. **term notWith rule.**
4. **The caret.** Add additive CSS `caret-color: transparent` on wrong vocab slots, and make Check blur EVERY vocab slot on
   every card (worksheet and card). Extend ws-next-box NB9 to probe every card on the Match 3 worksheet and card hosts, so
   that both activeElement and caret-color are checked. It FAILs on 8d955045.

## Gates (run them one at a time)
- ws-vocab-unit and --browser: re-pin V23 only for the pages your changes move, and list them.
- ws-next-box.
- Both ws-empty-band modes on the two skills.
- ws-boot-smoke.
- ws-backtest --row for each new row.
- precritic --strict on both skills. Its known FAILs are sibling-compare and screen-support-eq; the second is a master
  tool false positive that the lead routed to lf-checks.
Then run `node tests/scripts/ws-vocab-set-renders.mjs --since 8d955045 --out
/tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r12/sets`.

## Rules
- NEVER commit js/modules/data.js, standards.js, search-terms.js, skill-codes-frozen.js, skill-presets.js,
  sheet/providers/index.js or design/lanes/applied.json.
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after every commit.
- Append a short r12 section to design/status/lf-vocab.md.

Report: per-item table (item | check id | backtest row fail → pass | on precritic's path | rounds saved), gate lines,
commits, V23 re-pins and their cause.
