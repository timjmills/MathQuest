# lf-placevalue critic r2 (independent critic, Opus medium, 2026-11-07)

Branch `claude/lf-placevalue`, graded at `b2606a01` plus the master hotfix cherry-pick `38be3ad1`, which touches only
`sheet/roles/fact-rows.js`, the stamp and STATUS. Fact-rows is out of scope on the card and is not graded here.
Skills: `placevalue:identify`, `value`, `expand`, `combine`, `unit_form`. I did not build this work and I did not grade r1.

**Renders**, all from this tree and one browser command at a time, are under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r2/`:
- `ws-grade-render --roles independent,more-practice,guided,scripted-model,error-analysis,test,review,true-false,reason-it,opener,lesson --size S,M,L`
  for all five skills: 87 identify pages plus about 85 for each other skill, and card-1280/820/390, worksheet-1280 and quiz-1280 per skill.
  Stretch is out of scope (owner) and was not rendered.
- Option pages (`--roles independent --size S,L --opts ...`, under `opt/`):
  - band 99, 9999 and 999999
  - zeroPlace always
  - support chart
  - identify response=bank with writeValue=false
  - value form unit and notation, expand form notation
  - frame=line, rename=more, order=scrambled
  - 2 forced columns on more-practice (`--columns 2`, the matrix's `more-cols2` rows)

**Measures.** 96-dpi A4 PNGs, so 1 px = 0.265 mm. Cell bands come from a pixel scan of each grid row: the largest empty
band under the lowest ink, as a % of the cell height. H13 is judged with the lead's T1 calibration (H13-ABS): a band
≥ 0.35 × (H − Hw) after the 3 mm pad is a finding. A raw 30-34 % band that clears T1 is graded 8 and noted.

**Owners.** Every row is graded. Rows that the brief (lead D3) assigns elsewhere are marked **ENGINE** and do not hold a pv
skill. Rows I believe belong to a shared role, although the brief does not name them, are marked **ROLES?**. They are
not counted against pv, and the lead should confirm that ruling (§7). Everything else is **pv** and counts.

Format: `C1-C2-C3-C4 [cap] owner` at S | M | L. **Bold** marks a grade below 8.

## 1. Print grades

### placevalue:identify (writeValue on by default)

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | **7**-8-8-8 pv | **7**-8-8-8 pv | **7**-8-8-8 pv | S 20 items 4x5 (band ~10 %), M 12 3x4 (~22 %), L 10 2x5. H T O printed and a Value line in every cell. The instruction reads only "Circle the place of the underlined digit." (N2) |
| more-practice | same as independent | same | same | identical renders |
| test | **7**-8-8-8 pv | **7**-8-8-8 pv | **7**-8-8-8 pv | S 20, M 12, L 10. Instruction as above |
| guided | **7**-8-**6**-8 H13 pv | **7**-8-8-8 | **7**-8-8-8 | S model cell 59.3 mm holds 25 mm of ink: 47 % band (T1 limit 18.7 mm, band 24.8 mm) |
| scripted-model | 8-8-**7**-8 ENGINE | 8-8-8-8 | 8-8-**5**-8 H5 ENGINE | S page ~28 % empty. L spills to 2 pages, and p2 holds 2 step rows with ~55 % empty. Steps 1-4 show the same unringed drawing (F14) |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-**7**-8 | 8-8-8-8 | M bands ~30 % |
| review | **7**-8-8-8 pv | **7**-8-**7**-8 ROLES? | **7**-8-8-8 pv | Disk zone now 32 mm (S) and 37.6 mm (L) for nine 8 mm disks (F15 fixed). M disk cells 35 % band (review.js row sizing) |
| true-false | 8-**3**-8-8 H1 pv | 8-8-8-8 | 8-**3**-8-8 H1 pv | Item 2 (564, the 6 underlined) draws "tens / 60", which is TRUE, but the key says False and the answer "tens" (N1). The key's "hundreds" also overprints "is" (ROLES?) |
| reason-it | 8-8-8-**6** ENGINE | same | same | keys right. Response areas and key line width are ENGINE (F17) |
| opener | 8-8-**7**-8 ENGINE | 8-8-8-8 | 8-8-8-8 | model cells ~35 % band |
| lesson (4 pages) | **7**-8-**6**-8 pv+ENGINE | **7**-8-**6**-8 | **7**-8-**6**-8 | Page 1 (vocab and warm-up) is 42 % empty at L (ENGINE page split). The warm-up offers "hundreds" on 2-digit numbers (56, 53), a dead part (H15, pv, N4). Practice 8 items 2x4 at S and L alike (ENGINE). Instruction as N2 |

### placevalue:value

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S 30 items 3x10 in 23 mm cells with a band near 0. M 24 4x6 at 34 % raw, which clears T1 (10.3 mm limit, 9.7 mm band). L 18 3x6 (r1: 12), band ~18 %. F1 fixed |
| more-practice | same | same | same | |
| test | 8-8-**5**-8 H5 ENGINE | 8-8-8-8 | 8-8-**7**-8 ENGINE | S 20 items in 31 mm cells (38 % band) plus a 75 mm strip under the grid, while independent S holds 30. L 12 against 18 (test.js bands) |
| guided | 8-8-**7**-8 pv | 8-8-8-8 | 8-8-**6**-8 H13 pv | S uses 2 columns and L uses 3 (S has fewer columns than L). L model 41 %, first try row 57 % (with hint), row 2 36 %: T1 fails (13.7 > 13.1 mm). F12 fixed ("5 hundreds is 500", no ×) |
| scripted-model | 8-8-**5**-8 H5 ENGINE | 8-8-**7**-8 | 8-8-**6**-8 ENGINE | S page ~50 % empty. The model is now 357 with the tens digit (F13 fixed). "5 tens is 50." |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| review | 8-8-**6**-8 ROLES? | 8-8-**7**-8 ROLES? | 8-8-8-8 | S rows 30.7 mm at 39 % band, the same row height as test S (116 px), plus a 25 % strip (review.js `CONTENT_FILL` and ceiling) |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | keys right (5 T / 3 F at S) |
| reason-it | 8-8-8-**6** ENGINE | same | same | keys right. All four S items deal hundreds digits 8-9 (minor) |
| opener | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | no × left in the steps |
| lesson (3 pages) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Anchor "3 tens is 30." The warm-up "58 = [ ] tens [ ] ones" stays on one line. Practice 10 items 2x5 |

### placevalue:expand

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S 15 / M 12 / L 10 full rows. Page filled. 7 of 15 S items carry a zero (zeroPlace=some) |
| more-practice | same | same | same | |
| test | 8-8-**7**-8 ENGINE | 8-8-8-8 | 8-8-8-8 | S 12 against independent 15 |
| guided | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | model 701 with hints. "The 3 is in the hundreds place: ___" |
| scripted-model | 8-**7**-**6**-8 ENGINE | 8-**7**-8-8 | 8-**7**-8-8 | S ~35 % page empty. The boxes stay empty in steps 1-3 (F14) |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| review | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| true-false | 8-8-**7**-8 ROLES? | 8-8-**7**-8 | 8-8-8-8 | Each slot now carries its own wrong value ("5,000 + 500 + 0"), so F3 is fixed. S holds 4 items, the same as L, with a 22 % strip (true-false.js puts this frame in one column) |
| reason-it | 8-8-8-**6** ENGINE | same | 8-8-**7**-**6** ENGINE | No overflow: the L panels stack one part a line (F3 fixed). L page 2 items ~22 % strip |
| opener | 8-8-**5**-8 H5 ENGINE | 8-8-**5**-8 H5 | 8-8-**5**-8 H5 | The model now wraps inside its cell, so F2's overflow is fixed. The page is ~60 % empty (1 guided item) |
| lesson (3 pages) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Practice is one page of 8 items (F18 fixed). Anchor boxes fill step by step. Say "304 is 300 plus 4." drops the 0 the frame writes (minor, N9) |

### placevalue:combine

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S 28 4x7: 38 % raw, T1 passes by 0.1 mm (8.9 against 9.0 mm), a near miss. M 18 at 31 %. L 10 rows with one geometry and the = signs aligned (F9 fixed) |
| more-practice | same | same | same | |
| test | 8-8-**5**-8 H5 ENGINE | 8-8-8-8 | 8-8-8-8 | S 20 against 28, cells 45 % band, 25 % strip (test.js) |
| guided | 8-8-**7**-8 pv | 8-8-8-8 | 8-8-8-8 | S tries are one-line rows of 19.3 mm with 4.8 mm of ink (52 %), plus a 22 % page strip |
| scripted-model | 8-**7**-**5**-8 H5 ENGINE | 8-**7**-8-8 | 8-**7**-8-8 | S ~60 % page empty. The line is blank until step 4 |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| review | 8-8-**7**-8 ROLES? | 8-8-8-8 | 8-8-8-8 | S 22 % strip |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-8 ROLES? | Keys right. Every L item is now 2 lines (r1 AX fixed). L cells hold ~35 % empty between the frame, the checks and the sentence |
| reason-it | 8-8-8-**6** ENGINE | same | 8-8-**6**-**6** H13 ENGINE | L 2 items, 45 % bands (F17 row) |
| opener | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-8 ENGINE | |
| lesson (3 pages) | 8-**7**-8-8 ENGINE | same | same | Anchor line blank in steps 1-2, then 464 whole in step 3 (F14). Practice has one geometry |

### placevalue:unit_form

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | S 15 / M 12 / L 10 (r1: 9 / 9 / 9), so F8 is fixed |
| more-practice | same | same | same | |
| test | 8-8-**7**-8 ENGINE | 8-8-8-8 | 8-8-8-8 | S 12 against 15 |
| guided | 8-**7**-8-8 ROLES? | 8-**7**-8-8 | 8-**7**-8-8 | The model is 779 (two 7s), and its hint stops at "7 tens." with no "9 ones." because `guided.js:606` keeps 3 hint lines |
| scripted-model | 8-**7**-**6**-8 ENGINE | 8-**7**-8-8 | 8-**7**-8-8 | "1 one." (F11 fixed). Boxes are empty until step 4 (F14) |
| error-analysis (out of bar) | 8-**6**-8-8 | same | same | Item 1 (193) Fix-it frame prints "hundred", so F23 is not fixed |
| review | 8-8-**7**-**7** pv | 8-8-8-8 | 8-8-8-8 | S mixed review (combine items, 3 across): "700 + 1 = ___" on one line beside "600 + 10 + 1 / = ___" on two lines in the same rows. AX-4 / F9 again, in the review role (N7) |
| true-false | **4**-8-**7**-8 H2 ROLES? | same | **4**-8-**7**-8 H2 | The keyed answer "5 hundreds 1 ten 5 ones" overprints "The answer is". The pupil line is about 16 mm for a 3-unit phrase (H9). This is the same digit-count line sizing as the D3 Reason It row |
| reason-it | **4**-8-8-**6** H2 ENGINE | same | same | key overflow (D3) |
| opener | 8-8-**5**-8 H5 ENGINE | same | same | model wraps (F2 fixed). Page ~55 % empty |
| lesson (3 pages) | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 3 pages (F18 fixed). Anchor boxes empty until step 4 (ENGINE) |

## 2. Screen hosts (C1-C2-C3-C4)

| Skill | card-1280 | card-820 | card-390 | worksheet-1280 | quiz-1280 | Measured |
|---|---|---|---|---|---|---|
| identify | 8-**7**-**7**-8 ENGINE | same | same | 8-**7**-8-8 ENGINE | **5**-**6**-**7**-**6** H16 ENGINE | No value box on any host while paper has one (F4 screen). Quiz is an empty split yellow box with no place words (F6). Numeral glyph ~28 px at 1280 (F7) |
| value | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| expand | 8-8-**6**-**6** ENGINE | same | 8-8-**5**-**6** ENGINE | 8-8-**7**-**6** | 8-8-**6**-**6** | Number ~17 px glyph, regular weight, left-aligned. At 390 the third box wraps alone (F7) |
| combine | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | worksheet cards all two-line (r1 fixed) |
| unit_form | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |

## 3. Option values (independent page, S and L)

| Option | Grade | Finding |
|---|---|---|
| band=99: identify S/L | 8-8-**6**-8 H15 pv | "hundreds" is still offered on every 2-digit number, a dead choice (N4, r1 not fixed) |
| band=99: combine S/L | 8-**4**-8-8 H3 pv | Items that are their own answer: L 8 of 16 ("10 = ___", "60 = ___", "90 = ___"), S 9 of 30 (N3) |
| band=99: expand L | 8-8-8-8 | 6 of 10 items are multiples of 10 ("70 = [ ] + [ ]"), legitimate zero-place items but 60 % at zeroPlace=some (dealer, minor) |
| band=99: unit_form S/L, value S/L | 8-8-8-8 | "53 = [ ] tens [ ] ones" on one line (F20 fixed). Value S 30 / L 20 |
| band=9999: expand / unit_form / identify / combine | 8-8-8-8 | Frames wrap inside the cell with no overflow (F19 fixed). identify L 6, S 10 |
| band=9999: value L | 8-8-**6**-8 H13 pv | 12 items 3x4 in 55.8 mm cells, ink 27 mm: 43 % band (T1 limit 16.0 mm, band 20.8 mm) (N5) |
| band=999999: identify S | 8-8-**7**-8 pv | S holds 6 in one column, the same count as L (2x3). Size S ignored (L1) |
| band=999999: value / expand / combine L | 8-8-8-8 | expand L 4 items, frames on 3 lines |
| zeroPlace=always: expand, combine | 8-8-8-8 | every item keeps a zero place. combine S 30 two-part items |
| support=chart: identify L, value S/L | 8-8-8-8 | |
| response=bank + writeValue=false (identify) S/L | **7**-8-8-8 pv | The cell is bank plus write line, but the instruction still says "Circle the place of the underlined digit." (N2) |
| writeValue=true (default) | **7**-8-8-8 pv | line built and keyed (F4 fixed on paper). The instruction omits it (N2) |
| form=unit (value) S/L | 8-8-8-8 | Equal boxes labelled "how many" and "place" (F10 fixed). L holds 5 (pinned capacity) |
| form=notation (value, expand) S/L | 8-8-8-8 | "× 1" no longer orphaned (F20 fixed). expand S 16 2x8 |
| frame=line (expand) | 8-8-8-8 | |
| order=scrambled (combine) L | 8-8-8-8 | one geometry |
| rename=more (unit_form) S | 8-8-**6**-8 H13 pv | 16 items 2x8, one-line content in 25.7 mm cells: 57 % band (T1 limit 6.9 mm, band 11.6 mm), plus a 20 mm strip (N6) |
| rename=more (unit_form) L | 8-8-8-8 | |

## 4. Matrix rows (lead R1: I grade the rows; one size each)

| Row | Grade | Ruling |
|---|---|---|
| `*|sections/pages-2` S/L (precritic: 8 / 9 DN-2, LONE, PAGEFILL, PG-23) | C3 ≤ 5 H5 | **ENGINE** (r1 F21): page 1 holds 1 item, 88 % empty |
| `*|sections/ex-group`, `*|mixed/defaults` | C3 6 | **ENGINE** (r1 F21) |
| `expand|single/more-cols2+*`, `unit_form|single/more-cols2+*` (rendered: more-practice `--columns 2`) | 8-8-**5**-8 H5 **pv** | The column request is ignored: 1 column, 4 items, page 55-65 % empty at S and L. r1 routed this half of F21 to the pv `fits` code. NOT FIXED (N8) |
| `identify|single/more-cols2+*` S | 8-8-**7**-8 pv | 10 items 2x5 in 44.7 mm cells (36 %), the same count as L |
| `value|single/more-cols2+*` S (precritic 32 / 16 findings) | 8-8-**7**-8 pv | 16 items 2x8. Each 30 mm numeral sits in a 92 mm cell, so a third of the width is empty on each side. The vertical band (32 %) clears T1 |
| `combine|single/more-cols2+*` L, `*|sections/ex-each` | 8-8-8-8 / not reopened | precritic has 1 finding at L and no sibling baseline. Not re-rendered (time) |
| `*|single/layout-fact-rows` | not graded | out of scope (card). The crash is fixed by `38be3ad1` |

## 5. r1 findings: status

| r1 | Status | Evidence (r2) |
|---|---|---|
| F1 H13 bands on practice pages | **FIXED** (pv pages), with test/review **ENGINE / ROLES?** | value L 12 → 18, identify S 16 → 20, expand S 15 full rows, unit_form 9 → 15. Remaining bands are on test.js / review.js rows |
| F2 opener overflow | **FIXED** overflow; page fill **ENGINE** | the model wraps in its cell; the page is ~60 % empty |
| F3 one wrong string per multi-slot | **FIXED** | expand TF "5,000 + 500 + 0" fills slot by slot; Reason It panels stack |
| F4 writeValue | **FIXED on paper**; screen **ENGINE** | Line and key present. Instruction regression (N2). No screen box |
| F5 letters on identify paper | **FIXED** | H T O over the digits on every identify page |
| F6 identify quiz answer kind | **NOT FIXED — ENGINE** | quiz still an empty split box |
| F7 screen numeral px | **NOT FIXED — ENGINE** | identify ~28 px; expand ~17 px, regular weight, wraps at 390 |
| F8 unit_form Size S | **FIXED** | 15 / 12 / 10 |
| F9 combine two geometries | **FIXED** on its own pages; **NOT FIXED** in mixed review (N7) | |
| F10 value form=unit width tells | **FIXED** | equal labelled boxes |
| F11 "1 ones" | **FIXED** | "1 one.", "1 ten" |
| F12 × at Grade 2 | **FIXED** | "5 tens is 50" on every page |
| F13 value model ones digit | **FIXED** | model 357 tens |
| F14 step states | **NOT FIXED — ENGINE** | expand / combine / unit_form scripted and combine lesson anchor |
| F15 review disk zone | **FIXED** | 32 / 37.6 mm ones zone |
| F16 stretch | **N/A** | out of scope (owner) |
| F17 Reason It response areas | **NOT FIXED — ENGINE** | |
| F18 lesson practice spill | **FIXED** (lesson); opener / scripted fill **ENGINE** | |
| F19 band=9999 overflow | **FIXED** | expand / unit_form wrap inside the cell |
| F20 wraps (× 1, ones) | **FIXED** | |
| F21 matrix rows | sections / ex-group **ENGINE, NOT FIXED**; cols2 (pv half) **NOT FIXED** (N8) | |
| F22 combine pages-3 zero-tens page | not re-rendered | dealer-uniform passes per sheet |
| F23 unit_form singular Fix-it label | **NOT FIXED** (out of bar) | "hundred" beside answer 1 |

## 6. New findings (pv-owned unless marked)

**N1 (H1, C2 → 3; identify true-false S and L).** Item 2 is 564 with the 6 underlined. The statement drawn is "tens / Value
60", which is true, but the key checks False and gives the answer "tens". The cause is the writeValue branch of
`providers/pv.js` `wrongAnswer`. It builds candidates "tens, 60" while `q.ans` is "tens", so `chooseWrong`'s equality
filter never sees the match. For the middle digit of a 3-digit number, M-V1 "counted from the left" is the right answer.
A node probe gives 564 / 832 / 347 at place 10 → "tens, 60" / "tens, 30" / "tens, 40" with writeValue on. With
writeValue off, the same code picks "hundreds". About one third of the items are affected. Error analysis likely
inherits it.
*Check:* providers-unit **WRONG-DIFFERS**: over 200 seeds × every option set, no wrongAnswer's slots equal the key's
slots (compare slot-wise, not the joined string). It should FAIL on b2606a01.

**N2 (C1 → 7; every identify print page, and response=bank).** Lead D5 asked that, with writeValue on, the instruction
names both tasks ("Circle the place. Write the value of the underlined digit."). The library keys `place-circle-value` and
`place-write-value` exist, but every printed page shows "Circle the place of the underlined digit.". With response=bank
the pupil writes a word on a line, yet the page still says "Circle". The cause is that `print-sheet.js` `metaOf` takes
`instructionKey` from `skillWords` with no item. `stringsBy` then falls back to `PLACE_CIRCLE_3`, so `withValue` and the
bank pick never run. `gen-pv.js` sets `printText` but not `q.instructionKey`.
*Check:* `ws-card-rulings` assert: render the identify independent page with writeValue on / off and response
circle / bank, and require the instruction line to equal `INSTRUCTION_LIBRARY[...]` of the provider's per-item key.

**N3 (H3 / L3, C2 → 4; combine band=99 S and L).** With zeroPlace=some, a multiple of 10 deals a one-part item ("60 = ___"),
which is its own answer. That is 8 of 16 at L and 9 of 30 at S. *Fix:* combine never deals a single part (at band 99,
zero ones needs zeroPlace and two parts, or skip). *Check:* content-audit / providers-unit **COMBINE-PARTS**: every
combine item has ≥ 2 parts at every band × zeroPlace.
**ws-dealer-uniform** should run per offered band, not only the default band.

**N4 (H15, C3 → 6; identify band=99 and the identify lesson warm-up).** "hundreds" is printed on 2-digit numbers. This is
r1's band=99 finding, not fixed. *Check:* `ws-visual-quality` VQ-LIVE at band=99: no place word above the number's
highest place.

**N5 (H13, C3 → 6; value band=9999 L).** 43 % band in 55.8 mm cells. 12 items fit where about 16 would.
*Check:* `options-render --bands` reported "findings the default page has too: L-DENSITY H13" and passed. Make H13-ABS
on a band value page a finding in its own right (compare against the T1 limit, not the default page).

**N6 (H13, C3 → 6; unit_form rename=more S).** One-line items in 25.7 mm cells, 57 % band, plus a 20 mm strip.
*Check:* run H13-ABS on every `--card-opts` value page in `ws-cell-checks` (today it checks overflow, TAGINK, KEYJOIN and
SIZE-S only).

**N7 (AX-4, C3 / C4 → 7; unit_form review S, the combine cells in its mixed-review section).** One-line and two-line combine
cells sit in the same rows. *Check:* GRID-EVEN-ALL on every offered role (review, opener, lesson), not only independent.

**N8 (H5, C3 → 5; expand and unit_form with 2 columns asked).** 1 column, 4 items, 55-65 % of the page empty. These are
r1 F21's pv half. *Check:* the matrix rows exist (PAGEFILL 1 at S/M/L) but are PENDING (no baseline). A PENDING row in
the lane's own skills should be red until a critic rules it.

**N9 (minor, not capped).** The expand lesson Say "304 is 300 plus 4." drops the 0 the frame writes. The unit_form guided
model is 779, with the same digit in two places (ROLES? cap below). Value Reason It S deals only 8xx and 9xx.

**ROLES? (not counted against pv; the lead should confirm):**
- R-a: true-false "The answer is ___" is sized by digit count, so unit_form keys overprint the label and the pupil line
  is too short (`true-false.js:43`). This is the same root cause as the D3 Reason It row. The identify TF key
  "hundreds" also overprints "is". *Check:* L-OVERLAP TEXT on key pages; precritic OVERFLOW misses an overprint that
  stays inside the cell.
- R-b: `guided.js:606` keeps 3 hint lines, so unit_form's model loses "9 ones.".
- R-c: review.js rows grow to `CONTENT_FILL` (value review S 39 % bands, the same 116 px rows as test S).
- R-d: true-false capacity: expand S holds 4 = L, with a 22 % strip.
- R-e: the guided bands in §1 (identify S model 47 %, value L 41-57 %, combine S 52 %). I counted these as **pv** because no
  ruling assigns guided.js, but the row heights look like role logic. If the lead rules guided role-owned, they move here.

## 7. Visual-quality questions (RUBRIC §6.1)

1. **Representation:** the numeral with the underline and H T O, the expanded / unit / combine frames. Pass.
2. **Live parts:** fails on identify band=99 ("hundreds", N4) and combine band=99 (a one-part frame, N3).
3. **One answer place:** fails on identify TF (key wrong, N1). Unit_form TF and Reason It are ROLES / ENGINE.
4. **Type and stroke:** paper Andika 700 at 16 / 22 / 28 pt. Screen identify and expand are ENGINE (F7).
5. **Paper = screen:** identify paper has a value line the screen lacks (ENGINE F4 screen).
6. **Title:** proper sentences. Pass.
7. **Own renders:** all grades are on these five skills' own renders at Grade 2, default band 999, plus §3.

## VERDICT

The engine findings are listed separately below and are not counted.

- **placevalue:identify — VERDICT: FAIL.** Failing pv-owned rows:
  - true-false S/L, C2 3: H1 (N1)
  - every print page, C1 7: the instruction omits the value task (N2)
  - band=99 C3 6 (N4); band=999999 S C3 7 (Size S ignored)
  - guided S C3 6
  - response=bank C1 7
  - lesson warm-up C3 6 (N4)
  - cols2 S C3 7
- **placevalue:value — VERDICT: FAIL.** Failing pv-owned rows:
  - band=9999 L C3 6 (N5)
  - guided L C3 6, guided S C3 7
  - cols2 S C3 7
- **placevalue:expand — VERDICT: FAIL.** Failing pv-owned row: more-practice with 2 columns asked (matrix more-cols2) S/L,
  C3 5 (N8). Every other pv row is 8 or better.
- **placevalue:combine — VERDICT: FAIL.** Failing pv-owned rows:
  - band=99 S/L C2 4 (N3)
  - guided S C3 7
- **placevalue:unit_form — VERDICT: FAIL.** Failing pv-owned rows:
  - rename=more S C3 6 (N6)
  - 2 columns asked S/L C3 5 (N8)
  - review S C3 / C4 7 (N7)

**ENGINE (graded, recorded, not counted):**
- opener page fill (all five, C3 5)
- scripted-model / lesson step states and fill (F14)
- Reason It response areas and key overflow (F17; unit_form C1 4)
- test.js bands (value / combine test S C3 5)
- lesson page split, warm-up page 42 % empty, lesson practice S = L
- screen: identify value box (F4), quiz answer kind (F6), numeral px and expand wrap (F7)
- sections / ex-group / mixed pagination (F21)

**ROLES? (lead to rule):** R-a to R-e above.
