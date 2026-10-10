# Y4 (Grade 3) tagging — independent critic, round 9

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at e768514b. Data: `data/curriculum/links/Y4.json` (765 pre/related links, 297 unique skill + opts).
Scope: the round-9 link changes, the B7.S7 / B7.S8 clause edits, rules 18–19 on every link, every `why` read against its items, and the blind spots of `linkfit.mjs`.
Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r9/`:
- `diff.mjs` / `diff.out`: the r8 → r9 diff;
- `samp.mjs`: print-path items for one link (option, tile and bin labels read), fresh seeds `271828 + 163i`, 100–200 items;
- `own9.mjs` / `own9.out` / `own9.json`: the r8 scan plus new checks (G11 concepts, fractions before W07, the `why` of every link, cited-step titles included), fresh seeds `160001 + 37i`, 150 items, all 765 links;
- `uniq.txt`: every unique link with all its `why` texts beside its item types (read in full);
- `chart.mjs`: chart blanks against the named rows, same fresh seeds.

None of these seeds are the tagger's (`9100+17i`, `777+53i`, `31337+101i`, `4242+29i`, `61+7i`) or r8's (`50021+97i`, `31337+71i`).

## Verdict: FAIL

- **The r8 fixes are in and clean on fresh seeds** (§1). `improper_mixed`, `mixed_shapes`, `probability_basic` and `round_fractions` are on no link; every replacement generates clean.
- **The tagger's checks reproduce:** `build.py --check` OK (45 full / 63 partial / 21 gap); `optcheck` 369 entries, 0 problems; `optchange` 0; `linkfit` 0 of 765. Every step has at least 3 pre and 1 related, with no key in both.
- **Fresh scans find 15 misfit links that `linkfit` and every earlier critic missed.** They fall into two systematic classes plus one isolated link (§2):
  - **T. The 11 and 12 tables before W03 (8 links, 3 pre).** `mult_div_fact_family {}`, `number_theory:multiples {}` and `nl_mult {}` deal 11 × 11, 11 × 12, 12 × 12, "multiples of 12 … 132, 144" and hops of 11 or 12 on the W02 steps B4.S4–S7.
  - **S. Story skills at their defaults (6 links, 1 pre).** They divide by 13–20, or multiply by 13–15: `div_word_problems {}` ×3, `remainder_interpret {}`, and `mult_word_problems {}` ×2. Two-digit divisors are Grade 5–6 content.
  - **Isolated:** `round_sort_tenths` on B9.S7 rounds hundredths to the nearest tenth, which is 5.NBT.A.4.
- **Eight `why` texts claim a table, family or move the items do not deal** (§3). Six of them, in class W, name one table on an all-tables skill: the class r8 raised and the tagger said G12 closes.
- **Scores.** Three touched steps score below 8: B4.S4 (6), B4.S7 (7) and B5.S14 (7). One random step does too: B4.S9 (7).

## 1. The r8 fixes and r9 changes on the print path (fresh seeds, 150 items per changed link)

| Change | Generated (seeds 271828 + 163i) | Fit (content, week, size, layout, `why`) |
|---|---|---|
| `improper_mixed` → `mixed_improper_visual {}` on B7.S3, S4, S5 (rel) and B7.S11, S12, S14, S15 (pre) | All 150: "Write this amount as a mixed number AND an improper fraction". Pizza model, denominators 2/3/4/5/6/8 (52/50/58/48/56/36), at most 4 wholes (39/8). No click-all, no denominator above 8 | Clean. The pre cite Y4.B7.S6 (W09), which is before every citing step (W10–W11). The related why "the same amount as a mixed number and an improper fraction" is exact. It is a forward link on W08, which is fine as related |
| B7.S7 / B7.S8 partial and missing clauses | — | Honest. They now name the 15ths–24ths click-all items, and "with denominators no larger than twelfths" is added to the missing clause and to `improper_mixed_dir`'s `closes`. Both verdicts stay partial |
| `mixed_shapes` dropped (B12.S5), `probability_basic` dropped (B5.S14) | — | B12.S5 keeps `shape_attributes` (1 related); B5.S14 keeps `mult_word_problems_plain {range:100}` |
| `round_fractions` dropped (B9.S7) | — | B9.S7's only related is now `round_sort_tenths`, which is itself a misfit (§2) |
| `mult_div_fact_family` dropped (B4.S8) | — | Right, but **the same skill stays on B4.S4 and B4.S7 (pre) and B4.S5 (rel), all W02**, where 11 × 12 is even further ahead (§2 T) |
| `div_word_problems {range:100}` (B5.S11) | Divisors 2–8 (÷7 26, ÷3 29 …), largest 56, no remainders | Clean. **The same `{}` → `{range:100}` fix was not carried to B4.S5, B4.S9 or B4.S10** (§2 S) |
| `graph_fractions {denoms:[2]}` (B7.S9 rel) | Halves, quarters and eighths only (/2 168, /4 98, /8 34), one 0–1 line | Clean, and the why is exact |
| `fraction_nl_drag {denoms:[2]}` (B7.S10 rel), why rewritten | /4 185, /8 171 | Exact: "one denominator a line" |
| `mult_word_problems` whys (B4.S2, S4, S7) and `place_on_number_line` whys (B6.S1, S2) | — | Honest now. But B4.S4's link is `{}`, with no range, and deals ×13–15 (§2 S) |
| `compose_whole {parts:[0]}` (B9.S8 pre) | Halves + quarters 55, quarters + eighths 38, all three 57 | Clean. Eighths were met in W07–W11 |
| `partition_shapes {parts:[2], forms:[0]}` (B9.S8 pre) | **All 150: "How many equal parts?" ⟹ 4** | The content is safe, but the `why` cites "Y2.B8.S3 Recognise a half" and no item shows a half (§3) |
| `money_notation {currency:'usd'}` (B9.S8 pre) | $ amounts $0.75–$8.80 built from notes and 25¢ / 10¢ / 5¢ coins; $0.75 in 25 of 150 | Fits W33 (hundredths are from W31), and quarters as $0.25 fit the step. Clean |

## 2. Misfits that `linkfit` cannot see

### T. The 11 and 12 tables at W02 from all-tables skills (8 links on B4.S4–S7)

The tagger's own `tablesBy` (and r5–r8) puts the 11s and 12s in W03 (B4.S9 / S10). The links below are all on W02 steps.

| Step [wk] | Link | What generating shows (150 fresh items) |
|---|---|---|
| B4.S4 [W02] | **pre** `mult_div_fact_family {}` | 6 of 150 items have both factors untaught: "Fact Family: 11, 11, 121", "11, 12, 132", "12, 12, 144". 43 more have one factor of 11 or 12. Confirmed with 7 of 200 on the samp seeds |
| B4.S7 [W02] | **pre** `mult_div_fact_family {}` | Same skill, same items |
| B4.S5 [W02] | rel `mult_div_fact_family {}` | Same items. The `why` admits "any table", but at W02 that means the 11s and 12s |
| B4.S5 [W02] | **pre** `multiples {}` (cites "Multiples of 5 and 10") | 19 of 150 are multiples of 11 or 12: "Fill in the missing multiples of 12 … 120, 132, 144" |
| B4.S4 [W02] | rel `multiples {}` ("multiples of 9") | Same: 19 of 150 are 11s or 12s, and only 23 of 150 are 9s |
| B4.S6 [W02] | rel `multiples {}` ("common multiples of 3, 6 and 9") | Same. No item asks for a common multiple |
| B4.S4 [W02] | rel `nl_mult {}` ("jumps of 9") | 37 of 150 hop in 11s or 12s ("8 × 11", 0, 11, 22 … 99). Hops of 9 appear in only 38 |
| B4.S7 [W02] | rel `nl_mult {}` ("jumps of 7") | Same items |

**Why `linkfit` and own8 passed these.** The untaught-table guard reads only `a × b` / `a ÷ b` text and mult-grid blanks. It does not read:
- "Fact Family: a, b, c";
- "multiples of n" or "Count by n";
- the hop-line payload `"step"`.

### S. Story and remainder skills at their defaults (6 links)

| Step [wk] | Link | Fresh items |
|---|---|---|
| B4.S5 [W02], B4.S9 [W03], B4.S10 [W03] | rel `div_word_problems {}` | 13 of 150 (9%) divide by 13, 14 or 15: "Leo has 130 apples … 13 in each basket", 117 ÷ 13, 126 ÷ 14, 90 ÷ 15 |
| B5.S13 [W36] | rel `remainder_interpret {}` | 67 of 150 (45%) divide by 13–20: "147 children … each car holds 15", "155 buttons … 17 in each bag" |
| B5.S14 [W06] | **pre** `mult_word_problems {}` | 5 of 150 multiply by 13–15 ("6 bags, 13 marbles each", 8 × 15). Two-digit × one-digit is W17 (B5.S9) |
| B4.S4 [W02] | rel `mult_word_problems {}` | Same items, at W02 |

- A two-digit divisor is 5.NBT.B.6 (WRM Y6), so it is not Grade 3 content in any week.
- `{range:100}` cleans all three skills (150 fresh items each):
  - `div_word_problems`: divisors 2–8, largest 56;
  - `mult_word_problems`: no factor above 12, largest 64;
  - `remainder_interpret`: divisors 3–12, dividends up to 119.
- The tagger applied this fix to the same skill on B5.S11, but not here.
- **Why `linkfit` passed these.** Its size limits are met (130 < 162), and its table guard only looks at divisors of 12 or less.

### Isolated: B9.S7 [W33] Round to the nearest whole number, rel `round_sort_tenths {}` ("rounding sort")

- All 150 items sort hundredths by the nearest tenth (0.61, 0.68 … into "rounds to 0.6 / 0.7"). That is 5.NBT.A.4 (WRM Y5).
- The step's own partial clause says round_decimals "rounds to the nearest tenth/hundredth; never to the nearest whole number". So the related link is the very thing the step record rules out.
- Linkfit's later-grade list has no rounding precision.

### Other scans: clean

`own9` (765 links × 150 fresh items, every r8 check kept) finds no hits for:
- customary units, negatives, degrees, percent, GCF / ratio / prime (only the 11 known "composite shape" false positives);
- nets, cross-sections, volume or probability;
- denominators above 12 (and none on any `improper_mixed` replacement);
- unlike-denominator ± or compares, decimal ±, thousandths;
- quarters as decimals before W33, fifths as decimals;
- column layouts before their week, 2-digit × 2-digit, or long division.

Fractions before W07: only B4.S12's related `whole_as_fraction`, which r8 accepted as a forward link.

## 3. `why` texts that do not match the items

| Step | Link | `why` | What it deals | Class |
|---|---|---|---|---|
| B4.S4 | `nl_mult {}` | "jumps of 9 on a number line" | Hops of 9 in 38 of 150 | W |
| B4.S7 | `nl_mult {}` | "jumps of 7 on a number line" | Hops of 7 in about 38 of 150 | W |
| B4.S4 | `multiples {}` | "multiples of 9" | 23 of 150 | W |
| B4.S6 | `multiples {}` | "common multiples of 3, 6 and 9" | No common-multiple item at all | W |
| B4.S9 | `multiples {}` | "multiples of 11" | 5–14 of 150 | W |
| B4.S10 | `multiples {}` | "multiples of 12" | 9–14 of 150 | W |
| B9.S8 | pre `partition_shapes {parts:[2], forms:[0]}` | "Y2.B8.S3 Recognise a half" | Fourths only: every answer is 4 | — |
| B1.S8 | rel `place_on_number_line {span:1000, band:10000}` | "jumps of 1,000 along a 0-10,000 line: the same move pictured" | "Tap 6,300 on the number line"; no jumps | — |

Minor: `money_notation {}` defaults to `currency:'plain'` (no $ sign), while its related whys on B8.S2, S6, S8, S9, S10 and B9.S3 name dollars, dimes and cents ("$3.45 = 3 dollars …"). Not counted.

**G12 gaps.** The G12 regex has no "jumps of N", "multiples of N" or "common multiples". It also skips every `why` that starts with a cited step, so a cited title that names a family or table the items never deal passes unchecked: B9.S8 is that case.

## 4. Scores (rules 18–19, links)

Scoring rule, as in r5–r8:
- 7 when a pre link misfits, or when a step has two or more misfit links;
- 6 when four or more of its links misfit;
- 8 when one related link misfits, or when a `why` overclaims;
- 9 when clean.

**Touched steps (22): mean 8.59.**

| Score | Steps |
|---|---|
| 9 (17) | B4.S2, B4.S8, B5.S11, B6.S1, B6.S2, B7.S3, B7.S4, B7.S5, B7.S7, B7.S8, B7.S9, B7.S10, B7.S11, B7.S12, B7.S14, B7.S15, B12.S5 |
| 8 (2) | B9.S7 (`round_sort_tenths`); B9.S8 (`partition_shapes` why) |
| 7 (2) | B4.S7 (pre `mult_div_fact_family`, and `nl_mult` hops of 11 / 12 with a "jumps of 7" why); B5.S14 (pre `mult_word_problems {}`: ×13–15 at W06) |
| **6 (1)** | **B4.S4**: pre `mult_div_fact_family`, plus related `nl_mult`, `multiples` and `mult_word_problems {}` |

**Random 15 (Python `random.seed(20261011)`, sampled from the 107 untouched steps): mean 8.80.**

| Score | Steps |
|---|---|
| 9 (13) | B1.S2, B1.S5, B1.S6, B5.S4, B5.S5, B5.S6, B7.S2, B7.S6, B7.S13, B10.S6, B11.S3, B11.S5, B12.S8 |
| 8 (1) | B1.S8 ("jumps of 1,000" why) |
| 7 (1) | B4.S9 (`div_word_problems {}` ÷13–15, plus the "multiples of 11" why) |

**Outside both samples:**
- B4.S5 scores 7 (pre `multiples`, related `mult_div_fact_family` and `div_word_problems {}`);
- B4.S10 scores 7;
- B4.S6 and B5.S13 score 8.

## Fix list (round 10, links only)

**T. The 11s and 12s before W03.**

| Step | Link | Fix |
|---|---|---|
| B4.S4, B4.S7 | pre `mult_div_fact_family {}` | → `multiplication:number_families_mult {}`, still citing Y3.B4.S6. Generated: products 25 or less, so factors up to 5. Neither step has it as related |
| B4.S5 | rel `mult_div_fact_family {}` | Drop it. `number_families_mult` is already its related |
| B4.S5 | pre `multiples {}` | → `multiplication:count_by_tables {constant:[5,10]}`, citing Y3.B3.S4 "Multiples of 5 and 10". Generated: counting by 5 in 75 items and by 10 in 75 |
| B4.S4 | rel `multiples {}` | → `multiplication:mult_chart {task:'fill', constant:[9], band:100}`, "the 9 row of the chart" |
| B4.S6 | rel `multiples {}` | → `multiplication:mult_chart {task:'fill', constant:[3,6,9], band:100}`, "the 3, 6 and 9 rows of the chart". Generated: 300 of 300 blanks are on a 3, 6 or 9 line, with a 4 × 5 window |
| B4.S4 | rel `nl_mult {}` | → `{constant:[9]}`. Generated: every hop is 9 |
| B4.S7 | rel `nl_mult {}` | → `{constant:[7]}`. Generated: every hop is 7 |

**S. Story defaults.**

| Step | Link | Fix |
|---|---|---|
| B4.S5, B4.S9, B4.S10 | `div_word_problems {}` | → `{range:100}` |
| B4.S4 (rel), B5.S14 (pre) | `mult_word_problems {}` | → `{range:100}` |
| B5.S13 | `remainder_interpret {}` | → `{range:100}` |

Each of these was checked on 150 fresh items (§2 S).

**Isolated.** On B9.S7, replace the related `round_sort_tenths` with `number_sense:round_sort_10 {}`, with the why "sorting by the nearer ten: the same halfway rule between two neighbours". Its items sort 71–79 into 70 or 80.

**`why` texts.**

| Step | Fix |
|---|---|
| B4.S9 | Replace `mult_chart {band:144}` and `multiples {}` with `mult_chart {task:'fill', constant:[11], band:144}`, "the 11 row and column of the chart" (300 of 300 blanks on 11) |
| B4.S10 | The same, with `constant:[12]` (every blank on the 12 line) |
| B9.S8 | Set `partition_shapes` to `{parts:[0,2], forms:[0]}`: halves and fourths, 65 and 55 of 120. This matches "Recognise a half" |
| B1.S8 | → "4-digit numbers placed on a 0-10,000 line (where 1,000 more lands)" |
| B8.S2, S6, S8, S9, S10 and B9.S3 | Optionally, add `{currency:'usd'}` to the related `money_notation` |

**`linkfit.mjs`.**
- **G13.** Read untaught tables in every form: "Fact Family: a, b, c", "multiples of n", "Count by n", and the hop-line `"step"`.
- **G14.** Flag a divisor of 13 or more, or a factor of 13–19 before W17, including the story payloads (`"op":"/","b":13`).
- **G15.**
  - Extend G12 to "jumps of N", "multiples of N" and "common multiples", and to the families and tables named in cited-step titles.
  - Count a count-parts answer of 4 as fourths.
  - Add rounding to the nearest tenth to the later-grade list.

Then re-run on fresh seeds.

**Lead (generators).**
- `mult_div_fact_family` and `number_theory:multiples` have no table option.
- `div_word_problems`, `mult_word_problems` and `remainder_interpret` deal factors and divisors above 12 at their default range.
