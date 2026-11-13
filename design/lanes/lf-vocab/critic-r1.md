# lf-vocab critic r1 (independent, Opus medium)

**VERDICT: FAIL. Minimum score: 1** (vocab_pick3_words error-analysis, H11 against the signed card §7a). Without error analysis, which RUBRIC's scope note excludes, the minimum is **4** (pick3 worksheet-1280 and quiz-1280, H2; match3 card-390, H2).

Sizes: S and L graded in full, M spot-checked (independent, more-practice, guided, lesson). Every PNG in RENDERS_DIR was read. The key's reddish-orange ink is INK-31 and is correct. The picture contact sheets render without Andika (the harness falls back to Arial). That is not a defect, because the pages do load Andika.

## Scores (C1 / C2 / C3 / C4, caps)

| Group | Score | Caps |
|---|---|---|
| Picture library (47) | 7 / 7 / 8 / 8 | - |
| Match 3: independent, more-practice, test (S M L + keys) | 8 / 8 / 8 / 8 | - |
| Match 3: guided (S M L) | 8 / 8 / 7 / 8 | - |
| Match 3: error-analysis (S M L) | 4 / 3 / 6 / 6 | H1, H13 |
| Match 3: card-390 | 4 / 8 / 6 / 8 | H2 |
| Match 3: card-820 | 7 / 8 / 7 / 8 | - |
| Match 3: card-1280, quiz-1280 | 8 / 8 / 8 / 8 | - |
| Match 3: worksheet-1280 | 7 / 8 / 6 / 8 | - |
| Pick 3: independent, more-practice, test (S M L) | 6 / 8 / 7 / 8 | - |
| Pick 3: guided | 7 / 8 / 6 / 8 | H13 |
| Pick 3: error-analysis | 1 / 1 / 1 / 1 | H11 (card §7a: offered) |
| Pick 3: card-390, card-820 | 7 / 8 / 8 / 8 | - |
| Pick 3: card-1280 | 7 / 8 / 6 / 8 | - |
| Pick 3: worksheet-1280, quiz-1280 | 4 / 8 / 6 / 8 | H2 |
| Grade 1, 1 picture 3 words | 5 / 6 / 7 / 7 | - |
| Grade 2 | 6 / 6 / 7 / 7 | - |
| Grade 3 (= skill L) | 6 / 8 / 7 / 8 | - |
| Grade 4 | 8 / 7 / 8 / 7 | - |
| Lesson page, pilot M and L | 8 / 7 / 7 / 8 | - |
| Lesson page, grade 1 | 5 / 6 / 7 / 8 | - |
| Lesson page, grade 4 | 8 / 6 / 8 / 8 | - |

## Pictures below 8

- **hundred chart 6**: it shows 8 cells (101-104 and 111-114), a strip and not a chart, and it reads as "count on". Fix: draw a 10-column grid of at least 3 rows that starts at a row of tens (1-30, or 91-120 for 1.NBT.1).
- **ten 6**: the rod is about 3 mm wide with 2 mm units, so the units cannot be counted at 34 or 40 mm. Fix: rod at least 6 mm wide with at least 3 mm units, a horizontal rod if needed.
- **one 6**: a lone 8 mm square reads as "square". Fix: draw a unit cube next to a faint ten-rod for context, or 1 cube with the "1" digit.
- **round up 6**: 3 full boxes plus 1 box with one dot is the same structure as remainder and equal groups, with no "up" cue. Fix: show "13 children, 4 per car → 4 cars" with the 4th car outlined heavy, or a number line arrow up to the next ten.
- **step / identity / multiple / left / term / count on / number name, all 7**:
  - step: two sheets, which could read as "page" or "order".
  - identity: uses the ringed-dot mark that odd, one more and remainder also use.
  - multiple: the arcs and arrowheads collide with the ticks at 34 mm.
  - left: the circles are under 3 mm.
  - term: the same picture as sequence.
  - count on: each arc is +1, so it reads as "one more".
  - number name: thin regular weight, lighter than every other picture.

  Fix each in `vocab-pictures.js`, and add the pairs to `notWith`.

## Defects (numbered)

1. **Error analysis, Match 3: the key contradicts the page** (C2, critical, H1). In error-analysis-p1 item 1 at S, M and L, Sam's boxes show C, A, B. That is the correct answer: distributive = C, output = A, product = B. The key ticks "Fix it" and writes the same C A B, while item 2, which shows the same kind of work, is ticked "Correct". The page shows the item's answer in grey where Sam's wrong work should be. Small corner letters A/B/C sit in every word box, and the Fix-it boxes are labelled A/B/C under them, which clashes with the picture letters. Fix: in the vocab-match3 wrongAnswer render, print the misconception letters (M-V3: A, B, C in order) in the slot and not the answer. Label the Fix-it boxes with the words, not with letters. Drop the corner letters. Check: a key-vs-pupil test that the shown work differs from `ans` whenever the key says Fix.
2. **Error analysis, Match 3: 2 items a page, each cell about 45 % empty** (C3, H13). Fix: at L, 3 a page with the cell height cut to the content.
3. **Pick 3 declines error analysis** (all four = 1, H11). Card §7a marks it **offered**, with wrongAnswer real ("a bank word not the picture's"). The provider gives none. Fix: wrongAnswer = the notWith-nearest bank word, rendered as the written word on the line. Or the owner re-rules it as out of scope on the card.
4. **Bank items are not delimited** (C1, major). Multi-word items run into their neighbours: "equal groups step odd" (L item 6), "product output / equal groups", "one less count on / one more" (grade 1), "count on one more / before" (grade 1 lesson), "expanded form digit / ten" (grade 2). An ELL or SEN reader cannot tell 3 words from 4 or 5. Fix (`vocab-pick3.js`): one word a line at every grade, as grade 4 already does, or a 0.75 pt divider between words. Never break a phrase across lines.
5. **Pick 3: the answer place is not in the same position in each cell** (C3, VQ-7, AX-4). The writing line runs 40-80 mm wide, as wide as each cell's longest word. Banks are one line or two, so the line's y moves by up to 6 mm. Row heights differ: 275 px for row 1 against 290 px for rows 2-3 (skill/L independent). Fix: one line width per page (the page's longest word) and one bank height per page, with rows equalised.
6. **Pick 3 guided: the model cell is 34 % empty and its row is 385 px against 285 px** (C3, H13). The picture and line positions also differ between cell 1 and cell 2. Fix: equal rows, with the grey hint placed in the same spot as the model's trace.
7. **Match 3 guided: unequal rows** (220/237/211 px at L p1), and about 29 % empty bands on p2 (C3). Fix: equal rows sized to the content.
8. **Screen picture text is illegible** (C1, H2):
   - pick3 worksheet-1280: In/Out digits and "5 × 1 = 5" at about 8-9 px.
   - pick3 quiz-1280: "2 → +3 → 5" at about 9 px.
   - match3 card-390: times-table digits at about 6 px.

   Fix (`screen-cell.js` twin): set the picture width from the cell (at least 60 % of cell width for pick3, at least 30 % per picture for match3), and clamp the picture text to at least 16 px. On a 390 px card, stack match3's pictures 1 a row or make them swipe.
9. **Pick 3 card-1280: the picture is about 95 px in a 720 px cell** (C3). The question is not the visual centre. Fix: as 8.
10. **Match 3 screen slots jump** (C1/C3). A box sits under a long word and beside a short one (card-820 "commutative"; worksheet-1280 cells 1, 3 and 4). In worksheet cell 3 the "product" box touches "unknown". Fix: always put the box under the word on screen, in a fixed-width column per word.
11. **Pick 3 instruction verb differs by host.** The cards say "Type its word on the line", while the worksheet and quiz say "Tap its word". The pills are tap targets (C1, BD-11). Fix: "Tap its word." on every screen host.
12. **Look-alike pairs give two right answers** (C2, M-V1):
    - term / sequence (grade 4, item 2);
    - count on / one more (grade 1 lesson, cell 3);
    - quotient picture prints "R 1" with remainder in the bank (grade 4 lesson, cell 4, and match item 1);
    - odd / identity share the ringed dot (L test, item 4).

    Fix: add these to `notWith` in `vocab-words.js`. Redraw quotient without "R 1", or with the remainder shown as a separate unboxed mark.
13. **Grade 2 pictures are too small to teach** (C2/C3): one is about 8 mm, the ten rod about 3 × 22 mm, in a 90 mm cell. Fix: as in "Pictures below 8", with the pick3 picture at the card's 40 mm.
14. **The footer says "Grade 3 · 3.OA.9" on the grade 1, 2 and 4 pages** (C4). Fix: the footer reads `vocabGrade` and the set's CCSS.
15. **Grade 1 pick3 cells 3 and 4: the picture sits mid-cell with about 25 mm empty above it**, unlike cells 1 and 2 (C3, CL-4b). Fix: top-start every cell.
16. **Lesson pilot: the "Name the picture" band repeats even and odd**, the two pictures just matched in item 1 above. The lesson's core words for "find products" are product and multiple (C2). Its two cells are each 95 × 105 mm holding a 25 mm picture (C3). Fix: choose the core words from the set's `core` list and not the first trio. Size the cells to the content, or print the pictures at the card's size.
17. **Grade 1 lesson Match row: 3-digit strips at about 10 pt** (C1 minor). Fix: the K-1 picture scale applies to Match cells too.
18. **Match 3: the Score reads /4 against 12 graded boxes** (C1 minor). Fix: /12, or state "/4 rows".

## (a) Automatic checks that would have caught these

- **ws-vocab-unit V-EA** (1, 3): for every role and item, the shown pupil work differs from `ans` when the key ticks Fix. The card's "offered" roles must render (precritic, coverage matrix).
- **ws-vocab-unit V-BANK** (4): no line of a bank holds parts of two entries unless a divider token sits between them.
- **ws-print-lint L-SLOTPOS** (5, 6, 7, 10): the answer slot's y and width vary by no more than 1 mm across one section, and row heights match within 1 mm.
- **ws-screen-slots picture-text floor** (8, 9): the smallest picture text on screen is at least 14 px, and the picture is at least 40 % of the cell's width.
- **ws-vocab-unit V-CLASH** (12): pictures that share a mark (box, ring, cross, arc) must be listed in `notWith`, using a mark tag on each picture.
- **ws-print-lint footer** (14): the footer's grade equals the item's grade option.
- **ws-screen-answer instruction-verb** (11): one screen verb per skill across hosts, and it must match the response type.

## (b) Speed-ups for the next round

- Render each picture at its **smallest real host width** (390 card, worksheet tile) on the contact sheet, not only at 34/40/74 mm. Half of the screen defects are picture size.
- Before the critic, run precritic with the card's §7a "offered" roles as a list. A declined offered role (3) should stop the lane before a critic round.
- Load Andika on the picture contact sheet so the critic grades the real type.
- Use one seed for each grade render and the lesson render. Then grade-1, 2 and 4 regressions show up as a diff against r1.
