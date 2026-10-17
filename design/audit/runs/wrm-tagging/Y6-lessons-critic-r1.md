# Y6 (US Grade 5) site lessons: independent critic, round 1

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y6.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y6` at 55f83a98. The file is `data/curriculum/links/Y6.json` and its new
top-level `lessons` section: 24 lessons (0 full, 20 partial, 4 gap), 102 links (77 pre, 25 related), 25 direct or partial
entries and 24 proposals (9 new). The gates are new: `lessons.py` spec gate, `lessonfit.mjs`, `claims.mjs`, `titlerep.mjs`,
`lessonmut.py`, and the `mergecheck.mjs` coverage rule. The Y6 steps passed critic r5 and are frozen.

## Verdict: FAIL (narrowly)

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Two lessons score 7: lesson 21, "Divide a 2-digit number by 100" (its partial's clause is false of its items), and lesson 24, "Write decimals" (thousandths in a Support lesson's links, above its source year) |
| Mean ≥ 8 | **No.** 191 / 24 = **7.96**; min **7** |
| Steps frozen | **Yes.** `steps` (114: 24 / 70 / 20, same order) and `tagFixes` (148) are identical to the base `origin/claude/sweet-newton-c8wrv1` (2bc3bffe). The 80 base proposals are all present and in order. Four of them changed, and only in `lessons` and `closes[<lesson id>]` (`pv10_exponents`, `thousandths_pv`, `value_ten_times`, `volume_cubes`); no existing `closes` entry changed. 20 proposals are lesson-only additions |
| 0 real merge conflicts | **Yes.** My own simulation (below): Y6 + R, Y1, Y4, Y5 (in repo) + Y2, Y3 (`/home/user/MathQuest`, the passed Y2-Y3 lane) against live `wrm.js`: 0 real conflicts, 0 lesson tagFixes, 118 shared proposal ids with 0 differing skill or kind |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds (A with `WRM_TAG_DATA`; B with it unset and only a scratch `TMPDIR`): exit 0, identical logs, sha256 `6b5242f9…a848008e` for both, equal to the committed `Y6.json` |
| Coverage complete | **Yes.** The `lessons` section is exactly the 24 `wrmYear: "Y6"` entries of `site-lessons.json`, in the same order, with the same titles. `ws-wrm-extract --check --site …/scratchpad/site/index.html` exits 0, and both files are up to date |

The lane is close. The two 7s each have a fix of one or two lines. In both cases the builder's own gate says this kind of error
cannot happen, and it does: the CLAUSE gate does not read digit-count claims, and the Support gate has no thousandths entry.
I also found three gate holes with mutations of my own. One is serious in kind: a silent re-option after `finish()` ships with
exit 0, which is class N again. No current data depends on that hole, because the committed lessons equal the spec snapshot
link for link. The fix table is at the end.

## Method

- **Items.** Print path (`generateQuestionFor`, seeded, `itemIndex`, `itemCount`), with the link's own opts and Max Number.
  All seeds are new to this lane:
  - 30 items a link: seed 48311, stride 29 (`lessonitems.mjs --seed 48311 --n 30 --show 30`).
  - 60 items a link (my own `partials.mjs`): seed 60607, stride 53.
  - Probes of 40 to 120 items: seeds 7777, 3131, 2468, 1111, 2222, 3333, 4242, 8181 and 9001.
  - Every one of the 127 entries (25 direct or partial, 77 pre, 25 related) was read on at least 30 items. Every clause and every
    "never …" was tested by regex on 60.
- **Schools weeks.** From `prior.json` of my clean build A. Every Y6-cited pre (54) is taught by the lesson's week, and the week
  in each why is the week in `prior.json`.
- **Criteria.** Brief rules 1–19, plus:
  - The verdict and every partial or gap clause are judged against the title AND the CCSS descriptor (`ccss-math.json`).
  - Options are values, and an existing option must not be missed.
  - Pre-skills: useful, at least 3, taught earlier by school week, no harder than the lesson.
  - Related skills: they share the idea, and their whys are true.
  - Support lessons are judged at their source grade.
  - Proposals: they close the clause, they are envisioned, and reuse is verbatim.
- **Scripts** are in the scratch folder `…/scratchpad/y6lc/`: `gen.mjs`, `opt.mjs`, `partials.mjs` + `chk.py`, `mymut.py`,
  `merge_r1.mjs`, the archive trees `archA`, `archB` and `archM`, and `logA` / `logB` / `logM`.

## 1. Lesson grades: all 24

| # | Lesson | Wk | Verdict | Score | Reasons |
|---|---|---|---|---|---|
| 1 | Compare digit values (10 times / 1/10) | W06 | partial | 8 | `value {band:999999}` asks "what is the underlined digit worth" on 60 of 60 items and never compares (0 of 60). The `form` option (value / unit / notation) does not compare either. Pre: chart and expanded form W01, thousandths W05. Related `unit_form rename:'more'` (4 thousands 16 hundreds = ___) and `× ÷ 10` (59.7 × 10, 664 ÷ 10) match their whys |
| 2 | Decimals to thousandths in words and expanded form | W06 | gap | 8 | No live skill writes a decimal in words or in expanded form (`number_word_names` and `expand` are whole numbers only). The clause covers 5.NBT.A.3a. 4 pre, each true. `thousandths_pv` plus its WRM_EXTENSIONS text (owner question 5) |
| 3 | × ÷ by powers of 10 with exponents | W07 | partial | 8 | `place_value_10x {decimals:true}`: no exponent, "zeros" or "pattern" in 0 of 60. The clause is true. Pre: `mult_zeros`, place within 1, count in 100s. `pv10_exponents` is the step proposal already |
| 4 | Divide by a decimal | W08 | partial | 8 | `div_decimal {forms:[1,2]}`: tenths divisors only (hundredths divisors 0 of 60), and no model (the visual repeats the equation). The clause covers 5.NBT.B.7 ("to hundredths", models). Pre: × 10 / 100 / 1,000 led by "turns the divisor into a whole number", × check, short division. Minor M5: no `div_decimal {forms:[0]}` pre (the same week) |
| 5 | Multiply decimals by decimals | W08 | partial | 8 | `mult_decimal` deals decimal × 1-digit whole only (decimal × decimal 0 of 60); `mult_decimal` has no factor option. The build pair is right in substance. Minor M6: `decimal_models`' own option text says "area model for decimal × whole", and only its new `closes` asks for decimal × decimal on a hundred square. `mult_dec_dec` is a Grade 6 (6.NS.B.3) entry whose ladder starts at 1 dp × 1 dp |
| 6 | Parentheses, brackets and braces | W11 | partial | **9** | Exact. Braces appear in 0 of 120 items on both partials (`nested_complex {band:50}`, `oop_hard {forms:[0], band:50}`). The note squares the title ("and braces") with the CCSS ("or braces"). Three pre from the same week's order-of-operations step: no brackets, one pair, nested. Related: compare expressions |
| 7 | Write and interpret numerical expressions | W11 | partial | 8 | `write_expression {forms:[0]}` writes letter expressions with one operation and no brackets (0 of 60). I generated `build_expr_*`, `write_equation`, `evaluate_expression_hard` and `distributive_expr`: none writes a numerical expression with brackets from words. The clause is the whole of 5.OA.A.2. `write_numeric_expression` reused |
| 8 | Form ordered pairs | W13 | partial | 8 | `pattern_relationship {forms:[0]}` names the A → B rule. `forms:[1]` (build pattern B by dragging) also never makes pairs. Pre: first quadrant (same week), function machine, and the G4 lesson "Follow a given rule" (a lesson-to-lesson cite, valid) |
| 9 | Two sequences from two rules | W13 | partial | 8 | Both partial clauses are true (pattern A always counts by 1). Pre: common multiples (lists of two sequences), rule tables, times as many. Related: plot points |
| 10 | Multiplication as scaling | W16 | partial | 8 | `mult_scaling_nv`: a whole number scaled (a fraction × a fraction 0 of 60). A strict, correct reading: 5.NF.B.5b's "a/b = (n × a)/(n × b) … multiplying by 1" is not dealt (n/n appears only as "8/8 × 10 = 10"). `scaling_equiv` is new. 4 pre, with `equivalent` "the n/n = 1 idea" |
| 11 | Area, fractional sides | W17 | partial | 8 | Tiling by unit-fraction squares is missing (5.NF.B.4b "by tiling it"). `map_frac_side_area` reused verbatim from MAP. Related `frac_mult_word {denoms:[2,5]}`: garden areas in 10 of 40 items, so "some" is true (the quarters are in family 2) |
| 12 | Whole ÷ unit fraction | W18 | partial | 8 | `div_unit_frac_nv {forms:[0,1]}`: whole ÷ unit fraction on 60 of 60 (the swapped-label note holds). `div_unit_fraction` mixes in 1/n ÷ whole (24 of 60), and its clause says so. Stories 0 of 60 on both. The ribbon stories sit in the related `frac_mult_word_plain` and the report says so (M7) |
| 13 | Customary length | W21 | partial | 8 | `length_customary`: all four forms go larger → smaller. The clause covers 5.MD.A.1 (both directions, mixed units, fractional amounts, multi-step). Pre: metric conversions (same week), × 12 table, metric stories. M4: related `unit_conversions {units:[1]}` deals smaller → larger customary length in 4 of 40 (the rest are lb, oz, qt) |
| 14 | Volume of composite solids | W24 | gap | 8 | `volume_composite` deals one prism or one cube (8 of 8); the volume visual is a plain box. The gap is honest. 2-D pre only, because volume comes later (W25): owner question 1 is right. `volume_composite_repair` matches build-list.js |
| 15 | Fraction line plots | W25 | partial | 8 | Reading only ("total measurements" is a count, not a fraction operation). `make_line_plot` is verbatim from Y5 apart from correction metadata. M1: pre `div_unit_frac_nv {forms:[2,3]}` "a unit fraction divided by a whole number": 8 of 40 items are click-all whole ÷ unit fraction (5 ÷ 1/4) |
| 16 | 2-D hierarchy | W29 | partial | 8 | `classify_quads` ticks categories. The hierarchy and the property passed to subcategories (5.G.B.3's example) appear in 0 of 60. `classify_triangles` gives sides or angles, never both. A defensible strict call against standards-audit's full. Pre: parallel and perpendicular, angle types, find the quadrilaterals |
| 17 | Consolidation of arithmetic | W38 | partial | 8 | `mixed {decimals:2}`: no fraction, no ÷ 2-digit, no decimal × or ÷ (0 of 60). 4 pre, each from a year step. M2: the related `paren_multi`'s only reason is "the site's CCSS for these lessons", a placeholder by the report's own owner question 3 (rule 10) |
| 18 | Investigation projects | W38 | gap | 8 | No live skill chains tasks. Pre: multi-step, conversion stories, mean, percent. M3 (generator): `percent_of_number {forms:[0]}` gives "33% of 90 = 30" in 7 of 40, so the answer key is wrong (the report lists it), and `mean` rounds 61.75 to "61.8" without saying so |
| 19 | Problem solving across strands | W38 | partial | 8 | Both clauses true: no fraction, unit, area, volume, mean or decimal in 0 of 120. Pre are story skills from four strands. M8: the `mult_decimal` why "in context in Y6.B8.S9" describes the step; the items are bare |
| 20 | Reasoning tasks | W38 | partial | 8 | `compare_expressions {forms:[1]}`: true/false sorting by calculation, an honest clause. `vis_reasoning_frames` (VISUAL_BUILDS) fits always / sometimes / never with a frame |
| 21 | Divide a 2-digit number by 100 (Support, source Y4) | — | partial | **7** | **The partial clause is false of its items.** It reads `place_value_10x {op:'/', power:[100], decimals:true}` "divides 3-digit numbers by 100; **never a 2-digit number** (34 ÷ 100 = 0.34)". The items do deal 2-digit dividends: 2 / 0 / 6 in 40 on seeds 1111 / 2222 / 3333, 6 of 60 on 60607, and 1 of 30 on 48311 (89 ÷ 100 = 0.89; 13, 16, 48, 81, 84, 93 ÷ 100). There are 0 one-digit dividends. The report's hand audit says the same false thing ("÷ 100 deals 3-digit dividends only"). The partial verdict stands, since 2-digit dividends are rare and no option selects them, but the clause, the lesson's `missing` and the closes text describe a capability as absent when it is only rare. Pre and related are fine at Year 4 |
| 22 | Order fractions (Support, source Y3) | — | partial | 8 | `order_fractions` gives unlike sets (its forms set only the order direction). Pre: denominators, numerators, number line (5/3 counts on past 1 as in the WRM Y3 step). Related unlike-fraction ordering is said aloud as "the next step", the same as the Y5 lane's passed G4 twin. `frac_compare_same_part` is verbatim from Y5 (compare-two; its `closes` asks for ordering) |
| 23 | What is volume? (Support, source Y5) | — | gap | 8 | No unit-cube skill. Pre at Year 5: unit squares, 3-D names, L ↔ mL. Related measuring cylinder |
| 24 | Write decimals (Support, source Y4) | — | partial | **7** | **Rule 18 on a Support lesson.** The report says Support links are judged "at week 0 (no Grade 5 content at all)". But related `compare_decimal {}` deals **thousandths** (46.985 vs 42.529; 8.442; 92.295) in 14 of 60 items, and 4 and 7 of 40 on two more seeds. That is Grade 5 / WRM Y5 content, above the source year Y4, and the why does not say so. An existing option avoids it: `{forms:[1]}` gives thousandths in 0 of 60 (click the decimals that match, hundredths). The pre `frac_10_100` also offers a thousandths distractor (70/1000) in 10 of 60. The partial (`f_to_d {denoms:[5]}`, no picture, fifths mixed in) and `dec_fraction_basics` are right |

**Sum 191 / 24 = 7.96; min 7** (lessons 21, 24); one 9 (lesson 6).

### Is "no FULL" right?

Yes. For each lesson I asked whether a live skill with real options deals every clause of the title and its CCSS:

- **6 (braces).** CCSS says "or", but the title names all three symbols, and braces appear in 0 of 120 items.
- **12.** Whole ÷ unit fraction is dealt exactly. 7b ("interpret … visual fraction model … story") and 7c (real-world problems)
  are listed on the lesson and are not on its partials.
- **10 and 16.** Strict against standards-audit, but true to the descriptor text.
- **13 and 21–24.** Each has a dealt property that misses the title or the source-year content.

None of the 20 partials is wrongly held partial. No gap has a live skill that should be a partial, except that lesson 13's
`unit_conversions` could be a partial (M4).

### Proposals

All 24 lessons with a build have it in `build`, in `envision`, in the proposal's `lessons`, and in `closes[<lesson>]`:

- **22 single-build lessons:** `closes` equals the lesson's `missing`, word for word.
- **Lesson 5:** two proposals, each closing a part of the clause.

Reuse checks:

- **The 5 lane copies,** checked against their source files:
  - `make_line_plot` (Y5): identical except that Y5's `corrected` / `correctionWhy` metadata is dropped. The representation is
    the corrected one.
  - `frac_compare_same_part` (Y5): identical apart from `reused` / `source` / `lessons` / `closes`.
  - `map_frac_side_area` (MAP): the same, plus `steps: []`.
  - `div10_small_numbers` and `dec_fraction_basics` (Y4): the same.
- **The 6 build-list ids** (`mult_dec_dec`, `decimal_models`, `write_numeric_expression`, `pattern_pairs_graph`,
  `volume_composite_repair`, `vis_reasoning_frames`) and `value_ten_times` / `pv10_exponents` all exist in
  `js/modules/build-list.js` with the same kind and skill. `thousandths_pv` and `volume_cubes` exist in `wrm.js` WRM_PROPOSALS.
- **The 9 new ids:** I searched build-list.js, build-specs.js and wrm.js for braces, n/n, hierarchy, unit-fraction division
  stories, customary both ways, cross-strand, investigation and consolidation. Nothing exists to reuse.
- None of the new options is already built: the option schemas of `nested_complex`, `oop_hard`, `write_expression`,
  `pattern_relationship`, `mult_scaling_nv`, `div_unit_fraction`, `length_customary`, `classify_quads` and `line_plot_fractions`
  were all read.

## 2. The new gates: real checks or rubber stamps?

The builder's `lessonmut.py` passes for me too: 15 mutations, 0 missed, rerun in clean tree A. `mergecheck` fires on a deleted
lesson ("site lesson not in the lessons section") and on a tagFix that names a lesson. Both exit 1.

Then I ran mutations of my own:

| # | My mutation | Caught? |
|---|---|---|
| 1 | Support lesson 22 (source Y3) gets related `round_thousandths` (thousandths) | **No.** The Support rule only uses the Grade 5 FIRST table, which has no thousandths row (they are taught W05, before any FIRST entry). Lesson 24's `compare_decimal` is the live instance |
| 2 | Support lesson 23 gets related `mult_frac_frac` | Yes (rule 19, FIRST W17) |
| 3 | `nested_complex` clause "never square brackets" (the items have [ ]) | **No** (CLAUSE reads operations only) |
| 4 | `place_value_10x` clause "never a 3-digit number" (3-digit dealt) | **No.** Digit-count claims are not read; lesson 21 is the live instance |
| 5 | `mult_facts {constant:[12]}` why "the 7 times-table" | **No** (a table claim is not gated) |
| 6 | Silent re-option `add_frac_unlike` denoms 2 → 3, why still halves / quarters / eighths | Yes (family claim and DENOMS) |
| 7 | Lesson 6 made FULL on `nested_complex` (braces never dealt) | **No.** TITLEREP FULL's vocabulary is the K–3 lanes' (bar model, ten frame, coins …); braces, exponents, hierarchy and the like are not title claims |
| 8 | A W08 lesson's pre cites the W16 scaling lesson | Yes (CITE rule 19) |
| 9 | A Support lesson's related at band 1,000,000 | Yes (SIZE) |
| 10 | Why "decimal division stories" on bare items | Yes, but only by accident ("2 m" read as metres); "story" is not gated (by design, as in Y5) |
| 11 | A related equal to the lesson's own partial | Yes (class F) |
| 12 | Lesson 13 made FULL on `unit_conversions {units:[1]}` (mostly weight and capacity) | **No** (TITLEREP FULL, as 7) |
| m4 | **Build tree** (`archM`): after `finish()` returns, a pass sets lesson 13's pre `mult_facts` to `{constant:[7]}`. The why still says "12 times-table" | **No: exit 0, "OK", shipped.** The spec gate compares inside `finish()` only. `spec-lessons.json` is written but never compared with the final file. This is class N (Y5 r7), which the Y5 lane closed with a final-file `specopts`. The committed file does equal the spec (my comparison: 127 links, 0 lists differ), so no current link is wrong |

Verdict on the gates: they are real checks, not rubber stamps. Each of the 15 classes fires on mutations I wrote as well as on
the builder's. But four holes remain (F3–F6). Two of them have live instances: lessons 21 and 24.

## 3. Frozen steps

- Diffing `Y6.json` against the base `origin/claude/sweet-newton-c8wrv1` (2bc3bffe; Y6.json last changed there in 3f2302d5):
  - `steps` are equal (114 entries, in the same order).
  - `tagFixes` are equal (148).
  - `year` and `generatedBy` are equal.
- **Proposals.**
  - The 80 base ids are all present, in the same order.
  - 76 are byte-equal.
  - 4 (`pv10_exponents`, `thousandths_pv`, `value_ten_times`, `volume_cubes`) differ only by a new `lessons` list and one added
    `closes[<lesson id>]`. No existing `closes` key changed.
- **Additions.** 20 new ids, each with `steps: []` and `lessons` set.
- The only data file changed against the base is `data/curriculum/links/Y6.json`.

## 4. Coverage and extraction

`ws-wrm-extract --check --site …/scratchpad/site/index.html` exits 0 ("wrm-steps.json up to date", "site-lessons.json up to
date"). The 24 `wrmYear: "Y6"` entries of `site-lessons.json` are the `lessons` keys, in the same order and with equal titles:

- 16 committee
- 4 "other" (Projects & Taskmaster)
- 4 enrich-native Support (sources G3, G2, G4, G3)

## 5. Reproducibility

Two unpacks of `git archive HEAD`:

- Build A: `WRM_TAG_DATA` set.
- Build B: `env -u WRM_TAG_DATA` with only a scratch `TMPDIR`.

Both exit 0 with identical logs:

- 114 steps (24 / 70 / 20); 24 lessons (20 / 4); 100 proposals (26 new, 74 reused); 148 tagFixes
- mergecheck: 3 runs, 0 problems
- optcheck 0; linkfit 803 links, 0 misfits; lessonfit 24 lessons, 102 links, 0 findings

Both outputs have sha256 `6b5242f9b773ffe3df6fc07ada50a0f6396a5d47971e2002c8135a21a848008e`, the same as the committed file.
The only inputs are the repo plus a temp directory; the lane files are pinned in the branch.

## 6. Merge (`merge_r1.mjs`, my own, with a self-test)

The lanes:

- Y6, plus R, Y1, Y4 and Y5 from `wt-y6/data/curriculum/links/`. These are byte-equal to `/home/user/MathQuest`'s copies.
- Y2 and Y3 from `/home/user/MathQuest/data/curriculum/links/` (the passed Y2-Y3 lane at 7ee69f33).

They are merged against live `js/modules/wrm.js` (328 keys; equal in both trees). Each tagFix becomes an outcome: full,
partial + opts, opts kept, or removed.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| Result independent of lane order (forward / reversed) | **Yes** |
| key\|step written by 2+ lanes | 1 (`patterns:count_by_step_up\|Y2.B1.S15`, Y2 and Y4, the same outcome: partial `{step:[0]}`) |
| **Real conflicts** (differing outcome) | **0** |
| Own-step status (direct = full, partial = partial, no stray live tag), alone and merged | 0 for every lane. Y5 and Y6 also have 0 opts gaps. R, Y1, Y2, Y3 and Y4 have opts-only gaps, by their own format: their tagFixes do not carry link opts, as already known from earlier rounds |
| Foreign-step tagFixes | Y6 0 (Y4's known Y2.B1.S15) |
| tagFixes naming a site lesson | 0 in every lane: **lessons emit no tagFixes** |
| Lessons sections = site `wrmYear` entries | Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 118, **0 with a differing skill or kind**. The Y6 lesson-only proposals shared with another lane are `decimal_models`, `frac_compare_same_part` and `make_line_plot`, all consistent |

Self-test on a mutated Y6 copy: I dropped one `remove`, added a conflicting remove on a Y5 step, added a tagFix naming a lesson,
and changed `make_line_plot`'s skill. The script reports all four: the stray live tag on Y6.B1.S8; the real conflict on
`placevalue:pv_digit_drag|Y5.B1.S3` (and the result becomes order-dependent); the foreign and lesson tagFix; and the differing
proposal skill. So the zeros above are real.

## 7. Fix table (the two 7s, and the gates that let them through)

| # | Where | Fix |
|---|---|---|
| F1 | Lesson 21, partial clause, lesson `missing`, `closes[div10_small_numbers]`, report hand audit | Say what is dealt: "divides 3-digit numbers by 100 (697 ÷ 100 = 6.97); a 2-digit number only now and then (89 ÷ 100 = 0.89, about 1 item in 10), a 1-digit number never, and no option deals a page of them". Make the missing clause "a page of 1- and 2-digit numbers divided by 100 …". Correct the hand-audit row "÷ 100 deals 3-digit dividends only" |
| F2 | Lesson 24, related `compare_decimal {}` | Use `compare_decimal {forms:[1]}` (hundredths with 2-digit wholes, 0 of 60 thousandths) or drop the link. Either name the pre `frac_10_100`'s 70/1000 distractor (10 of 60) in its why, or pick a pre without it |
| F3 | `lessonfit.mjs` Support rule | Judge a Support lesson's links against its source year for content taught before Grade 5's first FIRST row too: at least thousandths (3 dp, /1000) for source ≤ Y4. My mutation 1 must then be caught, and lesson 24 as committed must fail |
| F4 | `lessonfit.mjs` CLAUSE | Read digit-count and symbol claims in "never …" / "only …" clauses against the items ("never a 2-digit number", "3-digit only", "never square brackets"). My mutations 3 and 4 must be caught, and lesson 21 as committed must fail |
| F5 | `build.py` / `lessons.py` spec gate | Compare the FINAL written `Y6.json` lessons with `spec-lessons.json` (as Y5's `specopts.py` does), not only the list inside `finish()`. My mutation m4 (a silent re-option after `finish()`) must exit 1 |
| F6 | TITLEREP FULL (latent: no lesson is FULL today) | Add the Y6 lesson-title claims (braces, exponent / power notation, hierarchy, ordered pairs / graph, two rules, make a line plot, "both directions" for conversions, tiling), or make any FULL lesson carry a hand-audit row checked by a gate. My mutations 7 and 12 must be caught |

After F1 and F2, lessons 21 and 24 reach 8, the minimum becomes 8 and the mean 193 / 24 = 8.04.

## 8. Minors (non-blocking; none changes a grade)

| # | Where | Note |
|---|---|---|
| M1 | Lesson 15, pre `div_unit_frac_nv {forms:[2,3]}` | 8 of 40 items are click-all whole ÷ unit fraction (5 ÷ 1/4); the why says "a unit fraction divided by a whole number". Say "mostly" |
| M2 | Lesson 17, related `paren_multi` | The only reason given is the site's placeholder CCSS (rule 10). Give a reason from the idea (written calculation in order), or drop it |
| M3 | Lesson 18, pre `percent_of_number {forms:[0]}`, `mean` | A generator bug: 33% is treated as a third (7 of 40 answer keys wrong). `mean` rounds to a tenth without saying so (61.75 → 61.8). Already partly in the report's generator notes; spawn a generator fix |
| M4 | Lesson 13, related `unit_conversions {units:[1]}` | It deals smaller → larger customary length (4 of 40; mostly lb, oz, qt). It could be a partial with the clause "length mixed with weight and capacity; never mixed units or fractional amounts" |
| M5 | Lesson 4, pre | The main building block, `div_decimal {forms:[0]}` (decimal ÷ whole, Y6.B8.S8, the same week), is not a pre |
| M6 | Lesson 5, `decimal_models` | Its own option text says "area model for decimal × whole"; only the new `closes` asks for decimal × decimal on a hundred square. The lead's merge should widen the option text |
| M7 | Lesson 12 | The ribbon stories ("cut 4 m into 1/4 m pieces") that the lesson's `missing` lists are dealt by the related `frac_mult_word_plain` (about 1 in 4). The report says so; it could be a partial instead |
| M8 | Lesson 19, pre `mult_decimal` why | "multiplying decimals, in context in Y6.B8.S9": the items are bare numbers; say "the multiplying of Y6.B8.S9 (bare)" |
| M9 | Generator, seen in passing | `algebra:distributive_expr` "Factor out the GCF: 24x + 12 → 4(6x + 3)" (the GCF is 12). Not a Y6 lesson link |

## What is right

- The lesson shape matches the Y5 lane. All 24 site lessons are tagged with direct / partial opts, clauses, verdicts, builds with
  `closes`, at least 3 cited pre in school-week order, related links and notes. No lesson is wrongly held partial, and the
  four gaps have no live skill.
- 22 of 24 lessons are at 8 or better on fresh seeds. Every clause I could test by regex on 60 items is true, except lesson 21's
  digit claim. Every Y6-cited week matches `prior.json`.
- The steps, tagFixes and base proposals are frozen exactly. The build is byte-reproducible from the branch alone, extraction
  is current, coverage is exact, and the merge with all six passed lanes has 0 real conflicts and no lesson tagFixes.
- The gates are real: all 15 builder mutations and 6 of my 12 lessonfit mutations are caught. The holes are named above
  (F3–F6), each with the mutation that proves it.
