# lf-vocab r13 builder brief (after narrow critic r12: FAIL, min 7). Lead approved, cap $12. Last round for now.

Step: a structural fix on an approved model (Opus low). Read:
- design/lanes/lf-vocab/critic-r12-narrow.md;
- js/modules/gen-vocabulary.js (`_compatiblePick`, the pick3 bank dealer);
- js/modules/sheet/graphics/vocab-pictures.js (PIC_FEAT, VOCAB_DEFS, vocabReadFeatures);
- js/modules/sheet/lesson-pages/vocab-words.js (the sets and their trios);
- tests/scripts/ws-vocab-unit.mjs (V5, V7, V-FEAT, V-STD).

## Items (commit and push each, each with a check and a backtest row FAIL on a35dbd72 → PASS on the fix)
1. **(a) Banks are dealt only from the vetted trios (the structural fix).** A "1 picture, 3 words" item deals its three words
   ONLY as one of its set's vetted Match 3 trios: the picture's word plus the other two words of a trio that holds it.
   - Every dealable bank of a set is then enumerable. Write a `dealtBanks(set)` export that lists them.
   - Make V7 judge EVERY bank `dealtBanks` lists, not a sample.
   - Write the list of banks per set into the ws-vocab-set-renders manifest.json, as a dealt-pairs table, so the critic
     reads every bank.
   - Check: V7-ALL. It FAILs on a35dbd72 for set 0 (row with even) and set 7 (first term with rule).
2. **V-NUM.** The numbers a picture rings or boxes become features: all-even → even, all-odd → odd (read from the SVG
   where possible, declared otherwise). Redraw "row" with a mixed ring (3, 6, 9, 12) and update its explanation if it names
   the numbers. FAIL on a35dbd72 (row ≈ even).
3. **V-FEAT times-table rule.** A times-table grid implies product, as it already implies multiple. Make product notWith
   row and column. FAIL on a35dbd72.
4. **V-TWIN.** Two pictures with the same feature class (e.g. a number run plus a step size) must have the same notWith
   list against the other words of the bank. Make first term / rule notWith. FAIL on a35dbd72 (term has rule, first term
   does not).
5. **Re-pick sets 0, 7 and 8 in place** (each set keeps its position, V7) so that every dealt bank passes. Use the escape
   hatch (`noPicture`) when no clean trio exists. If set 0 loses product, sets 1–3 still teach it.

## Gates (run them one at a time)
- ws-vocab-unit and --browser: re-pin V23 only for the pages that move, with their cause.
- ws-next-box.
- Both ws-empty-band modes.
- ws-boot-smoke.
- ws-backtest --row for each new row.
- precritic --strict on both skills. Its known FAILs are sibling-compare and screen-support-eq; the second is a master
  false positive.
- Then run `node tests/scripts/ws-vocab-set-renders.mjs --since a35dbd72 --out
  /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r13/sets`. If item 1 changes every set's
  banks, render ALL sets with `--since 6ae462d1`.

## Rules
- NEVER commit js/modules/data.js, standards.js, search-terms.js, skill-codes-frozen.js, skill-presets.js,
  sheet/providers/index.js or design/lanes/applied.json.
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after EVERY commit (containers restart).
- Append a short r13 section to design/status/lf-vocab.md, and commit it early. Update it as each item lands.

Report:
- a per-item table (item | check id | backtest row fail → pass | on precritic's path | rounds saved);
- the gate lines;
- the commits;
- the V23 re-pins and their cause;
- the render path.
