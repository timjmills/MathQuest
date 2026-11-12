ws-precritic: installed /tmp/mq-browser-run.sh from tests/scripts/mq-browser-run.sh
ws-precritic: 28 gate(s) (15 browser), logs /tmp/mq-precritic/20261107-065508-974
  PASS            ws-providers-unit --skill (0 s)
  PASS (baseline) ws-node-lint (1 s)
  PASS            ws-code-snapshot (1 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (0 s)
  SKIPPED (no rulings) ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  FAIL            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (4 s)
  PASS            ws-content-audit --skill (7 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (2 s)
  FAIL            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) (0 s)
  N/A             ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (0 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (22 s)
  PASS (baseline) ws-options-verify --skill (49 s)
  PASS            ws-presets-unit (64 s, waited 57 s for a slot)
  FAIL            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) (51 s, waited 23 s for a slot)
  FAIL            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) (58 s, waited 28 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) (59 s, waited 30 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (69 s, waited 30 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (82 s, waited 40 s for a slot)
  PASS            ws-screen-slots --skills (72 s, waited 46 s for a slot)
  PASS            ws-screen-answer --skills (131 s, waited 71 s for a slot)
  FAIL            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (476 s, waited 53 s for a slot)
  PASS            ws-boot-smoke (124 s, waited 119 s for a slot)
  FAIL            ws-chromebook-fit --skills (358 s, waited 97 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (269 s, waited 105 s for a slot)
  FAIL            ws-options-verify --render (each offered appearance value at S / L vs the default page) (404 s, waited 147 s for a slot)
  FAIL            ws-coverage-matrix --skills (1443 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1 s)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) (1244 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form

commit `9398c3aa0e` (claude/lf-placevalue) · started 2026-11-07T06:55:08Z · finished 2026-11-07T07:39:57Z · wall 2689 s · logs `/tmp/mq-precritic/20261107-065508-974`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 6 skills | PASS (baseline) | 25 found, 25 pinned, 0 new | 1 |
| ws-providers-unit --skill | 6 skills | PASS | 5 of 6 skills checked; not covered: composing:number_word_form | 0 |
| ws-content-audit --skill | 6 skills | PASS | 6 skill(s) audited; also audits 1 skill(s) of other categories that share an id (bare ids; --category takes one): fractions:identify | 7 |
| ws-options-verify --skill | 6 skills | PASS (baseline) | 81 value(s) checked; 2 failing, 2 pinned, 0 new | 49 |
| ws-presets-unit | 3 preset / host skill(s) | PASS | - | 64 (57 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 22 |
| ws-coverage-matrix --skills | 6 skills × kinds × S/M/L | FAIL | checked nothing for 1 of 6 skill(s): placevalue:expand (198 row(s) listed, 27 run) | 1443 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | FAIL | 8 found in 1 of 6 doc(s); 1 (document, lint, rule) count(s) above the pin | 51 (23 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | FAIL | 40 found in 1 of 6 doc(s); 1 (document, lint, rule) count(s) above the pin | 58 (28 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 6 skills | PASS | 0 found (6 doc(s)) | 59 (30 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 44 found in 6 of 6 doc(s); 11 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value, composing:number_word_form (must be clean) | 69 (30 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 6 skills | FAIL | 48 found in 6 of 6 doc(s); 13 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value, composing:number_word_form (must be clean) | 82 (40 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 6 skills × lesson, test, independent × S/M/L + screen hosts | FAIL | ws-grade-render: FAIL - 196 finding(s) (196 overflow, 0 small target) in 6 unit(s) | 476 (53 waiting) |
| ws-screen-slots --skills | 6 skills | PASS | 0 found, 0 pinned, 0 new (30 host renders, --baseline design/audit/baselines/screen-slots.json) | 72 (46 waiting) |
| ws-screen-answer --skills | 6 skills | PASS | - | 131 (71 waiting) |
| ws-chromebook-fit --skills | 6 skills | FAIL | ws-chromebook-fit: FAIL | 358 (97 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 1 |
| ws-boot-smoke | app boot | PASS | - | 124 (119 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 6 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 149 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 51 printed row(s) with findings (PENDING(no-baseline) 51; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0, number_word_form: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 6 skills × matrix rows × S/M/L + extras at S | PASS | 78 matrix row(s) × S/M/L + 12 extra document(s) (test, more-practice, supports on): 246 document(s), SLOT 0 / CLIP 0 finding(s), 4735 box segment(s) and 0 head(s) probed (SLOT-W N/A on 104, HEADS N/A on 246 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 1244 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 6 skills × 390x844, 390x664 | PASS | - | 269 (105 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 6 skills | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card for placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, … 2 more: not checked | 0 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 6 skills | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card for placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, … 2 more: not checked | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 6 skills | FAIL | ws-dealer-uniform: FAIL - combine (8) (0 OK, 1 FAIL, 0 INCOMPLETE, 5 N/A of 6 skill(s) (N/A, no operand-dealt items: placevalue:expand, placevalue:identify, pla | 4 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 6 skills | PASS | 6 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.7 s | 2 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 6 skills | FAIL | exit 1 (ws-node-lint: FAIL (6); not accounted for by the parsed findings); 6 found, 6 pinned, 0 new; ws-node-lint: FAIL (6) | 0 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 6 skills | N/A | no spec card covers placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, … 2 more (no spec card under design/cards covers placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form,); a NEW family's build needs a signed card first (design/cards/README.md), an approved pre-card family has none | 0 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 6 skills × S/L | FAIL | 16 value page(s) worse than the default: expand form="notation" @S, expand form="notation" @L, combine zeroPlace="always" @S, combine zeroPlace="none" @L, combine zeroPlace="always" @L, identify support="chart" @S, ident | 404 (147 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-coverage-matrix --skills** (exit 0, `/tmp/mq-precritic/20261107-065508-974/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/mq-precritic/20261107-065508-974/coverage-matrix.json`
  - `placevalue:value|single/more-cols2+short                        2+1k 10    2+1k .     2+1k .     PENDING(no-baseline)`
  - `placevalue:value|single/more-short+afterpage                    2+1k .     2+1k .     2+1k .     OK`
  - `placevalue:value|single/pages-3                                 6+3k .     6+3k .     6+3k .     OK`
  - `ws-coverage-matrix: OK 27 · CACHED 0 · RED 0 · PENDING 135 · N/A 36 · ERROR 0`
  - `wrote ../../../tmp/mq-precritic/20261107-065508-974/coverage-matrix.json`
  - `ws-coverage-matrix: OK (198 row(s), 90 run, 0 cached, 1443 s; 51 row(s) PENDING(no-baseline): printed, not judged)`
- **ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/print-lint-kit.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --baseline design/audit/baselines/print-lint.json`
  - `- placevalue:combine L-OVERLAP CL40-INK: 0 -> 8`
- **ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/print-lint-kit-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --baseline design/audit/baselines/print-lint.S.json`
  - `- placevalue:expand L-OVERLAP CL40-INK: 0 -> 40`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --baseline design/audit/baselines/print-lint.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:expand#lesson L-OVERFLOW PG-12: 0 -> 10`
  - `- placevalue:combine#lesson L-OVERFLOW PG-12: 0 -> 8`
  - `- placevalue:combine#lesson L-OVERLAP SECTION: 0 -> 2`
  - `- placevalue:combine#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:identify#lesson L-OVERFLOW PG-12: 0 -> 6`
  - `- placevalue:identify#lesson L-OVERLAP SECTION: 0 -> 2`
  - `- placevalue:identify#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:unit_form#lesson L-OVERFLOW PG-12: 0 -> 8`
  - `- placevalue:value#lesson L-WRAP WRAP-OP: 0 -> 4`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --baseline design/audit/baselines/print-lint.S.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:expand#lesson L-OVERFLOW PG-12: 0 -> 8`
  - `- placevalue:combine#lesson L-OVERFLOW PG-12: 0 -> 8`
  - `- placevalue:combine#lesson L-OVERLAP SECTION: 0 -> 2`
  - `- placevalue:combine#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:identify#lesson L-OVERFLOW PG-12: 0 -> 6`
  - `- placevalue:identify#lesson L-OVERLAP SECTION: 0 -> 2`
  - `- placevalue:identify#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:unit_form#lesson L-OVERFLOW PG-12: 0 -> 8`
  - `- placevalue:unit_form#lesson L-DENSITY H13: 0 -> 2`
- **ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/render-gate.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --roles lesson,test,independent --size S,M,L --gate --out /tmp/mq-precritic/20261107-065508-974/render-gate`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 1: <div class="mq-cstate mq-cstate-col"> leaves the cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 2: <div class="mq-cstate mq-cstate-col"> leaves the cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 4: content overflows its cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S pupil: page 1 cell 4: <div class="mq-cstate mq-cstate-col"> leaves the cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S key: page 1 cell 1: content overflows its cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S key: page 1 cell 1: <div class="mq-cstate mq-cstate-col"> leaves the cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S key: page 1 cell 2: content overflows its cell`
  - `FAIL OVERFLOW placevalue:identify lesson-S key: page 1 cell 2: <div class="mq-cstate mq-cstate-col"> leaves the cell`
- **ws-chromebook-fit --skills** (exit 1, `/tmp/mq-precritic/20261107-065508-974/chromebook-fit.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-chromebook-fit.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form`
  - `placevalue:expand 1366x650                   card FAIL box 443/650 go - | boss FAIL box 443/650 go - | race FAIL box 443/650 go - | worksheet ok box 344/650 go 54 cards 3 | quiz ok box 217/650 go 307`
  - `placevalue:expand 1280x600                   card FAIL box 443/600 go - | boss FAIL box 443/600 go - | race FAIL box 443/600 go - | worksheet ok box 344/600 go 54 cards 3 | quiz ok box 217/600 go 307`
  - `ws-chromebook-fit: FAIL`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261107-065508-974/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --run-siblings --json /tmp/mq-precritic/20261107-065508-974/sibling-compare.json`
  - `NO-SIBLING composing:number_word_form|mixed/defaults S L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at S`
  - `NO-SIBLING composing:number_word_form|mixed/defaults M L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at M`
  - `NO-SIBLING composing:number_word_form|sections/defaults L L-DENSITY PAGEFILL: ours 1, no approved sibling measured sections/defaults at L`
  - `NO-SIBLING composing:number_word_form|sections/defaults L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/defaults at L`
  - `NO-SIBLING composing:number_word_form|sections/ex-each S L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at S`
  - `NO-SIBLING composing:number_word_form|sections/ex-each M L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at M`
  - `NO-SIBLING composing:number_word_form|sections/ex-each L L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING composing:number_word_form|sections/ex-each L L-DENSITY PG-23: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING composing:number_word_form|sections/ex-each L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING composing:number_word_form|sections/ex-group S L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at S`
- **ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/dealer-uniform.log`); rerun alone: `node tests/scripts/ws-dealer-uniform.mjs --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form`
  - `FAIL PAGE 1: item 500 + 20 2 times (at most 1)`
  - `FAIL PAGE 1: item 200 + 70 2 times (at most 1)`
  - `FAIL PAGE 4: item 600 + 60 2 times (at most 1)`
  - `FAIL PAGE 4: item 300 + 10 2 times (at most 1)`
  - `FAIL PAGE 5: a = 700 5 times (at most 4: the valid set deals it 2.0 times a page)`
  - `FAIL PAGE 5: item 600 + 20 2 times (at most 1)`
  - `FAIL PAGE 6: item 400 + 10 2 times (at most 1)`
  - `FAIL PERIOD zeroCase: 60 of its 60 items at position 1 mod 2 (p 1.8e-16; positions 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23…)`
- **ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/node-lint-s1.log`); rerun alone: `node tests/scripts/ws-node-lint.mjs --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form --rules LESSON-DATA,OPTION-HELP,WRONG-FITS --baseline tests/fixtures/precritic/node-lint-s1.baseline.json --json /tmp/mq-precritic/20261107-065508-974/node-lint-s1.json`
  - `the lesson page falls back: lessons/prereqs.js LESSONS has no entry for placevalue:combine (the sheet prints "No lesson data for this skill yet"; the Warm-up deals the skills listed before it)`
  - `placevalue:unit_form LESSON-DATA|no-lesson-data|#1|placevalue:unit_form`
  - `the lesson page falls back: lessons/prereqs.js LESSONS has no entry for placevalue:unit_form (the sheet prints "No lesson data for this skill yet"; the Warm-up deals the skills listed before it)`
  - `json: /tmp/mq-precritic/20261107-065508-974/node-lint-s1.json`
  - `time: load 0.3 s, lint 0.1 s, total 0.4 s`
  - `ws-node-lint: FAIL (6)`
- **ws-options-verify --render (each offered appearance value at S / L vs the default page)** (exit 1, `/tmp/mq-precritic/20261107-065508-974/options-render.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --render --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value,composing:number_word_form`
  - `FAIL placevalue:expand S form="notation": capacity: 10 items on its fullest page where the default page prints 20 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:expand L form="notation": capacity: 4 items on its fullest page where the default page prints 12 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:combine S zeroPlace="always": L-OVERLAP CL40-INK: 0 -> 26 (ink of "600" at 4.1 mm across, 4.3 mm down enters the label keep-out (5 x 5 mm at the cell's top-left corner): nothing but the label paints )`
  - `FAIL placevalue:combine L zeroPlace="none": capacity: 12 items on its fullest page where the default page prints 13 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:combine L zeroPlace="always": L-OVERLAP CL40-INK: 8 -> 16 (ink of "600" at 3.9 mm across, 5.1 mm down enters the label keep-out (7 x 7 mm at the cell's top-left corner): nothing but the label paints )`
  - `FAIL placevalue:identify S support="chart": L-SIZE TY-11: 0 -> 96 (5.8 pt text: nothing a pupil reads is under 8 pt (TY-11))`
  - `FAIL placevalue:identify L response="bank": capacity: 8 items on its fullest page where the default page prints 10 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:value S support="chart": L-SIZE TY-11: 0 -> 144 (5.8 pt text: nothing a pupil reads is under 8 pt (TY-11))`
  - `FAIL placevalue:value S form="unit": capacity: 12 items on its fullest page where the default page prints 30 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:value S form="notation": capacity: 16 items on its fullest page where the default page prints 30 (the value costs the page items without adding a drawing; RUBRIC H13)`

ws-precritic: FAIL: 11 FAIL, 14 PASS (2 on the baseline), 1 N/A, 0 SKIPPED-NOT-BUILT, 2 SKIPPED / INCOMPLETE (no or partial rulings) of 28 (FAIL: coverage-matrix, print-lint-kit, print-lint-kit-S, print-lint-lesson-L, print-lint-lesson-S, render-gate, chromebook-fit, sibling-compare, dealer-uniform, node-lint-s1, options-render; N/A (ran, nothing to check): spec-card-signed; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings, card-not-offered)
