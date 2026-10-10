# Y6 (US Grade 5) — Wave 2 tagging report

Output: `data/curriculum/links/Y6.json` (format per `BRIEF.md`). Critic reports: `Y6-critic.md`.

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
| B6 Ratio | 10 | 1 | 7 | 2 |
| B7 Algebra | 10 | 5 | 4 | 1 |
| B8 Decimals | 9 | 4 | 5 | 0 |
| B9 Fractions, decimals, percentages | 9 | 5 | 4 | 0 |
| B10 Area, perimeter, volume | 8 | 1 | 4 | 3 |
| B11 Statistics | 6 | 0 | 3 | 3 |
| B12 Shape | 11 | 1 | 3 | 7 |
| B13 Position and direction | 5 | 2 | 3 | 0 |
| **Total** | **114** | **35** | **60** | **19** |

Proposals: 70 — **58 reused** existing ids (WRM_PROPOSALS, STANDARD_PROPOSALS, VISUAL_BUILDS) with the Y6
steps added, **12 new** (the draft `nl_millions` was folded into the existing `nl_20`):
`wp_multidigit`, `wp_long_div`, `frac_div_int_any`, `metric_decimal_convert`, `ratio_language`,
`expr_two_ops`, `dec_unequal_places`, `f_to_d_factors`, `f_to_d_division`, `mean_missing`, `reflex_angles`,
`net_draw`. All 12 are options on live skills (no new skill ids invented).

tagFixes: 103 — 82 partial (mostly live "full" tags that do not reach Y6 size or method), 18 add,
3 remove (`algebra:multi_step_word` off B2.S8: + − within 100 only; `integers:order_negatives` off B1.S8:
ordering is B1.S6; `conversions:equiv_ratios` off B6.S3: it belongs to ratio problems).

## The hardest calls
1. **Size vs method (B1.S6, B2.S1).** Live place-value and column +/− skills stop at 999,999/1,000,000;
   Y6 works to 10,000,000. Both are **partial**, closed by the reused `big_numbers` band option. One rule
   for both steps.
2. **Function machines (B7.S1 full, B7.S2 partial).** The rebuilt function-table skills deal 1-step rules,
   work backwards (`ftTask`) and draw the machine, but 2-step rules are always ×/÷ first; WRM also
   puts +/− first and shows that order matters. Existing `function_machine` re-scoped to that clause.
3. **Representation-only partials.** Short division (B2.S9: box grid, not bus stop), find the whole
   (B4.S7: no bar model), translations/reflections (B13.S4–S5: multiple choice, first quadrant; WRM draws
   and describes in four quadrants). For ELL/SPED pupils the WRM representation is the scaffold, so these
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
   quadrants, or build them under `vis_migrate_coordinates`? *Suggested: one build — widen
   `translate_grid`/`reflect_grid` with a quadrant option; both are now attached.*
5. **Weekly lists in enrichment weeks (W32–W33)** mix topics (the list on Negative numbers is 3-D shape
   lessons). *Suggested: the pacing sheet's W32/W33 prior-learning cells be split per topic; meanwhile
   the matching Y5 block was used.*
6. **Y5 tags may need the same check** (decimal conversions, unequal decimal places) — the Y5 tagger
   should apply the rule used here.
