# Critic round 5: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit eea24cd9, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-4 re-checks | Round 4 mean |
|---|---|---|---|---|---|---|
| Y2 | 33 | **7.70** | 7.90 | 7.00 | 7.63 (8) | 7.64 |
| Y3 | 39 | **7.44** | 7.55 | 6.60 | 7.57 (14) | 7.53 |

Score distribution:
- **Y2:** 8 ×24 · 7 ×8 · 6 ×1
- **Y3:** 8 ×20 · 7 ×16 · 6 ×3

### What round 5 fixed

The rule-19 rework is real:
- Pre tiers now follow the school week.
- Every r4 S10 example is gone:
  - thirds before W31
  - `time_quarter`, `time_5min` and `elapsed_hour` before W36/W37
  - `compose_from_attributes` in the B3 pre lists
  - early ÷3/÷4
  - `mult_word_problems`, `multiply` / `area_model_mult` as links
  - decimal litres as links
  - `equiv_frac_visual` on B6.S1/S7
  - the kg-scale related link on Y2.B7.S1
  - tally and pictogram links on Y2.B10.S2

Every claimed script result reproduces at eea24cd9:

| Script | Result |
|---|---|
| `linkscan.mjs` (week mode) | OK |
| r4 `scan6.mjs` (TOL=2) | Y3 0; Y2 10 lines, all `repeated_add_to_mult` |
| `sys4.py` | 0 / 0 |
| `prewk.mjs` | cite-later 0 / 0, key-later 0 / 0 |
| `fit.mjs` | 0 |
| `optcheck.mjs` | 0 |
| `swap.py` | 0 / 0 |
| `relfit.mjs week` | Y3 0; Y2 only Y2.B1.S1 (allowed in r4) |

### Why it still fails

1. **Both means are below 8.**
2. **S10 is still systematic.** It is smaller than in round 4, but the tagger's marker check has four blind spots, and new seeds find links it misses:
   - It reads only the question text and answer, not multiple-choice option labels.
   - It cannot parse `Fact Family: 6, 7, 42`.
   - It samples only 18 items, so rarer ×6/×7/×9 items slip through.
   - It runs only on links, never on direct or partial skills.

   S10 across the whole files:
   - **Y2:** 6 links on 6 steps.
   - **Y3:** 16 links on 16 steps.
   - **Plus 3 Y3 `full` verdicts and 1 Y2 partial** whose own skill deals content the grade never meets, without naming it. This is the same defect as r4's Y3.B4.S8, which the tagger fixed only by hand.
3. **New systematic defect S11: the `why` text describes a different skill.** When a markerFix swaps a skill or narrows its opts, the old `why` is kept. The White Rose page shows this text to teachers, so it misleads them:
   - **Y2:** 7 links on 7 steps.
   - **Y3:** 12 links on 12 steps.
   - Example: `time_half_hour` with "quarter past / quarter to: a quarter of a turn of the clock".
   - Example: `nl_mult {constant:[2,5,10]}` with "the 3 times-table as jumps".

## 1. The S10 fix, verified

### First-taught weeks in `markers.mjs` against the xlsx

I dumped the "Grade 1", "Grade 2" and "Kindergarten" sheets with openpyxl myself. These are the `g1raw.txt`, `g2raw.txt` and `kraw.txt` files in the scratch folder. Every marker step's week matches the first xlsx row of that lesson:

| Grade | Marker | Week |
|---|---|---|
| Y2 | thirds | W31 |
| Y2 | quarter past/to | W36 |
| Y2 | 5-minute times | W37 |
| Y2 | ÷ (Divide by 2) | W30 |
| Y2 | × (10 times-table) | W26 |
| Y2 | grams | W34 |
| Y2 | tally | W24 |
| Y2 | pictogram | W25 |
| Y3 | ÷3/4/8 | W31 |
| Y3 | ×8 | W31 |
| Y3 | denominators > 4 | W26 |
| Y3 | equivalence | W37 |
| Y3 | right angle | W28 |
| Y3 | parallel/perpendicular | W29 |
| Y3 | to the minute | W20 |
| Y3 | a.m./p.m. | W21 |
| Y3 | L ↔ mL | W34 |
| Y3 | kg ↔ g | W35 |
| Y3 | money decimals | W19 |
| Y3 | 2-digit × 1-digit | W33 |
| Y3 | 2-digit ÷ 1-digit | W32 |
| Y3 | rounding | W08 |
| Y3 | perimeter | W16 |
| Y3 | mm | W14 |

**One small error.** `ml_l` is keyed to Y2.B7.S6 "Measure in millilitres" (W36), but litres come first, in "Measure in litres" (W35). It is harmless under TOL=2.

**Kindergarten checks.** K teaches these, so they need no Grade 1 marker:
- halves and quarters (K W36–W38)
- coins (W11, W35)
- o'clock and half past (W36)
- cm (W25)
- turns (W29)
- equal groups (W19–W33)

I also checked Grade 2 ×3/×4 before W11 and fraction compares before W36. No link deals either.

### The tagger's two claims

**Claim 1: the `sys3.py` "cites a later step" flags (Y2 7, Y3 10) are fine by school week. True.** Every one is taught earlier by xlsx week:

| Step | Pre skill | Cited step (week) |
|---|---|---|
| Y2.B2.S1 (W09) | `add_wp_100` | B2.S19 (W08) |
| Y2.B2.S3 (W10) | `sub_10_regroup` | B2.S12 (W09) |
| Y2.B3.S1 (W15) | `shape_pattern` | B3.S12 (W14) |
| Y2.B4.S4 (W33) | `equiv_coin_sets` | B4.S5 (W32) |
| Y2.B5.S1 (W27) | `mult_facts` / `mult_chart_easy` | B5.S17 (W26) |
| Y3.B1.S3 (W13) | `count_by_tables` | B1.S14 (W03) |
| Y3.B3.S1 (W10) | `count_by_tables` | B4.S1 (W09) |
| Y3.B3.S5 (W30) | `mult_properties` | B4.S3 (W12) |
| Y3.B3.S7 (W31) | `mult_zeros` | B4.S2 (W30) |
| Y3.B4.S4 (W33) | `div_remainders` | B4.S9 (W32) |
| Y3.B6.S1 (W26) | number-line skills | B6.S7 (W18) |
| Y3.B7.S1 (W34) | `heavier_lighter_visual` | B7.S5 (W18) |
| Y3.B11.S1 (W28) | shape naming | B11.S7 (W27) |

The week order is right. Two of these links are bad for other reasons:
- `mult_properties` on Y3.B3.S5 deals ×6 (S10).
- `div_remainders` on Y3.B4.S4 is not a building block of multiplication (rank).

**Claim 2: the 10 `repeated_add_to_mult {band:25}` lines are fine at Grade 1. True.**
- The item "4 + 4 + 4 + 4 = 4 × 4" is solved by repeated addition within 20.
- The × sign is met in W26, with the 10 times-table.
- WRM Y2 "Add equal groups" uses groups of any size.
- The steps are W26–W29.

### Y3.B4.S4 and B4.S5 name ×6/7/9

**True.** Both missing clauses name "×6, ×7, ×9 items beyond the Grade 2 tables (23 × 9, 7 × 63)". Y3.B4.S3 names ×6 and ×7, and Y3.B4.S7 names its constants.

### What my independent scans still find

**Scripts and seeds.** All scripts are in the scratch folder `…/scratchpad/wrm-critic-y2y3-r5/`:
- `scan7.mjs` and `scan7big.mjs` run every pre, related, direct and partial entry with new seeds: 91193+131i, 64007+59i and 12011+17i, for 80 items each.
- The marker list is `markers.mjs` plus critic extras: Y2 litres, metres, cm and money; Y3 ×3/×4 before W11, fraction compare, fractions on a number line, fraction add and Roman numerals.
- `scan8.mjs` also reads the option labels of choice items.
- `sys5.py` removes the false positives I checked by hand and counts the rest:
  - a 4/3 distractor in `partition_shapes`
  - the shape name "parallelogram" in `symmetry`
  - a "10 ÷ 6" distractor in `fraction_of_set_nv`
  - 5 × 12 and 4 × 12, which are table facts

| Kind | Links | Where | Example |
|---|---|---|---|
| Customary units in the options of `estimate_length {forms:[0,1]}` | Y2 6, Y3 6 | Y2.B1.S11, B6.S1–S5 related; Y3.B5.S1–S5 related, B11.S4 pre | Form 1 ("Click every reasonable estimate") offers only in and ft: 68 in and 52 ft options in 30 items, with no metric. Y2.B1.S11 (W03) also deals metres (W21) |
| ×6/×7 in `mult_properties {}` | Y3 3 | B3.S5 pre; B4.S1 and B4.S2 related | "8 × 6 = 6 × 6 + __ × 6", "If 6 × 7 = 42 …" |
| ×9 in `mult_zeros {}` | Y3 1 | B3.S7 pre | "90 × 9 = ?" |
| ×6/7/9/11 (and ÷ at W11) in `mult_div_fact_family {}` | Y3 6 | B3.S11, B3.S14, B3.S15, B4.S4, B4.S5 related; B4.S10 pre | "Fact Family: 6, 7, 42", "7, 7, 49", "9, 11, 99". On B3.S11 (W11), ÷4 comes in W31 |
| **Total S10** | **Y2 6 on 6 steps; Y3 16 on 16 steps** | | |

**Direct and partial skills that deal never-in-grade content without naming it:**

| Step | Verdict | What the skill deals | Fix |
|---|---|---|---|
| Y3.B4.S6 Link multiplication and division | full | `missing_mult_div {}` deals "84 ÷ 7 = 12", "7 × 11", "___ × 6 = 72". `mult_div_fact_family {}` deals 6,7,42 and 9,11,99 | Partial, plus a constant option. The tagger's own swap note on B4.S10 says "missing_mult_div deals content above this pupil" |
| Y3.B4.S10 Scaling | full | `mult_comparison {}` deals "6 times as many as 6" and "63 is 9 times as many" | Partial, plus a constant option |
| Y3.B4.S2 Related calculations | full | `mult_zeros {}` deals "90 × 9" (rare) | Name it in a note, or partial |
| Y2.B3.S7 Sort 2-D shapes | partial | `compose_from_attributes {}` deals "Click ALL the shapes that have 4 right angles" in 4 of 6 items at Grade 1 | The missing clause names only "sorting into labelled groups" |

Y3.B4.S3, S4, S5 and S7 and Y3.B7.S9 are partial and name their extra content, so they are fine.

**A marker false positive removed good links.** `mult2x1` treats "11 × 3" and "12 × 4" as 2-digit × 1-digit, but they are table facts. Because of this, the markerFix cut `nl_mult` to `{constant:[2,5,10], band:20}` on Y3.B3.S8, S9 and S11 (W11). Those related links no longer deal the step's own table, which r4 asked for, and their why still says "the 3 times-table as jumps". `nl_mult {constant:[3]}` is right at W11.

## 2. The round-4 step fixes, generated on the print path

I generated each step with `ctx.mjs`, seeds 52361+149i, 6 items per direct or partial skill.

### Y2

| Step | Round-5 state | Verified |
|---|---|---|
| B11.S2 Describe movement | gap; pre = position words, number-line steps, halves and quarters (K); related empty with a true note | Yes, 8 |
| B11.S3 / S4 turns | Thirds and `time_quarter` gone. Related `time_half_hour` (half turn = half past) is fine, but its why still reads "quarter past / quarter to … (Y2.B9.S2)" | Partly, 7 / 7 |
| B9.S6 Minutes in an hour | Later time skills gone; true note | Partly, 7. Pre (hour, half hour, clock parts) leaves out counting in 5s, which the xlsx W23 list names and which builds 60 minutes |
| B3.S5 / B3.S12 | `compose_from_attributes` gone from pre | Yes, 8 / 8 |
| B8.S9 Find the whole | Pre `partition_shapes {parts:[0,2]}`, halve, share | Yes, 8 |
| B8.S12 Half = two quarters | Thirds gone from pre | Partly, 7. The partial `equiv_frac_visual {denoms:[2]}` deals 1/2 = ?/6, 5/3 ≠ 1/2, 4/12, 4/16 at W17; the clause names only "12/16 and eighths". Related why is stale |
| B5.S17 5 and 10 times-tables | `div_facts` gone; pre = counting in 5s and 10s, arrays, groups | Yes, 8 |
| B7.S1 Compare mass | kg-scale link gone; true note | Yes, 8 |
| B6.S5 Four operations with lengths | Related `estimate_length {forms:[0,1]}` | No, 7: form 1 is in/ft |
| B10.S2 Tables | Tally and pictogram gone; K pre (count, sort, compare); related block diagrams | Yes, 8 |

**`estimate_length` forms.** Form 2 really is the in/ft/yd/mi sort: "Sort each object by the unit…", answers ft, mi, in, yd. But **form 1 ("Click ALL reasonable estimates") is also customary.** Its options are "4 in", "48 in", "6 ft", "50 ft". The text and answer key carry no unit, so the tagger's marker cannot see it. Only `{forms:[0]}` is metric: "About how long is a shoe? 25 cm".

### Y3

| Step | Round-5 state | Verified |
|---|---|---|
| B4.S1 Multiples of 10 | Directs right | No, 7: the only related link, `mult_properties {}`, deals ×6/×7 |
| B4.S3 Reasoning about multiplication | Partial; names ×6/×7; `props_tables`; pre arrays, repeated addition, 4s | Yes, 8 |
| B4.S7 Divide 2-digit ÷ 1-digit, no exchange | `{regroup:'none', constant:[2,3,4,5,8]}`, clause names it | Partly, 7. Pre has only ÷2 (`div_facts {constant:[2]}`); the Grade 2 ÷3/÷4/÷8 facts (W31) are missing |
| B4.S8 Flexible partitioning | `area_model_div_2by1 {constant:[2,3,4,5,8]}`: 76 ÷ 2, 68 ÷ 4, 55 ÷ 5 | Yes, 8 |
| B3.S8 / S11 3 and 4 times-tables | `div_facts` gone | Partly, 7 / 7. B3.S8: related `nl_mult` deals ×2/5/10 only, with a stale why. B3.S11: the same, plus `mult_div_fact_family {}` (×6/7/9, ÷4 at W11) |
| B3.S10 Divide by 4 | Counting-in-4s rows step 4 | Yes, 8 |
| B6.S7 Fractions on a number line | Pre = halves, thirds and quarters, number line, ruler; true note | Yes, 8 |
| B2.S20 Estimate answers | Lead pre is now the Y2 number-line estimate (W03) | Yes, 8 |
| B11.S7 2-D shapes | `identify_lines` / `identify_angles` gone | Yes, 8 |
| B5.S1 m and cm | Related `estimate_length {forms:[0,1]}` | No, 7: customary in form 1 |
| B7.S10 Compare capacity | Decimal-litre pre gone; pre = compare language, compare numbers, number line; related `money_compare` | Yes, 8 |
| B7.S9 L ↔ mL | Pre no longer cites S8; true note | Yes, 8 |
| B7.S4 Equivalent masses | Note added | No, 7: the note is false (see section 3) |
| B1.S13 Order to 1,000 | **Not changed.** Related is still `order_clocks_digital_asc`, with an empty note | No, 7. The report says this step has a note |

## 3. The notes that replace related skills

Of the 16 steps the reports list:
- **13 notes are true:**
  - Y2.B5.S1, B7.S1, B9.S1, B9.S6, B11.S2
  - Y3.B2.S21, B4.S9, B6.S7, B7.S8, B7.S9, B11.S4
- **Y2.B11.S3 / S4 have a related link** rather than a note. That is fine, but the report's list is wrong.
- **2 notes are false:**
  - **Y3.B6.S1** (W26) says "number lines of fractions come later (rule 19)". Fractions on a number line (B6.S7) is taught in W18, and its own pre lists `fraction_number_line` and `graph_fractions` as "taught before this step". A related skill does exist: the same-week numerators step B6.S3 (W26).
  - **Y3.B7.S4** (W35) says "l ↔ ml is taught later (W34)". W34 comes before W35. The rest of the note, that there is no whole-number skill yet, is true.
- **Y3.B1.S13** has no note. The r4 complaint (a related clock skill that does not share the idea) is still open.

## 4. New sample: seeds `random.Random(91193)` (Y2) and `random.Random(64007)` (Y3)

**Method:**
- Hard steps are excluded from the random draw. Each step's school week comes from the xlsx.
- I generated 6 items for every direct and partial skill, with its recorded opts.
- Every link was checked against `scan8` / `sys5`. I also hand-generated suspicious links (`ctx.mjs --key`, `opt1.mjs`).
- I graded on the r4 criteria (a)–(g). Rule 14 (rank) was applied only when the lead pre is not a building block at all.

### Y2 (Grade 1): mean 7.70

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20** | | | |
| B3.S12 Patterns with 2-D and 3-D (W14) | partial | 8 | Honest; `pattern_3d` |
| B4.S9 Find change (W12) | full | 8 | `money_change {usd, step 100, note}`: $5 − $1 and $20 − $15 |
| B7.S6 Measure in ml (W36) | full | 8 | Cylinder in mL; scale pre |
| B9.S7 Hours in a day (W23) | gap | 8 | Right |
| B5.S9 2 times-table (W29) | full | 8 | Right |
| B5.S2 Make equal groups (W28) | gap | 8 | Right |
| B1.S6 Numbers to 100 in words (W02) | full | 8 | Both directions, ≤ 100 |
| B7.S4 Four operations with mass (W35) | gap | 8 | Right |
| B8.S14 Find three-quarters (W38) | partial | 8 | Honest; thirds allowed by W38 |
| B8.S13 Recognise three-quarters (W17) | partial | 7 | `identify {denoms:[2]}` deals 1/8, 7/8 and 2/5 options at W17, but the clause says only "halves family". The related why is stale (quarter past) |
| B5.S8 Sharing (W29) | partial | 8 | Honest (grouping only) |
| B9.S5 Time to 5 minutes (W37) | full | 8 | Right |
| B1.S13 Compare numbers (W04) | full | 8 | Right |
| B2.S14 Add and subtract 10s (W07) | partial | 8 | Honest |
| B5.S16 Divide by 5 (W31) | full | 8 | Right |
| B7.S7 Measure in litres (W35) | partial | 8 | Honest |
| B7.S9 Temperature (W22) | full | 8 | °C form |
| B7.S8 Four operations with capacity (W36) | gap | 8 | Right |
| B10.S5 Interpret pictograms 1-1 (W25) | full | 8 | Right |
| B6.S2 Measure in metres (W21) | gap | 7 | The only related link is `estimate_length {forms:[0,1]}` (in/ft options); its why "choosing cm or m" is untrue for form 1 |
| **Hard 5** | | | |
| B3.S7 Sort 2-D shapes (W14) | partial | 6 | The partial deals right angles (never Grade 1) in most items and the clause does not say so. The tagger removed the same skill from every B3 pre for this reason |
| B6.S3 Compare lengths (W22) | partial | 7 | Honest partials; related `estimate_length` customary |
| B9.S6 Minutes in an hour (W23) | gap | 7 | No counting in 5s in pre (on the xlsx W23 list) |
| B8.S12 Half = two quarters (W17) | partial | 7 | Clause understates (sixths, twelfths, 5/3); stale why |
| B7.S1 Compare mass (W22) | partial | 8 | Fixed; note true |
| **Round-4 re-checks (8, not in the sample)** | | | B11.S3 7, B11.S4 7, B3.S5 8, B8.S9 8, B5.S17 8, B6.S5 7, B11.S2 8, B10.S2 8 (B3.S12, B9.S6, B8.S12 and B7.S1 are scored above) |

### Y3 (Grade 2): mean 7.44

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Random 20** | | | |
| B4.S4 2-digit × 1-digit, no exchange (W33) | partial | 6 | Partial honest. The lead pre is `div_remainders` (the "latest step before" tier), not a building block. Multiples of 10 / related calculations (`mult_zeros`) and partitioning are missing. Related `mult_div_fact_family {}` is S10 |
| B2.S21 Inverse operations (W08) | full | 7 | The lead pre is the same-week rounding estimate. Fact families and missing numbers (the real building blocks) come 3rd–4th. Note true |
| B10.S2 Time to 5 minutes (W20) | full | 8 | Right |
| B2.S19 Complements to 100 (W08) | gap | 7 | Related `money_change {step:5, paid:'note'}` deals $5.00 − $1.35 = $3.65 at W08, and the why says "change from $1" |
| B1.S8 Hundreds, tens, ones (W02) | full | 8 | Right |
| B2.S8 Subtract 1s across 10 (W05) | partial | 8 | Honest |
| B3.S15 2, 4, 8 tables (W32) | partial | 8 | Honest |
| B7.S3 kg and g (W35) | partial | 8 | Honest. The kg "0" key is the known owner bug |
| B3.S1 Equal groups (W10) | full | 8 | Right |
| B10.S10 Minutes and seconds (W22) | gap | 8 | Right |
| B7.S4 Equivalent masses (W35) | gap | 7 | False note (W34 "later"). Pre `length_metric {forms:[0]}` is cm → mm, but the why says "m and cm, exchange with 100" |
| B3.S13 Divide by 8 (W31) | full | 7 | Pre counting rows have step 4, but the why says "counting in 8s" |
| B1.S7 Flexible partitioning (W02) | gap | 8 | Right |
| B6.S4 Understand the whole (W27) | partial | 7 | 2 pre are vertex counting on 2-D shapes (geometry; rule 3) |
| B5.S6 cm ↔ mm (W14) | partial | 8 | Honest |
| B3.S12 Multiply by 8 (W31) | full | 7 | The lead pre is mixed `div_facts`, but its why describes "mult_facts {constant:[4]} doubled"; the ×4 table itself is not linked |
| B1.S6 Partition to 1,000 (W02) | full | 8 | Right |
| B5.S5 m ↔ cm (W14) | partial | 7 | Related `estimate_length` customary |
| B2.S9 Subtract 10s across 100 (W05) | gap | 8 | Right |
| B8.S3 Partition the whole (W38) | gap | 8 | Right |
| **Hard 5** | | | |
| B4.S6 Link × and ÷ (W33) | full | 6 | Both directs deal ×6/7/9/11/12 (84 ÷ 7, 6,7,42, 9,11,99). It should be partial |
| B4.S10 Scaling (W33) | full | 6 | `mult_comparison {}` deals 6 × 6 and 63 = 9 × 7. It should be partial |
| B3.S5 Sharing and grouping (W30) | full | 7 | Directs right; the lead pre `mult_properties {}` deals ×6 |
| B5.S3 cm and mm (W14) | gap | 7 | Related `estimate_length` customary, with a why that says "mm or cm" |
| B4.S2 Related calculations (W30) | full | 7 | Direct mostly in-table (rare 90 × 9); related `mult_properties {}` deals ×6/×7 |
| **Round-4 re-checks (14, not in the sample)** | | | B4.S1 7, B4.S3 8, B4.S7 7, B4.S8 8, B3.S8 7, B3.S10 8, B3.S11 7, B6.S7 8, B2.S20 8, B11.S7 8, B5.S1 7, B7.S10 8, B7.S9 8, B1.S13 7 |

## Whole-file defect counts

| Defect | Y2 | Y3 | Status |
|---|---|---|---|
| r3/r4 checks: `linkscan`, `fit`, `optcheck`, `swap`, `relfit` week, `prewk`, `sys4` | 0 (B1.S1 allowed) | 0 | Pass |
| **S10, link content not met by the step's week, or never in the grade** (`scan8` + `sys5`, new seeds, option labels read, fact families by hand) | **6 links / 6 steps** (all `estimate_length` form 1, in/ft) | **16 links / 16 steps**: 6 `estimate_length`, 3 `mult_properties {}`, 1 `mult_zeros {}`, 6 `mult_div_fact_family {}` | **Fail, systematic** |
| **S10-direct, a `full` verdict (or unnamed partial) whose own skill deals never-in-grade content** | 1 (B3.S7) | 3 (B4.S6, B4.S10, B4.S2) | **Fail**: the r4 B4.S8 class |
| **S11, the `why` describes another skill or other opts** (`whyfit.mjs`, not counting `estimate_length`, which is in S10) | **7 links / 7 steps** (`time_half_hour` with the quarter-past why) | **12 links / 12 steps**: `nl_mult` ×3; `div_facts` B3.S6 and B3.S12; counting rows B3.S4 (step 50 for "5s and 10s") and B3.S13 (4 for 8); `mult_zeros` "2-digit × 1-digit" B4.S6; `repeated_add_to_mult` "stories" B4.S10 and B4.S11; `length_metric {forms:[0]}` "m and cm" B7.S3 and B7.S4 | **NEW, systematic** |
| False note | 0 | 2 (B6.S1, B7.S4) | Fix |
| `[rule NN: …]` bookkeeping inside the teacher-facing `why` | 43 links | 15 links | Minor: strip it on output |
| Report claims that do not match the data | B11.S3/S4 listed as notes | B1.S13 listed as a note | Fix the report |

## What a pass needs

### 1. Close the marker blind spots, then re-run the whole files

In `markers.mjs`:
- Read the multiple-choice option labels (`q.options[].label`). Then exclude distractor-only hits: a 4/3 distractor, the shape name "parallelogram", a "10 ÷ 6" distractor.
- Parse `Fact Family: a, b, c`.
- Raise the sample to 60 or more items per link.
- Fix `mult2x1` so table facts up to 12 (11 × 3, 12 × 4) are not 2-digit × 1-digit.
- Key `ml_l` to "Measure in litres" (W35).
- **Run the never-in-grade markers on direct and partial skills too.** A hit makes the verdict partial and the hit is named in `missing`.

The target: my `scan8.mjs` + `sys5.py` at 0 / 0, with `linkscan` still OK.

### 2. Link fixes

- **`estimate_length`:** `{forms:[0]}` everywhere. Drop it on Y2.B1.S11 (W03: metres come in W21) and on Y3.B11.S4 pre.
- **`mult_properties {}`** (Y3.B3.S5 pre; B4.S1 and B4.S2 related): drop it. There is no table option, so it cannot be kept to Grade 2 tables. Use `props_tables` in `preBuild` / `build`.
- **`mult_zeros {}`** on Y3.B3.S7 pre: change to `{forms:[0]}` (×10 only).
- **`mult_div_fact_family {}`** (Y3.B3.S11, S14, S15, B4.S4, B4.S5 related; B4.S10 pre): drop it, or replace it with `mult_facts` / `div_facts {constant:[2,3,4,5,8,10]}`. On B3.S11 (W11) use × only.
- **`nl_mult`** on Y3.B3.S8, S9 and S11: `{constant:[3]}` / `{constant:[4]}`, band 50, once the `mult2x1` false positive is fixed.
- **Y3.B2.S19:** `money_change {step:100}` (whole dollars), or drop it, and fix the why.

### 3. Direct verdicts

- **Y3.B4.S6:** partial. Name ÷12, ×11 and ×6/7/9 for both skills. Build a `constant` option on `missing_mult_div` and `mult_div_fact_family`.
- **Y3.B4.S10:** partial (`mult_comparison` deals ×6/×9), plus a `constant` option.
- **Y3.B4.S2:** a note or partial for the rare 9 × 90.
- **Y2.B3.S7:** the missing clause names the right angles and parallel sides. Better, replace the partial with a skill that sorts by number of sides or vertices.

### 4. S11: never keep a why across a swap

When `build.mjs` swaps a skill or narrows its opts, write the why from the new skill and opts. Then rewrite the 19 listed whys:
- **The half-turn links:** "half past: the minute hand makes a half turn".
- **Y3.B3.S4:** counting rows step 5 and step 10, not step 50.
- **Y3.B3.S13:** step 8, or a why saying "counting in 4s, doubled".
- **Y3.B7.S3 / S4:** `length_metric {forms:[1]}` (m ↔ cm), or a why that says "cm ↔ mm (×10)".

Strip the `[rule …]` tags from the `why` text.

### 5. Step fixes

- **Y2.B9.S6:** add counting in 5s to pre.
- **Y2.B8.S12 / S13:** the clauses name sixths, twelfths and 5/3 (S12) and eighths and fifths (S13).
- **Y3.B4.S4:** lead pre `mult_zeros {forms:[0,2]}` and `placevalue:expand {band:99}`; `div_remainders` out of the head.
- **Y3.B4.S7:** add `div_facts {constant:[3,4,8]}` (W31) to pre.
- **Y3.B2.S21:** fact families and missing numbers lead pre.
- **Y3.B6.S4:** drop the two vertex-counting pre.
- **Y3.B6.S1 / B7.S4:** rewrite the false notes. B6.S1 can take the B6.S3 numerators skill as related.
- **Y3.B1.S13:** replace the clock-ordering related link with a note or a number-line ordering skill.

### Expected scores

Of the 28 steps under 8:
- 16 lose points only to an S10 link, an S11 why or a false note. Fixes 1–4 lift them to 8.
- The other 12 need the step fixes in item 5 or a verdict change in item 3:
  - Y2.B3.S7, B8.S12, B8.S13, B9.S6
  - Y3.B4.S2, B4.S4, B4.S6, B4.S7, B4.S10, B2.S21, B6.S4, B1.S13

With items 1–5 done, both samples reach a mean of 8.0.
