# WRM tagging, Wave 2: Reception (R = PK4)

File: `data/curriculum/links/R.json`, made by the R/Y1 tagging lane on 2026-10-10.

## Counts

| Steps | Full | Partial | Gap |
|---|---|---|---|
| 119 | 50 | 36 | 33 |

- Proposals: 22 named. 19 reuse existing `WRM_PROPOSALS` ids and 3 are new:
  - `doubles_pictured`: an option on `number_sense:doubles_near_doubles`, for doubles drawn as pictures, to 8 and to 10.
  - `bonds_3_parts`: an option on `composing:number_bonds`, for a whole split into three parts.
  - `pictures_change_unknown`: an option on `addition:add_5_pictures` and `subtraction:sub_5_pictures`. It asks how many were added or taken away, and raises the pictures band to 10.
- Tag fixes: 7. Six change a tag to `partial`, for these steps:
  - doubles in R.B9.S7 and R.B11.S11
  - position words in R.B4.S4 and R.B17.S6
  - `placevalue:compare` in R.B11.S2
  - `patterns:double` in R.B16.S6

  The seventh fix is in R.B16.S6. It turns the full `doubles_near_doubles` tag into a partial one: that skill deals abstract doubles only.
- Prior learning: Reception has no sheet in the school xlsx. Pre-skills come from three places, in this order:
  1. The one or two steps just before in the block.
  2. Earlier Reception steps on the same CCSS code.
  3. Earlier steps in the same block.

  R.B1.S1 is the first step of the curriculum, so it has no pre-skill.

## Hardest calls

- **Number steps (Find / Represent / 1 more / 1 less for 1-3, 4-5, 0-5, 6-8 and 9-10)** are marked `full`. The options used are `band 5` or `band 10`, `objects: pictures/frame` and `dir: forward/back`. There is no band of 3 or 8. The bands cover these numbers, but they also deal numbers up to the band.
- **Subitising steps** are `partial` or `gap`. `count_objects` with dice is counting, not recognising at a glance, so these steps go to `subitise`.
- **Zero**: Find 0-5 and Represent 0-5 are `partial`. No skill draws an empty set, so they go to `zero`.
- **R.B14.S2 and R.B14.S4** ask how many were added or taken away. `share_group` already lists these two steps, but sharing does not teach change-unknown. The new option `pictures_change_unknown` is the honest fix.
- **R.B11.S10, bonds to 10 in three parts**: `share_group` also lists this step. The real fix is `bonds_3_parts`.
- **R.B13.S5, verbal counting past 20**: oral counting cannot be checked on paper. It is `partial` and goes to the existing `consolidate`.
- **R.B17, maps and building**: the 11 steps are mostly `gap`. They go to `position_map`, `scenes` and `pattern_make`.

## Owner questions (suggested answers)

1. **Should `share_group` keep R.B9.S8, R.B11.S10, R.B11.S12, R.B14.S2 and R.B14.S4?** These are about doubles, three-part bonds and change-unknown, not sharing.
   - Suggested: no. Move them to `doubles_pictured`, `bonds_3_parts` and `pictures_change_unknown`. Keep sharing, grouping and odd/even in `share_group`.
2. **Should Reception skills have a band of 3, for the "1, 2, 3" blocks?**
   - Suggested: no new band. Band 5 at level 3 (trace) is close enough. Note it on the skill instead.
3. **Can oral steps (verbal counting, "talk about time", "explain arrangements") ever be `full`?**
   - Suggested: no. Leave them `partial`. The `Say:` band on the skill's model page is the closest print form.
4. **Should R.B18 (Make connections) be a mixed review skill (`consolidate`) or a page role?**
   - Suggested: a page role. Daily/mixed review over the Reception skills does the job, and the proposal can then be dropped.
