# Y6 (US Grade 5) site lessons: independent critic, round 2

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y6.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y6` at 07fde265 ("lessons r2: lessons critic r1 F1-F6 and minors"), file
`data/curriculum/links/Y6.json`, section `lessons`: 24 lessons (0 full, 20 partial, 4 gap), 101 links (76 pre, 25 related), 25 direct or
partial entries, 24 proposals used by lessons (9 new). Previous round: `Y6-lessons-critic-r1.md`, FAIL 7.96 (lessons 21 and 24 at 7).

## Verdict: PASS

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **Yes.** Min **8**. Lessons 21 and 24 are now 8 (F1, F2 hold on fresh seeds) |
| Mean ≥ 8 | **Yes.** 193 / 24 = **8.04** (one 9: lesson 6) |
| Steps frozen | **Yes.** `steps` (114, same order), `tagFixes` (148), `year`, `generatedBy` equal to `origin/claude/sweet-newton-c8wrv1` (2bc3bffe). The 80 base proposals are present, in order; 76 byte-equal, 4 (`pv10_exponents`, `thousandths_pv`, `value_ten_times`, `volume_cubes`) differ only by `lessons` and one added `closes[<lesson>]`, no existing `closes` key changed. 20 lesson-only additions |
| 0 real merge conflicts | **Yes.** 0 real conflicts, 0 lesson tagFixes (my simulation, §6) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds byte-identical to the committed file (sha256 `4da8c4f9…d40f56b`) |
| Coverage complete | **Yes.** `lessons` = the 24 `wrmYear: "Y6"` entries of `site-lessons.json`, same order and titles; `ws-wrm-extract --check --site …/scratchpad/site/index.html` exit 0 |

The two 7s are fixed and the clauses are now true of the items on my fresh seeds. F3–F6 landed and catch every r1 mutation. My new
mutations find residual holes in F4 (spelled-out digit counts, exponents drawn with `<sup>`) and in F6 (a FULL is only held to its
title, not to its CCSS clauses). All of them are latent: no current clause or verdict uses them. They are listed as non-blocking rows
G1–G5 below, with three minor wording notes.

## Method

- **Fresh seeds** (none are in the report or in r1): my sampler `samp.mjs` read every lesson link through `generateQuestionFor`
  (print path, the link's opts, `itemIndex` / `itemCount`), 60 items at seed 71993 stride 61 and 40 items at seed 52021 stride 47.
  That is 100 items for each of the 126 entries. `lessonfit.mjs --n 60` also ran on three more fresh pairs: [[71993,61],[52021,47]],
  [[13579,43],[24680,59]] and [[11213,31],[98765,67]].
- **Rubric:** the brief's rubric. That covers the verdict, and every clause read against the title AND the CCSS descriptor; the opts
  (values, no missed option); every pre / related why (at least 30 items); pre taught earlier and no harder; Support lessons judged at
  their source grade; and the proposals and their `closes`.
- **Scripts:** in `…/scratchpad/y6lc2/`: `samp.mjs`, `show.py`, `chk.py`, `mymut2.py`, `merge_r2.mjs`, the build trees `archA`,
  `archB` and `arch_m4` … `arch_m7`, and their logs.

## 1. r1 fix rows: did they land, and do they hold?

| Row | Landed? | Holds on fresh seeds? |
|---|---|---|
| F1 lesson 21 | Yes. The clause now reads "3-digit…; now and then a 2-digit number (… about 1 item in 10), never a 1-digit number; no option gives a page of the small dividends". `missing` and `closes[div10_small_numbers]` say "a page of 1- and 2-digit numbers…". The hand-audit row is corrected | **Yes.** 2-digit dividends: 3 of 60 and 4 of 40 (41, 97, 15, 74, 64, 43 ÷ 100). 1-digit: 0 of 100. 4-digit: 0. Over r1 and r2 seeds that is 22 of 310, about 7% ("now and then" is exact; "about 1 in 10" is a little generous) |
| F2 lesson 24 | Yes. The related link is `compare_decimal {forms:[1]}`. The pre `frac_10_100` is replaced by `write_fraction {denoms:[5]}` cited to Y4.B8.S1 | **Yes.** Thousandths in 0 of 100 in every field (question, answer, options, picture). `write_fraction` deals only /10 and /5 (0 of 100 other denominators), so "tenths, fifths mixed in" is true. The cite is real: the Y4 lane tags `write_fraction {denoms:[5]}` partial to Y4.B8.S1 |
| F3 Support gate | Yes. `SRC_ABOVE` covers thousandths for source ≤ Y4 and any decimal for source ≤ Y3, on every shown word | **Yes.** All four Support lessons: 0 thousandths in 100 items a link (lesson 22, source Y3: 0 decimals) |
| F4 digit / symbol claims | Yes (`digitSymbolChecks` on every clause and why) | r1 mutations 3 and 4 caught. Residual holes: G1, G2 |
| F5 final-file spec gate | Yes (`lessonspec.py`, run by build.py on the written file) | My m4 and three new post-`finish()` mutations all exit 1 (§2) |
| F6 TITLEREP Y6 claims | Yes (`Y6_TITLE_CLAIMS`) | r1 mutations 7 and 12 are caught, and so are five new FULL / clause mutations. Residual hole: G4 |
| M1 lesson 15 | "mostly … with some clicks of a whole number divided by a unit fraction" | True. 13 of 60 and 13 of 40 are whole ÷ unit-fraction clicks |
| M2 lesson 17 | `paren_multi` why comes from the idea now | True |
| M3 lesson 18 | `percent_of_number` dropped. The `mean` why names the rounding | The rounding is true (69.17 → 69.2). Note n1 is on the new `mult_decimal` why |
| M4, M5, M7 | Kept, with reasons (a pre may not repeat a partial key; the length items are too rare for a partial) | Accepted |
| M6 | Deferred to the lead (build-list.js is frozen for this lane) | Accepted |
| M8 lesson 19 | "the multiplying of this step, as bare numbers (49.6 × 5)" | True |
| M9 | Recorded as a generator note | — |
| Sweep | Lesson 11 `simplify {forms:[2]}`: 0 negative distractors in 100. Lesson 9 `lcm` why has no "4 and 6". Lesson 19 `volume` pre dropped, 3 pre remain | True |

## 2. Gates: my mutations, old and new

- The builder's `lessonmut.py` in clean tree A: **24 mutations, 0 missed**.
- My r1 `mymut.py` against the r2 `lessonfit`: **12 of 12 exit 1**. Mutations 3, 4, 5, 7, 9 and 12 were missed in r1 and are now caught.

**Build-tree mutations (F5).** Each was inserted right after `finish()` and its spec dump, in a fresh `git archive` tree, and the full
build was run:

| # | Mutation | Result |
|---|---|---|
| m4 | Re-option of lesson 13's pre `mult_facts` to `{constant:[7]}` (the why still says 12) | **exit 1**: lessonspec, 1 difference; lessonfit, the why's times-table claim |
| m5 | A related `compare_decimal {}` appended to lesson 24 | **exit 1**: lessonspec. lessonfit also fires (Support thousandths) |
| m6 | Lesson 13's `mult_facts` why rewritten to "the 7 times-table" (opts unchanged) | **exit 1**: lessonfit (lessonspec rightly sees no option change) |
| m7 | `maxNumber: 1,000,000` set on lesson 21's partial | **exit 1**: lessonspec |

**New lessonfit mutations (`mymut2.py`), against F3, F4 and F6:**

| # | Mutation | Caught? |
|---|---|---|
| N2 | Lesson 22 (source Y3), related `compare_decimal {forms:[1]}` | Yes (SUPPORT decimals) |
| N3 | Lesson 21 (source Y4), related `compare_thousandths` | Yes (SUPPORT thousandths) |
| N4 | Lesson 22 (source Y3), related `decimal_nl_drag` (tenths) | Yes (SUPPORT decimals) |
| N5 | Lesson 17 `mixed` clause "never a 4-digit number" (items show 3,655.03 + 2,438.83) | **No** (G3: the whole part of a decimal is not counted) |
| N6 | Lesson 21 clause "never a **two**-digit number" (2-digit dividends are dealt) | **No** (G1: spelled-out digit counts are not read) |
| N7 | Lesson 6 `oop_hard` re-optioned to `{forms:[0,1]}` (shows exponents, as "10<sup>2</sup>"), clause "never an exponent" | **No** (G2) |
| N8 | Lesson 3 partial `exponents_simple`, clause "never an exponent" (23², 12³) | Yes, but only on 2 of 40 (the 10² items); squares of other bases are not seen (G2) |
| N9 | Lesson 6 pre `oop_medium` why "never parentheses inside parentheses" | Yes |
| N10 | Lesson 21 clause "3-digit dividends only" | Yes |
| N11 | Lesson 3 FULL on `place_value_10x` | Yes (exponents, explain the pattern) |
| N12 | Lesson 16 FULL on `classify_quads` + `classify_triangles` | Yes (hierarchy) |
| N13 | Lesson 11 FULL on `mult_frac_frac` | Yes (tiling) |
| N14 | Lesson 2 FULL on `number_word_names` | Yes (G; decimals; thousandths) |
| N15 | Lesson 6: the clauses and the lesson `missing` no longer name braces | Yes (TITLEREP CLAUSE) |
| N16 | Lesson 12 FULL on `div_unit_frac_nv {forms:[0,1]}` (no model, no story: 5.NF.B.7b/c) | **No** (G4) |
| N17 | Lesson 4 FULL on `div_decimal {forms:[1,2]}` (tenths divisors only, no model: 5.NBT.B.7) | **No** (G4) |
| N18 | Lesson 8 FULL on `pattern_relationship` | Yes (ordered pairs) |

A mutation N1 (`f_to_d {denoms:[8]}`) was dropped as uninformative: that option deals no eighths, so no thousandths appear (0 of 80).

**Seed robustness.** `lessonfit --n 60` gives 0 findings on two of my three fresh pairs. On [[13579,43],[24680,59]] it gives one
finding: lesson 12's related `frac_mult_word_plain` why says "some … (4 meters of ribbon …)", and only 10 of 60 items show metres
against a need of 12. The why is true: "some" holds at 16 of 60 and 12 of 40 on my samples. So this is the gate flapping at its
threshold, not a data defect (G5).

Verdict on the gates: these are real checks. All 36 earlier mutations (the builder's 24 and my 12) are caught, plus 4 of 4 build-tree
mutations and 11 of 16 new ones. The 5 misses (G1–G4) are latent: I scanned every clause and why in the file, and none uses a
spelled-out digit count, a false exponent claim or a 4-digit claim, and no lesson is FULL.

## 3. Lesson grades: all 24

| # | Lesson | Verdict | Score | Reasons (fresh seeds, 100 items a link) |
|---|---|---|---|---|
| 1 | Compare digit values (10 times / 1/10) | partial | 8 | `value {band:999999}`: "what is the underlined digit worth", 0 of 100 comparisons. The pre whys are true (chart, expanded form, thousandths W05). The related `unit_form` and × ÷ 10 links match their whys |
| 2 | Decimals to thousandths in word / expanded form | gap | 8 | No live skill writes decimal words or decimal expanded form. 4 pre, each true (whole-number word names and expanded form W01; thousandths W05; d_to_f Y5). `thousandths_pv` |
| 3 | × ÷ powers of 10 with exponents | partial | 8 | Exponent, "zeros" or pattern in 0 of 100; the clause is true. The pre are true. `pv10_exponents` |
| 4 | Divide by a decimal | partial | 8 | Tenths divisors only (hundredths divisors 0 of 100), numbers only. The clause covers 5.NBT.B.7. 3 pre, true. The note names `div_decimal {forms:[0]}` (M5) |
| 5 | Multiply decimals by decimals | partial | 8 | Decimal × decimal 0 of 100. The two builds are right. Note n2: the pre `area_model_mult_hard` why says "a 2-digit times a 2-digit number", but 35 of 100 items are 2-digit × 3-digit (86 × 357) |
| 6 | Parentheses, brackets and braces | partial | **9** | Braces 0 of 200 on both partials. The note squares the title ("and") with the CCSS ("or"). Three pre from the same week's step |
| 7 | Write and interpret numerical expressions | partial | 8 | `write_expression {forms:[0]}`: letter expressions, brackets 0 of 100. The clause is the whole of 5.OA.A.2 |
| 8 | Form ordered pairs | partial | 8 | Names the A → B rule; pairs and graphs 0. The pre are first quadrant (same week), function machine and the G4 lesson cite |
| 9 | Two sequences from two rules | partial | 8 | Both partial clauses are true. The `lcm` why (side by side, shared ones) is true without the old "4 and 6" |
| 10 | Multiplication as scaling | partial | 8 | Fraction × fraction 0 of 100, and n/n only as "6/6 × 8". `scaling_equiv`. 4 pre, true |
| 11 | Area, fractional sides | partial | 8 | Tiling 0. The pre `simplify {forms:[2]}` is GCF-first, with 0 negative distractors in 100 (better than r1). The related garden areas are "some" (1/4 yd × 4/5 yd) |
| 12 | Whole ÷ unit fraction | partial | 8 | `div_unit_frac_nv {forms:[0,1]}`: whole ÷ unit fraction, 100 of 100. `div_unit_fraction` mixes in 1/n ÷ whole (45 of 100), as its clause says. Stories 0 of 200 |
| 13 | Customary length | partial | 8 | Larger → smaller only. The pre are metric (same week), × 12 and metric stories. The related `unit_conversions` why ("both ways … weight and capacity mixed in") is true |
| 14 | Volume of composite solids | gap | 8 | Honest gap; 2-D pre (owner question 1). The related volume link is one week ahead |
| 15 | Fraction line plots | partial | 8 | Reading only ("total" = a count). The M1 why is now true (whole ÷ unit-fraction clicks 26 of 100). `make_line_plot` is verbatim from Y5 |
| 16 | 2-D hierarchy | partial | 8 | Categories ticked; hierarchy and inherited property 0. The pre are true |
| 17 | Consolidation of arithmetic | partial | 8 | `mixed {decimals:2}`: fraction, ÷ 2-digit, decimal × ÷ in 0 of 100. The `paren_multi` why now comes from the idea (M2) |
| 18 | Investigation projects | gap | 8 | The `percent_of_number` wrong keys are gone. The `mean` why is true (69.17 → 69.2). Note n1: the new pre `mult_decimal` why "(18.56 × 4): costing several of one item" sits on bare numbers. It reads as the use in a project, not as a context claim (cf. r1 M8). 4 pre |
| 19 | Problem solving across strands | partial | 8 | Both clauses are true (cross-strand content 0 of 200). 3 pre after the `volume` drop (fraction stories, metric stories, bare `mult_decimal` as its why says) |
| 20 | Reasoning tasks | partial | 8 | True/false sorting by calculation, an honest clause. `vis_reasoning_frames` |
| 21 | Divide a 2-digit number by 100 (Support, source Y4) | partial | **8** (r1 7) | **F1 holds.** The clause is true on 100 fresh items (2-digit now and then, 1-digit never). `missing` and `closes` ask for a page of the small dividends. The pre (÷ 10 facts, tenths on a line, d_to_f) and the related `f_to_d` are at Year 4, with 0 thousandths |
| 22 | Order fractions (Support, source Y3) | partial | 8 | Unlike sets dealt, and the clause says so. 0 decimals in any link (F3 source ≤ Y3). Related unlike ordering is said aloud as "the next step" |
| 23 | What is volume? (Support, source Y5) | gap | 8 | No unit-cube skill. The pre are at Year 5 |
| 24 | Write decimals (Support, source Y4) | partial | **8** (r1 7) | **F2 holds.** Thousandths in 0 of 100 in every link and field. `write_fraction {denoms:[5]}`: tenths with fifths, as its why says; cite real. `compare_decimal {forms:[1]}`: tenths and hundredths only |

**Sum 193 / 24 = 8.04; min 8; one 9.** No verdict is wrong. "No FULL" still holds, for the r1 reasons. Every proposal used by a lesson
lists that lesson, and each `closes[<lesson>]` equals that lesson's `missing` (lesson 5's two proposals each close a part).

## 4. Frozen steps

- `origin/claude/sweet-newton-c8wrv1` is still 2bc3bffe. On the lane's side, the only data file changed against the merge-base is
  `data/curriculum/links/Y6.json`.
- Origin has moved on since the lane branched. It now has Y2/Y3 links in the repo and a `frac_10_100_nv` forms fix in
  gen-fractions.js. No lesson links `frac_10_100*`, so lesson items are not affected by the merge.

## 5. Coverage and reproducibility

- **Coverage.** `site-lessons.json` has 24 `wrmYear: "Y6"` entries, and `lessons` has 24 keys, in the same order with the same titles.
  `ws-wrm-extract --check --site /tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/site/index.html`
  exits 0: "wrm-steps.json up to date", "site-lessons.json up to date".
- **Reproducibility.** Two unpacks of `git archive HEAD`:
  - Build A: `WRM_TAG_DATA` set.
  - Build B: `env -u WRM_TAG_DATA`, scratch `TMPDIR`, and `Y6.json` deleted before the build.

  Both exit 0 with identical logs:
  - steps 114 (24 / 70 / 20); lessons 24 (20 / 4); proposals 100 (26 new); tagFixes 148
  - mergecheck 3 × 0 problems; optcheck 0; linkfit 803 / 0
  - lessonfit 24 lessons, 101 links, 0 findings; lessonspec 126 links, 0 differences

  Both outputs have sha256 `4da8c4f90724314f88704ad79030bf0d7889b4d05a2c19080eda0d239d40f56b`, the same as the committed `Y6.json`.

## 6. Merge (`merge_r2.mjs`, the r1 script, re-run with a fresh self-test)

The lanes:

- R, Y1, Y4, Y5 and Y6 from the worktree.
- Y2 and Y3 from `/home/user/MathQuest/data/curriculum/links/`. These are byte-equal to origin's copies.

They are merged against live `js/modules/wrm.js` (328 keys; equal in the worktree, MathQuest and origin).

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| Result independent of lane order | Yes |
| key\|step written by 2+ lanes | 1: `patterns:count_by_step_up\|Y2.B1.S15` (Y2 and Y4, the same outcome, partial `{step:[0]}`). This is not a real conflict |
| **Real conflicts** | **0** |
| Own-step status, alone and merged | 0 mismatches in every lane. Y5 and Y6 have 0 opts gaps; the other lanes have their known opts-only format gaps |
| Foreign-step tagFixes | Y6 0 (Y4's known Y2.B1.S15) |
| **tagFixes naming a site lesson** | **0** in every lane |
| Lessons sections = site entries | Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 118, 0 with a differing skill or kind |

**Self-test** on a mutated Y6, with a conflicting `remove` on Y5's `placevalue:expand|Y5.B1.S2`, a tagFix naming
`G5|-|writedecimals`, and `make_line_plot`'s skill changed. The script reports all three:

- 1 real conflict, and the result becomes order-dependent
- 2 foreign tagFixes, 1 of them naming a lesson
- 1 differing proposal

So the zeros above are real.

## 7. Non-blocking rows (latent gate holes and wording; none changes a grade)

| # | Where | Note |
|---|---|---|
| G1 | `lessonfit` F4 | Digit counts spelled out ("never a two-digit number") are not read. Map one–nine to digits before the `\d-digit` scan (N6) |
| G2 | `lessonfit` F4, exponent | The detector sees only `^n`, `10¹²³` and `<sup` in `q.visual`. Exponents drawn with `<sup>` in `q.text` (`oop_hard {forms:[1]}`) and squares of other bases (23², 12³ in `exponents_simple`) are not seen. Read the raw `q.text`, and any digit followed by a superscript digit (N7, N8) |
| G3 | `lessonfit` F4, "never an N-digit number" | The whole part of a decimal (3,655.03) is not counted. Decide whether a decimal's whole part counts, and say so in the gate (N5) |
| G4 | TITLEREP FULL (F6 residual) | A FULL is held to its title claims only. Lesson 12 or 4 made FULL on its partial passes, although 5.NF.B.7b/c (model, story) and 5.NBT.B.7 (hundredths, models) are not dealt. Make any FULL lesson need a hand-audit row (title + CCSS clauses) that a gate reads (N16, N17). Latent: 0 FULL |
| G5 | `lessonfit` seed robustness | On [[13579,43],[24680,59]] at n 60, lesson 12's related `frac_mult_word_plain` "some … meters" fails the units-in-a-fifth threshold (10 of 60, needs 12), although "some" is true. Exempt hedged claims ("some") from the fifth rule, or lower it for them |
| n1 | Lesson 18, pre `mult_decimal` why | "costing several of one item" on bare items. Say "a decimal times a whole number (18.56 × 4), the step a project's costs use" |
| n2 | Lesson 5, pre `area_model_mult_hard` why | "a 2-digit times a 2-digit number": 35 of 100 items are 2-digit × 3-digit. Say "a 2-digit times a 2- or 3-digit number", as lesson 17 does |
| n3 | Lesson 21 clause | "about 1 item in 10": measured about 1 in 14 (22 of 310 over both rounds). "Now and then" alone would be exact |

## What is right

- **The fixes hold.** Both r1 7s are fixed in data, and the fixes hold on 100 fresh items a link. The minors are fixed or reasoned.
- **The gates catch what r1 found.** Every r1 hole (F3–F6) has a gate that catches my r1 mutations, and F5 catches post-`finish()`
  edits of any kind.
- **The lane is clean.** The steps, tagFixes and base proposals are frozen. The build is byte-reproducible from the branch alone.
  Coverage and extraction are current. The seven-lane merge has 0 real conflicts and no lesson tagFixes.
