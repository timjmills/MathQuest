# Small fixes lane: independent critic, round 4

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `e0d6499`. I graded the diff `72e05d7..HEAD`. The r4 commits are `510a9c9`
(print: N8, N9) and `29442dd` (caret: N7, N10, N11). Chromebook sizes come first (1366x650 and 1280x600), and the phone at 390 got a
basic check only (STATUS §00). I ran one browser at a time. The evidence is in `r4/`, and my scripts are in the critic scratchpad
`r4c/`.

**Gates and probes:**
- `small-fixes-model-pages` (`MQ_BASE_ROOT` = an archive of `72e05d7`): **OK**, 156 sheets. No page count rises, and the scripted
  model is byte-identical to main. The new cell checks report 0 empty cells and a largest band of 28 %.
- `small-fixes-countrow-caret`: **OK**. On the first run, 1280 card default died with "detached Frame" (a harness flake). I re-ran
  `SIZES=1280,390` and got 176 PASS, OK. 1366 passed in full on the first run.
- `wave1-a3-wrongdigits`, `small-fixes-equiv-frac`, `small-fixes-quiz-wordrow`, `small-fixes-xp-burst` and
  `small-fixes-no-start-toast`: all **OK**.
- `hint-popup-e2e` (`MQ_BASE` = a `python3 -m http.server`): the first run had 1 failure, at 1366 `number_ops_mixed:operations_all`
  ("mq-workbox covered by answerInput"). The re-run printed **ALL CHECKS PASSED** (66/66 × 2). I traced the failure to one random
  item, a `div-check-judge` item in the mixed pool. Its work box sits under `#answerInput` with the hint open **and** with it closed,
  so it does not come from the hint. It is out of lane (O3 below).

**My own checks:**
- **Caret, adversarial.** I re-ran the r3 script on quiz, card and worksheet with rows by 3, by 7 and by 25 Lines. The full grid ran
  at 1366. At 1280 the run reached quiz × 3 and card by 3 before my timeout; the code paths are the same. I added these cases:
  - Enter after a 1 s pause
  - a comma after each number
  - a wrong number, then Enter
  - two extra digits in the last box
  - the N11 case of a wrong box, a green box, then Space
  - a per-key trace of the last box, for right and for wrong numbers, on card and worksheet
  - an exact replay of the r3 N11 repro
- **Print sweep.** `buildSheet` → `sheetDocument` was rendered in Chromium and measured for:
  - ink outside its cell
  - empty cells
  - the largest empty band per cell
  - the blank foot above the footer, in mm
  - the minimum digit pt

  Variants: the opener and the scripted model × 15 option sets (default, one page, Lines, Lines + one page, by 25, by 25 + Lines,
  by 25 + Lines + one page, 1,000 from 14,000 with and without Lines, 25,000 with and without Lines, 100,000 from 1,000,000 with and
  without Lines, times under each with and without Lines) × S/M/L × A4/Letter. I looked at about a dozen PNGs. For Lines I also ran
  a seed sweep over 6 seeds, and the same Lines M requests on the r3 tree (`27015cf`) for comparison.

## Status of the r3 defects

| ID | Status | Evidence |
|---|---|---|
| N7 | **Fixed.** I typed with Tab, Enter, Enter after a 1 s pause, and a comma after each number. Every row on every host lands one number per box (for example `9|21|24|27|36`). A wrong number followed by Enter still moves on, because that box was not handed the caret. | adv log, all hosts, 1366 and 1280 |
| N8 | **Fixed as stated.** No sheet has an empty cell (0 of 180 measured), because rows are drawn from the item count. **The underlying fit was not repaired, and it got worse: see N12.** | sweep, gate |
| N9 | **Fixed.** The largest Lines band is now 25 % at S, 23 % at M, 20 % at L and 18 % for one page; it was 30–39 %. Lines rows take no grow, and the spare stays at the foot. Where PT-OPN-7's 2 rows are full (Lines at S, and Lines + one page at all sizes), that blank foot is what PT-ENG-3 requires, so I do not mark it down. | `r4/print-opener-lines-S-a4.png`, `r4/print-opener-lines-onepage-M-a4.png` |
| N10 | **Fixed for any number that is not right.** On the card and the worksheet, a wrong `85` then `0` gives `850`, and `8500` keeps all its digits. In the quiz, `3000` and `30000` keep all their digits. When the last box already holds the right number, it turns green and locks, and a further digit is ignored. That follows the owner's green rule, so I note it as O4 and do not fail it. | last-box traces |
| N11 | **Fixed.** On the card, the worksheet and the quiz, a typed wrong number then Space skips a green box and goes to the next empty one (`29|35G|9`, caret on box 3). The exact r3 repro now behaves differently for an owner-approved reason: a click on a red box empties it (Wave 1 A3, `6a20c00`, `_clearIfWrong`), so the pupil is retyping that box by choice. Space in the now-empty box does nothing. | `r4/caret-card-by7-N11-after-space-9-1280x600.png` |

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret: move-on keys, row-wide digit count, overflow | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 1 | | Practice card 1366/1280 | 8 | 8 | 8 | 8 | pass (N7 and N11 fixed) |
| 1 | | Online worksheet 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 1 | | Phone 390 (probe, basic) | 8 | 8 | 8 | 8 | ok |
| 2 | Word hint in flow, "Listen" text button | Card 1366/1280, 66 skills | 8 | 8 | 8 | 8 | pass (O3 is a flake outside the hint) |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card / worksheet / quiz | 8 | 8 | 8 | 8 | pass |
| 4 | Quiz word rows restore | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass (O1 out of lane) |
| 5 | +XP burst | Card / boss / race | 8 | 8 | 8 | 8 | pass |
| 6 | No start toast | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass |
| 7 | Scripted model | 13 gate variants × S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (byte-identical to main) |
| 7 | Opener, rows with boxes: default, by 25, 14,000, 25,000, 100,000, times under each | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (0 ink out, bands ≤ 24 %) |
| 7 | Opener + one page (boxes) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (2 Independent rows, foot blank under PT-OPN-7) |
| 7 | Opener, Lines | S A4/Letter; L A4/Letter | 8 | 8 | 8 | 8 | pass (S: 2+2 rows, so the foot is spec-required) |
| 7 | Opener, Lines + one page | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, Lines with other steps (by 25, 14,000, 25,000, 100,000, times under each) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (bands 12–15 %) |
| 7 | Opener, Lines | **M A4** | 8 | 8 | **6** | 8 | FAIL (N12) |
| 7 | Opener, Lines | **M Letter** | 8 | **7** | **5** | 8 | FAIL (N12) |

## New defects

**N12 · Medium · Fix 7: Opener with Lines at M drops Independent rows that fit. M Letter has none at all, and 71–86 mm of the page
is left blank. This is a regression from r3.**

Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables',
opts:{spaces:'line'}}]}], size:'M', paper:'Letter', seed:4242})`. The result is the same for every seed I tried (4242, 1, 2, 3, 7,
99).

| Paper | HEAD fits | Independent rows | Blank above footer | r3 tree (`27015cf`) |
|---|---|---|---|---|
| Letter | "1 model, 2 guided, 0 independent", no Score | 0 | 86 mm | 1 independent |
| A4 | "2 guided, 1 independent" | 1 | 71 mm | 2 independent |

Each drawn Lines row is 19.8 mm, and an Independent band costs its strip plus that row, about 28 mm. So on Letter both PT-OPN-7 rows
would fit, and on A4 the second row would. PT-OPN-7 says Independent rows "are added only while whole rows fit the budget, at most
2". PT-ENG-3 leaves the remainder blank only *after* that. This blank is therefore not a spec-required foot. It is about a third of
the page with no task (C3, wasted space), and on Letter the Opener has no Independent practice and no Score (C2).

The likely cause is in `opener.js` `geometry()`. It fits `iRows` from `hMinAt(probe items)`, the tallest measured probe row. That
height is greater than the Lines row actually drawn, especially now that `tightRows` adds 3 mm writing height. The final deal (sized
by `counts()` on the probe) then yields fewer items than the final geometry could hold, and N8's fix now just draws fewer rows.

*What a fix must do:*
- fit Independent rows from the height the row is actually drawn at, or re-run `counts()` after the final deal and deal the missing
  items, so Lines M A4 and Lines M Letter get their 2 Independent rows (or as many as truly fit);
- extend `small-fixes-model-pages` so it fails when an opener has fewer than 2 Independent rows while the blank above the footer is
  at least one strip plus one row. That assertion would have caught this.

Evidence: `r4/print-opener-lines-M-letter-NO-INDEPENDENT.png` and `r4/print-opener-lines-M-a4-ONE-ROW.png`.

**Nits (do not fail):**
- On the Opener Lines + one page sheets, the problem letters "a." and "b." sit tight against the top-left of the step tab
  (`r4/print-opener-lines-onepage-M-a4.png`). They touch but do not overlap.

## Out of lane / observations
- O1 and O2: unchanged from r3.
- O3, new and out of lane: in `number_ops_mixed:operations_all`, the `div-check-judge` item ("Check by multiplying: 44 ÷ 4 = 10")
  has a `.mq-workbox` that `#answerInput` covers at 1366x650, with or without the hint. This is the source of the intermittent
  `hint-popup-e2e` failure.
- O4: a digit typed after the last box has turned green (right) is ignored, because the box is locked green. I accept this under the
  owner's green-on-right rule, since no box exists to take the digit.

## Verdict

**FAIL.** These pass: fixes 1–6 on every host, the scripted model, every Opener with boxed rows, and every Opener with Lines except
at M. N7, N8 (as stated), N9, N10 and N11 are fixed. One defect fails the lane: **N12**. At M, the Opener with Lines fits its
Independent rows from a taller measured row than it draws. A4 loses one row (C3 6), and Letter loses both rows and its Score (C2 7,
C3 5), leaving 71–86 mm of blank that the spec does not ask for. The fix is local: fit from the drawn row height, or top up the deal
after the final geometry, and add a "rows fit but are missing" check to the gate.
