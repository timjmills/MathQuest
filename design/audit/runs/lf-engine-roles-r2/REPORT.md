# lf-engine-roles re-critic r2: FAIL

| | |
|---|---|
| Graded | claude/sweet-newton-c8wrv1-lf-engine-roles @ 27b8e540c, against master 7a5bc902c |
| Method | `ws-grade-render --sample spread.json --no-screen`, role Opener, seed 4242, sizes M and L; the 18 proof PNGs |
| Critic | medium, independent |
| Saved by | lf-engine (the critic's Write was refused) |
| Lowest score | C3 = 5 (RUBRIC H5) on coordinate_q1 L, and on the other Opener pages split across two pages from legacy cells |

## Summary

**What the fix gets right**
- No cell is squashed any more.
- Master's overflow and split-cell faults (PG-12, PG-13 and PG-21) are gone on the linted L documents.
- The Openers that print more items are a clear gain.

**What fails**
- The page-2 move turns one squashed page into two half-blank pages.
- On coordinate_q1 the Model and the Guided cell would fit side by side, which is the layout the lead allowed.

## Scores

C1 is ease, C2 teaching, C3 spacing, C4 fidelity. Counts are Model / Guided / Independent.

| Page | Before → after | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| coordinate_q1 M | 1 page → 2 pages; page 1 54 % blank; page 2 G1 I1 | 7 | 7 | 6 | 6 | no |
| coordinate_q1 L | squashed (PG-13 ×6) → 2 pages, 52 % / 51 % blank; one Guided cell alone on page 2 | 7 | 6 | 5 | 6 | no |
| placevalue:compare M | rows held to their ink, about 57 % used | 8 | 8 | 8 | 8 | yes |
| vocab_grade_pictures M | squashed Model → full width | 8 | 8 | 8 | 8 | yes |
| placevalue:mixed_placevalue M | same on both trees, 1/2/0, about 48 % used | 8 | 7 | 5 | 8 | no (not this lane, F4) |
| add_wp_10k M | overflow → page 1 62 % blank | 8 | 7 | 6 | 8 | no |
| bar_graph M | overflow → page 1 57 % blank | 8 | 8 | 7 | 8 | no |
| elapsed_visual_easy L | overflow → page 1 53 % blank | 8 | 8 | 7 | 8 | no |
| multi_step_word L | page 2 body still overflows by 2.1 mm | 8 | 7 | 6 | 7 | no |
| round_sort_10 M | → G3 I3; page 1 56 % blank | 8 | 8 | 7 | 8 | no |
| round_sort_10 L | 6 split cells → 2 pages, 49 % / 42 % blank, Independent 0 | 8 | 7 | 5 | 8 | no |
| shape_name_match_3d L (legacy cell) | 2 pages about half blank; one cell alone on page 2 | 6 | 6 | 5 | 5 | no |
| integers:add_int M | 1/1/0 → 1/2/2, 96 % used | 7* | 8 | 8 | 8 | yes for the lane |
| nl_add M | 1/1/0 → 1/1/2 | 8 | 8 | 8 | 8 | yes |
| nearest_million L | 1/1/0 → 1/2/2 | 8 | 8 | 8 | 8 | yes |
| order_clocks_digital_asc M | 1/1/0 → 1/1/2 | 8 | 8 | 8 | 8 | yes |
| fraction_of_set L | 1/1/0 on one page on both trees | 8 | 7 | 8 | 7 | yes |

\* The skill's own crowded −23 to 1 number line (F6).

**Keys:** every key opened has the same pages and geometry as its pupil page. Two keys print raw JSON as the answer (F5); that is owned by the skill.

## Findings

### F1 (blocking, this lane): two half-blank pages where a side-by-side row fits

Seen on coordinate_q1 L, and on every split of a legacy cell (shape_name_match_3d L, round_sort_10 L).

**Cause:**
- `hMinAt([first], 2)` returns Infinity because the legacy footprint declares one column.
- But the printed ink is about 78 mm wide, which fits a 93 mm half cell.

**Fix:**
- Before splitting, try the Model and one Guided cell side by side, sized from the measured ink width.
- When the page does split, page 2 also takes the second Guided row and the Independent rows.

**Check:**
- Add L-DENSITY (DN-2, LONE, PAGEFILL) to the OPENER-OVERFLOW ratchet.
- Add a new OPN-SPLIT lint: a split Opener page under 50 % used fails unless the plan notes say the side-by-side row was tried.
- The backtest must FAIL on 27b8e540c.

### F2 (major): "both pages close" is false for multi_step_word L

The body overflows by 2.1 mm on page 2. The ratchet compares counts only, and master already had PG-12 ×2 on this document, so the overflow is hidden.

**Check:** key the ratchet on (lint, rule, page), or run `ws-grade-render --gate` on every split Opener.

### F3 (major): page 1 of a kit-cell split is only 38–49 % used

Scored 6–7, because nothing more fits page 1 at the measured heights. On add_wp_10k M, a split Model band (PT-OPN-2) would free about 38 mm, enough for one Guided row.

**Check:** OPN-SPLIT, plus a "% used" list for page 1 and page 2 in the proof README.

### F4 (lead's question): mixed_placevalue M

The change claimed in the README did not reproduce: both trees print 1/2/0 at seed 4242.

**Ruling:** with only two practice items dealt, G2 I0 is correct. PT-OPN-6 requires 2–4 Guided cells, and PT-OPN-7 makes Independent optional. So G1 I1 would break PT-OPN-6.

The page still fails H5 because of the 3-item deal; route that to the mixed-pool owner.

**Checks:**
- PAGEFILL on a one-page Opener whose notes say "the deal came up short".
- L-OVERLAP RULE for the faint hairline.

### F5 (skill-owned, already on master): raw JSON on keys

The coordinate_q1 and shape_name_match_3d keys print raw JSON as the answer. On shape_name_match_3d the "Answer:" line also overlaps the word bank.

**Check:** L-KEY fails any key slot matching `^[\[{]"`.

### F6 (skill-owned, already on master): number-line labels touch

On add_int, the −23 to 1 number-line labels touch each other.

**Check:** L-OVERLAP on tick labels.

### F7 (process)

- `ws-precritic-plan` lists three lf-engine-roles ledger rows as FAIL (warnings): `roles-mixed-size-order` is missing from backtests.json, and the row retiring MIX-S has no backtest or exemption.
- Two README claims did not reproduce: the mixed_placevalue change, and fraction_of_set L on 2 pages.

**Check:** the ws-backtest proof step re-derives every README count claim from the sweep file.

## Previous round

| Finding | Status |
|---|---|
| B1 | Resolved |
| N2 | Resolved (`modelTight` applies only with one Model) |
| N3 | Resolved for the sweep (see F7) |

## fraction_of_set_hard flake: confirmed order-dependent

**Alone, OK at both sizes:**

```
node tests/scripts/ws-print-lint.cjs --source kit --skills fractions:fraction_of_set_hard --roles opener --size M --lints L-OVERFLOW,L-SPLIT --baseline design/audit/baselines/opener-overflow.M.json
```

The same command with `--size L` and `opener-overflow.L.json` is also OK.

**Long run, FAIL with three rises (PG-12 0→2, PG-13 0→6, PG-21 0→4) on both the branch and master:**

```
SK=$(grep -E "^[a-z_]+:[a-z0-9_]+ [ML] \|" design/audit/runs/lf-engine-roles/proof/opener-sweep-all-skills.txt | awk '{print $1}' | sort -u | paste -sd,)
node tests/scripts/ws-print-lint.cjs --source kit --skills "$SK" --roles opener --size L --lints L-OVERFLOW,L-SPLIT --baseline design/audit/baselines/opener-overflow.L.json
```

So the harness leaks render state between documents. The ratchet's pinned 0 for this document holds only when it runs alone.

## Gates the critic ran

| Gate | Result |
|---|---|
| `ws-backtest --row roles-opener-overflow` | OK (660 s). Narrow: overflow and split only |
| `ws-precritic-plan` | OK (249 rows), with the F7 warnings |
| `ws-print-lint`, branch, 4 skills at L | DN-2 ×2, LONE, LS-4 ×34 (LS-4 also on master); 0 on coordinate_q1 |
