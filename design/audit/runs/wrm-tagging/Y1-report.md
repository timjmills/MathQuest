# WRM tagging, Wave 2: Year 1 (Y1 = Kindergarten)

File: `data/curriculum/links/Y1.json`, made by the R/Y1 tagging lane on 2026-10-10.

## Counts

| Steps | Full | Partial | Gap |
|---|---|---|---|
| 116 | 69 | 30 | 17 |

- Proposals: 38 are listed in the file.
  - 36 reuse existing ids, from `WRM_PROPOSALS` and from `pictures_to_sentence` in `STANDARD_PROPOSALS`.
  - 2 are this lane's new proposals, shared with R.json:
    - `pictures_change_unknown`: used by Y1.B2.S14, take-away with pictures to 10.
    - `doubles_pictured`: used as a pre-build only.
  - Some reused ids have an empty `steps` list in this year. They are there only because a step lists them in `preBuild`, as a pre-skill that still has to be built.
- Tag fixes: 9.
  - 7 change a tag to `partial`, for these skills and steps:
    - `number_bonds` in Y1.B2.S1
    - `add_5_pictures` and `sub_5_pictures` in Y1.B2.S3, where writing the sentence is missing
    - `shape_pattern` in Y1.B3.S5, which has no 3-D shapes
    - `number_line_sub` in Y1.B4.S9
    - `shape_positions` in Y1.B11.S2, which has no left / right
    - `coin_value` in Y1.B13.S3, which has no notes
  - 2 add a tag: `counting:number_seq_fill` with `step: 10` / `step: 5` for Count in 10s and Count in 5s.
- Prior learning: the KG sheet of `Awsaj-Domain-Sequence-K-5-2026-27.xlsx` gives each week a list of "Rec/PK4" items. Each item is matched to a Reception step by its title.
  - Steps that share the CCSS code (then the cluster) come first, and this source gives at most 5 pre-skills.
  - Then come the step before in the block and earlier steps on the same CCSS.
  - `preBuild` takes the unbuilt proposals of the related prior steps.

## Hardest calls

- **Compare and order within 10 and 20** (B1.S12-14, B4.S11-12) are `partial`. `placevalue:compare` and `order_*` start at band 99. The existing `compare_small` option closes them.
- **Number lines** (B1.S15, B4.S8-10, B6.S6-7, B12.S4) are `gap` or `partial`. `place_on_number_line` only shows one ten to the next, so all of these go to `nl_20`.
- **Fact families and related facts** (B2.S4, B2.S13, B5.S9) are `full`. They use `add_sub_fact_family`, `number_families_add` and `fact_family_sort`.
- **Y1.B2.S14, take away by crossing out**: `sub_5_pictures` stops at 5. The step is `partial` until `pictures_change_unknown` raises the band to 10.
- **Fractions** (B10): recognise and find a half or a quarter of a shape or a quantity are `full`. "Is this set in halves / quarters?" is `partial` and goes to `half_quarter`.
- **Money**: unitising and coins are `full` with `coin_value`, which offers a currency option. Notes are `partial` and go to `money_notes`.
- **Above-grade blocks** (B5, B6, B9, B10, B12, B13, B14) are tagged as WRM teaches them. The CCSS "above" flag is kept in the source; tagging does not decide whether to teach them.

## Owner questions (suggested answers)

1. **Should the KG xlsx "Build and draw shapes" and "Compose shapes from smaller shapes" (W29, marked "CCSS BUILD (to be made)") get WRM ids?** They are not WRM steps.
   - Suggested: no. They stay in the CCSS build list (`shape_draw`, `make_3d`). The White Rose page shows them as non-WRM lessons.
2. **Y1.B13 money is UK (£ / p) and the school teaches dollars and cents.** Should "Recognise notes" become "Recognise bills"?
   - Suggested: yes. Keep the `money_notes` option with USD as the default, and the UK wording in a currency option.
3. **Y1.B14.S2 / S3 (days and months) have no CCSS.** Should they get a full skill, or only `time_talk`?
   - Suggested: build `time_talk` with two levels: days in order, then months in order.
4. **Count in 2s, 5s and 10s are `full` with `patterns:seq_*`.** These skills go past 100.
   - Suggested: accept this. A `band 50 / 100` option on `seq_*` would be a small follow-up, not a blocker.
