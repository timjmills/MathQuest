# Y5 (US Grade 4) WRM tagging — local critic, round 1 (brief rules 1–19)

Critic: independent local critic (Opus, medium effort), 2026-10-10. This is a critique only: `Y5.json` is not edited.
Graded: `data/curriculum/links/Y5.json` at a181f8a4 (136 steps, 84 proposals, 114 tagFixes), against
`design/audit/runs/wrm-tagging/BRIEF.md` on `claude/sweet-newton-c8wrv1` (rules 1–19 and the owner rulings).
The helper's own critic passed it at 8.00, but under rules 1–13. That critic graded 28 steps, ran no merge simulation
and did no school-week check.

## Verdict: FAIL

- Random 20 (seed 20261010): **mean 6.30**. Distribution: 8 ×1, 7 ×7, 6 ×9, 5 ×3. Lowest 5.
- Random 20 plus the 5 hardest: **mean 6.08**. Lowest 5.
- **Merge simulation: FAIL.** 80 problems.
  - 23 steps that Y5.json calls partial come out FULL after the merge.
  - 48 partial clauses differ from Y5.json.
  - 2 tagFixes "add" a tag that already exists.
  - 7 partial steps list direct (full-tagged) skills.
- Systematic classes: 863 of 894 pre/related links have no opts (rule 18); links taught too early by school week
  (rule 19); and tagFix derivation. All three are file-wide.

The PASS bar is mean ≥ 8, no step < 7 and no systematic class. This file misses all three.

## Method

**Items.** All items were generated on the print path with `generateQuestionFor`, seeded, with `itemIndex` and
`itemCount` set. Code was the y5 worktree; its generators equal current `claude/sweet-newton-c8wrv1` (the 47 commits
since the merge base touch only print/teacher files). Fresh seeds were used, none from the helper's runs.
- Direct and partial skills: 60 items each, from seed sets (30113, +7), (7741, +31) and (500009, +89), 20 items per set,
  with the opts Y5.json lists.
- Every pre and related link: 100 items, from five seed sets (50511, +13), (8803, +41), (270719, +97), (6007, +23) and
  (99991, +61), 20 items each, with the link's opts. Max Number is 10,000 when the link names none.
- I read the text, every part of the answer, the printed options/tiles/bins, the visual's labels and the cell payload.

**School weeks.** Every Y5 step was matched by title to the "Grade 4" sheet of `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`
(136 of 136 matched). Week of first teaching, from that sheet:

| Content | First taught (Grade 4) | | Content | First taught (Grade 4) |
|---|---|---|---|---|
| prime / composite | W02 | | percent | W22 |
| place value past 10,000 | W05 (to 100,000), W06 (to 1,000,000) | | degrees | W23 (protractor W25) |
| ×/÷ 1,000; decimal results of ÷10/100 | W10 | | translation / reflection; coordinates past 10 | W27 |
| 2-digit × 2-digit | W11 | | customary units | W33 |
| 4-digit ÷ 1-digit | W12 | | 3-digit × 2-digit | W34 |
| thousandths | W12 | | rounding decimals | W35 |
| decimal ± decimal | W13 | | volume; line graphs | W36 |
| unlike (related) denominators ± | W17 | | square / cube numbers | W37 |
| fraction × whole | W19 | | negative numbers | W38 |

The school's Grade 4 order is far from WRM order. It opens with Y5.B3 (multiples, factors, primes) and B2.S8 in
W01–W02, then B5.S6/S11 in W03, decimal sequences (B12.S9) in W05, and place value only from W05. Rule 19 therefore bites
hard on this year.

**Merge simulation.** I applied Y5's 114 tagFixes to `SKILL_WRM` from current `claude/sweet-newton-c8wrv1`
`js/modules/wrm.js`, then compared the result with Y5.json:
- every direct skill must be FULL;
- every partial skill must be PARTIAL with Y5.json's `missing` clause;
- nothing else may be tagged to a Y5 step.

**Scripts.** All critic scripts are in my scratch folder, not the repo:
- `mergesim.mjs`;
- `linkfit5.mjs`, a port of the Y4 lane's `tests/scripts/wrm-tagging/linkfit.mjs` with the Grade-4 table above;
- `direct.mjs`, `static.py` and `probe.mjs`.

## Generator script

There is **no generator script on the y5 branch**: no `tests/scripts/wrm-tagging/` exists at a181f8a4. The helper's
critic mentions `sample.mjs` and `y5prior.json`, but neither was committed. Y5.json was evidently hand- or
session-written. So every class fix below has to be applied to the data. Where it says "generator-level", it is the rule a
script must enforce. The quickest route is to port the Y4 lane's checkers:
- `mergecheck.mjs` and `linkfit.mjs` from `origin/claude/sweet-newton-c8wrv1-wip-wrm-tag-y4:tests/scripts/wrm-tagging/`;
- swap in the Grade-4 week table above;
- run them as gates before each critic round.

## Merge simulation (detail)

| Check | Count | Cause |
|---|---|---|
| Y5.json partial, but merged FULL | **23** | The tag is already FULL in SKILL_WRM and no `partial` tagFix was emitted (the helper never diffed status against wrm.js) |
| Partial clause after merge ≠ Y5.json | **48** | No tagFix has a `partial` field (0 of 53 `partial` actions). The clause can only come from `why`, which is a different, shorter text |
| `add` on a tag that exists | 2 | `area_perimeter:perimeter` Y5.B8.S1 and `area_perimeter:area` Y5.B8.S4 are already FULL |
| Partial step lists direct (FULL) skills | **7** | B1.S3, B1.S4, B1.S5, B1.S8, B5.S4, B5.S7, B5.S11 |
| Missing or extra tags | 0 | — |

The 23 partials that turn FULL on merge (each needs `{action:'partial', partial:<Y5.json clause>}`):
- place value: place_value_disks B1.S3;
- rounding: round_nl_hundred_thousands B1.S9;
- place_on_number_line B1.S9;
- mental addition: compensation B2.S1;
- add_sub_100s B2.S1;
- compare_expressions B2.S7;
- exponents_simple B3.S7;
- mult_zeros B3.S10;
- equiv_frac_visual B4.S1;
- add_frac_unlike_nv B4.S10;
- sub_frac_unlike_nv B4.S14;
- area_model_mult B5.S1;
- mult_word_problems_plain B5.S6;
- division:divide B5.S7;
- mult_frac_whole_nv B6.S1;
- fraction_of_set_nv B6.S7;
- perimeter_grid B8.S2;
- name_2d_shapes B10.S9;
- name_3d_shapes B10.S10;
- net_identify B10.S10;
- unit_conversion_word B14.S1 and B14.S5;
- unit_conversions B14.S3.

For the 7 partial steps with directs, move each direct into `partial` with its own clause, or split the step's verdict. For
example, B1.S3 lists `value{band:99999}`, `identify{band:99999}` and `pv_digit_drag{band:99999}` as direct while the step
is partial.

**Generator-level fix:**
1. Derive tagFixes by diffing Y5.json against live SKILL_WRM: status changes in both directions, plus clause changes.
2. Emit `partial: <the exact missing clause>` on every add or partial of a partial skill.
3. Never put a FULL direct on a partial step.
4. Re-run the merge simulation until it reports 0.

## Defect classes (whole file)

| # | Class | Count | Rule |
|---|---|---|---|
| 1 | **Pre/related links carry no opts.** Defaults deal what the step's pupil has not met | 863 of 894 links (31 have opts) | 18 |
| 2 | **Link content taught too early by school week** (generated) | 80 links: customary 26, rounding decimals 14, percent 11, negatives 8, volume 4, ×1,000 before W10 4, fraction × whole 3, thousandths 2, powers 2, past 10,000 before W05 2, 2-digit × 2-digit before W11 1, unlike ± 1, prime 1, decimal ± 1 | 18, 19 |
| 3 | **Pre cites a step the school teaches later** | 14 | 19 |
| 4 | **Range beyond the step** (link max > 2× the per-step limit) | 72 (33 pre, 39 related) | 7, 18 |
| 5 | **Later-grade content in links** | 24: decimal × ÷ decimal 8, triangle area 6, fraction × / ÷ fraction 6, reflection in an axis 3, ratio 1 | 18 |
| 6 | **False / stale `why`** (names a table, family, band or step range the items do not deal) | 62: names a table 28, cites a step's band but the link has no band opts 22, cited title claim 8, denominator family 4 | 4, 18 |
| 7 | **Overstated FULL verdict** (generated) | 3 confirmed + 1 doubtful: B4.S11, B3.S1, B8.S4; B7.S3 doubtful | 1, 7 |
| 8 | **tagFix derivation** (partials become FULL, clauses differ) | 23 + 48 + 2 | merge |
| 9 | **Partial step lists full directs** | 7 | merge |
| 10 | **Notes used as opts** (the clause names `{forms:[1]}`, `{denoms:[2]}` or "Decimal Places 3", but `opts` is `{}`) | 9: B4.S10, B4.S12, B4.S14, B4.S15, B6.S6, B7.S2, B7.S9 (note), B7.S11, B8.S2 | 2 |
| 11 | **Own build in preBuild** | 14: B1.S8, B1.S9, B2.S8, B4.S5, B4.S16, B5.S5, B7.S6, B7.S7, B12.S2, B12.S4 (×2), B12.S5, B12.S6, B12.S7 | 3 |
| 12 | **Fewer than 3 pre, with no note saying why** | 10: B4.S11, B7.S3, B10.S3, B10.S4, B10.S6, B10.S10, B11.S2, B14.S4, B15.S3, B15.S4 | 15 |
| 13 | **Pre cites a step the skill is not tagged to** | 9 (e.g. B1.S12 between_tens→Y4.B1.S14; B4.S1–S3 fraction_number_line→Y4.B7.S9; B5.S1 mult_facts→Y4.B4.S6; B5.S4 mult_zeros→Y5.B3.S8) | 14 |
| 14 | **Degenerate links** (< 3 distinct items in 100) | 4: B8.S4 and B10.S10 `shapes_early:compose_rect_from_squares` / `shape_name_match_3d` (1 distinct); B9.S5 and B14.S6 `measurement:time_sense` (2 distinct) | 18 |
| 15 | **Proposals have no `closes`** (envisioned-spec shape) | 84 of 84 | 13, 16 |
| 16 | **Owner-ruling conflicts in proposals** | `roman_12` is a separate new skill `measurement:roman_numerals_clock`, but the owner wants one `roman_numerals` skill with bands 12/100/1,000/3,999. `roman_1000` and `thousandths_pv` are options on skills that do not exist | owner |
| 17 | **Proposal already partly built** | `time_convert`: `measurement:unit_conversion_word {units:[0]}` already deals hr/min/sec. Only days/weeks/months/years and small→large are missing | 5, 17 |
| 18 | **Division bracket before short division (W11)** | 2: B5.S11 pre `division:divide`, B3.S9 related | 19 |
| 19 | **Earlier building block listed as related, not pre** | e.g. B1.S1 `placevalue:combine` (additive rule) | 14 |
| — | Per-seed counts in clauses | 0 | — |
| — | Dead keys, pre = related, related repeats a direct | 0 | 6, 10 |

Classes 1, 2, 3, 4 and 8 are systematic. Each reaches many blocks.

## Per-step grades

The four criteria are right directs/opts, honest verdict/clause, useful pre (filtered, week-ordered, ≥ 3) and related
(same idea, fitting). Each score below is for the step as a whole.

| Step | Wk | Verdict | Score | Main reasons |
|---|---|---|---|---|
| Y5.B1.S1 Roman numerals to 1,000 | W01 | gap | 6 | Related `number_word_names {}` deals 979,250 at W01. Pre `cloze_addition` (Y1) and `missing_add_sub` are unfiltered: they serve B2.S8 in the same week, not Roman numerals. `expand {}` deals 3-digit while citing "to 10,000". The additive building block `combine` sits in related. `roman_12` conflicts with the owner's single `roman_numerals` skill |
| Y5.B1.S11 Compare and order to 1,000,000 | W07 | full | 7 | Directs are right (60/60 inside 104,345–993,754). Related `integers:order_negatives` is W38. Pre `identify {}` (3-digit) and `pv_digit_drag {}` (5-digit) cite "Numbers to 1,000,000" with no band |
| Y5.B4.S11 Add fractions, total > 1 | W18 | full | 5 | **Overstated FULL:** in 60+60 items of `add_frac_unlike` / `_nv {denoms:[2]}`, 15 of the 26 computed sums are ≤ 1 (3/4, 1, 7/8). The rest are sorts and "click all sums > 1", not the step. The closing option `frac_total_band` is put in preBuild instead of build. Only 2 pre. Related `estimate_frac_ops` gives negative answers (−0.5) |
| Y5.B4.S12 Add to a mixed number | W18 | partial | 8 | Honest partial and build. Pre well chosen and in week. Related is the inverse. Only minor issue: no opts on the `add_frac_unlike` pre |
| Y5.B4.S13 Add two mixed numbers | W18 | full | 6 | Directs are fine. Related `frac_word_mixed` (yards, 1/3 × 1/2 area) and `mixed_fraction_ops` (fraction ÷ and × fraction, 5.NF; decimals; customary) are wrong. Three "next step" subtract links are padding |
| Y5.B5.S1 4-digit × 1-digit | W11 | partial | 7 | Honest partial and `mult_4x1` (tiles 41 does not exist on multiply, so the proposal is correct). Pre `multiply {tiles:21}` is labelled "3-digit × 1-digit" but deals 2-digit × 1-digit. Pre `mult_facts {}` claims "3, 6 and 9 tables" (18 of 100 items) and cites Y4.B4.S6, which it is not tagged to. Merge turns `area_model_mult` FULL |
| Y5.B5.S11 Solve × and ÷ problems | W03 | partial | 5 | Partial step lists two FULL directs. Pre `divide {}` cites B5.S9 (W12) and `multiply {}` cites B5.S3 (W11): rule 19. `divide` draws the division bracket at W03. `share_into_groups` (Y1) is filler. The 2-digit × 1-digit (Grade 3) building block is missing |
| Y5.B6.S5 Fraction of an amount | W20 | full | 7 | FULL is fair (60 items, /2–/10 of ≤ 100). Related `percent_of_number` is W22. Pre `mult_zeros` ("× 100") is not the building block; it should be `mult_facts` |
| Y5.B6.S6 Find the whole | W20 | partial | 6 | Clause says `{forms:[1]}` but opts are `{}`, so most items are "fraction of", not "find the whole" (note used as opts). Related `find_whole_from_pct` is W22 and reaches 2,000. Pre `mult_zeros` is again not the block |
| Y5.B7.S9 Order/compare any decimals ≤ 3 dp | W22 | full | 7 | FULL is acceptable. The note's "Decimal Places 3" is not recorded in opts. Related `round_thousandths` is W35. preBuild `dec_dp_match` is a ± option and irrelevant to comparing |
| Y5.B8.S2 Perimeter of rectilinear shapes | W29 | partial | 6 | Partial is honest: `composite_shapes {forms:[0]}` labels every side, so no side is ever missing. But the clause names `{forms:[1]}` while opts are `{}`. Pre `perimeter {}` has ft stories (W33). Related `mixed_area_perimeter` deals cube volume (10,648), triangle area and cubic inches |
| Y5.B8.S3 Perimeter of polygons | W29 | partial | 6 | Verdict and build are fine. Pre `perimeter {}` (194 cm, ft stories) and `multiply {}` (909 × 8) for "sides × length" should be `mult_facts`. Only 1 related |
| Y5.B9.S1 Draw line graphs | W36 | gap | 7 | Good gap and build. Pre bar graphs and `coordinate_q1` fit. Related `coordinate_graph {}` plots (−8, 2): negatives are W38 |
| Y5.B9.S2 Read line graphs | W36 | gap | 7 | Same as B9.S1 |
| Y5.B9.S4 Two-way tables | W04 | gap | 7 | Gap, build and preBuild are right. Pre are acceptable. Related `pictograph` totals to 575 (fine for Grade 3 numbers, but a weak "same idea") |
| Y5.B10.S8 Lengths and angles in shapes | W26 | gap | 6 | Pre `additive_angles` cites B10.S7 (W31). Pre `perimeter {}` deals ft (W33) and 194. `classify_quads/triangles` are good |
| Y5.B10.S10 3-D shapes | W26 | partial | 5 | Pre `shape_name_match_3d` is degenerate (1 distinct item in 100). Only 2 pre. Related `area_perimeter:volume` (W36, ft, 7,560) and `net_surface_area` (Grade 6). Merge turns `name_3d_shapes` and `net_identify` FULL |
| Y5.B12.S4 Add decimals, same dp | W13 | partial | 6 | Own build `decimal_models` in preBuild. Clause relies on "Decimal Places 1" but no `decimals` is recorded. Related `mixed_decimals` deals 85.82 × 8, decimal ÷ decimal and rounding (W35). Pre `d_to_f {}` cites "hundredths" but deals tenths/fifths |
| Y5.B12.S8 Efficient decimal strategies | W14 | gap | 6 | Pre `round_decimals` cites B7.S11 (W35) and rounds to hundredths. Related `mixed_decimals` as above. Only 1 related |
| Y5.B14.S6 Calculate with timetables | W33 | gap | 6 | Pre `unit_conversion_word {}` cites "Convert units of time" but deals km/cm; `{units:[0]}` is the fix and exists. Related `time_sense` is degenerate (2 distinct). preBuild `time_convert` is partly built |
| *Hardest 5* | | | | |
| Y5.B3.S1 Multiples | W01 | full | 5 | **Overstated FULL:** the note itself says WRM's multiples of 15/25/50 are not dealt (`multiples` stops at the ×12 tables). Pre `count_by_tables {}` and `mult_chart {}` claim "3, 6, 9" (10 and 0 of 100 items). `seq_5`/`seq_10 {}` deal 9,785 at W01. `mult_facts {}` claims "2, 4 and 8" |
| Y5.B3.S10 Multiples of 10, 100, 1,000 | W02 | partial | 5 | Pre `place_value_10x {}` cites B3.S9 (W10) and deals 979 × 100 = 97,900 and 92,000 ÷ 1,000 at W02. `seq_10 {}` reaches 9,800 while citing "Count in 10s". Merge turns `mult_zeros` FULL |
| Y5.B5.S6 Solve problems with × | W03 | partial | 6 | Pre `multiply {}` cites B5.S3 (W11). `missing_mult_div {}` deals 13 × 16 at W03. `equal_or_unequal_groups` (Y1) is filler. Merge turns `mult_word_problems_plain` FULL |
| Y5.B12.S9 Decimal sequences | W05 | gap | 5 | Pre `add_decimal` cites B12.S4 (W13); decimal ± is W13. `count_by_step_up/down {}` reach 9,950/19,578. Related `place_value_10x {}` deals ×1,000 (W10) |
| Y5.B7.S6 Thousandths as decimals | W12 | partial | 5 | Own build `thousandths_pv` in preBuild. Pre `d_to_f` cites B7.S5 (W22). Related `round_thousandths` is W35. `place_value_10x {}` deals 97,900 |

Random 20: 6+7+5+8+6+7+5+7+6+7+6+6+7+7+7+6+5+6+6+6 = 126, mean **6.30**. With the hardest 5 (26): 152/25 =
**6.08**.

## Other generated spot-checks (outside the sample)

- **Y5.B8.S4 Area of rectangles (FULL) is overstated.** `area_perimeter:area {}` deals "Find the area of a triangle:
  base = 39, height = 17 → 331.5" (6.G.A.1). It also deals ft stories at W28 and squares to 41 × 41.
  `{forms:[0,1], band:25}` still deals 6 triangles in 40 items, because no option excludes them.
  - Fix: verdict partial. Keep `area_unit_squares` as a direct.
  - Fix: add partial `area {forms:[0,1], band:25}` with the clause "also deals triangle areas; no rectangles-only
    option".
  - Fix: add a new option proposal `area_rect_only` (shape: rectangles and squares only).
- **Y5.B7.S3 Equivalent fractions and decimals (hundredths), FULL, doubtful.** `d_to_f {}` deals tenths and fifths only
  (0.8 = 4/5) and no hundredths. FULL rests on `frac_10_100` alone (22 distinct items in 60). Re-judge: make `d_to_f`
  partial, or give it a hundredths option.
- **Y5.B14.S5 Convert units of time.** The partial `unit_conversion_word` should carry `{units:[0]}`, which exists. Narrow
  `time_convert` to "days, weeks, months, years and smaller → larger".

## Fix list

### File-wide (every block)

1. **Opts on every link (class 1, rule 18).** Give each pre/related link the band of the step it cites and of the step's
   week:
   - `placevalue:* {band:…}`: identify, value, pv_digit_drag and expand take `band` 999 / 9,999 / 99,999 / 999,999;
     `number_word_names` takes 999–999,999;
   - `patterns:seq_5 {band:1000}` (or 50), `patterns:seq_10 {band:1000}`;
   - `multiplication:count_by_tables {constant:[3,6,9]}` where the why names 3/6/9;
   - `multiplication:mult_facts {constant:[n…]}` matching the why;
   - `area_perimeter:perimeter {forms:[0,1], band:20}` (no ft "word" form before W33);
   - `measurement:unit_conversion_word {units:[0]}` for time and `{units:[1]}` for metric.

   Generator-level: a link gets the cited step's band automatically. Then run the ported linkfit; it must report 0
   misfits.
2. **School-week gate (classes 2, 3, 18).** Remove every link whose items contain content first taught after the step's
   week (table above). Remove every pre that cites a Y5 step taught later. Replace it with the Grade-3 (Y4) step on the
   same idea, with opts.
   - Customary-unit links before W33: area/perimeter `{}`, `frac_word_mixed`, `frac_mult_word`, `mixed_fraction_ops`,
     `capacity`, `length_customary` (outside B14.S4), `estimate_length`, `temperature`.
   - Rounding decimals before W35: `round_thousandths`, `mixed_decimals`, `round_decimals`, `round_fractions`.
   - Percent before W22: `percent_of_number`, `find_whole_from_pct`, `percent_visual`, `f_to_p`, `p_to_d`, `order_fdp`,
     `mixed_graphs`.
   - Negatives before W38: `order_negatives`, `exponents_simple`, `estimate_frac_ops`, `coordinate_graph`. Swap
     `coordinate_graph` for `coordinate_q1`.
   - Volume before W36: `volume`, `volume_composite`, `mixed_area_perimeter`.
3. **Later-grade content (class 5).** Remove `decimals:mixed_decimals`, `div_decimal` and `mult_decimal` from decimal
   ± steps. Remove `area_perimeter:area {}` and `mixed_area_perimeter` (triangles) from rectangle steps. Remove
   `mult_frac_frac` from B6.S2. Remove `mixed_fraction_ops` from B4. Remove `geo_reflect` (axis reflection) from B11.S3–S5
   unless opts restrict it to horizontal/vertical mirror lines. Remove `mixed_conversions` (ratio) from B7.S15.
4. **TagFixes (class 8).** Re-derive them from a diff with SKILL_WRM:
   - add the 23 `partial` fixes listed above;
   - give every partial fix `partial: <Y5.json clause>`;
   - drop the 2 redundant adds (B8.S1 perimeter, B8.S4 area). If B8.S4 becomes partial, the area add becomes a
     `partial`.
5. **Partial steps with directs (class 9).** In B1.S3, B1.S4, B1.S5, B1.S8, B5.S4, B5.S7 and B5.S11, move each direct to
   `partial` with the clause it misses. B1.S3 to S5: the clause is the step's missing representation. B5.S11
   `mult_comparison`: "one-step times-as-many only". B5.S11 `remainder_interpret`: "÷ only, no two-step".
6. **Notes to opts (class 10).**
   - B6.S6 `fraction_of_set_hard_nv {forms:[1]}`
   - B8.S2 `composite_shapes {forms:[0]}`
   - B4.S10, B4.S12, B4.S14, B4.S15 `{denoms:[2]}` on the unlike skills
   - B7.S2 `f_to_d {denoms:[5]}`: already set; the clause must match
   - B7.S11 `round_thousandths {forms:[0]}`
   - B7.S9: record Decimal Places 3 on `order_decimals`
7. **preBuild (class 11).** Delete the step's own build id from preBuild in the 14 steps listed. B4.S11
   `frac_total_band` goes to `build`, since B4.S11 becomes partial.
8. **Pre ≥ 3 (class 12).** Add filtered pre in the 10 steps, or a note saying why there are fewer.
   - B10.S3: replace `measurement:estimate_length`, which is not an angle skill, with `angles_lines:measure_angles`
     (B10.S4, W25, before this step's W31).
   - B10.S4: add the Y4 right-angle / turns skill and the B10.S1 degrees skill.
   - B10.S10: drop degenerate `shape_name_match_3d`; add `count_edges_faces_vertices` (Y4 3-D).
   - B15.S3, B15.S4: add `volume_cubes` / capacity reading.
9. **Whys (classes 6, 13).**
   - Every pre cites the step its skill is tagged to (or says "nearest live practice").
   - Every why that names a table, band or family is true of 100 generated items.
   - Every "earlier building block" goes in pre, not related (rule 14).
10. **Degenerate links (class 14).** Remove `compose_rect_from_squares` (B8.S4) and `shape_name_match_3d` (B10.S10).
    Remove `time_sense` (B9.S5, B14.S6).
11. **Proposals (classes 15–17).**
    - Add `closes` (the step's exact missing clause, not `teaches`) to all 84.
    - Fold `roman_12`, `roman_100` and `roman_1000` into one `placevalue:roman_numerals` with bands 12 / 100 / 1,000 /
      3,999, read and write (owner ruling).
    - Make `thousandths_pv` an option on the `decimal_pv` proposal, not on a live skill.
    - Narrow `time_convert` (the time option exists).

### Sampled and hardest steps (skill, opts, step)

- **Y5.B1.S1:**
  - related `placevalue:number_word_names {band:999}`;
  - pre `placevalue:expand {band:9999}` citing Y4.B1.S6;
  - move `placevalue:combine {band:999}` to pre;
  - drop `addition:cloze_addition` and `subtraction:missing_add_sub` (not Roman-numeral building blocks);
  - preBuild → `roman_numerals` bands 12 / 100.
- **Y5.B1.S11:**
  - remove related `integers:order_negatives`;
  - pre `placevalue:identify {band:999999}`;
  - pre `placevalue:pv_digit_drag {band:999999}`.
- **Y5.B4.S11:**
  - verdict → partial;
  - partial `fraction_operations:add_frac_unlike {denoms:[2]}`, clause "no total-greater-than-1 control: 15 of 26
    computed sums are ≤ 1";
  - build `frac_total_band`; preBuild [];
  - pre `+ fraction_operations:add_fractions_like` (Y5.B4.S9, W17);
  - pre `+ fractions:mixed_improper_visual` (Y5.B4.S4, W16);
  - remove related `estimate_frac_ops`.
- **Y5.B4.S13:** remove related `frac_word_mixed` and `mixed_fraction_ops`; keep one subtract "next step".
- **Y5.B5.S1:**
  - pre `multiplication:multiply {tiles:31}` with why "Y4.B5.S10 3-digit × 1-digit". Or keep `{tiles:21}` with why
    "Y4.B5.S9 2-digit × 1-digit".
  - pre `mult_facts {constant:[3,6,9]}` citing the step `mult_facts` is tagged to;
  - tagFix `area_model_mult` Y5.B5.S1 partial.
- **Y5.B5.S11:**
  - move `mult_comparison` and `remainder_interpret` to partial;
  - replace pre `division:divide {}` / `multiplication:multiply {}` with `multiplication:multiply {tiles:21}` (Y4.B5.S9,
    Grade 3) and `division:box_division_hard` (already present);
  - drop `share_into_groups`.
- **Y5.B6.S5:** remove related `percent_of_number`; pre `mult_zeros` → `multiplication:mult_facts`.
- **Y5.B6.S6:** partial opts `{forms:[1]}`; remove related `find_whole_from_pct`; pre `mult_zeros` → `mult_facts`.
- **Y5.B7.S9:** remove related `round_thousandths`; remove preBuild `dec_dp_match`; record decimals 3 on `order_decimals`.
- **Y5.B8.S2:**
  - partial `composite_shapes {forms:[0]}`, clause "every side is labelled: no missing-side task";
  - pre `perimeter {forms:[0,1], band:20}`;
  - remove related `mixed_area_perimeter`;
  - tagFix `perimeter_grid` partial.
- **Y5.B8.S3:** pre `perimeter {forms:[0,1], band:20}`; pre `multiply` → `mult_facts`.
- **Y5.B9.S1 / S2:** drop related `coordinates:coordinate_graph {}`, which deals four-quadrant points.
  `coordinate_q1` is already a pre.
- **Y5.B10.S8:**
  - pre `additive_angles`: cite Y5.B10.S1 (W23, degrees), not S7. Or drop it.
  - pre `perimeter {forms:[0,1], band:20}`.
- **Y5.B10.S10:**
  - drop pre `shape_name_match_3d`; add `shapes_early:count_edges_faces_vertices` (Y4) and `name_2d_shapes`;
  - remove related `area_perimeter:volume` and `net_surface_area`;
  - tagFix `name_3d_shapes` and `net_identify` partial.
- **Y5.B12.S4:** preBuild remove `decimal_models`; remove related `mixed_decimals`; record decimals in the partial's opts.
- **Y5.B12.S8:** pre `round_decimals` → drop (W35); remove related `mixed_decimals`.
- **Y5.B14.S6:** pre `measurement:unit_conversion_word {units:[0]}`; remove related `time_sense`.
- **Y5.B3.S1:**
  - verdict → partial;
  - partial `number_theory:multiples {}`, clause "multiples of 2-digit numbers (15, 25, 50) and past the ×12 tables";
  - new option proposal on `number_theory:multiples`;
  - pre `count_by_tables {constant:[3,6,9]}`, `seq_5 {band:1000}`, `seq_10 {band:1000}`, `mult_facts {constant:[2,4,8]}`;
  - drop `mult_chart {}`.
- **Y5.B3.S10:**
  - pre `placevalue:place_value_10x {op:'x', power:[10,100], band:1000}` citing Y4 Multiply by 10 / by 100 (Grade 3,
    listed W02);
  - pre `patterns:seq_10 {band:1000}`;
  - tagFix `mult_zeros` partial.
- **Y5.B5.S6:**
  - pre `multiplication:multiply {tiles:21}` (Y4.B5.S9);
  - pre `missing_mult_div` → `mult_facts`;
  - drop `equal_or_unequal_groups`;
  - tagFix `mult_word_problems_plain` partial.
- **Y5.B12.S9:**
  - drop pre `add_decimal` (W13);
  - pre `patterns:count_by_step_up` with a step and a band to 1,000;
  - keep `decimal_nl_drag` (Grade 3 tenths);
  - remove related `place_value_10x`.
- **Y5.B7.S6:**
  - preBuild remove `thousandths_pv`;
  - pre `d_to_f`: cite a Grade-3 hundredths step, or drop it;
  - remove related `round_thousandths`;
  - related `place_value_10x {op:'/', decimals:true}`, or drop it.

## What is right

Every key is live. No related link repeats a direct, and no key is in both pre and related. Every gap and partial step has
a build, and every build id resolves. The verdicts on the honest partial steps (B4.S12, B5.S1, B8.S2, B8.S3) match their
generated items. The new option proposals reuse live skills; `mult_4x1` is genuinely needed, since tiles 41 does not exist
on multiply.

## For the next round

Port the Y4 `mergecheck.mjs` and `linkfit.mjs` with the Grade-4 table. Fix classes 1–4 and 8 file-wide by script,
because a hand pass cannot reach 894 links. Then re-run this critic on a fresh seed.
