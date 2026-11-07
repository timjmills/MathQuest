# lf-vocab critic r2 (fresh independent critic, Opus medium)

**VERDICT: FAIL. Minimum score: 7.** No page or host is below 7 and no hard cap applies. This round is a near-miss: every failed score is a 7, so a Q-S2 re-check is allowed.

Sizes: S and L in full; M spot-checked (independent, guided, more-practice key, lesson). I read every PNG in RENDERS_DIR. The key ink is INK-31. The lesson title and footer ("mult_chart") were ignored, as briefed.

## Scores (C1 / C2 / C3 / C4, caps)

| Group | Score | Caps |
|---|---|---|
| Picture library (47, at 34 / 40 / 70 mm) | 7 / 7 / 8 / 8 | - |
| Match 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Match 3: guided (S M L) | 8 / 7 / 8 / 8 | - |
| Match 3: error analysis (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Match 3: card-390, card-820, card-1280, quiz-1280 | 8 / 8 / 8 / 8 | - |
| Match 3: worksheet-1280 | 8 / 8 / 7 / 8 | - |
| Pick 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Pick 3: guided (S M L) | 8 / 7 / 7 / 8 | - |
| Pick 3: error analysis (S M L, keys) | 8 / 7 / 8 / 8 | - |
| Pick 3: card-390, card-820, card-1280 | 8 / 8 / 8 / 8 | - |
| Pick 3: worksheet-1280, quiz-1280 | 7 / 8 / 8 / 8 | - |
| Grade 1, 1 picture 3 words (L) | 8 / 8 / 8 / 7 | - |
| Grade 2 | 7 / 7 / 7 / 7 | - |
| Grade 3 (same page as skill L) | 8 / 8 / 8 / 8 | - |
| Grade 4 | 8 / 7 / 8 / 7 | - |
| Lesson vocab page, pilot (M, L) | 8 / 8 / 7 / 8 | - |
| Lesson vocab page, grade 1 | 7 / 8 / 8 / 8 | - |
| Lesson vocab page, grade 4 | 8 / 7 / 8 / 8 | - |

Match 3 pages print 4 a page, so each row is about 30 % empty at S. Q2 makes that owner-ruled capacity, so it is not charged.

## Pictures below 8

- **ten**: the rod is about 3 mm tall at 34-40 mm, with units about 3 mm. On the grade 2 page it is 33 × 3.4 mm in a 90 mm cell. Fix: rod at least 6 mm tall with units at least 5 mm, and draw the pick3 picture at the 70 mm scale.
- **one**: a lone empty square reads as "square" or "box". Fix: a unit cube with a top-face line, or a cube beside a grey ten-rod.
- **number name**: regular weight at about 10 pt, the lightest and smallest text on any page. Fix: weight 700, size equal to the expanded-form digits.
- **round up**: 3 full boxes plus 1 box with a dot, under a brace marked "4". That reads as the quotient (4 groups) as well as round up. Fix: draw a story-scaled picture (13 children, cars of 4, the 4th car heavy), or a number line with an arrow up to the next ten. Add the pair `round up`/`quotient` to `notWith`.
- **grow**: growing columns of squares are also a "sequence" or "pattern". Fix: add `grow`/`sequence` and `grow`/`pattern` to `notWith`.
- **identity, step, left: unchanged from r1** (rule M-V1):
  - identity still uses the ringed-dot mark that odd, one more and remainder also use;
  - step is two sheets;
  - left uses circles of about 3 mm.

  Fix: identity as "5 × 1 = 5" with the 1 boxed, or n + 0; step as a numbered staircase; left circles at least 5 mm.

## Defects (numbered)

1. **The footer reads "Grade 3 · 3.OA.9" on the grade 1, 2 and 4 pages** (C4 −1, class FRAME). Seen on grades/g1, g2 and g4 independent and their keys. The teacher footer names the wrong grade. Fix: the footer takes `vocabGrade`/`vocabSet` and that set's CCSS (vocab-pick3 provider footer). Check: a print-lint footer-grade test against the item's grade option. **This is r1 #14 and it persists.**
2. **The grade 2 pictures are too small to teach** (C1/C2/C3 −1 each, VQ-1, CL-4b):
   - the ten rod is 3.4 mm tall;
   - "one" is a 12 mm empty square;
   - "300 + 40 + 7" is at about 12 pt;
   - "number name" is at about 10 pt regular.

   Each sits in an 88 × 75 mm cell. Fix: as in "Pictures below 8", and size the pick3 picture by its content class so that its text is at least 16 pt. **r1 #13 persists.**
3. **Look-alikes still give two right answers** (C2 −1, M-V1):
   - grade 4 item 3: the grow picture with "sequence" in the bank;
   - grade 4 lesson cell 4: the round-up picture with "quotient" in the bank (the brace says 4).

   Fix: add both pairs to `notWith` in `vocab-words.js`. **r1 #12 is partly fixed:** quotient lost its "R 1", and term/sequence and count on/one more did not recur.
4. **Pick 3 guided: rows are unequal and the model cell is mostly empty** (C3 −1, H13 near-miss, AX-4):
   - S: row 1 is 405 px against 340 px for row 2, and cell 1's bottom band is 38 % empty;
   - M: 390 / 330 px;
   - L: 360 / 310 px.

   The extra height comes from the grey hint line in cell 2. Fix: give the hint a reserved slot in every cell, or put it inside the line's band, and equalise the rows. **r1 #6 persists.**
5. **Dead hints on the guided pages** (C2 −1, VQ-3, PEDAGOGY 4). Pick 3 says "Look at the picture." and Match 3 says "Look at pictures A, B and C." Both repeat the instruction and give no scaffold. Fix: a hint that names the cue, such as "Find the box with the heavy line." Or use the first letter of the answer's word in grey.
6. **The screen bank words are the smallest text in the cell** (C1 −1, SP-1, VQ-8). On pick3 worksheet-1280 and quiz-1280 the pill words are about 13 px, against a 22 px instruction and 28 px picture digits. On paper the bank is the 16 pt bold focus of the cell. Fix (`screen-cell.js`, pick3 bank pills): pill font at least 20 px at 1280 and at least 18 px on the worksheet tile, with pill height at least 48 px.
7. **Match 3 worksheet-1280: the word layout differs between cells** (C3 −1, RUBRIC C3 screen "consistent layout"). Cells 1, 2, 5 and 6 put the words 2 + 1 in a wrapped row. Cells 3 and 4 put 1 word a row, so the slots sit in different places. Fix: on the worksheet tile, always use 1 word a row with a fixed-width word column and the box in the same x. **r1 #10 is partly fixed:** the 390 card now stacks.
8. **Pick 3 error analysis: the wrong words are not misconceptions** (C2 −1, P-TH-13, card §6). The page shows "left" for equal groups and "step" for the factor picture, which no pupil would choose (S/M/L items 3 and 4). Fix: wrongAnswer = the M-V1 `notWith` look-alike, or an M-V2 same-sound or same-letter word (product → factor), or an M-V4 misspelling.
9. **Pilot lesson "Name the picture" cells** (C3 −1, CL-4b). Each cell is about 95 × 105 mm and holds a 30 mm picture with a 25 % top band. Fix: print the two cells at the pick3 grade-3 height (the band is then 2/3 of the height), or put the picture at the 70 mm scale. **r1 #16 is partly fixed:** the core words are now multiple and column.
10. **Grade 1 lesson, Match row: the 3-digit strip numerals are about 11 pt** (C1 −1, K-1 scale). They are the smallest working text for K-1. Fix: the K-1 picture scale applies to Match cells (strip cells at least 10 mm, digits at least 16 pt). **r1 #17 persists.**
11. **Minor, not scored below 8:**
    - Match 3 Score is /4 against 12 boxes (r1 #18 persists);
    - Match 3 error analysis names "Mia" in items 2 and 3.

## Round 1 defects

Fixed:
- 1: the error-analysis key is correct, and the Fix-it boxes are now labelled by word;
- 2: 3 a page;
- 3: pick3 error analysis now renders;
- 4: the bank prints one word a line;
- 5: one line width per page;
- 7: Match 3 guided rows are equal at L;
- 8: picture text on screen is legible, and card-390 stacks;
- 11: "Tap its word." on every pick3 host;
- 15: grade 1 cells start at the top.

Still seen: 6, 13, 14, 17 and 18 (in full), and 10, 12 and 16 (in part). 9 is improved and is now within 8.

## (a) Automatic checks that would have caught these

- **print-lint L-FOOTER-GRADE** (1): the footer's grade and CCSS equal the item's resolved grade or set.
- **ws-vocab-unit V-PICSIZE** (2, 10): the smallest text or stroke unit inside a placed picture is at least 14 pt print / 16 px screen, and the rod or unit measures at least 5 mm, at every grade scale.
- **ws-vocab-unit V-CLASH by mark tags** (3): pictures that share a structure tag (brace-count, grouped boxes, growing stack, ringed dot) must be pairwise in `notWith`.
- **L-SLOTPOS / row-equality** (4, 7): row heights within 1 mm across a section, including guided model rows; the same slot x and y offset on every worksheet tile.
- **V-HINT** (5): the guided hint string must not equal or be contained in the instruction.
- **ws-screen-slots bank-font floor** (6): the bank or pill font is at least 0.8 × the instruction font.
- **V-EA-PLAUSIBLE** (8): the error-analysis wrong word must come from `notWith` or the M-V2/M-V4 generators.

## (b) Speed-ups for the next round

- Render the grade 1, 2 and 4 pages with the screen hosts too, so grade-scale picture defects show on screen in the same round.
- Make the contact sheet print each picture's measured minimum text size and stroke unit next to it, so items 2 and 10 are numbers, not judgement.
- Re-check only defects 1-10, plus a 20 % fresh sample (Q-S2 near-miss: every failed score is a 7).
