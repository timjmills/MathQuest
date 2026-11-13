Lane: lf-placevalue
Title: Lessons-first wave 1 — place value and decimals skills of the overdue BUILD lessons to 8/10
Session: session_013pHDnMCXcY6kXV15KHf4Yp
Branch: claude/lf-placevalue
Owner of files: gen-pv.js, sheet/cells/{pv,value-line,line-labels,gattegno}.js, pv-support-cell.js, sheet/providers/pv.js, panes/{place,extras,pv-exchange}.js, design/cards/pv/
State: fix
Updated: 2026-11-08
Builder profile: mq-opus-medium
Critic rounds: 2, FAIL (r2: identify C2 3, value C3 6, expand C3 5, combine C2 4, unit_form C3 5)

## Now
- HAND-OVER 2026-11-07 ~13:30 UTC (budget: week at ~60 %, no new work after 14:10). Branch claude/lf-placevalue @ a2c0e635, PR #35.
- Critic r1 FAIL (all five lesson #1 skills); r1 fix round done; precritic r3 (design/audit/runs/lf-placevalue/precritic-r3.md) is
  18 FAIL / 21 PASS — mostly NEW reds from the plan-from-card gates (every offered role × option value). Critic r2 NOT run (rule 0b).
- The pv card needs ONE re-sign (a2c0e635: body changed only by rule-index hashes from the integration merge).
- Next round (lane, medium): the "What remains" list below, then precritic r4 and critic r2 (brief ready: critic-r2-brief.md).

## Hand-over (2026-11-07)
**Cost:** $93.49 session cost_usd (≈ 4.7 % of the weekly limit, 37 % of the $250 cap), sub-agents included.
**Times:** start 06:53; precritic r0 07:00-07:45; fixes + r1 08:20-09:05; r2 08:37-09:15; critic r1 09:36-10:24 (47 min);
builder r1 10:13-12:07 + checks builder 10:24-11:20 (parallel); r3 12:24-13:12.
**Critic verdicts:** r1 FAIL (design/audit/runs/lf-placevalue/critic-r1.md): identify / value / expand / combine / unit_form, core
pages 4-6. No skill passed; redesign-passed.js unchanged.
**Precritic r3 reds (what remains):**
1. cell-checks / render-gate OVERFLOW on option values × roles (plan-from-card, new): value form=unit and identify band=99999
   (and higher bands) on lesson / test / review pages; combine lesson S/M; expand lesson + test (all sizes); unit_form test / review.
   Cause: pv cells sized for the default band / form; the fit must hold for every offered option value (lane files).
2. ws-screen-slots --screen-digit: 27 misses (identify / expand screen numerals < 56 / 48 / 40 px or not bold) — r1 F7, host side
   (screen-cell.js / question-render.js: not lane files; needs an owner).
3. print-lint lesson L / S: identify#lesson DN-2 / H13 (writeValue taller cells; lesson.js pagination, lf-engine).
4. print-lint sections pages 2 S / L (new two-skill sheet gate): PAGEFILL / PG-23 — the engine's sections pagination (r1 F21, shared roles).
5. options-render --bands: combine band=999999 at L.
6. sibling-compare (first family, lead R1: rows go to the critic) and spec-card-signed (re-sign) — process, not defects.
**Fixed this session (all pushed):** r0 → r2: dealer, CL-40, WRAP-OP, lesson data, expand kit card, chart heads, practiceShapes;
r1 fix round: F1, F3, F4 (paper + key), F5, F8, F9, F10, F11, F12, F13, F19, F20, F22; D4 / D5; writeValue share code 4L.
**Checks built (each with a backtest):** pv-combine-dealer, pv-equation-row-cl40, pv-lesson-data, pv-expand-card-kit,
card-rulings-value-reader, precritic-offered-na, pv-r1-* (4), optin-* (8: H13-ABS 35 %, GRID-EVEN-ALL, WRONG-FITS-SLOTS, WRONG-FILL,
SLOT-W-EQUAL, DRAW-CAP, SCREEN-DIGIT, options-render bands).
**Not built / not started:** #6 build entry value_ten_times (presets exist; closes with an 8/10 pass), #9, #10 thousandths_pv and
#14 / #15 decimals (fractions lane; sized: a full family lane for wave 2), #12 pv10_exponents.
**Owner / lead questions open:** none blocking; the card re-sign (a2c0e635).

## Owner go

## Open questions
- Q1 Accept every PROPOSED decision in the pv card §7a (all options offered; word-problems and fact-rows out of scope; boss / race / map / bigboard / dark offered as on the facts card)? Suggested: yes, all as proposed.
- Q2 Keep identify's write-the-value line (owner 2026-10-10, `writeValue`, default on)? Suggested: yes, as ruled.
- Q3 Does the pv card also cover the decimal place value builds `thousandths_pv` (#10) and `pv10_exponents` (#12)? Suggested: yes, the same pv cell with a decimal-point track; × ÷ of decimals by decimals (#14, #15) get a decimals card.
- Q4 Capacity pins (ws-options-verify --render: an option value may print fewer items a page only by an owner ruling). Each value below writes a longer answer, so fewer columns fit:
  `expand form=notation` (S 10 vs 20, L 4 vs 12), `value form=unit` (S 12 vs 30, L 6 vs 12), `value form=notation` (S 16 vs 30, L 10 vs 12),
  `identify response=bank` (L 8 vs 10, the bank is a drawn box of words). Suggested: pin all four as owner-ruled (the answer is the
  longer form being taught; the page stays full at its own column count).
- Lead: (a) `composing:number_word_form` is lf-algebra's file (gen-algebraic.js): fixes routed there; (b) decimals generators are in gen-fractions.js (fractions lane, idle in wave 1): sized only, not edited without the lead's OK; (c) #13 Count on to 120 is k2-lane: out of scope unless reassigned; (d) lessons/prereqs.js entries for this lane's skills appended in their own block unless lf-engine claims the file.

## Scope (teach-week order, with reasons)
| # | Lesson | In scope | Why |
|---|---|---|---|
| 1 | Read and write numbers to 1,000 (2.NBT.A.3) | identify, value, expand, combine, unit_form | pv kit skills (gen-pv.js); number_word_form → lf-algebra |
| 6 | 10 times and one tenth (4.NBT.A.1, 5.NBT.A.1) | ten_times_value, one_tenth_value, ten_times_story, place_value_10x, more_less_100, compare; build `value_ten_times` | pv kit |
| 9 | Compare digit values (5.NBT.A.1) | value; `value_ten_times` | pv kit |
| 10 | Decimals to thousandths, word / expanded form (5.NBT.A.3.A) | build `thousandths_pv` | pv kit + decimal track (card Q3) |
| 12 | × ÷ by powers of 10 with exponents (5.NBT.A.2) | place_value_10x; build `pv10_exponents` | pv kit |
| 13 | Count on to 120 (1.NBT.A.1) | out | k2 lane's skills and build |
| 14, 15 | × decimals by decimals; ÷ by a decimal (5.NBT.B.7) | sizing only | gen-fractions.js (fractions lane) |

## Process rules recorded here
- First family on a template (lead ruling R1, 2026-11-07): ws-sibling-compare cannot prove rule 0b when no approved sibling exists;
  the NO-SIBLING matrix rows go to the critic as named pages to grade (listed in the brief), and the family's passing skills are added
  to tests/fixtures/precritic/siblings.json as approved siblings in the same change as redesign-passed.js. Sent to lf-checks for LESSONS_LEARNED.
- A card with no hidden option (R2): ws-card-rulings --check offered SKIPPED "every §7a option offered; no notOffered" is green.

## Log
- 2026-11-13 **placevalue:compare PASSED** (critic compare r4 PASS; r1 FAIL F1-F6, r2 FAIL N1-N3, r3 FAIL N9 only -> round cap 2
  root cause: every relation a step writes is one no-break unit, WRAP-SIGN runs the wide bands). redesign-passed.js PVC. Rounds: 4 critic
  (r4 narrow), 5 builder passes (r1, r2, r3, checks pass, r4) + 2 merges. Every finding is in CHECKS_FROM_CRITICS with a backtest row
  (or a reasoned exemption); the lane's ledger rows sweep clean. Open minors: N10 (box grazes its digit 0.3 mm), N11 (lesson Guided pad
  3.2 mm). Engine items with their owners: opener / scripted-model / review / mixed bands, PG-23 / DN-2 (lf-engine), error-analysis
  PUPILTAG / Reason It panel (lf-roles), worksheet 29 px (hosts). PNGs design/status/lf-placevalue/compare-pass/.

| Finding (compare) | Check | Backtest | On path | Would have saved |
|---|---|---|---|---|
| r1 F1 reason-it overflow at band 999,999 | ws-cell-checks thinking roles x every band (opt-in) | pv-compare-thinking-bands | precritic | 1 round |
| r1 F2-F6 teaching / deal | ws-pv-compare-deal / -pages, ws-lesson-unit chant-fit | pv-compare-* (10 rows) | precritic | 1-2 rounds |
| r2 N1-N4, N6-N8, F9 | TOF-SHARE, MARK-CLEAR, SIGN-PARITY, MODEL-M6, remember-fit, EQ-SHARE(-PAGE), WRAP-SIGN, SIDE-PAD, --quiz-builder | pv-compare-* (11 rows) | precritic | 1 round |
| r3 N9 wrap (2nd round) | WRAP-SIGN on band 9999 / 999999 / close | pv-compare-wrap-sign-bands | precritic | 1 round (and the round-cap stop) |
- 2026-11-13 **compare critic r1 FAIL** (`design/audit/runs/lf-placevalue/critic-compare1.md`, head 16748cd8). Holding: F1 reason-it at
  band=999999 overflows the A/B boxes at S and L (H2; ws-cell-checks --card-opts passed it: the thinking roles are not rendered under
  every band); F2 the chant / worked steps do not teach the deciding place (chant decides 8 of 33 items); F3 M6 never the shown error
  (lengths=mixed deals shared leading digits, gen-pv.js:851); F4 live play pins '=' to item 1 (blockOrder with run 0); F5 close
  6-digit pairs always decided at the 2nd digit; F6 lengths=mixed is 16 / 30 one-digit-vs-three-digit pairs. Minor F7 / F9 / F10;
  engine F8 (D3). Proposed checks: LESSON-CHANT-FIT, WORKED-STEP-DOES, M6-SHOWN, dealer-uniform on symbol answers (+ no '=' model),
  CLOSE-DEPTH, MIXED-1DIGIT, thinking roles x every offered band in ws-cell-checks --card-opts.
- 2026-11-13 **pv debt PASSED** (narrow critic pvdebt, Opus medium, `design/audit/runs/lf-placevalue/critic-pvdebt.md`): fixes 668f6a8c
  (combine) + 1f18505d (unit_form), footprint flag `tightRows`. combine / unit_form / expand x independent / more-practice / test /
  review at S (M / L for combine and unit_form, L for expand), rename=more S, and the combine lesson M / L: all >= 8, keys match.
  Master merged at cbbbdade (redesign-passed 27). Open: F1 (C3 8, not held): combine Test S / Review S / Review M leave 34-45 % white
  under the grid; proposed check "a one-page Test / Review leaves at most one row's height under the grid, or uses no more columns than
  the Independent page at that size". O1 (item text): combine "+" spacing differs between pages. Backtest rows pv-combine-side-band /
  pv-unit-form-rename-side / -margin keep their old pointers until lf-checks' pixel tool (1c64a449) is on master; then fail 16014137,
  pass 668f6a8c / 1f18505d.

| Finding | Check (proposed / existing) | Backtest | On path | Would have saved |
|---|---|---|---|---|
| F1 white under the grid on a tight one-page Test / Review | proposed: ws-empty-band EB-PAGE "<= one row under the grid on a single page, else column count <= Independent's" | to add (fail 5ae74b97 combine Test S) | precritic via ws-empty-band | a re-grade |
- 2026-11-13 **composing:number_word_form PASSED** (critic nwf r3, 0fe802c4; r1 / r2 FAIL). redesign-passed.js PVW; PNGs
  design/status/lf-placevalue/nwf-pass/ (53) plus the r2 / r3 renders listed in critic-nwf3.md. Lesson 1 changed pages (number-name cells,
  14 of 30 at each seed) re-graded >= 8; ws-detailed-lesson --check / --repeats OK. Open, minor: N12 ("1 ones" steps). pv debt next
  (lead 11-13, lf-checks' pixel measure): combine S 38 %, unit_form rename=more side + margin, unit_form S EB-BAND 32.5 % (302).

### number_word_form rounds 2-3: findings -> checks
| Finding | Check (new / extended) | Backtest row (FAIL old -> PASS fix) | Path | Saved |
|---|---|---|---|---|
| N1 2-digit names: no named wrong answer | ws-words-checks WORDS-WRONG-RATE (new; reads the real provider) | pv-words-provider (2ccd5b21 -> 1e3b128e) | precritic opt-in | 1 round |
| N3 false hundreds steps under 100 | ws-words-checks WORDS-STEPS-TRUE (new) | pv-words-provider | precritic opt-in | 1 round |
| N2 TF claim not printed with H T O | ws-cell-checks --words-rules CLAIM-INK (new) | pv-words-claim | precritic opt-in | 1 round |
| N4 / N10 / N10b row answer places out of line | ws-cell-checks --words-rules ROW-SLOT-Y (new; lesson + guided rows; band 1,000 + zeroPlace always row) | pv-words-rowy, pv-words-rowy-1000 (706d940a -> 5a4ca828) | precritic opt-in (2 rows) | 2 rounds (N4 class came back as N10) |
| N5 model never shows its answer | ws-cell-checks --words-rules MODEL-ANSWER (new) | pv-words-model | precritic opt-in | 1 round |
| N6 chant vs slots; lesson ignored its practice opts | ws-lesson-unit chant-box (new, always on) | pv-words-chant | ws-lesson-unit (gate) | 1 round |
| N7 dropped space at the highlight split | ws-cell-checks --words-rules WORDS-TEXT (new) | pv-words-text | precritic opt-in | 1 round |
| N8 "seven / hundred eight" breaks | ws-cell-checks --words-rules WORDS-BREAK (new) | pv-words-break | precritic opt-in | 1 round |
| N9 card drew the legacy visual (2 answer places) | ws-empty-band --screen-parity EB-PARITY (new, lead ruling) | pv-words-parity | precritic opt-in | 1 round |
| N11 numeral-to-words one across at S | ws-empty-band EB-SIDE on the to_words option (exists; backtest added) | pv-words-towords-side (706d940a -> 5a4ca828) | precritic options variants | 1 round |
| band 20 S stretched rows | ws-empty-band EB-BAND (exists) | (builder r2 row) | precritic | 1 round |
| N12 "1 ones" step plural (minor, open) | PROPOSED: step-string lint \b1 (ones|tens|hundreds)\b | none | - | - |
| guided Model tab row 2.5-3.2 mm (guided.js, D3) | ROW-SLOT-Y records, does not judge the Model row | none | - | 0 - engine |
| card EB-SIDE 36-42 % (host width, D3) | ws-empty-band EB-SIDE (exists) | none | - | 0 - hosts |
- 2026-11-12 WEEK 2 (cap $45; branch claude/lf-placevalue-w2 from master d34311d5): pv card extended to number_word_form, compare,
  more_less_10, more_less_100 and signed by the owner (lead f448883f). number_word_form: words cell in place (EB-BAND 364 -> 47; the rest
  test.js / review.js), its lesson (lessons/families/placevalue.js), lesson 1 opted out of the new rows (cellPayload inPlace false); lesson
  baseline 1,556 hashes identical; detailed lessons OK except the known g1-oa1 / g3-oa8 E9 / E35. Critic nwf r1: FAIL (N1-N9, critic-nwf1.md).
  Fixed after it (not re-graded): N1, N3, N4, N8. Open: N2, N5, N6, N7, N9 (lead ruling), band=20 S, to_words capacity. Budget spent.

### Week 2 findings -> checks (owner 2026-11-09)
| Finding (critic nwf r1) | Fixed this round | Check | Backtest | On path | Saved |
|---|---|---|---|---|---|
| N1 2-digit names had no named wrong answer (TF all True, Reason It 1 item) | yes: providers/pv.js wrongAnswer M-V9 401 / M-L3 swap / M-Z1 for 2-digit | ws-words-checks WORDS-WRONG-RATE (DRAFT: getProvider reads every candidate as a nudge on both commits) | pending | not wired (draft) | 1 round once wired |
| N2 TF claim never prints with answerSlot hto | no | PROPOSED ws-cell-checks CLAIM-INK | none | - | - |
| N3 "thirty-five hundred: 0 in the hundreds" steps under 100 | yes: workedSteps 2-digit branch | ws-words-checks WORDS-STEPS-TRUE (DRAFT, same reason) | pending | not wired | 1 round once wired |
| N4 "one hundred" in a 2-digit row 5 mm lower | yes: two-line box only for names >= 15 chars over 100 | PROPOSED ws-cell-checks ROW-SLOT-Y | none | - | - |
| N5 model never shows its answer (scripted-model / guided / opener) | no | PROPOSED ws-empty-band --model-states MODEL-ANSWER | none | - | - |
| N6 chant "Three boxes" over 2-digit items; lesson role ignores practice opts | no | PROPOSED lesson-unit chant-box assertion | none | - | - |
| N7 "one hundredthirteen" in the guided model | no (source not found this round) | PROPOSED ws-cell-checks WORDS-TEXT | none | - | - |
| N8 "seven / hundred eight" breaks | yes: "n hundred" kept together (no-break space) | PROPOSED ws-cell-checks WORDS-BREAK | none | - | - |
| N9 card host draws legacy q.visual (two answer places) | no: lead ruling needed (D3 names worksheet / quiz, not card) | PROPOSED ws-empty-band SCREEN-PARITY | none | - | - |
| band=20 S 45 %, to_words capacity | no | ws-empty-band EB-BAND / options-render (exist) | none | precritic | - |
- 2026-11-09 ROUND 5 (lead, cap $20; branch claude/lf-placevalue-r5 from master 2fe21f2b): critic r5 (critic-r5.md) PASS for identify and
  unit_form on every changed page. N-r4-1 margin (rename line +3 digits after the fixed width: 27 %), G5 (Fix-it words from the pv frame),
  E-r4-1 (identify Guided two across, lesson data guidedCols: L 4 -> 3 pages) fixed. The unit_form worksheet host band (legacy cell) NOT
  fixed: hosts-lane code. PNGs: design/status/lf-placevalue/r5-pass/. Lesson 1 --check / --repeats OK; boot-smoke, providers-unit OK.

### Round 5 findings -> checks (owner 2026-11-09: every finding a check)
| Finding | Check that now catches it | Backtest row (FAIL old -> PASS fix) | On precritic / detailed-lesson path | Would have saved |
|---|---|---|---|---|
| N-r4-1 unit_form rename=more S side band passed at 29.9 % (fragile) | ws-empty-band `--margin N` (EB-SIDE / EB-BAND at 30 - N %) | pv-unit-form-rename-margin (2fe21f2b FAIL -> a1c8d595 OK) | backtest only: `--margin` not default on precritic (it would flag every near-limit cell of every lane; proposed as a lane opt-in once pinned) | 1 round (r5) |
| G5 error-analysis Fix-it singular word gives the answer | ws-fixit-words FIX-WORDS (new) | pv-unit-form-fixit-words (2fe21f2b FAIL -> a1c8d595 OK) | precritic (opt-in lf-placevalue newRow) | 2 rounds (r3b found it, open through r4) |
| E-r4-1 identify lesson L page 2 43 % empty (page 3 never moved up) | ws-empty-band `--page-fill` EB-PAGE (new) | pv-identify-lesson-page-fill (2fe21f2b FAIL -> 07634a75 OK) | precritic (opt-in lf-placevalue empty-band args) | 1 round (r4 -> r5) |
| unit_form worksheet host 32 % bottom band (legacy cell, rename=more) | ws-empty-band EB-BAND (exists; run with `--opts {"rename":"more"} --hosts worksheet`) | none yet: NOT FIXED (the cell is drawn by the legacy screen path, hosts lane) | precritic runs hosts with default opts only: option variants on hosts are not rendered | 0 (unfixed) - reason: hosts-lane code |
| N-r5-1 identify lesson L warm-up cells EB-SIDE 31 % (lesson.js two across) | ws-empty-band EB-SIDE `--roles lesson` (exists) | none: ENGINE-ROLES (lead D3), not fixed by pv | precritic empty-band row renders lesson for the lane skills | 0 - reason: engine finding, lf-engine |
| N-r5-2 S/M vocabulary cell grew into freed height (capIfEmpty 0.3), ~43 % empty split above and below | PROPOSED: EB-BAND on the vocab band (`.mq-lvocabcell` is not a kit cell today) | none | not on path | 0 - reason: grade unchanged (24 % by EB rule); engine |
- 2026-11-08 critic r4 (critic-r4.md, 98fb4236): **placevalue:identify and placevalue:unit_form PASSED** (redesign-passed.js PV4, pv approved
  siblings; PNGs design/status/lf-placevalue/{identify-pass,unit_form-pass}/). All five lesson #1 skills now pass. Open: G2 margin 0.1 point
  (N-r4-1), G5 error-analysis Fix-it singular word (out of bar), E-r4-1 lesson.js page split, the unit_form worksheet host band (legacy, 32 %).
- 2026-11-08 OWNER RULINGS (via the lead, "yes to your recommendations"): (1) fact-probe is OUT OF SCOPE for pv - card re-signed
  (lead 1e2422e7, merged into r4). (2) combine band 99 at S: the side space is ACCEPTED, the line is not widened - an OWNER-RULED
  PIN on that cell geometry (combine band=99, size S, the two-part frame cells): a side-band finding there is not a pv defect.
- 2026-11-08 ROUND 4 (lead, cap $35; branch claude/lf-placevalue-r4 from master 8573c66a): identify E-A1 (lead ruling: pv-owned) - the
  "ones" vocabulary picture drawn compact (lesson.js `blocks` opt-in `compact`); unit_form G2 - rename frames' write line +2 digits at S.
  Checks first: ws-empty-band --vocab-ink (EB-VOCAB) on precritic's path, `--only`; backtests pv-identify-vocab-ink, pv-unit-form-rename-side.
- 2026-11-08 critic r3c (critic-r3c.md, on ce9a2fc4): expand still PASSES on the new deal; **placevalue:value and placevalue:combine
  PASSED** (redesign-passed.js, pv approved siblings; PNGs design/status/lf-placevalue/{value-pass,combine-pass,expand-r3c}/).
  identify PASSES if the lead rules E-A1 (lesson.js blocks picture height) engine; else its lesson p2 is C3 7. unit_form not graded (G2 open).
- 2026-11-08 DEPLOY HOLD (lead): lesson 1 (g2-nbt3) `ws-detailed-lesson --check` FAILED on 9b0972f7 (E9c, E11, E24, E24b; master OK).
  Fixed 8d80d13b + the zero-cap follow-up: E24 zero place drawn in the fresh deal (not dealIndex), E24b the Prerequisite Check dealt as
  one page (print-sheet pageLr6), E11 / E9c / E9b the pack's refs `cellPayload {noTabSpacer, inPlace: false}`. Lesson 1 --check and
  --repeats OK; lessons 3, 5a, 5b, 6 --check OK; g1-oa1 and g3-oa8 FAIL identically on master (E9 / E35: not pv). The five passed
  lessons are opt-in precritic rows; backtest pv-detailed-lesson-1 PASS. ws-dealer-uniform combine some / always OK; combine
  zeroPlace=none FAIL (21) is pre-existing (same at 9b0972f7). Expand / combine pages now DEAL different numbers (zero position
  spread by the fresh deal's cap, not by index): layout unchanged, but the graded expand pages are not byte-identical any more.
  Targeted critic r3c (identify / value lessons, combine changed pages) was stopped when the hold came: waits for the lead.
- 2026-11-08 critic r3 (critic-r3.md) + r3b (critic-r3b.md): **placevalue:expand PASSED** (redesign-passed.js 4db17849, pv approved
  sibling; 41 expand pages byte-identical HEAD vs the graded aacae5ea). identify (F3 vocab fixed aacae5ea, F4 heading fixed in
  lesson.js 70e35893 - other short lessons byte-identical), value (G1 vocab fixed 94de4e16 / 671014c0), combine (F1 fixed, F2 S fixed
  deb9e426; band 99 M EB-BAND and test L EB-SIDE are layout / test.js), unit_form (G2 rename=more S side bands open) - each needs a
  re-grade of only those pages. Evidence PNGs: design/status/lf-placevalue/expand-pass/. Deploy gates on 4db17849: ws-redesign-passed,
  code-snapshot, standards, search-terms, providers-unit, boot-smoke OK; ws-stamp-assets --check stale (integrator stamps).
- 2026-11-08 SMALL FIX PASS before critic r3 (builder, mq-opus-medium), 064e243e: (2) combine band=99 S: two-part frames held to
  3 across at S (footprint hardCap 3) and, 3+ across, "= ____" on its own line: 3x10 one-line cells at 35 % -> 3x9 two-line cells
  as tall as their ink; (3) expand band=99 S: the 2-place row may stand 3 across at S, the number over "= [ ] + [ ]" (S only: two
  across, TWO_COL_ROWS 8 rows stretched M to 45 %). options-verify --band-h13 combine,expand FAIL (2) -> OK; backtest pv-r3-band99-s
  PASS (fail ce2d4c96). (1) EB-FOOT on mixed-practice NOT a pv footprint: ws-empty-band pairs each cell with measured[fits[0].cols],
  but mixed-practice's fits[0].cols is the LATTICE N (4 / 6), not the count across (identify L 2 across, measured[2] 45.0 = drawn
  45.4; expand M 1 across, measured[1] 18.0 vs drawn 19.6) - the check's pairing (tests/scripts/ws-empty-band.cjs, lf-checks).
  Left at the 30 % rules (band=99, independent / test / review): combine S EB-SIDE 32 % (two-line ink 26 mm in a 61.5 mm cell),
  combine M independent EB-BAND 30.0 % and expand M EB-SIDE 33 % (pre-existing: TWO_COL_ROWS / full-width row), combine test L
  EB-SIDE 30 % (pre-existing).
- 2026-11-08 FRESH BUILDER r3 (rule 7, mq-opus-medium), commits 4a57b5c2..HEAD. N1-N4 FIXED (providers/pv.js, gen-pv.js): checks
  --pv-r2 N1..N4 FAIL on b28a0867 (23/2400, 120/160, 180/1800, 96/480) -> OK; backtests pv-r2-wrong-differs / printed-instruction /
  combine-parts / place-word-live armed (pass 4a57b5c2), PASS. N5-N8 checks BUILT (opt-in via opt-in-rules.json; default runs unchanged):
  N5 options-render --band-h13, N6 ws-cell-checks --h13-abs (30 % of the full cell, lead ruling 2026-11-08), N7 precritic `newRow`
  review rows + lesson rows with --rules H13-ABS,GRID-EVEN-ALL, N8 ws-coverage-matrix --red-no-baseline PAGEFILL,H5. Backtests
  pv-r2-band-h13 / cell-h13-abs / review-one-layout PASS (fail 5aadc52d, pass dca16b12); pv-r2-red-no-baseline PENDING. Cell fixes:
  N5 comma track on the digits' line height (value band 9,999 L 12 -> 18 items); N6 rename frames one full-width row (`rowOnly`) with
  a 5-digit write line (S 16 in 2x8 at 44 % bands -> 15 in 1x15); N7 3-across combine frames ghost-backed (unit_form review S 0 findings).
  NOT FIXED (owner elsewhere): N8 the 2-column request - sheet/layout.js resolveSectionLayout gives Auto and an explicit N the same item
  cap (itemCap / fp.maxCols / hardCap); a footprint cannot say "1 column on Auto, 2 when asked" (proposed: an `autoMaxCols` footprint
  field read in the Auto `top` and the dense `colOpts`); allowing 2 columns in the cell made Auto pick 3x9 wrapped expand rows at S.
  Remaining at the 30 % rule: combine band=99 S/M independent (3x10 rows held by DENSE_CEILING S 30, one-line 2-part frames in 22.8 mm
  cells) and expand band=99 S (2-place row in a full-width cell, 34 % side bands) - pv, not started (time); review / lesson / guided
  H13-ABS rows (review.js R-c, lesson.js warm-up rows, guided.js R-e) - roles.
- 2026-11-07 ~20:00 FINAL HAND-OVER of the resumed round. Checks from critic r2 (62b1bdcd): ws-providers-unit `--pv-r2 N1,N2,N3,N4`
  (WRONG-DIFFERS per slot 23/2400, PRINTED-INSTRUCTION 120/160, COMBINE-PARTS 180/1800, PLACE-WORD-LIVE 96/480 — all FAIL on HEAD),
  wired via opt-in-rules.json `providers`; default run unchanged (105431 OK); four PENDING backtest rows (arm with the fix commit).
  PROPOSED (not built): N5 options-verify --bands no H13 exemption; N6 H13-ABS in ws-cell-checks; N7 opt-in rules on lesson / review rows;
  N8 lane-own PENDING(no-baseline) rows with PAGEFILL / H5 count RED. NEXT ROUND (fresh builder, rule 7): fix N1-N4 in providers/pv.js
  and gen-pv.js (per-slot wrong answers; option-aware instruction for the item-less path; combine >= 2 parts on band 99; place words
  only up to the number's highest place), then N5-N8 cells, precritic, critic r3.
- 2026-11-07 resumed round (lead, $80): merged integration; builder r2 (9f483f78, 9b67cd84): every pv cell fits every offered option on
  its own pages (cell-checks combine 196→0, value 48→0, expand 32→24 lesson.js, unit_form 22→10 reason-it.js); precritic r4 12 FAIL, all
  owned elsewhere or process; fact-rows opEm crash = master hotfix 1000d1ad9 cherry-picked (38be3ad1). Critic r2 (critic-r2.md): FAIL all
  five — N1 identify T/F key wrong (C2 3), N2 instruction, N3 combine band 99 one-part (C2 4), N4 'hundreds' on 2-digit, N5 / N6 band
  pages' empty bands, N7 review mixes two layouts (r1 F9 again), N8 2-column request ignored (r1 F21 again). RULE 7: N7 / N8 survived two
  medium rounds -> build loop stopped; checks for N1-N3 built, N4-N8 proposed; LESSONS_LEARNED L25-L28 + the r2 section; speed-audit.
  Shared-role findings filed by the critic: R-a true-false.js:43 answer line by digit count; R-b guided.js:606 three hint lines; R-c review
  rows grow to the fill limit; R-d true-false 4 items at S like L.
- 2026-11-07 lead D4 / D5: (D4) writeValue: false added to the identify Warm-up / mixWith refs OUTSIDE the lane block in
  js/modules/lessons/prereqs.js — the addition no-regroup lessons (the `pv` ref ~line 91 and the three mixWith refs ~96 / 101 / 107)
  and number_sense:nearest_10 (skills ~373, mixWith ~409); they practise the place, not the value. MERGE TRAIN: lf-engine moves
  prereqs.js records to lessons/families/*.js — port these six opts and the lf-placevalue block. (D5) sheet/contract.js
  INSTRUCTION_LIBRARY + 'place-circle-value' (lead's text) and 'place-write-value' (the bank form, same pattern); identify uses
  them when writeValue is on (gen-pv printText, provider instructionKey).
- 2026-11-07 lead rulings T1 / T2 on the opt-in checks: H13-ABS limit 35 % of (cell − Hw), not 30 % (evidence: approved
  sub_50_no_regroup / sub_2d_1d L 27 % raw, add_facts L 30 % fire at 30 %; pv value L 34 %, the critic's pv bands 34–55 %; backtest
  optin-h13-abs still FAIL 14.6 mm ≥ 14.5 mm limit / OK); SCREEN-DIGIT keeps the size floor for every skill, weight ≥ 700 only for
  placevalue:* (paper bold); backtest optin-screen-digit PASS. Sibling: H13-ANY (band anywhere) stays in lf-ops' ws-cell-checks.
- 2026-11-07 lead rulings after r1: D1 lane owns the additive checks H13-ABS, WRONG-FITS per slot, GRID-EVEN all sections,
  SLOT-W-EQUAL, DRAW-CAP, SCREEN-DIGIT, options-verify bands (opt-in, precritic --skill only); precritic plan-from-card is lf-ops'
  (fix4 branch, merge when it lands). D2 stretch: owner asked; carried "offered, not graded" (RUBRIC scope note), no re-sign.
  D3 engine findings (F2 opener, F17 reason-it, F21 pagination: shared-roles lane, wave 2; F18 lesson half: lf-engine) are graded
  in critic r2 but do not hold the pv skills. Two builders running: pv fixes (gen-pv / cells / provider) and the checks.
- 2026-11-07 critic r1 (design/audit/runs/lf-placevalue/critic-r1.md): FAIL on identify, value, expand, combine, unit_form; 23 findings
  (F1 H13 empty bands, F3 wrongAnswer per slot, F4 writeValue missing, F5-F7 paper / screen parity and screen digits, F8 Size S on
  unit_form, F9 two geometries, F10 slot width, F11-F14 worked-step text, F2 / F17 / F18 / F21 engine roles). Rule-00 lists in
  design/status/speed-audit.md "lf-placevalue critic r1".
- 2026-11-07 precritic r2 (9888bad1 = integration tip + lane): 25 PASS, 2 FAIL (sibling-compare, options-render combine zeroPlace=none L),
  1 SKIPPED (card-not-offered); lead rulings R1-R3 (owner pin "Yes, accept 10"); critic r1 launched.
- 2026-11-07 r0 → fixes (4193f4b, a73304fd): combine dealer (dealIndex + freshDeal), CL-40 spacer for pv / pv-support equation rows
  (page + measuring cell), WRAP-OP (no-break expression; numeric frames never break), lesson data for 5 skills (chartWide / chartRow /
  tailLast), combine's worked steps write one digit a step. Backtests pv-combine-dealer, pv-lesson-data, pv-equation-row-cl40: PASS.
  Handed over: lesson Independent page PAGEFILL (lf-engine, roles/lesson.js); ws-card-rulings has no pv reader (lf-checks).
  Found next: expand's practice card is the legacy 'expanded' interactive (no kit cell, no Check button; ws-chromebook-fit FAIL);
  the chart support's heads are 5.8 pt at S (TY-11, pv-support-cell.js placeChartHTML).
- 2026-11-07 Decimals sizing: decimals:mult_decimal / div_decimal (gen-fractions.js, fractions lane) are legacy (emoji, colour, printFormat
  HTML, no kit cell, provider or options); decimal_models needs the unbuilt hundred-square template and the stack's dp track. A full
  family lane (spec card, two templates, migration): not started here.
- 2026-11-07 Lane started from 9398c3a; brief `design/lessons-first/briefs/w1-placevalue.md` written; pv card drafted and generated; owner questions sent to the lead.
