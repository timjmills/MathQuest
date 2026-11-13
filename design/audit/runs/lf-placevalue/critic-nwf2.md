# lf-placevalue critic nwf r2: composing:number_word_form (independent critic, Opus medium)

Branch `claude/lf-placevalue-w2`, code at 706d940a (HEAD 11483654 adds only the brief). Renders are under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-nwf2/` (root R). Browser commands were run one at a time:

- `R/main`: lesson, scripted-model, guided, true-false, reason-it, opener, error-analysis, independent, more-practice and test at S/M/L, with keys. Also the card at 390/820/1280, the worksheet and the quiz.
- `R/opt-{b20,b1000,zs,za,tw,hto}`: independent S and L for each option value. `zs`/`za` are band 1000 with zeroPlace some/always. `hto` is band 1000 + some + answerSlot hto.
- `R/tf-hto`: true-false and reason-it at S/L with band 1000 + some + hto.
- `R/lesson1`: `ws-detailed-lesson --check`. It printed `ws-detailed-lesson: OK`, 30 PNGs.
- `ws-cell-checks --words-rules` on independent and lesson at L with `{"band":1000,"zeroPlace":"always"}`.

Pixel distances are measured on the PNGs: 794 px = 210 mm (3.78 px/mm), and 909 px = 210 mm for lesson 1.

## Grade table (C1-C2-C3-C4)

| Page | S | M | L | Note |
|---|---|---|---|---|
| lesson p1-p3 + keys | 8-8-**7**-8 | 8-8-**7**-8 | 8-8-**7**-8 | The lesson now deals its own options (band 1000, hto). The model 431 is right and shows its answer (4 black, 3 1 grey). The chant "Every box gets a digit." matches the items. The p2 guided "one hundred thirteen" now has its space. The keys are right. **p3 item 3 "one thousand": its Th H T O boxes sit 6.6 mm (M) / 7 mm (L) above item 4's boxes in the same row (N10).** Nit: the step text reads "3 tens, 1 ones." |
| scripted-model | 8-7-7E-8 | 8-7-7E-8 | 8-7-7E-8 | The steps are true for a 2-digit number (tens word, ones word, write the digits), and row 3 shows 35 in grey (N3, N5 fixed). Rows 1 and 2 are the same picture: "Read the tens word" has no underline on "thirty" (N12, minor). The empty lower page is a D3 row layout |
| guided | 8-8-7E-8 | 8-8-7E-8 | 8-8-7E-8 | The Model 53 is written in grey. The faded hints are true ("twenty-six": 2 tens, 6 ones). The bands are D3 |
| opener | 8-8-7E-8 | 8-8-7E-8 | 8-8-7E-8 | The Model 75 is written. The steps fit 2-digit numbers. "one hundred" is on its row's line |
| true-false + key (default) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | M: 3 True and 3 False. The wrong claims are 38 for eighty-three (reversal) and 904 for ninety-four (M10, chunk). S: 4 of 8 False. The key is right |
| true-false hto + key | 8-8-8-8 | - | 8-8-8-8 | The claim prints one digit a box (852 for 825, 914 for 941, 220 for 202). The key is right (N2 fixed) |
| reason-it (default / hto) | 8-8-7E-8 | 8-8-7E-8 | 8-8-7E-8 | Now 3 items (M) and 2 (L): the role's own capacity. The misconceptions are real (708/78, 93/39, 304/34; 737/773, 320/302) |
| error-analysis | 8-8-7E-8 | 8-8-7E-8 | 8-8-7E-8 | 705, 95 and correct items, mixed. Out of the pass bar (RUBRIC scope note) |
| independent + key | - | 8-8-8-8 | - | Re-check. 21 items in 3x7. The answer lines are level |
| more-practice + key | - | - | 8-8-8-8 | Re-check. 15 items in 3x5. The key is right |
| test + key | 8-8-6E-8 | - | - | Re-check. "one hundred" (item 18) is now on its row's line (N4 fixed). The foot band is test.js (D3) |
| opt band 20 | 8-8-8-8 | - | 8-8-8-8 | 0-20, three across at S (21 items) and L (15). The key is right (band-20 red cleared) |
| opt band 1000 | 8-8-8-8 | - | 8-8-8-8 | Every 2-line name breaks after "hundred" (N8 holds). The answer lines are level |
| opt zeroPlace some / always | 8-8-**7**-8 | - | 8-8-**7**-8 | za L: the key is right (207, 105, 407, 1000, 720 ...). **Item 4 "one thousand": its line is 7.2 mm above the row (ws-cell-checks ROW-SLOT-Y FAIL, N10)** |
| opt to_words | 8-8-**6**-8 | - | 8-8-**6**-8 | 9 items / 6, one across. The 70 mm line would fit a two-across cell (about 93 mm wide), so half the page width is empty. I do not agree with the lane's position (N11) |
| opt answerSlot hto | 8-8-8-8 | - | 8-8-8-8 | S: 10 items in 2x5. The boxes are level |
| card 390 / 820 / 1280 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The kit `words` cell with one answer place: the input sits on the cell's line (N9 fixed). EB-SIDE at 1280 is the known screen-numeral class (agreed, D3) |
| worksheet 1280 | 8-8-8-8 | | | Kit cells, even grid, one input in the focused cell, a line elsewhere |
| quiz 1280 | 8-8-8-8 | | | Kit cell, one input |

E = a D3 ENGINE-ROLES band (graded, recorded, does not hold the skill).

## r1 findings

| Id | Status | Evidence |
|---|---|---|
| N1 | FIXED | T/F M 3/6 False, S 4/8. Reason It and error-analysis deal 2-digit misconceptions (reversal, chunk) |
| N2 | FIXED | tf-hto S/L: the claim is printed in the boxes |
| N3 | FIXED | The steps under 100 are tens word / ones word / write the digits |
| N4 | FIXED | for "one hundred" (test S 18, opener M). The same defect class survives for "one thousand" (N10) |
| N5 | FIXED | Scripted-model row 3 shows 35. The guided Model shows 53, the opener Model 75 |
| N6 | FIXED | The chant is "Every box gets a digit."; the lesson deals band 1000 + hto |
| N7 | FIXED | "one hundred thirteen" has its space (lesson p2) |
| N8 | FIXED | No break inside a hundreds phrase on b1000 S, za L or lesson 1 |
| N9 | FIXED | The card, worksheet and quiz draw the kit cell, with one answer place |

## New findings (pv-owned)

**N10. The "one thousand" cell puts its answer place 6.6-7.2 mm above its row.**
- Where: lesson p3, item 3, at S/M/L. Also independent with band 1000 whenever 1000 is dealt (za L item 4).
- Cause: `nameBox` in `cells/words.js` gives the two-line box only to names of 15 or more characters, so "one thousand" (12 characters) keeps a one-line height.
- Rubric: C3, "answer in the same place in every cell" (AX-4).
- Checks:
  - ROW-SLOT-Y already FAILS on za L (7.2 mm). The precritic path does not run it with the band 1000 options, so it is a precritic gap: add `{"band":1000,"zeroPlace":"always"}` to the option sets ROW-SLOT-Y runs on.
  - The rule's role list (`tests/lib/ws-words-cells.cjs`, `/^(independent|more-practice|test|review|true-false|mixed-practice)$/`) leaves out `lesson`. It passed lesson L although p3 row 2 is 7 mm apart. Add lesson (and the guided rows) to the list.

**N10b. Detailed lesson 1 p13 (Guided Practice row): the boxes of the model "seven hundred / thirty-five" sit about 7.4 mm below the boxes of "nine hundred one".**
- This is the same class as N10. The highlighted model cell and its neighbour do not share a name-box height.
- Same rubric and same check as N10: ROW-SLOT-Y on lesson pages, guided bands included.

**N11. to_words prints one across while two across would fit (C3 6).**
- The 70-100 mm write line fits a two-column cell.
- Check: ws-empty-band EB-SIDE on `--opts '{"wordform":["to_words"]}' --roles independent`. It must pass, or the capacity must be justified by a line-length measurement wider than half the body.

**N12 (minor, does not hold).** On the 2-digit scripted model, steps 1 and 2 have identical pictures: nothing in the cell marks the tens word or the ones word, while the 3-digit model underlines its part. Also "1 ones" in the step text (should be "1 one").
- Check: MODEL-STATES-DIFFER. Consecutive model states of the words cell must differ in ink or highlight. Also a plural check on the step strings.

## ENGINE-ROLES (D3, graded, recorded, not holding)

- test.js S foot band.
- review.js row bands.
- The row layouts of guided, scripted-model, opener, error-analysis and reason-it: empty lower page and inner bands.
- lesson.js warm-up bands.
- The card at 1280: EB-SIDE 36-42 % (a short name in a wide card). I agree with the lane that this is the screen-numeral class.
- The lesson accent (purple step marks) is the lesson-wide INK-30 rule, not pv.

## Lesson 1 verdict

`ws-detailed-lesson --check`: OK (E25-E41 PASS). The number-name cells on its pupil pages and keys are correct:
- the prerequisite names: 61 / 80 / 98 / 84;
- the model 567;
- 102, 990, 556, 137, 683, 811;
- 482 ... 514;
- the mixed 626, 421, 307;
- the exit slip 839 / 609.

All 2-line names break after "hundred". One regression-class defect: p13, the Guided row's answer boxes are about 7.4 mm apart (N10b). I could not tell from these renders whether this predates 706d940a (that commit changed the name box from bottom- to top-aligned). The other pages show no regression.

## VERDICT: FAIL

The (page, criterion) pairs that hold the skill (pv-owned):
- lesson p3 S/M/L, C3 7 (N10);
- opt zeroPlace always / band 1000 when 1000 is dealt, S/L, C3 7 (N10);
- opt to_words S/L, C3 6 (N11; I disagree with the lane's known-red position);
- detailed lesson 1 p13, C3 7 (N10b).

N1-N9 are all fixed. Practice, test, the hosts, band 20, band 100, the hto option and True or False? are at 8 or better.
