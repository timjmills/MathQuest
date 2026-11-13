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

## Re-critic r8c (lane at 0ea655fe8)

Critic: independent (mq-opus-medium), 2026-11-13. I pulled the lane at 0ea655fe8 and rendered every page myself with the same
`buildSheet` call and seed. My renders are in `<scratchpad>/critic-r8b/*-r8c.png`, and the builder's PNGs are in
`design/status/lf-roles/r8c/`. number_word_form and chart_to_120 belong to other lanes and are not graded here, so D2 to D5
stay open where they are.

### D1 is closed

| Page | Tries at r8b (e62f1da34) | Tries at r8c | Ceiling | White under the grid now |
|---|---|---|---|---|
| expand M | 6 | 8 | 8 | 10 mm |
| unit_form M | 6 | 8 | 8 | 6 mm |
| expand L | 5 | 6 | 6 | 3 mm |
| unit_form L | 5 | 6 | 6 | 3 mm |
| combine L | 5 | 6 | 6 | 10 mm |

All five are one page each (pupil and key). Nothing shrank: row heights, digit sizes and boxes are the same as at r8b. The
items added keep the variety (expand 645 and 980, a trailing zero; unit_form 828 and 607, a zero ten; combine 900 + 7). The key
of each page has the same plan as its pupil page, and every answer is right: expand 645 = 600 + 40 + 5 and 980 = 900 + 80 + 0;
unit_form 828 and 607; combine L 907.

### Verdicts and scores (C1 ease / C2 teaching / C3 spacing / C4 look)

| Page | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|
| expand M | 9 | 8 | 9 | 9 | PASS |
| expand L | 9 | 8 | 9 | 9 | PASS |
| unit_form M | 9 | 8 | 9 | 8 | PASS |
| unit_form L | 9 | 8 | 9 | 8 | PASS |
| combine L | 9 | 8 | 9 | 9 | PASS |

combine M did not change (byte-identical) and stays PASS. The nits from r8b carry over unchanged and are not counted:
- n2: unit_form's Model lines stop at "7 tens." and leave out the ones.
- unit_form prints "1 hundreds", the same as on master.

### Re-hash of the passed subtraction pages against e62f1da34

I hashed buildSheet's `pupilHtml` and `keyHtml` with SHA-1 for the 7 subtraction skills at M and L (28 documents) at both
e62f1da34 and 0ea655fe8. **All 28 are byte-identical**, so every subtraction PASS from r8b stands. combine M is also
identical. Only the 5 pages above changed, each with its key, which matches the builder's report. The hash lists are
`<scratchpad>/critic-r8b/hash-e62.txt` and `hash-0ea.txt`.

### Is EB-REFILL a sound check?

- **Backtest:** run with `MQ_ROOT` set to the e62f1da34 checkout, the current script reports `EB-REFILL FAIL 5` on exactly
  the five pages of D1, for the right reason ("… white under the grid holds another 15.8 / 18.2 mm row of tries, but the page
  prints 6 of 8 / 5 of 6"). On 0ea655fe8 it passes. It fails the right pages for the right reason.
- **ws-empty-band on 0ea655fe8** (expand, unit_form, combine, sub_50, sub_1m and number_word_form; guided; M and L): EB-REFILL
  passes. The only failures are the 15 number_word_form EB-BAND cells, which are another lane's.

It has four weak points. None blocks this round, because none of them changes a verdict above.

- **R1 · Possible false positive: it counts the floor every page keeps.** `spare` is measured from the grid to the bottom of
  `.ws-body`. Every full Guided page keeps about 11.2 mm there that rows never use: the white band under a sub_50 L or sub_1m M
  page at its ceiling measures 11.2 mm. So a page under its ceiling with real room between 0 and 11 mm less than a row would
  still be flagged. The reported 53.6 mm on expand M at r8b was about 42 mm of usable room.
  *Fix:* subtract the page's own floor, using the fit's `pg.avail`, or the `.ws-band` reserve a ceiling-full page of the same
  size leaves. Then compare with the row height.
- **R2 · Miss: rows that are not whole.** The condition `tries + cols <= cap` exempts every multi-column page where a whole
  extra row would pass the ceiling. number_word_form L prints 5 of 6 tries with 85.6 mm of white under a 3-column grid and is
  not flagged. A page whose last row has an empty slot is also never flagged, though filling that slot needs no height at all.
  Whether a lone try in a row is allowed is a design question. Even so, an empty slot in the last row while the page is below
  its ceiling should fail.
  *Proposed:* EB-REFILL-SLOT (an empty slot in the last row while tries < cap). A ruling is needed on whether a part row is
  acceptable.
- **R3 · Units mismatch.** `b.tries` is `scoreOutOf`, which counts scored answers, while `cols` counts cells. On pages whose
  cells score several answers (Match 3, chart_to_120 with 2 blanks a try), "the next row" is really points per cell × cols, so
  the ceiling test is wrong in both directions.
  *Fix:* compare cells with cells, or add the next row's points (`footprint.points`) and not `cols`.
- **R4 · Scope.** It judges only one-page sheets. A multi-page Guided sheet whose last page could take another row of tries
  is never checked. This is minor, because the Guided page is one page by design, but the check should say it skips these
  pages rather than pass them silently.

### Findings and the check for each

| Id | Finding | Severity | Check |
|---|---|---|---|
| D1 | Closed: tight rows are now refilled to the ceiling | — | EB-REFILL (existing; backtest guided-tight-refill PASS) |
| R1 | EB-REFILL counts the floor under the grid, so it can give false positives | minor (tool) | ws-empty-band self-test: a fixture whose white is floor + (row − 5 mm) must PASS |
| R2 | EB-REFILL misses part rows and empty last-row slots (number_word_form L 5/6, 86 mm) | minor (tool) | proposed EB-REFILL-SLOT, after a ruling on part rows |
| R3 | EB-REFILL mixes answers and cells | minor (tool) | self-test with a Match 3 Guided fixture |
| R4 | EB-REFILL skips multi-page sheets without saying so | nit (tool) | EB-REFILL should name the pages it skips |

**Re-critic r8c verdict:** expand M/L, unit_form M/L and combine L PASS; combine M and the 14 subtraction pages stay PASS
(byte-identical). Zero counted defects on this lane's pages. EB-REFILL is sound for D1, with the tool debts R1 to R4 above.
