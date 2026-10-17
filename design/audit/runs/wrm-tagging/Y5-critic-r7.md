# Y5 (US Grade 4) WRM tagging — independent critic, round 7 (brief rules 1–19 + owner rule 2026-10-16)

Critic: independent critic (Opus, medium effort), 2026-10-16. Grading only: `Y5.json`, the site files and the tooling were not
edited.
Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y5` at 7583ecd5 (`data/curriculum/links/Y5.json`: 136 steps, 21 site
lessons, 101 proposals, 175 tagFixes, 875 links; new `claims.mjs`, `sweep.mjs`, linkfit rules K / L / M / H′; the base merge
with the PR #8 generator fixes).
Follows `Y5-critic-r6.md` (FAIL narrowly: B15.S1 / S3 / S4 = 7; lessons 7 and 10 = 7).

## Verdict: FAIL (narrowly)

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** Random 20: **Y5.B15.S2 = 7** (its only related link was re-optioned by `linkfit --fit` onto a unit sort with grams, and its why "capacity read on a scale in mL" is now false) |
| Step means ≥ 8 | r6 rows (8 steps) **8.00**; new random 20 **8.00**; hardest 5 **8.00**; all 33 **8.00** (264 / 33); min 7 |
| Every lesson ≥ 8, mean ≥ 8 | **No.** All 21 graded: mean **8.00** (168 / 21), min **7** (lesson 2 "Multiply and divide multiples of 10": its only related claims "45 hundreds = 4,500", the items never rename, and `unit_form {rename:'more'}` exists) |
| 0 real merge conflicts | **Yes.** My own simulation (`merge7.mjs`, written fresh): Y5 + R, Y1, Y4, Y6 against live `wrm.js`, both orders give the same result; 0 key\|step written by two lanes; 0 own-step mismatches alone or merged; every Y5 direct / partial lands with its opts |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds (one with `WRM_TAG_DATA`, one with only a scratch `TMPDIR`): identical logs, sha256 `83558fa6…` = committed Y5.json |
| Site coverage complete | **Yes.** `ws-wrm-extract --check` exit 0; site files unchanged since r6; the 21 lessons are exactly the `wrmYear: Y5` entries of `site-lessons.json`; the 16 Grade-4 rows of the owner's new `Lessons_To_Build_K-5_2026-27.xlsx` (arrived with the base merge) all map to a lesson |

Every r6 row landed and holds on fresh seeds, the PR #8 follow-up is right, and the new rule gates fire on mutation. The round
fails on one class the builder's root-cause fix did not fully close:

- **N. `linkfit --fit` still re-options a link without re-checking the words of its why that are not rule claims.** Only the
  `rule: true` claims run inside the fit loop. A representation or form word ("read on a scale", "sort containers", "45
  hundreds") is not a rule claim, so a re-option can still make the why false. Of the 18 links whose spec set explicit opts
  that the fit changed, two now carry a false why (B15.S2 related, B14.S4 related). The same class without the fit: lessons 1
  and 2 claim renamed unit form on default `unit_form` items, while the `rename` option that deals it is not used.

## Method

- **Items:** print path (`generateQuestionFor`, seeded, `itemIndex`, `itemCount: 20`), seeds new to this round: directs and
  partials 8 items (70717, +59); links 5 items (93113, +67); probes 30–80 items (77071, 55511, 4242, 8080, 91919, 1212, 3131,
  777); my own why scan 30 items a link (60606, +31). School weeks: `prior.json` from my clean build. Scripts in the scratch
  folder `…/scratchpad/r7/` (`dump7.mjs`, `probe.mjs`, `fr.mjs`, `whyscan.mjs` (new), `merge7.mjs` (new), mutation files
  `mut7.json`, `fix7.json`).
- **Sample:** the r6 rows (B15.S1 / S3 / S4, B5.S11, B2.S6, B3.S3, B10.S3, B12.S11); a new random 20 (`random.Random(71016)`):
  all 8 steps never graded in any critic table, plus 12 from the 37 not graded by r5, r6 or the builder's last self-check; the
  5 hardest of the round (B4.S17 and B4.S13 from PR #8, B7.S4, B12.S3, B3.S9); all 21 lessons.
- **Criteria** as r4–r6: right directs and opts; an honest verdict and clause; pre-skills useful, filtered, in week order, at
  least 3 (or a note), led by the main building block; related skills that share the idea and fit (rule 18 content), with
  true whys.

## 1. The r6 rows on fresh seeds, the new gates, PR #8

| r6 row | Status at 7583ecd5 |
|---|---|
| K B15.S4 | **Landed.** Related `unit_conversions {units:[0], forms:[0]}`: 30 of 30 fresh items metric (100 cm = 1 m, 2 L = 2,000 mL); pre `capacity {units:[1], forms:[0]}` (1 L = 1,000 mL, 250 mL = 0.25 L), `mass_volume_liquid {forms:[0]}` (cylinder in mL), `estimate_length {forms:[0]}`; clause names its range |
| K B15.S1 / S3 | **Landed.** Related `volume {forms:[0], band:30}`: "length = 3, width = 2, height = 3 … cubic units", no ft / in |
| L lesson 7 | **Landed.** `tape_diagram` out; related `div_word_problems_plain {forms:[1], range:100}` (42 apples, 7 in each basket) and `missing_mult_div @100` (about two thirds of items have a missing factor, ___ × 8 = 56; the rest are plain facts: true enough) |
| M lesson 10 | **Landed.** Partial `frac_10_100_nv {forms:[2]}` with the honest "forms value does not filter" clause (fresh: 6/10 + 5/100, 7/10 + 7/100 beside renaming and click-all); `frac_10_100` "no add form"; `add_tenths_hundredths` rescoped |
| Minors | B5.S11 and B2.S6 `tape_diagram(_plain)` / `algebra_word_mixed` out ✓; B3.S3 `mult_properties {forms:[0,2]}` ✓ (thin: "If 2 x 2 = 4, what is 2 x 2?"); B10.S3 preBuild `turns_angles` ✓; lesson 14 pre `mass_volume_liquid {forms:[0]}` ✓; lesson 10 `add_decimal` why now says what it deals ✓; Y4 note in the report replaced ✓ |

**Are the new gates real?** My own mutations of a copy of Y5.json (not the builder's), run through `linkfit.mjs`:

| Mutation | Fired? |
|---|---|
| K: B14.S1 (metric, W31) related `length_customary {forms:[0]}` | **Yes** (K customary on metric, and rule 19 customary first taught W33) |
| L: lesson 6 related `tape_diagram {}` with "a times-as-many comparison drawn as two bars" | **Yes** (0 of 100) |
| Money claim: B12.S6 related `add_decimal {decimals:2}` with "adding prices in dollars and cents" | **Yes** (and F: repeats its own partial) |
| M: lesson 14 clause "+ never clicks or sorts containers" (`capacity` forms value 1 is "Click or sort containers") | **No.** `missedOptions` excuses any skill whose id appears in the unit's text, and the id `capacity` is an ordinary word in the lesson's own title and clause. The same hole covers `compare`, `value`, `divide`, `multiply`, `money`, `volume`, `perimeter` … |
| M: lesson 1 clause "+ never more than 9 of one place (47 tens 6 ones)" | **No.** M reads only the `forms / units / task / kind / model` option ids; `unit_form`'s `rename` ("Yes (476 = 47 tens 6 ones)") is never read |
| Fit re-option (class N) | Not a gate. `fit.json` of my clean build: B15.S2 related spec `{forms:[0]}` → `{forms:[2]}`, B14.S4 related spec `{units:[0], forms:[1]}` → `{forms:[0]}`, both with the spec's why unchanged and now false. The rule claims pass both: "mL" is in the sort's bin labels, and the "scale" claim (not a rule) matches the option text "Milk jug" |

So the rule claims (units, multiplicative, fractions, decimals, money …), K both ways, the half markers and the later-taught
pre are real checks. They are not a rubber stamp. But the fit loop still rewrites links on everything else, and M has two holes.

**The sweep's 32 remaining (c) findings** (re-run: 875 links, 753 claims, a 0 / a-neg 0 / b 0 / c 32): I read all 32 and agree
with the builder. Each is a larger number on an easier task: 6-digit place value before "100,000 more or less", products of
2-digit × 3-digit area models, mL scales before customary cups, count-by sequences read as one number, payload artefacts.
The one I would still flag is the thousandths distractors (80/1000) in `frac_10_100` click-all on B7.S1 / S2, B12.S1 / S2
(W12–W13, before thousandths). There is no option to remove them, and they are wrong options to reject. Minor, accepted.

**PR #8 follow-up (regenerated post-merge, 100 items each, seed 91919):**
- `sub_mixed_unlike {denoms:[2]}`: **0 off-family denominators, 0 zero-whole addends**, no sort form. Calculate plus click-all,
  with exchange items (2 1/2 − 1 3/4 = 3/4; 4 1/4 − 3 7/8 = 3/8). **B4.S17 FULL is right.** The W16 "first lesson" exemption
  (linkfit OWN) is correct and harmless. The step is itself the first related-denominator lesson, and none of B4.S17's own pre or
  related links deal related denominators. Like-denominator `sub_mixed_like(_nv)` sit as partials with an honest "never
  related" clause. preBuild `mixed_plus_frac`, `sub_break_whole` fits.
- `add_mixed_unlike {denoms:[2]}`: 0 off-family, **11 of 100 zero-whole addends** ("0 1/2 + 2 2/4") in the sort form, so
  **B4.S13's partial clause ("13 of 100") and `mixed_sort_whole` are honest**.
- B7.S4 `f_to_d {}` clause (the drag-bin sort with 50% tiles) is true on fresh items. `denoms_all_forms` retired correctly.

## 2. Step grades

### The r6 rows

| Step | Score | Reasons |
|---|---|---|
| B15.S1 Cubic centimetres | 8 | Gap honest; 4 pre (unit squares, arrays, cylinder mL); related now cubic units |
| B15.S3 Estimate volume | 8 | Gap honest; 3 pre (benchmark estimate first); related cubic units |
| B15.S4 Estimate capacity | 8 | Partial `capacity {units:[1], forms:[1]}` sorts metric containers against 1 L, clause honest; 3 good pre; related metric |
| B5.S11 × ÷ problems | 8 | Three honest partials; related now one-step division stories |
| B2.S6 Multi-step + − | 8 | Two partials honest; 6 pre from 4-digit columns up; 2 related |
| B3.S3 Factors | 8 | Exact directs; pre `mult_properties {forms:[0,2]}` thin but true |
| B10.S3 Estimate angles | 8 | One pre + true note; build `angle_estimate`, preBuild now includes `turns_angles` |
| B12.S11 Divide by 10, 100, 1,000 | 8 | Fresh: 739 ÷ 10, 132 ÷ 1,000, all whole dividends, as the clause says |

Sum 64 / 8 = **8.00**.

### New random 20 (seed 71016; the first 8 never graded before)

| Step | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|
| B1.S1 Roman numerals to 1,000 | W01 | gap | 8 | `roman_numerals`; pre expanded form and adding hundreds (CLX = 100 + 50 + 10); related word names, unit form |
| B1.S8 Partition to 1,000,000 | W07 | partial | 8 | `expand` / `combine {order:'scrambled'}` at 6 digits, standard only (clause honest); `flex_partition` |
| B2.S4 Round to check answers | W09 | partial | 9 | `estimate_sums_diffs {place:1000, task:'reasonable'}` exact for 4 digits; pre the 100-place version, rounding to 10,000 / 100,000, 6-digit subtraction; good related |
| B2.S5 Inverse operations | W09 | partial | 8 | `sub_check_by_adding` (3-digit, one 1000 − 326); fact families, 6-digit columns as pre |
| B3.S6 Square numbers | W37 | partial | 8 | `exponents_simple` (50², 59²) clause names "bases above 12"; arrays, tables 3/6/9, factors as pre |
| B4.S4 Improper → mixed | W16 | partial | 8 | Both partials mix directions (clause honest); `improper_mixed_dir`. Minor: pre `whole_as_fraction` why "1 = 4/4" deals 9 = 9/1 |
| B5.S1 4-digit × 1-digit | W11 | partial | 8 | `area_model_mult {tiles:31}` stops at 3 digits; `multiply` has no 4-digit option (checked: tiles stop at 31, range 100,000 still 3-digit) |
| B5.S5 4-digit × 2-digit | W34 | partial | 8 | Placeholder-zero partial honest; `long_mult`. Minor: pre `make_ten` (Bonds to 10) is an unfiltered week-list entry |
| B5.S7 Short division | W11 | partial | 8 | Three honest partials (box, long grid, zero quotient), all "not bus stop"; 6 pre; `vis_division_layouts` |
| B6.S1 Unit fraction × integer | W19 | partial | 8 | `mult_frac_whole(_nv)` mix unit / non-unit (clause honest); repeated addition, decompose as pre |
| B6.S3 Mixed number × integer | W19 | gap | 8 | `mult_mixed_int`; 5 pre. Minor: related `frac_mult_word {denoms:[5]}` "fraction × whole in stories": about 40% of items are "3 m cut into 1/5 m pieces" (whole ÷ unit fraction, 5.NF.B.7c) |
| B7.S13 Percentages as fractions | W22 | full | 8 | `f_to_p`, `p_to_f`; percent grid, fifths → tenths as pre |
| B9.S2 Line graphs | W36 | gap | 8 | `line_graph`; bar graphs, coordinates, line plot, thermometer scale |
| B9.S4 Two-way tables | W04 | gap | 8 | `two_way`; tally, bar graph, "missing cell = total − known" |
| B10.S1 Degrees | W23 | partial | 8 | Both partials honest; quarter-turn clock and fraction-of-a-turn pre |
| B10.S8 Lengths and angles in shapes | W26 | gap | 8 | Classify quads / triangles, missing side from perimeter; additive_angles now related (r6 sweep) |
| B11.S4 Translation with coordinates | W28 | partial | 8 | `geo_translate` (no coordinates written); `coordinate_q1`, `coord_polygon` |
| B14.S4 Metric ↔ imperial | W32 | gap | 8 | Pre customary, mixed, metric conversions. **Minor (class N):** related `capacity {units:[0], forms:[0]}` why "sort containers by size in pints, quarts and gallons"; the fit moved it from the sort (forms 1) to convert, 0 of 30 items sort. The idea still matches (customary capacity) |
| B14.S6 Timetables | W33 | gap | 8 | Elapsed-time line pre (duration, start, end), time conversions |
| **B15.S2 Compare volume** | W36 | gap | **7** | **Class N.** Its only related, `mass_volume_liquid {forms:[2]}`, has the why "capacity read on a scale in mL: the other 'how much space' measure". The spec wrote `{forms:[0]}` (the graduated cylinder, exactly the why). `linkfit --fit` moved it to `{forms:[2]}`: 30 of 30 fresh items are unit choice, and 19 of 30 are "Click ALL items best measured in grams (not kilograms)". There is no scale and mostly no capacity. False why, and the link does not share the idea |

Sum 160 / 20 = **8.00**.

### Hardest 5

| Step | Score | Reasons |
|---|---|---|
| B4.S17 Subtract two mixed numbers | 8 | FULL right (section 1); like-denominator partials honest; pre add mixed, improper ↔ mixed; related inverse |
| B4.S13 Add two mixed numbers | 8 | Clause re-measured (11 / 100 zero-whole addends); `mixed_sort_whole` |
| B7.S4 Equivalent F / D | 8 | `f_to_d` drag-bin clause true; `d_to_f {forms:[0]}` other direction; fifths → tenths pre |
| B12.S3 Decimals across 1 | 8 | Clauses honest; bridging-10 pre; related `money_change` ($1.00 − $0.50) shares the crossing |
| B3.S9 Divide by 10, 100, 1,000 (whole) | 8 | `place_value_10x {op:'/', power:[10,100,1000]}` exact (77,700 ÷ 100); × as pre |

Sum 40 / 5 = **8.00**. **All 33: 264 / 33 = 8.00; min 7.**

### Scan for class N and related false whys (my own `whyscan.mjs`: form and representation words the gates do not read, 30 items a link, every pre and related link)

22 hits, read one by one. Most are purposes, not claims ("compare by estimating", "to check an estimate") or my regex
missed a story. Real findings: **B15.S2** (above), **B14.S4** (above, minor), **lessons 1 and 2** (section 3), B10.S9 related
`hotspot_quads` "sort shapes by a property" (click the quadrilaterals; minor).

## 3. Site lessons: all 21 graded

| # | Lesson (G4) | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|---|
| 1 | Place value: 10 times and one tenth | W05 | partial | 8 | Two honest partials; `value_ten_times`. Minor: related `unit_form {band:9999}` why "3 thousands = 30 hundreds", but items are standard (4,189 = 4 thousands 1 hundred …). `{rename:'more'}` deals it ("4 thousands 16 hundreds = 5,600"). The other related, `expand`, is true |
| 2 | **Multiply / divide multiples of 10** | W06 | partial | **7** | Partial `mult_zeros {forms:[2]}` honest. **Its only related, `unit_form {band:999}`, has the why "45 hundreds = 4,500: the unit-form step inside 9 tens times 5 tens"**: 30 of 30 fresh items are "418 = 4 hundreds 1 ten 8 ones", none renamed. The option `{rename:'more'}` exists and deals exactly that ("3 hundreds 14 tens = 440"). The fit also stepped its band down from 9,999 without re-reading the why |
| 3 | Extend growing shape patterns | W09 | partial | 8 | Number rule only; `growing_shape_patterns`. Carried minor: pre `count_by_step_up {step:[1]}` "Count in 3s" deals 3s 16 / 30, 4s 14 / 30 |
| 4 | Find emergent features | W09 | partial | 8 | `patterns_notice`; odd / even, multiples pre |
| 5 | Follow a given rule | W09 | full | 9 | `number_patterns_rule {rule:false}` prints the rule; exact |
| 6 | Times as many | W10 | partial | 8 | Clause honest; related `word_problems_mixed @100` has times-as-many stories in about 1 in 4 items, as its why says |
| 7 | Unknown multiplier | W10 | partial | 8 | r6 row landed (section 1) |
| 8 | Divide and interpret the remainder | W11 | partial | 8 | Two honest partials; `remainder_too_big` related |
| 9 | Decompose a fraction | W13 | full | 8 | `decompose_fractions` with bars |
| 10 | Add tenths and hundredths | W18 | partial | 8 | r6 row landed (section 1) |
| 11 | Points, lines, segments, rays | W21 | gap | 8 | `points_lines_rays` |
| 12 | Angles are additive | W28 | full | 8 | `additive_angles`; related `mixed_angles_lines` measures, names or finds angles in 16 of 30 items, as its why says |
| 13 | Line plots with fractions | W28 | partial | 8 | Reads only; `make_line_plot` |
| 14 | Customary capacity | W30 | partial | 8 | Pre fixed. Minor (fit): `capacity {units:[1]}` pre moved from convert to the "larger than 1 litre" sort under the title "Equivalent capacities (litres and millilitres)" |
| 15 | Customary length and weight | W31 | partial | 8 | Two honest partials; `weight_customary`, `conversion_table` |
| 16 | Measurement word problems | W31 | partial | 8 | Two honest partials; `measure_word_four_ops` |
| 17 | 3D shapes (Reception source) | W38 | full | 8 | `name_3d_shapes` |
| 18 | Compare fractions (G2 source) | W38 | partial | 8 | `compare` has no same-part option (checked); pre at Year 3 content |
| 19 | Divide a 1-digit number by 100 | W38 | partial | 8 | Clause honest (739 ÷ 100) |
| 20 | Hundredths | W38 | partial | 8 | `decimal_pv` |
| 21 | Order fractions | W38 | partial | 8 | Honest partial; `order_frac_numline` related |

Sum 168 / 21 = **8.00**; min 7.

The lessons section holds exactly the 21 Y5 entries of `site-lessons.json`, with no tagFixes; 12 lesson-only proposals have
empty `steps` and carry `lessons` (the lead must merge by `lessons` too). The owner's new `Lessons_To_Build` xlsx lists
"Extend growing shape patterns" at W10; the site (and the lesson) say W09, with a note naming the W10 track. Information
only.

## 4. Reproducibility and extraction

- Two clean `git archive HEAD` unpacks; build A with `WRM_TAG_DATA`, build B with only a scratch `TMPDIR`. Logs identical
  (136 steps 37 / 74 / 25; 21 lessons 4 / 16 / 1; 175 tagFixes; 148 links re-optioned, 94 dropped; mergecheck OK; linkfit
  875 links 0 misfits; optcheck 0; OK, exit 0). Both outputs sha256 `83558fa60364…` = the committed Y5.json. No absolute
  paths in the tooling; nothing outside the branch.
- `ws-wrm-extract --site … --check`: `wrm-steps.json up to date`, `site-lessons.json up to date`, exit 0. The base merge
  touched no file under `data/curriculum/` except adding `source/Lessons_To_Build_K-5_2026-27.xlsx` (not a site input), so
  r6's independent site audit still holds.

## 5. Merge (`merge7.mjs`, my own)

In-repo `data/curriculum/links/{R,Y1,Y4,Y5,Y6}.json` against live `js/modules/wrm.js`. Each tagFix becomes an outcome
(full / partial + opts / removed). R / Y1 keep the partial clause in `why`, which is format-only. The tagFixes are applied in
two orders.

| Check | Result |
|---|---|
| tagFixes | Y5 175, R 76, Y1 80, Y4 166, Y6 148 |
| Result independent of lane order | **Yes** |
| key\|step written by 2+ lanes | **0**, so **0 real conflicts** |
| Each lane's own steps (direct = full, partial = partial, no stray live tag), alone / merged | Y5 0 / 0, R 0 / 0, Y1 0 / 0, Y4 0 / 0, Y6 0 / 0 |
| Y5 directs / partials whose opts do not land | 0 |
| Foreign-step tagFixes | Y5 0 (Y4 writes `patterns:count_by_step_up\|Y2.B1.S15`, Y4's, known) |
| Y5 tagFixes naming a site lesson | 0 |
| Proposal ids shared by 2+ lanes | 74, 0 with a different skill or kind |

## 6. Fix table (FAIL)

### Build-level

| # | Class | Change | Affected |
|---|---|---|---|
| N | Fit re-option makes a non-rule why false | In `linkfit.mjs --fit`, a link whose spec set explicit opts may be re-optioned only if **every** claim of `claims.mjs` (not only `rule: true`) still holds on the new items, **and** the why's form words hold: sort / click / drag / read / scale / cylinder / convert / renamed unit form ("\d+ hundreds"). Otherwise drop the link, or fail and send it back to the spec. Print every re-optioned link with spec opts in the build log for a hand re-read (18 today) | B15.S2, B14.S4, lesson 2 (band step), lesson 14 (minor) |
| N′ | Claim-rule false hits | The `scale` (and every representation) claim must not be satisfied by option text ("Milk jug" counted as a scale); judge representations on the picture, template and payload only | gate only |
| M′ | M gate holes | (1) Excuse a skill only when its `category:skill` key or a backticked id is named, never because the id is an ordinary word ("capacity", "compare", "value", "volume"). (2) Read every enum option id with value labels, not only forms / units / task / kind / model (`unit_form` `rename`) | gate only; lessons 1 / 2 would have been caught |

### Per entry (expected after the fix)

| Entry | Change | Expected |
|---|---|---|
| Y5.B15.S2 Compare volume | Related → `area_perimeter:volume {forms:[0], band:30}`, why "working out each cuboid's volume in cubic units (length × width × height) before comparing two volumes" (passes linkfit: checked on a scratch copy). `{forms:[0]}` of `mass_volume_liquid` fails the size check here (cylinder to 500 mL on a gap step), which is why the fit moved it | 8 |
| Lesson 2 Multiples of 10 | Related `unit_form {band:999, rename:'more'}` ("3 hundreds 14 tens = 440", "846 = 84 tens 6 ones"): exactly its why (passes linkfit) | 8 |
| Lesson 1 Place value 10 times | Related `unit_form {band:9999, rename:'more'}` ("4 thousands 16 hundreds = 5,600") | (minor) |
| Y5.B14.S4 | Related why → "customary capacity conversions one a cell (4 pints = 2 quarts)". Do not write "metric" in it: the metric claim fires on a negation-free mention | (minor) |
| Lesson 14 | Pre `capacity {units:[1]}`: back to the convert form with a size-fitting band, or re-cite the "larger than 1 litre" sort honestly | (minor) |
| B6.S2 / S3 / S5 / S7 | Related `frac_mult_word {denoms:[5]}`: about 40% of items are whole ÷ unit fraction (5.NF.B.7c, Grade 5). Name it in the why ("fraction × whole, and some 'how many 1/5 m pieces' stories") or drop. Record: `frac_mult_word` has no forms option to keep the × stories | (minor) |
| B5.S5 | Pre `make_ten` is an unfiltered week-list entry (rule 3): drop | (minor) |
| B4.S4 | Pre `whole_as_fraction` why "1 = 4/4": items are n = n/1; re-cite | (minor) |
| Lesson 3 | Carried: pre `count_by_step_up {step:[1]}` "Count in 3s" deals 4s half the time | (minor) |
| B10.S9 | Related `hotspot_quads` why "sort shapes by a property": it is a click-all | (minor) |

With N fixed (B15.S2, lesson 2), every graded step and lesson is expected at 8 or better: steps about 8.03, lessons about
8.05.

## What is right

- Every r6 row (K, L, M, H′, the minors) landed at the source and holds on fresh seeds.
- The new rule claims, K both ways, the half markers and the later-taught-pre check are real gates: they fire on my own
  mutations, not only on the builder's.
- PR #8 is re-judged correctly: B4.S17 FULL and its exemption are right, the B4.S13 clause is measured, `denoms_all_forms`
  is correctly retired, and the 32 sweep (c) findings are correctly accepted.
- The build is reproducible from the branch alone, extraction is up to date, site coverage is complete, and the merge with
  every in-repo lane has 0 real conflicts.
