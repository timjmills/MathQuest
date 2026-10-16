# Y5 (US Grade 4) WRM tagging — independent critic, round 8 (brief rules 1–19 + owner rule 2026-10-16)

Critic: independent critic (Opus, medium effort), 2026-10-16. Grading only: `Y5.json`, the site files and the tooling were not
edited.
Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y5` at 29161105 (`data/curriculum/links/Y5.json`: 136 steps
37 / 74 / 25, 21 site lessons 4 / 16 / 1, 101 proposals, 175 tagFixes, 874 links; new `specopts.py`, `spec_zz_r7.py`
(143 RELINK + 96 DROP), `linkfit --fit` turned into a report, the N / N′ / M′ gates).
Follows `Y5-critic-r7.md` (FAIL narrowly: B15.S2 and lesson 2 = 7, class N).

## Verdict: PASS

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **Yes.** 27 graded steps (new random 20, hardest 5, B15.S2, B14.S4; r7 rows B6.S5 and B10.S10 fell in the random 20), min **8** |
| Step means ≥ 8 | new random 20 **8.10** (162 / 20); hardest 5 **8.00**; B15.S2 + B14.S4 **8.00**; all 27 distinct steps **8.07** (218 / 27) |
| Every lesson ≥ 8, mean ≥ 8 | **Yes.** All 21 graded: mean **8.05** (169 / 21), min **8** |
| 0 real merge conflicts | **Yes.** My own simulation (`merge8.mjs`, new): Y5 + R, Y1, Y4, Y6 against live `wrm.js`, both lane orders give the same result; 0 key\|step written by two lanes; 0 own-step mismatches for every lane, alone and merged; every Y5 direct / partial with opts lands with them |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds (A with `WRM_TAG_DATA`, B with `WRM_TAG_DATA` unset and only a scratch `TMPDIR`): identical logs, exit 0, sha256 `127fd948…51cf10298bc4` = the committed Y5.json. No absolute paths in the tooling |
| Site coverage complete | **Yes.** `ws-wrm-extract --site … --check` exit 0 (both files up to date); the 21 lessons are exactly the `wrmYear: Y5` entries of `site-lessons.json`; the 136 steps are exactly the Y5 steps of `wrm-steps.json`; no file under `data/curriculum/` other than `links/Y5.json` changed since r7 |

Class N is closed at the root: no build pass can change a link's opts any more (proved below with three of my own mutations,
one of them at write time), and every r7 row holds on fresh seeds. The minors listed at the end do not pull any graded entry
below 8.

## Method

- **Items:** print path (`generateQuestionFor`, seeded, `itemIndex`, `itemCount`), seeds new to this round: directs and
  partials 8 items (31847, +61); links 6 items (52411, +71); RELINK re-read 12 items a link (24681, +37); probes 60–100 items
  (60817, 5150, 11, 777, 4040). School weeks: `prior.json` from my clean build A. Scripts in the scratch folder
  `…/scratchpad/r8c/` (`dump8.mjs`, `rl.mjs` (RELINK re-read), `merge8.mjs` + its self-test `merge8t.mjs`, mutation trees
  `m1` / `m2` / `m3`, `mutL.json`).
- **Sample:** the r7 rows; a new random 20 (`random.Random(81016)`) drawn from the 26 steps no critic graded in r5, r6 or r7;
  my own hardest 5 (four FULL verdicts on the decimal and division steps plus B5.S3); B15.S2 and B14.S4 (asked by the brief);
  all 21 lessons.
- **Criteria** as r4–r7: right directs and opts; an honest verdict and clause; pre-skills useful, filtered, in school-week
  order, at least 3 (or a note), led by the main building block; related skills that share the idea and fit (rule 18
  content), with true whys.

## 1. The r7 rows on fresh seeds, and the structural fix

### r7 rows

| r7 row | Status at 29161105 (fresh seeds) |
|---|---|
| N B15.S2 | **Landed.** Related `area_perimeter:volume {forms:[0], band:30}`: "length = 3, width = 2, height = 2 → 12 cubic units" on 6 of 6, exactly the why ("each cuboid's volume in cubic units … then comparing"). The unit sort is gone |
| N lesson 2 | **Landed.** Related `unit_form {band:999, rename:'more'}`: "614 = ___ tens 4 ones", "4 hundreds 14 tens = ___", "380 = ___ tens 0 ones": the renaming the why names |
| Lesson 1 | **Landed.** `unit_form {band:9999, rename:'more'}`: "6,147 = ___ tens 7 ones", "4 thousands 15 hundreds = ___" |
| B14.S4 | **Landed.** Related `capacity {units:[0], forms:[0]}` why "customary capacity conversions one a cell (4 pints = 2 quarts …)": 6 cups = ___ pints, 4 quarts = ___ gallons. True (typo "one a cell" for "one to a cell") |
| Lesson 14 | **Landed.** Pre `capacity {units:[1], forms:[1]}` re-cited as "clicks the metric containers larger than 1 litre": 12 of 12 items are that click-all |
| B6.S2 / S3 / S5 / S7 | **Landed.** `frac_mult_word {denoms:[5]}` why names both story kinds; I measured 45, 41 and 39 of 100 "1/5 m pieces" stories on three new seeds, so "about half" is fair |
| B5.S5 / B4.S4 / lesson 3 / B10.S9 / B10.S10 | **Landed.** `make_ten` out; `whole_as_fraction` why "1 = 3/3 and 9 = 9/1" true (5/1, 8/8, 4/4); count_by_step_up names 3s and 4s; `hotspot_quads` "click every quadrilateral"; B10.S10 clause names `net_identify` |

### Is the build really unable to change a link's opts? (my own mutations, each in a fresh `git archive` tree)

| Mutation | Result |
|---|---|
| **m1, spec level:** a new spec file puts B3.S2 pre `mult_facts` back to `{constant:[3,6,9]}` (why still "9 times-table") and lesson 2 related `unit_form` back to `{band:999}` (why still "45 tens") | **exit 1.** "does not fit at its spec opts" for both (9s in 41 / 100; renamed unit form 0 / 100, "no option set fits"). The written file still carries the spec's `[3,6,9]`: nothing was re-optioned |
| **m2, a silent build pass** after the spec snapshot: B15.S2 volume `band:30 → 12`, B13.S4 pre `compare` gets Max Number 100, B1.S1 loses its last related | **exit 1** at `specopts`: 5 differences, each named ("not in the spec (spec has band 30)", "dropped by a pass") |
| **m3, at write time** inside `clean()`: every `capacity {units:[0], forms:[0]}` related link written as `forms:[1]` | **exit 1** at `specopts`: 6 differences (B14.S4 and lessons 15 / 16) |

So the opts in Y5.json can only come from a spec file, and a spec opts that misfits fails the build rather than being
re-optioned. `specopts.py` compares the final file one to one (key, opts, Max Number) against `spec-links.json`, which is
written right after the spec files run, so it catches a change at any later pass, including the write.

### The 143 RELINK rows: are the rewritten whys true?

All 143 rows are in the built file at their new opts (my join of `spec_zz_r7.py` to `Y5.json`: 0 missing). I re-read on
fresh items **all 15 RELINK rows that changed explicit spec opts**, the three per-entry rows in the builder's table of 18
(B14.S4, B15.S2 and lesson 2, above), and **a random 32 of the other 128** (`random.Random(80816)`): 50 links.

- **The 18:** all true. `mult_facts {constant:[9]}` / `[7]` deal only the named table (9 × 4 … 9 × 12); `seq_5` / `seq_10`
  `band:50` count in 5s and 10s below 50; `count_by_step_up {step:[1]}` deals 3s and 4s, as the why now says;
  `skip_count_line {step:[0], band:50}` 2s, 5s and 10s; B14.S3 `mass_volume_liquid {forms:[2]}` sorts and clicks g / kg /
  mL / L, as the rewritten why says; lesson 15 `length_metric {forms:[3]}` km → m only; lesson 2 `place_value_10x band:1000`
  ×10 / ×100 on the shift chart.
- **The random 32:** 30 true. Two whys are slightly off, though the link still fits and teaches the idea (minor):
  #131 lesson 6 pre `multiply {range:100}` cites "Y4.B5.S9 Multiply a 2-digit number by a 1-digit number". On 60 items it
  deals facts to 12 × 12 (4 × 6, 8 × 8, 11 × 7), so it is mostly facts, not 2-digit × 1-digit. #135 lesson 8 pre
  `word_problems_mixed @100` cites "Y5.B5.S11 … multiplication and division", and about two thirds of its stories are
  + / −.

### The N / N′ / M′ gates (my own mutations of a copy of Y5.json, `mutL.json`, run through `linkfit.mjs`)

| Mutation | Fired? |
|---|---|
| Form claim: B12.S1 related `add_fractions_like` why "drag each fraction sum into order" | **Yes** (drags 0 / 100) |
| Form claim: B9.S1 pre `bar_graph` why "… converting the units on the axis" | **Yes** (converts 0 / 100) |
| Renamed unit form: lesson 1 `unit_form` without `rename` | **Yes** (0 / 100) |
| Class-N re-option by hand: B14.S4 capacity moved to the sort form | **Yes** (on size: "3 L = ___ mL" 3,000 > 855) |
| N′ representation: B6.S5 pre `div_word_problems` why "shared out on an array of counters" | **No.** "array 100 / 100": the array item regex reads the word-work template's raw markup, and something in its CSS / layout matches (`rows … columns` or `dot`), although the items are text-only stories. No live why is affected: every "array" why in Y5.json sits on `dot_array_mult` or `arrays_groups`, which do draw arrays |
| M′: B8.S4 `area` partial clause "+ never a story (tiling a floor)" (the skill's forms value 2 is "A story (tiling a floor)") | **No.** `negatedParts` cuts the clause at "(", so the part is "a story", and the value label needs all three words (story, tiling, floor). A clause that denies an option without repeating the label's example is not caught |
| Quantifier: B6.S5 related `frac_mult_word` why "every story multiplies" | No (by design: operations and "story" are in the swept, hand-read set, not gated) |

The gates the builder added fire on mutations I wrote, not only on the builder's own, and they catch the class that failed
r7. Two holes remain, and both are gate-only: no current link or clause is wrong because of them. They are minors in the
table at the end.

## 2. Step grades

### New random 20 (seed 81016; all 20 never graded by r5, r6 or r7)

| Step | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|
| B12.S8 Efficient strategies (decimals) | W14 | gap | 8 | `dec_known_facts` + preBuild `dec_dp_match`; pre: the two previous decimal steps and whole-number compensation (Y5.B2.S1); related `make_a_ten`, thin but the same "make a whole first" idea |
| B6.S5 Fraction of an amount | W20 | full | 8 | `fraction_of_set_hard` + `_nv {forms:[0,2]}` deal non-unit fractions of amounts (5/6 of 60, 4/7 of 98): FULL right; pre: previous step, sharing stories, 12 × table |
| B12.S2 Complements to 1 | W35 | gap | 8 | Clause honest; 4 pre (bonds to 10, number bonds, tenths / hundredths); related whys terse ("hundred square", "number line") but true |
| B8.S4 Area of rectangles | W28 | partial | 8 | `area {forms:[0,1], band:25}` clause honest: triangles in about a third of items on any forms value (I probed forms [0] alone, triangles still there); `area_unit_squares` honest; arrays and perimeter pre |
| B7.S10 Round to the nearest whole | W35 | gap | 8 | `round_whole` (option on `round_decimals`) is right; 3 pre. Minor: related `round_decimals {}` "round to a tenth" deals nearest hundredth in about 3 of 4 (`precision:[0]` exists); `round_fractions` "to the nearest whole" also rounds to halves |
| B7.S3 F / D hundredths | W21 | partial | 8 | Three honest partials (`f_to_d {denoms:[5]}` hundredths about a third, as the clause says); pre tenths line, equivalence, fifths / tenths shaded |
| B9.S1 Draw line graphs | W36 | gap | 8 | `line_graph`; pre bar graphs read and built, coordinates; related line plot with an honest "tell the two apart" |
| B11.S5 Lines of symmetry | W28 | full | 8 | `symmetry` + `place_symmetry_lines` exact; 3 pre; no related, and the note says why |
| B4.S2 Equivalent to a non-unit fraction | W15 | full | 8 | Three directs (3/5 = 6/?, 4/5 = ?/20); pre number line, shading; related recognise / simplify |
| B12.S9 Decimal sequences | W05 | gap | 8 | `dec_sequence`; pre count up / down in steps (numbers to about 80), find the rule, tenths line; related whole-number sequence |
| B13.S2 Count through zero in 1s | W38 | gap | 8 | `negative_count`; pre the previous step's integer line, thermometer, number tracks; related place integers |
| B8.S2 Perimeter of rectilinear shapes | W29 | partial | 8 | Both clauses honest (every side labelled; edges counted); pre with "missing side = whole − part" subtraction; related same shapes, area |
| B2.S3 Subtract more than 4 digits | W09 | full | 9 | Three directs at 5–6 digits with exchanges; pre the 4-digit exchange steps, across zeros at ≤ 4 digits; related check by adding, missing digit, stories, estimate |
| B4.S5 Mixed → improper | W16 | partial | 8 | Honest "no direction option"; `improper_mixed_dir`; pre whole as fraction, compose a whole; related subtract mixed (exchange) |
| B10.S10 3-D shapes | W26 | partial | 8 | Three honest partials (names basic solids; counts properties; nets only); pre faces as 2-D shapes |
| B1.S11 Compare and order to 1,000,000 | W07 | full | 9 | Compare / order at 6 digits, exact; pre the 5-digit step, digit value, chart; related word names and number line |
| B7.S1 Decimals to 2 dp | W21 | partial | 8 | Two honest partials; 5 pre; related `compare_decimal {}` "compare": terse, true |
| B5.S10 Efficient division | W12 | partial | 8 | `area_model_div_3by1` clause honest; 6 pre (facts, factor links, box division); builds `long_mult`, `div_factors` |
| B4.S3 Recognise equivalent fractions | W15 | full | 8 | Click-all, yes / no and missing-number forms; pre previous step; related simplify, compare |
| B7.S6 Thousandths as decimals | W12 | partial | 8 | `compare_thousandths` reads only (clause honest); pre whole-number digit value, tenths line, tenths / hundredths; related order to 3 dp |

Sum 162 / 20 = **8.10**.

### Hardest 5 (my choice: FULL verdicts that could be generous, plus B5.S3)

| Step | Score | Reasons |
|---|---|---|
| B7.S11 Round to 1 dp | 8 | `round_decimals {precision:[0]}` (66.52 → 66.5 with the midpoint line) and `round_sort_tenths`: FULL right; the `round_thousandths` partial clause is honest |
| B5.S8 4-digit ÷ 1-digit | 8 | `divide {tiles:41}` deals 7,254 ÷ 9, 9,376 ÷ 8: FULL right (layout via `vis_division_layouts`, noted); `box_division_hard` partial is honest about 3 digits |
| B7.S9 Compare / order to 3 dp | 8 | `compare_thousandths` + `order_decimals {decimals:3}` (65.2 beside 65.828): mixed places, as the step asks |
| B12.S10 × 10, 100, 1,000 (decimals) | 8 | `place_value_10x {op:'x', decimals:true}` 93.5 × 10, 78.4 × 1,000; pre digit value, chart, tenths; related ÷ 10 (inverse) |
| B5.S3 2-digit × 2-digit | 8 | `multiply {tiles:22}` 94 × 72 exact; placeholder partial honest; pre 2-digit × 1-digit, × 10 / 100 |

Sum 40 / 5 = **8.00**.

### Asked by the brief

| Step | Score | Reasons |
|---|---|---|
| B15.S2 Compare volume | 8 | Gap honest ("comparing the volumes of two cube solids"), `volume_cubes`; pre unit squares, arrays, compare counts; related now cubic-unit volumes, a true why (r7: 7) |
| B14.S4 Metric ↔ imperial | 8 | Gap honest with the approximations named; pre customary, mixed and metric conversions; related customary capacity conversions with a true why (typo "one a cell") |

**All distinct steps graded: 218 / 27 = 8.07; min 8.**

## 3. Site lessons: all 21 graded

| # | Lesson (G4) | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|---|
| 1 | Place value: 10 times and one tenth | W05 | partial | 8 | Two honest partials; related `unit_form` now renames (r7 minor fixed) |
| 2 | Multiply / divide multiples of 10 | W06 | partial | 8 | r7 row landed: related renames in unit form, as its why says (r7: 7) |
| 3 | Extend growing shape patterns | W09 | partial | 8 | Number rule only, honest; pre whys name 3s and 4s, and 2s, 5s and 10s |
| 4 | Find emergent features | W09 | partial | 8 | `patterns_notice`; odd / even, multiples, skip counting |
| 5 | Follow a given rule | W09 | full | 9 | `number_patterns_rule {rule:false}` prints the rule ("Rule: count on by 25"); exact |
| 6 | Times as many | W10 | partial | 8 | Clause honest; related times-as-many stories about 1 in 4. Minor: pre `multiply {range:100}` cites "2-digit × 1-digit" and deals mostly facts |
| 7 | Unknown multiplier | W10 | partial | 8 | Clause honest ("about half"); grouping stories and missing factor related |
| 8 | Divide and interpret the remainder | W11 | partial | 8 | Two honest partials (divisors past 9 named); `remainder_too_big`. Minor: pre `word_problems_mixed` is mostly + / − |
| 9 | Decompose a fraction | W13 | full | 8 | `decompose_fractions` with bars |
| 10 | Add tenths and hundredths | W18 | partial | 8 | Honest "forms value does not filter" clause; `add_tenths_hundredths` |
| 11 | Points, lines, segments, rays | W21 | gap | 8 | `points_lines_rays`; related "two rays make an angle" |
| 12 | Angles are additive | W28 | full | 8 | `additive_angles` (246° + ? = 360°); related mixed page as its why says |
| 13 | Line plots with fractions | W28 | partial | 8 | Reads only, honest; `make_line_plot` |
| 14 | Customary capacity | W30 | partial | 8 | Pre capacity click-all re-cited honestly (r7 minor fixed) |
| 15 | Customary length and weight | W31 | partial | 8 | Two honest partials; km → m pre true |
| 16 | Measurement word problems | W31 | partial | 8 | Two honest partials |
| 17 | 3D shapes (Reception source) | W38 | full | 8 | `name_3d_shapes` |
| 18 | Compare fractions (G2 source) | W38 | partial | 8 | Honest (mixes unlike pairs); pre at Year 3 content |
| 19 | Divide a 1-digit number by 100 | W38 | partial | 8 | Clause honest (935 ÷ 100) |
| 20 | Hundredths | W38 | partial | 8 | `decimal_pv`. Minor: related `compare_decimal {forms:[1]}` "comparing hundredths" deals mostly tenths (74.9, 88.4) |
| 21 | Order fractions | W38 | partial | 8 | Honest partial; `order_frac_numline` related |

Sum 169 / 21 = **8.05**; min 8.

## 4. Reproducibility and extraction

- Two clean `git archive HEAD` unpacks; build A with `WRM_TAG_DATA` set, build B with it unset and only a scratch `TMPDIR`.
  Logs identical (136 steps 37 / 74 / 25; 21 lessons 4 / 16 / 1; 101 proposals (29 new, 72 reused); 175 tagFixes; 0 links that
  do not fit at their spec opts; specopts 874 links, 0 differences; mergecheck OK; linkfit 874 links 0 misfits; optcheck 0;
  OK, exit 0). Both outputs sha256 `127fd948074904cb6094fb663dd044c5ab428d893cd49009165c820b5ba951d7` = the committed Y5.json.
- No absolute or scratch paths in `tests/scripts/wrm-tagging/Y5/` (the only default is `$TMPDIR/wrm-tag-Y5`).
- `ws-wrm-extract --site …/scratchpad/site/index.html --check`: `wrm-steps.json up to date`, `site-lessons.json up to date`,
  exit 0. Since r7 (2031ff4f) the only data file changed is `links/Y5.json`.

## 5. Merge (`merge8.mjs`, my own, with a self-test)

In-repo `data/curriculum/links/{R,Y1,Y4,Y5,Y6}.json` against live `js/modules/wrm.js` (328 keys, 937 tags, none with opts).
Each tagFix becomes an outcome (full / partial + opts / opts only / removed). R / Y1 keep the partial clause in `why`, which
is format-only. Lane order forward and reversed.

| Check | Result |
|---|---|
| tagFixes | Y5 175, R 76, Y1 80, Y4 166, Y6 148 |
| Result independent of lane order | **Yes** |
| key\|step written by 2+ lanes | **0**, so **0 real conflicts** |
| Each lane's own steps (direct = full, partial = partial, no stray live tag), alone / merged | R 0 / 0, Y1 0 / 0, Y4 0 / 0, Y5 0 / 0, Y6 0 / 0 |
| Y5 directs / partials whose opts do not land | 0 |
| Foreign-step tagFixes | Y5 0 (Y4 writes `patterns:count_by_step_up\|Y2.B1.S15`, Y4's own, known) |
| Y5 tagFixes naming a site lesson | 0 |
| Proposal ids shared by 2+ lanes | 74, 0 with a different skill or kind |

Self-test (`merge8t.mjs` on a mutated copy of Y5.json: one `remove` dropped, one opts value changed, one foreign remove
added): it reports the stray live tag on Y5.B4.S1, the opts that do not land on Y5.B1.S2, and the foreign step. So the zeros
above are real.

## 6. Minors (non-blocking; for the next pass, none changes a grade)

| # | Where | Note |
|---|---|---|
| 1 | linkfit / claims.mjs (gate only) | The `array` representation claim is satisfied on a text-only `word-work` story by the template's raw markup (100 / 100 on `div_word_problems`). Judge representation claims on the picture, not on layout CSS. No live why is affected |
| 2 | linkfit `missedOptions` (gate only) | `negatedParts` cuts a clause at "(", and a value label with an example ("A story (tiling a floor)") needs every word. So "never a story" is not read against it. Read the label without its parenthetical, as M′(2) already does for Yes / On values |
| 3 | Y5.B7.S10 related | `round_decimals {}` "round to a tenth": use `{precision:[0]}`; `round_fractions` "to the nearest whole" also deals halves (say so) |
| 4 | Lesson 6 pre | `multiply {range:100}` cites "2-digit × 1-digit" but deals facts to 12 × 12: re-cite as facts |
| 5 | Lesson 8 pre | `word_problems_mixed @100`: about two thirds of the stories are + / −; say so in the why |
| 6 | Lesson 20 related | `compare_decimal {forms:[1]}` "comparing hundredths" is mostly tenths |
| 7 | Y5.B14.S4 related why | Typo "one a cell" → "one to a cell" |

## What is right

- Class N is fixed structurally, not case by case. `linkfit --fit` only reports, and any change to a link after the spec is
  a build error: `specopts` catches it at any pass, including the write. Three mutations of my own all failed the build.
- The 143 RELINK rows are written in the spec and are what the build ships. On fresh items, 48 of the 50 I re-read have true
  whys, and the other 2 are minor.
- Every r7 row landed and holds on fresh seeds; B15.S2 and lesson 2 now have related links that deal exactly what their whys
  say.
- Every graded step and lesson is at 8 or better (steps 8.07, lessons 8.05). The build is byte-reproducible from the branch
  alone, extraction is current, site coverage is complete, and the merge with every in-repo lane has 0 real conflicts.
