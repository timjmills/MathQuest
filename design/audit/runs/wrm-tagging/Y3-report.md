# Wave 2 tagging: Year 3 (US Grade 2) — round 2

Output: `data/curriculum/links/Y3.json` (134 steps, 12 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 134 | 57 | 46 | 31 | 11 | 42 | 41 | 64 |

New proposals: `more_less_1_3digit`, `hundreds_any`, `exchange_count` (owner ruling: none / one in the ones / one in
the tens / two or more, on every + − × ÷ regroup band), `two_and_three_digit`, `compare_kind`, `metric_mass_capacity`,
`compare_measures`, `within_whole`, `fos_kind`, plus `one_digit_addend` and `money_difference` shared with Y2.

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
