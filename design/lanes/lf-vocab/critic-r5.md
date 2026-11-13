# lf-vocab critic r5 (independent, Opus medium)

**VERDICT: PASS. Minimum score: 8.** Every group scores 8 or better on all four criteria. No hard cap is hit.

What I read: all 3 picture sheets, cropped and read at full scale. All pupil pages and their keys for both skills, on independent, more-practice, test, guided (p1 and p2) and error-analysis, at S, M and L. All 10 screen hosts. Grades g1 to g4. The 4 lesson sets. I measured empty bands with a column-aware per-cell row-ink scan (`scratchpad/tools/band.py`), splitting cells on the page rules. Owner rulings Q1, Q2, Q-A, Q-B, Q-C and OQ-1 are applied and are not counted as defects. Answer keys were checked item by item, and every key is correct.

## Scores (C1 / C2 / C3 / C4)

| Group | Score | Caps | Measured |
|---|---|---|---|
| Picture library (47 pictures; at 34 / 40 / 70) | 8 / 8 / 8 / 8 | - | - |
| Match 3: independent, more-practice, test (S M L + keys) | 8 / 8 / 8 / 8 | - | bands 10-17 % |
| Match 3: guided S M L (p1 + p2) | 8 / 8 / 8 / 8 | - | bands ≤ 24 %; rows unequal (nit 1) |
| Match 3: error analysis S M L | 8 / 8 / 8 / 8 | - | S cells 217 px, bands 13-18 %; M 17 %; L 10 % |
| Match 3: card-390/820/1280, quiz-1280, worksheet-1280 | 8 / 8 / 8 / 8 | - | - |
| Pick 3: independent, more-practice, test (S M L + keys) | 8 / 8 / 8 / 8 | - | 16-18 % (pupil) |
| Pick 3: guided S M L | 8 / 8 / 8 / 8 | - | L rows 333 / 334 px |
| Pick 3: error analysis S | 8 / 8 / 8 / 8 | - | 6 a page (2 × 3), bands 14-25.6 % |
| Pick 3: error analysis M, L | 8 / 8 / 8 / 8 | - | 24.2 % (near-miss, as in r4), 13 % |
| Pick 3: card-390/820/1280, quiz-1280, worksheet-1280 | 8 / 8 / 8 / 8 | - | quiz 26 % |
| Grade 1, 2, 3 (L) | 8 / 8 / 8 / 8 | - | 15-22 % |
| Grade 4 (L) | 8 / 8 / 8 / 8 | - | 26.7-27.1 % (writing room, under 30) |
| Lesson vocab page: pilot-M, pilot-L, props-L, grade2-L | 8 / 8 / 8 / 8 | - | 5-21 % |

Why each 8 holds, in one sentence per criterion:
- **C1.** There is one print verb ("Write"), with screen verbs ("Type", "Tap") on screen. There is one slot shape per section: a letter box, or a line under a bank. Every slot is big enough to write in, and the pills and boxes are at least 44 px.
- **C2.** Every picture marks its referent. notWith now keeps look-alikes out of the same item. Every key is correct, and the hint gives the word's meaning without giving the answer.
- **C3.** Every band is under 30 %. Pages are full at the owner's counts, and keys are facsimiles of their pupil pages.
- **C4.** The pages use black, white and one grey, in Andika, with the full frame and the INK-31 key ink. The footer names the dealt set's standards (Q-A).

They are not 9s because of the nits below: the letter anchor, caption sizes, the answer-line y on guided pages, and a repeated pupil name.

## Pictures below 8

None. "left" is fixed: a bracket now sits under the four circles that are not crossed out, matching the "repeat" bracket. All 47 pictures are black and white, use 1.5 / 1 pt strokes, and never print their own word. "number name" prints "hundred", but `vocab-words.js:48,53` now keeps the two apart in both directions.

Pictures at 8 that I watched:
- "one" is a bare empty square, readable only in a base-ten context.
- "hundred chart" is a 3 × 3 excerpt. The step of 10 between rows carries it.
- "step" uses literal stairs numbered 1-2-3. It is never dealt with "grow", which is in another grade's pool.

## Round 4 defects

| r4 # | Status |
|---|---|
| 1 Pick 3 EA S H13 (30.1 %) | **FIXED**: 6 a page in 2 × 3; the largest band is 25.6 % |
| 2 Pick 3 guided rows unequal at L | **FIXED**: 333 / 334 px (S 373 / 374, M 359 / 359). The answer-line y still differs in row 1 (nit 2) |
| 3 Match 3 EA S sized for L | **FIXED**: S cells are 217 px (L 288), bands 13-18 % |
| 4 "number name" offered with "hundred" | **FIXED**: notWith both ways. g2 item 3's bank is ten / digit / number name |
| 5 "left" picture | **FIXED** (bracket under the remaining four) |
| Nit: letter anchor | **PERSISTS**: A sits at mid-height beside a short picture, while B and C sit top-left (Match 3 S independent item 3; card-1280 A at the baseline) |
| Nit: card-390 Match 3 boxes | **PERSISTS**: boxes follow the centred words (x ≈ 230 / 260 / 225 px). worksheet-1280 is right-aligned and correct |
| Nit: repeated pupil name | **PERSISTS**: "Mia wrote" twice on Match 3 EA S (items 3, 4); "Sam wrote" twice on Pick 3 EA M (items 1, 4) |
| Nit: caption sizes | **PERSISTS**: "2 × 3 = 3 × 2" and "3 × 5 + 3 × 2" print about 13 pt; "5 × 1 = 5" about 20 pt in the same row |
| Nit: props I Can | Out of lane (owned by the lesson) |
| **OQ-1** | **FIXED per ruling**: when an item has no hundred, the unit is about 7 mm (g2 "one" about 7.4 mm, "ten" 69 × 7 mm, lesson items 3 and 4 the same). When "hundred" shares an item with "one" and "ten" (grade2-L item 2), all three keep about 2.5 mm, one scale within the item, as ruled. |

## Defects (all nits; no score effect)

1. **Match 3 guided rows are unequal** (C3 nit, AX-4).
   - Where: page 1 at every size. S: model 252, hint row 267, plain row 227 px. M: 242 / 255 / 220 px. L: 295 / 316 px.
   - This is 15-18 %, under the roughly 30 % gap that cost r4 #2 a point.
   - Fix (`vocab-match3.js` footprint, role guided): reserve the hint line's height in every practice row on page 1, or give each row the tallest row's height.
   - Check: L-ROWEQ on guided, Match 3, at S, M and L.
2. **Guided answer line at a different y within a row** (VQ-7 nit). In row 1 of Pick 3 guided, the hint cell's write line is higher than the model's: L 560 vs 605 px, S 553 vs 585 px, M about 28 px apart. Fix (`vocab-pick3.js`): anchor the write line to the cell bottom in every cell, and put the hint below the bank but above the anchored line.
3. **Letter anchor** (VQ-7 nit, from r4). Put each letter at a fixed top-left offset of its picture slot.
4. **Card-390 Match 3 boxes do not line up** (nit, from r4). Use the worksheet-1280 layout: words right-aligned and boxes in one column.
5. **Repeated pupil name on an EA page** (nit, from r4). Draw the names without replacement within a page.
6. **Caption size varies within a row** (VQ-5 nit, from r4). Set one caption size per picture slot, the size of the smallest caption that fits.
7. **The lone "one" could be larger** (OQ-1 nit). On g2 item 1, the 7 mm square floats in a 93 × 73 mm cell. OQ-1 allows a larger unit for an item with no ten as well (for example, a 12 mm unit when only "one" is drawn). Check: the base-ten unit for an item = min(slot / extent) of that item's own blocks.
8. **Stale comment** (code nit). `js/modules/sheet/providers/vocabulary.js:9-11` still says Pick 3's wrong answer is "a bank word…". Since r2 #8 the code deals misspellings (M-V4), so the comment should say that. Note that every wrong item on the Pick 3 EA pages is therefore a spelling error, which is by design.

## Visual-quality questions (§6.1)

1. **Representation:** the drawing is a picture from the graphic library for each word. The relation drawn is the word's referent, with a heavy mark on it. Yes, in every cell.
2. **Live parts:** picture, letters, words and boxes, or picture, bank and line. All are live, with no dead track.
3. **One answer place:** a letter box beside each word, or one line under the bank. The line sits in the same place in every cell on independent pages. Guided pages have the y drift in nit 2.
4. **Type and stroke:** proportional Andika throughout. Strokes 1.5 / 1 pt, no hairlines (the hundred grid is 0.75 pt).
5. **Paper = screen:** the same pictures on the card, the worksheet and the quiz. The bank becomes pills on screen, as the card rules.
6. **Title:** "I Can match a math word to its picture", "I Can name a picture with its math word", and "Test A: …". All are sentences.
7. **Own renders:** both skills are graded on their own renders at grades 1-4. Pages at grades 2 and 4 are graded only at L independent (g2, g4), and in the lesson for grade 2.

## (a) Automatic checks that would have caught each item

- **Nits 1 and 2:** extend L-ROWEQ to every guided page × template × size, and add a VQ-7 check that the slot y within a row is within 2 mm across cells, model included.
- **Nit 3:** VQ-7 letter anchor. The letter's offset from its slot's top-left corner is equal in every slot, on paper and on screen.
- **Nit 4:** a screen-slot check that, at 390 px, the left x of the Match 3 answer boxes is within 4 px across the three words.
- **Nit 5:** a unit test that the made-up pupil names on one page are distinct.
- **Nit 6:** a unit test that each picture slot's caption text renders at one pt size.
- **Nit 7:** a base-ten unit test that the unit is computed from the blocks the item actually draws.
- **Nit 8:** a lint that a provider's header names the same misconception ids its `wrongAnswer` returns.

## (b) Speed-ups for the next round

- The band scan runs in seconds over all 80 print PNGs. Put it in precritic as a column-aware, per-role, per-size check that prints the row-height spread as well as the band. It would have flagged nit 1 before the critic.
- This lane is now stable. Freeze the renders in the golden manifest and re-grade only the changed pages plus a 20 % sample when the nits are fixed.
- Render g2 and g4 on more-practice and test as well, so the grade-band pages need no inherited grade (RC7).
