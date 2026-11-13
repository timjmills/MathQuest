# lf-engine live-pm2 — narrow independent re-critic (Opus medium), 2026-11-13

Branch `claude/sweet-newton-c8wrv1-lf-engine-live-pm2` @ df1677012 vs base 9135190b9. Graded from the committed
before/after PNGs in `design/lessons/proof/live-2026-11-13b/` (no own render; add_wp_10 L Mixed has no PNG and is ungraded).

## VERDICT: FAIL (min 5) — items 1-5 pass, item 6 fails and is WORSE than before, item 7 not evidenced

| Page | Size | C1 | C2 | C3 | C4 | min | vs before |
|---|---|---|---|---|---|---|---|
| div_facts p3 Practice | S | 8 | 8 | 8 | 8 | 8 | better |
| div_facts p4 Mixed | S | 8 | 8 | 8 | 8 | 8 | better |
| div_facts p3 Practice | L | 8 | 8 | 8 | 8 | 8 | equal |
| div_facts p4 Mixed | L | 8 | 8 | 8 | 8 | 8 | better |
| sub_wp_10 p4 Mixed | S | 8 | 8 | 8 | 8 | 8 | better |
| add_wp_20 p4 Mixed | S | 8 | 8 | 8 | 8 | 8 | better |
| add_wp_20 p4 Mixed | L | 8 | 8 | 8 | 8 | 8 | equal |
| fact_family_sort p4 Mixed | L | 8 | 8 | 8 | 8 | 8 | better |
| fact_family_sort p5 Mixed cont. | L | 8 | 8 | 8 | 8 | 8 | better (72 % -> ~13 % blank) |
| sub_100_regroup p4 Mixed KEY | L | 8 | 8 | 8 | 8 | 8 | equal |
| nearest_10 p5 Mixed | L | 8 | 8 | 8 | 8 | 8 | better |
| nearest_10 lesson sheet p2 | L | 8 | 8 | 6 | 7 | 6 FAIL | equal |
| nearest_10 lesson sheet p3 | L | 8 | 8 | 5 | 6 | 5 FAIL | WORSE |
| add_wp_10 Mixed | L | – | – | – | – | ungraded | – |

## What the fix got right
- Items 1, 2, 5: equation / missing-factor cells (div_facts L 13-14, S 19-22) and S story cells are centred; nothing drifts
  from its answer box. Story-cell equation frames in adjacent cells sit ~3 mm apart (4-line vs 3-line story) — was ~6 mm.
- div_facts S Practice "under" look: the answer line now sits at the cell foot, as on L Practice; each boxed cell still reads
  as one problem, the room above is the times-fact working room, the key puts the answer on the same line (facsimile).
  Minor: on Mixed the div cells are inline (`= ____`) at S but under-look at L — not blocking.
- Item 3: fact_family_sort L continuation page now carries Addition 7-8, the bonds and the Subtraction row (~13 % foot).
- Item 4: nearest_10 L Mixed T|O heads and place-value T O heads clear the number tab (~5 mm).
- Keys checked (div_facts S p3, add_wp_20 S p4, sub_100_regroup L p4, nearest_10 L p5, nearest_10 sheet p3) are facsimiles.

## Blocking findings
1. **nearest_10 L lesson sheet p3 (item 6) — tab covers content, worse than before.** The new third Independent row
   (items 10-12) draws the black number tab right over the "T" column head: the T is hidden in all three cells. Rows 4-9
   (pre-existing) have the tab touching the T. The rows are squeezed to ~30 mm while the page below them is ~27 % empty.
   *Check:* TAB-CLEAR (ink, >= 2 mm) must run on lesson SHEET pages (independent / guided blocks), not only on Mixed —
   rect of `.ws-tab` vs every inked glyph rect in the cell; overlap or gap < 2 mm = fail. Add the sheet p3 to the backtest.
2. **nearest_10 L lesson sheet p2 unchanged at ~35 % blank foot; p3 ~27 %.** Two pages each about two-thirds full is not
   acceptable when the Independent rows are cramped enough to collide with their tabs: the slack should go to row height
   (tab clearance) or rebalance the blocks across the two pages. The builder's "one page cannot hold ~301 mm" is true, but
   it does not excuse a 35 % blank page next to squeezed rows.
   *Check:* SHEET-2PG must fail when a two-page sheet has a page >= 30 % blank AND any row on the sheet below its
   design height / with a TAB-CLEAR miss (slack + squeeze = fail); and require last-page rebalance (both pages within 15 %).
3. **Item 7 (add_wp_10 L Mixed) not evidenced:** no PNG committed. *Check:* the lane's proof list must name a before/after
   PNG for every claimed item (precritic: every claim id has a proof file).
