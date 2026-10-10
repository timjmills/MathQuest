# Wave 2 tagging: Year 3 (US Grade 2)

Output: `data/curriculum/links/Y3.json` (134 steps, 12 blocks, in block order, none skipped).

## Counts

| Steps | full | partial | gap | proposals reused | proposals new | tag fixes |
|---|---|---|---|---|---|---|
| 134 | 77 | 25 | 32 | 58 | 0 | 1 |

There are no new proposals. Every step that is not full is closed by an existing id. `inverse_check` (WRM_PROPOSALS, which was Y5-only) is extended to Y3.B2.S21 as its 3-digit band. Eighteen proposals appear only in `preBuild`: they are prior-learning steps from R, Y1 and Y2 with no skill yet, for example `time_talk`, `time_facts`, `tens_ones_group` and `fraction_parts`. The method is the same as `Y2-report.md`, using the "Grade 2" xlsx sheet. All prior-learning entries matched a step, except the three "… Test · Grade 2 Math Assessments" rows, which are not lessons.

## Hardest calls

- **Y3.B2.S21 Inverse operations** is **partial** (tag fix: partial). `sub_check_by_adding` checks a subtraction by adding. It does not check an addition by subtracting, and it does not use the inverse to find a missing number. The fix is `inverse_check`.
- **Y3.B10.S1 Roman numerals to 12** is a gap (`roman_12`). It has no CCSS cluster, so its pre and related skills are set by hand (clock faces, ordering 1–12).
- **Y3.B3.S3 / S4 Multiples of 2, 5 and 10** are partial. `number_theory:multiples` is a Grade 4 skill. `multiples_2_5_10` is the option that closes them.
- **Y3.B4 (2-digit × and ÷ 1-digit, remainders, scaling)** is tagged full to Grade 3–4 skills (`multiply`, `area_model_div_2by1`, `div_remainders`, `mult_comparison`). These are "above" steps, and the skills teach them at their own grade bands.
- **Y3.B7.S5 / S10 Compare mass / capacity** stay partial or gap. The only cover is the Kindergarten heavier/lighter picture. Comparing g, kg, ml and l values waits for `mass_ops`.

## Owner questions (with suggested answers)

1. **Y3.B4 above-grade multiplication and division at Grade 2**: should pages default to the smallest bands (×2, ×3, ×4, ×5, ×8 and no regrouping)? *Suggested: yes. Tag them as WRM does, and set Grade-2 option defaults in the ladder.*
2. **Pounds and pence (B9)**: should "Convert pounds and pence" become dollars and cents (`money_convert`)? *Suggested: yes, the US form, consistent with Y2.*
3. **Y3.B6 / B8 fractions (3.NF and 4.NF.B.3)**: should "Add fractions" (Y3.B8.S1) be offered at Grade 2? *Suggested: yes as WRM teaches it (same denominator, sum ≤ 1), using `add_fractions_like` with a within-1 option.*
