# Y4 (Grade 3) tagging — independent critic, round 8

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at f9835408. Data: `data/curriculum/links/Y4.json` (769 pre/related links).
Scope: the round-8 link changes, rules 18–19 on every link, and the blind spots of `linkfit.mjs`.
Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r8/`:
- `diff.mjs`: the r7 → r8 link diff;
- `samp.mjs`: 64–200 print-path items per link, with fresh seeds `50021 + 97i`;
- `own8.mjs`: the r7 scan plus four new checks, run over all 769 links. It uses fresh seeds `31337 + 71i`, at 40 items (`own8.out`) and at 150 items (`own8_150.out`);
- `templates.txt` / `templates2.txt`: every distinct item type of every unique link (298 unique skill + opts);
- `newsince_r4.txt`: every link new or re-worded since round 4, with its `why` text and its item types beside it;
- `chart.mjs`: the blanks and window of `mult_chart`;
- `own7run/`: the r7 scan re-run unchanged on the r8 data.

None of these seeds are the tagger's. `linkfit` uses `9100 + 17i` and `777 + 53i`.

## Verdict: FAIL

- **The r7 fixes are clean.** All 21 r7 misfits are gone, and every replacement generates clean on fresh seeds (§1).
- **The tagger's checks reproduce:**
  - `build.py --check`: OK (129 steps: 45 full, 63 partial, 21 gap);
  - `optcheck`: 364 entries, 0 problems;
  - `optchange`: 0 entries whose values change nothing;
  - `linkfit`: 0 misfits in 769 links;
  - `own7.mjs` unchanged on the r8 data: only the 11 "prime" hits, which are "composite shape" false positives.
- **Step-level fields are unchanged.** The only step field r8 touched is B12.S6's `note`, which was emptied as the r7 critic asked.
- **Fresh seeds find 9 misfit links that `linkfit` and the r5–r7 critics all missed:**
  - **R. `fractions:improper_mixed` on 7 links (4 of them pre).** It has a rare "Click ALL fractions equal to …" branch whose options include 15ths, 16ths, 18ths and 24ths, sometimes as the correct answer.
  - **2 later-grade concepts:** `mixed_shapes` (nets and cross-sections) and `probability_basic`.

  Class R is systematic (one generator branch, 7 links). Together with the other two, that is well past the bar of at most 3 isolated misfits.
- **One touched step scores 7:** B7.S11, which has the `improper_mixed` pre. The PASS bar allows no 7s on touched steps.
- **4 related links have a `why` that claims something the skill does not deal** (§4). Three of them, `graph_fractions`, `fraction_nl_drag` and the B4.S7 story label, came from swaps in r7–r8.

## 1. The r7 fixes on the print path (fresh seeds, 64 items per changed link)

| r7 class | Now | Generated (seeds 50021 + 97i) |
|---|---|---|
| **C**: `f_to_d` / `d_to_f` on 12 links | Gone. Replaced by `decimal_nl_drag {ticks:'some'}` (B8.S6, S8, S10, B9.S1, S4) and `write_fraction {denoms:[5]}` (B8.S9, B9.S2–S6, B10.S1) | `decimal_nl_drag`: 64 of 64 items are tenths 0.1–0.9 on a 0–1 line (n = 10, ticks 0 / 0.5 / 1 or 0 / 1). No hundredths, quarters or percent. `write_fraction {denoms:[5]}`: shaded bar, circle or area models with answers in fifths and tenths only (about 30 fifths and 34 tenths of 64). No decimals, no hundredths |
| `frac_10_100(_nv)` (r7 N2) | Gone from every link | — |
| **F**: `select_equiv_frac` on B7.S6–S9, `equiv_frac_nv` on B7.S9, `equivalent` form 0 on B7.S10 and B9.S8 | Gone. B7.S10 pre is `fraction_number_line` (Y3.B6.S9); B9.S8 pre is `compose_whole` (Y3.B6.S4) | No denominator above 12 in 150 items of either. `compose_whole` deals thirds and sixths too (see §4) |
| **D / U**: `sub_decimal` (B9.S2), `fraction_bar_ops` (B7.S11) | Gone (both keys) | — |
| N1: `add_decimal` on B9.S1, S3, S4 | Gone | — |
| B12.S6 | `shape_corners_count` added (Y2.B3.S3). `name_2d_shapes` is re-cited to Y3.B11.S7. Note emptied | 3–8 corners: honest. 3 pre now |
| N3: stories | `mult_word_problems{range:100}` / `_plain{range:100}` | Groups of 2–8, largest answer 64. The B4.S2 label is fixed; **B4.S7's "7 in a group" is the same overclaim and was not fixed** (§4) |
| N4: chart windows | `mult_chart {task:'fill', constant:[n], band:100}` (n = 3, 6, 9, 7, 1) | 192 blanks for each n, 0 off the named row or column, window at most 10 × 10 |
| New related links | `money_notation {usd}` on B8.S7, `graph_fractions` on B7.S9, `fraction_nl_drag {denoms:[2]}` on B7.S10 | All clean in content. The last two have wrong `why` text (§4) |

**Removal check.** No link in the file carries `f_to_d`, `d_to_f`, `select_equiv_frac`, `equiv_frac_nv`, `equivalent`,
`sub_decimal`, `fraction_bar_ops`, `add_decimal`, `frac_10_100*`, `percent*`, `order_fdp` or `estimate_frac_ops`.

**Fit of the replacements.**
- **Content and week (rule 19, xlsx "Grade 3" sheet).** Tenths are first taught as "Tenths as fractions", "Tenths as decimals" and "Tenths on a number line" in W29–W30. Every step that gained a replacement pre is W31–W37, so every replacement cites an earlier-taught step.
  - `fraction_number_line` (B7.S10, W10) and `compose_whole` (B9.S8, W33) cite lower grades.
  - `shape_corners_count` (B12.S6, W27) cites Y2.
- **Size and layout.** Tenths on a 0–1 line, and one shaded model per cell. Both are within what a W31+ pupil has met.
- **Pre counts.** Every step has at least 3 pre and at least 1 related, and no key is in both lists.
  - B9.S3 has exactly 3 pre: `expand`, `write_fraction` and `unit_form`.
  - B7.S6, S7 and S8 keep 4, 4 and 5 pre after `select_equiv_frac` was dropped.
- **Why text.** The replacement pre cite "Y4.B8.S1 Tenths as fractions" or "Y4.B8.S4 Tenths on a number line", and those are the steps whose own partial skills these are. `write_fraction {denoms:[5]}` is about half fifths, but it is B8.S1's own skill, so the citation is honest. (A label of "tenths and fifths as fractions" would be exact.)

## 2. New misfits that `linkfit` cannot see

### R. `fractions:improper_mixed {}`: rare multi-select items with 15ths to 24ths (7 links, 4 pre)

About 20% of items are "Click ALL fractions equal to a b/c". Their options include the mixed number scaled by 2 or 3:

| Mixed number | Scaled option | Correct answer? |
|---|---|---|
| 3 3/5 | 54/15 | **correct**: answer is opt0 + opt5 |
| 3 7/8 | 93/24 and 62/16 | **both correct** |
| 1 4/5 | 27/15 | correct |
| 2 5/6 | 51/18 | correct |
| 2 1/8 | 34/16 | — |
| 3 3/6 | 63/18 | — |
| 1 1/8 | 18/16 | — |

- **How often.** 14 of 200 items (7%) carry a denominator from 15 to 24. On a 6-item page that is about a 1-in-3 chance of meeting one.
- **The `denoms` option does not stop it.** Counts of such items in 200: `denoms:[2]` 15, `[3]` 7, `[5]` 29, `[2,3]` 13.
- **Why `linkfit` passed it.** Its 40 items reach this branch 8 times, and by chance every one stays at twelfths or below (`lfseed.mjs`). This is the same denominator class the r7 critic failed for `equivalent` form 0.

| Step [week] | Link |
|---|---|
| B7.S11 [W10] | pre (cites B7.S8) |
| B7.S12 [W10] | pre (cites B7.S7) |
| B7.S14 [W11] | pre (cites B7.S7) |
| B7.S15 [W11] | pre (cites B7.S8) |
| B7.S3, B7.S4, B7.S5 [W08] | related |

### Later-grade concepts (2 links, both from round 4 or earlier)

| Step [week] | Link | What generating shows (150 items) |
|---|---|---|
| B12.S5 [W28] Quadrilaterals | rel `shapes_classify:mixed_shapes {}` ("mixed classification") | 52 of 150 items: 26 are "What 2D shape is the cross-section when this cylinder / prism / sphere is sliced …" (7.G.A.3), 26 are "Which net folds into a cube / square pyramid / triangular prism" (6.G.A.4, WRM Y6). The rest are the step's own `classify_quads` / `hotspot_quads` plus `classify_triangles` |
| B5.S14 [W06] Correspondence problems | rel `probability:probability_basic {}` ("listing outcomes") | "A jar has 3 pink, 5 white, 4 brown candies. What is the probability of picking a brown one? → 4/12". Also "Click ALL events with probability greater than 1/2" and likely / unlikely / certain bins. This is probability (7.SP), written as a fraction in W06, before the fractions block (W07). No item lists outcomes, so the `why` is false |

**What else the scans showed** (one new check is described in §3):
- **The full 150-item scan found 4 other flags, all margins or accepted:**
  - `mult_div_fact_family` "12, 12, 144" on B4.S8 [W03]: the 12s are taught in W03;
  - `div_word_problems` 150 ÷ 10 on B5.S11: 150 against a limit of 148.5;
  - `partition_shapes` thirds and `benchmark_fractions` eighths on B9.S8: met by W33 (fractions block W07–W11), and accepted in r7.
- **Every other class is clean (0 hits in 769 links × 150 items):**
  - unlike-denominator ±, decimal ±, thousandths, percent, fifths ↔ decimals, quarters as decimals before W33;
  - customary units, negatives, degrees, GCF / ratio / prime, reflection in an axis, 2-digit × 2-digit;
  - untaught tables, and column layouts before their week.

## 3. `linkfit.mjs` round 8: the claims and the gaps that remain

- **G7–G9 are closed as claimed.** Option, tile and bin labels are read; `?/n`, `_/n` and `"den"` are read; the guards for unlike-denominator ±, decimal ±, fifths ↔ decimals, quarters before W33 and 4-digit column ± before W14 are present. "0 of 769" reproduces.
- **G10. Rare branches.** Two seed sets of 20 items are too few for a branch that deals bad content in 7% of items. A run of 769 links × 150 items takes about 50 s.
- **G11. Concept list.** The later-grade list has no nets, 3-D cross-sections, solids, or probability / likelihood. There is also no guard for fractions (a/b) in a pre before W07.
  - My scan of fractions before W07 found two more items, which are not counted:
    - `patterns:halve` on B5.S11: "half of 22";
    - the related `whole_as_fraction` on B4.S12 [W04]: a forward link with a plausible `why`.
- **G12. `why` text.** Nothing checks a `why` against the items. Class R would have been visible to a reviewer reading "mixed ↔ improper", and §4 lists 5 such claims that are false or too broad.

## 4. `why` text that does not match what the skill deals (not counted as misfits; fix with the relinks)

| Step | Link | `why` | What it deals |
|---|---|---|---|
| B7.S10 [W10] | rel `fraction_nl_drag {denoms:[2]}` (new in r8) | "quarters and eighths placed on one line: 2/4 and 4/8 share a point" | Each line has one denominator (n = 4 or n = 8). 2/4 and 4/8 never appear on the same line |
| B7.S9 [W09] | rel `graph_fractions {}` (new in r8) | "fractions marked on a line (halves to eighths): equal ones land on one point" | One fraction per line. The default denominators include thirds and sixths (20 and 6 of 64). No equivalence is shown |
| B4.S7 [W02] | rel `mult_word_problems {range:100}` | "equal-groups stories with 7 in a group" | Groups of 2–8, rarely 7. This is the r7 N3 overclaim, fixed on B4.S2 only |
| B6.S1, B6.S2 [W36] | rel `place_on_number_line {span:1000, band:10000}` | "distances in metres placed on a 0-10,000 line" | Bare 4-digit numbers, no units |
| B9.S8 [W33] (minor) | pre `compose_whole {}` | "Understand the whole" on a halves-and-quarters step | Half the items are thirds and sixths. `{parts:[0]}` deals halves, quarters and eighths only (checked: 40 items) |

**Pre order.** Rule 14 puts the main building block first, and I accepted that. For the record, 12 steps' Y4 tiers are not
strictly nearest-week-first; there were 10 in r7. The 2 new ones (B8.S8, B9.S4) list the earlier B8.S1 citation before B8.S4. Both are W29–W30, so this is harmless.

## 5. Scores (rules 18–19, links)

Scoring rule, as in r5–r7:
- 7 when a pre link misfits, or when a step has two or more misfit links;
- 8 when one related link misfits, or when a `why` overclaims;
- 9 when clean.

**Touched steps (30): mean 8.77.**

| Score | Steps |
|---|---|
| 9 (24) | B4.S1, S2, S3, S5, S8, S11; B6.S8; B7.S6, S7, S8; B8.S6, S7, S8, S9, S10; B9.S1, S2, S3, S4, S5, S6; B10.S1; B10.S5; B12.S6 |
| 8 (5) | B4.S7 (`why`); B5.S14 (`probability_basic`); B7.S9 (`why`); B7.S10 (`why`); B9.S8 (`compose_whole` thirds and sixths) |
| **7 (1)** | **B7.S11** (pre `improper_mixed`) |

**Random 15 (Python `random.seed(20261010)`, sampled from the 99 untouched steps): mean 8.87.**

| Score | Steps |
|---|---|
| 9 (13) | B1.S6, B2.S5, B2.S6, B3.S3, B4.S6, B5.S5, B5.S6, B5.S8, B5.S9, B5.S15, B11.S3, B13.S4, B14.S4 |
| 8 (2) | B6.S1 (`why`: "metres"); B12.S2 (pre `name_2d_shapes` cites a Reception shapes step on an angles step: weak, but met) |

**Outside both samples:**
- B7.S12, B7.S14 and B7.S15 score 7 (pre `improper_mixed`);
- B7.S3, B7.S4, B7.S5 and B12.S5 score 8 (one related misfit each).

## Fix list (round 9, links only)

1. **Class R.** On all 7 links, replace `fractions:improper_mixed` with `fractions:mixed_improper_visual {}`.
   - Checked on 150 fresh items: every item is "Write this amount as a mixed number AND an improper fraction", with denominators 2, 3, 4, 5, 6 and 8 only. That covers both directions.
   - The pre on B7.S11, S12, S14 and S15 should cite Y4.B7.S6 "Understand improper fractions" (W09).
   - The related on B7.S3, S4 and S5 should read "the same amount as a mixed number and an improper fraction". This is a forward link and is fine as related.
   - B7.S11 keeps 3 pre.

   **Lead (generator).** In `improper_mixed`'s "Click ALL fractions equal to" branch, scale only while the denominator stays at 12 or below, and honour `denoms`. The skill is also B7.S7's and B7.S8's own partial skill, so this protects the direct items too.
2. **B12.S5.** Drop the related `shapes_classify:mixed_shapes`; `shape_attributes` remains.

   **Lead (generator):** `mixed_shapes` pools nets and cross-sections with no option to exclude them.
3. **B5.S14.** Drop the related `probability:probability_basic`; `mult_word_problems_plain {range:100}` remains.
4. **`why` text.**

   | Step | Link | Change |
   |---|---|---|
   | B7.S10 | `fraction_nl_drag {denoms:[2]}` | → "quarters or eighths placed on a 0–1 line, one denominator a line" |
   | B7.S9 | `graph_fractions` | Set `{denoms:[2]}` (halves, quarters, eighths), and → "halves, quarters and eighths placed on a 0–1 line" |
   | B4.S7 | `mult_word_problems {range:100}` | → "equal-groups stories (the facts the stories use)" |
   | B6.S1, B6.S2 | `place_on_number_line` | → "4-digit numbers placed on a 0–10,000 line (metres before kilometres)" |

   Optionally, set B9.S8's `compose_whole` to `{parts:[0]}`.
5. **`linkfit.mjs`.**
   - G10: at least 150 items per link over 3 or more seed sets.
   - G11: add nets, cross-sections, 3-D solids and probability / likelihood to the later-grade list, plus fractions in a pre before W07.
   - G12: when a `why` names a table, a denominator family, a unit or "on one line", check it against the items.

   Then re-run on fresh seeds.
