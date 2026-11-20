# lf-engine-lessonfirst: diagnosis (before any change)

Base: 0983c6791 (lf-checks, on master d38308824). Measured with `tests/scripts/ws-lesson-pages.mjs --grade 3`
(packet request, size M, seed 4242): LESSON-EMPTY-FIRST 59, LESSON-OPENER-SAME 22 (81 findings).
Summaries: `before-g3-packet.json` (this folder).

## (a) LESSON-EMPTY-FIRST - the empty anchor-chart page

Every one of the 59 flagged lessons has the same empty page: page 1, `data-ws-sheet="lesson-chart"`, a full header
(Name / Date / Score / "I Can ..." title), `<main class="ws-body"></main>`, footer. Probe of Y4.B4.S11
(mult_properties + mult_facts): `lesson.steps` = [], `parts` = chart 1 page, teach 1, practice 1, mixed 1.

Cause, in two places:
1. `print-sheet.js buildLesson` ALWAYS builds the anchor chart part (`lessonInput.part: 'chart'`) and always prints it
   (`parts = [{part:'chart'}, {part:'teach'}]`; the chart part has no `inPacket` test).
2. `roles/lesson.js planOnce` pushes the chart page only when the lesson has anchor-chart STATES
   (`if (states.length && part !== 'sheet')`). The states come from the lesson record's worked steps (`lessonFor` /
   the library record). A skill with no lesson record - or a record whose example has no worked steps - has
   `states.length === 0`, so with `part: 'chart'` the plan holds NO page; `assemble()` still emits one framed page with
   the header and an empty body.

So the part "resolves to zero items" exactly as suspected, but at the part level: an empty anchor chart, not an empty
warm-up. The 16 "built" lessons and the other 43 are the same defect (their first direct skill has no lesson record:
mult_properties, mult_zeros, factors_identify, sub_10k_regroup, perimeter_grid, identify_angles, coordinate_q1, ...).

## (b) LESSON-OPENER-SAME - the same model on consecutive lessons

Two causes, both in the lesson engine's choice of the model, plus one in the request:

1. **The worked example of a times-table lesson is always 10/11/12 x the table.** `lesson-pages/chart.js pickExample`
   ends with "Two digits beat one for a column skill: the example has the widest operands the skill deals" - a rule for
   column (stack) skills, applied to one-line FACT items too. A fixed-table pool (`mult_facts {constant:[6]}`) deals
   0..12 x 6; the widest operands are 10 x 6, 11 x 6, 12 x 6, and the lower third of those is 11 x 6. Probe:
   `{constant:[6]}` seed 4242 -> "11 × 6", seed 777 -> "11 × 6", seed 12345 -> "6 × 11"; `{constant:[9]}` -> "11 × 9".
   So every Y4.B4 times-table lesson opened "11 × n is 11 groups of n" (S9, the 11 table, "10 × 11"), whatever its seed.
   The model is the table's edge fact, and its 11 is itself another lesson's table (Y4.B4.S9).
2. **Every lesson of the WRM screen is built with the same seed, 4242** (`teacher-wrm.js printLesson`; the gate
   mirrors it), and the request does not say which lesson it is. Ten of the 22 pairs are two consecutive steps whose
   requests are byte-identical (same skill, same options): Y4.B1.S9/S10, B2.S3/S4, B6.S1/S2, B6.S8/S9, B7.S4/S5,
   B7.S7/S8, B8.S5/S6, B10.S1/S2, B12.S2/S3, B14.S4/S5 - the engine is deterministic for a request, so the whole packet
   is identical, not only the opener. Most of the rest differ only in an option the chart does not read
   (S2 `support:['array']` vs S3 none) and deal the same pool.
3. The 59 empty charts make the gate's "first content cell" the lesson sheet's first cell (the Warm-up / Vocabulary),
   which comes from the skill's prerequisites - identical for two steps on one skill (B5.S3/S4, B4.S11/S12, B6.S5/S7).

## The fix (what changes)

- (a) `buildLesson` drops the anchor-chart part when its plan has no states (it can only be an empty page); the
  lesson sheet, which already carries the full header on its first page, becomes page 1. Nothing shrinks; no part is
  merged.
- (b1) `pickExample` does not apply the widest-operands rule to a fixed-table FACT pool (every fact shares one factor):
  the model is an ordinary fact of the lesson's own table, the other factor one of 3..9 (never 0, 1, 2, 10, 11, 12,
  the edge facts and other lessons' tables), chosen by the lesson's variant (below); the table stays in the fact.
- (b2) A lesson request may carry `lessonVariant` (an integer: the WRM step number). The WRM screen sends it and a
  per-step seed (`wrmLessonSeed`, wrm-links.js); the engine passes the variant to `pickExample`. Two consecutive steps
  therefore get different packets, and a times-table lesson's model factor moves with the step. A request without it
  (every library lesson, teacher print) builds exactly as before.
