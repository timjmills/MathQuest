ws-precritic: 43 gate(s) (30 browser), logs /tmp/mq-precritic/20261108-141914-28161
  PASS            ws-node-lint (1 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (4 s)
  PASS            ws-code-snapshot (2 s)
  PASS            ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  PASS            ws-content-audit --skill (7 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (3 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (2 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (1 s)
  INCOMPLETE (unsigned card) ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (1 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (28 s)
  PASS            ws-options-verify --skill (51 s)
  PASS            ws-presets-unit (67 s, waited 60 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (90 s, waited 63 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (101 s, waited 74 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (129 s, waited 98 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (111 s, waited 70 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) (553 s, waited 22 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (136 s, waited 100 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (69 s, waited 56 s for a slot)
  FAIL            ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) (89 s, waited 77 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (407 s, waited 37 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (343 s, waited 109 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs (229 s, waited 76 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs (194 s, waited 56 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (335 s, waited 100 s for a slot)
  FAIL            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (1557 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1 s)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (278 s, waited 42 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs (311 s, waited 82 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs (177 s, waited 86 s for a slot)
  FAIL            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (308 s, waited 75 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (288 s, waited 56 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs (317 s, waited 95 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (143 s, waited 86 s for a slot)
  PASS            ws-screen-answer --skills (105 s, waited 52 s for a slot)
  PASS            ws-boot-smoke (59 s, waited 55 s for a slot)
  PASS            ws-chromebook-fit --skills (298 s, waited 56 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (233 s, waited 86 s for a slot)
  FAIL            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (84 s, waited 51 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (126 s, waited 94 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (460 s, waited 61 s for a slot)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (2060 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value

commit `8042f14495` (claude/lf-placevalue) · started 2026-11-08T14:19:14Z · finished 2026-11-08T15:19:33Z · wall 3619 s · logs `/tmp/mq-precritic/20261108-141914-28161`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | 5 skills | PASS | 5 of 5 skills checked | 4 |
| ws-content-audit --skill | 5 skills | PASS | 5 skill(s) audited | 7 |
| ws-options-verify --skill | 5 skills | PASS | 70 value(s) checked; 0 failing, 0 pinned, 0 new | 51 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 67 (60 waiting) |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) | 5 skills × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (272) | 553 (22 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 28 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | 5 skills × kinds × S/M/L | FAIL | 43 of 165 row(s) run × S/M/L: OK 32, RED 11 (11 not in the pin), ERROR 0; PENDING 92, N/A 30; rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/matrix/baseline.json --write-baseline; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 1557 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 90 (63 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 101 (74 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | PASS | 0 found (5 doc(s)) | 129 (98 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | FAIL | 4 found in 2 of 5 doc(s); 2 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 111 (70 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | 5 skills | FAIL | 8 found in 3 of 5 doc(s); 3 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 136 (100 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 5 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 407 (37 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × S | FAIL | 8 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 69 (56 waiting) |
| ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet) | placevalue:expand + placevalue:combine + placevalue:identify + placevalue:unit_form + placevalue:value × sections × 2 pages × L | FAIL | 9 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 89 (77 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:expand × 10 roles × S/M/L | PASS | - | 343 (109 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs | placevalue:expand × 13 roles + 17 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 67 finding(s) (H13-ABS 43, OVERFLOW 24) on 294 page(s), 149s | 229 (76 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:combine × 10 roles × S/M/L | PASS | - | 335 (100 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs | placevalue:combine × 13 roles + 12 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 206 finding(s) (H13-ABS 206) on 219 page(s), 135s | 194 (56 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:identify × 10 roles × S/M/L | PASS | - | 278 (42 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs | placevalue:identify × 13 roles + 23 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 273 finding(s) (H13-ABS 33, OVERFLOW 240) on 384 page(s), 226s | 311 (82 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:unit_form × 10 roles × S/M/L | FAIL | ws-grade-render: FAIL - 10 finding(s) (10 overflow, 0 small target) in 1 unit(s) | 308 (75 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs | placevalue:unit_form × 13 roles + 10 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 112 finding(s) (OVERFLOW 58, H13-ABS 54) on 189 page(s), 87s | 177 (86 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:value × 10 roles × S/M/L | PASS | - | 288 (56 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs | placevalue:value × 13 roles + 26 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 355 finding(s) (H13-ABS 355) on 429 page(s), 218s | 317 (95 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | 5 skills | FAIL | 27 found, 0 pinned, 27 new (70 host renders, --baseline design/audit/baselines/screen-slots.json) | 143 (86 waiting) |
| ws-screen-answer --skills | 5 skills | PASS | - | 105 (52 waiting) |
| ws-chromebook-fit --skills | 5 skills | PASS | - | 298 (56 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 59 (55 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 5 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 96 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 33 printed row(s) with findings (PENDING(no-baseline) 22, RED 11; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | 5 skills × matrix rows × S/M/L + extras at S | PASS | 65 matrix row(s) × S/M/L + 10 extra document(s) (test, more-practice, supports on): 205 document(s), SLOT 0 / CLIP 0 finding(s), 4280 box segment(s) and 0 head(s) probed (SLOT-W N/A on 78, HEADS N/A on 205 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 2060 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 5 skills × 390x844, 390x664 | PASS | - | 233 (86 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 5 skills | PASS | - | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 5 skills | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 5 skills | PASS | - | 3 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 5 skills | PASS | 5 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.8 s | 2 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 5 skills | INCOMPLETE (unsigned card) | needs owner signature: design/cards/pv/pv.md (everything else green) | 1 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | 5 skills × S/L | PASS | 88 value page(s) (5 skill(s) x S/L) against 10 default page(s) through ws-print-lint --source kit in 398 s; 0 n/a | 460 (61 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value | FAIL | 4 found in 1 of 5 doc(s) (no pinned baseline: an unpinned document must be clean) | 84 (51 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value | PASS | 0 found (5 doc(s), unpinned) | 126 (94 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT)** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/empty-band.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `EB-BAND  FAIL 80`
  - `placevalue:expand error-analysis M p1 cell 1: empty band 23.5 mm under the ink of a 57.3 mm cell (41.0 %; limit 30 % = 17.2 mm) [pv]`
  - `placevalue:expand error-analysis M p1 cell 2: empty band 23.5 mm under the ink of a 57.3 mm cell (41.0 %; limit 30 % = 17.2 mm) [pv]`
  - `placevalue:expand error-analysis M p1 cell 3: empty band 23.5 mm under the ink of a 57.3 mm cell (41.0 %; limit 30 % = 17.2 mm) [pv]`
  - `placevalue:expand error-analysis M p1 cell 4: empty band 23.5 mm under the ink of a 57.3 mm cell (41.0 %; limit 30 % = 17.2 mm) [pv]`
  - `placevalue:expand error-analysis L p1 cell 1: empty band 17.1 mm under the ink of a 57 mm cell (30.0 %; limit 30 % = 17.1 mm) [pv]`
  - `placevalue:expand error-analysis L p1 cell 2: empty band 17.1 mm under the ink of a 57 mm cell (30.0 %; limit 30 % = 17.1 mm) [pv]`
  - `placevalue:expand error-analysis L p1 cell 3: empty band 17.1 mm under the ink of a 57 mm cell (30.0 %; limit 30 % = 17.1 mm) [pv]`
  - `placevalue:expand error-analysis L p1 cell 4: empty band 17.1 mm under the ink of a 57 mm cell (30.0 %; limit 30 % = 17.1 mm) [pv]`
  - `EB-SIDE  FAIL 134`
- **ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261108-141914-28161/coverage-matrix.json --red-no-baseline PAGEFILL,H5 --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `RED placevalue:combine|single/more-cols2+afterpage (not in the pin)`
  - `+ L L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:combine|single/more-cols2+short (not in the pin)`
  - `+ L L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:expand|single/ex-group (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:expand|single/more-cols2+afterpage (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `+ M L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:expand|single/more-cols2+short (not in the pin)`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:identify#lesson L-DENSITY DN-2: 0 -> 2`
  - `- placevalue:value#lesson L-DENSITY H13-ABS: 0 -> 2`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.S.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:combine#lesson L-DENSITY H13-ABS: 0 -> 2`
  - `- placevalue:identify#lesson L-DENSITY H13: 0 -> 4`
  - `- placevalue:unit_form#lesson L-DENSITY H13-ABS: 0 -> 2`
- **ws-print-lint --source kit --kind sections --pages 2 --size S --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/print-lint-sections-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size S --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 8 finding(s)`
- **ws-print-lint --source kit --kind sections --pages 2 --size L --lints L-DENSITY (critic lf-ops r1 check 5: PAGEFILL / PG-23 on a two-skill sheet)** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/print-lint-sections-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --kind sections --pages 2 --size L --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `sections:placevalue:expand+placevalue:combine+placevalue:identify+placevalue:unit_form+placevalue:value: 12+6 pages, 9 finding(s)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/cell-checks-expand.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:expand --card --card-opts --h13-abs --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `ok   placevalue:expand error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:expand error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:expand error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:expand guided S {"band":99}: 1p 2x? per undefined - H13-ABS (10)`
  - `FAIL placevalue:expand lesson S {"band":9999}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:expand lesson M {"band":9999}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:expand lesson L {"band":9999}: 3p 1x? per undefined - H13-ABS (1)`
  - `FAIL placevalue:expand guided L {"band":9999}: 2p 1x? per undefined - H13-ABS (4)`
  - `FAIL placevalue:expand lesson L {"band":99999}: 3p 1x? per undefined - H13-ABS (1)`
  - `FAIL placevalue:expand guided L {"band":99999}: 2p 1x? per undefined - H13-ABS (4)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/cell-checks-combine.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:combine --card --card-opts --h13-abs --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `ok   placevalue:combine error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:combine error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:combine error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:combine lesson S {"band":99}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:combine lesson M {"band":99}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:combine independent M {"band":99}: 1p 2x? per 16 - H13-ABS (16)`
  - `FAIL placevalue:combine guided S {"band":99}: 1p 2x? per undefined - H13-ABS (10)`
  - `FAIL placevalue:combine guided M {"band":99}: 1p 2x? per undefined - H13-ABS (8)`
  - `FAIL placevalue:combine guided L {"band":99}: 1p 2x? per undefined - H13-ABS (6)`
  - `FAIL placevalue:combine lesson S {"band":9999}: 3p 1x? per undefined - H13-ABS (2)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/cell-checks-identify.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:identify --card --card-opts --h13-abs --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `ok   placevalue:identify error-analysis S: 1p 2x? per 6`
  - `ok   placevalue:identify error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:identify error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:identify guided M {"band":99}: 1p 3x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:identify guided S {"band":9999}: 1p 2x? per undefined - H13-ABS (1)`
  - `FAIL placevalue:identify lesson S {"band":99999}: 3p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson M {"band":99999}: 3p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson L {"band":99999}: 4p 1x? per undefined - OVERFLOW (16)`
  - `FAIL placevalue:identify lesson S {"band":999999}: 3p 1x? per undefined - OVERFLOW, H13-ABS (17)`
  - `FAIL placevalue:identify lesson M {"band":999999}: 3p 1x? per undefined - OVERFLOW, H13-ABS (17)`
- **ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2)** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/render-gate-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:unit_form --roles more-practice,opener,scripted-model,guided,error-analysis,review,pre-skill-check,mixed-practice,true-false,reason-it --size S,M,L --gate --no-screen --out /tmp/mq-precritic/20261108-141914-28161/render-gate-unit_form`
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
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/cell-checks-unit_form.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:unit_form --card --card-opts --h13-abs --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `ok   placevalue:unit_form error-analysis S: 1p 1x? per 6`
  - `ok   placevalue:unit_form error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:unit_form error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:unit_form reason-it S: 1p 1x? per 4 - OVERFLOW (4)`
  - `FAIL placevalue:unit_form reason-it M: 1p 1x? per 3 - OVERFLOW (3)`
  - `FAIL placevalue:unit_form reason-it L: 1p 1x? per 2 - OVERFLOW (3)`
  - `FAIL placevalue:unit_form lesson S {"band":99}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:unit_form lesson M {"band":99}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:unit_form guided S {"band":99}: 1p 2x? per undefined - H13-ABS (10)`
  - `FAIL placevalue:unit_form guided M {"band":99}: 1p 2x? per undefined - H13-ABS (8)`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --h13-abs** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/cell-checks-value.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:value --card --card-opts --h13-abs --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `ok   placevalue:value error-analysis S: 1p 2x? per 6`
  - `ok   placevalue:value error-analysis M: 1p 1x? per 4`
  - `ok   placevalue:value error-analysis L: 1p 1x? per 4`
  - `FAIL placevalue:value lesson L {"band":99}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:value guided L {"band":99}: 1p 3x? per undefined - H13-ABS (7)`
  - `FAIL placevalue:value review S {"band":99}: 1p 4x? per undefined - H13-ABS (4)`
  - `FAIL placevalue:value review M {"band":99}: 1p 3x? per undefined - H13-ABS (3)`
  - `FAIL placevalue:value lesson L {"band":9999}: 3p 1x? per undefined - H13-ABS (2)`
  - `FAIL placevalue:value guided L {"band":9999}: 1p 3x? per undefined - H13-ABS (7)`
  - `FAIL placevalue:value review S {"band":9999}: 1p 4x? per undefined - H13-ABS (4)`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261108-141914-28161/screen-slots.json --uniform --screen-digit --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
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
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261108-141914-28161/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --json /tmp/mq-precritic/20261108-141914-28161/sibling-compare.json`
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
- **ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261108-141914-28161/print-lint-review-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles review --size S --lints L-DENSITY --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `placevalue:value#review: 2+1 pages, 4 finding(s)`

ws-precritic: FAIL: 15 FAIL, 26 PASS, 1 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 43 (FAIL: empty-band, coverage-matrix, print-lint-lesson-L, print-lint-lesson-S, print-lint-sections-S, print-lint-sections-L, cell-checks-expand, cell-checks-combine, cell-checks-identify, render-gate-unit_form, cell-checks-unit_form, cell-checks-value, screen-slots, sibling-compare, print-lint-review-S; N/A (ran, nothing to check): card-not-offered; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): spec-card-signed)
