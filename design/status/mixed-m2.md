# Mixed practice — phase M2, engine (lane status)

Branch `claude/sweet-newton-c8wrv1-mixed-m2` (engine builder, Opus medium: first build of the mixed packer, §1.7 / Q-S7).
Plan: `design/IMPROVEMENT_PLAN.md` §3.3 / §3.5 M2. Owner 2026-10-31: "mix by section (with specified amount of problems)
and also mixed each problem (with specified problem distribution as well)".

## What the engine does now
- `arrangement: 'mixed'` mixes ANY 2+ skills (no fallback for a legacy drawing, another count across or taller boxes; the
  one fallback left is examples on, M4's). M1's one-size-class page is unchanged when no count / page count is asked.
- `js/modules/sheet/mixed-pack.js` (pure): size classes (k across the lattice N, span N / k, height at k); groups that may
  share a shelf (H13 on the drawing, NAT_MM pads); 2-row shelves (a tall box beside a block of small ones); one-row shelves
  for small boxes left over; turns (a block of small boxes is one); interleave over turns; numbering shelf, block, inside the
  block (PT-MIX-7); exact counts split over pages (two of each, least-loaded page); one unruled trailing area per short
  shelf (PG-15).
- A cell that does not say its task gets the skill's library instruction shortened by rule (`shortCue`, `.ws-mixcue`).
- Exact counts: 2+ sections each with `count` print exactly; pages are added with a note (Q-M2). Also on Sections pages
  (whole shelves where a count across allows it, else one trailing area).
- `pages` asks for that many full mixed pages. `fits.perPage` = problems one page holds for the mix.
- Independent / More practice with `arrangement: 'mixed'` and 2+ skills: planned by the mixed packer, in the role's tab.
- R1-7: S > M > L on Mixed and Sections (the lattice N above 6; a one-skill page any count across up to N; TY-30 working
  digits for facts at every k; the ladder against the next size up, forecast from the same probe; no rounding spill).
  `fits.cols` on Sections = the count across printed.

## Checks
`js/modules/sheet/mixed-m2.check.cjs` (`--quick` for fix rounds; on `ws-precritic --role mixed-practice`, with M1's
`mixed-page.check.cjs --seeds 2`). Backtest: base tree 5c6063a FAIL (170 failures: arranged, exact counts, problems
printed, ladder, fits.cols, fill-page spill, the practice roles); this branch OK (128 pages, 46 scenarios). Warnings kept
visible: runs above the even-spacing figure where a shelf of tall boxes forces them (the page notes them), and
pre-existing H13 on Sections shelves of `fractions:identify` and I Can L facts.

## Open (M5 / owner)
- `multiplication:multiply` still draws with the legacy template: on a mixed shelf its stack starts about 4 mm lower than a
  kit fact and its digits are the legacy size. Migrating it to the kit fact cell fixes both.
- Sections H13 on grouped frac-model / I Can L fact shelves (pre-existing: a grouped shelf takes its skill's tallest cell).
- `decimals:add_decimal` one-skill page prints the same count at S / M / L (its drawing does not shrink); S >= M >= L holds.

## Gates (c951580)
- `mixed-m2.check.cjs` full: OK (127 pages, 46 scenarios); `--quick` OK. Backtest on 5c6063a: FAIL (170).
- `mixed-page.check.cjs --seeds 2` (M1): OK (72 pages). `interleave.test.mjs`: 13 pass, 1 pending.
- `ws-boot-smoke` OK; `ws-code-snapshot` OK (731 codes, none moved).
- `ws-print-lint --source kit`: 457 findings in 33 of 220 documents, per-document counts identical to 5c6063a.
- `ws-print-lint --source kit --roles mixed-practice` (precritic sample): L 65 / 8 docs, S 92 / 9 docs - identical to 5c6063a;
  red in `ws-precritic --strict` only because the role's pages were never pinned (pre-existing).
- Byte-identical vs 5c6063a: 26 of 44 baseline requests (single-skill independent, grouped independent, more practice,
  guided, review, lesson packets at S and L, Mixed practice Sections at M Daily / L Daily). Moved (R1-7, on purpose): every
  Mixed practice Sections page at S, the I Can M / L pages of fact or word sets, the pages that spilled to page 2 on rounding
  (a-S daily, a-S / a-M I Can, three-M daily), and the one-skill Mixed practice page at S (add_facts 20 -> 56).

## Round 1 rebuild (engine fixer, Opus medium after the failed critic r1)
Defects -> fix -> check in `mixed-m2.check.cjs` (backtest: the new check against faf80ae, `MQ_ROOT=<faf80ae copy>`: FAIL,
437 failures; this branch OK). Per-defect backtest counts on faf80ae in brackets.
1. Weights bent to force S > M (6:24, 4:18, 18:6). `fillPage` holds every count within 1 of its weighted share (two of each
   the one exception, `withinShare`); among counts of the same total it prefers whole blocks. The size ladder is met only
   with the weights held: a tie says so in the notes ("no more than the next size up"); a page the weights leave short says
   "the foot of the page is left open". Check `weights` [28], ladder S >= M >= L with the note.
2. 2-digit x cell had ~19 mm under the rule. A legacy long procedure keeps a work zone (partial products + sum, 9 mm a row:
   27 mm for 2 x 2), on Mixed AND Sections shelves; a shelf of work cells alone takes the page's spare height. Check: space
   under the lowest rule >= the zone (`--mq-work`, or 27 mm for a legacy n x nn) [192].
3. Stripes. Every whole block of small boxes sits beside the tall boxes; a short tall box swaps into a shelf where both fill
   (H13). Check `stripes`: tall-only shelves while a block's worth of small boxes prints in a row [12].
4. multiply on the legacy stack. `multiplication:multiply` table facts (both factors <= 12) now draw on the kit fact cell
   (gen-operations `_applyKitFactCell`). precritic --skill multiplication:multiply: 6 FAIL before, 4 FAIL after (lesson
   print-lint S / L fixed; nothing new; options-render "across @S" still fails, now 12 vs 20 instead of 16 vs 20).
   content-audit multiply OK. Check `align` across templates (first rule y, 1 mm) [117]; the rule finder now reads top
   borders too (the kit fact's rule is a border-top - the old align check never saw it).
5. Run note wrong across pages; 3 + 0 splits. Pages split by whole shelves; a skill with fewer than two a page is spread one
   a page (or, where that costs a page, on fewer pages with a note); runs counted in print order across pages, the figure in
   problems. Checks: note figure = printed run [2]; no page without a skill that has one a page to give [3].
6. Cue named the wrong task. `itemCue`: the item's template task (frac-model write / pick / part / shade / sign), then its
   printText, then the library line cut to the clause the cell asks. Check `cue` [80].
7. 12:28 I Can L on 3 pages under "20 a page". fits.perPage = this mix's capacity (exact counts: their proportions, never
   below a printed page); no trailing slot before the last page. Checks [2] + [1].

Open: weights held cost problems on some fill pages (b-S 14 with the foot open, c-M 6: two word problems and four facts) -
the owner's rule; the notes say so. e-L (3:37) prints runs of up to 16 addition across the break (noted, true).
Renders: `design/status/mixed-m2/after/{a,b,c,d,e,g,sec-b}`.

## Round 2 (coordinator: under-filled pages, C2)
- Fill pages (weights only): the weights first (within 1); when no further problem fits at the weights, the rest of the page
  takes whichever skill still fits, closest to its share first, and the notes say so ("Addition fills the rest of the page:
  11 addition problems, 6 multiplying problems."). The size ladder may lean on the most compact skill the same way.
- Exact counts: the counts stay exact; a rebalance pass moves problems from the fullest page into a page before the last
  that is under 85 % full (both pages must still fit; no trailing slot made, except by a skill spread one a page).
- H13: a short tall box beside a block now trades places with the block across shelves when no taller box can swap in.
- Check (partner to `weights`): the body is at least 85 % used on a fill page and on every page but the last of an
  exact-count print. Backtest on a1254b8: FAIL (b-S fill pages 30 % free x2, c 5:14 page 3 of 4 19 % free); this head OK.
- Left: b-S / b-M still end in a tail row of 3 facts + a trailing area (a 4th fact would make a block, and blocks go into
  2-row shelves); the page body is above 85 %.

## r4 engine rebuild (builder, Opus medium, 2026-11-03) - NOT clean, see "Open"
Engine: the shelf / column block packer is gone from Mixed up pages (`roles/mixed-practice.js` planMixedM2 / m2Counts):
ONE grid a page on a lattice of 12 x C units, ONE count across C for the print (`req.columns` or the sections'
`columns` -> `input.mixColumns`; Auto = the C whose page holds the most of this mix, capped at FACT_AUTO_COLS
10 / 6 / 5, reported as `fits.across`), the order over the whole print first (orderOf), then rows of C problems in
that order; each box as wide as its measured drawing needs, the row's rest shared equally (a fact never wider than
its drawing / 0.5 while another box can take it); a long procedure / word problem 1.45-1.6 x the small boxes stands
two rows tall where it falls and counts in both rows; on an exact count of 2+ pages whose last row would be short,
the last boxes of the row before stand two rows tall (every full row C problems); a short last row (one page, or a
fill page) is its own left-aligned grid closed on its right (`grid.js` `left` / `bottom`, additive inline styles,
`answer-key.js` passes them); row height = tallest box, spare shared up to each row's H13 ceiling, then (blank
> 18 mm) evenly; facts and legacy stacks at the fact ladder's digits for C (never under the size's working digits);
answer rules of one row aligned by a laid-out pass in print-sheet.js (`mixedRulePads`, up to 3 rounds).
Owner's set (41 = 7,7,7,7,7,6, Daily): S 6 across 30 + 11; M 5 across 25 + 16; L 4 across 20 / 12 / 9.
One-section Independent / lesson / more-practice pages byte-identical (5 samples, md5).
Open (red): mixed-m3 full 9 (g Sections frame 6 - the measure takes only the first band as the frame, Sections
plan untouched; o columns-4 M fill 2 - 28 pt facts / legacy stacks at 4 across are 42 mm, 5 rows = 20 < 23, and 24 pt
legacy stacks fail width at 46 mm: no layout satisfies fill + width + digits; o L page 2 fill 1); mixed-m2 --quick 60
(H13 on fill pages b / c where the dealt boxes differ from the probe's; Sections d frac-model H13 4 pre-existing;
c 5:14 "no s0 on page 5"); ws-teacher-plan-match 1 (add_facts + word problems 20: 5 pages where a page holds 5);
backtests for frame / shelfw / fill not added.

## r5 fixer (Opus medium, 2026-11-03) - mixed-m3 green, mixed-m2 still red (root cause below)
- Pages: where the last page of a print of 3+ pages holds under half the fullest, the same pages take the rows' blocks
  EVENLY, earlier pages rounded up (owner L 41: 20 / 12 / 9 -> 16 / 16 / 9); else the old PT-MIX-9 pass.
- Owner 2026-11-03 Columns modes: `columnsMode` 'exact' | 'aim' | 'auto' on the request or a section ('smart' / absent /
  non-number = auto; a number with no mode = exact); 'aim' = the largest C <= n every problem's box fits; a page with any
  cell that is not a fast fact is never 7+ across (LARGE_MAX 6, Auto too); fits.across, fits.columnsMode, and
  fits.clamped + fits.asked when capped.
- Exact prints over several pages report perPage = the fullest page of THAT print (ws-teacher-plan-match "filled": 20
  add_facts + word problems = 5 pages of 4, not "a page holds 5").
- Missing-number wrap (item 6) NOT fixed: a no-wrap floor from the measured heights (a box never narrower than the
  count where its height grows) sent the owner's S set to 4 across, 16 a page, 3 pages - reverted. The measure reports
  a wrapped line as "fits"; the fix belongs in the measure (a one-line flag) or in moving the skill to the kit equation
  cell (lead's note).
- Backtests: mixed-m4-frame / -shelfw / -fill (fail: mixed-m4/{owner-S,b-S}.fail.html; pass: r5 captures
  mixed-m4/{owner-S,b-S}.pass.html).
- Gates: mixed-m3 full OK (69 scenarios, 0); mixed-m2 --quick 40 FAIL (was 60; c S gone with the 6-across cap).
- ROOT CAUSE of the mixed-m2 reds (two attempts, both reverted: a swap pass moving a long procedure along the order so
  it stands two rows, and a fill-page tail of facts after it): on b (facts + 2-digit x) and c / d fill pages the facts
  are ~50 mm and the long procedure 74-87 mm, so H13 holds only where every long procedure stands two rows tall; a
  two-row box in a C-track grid skips the row under it, so the facts run ~2 (C - 2) in a row, longer than the forced
  minimum run mixed-m3 `runs` allows (ceil(major / (minor + 1))); and a long procedure in a page's last row cannot
  stand two rows. Every order that keeps runs <= forced leaves one H13 row; every order that clears H13 breaks runs or
  fill. Needs a ruling (or a three-row span / a row of long procedures only, which also breaks runs), not a tweak.
  c 5:14 exact (word problem beside one fact a row: the fact at 40 % of its box) is the same class: a word problem
  needs a 3-row span beside facts (gridOf spans at most 2).
- Not done: engine items 7a-7d (Independent clamp / per-cell outline / parts across pages / row stretch) - budget.

## r6 builder (Opus medium, 2026-11-03) - layouts A / B / C built; A and C NOT green (check conflicts, see "Open")
Engine (`roles/mixed-practice.js`): `req.mixLayout` -> `input.mixLayout` (print-sheet normalises 'rows' | 'grid' | 'even',
absent = 'rows'); `planMixedM2` / `m2Counts` dispatch to `planRowsA` / `rowsCounts` (A), the r5 grid unchanged (B, now
reports `fits.mixLayout: 'grid'`), `planEvenC` / `evenCounts` (C). M1's one-size-class page is kept for A and B (its
cells carry `data-ws-kind` under A: 'fact' when every box is a fact drawing); C always takes the M2 engine.
- A: kinds - 'fact' by skill name (`*_facts`, `multiplication:multiply`; a preset is judged by its own id, so
  `mult_2by2_standard` is not a fact), the rest grouped by measured box (count they fit up to 4, height within 1.45 x).
  Each kind its own count across (facts up to 10 / 6 / 5 at S / M / L, larger up to 4, more - never 7 - only where the
  widest box fills under half its track), each box as wide as its drawing needs (the row's rest shared; `shareRow`),
  page lattice lcm(C) x k <= 144 units (a unit stays wider than the rule). Exact counts: the counts across chosen so as
  few kinds as possible end short (`chooseC`, within a third of each kind's own count, digits kept), the short row(s) at
  the end of the print, each its own left grid. Rows alternate (`scheduleKinds`, runs <= the forced minimum); within a
  kind the skills interleave (`seqOf`). Pages greedy by whole rows; evened where the last page holds under half and every
  page before it can still be filled within H13; rows grow within H13, then evenly (> 18 mm); an exact count's last page
  is not stretched. Fill pages: whole rows of every kind, the most problems within 10 % of the fullest page, then the
  weights closest (notes say which skill fills the rest). `data-ws-kind` on every cell (additive: `cell.js` / `grid.js` /
  `answer-key.js` pass `kind` only when set). `fits.mixLayout`, `fits.acrossByKind`; exact multi-page perPage = n / pages
  rounded up. Kinds / counts across cached on the input (`mixRowsC`) so the probe and the dealt page agree.
- C: B's count across, rows of C in the interleaved order, ONE box height (the tallest drawing; a long procedure's work
  room taken away), spare shared equally on every page but an exact count's last; note says long problems have less room.
- Columns: 1-10 now (print-sheet clamps 1, not 2). Owner addition: `defaultColumns: {S, M, L}` on a provider or its
  footprint is READ (print-sheet -> `input.mixDefaultCols`) as a kind's Auto count; none is declared yet.
- `export const MIX_LAYOUTS = ['grid']` in print-sheet.js (lead's request: only layouts whose checks pass).
- `tests/scripts/ws-mixed-render.cjs --layout rows|grid|even` (and it prints page loads, layout, across by kind).
Owner's 41 (7,7,7,7,7,6): A S 40 / 1 (fact 7, large 4), M 30 / 11 (fact 6, large 4), L 20 / 20 / 1 (fact 4, large 4);
B S 30 / 11 (6), M 25 / 16 (5), L 16 / 16 / 9 (4); C S 30 / 11 (6), M 25 / 16 (5), L 20 / 20 / 1 (4).
Gates: mixed-m3 full 17 FAIL (78 scenarios; every other scenario clean, B clean), --quick 15; mixed-m2 --quick 7 FAIL
(was 40); ws-teacher-plan-match OK; ws-teacher-arrangement OK; ws-boot-smoke OK; ws-code-snapshot OK; mixed-page
--seeds 2 OK; ws-simple-print OK; one-section Independent / lesson / more-practice md5 identical (5 samples).
Open (each needs a ruling or a check fix - not an engine tweak; no check was edited):
1. A short row is measured as a FULL row. mixed-m3 `fullRows` / `rows.usedFrac` compare a row's cells with ITS OWN
   grid's width, so the print's short last row (its own left grid, r4) counts as full: "full rows of kind 'large' hold
   4 / 1". A short row inside a full-width grid instead fails `boxes` (its trailing area is an empty enclosed area), and
   a narrower grid anywhere but the very end fails `shelfw`. So with an exact count that no fitting count across
   divides (the owner's 13 larger problems: prime; C Even 41: prime) every layout without two-row boxes fails `kinds` /
   `columns` / `across`. Fix proposal: judge "full" against the frame's inner width.
2. Two kinds that both end short (owner M: facts 28 at 6, larger 13 at 4; Columns 6 S) - the counts allow no count
   across that divides both; the second short row is a second short grid (`shelfw`).
3. Columns 1 (`c columns 1 M`): a fact box the page width holds a 26 mm drawing (14 %) - `width` (>= 45 %) cannot hold.
4. mixed-m2: c 5:14 ican M (4 / 9 / 4 / 2) and d 6:9 S (14 / 1) - balance ("within half") vs C2 fill (85 %) vs H13: the
   only balanced pages leave a page under-filled or its boxes stretched past H13. Sections d frac-model H13 (4, the
   Sections packer, pre-existing) untouched.
5. A one-size-class page (e.g. add_facts + subtraction:subtract, mixed-page check) keeps M1's shelves under A, its
   cells all one kind - the owner's name rule would split subtract out; ruling needed (mixed-page check is M1's).
6. The 41st problem alone on page 2 at S (and 1 at L) - the owner's set needs one row more than a page holds.
7. Missing-number legacy cells wrap at 5-6 across (r5 item 6, unchanged); visible in C.

## r6b fixer (Opus medium, 2026-11-03) - remainder rebalance (owner: no row under half full)
Engine (`roles/mixed-practice.js`):
- A: `rowSizes` - a kind's remainder under ceil(C / 2) takes its last full row into two rows of at least half (4 + 1 ->
  3 + 2, 6 + 1 -> 4 + 3); `orderKinds` - every kind's short rows form the tail (all distinct tail orders tried, least run
  excess; one short row keeps the r6 schedule byte for byte); `chooseC` prefers counts across whose rows can alternate;
  pages: the tail rows are carried onto the LAST page, and a last page of one short row takes a whole row from the page
  before while that page still fills within H13; a short row of half its count or more is drawn >= 52 % of the frame.
- C: `evenSizes` - a remainder under half takes full rows into EQUAL rows of at least half (5 + 1 -> 3 + 3, 4 + 4 + 1 ->
  3 + 3 + 3) in one left grid (C allows only the last grid short); pages share the full rows evenly, the short rows with
  the last.
- `MIX_LAYOUTS = ['grid', 'even']` (B and C green in mixed-m3).
Owner's 41: A S 36 / 5 (fact 7, large 4), M 28 / 13 (fact 5, large 4), L 20 / 21 (4, 4); B S 30 / 11, M 25 / 16,
L 16 / 16 / 9; C S 30 / 11, M 25 / 16, L 16 / 16 / 9.
Gates: mixed-m3 full 6 FAIL (was 7; 78 scenarios; rowfill 0; C, B, Columns 6 S and A M clean); mixed-m2 --quick 5 FAIL
(was 7; d 6:9 S gone); ws-teacher-plan-match, ws-teacher-arrangement, ws-boot-smoke, ws-code-snapshot, mixed-page --seeds 2,
ws-simple-print, ws-columns-one OK; one-section md5 identical (5 samples).
Open (needs a ruling; no check edited):
1. A at S, L and Columns 4 M: mixed-m3 `kinds` - the large kind's remainder (13 at 4) is two short rows that both end the
   print (shelfw: short grids only at the end of the last page), so they stand together - a run of 2 where the forced
   minimum is 1; facts take no short row to sit between them at the allowed counts across (S facts 7 / 6: 28 = 4 x 7 or
   5 rows -> no alternating order exists; L facts 4 only; Columns 4 fixed). Proven by enumeration, not a tweak. Ruling
   options: the remainder's two rows count as one for the run rule, or a kind's tail pair may stand together.
2. mixed-m2 c 5:14 ican M 4 / 9 / 4 / 2 (word problems 2 across, one fact row of 5): page 1 (I Can header) holds 2 word
   rows, the fact row only fits beside them on page 2 - untouched. Sections frac-model H13 (4, pre-existing) untouched.
