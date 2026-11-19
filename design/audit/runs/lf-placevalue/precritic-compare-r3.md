# precritic compare r3 (lf-placevalue compare r2 builder, after critic r1 FAIL)

`node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict` on 75353feb (the raw table below). Two commits after
it change only the pv compare cell, re-checked by targeted reruns (bottom).

## Red rows: owner

| Row | Red | Owner |
|---|---|---|
| ws-cell-checks --card --card-opts (+ opt-in `--opt-roles` every thinking role) | reason-it M / L band 9,999+ OVERFLOW (the r1 F1 page, now seen by the gate); opener L band 999,999 OVERFLOW (the half-width Model cell) | D3: lf-roles (Reason It A / B stack reads `inkWMm`; with lf-roles f53bfdea+ merged in a scratch tree the reason-it rows are OK) / lf-engine (opener Model cell) |
| ws-empty-band | EB-BAND independent / more-practice 216, review 10: the one-line compare at the top of a stretched row (CL-4b top of the box; centring tried and reverted: L-TOPSTART 36 / 48) | pv, needs a lead ruling (CL-4b vs pixel EB-BAND for in-place one-line cells) |
| ws-empty-band | guided 25, opener 30, scripted-model 12+5, mixed-practice 18, lesson 17+4 | D3 engine roles (lf-roles / lf-engine; scripted-model EB-SIDE: lf-checks gap) |
| ws-coverage-matrix | more-cols2+afterpage, more-cols2+short, pages-3 (as r2: CL-2c / PT-ENG-6 rulings); single/ex-group (new, see reruns) | ruled / pv |
| ws-print-lint lesson S | p2 cell 9 (lesson Guided row 2): 6.9 mm in a 22.9 mm row, 30.0 % vs 30 % (the rows split the Steps panel) | lesson engine (we-do rows) |
| ws-screen-slots --screen-digit | worksheet 29 px numerals | hosts lane (as r2) |
| ws-sibling-compare | PG-23 / DN-2 (mixed / sections pagination), PAGEFILL single/ex-group M, pages-3 L | D3 lf-engine (PG-23 / DN-2); pv (ex-group) |

## Targeted reruns after the precritic (84f122a6..HEAD)
- `--anchors sections` example strip drawn whole (`anchorStates: false`): coverage single/ex-group S / M PAGEFILL gone; L still
  1 (a 48 mm strip, 21 %; OK on 16748cd8) - open, pv.
- the CL-40 spacer change (Guided S EB-BAND 10 -> 2) reverted: it put single/ex-group PAGEFILL red.
- ws-pv-compare-pages OK, ws-spec-card OK, ws-print-lint lesson S as above (1), ws-pv-compare-deal OK, ws-lesson-unit OK,
  ws-providers-unit OK.

## Raw table (75353feb)
```
ws-precritic: 49 gate(s) (33 browser), logs /tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/pc6
  PASS            ws-roles-unit (shared page roles) (0 s)
  PASS            ws-node-lint (1 s)
  PASS            ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 (1 s)
  PASS            ws-code-snapshot (2 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  N/A             ws-card-rulings --check offered (panel offers nothing the card bans) (1 s)
  N/A             ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (0 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-content-audit --skill (6 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL (0 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (1 s)
  PASS            ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) (1 s)
  PASS            ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES) (5 s)
  PASS            ws-capacity-pin --check (items a page never fall against the pinned master page) (22 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (26 s)
  PASS            ws-options-verify --skill (74 s, waited 59 s for a slot)
  PASS            ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) (92 s, waited 76 s for a slot)
  FAIL            ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --vocab-ink --page-fill --screen-parity --grid-foot (173 s, waited 52 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (35 s, waited 23 s for a slot)
  FAIL            ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 (216 s)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (25 s, waited 14 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (21 s, waited 9 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (18 s)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (74 s, waited 59 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (138 s, waited 52 s for a slot)
  PASS            ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) (345 s, waited 73 s for a slot)
  FAIL            ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) + opt-in lf-placevalue: --opt-roles (372 s, waited 65 s for a slot)
  FAIL            ws-screen-slots --skills + opt-in lf-placevalue: --screen-digit (125 s, waited 101 s for a slot)
  PASS            ws-screen-answer --skills (46 s, waited 24 s for a slot)
  PASS            ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) (47 s, waited 44 s for a slot)
  PASS            ws-boot-smoke (64 s, waited 60 s for a slot)
  PASS            ws-chromebook-fit --skills (177 s, waited 26 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (162 s, waited 88 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (54 s, waited 40 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 (147 s, waited 76 s for a slot)
  PASS            ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL (62 s, waited 49 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (60 s, waited 44 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (70 s, waited 16 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (121 s, waited 56 s for a slot)
  PASS            ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (112 s, waited 47 s for a slot)
  PASS            ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (84 s, waited 49 s for a slot)
  PASS            ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) (57 s, waited 38 s for a slot)
  PASS            ws-fixit-words (opt-in lf-placevalue critic r3b G5: the error-analysis Fix-it frame prints the frame's own words, never the answer's singular) (30 s, waited 20 s for a slot)
  PASS            ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  (77 s, waited 61 s for a slot)
  PASS            ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  (96 s, waited 79 s for a slot)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1423 s)
  PASS            ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS) (97 s, waited 55 s for a slot)
  PASS            ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  (301 s, waited 72 s for a slot)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap (266 s)
### ws-precritic — --skill placevalue:compare
commit `75353febf9` (claude/lf-placevalue-w2) · started 2026-11-13T09:14:28Z · finished 2026-11-13T09:46:14Z · wall 1906 s · logs `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/pc6`
| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | placevalue:compare | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | placevalue:compare | PASS | 1 of 1 skills checked | 1 |
| ws-roles-unit (shared page roles) | shared roles | PASS | - | 0 |
| ws-capacity-pin --check (items a page never fall against the pinned master page) | placevalue:compare | PASS | - | 22 |
| ws-content-audit --skill | placevalue:compare | PASS | 1 skill(s) audited | 6 |
| ws-options-verify --skill | placevalue:compare | PASS | 11 value(s) checked; 0 failing, 0 pinned, 0 new | 74 (59 waiting) |
```
