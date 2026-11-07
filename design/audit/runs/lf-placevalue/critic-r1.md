# lf-placevalue critic r1 (independent critic, Opus medium, 2026-11-07)

Branch `claude/lf-placevalue` at HEAD `9967d170`. Skills: `placevalue:identify`, `value`, `expand`, `combine`, `unit_form`.
I did not build this work. Every grade below comes from a PNG I looked at. The numbers were measured on 96-dpi A4 renders
(1 px = 0.265 mm) with a pixel scan of each cell: the largest empty band as a % of cell height, items per page, page use and
numeral glyph height.

**Renders.** `ws-grade-render --skills <one skill> --roles independent,more-practice,guided,scripted-model,error-analysis,test,review,true-false,reason-it,stretch,opener,lesson --size S,M,L`,
one skill per command, into the scratchpad (`critic-r1/placevalue__*`), so 427 pages plus 25 screen PNGs. The matrix rows were
reproduced with `ws-print-lint --source kit --save-html` using the matrix's args and partners (`addition:add_facts`,
`algebra:tape_diagram`, `area_perimeter:perimeter_intro`), then screenshotted page by page. The option pages are
`ws-print-lint --opts` on the independent role.

**Sizes.** S and L were graded in full on every page type. M was spot-checked on every page type and graded in full where
the measurement differed from S and L.

**Scope note.** RUBRIC's header (owner ruling 2026-09-26) keeps error-analysis out of the pass bar, and says stand-alone
Guided, Worked example, Review, Opener, True or False?, Reason It and Stretch are "not graded as separate pages". The brief
and the signed card §7a ("offered = graded on every page type") say to grade them. I graded every page type. The verdict lists
the failures in two groups: CORE pages (practice, test, lesson, the three screen hosts, the option panel) and the
stand-alone roles. The skills fail on CORE pages alone.

## 1. Grades: print (C1-C2-C3-C4, cap applied)

Each cell is `C1-C2-C3-C4 [cap]` at S | M | L. **Bold** = below 8.

### placevalue:identify

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-**7**-**6**-**7** H13 | 8-**7**-**6**-**7** H13 | 8-**7**-**6**-**7** H13 | S 16 items 4x4, cells 56.6 mm, empty band under the ring words 42 %; M 10 items 2x5 at 45 %; L 10 items 2x5 at 38 %. No write-the-value line. No H T O letters |
| more-practice | same as independent | same | same | identical renders |
| test | 8-**7**-8-**7** | 8-**7**-**6**-**7** H13 | 8-**7**-**6**-**7** H13 | S 20 items at 28 %; M/L 10 items at 45 % / 38 % |
| guided | 8-8-**6**-8 H13 | 8-8-**7**-8 | 8-8-**6**-8 H13 | S model cell 63 mm with ~50 % empty; L bottom-row cells ~45 % empty, 4 items + model |
| scripted-model | 8-8-**6**-8 | 8-8-**7**-8 | 8-8-**7**-8 | S page ~35 % empty under the Say band; L ~19 % strip, step panels mostly empty |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-**6**-8 H13 | 8-8-8-8 | M 38 % band |
| review | **4**-**5**-**7**-8 H12 | **4**-**5**-**7**-8 H12 | **4**-**5**-**7**-8 H12 | Mixed review "Draw disks to show 559": the ones zone is 19 mm x 19 mm at L and 16 mm at S, and nine 8 mm disks do not fit |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-8 | L 4 items, page ~35 % empty |
| reason-it | **6**-8-8-**6** H16 | **6**-8-8-**6** H16 | **6**-8-**7**-**6** H16 | "Circle A or B" plus a "___ is correct" line plus "The answer is ___": doubled response |
| stretch | **1-1-1-1** H11 | **1-1-1-1** H11 | **1-1-1-1** H11 | engine: "No Stretch for this skill yet" (card §7a: offered) |
| opener | 8-8-**7**-8 | 8-8-8-8 | 8-8-8-8 | S 33 % band (measured) |
| lesson (3 pages) | **7**-**7**-**6**-8 H13 | **7**-**7**-**6**-8 H13 | **7**-**7**-**6**-8 H13 | anchor step 4 "Write the place." on a circle task; practice-page step strip says "Read the letter above it" but none of the 10 items prints letters; practice cells 38 % band |

### placevalue:value

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | S 30 items 5x6, cells 35.7 mm, 35 % empty under "worth ___"; M 20 items at 34 %; L 12 items 3x4, cells 51.5 mm, 34 %, plus a 26 mm strip under the grid |
| more-practice | same | same | same | identical |
| test | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | M: 16 items 4x4 in 56.1 mm cells, 50 % empty (independent M holds 20); S 38 %; L 34 % |
| guided | 8-**7**-**7**-8 | 8-**7**-**7**-8 | 8-**7**-8-8 | steps "Multiply the digit by its place: 7 hundreds is 700" (× on a Grade 2 / 2.NBT.1 page; 7 is not the model's digit) |
| scripted-model | 8-**6**-**7**-8 | 8-**6**-**7**-8 | 8-**6**-**7**-8 | the model is 559 with the ONES digit underlined ("9 ones is 9 × 1 = 9"): the one case where value = digit, so it shows nothing about place value; L page ~25 % empty |
| error-analysis (out of bar) | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | 48 / 38 / 43 % bands |
| review | 8-8-**7**-8 | 8-8-**7**-8 | 8-8-**7**-8 | mixed-review identify cells ~40 % empty |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-8 | L 4 items |
| reason-it | **6**-8-**7**-**6** H16 | **6**-8-8-**6** H16 | **6**-8-**7**-**6** H16 | doubled response, as identify |
| stretch | **1-1-1-1** H11 | H11 | H11 | unsupported |
| opener | 8-**7**-8-8 | 8-**7**-8-8 | 8-**7**-**7**-8 | steps carry the Grade-2 × line; L 58 % band (measured) |
| lesson (3 pages) | **7**-**7**-8-8 | **7**-**7**-8-8 | **7**-**7**-8-8 | anchor "3 tens is 3 × 10 = 30" (× at Grade 2); warm-up "58 = [ ] tens [ ]" wraps "ones" under the box, away from its slot |

### placevalue:expand

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-**6**-8 H13 | 8-8-8-8 | 8-8-8-8 | S 16 items 2x8, cells 25.9 mm with the frame in the top 10 mm: 55 % empty, and a 26 mm strip under the grid. M 12 / L 10 single-column rows are full, boxes 12.7 / 10.6 mm |
| more-practice | same | same | same | |
| test | 8-8-**6**-8 H13 | 8-8-8-8 | 8-8-8-8 | as independent |
| guided | 8-8-**7**-8 | 8-8-8-8 | 8-8-8-8 | S page ~30 % empty |
| scripted-model | 8-**7**-**5**-8 H5 | 8-**7**-**7**-8 | 8-**7**-**7**-8 | S page ~45 % used; the boxes stay empty in steps 1-3 while the step text gives 800, 70, 2 |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-**6**-8 H13 | 8-8-8-8 | |
| review | 8-8-**7**-8 | 8-8-8-8 | 8-8-8-8 | S page ~35 % empty |
| true-false | **4**-**4**-**5**-**5** H2 | **4**-**4**-**5**-**5** H2 | **4**-**4**-**5**-**5** H2 | items 2 and 3: the whole wrong statement "5 + 0 + 3" / "1 + 9 + 6" is written into EACH of the three boxes, clipped at both ends |
| reason-it | **2-2-2-3** H2 | **2-2-2-3** H2 | **2-2-2-3** H2 | OVERFLOW (ws-grade-render): the frames run out of their A/B boxes, overprint each other and run past the left page edge; illegible |
| stretch | H11 | H11 | H11 | |
| opener | 8-8-**7**-8 | **4**-8-**5**-**6** H2 H5 | **4**-8-**5**-**6** H2 H5 | M/L: the model "403 = 400 + 0 + 3" sticks out of the left page edge ("03" at L) and runs under step circles 1-2; the third trace box is hidden. The page is ~55-60 % empty (1 guided item) |
| lesson (4 pages) | 8-8-**5**-8 H5 | 8-8-**5**-8 H5 | 8-8-**5**-8 H5 | practice spills to 2 pages: p3 holds 4 items in 57 mm cells (68 % band), p4 holds 2 items with ~70 % of the page empty |

### placevalue:combine

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | **7**-8-**7**-**7** | S 28 items 4x7 at 35 %; M 18 items 3x6 at 33 %; L 10 items: items 1-2 sit in half-width cells (24.6 mm, left-aligned), items 3-10 in full-width rows (22.2 mm, centred): two layouts in one section, plus a 30 mm strip |
| more-practice | same | same | same | |
| test | 8-8-**6**-8 H13 | 8-8-**6**-8 H13 | **7**-8-**7**-**7** | S 20 items in 41 mm cells, 52 % empty (independent S holds 28); L mixes 4 half-width and 8 full-width cells |
| guided | 8-8-**7**-8 | 8-8-8-8 | 8-8-8-8 | |
| scripted-model | 8-**7**-**5**-8 H5 | 8-**7**-8-8 | 8-**7**-8-8 | S page ~40 % used; the answer line is blank in steps 1-3 although they say "write 5", "write 9", "write 4" |
| error-analysis (out of bar) | 8-8-8-8 | 8-8-**6**-8 | 8-8-8-8 | |
| review | 8-8-**6**-8 | 8-8-8-8 | 8-8-8-8 | S page ~37 % empty |
| true-false | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-**7** | L: item 1 on one line, items 2-4 on two lines |
| reason-it | **6**-8-8-**6** H16 | **6**-8-**7**-**6** H16 | **6**-8-**6**-**6** H13 H16 | L 2 items, 96.6 mm cells ~55 % empty |
| stretch | H11 | H11 | H11 | |
| opener | 8-8-8-8 | 8-8-**7**-8 | 8-8-**5**-8 H5 | L: model + 1 guided item, ~70 % of the page empty |
| lesson (3 pages) | 8-**7**-**7**-**7** | 8-**7**-**7**-**7** | 8-**7**-**7**-**7** | anchor: line blank in steps 1-2 ("write 4", "write 6"), then "464" appears whole in step 3; practice page mixes 2 half-width and 8 full-width cells |

### placevalue:unit_form

| Page | S | M | L | Measured |
|---|---|---|---|---|
| independent | 8-8-**6**-**7** | 8-8-**7**-**7** | 8-8-8-8 | 9 items at S, M and L alike; cells 25.1 mm at all three; answer boxes 13.8 mm tall at all three sizes (Hw 6 / 8 / 10 mm): Size S ignored (L1). S content sits centred with ~45 mm blank on the left |
| more-practice | same | same | same | |
| test | 8-8-**6**-**7** | 8-8-**7**-**7** | 8-8-8-8 | identical geometry |
| guided | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| scripted-model | 8-**7**-8-**7** | 8-**7**-8-**7** | 8-**7**-8-**7** | step 4 "1 ones."; boxes empty until step 4 |
| error-analysis (out of bar) | 8-**6**-8-8 | 8-**6**-8-8 | 8-**6**-8-8 | the Fix-it frame prints "hundred" / "one" in the singular exactly when the answer is 1: gives the answer away (L3) |
| review | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | |
| true-false | **4**-**4**-**5**-**5** H2 | H2 | **4**-**4**-**5**-**5** H2 | items 2 and 3 print "eds 40 t" / "eds 70 t" (a clipped "hundreds 40 tens") in each of the three boxes |
| reason-it | **2-2-2-3** H2 | **2-2-2-3** H2 | **2-2-2-3** H2 | OVERFLOW: boxes and words overprint, fragments past the left page edge |
| stretch | H11 | H11 | H11 | |
| opener | 8-8-**5**-8 H5 | **4**-8-**5**-**6** H2 H5 | **4**-8-**5**-**6** H2 H5 | M/L: the model's trace boxes "7" and "5" stick out of the model cell (left page edge and under the Steps column); S: 1 guided item, ~75 % of the page empty |
| lesson (4 pages) | 8-8-**5**-8 H5 | 8-8-**5**-8 H5 | 8-8-**5**-8 H5 | practice p3 holds 4 items in 57 mm cells (63 % band); p4 holds 2 items, ~70 % of the page empty |

## 2. Grades: screen hosts (C1-C2-C3-C4)

| Skill | card-1280 | card-820 | card-390 | worksheet-1280 | quiz-1280 | Measured |
|---|---|---|---|---|---|---|
| identify | 8-8-**6**-8 | 8-8-**6**-8 | 8-8-**7**-8 | 8-8-8-8 | **5**-**6**-**7**-**6** H16 | numeral glyph 23 px at 1280 (≈ 33 px type; target 56 px), 22 px at 390 (≈ 31; target 40). The choice words are bigger than the number. Quiz: one empty text box, no place words and no bank; the paper and the card offer ones / tens / hundreds |
| value | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | glyph 42 px at 1280 and 37 px at 390 |
| expand | 8-8-**5**-**6** | 8-8-**5**-**6** | 8-8-**5**-**6** | 8-8-**7**-**6** | 8-8-**6**-**6** | the number "273 =" is a 17 px glyph at 1280 (≈ 24 px), 16 px at 820 and 14 px at 390 (≈ 20 px), in REGULAR weight, left-aligned with the right half of the cell empty. Paper prints Andika 700 at digit size. The font tally in meta.json is Andika 3 / Nunito 7, where the other pv cards show Andika 7-11. At 390 the third box wraps onto a line of its own |
| combine | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-**7**-8 | 8-8-8-8 | worksheet: cards 1 and 5-6 on one line, cards 2-4 on two lines |
| unit_form | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | glyph 41 px |

## 3. Option values (independent page, §7a)

| Option | Grade | Finding |
|---|---|---|
| band=99: identify / unit_form L | 8-8-**7**-8 / **6**-8-**7**-8 H16 | identify still offers "hundreds" on 2-digit numbers (a choice no item can take). unit_form "75 = [ ] tens [ ]" wraps "ones" under the second box, detached from its slot |
| band=9999: expand L | **4**-8-**4**-**6** H2 | every frame runs 15.8 mm out of its cell; the numbers ",230" and "7,240" are cut at the left page edge (L-OVERFLOW x8) |
| band=9999: unit_form L | **4**-8-**4**-**6** H2 | the thousands box and the ones box hang 12.7 mm outside the cell, past both page edges |
| band=9999: identify L | 8-8-**6**-8 H13 | 5 items, single column, ~40 % bands |
| band=9999: value L | 8-8-8-8 | |
| zeroPlace none / some / always | 8-8-8-8 (combine none: pinned capacity, owner) | the zero place is kept on every item at always |
| support chart / labels / none (identify, value) | 8-8-8-8 | support=none on value fits 18 at L (labels: 12) |
| response=bank (identify) S / L | 8-**7**-8-8 | bank pill plus write line, 18 / 8 items; still no write-the-value line (F4) |
| form=unit (value) L | **6**-**5**-**6**-**7** H16 | "worth [ ] [ ]": two boxes with no label. The second box is SHORT on tens / ones items and LONG on hundreds items, so its width gives the answer away. Items 1-4 are half-width and 5-6 full-width, 6 items a page |
| form=notation (value) | 8-8-8-8 | |
| frame=line (expand) | 8-8-8-8 | |
| form=notation (expand) S / L | 8-8-8-8 / **6**-8-**6**-8 | L: the closing "1" of "× 1" wraps onto a line of its own, centred under the frame (4 items a page; capacity pinned) |
| rename=more (unit_form) | 8-8-8-8 | |
| order=scrambled (combine) | **7**-8-**7**-**7** | same mix of half-width and full-width cells |

## 4. The 90 named matrix rows (lead ruling R1)

Rendered and looked at for every distinct (skill, kind/row) at least once, and at the row's own size for every count ≥ 4:
sections/pages-2 identify S/M/L, combine S/M/L, expand S/M, unit_form S/M, value S/L; mixed/defaults M (all five);
sections/ex-each L (all five); sections/ex-group S (all five); single/ex-each S and M (all five); single/more-cols2+afterpage
S and M (all five); single/more-cols2+short S (all five); single/pages-3 L (combine). Value sections/pages-2 M and the
remaining small-count sizes are inferred from the same layout and were not opened.

| Rows | Ruling | Why (measured) |
|---|---|---|
| `*|sections/pages-2 *` DN-2 / PAGEFILL / LONE / SPREAD / PG-23 (all 5 skills) | **REAL defect** (C3 ≤ 5, H5). Root cause in the Sections × pages engine, made worse by pv | expand M p1 holds ONE item with 89 % of the page empty; unit_form S p1 holds 1 item in a full-page cell; identify M p1 holds 2 items in cells stretched to 200 mm (12 % fill); value S p1 holds 5 items in 200 mm cells (9 %). The add_facts partner on the same document also gets a half-empty row, so the engine shares the fault. No pv page in this row is classroom-ready |
| `*|mixed/defaults *` PG-23 | **REAL, not pv's**: engine rebalance | last page 2 holds the 2 perimeter-partner items with ~70 % empty while page 1 has a 15 % strip; the pv section itself is fine (3 value / 1 expand items, full rows) |
| `*|sections/ex-each *` and `*|single/ex-each *` GRID-EVEN | **Not a defect** in itself: a model beside each problem makes two cell widths by design | but identify single/ex-each S practice cells are sized to their model: ~60 % empty (H13, minor). value ex-each worked steps print "1 hundreds is 1 × 100 = 100" (F11) |
| `*|sections/ex-each L` SPREAD | **REAL** (C3 6) | the pv rows on page 1 fill 32-35 % of their cells' height |
| `*|sections/ex-group *` DN-2 | **REAL** (C3 6), engine | page 2 holds 4 items while page 3 holds 10-12 |
| `value|single/more-cols2+afterpage S` H13 (20), `value|more-cols2+short S` H13 (10), identify same | **REAL** (C3 6) | 2 forced columns at S: 10 items, each a 30 mm-wide numeral in a 92 mm cell, cells ~50 % empty; the page could hold 16+ |
| `combine|single/more-cols2+afterpage M` H13 (6), `+short M` (3) | **REAL** (C3 7) | one-line and two-line cells alternate in the same rows |
| `expand|single/more-cols2+* M/L` PAGEFILL, `unit_form|single/more-cols2+* S/M/L` PAGEFILL | **REAL** (C3 5, H5) | the 2-column request is ignored: 1 column, 4 items, 45-60 % of the page empty |
| `combine|single/pages-3 L` PAGEFILL | **REAL** (C3 6, C2 7) | page 1: 8 items with a 35 % strip, and all 8 are "hundreds + ones" (900 + 1, 400 + 5 ...): the layout sorts the zero-tens items onto one page |

## 5. Findings

Each finding gives the rule broken, the criterion and points it costs, the fix, and the machine check that could have caught it.

**F1 (H13, C3 -2; every practice page of identify and value, combine / expand S).** On independent, more-practice, test and
lesson practice pages, cells keep a 34-55 % empty band under the content (numbers in §1). Test M on value holds 16 where
independent M holds 20 by stretching the cells. *Fix:* size each pv cell to its content (`fits` row height = ink + writing
room) so S/M/L fit more rows: value L 12 → ≥ 15, identify S 16 → ≥ 20, expand S 2x8 → 2x12. *Check:* `ws-print-lint`
L-DENSITY H13 is **green** on these documents (precritic single/defaults: 0 found). It measures only cells that differ from
their row (H13-ROW) or content pinned sideways. **Proposed:** H13-ABS, the band under the lowest ink of EVERY cell
≥ 30 % of the cell height, minus the slot's own Hw writing room. Backtest: today's value independent L (34 %) must fail.

**F2 (H2 / H5, C1 → 4, C3 → 5; expand and unit_form opener M/L).** The model frame runs past the page edge and under the
Steps column, and the page is ~55-60 % empty. *Fix:* the opener's model column must lay the pv frame out with the same
wrapping as the guided row, or put the model full width above the steps (L11). *Check:* `ws-grade-render --gate` already
prints OVERFLOW for these pages, but precritic runs it on lesson / test / independent only. **Extend `--gate` to every
offered role** (§7a).

**F3 (H2, C1 → 2-4, C2 → 2-4; true-false and reason-it of expand and unit_form).** The wrongAnswer is one string
("5 + 0 + 3", "hundreds 40 tens") written into EACH blank of a multi-blank frame, so it clips. Reason It overflows the A/B
boxes and the page edge. *Fix:* the provider's `wrongAnswer` must return one value per slot (`{b0, b1, b2}`), and
`roles/true-false` and `reason-it` must fill slot by slot. *Check:* `ws-node-lint WRONG-FITS` passed: it checks one slot.
**Make WRONG-FITS per slot**, add `L-OVERLAP TEXT-FRAME` and `--gate` OVERFLOW on these two roles, and backtest on today's
expand true-false.

**F4 (owner ruling, C2 -1; identify every page).** Card §5 has an owner ruling (2026-10-10): identify pupils ALSO write the
value of the underlined digit on a line (option `writeValue`, default on), and §9.2 recommends keeping it. `writeValue`
exists nowhere in `js/`. *Fix:* build the option and the line. *Check:* none. The ruling has no machine assert (the rulings
block lists it only as todo T-5.1). **Add a `ws-card-rulings` assert:** an identify item carries a graded `value` slot when
`writeValue` is on.

**F5 (VQ-8 paper ≠ screen, C4 -1; identify paper).** The default support is `labels`, and the card, worksheet and quiz all
print H T O over the digits. Identify's independent, test and lesson practice pages print no letters, yet the lesson's
step strip says "Read the letter above it" (L6, C2 -1). *Fix:* identify's paper cell honours `support`, as value's does.
*Check:* `ws-support-ladder` / `ws-options-verify` should compare the paper cell and the screen cell for one support value.
**Proposed** check: the same support value draws the same heads on paper and screen.

**F6 (SP-3 / VQ-8, C1 5, C2 6, C4 6; identify quiz).** The quiz shows one empty text input with no place words. The paper
is circle-one and the card is a 3-button choice. A pupil cannot know to type "tens", and spelling is now graded. *Fix:* the
quiz host uses the card's choice answer type (or the bank). *Check:* `ws-screen-answer` passed. **Proposed** host-parity
check: the answer kind is equal across card / worksheet / quiz for one item.

**F7 (C3 / C4, screen digits; identify cards, expand all hosts).** The identify card numeral is ≈ 33 px type at 1280 (target
56). Expand's number is ≈ 24 / 23 / 20 px at 1280 / 820 / 390, regular weight, left-aligned, with a non-Andika-heavy font
tally. *Fix:* the pv screen cell sets the numeral to the card digit token and Andika 700 for the identify numeral and the
expand frame head. *Check:* none measures numeral px. **Proposed** SCREEN-DIGIT check in `ws-screen-slots`: the largest
numeral in the cell ≥ 56 / 48 / 40 px and computed `font-family` Andika at weight ≥ 700.

**F8 (L1 Size S ignored, C3 -2 at S; unit_form).** S, M and L all print 9 items in 25.1 mm cells with 13.8 mm boxes.
*Fix:* box height = Hw + stroke from `ctx.metrics`. S should then fit ≥ 14 items, or 2 columns. *Check:* LESSONS L1
names `ws-columns --sizes` ("S must fit more items than L"). It is not on precritic's `--skill` path. **Put it there.**

**F9 (AX-4, C1 / C3 / C4 -1; combine L independent / test / lesson / order=scrambled, cols2 M).** 2-part items take
half-width, left-aligned cells and 3-part items take full-width, centred rows in the same section, and the half-width items
are sorted to the top. *Fix:* one cell geometry per section, using the widest frame. *Check:* `L-DENSITY GRID-EVEN` is
scoped to fact grids. **Widen GRID-EVEN to every kit section** (LESSONS "a grid rule belongs to every grid").

**F10 (L3 answer given away + H16, C2 → 5, C1 6; value form=unit).** The second box's width tracks the answer word (tens /
ones short, hundreds long), and neither box has a label. *Fix:* both boxes sized from the widest answer ("thousands"),
with a bank or labels. *Check:* `ws-slot-clip` SLOT-W is N/A here. **Proposed** SLOT-W-EQUAL: graded slots of one kind
in one section have one width.

**F11 (C2 / C4 -1; value and unit_form worked steps).** "1 hundreds is 1 × 100 = 100" (value ex-each), "1 ones."
(unit_form scripted model). *Fix:* pluralise from the count in `workedSteps`. *Check:* **proposed** providers-unit
PLURAL rule: no "1 <plural noun>" in any string over 50 seeds.

**F12 (C2 -1; value guided, opener, lesson anchor, scripted model).** A Grade 2 (2.NBT.1) page teaches "Multiply the digit
by its place: 3 tens is 3 × 10 = 30". × is 3.OA, and the card's own progression puts × at expanded notation. The guided
steps also cite "7 hundreds" while the model shows a 5. *Fix:* Grade 2 steps say "3 tens is 30"; keep × for `form=notation`.
*Check:* **proposed** VQ-LIVE extension: no × in steps or Say lines of a grade-2 item unless the option asks for notation.

**F13 (C2 6; value scripted model S/M/L).** The model item is 559 with the ONES digit underlined, the one case where the
value equals the digit. *Fix:* the model deals the tens or hundreds place. *Check:* **proposed** providers-unit: a model
item's asked place ≠ 1.

**F14 (L6, C2 -1; combine and expand scripted model / combine lesson anchor).** The steps say "write 5", "write 9", but
the drawing stays blank until the last step. *Fix:* each step row shows the partial answer (5_ _, 59_, 594). *Check:*
**proposed** providers-unit: step k's drawing holds the first k answers.

**F15 (H12, C1 4, C2 5; identify review S/M/L).** The mixed-review item "Draw disks to show 559" (an earlier skill) gives
the ones place a 19 mm x 19 mm zone (16 mm at S). Nine 8 mm disks do not fit. *Fix:* the review role sizes the disk-chart
zone from the largest digit, or deals a smaller number. *Check:* `ws-slot-clip` L-ANSAREA does not test draw zones.
**Proposed** DRAW-CAP: zone area ≥ digit x (8 mm)² per place.

**F16 (H11; stretch, all five).** The card signs `stretch` as offered. The engine returns "No Stretch for this skill yet".
*Fix:* add a stretch item for the family, or the lead re-signs §7a as out of scope (the RUBRIC scope note already keeps
stretch from being graded on its own). *Check:* `ws-spec-card --check-signed` passed. **Proposed:** a role decided
"offered" must render (no `unsupported`) in `ws-card-rulings --check offered`.

**F17 (H16 / H8, C1 6, C4 6; reason-it, all five).** "Circle A or B." with a "___ is correct" line and "The answer is ___":
three response areas for one choice. This is the role's design, not pv's. File it on `sheet/roles/reason-it.js`. *Check:*
`ws-visual-quality` VQ-ONEANSWER does not run on this role. **Run it there.**

**F18 (H5, C3 → 5; expand / unit_form lesson practice, opener S/L, scripted model S).** Lesson practice is 6 items spread
4 + 2 over two pages (p4 ~70 % empty). The opener with one guided item leaves 55-75 % of the page empty. *Fix:* the lesson
deals one full practice page, and the opener fills to the page. *Check:* PAGEFILL exists but precritic runs print-lint on
lesson pages at S and L only, and not on opener / scripted-model. **Extend to every offered role.**

**F19 (H2, C1 → 4; band=9999 on expand / unit_form L).** Frames overflow 13-16 mm. *Check:* `ws-options-verify --render`
covers appearance values only. **Add the difficulty values (band) to `--render`** via print-lint L-OVERFLOW.

**F20 (C3 6-7; expand form=notation L, unit_form band=99).** The closing "1" wraps alone, and "ones" wraps under its box.
*Fix:* keep "× 1" / "[ ] ones" as a non-breaking unit. *Check:* `L-OVERLAP WRAP` / WRAP-OP runs on lesson pages only.
**Run it on option renders.**

**F21 (matrix rows, C3 ≤ 5).** Sections pages-2, ex-group, and cols2 on expand / unit_form are real wasted pages (§4).
Route the Sections × pages and ex-group pagination to the engine owner. Route the ignored column request to the pv
`fits` code.

**F22 (minor, C2; combine pages-3 L).** Page 1 holds only zero-tens items. *Check:* **proposed** `ws-dealer-uniform`
per page, not only per sheet.

**F23 (error-analysis, out of bar; unit_form).** The singular label "hundred" / "one" in the Fix-it frame reveals the
answer 1 (L3). *Check:* the providers-unit L3 rule: no slot label derived from the answer.

## 6. Visual-quality questions (RUBRIC §6.1)

1. **Representation:** a place-value numeral with the digit underlined, the H T O heads, and the expanded / unit frames.
   It fits PV-06 / 07 / 09. A chart is offered (support=chart). Pass.
2. **Live parts:** "hundreds" on band 99 identify is a dead choice. The other parts are live.
3. **One answer place:** fails on value form=unit (unlabelled pair, width tells), reason-it (three areas), identify quiz
   (an undefined text box) and true-false (box plus sentence).
4. **Type and stroke:** paper is Andika 700 at 16 / 22 / 28 pt. Fails on screen for identify (≈ 33 px) and expand
   (≈ 24 px, regular weight).
5. **Paper = screen:** fails for identify (letters on screen only; the quiz loses the choices) and expand (weight and size).
6. **Title:** "I Can name the place of a digit" and the rest are proper sentences. Pass.
7. **Own renders:** every grade here is on these five skills' own renders at Grade 2, band 999 (plus the §7a option values).

## VERDICT: FAIL

All five skills fail.

**CORE pages** (practice, test, lesson, screen hosts, options), as (skill, page, criterion):
- identify: (independent S/M/L, C2 C3 C4), (more-practice S/M/L, C2 C3 C4), (test S/M/L, C2 C4; M/L C3), (lesson S/M/L, C1 C2 C3),
  (card-1280 / 820 C3, card-390 C3), (quiz C1 C2 C3 C4), (option band=99 C3), (band=9999 C3), (response=bank C2)
- value: (independent S/M/L, C3), (more-practice S/M/L, C3), (test S/M/L, C3), (lesson S/M/L, C1 C2), (option form=unit C1 C2 C3 C4)
- expand: (independent S, C3), (more-practice S, C3), (test S, C3), (lesson S/M/L, C3), (card-1280/820/390 C3 C4), (worksheet C3 C4),
  (quiz C3 C4), (option band=9999 C1 C3 C4), (form=notation L, C1 C3)
- combine: (independent S/M, C3; L, C1 C3 C4), (more-practice same), (test S/M C3; L C1 C3 C4), (lesson S/M/L, C2 C3 C4),
  (worksheet C3), (option order=scrambled C1 C3 C4)
- unit_form: (independent S, C3 C4; M, C3 C4), (more-practice S/M same), (test S/M same), (lesson S/M/L, C3),
  (option band=99 C1 C3), (band=9999 C1 C3 C4)

**Stand-alone roles** (graded because the brief and card §7a ask for them):
- every skill: (stretch S/M/L, all four: H11), (reason-it S/M/L, C1 C4; expand / unit_form all four)
- identify: guided S/L C3, scripted-model S/M/L C3, review S/M/L C1 C2 C3, true-false L C3, opener S C3
- value: guided C2 C3, scripted-model C2 C3, review C3, true-false L C3, opener C2 (L C3)
- expand: guided S C3, scripted-model C2 C3, review S C3, true-false all four, opener M/L C1 C3 C4 (S C3)
- combine: guided S C3, scripted-model C2 (S C3), review S C3, true-false L C3 C4, opener M/L C3
- unit_form: scripted-model C2 C4, true-false all four, opener S/M/L C3 (M/L C1 C4)
- error-analysis (out of the pass bar, for the record): identify M C3, value S/M/L C3, expand M C3, combine M C3, unit_form C2
- matrix rows (§4): sections/pages-2 (all five), sections/ex-each L SPREAD, sections/ex-group, single/more-cols2 (all five),
  combine single/pages-3 L: C3
