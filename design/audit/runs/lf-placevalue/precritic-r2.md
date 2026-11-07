ws-precritic: 28 gate(s) (15 browser), logs /tmp/mq-precritic/20261107-083738-28224
  PASS            ws-providers-unit --skill (0 s)
  PASS (baseline) ws-node-lint (0 s)
  PASS            ws-code-snapshot (3 s)
  PASS            ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (1 s)
  SKIPPED (no rulings) ws-card-rulings --check offered (panel offers nothing the card bans) (0 s)
  PASS            ws-content-audit --skill (5 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (2 s)
  PASS            ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) (1 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) (1 s)
  PASS            ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (1 s)
  PASS            ws-lessonfit (WRM site lessons, every year) (23 s)
  PASS            ws-options-verify --skill (48 s)
  PASS            ws-presets-unit (104 s, waited 98 s for a slot)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) (90 s, waited 62 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) (117 s, waited 89 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) (95 s, waited 69 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (131 s, waited 98 s for a slot)
  PASS            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (161 s, waited 127 s for a slot)
  PASS            ws-screen-slots --skills (60 s, waited 37 s for a slot)
  PASS            ws-screen-answer --skills (126 s, waited 74 s for a slot)
  PASS            ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) (424 s, waited 71 s for a slot)
  PASS            ws-boot-smoke (68 s, waited 64 s for a slot)
  PASS            ws-chromebook-fit --skills (339 s, waited 103 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (205 s, waited 69 s for a slot)
  FAIL            ws-options-verify --render (each offered appearance value at S / L vs the default page) (289 s, waited 69 s for a slot)
  PASS            ws-coverage-matrix --skills (1296 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1 s)
  PASS            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) (952 s)

### ws-precritic — --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value

commit `eff5381265` (claude/lf-placevalue) · started 2026-11-07T08:37:38Z · finished 2026-11-07T09:15:07Z · wall 2250 s · logs `/tmp/mq-precritic/20261107-083738-28224`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 5 skills | PASS (baseline) | 25 found, 25 pinned, 0 new | 0 |
| ws-providers-unit --skill | 5 skills | PASS | 5 of 5 skills checked | 0 |
| ws-content-audit --skill | 5 skills | PASS | 5 skill(s) audited | 5 |
| ws-options-verify --skill | 5 skills | PASS | 69 value(s) checked; 0 failing, 0 pinned, 0 new | 48 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 104 (98 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 23 |
| ws-coverage-matrix --skills | 5 skills × kinds × S/M/L | PASS | 34 of 165 row(s) run × S/M/L: OK 34, RED 0, ERROR 0; PENDING 101, N/A 30 | 1296 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 90 (62 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 117 (89 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 5 skills | PASS | 0 found (5 doc(s)) | 95 (69 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | PASS | 0 found (5 doc(s)) | 131 (98 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 5 skills | PASS | 0 found (5 doc(s)) | 161 (127 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | 5 skills × lesson, test, independent × S/M/L + screen hosts | PASS | - | 424 (71 waiting) |
| ws-screen-slots --skills | 5 skills | PASS | 0 found, 0 pinned, 0 new (25 host renders, --baseline design/audit/baselines/screen-slots.json) | 60 (37 waiting) |
| ws-screen-answer --skills | 5 skills | PASS | - | 126 (74 waiting) |
| ws-chromebook-fit --skills | 5 skills | PASS | - | 339 (103 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 3 |
| ws-boot-smoke | app boot | PASS | - | 68 (64 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 5 skills: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 90 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 31 printed row(s) with findings (PENDING(no-baseline) 31; siblings per skill: expand: 0, combine: 0, identify: 0, unit_form: 0, value: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 5 skills × matrix rows × S/M/L + extras at S | PASS | 65 matrix row(s) × S/M/L + 10 extra document(s) (test, more-practice, supports on): 205 document(s), SLOT 0 / CLIP 0 finding(s), 4139 box segment(s) and 0 head(s) probed (SLOT-W N/A on 78, HEADS N/A on 205 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 952 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 5 skills × 390x844, 390x664 | PASS | - | 205 (69 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 5 skills | PASS | - | 1 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 5 skills | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 5 skills | PASS | - | 2 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | 5 skills | PASS | 5 skill(s), 0 pinned finding(s), 0 stale pin(s), 1.4 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 5 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 5 skills | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-07; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 1 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 5 skills × S/L | FAIL | 1 value page(s) worse than the default: combine zeroPlace="none" @L; 50 value page(s) (5 skill(s) x S/L) against 10 default page(s) through ws-print-lint --source kit in 219 s; 0 n/a | 289 (69 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/mq-precritic/20261107-083738-28224/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/mq-precritic/20261107-083738-28224/coverage-matrix.json --skills placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value --run-siblings --json /tmp/mq-precritic/20261107-083738-28224/sibling-compare.json`
  - `NO-SIBLING placevalue:combine|mixed/defaults S L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at S`
  - `NO-SIBLING placevalue:combine|mixed/defaults M L-DENSITY PG-23: ours 2, no approved sibling measured mixed/defaults at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each S L-DENSITY GRID-EVEN: ours 2, no approved sibling measured sections/ex-each at S`
  - `NO-SIBLING placevalue:combine|sections/ex-each M L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-each at M`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY PG-23: ours 2, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-each L L-DENSITY SPREAD: ours 1, no approved sibling measured sections/ex-each at L`
  - `NO-SIBLING placevalue:combine|sections/ex-group S L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at S`
  - `NO-SIBLING placevalue:combine|sections/ex-group M L-DENSITY DN-2: ours 2, no approved sibling measured sections/ex-group at M`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY DN-2: ours 4, no approved sibling measured sections/pages-2 at S`
  - `NO-SIBLING placevalue:combine|sections/pages-2 S L-DENSITY PAGEFILL: ours 2, no approved sibling measured sections/pages-2 at S`
- **ws-options-verify --render (each offered appearance value at S / L vs the default page)** (exit 1, `/tmp/mq-precritic/20261107-083738-28224/options-render.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-options-verify.cjs --render --skill placevalue:expand,placevalue:combine,placevalue:identify,placevalue:unit_form,placevalue:value`
  - `FAIL placevalue:combine L zeroPlace="none": capacity: 10 items on its fullest page where the default page prints 11 (the value costs the page items without adding a drawing; RUBRIC H13)`

ws-precritic: FAIL: 2 FAIL, 25 PASS (1 on the baseline), 0 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 28 (FAIL: sibling-compare, options-render; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): card-not-offered)
