# Critic round 14: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2), with site lessons

Critic run on 2026-10-16 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 81ac233c, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I graded only. I did not edit the tagging data, the site files or the tooling.

## Verdict: FAIL

| Set | Graded | Mean | Min | Notes |
|---|---|---|---|---|
| Y2 steps | 27 | **7.93** | **7** | random 20: 7.95 (Y2.B10.S1 at 7); hard 5: 7.80 (Y2.B4.S5 at 7); Y2.B3.S12 and Y2.B5.S17: 8 |
| Y3 steps | 28 | **7.96** | **7** | random 20: 7.95 (Y3.B5.S4 at 7); hard 5: 8.00; Y3.B6.S9, Y3.B6.S10, Y3.B8.S1: 8 |
| Y2 lessons | 6 | **8.00** | 8 | |
| Y3 lessons | 10 | **8.00** | 8 | random 6 and the four inch-ruler lessons |

| Gate | Result |
|---|---|
| Every graded step and lesson ≥ 8 | **No.** Three sevens on steps that no round from r10 to r13 graded: **Y2.B10.S1** (N15), **Y2.B4.S5** (N16) and **Y3.B5.S4** (N17) |
| Each year's means ≥ 8 | **No** for both years' steps (Y2 7.93, Y3 7.96). Yes for both years' lessons |
| 0 real merge conflicts | **Yes.** My own `merge14.mjs`: 7 lanes against live `wrm.js`, both orders, 1,040 tags, identical. One key\|step has two writers, and both give the same outcome (§5) |
| Reproducible | **Yes.** Three clean `git archive HEAD` builds are byte-identical to the committed files (§4) |
| Site coverage complete | **Yes.** The lessons sections hold exactly 11 / 25 entries, and the steps sections hold 124 / 134. `ws-wrm-extract --check` exits 0 (§3) |

Score distribution:
- **Y2 steps:** 8 ×25 · 7 ×2
- **Y3 steps:** 8 ×27 · 7 ×1
- **Lessons:** 8 ×16

**What landed.** All r13 rows landed and hold on fresh seeds:
- **N13:** Y3.B6.S10 deals bar models on 40 of 40 items.
- **N14:** Y3.B6.S9 builds `frac_nl_equiv`, the same proposal as in the Y4 lane.
- **Tag merge:** the new `opts` tagFix merges cleanly in both orders.
- **M6, M8, M9:** true on fresh items.
- **M10 tooling:** catches its targets.

**TITLEREP is a real check.** 12 of my 14 positive mutations were caught, and my 3 controls stayed silent. It is blind to clock precision, such as half past or "to 5 minutes" (§2).

**Why it fails.** The new random draw reached steps no round from r10 to r13 read. Three of them are `full` while their items do less than the title:
- **"Make tally charts" (Y2.B10.S1)** only reads a given chart.
- **"Make the same amount" (Y2.B4.S5)** is a yes / no check of one coin set.
- **"Metres, centimetres and millimetres" (Y3.B5.S4)** deals conversions up to 12,000 mm at Grade 2.

All three belong to a class that no lane gate reads: the title's verb (make or draw, as against read) and the step's number bound on a `full` direct. Each one has an existing proposal that closes it.

## 1. The r13 rows on fresh seeds

**Seeds.** Every item check below used new seeds:
- `generateQuestionFor` with 74311 + 367i ×30, 36229 + 347i ×30 and 91577 + 359i ×20.
- `titlerep` with seed 36229, step 347.
- `denoms` with 74311 / 367 and 36229 / 347.

None of these seeds appears in an earlier report or script.

| r13 row | Result |
|---|---|
| **N13 Y3.B6.S10** `equiv_frac_visual {model:['bar']}` | **Landed.** 40 of 40 items are bar pairs: 2/5 = 4/10 and 1/4 = 2/8 as = / ≠ checks, plus missing-number items. `{model:['bar','circle']}` would give 25 of 40 bars, so the single option is the right one. The circle `{denoms:[2]}` pre now says "fraction model: circle: a neighbouring rung". **8** |
| **tagOpts** (`{action:'opts', opts:{model:['bar']}}` on the full tag) | **Merges correctly.** Live `SKILL_WRM` already has `'Y3.B6.S10'` full. After R→Y6 and after Y6→R the tag is `full`, with no clause and `{"model":["bar"]}`. Y3 is its only writer. The `opts` action is the shape the Y4 / Y5 / Y6 lanes already use (47 / 21 / 10 entries), so the lead's merge reader handles it |
| **N14 Y3.B6.S9** build `frac_nl_equiv` | **Landed, and it matches Y4.json.** Y3's copy has the same id, kind (`option`), skill (`fractions:equiv_frac_visual`), option ("number lines"), name, teaches, representation and family as `Y4.json` and `WRM_PROPOSALS`. Its steps are Y4's (`Y4.B7.S9, Y4.B7.S10, Y6.B3.S2`) plus `Y3.B6.S9`. It adds `closes` for Y3.B6.S9 (the step's clause, rule 16) and `source: "Y4.json"`. `frac_count` now leads the preBuild. The option is not built yet (`equiv_frac_visual` models are circle / bar / area). **8** |
| **M6** inch-ruler lessons | **Landed.** All four cite "Y2.B6.S1 Measure in centimetres (Grade 1): reading a length in whole inches … (nearest live practice: … these items never use centimetres)" |
| **M8** Y2.B3.S12 related `number_pattern {band:50}` | **True.** On 80 items: "Find the pattern" 53, reverse order 14, counting order 13 |
| **M9** Y2.B5.S17 related `money_count {currency:'usd'}` | **True.** On 80 items: 1¢ ×13, 5¢ ×14, 10¢ ×26, 25¢ ×27, and 0 items mix two coin kinds |
| **M10** `denoms.mjs` DENIED / FAMILY, `claims.mjs` "not" and money | **Landed** (§2) |

## 2. The new gates: real checks or rubber stamps?

### TITLEREP (my mutations, on in-memory copies, items from seed 36229 + 347i ×40)

| # | Mutation | Expected | Result |
|---|---|---|---|
| m1 | Y3.B6.S10 `{model:['area']}` | caught | caught: bar model 0 of 40 |
| m3 | Y3.B6.S7 "Fractions on a number line": directs swapped to `identify {}` | caught | caught: number line 0 of 40 |
| m4 | Y2.B5.S10 "Divide by 2": `div_facts {constant:[5]}` | caught | caught: ÷2 0 of 40 |
| m5 | Y3.B1.S14 "Count in 50s": count by 10 | caught | caught |
| m6 | Y3.B10.S5 "a.m. and p.m.": `time_5min` | caught | caught: a.m. 0 of 40 |
| m8 | Y3.B5.S4 m, cm and mm: `{forms:[0]}` | caught | caught: metres 0 of 40 |
| m9 | Y2.B1.S6 "in words": `number_seq_fill` | caught | caught |
| m10 | Y3 lesson "Shorter by, bar models": clause without "bar model" | caught | caught (CLAUSE) |
| m11 | Y3.B7.S8 L and mL partial: clause without litres | caught | caught (CLAUSE) |
| m12 | Y3.B3.S6 "Multiply by 3": `{constant:[4]}` | caught | caught: ×3 1 of 40 |
| m14 | Y3.B11.S6 parallel / perpendicular: `angle_types` | caught | caught, both words |
| **m7** | Y2.B9.S5 "Tell the time to 5 minutes": `time_hour` + `time_half_hour` | caught | **not caught** (the "minutes / hours" claim holds 80 of 80) |
| **m13** | Y2.B9.S1 "O'clock and half past": `time_hour` only | caught | **not caught** (the "clock" claim holds 40 of 40) |
| c1 | Y3.B6.S10 `{model:['bar'], denoms:[2]}` | silent | silent |
| c2 | Y2.B5.S10 plus a second ÷2 link | silent | silent |
| c3 | Y3.B6.S9 clause "stacked number lines" | silent | silent |
| (info) | Y3.B6.S10 `{model:['bar','area']}` | — | fires on my seeds (bars 15 of 40, need 20). The builder lists this as a must-not-fire control (c2), so that control is seed-dependent. A half-area page is not "bar models", so firing is acceptable |

**Verdict on TITLEREP.** It is a real check on representations, units, operations, tables, words and money. It has two blind spots:
- **Clock precision** (m7, m13). "Half past", "quarter past / to", "to 5 minutes" and "to the minute" are not claims.
- **The title's verb.** "Make" and "draw" as against reading. That is N15 and N16.

The in-data check of the time steps (Y2.B9.S1, S2, S5 and Y3.B10.S2–S4) found no defect of the m7 / m13 kind.

### The M10 tooling (my mutations)

| # | Mutation | Result |
|---|---|---|
| n2 | Y3.B9.S4 clause "… never in cents" | caught (a-neg 30/30) |
| n4 | Y2.B8.S14 `shade_fraction {denoms:[2]}` clause "… no quarters" | caught (DENIED) |
| n6 | the same, "halves and quarters, but never eighths" | caught (DENIED): the items deal /8 34 of 80 |
| n3, n5 (controls) | "not grams" on mL; "not thirds" on halves | silent |
| **n1** | Y3.B7.S8 "reads a cylinder; it does not use millilitres" | **not caught.** A negation inside a verb phrase ("does not use X") is not read, because the negated part is not unit words only. Gate-only minor |

DENIED message, a cosmetic slip: it prints the count of the denied denominators from the off-family counts. So an in-family denial reads "/4 ×0 of 80" while /4 is dealt 23 of 80. The finding is right; the number in it is wrong.

The lane's own gates on my seeds:
- `denoms.mjs Y2 Y3`: 0 findings (FAMILY 0, NAMED 0, DENIED 0).
- `titlerep.mjs Y2 Y3`: 0.
- `linkscan`: OK.

## 3. Site coverage

- **Lessons.** `site-lessons.json` has 143 lessons. Those with `wrmYear` Y2 (11) and Y3 (25) are exactly the keys of each file's `lessons` section: 0 missing, 0 extra, 0 title mismatches.
- **Steps.** 124 / 134 steps, in the order of `wrm-steps.json`.
- **Extract check.** `node tests/scripts/ws-wrm-extract.cjs --site …/scratchpad/site/index.html --check` prints "wrm-steps.json up to date" and "site-lessons.json up to date", and exits **0**.
- **Links.** No link in Y2 or Y3 uses a non-live skill key.

## 4. Reproducibility

| Build | Result |
|---|---|
| A and B: fresh `git archive HEAD` trees; `env -u WRM_TAG_DATA`, a scratch `TMPDIR`; `build.mjs Y2 --dropped` then Y3 | exit 0 ×4 |
| C: as A, with `links/Y2.json` and `Y3.json` deleted first, and Y3 built before Y2 | exit 0 ×2 |
| sha256 | Y2 `53f45b1f…4011f3244` and Y3 `ba0b305f…2d1ed44e` for A, B, C and the committed files |
| Logs | Identical apart from node's PID in its module warning. Every log reports 0 for specopts (1,072 / 1,244 links), denomcheck, **titlerep** (Y2 135 entries, Y3 159), mergecheck, optgate, titleclaim, lessons and bbcheck |

## 5. Merge (my own `merge14.mjs`, written this round)

Inputs:
- the in-repo `data/curriculum/links/{R,Y1,Y2,Y3,Y4,Y5,Y6}.json`;
- live `js/modules/wrm.js` `SKILL_WRM` as the base.

How the actions apply:
- `remove`, `add`, `partial` and `full` set the status and clause, and carry the opts.
- `opts` changes only the opts of an existing tag. An `opts` fix on an untagged pair counts as a problem.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 66, Y3 72 (one new: the `opts` fix), Y4 166, Y5 175, Y6 148 |
| R→Y6 against Y6→R (status, clause, opts) | **Identical**, 1,040 tags. 0 problems: no remove of an untagged pair, no `opts` on an untagged pair, no unknown action |
| key\|step written by 2+ lanes | **1**: `patterns:count_by_step_up\|Y2.B1.S15`, by Y2 and Y4. Both are partial with the same clause. **0 real conflicts** |
| Fixes on non-live keys | 0 |
| Own steps after the full merge | Y2: 0 mismatches, 45 / 45 partial clauses verbatim. Y3: 0 mismatches, 69 / 69 verbatim |
| `fractions:equiv_frac_visual` | Y3.B6.S10: full, `{model:['bar']}`, both orders. Y3.B6.S9: partial "equivalent fractions shown on two number lines" (live). Y4.B7.S9: the Y4 partial |
| Proposal ids shared by 2+ lanes | 113, none with a different skill or kind. One option label differs (`reflex_angles`, Y5 against Y6), which is not this lane |

## 6. New defects

### N15: Y2.B10.S1 "Make tally charts" is `full` on a skill that only reads tally charts

- **The link.** The direct is `graphs:tally_chart {}`. On 80 items every question reads a drawn chart: "How many children chose running?", "… in all?", "Which sport did the fewest children choose?" and "How many more …?". Its option schema (`skill-options.js` l.2440) has only those four read kinds. No item records data as tally marks.
- **The lane contradicts itself.** The Y3 lesson "Record results using tally marks" tags the same skill partial with the clause "reads one count from a tally chart to 10; never records results as tally marks".
- **The rules.** WRM Y2 "Make tally charts" records data as tallies and then reads them, and 1.MD.C.4 is "organize, represent and interpret". Rule 8: a production item replaced by reading only is `partial`.
- **Grade.** **7.**

### N16: Y2.B4.S5 "Make the same amount" is `full` on a yes / no check

- **The link.** The direct is `measurement:equiv_coin_sets {currency:'usd'}`. On 80 items, every one is "Do the coins make the amount? Check one box" (one coin set against a number, Yes / No).
- **What the step asks.** Making an amount from coins, and making the same amount in a second, different way (two sets of equal value), are both missing.
- **The rules.** CLAUDE.md: "A production item on paper is never turned into multiple choice". BRIEF rule 8: a wrong response mode is `partial`.
- **The fix already exists.** The lane's own proposal `make_amount_notes` (task "make", "and finding more than one way") is what closes it. It is built for Y2.B4.S4 already.
- **Grade.** **7.** r9 and r11 graded this step 8. A fresh reading of its items does not hold that.

### N17: Y3.B5.S4 "Metres, centimetres and millimetres" is `full` on conversions to 12,000

- **The link.** The direct is `measurement:length_metric {forms:[0,1,2]}`. On 80 items it deals whole-unit conversions only: "How many mm are in 10 m?" ×31, mm in cm ×26, cm in m ×23.
- **Range (rule 7).** **35 of 80 answers are above 1,000** (10 m = 10,000 mm; the largest is 12,000). The step is Grade 2, W14, where numbers go to 1,000. Measuring and recording a length in m, cm and mm is not dealt either.
- **The lane contradicts itself.** Its neighbours Y3.B5.S5 and S6 tag the same skill partial ("whole metres to cm only … mixed units are not dealt"), and build `mm_cm_m`. S4 is the step that names all three units.
- **Grade.** **7.**

### Minors (none changes a grade)

| # | Where | Note |
|---|---|---|
| M12 (gate class) | `titlerep.mjs` | The title's **verb** (make, draw, choose, record, as against reading) is not a claim (N15, N16). **Clock precision** is not a claim either: "half past", "quarter past / to", "to 5 minutes", "to the minute" (m7, m13 not caught) |
| M13 (gate class) | build checks | Nothing holds a `full` direct's dealt numbers to the step's bound (rule 7). Y3.B5.S4 deals to 12,000 at Grade 2. A per-week ceiling would catch it: Y2 to 100 (120 after W08), Y3 to 1,000. Exempt money in cents and time in minutes |
| M14 | `claims.mjs` `negatedParts` | "it does not use millilitres" is not read as a negation (n1). The DENIED message prints ×0 for an in-family denial (§2) |
| M15 | Y2.B9.S2 "Quarter past and quarter to" | Every item is clock → write a digital time. The language is on the same skill as `time_quarter {stimulus:'words-past'}` ("quarter to twelve" → 11:45). Y2.B9.S3 / S4 hold their "past / to" language to this standard; S2 could carry it as a second direct |
| M16 | Y3.B10.S4 "Read time on a digital clock" | `time_analog_digital` is used `{dir:'to-digital'}` only (clock → digital readout). `{dir:'to-analog'}` reads a digital time and picks the clock, and would sit well as a second direct |
| M17 | Y3.B8.S1 "Add fractions", lead pre | Lead pre is `equiv_frac_visual {model:['bar']}`, which is equivalence. The building block of adding like fractions is a non-unit fraction as a count of unit fractions (`write_fraction` / `shade_fraction`, Y2.B8.S11). Rule 14: rank by building block |
| M18 | Y2.B4.S6 pres | `add_wp_10 {band:10}` and `add_wp_10_plain {band:10}` deal the same stories ("2 apples are in a bag …"): one pre slot spent twice |
| M19 | Y3.B12.S5 / S6 pre `tally_chart` | The why "tally charts: collecting the data" overstates: the skill reads charts (see N15) |
| M20 (generator, owner bug list) | `js/modules/gen-fractions.js` ≈ l.4372–4377, `equiv_frac_nv` yes / no items | The "only the top number changed" distractor is clamped to `d − 1`. On a /2 or /3 base, the clamp and the `+1` retry give back the base fraction. Result: "Are 1/2 and 1/2 equivalent fractions?" keyed **no** (`{denoms:[2]}` 3 of 30 yes / no items; `{denoms:[2,3]}` 2 of 35, 2/3 and 2/3). The lane links it as related on Y3.B6.S9 and S10 |

## 7. The sample

**Method.**
- **Items.** `dump.mjs` with the §1 seeds: 40 items per direct or partial link and 16 per pre or related link. Counts came from 80 items with `cnt.mjs`.
- **Random 20 per year.** `random.Random(141401)` for Y2 and `141402` for Y3, drawn from steps that no table row in r10–r13 names:
  - Every `B#.S#` in a table row was excluded.
  - A year-less row took the year of its section heading.
  - A year-less row outside a year section was excluded from both years.
  - The pools were 26 steps for Y2 and 36 for Y3.
- **Hard 5.** My own choice:
  - Y2: the time steps TITLEREP cannot read, the US-money "make" step, missing-number problems, and the two-lane merge step.
  - Y3: time to 5 minutes, the digital clock, flexible-partitioning division, inverse operations and fractions on a number line.
- **Lessons.**
  - Y2: `random.Random(141403)` over the 5 lessons r13 did not grade, plus one drawn from the rest.
  - Y3: `random.Random(141404)` over the 16 lessons that are neither r13's nor inch-ruler lessons, plus the four inch-ruler lessons.

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r14c/`:
- `lib.mjs` and `dump.mjs`, with the `d-*.txt` dumps;
- `cnt.mjs`, `nv.mjs` / `nv2.mjs` (M20), `m2.mjs`, `m9.mjs`, `lm.mjs`, `tq.mjs`, `pv.mjs`, `sh.mjs`;
- `trmut.mjs` (TITLEREP mutations) and `negmut.mjs` (claims / denoms);
- `b.sh`, trees `a`–`c` and their logs (reproducibility);
- `merge14.mjs`;
- `sample.json` (the draw and the excluded set).

### Y2 (Grade 1) steps: mean 7.93

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Named** | | | |
| B3.S12 Patterns with 2-D and 3-D shapes (W14) | partial | 8 | M8 true |
| B5.S17 The 5 and 10 times-tables (W26) | full | 8 | ×5 58 / 80, ×10 54 / 80; M9 true |
| **Hard 5** | | | |
| B9.S2 Quarter past and quarter to (W36) | full | 8 | :15 and :45 only; M15 |
| B9.S1 O'clock and half past (W23) | full | 8 | The note says why there is no related |
| **B4.S5 Make the same amount (W32)** | full | **7** | **N16** |
| B2.S21 Missing number problems (W11) | full | 8 | |
| B1.S15 Count in 2s, 5s and 10s (W4) | full | 8 | The partial clause is true (to 190) |
| **Random 20** | | | |
| B1.S4 Use a place value chart (W1) | full | 8 | The digits sit under T / O headings |
| B1.S7 Flexibly partition numbers to 100 (W2) | gap | 8 | |
| B1.S9 10s on the number line to 100 (W3) | partial | 8 | |
| B1.S10 10s and 1s on the number line (W3) | partial | 8 | |
| B2.S1 Bonds to 10 (W9) | full | 8 | The `add_sub_10s` / `more_less_10` tail is thin |
| B2.S8 Add to the next 10 (W6) | gap | 8 | |
| B2.S9 Add across a 10 (W7) | partial | 8 | Both clauses true (6 + 4, make a ten within 20) |
| B2.S12 Subtract 1-digit from 2-digit, across 10 (W9) | partial | 8 | The `nl_sub` related why ("across a ten") fits about half its items |
| B2.S17 Subtract 2-digit, not across 10 (W6) | full | 8 | |
| B3.S8 Count faces on 3-D shapes (W14) | full | 8 | The cylinder-faces owner question stands; the symmetry pre is no building block |
| B3.S10 Count vertices on 3-D shapes (W14) | full | 8 | |
| B4.S4 Choose notes and coins (W33) | partial | 8 | |
| B4.S6 Compare amounts of money (W8) | full | 8 | M18 |
| B4.S9 Find change (W12) | full | 8 | |
| B6.S3 Compare lengths and heights (W22) | partial | 8 | |
| B8.S9 Find the whole (W18) | gap | 8 | |
| B8.S14 Find three-quarters (W38) | partial | 8 | Halves family (/2 23, /4 23, /8 34) |
| B9.S7 Hours in a day (W23) | gap | 8 | |
| **B10.S1 Make tally charts (W24)** | full | **7** | **N15** |
| B11.S3 Describe turns (W20) | gap | 8 | |

Sum 214 / 27 = **7.93**.

### Y3 (Grade 2) steps: mean 7.96

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Named** | | | |
| B6.S9 Equivalent fractions on a number line (W37) | partial | 8 | N14 landed (§1); M20 on the related |
| B6.S10 Equivalent fractions as bar models (W37) | full | 8 | N13 landed: bars 40 / 40 |
| B8.S1 Add fractions (W37) | partial | 8 | Clause true; M17 |
| **Hard 5** | | | |
| B10.S2 Tell the time to 5 minutes (W20) | full | 8 | |
| B10.S4 Read time on a digital clock (W21) | full | 8 | M16 |
| B4.S8 Divide 2-digit by 1-digit, flexible partitioning (W32) | full | 8 | Area model; ÷2, 3, 4, 5, 8 only |
| B2.S21 Inverse operations (W8) | full | 8 | |
| B6.S7 Fractions on a number line (W18) | full | 8 | Number line 68 / 80 |
| **Random 20** | | | |
| B1.S6 Partition numbers to 1,000 (W2) | full | 8 | |
| B1.S14 Count in 50s (W3) | full | 8 | |
| B2.S4 Add and subtract 100s (W4) | partial | 8 | |
| B2.S5 Spot the pattern (W4) | gap | 8 | |
| B2.S12 Subtract two numbers, no exchange (W6) | full | 8 | |
| B2.S20 Estimate answers (W8) | partial | 8 | |
| B3.S1 Multiplication, equal groups (W10) | full | 8 | |
| B3.S2 Use arrays (W10) | full | 8 | |
| **B5.S4 Metres, centimetres and millimetres (W14)** | full | **7** | **N17** |
| B5.S11 Measure perimeter (W16) | full | 8 | |
| B7.S5 Compare mass (W18) | partial | 8 | |
| B7.S6 Add and subtract mass (W35) | gap | 8 | |
| B9.S3 Add money (W19) | full | 8 | |
| B9.S5 Find change (W20) | full | 8 | |
| B10.S3 Tell the time to the minute (W20) | full | 8 | |
| B10.S12 Solve problems with time (W23) | full | 8 | |
| B11.S1 Turns and angles (W28) | gap | 8 | |
| B11.S4 Measure and draw accurately (W23) | partial | 8 | |
| B12.S5 Collect and represent data (W25) | gap | 8 | M19 |
| B12.S6 Two-way tables (W25) | gap | 8 | |

Sum 223 / 28 = **7.96**.

### Lessons: 16, mean 8.00

**Y2 (Grade 1), 6 lessons: 48 / 6 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Count money, notes and coins (US) (above) | full | 8 | |
| Compare mass (2) (Support) | full | 8 | The note says why there are few pres |
| Compose and recompose shapes (W15) | partial | 8 | Both clauses true |
| Length and height, compare and order (Support) | full | 8 | |
| Find the total (US) (above) | full | 8 | |
| Count on to 120 (W08) | partial | 8 | |

**Y3 (Grade 2), 10 lessons: 80 / 10 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Measure and estimate in inches and feet (W17) | partial | 8 | |
| Find the total (Support) | full | 8 | |
| Record results using tally marks or a picture graph (Support) | partial | 8 | The honest clause N15 should copy |
| Read and write numbers to 1,000 in words, numerals and expanded form (W02) | full | 8 | |
| Odd and even numbers (W12) | partial | 8 | |
| Add up to four two-digit numbers (W09) | full | 8 | |
| Compare units: inches, feet, yards and cm (W17), inch ruler | gap | 8 | M6 landed |
| Record the measurement data in a table (W17), inch ruler | gap | 8 | M6 landed |
| Solve "longer by" problems with bar models (W18), inch ruler | gap | 8 | M6 landed |
| Solve "shorter by" problems with bar models (W18), inch ruler | gap | 8 | M6 landed |

## 8. Fix list

### A. Step fixes

| Step | Fix |
|---|---|
| **Y2.B10.S1** (N15) | Verdict `partial`. Clause, for example: "reads a given tally chart (how many, most / fewest, in all, how many more); recording data as tally marks to make the chart is not dealt". Build: reuse `collect_data` (its representation is "a list of raw data; tally it"; add the step and a `closes`) or write a new `option` on `graphs:tally_chart` (task "make": tally a list or picture of objects). Add a `partial` tagFix |
| **Y2.B4.S5** (N16) | Verdict `partial`. Clause, for example: "checks whether one set of coins makes an amount (yes / no); making an amount with coins, and the same amount in two different ways, are not dealt". Build: reuse `make_amount_notes` (add the step and a `closes`; coins to 100¢ for this step). Add a `partial` tagFix |
| **Y3.B5.S4** (N17) | Verdict `partial`. Clause, for example: "whole-unit conversions only, and 35 of 80 answers pass 1,000 (10 m = 10,000 mm); measuring and recording a length in m, cm and mm is not dealt". Build: reuse `mm_cm_m` (add the step) plus an option that keeps `length_metric` answers within 1,000 (no band exists today). Add a `partial` tagFix |

### B. Checks (lane tooling)

1. **M12:** read the title's verb as a claim. "Make", "draw", "record" or "choose" need production items (build, draw, set, write a set) in the full directs. Add clock precision to TITLEREP: half past, quarter past / to, 5 minutes, to the minute. Then re-scan the lane for other steps of the N15 / N16 kind.
2. **M13:** a range gate on `full` directs: the answers must stay within the step's week ceiling (rule 7).
3. **M14 (optional):** "does not use X" as a negation, and the DENIED count.

### Optional minors

M15–M19 above. Record M20 on the owner generator bug list.

### Expected scores

| Fix | Lifts | Step |
|---|---|---|
| A, row N15 | 1 seven | Y2.B10.S1 |
| A, row N16 | 1 seven | Y2.B4.S5 |
| A, row N17 | 1 seven | Y3.B5.S4 |

With the three rows done, both years' steps reach 8.00 and no graded step or lesson is below 8. Merge, reproducibility and site coverage already pass.
