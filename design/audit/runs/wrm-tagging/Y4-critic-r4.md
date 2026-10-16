# Critic: Wave 2 tagging of Y4 (Grade 3), round 4

This critic run is dated 2026-10-10. It checks `data/curriculum/links/Y4.json` at commit 81cba70e (round 4, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y4`). I did not edit the tagging data. I am independent of the tagger and of
the round-2 and round-3 critics.

## Verdict: FAIL (on one defect class; the mean passes)

| Steps graded | Mean | Round-3 deciding 4 | Changed in round 4 (38) | New random 25 | Steps under 8 |
|---|---|---|---|---|---|
| 52 | **8.06** | 8.00 | 8.05 | 8.12 | 0 |

Distribution: 9 ×3 · 8 ×49.

Round 4 fixes all four round-3 deciding steps, all the round-3 housekeeping, and both full-step sweep finds (B7.S1,
B7.S13). Every step I graded scores 8 or more. The rest of the file is clean on every earlier rule:
- No key is in both pre and related (R10).
- No step lists its own build in preBuild (S5).
- No step has fewer than 3 pre-skills (rule 15).
- No `closes` copies a `teaches` (rule 16).
- No envisioned skill is incomplete (rule 13).
- No option value is unreal or changes nothing (rule 17).
- Every key is live.

**Rule 18 is not met file-wide.** Rule 18 says a pre or related link must deal numbers and layouts that a pupil of
**this step** can do. `linkfit.mjs` checks every link against a single Y4-wide ceiling (20,000, or 2 decimal places). That
check cannot see a link that is too big for its own step, or that deals the wrong thing.

Generating the links step by step finds **25 links in 22 steps** that fail rule 18. They come from **6 root patterns**,
and they are spread over 8 of the 14 blocks. One of them contradicts a claim in the report:

> "Every `coordinate_q1` link and partial carries Max Number 10"

That is true of the partials only. Seven `coordinate_q1` pre and related links still deal points up to (19, 18).

This class has 25 instances. Round 3 called a class "isolated" at 2–8 instances, so this one is **systematic**. Under
the rule (mean ≥ 8 and no systematic defect) the result is a FAIL. The fix is mechanical: set opts on 25 links, listed
below. No verdict or proposal has to change.

## Method

- **Sample.** I graded 52 distinct steps:
  - the 4 round-3 deciding steps;
  - all 38 steps whose data changed between 9904ef79 and 81cba70e (a field-by-field diff of the two files);
  - a new random 25, from `random.Random(20261021).sample(step_ids, 25)` over the 129 ids in file order. The seed is
    none of 20261012, 20261014 or 20261017.
  - These overlap: 52 in all.
- **Context.** For each step I read the title, CCSS, notes and vocabulary in `wrm-steps.json`. From the Grade 3 sheet
  of the xlsx (openpyxl), I read the week row and that week's prior-learning list. I also built a step-to-school-week
  map (`weeks.json`), which shows when the school teaches each step.
- **Direct and partial skills.** I generated 8 items for every direct and partial entry, on the **print path**:
  `generateQuestionFor` with `itemIndex` and `itemCount`, the tagged opts and `maxNumber`, and seeds 31337 + 29i. That
  is 681 lines in `items.txt`. I did not use the tagger's items log.
- **Rule 18.**
  - I ran `linkfit.mjs` myself: 0 links past the Y4 ceiling.
  - I spot-checked **23 pre/related links** by generating 6 print-path items each (`links.mjs`), against the step that
    cites them.
  - I then ran a step-relative scan of every link (`relfit.mjs`, against each step's own dealt maximum) and an
    early-week scan (`early.mjs`, links past 1,000 on steps the school teaches in W01–W10).
  - From those, I classified the misfits by pattern (`r18list.py`), and checked that the fixing opts work
    (`fixprobe.mjs`).
- **Whole-file defect scripts.**
  - `defects.py`, re-pointed at round 4: R10, S5, rules 13, 14, 15 and 16, liveness, pre `why` labels, and verdict
    consistency.
  - A same-key/same-opts check of direct against pre and related.
  - The tagger's `optcheck.mjs` (340 opts entries, 0 problems), `optchange.mjs` (0 non-default values that change
    nothing) and `build.py --check` (OK, 129 steps).
  - `skill-options.js` read directly for the `round_decimals` and `count_by_step_up` schemas.
- **Scratch:** `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r4/`
  holds `ctx.py`, `ctx-Y4.txt`, `compact.txt`, `genall.mjs`, `items.txt`, `defects.py`, `links.mjs`, `relfit.mjs`,
  `early.mjs`, `r18list.py`, `fixprobe.mjs`, `weeks.json` and `changed.json`.

## The 4 round-3 deciding steps

| Step | R3 | R4 | Finding |
|---|---|---|---|
| B7.S4 Mixed numbers on a line | 7 | **8** | Now partial. Generated `mixed_nl_drag {}` is place-only, and items 6 and 7 ("1/3, 2/3"; "2/3, 1") hold no mixed number; the clause says exactly this. The new option `mixed_nl_read` (a read form, with a mixed number on every item) closes it. preBuild is `frac_count`. |
| B12.S3 Compare and order angles | 6 | **8** | `symmetry`, `compose_shapes` and the padded related are gone. preBuild is `turns` (Y3 Turns and angles, W28), and the note says why few live pre-skills exist. `identify_lines` deals perpendicular and parallel lines. `time_quarter` (reading quarter past and quarter to) is a weak stand-in for "quarter turn", and `name_2d_shapes` cites R.B4.S1 where Y3.B11.S7 also fits. Both are acceptable with the note. |
| B9.S4 Flexibly partition decimals | 7 | **8** | `f_to_d {denoms:[5]}` and `d_to_f {forms:[0]}` added; `equiv_frac_visual` dropped; preBuild `decimal_pv`. Small: the `f_to_d` label cites B8.S8, while the same opts are B8.S2's. |
| B1.S13 Roman numerals | 7 | **8** | Pre is now `expand {band:99}`, `combine {band:99}` and `add_three` (generated: 4 + 10 + 3, 10 + 2 + 5, with sums to 20). That is the additive reading of numerals. `time_hour` is dropped and the note explains why. |

## Rule 18, file-wide: 25 links in 6 patterns (systematic)

All of these pass `linkfit.mjs`, because they stay under 20,000. Each one was generated on the print path with its own
opts.

| # | Pattern | What generating shows | Links | Fix (checked with `fixprobe.mjs`) |
|---|---|---|---|---|
| A | `coordinate_q1 {}` or `{forms:[0]}` with no Max Number | Points (6, 15), (19, 12), (3, 18): a 20 × 20 grid. The steps' own partials are held to 10. The report says every `coordinate_q1` link carries Max Number 10. | 7: B12.S8 rel; B13.S3, B13.S4, B14.S2, B14.S3, B14.S4 and B14.S5 pre | `maxNumber: 10` (generated: every point within 10) |
| B | `count_by_step_up` cited as "Count in 3s", "2s, 5s and 10s" or "50s" | It counts by 3s **and 4s** from 6,339, 915, 5,284 and 3,260. It never deals multiples from 0 (rule 9) and never counts in 50s. On B4.S1 and B4.S2 (W01, multiples of 3 and 6) this comes months before the school teaches 4-digit numbers (W33–W35). | 6: B1.S3, B1.S4, B4.S1, B4.S2, B7.S2 and B11.S1 pre | Use `count_by_tables {constant:[3]}` for "count in 3s" (true multiples: 9, 12, 15 … 36). Elsewhere set `maxNumber` (100 for W01–W18) or choose the step group the label names. Relabel B1.S4 (it never counts in 50s). |
| C | `area_model_mult {}`, cited as "Y3.B4.S4 2-digit × 1-digit, no exchange" | 5 × 37, 6 × 156, 3 × 185: 3-digit numbers and exchanges | 5: B4.S9, B4.S10, B5.S8 and B5.S15 pre; B5.S2 rel | `{tiles: 21}`, which the file already uses on B5.S9 (generated: 7 × 26, 2 × 28) |
| D | `missing_mult_div {}` as "missing-factor form of the same facts" | 24 × 12, 384 ÷ ? = 24, ? × 23 = 552: not the step's table facts | 4: B4.S2, B4.S4, B4.S7 and B5.S7 rel | `maxNumber: 100` (generated: 8 ÷ ? = 2, 3 × ? = 33) |
| E | `halve {}` on B5.S11 (W06, 2-digit ÷ 1-digit) | Half of 9,222, half of 9,316 | 1: B5.S11 pre | `maxNumber: 100` (generated: half of 94, half of 12) |
| F | `round_decimals {precision:[0]}` | In the schema, `precision` 0 is **nearest tenth**, not nearest whole (generated: "Round 1.44 to the nearest tenth"). On B10.S4 it is labelled "Y4.B9.S7 Round to the nearest whole number", which the skill cannot deal (B9.S7 is partial for exactly that). | 2: B10.S4 pre; B8.S4 rel | Relabel it as a nearest-tenth building block, or drop it. On B8.S4 (tenths only) it deals 2-place decimals: drop it, or keep it with a "later step" reason. |

The tagger's ceiling check is right for its own purpose, but it is not rule 18. A step-relative check would have found
all six patterns. It needs to compare each link with the step's own dealt maximum, its school week, and what its `why`
label promises. My `relfit.mjs` and `early.mjs` are crude versions of that check.

## Whole-file defect counts

| Id | Defect | Count (whole file) | Systematic? |
|---|---|---|---|
| S1 | Noise pre-skills | 0 new. Round 3's 7 are all gone. B12.S3's `time_quarter` and `name_2d_shapes` are weak, and the note covers them. | No |
| S2 | Option missing or not real | 0 schema problems. `round_decimals {precision:[0]}` is a real value with the wrong meaning (counted under F) | No |
| S3 | Full claimed but not dealt | 0. Every full step in the sample deals the step through its direct skills (B1.S1, B1.S12, B1.S16, B4.S2, B4.S10, B5.S5, B5.S9, B6.S3, B6.S4, B12.S7) | No |
| S4 | Related empty or padded | 0 empty. 18 steps have 1 related skill, which is fine. Padding: the D pattern ("same facts") and B9.S6 `money_compare {}` ("ordering prices": it compares two coin sets and never orders prices) | No |
| S5 | Own build in preBuild | 0 | No |
| S6 | Pre `why` label false | 5. B10.S4 `round_decimals` (nearest whole); B1.S4 `count_by_step_up` ("Count in 50s"); B9.S4 `f_to_d` cites B8.S8 for B8.S2's opts; B5.S9 `mult_facts {}` cites the 12 times-table. Also B13.S4 cites B14.S2, which the school teaches in W38, after this step's W37: the label is honest about it ("teach it first") | No |
| S7 | Envisioned skill incomplete | 0 missing fields; 0 `closes` = `teaches`. B7.S5's second build `frac_beyond_1` still "closes" what `mixed_nl_drag` shows (carried over from round 3) | No |
| R7 | Range wider than the step | 0 on direct or partial skills (every partial clause names its range). The link ranges are under rule 18 | No |
| R8 | Response mode | 0 new | No |
| R9 | Multiples | Directs: `count_by_tables` deals true multiples (6, 12). **Links: pattern B** ("Count in 3s" dealt from 6,339) | Within B |
| R10 | Same key in pre and related | 0 | No |
| 14 | Earlier-step skill left only in related | I judged 128 candidates (`defects.py`); almost all are another form, the inverse, or the next step, and say so. Round 3's two (B6.S9 `composite_shapes`, B9.S4 decimals) are fixed | No |
| 15 | Fewer than 3 pre | 0 | No |
| 16 | `closes` = `teaches` | 0 | No |
| 17 | Option changes nothing | 0 (`optchange.mjs`, re-run) | No |
| **18** | **Pre or related link does not fit the step** | **25 links, 22 steps, 6 patterns (A–F above)** | **Yes** |

Also checked: 53 keys appear both as a direct/partial and as a pre/related **with different opts**, such as a band 999
pre beside a band 9999 direct. **None has the same opts**, so none is a duplicate.

Two stale notes remain:
- B1.S8: "with it the existing partial tag is full for the 100/1,000 part" contradicts its own 3-digit clause.
- B8.S5: "verify the generator gives 1-digit ÷ 10" — the step's clause already says it does not.

## Scores

The criteria are:
- (a) direct skills right, with real opts, judged on the print path;
- (b) an honest verdict;
- (c) no missed live skill or built option;
- (d) the envisioned proposal closes the step's clause;
- (e) pre-skills are earlier building blocks, ranked, at least 3, and fit the step (rule 18);
- (f) related skills share the idea, are not padded, and are not pre;
- (g) keys are live.

### New random 25 (seed 20261021): mean 8.12

| Step | Verdict | Score | Finding |
|---|---|---|---|
| B1.S1 Represent to 1,000 | full | 9 | Base-10 build, read counters and build counters, all to 999. Pre `value` and `identify` deal 3-digit numbers |
| B1.S3 Number line to 1,000 | partial | 8 | Honest (placing on 100-wide lines only). Pre `count_by_step_up {}` counts from 4-digit numbers (B) |
| B1.S7 Flexible partitioning to 10,000 | partial | 8 | `unit_form {rename:'more'}` deals "7,268 = ___ tens 8 ones" and "8 thousands 12 hundreds"; honest clause |
| B1.S8 1, 10, 100, 1,000 more/less | partial | 8 | Honest (to 120; 3-digit; 1,000 only). The note is stale |
| B1.S12 Order to 10,000 | full | 9 | Both directions, all 4-digit; ranked pre |
| B1.S16 Round to 1,000 | full | 9 | Three forms; 4,500 and 6,500 edge cases dealt |
| B3.S2 Count squares | partial | 8 | Whole squares only; `area_half_squares` |
| B3.S3 Make shapes | partial | 8 | Every item is the same 2 × 3 rectangle; honest |
| B4.S10 12 times-table | full | 8 | Every item is a 12 fact. Pre `area_model_mult {}` deals 6 × 156 (C) |
| B5.S5 Divide by 10 | full | 8 | 6,790 ÷ 10 and 70 ÷ 10, with the place-value shift picture |
| B5.S8 Informal written multiplication | partial | 8 | Honest. Pre `area_model_mult {}` (C) |
| B5.S9 2-digit × 1-digit | full | 8 | `tiles:21` keeps every item 2-digit × 1-digit, in both layouts |
| B6.S1 km and m | partial | 8 | Only "How many m in 7 km"; honest |
| B6.S3 Perimeter on a grid | full | 8 | Right |
| B7.S8 Improper → mixed | partial | 8 | Both directions dealt; `improper_mixed_dir` |
| B7.S12 Add fractions and mixed numbers | partial | 8 | Mixed + mixed only; honest clause |
| B7.S13 Subtract two fractions | partial | 8 | Keys simplify (10/12 − 2/12 = 2/3); `frac_answer_as_is`. Half the items are "less than 1/2" sorts, which the clause could also name |
| B7.S14 Subtract from whole amounts | gap | 8 | Right gap; two builds, each closing a part |
| B7.S15 Subtract from mixed numbers | partial | 8 | 3 2/5 − 2 3/5 breaks a whole; honest |
| B8.S5 1-digit ÷ 10 | partial | 8 | 697 ÷ 10 dealt; honest. The note is stale |
| B9.S6 Order decimals | partial | 8 | Two places every time; honest. Related `money_compare {}` is padding |
| B12.S7 Lines of symmetry | full | 8 | Count, find and draw lines of symmetry |
| B14.S1 Describe position | partial | 8 | `{forms:[0]}` at Max 10 on the print path deals plot items too (the `coord_forms_fix` bug, still real) |
| B14.S2 Plot coordinates | partial | 8 | As B14.S1. Pre `coordinate_q1 {forms:[0]}` has no Max 10 (A) |
| B14.S4 Translate on a grid | partial | 8 | Multiple choice only; honest. Pre `coordinate_q1 {}` (A) |

### Steps changed in round 4 (those not in the tables above)

All of these score 8. Each was checked against its round-3 state and its generated items.

| Step | What changed and the finding |
|---|---|
| B7.S1 | Now partial. Half the items are "write 6 as a fraction with denominator 1"; `whole_nn_only` |
| B2.S7 | The `sub_across_zeros` clause now says "3- or 2-digit" (generated 100 − 29) |
| B3.S4 | `compare_groups` noise replaced with `comparison_word` (differences within 20) |
| B4.S2 | Direct: every item is a 6 fact. Pre B and related D misfit |
| B4.S6 | `mult_chart {task:'pattern', constant:[3,6,9]}`; honest clause |
| B5.S15 | Pre C misfit; otherwise fine |
| B6.S2 | Pre `place_value_10x` now has a band and a power |
| B6.S4 | `perimeter {forms:[0,1]}`; `double {band:50}` |
| B6.S9 | `composite_shapes` moved to pre; the mis-cited `perimeter_intro` link dropped |
| B7.S5 | Related relabelled; the round-3 `frac_beyond_1` overlap remains |
| B8.S1 | WK_OVERRIDE gives W30 |
| B8.S2 | `d_to_f {forms:[0]}` added |
| B8.S3 | WK_OVERRIDE gives W30 |
| B8.S4 | Related `round_decimals` (F) |
| B8.S6 | Pre now cites B5.S5 |
| B8.S8 | `d_to_f {forms:[0]}` added |
| B8.S9 | Clean |
| B9.S3 | Clean |
| B10.S3 | `compare_decimal {decimals:2, forms:[0]}` pre |
| B10.S4 | Pre F, with a false label |
| B13.S3 | Label fixed. Pre `coordinate_q1 {}` (A) |
| B13.S4 | Label fixed. Pre `coordinate_q1 {}` (A) |
| B1.S4 | `count_by_powers_of_10` is now a partial, honest. Pre B, labelled "Count in 50s" |
| B14.S3 | Unchanged. Pre A |
| B1.S12 and B1.S16 | Related re-opted (`order_decimals {decimals:1}`, `estimate_sums_diffs {place:1000}`). Scored above |

## What a pass needs (round 5, mechanical)

1. **Set opts on the 25 links in patterns A–F.** No verdict, build or proposal changes.
   - A: `maxNumber: 10` on the 7 `coordinate_q1` links.
   - B: on B4.S1, B4.S2 and B11.S1, use `count_by_tables {constant:[3]}` for "count in 3s". On B1.S3, B1.S4 and B7.S2,
     set `maxNumber` to fit the step, or choose the group the label names, and relabel B1.S4.
   - C: `{tiles: 21}` on the 5 `area_model_mult` links.
   - D: `maxNumber: 100` on the 4 `missing_mult_div` links.
   - E: `maxNumber: 100` on B5.S11 `halve`.
   - F: relabel B10.S4's `round_decimals` as nearest tenth, or drop it; drop it on B8.S4.
2. **Make `linkfit.mjs` step-relative.** For each link, compare its dealt maximum with the step's own dealt maximum, and
   with the school week (no 4-digit numbers before W11 or W14). Then re-run it.
3. **Correct the report.** "Every `coordinate_q1` link carries Max Number 10" is true of partials only until step 1 is
   done.

Housekeeping (the score does not depend on it):
- B9.S4: the `f_to_d` label should cite B8.S2.
- B5.S9: `mult_facts {}` is labelled as the 12 times-table.
- Remove the stale notes on B1.S8 and B8.S5.
- B9.S6: drop the related `money_compare {}`, or give it a reason that fits coin sets.
- B12.S3: `name_2d_shapes` could cite Y3.B11.S7.
