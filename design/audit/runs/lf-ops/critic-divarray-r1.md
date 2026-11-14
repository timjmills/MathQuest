# Critic: lf-ops "divarray r1" (landscape arrays, SIZE-INK, mult_facts Review fix)

Frozen tree: /home/user/mq-critic-divarray @ e3aa95d32. Critic: Opus medium, independent. Rubric: design/audit/RUBRIC.md.

## Verdict: FAIL

**div_facts (array support) passes on every host and page type.** mult_facts does not. Four defects bring it below 8:
- D1: the × 0 frame looks like an answer box.
- D2: Review S with touch leaves a 30 % blank strip.
- D3: the array pages print the same page at S, M and L.
- D4: arrays in Test and online-worksheet cells leave 36-45 % empty bands (H13).

The add_facts size change is clean.

**Lowest score: C3 = 6.** It occurs on mult_facts support=array, in the Test pages (S/M/L) and the online worksheet (1280; 820 has the same grid).

## Machine checks run (this tree)

| Check | Result |
|---|---|
| ws-screen-support-eq --skills mult_facts,div_facts (EQ, CUE, PLACE, ORIENT, DOT-MIN, CAPTION, FRAME) | OK. ÷ paper dot ratio 0.312 vs screen 0.431-0.486; × paper 0.194 vs screen 0.367-0.386 |
| ws-print-lint --source kit --supports array, roles independent / more-practice / test / review, div + mult, sizes S, M, L | 0 findings at each size |
| ws-print-lint --supports touch --size S --roles review, mult_facts | 0 findings (D2 is not caught: PAGEFILL does not run on review) |
| Console errors (ws-grade-render meta) | none |

## The brief's specific checks

| Check | Result |
|---|---|
| Every 2+ row array is landscape | YES for every ÷ frame. YES for every × array (min-factor rows). n × n is square, as ruled. A ÷ item with quotient 1 (4 ÷ 4) is a column of dots, but it sits inside the landscape section frame. |
| Screen dot ≥ paper dot | YES. ÷ screen dots are 4.5-7.1 mm against paper 1.96 / 2.41 / 3.32 mm (S/M/L). × screen dots are 4.0-5.7 mm against paper ≤ 1.9 mm. add tile / frame dots are 2.4 / 2.8 mm on screen. |
| Caption names the drawn rows × columns | YES. "array, 4 rows of 12"; "8 rows of 11, for 8 × 11"; "0 rows of 4, for 4 × 0". No caption gives the product. Nit N1: "1 rows of 1, for 1 × 1". |
| 5-group gaps | YES on paper and on screen (e.g. 7 rows of 11 = 5+2 by 5+5+1). |
| Nothing given away | YES. The ÷ array is the dividend in divisor rows, and the pupil counts a row. That is the support's intent (Read an Array). The × array is to be counted or skip-counted. |
| Clipped / overlapping / off cell | None. No horizontal scroll at 390. A 4 × 12 frame fits the 390 card and worksheet. |
| Paper = screen drawing | Same drawing. Placement differs for × (paper Independent beside, paper Test under, worksheet under, card beside at 1280 / 820 and under at 390). Not graded as a defect (see N2). |
| Key = pupil | YES on every key graded. Every product and quotient checked is correct. |
| Test count = Independent count | div_facts YES at every size and band: 12s band 21 / 15 / 10; 10s band 21 / 12 / 8. mult_facts NO: array Independent 10 vs Test 12; touch S 25 vs 20, M 20 vs 16. The 2026-11-09 ruling is written for div_facts only (test.js:104), so this is not graded as a defect, only reported (Q1). |
| H13 ≤ 33 % | Fails on mult array: Test cells and worksheet cards (D4). Review S touch has an empty page strip and empty stack cells (D2). |
| × 0 / 0 ÷ n frames look intentional | 0 ÷ n: YES (the full section frame, same as its neighbours). × 0: NO (D1). |

## Scores (C1 ease, C2 teaching, C3 spacing, C4 fidelity)

### div_facts, support=array (12s band: 2-4 tables to 144; 10s band: 2-5 tables to 100)

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent S/M/L + keys (both bands) | 9 | 9 | 8 | 9 |
| Test S/M/L + keys | 9 | 9 | 8 | 9 |
| More practice S/M/L + keys | 9 | 9 | 8 | 9 |
| Review S/M/L + keys | 8 | 8 | 8 | 9 |
| Practice card 1280 / 820 / 390 | 9 | 9 | 8 | 9 |
| Online worksheet 1280 / 820 / 390 | 9 | 9 | 8 | 9 |
| Quiz 1280 | 9 | 9 | 8 | 9 |

- **Good:** the section frame is 12 × 4 (or 10 × 5) and landscape, every cell has one geometry, and the dots are large and countable on screen.
- **C3 is 8, not 9:** small facts such as 6 ÷ 3 sit in a mostly empty frame. That is the frame's design.
- **Review C2 (nit N3):** the Mixed Review is four "count by 12" strips, including on the 10s band page "tables to 10 × 10". This is not this lane's code.

### mult_facts, support=array

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent S/M/L + keys | **7** (D1) | **7** (D1) | **7** (D3) | 8 |
| More practice S/M/L + keys | 7 (D1 when a × 0 is dealt) | 8 | **7** (D3) | 8 |
| Test S/M/L + keys | 8 | 8 | **6** (D4, D3) | 8 |
| Review S/M/L + keys (13 / 9 / 9) | **7** (D1: 0 × 1) | **7** | 8 | 8 |
| Practice card 1280 / 820 / 390 | **7** (D1: 7 × 0) | 8 | 8 | 8 |
| Online worksheet 1280 / 820 / 390 | **7** (D1: 0 × 0) | 8 | **6** (D4) | 8 |
| Quiz 1280 | **7** (D1: 4 × 0) | 8 | 8 | 8 |

### mult_facts, support=touch and skip (size change; Review fix)

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Review S touch (15) + key | 8 | 8 | **7** (D2) | 8 |
| Review M/L touch (12) + keys | 8 | 8 | 8 | 8 |
| Independent / Test / More practice touch S/M/L | 8 | 8 | 8 | 8 |
| Card / worksheet / quiz, touch and skip | 8 | 8 | 8 | 8 |

### add_facts, support=touch / tile / frame (screen size only)

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Card 1280 / 820 / 390, worksheet 1280 / 820 / 390, quiz | 8 | 8 | 8 | 8 |

At 1280 the tile and frame cues are small next to the 56 px digit. They are at print size, as ruled, so this is a nit.

## Defects

### D1: the mult_facts × 0 "empty landscape frame" reads as an answer box (major; C1 and C2 at 7)

**Where:**
- Paper: mult-array/independent-S/M/L-p1.png cell 8 ("3 × 0"), and review-S-p1.png and key cell 8 ("0 × 1").
- Screen:
  - screen/multarr-card-1280-_7_3_.png ("7 × 0")
  - screen/multarr-quiz-1280-2.png ("4 × 0")
  - screen/multarr-worksheet-1280.png card 8 ("0 × 0")

**What is wrong:**
- On paper it is a 16.6 × 4.6 mm rounded rectangle, with no content, floating top-right of the stack. No other × array on the page has a frame, so it is the only box in the cell.
- On screen it is a 270 × 50 px rounded rectangle next to the yellow input, close to the input's own shape. On the worksheet it sits directly under the answer box, so the cell reads as two answer slots (H16-like).
- An ELL / special-education pupil will write or tap the product into it.
- The ÷ empty frame works because every ÷ cell has the same frame. A frame drawn only on the zero facts does not work.

**Fix (any one):**
- (a) Draw the × 0 support so it cannot be taken for a slot: no closed box. Use a row of 5 grey ghost dot outlines, or a dashed hairline frame of the same footprint as the arrays beside it, with "0 rows" in it.
- (b) Give every × array a frame, so the empty frame matches its neighbours.

Either way, anchor it where the other arrays sit.

**Check that would catch it (new): SUPPORT-NOT-SLOT** in ws-screen-support-eq and ws-print-lint. A support svg must not have a closed, contentless rounded rect whose aspect ratio and size fall within ±40 % of the cell's answer slot or input. It must also not be the only framed support in a band where the other supports are unframed.

### D2: mult_facts Review S with touch has a 71 mm (30 %) blank strip under the grid (major; C3 7)

**Where:** mult-touch/review-S-p1.png and key. The last ink is at y = 772 px of a body that ends at 1040, which is 30 % of the problem area. The Mixed Review stack cells (11-15) are also about 37 % empty below their answer boxes.

**What is wrong:**
- The ruled 15 (10 + 5) removed the 32 % side bands, but the waste moved into a blank bottom third of the page.
- 15 is also not one of PT-REV-1's allowed totals (8, 10, 12, 16, 20). The same is true of array S 13, 10s-band div M 9 and L 7.

**Fix:**
- Try 4 columns, 3 × 4 facts + 4 stacks = 16. That is an allowed total, at the S ceiling of 16, with a 25 % earlier share. On these heights it appears to fit.
- Otherwise grow the rows up to the 1.5 × content rule.
- Re-pin only if the page fills.

**Check (extend):** run L-DENSITY PAGEFILL (an empty strip > 20 % of the problem area) on the review and test roles as well as on practice Auto. ws-empty-band EB-SIDE does not look at the page foot.

### D3: mult_facts support=array prints the same page at S, M and L (major; C3 7; likely pre-existing)

**Where:**
- mult-array/independent-{S,M,L}-p1.png: 2 × 5 = 10 at every size, and the same items.
- test-{S,M,L}-p1.png: 4 × 3 = 12 at every size.
- more-practice the same.

**What is wrong:** Size S gains nothing, even though the arrays are now landscape and shorter, which was the point of the owner's ruling. This is the "Size S ignored" failure class (LESSONS_LEARNED).

**Context:**
- The status note says these counts were kept from master.
- The ruled capacity pin explicitly left the option pages out of SIZE-ORDER, which is why nothing caught it.

**Fix:** size the × array page from its measured cells as the ÷ page does. At S that means 3 columns (or 2 × 6-7 rows). Pin the gain.

**Check:** put the `{"support":["array"]}` pages back into ws-capacity-pin SIZE-ORDER (S ≥ M ≥ L, and S > L when the content shrinks).

### D4: mult_facts array cells sized for the tallest array leave 36-45 % empty bands (H13; C3 6)

**Where:**
- Paper Test S/M/L (same layout at each size). For example, test-S cell 4 ("3 × 4") has 117 of 307 px empty below the array (38 %), and cells 9 and 12 are similar.
- Online worksheet 1280: screen/multarr-worksheet-1280.png.
  - card 3 ("3 × 6"): about 44 %
  - card 6 ("2 × 9"): about 36 %
  - card 11 ("4 × 7"): about 42 %

**What is wrong:** the × arrays have no frame, so a 2-row landscape array sits in a cell sized for a 10-12-row one. Landscape made the small ones flatter, so the band grew.

**Fix (any one):**
- Give × arrays a band frame, as ÷ has. The frame's footprint is the band's largest array, with dots top-left. This also fixes D1.
- Size worksheet and Test rows to the items they hold.

**Check:**
- Extend ws-empty-band and print-lint H13 to measure below the support in Test cells.
- Add a screen H13 to ws-screen-support-eq: the empty band under the support ≤ 30 % of the kit cell on the online worksheet.

## Nits (no score effect)

- **N1:** caption grammar "1 rows of 1, for 1 × 1" (fact.js:242). Use the singular "row" when rows = 1. It is read aloud. Check: ARRAY-CAPTION asserts the singular "row" when rows = 1.
- **N2:** × array placement differs from one paper page to the next: beside on Independent, under on Test.
- **N3:** the Review "Mixed Review" on div_facts pages is four "count by 12" strips, including on the 10s-band ("tables to 10 × 10") page. Not this lane's code.
- **Q1 (for the lead):** mult_facts Test ≠ Independent count (array 12 vs 10; touch S 20 vs 25, M 16 vs 20). The 2026-11-09 ruling covers div_facts only. Should it extend to mult_facts?
- **Tool:** the practice card and my quiz harness re-deal the item; the known issue applies to the quiz too. Each render was graded as shown, and the caption was checked against the shown equation.

## PNGs graded (all under /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/critic-divarray-r1/)

**Print** (independent, test, review and more-practice at S, M and L, with -p1 and -key-p1 for each):
- div144/division__div_facts/{independent,test,review,more-practice}-{S,M,L}-{p1,key-p1}.png. The 12s band, tables 2-4.
- div100/division__div_facts/ (same names). The 10s band, tables 2-5.
- mult-array/multiplication__mult_facts/ (same names).
- mult-touch/multiplication__mult_facts/ (same names).

Viewed in full: div144 indep S/M/L, indep-S key, test-S, review S/M/L; div100 indep M/L, review L; mult-array indep S/M/L, test S/L, test-S key, review-S and key; mult-touch review-S.

Zoomed: crop-mult-indS-x0.png and crop-mult-testS-row1.png.

**Screen (screen/):**
- div144-card-{1280,820,390}-{_48_4_,_0_3_,_4_4_,_28_4_}.png; div144-worksheet-{1280,820,390}.png; div144-quiz-1280-{1..4}.png
- multarr-card-{1280,820,390}-*.png; multarr-worksheet-{1280,820,390}.png; multarr-quiz-1280-{1..4}.png
- multtouch-*, multskip-*, addtouch-*, addtile-*, addframe-* (card 1280 / 820 / 390, worksheet 1280 / 820 / 390, quiz)
- contact-supports.png; div144/division__div_facts/{card-1280,worksheet-1280,quiz-1280}.png

**Logs:** log-support-eq.txt, log-lint-array-{S,M,L}.txt, log-lint-touch-S.txt, log-*.txt (render fits).
