ws-precritic: 43 gate(s) (29 browser), logs /tmp/mq-precritic/20261113-040944-13713
  PASS            ws-node-lint (0 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (1 s)
  PASS            ws-code-snapshot (3 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (0 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  N/A             ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (0 s)
  PASS            ws-content-audit --skill (5 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  FAIL            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (1 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (2 s)
  PASS            ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) (0 s)
  PASS            ws-options-verify --skill (17 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (25 s)
  FAIL            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (59 s, waited 49 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (82 s, waited 70 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity (173 s, waited 57 s for a slot)
  FAIL            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (32 s, waited 21 s for a slot)
  PASS            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (200 s)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (26 s, waited 13 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (24 s, waited 11 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (130 s, waited 54 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (276 s, waited 53 s for a slot)
  PASS            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) (193 s, waited 69 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (66 s, waited 45 s for a slot)
  PASS            ws-screen-answer --skills (44 s, waited 28 s for a slot)
  PASS            ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) (31 s, waited 28 s for a slot)
  PASS            ws-boot-smoke (75 s, waited 70 s for a slot)
  PASS            ws-chromebook-fit --skills (161 s, waited 16 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (140 s, waited 71 s for a slot)
  FAIL            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (123 s, waited 56 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (66 s, waited 55 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (48 s, waited 35 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (46 s, waited 31 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (84 s, waited 43 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (113 s, waited 54 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (89 s, waited 50 s for a slot)
  PASS            ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (69 s, waited 42 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (43 s, waited 31 s for a slot)
  PASS            ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) (33 s, waited 25 s for a slot)
  PASS            ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  (68 s, waited 56 s for a slot)
  PASS            ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  (195 s, waited 21 s for a slot)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1155 s)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (203 s)

### ws-precritic — --skill placevalue:compare

commit `a837b8d4dc` (claude/lf-placevalue-w2) · started 2026-11-13T04:09:44Z · finished 2026-11-13T04:35:43Z · wall 1559 s · logs `/tmp/mq-precritic/20261113-040944-13713`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | placevalue:compare | PASS | 1 of 1 skills checked | 1 |
| ws-content-audit --skill | placevalue:compare | PASS | 1 skill(s) audited | 5 |
| ws-options-verify --skill | placevalue:compare | PASS | 11 value(s) checked; 0 failing, 0 pinned, 0 new | 17 |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity | placevalue:compare × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (264) | 173 (57 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 25 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | placevalue:compare × kinds × S/M/L | PASS | 8 of 33 row(s) run × S/M/L: OK 8, RED 0, ERROR 0; PENDING 19, N/A 6 | 200 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | FAIL | 18 found in 1 of 1 doc(s); 1 (document, lint, rule) count(s) above the pin | 59 (49 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 82 (70 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | FAIL | 24 found in 1 of 1 doc(s); 1 (document, lint, rule) count(s) above the pin | 32 (21 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | FAIL | 10 found in 1 of 1 doc(s); 2 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:compare (must be clean) | 26 (13 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | FAIL | 10 found in 1 of 1 doc(s); 2 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:compare (must be clean) | 24 (11 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | placevalue:compare × lesson, test, independent × S/M/L + screen hosts | PASS | - | 130 (54 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:compare × 10 roles × S/M/L | PASS | - | 276 (53 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | placevalue:compare × 13 roles + 20 option values × S/M/L | PASS | - | 193 (69 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | placevalue:compare | FAIL | 3 found, 0 pinned, 3 new (14 host renders, --baseline design/audit/baselines/screen-slots.json) | 66 (45 waiting) |
| ws-screen-answer --skills | placevalue:compare | PASS | - | 44 (28 waiting) |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | placevalue:compare | PASS | - | 31 (28 waiting) |
| ws-chromebook-fit --skills | placevalue:compare | PASS | - | 161 (16 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 3 |
| ws-boot-smoke | app boot | PASS | - | 75 (70 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | placevalue:compare: matrix rows with findings | FAIL | worse than siblings: 3 count(s) above the approved siblings in 3 row(s), 0 with no sibling measured, 0 ERROR row(s); 17 at or below (engine) in 5 printed row(s) with findings (PENDING(no-baseline) 5; siblings per skill: compare: 5) | 1155 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | placevalue:compare × matrix rows × S/M/L + extras at S | PASS | 13 matrix row(s) × S/M/L + 2 extra document(s) (test, more-practice, supports on): 41 document(s), SLOT 0 / CLIP 0 finding(s), 140 box segment(s) and 0 head(s) probed (SLOT-W N/A on 26, HEADS N/A on 41 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 203 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | placevalue:compare × 390x844, 390x664 | PASS | - | 140 (71 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | placevalue:compare | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | placevalue:compare | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | placevalue:compare | N/A | no operand-dealt items (nothing to deal evenly): placevalue:compare | 0 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | placevalue:compare | PASS | 1 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.5 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | placevalue:compare | FAIL | exit 1 (ws-node-lint: FAIL (1); not accounted for by the parsed findings); 1 found, 1 pinned, 0 new; ws-node-lint: FAIL (1) | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | placevalue:compare | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-12; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | placevalue:compare × S/L | FAIL | 2 value page(s) worse than the default: compare band=999999 @S, compare band=99 @L; 14 value page(s) (1 skill(s) x S/L) against 2 default page(s) through ws-print-lint --source kit in 67 s; 0 n/a; findings the default pa | 123 (56 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 66 (55 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 48 (35 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 46 (31 waiting) |
| ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 84 (43 waiting) |
| ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 113 (54 waiting) |
| ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 89 (50 waiting) |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 69 (42 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 43 (31 waiting) |
| ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) | placevalue:compare | PASS | - | 33 (25 waiting) |
| ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) | placevalue:compare | PASS | - | 0 |
| ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 195 (21 waiting) |
| ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 68 (56 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/empty-band.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:compare --vocab-ink --page-fill --screen-parity --rule-skills placevalue:compare`
  - `EB-BAND  FAIL 254`
  - `EB-SIDE  FAIL 5`
  - `ws-empty-band: FAIL (264)`
- **ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/print-lint-kit.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --skills placevalue:compare --baseline design/audit/baselines/print-lint.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:compare`
  - `- placevalue:compare L-DENSITY H13-ABS: 0 -> 18`
- **ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/print-lint-kit-M.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --size M --skills placevalue:compare --baseline design/audit/baselines/print-lint.M.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:compare`
  - `- placevalue:compare L-DENSITY H13-ABS: 0 -> 24`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:compare --baseline design/audit/baselines/print-lint.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:compare`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:compare#lesson L-DENSITY H13-ABS: 0 -> 9`
  - `- placevalue:compare#lesson L-DENSITY PAGEFILL: 0 -> 1`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:compare --baseline design/audit/baselines/print-lint.S.json --rules H13-ABS,GRID-EVEN-ALL --rule-skills placevalue:compare`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:compare#lesson L-DENSITY H13-ABS: 0 -> 9`
  - `- placevalue:compare#lesson L-DENSITY PAGEFILL: 0 -> 1`
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:compare --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261113-040944-13713/screen-slots.json --uniform --screen-digit --rule-skills placevalue:compare`
  - `NEW placevalue:compare                           worksheet@1280 SCREEN-DIGIT the numeral "558" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:compare                           worksheet@820  SCREEN-DIGIT the numeral "558" is 29 px (want >= 48 px at 820)`
  - `NEW placevalue:compare                           worksheet@390  SCREEN-DIGIT the numeral "558" is 29 px (want >= 40 px at 390)`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261113-040944-13713/coverage-matrix.json --skills placevalue:compare --run-siblings --json /tmp/mq-precritic/20261113-040944-13713/sibling-compare.json`
  - `ABOVE      placevalue:compare|mixed/defaults L L-DENSITY PG-23: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-each L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-group L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
- **ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/node-lint-s1.log`); rerun alone: `node tests/scripts/ws-node-lint.mjs --skill placevalue:compare --rules LESSON-DATA,OPTION-HELP,WRONG-FITS,WRONG-FITS-SLOTS,WRONG-FILL --baseline tests/fixtures/precritic/node-lint-s1.baseline.json --json /tmp/mq-precritic/20261113-040944-13713/node-lint-s1.json --rule-skills placevalue:compare`
  - `NEW findings not in the baseline (1; key = rule|kind|#item|signature):`
  - `placevalue:compare LESSON-DATA|no-lesson-data|#1|placevalue:compare`
  - `the lesson page falls back: lessons/prereqs.js LESSONS has no entry for placevalue:compare (the sheet prints "No lesson data for this skill yet"; the Warm-up deals the skills listed before it)`
  - `json: /tmp/mq-precritic/20261113-040944-13713/node-lint-s1.json`
  - `time: load 0.3 s, lint 0.2 s, total 0.5 s`
  - `ws-node-lint: FAIL (1)`
- **ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13** (exit 1, `/tmp/mq-precritic/20261113-040944-13713/options-render.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --render --skill placevalue:compare --bands --band-h13 --rule-skills placevalue:compare`
  - `FAIL placevalue:compare S band=999999: L-DENSITY H13-ABS: 16 on a band page (judged absolutely, --band-h13) (an empty band 12.1 mm tall under the lowest ink of a 28.1 mm cell (43%; limit 30 % of the cell = 8.4 mm (RUBRIC`
  - `FAIL placevalue:compare L band=99: L-DENSITY H13-ABS: 18 on a band page (judged absolutely, --band-h13) (an empty band 15.3 mm tall under the lowest ink of a 37.3 mm cell (41%; limit 30 % of the cell = 11.2 mm (RUBRIC H1`

ws-precritic: FAIL: 9 FAIL, 31 PASS, 2 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 43 (FAIL: empty-band, print-lint-kit, print-lint-kit-M, print-lint-lesson-L, print-lint-lesson-S, screen-slots, sibling-compare, node-lint-s1, options-render; N/A (ran, nothing to check): card-not-offered, dealer-uniform; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings)
