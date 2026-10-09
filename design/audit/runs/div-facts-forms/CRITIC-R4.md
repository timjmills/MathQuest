# Critic R4: div_facts "How it is written" (`divForm`)

Independent critic (mq-opus-medium), 2026-10-09. This round grades HEAD `f3c13be`, the builder's fix commit for R3. It is
measured against:
- `CRITIC-R1.md`, `CRITIC-R2.md` and `CRITIC-R3.md`;
- RUBRIC.md (with the §8d / §8e scope notes) and LESSONS_LEARNED.md;
- WORKSHEET_DESIGN_STANDARD CL-8, CL-40, DN-1a, DN-22, AX-4 and VA-61;
- PAGE_TYPES (lesson packet grids, PT-LBL-7).

## What I did

**Looked at the pages.** About 50 of the round-4 PNGs, by eye:
- every form, at S and L, on Independent, Test, Lesson p1 to p3, Fact rows, Fact probe and Guided;
- keys for Mix Test L and Standard Lesson S p2;
- all three screen hosts for Long, Mix and Standard.

I also compared some pages with the R3 evidence in `e220ca7`:
- Standard Lesson L p1 to p3 and S p2 / p3;
- the S p3 pages of every form;
- the Long worksheet.

**Measured every pupil page.** A pixel scan of all 110 pupil pages (5 forms × 11 roles × 2 sizes, Error analysis left
out). It reads the grid lines, the cell ink boxes with the label corner masked, and the page strip under the grid. I also
measured the side pads of cells, bracket to digit, on the pages named below.

**Ran the lane test.** `node tests/scripts/ws-div-facts-forms.cjs` returned **OK**:
- 627 checks passed, none failed, no console errors;
- this includes the new N-1, N-2, N-3 and R-3 checks.

**Regression check.**
- Skills: `division:divide`, `division:div_remainders`, `multiplication:mult_facts`, `addition:add_facts` and
  `division:long_div_2digit`.
- Roles `lesson` and `independent`, at S and L, pupil pages and keys.
- Rendered from HEAD and from `50dbfa6` (from `git archive`, served with `MQ_ROOT`), then pixel-diffed at a threshold
  of 40 grey levels.

Browser runs were made one at a time: four renders, then the lane test.

**Scope** (RUBRIC §8d / §8e):
- Error analysis is outside the bar.
- Stand-alone Guided, True or False and Reason It are *(info)*.
- Stretch and Word problems are not rendered, as accepted in R1.

## Verdict: **PASS**

Minimum score per criterion over the graded versions: **C1 8 · C2 8 · C3 8 · C4 8.**

All four R3 defects are closed, and I found no new defect in scope:
- **N-1:** every bracket fact on every Mix page is drawn tight, the same drawing as the Long form.
- **N-2:** the Standard Lesson L has one across look on p2 and p3.
- **N-3:** the Standard Lesson S p2 is filled.
- **R-3:** the `div_remainders` warm-up has one look and one digit size.

The R3 §6 nits are fixed (vinculum seam, screen across spacing, Mix screen slot place) or I accept them (see the builder
items). Two items are filed below:
- one finding on another skill (R-4, `divide`), which is not worse than the parent;
- one observation on the lesson role (O-1), which is role-wide and was there before this lane.

## Score table

The four RUBRIC criteria: C1 ease of use · C2 educational value · C3 spacing · C4 standard fidelity.

| Version | Form | C1 | C2 | C3 | C4 | Notes / evidence |
|---|---|---|---|---|---|---|
| Independent S + key | Standard | 9 | 8 | 8 | 8 | 30 in 3 × 10, strip 0.04 |
| Independent L + key | Standard | 9 | 8 | 8 | 8 | 16 in 2 × 8, strip 0.17 |
| Independent S / L + key | Long division | 8 / 9 | 8 | 8 | 9 | 28 / 15, open quotient, every bracket tight |
| Independent S / L + key | Fraction | 9 | 8 | 8 | 8 | 28 / 15 |
| Independent S / L + key | Vertical | 9 | 8 | 8 | 8 | 20 in 5 × 4 at S; working room under the rule |
| Independent S + key | Mix | 8 | 8 | 8 | **8** | N-1 closed: c "4)8" and h "2)2" tight; 28 in 4 × 7, strip 0.20 |
| Independent L + key | Mix | 8 | 8 | 8 | **8** | N-1 closed: c and h tight; 15 in 3 × 5, strip 0.12 |
| Test A S / L + key | Standard | 9 | 8 | 8 | 8 | 20 in 4 × 5 / 12 in 3 × 4 |
| Test A S / L + key | Long / Fraction / Vertical | 8 | 8 | 8 | 8 | nits: Fraction S bands about 0.36; Vertical L strip 0.21 |
| Test A S / L + key | Mix | 8 | 8 | 8 | **8** | N-1 closed (S h "3)3", o "2)8", r "5)5"; L h); key correct, answers in the slot |
| Lesson packet S + keys | Standard | 8 | 8 | **8** | 8 | N-3 closed: p2 holds 21 Independent in 3 × 7, strip 0.19, one across look; observation O-1 on p3 |
| Lesson packet L + keys | Standard | **8** | 8 | 8 | 8 | N-2 closed: p2 Guided and 12 Independent (2 × 6) all beside; p3 16 in 2 × 8 beside, as the stand-alone page |
| Lesson packet S / L + keys | Long / Fraction / Vertical | 8 | 8 | 8 | 8 | p2 strip 0.03–0.10; O-1 on S p3 |
| Lesson packet S / L + keys | Mix | 8 | 8 | 8 | **8** | N-1 closed on p3 (d "2)4"); p2 / p3 uniform 3 or 4 columns; nit: no bracket among the 3 Guided items on p2 |
| Fact rows S / L + key | Standard / Vertical / Long / Fraction | 8–9 | 8 | 8 | 8 | Vertical S has 49 facts in 7 columns (the owner allows up to 10) |
| Fact rows S / L + key | Mix | 8 | 8 | 8 | **8** | N-1 closed (6 "4)8", 8 "4)0", 18 "6)0"); S 27 / L 24; one unbroken vinculum |
| Fact probe S / L + key | Standard / Vertical / Long / Fraction | 8 | 8 | 8 | 8 | nits (b) and (a) below |
| Fact probe S / L + key | Mix | 8 | 8 | 8 | **8** | N-1 closed (L 18 "9)0"); nit (a) |
| Guided *(info)* | Standard / Long / Fraction / Vertical | 8 | 8 | 8 | 8 | as R3 |
| Guided *(info)* | Mix S | 8 | 8 | 6 | 8 | N-1 closed (2)2 tight, one box); grid ends y 669, about 43 % blank (unchanged role-wide filing from R3) |
| Guided *(info)* | Mix L | 8 | 8 | 8 | 8 | N-1 closed |
| Reason It *(info)* | all, L | 8 | 8 | 7 | 8 | unchanged from R3 (2 items, bands up to 0.35) |
| Reason It S, True or False *(info)* | all | 8 | 8 | 8 | 8 | none |
| Error analysis *(out of bar)* | all | 8 | 8 | 8 | 8 | none |
| Practice card 390 / 820 / 1280 | all five | 9 | 8 | 8 | 8 | Mix across slot now under the sentence, as on paper; nit (c) on one-digit brackets |
| Online worksheet 1280 | all five | 9 | 8 | 8 | 8 | nit (c): "7)  28", "2)  8" gap; parity with paper otherwise |
| Quiz 1280 | all five | 9 | 8 | 8 | 8 | none |

No score in scope is below 8.

## R3 defect status

| R3 | Status | Evidence |
|---|---|---|
| **N-1** Mix one-digit bracket padded | **Fixed** | The gap is gone in every image R3 named: `mix-L-independent-p1` c / h, `mix-S-test-p1` h / o / r, `mix-L-test-key-p1` h, `mix-L-lesson-p3` d, both Mix fact-rows pages (6, 8, 18), `mix-L-fact-probe-p1` 18, and both Mix Guided pages. Each now reads "4)8" with the vinculum ending at the digit's track, the same as `long-L-independent-p1`. Lane test: bracket to first digit 0.19–0.41 digit, vinculum overhang ≤ 0.01 px, at S and L on every Mix role |
| **N-2** Standard Lesson L, two across looks | **Fixed** | `standard-L-lesson-p2.png`: 3 Guided and 12 Independent in 2 × 6, all with the line beside. `standard-L-lesson-p3.png`: 16 in 2 × 8 beside, matching `standard-L-independent-p1.png` |
| **N-3** Standard Lesson S p2 41 % blank | **Fixed** | `standard-S-lesson-p2.png`: 2 Guided and 21 Independent in 3 × 7. The grid ends at y 890, strip 0.19 (R3: 0.41). S 21 ≥ L 12. Side pads 22–40 px (CL-8 met) |
| **R-3** `div_remainders` warm-up mixed looks | **Fixed** | `cmp-r4-div_remainders-lesson-p2-S/L.png`: warm-up a "8 ÷ 2 = ___" and b "110 ÷ 10 = ___", one digit size (37 px by the lane test), both beside, labels clear. No overflow at S or L |
| §6 vinculum seam at track joins | **Fixed** | `mix-L-fact-rows-p1` 15 / 21 / 22 and `mix-L-lesson-p3` b / m have one unbroken bar. `long_div_2digit` shows the same improvement (regression table) |
| §6 screen across spacing | **Fixed** | `standard-L-worksheet-1280.png` "28 ÷ 7 = ___" is set tight, as on paper |
| §6 Mix screen slot place | **Fixed** | `mix-L-quiz-1280.png` and `mix-L-worksheet-1280.png` item 3: the across slot sits under the sentence, as on Mix paper |
| §6 Fraction S bands; empty 21st probe cell | Builder left open; judged below as nits (b) and (a) |

The R2 fixes (D-A to D-D, R-1, R-2) and the R1 fixes (D1 to D14) still stand: the lane test re-checks each one and
passes.

## The builder items I was asked to judge

**(a) The empty ruled 21st cell on the 3 × 7 probes** (`mix-L-fact-probe-p1.png`, Fraction L, Long L). **Nit, C3 8.**
- The probe is a fixed 20-item fluency measure, so the count is right.
- The empty cell is the last cell of a regular grid. It is unlabelled, and nothing invites an answer there.
- To reach 10, use one of these:
  - leave the 21st cell unruled (close the grid with the row's bottom border only);
  - choose a grid that divides 20: 4 × 5 at S, where Fraction and Mix S already use 4 columns.

**(b) The Fraction S probe and Test cell bands of 0.35–0.38** (`fraction-S-fact-probe-p1.png`, `fraction-S-test-p1.png`).
**Nit, C3 8,** as in R3.
- Both pages are at the role's ceiling (20 items), and the strip is ≤ 0.17.
- The extra height is shared above and below a fraction about 50 px tall. Nothing is crushed and no cell looks empty.
- To reach 10, give the spare height to working room below the answer (PG-14), not to centring.

**(c) The gap on the screen worksheet in a bracket with a narrow dividend** ("7)  28", "3)  21", "2)  8" in
`long-L-worksheet-1280.png`; also item 6 of `mix-L-worksheet-1280.png`). **Nit, C4 8. Not caused by this lane.**
- **Cause.** The quotient slot keeps a 64 px floor (`css/screen-cell.css:179`, `.mq-ldiv-q .mq-slot { min-width:
  max(100%, 64px) }`), so column 3 of the bracket grid is at least 64 px wide. A dividend narrower than that leaves an
  empty stretch under the vinculum.
- **It predates the lane.** Lines 136–179 of `screen-cell.css` and `divisionHTML()` in `screen-cell.js` are
  byte-identical at `50dbfa6`. It shows more often now only because the new Long form puts 1–2 digit dividends on
  screen at 29 px.
- **Why a nit and not a 7.**
  - On screen the pupil can type only in the box, so the empty track does not invite a digit, which was the C1 harm
    of N-1 on paper.
  - The practice card and the quiz (40–56 px digits) draw 2-digit dividends tight (`long-L-card-390.png` "11)44",
    `long-L-quiz-1280.png` "11)66").
- **To reach 10.**
  - Set the dividend against the arc: `justify-self: start` on `.mq-ldiv-dvd`, an additive CSS rule.
  - Let the vinculum run on to the slot's right edge, as the paper's standard overhang does.
  - Keep the 64 px box for touch.

## Regression findings (shared code, against `50dbfa6`)

| Skill | Result |
|---|---|
| `addition:add_facts` | **Pixel-identical**: lesson p1 to p3 and independent, pupil and key, at S and L |
| `multiplication:mult_facts` | **Pixel-identical**: same set |
| `division:long_div_2digit` | Only the arc's join with the vinculum differs (161–774 px a page). In the parent the arc's top stroke sits above the vinculum and leaves a step. At HEAD it meets one continuous bar (checked on a crop of independent p1 L, item 16)880). **Better; no regression** |
| `division:div_remainders` | Lesson p2 only. The parent overflows at S. HEAD: no overflow, and one warm-up look (R-3 closed). Independent identical |
| `division:divide` | Lesson p1 differs only in its Score. In p2 the warm-up is beside at S (the parent had it under), and the page holds 15 scored items against the parent's 9 at both sizes. The warm-up is still under at L, as in the parent (not worse). Independent identical. One new observation: **R-4** below |

### R-4 (follow-up for `divide`, not part of this verdict): a 3-digit across fact runs into the cell's pad

**Evidence.** Rendered with `ws-grade-render --skills division:divide --roles lesson` at S and at L.
- Lesson p2, item l "121 ÷ 11 = ___": the answer line ends at x 743, and the cell border is at x 746.
- That leaves 3 px (0.8 mm) on the right. CL-8 asks for 3 mm.
- Every other cell on the page keeps more than 3 mm.

**Why it is not counted as a regression of this lane:**
- The parent used the same 3-column cell geometry on this band. It did not deal a 3-digit item there only because it
  dealt 6 items, not 12.
- The HEAD page is better than the parent overall: 15 items against 9, and a strip of 0.31 against 0.37 at S.
- `divide` is not graded in this lane.

**Risk to `div_facts`.** The same column chooser builds div_facts' Standard Lesson p2 at S in 3 columns. The evidence
seed deals only 2-digit dividends there (pads measured at 22–40 px). A 3-digit fact (108 ÷ 12, 132 ÷ 12) dealt into
that band would hit the same limit.

**Fix.** In `sheet/roles/lesson.js`:
- the column fit (`bestCols` / `reflowsAt`) must test the widest across item of the band against the cell's inner
  width less CL-8's 3 mm pads, not only whether the line drops under;
- when the widest item does not fit, take one column fewer (2 at L, which PAGE_TYPES lists for lesson Independent
  pages).

**Check.** On every lesson p2 / p3 band, no ink falls within 3 mm of a cell's right border. Run it on `divide`,
`div_facts` (Standard, S and L) and `div_remainders`.

### O-1 (observation, role-wide, unchanged since before R3): the lesson's p3 practice page does not grow at S

- At S, p3 holds the L count:
  - Standard 16 in 2 × 8, the grid of L;
  - Fraction 15 in 3 × 5, the grid of L;
  - Long and Mix 16 in 4 × 4, against L's 15 in 3 × 5.
- The stand-alone S Independent holds 28–30.
- The pages are full (strip 0.03) and well spaced. PAGE_TYPES lists "2 on Independent pages" for lesson packet grids, so
  the Standard page follows its table.
- The Long and Mix S p3 cells are 196 px tall around a bracket about 40 px tall (bands up to about 0.38).
- p3 is byte-identical to R3 apart from the Steps band. `divide`'s p3 also prints 6 items at both sizes.

I do not score this against div_facts. I file it for the lesson role: decide whether a lesson's Practice page follows
DN-1a ("Size S never prints the grid of L") and holds the S count of the stand-alone page.

Related and also unchanged: the Standard anchor chart (p1) ends at y 603, so about 50 % of that page is blank. The other
forms' anchors fill 0.03–0.28. The anchor holds exactly its 4 steps and the Say band, so I note it but do not score it.

## Nits (no score effect)

- (a), (b) and (c) above.
- Mix lesson p2: the Guided row is across + fraction + fraction, with no bracket, although the Independent band has
  brackets (C2 to 10).
- Vertical L Test: strip 0.21, just over the 20 % line; the cells keep about 0.4 of their height as room under the rule.
- The lesson Steps band names the anchor's example (110 ÷ 11), which is not one of the Guided items. This is
  consistent across forms and was the same in R3.

## Numbered defect list

**In scope (div_facts): none.** Verdict PASS.

Outside scope or nits:
1. **R-4** (follow-up, `divide` lesson p2, S and L): "121 ÷ 11 = ___" leaves 0.8 mm to the cell's right border (CL-8
   asks for 3 mm). The page is not worse than the parent. The same column fit could cramp a 3-digit fact on div_facts'
   Standard Lesson S p2 if one were dealt.
2. **O-1** (role-wide observation): the lesson p3 Practice page prints L's count at S, and the Standard anchor p1 is
   about 50 % blank. Both predate R3.
3. *(nit a)* An empty ruled 21st cell on the 3 × 7 probes.
4. *(nit b)* Fraction S probe and Test cell bands of 0.35–0.38 on ceiling-filled pages.
5. *(nit c)* The screen worksheet bracket gap ("7)  28"), from the parent's 64 px quotient-slot floor.
6. *(nits)* No bracket in the Mix lesson Guided row; Vertical L Test strip 0.21.
