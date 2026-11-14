# lf-ops-ldiv status (2026-11-14, owner request: the long-division bracket is "disconnected")

PAUSED by the lead after step 2.

- Step 1 CHECK done: LDIV-JOIN = `node tests/scripts/ws-ldiv-hug.cjs --join [--skills ...]` (paper M/L pupil + key on
  independent/guided/review/test + fact-rows; screen card/worksheet/quiz at 1366 and 820). On precritic's path (gate
  `ldiv-join`), backtest row `ldiv-join` (3623be10c FAIL -> bf0814473 OK, ws-backtest PASS), ws-precritic-plan OK, ledger row.
  Master: worst gap 1.48 mm (paper 0.67-0.68, fact rows 0.33, remainder bracket bar break), worst step 0.26 mm.
- Step 2 FIX done (bf0814473): `bracketSvg()` in js/modules/sheet/cells/long-division.js (exported via sheet/index.js), used
  by long-division.js, ops-counters.js, area-model-div.js, long-multiplication.js and screen-cell.js. Head: gap 0.00, step 0.00.
- Not done: step 3 re-pin, step 4 hash proof (script written, not run to completion), step 5 gates.
  Known pre-existing: ws-ldiv-hug default run FAILs "quiz-1280 div_facts-mix: no bracket measured" on master too.
