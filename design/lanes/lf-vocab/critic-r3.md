# lf-vocab critic r3 (independent, Opus medium)

**VERDICT: FAIL. Minimum score: 6** (H13 on Match 3 guided at S and L, on the error-analysis pages at L, and on both worksheet-1280 hosts). This is not a near-miss (Q-S2 is not allowed).

I read every PNG in RENDERS_DIR. I measured the empty bands with a row-ink scan of each page (the band between the last ink and the cell rule, as a share of the cell's height). The owner rulings Q1, Q2, Q-A, Q-B and Q-C are applied. Scope note: RUBRIC's scope note takes guided and error analysis out of the pass bar, but this brief names them, so they are graded and counted. If the lead applies the RUBRIC scope instead, the failing set shrinks to the pictures, both worksheet-1280 hosts, grade 2, grade 4 and the grade 1/4 lesson frame.

## Scores (C1 / C2 / C3 / C4)

| Group | Score | Caps |
|---|---|---|
| Picture library (47; 34 / 40 / 70 mm) | 8 / 7 / 8 / 8 | - |
| Match 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Match 3: guided S, L | 8 / 8 / 6 / 7 | H13 |
| Match 3: guided M | 8 / 8 / 7 / 7 | - |
| Match 3: error analysis S M L | 8 / 8 / 6 / 8 | H13 |
| Match 3: card-390 / 820 / 1280, quiz-1280 | 8 / 8 / 8 / 8 | - |
| Match 3: worksheet-1280 | 8 / 8 / 6 / 8 | H13 |
| Pick 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Pick 3: guided S, M | 8 / 7 / 8 / 8 | - |
| Pick 3: guided L | 8 / 7 / 7 / 8 | - |
| Pick 3: error analysis S, M | 8 / 8 / 8 / 8 | - |
| Pick 3: error analysis L | 8 / 8 / 6 / 8 | H13 |
| Pick 3: card-390 / 820 / 1280, quiz-1280 | 8 / 8 / 8 / 8 | - |
| Pick 3: worksheet-1280 | 8 / 8 / 6 / 8 | H13 |
| Grade 1 (L) | 8 / 8 / 8 / 8 | - |
| Grade 2 (L) | 8 / 7 / 8 / 8 | - |
| Grade 3 (L) | 8 / 8 / 8 / 8 | - |
| Grade 4 (L) | 7 / 7 / 8 / 8 | - |
| Lesson vocab page, pilot (M, L) | 8 / 8 / 8 / 8 | - |
| Lesson vocab page, grade 1 and grade 4 (L) | 8 / 8 / 8 / 7 | - |

## Pictures below 8

- **one, ten, hundred** (as a set, M-V1, VQ-1). The three blocks are not drawn on one unit scale.
  - "one" is a 3D cube, 23 mm on a side on the grade 2 page.
  - "ten" is a flat rod of 6.6 mm units.
  - "hundred" is a flat 25 mm grid of 2.5 mm units, so it is shorter than the ten rod is long (pics-70: 250 px against 380 px).
  - A grade 2 pupil sees a "one" bigger than a "ten" unit, and a "hundred" smaller than a "ten". That misteaches 2.NBT place value.
  - Fix (`vocab-pictures.js`): one shared unit u for all three, with ten = 10u × u and hundred = 10u × 10u. Draw "one" as a single unit square (or all three in the same 3D style). When the picture is scaled to fit, the ten and hundred shrink together and are never drawn at different unit sizes.
- **grow** (M-V1). `notWith: []` was kept on purpose (vocab-words.js:58-60). Grade 4 item 3 offers grow with "sequence" in the bank, and the growing stack is a sequence. Fix: add `grow`/`sequence` and `grow`/`pattern`. If that leaves the growing-patterns set with fewer than 4 clash-free Match 3 cells, take pattern and sequence out of that set's Match 3 triples only, not the whole check.
- **distributive** (VQ-6). At 34-40 mm the split line runs 1-2 px from the 5th-column dots (pics-34; L independent item 2C). The two arrays do not read as two. Fix: a gap of at least one dot diameter on each side of the split line.
- Nit (all sizes): **pattern** ends "8.." with two dots, while sequence and first term use a true "…". Fix: use U+2026.

## Defects

1. **Match 3 guided cells are ≥ 30 % empty** (C3 → 6, H13, class SPACE). On guided-p1:
   - S: the model cell is 37 % empty and cell 2 is 34 %.
   - L: the model cell is 37 % and cell 2 is 36 %.
   - M: 28 % and 25 %, which is a near-miss.

   The cells are sized for the pick3 model plus a hint, but Match 3 content ends at the letter boxes. Fix (`vocab-match3.js` footprint for role guided): declare the height actually drawn, with the hint row reserved only in hint cells, or put the hint inside the word band. Check: precritic H13 on guided at S, M and L.
2. **The guided Score denominator breaks Q-C** (C4 −1, FRAME). Match 3 guided prints "/5" (S, M) and "/4" (L) for 5 and 4 practice cells of 3 words each. Q-C says a page is scored per word: /15 and /12. Independent pages are now correct (/12). Fix: the guided composer takes the score total from the provider's per-item mark count (3 for match3), not from the cell count.
3. **Error-analysis pages at 2 a page leave 35-40 % of each cell empty** (C3 → 6, H13):
   - Match 3 at S: 40 %; M: 38 %; L: 35 %;
   - Pick 3 at L: 36-37 %.

   Fix: give the EA cell its real height (picture, row of words, Correct / Fix it), so 3 a page fit, or lay out the Fix-it row beside the picture. Check: precritic H13 on role error-analysis.
4. **worksheet-1280, both skills** (C3 → 6, H13, VQ-7):
   - Match 3: tiles 1, 2 and 6 put the words 2 + 1, and tiles 3, 4 and 5 stack them one a row; tile 5 is 38 % empty.
   - Pick 3: tiles 2 and 3 are about 45 % empty, and tile 4's pills wrap 2 + 1. The answer line sits at a different height in every tile. The picture scale varies about 3× (tile 1's In/Out table against tile 2's equation).

   Fix (`screen-cell.js` worksheet tile): one fixed layout per tile.
   - Picture box at a fixed height, with the picture scaled to it.
   - Words stacked one a row, in a fixed-width column.
   - Line or boxes at a fixed y.

   **This is r2 #7 and it persists.**
5. **The Pick 3 guided hint does not discriminate** (C2 −1, VQ-3, PEDAGOGY 4). On S, M and L, cell 2 says "Its word starts with "c"" while the bank holds both "column" and "commutative". Fix (vocab-pick3 provider hint): use the first letter only when it is unique in the bank. Otherwise give the word's `meaning` (as Match 3 now does: "rule means what we do to every number").
6. **Pick 3 guided rows are unequal at L** (C3 −1, AX-4): 379 px against 291 px. S and M are now equal. **This is r2 #4 at L only.** Fix: the same row height for every row at L, or reserve the hint slot in every row.
7. **The grade 4 write line is too short** (C1 −1, H9-adjacent). The lines are about 36 mm, but the words to write include "times as many", "remainder" and "sequence" (about 40-52 mm at grade 4 handwriting). Fix: at grades 4-5, line width ≥ 55 mm. The bank sits beside the picture, so the line can span the full cell width under both. Check: line width ≥ longest bank word × 4 mm.
8. **Grade 2: the base-ten pictures are on three scales** (C2 −1, see Pictures). The cube, the rod and the grid contradict each other. **r2 #2 is partly fixed:** rod units are now 6.6 mm, and the number name and expanded form are bold and large.
9. **Grade 4: grow with "sequence" in the bank** (C2 −1, M-V1). **r2 #3 persists for grow.** round up / quotient is fixed.
10. **The grade 1 and grade 4 lesson pages carry the pilot's frame** (C4 −1, FRAME, VQ-9). The title is "I Can use a multiplication chart to find products" and the footer reads "mult_chart · Grade 3 · 3.OA.7". If this is the render harness and not the product, re-render each set inside its own BUILD lesson. If it is the product, the vocab-page must take its title and footer from its lesson.

## Round 2 defects

| r2 # | Status |
|---|---|
| 1 Footer names the wrong grade | FIXED: g1 shows 1.NBT.1, g2 2.NBT.3, g4 4.OA.5 … |
| 2 Grade 2 pictures too small | PARTLY: sizes are fixed, the scale defect is new (#8) |
| 3 Look-alikes | PARTLY: round up/quotient is fixed, grow/sequence persists (#9) |
| 4 Pick 3 guided rows unequal | PARTLY: S and M are fixed, L persists (#6) |
| 5 Dead hints | PARTLY: the Match 3 hint now gives the meaning, the Pick 3 first-letter hint does not discriminate (#5) |
| 6 Screen bank words too small | FIXED: pills are about 18-20 px bold |
| 7 Match 3 worksheet layout | PERSISTS (#4) |
| 8 Error-analysis wrong words | FIXED: M-V4 misspellings (patern, fctor, euqal groups) |
| 9 Pilot "Name the picture" cells | FIXED within 8 |
| 10 Grade 1 strip numerals | FIXED |
| 11 Score /4 on Match 3 | FIXED on independent, persists on guided (#2) |

## (a) Automatic checks that would have caught each defect

- **#1, 3, 4: H13 band scan on every offered role and host**, not only independent: guided and error analysis at S, M and L, and the worksheet-1280 tiles. Precritic rendered "the card's other offered roles" in r4 but did not apply H13 to them.
- **#2: L-SCORE.** The Score denominator equals the sum of the provider's marks per item on every role (Q-C).
- **#5: V-HINT-UNIQUE.** A first-letter hint must be unique among the bank's words.
- **#6, 4: L-ROWEQ.** Rows are within 1 mm at every size. On screen, the slot y-offset is the same in every tile.
- **#7: L-WRITELINE.** Line width ≥ 4 mm × the longest bank word's character count, per grade class.
- **#8: V-SCALE.** Pictures tagged `base10` share one unit length, measured from the SVG.
- **#9: V-CLASH.** Every bank's picture-clash pair is listed (a structure tag "growing stack" ∩ "sequence/pattern"). No intentional exemptions without an owner ruling.
- **#10: L-FRAME.** The lesson-part title and footer CCSS come from the set's own lesson.

## (b) Speed-ups for the next round

- Run the row-ink band scan (a 30-line script) inside precritic on all role × size PNGs. It found every H13 here in seconds.
- Render the lesson vocab-page inside each set's own lesson, so frame defects are not confused with harness artefacts.
- The next round should re-check only #1-#10, plus a 20 % fresh sample. Independent, more-practice, test, cards and quiz are at 8 on both skills, so keep them through the golden manifest.
