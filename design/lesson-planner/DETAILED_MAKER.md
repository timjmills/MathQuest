# The detailed lesson maker (V22 inside MathQuest)

The second lesson maker, beside the standard one (`buildSheet({role: 'lesson'})`). It prints the whole
Atomisation Lesson Planner V22 pack of one lesson, built on the site's own kit (V22 Appendix I). The
standard lesson maker and its pages are unchanged (its three samples render byte-identical).

## Request and result

```js
const r = await buildSheet({ role: 'detailed-lesson', lessonId: 'g2-nbt3-read-write-1000', seed: 4242, paper: 'A4', year: 2026 });
// r.pages = [{id: 'T1'|'T2'|'T2-2'|'T2b'|'T3'...'T5'|'P0'|'P1'|'P2'|'P3'|'P4-1'|'P4-2'|'P4m-1'|'P5'|'P6'|'P0-key'...|'T6', kind: 'teacher'|'pupil'|'key', html}]
// r.html  = one printable document (sheetDocument), V22 pack order: T1 · T2 · T2b · T3 · T4 · T5 · P0 · P1 · P2 · P3 ·
//           P4 x n + Mixed · P5 · P6 (A4 landscape, 2-up) · the key of every pupil page in packet order (chart included) · T6
// r.pool  = the LR-5 pool written into the document as <script id="v21-pool"> (E24 reads it)
// r.notes, r.vars (the placeholder values), r.tags, r.flow; plus pupilHtml / pageCount / fits for the print screen
```

The print screen (`teacher-print.js`) offers **Lesson: detailed** beside **Lesson: standard** (the
standard card's visible label only; its role id, share codes and pages are unchanged). Picking it shows
the registry's lessons and prints the pack.

## Where the code is

| Piece | File | V22 part |
|---|---|---|
| Lesson descriptions (pure data, one file each) + registry, format, placeholders | `js/modules/lessons/detailed/index.js`, `.../<lesson-id>.js` | Parts 0–5 content, Part 11 |
| Teacher parts: page with lifted / continuation header, band, T-BOX, T-SCRIPT, T-LOOP, tables, check boxes, vocabulary cards, 26.2 % thumbnail, additive CSS | `js/modules/sheet/teacher-parts.js` | Part 10, §8.15–8.16 |
| Teacher icons + word-problem routine icons | `js/modules/sheet/teacher-icons.js` | Appendix B |
| RCDWS panel (a registered cell template) | `js/modules/sheet/cells/rcdws.js` | §9.6, Q5 |
| The role: T1, T2, T2b, T3–T5, T6 bands; balanced pagination; P1 / P5 / P6 plans | `js/modules/sheet/roles/detailed-lesson.js` | §9.2, §9.6, §9.7, Part 10 |
| The bridge: deals every item (generateQuestionFor, one seed, LR-5 avoid set), builds the pupil pages with the existing roles, measures teacher blocks, assembles the pack | `js/modules/print-sheet.js` `buildDetailedLesson` | Part 11, §8.12 |
| Render + gate | `tests/scripts/ws-detailed-lesson.cjs` | Appendix E |

Pupil pages reuse the site's roles (owner default Q1): P0 `pre-skill-check` (with `perQuestion`), P2 + P3 +
P4 + Mixed the standard lesson packet fed the description's `lessonData` (prereqs.js shape; `prereqs.js` is
not edited), P1 / P5 / P6 are plans of the new role rendered by `renderPlan`, so every pupil page has a
facsimile key from the same plan (`answer-key.js`). Additive hooks, each absent on every other request:
`lessonData`, `perQuestion`, `mixedSkills`, `mixedLattice`, `growLast`, `edgeLast` and the ref floors
`avoidNums` / `minNum` / `maxNum` / `edge` / `range` (print-sheet.js); lesson-data keys `chartWide`,
`tailLast`, `practiceShape` and the case tests `pvNoZero` / `pvZeroTens` / `pvZeroOnes` (roles/lesson.js).

## Generic by design (round 2)

`print-sheet.js` holds no per-family code. Script values come from each dealt item through the kit's own
readers (`itemNumberOf`, `answerOf`-style `dlAns`, compose.js `operandsOf` / `opOf` / `oralFrameOf`,
`numberWords`), plus the description's optional `vars(q, base)` hook for lesson-specific names. The
Check Question options are the main skill provider's `wrongAnswer`s (collected over seed rotations),
named by the description's `mistakes[].misconception`. `want` names are roles/lesson.js `CASE_TESTS`.
The pool keys are `factKeyOf(q)` (an operation item's operands and sign, else its number). P5's
instruction is `wordProblem.instruction` (fallback: the kit's `story` string); its lines are the
description's (placeholders) or the dealt item's own story.

## Adding a lesson

1. Write `js/modules/lessons/detailed/<id>.js` in the format documented at the top of `index.js` (every
   number in a script, story or frame is a `{placeholder}` filled from the dealt items).
2. Add it to `DETAILED_LESSONS` in `index.js`.
3. `node tests/scripts/ws-detailed-lesson.cjs --lesson <id> --check` — fix until `ws-detailed-lesson: OK`;
   look at every `page-NN.png`; `--copy` puts the pack in `design/lesson-samples/detailed/<id>/`.

## Which Appendix E checks run where

All run in `ws-detailed-lesson --check` on the rendered pack (Chromium print media, A4) and are written
to `SELF-CHECK.md` in V22's table format. They are V22's `js v21-selfcheck` ported to the kit's markup
(`.ws-page` with `data-dl-page` / `data-dl-kind`, `.ws-body`, `.ws-tabbox`, `.ws-copy`, `.ws-instrline`,
`.ws-band--say`, `[data-ws-slot]`, `.ws-cell`, `[data-ka]` / `[data-ws-key-ans]`, `[data-mq-accent]`).

| Check | How it runs here |
|---|---|
| E1, E1b, E2–E7, E9, E10, E12–E14, E16, E16b, E17, E17b, E18–E23, E25–E28 | ported from V22 Appendix E |
| E9b, E11 | the site's own `sheetCheck` (ws-lesson-samples H13 and its body-blank lint), line for line |
| E8 (28 pt working digits) | the kit sets `--ws-digit: 28pt` at L for every pupil page; measured by `ws-print-lint --source kit` |
| E15 | V22 Appendix C.1 **or** the kit's `INSTRUCTION_LIBRARY` (sheet/contract.js, the PED 10.1 library C.1 copies); strings found only in the kit are listed in the result |
| E24, E24b | read the `#v21-pool` JSON. Its `places` list is the kit equivalent of V22's `data-item` / `data-rep` / `data-row`: the bridge reads every PRINTED cell from the plans the pages render from. The pool is V22's `{kind: 'list'}` form (every number 21–1000) |
