# lf-ops-ldiv status (2026-11-14, owner request: the long-division bracket is "disconnected")

Steps 1, 2, 4 and the step-5 gates you asked for are done. Step 3: nothing needed re-pinning. precritic --strict was skipped on your instruction.

- Step 1 CHECK done: LDIV-JOIN = `node tests/scripts/ws-ldiv-hug.cjs --join [--skills ...]` (paper M/L pupil + key on
  independent/guided/review/test + fact-rows; screen card/worksheet/quiz at 1366 and 820). On precritic's path (gate
  `ldiv-join`), backtest row `ldiv-join` (3623be10c FAIL -> bf0814473 OK, ws-backtest PASS), ws-precritic-plan OK, ledger row.
  Master: worst gap 1.48 mm (paper 0.67-0.68, fact rows 0.33, remainder bracket bar break), worst step 0.26 mm.
- Step 2 FIX done (bf0814473): `bracketSvg()` in js/modules/sheet/cells/long-division.js (exported via sheet/index.js), used
  by long-division.js, ops-counters.js, area-model-div.js, long-multiplication.js and screen-cell.js. Head: gap 0.00, step 0.00.
- Step 4 hash proof (scratchpad ldiv/hash-proof.cjs, hash-table.txt): master 3623be10c vs head. 5 bracket skills x 14 roles x M/L
  pupil + key, screen card 1366/820 x 3 seeds: after stripping only the bracket svg and its vinculum styling, 0 renders
  differ (282 compared; roles a skill does not offer refuse identically on both sides). Controls add_facts, mult_facts, sub_facts,
  multiply: page and card byte-identical raw.
- Step 3 pins: none changed. The full lesson library was re-hashed (ws-lesson-baseline --all-lessons, M/L, seeds 4242 and 1):
  0 of 1772 hashes differ from design/audit/baselines/lesson-baseline.json.
- Step 5 gates: ws-boot-smoke OK, ws-code-snapshot OK (734 codes), ws-backtest --row ldiv-join PASS, ws-precritic-plan OK.
  ws-precritic --strict was skipped on the lead's instruction.
  Known pre-existing: ws-ldiv-hug default run FAILs "quiz-1280 div_facts-mix: no bracket measured" on master too.
