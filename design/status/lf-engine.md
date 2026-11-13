Lane: lf-engine
Title: Lessons phase 0 fix round, the lesson compiler (E4), and its proof
Session: session_013pHDnLTpMERUWs7oNEgzJ3
Branch: claude/sweet-newton-c8wrv1-lf-engine
Owner of files: lessons/{library,schema,compile}.js, lessons/shapes|units|families, sheet/lesson-pages|lesson-arch, roles/{lesson,detailed-lesson,pre-skill-check}.js, print-sheet buildLesson/buildDetailedLesson, ws-lesson-{card,seed,coverage,hash,unit,baseline}, design/lessons/
Builder profile: mq-opus-medium
State: paused
Updated: 2026-11-07
Critic rounds: 2, FAIL min 6 (r2: N1 sub L sheet lost its Independent row)

## Now
- 2026-11-13 07:20 UTC g3-oa8 drift DIAGNOSED (lead 06:35 item): not a flake, not master drift. Two serial master baselines (69a6560b5, all-lessons L,S, 4242+1) 0 / 1598 differ; lf-builds-stories' logs show g3-oa8 html + p06 + p09 changed at both seeds (html is font-independent); cause = that branch's story changes (lesson-arch/story.js sentenceState bar-big / bar-diff slots, columnPanel, word-work provider). Routed to lf-builds via the lead; lf-checks told ws-lesson-baseline needs no ws-fonts.
- FYI (lf-placevalue 06:40, cc): claude/lf-placevalue-w2 (e8371e69) adds opt-in footprint flags keepCols (print-sheet.js) and spreadMax (practice.js; a tightRows section may spread up to the cap) - merge watch for the live round, which also touches print-sheet.js / practice.js; new rulings WORKSHEET_DESIGN_STANDARD CL-2c and PAGE_TYPES PT-ENG-6 (teacher-set columns, middle-page strips <= 25 %). Engine findings on placevalue:compare went to lf-roles (design/audit/runs/lf-placevalue/precritic-compare-r2.md).
- QUEUED after the Prerequisite Check critic r4 (lead 06:35, from lf-builds): lesson g3-oa8 differs on 6 / 1556 baseline pages with or without lf-builds' change (logs in lf-builds' logs/lb/) - flake (font-load race? same class as the E2 bug logged for lf-checks) or master drift; lf-engine owns the diagnosis: rerun the baseline twice on clean master serially, compare hashes, then decide.
- QUEUED for the $30 live round (lead 06:20, from lf-partopts): placevalue:identify STANDARD lesson sheet at M leaves a 37.8 mm foot against a 36.5 mm shortest row yet says "no room" — add the row or fit it (ROWFIT: no sheet foot >= the shortest row's height; same class as item 6). Also queued from the item 7 critic (de8eec183, PASS min 8): story first-line y aligned across a shelf (2 px); no two adjacent word problems share object + frame; a section split over 2 pages has fills within 10 %.
- 2026-11-13 04:30 UTC lead rulings: live-pm2 split approved (revert item 6, add_wp_10 PNGs, deploy items 1-5 + 7); TAB-CLEAR 1 mm for one-line across facts confirmed (CL-40). Order: (1) Prerequisite Check critic r4 -> flip on PASS; (2) live round cap $30: 40 dead carry boxes on sub_*_no_regroup Mixed keys FIRST, then item 6 (Y4.B1.S14 L sheet) with TAB-CLEAR on sheet blocks + stricter SHEET-2PG, then ~15 pv / sub_no_regroup PM-H13 bands. live-pm2 re-critic: design/audit/runs/lf-engine-live-pm2/ (items 1-5 PASS, item 6 FAIL worse, item 7 ungraded).
- 2026-11-13 04:50 UTC: Prerequisite Check r3 fix round done on -pc 7ff8a87ab: F1-F4 fixed with gates PC-PV, PC-CLIP (ink), PC-FRAME, PC-LR5 (forced, 8 seeds), PC-H13P; backtests lesson-check-pv-heads, lesson-check-clip-ink, lesson-frame-closure, lesson-lr5-forced; live baseline 0 / 1556. Open: F13 (near-twin itemNumberKey); `ws-lesson-check --force-check` 194 findings to triage against unforced. Next: merge -live-pm2 (after its re-critic) into -pc, F13 + triage, precritic, critic r4, flip prereqsLive on PASS.
- 2026-11-13 03:05 UTC: live-pm narrow critic FAIL min 5, NO regression (every changed page equal or better; every sub-8 is pre-existing on master; report design/audit/runs/lf-engine-live-pm/ on -live-pm 9135190b9). Lead ruling (a): deploy -live-pm as a strict improvement; next live round approved $18: (1) equation / missing-factor centring, (2) word-problem S band, (3) Mixed continuation pages never >= 50 % blank, (4) rounding Mixed centring + tab clearance, (5) div_facts S Practice p3; each with a check, then a re-critic on the same spot sample.
- BUG FOR lf-checks (slot / load contention, 2026-11-13): ws-detailed-lesson E2 fails under parallel load. Seven lessons run in parallel on -live-pm 9135190b9: g2-nbt3 and g4-nbt1 FAIL E2 "700/28px false, 400/15px false" (Andika not yet loaded when `document.fonts.check` runs at line 72; `document.fonts.ready` at line 904 resolves before the web-font fetch finishes); g3-oa8 passed this time; each passes alone (byte-identical HTML). Earlier batch flakes on g2-nbt3 / g3-oa8 are the same class. Fix: await `document.fonts.load('700 28px Andika')` + `('400 15px Andika')` with a bounded retry before measuring, and report a font that never loads as ERROR (infra), not a page FAIL. Other lines in that run: g1-oa1 E9 / E35 (known), the rest OK.
- QUEUED (lf-algebra r7 47b1f2a86, lead ruling (a) 2026-11-13), after the check work: routines may carry `stepsBy: {<option>: {<value>: [steps]}}` (e.g. function-table-use-rule stepsBy.ftTask['rule-check'], 5 steps); lesson-pages/common.js namedSteps reads it; new check ROUTINE-STEPS (routine step count == provider workedSteps count for every option value) + backtest row. Symptom: function_table_easy ftTask=rule-check lesson overflows 2.4 mm (provider 5 steps vs routine 4; namedSteps falls back; 2x2 chart merges steps 1-2).
- 2026-11-13 01:40 UTC: Prerequisite Check critic r3 FAIL min 6 (`-pc` 316102081, report design/audit/runs/lf-engine-pc-r3/). Check pages near-miss 7 (F1 pv heads give the answer; F2 sub S Q6-8 clip); fails on Mixed (F5 55 % band, F6 dead hundreds carry box) and round Practice (F7 49 %) - probably LIVE on master too, verify first. prereqsLive stays off. Backtest tool fix on `-bt` 602c9aa6b (139/12/12/0/0) sent for deploy. Session $383.65.
- QUEUED (from lf-algebra precritic, via the lead 2026-11-13; see design/status/lf-algebra.md 'Red, by owner'), after the Prerequisite Check critic: (1) chartWide packing (print-lint lesson); (2) lesson pages for count-row option values; (3) pre-skill-check pages overflowing the sheet (likely fixed by the -pc branch's one-page rule - re-check on lf-algebra's skills).
- OWNER RULING 2026-11-12 (via the lead): the long detailed V22 lessons are ON HOLD; build the SHORT lessons first all the way through (Prerequisite Check, anchor chart, lesson sheet with vocabulary / Remember / We Do, Practice, Mixed). Lesson 2 E9 / E35 dropped for now. Next round: the Prerequisite Check (LR-17, critic r2 FAIL min 6) to a pass so prereqsLive can be switched on, then compiling short lessons unit by unit from the queue.
- LIVE: lessons phase 0 is on master ec61b069 (fa7b66a0 + stamp + STATUS; lead's gates match master). Lanes now edit lessons in lessons/families/*.js and lesson-pages/*. Full ws-backtest re-run on -land HUNG (no rows printed; killed at 7,000 s; last checkout pv-expand-card-kit-fail; suspected browser-lock wait) - 69 rows still un-run on the landed tree; proposal: per-row runs with a timeout + streaming output. PARKED (session $291.59 ≈ 14.6 %).
- 2026-11-09 15:05 UTC: PHASE 0 READY TO LAND - `claude/sweet-newton-c8wrv1-lf-engine-land` fa7b66a0 (FF of master 4c5de5a2): --all-lessons proof 0 of 1,556 vs master 1fedbb55 and vs 4c5de5a2; L1 vocabZoom / L2 roundOneNum opt-in behind phase0On (prereqsLive); gates as master (precritic same 5 reds, detailed lessons same lines); full ws-backtest incomplete (69 rows unrun after a disk fill; tool fixed c3245504). Sent to the lead. Session $285.16 ≈ 14.3 %.
- 2026-11-09 11:30 UTC: phase-0 LANDING stopped (lead's stop rule): `claude/sweet-newton-c8wrv1-lf-engine-land` 3bf3ef5c (contains master f6216420); --all-lessons baseline on master 1fedbb55 = 1,556 hashes; land differs on 80 (L1 the lane's N1 vocab zoom adds Independent items on 8 live sheets; L2 nearest_10 Practice +1 row); all 7 detailed lessons, add/sub samples (LR-17 switch proven) and 15 more live lessons identical. Decision asked of the lead: (A, suggested) make L1/L2 opt-in on the phase-0 samples only, re-prove 0 diffs, full gates (≈ $10-15). Session $253.93 ≈ 12.7 %.
- 2026-11-09: lesson 2 P0 drift FIXED on the lane (b1e30155: print-sheet.js pageLr6 also on a perQuestion pre-skill-check, master's lf-placevalue line). Diff `ws-lesson-deal-diff.cjs`: dcdb50d4 seed 1 P0 dealt 11 + 5 / 2 + 11 (twins 16, 13) where master deals 2 + 13; after the fix lane P0 == master P0 at seeds 1, 2, 4242. E24b + E31 PASS at seeds 1-5 + 4242; E9 / E35 unchanged (deferred by the lead). New check `ws-lesson-unit --only p0-overlap` + backtest row p0-overlap. Not ported (other lanes', not P0): warmItemKey (lf-placevalue), factSections (facts-print-fix). Not pushed.
- LIVE: lesson 2 E24b every-seed fix is master 198d437e9 (lead's gates green). PAUSED. Next week, in order: (1) node P0-deal diff lane vs master at fixed seeds (the lane's extracted engine deals P0 twin answers at 5 of 6 seeds); (2) the P0 answer-overlap check; (3) lesson 2 E9 (+5 mm) / E35.
- 2026-11-08 20:10 UTC: lesson 2 E24b at every seed on `claude/sweet-newton-c8wrv1-lf-engine-live-l2b` (80b189e1, 4b0f79b5 on master 8573c66a): E24b + E31 PASS at seeds 1-5 + 4242; gates green; sent to the lead. LANE still red: same data on the extracted engine deals P0 twin answers at 5 of 6 seeds (drift in lane pre-skill-check / detailed-lesson vs master; next: node P0-deal diff lane vs master). Session $224.69 ≈ 11.2 %.
- Lesson 2 E24b at every seed (2026-11-08 night, STOPPED at budget): -live DONE (lf-live-l2b from master 8573c66a: 80b189e1 attempt 4 + P0 ruling, 4b0f79b5 fixes 1-2): E24b + E31 PASS at seeds 1-5 and 4242, E9 / E35 as on master, every other lesson and the samples byte-identical. Lane (00ca4b10, ceb557b5, docs, card c7f9aa0a): E31 PASS at every seed, but E24b FAILS at seeds 1, 2, 4, 5, 4242 with TWIN ANSWERS on P0 (seed 1: counts 13, 16 and + facts 2 + 11, 11 + 5) - the lane's engine deals P0's + facts without dodging the counts' answers, master's does (same dealer code, same description). Not the spare items: dealing each question its own items changed nothing (reverted, fffc41dc). Next: dump the P0 deal (pool order, `seen`, `pg`) lane vs master at seed 1. Not pushed.
- Lesson 2 E24b P0 ruling (2026-11-08 evening): owner ruling APPLIED on the lane (P0 + facts a teen and ones; record, card rulings, units/G1-Y2.B2.js, pack-feasible check). Engine attempt 4 (solve-first + Practice 1 from a whole-pack solution) clears E24b at seeds 1, 3, 4, 4242 but FAILS at 2 (P0 count 18 / 19; E31 chart add-to / equal-parts examples missing) and 5 (P0 bonds 9 / 10): NOT committed (patches design/lessons/proof/live-2026-11-08/lesson2-p0-ruling-attempt4-*.patch); -live not committed. Next: P0 count / bond ranges (2 items need >= 2 non-near values each) and the chart's second / third examples from their own case pools or pinned from the pack solution.
- Lesson 2 E24b solve-first (2026-11-08): STOPPED (rule 7). Solving Practice 1 first clears Practice 1 at every seed tried, but the pool (20 facts; the pack needs ~18 under LR-5 / LR-6) moves the twins to P0 (seeds 1, 2, 5) and Guided (4242); seeds 3-4 time out. Not committed; patches in design/lessons/proof/live-2026-11-08/. Next: a whole-pack solver or an owner data decision (wider parts / sums, or fewer places).
- LIVE: lesson 2 attempt 2 is master 5404c6477 (lead's gates green). Stopped for the week; next week starts with lesson 2 solve-first.
- Lesson 2 E24b attempt 2: fixed at seed 4242 (solveStoryFacts + setDealPin, lesson 2 only), on `claude/sweet-newton-c8wrv1-lf-engine-live-l2` 444c50d4 (from master 5cbe360d2) - sent to the lead. Seeds 1-3 still infeasible (no valid Practice 1 after the chart, Guided, exit and Check Question deal): next step solve Practice FIRST and add its set to `used`; node count of valid pages per seed before any render. Session $184.88 ≈ 9.2 %.
- LIVE: master 5cbe360d2 (lesson 3a owner rulings + lesson 2 parts 2-9; lead's gates green). Stopped for the week; next week starts with lesson 2 attempt 2 (pin the generator's case - sum and parts - not the exact fact).
- PAUSED (evening rounds done). Deploy list sent: -live 538c2b58, 0b8ffb14, a0cca381 (lesson 3a owner rulings PASS narrow critic r2 min 8; lesson 2 parts 2-9).
- Open: lesson 2 E24b (deal order; attempt 1 patch in design/lessons/proof/live-2026-11-07/), E9, E35 (lf-checks gate); phase 0 critic r3; P2b proof; pv chartPage defects (item 8).
- Next-week order: see "Hand-over 2026-11-07" (items 2 and 3 updated).

## Owner go

## Open questions
- Lead ruling 2026-11-07: lesson 3a's pre-existing H13 bands (P0 item 7, 2 × 2 beside 5 × 5, 53 %; P6 cells 2-3, 42 %) - unchanged from master's passed render - are held for the next FULL 3a re-grade; the narrow live critic grades only the changed pages.
- Owner ruling 2026-11-07 (via the lead), lesson 3a g3-oa5-mult-properties: every fact family once, arrays up to 6 × 6 (products ≤ 36, ~15 pairs); the only turned pair is the one the task asks the pupil to draw; the lf-checks LP-FAMILY-REPEAT gate is right; 3a's Practice pages need a re-grade. Queued after lesson 2 + lesson 4 LP-GIVEAWAY.
- Owner 2026-11-07: lesson 2 shipped with its 4 gate findings (live fixes on master ef532943a).
(none: owner ruling 2026-11-07, the lane decides card lines from the standards; decisions are in LESSON_RULES LR-17a and the cards)

## Hand-over 2026-11-07
**State.** Merge oracle holds (detailed lessons byte-identical to master except the listed fixes). Phase 0 fix round: D1-D18, D20, L7 D1; critic r2 FAIL min 6 (add + round sheets PASS 8; check / routing pages 7; sub L sheet 6 -> fixed N1 since). Compiler E4 built: card format, ws-lesson-card, compileLesson, shapes, SHAPES.md (843 lessons; 19 of 64 BUILD lessons in passed shapes, 45 need new shapes), 7 proof cards compile. Keys for other lanes: practiceBlocks 6bcfe3cc (lf-ops), guidedRows 50c1eca6 (lf-algebra).
**Remaining, in order (next week, Opus medium):**
1. Deploy the -live branch's 5 commits (R9, R8, R6, lesson 2 E24, lesson 4 Say line).
2. [P1d 2026-11-07 evening: owner ruling parts 2-9 applied (538c2b58 live, e13ef858 lane); P0 twins gone; Practice 1 still 7+4 / 8+5 at 4242 - root cause GREEDY DEAL ORDER (a whole-pack assignment exists): deal Practice's non-edge places first under `reserve`, or a pack solver.] Lesson 2 (g1-oa1) E24b: pool exhausted (crossing-ten stories with parts 3-9 ≈ 15 facts; chart, sheet, P5, P6, Check Question take 9; the ±2 near-twin rule leaves no 4th Practice story) - needs a data decision: widen the parts to 2-9 / sums to 18 with ±1 near-twin, or Practice 3 stories. E35 (lessons 2 and 7): probably ws-detailed-lesson's bodyText joins text nodes with " | " (lf-checks: compare against printed.replace(/ \| /g, ' ')). E9 P6 +5 mm: not investigated.
3. [P1d: DONE - 538c2b58 live, e13ef858 lane; LP-FAMILY-REPEAT 25/25; E27 (counters ≤ 5 a row) and E12 (two Practice 1 pages differ 1.6 mm) conflict with the ruling: lf-checks; 3a Practice pages need a re-grade.] Lesson 3a owner ruling (every family once, arrays to 6): not done (rule 7). Practice 1's arrP1 pool (non-square, no 5s, products <= 16-18 so array + turn fit a half cell at L) has only 4-5 families. Needs a layout decision for Practice 1: one column of taller cells (cells full width), or drop "no 5s". Array-family support in repeatKeysOf is in (88266322).
4. Phase 0 pages to critic r3: N2 narrower re-choice; N5 tab padding; N6 paired-band alignment; N7 titles with a topic; N8 (stack.js draws T O heads and answer boxes only at scaffold >= 2 while the rows are measured at 1 - set heads/answer on the payload before measuring); add_facts#lesson DN-2 0->1; samples' Practice / Mixed page fill (round cells 61 x 42 mm, 49 % bands: design call - 15-item ceiling vs the faded number line on Practice cells). Then critic r3 on design/lesson-samples (re-rendered 7744c2b4), r2 PNGs for side-by-side in the critic r2 commit.
5. `ws-lesson-hash --sheets`: 25 of 46 library sheets have no Independent row - the prereqsPending lessons (no-regroup subtraction, stories, fact_family_sort): fix with the sheet reflow or give them Prerequisite Checks.
6. P2b proof: render each compiled lesson 1-7 (`buildSheet({role:'detailed-lesson', description})` now takes a compiled description) and diff against the passed pack (design/lessons/proof/DIFF.md has the structural diff); critic; then swap the registry to compiled descriptions.
7. Pilot: `node tests/scripts/ws-lesson-card.mjs --draft --unit G3-Y4.B4`.
8. (lf-placevalue, 2026-11-07, branch claude/lf-placevalue @ 9b67cd84) chartPage defects on pv lesson pages: (a) big bands (identify band 99999/999999, places [10000]/[100000]; expand band 999999): 4 panels need 72-90 mm each in a 219.5 mm body; mode 'one' never zooms below 1 without a tail item and never splits the chart over 2 pages, so panels squeeze to rowH and overflow - zoom down to a floor, else two chart pages; (b) identify writeValue=false row variant: zoom from fitCols (ring row always "fits" by wrapping) = 1.74 while dH is measured at 2 columns - measure dH at the panel's effective width or cap zoom by measured height. Repro: `node tests/scripts/ws-cell-checks.cjs --skills placevalue:identify --card --card-opts` (252), `--skills placevalue:expand` (24).
**Gates at hand-over (lane head):** ws-detailed-lesson --check --repeats lessons 1, 3a, 4, 5, 6 OK, 2 and 7 FAIL (above); ws-teacher-wrm OK; ws-precritic --role lesson --strict FAIL (12 other-family pin rises, master too, + add_facts DN-2); ws-lesson-check 667 (LR-5 434, LR-13 133, LR-1 62, LR-6 23, LR-7 10, LR-10 3, LR-16 2); ws-lesson-unit (194), ws-layout-unit (1758), ws-lesson-coverage, ws-lesson-compile-unit (45), ws-lesson-card --check, ws-lesson-seed --check, ws-boot-smoke, ws-code-snapshot (732) OK; ws-backtest 81 PASS 1 FAIL (simple-print-exact-missing, fails in both states, not this lane). ws-lesson-baseline vs master: 148 of 303 differ = 120 samples + lesson 1 (R2, R9), 2 (builds), 4 (Say line), 5 (R6), 6 (R2, R8).
**Owner questions:** none open (rulings recorded above).

## Merge notes for lf-ops
Three lead-approved additive changes outside the lesson engine (lesson 3a owner ruling 2026-11-07, P1d e13ef858 / live 538c2b58);
lf-ops keeps or re-applies them when its branch merges:
- `js/modules/skill-options.js` - `multiplication:mult_properties` band option gains 36 ("6 (6 x 6)"): `_opsBand([25, 36, 81], 25, ...)`.
- `js/modules/gen-operations.js` - mult_properties: band 36 gives factors to 6 and pictured arrays a side of 6 (`hi = ... : Math.min(_band, 6)`); bands 25 / 81 deal exactly as before.
- `js/modules/sheet/cells/arrays-turn.js` - dotsSvg draws RP-21's 1.5 mm gap after the 5th dot when a line holds more than 5; arrays of 5 or less are byte-identical.
P1d round 2 adds two more, both gated on a flag only lesson 3a sets (every other sheet byte-identical): `print-sheet.js` section `capFillCont`
(from a practiceSheets entry's `equalPages`) and `sheet/roles/practice.js` capFill on every page of such a sheet (E12).

- P1d r2 (2), lesson 2 deal order - NOT landed (stopped at the round's budget). Attempt 1 (patch, against -live 0b8ffb14:
  `design/lessons/proof/live-2026-11-07/lesson2-solve-attempt1.patch`): `solveStoryFacts` picks Practice 1's four facts + its
  equal-parts fact from what the pack left (feasible at seed 4242: 5+6, 8+6 / 8+3, 3+9, square 9+9), and the dealer pins each
  non-edge place to its fact (`onlyKeysAt`, a hard bound). The build then timed out (Runtime.callFunctionOn): add_wp_20 deals
  its sum by case per item index, so a pinned fact is rarely reachable in the tries - pin the generator's case (sum / parts)
  instead of filtering its output, or let the place accept any fact of the solved set that keeps LR-6 (not one fixed key).

## Log
- 2026-11-07 — Merge: phase 0 + integration tip 623fdd6 (744aa9e5); 5 conflicts; master's lesson 6/7 + visual-quality hunks ported into lesson-pages/* and lesson-arch/*; master's new lesson records ported into families/addsub.js, multdiv.js. Oracle ws-lesson-baseline vs master: 183/183 detailed hashes identical, 120 sample hashes differ (LR-17, intended). Lesson 2 errors on master too (R1).
- 2026-11-07 — P2 compiler (fbdd7a08, 33c12857, merged feea00b2): card format (design/lessons/cards/README.md), ws-lesson-card (--draft, --check, --check-decided), compileLesson, shapes/, units/, SHAPES.md, queue reads SHAPES.md; DIFF.md structural diff of 1-7.
- 2026-11-07 — P1 fix round (4d956947..ec654c84): see the builder report below (Per finding).

## Times
- Merge + oracle: 06:25-06:40 UTC (baseline runs 2 × ~5 min).
- P2 builder: 06:33-06:58 UTC (node only, parallel worktree).
- P1 builder: 06:41-08:18 UTC (browser).
- Critic r2 + P1b launched 08:25 UTC.

## P1 per finding (builder report)
| # | Result |
|---|---|
| D1 | fixed (data: number_seq_fill kit track); lint: lf-checks |
| D2 D3 D5 | fixed (pinned options, dealt before choosing) |
| D4 D9 | fixed: one grid (routedLayout), bands 18-27 %, foot 6-9 % at L and S |
| D6 D7 | fixed in data (patterns:skip_count_line multiples of 10) |
| D8 | fixed: no `check: true`, level 0 measured and drawn |
| D10 D11 | fixed on Prerequisite-Check sheets only |
| D12 | fixed + check `lesson-prereq-checks-field`; routing table own key page "Prerequisite Check: where next" |
| D13 | fixed + check `lesson-title-constant` |
| D14 | detailed T6 kept (different columns; moving it changes passed lessons); claim corrected; check `lesson-routing-one-builder` |
| D15 | fixed + check `lesson-route-no-literal-styles` |
| D16 | fixed + check `lesson-routed-plan-units` |
| D17 | fixed + check `lesson-bind-stamps-refuses` |
| D18 | fixed + check `lesson-parts-plugin` (per-part build hooks, registry order, order-7 part lands second) |
| D19 | lf-checks (frame closure) |
| D20 | decided: curriculum order, most basic first (LESSON_RULES LR-17a) |
| L7 D1 | chartPage reports sizing {mode, zoom, fallback, ok}; buildLesson chartSizing, buildDetailedLesson chartsOk; check `lesson-chart-sizing-fails` |

## Precritic (P1, ec654c84)
| Gate | Result |
|---|---|
| ws-precritic --role lesson --strict | FAIL: print-lint +13 over pin (12 also on master: other families' PG-12 / L-OVERLAP; 13th coordinates H13 not reproduced alone); ws-teacher-wrm FAIL = lesson 2 build (R1, master too) |
| ws-lesson-check | FAIL 597 (LR-5 430, LR-13 85, LR-1 62 ...; 572 on the phase 0 head) — Practice / Mixed / chart classes, P1b |
| ws-lesson-baseline | 183 detailed identical; 120 sample differ (intended) |
| ws-lesson-unit (155), ws-layout-unit (1758), ws-lesson-coverage, ws-lesson-seed --check, ws-lesson-compile-unit (45), ws-lesson-card --check, ws-boot-smoke, ws-code-snapshot (732), ws-backtest, ws-precritic-plan | OK |

## Per-round findings (rule 00)
### P1 fix round
Automatic checks: check-page H13 / foot made blocking in precritic (lf-checks); a measured-vs-drawn height probe (legacy / fact cells measure 10-25 mm taller than they draw); LR-5 keys count_objects items by picture, not text; precritic --role lesson runs ws-lesson-unit and ws-lesson-coverage.
Speed-ups: a single-part render harness (`--parts prereq|sheet`, one lesson, PNG + band stats) cut each layout iteration to ~45 s — give ws-lesson-samples a `--parts` flag; dealing every prereq ref before choosing caught three bad choices without a render; background gates need the maximum timeout (a precritic run was killed at 600 s).
### P2 compiler build
Automatic checks: built in — script-vs-page "no X" refusal (L7 D3), placeholder resolution, timing = 60, option values vs schema, range floor vs band, prerequisite lesson ids real. Proposed: a passed lesson's card fails when its `--from-detailed` reseed differs; NEEDS per lane counted in the build list; every provider wrongAnswers id declared in its misconceptions; a backtest row for the D3 refusal on lesson 7 r1 text.
Speed-ups: seed cards from passed lessons (`--from-detailed`); item readers per template, not per shape; shared-section slot rule (−25 lines a lesson); `--render --decided` instead of hand-editing the markdown.

### Critic r2 (FAIL min 6)
Automatic checks: a lesson sheet holds ≥ 1 Independent row + Score at every size, blank foot ≤ 20 % blocking (N1); pre-skill-check plan() unit test — every question ≥ its items, no two-choice item alone (N2); routing page states the miss threshold, routed bands carry __/n (N3); LR-6 over the prereq part (N4); tab-to-content padding and paired-band alignment lints (N5, N6); routed titles carry a topic (N7); Guided and Independent cells of one sheet share structural parts (N8).
Speed-ups: r1 and r2 page side by side for every finding marked fixed; a fix scoped to "some sheets" lists every changed sheet's Independent rows before / after; rule text and code held together by a unit test (ROUTE_ITEMS as a floor); ws-backtest in the background with the maximum timeout; the critic graded PNGs without a browser while P1b held it (parallel, no wait).

### P1b (08:20-11:15 UTC)
Automatic checks: a source-level unit + backtest for every dealer flag (pageFresh, reserve, pageCap, repeatKey, chartKeys); the 25-seed sweep as a deploy gate (R4, R5 only showed past seed 4242); a unit check that a dealer never reads a page constant once and reuses it for every try; a lesson sheet ≥ 1 Independent row + Score at L and S; a routed question ≥ 2 items.
Speed-ups: a small build harness (one build, page hashes, console capture) found R1, R2, N1 in minutes each (move to tests/lib); page-by-page hashing against a known-good older tree proved R2 restored; chain long browser gates in one background job; per-page CSS inline (shared LESSON_CSS edits change every page's hash).
For lf-checks: ws-detailed-lesson protocolTimeout 0 + polling; LP-FAMILY-REPEAT vs factKeyOf on turned arrays (3a ruling); precritic --lesson builds the compiled description (req.description).

### P1c (11:14-14:30 UTC)
Automatic checks: `ws-lesson-hash --sheets` (built, backtest lesson-sheet-indep); routing-page overflow on precritic's path; a pool-capacity check per detailed lesson (facts available vs facts the pack needs under LR-5 / LR-6 - would have flagged lesson 2 and 3a before any deal); E35 text-node normalisation (lf-checks); a backtest's pass commit re-checked when its test group grows.
Speed-ups: lf-checks `--lp` / `--sweep` with MQ_ROOT on any tree gives a 1-5 min proof per live fix; ws-backtest with MQ_BACKTEST_TMP on a large disk, or prune /tmp/mq-backtest-* first (3.7 GB of stale worktrees filled the disk); ws-lesson-samples `--copy` deletes the committed S/ folders (fix it, lf-checks).

## Cost
- 08:20 UTC: session cost_usd $39.56 (≈ 2.0 % of the weekly limit at $20 ≈ 1 %).
- 11:00 UTC: session cost_usd $80.04 (≈ 4.0 %). Cap $470 (23.5 %).
- 19:50 UTC (3a live fix PASS, narrow critic r2 min 8; deploy list a0cca381 to the lead): session cost_usd $174.23 ≈ 8.7 %.
- 18:52 UTC (P1d live round, lead's $60 cap): session cost_usd $156.04 ≈ 7.8 % (round ≈ $24).
- 14:31 UTC (hand-over): session cost_usd $132.31 ≈ 6.6 % of the weekly limit ($20 ≈ 1 %), sub-agents included. P1 ≈ $85, P2 ≈ $25, coordination ≈ $20 (estimates from the running total).
