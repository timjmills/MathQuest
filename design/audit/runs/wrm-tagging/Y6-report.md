# Y6 (US Grade 5) — Wave 2 tagging report

## Site lessons (owner rule 2026-10-16: every site lesson tagged) — 2026-10-17

Builder: Opus 5.5, low effort (`mq-opus-low`), first round. The Y6 WRM steps passed critic r5 and are **frozen**: `steps`, `tagFixes`
and every step field of every proposal are byte-identical to the base (checked by diffing the built file against the merged
base). The only additions are the top-level `lessons` section and, on the proposals lessons use, the `lessons` list and
`closes[<lesson id>]` entries (plus the 20 proposals only lessons use).

### Tooling (one folder per year)
The Y6 tooling moved from `tests/scripts/wrm-tagging/` to `tests/scripts/wrm-tagging/Y6/` (`git mv`; R/Y1's `gen.py`, `spec.py`,
`dump.mjs`, `*_ry1.mjs`, `content_weeks.json`, `reads_range.json`, `maxdealt.mjs` and `wholes.mjs` stay where the R/Y1 lane uses
them). After the move `Y6.json` rebuilt byte-identical to the base (commit fece619c). New files:

| File | What it does |
|---|---|
| `Y6/spec_z_lessons.py` | the 24 lessons: direct / partial with opts and clause, verdict, missing, build + closes, pre (cited unit + reason), related, note; the 9 new proposals (`LNEW`) and the passed-lane proposals reused verbatim (`LANE`) |
| `Y6/lessons.py` | exec'd by `build.py`: `lesson()`, the structure checks, the pre whys ("`<cited id> <its title> (<where it sits>)`: reason"), the proposal merge, the envisioned skills, and the **spec gate**: every written direct / partial / pre / related equals its spec link (key, opts, Max Number, order), else the build fails |
| `Y6/lessonfit.mjs` | every lesson link judged from 40 generated items (two fresh seed sets, print path); the gates below. Run by `build.py`; any finding fails the build |
| `Y6/claims.mjs`, `Y6/titlerep.mjs` | copies of the Y5 lane's claim checker and the Y2-Y3 lane's TITLEREP gate (one change: the line-plot item regex no longer matches any SVG's `x="…"`) |
| `Y6/lessonmut.py` | 15 mutations of the built lessons, one per failure class; each must be caught by its own gate (`lessonmut: 15 mutations, 0 missed`) |
| `Y6/lessonitems.mjs` | `design/audit/runs/wrm-tagging/Y6-lesson-items.md`: 30 items of every lesson link from another fresh seed, 6 shown, for the hand re-read |
| `Y6/mergecheck.mjs` | now also fails a tagFix that names a site lesson (any file), a tagFix of the checked file on a step outside it, and a `lessons` section that is not exactly the year's entries of `site-lessons.json` |

### Every critic failure class is a gate (not avoided by hand)
| Class (critic) | Gate | Proven by |
|---|---|---|
| False why after a silent re-option (Y5 r5-r7 N) | `lessons.py` spec gate: no pass may change a link's opts, add or drop one; `lessonfit` claims gate on every why | build-tree mutation (a re-option and a dropped pre inside `finish()`: 2 SPECOPTS errors, exit 1); lessonmut "N" |
| A why's claim false of the items (K, L, N, N′: units, metric / customary, representations judged on the picture, forms) | `claims.mjs` gated claims on the why **and the cited unit's full title**; the Y6 linkfit why rules (sizes, shapes, columns, units, families) | lessonmut "claims" (a "number line" why on bare expressions) |
| FULL that does less than the title's verb / range / representation (Y2-Y3 r13-r15) | TITLEREP (FULL: the direct items show every title claim; partial / gap: the clause names it); RANGE (title bound, or a Support lesson's source-year range) | lessonmut "TITLEREP FULL", "TITLEREP CLAUSE", "RANGE" |
| Customary vs metric (Y5 r6 K) | a customary unit in any link of a metric lesson; a why that claims customary / metric units is checked by claims | lessonmut "K" |
| Pre harder than the entry; content not yet taught (rule 18, 19) | SIZE (1.5 × the larger of the lesson's ceiling and its cited unit's, floor 1,000; Support: 1.5 × the source year's range), Grade 5 FIRST table by school week (pre: none later; related: 2 weeks ahead at most), beyond-Grade-5 content | lessonmut "rule 19" |
| Denominators off-family hidden in the cell payload (Y2-Y3 r12-r14 N12) | DENOMS: a link with `denoms` read on text, picture **and payload**; every off-family family must be named, a named word dealt, a denied word not dealt | lessonmut "DENOMS" (`equiv_frac_visual {denoms:[2]}` "halves and quarters": the payload deals thirds) |
| Pre identical to the lesson's own skill (Y5 r5 F) | build: no pre / related key equals a direct / partial key; lessonfit: no link deals the same generated items | lessonmut "F" |
| Support lessons judged vs source grade (Y5 r5-r6 H, H′) | a Support lesson's links are judged at week 0 (no Grade 5 content at all), its pre may cite only its source year or below (never a Y6 step), no pre that compares unlike fractions below a Grade 4 source, sizes within the source range | lessonmut "H Support pre", "H Support cites" |
| Pre cite not true (Y5 r5 H, rule 19) | CITE: a pre's why starts with the cited step or lesson and its own title; that unit teaches the key (live SKILL_WRM, R / Y1 / Y4 / Y5 tagFixes, Y6 steps, Y5 and Y6 lessons); a Y6 unit is taught by the lesson's week | lessonmut "CITE" |
| A clause that denies what the items do | CLAUSE: a partial clause's gated claims are true of its items, and a negated operation is not dealt | lessonmut "CLAUSE negated op" |
| An existing option missed (Y5 r6 M, r7-r8 M′) | M: a "never / no …" clause read against every labelled option value of the listed skills; now also through a bracketed example ("never a story (a box, a tank)": the r8 hole) | lessonmut "M" |
| A decimals lesson FULL on whole-number operands (Y5 r5 G) | G | lessonmut "G" |

### Counts
24 lessons = the 24 `wrmYear: "Y6"` entries of `site-lessons.json`, in the site's order: 16 committee (all SUP; 9 Awsaj
supplements with a WRM block, 7 domain-test builds), 4 unflagged Grade 5 end-of-year entries (Projects & Taskmaster, W38) and
4 Support titles (enrich-native). HELPERS' Awsaj supplements are all present: scaling (10), ÷ unit fraction (12), ordered pairs ×2
(8, 9), composite volume (14), fraction line plots (15), 2-D hierarchy (16).

| Verdict | Lessons |
|---|---|
| full | **0** |
| partial | 20 |
| gap | 4: decimals in word / expanded form (2), composite volume (14), investigation projects (18), What is volume? (23) |

Proposals used by lessons: **24** — **9 new** (`div_by_decimal_model`, `oop_braces`, `scaling_equiv`, `whole_div_unit_frac`,
`length_customary_both`, `shape_hierarchy`, `g5_arith_review`, `cross_strand_problems`, `investigation_project`) and **15 reused**:
4 already Y6 step proposals (`value_ten_times`, `thousandths_pv`, `pv10_exponents`, `volume_cubes`), 6 from STANDARD_PROPOSALS /
VISUAL_BUILDS (`mult_dec_dec`, `decimal_models`, `write_numeric_expression`, `pattern_pairs_graph`, `volume_composite_repair`,
`vis_reasoning_frames`), and 5 verbatim from a passed lane (Y5 `make_line_plot`, `frac_compare_same_part`; MAP
`map_frac_side_area`; Y4 `div10_small_numbers`, `dec_fraction_basics`). Lesson-only proposals have `steps: []` and carry
`lessons` and `closes[<lesson id>]` (the lead's WRM_PROPOSALS merge must read `lessons`). 102 links (77 pre, 25 related), every
lesson ≥ 3 pre cited by the step or lesson that teaches the key and that the pupil has met by the lesson's week. Lessons emit
**no tagFixes**.

| # | Lesson | Wk | Flag | CCSS | Verdict | Direct / partial (opts) | Build | Pre/rel |
|---|---|---|---|---|---|---|---|---|
| 1 | Compare digit values (10 times / 1/10) | W06 | committee | 5.NBT.A.1 | partial | `value {"band":999999}` | value_ten_times | 3/2 |
| 2 | Decimals to thousandths in word and expanded form | W06 | committee | 5.NBT.A.3a | gap | — | thousandths_pv | 4/1 |
| 3 | × ÷ decimals by powers of 10 with exponents | W07 | committee | 5.NBT.A.2 | partial | `place_value_10x {"decimals":true}` | pv10_exponents | 3/1 |
| 4 | Divide by a decimal | W08 | committee | 5.NBT.B.7 | partial | `div_decimal {"forms":[1,2]}` | div_by_decimal_model | 3/1 |
| 5 | Multiply decimals by decimals | W08 | committee | 5.NBT.B.7 | partial | `mult_decimal` | mult_dec_dec, decimal_models | 3/1 |
| 6 | Expressions with parentheses, brackets and braces | W11 | committee | 5.OA.A.1 | partial | `nested_complex {"band":50}`; `oop_hard {"forms":[0],"band":50}` | oop_braces | 3/1 |
| 7 | Write and interpret numerical expressions | W11 | committee | 5.OA.A.2 | partial | `write_expression {"forms":[0]}` | write_numeric_expression | 3/1 |
| 8 | Form ordered pairs from corresponding terms | W13 | committee | 5.OA.B.3 | partial | `pattern_relationship {"forms":[0]}` | pattern_pairs_graph | 3/1 |
| 9 | Generate two sequences using two rules | W13 | committee | 5.OA.B.3 | partial | `number_patterns_rule {"pattern":["add"],"places":[1],"rule":false}`; `pattern_relationship {"forms":[0]}` | pattern_pairs_graph | 3/1 |
| 10 | Multiplication as scaling | W16 | committee | 5.NF.B.5a/b | partial | `mult_scaling_nv` | scaling_equiv | 4/1 |
| 11 | Area of a rectangle with fractional sides | W17 | committee | 5.NF.B.4b | partial | `mult_frac_frac` | map_frac_side_area | 3/1 |
| 12 | Divide a whole number by a unit fraction | W18 | committee | 5.NF.B.7b/c | partial | `div_unit_frac_nv {"forms":[0,1]}`; `div_unit_fraction` | whole_div_unit_frac | 3/1 |
| 13 | Convert customary units of length | W21 | committee | 5.MD.A.1 | partial | `length_customary` | length_customary_both | 3/1 |
| 14 | Volume of composite solids | W24 | committee | 5.MD.C.5c | gap | — | volume_composite_repair | 3/1 |
| 15 | Fraction line plots | W25 | committee | 5.MD.B.2 | partial | `line_plot_fractions` | make_line_plot | 3/1 |
| 16 | Classify 2-D figures in a hierarchy | W29 | committee | 5.G.B.3, 5.G.B.4 | partial | `classify_quads`; `classify_triangles` | shape_hierarchy | 3/1 |
| 17 | Consolidation of arithmetic | W38 | other | (5.OA.A.1) | partial | `mixed {"decimals":2}` | g5_arith_review | 4/1 |
| 18 | End-of-year investigation projects | W38 | other | (5.OA.A.1) | gap | — | investigation_project | 4/1 |
| 19 | Problem solving across strands | W38 | other | (5.OA.A.1) | partial | `multi_step_word`; `word_problems_mixed` | cross_strand_problems | 4/1 |
| 20 | Reasoning tasks | W38 | other | (5.OA.A.1) | partial | `compare_expressions {"forms":[1],"band":20}` | vis_reasoning_frames | 3/1 |
| 21 | Divide a 2-digit number by 100 (Support, source Gr 3) | — | enrich-native | 4.NF.C.6, 5.NBT.A.2 | partial | `place_value_10x {"op":"/","power":[100],"decimals":true}` | div10_small_numbers | 3/1 |
| 22 | Order fractions (Support, source Gr 2) | — | enrich-native | — | partial | `order_fractions` | frac_compare_same_part | 3/1 |
| 23 | What is volume? (Support, source Gr 4) | — | enrich-native | 5.MD.C.3 | gap | — | volume_cubes | 3/1 |
| 24 | Write decimals (Support, source Gr 3) | — | enrich-native | 4.NF.C.6 | partial | `f_to_d {"denoms":[5]}` | dec_fraction_basics | 3/1 |

### Hand audit against every clause of the title and the CCSS descriptor (Grade 5 range)
No lesson is FULL. The audit below covers the lessons a reader (or `standards-audit.js`) might call full, read on generated items
(`Y6-lesson-items.md`, 30 items a link, plus lessonfit's 40):

| Lesson | Title / CCSS clause | Dealt by the items? | Verdict |
|---|---|---|---|
| 6 Parentheses, brackets and braces | evaluate with parentheses ✓, brackets ✓ (`nested_complex`: 5 × [2 + (6 × 3)] ÷ 5; `oop_hard`), **braces** (title "and braces"; CCSS "or braces") | braces in 0 of 70 items | partial (`oop_braces`). 5.OA.A.1 alone is met ("or"); the title is not |
| 10 Multiplication as scaling | 5a compare a product with a factor without multiplying ✓ (4/3 × 12 vs 12); 5b fraction > 1 / < 1 ✓, whole number > 1 as the familiar case ✓ (`mult_comparison` pre); **a/b = (n × a)/(n × b) as multiplying by n/n = 1** | n/n only as "8/8 × 10 = 10" (the "equal" bin), never as fraction equivalence; the scaled number is always whole | partial (`scaling_equiv`). standards-audit calls 5.NF.B.5a/b full |
| 16 2-D hierarchy | 5.G.B.4 classify in a hierarchy: categories of one quadrilateral ✓ ("a shape can belong to more than one category"); **the hierarchy itself**; 5.G.B.3 **a category's property inherited by its subcategories**; triangles by sides **and** angles | 0 of 70 | partial (`shape_hierarchy`). standards-audit calls both full |
| 12 ÷ unit fraction | compute whole ÷ unit fraction ✓ (`div_unit_frac_nv {forms:[0,1]}`: 40 / 40); visual model ✓ only on `div_unit_fraction`, which mixes in 1/2 ÷ 4; **story context** (7b, 7c); the × check (7b) only as a pre | stories 0 of 70 on the partials (the ribbon stories are in the related `frac_mult_word_plain`, 10 of 40) | partial (`whole_div_unit_frac`) |
| 11 Area, fractional sides | multiply fractional sides ✓ (`mult_frac_frac` overlap model); **tile with unit-fraction squares and show area = product** | 0 | partial (`map_frac_side_area`) |
| 13 Customary length | in, ft, yd, mi ✓; larger → smaller ✓; **smaller → larger, mixed units, fractional amounts (5.MD.A.1 "5 cm to 0.05 m"), multi-step problems** | 0 of 40 (`length_customary` forms are all larger → smaller) | partial (`length_customary_both`) |
| 4 Divide by a decimal / 5 Multiply decimals by decimals | 5.NBT.B.7 to hundredths **with models / place-value strategies** | div: tenths divisors only, numbers only; mult: decimal × 1-digit whole only | partial |
| 21-24 Support | judged at the source grade (Year 4, 3, 5, 4): numbers ≤ 1.5 × the source range, no Grade 5 content, pre cite the source year or below | ÷ 100 deals 3-digit dividends only; order_fractions deals unlike sets; f_to_d mixes fifths, no picture | partial / gap |

Every other clause is in the lesson's `missing` and its partials' clauses, which `lessonfit` holds to the items (CLAUSE, M,
TITLEREP).

### Generator notes (record only; app code not edited)
- `div_unit_frac_nv`: forms 0/1 and 2/3 have swapped labels (already in this report): `{forms:[0,1]}` deals whole ÷ unit fraction, 40 / 40.
- `place_value_10x {decimals:true}`: ignores `band` (3-digit dividends at any band).
- `conversions:f_to_d` has no `forms` option (a passed `{forms:[0]}` is ignored); with `denoms:[5]` every item is one conversion.
- `algebra:multi_step_word`: two-step + and − stories only (its forms are add/take-away orders); the multi-step skills deal no × or ÷.
- `percent_of_number {forms:[0]}`: "What is 33% of 90? → 30" (33% treated as a third).

### Owner questions (recommendation)
1. **Composite volume (W24) is scheduled before the WRM volume steps** (Y6.B10.S7-S8, W25), so no pre can be a volume skill. *Recommend moving the lesson to W25-W26 (after Volume of a cuboid); until then its pre are the 2-D area skills and `volume` is a related one week ahead.*
2. **Braces**: the title says "parentheses, brackets and braces"; 5.OA.A.1 says "or". *Recommend keeping braces (build `oop_braces`, small); the lesson is otherwise met by `nested_complex` + `oop_hard`.*
3. **The four "Projects & Taskmaster" entries list 5.OA.A.1** for all four. *Recommend the site leaves their CCSS empty or names the strands each project uses; the tags here do not treat 5.OA.A.1 as their content.*
4. **Support lessons that are WRM steps under another title** (Divide a 2-digit number by 100 = Y4.B8.S10; Order fractions = Y3.B6.S2 / S5; What is volume? ≈ Y5.B15.S1; Write decimals = Y4.B8.S2 / S8). *Recommend the site use the WRM titles so they resolve to the step (as recommended for Y5).*
5. **`thousandths_pv` text**: the Y6 step proposal carries the WRM_PROPOSALS wording; lesson 2 needs the WRM_EXTENSIONS addition ("number names and expanded form to thousandths"). *Recommend the lead merge the extension into the proposal text (with Y5's patch).*

### Gates (this round)
| Gate | Result |
|---|---|
| Two clean `git archive HEAD` builds (`env -u WRM_TAG_DATA`) | exit 0 both, `Y6.json` byte-identical to each other and to the committed file; logs identical |
| Steps / tagFixes vs the base | identical (114 steps 24 / 70 / 20; 148 tagFixes); base proposals unchanged except `lessons` + `closes[<lesson>]` on 4 |
| mergecheck Y6; Y6 + R + Y1 + Y4; Y6 + R + Y1 + Y4 + Y5 (every passed lane in the repo; Y2 / Y3 are not in the repo) | 0 problems each; 0 tagFixes name a lesson |
| optcheck / linkfit (steps) | 0 / 0 |
| lessonfit (24 lessons, 102 links, 40 items a link) | 0 findings |
| lessons.py spec gate | 0 differences; a re-option + drop injected in a scratch tree: exit 1 |
| lessonmut.py | 15 mutations, 0 missed |
| `ws-wrm-extract --check --site …/scratchpad/site/index.html` | exit 0 (both files up to date) |
| `ws-boot-smoke` | OK |

Rebuild: `python3 tests/scripts/wrm-tagging/Y6/build.py` (exit 1 on any problem); proof: `python3 tests/scripts/wrm-tagging/Y6/lessonmut.py`;
items: `node tests/scripts/wrm-tagging/Y6/lessonitems.mjs --md design/audit/runs/wrm-tagging/Y6-lesson-items.md`.

## Fix round r2 (after critic r4: FAIL on three 7s, B2.S6, B9.S9 and B6.S5, and reproducibility) — 2026-10-16

All changes are in the build's spec files (`spec_r2_a_critic_r4.py` for the §7 rows, `spec_r2_b_sweep.py` for the class B
sweep); `Y6.json` is generated by `build.py`. Against the r4 file: 102 whys rewritten, 6 links dropped, 6 opts changed,
4 partial clauses and 7 notes changed. Verdicts, tags and tagFixes are unchanged in number (148: add 53, full 2, partial 77,
opts 10, remove 6); the B4.S7, B7.S5, B8.S2 and B8.S3 `partial` clauses are regenerated from the new text.

### §7 rows
| Row | Step(s) | Change |
|---|---|---|
| R | build | Merged `origin/claude/sweet-newton-c8wrv1` (merge commit); R, Y1 and Y4 links are now pinned in `data/curriculum/links/`. `OTHER` defaults to those in-repo paths, `DATA` to `$WRM_TAG_DATA` or `tempfile.mkdtemp()`; linkfit makes its own `prior.json` in a temp dir when run alone. No path outside the repo is read. The base's R/Y1 `mergecheck.mjs` and `items.mjs` (an add/add conflict) are kept as `mergecheck_ry1.mjs` and `items_ry1.mjs` |
| 1 | B2.S6 | `mult_facts` why → times-table facts to 12 × 12, the squares among them; note rewritten (mult_three is the preBuild, square_cube the build) |
| 2 | B9.S9 | related `fraction_of_set_hard` dropped; `ratio_tables` why → a missing value in a scaling table (no percents) |
| 3 | B6.S5 | inch `reading_ruler` pre dropped (5 pre remain); `double_num_line` why → paired scales (miles \| hours, cups \| pancakes) |
| 4 | B12.S9 | inch `reading_ruler` pre dropped (3 pre remain); `name_2d_shapes` cites R.B4.S1 (owner Q3, a cm ruler, stays open) |
| 5 | B6.S6 | `perimeter` why → from two side lengths (numbers, no grid) |
| 6 | B1.S8 | `count_by_step_down` why → back in 2s, 3s, 4s, 5s and 10s from numbers below 200 (nearest-live-practice tail kept by the build) |
| 7 | B12.S2, B12.S6 | `missing_add_sub` why → a missing addend within 20, the move 180 − 164 uses |
| 8 | B4.S3 | `frac_mult_word` why → × stories and whole ÷ unit fraction; no fraction ÷ whole story |
| 9 | B11.S4 | `p_to_f` why → 25% = 1/4, the share a sector shows |
| 10 | B8.S2 | `compare_thousandths` clause → decimals within 1 only; never an integer part, digit value or partition |
| 11 | B4.S7 | `fraction_of_set_hard_nv {forms:[1]}` clause adds the forward click item (about a third; generator bug) |
| 12 | B7.S5 | `evaluate_expression_hard` clause adds the negative and squared-bracket substitutions (about 4 in 10) |
| 13 | B9.S5, B10.S7, B11.S1, B12.S7 | notes rewritten to the data, in the critic's words |
| 14 | B5.S2, B5.S5 | `mass_volume_liquid {forms:[0,2]}` (no kg-dial item); whys say choose g/kg/mL/L and read a mL scale |
| 15 | B13.S4, B13.S5 | `ENVTEACH` for translate_grid and reflect_grid: four quadrants, the new coordinates written; a note on each step says the reused WRM_PROPOSALS text is the Y4/Y5 first-quadrant one (wrm.js is not this lane's to edit) |
| 16 | B9.S7, B10.S7, B10.S8 | B9.S7 related `double_num_line` dropped; `mult_facts` why → times-table facts to 12 × 12 |
| 17 | 9 pre cites | B2.S2, B2.S16 ×2, B3.S1, B3.S2, B4.S1, B9.S8, B12.S1, B12.S9 now start with a step id, so the H re-cite runs on them (B3.S2 now carries the "nearest live practice" tail) |
| 18 | tooling | see below |

### Class B sweep (the whole file, not a sample)
Every pre and related why (803 links, 509 pre and 294 related, as 380 distinct key+opts signatures) and every partial clause
(121) was read against 10 freshly generated items of its own link (seed 31337 + 101i, the link's opts; dump in the scratch
dir), and each claim that needed a count was counted over 40–80 items (two-part angle items in `mixed_angles_lines` 9/80,
triangles in `mixed_shapes` 23/80, primes in `mixed_number_theory` 5/80, circles in `partition_shapes` 19/40, cents in
`money` 0/40 at default, negatives in `temperature` 0/80, 0.0x in `d_to_f` 0/80, a backwards machine in
`function_table_hard` 0/80, a number line in `round_decimals` 0/40). **About 60 further whys and one clause were false**
beyond the 23 rows the critic named, all fixed in `spec_r2_b_sweep.py`. The kinds:
- representations not drawn: circles called bars (`equiv_frac_visual`), bars/area/circle (`div_unit_fraction` draws bars only),
  number lines (`decimal_nl_drag` "all three forms", `benchmark_fractions`, the B8.S3 `round_decimals` clause), grids;
- contexts the bare items do not have: "times as much", unit prices, recipes (`mult_decimal`, `frac_mult_word`, `double`,
  `halve`), "money × integer", discounts, "money shared out", "fair share on a line plot", "choose the right graph";
- sizes and forms: `dot_array_mult` "n rows of n dots" (8 × 3), `rounding_table` "to 10,000, numbers to 5 digits" (3-digit),
  `place_value_10x` "of a 3-digit number", `box_division_hard` "past the decimal point", `div_decimal` "decimal ÷ integer"
  (now `forms:[0]`), `money` "two-place decimals" (now `step:1`, prices with cents);
- percents on links with none (now "no percents: the step to …");
- two more inch rulers on cm drawing steps (B6.S7, B12.S10) dropped, as rule 18 / critic #5.

### Tooling (row 18)
- `linkfit.mjs` WHY check widened: percent or %; squared paper or grid (an SVG of ≥ 8 lines or ≥ 12 rects, the area model,
  the box grid); circle (an SVG circle, an arc, `kind:"circle"`); "find the whole"; counting "to 0"; an angle total
  ("of 90", "180 =", "180 − (a + b)"); "n × n"; "single-digit"; "integer part"; a machine "worked backwards". A why that
  says "no percents / no grid / no circles / no angles" is exempt. A partial clause that claims an integer part is checked too.
  Run on the r4 file it reports 30 misfits, including critic #1, #2, #3, #6, #7, #8, #10, #11, #19 and the unsampled ones.
- `AVOIDABLE_BUGS` in linkfit: a link to `mass_volume_liquid` must carry `forms` without 1.
- `build.py` runs linkfit and fails on a misfit, and fails on a stale note (class N): "X is the build / (also) the preBuild",
  "both are preBuild", "no separate preBuild", "X … is/are direct/partial", "X is both the build and the pre-skill" are read
  and checked against the step's lists. Run with the r4 notes it reports all five of critic #14–#18.

### Gates (r2)
- Clean `git archive HEAD` in two fresh dirs, no `WRM_TAG_DATA`: both builds OK and byte-identical to the committed `Y6.json`.
- Build: mergecheck Y6 0, Y6 + R + Y1 + Y4 0; optcheck 0; linkfit 803 links, 0 misfits; N check 0.
- Critic's `msim4.mjs`: Y6 alone 0 problems; R + Y1 + Y4 + Y6 and Y6 + R + Y1 + Y4: 0 Y6 problems and 0 cross-file
  conflicts; the 14 notes are the R (3) and Y1 (11) "partial on an untagged pair" convention the critic recorded as theirs.

### Generator bugs added this round (recorded, not fixed here)
- `fractions:fraction_of_set_hard_nv`: its "click all expressions equal to a/b of n" form ignores `forms` (21 of 60 at `forms:[1]`).
- `patterns:count_by_step_down`: `range` does not bound the numbers (range 10 → 51, 50 → 96, 100 → 194).
- `subtraction:missing_add_sub`: `range` changes nothing (every item ≤ 20 at every value).

## Fix round r1 (after the lead's local critic r1, FAIL 7.02 against BRIEF rules 1-19) — 2026-10-16

`data/curriculum/links/Y6.json` is now **GENERATED**: `python3 tests/scripts/wrm-tagging/Y6/build.py` builds it from
`spec_base.json` (the helper's round-3 tagging, frozen) plus the fix rounds `spec_r0_helpers.py`, `spec_r1_*.py`, with the
live `wrm.js`, `data.js`, `build-list.js`, the xlsx sheet "Grade 5" and the passed lane files R.json, Y1.json, Y4.json
(`WRM_LINKS_OTHER`, default `/home/user/ref/...`). It derives the citations, the tagFixes, the proposals and the envisioned
skills, checks rules 3, 10, 14, 15, 16, 19 (D, F, G, K), and runs `mergecheck.mjs` (Y6 alone, then Y6 + R + Y1 + Y4) and
`optcheck.mjs`; any problem fails the build. Two builds are byte-identical. Tooling ported from the Y4 lane:
`keys.mjs`, `prior.mjs` (Grade 5), `mergecheck.mjs` (now several files, structured `partial` required in the first),
`optcheck.mjs`, `optchange.mjs`, `items.mjs`, and a Grade 5 `linkfit.mjs` (size per step, the critic's first-taught-week
table, beyond-grade content, customary units on metric steps, whys checked against items); `probe.mjs` and `opts.mjs` print
items and option schemas.

**Gates (head of this round):** build OK twice, byte-identical; mergecheck Y6: 169 tags, 148 tagFixes, **0 problems**;
mergecheck Y6 + R + Y1 + Y4: 559 tags, 470 tagFixes, **0 problems**; optcheck 133 opts entries, 0 problems; optchange 0 option
values that change nothing; linkfit 809 links (60 print-path items each), **0 misfits**; items.mjs: every direct/partial
generates with its opts, 0 errors.

**Counts now:** 114 steps — 24 full, 70 partial, 20 gap (B1.S1 fell to partial: 1,000,000 itself is never dealt). 80
proposals: 17 new, 63 reused (Y4's `factor_pair_strategy` reused as B2.S10's preBuild). 148 tagFixes: add 53, full 2,
partial 77, opts 10, remove 6. 513 pre and 296 related links, 84 with opts. All 90 partial/gap steps carry an `envision`.

### What changed, per critic defect
- **M1** (direct on a partial step): B1.S6 `compare_int`, `order_negatives` and B9.S5 `d_to_p`, `p_to_d` are partial with
  the step's clause; the build and mergecheck both reject a direct on a non-full step.
- **M2 / M** (stale clauses, clause buried in `why`): tagFixes are derived against the live SKILL_WRM and every `partial` /
  partial `add` carries the clause in a structured `partial` field; the 14 pairs now come out of the merge with the Y6.json
  clause (mergecheck compares clause text).
- **A** (links without opts): 84 links now carry opts (bands, metric units, forms), each generated first.
- **B** (false whys): all 25 rewritten to what the items deal or given the band that makes them true (combine / pv_digit_drag /
  compare band 999,999; place_value_disks band 9,999; place_on_number_line span 1,000 band 10,000; count_by_tables 3s;
  multiply tiles 31 = 3-digit × 1-digit columns; mult_properties, missing_add_sub, div_remainders, div_zero_in_quotient,
  mult_placeholder_zero, place_value_10x, volume, exponents whys rewritten); the two "parallelogram" related links on B10.S6
  are gone; `double_num_line` is off every metric and percent step; `unit_conversions` is Metric with forms [0] (its "click
  every equal" form offered "1 mile").
- **C** (opts the clause relies on): B1.S2/S3/S6 bands 999,999; B1.S5 place_on_number_line span 1,000 band 10,000 with the
  clause saying so; B4.S3/S4 `div_unit_frac_nv {forms:[2,3]}` (labels swapped, see bugs) with the click-item share in the
  clause, `div_unit_fraction` moved to related; B2.S15 every direct at band 50 (200 items each, no negatives), so it stays full.
- **D** (pre taught later): B7.S3, B7.S5, B7.S8, B7.S9, B11.S5, B2.S12 cites removed or replaced (B7.S8 pre now Grade 4
  missing numbers + the W12 machine; the 1-step equation skills are related); B7.S5/B10.S1/B10.S2 `area {forms:[1,2]}`
  (rectangles only, 0 triangles in 80); B5.S4 ratio table out; B4.S5 `div_unit_frac_nv` out; B3.S9 estimate `{task:[0]}`.
  The build fails any pre whose cited Y6 step is taught after the step's week.
- **E** (related far ahead / beyond grade): ordering_rationals, add_int, abs_value (×4), percent_of_number, double_num_line,
  equiv_ratios, ratio_tables, unit_rate_intro, mixed_conversions, coordinate_graph/coordinate_all on B13.S1,
  evaluate_expression_hard dropped; paren_simple / paren_multi band 50; exponents `{step:[0], band:50}`;
  estimate_frac_ops `{task:[0]}`. linkfit fails a related more than 2 school weeks ahead.
- **F**: the 8 earlier-learning related links moved to pre (B9.S3 ×2, B9.S4 ×3, B9.S5, B8.S1, B7.S9); the build rejects a
  related whose why says prior learning or cites an earlier year.
- **G**: own build removed from preBuild on all 11 steps (B11.S1 has no other line-graph proposal; its pre are live).
- **H**: every pre citation is a step id; a cite the skill is not tagged to (SKILL_WRM + R/Y1/Y4 tagFixes + Y6) is re-cited
  to the nearest step it is tagged to that the pupil has met by that week, or says "nearest live practice … is not tagged
  to …" (6 left: add/sub_100k_mixed, factor_links_medium, fraction_nl_drag, mult_comparison_plain, count_by_step_down).
- **I**: B8.S4 has 4 pre (money, compare_decimal moved in) with a note; B12.S1 has 3 pre (identify_lines) and a note.
- **J**: B1.S2 (B1.S1 6-digit number_word_names, Y5 combine), B2.S7 (multiply 3-digit × 1-digit columns and 2-digit × 2-digit),
  B5.S2 (decimal × and ÷ 10/100/1,000 from B8.S5/S6, W07), B7.S8 (missing_factor_or_addend), B8.S4 (above).
- **K**: "half its coefficient items" → "some coefficient items"; the build rejects a per-seed proportion.
- **L**: count_by_powers_of_10 off B1.S1, `{step:[0,1]}` on B1.S4; B1.S1 partial (1,000,000 never dealt), build big_numbers.
- **Rule 13/16**: every partial/gap step has `envision` (name, kind, teaches, closes, representation); `closes` is the step's
  own missing clause, and on the 13 two-build steps each proposal closes its own words of that clause.

### Generator bugs (recorded, not fixed in this lane)
- (r2) `fraction_of_set_hard_nv` click form ignores `forms`; `count_by_step_down` `range` does not bound the numbers; `missing_add_sub` `range` changes nothing. Details in the r2 section above.
- `fraction_operations:div_unit_frac_nv`: form labels swapped (forms [0,1] "Unit fraction ÷ whole" deal 8 ÷ 1/3; [2,3]
  deal 1/3 ÷ 6); the "click all expressions equal to n ÷ 1/k" item ignores forms (17 of 60 with forms [2,3]).
- `order_of_operations:two_ops_no_paren` / `three_ops_no_paren` / `paren_simple`: negative answers and operands at the
  default band (band 20 or 50 removes them: 0 in 200).
- `order_of_operations:exponents_simple`: "8² − 73 = −9" unless `step:[0]`.
- `fraction_operations:estimate_frac_ops`: negative estimates ("1/10 − 1/8 ≈ −0.5") unless `task:[0]`.
- `patterns:count_by_powers_of_10`: no band; reaches 23,000,000.
- `fractions:simplify`: one "Simplify this fraction" item offers −1/10 as a distractor (1 in 60; linkfit lists it as known).
- `measurement:unit_conversions` Metric: the "click every equal" form offers "1 mile" as a distractor.
- Still open from the helper: `percent_of_number` 33% answers, the `mass_volume_liquid` kg dial, the `percent_visual` "shade" form.

### Owner questions (recommended answer in italics; this round proceeds with it)
1. **B1.S1: is a 6-digit band "Numbers to 1,000,000"?** The step's end number is never dealt. *Partial, closed by the
   reused big_numbers band (which reaches 1,000,000 and beyond).*
2. **Order of operations: tag with band 50, or wait for the generator fix?** *Tag full with band 50 (verified), and fix the
   default-band negatives in the order-of-operations lane.*
3. **Rulers marked in inches on metric lessons.** reading_ruler is off B5.S1; on B6.S5 and B12.S9 it stays with a why that
   says so. *Build a cm ruler option on reading_ruler (small), then switch these links to it.*
4. **Grade 5 teaches 2-step equations (W12) 23 weeks before 1-step (W35).** *Keep the school's order; 1-step equation skills
   are related only for B7.S8, and the pre are Grade 4 missing numbers + the W12 function machine. Ask the school whether
   W35 is intended.*
5. **Pre citations with no tagged skill (6 "nearest live practice" links).** *Leave them for the Y5 and Y3 lanes to tag
   (add_100k_mixed → Y5.B2.S2, sub_100k_mixed → Y5.B2.S3, …) rather than tag another year's steps from this file.*
6. The round-3 questions below (big_numbers vs method at a smaller size, function_machine, mult_dec_dec, translate/reflect,
   W32/W33 lists, Y5 re-check, generator bugs, tidy proposals) stand with the same recommendations.

---

## Round 3 report (helper lane, 2026-10-10; kept for the record)

Output: `data/curriculum/links/Y6.json` (format per `BRIEF.md`). Critic: `Y6-critic.md` — round 3, **8.09/10 PASS**
(min 7; 32 steps); earlier rounds `Y6-critic-r1.md` 7.47 FAIL, `Y6-critic-r2.md` 7.50 FAIL.

## Method
- Every Y6 small step (114, 13 blocks, block order) was judged by reading what the skills really deal
  (gen-*.js, skill-options.js, SKILL_CATALOGUE, sampled items), not their names.
- Pre-skills start from the school's weekly prior-learning list (`Awsaj-Domain-Sequence-K-5-2026-27.xlsx`,
  sheet "Grade 5"), each lesson mapped to its WRM step and that step's tagged skills, then the previous
  step, then lower-grade skills on the same CCSS cluster. A pre-skill never repeats a direct or partial
  skill; `related` never repeats `pre`, direct or partial.
- `tagFixes` are **derived mechanically**: the diff between each step's direct/partial lists and the live
  `SKILL_WRM` tags (add = new tag or partial→full; partial = full→partial or a new partial cover;
  remove = live tag that does not teach the step). The lead can apply them as they stand.
- The 8 Awsaj supplements in Y6 blocks (scaling, ÷ unit fraction, ordered pairs ×2, volume of composite
  solids, fraction line plots, 2-D hierarchy) are not WRM small steps and are not in the file.

## Counts

| Block | Steps | Full | Partial | Gap |
|---|---|---|---|---|
| B1 Place value | 8 | 2 | 6 | 0 |
| B2 + − × ÷ | 17 | 5 | 10 | 2 |
| B3 Fractions A | 9 | 6 | 3 | 0 |
| B4 Fractions B | 7 | 2 | 5 | 0 |
| B5 Converting units | 5 | 1 | 3 | 1 |
| B6 Ratio | 10 | 1 | 6 | 3 |
| B7 Algebra | 10 | 3 | 6 | 1 |
| B8 Decimals | 9 | 1 | 8 | 0 |
| B9 Fractions, decimals, percentages | 9 | 1 | 8 | 0 |
| B10 Area, perimeter, volume | 8 | 1 | 4 | 3 |
| B11 Statistics | 6 | 0 | 3 | 3 |
| B12 Shape | 11 | 0 | 4 | 7 |
| B13 Position and direction | 5 | 2 | 3 | 0 |
| **Total** | **114** | **25** | **69** | **20** |

Every `full` verdict was re-checked in round 3 by sampling 20 items per direct skill and reading the
generator; 10 earlier "full" calls fell to partial (mostly: the skill deals only 1-dp decimals, a fixed
denominator set, one letter, or prints the whole that the pupil should find).

Proposals: 79 — **62 reused** existing ids (WRM_PROPOSALS, STANDARD_PROPOSALS, VISUAL_BUILDS) with the Y6
steps added, **17 new**, all options on live skills (no new skill ids): `wp_multidigit`, `wp_long_div`,
`frac_div_int_any`, `metric_decimal_convert`, `ratio_language`, `expr_two_ops`, `expr_two_letters`,
`dec_unequal_places`, `pv10x_dp`, `div_dec_2dp`, `f_to_d_factors`, `f_to_d_division`, `f_to_p_denoms`,
`pct_one_step`, `mean_missing`, `reflex_angles`, `net_draw`. (A draft `nl_millions` was folded into the
existing `nl_20`.)

tagFixes: 121 — 102 partial (mostly live "full" tags that do not reach Y6 size or method), 14 add,
5 remove: `algebra:multi_step_word` off B2.S8 (+ − within 100 only); `integers:order_negatives` off B1.S8
(ordering is B1.S6; kept as pre); `conversions:equiv_ratios` off B6.S3 (belongs to ratio problems);
`fraction_operations:mult_scaling` off B6.S6 (never enlarges a shape); `coordinates:coordinate_graph` off
B13.S1 (mixes four-quadrant items in at random, no option to restrict).

## Generator bugs found (recorded in step notes, NOT fixed — for the lead)
- `js/modules/gen-fractions.js:6904` `percent_of_number`: 33% is treated as 1/3 ("33% of 60 = 20"; true 19.8),
  3 of 21 combos wrong (Y6.B9.S7 note).
- `js/modules/gen-measurement.js:672-678` "Read the scale" in kg: when maxKg is 5 or 10 the increment is
  500/1000, so `numMarks < 1` and every kg item answers 0 (Y6.B5.S1 note).
- `js/modules/gen-fractions.js:6793` `percent_visual` "shade" type prints the grid already shaded and asks
  how many squares are shaded — answer given away (Y6.B9.S3).

## Agents (owner rule)
Taggers and round-1 fixer: mq-opus-low. Critics: mq-opus-medium (fresh agent each round). After two critic
FAILs (7.47, 7.50) with the same defect class (unverified "full" verdicts), the round-3 fixers were
**escalated to mq-opus-medium** (the ceiling). Recorded here rather than in design/STATUS.md because this
is a helper lane that does not own that file — the lead should copy the line across.

## The hardest calls
1. **Size vs method (B1.S6, B2.S1).** Live place-value and column +/− skills stop at 999,999/1,000,000;
   Y6 works to 10,000,000. Both are **partial**, closed by the reused `big_numbers` band option. One rule
   for both steps.
2. **Function machines (B7.S1 full, B7.S2 partial).** The rebuilt function-table skills deal 1-step rules,
   work backwards (`ftTask`) and draw the machine, but 2-step rules are always ×/÷ first; WRM also
   puts +/− first and shows that order matters. Existing `function_machine` re-scoped to that clause.
3. **Representation-only partials.** Short division (B2.S9: box grid, not bus stop), find the whole
   (B4.S7: no bar model), translations/reflections (B13.S4–S5: multiple choice, first quadrant; WRM draws
   and describes in four quadrants — one build each, `translate_grid` / `reflect_grid` widened to four
   quadrants). For ELL/SPED pupils the WRM representation is the scaffold, so these
   are partial, not full.
4. **Common factors / multiples (B2.S2–S3) full.** `gcf_*` / `lcm` with the "click every common
   factor/multiple" form list all of them; the existing `common_mf` Venn proposal adds a picture, not a
   missing clause, so it was not attached.
5. **Decimal conversions (B5.S2) and decimal +/− (B8.S4) partial.** Every metric skill deals whole amounts
   large→small; `add_decimal`/`sub_decimal` always give equal decimal places, so the alignment error WRM
   targets never arises.
6. **Shape block mostly gap.** Vertically opposite angles, angles in triangles/quadrilaterals/polygons
   have no skill; all closed by the one reused `angle_rules` proposal rather than six new ids.

## Owner questions (with suggested answers)
1. **Is "method at a smaller size" enough for full?** (e.g. column +/− to 1,000,000 for a 10,000,000 step.)
   *Suggested: no — keep partial and build the `big_numbers` band; it is one option, cheap to add.*
2. **Retire or keep `function_machine`?** *Suggested: keep, re-scoped to "+/− first" 2-step rules and the
   order-swap pair; everything else it promised is now live in the function-table options.*
3. **`STANDARD_PROPOSALS.mult_dec_dec` names Y6.B8.S7**, but that step is decimal × integer, fully taught by
   `decimals:mult_decimal`. *Suggested: drop Y6.B8.S7 from `mult_dec_dec` (it stays a Grade 5/6 CCSS build).*
4. **Translations/reflections:** extend the first-quadrant `translate_grid` / `reflect_grid` to four
   quadrants, or build them under `vis_migrate_coordinates`? *Suggested: widen `translate_grid` /
   `reflect_grid` with a quadrant option (that is what the file now builds); `vis_migrate_coordinates`
   stays a migration of the existing multiple-choice skills.*
5. **Weekly lists in enrichment weeks (W32–W33)** mix topics (the list on Negative numbers is 3-D shape
   lessons). *Suggested: the pacing sheet's W32/W33 prior-learning cells be split per topic; meanwhile
   the matching Y5 block was used.*
6. **Y5 tags may need the same check** (decimal conversions, unequal decimal places) — the Y5 tagger
   should apply the rule used here.
7. **Fix the three generator bugs above now** (they mislead pupils today), independent of any build.
   *Suggested: yes — small, local fixes in their owning lanes.*
8. **Existing proposals to tidy (lead-owned):** split `long_mult` (it bundles long multiplication with
   short/efficient division); re-home `frac_find_whole` from the No-Visuals `fraction_of_set_hard_nv` to
   `fraction_of_set_hard` or `tape_diagram`; give the 9,999,999 band on `number_word_names`/`compare` to one
   of `big_numbers` / `vis_pv_bands_millions`, not both. *Suggested: yes to all three.*
