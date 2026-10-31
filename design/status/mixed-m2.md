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
