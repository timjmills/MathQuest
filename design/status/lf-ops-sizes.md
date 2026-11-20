
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
