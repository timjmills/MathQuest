# Lane: shared-roles (shared page-role defects)

Lead: session_01HVwpAE3g6EZH8idgErP6LP. Branch `claude/sweet-newton-c8wrv1-shared-roles` off `claude/sweet-newton-c8wrv1` @ 5c6063a.
Owner decision 2026-10-31: these defects get their own lane and do not gate the facts family. Cap $200 (≈ 7 % of the weekly limit).

Source: `design/status/shared-roles/source-critic-r1.md` (copy of laneD-restart critic r1), status item 5.

## Split (builders, Opus medium: first build of a fix in shared engine code)

| Builder | Defects | Files owned |
|---|---|---|
| A | R1-3 Scripted model, R1-5 lesson Steps vs items, R1-13 guided empty band, R1-14 Opener "Use the dots" | roles/scripted-model.js, lesson.js, detailed-lesson.js, guided.js, opener.js |
| B | R1-8 Pre-skill check (R1-7 moved to the mixed pages M2 lane, 2026-10-31) | roles/pre-skill-check.js |
| C | R1-9 Reason It CL40, R1-10 Review M H13, R1-11 div Review L strip, R1-12 across CL40 | roles/reason-it.js, review.js, css/sheet-kit.css (additive) |

## Progress

- 2026-10-31: lane started; builders A, B, C launched in worktrees.
- 2026-10-31 11:08: lead moved R1-7 to the new mixed pages M2 lane, which owns roles/mixed-practice.js, sheet/interleave.js, sheet/layout.js, sheet/paginate.js; all three builders told not to edit them.
- Builder C reported (branch shared-roles-C, commits 3945be3, 8f12d05):
  - **CL40-INK cleared:**
    - Reason It: S 12 → 0, M 24 → 0, L 16 → 0 (R1-9).
    - div_facts Review at L: 6 → 0 (R1-11).
    - notation=across on Independent, Test and Mixed: L 110 → 0, S 56 → 0 (R1-12, fixed at cell level in `cells/fact.js`).
  - **R1-11 variety:** the earlier-skill fallback now reads a preset as its host skill, so div_facts' Mixed Review counts by 2, 3, 4 and 5 instead of four count-by-12 strips.
  - **R1-10:** not reproduced on this branch.
  - **Redesign-passed:** the 7 skills are byte-identical across 105 renders, except the Reason It CSS inset, which is the fix.
  - **Backtests:** 4 of 4 OK.
  - **Precritic additions:** reason-it and review pages per skill, and notation=across, now on the path.
  - **Still red, outside this lane:**
    - add_facts Review AK-4 (legacy `add_sub_10s` key);
    - legacy fraction cells on reason-it and review;
    - across S capacity 16 against 20 (VA-71 clamp);
    - dealer-uniform, node-lint-s1, slot-clip and options-render on generators / options.
- Builder B round 1 (shared-roles-B, commits 01ec9c2, 7796348):
  - **R1-8 fixed:** the pre-skill check now draws from prerequisites (lesson prereqs, then the WRM `pre` lists, then earlier skills), never the page's own skill. 4 groups on 1 page, about 90 % filled.
  - **Precritic:** role-level and prerequisite-cell reds remain; sent back for round 2.

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

## Merge and gates (lead, 2026-10-31)

- Merged A (incl. f6d61e6 chart panels), B (3c19413, dd67e2e) and C into the lane branch at 344b754. Conflicts were in backtests.json (rows from all three kept) and this file.
- Unit gates on the A+C merge: syntax, ws-boot-smoke, ws-layout-unit (542), ws-code-snapshot (731), ws-print-lint self-test (71) and ws-precritic-plan (29 rows) are all OK.
- Builder B round 2 had a harness "credential materialization" warning. I checked its commits and worktree and found no credential or secret in either; the lane did not act on it further.
- Builder B's baseline re-pin covers only the 20 role-sample `#pre-skill-check` documents. None was pinned before, because before this fix the page tested the skill's own items. Three role-level rows are open: coordinate_q1 LONE at S, seq_2 H13-ROW at S, vocab_grade_K DN-2 at S.
- Cost at 344b754: $119.6 of session cost (≈ 4.3 % of the weekly limit).
