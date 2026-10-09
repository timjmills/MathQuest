# Critic R2: div_facts "How it is written" (`divForm`)

Independent critic (mq-opus-medium), 2026-10-09. Grades HEAD `72b508e` (the builder's R1 fix commit), against
`CRITIC-R1.md` (D1–D14), RUBRIC.md, LESSONS_LEARNED.md, WORKSHEET_DESIGN_STANDARD §12.1 / PG-14 / INK-30, PAGE_TYPES.

What I did:
- Looked at about 70 of the 247 PNGs: every form, every page type, S and L, keys, and all three screen hosts.
- Pixel-scanned cell bands (ink bounding box per grid cell), digit heights, digit gaps and grid rules.
  As a calibration, the unchanged Standard fact-rows page (passed in R1) measures an ink bottom band of 0.30–0.31.
  So I read ink bands up to about 0.33 as normal, and anything clearly above that as real.
- Re-ran `node tests/scripts/ws-div-facts-forms.cjs`: **OK** (every check PASS, no console errors).
- Ran `ws-print-lint --source kit` on div_facts:
  - Standard: S and L, roles independent, test, lesson, fact-rows, fact-probe and guided.
  - Mix: L.
  - Result: 0 findings. The lint measures element boxes, not ink, and is blind to the findings below.
- Regression check: rendered 7 other skills from HEAD and from the parent `128e234` (extracted with `git archive`) and
  pixel-diffed them. Details are in the regression section.

## Verdict: **FAIL**

Minimum per criterion over the graded versions: **C1 7 · C2 8 · C3 6 · C4 7.**

Most of R1 is genuinely fixed. Three things still fail the bar inside div_facts:
- Mix fact rows and probe (D-C): wasted rows, and the bracket digits are spread apart.
- The Standard Test page (D-B): the page is under-filled.
- Mix at L (D-A, the R1 D14 leftover): two columns leave the bracket and fraction cells two-thirds empty.

There are also two regressions in other division skills (R-1, R-2).

Scope:
- Under RUBRIC §8d/§8e, Error analysis is outside the bar. Stand-alone Guided, True or False and Reason It are
  *(info)*: they are scored, but they do not decide the verdict.
- Stretch and Word problems are not rendered. Accepted in R1, and still accepted.

## Score table

C1 ease of use · C2 educational value · C3 spacing · C4 standard fidelity.

| Version | Form | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|---|
| Independent S + key | Standard | 9 | 8 | 8 | 8 | none (30 items; ink band 0.36 under centred one-line facts, within calibration) |
| Independent L + key | Standard | 9 | 8 | 8 | 8 | none (16 items, 13 % strip) |
| Independent S + key | Long division | 8 | 8 | 8 | 8 | none (28 items, open quotient, aa./bb. labels) |
| Independent L + key | Long division | 9 | 8 | 8 | 9 | nit: 1-px seam in the vinculum at a track join (item i) |
| Independent S / L + key | Fraction | 9 | 8 | 8 | 8 | none |
| Independent S / L + key | Vertical | 9 | 8 | 8 | 8 | none |
| Independent S + key | Mix | 8 | 8 | 8 | 8 | none |
| Independent L + key | Mix | 8 | 8 | **7** | 8 | D-A |
| Test A S + key | Standard | 9 | 8 | **6** | 8 | D-B |
| Test A L + key | Standard | 9 | 8 | **7** | 8 | D-B |
| Test A S/L + key | Long / Fraction / Vertical | 8 | 8 | 8 | 8 | none |
| Test A S + key | Mix | 8 | 8 | 8 | 8 | none |
| Test A L + key | Mix | 8 | 8 | **7** | 8 | D-A (uneven rows 90–155 px) |
| Lesson packet S/L + keys | Standard | 8 | 8 | 8 | 8 | none |
| Lesson packet S/L + keys | Long division | 8 | 8 | 8 | 8 | nit: Guided quotient boxes 4 mm under the frame top (L p2) |
| Lesson packet S/L + keys | Fraction / Vertical | 8 | 8 | 8 | 8 | none |
| Lesson packet S + keys | Mix | 8 | 8 | 8 | 8 | none |
| Lesson packet L + keys | Mix | 8 | 8 | **7** | 8 | D-A (p2, p3 at 2 columns) |
| Fact rows S/L + key | Standard | 9 | 8 | 8 | 8 | none |
| Fact rows S/L + key | Vertical | 9 | 9 | 8 | 9 | none |
| Fact rows S/L + key | Long division | 8 | 8 | 8 | 8 | nit: 12)108 within 2 mm of the cell sides at S |
| Fact rows S/L + key | Fraction | 8 | 8 | 8 | 8 | none |
| Fact rows S/L + key | Mix | **7** | 8 | **6** | **7** | D-C |
| Fact probe S/L + key | Standard / Vertical | 9 | 8 | 8 | 8 | none (unchanged since R1) |
| Fact probe S/L + key | Long / Fraction | 8 | 8 | 8 | 8 | none (one page each) |
| Fact probe S/L + key | Mix | **7** | 8 | **6** | **7** | D-C |
| Guided *(info)* | Standard / Long / Fraction / Vertical | 8 | 8 | 8 | 8 | none |
| Guided *(info)* | Mix S | **6** | **6** | **5** | **6** | D-D (two problems in one box; no Standard item) |
| Guided *(info)* | Mix L | 8 | **6** | 7 | 8 | D-D (no Standard item; 32 % page blank) |
| Error analysis *(info, out of bar)* | all | 8 | 8 | 8 | 8 | none (claims at digit size now) |
| True or False / Reason It *(info)* | all | 8 | 8 | 8 | 8 | none (Reason It A over B for wide across) |
| Practice card 390 / 820 / 1280 | all five | 9 | 8 | 8 | 8 | none ("Divide." on every form; box ≥ 44 px) |
| Online worksheet 1280 | all five | 9 | 8 | 8 | 8 | none (bracket at 29 px; box 12 px under the cell top) |
| Quiz 1280 | all five | 9 | 8 | 8 | 8 | none |

## Defects (in scope)

**D-A · C3 −1 (major, R1 D14 not closed) · Mix at L stays 2 columns, so bracket and fraction cells are two-thirds empty and the rows are uneven.**
- **Evidence:**
  - `mix-L-independent-p1.png`, ink scan per cell (cells 346 px = 92 mm wide):
    - bracket c (4)8) and h (2)2): side bands 0.38 and 0.36 each side;
    - fraction cells: 0.24–0.27 each side;
    - across cells: bottom band 0.31–0.32.
  - Row heights 110 / 121 / 110 / 117 / 110 / 122 / 121 px.
  - `mix-L-test-key-p1.png`: rows 90–155 px tall in one grid.
  - `mix-L-lesson-p2.png` and `-p3.png` show the same grid.
- **Why the builder's reason does not close it:** an across fact needs about 77 mm at L, so a uniform 3-column grid is
  impossible. But the across fact is the only form that needs 2 columns. Long and Fraction alone fit 3 at L (15 items
  each), and the brackets in a 2-column grid show exactly the H13 "tiny drawing in a big box" look.
- **Rule:** RUBRIC C3 (equal cells, no big empty bands), H13 (measured ≥ 30 % band), LESSONS L2 ("mixed-height items get
  their own rows").
- **Fix:**
  - In `sheet/layout.js` `resolveSectionLayout`, in the `keepOrder` (divMix) branch, stop forcing one column count on the
    section. Lay a Mix section out as **rows of one form**:
    - across rows at 2 columns;
    - bracket and fraction rows at the 3 columns their own footprint allows;
    - rows cycle Standard → Long → Fraction in dealt order, so the page stays interleaved and one third each;
    - each row's height is the measured height of its form.
  - Score and labels run on as now. The same row builder serves `fact-rows.js` `formGrid` (see D-C).
- **Check:** `ws-div-facts-forms.cjs` adds three assertions for Mix L independent / test / lesson:
  - every cell's ink side band is < 30 %;
  - the bracket and fraction rows have 3 cells;
  - the page holds ≥ 15 items.
- **To 10:** form rows at full width, row pitch from each form's measured height, page strip < 10 %.

**D-B · C3 → 6 at S, 7 at L · Standard Test is under-filled: S prints 18 of 20 with 41 % of the page blank; L prints 10 of 12 with 32 % blank.**
- **Evidence:**
  - `standard-S-test-p1.png`: a 3 × 6 grid ends at y 683 of a 1040 px grid area.
  - `standard-L-test-p1.png`: a 2 × 5 grid ends at y 768, and 6 rows of 118 px fit.
  - Long, Fraction and Mix Test fill to 20 (S) and 12 (L) on the same role.
  - This is new in R2. D4's switch to the one-line equation cell made the cells short, but the Test still steps down to the
    `TWO_COL_ROWS` grid (L) and does not deal its ceiling (S).
- **Rule:** RUBRIC C3 ("at the capacity the table allows; no half-empty page when more would fit"), 12.1 Test 20 / 16 / 12.
- **Fix:**
  - In `sheet/layout.js`, skip the `TWO_COL_ROWS` step-down when the section states a role ceiling (`section.ceiling`, the
    Test) and `ceiling / cols` rows fit `G`. At L that gives 2 × 6 = 12.
  - At S, deal the ceiling of 20 as 3 × 7 with a rebalanced, centred last row of 2.
  - Give spare grid height to the rows below the answer line (PG-14) until the strip is < 20 %.
- **Check:**
  - Standard Test S holds 20 and L holds 12.
  - The page strip under the grid is < 20 % (pixel scan, or `PAGEFILL` extended to role `test`).
  - The across cells' ink bottom band stays ≤ 0.35.

**D-C · C3 → 6 (H13), C1 −1, C4 −1 · Mix fact rows and Mix fact probe put one-line across facts in rows sized for two-line forms, and spread the bracket digits apart.**
- **Evidence:**
  - `mix-S-fact-rows-p1.png`, across cells 1, 4, 7 …: a 15 px line in a 118 px cell, with ink top band 0.44–0.45 and bottom
    band 0.39–0.40. The same Standard facts on `standard-S-fact-rows-p1.png` sit in 74 px cells (bottom 0.30).
  - `mix-L-fact-rows-p1.png`: 138 px cells, bottom band 0.37.
  - `mix-L-fact-probe-p1.png`: bottom 0.34–0.35, side band 0.34 on the brackets.
  - Digit cap height on Mix fact rows is 15 px at both S and L, against 19 px on the Standard fact rows.
  - Bracket tracks are about 2.8 digit widths wide: in "9 ) 7 2" on `mix-S-fact-rows-p1.png` the gap between 7 and 2 is
    18 px for a 10 px digit, so "72", "12" and "16" read as two separate digits. The same fact on `long-S-fact-rows-p1.png`
    has a 12 px gap for a 14 px digit.
- **Rule:**
  - H13 ("a row/section of a mixed sheet sized for a taller item than it holds");
  - LESSONS L2;
  - C1 (legible numbers: a 2-digit number must read as one number);
  - VA-61 (digit tracks sized to the digit drawn).
- **Fix:**
  - In `sheet/roles/fact-rows.js` `formGrid` / `formCell` (used by `fact-probe.js` too), use the D-A row builder: rows of
    one form, cycling the forms. Across rows take the Standard fact-row pitch and digit rung (19 px), and bracket and
    fraction rows take theirs.
  - In `sheet/cells/long-division.js`, when the cell is drawn at a ladder digit smaller than `ctx.metrics.digitPt`
    (`formCell`'s scaled size), take `trackMm` from that drawn digit (about 1.1 × the digit advance), not from
    `g.writeMm * 0.8`.
- **Check:**
  - On Mix fact rows and probe at S and L, the across cells' ink bands are ≤ 0.32.
  - The gap between dividend digits is ≤ 1 digit width.
  - The probe stays on one page with 20 facts.

## Defects (info roles; not part of the verdict, still to fix)

**D-D · Mix stand-alone Guided: no Standard item at all, and at S two problems share one box.**
- **No Standard item:**
  - `mix-L-guided-p1.png` (seed 376755) deals 12)24 M, 12/4 M, 121/11, 7)84, 2)2 and 22/2: zero Standard.
  - `mix-S-guided-p1.png` has 9 items with zero Standard.
  - So the "one Model per form" (R1 D7) is 2 Models.
  - The test's "D7 Mix guided: 3 model cells" passes on a different seed and count, so it does not cover this.
- **Two problems in one box:**
  - On `mix-S-guided-p1.png` the left cell from y 468 to 675 holds 121/11 (with its hint) **and** 2)2.
  - A row scan finds no rule at y 572 on the left, but one on the right.
  - This breaks CL "one problem per boxed cell".
- **Fix:**
  - In `sheet/roles/guided.js`, apply the divMix `lead` reorder (one item per form) **before** any width or shape filter
    in `ordered` / `plan`, so a Standard item always survives. At L, give the across Model a 2-track span or use 2 columns
    for a Mix Guided page.
  - Find the grid path that packs a short cell under a taller hinted cell in the same column (mixed-height row packing in
    `gridPart`), and give every Guided item its own bordered cell.
- **Check:** a Mix Guided page at S and L for 3 seeds has ≥ 1 item of each form, 3 Models, and 4 rules around every cell.

## R1 defect status

| R1 | Status | Evidence |
|---|---|---|
| D1 slot width leak | **Fixed** | `fraction-L-independent-p1.png` and `mix-L-independent-p1.png`: every line is 64 px |
| D2 answers at 1/3 size | **Fixed** | `fraction-L-independent-key-p1.png`: key 30 px vs operand 32 px; Reason It / Error analysis claims at digit size |
| D3 fraction "=" off-axis, 0.75 pt bar | **Fixed** | "=" centred on the bar on paper and screen; bar 2 px |
| D4 Standard oversized cells, S = L | **Fixed** on Independent (S 30 / L 16) | New fallout on Test: D-B |
| D5 fact rows drop the form | **Fixed** (every form drawn) | Mix fact rows now fail H13 and legibility: D-C |
| D6 two-page / sparse probes | **Fixed** | Long, Fraction and Mix probes are one page at S and L; `long-S-fact-probe-p1.png` fills the grid |
| D7 Mix lesson models one form | **Fixed** in the Lesson (anchor shows across + bracket beside the fraction) | Stand-alone Guided does not: D-D (info) |
| D8 half-empty lesson pages | **Fixed** | `long-L-lesson-p2.png` 12 Independent; p3 15 |
| D9 screen across restatement | **Fixed** | "Divide." on every card, worksheet and quiz |
| D10 bracket 48 px on worksheet | **Fixed** | 29 px digits; the quotient box is 12 px under the cell top on the worksheet and 17–18 px on the cards (`long-L-worksheet-1280.png`, `mix-L-card-820.png`). Not touching. Accepted. |
| D11 labels restart after z | **Fixed** | aa. bb. on `long-S-independent-p1.png` and `mix-S-independent-p1.png` |
| D12 steps / hint | **Fixed** | Stand-alone Guided steps are number-free; the times-fact hint shows on the Long and Fraction Models and first try. The lesson strip quoting the anchor example is system-wide (`mult_facts` does the same), so it is not a div_facts defect. |
| D13 boxes on Independent; narrow at S | **Fixed** | Open quotient on Independent and Test. S Guided boxes 23 px (6.1 mm) ≥ Hw. At M/L the boxes are 0.8 Hw (about 8 mm for a 10 mm writing height). R1 asked only for S, and a digit is narrower than it is tall, so this is accepted. |
| D14 Mix L 2 columns | **Not closed** | The page now fills (14, one page), but the 2-column cells keep 36–38 % side bands and uneven rows: D-A |

## Regression check (shared code)

Rendered from HEAD and from the parent `128e234`, then pixel-diffed:
- roles lesson, independent and guided at S and L for `multiplication:mult_facts`, `addition:add_facts`,
  `division:divide` and `division:missing_mult_div`;
- roles lesson, independent and guided at L for `division:long_div_2digit`, `division:div_zero_in_quotient` and
  `division:div_remainders`.

| Skill | Result |
|---|---|
| `multiplication:mult_facts`, `addition:add_facts` | **Pixel-identical** on lesson, independent and guided at S and L. The `lesson.js` "a stack is ≥ 2 rows" and Guided-width changes did not alter them. |
| `division:missing_mult_div` | Identical except the labels past z, which now read aa. bb. (intended, D11). The equation key's 1em/700 answer change produced no visible change. |
| `division:long_div_2digit`, `division:div_zero_in_quotient` | The only change is the arc dropping half a stroke. It meets the vinculum as before, with no gap and no step. Guided scaffolds are unchanged, so the level-2 change for the division template is invisible here. **No regression.** |
| `division:div_remainders` | **R-1 regression.** See below. |
| `division:divide` | **R-2 regression.** See below. |

**R-1 · `division:div_remainders` lesson p2 at L now overflows by 4.5 mm (was clean).**
- **Evidence:** `ws-grade-render` meta `roles.lesson.check.problems` = "page 2: the body overflows by 4.5 mm" at HEAD, and
  `[]` at `128e234` (seed 404654). Fits line: "2 warm-up, 2 guided and 4 independent", where before it was "3 warm-up … 2
  independent".
- **Cause:** the warm-up now pulls div_facts as one-line equation cells. They pack 2 per row, so the warm-up band is
  shorter. That room goes to a second Independent row, sized from the measured 48.5 mm. But item f (20 ÷ 6, three rows of
  circles) is taller, and the grid runs into the footer (`cmp`: grid bottom y 1050, footer y 1065).
- **Fix:** in `sheet/roles/lesson.js`, where `hI` sizes the Independent rows, take the **tallest** measured height over
  `indepPool.slice(0, rows * ic)`, not one sample, and re-check the page budget after choosing the rows (drop a row if
  `used > budget`).
- **Check:** `ws-grade-render --skills division:div_remainders --roles lesson --size L` reports no overflow, and
  `ws-print-lint --roles lesson` is unchanged.

**R-2 · `division:divide` lesson p2 (S and L): the warm-up loses an item, the page gets emptier, and two across styles share one page.**
- **What changed:**
  - The warm-up went from 3 to 2 items (Score /9 → /8).
  - The grid now ends at y 625 at L (was 710), leaving 44 % of the page blank. At S it ends at y 585, about 48 % blank.
- **Mixed looks on one page:**
  - The warm-up across facts are the div_facts equation cell, widely spaced ("30  ÷  5  =").
  - The Guided and Independent facts on the same page are the fact template, tightly spaced ("12 ÷ 4 =").
  - At S the warm-up digits are also smaller than the rest of the page.
  - The same split shows inside div_facts: Standard fact rows are tight (`standard-L-fact-rows-p1.png`) and Standard
    Independent is spaced (`standard-L-independent-p1.png`).
- **Rule:** RUBRIC C1 / AX-4 (the same task looks the same) and C3.
- **Fix:**
  - Give the equation cell's across fact the fact template's glyph spacing (the same `.o` padding as `cells/fact.js`
    horiz), so one across look is used everywhere.
  - Let the lesson warm-up keep 3 across items where 3 fit by measured width.
- **Check:**
  - The `divide` lesson p2 warm-up holds 3 items.
  - On `standard-L-independent` vs `standard-L-fact-rows`, the across glyph advance matches within 10 %.

The empty "Steps:" box on the `divide` lesson p2 is pre-existing and identical at the parent. It is not part of this lane,
but it should be filed.

## What would raise each criterion to 10

- **C1:**
  - bracket digits tracked to the drawn digit (D-C);
  - one across look across the whole kit (R-2).
- **C2:** every Mix page, Guided included, shows and models all three forms (D-D).
- **C3:**
  - Mix laid out as form rows: 3-up brackets and fractions, 2-up across (D-A, D-C);
  - Test filled to its ceiling (D-B);
  - no page strip > 10 %.
- **C4:**
  - the digit grid matches the digit size (D-C);
  - one across spacing (R-2);
  - no seam at the bracket's track joins.

## Numbered defect list

1. **D-A** Mix at L stays 2 columns: bracket and fraction cells two-thirds empty, uneven rows (Independent, Test,
   Lesson L), C3 7.
2. **D-B** Standard Test under-filled: S 18 of 20 with 41 % blank (C3 6), L 10 of 12 with 32 % blank (C3 7).
3. **D-C** Mix fact rows and probe: across facts in rows sized for two-line forms (H13, C3 6), digits drawn at 15 px,
   bracket digits spread about 2.8 digit widths (C1 7, C4 7).
4. **D-D** *(info)* Mix stand-alone Guided deals no Standard item (2 Models, not 3); at S two problems share one box.
5. **R-1** Regression: `division:div_remainders` lesson p2 at L overflows by 4.5 mm.
6. **R-2** Regression: `division:divide` lesson warm-up drops from 3 to 2 items (page 44–48 % blank), and the across look
   differs between the equation cell and the fact template on one page (also div_facts' own Independent vs fact rows).
