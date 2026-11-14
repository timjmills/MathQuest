# lf-placevalue live1 — `ws-precritic --skill composing:number_word_form --strict` (one run, 2026-11-13)

Run at `4ee88c8a` (after D2-D4, expand, the backtests and the path wiring); one later commit `f3e5b3b5` (n6: Guided row-1 tries
under the Model tab's keep-out) changes only the Guided page and was re-checked alone (EB guided M / L at `--margin 2`: EB-BAND 0;
ws-pv-words-pages OK). Result: **8 FAIL, 46 PASS**. Every red row is marked below:

- **pv** — pre-existing lf-placevalue debt on a page this lane did NOT change (proved: the md5 of every number_word_form role
  page at M / L, on the default deal, bands 20 / 100 / 1,000, answerSlot hto and to_words, base `ffcba24b` vs live1: 16 of 210
  pages changed, all of them Guided pages plus the band-20 Opener and Scripted Model, whose Steps now fit their kind).
- **D3** — introduced by this lane: none.
- **ruled** — owner 2026-11-13: print size S is dropped; S-only findings are not judged.

| Gate | Red | Mark | Why |
|---|---|---|---|
| ws-empty-band (S/M/L + hosts, --margin 2) | EB-BAND 308, EB-SIDE 128, EB-PAGE 1 | pv / ruled | M / L findings vs base (`--json`, M / L): 20 GONE (all 15 Guided EB-BAND, scripted-model EB-SIDE), 0 new. The rest are the independent / review / test / opener / more-practice / mixed-practice / lesson / error-analysis pages, unchanged byte for byte. S rows (and EB-PAGE pre-skill-check S): ruled. The Guided M short-name EB-SIDE 28.7 % (under 30 %, over the 28 % margin) is the same cell geometry as independent M: pv. |
| ws-coverage-matrix --red-no-baseline PAGEFILL,H5 | single/ex-group L PAGEFILL 0 -> 1 | pv | an independent-family layout row; independent pages unchanged |
| ws-print-lint lesson S | H13 0 -> 4 | ruled / pv | size S; the lesson page is byte-identical to base |
| ws-screen-slots --screen-digit | 9 (card / quiz "no numeral", worksheet 16 px Nunito) | pv | number_word_form's screen hosts; this lane did not touch them (its screen numeral check is a separate finding for the lead) |
| ws-sibling-compare | 30 NO-SIBLING | pv | no approved sibling measured; follows the coverage-matrix rows above |
| ws-options-verify --render --bands --band-h13 | to_words capacity S / L | pv | to_words pages unchanged except Guided |
| ws-print-lint review S | 17 | ruled / pv | size S; review pages unchanged |
| ws-print-lint review L | 10 | pv | review pages unchanged |

New lane checks on the path, all PASS in this run: `pv-words-pages` (ws-pv-words-pages GUIDED-HINT-LEAK / GUIDED-ONE-KIND),
`pv-screen-numeral` (ws-pv-screen-numeral), `words-checks`, `words-cells`, `detailed-g2-nbt3-read-write-1000` (--check and --repeats),
`capacity-pin`, `checks-from-critics`, `boot-smoke`.

## Gate table (as printed)

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | composing:number_word_form | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-providers-unit --skill + opt-in lf-placevalue: --pv-r2 N1,N2,N3,N4 | composing:number_word_form | N/A | no provider test for composing:number_word_form | 1 |
| ws-roles-unit (shared page roles) | shared roles | PASS | - | 0 |
| ws-capacity-pin --check (items a page never fall against the pinned master page) | composing:number_word_form | PASS | - | 20 |
| ws-content-audit --skill | composing:number_word_form | PASS | 1 skill(s) audited | 5 |
| ws-options-verify --skill | composing:number_word_form | PASS (baseline) | 12 value(s) checked; 2 failing, 2 pinned, 0 new | 69 (54 waiting) |
| ws-presets-unit | 1 preset / host skill(s) | PASS | - | 50 (44 waiting) |
| ws-empty-band (every offered role x S/M/L + hosts: EB-BAND, EB-SIDE, EB-FOOT) + opt-in lf-placevalue: --screen-parity --grid-foot | composing:number_word_form × card roles × S/M/L + hosts | FAIL | ws-empty-band: FAIL (437) | 183 (35 waiting) |
| ws-fixit-words (FIX-WORDS: the error-analysis Fix-it frame prints its own words) | composing:number_word_form | PASS | - | 47 (35 waiting) |
| ws-cell-checks --card --card-opts (OVERFLOW, TAGINK, KEYJOIN, SIZE-S, TITLE, LESSON-OPT) | composing:number_word_form | PASS | - | 127 (40 waiting) |
| ws-screen-ink-size (SIZE-INK, SIZE-REF, SIZE-WIDTH on card / worksheet / quiz) | composing:number_word_form | PASS | - | 68 (53 waiting) |
| ws-lessonfit (WRM site lessons, every year) | site lessons Y1, Y4, Y6 | PASS | - | 23 |
| ws-coverage-matrix --skills + opt-in lf-placevalue: --red-no-baseline PAGEFILL,H5 | composing:number_word_form × kinds × S/M/L | FAIL | 5 of 33 row(s) run × S/M/L: OK 4, RED 1 (1 not in the pin), ERROR 0; PENDING 22, N/A 6; rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills composing:number_word_form --baseline design/audit/matrix/baseline.json --write-baseline; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 160 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | composing:number_word_form | PASS | 0 found (1 doc(s)) | 59 (48 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | composing:number_word_form | PASS | 0 found (1 doc(s)) | 53 (42 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL,TOPSTART-STRETCH | composing:number_word_form | PASS | 0 found (1 doc(s)) | 56 (46 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | composing:number_word_form | PASS | 0 found (1 doc(s)) | 20 (7 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | composing:number_word_form | FAIL | 4 found in 1 of 1 doc(s); 1 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: composing:number_word_form (must be clean) | 27 (14 waiting) |
| ws-grade-render --gate (lesson / test / independent pages at S, M, L: no overflow; card-390 / 820 targets >= 44 px) | composing:number_word_form × lesson, test, independent × S/M/L + screen hosts | PASS | - | 87 (8 waiting) |
| ws-grade-render --raster-fit (scripted-model / guided printed to PDF at S, M, L: RR-PAGES, RR-EDGE, RR-CLIP) | composing:number_word_form × scripted-model, guided × S/M/L | PASS | - | 146 (75 waiting) |
| ws-grade-render --gate on every other role the signed card offers (pv §7a; critic lf-ops r1 check 2) | composing:number_word_form × 10 roles × S/M/L | PASS | - | 244 (18 waiting) |
| ws-cell-checks --card --card-opts (every card role x S/M/L and every offered option value: overflow, tag over answer, one answer a key slot, Size S; critic lf-ops r1 checks 2, 4, 8, 9) | composing:number_word_form × 13 roles + 15 option values × S/M/L | PASS | - | 86 |
| ws-screen-slots --skills --screen-digit | composing:number_word_form | FAIL | 9 found, 0 pinned, 9 new (14 host renders, --baseline design/audit/baselines/screen-slots.json) | 26 (5 waiting) |
| ws-screen-answer --skills | composing:number_word_form | PASS | - | 28 (12 waiting) |
| ws-screen-support-eq --skills (SCREEN-SUPPORT-EQ, SCREEN-CUE-SIZE, SCREEN-SUPPORT-PLACE) | composing:number_word_form | PASS | - | 29 (27 waiting) |
| ws-chromebook-fit --skills | composing:number_word_form | PASS | - | 133 (3 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 2 |
| ws-boot-smoke | app boot | PASS | - | 134 (131 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | composing:number_word_form: matrix rows with findings | FAIL | worse than siblings: 0 count(s) above the approved siblings in 0 row(s), 30 with no sibling measured, 0 ERROR row(s); 0 at or below (engine) in 9 printed row(s) with findings (PENDING(no-baseline) 8, RED 1; siblings per skill: number_word_form: 0) | 1 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) + opt-in lf-placevalue: --slot-w-equal --draw-cap | composing:number_word_form × matrix rows × S/M/L + extras at S | PASS | 13 matrix row(s) × S/M/L + 2 extra document(s) (test, more-practice, supports on): 41 document(s), SLOT 0 / CLIP 0 finding(s), 126 box segment(s) and 0 head(s) probed (SLOT-W N/A on 26, HEADS N/A on 41 document(s): no digit strip / no heads); every SLOT / CLIP count at or below the approved siblings | 330 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | composing:number_word_form × 390x844, 390x664 | PASS | - | 94 (32 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | composing:number_word_form | SKIPPED (no rulings) | no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card: not checked | 0 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | composing:number_word_form | N/A | every §7a option offered; no notOffered entry in the card (lead ruling R2, 2026-11-07) | 0 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | composing:number_word_form | N/A | no operand-dealt items (nothing to deal evenly): composing:number_word_form | 1 |
| ws-visual-quality (VQ-REP relation drawn, VQ-ONEANSWER one answer place, VQ-LIVE no dead part, VQ-TITLE a sentence, VQ-NOLEGACY kit cell) | composing:number_word_form | PASS | 1 skill(s), 0 pinned finding(s), 0 stale pin(s), 0.6 s | 1 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) + opt-in lf-placevalue: WRONG-FITS-SLOTS WRONG-FILL | composing:number_word_form | PASS | 0 found, 0 pinned, 0 new | 0 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | composing:number_word_form | PASS | design/cards/pv/pv.md: Signed: owner, 2026-11-12; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decid | 1 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) + opt-in lf-placevalue: --bands --band-h13 | composing:number_word_form × S/L | FAIL | 2 value page(s) worse than the default: number_word_form wordform="to_words" @S, number_word_form wordform="to_words" @L; 14 value page(s) (1 skill(s) x S/L) against 2 default page(s) through ws-print-lint --source kit i | 151 (92 waiting) |
| ws-print-lint --source kit --roles review --size S --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | composing:number_word_form | FAIL | 16 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 102 (90 waiting) |
| ws-print-lint --source kit --roles review --size L --lints L-DENSITY (opt-in lf-placevalue critic r2 N7: one layout and no empty band in the review role) + opt-in lf-placevalue: --rules H13-ABS,GRID-EVEN-ALL | composing:number_word_form | FAIL | 10 found in 1 of 1 doc(s) (no pinned baseline: an unpinned document must be clean) | 44 (32 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 17 (2 waiting) |
| ws-detailed-lesson --lesson g3-oa5-mult-properties --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 60 (16 waiting) |
| ws-detailed-lesson --lesson g3-oa9-input-output-rule --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 101 (44 waiting) |
| ws-detailed-lesson --lesson g3-oa9-mult-table-patterns --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 94 (58 waiting) |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 59 (37 waiting) |
| ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --repeats (opt-in lf-placevalue, lead 2026-11-08: every passed detailed lesson that deals a pv skill stays green - lesson 1 regressed E9c / E11 / E24 / E24b on the lane's gen-pv, cells and CSS) | composing:number_word_form | PASS | - | 33 (22 waiting) |
| ws-words-checks (opt-in lf-placevalue critic nwf r1 N1 / N3: named wrong answers on every band, true worked steps) | composing:number_word_form | PASS | - | 0 |
| ws-cell-checks --words-rules (opt-in lf-placevalue critic nwf r1 N2 / N4 / N5 / N7 / N8: CLAIM-INK, MODEL-ANSWER, WORDS-TEXT, WORDS-BREAK, ROW-SLOT-Y on every card role and option value) + opt-in lf-placevalue:  | composing:number_word_form | PASS | - | 127 (11 waiting) |
| ws-cell-checks --words-rules at band 1,000 + zeroPlace always (opt-in lf-placevalue critic nwf r2 N10: 'one thousand' dealt, lesson rows judged) + opt-in lf-placevalue:  | composing:number_word_form | PASS | - | 128 (116 waiting) |
| ws-empty-band EB-GRIDFOOT --columns 2 at S (lead ruling 2026-11-13, CL-2c: a teacher-chosen column count leaves at most 25 % of the body white under the grid) + opt-in lf-placevalue:  | composing:number_word_form | PASS | - | 32 (13 waiting) |
| ws-pv-compare-deal (opt-in lf-placevalue compare r1 F2-F6: EQ-LIVE, CLOSE-DEPTH, MIXED-1DIGIT, M6-WRONG, WORKED-STEP-DOES; compare r2 N3 / N7: SIGN-PARITY, EQ-SHARE) | composing:number_word_form | PASS | - | 4 |
| ws-pv-compare-pages (opt-in lf-placevalue compare r1 F2 / F3 / F4: M6-SHOWN on the thinking pages, EQ-MODEL, STATE-MARKS; lf-roles review of compare r3 b2: MODEL-RESERVE; compare r2 N1 / N2 / N4 / N7 / F9: TOF-SHARE, MARK-CLEAR, MODEL-M6, EQ-SHARE-PAGE, WRAP-SIGN, SIDE-PAD) | composing:number_word_form | PASS | - | 106 (21 waiting) |
| ws-screen-ink-size --only TEXT-SIZE --no-baseline on identify / unit_form / value (opt-in lf-placevalue lead 15:35: identify's screen numeral 30 px under the card / quiz digit floor 40-56 px; unit_form / value words 14 pt under their 16 pt print) | composing:number_word_form | PASS | - | 118 (85 waiting) |
| ws-pv-identify-heads (opt-in lf-placevalue lead ruling PEDAGOGY 4.1a 2026-11-13: identify's place heads off on Review / Test / pre-skill check and the quiz, kept on Practice / Mixed; lead 14:24: a chosen support kept, PV-HEADS-CHOSEN; compare r2 N8: PV-HEADS-GRADE-QUIZ) | composing:number_word_form | PASS | - | 63 (33 waiting) |
| ws-pv-words-pages (opt-in lf-placevalue live1, lf-roles critic r8b D3 / D4: number_word_form's Guided hint never gives the answer, GUIDED-HINT-LEAK; one kind of problem per Guided page, GUIDED-ONE-KIND; M / L, default and every band) | composing:number_word_form | PASS | - | 44 (32 waiting) |
| ws-pv-screen-numeral (opt-in lf-placevalue live1, lf-hosts critic via the lead 2026-11-13: expand's online-worksheet numerals at the 29 px digit floor, WS-NUMERAL; no operator alone at a line's end, WS-WRAP-OP) | composing:number_word_form | PASS | - | 20 (13 waiting) |
| ws-conflict-markers (no merge conflict markers in tracked files) | tracked files | PASS | - | 0 |
| ws-precritic-plan --checks-from-critics (every critic / owner / lead finding has a backtest id on the path, or an exemption) | CHECKS_FROM_CRITICS.md | PASS | - | 2 |

