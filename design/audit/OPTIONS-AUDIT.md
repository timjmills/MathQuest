# Option Panel Audit — 2026-09-25

**Rubric:** `design/audit/OPTIONS-RUBRIC.md` (O1 sense · O2 difficulty · O3 support · O4 works ·
O5 clarity; pass = every criterion ≥ 8 and no cap). **Machine evidence (O4):**
`design/audit/OPTIONS-VERIFY.md`, from `node tests/scripts/ws-options-verify.cjs --report`.
**Live panel:** opened in teacher mode with `window.openSkillOptionsPanel()`; screenshots in
`design/audit/options-panels/`.

**Tree measured:** worktree branch at `9f6f8bb` (merge of `claude/sweet-newton-c8wrv1`), clean
except for this audit's own files. Default Max Number 100, Decimals 0, as a teacher gets them.

**Scope graded:** every live skill in the redone families — addition (59), subtraction (54),
multiplication (22), division (22), counting (4), comparing (4), composing (17), placevalue (15),
number_sense (25) — plus a 34-skill sample of the other families: **256 skills**.

---

## 1. Results

| | |
|---|---|
| Skills graded | 256 (222 redone-family + 34 sample) |
| **Pass (all of O1–O5 ≥ 8, no cap)** | **0** |
| Fail | 256 |
| … with **no option panel at all** (cap OC10) | 129 |
| … with O1–O3 all ≥ 8, failing only on O4 / O5 (closest to passing: the six `nearest_*` panels and `rounding_visual`) | 7 |

Verifier, whole app (all 583 live skills): 210 skills show a panel, 373 show none. 1,014 option
values checked: **853 pass on every surface, 161 fail, of which 97 are gated** (they do nothing, or
the skill is refused, at the default Max Number 100). Share-code round trip: **0 failures**.
By surface: gen 137 · print 60 · screen 45 · trip 0. Skills whose every value passes: 153 / 210.

Average score per family (O4 only over skills that have a panel):

| Family | O1 | O2 | O3 | O4 | O5 | Pass |
|---|---|---|---|---|---|---|
| addition | 4.0 | 3.7 | 3.2 | 9.5 | 7.6 | 0 / 59 |
| subtraction | 4.0 | 3.8 | 3.1 | 9.2 | 7.7 | 0 / 54 |
| multiplication | 4.5 | 4.5 | 3.5 | 9.4 | 7.2 | 0 / 22 |
| division | 4.6 | 4.7 | 3.0 | 8.1 | 7.2 | 0 / 22 |
| counting | 4.2 | 4.5 | 3.0 | 7.0 | 7.0 | 0 / 4 |
| comparing | 3.0 | 3.0 | 3.0 | — | — | 0 / 4 |
| composing | 3.7 | 3.7 | 3.1 | 9.8 | 7.5 | 0 / 17 |
| placevalue | 7.7 | 7.4 | 4.9 | 5.9 | 6.1 | 0 / 15 |
| number_sense | 7.2 | 6.8 | 5.0 | 6.0 | 6.2 | 0 / 25 |
| sample (other) | 4.9 | 4.9 | 3.1 | 7.5 | 7.3 | 0 / 34 |

**Worst families:** comparing (no panel on any skill), then counting / composing / addition /
subtraction (the multi-digit and word-problem ladders are 18-id families with no panel; O1–O3 ≈ 3–4).
**Best-designed but still failing:** place value + rounding (P9): the right controls exist, but most
of them are dead at the default Max Number 100 (O4 ≤ 6), and there is no place-value chart / labels
support control (O3 5).

### What the pattern says

1. **Support (O3) is the universal gap.** Only 10 of 256 graded skills have a support control
   (Support level on 6 skills, Support on the 6 `nearest_*`). PEDAGOGY 4.3 levels 3→0 exist in the
   model (`UNIVERSAL_OPTIONS`) but are shown only where `ws-options-derive` measured a change, which
   is almost nowhere, because no generator reads `level` outside the merged twins.
2. **Easier/harder (O2) lives in skill ids, not options.** Band and regrouping for + and − are
   spread over 18 ids per operation (`add_50_no_regroup` … `add_1m_mixed`), picture/no-picture over
   `_plain` twins, and word-problem size over `add_wp_10` … `add_wp_1m`. Each id has no panel, so
   from any one skill the teacher cannot go a step easier or harder.
3. **The measured Max Number is a weak stand-in.** Where a panel exists outside the fact drills and
   P9 it is usually only `range` (+ `decimals`), offering 2–3 values (10 / 100), sometimes values that
   change nothing (mixed pools) or refuse the skill (`round_sort_*` "Up to 100"), and a Decimal places
   control on K-2 skills and on decimal skills where "Whole numbers" still deals decimals.
4. **P9's band is gated by the app Max Number.** `gen-pv.js` caps every band with
   `Math.min(band, state.range)`, so at the default 100 "Numbers to 9,999" prints numbers to 100, and
   `nearest_100` … `nearest_million`, `more_less_100`, `pv_digit_drag` and `round_sort_100+` produce
   **no items at all** until the teacher raises a setting that is not on the panel.
5. **Print lags screen on three controls:** Support level 0 on `add_10_regroup` / `sub_10_regroup`
   prints the default sheet; division notation on `mult_div_fact_family` / `missing_mult_div` prints
   the default sheet; the fact-set title (P-31 "Add 6") never reaches the printed sheet header.

---

## 2. Scores — skill × O1–O5

`—` = not applicable (no panel, so nothing to verify or read). Caps: see the rubric §3.

| Skill | Gr | Options shown | O1 | O2 | O3 | O4 | O5 | Caps | Pass |
|---|---|---|---|---|---|---|---|---|---|
| `counting:count_objects` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `counting:count_sequence` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `counting:number_seq_fill` | M | range | 6 | 7 | 3 | 10 | 8 |  | fail |
| `counting:mixed_counting` | M | range, decimals | 5 | 5 | 3 | 4 | 6 | OC4 | fail |
| `comparing:compare_groups` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `comparing:compare_objects` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `comparing:classify_count` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `comparing:mixed_comparing` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:number_bonds` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:make_ten` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:teen_compose` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:tens_foundation_visual` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:hundreds_chart_fill` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:ten_frame_build` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:ten_frame_build_teen` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:base10_build` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:base10_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:base10_build_hundreds` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:odd_even` | 2 | range | 7 | 6 | 4 | 10 | 8 |  | fail |
| `composing:select_even_odd` | 2 | range | 7 | 6 | 4 | 10 | 8 |  | fail |
| `composing:number_word_form` | 2 | range | 5 | 7 | 3 | 10 | 8 |  | fail |
| `composing:fraction_number_line` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:whole_as_fraction` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:compose_whole` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `composing:mixed_composing` | M | range | 5 | 5 | 3 | 9 | 6 |  | fail |
| `addition:add_facts` | 1 | constant, notation | 6 | 6 | 4 | 9 | 7 |  | fail |
| `addition:add_sub_10s` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_sub_100s` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add` | 1 | notation, range, decimals | 6 | 6 | 3 | 10 | 7 |  | fail |
| `addition:add_word_problems` | 2 | response, range, decimals | 6 | 6 | 3 | 10 | 6 |  | fail |
| `addition:add_word_problems_plain` | 2 | range, decimals | 5 | 6 | 3 | 10 | 7 |  | fail |
| `addition:add_sub_fact_family` | 1 | range | 6 | 5 | 3 | 9 | 8 |  | fail |
| `addition:number_families_add` | 1 | level | 6 | 6 | 8 | 10 | 7 |  | fail |
| `addition:add_three` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:comparison_word` | 1 | response, range | 6 | 6 | 3 | 9 | 6 |  | fail |
| `addition:equal_sign` | 1 | range, decimals | 6 | 6 | 3 | 10 | 8 |  | fail |
| `addition:add_5_pictures` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_10_no_regroup` | K | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `addition:add_10_regroup` | K | notation, level | 7 | 4 | 8 | 5 | 8 | OC3 | fail |
| `addition:add_10_mixed` | K | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `addition:add_20_no_regroup` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `addition:add_20_regroup` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `addition:add_20_mixed` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `addition:add_50_no_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_50_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_50_mixed` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100_no_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100_mixed` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1k_no_regroup` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1k_regroup` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1k_mixed` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_10k_no_regroup` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_10k_regroup` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_10k_mixed` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100k_no_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100k_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_100k_mixed` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1m_no_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1m_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_1m_mixed` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_10` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_10_plain` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_20` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_20_plain` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_50` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_50_plain` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_100` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_100_plain` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_1k` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_1k_plain` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_10k` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_10k_plain` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_100k` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_100k_plain` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_1m` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_wp_1m_plain` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:nl_add` | 1 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `addition:number_line_add` | 1 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `addition:cloze_addition` | 2 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `addition:mixed_addition` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_column_multi` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `addition:add_missing_digit` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `addition:fact_family_sort` | 1 | range | 6 | 5 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_facts` | 1 | constant, notation | 6 | 6 | 4 | 9 | 7 |  | fail |
| `subtraction:subtract` | 1 | notation, range, decimals | 6 | 6 | 3 | 9 | 7 |  | fail |
| `subtraction:sub_word_problems` | 2 | response, range, decimals | 6 | 6 | 3 | 9 | 6 |  | fail |
| `subtraction:sub_word_problems_plain` | 2 | range, decimals | 5 | 6 | 3 | 10 | 7 |  | fail |
| `subtraction:missing_add_sub` | 1 | range, decimals | 6 | 6 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_5_pictures` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:unknown_start_wp` | 2 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_10_no_regroup` | K | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `subtraction:sub_10_regroup` | K | notation, level | 7 | 4 | 8 | 5 | 8 | OC3 | fail |
| `subtraction:sub_10_mixed` | K | notation | 6 | 4 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_20_no_regroup` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `subtraction:sub_20_regroup` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `subtraction:sub_20_mixed` | 1 | notation | 6 | 4 | 3 | 10 | 8 |  | fail |
| `subtraction:sub_50_no_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_50_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_50_mixed` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100_no_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100_regroup` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100_mixed` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1k_no_regroup` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1k_regroup` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1k_mixed` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_10k_no_regroup` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_10k_regroup` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_10k_mixed` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100k_no_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100k_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_100k_mixed` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1m_no_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1m_regroup` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_1m_mixed` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_10` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_10_plain` | K | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_20` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_20_plain` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_50` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_50_plain` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_100` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_100_plain` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_1k` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_1k_plain` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_10k` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_10k_plain` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_100k` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_100k_plain` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_1m` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_wp_1m_plain` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:nl_sub` | 1 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `subtraction:number_line_sub` | 1 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `subtraction:mixed_add_sub` | 2 | decimals | 6 | 6 | 3 | 10 | 8 |  | fail |
| `subtraction:mixed_subtraction` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `subtraction:sub_across_zeros` | 3 | range | 7 | 7 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_missing_digit` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `subtraction:sub_check_by_adding` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `multiplication:mult_facts` | 3 | constant, notation | 6 | 7 | 4 | 9 | 7 |  | fail |
| `multiplication:multiply` | 3 | notation, range | 6 | 6 | 3 | 10 | 7 |  | fail |
| `multiplication:arrays_groups` | 2 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `multiplication:dot_array_mult` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_properties` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_word_problems` | 3 | response, range | 6 | 6 | 3 | 10 | 6 |  | fail |
| `multiplication:mult_word_problems_plain` | 3 | range | 5 | 6 | 3 | 10 | 7 |  | fail |
| `multiplication:mult_comparison` | 4 | response, range | 6 | 6 | 3 | 10 | 6 |  | fail |
| `multiplication:mult_comparison_plain` | 4 | range | 5 | 6 | 3 | 10 | 7 |  | fail |
| `multiplication:area_model_mult` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:area_model_mult_hard` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_div_fact_family` | 3 | notation | 6 | 5 | 3 | 5 | 8 | OC3 | fail |
| `multiplication:number_families_mult` | 3 | level | 6 | 6 | 8 | 10 | 7 |  | fail |
| `multiplication:mult_chart` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_chart_easy` | 3 | level | 7 | 6 | 8 | 10 | 8 |  | fail |
| `multiplication:nl_mult` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `multiplication:mixed_multiplication` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:repeated_add_to_mult` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:equal_or_unequal_groups` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_zeros` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_placeholder_zero` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `multiplication:mult_missing_digit` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:div_facts` | 3 | constant, notation | 6 | 7 | 4 | 4 | 5 | OC4 | fail |
| `division:divide` | 3 | notation, range | 6 | 6 | 3 | 9 | 7 |  | fail |
| `division:div_remainders` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:div_word_problems` | 3 | response, range | 6 | 6 | 3 | 10 | 6 |  | fail |
| `division:div_word_problems_plain` | 3 | range | 5 | 6 | 3 | 10 | 7 |  | fail |
| `division:remainder_interpret` | 4 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `division:remainder_contexts` | 4 | range | 6 | 6 | 3 | 5 | 8 | OC3 | fail |
| `division:box_division_easy` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:box_division_hard` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:area_model_div_2by1` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:area_model_div_3by1` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:long_div_2digit` | 5 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `division:missing_mult_div` | 3 | notation, range | 7 | 6 | 3 | 3 | 6 | OC1 OC4 | fail |
| `division:nl_div` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `division:mixed_mult_div` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `division:mixed_division` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:share_into_groups` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:div_equation_parts` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:div_zero_in_quotient` | 4 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `division:remainder_too_big` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `division:div_check_by_multiplying` | 4 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `division:div_fix_estimate` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `integers:number_line_int` | 6 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `integers:add_int` | 6 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `number_ops_mixed:number_families_mixed` | 2 | level | 6 | 6 | 8 | 10 | 7 |  | fail |
| `number_ops_mixed:which_sign` | M | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `fractions:write_fraction` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `fractions:equiv_frac_visual` | 3 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `fractions:fraction_of_set` | 3 | range | 6 | 5 | 3 | 9 | 7 |  | fail |
| `fractions:compare` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `fraction_operations:add_fractions_like` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `fraction_operations:sub_mixed_unlike_nv` | 5 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `fraction_operations:frac_as_div_nv` | 5 | range | 6 | 5 | 3 | 3 | 7 | OC1 | fail |
| `decimals:add_decimal` | 5 | range, decimals | 5 | 6 | 3 | 4 | 6 | OC4 | fail |
| `decimals:div_decimal` | 6 | range, decimals | 5 | 6 | 3 | 4 | 6 | OC4 | fail |
| `decimals:round_decimals` | 5 | range | 5 | 6 | 3 | 10 | 6 |  | fail |
| `decimals:order_decimals` | 5 | range, decimals | 5 | 6 | 3 | 4 | 6 | OC4 | fail |
| `conversions:d_to_p` | 6 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `shapes_early:count_edges_faces_vertices` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `area_perimeter:perimeter` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `area_perimeter:area` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `area_perimeter:volume` | 5 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `angles_lines:identify_angles` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `coordinates:coordinate_q1` | 5 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `measurement:time_5min` | 2 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `measurement:money_count` | 2 | range | 6 | 5 | 3 | 7 | 7 |  | fail |
| `measurement:length_metric` | 4 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `graphs:bar_graph` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `graphs:mixed_graphs` | M | range | 4 | 4 | 3 | 3 | 6 | OC1 | fail |
| `data_analysis:median` | 6 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `patterns:skip_count_line` | 2 | range | 6 | 6 | 3 | 10 | 7 |  | fail |
| `patterns:halve` | 2 | range, decimals | 6 | 6 | 3 | 9 | 7 |  | fail |
| `algebra:tape_diagram` | 4 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `algebra:solve_unknown` | 6 | range, decimals | 6 | 6 | 3 | 9 | 8 |  | fail |
| `order_of_operations:mixed_order_ops` | M | range | 6 | 6 | 3 | 5 | 8 | OC3 | fail |
| `placevalue:more_less_10` | 1 | step, dir, band | 8 | 7 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:more_less_100` | 2 | step, dir, band | 8 | 7 | 5 | 6 | 6 | OC11 OC6 | fail |
| `placevalue:place_value_disks` | 2 | band, task, zeroPlace | 8 | 7 | 5 | 6 | 7 | OC6 | fail |
| `placevalue:pv_disks_build` | 2 | band, zeroPlace | 8 | 7 | 5 | 6 | 7 | OC6 | fail |
| `placevalue:pv_digit_drag` | 4 | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:number_word_names` | 4 | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:place_value_10x` | 5 | op, power, band, decimals | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:identify` | 2 | band, places | 8 | 8 | 5 | 4 | 6 | OC4 OC6 | fail |
| `placevalue:value` | 2 | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:compare` | 2 | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:expand` | 2 | band, zeroPlace | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:combine` | 2 | band, zeroPlace, order | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:order_least_to_greatest` | M | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:order_greatest_to_least` | M | band | 8 | 8 | 5 | 6 | 6 | OC6 | fail |
| `placevalue:mixed_placevalue` | M | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `number_sense:rounding_visual` | 3 | place, band, midpoint | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_10` | 3 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_100` | 3 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_1000` | 3 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_10000` | 4 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_100000` | 5 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC6 | fail |
| `number_sense:nearest_million` | 5 | band, support, midpoint, response | 8 | 8 | 8 | 6 | 6 | OC11 OC6 | fail |
| `number_sense:round_sort_10` | 3 | tiles, midpoint, range | 8 | 7 | 5 | 2 | 5 | OC12 | fail |
| `number_sense:round_sort_100` | 3 | tiles, midpoint, range | 8 | 7 | 5 | 2 | 5 | OC12 OC6 | fail |
| `number_sense:round_sort_1000` | 4 | tiles, midpoint, range | 8 | 7 | 5 | 2 | 5 | OC12 OC6 | fail |
| `number_sense:round_sort_10000` | 4 | tiles, midpoint, range | 8 | 7 | 5 | 2 | 5 | OC12 OC6 | fail |
| `number_sense:round_sort_100000` | 5 | tiles, midpoint, range | 8 | 7 | 5 | 2 | 5 | OC12 OC6 | fail |
| `number_sense:round_sort_million` | 5 | tiles, midpoint | 8 | 7 | 5 | 6 | 5 | OC6 | fail |
| `number_sense:round_sort_tenths` | 4 | tiles, midpoint | 8 | 7 | 5 | 10 | 5 |  | fail |
| `number_sense:round_sort_hundredths` | 5 | tiles, midpoint | 8 | 7 | 5 | 10 | 5 |  | fail |
| `number_sense:estimate_sum` | 3 | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `number_sense:estimate_diff` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `number_sense:estimate_sums_diffs` | 3 | task, range | 8 | 7 | 3 | 4 | 7 | OC4 | fail |
| `number_sense:estimate_products` | 4 | task, range | 8 | 7 | 3 | 4 | 7 | OC4 | fail |
| `number_sense:estimate_quotient` | 4 | task, range | 8 | 7 | 3 | 10 | 7 |  | fail |
| `number_sense:rounding_table` | 3 | range | 6 | 6 | 3 | 10 | 8 |  | fail |
| `number_sense:make_a_ten` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `number_sense:doubles_near_doubles` | 1 | (none) | 3 | 3 | 3 | — | — | OC10 | fail |
| `number_sense:compensation` | 2 | range | 6 | 6 | 3 | 5 | 8 | OC3 | fail |
| `number_sense:mixed_number_sense` | M | range | 6 | 6 | 3 | 9 | 8 |  | fail |
| `number_theory:prime_composite` | 4 | range | 6 | 5 | 3 | 2 | 7 | OC12 | fail |

---

## 3. Should have but doesn't — missing options per family

Each line is an option the family needs to go easier / harder or give more / less support, with
the values it should offer and the default (R2: the stand-alone value).

### Addition and subtraction (gen-operations.js)

| Missing option | Skills | Values (default **bold**) |
|---|---|---|
| **Fact band** — "Facts to" | `add_facts`, `sub_facts` | 5 · 10 · 12 · 18 · 20 · **30** (P-31). Independent of the constant: "Add 6, facts to 10" |
| **Fact cue** (hint, fades) | `add_facts`, `sub_facts`, `add/sub_10_*`, `add/sub_20_*` | **dot tile** · dots on the numeral · none (P-31) |
| **Regrouping** | `add`, `subtract`, and the merged `add_N_*` / `sub_N_*` ladder | never · **mixed** · always (`regroupOption()` exists, unused) |
| **Across zeros** | subtraction ladder, `subtract`, `sub_across_zeros` | none · **some** · every item (one zero / two zeros) |
| **Numbers to** (band) | the 36 `add/sub_{10,20,50,100,1k,10k,100k,1m}_*` ids → one skill each op | 10 · 20 · 50 · **100** · 1,000 · 10,000 · 100,000 · 1,000,000 (bounds the sum / minuend) |
| **Support level** | every + / − computation skill | 3 traced · 2 hints · **1** structure · 0 bare; regroup boxes and the digit grid stay at every level |
| **Number line / ten frame** (hint) | `add/sub_10_*`, `add/sub_20_*`, `nl_add`, `nl_sub`, `number_line_*` | **picture** · number line · none |
| **What is missing** | `add`, `subtract`, word problems, `missing_add_sub` | **the answer** · first number · second number · mixed (`unknownOption()` exists, unused) |
| **Number of addends** | `add_three`, `add_column_multi` | 2 · **3** · 4 |
| **Pictures** (hint) | `add_5_pictures`, `sub_5_pictures`, every `*_plain` twin | **on** · off (`picturesOption()` exists, unused) — then retire the `_plain` twins as aliases |
| **Word-problem support** | all word problems | **schema diagram** · keyword checklist · none (P-31) |

### Multiplication and division (gen-operations.js)

| Missing option | Skills | Values |
|---|---|---|
| **Fact range** | `mult_facts`, `div_facts` | to 10 · **to 12** (P-31) |
| **Fact cue** | `mult_facts`, `div_facts` | **skip-count strip** · array tile (≤ 5 columns) · none (P-31) |
| **Think box** | `div_facts` | **off** · on (P-31, P-SC-6) |
| **Digits × digits** | `multiply`, `area_model_mult*`, `box_division_*`, `long_div_2digit`, `area_model_div_*` | 1×1 · **2×1** · 3×1 · 2×2 (÷: 2÷1 · 3÷1 · 4÷1 · 3÷2) — replaces the `_easy/_hard/_2by1/_3by1` twins |
| **Remainders** | `divide`, `div_remainders`, box / area-model division | **none** · some · always |
| **Table range** | `mult_chart`, `mult_chart_easy`, `arrays_groups`, `nl_mult`, `nl_div` | to 5 · to 10 · **to 12** |
| **Support level** | every × / ÷ computation | as for + / − (partial-product boxes, the bracket and the digit grid are structural) |
| **Band split out of Support level** | `number_families_add/mult/mixed` | a Numbers to option, so level moves only the blanks (P-1) |

### Counting, comparing, composing (gen-counting.js; `odd_even` → gen-algebraic.js)

| Missing option | Skills | Values |
|---|---|---|
| **Count to** | `count_objects`, `count_sequence`, `classify_count`, `compare_groups`, `ten_frame_build*`, `base10_build*`, `teen_compose`, `number_bonds`, `make_ten`, `hundreds_chart_fill` | 5 · **10** · 20 · 100 (`count_objects`: 1-20 today, fixed) |
| **Objects** (representation) | `count_objects`, `compare_groups`, `classify_count` | **plain counters** · pictures · ten frame · dice (P-31 "Counting objects") |
| **Arrangement** | `count_objects` | **line** · array · scattered |
| **Support** | counting / building skills | **numbered track** · tracing digits · none |
| **Compare by** | `compare_groups`, `compare_objects` | **more** · fewer · same · mixed |
| **Count by / direction** | `number_seq_fill`, `count_sequence` | **1** · 2 · 5 · 10; forward · back |
| **Word form** (registered but not wired) | `number_word_form` | **to number** · to words — `gen-algebraic.js` already reads `state.skillOptions.wordform`, and the codec has key `W`; only the registry entry is missing |

### Place value and rounding (gen-pv.js, skill-options.js P9 block)

| Missing option | Skills | Values |
|---|---|---|
| **Place-value support** | `identify`, `value`, `compare`, `expand`, `combine`, `order_*`, `pv_digit_drag`, `number_word_names` | **labels (H T O)** · chart · none (P-31 "Place-value labels"; P-SC-7) |
| **Number line / hundreds chart** | `more_less_10`, `more_less_100` | **hundreds chart** · number line · none |
| **Repeated digit** / **response** / **form** | `identify`, `value`, `expand` | the rest of design/research/place-value-rounding.md §2.5, deferred by the P9 block's own comment |
| **Round to (place)** | `estimate_sums_diffs`, `estimate_products`, `estimate_quotient`, `rounding_table` | **nearest 10** · 100 · 1,000 · front-end |
| **Support** | `round_sort_*`, `rounding_table`, `estimate_*` | **number line** · cut line · none |

### Sampled other families

| Family | Missing |
|---|---|
| fractions / fraction_operations | **Denominators** (halves · thirds · fourths · … set), **like / unlike**, **proper / improper / mixed**, **model** (bar · circle · number line · none) as a hint, **simplest form** (`simplestFormOption()` exists, unused) |
| decimals | **Places** (tenths · hundredths · thousandths) without a "Whole numbers" value; **place-value grid** support |
| area / perimeter, coordinates | **Grid shown** (unit squares · labelled sides · none), **units** (customary · metric), **quadrants** (Q1 · all four) |
| measurement | **Clock precision** (hour · half · quarter · 5 min · 1 min) as one skill, **coin set**, **units** |
| graphs / data | **Scale** (1 · 2 · 5 · 10 per unit), **gridlines** support |
| patterns / algebra / order of operations | **Step size**, **unknown position**, **brackets** on/off, **number of operations** |

---

## 4. Defects, grouped by the file that must change

Fix agents own files. Each defect names the skill(s), the rubric criterion, what is wrong and the
fix. O4 items come from `OPTIONS-VERIFY.md` and are reproducible with
`node tests/scripts/ws-options-verify.cjs --skill <id> --verbose`.

### js/modules/gen-pv.js (P9 place value + rounding) — 29 skills, 115 failing values

1. **O4 / OC6 — band gated by the app Max Number (every P9 skill).** Every generator caps with
   `Math.min(Number(o.band) || …, state.range)` (lines ~116, 168, 225, 266, 320, 396, 459, 561). At
   the default Max Number 100, "Numbers to 999 / 9,999 / 99,999 / 999,999" all print numbers ≤ 100,
   and `band = 99` changes nothing either. **Fix:** the band is the skill's own number size — let it
   stand in for `state.range` (as `applySkillSettings()` does for `range`), i.e. drop the
   `state.range` term when the band option is present, or raise `state.range` to the band for the
   duration of the item. Keep `pvRefusal()` only for the case where the TEACHER'S band is below the
   place's floor.
2. **O4 / OC12 — whole skills refused at defaults.** `nearest_100`, `nearest_1000`,
   `nearest_10000`, `nearest_100000`, `nearest_million`, `more_less_100`, `pv_digit_drag`,
   `round_sort_100` … `round_sort_million`, and `rounding_visual` with place 100 / 1,000 return
   `refused` at Max Number 100, so print, the online worksheet and practice show **no items** for a
   skill added with default options. Same fix as 1: the default band (`place × 10`) already satisfies
   the floor, so refuse only when the band chosen is too small.
3. **O4 / OC4 — `identify` "Which place is asked" ignores places the band cannot host.** Ticking
   only Thousands (band 999 default) deals ones / tens / hundreds. **Fix:** either raise the band to
   the smallest one that has the ticked place, or refuse with a message; never silently deal other
   places.
4. **O4 — `place_value_10x` band 100,000 / 1,000,000 changes nothing** even at Max Number
   10,000,000 (the dealt numbers never exceed the 10,000 class). Either make the band reach the
   larger numbers or trim those values.
5. **O4 / OC4 — `estimate_sums_diffs`, `estimate_products`: Task "Choose the closest estimate"
   deals "Is this reasonable?" items.** The `closest` branch is not reached (estimate_quotient is
   correct). **Fix:** route `task === 'closest'` to the closest-estimate builder for sums/diffs and
   products.
6. **O4 / OC1 — `compare` band 9,999+ prints the default sheet** (same root cause as 1).

### js/modules/skill-options.js (registry) — applies to every family

7. **O5 — `bandOption` help is wrong for P9.** "Bounds the answer, not the numbers you start from"
   is the + − × ÷ rule; on `identify`, `nearest_*`, `order_*` the band bounds the number itself.
   Give `_pvBand` its own help ("The largest number on the page").
8. **O5 / OC11 — single-value controls:** `more_less_100` band `{1000}` and `nearest_million`
   band `{10000000}` are controls with no choice. Drop them from the panel (keep the value in the model).
9. **O5 — `place_value_10x` "Decimals (Level 5)"** is internal jargon: "Decimal numbers (5.6 × 10)".
10. **O1 — `number_word_form` has no `wordform` option** although gen-algebraic.js reads it and the
    codec has key `W`. Register `{ id: 'wordform', values: to_number · to_words }`.
11. **O4 / O5 — `div_facts` constant 0 is labelled "Divide by 0"** (and would title a sheet
    "Divide by 0") but deals `0 ÷ n`. Relabel the 0 box "0 ÷ n (zero facts)" and teach
    `factSetTitle()` that for ÷ the 0 set is "Zero divided by a number".
12. **O1–O3 — register the options the helpers already define:** `regroupOption`,
    `unknownOption`, `picturesOption`, `simplestFormOption`, `bandOption` are defined and **not
    attached to any skill**. Attach each where its generator branch is taught to read it (§3), one
    family per pass, as the file's header rule requires.
13. **O2 — number families (P-1 breach, already documented at lines ~275-300):** split a `band`
    option out of the level branches so Support level moves only the blanks.

### js/modules/gen-operations.js (+ − × ÷) — 45 skills graded without a passing panel

14. **O4 / OC3 — Support level 0 is not drawn in print** for `add_10_regroup` and `sub_10_regroup`:
    screen and generation change, `buildSheet` prints the default sheet. The level must reach the
    print cell (the `legacy` template drops the hint difference) — emit it in `q.cell`.
15. **O4 / OC3 — division notation is screen-only** on `mult_div_fact_family` (bracket, fraction,
    all three) and `missing_mult_div` (bracket, fraction): the printed sheet is identical to Across.
16. **O4 / OC4 — `missing_mult_div` with all three notations ticked deals only the fraction bar**
    (12 items, zero Across, zero bracket): the round-robin counts × items too. Deal the notations
    over the ÷ items only.
17. **O4 — `remainder_contexts` Max Number 100 / 1,000: printed sheet identical to the default**
    (the six printed items do not move); gen differs. Check the print path's item-level seeds.
18. **O4 / OC4 — `word_problems_mixed` Decimal places 1 / 2 / 3 print whole numbers** (screen
    practice too): the value reaches only some pool members. Either pass decimals to every pool
    member or drop the control.
19. **O1–O3 — the missing options in §3** (fact band, fact cue, think box, regrouping, across zeros,
    band, support level, unknown position, pictures, digits × digits). This is the bulk of the work:
    it is also what lets the 36 `add/sub_N_*` ids, the 16 `*_wp_*` ids and the `_plain` twins be
    merged into configured skills (retire with tombstones + aliases, never splice).

### js/modules/gen-counting.js — 25 skills, 0 with a real panel

20. **O1–O3 / OC10 — no panel on any counting / comparing / composing skill** except the mixed
    pools and four measured Max Number controls. Add Count to · Objects · Arrangement · Support ·
    Compare by (§3).
21. **O4 / OC4 — `mixed_counting` "Tenths (1 place)" deals no decimals**, and Decimal places is
    meaningless on a K-2 counting pool: drop the measured `decimals` for counting pools
    (`skill-options-derived.js` via `ws-options-derive.cjs`, see 26).

### js/modules/gen-algebraic.js

22. **O4 — `mixed_order_ops` Max Number 1,000 / 10,000 and `compensation` 1,000: printed sheet
    identical to the default** (gen differs): same print-path check as 17.

### js/modules/gen-fractions.js (sample)

24. **O1 / OC4 — decimal skills offer "Whole numbers"** (`add_decimal`, `sub_decimal`,
    `mult_decimal`, `div_decimal`, `compare_decimal`, `mixed_decimals`, `decimals_all`) and still
    deal decimals when it is chosen. Remove value 0 from the measured list for the decimals category.
25. **O4 — `div_decimal` "Hundredths" prints no hundredths on the sheet (generation has them);
    `frac_as_div_nv` Max Number 50 / 100 changes nothing.**

### tests/scripts/ws-options-derive.cjs → js/modules/skill-options-derived.js (measured options)

26. **O4 / O5 — measured values that do nothing or refuse the skill.** The measurement keeps a
    value whenever the 60-item hash moves, which admits noise and refusals:
    - mixed pools where no value changes the items reproducibly: `graphs:mixed_graphs` (5 values),
      `geo_mixed:measurement_all` (4), `measurement:mixed_measurement` (3), `algebra_mixed:patterns_all`
      decimals, `measurement:money_count` "Up to 1,000";
    - `round_sort_10` "Up to 10" and `round_sort_100` … `round_sort_100000` "Up to 100" **refuse the
      skill** (no items on any surface).
    **Fix:** after deriving, re-check each kept value through `ws-options-verify` logic (items must
    exist and differ from the default on gen AND print) and drop values that fail; never keep a
    value below `pvBandFloor()`; skip `mixed_*` pools entirely (a pool's options are its members').
27. **O1 — the measured Decimal places control is offered on skills where decimals are not part of
    the skill's name** (K-2 word problems `add_word_problems`, `comparison_word`, `mixed_counting`,
    `equal_sign`, `missing_add_sub`, `solve_unknown` …). Offer decimals only where the skill's
    label or grade says decimals (grade ≥ 4 and a decimal family), as the name rule requires.

### js/modules/print-sheet.js (buildSheet) — do not edit sheet/cells (other agent)

28. **O4 (warn on every constant value) — the printed title ignores the fact set.** `add_facts`
    with Add = {6} prints "I Can work on addition facts"; P-31 requires "Add 6". `factSetTitle()`
    exists in skill-options.js; `skillMeta()` / the title resolution in `buildSheet` should use it
    when a skill carries a constant.

### js/modules/skill-options-ui.js (the panel) — O5 for every skill

29. **The panel header reads "Default options"** instead of naming the skill ("Addition Facts ·
    Options"); a teacher opening two panels in a row cannot tell which skill he is configuring.
30. **Enum values are truncated in the select** at 420 px ("Work it out and write the ans",
    "Cut line (place letters over tl", "Use the Max Number settinç") — see
    `options-panels/addition-add_word_problems.png`, `number_sense-nearest_100.png`. Wrap the select
    or show the full label under it.
31. **The Max Number / Decimals overrides sit beside the app's own settings with no hint of the
    current app value** ("Use the Max Number setting" — which is?). Show it: "Use the Max Number
    setting (100)".
32. **Help text is long** (the notation and response help run to five lines): keep one line, move
    the rest behind a "?".

### Verifier notes (not generator defects)

- `number_theory:prime_composite` timed out (60 s) inside the verifier; `ws-options-derive` also
  records a hang for it. Investigate the generator at Max Number 1,000,000 (the derive table lists
  it under `hang`).
- Soft warnings (listed in OPTIONS-VERIFY.md, not counted as failures): measured Max Number values
  whose answers exceed the chosen number (the measured range bounds the operands on some skills,
  against the "bounds the answer" rule), and a few answers the key-text search could not locate.

---

## 5. Per-skill defect list

Panel defect = the reason O1–O3 / O5 are below 8 (fixes in §3 and §4). Verifier failures = the O4
evidence, per option value.

| Skill | Panel defect (O1–O3, O5) | Verifier failures (O4) |
|---|---|---|
| `counting:count_objects` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `counting:count_sequence` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `counting:number_seq_fill` | count-by step (1 / 2 / 5 / 10) and direction missing; no hundreds-chart support | — |
| `counting:mixed_counting` | mixed pool: Max Number / Decimals are the only controls; Decimal places on a K-2 counting pool is meaningless | decimals = 1: no number with 1 decimal place(s) |
| `comparing:compare_groups` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `comparing:compare_objects` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `comparing:classify_count` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `comparing:mixed_comparing` | no options at all; mixed pool: Max Number / Decimals are the only controls; Decimal places on a K-2 counting pool is meaningless | — |
| `composing:number_bonds` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:make_ten` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:teen_compose` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:tens_foundation_visual` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:hundreds_chart_fill` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:ten_frame_build` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:ten_frame_build_teen` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:base10_build` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:base10_regroup` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:base10_build_hundreds` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:odd_even` | no support (pairs / ones digit highlighted); Max Number values change nothing (see O4) | — |
| `composing:select_even_odd` | no support (pairs / ones digit highlighted); Max Number values change nothing (see O4) | — |
| `composing:number_word_form` | gen-algebraic.js reads a `wordform` option (to number / to words) but it is not registered | — |
| `composing:fraction_number_line` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:whole_as_fraction` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:compose_whole` | no options at all: count / number range (to 5 / 10 / 20 / 100) and objects (dots / pictures / ten frame) missing | — |
| `composing:mixed_composing` | mixed pool: Max Number / Decimals are the only controls; Decimal places on a K-2 counting pool is meaningless | — |
| `addition:add_facts` | fact band (facts to 5/10/12/18/20, P-31) missing; no fact-cue option (dot tile / dots on numeral / none); sheet title does not name the ticked set | — |
| `addition:add_sub_10s` | no options at all | — |
| `addition:add_sub_100s` | no options at all | — |
| `addition:add` | regrouping (none / some / always) missing; Max Number offers only 10 / 100; no support level; Decimal places on "Basic" addition is a second skill | — |
| `addition:add_word_problems` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `addition:add_word_problems_plain` | twin of the picture skill; the picture / plain choice should be a Pictures option, not a separate id; unknown position missing | — |
| `addition:add_sub_fact_family` | no band, no "which member is missing" control | — |
| `addition:number_families_add` | Support level also moves the number size (P-1 breach, documented); a separate band option is missing | — |
| `addition:add_three` | no options at all | — |
| `addition:comparison_word` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `addition:equal_sign` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `addition:add_5_pictures` | no options at all | — |
| `addition:add_10_no_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `addition:add_10_regroup` | only notation + support level; no band / number-line / ten-frame option | level = [0]: printed sheet identical to the default sheet |
| `addition:add_10_mixed` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `addition:add_20_no_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `addition:add_20_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `addition:add_20_mixed` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `addition:add_50_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_50_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_50_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_10k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_10k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_10k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_100k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1m_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1m_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_1m_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `addition:add_wp_10` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_10_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_20` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_20_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_50` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_50_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_100` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_100_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_1k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_1k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_10k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_10k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_100k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_100k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_1m` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:add_wp_1m_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `addition:nl_add` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `addition:number_line_add` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `addition:cloze_addition` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `addition:mixed_addition` | no options at all | — |
| `addition:add_column_multi` | no options at all | — |
| `addition:add_missing_digit` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `addition:fact_family_sort` | no band, no "which member is missing" control | — |
| `subtraction:sub_facts` | fact band (facts to 5/10/12/18/20, P-31) missing; no fact-cue option (dot tile / dots on numeral / none); sheet title does not name the ticked set | — |
| `subtraction:subtract` | regrouping (none / some / always) missing; Max Number offers only 10 / 100; no support level; Decimal places on "Basic" addition is a second skill | — |
| `subtraction:sub_word_problems` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `subtraction:sub_word_problems_plain` | twin of the picture skill; the picture / plain choice should be a Pictures option, not a separate id; unknown position missing | — |
| `subtraction:missing_add_sub` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `subtraction:sub_5_pictures` | no options at all | — |
| `subtraction:unknown_start_wp` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `subtraction:sub_10_no_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `subtraction:sub_10_regroup` | only notation + support level; no band / number-line / ten-frame option | level = [0]: printed sheet identical to the default sheet |
| `subtraction:sub_10_mixed` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `subtraction:sub_20_no_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `subtraction:sub_20_regroup` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `subtraction:sub_20_mixed` | only notation; no support (ten frame / number line / pictures) and no way to change size or regrouping inside the skill | — |
| `subtraction:sub_50_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_50_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_50_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_10k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_10k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_10k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100k_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100k_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_100k_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1m_no_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1m_regroup` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_1m_mixed` | no options at all: regrouping and band live in 18 separate ids; no Support level (regroup boxes stay, hints fade) and no notation | — |
| `subtraction:sub_wp_10` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_10_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_20` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_20_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_50` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_50_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_100` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_100_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_1k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_1k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_10k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_10k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_100k` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_100k_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_1m` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:sub_wp_1m_plain` | no options at all: band, unknown position and pictures are separate ids; should be one skill with Numbers to / What is missing / Pictures | — |
| `subtraction:nl_sub` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `subtraction:number_line_sub` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `subtraction:mixed_add_sub` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `subtraction:mixed_subtraction` | no options at all | — |
| `subtraction:sub_across_zeros` | no support level (regroup boxes, place letters) and no "how many zeros" control | — |
| `subtraction:sub_missing_digit` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `subtraction:sub_check_by_adding` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `multiplication:mult_facts` | fact range "to 10 / to 12" (P-31) missing; no skip-count strip / array cue option | — |
| `multiplication:multiply` | digits × digits (1×1, 2×1, 2×2) missing; Max Number offers only 100 / 1,000; no support level | — |
| `multiplication:arrays_groups` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `multiplication:dot_array_mult` | no options at all | — |
| `multiplication:mult_properties` | no options at all | — |
| `multiplication:mult_word_problems` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `multiplication:mult_word_problems_plain` | twin of the picture skill; the picture / plain choice should be a Pictures option, not a separate id; unknown position missing | — |
| `multiplication:mult_comparison` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `multiplication:mult_comparison_plain` | twin of the picture skill; the picture / plain choice should be a Pictures option, not a separate id; unknown position missing | — |
| `multiplication:area_model_mult` | no options at all | — |
| `multiplication:area_model_mult_hard` | no options at all | — |
| `multiplication:mult_div_fact_family` | no band, no "which member is missing" control | notation = ["bracket"], ["fraction"], ["across", "bracket", "fraction"]: printed sheet identical to the default sheet |
| `multiplication:number_families_mult` | Support level also moves the number size (P-1 breach, documented); a separate band option is missing | — |
| `multiplication:mult_chart` | no options at all | — |
| `multiplication:mult_chart_easy` | no table range (to 5 / 10 / 12) | — |
| `multiplication:nl_mult` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `multiplication:mixed_multiplication` | no options at all | — |
| `multiplication:repeated_add_to_mult` | no options at all | — |
| `multiplication:equal_or_unequal_groups` | no options at all | — |
| `multiplication:mult_zeros` | no options at all | — |
| `multiplication:mult_placeholder_zero` | no options at all | — |
| `multiplication:mult_missing_digit` | no options at all | — |
| `division:div_facts` | fact range missing; think-box option (P-31) missing; constant 0 is labelled "Divide by 0" but deals 0 ÷ n | constant = [0]: fact outside the ticked set {0}: 0 ÷ 9, 0 ÷ 2, 0 ÷ 4 |
| `division:divide` | digits × digits (1×1, 2×1, 2×2) missing; Max Number offers only 100 / 1,000; no support level | — |
| `division:div_remainders` | no options at all | — |
| `division:div_word_problems` | unknown position (result / change / start) missing; no schema-diagram / pictures support; Decimal places offered on K-3 stories | — |
| `division:div_word_problems_plain` | twin of the picture skill; the picture / plain choice should be a Pictures option, not a separate id; unknown position missing | — |
| `division:remainder_interpret` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `division:remainder_contexts` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | range = 100, 1000: printed sheet identical to the default sheet |
| `division:box_division_easy` | no options at all | — |
| `division:box_division_hard` | no options at all | — |
| `division:area_model_div_2by1` | no options at all | — |
| `division:area_model_div_3by1` | no options at all | — |
| `division:long_div_2digit` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `division:missing_mult_div` | three-notation mix only ever deals the fraction bar; no support | notation = ["bracket"], ["fraction"], ["across", "bracket", "fraction"]: printed sheet identical to the default sheet |
| `division:nl_div` | no number-line support fade (labelled ticks / jumps drawn / bare line) | — |
| `division:mixed_mult_div` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `division:mixed_division` | no options at all | — |
| `division:share_into_groups` | no options at all | — |
| `division:div_equation_parts` | no options at all | — |
| `division:div_zero_in_quotient` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `division:remainder_too_big` | no options at all | — |
| `division:div_check_by_multiplying` | Max Number / Decimals only (measured); no support control, no skill-specific difficulty control | — |
| `division:div_fix_estimate` | no options at all | — |
| `integers:number_line_int` | no number-line support fade; no "which signs" control | — |
| `integers:add_int` | no number-line support fade; no "which signs" control | — |
| `number_ops_mixed:number_families_mixed` | Support level also moves the number size (P-1 breach, documented); a separate band option is missing | — |
| `number_ops_mixed:which_sign` | Max Number only | — |
| `fractions:write_fraction` | no options at all; no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fractions:equiv_frac_visual` | no options at all; no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fractions:fraction_of_set` | no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fractions:compare` | no options at all; no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fraction_operations:add_fractions_like` | no options at all; no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fraction_operations:sub_mixed_unlike_nv` | no options at all; no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | — |
| `fraction_operations:frac_as_div_nv` | no denominator set (halves / thirds / fourths …) or like / unlike control; no fraction-model support | range = 50, 100: items identical to the default (the control does nothing) |
| `decimals:add_decimal` | "Whole numbers" offered on a decimal skill; no place-value chart / grid support | decimals = 0: decimals appear with "Whole numbers" |
| `decimals:div_decimal` | "Whole numbers" offered on a decimal skill; no place-value chart / grid support | decimals = 0, 2: decimals appear with "Whole numbers" |
| `decimals:round_decimals` | "Whole numbers" offered on a decimal skill; no place-value chart / grid support | — |
| `decimals:order_decimals` | "Whole numbers" offered on a decimal skill; no place-value chart / grid support | decimals = 0: decimals appear with "Whole numbers" |
| `conversions:d_to_p` | no options at all | — |
| `shapes_early:count_edges_faces_vertices` | no options at all | — |
| `area_perimeter:perimeter` | Max Number only; no grid / unit-square support, no units choice | — |
| `area_perimeter:area` | Max Number only; no grid / unit-square support, no units choice | — |
| `area_perimeter:volume` | Max Number only; no grid / unit-square support, no units choice | — |
| `angles_lines:identify_angles` | no options at all | — |
| `coordinates:coordinate_q1` | Max Number only; no grid / unit-square support, no units choice | — |
| `measurement:time_5min` | no options at all | — |
| `measurement:money_count` | coin set (pennies-dimes / all coins) missing; "Up to 1,000" changes nothing | range = 1000: items identical to the default (the control does nothing) |
| `measurement:length_metric` | no options at all | — |
| `graphs:bar_graph` | scale / key choice missing; no gridlines support | — |
| `graphs:mixed_graphs` | mixed pool: Max Number values do nothing | range = 10, 20, 50, 100, 1000: items identical to the default (the control does nothing) |
| `data_analysis:median` | scale / key choice missing; no gridlines support | — |
| `patterns:skip_count_line` | step size missing; no number-line support | — |
| `patterns:halve` | step size missing; no number-line support | — |
| `algebra:tape_diagram` | unknown position / schema support missing | — |
| `algebra:solve_unknown` | unknown position / schema support missing | — |
| `order_of_operations:mixed_order_ops` | no "brackets / no brackets" or number-of-steps control | range = 1000, 10000: printed sheet identical to the default sheet |
| `placevalue:more_less_10` | no support (hundreds chart / number line); band gated behind Max Number; more_less_100 band has one value | band = 120: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:more_less_100` | no support (hundreds chart / number line); band gated behind Max Number; more_less_100 band has one value | band: only one value — a control with no choice<br>step = 10: refused at Max Number 100 (no items); works at 10000000 (gated)<br>dir = "less", "both": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `placevalue:place_value_disks` | no place-value mat labels support option; band gated | band = 99, 9999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:pv_disks_build` | no place-value mat labels support option; band gated | band = 99: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:pv_digit_drag` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 999, 9999, 999999: refused at Max Number 100 (no items); works at 10000000 (gated) |
| `placevalue:number_word_names` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 999, 9999, 99999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:place_value_10x` | "Decimals (Level 5)" is jargon; band values above 10,000 change nothing; no place-value chart support | power = [100], [1000], [10, 100, 1000]: refused at Max Number 100 (no items); works at 10000000 (gated)<br>band = 1000, 100000, 1000000: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:identify` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated)<br>places = [100], [1000], [10000], [100000]: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:value` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:compare` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:expand` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:combine` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:order_least_to_greatest` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:order_greatest_to_least` | no place-value chart / labels support; band help says "bounds the answer" (wrong here: it bounds the number); band gated behind Max Number | band = 99, 9999, 99999, 999999: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `placevalue:mixed_placevalue` | mixed pool with no options | — |
| `number_sense:rounding_visual` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | place = 100, 1000: refused at Max Number 100 (no items); works at 10000000 (gated)<br>band = 1000, 10000: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `number_sense:nearest_10` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band = 1000, 10000, 100000, 1000000, 10000000: does nothing at Max Number 100; only works once Max Number is raised (gated) |
| `number_sense:nearest_100` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band = 10000, 100000, 1000000, 10000000: refused at Max Number 100 (no items); works at 10000000 (gated)<br>support = "line", "none": refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never", "only": refused at Max Number 100 (no items); works at 10000000 (gated)<br>response = "circle-all": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:nearest_1000` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band = 100000, 1000000, 10000000: refused at Max Number 100 (no items); works at 10000000 (gated)<br>support = "line", "none": refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never", "only": refused at Max Number 100 (no items); works at 10000000 (gated)<br>response = "circle-all": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:nearest_10000` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band = 1000000, 10000000: refused at Max Number 100 (no items); works at 10000000 (gated)<br>support = "line", "none": refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never", "only": refused at Max Number 100 (no items); works at 10000000 (gated)<br>response = "circle-all": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:nearest_100000` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band = 10000000: refused at Max Number 100 (no items); works at 10000000 (gated)<br>support = "line", "none": refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never", "only": refused at Max Number 100 (no items); works at 10000000 (gated)<br>response = "circle-all": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:nearest_million` | panel is the model to copy, but the whole skill is refused / gated at the default Max Number; support value label truncates | band: only one value — a control with no choice<br>support = "line", "none": refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never", "only": refused at Max Number 100 (no items); works at 10000000 (gated)<br>response = "circle-all": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:round_sort_10` | measured Max Number offers values that refuse the skill; no number-line support | range = 10: no items at any Max Number |
| `number_sense:round_sort_100` | measured Max Number offers values that refuse the skill; no number-line support | tiles = 8: refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never": refused at Max Number 100 (no items); works at 10000000 (gated)<br>range = 100: no items at any Max Number |
| `number_sense:round_sort_1000` | measured Max Number offers values that refuse the skill; no number-line support | tiles = 8: refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never": refused at Max Number 100 (no items); works at 10000000 (gated)<br>range = 100: no items at any Max Number |
| `number_sense:round_sort_10000` | measured Max Number offers values that refuse the skill; no number-line support | tiles = 8: refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never": refused at Max Number 100 (no items); works at 10000000 (gated)<br>range = 100: no items at any Max Number |
| `number_sense:round_sort_100000` | measured Max Number offers values that refuse the skill; no number-line support | tiles = 8: refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never": refused at Max Number 100 (no items); works at 10000000 (gated)<br>range = 100: no items at any Max Number |
| `number_sense:round_sort_million` | measured Max Number offers values that refuse the skill; no number-line support | tiles = 8: refused at Max Number 100 (no items); works at 10000000 (gated)<br>midpoint = "never": refused at Max Number 100 (no items); works at 10000000 (gated) |
| `number_sense:round_sort_tenths` | measured Max Number offers values that refuse the skill; no number-line support | — |
| `number_sense:round_sort_hundredths` | measured Max Number offers values that refuse the skill; no number-line support | — |
| `number_sense:estimate_sum` | Max Number only; no strategy support (number line / ten frame) | — |
| `number_sense:estimate_diff` | Max Number only; no strategy support (number line / ten frame) | — |
| `number_sense:estimate_sums_diffs` | no "round to" place control; no rounding-first support; "Closest estimate" deals "Is it reasonable?" on two of three | task = "closest": "Closest estimate" but no item asks it |
| `number_sense:estimate_products` | no "round to" place control; no rounding-first support; "Closest estimate" deals "Is it reasonable?" on two of three | task = "closest": "Closest estimate" but no item asks it |
| `number_sense:estimate_quotient` | no "round to" place control; no rounding-first support; "Closest estimate" deals "Is it reasonable?" on two of three | — |
| `number_sense:rounding_table` | Max Number only; no strategy support (number line / ten frame) | — |
| `number_sense:make_a_ten` | no options at all; Max Number only; no strategy support (number line / ten frame) | — |
| `number_sense:doubles_near_doubles` | no options at all; Max Number only; no strategy support (number line / ten frame) | — |
| `number_sense:compensation` | Max Number only; no strategy support (number line / ten frame) | range = 1000: printed sheet identical to the default sheet |
| `number_sense:mixed_number_sense` | Max Number only; no strategy support (number line / ten frame) | — |
| `number_theory:prime_composite` | no number range for factor / prime tasks that the generator honours | * = "*": timed out after 60000 ms |

---

## P12 · every other family (2026-09-25)

**Scope:** every live skill P9 (place value, rounding) and P11 (+ − × ÷, K-2) did not cover.
Blocks: `js/modules/skill-options.js` "P12 · EVERY OTHER FAMILY" (one contiguous section, family
sub-blocks), `js/modules/skill-options-pools.js` (the mixed-review control), the P12 helpers in
`generate-question.js`, `gen-operations.js`, `gen-fractions.js`, `gen-counting.js`,
`gen-data-stats.js`, `gen-measurement.js`, `gen-algebraic.js`, `variant-cycler.js`.

### Panel counts (tests/scripts/ws-options-count.mjs)

| | live | own panel | measured Max Number only | no panel |
|---|---|---|---|---|
| before P12 | 583 | 156 | 132 | 295 |
| after P12 | 583 | 532 | 45 | 6 |

The six with no panel, each with the one-sentence reason (rubric O1 = 8 without a control):
`shape_name_match_2d` / `shape_name_match_3d` (a fixed four-name drag match), `compose_rect_from_squares`
(one fixed 2 × 3 fill), `hotspot_quads` (one fixed task: click the quadrilaterals),
`statistical_question` (pick the statistical question from a fixed bank), `mixed_probability` (a pool
of one skill).

### Mechanisms (each inactive at its default, so an untouched skill deals what it dealt before)

| Mechanism | Where | Used for |
|---|---|---|
| READ | the generator branch reads the option | × ÷ ladder steps, number-family band, box division, data builders, K-2 bands |
| VARIANT | `pickVariant()` asks `variantOverride` (generate-question.js) | the item kinds a generator already rotates (fraction _nv, word problems, ratios, area/perimeter/volume, …) |
| ACCEPT | `p12Acceptor` redraws until the item has the property | `denoms` (families), `forms`/kinds with `match`, `accept: 'max'` bands, `accept: 'dp'` decimal places |
| POST | `p12Post` | `pictures` with `strip: true` (fraction pictures off) |
| ROUTE | `p12RouteFor` before dispatch | time / elapsed / clock-ordering rungs (supersedable, P10 owns time and money) |
| POOL | `narrowPool` | `members` on every mixed review (skills, or topics for grade / "_all" reviews) |

Codec: two-character keys in block 5 of the key registry (`skill-option-keys.js`, 5A … 5M used,
next 5N; they were `XA` … `XM` before anything shipped), append-only and backward compatible —
see design/SHARE_CODES.md.

### Fixes found on the way (pre-existing bugs)

- Real skills whose ids start `mixed_` (`mixed_nl_drag`, `mixed_add_sub`, `mixed_mult_div`,
  `mixed_improper_visual`) were dealt as pools of random siblings; now they generate themselves.
- `word_problems_mixed` / `frac_word_mixed` / `algebra_word_mixed` left `state.skill` swapped, so live
  practice drew every item from the first story kind.
- Pool members that are `_plain` word problems now print without pictures.
- Grade / "_all" reviews looked a picked skill's category up by id (placevalue:compare dealt
  fractions:compare); the category now travels with the pick.

### Self-scores (O1 sense · O2 difficulty · O3 support · O4 works · O5 clarity)

| Family | O1 | O2 | O3 | O4 | O5 | Note |
|---|---|---|---|---|---|---|
| × ÷ ladder steps | 8 | 8 | 8 | 9 | 8 | divisor sets, digit sizes, kinds; pictures where a picture is a hint |
| number families | 9 | 9 | 9 | 10 | 9 | P-1 split: band owns size, level owns blanks; retired ids carry their old band |
| mixed reviews (all) | 8 | 8 | 8 | 9 | 8 | "Which skills / topics"; no support by nature |
| fractions + fraction ops | 8 | 8 | 8 | 9 | 8 | denominator families, item kinds, pictures off on the visual twins |
| decimals, conversions | 8 | 8 | 8 | 9 | 8 | places, kinds, families; Max Number stays where measured |
| geometry | 8 | 8 | 7 | 9 | 8 | shapes / kinds / sizes; no labels-on/off control (gen-geometry figures bake labels) |
| measurement (non-time) | 8 | 8 | 7 | 9 | 8 | units, kinds, marks; no scale-picture fade |
| time, money | 7 | 8 | 7 | 9 | 8 | stop-gap, handed to P10: no clock-numbers or coin-set control yet |
| data | 8 | 8 | 8 | 9 | 8 | question kinds, picture key, data-set size, bars / rows |
| algebra, order of operations | 8 | 8 | 8 | 9 | 8 | forms and operations; size via measured Max Number |
| integers, number theory | 8 | 8 | 8 | 9 | 8 | sign patterns, kinds; factor charts keep Max Number only |
| vocabulary | 8 | 8 | 8 | 9 | 8 | item kind (definition → word is the easy step) |

Below 8: time and money (O1, O3) — owned by P10 now; geometry and measurement O3 (no label fade).
