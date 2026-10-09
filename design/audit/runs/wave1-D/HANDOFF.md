# Wave 1 Lane D (print backlog): handoff, 2026-10-09

Branch `claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535`. Paused on owner request ("when you are done with these please shut down")
after fix round 10, with critic round 9 NOT yet run. Not merged, not deployed.

## State

- Lane tip: CL-40 label keep-out (`96479e3`) on top of critic round 8 (`ffbe879`). Main branch `claude/sweet-newton-c8wrv1` merged in at the start of this session.
- Critic history: round 3 4/15 pass, round 4 8/15, round 5 14/16, round 6 15/16, round 7 all Independent + every screen host pass (failed on More Practice and build time), round 8 12/16 everywhere (four defects, below). Full reports in `critic.md`.

## Done this session (all on the branch)

- **Cross-skill state leak (the brief's first item):** per-page generator choices (`gen-counting` offsets/permutations/held values, `gen-time-money` a.m./p.m. blocks, `gen-algebraic` sequence step, `gen-operations` fact-set offset) were redrawn only when that generator ran on item 0, so a pool page reused the previous page's choice. `page-deal.js` gains `onNewPage()`; `resetPageDeals()` runs every registered reset. `ws-sheet-determinism` OK at S and L.
- Rounds 4 to 10 fixed: doubled answer places, Size S density, number families (kit `number-family` cell, order-free dedupe, screen host on the kit cell), missing-number skills (every unknown a box, titles), mult_comparison (× / ÷ stories only, one sign place), mixed pools (column work in whole rows, legacy members skipped, giveaway hint removed), closed frame with holes removed by layout, 6 mm boxes, More Practice (each letter filled as its own page, no repeats), pool build time (mixed_multiplication S p90 25.6 s → 0.9 s; longest blocking task 56 s → 0.75 s; new gate `ws-sheet-timing`), smaller dot arrays, CL-9a numbering, CL-40 tab keep-out.
- Lint tightened only: L-ANSAREA, HOLE, REPEAT (order-free), PAGEFILL on the problem area and on multi-grid / More Practice pages, POOL-MIN, L-KEY AK-2 (key ink inside its box), CL-40 keep-out, `--seeds N`, `--letters`.

## Owner rulings this session (recorded in `WORKSHEET_DESIGN_STANDARD.md` and `design/STATUS.md` §2)

- **CL-2a:** 2 × 9 / 2 × 10 for a single-skill page capped by its own distinct problems, "as long as it looks good".
- **CL-2b:** 3 × 10 at S for short one-line pages. More than 26 items: numbered 1 to N throughout.
- **CL-9a:** problems numbered by default with the CL-30 tab. Letters only for the parts inside one problem. Implemented: `LOOKS.ican.label = 'tab'`.
- **Density target:** dot arrays L 4–6, M 6, S 8. Number families L 6, M 8, S 8–12. Dots stay countable; boxes at least 6 mm.

## Gates (last full runs)

| Gate | Tree | Result |
|---|---|---|
| ws-print-lint `--source kit --seeds 10`, S and L | `079843a` | 0 findings / 281 docs each (baseline was 463 findings in 33 docs) |
| More Practice lint, 16 lane skills, `--letters A,B --seeds 10`, S and L | `079843a` | 0 / 43 each |
| ws-sheet-timing, ws-sheet-determinism (S, L) | `079843a` | OK |
| ws-layout-unit, lint self-test | `96479e3` | OK (564), OK (55) |
| focused lint: mult_comparison, remainder_interpret, mixed_multiplication at S, M, L | `96479e3` | 0 findings |
| ws-boot-smoke | `96479e3` | OK |
| ws-screen-answer (16 lane skills), ws-screen-slots, ws-share-options, ws-code-snapshot (608), ws-content-audit | `cf39d5d` (round 8); later rounds did not touch the screen or generators beyond what their builders re-checked | OK |

**Not run on the final tip:** the full kit lint at S, M and L after `96479e3`, and critic round 9. Two attempts at the full three-size lint were cut off by container restarts.

## Open: next steps, in order

1. **Size-M density (critic round 8, D8-2 / D8-3 / D8-4):**
   - D8-2: cap dot_array_mult at S 8 / M 6 / L 6.
   - D8-3: number_families_add should print 8 at M; it prints 6.
   - D8-4: missing_add_sub Independent M leaves a 29 % strip.
   - Sweep every lane skill at M; the lane lint never ran at M before round 8.

   The round-10 builder's unfinished, UNVERIFIED work for these is saved as `wip/r10-density-UNVERIFIED.patch` (print-sheet.js, family.js, layout.js, practice.js). Apply it with `git apply`, verify, and finish it. It is not on the live code path.
2. Run the full kit lint `--seeds 10` at S, M and L on the tip.
3. **Critic round 9** (fresh mq-opus-medium). Grade the 16 lane documents on Independent and More Practice, at S, M and L, at many seeds, plus every screen host.
4. **Before deploy:** `ws-stamp-assets` (css/sheet-kit.css, css/screen-cell.css and many modules changed). That is the main session's job.

## Questions for the owner (with suggested answers)

1. **DN-2 lint (More Practice letter A vs letter B item counts).** Critic rounds 7 and 8 call it a false positive, because each letter is its own sheet (PT-MPR-1). Suggested: allow DN-2 to compare pages within one letter only. This loosens a lint rule, so it needs your yes.
2. **number_families_mult default band "5 × 5"** holds only 10 families, so S prints 8 in 2 × 4. Suggested: add a "6 × 6" band choice. Keep the default, so share codes are unchanged.
3. **Out of lane, noted by critics:**
   - The kit-wide missing-digit box is 4.1 mm wide with a solid outline. The standard asks for at least 4.4 mm and a dashed outline.
   - The remainder_interpret remainder box is one digit wide.
   - mult_properties has a double answer place.

   Suggested: a separate lane.
