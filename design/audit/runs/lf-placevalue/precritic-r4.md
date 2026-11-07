ws-precritic: 40 gate(s) (27 browser), logs /tmp/mq-precritic/20261107-181644-22892
  PASS            ws-node-lint (1 s)
  PASS            ws-providers-unit --skill (1 s)
  PASS            ws-code-snapshot (2 s)
  PASS            ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (2 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  PASS            ws-content-audit --skill (7 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (4 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (1 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (2 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (28 s)
  PASS            ws-options-verify --skill (53 s)
  PASS            ws-presets-unit (68 s, waited 62 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (50 s, waited 23 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (57 s, waited 29 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (62 s, waited 29 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (70 s, waited 33 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (75 s, waited 37 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (103 s, waited 89 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (82 s, waited 70 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (413 s, waited 38 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (339 s, waited 106 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (235 s, waited 88 s for a slot)
  PASS            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (213 s, waited 102 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (312 s, waited 77 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (247 s, waited 32 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (282 s, waited 42 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (155 s, waited 64 s for a slot)
  FAIL            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (284 s, waited 45 s for a slot)
  FAIL            ws-coverage-matrix --skills (1681 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (0 s)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (322 s, waited 90 s for a slot)
  PASS            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (272 s, waited 79 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (113 s, waited 56 s for a slot)
  PASS            ws-screen-answer --skills (102 s, waited 51 s for a slot)
  PASS            ws-boot-smoke (44 s, waited 40 s for a slot)
  PASS            ws-chromebook-fit --skills (288 s, waited 49 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (249 s, waited 108 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands (438 s, waited 51 s for a slot)
  FAIL            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (1603 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value

commit `9b67cd84aa` (claude/lf-placevalue) · started 2026-11-07T18:16:44Z · finished 2026-11-07T19:11:32Z · wall 3288 s · logs `/tmp/mq-precritic/20261107-181644-22892`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill | 5 skills | PASS | 5 of 5 skills checked | 1 |
| ws-content-audit --skill | 5 skills | PASS | 5 skill(s) audited | 7 |
| ws-options-verify --skill | 5 skills | PASS | 70 value(s) checked; 0 failing, 0 pinned, 0 new | 53 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 68 (62 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 28 |
| ws-coverage-matrix --skills | 5 skills × kinds × S/M/L | FAIL | 35 of 165 row(s) run × S/M/L: OK 32, RED 0, ERROR 3; PENDING 103, N/A 27 | 1681 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 50 (23 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 57 (29 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 62 (29 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 2 found in 1 of 5 doc(s); 1 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 70 (33 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 4 found in 1 of 5 doc(s); 1 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 75 (37 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 5 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 413 (38 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × S | FAIL | 8 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 103 (89 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × L | FAIL | 9 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 82 (70 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:expand × 11 roles × S/M/L | PASS | - | 339 (106 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:expand × 14 roles + 17 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 24 finding(s) (OVERFLOW 24) on 294 page(s), 143s | 235 (88 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:combine × 11 roles × S/M/L | PASS | - | 312 (77 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:combine × 14 roles + 12 option values × S/M/L | PASS | - | 213 (102 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:identify × 11 roles × S/M/L | PASS | - | 282 (42 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:identify × 14 roles + 23 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 252 finding(s) (OVERFLOW 252) on 384 page(s), 211s | 247 (32 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:unit_form × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 10 finding(s) (10 overflow, 0 small target) in 1 unit(s) | 284 (45 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:unit_form × 14 roles + 10 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 10 finding(s) (OVERFLOW 10) on 189 page(s), 86s | 155 (64 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:value × 11 roles × S/M/L | PASS | - | 322 (90 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:value × 14 roles + 26 option values × S/M/L | PASS | - | 272 (79 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | 5 skills | FAIL | 27 found, 0 pinned, 27 new (70 host renders, --baseline design/audit/baselines/screen-slots.json) | 113 (56 waiting) |
| ws-screen-answer --skills | 5 skills | PASS | - | 102 (51 waiting) |
| ws-chromebook-fit --skills | 5 skills | PASS | - | 288 (49 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 44 (40 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 5 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 96 with no sibling measured, 3 ERROR row(s); 0 at or below (engine) in 33 printed row(s) with findings (PENDING(no-baseline) 33; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0) | 0 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | 5 skills × matrix rows × S/M/L + extras at S | FAIL | 9 row×size(s) failing; 68 matrix row(s) × S/M/L + 10 extra document(s) (test, more-practice, supports on): 214 document(s), SLOT 0 / CLIP 0 finding(s), 4280 box segment(s) and 0 head(s) probed (SLOT-W N/A on 78, HEADS N/A on 205 document(s): no digit strip / no heads) | 1603 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 5 skills × 390x844, 390x664 | PASS | - | 249 (108 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 5 skills | PASS | - | 2 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 5 skills | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 5 skills | PASS | - | 4 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 5 skills | PASS | 5 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.1 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 5 skills | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-07; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands | 5 skills × S/L | PASS | 88 value page(s) (5 skill(s) x S/L) against 10 default page(s) through ws-print-lint --source kit in 387 s; 0 n/a; findings the default page has too (not the value's): L-DENSITY H13 | 438 (51 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-coverage-matrix --skills** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261107-181644-22892/coverage-matrix.json`
  - `ERROR placevalue:expand|single/layout-fact-rows`
  - `+ S L-SPLIT RENDER: 0 -> 1`
  - `+ M L-SPLIT RENDER: 0 -> 1`
  - `ERROR placevalue:identify|single/layout-fact-rows`
  - `+ S L-SPLIT RENDER: 0 -> 1`
  - `+ M L-SPLIT RENDER: 0 -> 1`
  - `ERROR placevalue:unit_form|single/layout-fact-rows`
  - `+ S L-SPLIT RENDER: 0 -> 1`
  - `+ M L-SPLIT RENDER: 0 -> 1`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:identify#lesson L-DENSITY DN-2: 0 -> 2`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.S.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:identify#lesson L-DENSITY H13: 0 -> 4`
- **ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/print-lint-sections-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size S --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 8 finding(s)`
- **ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/print-lint-sections-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size L --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 9 finding(s)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/cell-checks-expand.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:expand --card --card-opts`
  - `ok   placevalue:expand error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:expand error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:expand error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:expand lesson S {"band":999999}: 4p 1x? per undefined - OVERFLOW (8)`
  - `FAIL placevalue:expand lesson M {"band":999999}: 4p 1x? per undefined - OVERFLOW (8)`
  - `FAIL placevalue:expand lesson L {"band":999999}: 5p 1x? per undefined - OVERFLOW (8)`
  - `FAIL OVERFLOW placevalue:expand lesson S {"band":999999}: pupil page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand lesson S {"band":999999}: pupil page 1 cell 1: <div> leaves the cell`
  - `FAIL OVERFLOW placevalue:expand lesson S {"band":999999}: pupil page 1 cell 4: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand lesson S {"band":999999}: pupil page 1 cell 4: <div> leaves the cell`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/cell-checks-identify.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:identify --card --card-opts`
  - `ok   placevalue:identify error-analysis S: 1p 2x? per 6`
  - `ok   placevalue:identify error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:identify error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:identify lesson S {"band":99999}: 3p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson M {"band":99999}: 3p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson L {"band":99999}: 4p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson S {"band":999999}: 3p 1x? per undefined - OVERFLOW (18)`
  - `FAIL placevalue:identify lesson M {"band":999999}: 3p 1x? per undefined - OVERFLOW (18)`
  - `FAIL placevalue:identify lesson L {"band":999999}: 4p 1x? per undefined - OVERFLOW (18)`
  - `FAIL placevalue:identify lesson S {"places":[10000]}: 3p 1x? per undefined - OVERFLOW (16)`
- **ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/render-gate-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:unit_form --roles more-practice,opener,scripted-model,guided,error-analysis,review,pre-skill-check,mixed-practice,true-false,reason-it,fact-probe --size S,M,L --gate --no-screen --out /tmp/mq-precritic/20261107-181644-22892/render-gate-unit_form`
  - `[1/1] placevalue:unit_form  more-practice-S 1p+1k 1x15  more-practice-M 1p+1k 1x12  more-practice-L 1p+1k 1x10  opener-S 1p+1k 1x3  opener-M 1p+1k 1x3  opener-L 1p+1k 1x1  scripted-model-S 1p+1k 2x4  scripted-model-M 1p+`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-S key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-S key: page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-S key: page 1 cell 3: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-S key: page 1 cell 4: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-M key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-M key: page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-M key: page 1 cell 3: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-L key: page 1: content overflows the sheet`
  - `FAIL OVERFLOW placevalue:unit_form reason-it-L key: page 1 cell 1: content overflows its cell`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/cell-checks-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:unit_form --card --card-opts`
  - `ok   placevalue:unit_form error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:unit_form error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:unit_form error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:unit_form reason-it S: 1p 1x? per 4 - OVERFLOW (4)`
  - `FAIL placevalue:unit_form reason-it M: 1p 1x? per 3 - OVERFLOW (3)`
  - `FAIL placevalue:unit_form reason-it L: 1p 1x? per 2 - OVERFLOW (3)`
  - `FAIL OVERFLOW placevalue:unit_form reason-it S: key page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it S: key page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it S: key page 1 cell 3: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form reason-it S: key page 1 cell 4: content overflows its cell`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261107-181644-22892/screen-slots.json --uniform --screen-digit --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `NEW placevalue:identify                          card@1280      SCREEN-DIGIT the numeral "7" is 30.4 px (want >= 56 px at 1280)`
  - `NEW placevalue:identify                          worksheet@1280 SCREEN-DIGIT the numeral "3" is 30.4 px (want >= 56 px at 1280)`
  - `NEW placevalue:identify                          quiz@1280      SCREEN-DIGIT the numeral "7" is 30.4 px (want >= 56 px at 1280)`
  - `NEW placevalue:value                             worksheet@1280 SCREEN-DIGIT the numeral "3" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:expand                            card@1280      SCREEN-DIGIT the numeral "552 =" is 24 px (want >= 56 px at 1280), weight 400 (want >= 700)`
  - `NEW placevalue:expand                            worksheet@1280 SCREEN-DIGIT the numeral "604 =" is 18 px (want >= 56 px at 1280), weight 400 (want >= 700)`
  - `NEW placevalue:expand                            quiz@1280      SCREEN-DIGIT the numeral "320 =" is 24 px (want >= 56 px at 1280), weight 400 (want >= 700)`
  - `NEW placevalue:combine                           worksheet@1280 SCREEN-DIGIT the numeral "700" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:unit_form                         worksheet@1280 SCREEN-DIGIT the numeral "912" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:identify                          card@820       SCREEN-DIGIT the numeral "7" is 30.4 px (want >= 48 px at 820)`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261107-181644-22892/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --json /tmp/mq-precritic/20261107-181644-22892/sibling-compare.json`
  - `ERROR      placevalue:expand|single/layout-fact-rows: S: Cannot access 'opEm' before initialization`
  - `ERROR      placevalue:identify|single/layout-fact-rows: S: Cannot access 'opEm' before initialization`
  - `ERROR      placevalue:unit_form|single/layout-fact-rows: S: Cannot access 'opEm' before initialization`
  - `NO-SIBLING placevalue:combine|mixed/defaults S L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at S`
  - `NO-SIBLING placevalue:combine|mixed/defaults M L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each S L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at S`
  - `NO-SIBLING placevalue:combine|sections/ex-each M L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY PG-23: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-group S L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at S`
- **ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap** (exit 1, `/tmp/mq-precritic/20261107-181644-22892/slot-clip.log`); rerun alone: `node tests/scripts/ws-slot-clip.cjs --run /tmp/mq-precritic/20261107-181644-22892/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --slots 2 --json /tmp/mq-precritic/20261107-181644-22892/slot-clip.json --slot-w-equal --draw-cap --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `placevalue:expand|single/layout-fact-rows S: ERROR`
  - `placevalue:expand|single/layout-fact-rows M: ERROR`
  - `placevalue:expand|single/layout-fact-rows L: ERROR`
  - `placevalue:identify|single/layout-fact-rows S: ERROR`
  - `placevalue:identify|single/layout-fact-rows M: ERROR`
  - `placevalue:identify|single/layout-fact-rows L: ERROR`
  - `placevalue:unit_form|single/layout-fact-rows S: ERROR`
  - `placevalue:unit_form|single/layout-fact-rows M: ERROR`

ws-precritic: FAIL: 12 FAIL, 27 PASS, 1 N/A, 0 SKIPPED-NOT-BUILT of 40 (FAIL: coverage-matrix, print-lint-lesson-L, print-lint-lesson-S, print-lint-sections-S, print-lint-sections-L, cell-checks-expand, cell-checks-identify, render-gate-unit_form, cell-checks-unit_form, screen-slots, sibling-compare, slot-clip; N/A (ran, nothing to check): card-not-offered)
