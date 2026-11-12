# lf-placevalue critic r3c — targeted re-grade (independent critic, Opus medium)

Graded commit ce9a2fc4 (branch `claude/lf-placevalue`; HEAD 6842032d differs only in the brief). Renders by
`node tests/scripts/ws-grade-render.cjs ... --no-screen` into
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3c/`. Item lists, zero
positions and repeats measured from each render's `meta.json` (`roles.<role-size>.items`, `fits`) by `critic-r3c/an.py`,
compared against the r3 / r3b renders of the same pages.

## Part 0 — `placevalue:expand` re-check (new deal)

Rendered independent, more-practice, test, review, true-false, guided, error-analysis at S / M / L (21 pupil pages + 21 keys)
and independent band 99 at S / L.

| page | items (cols x rows) vs r3/r3b | digit pt | zero items: tens / ones / none | repeated number | repeated first-2 digits |
|---|---|---|---|---|---|
| independent S / M / L | 15 / 12 / 10 (1 col), same | 16 / 22 / 28 | S 4/3/8, M 4/2/6, L 4/2/4 | 0 | 0 |
| more-practice S / M / L | 15 / 12 / 10, same | 16 / 22 / 28 | S 4/4/7, M 4/2/6, L 4/2/4 | 0 | 0 |
| test S / M / L | 12 / 12 / 10, same | 16 / 22 / 28 | S 2/4/6, M 2/4/6, L 1/4/5 | 0 | 0 |
| review S / M / L (expand part) | 10 / 8 / 7 + mixed review, same grid | — | 101, 240, 760, 560, 606 on S: both positions | 0 | 0 |
| true-false S / M / L | 4, same | 16 / 22 / 28 | 810 (O), 503 (T), 130 (O), 196 | 0 | 0 |
| guided S / M / L | 1 model + 9 / 6 / 5, same | — | model 904 (T), 330 (O), 305 (T), 801 (T), 980 (O) | 0 | 0 |
| error-analysis S / M / L | 6 / 4 / 4, same | 16 / 22 / 28 | 460, 103, 610: both positions | 0 | 0 |
| independent band 99 S / L | 27 (3x9) / 10 (1x10), same | 16 / 28 | 2-digit: ones only (S 9/27, L 6/10) | 0 | 0 |

- **Zero items keep their box:** every zero item draws one box per place (704 = [] + [] + [], 70 = [] + [] at band 99); the keys
  write the zero part (700 + 0 + 4). Checked on every pupil page above and the independent S, test L and error-analysis M keys.
- **Zero position spread:** every 3-digit page holds both zero-tens and zero-ones items (table); no page holds only zero-tens.
  Hundreds is never zero (3-digit numbers), which is correct. Band 99 can only zero the ones.
- **No repeats:** no repeated number and no repeated first-two-digit pair on any page.
- **No new size class:** every page keeps the same columns x rows, `cls: standard` and digit size as the r3/r3b render; the
  layout code is unchanged and the PNGs show the same geometry.
- Observation (pre-existing, not a regression): band 99 L holds 6 multiples of ten in 10 items (70, 60, 20, 80, 30, 40); the
  r3 render (aacae5ea) held 6 too (70, 60, 20, 80, 10, 50). r3 graded it >= 8; I keep that grade.

Grades: every page re-checked keeps its r3 / r3b grade (all >= 8 on C1–C4, no cap). The deal change only moved which numbers
are dealt; geometry, strings and keys are unchanged.

**placevalue:expand — VERDICT: PASS** (re-confirmed on the new deal).

## Part A — lessons of `placevalue:identify` and `placevalue:value` (S / M / L)

Rendered: `critic-r3c/lessons/placevalue__{identify,value}/lesson-{S,M,L}-p*.png` and keys. Page by page against the r3 / r3b renders,
only p2 changed (vocabulary + warm-up). p1, p3 and identify L p4 are byte-identical to the graded renders (cmp), so their
grades stand.

| page | S | M | L | measured |
|---|---|---|---|---|
| identify lesson p2 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Vocab now digit / "4 7 2", place / "H T O", ones / 4 unit squares (3.1 mm at M): one right match each; key lines right (M key checked). Warm-up heading "Circle the place of the underlined digit." over ring-only cells (no Value line) and "Write how many of each place." over the unit_form cell: each heading matches its cells. ENGINE: vocab cell top band 26.5 mm of 60.9 mm (43 %) at S / M, 28.6 of 65.1 mm (44 %) at L (E-A1); L p2 page bottom 33 % empty (page split, was 43 % in r3) |
| value lesson p2 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Vocab now value / "6 → 600", place / "H T O", digit / "4 7 2": no meaning reuses another word, no picture's text inside another's; key lines value↔6→600, place↔HTO, digit↔472 (M key checked). Page bottom empty 5 % (M), 11 % (L) |

- **F3 (identify vocab "underlined" with no underline): FIXED.** The word is gone; every picture now names one word only.
- **F4 (identify warm-up heading says "Write the value" over cells with no Value line): FIXED.** lesson.js takes the heading from the
  items' own `q.instructionKey` (`warmItemKey`) when they all name one; identify warm-up reads "Circle the place of the underlined digit."
- **G1 (value vocab "worth" = "value", two right answers): FIXED.** "worth" replaced by "digit" / "4 7 2".

## Part B — `placevalue:combine`

Rendered: `critic-r3c/combine/placevalue__combine/` (10 roles x S/M/L) and `critic-r3c/combine-b99/placevalue__combine/`
(band 99 independent S / M). ws-empty-band run on 9 roles x S/M/L (`critic-r3c/eb-combine.log`) and on band 99 independent
S/M/L (`critic-r3c/eb-b99.log`). Answers checked from meta.json: no repeated answer on any page; TF keys 309 / 378 / 754 / 839 /
860 / 807 / 226 / 524 against the shown claims (12, 700504, 20, 80060, 11 are the misconceptions).

| page | S | M | L | measured |
|---|---|---|---|---|
| independent | (r3 8-8-8-8) | (r3 8-8-8-8) | 8-8-8-8 | L 10 rows of 184.7 mm, the frame block now centred; EB-SIDE PASS (r3: 30-34 % left band on 5 of 10) |
| more-practice | (r3) | (r3) | 8-8-8-8 | same as independent L; EB-SIDE PASS |
| test | (r3) | 8-8-8-8 | 8-8-8-8 | M 16 (2x8) two-line frames, L 10; no EB finding |
| review | (r3) | (r3) | 8-8-8-8 | 6 combine + 3 expand mixed; no EB finding |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8 / 6 / 4; keys right; bottom strip 18-20 % is R-d (ENGINE-ROLES) |
| guided | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | model + 9 / 7 / 5; hints fade after item 2. ENGINE: S cells 2-3 EB-BAND 37.7 % and a 29 % page strip (E-B1) |
| error-analysis | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 500809, 19, 70090 / 790, 804, 334, 748: concatenation and dropped-zero errors with correct items mixed in. ENGINE: band under the "correct answer" line 30-31 % (S), 37 % = 22 mm (M), 27-28 % (L) by pixel; ws-empty-band passes it (E-B2) |
| scripted-model | 8-8-8-8 content | 8-8-8-8 content | 8-8-8-8 | ENGINE (E7 known): S page about 60 % empty, EB-SIDE 33-62 % on step cells S and M, EB-BAND 49 % at M |
| opener | - | 8-8-8-8 | 8-8-8-8 content | ENGINE: M cell 1 EB-BAND 31.9 %; L holds the model and ONE guided item, about 55 % of the page empty (E-B3) |
| lesson | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | vocab 472 / 400+70+2 / HTO, one match each; warm-up headings match cells. ENGINE: S and M byte-identical (md5), L p2 Independent holds 1 item (page split) |
| band 99 independent | 8-8-8-8 | 8-8-8-8 pv (ENGINE N8) | (r3) | S now 4x7 = 28 items in 45.8 mm cells, EB-SIDE PASS (r3: 3 across, about 35 % each side). M 2x8 = 16: EB-BAND exactly 30.0 % (8.4 of 28 mm) on all 16 cells: layout.js N8 TWO_COL_ROWS (ENGINE-ROLES by ruling) |

- **F1 (combine independent / more-practice L, 30-34 % left band): FIXED.** EB-SIDE PASS on both; rows visibly centred.
- **F2 (combine band 99 S held to 3 across, about 35 % side bands): FIXED.** 4 across, 28 items, EB-SIDE PASS.

## New findings

No new pv-owned finding holds a skill. Flagged for the lead:

- **E-A1 (identify lesson p2, C3 7 on that band; ENGINE-ROLES by ruling, lead to confirm).** The new "ones" vocab picture
  `{kind:'blocks', tens:0, ones:4}` is drawn by lesson.js `case 'blocks'` with a fixed height of 10 units (a ten-rod's height) even
  when there are no tens, so the vocab cell grows from 155 px (r3) to 230 px and its top 26.5-28.6 mm (43-44 %) is empty at every
  size. The drawing code is lesson.js (engine), but the picture was chosen by the pv change (prereqs.js), so pv could also sidestep it.
  Rule: RUBRIC H13. Check: a LESSON-DATA / vocab lint that measures each vocab picture's ink box against its SVG box (empty
  fraction <= 30 %), or run ws-empty-band on the lesson vocab row (it is not a `[data-ws-cell]` today).
- **E-B2 (error-analysis.js, combine M).** 37 % (22 mm) empty under the "correct answer" line by pixel; ws-empty-band passes it.
  Check: ws-empty-band should count the Fix-it line label as ink and measure to the cell rule (the measure it uses misses this case).
- **E-B1 guided.js, E-B3 opener, scripted-model E7, test / TF strips R-d, layout.js N8 at band 99 M, lesson S = M, lesson page
  split:** see below.

## ENGINE-ROLES (graded, recorded, not holding a pv skill)

- lesson.js: `blocks` vocab picture reserves rod height with tens 0 (E-A1); S and M lesson pages byte-identical (combine and identify);
  page split (identify L p2 33 % empty; combine L p2 Independent with 1 item).
- guided.js: combine S faded-hint cells EB-BAND 37.7 %, page strip 29 % (E-B1).
- error-analysis.js: combine M 37 % band under the Fix-it line (E-B2).
- opener: combine L holds one guided item, about 55 % of the page empty; M cell 1 EB-BAND 31.9 % (E-B3).
- scripted-model.js: combine S / M EB-SIDE 33-62 %, EB-BAND 49 % (M), S page about 60 % empty (E7).
- layout.js resolveSectionLayout N8 / TWO_COL_ROWS: combine band 99 M EB-BAND 30.0 % on 16 of 16 cells.
- true-false.js: TF bottom strips (R-d).

## Verdicts

- **placevalue:expand — VERDICT: PASS** (Part 0; deal re-checked, every grade >= 8).
- **placevalue:identify — VERDICT: PASS** (F3, F4 fixed; r3 grades stand for every other page; E-A1 is ENGINE-ROLES by ruling —
  if the lead rules it pv, the lesson p2 C3 is 7 and identify fails until the picture or its drawing is fixed).
- **placevalue:value — VERDICT: PASS** (G1 fixed; r3 / r3b grades stand for every other page).
- **placevalue:combine — VERDICT: PASS** (F1, F2 fixed; every pv-owned page graded here >= 8; r3 grades stand for the rest).

## PNGs graded (root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3c/`)

- expand: `expand/placevalue__expand/{independent,more-practice,test,review,true-false,guided,error-analysis}-{S,M,L}-p1.png`,
  keys `independent-S-key-p1.png`, `test-L-key-p1.png`, `error-analysis-M-key-p1.png`;
  `expand-b99/placevalue__expand/independent-{S,L}-p1.png`. Plus the r3b list for expand (critic-r3b.md, "PNG list for
  placevalue:expand").
- identify: `lessons/placevalue__identify/lesson-{S,M}-p{1,2,3}.png`, `lesson-L-p{1,2,3,4}.png`, `lesson-M-key-p2.png`; plus the r3 renders
  for every other identify page.
- value: `lessons/placevalue__value/lesson-{S,M,L}-p{1,2,3}.png`, `lesson-M-key-p2.png`; plus the r3 / r3b renders for every other value page.
- combine: `combine/placevalue__combine/{independent,more-practice}-L-p1.png`, `independent-L-key-p1.png`, `test-{M,L}-p1.png`,
  `review-L-p1.png`, `{true-false,guided,error-analysis,scripted-model}-{S,M,L}-p1.png`, `opener-{M,L}-p1.png`,
  `lesson-{S,M,L}-p{1,2,3}.png`; `combine-b99/placevalue__combine/independent-{S,M}-p1.png`; plus the r3 renders for the rest.
