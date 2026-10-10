# Small fixes lane: independent critic, round 5

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `ce62a62`. That commit merges main `fbfcd9e`, so the lane now sits on
main's quiz instant-feedback and in-place submit. I graded the diff `origin/claude/sweet-newton-c8wrv1..HEAD`. The r5 print
commit is `1773324`. It does three things: `bestGeometry` sizes the Opener's rows from the items it actually places, Independent
rows are filled before the second Guided row, and count rows get 1.2 mm of padding (`vpadOf` with `tightRows`).

Chromebook sizes come first (1366x650 and 1280x600); the phone at 390 got the probe's basic pass only. I ran one browser at a time.
Another session was running the lane's own gates at the same time, which I did not control. My scripts and logs are in the critic
scratchpad `r5c/`, and the evidence PNGs are in `r5/`.

## Gates and probes
- `small-fixes-model-pages` (`MQ_BASE_ROOT` = `main72`, the archive of `72e05d7`): **OK**, 156 sheets. No page count rises, and
  the scripted model is byte-identical to the base. There are 0 empty cells and no footer overrun, and the largest band is 29 %.
  - Main has not changed the print path since `72e05d7`. `git diff 72e05d7 origin/claude/sweet-newton-c8wrv1` is empty for
    `sheet/`, `print-sheet.js`, `screen-cell.js`, `skill-options.js` and `gen-operations.js`, so the old base is still a valid
    reference.
- `small-fixes-countrow-caret`: the full run was 302 PASS and 1 FAIL. The one failure was at `1280 card by25lines` with "detached
  Frame", the same harness flake as r4. A re-run with `SIZES=1280` gave **OK** (128 PASS).
- `wave1-a3-wrongdigits`, `small-fixes-equiv-frac`, `small-fixes-quiz-wordrow`, `small-fixes-xp-burst` and
  `small-fixes-no-start-toast`: all **OK** on the merged tree.
- `hint-popup-e2e`: 1366 passed 66/66, and 1280 passed 65/66. The one failure was `number_ops_mixed:operations_all`, "mq-workbox
  covered by answerInput". It has the same signature as O3 in r4: a random `div-check-judge` item in the mixed pool, and it fails
  with the hint open or closed. It is out of lane.
- **Main's quiz in-place submit, checked with my own probe** (`r5c/instant.cjs`). I built a quiz with `showFeedback: 'instant'`
  at 1366 and at 1280, with one count-row item and one word problem:
  - In the count row I typed a right first number, pressed Space, typed a wrong second number and pressed Tab. The caret moves
    1 → 2 → 3, the boxes read `6|5|||`, and no feedback line appears while the row is part-done, so no answer is revealed
    mid-row.
  - In the word problem I typed one digit and pressed Tab. No feedback appears.
  - No page errors.
  - The lane's quiz fixes (restore, partial by row, live dots) still hold with main's in-place submit; `quiz-wordrow` passes.
- **Print sweep** (`r5c/print.cjs`, which is the r4 sweep re-run). I rendered the Opener for 15 option sets × S/M/L × A4/Letter,
  measured ink out of cell, empty cells, the largest band, the blank foot and the minimum digit pt, and compared every row of the
  output with r4. I looked at the PNGs myself.
- **Experiment** in a scratch copy (`r5c/exp`, not the repo). I took `hand` out of the second-Guided-row test when no Independent
  band is drawn, to check whether a dropped row really fits.

## N12 status: FIXED

| Lines at M | r4 | r5 |
|---|---|---|
| A4 | 2 guided, 1 independent, 71 mm blank | **2 guided, 2 independent, Score /2**; the 41 mm foot is what PT-OPN-7 and PT-ENG-3 require, because both rows are full |
| Letter | 1 guided, 0 independent, no Score, 86 mm blank | **2 guided, 2 independent, Score /2**, 23 mm foot |

The gate now fails when an Opener has fewer than 2 Independent rows while the blank foot could hold a strip plus a row.
The problem letters "a." and "b." now clear the step tab on rows with boxes and on Lines rows that are not one page
(`r5/print-opener-lines-M-a4-N12-FIXED.png`).

## r5 changes compared with r4, from the sweep

The r5 changes moved other sheets as well:

| Sheet | r4 | r5 | Verdict |
|---|---|---|---|
| Lines M A4 / Letter | 1 / 0 independent | 2 / 2 independent | fixed (N12) |
| **100,000 from 1,000,000, L, A4** | 1 model, **2 guided**, 13 mm foot | 1 model, **1 guided**, 0 independent, **43 mm blank** | **regression (N13)** |
| **by 25 + Lines + one page, Letter, S/M/L** | 5 cells, 2 guided + 2 independent, 21 mm foot | 4 cells, **1 guided** + 2 independent, **41 mm blank** | **regression (N13)** |
| times under each + Lines, L, A4 | 1 guided + 1 independent | 2 guided, 0 independent, no Score | acceptable: PT-OPN-6 gives one Guided column 2 rows, and the Independent band, which needs a strip, its row and the L label-wrap reserve, does not fit |
| every other sheet | — | rows 2.4 mm taller (the 1.2 mm padding), same counts | ok |

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret: move-on keys, row-wide digit count, overflow, green hand-on | Quiz 1366/1280 (also instant feedback) | 8 | 8 | 8 | 8 | pass |
| 1 | | Practice card 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 1 | | Online worksheet 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 1 | | Phone 390 (probe, basic) | 8 | 8 | 8 | 8 | ok |
| 2 | Word hint in flow, "Listen" text button | Card 1366/1280 | 8 | 8 | 8 | 8 | pass (the failure is O3, out of lane) |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card / worksheet / quiz | 8 | 8 | 8 | 8 | pass |
| 4 | Quiz word rows: restore, partial by row, live dots | Quiz 1366/1280, with main's in-place submit | 8 | 8 | 8 | 8 | pass |
| 5 | +XP burst | Card / boss / race | 8 | 8 | 8 | 8 | pass |
| 6 | No start toast | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass |
| 7 | Scripted model | 13 gate variants × S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (byte-identical to main) |
| 7 | Opener, rows with boxes: default, by 25, 14,000, 25,000, times under each | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, 100,000 from 1,000,000 | S, M; L Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, 100,000 from 1,000,000 | **L A4** | 8 | **7** | **6** | 8 | **FAIL (N13a)** |
| 7 | Opener + one page (boxes) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (nit N14) |
| 7 | Opener, Lines | S, M (N12 fixed), L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, Lines + one page (default step) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (2+2 rows, so the foot is spec-required; nit N14) |
| 7 | Opener, Lines with other steps (14,000, 25,000, 100,000, times under each) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, by 25 + Lines + one page | A4 S/M/L | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, by 25 + Lines + one page | **Letter S/M/L** | 8 | 8 | **7** | 8 | **FAIL (N13b)** |

## New defects

**N13 · Medium · Fix 7: the Opener drops a second Guided row that fits, so the page ends in a 41–43 mm blank (PT-OPN-6:
"1 column gives 2 rows"; lane rule N4). This is a regression from r4, introduced by `1773324`.**

*(a) 100,000 from 1,000,000, L, A4.*

Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables',
opts:{rows:[{step:100000, start:'custom', at:1000000}]}}]}], size:'L', paper:'A4', seed:4242})`.

What the page shows (`r5/print-opener-100000-L-a4-ONE-GUIDED-ROW.png`):
- "1 model, 1 guided, 0 independent".
- 43 mm blank above the footer.
- The pupil gets one practice row on the whole page, and there is no Score.

In r4 the same sheet printed 2 Guided rows with a 13 mm foot.

The cause:
- The 1.2 mm padding makes `gH` 2.4 mm taller.
- The second-Guided-row test `used + gH + hand <= m.budget` still charges `hand`. At L, `hand` is one strip, kept in reserve for
  the "Independent / Practice:" label that wraps to two lines. But no Independent band is drawn on this page.

The experiment confirms it. In a scratch copy, charging `hand` only when `iRows > 0` restores 2 Guided rows with a 13 mm foot,
no overrun and a 15 % band (`r5/experiment-100000-L-a4-second-row-fits.png`).

*(b) by 25 + Lines + one page, Letter, at S, M and L.*

Repro: the same call with `opts:{rows:[{step:25}], spaces:'line', onePage:true}`, `paper:'Letter'`.

What the page shows (`r5/print-opener-by25-lines-onepage-M-letter-ONE-GUIDED-ROW.png`):
- "1 model, 1 guided, 2 independent".
- 41 mm blank.
- Each Lines row is 31.6 mm. Lines rows take no grow, so a further row needs only 31.6 mm, plus the 4 mm budget margin, which
  the 41 mm blank holds.

In r4 this sheet printed 2 Guided rows with a 21 mm foot. The `hand` experiment does not change it (`hand` is 0 at S and M), so
the cause is in the new deal. My reading is that `counts()` now asks for 1 + 4·gc items, and `bestGeometry` only tries prefixes of
the deal, each sized from the tallest item in the prefix. A taller probe row in the full deal blocks `gRows = 2`, and the plan
then places 4 items whose rows are shorter than the row it was sized from.

*What a fix must do:*
- Charge `hand` only when an Independent band is drawn: `(iRows ? hand : 0)` in the second-Guided-row test, and the same in
  `spare`.
- Make `bestGeometry` choose its rows from the rows it actually places. One way is to re-fit `gRows` and `iRows` on the final
  placed slice. Another is to try leaving out the tallest probe row, not only to shorten the prefix.
- Extend `small-fixes-model-pages` to fail when a count-row Opener with one Guided column has one Guided row and the blank foot
  is at least that row's natural height plus the budget margin. The current check covers Independent rows only, which is why
  both cases passed the gate.

**N14 · Low (nit, does not fail) · On the one-page Opener sheets, the letters "a." and "b." still touch the top-left corner of
the step tab.** This happens on one page and Lines + one page, at every size. The r5 padding clears them on the other sheets only.
See `r5/print-onepage-letter-a-touches-tab-crop.png`: the period of "a." sits on the tab's corner. The fix is to apply the
1.2 mm offset, or a left inset, to the one-page row as well.

## Out of lane / observations
- O1, O2 and O4: unchanged from r4.
- O3: `hint-popup-e2e` failed once more on the mixed-pool `div-check-judge` item at 1280. It is the same as r4 and not caused
  by the hint.
- times under each, L Letter, and times under each + Lines, L Letter, have 1 Guided row with a 37 mm and a 55 mm foot. The rows
  are 51–56 mm with grow and about 51 mm on Lines, so a second row does not fit within `bodyH - 4`. This is the same as r4, and
  I accept it.

## Verdict

**FAIL.**

**What passes:**
- N12 is fixed: Lines at M now prints 2 Guided and 2 Independent rows with a Score, on A4 and on Letter.
- Fixes 1–6 pass on every host, and still hold after the merge with main's quiz in-place submit and instant feedback.
- The scripted model is byte-identical to main.

**What fails is the r5 print change itself (N13).** On two families of sheets, the Opener now leaves out a second Guided row
that fits, where r4 printed it:
- 100,000 from 1,000,000 at L A4: C2 7, C3 6.
- by 25 + Lines + one page on Letter: C3 7.

Both fixes are local to `opener.js`: charge the L label-wrap reserve only when an Independent band is drawn, and size the rows
from the items placed. The gate also needs a check for a second Guided row that fits but is missing.
