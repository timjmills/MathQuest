# Mock-up pack - reviewer notes (2026-09-19)

One independent reviewer per page group looked at every rendered page, recomputed the maths, fixed what was wrong and recorded what is left. Kept for the design-standard revision after the owner marks up the printed pack.

---

## Group 02 - `pages/02-fact-fluency.mjs`

I reviewed group 02 and found one real defect, which I fixed; the other six pages ship unchanged. The final full build prints `ok 02-fact-fluency: 8 pages` and wrote an 8-page PDF (page objects counted, the PDF itself not viewed). I looked at all 8 PNGs plus 4× zoom crops of the tile and ring, the horizontal facts, the think box and the scissors. The only file edited is `design\mockups\pages\02-fact-fluency.mjs`.

**Maths and rule checks**
- All 12 printed Intro answers are correct.
- The Warm-up's mixed rows hold exactly the 12 family facts, once each.
- The multiply and divide item lists each cover 1–10, with no identical facts next to each other across or down.
- Strips A and B each use 0–9 once.
- The family probe has exactly 40 facts from the three families; repeats are never adjacent and no sign runs more than three.
- No answer is printed on any probe, strip or Warm-up page.

## Verdicts

- **02-A, Multiply ×3, cue part 1 — fixed.** The side strip went from 12 mm to 16 mm to match B (see next item). Everything else meets the standard:
  - The tile is 6.13 mm (0.62 em) with a 0.75 pt outline.
  - The ring is 2.25 pt grey dots on fact 1 only.
  - The fact-plus-tile group is centred in its cell.
  - Digits are 28 pt in 49 mm rows.
  - The full strip spans the vertical block exactly.
- **02-B, same probe, cue part 3 — fixed.**
  - The write-in strip was 12 mm wide, about 11 mm clear inside. That is too narrow for an SpEd pupil to write "27" or "30" at 10 mm handwriting height, since the standard's 2-digit blank is about 17 mm.
  - It is now 16 mm wide with boxes 14.7 mm tall.
  - A uses the same 16 mm, so the grid is identical in both parts: every digit sits at the same x and y in the A and B renders.
  - Both page notes are updated.
- **02-C, Divide ÷3, think box on — ship, with a caveat.**
  - It matches PT-FPR-6 and PT-FPR-7: think box 40 × 14 mm (14 mm is the Hw + 4 minimum), grey 1 pt rounded outline, grey ×, row 32.3 mm against a 30 mm minimum.
  - "=" and the answer lines align down each column.
  - The strip ends on the rule under row 4.
  - Caveat: with the box above, the fact sits at the bottom of its cell and the answer line is about 3.9 mm above the cell rule. The top-half rule cannot hold with the think box on, and that comes from the standard's own pitch. I left it because nothing in the box can legally shrink.
- **02-D, think box off — ship.** Facts sit in the top half with about 47% of the cell free, and items and rows are identical to C.
- **02-E1, Intro — ship.** The bands are evenly spaced and the trio box is 1.5 pt, rounded. There is no Score and there are no labels.
- **02-E2, Warm-up — ship.** A 6 × 4 grid of rounded cards at 28 pt with no "=" and no blanks. This is bigger and roomier than the standard's 40 × 18 mm cards at 22 pt, which is right for only three families.
- **02-F, Family probe /40 — ship.** 8 × 5 at 18 pt with 4 mm tabs, well over 50% of each cell free, and the underlined "sign" in the instruction renders correctly.
- **02-G, Practice strips — ship.**
  - Two 90 mm strips with a 6 mm gap.
  - The only dashed element is the tagged cut line.
  - Answer boxes sit in one column.
  - Each strip has its own Name and Score /10.
  - The scissors glyph is plain but legible.

## For the owner

- **Dotted, not dashed.** The brief said a "dashed ring" on fact 1; the page prints a dotted grey ring. SF-32, LS-3 and the hard rule "dotted = model" all require dotted, because dashed means cut.
- **Write-in strip.** 02-B departs from PT-FPR-3 ("no write-in strip on a probe") because the brief asked for it. The strip is fully empty as briefed. A grey traced "3" in the first box would show SpEd pupils where to start; I did not add it.
- **Cue on a multiply probe.** The standards define the cue fade for addition and subtraction sets (count on from the bigger number). On ×3 it reads as "count by the bigger number once per dot". That works for 5 × 3 but is harder than the strip's count-by-3 for 7, 9 and 10 × 3. It was built as briefed.
- **Tile position in the horizontal block.** The tile sits under the smaller numeral, not to its right as SF-30 says. This keeps the digits in the same place between parts.
- **Family order.** 5, 4, 9 prints as (4, 5, 9), smaller part first, to match the other two families.
- **Think box.** If the think-box variant is kept, consider 6 rows (18 facts), or state in the standard that the top-half rule is waived when the box is on.
- **Footer page number.** "1/1" is not truly centred; it drifts between about x = 596 and 715 px across these pages. This is a kit issue on every sheet.

## Kit proposals worth adopting

- A footer laid out as `grid 1fr auto 1fr`, so the page number is truly centred.
- `sideStrip({ writeIn: true })` with a width rule: 16–17 mm whenever any part of a fade is write-in, applied to every part so the grid never moves.
- `fact()` options for a printed answer (ink or trace), a reserved cue slot and a dotted model ring, plus a `dotTile()` helper.
- `equation()` with a fixed-width right-aligned first operand, a `pt` override and a tight spacing preset. The default spacing cannot fit the 3-column division probe.
- `thinkBox()`, `cutLine({ scissors })`, `cards()` and `page({ header: false })` helpers.
- `instruction()` support for the underlined word in the `mixed-sign` string.

---

## Group 03 - `pages/03-drill-division-multiplication.mjs`

Group 03 is complete: all six requested pages are present and the full build prints `ok` and writes the PDF. Pages A, C, E and F were already good; I fixed defects on B, C and D. I edited only `design/mockups/pages/03-drill-division-multiplication.mjs`.

## Verdict per page

- **03-A · Equation drill, size M, 3 × 10: ship.**
  - The unknown appears in all ten forms, three times each and spread across every column, including `[ ] = 21 + 11` and `95 = 43 + [ ]`.
  - Left edges align, as PT-EQD-2 requires for mixed blank positions.
  - Every blank is a box, which is correct under SL-3 because some blanks fall mid-expression.
  - The equations sit in the top 60% of each cell and the instruction matches the library. All 30 equations are valid (the second number is at least 11 and every sum is at most 98).

- **03-B · Comparison drill, size L, 2 × 7: fixed.**
  - The title said "three-digit numbers", but 4 of the 14 items are 2-digit pairs and one is 2-digit against 3-digit.
  - The title is now "I Can compare numbers (to 999)", in the HD-10 form with a parenthesised constraint.
  - The instruction "Write <, > or = in the circle." is the exact library string (nine words), so I left it as it was.

- **03-C · Long division, Independent: fixed.**
  - Item a was 658 ÷ 4, the same problem that page D prints fully answered in grey trace. A pupil could copy it, so it is now 739 ÷ 4.
  - All four items have remainders: 184 R 3, 172 R 1, 42 R 3 and 149 R 3. 255 ÷ 6 has a 2-digit quotient, and the layout does not reveal that.
  - Correct as built: one 1.5 pt bracket path, the vinculum as the answer line, the R box in every cell, the "−" pre-printed, 0.75 pt rules under product rows only, and guides off.

- **03-D · Long division, Guided: fixed.**
  - Traced answer in a Guided cell:
    - P-LC-7 and the H1–H5 hint list rule this out, so the page now has two bands.
    - The Model band uses the instruction "Trace the answer. Say the steps." and holds the traced 658 ÷ 4, a blank 935 ÷ 4 with the same anatomy, and an oral frame at its foot (P-17).
    - The Guided Practice band keeps the step chips and holds 507 ÷ 4 with its first quotient digit in grey (hint H5) and 786 ÷ 4 with structural supports only.
    - The two rows of cells come out the same height.
    - I recomputed the traced working: 4, 25, 24, 18, 16, then 2, giving 164 R 2. It is correct, and the grey "1" on 507 ÷ 4 is correct.
  - The multiples strip used the kit's 1 pt outline with no dividers. RP-54 asks for a 1.5 pt outline and 0.75 pt dividers, which I added as a local override.
  - The chip signs (÷ × −) were too small to read, so I raised them from 1.15 em to 1.5 em.
  - The oral frame first wrapped and then overflowed the frame. It now stays on one line with 5 mm clear at the right.

- **03-E · Multiplication, size L, 2 × 2: ship.** The five tracks, the two 10 mm partial-product rows with "+" in the operator track, the second 1.5 pt rule and the open answer row match VA-50 and VA-51.

- **03-F · Multiplication, size M, 3 × 3: ship.**

## Remaining weaknesses

- **E, empty lower part of each cell:** at 2 × 2 size L the stack fills about 55% of a 113 mm cell. PG-14 sends spare height to the answer zone, so this follows the standard, but the page looks top-heavy. A 2 × 3 layout (six items) would fill it better if the owner prefers that.
- **D, guides and the quotient row:** VA-63 extends the alignment guides one row above the bracket. With the digit grid on, the grey quotient boxes do that job, and dotted lines in the 1 mm gaps between boxes looked cluttered, so the guides start just under the vinculum. This departs from the standard on purpose.
- **C, narrow tracks:** the I Can look uses 0.72 em tracks (7.1 mm) for unruled division working, which is tight for large handwriting. The guided page's 0.95 em tracks read far better. The owner may want 0.95 em for all bracket division.
- **D, what the page now is:** it is a Guided page with the worked-model option on, holding two Guided cells rather than four, so the traced-working demonstration could stay. The footer is still 2/3 and the on-screen page note says what changed.
- **D, side strip alignment:** RP-54 literally says the strip top-aligns with the grid. I top-aligned it with the band frame instead, 1.5 mm down.

## Kit proposals worth adopting

1. `sideStrip()`: a 1.5 pt outline, 0.75 pt dividers and a top-offset option (RP-54).
2. `division()`: the whole long-division cell as a kit helper, covering the bracket, quotient slots, R block, work rows with "−", the digit grid, the guides and the traced or first-digit model.
3. `stack({ partials: n })`: open or ruled partial-product rows with "+" in the operator track and the second rule.
4. `equation({ align: 'tracks' })` and `compare()`: left-anchored equations with fixed operand tracks and the comparison circle at a fixed x, plus a stand-alone box 2 mm taller than the writing height (Hw + 2).
5. `say([...])`: an oral-frame helper. Files 04, 06 and 03 each carry their own copy.
6. `chips([...])`: step chips for a band strip (PT-LDV-6).
7. `.ws-stack .op`: Andika's "×" is much smaller than "+" at the same size. About 1.25 em for "×" would even out the operator column. I left it as the kit draws it so the pack stays consistent.

Files are in `design\mockups`:
- `pages\03-drill-division-multiplication.mjs`
- `out\pdf\03-drill-division-multiplication.pdf`
- `out\png\03-drill-division-multiplication-p1.png` to `-p6.png`

---

## Group 04 - `pages/04-lesson-packet-level2.mjs`

Review of group 04: I fixed three things across the opener, the error analysis page and the lesson footers, and the other four pages ship unchanged. All edits are in `design\mockups\pages\04-lesson-packet-level2.mjs`; nothing else was touched. The full build prints `ok 04-lesson-packet-level2: 7 pages` and the PDF is rebuilt at `design\mockups\out\pdf\04-lesson-packet-level2.pdf`.

I recomputed every printed answer in the Model and error-analysis cells and found no maths errors. I also recounted the regroup / no-regroup splits on every page, and they match the builder's report. No problem repeats anywhere in the packet.

## Verdict per page

- **04-A Opener: fixed.**
  - The band order, traced Model (43 − 18 = 25, boxes 3 and 13), live 61 − 24, Steps and grey Guided scaffolds are all correct and unchanged.
  - The three Vocabulary cards were unevenly spaced, with the "ones" card floating mid-band. They now sit in three fixed columns (59 mm / 55 mm / the rest).
  - The footer now reads 1/3 (it was 1/4).
- **04-B Decide-only: ship.** Four of eight need regrouping. The instruction is the library string with "not" underlined, and the tick boxes line up with the two operand rows. Only the footer changed, to 2/3.
- **04-C Independent: ship.** It matches the 01-computation example cell. Only the footer changed, to 3/3.
- **04-D More Practice A: ship.** No change.
- **04-E Error analysis: fixed.**
  - Correct and wrong items alternated exactly, so the left column was all correct and the right column all wrong. The new order is correct, wrong, wrong, correct, wrong, correct, which no longer sorts by column.
  - The answer 45 was shown twice, wrong in one cell and correct in another, which would confuse a pupil. 70 − 25 became 80 − 36 = 44, and 45 − 19 became 65 − 19 so it no longer sits next to Independent b (45 − 18).
  - The final set:

    | Item | Problem | Shown | True answer | Verdict |
    |---|---|---|---|---|
    | a | 74 − 38 | 36 | 36 | correct |
    | b | 63 − 28 | 45 | 35 | wrong: smaller digit taken from the larger |
    | c | 91 − 46 | 55 | 45 | wrong: ones regrouped to 11, tens never reduced |
    | d | 86 − 43 | 43 | 43 | correct, no regrouping |
    | e | 65 − 19 | 54 | 46 | wrong: smaller digit taken from the larger |
    | f | 80 − 36 | 44 | 44 | correct, boxes 7 and 10 |

  - The tab id is now "Check it" (PT-FRM-9), and the footer reads 1/1 because the page is handed out alone (CL-12).
  - Previously the PDF numbering ran 1/4, 2/4, 3/4, 1/1, 4/4. The lesson is now 1/3, 2/3, 3/3, and every other page reads 1/1.
  - The page note was rewritten to match.
- **04-F Review: ship.** Six regroup and three no-regroup items, then three earlier-step items (25% of the page). The row heights are equal across the two bands.
- **04-G Test A: ship.** Open 4 × 4 with ten regroup and six no-regroup items. Supports are kept and there are no hints.

## Remaining weaknesses

1. **Decide page, lower cell half.** At 2 × 4 in size L the lower 45% of each cell is empty, and nothing is written there. The standard's own arithmetic gives 2 × 3 for the stacked decide cell at L. The builder went side-by-side to reach the brief's 2 × 4, which keeps the problem top-anchored like the rest of the packet. The alternative is 2 × 3 with the tick lines under the problem.
2. **Decide page, digit spacing.** This page uses the narrow 0.72 em track because it has no regroup boxes (TY-21), while every other page uses 0.95 em. The same kind of problem therefore looks tighter here. This follows the standard, but it may be worth a ruling that a lesson packet keeps one track width throughout.
3. **Error analysis item count.** Six items at size L exceeds the standard's ceiling of 2–4 (design standard 12.1, PT-ERR). It follows the brief, and it fits only because the response sits beside the work instead of beneath it. The fix-it slot is a 17 mm answer line, not an open rework zone of at least Hw + 4 (SF-63). Pupils would rework on the sample or in the spare 20 mm under it.
4. **Error analysis instruction.** It reads "Check the work. Tick Correct or Not correct. Fix the mistakes." This combines the library string `check-fix` with the judge labels the brief asked for. It is 11 words with valid verbs, but it is not a library string, so either a key needs adding or the page should use "Tick Correct or Fix it."
5. **Guided cells.** PT-OPN-6 asks for the first answer digit in trace grey. The brief did not ask for it, and a grey ones digit with no regroup marks would be odd for this skill, so I left it off. This needs a ruling.
6. **Model strip.** There is no `trace-say` instruction in the Model strip because it does not fit the 93 mm half-strip at 15 pt. This matches the PT-OPN diagram.
7. **Tab ids.** The Review tab reads "Review" as the brief says, while PT-FRM-9 says "Review n". The "Check it" tab on the error page is not among the four ids the brief lists (Lesson 4, Practice A, Review, Test A); I followed the standard there.

## Kit proposals

**The builder's six (all worth adopting):**
- `stack()` options for `fill`, `strike` and ink, and `grey` that also greys the T O heads.
- A split Model | Steps band.
- A size-aware `tickLine()` helper.
- A `sideBySide(work, response)` cell layout.
- Base-10 mini-diagram helpers.

**Mine:**
7. A `vocab(cards)` helper that lays the cards on fixed columns, so the cards never rely on `space-between`.
8. Derive the footer page count from the packet role (lesson pages count together, and handed-out-alone roles always read 1/1), so authors do not hand-number pages.
9. A lint for judge and decide pages that fails when the correct/wrong sequence alternates exactly or sorts by column.

---

## Group 05 - `pages/05-level-k-number-sense.mjs`

REVIEW OF GROUP 05: `05-level-k-number-sense.mjs`

All 8 pages the brief asked for are present: A, B, C, D, E as two sides, F and G. I fixed five of them and left three as they were. The final full build printed "ok" and wrote the PDF. I edited only `design/mockups/pages/05-level-k-number-sense.mjs`.

**Checks that passed on every page**
- The header, outlined tab, "Level" wording and footer (Grade + CCSS) follow the standard.
- The I Can look is right: 0.75 pt cells and quiet letters. Model and Guided cells are unlabelled.
- Score denominators are correct: /2, /8, /8, /6, none on the trace pages, /29 (25 blanks + 4), and /4.
- Every instruction matches the pedagogy library word for word: `trace-say`, `add`, `count-write`, `missing`, `compare`.
- No answer is printed in any Independent cell.
- I recomputed every printed or traced value:
  - Model 2 + 1 = 3, with counters drawn 2 solid and 1 hollow.
  - The Guided first addends 3 and 2 match their counters.
  - All six add-within-5 sums are 5 or less.
  - The ten-frame counts 6, 8, 5, 7, 9 and 4 match their equations.
  - The more-and-less model row for 36 is 26, 35, 37, 46, and all four answers for the 72 row are printed in the chart.
  - The 25 blanks are distinct and all 99 or below.
  - The compare numerals match the counter counts in all four rows.

**Per page**

- **05-A K one-page lesson: fixed.**
  - Counters were 7 mm. That is below even the size-S minimum; table 11.2 asks for 9 / 10 / 12 mm. They are now 12 mm at a 15 mm pitch (item + 3) with a 10 mm gap between the two addends.
  - I tightened the top margin and row gap to 6 mm so the content still sits in the top half with writing room below.
- **05-B Count and write, pictures: fixed.**
  - Each cell had its content squeezed into the top 33 mm of a 56 mm cell, leaving a dead band under all eight cells.
  - The picture field is now 36 mm tall (the L value in PAGE_TYPES 3.5), the row pitch went from 13 to 15 mm, and the answer square is centred on the same axis.
  - The fish was the smallest picture, about 4.3 mm tall next to 8.5 mm apples. I redrew it with a fuller body on the same 24-unit grid and gave it a slightly larger eye.
- **05-C Count and write, counters: fixed.**
  - Counters were 7 mm. They are now 9 mm on the same 11.6 mm grid, so B and C match position for position.
  - It has the same cell rebalance as B.
- **05-D Ten frames: ship.**
  - It meets RP-10 and RP-11: a 55 × 22 mm frame and 0.65-of-cell counters, with nothing drawn in the empty frame cells.
  - Spacing is good. I only added to the note that the "2/2" in the footer means the practice side of a two-page packet.
- **05-E1 and 05-E2 Trace numerals: fixed.**
  - At 8× zoom the corners of the stroke ends showed as small black specks around the start dots on 4 (both dots), 5 and 7. They appear in every trace cell and would print as dirt.
  - I moved those four dots so they sit over the end of the stroke, and widened the white ring around each dot from 16 to 24 units. The specks are gone on all ten digits.
  - I moved the "1" label on the 5 clear of its dot.
  - Stroke order and direction are correct for all ten numerals.
- **05-F Hundred chart: ship.**
  - It matches PT-CHT-1 and PT-CHT-2 and the 1–120 geometry: 15.2 mm rows, a 24 pt cap and a 40 mm band.
  - Remaining weakness: 101–120 at 24 pt have about 1.8 mm of side clearance in the 18.6 mm cells. That is what the spec gives, and it looks tight.
- **05-G Compare two groups: fixed.**
  - Counters went from 7 mm to 10 mm (pitch 13), and the group boxes are now 72 × 28 mm.
  - I set the top margin to 4 mm so the numerals and the 12 mm circle keep about 5 mm clear of the row rule.

**Weaknesses the owner should know about**
1. **The documents disagree on count-item size at L.**
   - Table 11.2 says 12 mm, but PAGE_TYPES 3.5 gives a 55 mm picture box, and a row of five 12 mm items at item + 3 pitch is 72 mm wide.
   - Pages B and C use 10 mm pictures and 9 mm counters, the largest that fit beside a 24 mm answer square. This needs a ruling; I noted it in a "Departures" comment at the top of the file.
2. **B and C use the brief's 2 × 4 layout with 56 mm cells.**
   - The standard's layout at L is 2 × 5 with 44 mm cells.
   - Content is centred slightly above the middle of each cell instead of sitting in the top half. A count cell needs no working room, and a top-hugging layout left a dead band in every cell.
3. **"More and less:" is not in the closed BD band-label list.** PAGE_TYPES only calls it a "follow-up band", so either add the label to the list or rename the band.
4. **The solid set looks heavier than the hollow set on the compare page.** The standard requires this (RP-11 and P-26), but it may bias a pupil judging by eye toward the solid group, so check the printed page.
5. **The `STROKES` start-dot table was tuned by eye for Andika at 80 pt.** It needs a full re-check before it is reused at other column counts.

**Kit proposals worth adopting**
- Add `counters()` with the item size taken from a size token, 9 / 10 / 12 mm, so no page can go below the minimum again.
- Add `pictures()` together with a note that the 24-unit art should fill at least 60% of the grid height.
- Add `tenFrame()`.
- Add `answerSquare(16|20|24)`.
- Add `stepsBox()`.
- Add `chartGrid()`.
- Add `traceRow()` with the dot table. Its rule should be that the dot centre sits no more than 0.3 of the stroke width from the stroke end, and the white ring reaches past the corners of the stroke end.
- Let `grid()` take explicit row tracks.
- Let `band()` take `{ cls, style }`.

Files are in `design\mockups`:
- `pages\05-level-k-number-sense.mjs`
- `out\pdf\05-level-k-number-sense.pdf`
- `out\png\05-level-k-number-sense-p1.png` … `-p8.png`

---

## Group 06 - `pages/06-lesson-packet-level4.mjs`

All six sheets the brief asked for are present, and group 06 builds "ok" with 6 pages; the final build was run with the PDF. I edited only `design/mockups/pages/06-lesson-packet-level4.mjs`. Every printed answer and every equivalent / not-equivalent item was recomputed and is correct.

- PDF: `design\mockups\out\pdf\06-lesson-packet-level4.pdf`
- Previews: `...\design\mockups\out\png\06-lesson-packet-level4-p1.png` to `-p6.png`

## Verdict per page

**06-A Opener — fixed.**
- The "=" and "≠" between fractions were set as small 16 pt glyphs, lighter than the 1.5 pt fraction bars. In the Rule band the "≠" touched the "× 3" row. I replaced them with a drawn sign (two 1.5 pt bars, 4.2 mm wide, centred on the fraction bar, plus a slash for "≠") on every page.
- The Rule example rows were 9.5 mm and cramped. They are now 11.5 mm, the same as the factor frame on pages C and F.
- The "Say:" strip was 10 mm with its text and blanks sitting on the lower rule. It is now 8 mm with centred text and 14 mm blanks (PT-OPN-5), since the frame is said, not written.
- The maths is correct: Model 1/2 = 2/4 (grey trace 2), example 1/2 = 2/4, non-example 1/2 ≠ 2/6, Guided 1/2 = ?/6 and 1/4 = ?/8.

**06-B Independent 2 × 3 — ship** (it only gained the new "=" sign). All six unknowns are whole numbers: 2, 4, 6, 4, 3 and 10. The bars are equal length and the box is 14 mm in every cell.

**06-C Independent, pictures gone — ship** (new "=" only). All eight items check: 5, 8, 8, 10, 6, 12, 2 and 4. The lower half of each cell is open by design (CL-4 / CL-5).

**06-D Discrimination — fixed.**
- The answers ran E, N, E, N, E, N, E, N in reading order, so the whole left column was "Equivalent" and the whole right column "Not equivalent". A pupil could tick by column. The new order is E, N, N, E, N, E, E, N, with no uniform row or column.
- The non-examples did not match the "real slips" claimed in the note (3/4–6/10, 2/5–4/8, 1/2–3/8). The new items are 1/3–2/4 (+1 to top and bottom), 3/4–6/12 (×2 top, ×3 bottom), 2/5–4/7 (+2 to both) and 1/2–1/4 (bottom only), and the note is rewritten to match.
- The gap between each fraction and its bar is now 6 mm (RP-91), up from 5 mm.

**06-E Number line — fixed.**
- The tick labels 0, 1 and 2 were 16 pt. RP-50 asks for working digit size when the number line is itself the problem, so they are now 22 pt. The SVG height and the fraction-to-axis alignment were adjusted to match.
- The note now says why the letters restart at a.
- All four targets land on a printed tick: 3/4, 1/2 = 3/6, 2/3 = 4/6 and 3/2 = 6/4.

**06-F Test A — ship** (new "=" only). All twelve answers are whole numbers: 3, 4, 10, 9, 8, 12, 4, 10, 6, 1, 4 and 4. The unknown appears in all four positions.

## Things the owner should know

- On 06-E the 22 pt whole-number labels now outweigh the 16 pt target fraction at the left. Both sizes follow the standard (RP-50 and the 16 pt fraction size at M), but a ruling on a larger "target" fraction would help that page.
- Pages B and C print an "Independent Practice:" band, while the Independent sketch in PAGE_TYPES 2.4 shows only an instruction line above the grid. BD-1 allows the band and the reference workbooks use it, so I kept it. The owner should pick one form for the whole pack.
- The Test has 12 items at size M, as the brief asked. The standard's capacity table gives 16 at M, so the cells are roomier than the table implies.
- Letters run a–f, g–n, then restart at a. on D and again on E. I treated both as sub-skill pages under CL-12. If E is ruled a plain Independent page, it should run o.–r. instead.
- In cells where the unknown is on the left (C m/n, F j/k), the equation sits a few millimetres to the right of the others, because the 14 mm box widens the left fraction. The answer box itself keeps a fixed size.
- The Guided cells use a grey guide line and a dotted shade region as hints. They do not show the grey first answer digit that PT-OPN-6 asks for, because with a one-digit answer that digit would be the answer.

## Kit proposals worth adopting

- `fracEq()` together with a drawn `eqSign('=' | '≠')`. The kit's `frac()` cannot hold a slot, and the set "=" glyph is too light beside 1.5 pt fraction bars.
- `fracBars(list, { guide, region })`, for stacked equal-length fraction bars.
- `numberLine()` taking its label size from RP-50: working digit size when the line is the problem, zone size otherwise.
- `checkRow(words)`, with `.ws-check` sized to the sheet (5 / 6 / 7 mm).
- `oralFrame()`: an 8 mm strip at size M with 14 mm blanks, text centred.
- `band()` with a class hook and a two-column "Model beside Steps" form, plus a vocabulary-card helper.
- One new instruction-library string: "Are the fractions equivalent? Tick one box."
- One new oral frame: "__ is equivalent to __."

---

## Group 07 - `pages/07-word-problems.mjs`

All seven brief pages (A–G) are present: I fixed A, B, C, D, E and F, and G ships unchanged. The full build prints `ok` and the PDF exists. I edited only `07-word-problems.mjs`. There are no Model, answer-key or error-analysis cells, so no printed answers to check; I recomputed the stories anyway and all are sound.

## Per-page verdict

- **07-A · part-whole, Level 2 — fixed (layout only).**
  - Defect: the equation frame floated in an unruled zone beside the grid.
  - Fix: the work zone is now two sub-cells split by a 0.75 pt hairline, equation centred on the left and the 6 × 7 grid on the right. This matches the two-box sketch in PAGE_TYPES 3.7.
  - Maths: 46 + 27 = 73. Exactly one decision line is correct.
- **07-B · compare, Level 3 — fixed.**
  - Same work-zone split as A.
  - Moving to sub-cells made the three 25 mm lines plus the grid overflow horizontally, and the build caught it. I tightened the sub-cell padding and it now passes.
  - The note said "6 × 6 grid"; the grid is 6 × 7, so I corrected the note.
  - Maths: 342 − 187 = 155, which regroups twice and fits the grid.
- **07-C · equal groups, Level 3 — fixed (same split).** 4 × 6 = 24.
- **07-D · v2 faded, two per page — fixed.**
  - Defect 1: "30 maps are old. The rest are new." put two sentences on one line, which breaks P-WP-17. It is now four lines: "The library has 52 maps." / "30 maps are old." / "The rest of the maps are new." / "How many maps are new?"
  - Defect 2: it was page 2/2 but carried a full page-1 header with Score /4, which breaks HD-20. It now has the 12 mm continuation header: Name plus a one-line outlined tab "Level 2 · Part-Whole · Lesson 9", with no Date, Score or title.
  - Defect 3: with stories of 3 and 4 lines the blanks and equation frame sat at different heights in the two cells. I added a `minLines` option to the story box so both boxes are the same height and the answer places line up.
  - Maths: 38 + 25 = 63; 52 − 30 = 22.
- **07-E · K picture — fixed.**
  - Defect: 22 mm apples floated in a very large dead picture zone, and the equation zone was cramped for K handwriting.
  - Fix: apples are now 26 mm with wider pitch, and the equation-frame zone is taller.
  - The story is simplified to "Sam has 8 apples." (13 words, the name repeated, no sentence starting with a digit).
  - Maths: 8 − 3 = 5. Nothing is pre-crossed.
- **07-F · two-step, Level 4 — fixed (minor).**
  - Arrows in the start → change → end diagram were stubby, a 6 mm shaft with a 2.5 mm head. They are now 8 mm, so the diagram reads as a flow and still fits the 86 mm column.
  - Maths: 248 + 175 = 423, then 423 − 96 = 327.
- **07-G · keyword panel — ship.** Rhythm, alignment and the 62 mm panel are good.

## Departures from the brief that I kept

The three contract documents agree with each other and disagree with the brief on both of these.

- **Difference box is solid, not dashed.** LS-3, RP-70 and PT-TOK-3 all say dashed means cut and nothing else. The `UNKNOWN_STYLE` switch is still in the file if the owner wants to see the dashed version.
- **The keyword panel sits on the right with six steps, not on the left with five.** This follows SF-53, PAGE_TYPES 3.7 and P-WP-14. The `PANEL_SIDE` switch is still in the file.

## Remaining weaknesses for the owner

- **Bar height.** Schema bars are 17.5 mm (15 at M), not RP-70's 14 / 12. The 14 mm rule cannot hold a 12 mm slot with any air, so the standard needs a ruling.
- **Two-step final answer.** PAGE_TYPES asks for a full-width closing row. The page keeps the final answer inside the story box as SF-50 says, plus per-step result lines. The documents disagree.
- **K frame slots.** The page uses 24 mm lines, as SF-52 and the brief say. PAGE_TYPES 3.7 says 24 mm answer squares.
- **Panel step 6** says "Write the label" while the unit word "hens" is pre-printed. The panel text is fixed by P-WP-14, so the text and the slot contradict each other.
- **Compare decision line.** The second compare line, "I know the smaller amount and the difference. I add.", is invented. The library has only one compare sentence.
- **Page D has no title or Score** because it is a continuation page. If the owner would rather see v2 as a page-1 mock-up, restore the full header and relabel the cells a. and b.
- **Page E** still has clear space around the apples. It is intended for drawing lines, but it remains the airiest page in the pack.

## Kit proposals worth adopting

1. `page({ continuation: true })` for the HD-20 header, currently done with `.p07-cont` overrides.
2. `storyBox()` with `minLines`, plus the `unit` and `unit-open` answer rows.
3. `workGrid(cols, rows)` with squares sized to Hw.
4. A size-aware `check()` at 5 / 6 / 7 mm, since the kit's `.ws-check` is fixed at 5 mm.
5. A label-less zoned frame (`.p07-frame` / `.p07-z`), including the side-by-side sub-cell split used for equation and grid.
6. The schema builders `partWhole`, `compare`, `equalGroups` and `change`, with the "?" corner mark.
7. A new instruction-library key `story-steps`: "Read the story. Tick each step. Solve."
8. A standards ruling on RP-70 bar height against slot height.

The page file is `design\mockups\pages\07-word-problems.mjs`. The PDF is `design\mockups\out\pdf\07-word-problems.pdf` and the previews are `design\mockups\out\png\07-word-problems-p1.png` to `-p7.png`, all under the repo root.

---

## Group 08 - `pages/08-daily-review.mjs`

Group 08 review: the full build with PDF prints "ok" for 7 pages, and one defect that needed fixing (the clock faces) is now fixed. I edited only `design/mockups/pages/08-daily-review.mjs`. I read all 7 PNGs from the builder's code, and after my edits re-read pages 1, 2, 3, 4, 6 and 7 plus high-zoom crops of pages 2, 4, 5, 6 and 7. Page 5 I did not re-read after the final build; my edits do not touch its code.

**Maths check.** Nothing to correct.
- No printed answers exist in this group: no Model, answer-key or error-analysis cells.
- Every subtraction is non-negative: 542−176, 731−364, 650−283, 804−526, and the five Daily 4 subtractions.
- Fraction-of-a-set counts divide evenly: 1/2 of 8, 2/3 of 6, 3/4 of 8.
- Patterns are consistent: +3, +4, +100.
- Hour-hand angles are right for 4:35, 10:10 and 7:50.
- Coin rows run highest value first.
- The chart blanks do not include 346.

**Per page**

- **08-A · Daily Spiral p1 — ship.**
  - 28 pt digits with the problem in the top half and about 45% of each cell free.
  - Regroup boxes sit over the correct columns.
  - The week badge and rounded Remember box follow PT-DSR-4.
  - The underlined "sign" matches library string `mixed-sign`.
  - No changes.

- **08-B · Daily Spiral p2 — fixed.**
  - Defect: the 0.78 R minute hand struck through its numeral. 4:35 printed with the 7 crossed out and illegible; 10:10 with the 2 crossed out.
  - The rim stroke also sat exactly on the SVG edge and was clipped at the bottom.
  - Numerals were 0.105 D, not the 0.12 D that RP-100 sets.
  - Fix: `clock()` now uses the same geometry as the pack's time page (`10-visual-grids.mjs`). The rim is true D on a D + 1 canvas, numerals are 0.12 D on 0.66 R, and the hands are 0.47 R and 0.30 R with plain round ends. Nothing touches a numeral.
  - I also loosened the more/less crosses: row gap 1.5 mm to 2.5 mm, plus 0.6 mm under each caption, which had been sitting on its box.

- **08-C · Mixed, grouped — fixed.** Same clock defect, same fix. Shelves, lattice and tabs 1–10 were fine.

- **08-D · Mixed, shuffled — fixed.**
  - Same clock defect, worst here: 7:50 had the hand running through the "10".
  - Cues are 4 words or fewer.
  - Numbering runs by strip, then block, then down the block.
  - Cells are about 45 mm with real answer room.

- **08-E · Today's Number side 1 — ship.**
  - Six equal bands, tabs 1–6.
  - The word bank correctly builds "three hundred forty-six".
  - The `compare` instruction string matches the library.

- **08-F · Today's Number side 2 — fixed.**
  - The cross captions sat on their boxes, and "10 more" was jammed under the 346 box.
  - Row gap is now 3 mm with caption clearance.
  - Band weights rebalanced from 58/76/108 to 56/84/102, so the cross clears the title line and chart rows stay about 15.7 mm (PT-TDN-5 says 15.3).

- **08-G · Daily 4 — ship.**
  - Five bands on one page at M. Every question is a compact form that fits the 35 mm cell, so PT-D4-3's five-day layout holds.
  - Column heads print once above Day 1.
  - Each band has its own Score /4.
  - Tabs 1–4 restart each day.

**Remaining weaknesses for the owner**

1. **Clock hands depart from RP-101** (0.47 R / 0.30 R instead of 0.78 R / 0.46 R, and no arrow tips per the brief).
   - Pages 08 and 10 now agree, but `12-screen-and-dialog.mjs` still draws a 0.85 R hand passing behind haloed numerals.
   - On the 38 mm spiral clocks the hands are short, 8.9 mm and 5.7 mm, but still clearly different in length and weight.
   - Decision for you: pick one clock for the whole pack and rewrite RP-101 to match.
2. **The spiral spread mixes sizes**: page 1 is L and page 2 is M. At 15 pt, "Fraction models" plus "Shade the fraction." cannot share an 87 mm line. PT-DSR-3's cap of 9-character titles would allow L, but it conflicts with the titles the brief asked for.
3. **The spiral has 24 items, not the standard's 28.** It has 3 fraction models, 2 puzzles and 3 rounding rows; counts were cut rather than shrinking anything.
4. **Today's Number uses black tabs 1–9.** The brief asked for letters a–f, but PT-TDN and the Daily-look rule both say tabs. Switching is one line.
5. **Name-only headers.** Spiral p2 and Today's Number side 2 carry a Name-only header, as PAGE_TYPES.md draws them.
6. **Tight drawing room.** The "Draw the blocks" frame gives about 37 × 21 mm per column, which is tight for three hundred-flats. It is forced by the six equal 39 mm bands.
7. **Footer page number is off-centre.** On pages with long CCSS lists the footer page number sits off-centre, because the kit footer uses `space-between`.

**Kit proposals worth adopting**

- One shared `clock(h, m, D)` in the kit, with RP-101 amended to match.
- `instruction()` and `band()` should accept trusted markup. The `_sign_` underline and "<" currently need local workarounds.
- Add a titled-section part for BD-6.
- Let `grid()` hold spanning cells, or add a `lattice()` helper.
- `dayBand()` strip height should come from the size token (7 / 8 / 10 mm) instead of a fixed 10 mm.
- Promote the local representations into the kit: `coin`, `timeSlot`, `numberLine`, `track`, `cross`, `wordProblem`, `cue`.
- Make the footer a 3-column grid so the page number stays centred.
- Add library keys `coins-short` "Write the total." and `boxes` "Fill in the boxes." for half-width sections.

Files are in `design\mockups`:
- `pages\08-daily-review.mjs`
- `out\pdf\08-daily-review.pdf`
- `out\png\08-daily-review-p1.png` … `-p7.png`

---

## Group 09 - `pages/09-thinking-pages.mjs`

Reviewer pass on group 09: all five requested pages are present and none is still weak. Pages A, B and C were fixed; D and E ship as built. I edited only `design/mockups/pages/09-thinking-pages.mjs`. The final full build printed `ok 09-thinking-pages: 5 pages` and wrote `design/mockups/out/pdf/09-thinking-pages.pdf`. I read all five PNGs before the edits, rebuilt after two rounds of fixes and read them again.

## Verdict per page

**09-A · True or False? — fixed (small)**
- Maths rechecked:
  - 6×4 = 4×6 is true.
  - 300+40+7 = 347, not 374, so false.
  - 6×7 = 42, not 48, so false.
  - 5×30 = 150 is true.
  - 600+80 = 680, not 608, so false.
  - 9×3 = 27 = 9+9+9 is true.
- That gives T F F T F T with no pattern, and no frame names the verdict.
- Defect: the content started about 13 mm in from the cell edge, so the longest statement (300 + 40 + 7 = 374) had only about 5 mm on the right. I cut the left indent from 8 mm to 6 mm, which balances the side margins in all six cells.
- The tick row and frame row sit at the same height in every cell (PT-TOF-3), the statement is in the top half, all blanks share one width, and over 40% of each cell is free.

**09-B · Reason It, Mixed — fixed**
- Maths rechecked:
  - A: 452 − 127 with tens 5→4 and ones 12 gives 325, which is correct.
  - B: 335 is the "take the small digit from the big one" error (7−2, 5−2, 4−1), a real misconception and not equal to the right answer.
- Defect: the "Which is correct" cell was top-loaded, with a dead band of about 17 mm under the samples and the response column bunched at the top. I did three things:
  - The cell is now 78 mm, close to the 76 mm cell in PT-RSN-1.
  - The response column stretches to the sample height.
  - "The answer is __." now sits beside the answer rows 325 / 335.
- Defect: the odd-one-out numbers 24, 36, 45, 18 had a second valid odd one, because 24 was the only number that is not a multiple of 9. I replaced them with 14, 26, 35, 18, so only even/odd singles one out, as P-TH-15 requires.
- Defect: the odd-one-out cells had a dead band of about 25 mm under the frame. I made four changes, and the frame still sits at the same height in both cells:
  - Item boxes are 24 mm, up from 22 mm.
  - Shapes are 20 mm, up from 18 mm.
  - The row gap is 12 mm, up from 8 mm.
  - The word bank is 36 mm wide, down from 38 mm.
- The triangle outline is rescaled so it still prints at exactly 1.5 pt after the enlargement.
- The strike-through on crossed digits was 1 pt; it is now 0.75 pt per VA-23.
- Shapes item: shape 3 has four sides, so "3 does not belong. It is not a triangle." is unique. "a circle" and "a square" single nothing out.

**09-C · Always, sometimes, never — fixed (small)**
- The four verdicts are right:
  - Sometimes: 5×3 = 15 but 5×2 = 10.
  - Always.
  - Never.
  - Sometimes: ×1 and ×0 break it.
- Defect: the instruction said "Write an example." while every row prints two frames under "Examples". It now reads "Tick Always, Sometimes or Never. Write two examples." (8 words).
- I raised the cell top padding from 5 mm to 7 mm so the rows sit less top-heavy. The claim is still in the top half.

**09-D · Stretch — ship**
- The traced row 12 + 8 = 20 is correct.
- The four cards give 12 two-digit numbers, 3 per tens digit, and the traced row 13, 15, 18 → 3 is correct.
- The page matches SF-62, PT-STC-1 to 3 and P-TH-17 to 20:
  - Rounded prompt box and square results table.
  - Traced first row, with 5 and 3 empty rows in the two tables.
  - Check column and a closing count frame with two tick lines.
  - No Score, and "Answers vary" in the footer.

**09-E · Look at the sign — ship**
- The Model 35 + 7 = 42 is correct and shown in grey trace with a dotted ring on the sign.
- The eight facts (three ×, three −, two +) follow no pattern, and Score /8 excludes the Model cell.
- The instruction is 12 words, and the rule sits in one rounded box (P-TH-11).
- The sign is at the same x position in every cell, which suits this page.

## Remaining weaknesses the owner should know about

- **09-D has an empty zone to the right of each table.** PAGE_TYPES puts the closing frame under the table. Two problems with that layout need about 256 mm against the 227 mm available. So the closing frame stays beside the table, aligned to its bottom edge. The alternative is one problem per page, which is PT-STC-1's default.
- **09-E uses a dotted ring, not the "dashed ring" the brief asked for.** The hard rules and LS-1 make dotted mean trace/model and reserve dashed for cut or the unknown. At 1 pt dots and 1.2 mm pitch the ring is legible but light. If the owner wants it bolder, that is a change to LS-1, not to this page.
- **09-B uses "A" / "B" with "Circle A or B", not the named pupils and tick box from the brief.** PT-RSN-4 and P-TH-14 forbid named characters in these items. The page is also the "Mixed" option, since SF-61's default is one reasoning type per page.
- **09-A frames are neutral (for example "300 + 40 + 7 = __.") and not the brief's "It is false because …".** The brief's wording prints the verdict inside the cell.
- **09-E has three short sentences in one instruction line.** That is 12 words, at the limit. The brief's own string was "Circle the sign. Then solve."; the builder added the cross-out clause.

## Kit proposals worth adopting

From the builder's list, I endorse these:
1. A `--ws-check` token (5 / 6 / 7 mm by size) with a `check(label)` helper. The kit's `.ws-check` is fixed at 5 mm.
2. A `frame(parts)` helper for one-line sentence frames.
3. `stack(..., { answer: 'given', rg, cross })` for finished work samples. This is needed by error analysis, True or False? and Reason It.
4. `fact(..., { ans, trace, ringOp })` with a shared SVG `ring()`, because a CSS dotted border cannot hit the LS-1 pitch.
5. `rowsTemplate` / `colsTemplate` options on `grid()`.
6. `table(head, rows, { traceFirst })`, a rounded prompt box and a word-bank box.

I would add two more:
- An SVG helper that takes the target stroke in pt and the mm-per-unit scale. Resizing an inline SVG otherwise silently leaves the allowed stroke set, as it did here before I corrected it.
- A tab-id convention for the thinking roles in PT-FRM-9.

---

## Group 10 - `pages/10-visual-grids.mjs`

Group 10 review: two pages needed fixes, six ship as built. I fixed 10-A and 10-D, corrected the notes on 10-G and 10-H, and the full build reports `ok` for all 8 pages with the PDF written. I edited only the group's page file; the kit, the build script and the app's tracked files were not touched.

**Per page**

- **10-A Telling time — fixed.** This was the one real defect. The builder ran the minute hand at 0.85 R behind numerals masked with white paper patches. At 12:15 that printed as "—3—", and the stub past the numeral merged with the five-minute tick into a line to the rim. 1:40, 8:35 and 3:25 looked the same, like crossed-out numbers.
  - The numerals stay at 0.66 R and 0.12 D (RP-100), which puts their inner edge at about 0.50 R for "10" and 0.58 R for the rest. RP-101's 0.78 R hand would therefore cross the numeral at every five-minute time.
  - I set the hands to 0.47 R (minute, 1.5 pt) and 0.30 R (hour, 2.25 pt) and removed the mask code. The minute hand now points at its numeral and stops about 1 mm short on every face. I tried 0.54 and 0.51 first; both still touched the "0" of "10" and the "7".
  - The hands are arrow-free, as the brief asks.
  - All six hour-hand angles recheck correctly (30h + 0.5m), and no time has overlapping hands.
- **10-B Draw the hands — ship.**
  - The 62 mm faces are within 1.25 × the 52 mm minimum.
  - No hands are drawn and the pivot is kept.
  - The digital box is 48 × 19 mm with no leading zero.
- **10-C Coins — ship.**
  - The Model trace (25, 35, 40, 41, 42, total 42) is correct.
  - The Independent totals are 66, 41 and 52, and none of them is printed.
  - The coins carry only 1, 5, 10 and 25, and the total is a plain number on a line.
- **10-D Shade the fraction — fixed.**
  - The second Model cell (7/8) was left blank "to work live". A Model cell must show the worked answer in grey, so it is now shaded 7 of 8.
  - I also set the gap between the fraction and the model to the 6 mm RP-91 asks for; it was 5 mm.
- **10-E Base-10 — ship.**
  - All six block counts match their numbers (124, 136, 205, 152, 211, 143).
  - 205 correctly shows no rods.
  - The unit is 3.4 mm, as the size table sets for L.
- **10-F Area and perimeter — ship.** The answers are 24/20, 24/22, 25/20 and 35/24, and none is printed on the sheet.
- **10-G Read a bar graph — ship, note corrected.**
  - "Use the graph. Answer the questions." is the instruction library's string.
  - The answers are 6, 4, 5 and 10.
  - The note now states that the plot area is 89 mm wide, below the 100 × 80 mm minimum at L.
- **10-H Make the graph — ship, note corrected.**
  - The tallies show 8, 5, 6 and 3.
  - The ruled bar-column guides are now declared as a departure from RP-131 ("axes and grid only").

**Remaining weaknesses for the owner**

1. **Clock hands depart from RP-101.**
   - This was necessary: with RP-100's numeral position, RP-101's 0.78 R hand crosses a numeral at every five-minute time.
   - The cost of my fix is that the long hand no longer reaches the minute ticks, and the hour hand is only 7.5 mm long on a 50 mm face.
   - The alternative is to change RP-100 instead, with smaller numerals nearer the rim, as every reference workbook does, and keep a long hand. Either way the standard needs changing.
2. **The 10-G graph is narrower than the size table allows.** This follows from the graph-left, questions-right layout in the brief. A full-width graph with the questions underneath would meet the minimum.
3. **10-E and 10-F have a large open band between the picture and the bottom-pinned answer slot.**
   - It is within the rules and usable as working room, but visibly emptier than the other pages.
   - 2 × 3 is what the brief fixes; the standard's own capacity for base-10 100–299 at L is 4 per page.
4. **The 10-H column guides are a useful support for these pupils.** They still contradict RP-131, so the owner should accept the departure or amend the rule.

**Kit proposals worth adopting**

- A `time()` slot for the two-box "[ ]:[ ]" answer.
- An `answerZone()` helper that pins the answer zone to the bottom of a visual cell.
- A `unitSlot(n, word)` helper for a line plus a pre-printed unit word.
- A digit-size stacked target fraction; the kit's `frac()` prints at 20 pt, which is too small for a shade-it target.
- A `split(left, right)` band body for a graph with questions beside it.
- A `table()` helper for the tally-table style.
- The SVG builders (`clock`, `coin`, `fracCircle`, `fracRect`, `base10`, `gridRect`, `barGraph`, `tally`), moved into the kit as they are.
- Two instruction-library strings: "Write the area. Write the perimeter." and "Write each number. Shade the bars."
- A revision of RP-100/RP-101 so that no hand can cross a numeral.

Files are in `design\mockups`:
- `pages\10-visual-grids.mjs`
- `out\pdf\10-visual-grids.pdf`
- `out\png\10-visual-grids-p1.png` to `-p8.png`

---

## Group 11 - `pages/11-options-and-variants.mjs`

Review of group 11 (`design\mockups\pages\11-options-and-variants.mjs`) is complete. I edited only that file. The full build prints `ok`, 18 pages, and the PDF is at `design/mockups/out/pdf/11-options-and-variants.pdf`.

I read every PNG, zoomed the detail areas, and rasterised the PDF pages for E, E2, E3 and the hatch rows. I measured header and grid heights on all pages. Every requested page A to I is present. All six key answers, their regroup marks and the traced digits on D/E recompute correctly.

## Verdict per page

| Id | Verdict | Defects found and fixed |
|---|---|---|
| 11-A / B / C digit styles | ship | No defects. A zoomed side-by-side confirms both variant classes change the glyphs (the 1 loses its base; 6 and 9 get straight stems). Geometry matches the 01 example; the sum rule sits 53% down the cell, so 47% is free. |
| 11-D guided, standard grey | fixed | The Steps strip stopped at "Add the tens." although items c, e and f regroup tens. It now has 5 steps, adding "Regroup 10 tens as 1 hundred.", in two text columns of at most 3 lines (PT-GDP-2). The fade follows PT-GDP-1, and the fraction slot and 56 x 18 mm bar follow RP-91 and the §6 slot table. |
| 11-E photocopy-safe as the standard words it | fixed | The hatch was an SVG `<pattern>`, and Chrome's PDF export turned it into a coarse grey bitmap, stair-stepped even at 600 dpi. It is now real 0.75 pt vector lines at 1.6 mm pitch inside a clipPath, and the PDF is crisp. The dotted-outline trace digits are kept exactly as specified, because they show the spec does not work (see weaknesses). The note now says so. |
| 11-E2 hollow trace digits | fixed | The hollow 6 showed a stray inner contour line. It now paints a 1.5 pt stroke first with white fill on top, which leaves a clean 0.75 pt outline. |
| 11-E3 dotted centre-line digits | new | I added this page because 11-E's digits are illegible. It uses ten hand-drawn single-stroke digits with one row of round dots at 1.2 mm pitch. The strokes of the 1 all start at its foot, and the two bowls of the 3 start at its waist, so dots do not bunch. On this page the regroup digit is enlarged to 7 mm so it reads. It reads well in both the PNG and the PDF. |
| 11-F1 / F2 / F3 sizes | ship | 16 / 22 / 28 pt confirmed by measurement. Items a–f are identical on all three pages. |
| 11-G1 all five parts on | ship | Header 26 mm, grid 227 mm, as the note claims. |
| 11-G2 Date off | fixed | The Name rule was 76.8 mm; it is now the full 90 mm. Score is right-aligned beside the tab. |
| 11-G3 Name and title only | fixed | Same Name-line fix. Header 23 mm, grid 230 mm. |
| 11-G4 everything off | ship | Header 0 mm with no rule, grid 253 mm, matching HD-12. |
| 11-H1 / H2 / H3 labels | ship | Only the label changes. Borders stay 0.75 pt and nothing reflows (CL-11, CL-20). |
| 11-I answer key | fixed | It printed "Name Answer Key" on the Name rule. AK-3 says the Name field is replaced, so it now prints bold "Answer Key" alone. Tab line 3, the "Key" footer and the /6 denominator were already correct. |

## Remaining weaknesses the owner should know about

- **Dotted trace digits.** The standard's photocopy-safe digit (glyph outline, 1 pt dots, 1.2 mm pitch; §4.3 and SF-10) cannot be read at any size. The two contours of a roughly 1 mm stem make two dot rows that fall out of step and turn the digit into a scatter of dots. 11-E is left as the proof, and the owner should choose between 11-E2 and 11-E3.
- **11-E2 (hollow digits).** Uses the real Andika outline, but a solid outline bends the rule that dotted means model.
- **11-E3 (dotted centre line).** Keeps dotted = model, but needs skeleton digits maintained alongside Andika. Its dots are 1.5 pt, not the 1 pt of LS-1, because 1 pt was too faint to trace. This is a deliberate departure and the note says so.
- **Digit styles A/B/C.** The differences are real but subtle at page scale, especially the 6 and 9. The owner should lay the three printouts side by side.
- **Guided page row height.** Rows grow about 20 mm beyond the standard's 54 mm guided-cell height, so PT-ENG-3's +8 mm cap is not honoured. This follows the brief's rule against a dead band at the bottom.
- **Score on a Guided page.** The page prints Score /2 for the Mixed Review row the brief asked for. The standard's plain Guided page has no Score.
- **Sum rule past the half-way line.** With regroup boxes on, the rule sits at 53–58% of cell height, slightly past CL-4's "top half", while free area stays at 42–47%. This comes from the standard's own minimum cell heights and the item counts in the brief.

## Kit proposals worth adopting

1. `hatch(x, y, w, h, angle)` should emit clipped vector lines, and the INK-22 shared-`<pattern>` rule should be dropped or revised, because Chrome's PDF export turns the pattern into a bitmap.
2. Replace the kit's `.ws-photocopy .ws-trace` rule. It uses a 0.6 pt stroke, which is outside the allowed set, and amend §4.3 once the owner has chosen between E2 and E3. If the owner picks hollow digits, the recipe is `paint-order: stroke fill` with a 1.5 pt stroke. If the owner picks centre-line digits, `traceDigit(ch)` should own the skeleton paths.
3. `stack()` should accept regroup and answer marks in three states (trace, key, blank), which would remove the local `fillBoxes()` patching.
4. `page()` should do the §8.3 header reflow. `.p11-name90`, `.p11-dateoff` and `.p11-nohead` each fake one part of it.
5. `page({ key: true })` should apply AK-3: bold "Answer Key" in place of the Name field, tab line 3, and the "Key" footer prefix.
6. `fracBar()` and a fraction answer-slot helper, plus an SVG `.ws-dotbox`, since a CSS dotted border cannot hold the 1.2 mm pitch.

---

## Group 12 - `pages/12-screen-and-dialog.mjs`

Group 12 needed fixes on three of its five frames; A was fine and C got a small data change. The full build now prints `ok 12-screen-and-dialog: 5 pages`, the PDF was rebuilt, and the module syntax check passes. I edited only `design/mockups/pages/12-screen-and-dialog.mjs` and viewed every PNG after the fixes. I did not open the PDF because this machine has no renderer. Its page boxes show five pages: A, B and E portrait, C and D landscape, nothing spilling onto a sixth.

## Verdicts

**12-A Phone 375 × 760: ship.**
- Everything in the brief is present: top bar, progress dots, XP pill, Level pill, Hint left and a big Check right, and the white card as the print cell.
- 632 − 247 in progress is coherent: tens regrouped to 2, ones to 12, ones answer 5, focus ring on the tens box.
- Dots (3 done, 4th current) match "4 of 10". I made no layout change.

**12-B Tablet 768 × 1024: fixed.**
- Defect: the minute hand ran through the "7" on 4:35 and read as a crossed-out numeral. The numerals were also smaller than the standard asks.
- Fix: I copied the clock geometry from the print clock sheet in group 10. The minute hand now passes behind the numerals, which carry a white halo, and its tip lands on the minute ticks.
- The hand angles are correct: the hour hand sits between 4 and 5, the minute hand on 7. The instruction reads "Type the time." and the clock's screen-reader label does not give the time away.

**12-C Desktop 1440 × 900: fixed.**
- Item c was 804 − 356, which borrows across a zero. The standard wants one wide regroup box for that case and the kit cannot draw it, so the item showed three ordinary boxes. It also showed the tens and ones regrouped while the hundreds box was still empty.
- Fix: replaced it with 824 − 356, in progress with tens 1, ones 14 and answer ones 8.
- I recomputed all six items. a = 385 and b = 368 are filled in with correct regroup marks. c = 468 (in progress), d = 624, e = 290, f = 188.
- The builder's note claimed every input was 44 × 48 px, but the drawn boxes are 34 × 48. I rewrote the note to say the whole 44 px track is the touch target.

**12-D Feedback states: fixed.**
- After Check, the wrong tens box lost its red outline when it took focus. It now keeps the red outline with the purple focus ring around it.
- Maths rechecked: 546 − 178 = 368. In the Guided panel the 8 is ticked and the wrong 7 is crossed and left visible. After Check on 378 the marks are tick, cross, tick, and the banner says "Look at the tens."
- Regroup boxes are never marked, the paper stays white, and the tick badge is a circle and the cross a square.

**12-E Print dialog 1100 px: fixed.**
- Defect: the preview showed 9 problems per page. The standard caps an Independent page at size L at 6, and at 6 with regroup boxes in either look.
- Fix: the thumbnail is now 3 × 2 with a–f, Score /6, Count 6 and "Fits: 3 columns · 28 pt digits · 6 per page · 3 pages". I swapped the 804 item here too.
- Columns showed 5 filled while the note said "Showing 3", which read as a contradiction. The stored 5 stays filled and the 3 that actually prints now has an outline.
- The clamp note matches the standard's wording and capacity table (3 columns at L, 4 at M).
- Every control in the brief is present, and the "In this job" page counts add up (3 + 2 + 5 = 10).

## Remaining weaknesses the owner should know about
- **Drawn boxes are narrower than the touch minimum.** The standard asks for 44 × 44 px minimum touch targets, but with 44 px tracks the drawn digit boxes are 34 px wide. The mock-up assumes the whole track is the hit area. Separately, the page-types document asks for 56 to 64 px tracks on single cards. It also asks for 4 columns of 3-digit stacks on desktop, where the brief says 3. These need one ruling.
- **Wide digit spacing on desktop.** 29 px digits on 44 px tracks make the digits of a number sit further apart than in print. This follows the standard but is the weakest point of print parity.
- **Clock departs from the written standard.** Plain hand ends are required by the brief and the 0.85 R minute hand is copied from group 10. Both differ from rule RP-101, which should be amended or the clocks redrawn.
- **Tall cells in the dialog thumbnail.** At 3 × 2 each cell is about 55% empty. That is faithful to the layout rules but looks like wasted paper in a preview.
- **Dead band in the dialog.** About 190 px sits empty between "In this job" and the Print buttons in the right column.

## Kit proposals worth adopting
- **One shared clock builder**, drawn in millimetres so print and screen scale the same drawing, using group 10's geometry, plus a matching amendment to the standard.
- **A screen mode for stacked problems** that emits inputs in place of the answer row and regroup boxes.
- **A screen token block:**
  - 44 px minimum tracks.
  - 48 px writing height.
  - The mapping of print stroke widths to screen pixels.
  - A drawn box 10 px narrower than its track, with the track as the touch target.
- **The wide regroup box** for borrowing across zeros, with a two-digit input as its screen twin.
- **A time-slot helper** for the `[ ]:[ ]` answer slot.
- **A thumbnail option on the page builder**, so the dialog preview reuses the real print page.
- **A per-file capture selector in the build script**, so screen frames need not borrow the A4 page class.
