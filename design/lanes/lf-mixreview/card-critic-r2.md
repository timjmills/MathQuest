# Card critic r2: Mixed review (lf-mixreview @ dc0d5e73)

Independent critic, Opus medium. This critic did not write the card and did not grade r1.

## Scores

| Criterion | Score |
|---|---|
| K1 COMPLETE | 7 |
| K2 CORRECT | 6 |
| K3 BUILDABLE | 6 |
| K4 CHECKABLE | 6 |
| K5 TEACHER/PUPIL FIT | 8 |

**Verdict: FAIL (minimum 6).**

Verified true: `RETRIES = 40` (print-sheet.js 184); the rungs unique / answers / turn / repeat (4519); `dealCounts` (interleave.js 73); `parseSkillCodeParts` reads multi-digit weights (skill-codes.js 57–78); `allLessons` (337) and `unitLessons` (212); `AREA_ORDER` and `AREAS` with no `AREA_LABELS`; the 55ae9d090 R1 table matches §7a exactly; the 12.1 rows (wide 4 / 3, Review 12 / 8–12 and "2–3 sections", Mixed 7 / 5 rows); the PAGE_TYPES appendix ends at 15, so "16." is correct. I recomputed every §3 cell (pages, splits, Σ s_p) and found no arithmetic error.

## r1 re-check

| # | Status | Note |
|---|---|---|
| D1 | FIXED | ceil(N / 2) is used throughout. The wide-page case is in N3. |
| D2 | FIXED | w chooses which skills only; `adapt-counts` fixture added. |
| D3 | FIXED | Shelf-level adjacency, with the M1 item level. New contradiction: N1. |
| D4 | PARTLY | One dealer is named, but its page split is measured and size-dependent (N2). |
| D5 | PARTLY | The V1 freeze covers functions whose input, the measured n_p, is not frozen (N2). |
| D6 | FIXED | 4 / 3 a page; tables recomputed and correct. |
| D7 | FIXED | At most 3 skills a page. |
| D8 | FIXED | `count-ignored.json`. |
| D9 | FIXED | Nine `pool-*` fixtures. |
| D10 | FIXED | The labels assert exists, but its "no second copy" half is wrong (N5). |
| D11 | PARTLY | The §7a `grades` row still cites "`wrm-links` LESSONS → step". |
| D12 | FIXED | Per half, 1..5. |
| D13 | FIXED | `mix-review-sample.json`. |

## New defects

1. **Wide pages break the mixed-order rule by construction (K2, K4).** With s_p = max(1, min(3, floor(n_p / 2))), a page of 3 wide items has s_p = 1. That is every L all-wide page, and the 3-item pages at M all-wide. Each wide item is its own shelf, so these pages are 3 adjacent shelves of one skill. COUNT and POOL `adjacent` FAIL on exactly that, with no exception. **Fix:** say "no AVOIDABLE adjacent pair": a single-skill page is exempt. Write the same wording in §2, §7a Order modes, PT-MXR-4, COUNT and POOL, and add a PASS fixture for a single-skill wide page.

2. **The deal depends on measured, size-specific pages, which the code does not carry (K2, K3).** §2 takes n_p "from §3", and §3 says the real per-page count "is measured by the engine". Several things follow:
   - s_p, which skills share a page, the shelf order and so the printed order all depend on the size and on CSS / measurement.
   - The code has no size token (T N G R D A Q H W F X + V S O Y K P).
   - A screen host or a K<d> day rebuild therefore cannot know the page split it must match.
   - A release that changes a cell's height changes a V1 day's skills, against "skills, counts, order never change".
   - POOL runs `dealReviewItems` "in Node, no browser", but `measureItems` returns without `document` (print-sheet.js 2308).

   **Fix:** derive n_p from a frozen pure table, keyed by size and each skill's footprint size class (no DOM), as part of the V1 deal. Add a size token (for example `Z<m|l>`; Z is free). Hosts play the list in that order whatever the device. State what the layout does when the measured page cannot hold the dealt n_p: spill whole shelves and keep the numbering, never re-deal. Pin it in COUNT.

3. **Exact counts against whole shelves (K2, K3, K5).** A GROUPED shelf holds k cells, where k is a divisor of the lattice up to 6 (mixed-practice.js 81). Counts like 4 + 3 + 3 leave part-empty shelves, for example 4 stacks at k = 3. §3 also promises "as evenly as whole shelves allow", and §7a's "a shelf holds 2–5 cells" is not the engine's rule. **Fix:** decide one rule. Either a skill's last shelf may be short (state how it is drawn and where H13 allows it), or the counts snap to multiples of k with the remainder moved to another skill. Put the chosen rule in §2, PT-MXR-2 and a COUNT FAIL state.

4. **The week rotation contradicts itself (K2, K4).** "Every pool skill appears before any skill repeats" cannot hold beside "from Wednesday one skill a day is the comeback of a skill from two days before". With a pool of more than 5·k_d skills, Wednesday's comeback is a repeat while skills are still unseen. WEEK asserts the first rule outright. **Fix:** say "before any repeat other than the planned comeback", and make WEEK skip the comeback slots.

5. **The labels assert false-fails (K4).** "No area label string in `teacher-*.js` outside teacher-areas.js" already fails on master. `Geometry` appears in teacher-map.js 37 and teacher-library.js 1089, files this lane does not own. **Fix:** assert only that no file outside teacher-areas.js holds a whole `AREA_LABELS` map (the 11 strings together), or list the files allowed.

6. **One fixture per FAIL state, for all six checks (K4).** Only POOL meets it. COUNT lists 7 FAIL states with 1 fixture, SHARE 4 with 2, HOSTS 3 with 2, WEEK 3 with 1, BREAKDOWN 5 with 2. **Fix:** name a fixture for each FAIL state. Examples: `count-over-ceiling`, `count-4-skills`, `count-lone-shelf`, `count-key-cells`, `count-2up`, `share-moved-old-code`, `share-old-decoder-throws`, `hosts-wrong-total`, `week-missing-skill`, `week-day-differs`, `breakdown-dup-item`, `breakdown-sum`, `breakdown-screen-differs`.

7. **Adapt has no pool (K1, K2).** The code carries the DEALT list, not the pool or the filters. With P1, "dealt on each pupil's device" has nothing to sample k skills from. The default-ON "pupil starts Mixed review on their own device" names no pool source either. **Fix:** with P1, say that adapt samples from the code's listed skills only (the counts are then re-dealt by §2), or that P1 codes also carry the pool list. Say where a pupil-started mix gets its filters.

8. **Boss and race against a fixed N (K1).** Both games are timed against a moving opponent (boss-race.js 8, 57), not a question count. The card does not say what happens when the N items run out before the game ends, or the game ends before N. **Fix:** decide it. For example: the game ends at N, scored out of N; or it cycles the list in printed order. Add it to HOSTS.

9. **D11 residue (K2).** In the §7a `grades` row, replace "`wrm-links` LESSONS" with `allLessons()`.
