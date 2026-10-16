# Y4 (Grade 3) tagging — independent critic, round 5 (rule 18)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 87b5911e. Data: `data/curriculum/links/Y4.json`.
Scope: rule 18, using the extended wording on `origin/claude/sweet-newton-c8wrv1` BRIEF.md. A link must fit the step's
own dealt maximum and its school week, and also its content and layout, against what the pupil has met by that week.
Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r5/`.

## Verdict: FAIL

- **Size.** The 25 round-4 links are fixed. Of the 33 step-relative candidates, 25 are acceptable and 8 are real
  misfits.
- **Ceiling.** The tagger's linkfit ceiling is too loose to be the rule-18 check. Its "0 of 873" result therefore proves
  little.
- **Content.** A content and layout scan of all 873 links (new in the extended rule 18) finds **34 more misfit links in
  6 classes**. It also finds **21 pre `why` labels** that say "earlier step/block" for a step the school teaches later.
- **Totals.** 42 misfit links on 31 steps is systematic: the PASS bar is at most 3 isolated cases. The mean over the 37
  steps I touched is **7.70**, with 11 steps at 7.

## 1. The 25 round-4 links: all fixed

I generated each one on the print path (`generateQuestionFor` with its opts, its `maxNumber` and `itemIndex`), using
`sites.mjs r4sites.json`.

| Pattern | Now | Generated |
|---|---|---|
| A `coordinate_q1` (7) | `@10` on all 7 | Every point is within 10, e.g. (10, 1), (3, 10) |
| B `count_by_step_up` (6) | B4.S2 `count_by_tables {constant:[3]}` (3 … 36); B7.S2 `[2,5]`; B11.S1 `[7,12]` (7 … 84, 12 … 144); B1.S3 and B1.S4 `{step:[0], range:1000}` (2s, 5s and 10s, to 1,010). B4.S1's link is gone: its direct is already `count_by_tables [3]` | Fixed. B1.S4 is relabelled |
| C `area_model_mult` (5) | `{tiles:21}` on B5.S15 and B5.S2 (4 × 62, 7 × 98); B4.S9 and B4.S10 dropped, `mult_properties {forms:[1]}` kept; on B5.S8 it is now the partial | Fixed |
| D `missing_mult_div` (4) | `@100` | Numbers are now ≤ 132. **The facts are still not "the same facts"**: on B4.S2 (6s, W01) it deals 7s, 4s, 9s and 12s (see §3) |
| E `halve` (1) | `@100` | Half of 62, 96 … |
| F `round_decimals` (2) | B8.S4 dropped; B10.S4 relabelled nearest tenth | The label is now true. **But B10.S4 is taught in W17, before any decimal step (W29)** (see §4, C4) |

## 2. The linkfit ceiling definition: too loose

The ceiling is max(own items, title, **block ceiling**, **largest own ceiling of any step taught in an earlier week**),
and a link fails above 1.5 × that ceiling. I printed every step's ceiling and its source (`lf.mjs --own`):

| Source | Effect |
|---|---|
| B1.S4's partial `count_by_powers_of_10 {step:[2]}` deals 1,200,000 | **All 17 B1 steps get a limit of 1,800,000.** That includes B1.S1 "Represent to 1,000" (W11). Through "earlier week", every step after W33 (B5.S5, B6.S1, B10.S1, B12.S1, B14.*) also gets 1.2 M |
| B2.S9's `estimate_sums_diffs {task:'reasonable'}` decoy, 49,490 | The decoy is exempt as a link, but it is **counted as B2.S9's own ceiling**. Through "earlier week", **every step from W16 on** gets a limit of 74,235. That is looser than round 4's year-wide cap of 20,000, which the critic already called too weak |
| B5 block ceiling 7,650 (B5.S5 ÷ 10, taught W35) | B5.S1, S2, S8, S11, S12, S14 and S15 (W05–W06: factor pairs, 2-digit ÷ 1-digit) get a limit of 11,475. Because their ceiling is ≥ 1,000, the early-week "no 4-digit before W11" guard is also switched off for them |
| B10.S5 money (W07), 2,000 | Applied to every B7 fraction step (W08–W11) |

**Ruling.**
- **"Earlier weeks" is right in principle for pre-skills.** A pre-skill is earlier learning, so the numbers of what the
  school has already taught are fair. It is wrong when it takes the maximum over every strand. Money in W07 says nothing
  about what a fractions pupil in W08 can read.
- **The block ceiling is wrong.** B1 and B5 are each taught across 25+ weeks, so a block's later steps say nothing about
  its earlier ones.
- **Related links should fit the step itself.** For a SPED or ELL pupil, a related link is practice beside the step. It
  should not preview a bigger range.

**The definition to use instead:**
- **Related:** limit = 1.5 × the step's own ceiling. The own ceiling is its direct and partial items, without decoys,
  plus its title.
- **Pre:** limit = 1.5 × max(the step's own ceiling, the own ceiling of the step the `why` label cites). This applies
  only when the school teaches the cited step in or before this step's week. For lower-grade prior learning, use that
  step's title range.
- **Content checks**, listed in §4, run on every link regardless of size.

With related links held to the own ceiling (`lf-own.mjs`), linkfit flags 44 links. I judged them together with my
round-4 scan below.

## 3. The 33 step-relative candidates (`relfit.mjs` re-run): 8 misfit, 25 acceptable

Generated items are in `cand.txt`, 5 per link.

**Misfit (8)**

| # | Step [school week] | Link | What generating shows | Fix |
|---|---|---|---|---|
| 9 | B4.S2 ×/÷ 6 [W01] | rel `missing_mult_div @100` "same facts" | ___ ÷ 9 = 12, 132 ÷ ___ = 12, ___ ÷ 7 = 9. These are 7s, 9s, 11s and 12s, which the school has not taught by W01. It has no table option | Drop it, or use `div_facts {constant:[6]}` in another form |
| 11 | B4.S7 ×/÷ 7 [W02] | same | same | same |
| 15 | B5.S4 ×100 [W17] | pre `seq_10 {}` with **no** Max Number (the report says seq_10 is now capped) | Counts in 10s from 5,925 across thousands, labelled "Y2 count in 10s" | `@1000`, as on B2.S8 and B5.S3 |
| 18 | B5.S11 2-digit ÷ 1-digit [W06] | rel `div_check_by_multiplying {}` | 420 ÷ 6, 444 ÷ 6 = 74: 3-digit dividends, 30 weeks before B5.S13 | `@100` (checked: 80 ÷ 4, 91 ÷ 7, 98 ÷ 7) |
| 19 | B5.S12 [W06] | same | same | same |
| 20 | B5.S13 3-digit ÷ 1-digit [W36] | rel `div_zero_in_quotient {}` | 4,070 ÷ 2, 6,018 ÷ 2 (Y5). `@1000` does not hold it: 6,018 ÷ 2 still comes up | Drop it, or keep it labelled "a later step (4-digit)" |
| 23 | B6.S2 km = m [W36] | pre `multiply {tiles:31}` labelled "Y3.B4.S5 2-digit × 1-digit" | 633 × 7, 562 × 7: 3-digit × 1-digit | `{tiles:21}` (checked: 43 × 6, 85 × 7) |
| 26 | B6.S2 [W36] | rel `double_num_line {}` "a double number line for km and m" | Never km and m: "hours for 150 km", "cups for 0.5 pancakes". This is 6.RP rate reasoning | Drop it. `double_num_line`'s "measurement units" context is still a build-list option |

**Acceptable (25)**
- **#1** B1.S15 → `nearest_1000`. This is the honest "next step", taught the same week, W13. 4-digit numbers are met in
  W11–W13.
- **#2, 3, 7, 8.** 4-digit add and subtract pre-skills on B2.S8 and B2.S10. These are earlier steps of the same block
  (W14–W15). The low own ceiling of B2.S8 comes from its directs, not its links.
- **#4, 12** `seq_10 @1000`; **#5** `sub_check_by_adding` (3-digit); **#6**, the deliberate decoy.
- **#10** `div_word_problems` (Y3 tables, ≤ 120); **#13, 16**, the inverse of the step on the step's own numbers;
  **#14** `base10_build_hundreds` (Y3 prior).
- **#17** B5.S7 (W17): all tables are taught by then. **#21** × 1,000, which is the conversion itself.
- **#22, 27** `unit_conversions`: the numbers fit. The units do not (§4, C3).
- **#24** `expand {band:9999}` on B6.S2. The numbers fit, since B1.S6 is taught in W34, but the label cites "Y3.B1.S6 to
  1,000". **Fix the label.**
- **#25** ÷ 10 and ÷ 100 (W35, earlier). **#28** `div_facts {}` (all tables taught in W01–W03).
- **#29** `remainder_interpret @100`: 119 ÷ 12, one item just over 100.
- **#30** B8.S7 pre ÷ 10: 596 ÷ 10. These are the same opts as the cited step's own partial, which is honestly partial
  for this reason.
- **#31** B9.S5 `compare {band:9999}`: 4-digit numbers are met by W14. But it cites B1.S11 "earlier block", which is
  taught in W34, after W32. **Fix the label, or drop it as a duplicate of #32.**
- **#32** `compare {band:999}`; **#33** `seq_5 @100`.

Of the extra own-ceiling flags not among the 33, all but one are acceptable:
- B5.S11 and S15 `multiply {tiles:21}`: Y3 has 2-digit × 1-digit.
- B6.S5, S7, S8 and S9: perimeter of squares with side 43, and 4-addend columns to 259, at W20–W21.
- B8.S2 and S8 `value` and `money_notation` (3-digit).
- B4.S3, B4.S12, B5.S1 and B5.S2 `mult_div_fact_family`: 10, 11, 110.
- B11.S2 `unit_conversion_word {units:[1]}`: now metric, to 10,000.

The exception, **B4.S4 ×/÷ 9 [W02] rel `missing_mult_div @100`**, is the same defect as #9 and #11, and I count it with
them.

## 4. Content and layout scan of all 873 links (extended rule 18): 34 misfits in 6 classes

`content.mjs` generated 6 print-path items for every pre and related link (`content.json`). `cscan.py` applied the
rule's tests, and I read every hit (`content2.json`; the items are quoted below).

| Class | Links | What generating shows | Fix |
|---|---|---|---|
| **C1 Four-quadrant coordinates** | 4: rel `coordinate_graph {}` on B13.S3, B13.S4, B14.S1, B14.S2 | (−1, −10), (10, −3), (19, 4). "Plot A at (−3, −2)" still comes up at its smallest band (5). This is Grade 6 (6.NS.C.6) | Drop it on all 4 |
| **C2 Coordinates past 10** | 7: `coord_polygon` (B6.S3 rel, B6.S9 rel, B14.S2 rel, B14.S4 **pre**) and `coord_distance_q1` (B14.S1, B14.S3, B14.S5 rel) | A(12, 7), C(8, 11). The step pages are held to 10 | `@10` (checked: every point ≤ 10) |
| **C3 Customary units on metric, time and perimeter steps** | 10: B6.S1 rel `unit_conversions {}` and `unit_conversion_word {}`; B6.S2 the same two; B11.S1 (years/months) the same two; B6.S3 rel `perimeter {}`; B6.S4 rel `perimeter {forms:[2]}` and `area {}`; B6.S7 rel `mixed_area_perimeter {}` | "12 lb = ? oz", "8 qt = ? pt", "6 ft = ? in", "a yard 11 ft by 5 ft", "a 49 in frame". `area {}` and `mixed_area_perimeter` also deal **triangles**, which round 5 fixed on B3 but not here | `unit_conversion_word {units:[0]}` (time) on B11.S1, `{units:[1]}` (metric) on B6.S1 and S2; drop `unit_conversions {}`; `perimeter`/`area` with a cm-only form or drop |
| **C4 Decimals before the school teaches them** (first decimal step B8.S1, W29) | 7: B7.S4 [W08] rel `decimal_nl_drag`; B7.S5 [W08] rel `compare_decimal {2dp}`; B10.S2 [W22] pre `place_value_10x {÷100, decimals}` and pre `f_to_d {}`; B10.S3 [W22] pre `compare_decimal {2dp}`; B10.S4 [W17] pre `round_decimals {precision:[0]}`; B10.S5 [W07] rel `add_decimal {}` | 0.5 on a line in W08; "6.45 ___ 0.57" as a pre-skill in W22; "69.63 + …" in W07. Every B10 pre cites a B8 or B9 step "earlier block", but the school teaches those 7–25 weeks **later** | Money steps: use money-notation and coin skills (already present). Drop the pure-decimal links, or move them to related with a "later step" label (related only where the step itself is decimal) |
| **C5 Unlike-fraction compares at Grade 3** | 4: B7.S5 [W08] **pre** `fractions:compare {}` (cites Y3.B6.S5); B7.S6 and B7.S7 rel `mixed_fractions {}`; B9.S5 rel `fractions:compare {}` | "1/10 and 2/5", "2/10 and 1/2", "6/12 ___ 5/8". Grade 3 compares same numerator or same denominator only (3.NF.A.3d); unlike denominators are 4.NF.A.2. The `mixed_fractions` pool also deals "2/8 of 88" | No live option holds it: `compare {denoms:[8]}` still deals 2/6 vs 6/8 and 1/12 vs 1/2, and there is no same-denominator compare skill. Drop all 4, or add a "same numerator or same denominator" form to the build list |
| **C6 Grade-6 symbols** | 1: B1.S11 rel `algebra:inequalities {}` | "x ≤ 11" bins, "a value that satisfies x < 6 (example: −4)", ≥ and ≤ | Drop it |

The round-4 `missing_mult_div` residue (B4.S2, B4.S4, B4.S7: tables not yet taught, under a "same facts" label) belongs
to §3. With B4.S4 counted there, the misfit total is 8 + 1 + 34 = **42 links on 31 steps**.

**Pre `why` labels against school order (S6, label defects).** 21 pre links cite a Y4 step as "earlier step" or "earlier
block" when the school teaches that step **later**. Examples:
- B1.S8 [W11] → B1.S6 [W34];
- B5.S15 [W06] → B5.S9 [W17];
- B8.S5 and B8.S6 [W30–W31] → B5.S5 [W35];
- B9.S6 [W32] → B1.S12 [W35];
- B14.S3 [W29] → B14.S2 [W38], "step before in the block".

Most deal content the pupil has met another way, and only the label is false. Where the content is unmet, I counted it
above (B10.S2, B10.S3). `build.py` should derive the label from the xlsx week, not the WRM order. It already does this
for B13.S3 and B13.S4 ("a later WRM step this year").

**Layout.**
- Column (`stack`) layouts appear only for 2-digit × 1-digit: B5.S11 and B5.S15 pre `multiply {tiles:21}`, and B5.S9
  `mult_missing_digit`. Y3 already teaches that (Y3.B4.S5), so it is acceptable.
- I found no long-division layout and no column regrouping ahead of its block.

## 5. Spot check: the new opts break nothing

- **10 random steps** (`random.Random(20261010)`): B8.S7, B6.S1, B1.S11, B6.S7, B8.S2, B10.S2, B8.S1, B8.S9, B6.S6 and
  B5.S1. I regenerated all 82 entries: 0 errors, and every option is honoured (`rand.txt`). The only defects I found
  are the C3, C4 and C6 hits already listed.
- **The checks:**
  - `build.py --check`: OK, 129 steps;
  - `optcheck.mjs`: 355 opts entries, 0 problems;
  - `optchange.mjs`: 0 non-default values that change nothing;
  - `linkfit.mjs`: 0 (see §2 for why that proves little).

## Scores on the steps touched (criterion e/f, rule 18)

- **Scoring rule.** A step scores 7 when a pre link misfits, or when it has two or more misfit links. Otherwise it
  stays at 8.
- **Steps at 7 (11).** B6.S2, B14.S1, B14.S2, B6.S3, B6.S1, B11.S1, B6.S4, B7.S5, B10.S2, B10.S3 and B10.S4.
- **Steps at 8 (26).**
  - The other 20 misfit steps: B1.S11, B4.S2, B4.S4, B4.S7, B5.S4, B5.S11, B5.S12, B5.S13, B6.S7, B6.S9, B7.S4,
    B7.S6, B7.S7, B9.S5, B10.S5, B13.S3, B13.S4, B14.S3, B14.S4 and B14.S5.
  - The 6 clean random steps.
- **Mean over the 37 steps: 7.70.**

## What closes it (round 6, links only)

1. Apply the fixes in the §3 table (8 links) and the C1–C6 table (34 links).
2. Rewrite `linkfit.mjs` as described in §2:
   - related links held to the step's own ceiling, without decoys;
   - pre links held to the cited step's ceiling when it is taught by this week;
   - no block ceiling, and no cross-strand "earlier week" maximum.
3. Add content checks for:
   - negatives;
   - coordinates > 10;
   - customary units on any Y4 step;
   - decimals before W29;
   - fraction compares without a common numerator or denominator;
   - stack ×/÷ before its step.
4. Derive the pre `why` labels ("earlier/later") from the xlsx week.
