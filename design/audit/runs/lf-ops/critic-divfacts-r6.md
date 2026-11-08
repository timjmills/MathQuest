# lf-ops: division:div_facts support-aid pages, independent critic, round 6 (narrow)

- **Critic:** independent (built none of it), Opus 5.5 medium. **Date:** 2026-11-08.
- **Tree:** frozen worktree `crit6` at **49a7b12a**. Every render below was made on that commit by this critic, one browser run at a time.
- **Previous rounds:** Lane D r4 (`design/audit/runs/laned-restart/critic-r4.md`), lf-ops r5 (`critic-divfacts-r5.md`), both FAIL.
- **Binding design:** signed facts card `design/cards/facts/facts.md` (re-signed 2026-11-08), §5 F1-F4; owner 2026-11-08: the supports-off
  page at S may hold 36. Earlier rulings kept: a plain count-by strip is not answer-given-away; touch digits >= 24 pt at S/M; the bracket at
  10 columns; Mixed Review count rows (R1-11 class) do not gate.
- **Scope (lead 2026-11-08):** Independent, Test, Review, More practice with each support alone; the array at `constant [2,3,4]` and at the
  default (greyed); the supports-off page; the fade packet (page 3 included). Shared fact roles and the divForm mix page were not graded.

## Renders (`design/audit/runs/lf-ops/renders/divfacts-r6/`)

| Dir | Command |
|---|---|
| `touch/ skip/ array/ think/ boxsign/` | `ws-grade-render --skills division:div_facts --roles independent,test,review,more-practice --supports X --size S,M,L --no-screen` (5 x 24 pages incl. keys) |
| `array-c234/` | the same, `--supports array --opts '{"constant":[2,3,4]}'` |
| `off/` | the same without `--supports` |
| `fade/` | `ws-print-lint --source kit --skills division:div_facts --supports all --fade packet --pages 3 --size M --save-html` (lint: 0 findings), then `tools/shot.cjs` -> `page-1..6.png` (3 pupil + 3 key) |
| `regress/` | add_facts, mult_facts, div_facts_long, Independent + Test M, supports off; compared with the same render made on r5's c41a48c in a temporary worktree: **0 px differ on all 12 PNGs** |
| `tools/` | `band.py.txt` (bottom empty band per cell, from the ink), `sidegap.py.txt` (ink to the cell's side rules), `pageuse.py.txt` (grid end vs body), `shot.cjs.txt` |

1 px = 0.2646 mm (96 dpi). Body = top of grid to y 1040 (footer).

## VERDICT: FAIL

Lowest score **5** (C3, fade packet page 3: H5). Further sub-8 pages: the supports-off / greyed-array Test S and M (6, half-empty page),
Test L (7); think Test S and M (7); skip and think Independent / More practice / Test M (7, answer line on the cell rule); the drawn array at L
(7, 4 columns, fact 1.85 mm from the rule).

**Fixed since r5 (verified):** R5-1 skip / think Test bands now 21-24 % (F1 met inside the cell); R5-2 the plain fact pages 18-26 %, S holds 36
(owner 2026-11-08); R5-3 the array has the subitising gap after rows 5 and 10; R5-4 array S 20 vs M 12 (Test 16 vs 12); R5-5 think boxes one
size; R5-6 one answer form across the packet, stage-3 rows unstretched (10 % band); R5-7 the touch fits line says "touch-dot facts 28 pt".
Regression byte-identical. Every key spot-checked (touch Independent S, skip Test M, array 2-4 Test S, fade p4-6): facsimile, all correct.

## Scores (C1 / C2 / C3 / C4)

Bands = worst fact cell (mixed-review count rows excluded). "used" = grid height / body.

| Support | Size | Independent (= More practice) | Test | Review |
|---|---|---|---|---|
| touch | S | 8/8/8/8 (14.5 %) | 8/8/8/8 (14.5 %, 99 % used) | 8/8/8/8 (12 %) |
| touch | M | 8/8/8/8 (14.5 %) | 8/8/8/8 (14.5 %) | 8/8/8/8 |
| touch | L | 8/8/8/8 (9.8 %) | 8/8/8/8 (19.6 %, 89 %) | 8/8/8/8 |
| skip | S | 8/8/8/8 (15 %, 21 a page) | 8/8/8/8 (23.5 %, 94 %) | 8/8/8/8 |
| skip | M | 8/8/**7**/8 (R6-2) | 8/8/**7**/8 (23.5 %, 86 %; R6-2) | 8/8/8/8 |
| skip | L | 8/8/8/8 (22.7 %) | 8/8/8/8 (21 %) | 8/8/8/8 |
| array, default (greyed -> plain fact) | S | 8/8/8/8 (22 %, 36) | 8/8/**6**/8 (25.6 %, **49.7 %** used, 117 mm white; R6-1) | 8/8/8/8 (29 %) |
| array, default | M | 8/8/8/8 (19 %, 24) | 8/8/**6**/8 (22 %, **50 %**, 116 mm; R6-1) | 8/8/8/8 (26 %) |
| array, default | L | 8/8/8/8 (17.5 %, 18) | 8/8/**7**/8 (21 %, 61 %, 91 mm; R6-1) | 8/8/8/8 |
| array, tables 2-4 (drawn) | S | 8/8/8/8 (8.8 %, 20) | 8/8/8/8 (16) | 8/8/8/8 |
| array, tables 2-4 | M | 8/8/8/8 (7.4 %, 12) | 8/8/8/8 (16 %, 12) | 8/8/8/8 |
| array, tables 2-4 | L | 8/8/**7**/8 (R6-3) | 8/8/**7**/8 (R6-3) | 8/8/8/8 |
| think | S | 8/8/8/8 (18.5 %, 24) | 8/8/**7**/8 (22 %, 78 %, 50 mm = 1.7 rows; R6-1) | 8/8/8/8 (25 %) |
| think | M | 8/8/**7**/8 (R6-2) | 8/8/**7**/8 (21 %, 73 %, 64 mm = 1.9 rows; R6-1, R6-2) | 8/8/8/8 (24 %) |
| think | L | 8/8/8/8 (11 %) | 8/8/8/8 (18.6 %, 87 %) | 8/8/8/8 |
| boxsign | S | 8/8/8/8 (15 %) | 8/8/8/8 (15 %) | 8/8/8/8 |
| boxsign | M | 8/8/8/8 (26.9 %) | 8/8/8/8 (23 %) | 8/8/8/8 (28 %) |
| boxsign | L | 8/8/8/8 (13.4 %) | 8/8/8/8 (13.4 %) | 8/8/8/8 |
| supports off | S / M / L | = array default rows above (byte-for-byte the same pages) | = array default (R6-1) | = array default |

| Other | C1 / C2 / C3 / C4 |
|---|---|
| Fade packet M, 3 pages, 27 problems (6 / 9 / 12) | 8/8/**5**/8 (R6-4 H5, R6-5) |
| Regression M off: add_facts, mult_facts, div_facts_long Independent + Test | unchanged (0 px vs c41a48c); not regraded |
| Keys | pass |

## Defects

### R6-1 Test pages of the one-line fact end half way down the page (F1 met in the cell, now the page is wasted)
- **Where / measured:** `off/.../test-S-p1.png` 4 x 5 = 20, grid 162-598 px: **49.7 % of the body used, 117 mm white** under the grid;
  `test-M-p1.png` 4 x 4 = 16, **50 %, 116 mm**; `test-L-p1.png` 3 x 4 = 12, 61 %, 91 mm (2.6 rows). The greyed-array Test pages are the same
  pages. think Test S 3 x 6 = 18, 50 mm white (1.7 rows); think Test M 3 x 5 = 15, 64 mm (1.9 rows). The Independent pages of the same
  content fill to 86-96 % (36 / 24 / 18).
- **Rule:** RUBRIC C3 ("no half-empty page when more would fit"; anchor 6 names "half-empty page"); H5 (< 50 % used) at S; L19 owner
  white-space rule (white under the grid <= one row). The cause is a rule collision: F1 sizes Test rows to the footprint, and WDS 12.1 caps
  Test A/B at 20 / 16 / 12, so the page cannot be filled with items.
- **Fix (needs a lead / owner ruling):** (a) preferred: for a one-line horizontal fact Test, the count follows the Independent capacity (36 / 24 / 18,
  as the owner's 2026-11-08 S ruling did for Independent), Score /N to match; or (b) the Test prints Form A and Form B on one sheet (two
  sections) when one form leaves more than one row of white; or (c) the owner accepts a short Test page in writing. Rows must not be stretched
  (that is R5-1).
- **Check:** `ws-empty-band` (or `pageuse.py`) adds EB-PAGE: white under the grid > one row pitch on a one-section page = FAIL, unless the
  count is at a ceiling the card names as accepted short. The current gate measures only inside cells, so it passed these pages.
- class SPACE, rule_ids H5 L19 F1 WDS-12.1. Severity critical at S / M (C3 6), major at L and think (C3 7).

### R6-2 The answer line runs onto the cell's right rule on 3-digit facts at M (skip, think)
- **Where / measured:** `skip/.../independent-M-p1.png` item 4 "110 ÷ 11 = ___": the line ends **0.79 mm** from the rule (3 cells a page);
  `more-practice-M` 0.53 mm (5 cells); skip Test M item 7 (132 ÷ 12) 0.79 mm, and its strip's first box 0.8 mm from the left rule;
  think Independent / More practice / Test M (120 ÷ 10, 132 ÷ 12) 0.53-0.79 mm (2-5 cells a page). Two-digit facts in the same rows keep 4-6 mm.
- **Rule:** WDS CL-8 (fact cells: side pad 3 mm); C3 "no cramped rows". The line reads as part of the border.
- **Fix:** size the three-column M grid from the widest fact in the band (144 ÷ 12 = ___ plus 2 x 3 mm), or shorten the answer line for the
  widest facts (keep it >= the slot minimum), or let the skip / think M section drop to the column count that fits.
- **Check:** `sidegap.py` logic in `ws-print-lint` L-CELL: min ink-to-rule gap per cell >= CL-8 pad (3 mm, 2 mm at >= 7 columns), over the
  band's widest fact (deal 132 ÷ 12 / 144 ÷ 12 in the probe, not a sample).
- class LAYOUT, rule_ids CL-8. Severity minor (C3 7). First measured this round; r5 did not measure side gaps.

### R6-3 The drawn array at L takes 4 columns (M takes 3), so every fact touches its rule
- **Where / measured:** `array-c234/.../independent-L-p1.png` (and More practice L, Test L): 4 x 3 at 28 pt; the fact "48 ÷ 4 =" spans
  x 252-388 in a 221-396 cell: **1.85 mm** to the right rule in 7 / 8 / 10 of 12 cells; Independent M of the same set is 3 x 4 with 5.3 mm.
  L and M both print 12, so the 4th column buys nothing.
- **Rule:** CL-8 (3 mm at 4 columns); C3 (cramped); L should never be the denser layout.
- **Fix:** at L take the column count from the fact width (3 columns, as M), rows from the array height; or cap at the M count.
- **Check:** as R6-2, plus a cross-size check: columns(L) <= columns(M) for the same section.
- class LAYOUT, rule_ids CL-8. Severity minor (C3 7).

### R6-4 Fade packet page 3 is 40 % used (H5)
- **Where / measured:** `fade/page-3.png` (and key page 6): 12 bare facts, 3 x 4 in 28 mm rows (band 10 %), grid 229-551 px: **40 % of the
  body, 129 mm white**. The Independent M page of the same bare fact holds 24.
- **Rule:** RUBRIC H5 (< 50 % used while the role expects more) -> C3 <= 5; F4 (each page's rows sized to the supports that page carries:
  met) does not excuse the short count. The stage is capped at 2 x page 1 (lane note).
- **Fix:** deal the last stage to the page (24 at M, so the packet is 6 / 9 / 24 = 39), or rebalance so the last page holds a full grid; the
  dialog's count follows.
- **Check:** the fade lint (L-FADE) gets a per-page used-% / white-under-grid check (the same EB-PAGE as R6-1); `ws-print-lint` reported 0
  findings on this packet.
- class SPACE, rule_ids H5 F4. Severity critical (cap).

### R6-5 Fade packet: the fact is not at one x across the packet
- **Where / measured:** fact left ink x: page 1 = 83 / 315-317 / 548-550 px per column; pages 2 and 3 = 101-104 / 334-335 / 568-570 px.
  **5.0 mm** shift between stage 1 and stages 2-3 (within a page <= 0.5 mm). The answer line also changes length (page 1-2 x 80-263, page 3
  x 100-228).
- **Rule:** F4 ("the fact left-anchored at one x"); r5 check proposal (spread <= 1 mm across the packet).
- **Fix:** one left anchor for the packet (tab + 2 mm, or the widest stage's inset) applied to every stage; one answer-line length.
- **Check:** fact-left-x spread across all pages of a packet <= 1 mm (the lane's check measures within a section only).
- class LAYOUT, rule_ids F4. Severity minor (C3 7 on its own; page score is set by R6-4).

## Observations (no score effect)
- skip Independent S fits line says "Tall problems: 5 rows per page" while the page prints 3 x 7 = 21 (dialog text contradicts the page).
- The greyed array's fits line lists every fact (30+); "No fact of this set is 50 or less" would read better (r5, unchanged).
- boxsign Independent M: "box + fact" centred per cell, so the slot's right end drifts about 5 mm down a column (r4/r5 nit, unchanged).
  boxsign S 2.91 mm side gap on 110 ÷ 11 (nit, 0.09 mm under CL-8).
- Skip-strip and think-box terms print at about 9 pt at every size (r5, unchanged).
- The drawn array frame is one height per section (F2 "one shape a section"), so 4 ÷ 4 shows one row in a 12-row frame; by ruling.

## Visual-quality bar (RUBRIC 6.1)
1. Representation: ÷ as count-by: tally row (touch), strip to 12 x (skip, F3), related fact (think), operation box (boxsign), a true array with
   the subitising gap (F2, dividends <= 50). Yes.
2. Live parts: every support is drawn on every item it is offered for; the array falls back to the plain fact with the reason when greyed. Yes.
3. One answer place: yes per section; one form across the fade packet now (R5-6 fixed), but its x moves (R6-5).
4. Type and stroke: Andika, black and white, one size a section; the think box no longer shrinks. Yes.
5. Paper = screen: not covered (print-only narrow round, `--no-screen` per brief).
6. Title: "I Can divide using times facts" / "I Can divide by 2-4" / "Test A: dividing by 2-4" follow the options. Yes.
7. Own renders: every page graded was rendered on 49a7b12a for this round.

## Process rule 00

**Automatic checks that would have caught each finding**
1. R6-1, R6-4: EB-PAGE in `ws-empty-band` / the fade lint: white under the grid (mm) vs one row pitch per page, with the card naming any
   accepted short page. Today's gate is cell-only, so F1's fix moved the empty space from the cells to the page and stayed green.
2. R6-2, R6-3: a side-gap check (min ink to each side rule >= CL-8 pad) in L-CELL, probed with the band's widest fact; plus columns(L) <=
   columns(M) per section.
3. R6-5: fact-left-x spread across all pages of a fade packet (not per section).
4. Observation: a fits-line vs page check (the "Tall problems: N rows" phrase vs the drawn rows).

**Speed-ups this round revealed**
1. When a ruling moves space (F1: rows to footprint), check where the space went: run the page-level and the cell-level measure together.
   A one-sided gate converts one defect into its mirror image.
2. A rule collision (F1 vs the 12.1 Test ceiling) should go to the lead as a question when the lane first sees a half page, not to a critic:
   add "page < 70 % used at a role ceiling" as a precritic WARN that names the colliding rule.
3. `shot.cjs` needs an absolute input path (a relative path gave `ERR_INVALID_URL`); `--save-html` with relative CSS links (r5 speed-up 3) is
   still open.
4. The whole grid (6 grade-render runs + packet + regression) took about 12 minutes of browser time; an r5-base worktree render made the
   regression a pixel diff in 1 minute. Keep both as the critic's standard kit.
