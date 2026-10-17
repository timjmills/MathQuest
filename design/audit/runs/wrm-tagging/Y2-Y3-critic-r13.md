# Critic round 13: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2), with site lessons

Critic run on 2026-10-16 against `data/curriculum/links/Y2.json` and `Y3.json` at commit fc57a254, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I graded only. I did not edit the tagging data, the site files or the tooling.

## Verdict: FAIL (narrowly)

| Set | Graded | Mean | Min | Notes |
|---|---|---|---|---|
| Y2 steps | 30 | **8.00** | 8 | random 20, hard 5, Y2.B8.S12, the 4 r12 minor-touched steps: all 8 |
| Y3 steps | 29 | **7.93** | **7** | random 20: 7.95 (Y3.B6.S10 at 7); hard 5: 8.00; the 4 r12-touched steps: 7.75 (Y3.B6.S9 at 7) |
| Y2 lessons | 6 | **8.00** | 8 | No lesson changed in round 13 (diffed against 98f9fad2) |
| Y3 lessons | 6 | **8.00** | 8 | |

| Gate | Result |
|---|---|
| Every graded step and lesson ≥ 8 | **No.** Two sevens, both in Y3 fractions: **Y3.B6.S10** (N13) and **Y3.B6.S9** (N14) |
| Each year's means ≥ 8 | Y3 steps **No** (7.93). Y2 steps, Y2 lessons and Y3 lessons: yes |
| 0 real merge conflicts | **Yes.** I wrote a new simulation (`merge13.mjs`): 7 lanes against live `wrm.js`, both orders. One key\|step has two writers (Y2/Y4 on Y2.B1.S15) and both give the same outcome (§5) |
| Reproducible | **Yes.** Three clean `git archive HEAD` builds (A and B build Y2 then Y3; C deletes Y2.json and Y3.json first and builds Y3 first) are byte-identical to the committed files (§4) |
| Site coverage complete | **Yes.** The `lessons` sections hold exactly the 11 / 25 Y2 / Y3 entries of `site-lessons.json`, and the titles match. The steps are exactly the 124 / 134 of `wrm-steps.json`. `ws-wrm-extract --check` exits 0 (§3) |

Score distribution:
- **Y2 steps:** 8 ×30
- **Y3 steps:** 8 ×27 · 7 ×2
- **Lessons:** 8 ×12

**What landed.** Every r12 row landed and holds on fresh seeds. Y2.B8.S12 is now an 8: its clause is true of the items, cell payload included. The new gates are real:
- `denoms.mjs` caught 4 of my 6 denominator mutations.
- SPECOPTS caught all 6 of mine.
- The sweep extension caught 6 of 7 positive mutations, and none of the 3 controls fired.

**Why it fails.** Two steps the earlier rounds graded 8 do not hold on a fresh reading. Both sit in the Y3 fractions block, and existing options or proposals already close each one:
- **Y3.B6.S10 "as bar models"** is marked `full`. Its link's default draws circles on every item, even though a `model:['bar']` option exists.
- **Y3.B6.S9 "on a number line"** builds `frac_count`, which does not teach equivalence. The proposal `frac_nl_equiv` already exists and is what the Y4 lane uses for the same clause.

## 1. The r12 rows on fresh seeds

**Seeds.** `generateQuestionFor` on the print path, with 61403 + 263i ×30, 83117 + 271i ×30 and 19447 + 281i ×20. The `denoms.mjs` runs also used 61403 + 263i, 83117 + 271i and 19447 + 281i at 120 items each. No earlier round, build or critic used these seeds.

| r12 row | Result |
|---|---|
| **A1 / N12, denominators read from the cell payload** | **Landed.** I wrote my own payload walk (`dn.mjs`), separate from the lane's: text, picture, options, answer, plus every `d` / `den` and "a/b" in `q.cell.payload`, judged with `utils.js denomAllowed`. On 80 items per link: `equiv_frac_visual {denoms:[2]}` is 45/80 off-family; `identify {denoms:[2]}` 26/80; `identify {denoms:[2,3]}` 12/80 (fifths only). Every other denoms link is 0/80: `shade_fraction {[2]} {[3]} {[2,3]}`, `write_fraction {[2,3]}`, `graph_fractions`, `equiv_frac_nv`, `fraction_of_set(_hard)` and the like-fraction add / subtract skills. These match the report's 600-item table. `denoms.mjs Y2 Y3` on my three seed sets finds 0 problems: Y2 has 9 links (3 off-family, 9 texts name a family) and Y3 has 78 links (21 off-family, 20 texts name a family) |
| **Y2.B8.S12 clause** | **True.** Of 80 items, 47 are = / ≠ checks ("about half"). They are all circles, and the families are those named: 2/3 = 6/9, 1/6 = 3/18, 3/5 = 6/10, 3/5 = 12/20, 1/5 ≠ 3/7, 3/5 ≠ 7/9, and the improper 3/5 ≠ 9/5 and 5/6 ≠ 23/20. The 33 missing-number pictures are the halves family, with 1/2 = 3/6 and 3/4 = 9/12 among them. "A page of 1/2 = 2/4 only is not available" is true. **8** |
| Y2.B8.S13 `identify {denoms:[2]}` | **True.** 26 of 80 items are "which model shows" (about a third), and every one has a /3, /5 or /6 picture among its four. The rest are eighths (1/8, 7/8), halves and quarters. Parts and write items: 0 off-family |
| Y2.B8.S10, Y2.B8.S8 | **True.** The fifths (4/5) appear only among the "which model" pictures. `shade_fraction {denoms:[3]}` deals /3 ×36 and /6 ×44, with no twelfths |
| Y3 `equiv_frac_visual {denoms:[2]}` pre whys (Y3.B6.S8–S10, Y3.B8.S1–S6) | **True.** They name the halves-family pictures and the other families of the = / ≠ checks. "(denominators option: the halves family)" names the option, not what is dealt. The `identify {denoms:[2]}` pres of Y3.B6.S1 / S4 name the off-family pictures |
| **M1, SPECOPTS** | **Landed** (§2) |
| **M2, sweep reads story operations and negated units** | **Landed** (§2) |
| **Y2.B1.S11, lead pre** | **Landed.** The step's own `place_on_number_line {span:10, band:100}` is gone from its pres. The lead is now `tens_foundation_visual {band:90}`, then `number_seq_fill {range:100}` and the compare |
| **M3** Y2.B11.S5 related `number_pattern {band:50}` | **Landed.** The why ("finding the rule … fill the missing numbers, or put numbers in counting order") is true: of 80 items, 53 are "Find the pattern", 16 are reverse order and 11 are counting order. **The same false why survives on Y2.B3.S12** (M8) |
| **M4** Y2.B11.S2 / S4 | **Landed.** The `place_on_number_line` relateds are dropped. Y2.B11.S2 has no related, and its note says why |
| **M5** Y3.B7.S10 related `money_compare {response:'sign'}` | **Landed.** The why now names the <, > and = signs between coin amounts |

## 2. The new gates: real checks or rubber stamps?

### `denoms.mjs` (standalone, on mutated copies in a fresh `git archive` tree)

| # | Mutation | Result |
|---|---|---|
| d1′ | Y2.B8.S12 clause rewritten to name only thirds, ninths, eighteenths and sevenths | **exit 1**: FAMILY fifths (/5 ×20, /10 ×4, /15 ×4, /20 ×2 of 120) |
| d2 | Y2.B8.S8 `shade_fraction {denoms:[3]}`: "also deals sixths **and ninths**" | **exit 1**: NAMED ninths (0 of 520 items) |
| d3 | Y3.B6.S2 related `equiv_frac_visual {[2]}` why → "halves and quarters shown as equal pictures" | **exit 1**: FAMILY thirds, fifths and sevenths |
| d5 | Y3.B8.S1 `add_fractions_like` clause names "twentieths" | **exit 1**: NAMED twentieths |
| d6′ | Y3.B6.S8 pre `identify {[2,3]}` why → "unit fractions: halves and thirds only" | **exit 1**: FAMILY fifths (/5 ×13) |
| d4 | Y2.B8.S12 clause → "the halves family only (1/2 = 2/4); **never thirds, fifths or sevenths**" | **exit 0, not caught.** `namedDens` counts a family word as "named" even when it follows a negation. A clause that denies a family the items deal therefore passes. Gate-only minor (M10) |
| d1 | The fifths phrase alone removed from the Y2.B8.S12 clause | exit 0. This is correct: "3/5 ≠ 5/7" and "3/5 ≠ 9/5" still name the fifths family |

**Scope.** The check covers only links with a `denoms` option. I scanned the other fraction-key links whose text names a denominator (all `partition_shapes` pres, the Y3 `identify {}` / `write_fraction {}` / `compare` / `fraction_of_set` partials, and `reading_ruler_hard`). Every one names what its items deal. For example, the "the numerator of 5/9" example on Y3.B6.S1 appears in 5 of 400 items.

### SPECOPTS (in-build, three fresh `git archive` trees, both years)

| # | Mutation | Result |
|---|---|---|
| s1 | After the OPTGATE snapshot, `direct[0].opts.zz = 1` on Y2.B9.S1 and Y3.B10.S2 | **exit 1** both years: `SPECOPTS … direct spec [time_hour\|{}] written [{"zz":1}]` |
| s2 | The first multi-pre lesson's pre list reversed just before the write | **exit 1** both years: "(order)" |
| s3 | One related popped from the first step that has two or more, just before the write | **exit 1** both years: "(3 vs 2 links)" / "(2 vs 1 links)" |

SPECOPTS reads the written file back from disk and compares it one to one, order included, so M1 is closed. A change made in the spec itself (`overrides.mjs` / `lessons.mjs`) is by design not a re-option.

### Sweep extension (`sweep()` on mutated copies of Y3.json; the builder's Y2 mutations not repeated)

| # | Mutation | Result |
|---|---|---|
| X1 | Y3 lesson `sub_wp_100 {support:'bar'}`: "never subtracts" | caught, a-neg 30/30 |
| X2 | Y3 lesson `add_wp_100`: "never adds" | caught, 30/30 |
| X4 | Y3.B7.S3 `mass_volume_liquid {forms:[1]}`: "no grams" | caught, 12/30 |
| X7 | Y3.B5.S6 `length_metric {forms:[0]}`: "never mm" | caught, 30/30 |
| X9 | Y3.B3.S5 `div_word_problems`: "never divides" | caught, 30/30 |
| X3, X6, X8 (controls) | "never subtracts" on the add story, "never kg" on mL, "never inches" on cm → mm | none fired (correct) |
| X5 | Y3.B7.S8 mL: "reads a cylinder; **not** millilitres" | **not caught.** `negatedParts` reads only never / no / without, and "not" is skipped. Gate-only minor (M10) |
| X10 | Y3.B9.S4 `money_change`: "no cents" | **not caught.** Money words are not in the negated-unit list. Gate-only minor |

**The lane's own checks pass:**
- `linkscan.mjs Y2 Y3`: OK.
- `sweep.mjs Y2 Y3`: OK (a 0, a-neg 0, b 0; c 55 / 63, as read in r12).
- `mergeall.mjs`: 1,040 tags, 0 problems.

## 3. Site coverage

- **Lessons.** `site-lessons.json` has 143 lessons. The `wrmYear` Y2 lessons (11) and Y3 lessons (25) equal the keys of each file's `lessons` section exactly, and every title matches.
- **Steps.** The `steps` sections are exactly the 124 / 134 Y2 / Y3 ids of `wrm-steps.json`, in its order.
- **Extract check.** `node tests/scripts/ws-wrm-extract.cjs --site …/scratchpad/site/index.html --check` printed "wrm-steps.json up to date" and "site-lessons.json up to date", and exited 0.

## 4. Reproducibility

| Build | Result |
|---|---|
| A and B: clean `git archive HEAD` trees, `env -u WRM_TAG_DATA`, a scratch `TMPDIR`, `build.mjs Y2 --dropped` then Y3 | Exit 0 ×4 |
| C: as A, with `links/Y2.json` and `Y3.json` deleted first and Y3 built before Y2 | Exit 0 ×2 |
| sha256 | Y2 `84d6481a…bdaad3` and Y3 `15b3a6b6…b585b6` for A, B, C and the committed files |
| Logs | Identical apart from node's module-type warning, which names the tree path. Each log reports 0 for specopts (Y2 1,072 / Y3 1,244 links), denomcheck, mergecheck, optgate, titleclaim, lessons and bbcheck |

## 5. Merge (my own `merge13.mjs`, written this round)

Inputs:
- the in-repo `data/curriculum/links/{R,Y1,Y2,Y3,Y4,Y5,Y6}.json`;
- live `js/modules/wrm.js` `SKILL_WRM` as the base.

Each tagFix becomes an effect: remove, add (full or partial with clause and opts), partial, full, or opts-only.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 66, Y3 71, Y4 166, Y5 175, Y6 148 |
| Same result in both lane orders (R→Y6 and Y6→R; status, clause and opts compared) | **Yes**, 1,040 tags; no opts-only fix on an untagged pair |
| key\|step written by 2+ lanes | **1**: `patterns:count_by_step_up\|Y2.B1.S15`, Y2 and Y4, both partial with `{step:[0]}` and the same clause. **0 real conflicts** |
| Each lane's own steps (direct = full, partial = partial, no stray tag), alone and merged | 0 mismatches in all seven lanes |
| Y2 / Y3 partial clauses after the merge | 45 / 69, all verbatim |
| Proposal ids shared by 2+ lanes | 113, none with a different skill or kind |

## 6. New defects

### N13: Y3.B6.S10 "Equivalent fractions as bar models" is `full` on circles

- **The link.** The direct is `fractions:equiv_frac_visual {}`. Its default `model` is `['circle']`: on 80 fresh items, 59 are missing-number items and 21 are = / ≠ items, all `circle,circle`. No item is a bar.
- **The option that fixes it.** The skill has a `model` option (`skill-options.js` l.3129: circle / bar / area; "Bars (fraction strips) are the usual picture for equivalence"). `{model:['bar']}` deals 40 of 40 items as bar pairs (29 missing-number, 11 = / ≠).
- **The rules.** BRIEF rule 2: a step is `full` only if its opts make the generator deal exactly the step. The title names the representation, and the option that deals it exists.
- **Grade.** As written, `full` is not true. **7.** Earlier rounds graded it 8 (r8, r11).
- **Lane-wide.** No link in Y2 to Y5 uses a `model` opt.

### N14: Y3.B6.S9 "Equivalent fractions on a number line" builds a proposal that does not close it

- **What it builds.** The partial clause is "equivalent fractions shown on two number lines", which is true: `equiv_frac_visual` has no line model. The only build is `frac_count`, "counting up and down in unit fractions on a number line and past a whole". That is a building block, not equivalence on two lines.
- **What already exists.** `js/modules/wrm.js` has `frac_nl_equiv` (option on `equiv_frac_visual`: "equivalent fractions shown on stacked number lines"). The Y4 lane builds it for the same clause on Y4.B7.S9: `['frac_nl_equiv', 'frac_count']`, "equivalent fractions shown on two or more stacked number lines".
- **The rules.** BRIEF rule 3 says to reuse the existing id when it fits. Rule 13 says to reuse a proposal only if it really closes the step.
- **Grade.** The build would not make the step full. **7.** r10 graded it 8.

### Minors (none changes a grade)

| # | Where | Note |
|---|---|---|
| M6 (r12, still open) | Y3 inch-ruler lessons (Shorter by, Longer by, Record in a table, Compare units) | `reading_ruler` cites "Y3.B5.S2 Measure in millimetres" under the nearest-live-practice marker. Citing Y2.B6.S1 (the Grade 1 inch ruler) would read better |
| M8 | Y2.B3.S12 related `number_pattern {band:50}` | "a repeating pattern of numbers" is the r12 M3 class, fixed only on Y2.B11.S5. The items are growing patterns ("Find the rule": +3, +7, +9 to 55) and counting-order drags. Use the Y2.B11.S5 wording |
| M9 | Y2.B5.S17 related `money_count {currency:'usd'}` | "5-cent and 10-cent coins counted in 5s and 10s": 80 items are 1¢ ×14, 5¢ ×13, 10¢ ×26 and 25¢ ×27, so about half are pennies or quarters. Re-word as "coins of one kind" |
| M10 (gate only) | `denoms.mjs` `namedDens`; `claims.mjs` `negatedParts` / `NEGU` | A family word after "never" still counts as named (d4). "not X" is not read as a negation (X5). Money words ("no cents") are not negated units (X10) |
| M11 (gate class) | The sweep and the claim checks | They read pre / related whys and partial clauses, but not the step **title** against a `full` direct's items. N13 is that class: a title that names a representation ("as bar models", "on a number line", "arrays") should be checked like a cited title |

## 7. The sample

**Method.**
- **Items.** `dump.mjs` with the seeds of §1: 40 items for each direct / partial link, 16 for each pre or related link. I read every link, and the clauses on the counts above.
- **Random 20 per year.** `random.Random(161301)` for Y2 and `161302` for Y3, from the steps my filter judged ungraded in r10–r12. The filter matched fully qualified ids and the per-year table headings. It missed some r10–r12 table rows written without the year prefix, so a few re-drawn steps had been graded before: Y3.B6.S10 in r11, and B-numbers that appear in both years' tables. The brief only says to *prefer* new steps, and those steps were re-read here on fresh seeds.
- **Hard 5.** My own choice: the fraction partials whose clauses round 13 rewrote, the g / kg dials, the past / to time words, and the Y3 sharing, money and fraction-operations partials.
- **Lessons.** `random.Random(161303)` for Y2 and `161304` for Y3. No lesson changed in round 13 (diffed against r12 commit 98f9fad2), so no lesson was added as round-13-touched.

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r13c/`:
- `lib.mjs`, `dump.mjs` and the `d-*.txt` dumps;
- `dn.mjs` (my denominator walk), `nod.mjs` (non-denoms fraction links), `efv.mjs`, `idf.mjs`, `it.mjs`, `n9.mjs`;
- `dmut.mjs` and tree `d` (denoms mutations), trees `s1`–`s3` and their logs (SPECOPTS), `mutsw.mjs` (sweep);
- `b.sh`, trees `a`–`c` and their logs (reproducibility);
- `merge13.mjs`.

### Y2 (Grade 1) steps: mean 8.00

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **The r12 seven** | | | |
| B8.S12 Half and two quarters (W17) | partial | **8** | Clause true of the payload (§1). The pres are thin but true |
| **Hard 5** | | | |
| B8.S13 Recognise three-quarters (W17) | partial | 8 | Both clauses true. The note says why there is no related |
| B8.S10 Unit fractions (W18) | partial | 8 | Clause true (fifths among the pictures only) |
| B8.S8 Find a third (W31) | partial | 8 | Thirds and sixths only; "twelfths" is gone |
| B7.S2 Measure in grams (W34) | partial | 8 | Honest g / kg dial clause |
| B9.S4 Tell time to the hour (W37) | partial | 8 | words-past mixes "past" and "to" (five to eight, twenty to four): true |
| **r12 minor-touched** | | | |
| B1.S11 Estimate on a number line (W3) | partial | 8 | The self-repeating lead is gone. Tens to 100 leads |
| B11.S2 Describe movement (W19) | gap | 8 | No related, and the note says why |
| B11.S4 Movement and turns (W19) | gap | 8 | Half past as a half turn |
| B11.S5 Shape patterns with turns (W20) | gap | 8 | The related why is true now |
| **Random 20** | | | |
| B2.S3 Related facts (W10) | full | 8 | |
| B2.S6 Add by making 10 (W10) | full | 8 | Bonds to 10 lead |
| B5.S4 The multiplication symbol (W28) | full | 8 | |
| B5.S3 Add equal groups (W28) | full | 8 | |
| B2.S2 Fact families within 20 (W9) | full | 8 | |
| B5.S16 Divide by 5 (W31) | full | 8 | The 5 times-table leads |
| B8.S2 Equal and unequal parts (W16) | gap | 8 | |
| B5.S12 Odd and even numbers (W30) | full | 8 | |
| B3.S12 Patterns with 2-D and 3-D shapes (W14) | partial | 8 | Honest clause. M8 on the related |
| B3.S4 Draw 2-D shapes (W13) | gap | 8 | |
| B5.S8 Equal groups, sharing (W29) | partial | 8 | Grouping only, said |
| B10.S3 Block diagrams (W25) | partial | 8 | |
| B5.S5 Multiplication sentences (W28) | full | 8 | |
| B5.S10 Divide by 2 (W30) | full | 8 | |
| B5.S17 The 5 and 10 times-tables (W26) | full | 8 | M9 on the related |
| B10.S6 Draw pictograms (2, 5, 10) (W37) | partial | 8 | |
| B2.S7 Add three 1-digit numbers (W10) | full | 8 | |
| B7.S9 Temperature (W22) | full | 8 | `{forms:[1]}` reads °C |
| B8.S7 Recognise a third (W31) | full | 8 | |
| B5.S14 Divide by 10 (W31) | full | 8 | The "÷2: every multiple of 10 is a multiple of 2" rung is thin but true |

Sum 240 / 30 = **8.00**.

### Y3 (Grade 2) steps: mean 7.93

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **r12-touched** | | | |
| **B6.S9 Equivalent fractions on a number line (W37)** | partial | **7** | **N14**: the build `frac_count` does not close "two number lines"; `frac_nl_equiv` exists. The pre why is true now |
| B6.S8 Count in fractions on a line (W37) | gap | 8 | The pre why is true now |
| B8.S2 Subtract fractions (W37) | partial | 8 | "the families deal eighths and tenths": /8 ×8, /10 ×9 |
| B7.S10 Compare capacity and volume (W18) | gap | 8 | The sign related is true |
| **Hard 5** | | | |
| B8.S1 Add fractions (W37) | partial | 8 | |
| B8.S6 Fractions of an amount, reasoning (W38) | partial | 8 | |
| B3.S5 Sharing and grouping (W30) | partial | 8 | ÷6 / ÷7 in the stories named |
| B9.S4 Subtract money (W19) | partial | 8 | |
| B6.S5 Compare and order non-unit fractions (W36) | partial | 8 | |
| **Random 20** | | | |
| B3.S7 Divide by 3 (W31) | full | 8 | |
| B6.S1 Denominators of unit fractions (W26) | partial | 8 | Non-unit items 52/80, numerator items 12/80; 5/9 occurs (5 in 400) |
| B10.S11 Units of time (W22) | gap | 8 | |
| B6.S4 Understand the whole (W27) | partial | 8 | |
| B6.S6 Fractions and scales (W27) | gap | 8 | |
| B2.S9 Subtract 10s across 100 (W5) | gap | 8 | |
| B1.S8 Hundreds, tens and ones (W2) | full | 8 | |
| B1.S13 Order numbers to 1,000 (W3) | full | 8 | |
| B2.S22 Make decisions (W8) | gap | 8 | |
| B5.S9 Subtract lengths (W15) | gap | 8 | |
| B11.S10 Make 3-D shapes (W28) | gap | 8 | The `ruler_cm` preBuild is a stretch |
| B11.S8 Draw polygons (W29) | gap | 8 | |
| B7.S9 Equivalent capacities, l and ml (W34) | partial | 8 | Decimals (1.5 L, 0.5 L) named |
| B12.S4 Draw bar charts (W25) | full | 8 | |
| B8.S3 Partition the whole (W38) | gap | 8 | |
| B3.S12 Multiply by 8 (W31) | full | 8 | The 4s lead (double to 8s) |
| B2.S16 Subtract across a 100 (W7) | partial | 8 | |
| B12.S1 Interpret pictograms (W23) | full | 8 | |
| **B6.S10 Equivalent fractions as bar models (W37)** | full | **7** | **N13**: circles on 80 of 80 items; `{model:['bar']}` exists and deals bars on 40 of 40 |
| B1.S5 Represent numbers to 1,000 (W1) | full | 8 | |

Sum 230 / 29 = **7.93**.

### Lessons: 12, mean 8.00

**Y2 (Grade 1), 6 lessons: 48 / 6 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| One-step word problems within 20, bar models (W03) | partial | 8 | Both clauses true (the r13 sweep reads the stories) |
| Compare mass (1) (Support) | full | 8 | The note says why there are few pres |
| Bonds to 10 (Support) | full | 8 | |
| Select money, US (above) | partial | 8 | |
| Count on to 120 (W08) | partial | 8 | `chart_120` |
| Doubling (up to 5+5) (Support) | partial | 8 | |

**Y3 (Grade 2), 6 lessons: 48 / 6 = 8.00.**

| Lesson | Verdict | Score | Finding |
|---|---|---|---|
| Measure a set of objects (W17) | partial | 8 | |
| Even and odd, fair shares (Support) | partial | 8 | |
| Share equally (Support) | partial | 8 | Grouping only, said |
| Shorter by, bar models (W18) | gap | 8 | M6 |
| Line plot of measurement data (W18) | partial | 8 | |
| Count money, notes and coins (Support) | full | 8 | |

## 8. Fix list

### A. Step fixes

| Step | Fix |
|---|---|
| **Y3.B6.S10** (N13) | Direct `fractions:equiv_frac_visual {model:['bar']}` (a tagFix with these opts). Optionally carry `model:['bar']` on its "as it was met then" pre too |
| **Y3.B6.S9** (N14) | Build `frac_nl_equiv` (reuse; `wrm.js` WRM_PROPOSALS, and the Y4 lane has it for Y4.B7.S9) for "equivalent fractions shown on two number lines". Keep `frac_count` as a preBuild if wanted. Add Y3.B6.S9 to the proposal's steps |
| Y2.B3.S12 (M8) | Related why: use the Y2.B11.S5 wording (finding the rule of a growing number pattern), or drop the link |
| Y2.B5.S17 (M9) | Related why: "counting coins of one kind (1¢, 5¢, 10¢ or 25¢)" |

### B. Checks (lane tooling)

1. **M11:** claim-check every `full` direct against its step title, which names representations such as bar model, number line and arrays. This catches N13's class. Then scan the lane for other titles that name a representation a `model` option can deal.
2. **M10 (optional):** `namedDens` should count a family as named only in the positive part. `negatedParts` should read "not". `NEGU` should include money words.

### Expected scores

| Fix | Lifts | Step |
|---|---|---|
| A, row N13 | 1 seven | Y3.B6.S10 |
| A, row N14 | 1 seven | Y3.B6.S9 |

With both rows done, Y3 steps reach 8.00 and no graded step or lesson is below 8. Merge, reproducibility and site coverage already pass.
