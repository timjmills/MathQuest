ws-precritic: 28 gate(s) (15 browser), logs /tmp/mq-precritic/20261107-075517-10134
  PASS            ws-providers-unit --skill (0 s)
  PASS (baseline) ws-node-lint (1 s)
  PASS            ws-code-snapshot (3 s)
  SKIPPED (no rulings) ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (0 s)
  SKIPPED (no rulings) ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  PASS            ws-content-audit --skill (6 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (2 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) (1 s)
  INCOMPLETE (unsigned card) ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (2 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (22 s)
  PASS            ws-options-verify --skill (44 s)
  PASS            ws-presets-unit (63 s, waited 57 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) (51 s, waited 26 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) (53 s, waited 27 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) (56 s, waited 32 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (61 s, waited 29 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (78 s, waited 45 s for a slot)
  PASS            ws-screen-slots --skills (80 s, waited 57 s for a slot)
  PASS            ws-screen-answer --skills (124 s, waited 70 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (408 s, waited 47 s for a slot)
  PASS            ws-boot-smoke (86 s, waited 83 s for a slot)
  FAIL            ws-chromebook-fit --skills (339 s, waited 101 s for a slot)
  FAIL            ws-phone-card (practice card at 390 px: clip, first-box focus) (207 s, waited 69 s for a slot)
  FAIL            ws-options-verify --render (each offered appearance value at S / L vs the default page) (327 s, waited 99 s for a slot)
  PASS            ws-coverage-matrix --skills (1167 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (0 s)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) (949 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value

commit `a73304fd0b` (claude/lf-placevalue) · started 2026-11-07T07:55:17Z · finished 2026-11-07T08:30:35Z · wall 2118 s · logs `/tmp/mq-precritic/20261107-075517-10134`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 5 skills | PASS (baseline) | 25 found, 25 pinned, 0 new | 1 |
| ws-providers-unit --skill | 5 skills | PASS | 5 of 5 skills checked | 0 |
| ws-content-audit --skill | 5 skills | PASS | 5 skill(s) audited | 6 |
| ws-options-verify --skill | 5 skills | PASS | 69 value(s) checked; 0 failing, 0 pinned, 0 new | 44 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 63 (57 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 22 |
| ws-coverage-matrix --skills | 5 skills × kinds × S/M/L | PASS | 35 of 165 row(s) run × S/M/L: OK 35, RED 0, ERROR 0; PENDING 100, N/A 30 | 1167 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 51 (26 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 53 (27 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 56 (32 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 3 found in 3 of 5 doc(s); 3 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 61 (29 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | FAIL | 5 found in 3 of 5 doc(s); 4 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: placevalue:expand, placevalue:combine, placevalue:identify, placevalue:unit_form, placevalue:value (must be clean) | 78 (45 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 5 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 408 (47 waiting) |
| ws-screen-slots --skills | 5 skills | PASS | 0 found, 0 pinned, 0 new (25 host renders, --baseline design/audit/baselines/screen-slots.json) | 80 (57 waiting) |
| ws-screen-answer --skills | 5 skills | PASS | - | 124 (70 waiting) |
| ws-chromebook-fit --skills | 5 skills | FAIL | ws-chromebook-fit: FAIL | 339 (101 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 3 |
| ws-boot-smoke | app boot | PASS | - | 86 (83 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 5 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 89 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 30 printed row(s) with findings (PENDING(no-baseline) 30; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0) | 0 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 5 skills × matrix rows × S/M/L + extras at S | PASS | 65 matrix row(s) × S/M/L + 10 extra document(s) (test, more-practice, supports on): 205 document(s), SLOT 0 / CLIP 0 finding(s), 4139 box segment(s) and 0 head(s) probed (SLOT-W N/A on 78, HEADS N/A on 205 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 949 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 5 skills × 390x844, 390x664 | FAIL | ws-phone-card: FAIL - 4 finding(s) (CLIP-X 2, INVIEW 2) (5 skill(s) × 2 size(s) × 3 item(s): 30 of 30 renders measured; A14 siblings clean (4 approved skill(s)  | 207 (69 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 5 skills | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 5 skills | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 5 skills | PASS | - | 2 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 5 skills | PASS | 5 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.8 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 5 skills | INCOMPLETE (unsigned card) | needs owner signature: design/cards/pv/pv.md (everything else green) | 2 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 5 skills × S/L | FAIL | 3 value page(s) worse than the default: combine zeroPlace="none" @L, identify support="chart" @S, value support="chart" @S; 50 value page(s) (5 skill(s) x S/L) against 10 default page(s) through ws-print-lint --source ki | 327 (99 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:combine#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:identify#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:value#lesson L-DENSITY PAGEFILL: 0 -> 1`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --baseline design/audit/baselines/print-lint.S.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- placevalue:combine#lesson L-DENSITY H13: 0 -> 2`
  - `- placevalue:combine#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:identify#lesson L-DENSITY PAGEFILL: 0 -> 1`
  - `- placevalue:value#lesson L-DENSITY PAGEFILL: 0 -> 1`
- **ws-chromebook-fit --skills** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/chromebook-fit.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-chromebook-fit.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `placevalue:expand 1366x650                   card FAIL box 443/650 go - | boss FAIL box 443/650 go - | race FAIL box 443/650 go - | worksheet ok box 344/650 go 54 cards 3 | quiz ok box 217/650 go 307`
  - `placevalue:expand 1280x600                   card FAIL box 443/600 go - | boss FAIL box 443/600 go - | race FAIL box 443/600 go - | worksheet ok box 344/600 go 54 cards 3 | quiz ok box 217/600 go 307`
  - `ws-chromebook-fit: FAIL`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261107-075517-10134/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --json /tmp/mq-precritic/20261107-075517-10134/sibling-compare.json`
  - `NO-SIBLING placevalue:combine|mixed/defaults S L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at S`
  - `NO-SIBLING placevalue:combine|mixed/defaults M L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each S L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at S`
  - `NO-SIBLING placevalue:combine|sections/ex-each M L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-each at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY PG-23: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-group S L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at S`
  - `NO-SIBLING placevalue:combine|sections/ex-group M L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at M`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY DN-2: ours 4, no approved sibling measured sections/pages-2 at S`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY PAGEFILL: ours 3, no approved sibling measured sections/pages-2 at S`
- **ws-phone-card (practice card at 390 px: clip, first-box focus)** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/phone-card.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-phone-card.cjs --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `placevalue:combine 390x844 item 3: FAIL (focus ok, 1 answer box(es), paper 346 px)`
  - `placevalue:combine 390x664 item 3: FAIL (focus ok, 1 answer box(es), paper 338 px)`
  - `ws-phone-card: FAIL - 4 finding(s) (CLIP-X 2, INVIEW 2) (5 skill(s) × 2 size(s) × 3 item(s): 30 of 30 renders measured; A14 siblings clean (4 approved skill(s) × 2 size(s) × 2 item(s)); 138.4 s)`
- **ws-options-verify --render (each offered appearance value at S / L vs the default page)** (exit 1, `/tmp/mq-precritic/20261107-075517-10134/options-render.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --render --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `FAIL placevalue:combine L zeroPlace="none": capacity: 10 items on its fullest page where the default page prints 11 (the value costs the page items without adding a drawing; RUBRIC H13)`
  - `FAIL placevalue:identify S support="chart": L-SIZE TY-11: 0 -> 96 (5.8 pt text: nothing a pupil reads is under 8 pt (TY-11))`
  - `FAIL placevalue:value S support="chart": L-SIZE TY-11: 0 -> 144 (5.8 pt text: nothing a pupil reads is under 8 pt (TY-11))`

ws-precritic: FAIL: 6 FAIL, 19 PASS (1 on the baseline), 0 N/A, 0 SKIPPED-NOT-BUILT, 3 SKIPPED / INCOMPLETE (no or partial rulings) of 28 (FAIL: print-lint-lesson-L, print-lint-lesson-S, chromebook-fit, sibling-compare, phone-card, options-render; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-rulings, card-not-offered, spec-card-signed)
