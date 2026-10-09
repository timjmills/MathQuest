# Wave 1 lane "Place-value disks / unit_form on phones": independent critic

Tree `worktree-agent-a5e11bcf3d1414886` @ b316b25 (main c91cc8b merged). The lane's own work is in 1853c10 and 45ac156
(`js/modules/screen-cell.js`, `css/screen-cell.css`). Scope: `placevalue:place_value_disks` and `placevalue:unit_form`
on the practice card, the online worksheet and the quiz at 390, 820 and 1280 px, plus their print pages.

## Verdict: FAIL

The lane's own goal is met. The disk mat and the unit-form boxes now fit a 390 px phone on all three hosts.
The quiz failure is **reproduced, every time**. A pupil who types the digits one after another, without tapping
each box, loses a digit: 730 becomes `73, ,`. The quiz marks it wrong, and the review still counts it as answered.
That puts the quiz host's C1 under 8.

| Host | C1 Ease | C2 Teach | C3 Layout | C4 Standard | Note |
|---|---|---|---|---|---|
| Print, independent / test / keys, S and L | 9 | 8 | 8 | 9 | The lane does not touch print. Lint finds 0 issues. Every key I checked is right. |
| Practice card 390 / 820 / 1280 | 8 | 8 | 8 | 7 | It fits. The caret moves on when a digit is right. The "hundreds disks:" frame has words at two sizes (D3). |
| Online worksheet 390 / 820 / 1280 | 8 | 8 | 8 | 7 | Same as the card. The mat keeps its paper width when the worksheet zooms. |
| Quiz 390 / 820 / 1280 | **5** | **6** | 8 | 7 | D1: digits typed in a row join in box 1 and the extra digit is dropped. D2: the count task shows the read-task instruction. |

## Ranked defects

1. **C1, blocker (quiz, all widths). This is the "lost 0".**
   **Where:** quiz, `unit_form` (standard). **Reproduce:** `design/audit/runs/placevalue-phones/quiz-typing-repro.cjs`.
   **What:** the pupil taps box 1 and types the digits straight through, on a keyboard or a phone keypad. Results:
   730 → `[73| | ]`, 770 → `[77| | ]`, 7330 → `[73| | | ]`, 7026 → `[70| | | ]`. The same happens at 390 and at 1280.
   - Every item is recorded wrong (`"73, ,"`) and the score is 0 %.
   - The review screen says "4 answered", so the pupil is not warned.
   - Two causes. First, the quiz never moves the caret: `active-box.js` only moves it when a box turns `mq-live-correct`, and the quiz shows no per-box marks, by design. Second, each one-digit box takes `maxlength=2` (`data-mq-w=2`), so box 1 takes two digits and the third digit is dropped.
   - The card and the worksheet move the caret only when a digit is RIGHT. After a wrong digit, the next digit also joins the same box (for example `40`).

   **Fix:**
   - Move the caret to the next box when a box holds its digit count, on every host, whether the digit is right or wrong. This reveals nothing.
   - Give a unit-form box the key's width (1 digit for a standard item), so `maxlength` is 1 there.
   - In the review, count a several-box answer as answered only when every box is filled, or show it as part answered.

2. **C1 / C2, major (quiz).**
   **Where:** quiz, `place_value_disks` with Task = Count.
   **What:** the instruction reads "Count the disks. Type the number.", but the cell asks for "hundreds disks: __". The card says "Count the disks in the zone. Type how many."
   **Cause:** `quizQuestionData` drops `q.pv`, because `'pv'` is not in `QUIZ_CELL_FIELDS` (`quiz-take.js:209`). The provider (`sheet/providers/pv.js`, `pvOf(q).task`) then falls back to the read strings. Other pv skills whose strings read `q.pv` may be affected in the quiz too.
   **Fix:** add `'pv'` to `QUIZ_CELL_FIELDS`. This is additive: old saved quizzes keep their old text.

3. **C4 / C3, minor (card, worksheet and quiz at every width; this predates the lane).**
   **Where:** the count frame "hundreds disks: ____".
   **What:** "hundreds" is drawn larger and lower than "disks:".
   **Cause:** `frameHTML` (`sheet/cells/pv.js:294`) keeps only the last word inside `.pv-slotgroup`. The words before it are styled differently on screen.
   **Fix:** put the whole label in one piece at the cell-text size, or put both words in the slot group.

4. **C1, minor / owner question (390 only).**
   **Where:** the thousands mat (Numbers to 9,999).
   **What:** at the 8 pt label floor the mat is 457 px wide in a 304–322 px window. It swipes, with the "Swipe → for more" cue, so the pupil cannot see all four zones at once while reading one number. The three-zone mats fit with no swipe (labels at 8.4–12 pt), and so do all mats at 820 and 1280.
   **Question for the owner:** is a swipe acceptable for the four-zone mat on a phone? Suggested answers:
   - (a) Yes. It is the SP-11a swipe exception, extended to disk mats.
   - (b) No. On a phone, draw the four zones as 2 × 2: Th H on top, T O below.

5. **C3, nit (390, rename option).**
   **What:** "749" stands alone and the next line starts with "=", as in `= __ tens 9 ones`.
   **Fix:** keep the number and the "=" together.

6. **C2, nit.**
   **What:** the `unit_form` answer string says "1 ones", for example "8 hundreds 5 tens 1 ones". It shows in the quiz's instant feedback ("The answer is: …") and on the results screen.
   **Fix:** use `plural()` the way the rename branch does.

7. **Code, nit.**
   **What:** `wireDiskSwipe` adds a `window` resize listener for each mat on each render, and never removes it. The quiz re-renders on every answer, so the listeners pile up and keep old nodes alive.
   **Fix:** have one delegated listener, or check `isConnected` and remove it.

**Not a defect, noted.** After Next in the quiz, the caret is not placed in box 1. This is `active-box.js` working as designed: it does not take the focus after a tap on a button. The box still pulses, and a key typed goes into it. I checked this.

## What was run

- **Quiz scoring:** 36 items per width. The items cover `unit_form` (Numbers to 99, 999 and 9,999; most have a 0 digit, such as 730, 7026, 2607 and 5560) and `place_value_disks` (read at 99, 999 and 9,999; count; a zero place).
  - I entered them five ways: tap each box, Tab between boxes, type with no focus (the key goes to the pulsing box), wrong first then come back and fix, and type straight through.
  - Every right answer was recorded correct. Every planted wrong answer was recorded wrong.
  - Going back to a question restored its boxes. The review counted 6/6.
  - The only failure is typing straight through (D1).
- **Hosts:** 597 checks at 390, 820 and 1280, for the card, worksheet and quiz, across 8 cases (unit_form at 99, 999, 9,999 and rename; disks at 99, 999, 9,999 and count). All passed:
  - no page scroll, and nothing spills out of the card;
  - boxes are at least 44 px (unit_form: card and quiz 72×48, worksheet 51×46; disks: 70–135 px wide × 48);
  - the first box pulses, and the caret is in it on load;
  - disk labels are at least 8 pt;
  - the swipe cue shows only when the mat is wider than its window;
  - the cell is Andika, with ink only;
  - there are no console errors.

  Screenshots: `{card,worksheet,quiz}-{390,820,1280}-{uf-*,pd-*}.png`. The 9 worksheet typing "fails" in that run came from my harness: it typed answers from a different item. I re-ran it on the worksheet's own item, and the caret moves on when a digit is right.
- **Print:** `ws-print-lint --source kit`, both skills, roles independent, more-practice, guided, review, test and error-analysis, sizes L and S. Result: 12 documents per size, 0 findings. `ws-grade-render --roles independent,test`: see `print/`. The keys are right (969, 690, 821; 605 = 6 / 0 / 5).
- **Merge:** `claude/sweet-newton-c8wrv1` (c91cc8b) is an ancestor of HEAD, so the merge is a fast-forward with no conflicts.
