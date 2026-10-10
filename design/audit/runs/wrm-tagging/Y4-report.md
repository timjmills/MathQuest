# Wave 2 tagging: Y4 (Grade 3) report, round 5

Output: `data/curriculum/links/Y4.json`. It is built by `python3 tests/scripts/wrm-tagging/build.py` from the hand-written
specs `tests/scripts/wrm-tagging/spec*.py`, plus `wrm-steps.json` and two generated inputs (`keys.mjs` makes the live
keys, proposals and tags; `prior.mjs` makes the Grade 3 xlsx prior-learning lists). Round 3 is `spec_zz_r3.py` and
`spec_zz_s_envision.py`. The generated items are in `Y4-items.md`. `items.mjs <out> [step ids]` regenerates them, and
`optcheck.mjs` checks every option value.

## Counts

| | Round 2 | Round 3 | Round 4 |
|---|---|---|---|
| Steps | 129 | 129 | 129 (14 blocks, none skipped) |
| Full | 56 | 48 | **45** |
| Partial | 50 | 60 | **63** |
| Gap | 23 | 21 | **21** |
| Proposals used | 68 (17 new, 51 reused) | 68 (20 new, 48 reused) | **71 (23 new, 48 reused)** |
| Tag fixes | 76 (hand list) | 151, derived | **155, derived** (add 45, full 36, opts 31, partial 32, remove 11) |
| Pre / related entries | 528 / — | 570 / 319 | **565 / 308** (round 5); every step has at least 3 pre and 1 related; 0 keys in both |
| Option checks | — | — | Round 5: 355 opts entries, 0 schema problems (`optcheck.mjs`); 0 non-default values that change nothing (`optchange.mjs`); **0 of 873 links too big for their own step** (`linkfit.mjs`, step-relative; per-step result in `Y4-linkfit.txt`) |

**New proposals (20).** All are options on live skills, except `roman_numerals`, which is one new skill.
- `regroup_thousands`, `more_less_all`, `roman_numerals`, `add_sub_place_units`
- `exchange_count_add`, `exchange_count_sub` (now on every regroup band)
- `area_half_squares`, `div_by_itself`, `factor_pair_strategy`, `scaled_fact_family`, `div_exchange`
- `improper_mixed_dir`, `tenths_only`, `dec_fraction_basics`, `dec_nl_past_1`, `div10_small_numbers`, `dec_same_whole`
- `money_compare_written`, `coord_forms_fix`, `coord_polygon_draw`

**Dropped as already built:** `dec_compare_2dp`, `dec_order_2dp` (the `decimals` option is 1 or 2) and `time_convert`
(`unit_conversion_word {units:[0]}`). **Replaced** by `roman_numerals`: `roman_100` and `roman_12` (and `roman_1000`
for Y5).

## Changes in round 5 (after critic r4: mean 8.06, FAIL on rule 18)
Round 5 is mechanical: it changes links only, with no verdict, build or proposal change. The changes are in
`spec_zz_v_r5.py`.

**`build.py` carries `maxNumber` on pre and related links.** Round 4 set `@10` on the coordinate links, but the build
kept the value only on direct and partial entries. Now every entry carries its own `maxNumber`, on any link. This fixes
pattern A: the seven `coordinate_q1` links on B12.S8, B13.S3, B13.S4 and B14.S2–S5 now carry Max Number 10.

**The critic's patterns**
- **B.** `count_by_step_up` (3s and 4s from 4-digit starts) is replaced:
  - "Count in 3s" on B4.S1 and B4.S2 → `count_by_tables {constant:[3]}` (true multiples from 0).
  - B7.S2 → `count_by_tables {constant:[2,5]}`.
  - B11.S1 → `count_by_tables {constant:[7,12]}` (days in weeks, months in years).
  - B1.S3 and B1.S4 → `{step:[0], range:1000}`. B1.S4 is relabelled: no live skill counts in 50s, and `count_50s` is
    that step's own build.
- **C.** `area_model_mult` now carries `{tiles:21}` on B5.S8, B5.S15 and B5.S2. On B4.S9 and B4.S10 it is dropped: no
  option holds it under 7 × 86, and `mult_properties {forms:[1]}` (breaking apart) is already a pre-skill there.
- **D and E.** `missing_mult_div` (B4.S2, S4, S7, B5.S7) and `halve` (B5.S11) carry Max Number 100.
- **F.** `round_decimals {precision:[0]}` rounds to the nearest tenth. On B10.S4 it is relabelled as "the same rounding
  move one place over"; on B8.S4 it is dropped.

**`linkfit.mjs` is now step-relative.** It compares each link with its own step:
- The step's ceiling is the largest of these:
  - the largest number its direct and partial items deal (print path, their own opts and Max Number);
  - its title's numbers ("3-digit" counts as 999);
  - its block's ceiling;
  - the largest number of any step the school teaches in an earlier week (from the xlsx).
- A link fails if it deals past 1.5 × that ceiling (and at least 100), or more than 2 decimal places.
- On a step taught before W11, a link also fails if it deals 4-digit numbers the step does not.
- Clock-time skills are exempt, because their minute payloads (19:00 = 1140) are not numbers a pupil reads.

**What the new check found**, beyond the critic's 25:
- `area {}` deals triangles, so it is now `{forms:[0], band:10}` (B3.S1, S2, S4).
- `place_value_10x` now carries band 1,000 (B8.S5, B8.S10).
- `mult_zeros {forms:[0]}` (B4.S13).
- `number_word_form {range:1000}` (B1.S1).
- `add_decimal`, now carrying decimals and range (B9.S1, S3, S4).
- `money_change {usd, band:100, step:5}` (B9.S1, B9.S2).
- `length_metric {forms:[1]}` (B10.S2).
- `seq_5`/`seq_10`, now carrying Max Number 100 or 1,000.
- `remainder_interpret {range:100}` (B7.S8).
- Dropped:
  - `geo_rotate` and `additive_angles`, which deal degrees (270°, 112°) (B12.S1, B14.S4);
  - the 3-digit `sub_across_zeros` analogy on B7.S14.

The result: 0 of 873 links fail, and all 129 steps show "ok" in `Y4-linkfit.txt`.

**Small fixes**
- B9.S4's `f_to_d` label now cites B8.S2.
- B5.S9's `mult_facts` label now says "facts to 12 × 12".
- The stale notes on B1.S8 and B8.S5 are rewritten.
- B9.S6 drops the related `money_compare {}`.

## Changes in round 4 (after critic r3, 7.98)
`spec_zz_u_r4.py` holds every round-4 change, and the build regenerates the file from the specs. The generated items are
at the end of `Y4-items.md`.

**The steps that scored under 8**
- **B7.S4 is now partial.** `mixed_nl_drag {}` only places labels; it never asks what mixed number is at a point, and 2
  of 8 items hold no mixed number. New option `mixed_nl_read` (a read form, with a mixed number on every item).
- **B12.S3 pre-skills.** `symmetry` and `compose_shapes` are dropped. The pre-skills are now `identify_lines`
  (perpendicular) and quarter turns of a clock hand, with preBuild `turns` (Y3 Turns and angles, W28). Related
  `order_least_to_greatest` is dropped. The note says why there are so few live pre-skills.
- **B9.S4.** New pre-skills `f_to_d` (B8.S8) and `d_to_f {forms:[0]}` (B8.S2). `equiv_frac_visual` is dropped. The
  build is now `flex_partition` (decimal band) and the preBuild is `decimal_pv` (B9.S3).
- **B1.S13.** The pre-skills are now `expand`, `combine` and `add_three`: a Roman numeral is read by adding its symbols.
  `time_hour` is dropped, and the note explains why.

**Re-judged from generated items**
- **B7.S1 is now partial.** Half of `whole_as_fraction`'s items are "7 = 7/1". New option `whole_nn_only` (1 = n/n
  only).
- **B7.S13 is now partial.** `sub_fractions_like` simplifies its keys (4/8 − 2/8 = 1/4). New option
  `frac_answer_as_is` keeps the denominator (2/8).

**Housekeeping**
- **Pre `why` labels.**
  - A Y4 step that comes later in the WRM order is labelled "a later WRM step this year: the building block this step
    uses". Before, it was "earlier block" (B13.S3, B13.S4).
  - B8.S6 now cites B5.S5 for whole-number ÷ 10.
  - B8.S1–S3 cite wk W30. W29 is the Geometry test and MAP week; `WK_OVERRIDE` in the spec sets this.
- **B6.S9.** `composite_shapes {forms:[0]}` moved to pre. The mis-cited `perimeter_intro {labels:'some'}` is dropped.
- **B8.S2 and B8.S8: `d_to_f {forms:[0]}`.** `d_to_f` has no `denoms` option; `forms` is its only one.
- **B2.S7.** The `sub_across_zeros` clause now says "3- or 2-digit".
- **Coordinates.** Every `coordinate_q1` partial carries Max Number 10, so its points stay within 10 (Max Number
  10,000 let them reach 20). *Corrected in round 5:* the round-4 build dropped `@10` on pre and related links, so seven
  links still reached (19, 18). `build.py` now carries `maxNumber` on every link.
- **Noise pre-skills dropped.** `count_sequence` on B14.S2 and B14.S4, and `compare_groups` on B3.S4. Each step got a
  real pre-skill in its place: `identify_lines` and `shape_positions`.

**Rule 18: pre and related links carry options that fit the step.** The new script `linkfit.mjs` generates every pre and
related link with its own options and fails a link that goes past Y4. The limit is 20,000 (the sum of two 4-digit
numbers) or 2 decimal places. The one exception is the deliberate wrong answer in "is this answer reasonable?". 18 links
were fixed:
- `compare_decimal`, `order_decimals` and `round_decimals` now carry decimals 1 or 2 and Max Number 10.
- `place_value_10x` now carries a band and a power.
- `double` now carries band 50.
- `number_word_names` now carries band 999.
- Dropped: `nearest_10000` (Grade 4) and `area_model_mult_hard` (97 × 193). Also dropped: `count_by_powers_of_10`, which
  counts by 100s up to 800,600 whatever the Max Number.

**Note for the lead.** `count_by_powers_of_10`'s "1,000s and more" `match` pattern (`by \d+,?\d{3}s`) misses
"by 1,000,000s". So on the print path `{step:[2]}` passes its own filter on only 9 of 12 items. Fix the regex together
with `coord_forms_fix`. B1.S4 is partial either way.

## Changes in round 3

### Build rules now enforced by `build.py`
- **Rule 10.** A key may not appear in both pre and related, whatever its options. The build fails if it does. The 16
  steps that broke the rule now keep the key in pre. The one exception is B4.S4 `multiples`, which mixes tables: it is a
  weak pre-skill but a fair related skill, so it stays in related.
- A **partial step lists no direct skill.** Every skill that teaches part of the step is a partial, with its own clause.
  Six steps moved: B1.S8, B3.S1, B4.S12, B5.S2, B6.S7, B7.S11.
- A pre-skill listed twice is dropped. Every step must have at least one pre-skill and one related skill.
- Every partial or gap step must have its envisioned skill complete (see below).
- **Pre-skill `why` labels are exact.** Each one says "step before in the block", "earlier step in the block",
  "earlier block this year" or "lower grade". Round 2 labelled Y4 steps "lower grade".
- **`maxNumber`.** A direct or partial entry can carry the Max Number it was judged at. This is the `range` argument
  of `generateQuestionFor`, not a skill option.

### Rule 13: an envisioned skill for every partial or gap step
Each of the 81 non-full steps has an `envision` list, with one entry per build proposal. Each entry gives:
- `name` and `kind`, taken from the proposal;
- `teaches`: what the pupil does on this step, written for this step even when the proposal is shared;
- `closes`: the step's missing clause, or the part of it that this proposal closes;
- `representation`, in a few words.

### Over-claims fixed (the critic's S3 list)

| Step | Round 2 | Round 3 |
|---|---|---|
| B4.S3, S5, S8, S9, S10 | `mult_div_fact_family {}` direct | Moved to related: it has no table option (it generated 12 × 9, 5 × 10, 11 × 2). The steps stay full through `mult_facts` + `div_facts` with constant [n]. |
| B7.S7, B7.S8 | `improper_mixed {}` full | Partial. The page mixes both directions. New `improper_mixed_dir` (owner said yes). |
| B8.S4 | `decimal_nl_drag {ticks:'one'}` full | Partial with `ticks:'some'`. "one" labels every tick except the answer's. Lines stop at 1 and never ask for the number at a point. New `dec_nl_past_1` (0–2 and n to n+1 lines, a "read" form). |
| B6.S9 | `perimeter_intro` full | Partial: triangles, rectangles and squares only. Reuses `regular_polygon` ("and of any polygon"). Pre now includes `perimeter {forms:[0]}` (Y3 Calculate perimeter, W21). |
| B9.S5 | Partial, "cannot be held to 1–2 dp" | Partial with `compare_decimal {decimals:2, forms:[0]}`, maxNumber 10. True missing clause: the whole parts differ on nearly every item, there are no same-whole pairs with 1 and 2 places (0.4 vs 0.38), and there is no model. Build: `dec_same_whole` + `dec_compare_model`. |
| B9.S6 | Partial, "thousandths" | Partial with `order_decimals {decimals:2}`, maxNumber 10. Every number has exactly two places, so 3.6 / 3.65 / 3.06 never occurs. Build: `dec_same_whole`. Tag fix #58's reason is corrected. |
| B11.S2 | Gap + `time_convert` | Partial through `unit_conversion_word {units:[0]}` (h → min → s). Missing: s → min, mixed units, comparing durations. Build: `time_calendar`. |
| B14.S1, B14.S2 | `coordinate_q1 {}` full | `forms:[0]` / `forms:[1]` set, but **partial**: the print path ignores the forms option (see "Defect for the lead" below). Build: `coord_forms_fix`. |
| B2.S7 | `sub_across_zeros {band:10000}` direct | Partial: it deals only exchanges across zeros, and half the items are 3-digit (700 − 515, 300 − 62). |
| B1.S10 | Gap | Partial through `place_on_number_line {span:1000, band:10000}`. It marks 9,700 between two labelled thousands, but never uses a 0–10,000 line with only the ends labelled. |

### Found by sweeping every full step again (all 52 round-3 full steps generated on the print path)
- **B1.S17.** `rounding_table {}` only reaches 10 and 100, on 3-digit numbers. It is now
  `rounding_table {places:[10,100,1000], blank:'row'}`, which rounds one 4-digit number to all three places, and the
  column form. Full.
- **B5.S13.** `box_division_hard {}` deals remainders (195 ÷ 8 = 24 R 3). It is now `{regroup:'none'}`, which shares
  exactly. Full.
- **B5.S11 and B5.S12.** `area_model_div_2by1` was direct. It mixes exchange, no exchange and 1-digit quotients, so it
  is now partial. `div_exchange` names the three division skills it must cover.
- **B7.S12.** `add_mixed_like` and `_nv` deal mixed + mixed only, never a fraction added to a mixed number. Partial, with
  `frac_add_multi`.
- **B7.S15.** `sub_mixed_like` sometimes breaks a whole (4 2/8 − 3 5/8). WRM keeps that for Y5.B4.S16. Partial, with
  `sub_break_whole` set to "never". It was a preBuild before; it is now the build.

### Owner rulings
- **Roman numerals:** one `roman_numerals` proposal (new skill `placevalue:roman_numerals`). It has bands to 12, 100,
  1,000 and 3,999, reads and writes, and `supersedes: [roman_12, roman_100, roman_1000]`. B1.S13 builds band 100. The
  xlsx prior learning "Y3 Roman numerals to 12" is band 12 of the same skill, so it is not a separate preBuild.
- **Exchange count:** `exchange_count_add` and `exchange_count_sub` now list every regroup band in `skills` (100, 1k,
  10k, 100k, 1m) as one shared option.
- **24-hour clock:** kept (`time_24h_convert` on B11.S4 and S5).
- **Tables to 15:** no Y4 step asks for them. The B4.S9 and S10 notes point to `tables_to_15` as the next step up.
- **`improper_mixed` one direction:** `improper_mixed_dir` on B7.S7 and B7.S8.
- **`div10_small_numbers`:** the shift chart gains tenths and hundredths columns. Today it drops to H T O on decimal
  items.

### Smaller fixes
- B7.S4: `fraction_number_line` (mostly 0–1 lines) moved to related.
- B1.S14: `nearest_10 {band:1000}`.
- B1.S8: `more_less_10 {step:0}` (the legal "both" value).
- Noise pre-skills dropped: B3.S3 and B3.S4 ← `compare`; B1.S1 ← `teen_compose`; B2.S5 ← `sub_10_mixed`;
  B10.S1 ← `place_on_number_line`; B8.S10 ← `missing_add_sub`; B4.S7–S10 ← `expand`.
- B13.S3: related `line_plot` dropped.
- B10.S5: the pre-skill `why`s now carry their step titles.

### Tag fixes are derived, with precise actions
`tagFixes` is computed by comparing this file with `SKILL_WRM` today, so it cannot drift from the steps. Each fix has one
of these actions:

| Action | Meaning |
|---|---|
| `add` | Not tagged yet. A `partial` field carries the missing clause when it is a partial cover. |
| `full` | An existing partial tag becomes full. |
| `partial` | An existing full tag becomes partial. |
| `opts` | The tag is unchanged; record the option values. |
| `remove` | Tagged now, but not a direct or partial skill here. The `why` says where it went. |

`opts` and `maxNumber` travel with each fix. The hand-written reason is kept where there is one.

### Rules 14–17 (added after the Y2–Y3 critic, round 2), applied across Y4
- **14. An earlier step's skill the step builds on is pre, never only related.** A script listed every related skill that
  is taught at an earlier step. I judged each one, and moved 49 into pre, citing the step it comes from. Examples:
  - B7.S4 ← `fraction_number_line` (Y3 fractions on a line);
  - B2.S9 ← `rounding_table` (B1.S17);
  - B8.S5 ← `d_to_f` (B8.S2);
  - B10.S3 ← `compare_decimal` (B9.S5);
  - B10.S4 ← `round_decimals` and `money`;
  - B5.S2 ← `factors_identify` (B5.S1);
  - B13.S4 ← `bar_graph`.

  The ones left in related are another form of the idea, the inverse, or the next step, and their `why` says so.
- **14. Pre lists are ranked by how directly each skill is a building block**, with the main one first. Examples:
  - B4.S1 starts with counting in 3s;
  - B4.S3, B4.S5 and B4.S8 start with the same table's facts from the step before;
  - B6.S8 starts with the perimeter of a rectangle;
  - B7.S13 starts with adding fractions (its inverse), and a noise pre-skill (`place_value_disks`) is dropped;
  - B5.S12 starts with the exchange;
  - B13.S1 starts with reading a chart.

  No step passes the cap of 8, so no main block was dropped.
- **15. Every step has at least 3 pre-skills.** B1.S13 has 3, and its note explains why there are so few.
  `build.py` fails a step with fewer than 3 unless its note says why.
- **16. `closes` is the step's own missing clause.** It defaults to the step's `missing`, or to the part of it that one
  proposal closes. `build.py` fails if `closes` equals the proposal's `teaches`.
- **17. Option values must change what is dealt.** `optchange.mjs` generates each skill+opts pair and the same skill
  with no options (same seeds, print path). Of 149 pairs, none has a non-default value that changes nothing. 41 entries
  record a default value explicitly (for example `band:999`), and their items are the step's deal. The money options
  (`currency:'usd'`, `step:5`, `band:2000`, `paid:'note'`) were checked in the items log.

## Defect for the lead (not a tagging question)
`coordinate_q1 {forms:[0]}` works in live play: every item reads coordinates. Through `generateQuestionFor` with
`itemIndex`, which is how `print-sheet.js` generates, half the items are "Plot …".

The cause is in how `forms` is filtered:
- `coordinate_q1`'s `forms` is a P12 `match` filter (`generate-question.js` p12Acceptor). The filter redraws an item up
  to 80 times.
- Its variant comes from `pickVariant` → page-deal, which is keyed by the item index. So every redraw gets the same
  variant, and the filter keeps the last draw.

A fix is to make it a `variantKey` forms option, as other P12 forms are. `coord_forms_fix` records this; B14.S1 and
B14.S2 are partial until it lands. Other `match`-type forms used in this file were checked on the print path and are
honoured: `count_by_powers_of_10`, `length_metric`, `bar_graph`.

## Hardest calls
- **B14.S1 and S2: partial, not full.** The option is right and live play honours it. But the printed page, which is
  what the critic and the owner see, still mixes reading and plotting. I mark the page as it really prints, and name
  the fix.
- **B9.S5 and S6: partial even with the options right.** `decimals:2` with Max Number 10 holds the page to hundredths,
  but it never sets the length misconception (0.4 vs 0.38; 3.6 vs 3.65), which is the point of these WRM lessons.
  `dec_same_whole` is the smallest option that closes it.
- **Times-table steps stay full without the fact family.** `mult_facts` and `div_facts` with constant [n] deal only the
  n table, both ways. The fact-family skill would need a table option to be direct.
- **B7.S15 versus Y5.B4.S16.** WRM splits "subtract from a mixed number" from "breaking the whole". `sub_mixed_like`
  deals both, so Y4 is partial until the option can hold it to "never".
- **B5.S13 full with `box_division_hard {regroup:'none'}`.** In the division skills, `regroup` means a remainder, not an
  exchange. "none" is "shares exactly", which is what this step needs. The exchange inside the division is not split
  into steps here (WRM does not split it for 3-digit numbers).

## Self-check (10 random steps)
`random.Random(20261014)` drew B5.S1, B4.S8, B13.S4, B8.S2, B8.S9, B7.S14, B8.S8, B11.S5, B7.S12 and B12.S2. I
re-judged each from items generated on the print path.
- No verdict changed in this draw. B7.S12 had already been corrected by the sweep above.
- The decimal clauses for B9.S5 and S6 were rewritten after their own regeneration showed same-whole pairs appear
  sometimes (9.92, 9.26). The real gap is the 1-place / 2-place mix.

## Owner questions (suggested answers)
1. **Fix the coordinate forms defect in the app?** It affects printed pages of `coordinate_q1` only. *Suggested: yes. It
   is a one-option change in `skill-options.js`. Then B14.S1 and S2 become full with no new skill.*
2. **`dec_same_whole`: is a "same whole part, 1 and 2 places mixed" option on `compare_decimal` / `order_decimals`
   worth a build?** *Suggested: yes. It is the exact misconception the two WRM lessons target, and the skills already
   have the `decimals` option to build on.*
3. **Stale step ids on existing proposals** (`mult_three` lists Y4.B4.S12, `line_graph` lists Y4.B13.S2,
   `translate_grid` lists Y4.B14.S3). *Suggested: the lead drops them when merging. This file routes those steps
   elsewhere.*
