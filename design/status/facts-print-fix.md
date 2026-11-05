# facts-print-fix (fixer, Opus medium: print engine) — 2026-11-05

Owner report (live 18fbc70c2, simple print, Addition Facts (within 20), Subtraction Facts (within 20), Multiplication Facts
(1-12), Division Facts (1-12); Highest number 20; Pages 1; Size Small; Columns Auto).

## Fixes

1. **Mixed up on a facts-only set** (`js/modules/simple-print.js` arrangementOf / buildFacts, `js/modules/print-sheet.js`
   `input.interleave`, `js/modules/sheet/roles/fact-rows.js` `mixOps`): a fast-facts-only set in Pages mode is always fact
   rows; Mixed up deals the same pages and counts as In sections and interleaves the + − × page through
   `sheet/interleave.js` (at most 2 of one sign in a row). Division keeps its own page (PT-FRW-6), so counts match In
   sections exactly. Summary: "Mixed up, 10 columns × 7 rows = 70 a page · …".
2. **Fallback = In sections** (`buildSimple`): any Mixed up the engine cannot draw is rebuilt as the In sections print
   (never the sparse 4-each plan); the summary line starts "In sections, …" on every line kind.
3. **Row rules** (`css/sheet-kit.css`, additive): fact-rows hairlines are drawn borders (cell left + top, pulled one
   hairline under the neighbour), not the ink background through a 0.75 pt gap between white fills. In the PDF the gap
   geometry was uniform (0.75 pt everywhere), so the missing rows / one thick column were rasteriser conflation of the gap;
   drawn rules are ink on top and render at one weight.
4. **Alignment / crowding**: measured in Chrome, the sign-to-number gap on 18fbc70c2 was already 0.84–1.08 em (no touching
   reproduced in headless Chrome); the measurable defect was the ÷ page at 10 columns: 3-digit dividends with 1.55 mm of
   ink clearance (rule 1.3 mm). Chosen: **Auto takes 9 columns at S** for a stacked ÷ page whose dividends can reach 3
   digits (2 mm of white each side, 16 pt kept, 63 a page); an explicit 10 still prints 10 (PT-FRW-9). The bracket and
   fraction keep their own Auto 10. Documented in PAGE_TYPES PT-FRW-9 / 10 / 11 and WORKSHEET_DESIGN_STANDARD 12.x.
5. **Problem count** (found on the way): a fact page dealt for 10 columns and laid at the 8-column clamp said "70
   problems" for 56 printed; the total now counts the printed cells.
6. **Footer ids** (coordinator add-on): `labelOf` resolves a skill queued under another category / a retired id to its
   label, else spells the id as words; never a raw id.

## Automatic checks added (FAIL on 18fbc70c2, PASS on the fix)

`node tests/scripts/ws-simple-print.cjs --facts-print` (also inside the full gate; on ws-precritic's path for the fact
skills, gate `simple-print-facts`; backtest row `facts-print-fix` in tests/fixtures/precritic/backtests.json):
MIXFACTS, FALLBACK, ROWRULES, SIGNGAP (tests/lib/ws-fact-geom.cjs), FOOTER (every footer of pupil + key pages, both
arrangements, sample of mixed sets: no snake_case id). On 18fbc70c2: MIXFACTS 12, ROWRULES 6, SIGNGAP 1 (S ÷ page 1.55 mm),
FALLBACK 3, FOOTER 2 findings.

## Speed-ups

- The owner's "touching" could not be reproduced in headless Chrome; measuring ink with canvas `measureText` in the page
  (ws-fact-geom) settled it in one run. A PDF-raster check (pdftoppm at 72–100 dpi) would catch rasteriser artefacts that
  DOM checks cannot: proposed for the checks owner.
- Lane runs one browser gate at a time; ws-print-lint for 4 skills × 7 roles × 3 sizes took about 6 minutes.

## Round 2 (fixer, Opus medium: rebuild after the print critic FAIL, lowest 3, head c2c0fe24f)

Critic: D1 × cut to 9 at S, D2 Problems mode sparse / fallback, D3 docs said ÷ reaches 10, D4 footers 1/1 and the ÷ page
not named, D5 the + − × page titled "Facts".

1. **D1** (`sheet/roles/fact-rows.js` keepShares, factRowsLayout, plan; `print-sheet.js` printedSkills; `simple-print.js`
   buildFacts): every page of several skills keeps each skill's share when its layout holds fewer than were dealt (S: 19 +
   19 + 18, was 24 + 23 + 9); the role reports the skill of every PRINTED fact (`meta.printedSkills` -> `res.printedSkills`)
   and the dialog chips / `counts` read it. PT-FRW-5's clamp now reads what the × facts can REACH (largest factor × largest
   smaller factor > 99), so every page and every set of × 1-12 takes the same 8 columns (set 2 laid 70 in 10 columns
   beside set 1's 56); a ×3 table keeps 10. COUNT-FITS keeps printed = cols × rows = Score with a second clamp layout.
2. **D2** (`simple-print.js` arrangementOf, buildFacts, summaryLine): a facts-only set prints fact rows in Problems mode too
   (both arrangements): each group's exact count over the fewest pages of its own full grid; a last page under 60 % is
   rebalanced (whole rows shared evenly, the extra rows to later pages); each skill's count apportioned over the pages
   (balanced, exact totals); ÷ stacked on its own page, ≤ 9 across. Summary: "8 columns · division pages 9 columns ·
   12–38 a page · 2 pages · 50 problems". PAGE_TYPES PT-FRW-12.
3. **D3**: WORKSHEET_DESIGN_STANDARD VA-2a, VA-60a, VA-65 and 12.2, PAGE_TYPES PT-FRW-5 / PT-FRW-9 heading say at most 9
   with division.
4. **D4**: `renumberFooters` numbers the joined pages k/n (pupil and key, per set); each page's footer names its own
   group's skills (the ÷ page "Division Facts (1-12)") when the caller gave no footer.
5. **D5**: `factTitle` names the operations of a mixed page: "Addition, subtraction and multiplication facts"; all four
   "Mixed facts".

### Automatic checks added (FAIL on c2c0fe24f, PASS on the fix; backtest row `facts-print-fix-r2`)

`ws-simple-print --facts-print` factsCounts: COUNTS (printed signs per skill == build counts; a page's skills within 1),
PROBLEMS (fact rows, exact count and split, ÷ stacked alone ≤ 9, FILL ≥ 60 % or even pages, NOORPHAN, SIZE S ≠ L),
FOOTER (k/n, own skills), TITLE, DIVMAX9 docs grep. On c2c0fe24f: COUNTS 15, PROBLEMS 40+, FOOTER 150+, TITLE 4,
DIVMAX9 docs 4 lines.

### Speed notes (round 2)

- All five findings passed the green gate because it compared Mixed up with In sections, never the print with the
  request (signs printed per skill vs the chips, pages vs the asked count) or with the doc. New rule for print checks:
  every check compares the PRINTED page with the REQUEST (counts, k/n, names), not two builds with each other.
- A role that silently drops dealt items must report what it kept (printedSkills): a caller counting the deal lies.
