# Small fixes lane: independent critic, round 9

Branch `claude/sleepy-pasteur-psyvgl` at `e4aae4b5`. That commit is the round-2 fix for critic r8 defects D1–D4 (wide
`multiplication:count_by_tables` rows on screen). I compared it with its parent `810c0894` (an archive of that tree, served
through `MQ_ROOT`) where a before/after mattered.

The diff touches 3 product files:
- `count-row.js`: `twinWrapAll` sends every desktop row (fitting rows too) down the wrap path; boxes are
  `wrapEm × pt + 2.4` mm (separators 0.3 em) with a 4.6 mm gap; a Lines row with `twinWrap` gets its own wrap geometry (D3).
- `screen-cell.js`: `balanceWrap()` caps the wrapping line's `max-width` so the line breaks into even lines, re-run on
  `resize` and from a `ResizeObserver` on the cell; `countRowTwin` passes `twinWrapAll`.
- `worksheet.js`: a card holding a `data-mq-wrap` row is `mq-span-row` (the full grid width).

I ran one browser at a time. My scripts are in the critic scratchpad (`critic-r9/`):
- `measure.cjs`: per host, size and row: digit px, box width, widest-answer fit, numbers per line, left and right empty bands,
  arrow length, lead-in arrows on wrapped lines, swipe cue and overflow, page scroll, card size.
- `typecheck.cjs`: types right and wrong answers into the rows and checks them.
- `mixed.cjs`: the mixed-row worksheet, a mixed-skill worksheet (count rows + `addition:add_100_regroup`, both orders) and
  the resize sequence.
- `zoom.cjs`: 3x crops, arrow length and ink clearance. `paper.cjs`: the paper rows. `printeq.cjs`: print hashes.

The evidence PNGs are in `r9/critic-*.png` (the builder's own are `r9/screen-*.png`). I looked at every one.

## Gates and probes

| Gate | Result |
|---|---|
| `small-fixes-countrow-wide` | **OK**, 432 PASS, 0 FAIL |
| `small-fixes-countrow-caret` | **OK**, 304 PASS, 0 FAIL |
| `wave1-c2-phone` | **OK**, 469 PASS |
| `wave1-c2-sizes` | **OK** |
| `ws-boot-smoke` | **OK** |
| `ws-screen-slots` | **OK** (609 skills, 2436 host renders, 0 doubled answer areas, 0 paper verbs on screen) |
| `ws-code-snapshot` | **OK** (608 codes, 35 categories, +36 appended, nothing moved or deleted, 1870 option round trips) |

- **Print is byte-identical.** 144 `buildSheet` outputs (pupil page + key), parent against HEAD: rows default; 100,000 from
  1,000,000; 25,000; by 5; by 2; 100,000 + Lines; by 5 + Lines; the mixed rows; roles Independent, Opener, More practice;
  S/M/L; looks A and B; A4; seed 4242. Every hash matched (72 distinct outputs, so the options did take effect).
- **Typing and checking (builder caveat 1) work.** I re-ran them by hand-script: 1366x650, 1280x600, 768x1024 and 390x844
  (touch), on all 3 hosts, for 100,000; 25,000; by 5; by 2; 100,000 + Lines; once all right and once with the last answer
  off by 1. 120 cases, 450 checks, **0 FAIL**:
  - every number landed in its own box (Space between numbers on desktop, tap per box on the phone);
  - on desktop the last box was in view and not covered (`elementFromPoint` hits the input);
  - right: card score 1, worksheet "Score: 1/2" (card 2 left blank), quiz 100 %; wrong: card score 0 with the wrong box red
    and its wrong digit underlined, worksheet "0/2" with "try again." and the right boxes ticked, quiz 0 %;
  - no page errors.
  - Screenshots: `r9/critic-1366-card-100000-lines-wrong-checked.png`, `r9/critic-768-card-25000-wrong-checked.png`,
    `r9/critic-1366-worksheet-by5-wrong-checked.png`, `r9/critic-390-quiz-by5-right-checked.png`.
- **The ResizeObserver rebalance works.** One page per host, 100,000 row, resized 1366 → 768 → 1100 → 900 → 1366 → 600 →
  1366 (height 800). Every step rebalanced, digits stayed at 29 / 40 px, no cue, no overflow, page scroll 0:
  - worksheet 6+6 → 4+4+4 → 6+6 → 4+4+4 → 6+6 → 3+3+3+3 → 6+6;
  - card and quiz 3+3+3+3 → 2+2+2+2+2+2 → 3+3+3+3 → 3+3+3+3 → 3+3+3+3 → 2×6 → 3+3+3+3.
- **Other skills on a mixed worksheet still lay out.** Count rows + `add_100_regroup`, in either order, at 1366 and 768: the
  add cards keep their 3-column (1366, 372 px) or 2-column (768, 344 px) grid at 403 px tall, no overflow, page scroll 0, no
  errors; each count-row card takes a full row (`r9/critic-1366-worksheet-mixed-skills-add-first.png`,
  `r9/critic-768-worksheet-mixed-skills-rows-first.png`). With 4 add cards first, the 4th sits alone in its grid row before
  the full-width count cards. That is the grid's normal last-row shape for 4 items in 3 columns, not a layout fault.

## What the fix delivers (measured, seed 11)

Every desktop and tablet row below has its widest answer fitting every box, no swipe cue, no overflow, page scroll 0.

| Host | Row | 1366x650 / 1280x600 | 820x1180 | 768x1024 |
|---|---|---|---|---|
| Worksheet | 100,000 | 29 px, **6+6**, bands 6.8 / 5.0 %, card 1148x365 | 29 px, 4+4+4 | 29 px, 3+3+3+3 |
| Worksheet | 25,000 | 29 px, **6+6**, 13.7 / 11.9 % | 29 px, 4+4+4 | 29 px, 4+4+4 |
| Worksheet | by 5, by 2 | 29 px, **12 on one line**, 9.8 / 7.9 %, card 1148x294 | – | 29 px, 6+6 |
| Worksheet | 100,000 + Lines | 29 px, 6+6 | 29 px, 4+4+4 | 29 px, 3+3+3+3 |
| Card | 100,000 (and + Lines) | 40 px, 3+3+3+3, 5.7 / 4.5 % | 40 px, 3+3+3+3 | 40 px, **2+2+2+2+2+2, right band 31.8 %** |
| Card | 25,000 | 40 px, 3+3+3+3, 5.7 / 18.9 % | 40 px, 3+3+3+3 | 40 px, 3+3+3+3 |
| Card | by 5, by 2 | 40 px, 6+6 | – | 40 px, 6+6 |
| Quiz | 100,000 (and + Lines) | 40 px, 3+3+3+3, 5.4 / 1.5 % | 40 px, 3+3+3+3 | 40 px, **2+2+2+2+2+2**, 20.3 / 16.1 % |
| Quiz | 25,000; by 5; by 2 | 40 px, 3+3+3+3; 6+6 | 40 px, 3+3+3+3 | 40 px, 3+3+3+3; 6+6 |

- **D1 is fixed.** The worksheet's wide row is now 6+6 at 29 px in the wide card, 365 px tall instead of 1,128 px, and
  lines up in columns (`r9/critic-1366-worksheet-100000.png`).
- **D2 is fixed.** Every row of the mixed worksheet is at 29 px, and no card is stretched: cards are 294 or 365 px, each in
  its own full-width grid row (`r9/critic-1366-worksheet-mixed-rows.png`). See E1 for the two shapes.
- **D3 is fixed.** 100,000 + Lines is 40 px on the card and quiz and 29 px on the worksheet, wraps 3+3+3+3 / 6+6, never
  swipes, and its inputs fill exactly their lines (`r9/critic-1280-quiz-100000-lines.png`).
- **D4 is fixed.** The gate now checks numbers per line, the right band, card heights, a mixed-row sheet and Lines. It only
  runs at 1366 and 1280, which is how it missed E2.
- **The phone (390)** is unchanged from the parent, as TY-10b says it should be: worksheet 16.1 / 18.8 px, card and quiz
  14.6 / 17.0 px for 100,000 / 25,000, 29 px for fitting rows, swiping with the cue (`r9/critic-390-worksheet-100000.png`,
  `r9/critic-390-card-by5.png`).

## Defects

**E1 · Medium · Online worksheet, desktop: a fitting row (by 2, 5, 10 …) is drawn as 12 numbers on one line, where paper and
the card draw two lines of six.**
Repro: 1366x650 or 1280x600, worksheet, `opts:{rows:[{step:5}]}`.
The row is one 1,000 px line of 12 (`r9/critic-1366-worksheet-by5.png`). The paper page draws the same row 6+6 with a turn
arrow (`r9/critic-paper-M-by5.png`), and the practice card and quiz at the same width draw it 6+6
(`r9/critic-1366-card-by5.png`). On the mixed-row worksheet the by-5 cards are a 294 px strip of 12 while the 100,000 and
25,000 cards beside them are 365 px rows of 6+6. So one skill on one sheet shows two layouts
(`r9/critic-1366-worksheet-mixed-rows.png`).

This breaks the standard in so many words:
- **TY-10a:** "Every count-by row is exactly two lines of six numbers (the 15-number long row is three lines of five)."
- **SL-3a:** "On SCREEN Lines wraps 6 + 6 like Boxes …; 12 on a line is a paper rule." That is, 12 on a line belongs to paper
  at Size S, never to the screen.
- **L5 (paper ≠ screen):** in 6+6, 35 stands under 5 and 40 under 10, so the pupil can see each line add 30. A 12-wide row
  loses that column structure.
- **RUBRIC C3:** "a consistent layout for every item of one skill."

It does not trigger H13: the bands are 9.8 / 7.9 %.

*What a fix must do:* `balanceWrap` should never put more than half the row on a line: at most 6 for 12 numbers, 5 for 15.
That needs care, because a centred 6+6 by-5 row (about 460 px) in the full-width 1,086 px cell leaves about 29 % each side,
which is right at the H13 line. Either measure it or give fitting rows a narrower card: a 2-column worksheet grid holds 6+6
at 29 px.

The gate should then fail:
- any screen line holding more than half the row's numbers;
- a mixed-row sheet whose cards are not all the same line shape where the width allows it.

**E2 · High (cap H13 on the card) · Tablet 768: a 100,000 row on the practice card and the quiz drops to 2 numbers to a line.**
Repro: 768x1024, card or quiz, `opts:{rows:[{step:100000, start:'custom', at:1000000}]}` (also with `spaces:'line'`).
The row is 6 lines of 2, 570 px tall (`r9/critic-768-card-100000.png`, `r9/critic-768-card-100000-lines.png`):
- **Card:** the row is left-aligned in a 678 px cell, which leaves a **31.8 % empty band down the right** (H13, C3 ≤ 6). It
  reads as a list, not a row.
- **Quiz:** the 662 px cell centres the row, so the bands are 20.3 / 16.1 % and do not hit H13. But it still has 2 to a
  line, below the 3-to-a-line minimum D1 set.

At 820 the same row is 3+3+3+3 (`r9/critic-820-card-100000.png`). Three 196 px boxes miss the 768 cell by only a few pixels:
the lead-in lane plus two gaps.

The gate missed this because it mounts only 1366, 1280 and 390, and the brief and the RUBRIC both name a tablet width.

*What a fix must do:* get 3 numbers onto each line at 768, or centre the row so no band reaches 30 %. A row must never
shrink to do it. Add 768 (and 820) to `small-fixes-countrow-wide`, with the same per-line and band checks.

**E3 · Low · The first balance and a resize can disagree.** At 768 the freshly loaded worksheet 100,000 row is 3+3+3+3
(at 1024 tall). After a resize to 768 (at 800 tall) the same row is 4+4+4. Both are balanced and both fit. I did not trace
the cause. Look at it with E2.

## The builder's five caveats

1. **Typing and checking were not re-run by hand.** I re-ran them: 120 cases on 4 sizes and 3 hosts, right and wrong, all
   correct (see above). Closed.
2. **Every count-row card takes the full worksheet width, even on a by-5-only sheet.** This is acceptable as it stands.
   The by-5 strip's bands are 9.8 / 7.9 %, the card is not stretched (294 px), and add or subtract cards on the same sheet
   keep their own grid. But it is tied to E1: once the row balances to 6+6, a full-width card leaves about 29 % each side.
   The E1 fix has to settle the card width too.
3. **Screen line breaks differ from paper (by 5 is 12 to a line on the worksheet but 6+6 on paper), and the turn arrows on
   wrapped lines are gone.** My ruling against L5 and the standard:
   - **The 12-wide by-5 row is not acceptable. The screen should balance to 6+6, as paper does.** TY-10a and SL-3a both say
     so explicitly, the card already does it, and a mixed sheet now shows two shapes for one skill. This is E1.
   - **The missing turn arrow is acceptable (a nit).** Every wrapped line on screen starts with a lead-in arrow in its left
     lane: 1/1, 3/3 and 5/5 wrapped lines measured. So the reading order from the end of one line to the start of the next
     is shown, as on paper, where the second line also starts with a lead-in arrow. The screen line is one continuous wrap,
     so a hook at the line end would have to move on every rebalance. It is not needed for C1 or C2.
4. **The arrows are shorter than on paper.** This is a nit, not a defect.
   - **Length:** 11.9 px at 29 px digits and 16.5 px at 40 px, which is 0.41 em. The paper arrow at M is about 0.6 em.
   - **Shape:** at 3x zoom each arrow has a visible shaft and head (`r9/critic-zoom-1366-worksheet-w100k.png`,
     `r9/critic-zoom-1366-card-w100k.png`). They read as arrows, not bullets.
   - **Clearance:** 4.8 px (worksheet) and 6.3–6.6 px (card) from both neighbours' text boxes. That is about 1.0 mm at the
     row's own scale, which is SL-3a's floor for a narrow gap.
5. **Wide phone rows are still about 14.6 px (TY-10b, left for the owner).** Agreed. It follows the letter of TY-10b ("A
   number too wide for six boxes still shrinks under TY-10a"), and the lane should not change that rule alone. I repeat the
   r8 note for the owner: at 14.6 px the row's digits are smaller than the instruction above them, which breaks TY-10's
   size order. Now that the screen can wrap, the owner may want the phone to wrap as well.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity), `count_by_tables` rows

| Host | Version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|
| Practice card 1366 / 1280 / 820 | Boxes: 100,000, 25,000, by 5, by 2 | 8 | 8 | 8 | 8 | pass. Wide rows 3+3+3+3 and fitting rows 6+6 at 40 px; arrows short (nit). |
| Practice card 1366 / 1280 / 820 | Lines, 100,000 | 8 | 8 | 8 | 8 | pass (D3 fixed) |
| Practice card 768 | Boxes and Lines, 100,000 | 8 | 8 | **6** | 7 | **FAIL (E2, H13)** |
| Practice card 768 | 25,000, by 5, by 2 | 8 | 8 | 8 | 8 | pass |
| Quiz 1366 / 1280 / 820 | Boxes and Lines, all rows | 8 | 8 | 8 | 8 | pass |
| Quiz 768 | Boxes and Lines, 100,000 | 8 | 8 | **7** | 8 | **FAIL (E2: 2 to a line)** |
| Quiz 768 | 25,000, by 5, by 2 | 8 | 8 | 8 | 8 | pass |
| Online worksheet 1366 / 1280 | 100,000, 25,000, 100,000 + Lines | 8 | 8 | 8 | 8 | pass (D1 fixed) |
| Online worksheet 1366 / 1280 | by 5, by 2 | 8 | 8 | 8 | **7** | **FAIL (E1)** |
| Online worksheet 1366 / 1280 | mixed rows, 6 problems | 8 | 8 | **7** | **7** | **FAIL (E1: two layouts for one skill)** |
| Online worksheet 768 / 820 | all rows, mixed rows | 8 | 8 | 8 | 8 | pass |
| Online worksheet, mixed skills (+ add_100_regroup) | 1366 / 768 | 8 | 8 | 8 | 8 | pass; the add cards are unaffected |
| Phone 390, all 3 hosts | Boxes and Lines | 8 | 8 | 8 | 8 | ok under the TY-10b exception (unchanged; caveat 5 is for the owner) |
| Print | all roles, sizes, looks | n/a | n/a | n/a | n/a | byte-identical to the parent |

Reasons:
- Card at 768: C3 is 6 because H13 caps it (31.8 % right band). C4 is 7 because a 6 × 2 list does not look like the
  workbook row.
- Quiz at 768: C3 is 7 because 2 to a line in 6 lines is a real layout defect, but no single band reaches 30 %.
- Worksheet by 5 and by 2 on desktop: C4 is 7 because the screen breaks TY-10a and SL-3a and differs from paper (L5).
- Mixed-row worksheet: C3 is 7 because one skill shows two card layouts.

## Verdict

**FAIL.**

**What passes:**
- r8's D1–D4 are fixed: the worksheet's wide row is 6+6 at 29 px, the mixed sheet has no stretched cards and one digit
  size, wide Lines rows wrap at the host size without a swipe, and the gate checks lines, bands and heights.
- Typing and checking work on every host and size, with right and wrong answers.
- The ResizeObserver rebalances correctly both ways.
- Add and subtract skills on the same worksheet are unaffected.
- The phone is unchanged, print is byte-identical, and every gate passes.

**What fails:**
- **E1:** on the desktop worksheet, fitting rows are 12 to a line, against TY-10a, SL-3a, paper and the card's own 6+6, so
  a mixed sheet shows two layouts.
- **E2:** at 768, the card and the quiz drop a 100,000 row to 2 to a line, and on the card that leaves a 31.8 % right band
  (H13).
