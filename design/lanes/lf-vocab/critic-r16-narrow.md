# lf-vocab rounds 15 and 16: narrow critic r16

Critic: independent, Opus medium. I graded from the renders in this folder and the manifests, and read prior notes in critic-r14-narrow, critic-r5 and status r15/r16. I ran no browser scripts.

## Hosts (card-390/820/1280, worksheet-1280, quiz-1280, independent keys): 8 · 8 · 8 · 8. Caps: none.
- At 390 px the Match 3 boxes sit in one column (left edge x ≈ 215 px for all three words, before and after answering).
- The blue next box is on the first Match 3 box and on the pick3 answer line only. It never appears on a pill or on a red box.
- Wrong answers are red and dashed. Right answers are green and ticked.
- The letter sits top-left on the card, quiz and print hosts. On worksheet-1280 (pictures stacked in one column) it is mid-left (defect 1).

## Answered (right and wrong, three hosts, both skills): 8 · 9 · 8 · 8. Caps: none.
- The explanation names each referent, and each referent is drawn.
- Only the wrongly matched pictures glow. The pick3 right pill glows yellow, and the wrong word stays red on the line.

## Roles S and L (independent, guided, error analysis, review, with keys)
| group | C1 C2 C3 C4 | caps |
|---|---|---|
| Match 3 independent S/L + keys | 8 8 8 8 | - |
| Match 3 guided S/L | 8 8 8 8 | - (Guided at L ruling open, not scored) |
| Pick 3 independent S/L + keys | 8 9 8 8 | - |
| Pick 3 guided S/L | 8 8 8 8 | - |
| EA both skills S/L (out of the pass bar, checked for names) | 8 8 8 8 | - |
| Review both skills S/L (own items) | 8 8 8 8 | - |

Measured:
- Match 3 guided S rows: 250 / 248 / 250 px. Guided L rows: 287 / 290 px.
- Pick 3 guided write lines: S row 1 at 612 / 612 px, row 2 at 982 / 982 px. L at 617 / 617 px and 952 / 952 px. Rows are 370 / 370 px (S) and 335 / 335 px (L).
- Match 3 review L draws about 46 mm in its cell, inside the 50 mm footprint.

## Sets 6 and 7 (both skills, pupil and key, all 18 dealt banks): 8 · 8 · 8 · 8. Caps: none.
For each bank I asked whether a pupil could defend another of its words.
- Set 6: the sequence is 4, 7, 10… (ones digits 4, 7, 0, no repeat), so "cycle" is no longer defensible in {product, sequence, cycle}. The repeat picture (2 4 8 2 4 8) is never dealt with cycle.
- Set 7: [30], 26, 22 falls, so "grow" is not defensible in {grow, first term, repeat}.
- Weak readings, not counted: "rule" for 12 = 3 × 4, and "grow" for 2 4 8.
- No bank has a defensible second word.

## Hundred chart key (r15): 8 · 8 · 8 · 8.
- Only the middle row is grey, and the grey lies inside its cells: no lobes and no specks.
- A pupil-drawing nit is noted in defect 4.

## Identify lesson band and picture library: 8 · 8 · 8 · 8. Both are unchanged and clean.

## Re-checks
| item | result |
|---|---|
| r14-1 sequence / cycle, G4 first term (V-ONES) | **FIXED** |
| r14-2 hundred chart key (V-KEY) | **FIXED** |
| r14-3 repeated trio, new picture order (V-PAGE) | **FIXED** as specified. Set 6 items 2 and 3 now differ, but cycle stays B in both (defect 2). |
| r5 letter anchor (V-LETTER) | **PARTLY**: top-left on print, card and quiz; mid-left on worksheet-1280 |
| r5 card-390 box column (V-BOX390) | **FIXED** |
| r5 repeated pupil names (V-NAMES) | **FIXED**: Sam/Ana/Mia/Omar; Sam/Ana/Leo; Sam/Ana/Leo/Mia/Omar/Zara |
| r5 caption size per row (V-CAPTION) | **FIXED**: "5 × 1 = 5" and "3 × 5 + 3 × 2" print at one size |
| r5 guided line y (V-GLINE) | **FIXED** |
| r5 guided rows equal (V18M) | **FIXED** |
| r5 review L footprint, pin removed | **FIXED** |

## Defects (all minor; none changes a score)
1. **C4 nit: the letter anchor differs by host.**
   - What: on worksheet-1280 the A/B/C letter is centred on its picture's height. Every other host puts it top-left.
   - Fix: in the stacked Match 3 layout, align the letter's top with the slot top.
   - Check: run V-LETTER on all three screen hosts as well as print. The letter top must be within 2 px of the slot top, and the offset equal across hosts.
2. **C1 nit: a repeated trio keeps one letter.**
   - What: on set 6 Match 3 (G4), items 2 and 3 show the same trio, and cycle is B in both. A pupil can copy one answer from the item above.
   - Fix: when a trio repeats, choose a derangement: no picture keeps the letter it had in an earlier cell of that trio, where 3! allows it.
   - Check: tighten V-PAGE so that no (picture, letter) pair repeats between two cells of the same trio on a page. Backtest it against set 6 independent p1.
3. **Out of lane, routed, not scored: the Mixed Review on Match 3 Review S.** This section is not graded (the rubric scope note, §8e). It owns no lane item, but it prints on this skill's page.
   - What: it deals definition items from `data-vocabulary.js` under the header "Draw a line to match." Each item is really "Which word…? Answer: ___", so the instruction does not fit the task.
   - It prints speaker icons on paper.
   - Its content is Grade 6–7 (speed, scale drawing) on a Grade 3 page.
   - Fix (owner: the review composer or the definitions skill): take the section instruction from the items dealt; strip the speaker controls from print; limit the mixed pool to the host skill's grade ± 1.
   - Check: a print lint that each section's instruction verb matches its slot kind; a check that no speak or speaker element appears in the print DOM; and a check that the mixed-pool grade is within ± 1 of the host.
4. **C3 nit: tight 3-digit cells.**
   - What: in the hundred chart and the before/after/count-on strips (pupil drawing), the digits of 104, 114 and 106 almost touch the cell borders.
   - Fix: widen the cells to fit the number of digits, or drop the text size one step.
   - Check: the glyph bbox must sit at least 1 mm inside its cell rect, with a backtest on the hundred chart picture.

## Verdict: PASS. Minimum score 8.

## Speed-ups
- Add a host column to the V-LETTER result, so a check that runs only on paper is caught at build time.
- Render the review pages' mixed sections in a contact sheet per host skill, so that sections owned outside the lane are visible to their owners.
