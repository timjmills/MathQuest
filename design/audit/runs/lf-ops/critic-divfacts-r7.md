# lf-ops: division:div_facts support-aid pages, independent critic, round 7 (narrow)

- **Critic:** independent (built none of it), Opus 5.5 medium. **Date:** 2026-11-09.
- **Tree:** frozen worktree `crit7w` at **17ce2fe1**. Every render below was made on that commit by this critic, one browser run at a time.
- **Previous round:** r6 (`critic-divfacts-r6.md`, FAIL, lowest 5, R6-1..R6-5).
- **Binding design:** signed facts card `design/cards/facts/facts.md` §5 F1-F4. Owner rulings in force: 2026-11-08 supports-off S holds 36;
  2026-11-08 the facts Test count follows the Independent capacity, so the Test page is full; 2026-11-09 at L a fact too wide for its column
  starts under the number tab, 3 columns kept; earlier: a plain count-by strip is not answer-given-away, touch digits >= 24 pt at S/M, the
  bracket at 10 columns, Mixed Review count rows do not gate.
- **Scope:** Independent, Test, Review, More practice with each support alone at S/M/L; the array at `constant [2,3,4]` and at the default
  (greyed); supports off; the fade packet at M and L. Shared fact roles and the divForm mix page not graded. Print only (`--no-screen`).

## Renders (kept at `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/r7-renders/`)

| Dir | Command |
|---|---|
| `touch/ skip/ array/ think/ boxsign/` | `ws-grade-render --skills division:div_facts --roles independent,test,review,more-practice --supports X --size S,M,L --no-screen` (5 x 24 PNG) |
| `array-c234/` | the same, `--supports array --opts '{"constant":[2,3,4]}'` |
| `off/` | the same without `--supports` (byte-identical to `array/`, 24 / 24 PNG: the greyed array falls back to the plain fact) |
| `fade-M/ fade-L/` | `ws-print-lint --source kit --skills division:div_facts --supports all --fade packet --pages 3 --size M|L --save-html` (lint 0 findings both), then `shot.cjs.txt` -> `page-1..6.png` (3 pupil + 3 key) |
| `regress/` vs `regress-base49/` | add_facts, mult_facts, div_facts_long, Independent + Test M, supports off, on 17ce2fe1 and on r6's 49a7b12a (`git archive`): **12 / 12 PNG byte-identical** |
| `meas.py.txt` | per page: cells, row pitch, worst bottom band, min ink-to-side-rule gap (tab masked), white under the grid to the footer ink, % used |

1 px = 0.2646 mm. A full page leaves **6.9 mm** from the grid to the footer ink (the floor); "white" below is to the footer ink.

## VERDICT: FAIL

Lowest score **7** (C3) on two pages: the supports-off / greyed-array **Test M** (R7-1) and the fade packet **L page 3** (R7-2). Every other graded
page scores 8 or more.

**Fixed since r6 (verified on the ink):**
- R6-1: the across-fact Test now fills: off Test S 36 (4 x 9), L 18 (3 x 6); skip / think Test 18-21 at S, 15 at M. Grid used 85-97 %.
- R6-2: 3-digit facts at M: skip / think M print the line under the fact; min ink-to-rule gap now **3.70 mm** (skip M), 7.94 mm (think M).
- R6-3: the drawn array at L takes 2 columns (beside), M 4, S 5; min side gap 6.35-7.41 mm; L (10) is not denser than M (12).
- R6-4: fade M page 3 holds 24 bare facts (3 x 8), 91.5 % used, white 21.2 mm.
- R6-5: the fact's left ink is at x 79-80 px on all three packet pages at M (spread 0.3 mm) and at x 60 px on all three at L.
- Keys spot-checked (touch Test L, think Test M, array 2-4 Test S, fade L page 6): facsimile of the pupil page, every answer correct.

## Scores (C1 / C2 / C3 / C4)

Band = worst bottom empty band of a fact cell (mixed-review count rows excluded). Count = items on the page.

| Support | Size | Independent (= More practice) | Test | Review |
|---|---|---|---|---|
| touch | S | 8/8/8/8 (15, 14.5 %) | 8/8/8/8 (15, 14.5 %) | 8/8/8/8 |
| touch | M | 8/8/8/8 (15, 14.5 %, gap 4.76 mm) | 8/8/8/8 (15) | 8/8/8/8 |
| touch | L | 8/8/8/8 (12, 23.6 %) | 8/8/8/8 (12, 19.2 %, white 19.8 mm) | 8/8/8/8 |
| skip | S | 8/8/8/8 (21, 15.4 %) | 8/8/8/8 (18, 23.5 %, white 19.8 mm) | 8/8/8/8 |
| skip | M | 8/8/8/8 (15, 14.5 %, gap 3.70 mm) | 8/8/8/8 (15) | 8/8/8/8 |
| skip | L | 8/8/8/8 (12, 17.1 %, gap 3.18 mm) | 8/8/8/8 (12) | 8/8/8/8 |
| array default = supports off | S | 8/8/8/8 (36 = owner cap, 22 %) | 8/8/8/8 (36, 25.6 %) | 8/8/8/8 |
| array default = supports off | M | 8/8/8/8 (24, 19.2 %) | 8/8/**7**/8 (**21**, white 34.4 mm; R7-1) | 8/8/8/8 |
| array default = supports off | L | 8/8/8/8 (18, 17.5 %) | 8/8/8/8 (18, 21.2 %) | 8/8/8/8 |
| array 2-4 (drawn) | S | 8/8/8/8 (20, 8.8 %) | 8/8/8/8 (16) | 8/8/8/8 |
| array 2-4 | M | 8/8/8/8 (12, 19 %) | 8/8/8/8 (12) | 8/8/8/8 |
| array 2-4 | L | 8/8/8/8 (10, 2 x 5, 15 %) | 8/8/8/8 (9, 3 x 3, 11.8 %) | 8/8/8/8 |
| think | S | 8/8/8/8 (24, 18.5 %) | 8/8/8/8 (21, white 25.4 mm) | 8/8/8/8 |
| think | M | 8/8/8/8 (15, 23.1 %) | 8/8/8/8 (15, 19.4 %) | 8/8/8/8 |
| think | L | 8/8/8/8 (12, 25 %) | 8/8/8/8 (12, 18.2 %) | 8/8/8/8 |
| boxsign | S | 8/8/8/8 (20, 15 %) | 8/8/8/8 (20) | 8/8/8/8 |
| boxsign | M | 8/8/8/8 (16, 2 x 8, 26.9 %) | 8/8/8/8 (12, 3 x 4, 23 %) | 8/8/8/8 |
| boxsign | L | 8/8/8/8 (12, 13.4 %) | 8/8/8/8 (12) | 8/8/8/8 |

| Other | C1 / C2 / C3 / C4 |
|---|---|
| Fade packet M (6 / 9 / 24 = 39): p1 79.8 % used, p2 91.6 %, p3 91.5 % | 8/8/8/8 |
| Fade packet L (6 / 9 / 15 = 30): p3 15 facts, rows 41.1 mm, white 42.6 mm | 8/8/**7**/8 (R7-2) |
| Regression M off (add_facts, mult_facts, div_facts_long, Independent + Test) | unchanged (12 / 12 PNG identical to 49a7b12a); not regraded |
| Keys | pass |

## Defects

### R7-1 Supports-off Test M prints 21 where the Independent page of the same facts prints 24 (owner ruling 2026-11-08 not met)
- **Where / measured:** `off/division__div_facts/test-M-p1.png` (= `array/.../test-M-p1.png`): 3 x 7 = 21, row pitch **29.1 mm**, white under the
  grid **34.4 mm** (1.18 row pitches; a full page leaves 6.9 mm), 85.5 % used. `off/.../independent-M-p1.png`: 3 x 8 = **24**, pitch **27.8 mm**,
  white 15.3 mm. The cell content is identical (fact ink 189-209 px, line 248 px in both); only the space under the line differs: 20 px
  Independent, 25 px Test (+1.3 mm a row x 8 rows = the 8th row that does not fit by 1.6 mm).
- **Rule:** owner 2026-11-08 (R6-1 option a: the one-line across fact Test's count follows the Independent capacity, so the Test page is full);
  RUBRIC C3 (no wasted space when more would fit); L19 white <= one row.
- **Cause:** `js/modules/sheet/roles/test.js` `fillToCeiling`, footprint branch: `rowH = L.hMin * FACT_TEST_ROOM` (1.15) while the Independent
  page's rows carry less room, so `fitRows` is 7 at M where the Independent page fits 8.
- **Fix:** in the footprint branch, when `fitRows * cols` is below the Independent count for the section, size the rows to fit that count
  (`rowH = min(hMin * 1.15, (G - SAFETY_H_MM - GRID_BORDERS_MM) / independentRows)`), never below the Independent row height.
- **Check:** `ws-empty-band` EB-TESTCAP: for every div_facts section and size, Test count >= Independent count (across fact; the same pair
  printed by ws-grade-render), and EB-PAGE measured to the footer ink with the 6.9 mm floor subtracted, so 34.4 - 6.9 = 27.5 mm vs 29.1 is
  reported, not hidden. The current EB-PAGE passed this page.
- class SPACE, rule_ids L19 F1. Severity minor (C3 7).
- **Lead question (no score effect this round):** the same Test < Independent gap appears where the ruling's text (one-line across fact) does
  not reach: skip S 18 vs 21, think S 21 vs 24, boxsign M 12 vs 16 (Test draws the box UNDER the fact, Independent BESIDE it), drawn array S 16
  vs 20 and L 9 (3 x 3, array under) vs 10 (2 x 5, array beside). Each of these pages is full in its own rows (white under one row), so they
  score 8; if the ruling is meant for every support, they are the same defect.

### R7-2 Fade packet L, page 3: a 20 mm hole between the fact and its line costs a row
- **Where / measured:** `fade-L/page-3.png` (and key `page-6.png`): 15 bare facts, 3 x 5, row pitch **41.1 mm**; in each cell the fact (under
  the tab) ends at y 191 and the line is at y 268: **20.1 mm** fact-to-line, where packet pages 1-2 at L, fade M page 3 and Independent L all
  use **12.7 mm**. White under the grid **42.6 mm** (1.04 rows). The Independent L page of the same bare fact holds **18** (3 x 6, 33.6 mm rows).
- **Rule:** F4 (each page's rows sized to the supports that page carries: page 3 carries none, so the bare-fact footprint); C3; L19. The
  2026-11-09 ruling allows taller rows for the under-tab start, i.e. the tab height, not an extra 7.4 mm writing gap.
- **Fix:** in the under-tab layout keep the fact-to-line gap of the over-tab layout (12.7 mm at L): row = tab + fact + 12.7 mm + line + pad
  (about 33-34 mm), so page 3 holds 18 and the packet is 6 / 9 / 18.
- **Check:** EB-FACTX's sibling: fact-to-slot gap spread across a packet's pages <= 1 mm, plus the last (bare) stage page count >= the
  Independent count at the same size (EB-FADE-CAP). The lane's EB-PAGE passed (white 42.6 - 6.9 = 35.7 mm < 41.1 mm pitch).
- class SPACE, rule_ids F4 L19. Severity minor (C3 7).

## Observations (no score effect)
- Fade M page 3: answer lines differ by row, 34 / 35 / 38 mm (x 79-206, 79-209, 79-223); one length per page would read cleaner.
- Fade packet digits: 28 pt on pages 1-2 (touch ruling) and the plain M/L size on page 3; consistent with the touch ruling, but the digits
  shrink as the supports fade.
- Fade L: the fact under the tab sits **2.91 mm** from the left rule (CL-8 3 mm; 0.09 mm short, the r6 boxsign S nit class).
- Supports-off Independent S at the owner's 36 leaves 38.9 mm white (1.76 rows) and Test S 29.9 mm: at the ruled ceiling, accepted.
- boxsign Independent M centres "box + fact" per cell, so the fact x drifts about 5 mm down a column (r4-r6 nit, unchanged).
- Skip-strip and think-box terms still print at about 9 pt at every size (r5-r6, unchanged).
- The drawn array keeps one frame height per section (F2), so 0 ÷ 3 is an empty frame and 4 ÷ 4 one row in a 12-row frame; by ruling.

## Visual-quality bar (RUBRIC 6.1)
1. Representation: ÷ as count-by: 12-dot tally (touch), strip to 12 x in two lines of 6 (skip, F3), related × fact (think), operation box
   (boxsign), true array with the subitising gap after rows 5 and 10 (F2, dividends <= 50). Yes.
2. Live parts: every support drawn on every item offered; the greyed array prints the plain fact. Yes.
3. One answer place: one line per cell in every section; the line's length varies by row on fade M page 3 (observation).
4. Type and stroke: Andika, black and white, one digit size a section. Yes.
5. Paper = screen: not covered (print-only round, `--no-screen` per brief).
6. Title: "I Can divide using times facts" / "I Can divide by 2-4" / "Test A: dividing by 2-4" follow the options. Yes.
7. Own renders: every page graded was rendered on 17ce2fe1 for this round.

## Process rule 00

**Automatic checks that would have caught each finding**
1. R7-1: EB-TESTCAP in `ws-empty-band`: for each div_facts section x size, Test count >= Independent count (render both, compare), and EB-PAGE
   reported as white minus the 6.9 mm floor against the row pitch, so a near-row is visible.
2. R7-2: fact-to-slot gap spread across all pages of a fade packet <= 1 mm (EB-FACTX's vertical twin), and EB-FADE-CAP: the bare last stage
   holds the Independent count at that size.
3. Both are "one page holds fewer than its sibling page of the same content": a sibling-capacity check (same facts, two roles or two stages)
   catches the whole class without a per-ruling rule.

**Speed-ups this round revealed**
1. A new layout rule (the 11-09 under-tab start) was verified on the case it was made for (skip L, fade L side pad) but not on the page it
   reshaped (fade L page 3 capacity): after a layout ruling, re-run the capacity comparison on every page the rule touches.
2. A constant that sets room (FACT_TEST_ROOM 1.15) should be checked against the count it is meant to produce (the ruling names the count, not
   the room): assert the count, not the room.
3. Critic kit: `git archive <base> | tar -x` into the scratchpad plus a node_modules symlink gives a base render without a git worktree
   (regression in 1 minute); the measuring script (`meas.py.txt`) needed a longest-run test for grid rules because the skip strip's box tops
   span more than half the page width.
4. Browser time: 6 grade-render runs at about 95 s each + 2 packets + 6 regression runs, about 14 minutes one at a time.
