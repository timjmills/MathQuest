# Critic r8b: Guided page role (lf-roles), M and L

Critic: independent (mq-opus-medium), 2026-11-13. Tree: `claude/sweet-newton-c8wrv1-lf-roles` at e62f1da34 (merged with master).
Compared with origin/master e76e0815f (scratchpad worktree `master`). chart_to_120 was rendered from the lf-builds worktree
e1389d1f3 with the r8b `guided.js`. My renders are pixel-identical to `design/status/lf-roles/r8b/chart_to_120-guided-{M,L}-pupil.png`.
Every page was built with `buildSheet({role:'guided', columns:'auto', size, look:'auto', paper:'A4', seed, form:'A', key:true,
anchors:'off'})`, using seed = fnv1a("cat__skill:guided") % 1e6. I looked at pupil and key pages for all 12 skills at M and L.
The renders are in `<scratchpad>/critic-r8b/` (`*-lane.png`, `*-master.png`, `*-bld.png`).

Size S is out of scope (plan item 9). Scale: 1 px = 0.264 mm. The grid's floor is y = 1017 px on a full page.

## Verdicts

| Skill | M | L | Deciding finding |
|---|---|---|---|
| sub_50_no_regroup | PASS | PASS | nits only (n1, n4) |
| sub_100_no_regroup | PASS | PASS | |
| sub_1k_no_regroup | PASS | PASS | n1, n2 |
| sub_10k_no_regroup | PASS | PASS | n2, n3 |
| sub_100k_no_regroup | PASS | PASS | |
| sub_1m_no_regroup | PASS | PASS | |
| sub_2d_1d | PASS | PASS | n3 |
| placevalue:expand | **FAIL** | **FAIL** | D1 (C3 7) |
| placevalue:unit_form | **FAIL** | **FAIL** | D1 (C3 7) |
| placevalue:combine | PASS | **FAIL** | D1 at L (C3 7) |
| composing:number_word_form | **FAIL** | **FAIL** | D2 (H13, C3 6), D3 (C2 7), D4 |
| composing:chart_to_120 | **FAIL** | **FAIL** | D5 (C2 7) |

Every answer key is the same plan as its pupil page (same cells, one page each), and every answer is right. I checked the 14
subtraction keys by machine: every stack satisfies top − bottom = answer. I checked the placevalue, number_word_form and
chart_to_120 keys by eye and from their text.

## Scores (C1 ease / C2 teaching / C3 spacing / C4 look)

| Page | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| sub_50 / sub_100 / sub_2d_1d M (spanned Model, 4 columns) | 9 | 8 | 9 | 9 |
| sub_50 / sub_100 / sub_2d_1d L (spanned Model, Model + 6) | 9 | 8 | 9 | 9 |
| sub_1k / sub_10k / sub_100k M (3 columns, single-cell Model) | 9 | 8 | 8 | 9 |
| sub_1k / sub_10k L (spanned Model) | 9 | 8 | 9 | 9 |
| sub_100k L, sub_1m M / L (2 columns) | 9 | 8 | 8 | 9 |
| expand M / L | 9 | 8 | **7** | 9 |
| unit_form M / L | 9 | 8 | **7** | 8 |
| combine M | 9 | 8 | 8 | 9 |
| combine L | 9 | 8 | **7** | 9 |
| number_word_form M | 8 | **7** | **6** | 8 |
| number_word_form L | 8 | **7** | **6** | 8 |
| chart_to_120 M / L | 8 | **7** | 8 | 8 |

## What the round got right (against master)

- **Spanned Model (sub_50, sub_100, sub_2d_1d at M and L; sub_1k and sub_10k at L).** It reads as one worked example: one
  cell with one Model tab, the traced stack in the left half and three grey working lines beside it in the right half. The lines
  are the provider's worked steps for the Model's own numbers ("Ones: 6 − 5 = 1." "Tens: 2 − 1 = 1." "Check: 11 + 15 = 26."),
  in the step strip's order and wording. They name nothing from the tries.
- **Capacity.** L rose from Model + 5 to Model + 6 (the ceiling) on sub_50, sub_100, sub_1k, sub_10k and sub_2d_1d, and M
  holds Model + 8 (the ceiling). M ≥ L on every page. Nothing shrank: digits are the same size as on master.
- **Centring.** Every stack sits in the middle of its row. The answer row and the place headers stay on one line across each
  row, so column alignment between cells is intact. Spare body height dropped from 33 mm to 17 mm on the L pages (the 17 mm is
  the footer gap that every full page has).
- **M column count against the H13-across gap.** sub_50, sub_100 and sub_2d_1d went to 4 columns. Each side of the stack now
  leaves at most about 25 % of the width. sub_1k, sub_10k and sub_100k stay at 3 columns, with about 26 % each side for 3 digits
  and 18 % for 4. A 4th column would not add a try, because M is already at the ceiling of 8, so 3 columns is right there.
- **Placevalue tries held to their ink.** The try rows of expand, unit_form and combine no longer carry the 31–37 % band.

## Counted defects

**D1 · expand M/L, unit_form M/L, combine L · the tightened rows leave room for more tries, and the fit never refills it
(C3 7, major, this round's regression).**
The tries were tightened to their ink after the fit had already counted rows at the old, taller height. As a result, the
spare height under the grid grew:

| Page | Master | Lane |
|---|---|---|
| expand M | 26 mm | 42 mm |
| unit_form M | 22 mm | 37 mm |
| expand L / unit_form L | 5 mm | 21 mm |
| combine L | 12 mm | 28 mm |

A tight try row is 16 mm at M and 18.5 mm at L. So expand and unit_form M could hold 2 more tries (Model + 8, the ceiling)
but print 6, and expand, unit_form and combine L could hold 1 more (Model + 6) but print 5. Asking for `count: 9` at M still
plans 7 cells, so a teacher cannot get them either. The pages now stop three-quarters of the way down while the role's ceiling
is unmet: wasted paper, a defect a teacher notices. combine M is at its ceiling (Model + 8), so its 46 mm foot is allowed
(PT-ENG-3).
*Check:* proposed **GUIDED-TIGHT-REFILL** (ws-roles-unit, plus an EB-GDPCAP extension in ws-empty-band). On a one-page Guided
plan whose tries are below the size's ceiling, it fails when the drawn spare height under the grid is at least one drawn try
row. In other words, the fit must count rows at the height they are drawn (tightRows minus koMm), not at the measured height.
Backtest: FAIL on e62f1da34 expand M, PASS on the fix.

**D2 · number_word_form M/L · empty bands in every cell (H13, C3 ≤ 6, major, pre-existing on a page this round changed).**
`ws-empty-band` reports EB-BAND on all 15 cells:

| Size | Model | Row-1 tries | Rows 2–3 |
|---|---|---|---|
| M | 49.6 % | 34.9 % | 46 % |
| L | 48.6 % | 34–35 % | 46.7 % |

On top of that, 75 mm (M) and 102 mm (L) of the page is blank below the grid. At L that is 37 % of the body.
GUIDED-MODEL-ROW improved row 1, but no row passes. "Pre-existing" does not excuse a band on a page the round re-rendered.
*Check:* existing **ws-empty-band EB-BAND** catches it (FAIL 15). Rule: a lane's precritic must be green on every page it
changed, so it cannot hand over a page with a known EB red. Proposed: ws-precritic should fail when a page whose hash changed
this round has any EB red, even one the baseline marks as pre-existing.

**D3 · number_word_form M/L · the grey hint gives the answer away (C2 7, major).**
The hinted tries read `"twenty-six": 2 tens, 6 ones.` and `"ninety-nine": 9 tens, 9 ones.` Those hints carry both digits, so
they are the whole answer. PT §2.3 requires the first try row's hint to be "the problem's own first worked step that holds
none of its answer". Step 1 alone ("twenty: 2 tens") would also hold a digit, so the Step-1 frame with a gap is the allowed form
("twenty means ___ tens").
*Check:* proposed **GUIDED-HINT-LEAK** (ws-roles-unit). Rebuild the number from every place phrase in a hint ("N tens, M ones",
"N hundreds") and from its digits in order. Fail when the hint names every digit of the answer.

**D4 · number_word_form M · "eleven" is a different kind of problem (C2, counted together with D3).**
The steps "Read the tens word. Read the ones word." do not apply to "eleven" (row 3). PT §2.3 says "one kind of problem per
page, so the Steps fit every item".
*Check:* proposed **GUIDED-ONE-KIND** for word-form dealers: on a Guided page, tag each item's kind (teen, decade, two-word)
and fail when the page mixes kinds that the Steps do not cover.

**D5 · chart_to_120 M/L · try 4 repeats the Model's chart with the Model's traced answer as its blank (C2 7, major).**
The Model is the 96–120 window with blanks 100, 107 and 117, and 100 is traced in grey. Try 4 (row 2, right) is the same
96–120 window with blanks 100 and 118. The pupil copies 100 from the Model. Also, all four windows sit inside 91–120, so
"to 120" is exercised only at its top.
*Check:* proposed **GUIDED-MODEL-ECHO** (dealer predicate in ws-roles-unit). No try may share the Model's prompt (same
payload window or numbers) where one of its blanks is an answer the Model prints. Run it over the guided seeds of every skill.

## Nits (not counted)

- **n1 · Model and try parity across sizes.** The worked lines print only when the Model spans a row. sub_1k, sub_10k,
  sub_100k and sub_1m at M (and sub_100k and sub_1m at L) show a bare traced answer, while sub_1k and sub_10k at L show working.
  The same skill teaches its Model differently at M and L. *Check:* proposed MODEL-LINES-PARITY: a skill's Model shows
  working lines at both M and L or at neither.
- **n2 · The working is capped at 3 lines, so it stops short of the steps.** sub_1k and sub_10k L drop the "Check:" line,
  which is step 4. unit_form drops "9 ones" ("Read 779. 7 hundreds. 7 tens."). sub_10k L compresses two places into "Hundreds
  to thousands: 6 − 1 = 5, 9 − 3 = 6.", which is hard to read for an ELL pupil. *Check:* proposed MODEL-STEPS-COVER: the
  Model's lines cover every numbered step that has a number, or the strip drops the step.
- **n3 · Orphan wraps.** sub_2d_1d L prints "Tens: nothing to take away." with "Write 2." alone on the next line (the right
  half has room). chart_to_120 prints "Ten less is" / "100.", and number_word_form prints "6" / "ones.". *Check:* proposed
  LINE-ORPHAN: no worked or hint line wraps leaving 2 words or fewer, or a number cut from its unit.
- **n4 · Hinted row variety.** In sub_50 M, every hinted try's grey ones digit is "1" (34−13, 48−17, 43−32, 22−11), and the
  Model's is also 1. *Check:* proposed GUIDED-HINT-VARIETY: the hinted digits of one row are not all equal.
- **n5 · chart_to_120 Score is /3 but there are 5 answers.** The Score counts cells while MIN_ITEMS counts answers
  (EB-GDPCAP). *Check:* existing HD-2 or a score-points test should take N from `footprint.points`.
- **n6 · number_word_form row 1.** The Model's word "fifty-three" sits about 3 mm below "twenty-six" and "ninety-nine"
  because of the tab keep-out, so the words of row 1 do not line up. This is the same as on master.

## ws-empty-band (`--roles guided --sizes M,L --hosts none --no-baseline`, the 11 in-tree skills)

`ws-empty-band: FAIL (15)`. All 15 are number_word_form EB-BAND (D2). Every other check passes: EB-SIDE, EB-FOOT, EB-GDPCAP,
EB-PARITY, EB-ITEMKEY and the rest.

It agrees with my eyes on number_word_form (failing) and on the stack pages (passing). It does **not** catch D1. EB-PAGE is
opt-in and judges only pages before the last, and EB-GDPCAP does not compare the spare height with a try row. It also cannot
see D3, D5 or the nits.

## Speed notes for the lane

- D2 was a known red the lane carried into the critic ("its other rows pre-existing"). A failing gate on a changed page
  should stop the hand-off.
- D1 came from changing a row's drawn height without re-running the fit. Any rule that changes a row's height after the fit
  needs a refill test (GUIDED-TIGHT-REFILL).
