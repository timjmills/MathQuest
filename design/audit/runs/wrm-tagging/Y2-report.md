# Wave 2 tagging: Year 2 (US Grade 1) — round 3

Output: `data/curriculum/links/Y2.json` (124 steps, 11 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 124 | 66 | 34 | 24 | 8 | 37 | 47 | 74 |

New proposals: `one_digit_addend`, `make_amount_notes`, `money_difference`, `single_fraction`, `time_past_to`, and in round 3 `sub_from_ten`, `order_pictures`, `compare_measures` (extended to lengths in one unit; shared with Y3).

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
