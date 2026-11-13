# lf-placevalue critic pvdebt: narrow re-grade of the tightRows fix (independent critic, Opus medium)

- **AFTER:** `claude/lf-placevalue-w2` at cbbbdade (fix commits 668f6a8c, 1f18505d).
- **BEFORE:** wt-before at 16014137.
- **Renders:** `ws-grade-render --no-screen`, run one at a time through `mq-browser-run.sh`.
- **Root:** `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-pvdebt/`, shortened to `R/` below.
- **Machine check:** `ws-empty-band --skill placevalue:combine --roles independent,more-practice,test,review --hosts none --no-baseline` on AFTER returns **OK**, with every rule PASS: 12 renders, 193 cells.

## Grade table (C1 usability · C2 teaching · C3 spacing · C4 fidelity; every page graded with its key)

| Skill | Role | S | M | L |
|---|---|---|---|---|
| combine | independent | 9-8-9-9 | 8-8-8-9 | 9-8-9-9 |
| combine | more-practice | 9-8-9-9 | 8-8-8-9 | 9-8-9-9 |
| combine | test | 9-8-8-9 (F1) | 9-8-9-9 | 9-8-9-9 |
| combine | review | 9-8-8-9 (F1) | 9-8-8-9 (F1) | 9-8-9-9 |
| combine | lesson (3 pages + 3 keys) | - | 9-9-8-9 | 9-9-9-9 |
| unit_form | independent | 9-8-9-9 | 9-8-9-9 | 9-8-9-9 |
| unit_form | more-practice | 9-8-9-9 | 9-8-9-9 | 9-8-9-9 |
| unit_form | test | 9-8-9-9 | 9-8-9-9 | 9-8-9-9 |
| unit_form | review | 9-8-9-9 | 9-8-9-9 | 9-8-9-9 |
| unit_form {rename:more} | independent / more-practice / test / review | 9-8-8-9 each | - | - |
| expand | independent / more-practice / test / review | 9-8-8-9 each (27 % side band, known) | - | 9-8-9-9 each |

- No cap applies on any page.
- No page is under 50 % used, so H5 does not apply.
- No cell has an in-cell empty band of 30 % or more (H13). The machine check agrees.
- Every key is a facsimile of its pupil page, with the same item order, geometry and seed.
- Spot checks of key answers:
  - combine test S: 790, 353, 543, 308 … 153;
  - combine review S: 389 … 770, and 132 = 100 + 30 + 2, 302 = 300 + 0 + 2;
  - unit_form S: 539 = 5 | 3 | 9;
  - rename S: 539 -> 53 tens, 7 h 12 t = 820;
  - combine lesson L p3: 199 … 207.

  All are correct.

## Before vs after

**combine**

- BEFORE at S had 4 × 7 cells, each stretched to about 32 mm. About 12 mm under the `= ___` line was empty: the 37 % in-cell band that was the debt, which would cap C3 at 6 under H13.
- AFTER at S:
  - The independent and more-practice pages use 3 × 9 tight cells. These fill the body, so the pages are fuller and better.
  - Test (4 × 5, 20 items) and Review (4 × 3 plus 4 expand rows) also keep tight rows. The stretch they lost is now white under the grid:
    - Test S: about 45 % of the body, about 100 mm (was about 30 % under the grid plus the in-cell bands);
    - Review S: about 39 %;
    - Review M: about 34 %.
- The grid is clean and every cell reads well. The white sits at the foot as the end of a fixed-count assessment: Test and Review totals come from P-23's {8, 10, 12, 16, 20}. This is better than BEFORE's half-empty cells. See F1 for why it is only an 8.

**unit_form**

- Standard rows at S went from about 19 mm (with a 6 mm box) to about 15 mm. The box now has about 4 mm above and below, which is still comfortable to write in.
- Test S now ends at about 83 % of the body. The white under it (about 45 mm) is under two rows' height and reads as a natural end.
- Rename rows at S:
  - The longer write line is about 43 mm and is the same length on every row and every item type, so it gives no length cue.
  - It is far longer than the 2–3 digits the answers need, so there is no giveaway and no squeeze.

**expand**

- Rows are tight at S. Test S ends at about 80 %, and Review S (10 expand rows plus a 2 × 3 compare band) at about 88 %.
- The width is unchanged, so the known 27 % side band remains. That is not this round.

**combine lesson M / L**

- The Scripted Model (p1), the band page (p2) and the practice page (p3) render with their keys.
- p3 at M ends at about 87 % and at L at about 89 %.
- The p2 bands keep their own heights, and the Independent Practice band ends at about 93 %.
- There is no regression against what was passed before.

## Findings

- **F1 (combine; Test S, Review S, Review M; C3 = 8, not blocking).**
  - With tightRows, a fixed-count assessment page at a column count wider than the practice page leaves a large foot band:
    - Test S: 4 columns, 20 items, about 45 % of the body white;
    - Review S: about 39 %;
    - Review M: about 34 %.
  - The independent page at the same size uses 3 columns.
  - At 3 columns the same 20 items would take 7 rows and fill the page, with the same column count the pupil practised on (P-23, "assessment mirrors practice").
  - It does not breach H5, because over 50 % of the page is used. It is the last page, so EB-PAGE accepts it, and it is far better than BEFORE's H13 bands.
  - It is the one place where the spare height reads more as "ran out" than "designed".
  - Suggested check: on a 1-page Test or Review, white under the grid should be no more than one row's height, OR the column count should not exceed the independent page's at that size.
- **O1 (observation, pre-existing, not this round):**
  - combine spaces its operators differently on different pages. The M Test and the lesson use spaced "700 + 90", while the M Review and independent cells use a tight "300 +  80 +  9" with a double space before the digits.
  - At M Test, "=" sits right-aligned under the expression, while at S it is left-aligned.
  - Item text is out of scope here. It is noted for the family's next pass.
- No finding against unit_form, unit_form {rename:more} or expand.

## Verdicts

- combine: **VERDICT: PASS** (every page ≥ 8; F1 is non-blocking and is recorded with its check)
- unit_form: **VERDICT: PASS**
- expand: **VERDICT: PASS**

## PNGs graded

- AFTER:
  - `R/after/S/placevalue__{combine,unit_form,expand}/{independent,more-practice,test,review}{,-key}-p1.png`
  - `R/after/M/placevalue__{combine,unit_form}/{independent,more-practice,test,review}{,-key}-p1.png`
  - `R/after/L/placevalue__{combine,unit_form,expand}/{independent,more-practice,test,review}{,-key}-p1.png`
  - `R/after/S-rename/placevalue__unit_form/{independent,more-practice,test,review}{,-key}-p1.png` (`--opts '{"rename":"more"}'`)
  - `R/after/lesson-{M,L}/placevalue__combine/lesson{,-key}-p{1,2,3}.png`
- BEFORE (comparison): `R/before/S/placevalue__{combine,unit_form,expand}/{independent,more-practice,test,review}{,-key}-p1.png`
