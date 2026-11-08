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
