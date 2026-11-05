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
