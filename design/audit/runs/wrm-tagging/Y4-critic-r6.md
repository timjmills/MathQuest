# Y4 (Grade 3) tagging — independent critic, round 6 (rule 18 links)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 6b77c216. Data: `data/curriculum/links/Y4.json` (823 pre/related links).
Scope: rule 18 as extended in BRIEF.md (per step; content and layout; judged against the school week).
Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r6/`
(`r5sites.mjs`, `scan6.mjs`, `scan7.mjs`, `full.mjs` → `full.json`, `dens.mjs`, `probe.mjs`).

## Verdict: FAIL (rule 18). The step verdicts have not regressed.

- **The 42 round-5 misfits are all fixed.** I generated each one on the print path (§1).
- **The rewritten `linkfit.mjs` follows the round-5 definitions**, but it has blind spots (§2). A 16-item scan of all
  823 links, run on text, answer, payload and visual, finds **30 misfit links on 25 steps** that both `linkfit` and the
  round-5 scan missed (§3).
- **None of the 30 is new in round 6.** All of them were already in the data at round 5 (checked against 87b5911e and
  e5a840b6). They cluster in classes no check reads, so the defect is systematic. The PASS bar allows at most 3 isolated
  cases.
- **The step verdicts are unchanged.** 0 changes to verdict, direct, partial, build, preBuild or missing against
  87b5911e. Round 6 moved pre links from 565 to 548 and related links from 308 to 275.
- **The checks pass:**
  - `build.py --check`: OK, 129 steps (45 full, 63 partial, 21 gap);
  - `optcheck`: 355 entries, 0 problems;
  - `optchange`: 0 non-default values that change nothing;
  - `linkfit`: 0 of 823. My re-run is byte-identical to `Y4-linkfit.txt`, apart from log lines.

## 1. The 42 round-5 misfits: all fixed

Each was generated with its opts and Max Number, 6 items (`r5sites.mjs`).

| Round-5 item | Now |
|---|---|
| §3 `missing_mult_div` on B4.S2, S4, S7 | Gone |
| §3 B5.S4 `seq_10` | `@1000`: 598 … 628, 997 … 1,027 |
| §3 B5.S11, S12 `div_check_by_multiplying` | `@100`: 72 ÷ 6, 84 ÷ 6, 108 ÷ 9 (Y3 range) |
| §3 B5.S13 `div_zero_in_quotient` | Gone |
| §3 B6.S2 `multiply` | `{tiles:21}`: 59 × 4, 99 × 9 |
| §3 B6.S2 `double_num_line` | Gone |
| C1 `coordinate_graph` (4) | Gone |
| C2 `coord_polygon` (4) and `coord_distance_q1` (3) | `@10`: every point ≤ 10, e.g. A(2, 4) … D(2, 8) |
| C3 `unit_conversions` and `unit_conversion_word` (6) | Gone |
| C3 B6.S3 `perimeter` | `{forms:[0], band:20}`: squares and rectangles to 5 |
| C3 B6.S4 perimeter story | Gone |
| C3 B6.S7 `mixed_area_perimeter` | Gone |
| C4 decimal links before W29 (7) | Gone |
| C5 unlike-fraction compares (4) | Gone |
| C6 `inequalities` | Gone |

**One fix in the C3 row did not take.** B6.S4's `area {forms:[0], band:10}` still deals triangles, 6 of 16 items:
"Find the area of a triangle: base = 5, height = 3 → 7.5". `forms` picks standard, missing-side or story items; it never
removes the triangle shape. Round 5 reported this exact option as the fix on B3.S1, S2 and S4, and it does not hold
there either (§3, B1).

## 2. The rewritten `linkfit.mjs`

**The ceilings are right.**
- Related links: limit = 1.5 × the step's own ceiling, without decoys.
- Pre links: limit = 1.5 × max(own ceiling, cited step). A Y4 cited step counts only when the school teaches it in or
  before this week. A lower-grade cited step counts with its title range, or its year range (R 20, Y1/Y2 100, Y3 1,000).
- There is no block ceiling and no cross-strand maximum. A `why` that cites no step id falls back to the own ceiling,
  which is the strict choice.

**The content and layout checks have six blind spots.** Each one hides misfits listed in §3.

| # | Gap | Effect |
|---|---|---|
| G1 | Size reads only the text, a comma-free answer and the cell payload. A dual answer ("P=136, A=1156") and numbers drawn only in the visual are skipped | `area_perimeter` areas to 1,521 pass |
| G2 | `CUST` has `\b°F`. `\b` cannot match before `°` when a space precedes it, so °F is never found | `temperature` in °F passes |
| G3 | Decimals and negatives are read from the text only, not the answer. The money exemption `/cent/` also matches "centimetre" and "percent" | "Estimate: 1/6 − 1/5 → −0.5" and "triangle → 7.5" pass |
| G4 | The fraction-compare check reads the text only. "Order from least to greatest:" carries its fractions in the visual | `order_fdp` (1/3, 20%, 0.9) passes |
| G5 | There are no concept checks: triangle area, percent, GCF or ratio, prime, a 2-digit × 2-digit column drawn without a stack cell, x/y axes, or tables not yet taught | B-class rows in §3 |
| G6 | 8 items per link. `estimate_sums_diffs {place:1000}` reaches 16,000 only after item 8 | Size misses at the margin |

**The judged cases**
- **B5.S9 related `mult_missing_digit` (the accepted flag): accepted.** It is a 2-digit × 1-digit column. That is Y3
  work, and it is exactly what B5.S9 itself teaches (W17).
- **The 3 "taught later" labels are honest, and I accept them.**
  - **B12.S6 ← B12.S5.** Polygons is taught in W27 and Quadrilaterals in W28, one week apart.
  - **B14.S3 ← B14.S2.** Draw 2-D shapes on a grid is taught in W29 and Plot coordinates in W38. The school teaches
    B14.S3 nine weeks before any coordinate step, and Y3 has none, so there is no truthful earlier citation.
  - **B13.S4 ← B14.S2.** Draw line graphs is W37. **Minor fix:** cite `Y4.B14.S1` instead, which is taught the same
    week (W37) and deals the same `coordinate_q1 @10`. B13.S3 already does this.
  - **Note on these three steps.** B12.S6, B13.S4 and B14.S3 each reach 3 pre only through the "taught later" link,
    so each has 2 pre the pupil has already met.

## 3. Misfits that remain: 30 links on 25 steps, none new in round 6

Each was generated with 16 print-path items (`full.json`). The fixes marked "checked" I generated as well.

**A. Missed through G1–G4 and G6 (8 links)**

| Step [week] | Link | What generating shows | Fix |
|---|---|---|---|
| B6.S3 [W19], B6.S4 [W20] | rel `area_perimeter {}` | Squares and rectangles with side up to 39: "P=140, A=1225", "A=1521". This is 2-digit × 2-digit (4.NBT.B.5) | `{band:20}` (checked: A ≤ 20) |
| B13.S3 [W37] | rel `measurement:temperature {}` | 7 of 16 items are "What is the temperature in °F?" | `{forms:[1]}`, °C only (checked) |
| B9.S6 [W32] | rel `conversions:order_fdp {}` | Orders 20%, 1/3, 2/3, 0.9 and 7/8, 7/10, 3/5, 40%. These are unlike fractions and percents | Drop |
| B7.S15 [W11] | rel `estimate_frac_ops {}` | "1/6 − 1/5 → −0.5", "5/8 + 1/10". Unlike denominators (5.NF), with a negative decimal key | Drop |
| B1.S16, B1.S17 [W13]; B2.S3 [W14] | rel `estimate_sums_diffs {place:1000}` | 9,763 + 6,184 ≈ 16,000, and 11,000 and 13,000. These are 5-digit sums, over the tagger's own limit of 15,000. The `range` option has no effect on this skill | Minor. Drop on B1.S16 and S17. Keep on B2.S3 only if a note says the sum may pass 10,000 |

**B. Concepts from a later grade (16 links): no check covers them (G5)**

| Step [week] | Link | What generating shows | Fix |
|---|---|---|---|
| B3.S1, B3.S2 [W18]; B3.S4 [W19]; B6.S4 [W20] | rel `area {forms:[0], band:10}` | "Find the area of a triangle: base = 5, height = 3 → 7.5" in 6 of 16 items. This is triangle area (6.G.A.1) with a decimal key | `area_unit_squares`, or `area_perimeter {band:20}`. No `area` option removes the triangles |
| B8.S7, B8.S8 [W31]; B9.S2 [W32]; B9.S8 [W33] | rel `conversions:percent_visual {}` | "What percent of the grid is shaded?", "Click ALL grids that show 75%", "(simplify)". Percent is 6.RP / WRM Y5–Y6 | Drop. B8.S8 and B9.S2 already have `money_notation` and `compare_decimal` for the hundred grid |
| B7.S10 [W10] | rel `fractions:simplify {}` | "What is the GCF of 16 and 24?" (6.NS.B.4), 15/25, 20ths and 30ths | Drop, or keep `{forms:[0]}` only and label it a later step |
| B7.S10 [W10] | rel `conversions:ratio_tables {}` | "Find the missing x value", x/y ratio table (6.RP.A.3) | Drop |
| B5.S3 [W16] | rel `mult_placeholder_zero {}` | "66 × 16. The first row is done. Start the second row." This is 2-digit × 2-digit long multiplication (Y5, 5.NBT.B.5), a column layout drawn in the visual with no stack cell, 20 weeks before B5.S10 | Drop |
| B12.S7, B12.S8 [W28] | rel `geo_reflect {}` | "Which figure shows this shape reflected over the y-axis / x-axis?" The axes are not met until W37–38, and reflection in an axis is WRM Y6 / 8.G | Drop on B12. `symmetry` and `place_symmetry_lines` already carry the idea. On B14.S4 and S5 (W38) it is borderline, so keep it and note it |
| B9.S3 [W32], B9.S4 [W33] | rel `add_decimal {decimals:2, range:100} @10` | 3.67 + 8.98 = 12.65 and 6.21 + 5.8 = 12.01. This is 2-dp addition across the whole with unlike places (WRM Y5, 5.NBT.B.7), not "recombine the parts" | Drop. Partitioning is in the steps' own items |
| B5.S1 [W05] | rel `prime_composite {}` | "Click ALL the prime numbers", "prime or composite". This is 4.OA.B.4 / WRM Y5 | Minor. Drop, or label it "a later idea (Grade 4)" |

**C. Tables not yet taught, under a false "row" label (5 links): the class of round 5's `missing_mult_div`**

| Step [week] | Link | What generating shows | Fix |
|---|---|---|---|
| B4.S3 [W02] "the 6 row", B4.S5 [W02] "the 9 row", B4.S8 [W03] "the 7 row" | rel `mult_chart {task:'fill'}` | A random chart window: "× 8 9 10 11 12", blanks 99 and 110. It is not the named row, and it brings in 11s and 12s, which are taught in W03 | `{task:'fill', constant:[6]}`, `[9]` and `[7]` (checked: every blank is in the named table) |
| B4.S3, B4.S5 [W02] | rel `mult_chart_easy {}` | The full 12 × 12 chart, blanks 110, 132 and 144 in W02 | Drop. On B4.S8 [W03] it is acceptable |

Label only: B4.S11 rel `mult_chart {}` "the 0 and 1 rows". It never deals a 0 or 1 row. It should be relabelled, or
given `{constant:[1]}` if the generator accepts that.

**D. A halves step with other denominators (1 link)**

| Step [week] | Link | What generating shows | Fix |
|---|---|---|---|
| B9.S8 [W33] Halves and quarters as decimals | pre `equiv_frac_visual {}` (cites "Y2 half and two quarters") | 4/5 = 16/20, 1/5 = 3/15, 2/3 = 8/12. Fifths are named in the rule's own example | `fractions:equivalent {denoms:[2]}` (checked: 1/2 = 2/4, 1/4 = ?/8). On `equiv_frac_visual`, `denoms` changes nothing (`generateQuestionFor` gives identical items), which is a defect for the lead |

**Other observations (not counted)**
- **Extra denominators on B7.** `equiv_frac_visual {}` on B7.S6, S7, S8 and S10 adds 15ths, 16ths and 24ths to steps
  that deal 2–8, and B7.S6 cites "half and two quarters". The rule is not clearly broken, but `denoms` cannot hold it
  (see D).
- **B12.S8 related `coordinate_q1 @10` [W28].** It reads coordinates 9 weeks before the school teaches them. The label
  should say "later".
- **Kind-P labels on a Y4 step print this step's week, not the cited step's.** B5.S9 ← B5.S7, B7.S12 ← B7.S7, and
  B14.S4 and S5 ← B14.S2 read "prior learning wk W17" and so on. None is false.

## 4. Sample of 20 steps (`random.Random(20261011)`: 10 with exactly 3 pre, 10 with more)

The sample: B1.S2, B1.S10, B2.S3, B2.S5, B4.S3, B5.S7, B6.S7, B7.S13, B8.S2, B8.S8, B9.S4, B10.S1, B10.S2, B11.S3,
B11.S4, B12.S7, B12.S8, B13.S1, B13.S3 and B14.S5.

- **Pre counts.** Every step has at least 3 pre that are real building blocks:
  - Place-value and number-line pre on B1.
  - Same-block exchanges and the Y3/Y2 column steps on B2.
  - The 6s step and the Y3 tables on B4.S3.
  - The clock-reading ladder on B11.
  - Tenths fractions and the place-value chart on B8.

  Two are weak but defensible: B12.S8's `perimeter_grid` (counting on a grid) and B8.S2's `ten_frame_build` (10 parts
  make a whole).
- **Related links.** Related links share the step's idea except where §3 lists them (B4.S3 `mult_chart`, B8.S8
  `percent_visual`, B12.S7 `geo_reflect`, B13.S3 `temperature`).
- **Labels.** All 158 Y4-cited pre labels were checked against the xlsx week, with the tagger's W30 override for B8.S1–S3
  (W29 is the test and MAP week):
  - earlier is labelled earlier 94 times;
  - same week is labelled same 52 times;
  - later is labelled later 3 times;
  - 8 more are kind-P labels, which are imprecise but not false.

  No pre label calls a later-taught step "earlier".

## Scores (criterion e/f, rule 18, on the steps touched)

- **Scoring rule.** As in round 5, a step scores 7 when a pre link misfits or when it has two or more misfit links.
- **Steps at 7 (5).**
  - B9.S8: pre `equiv_frac_visual`, plus `percent_visual`.
  - B6.S4: `area`, plus `area_perimeter`.
  - B7.S10: `simplify`, plus `ratio_tables`.
  - B4.S3 and B4.S5: `mult_chart`, plus `mult_chart_easy`.
- **Steps at 8 (20).** The other misfit steps: B1.S16, B1.S17, B2.S3, B3.S1, B3.S2, B3.S4, B4.S8, B5.S1, B5.S3, B6.S3,
  B7.S15, B8.S7, B8.S8, B9.S2, B9.S3, B9.S4, B9.S6, B12.S7, B12.S8 and B13.S3.
- **Mean over the 25 touched steps: 7.80.**
- **Every other step is unchanged from round 4–5 (≥ 8).** The step verdicts did not move.

## What closes it (round 7, links only)

1. **Apply the fixes in the §3 tables.** That is 30 links: about 20 drops, 6 option changes and 1 skill swap. Fix the
   B4.S11 label and the B13.S4 citation too.
2. **Close G1–G6 in `linkfit.mjs`:**
   - read every number in the answer (split "P=…, A=…") and in the visual;
   - fix `\b°F` to `°F`, and add `tons?`, `yd`, `mi` and `gal`;
   - read decimals and negatives in the answer;
   - anchor the money exemption (`\$|¢|dollar|money`, not `cent`);
   - read fraction compares from the visual and the payload;
   - use 16 items.
3. **Add concept guards to `linkfit.mjs`.** Use a regex list on text, answer and visual:
   - `triangle`, `%|percent`, `GCF|LCM|ratio`, `prime|composite`, `[xy]-axis`;
   - a 2-digit × 2-digit product;
   - a times-table chart or fact outside the tables taught by the step's week.

   Each hit is a misfit unless the step itself deals it.
4. **For the lead (generator defects).**
   - `fractions:equiv_frac_visual` ignores `denoms`.
   - `area_perimeter:area` has no rectangle-only option.
   - `estimate_sums_diffs` ignores `range`.
