# Y4 (Grade 3) tagging: independent critic, round 12

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 80e1d968. Data: `data/curriculum/links/Y4.json` (748 pre/related links, 592 unique key + opts + why; 157 tagFixes).

Scope:
- every r11 fix and every extra r12 change (r11 → r12 diff: 13 `why` changes, 3 step-field changes, 1 new link, 3 tagFixes, 1 proposal);
- the 32 automatic re-cites (`build.py` G18/G19);
- the two own11 "cited count not dealt" hits (`seq_10`);
- a fresh full scan of all 748 links, with every unique `why` read against its items;
- the tagFix list, read against `SKILL_WRM` as the lead will merge it;
- grades for the 22 touched steps plus a random 15.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r12/`. All seeds are new:

| Seeds | Scripts | What they do |
|---|---|---|
| `8810071 + 197i`, 150 items a link | `samp.mjs` → `s/*.txt`, `rc/*.txt` | Every changed link and every re-cited link on the print path: options, payload, visual and hint |
| `1203611 + 149i`, 150 items, all 748 links | `own12.mjs` → `own12.out`, `own12.json`; `uniq12.txt`, `slim12.txt` | Every own11 check, plus the r12 reads in §5 |
| `5550017 + 211i`, 150 items per direct/partial | `stepdump.mjs` | The graded steps' own direct and partial skills |
| — | `bld/` (a scratch copy of `build.py` that logs re-cites), `tfcheck.mjs`, `tf2.mjs`, `tf3.mjs`, `tagq.mjs` | The 32 re-cites, and the tagFix list read against `SKILL_WRM` |

Seeds used before (none reused): tagger `9100+17i`, `777+53i`, `31337+101i`, `4242+29i`, `61+7i`, `424243+59i`; r8 `50021+97i`, `31337+71i`; r9 `271828+163i`, `160001+37i`; r10 `600011+211i`; r11 `7300013+173i`, `913337+131i`.

## Verdict: FAIL

**The r11 fix list holds on fresh seeds (§1).**
- C′ is closed: all four labels are exact for their options.
- P is closed on B6.S3, S5 and S7.
- The two `why` texts are exact, and so are all the optional fixes.
- The tagger's checks reproduce:
  - `build.py` OK, 44 full / 64 partial / 21 gap, 32 re-cites;
  - `linkfit` 0 of 748.
- The two `seq_10` hits are false positives. All 150 items count in 10s, and the citation is honest (§3).

**New defects.** Most are older than r12, and fresh items or a new read found them.

| Class | Where | What is wrong |
|---|---|---|
| **N** (systematic: one mechanism in `build.py`) | 10 partial covers; B6.S7 | `build.py` derives tagFixes against `SKILL_WRM`. It reads a `{step, note}` entry, which is a FULL tag in wrm.js, as "partial with an empty clause". As a result, 10 skills that Y4.json calls **partial** stay **full** in `SKILL_WRM` after the merge. B6.S5's tagFix for `perimeter_grid` even says "re-tag as FULL (L-shapes on a grid)". A changed partial clause is never emitted either, so B6.S7 keeps the r11-falsified `SKILL_WRM` clause "side lengths given, not on a grid" |
| **B** (systematic: one skill's branch missed) | B8.S2, B8.S8, B9.S8 | `f_to_d` has a drag-bin branch, and the three partial clauses omit it. With `{denoms:[5]}`, 49 of 150 items sort tiles showing 50% / 75% (42 items) and 0.25 / 0.75 (39). With `{denoms:[2]}` it is 101 of 150. Percent is later-grade content, and quarters as decimals are W33 content. The clauses name only "fifths/tenths" or "eighths" |
| **R** (one step) | B2.S9 | Its direct `estimate_sums_diffs {place:1000, task:'reasonable'}` is `full`, but 56 of 150 items add two 4-digit numbers to a 5-digit sum (9,884 + 7,610 = 17,494; up to 19,191). The "not reasonable" answers reach 174,380. The year's add/sub skills hold answers within 10,000, and rule 7 makes this `partial` |
| **W/C** (isolated) | 4 links | B1.S8 `why` names steps the pupil meets in W33–W34 as "wk W11"; B5.S2 and B6.S1 cite titles their items do not deal; the B1.S3 hand tagFix tags `count_by_step_up {step:[0]}` FULL to Y2.B1.S15, which rule 9 makes partial (§6) |

**Scores.**
- Touched 22: mean 8.82. None below 8.
- Random 15: mean 8.73. One step at 7 (B2.S9).

The pass rule is not met:
- B2.S9 scores 7;
- there are two systematic classes (N, B);
- there are 4 isolated misfits, above the limit of 3.

## 1. The r11 fixes and the r12 changes on the print path (seeds 8810071 + 197i, 150 items a link)

| Change | Generated | Fit |
|---|---|---|
| C′ B1.S3 pre `count_by_step_up {step:[0], range:1000}` → "Y2.B1.S15 Count in 2s, 5s and 10s" | 40 count by 10s, 52 by 2s, 58 by 5s; 0 by 3s | Exact. Y2/Gr.1 "Count in 2s, 5s and 10s" is on the W18 prior-learning list. The hand tagFix it relies on is wrong in kind (§6, isolated 1) |
| C′ B2.S4 pre `add_10k_regroup {band:1000}` → Y3.B2.S14 (gap named) | Operand digits: 3+3 75, 2+3 33, 3+2 32, 2+2 10; 0 have 4 digits | Exact, and the gap is named |
| C′ B2.S7 pre `sub_10k_regroup {band:1000}` → Y3.B2.S16 (gap named) | 3+3 108, 3+2 42 | Exact |
| C′ B5.S12 pre `unit_form {band:99, rename:'more'}` → "Y2.B1.S5 Partition numbers to 100" | "2 tens 16 ones = ___", maximum 98, 0 hundreds | Exact. It is tagged |
| P B6.S3 direct `perimeter_grid {forms:[0,1]}` | 150 of 150 count edges (86 rectangles, 64 L-shapes); 0 decimals | Exact. Stays `full` |
| P B6.S5 partial `perimeter_grid {forms:[1,3]}` "L-shapes only (six sides), counted on a grid or with written whole-number sides; no T- or U-shapes" | 105 L-shapes counted on a grid, 45 written L-shapes (6 sides), 0 decimals | Exact. The verdict and missing clause are honest. Minor: `composite_shapes {forms:[0]}` does deal whole-sided T/U-shapes (38 of 78 eight-sided items), mixed with half-unit ones. The missing piece is "held to whole sides", which `composite_whole_sides` closes |
| P B6.S7 `perimeter_grid {}` clause "every side length is given (counted on a grid, or written on rectangles and L-shapes)…" | 58 rectangles and 40 L-shapes on a grid, 35 written rectangles, 17 written L-shapes | Exact. **But the old `SKILL_WRM` clause is never replaced (class N)** |
| `composite_whole_sides` narrowed to T/U; B6.S7 `closes` | — | Rule 13/16 now met. `closes` is the step's clause |
| B6.S3 new pre `perimeter_grid {}` "Y3.B5.S11 Measure perimeter" | 98 counted, 35 written rectangles, 17 written L-shapes | The title is dealt by 98 of 150. Minor: it repeats the step's own direct key with a wider option set (§7) |
| W B5.S8 rel `repeated_add_to_mult` "3 + 3 + 3 + 3 = 4 × 3" | Facts n × m, both ≤ 6 | Exact |
| W B1.S4 pre `count_by_step_up {step:[0]}` "counting on in 2s, 5s and 10s to 1,000" | As B1.S3; maximum 1,040 | Exact |
| Optional B7.S4 `place_on_number_line {}` → Y1.B12.S4 "The number line to 100" | Lines are 10-wide pieces from 10–20 to 90–100 | Exact |
| Optional B8.S3 / B8.S9 `place_value_disks {band:99}` "(…; tens and ones)" | Two zones, maximum 99 | Exact |
| Optional B4.S2 `count_by_tables {constant:[3]}` → "Y3.B3.S8 The 3 times-table" | Count by 3 to 36 | Exact. It is tagged |
| own11: `mult_facts {band:100}` "products to 100" (6 steps) | Maximum product 90–100, factors ≤ 10 | Exact |
| own11: B5.S9 `mult_facts {}` "through the 12s table" | Factors to 12, products to 144; B5.S9 is W17, after the 11s and 12s (W03) | Exact |
| own11: B5.S15 rel `mult_zeros {forms:[0]}` "nine 7s is ten 7s take away one 7" | n × 10 only | Fair related link |
| own11: **B1.S8 pre `value {band:9999}`** "the value of each digit up to the thousands (Y3.B1.S8 extended by Y4.B1.S5-S6, wk W11)…" | 4-digit place values, e.g. 7,563 → 7,000 | **The content is the r11-accepted superset, but the `why` names Y4.B1.S5 and B1.S6 as if met by W11. On the Grade 3 sheet they are W33 ("Represent numbers to 10,000") and W34 ("Partition numbers to 10,000"). Isolated 2** |

## 2. The 32 re-cites

I re-ran a scratch copy of `build.py` that logs each re-cite. Its output is byte-identical to the committed Y4.json, but only with `PYTHONHASHSEED=0` (see §7, tooling).

The 32 are 15 re-cites to a tagged step and 17 labels that keep the xlsx title and name the gap.

| Re-cite (15) | Tag | Week | Title vs fresh items |
|---|---|---|---|
| B1.S3, B8.S7 `hundreds_chart_fill` → Y1.B12.S1 Count from 50 to 100 | full | lower grade | The windows run 1–100, and 78 of 150 lie in 51–100 (the r11 minor, unchanged) |
| B1.S7, B9.S4 `unit_form {band:999, rename:'more'}` → Y3.B1.S8 HTO | note band 999 | lower grade | "6 hundreds 19 tens = ___": fits. The tie with Y3.B1.S6 is broken by hash order (§7) |
| B2.S9 `place_on_number_line {span:100, band:1000}` → Y3.B1.S10 Number line to 1,000 | partial | lower grade | 100-wide pieces of 0–1,000: exact |
| B5.S7 `value {}` → Y3.B1.S8 HTO | note band 999 | lower grade | Maximum 985: exact |
| B6.S5, B6.S7 `perimeter_intro` → Y3.B5.S10 What is perimeter | full | lower grade | Rectangles with all sides written: fits |
| B7.S6, B7.S10, B8.S4 `fraction_number_line` → Y3.B6.S7 Fractions on a number line | full | lower grade | Denominators 2–8; 32 of 150 are fractions above 1 (lines 0–3), which the Y4.B7 fraction weeks have already met: fits |
| B9.S4 `expand {band:99}` → Y2.B1.S8 Write numbers to 100 in expanded form | note band 99 | lower grade | Exact |
| B11.S2 `time_fives_ring` → Y2.B9.S5 Tell the time to 5 minutes | full | lower grade | The 5-minute marks round the clock: fits (as r11) |
| B12.S4 `shape_attributes` → Y4.B12.S6 Polygons | Y4 partial | W27 ≤ W28 | Fits |
| B13.S1 `pictograph_intro` → Y2.B10.S5 Interpret pictograms (1-1) | full | lower grade | `scale:1` in 150 of 150: exact |

**The 17 gap-named labels** cover:
- `between_tens` (3);
- `nearest_10`;
- `base10_regroup`;
- `number_families_mult` (2);
- `estimate_products` (2);
- `add_column_multi` (2);
- `tape_diagram {band:50}` (2);
- `fraction_nl_drag` (3);
- `sub_100_mixed`.

These are the same 17 that r11 accepted, with unchanged links. Each one keeps the xlsx prior-learning title and states that the skill is not tagged there. I generated all of them fresh: sizes are ≤ 100 (`add_column_multi` ≤ 326), `fraction_nl_drag` uses denominators 3–8, and `tape_diagram` stays ≤ 50.

**All 32 pass on tag, school week and title.** `cite.mjs` logic (`tagq.mjs`) finds no pre that is untagged and silent.

## 3. Ruling: own11's "cited count not dealt" on `seq_10` (B2.S8 @100, B5.S3 @1000)

The tagger counted 112 and 104 of 150 items stepping by 10. The other third are not something else: they are the 39 **drag-in-order** items, whose tiles are a run of 4–5 numbers exactly 10 apart (for example 37, 47, 57, 27, 17), with the hint "Each step subtracts 10".

On the fresh seeds:

| Link | "Complete:" sequences | Drag-in-order | All steps exactly 10 | All terms multiples of 10 | Maximum |
|---|---|---|---|---|---|
| B2.S8 `seq_10 @100` | 111 | 39 | **150 / 150** | 17 / 150 | 130 |
| B5.S3 `seq_10 @1000` | 111 | 39 | **150 / 150** | 20 / 150 | 1,024 |

**Ruling: the citation is honest.** Every item counts in 10s. The scan's regex read neither the `+10→` arrows nor the tiles, and own12's widened read finds 0 misfits.

Most items count on in 10s **from any number** (23, 33, 43), not along the multiples. For a pre at W16 (efficient subtraction, ×10), that is the more useful form, so it is not a misfit. An optional label: "Y1.B9.S2 Count in 10s (prior learning wk W16; counting on in 10s from any number)".

The same applies to B5.S4 `seq_10` and to B11.S2 / B13.S1 `seq_5`. These cite "Y2.B1.S15 Count in 2s, 5s and 10s" (the week's listed step) while dealing one count. That is minor and not counted.

## 4. The tagFix list read against `SKILL_WRM` (class N)

The lead merges tagFixes into `SKILL_WRM`, so they must turn today's tags into what Y4.json says. They do not:

```
build.py (tag-fix derivation)
    cur[(k, sid_)] = None if isinstance(e, str) else e.get('partial', '')
```

In wrm.js, `{step, note}` is a FULL cover (the header comment at line 28). The line above maps it to `''`, which the derivation treats as "already partial". Two things follow:

1. **10 partial covers get no `partial` tagFix and stay full after the merge** (`tfcheck.mjs`):
   - B1.S8 `more_less_100` (note "1, 10, 100 and 1,000");
   - B6.S2 `length_metric` ("km and m");
   - **B6.S5 `perimeter_grid` ("L-shapes")**. Its emitted tagFix is `action:"opts"`, with the stale hand `why` "re-tag as FULL (L-shapes on a grid)": the opposite of the step;
   - B8.S1 `write_fraction`;
   - B8.S2 `f_to_d`;
   - B8.S5 `place_value_10x`;
   - B8.S6 `place_value_10x`;
   - B8.S8 `f_to_d`;
   - B8.S10 `place_value_10x`;
   - B9.S8 `f_to_d`.
2. **34 `full` actions sit on tags that are already full** (`tf2.mjs`). They are harmless in effect, because they carry the opts, but 17 of them have the default `why` "tagged partial; …", which is false.

A second gap: a partial → partial change of clause is never emitted (`elif opts: … else: continue`). Of the 18 such stale clauses (`tf3.mjs`), 17 are paraphrases. One is now false: **B6.S7 `perimeter_grid`**. Its `SKILL_WRM` clause, "rectilinear shapes with side lengths given, not on a grid", is exactly what r11 showed the skill deals.

## 5. Full scan (own12, seeds 1203611 + 149i, 748 links × 150)

Every own11 check is kept.

**r12 reads added:**
- every Y4 step id named anywhere in a `why`, including "Y4.Bx.Sa-Sb" ranges, against the step's week;
- a cited "Count in Ns" read from `by N`, `+N→` arrows, "adds / subtracts / increases by N", `"step":N`, and tiles N apart, at 90% or more;
- the share of those items on multiples.

**Results:**
- All own10 and own11 checks give nothing beyond the ruled false positives:
  - 100 + 1 ÷10 / ÷100 hits on B5.S6 and B6.S2 (r11 §3);
  - the two `seq_10` regex hits (§3).
- Clear:
  - customary units, negatives, degrees, percent in pre/related links, GCF, ratio, nets/volume/probability;
  - denominators over 12, unlike-denominator ±, decimal ±, thousandths;
  - quarters as decimals before W33, decimals in visuals before W29;
  - column layouts before their week, untaught tables in every form, story divisors;
  - 2-digit × 2-digit, area before W18, line spans, cited 4-digit / hundreds / line range.
- r12 cited count (90% bar): 0 misfits. Multiples share: see §3.
- r12 "why names a later Y4 step": **B1.S8** (isolated 2). The other 3 hits are related links naming the next step ("wholes beyond 1 (Y4.B7.S6)", "the inverse (Y4.B7.S15)", "tenths on a number line (Y4.B8.S4)"), as rule 5 allows. Their content was cleared in earlier rounds.

**Reading all 592 unique `why` texts against their items** (`slim12.txt`: why plus 2 items each; `uniq12.txt` marks the 14 NEW) found two cited titles the items do not deal. No scan reads either one:

| Step [wk] | Link | Cited | Fresh items | Since |
|---|---|---|---|---|
| **B5.S2 [W05]** Use factor pairs | pre `mult_facts {constant:[10], band:100}` | "Y4.B4.S11 **Multiply by 1 and 0**" | 10 × n for n = 0–10. Only 33 of 150 are × 1 or × 0 (10 × 1, 10 × 0); the rest are the 10 times-table | r6 (isolated 3) |
| **B6.S1 [W36]** Measure in km and m | pre `place_value_10x {op:'x', power:[1000], band:10000}` | "Y4.B5.S4 **Multiply by 100**" | **150 of 150 are "N × 1,000"**; 0 are × 100 | r4 (isolated 4) |

Minor reads (not counted):
- B3.S2 rel `perimeter_grid {}` says "counting edges on the same grid", and B14.S4 rel says "counted square by square". In both, 98 of 150 items are counted and 52 have written sides.
- The other `perimeter_grid {}` labels cite titles their items deal.

## 6. Scores (rules 18–19 and step honesty; the r5–r11 scale)

| Score | When |
|---|---|
| 9 | Clean |
| 8 | One related link misfits, a `why` overclaims or cites a title the link never deals, one false or incomplete partial clause, or one wrong tagFix for the step |
| 7 | A pre link misfits in content, the step's own verdict or missing clause is wrong, or two or more misfits |

**Touched steps (22): mean 8.82.**

| Score | Steps |
|---|---|
| 9 (18) | B1.S4, B2.S4, B2.S7, B4.S2, B4.S13, B5.S1, B5.S8, B5.S9, B5.S12, B5.S14, B5.S15, B6.S3, B6.S8, B7.S4, B7.S7, B7.S10, B8.S3, B8.S9 |
| 8 (4) | **B1.S3**: the hand tagFix tags `count_by_step_up {step:[0]}` FULL to Y2.B1.S15. Only 91 of 150 items keep every answer on a multiple of the step (381, 386 …), and at Max Number 100 answers reach 190. Rules 7 and 9 make it partial, like the skill's own Y2.B1.S16 tag ("the skill steps from any number"). **B1.S8**: the `why` names W33–W34 steps as "wk W11". **B6.S5**: its `perimeter_grid` partial is left full in `SKILL_WRM`, with a "re-tag as FULL" `why` (N). **B6.S7**: the stale false `SKILL_WRM` clause is not replaced (N) |

**Random 15 (Python `random.seed(20261212)`, sampled from the 107 untouched steps): mean 8.73.**

| Score | Steps |
|---|---|
| 9 (12) | B1.S2, B1.S14, B1.S16, B2.S3, B4.S10, B4.S12, B5.S3 (`seq_10` honest, §3), B7.S15, B10.S3, B10.S4, B11.S4, B13.S3 |
| 8 (2) | **B8.S8** and **B9.S8**: the `f_to_d` partial clause omits the bin-sort branch (B) |
| **7 (1)** | **B2.S9**: direct `estimate_sums_diffs {place:1000, task:'reasonable'}` is `full`, but 56 of 150 items have 5-digit true sums (to 19,191) and the "not reasonable" answers reach 174,380. The year's own add/sub band (`add_10k_*`) stays within 10,000, and r6 already dropped this skill and option from related links for its 16,000 sums. The step's own verdict is over-generous (rule 7) |

The pass rule is not met:
- B2.S9 scores 7;
- N and B are systematic classes;
- there are 4 isolated misfits (B1.S3 tagFix, B1.S8, B5.S2, B6.S1), above the limit of 3.

## 7. Minor and tooling (not counted)

- **`build.py` is not reproducible.** The re-cite tie-break runs `min()` over a `set`, so string-hash order decides ties. Under `PYTHONHASHSEED` 1, 4, 7, 8 and 9, two labels flip between "Y3.B1.S8 Hundreds, tens and ones" and "Y3.B1.S6 Partition numbers to 1,000": B1.S7 and B9.S4 pre `unit_form {band:999, rename:'more'}`. Both labels are honest, but a re-run can change the data. Fix: `best = min(sorted(cands), key=…)`.
- **B6.S3 pre `perimeter_grid {}`.** This is the step's own direct key with a wider option set. 52 of 150 items are written-side calculations, and 17 of them are L-shapes (B6.S5 content, W20). Optional: make it `{forms:[0]}`, "Y3.B5.S11 Measure perimeter (rectangles counted on a grid)", or drop it. B6.S3 keeps 3 pre either way.
- **`perimeter_grid {}` related whys** that say "counting" (B3.S2, B14.S4). Optional: `{forms:[0,1]}`.
- **`hundreds_chart_fill` "Count from 50 to 100".** 78 of 150 windows lie in 51–100 (as r11).
- **`seq_10` / `seq_5` labels.** Optional wording "(counting on from any number)". "Count in 2s, 5s and 10s" is cited while the link deals one of the three counts (§3).

## Fix list (round 13)

**N. `build.py` tagFix derivation.**
1. Read a note-only entry as full:
   `cur[(k, sid_)] = None if isinstance(e, str) or 'partial' not in e else e['partial']`.
2. That emits `action:'partial'` with the step's clause for the 10 covers in §4:
   - B1.S8 `more_less_100`;
   - B6.S2 `length_metric`;
   - B6.S5 `perimeter_grid`;
   - B8.S1 `write_fraction`;
   - B8.S2, B8.S8 and B9.S8 `f_to_d`;
   - B8.S5, B8.S6 and B8.S10 `place_value_10x`.

   It also turns the 34 no-op `full` actions into `opts`.
3. Replace the stale hand `why` on B6.S5 `perimeter_grid` ("re-tag as FULL (L-shapes on a grid)") with "tagged full (note 'L-shapes'); the generated items teach only the six-sided shapes".
4. Emit a partial → partial clause change as `action:'partial'` when the clause differs from `SKILL_WRM`. At minimum, do it for B6.S7 `perimeter_grid`, with the r12 clause.
5. Add a check: after a simulated merge, every Y4 direct is full and every Y4 partial is partial (`tfcheck.mjs` is a template).

**B. The `f_to_d` bin branch in partial clauses.**

| Step | Skill / opts | Clause to add |
|---|---|---|
| B8.S2 [W29] | `f_to_d {denoms:[5]}` | "; 49 of 150 items are a drag-bin sort of halves and quarters as 50% / 75%, 0.25 / 0.75 and eighths or twelfths (percent is later-grade; quarters as decimals are W33)" |
| B8.S8 [W31] | `f_to_d {denoms:[5]}` | The same |
| B9.S8 [W33] | `f_to_d {denoms:[2]}` | "; 101 of 150 items are that bin sort, with percent tiles (25%, 50%, 75%) and twelfths" |

Also widen `dec_fraction_basics` (option on `f_to_d`): its `teaches` should say "convert one fraction; no percent bin sort". The alternative is a `_dragOrNot` form option on `f_to_d`, like `d_to_f`'s.

**R. B2.S9.**
1. Make `estimate_sums_diffs {place:1000, task:'reasonable'}` a partial. Clause: "4-digit sums pass 10,000 in 56 of 150 items (9,884 + 7,610 = 17,494) and the 'not reasonable' answers reach 174,380; the step stays within 10,000".
2. Verdict `partial`. Missing: "estimating 4-digit sums and differences, and judging answers, within 10,000".
3. Build: a new option proposal on `estimate_sums_diffs`, "operands, sum and shown answers held within 9,999". Give it a rule-13 short spec.
4. `{place:100}` stays direct. `{place:100, task:'reasonable'}` deals 3-digit items, with decoys to 7,340, and could be added as a second partial.

**Isolated.**

| # | Step | Link | Fix |
|---|---|---|---|
| 1 | B1.S3 (Y2.B1.S15 hand tagFix) | `count_by_step_up {step:[0]}` | Change the tagFix to `action:'add'` with `partial`: "counts on in 2s, 5s and 10s from any number (381, 386 …), not the multiples from 0; answers pass 100 even at Max Number 100 (to 190)". The B1.S3 label stays: a partial tag still counts as tagged |
| 2 | B1.S8 [W11] | pre `value {band:9999}` | → `value {band:999}`, "Y3.B1.S8 Hundreds, tens and ones (lower grade, same idea)". That is tagged (note band 999) and exact. To keep 4-digit values instead, drop "Y4.B1.S5-S6, wk W11" and say the thousands place is first met in this step |
| 3 | B5.S2 [W05] | pre `mult_facts {constant:[10], band:100}` | → "Y2.B5.S13 The 10 times-table (lower grade, same idea)". It is tagged, and B4.S4/S5 use the same label |
| 4 | B6.S1 [W36] | pre `place_value_10x {op:'x', power:[1000], band:10000}` | → `{op:'x', power:[100], band:10000}`, "Y4.B5.S4 Multiply by 100 (taught earlier this year, wk W17)", as on B5.S6. To keep ×1,000, cite free text instead: "× 1,000 by place value: the km → m move itself (Y4.B5.S3–S4 extended one place)" |

**Optional:** the items in §7, including sorting `cands` in `build.py`.

Then re-run `build.py --check` (under two `PYTHONHASHSEED` values, to confirm identical output) and `linkfit` on fresh seeds.
