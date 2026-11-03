# Lane D restart: independent critic, round 1 (fact family)

Critic: independent (did not build any of it), Opus 5.5 medium. Branch `claude/sweet-newton-c8wrv1-laneD-restart` @ 31a856fd.
Date 2026-10-31. Skills: `addition:add_facts`, `subtraction:sub_facts`, `multiplication:mult_facts`, `division:div_facts`.
Spec card `design/cards/facts/facts.md` is UNSIGNED. Its recommended answers to open questions 1-5 were applied as provisional
owner answers. Error analysis is not scored (RUBRIC scope note, 2026-09-26). Every other role the card offers is scored.

## Verdict

| Skill | Verdict | Why (lowest scores) |
|---|---|---|
| addition:add_facts | **FAIL** | Lesson (warm-up overflows, a regression from main) 6; Scripted model 6; Pre-skill check 5; Review M 6 (H13); Reason it CL40 7; Mixed practice S 7; across notation CL40 7 |
| subtraction:sub_facts | **FAIL** | Lesson 6 (steps for another problem, guided cells overflow, WRAP); Scripted model 6 (AK-2); Pre-skill check 5; Reason it 7; Mixed 7; across 7 |
| multiplication:mult_facts | **FAIL** | Scripted model 6; Lesson 7 (steps for another problem); Pre-skill check 5; Reason it 7; Mixed 7; across L CL40 7 |
| division:div_facts | **FAIL** | **Bracket fact rows 6 (arc runs into the dividend's first digit at every column count: "4)8" reads as "48")**; Mix 6; supports think / boxsign 3-4; Scripted model 6; Pre-skill check 5; Lesson 7; Reason it 7; Mix online worksheet 7 |

**What passes, measured.** The owner ruling's core is met for three of the four ÷ notations: ÷ facts print 10 columns at Size S Auto
and whenever 10 is picked, in the stacked ÷ sign (Standard and Vertical) and the fraction, digits never below 16 pt, over 3 seeds x
S / M / L x Auto / 5 / 6 / 8 / 10 (`r1/fact-rows-sweep.txt`). Pixel measurement at 600 dpi: the bracket at S, 10 columns clears its
cell by 1.35 mm left / 1.06 mm right (the ≥ 1 mm real-fit rule holds). The + − × fact rows are unchanged (10 / 10 / 8 columns,
70 / 70 / 56 facts at S, same grid as the before PNGs, 1.68 mm clear each side at 10 columns). sub_facts now prints on the kit fact
cell everywhere I looked (Independent, More practice, Test, Fact rows, Probe, Mixed), with no H13 at S. The screen hosts draw each
item's own form (standard, fraction, bracket) in the paper cell with the input where the pupil writes on paper.

**What fails.** One new defect in the ruling's own drawing (R1-1, the compact bracket), one regression from the port (R1-6,
add_facts lesson), and a set of shared defects that are pre-existing on main but are on these skills' pages and therefore count
(scripted model, pre-skill check, reason it, ÷ supports, mixed-practice capacity, lessons' steps).

## Known reds from `design/status/laned-restart.md`: confirmed or refuted from the pages

| Builder's known red | Result |
|---|---|
| sub_facts Scripted model AK-2 + H13 | **Confirmed**, and it is on all four skills (add_facts also spills onto a second page): R1-3 |
| Reason it CL40-INK | **Confirmed** on all four at S, M and L (A / B tab ink in the 5-7 mm keep-out): R1-9 |
| add_facts Review M H13 | **Confirmed** (6 cells, 30 % band, Mixed Review rows at M); S and L lint clean: R1-10 |
| div_facts boxsign / think supports overflow | **Confirmed and worse than stated**: think at S pushes the last row 10.8 mm off the page and splits cells 28-30 across sheets (PG-12 / PG-21 critical); boxsign overflows every one of 30 cells by 5 mm. Main is as bad (60 / 64 findings): R1-4 |
| across notation in 4 columns, mult_facts L CL40-INK | **Confirmed**, and wider: CL40-INK on add_facts / sub_facts / mult_facts Mixed practice at L, mult_facts Independent and Test at L, sub_facts / mult_facts Mixed at S (56 findings L, 18 S). S capacity 16 vs 25 not re-measured: R1-12 |

## Scores

C1 ease of use / C2 educational value / C3 spacing and layout / C4 standard fidelity. The worst size is shown, and the size is named
when only one size is below the others. Sizes S and L were graded in full and M spot-checked (every role was rendered at S, M and L,
pupil page and key). "=" means the same scores as add_facts.

| Page type | add_facts | sub_facts | mult_facts | div_facts |
|---|---|---|---|---|
| Fact rows Auto / 5 / 6 / 8 / 10 (stacked) | 9/9/9/9 | = | = (10 clamps to 8, PT-FRW-5) | Standard / Vertical 9/9/9/9; Fraction 8/8/8/8; **Long 6/8/8/7**; **Mix 6/8/7/7** |
| Independent | 9/9/8/9 | = | = | 9/9/8/9 (Long form 8/8/8/8) |
| More practice | 9/9/8/9 | = | = | = |
| Test | 9/9/8/9 | = | = | = |
| Fact probe | 8/9/8/8 | = | = | 8/9/8/8 |
| Mixed practice | 9/9/**7**/9 (S holds fewer than M) | 9/9/7/9 | 9/9/7/9 | 9/8/7/8 |
| Review | 9/8/**6** (M, H13)/9 | 9/8/8/9 | 9/8/8/9 | 8/**7**/8/**7** (L CL40-INK; 4 identical count-by-12 strips) |
| Opener | **7**/8/8/9 (says "Use the dots", shows none) | 8/8/8/9 | 8/8/8/9 | 8/8/8/9 |
| Scripted model | **7/6/6/6** | 7/6/6/6 | 7/6/6/6 | 7/6/6/6 |
| Guided | 8/8/**7**/9 | 8/8/7/9 | 8/8/7/9 | 8/8/7/9 (Long form S: H13 x14, 6) |
| Lesson packet | **6**/8/**6**/8 | **6/6/6/7** | **7/7**/7/8 | **7/7**/8/8 |
| Pre-skill check | 8/**6/5**/8 | 8/6/5/8 | 8/6/5/8 | 8/6/5/8 |
| Word problems | 8/8/8/9 | = | = | = |
| True or False? | 8/8/8/9 | = | = | = |
| Reason It | 8/8/8/**7** | 8/8/8/7 | 8/8/8/7 | 8/8/8/7 |
| Stretch | 8/8/8/9 | = | = | = |
| Supports (think, boxsign) | - | - | - | **4**/7/**3**/6 |
| Notation across (option) | 8/8/8/**7** (L) | 8/8/8/7 | 8/8/8/7 | n/a |
| Answer keys (all roles) | correct everywhere I checked except Scripted model (blank, R1-3) | = | = | = (fact rows S: 70 / 70 correct) |
| Practice card 390 / 820 / 1280 | 9/9/9/9 | = | = | 9/9/9/9 every form |
| Online worksheet 1280 | 9/9/8/9 | = | = | 9/9/8/9; **Mix 8/8/7/8** |
| Quiz 1280 | 9/9/9/9 | = | = | 9/9/9/9 |
| Error analysis | not scored (RUBRIC scope) | | | |

## Defects

### R1-1 (div_facts, NEW drawing, blocks the ruling) The compact bracket's arc runs into the dividend's first digit
- **Where:** div_facts, divForm long and mix, fact rows, every column count 5 / 6 / 8 / 10, S / M / L, every seed (11, 4242, 90001).
  The pupil page and the key are both affected.
- **What:** the arc bows through the left side of the dividend's first digit instead of into its side bearing: "3)6", "4)8", "7)84",
  "6)36", "4)44", "7)42", "3)33" show the arc stroke on the digit. At print size a one-digit dividend reads as a two-digit number:
  "4)8" reads as "48" and "3)0" as "30". It also happens at 5 columns (L, 37 mm cells), where there is room for the normal gutter.
  The digit tracks themselves (0.54 em, about 0.17 mm between two wide digits) stay legible at 100 %. The arc is the failure, and the
  answer to open question 3 is: not acceptable as drawn. The before page (main, clamped) had a clear gutter.
- **Evidence:** `r1/R1-1-bracket-arc-on-digit-S-c10.png` (600 dpi crop, S, 10 columns, seed 11);
  `r1/R1-2-div_facts-mix-S-c10-last-row-widened.png` (cells 6, 8, 18, 44: "4)8", "4)0", "6)0", "2)6"); compare
  `design/status/laned-restart/before-div_facts-long.png`.
- **Rule:** VA-60a / PT-FRW-9 ("bows into the dividend's first digit's side bearing": the side bearing, not the ink); H2 / C1
  (information must not be overlapped); VA-60 (bracket shape).
- **Fix:** leave at least 0.3 mm of white between the arc's outermost point and the dividend's first glyph ink. Measure the ink with
  the glyph's real left bearing (Andika "4", "3", "6" and "8" have almost none), not the track edge. Use the gutter the column can
  afford: 0.45 em whenever it fits (5 / 6 / 8 columns, and 10 columns for 1- and 2-digit dividends), and narrow it only for 3-digit
  dividends at 10 columns. If 12)144 cannot keep 0.3 mm clear at 10 columns, take the 8-column clamp for a 12 x 12 band (the
  alternative in open question 3).
- **Would have caught it:** none of the existing gates. CL40-INK / OVERFLOW / ws-slot-clip test only the cell edges, and
  ws-layout-unit tests widths. **New check `L-OVERLAP ARC-INK`** (ws-print-lint, kit): for every `long-division` cell, take the
  arc path's bounding box and the first dividend glyph's ink box (Range rects narrowed by `measureText().actualBoundingBoxLeft`), or
  rasterise the cell and require the arc and the digit to be separate connected components. Fail when the gap is under 0.3 mm. Add
  it to ws-precritic for division skills and backtest it on 31a856fd (fails) and on main 9d6f07b8 (passes).

### R1-2 (div_facts) Mix fact rows: the 9-cell last row is widened, so the grid is uneven
- **Where:** div_facts divForm mix, fact rows S and M Auto / 10 (69 facts = 6 x 10 + 9).
- **What:** the last row has 9 cells spread across the 10-column width, so its cells are 20.7 mm wide against 18.6 mm above.
  Together with three notations of different vertical anchors (bracket centred, fraction and ÷ top) and different digit tracking
  (0.54 em bracket against 0.72 em stack), the page reads as busy. That last part is accepted by the provisional answer to open
  question 2; the uneven last row is not.
- **Evidence:** `r1/R1-2-div_facts-mix-S-c10-last-row-widened.png` (bottom row).
- **Rule:** RUBRIC C3 ("cells are equal in size across a section, arranged in a regular grid"); PT-FRW-3.
- **Fix:** keep the 10-column lattice and leave the 70th position as the unruled trailing area (PT-ENG-7), or deal 70 by letting one
  form have 24.
- **Would have caught it:** **new ws-print-lint `L-DENSITY GRID-EVEN`**: the cells of one section share one width (±0.2 mm) except a
  declared full-width span. ws-layout-unit could assert the same for `fact-rows` with Mix.

### R1-3 (all four, pre-existing on main) Scripted model: blank key, identical panels, wasted space
- **Where:** scripted-model, S / M / L, all four skills. add_facts runs over 2 pages, and its page 2 is about 45 % used.
- **What:** the key pages carry no answers in 2-6 of 3-8 slots (L-KEY AK-2 critical, all four at S / M / L). The key also has no
  "Answer Key" header, so it cannot be told apart from the pupil page. 4-5 panels repeat the same unchanged fact while the steps
  describe a strategy ("Make 10: 8 + 2 = 10", "Think addition: 5 + ? = 7", "7 x 8 = 56") that the drawing never shows. The cells
  are 34 % empty bands (H13 x6-8).
- **Evidence:** `r1/R1-3-sub_facts-scripted-model-S-key.png`; `r1/print-lint-kit-{S,M,L}-fails.txt`.
- **Rule:** AK-1 / AK-2 (H1 caps C2 at 3 if read strictly as a missing key; scored 6 because the only answer is the traced one), H13,
  P-1 (each panel shows the step), L6.
- **Fix:** each panel draws its step (make-ten split, think-addition frame, skip-count hops), the last panel traces the answer, and
  the key header says "Answer Key". Size panels to their content so a model fits one page.
- **Would have caught it:** **existing** ws-print-lint L-KEY + L-DENSITY (red in precritic). Process rule: a role that is red in
  precritic is not sent to the critic (rule 0b). Add the "key header says Answer Key" check to L-KEY.

### R1-4 (div_facts, pre-existing, worse than the builder reported) ÷ supports think / boxsign break the page
- **Where:** div_facts Independent, S and L, `support=think` or `boxsign`, cover whole or fade.
- **What:** think at S puts the last row (28-30) past the footer: page content is 10.8 mm too tall, the cells are split across
  sheets, and the think box's "= 108" runs out of its rounded box. boxsign: every cell overflows by 5 mm, the "divide" captions hide
  under the next row's cells, and the grid's bottom rule is missing. Both supports together with cover fade: the content is
  133 mm too tall and the labels print white on white.
- **Evidence:** `r1/R1-4a-div_facts-support-think-S-independent.png`, `r1/R1-4b-div_facts-support-boxsign-S-independent.png`.
  ws-print-lint: think S 14 findings (PG-12 / PG-21 critical); boxsign S 60 (PG-12 x60); main: 60 / 64.
- **Rule:** H5 (split cell, C3 ≤ 5), H2 (cut off, C1 ≤ 4), PG-12, PG-21.
- **Fix:** measure the support into the cell's footprint before layout (the measuring cell must carry the support), or drop a
  column when the support is on.
- **Would have caught it:** **existing** ws-options-verify --render and ws-slot-clip (red in precritic) and
  ws-print-lint --supports. The builder's table understated it ("overflow 2.6-5 mm"). Add `--supports all --size S` for every
  fact skill to ws-precritic's per-skill plan, so the page-level PG-12 / PG-21 is in the table, not only the cell clip.

### R1-5 (sub_facts NEW, also mult_facts / div_facts) Lesson: the steps belong to a different problem; guided cells overflow
- **Where:** lesson packet S / M / L. The sub_facts anchor is "19 − 10" ("Take away 10 first: 19 − 10 = 9" repeats step 1 and
  wraps the expression). Its guided practice is 10 − 8, 11 − 5, 6 − 2, but the Steps box beside it still says "19 − 10: take away
  10 ... Write 9." The practice page's step strip says the same above 16 unrelated facts. mult_facts: "11 x 11 is 11 groups of 11 ...
  Write 121" beside 12 x 11, 10 x 3, 4 x 6. div_facts: "Read the division: 110 ÷ 11" beside 120 ÷ 10 and 132 ÷ 12.
- **What else (sub_facts, new with the kit cell):** the guided cells put the fact and the dot cue in 41 mm cells. The "−" sits
  under 1 mm from the left rule, and the cue box nearly touches the next cell's "−". The lower half of the page is empty.
- **Evidence:** `r1/R1-5-sub_facts-lesson-S-p2-guided.png`. ws-print-lint L-WRAP WRAP-OP x4 (S), x2 (L) on sub_facts lesson.
  On main the steps mismatch too, but the guided cells were bare (`r-main` render).
- **Rule:** L6 (instructions and steps follow the item), PEDAGOGY P-1, CL-40 / CL-1 (ink inside its cell), TY rules (no break after
  an operator).
- **Fix:** take the guided and practice step strips from the generic strategy steps (as add_facts does: "Start with the bigger
  number / Count on / Write the sum"), or rebuild them for each item. Pick an anchor that shows the strategy, not the subtract-10 edge
  case. Size guided cells with the cue in the measure.
- **Would have caught it:** WRAP is **existing** (it fired). **New L6 check `L-STEPS-ITEM`**: every number written in a Steps panel
  must occur in the problem it sits beside (anchor, guided cell or page), or the steps must be generic (contain no numerals).
  Backtest it on this commit.

### R1-6 (add_facts, REGRESSION from the port) Lesson page 2: the warm-up overflows and hides the Guided Practice heading
- **Where:** add_facts lesson packet page 2, S (seen at M and L as well).
- **What:** the warm-up block grows past its box. Item 2 has no cell rule, item 4 of the warm-up is gone (3 items instead of main's
  4), the outer frame's left rule stops short, and the warm-up's bottom edge covers the top half of the "Guided Practice: Add."
  strip, so that heading is clipped. On main 9d6f07b8 the same seed draws 4 boxed warm-up items and a clean strip.
- **Evidence:** `r1/R1-6-add_facts-lesson-S-p2-guided-strip-clipped.png` (branch) against `r1/R1-6-main-add_facts-lesson-S-p2.png`
  (main).
- **Rule:** H2 (heading clipped, C1 ≤ 4 for the heading; scored 6 because the task is still guessable), C3 (section overlap),
  PG-12.
- **Fix:** find the ported change in the lesson warm-up measure (likely the lane's batched `measureItems` cache keyed without the
  warm-up's quadrant context) and restore main's 2 x 2 warm-up.
- **Would have caught it:** ws-print-lint reported the lesson as **ok**, so this is a gap. **New L-OVERLAP SECTION**: no section's
  ink may enter the next section's strip box. Also **ws-grade-render --golden diff** on the lesson packets of every skill the port
  touched (here the lesson page hash changed with no intended change). Run ws-lessonfit on the fact family as well.

### R1-7 (all four, pre-existing) Mixed practice prints fewer facts at S than at M
- **Where:** mixed-practice (single fact skill): S 20 facts (4 x 5) at about L digit size, M 30 (6 x 5), L 20 (4 x 5). The engine's
  own fits line says 8 x 5 at S.
- **What:** Size S is ignored and inverted (L1). The S page wastes the room the size exists to use.
- **Evidence:** `r1/R1-7a-add_facts-mixed-S-20.png`, `r1/R1-7b-add_facts-mixed-M-30.png`; render meta: S n 20 fits 8x5.
- **Rule:** LESSONS_LEARNED L1, PT 5.2 unit table (Auto N 10 / 8 at S).
- **Fix:** let the shelf use the fits grid at S (8 or 10 units of 1 x 1 facts).
- **Would have caught it:** **new `ws-columns --sizes` assertion for mixed-practice**: items(S) ≥ items(M) ≥ items(L), and the
  rendered column count equals `fits.cols`.

### R1-8 (all four, pre-existing) Pre-skill check: 4 items of the skill itself on a page that is 80 % blank
- **Where:** pre-skill-check S / M / L, all four.
- **What:** one quadrant of 4 items from the target skill, not its prerequisites (PT-PRE-3), and the rest of the page is empty.
- **Evidence:** `r1/R1-8-div_facts-pre-skill-check-L.png`.
- **Rule:** H5 (page < 50 % used while the role expects 4 quadrants, C3 ≤ 5), PT-PRE-1..3, C2 (it does not check the
  prerequisites).
- **Fix:** fill the four quadrants from the skill's `pre` list (data/curriculum links), 4-5 items each.
- **Would have caught it:** ws-print-lint notes `role "pre-skill-check" has no ceiling in this gate`. **New PAGEFILL floor for
  pre-skill-check** (≥ 50 % of the body used, 4 quadrants), plus a provider check that the quadrants' skills differ from the page's
  own skill.

### R1-9 (all four, known) Reason It: A / B box ink in the label keep-out
- **Where:** reason-it S / M / L, all four (and div_facts fraction / mix forms).
- **What / evidence:** L-OVERLAP CL40-INK x4-6 per page, "ink of div.mq-abbox at 2 mm across, 4 mm down enters the 5 x 5 mm
  keep-out".
- **Rule:** CL-40. **Fix:** start the A / B boxes at label side + 2 mm. **Would have caught it:** existing ws-print-lint (red in
  precritic).

### R1-10 (add_facts, known) Review M: the Mixed Review row is sized for a taller item (H13 x6)
- **Rule:** H13 (C3 ≤ 6). **Would have caught it:** existing L-DENSITY. **Fix:** across items take their own row height (H13-ROW).

### R1-11 (div_facts, NOT in the builder's list) Review L: the count-by strip's polygon is in the keep-out; four identical strips
- **Where:** div_facts review L (all divForms). Cells 10-12 (the count-by-12 strips) put their start arrow polygon at 8 mm across,
  3.5 mm down, inside the 8.4 x 7 mm keep-out. At S the Mixed Review is 4 count-by-12 strips with near-identical blanks.
- **Rule:** CL-40; C2 (items vary sensibly). **Fix:** inset the strip; vary the counts (by 6, 8, 12 and so on), or draw from more
  than one earlier skill.
- **Would have caught it:** existing ws-print-lint at L (red). It was left out of the status file's known list. Process: the gate
  table must list every red document, not a summary.

### R1-12 (add / sub / mult, known) notation=across: CL40-INK at L, and at S on Mixed
- **Evidence:** ws-print-lint --opts notation across: L 56 findings (add Mixed x10, sub Mixed x14, mult Independent x8, Test x4,
  Mixed x20), S 18 (sub Mixed x14, mult Mixed x4).
- **Fix:** fewer across columns at L (the builder's own note). **Would have caught it:** existing ws-print-lint with --opts.

### R1-13 (all four) Guided: tall cells with more than 40 % empty below the fact
- **Where:** guided S / M. Example: sub_facts S, cell 69 mm tall, fact plus answer row ending 37 mm down, so a 32 mm band (46 %) is
  empty. div_facts divForm long S: H13 x14 and lesson SPREAD (ws-print-lint).
- **Rule:** H13. **Fix:** size the guided rows to the fact + cue + answer row (they are 3 x 3 at S and M, where 3 x 4 fits).
- **Would have caught it:** L-DENSITY catches the long form but passes the default guided page. **Extend H13 to guided cells
  that carry grey captions or cues** (the caption seems to count as content filling the band).

### R1-14 (add_facts) Opener: "Count on the smaller number. Use the dots." with no dots on the page
- **Evidence:** `r1/R1-14-add_facts-opener-S-dots.png`. **Rule:** L6. **Fix:** draw the dot cue on the model and the first guided
  item, or drop "Use the dots." **Would have caught it:** the new L-STEPS-ITEM check (R1-5) extended to cues ("dots" in a step needs
  a dot cue on the page).

### R1-15 (div_facts) Fraction form on Opener / Review / Reason It at L: numerator "110" in the keep-out
- **Evidence:** ws-print-lint --opts divForm fraction --size L: opener x2, review x8 ("110" at 6.6 mm across, 5.1 mm down in the
  7 x 7 mm keep-out), reason-it x4.
- **Rule:** CL-40, PT-FRW-9 ("the numerator clears the tab's keep-out"), which is not honoured off the fact-rows page.
- **Would have caught it:** existing ws-print-lint, but ws-precritic does not run the div forms on every role. **Add divForm x role x
  S / L to ws-precritic's per-skill plan** for div_facts (the card's own gate line lists only fact-rows).

### R1-16 (div_facts) Mix on the online worksheet: three digit sizes and uneven cards
- **Where:** online worksheet 1280, divForm mix.
- **What:** the bracket draws at about two thirds of the fraction and across digit size, the cards in one row differ in height
  (card 1 is taller), and the across item puts its answer line under the "=" instead of after it, unlike the Independent and
  Standard screen form.
- **Evidence:** `r1/R1-16-div_facts-mix-worksheet-1280.png`.
- **Rule:** C3 screen ("even cells, a consistent layout for every item of one skill"). **Fix:** one digit size per worksheet; keep
  the across slot inline.
- **Would have caught it:** **new ws-screen-slots check**: the digit font-size of every card in one worksheet is within ±10 %, and
  card heights in a row are equal.

### Observations (no score effect)
- The fact-rows / probe frame has no strand tab ("Level · strand · sheet id"), and neither did main's. PT 4.1's drawing shows one.
  This is worth a ruling, but it is not this lane's.
- The fact-rows capacity at S is 70 (+ − ×, 10 x 7), against PT 4.1's table of 90 (10 x 9). PT-FRW-9 now quotes 10 x 7, so the 4.1
  table is stale.
- div_facts Independent in the long form prints 1.0 em tracks at about 13-14 pt in 3 columns (61 mm cells). It is legible, but
  smaller than the across facts on the same skill.
- Open question 4 (long division as a preset skill) is not built yet. That is not scored.

## Automatic checks that would have caught each finding (summary)

| Defect | Existing gate that caught it (and why it reached the critic) | New check |
|---|---|---|
| R1-1 bracket arc on digit | none | **L-OVERLAP ARC-INK** (arc vs first dividend glyph ink ≥ 0.3 mm), division skills in ws-precritic, backtest 31a856fd / 9d6f07b8 |
| R1-2 Mix last row widened | none | **L-DENSITY GRID-EVEN** (one cell width per section) |
| R1-3 scripted model | ws-print-lint L-KEY / L-DENSITY (red, sent anyway) | key header "Answer Key" in L-KEY |
| R1-4 ÷ supports | ws-options-verify, ws-slot-clip (red; severity understated) | ws-precritic runs `--supports all --size S` per fact skill (page-level PG-12 / PG-21) |
| R1-5 lesson steps mismatch | L-WRAP (sub only) | **L-STEPS-ITEM** (numbers in Steps occur in the item beside them, or steps are generic) |
| R1-6 lesson warm-up overflow (regression) | none (lint "ok") | **L-OVERLAP SECTION** + `ws-grade-render --golden diff` on lesson packets after a port |
| R1-7 Mixed S < M | none | `ws-columns --sizes` on mixed-practice: items S ≥ M ≥ L and printed cols = fits.cols |
| R1-8 pre-skill check | none ("no ceiling") | PAGEFILL floor for pre-skill-check + prerequisite-skill check |
| R1-9 reason-it CL40 | ws-print-lint (red, sent anyway) | - |
| R1-10 review M H13 | ws-print-lint (red, sent anyway) | - |
| R1-11 div review L CL40 | ws-print-lint (red, missing from the known list) | gate table lists every red document |
| R1-12 across CL40 | ws-print-lint --opts (red) | - |
| R1-13 guided H13 | partly (long form only) | H13 counts grey captions / cues as hint, not content |
| R1-14 opener "Use the dots" | none | L-STEPS-ITEM extended to cue words |
| R1-15 fraction form keep-out off fact rows | ws-print-lint --opts divForm (not in precritic) | divForm x role in the precritic plan |
| R1-16 Mix worksheet | none | ws-screen-slots: one digit size per worksheet, equal card heights per row |

## Speed notes (for design/status/speed-audit.md)
- 9 of 16 findings were on red gates or on gates that exist but were not on precritic's path (`--opts divForm`, `--supports`).
  Rule 0b ("clean before critic") would have saved this round for those. Only R1-1, R1-2, R1-5 (L6), R1-6, R1-7, R1-8, R1-14 and
  R1-16 needed a critic's eyes.
- R1-1 is the one finding in the lane's own new drawing. A 600 dpi crop of one 10-column row shows it at once, and the before / after
  PNGs at 150 dpi hide it. Builders of a dense drawing should attach a 600 dpi crop of the hardest row.

## How it was graded
- `ws-grade-render --roles` (17 roles) x S / M / L x 4 skills, pupil and key, plus practice card 390 / 820 / 1280, online
  worksheet and quiz (scratch renders). div_facts again with divForm long / fraction / mix on fact rows, Independent and screens.
- Fact-rows sweep (`r1/frsweep.cjs.txt`): 8 skill / form variants x S / M / L x Auto / 5 / 6 / 8 / 10 x seeds 11 / 4242 / 90001
  (360 pages), counting items, columns and minimum digit size. Pixel clearance from 600 dpi rasters.
- `ws-print-lint --source kit` for the 4 skills x 16 roles x S / M / L (57 / 61 / 51 findings, the same as the builder's); div_facts x
  4 divForms x 14 roles x S / L; notation across S / L; supports think / boxsign. The same runs on main 9d6f07b8 (git archive) for
  the comparisons.
- Evidence PNGs: `design/audit/runs/laned-restart/r1/`.
