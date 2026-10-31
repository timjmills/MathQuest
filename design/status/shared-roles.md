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

## Precritic on the merge (344b754 vs base 512542a, 2026-10-31, 3 h 20 m wall)

Every row is red on both trees, because skill-level reds were already there at lane start. Rows at or below base:
- **Roles:**
  - scripted-model: 10 findings, base 39 / 55.
  - lesson: 357 / 341, base 384 / 370.
  - opener: identical to base.
  - reason-it: 76 / 94, base 108 / 106.
  - guided M, review M: fewer than base.
  - pre-skill-check print-lint: green (all pinned).
- **Skills:**
  - sub_2d_1d, mult_facts, div_facts: the same failing set as base.
  - add_facts: its new think gates show the pre-existing Review AK-4.
  - fractions:identify: its new think gates show the pre-existing TY-7 / PG-12.

**Regressions, sent to a fixer (shared-roles-F) before any critic:**
- guided S: div_facts H13 +1.
- review S:
  - add_fractions_like TY-2 +4, INK-5 +2;
  - prime_composite H13 +2;
  - add_decimal TY-7 +1.
- pre-skill-check ws-columns: vocab_grade_K, one placeable prerequisite.

**Backtests:** 44 / 50 PASS. The 6 FAILs were a shallow clone ("invalid reference"); the fixer is rerunning them.

**Speed-up noted:** a precritic run on both trees takes 3 h 20 m, and the first batch hit the 2 h background limit. Next time, run HEAD and base per role in separate jobs of 1 h or less, and unshallow the clone before backtests.

## Fixer F (shared-roles-F, Opus medium, clean-before-critic follow-up, 2026-10-31)

Root causes and fixes (role / host code, no exemption, no per-skill branch):
- **review S (add_fractions_like TY-2 +4 / INK-5 +2, prime_composite H13 +2, add_decimal TY-7 +1):** builder C's `earlierSkills {hosts:true}`
  swapped EVERY preset met in the fallback walk for its host. Two faults: it swapped `simplify_with_gcf` (grade 6, refused for a grade-4
  skill) for its host `simplify` before the grade test, and it swapped lone presets that are their own lesson (`reasonable_quotients` ->
  `estimate_quotient`, `whole_div_unit_frac` -> `div_unit_frac_nv`), so the Mixed Review dealt the host's other tasks and drawings. Fix
  (`print-sheet.js` `isSeriesPreset`): the preset must pass the grade test itself, and it stands in for its host only when it is one value
  of a SERIES (3+ presets of one host in the category on the same option keys: count by 2s ... 12s). R1-11 holds (div_facts Review: count
  by 2, 3, 4, 5); the three skills' Review pages are back to base row for row.
- **guided S div_facts H13 (H13-HINT, 0 -> 1):** the try beside a Model with a think line sat at the top of a row sized for the Model's tab
  clearance + think line (17 mm), leaving a 10.3 mm (34 %) band under it. Fix (`guided.js`): that try steps down by the Model's tab clearance
  (inline `padding-top`, the Model's own rule), so both problems stand level and the clearance is above them. Inline so no other guided page
  changes a byte.
- **pre-skill-check ws-columns vocab_grade_K (1 placeable prerequisite):** its 8 candidates were all vocabulary skills (no lesson, no WRM
  `pre`), whose cells overflow every quadrant. Ruling applied (PAGE_TYPES PT-PRE-1 four quadrants, PT-PRE-3 prerequisites from the
  pre-skill list): the host (`prereqSkills {wide}`) adds a WIDER list after the near 8 - 4 more earlier skills, then the skills the
  curriculum already marks as a prerequisite (every `pre` list of `data/curriculum/links/<YEAR>.json`) at the skill's grade or below, own
  domain first, nearest grade, most cited. The role (`pickPrereqs`) reads the wide pools (`w<n>`) ONLY when fewer than 3 near candidates
  place, so every other page is unchanged (19 of 20 role samples byte-identical at S and L). vocab_grade_K now checks count objects,
  compare groups, ten frame, number bonds: 4 groups, 1 page, fill 89-94 % at S / M / L.

Redesign-passed 7 (subtraction): review and guided at S / M / L byte-identical to base 512542a and to 5e690c6 (42 of 42).
Backtests rerun on the full clone: the 6 shallow-clone rows all PASS.

### Fixer F baseline re-pin (vocab_grade_K#pre-skill-check only, S and L)

The wider search changed what vocab_grade_K's Pre-skill check prints (K foundations in place of vocabulary cells that overflowed), so
its two pinned documents were replaced with the new page's findings (`ws-print-lint --source kit --roles pre-skill-check [--size S]
--skills vocabulary:vocab_grade_K --report-only --json`). No other document was touched. Builder B's vocab rows (TY-1 40, TY-2 6 / 8,
AK-4 1, DN-2 2 at S - the last a ROLE row) are gone. The new rows come from the prerequisites' own cells:

| size | lint rule | before (pin) | after | kind |
|---|---|---|---|---|
| L | L-ANSAREA H12 | 0 | 4 | prerequisite cell (ten_frame_build: the same rows are pinned on number_bonds, f_to_d, more_less_10) |
| S | L-ANSAREA H12 | 0 | 8 | prerequisite cell (ten_frame_build, as above) |
| S | L-DENSITY H13 | 0 | 1 | prerequisite cell (count_objects at band 5: a 1-object picture, 10 mm, centred in the 1fr column of a 92 mm counters cell; the counters cell sizes its picture column to the cell, not the picture) |

## Clean before critic (lead)

- Fixer F (a1056e8, d3cb1f9, 315bff4) is merged as a fast-forward.
- precritic guided / review S and L: every row is at or below base 512542a.
- pre-skill-check: precritic OK, 4 of 4 gates.
- backtests: the 6 shallow-clone rows rerun and PASS (50 / 50).
- The 7 redesign-passed skills are byte-identical on review and guided (42 / 42).
- I accept the vocab_grade_K re-pin. Its rows come from the prerequisite cells: ten_frame_build H12 is pinned on 3 other documents. The count_objects H13 at S is flagged to the critic.
- Critic r1 (independent, mq-opus-medium) launched at 315bff4e. Cost at launch: $134.5 (≈ 4.8 % of the weekly limit).

## Critic r1 — FAIL (independent, mq-opus-medium, 315bff4e) — HAND-OVER

Report: `design/audit/runs/shared-roles/critic-r1.md`; evidence: `design/audit/runs/shared-roles/r1/` (25 PNGs, lint outputs).

| Defect | Verdict |
|---|---|
| R1-9 Reason It keep-out | FIXED |
| R1-11 div Review strip + variety | FIXED |
| R1-12 across keep-out | FIXED (but N4: across cells 50–60 % empty, S = L grid) |
| R1-14 Opener "Use the dots" | FIXED |
| R1-10 add_facts Review M H13 | H13 FIXED; page still red on L-KEY (16 key slots vs 12 pupil, pre-existing) and 5–9 mm Mixed Review slots at S |
| R1-3 Scripted model | NOT FIXED: key, header and one page are done; panels still don't draw the strategy; 55–63 % blank (H5); div_facts has no state rule or `Say:` divider (N5) |
| R1-5 Lesson | NOT FIXED: steps are generic now, but the mult/div anchor is still 11 × 11 / 110 ÷ 11, and the first guided item is the hardest |
| R1-8 Pre-skill check | NOT FIXED: page full, but groups of 1–2 items; fractions:identify gets two quadrants of itself and odd prerequisites |
| R1-13 Guided | NOT FIXED for add_facts (39 %) and sub_2d_1d (35 % at L): fixer F's byte-identity commit d3cb1f9 limited the fix to think-line Models |

New, already at base: N1 fractions Reason It overflow; N2 fractions guided hint gives the answer; N3 stack-subtraction panel writes four places at once; N6 stray grey rules under the pre-skill grids.

Screen hosts: no regression (all ≥ 8 except the fractions online worksheet at C3 7, as at base).

### Why I stopped here (lead's call)
Cost $144 (≈ 5.2 % of the weekly limit) against the $200 cap; the weekly rate limit also shows a warning. Round 2 needs:
- a medium builder for the drawn strategy steps (R1-3), pre-skill grouping (R1-8), the anchor band (R1-5), guided rows (R1-13), across density (N4) and the add_facts Review key;
- the six new checks with backtests;
- a 1–3 h precritic run;
- a second critic.

That does not fit in the $56 left, and stopping at the cap with an unverified round is worse than a clean hand-over.

### Round 2 plan (next session, Opus medium: rebuild of critic-failed work)
1. **R1-3 scripted model:** each panel draws its step's state (make-ten split, think-addition frame, skip-count hops); fit the page (H5 ≥ 50 % fill); state rules and `Say:` divider (N5).
2. **R1-5:** lesson anchor and the first guided item come from the middle band (not 0 / 1 / 10s / 11s / 12s), for every operation family.
3. **R1-13:** remove the d3cb1f9 restriction, so every guided page gets the unstretched try rows. Show the redesign-passed diffs; that is the fix.
4. **R1-8:** ≥ 4 items a group (fewer groups if needed); no prerequisite that is the page skill or shares its primary CCSS; fix N6.
5. **N4:** across cells sized to content, and S fits more than L.
6. **add_facts Review:** key slots = pupil slots; Mixed Review slots at least the PT minimum.
7. **Checks:** the six new checks in `design/status/speed-audit.md`, with backtests on 315bff4e, on precritic's path.
8. **Rule 0b reading:** ANY red row on a role this lane changes blocks the critic, not only rows above base.

Not merged to claude/sweet-newton-c8wrv1; no draft PR, since the brief opens one only on PASS. Nothing in redesign-passed.js changed.
