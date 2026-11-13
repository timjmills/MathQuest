ws-precritic: 43 gate(s) (29 browser), logs /tmp/mq-precritic/20261113-055600-25987
  PASS            ws-node-lint (0 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (1 s)
  PASS            ws-code-snapshot (2 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  N/A             ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (1 s)
  PASS            ws-content-audit --skill (6 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (0 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (2 s)
  PASS            ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) (1 s)
  PASS            ws-options-verify --skill (17 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (24 s)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (61 s, waited 50 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (82 s, waited 70 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot (180 s, waited 56 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (38 s, waited 26 s for a slot)
  FAIL            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (205 s)
  PASS            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (27 s, waited 13 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (23 s, waited 8 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (135 s, waited 52 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (307 s, waited 67 s for a slot)
  PASS            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (210 s, waited 82 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (70 s, waited 47 s for a slot)
  PASS            ws-screen-answer --skills (57 s, waited 40 s for a slot)
  PASS            ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) (28 s, waited 25 s for a slot)
  PASS            ws-boot-smoke (88 s, waited 84 s for a slot)
  PASS            ws-chromebook-fit --skills (159 s, waited 10 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (132 s, waited 62 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (139 s, waited 71 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (81 s, waited 68 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (36 s, waited 24 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (38 s, waited 23 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (58 s, waited 16 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (95 s, waited 42 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (91 s, waited 56 s for a slot)
  PASS            ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (63 s, waited 38 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (38 s, waited 26 s for a slot)
  PASS            ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) (32 s, waited 23 s for a slot)
  PASS            ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  (206 s, waited 19 s for a slot)
  PASS            ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  (201 s, waited 188 s for a slot)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1338 s)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (217 s)

### ws-precritic — --skill placevalue:compare

commit `da76944f52` (claude/lf-placevalue-w2) · started 2026-11-13T05:56:00Z · finished 2026-11-13T06:25:22Z · wall 1762 s · logs `/tmp/mq-precritic/20261113-055600-25987`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | placevalue:compare | PASS | 1 of 1 skills checked | 1 |
| ws-content-audit --skill | placevalue:compare | PASS | 1 skill(s) audited | 6 |
| ws-options-verify --skill | placevalue:compare | PASS | 11 value(s) checked; 0 failing, 0 pinned, 0 new | 17 |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot | placevalue:compare × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (53) | 180 (56 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 24 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | placevalue:compare × kinds × S/M/L | FAIL | 8 of 33 row(s) run × S/M/L: OK 5, RED 3 (3 not in the pin), ERROR 0; PENDING 19, N/A 6; rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --write-baseline; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 205 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 61 (50 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 82 (70 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 38 (26 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 27 (13 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 23 (8 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | placevalue:compare × lesson, test, independent × S/M/L + screen hosts | PASS | - | 135 (52 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:compare × 10 roles × S/M/L | PASS | - | 307 (67 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:compare × 13 roles + 20 option values × S/M/L | PASS | - | 210 (82 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | placevalue:compare | FAIL | 3 found, 0 pinned, 3 new (14 host renders, --baseline design/audit/baselines/screen-slots.json) | 70 (47 waiting) |
| ws-screen-answer --skills | placevalue:compare | PASS | - | 57 (40 waiting) |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | placevalue:compare | PASS | - | 28 (25 waiting) |
| ws-chromebook-fit --skills | placevalue:compare | PASS | - | 159 (10 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 88 (84 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | placevalue:compare: matrix rows with findings | FAIL | worse than siblings: 4 count(s) above the approved siblings in 4 row(s), 0 with no sibling measured, 0 ERROR row(s); 19 at or below (engine) in 8 printed row(s) with findings (PENDING(no-baseline) 5, RED 3; siblings per skill: compare: 5) | 1338 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | placevalue:compare × matrix rows × S/M/L + extras at S | PASS | 13 matrix row(s) × S/M/L + 2 extra document(s) (test, more-practice, supports on): 41 document(s), SLOT 0 / CLIP 0 finding(s), 140 box segment(s) and 0 head(s) probed (SLOT-W N/A on 26, HEADS N/A on 41 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 217 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | placevalue:compare × 390x844, 390x664 | PASS | - | 132 (62 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | placevalue:compare | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | placevalue:compare | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | placevalue:compare | N/A | no operand-dealt items (nothing to deal evenly): placevalue:compare | 1 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | placevalue:compare | PASS | 1 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.6 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | placevalue:compare | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-12; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | placevalue:compare × S/L | PASS | 14 value page(s) (1 skill(s) x S/L) against 2 default page(s) through ws-print-lint --source kit in 67 s; 0 n/a | 139 (71 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 81 (68 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 36 (24 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 38 (23 waiting) |
| ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 58 (16 waiting) |
| ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 95 (42 waiting) |
| ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 91 (56 waiting) |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 63 (38 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 38 (26 waiting) |
| ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) | placevalue:compare | PASS | - | 32 (23 waiting) |
| ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) | placevalue:compare | PASS | - | 1 |
| ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 206 (19 waiting) |
| ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 201 (188 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot** (exit 1, `/tmp/mq-precritic/20261113-055600-25987/empty-band.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:compare --vocab-ink --page-fill --screen-parity --grid-foot --rule-skills placevalue:compare`
  - `EB-BAND  FAIL 48`
  - `EB-SIDE  FAIL 5`
  - `ws-empty-band: FAIL (53)`
- **ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5** (exit 1, `/tmp/mq-precritic/20261113-055600-25987/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261113-055600-25987/coverage-matrix.json --red-no-baseline PAGEFILL,H5 --rule-skills placevalue:compare`
  - `RED placevalue:compare|single/more-cols2+afterpage (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/more-cols2+short (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/pages-3 (not in the pin)`
  - `+ L L-DENSITY PAGEFILL: 0 -> 1`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261113-055600-25987/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:compare --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261113-055600-25987/screen-slots.json --uniform --screen-digit --rule-skills placevalue:compare`
  - `NEW placevalue:compare                           worksheet@1280 SCREEN-DIGIT the numeral "558" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:compare                           worksheet@820  SCREEN-DIGIT the numeral "558" is 29 px (want >= 48 px at 820)`
  - `NEW placevalue:compare                           worksheet@390  SCREEN-DIGIT the numeral "558" is 29 px (want >= 40 px at 390)`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261113-055600-25987/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261113-055600-25987/coverage-matrix.json --skills placevalue:compare --run-siblings --json /tmp/mq-precritic/20261113-055600-25987/sibling-compare.json`
  - `ABOVE      placevalue:compare|mixed/defaults L L-DENSITY PG-23: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-each L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-group L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|single/pages-3 L L-DENSITY PAGEFILL: ours 1, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`

ws-precritic: FAIL: 4 FAIL, 36 PASS, 2 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 43 (FAIL: empty-band, coverage-matrix, screen-slots, sibling-compare; N/A (ran, nothing to check): card-not-offered, dealer-uniform; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings)
