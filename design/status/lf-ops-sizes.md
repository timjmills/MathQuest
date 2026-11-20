
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
