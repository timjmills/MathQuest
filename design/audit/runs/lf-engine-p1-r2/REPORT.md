# lf-engine P1 critic r2 (2026-11-07)

Independent critic (mq-opus-medium), branch `claude/sweet-newton-c8wrv1-lf-engine` @ ec654c84, graded from the committed PNGs
and the code (no browser). Grades: `grades.jsonl` (25 lines). The critic could not write this file; the lane lead saved its
report here verbatim in substance.

**VERDICT: FAIL (min score 6)**

Node gates run by the critic: ws-lesson-unit OK (155), ws-lesson-coverage OK, ws-lesson-compile-unit OK (45); ws-backtest
killed at 600 s (no result). None of them fails any finding below.

Scope: Prerequisite Check (pupil-p1, key-p1), routing page (key-p2), lesson sheet (pupil-p3 + key-p4) of the three
packets at L and S-printed-at-M; the engine. Not in scope: chart, Practice, Mixed (P1b still fixing).

| Item | Size | C1 | C2 | C3 | C4 | min |
|---|---|---|---|---|---|---|
| add pupil-p1 / key-p1 | L | 8 | 7 | 7 | 8 | 7 |
| add key-p2 | L | 7 | 8 | 8 | 8 | 7 |
| add sheet | L | 8 | 8 | 8 | 8 | 8 |
| add pupil-p1 / key-p1 | S@M | 8 | 7 | 8 | 8 | 7 |
| add key-p2 | S@M | 7 | 8 | 8 | 8 | 7 |
| add sheet | S@M | 8 | 8 | 8 | 8 | 8 |
| sub pupil-p1 / key-p1 | L | 8 | 7 | 8 | 8 | 7 |
| sub key-p2 | L | 7 | 8 | 8 | 8 | 7 |
| **sub sheet** | L | 7 | 6 | 6 | 6 | **6** |
| sub pupil-p1 / key-p1 | S@M | 8 | 7 | 8 | 8 | 7 |
| sub key-p2 | S@M | 7 | 8 | 8 | 8 | 7 |
| sub sheet | S@M | 7 | 8 | 8 | 8 | 7 |
| round pupil-p1 / key-p1 | L | 8 | 7 | 8 | 8 | 7 |
| round key-p2 | L | 7 | 8 | 8 | 8 | 7 |
| round sheet | L | 8 | 8 | 8 | 8 | 8 |
| round pupil-p1 / key-p1 | S@M | 7 | 8 | 7 | 8 | 7 |
| round key-p2 | S@M | 7 | 8 | 8 | 8 | 7 |
| round sheet | S@M | 8 | 8 | 8 | 8 | 8 |
| Engine (correctness / design fit / maintainability / gates) | — | 6 | 7 | 7 | 7 | 6 |

Pass (≥ 8 everywhere): add and round sheets at L and S. Near-miss (7, Q-S2 re-check open): every check, check key and
routing page. Not near-miss: sub L sheet, engine.

Right: every check key a correct facsimile; D1 D2 D3 D5 D6 D7 D8 visibly fixed; one grid with a 6–9 % foot; the routing page
its own teacher page ("Prerequisite Check: where next", What it asks, Answers, Pupils who missed it); round S sheet no longer
ends on a blank foot (D11).

## Blocking findings

| # | Sev | Where | Defect | Fix | Machine check |
|---|---|---|---|---|---|
| N1 | critical | sub L pupil-p3 / key-p4 | the sheet lost its Independent Practice band (r1 had 3 items): no Score in the header; Vocabulary panel ≈25 mm dead band (≈27 %); body ≈22 % blank. Cause: D10 change in we-do.js (`lr17Sheet` → `capIfEmpty 0.1`) decides no Independent row fits after Vocabulary and Guided grew. LR-18, LR-13, H13 | reserve one Independent row of 3 before any band grows; Vocabulary panel sized to its content, no growth; vocabulary pictures to their floor before ever dropping the row | a lesson sheet at every size has ≥ 1 Independent row and a Score; blank foot ≤ 20 % blocking; backtest FAIL ec654c84 / PASS fix |
| N2 | major | add L Q7 Q8, add S Q9 Q10, round L Q7 | a check question can print ONE item (LR-17a(2), P-25, PT-PRE-2); round L Q7 asks only "10 more" under a "10 more or 10 less" route. Cause: pre-skill-check `down()` returns 1 | floor 2 in `plan()`; when 2 do not fit, re-choose a narrower form at deal time; comments and rule text agree | `plan()` unit test over every library lesson at L and S: every question deals ≥ its `items`, no two-choice item alone |
| N3 | major | all 6 key-p2 | the routing page never says when a question counts as missed; per-question `__/n` score (P-25) off | state the threshold under the table; `scoreTag` on for routed bands | `routingTableHtml` names the threshold; routed bands carry `.mq-quadscore` |

## Other findings

| # | Sev | Where | Defect | Fix | Machine check |
|---|---|---|---|---|---|
| N4 | minor | sub Q5–8, sub S Q3–6, round Q5–6 | LR-6 on the check (11−7, 12−7; answer 4 twice; 77/27/71; 75 and 45) | pass the lesson's LR-6 flags to the prereq refs in `buildPrereq` | LR-6 over the prereq part |
| N5 | minor | round S Q8–11 | sentence items in quarter-width cells wrap and touch the number tab (≈1 mm) | 2 × 2, or the short form four across | tab-to-content padding ≥ 2 mm |
| N6 | minor | add L Q7/Q8 | a wrapped instruction puts paired cells and tags ≈6 mm out of line | both strips take the taller height | paired-band alignment lint (0.5 mm) |
| N7 | nit | sub check title | topic dropped when it would wrap: titles inconsistent | a short topic per lesson, always printed | routed check titles carry a topic |
| N8 | minor | sub S sheet Independent cells | T O head and 2-box answer grid dropped (PEDAGOGY 4, VQ-2) | keep the structural parts | Guided and Independent cells of a sheet share structural parts |
Nits on passed sheets: LR-6 distinctAnswer repeats (add, round); round L Independent number tabs touch the T heads; round S step 4 widow.

## LR-17a decisions judged
(1) curriculum order: right (D20 closed). (2) a row per question, ≥ 2, whole rows: half right — the 1-item drop is wrong
(N2) and the miss threshold is undefined (N3). (3) no supports, level 0: right. (4) `checks` ≠ `why`: right, enforced.
(5) one grid, ≤ 5 % growth, routing on its own key page: right. (6) deal before choosing: right but not gated (N4).

## r1 findings
D1 D2 D3 D5 D6 D7 D8 D9 D12 D15 D17 D18 fixed · D4 mostly (N6) · **D10 regressed (N1)** · D11 fixed (widow remains) · D13 fixed
(N7) · D14 closed by correcting the claim · D16 fixed except `routePlan`'s `10*em - 24` and `plan()`'s untested loops · D19 open
(out of scope) · D20 closed · L7 D1 reported in code (chart not graded).

## Engine
Correctness 6 (N1; rule text vs code on the item floor, N2). Design fit 7 (`lr17Sheet` in we-do.js and `roundOne` in
practice.js switch layout on whether a lesson has `prereqs` — a data field with no layout meaning). Maintainability 7
(`plan()`'s three fitting loops untested). Gates and tests 7 (strong on D12–D18; nothing catches N1 or N2).

## Automatic checks the findings point to
1. lesson sheet ≥ 1 Independent row + Score at every size; blank foot ≤ 20 % blocking (N1). 2. `plan()` unit test: every
question ≥ its items; no two-choice item alone (N2). 3. routing page states the miss threshold; routed bands carry `__/n` (N3).
4. LR-6 over the prereq part (N4). 5. tab padding and paired-band alignment lints (N5, N6). 6. routed titles carry a topic
(N7). 7. Guided and Independent cells share structural parts (N8).

## Speed-ups
1. r1 and r2 page side by side for every finding marked fixed (N1 is one glance). 2. a fix scoped to "some sheets" lists
each changed sheet's Independent rows before/after. 3. rule text and code in one place: a unit test holding `ROUTE_ITEMS`
as a floor. 4. after N2–N6, a Q-S2 near-miss re-check of the check / routing pages; the sub sheet a full regrade after N1.
5. ws-backtest in the background with the maximum timeout.
