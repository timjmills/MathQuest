# Critic round 2: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit ceed2e1f, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL (much improved)

| Year | Steps graded | Mean | Mean, random 20 only | Round 1 mean | Steps under 8 |
|---|---|---|---|---|---|
| Y2 | 40 | **7.53** | 7.50 | 6.65 | 15 |
| Y3 | 42 | **7.45** | 7.60 | 6.73 | 18 |

Distribution:
- **Y2:** 9 ×1 · 8 ×24 · 7 ×11 · 6 ×3 · 5 ×1
- **Y3:** 8 ×24 · 7 ×13 · 6 ×5

Round 1's five defects are fixed or nearly fixed. Across both whole files:
- no `opts.note` is left;
- every money skill carries `currency:'usd'`;
- no step's own build appears in its `preBuild`;
- no step has an empty related list;
- no "same cluster" padding is left;
- the pre and related lists never share a key;
- a title-based range scan finds no direct skill that leaves its step's number range.

The direct skills and verdicts are now mostly honest.

It still fails for two reasons:
- **Both means are below 8.**
- **Two systematic defects are new or remain (S6, S7).** Both come from the pre-skill builder: the obvious earlier
  step is pushed out of pre or sent to related, and measurement steps get one pre entry or none.

There is also a scattered set of wrong opts, reused proposals and missed live partials (S8). These are fewer than in
round 1, but each one costs its step 1 to 3 points.

## Method

- **Sample:** `random.Random(31337)` for Y2 and `random.Random(27182)` for Y3, 20 steps each, drawn from the step ids in
  file order.
- **Hard steps:** I added 5 for Y2 and 6 for Y3, covering money, measure, fractions, missing number or inverse, place
  value bands and word problems.
- **Round 1 failures:** I re-checked all 18 failing Y2 steps and 19 failing Y3 steps from `Y2-Y3-critic.md`. Some
  overlap with the sample, so 15 + 16 are counted separately.
- **For each step:**
  - I read the title, CCSS, vocabulary, note and US adaptation in `wrm-steps.json`.
  - I read the matching lesson row and that week's prior-learning list in the Grade 1 or Grade 2 sheet of the xlsx
    (openpyxl).
  - I generated 8 items of every direct and partial skill with `generateQuestionFor`, using the recorded opts and NEW
    seeds (60013 + 131i). I did not trust the items log.
  - I read each skill's option schema, and searched `data.js` and the proposals for live skills and options that were
    missed.
- **Whole-file scripts:**
  - S2, S4 and S5 counts, R10 (pre = related) and empty lists.
  - A strict off-topic pre check by key family.
  - Related entries that are really earlier steps.
  - A degenerate-items scan: 12 items per direct skill, flagging ≤ 2 distinct answers.
  - A title-range scan ("to 20", "within 100", "1,000"): the largest number in the text and payload against the step's
    limit.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3-r2/`.
The scripts are `sample.py`, `ctx.mjs` (step context + 8 items), `skills.mjs`, `sys.py`, `s1.py`, `swap.py` and
`scan.mjs`. The outputs are `c-Y2S.txt`, `c-Y2HR.txt`, `c-Y3S.txt` and `c-Y3HR.txt`.

## Round 1 defects: status (whole files)

| Defect | Round 1 | Round 2 (Y2 / Y3) | Status |
|---|---|---|---|
| S1 pre from an unrelated domain | 208 / 194 entries | 9 / 14 flagged by a strict key-family check, nearly all real building blocks (counting in steps for scales, tables and charts) | **Fixed** for cross-topic noise. Same-topic noise remains: odd/even pre on non-odd/even ×/÷ steps 2 / 7 entries (Y2.B5.S13; Y3.B3.S4, B4.S1, B4.S3, B4.S6, B4.S10) |
| S2 `opts.note` instead of options | 34 / 27 | 0 / 0; money without `usd` 0 / 0 | **Fixed** |
| S3 inherited verdicts | many | verdicts are now generated; a few wrong opts and wrong reuses remain (see S8) | Mostly fixed |
| S4 related padding or empty | 18 empty | 0 empty, 0 "same cluster" | **Fixed**. Some "neighbouring step" noise remains (reading_ruler beside angles, count_by_tables beside ordering) |
| S5 own build in preBuild | 7 / 11 | 0 / 0 | **Fixed** |
| R7 range outside the step | — | 0 / 0 (title scan) | Pass |
| R10 pre = related | — | 0 / 0 | Pass |

## Systematic defects that remain

### S6. The step before is sent to related, or crowded out of pre (NEW, systematic)
The builder fills related from neighbouring steps (`for d of [-1,1,-2,2]`). It also lets a hand-chosen related key
block that key from pre. As a result, the skill of an EARLIER step often lands in related, while pre lacks it. Brief
rule 4 puts "the step just before in the same block" in pre. Related (rule 5) is for another form, the inverse or the
next step.

- **Scale:** whole-file count of auto "neighbouring step" related entries that point to an earlier step in the same
  block: **27 on 27 Y2 steps and 31 on 28 Y3 steps**. Counting every related key that is a direct skill of an earlier
  step in the same block gives 48 (Y2) and 65 (Y3). Some of those are a legitimate inverse, such as `div_facts`.
- **Damaging cases in the sample:**
  - Y3.B1.S13 Order numbers to 1,000: `placevalue:compare` (S12, "the step inside ordering") is related; pre is
    count_by_tables, number line and more_less_100.
  - Y2.B3.S8 / S9 Count faces / edges: `name_3d_shapes` and `shape_name_match_3d` are related; pre has only 2-D
    naming, although the xlsx lists "Recognise and name 3D shapes".
  - Y2.B10.S3 Block diagrams: `tally_chart` (S1) is related; pre has no statistics skill.
  - Y2.B4.S9 and Y3.B9.S5 Find change, and Y3.B9.S4 Subtract money: the subtraction skill (`sub_wp_100`,
    `sub_1k_mixed`) is related; pre has no subtraction.
  - Y3.B7.S5 Compare mass: `placevalue:compare` is related; pre is a number line to 100.
- **Crowding:**
  - The cap of 8 entries, with two keys per prior step taken nearest first, pushes out the main building block.
    Examples: Y2.B2.S6 Add by making 10 keeps subtraction counting back (`nl_sub`, `number_line_sub`) but loses
    `make_ten`. Y2.B5.S13 The 10 times-table keeps `odd_even` but loses `seq_10`. Y3.B4.S5 2-digit × 1-digit keeps
    `odd_even` and `select_even_odd` but loses `expand` (Y2 "Partition numbers to 100" is in the xlsx list).
  - `feeds()` drops pv → muldiv unless the title says "count in".

**Fix:**
1. In `build.mjs`, add earlier-step skills from the block to pre, not related. Use d = −1, −2 for pre and d = +1 only
   for related.
2. Let a hand related key block an AUTO pre entry only when it is not the step-before skill.
3. Rank pre by building block, not by distance: the step before, then any xlsx entry whose skill the step's skill
   literally uses (bonds → make 10, compare → order, partition → × 2-digit, count in 10s → 10 times-table, subtraction
   → change), and only then the rest.
4. Drop `odd_even` and `select_even_odd` from every ×/÷ step except Odd and even numbers.

### S7. Measurement steps have one pre entry or none (systematic)
Whole-file count of steps with at most one pre entry: **Y2 8** (B7.S2, S3, S5, S7, B9.S1, B10.S2, B11.S1, B11.S5) and
**Y3 4** (B7.S1, S7, S8, S9).

- The earlier capacity and mass steps share the same partial key (`mass_volume_liquid`), so they are excluded as
  direct.
- The fallback stops at "same topic", and nothing else is added.
- Example: Y3.B7.S7 Measure in ml has one pre, `measurement:capacity`, which deals cups to pints. The scale skill
  (`place_on_number_line`) sits in related, although Y2 puts it in pre.

For ELL/SPED pupils a one-rung ladder is not a ladder.

**Fix:**
- Every measure step gets at least 3 pre entries: the scale or number-line read; counting in 2s, 5s, 10s and 100s
  (`count_by_tables` rows); and the earlier measure skill of the block.
- When that skill is the same key as the step's own partial, add the previous year's measure skill instead
  (`reading_ruler`, `heavier_lighter_visual`).
- Add `nonstandard_capacity` / `capacity_early` only as `preBuild`, never as the only rung.

### S8. Scattered: wrong opts, reused proposals that do not close the step, missed live partials
None of these repeats often enough to be counted as a systematic defect, but each one makes its step wrong:

| Step | Problem | Fix |
|---|---|---|
| Y2.B4.S9 Find change | `money_change {currency:'usd', step:100}` deals **$1 change on 20 of 20 items** (paid with the next whole dollar). The page is degenerate | `{currency:'usd', step:100, paid:'note', band:2000}`, which deals $10 − $6, $20 − $12 and so on |
| Y3.B9.S5 Find change | `{step:5}` with `paid:'unit'` gives change under $1 only (0.10–0.90); WRM pays with notes | Add `paid:'note'`, or mark the step partial |
| Y2.B6.S3 / S4 Compare / order lengths (Grade 1) | Reuses `compare_lengths`, which teaches "mixed units (1 m 20 cm vs 125 cm)": Y3 content. It does not close comparing cm or m lengths in one unit | A new short option, e.g. `compare_lengths_same_unit`, or extend `compare_measures` to lengths |
| Y2.B2.S11 Subtract from a 10 | Reuses `add_next_10`, which teaches 38 + 2, 38 + 5 and "43 − 3". The step is 40 − 3 (from a multiple of 10). Its `missing` and `closes` are the add text copied | Add an option on `add_next_10` (or `sub_from_ten`): subtract ones from a multiple of 10 (40 − 3 = 37) |
| Y3.B2.S2 Add and subtract 1s | Partial `add_100_no_regroup {}` deals 41 + 30 and 20 + 52, so it does not add ones. Neither build closes it: `one_digit_addend` is 2-digit only and `add_sub_patterns` is 3 + 4 / 30 + 40 | Drop the partial (gap), or use `more_less_1_3digit` (already proposed for Y3.B1.S9), extended to ± 1–9 on 3-digit numbers |
| Y3.B11.S3 Compare angles | Marked gap, but `angles_lines:identify_angles` classifies acute, right and obtuse. That is the step's vocabulary, and the same skill is already partial on S2 | Partial with `identify_angles {forms:[0]}`; missing: comparing two angles with a right-angle tester |
| Y2.B10.S3 Block diagrams | Gap, but `measurement:bar_graph_intro` (scale 1, 2–3 bars, how many / how many more) reads a 1-to-1 block chart | Partial; missing: drawing the block diagram, and squares rather than bars |
| Y3.B9.S2 Convert pounds and pence | Gap, but `money_notation {currency:'usd', task:'words'}` deals "75 cents → $0.75" and "6 dollars 5 cents → $6.05" | Partial; missing: cents ↔ dollars both ways (345 cents = $3.45) |
| Y3.B8.S2 Subtract fractions | Full, but `sub_frac_like_nv` deals "Subtract and simplify 7/12 − 3/12 = 1/3" (above Y3), and both skills add compare-to-½ sorts | Partial, or narrow `forms` if an option removes simplify; propose `within_whole` / no-simplify |
| Y2.B1.S14 Order objects and numbers | Full, but only numerals are ordered; ordering objects (base-10 pictures) is not dealt | Partial; a picture option on order |
| Y3.B4.S10 Scaling | Round 1 asked to drop pre `div_remainders` and the odd/even entries: they are still there | Apply S6 |

## Is the rule-13 proposal set right?
- **New proposals:** 5 (Y2) + 11 (Y3). They are short and complete, with `name`, `kindText`, `teaches`, `closes` and
  `representation`.
- **Not already built:** I checked `money_difference`, `make_amount_notes`, `single_fraction`, `time_past_to`,
  `exchange_count`, `compare_measures` and `metric_mass_capacity` against `skill-options.js`. None is built.
- **`retireBuilt` is right.** `money_count kind note/both`, `count_edges_faces_vertices forms` and `count_by_tables`
  50s / 3s rows all generate correctly.
- **Weak points:**
  - The reuses in S8 (`compare_lengths` at Grade 1, `add_next_10` for subtract-from, `one_digit_addend` for 3-digit).
  - 25 (Y2) and 30 (Y3) `closes` entries on gap steps are just the proposal's `teaches` copied. That is acceptable when
    the proposal matches, and misleading where it does not (Y2.B2.S11).
  - `exchange_count` names `add_1k_regroup` as its skill but is also claimed for `multiply` and `box_division_easy`.
    Name the skills (or "every regroup band") in `skill`, so the lead merges it to all of them.

## Bugs found in passing (generator, not tagging)
- `measurement:mass_volume_liquid {forms:[1]}`: 3 of 8 "mass in kg" items have an answer key of **0**.
- Owner questions from the reports still stand (cylinder "3 faces"; `fraction_of_set` ignores `denoms`).

## Scores
Criteria: (a) direct skills right and complete, (b) honest verdict, (c) no missed live skill, (d) proposals close the gap
and fit B&W cells, (e) pre-skills are real earlier learning, (f) related skills share the idea, (g) keys and opts live.

### Y2 (Grade 1): mean 7.53

| Step | Verdict | Score | Finding and fix |
|---|---|---|---|
| **Random 20** | | | |
| Y2.B7.S7 Measure in litres | partial | 7 | Honest partial (`forms:[0]` reads ml only). Pre is one entry (S7) |
| Y2.B5.S6 Use arrays | full | 8 | Right |
| Y2.B2.S6 Add by making 10 | full | 7 | Direct right. Pre keeps `nl_sub` / `number_line_sub` but loses `make_ten` and `number_bonds`, the building block (S6) |
| Y2.B3.S2 Count sides | full | 8 | Right (nonagon and heptagon appear; `band` could cap) |
| Y2.B11.S3 Describe turns | gap | 8 | Right; pre is now filled |
| Y2.B6.S1 Measure in cm | partial | 8 | Honest (`reading_ruler` is inches only); pre is filled |
| Y2.B1.S8 Expanded form | full | 8 | Right, `band:99` |
| Y2.B2.S11 Subtract from a 10 | gap | 6 | `add_next_10` does not teach 40 − 3; missing copied from the add steps (S8) |
| Y2.B9.S1 O'clock and half past | full | 8 | Right |
| Y2.B2.S8 Add to the next 10 | gap | 8 | Right gap and proposal |
| Y2.B3.S4 Draw 2-D shapes | gap | 8 | Right |
| Y2.B1.S14 Order objects and numbers | full | 7 | Objects not ordered (partial); related `count_by_tables` does not share the idea |
| Y2.B5.S13 10 times-table | full | 7 | Direct right. Pre has `odd_even` and lacks `seq_10` (S6) |
| Y2.B4.S6 Compare money | full | 8 | Right; note on the missing US option is honest |
| Y2.B10.S5 Interpret pictograms 1-1 | full | 8 | Right |
| Y2.B5.S17 5 and 10 tables | full | 8 | Right |
| Y2.B10.S3 Block diagrams | gap | 6 | Missed partial `bar_graph_intro`; `tally_chart` is related, not pre (S6, S8) |
| Y2.B3.S6 Complete with symmetry | gap | 7 | Pre fixed. Related (sort shapes, 3-D faces) does not share the idea |
| Y2.B8.S6 Find a quarter | partial | 7 | `shade_fraction` covers shapes; the missing clause omits a quarter of a quantity, the step's focus |
| Y2.B2.S4 Bonds to 100 (tens) | partial | 8 | Right; `bonds_100` fits |
| **Hard 5** | | | |
| Y2.B4.S9 Find change | full | **5** | Opts give $1 change on every item (S8); no subtraction pre (S6) |
| Y2.B7.S6 Measure in ml | full | 8 | Right |
| Y2.B8.S3 Recognise a half | full | 8 | `partition_shapes {parts:[0]}` is halves only: right |
| Y2.B2.S12 Subtract 1-digit across 10 | partial | 8 | Honest; `one_digit_addend` fits |
| Y2.B1.S13 Compare numbers | full | 8 | Right |
| **Round-1 failures re-checked** | | | |
| Y2.B1.S6 Numbers in words | full | 8 | Fixed (`wordform` both, `range:100`) |
| Y2.B2.S14 Add and subtract 10s | partial | 9 | Fixed (`tens_any`) |
| Y2.B3.S8 Count faces | full | 7 | Fixed opts; pre lacks 3-D naming (in related) (S6) |
| Y2.B3.S9 Count edges | full | 7 | Same as S8 |
| Y2.B4.S2 Count money: notes | full | 6 | Verdict fixed. Pre keeps `make_ten` and `add_5_pictures`, which round 1 asked to drop, and lacks counting in 5s and 10s |
| Y2.B4.S3 Notes and coins | full | 7 | Verdict fixed; same pre noise |
| Y2.B4.S10 Two-step problems | gap | 8 | Fixed pre |
| Y2.B6.S5 Four operations with length | gap | 8 | Fixed |
| Y2.B7.S4 Four operations with mass | gap | 8 | Fixed |
| Y2.B8.S4 Find a half | full | 8 | `halve {band:20}` fits. A partial entry under a full verdict is odd: drop it or keep the step partial |
| Y2.B8.S8 Find a third | partial | 7 | A third of a quantity is not in the missing clause |
| Y2.B8.S13 Three-quarters | partial | 8 | Honest |
| Y2.B4.S4 Choose notes and coins | partial | 7 | Right partial and new option. Pre is addition within 20, with no counting in 5s and 10s |
| Y2.B4.S7 Calculate with money | partial | 8 | Fixed (`money_difference`) |
| Y2.B2.S19 Mixed + and − | full | 8 | Pre fixed |

### Y3 (Grade 2): mean 7.45

| Step | Verdict | Score | Finding and fix |
|---|---|---|---|
| **Random 20** | | | |
| Y3.B5.S12 Calculate perimeter | full | 8 | Right |
| Y3.B1.S14 Count in 50s | full | 8 | Right (`count_by_tables` 50s row) |
| Y3.B9.S4 Subtract money | partial | 7 | Honest. Subtraction is related, not pre (S6) |
| Y3.B2.S17 2-digit + 3-digit | partial | 8 | Honest; new option fits |
| Y3.B4.S5 2-digit × 1-digit with exchange | partial | 6 | Partials honest. Pre is `odd_even`, `select_even_odd`, `halve`, sharing; it lacks partitioning and the no-exchange step (S6) |
| Y3.B2.S12 Subtract (no exchange) | full | 8 | Right |
| Y3.B1.S12 Compare to 1,000 | full | 8 | Right |
| Y3.B3.S9 Multiply by 4 | full | 8 | Right |
| Y3.B1.S4 Hundreds | partial | 8 | Honest |
| Y3.B2.S2 Add and subtract 1s | partial | 6 | The partial does not add ones; neither build closes 3-digit ± ones (S8) |
| Y3.B12.S5 Collect and represent data | gap | 7 | Right gap; `tally_chart` is missing from pre |
| Y3.B4.S9 Divide with remainders | full | 8 | Right (dividends small, 10–21) |
| Y3.B7.S3 Measure kg and g | partial | 7 | Honest. Pre is thin (S7); the "0 kg" keys were not noticed |
| Y3.B3.S6 Multiply by 3 | full | 8 | Right |
| Y3.B4.S8 Divide, flexible partitioning | full | 8 | Right |
| Y3.B2.S15 Subtract across 10 | partial | 8 | Honest; `exchange_count` fits |
| Y3.B12.S2 Draw pictograms | partial | 8 | Honest |
| Y3.B10.S4 Digital clock | full | 8 | Right |
| Y3.B1.S7 Flexible partitioning | gap | 8 | Fixed |
| Y3.B9.S2 Convert pounds and pence | gap | 7 | Missed partial `money_notation {task:'words'}` (S8) |
| **Hard 6** | | | |
| Y3.B9.S5 Find change | full | 6 | Change under $1 only (`paid:'unit'`); no subtraction pre (S6, S8) |
| Y3.B7.S7 Measure in ml | full | 7 | Direct right; one pre (`capacity`, cups to pints) (S7) |
| Y3.B8.S2 Subtract fractions | full | 7 | Simplify items above the step (S8) |
| Y3.B2.S21 Inverse operations | full | 8 | Right (within 100; the 3-digit range option exists) |
| Y3.B1.S13 Order to 1,000 | full | 7 | `compare` is related, not pre (S6) |
| Y3.B10.S12 Solve problems with time | full | 8 | Acceptable |
| **Round-1 failures re-checked** | | | |
| Y3.B1.S10 Number line to 1,000 | partial | 8 | Fixed |
| Y3.B1.S11 Estimate to 1,000 | partial | 8 | Fixed |
| Y3.B2.S1 Apply number bonds | partial | 8 | Fixed (`add_sub_patterns`, pre bonds) |
| Y3.B2.S19 Complements to 100 | gap | 7 | Right; related `estimate_sum` does not share the idea |
| Y3.B3.S14 8 times-table | full | 8 | Fixed (`constant:[8]`) |
| Y3.B4.S11 How many ways | gap | 8 | Fixed |
| Y3.B7.S5 Compare mass | partial | 7 | Right new proposal; `compare` is related, not pre |
| Y3.B7.S8 Measure l and ml | partial | 7 | Pre is one entry (S7) |
| Y3.B11.S3 Compare angles | gap | 6 | Missed partial `identify_angles` (S8); related `reading_ruler` is noise |
| Y3.B11.S5 Horizontal and vertical | gap | 7 | Right gap; pre `reading_ruler` / symmetry is weak |
| Y3.B11.S8 Draw polygons | gap | 7 | S5 fixed; related 3-D shapes is noise |
| Y3.B9.S1 Pounds and pence | full | 8 | Fixed (`usd`, `both`) |
| Y3.B9.S3 Add money | full | 8 | Fixed (`step:5`, `usd`) |
| Y3.B5.S5 m and cm | partial | 8 | Fixed (`forms:[1]`, `mm_cm_m`) |
| Y3.B4.S10 Scaling | full | 6 | Pre noise from round 1 is still there (`div_remainders`, `odd_even` ×2) |
| Y3.B7.S9 l and ml | partial | 7 | Honest. One pre (S7) |

## What a pass needs
1. **S6:** pre takes the step before and the true building block first; earlier steps never go to related; drop
   odd/even from ×/÷ pre.
2. **S7:** every measurement step gets at least 3 real pre rungs (scale reading, counting in steps, the previous
   year's measure skill).
3. **S8, step by step:**
   - Fix the opts: `money_change` `paid:'note'` on both Find change steps.
   - Add the 3 missed partials: `bar_graph_intro`, `identify_angles`, `money_notation {task:'words'}`.
   - Replace the 3 wrong reuses: `compare_lengths` at Grade 1, `add_next_10` for "subtract from a 10",
     `one_digit_addend` / `add_sub_patterns` for 3-digit ± ones.
   - Downgrade Y3.B8.S2 and Y2.B1.S14 to partial.
4. Re-run the S6/S7 counts (`swap.py`, `sys.py` in the scratch folder): auto earlier-step related → 0; pre ≤ 1 entry → 0.
