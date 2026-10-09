# Critic R1: div_facts "How it is written" (`divForm`)

Independent critic (mq-opus-medium), 2026-10-09. Grades HEAD `e62ceec` (lane commits `af73e94`, `e62ceec`).
Read: RUBRIC.md, LESSONS_LEARNED.md, WORKSHEET_DESIGN_STANDARD.md §§10.7, 10.8, 12.1, stroke table, AK-2, TY-7;
PAGE_TYPES.md PT-FRW-5/6, PT-FPR-6; PEDAGOGY_STANDARD.md (division rows, P-1). I looked at about 75 of the 249 PNGs, covering
every form, every page type, S and L, keys and all three screen hosts. Measurements were taken with a pixel scan of the
96 dpi PNGs: answer-line widths, stroke widths, digit heights and empty bands.
I re-ran `node tests/scripts/ws-div-facts-forms.cjs`: **OK**. All forms build on all roles, share codes `_5NL/_5NF/_5NV/_5NM`
round-trip, every right answer scores on the worksheet and quiz, and there are no console errors.

## Verdict: **FAIL**

Minimum per criterion, over the graded versions: **C1 7 · C2 5 · C3 6 · C4 5.**

Scope note: under RUBRIC's 2026-09-26 rulings, Error analysis is outside the pass bar, and stand-alone Guided, True or
False and Reason It are not graded as separate pages. They are scored below because the brief asks for every page type,
but they are marked *(info)*. The FAIL does not depend on them: Independent, Test, Lesson, Fact rows, Fact probe and the
screen hosts all have scores below 8.

## Score table

Scores are C1 ease of use / C2 educational value / C3 spacing / C4 standard fidelity. "D#" refers to the defect list below.

| Version | Form | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|---|
| Independent S + key | Standard | 8 | 8 | **6** | 8 | D4 |
| Independent L + key | Standard | 8 | 8 | **6** | 8 | D4 |
| Independent S + key | Long division | 8 | 8 | 8 | **7** | D11, D13 |
| Independent L + key | Long division | 9 | 8 | 8 | 8 | D13 (minor) |
| Independent S + key | Fraction | 8 | 8 | 8 | **7** | D3, D11 |
| Independent L + key | Fraction | 8 | **7** | 8 | **7** | D1, D2, D3 |
| Independent S + key | Vertical | 9 | 8 | 8 | 8 | none |
| Independent L + key | Vertical | 9 | 8 | 8 | 8 | none |
| Independent S + key | Mix | 8 | 8 | 8 | **7** | D3, D11 |
| Independent L + key | Mix | 8 | **7** | **7** | **7** | D1, D2, D3, D14 |
| Test A S/L + key | Standard | 8 | 8 | **6** | 8 | D4 |
| Test A S/L + key | Long division | 9 | 8 | 8 | 8 | D13 (minor) |
| Test A S/L + key | Fraction | 8 | **7** | 8 | **7** | D1, D2, D3 |
| Test A S/L + key | Vertical | 9 | 8 | 8 | 8 | none |
| Test A S/L + key | Mix | 8 | **7** | 8 | **7** | D1, D2, D3 |
| Lesson packet (anchor, lesson, practice) S/L + keys | Standard | 8 | 8 | **6** | 8 | D4 (p3), D12 |
| Lesson packet S/L + keys | Long division | 8 | 8 | **6** | 8 | D8, D12 |
| Lesson packet S/L + keys | Fraction | 8 | 8 | **7** | **7** | D8, D3, D12 |
| Lesson packet S/L + keys | Vertical | 9 | 8 | 8 | 8 | D12 (minor) |
| Lesson packet S/L + keys | Mix | 8 | **6** | **7** | **7** | D7, D8, D3 |
| Fact rows S/L + key | Standard | 9 | 8 | 8 | 8 | none |
| Fact rows S/L + key | Vertical | 9 | 9 | 8 | 9 | none |
| Fact rows S/L + key | Long division | 8 | **5** | 8 | **5** | D5 |
| Fact rows S/L + key | Fraction | 8 | **6** | 8 | **6** | D5 |
| Fact rows S/L + key | Mix | 8 | **5** | 8 | **5** | D5 |
| Fact probe S/L + key | Standard | 9 | 8 | 8 | 8 | none |
| Fact probe S/L + key | Vertical | 9 | 8 | 8 | 8 | none |
| Fact probe S/L + key | Long division | 8 | 8 | **6** | 8 | D6 |
| Fact probe S/L + key | Fraction | 8 | **7** | 8 | **7** | D1, D3 |
| Fact probe S/L + key | Mix | 8 | **7** | **6** | **7** | D1, D3, D6 |
| Guided *(info)* | Standard / Vertical | 8 | 8 | 8 | 8 | D12 |
| Guided *(info)* | Long / Fraction | 8 | **7** | 8 | **7** | D12, D2, D3 |
| Guided *(info)* | Mix | 8 | **7** | **7** | **7** | D7, D14, D3 |
| Error analysis *(info, out of bar)* | all | 8 | 8 | 8 | **7** | D2 (grey written answers at 1/3 size in fraction/across cells) |
| True or False *(info)* | all | 8 | 8 | 8 | 8 | D2 on fraction key only |
| Reason It *(info)* | Standard / Long / Vertical | 8 | 8 | 8 | 8 | none |
| Reason It *(info)* | Fraction / Mix | **7** | 8 | 8 | **7** | D2 |
| Practice card 390 / 820 / 1280 | Standard, Fraction, Vertical, Mix | 9 | 8 | 8 | 8 | none |
| Practice card 390 / 820 / 1280 | Long division | 8 | **7** | 8 | **7** | D9 |
| Online worksheet 1280 | Standard, Fraction, Vertical | 9 | 8 | 8 | 8 | none |
| Online worksheet 1280 | Long division | 8 | **7** | **7** | **7** | D9, D10 |
| Online worksheet 1280 | Mix | 8 | **7** | **7** | **7** | D9, D10 |
| Quiz 1280 | Standard, Fraction, Vertical, Mix | 9 | 8 | 8 | 8 | none |
| Quiz 1280 | Long division | 8 | **7** | 8 | **7** | D9 |
| Stretch, Word problems | all | not rendered | | | | the fallback is judged below |

## Defects

**D1 · C2 −1 (major, L3 "answer given away") · Fraction form and Mix's across facts size the answer line from the item's own answer.**
- **Where:** `js/modules/gen-operations.js:7077` (`digits: String(Q).length`, Fraction) and `:7090` (the same in Mix's
  across cell). Standard uses `_bandDigits(...)`, which is why only these two forms leak.
- **Evidence:**
  - `fraction-L-independent-p1.png`: item b, 96/8 = 12, and item d, 110/11 = 10, have 64 px lines. Every one-digit answer
    on the page has a 53 px line.
  - The same split appears in `mix-L-independent-p1.png` b, `fraction-L-guided-key-p1.png` (121/11 and 84/7 at 64 px,
    27/3 at 53 px), `fraction-L-test-p1.png`, `mix-L-test-p1.png` g and `fraction-L-fact-probe-p1.png` (88/8, 72/6).
  - At S every line is the 53 px minimum, so the leak shows at L (and probably M).
- **Rule:** LESSONS L3 says slot widths come from the widest possible answer. RUBRIC C2 says nothing gives the answer away.
- **Fix:** use `_bandDigits('div_facts', '÷', range)`, or a fixed 2, for both payloads.
- **Check:** pixel-scan the answer lines on fraction-L and mix-L independent pages. Every line on a page must be the same width.

**D2 · C4 −1 (AK-2); C1 −1 on Reason It (text ≥ 11 pt) · Fraction-form and Mix-across answers are drawn at about a third of working size.**
- **Evidence:**
  - Key answers: `fraction-L-independent-key-p1.png` and `mix-L-independent-key-p1.png`. The digits are about 13 px tall,
    against about 40 px operands. The Standard key draws 28 pt bold where the pupil writes.
  - Grey trace "2" in the Guided model: `fraction-L-guided-p1.png`.
  - Given answers the pupil must compare: `fraction-S-reason-it-p1.png`. The digits measure 10 px (about 10.7 pt), below
    the 11 pt floor.
  - "Sam wrote" answers: `fraction-L-error-analysis-p1.png`. The bracket item on the same Mix page draws its claim large
    (`mix-L-error-analysis-p1.png` a vs b–d).
- **Fix:** in `sheet/cells/equation.js`, draw the result slot's answer, key value and trace of the fraction / `fact`
  equation at `ctx.metrics.digitPt` in Andika 700, as the `fact` template does.
- **Check:** the key digit height equals the operand digit height (within 10 %) on fraction-L/S and Mix keys.

**D3 · C4 −1 · The paper Fraction form puts "=" and the answer line on the denominator's baseline, and draws the bar at 0.75 pt.**
- **Evidence:**
  - `fraction-L-independent-p1.png` and every fraction cell on paper: "12 = ___" reads as a separate equation under the
    bar. The screen centres "=" on the bar (`fraction-L-card-390.png`, `fraction-L-worksheet-1280.png`), so paper and
    screen differ (L5).
  - The bar measures 1 px at 96 dpi, which is 0.75 pt. The style is `border-bottom:0.75pt` at `sheet/cells/equation.js:105`
    (screen twin: `screen-cell.js`, the `k.frac` branch). The stroke table makes fraction bars Heavy, 1.5 pt.
- **Fix:** give `.ws-eq[data-ws-notation=fraction]` `align-items:center`, so "=" and the slot sit on the bar's axis, and
  make the bar 1.5 pt.
- **Check:** the "=" vertical centre is within 1 mm of the bar's y on the paper PNG, and the bar is 2 px at 96 dpi.

**D4 · C3 → 6 (H13; L1 "Size S ignored") · Standard across facts sit in oversized cells, and S prints the L page.**
- **Evidence:**
  - `standard-L-independent-p1.png`: the cells are 213 px tall. The content ends at the answer line (y 303 in row 1), so
    the band below it is 89 px, 42 % of the cell.
  - `standard-S-independent-p1.png` is the same 12 items in the same 3 × 4 grid at the same 28 pt, with a 49 % empty band.
  - The same pattern shows on `standard-L-test-p1.png` and `standard-L-lesson-p3.png` (cells 250 px tall, band 43 %).
  - The other forms on the same role and size hold 15 (L) and 28–30 (S).
- **Fix:** pack across facts at their measured height (footprint class `short`, DN-1a: up to 20 short items at L and 30
  at S), or put the slot inline as fact rows do. S must hold more than L.
- **Check:** `ws-print-lint` L-DENSITY/H13 at S and L reports an empty band under 30 %, and the S count exceeds the L count.

**D5 · C2 → 5–6, C4 → 5–6 · The fact-rows fallback for Long division, Fraction and Mix is not acceptable.**
- **Evidence:** `long-L-fact-rows-p1.png`, `fraction-S-fact-rows-p1.png` and `mix-S-fact-rows-p1.png` print every fact
  across ("6 ÷ 2 = ___"). The teacher's choice is dropped silently: Mix's "one third each" becomes 0/33, and nothing on
  the page or in the Fits line says so.
- **Rule:** the comment in `fact-rows.js` claims "Long division and Fraction are NOT fact-row forms". The standard says
  otherwise: WS 12.1/12.3 and PT-FRW-5/6 define bracket division facts in fact rows ("8 for bracket division facts"; "the
  write zone is a thin answer box 12 wide × Hw, right-aligned over the dividend").
- **Why Fraction can fit too:** a Fraction fact is two lines tall, the same as a vertical fact, so it fits the vertical
  rows at the TY-22 ladder.
- **Fix:**
  - Draw Long division as PT-FRW-6 bracket rows, clamped to 8 columns (6 for a 3-digit dividend).
  - Draw Fraction in the vertical-row geometry.
  - Draw Mix as its three forms in separate sections, VA-65 style, or interleaved in one grid with uniform cells.
  - If any form genuinely cannot fit, show a visible dialog/Fits-line note ("Long division prints across on fact rows")
    rather than a silent substitution.
- **Check:** `ws-div-facts-forms.cjs` asserts the form on fact rows instead of the fallback.

**D6 · C3 → 6 · Long-division and Mix fact probes run onto two pages at L, and the S probe leaves 37 % of the page blank.**
- **Evidence:**
  - `long-L-fact-probe-p1/p2.png` and `mix-L-fact-probe-p1/p2.png`: a 20-fact timed probe is split over two sheets in
    2 columns. The cells are 93 mm wide with about 37–57 mm of content, leaving side bands of about 30 %.
  - `long-S-fact-probe-p1.png`: 20 facts fill y 175–706. The grid area from y 706 to 1040 is empty, about 37 %.
- **Rule:** PT-FPR-6 says the bracket probe is "the vertical grid at 5 columns". 12.1 says the probe is 20 at L on one
  page. RUBRIC C3 says no half-empty page.
- **Fix:**
  - At L, use the VA-66 track compression (0.95 → 0.80 em) and the probe's tight bracket gutter to get 3–4 columns on
    one page.
  - At S, stretch rows to G / rows (PG-14) instead of packing to the cell minimum.
  - For Mix, size the columns from the widest form actually dealt.
- **Check:** a probe for every form is 1 page at S/M/L, with the largest empty band under 20 % of the grid.

**D7 · C2 → 6 · Mix lessons model only one of the three forms.**
- **Evidence:**
  - `mix-L-lesson-p1.png`: the anchor chart is all Fraction. The p2 Guided cell is also Fraction.
  - `mix-L-lesson-p2.png` Independent b and d deal bracket division that is never modelled.
  - `mix-S-guided-p1.png` models only the bracket, while Fraction and Standard items follow with no model.
- **Rule:** PEDAGOGY P-1 (one new thing per step) and the "same fact in both notations; match, then copy" step
  (PEDAGOGY L-row 715).
- **Fix:** for a Mix lesson, the anchor shows the one fact in all three forms side by side (one band: "12 ÷ 3 = __ · 3)12 ·
  12 over 3, all say the same"), and Guided models each form once before the tries.
- **Check:** the Mix lesson p1 shows 3 forms, and every form in Independent appears in a model.

**D8 · C3 → 7 (L), 6 (long S) · Lesson pages for Long division and Fraction leave a third or more of the page blank.**
- **Evidence:**
  - `long-L-lesson-p2.png`: grid ends at y 748, so 33 % of the page is blank.
  - `fraction-L-lesson-p2.png`: grid ends at y 728, 35 % blank.
  - `long-L-lesson-p3.png` and `fraction-L-lesson-p3.png`: 6 items with about 34 % blank. The same form's Independent page
    holds 15.
  - `long-S-lesson-p2.png`: about 45 % blank.
- **Rule:** RUBRIC C3 says no half-empty page when more would fit.
- **Fix:** in `sheet/roles/lesson.js`, fill the lesson's Independent / Practice parts to the measured capacity for the
  form's cell height, as practice.js does, up to the 12.1 ceiling for one-symbol answers, or stretch the rows.
- **Check:** the page is filled to at least 80 % at S and L for every form.

**D9 · C2 −1, C4 −1 · On screen, the Long-division form keeps a second, across statement of the problem.**
- **Evidence:** `long-L-card-390.png` ("0 ÷ 12 = ?"), `long-L-card-1280.png`, `long-L-worksheet-1280.png` (every card),
  `long-L-quiz-1280.png` and `mix-L-worksheet-1280.png` items 1 and 6.
- **What is wrong:**
  - Paper and every other form say "Divide.", so the screen differs from paper (L5).
  - Within one Mix worksheet the prompts differ between cards.
  - The prompt does the bracket-reading step for the pupil ("Read the division" is step 1 of the lesson).
  - "= ?" is the legacy prompt style.
- **Fix:** for `divForm: 'long'`, set the question text / screen prompt to the instruction "Divide." (`gen-operations.js`
  long branch: set `q.text` to the instruction).
- **Check:** `ws-screen-slots` / a screenshot shows "Divide." above every bracket cell.

**D10 · C3 −1 · Bracket cells on the online worksheet are drawn at about 48 px digits, against 29 px for the other forms.**
- **Evidence:** in `long-L-worksheet-1280.png` and `mix-L-worksheet-1280.png`, the quotient boxes come within about
  10 px of the cell's top border, and "11)132" spans 85 % of the cell. In the Mix grid, digits of two sizes sit side by side.
- **Rule:** RUBRIC C3 screen: online worksheet digits are 29 px, with a consistent layout.
- **Fix:** have the division template read the worksheet host metrics (29 px), as the equation and fact cells do.
- **Check:** in a screenshot, digit cap heights match within 10 % across a Mix worksheet.

**D11 · C4 −1 · On S pages the label sequence restarts after z.**
- **Evidence:** `long-S-independent-p1.png` (… y, z, a, b, c, d), `fraction-S-independent-p1.png` (z, a, b) and
  `mix-S-independent-p1.png` (z, a). Two items are labelled "a." on one sheet, so the key's references are ambiguous.
- **Rule:** RUBRIC C4 requires one label sequence per sheet.
- **Fix:** continue with aa, bb, …, or switch to numbers when the count is over 26 (the label helper in `sheet/cell.js`).
- **Check:** every label is unique on 30-item pages.

**D12 · C2 −1 on Guided (info) and Lesson, minor · Steps and hints do not follow the item, and the multiplication hint disappears in the non-standard forms.**
- **Evidence:**
  - `long-L-guided-p1.png`: the Steps say "Read the division: 24 ÷ 6 … 6 × __ = 24" beside a Model of 12)24.
  - Inline expressions wrap mid-equation: "56 / ÷ 8." (`fraction-L-guided-p1.png`) and "10 / × __ = 120" (all anchor
    charts).
  - Standard Guided gives the think-box hint "8 × __ = 56", which is the strategy the "I Can divide using times facts"
    title names. Long and Fraction Guided replace it with "Read the division: 56 ÷ 8."
- **Rule:** LESSONS L6.
- **Fix:**
  - Derive the Steps from the Model item.
  - Wrap expressions with `white-space:nowrap`.
  - Keep the related-fact hint for every form, with "Read the division" as an extra first hint for bracket and fraction.

**D13 · C4 −1 (minor) · Quotient boxes on Independent and Test bracket cells.**
- **Evidence:** `long-L-independent-p1.png` and `long-L-test-p1.png` print one box per dividend track.
- **Rule:** VA-61 allows the digit grid in Model and Guided only. Elsewhere, the vinculum is the answer line. The boxes
  do not leak the answer's length, since there is one per track.
- **Also:** at S the boxes are about 4.5 mm wide for 6 mm writing height (`long-S-independent-p1.png`).
- **Fix:** drop the boxes on Independent and Test, or record an owner ruling that keeps them. At S, size the box width
  to at least Hw.

**D14 · C3 −1 · Mix pages at L use 2 columns and stop short.**
- **Evidence:**
  - `mix-L-independent-p1.png` holds 10 items in 2 columns, with uneven row heights (125 / 178 px). The band from y 856 to
    1040 is about 21 % of the grid, where another row of 2 fits.
  - Long and Fraction on their own fit 3 columns at L (15 items each).
  - `mix-S-guided-p1.png` uses 2 columns at S, with about 33 % empty bands on both sides of every cell (H13 by width).
- **Fix:** take Mix's columns from the widest form actually dealt (3 at L, 3–4 at S), with uniform rows.
- **Check:** Mix L Independent holds at least 12 items, and no cell has a ≥ 30 % side band.

## The builder's documented fallbacks

| Fallback | Verdict | Reason |
|---|---|---|
| Fact rows: Long / Fraction / Mix print as Standard across | **Not acceptable** | The owner spec says the form works on "every page type". The design standard already specifies bracket division facts in fact rows (PT-FRW-5/6, 12.1 "8 for bracket division"). The substitution is silent, and it breaks Mix's 1/3 promise. See D5. |
| Stretch & Word problems rewrite the item (no form) | **Acceptable** | Both roles replace the single fact with an open task or a story. No "a ÷ b" is left to notate, and the results table and story are form-neutral. Stretch is outside the graded pages (RUBRIC §8e). It should still be stated once in the print dialog when a non-Standard form is chosen. |
| True or False: the "finish the sentence" line is always across | **Acceptable** | The sentence frame is running text. Writing "84 ÷ 7 = ___" under a bracket or fraction claim ties the notation back to the ÷ sentence, which PEDAGOGY asks for ("the same fact in both notations"). Verified on `long-L-true-false-p1.png`, `fraction-L-true-false-key-p1.png` and `vertical-S-true-false-p1.png`. The fraction claim's small answer digits are D2. |

## What would raise each criterion to 10

- **C1:** fraction answers drawn at full working size (D2), and bracket boxes at least Hw wide at S (D13).
- **C2:**
  - no slot-width leak (D1);
  - every form honoured on fact rows (D5);
  - Mix lessons that model all three forms (D7);
  - step text derived from the model item, with the related-fact hint kept for every form (D12);
  - a screen prompt that matches paper (D9).
- **C3:**
  - Standard packed by measured height, with S denser than L (D4);
  - one-page probes and stretched rows (D6);
  - lesson parts filled to capacity (D8);
  - Mix at 3 columns (D14);
  - worksheet metrics for brackets (D10).
- **C4:**
  - fraction "=" on the bar axis with a 1.5 pt bar (D3);
  - key answers at working size (D2);
  - unique labels (D11);
  - the VA-61 grid rule (D13);
  - the paper prompt on screen (D9).
