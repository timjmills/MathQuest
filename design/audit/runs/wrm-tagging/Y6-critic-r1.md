# Y6 wave-2 tagging: independent critic report

Critic lane (Opus medium), 2026-10-10. Graded `data/curriculum/links/Y6.json` at commit `55aa51c2`
(branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y6`) against `BRIEF.md` ("For each step, decide", "Quality", "Output").

## Method

- **Sample (32 steps).** The 28 steps the lead drew at random with a fixed seed, plus 4 that the tagger named as its
  hardest calls (Y6.B2.S1, Y6.B2.S2, Y6.B7.S2, Y6.B4.S7). I graded every sampled step, and none was swapped out.
- **Keys.** I loaded `SKILLS` from `js/modules/data.js` in node (609 live keys). Every `direct`, `partial`, `pre` and
  `related` key in all 114 steps is live, and none is retired.
- **Claims checked against the code, not the tagger's wording.**
  - Option schemas in `js/modules/skill-options.js`: the pv bands stop at 999,999; `place_on_number_line` spans go
    up to 1,000; `round_decimals` rounds to tenth or hundredth only; `fraction_of_set_hard_nv` type2 is "Find the
    whole"; `gcf_*` forms[1] is "Click every common factor"; `composite_shapes` forms[1] is `dual_pa`; `volume` has
    variants standard / missing / word; the `function_table_hard` `ftTask` and `ftRules` enums; the
    `divisibility_sort` divisor sets.
  - Generators:
    - `pv_digit_drag` and `area_triangle`: right-angled triangles only, with a b×h÷2 prompt.
    - `pie_chart`: reads printed percentages only.
    - `geo_translate`: MC on a [-5,5] four-quadrant grid.
    - `remainder_interpret`: divisor ≤ 20, dividend ≤ 10 × divisor.
    - `add_mixed_unlike`: crosses the whole.
    - `divisibility_sort`: prints a rule card.
    - `tape_diagram`: additive only.
    - `round_decimals`: tenth or hundredth only.
    - `unit_rate_intro`.
  - Catalogue rows in `design/SKILL_CATALOGUE.md`.
- **Tags.** I loaded `SKILL_WRM` and `WRM_PROPOSALS` from `js/modules/wrm.js` in node. I diffed each step's
  direct/partial lists against the live tags and against `tagFixes`.
- **Proposals.** Every `build` and `preBuild` id resolves in the file's `proposals`. I searched
  `WRM_PROPOSALS`, `build-list.js` and `design/BUILD_LIST.md` for existing ids that each new proposal duplicates.
- **School prior learning.** I read `Awsaj-Domain-Sequence-K-5-2026-27.xlsx`, sheet "Grade 5", column 15 (week
  lists) and column 7 (lesson to week).
- **File format.** All 114 Y6 steps are present, in the order of `wrm-steps.json`, with titles matching. Every
  step has all 10 keys. Verdicts: 38 full, 57 partial, 19 gap. No `pre` or `related` list exceeds 8, no `related`
  or `pre` repeats a direct key, every partial entry has `missing`, every non-full step has `build`, and every
  proposal has the contract fields.
- **Output contract.** `design/audit/runs/wrm-tagging/Y6-report.md`, the required report (counts, hardest calls,
  owner questions), **does not exist**.

## Scores

Scale 0–10 on the brief's criteria: (a) direct skills, (b) honest verdict, (c) pre / related, (d) proposals.

| Step | Score | Weakest | Defects |
|---|---|---|---|
| Y6.B1.S2 Numbers to 10,000,000 | 8 | c | Pre `place_value_10x` (× / ÷ by 10/100/1,000) is a stretch for "1,000,000 as ten 100,000s". The partial tags are not in tagFixes. |
| Y6.B1.S4 Powers of 10 | 8 | c | `patterns:count_by_powers_of_10` was never considered (add it as related). `pv10_exponents` (index notation) goes beyond the WRM Y6 intent; keep it, but name `value_ten_times` as the closing build. |
| Y6.B1.S5 Number line to 10,000,000 | 7 | d | New `nl_millions` duplicates existing `nl_20` (`number_sense:number_line_scales`, which already reaches 0–1,000,000 lines, Y5.B1.S9, and V017 "to 10,000,000"). Reuse `nl_20` and extend it to 0–10,000,000. Partial tags are not in tagFixes. |
| Y6.B1.S6 Compare and order any integers | 8 | c | Sound partial. tagFixes miss `add integers:compare_int` (full) and `placevalue:order_greatest_to_least` (partial). |
| Y6.B2.S4 Rules of divisibility | 6 | d | The missing clause is factually wrong. `divisibility_sort` does print the rule for its divisor (rule card in gen-number-theory.js and print-generate.js), so "sorts by trying the division / never states a rule" is false. What is really missing: divisor 25 (and 100), and the pupil choosing or naming the rule ("which rule tells you?"). Re-scope `divisibility_rules`, because "a rule card beside each sort" already exists. |
| Y6.B2.S13 Solve problems with division | 7 | d | Verdict right. New `wp_multidigit` hangs on `multiplication:mult_word_problems` and is "(on division:div_word_problems)" too, so it is two skills in one option. For this step it should be an option on `division:remainder_interpret` / `division:div_word_problems`. tagFix for `div_word_problems` partial is missing. |
| Y6.B3.S1 Equivalent fractions and simplifying | 8 | c | The note "School W14 prior entry is a test week" is false: row 69 is W14's list (Y3 equivalent fractions as bar models / on a number line, Y4 equivalent fraction families). Ground the pre list on it. |
| Y6.B3.S2 Equivalent fractions on a number line | 8 | d | Fine. The reused `frac_nl_equiv` representation is vague ("a double number-line representation option"); give the B&W cell: two stacked 0–1 lines, same length, the shared point marked. Partial tags are not in tagFixes. |
| Y6.B3.S4 Compare and order (numerator) | 8 | c | Sound. `fractions:compare` partial is not in tagFixes. |
| Y6.B3.S7 Add mixed numbers | 8 | – | Verified that it crosses the whole and uses non-multiple denominators. Full is fair. |
| Y6.B4.S1 Multiply fractions by integers | 7 | c | `preBuild: ["mult_mixed_int"]` misuses preBuild: it is the step's own build, not a missing pre-skill. Remove it. The note says the two skills are "listed direct", but they are in `partial`; fix the note. Pre `fraction_of_set` is week-list noise, not a prerequisite. |
| Y6.B5.S4 Miles and kilometres | 8 | d | Gap and reuse of `miles_km` are right. Its representation "a conversion graph or double number line" should fix one B&W cell (double number line, 5 mi : 8 km ticks). |
| Y6.B6.S1 Add or multiply | 7 | c | Pre lists `fractions:improper_mixed` and `fraction_operations:mult_frac_whole` only because they share week W19. They are not prerequisites for additive-vs-multiplicative reasoning. Replace them with `algebra:function_table_easy` (+ and × rules) and `multiplication:mult_comparison`. |
| Y6.B6.S2 Use ratio language | 8 | – | New `ratio_language` is justified (no existing "for every" entry) and well specified for B&W. |
| Y6.B6.S9 Proportion problems | 8 | c | Sound. Pre `subtraction:sub_check_by_adding` is weak. tagFix for `ratio_tables` partial is missing. |
| Y6.B8.S3 Round decimals | 9 | – | Verified (`pick(["tenth","hundredth"])`). Precise missing clause, correct reuse. |
| Y6.B9.S8 Percentage of an amount – multi-step | 8 | c | Pre `composing:number_bonds` (within 10) is far below need. Use `subtraction:missing_add_sub` or complements to 100 (W36 list). |
| Y6.B10.S1 Shapes – same area | 8 | – | Sound. `area_perimeter` partial is not in tagFixes. |
| Y6.B10.S2 Area and perimeter | 6 | b | "Full" is generous. The step carries 3.MD.D.8 (same perimeter, different areas, and the reverse), and no live skill sets shapes of equal perimeter side by side. The note pushes the comparison to S1, whose title is "same area" only. Make it partial (missing: "shapes with the same perimeter but different areas") with build `same_area` (it already "teaches … and the reverse"). Add tagFix `area_perimeter:composite_shapes` add. |
| Y6.B10.S5 Area of any triangle | 7 | b/format | Partial is correct (verified right-angled only), but the live tag is FULL and there is no tagFix to downgrade it (same for Y6.B10.S4). |
| Y6.B10.S6 Area of a parallelogram | 8 | – | Gap and reuse are right. |
| Y6.B10.S8 Volume of a cuboid | 8 | – | Full is fair (standard / missing edge / story verified). |
| Y6.B11.S3 Read and interpret pie charts | 8 | – | Verified that `pie_chart` reads printed percents only. |
| Y6.B11.S5 Draw pie charts | 8 | c | Sound. Related has 2 entries and one repeats pre. |
| Y6.B12.S3 Vertically opposite angles | 7 | c | Pre and related are the same three or four skills, and both are copied verbatim into S4. `classify_triangles` is no prerequisite for vertically opposite angles. Related should be genuinely other skills (e.g. `angles_lines:identify_lines` for intersecting lines, `angles_lines:mixed_angles_lines`). |
| Y6.B12.S4 Angles in a triangle | 7 | c | Same copy-paste: related equals pre. |
| Y6.B12.S9 Circles | 7 | c | Pre is generic (`mult_facts`, `div_facts`). Use `patterns:double` / `patterns:halve` (d = 2r) and `measurement:reading_ruler` (measure the radius) as pre. The note "week W29 has no prior list" is false (row 138; it opens with "Rec/PK4 Identify and name circles and triangles"). |
| Y6.B13.S4 Translations | 6 | d/c | The reused `translate_grid` is a FIRST-QUADRANT Y4/Y5 skill ("translating … on a first-quadrant grid"), so as specified it does not close the Y6 four-quadrant clause the step's `missing` names. It missed `vis_migrate_coordinates` (geo_translate onto coord-grid with the image drawn and the move described) and `four_quadrants`. Pre misses the nearest skill `coordinates:coordinate_all` (Y6.B13.S2, full) and uses `coordinate_q1` instead. The W31 prior "Y4 Translate on a grid" is not used. |
| Y6.B2.S1 Add and subtract integers (hard call) | 7 | b | "Full" contradicts the tagger's own Y6.B1.S6 ruling, where the same 7-digit band made it partial. `add_1m_mixed` / `sub_1m_mixed` are "within 1,000,000", but Y6 numbers reach 10,000,000. Make it partial (missing: "operands and answers to 10,000,000") with build `big_numbers` (add the step to it), or rule consistently both ways and record the rule as an owner question. |
| Y6.B2.S2 Common factors (hard call) | 8 | format | Full is fair with forms [1]. The note "W09 is a test week" is false (row 42 is W09's list: Y4 factor pairs, Y5 factors / common factors). tagFix to lift `gcf_easy` from partial to full is missing. |
| Y6.B7.S2 2-step function machines (hard call) | 6 | a/b | (1) The direct opts omit `ftTask`. The default for `function_table_hard` is `rule-check` (find the rule), so the backward clause the note relies on is not in the opts; it needs `ftTask: "inputs"` or `"mixed"` (or two direct entries, outputs and inputs). (2) `ftRules` only has × / ÷ first. WRM 2-step machines also put + / − first and teach that the order matters, which is the misconception the existing `function_machine` proposal names ("reads a two-step machine in the wrong order"). (3) The existing `function_machine` proposal (wrm.js and BUILD_LIST, steps [Y6.B7.S2]) is neither reused nor explicitly retired in this step. Make it partial (missing: "machines with + / − first; order matters") with build `function_machine` (or a new `ftRules` option "+ then ×"). |
| Y6.B4.S7 Fraction of an amount – find the whole (hard call) | 7 | c | The partial-on-representation call is defensible. Pre is thin: `algebra:tape_diagram` is additive part-whole only, and `div_facts` is generic. Add `fractions:fraction_of_set_nv` / `fraction_of_set_hard_nv` type1 (Y5 fraction of an amount) and cite the W18 prior list ("Y2 Find the whole", "Y3 Reasoning with fractions of an amount"). |

**Mean: 239 / 32 = 7.47.** **Minimum: 6** (Y6.B2.S4, Y6.B10.S2, Y6.B13.S4, Y6.B7.S2). No step is below 6.

## File-level findings

1. **The output contract is breached.** `design/audit/runs/wrm-tagging/Y6-report.md` is missing (counts, the
   hardest calls, owner questions with suggested answers).
2. **tagFixes are incomplete and inconsistent.** Across all 114 steps, 36 differences between the step lists and
   the live `SKILL_WRM` are not recorded. The tagger records some partial adds (B6.S1, B9.S8) but not others, and
   some partial→full lifts (B7.S2) but not others. The ones that matter most:
   - Downgrades not recorded: `area_perimeter:area_triangle` Y6.B10.S4 and Y6.B10.S5 (full → partial).
   - Partial → full lifts not recorded: `pv_digit_drag` Y6.B1.S1, `gcf_easy` Y6.B2.S2, `lcm` Y6.B2.S3,
     `place_value_10x` Y6.B8.S5 and Y6.B8.S6, `mult_decimal` Y6.B8.S7, `div_decimal` Y6.B8.S8.
   - Adds not recorded: `compare_int` B1.S6; `order_greatest_to_least` B1.S6; `composite_shapes` B10.S2;
     `area_perimeter` B10.S1; `graph_fractions` and `order_frac_numline` B3.S2; `fractions:compare` B3.S4;
     `ratio_tables` B6.S9; `div_word_problems` B2.S13; `place_on_number_line` and `round_nl_hundred_thousands`
     B1.S5; `pv_digit_drag` and `expand` B1.S2; `number_word_names` and `pv_digit_drag` B1.S3; `integers:sub_int`
     B1.S8; `mult_word_problems` and `mult_comparison` B2.S8; `estimate_sums_diffs` and `estimate_quotient` B2.S16;
     `frac_word_mixed` B3.S9 and B4.S5; `estimate_length` B5.S1; `capacity` B5.S5; `order_decimals` B8.S2;
     `pie_chart` B11.S4; `classify_triangles` B12.S5.

   Either emit one tagFix per difference, or state in the report that the lead derives tags from the step lists.
3. **False school-calendar notes.** At least 3 notes misread the xlsx: W09 (row 42), W14 (row 69) and W29 (row 138)
   each have a full prior-learning list. The test week is a separate row. Steps relying on "no list" should be
   re-grounded.
4. **Format is otherwise clean.** Keys, order, titles, field set, limits and proposal fields all pass.

## Fixes required (step id → exact change)

- **Y6.B1.S5**: replace build `nl_millions` with the existing `nl_20` (`number_sense:number_line_scales`). Add
  Y6.B1.S5 to its steps and its ladder to 0–10,000,000. Delete proposal `nl_millions`. Add tagFixes for the two
  partial tags.
- **Y6.B1.S4**: add related `patterns:count_by_powers_of_10` ("count on and back in powers of 10 to 1,000,000").
- **Y6.B1.S6**: add tagFixes `integers:compare_int` add, and `placevalue:order_greatest_to_least` add (partial).
- **Y6.B2.S1**: verdict → partial; missing "operands and answers to 10,000,000 (live skills stop at 1,000,000)";
  build `big_numbers` (add Y6.B2.S1 to its steps). If you keep "full", state the rule (method beats size) and apply
  it to Y6.B1.S6 too.
- **Y6.B2.S2**: tagFix `number_theory:gcf_easy` partial → full. Fix the note: W09 has a prior list (row 42).
- **Y6.B2.S4**: partial `missing` → "no rule for 25 (or 100); the pupil never chooses or names the rule (the rule is
  printed as a card)". Re-scope `divisibility_rules` to "divisors 25 and 100, plus a 'which rule tells you?' task with
  the rule card faded".
- **Y6.B2.S13**: move `wp_multidigit` to `skill: "division:div_word_problems"` (option), with the multiplication half
  split out or attached to Y6.B2.S8 only. tagFix `division:div_word_problems` add (partial).
- **Y6.B3.S1**: fix the note. Ground pre on the W14 list (Y3 equivalent fractions as bar models / on a number line →
  `fractions:equiv_frac_visual`, `fractions:fraction_nl_drag`).
- **Y6.B3.S2**: make the `frac_nl_equiv` representation concrete: "two stacked 0–1 number lines of equal length,
  thirds above sixths, the shared point boxed; write the equivalent fraction". tagFixes for its two partials.
- **Y6.B3.S4**: tagFix `fractions:compare` add (partial).
- **Y6.B4.S1**: remove `mult_mixed_int` from preBuild. Correct the note ("listed partial"). Replace pre
  `fractions:fraction_of_set` with `fraction_operations:add_frac_like_nv` or `multiplication:repeated_add_to_mult`.
- **Y6.B4.S7**: add pre `fractions:fraction_of_set_hard_nv` {forms:[0]} and `fractions:fraction_of_set_nv` (Y5
  fraction of an amount, W18 list). Keep `tape_diagram` only with the why "bar model, additive form".
- **Y6.B5.S4**: `miles_km` representation → one B&W double number line (miles above, km below, 5 : 8 ticks), with a
  write-the-missing-value slot.
- **Y6.B6.S1**: drop pre `fractions:improper_mixed` and `fraction_operations:mult_frac_whole`. Add
  `algebra:function_table_easy` (rules + n and × n) and `multiplication:mult_comparison`.
- **Y6.B6.S9**: tagFix `conversions:ratio_tables` add (partial).
- **Y6.B9.S8**: replace pre `composing:number_bonds` with `subtraction:missing_add_sub` (find the part left after a
  discount).
- **Y6.B10.S1**: tagFix `area_perimeter:area_perimeter` add (partial).
- **Y6.B10.S2**: verdict → partial. Move `area_perimeter` to partial with missing "same perimeter, different areas
  (3.MD.D.8) is never compared". Build `same_area` (add Y6.B10.S2 to its steps). tagFix
  `area_perimeter:composite_shapes` add.
- **Y6.B10.S4 / Y6.B10.S5**: add tagFix `{ key: "area_perimeter:area_triangle", action: "partial" }` on each.
- **Y6.B12.S3 / Y6.B12.S4**: rewrite related so it does not mirror pre. For S3: `angles_lines:identify_lines`,
  `angles_lines:mixed_angles_lines`. Drop `classify_triangles` from S3's pre.
- **Y6.B12.S9**: pre → `patterns:double`, `patterns:halve`, `measurement:reading_ruler`,
  `shapes_early:name_2d_shapes` (W29 list). Fix the note.
- **Y6.B13.S4**: add build `vis_migrate_coordinates`, and either widen `translate_grid` to four quadrants (add
  Y6.B13.S4 and "four quadrants" to its teaches/representation) or add `four_quadrants`. Put pre
  `coordinates:coordinate_all` (Y6.B13.S2) first. Add preBuild `translate_grid` for the W31 prior "Y4 Translate on a
  grid".
- **Y6.B7.S2**: direct opts → `{ "ftRules": ["x+","x-","/+","/-"], "ftTask": "mixed" }` (or two entries:
  `ftTask: "outputs"` and `ftTask: "inputs"`). Verdict → partial, missing "two-step machines with + or − first, and
  that changing the order changes the output". Build `function_machine` (existing) or a new `ftRules` option "+ then ×
  / − then ×". If the owner rules the existing order is enough, retire `function_machine` explicitly in the report.
- **File**: write `design/audit/runs/wrm-tagging/Y6-report.md`. Emit the missing tagFixes listed under "File-level
  findings" item 2. Re-check every note that claims a week "has no prior list" or "is a test week".

OVERALL: 7.47/10 — FAIL
