# Critic R3: div_facts "How it is written" (`divForm`)

Independent critic (mq-opus-medium), 2026-10-09. This round grades HEAD `b1bc7a1`, the builder's fix commit for R2. It is
measured against:
- `CRITIC-R1.md` and `CRITIC-R2.md`;
- RUBRIC.md and LESSONS_LEARNED.md;
- WORKSHEET_DESIGN_STANDARD §12.1, DN-22, CL-40 and AX-4;
- PAGE_TYPES.

## What I did

**Looked at the pages.** About 60 of the evidence PNGs, by eye:
- every form, and every page type at S and L;
- keys for Test, Mix Test and Reason It;
- the screen hosts for Standard, Long, Mix and Vertical.

**Measured every pupil page.** I pixel-scanned all 120 pupil pages (5 forms × 12 pages × 2 sizes). For each grid
cell I took the ink bounding box, with the label corner masked, and from it:
- the four empty bands (top, bottom, left, right);
- the row heights;
- the page strip under the grid.

I also compared three R3 pages against the R2 evidence in commit `ecd1e22`.

**Ran the lane test.** `node tests/scripts/ws-div-facts-forms.cjs` returned **OK**: every check passed, with no console
errors.

**Regression check.**
- Skills: `division:divide`, `division:div_remainders`, `multiplication:mult_facts`, `addition:add_facts` and
  `division:long_div_2digit`.
- Roles `lesson` and `independent`, at S and L.
- Rendered from HEAD and from `50dbfa6` (extracted with `git archive`, served with `MQ_ROOT`), then pixel-diffed
  (threshold 40 grey levels).

Browser runs were made one at a time.

**Scope** (RUBRIC §8d / §8e): Error analysis is outside the bar. Stand-alone Guided, True or False and Reason It are
*(info)*. Stretch and Word problems are not rendered, as accepted in R1.

## Verdict: **FAIL**

Minimum score per criterion over the graded versions: **C1 7 · C2 8 · C3 6 · C4 7.**

All six R2 defects are closed inside div_facts:
- **D-A:** Mix uses one uniform 3-column grid at L, with side bands ≤ 0.26.
- **D-B:** the Standard Test is filled to its ceiling.
- **D-C:** Mix fact rows and probe use one rung and tight dividend tracks.
- **D-D:** Mix Guided has 3 Models and one box per problem.
- **R-1:** the `div_remainders` lesson no longer overflows.
- **R-2:** the `divide` warm-up holds 3 items again.

The fixes brought in four new real defects:
1. On Mix pages, a bracket fact with a one-digit dividend draws its dividend two tracks away from the bracket (N-1).
2. The Standard Lesson at L prints the across fact in two looks on one page (N-2).
3. The Standard Lesson p2 at S became 41 % blank (N-3).
4. The `div_remainders` lesson warm-up at S now mixes two digit sizes and two slot places in one band (R-3).

## Score table

The four RUBRIC criteria: C1 ease of use · C2 educational value · C3 spacing · C4 standard fidelity.

| Version | Form | C1 | C2 | C3 | C4 | Defects / evidence |
|---|---|---|---|---|---|---|
| Independent S + key | Standard | 9 | 8 | 8 | 8 | none (30 items, bottom band ≤ 0.35 under a one-line fact, strip 0.03) |
| Independent L + key | Standard | 9 | 8 | 8 | 8 | none (16 items in 2 × 8, strip 0.16) |
| Independent S / L + key | Long division | 8 / 9 | 8 | 8 | 8 / 9 | none (28 / 15; open quotient; bracket 1-digit dividends drawn tight) |
| Independent S / L + key | Fraction | 9 | 8 | 8 | 8 | none (28 / 15, bands ≤ 0.30) |
| Independent S / L + key | Vertical | 9 | 8 | 8 | 8 | none |
| Independent S + key | Mix | 8 | 8 | 8 | **7** | N-1 (c "4 )   8", h "2 )   2") |
| Independent L + key | Mix | 8 | 8 | 8 | **7** | N-1 (c, h). D-A closed: 15 in 3 × 5, rows 148 px, side bands ≤ 0.26, strip 0.11 |
| Test A S + key | Standard | 9 | 8 | 8 | 8 | D-B closed: 20 in 4 × 5, strip 0.16; nit: bands 0.36 top / 0.33 bottom (see b) |
| Test A L + key | Standard | 9 | 8 | 8 | 8 | D-B closed: 12 in 3 × 4, strip 0.10, bands 0.32 / 0.28 |
| Test A S / L + key | Long / Fraction / Vertical | 8 | 8 | 8 | 8 | none; nit: Fraction S bands 0.36 / 0.35 |
| Test A S + key | Mix | 8 | 8 | 8 | **7** | N-1 (h "3 )   3", o "2 )   8", r "5 )   5") |
| Test A L + key | Mix | 8 | 8 | 8 | **7** | N-1 (h "3 )   3"); 12 in a uniform 3 × 4, rows 194 px |
| Lesson packet S + keys | Standard | 8 | 8 | **6** | 8 | N-3 (p2 41 % blank) |
| Lesson packet L + keys | Standard | **7** | 8 | 8 | 8 | N-2 (p2: Guided beside, Independent under) |
| Lesson packet S / L + keys | Long / Fraction / Vertical | 8 | 8 | 8 | 8 | none (p2 strip 0.04–0.23) |
| Lesson packet S / L + keys | Mix | 8 | 8 | 8 | **7** | N-1 (p3 d "2 )   4"). D-A closed on p2 / p3 (3 uniform columns) |
| Fact rows S / L + key | Standard / Vertical / Long / Fraction | 8–9 | 8 | 8 | 8 | unchanged since R2 |
| Fact rows S / L + key | Mix | 8 | 8 | 8 | **7** | N-1 (6 "4 )   8", 8 "4 )   0", 18 "6 )   0"). D-C closed: one rung, digit gap 0.71 |
| Fact probe S / L + key | Standard / Vertical / Long / Fraction | 8 | 8 | 8 | 8 | nit: Fraction S bands 0.38 / 0.37 (b); nit: an empty ruled 21st cell on the 3 × 7 probes |
| Fact probe S / L + key | Mix | 8 | 8 | 8 | **7** | N-1 (L 18 "9 )   0"); D-C closed |
| Guided *(info)* | Standard / Long / Fraction / Vertical | 8 | 8 | 8 | 8 | as R2 |
| Guided *(info)* | Mix S | 8 | 8 | **6** | **7** | D-D closed; grid ends at y 670 (about 43 % of the page blank, d); N-1 (2)2) |
| Guided *(info)* | Mix L | 8 | 8 | 8 | **7** | D-D closed; N-1 (2)2) |
| Reason It *(info)* | all, L | 8 | 8 | **7** | 8 | 2 items, cell bands 0.27–0.35 (d) |
| Reason It S, True or False *(info)* | all | 8 | 8 | 8 | 8 | none |
| Error analysis *(info, out of bar)* | all | 8 | 8 | 8 | 8 | none |
| Practice card 390 / 820 / 1280 | all five | 9 | 8 | 8 | 8 | nit: screen across spacing about 0.7 em against 0.29 em on paper; Mix across slot is beside on screen, under on paper (a) |
| Online worksheet 1280 | all five | 9 | 8 | 8 | 8 | same nits |
| Quiz 1280 | all five | 9 | 8 | 8 | 8 | same nits |

## Defects (in scope)

### N-1 · C4 → 7 (C1 nit): on Mix pages, a one-digit dividend sits two tracks away from its bracket

**Evidence.** The dividend is drawn right-aligned in a vinculum of at least two tracks, so an empty track opens between
the bracket and the digit. "2 )     2" reads as a missing digit.
- `mix-L-independent-p1.png`: c (4)8) and h (2)2).
- `mix-S-independent-p1.png`: c and h.
- `mix-S-test-p1.png`: h, o and r.
- `mix-L-test-key-p1.png`: h.
- `mix-L-lesson-p3.png`: d (2)4).
- `mix-S-fact-rows-p1.png` and `mix-L-fact-rows-p1.png`: 6, 8 and 18.
- `mix-L-fact-probe-p1.png`: 18.
- `mix-S-guided-p1.png` and `mix-L-guided-p1.png`: 2)2.

The Long-division form draws the same facts tight, e.g. `long-L-independent-p1.png` c "4)8" and h "2)2". So one fact
now has two drawings depending on the form.

**Cause.** The commit says "a Mix bracket fact keeps a vinculum of at least two tracks on paper". The padding brings the
cell's ink side band under the 0.33 gate. The gate is met by stretching the drawing, not by the layout.

**Rule:**
- RUBRIC C4 (one form, one drawing);
- VA-61 (digit tracks sized to the digits drawn);
- C1 (an empty track under the vinculum invites a digit, and makes it unclear where the quotient goes).

**Fix.** In `sheet/cells/long-division.js`, keep the vinculum one track per dividend digit plus the standard overhang,
exactly as the Long form draws it. A Mix cell holding a one-digit dividend accepts its own side band; it does not pad.
- If the cell must stay wider, centre the tight bracket in it. 4)8 is centred, so its side bands are about 0.36.
- Under the uniform grid, accept that one-digit brackets are the narrowest content. Read the side band for that case
  under the calibration in (b).
- Never put empty tracks under the vinculum.

**Check.** In `ws-div-facts-forms.cjs`: on every Mix page, the vinculum length of a bracket fact equals the Long-form
length for the same divisor and dividend (± 1 px). The gap from the bracket to the first dividend digit is ≤ 0.5 digit
width.

### N-2 · C1 → 7 (AX-4): Standard Lesson L puts the across fact in two looks on one page

**Evidence.**
- `standard-L-lesson-p2.png`: the Guided band prints "110 ÷ 11 = ___" with the line beside the sentence. The Independent
  band directly under it prints "81 ÷ 9 =" with the line on its own row underneath. The pupil practises one routine and
  is then asked for another.
- `standard-L-lesson-p3.png`: the line is under (15 items in 3 × 5).
- The stand-alone `standard-L-independent-p1.png` puts the line beside (16 in 2 × 8).
- At R2, both bands of p2 were beside (`ecd1e22`).

The cause is the R-2 rule "line under the sentence in a narrow column": the lesson's Independent band went to 3
columns.

**Rule:**
- AX-4 (response in the same place, a pupil who has learned one page can use the next);
- RUBRIC C1 ("the same task looks the same");
- R2's own R-2 goal of "one across look".

**Fix.** In `sheet/roles/lesson.js`, a band's column count for across equation cells must allow the answer *beside*
when the Guided band on the same page is beside. Keep the Independent band at the 2 columns that fit beside at L, as
R2 did (12 in 2 × 6). Alternatively, set the Guided band under, so the page has one look. The p3 practice page then
follows the stand-alone Independent L (beside, 2 columns).

**Check.** On every lesson page that holds across facts, every across cell has its answer line in the same position
relative to the sentence: all beside or all under.

### N-3 · C3 → 6: Standard Lesson p2 at S became 41 % blank (R2 was 25 %)

**Evidence.** `standard-S-lesson-p2.png`: 12 Independent facts sit in 3 × 4 rows of 70 px. The grid ends at y 683 and
the footer is at y 1050, so about 41 % of the body is empty. In R2's image (`ecd1e22`) the same 12 sat in 2 × 6 and
ended at y 822 (strip 0.25). The tighter R-2 across tracks let a 3rd column in, but the item count did not rise. L
holds the same 12 and fills its page.

**Rule:**
- RUBRIC C3 ("no half-empty page when more would fit");
- LESSONS L1 and L2 (S must hold more than L, not the same 12 with a hole under it).

**Fix.** In `sheet/roles/lesson.js`, size the Independent rows at S from the remaining page height: at 70 px a row, 6
rows (18) fit. Alternatively, keep 2 columns × 6 rows at S. The Score updates to match.

**Check.** The Standard lesson p2 strip is < 20 % at S and L, and at S it holds ≥ the L count.

## Regression findings (shared code, against `50dbfa6`)

| Skill | Result |
|---|---|
| `addition:add_facts`, `multiplication:mult_facts` | **Pixel-identical**: every lesson and independent page and key, at S and L |
| `division:long_div_2digit` | Only the bracket arc's half-stroke (161–768 px per page), accepted in R2. **No regression** |
| `division:divide` | Lesson p2 is **better**: S and L each go from 9 to 15 scored items, the strip falls from 0.37 to 0.31 at S and 0.24 at L, and the warm-up holds 3. At L the warm-up is under and the Guided band beside, but the parent did the same (pre-existing, not worse). p1 differs only in its Score. Independent is identical |
| `division:div_remainders` L | No overflow. 2 warm-up + 2 Guided + 2 Independent (/4, parent /5). The parent's 2-row tall warm-up cell is gone, and the strip is about 0.17. **Accepted (c)** |
| `division:div_remainders` S | Overflow fixed (the parent overflows at S). **New defect R-3** |

### R-3 · C1 / C4 7-class, introduced by R-1 / R-2: the `div_remainders` lesson warm-up at S mixes two looks in one band

**Evidence.** I rendered `ws-grade-render --skills division:div_remainders --roles lesson --size S`, page 2. The warm-up
band holds four cells:
- a "8 ÷ 2 = ___" and b "33 ÷ 3 = ___": digits about 15 px, line beside;
- c "110 ÷ 10 =" and d "54 ÷ 6 =": digits about 20 px, line under.

Two digit sizes and two answer places sit in one section. On c and d, the label ("c.", "d.") touches the first digit:
the equation starts inside the label's keep-out square.

**Rule:**
- AX-4 and RUBRIC C1 (the same task looks the same within a section);
- C4 (one digit size for one task);
- CL-40 (label keep-out).

**Fix.** In `sheet/roles/lesson.js`, the warm-up band draws every item with one template, one rung and one slot place:
the narrowest common fit. When the pool mixes two source skills, build the across cells through the one equation cell
at one metric. Apply the CL-40 left inset to the label-beside cells.

**Check.** On each lesson p2 warm-up band:
- every across item has the same digit cap height (± 1 px) and the same slot position;
- no ink falls inside (label side + 1 mm) of a cell's top-left corner.

Run it on `div_remainders`, `divide` and `div_facts` at S and L.

## R2 defect status

| R2 | Status | Evidence |
|---|---|---|
| D-A Mix L 2 columns | **Fixed** | `mix-L-independent-p1.png`: 15 in 3 × 5, rows 147–148 px, side ≤ 0.26, bottom ≤ 0.26. Test L 3 × 4 at 194 px; lesson p2 / p3 in 3 uniform columns. New fallout: N-1 |
| D-B Standard Test under-filled | **Fixed** | S 20 in 4 × 5 (strip 0.16); L 12 in 3 × 4 (strip 0.10) |
| D-C Mix fact rows / probe | **Fixed** | One cell height per page (S 89–90 px, L 100–101 px), across bottom band ≤ 0.24, dividend digit gap 0.71 digit. N-1 remains on the one-digit brackets |
| D-D Mix Guided *(info)* | **Fixed** | 3 Models (bracket, across, fraction), every try in its own box, seeds 376755 / 11 / 2026 at S and L |
| R-1 `div_remainders` overflow | **Fixed** | No overflow at S or L (the parent also overflowed at S). New R-3 at S |
| R-2 `divide` warm-up | **Fixed** | Warm-up 3, 15 scored items, strip 0.31 (S) / 0.24 (L). The paper across advance is 0.29 em on Independent against 0.27 em on fact rows. New split inside div_facts: N-2 |

The R1 fixes D1–D14 still stand.

## The builder decisions I was asked to judge

**(a) The across answer line under the sentence on Mix pages and the Standard Test.** **Acceptable on paper.**
- DN-22 and PAGE_TYPES list "answer stacked below" as a sanctioned row pitch.
- Every across cell on those pages is the same, so one section has one routine (AX-4).
- It is not acceptable when the same page also carries the beside look. That is N-2 and R-3.
- The screen twin does **not** match: on the Mix card, worksheet and quiz, the across fact keeps its box *beside* the
  "=" (`mix-L-worksheet-1280.png` item 3, `mix-L-quiz-1280.png`). A screen card holds one item in a wide cell, and the
  slot is the same kind (a number after "="), so I score it as a nit, not a defect.
- One related nit: the screen across spacing is still about 0.7 em against 0.29 em on paper. R-2 tightened only the
  paper cell.

**(b) The 0.33 blank-band gate.** **Acceptable as calibration, with two conditions.**
- The 0.30 → 0.33 slack covers what the label row and a centred one-line item add on their own.
- Condition 1: no cell may meet the gate by stretching its drawing (N-1 does).
- Condition 2: pages the gate does not run on still sit above it:
  - Fraction S probe 0.38 / 0.37 (unchanged since R2);
  - Fraction S Test 0.36 / 0.35;
  - Standard S Test top 0.36.
- These are ceiling-filled pages: Test 20 and probe 20 at S. There, taller rows are the standard's own answer to "fill
  the page", so I accept them at 8 as nits.
- To reach 10, give the spare height to the space below the answer (PG-14) rather than centring.

**(c) The `div_remainders` lesson at L holds 4 scored items against the parent's 5.** **Accepted.**
- Nothing overflows.
- The parent's tall warm-up cell with b stacked under it is gone.
- The strip is about 0.17, under the 20 % line.

**(d) Reason It at L, and the Mix Guided page at S.**
- **Reason It L:** A beside B is an improvement. A and B read as a pair at the digit size, and the key circles and fills
  correctly. Two items in 360 px cells leave bands of 0.27–0.35. Info role: C3 7, not part of the verdict.
- **Mix Guided S:** about 43 % of the page is blank by my scan (grid end y 670). Info role: C3 6, not part of the
  verdict. Stand-alone Guided S for Standard is similar (0.41), so it is a role-wide filing, not a div_facts blocker.

## What would raise each criterion to 10

- **C1:** one across look per page and across hosts (N-2, R-3, and the screen spacing).
- **C2:** a Guided bracket item on the Mix lesson p2. Its Guided row today is across + fraction + fraction.
- **C3:**
  - S lesson p2 filled (N-3);
  - spare height on ceiling pages given to working room below the answer;
  - no empty ruled cell at the end of 3 × 7 probes (rebalance the last row).
- **C4:**
  - one drawing per bracket fact (N-1);
  - no seam or step in the vinculum at track joins (`mix-L-fact-rows-p1.png` 15 and 22, `mix-L-lesson-p3.png` i).

## Numbered defect list

1. **N-1** (C4 7, in scope): on Mix pages, a one-digit dividend is right-aligned in a padded two-track vinculum, so a
   blank track sits under the bar ("2 )   2"). This shows on Independent, Test, Lesson p3, Fact rows, Probe and Guided,
   at S and L. The Long form draws the same fact tight.
2. **N-2** (C1 7, in scope): Standard Lesson L p2 prints the Guided across facts with the line beside and the
   Independent across facts with the line under, on one page. p3 is under while the stand-alone Independent L is
   beside.
3. **N-3** (C3 6, in scope): Standard Lesson p2 at S is 41 % blank (12 items in 3 × 4). R2 was 25 %.
4. **R-3** (regression, other skill): the `div_remainders` lesson p2 warm-up at S mixes 15 px digits with the line
   beside (a, b) and 20 px digits with the line under (c, d) in one band. The c and d labels touch the first digit
   (CL-40).
5. *(info)* Mix Guided at S is about 43 % blank. Reason It at L has 2 items with bands up to 0.35.
6. *(nits)*:
   - screen across spacing is wider than paper, and the Mix across slot is beside on screen but under on paper;
   - Fraction S probe / Test bands 0.35–0.38 on ceiling-filled pages;
   - an empty ruled 21st cell on the 3 × 7 probes;
   - vinculum seams at track joins.
