# Wave 2 tagging: Year 2 (US Grade 1) — round 2

Output: `data/curriculum/links/Y2.json` (124 steps, 11 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 124 | 67 | 32 | 25 | 5 | 38 | 44 | 75 |

New proposals: `one_digit_addend`, `make_amount_notes`, `money_difference`, `single_fraction`, `time_past_to`.

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
