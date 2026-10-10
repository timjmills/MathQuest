# Wave 2 tagging: Year 2 (US Grade 1) — round 9

Output: `data/curriculum/links/Y2.json` (124 steps, 11 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 124 | 63 | 36 | 25 | 10 | 37 | 52 | 75 |

New proposals: `one_digit_addend`, `make_amount_notes`, `money_difference`, `single_fraction`, `time_past_to`, and in round 3 `sub_from_ten`, `order_pictures`, `compare_measures` (extended to lengths in one unit; shared with Y3).

## Round 9 (after critic Y2–Y3 r8, 7.79 / 7.81): per-step notes, why ownership, building blocks

- **N1 (notes)**: the shared "no later step" sentence is gone. `build.mjs` writes each empty-related note from the
  step's own later-taught block steps, one reason per skill: already linked here; a content marker first taught Wn
  (rule 19); a swap that keeps content above the grade (rule 18); already taught in an earlier step; another topic; or
  "has no skill yet". A later skill with none of these reasons is a `NOTECHECK` build error, so a note can no longer be
  pasted unchecked (0 at build). Hand notes on Y3.B3.S6, B6.S4, B6.S6 and B1.S13 were removed (now school-week reasons
  or a related link).
- **N2 (whys)**: a marker or year swap that changes the key rebuilds the why from the new key only (no kept reason);
  a why that already names its week ("next step / a later step / taught earlier / the same week, Wn") is never re-cited
  to another step; `whyText` for `compare_groups`, `hundreds_chart_fill`, `time_half_hour` ("half past: the minute hand
  makes a half turn"), `div_facts`, `mult_facts`, `equiv_frac_visual`, `double`; the why check reads an ordering answer
  "236,511,961" as a list, not one number (it had rewritten the Y3.B1.S13 next-step whys).
- **N4a / pre and related by key + opts**: a pre whose `parts` / `constant` / `denoms` are a superset of a direct's is
  excluded. A key may sit in both pre and related only when their table / part / form lists are disjoint
  (`mult_facts {constant:[5,10]}` pre beside `{constant:[2]}` related on Y2.B5.S4/S5); a hand related link is promoted
  to pre only when an earlier-taught step owns those opts.
- **linkscan**: the 2-digit / 3-digit column-layout check is gated by school week with the markers' 2-week tolerance,
  not by WRM order (Y2.B2.S4, W5, takes Y2.B2.S15, W6, as its next step).
- **Steps (Y2)**: Y2.B5.S2–S5 related `mult_facts {constant:[2]}` (Y2.B5.S9, W29), S4/S5 also pre
  `mult_facts {constant:[5,10]}` (W26); Y2.B2.S4 related `add_100_no_regroup` (S15, next step, W6) and
  `more_less_10 {step:10}` (S13, W7); Y2.B5.S14 leads with `mult_facts {constant:[10]}`, S16 with `{constant:[5]}`;
  Y2.B2.S2 and S12 lose the 2-digit story and ±10s pres; the half-past whys on Y2.B8.S10/S12 and B11.S3/S4 read "half
  past: the minute hand makes a half turn" and the clock links on B8.S5/S6 (quarter steps) are dropped; Y2.B4.S8 lead
  pre "subtracting a price from the bill paid"; Y2.B8.S3/S5/S7/S13 partition pres are halves / quarters only, never the
  step's own parts; Y2.B5.S12 keeps its counting-in-2s related (dividing by 10 is not the odd/even idea).
- **Scans** (critic r8 scripts on the rebuilt files): `notecheck` 0, `nextscan2` 0, `labwhy2` 0 / 0, `nextscan` 0,
  `labwhy` 0, `prewk` 0, `optcheck` 0, `whyscan` A 0; `dirlink` has no superset pre left: what remains is a related
  next step with its own opts (`arrays_groups {forms:[0]}`, the next table, `length_metric {forms:[0]}`), the A6
  ladders (`mult_facts {constant:[2]}` on ×4, `{constant:[4]}` on ×8 / 2-4-8), the halves and quarters pres on the
  quarter and third steps, and the mixed-facts related the critic accepted. `steprange` NEW = exactly the requested
  links (Y2.B5.S4/S5 `mult_facts {5,10}`, Y3.B3.S1/S2 counting in 2s/5s/10s and the 2, 5 and 10 tables); every r8 NEW
  on Y2.B2.S2/S12 and Y3.B1.S3 is gone; BOTH lines are unchanged since r7. `whyscan` B 125 are related links to steps
  taught later (correct next-step links), C 94 its known false positives (count rows it cannot read in payloads,
  digit-joined order lists, analogy whys). `range` adds only the joined-digit artifact on `order_*` (909596).
  `linkscan` week mode OK. Both files rebuild byte-identical.

## Round 8 (after critic Y2–Y3 r7, 7.88 / 7.74): related by school week, whys keep their reasons, ladders

- **A1 (S13)**: related "next step" links now come from the steps taught AFTER this one by school week (block first,
  then the year, same topic), worded "(next step, W18: …)"; a block step taught earlier is a pre candidate
  "(taught earlier, W18)", whatever its WRM position. Critic `nextscan` **0**.
- **A2 (S12)**: the why check reads count payloads (a number track [10,12,14,16] is counting in 2s) and treats units,
  money and fraction words as content only on measurement / fraction / graph / shape skills (on a number skill they are
  the analogy that explains the link). A rebuilt why describes the skill in words (`whyText` for every rebuilt key, no
  catalogue labels: `labwhy` 0 / 0), keeps the old why's reason after its colon when that reason is true of the items
  and opts, cites the owner step, and says "taught the same week (Wn)" or "taught later (Wn)" instead of "earlier
  learning" ("— earlier learning" 0 / 0). The r6 analogy whys are back (unit_form exchanges, expand "dollars and cents
  as two parts", the 4s doubled, the coin context on Y2.B4.S1, "100 is two 50s", the 100 g scale).
- **A3**: the "earlier step this builds on" suffix and every cited step name the step that owns the link's key with the
  closest opts (exact, then a superset of its rows / tables / parts).
- **A4**: `relOnly` with its own related list (even `[]`) replaces extraRelated and relR3 (Y2.B8.S13 has its note).
- **A5**: a hand `core` pre that the week or content checks would drop is a build error (`COREDROP`, exit 1); the two it
  found were fixed (Y2.B4.S9 money, Y3.B4.S2 tables).
- **A6**: a link is excluded as "the step's own skill" only when key AND opts match (or are empty): Y3.B3.S14/S15 lead
  with `mult_facts {constant:[4]}` ("double each fact for the 8s") beside the direct `mult_facts {constant:[8]}`.
- **B. steps**: all of the critic's list (Y2.B5.S12 number track in 2s; Y2.B8.S13 note; Y2.B4.S8 change from a dollar
  as pre, enough_money related; Y2.B4.S4/S5 money_compare pre; Y2.B2.S2/S3/S16, B3.S1 earlier steps as pre; Y2.B1.S7
  partition first; Y3.B3.S14/S15, S9, S3 ladders; Y3.B4.S2 known fact; Y3.B5.S1/S3/S5/S10 and B11.S4 measuring
  ladders; Y3.B6.S2–S6 fractions on a number line (W18) as pre; Y3.B11.S6; Y3.B1.S3/S10/S11, B2.S1; Y3.B3.S4 coins;
  Y3.B1.S14; Y3.B7.S3). 23 steps whose only related skills were taught earlier now say so in `note`.
- **Scans**: critic r7 `nextscan` 0, `labwhy` 0, `vscan` 0 links, `prewk` 0, `optcheck` 0; `whyscan` A 0, B 100 (all
  related links to steps taught LATER, i.e. correct "next step" links; 0 pre), C 84 = its own false positives: count
  whys on number tracks / count rows it cannot read in the payload, "quarter past" whys on `time_quarter` (clock
  times, not fractions), "number line" on the number-line skills, and the analogy whys r7 asked to restore; `scan9`
  links: `share_into_groups` (r6: clean) and ×8 facts inside the 2, 3, 4, 5 and 10 tables (r4 false positive); r3
  `swap.py` (WRM order) lists 16 related links whose step is earlier in WRM order but taught LATER by school week —
  correct under rule 19. `linkscan (week mode)` OK; both files rebuild byte-identical.

## Round 7 (after critic Y2–Y3 r6, 7.73 / 7.53): inch ruler, skip counts, ÷ payloads, hand-written whys

- **A. `markers.mjs` / `linkscan.mjs`**: no skill is exempted by name any more (the `reading_ruler` customary exemption
  is gone: it is an INCH ruler); the never-in-grade markers read the drawn cell, `screenInstr`, the hint and payload
  options as well as the text; `beyond()` and `div348` read division payloads (`"a":42,"b":6,"op":"/"` = 6 × 7) and, at
  Grade 2, sharing payloads (`"n":24,"size":4`); new `skipBeyond` marker (count steps: Y2 {1,2,3,5,10}; Y3
  {1,2,3,4,5,8,10,50,100}, 4s from Y3.B3.S9 and 8s from Y3.B3.S12; clock / time-line payloads are not count steps),
  also on direct skills. `build.mjs` now tests EVERY why (hand-written ones too) against the link's 60 generated items
  (units, count steps, tables, time and fraction words) and rewrites a why that names content the items lack; the
  rebuilt why describes the skill in words (`whyText`), not with the skill's catalogue label.
- **B. links**: `reading_ruler` dropped from every pre (Y2.B6.S2–S5; Y3.B5, B6.S6/S7, B11.S6–S10) with `ruler_cm` in
  `preBuild`, refilled from `measure_nonstandard`, `place_on_number_line {span:10, band:100}` and `length_metric`
  (new length ladder); `reading_ruler_hard` dropped; `skip_count_line` → `{step:[0], band:50}` (2s and 5s) at Grade 1,
  dropped on Y2.B5.S6–S12, B1.S16 (note) and Y3.B1.S14 (note); Y2.B2.S13/S14 count in 10s (`count_by_tables` 10s
  rows); `div_word_problems` dropped from Y3 links; `mult_frac_whole` dropped; Y2 B8 `equal_or_unequal_groups` →
  `compare_groups` (no "multiply" answer before W26).
- **C. verdicts**: Y3.B3.S5 → partial (÷6, ÷7 word problems) with `muldiv_tables` (now also on `div_word_problems`);
  Y3.B5.S2 and B11.S4 clauses name the inch ruler; Y3.B6.S1 → partial (non-unit items) with `single_fraction`
  (`unit_only`); Y3.B3.S3/S4 `multiples` clauses name multiples of 6, 7, 9; Y3.B12.S1 `pictograph {scale:[0,1,2]}`.
- **D. pre rank**: Y3.B4.S4/S5 add `mult_facts {constant:[3,4,8]}`; B4.S6 leads with `mult_facts` / `div_facts`
  `{constant:[2,3,4,5,8,10]}` and sharing; B4.S8 adds `div_facts {constant:[3,4,8]}`; B4.S2 leads with the known fact and
  unit form; Y2.B3.S7 leads with sides, corners and 2-D names; Y2.B1.S11 adds counting in 10s (`seq_10 {band:50}`:
  band 100 deals 109-129 at W03) and `number_seq_fill {range:100}`, `number_word_form` dropped.
- **E.** Y2.B8.S13 note (quarter to is W36); Y3.B7.S4 `length_metric {forms:[1]}` cites Y3.B5.S5; Y3.B7.S9/S11
  `mass_volume_liquid` why "reading a scale in mL"; Y3.B3.S7/S10 `nl_div {constant:[3]}` / `[4]`.
- **Scans (critic r6 scripts)**: `vscan` 0 links (the 3 direct inch-ruler lines are partials whose clauses name the
  inch ruler); `scan9` links: only (i) Y2 `share_into_groups {band:12}` flagged by its `dividewp` marker — the r6 report
  itself lists this as clean (grouping counters, K content) — and (ii) `mult_facts {constant:[5]}` / `[5,10]` / `[4]`
  hits for "5 × 8", "10 × 8", "4 × 8": facts of the 5, 10 and 4 tables, the "×8 inside a ×5 or ×10 table" false positive
  the r4 critic removed; `stepscan` 26 lines, all `elapsed_*` time-line payloads (`"step":15` / `30` minutes between
  ticks, not skip counts); `whyscan` A 1 (`add_sub_fact_family` cites Y2.B2.S3 "Related facts" — the step the xlsx
  names, tagged to the next key in SKILL_WRM), B 89 — all related "next step" links (0 pre), which the r6 report lists
  as clean — and C 65, all two scanner false positives: `count_by_tables` items are "Count by N. Write the missing
  numbers" with values 0, N, 2N … (no "×" and not "N, 2N, 3N" with spaces), and `time_quarter` whys say "quarter past"
  while items are "3:15" (the fraction-word "quarter" rule fires on a clock). r5 `whyfit` 0, `scan8`/`sys5` unchanged
  (6 = injected lines), `prewk` 0, `fit` 0, `optcheck` 0, `swap` 0, `linkscan (week mode)` OK; the files rebuild
  byte-identical.

## Round 6 (after critic Y2–Y3 r5, 7.70 / 7.44): marker blind spots, S11 whys, never-in-grade directs

- **`markers.mjs`**: reads multiple-choice option labels for the never-in-grade markers (tables beyond the grade,
  customary units, right angles / parallel sides), parses "Fact Family: a, b, c", samples 120 items per link over five
  seed families (the critic's included), `mult2x1` no longer counts 11 × 3 / 12 × 4 (table facts) as 2-digit × 1-digit,
  `ml_l` keyed to "Measure in litres" (W35), the critic's extra markers added (Y2 litres, metres, cm, money; Y3 ×3/×4
  before W11 — 5 × 3 counts as a Grade 1 fact —, fraction compare, fractions on a line, fraction add, Roman numerals).
  `NEVERDIRECT`: the never-in-grade markers also run on every step's OWN direct and partial skills; `build.mjs` reports
  any hit not named in the step's missing clause.
- **S11 (`build.mjs`)**: after any swap or markerFix the `why` is rebuilt from the skill and opts actually linked
  (label + tables / count steps / parts / band + the step where it was taught before this one); a hand `why` that names
  a table, a count step, a unit form or a quarter-past time the opts do not deal is rebuilt the same way; the
  `[rule NN …]` bookkeeping is stripped from every teacher-facing `why` (0 left).
- **S10 links**: `estimate_length {forms:[0]}` everywhere (forms 1 and 2 offer in/ft/mi); dropped on Y2.B1.S11 and
  Y3.B11.S4. `mult_properties` dropped from Y3 links (`props_tables` preBuild); `mult_div_fact_family` links →
  `mult_facts {constant:[2,3,4,5,8,10]}`; Y3.B3.S7 `mult_zeros {forms:[0]}`; Y3.B3.S8/S9/S11 `nl_mult {constant:[3]}` /
  `[4]` band 50 restored; Y3.B4.S1/S2/S4/S5 related replaced (10 row of the chart, unit form, the inverse by
  partitioning `area_model_div_2by1 {constant:[2,3,4,5,8]}`); Y3.B2.S19 `money_change` dropped.
- **Direct verdicts**: Y3.B4.S6 → partial (÷7, ×11, ÷12, fact families 6, 7, 42) + new option `muldiv_tables`;
  Y3.B4.S10 → partial (×6, ×9) + new option `comparison_tables`; Y3.B4.S2 → partial (70 × 7, 3 × 60 are common, not rare)
  + new option `zeros_tables`; Y2.B3.S7 clause names right angles and parallel sides. Every NEVERDIRECT hit is now a
  partial whose clause names it (Y2.B3.S7; Y3.B4.S2–S6, S10, B7.S9; Y3.B8.S5's only hit is a "10 ÷ 6" distractor).
- **Step fixes**: Y2.B9.S6 counting in 5s leads pre; Y2.B8.S12 / S13 clauses name sixths, twelfths, 5/3 / eighths,
  fifths; Y2.B11.S3 / S4 and the B8 half-past links say "half past: the minute hand makes a half turn"; Y3.B4.S4 leads
  with `mult_zeros {forms:[0,2]}` and partitioning, `div_remainders` dropped; Y3.B4.S7 adds `div_facts {3,4,8}`;
  Y3.B2.S21 leads with fact families and missing numbers; Y3.B6.S4 vertex counting dropped; Y3.B6.S1 related
  `compose_whole` (no false note); Y3.B7.S4 note corrected (l ↔ ml is W34, before); Y3.B1.S13 clock link removed, note
  added; counting rows match their whys (Y3.B3.S4 5s and 10s, B3.S12 4s doubled, B3.S13 8s); Y3.B7.S3 / S4
  `length_metric {forms:[1]}` (m ↔ cm) to match "exchange with 100"; Y3.B11.S1 drops `reading_ruler`.
- **Scans**: critic r5 `whyfit.mjs` **0 / 0**; `sys5.py` S10 links **Y2 0**, **Y3 6 — all six are the script's
  hard-coded fact-family lines** (added unconditionally); the data has **no** `mult_div_fact_family` pre/related link
  left (checked), and every direct/partial in its never-in-grade list is a partial whose clause names the content.
  `scan8.mjs` raw: Y2 12 `thirds` (the 4/3 distractor in `partition_shapes`, which sys5 removes) + 1 named direct;
  Y3 one `times34` (5 × 3 in the 5 times-table, which sys5 removes) + named directs. `prewk` 0 / 0, `fit` 0,
  `optcheck` 0, `linkscan (week mode)` OK. The r4 `scan6.mjs` still flags `nl_mult {constant:[3]}` / `[4]` (11 × 3,
  11 × 4) under its old `mult2x1` — the false positive r5 asked to fix and restore.

## Round 5 (after critic Y2–Y3 r4, 7.64 / 7.53): rule 19, school-week order

- **Pre tiers follow the SCHOOL week (xlsx), not WRM block order** (`build.mjs`). "The step before" is now the latest
  step on the same topic taught before this one; earlier-in-block, xlsx and rule-14 promotions only take steps taught in
  an earlier week (or earlier in the same week); earlier grades always count. A pre whose `why` cites only same-year
  steps taught later is dropped; when it also cites earlier-grade learning, the later name is removed from the `why`.
- **Content markers by week** (`tests/scripts/wrm-tagging/markers.mjs`, shared by `build.mjs` and `linkscan.mjs`):
  every link is generated (10 + 8 items, two seed families) and checked for content first met later than the step's
  week + 2 (Y2: thirds W31, quarter past W36, 5-minute times W37, ÷ W31, × W26, g/kg, ml/l, tally, pictogram; Y3: ÷3/4/8
  W31, ×8, fractions beyond quarters, equivalence W37, right angles W28, parallel/perpendicular W29, L ↔ mL W34, kg ↔ g,
  2-digit × ÷ 1-digit, rounding, perimeter, mm, a.m./p.m.) and for content never in the grade (×/÷ 6, 7, 9 at Grade 2,
  ×/÷ beyond 2/5/10 at Grade 1, decimals, right angles at Grade 1, customary units). A flagged link tries the
  `markerFix` alternatives (e.g. `partition_shapes {parts:[0,2]}`, `time_half_hour`, `div_facts {constant:[2,5,10]}`,
  `nl_mult {constant:[2,3,4,5,10], band:50}`, `box_division_easy {constant:[2,3,4,5,8]}`, `estimate_length {forms:[0,1]}`)
  and is otherwise dropped; the topic ladder (now with fractions and money ladders citing K learning) refills pre.
  Steps left without an honest related skill say why in `note` (Y2.B5.S1, B7.S1, B9.S1, B9.S6, B11.S2–S4; Y3.B1.S13,
  B2.S21, B4.S9, B6.S1, B6.S7, B7.S4, B7.S8, B7.S9, B11.S4).
- **Scans** (critic r4 scripts, re-run): `scan6.mjs` TOL=2 → Y3 0; Y2 10 raw lines, all `repeated_add_to_mult`
  (4 + 4 + 4 + 4 = 4 × 4), which `sys4.py` excludes as fine at Grade 1 → **`sys4.py` 0 / 0**; **`prewk.mjs` cite-later
  0 / 0, key-later 0 / 0**; `fit.mjs` 0; `relfit.mjs week` Y3 0, Y2 only Y2.B1.S1 (K learning, allowed); `optcheck` 0;
  `swap.py` 0 / 0. `direct6.mjs` lists Y3.B4.S4/S5 partials (`multiply`, `area_model_mult` have no table option): their
  missing clauses now name the ×6, ×7, ×9 items. `sys3.py` (round 3, WRM order) still lists pre "citing a later step" by
  WRM order (Y2 7, Y3 10); every one is taught EARLIER by school week (e.g. the 5 and 10 tables W26 before "Recognise
  equal groups" W27), which is what rule 19 asks. **`linkscan (week mode): OK`** with the marker check added.
- **Step fixes (Y2)**: `compose_from_attributes` (right angles, parallel sides) is gone from every B3 pre;
  `partition_shapes` is halves and quarters before W31; `time_quarter` / `time_5min` / `elapsed_hour` are gone from steps
  before W36 / W37 (B8, B9.S1, S6, S7, B11.S3, S4); `div_facts` ÷5/÷10 gone from B5.S15/S17 pre; the kg-scale related
  link on B7.S1 is gone; `tally_chart` / `build_pictograph` are off B10.S2 (W20); `estimate_length {forms:[0,1]}`
  (form 2 is the ft/mi/in sort). The B11.S2–S4 notes are rewritten: time skills are later learning by school week.

## Round 4 (after critic Y2–Y3 r3, 7.55 / 7.60): rule 18 content and layout of every link

- **S9, year-wide link swaps** (`overrides.mjs` `linkSwap`, applied in `build.mjs` after the link opts). Rule 12 (an
  earlier partial stays as pre) yields to rule 18 when that partial deals content above the pupil.
  - Y2 fractions: `shade_fraction`, `identify`, `write_fraction` → `partition_shapes {parts:[0,1,2]}` (halves, thirds,
    quarters only); `equiv_frac_*`, `select_equiv_frac`, `compose_whole`, `fraction_number_line` dropped with
    `single_fraction` in `preBuild`; `fraction_of_set(_nv)` → `halve {band:20}`. A `frac` topic ladder refills pre.
  - Y2: `which_sign` and `balance_addsub` dropped; `pictograph` links → `pictograph_intro`; `add_50_regroup` /
    `sub_50_regroup` before Y2.B2.S15 → `add_10_regroup` / `sub_10_regroup {notation:['across']}`; the 2-digit column
    steps are no longer "next step" related before S15; 1-digit facts are written across before S15
    (`add_facts`, `sub_facts`, `add_10_mixed`, `add_20_mixed`).
  - Y3: `fractions:compare` and `order_fractions` dropped (unlike pairs are 4.NF.A.2) with `compare_kind` in
    `preBuild`; `missing_mult_div` (deals × 12) → `div_facts {constant:[2,3,4,5,8,10]}`; `unit_conversions` dropped;
    3-digit column steps are no longer related before Y3.B2.S11; 1-digit facts across before S11.
  - Both years: every `coordinates:` link dropped. Steps left without a related skill got hand entries that share the
    idea (quarter / half past for quarter / half turns and fractions, `compose_shapes`, `between_tens`, the inverse
    across-10 fact …); Y2.B11.S2 says in `note` why none fits (S3 / S4 now have a half-past related link).
- **`linkscan.mjs`, rewritten**: week-relative by default (a link must fit the largest number the pupil has met by that
  school week, xlsx order, never below the previous year's range: K counts to 100, Grade 1 to 120), plus content and
  layout checks: Y2 denominators 2/3/4 only, Y3 compares sharing a numerator or denominator, no coordinate skills (no
  longer skipped), no × ÷ in Y2 sign/balance links, no customary units, no 2-digit column layout before Y2.B2.S15 and no
  3-digit column layout before Y3.B2.S11. **Result: `linkscan (week mode): OK`** (0 flags; the year mode is `--year`).
  The critic's own scripts: `fit.mjs` **0**; `relfit.mjs week` **Y3 0, Y2 6 links on Y2.B1.S1 only** (counting and
  2-digit place value to 100 on the "Numbers to 20" step: K learning, noted on the step, which the critic allowed);
  `sys3.py` Y3 clean, Y2 3 empty related (Y2.B11.S2–S4, noted); `swap.py` 0 / 0; `optcheck.mjs` 0. `steplink.mjs`
  still lists `add_50_regroup` / `sub_50_regroup` as stacked on Y3.B2.S4–S10 pre: 2-digit columns the pupil met in
  Y2.B2.S15–S18 (the skill has no `notation` option).
- **Step fixes (Y2)**: B7.S1 Compare mass → partial (pictures only; balance scale and "same mass" missing) with
  `compare_measures` (balance-scale form added); B2.S20 → gap (`equal_sign` deals plain sums), own clause, build
  `compare_sentences`; B3.S5 → partial (diagonals, "4 lines") + new option `symmetry_vertical`; B3.S12 → partial (no 3-D
  shapes) + new option `pattern_3d`; B10.S7 `pictograph {range:50, scale:[0,1,2]}` (keys 2, 5, 10; values ≤ 50);
  pre rungs: B2.S11 bonds to 10 first, B9.S5 counting in 5s, B10.S6 counting in 2s/5s/10s; B10.S3 pre no longer cites
  the later S5; B1.S14 single missing clause; `enough_money` links carry `currency:'usd'`.

## Round 3 (after critic Y2–Y3 r2, 7.53 / 7.45) — fixed in the generator, file-wide

- **S6, pre ranked by building block** (`build.mjs`). Every pre candidate gets a tier, and the list is sorted by tier
  before the cap of 8: hand pre → the step before and hand `core` keys (the main building block) → an EARLIER step's
  skill that was named as related (brief rule 14: it moves to pre) → xlsx prior learning on the same topic → earlier
  steps of the block → cross-topic xlsx entries → previous year (only while < 3) → the topic ladder (only while < 3).
  Related takes hand entries and the NEXT steps only (d = +1 … +4), never an earlier step of the block and never a pre
  key. `odd_even` / `select_even_odd` are dropped from every step whose title is not about odd and even. The pv → ×
  filter now keeps "Partition" for 2-digit × 1-digit.
- **S7, topic ladders** (`overrides.mjs` `ladders`): length, mass, capacity, temperature, time, statistics, position
  and shape each have an earlier-learning ladder (scale = number line, counting in 2s/5s/10s, compare language,
  heavier/lighter, clock parts …); a step with fewer than 3 pre entries is topped up from it. `build.mjs` reports any
  step still under 3 (`THINPRE`): none.
- **Rule 16** (`gapMissing`): every gap step has its own missing clause, and `closes` copies it; `build.mjs` reports a
  gap step without one (`NOMISSING`) and any `closes` equal to the proposal's `teaches` (`CLOSES=TEACHES`): none.
  A reused proposal that no longer closes a step of this year lists it in `dropSteps` (e.g. `add_next_10` drops
  Y2.B2.S11) so the lead's merge removes it. `exchange_count` and `within_whole` name every skill they are an option on
  (`skills`).
- **Critic counts re-run** (its `sys.py`, `swap.py`): related = an earlier step's skill in the same block **0 / 0**;
  pre ≤ 1 entry **0 / 0** (minimum pre is now 3 on every step); odd/even pre on a non-odd/even step **0 / 0**;
  gap `closes` = `teaches` **0 / 0**; full verdict with partial entries **0 / 0**; empty related **0 / 0**;
  pre = related **0 / 0**; own build in preBuild **0 / 0**.
- **Rule 18, links carry opts** (lead, 2026-10-10). Every pre and related entry now has `opts`: the opts its referenced
  step uses for that key (e.g. `mult_facts {constant:[3]}` from Y3.B3.S6, `band:99` from Y2 place value), else the year
  default in `overrides.mjs` `linkOpts` (Y2: tables 2/5/10, `band` 20–99 on counting, doubling, place value and bar
  models, halves; Y3: tables 2/3/4/5/8/10, `band` 999 place value, denominators 2/3/5, US money opts), else a per-link
  fix (`linkFix`). Links no option can narrow are dropped in that year (Y2 `mult_word_problems` deals 5 × 8;
  `fraction_of_set` ignores denoms; Y2 `capacity`, `length_metric`, `unit_conversion_word`; Y3 `count_by_tables` 100s
  past 1,000 on the to-100 steps) and replaced where a step was left without related.
  `tests/scripts/wrm-tagging/linkscan.mjs` generates 8 items of every link with its opts and flags numbers past the
  year's range (Y2 120 = 1.NBT.A.1, Y3 1,000; measures Y2 2,000 g/ml, Y3 5,000; money in cents; clock, angle and grid
  skills not range-checked): **243 flagged before, 0 after** (`linkscan: OK`). Links with explicit opts: Y2 390 of
  924, Y3 484 of 1,010 (the rest are skills whose defaults already sit inside the year).
- **Self-check**: 10 random steps per year re-judged from generated items (Y2: B1.S16, B3.S4, B5.S6, B11.S3, B5.S7,
  B7.S2, B9.S6, B1.S14, B10.S2, B2.S13; Y3: B5.S2, B2.S8, B9.S5, B10.S6, B3.S7, B3.S1, B4.S2, B2.S14, B12.S3, B12.S2).
  Two weak ladders found and fixed with `core` (Y2.B1.S16 Count in 3s now starts from counting in 2s/5s/10s;
  Y2.B2.S13 10 more/less from counting in 10s and tens-and-ones).

Round 3 step fixes (S8):
- **Y2.B4.S9 Find change**: `money_change {currency:'usd', step:100, paid:'note', band:2000}` — generated: $5, $10,
  $20 paid, change $1–$8 (round 2's opts gave $1 change on every item). Pre now starts with subtraction stories
  (`sub_wp_100`) and adding prices.
- **Y2.B6.S3 / S4 compare / order lengths**: `compare_lengths` (Y3 mixed units) replaced by `compare_measures`, now one
  new skill for length, mass and capacity with one-unit pages first (24 cm < 31 cm), then mixed units.
- **Y2.B2.S11 Subtract from a 10**: gap with its own clause (40 − 3 = 37) and a new option `sub_from_ten` on
  `sub_100_mixed`; `add_next_10` drops the step.
- **Y2.B10.S3 Block diagrams**: partial with `bar_graph_intro` (1-to-1 bars); missing: drawing, squares as blocks.
- **Y2.B1.S14 Order objects and numbers**: partial (numerals only) → new option `order_pictures`.
- **Y2.B8.S4 Find a half**: full through `halve {band:20}`; the shade_fraction partial moved to related.
  S6 / S8 missing clauses now name a quarter / a third of a quantity.
- **Y2.B4.S2–S4 money**: pre starts with counting in 5s and 10s (`count_by_tables`); make_ten / add_5_pictures dropped.
- **Y2.B2.S6, B5.S13, B3.S8–S10**: make_ten, seq_10 and 3-D naming are now tier-1 pre.

## Method (round 2, after critic Y2–Y3 r1)

- **Generated, not inherited.** Every direct and partial skill of every step was generated with `generateQuestionFor`
  (6 items, the opts recorded in the links file) by `tests/scripts/wrm-tagging/items.mjs`; the first 3 of each are logged in
  `Y2-Y3-items.md`. Hand verdicts live in `tests/scripts/wrm-tagging/overrides.mjs`; `build.mjs` writes the links file.
- **Options are values.** No `opts.note` is left (the build refuses one). Old SKILL_WRM notes become opts only when they name
  a real value (`band 999`); every other step needing an option has hand opts read from `skill-options.js`
  (`constant`, `forms`, `band`, `kind`, `currency:'usd'`, `wordform`, `rows`, `stimulus`, `span` …).
- **Range inside the step.** Y2 place-value skills carry `band: 99` (the default 999 deals 3-digit numbers). A skill whose
  items leave the step (mixed_add_sub sums past 100, box_division_easy "no exchange" dealing 75 ÷ 5, identify/write_fraction
  denoms [2,3] dealing 7/8) is partial or moved to related.
- **Pre-skills filtered.** A week-list prior step is kept only when its topic feeds the step's topic, and only from this
  year or the year before; cross-topic entries only when they are the building block (fractions ← sharing/grouping, time ←
  counting in 5s, tables ← counting in steps). Test-row weeks and thin lists fall back to earlier steps in the block, then
  the previous year on the same topic. Never empty. `preBuild` uses the same filter and never holds the step's own build.
  Six steps whose filtered list was still weak have hand ladders (`prePatch`).
- **Related share the idea** (inverse, same concept in another form, next step); never a pre key; no same-cluster padding.
  Every step has at least one.
- **Proposals (rule 13, short).** Each carries `name`, `kind` (`kindText`), `teaches`, `closes` (per step, the exact
  missing clause) and `representation`. Reused only after checking `skill-options.js`: built ones go to `retireBuilt`
  (count_50s for Y3.B1.S14, count_3s, shape_faces, money_uk for notes).

## Hardest calls

- **Y2.B2.S14 Add and subtract 10s**: partial (add_sub_10s is decade ± 10 only) → `tens_any`.
- **Y2.B4.S2 / S3 money**: full with `money_count {kind:'note'|'both', currency:'usd'}`; `money_uk` is built for them.
  **S4** partial (coins only, fewest) → `make_amount_notes`; **S7** partial (no difference) → `money_difference`.
- **Y2.B8 fractions**: `denoms` picks a family, so every "one fraction" step (S6, S8, S10–S14) is partial →
  `single_fraction`; `fraction_of_set` ignores denoms (bug), so it is never claimed full. S4 Find a half is full through
  `patterns:halve {band:20}` for amounts.
- **Y2.B9.S3 / S4 past and to the hour**: partial; the words stimulus mixes past and to → `time_past_to`.
- **Y2.B3.S8–S10 faces, edges, vertices**: full with `count_edges_faces_vertices {forms:[0]|[1]|[2]}`.

## Owner questions (with suggested answers)

1. `count_edges_faces_vertices` says a cylinder has 3 faces; WRM Y2 says 2 flat faces and 1 curved surface. *Suggested: follow WRM — count flat faces, name the curved surface.*
2. `fraction_of_set` ignores `denoms` in its missing-numerator items. *Suggested: fix the generator before `single_fraction`/`fos_kind`.*
3. Above-grade WRM steps (×/÷, g/kg, ml/l) at Grade 1: *suggested: keep them tagged; pages use the smallest band.*
