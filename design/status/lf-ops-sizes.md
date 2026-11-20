
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
