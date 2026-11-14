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

## Narrow critic r2 (2026-11-14): PASS 9 / 9 / 9 / 9 - report design/audit/runs/lf-ops/critic-ldiv-r2.md; F1 closed (LDIV-JOIN-RASTER, ba835be98). Ready for the deploy train.

## Narrow critic r1 (2026-11-14): narrow FAIL, one defect on one host
Report: design/audit/runs/lf-ops/critic-ldiv-r1.md. The corner joins as one stroke on every page and host. Scores 9 / 9 / 9 / 8.
- F1 (from master, missed by the check): a hairline break in the bar of the div_remainders card at 1366 (screen-cell.js ringCellHTML mq-rembrk). It is ledgered as the planned check LDIV-JOIN-RASTER.
- Stopped here at the owner budget stop. After the reset: check first (LDIV-JOIN-RASTER fails on 654606ae3), then fix (one overlapping bar span), then re-check this host, then onto the train.

## LDIV-JOIN-RASTER (ldiv critic r1 F1), 2026-11-14

- Check: `ws-ldiv-hug --join --raster` takes the central 1 px of every screen bar, from the arc's corner to the vinculum's
  end, at DSF 2 and 3. It covers card, worksheet and quiz at 1366, 1280, 1024 and 820. Any pixel brighter than 80 is a break.
  It is on precritic's `ldiv-join` gate. Backtest `ldiv-join-raster`: 654606ae3 FAIL → ba835be98 OK. ws-precritic-plan OK.
- Before (654606ae3), div_remainders bracket card and quiz at 1366 / 1280: 103 at DSF 2, 155 at DSF 3; 820: 0.
  The check also found the .mq-ldiv (div_facts long, div_facts_long) quiz at 1366 / 1280: 247 at DSF 2, 255 at DSF 3.
- Fix (ba835be98): ringCellHTML now lays a rule span over the svg bar. divisionHTML's path bar runs on under the dividend's
  border (bracketSvg `bar`, H12 → H13). The kit default is unchanged. No CSS change. After: the brightest pixel is 0
  everywhere, over 610 arcs.
- Re-hash of the screen cards against 654606ae3 (5 bracket skills + add_facts and mult_facts, 1366 / 820, 3 seeds): only
  bracket markup changed. div_facts and div_facts_long: H12 → H13. div_remainders: the added rule span. Everything else,
  controls included, is byte-identical. ws-boot-smoke OK.

## LDIV-SHAPE (owner 2026-11-14: "make it straight or almost straight")

- Check: `ws-ldiv-hug --shape` measures the bracket side's bow: its greatest distance from the chord, in mm, limit 0.6. It runs on
  precritic's ldiv-join gate (--join --raster --shape). Backtest `ldiv-shape`: 0176d774f FAIL → b7ee41f3a OK. ws-precritic-plan OK.
- Bows before (0176d774f): paper M 2.64, L 3.30 (long_div_2digit, div_facts long); remainder bracket M 1.60, L 2.04;
  screen card div_facts 2.59, remainder 3.06, worked bracket 5.04. After: worst 0.34 mm everywhere (610 arcs).
  LDIV-JOIN gap and step 0.00, LDIV-JOIN-RASTER brightest pixel 0.
- Fix (b7ee41f3a): `bracketLine()` in long-division.js. The side's apex stays at the old apex, so the hug is unchanged:
  ws-ldiv-hug's paper reference gap is still 0.53 em, and its default run has the same one pre-existing FAIL as before.
  The bow is 0.25 units of a 10-wide box. The white the bow gave up goes to the divisor's side. ARC-INK is clean at M and L.
- Hash proof (base = 37ca028e6 with the fix reverted): with the bracket svg and its rule offset stripped, 0 of 282
  renders differ. Controls are byte-identical. ws-boot-smoke OK. Merged origin/master e9cb5797c, keeping both sides.

## LDIV-ROOM (owner 2026-11-14: "a lot of white area to work with" on the 4-a-page long-division page)

- Check: `ws-ldiv-hug --room` (gate ldiv-room, backtest ldiv-room: d82acc06f FAIL -> 86950d488 OK). Before: grid 45 % (M) / 56 % (L)
  of the free height at 1.00x rows, 25.3 / 20.5 mm white above and below. After: M 93 % (rows 1.87x), L 94 % (1.54x),
  centred (5.4 / 5.4 mm); 6 a page unchanged (rows 9.0 mm, 71 %).
- Fix: practice.js grids carry roomFill; answer-key.js partRoom hands the division template ctx.room; long-division.js
  growOf grows the quotient / remainder boxes and the work grid (<= 2x, 6 mm white kept) at 4 a page or fewer. Digits keep
  their size; divisor tracks and the bracket gutter unchanged. Facts, fact rows, screen and div_remainders (no work grid)
  are untouched.
- Pins: none moved (ws-lesson-baseline 1772 identical; print-lint on long_div_2digit + divide, 9 roles, M/L: findings
  identical to d82acc06f - the ratchet's 7 risen counts are already there on d82acc06f). Hash: only long_div_2digit and
  divide Independent L / More Practice L / Lesson L (4 a page) changed; screen cards and 4 controls byte-identical.
- ws-precritic-plan FAILs on 11 other lanes' ledger rows (lf-ops lines 27 and 48, lf-vocab, lf-roles, lead, lf-placevalue);
  the same 11 FAIL without this change. All four ldiv rows are OK on the path.
