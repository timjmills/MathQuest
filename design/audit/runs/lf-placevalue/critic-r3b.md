# lf-placevalue critic r3b (second independent critic, Opus medium, 2026-11-08)

This completes critic round 3 for `placevalue:value`, `placevalue:expand` and `placevalue:unit_form`: the pages the first r3 critic
(`critic-r3.md`) did not render. I did not build this work. Branch `claude/lf-placevalue` at `aacae5ea`. A builder was editing
`cells/pv.js` for combine during this run. Combine and identify are not graded here.

**Renders** are under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3b/`. Browser commands
were run one at a time.
- `main/placevalue__{value,expand,unit_form}/`: lesson, opener, reason-it, more-practice, error-analysis, guided and scripted-model,
  at S, M and L, with keys (162 pages).
- Option values, independent page at S and L, with keys:
  - `opt-value-b9999` (band 9999);
  - `opt-value-unit`, `opt-value-notation` (value form);
  - `opt-uf-more` (unit_form rename=more);
  - `opt-ex-line`, `opt-ex-notation` (expand frame and form).
- Band 99 for expand and unit_form: I used the first critic's `critic-r3/opt-b99/` renders and re-measured them with ws-empty-band on
  this tree.
- `ws-empty-band --skill <s> --opts <json> --roles independent --hosts none` was run on all 8 option values (S, M and L each).

**Measures.** Pixels are from 96-dpi PNGs, using `critic-r3/scan.py` and `critic-r3b/side.py`. The bands follow the ws-empty-band
method the lead ratified: a band fails at 30 % or more of the cell's inner height or width.

**Scope.** Error analysis is out of the pass bar (RUBRIC scope note, owner 2026-09-26), so it is graded for information only.
Stretch, fact-probe and fact-rows are out of scope.

## 1. Grades (C1-C2-C3-C4; pv-owned unless marked)

### placevalue:value

| Page | S | M | L | Measured |
|---|---|---|---|---|
| **lesson** | **7-7**-8-8 pv (G1) | **7-7**-8-8 | **7-7**-8-8 | The vocabulary match has two right answers (G1). The warm-up heading is right ("Circle the place of the underlined digit."). Page 1 has a 23 % strip, and page 3 is byte-identical at S, M and L (ENGINE, E1) |
| opener | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S: 2 models, 4 guided, 8 independent. The page fills to 67 %, and the second Model cell is blank (ENGINE, E2) |
| reason-it | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The keys are right (900 / 9 / 90 / 900). The wrong values are real errors (digit alone, place unit, the place's own value). The response area is R-a (ENGINE) |
| more-practice | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 30 / 24 / 18 items. M raw band 34 %, which is 26 % on the inner bottom |
| guided | 8-8-8-8 (ENGINE C3) | same | same | S: model plus 10 items. The model row's band is 38 % (guided.js, E3) |
| scripted-model | 8-8-8-8 (ENGINE C3) | same | same | S: the page is half empty (H5). Steps 1-3 draw the same blank line (F14, ENGINE) |
| error-analysis (out of bar) | 8-8-6-8 | 8-8-6-8 | 8-8-6-8 | Bands are 48 / 50 / 39 % (error-analysis.js rows at the 6/4/4 ceiling, E5). Keys are right |
| option band=9999 (N5) | 8-8-8-8 | - | 8-8-8-8 | S has 30 items (3x10); L has 18 (3x6) with an 18 % band. ws-empty-band is OK. Th H T O is printed with commas. **N5 FIXED** |
| option form=unit | 8-8-8-8 | - | 8-8-8-8 | S 16 items (2x8), L 5 (1x5; capacity pin). Side bands are 20 %. The key reads "1 one" for a ones digit and plural elsewhere. ws-empty-band OK |
| option form=notation | 8-8-8-8 | - | 8-8-8-8 | S 21 (3x7), L 10 (2x5). The keys are right (6 x 10, 1 x 1, 4 x 100). ws-empty-band OK |

### placevalue:expand

| Page | S | M | L | Measured |
|---|---|---|---|---|
| lesson | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The vocabulary is unambiguous: 400+70+2 is expanded form, 7 -> 70 is value, H T O is place. The model is 304 = 300 + 0 + 4, so the zero place is kept. The warm-up uses value, then band 99 expand. G3 is minor. The step states are ENGINE |
| opener | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | ENGINE E2: S and L hold 1 model and 1 guided item and no Independent row, so the page is 63 % (S) and 55 % (L) empty (H5, opener.js) |
| reason-it | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The keys are right. The errors are real: x10 shift (1,000 + 300 + 20), digits alone (2 + 3 + 0), and a zero place dropped and shifted (400 + 10 + 6). At L the A/B frames stack in 3 lines and stay readable |
| more-practice | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 15 / 12 / 10 rows. Side bands are 27 %. The keys are right (503 = 500 + 0 + 3) |
| guided | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S: model 701 = 700 + 0 + 1 plus 9 rows. Side bands 27 %, and the model's bottom band is 27 % |
| scripted-model | 8-8-8-8 (ENGINE C3) | same | same | S: the page is 37 % empty, and the boxes stay empty in steps 1-3 (F14, ENGINE) |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-7-8 | 8-8-8-8 | precritic shows M at 41 %. The keys are right (103 = 100 + 0 + 3) |
| option frame=line | 8-8-8-8 | - | 8-8-8-8 | S 15 rows with side bands of 26 %, L 10 rows. ws-empty-band OK. Minor point G4 |
| option form=notation | 8-8-8-8 | - | 8-8-8-8 | S 16 (2x8), on two lines with the right keys. L 6 (capacity pin), wrapped after "x 10" and readable. ws-empty-band OK |
| option band=99 | 8-8-8-8 | ENGINE | 8-8-8-8 | S and L are as the first critic graded them. M has EB-SIDE 33 % on 10 cells: TWO_COL_ROWS / layout.js N8, owned elsewhere by the brief |

### placevalue:unit_form

| Page | S | M | L | Measured |
|---|---|---|---|---|
| lesson | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The vocabulary is unambiguous: 300 is hundreds, 3 rods are tens, 4 cubes are ones. The model is 413 = 4 hundreds 1 ten 3 ones, and practice keeps zero places (709, 307). The key is right. Step states are ENGINE (steps 2 and 3 show empty boxes) |
| opener | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | ENGINE E2: S holds 1 model (wrapped to 2 lines), 1 guided and 2 independent, with the page 45 % empty |
| reason-it | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | The keys are right (A/B). The key text "2 hundreds 9 tens 7 ones" overprints "The answer is" at S, M and L: R-a, ENGINE (reason-it.js) |
| more-practice | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 15 / 12 / 10 rows |
| guided | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| scripted-model | 8-8-8-8 (ENGINE C3) | same | same | F14: the boxes stay blank in steps 1-3 |
| error-analysis (out of bar) | 8-**6**-8-8 | same | same | **G5**: the Fix-it frame of 193 prints "hundred" beside an empty box, which tells the pupil the answer is 1 (r2 F23, still open) |
| **option rename=more (N6)** | 8-8-**6**-8 H13 pv | 8-8-8-8 | 8-8-8-8 | **G2**: S rows "539 = ____ tens 9 ones" leave 54.3 mm of a 184.9 mm cell on each side. ws-empty-band EB-SIDE FAIL on 8 of 15 cells (30-31 %). The bottom band is fixed (r2's 57 %). Keys right (7 hundreds 12 tens = 820, 605 = 60 tens 5 ones, 107 = 10 tens 7 ones) |
| option band=99 | 8-8-8-8 | - | 8-8-8-8 | S has 27 items (3x9) on two lines, "53 = [ ] tens / [ ] ones". L has 10 rows with 26 % side bands. ws-empty-band OK |

Screen hosts for all three skills (card-1280/820/390, worksheet-1280, quiz-1280) were graded by the first r3 critic. It found no
pv-owned host below 8. SCREEN-DIGIT and the value box are ENGINE (hosts).

## 2. pv-owned findings

**G1 (C1 7, C2 7): value lesson vocabulary has two right answers.** All sizes. The data is pv-owned:
`js/modules/lessons/prereqs.js` `'placevalue:value'.vocab`.
- **What:** the words are place, worth and value. The pictures are "6 -> 600" (value), "H T O" (place) and "600" (worth). The
  meanings are "what a digit is worth" for value and "how much it is" for worth. In this lesson the two words name the same thing.
- **Effect:** a pupil who links value to "600" and worth to "6 -> 600" is right, but the key marks them wrong. This is the same class
  as r3 F3 (identify "underlined").
- **Fix:** replace "worth" with a word that has its own picture. For example, use "digit" (picture "6"), or "hundreds" with a
  hundreds flat.
- **Check:** a LESSON-DATA rule in the lesson vocab lint:
  - no vocab meaning uses another vocab word of the same lesson ("value: what a digit is *worth*");
  - no picture's text is contained in another picture's text ("600" is inside "6 -> 600").
  Run it with the F3 rule (a picture for a mark draws the mark).

**G2 (C3 6, H13 width): unit_form rename=more at S.**
- **Cause:** the "N = ____ tens N ones" row is drawn centred in a 184.9 mm full-width row with a 26 mm answer line. The ink spans
  70 mm (x 265-528 px of 47-747), so each side band is 54.3 mm: 30-31 % on the ws-empty-band inner width.
- **Where:** the "7 hundreds 12 tens = ____" rows are at 29 %, just inside the limit, and L passes. M passes.
- **Fix:** do one of these:
  - widen the answer line at S, as at L where the line is 40 mm;
  - set the row in 2 columns.
- **Check:** this is already caught by `ws-empty-band --skill placevalue:unit_form --opts '{"rename":"more"}' --roles independent`
  (EB-SIDE FAIL 8). The default precritic plan runs option variants on L only (r3 F2). It must run every §7a option value at S
  and M as well.

**G3 (minor, no grade change): the expand lesson model's Say line drops the zero place.**
- **What:** the model writes 304 = 300 + 0 + 4, and the lesson's own concept says "A zero place is written too". The Say line reads
  "304 is 300 plus 4".
- **Fix:** have the Say line follow the item: "304 is 300 plus 0 plus 4", or "300 plus 4: no tens".
- **Check:** a Say-line rule. The Say band's numbers equal the model's written parts in order.

**G4 (minor): the expand frame=line key prints only the short form.** The key reads "200 + 1" and "600 + 2". The option help says
"300 + 5 or 300 + 0 + 5 both right", and the default frame teaches the zero place. A teacher marking from the key may mark
"200 + 0 + 1" wrong. Print both forms in the key, or print the zero-place form, which is the one the skill teaches.

**G5 (out of bar, information only; r2 F23 not fixed): the unit_form error-analysis Fix-it frame word gives away the answer.**
- **What:** for an item with a 1 in a place, the Fix-it frame's words come from the answer string "1 hundred 9 tens 3 ones", so the
  pupil page prints "[ ] hundred". The singular word tells the pupil the answer is 1. The words are taken through
  `error-analysis.js` `answerParts`/`glueOf` from the pv answer display.
- **Fix:** do one of these:
  - write the frame words from the place list (as the `build` branch does with `PW`), never from the answer;
  - make pv's answer display always plural.
- **Check:** an ANSWER-LEAK rule. The text around the Fix-it slots on the pupil page must be the same for every value of the slot.

**G6 (minor, no grade change): steps differ inside the expand and unit_form packets.**
- **What:** the guided and opener pages use the provider steps ("Start with the digit on the left. ... Put + between the parts.").
  The lesson uses `prereqs.js` steps ("Hundreds digit: its value. ...").
- **Fix:** use one step script per skill.
- **Check:** a LESSON-DATA rule: `prereqs.steps` text equals `provider.workedSteps` labels.

## 3. ENGINE-ROLES findings (graded, not counted against pv)

- **E1, lesson.js:**
  - page 1 (the model) ends 20-23 % above the footer;
  - the lesson practice page (p3) is byte-identical at S, M and L for value (md5), and identical at S and M for expand and
    unit_form, so the size setting does nothing there (L1, "Size ignored");
  - steps 2-3 of each model draw no change (F14).
- **E2, opener.js:**
  - expand S and L hold 1 model, 1 guided and 0 independent, with the page 55-63 % empty (H5, C3 3);
  - unit_form S holds 2 independent items, with the page 45 % empty;
  - value's second Model cell is drawn blank under "Model:".
- **E3, guided.js:** value guided S model row band 38 %, with 108 px rows about 35 % empty.
- **E4, reason-it.js (R-a):** the unit_form key overprints "The answer is" at S, M and L (ws-grade-render OVERFLOW). The response
  areas leave about 30 % under the A/B cards.
- **E5, error-analysis.js (out of bar):** value rows have bands of 48 / 50 / 39 %. The 6 / 4 / 4 ceiling stretches cells by up
  to 1.4 times.
- **E6, layout.js N8 / TWO_COL_ROWS:** expand band=99 at M has EB-SIDE 33 % on 10 cells.
- **E7, scripted-model.js:** value and expand at S leave 37-50 % of the page empty. The boxes stay blank in steps 1-3 (F14).

## VERDICT

The pv verdicts combine the first r3 critic's grades (independent, true-false, review and test at S, M and L; band 99; screen hosts)
with mine.

- **placevalue:value — VERDICT: FAIL.**
  - lesson C1 7 / C2 7 at S, M and L (G1, vocabulary data, pv-owned);
  - every other pv-owned page and option value is 8 or better;
  - N5 (band 9999) is fixed.
- **placevalue:expand — VERDICT: PASS.**
  - every pv-owned page type, size, option value and host is 8 or better;
  - the band 99 M side band is layout.js (E6);
  - G3, G4 and G6 are minor.
- **placevalue:unit_form — VERDICT: FAIL.**
  - option rename=more S, C3 6 (G2, H13 width, EB-SIDE red);
  - every other pv-owned page is 8 or better;
  - G5 is out of bar but should be fixed with G2.

Lowest pv-owned grade: 6 (unit_form rename=more S, C3).

### PNG list for placevalue:expand (PASS)

Root A = `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3b/main/placevalue__expand/`
- lesson-{S,M,L}-p{1,2,3}.png
- opener-{S,M,L}-p1.png
- reason-it-{S,M,L}-p1.png
- more-practice-{S,M,L}-p1.png
- guided-{S,M,L}-p1.png
- scripted-model-{S,M,L}-p1.png
- error-analysis-{S,M,L}-p1.png (out of bar)

Root B = `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3/main2/placevalue__expand/`
(the first critic's renders)
- independent-{S,M,L}-p1.png
- true-false-{S,M,L}-p1.png
- review-{S,M,L}-p1.png
- test-{S,M,L}-p1.png
- card-1280.png, card-820.png, card-390.png, worksheet-1280.png, quiz-1280.png

Options:
- `.../critic-r3/opt-b99/placevalue__expand/independent-{S,L}-p1.png`
- `.../critic-r3b/opt-ex-line/placevalue__expand/independent-{S,L}-p1.png`
- `.../critic-r3b/opt-ex-notation/placevalue__expand/independent-{S,L}-p1.png`

Each page has a matching `-key-` file in the same folder.
