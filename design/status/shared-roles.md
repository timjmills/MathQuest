# shared-roles lane

## Baseline re-pins (builder B)

2026-10-31, branch `shared-roles-B`. R1-8 changed what every Pre-skill check page prints: the check now tests the skill's
prerequisites (`prereqSkills` in `js/modules/print-sheet.js`, chosen by `pickPrereqs` in `sheet/roles/pre-skill-check.js`)
where it used to repeat the skill itself. The pins `design/audit/baselines/print-lint.json` (L) and `print-lint.S.json` (S)
held no `#pre-skill-check` document before, so an unpinned page had to be clean ("before" is 0 everywhere). The 20
role-sample pages are now pinned (`ws-print-lint --source kit --roles pre-skill-check [--size S] --skills <role-sample.json>
--report-only --json`). No other document in either pin was touched.

Most rows come from the PREREQUISITE skills' own cells, and each also shows on that skill's own pages. They are handed to
those skills' owners. They are pinned, not exempted:
- legacy-drawn cells stamp the answer a second time on the key (AK-4 / AK-2: the legacy template's recorded limitation,
  e.g. shapes_early:count_sides_vertices_2d's own Independent key at S);
- fonts TY-1 / TY-2 in legacy cells styled from css/print-worksheet.css (the inline 800 / 900 weights are now 700 in every
  legacy cell: `sheet/adapters.js`);
- H12 ten frames under 10 mm (composing:ten_frame_build: red on its own Independent page at S, 6 across);
- CL40-INK in number_sense:nearest_10 (red on its own Independent page) and addition:add_three at 3 across (red on its own
  Independent page at 3 columns);
- LS-4 in name_2d_shapes' prerequisites, BD-12 ("Drag") in patterns' prerequisite of tape_diagram, WRAP-OP in legacy cells.

ROLE rows are still OPEN. They are pinned only so the gate measures any rise, and they are not a pass:
coordinate_q1 LONE at S, seq_2 H13-ROW at S, vocab_grade_K DN-2 at S.

| size | document | lint rule | before | after | kind |
|---|---|---|---|---|---|
| L | composing:number_bonds#pre-skill-check | L-ANSAREA H12 | 0 | 4 | prerequisite cell |
| L | shapes_early:name_2d_shapes#pre-skill-check | L-FONT TY-2 | 0 | 4 | prerequisite cell |
| L | shapes_early:name_2d_shapes#pre-skill-check | L-INK LS-4 | 0 | 2 | prerequisite cell |
| L | shapes_early:name_2d_shapes#pre-skill-check | L-KEY AK-4 | 0 | 2 | prerequisite cell (legacy) |
| L | area_perimeter:perimeter_intro#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | coordinates:coordinate_q1#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | measurement:time_hour#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | algebra:tape_diagram#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | algebra:tape_diagram#pre-skill-check | L-VERBS BD-12 | 0 | 2 | prerequisite cell |
| L | order_of_operations:oop_easy#pre-skill-check | L-FONT TY-2 | 0 | 6 | prerequisite cell |
| L | order_of_operations:oop_easy#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | number_sense:rounding_visual#pre-skill-check | L-OVERLAP CL40-INK | 0 | 8 | prerequisite cell (nearest_10) |
| L | number_theory:prime_composite#pre-skill-check | L-FONT TY-1 | 0 | 16 | prerequisite cell |
| L | number_theory:prime_composite#pre-skill-check | L-KEY AK-2 | 0 | 2 | prerequisite cell (legacy) |
| L | number_theory:prime_composite#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| L | number_theory:prime_composite#pre-skill-check | L-WRAP WRAP-OP | 0 | 2 | prerequisite cell (legacy) |
| L | vocabulary:vocab_grade_K#pre-skill-check | L-FONT TY-1 | 0 | 40 | prerequisite cell (vocab) |
| L | vocabulary:vocab_grade_K#pre-skill-check | L-FONT TY-2 | 0 | 6 | prerequisite cell (vocab) |
| L | vocabulary:vocab_grade_K#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (vocab) |
| S | composing:number_bonds#pre-skill-check | L-ANSAREA H12 | 0 | 8 | prerequisite cell (ten_frame_build) |
| S | conversions:f_to_d#pre-skill-check | L-ANSAREA H12 | 0 | 6 | prerequisite cell (ten_frame_build) |
| S | shapes_early:name_2d_shapes#pre-skill-check | L-FONT TY-2 | 0 | 4 | prerequisite cell |
| S | shapes_early:name_2d_shapes#pre-skill-check | L-INK LS-4 | 0 | 2 | prerequisite cell |
| S | shapes_early:name_2d_shapes#pre-skill-check | L-KEY AK-4 | 0 | 2 | prerequisite cell (legacy) |
| S | area_perimeter:perimeter_intro#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| S | area_perimeter:perimeter_intro#pre-skill-check | L-OVERLAP CL40-INK | 0 | 2 | prerequisite cell (add_three at 3 across) |
| S | coordinates:coordinate_q1#pre-skill-check | L-DENSITY LONE | 0 | 1 | ROLE, open |
| S | coordinates:coordinate_q1#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| S | measurement:time_hour#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| S | patterns:seq_2#pre-skill-check | L-DENSITY H13 | 0 | 2 | ROLE, open |
| S | order_of_operations:oop_easy#pre-skill-check | L-EMOJI TY-6 | 0 | 1 | prerequisite cell |
| S | order_of_operations:oop_easy#pre-skill-check | L-FONT TY-2 | 0 | 8 | prerequisite cell |
| S | order_of_operations:oop_easy#pre-skill-check | L-KEY AK-4 | 0 | 2 | prerequisite cell (legacy) |
| S | placevalue:more_less_10#pre-skill-check | L-ANSAREA H12 | 0 | 8 | prerequisite cell (ten_frame_build) |
| S | number_theory:prime_composite#pre-skill-check | L-FONT TY-1 | 0 | 16 | prerequisite cell |
| S | number_theory:prime_composite#pre-skill-check | L-KEY AK-2 | 0 | 2 | prerequisite cell (legacy) |
| S | number_theory:prime_composite#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (legacy) |
| S | number_theory:prime_composite#pre-skill-check | L-WRAP WRAP-OP | 0 | 2 | prerequisite cell (legacy) |
| S | vocabulary:vocab_grade_K#pre-skill-check | L-DENSITY DN-2 | 0 | 2 | ROLE, open |
| S | vocabulary:vocab_grade_K#pre-skill-check | L-FONT TY-1 | 0 | 40 | prerequisite cell (vocab) |
| S | vocabulary:vocab_grade_K#pre-skill-check | L-FONT TY-2 | 0 | 8 | prerequisite cell (vocab) |
| S | vocabulary:vocab_grade_K#pre-skill-check | L-KEY AK-4 | 0 | 1 | prerequisite cell (vocab) |

`ws-columns --roles pre-skill-check` stays red on vocabulary:vocab_grade_K (S / M / L). Of its 8 candidate prerequisites
(all vocabulary skills), only one has a cell that fits any width: the vocabulary cells overflow at every column count.
This is handed to the vocabulary skills' owner, and that ws-columns row is not pinned.
