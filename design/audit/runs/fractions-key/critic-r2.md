# Critic round 2 — Fraction key (option ids, Check-ALL, whole sums), lane adbb61b8450078736 @ 1d8cb73

Independent critic, 2026-10-09. Graded from fresh renders and runs only, against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md,
PEDAGOGY_STANDARD.md, LESSONS_LEARNED.md and the owner ruling of 2026-10-03 ("fraction sums use the same whole + fraction
boxes on every item; 1 or 5/5 accepted"). No code was changed.

## Verdict: FAIL

Most of round 1 is fixed: no option id survives anywhere (105 choose-all skills swept), the odd/even sort key follows
the paper task, the quiz draws and grades choose-all lists, every add item prints the same whole + fraction boxes, the
card and the quiz accept 1, n/n, 1 0/n, mixed and improper answers, and the independent / more-practice pages say
one instruction per section. The lane still fails, for four reasons:
**(1)** the online worksheet marks 9/9 and 8/8 **wrong** for a sum of 1. This breaks the owner ruling on one of the three
screen hosts. **(2)** The test and mixed-practice pages are a **regression**. A choose-all item is now a full-width row,
so the S test drops from 9 items to 3 and the L mixed page from 4 to 2. The section still reads "Add." above "Circle all
sums that equal 1.", and the cells are 36 % empty. **(3)** On the L practice pages the empty space of D9 has moved
inside the cells. **(4)** On the practice card, the "missed" tag covers the numerator of the option it marks.

Merge check: `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` → clean (tree 9fd912d). Main c91cc8b is
an ancestor of 1d8cb73, so the merge is a fast-forward.

## What was run

Probes, logs and PNGs: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/frac-critic-r2/`
- Gates: `ws-boot-smoke` OK; `ws-code-snapshot` OK (608 codes, nothing moved); `ws-screen-answer --skills` the
  three skills plus select_even_odd, percent_visual (conversions), identify_angles, mixed_composing, counting_all,
  select_equiv_frac: all OK (card, worksheet 3/3, quiz with a forced choose-all item 3/3 or 4/4, live green). The
  first call's `fractions:percent_visual` ERR was my wrong category id; it passes as `conversions:percent_visual`.
  `ws-content-audit` does not cover fraction_operations ("no skill matched"). Every changed JS file passes
  `node --input-type=module --check`.
- `print-r2.cjs` → `print/<skill>/`: every role (independent, more-practice, guided, review, test, mixed-practice,
  true-false, reason-it, stretch, scripted-model, opener, error-analysis) at S and L, pupil and key, for the three
  skills. The practice roles use a seed whose page holds a choose-all item and, for the add skills, a whole sum.
- `sweep-r2.cjs` → `sweep/`: all 105 skills that can deal a choose-all item, independent L, 6 seeds each (20 for the
  odd/even and picture skills). The sweep checks for option ids in the key text, compares the key's rings with the
  answer's ids, and for the sort checks that every number is marked, the rings are even and the crosses are odd. It
  also records the section lines and the cell verbs.
- `screens-r2.cjs` → `scr/`: practice card 390 / 1280 (a choose-all item, a whole sum, a mixed sum, a plain sum),
  online worksheet 1280 / 390, quiz 390 / 1280 with the choose-all item answered by taps, the quiz results, and a
  quiz submitted wrong to show every "Answer:" line.
- `accept.cjs` / `accept-ws.cjs` → `acc/`: acceptance tries. Each try uses a fresh page and checks that the item on
  screen is the seeded one. The worksheet boxes are typed with the keyboard.
- `stats.cjs`: 600 seeds per skill. `bands.cjs`: empty bands inside each cell (H13). `one.cjs`: single renders, and
  the base tree c91cc8b for comparison (`base/`).

## Round 1 defects, re-proved

| Id | Status | Evidence |
|---|---|---|
| D1 odd/even sort key | **Fixed** for select_even_odd and counting_all; **partly open** in mixed_composing | sweep: 20/20 seeds, every number marked, rings even, crosses odd (`sweep/select_even_odd-s1-key-p1.png`, `counting_all-s18-key-p1.png`). In mixed_composing, item a comes from `composing:odd_even` (`ans "0,1,3,4"`, not option ids). It prints as tiles with an extra "Answer: ____" line, so it asks for two responses. Its key is the list stamp "Circle: 46, 14, 62, 100; Cross out: 41" and nothing is marked on the tiles (H10 for that item; `sweep/mixed_composing-s1-*.png`). |
| D2 quiz choose-all + ids | **Fixed** | Quiz cell `msc` draws 5 options at 92 x 57 px at 390 and 1280, with no horizontal scroll. Taps record `opt0,opt3`. Score 3/3 (add like, unlike) and 2/2 (sub). The results page and the wrong-answer review contain no `opt\d`; they read "Answer: 3/8 − 2/8; 8/8 − 7/8". The quiz builder was checked in the code only (`answerLabelOf` at both "Answer:" sites and in the option chips); it was not rendered. Residual minor: the results breakdown still prints the generator text "Click ALL sums greater than 1." (see N6). |
| D3 two instructions | **Fixed** on independent and more-practice; **open** on test and mixed-practice | sweep: on independent pages the "Circle all the correct answers." line appears once and the cell keeps only its criterion ("Sums that equal 1."). The odd/even sort uses its own library line `sort-even-odd` (PEDAGOGY 10.1 and contract.js). On test S / L (`print/add_fractions_like/test-*.png`) and mixed-practice S / L, the section says "Add." and the cell says "Circle all sums that equal 1.", two verbs for one task (all three skills). fraction_of_set prints "Circle all the correct answers." above "Circle 2/3 of the [pizza emoji]." (outside the graded skills; the colour emoji is also an H4). |
| D4 one slot shape; 1 or 5/5 | **Print, card and quiz fixed; worksheet open (critical)** | Every add_fractions_like and add_frac_unlike production cell on every role prints whole box + fraction bar. The key writes the simplest form and a dash in each unused box. Card (fresh page per try): 1 ✓, 2/2 ✓, 1 0/2 ✓, 1/2 ✗ (correct verdict), 1 2/5 ✓, 7/5 ✓, 2/4 for 1/4 + 1/4 ✓; unlike: 1 ✓, 8/8 ✓, 1 5/12 ✓, 17/12 ✓. Quiz: 2/2, 8/8, 7/5 and 17/12 all scored correct. **Online worksheet: 1/9 + 8/9 typed as 9/9 → WRONG; 3/6 + 4/8 typed as 8/8 → WRONG; 1 in the whole box → CORRECT** (`acc/acceptws-*.png`, `acceptws.log`). |
| D5 card lone whole slot | **Moot** for these skills | No add or sub item deals the lone `w` slot any more. Not re-checked for `div_unit_fraction`, the one remaining generator of that slot (gen-fractions.js:3039); recorded as a follow-up, not scored here. |
| D6 picture options | **Fixed** | percent_visual: the key rings the grid pictures, and none of the 105 skill keys has an option id. Residual minor: grade_5_mixed (geo_rotate, a picture choice with one answer) keys "Answer: C" as a stamp with no ring (a letter, not an id; H10-style; `one/grade_5_mixed-5-*.png`). |
| D7 slashed fractions in choose-all | **Fixed** inside the cells | Print prompts and options are stacked; card, worksheet and quiz options and prompts are stacked ("less than ½" stacked). Residual: see N6. |
| D8 hyphen for minus | **Fixed** | The sub options print U+2212 on paper and on screen. |
| D9 page under-fill | **Partly fixed** | S pages fill: independent S holds 8 items, sub S 6, unlike S 6. L independent and more-practice still deal 3 items; the spare height is shared out into the cells instead. The choose-all cell has a 30 % bottom band and the production cells 21 % bottom plus a matching top band (`bands.log`, `print/*/independent-L-*.png`) → H13 on the choose-all row. On test and mixed-practice the count falls (N2). |
| D10 Check-ALL card differs | **Fixed** | Worksheet and card: the options sit in the cell, there is no Submit or counter, the verb is "Tap", and CHECK ALL / Check grades the rings (worksheet verdict CORRECT; card: right set ✓, right + one wrong ✗). Residual: N4 (the feedback tag covers a numeral) and the small option numerals on the worksheet card. |
| F1 sort line in the library, not repeated in the cell | **Fixed** | `sort-even-odd` in PEDAGOGY 10.1 and contract.js; the cell keeps no copy (`sweep/select_even_odd-s1-*.png`). |
| F2 card choose-all checked by the card's Check | **Fixed** | `accept.log`: ms right ✓ / wrong ✗ on add like and sub like. |
| Nit: identify_angles section line | **Fixed** | A mixed section says "Solve." and the choose-all cell keeps "Circle all the acute angles in this shape."; a section of choose-all items alone says the circle-all line once. Key rings correct (angle A only in the trapezoid). |
| Nit: select_even_odd I Can | **Fixed** | "I Can circle the even and odd numbers". |

## New defects

**N1 · critical · worksheet C2 → 3 (H1: a correct answer is marked wrong) · the online worksheet rejects n/n**
- Where: `acc/acceptws-add_fractions_like-9_9.png`, `acceptws-add_frac_unlike-8_8.png`; `scr/add_fractions_like-worksheet-checked-1280.png`.
- Observed: the three boxes join to "9/9" and CHECK ALL marks the card red. "1" in the whole box is marked green.
  The card and the quiz accept 9/9, because of recordAnswer's `fracParse` in quiz-take.js and the card's fraction
  equivalence; checkAllWorksheet has no frac-model equivalence.
- Fix: in `checkAllWorksheet`, give `q.cell.template === 'frac-model'` the same value-equivalence check the quiz uses
  (n·d' = n'·d over the joined "w n/d"). That accepts 1, 5/5, 1 0/5, 7/5 and 1 2/5, and also the unsimplified 2/4
  the card already accepts.
- Proof: `accept-ws.cjs` → 9/9, 8/8, 1, 1 0/9 and 2/4 marked CORRECT, 8/9 WRONG. Add a whole-sum n/n case to
  `ws-screen-answer`'s worksheet host.

**N2 · major · REGRESSION · test and mixed-practice: choose-all rows shrink the page and keep two verbs**
- Where: `print/add_fractions_like/test-S-*.png` (3 items: base c91cc8b dealt 9, `base/add_fractions_like-1-test-S-pupil-p1.png`),
  `test-L-*.png` (2 items, "Score /2"), `mixed-practice-L-*.png` (2 items: base 4, 35 % of the page blank),
  the same on sub_fractions_like and add_frac_unlike. bands: test cells 36 % bottom band (H13).
- Observed: since the lane, a choose-all item fills a full-width row on these roles too, but the roles do not re-deal.
  A test of add fractions then holds 2–3 items, two of them choose-all comparisons, under "Add." with the cell
  saying "Circle all ...".
- Fix: apply D3 and D9 in the role modules (test.js, mixed-practice.js): print the choose-all row under its own
  library line (or "Solve." for a mixed group) and strip the cell verb, as practice.js does. Re-deal the count after the
  full-width rows are placed. Cap choose-all items on a test (at most one per page) so the page tests the named
  operation.
- Proof: test S ≥ the base count, with no cell verb under "Add."; ws-print-lint PAGEFILL / H13 clean on test and
  mixed-practice at S and L for the three skills.

**N3 · major · sub_fractions_like C2 −2 · the "less than ½" list does not discriminate**
- Where: `print/sub_fractions_like/more-practice-L-key-p1.png` (both items choose-all, item a has all 5 options correct,
  and no subtraction is written on a "Subtract" page); `stats.log`: of 137 choose-all items in 600 seeds, 22 (16 %) have
  all 5 options correct and 46 (34 %) have 4 of 5.
- Fix: deal 2–3 correct of 5 (as add like does: 1–3), and at least one near miss (a difference equal to ½).
  At most one choose-all item per production section.
- Proof: stats over 600 seeds show no all-correct list and 1–3 correct options; more-practice L holds production items.

**N4 · major · card C1 −2 (H2 at feedback) · the "missed" tag covers the option's numerator**
- Where: `scr2keep/add_fractions_like-cardtry-ms_one_wrong.png`, crop `crop-missed.png`: the amber "missed" pill sits
  on the "4" of 4/6, which cannot be read. The wrongly ringed option shows no mark after "3 correct, 2 to fix", so the
  pupil cannot see which ring was wrong.
- Fix: place the tag under or beside the option (outside the stacked fraction box), and keep a wrong mark on the
  wrongly ringed option until the pupil taps it.
- Proof: a 3x crop after a wrong check shows every numeral clear and one mark per option that needs fixing.

**N5 · minor · key C4 −1 · key rings touch the numerals**
- Where: `crop-ring.png`, `crop-ring2.png` (unlike more-practice L): the ring passes through the corners of 4, 5, 3 and 6.
- Fix: pad the ring by ≥ 1 mm around the option's box (RM-08: "each ring area ≥ Hw + 4 tall").

**N6 · minor · C4 −1 (TY-7, H7) · slashed fractions and "Click" around the cells**
- The production card, worksheet and quiz print the generator line "Calculate: 1/2 + 1/2 = ?" slashed above the stacked
  cell, so the item is shown twice (`scr/add_fractions_like-whole-card-390.png`; pre-existing, also on base).
- Guided worked steps print "That is 7/5. 7/5 = 1 2/5." (`print/add_fractions_like/guided-L-pupil-p1.png`), and the
  true-false key writes "1 2/5" on the line.
- The quiz results breakdown prints "Click ALL sums greater than 1." (screen verb is Tap).

**N7 · major · model C2 −3 · scripted-model and opener model a choose-all item**
- Where: `print/add_fractions_like/scripted-model-L-pupil-p1.png` and `print/add_frac_unlike/opener-L-pupil-p1.png`.
  The model is "Circle all sums that equal 1", shown three times beside the steps "Add the numerators… Write the answer
  in simplest form" and the Say frame "__ plus __ is __", none of which fits the item.
- This is pre-existing (seed 1 deals the choose-all item first on base too), but these are the skill's model pages.
- Fix: the model and opener roles draw from production items only.

**Not scored here (outside this lane's change, recorded for the lead):** stretch cannot be produced for any of the
three skills ("No Stretch for this skill yet", H11 → all four = 1 for that version, pre-existing). fraction_of_set prints
a colour emoji in the printed cell (H4). The worksheet choose-all option numerals are about half the production digit
size. The add like generator deals a sum of 1 on 18 % of items and allows commuted duplicates on one sheet (1/9 + 8/9 and
8/9 + 1/9 on one 6-card worksheet).

## Scores

`ms` = the version holds a choose-all item. Caps in brackets.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent S (ms, whole) + key | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | independent L (seed 11, ms, whole) + key | 8 | 8 | 6 [H13] | 8 | no |
| add_fractions_like | more-practice S + key | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | more-practice L + key | 8 | 8 | 6 [H13] | 8 | no |
| add_fractions_like | guided S / L | 8 | 8 | 8 | 7 | no (N6) |
| add_fractions_like | review S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | test S / L | 6 | 5 | 6 [H13] | 7 | no (N2) |
| add_fractions_like | mixed-practice S / L | 6 | 6 | 5 | 7 | no (N2) |
| add_fractions_like | true-false, reason-it S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | scripted-model / opener | 7 | 5 | 7 | 8 | no (N7) |
| add_fractions_like | stretch | 1 | 1 | 1 | 1 | no (H11, pre-existing) |
| add_fractions_like | card 390 / 1280 | 8 | 8 | 8 | 7 | no (N4, N6) |
| add_fractions_like | online worksheet 1280 / 390 | 7 | 3 [H1] | 7 | 7 | no (N1) |
| add_fractions_like | quiz 390 / 1280 (+ results) | 8 | 8 | 8 | 7 | no (N6) |
| sub_fractions_like | independent S / L (ms) + key | 8 | 7 | 7 | 8 | no (N3; H13 on L) |
| sub_fractions_like | more-practice L (all choose-all) + key | 7 | 4 | 6 | 8 | no (N3) |
| sub_fractions_like | test / mixed-practice | 6 | 5 | 6 | 7 | no (N2) |
| sub_fractions_like | review, true-false, reason-it | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | card / quiz | 8 | 7 | 8 | 7 | no (N3, N4, N6) |
| sub_fractions_like | online worksheet | 8 | 7 | 7 | 7 | no |
| add_frac_unlike | independent S + key | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | independent / more-practice L + key | 8 | 8 | 6 [H13] | 7 (N5) | no |
| add_frac_unlike | test / mixed-practice | 6 | 5 | 6 | 7 | no (N2) |
| add_frac_unlike | opener / scripted-model | 7 | 5 | 7 | 8 | no (N7) |
| add_frac_unlike | card 390 / 1280 | 8 | 8 | 8 | 7 | no |
| add_frac_unlike | online worksheet | 7 | 3 [H1] | 7 | 7 | no (N1) |
| add_frac_unlike | quiz | 8 | 8 | 8 | 7 | no |

The regression sweep (105 choose-all skills) shows zero option ids, every key ring matching the answer, and the
odd/even sort correct.

## What blocks the pass, in order

1. N1: grade frac-model answers by value on the online worksheet, so 5/5 is accepted (owner ruling).
2. N2: carry the D3 / D9 fixes into the test and mixed-practice roles, restore their item counts, and cap choose-all
   items per page.
3. D9 at L: re-deal instead of stretching cells, so the choose-all row has no band ≥ 30 % (H13).
4. N4: the feedback tag must not cover a numeral.
5. N3: give the sub "less than ½" list 1–3 correct options.
6. The D1 remnant: draw `composing:odd_even` as the same ring / cross list with a facsimile key.

N5, N6 and N7 are needed for the 8/10 bar on the affected versions, but they are smaller (N6 and N7 are mostly
pre-existing).
