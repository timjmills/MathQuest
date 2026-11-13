# lf-vocab critic r4 (independent, Opus medium)

**VERDICT: FAIL. Minimum score: 6** (H13 on Pick 3 error analysis at S). The other misses are 7s: Pick 3 guided at L, Match 3 error analysis at S, the picture library ("left"), and grade 2 ("number name" offered with "hundred").

I read every PNG I graded: the 3 picture sheets, all pupil pages at S, M and L for both skills (plus the keys for test L/M, EA L, guided), all 10 screen hosts, g1-g4 and the 4 lesson sets. Empty bands were measured with a per-cell row-ink scan: for each cell bounded by the page rules, the longest blank run as a share of the cell height. Owner rulings Q1, Q2, Q-A, Q-B and Q-C are applied and are not defects.

## Scores (C1 / C2 / C3 / C4)

| Group | Score | Caps |
|---|---|---|
| Picture library (47; 34 / 40 / 70) | 8 / 7 / 8 / 8 | - |
| Match 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - (bands 13-28 %) |
| Match 3: guided S, M, L | 8 / 8 / 8 / 8 | - (max 25 %) |
| Match 3: error analysis S | 8 / 8 / 7 / 8 | - (24 / 28 / 25 %) |
| Match 3: error analysis M, L | 8 / 8 / 8 / 8 | - |
| Match 3: card-390/820/1280, quiz-1280, worksheet-1280 | 8 / 8 / 8 / 8 | - |
| Pick 3: independent, more-practice, test (S M L, keys) | 8 / 8 / 8 / 8 | - |
| Pick 3: guided S, M | 8 / 8 / 8 / 8 | - |
| Pick 3: guided L | 8 / 8 / 7 / 8 | - |
| Pick 3: error analysis S | 8 / 8 / 6 / 8 | **H13** (30.1-30.2 % in all 4 cells) |
| Pick 3: error analysis M, L | 8 / 8 / 8 / 8 | - (24 %, 13 %) |
| Pick 3: card-390/820/1280, quiz-1280, worksheet-1280 | 8 / 8 / 8 / 8 | - |
| Grade 1, grade 3 (L) | 8 / 8 / 8 / 8 | - |
| Grade 2 (L) | 8 / 7 / 8 / 8 | - |
| Grade 4 (L) | 8 / 8 / 8 / 8 | - (27 %) |
| Lesson vocab page: pilot-M, pilot-L, props-L, grade2-L | 8 / 8 / 8 / 8 | - (grade2-L subject to OQ-1) |

## Pictures below 8

- **left** (C2, M-V1, library's own rule "the heavy mark is on the referent"). It shows six circles with two crossed out, but nothing marks the four that are *left*. A pupil reads it as "take away" or "cross out". "left" is also the direction word, so an ELL pupil has no anchor. Every other picture outlines what its word names (row, column, input, factor, ones digit). Fix (`vocab-pictures.js`): put a bracket under the four uncrossed circles, in the same style as the "repeat" bracket.
- **Base-ten one / ten / hundred: owner question OQ-1, not a fail.** They now share one unit, so r3 #8 is fixed. That unit is about 2.5 mm, though. On grade 2 at L, and in the grade 2 lesson (items 3 and 4), the "one" is a 2.5 mm speck in a roughly 95 × 100 mm cell, and the "ten" is a 25 × 2.5 mm sliver. They are legible, but they are the smallest drawings on any page and hard to see for SPED pupils. **OQ-1:** may the hundred be drawn larger than the picture box (e.g. a unit ≥ 5 mm, with the hundred given a taller cell, or drawn alone as a 10 × 10 grid at 50 mm)? Or should "one" and "ten" be drawn at a larger unit when they are dealt without a hundred on screen, which breaks shared scale only across items, never within one?
- All other 45 pictures are at 8 or better. Fixed since r3: distributive now has a clear gap at the split line, pattern uses a true "…", and grow is now in `notWith` with sequence and pattern.

## Defects

1. **Pick 3 error analysis at S breaks H13** (C3 → 6). S prints 4 a page in a 2 × 2 grid, with cells 435 px tall. The content ends under "correct answer", and each cell then has a 30.1-30.2 % empty band. M has the same layout at 24 %; L uses 1 column, 3 a page, at 13 %. Fix (`vocab-pick3.js` footprint, role error-analysis, size S): either 6 a page (2 × 3) with the cell height taken from the content, or the L layout (Correct / Fix it beside the picture) at S as well. Check: H13 band scan on EA at every size.
2. **Pick 3 guided rows are unequal at L** (C3 −1, AX-4). Row 1 (model plus hint) is 377 px and row 2 is 290 px. **This is r3 #6, and it persists.** S (373/374) and M (359/359) are equal. Fix: reserve the hint slot in every row at L, or give each row the tallest row's height.
3. **Match 3 error analysis at S: the cell is sized for L** (C3 −1, H13 "sized for a taller item than it holds", near-miss). S cells are 286 px, the same as L's 288 px, but S content is smaller, so the bands are 24 / 28 / 25 % (L: 10 %). Fix: take the EA cell height from the size's measured content (S ≈ 230 px), or fit 4 a page at S.
4. **"number name" is offered with "hundred" in the bank** (C2 −1, M-V2). On grade 2, item 3, the picture prints "three hundred forty-seven" and the bank holds "hundred". A pupil who copies a word they can see in the picture is rewarded with a plausible wrong answer. Fix (`vocab-words.js`): `'number name': notWith ['hundred']` and the reverse. Check: no bank word appears as a substring of the picture's own text.
5. **"left" picture** (C2 on the library; see above).
6. Nits (no score effect):
   - Picture letters are placed inconsistently: above the picture (B on Match 3 test L cell 1), beside it, or dropped low next to a short picture ("left", A on Match 3 EA L item 3). Fix: put the letter at a fixed top-left anchor of each picture slot.
   - Card-390 Match 3: the answer boxes follow the centred words, so they do not line up. On worksheet-1280 the words are right-aligned. Use that layout here too.
   - Match 3 EA S: "Mia wrote" is used on two items of one page. Do not repeat a name on a page.
   - Captions inside pictures vary from about 13 pt ("2 × 3 = 3 × 2") to about 22 pt ("5 × 1 = 5") within one cell. Set one caption size per picture slot.
   - The props lesson's I Can, "turn an array to multiply", reads oddly. It belongs to the lesson's owner, not this lane.

## Round 3 defects

| r3 # | Status |
|---|---|
| 1 Match 3 guided ≥ 30 % empty | FIXED (S 24 %, M 25 %, L 24 %) |
| 2 Guided score denominator | FIXED (/15 at S and M, /12 at L, per word) |
| 3 EA 2 a page, 35-40 % empty | PARTLY: Match 3 S/M/L and Pick 3 M/L are fixed (3 a page); Pick 3 S is now 30.1 % (#1), and Match 3 S is a near-miss (#3) |
| 4 worksheet-1280 layout | FIXED: fixed picture slots, stacked words or pills, slots at a fixed y on both skills |
| 5 Pick 3 hint does not discriminate | FIXED: it gives the meaning ("Its word means turn it round…") |
| 6 Pick 3 guided rows at L | PERSISTS (#2) |
| 7 Grade 4 write line | FIXED: about 54.5 mm measured, which fits "times as many" |
| 8 Base-ten scales | FIXED (shared unit); the size question is OQ-1 |
| 9 grow / sequence | FIXED (notWith) |
| 10 Lesson frames | FIXED: grade2-L "expand · 2.NBT.3", props-L "mult_properties · 3.OA.5" |

## (a) Automatic checks that would have caught each defect

- **#1, #3: H13 per size × role.** Run the band scan on every role at S, M and L, not only at the size the footprint was tuned at. Add a check that the cell height at S is ≤ 0.9 × the height at L when the content is smaller.
- **#2: L-ROWEQ for guided at every size.** It passes at S and M, so it is evidently run only there.
- **#4: V-SUBSTR.** No bank word may appear as a word in the picture's printed text (scan `vocab-pictures.js` text nodes against each word's possible banks).
- **#5: V-REFERENT.** Every picture whose word names a part must carry a heavy outline or bracket on that part. Make it a declared `referent` field that the unit test requires.
- **Nits: VQ-7 letter anchor.** The letter's offset from its slot's top-left corner is the same in every slot.

## (b) Speed-ups for the next round

- Put the 40-line per-cell band scan (column-aware: it splits on vertical rules) into precritic for all role × size PNGs. It found #1 and #3 in seconds. Column-blind scans miss 2-column pages.
- Most of the work is now stable. Next round, re-check only #1-#5 and OQ-1, plus a 20 % sample. Freeze the rest through the golden manifest.
- Get the owner's answer on OQ-1 before the rebuild, so the base-ten unit is changed once.
