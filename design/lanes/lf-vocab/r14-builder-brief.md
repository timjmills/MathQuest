# lf-vocab r14 builder brief (after narrow critic r13: FAIL, min 7; the defect list is COMPLETE)

Step: a rebuild after a failed critic (Opus medium, owner rule). Read design/lanes/lf-vocab/critic-r13-narrow.md, then the
V-NUM / V-TWIN / V-FEAT code in js/modules/sheet/graphics/vocab-pictures.js and tests/scripts/ws-vocab-unit.mjs, and the
sets in js/modules/sheet/lesson-pages/vocab-words.js (vettedTrios, dealtBanks).

First merge origin/master (8a7c5d43 or later) and re-apply the manifest: `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`.

## Items (commit and push each, each with a check and a backtest row FAIL on 905528f2 → PASS)
1. **Check: V-NUM single mark.** A single ringed or boxed number is a parity feature (marked-even / marked-odd). Test the
   boundary case: exactly one marked number. FAIL on set 8 {rule, odd, ones digit}.
   **Fix:** box an even ones digit (e.g. 47[6]) and update its explain line. Check that no set deals ones digit with even.
2. **Check: V-PLACE.** A ringed or boxed digit inside a number adds place:<ones|tens|hundreds>, which satisfies the words
   one / ten / hundred. FAIL on set 5 {digit, hundred, ten}.
   **Fix:** EITHER redraw digit so the marked digit has no place (a ringed digit on a 0-9 strip), OR make digit notWith one,
   ten and hundred and re-pick set 5 in place. Choose whichever keeps set 5's trios clean and its lesson taught.
3. **Check: V-TWIN over every run picture.** Read grow's counts from its tower heights: a run with a constant step implies
   rule. FAIL on set 7 {grow, repeat, rule}.
   **Fix:** grow declares rising-run + step:2; grow and rule become notWith; re-pick sets 7 and 8 in place so grow and rule
   sit in different trios.
4. **Self-check before you report.** For every remaining picture, check the boundary of every feature check (one mark, two
   marks, a digit in a number, a run of any kind). List any reading the model cannot express in the status file, so the
   critic sees it.

## Gates (run them one at a time)
- ws-vocab-unit and --browser; re-pin V23 only for the pages that move, with their cause.
- ws-next-box.
- Both ws-empty-band modes.
- ws-boot-smoke.
- ws-backtest --row for each new row.
- precritic --strict on BOTH skills, re-run after the LAST fix. Only sibling-compare may fail.
- Then run `node tests/scripts/ws-vocab-set-renders.mjs --since 905528f2 --out /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r14/sets`.
  It must include sets 5, 7 and 8 and the manifest dealt-banks table. Add the column of each picture's marked numbers and
  places (the critic's speed-up).

## Rules
- NEVER commit js/modules/data.js, standards.js, search-terms.js, skill-codes-frozen.js, skill-presets.js,
  sheet/providers/index.js or design/lanes/applied.json.
- Use git add with explicit paths.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after EVERY commit. Containers restart.
- Append an r14 section to design/status/lf-vocab.md and commit it early.

Report: the per-item table (item | check id | backtest row fail → pass | on precritic's path | rounds saved), the gate lines,
the commits, the V23 re-pins with their cause, and the render path.
