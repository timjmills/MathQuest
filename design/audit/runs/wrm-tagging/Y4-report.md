# Wave 2 tagging: Y4 (Grade 3) report, round 3

Output: `data/curriculum/links/Y4.json`. It is built by `python3 tests/scripts/wrm-tagging/build.py` from the hand-written
specs `tests/scripts/wrm-tagging/spec*.py`, plus `wrm-steps.json` and two generated inputs (`keys.mjs` makes the live
keys, proposals and tags; `prior.mjs` makes the Grade 3 xlsx prior-learning lists). Round 3 is `spec_zz_r3.py` and
`spec_zz_s_envision.py`. The generated items are in `Y4-items.md`. `items.mjs <out> [step ids]` regenerates them, and
`optcheck.mjs` checks every option value.

## Counts

| | Round 2 | Round 3 |
|---|---|---|
| Steps | 129 | 129 (14 blocks, none skipped) |
| Full | 56 | **48** |
| Partial | 50 | **60** |
| Gap | 23 | **21** |
| Proposals used | 68 (17 new, 51 reused) | **68 (20 new, 48 reused)** |
| Tag fixes | 76 (hand list) | **151, derived** (add 45, full 36, opts 31, partial 28, remove 11) |
| Pre / related entries | 528 / — | 517 / 367; none empty, **0 keys in both** |
| Option values checked | — | 310 opts entries, 0 problems (`optcheck.mjs`) |

**New proposals (20).** All are options on live skills, except `roman_numerals`, which is one new skill.
- `regroup_thousands`, `more_less_all`, `roman_numerals`, `add_sub_place_units`
- `exchange_count_add`, `exchange_count_sub` (now on every regroup band)
- `area_half_squares`, `div_by_itself`, `factor_pair_strategy`, `scaled_fact_family`, `div_exchange`
- `improper_mixed_dir`, `tenths_only`, `dec_fraction_basics`, `dec_nl_past_1`, `div10_small_numbers`, `dec_same_whole`
- `money_compare_written`, `coord_forms_fix`, `coord_polygon_draw`

**Dropped as already built:** `dec_compare_2dp`, `dec_order_2dp` (the `decimals` option is 1 or 2) and `time_convert`
(`unit_conversion_word {units:[0]}`). **Replaced** by `roman_numerals`: `roman_100` and `roman_12` (and `roman_1000`
for Y5).

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
