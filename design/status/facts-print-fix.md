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

## Round 4 (fresh fixer, Opus medium: the owner's ÷ Mix page and Problems-mode white space survived r3, §1.7) — 7fab88a7e + origin/master f08bd11b1

Critic r4 (lowest 3): (a) mixed ÷ forms zig-zag, (b) answer slot in three places, (c) "=" crowds the fraction, (d) bracket
on the border, (h) In sections did not split the ÷ forms, (i) Size ignored with Mix; D-R4-1/2 Problems-mode white and 1.7
stretch, D-R4-3 the 1 em bracket track, D-R4-4 two digit sizes on a page, D-R4-5 row heights differ page to page, D-R4-6
mult_facts alone at L, D-R4-7 PT-FRW-12 vs PG-11, D-R4-8 Pages 1 printed 2 pages. Owner decisions 2026-11-05 (direct).

**STEP 1, checks first** (`ws-simple-print --r4`, inside `--facts-print`; the printed document measured, the PDF rasterised by
pdfium): MIXBASE, SLOTPOS, FRACEQ, CLEAR (tests/lib/ws-fact-geom.cjs), BRKTRACK, PDFIUM-RULES (tests/lib/ws-pdfium-rules.py,
skipped and said when pypdfium2 is missing), FOOTWRAP, DIVSECTIONS, SIZEMIX (built and through the real dialog), FULLPAGE
(S/M/L × Auto/5/9 × Problems 30/50/63/130 × both arrangements, the owner's Pages 1, mult_facts alone at L), ONEDIGIT, and
ROWSAME (added when the fix showed the frame cause of D-R4-5). The owner's page (seed 926447, ÷ Mix, Columns 9, Pages 1, S)
is a required case in both arrangements. On 7fab88a7e (git archive via MQ_ROOT): FAIL - BRKTRACK 191, FOOTWRAP 179, FRACEQ
185, FULLPAGE 121, MIXBASE 34, ROWSAME 28, CLEAR 25, SLOTPOS 24, ONEDIGIT 18, DIVSECTIONS 7, PDFIUM-RULES 4 (the frame's
double edge at 93 dpi). On 66002ad46: PDFIUM-RULES 8 (3-7 of 9-11 verticals, 3-4 of 8 horizontals), plus the rest.
SIZEMIX does not fail on 7fab88a7e once the dialog's Columns is set to Auto: the critic's (i) was the dialog keeping the
previous print's Columns 9 (M and L then correctly print 9 at 16 pt); the check now sets every control.

### Fixes

1. **(a)/(b) one frame for every form** (`sheet/roles/fact-rows.js` mixWrap / mixFrameMm / mixKeepOutMm / rowFormHeightMm,
   `cells/equation.js` the Mix fraction, `cells/long-division.js` mixRow, `css/sheet-kit.css` additive `.ws-mixform` rules):
   in a grid mixing forms every item is drawn in the stacked fact's three lines (top digit line, bottom digit line, answer
   line), the frame below the tab's keep-out and centred down the cell, each drawing centred across. Baselines within
   0.37 mm (was 6.2), rows centred within 0 mm (was 2.0), answer lines within 0.53 mm (was 1.6), the bracket's quotient on
   its vinculum level with the dividends (0.39 mm, was 6.1).
2. **(c)** `FRAC_ROW_GAP_EM` 0.15 -> 0.3; the bar spans the wider number ("0" over "12" had a 1-digit bar).
3. **(d)** `FORM_CLEAR_MM` = 4 (2 mm a side) for brackets and fractions in `rowGeometry`; `boxOk` at inner - 2.
4. **(h) DIVSECTIONS** (`simple-print.js` buildFacts): In sections with div_facts Mix (a set of 2+ skills) splits the ÷ group
   into three sections, ÷ sign / bracket / fraction, each with its own "Divide.", one third of the ÷ count each; Mixed up
   (and div_facts alone) keeps them mixed cell by cell.
5. **D-R4-1/2 planner** (`planFactRows`): rows packed over the fewest pages; one stretch per section for the whole print,
   1.00-1.30 (1.4 / 1.7 removed; `print-sheet.js` clamps 1.3), chosen so every page but the last has <= 6 mm of white; when
   + − × first cannot fill the pages, the ÷ section(s) go first. M Columns 9 Problems 50: one page (was 2, 73 + 105 mm).
   The ÷ instruction's modelled 2 mm gap the page never drew is gone (SECTION_GAP_MM 0).
6. **D-R4-3 BRKTRACK**: every bracket carries `data-ws-rowgeo` (drawn on its section's row geometry); a grid mixing forms
   keeps bracket tracks <= 0.72 em (a deal that fitted 0.9 em drew "1 2)0").
7. **D-R4-4 ONEDIGIT**: sections sharing a page take the smallest digit size (`maxPt` -> `factPt` cap in `factRowsLayout` /
   `formRows`); the plan is redone at that size.
8. **D-R4-5 ROWSAME**: the grid's heavy frame is added to its height (`cellH + 2 FRAME_MM / rows`), so a 2-row grid's rows
   equal a 6-row grid's (37.27 vs 36.38 mm before).
9. **D-R4-6**: `verticalPt` / `verticalFitPt` read the operator track the fact template draws (the tight 0.72 em over a
   shorter second number), so mult_facts alone at L prints 28 pt (25 on page 1 full, 5 on page 2) and M + − × 24 pt.
10. **D-R4-8**: Pages n with fewer pages than parts: the + − × rows and the ÷ section(s) share the page as sections, rows by
    the shares, the page filled (Pages 1 = 1 page); the note says the division shares the page.
11. **FOOTWRAP** (`nowrapFooterNames`): each skill name in a no-wrap span; **PDFIUM-RULES**: `background-clip: padding-box` on
    fact cells (the frame and the first column's rule were two abutting anti-aliased edges).
12. **Label** (owner decision 3): `data.js` "Division Facts (÷1 to ÷12)" (label only; SKILLS order untouched). The pupil name
    reads the same. ws-content-audit --skill division:div_facts OK (the one note is the pre-existing variety note);
    ws-code-snapshot OK.
13. Docs: PAGE_TYPES PT-FRW-6, PT-FRW-9 (fraction, bracket), PT-FRW-12 (every page but the last full, 1.3 at most, one digit
    size a page, Pages n sharing, div_facts Mix), WORKSHEET_DESIGN_STANDARD PG-11 agree.
14. r1/r3 checks moved to the owner's rules: MIXFACTS reads sign runs per grid (the ÷ section on the page is its own grid);
    r3 FILL exempts each set's last page (FULLPAGE holds the others to 8 mm).

### Gates (one at a time, foreground)

ws-simple-print --facts-print OK; full ws-simple-print OK; ws-layout-unit OK (1765); ws-print-lint --source kit (4 fact
skills x 7 roles) S OK, M OK, L FAIL only on the pre-existing sub_facts#review H13 x4 (same set as r3 / the critic);
ws-content-audit division:div_facts OK; ws-code-snapshot OK (732 codes); ws-boot-smoke OK; ws-pdf-preview OK;
ws-screen-answer OK; ws-student-explorer OK; ws-chromebook-perf --only load OK; ws-stamp-assets + --check OK.

### Evidence (design/status/facts-print-fix/r4/)

- The owner's page: `owner-div-mix-S-c9-before-p2.png` (7fab88a7e), `owner-div-mix-S-c9-mixed-after-p1.png` (Mixed up: one
  page, the ÷ Mix grid aligned), `owner-div-mix-S-c9-sections-after-p1.png` (In sections: three ÷ sections).
- Problems 50: `pr50-S-p1.png`, `pr50-M-p1..2.png`, `pr50-L-p1..3.png`; Columns 9: `pr50-M-c9-p1.png`, `pr50-L-c9-p1..2.png`.
- ÷ In sections at M: `div-sections-M-p1.png`; mult_facts alone at L: `mult-alone-pr30-L-p1..2.png`.

### Open for the critic

- The bracket's quotient slot is on the TOP line (its vinculum), not on the stacked / fraction answer line: the quotient is
  written over the vinculum (PT-FRW-6), so "the same place" is held as "the same frame line in every bracket, level with the
  dividends beside it" (SLOTPOS checks both). The bracket's frame keeps the third line empty under it.
- When + − × first cannot fill every page, the ÷ section(s) print first (L Problems 50 / M 130 cases); a pure order change.
- Each ÷ section's instruction is the library's "Divide." (three sections, three lines).

### Speed notes (round 4)

- Checks first again paid: one 31 s `--r4` run measured every defect class on 7fab88a7e, and each fix was measured at once.
- Matching the owner's screenshot to its seed and dumping every page's grids / columns / pt / white found every root cause
  in one pass. The two traps found on the way are now rules: a dialog check must set EVERY control (the dialog keeps the
  last print's choices), and a page model must model only space the page really draws (the 2 mm section gap did not exist).

## Round 5 (fixer, Opus medium: three planner defects found by the r5 critic, lowest 3) — 128455ad3

Critic r5: the owner's page passed (9 / 8 / 8 / 8) and Mixed up, keys and sizes held; FAIL on the planner: D-R5-1 ÷ Mix In
sections, Pages 1, Big printed 2 / 2 / 1 / 15; D-R5-2 the "÷ first" reorder left a 1-fact row and 4 empty cells mid-print;
D-R5-3 a 1-fact last page titled "Divide by 6"; D-R5-4 short rows mid-print; D-R5-5 the bracket section's room and centring;
D-R5-6 Columns picked ignored the Size. origin/master had not moved (f08bd11b1 already merged).

**Checks first** (`ws-simple-print --r5`, inside `--facts-print`; the built path over a SWEEP - Problems 20-150 by 5 × S/M/L ×
Auto/5/9 × both arrangements, ÷ Mix In sections by 10, Pages 1 and 2 default and ÷ Mix: 684 prints, 49 s): SHARES, BLANKMID,
DIVORDER, TITLEONE, ORPHAN, FULLPLAN, COLSIZE; `--r4` gained QROOM and bracket centring (CLEAR now covers the bracket
section). On 128455ad3 (git archive via MQ_ROOT): BLANKMID 712, DIVORDER 172, ORPHAN 77, SHARES 45, FULLPLAN 43, TITLEONE
15, COLSIZE 1 (Columns 5 printed 28 pt at S, M and L); `--r4` QROOM 11.

### Fixes (`js/modules/simple-print.js` buildFacts / planFactRows, `sheet/roles/fact-rows.js`, `print-sheet.js`)
1. **D-R5-2 / D-R5-4**: the "÷ first" reorder is gone; every section but the last prints whole rows (rounded to its columns,
   the difference to the last section, added or taken one fact at a time from the skill with the fewest / most so a page stays
   balanced); when the pages still cannot all be filled, whole rows move between + − × and the last section (never more than
   a row a skill), then one page more is planned. Each skill stays within one row of the even split; the total is exact.
2. **D-R5-1**: Pages mode with + − × and ÷ is planned as Problems mode, for the most problems that fill exactly the n pages,
   each skill within a row of its share; with ÷ Mix In sections the forms keep a section each only when the shares hold,
   else ONE mixed section and the note "the ÷ forms share one section, mixed, so every skill keeps its share of the page".
   Big, Pages 1: 5 / 5 / 5 / 5 (was 2 / 2 / 1 / 15). Pages 2 no longer gives ÷ a whole page (was 19 / 19 / 18 / 63). Sets 2+
   of such a print repeat set 1's counts through Problems mode.
3. **D-R5-3**: `factTitle(items, skills)` names one number only when the skill's one-value `constant` option fixes it
   (ws-layout-unit HD-13 now gives its ×3 skill that option, plus a TITLEONE assertion); Problems 30 at M prints 8 / 8 / 8 / 6
   on ONE page; a last page under a row says so in the dialog.
4. **D-R5-5**: a bracket section's row is tall enough for a written line (1.15 em) between the tab and the vinculum
   (`rowFormHeightMm`); centring within 0.5 mm checked.
5. **D-R5-6** (owner to confirm): in the simple print (sections carry `sizeCap`) a picked column count keeps its columns and
   the Size caps the digits - S 18, M 24, L 28 pt - as far as the column fits (Columns 5: 18 / 24 / 28 pt; Columns 9 at L
   stays 16 pt, its rung). The teacher-print path is unchanged (applied there it moved ws-pdf-preview's key page by 0.08 %).
   **Owner question:** at Columns 9, Big still prints 16 pt digits (9 columns cannot hold 28 pt); should Big with Columns 9
   drop to fewer columns instead?
6. Checks moved to the owner's rules: SETPAGE / PROBLEMS compare the printed counts with the chips exactly and with the
   request within one row (total exact); r3 FEWEST counts the ÷ section's instruction line; DIVSECTIONS accepts the one mixed
   section when the note says so.

### Gates (one at a time, foreground)
ws-simple-print --facts-print OK (incl. --r4 and the --r5 sweep: no findings); full ws-simple-print OK; ws-layout-unit OK
(1766); ws-print-lint --source kit 4 fact skills × 7 roles: S OK, M OK, L only the pre-existing sub_facts#review H13 ×4;
ws-content-audit division:div_facts OK; ws-code-snapshot OK (732); ws-boot-smoke OK; ws-pdf-preview OK; ws-screen-answer OK;
ws-student-explorer OK; ws-chromebook-perf --only load OK; ws-stamp-assets + --check OK.

### Evidence (design/status/facts-print-fix/r5/)
- D-R5-1: `d1-mix-sections-pages1-L-p1.png`, `d1-mix-sections-pages1-M-p1.png`, `d1-owner-mix-sections-pages1-S-c9-p1.png`.
- D-R5-2: `d2-pr85-L-p1..4.png`, `d2-pr125-L-p1..6.png`, `d2-pr45-S-c5-p1..2.png`.
- D-R5-3: `d3-pr30-M-p1.png`. D-R5-4: `d4-pr130-S-p1..3.png`, `d4-pr50-M-p1..2.png`.
- D-R5-5: `d5-mix-sections-pr63-L-p*.png`. D-R5-6: `d6-pages1-c5-{S,M,L}-p1.png`.

### Speed notes (round 5)
- The sweep, not more named cases: every r5 defect class showed in one 49 s run on 128455ad3, and each fix was re-swept.
- r4 traded one owner rule ("teacher's order") for another ("full pages") without saying so; the rule now is: move whole rows,
  then add a page, then say so - never break a rule silently (LESSONS L21).

## Round 6 (fixer, Opus medium: the r6 critic found every defect OUTSIDE the r5 sweep, lowest 3) — 1d4c97a5c

Critic r6: all r5 fixes held (owner's page 9 / 8 / 8 / 8; 5,649 key cells right); FAIL on D-R6-1 ÷ Mix In sections Problems
10 printed 26, D-R6-2 Medium / Big digits dropped under a picked Columns with no word, D-R6-3 Pages-mode last pages 20-50 mm
short beside "every page is full", D-R6-4 Problems pages 16.8 mm short, D-R6-5 bracket clearance 1.72 mm, D-R6-6 a doubled
note. Root cause of the loop: the gate read the planner's own numbers (`factPlan.filled`) over a narrow grid of cases.

**STEP 1, the measured sweep** (`ws-simple-print --sweep`, inside `--facts-print`; `--sweep-full` for the critic and the
deploy run; from the critic's r6tools/sweep.cjs): every print built, drawn print-emulated in a reused frame (sheetDocument)
and its PRINTED page measured - TOTAL against the request, SHARES (one row), SIZENOTE, PAGESFULL (measured white; the last
page too in Pages mode), BLANKMID, DIVORDER, STRETCH, and SIZEBTN through the real dialog. Default: 702 prints, ~3 min
(÷ Mix In sections Problems 10-60 by 3, the owner's set 1-150 by 7 at Auto / 7 / 9, Pages 1-3 at Columns Auto / 6 / 7 / 9 /
10 on five lists, two-skill lists, Sets 2). Full: 8,229 prints, ~30 min (every count 1-150, Columns Auto and 1-10, Pages
1-4, eight lists, both arrangements). On 1d4c97a5c the default sweep FAILS: TOTAL 59, SHARES 115, SIZENOTE 286, PAGESFULL 55.
On the fix: default and FULL sweeps clean. The r5 FULLPLAN (it read `filled`) is retired for the measured PAGESFULL.

### Fixes (`js/modules/simple-print.js`, `js/modules/sheet/roles/fact-rows.js`)
1. **D-R6-1**: a group under one row keeps its exact count (no rounding up to a row); the ÷ forms share ONE mixed section in
   Problems mode too whenever a form has less than a row, the total would miss the request, or a skill would leave its share
   (note "N problems at Size: the ÷ forms share one section, mixed, so every skill keeps its share."). Problems 10 at S:
   3 / 3 / 2 / 2 on one page. Every ÷ form section is laid for the widest 3-digit facts its skills reach (a page without one
   kept 9 columns, the next dropped to 8 and lost two facts).
2. **D-R6-2** (owner ruling: columns win): the dialog says "Big digits don't fit 9 columns; printing at 16 pt." (Medium the
   same) whenever the printed digits are under the Size's; with Columns picked the size buttons read what prints at that size
   ("8 columns · 16 pt"), and a Columns change re-probes them.
3. **D-R6-3**: Pages mode plans the most problems whose pages are ALL full, the last included (`planFactRows(..., fillLast)`),
   and each skill within a row of its share; Sets 2+ of a Pages print fill their last page too. Where whole rows cannot fill
   every page (Columns 1-2 of ÷ forms), the dialog says so and no longer claims "every page is full".
4. **D-R6-4**: where one row height a section cannot fill both a page the ÷ section shares and a page of one group, each page
   but a Problems print's last stretches its own rows to fill it (never past 1.3; factPlan.perPage). **Owner note:** PG-11's
   "identical rows page to page" then differs by a few percent between such pages - chosen over 13 mm of white.
5. **D-R6-5**: a bracket section keeps 0.6 mm more room than the ink model, so "12)144" keeps 2 mm a side; at Small the
   bracket alone then takes 8 columns (the note says "8 columns so every fact fits its cell"; ws-layout-unit PT-FRW-9 and
   DIVMAX9 now expect that). Its row holds the stacked answer room over the vinculum (a written line + 2 mm; QROOM).
6. **D-R6-6**: the form names in one fixed order, so a print's notes no longer repeat.
7. SHARES in the planner is measured against the EVEN share (a row shift that leaves a skill more than a row off is refused).

### Gates (one at a time, foreground or waited on)
ws-simple-print --facts-print OK (r4, r5 and the measured sweep: no findings); full ws-simple-print OK; --sweep-full OK
(8,229 prints); ws-layout-unit OK (1766); ws-print-lint --source kit S OK, M OK, L only the pre-existing sub_facts#review
H13 ×4; ws-content-audit division:div_facts OK; ws-code-snapshot OK (732); ws-boot-smoke OK; ws-pdf-preview OK;
ws-screen-answer OK; ws-student-explorer OK; ws-chromebook-perf --only load OK; ws-stamp-assets + --check OK.

### Evidence (design/status/facts-print-fix/r6/)
- D-R6-1: `d1-mix-sections-pr10-S-p1.png`, `d1-mix-sections-pr22-M-p1.png`.
- D-R6-2: `d2-pages1-L-c9-p1.png`, `d2-pages1-M-c7-p1.png`.
- D-R6-3: `d3-pages2-L-p1..2.png`, `d3-mix-pages2-S-p1..2.png`. D-R6-4: `d4-addDiv-pr91-M-p1..4.png`.
- D-R6-5: `d5-div-long-pr30-S-p1.png`, `d5-div-mix-alone-pr63-S-p1.png`. Owner's page: `owner-page-S-c9-mixed-p1.png`.

### Speed notes (round 6)
- Measuring costs what trusting the plan costs: a reused print-emulated frame draws a build in ~0.2 s. The full sweep found
  the last slices (Columns 1-4 of ÷ forms) that the default sweep does not reach; `SWEEP_GREP=<regex>` re-runs a slice in
  minutes. The dialog check needed `bringToFront` and setting every control.
