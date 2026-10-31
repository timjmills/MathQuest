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
