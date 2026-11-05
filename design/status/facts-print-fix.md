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
   digits (2 mm of white each side, 16 pt kept, 63 a page). *(Corrected in round 3, critic D6: with division Auto is at
   most 9 in every notation - stacked ÷, bracket and fraction - and a picked 10 prints 9 on the ÷ part (owner ruling
   2026-11-05, PT-FRW-9); this line used to say "an explicit 10 still prints 10" and "the bracket and fraction keep their
   own Auto 10", which the owner's ruling replaced.)* Documented in PAGE_TYPES PT-FRW-9 / 10 / 11 and WORKSHEET_DESIGN_STANDARD 12.x.
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

## Round 3 (fresh fixer, Opus medium: Problems-mode white space and the count defects survived two rounds, §1.7) — 115302a69 + origin/master 66002ad46

Critic r3 (lowest 5): D1 Problems mode wastes pages, D2 columns / counts change between sets and pages (Auto printed 10),
D3 per-skill drift at L (35/32/31/32), D4 digit size changes page to page, D5 Auto 10 at S, D6 docs, D7 "20–20", D8 merge.
The checks were written FIRST (STEP 1) and confirmed failing on 115302a69 (a git archive served through MQ_ROOT):
129 findings (SETPAGE 29, FILL 79, AUTO9 8, DIVMAX9 docs 7).

1. **D8**: origin/master merged (the facts note and the Larger preview button kept side by side; index.html restamped).
2. **D1** (`simple-print.js` buildFacts, `sheet/roles/fact-rows.js` sources / counts / planSections, `print-sheet.js`
   `factSections`): Problems mode plans ALL groups together as one sequence of whole rows over the fewest pages. The ÷
   part is its own SECTION (its own instruction "Divide." and its own grid, ≤ 9 across). It follows the + − × rows on
   the same page when its rows fit, because PT-FRW-6 asks for a section, not a page. The rows are split so that every
   page's white is ≤ one row; the last page too, unless the print is one page. Each section takes ONE stretch for the
   whole print (PG-11): 1.3 first, then 1.4, then 1.7, and the higher caps only where the rows cannot fill the pages
   otherwise. Owner case Problems 50 Small: ONE page (5 rows of 8 + 2 rows of 9, 6 mm under the grid; was 2 pages with
   72 + 169 mm of white). Fill is measured in mm. PT-FRW-12 rewritten.
3. **D2 / D4** (`simple-print.js` reachOf, `fact-rows.js` factRowsLayout `factTracks` / `factAnsTracks`): the tracks and
   the 3-digit-answer clamp come from what the SKILLS can reach (one seeded 60-item probe: × 1–12 reaches 144), never
   from the facts a page dealt. Every page and every set takes one column count and one digit size per group:
   - Sets 2 at S: 8 / 9 on every page.
   - Columns 9 at L, Sets 3: 8 × 6 = 48 in every set.
   - M: 20 pt on every + − × page.
   The size buttons' probe reads the same reach, so the summary says what prints.
4. **D3**: each skill's count is dealt page by page from what is still left (the group's last page takes the rest):
   130 over 4 = 33/33/32/32 at S, M and L.
5. **D5** (owner rule): Auto is at most 9 for every fact mix. `fact-rows.js` AUTO, `tokens.js` FACT_AUTO_COLS,
   `layout.js` ROLE_COLUMNS and `simple-print.js` FACT_AUTO are all S 9 (9 and 10 columns share the 16 pt rung and the
   24 mm cell). Expectations that wanted 10 now want 9:
   - the FACTS gate (`ws-simple-print` FACT_COLS);
   - the ws-layout-unit R1 / PT-FRW-2 assertions (an explicit 10 is still kept, and that is asserted);
   - WORKSHEET_DESIGN_STANDARD TY-30 and the DN-15 Auto table, and PAGE_TYPES PT-FRW-2, now say 9 / 6 / 5.
6. **D6**: PT-FRW-9 rewritten (÷ at most 9; capacity S 9 x 7 = 63 ...). The stacked-÷ and AUTO-room bullets no longer
   speak of 10 columns, and PT-FRW-6 / PT-FRW-10 say "own section". Round-1 item 4 above is corrected: with division,
   Auto is at most 9 in every notation.
7. **D7**: the summary reads "20 a page" when every page holds the same.
8. Footers name the skills ON the page: a shared page with no × left does not name ×, and four names print in full.

### Checks added (STEP 1; `ws-simple-print --facts-print`, or `--setpage` for these alone)

- **SETPAGE**: every grid of every pupil page of every set has the summary's columns. Each group keeps one digit size over
  the print and across prints of the same size and columns. Per-skill totals equal splitCounts(request) in Problems mode
  and the chips in Pages mode. Set totals and page counts equal the summary.
- **FILL**: the white under the grid, in mm, is at most one row beyond a full page's own 3 mm, on every page except in a
  one-page print. The pages are no more than the fewest the rows need with all groups planned together.
- **AUTO9**: Auto never gives more than 9, for 8 fact mixes × S/M/L × both modes. A picked 10 on + − prints 10. The
  Columns list never offers 10 with ÷.
- **DIVMAX9 docs**: reads WORKSHEET_DESIGN_STANDARD.md AND PAGE_TYPES.md, sentence by sentence.
- Three UI cases drive the real dialog, press Print and measure the printed document: Problems 50 S; Problems 130 S
  Sets 2; Pages 1 L Columns 9 Sets 3 Mixed up.
- The r2 checks were moved to the new rules: ÷ may share a page but never a grid; balance is checked within the + − ×
  group; a page with all four is "Mixed facts"; r2's 60 % FILL is replaced by the mm FILL.
- Backtest row `facts-print-fix-r3`.

### Evidence (round 3)

Every pupil page as a PNG, in the scratchpad `facts-r4/` folder (`index.txt` there has each print's summary):
- Problems 50: `own-pr50-{sections,mixed}-{S,M,L}-p*.png`. S 1 page (38 + 12), M 2 pages (30 | 8 + 12), L 3 pages
  (20 | 18 | 12).
- Pages 1: `own-pa1-{sections,mixed}-{S,M,L}-p*.png`.
- Problems 130 S, Sets 2: `own-pr130-sections-S-sets2-p1..6.png` (48 | 48 | 2 + 32 in each set).
- Pages 1 L, Columns 9, Sets 2: `own-pa1-mixed-L-c9-sets2-p1..4.png`.

### Speed notes (round 3)

- The checks written first found every defect class on the old tree in one 26 s run. The planner then took four
  iterations against the mm FILL check. Each run printed the plan (rows per page, stretches) beside the white, which
  showed the infeasible cases at once (11 rows over 3 pages of 5; 27 rows over 6 pages at L).
- Root cause of the two lost rounds: the checks compared the print with the dialog's own numbers for set 1 and allowed a
  60 % page. The owner's rule ("no white space") was never written in mm. See LESSONS_LEARNED L19.
- Known look, not fixed: when the + − × count is not a whole number of rows, the shared page can open with a short row
  (Problems 130 S page 3: 2 facts, then the ÷ section).
- Pre-existing, not this lane: ws-print-lint L sub_facts#review H13 ×4 (identical on c2c0fe24f).
