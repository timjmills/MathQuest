# Wave 2 tagging: Year 2 (US Grade 1)

Output: `data/curriculum/links/Y2.json` (124 steps, 11 blocks, in block order, none skipped).

## Counts

| Steps | full | partial | gap | proposals reused | proposals new | tag fixes |
|---|---|---|---|---|---|---|
| 124 | 78 | 20 | 26 | 48 | 0 | 5 |

There are no new proposals. Every step that is not full is closed by an existing `WRM_PROPOSALS` or `STANDARD_PROPOSALS` id. `compare_lengths` (WRM_PROPOSALS) is extended to Y2.B6.S3 and Y2.B6.S4. Thirty-six of the 48 proposals are in `build`. Twelve appear only in `preBuild`: they are prior-learning steps (Reception and Y1) that the school's weekly list names and that have no skill yet, for example `part_whole`, `money_notes`, `sort_groups` and `ordinal`.

## Method

- **Direct skills**: the existing `SKILL_WRM` tags, checked against the generator or option evidence. Any tag that carries a `partial` clause goes to `partial` with that clause as `missing`. A note such as `band 99` becomes `opts: {band: 99}`. Other notes are kept as `opts.note`.
- **Verdict**: `full` means at least one direct skill covers the step and no open proposal names it. `partial` means a skill exists but only a partial cover or an open proposal applies. `gap` means no skill.
- **Pre-skills**: built from the xlsx "Grade 1" sheet. Each WRM step is matched to its lesson row and so to its week. That week's prior-learning list is matched by title to R, Y1 and Y2 steps (all entries match), ranked by shared CCSS and then nearest first. Next comes the step before in the block, but only when it shares the CCSS cluster. Last come lower-grade skills on the same cluster. A prior step that has no skill puts its proposal in `preBuild`.
- **Related**: the next step's skills first, then skills on the same CCSS code, then at most 3 on the same cluster. Measurement clusters are skipped because they mix time with money and length with data.

## Hardest calls

- **Y2.B2.S20 Compare number sentences** is a **gap** with a tag fix (remove `addition:equal_sign`). The build list's `equal_sign_repair` says this skill deals plain column addition today. It also judges true or false and does not compare two expressions with <, > or =. `addition:equal_sign` is excluded from every pre and related list until it is repaired.
- **Y2.B6.S3 / S4 Compare and order lengths** are now **partial**; they were full. `compare_objects` and `order_objects_length` compare pictured objects. WRM compares measured lengths in cm and m. The fix is `compare_lengths`.
- **Y2.B1.S2 Count objects to 100 by making 10s**: `base10_build` is added as a partial cover. It shows ready-made rods, so it does not teach grouping loose objects into tens (`tens_ones_group`).
- **Y2.B9.S3 / S4 past and to the hour** stay full only with `time_5min` set to option `stimulus: 'words-past'`, which carries the "20 past 3" and "10 to 4" language.
- **Y2.B2.S9 Add across a 10** is full through `add_50_regroup`. `make_a_ten` stays as a partial helper, because it bridges 10 only within 20.

## Owner questions (with suggested answers)

1. **UK money steps (B4)**: are the dollars-and-cents skills, plus the `money_uk` option for notes, enough? *Suggested: yes. The school runs "US: dollars & cents" (see the xlsx prior lists), so keep US money and treat `money_uk` as a notes-and-coins option, not a currency switch.*
2. **Above-grade steps (B5 multiplication and division, B3 symmetry, B7 g/kg/ml/l)**: should they be tagged and practised at Grade 1? *Suggested: yes, tag them as WRM does (the school teaches them). Pages should use the smallest option band, for example tables 2, 5 and 10 only.*
3. **Y2.B2.S20**: should `equal_sign_repair` be built before `compare_sentences`? *Suggested: yes. The repair is small, and both pre-skill chains and Y2.B2.S21 depend on a working equal-sign skill.*
