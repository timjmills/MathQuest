# Critic: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10, against `data/curriculum/links/Y2.json` and `Y3.json` at commit 6eb10d68, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. The tagging data was not edited.

## Verdict: FAIL

| Year | Steps graded | Mean | Mean, random 20 only | Steps under 8 |
|---|---|---|---|---|
| Y2 | 26 | **6.65** | 6.55 | 18 |
| Y3 | 26 | **6.73** | 6.75 | 19 |

Neither year reaches a mean of 8, and the sample shows five systematic defects (S1–S5). Each one repeats on steps
that were not sampled. The direct-skill column is mostly right where a skill really fits. The weak points are the
pre-skills, the option values and verdicts that were inherited without being checked.

## Method

- **Sample:** `random.Random(20261010)` for Y2 and `random.Random(20261011)` for Y3, 20 steps each, drawn from the
  step ids in file order. I also chose 6 hard steps per year (money, measure, fractions, missing number, word
  problems).
- **For each step:** I read the title, CCSS, notes and vocabulary in `wrm-steps.json`, and the matching xlsx lesson
  row with its week's prior-learning list (Grade 1 / Grade 2 sheets). I generated 8 items of every direct and partial
  skill with `generateQuestionFor`, using the tagged opts with `note` removed, since `note` is not an option. Where an
  option looked relevant, I generated again with the real option values. I read `skill-options.js` for every direct
  skill, and searched `data.js`, `SKILL_CATALOGUE.md`, `wrm.js` and `build-list.js` for skills and proposals the
  tagger missed.
- **Liveness (g), over all 3,413 keys in both files:** 0 dead keys, 0 retired alias ids, 0 direct keys repeated in pre
  or related. This criterion passes everywhere.

Scratch files: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3/`
(`sample.py`, `ctx.py`, `gen.mjs`, `items-Y2.txt`, `items-Y3.txt`, `live.mjs`, `prestat.py`).

## Systematic defects

### S1. Pre-skills come from the whole week's prior-learning list, unfiltered
The xlsx prior-learning list belongs to the week, and a week usually spans two or three blocks. The script takes every
entry in the list and ranks them, but it never asks whether an entry is prior learning for *this* step. Examples:

- Y2.B6.S5 Four operations with lengths: pre includes `money_count`, `coin_value`, `heavier_lighter_visual` and
  `tens_foundation_visual`. `preBuild` is `nonstandard_mass`. It has no addition or subtraction word-problem pre-skill.
- Y2.B4.S10 Two-step money problems: pre includes `compare_objects`, `order_objects_length`, `reading_ruler`,
  `measure_nonstandard` and `heavier_lighter_visual` (5 of 8 entries).
- Y2.B9.S2 Quarter past and quarter to: `preBuild` is `nonstandard_capacity` and `capacity_early`.
- Y2.B3.S6 Complete a symmetric shape: pre includes `equal_or_unequal_groups` and `number_bonds`. `preBuild` is
  `part_whole`.
- Y3.B4.S11 How many ways: pre includes `mass_volume_liquid`, `heavier_lighter_visual` and `place_on_number_line`.
  `preBuild` is `nonstandard_capacity`, `nonstandard_mass` and `capacity_early`.
- Y3.B7.S5 Compare mass: pre includes `fractions:identify` and `write_fraction`. `preBuild` is `length_ops` and
  `frac_count`.
- Y3.B7.S9 Equivalent capacities: pre includes arrays, `seq_2` and `seq_5`. Related includes `elapsed_find_duration`.

A crude check shows the scale. Of the pre entries taken from the week list, 208 of 703 (Y2) and 194 of 799 (Y3) come
from a prior step that shares no CCSS domain with the target step. They touch 76 Y2 steps and 78 Y3 steps.
`preBuild` is off-domain 22 times in Y2 and 37 times in Y3.

When the week row is a Test row, pre is empty, even when the next week's list names the obvious prior step:
Y2.B6.S1 (no `measure_nonstandard`), Y2.B11.S3, Y2.B11.S5 and Y3.B12.S6. For ELL/SPED pupils this is the most
damaging defect, because pre-skills are the ladder the teacher drops down.

**Fix:** keep a week-list entry only when it shares a CCSS cluster with the step, or the hand override says so. After
that, fill from the step before and from lower-grade skills on the same cluster. Never leave pre empty. Apply the same
filter to `preBuild`.

### S2. Option values are written as free-text `note`, not as the real options
There are 61 direct entries with `opts: {note: ...}` (34 in Y2, 27 in Y3). They sit on 51 steps, and every one of
those steps is marked `full`. The White Rose page reads `opts`. With `note`, the page deals the skill's default, and
the default is often not the step. I checked these by generating items:

| Step | Tagged | Default deals | Real option that exists | With the option |
|---|---|---|---|---|
| Y3.B3.S14 The 8 times-table | `mult_facts {note:"constant 8"}` | 12×8, 4×7, 11×7, 3×5 | `constant:[8]` | 8×7, 8×6, 8×4 |
| Y3.B4.S5 2-digit × 1-digit | `multiply {note:"2-digit × 1-digit"}` | 5×7, 6×7, 7×3 | `tiles:21` | 36×8, 82×4 |
| Y3.B5.S5 m and cm | `length_metric {note:"m and cm"}` | mm in 9 m, m in 10 km | `forms:[1]` | cm in 5 m |
| Y3.B7.S9 l and ml | `capacity {note:"L and mL"}` | cups to pints, sorting | `units:[1], forms:[0]` | 3 L = ___ mL |
| Y2.B1.S6 Write numbers in words | `number_word_form {note:"Max Number 100"}` | words to numeral (reading) | `wordform:['to_words']` | 36 → thirty-six |
| Y2.B1.S1 Numbers to 20 | `base10_build {note:"numbers to 20"}` | 21, 70, 86 | `band:20` | (to 20) |
| Y2.B8.S4/S8/S13 half, third, three-quarters | `shade_fraction {note:"1/2"}` etc. | 4/6, 6/8, 5/6, 2/5 of 40 | `denoms:[2]` / `[3]` (a family, not one fraction) | halves, quarters, eighths |

Money skills also never set `currency:'usd'`, even though owner answer 1 in the report says the school uses US
dollars. The default is plain numbers with no sign.

**Fix:** translate every `note` into real option ids from `skill-options.js`. Where no option can narrow the page to
the step (for example "halves only"), mark the step `partial` and propose the option.

### S3. Verdicts were inherited from SKILL_WRM, not verified, and they are wrong in both directions
The report's rule says a step is "full when a direct skill exists and no open proposal names it". That rule never
reads the generator, so the result depends on whether an old proposal happens to list the step.

**Over-claimed full:**

- **Y2.B2.S14 Add and subtract 10s.** `add_sub_10s` deals only a decade ± 10 (16 of 16 items: 70 − 10, 0 + 10).
  WRM, CCSS 1.NBT.C.4 and the vocabulary "add 20", "subtract 30", "stays the same" all need 34 + 20. The existing
  STANDARD_PROPOSAL `tens_any` (`build-list.js`) closes this, and the tagger missed it. The same defect is on
  Y3.B2.S3, which was not sampled.
- **Y3.B2.S1 Apply number bonds within 10.** `add_facts` and `sub_facts` are within-20 facts. The step applies bonds to
  tens and hundreds (30 + 40, 300 + 400), and the step's note says so. The existing WRM_PROPOSAL `add_sub_patterns`
  closes it, and the tagger missed it.
- **Y2.B4.S7 Calculate with money.** `money` only adds whole-dollar prices. Finding the difference (the "difference"
  vocabulary) is not dealt.
- **Y2.B4.S4 Choose notes and coins.** `make_change_least_coins` uses coins only and asks for the fewest coins. The step
  is about choosing notes and coins to make an amount.
- **Y2.B8.S4, S8 and S13.** These are full only through `note`. See S2 and the `fraction_of_set` bug below.

**Stale partial or gap** (the option is already built, but the old proposal is reused as if it were open):

- **Y2.B4.S2 and S3 (money_uk).** `money_count` has `kind:'note'` (notes) and `kind:'both'` (notes and coins, two
  numbers). I generated both. With `currency:'usd'` the steps are full.
- **Y2.B3.S8 Count faces (shape_faces).** `count_edges_faces_vertices` has `forms` = Faces / Edges / Vertices. S8 is
  marked partial and S9 (edges, same skill, same issue) is marked full. The two are inconsistent, and both should be
  full with `forms:[0]` / `forms:[1]`.
- **Y3.B1.S10 Number line to 1,000.** The missing clause "the skill's lines are to 100" is false.
  `place_on_number_line {span:100, band:1000}` deals 970 on a 900–1,000 line. What is really missing is a 0–1,000
  line counted in 100s, and reading the value at an arrow.

**Fix:** for every `full`, generate 8 items with the tagged opts and compare them with the step title and note. For
every reused proposal, check `skill-options.js` to see whether it has already been built. If it has, tag the option
and add the proposal to a "built, retire" list for the lead.

### S4. Related skills are padded by "same cluster", and measurement steps get none
"Same cluster" picks skills that share a code but not the idea. Examples: `time_fives_ring` (count minutes) is related
to place value in Y2.B1.S6, Y3.B1.S1 and Y3.B1.S4. `compose_hexagon` is related to finding a half and to recognising
three-quarters. `elapsed_find_duration` is related to equivalent lengths and capacities.

Meanwhile 18 steps have no related skills at all: Y2.B6.S2–S5, Y2.B7.S2–S4, S6, S7, S9, and Y3.B5.S2, S7, S8,
Y3.B7.S1, S2, S6, S7, S11. This is because the method skips measurement clusters entirely. Those steps need the
neighbouring measure skills, for example `reading_ruler` for `length_metric`, and `mass_volume_liquid` for `capacity`.

### S5. The step's own build is listed as its prerequisite
`build` and `preBuild` share an id on 7 Y2 steps (B1.S9–S11, B3.S7, B3.S11, B5.S8, B7.S5) and 11 Y3 steps (B1.S3,
B1.S7, B1.S10, B1.S11, B2.S6, B2.S8, B6.S8, B6.S9, B7.S6, B7.S11, B11.S8). For example, `flex_partition` is listed as
a pre-build of Flexible partitioning. Something cannot be a prerequisite of itself. Drop it from `preBuild`.

## Is "0 new proposals" believable?

Mostly, but not fully. WRM_PROPOSALS is broad, but several reuses do not close the gap they are mapped to:

- **Y3.B7.S5 Compare mass and Y3.B7.S10 Compare capacity → `mass_ops`.** `mass_ops` teaches the four operations in
  context, not comparing 450 g with 1 kg using <, >, =. These steps need a compare task: an option on `mass_ops` or a
  new `compare_measures`.
- **Y2.B4.S7 Calculate with money.** No proposal covers finding a difference between two amounts. It needs an option:
  subtraction or difference on `measurement:money`.
- **Y2.B4.S4 Choose notes and coins.** It needs a "make the amount any way, with notes" option on
  `make_change_least_coins` or `equiv_coin_sets`.
- **Y2.B8.S3–S8 single-fraction pages ("Find a half").** These need a "one fraction" option on `shade_fraction` and
  `fraction_of_set`, because `denoms` picks a whole family.

That is 3–4 new options from 12 sampled steps in these areas. Expect more across the unsampled measure and money
steps. Two existing proposals were missed (`tens_any`, `add_sub_patterns`), and two are stale because already built
(`money_uk`, `shape_faces`).

**Bug found in passing (not tagging):** `fractions:fraction_of_set` ignores its `denoms` option in the
missing-numerator and some word variants. With `{denoms:[3]}` it deals "?/5 of 40 = 16", "?/2 of 18" and
"?/4 of 24".

**Content question for the owner:** `count_edges_faces_vertices` answers "a cylinder has 3 faces". WRM Y2 teaches that
a cylinder has 2 flat faces and 1 curved surface (the step's vocabulary is "flat, curved surface").

## Scores

Criteria: (a) direct skills right and complete, (b) honest verdict, (c) no missed live skill, (d) proposals close the
gap and fit B&W cells, (e) pre-skills are real earlier learning, (f) related skills sensible, (g) keys live.

### Y2 (Grade 1): mean 6.65

Distribution: 9 ×2 · 8 ×6 · 7 ×3 · 6 ×11 · 5 ×4

| Step | Verdict | Score | Finding and fix |
|---|---|---|---|
| Y2.B1.S1 Numbers to 20 | full | 8 | `teen_compose` fits; `base10_build` should carry `band:20`, not a note |
| Y2.B1.S6 Write numbers to 100 in words | full | **6** | The default deals words → numeral (reading). Set `wordform:['to_words']` or both. Drop pre `add_5_pictures`, `preBuild` `part_whole` and related `time_fives_ring` (S1, S4) |
| Y2.B2.S6 Add by making 10 | full | 8 | `make_a_ten` fits; `add_10_regroup` is column practice only |
| Y2.B2.S7 Add three 1-digit numbers | full | 9 | Right |
| Y2.B2.S14 Add and subtract 10s | full | **5** | Should be **partial**: `add_sub_10s` deals only decade ± 10. Add build `tens_any` (S3) |
| Y2.B2.S17 Subtract 2-digit (no exchange) | full | 8 | Fine; pre `add_100_regroup` is weak, so add `sub_50_no_regroup` |
| Y2.B3.S5 Lines of symmetry | full | 8 | Fine (the skill also deals 4- and 6-line shapes) |
| Y2.B3.S6 Complete with symmetry | gap | **7** | Gap and `symmetry_complete` are right. Remove pre `equal_or_unequal_groups`, `number_bonds` and `preBuild` `part_whole` (S1) |
| Y2.B3.S8 Count faces on 3-D shapes | partial | **6** | Should be **full** with `count_edges_faces_vertices {forms:[0]}`; `shape_faces` is already built (S3). Raise the cylinder = 3 faces question |
| Y2.B3.S9 Count edges on 3-D shapes | full | **7** | Add `forms:[1]`; without it the page mixes faces and vertices |
| Y2.B4.S2 Count money: notes | partial | **6** | Should be **full**: `money_count {kind:'note', currency:'usd'}`; `money_uk` is stale. Drop pre `make_ten`, `add_5_pictures` |
| Y2.B4.S3 Count money: notes and coins | partial | **6** | Should be **full**: `money_count {kind:'both', currency:'usd'}` (S3) |
| Y2.B4.S10 Two-step problems | gap | **6** | Gap and `money_2step` are right. Replace the length and mass pre-skills with `money`, `money_change`, `add_wp_100`, `sub_wp_100`; drop `preBuild` `nonstandard_mass` (S1) |
| Y2.B6.S5 Four operations with lengths | gap | **5** | Gap and `length_ops` are right. Pre is half money and mass: use `reading_ruler`, `add_wp_100`, `sub_wp_100`, `mult_facts {constant:[2,5,10]}`. Add related (`reading_ruler`, `estimate_length`) (S1, S4) |
| Y2.B7.S4 Four operations with mass | gap | **6** | Gap and `mass_ops` are right. Only 3 pre, none of them arithmetic: add `add_wp_100`, `sub_wp_100`. Related is empty (S4) |
| Y2.B8.S4 Find a half | full | **5** | Should be **partial**: `note:"1/2"` is not an option. `denoms:[2]` still deals quarters and eighths, and `fraction_of_set` ignores `denoms` (bug). Missed live skill: `patterns:halve` is direct for half of a quantity. Propose a "one fraction" option. Related `compose_hexagon` is noise |
| Y2.B8.S8 Find a third | full | **5** | Same as S4: should be partial. Drop pre `seq_5`, `seq_10`, `tens_foundation_visual` |
| Y2.B8.S13 Recognise three-quarters | full | **6** | `identify` and `write_fraction` default to mixed denominators (5/6, 1/5). Use `denoms:[2]` at least; partial without a one-fraction option |
| Y2.B9.S2 Quarter past and quarter to | full | 8 | Right (`quarters` option exists). Drop `preBuild` capacity entries |
| Y2.B11.S3 Describe turns | gap | **6** | Gap and `turns` are right. Pre is empty: add `shape_positions` and `preBuild` `turns` (Y1.B11.S1) (S1) |
| Y2.B4.S4 Choose notes and coins (chosen) | full | **6** | Should be **partial**: coins only, and "fewest" is a different task; notes are missing. Needs an option (S3) |
| Y2.B4.S7 Calculate with money (chosen) | full | **6** | Should be **partial**: finding a difference is missing. Set `currency:'usd'` and propose a subtraction option |
| Y2.B6.S1 Measure in centimetres (chosen) | partial | **6** | Partial and `ruler_cm` are right. Pre is empty although the W21 list names `measure_nonstandard` and `compare_objects` (S1) |
| Y2.B2.S21 Missing number problems (chosen) | full | 9 | Right |
| Y2.B8.S9 Find the whole (chosen) | gap | 8 | Right (`fraction_parts` draws the whole). Related `compose_hexagon` is noise |
| Y2.B2.S19 Mixed addition and subtraction (chosen) | full | **7** | Direct is right. Drop pre `seq_2`, `seq_5`, `seq_10`, `skip_count_line` and `preBuild` `money_notes` (S1) |

### Y3 (Grade 2): mean 6.73

Distribution: 9 ×1 · 8 ×6 · 7 ×11 · 6 ×3 · 5 ×3 · 4 ×2

| Step | Verdict | Score | Finding and fix |
|---|---|---|---|
| Y3.B1.S1 Represent numbers to 100 | full | 8 | Right; related `time_fives_ring` is noise |
| Y3.B1.S4 Hundreds | partial | 8 | Honest; `count_50s` fits |
| Y3.B1.S7 Flexible partitioning to 1,000 | gap | **7** | Right gap. `flex_partition` is in both `build` and `preBuild` (S5) |
| Y3.B1.S10 Number line to 1,000 | partial | **7** | The missing clause is false: `place_on_number_line {span:100, band:1000}` exists. Tag it with opts; missing = a 0–1,000 line in 100s and reading the arrow. Remove `nl_20` from `preBuild` (S3, S5) |
| Y3.B1.S11 Estimate on a number line to 1,000 | gap | **7** | `place_on_number_line {span:100, band:1000}` is a partial cover (mark between hundreds): make it partial (S5) |
| Y3.B2.S1 Apply number bonds within 10 | full | **4** | Should be **partial**: within-20 facts are not "30 + 40, 300 + 400". Add partials `add_sub_10s` and `add_sub_100s`, and build `add_sub_patterns` (existing, missed). Pre is 8 near-duplicate add-within-20 skills; use `number_bonds` and `make_ten` (S3) |
| Y3.B2.S19 Complements to 100 | gap | **7** | Gap and `bonds_100` are right. Pre `sub_1k_mixed` (step before) is irrelevant; `add_sub_10s` does not teach bonds to 100 |
| Y3.B3.S3 Multiples of 2 | partial | 8 | Honest; fine |
| Y3.B3.S14 The 8 times-table | full | **7** | Use `mult_facts {constant:[8]}`, not a note (S2). Add the 4 times-table (`constant:[4]`) as the nearest pre (8 = double 4) |
| Y3.B4.S5 2-digit × 1-digit with exchange | full | **6** | The default `multiply` deals 5 × 7, and `area_model_mult` deals 3 × 386. Set `multiply {tiles:21}`; `area_model_mult` needs a 2-digit band or partial (S2) |
| Y3.B4.S8 Divide, flexible partitioning | full | 8 | `area_model_div_2by1` partitions (98 = 84 + 14): right |
| Y3.B4.S11 How many ways | gap | **5** | Gap and `how_many_ways` are right. Pre and `preBuild` are mass and capacity noise (S1). Use `mult_facts`, `arrays_groups`, `mult_word_problems` |
| Y3.B5.S10 What is perimeter | full | 8 | Right |
| Y3.B7.S3 Measure kg and g | partial | **6** | Honest, and `mass_scales` fits. Pre is only 2 addition skills: add `heavier_lighter_visual` and `unit_conversions`. Drop capacity `preBuild`. Related has 1 entry (S1, S4) |
| Y3.B7.S5 Compare mass | partial | **4** | `mass_ops` (four operations) does not teach comparing g and kg with <, >: needs a compare option or new skill. Pre `fractions:identify` and `write_fraction` and `preBuild` `length_ops` and `frac_count` are noise (S1) |
| Y3.B7.S8 Measure l and ml | partial | **6** | Honest. Pre is fraction and order skills from the week list; `preBuild` `frac_count` and `fraction_parts` are noise (S1) |
| Y3.B11.S3 Compare angles | gap | **7** | Right gap. `preBuild` `position_map` and `scenes` are noise |
| Y3.B11.S5 Horizontal and vertical | gap | **7** | Right gap; acceptable |
| Y3.B11.S8 Draw polygons | gap | **7** | Right gap; `shape_draw` is in both `build` and `preBuild` (S5) |
| Y3.B11.S9 Recognise 3-D shapes | full | 8 | Right; `preBuild` `turns` is noise |
| Y3.B9.S1 Pounds and pence (chosen) | full | **7** | Set `money_count {kind:'both', currency:'usd'}` and `money_notation {currency:'usd'}` (S2) |
| Y3.B9.S3 Add money (chosen) | full | **7** | The default adds whole dollars. Set `money {step:25 or 5, currency:'usd'}` to reach dollars and cents (S2) |
| Y3.B5.S5 Equivalent lengths m/cm (chosen) | full | **5** | The default deals mm in m and m in km. Set `forms:[1]`. Mixed units (1 m 20 cm = 120 cm) are still missing → partial. Related `elapsed_find_duration` is noise (S2, S4) |
| Y3.B8.S6 Reasoning with fractions of an amount (chosen) | partial | 9 | Honest; `frac_amount_wp` fits |
| Y3.B4.S10 Scaling (chosen) | full | **7** | Direct is right. Pre `div_remainders`, `add_sub_fact_family` and `preBuild` `flex_partition` are noise |
| Y3.B7.S9 Equivalent l and ml (chosen) | full | **5** | The default deals cups and pints. Set `units:[1], forms:[0]`, and note that it deals 1.5 L and 0.25 L decimals (above the step). Pre arrays and `seq_2`/`seq_5` are noise (S1, S2) |

## What a pass needs (for the re-tag)

1. Filter pre and `preBuild` to the step (S1). Fill the four empty pre lists.
2. Replace every `opts.note` with real option ids. Add `currency:'usd'` to money steps (S2).
3. Verify every `full` by generating items. Re-check every reused proposal against `skill-options.js`. Flip the three
   stale partials to full and the over-claims to partial with the missed proposals `tens_any` and `add_sub_patterns`
   (S3). Extend the same check to the unsampled twins: Y3.B2.S3, the Y2.B5 and Y3.B3 times-table steps, and the
   Y2.B8 and Y3.B6 fraction steps.
4. Give measurement steps related skills, and drop "same cluster" entries that do not share the idea (S4).
5. Remove a step's own build from its `preBuild` (S5).
6. Add the 3–4 options listed under "0 new proposals".
