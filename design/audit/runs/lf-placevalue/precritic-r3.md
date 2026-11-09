ws-precritic: 40 gate(s) (27 browser), logs /tmp/mq-precritic/20261107-122044-23090
  PASS            ws-node-lint (1 s)
  PASS            ws-providers-unit --skill (1 s)
  FAIL            ws-code-snapshot (2 s)
  PASS            ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  PASS            ws-content-audit --skill (6 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (2 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (1 s)
  FAIL            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (1 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (21 s)
  FAIL            ws-options-verify --skill (48 s)
  PASS            ws-presets-unit (60 s, waited 54 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (45 s, waited 18 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (52 s, waited 27 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (62 s, waited 37 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (65 s, waited 30 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (77 s, waited 42 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (63 s, waited 50 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (80 s, waited 68 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (407 s, waited 48 s for a slot)
  FAIL            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (324 s, waited 98 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (216 s, waited 87 s for a slot)
  FAIL            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (298 s, waited 73 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (207 s, waited 105 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (212 s, waited 30 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (263 s, waited 37 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (130 s, waited 55 s for a slot)
  FAIL            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (264 s, waited 41 s for a slot)
  PASS            ws-coverage-matrix --skills (1570 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (0 s)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (317 s, waited 86 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (267 s, waited 83 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (111 s, waited 55 s for a slot)
  PASS            ws-screen-answer --skills (98 s, waited 47 s for a slot)
  PASS            ws-boot-smoke (50 s, waited 46 s for a slot)
  PASS            ws-chromebook-fit --skills (300 s, waited 46 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (254 s, waited 107 s for a slot)
  FAIL            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands (426 s, waited 54 s for a slot)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (1588 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value

commit `6b343a705c` (claude/lf-placevalue) · started 2026-11-07T12:20:44Z · finished 2026-11-07T13:13:24Z · wall 3159 s · logs `/tmp/mq-precritic/20261107-122044-23090`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill | 5 skills | PASS | 5 of 5 skills checked | 1 |
| ws-content-audit --skill | 5 skills | PASS | 5 skill(s) audited | 6 |
| ws-options-verify --skill | 5 skills | FAIL | 70 value(s) checked; 2 failing, 0 pinned, 2 new | 48 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 60 (54 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 21 |
| ws-coverage-matrix --skills | 5 skills × kinds × S/M/L | PASS | 32 of 165 row(s) run × S/M/L: OK 32, RED 0, ERROR 0; PENDING 103, N/A 30 | 1570 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 45 (18 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 52 (27 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 62 (37 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 2 found in 1 of 5 doc(s); 1 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 65 (30 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 4 found in 1 of 5 doc(s); 1 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 77 (42 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 5 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 407 (48 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × S | FAIL | 8 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 63 (50 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × L | FAIL | 9 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 80 (68 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:expand × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 8 finding(s) (8 overflow, 0 small target) in 1 unit(s) | 324 (98 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:expand × 14 roles + 17 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 32 finding(s) (OVERFLOW 32) on 294 page(s), 124s | 216 (87 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:combine × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 4 finding(s) (4 overflow, 0 small target) in 1 unit(s) | 298 (73 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:combine × 14 roles + 12 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 196 finding(s) (OVERFLOW 196) on 219 page(s), 98s | 207 (105 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:identify × 11 roles × S/M/L | PASS | - | 263 (37 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:identify × 14 roles + 23 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 252 finding(s) (OVERFLOW 252) on 384 page(s), 178s | 212 (30 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:unit_form × 11 roles × S/M/L | FAIL | ws-grade-render: FAIL - 22 finding(s) (22 overflow, 0 small target) in 1 unit(s) | 264 (41 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:unit_form × 14 roles + 10 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 22 finding(s) (OVERFLOW 22) on 189 page(s), 72s | 130 (55 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:value × 11 roles × S/M/L | PASS | - | 317 (86 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:value × 14 roles + 26 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 48 finding(s) (OVERFLOW 48) on 429 page(s), 180s | 267 (83 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | 5 skills | FAIL | 27 found, 0 pinned, 27 new (70 host renders, --baseline design/audit/baselines/screen-slots.json) | 111 (55 waiting) |
| ws-screen-answer --skills | 5 skills | PASS | - | 98 (47 waiting) |
| ws-chromebook-fit --skills | 5 skills | PASS | - | 300 (46 waiting) |
| ws-code-snapshot | all share codes | FAIL | exit 1 (no verdict line) | 2 |
| ws-boot-smoke | app boot | PASS | - | 50 (46 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 5 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 96 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 33 printed row(s) with findings (PENDING(no-baseline) 33; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0) | 0 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | 5 skills × matrix rows × S/M/L + extras at S | PASS | 65 matrix row(s) × S/M/L + 10 extra document(s) (test, more-practice, supports on): 205 document(s), SLOT 0 / CLIP 0 finding(s), 4280 box segment(s) and 0 head(s) probed (SLOT-W N/A on 78, HEADS N/A on 205 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 1588 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 5 skills × 390x844, 390x664 | PASS | - | 254 (107 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 5 skills | PASS | - | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 5 skills | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 5 skills | PASS | - | 2 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 5 skills | PASS | 5 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.2 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 5 skills | FAIL | design/cards/pv/pv.md: 1 problem(s) — the build may not start | 1 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands | 5 skills × S/L | FAIL | 1 value page(s) worse than the default: combine band=999999 @L; 88 value page(s) (5 skill(s) x S/L) against 10 default page(s) through ws-print-lint --source kit in 372 s; 0 n/a; findings the default page has too (not th | 426 (54 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-options-verify --skill** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/options-verify.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --skill expand,combine,identify,unit_form,value --category placevalue --deadline 600000 --json /tmp/mq-precritic/20261107-122044-23090/options-verify.json`
  - `NEW placevalue:identify writeValue=false: trip: packed {"writeValue":false} -> "" -> {}`
  - `NEW placevalue:identify static:writeValue: no share-code key (the choice cannot travel in a link): writeValue: no share-code key (the choice cannot travel in a link)`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:identify#lesson L-DENSITY DN-2: 0 -> 2`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.S.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:identify#lesson L-DENSITY H13: 0 -> 4`
- **ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/print-lint-sections-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size S --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 8 finding(s)`
- **ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/print-lint-sections-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size L --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 9 finding(s)`
- **ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/render-gate-expand.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:expand --roles more-practice,opener,scripted-model,guided,error-analysis,review,pre-skill-check,mixed-practice,true-false,reason-it,fact-probe --size S,M,L --gate --no-screen --out /tmp/mq-precritic/20261107-122044-23090/render-gate-expand`
  - `[1/1] placevalue:expand  more-practice-S 1p+1k 1x15  more-practice-M 1p+1k 1x12  more-practice-L 1p+1k 1x10  opener-S 1p+1k 1x1  opener-M 1p+1k 1x1 OVERFLOW  opener-L 1p+1k 1x1 OVERFLOW  scripted-model-S 1p+1k 2x4  scrip`
  - `FAIL OVERFLOW placevalue:expand opener-M pupil: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand opener-M pupil: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:expand opener-M key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand opener-M key: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:expand opener-L pupil: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand opener-L pupil: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:expand opener-L key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand opener-L key: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `ws-grade-render: FAIL - 8 finding(s) (8 overflow, 0 small target) in 1 unit(s)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/cell-checks-expand.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:expand --card --card-opts`
  - `FAIL placevalue:expand opener M: 1p 1x? per undefined - OVERFLOW (4)`
  - `FAIL placevalue:expand opener L: 1p 1x? per undefined - OVERFLOW (4)`
  - `ok   placevalue:expand error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:expand error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:expand error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:expand lesson S {"band":999999}: 4p 1x? per undefined - OVERFLOW (8)`
  - `FAIL placevalue:expand lesson M {"band":999999}: 4p 1x? per undefined - OVERFLOW (8)`
  - `FAIL placevalue:expand lesson L {"band":999999}: 5p 1x? per undefined - OVERFLOW (8)`
  - `FAIL OVERFLOW placevalue:expand opener M: pupil page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:expand opener M: pupil page 1 cell 1: <div> leaves the cell`
- **ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/render-gate-combine.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:combine --roles more-practice,opener,scripted-model,guided,error-analysis,review,pre-skill-check,mixed-practice,true-false,reason-it,fact-probe --size S,M,L --gate --no-screen --out /tmp/mq-precritic/20261107-122044-23090/render-gate-combine`
  - `[1/1] placevalue:combine  more-practice-S 1p+1k 3x10  more-practice-M 1p+1k 3x6  more-practice-L 1p+1k 1x10  opener-S 1p+1k 4x3  opener-M 1p+1k 3x3  opener-L 1p+1k 1x1  scripted-model-S 1p+1k 2x4  scripted-model-M 1p+1k `
  - `FAIL OVERFLOW placevalue:combine reason-it-L pupil: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:combine reason-it-L pupil: page 1 cell 2: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:combine reason-it-L key: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:combine reason-it-L key: page 1 cell 2: <div class="pv-cell"> leaves the cell`
  - `ws-grade-render: FAIL - 4 finding(s) (4 overflow, 0 small target) in 1 unit(s)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/cell-checks-combine.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:combine --card --card-opts`
  - `ok   placevalue:combine error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:combine error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:combine error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:combine reason-it L: 1p 1x? per 2 - OVERFLOW (4)`
  - `FAIL placevalue:combine lesson S {"band":999999}: 4p 1x? per undefined - OVERFLOW (40)`
  - `FAIL placevalue:combine lesson M {"band":999999}: 4p 1x? per undefined - OVERFLOW (40)`
  - `FAIL placevalue:combine lesson L {"band":999999}: 4p 1x? per undefined - OVERFLOW (48)`
  - `FAIL placevalue:combine independent L {"band":999999}: 1p 1x? per 4 - OVERFLOW (16)`
  - `FAIL placevalue:combine guided L {"band":999999}: 1p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:combine test L {"band":999999}: 1p 1x? per 4 - OVERFLOW (16)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/cell-checks-identify.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:identify --card --card-opts`
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
- **ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/render-gate-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:unit_form --roles more-practice,opener,scripted-model,guided,error-analysis,review,pre-skill-check,mixed-practice,true-false,reason-it,fact-probe --size S,M,L --gate --no-screen --out /tmp/mq-precritic/20261107-122044-23090/render-gate-unit_form`
  - `[1/1] placevalue:unit_form  more-practice-S 1p+1k 1x15  more-practice-M 1p+1k 1x12  more-practice-L 1p+1k 1x10  opener-S 1p+1k 1x1 OVERFLOW  opener-M 1p+1k 1x1 OVERFLOW  opener-L 1p+1k 1x1 OVERFLOW  scripted-model-S 1p+1`
  - `FAIL OVERFLOW placevalue:unit_form opener-S pupil: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-S pupil: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-S key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-S key: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-M pupil: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-M pupil: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-M key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-M key: page 1 cell 1: <div class="pv-cell"> leaves the cell`
  - `FAIL OVERFLOW placevalue:unit_form opener-L pupil: page 1 cell 1: content overflows its cell`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/cell-checks-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:unit_form --card --card-opts`
  - `FAIL placevalue:unit_form opener S: 1p 1x? per undefined - OVERFLOW (4)`
  - `FAIL placevalue:unit_form opener M: 1p 1x? per undefined - OVERFLOW (4)`
  - `FAIL placevalue:unit_form opener L: 1p 1x? per undefined - OVERFLOW (4)`
  - `ok   placevalue:unit_form error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:unit_form error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:unit_form error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:unit_form reason-it S: 1p 1x? per 4 - OVERFLOW (4)`
  - `FAIL placevalue:unit_form reason-it M: 1p 1x? per 3 - OVERFLOW (3)`
  - `FAIL placevalue:unit_form reason-it L: 1p 1x? per 2 - OVERFLOW (3)`
  - `FAIL OVERFLOW placevalue:unit_form opener S: pupil page 1 cell 1: content overflows its cell`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/cell-checks-value.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:value --card --card-opts`
  - `ok   placevalue:value error-analysis S: 1p 2x? per 6`
  - `ok   placevalue:value error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:value error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:value lesson S {"form":"unit"}: 4p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:value lesson M {"form":"unit"}: 4p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:value lesson L {"form":"unit"}: 4p 1x? per undefined - OVERFLOW (16)`
  - `FAIL OVERFLOW placevalue:value lesson S {"form":"unit"}: pupil page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:value lesson S {"form":"unit"}: pupil page 1 cell 1: <div> leaves the cell`
  - `FAIL OVERFLOW placevalue:value lesson S {"form":"unit"}: pupil page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:value lesson S {"form":"unit"}: pupil page 1 cell 2: <div> leaves the cell`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261107-122044-23090/screen-slots.json --uniform --screen-digit --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
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
- **ws-code-snapshot** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/code-snapshot.log`); rerun alone: `node tests/scripts/ws-code-snapshot.mjs`
  - `ws-code-snapshot: 2 FAILURE(S)`
  - `- placevalue:identify writeValue: {"writeValue":false} ->  -> {}`
  - `- placevalue:identify combined options did not round-trip: B99_A05_FT_RB_0A1_6X1`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261107-122044-23090/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --json /tmp/mq-precritic/20261107-122044-23090/sibling-compare.json`
  - `NO-SIBLING placevalue:combine|mixed/defaults S L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at S`
  - `NO-SIBLING placevalue:combine|mixed/defaults M L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each S L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at S`
  - `NO-SIBLING placevalue:combine|sections/ex-each M L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY PG-23: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-group S L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at S`
  - `NO-SIBLING placevalue:combine|sections/ex-group M L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at M`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY DN-2: ours 4, no approved sibling measured sections/pages-2 at S`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY PAGEFILL: ours 3, no approved sibling measured sections/pages-2 at S`
- **ws-spec-card --check-signed --skill (card signed; every host, role and option value decided)** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/spec-card-signed.log`); rerun alone: `node tests/scripts/ws-spec-card.mjs --check-signed --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `FAIL design/cards/pv/pv.md: card.json or the repo now generates a different card (first difference at line 3 of the compared body: "{"cited":"","rules":"PV-06 873a10 07 76250d 09 5a34d6 14 6f6816 15 1c7999 RP-40 ") — fix`
  - `FAIL design/cards/pv/pv.md: 1 problem(s) — the build may not start`
- **ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands** (exit 1, `/tmp/mq-precritic/20261107-122044-23090/options-render.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --render --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --bands --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `FAIL placevalue:combine L band=999999: L-OVERFLOW PG-12: 0 -> 8 (sticks out of its cell by 9.7 mm (cell 184.9 x 56 mm) (PG-12, CL-1))`

ws-precritic: FAIL: 18 FAIL, 21 PASS, 1 N/A, 0 SKIPPED-NOT-BUILT of 40 (FAIL: options-verify, print-lint-lesson-L, print-lint-lesson-S, print-lint-sections-S, print-lint-sections-L, render-gate-expand, cell-checks-expand, render-gate-combine, cell-checks-combine, cell-checks-identify, render-gate-unit_form, cell-checks-unit_form, cell-checks-value, screen-slots, code-snapshot, sibling-compare, spec-card-signed, options-render; N/A (ran, nothing to check): card-not-offered)
