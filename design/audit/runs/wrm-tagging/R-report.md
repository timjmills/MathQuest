# WRM tagging, Wave 2: Reception (R = PK4), round 2

File: `data/curriculum/links/R.json`. Round 2 answers critic `R-Y1-critic.md` (round 1 FAIL, mean 6.80).
Evidence: `R-Y1-items.md` (every direct and partial skill+opts of every step, 6 generated items, 3 shown, Max Number recorded).

## Counts

| Steps | Full | Partial | Gap |
|---|---|---|---|
| 119 | 27 (was 50) | 60 (was 36) | 32 (was 33) |

- Proposals: 31 used. 22 reuse existing ids; 9 are new and short (rule 13: name, kind, teaches, closes, representation):
  `band_3`, `band_6_8`, `more_less_pictures`, `teen_bands`, `oral_count`, `decompose_shapes`, `doubles_pictured`,
  `bonds_3_parts`, `pictures_change_unknown` (split: change-unknown only, within 5; no band lift).
- Reused instead of new: `odd_even_pairs` (R.B9.S6, R.B11.S13 pairing), `defining_attributes` (R.B15.S2: a turned shape is
  the same shape — replaces `compare_shapes`, which did not close it). R.B18.S1/S2 keep `consolidate`.
- Tag fixes: 41 (37 to partial, 4 removed, each with the generated evidence in `why`).

## What changed and why (from generated items)
- Every `full` was regenerated. 23 left `full`: the 1-2-3 steps (band 5 deals 4-5), the 6-8 steps (band 10 deals 1-10),
  every 1 more / 1 less (`count_sequence` deals to 10 with no objects), R.B9.S5 (wholes 4-10), R.B13.S1/S2/S3 (teen bands
  overreach, no 20), every `shape_pattern` step (typed shape names; no copying), R.B13.S6 (`seq_10` dropped).
- Opts are values: `name_2d_shapes {forms:[1], shapes:[0,1]}` (tap circles and triangles), `{shapes:[2]}` for 4-sided,
  `name_3d_shapes {forms:[1]}`, `compose_shapes {shapes:[1]}`, `odd_even {forms:[2], range:10}`, ranges on every skill that reads Max Number.
- R.B11.S8 is `make_ten` alone (number_bonds deals any whole). R.B16.S3 is partial with `share_into_groups {band:12}`.

## Pre and related (method)
- Reception pre-skills come from earlier R steps on the SAME idea (a topic + sub-topic read from the title: count, more1,
  compare, bond, add, sub, double, oddeven, share, shape2d, shape3d, length, mass, capacity, pattern, position, time …),
  same sub-topic first, nearest first; a family match is used only while fewer than 2 pre-skills are found. A pre may be
  the step's own skill on an earlier rung (other opts). `preBuild` only carries builds of earlier GAP steps on the same idea.
- Related: hand reasons, then the skill's other forms or inverse (`FORMS` in spec.py), then the next step on the same
  sub-topic. Never a pre key, never "same block". Empty pre/related lists carry a note saying why.

## Hardest calls
- "Find 4 and 5" / "Find 9 and 10" with band 5 / band 10 stay `full`: they deal the whole block range (1-5, 1-10), nothing past it.
- R.B5.S6/S7 composition to 5 stay `full` as numeral bonds; the note says there are no pictured parts.
- R.B14.S1 "Add more" stays `full`: pictured join to 5 plus picture stories to 10 read aloud.

## Owner questions (suggested answers)
1. One shared band option (`band_3`, `band_6_8`) across count_objects, ten_frame_build, number_bonds, count_sequence — or one per skill? Suggested: one shared option id, one value list.
2. Should oral steps (R.B13.S5/S6) be closed by `oral_count` (teacher-ticked track)? Suggested: yes; it is the only checkable form.
