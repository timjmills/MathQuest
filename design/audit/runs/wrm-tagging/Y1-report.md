# WRM tagging, Wave 2: Year 1 (Y1 = Kindergarten), round 2

File: `data/curriculum/links/Y1.json`. Round 2 answers critic `R-Y1-critic.md` (round 1 FAIL, mean 6.23).
Evidence: `R-Y1-items.md`.

## Counts

| Steps | Full | Partial | Gap |
|---|---|---|---|
| 116 | 51 (was 69) | 48 (was 30) | 17 (was 17) |

- Proposals: 43 used. 35 reuse existing ids; 8 are new and short: `add_10_pictures`, `sub_10_pictures` (the split half of
  the old `pictures_change_unknown`), `teen_bands`, `ones_bonds_teen`, `missing_20`, `multiples_from_0`,
  `halves_quarters_only`, `unitise_coins`. Reused instead of new: `equal_groups_early` (Y1.B9.S4 equal / not equal).
- Tag fixes: 58 (38 to partial, 19 removed with generated evidence, 1 add). The two round-1 adds of
  `number_seq_fill {step:10 / 5}` are withdrawn.

## What changed and why (from generated items)
- Y1.B5.S2 / S6: `add_10_regroup`, `sub_10_regroup`, `make_a_ten` removed (they bridge 10: Y2.B2.S6/S10); `add_20_no_regroup` /
  `sub_20_no_regroup {band:20, notation:['across']}` added as partial; build `ones_bonds_teen`.
- Count in 2s / 5s / 10s: `seq_*` removed (1, 3, 5 / 1, 11, 21); `skip_count_line {step:[0], band:50, range:50}` partial (true
  multiples but 2s, 5s, 10s mixed); build `multiples_from_0`. Y1.B6.S2 and Y1.B12.S2 are `tens_foundation_visual` only.
- Fractions: `partition_shapes {parts:[0]}` halves, `{parts:[2]}` fourths are full; `shade_fraction {denoms:[2]}` and
  `fraction_of_set {denoms:[2]}` partial (they also deal quarters / eighths); build `halves_quarters_only`.
- Response mode: column layouts (`add_10_mixed`, `sub_10_mixed`) removed from the picture steps; Y1.B2.S8/S14/S15 partial with
  `add_10_pictures` / `sub_10_pictures`. `equal_or_unequal_groups` (write "multiply"/"add") partial. Y1.B3.S4 uses `shape_attributes {forms:[1]}`.
- Range: teen steps partial (`teen_bands`); Y1.B5.S7 lines stop at 10 (`nl_20`); Y1.B5.S10 within 20 (`missing_20`);
  Y1.B1.S7/S9 drop `more_less_10` (band 20 past the step); Y1.B12.S6 partial (compare mixes any two tens).
- Money is USD in opts: `coin_value {currency:'usd'}`, notes via `coin_value {task:'order'}` + `money_count {kind:'note'}`.

## Pre and related (method)
- The xlsx week list is filtered: a prior R step is kept only when it shares the step's idea (same sub-topic, or the same
  family while fewer than 2 pre-skills exist); partial-only prior steps keep their partial skill (Y1.B1.S1 now gets
  `classify_count {band:3}`). Then earlier Y1 and R steps on the same idea. Never pre = related; never a step's own build in preBuild.

## Owner questions (suggested answers)
1. `multiples_from_0`: one option on seq_2/seq_5/seq_10, or a single-count choice on `skip_count_line`? Suggested: the seq_* option (one count per page, picture strip).
2. Y1.B12.S2 "Tens to 100" is full at band 90 (100 said aloud). Accept? Suggested: yes.
