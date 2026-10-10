# Y6 (US Grade 5) — Wave 2 tagging report

Output: `data/curriculum/links/Y6.json` (format per `BRIEF.md`). Critic: `Y6-critic.md` — round 3, **8.09/10 PASS**
(min 7; 32 steps); earlier rounds `Y6-critic-r1.md` 7.47 FAIL, `Y6-critic-r2.md` 7.50 FAIL.

## Method
- Every Y6 small step (114, 13 blocks, block order) was judged by reading what the skills really deal
  (gen-*.js, skill-options.js, SKILL_CATALOGUE, sampled items), not their names.
- Pre-skills start from the school's weekly prior-learning list (`Awsaj-Domain-Sequence-K-5-2026-27.xlsx`,
  sheet "Grade 5"), each lesson mapped to its WRM step and that step's tagged skills, then the previous
  step, then lower-grade skills on the same CCSS cluster. A pre-skill never repeats a direct or partial
  skill; `related` never repeats `pre`, direct or partial.
- `tagFixes` are **derived mechanically**: the diff between each step's direct/partial lists and the live
  `SKILL_WRM` tags (add = new tag or partial→full; partial = full→partial or a new partial cover;
  remove = live tag that does not teach the step). The lead can apply them as they stand.
- The 8 Awsaj supplements in Y6 blocks (scaling, ÷ unit fraction, ordered pairs ×2, volume of composite
  solids, fraction line plots, 2-D hierarchy) are not WRM small steps and are not in the file.

## Counts

| Block | Steps | Full | Partial | Gap |
|---|---|---|---|---|
| B1 Place value | 8 | 2 | 6 | 0 |
| B2 + − × ÷ | 17 | 5 | 10 | 2 |
| B3 Fractions A | 9 | 6 | 3 | 0 |
| B4 Fractions B | 7 | 2 | 5 | 0 |
| B5 Converting units | 5 | 1 | 3 | 1 |
| B6 Ratio | 10 | 1 | 6 | 3 |
| B7 Algebra | 10 | 3 | 6 | 1 |
| B8 Decimals | 9 | 1 | 8 | 0 |
| B9 Fractions, decimals, percentages | 9 | 1 | 8 | 0 |
| B10 Area, perimeter, volume | 8 | 1 | 4 | 3 |
| B11 Statistics | 6 | 0 | 3 | 3 |
| B12 Shape | 11 | 0 | 4 | 7 |
| B13 Position and direction | 5 | 2 | 3 | 0 |
| **Total** | **114** | **25** | **69** | **20** |

Every `full` verdict was re-checked in round 3 by sampling 20 items per direct skill and reading the
generator; 10 earlier "full" calls fell to partial (mostly: the skill deals only 1-dp decimals, a fixed
denominator set, one letter, or prints the whole that the pupil should find).

Proposals: 79 — **62 reused** existing ids (WRM_PROPOSALS, STANDARD_PROPOSALS, VISUAL_BUILDS) with the Y6
steps added, **17 new**, all options on live skills (no new skill ids): `wp_multidigit`, `wp_long_div`,
`frac_div_int_any`, `metric_decimal_convert`, `ratio_language`, `expr_two_ops`, `expr_two_letters`,
`dec_unequal_places`, `pv10x_dp`, `div_dec_2dp`, `f_to_d_factors`, `f_to_d_division`, `f_to_p_denoms`,
`pct_one_step`, `mean_missing`, `reflex_angles`, `net_draw`. (A draft `nl_millions` was folded into the
existing `nl_20`.)

tagFixes: 121 — 102 partial (mostly live "full" tags that do not reach Y6 size or method), 14 add,
5 remove: `algebra:multi_step_word` off B2.S8 (+ − within 100 only); `integers:order_negatives` off B1.S8
(ordering is B1.S6; kept as pre); `conversions:equiv_ratios` off B6.S3 (belongs to ratio problems);
`fraction_operations:mult_scaling` off B6.S6 (never enlarges a shape); `coordinates:coordinate_graph` off
B13.S1 (mixes four-quadrant items in at random, no option to restrict).

## Generator bugs found (recorded in step notes, NOT fixed — for the lead)
- `js/modules/gen-fractions.js:6904` `percent_of_number`: 33% is treated as 1/3 ("33% of 60 = 20"; true 19.8),
  3 of 21 combos wrong (Y6.B9.S7 note).
- `js/modules/gen-measurement.js:672-678` "Read the scale" in kg: when maxKg is 5 or 10 the increment is
  500/1000, so `numMarks < 1` and every kg item answers 0 (Y6.B5.S1 note).
- `js/modules/gen-fractions.js:6793` `percent_visual` "shade" type prints the grid already shaded and asks
  how many squares are shaded — answer given away (Y6.B9.S3).

## Agents (owner rule)
Taggers and round-1 fixer: mq-opus-low. Critics: mq-opus-medium (fresh agent each round). After two critic
FAILs (7.47, 7.50) with the same defect class (unverified "full" verdicts), the round-3 fixers were
**escalated to mq-opus-medium** (the ceiling). Recorded here rather than in design/STATUS.md because this
is a helper lane that does not own that file — the lead should copy the line across.

## The hardest calls
1. **Size vs method (B1.S6, B2.S1).** Live place-value and column +/− skills stop at 999,999/1,000,000;
   Y6 works to 10,000,000. Both are **partial**, closed by the reused `big_numbers` band option. One rule
   for both steps.
2. **Function machines (B7.S1 full, B7.S2 partial).** The rebuilt function-table skills deal 1-step rules,
   work backwards (`ftTask`) and draw the machine, but 2-step rules are always ×/÷ first; WRM also
   puts +/− first and shows that order matters. Existing `function_machine` re-scoped to that clause.
3. **Representation-only partials.** Short division (B2.S9: box grid, not bus stop), find the whole
   (B4.S7: no bar model), translations/reflections (B13.S4–S5: multiple choice, first quadrant; WRM draws
   and describes in four quadrants — one build each, `translate_grid` / `reflect_grid` widened to four
   quadrants). For ELL/SPED pupils the WRM representation is the scaffold, so these
   are partial, not full.
4. **Common factors / multiples (B2.S2–S3) full.** `gcf_*` / `lcm` with the "click every common
   factor/multiple" form list all of them; the existing `common_mf` Venn proposal adds a picture, not a
   missing clause, so it was not attached.
5. **Decimal conversions (B5.S2) and decimal +/− (B8.S4) partial.** Every metric skill deals whole amounts
   large→small; `add_decimal`/`sub_decimal` always give equal decimal places, so the alignment error WRM
   targets never arises.
6. **Shape block mostly gap.** Vertically opposite angles, angles in triangles/quadrilaterals/polygons
   have no skill; all closed by the one reused `angle_rules` proposal rather than six new ids.

## Owner questions (with suggested answers)
1. **Is "method at a smaller size" enough for full?** (e.g. column +/− to 1,000,000 for a 10,000,000 step.)
   *Suggested: no — keep partial and build the `big_numbers` band; it is one option, cheap to add.*
2. **Retire or keep `function_machine`?** *Suggested: keep, re-scoped to "+/− first" 2-step rules and the
   order-swap pair; everything else it promised is now live in the function-table options.*
3. **`STANDARD_PROPOSALS.mult_dec_dec` names Y6.B8.S7**, but that step is decimal × integer, fully taught by
   `decimals:mult_decimal`. *Suggested: drop Y6.B8.S7 from `mult_dec_dec` (it stays a Grade 5/6 CCSS build).*
4. **Translations/reflections:** extend the first-quadrant `translate_grid` / `reflect_grid` to four
   quadrants, or build them under `vis_migrate_coordinates`? *Suggested: widen `translate_grid` /
   `reflect_grid` with a quadrant option (that is what the file now builds); `vis_migrate_coordinates`
   stays a migration of the existing multiple-choice skills.*
5. **Weekly lists in enrichment weeks (W32–W33)** mix topics (the list on Negative numbers is 3-D shape
   lessons). *Suggested: the pacing sheet's W32/W33 prior-learning cells be split per topic; meanwhile
   the matching Y5 block was used.*
6. **Y5 tags may need the same check** (decimal conversions, unequal decimal places) — the Y5 tagger
   should apply the rule used here.
7. **Fix the three generator bugs above now** (they mislead pupils today), independent of any build.
   *Suggested: yes — small, local fixes in their owning lanes.*
8. **Existing proposals to tidy (lead-owned):** split `long_mult` (it bundles long multiplication with
   short/efficient division); re-home `frac_find_whole` from the No-Visuals `fraction_of_set_hard_nv` to
   `fraction_of_set_hard` or `tape_diagram`; give the 9,999,999 band on `number_word_names`/`compare` to one
   of `big_numbers` / `vis_pv_bands_millions`, not both. *Suggested: yes to all three.*
