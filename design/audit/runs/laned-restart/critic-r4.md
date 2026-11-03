# Lane D restart: independent critic, round 4 (narrow: div_facts supports)

Critic: independent (built none of it), Opus 5.5 medium. Branch `claude/sweet-newton-c8wrv1-laneD-restart` @ e2ab83ee.
Date 2026-11-03. Scope (lead brief): `division:div_facts` with each support on alone (touch, skip, array, think, boxsign) on
Independent, Test and Review at S / M / L (45 pupil pages, keys spot-checked); the 3-page fade packet at M; regression spot-check of
add_facts, sub_facts, mult_facts, div_facts_long on Independent and Test at M (supports off).
Rulings applied: a count-by strip of the divisor's multiples is not "answer given away" unless it marks the quotient; the bracket
stays at 10 columns; R1-11 (identical count-by-12 chains in the Review's Mixed Review) and the other r2/r3 ruled-out page-type
defects do not gate; touch dots raise S / M digits to 24 pt or more (owner ruling, `print-sheet.js:1268`), so touch S = M is by
ruling; the Test role's fixed cell geometry (PT-TST table, r3 accepted the empty space under the answer line) is not scored as H13.

All renders were re-made on e2ab83ee (none reused from `r4/`, since `print-sheet.js`, `layout.js` and `roles/practice.js` changed
after them): `r4-critic/<support>-<S|M|L>/division__div_facts/*.png` (ws-grade-render `--roles independent,test,review --supports X
--size Z --no-screen`), `r4-critic/fade-packet-M/` (ws-print-lint `--supports all --fade packet --pages 3 --size M --save-html`,
screenshots `page-1..6.png`), `r4-critic/regress-M/`. `ws-print-lint` on every support x size x role: 0 findings
(`r4-critic/lint/*.txt|json`). Every defect below is therefore one the lint does not see.

## VERDICT: FAIL

Lowest score: C3 5 (fade packet M). Failing: every array page (9), touch Independent S and M, boxsign Independent S and L, boxsign
Test L, all skip pages (C2 7), the fade packet.

## Scores (C1 / C2 / C3 / C4)

| Support | Size | Independent | Test | Review |
|---|---|---|---|---|
| touch | S | 8/8/**6**/8 (R4-1) | 8/8/8/8 | 8/8/8/8 |
| touch | M | 8/8/**6**/8 (R4-1) | 8/8/8/8 | 8/8/8/8 |
| touch | L | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| skip | S | 8/**7**/8/8 (R4-3) | 8/**7**/8/8 | 8/**7**/8/8 |
| skip | M | 8/**7**/8/8 | 8/**7**/8/8 | 8/**7**/8/8 |
| skip | L | 8/**7**/8/8 | 8/**7**/8/8 | 8/**7**/8/8 |
| array | S | **7**/**7**/**6**/8 (R4-2) | **7**/**7**/**6**/8 | **7**/**7**/**6**/8 (R4-2c) |
| array | M | **7**/**7**/**6**/8 | **7**/**7**/**6**/8 | **7**/**6**/8/8 (R4-2b: no array on any fact) |
| array | L | **7**/**7**/**6**/8 | **7**/**7**/**6**/8 | **7**/**7**/8/8 |
| think | S | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| think | M | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| think | L | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| boxsign | S | 8/8/**6**/8 (R4-1) | 8/8/8/8 | 8/8/8/8 |
| boxsign | M | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| boxsign | L | 8/8/**6**/8 (R4-1) | 8/8/**7**/8 (R4-4) | 8/8/8/8 |

| Other | C1 / C2 / C3 / C4 |
|---|---|
| Fade packet M, 3 pages, 13 problems (3 / 5 / 5), `--supports all` | **7**/**6**/**5**/8 (R4-5) |
| Regression, M, supports off: add_facts / sub_facts / mult_facts Independent + Test | 9/9/8/9 (as r3, no regression) |
| Regression: div_facts_long Independent + Test M | 8/8/8/8 (as r3) |
| Keys spot-checked (think S Independent, array S Review, skip M Test, fade packet): facsimile, every answer correct | pass |

## Defects

### R4-1 Independent pages with touch (S, M) or boxsign (S, L): cells a third empty (H13)
- **Where / measured** (`r4-critic/tools`: ink rows per cell from the PNG, tab column excluded): touch Independent S and M
  (`touch-S|M/.../independent-p1.png`), 3 x 4 cells 217 px tall, content ends 69 px above the cell bottom = **32 %** empty band in
  every cell; boxsign Independent S 5 x 4, 217 px, 70 px = **32 %**; boxsign Independent L 3 x 3 cells 288 px (75.7 mm), 101 px =
  **35 %**. The same content fits a 45.6 mm row (touch Test S/M holds 15 in 3 x 5 cells of 174 px, band 14 %).
- **Rule:** RUBRIC H13 (empty band ≥ 30 % of the cell height) → C3 ≤ 6; C3 "full but not crowded". Independent prints 12 (touch)
  / 9 (boxsign L) where the Test page of the same support prints 15 / 12.
- **Fix:** size Independent rows to the supported cell's footprint (as Test does: 45.6 mm rows for touch, 57 mm for boxsign L), so
  touch S/M prints 3 x 5 = 15 and boxsign L 3 x 4 = 12; the band must fall under 30 %.
- **Check that would have caught it:** `ws-print-lint` H13 runs and is silent here, so its measure is not the rubric's. Make the
  H13 lint measure the cell's ink (last ink row to the cell's bottom rule, excluding the number tab) and run it per support
  (`--supports touch|skip|array|think|boxsign`, each alone) at S/M/L on Independent. Process: precritic ran `--supports all`, never
  a support alone.
- class SPACE, rule_ids H13. Severity critical (cap).

### R4-2 Array support: drawn on half the facts, two cell geometries per page, answer place moves
- **Where:** every array page. Independent S (`array-S/.../independent-p1.png`): items 1-8 in a 2-column grid, items 9-12 full-width
  rows of other heights (63-139 px); counters appear on items 1, 6, 9-12 and on none of 2, 3, 4, 5, 7, 8 (84 ÷ 12, 96 ÷ 8, 110 ÷ 11,
  80 ÷ 10, 72 ÷ 9, 96 ÷ 12); item 1 has the counters under the fact, item 6 beside it, so the slot sits at a different height in two
  cells of one row. Test S: 11 problems, the grid ends at 731 px of ~1040 (28 % of the body unused); Test M 9 problems, the same.
  Fits line on Independent S says "2 columns x 8 rows, 16 per page" and "1 column x 11 rows" while the page prints 12.
- **(b)** Review M: the teacher asked for the array, and none of the 6 facts draws one (36 ÷ 12, 77 ÷ 11, 100 ÷ 10, 0 ÷ 2, 81 ÷ 9,
  72 ÷ 12); nothing on the page says so. C2 6.
- **(c)** Review S prints 7 problems (`Score /7`): PT-REV-1 asks 8 to 20.
- **(d)** The drawing is a pool of counters in fives (21 ÷ 7 = 10 + 10 + 1 circles), not an array; it works as "ring groups of 7",
  but the option says array. Note, no score on its own.
- **Rule:** RUBRIC C3 (equal cells across a section, answer in the same place in every cell; page full), SCC-T10, PT-REV-1; C1 (the
  pupil does not know which items get help); C2 (the support is missing on the hard facts where it would teach).
- **Fix:** decide the array's reach in the provider: either draw it for every fact of the section (cap the band at what an array can
  draw, e.g. dividend ≤ 50, and say so in the option help) or, with cover whole, refuse the support for a section whose facts exceed
  it and say so in the fits line; keep one cell shape per section (counters always under, rows the height of the tallest pool),
  and give Review its 8-item floor.
- **Check that would have caught it:** a new L-SUPPORT-COVER lint: with `--cover whole`, every problem of a supported section carries
  `data-ws-supports` containing the requested id, or the fits note names the skipped ones; SCC-T10 extended across the two sections of
  one page; a PT-REV-1 count check (8 ≤ problems ≤ 20) on the Review role.
- class SUPPORT / LAYOUT, rule_ids SCC-T10 PT-REV-1. Severity major.

### R4-3 Skip strip stops at 5 × the divisor, short of the dividend on most items
- **Where:** every skip page. `cells/fact.js:178` draws `n = 5` terms then "…". Independent S: 13 of 24 items have a quotient over 5
  (84 ÷ 12 strip 12 … 60; 96 ÷ 8 strip 8 … 40; 24 ÷ 2 strip 2 … 10), so the pupil counts on unsupported exactly where counting by 7,
  8, 9, 11, 12 is hard. DV-02 draws the strip "to a stop" (the total).
- **Rule:** RUBRIC C2 (the scaffold must do its job on every item); PEDAGOGY structural scaffold persists. C2 7.
- **Fix:** draw the strip to 12 × the divisor (or to the band's top), in two rows of 6 like the touch tally row, all terms alike (the
  RP-1 ruling still holds: no term marked). The strip must reach every dividend of the section.
- **Check that would have caught it:** extend L-SUPPORT `plainStrip()`: the largest `data-ws-term` ≥ the cell's dividend.
- class SUPPORT, rule_ids DV-02. Severity minor.

### R4-4 boxsign Test L: one lone problem in a different geometry
- **Where:** `boxsign-L/.../test-p1.png`. Items 1-9 in a 3 x 3 grid with the sign box under the fact; item 10 (132 ÷ 12) alone in a
  full-width row with the sign box beside the fact. The page prints 10 (`Score /10`); the touch Test at L fits 12 including 132 ÷ 12
  in a 62 mm cell.
- **Rule:** C3 (one cell shape per section, answer in the same place); PG-12. C3 7.
- **Fix:** keep the wide fact in the grid (box under, as items 1-9; 132 ÷ 12 = fits 62 mm at L on the touch page) so Test L prints
  3 x 4 = 12.
- **Check:** a lint that fails a section whose last row is a lone full-width problem when the grid cell could hold it (measure the
  problem's width against the grid cell width).
- class LAYOUT, rule_ids PG-12. Severity minor.

### R4-5 Fade packet M (3 pages, 13 problems): mostly empty cells, and the supports do not fade
- **Where:** `fade-packet-M/page-1..3.png`. Page 1 holds 3 problems in ~50 mm rows; problems 1 and 2 fill ~20 % of their cell
  (~75 % empty band). Pages 2 and 3 hold 5 each in rows of the same reserved height.
  Supports per problem, in order (from `data-ws-supports`): boxsign, none, all, all, boxsign, boxsign, all, all, all, boxsign, none,
  none, none. Problem 2 on page 1 is bare while problem 3 has every support, and page 3 opens fully supported after page 2's boxsign
  items: the packet does not fade from more help to less.
  The fact and its slot move between cells (problem 4's fact at x 636, problem 7's at 583 of 794).
- **Rule:** H13 → C3 ≤ 6 (measured far past 30 %) and C3 "full": 3 problems on page 1, so C3 5; PEDAGOGY scaffold fade (one change
  at a time, supports withdraw in order) → C2 6; SCC-T10 → C1 7.
- **Fix:** deal the faded packet in support order (all → fewer → none, a block per stage), size each page's rows to the supports that
  page actually carries rather than reserving every support's room, and left-anchor the fact at one x for the section.
- **Check:** a L-FADE-ORDER lint (the support count per problem is non-increasing through a `--cover fade` packet); H13 that counts
  a reserved-but-empty support zone as empty (today the reserve hides the band from the lint, which reported 0 findings).
- class SUPPORT / SPACE, rule_ids H13 SCC-T10. Severity critical.

## Observations (no score effect)
- think: the think box's answer square is about 5 x 6 mm at S, small for a two-digit quotient (96 ÷ 8 = 12). Nit.
- boxsign M Independent: each row centres "sign box + fact", so the slot's right end moves 337-362 px in column 1 (≈ 6 mm). Nit; the
  R3-1 class at a smaller size.
- Review L: the band label wraps to "Mixed / Review:" over two lines (all supports). Cosmetic.
- div_facts (supports off) Test M and div_facts_long Test M: 4 x 4 cells of 48 mm leave ~40 mm of the body unused under the grid
  (PT-TST table: 57 mm rows). Not graded as a regression (no r3 render at M to compare); worth one look by the lane.
- The Test role's large fixed cells measure 40-54 % empty under a horizontal fact (supports off and on). r3 accepted it under the
  PT-TST table; H13 and PT-TST disagree for across facts. Needs a lead ruling, not a lane fix.

## Visual-quality bar (RUBRIC 6.1)
1. Representation: ÷ by count-by: the tally row (touch), the strip (skip) and the think box draw the relation; the array draws a
   counter pool, not an array (R4-2d), and only on small facts.
2. Live parts: touch, think, boxsign live on every item; skip strip dead past 5 × (R4-3); array absent on half the items (R4-2).
3. One answer place: yes on touch / skip / think; no on array (R4-2) and the fade packet (R4-5).
4. Type and stroke: Andika, digits at the size's working size (touch at 24 pt+ by ruling); strip terms ≈ 9 pt.
5. Paper = screen: not re-rendered (print-only narrow round).
6. Title: "I Can divide using times facts" / "Test A: dividing using times facts": sentences, fine.
7. Own renders: every page above rendered on e2ab83ee for this skill.

## Speed notes (process rule 00)
- Every finding was invisible to `ws-print-lint` (0 findings on all 15 runs and the packet). The lane's H13 and SCC-T10 lints pass
  pages that measure 32-75 % empty and pages with two geometries. Root cause to fix before the next round: the lint measures layout
  boxes (including reserved support room), not ink. A 40-line PNG ink-band measure (as used here) is the faster guard.
- Precritic ran supports `all`; a single support produces different layouts (array full-width rows, boxsign beside vs under). Run
  each support alone at S/M/L on Independent, Test and Review: 45 pages, ~4 minutes.
