# Y4 (Grade 3) tagging — independent critic, round 7 (rules 18–19, links)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at c0a7ee88. Data: `data/curriculum/links/Y4.json` (780 pre/related links).
Scope: rules 18 and 19 (per step; content and layout; school-week order with first-taught weeks).
Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r7/`
(`own7.mjs` → `own7.json` and `own7.out`, `extra7.mjs`, `p2.mjs` probe, `r6fix.mjs`, `lf7.mjs` = linkfit run on the round-6
data, `myweeks.json` = first-taught weeks I derived from the xlsx).

## Verdict: FAIL (rules 18–19). The step verdicts have not regressed.

- **The 30 round-6 misfits are fixed.** I generated every surviving or replacement link with 16 print-path items (§1).
- **The tagger's claims about the r6 scans are true** (§2). The 13 "denominator > 12" flags are /100 on steps taught in
  W31 or later. The 7 "size" flags are parse artefacts.
- **The first-taught weeks in `linkfit.mjs` match the xlsx**, and the G1–G6 closures work. Run on the round-6 data,
  the round-7 `linkfit` catches 27 of the 30 round-6 misfits (§3).
- **`linkfit` still cannot see three things** (G7–G9 below):
  - the printed option, tile and bin labels;
  - denominators written as `?/16`, drawn stacked, or held in an answer object;
  - a fraction sum or difference with unlike denominators, a decimal sum or difference, and quarters or fifths
    written as decimals.
- **My own 20-item scan of all 780 links finds 21 misfit links on 18 steps, in 4 classes** (§4).
  - 6 of the 21 came in with round 7's own replacements: `select_equiv_frac` ×3, `equiv_frac_nv {denoms:[2,3]}` and
    `equivalent {denoms:[2], forms:[0]}` ×2.
  - 15 were already there in round 6. The round-6 critic and `linkfit` both missed them.

  This is systematic. The PASS bar allows at most 3 isolated cases.
- **Step-level fields are unchanged.**
  - Against 87b5911e (round 5), the only change is B12.S6's `note`, which is about links.
  - Against 81cba70e (round 4), the B1.S8 and B8.S5 notes also differ. Those changed in round 5 and were accepted then.
  - Verdict, direct, partial, build, preBuild, missing and the top-level fields are identical.
- **The checks pass:**
  - `build.py --check`: OK, 129 steps (45 full, 63 partial, 21 gap), and the tree is clean afterwards;
  - `optcheck`: 355 entries, 0 problems;
  - `optchange`: 0 non-default values that change nothing;
  - `linkfit`: 0 misfits in 780 links.

## 1. The 30 round-6 misfits: all fixed

| Round-6 item | Now | Generated (16 items) |
|---|---|---|
| A: `area_perimeter {}` on B6.S3 and S4 | `{band:20}` | P ≤ 18, A ≤ 20: "P=16, A=15" |
| A: `temperature` (B13.S3), `order_fdp` (B9.S6), `estimate_frac_ops` (B7.S15) and `estimate_sums_diffs {place:1000}` (B1.S16, S17, B2.S3) | Gone | — |
| B: `area` (triangles) on B3.S1, S2, S4 and B6.S4 | Gone | — |
| B: `percent_visual` (4), `simplify` and `ratio_tables` (B7.S10), `mult_placeholder_zero` (B5.S3), `geo_reflect` (B12.S7, S8), `prime_composite` (B5.S1) | Gone | — |
| B: `add_decimal` on B9.S3 and S4 | `{decimals:1, range:100} @10` | 1 dp only, but see §4 note N1 |
| C: `mult_chart` on B4.S3, S5 and S8 | `{task:'fill', constant:[6] / [9] / [7]}` | Every blank is in the named row or column. 9 × 11 = 99 is a 9-row fact |
| C: `mult_chart_easy` on B4.S3 and S5 | Gone | — |
| D: B9.S8 pre `equiv_frac_visual` | `fractions:equivalent {denoms:[2], forms:[0]}` | **Not clean.** Sixteenths, twelfths and sixths (§4, class F) |
| Label: B4.S11 "the 0 and 1 rows" | `mult_chart {constant:[1]}` "the 1 row" | Blanks are n × 1. Honest |
| Citation: B13.S4 coordinate pre | Cites Y4.B14.S1 (W37, the same week) | Correct |

## 2. The tagger's claims about the round-6 scans

I re-ran `full.mjs`, `scan6.mjs` and `scan7.mjs` unchanged from the r7 scratch directory.

- **The 13 "denominator > 12" flags are legitimate as /100.** Every one is `f_to_d`, `frac_10_100` or `frac_10_100_nv` on
  B8.S6–B10.S1. The school teaches these from W31 to W37, after "Hundredths as fractions" (W31).
- **The same `f_to_d` links still fail, for content the scan does not read.** See §4, class C: percent tiles, quarters
  before W33, and fifths.
- **The 7 "size" flags are parse artefacts.** My scan splits answer lists and strips entities, and it reads:
  - `count_by_step_up {step:[0], range:1000}`: largest number 1,090 (limit 1,500). `[749,779]` is a list;
  - `order_least_to_greatest {band:999}`: largest number 946. "920,975,988" is three 3-digit numbers;
  - `count_by_tables {constant:[2,5]}`: largest number 60. 10229 is the `&#10229;` back-arrow entity (with `&#10142;`) in
    the visual.

## 3. `linkfit.mjs`: weeks, G1–G6, and what it still cannot see

**The weeks.** I derived the first week of every Grade 3 lesson from the "Grade 3" sheet of
`Awsaj-Domain-Sequence-K-5-2026-27.xlsx`.
- **`prior.json` matches for all 129 steps.** The only difference is in title matching: B10.S4–S6 carry a "(US: dollars &
  cents)" suffix, and their weeks are W17, W07 and W22.
- **B8.S1–S3.** These first appear in W29 as "Enrichment (after MAP)" and are repeated in W30. Labels that say W30 are
  the override the round-6 critic accepted.
- **The rule-19 table is right:**
  - ×6 is taught in W01; ×7 and ×9 in W02; ×11 and ×12 in W03;
  - mixed numbers / past 1 in W07 ("Count beyond 1");
  - angles in W27; decimals in W29; hundredths in W31;
  - column 3-digit × in W36; coordinates in W37.
- **Missing from the table** (no current misfit except the first):
  - **halves and quarters as decimals: W33.** This one gates class C;
  - 4-digit column + and − in W14 (my scan found none);
  - inches in W26 (`linkfit` is stricter and bans all customary units).

**G1–G6 are closed.** I ran the round-7 `linkfit` on the round-6 data (`git show 87323ff9`, saved as `lf7.mjs` and
`lf7_on_r6.out`). It reports 77 misfits, and it catches the round-6 classes:
- `area_perimeter {}` at 2,116 (G1);
- °F (G2);
- the triangle area with its 7.5 key (G3, G5);
- `order_fdp` as both an unlike compare and a percent (G4);
- `estimate_sums_diffs` at 16,000 (G6);
- percent, GCF, ratio, prime, axis reflection, 2-digit × 2-digit and the untaught chart rows (G5);
- 24ths in `equiv_frac_visual`.

**It still misses 3 of the round-6 misfits:**
- `estimate_frac_ops`: unlike-denominator sums, and a −0.5 key that its seeds do not reach;
- `add_decimal` at 2 dp on B9.S3 and S4: decimal addition is not a concept it guards.

**The gaps that remain**

| # | Gap | Effect |
|---|---|---|
| G7 | `q.options`, `q.tiles` and `q.bins` are never read. They print: `formatProblemForPrint` draws dnd tiles as labels, and multi-select options are kept | The percent tiles in `f_to_d`/`d_to_f`, the denominators in `select_equiv_frac`, and the 25/1000 decoy in `frac_10_100` all pass |
| G8 | Denominators are read only as `\d+/\d+` | `?/16`, a stacked "2 4 = 8 ?" and `{"den":"16"}` all pass. `equivalent {denoms:[2]}` deals sixteenths |
| G9 | There is no guard for a fraction sum or difference with unlike denominators, for decimal + or −, for fifths ↔ decimals, or for quarters as decimals before W33 | `fraction_bar_ops`, `sub_decimal`, and `f_to_d`/`d_to_f` before W33 all pass |

## 4. My independent scan: 21 misfit links on 18 steps

**Method.**
- 20 print-path items per link, with seeds `777 + 53i` (unlike `linkfit`'s and the round-6 ones).
- It reads the text, the answer, the options, tiles and bins, the visual and the payload.
- Size is judged against 1.5 × the own or cited ceiling (as in round 6).
- Content checks: the round-6 concept list plus G7–G9.
- Week checks use the xlsx weeks.

**Clean classes (0 hits in all 780 links):**
- size;
- customary units, °F, degrees and negatives;
- triangle area, percent outside class C, GCF, ratio, prime, and reflection in an axis;
- 2-digit × 2-digit and long multiplication;
- untaught tables, including the blanks in the `mult-grid` payload;
- column ÷, column × before W17 / W36, and column + or − on 4 digits before W14;
- unlike-fraction compares, coordinates or angles as pre before W37 / W27, and mixed numbers before W07;
- a pre that cites a later-taught Y4 step.

The `prime` hits are "composite shape" (false positives).

**C. `conversions:f_to_d` / `d_to_f`: percent tiles, quarters before W33, fifths (12 links, 1 pre each unless noted).**

About 30% of `f_to_d` and `d_to_f` items take a drag-bin branch (`gen-fractions.js` around line 6548). It ignores
`denoms` and prints the tiles 25%, 50%, 75%, 0.25, 0.75, 3/12, 6/8 and 9/12. Of 20 items, 5–6 carry a percent tile and
8–10 a quarter as a decimal.
- `f_to_d` also deals 1/5 → 0.2.
- `d_to_f` deals 0.4 → 2/5 and 0.6 → 3/5. Its options never offer 4/10, so the pupil must simplify.

| Step [week] | Link | What generating shows |
|---|---|---|
| B8.S6 [W31], B8.S10 [W32], B9.S3 [W32], B9.S5 [W32] | pre `f_to_d {}` | 25%, 75% and 50% tiles; 3/4 → 0.75 (W33 content); 1/5 → 0.2 |
| B8.S9 [W31], B9.S6 [W32] | pre `f_to_d {denoms:[5]}` | The same: `denoms` does not reach the bin branch |
| B9.S4 [W33] | pre `f_to_d {denoms:[5]}` **and** pre `d_to_f {forms:[0]}` | Percent tiles; 18 of 20 `d_to_f` items need fifths (0.4 = 2/5 with 4/10 not offered) |
| B10.S1 [W37] | pre `f_to_d {}` | Percent tiles (quarters are fine by W37) |
| B9.S1 [W31] | pre `d_to_f {}` | Percent tiles; 0.75 → 3/4; 10 of 20 items need fifths |
| B8.S7 [W31] | rel `f_to_d {}` | Percent tiles; quarters |
| B9.S8 [W33] | rel `d_to_f {}` | Percent tiles; fifths |

**F. Denominators past Grade 3 in equivalence links (7 links). 6 of them are new in round 7.**

| Step [week] | Link | What generating shows |
|---|---|---|
| B7.S6 [W09], B7.S7 [W09], B7.S8 [W10] | pre `select_equiv_frac {}` (new in r7, replacing `equiv_frac_visual`) | Options 8/20, 10/25, 15/40, 28/32, 20/24, 25/30, 5/15; targets 2/5, 3/5, 4/5. This is worse than the 15ths–24ths it replaced. With explicit `{denoms:[2,3]}` it still deals 3/5 → 15/25, so `denoms` is only partly honoured |
| B7.S9 [W09] | rel `select_equiv_frac {}` (from round 6) | The same |
| B7.S9 [W09] | rel `equiv_frac_nv {denoms:[2,3]}` (new in r7) | 5/6 = ?/24, 3/6 = 12/?, and an option of 10/15 |
| B7.S10 [W10], B9.S8 [W33] | pre `fractions:equivalent {denoms:[2], forms:[0]}` (new in r7) | Form 0 itself deals 2/4 = 8/? → 16, 2/4 = ?/16 and 3/4 = 12/16, plus 1/2 = 3/6 and 3/4 = 9/12. **The report's claim "deals halves and quarters only: 16ths come with the other forms" is false.** On B9.S8, a halves-and-quarters step, the rule's own example ("no eighths … for a halves step") applies |

**D. Decimal arithmetic from a later grade (1 link)**

| Step [week] | Link | What generating shows |
|---|---|---|
| B9.S2 [W32] Make a whole with hundredths | rel `decimals:sub_decimal {}` ("1 − 0.36") | 84.38 − 13.6, 12.63 − 3.2, 94.95 − 0.75: 2-dp subtraction with unlike places and exchange (5.NBT.B.7, WRM Y5). No item is "1 − n". This is the class round 6 dropped for `add_decimal` |

**U. A fraction sum or difference with unlike denominators (1 link)**

| Step [week] | Link | What generating shows |
|---|---|---|
| B7.S11 [W10] Add two or more fractions | rel `fraction_bar_ops {}` | 1/2 + 5/8, 1/2 − 1/8, 4/6 − 1/2, 5/9 − 1/3: related denominators, which is WRM Y5. Grade 3 / WRM Y4 adds same denominators only. `{denoms:[2]}` still deals 4/8 + 3/4 |

**Notes (not counted)**
- **N1. `add_decimal {decimals:1, range:100} @10` on B9.S1, S3 and S4 [W31–W33].**
  - It deals general 1-dp addition with an exchange into the ones: 4.7 + 7.6 = 12.3 and 9.8 + 3.8 = 13.6. That is 5.NBT.B.7, not "make a whole" or "recombine the parts".
  - The coordinator directed 1 dp for S3 and S4, so I record this as a ruling for the lead rather than count it.
  - My recommendation is to drop it, or to limit it to sums that make a whole.
- **N2. `frac_10_100` and `frac_10_100_nv` on B8.S7 and B8.S8 [W31] and B9.S2 [W32].** About 1 item in 8 is "Click ALL
  fractions equivalent to 0.25", with 1/4 as a correct choice and 25/1000 as a decoy. That is a quarter as a decimal
  before W33, and thousandths. Minor.
- **N3. `mult_word_problems` and `_plain` on B4.S2, B4.S7, B5.S14, B6.S8 and B10.S5.**
  - The items include 10 × 15, 9 × 15 and 7 × 15, up to 150 against limits of 100–135. This is the Y3 2-digit × 1-digit, so it is a size margin only.
  - B4.S2's label "equal-groups stories with 6 in a group" overclaims: groups of 3, 7, 10 and 15 appear.
- **N4. `mult_chart {constant:[3] / [6]}` on B4.S1 [W01] and B4.S3 [W02].** Every blank is in the named table. The
  given cells of the window still show 11s and 12s, which are taught in W03. Acceptable for a related link.

## 5. Pre counts, related links, labels, order

- **Every step has at least 3 pre except B12.S6 (Polygons, W27), which has 2. Its note is not fully honest.**
  - The note says naming shapes and parallel/perpendicular lines are the only building blocks the pupil has met.
  - **`shapes_early:shape_corners_count`** (Y2.B3.S3 Count vertices: "How many corners does this shape have?" with 4–7)
    is a met building block. It is not among the step's own direct or partial skills.
  - `count_sides_vertices_2d` and `shape_attributes` are the step's own partial skills, so they cannot be pre.
  - **Fix:** add `shape_corners_count`, citing Y2.B3.S3. Also re-cite `name_2d_shapes` to Y3.B11.S7 (Recognise and
    describe 2-D shapes), as B6.S8 does, instead of the Reception step "circles and triangles".
- **Dropping the class C and F links would leave 2 pre on B9.S3, B9.S4, B9.S5, B9.S6 and B10.S1.**
  - On those steps `f_to_d` is the main building block, so a replacement is needed, not a bare drop. See the fixes
    below.
- **Every step has at least 1 related link.**
- **Labels.** All Y4-cited pre labels were checked against the xlsx weeks:
  - "earlier" 77 times and "same week" 55 times, all true. 0 are labelled "later";
  - 19 "step before in the block, wk W…" labels, all earlier and with the right week;
  - 7 labels read W30 for B8.S1 and B8.S2, the accepted override.
- **Order.** The Y4 tier of every pre list is nearest week first: 0 breaks.

## Scores (criterion e/f, rules 18–19, on the steps touched)

- **Scoring rule.** As in rounds 5–6, a step scores 7 when a pre link misfits or when it has two or more misfit links.
- **At 7 (15 steps).**
  - B7.S6, S7, S8, S9 and S10;
  - B8.S6, S9 and S10;
  - B9.S1, S3, S4, S5, S6 and S8;
  - B10.S1.
- **At 8 (3 steps).** B7.S11, B8.S7 and B9.S2.
- **Mean over the 18 touched steps: 7.17.**
- **Every other step is unchanged from rounds 4–6 (≥ 8).**

## What closes it (round 8, links only)

1. **Class C.** Replace `f_to_d` and `d_to_f` on the 11 steps. Interim choices that generate clean:
   - `decimals:decimal_nl_drag` (checked: tenths on a 0–1 line) and `fraction_operations:frac_10_100` (with N2 accepted)
     for tenths and hundredths;
   - for B10.S1, `measurement:coin_value` and `money_count` are already pre, and `money_notation` is its own skill. It
     needs one more met pre, for example a hundredths skill taught in W31.

   Keep 3 pre on B9.S3–S6 and B10.S1.

   **Lead (generator).** Give `f_to_d` the `_dragOrNot` option `d_to_f` already has, and make the bin branch honour
   `denoms`. Build the `dec_fraction_basics` / `tenths_only` proposal: tenths, hundredths, and halves/quarters as
   separate sets, with no fifths. Then relink.
2. **Class F.**
   - Drop `select_equiv_frac` on B7.S6–S9. B7.S6–S8 keep 4, 4 and 5 pre; on B7.S9 it is a related link.
   - Replace `equiv_frac_nv {denoms:[2,3]}` on B7.S9.
   - On B7.S10 and B9.S8, use something that deals no 16ths. `composing:fraction_number_line` on B7.S10 and
     `fractions:benchmark_fractions` on B9.S8 are already present. Or drop the link, keeping 3 pre.

   **Lead (generator):** `select_equiv_frac` decoys and `equivalent` form 0 ignore `denoms`.
3. **Class D and U.** Drop `sub_decimal` on B9.S2 and `fraction_bar_ops` on B7.S11. Rule on N1.
4. **B12.S6.** Add `shape_corners_count` (Y2.B3.S3) and re-cite `name_2d_shapes`. Then the 2-pre note can go.
5. **`linkfit.mjs`.**
   - G7: read `options`, `tiles` and `bins` labels.
   - G8: read `?/n`, stacked visuals and `"den"` for denominators.
   - G9: add guards for an unlike-denominator `a/b ± c/d`, decimal ± (Grade 3 has only make-a-whole), fifths ↔
     decimals, and quarters as decimals before W33. Add W33 to the rule-19 table, and 4-digit column ± (W14).

   Re-run with a second seed set. Round 7's 20 items did not reach the −0.5 key in `estimate_frac_ops`.
