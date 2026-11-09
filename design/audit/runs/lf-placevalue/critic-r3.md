# lf-placevalue critic r3 (fresh independent critic, Opus medium, 2026-11-08)

Branch `claude/lf-placevalue` at `0a2bf4a3`. I did not build this work and did not grade r1 or r2. The time limit was 50 min.

**Renders** are under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3/`:
- `main/placevalue__identify/`: every role (independent, more-practice, guided, scripted-model, error-analysis, test,
  review, true-false, reason-it, opener, lesson) at S, M and L, plus card-1280/820/390, worksheet-1280 and quiz-1280.
- `main/placevalue__value/`: independent, more-practice, guided, scripted-model, error-analysis, test and review at S, M and L.
  I stopped the full run here for time.
- `main2/placevalue__{value,expand,combine,unit_form}/`: independent, true-false, review and test at S, M and L, plus all
  five screen hosts.
- `opt-b99/`: all five skills on the independent page at S and L with `band=99`.

**Not rendered by me (time):**
- the lesson, opener, reason-it, guided and scripted-model pages for expand, combine and unit_form;
- the lesson, opener and reason-it pages for value;
- the option values other than band 99: band 9999 (N5), rename=more (N6), writeValue=false, response=bank,
  form=unit/notation, frame=line and order=scrambled.

**Measures.** Measures are from a pixel scan of 96-dpi PNGs (1 px = 0.265 mm), using the script `critic-r3/scan.py`. For the
bottom bands I accept the lead-ratified ws-empty-band method: the band runs from the lowest ink to the cell's *inner* bottom,
and fails at 30 % or more. My raw full-cell numbers include the 3 mm pad, so a raw 34-38 % equals 26-29 % on that method.
Side bands (EB-SIDE, RUBRIC H13 "or width") are taken from ws-empty-band's precritic-r5 log, and I checked them by pixel.

## 1. r2 findings

| r2 | Status | Evidence |
|---|---|---|
| N1 identify TF key wrong (H1) | **FIXED** | `main/placevalue__identify/true-false-S-key-p1.png`: all 8 keys right. 564 with the 6 underlined now draws "hundreds / 600" and the key is False, tens |
| N2 identify instruction omits the value | **FIXED** on independent, test and review: "Circle the place. Write the value of the underlined digit." | Not rendered with response=bank. New N11: the lesson warm-up now says "Write the value" over cells with no Value line |
| N3 combine one-part items at band 99 | **FIXED** | `opt-b99/placevalue__combine/independent-S-key-p1.png`: 27 of 27 items have two parts, keys right |
| N4 "hundreds" on 2-digit numbers | **FIXED** | `opt-b99/.../identify/independent-S-p1.png` shows T O with ones / tens. The lesson warm-up shows only ones / tens |
| N5 value band 9999 L 43 % | not re-rendered by me | precritic r5 `options-render --bands --band-h13` PASS, and cell-checks shows no independent row |
| N6 unit_form rename=more S 57 % | not re-rendered by me | precritic r5 as N5 |
| N7 unit_form review S, mixed combine cells | **FIXED** | `main2/placevalue__unit_form/review-S-p1.png`: 6 combine cells, all two-line, one geometry. Minor: ghost-backed digits leave a visible double gap ("600 +  10 +  1") |
| N8 2 columns asked → 1 column | **ENGINE-ROLES** (layout.js), not re-rendered | precritic matrix still RED, more-cols2 PAGEFILL |
| N9 minor | not re-checked | |
| R-a TF / Reason It "The answer is ___" sized by digit count | **NOT FIXED, ENGINE-ROLES** | `main2/placevalue__unit_form/true-false-S-key-p1.png`: "5 hundreds 1 ten 5 ones" prints over "The answer is". The identify TF key "hundreds" overprints "is" (items 1 and 6) |
| R-b guided hint lines | ENGINE-ROLES, not re-checked | |
| R-c review row height | **ENGINE-ROLES** | |
| R-d TF capacity | **NOT FIXED, ENGINE-ROLES** | unit_form TF holds 4 at S with a 20 % strip; combine TF M holds 6 with a 25 % strip |

## 2. Grades (C1-C2-C3-C4, cap, owner), pv-owned rows

| Skill / page | S | M | L | Measured |
|---|---|---|---|---|
| identify independent / more-practice | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 20 / 12 / 10 items. Full-cell band 15 / 16 / 8 %. Keys right |
| identify test | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| identify true-false | 8-8-8-8 (R-a overprint ENGINE-ROLES) | 8-8-8-8 | 8-8-8-8 | N1 fixed |
| identify band 99 | 8-8-8-8 | - | 8-8-8-8 | 28 at S (4x7), 12 at L (3x4), T O only |
| **identify lesson** | **7-7**-8-8 pv (N10) | same | same | The vocabulary match cannot be answered (N10). The warm-up instruction is wrong for its cells (N11). Page split, H13 and step states are ENGINE |
| value independent / more-practice | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 30 / 24 / 18 items. Raw band 15 / 34 / 18 % (M is 26 % on the inner bottom). Keys right |
| value band 99 | 8-8-8-8 | - | 8-8-8-8 | S 3x10, L 4x5 |
| expand independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 15 / 12 / 10 rows. Side bands 26 / 27 %. Zero place kept (3 boxes) |
| expand band 99 | 8-8-8-8 | - | 8-8-8-8 | S 3x9 rows across (r3 change), L 1x10 |
| unit_form independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 15 / 12 / 10. Keys right (605 = 6, 0, 5) |
| unit_form review S | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | N7 fixed |
| **combine independent / more-practice** | 8-8-8-8 (raw 38 %, 29 % on the inner bottom: near miss) | 8-8-8-8 | 8-8-**6**-8 H13 pv | L: 1 column of 185 mm cells. The = column is right-aligned, so two-part rows leave a 54-60 mm left band (30-34 % of the width): ws-empty-band EB-SIDE, 5 of 10 cells (F1) |
| **combine band 99** | 8-8-**6**-8 H13 pv | - | 8-8-8-8 | S is held to 3 across. "10 + 4" is about 70 px of ink in a 234 px cell, so each side band is about 35 % (F2). The default page fits longer 3-part items 4 across. 27 items |
| combine true-false | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | keys right (700504 is the concatenation misconception). Strip is R-d |

**ENGINE / ENGINE-ROLES, graded and not counted:**

| Page | Grade | Measured |
|---|---|---|
| identify guided S (guided.js) | C3 6 | model cell 225 px with a 95 px band (42 %) |
| identify lesson p1 (lesson.js) | C2 7 | step 4 "Circle the place" draws no ring until step 5 (F14) |
| identify review (review.js) | C3 7 | rows sized for the 32 mm disk zone |
| value test S (test.js) | C3 5 H5 | 20 items in 118 px cells, about 45 % band, plus a 25 % page strip |
| identify screen hosts | - | no Value box (F4). Numerals 30 px against the 56 px target (SCREEN-DIGIT, hosts) |
| TF / Reason It answer lines | - | R-a above |

## 3. Findings (r3)

**F1 (H13 width, C3 → 6; combine independent / more-practice L, pv).**
- **What:** each combine row is laid out right-aligned on a fixed = column inside a 184.9 mm full-width cell.
- **Measured:** the two-part items ("800 + 10 =", "600 + 9 =") leave 54.2-60.4 mm of empty space to their left, which is
  30-34 % of the cell width. This is on 5 of 10 cells (independent) and 5 of 10 (more-practice).
- **Cause:** `cells/pv.js` keeps the r1 F9 "= aligned" geometry across a full-width row.
- **Fix:** centre the aligned block in the row, or narrow the cell.
- **Check:** ws-empty-band EB-SIDE already reports it ([pv] lines in precritic-r5 empty-band.log). The lane took a red check
  to the critic. The precritic table should list EB-SIDE [pv] rows on independent / more-practice as blocking.

**F2 (H13 width, C3 → 6; combine band=99 S, pv).**
- **What:** the r3 change holds two-part band-99 frames to 3 across at S.
- **Measured:** "10 + 4" in a 62 mm cell leaves about 35 % empty on each side, and the page holds 27 items.
- **Fix:** 4 across holds 28 at the default band, with longer 3-part frames.
- **Check:** ws-empty-band `--opts '{"band":99}' --roles independent --sizes S` (EB-SIDE). The default ws-empty-band plan puts
  option variants only on L, so add S for the band values.

**F3 = N10 (C1/C2 → 7; identify lesson p2 vocabulary, pv data `lessons/prereqs.js` 'placevalue:identify'.vocab).**
- **What:** the "underlined" picture is the text "4 7 2 → 7", which has no underline. The "place" picture (heads H T O) is
  drawn with a rule under it.
- **Effect:** the picture a pupil reads as "underlined" belongs to "place", and the "underlined" word has no picture that
  shows it. The three-way match is ambiguous, and so is its key.
- **Fix:** draw 4 7 2 with the 7 underlined for "underlined", and use the plain digits picture for "digit".
- **Check:** a LESSON-DATA rule that a vocab picture for a word naming a mark (underlined, circled) draws that mark (picture
  kind `numeral` with `underline`), and that no other picture carries it.

**F4 = N11 (C1 → 7; identify lesson warm-up, pv data plus lesson.js heading).**
- **What:** the warm-up items come from `mixWith` identify `{band:99, writeValue:false}` and have no Value line, but the
  section heading reads "Circle the place. Write the value of the underlined digit."
- **Cause:** the heading comes from the lesson skill's key, not from the warm-up items' `q.instructionKey` (`place-circle`).
- **Owner:** if lesson.js owns section headings this is ENGINE-ROLES, and the lead should rule. I count it as pv because the
  N2 fix (an option-aware instruction) is pv's and stops short of the warm-up.
- **Check:** extend the N2 check (`ws-card-rulings` printed instruction) to every lesson section: the heading equals
  `INSTRUCTION_LIBRARY[q.instructionKey]` of that section's items.

**F5 (minor).**
- **What:** in the unit_form review mixed cells, the ghost-backed combine digits show doubled gaps ("600 +  10 +  1").
- **Check:** a text-gap lint on frames between operator and operand.

**Process.**
- The spec card is still unsigned: ws-spec-card shows INCOMPLETE.
- Precritic r5 has 15 FAIL gates. F1 was among them as EB-SIDE [pv], so the lane brought a red pv check to the critic.

## VERDICT

- **placevalue:identify — VERDICT: FAIL.** Lesson C1 7 / C2 7 (F3 vocabulary match, F4 warm-up instruction). Every other pv
  page I graded is 8 or better, and N1, N2 and N4 are fixed. Not rendered by me: writeValue=false and response=bank.
- **placevalue:combine — VERDICT: FAIL.**
  - independent and more-practice L, C3 6 (F1, EB-SIDE);
  - band=99 S, C3 6 (F2).
  - N3 is fixed.
- **placevalue:value — VERDICT: INCOMPLETE (not a pass).** No pv-owned page I rendered is below 8. Still to render: the lesson
  (whose vocabulary data is pv-owned, as F3 shows), opener, reason-it, and option values band 9999 (N5) and form unit/notation.
- **placevalue:expand — VERDICT: INCOMPLETE (not a pass).** No pv-owned page I rendered is below 8. Still to render: lesson,
  opener, reason-it, guided, scripted-model, form=notation and frame=line.
- **placevalue:unit_form — VERDICT: INCOMPLETE (not a pass).** No pv-owned page I rendered is below 8, and N7 is fixed. Still to
  render: lesson, opener, reason-it, guided, scripted-model and rename=more (N6).

No skill passes this round, so no PNG list is given for deployment.

**ENGINE / ENGINE-ROLES (graded, not counted):**
- R-a and R-d (TF / Reason It answer line and capacity);
- guided, review and test bands;
- lesson step states and page split;
- N8 (layout.js 2-column);
- screen value box and SCREEN-DIGIT.
