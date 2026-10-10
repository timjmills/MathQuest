# Small fixes lane: independent critic, round 3

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `27015cf`. The diff graded is `72e05d7..HEAD`. Chromebook sizes come first
(1366x650 and 1280x600). The phone at 390 got a basic check only (STATUS §00). I ran one browser at a time. Evidence is in `r3/`.

**Gates and probes I re-ran. All of them are OK:**
- `small-fixes-countrow-caret`: quiz, card and worksheet × default, by 25, by 25 Lines and by 7, at 1366, 1280 and 390.
- `small-fixes-equiv-frac`, `small-fixes-quiz-wordrow`, `small-fixes-xp-burst`, `small-fixes-no-start-toast` and `wave1-a3-wrongdigits`.
- `hint-popup-e2e` with `MQ_BASE` set to a `python3 -m http.server`.
- `small-fixes-model-pages` with `MQ_BASE_ROOT` set to an archive of `72e05d7`. It covers 156 sheets. No page count rises, and the
  scripted model is byte-identical to main.

**My own checks.** Each one is a script in the critic's scratchpad.
- **Count-by caret, adversarial.** Hosts: quiz, card and worksheet, at 1366x650 and 1280x600. Rows: by 3 (mixed lengths), by 7 and
  by 25 Lines. For each, I typed with Tab after each number and with Enter after each number. I followed the instruction literally,
  with Space after every number and 300 ms between keys. I typed a wrong number and then Space, typed with no separator, typed a
  number that is too long into the last box, corrected a box I had already filled, and pressed Space into a box that was already
  filled. I ran the Tab and Enter cases on a `72e05d7` checkout too, for comparison.
- **Print sweep.** `buildSheet` → `sheetDocument` was rendered in Chromium and measured: ink outside its cell, the largest empty band
  in each cell, where the content ends, and the blank depth above the footer. Roles: opener and scripted model. Variants: default,
  one page, Lines, Lines + one page, step 25, step 25 + one page, 1,000 from 14,000 (with and without one page), step 25,000 (with
  and without one page), 100,000 from 1,000,000 (with and without Lines), and times under each. Each ran at S/M/L on A4 and
  Letter, so 156 sheets. The same sweep ran on main. I looked at the PNGs of 15 pages.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret: separators, row-wide digit count, overflow on | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass (N10, N11 nits) |
| 1 | | Practice card 1366/1280 | **7** | 8 | 8 | 8 | FAIL (N7) |
| 1 | | Online worksheet 1366/1280 | **7** | 8 | 8 | 8 | FAIL (N7) |
| 1 | | Phone 390, tap and type (basic; probe) | 8 | 8 | 8 | 8 | ok |
| 2 | Word hint in flow; Listen as a plain text button | Card 1366/1280 (66 skills, e2e) | 8 | 8 | 8 | 8 | pass (N6 fixed) |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card / worksheet / quiz | 8 | 8 | 8 | 8 | pass (probe OK) |
| 4 | Quiz word rows restore | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass (probe OK; O1 out of lane) |
| 5 | +XP burst | Card / boss / race | 8 | 8 | 8 | 8 | pass (probe OK) |
| 6 | No start toast | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass (probe OK) |
| 7 | Scripted model | All 13 variants × S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (N3 fixed: byte-identical to main) |
| 7 | Opener, row with boxes | default, by 25, 1,000 from 14,000, 25,000, 100,000, times-each (S/M/L, A4/Letter) | 8 | 8 | 8 | 8 | pass |
| 7 | Opener + one page (boxes) | 1–12, by 25, 14,000, 25,000 (S/M/L, A4/Letter) | 8 | 8 | 8 | 8 | pass (foot blank under PT-OPN-7/PT-ENG-3) |
| 7 | Opener, Lines | S A4/Letter, M A4 | 8 | 8 | **6** | 8 | FAIL (N9) |
| 7 | Opener, Lines + one page | S/M/L, A4/Letter | 8 | 8 | **6** | 8 | FAIL (N9, at the 30 % line) |
| 7 | Opener, Lines | M Letter | **7** | 8 | **5** | 8 | FAIL (N8, N9) |
| 7 | Opener, Lines | L A4/Letter; 100,000 + Lines at all sizes | 8 | 8 | 8 | 8 | pass |

Opener, compared with main: main overflowed every opener variant (18–22 ink-out elements) and left 85–161 mm blank. HEAD has 0 ink
out on all 78 opener sheets. Content ends at 73–97 % of the frame, and every sheet stays 1 page.

## Round 2 defects

| ID | Status | Evidence |
|---|---|---|
| N1 | **Fixed.** Nothing moves on a pause or from the box's own answer. Every box has `data-mq-max` and a maxlength equal to the row's widest number, the same for every box. Slow typing (750 ms per key) with Space lands one number per box on every host. | caret probe; my 300 ms literal run |
| N2 | **Fixed in the quiz.** Space, comma, Enter and Tab all move on. A digit past the row's width goes on to the next empty box, except in the last box (N10). | adversarial run, quiz rows |
| N3 | **Fixed.** The scripted model is byte-identical to main for all 78 combinations, and its page counts match main. | `small-fixes-model-pages` OK; `r3/print-scripted-default-M-a4.png` |
| N4 | **Fixed for rows with boxes.** One-page rows are sized to the drawn row. The 2nd Guided row is added at 1 column (PT-OPN-6), and there are 2 Independent rows. The foot is blank only where PT-OPN-7 stops the page. **Not fixed for Lines rows: see N9.** | `r3/print-opener-25000-onepage-L-a4.png` |
| N5 | **Fixed.** The step tab now stands above a long row. The 100,000 Model at L uses lines of 2 at about 16 pt and does not shrink. | `r3/print-opener-100000-L-a4.png` (main: `-MAIN.png`, overflowing) |
| N6 | **Fixed.** "Listen" is Andika, black on white with a 2 px black border, 44 px tall. | `r3/hint-listen-add_word-1280x600.png` |

## New defects

**N7 · Medium · Fix 1 (card and worksheet): Enter or Tab after a right number skips a box. Every later number lands one box off.**
Repro: practice card at 1280x600, `multiplication:count_by_tables`, opts `{rows:[{step:3,start:'step',dir:'up'}]}`, seed 11. The
blanks are 9, 21, 24, 27 and 36. Click the first box and type `9`. The box turns green and the owner rule moves the caret to box 2.
Now press Enter, as the lane says Enter moves on. The caret moves again, to box 3. Typing the rest gives `9 | (empty) | 21 | 24 | 27`
with Enter, and `9 | 36 | 21 | 24 | 27` with Tab. The worksheet is the same (`9 | | 15 | 21 | 27`). Space does not have this problem,
because the Space handler ignores an empty box. The quiz does not have it either, because it has no green hand-on.
The double move also happens on main, but this lane owns the count-row caret, and its rule names Enter and Tab as keys that move on.
Enter is the key these pupils press by habit, and the card already uses it to check an answer. *What a fix must do:* Enter, Tab or a
comma pressed in an **empty** box that the caret has just been handed to must do nothing, as Space already does. Add Enter and Tab
runs on the card and the worksheet to `small-fixes-countrow-caret`.

**N8 · Medium · Fix 7: the Opener with Lines at M on Letter draws an empty boxed Independent cell.**
Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables', opts:{spaces:'line'}}]}],
size:'M', paper:'Letter', seed:4242})`. The fits line reads "1 model, 2 guided, 1 independent", and the Score is /1. The Independent
band is still drawn with 2 rows: row a holds the ×5 row, and row b is a 25 mm bordered box with nothing in it and no letter
(`r3/print-opener-lines-M-letter-EMPTY-CELL.png`). That is about 17 % of the page. A pupil sees an empty box with no task (C1), and
the space is wasted (C3 ≤ 5). In the plan, `gridPart(indep, {rows: g.iRows})` draws `iRows` rows even when the pool gave fewer items.
*What a fix must do:* draw `ceil(indep.length / gc)` rows. If the pool has fewer items than `counts()` asked for, re-fit the band.
Better, find out why the pool comes up one short at M Letter Lines. Add an assertion to the gate that no cell is empty.

**N9 · Medium · Fix 7: on the Opener, Lines rows at S and M float in cells with a 34–39 % empty band (H13, C3 ≤ 6).**
The Lines row is short: digits and a line, about 9 mm. The cell is the measured row plus the full 8 mm PT-ENG-3 grow, so the row
sits in the middle of a cell about twice its height. Measured empty bands (largest of top and bottom, as a share of cell height):

| Version | Cell (mm) | Band |
|---|---|---|
| Lines S, A4 and Letter | 22.7 | 0.37 (0.39 from the PNG) |
| Lines M, A4 | 24.8 | 0.34 |
| Lines M, Letter | 24.8 | 0.34 |
| Lines + one page, S/M/L, A4 and Letter | 20.7 | 0.30 |

For comparison, rows with boxes measure 0.10–0.27, so they pass. PT-ENG-3 allows *at most* 8 mm of growth per row. It does not
require 8 mm, so H13 still applies to the grown cell. Evidence: `r3/print-opener-lines-S-a4-band37.png` and
`r3/print-opener-lines-onepage-S-a4.png`. *What a fix must do:* cap the grow per row so that no band reaches 30 % of the cell. For
example, use grow ≤ (0.6 × drawn row − pads), or spend the growth on the line slot's writing height instead of air. Any spare height
then stays blank at the foot, as PT-ENG-3 allows. Add the band measurement (H13) to the page-count gate for the opener.

**N10 · Low (does not fail) · Fix 1: a digit typed past the row's width in the *last* box is dropped silently.** For example, `3000`
typed into the last box of a by-25 row shows `300`, on every host. The same happens when every box after the current one is
already filled. The brief says digits are "never dropped". *What a fix should do:* let the last box take one extra digit, which the
pupil can see and which is marked wrong. Or keep the digit and flag the box.

**N11 · Low (does not fail) · Fix 1, card: Space from a box into a following green (locked) box sends the caret back.** The next
digit can then replace the box's content. Repro: on the card, by 7, box 1 holds a wrong `58` and box 2 is green. Click box 1, press
End and Space, then type `9`. Box 1 becomes `9`. The "58" is overwritten without the pupil choosing it. *What a fix should do:*
Space should skip green boxes and go to the next empty box (`nextEmptyBox`), the same way overflow does.

**Trade-off I accept (judged as asked):** when a mixed-length row is typed with no separator, the digits land in the wrong boxes,
but none is lost. In the quiz, `9 12 15…` typed straight on gives `92|12|42|…`. Under every row there is a black Andika line that
says "After each number, press Space." On touch it says "tap the next box" instead. Its size matches the instruction text (19–21 px),
it sits inside the cell, and it shows on all three hosts (`r3/caret-*-by3-1280x600-fresh.png`). The pupil can see the misplacement
and fix it, and no rule could avoid it without telling the answer's length. Rows of same-length numbers typed straight on land
correctly. On the card and the worksheet, the green hand-on covers right answers (it depends on timing for very fast typing on the
worksheet). I do not mark it down.

**Out of lane (unchanged):**
- O1: green marks on live work in the quiz.
- O2, new note, also on main: in the 1-column Guided row at 100,000 from 1,000,000, the given numbers are about 9 pt at L, and each
  answer box is about 14 mm for a 9-character answer (`r3/print-opener-100000-L-a4-MAIN.png` shows the same). This belongs to the
  count-row full-line geometry, not to this lane.

## Verdict

**FAIL.** These pass: fixes 2–6 (no regressions), the quiz part of fix 1, the scripted model, and every Opener with boxed rows,
including one page. N1–N6 are fixed (N4 for boxed rows only). Three things still fail:
- N7 on the card and the worksheet (C1 7): Enter or Tab after a right number skips a box.
- N8 at Opener Lines M Letter: an empty Independent cell.
- N9 on Opener Lines at S and M (C3 6, H13): bands of 30–39 % inside the grown Lines cells.

Each is a small, local fix: swallow a separator pressed in an empty box, draw rows from the item count, and cap the grow.
