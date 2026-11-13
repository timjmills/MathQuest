# precritic compare r5 (lf-placevalue compare r4 builder, after critic r2 FAIL; Opus medium)

`node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict` on 7b7280ff (the compare r4 fixes + item 11). 5 red gates,
the same five as r4 (precritic-compare-r4.md); none is pv. A first run on 8bf627f0 also had print-lint-lesson-L, the render gate
and words-rowy-1000 red: one lesson L p2 Guided cell overflowed (1.3 mm wide, 0.8 mm tall) from the r4 digit box's room - fixed in
7b7280ff (the room and the taller count gap only in a state that draws the box), all three PASS here.

## Red rows: owner

| Row | Red | Owner |
|---|---|---|
| ws-empty-band (34) | EB-BAND 26 / EB-SIDE 7 / EB-PAGE 1: opener S / M / L, scripted-model S / M / L, lesson S / M (one band each), pre-skill-check L EB-PAGE - the r4 set (34 then too) | D3 (lf-engine opener, lf-roles scripted-model / pre-skill-check, lf-engine lesson pages; as r4) |
| ws-coverage-matrix | single/more-cols2+afterpage S, more-cols2+short S PAGEFILL (CL-2c teacher columns), single/pages-3 L PAGEFILL (PT-ENG-6) | ruled (as r4) |
| ws-cell-checks --card --card-opts | PUPILTAG 168: error-analysis M "Name wrote:" label vs PT-ERR-4 (every band); OVERFLOW 4: opener L band 999,999 Model cell (pupil + key) | D3 (lf-roles PT-ERR-4 label geometry; lf-engine opener Model cell; as r4) |
| ws-screen-slots --screen-digit | worksheet 29 px numerals (the SP table's worksheet digit) | D3 hosts lane (as r2-r4) |
| ws-sibling-compare | mixed/defaults L PG-23 2, sections ex-each / ex-group L DN-2 2+2, sections/pages-2 H13 6 / 6 / 12 (one-row page stretched, PG-23), single/pages-3 L PAGEFILL 1 | D3 / ruled (pagination PG-23 / DN-2 engine; pages-3 PT-ENG-6 ruled; as r4) |

## Raw table (7b7280ff)
```
ws-precritic: 51 gate(s) (35 browser), logs /tmp/mq-precritic/20261113-174128-17961
  PASS            ws-roles-unit (shared page roles) (0 s)
  PASS            ws-node-lint (0 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (1 s)
  PASS            ws-code-snapshot (2 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (0 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  N/A             ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (0 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-content-audit --skill (6 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (0 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (1 s)
  PASS            ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) (1 s)
  PASS            ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES; compare r2 N3 / N7: SIGN-PARITY, EQ-SHARE) (4 s)
  PASS            ws-capacity-pin --check (items a page never fall against the pinned master page) (22 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (24 s)
  PASS            ws-options-verify --skill (72 s, waited 56 s for a slot)
  PASS            ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) (88 s, waited 70 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot (176 s, waited 53 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (46 s, waited 34 s for a slot)
  FAIL            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (212 s)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (27 s, waited 14 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (16 s, waited 1 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (74 s, waited 58 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (80 s, waited 64 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (136 s, waited 46 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (296 s, waited 39 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (122 s, waited 98 s for a slot)
  PASS            ws-screen-answer --skills (100 s, waited 83 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles (411 s, waited 120 s for a slot)
  PASS            ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) (66 s, waited 63 s for a slot)
  PASS            ws-boot-smoke (52 s, waited 49 s for a slot)
  PASS            ws-chromebook-fit --skills (192 s, waited 47 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (151 s, waited 79 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (67 s, waited 52 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (136 s, waited 61 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (52 s, waited 41 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (50 s, waited 31 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (90 s, waited 43 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (124 s, waited 60 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (94 s, waited 56 s for a slot)
  PASS            ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (71 s, waited 44 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (56 s, waited 39 s for a slot)
  PASS            ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) (48 s, waited 37 s for a slot)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1255 s)
  PASS            ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  (16 s, waited 3 s for a slot)
  PASS            ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  (133 s, waited 116 s for a slot)
  PASS            ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  (241 s, waited 11 s for a slot)
  PASS            ws-screen-ink-size --only TEXT-SIZE --no-baseline on identify / unit_form / value (opt-in lf-placevalue lead 15:35: identify's screen numeral 30 px under the card / quiz digit floor 40-56 px; unit_form / value words 14 pt under their 16 pt print) (83 s, waited 51 s for a slot)
  PASS            ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS; lf-roles review of compare r3 b2: MODEL-RESERVE; compare r2 N1 / N2 / N4 / N7 / F9: TOF-SHARE, MARK-CLEAR, MODEL-M6, EQ-SHARE-PAGE, WRAP-SIGN, SIDE-PAD) (188 s, waited 82 s for a slot)
  PASS            ws-pv-identify-heads (opt-in lf-placevalue lead ruling PEDAGOGY 4.1a 2026-11-13: identify's place heads off on Review / Test / pre-skill check and the quiz, kept on Practice / Mixed; lead 14:24: a chosen support kept, PV-HEADS-CHOSEN; compare r2 N8: PV-HEADS-GRADE-QUIZ) (59 s, waited 24 s for a slot)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (405 s)

### ws-precritic — --skill placevalue:compare

commit `7b7280ff9d` (claude/lf-placevalue-w2) · started 2026-11-13T17:41:28Z · finished 2026-11-13T18:12:41Z · wall 1873 s · logs `/tmp/mq-precritic/20261113-174128-17961`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | placevalue:compare | PASS | 1 of 1 skills checked | 1 |
| ws-roles-unit (shared page roles) | shared roles | PASS | - | 0 |
| ws-capacity-pin --check (items a page never fall against the pinned master page) | placevalue:compare | PASS | - | 22 |
| ws-content-audit --skill | placevalue:compare | PASS | 1 skill(s) audited | 6 |
| ws-options-verify --skill | placevalue:compare | PASS | 11 value(s) checked; 0 failing, 0 pinned, 0 new | 72 (56 waiting) |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot | placevalue:compare × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (34) | 176 (53 waiting) |
| ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) | placevalue:compare | PASS | - | 88 (70 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 24 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | placevalue:compare × kinds × S/M/L | FAIL | 8 of 33 row(s) run × S/M/L: OK 5, RED 3 (3 not in the pin), ERROR 0; PENDING 19, N/A 6; rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --write-baseline; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 212 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 46 (34 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 27 (14 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 16 (1 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 74 (58 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 80 (64 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | placevalue:compare × lesson, test, independent × S/M/L + screen hosts | PASS | - | 136 (46 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:compare × 10 roles × S/M/L | PASS | - | 296 (39 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles | placevalue:compare × 13 roles + 20 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 172 finding(s) (PUPILTAG 168, OVERFLOW 4) on 639 page(s), 286s | 411 (120 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | placevalue:compare | FAIL | 3 found, 0 pinned, 3 new (14 host renders, --baseline design/audit/baselines/screen-slots.json) | 122 (98 waiting) |
| ws-screen-answer --skills | placevalue:compare | PASS | - | 100 (83 waiting) |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | placevalue:compare | PASS | - | 66 (63 waiting) |
| ws-chromebook-fit --skills | placevalue:compare | PASS | - | 192 (47 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 52 (49 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | placevalue:compare: matrix rows with findings | FAIL | worse than siblings: 7 count(s) above the approved siblings in 5 row(s), 0 with no sibling measured, 0 ERROR row(s); 19 at or below (engine) in 8 printed row(s) with findings (PENDING(no-baseline) 5, RED 3; siblings per skill: compare: 5) | 1255 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | placevalue:compare × matrix rows × S/M/L + extras at S | PASS | 13 matrix row(s) × S/M/L + 2 extra document(s) (test, more-practice, supports on): 41 document(s), SLOT 0 / CLIP 0 finding(s), 140 box segment(s) and 0 head(s) probed (SLOT-W N/A on 26, HEADS N/A on 41 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 405 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | placevalue:compare × 390x844, 390x664 | PASS | - | 151 (79 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | placevalue:compare | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | placevalue:compare | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | placevalue:compare | N/A | no operand-dealt items (nothing to deal evenly): placevalue:compare | 0 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | placevalue:compare | PASS | 1 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.6 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | placevalue:compare | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-12; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 1 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | placevalue:compare × S/L | PASS | 14 value page(s) (1 skill(s) x S/L) against 2 default page(s) through ws-print-lint --source kit in 74 s; 0 n/a | 136 (61 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 67 (52 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 52 (41 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 50 (31 waiting) |
| ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 90 (43 waiting) |
| ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 124 (60 waiting) |
| ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 94 (56 waiting) |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 71 (44 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 56 (39 waiting) |
| ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) | placevalue:compare | PASS | - | 48 (37 waiting) |
| ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) | placevalue:compare | PASS | - | 1 |
| ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 241 (11 waiting) |
| ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 16 (3 waiting) |
| ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 133 (116 waiting) |
| ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES; compare r2 N3 / N7: SIGN-PARITY, EQ-SHARE) | placevalue:compare | PASS | - | 4 |
| ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS; lf-roles review of compare r3 b2: MODEL-RESERVE; compare r2 N1 / N2 / N4 / N7 / F9: TOF-SHARE, MARK-CLEAR, MODEL-M6, EQ-SHARE-PAGE, WRAP-SIGN, SIDE-PAD) | placevalue:compare | PASS | - | 188 (82 waiting) |
| ws-screen-ink-size --only TEXT-SIZE --no-baseline on identify / unit_form / value (opt-in lf-placevalue lead 15:35: identify's screen numeral 30 px under the card / quiz digit floor 40-56 px; unit_form / value words 14 pt under their 16 pt print) | placevalue:compare | PASS | - | 83 (51 waiting) |
| ws-pv-identify-heads (opt-in lf-placevalue lead ruling PEDAGOGY 4.1a 2026-11-13: identify's place heads off on Review / Test / pre-skill check and the quiz, kept on Practice / Mixed; lead 14:24: a chosen support kept, PV-HEADS-CHOSEN; compare r2 N8: PV-HEADS-GRADE-QUIZ) | placevalue:compare | PASS | - | 59 (24 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot** (exit 1, `/tmp/mq-precritic/20261113-174128-17961/empty-band.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:compare --vocab-ink --page-fill --screen-parity --grid-foot --rule-skills placevalue:compare`
  - `EB-BAND  FAIL 26`
  - `EB-SIDE  FAIL 7`
  - `EB-PAGE  FAIL 1`
  - `ws-empty-band: FAIL (34)`
- **ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5** (exit 1, `/tmp/mq-precritic/20261113-174128-17961/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261113-174128-17961/coverage-matrix.json --red-no-baseline PAGEFILL,H5 --rule-skills placevalue:compare`
  - `RED placevalue:compare|single/more-cols2+afterpage (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/more-cols2+short (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/pages-3 (not in the pin)`
  - `+ L L-DENSITY PAGEFILL: 0 -> 1`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles** (exit 1, `/tmp/mq-precritic/20261113-174128-17961/cell-checks-compare.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:compare --card --card-opts --opt-roles lesson,independent,guided,test,review,true-false,reason-it,error-analysis,opener,scripted-model --rule-skills placevalue:compare`
  - `ok   placevalue:compare error-analysis S: 1p 2x? per 6`
  - `FAIL placevalue:compare error-analysis M: 1p 1x? per 4 - PUPILTAG (8)`
  - `ok   placevalue:compare error-analysis L: 1p 1x? per 4`
  - `ok   placevalue:compare error-analysis S {"band":99}: 1p 2x? per 6`
  - `FAIL placevalue:compare error-analysis M {"band":99}: 1p 1x? per 4 - PUPILTAG (8)`
  - `ok   placevalue:compare error-analysis L {"band":99}: 1p 1x? per 4`
  - `ok   placevalue:compare error-analysis S {"band":9999}: 1p 2x? per 6`
  - `FAIL placevalue:compare error-analysis M {"band":9999}: 1p 1x? per 4 - PUPILTAG (8)`
  - `ok   placevalue:compare error-analysis L {"band":9999}: 1p 1x? per 4`
  - `ok   placevalue:compare error-analysis S {"band":99999}: 1p 2x? per 6`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261113-174128-17961/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:compare --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261113-174128-17961/screen-slots.json --uniform --screen-digit --rule-skills placevalue:compare`
  - `NEW placevalue:compare                           worksheet@1280 SCREEN-DIGIT the numeral "593" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:compare                           worksheet@820  SCREEN-DIGIT the numeral "593" is 29 px (want >= 48 px at 820)`
  - `NEW placevalue:compare                           worksheet@390  SCREEN-DIGIT the numeral "593" is 29 px (want >= 40 px at 390)`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261113-174128-17961/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261113-174128-17961/coverage-matrix.json --skills placevalue:compare --run-siblings --json /tmp/mq-precritic/20261113-174128-17961/sibling-compare.json`
  - `ABOVE      placevalue:compare|mixed/defaults L L-DENSITY PG-23: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-each L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-group L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 S L-DENSITY H13: ours 6, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 M L-DENSITY H13: ours 6, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 L L-DENSITY H13: ours 12, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|single/pages-3 L L-DENSITY PAGEFILL: ours 1, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`

ws-precritic: FAIL: 5 FAIL, 43 PASS, 2 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 51 (FAIL: empty-band, coverage-matrix, cell-checks-compare, screen-slots, sibling-compare; N/A (ran, nothing to check): card-not-offered, dealer-uniform; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings)
```
