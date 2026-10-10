# Wave 2 tagging: Year 3 (US Grade 2) — round 3

Output: `data/curriculum/links/Y3.json` (134 steps, 12 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 134 | 56 | 48 | 30 | 11 | 42 | 46 | 66 |

New proposals: `more_less_1_3digit`, `hundreds_any`, `exchange_count` (owner ruling: none / one in the ones / one in
the tens / two or more, on every + − × ÷ regroup band), `two_and_three_digit`, `compare_kind`, `metric_mass_capacity`,
`compare_measures`, `within_whole`, `fos_kind`, plus `money_difference` shared with Y2 and `sub_from_ten` (Y2's option, a prerequisite here). Round 3 extends `more_less_1_3digit` (ones on a 3-digit number), `within_whole` (subtraction) and `compare_measures` (lengths, one unit first).

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
- **Y3.B9.S5 Find change**: `money_change {currency:'usd', step:5, paid:'note'}` — generated: $1 or $5 paid, change in
  dollars and cents ($1.25, $3.95). Pre starts with column subtraction (`sub_1k_mixed`); Y3.B9.S4 likewise.
- **Y3.B2.S2 Add and subtract 1s**: the `add_100_no_regroup` partial is removed (it deals 41 + 30); gap → the
  `more_less_1_3digit` option, extended to "ones" (234 + 5, 238 − 6).
- **Y3.B11.S3 Compare angles**: partial with `identify_angles {forms:[0]}` (names one angle; straight angles appear);
  missing: comparing angles with a right-angle tester.
- **Y3.B9.S2 Dollars and cents**: partial with `money_notation {currency:'usd', task:'words'}`; missing: cents ↔ dollars
  both ways (345 cents = $3.45).
- **Y3.B8.S2 Subtract fractions**: partial (compare-to-½ sort items mixed in; `forms:[0]` on the no-visual skill
  removes "simplify"); `within_whole` now covers subtraction too.
- **Y3.B1.S13 Order to 1,000**: `compare` (S12) is the first pre. **Y3.B4.S4 / S5**: partitioning (`expand`) and
  multiples of 10 (`mult_zeros`) are tier-1 pre; odd/even are gone. **Y3.B4.S10**: `div_remainders` and odd/even
  dropped. **Y3.B12.S5 / S6**: `tally_chart` is pre.
- **Measurement (S7)**: B7.S1, S7, S8, S9 now have 3–4 rungs (scale = number line, counting in steps, the Y2 measure
  skill, compare language); B7.S7 keeps `capacity` and adds the scale and compare rungs.

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

- **Y3.B2.S1 Apply number bonds**: partial (add_sub_10s / add_sub_100s are decade/hundred ± one unit) → `add_sub_patterns`; Y3.B2.S3 → `tens_any`.
- **Y3.B2.S13–S16, Y3.B4.S4/S5/S7**: the regroup bands mix exchange places, and `box_division_easy {regroup:'none'}` still deals 75 ÷ 5 → `exchange_count`.
- **Y3.B3 tables**: full with `mult_facts {constant:[n]}` and `count_by_tables` rows from 0; S15 (2-4-8 links) partial → `tables_links`.
- **Y3.B5.S5 / S6, Y3.B7.S4 / S9 mixed units**: partial → `mm_cm_m`, `metric_mass_capacity`; Y3.B7.S5 / S10 compare → `compare_measures`.
- **Y3.B1.S10 / S11 number line to 1,000**: partial with `place_on_number_line {span:100, band:1000}`; the whole 0–1,000 line and the arrow read → `nl_20`.
- **Y3.B8.S4 / S5 fractions of a set**: partial (unit and non-unit mixed, denoms ignored) → `fos_kind`.
- **Y3.B9 money**: US dollars with `currency:'usd'`; S4 difference → `money_difference`.

## Owner questions (with suggested answers)

1. Pages for above-grade Y3.B4 ×/÷ at Grade 2: *suggested: default to the smallest bands and no exchange.*
2. Pounds and pence: *suggested: dollars and cents throughout (as Y2).*
3. Y3.B8.S1 Add fractions at Grade 2: *suggested: yes, same denominator, sum within one whole (`within_whole`).*

Generator bug found by the critic (round 2), still open: `measurement:mass_volume_liquid {forms:[1]}` gives some "mass in kg" items an answer key of 0 (a gram scale read in kg). *Suggested: fix the generator before Y3.B7.S2/S3 pages are printed; until then those steps stay partial.*
