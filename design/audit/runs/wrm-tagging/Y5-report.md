# Wave 2 tagging: Year 5 (US Grade 4) — round 1 fixes

Output: `data/curriculum/links/Y5.json`, now **generated** by `tests/scripts/wrm-tagging/build.py` (ported from the Y4 lane,
critic r13). Base: `y5_r0.json` (the round-0 hand-authored file, a181f8a4). Hand fixes: `spec_a_crossyear.py`,
`spec_r1.py`. Fixes the defects of `Y5-critic-local-r1.md` (FAIL 6.30). Earlier rounds: `Y5-critic.md`.

## How to rebuild and check
```
python3 tests/scripts/wrm-tagging/build.py     # exit 1 on any problem; byte-identical output run to run
node tests/scripts/wrm-tagging/mergecheck.mjs data/curriculum/links/Y5.json <R.json> <Y1.json> <Y4.json> [...]
node tests/scripts/wrm-tagging/items.mjs <out.md> [stepIds]   # 6 print-path items per direct/partial skill
```
The build runs these passes:
1. keys.mjs and prior.mjs: live keys, tags and proposals; the Grade 4 sheet weeks. "3D shapes" is pinned to W26 for B10.S10.
2. The spec fixes.
3. A pre must cite a step its skill is tagged to, and that step must be taught by this school week. Otherwise it is
   re-cited, or labelled "nearest live practice".
4. `linkfit.mjs --fit` generates 100 print-path items for every pre and related link (5 seed sets). Each link must pass:
   - the size rule;
   - the Grade-4 first-taught table from the critic (W01 to W38);
   - later-grade content (decimal × decimal, fraction × fraction, triangle area, ratio, axis reflection, two-digit divisors…);
   - a degenerate-link test;
   - the why claims.
   A link that fails gets the nearest option set that passes: band or range, forms, units, decimals, or the table named in
   its why. If none passes, the link is dropped.
5. tagFixes are derived from a diff against live SKILL_WRM.
6. Every partial and gap step gets `envision` (name, kind, teaches, closes, representation), and every build proposal gets
   `closes`.
7. Gates: mergecheck, linkfit (0 misfits), optcheck.

## Counts
| Block | Steps | Full | Partial | Gap |
|---|---|---|---|---|
| Y5.B1 | 14 | 6 | 7 | 1 |
| Y5.B2 | 8 | 2 | 6 | 0 |
| Y5.B3 | 10 | 4 | 6 | 0 |
| Y5.B4 | 17 | 7 | 9 | 1 |
| Y5.B5 | 11 | 4 | 7 | 0 |
| Y5.B6 | 7 | 3 | 3 | 1 |
| Y5.B7 | 15 | 7 | 6 | 2 |
| Y5.B8 | 6 | 2 | 3 | 1 |
| Y5.B9 | 5 | 0 | 0 | 5 |
| Y5.B10 | 10 | 0 | 8 | 2 |
| Y5.B11 | 6 | 2 | 4 | 0 |
| Y5.B12 | 12 | 2 | 5 | 5 |
| Y5.B13 | 5 | 1 | 2 | 2 |
| Y5.B14 | 6 | 0 | 4 | 2 |
| Y5.B15 | 4 | 0 | 1 | 3 |
| **Total** | **136** | **40** | **71** | **25** |

- **Proposals:** 85. 20 are new, all options on live skills, plus 65 reused. Of the reused, 3 come from Y4.json:
  `roman_numerals`, `improper_mixed_dir` and `coord_polygon_draw`. They are linked, not redefined.
- **tagFixes:** 170 (55 add, 87 partial, 22 opts, 6 remove). They are derived; every partial carries its clause.
- **Links:** 805. 196 of them carry opts or a Max Number. Each of the other 609 was generated with its defaults: 100
  items, and it fits the step on size, school week and content.
- **Gates:** two builds give byte-identical output. mergecheck reports 0 problems, both for Y5 alone and with R, Y1, Y4,
  Y2 and Y3. linkfit reports 0 misfits; optcheck reports 0 problems.

## Critic r1 defects: what changed
| # | Class | Fix |
|---|---|---|
| 1 | Links without opts | linkfit --fit gives every link the nearest option set whose items fit; 148 links were re-optioned |
| 2, 3, 18 | Content taught too early; pre cites a later step | The Grade-4 week table is in linkfit; 107 links that cannot fit were dropped; 30 pre were re-cited by school week |
| 4 | Range beyond the step | The linkfit size rule (1.5 × the step ceiling, or the cited ceiling) |
| 5 | Later-grade content | The linkfit later-grade checks. The named links were also removed by hand: mixed_decimals, div/mult_decimal, mult_frac_frac, mixed_fraction_ops, geo_reflect, mixed_conversions, mixed_area_perimeter, area_triangle |
| 6, 13 | False or stale why; cites an untagged step | whyCheck covers tables, digits, "to N", fraction families and units. The re-cite pass handles untagged steps. Round-0 "easier: {…}" notes were removed from the whys |
| 7 | Overstated FULL | B3.S1, B4.S11, B8.S4 and B7.S3 are now partial, with new builds `multiples_2digit`, `frac_total_band`, `area_rect_only` and `frac_hundredths_dec` |
| 8 | tagFix derivation | tagFixes are derived from SKILL_WRM; mergecheck is 0 |
| 9 | Partial step with full directs | B1.S3, B1.S4, B1.S5, B1.S8, B5.S4, B5.S7 and B5.S11: each direct is now a partial with its own clause |
| 10 | Notes used as opts | B6.S6 `{forms:[1]}`; B8.S2 `{forms:[0]}`; B4.S10/12/14/15 `{denoms:[2]}`; B7.S11 `{forms:[0]}`; B7.S9 `{decimals:3}`; B12.S4 `{decimals:1}`; B14.S5 `{units:[0]}` |
| 11 | Own build in preBuild | Removed by the build |
| 12 | Fewer than 3 pre | Filled with links that fit the week, or a "Pre-skills are few:" note that says why (B10.S3, B10.S4, B10.S5) |
| 14 | Degenerate links | compose_rect_from_squares, shape_name_match_3d and time_sense were removed; linkfit tests every link for this |
| 15 | No `closes` | `closes` (the step's missing clause) on every build proposal, plus `envision` on every partial and gap step |
| 16 | Owner rulings | roman_12, roman_100 and roman_1000 are folded into `roman_numerals` (Y4's spec: bands 12 / 100 / 1,000 / 3,999, read and write). improper_direction is now `improper_mixed_dir`. `thousandths_pv` is patched to sit on the decimal_pv proposal |
| 17 | time_convert already partly built | Patched to cover only days, weeks, months and years, and smaller to larger. B14.S5's partial carries `{units:[0]}` |
| 19 | Building block listed as related | Moved to pre: B1.S1 combine; B3.S7 mult_properties; B10.S4–S6 identify_angles and temperature; B11.S2 coord_distance_q1; B15.S2 compare |

All the per-step fixes the critic sampled were applied in `spec_r1.py`: B1.S1, B1.S11, B4.S11, B4.S13, B5.S1, B5.S11,
B6.S5, B6.S6, B7.S9, B8.S2, B8.S3, B9.S1, B9.S2, B10.S8, B10.S10, B12.S4, B12.S8, B14.S6, B3.S1, B3.S10, B5.S6, B12.S9
and B7.S6.

HELPERS leftovers:
- **Multiples of 25 and 15 (B3.S1):** the step is now partial, with the new option `multiples_2digit`.
- **fd_place_band vs thousandths_pv (B7.S5):** `fd_place_band` now covers tenths and hundredths only, and thousandths
  belong to `thousandths_pv` alone.

Proposal ids for the lead to merge:
- `coord_missing_vertex` is dropped. Y4 never had that id: Y4's `coord_polygon_draw` already includes "find the missing
  vertex", so B11.S2 links to it.
- `PATCH`ed live proposals (`thousandths_pv`, `time_convert`, `mult_multiples`) carry `corrected` and `correctionWhy`.

## Self-check (rule 6)
I generated 6 items each for the directs and partials of 10 random steps (seed 20261016): B2.S5, B11.S4, B7.S9, B7.S2,
B10.S3, B10.S7, B5.S6, B7.S8, B4.S7 and B5.S10. Every verdict and clause matched the items. One caveat: in B7.S9,
order_decimals `{decimals:3}` uses 2-digit whole parts (94.255).

## Hardest calls
- **Customary units:** the critic dates them to W33, but Imperial units (B14.S4) is W32. That step alone is exempt.
- **Gap steps** have no items, so their size ceiling is 100 unless the title names a number. This dropped several useful
  links, for example on B12.S12. Notes say why.
- **A full step may list a partial skill beside its full directs** (B5.S3, B5.S8, B7.S11). This is honest and
  merge-safe.

## Owner questions (recommendation adopted)
1. Should Imperial units (B14.S4, W32) count as the first customary week, so that W32 links may use customary units?
   **Recommended:** exempt that step only and keep W33 for every other step. Adopted.
2. Should multiples of 15, 25 and 50 be an option on number_theory:multiples, or a new skill? **Recommended:** an option
   (`multiples_2digit`). Adopted.
3. Should Roman numerals stay on the list even though they are beyond CCSS? **Recommended:** yes, as one `roman_numerals`
   skill with bands 12 / 100 / 1,000 / 3,999 (owner ruling). Adopted, and the Y3/Y4 prior-learning lessons point to the
   same skill.
4. Area of rectangles: a rectangle-only option on `area`, or a new skill? **Recommended:** an option (`area_rect_only`).
   Adopted.

## Merge check across years (lead's gate)
- Y5 alone: 0 problems. Y5 + Y4: 0. Y5 + Y4 + Y2 + Y3: 0.
- Y5 + R + Y1 + Y4: 119 problems, **all on R and Y1 steps** (69 R, 50 Y1). R.json and Y1.json fail this mergecheck on their own too: their
  `partial` tagFixes predate the `partial: <clause>` field (merged clause comes out undefined). None involves a Y5 step;
  the R/Y1 lane's tagFixes need the clause field before the lead merges them with this checker.
