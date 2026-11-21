
## After the reset: resume list (lead 2026-11-20)
- The card was re-signed at 55f7c31d4.
- **Content decision CONFIRMED (lead 2026-11-20):** the 4-digit × 1-digit deal keeps (thousands digit × multiplier) ≤ 9, so the partial products stay 4-digit for the blank edge boxes. Record it in the card's decision log in the next round. That needs a --resign and the lead's signature.
- Then:
  - the 5 lessons, plus mult_2by2_standard's: add lessons/prereqs.js LESSONS entries (medium);
  - mult_3by2_standard Reason It L OVERFLOW;
  - area_model_4by1 word-problems / true-false L LONE-PAGE;
  - the full precritic (sharded / foreground);
  - the full critic, with mult_2by2_standard re-graded.
- The area-model host overflows (lesson / opener / Reason It) and the stack-cell error-analysis PUPILTAG are shared with live hosts; note them to the critic.

## 2026-11-20 resume (builder, Opus medium, cap $35)
- **Lessons (6):** multdiv.js routines `mult-column-1digit`, `mult-column-2digit`, `mult-area-1digit`, `mult-area-2digit`;
  lessons Y5.B5.S1 (mult_4by1_column), Y5.B5.S2 (area_model_2by2), Y5.B5.S3 (mult_2by2_standard), Y5.B5.S4
  (mult_3by2_standard), skill:multiplication:area_model_4by1, skill:multiplication:area_model_3by2. Warm-up = the size below
  (prereqsPending, casesPending until G4-Y5.B5 is carded). Pinned by name in lesson-baseline.json (full --check before: 0 of
  2738 pinned hashes differ).
- **multiplication:multiply provider (workedSteps only):** the column presets had NO worked steps of their own (the hint's
  sentences, no marks), so their lessons printed no anchor chart and an empty Steps zone. shortMultSteps (one step per place +
  the product, regroup marks) and longMultSteps (ones row, the placeholder 0, tens row, add); long-multiplication got a
  stepState; chart.js got lesson-data `chartMinZoom` (absent = 1, no chart moves). This changes the Model / Guided / Reason It
  steps of all 7 multiply presets: the critic grades them.
- **Card:** 2026-11-20 lead decision added to §5; `--resign` -> UNSIGNED (file sha256 53fa6a4a3b5219e490a59d3f852adec89c7634120712fa81d89f3cfa0f85e9ab, bodySha e1770a68975574a9).
- **Reds left (numbers for a lead ruling):**
  - mult_3by2_standard Reason It L OVERFLOW 4: the 52.8 mm grid in a 45.4 mm A/B panel (the response column takes ~78 mm at L:
    "The answer is" + the 6-box strip); 3.7 mm out of each panel, 0.7 mm out of the cell. Tried: count it as wider (UNDER layout)
    -> overflow gone but LONE-PAGE on mult_3by2 AND mult_2by2 L (1 a page, holds 2): reverted. Fix needs the response frame to
    wrap at L (reason-it.js answer frame) - an engine call.
  - area_model_4by1 word-problems L: item 119.1 mm, body 227 mm -> 1 a page (ceiling 3); plus OVERFLOW 7.6 mm left of the cell
    (area-model-total-row: the 4-part "__ + __ + __ + __" row is wider than the cell). true-false L: item 116.8 mm, body 210.2 mm
    -> 1 a page (ceiling 4). Measured capacity, not forced.
  - Area-model lesson charts print one panel a chart page (CELL-FITS chartFull; panel 130 mm, page 201 mm): 4 chart pages,
    each ~40 % blank. Shared with the area-model host overflow noted above.

## 2026-11-20 fix round (lead A9)
- A9 (1) Reason It L: long multiplication takes UNDER (reason-it.js workW); ruled 1 a page at L for mult_2by2/3by2 (capacity.json);
  M still 2 a page. **Next-week engine item: the Reason It answer frame wraps at L** (then the beside layout may return).
- A9 (2) area_model_4by1 word-problems L: the 4-part model stands under its story (word-problems.js mq-wpunder), 7.6 mm overflow
  gone; 1 a page ruled. A9 (3) true-false L 1 a page ruled. Card: A9 (1)-(3) added, --resign, UNSIGNED.
- Lesson print-lint: area_model_4by1 lesson clean at M; mult_4by1_column only L-TOPSTART x12 left (lesson Practice stack cells,
  6.2 mm below the top pad: stack.js needsRegroup reads p.a/p.b, the multiply payload has `operands`, so the cell is not marked
  write-above - not fixed: it moves the independent pages of every multiply preset; check: ws-print-lint L-TOPSTART).
- Area-model lesson charts: chartMinZoom also adds a panel row a chart page (2x2 / 3x2 charts 4 -> 3 pages); area_model_4by1's
  first panel (152 mm, the long "Split" words) still 4 pages.
- multiply provider now carries the x stories (EB-ROLE). Backtests sizes-a9-ri-under, sizes-a9-wp-amodel4,
  sizes-lesson-printlint, sizes-eb-role-stories: all PASS; ledger rows in CHECKS_FROM_CRITICS.md.
- MASTER bugs (next week, evidence: same gate on master 9ae9ccd5d):
  - options-verify: notation=across prints stacked on mult_2by2_standard; skipAfter=2/20 Skip off by one (also area_model_mult).
  - cell-checks: area-model host OVERFLOW on lesson / opener / reason-it (area_model_3by1 M/L), stack error-analysis PUPILTAG
    (mult_3by1_column M); area_model_mult word-problems L OVERFLOW.
  - empty-band: stack independent EB-BAND (mult_3by1_column M/L, 35 % bands), area-model reason-it bands.
- Not re-run this round (cap): slot-clip, role-cover (timed out last run, no finding seen), grade-render (its 12 were the chart
  overflow fixed here + the area lesson-L host overflow above), the sharded precritic.

## 2026-11-20 sharded precritic

lf-ops checker (Opus medium, run only, no product edits). Branch `claude/sweet-newton-c8wrv1-lf-ops-sizes` @ 744ec778a
(contains master) against master @ 2c42746aa. The six skills were run gate by gate, each shard in the foreground in under 9 min.
On master the five presets are run as their hosts with `--opts`: mult_4by1_column = multiply tiles 41,
mult_3by2_standard = multiply tiles 32, area_model_4by1 = area_model_mult tiles 41, area_model_2by2 / area_model_3by2 =
area_model_mult_hard tiles 22 / 23. mult_2by2_standard is the same id on both.
Classes: **new** = only on the branch; **new\*** = a role master never rendered, because master has no signed card for these
hosts and uses the default roles; **master** = the same on master (count b/m); **fixed** = red on master, green on the branch;
**ruled** = A9 capacity rulings. None of the A9 rulings showed up in these gates.
Logs: scratchpad `shards/{b,m}-<gate>-<idx>.txt` (idx 0-5 in the order above); `file:line` below points into them.

| gate | mult_4by1_column | mult_3by2_standard | area_model_4by1 | area_model_2by2 | area_model_3by2 | mult_2by2_standard |
|---|---|---|---|---|---|---|
| print-lint kit L | green / green | green / green | green / green | green / green | green / green | green / **fixed** (master H13 20) |
| print-lint kit M | green / green | green / green | green / green | green / green | green / green | green / **fixed** (master H13 12) |
| print-lint lesson L | **new** TOPSTART CL-4b 12 | **new** H13 2, TOPSTART 12, WRAP-OP 4, DN-2 2 | master PG-12 2/8; **new** TOPSTART 12, DN-2 2; fixed ILLEGIBLE 36 | master ILLEGIBLE 20/50, PG-12 8/10, PAGEFILL, LONE; **new** WRAP-OP 4, DN-2 2 | master PG-12 2/10, TOPSTART 4/4, WRAP 2/4; **new** PG-13 4, DN-2 2, LONE 2; fixed ILLEGIBLE 60 | **new** TOPSTART 12, BD-10 1, WRAP-OP 2, DN-2 4, LONE 1 (master 0; branch 12+6 pages vs master 4+2) |
| print-lint lesson M | master TOPSTART 12/32 | master TOPSTART 12/32; **new** H13 4, WRAP-OP 2 | green / **fixed** (master ILLEGIBLE 36, PG-12 8, TOPSTART 12) | master ILLEGIBLE 20/50, PG-12 8/10, TOPSTART 12/12; **new** WRAP-OP 4 | master TOPSTART 12/12; **new** PG-13 4, DN-2 2, LONE 2; fixed ILLEGIBLE 60, PG-12 10 | master TOPSTART 12/32; **new** WRAP-OP 2, DN-2 2 |
| empty-band | FAIL 141 / 109: master BAND indep L 45/12, test, review, lesson M; **new** BAND indep M 9, more-practice M 9, SIDE indep L 16, lesson L 2+2; **new\*** opener, scripted-model, stretch | FAIL 96 / 109: master BAND indep L, lesson M, review L, test M, guided L; **new** BAND indep M 6, more-practice M 6, SIDE indep L 16, lesson M 6, test M 4, EB-PAGE lesson L 1, **GDPCAP guided L 1**; **new\*** pre-skill-check, opener, scripted-model, stretch | FAIL 31 / 22: master indep L, guided M, reason-it EDGE, lesson PAGE; **new** BAND lesson L/M 2+2, EDGE lesson 1+1; **new\*** opener, scripted-model PAGE 5, pre-skill-check, stretch | FAIL 27 / 12: master guided, review M, reason-it, lesson PAGE M; **new** lesson PAGE L 2, BAND lesson M 2, SIDE lesson 1+1; **new\*** scripted-model, opener, pre-skill-check, stretch | FAIL 27 / 7: master guided L, reason-it, lesson PAGE M; **new** lesson EDGE L 1, PAGE L 2; **new\*** scripted-model, pre-skill-check, opener, word-problems, stretch | FAIL 125 / 93: master indep M, more-practice M, test, SIDE indep L 20/10, more-practice L; **new** BAND indep L 24, SIDE lesson L/M 6+6, EB-PAGE lesson M 1, **GDPCAP guided L 1**; **new\*** pre-skill-check, scripted-model, opener, stretch |
| cell-checks --card (master: no card, so `--roles` with the same 15 roles) | **new** PUPILTAG error-analysis M 8 | **new** OVERFLOW lesson L/M 2+2 (tiles=null variant) | master OVERFLOW lesson L, opener, reason-it L, PUPILTAG; **new** OVERFLOW reason-it M 4 | master OVERFLOW lesson, opener, PUPILTAG, LONE-PAGE true-false L; **new** LONE-PAGE reason-it L, word-problems L+M | master OVERFLOW lesson, opener, PUPILTAG; **new** LONE-PAGE reason-it L, true-false L, word-problems L+M; OVERFLOW word-problems L 2, reason-it L/M | **new** OVERFLOW lesson L/M 6+6 (variants tiles=41 and tiles=null; `--roles` run green) |
| grade-render --gate (lesson, test, independent at M, L) | green | green | FAIL 4 (lesson L p6) vs master 36: master | FAIL 4 vs master 42: master | FAIL 8 vs master 44: master | green |
| options-verify (pin: design/audit/baselines/options-verify.json) | **new** notation across x2 (not pinned; same class as the mult_2by2 pin); skipAfter 2/20 master | **new** notation across x2; skipAfter master | skipAfter master | skipAfter master | skipAfter master | notation pinned; skipAfter master |
| coverage-matrix | OK | OK | OK | OK | OK | OK / OK |
| sibling-compare | OK (9 at or below siblings) | FAIL: 13 unproven, no approved sibling on the branch template | FAIL: 19 unproven | FAIL: 14 unproven | FAIL: 19 unproven | FAIL: 14 unproven; master FAIL 20 counts above the stack siblings |
| slot-clip | OK | OK | OK | OK | OK | OK (master not run: branch green) |

Evidence for the **new** reds (scratchpad `shards/`):
- PUPILTAG mult_4by1_column error-analysis M: `b-cc-0.txt:112`. The "<Name> wrote:" label sits 1.8 mm from the work; PT-ERR-4 needs 2-4 mm.
- OVERFLOW lesson: mult_3by2_standard `b-cc-1.txt:113` and mult_2by2_standard `b-cc-5.txt:117`, both on lesson page 1 cell 3 (tiles=null) and cell 1 (tiles=41).
- OVERFLOW area_model_4by1 reason-it M: `b-cc-2.txt:132`. OVERFLOW area_model_3by2 word-problems L: `b-cc-4.txt:145`.
- LONE-PAGE: area_model_2by2 `b-cc-3.txt:133-134`; area_model_3by2 `b-cc-4.txt:136,143-144`. These are reason-it L, true-false L and word-problems M/L, outside the A9 rulings, which name area_model_4by1 and mult Reason It only.
- Lesson print-lint, mult_2by2_standard L: `b-lessL-5.txt:15` (BD-10). The branch lesson is 12+6 pages; master's is 4+2. mult_3by2 H13: `b-lessL-all.txt:75`.
- EB-GDPCAP guided L, 8 scored tries against the ceiling of 6: `b-eb-1.txt:97` and `b-eb-5.txt:97`.
- options-verify notation=across on the presets: `b-ov-0.txt:2` and `b-ov-1.txt:2`. The presets are not in the pin.
- sibling-compare "no approved siblings": `b-sib-1.txt:21`. tests/fixtures/precritic/siblings.json has no entry for the branch's multiplication templates.

Not run, with the reason:
- ws-role-cover: its estimate is about 63 min of slot time per skill (2 shards of 30+ min). That does not fit 9-minute foreground shards inside the $12 cap.
- grade-render on the other 12 roles, raster-fit, screen gates (screen-slots, screen-answer, chromebook-fit, phone-card, options-shots), guided-echo, two-step, the node unit gates and the rest of the plan: not run within the cap.
- master cell-checks `--card --card-opts`: master has no signed card for these hosts.

## 2026-11-20 fix round

lf-ops fixer (Opus medium, rebuild of the sharded-precritic reds). Branch head before: 15ce118c7. Each fix is check-first, with a
backtest row (tests/fixtures/precritic/backtests.json, FAIL on the old commit, OK on the fix) and a ledger row in
design/lessons-first/CHECKS_FROM_CRITICS.md.

| item | check | before → after | backtest row |
|---|---|---|---|
| 1 SAYLESS mult_break_apart | ws-hint-no-blank SAYLESS | FAIL → OK (mult_properties `screenHelp`: "<rows> times <cols> is ___."; a line with no number when a factor equals a part) | `sizes-sayless-break-apart` |
| 2 OVERFLOW lesson (mult_2by2 / mult_3by2) | ws-cell-checks --card --card-opts | 12 + 4 → 0 (220 pages). tiles=41 takes the 1-digit column routine (`byOption`, tailLast); tiles=null caps the chart at zoom 1.3 (chart.js `chartMaxZoom`; prereqs optionLesson reads a 'null' entry) | `sizes-lesson-overflow-tiles` |
| 2 why 12+6 pages | - | not a defect: the branch adds the authored lesson Y5.B5.S3 (routine mult-column-2digit: vocabulary, chart, Warm-up, Guided, Practice, Mixed); master printed the 2-page default lesson. print-lint lesson L/M counts are unchanged by this round | - |
| 3 EB-GDPCAP Guided L | ws-empty-band EB-GDPCAP + EB-BAND, guided L | GDPCAP 8 → 5 tries (both skills); guided BAND 4 + 1 → 0. guided.js keeps the §12.1 ceiling on multi-page sheets (no row past it); the long-multiplication footprint is `noStretch` | `sizes-guided-gdpcap` |
| 4 PUPILTAG mult_4by1_column EA M | ws-cell-checks PUPILTAG | 1.8 mm → in 2-4 mm (error-analysis tagLiftOf: a `*` stack lifts the label 0.5 mm) | `sizes-pupiltag-colmult` |
| 5a OVERFLOW area_model_3by2 Word problems L | ws-cell-checks OVERFLOW | FAIL 2 → 0 (a 2-row model of 3+ parts takes the UNDER layout at L) | `sizes-wp-amodel32-under` |
| 5b OVERFLOW area_model_4by1 Reason It M | ws-cell-checks OVERFLOW | NOT FIXED (below) | - |
| 6 options-verify notation=across | ws-options-pin --check (notation pairs) | unpinned → pinned on mult_4by1_column and mult_3by2_standard, reason "master bug class, logged" (`reasons` in the pin) | `sizes-ov-notation-pin` |
| A9b (a) LONE-PAGE L, ruled | ws-cell-checks LONE-PAGE | area_model_2by2 reason-it L / word-problems L, area_model_3by2 reason-it L / true-false L / word-problems L: FAIL → ruled (capacity.json, "4-part model under-layout; A9b") | (ruling) |
| A9b (b) Word problems M, two a page | ws-cell-checks LONE-PAGE | DEFERRED to next week (below) | - |

Not fixed, with the reason:
- **area_model_4by1 Reason It M** (OVERFLOW 4; area_model_2by2 / 3by2 Reason It M show the same class, 4 each). reason-it.js
  takes the BESIDE layout because an area-model footprint gives no true work width (`workW` 0). The 4-part model is 143 mm by
  its footprint at M (about 121 mm drawn), against a 62 mm half panel beside the response column, so A and B run over each
  other and out of the cell. Neither layout holds two a page: UNDER needs the model in half the cell (≤ 86 mm), and STACKED
  (A over B, the response beside it in a ~124 mm column) is 2 × 79 mm of model per item, so one a page at M, which is a
  LONE-PAGE that no ruling covers. Needs a lead ruling (one a page at M, or a smaller-panel A/B form) before a fix.
- **A9b (b) Word problems M** (area_model_2by2 / 3by2, one a page where the role holds 3). Measured by footprint at M: the
  2-row model is 86 × 91 mm (2by2) and 118 × 91 mm (3by2); the work space beside the answer column is about 117 mm wide. The
  3by2 model does not fit beside; under, the story band (~25 mm) + the model (91 mm) + its work lines + the answer row is
  more than half the ~230 mm body. Two a page needs a shorter model (drop the work lines at M) or the story beside the model.
  Not started within the cap; deferred to next week.
- area_model_2by2 true-false L LONE-PAGE: not in the A9b list (the ruling names 3by2 true-false L only).
- TITLE: the long-multiplication lesson printed for tiles=41 keeps the preset's title ("2-digit by 2-digit"); LESSON-OPT /
  TITLE are opt-in rules, so this is logged, not fixed.

Gate reruns (touched skills, one at a time; scratchpad `rerun/`):
- cell-checks `--card`: mult_4by1_column OK, mult_3by2_standard OK, mult_2by2_standard OK (and `--card --card-opts` 220 pages OK
  for the two long-multiplication presets). area_model_4by1 26 (OVERFLOW lesson L, opener, reason-it M/L; PUPILTAG: master
  class), area_model_2by2 22, area_model_3by2 31: master classes, reason-it M and Word problems M above. area_model_3by2
  LONE-PAGE 4 → 1.
- print-lint lesson L and M: the same per-skill counts as the shard (121 L / 110 M, the TOPSTART class left for next week).
- empty-band (`--hosts none`, so not like-for-like with the shard's run): 141→96, 96→63, 31→15, 27→15, 27→17, 125→92;
  EB-GDPCAP 0, EB-PAGE 0.
- ws-hint-no-blank (the six skills + mult_break_apart + mult_properties): OK. ws-roles-unit: OK (113).
- ws-backtest: the six new rows PASS one by one.

## 2026-11-20 critic r1: FAIL, parked at the budget stop
Report: design/audit/runs/lf-ops/critic-sizes-r1.md (146b9a4b8, graded on 87d658b44 with A9c applied).
One fix round did not fit the $1,618.37 stop (≈ $58 left against 15 findings, 7 critical), so the branch is parked. This is round 1 of 2.

**Next week, in this order.** Every item is check-first, as the critic proposed.
1. **F1:** scripted-model draws no step marks for stack, long-multiplication or area-model. Shared engine; also check the presets already on master (mult_2by1 / 3by1). Proposed check: the Model's states change step by step.
2. **F2 / F12:** area-model error-analysis and true-false wrong work is incoherent (the total is split on its comma). Proposed check: wrong work is coherent.
3. **F3 / F4:** `multiplication:multiply` has no wrongAnswer of its own, and 4by1 uses only "added instead of multiplied". Add misconceptions M-S1 to M-S5 per the card.
4. **F5:** area-model Reason It at L overprints and runs off the page. Rule: a capacity ruling never clears an overflow. area_model_4by1 reason-it L has no ruling.
5. **F6:** area_model_4by1 is clipped on screen (quiz at 820 / 1024 / 1280; card at 820). Proposed check: screen clipping.
6. **F8:** the area_model_2by2 / 3by2 lesson anchor chart overflows 22 mm at M and L.
7. **F7 / F11:** blank lesson and Model pages (a Practice spill, the area_model_3by2 8-page lesson).
8. **F9:** the pre-skill check must test the size below each preset.
9. **F10:** the tiles=null Model step text is garbled.
10. **F13–F15:** story sense, commas, host title.
11. **A9c item 1:** area-model Reason It + word-problems at M, 2 a page (measurements above).

**Carry-over (lead, 2026-11-20):** with the first next-week commit, add to design/audit/LESSONS_LEARNED.md "Process rules": "a precritic red on a page type master never drew (new*) is the branch's own red; it is never parked as master's". This is adopted after sizes r1 F1. The lead does the F1 master check, so this lane spends nothing on it.

**F1 master check (lead, 2026-11-20, master f8164ca5d).**
- F1 is not live on master. mult_2by1_column and mult_3by1_column print no Model page there. The empty step marks come from this branch's new multiply workedSteps / stepState.
- A related master defect is live: the lesson page for mult_2by1_column M (seed 506061) prints an EMPTY "Steps:" panel beside Guided Practice, and the bottom ~25 % of p1 is blank.

Next-week item 1 now covers both:
1. Step marks on every Model state.
2. A filled Steps panel on the lesson.
3. New check STEPS-PANEL-EMPTY: it FAILs when a lesson Steps panel draws no step text. Backtest it on master f8164ca5d (FAIL) and on the fix (OK).

## 2026-11-21 round 2 (fresh builder, Opus 5.5 medium: the rebuild after critic r1 FAIL, root-cause rule)

Step 0: merged origin/claude/sweet-newton-c8wrv1-lf-ops-steps (617a2e92a, then A28 c5436f798) and origin/master (575a6abe3,
ws-merge-master). ONE `multiplication:multiply` provider: the hotfix's column steps (`columnMultiply`, stack items) and strings
(`keyIsDefault`, practice.js), this branch's `longMultSteps` (long-multiplication grids), the stories, and A28 as
`lessonChart: (q) => false` only for a 2- or 3-digit-by-1 stack item (mult_2by1 / 3by1: no chart, as master); the size presets
keep the anchor chart they were graded with. Process rule 21 (new* precritic red is the branch's own) added to LESSONS_LEARNED.

| item | root cause | check (check-first: FAIL on c180eacc6, OK on the fix) | backtest row |
|---|---|---|---|
| F1 Model states blank | scripted-model.js drew state marks only for TRACE_TEMPLATES / `statePayload`; MODEL-STATE-MARKS judged only TRACE_TEMPLATES | ws-guided-echo MODEL-STATE-MARKS extended to every `stepState` template (stack digits read from ink marks) + MODEL-STATE-CHANGE: 32 → 0 (8 presets x M/L x 3 seeds). Fix: `stepStatesFor` + registry.renderCell `modelState` draw state k with the template's own stepState (the anchor chart's drawing); a stepState state is laid out at its measure (L OVERFLOW 28 → 0) | `sizes-r2-model-state-marks` |
| F2 / F12 incoherent area wrong work | areaWrong named mark ids (r0c1) the template does not draw, the page's commas grouped the total ("1,590" split 1 / 590), TF passed no slots | NEW ws-guided-echo EA-WORK-COHERENT: 29 → 0 (3 area presets, EA / TF / RI, M/L x 4 seeds). Fix: every `part-<k>` and `total` named, raw digits; area-model never splits a grouped total; TF draws a multi-box error's slots | `sizes-r2-ea-work-coherent` |
| F3 / F4 "factors added" | multiply had no wrongAnswer: default "added" | NEW ws-guided-echo EA-WRONG-KIND (never a + b; 4+ wrong works show 2+ kinds): FAIL → OK. Fix: multiplyWrong - placeholder-zero (M-S4), last-carry-dropped (M-S2), regroup-not-added, sum-no-regroup, zero-as-one (M-S5), rotated by item; long-multiplication draws the pupil's wrong rows (`row1` / `row2`) | `sizes-r2-ea-wrong-kind` |
| F5 Reason It L overprint | area-model has no true work width (workW 0) → BESIDE layout | ws-cell-checks OVERFLOW reason-it L (ruled pages included; Process rule 19): 12 → 0. Fix: FULL layout (A over B full width, the response under) for an area model wider than the panel beside the response; stacked copies drop the work lines (`noWork`) | `sizes-r2-ri-amodel-overflow-l` |
| F6 screen clip | the quiz paper held 720 px, the 820 card pane 703 px; the screen meta measured only targets | NEW ws-screen-slots SCREEN-CLIP (on with --screen-digit, so on precritic's screen-slots gate): 5 → 0; SCREEN-DIGIT still 0 misses. Fix (screen-cell.css, additive): the quiz paper widens to the card for an area model; the card's side padding narrows below 1024 px. Digits keep their floor | `sizes-r2-screen-clip` |
| F8 chart 22 mm into the footer | chart.js run-on branch chose a zoom < 1 (`chartMinZoom`) for a second panel row but kept rows H(1) tall | EXISTING ws-cell-checks OVERFLOW lesson (2by2 / 3by2 M page 1 "body overflows by 22 mm"): FAIL → OK. Fix: rowH and lastPer by H(z) | `sizes-r2-lesson-chart-overflow` |

**area_model_4by1 Reason It L, measured (no ruling added, as briefed):** FULL layout, work lines off: each A / B panel 150.1 x 52.3 mm
drawn (65.8 mm with its pad and tag), the response row 14 mm. One item = 2 x 65.8 + 3 + 14 ≈ 149 mm against L's 113.5 mm cell
for two a page, so it prints ONE a page: LONE-PAGE (unruled). Needs a lead ruling (one a page, like A9b) or a smaller A/B form.
Reason It M (4by1, 2by2, 3by2) moved from OVERFLOW (known open) to LONE-PAGE (one a page, legible); the M two-a-page item was
not started (brief).

**Not done (budget / brief):** F10 (tiles=null Model text: the non-sized deal still falls back to the default hint steps - the
hotfix returned [] there; this branch kept its fallback), F9 (pre-skill check below each preset), F7, F11, F13-F15, M two-a-page.
Lesson L remaining OVERFLOW: area_model_4by1 L p6 and area_model_3by2 L p5 (a Practice cell, 9.7-13.6 mm past it), and the
master classes print-lint lists (2by2 ILLEGIBLE 20 / PG-12 8 on p1, TOPSTART 12 on the long-multiplication lessons).

Gate reruns (round 2 head, the six skills, one browser gate at a time):

| gate | result |
|---|---|
| cell-checks --card | column presets (mult_4by1_column, mult_3by2_standard, mult_2by2_standard) OK. Area presets 54 findings in all (r1: 79): opener OVERFLOW and EA PUPILTAG (on master and on c180eacc6 too), lesson L OVERFLOW (4by1 p6, 3by2 p5: a Practice cell), LONE-PAGE Reason It M x3 / 4by1 L (no ruling), WP M x2 (A9c item 1, deferred). Scripted-model and Reason It L OVERFLOW 0 |
| print-lint lesson L / M | L 91 / M 74 findings: the r1 classes (TOPSTART 12 on each long-multiplication lesson, WRAP-OP, DN-2 / H13, 2by2 p1 ILLEGIBLE 20 + PG-12 8), plus area L Practice PG-12 2. mult_4by1_column L clean, area_model_4by1 M clean |
| ws-lesson-pages --skills (the six + mult_2by1 / 3by1, M / L) | OK (16 lessons, 174 pages; STEPS-PANEL-EMPTY and LESSON-ROLE-SET 0) |
| empty-band (--hosts none) | 165 (r1 rerun: 298). MOD-MARKS PASS. EB-BAND 56, EB-SIDE 84, EB-STRETCH 3, EB-CLIP 7, EB-EDGE 8, TAB-CLEAR 7. After the last fix, scripted-model + reason-it on the area presets + mult_4by1_column: EB-EDGE 0 and TAB-CLEAR 2 (mult_4by1_column reason-it L, 0.7 mm tab clearance, stack) |
| ws-backtest (six round-2 rows) | 6 PASS |
| ws-roles-unit | OK (115) |
| ws-boot-smoke | OK |
| ws-lesson-baseline --all-lessons | NOT RUN to the end: stopped at the lead's budget stop (expect every lesson page hash to move from the additive lesson-css rules; the area lessons from chartRowFit + N1) |

## 2026-11-21: narrow critic r2. Criticals closed, parked at round cap 2
Report: design/audit/runs/lf-ops/critic-sizes-r2-narrow.md (08ba25e01).
- F1, F2/F12, F3/F4, F5, F6 and F8 are all FIXED.
- The shared scripted-model change is safe toward master: the regression sample at M shows add_100_regroup, sub_100_regroup and long_div_2digit better, and nothing broken.
- The skills do not pass yet. Per rule 7 the branch parks; the next round is next week at medium, a fresh builder, check-first for each item.

**Next week, in order:**
1. **N1 (major):** the area-model Model and anchor chart never fill the partial-sum lines before "Add the parts". Check: MODEL-FINAL-COMPLETE.
2. **N5 (major):** the F8 fix moved the overflow into page count. The 4-step chart takes 3 pages, and p2/p3 are 40–45 % blank. Checks: empty-band on chart pages; at most 2 pages for a chart of 4 or fewer steps.
3. **N2 (major):** the comma in mult_4by1 error-analysis wrong work takes a digit column. Check: extend NO-GROUPED-SLOT to digit rows.
4. **area_model_4by1 Reason It L:** ruled one a page (A9d, 2026-11-21).
5. **F11:** the mult_4by1 Model takes about 60 mm plus half a page blank. area_model_4by1 takes 3 pages for 6 states.
6. **F9, F10, F7, F13–F15**, and lesson L p5/p6 Practice OVERFLOW.
7. **N4:** count area wrong kinds per page set. **N6:** the screen focus line splits the part box. **N3:** True or False keys leave True sentences blank (role-wide, route to lf-roles).
8. **A9c item 1:** area-model Reason It + word-problems at M, 2 a page.
9. **Lesson TOPSTART ×12** (stack write-above); mult_4by1 Reason It L TAB-CLEAR 0.7 mm.

## 2026-11-21 N-round (fresh builder, Opus 5.5 medium: the rebuild after critic r2, two rounds spent - check-first, root cause)

Base 5c2ae8707. Each check FAILs on 5c2ae8707 and passes on its fix (ws-backtest PASS), is on precritic's path
(ws-precritic-plan: the three rows OK) and has its ledger row in design/lessons-first/CHECKS_FROM_CRITICS.md.

| item | check (before → after) | root cause | fix | backtest row |
|---|---|---|---|---|
| N1 the add step never shown | NEW ws-guided-echo MODEL-FINAL-COMPLETE (every stepState template: the last Model state / last chart panel holds every number the answered drawing writes): 6 → 0 (area presets, Model + chart, M seed 1); 0 over M/L x 3 seeds | area-model render drew the work row `sv ? '' : ...` - empty in every step state, so only the total box was traced | area-model stepState: the state that writes the total writes `sum-<i>` (the parts on the work lines) in the total's ink (a4cadccb7) | `sizes-n-model-final-complete` |
| N5 chart 3 / 4 pages, run-on pages 36-51 % blank | NEW ws-empty-band EB-CHART (always on, lesson): CHART-PAGES (4 or fewer panels: at most 2 pages) + CHART-FILL (no chart page past the first 35 % or more empty): 18 → 0 | a full-width panel is head + drawing + words; two plus the Say / Rule bands never fit a page, so the run-on split 2 / 1 / 1 (4by1 1 / 1 / 1 / 1) | `chartRowFit` (lesson data, mult-area-1digit / -2digit): heads on top, the words beside the drawing at its own zoomed width (never under LR-15's 0.8), each panel its own height, fewest pages then largest zoom, packed evenly - 2 / 2 on every seed tried (40b32c086) | `sizes-n-chart-pages` |
| N2 comma takes a digit column | NEW ws-guided-echo COLUMN-NO-GROUP (no grouping mark in a stack / long-multiplication digit row, pupil and key): FAIL → OK | error-analysis writes a shown value like the page ("21,763") and the stack split the string into its tracks | the stack drops grouping marks from any shown value it writes into digit tracks (f72d9c029) | `sizes-n-column-no-group` |

**MODEL-FINAL-COMPLETE over the other stepState templates (140 skills, M seed 1; flagged, NOT fixed, not triaged):**
addition:add_100_regroup (stack, Model), addition:add_column_multi (stack, Model + chart), addition:add_facts, multiplication:mult_facts,
subtraction:sub_facts (fact, Model), division:div_facts (equation, Model), division:div_facts_long (division, Model),
number_sense:round_nl_thousands / _ten_thousands / _hundred_thousands, number_sense:rounding_visual (pv, chart), placevalue:compare
(pv, Model + chart), placevalue:mixed_placevalue (pv, chart). These now FAIL precritic's guided-echo gate for their own lanes.

**Hash proof (pupil + key, styles stripped, M seed 1, scripted-model / lesson / EA / TF / Reason It / independent, 146 skills,
5c2ae8707 vs head):** 24 changed, all from the two fixes: area_model_2by1 / 3by1 / mult / mult_hard Model + lesson (N1, the
add step's work lines) and the error-analysis page of 19 stack skills with 4+ digit answers (N2: add / sub 10k / 100k / 1m
presets, mixed_addition, mult_3by1_column - the same comma defect). Nothing else moved. The lesson CSS gained additive rules.

| gate (head, the six skills, one browser gate at a time) | result |
|---|---|
| cell-checks --card | FAIL 53 (r2: 54): the r2 classes only - opener OVERFLOW, EA PUPILTAG 20, LONE-PAGE 5 (A9c), lesson L OVERFLOW = the open Practice cell (4by1 / 3by2, now page 4). Column presets clean |
| ws-lesson-pages --skills (+ mult_2by1 / 3by1, M / L) | OK (16 lessons, 166 pages) |
| empty-band (--hosts none) | FAIL 160 (r2: 165): EB-CHART PASS, TAB-CLEAR 7 → 2; EB-BAND 56, EB-SIDE 84, EB-EDGE 8, EB-STRETCH 3, EB-CLIP 7 as r2. Area lesson + Model: the same 9 findings as 5c2ae8707 (pages shifted by the shorter chart) |
| ws-guided-echo --seeds 6 --variants | FAIL 66 = GUIDED-MODEL-ECHO on mult_4by1_column guided, identical on 5c2ae8707 (not this round's); MODEL-FINAL-COMPLETE / COLUMN-NO-GROUP 0 (base: 72 / 24) |
| ws-backtest (the three N rows) | 3 PASS |
| ws-precritic-plan | the three N rows OK; FAIL 1 = `sizes-area4-L-overflow` (2026-11-20 row, independent role not on --skill's plan), pre-existing |
| ws-roles-unit | OK (115) |
| ws-boot-smoke | OK |
| ws-lesson-baseline --all-lessons | NOT RUN to the end: stopped at the lead's budget stop (expect every lesson page hash to move from the additive lesson-css rules; the area lessons from chartRowFit + N1) |
