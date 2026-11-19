# precritic compare r4 (lf-placevalue compare r3 builder, after critic r1 FAIL; Opus medium)

`node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict` on 74236092 (branch merged with master e4d12d6a). Raw
table at the bottom. A first run on f0d0ac7d found three merge / tool problems, fixed before this run: ws-spec-card (a new rule-id
citation in pv.js), the empty-band row running WITHOUT the lane's opt-in flags (the master merge pushed `--vocab-ink` /
`--screen-parity` past ws-precritic's 80-line srcHas window), and 234 false EB-FOOT on CL-4d centred cells (ws-empty-band
patched: a centred line's white above is the row's stretch).

## Red rows: owner

| Row | Red | Owner |
|---|---|---|
| ws-empty-band (34) | EB-BAND opener S 10 / M 4 / L 4, scripted-model 3+3+2; EB-SIDE scripted-model 5, lesson S / M 1+1; EB-PAGE pre-skill-check L 1 (new with the master merge: also red on d78c6aab before any r3 step-3/4 change) | D3 (lf-engine opener, lf-roles scripted-model / pre-skill-check, lf-checks EB-SIDE gap) |
| ws-coverage-matrix | single/more-cols2+afterpage S, more-cols2+short S (CL-2c teacher columns, ruled), single/pages-3 L PAGEFILL (PT-ENG-6, ruled; red on 023cafca too). single/ex-group L: FIXED (r3 step 2) | ruled |
| ws-cell-checks --card --card-opts | PUPILTAG 168: error-analysis M, the "Name wrote:" label 1.8 mm over its work (PT-ERR-4 2-4 mm) - a rule new in master, identical on d78c6aab; OVERFLOW 4: opener L band 999,999 Model cell (as r3) | D3 (lf-roles PT-ERR-4 label geometry; lf-engine opener Model cell) |
| ws-screen-slots --screen-digit | worksheet 29 px numerals | D3 hosts lane (as r2 / r3) |
| ws-sibling-compare | PG-23 / DN-2 mixed + sections pagination (as r3); sections/pages-2 H13 6/6/12: a one-row page stretched to the page (PG-23) - CL-4d now centres that row, so its white counts above AND below (was 6 at L, + L-TOPSTART CL-4d 6, now 0); single / sections ex-each H13 (rows held by the worked twin beside the problem, 3.3 x the line: centred by CL-4d, each band 33 %, where the top cell's band was exempt writing room) | D3 lf-engine (PG-23 / DN-2); ex-each: needs a lead ruling (CL-4d vs H13 on side-by-side rows the twin sizes) |

## Pixel ws-empty-band compare totals (lf-checks tool 3a7b2392, `--vocab-ink --page-fill --margin 2 --no-baseline --hosts none`)
- before 023cafca: 337 (independent 72, more-practice 72, option pages 72, guided 25, lesson 21, mixed-practice 18, opener 30, scripted-model 17, review 10)
- after f0d0ac7d: 93 (independent 0, more-practice 0, option pages 0, guided 0; lesson 17 (EB-BAND 13, EB-SIDE 4), opener 30, scripted-model 17, review 10, mixed-practice 18, pre-skill-check EB-PAGE 1 - a role new with the master merge)
- the precritic row (today's ws-empty-band with the lane flags): 023cafca 58 -> 74236092 34

## Raw table (74236092)
```
ws-precritic: 49 gate(s) (33 browser), logs /tmp/mq-precritic/20261113-130430-30905
  PASS            ws-roles-unit (shared page roles) (0 s)
  PASS            ws-node-lint (1 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (1 s)
  PASS            ws-code-snapshot (2 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (1 s)
  N/A             ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (0 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-content-audit --skill (7 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (1 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (2 s)
  PASS            ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) (1 s)
  PASS            ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES) (6 s)
  PASS            ws-capacity-pin --check (items a page never fall against the pinned master page) (22 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (32 s)
  PASS            ws-options-verify --skill (83 s, waited 68 s for a slot)
  PASS            ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) (93 s, waited 78 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot (179 s, waited 54 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (30 s, waited 18 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (25 s, waited 12 s for a slot)
  FAIL            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (229 s)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH (25 s, waited 13 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (18 s, waited 5 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (84 s, waited 64 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (151 s, waited 61 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (314 s, waited 74 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles (316 s, waited 55 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (98 s, waited 76 s for a slot)
  PASS            ws-screen-answer --skills (46 s, waited 31 s for a slot)
  PASS            ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) (28 s, waited 24 s for a slot)
  PASS            ws-boot-smoke (33 s, waited 30 s for a slot)
  PASS            ws-chromebook-fit --skills (158 s, waited 15 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (182 s, waited 110 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (130 s, waited 62 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (75 s, waited 63 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (60 s, waited 47 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (69 s, waited 54 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (57 s, waited 16 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (101 s, waited 42 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (75 s, waited 40 s for a slot)
  PASS            ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (55 s, waited 30 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (52 s, waited 40 s for a slot)
  PASS            ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) (22 s, waited 12 s for a slot)
  PASS            ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  (60 s, waited 47 s for a slot)
  PASS            ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  (85 s, waited 70 s for a slot)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1258 s)
  PASS            ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  (235 s, waited 45 s for a slot)
  PASS            ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS) (81 s, waited 45 s for a slot)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (245 s)

```
### ws-precritic — --skill placevalue:compare

commit `74236092c3` (claude/lf-placevalue-w2) · started 2026-11-13T13:04:30Z · finished 2026-11-13T13:33:24Z · wall 1734 s · logs `/tmp/mq-precritic/20261113-130430-30905`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | placevalue:compare | PASS | 1 of 1 skills checked | 1 |
| ws-roles-unit (shared page roles) | shared roles | PASS | - | 0 |
| ws-capacity-pin --check (items a page never fall against the pinned master page) | placevalue:compare | PASS | - | 22 |
| ws-content-audit --skill | placevalue:compare | PASS | 1 skill(s) audited | 7 |
| ws-options-verify --skill | placevalue:compare | PASS | 11 value(s) checked; 0 failing, 0 pinned, 0 new | 83 (68 waiting) |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot | placevalue:compare × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (34) | 179 (54 waiting) |
| ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) | placevalue:compare | PASS | - | 93 (78 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 32 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | placevalue:compare × kinds × S/M/L | FAIL | 8 of 33 row(s) run × S/M/L: OK 5, RED 3 (3 not in the pin), ERROR 0; PENDING 19, N/A 6; rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --write-baseline; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 229 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 30 (18 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 25 (12 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | placevalue:compare | PASS | 0 found (1 doc(s)) | 25 (13 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 18 (5 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s)) | 84 (64 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | placevalue:compare × lesson, test, independent × S/M/L + screen hosts | PASS | - | 151 (61 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | placevalue:compare × 10 roles × S/M/L | PASS | - | 314 (74 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles | placevalue:compare × 13 roles + 20 option values × S/M/L | FAIL | ws-cell-checks: FAIL - 172 finding(s) (PUPILTAG 168, OVERFLOW 4) on 639 page(s), 257s | 316 (55 waiting) |
| ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit | placevalue:compare | FAIL | 3 found, 0 pinned, 3 new (14 host renders, --baseline design/audit/baselines/screen-slots.json) | 98 (76 waiting) |
| ws-screen-answer --skills | placevalue:compare | PASS | - | 46 (31 waiting) |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | placevalue:compare | PASS | - | 28 (24 waiting) |
| ws-chromebook-fit --skills | placevalue:compare | PASS | - | 158 (15 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 33 (30 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | placevalue:compare: matrix rows with findings | FAIL | worse than siblings: 10 count(s) above the approved siblings in 6 row(s), 0 with no sibling measured, 0 ERROR row(s); 19 at or below (engine) in 8 printed row(s) with findings (PENDING(no-baseline) 5, RED 3; siblings per skill: compare: 5) | 1258 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | placevalue:compare × matrix rows × S/M/L + extras at S | PASS | 13 matrix row(s) × S/M/L + 2 extra document(s) (test, more-practice, supports on): 41 document(s), SLOT 0 / CLIP 0 finding(s), 140 box segment(s) and 0 head(s) probed (SLOT-W N/A on 26, HEADS N/A on 41 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 245 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | placevalue:compare × 390x844, 390x664 | PASS | - | 182 (110 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | placevalue:compare | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | placevalue:compare | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 1 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | placevalue:compare | N/A | no operand-dealt items (nothing to deal evenly): placevalue:compare | 0 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | placevalue:compare | PASS | 1 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.6 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | placevalue:compare | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-12; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | placevalue:compare × S/L | PASS | 14 value page(s) (1 skill(s) x S/L) against 2 default page(s) through ws-print-lint --source kit in 68 s; 0 n/a | 130 (62 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 75 (63 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | placevalue:compare | PASS | 0 found (1 doc(s), unpinned) | 60 (47 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 69 (54 waiting) |
| ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 57 (16 waiting) |
| ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 101 (42 waiting) |
| ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 75 (40 waiting) |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 55 (30 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | placevalue:compare | PASS | - | 52 (40 waiting) |
| ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) | placevalue:compare | PASS | - | 22 (12 waiting) |
| ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) | placevalue:compare | PASS | - | 1 |
| ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 235 (45 waiting) |
| ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 60 (47 waiting) |
| ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  | placevalue:compare | PASS | - | 85 (70 waiting) |
| ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES) | placevalue:compare | PASS | - | 6 |
| ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS) | placevalue:compare | PASS | - | 81 (45 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot** (exit 1, `/tmp/mq-precritic/20261113-130430-30905/empty-band.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:compare --vocab-ink --page-fill --screen-parity --grid-foot --rule-skills placevalue:compare`
  - `EB-BAND  FAIL 26`
  - `EB-SIDE  FAIL 7`
  - `EB-PAGE  FAIL 1`
  - `ws-empty-band: FAIL (34)`
- **ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5** (exit 1, `/tmp/mq-precritic/20261113-130430-30905/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:compare --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261113-130430-30905/coverage-matrix.json --red-no-baseline PAGEFILL,H5 --rule-skills placevalue:compare`
  - `RED placevalue:compare|single/more-cols2+afterpage (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/more-cols2+short (not in the pin)`
  - `+ S L-DENSITY PAGEFILL: 0 -> 1`
  - `RED placevalue:compare|single/pages-3 (not in the pin)`
  - `+ L L-DENSITY PAGEFILL: 0 -> 1`
- **ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles** (exit 1, `/tmp/mq-precritic/20261113-130430-30905/cell-checks-compare.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-cell-checks.cjs --skills placevalue:compare --card --card-opts --opt-roles lesson,independent,guided,test,review,true-false,reason-it,error-analysis,opener,scripted-model --rule-skills placevalue:compare`
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
- **ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit** (exit 1, `/tmp/mq-precritic/20261113-130430-30905/screen-slots.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:compare --baseline design/audit/baselines/screen-slots.json --json /tmp/mq-precritic/20261113-130430-30905/screen-slots.json --uniform --screen-digit --rule-skills placevalue:compare`
  - `NEW placevalue:compare                           worksheet@1280 SCREEN-DIGIT the numeral "553" is 29 px (want >= 56 px at 1280)`
  - `NEW placevalue:compare                           worksheet@820  SCREEN-DIGIT the numeral "553" is 29 px (want >= 48 px at 820)`
  - `NEW placevalue:compare                           worksheet@390  SCREEN-DIGIT the numeral "553" is 29 px (want >= 40 px at 390)`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261113-130430-30905/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261113-130430-30905/coverage-matrix.json --skills placevalue:compare --run-siblings --json /tmp/mq-precritic/20261113-130430-30905/sibling-compare.json`
  - `ABOVE      placevalue:compare|mixed/defaults L L-DENSITY PG-23: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-each S L-DENSITY H13: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-each L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/ex-group L L-DENSITY DN-2: ours 2, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 S L-DENSITY H13: ours 6, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 M L-DENSITY H13: ours 6, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|sections/pages-2 L L-DENSITY H13: ours 12, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|single/ex-each S L-DENSITY H13: ours 14, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|single/ex-each L L-DENSITY H13: ours 10, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`
  - `ABOVE      placevalue:compare|single/pages-3 L L-DENSITY PAGEFILL: ours 1, siblings max 0 (expand 0, value 0, combine 0, identify 0, unit_form 0)`

ws-precritic: FAIL: 5 FAIL, 41 PASS, 2 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 49 (FAIL: empty-band, coverage-matrix, cell-checks-compare, screen-slots, sibling-compare; N/A (ran, nothing to check): card-not-offered, dealer-uniform; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings)
