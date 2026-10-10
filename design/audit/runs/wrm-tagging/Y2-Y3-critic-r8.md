# Critic round 8: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 4b92a05f, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-7 sevens | Round 7 mean |
|---|---|---|---|---|---|---|
| Y2 | 29 | **7.79** | 7.90 | 7.40 | 7.75 (4) | 7.88 |
| Y3 | 36 | **7.81** | 7.85 | 7.60 | 7.82 (11) | 7.74 |

Score distribution:
- **Y2:** 8 ×23 · 7 ×6
- **Y3:** 8 ×29 · 7 ×7

No step is below 7. Most round-7 fixes are in the output and work. The round still fails, for three reasons:
- Both means are below 8.
- There are three new systematic classes:
  - **N1:** the generic "no related skill" note is false.
  - **N2:** the r8 why rebuild wrote new false whys.
  - **N3:** the inverse table is missing from the ÷ steps (rule 14).
- One r7 fix (A3 on Y3.B3.S13) is still not in the output.

These cases are not counted twice:
- The Y2 random mean is equal to r7's (7.90).
- The Y2 overall mean falls because my hard 5 targeted the new classes, and 3 of them score 7.

## 1. The tagger's round-8 claims

| Claim | Check | Result |
|---|---|---|
| A1–A6 applied; both files rebuild byte-identical | `git archive HEAD` to scratch, ran `build.mjs Y2 --dropped` and `build.mjs Y3 --dropped` | **True.** Both exit 0 and both are identical to the committed files. No `COREDROP`. The DROPPED lines are marker drops of non-core keys only |
| `nextscan` 0 | Re-run | **True** (0) |
| `labwhy` 0 | Re-run | **True as measured, but the scan is blind.** It matches the exact catalogue label only. A label with its "(Visual)" suffix stripped still leads 12 whys (see N2c) |
| `vscan` 0 links | Re-run, fresh seeds | **True.** Only the 3 direct `reading_ruler` partials (Y2.B6.S1, Y3.B5.S2, Y3.B11.S4) appear, and each clause names the inch ruler |
| `prewk` 0, `optcheck` 0 | Re-run | **True** (cite-later 0 / 0, key-later 0 / 0; undeclared option keys 0) |
| whyscan A 0 | Re-run | **True** |
| whyscan B 100 = correct "next step" links | Read all 100 | **True:** 100 related, 0 pre, and each cites a same-year step taught later. My new `nextscan2` finds 2 related links that cite an earlier-year step as "a later step" (N2b) |
| whyscan C 84 = all false positives | My run gives 82. Sample of 20 drawn with `random.Random(80883)` (indices 4 5 11 12 14 17 18 27 36 38 45 48 55 64 67 69 72 73 80 81), then every line read | **False for 6 lines.** 19 of the 20 sampled lines are false positives: count rows read in the payload (`"values":[0,2,4…]`), `time_quarter` dealing :15/:45, analogy whys. Sample line 36 is real: `time_half_hour` "half past: the minute hand makes a half turn of the clock: **a quarter of a turn of the clock**". Reading all 82 lines finds the same why on 6 steps (N2a) |
| scan9: `share_into_groups` and ×8 facts already accepted | Re-run, fresh seeds | **True.** Links: `share_into_groups {band:12}` "12 counters, groups of 3" on 13 Grade 1 pre, and `mult_facts {2}/{3}/{4}/{5}/{5,10}` dealing N × 8 inside their own table (6/80). Every direct hit is a partial whose clause names it |
| `swap.py` 16 = correct under rule 19 | Checked against school weeks | **True.** All 16 are earlier in WRM order but taught later by week |
| 23 steps whose related were taught earlier now carry a note | `notecheck.mjs`: for each of the 23, every same-block step taught later and whether its skills are new to the step | **9 of the 23 notes are not true.** See N1 |

### Round-7 fixes re-verified

Each fix was re-checked with fresh seeds, 80 items per link, reading options, payload, visual, `screenInstr` and hint.

| r7 item | Result |
|---|---|
| A1 / S13 (WRM-order "next step") | Fixed: `nextscan` 0. Taught-earlier block steps are pre |
| A2 / S12 (reasons stripped) | Mostly fixed. The r6 analogy whys are back: `unit_form` exchanges, `expand` "dollars and cents as two parts", the 4s doubled, coin context, "100 is two 50s", the 100 g scale. The reason-keeping step brought new false whys (N2a) |
| A3 ("builds on" suffix) | **3 of 4 fixed.** Y3.B3.S13 `count_by_tables {8s}` still says "(earlier step this builds on: Y3.B3.S11 The 4 times-table)". The 8s count is owned by Y3.B3.S14 (W31) |
| A4 (Y2.B8.S13 note) | Fixed: related `[]`, note "quarter to comes in W36" |
| A5 (core drop is an error) | Fixed: Y3.B4.S2 leads with `mult_facts {2,3,4,5,10}` "the known fact (3 × 4 = 12)" |
| A6 (exclude by key + opts) | Works: Y3.B3.S14/S15 lead with `mult_facts {constant:[4]}`, "double each fact for the 8s". Side effect: 4 Y2 shape pres are now supersets of the step's own opts (N4a) |
| B, Y2 | All applied: B5.S12, B8.S13, B4.S4/S5/S8, B2.S2/S3/S16, B3.S1, B1.S7. Y2.B4.S8's new lead why is false (N2a). r7 proposed that why, so the error is mine: see the fix below |
| B, Y3 | All applied: B3.S14/S15/S9/S3, B4.S2, B5.S1/S3/S5/S10, B11.S4, B6.S2–S6, B11.S6, B1.S3/S10/S11, B2.S1, B3.S4, B1.S14, B7.S3. Y3.B11.S6 now ranks the right angle last (N3) |

### Structure (re-run)

| Check | Result |
|---|---|
| Pre ≥ 3 | Pass, Y2 and Y3 |
| No key in both pre and related | Pass |
| Every partial or gap step has a `build` | Pass |
| No own `build` in `preBuild` | Pass |
| Every empty related has a note | Pass |
| Rule 13 short spec | Pass. All 47 (Y2) and 60 (Y3) `build` and `preBuild` proposals have `name`, `kind`, `teaches` and `representation`, and `closes[step]` is set and differs from `teaches` |
| School weeks | xlsx re-dumped with openpyxl: Grade 1 197 rows, Grade 2 219 rows, byte-identical to r7's dump. Weeks reproduce, e.g. Y2.B5.S13/S15/S17 W26, B5.S9 W29, B4.S9 W12; Y3.B3.S6/S8/S9/S11 W11, B3.S7/S10/S12–S14 W31, B6.S7 W18, B11.S6 W29 |
| Range | `range.mjs` shows only its digit-joining artifact on `order_*` ("909596"). My new `steprange.mjs` compares each pre with the step's own dealt maximum, r7 against r8. 67 pairs were already in r7 under the accepted week ceiling. 6 are new, all S13 moves (N4c) |
| Response mode | As r7 allowed (`compare_groups` boxes, `equal_or_unequal_groups` "add/multiply" after W26, `enough_money` "Enough"). Nothing new |
| Verdicts | Every never-in-grade direct item is a partial whose clause names it. I found no generous full |

## 2. Method

**Seeds.** All are fresh: none appears in `markers.mjs` or in any earlier critic round. Earlier rounds used 12011, 15461, 27011, 27182, 31337, 33331, 40417, 50503, 52361, 60013, 60601/2/7, 64007, 70711, 70771/2, 71129, 80021, 80923, 91193 and 98317.
- Item seeds: `40127+233i` ×30, `26693+157i` ×30 and `83311+263i` ×20, i.e. 80 items per link on the print path through `generateQuestionFor`. `whyscan` uses the first 40 of these.
- The sample uses `random.Random(80881)` (Y2) and `random.Random(80882)` (Y3), drawn over all steps minus my hard 5 and minus r7's sevens.

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3-r8/`:
- the r7 scripts, re-seeded;
- `ctx8.mjs` (step context);
- new in r8:
  - `notecheck.mjs`: the 23 notes against later steps;
  - `nextscan2.mjs`: a "later step / Wn" why citing an earlier-year step, or a week that is not the cited step's;
  - `labwhy2.mjs`: near-label whys;
  - `dirlink.mjs`: the same key as a direct, with different opts;
  - `steprange.mjs`: pre above the step's own maximum, r7 against r8;
  - `weeks.mjs`.

## 3. New defects

### N1 (systematic): the generic "no later step" note is false on 9 of the 23 steps it was pasted onto

`overrides.mjs` puts one string, `LATER`, on 23 step ids: "no related skill: by school week the skills that share this idea are taught earlier (they are pre), and no later step on the same topic adds a new skill". It is not true of each step. I checked every later-taught step of the block against the step's links.

| Step (week) | Later step on the same idea | Is the link allowed? |
|---|---|---|
| Y2.B2.S4 Bonds to 100, tens (W5) | B2.S13 10 more, 10 less (W7) `more_less_10 {step:10}`; B2.S15 add 2-digit, no crossing (W6) `add_100_no_regroup` | Yes. No marker gates them |
| Y2.B5.S2, S3, S4, S5 (W28) | B5.S9 The 2 times-table (W29) `mult_facts {constant:[2]}` | Yes. × is met at W26 |
| Y3.B11.S2 Right angles (W28) | B11.S6 Parallel and perpendicular (W29) `identify_lines` | Yes. `parallelPerp` is W29, within the checker's TOL 2 |
| Y3.B3.S6 Multiply by 3 (W11) | B3.S7 Divide by 3 (W31), the inverse | No: ÷3 is first taught W31. **Empty related is right, but the reason is wrong** (rule 19, not "no later step") |
| Y3.B6.S4, B6.S6 (W27) | B6.S2/S5 compare fractions (W36); B6.S9/S10 equivalence (W37) | No (`fracCompare` W36, `equivFrac` W37). **The reason is wrong**, as above |

One more hand note is false. **Y3.B1.S13** Order numbers to 1,000 (W3) says "the number line to 1,000 … is earlier learning listed as pre". No number-line link is in its pre, and Y3.B1.S10 Number line to 1,000 is W13, later.

The other 14 noted steps are true: there are no later block steps, or the later steps are gaps or the same key and opts.

### N2 (systematic): the r8 why rebuild writes false whys

**a. The kept "reason after the colon" contradicts the link (7 links).**
- Six links are `time_half_hour {}` on Y2.B8.S5, B8.S6, B8.S10, B8.S12, B11.S3 and B11.S4. They read "half past: the minute hand makes a half turn of the clock: **a quarter of a turn of the clock**". The link was `time_quarter`. The marker swap made it `time_half_hour` and kept the quarter reason.
  - On Y2.B8.S12 it is the step's only related link.
  - On B8.S5 (Recognise a quarter) and B8.S6 (Find a quarter), half past does not carry the "quarter" idea at all.
- The seventh is Y2.B4.S8, the lead pre `money_change {currency:'usd', step:100, paid:'note', band:2000}`, "Y2.B4.S9 Find change (W12): **change from a dollar**". Those opts deal whole-dollar prices paid with $5, $10 and $20 bills: payload `a:500, b:200`, `a:2000, b:1100`, answers 1 to 10 dollars. Not one item is change from $1. I proposed that why in r7, and it was wrong.

**b. "A later step, W37" cites a Grade 1 step (2 links).** On Y3.B6.S2 and B6.S5, the related `equiv_frac_visual {denoms:[2]}` reads "Y2.B8.S12 Recognise the equivalence of a half and two quarters (a later step, W37 …)". A3 chose the earlier-year owner by closest opts, but kept the week and wording of Y3.B6.S9. On Y3.B6.S2 it is the only related link.

**c. Catalogue labels survive `labwhy` (12 whys).**
- `comparing:compare_groups` "More/Fewer/Same Groups — Y2.B1.S12 Compare objects" is a pre on Y2.B8.S1, S2, S3, S4, S7, S8, S12 and S13. It is a fraction block, and the why gives no reason (equal or not-equal groups).
- `composing:hundreds_chart_fill` "Hundreds Chart - Find the Missing Number — Y1.B12.S1" is a pre on Y2.B1.S1–S4.

**d. A3 is incomplete (1).** Y3.B3.S13 `count_by_tables {8s}` "builds on: Y3.B3.S11 The 4 times-table".

### N3 (rule 14): the main building block is missing or ranked last

| Step (week) | What is missing |
|---|---|
| **Y2.B5.S14** Divide by 10 (W31) | No ×10 fact (B5.S13, W26). The pre carries the 2 times-table instead |
| **Y2.B5.S16** Divide by 5 (W31) | No ×5 fact (B5.S15, W26); only `seq_5` |
| **Y3.B3.S7** Divide by 3 (W31) | No ×3 table (B3.S8, W11) and no counting in 3s. The 8 pre are ×10, doubling and halving, ×2 and arrays |
| **Y3.B3.S10** Divide by 4 (W31) | Counting in 4s leads, but there is no ×4 fact (B3.S11, W11) |
| **Y3.B3.S6** Multiply by 3 (W11) | No counting in 3s (Y2.B1.S16, Grade 1). The lead is doubling and halving |
| **Y3.B11.S6** Parallel and perpendicular (W29) | The right angle (`identify_angles`, B11.S2/S3), which perpendicular is built on, is ranked 8th of 8, behind naming 3-D shapes and counting their edges |

Y2.B5.S10 Divide by 2 and Y3.B3.S13 Divide by 8 do lead with their table. That is the pattern the other four should follow.

### N4 (minor, not a class on its own)

- **a. A6 superset self-links.** These `partition_shapes` pres contain the step's own parts, so up to half of their items are the step itself:
  - Y2.B8.S3 (`{parts:[0,2]}` ⊃ `[0]`);
  - Y2.B8.S5 (⊃ `[2]`);
  - Y2.B8.S7 (`[0,1,2]` ⊃ `[1]`), which also cites Y2.B8.S13 (three-quarters) for thirds;
  - Y2.B8.S13 (⊃ `[2]`).

  The related `div_facts {2,3,4,5,8,10}` on Y3.B3.S7/S10/S13 and `mult_facts {2,3,4,5,10}` on Y3.B3.S11 are mixed-facts supersets. They are acceptable as related.
- **b. Rule 3 padding: the siblings of r7's Y3.B3.S3 fix.** Y3.B3.S1 Equal groups and Y3.B3.S2 Use arrays (W10) still carry `cloze_addition`, `missing_add_sub`, `add_wp_100` and `sub_wp_100` as 4 of their 6–8 pre.
- **c. S13 moves bring pres above the step.**
  - Y2.B2.S2 Fact families within 20: `add_wp_100` and `add_sub_10s` (to 100).
  - Y2.B2.S12: `add_wp_100`.
  - Y3.B1.S3 Number line to 100: `compare {band:999}` and `more_less_100 {step:0}` (to 1,000).

  They are met by the week, but they are not building blocks.

## 4. The sample

### Y2 (Grade 1): mean 7.79

Random 20 from `random.Random(80881)`: B1.S12 B1.S13 B8.S3 B6.S3 B7.S1 B3.S11 B1.S2 B6.S4 B3.S2 B3.S8 B8.S11 B1.S11 B4.S6 B5.S5 B8.S1 B6.S2 B8.S7 B2.S21 B7.S5 B2.S7.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B5.S4 × symbol (W28) | full | **7** | N1: related empty, but the 2 times-table (W29) is the next step. The ×5 and ×10 facts (W26) are not in pre |
| B2.S2 Fact families (W9) | full | 8 | N4c: two to-100 pres (`add_wp_100`, `add_sub_10s`) are not building blocks |
| B8.S12 Half = two quarters (W17) | partial | **7** | N2a: its only related why is false ("a quarter of a turn" on half past). N2c label why |
| B4.S1 Count money, cents (W32) | full | 8 | Coin reasons restored |
| B2.S4 Bonds to 100, tens (W5) | partial | **7** | N1: related empty, but 10 more/less (W7) and 2-digit + tens (W6) are later |
| **Round-7 sevens** | | | |
| B5.S12 Odd and even | full | **8** | Number track in 2s, true why |
| B8.S13 Three-quarters | partial | **8** | Note true; related cleared |
| B4.S8 Make a dollar (W34) | partial | **7** | N2a: the lead pre's why "change from a dollar" is false for its opts |
| B1.S7 Flexibly partition | gap | **8** | `expand` leads |
| **Random 20** | | | |
| B1.S12 Compare objects | partial | 8 | |
| B1.S13 Compare numbers | full | 8 | |
| B8.S3 Recognise a half | full | 8 | N4a superset pre and N2c label why (minor) |
| B6.S3 Compare lengths | partial | 8 | |
| B7.S1 Compare mass | partial | 8 | Note true (scale W34) |
| B3.S11 Sort 3-D shapes | gap | 8 | |
| B1.S2 Count to 100 in 10s | partial | 8 | N2c label why (minor) |
| B6.S4 Order lengths | partial | 8 | |
| B3.S2 Count sides | full | 8 | |
| B3.S8 Count faces | full | 8 | |
| B8.S11 Non-unit fractions | partial | 8 | |
| B1.S11 Estimate on a number line | partial | 8 | |
| B4.S6 Compare money | full | 8 | |
| B5.S5 Multiplication sentences (W28) | full | **7** | N1: related empty with a false note; the 2 times-table (W29) is next |
| B8.S1 Parts and whole | gap | 8 | |
| B6.S2 Measure in metres | gap | 8 | |
| B8.S7 Recognise a third (W31) | full | **7** | 3 pre. The only shape link is a superset of the step itself (thirds) and cites three-quarters. The third pre has a label why. Halves and quarters (W17–18) are not linked on their own |
| B2.S21 Missing numbers | full | 8 | |
| B7.S5 Compare capacity | gap | 8 | |
| B2.S7 Add three 1-digit | full | 8 | |

### Y3 (Grade 2): mean 7.81

Random 20 from `random.Random(80882)`: B11.S3 B6.S10 B11.S8 B12.S4 B3.S2 B6.S3 B1.S13 B2.S19 B2.S17 B10.S12 B11.S1 B2.S1 B3.S7 B7.S11 B5.S7 B12.S6 B3.S4 B6.S8 B1.S1 B7.S7.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B3.S15 The 2, 4, 8 tables | partial | 8 | ×4 leads; doubling |
| B6.S4 Understand the whole (W27) | partial | 8 | Empty related is right (rule 19); the note gives the wrong reason (N1) |
| B11.S2 Right angles (W28) | partial | **7** | N1: `identify_lines` (W29) is the next step; the note is false |
| B4.S10 Scaling | partial | 8 | |
| B3.S6 Multiply by 3 (W11) | full | **7** | N3: no counting in 3s; N1 wrong reason |
| **Round-7 sevens** | | | |
| B3.S14 The 8 times-table | full | **8** | ×4 leads |
| B5.S10 What is perimeter | full | **8** | Sides, three addends, cm |
| B4.S2 Related calculations | partial | **8** | Known fact leads |
| B5.S1 Measure m and cm | partial | **8** | Number line and 10s |
| B5.S3 Measure cm and mm | gap | **8** | |
| B11.S6 Parallel and perpendicular | full | **7** | N3: right angle ranked 8th of 8 |
| B6.S2 Compare unit fractions | partial | **7** | Pre fixed. N2b: the only related why calls a Grade 1 step "a later step, W37" |
| B6.S5 Compare non-unit fractions | partial | **8** | Pre fixed (minor N2b) |
| B11.S4 Measure and draw | partial | **8** | Length ladder |
| B3.S3 Multiples of 2 | partial | **8** | 2s count and ×2 lead; padding gone |
| B1.S11 Estimate to 1,000 | partial | **8** | Note true |
| **Random 20** | | | |
| B11.S3 Compare angles | partial | 8 | |
| B6.S10 Equivalent fractions, bars | full | 8 | |
| B11.S8 Draw polygons | gap | 8 | Note true (no later block step) |
| B12.S4 Draw bar charts | full | 8 | |
| B3.S2 Use arrays (W10) | full | **7** | N4b: 4 of 6 pre are ± word problems and missing numbers. No 2s/5s/10s count or Grade 1 arrays rung |
| B6.S3 Non-unit numerators | full | 8 | |
| B1.S13 Order to 1,000 (W3) | full | **7** | The note is false: it says the number line is a pre; it is not, and it is W13. Related `place_on_number_line {span:100, band:1000}` is missing |
| B2.S19 Complements to 100 | gap | 8 | |
| B2.S17 Add 2- and 3-digit | partial | 8 | |
| B10.S12 Problems with time | full | 8 | |
| B11.S1 Turns and angles | gap | 8 | |
| B2.S1 Apply bonds within 10 | partial | 8 | |
| B3.S7 Divide by 3 (W31) | full | **7** | N3: no ×3 table, no 3s count |
| B7.S11 Add and subtract capacity | gap | 8 | |
| B5.S7 Compare lengths | gap | 8 | |
| B12.S6 Two-way tables | gap | 8 | |
| B3.S4 Multiples of 5, 10 | partial | 8 | |
| B6.S8 Count in fractions | gap | 8 | |
| B1.S1 Represent to 100 | full | 8 | |
| B7.S7 Capacity in mL | full | 8 | |

## 5. Fix list (skill, opts, step)

### A. Generator (`tests/scripts/wrm-tagging/build.mjs`, `overrides.mjs`)

1. **N1: drop the shared `LATER` string.**
   - For each related-empty step, compute the note: list the later-taught block steps and say why each is excluded, e.g. "÷3 is first taught W31 (rule 19)".
   - When no exclusion applies, link the later step as related instead.
   - Add `notecheck.mjs` (or its rule) to the build checks: a note must not say "no later step adds a new skill" while a later block step (week > step, no marker hit) has a direct key + opts absent from the step's links.
2. **N2a: never keep an old reason when the marker swap changes the key.** `markerFix` must rewrite the why from the new key's `whyText` only.
3. **N2b: one owner per citation.** When A3 picks an owner step, its week and its wording ("next step", "taught earlier", "Wn") must come from that same step. Add `nextscan2.mjs` to the checks (target 0).
4. **N2c: `labwhy` must compare against the label with the parenthesised suffix removed.** Add `whyText` for:
   - `comparing:compare_groups`: "equal or not equal: do the groups have the same number?"
   - `composing:hundreds_chart_fill`: "the counting order to 100 on a hundred square".
5. **A3 remainder:** the "builds on" suffix must not name a step that does not own the link's opts. When the owner is the same week, write "(the same week, W31: Y3.B3.S14)".
6. **N4a: exclude a pre whose opts are a superset of a direct's opts** (`parts`, `constant`, `denoms` arrays), not only an equal one.

### B. Step fixes

| Step | Fix |
|---|---|
| Y2.B5.S2, S3, S4, S5 | Related `multiplication:mult_facts {constant:[2]}`: "Y2.B5.S9 the 2 times-table (next step, W29): equal groups of 2 written with ×". On S4 and S5, also pre `multiplication:mult_facts {constant:[5,10]}`: "Y2.B5.S13/S15 the 10 and 5 times-tables (taught earlier, W26): the × sentences already met" |
| Y2.B2.S4 | Related `placevalue:more_less_10 {step:10}`: "Y2.B2.S13 10 more, 10 less (next step, W7)". Also `addition:add_100_no_regroup {}`: "Y2.B2.S15 adding tens to a 2-digit number (W6)" |
| Y3.B11.S2 | Related `angles_lines:identify_lines {}`: "Y3.B11.S6 perpendicular lines meet at a right angle (next step, W29)" |
| Y3.B3.S6, Y3.B6.S4, Y3.B6.S6 | Keep related empty. Note: "÷3 is first taught W31 (rule 19)" on B3.S6, and "comparing fractions is W36 and equivalence W37 (rule 19)" on B6.S4 and S6 |
| Y3.B1.S13 | Related `number_sense:place_on_number_line {span:100, band:1000}`: "Y3.B1.S10 number line to 1,000 (a later step, W13): the order seen on a line". Rewrite the note |
| Y2.B8.S5, S6, S10, S12; Y2.B11.S3, S4 | `time_half_hour` why: "half past: the minute hand makes a half turn". On B8.S5 and B8.S6 (quarter steps) drop the link and note "quarter past/to is W36 (rule 19)", or keep it only with the half-turn why. On B11.S3 and S4 (turns), "half past: a half turn of the minute hand" is the true reason |
| Y2.B4.S8 | Lead pre why: "Y2.B4.S9 Find change (W12): subtracting a price from the bill paid". Or swap the link to `measurement:money_change {currency:'usd', band:100, step:5}`, which deals change from $1 (100 − 35). Check first that its "0.65" decimal answer suits Grade 1 W34, given Y2.B4.S3 dollars-and-cents notation |
| Y3.B6.S2, S5 | Related `fractions:equiv_frac_visual {denoms:[2]}`: "Y3.B6.S9 Equivalent fractions on a number line (a later step, W37)" |
| Y2.B8.S1–S4, S7, S8, S12, S13 | `compare_groups` why: "equal or not equal: the same number in each group (K)" |
| Y2.B1.S1–S4 | `hundreds_chart_fill` why: "the counting order to 100 on a hundred square (Y1.B12.S1)" |
| Y3.B3.S13 | `count_by_tables {8s}` why: "counting in 8s from 0 (the same week, W31: Y3.B3.S14)" |
| Y2.B5.S14 | Lead pre `multiplication:mult_facts {constant:[10]}`: "Y2.B5.S13 the 10 times-table (W26): 30 ÷ 10 = 3 because 3 × 10 = 30". Drop `mult_facts {constant:[2]}` or move it last |
| Y2.B5.S16 | Lead pre `multiplication:mult_facts {constant:[5]}`: "Y2.B5.S15 the 5 times-table (W26): the facts dividing by 5 undoes" |
| Y3.B3.S7 | Lead pre `multiplication:mult_facts {constant:[3]}`: "Y3.B3.S8 the 3 times-table (W11)". Then `count_by_tables {rows:[{step:3, start:'zero', dir:'up'}]}`: "Y2.B1.S16 counting in 3s". Drop `mult_zeros` and `halve` |
| Y3.B3.S10 | Add pre `multiplication:mult_facts {constant:[4]}`: "Y3.B3.S11 the 4 times-table (W11)", ahead of doubling |
| Y3.B3.S6 | Lead pre `count_by_tables {rows:[{step:3, start:'zero', dir:'up'}]}`: "Y2.B1.S16 counting in 3s: the 3s facts in order" |
| Y3.B11.S6 | Rank `angles_lines:identify_angles {forms:[0]}` first: "Y3.B11.S2 right angles (W28): perpendicular lines meet at one". Then the 2-D shapes; 3-D last |
| Y3.B3.S1, S2 | Drop `addition:cloze_addition`, `subtraction:missing_add_sub` and `sub_wp_100`, as on B3.S3. Add `count_by_tables {rows:[{step:2,…},{step:5,…},{step:10,…}]}` ("Y2.B1.S15 counting in equal steps") and `multiplication:mult_facts {constant:[2,5,10]}` ("Y2.B5 the 2, 5 and 10 times-tables") |
| Y2.B8.S3, S5, S7, S13 | Pre `partition_shapes` with the step's own parts removed. S3 (W17): `{parts:[2]}` is W18, so use `halve {band:20}` and `share_into_groups` only, or keep `{parts:[0,2]}` with a note. S5: `{parts:[0]}` "Y2.B8.S3 a half (W17)". S7: `{parts:[0,2]}` "Y2.B8.S3/S5 halves and quarters (W17–18)". S13: `{parts:[0]}` |
| Y2.B2.S2, S12; Y3.B1.S3 | Drop the to-100 / to-1,000 pres that came in with the S13 moves (`add_wp_100`, `add_sub_10s` on B2.S2; `compare {band:999}`, `more_less_100 {step:0}` on Y3.B1.S3), or move them to related |

### Expected scores

| Fix | Lifts | Steps |
|---|---|---|
| A1 + the N1 rows | 5 sevens | Y2.B5.S4, B5.S5, B2.S4; Y3.B11.S2, B1.S13 |
| A2 / A3 + the N2 rows | 3 sevens | Y2.B8.S12, B4.S8; Y3.B6.S2 |
| The N3 rows | 3 sevens | Y3.B3.S7, B3.S6, B11.S6 |
| The N4 rows | 2 sevens | Y2.B8.S7; Y3.B3.S2 |

With A and B done, both samples reach 8.0 with no step below 8.
