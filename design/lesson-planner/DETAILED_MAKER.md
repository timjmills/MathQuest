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

## Chunked Flow and round 3 (lesson 1 critic r1, 2026-10-16)

- **Chunks.** A description may declare `chunks` (V22 Chunked Flow, I Do / We Do / I Do / We Do). Chunk a is the
  description's own skill and chart data; every further chunk is built as its own lesson packet with no practice
  (`buildSheet({role: 'lesson', practicePages: 0})`), printed as P2b (its anchor chart) and P3b (its lesson sheet),
  tabs `Lesson 1a` / `Lesson 1b`, the pack's strand on every tab. Sections `5a 6a 5b 6b` sit on T4 with their own
  thumbnails; T1's flow table lists them and its Flow line prints the count (`Flow: Chunked (5 new routine steps)`).
  A Practice sheet names the chunk whose Steps head it (`practiceSheets[k].chunk`).
- **Words to numeral in H T O boxes.** `composing:number_word_form` option `answerSlot` (`line` | `hto`, codec key
  `0R`): the kit `words` cell writes the numeral one digit a box under H T O (Th H T O for 1,000), with step states
  for the chart panels and Guided cell 1's grey trace.
- **Last row wants.** `edgeLast.wants` names the case of each ★★★ place (1,000 first); a wanted case is kept for that
  place, and the place tries the generator's item rotations in turn.
- **Teacher pages read the dealt items.** `{pre.i.letters}` / `{p0.list}` (P0's real letters and answers), `{p4.last}`
  (each Practice page's last row and its case). Gate **E29** checks every letter and answer quoted on T3 §1, T5 §10
  and the T6 routing against the key cell of that letter.
- **P1** takes five bank `items` (one type a row, the same order in A and B), each row its own library instruction.
- **Exit slip groups**: a run of items of one skill keeps its own columns and height (words two across, sums one).
- **Keys** P1 / P5 / P6 mark their answers through `tagKeyAnswers` (the key ink); the exit key's second half reads
  Answer Key. Teacher pagination never continues a band with its last block alone (widow control).

## Lesson 3a additions (turn an array, 2026-10-17)

- **Array fact keys.** `factKeyOf` keys an `arrays-turn` item `rows x cols` (3x4, 4x3 and 2x6 are three keys);
  `itemNumberOf` reads its product (so `minNum` / `maxNum` bound it). A turned pair is ONE pair of pictures, so
  `turnedKeyOf` keeps it off a page (`seen`), off every other page of the packet (`avoidKeys`) and off every dealt
  item (`dealOne`), and the Guided set never turns the chart example. Only ten arrays fit 5 x 5 (RP-21), so the
  pack uses them sparingly; the Check Question (board only) may turn a Guided array (`checkQuestion.ref.turnedOk`).
- **Case tests** (roles/lesson.js): `arrTurn` (non-square, no repeated digit), `arrNonSq`, `arrSquare`, `arrFive`,
  `arrEdge`, `arrSmall`, `arrTurnSmall`, `arrFourFive`, `arrNoSmall`, `arrBigSquare`, `arrFiveRows`, `arrProduct`,
  `arrFactor`, `arrSquareFactor`, `arrAny`.
- **Hooks**, each absent on every other lesson: `checkQuestion.ref` and `checkQuestion.show(value, q)` (each option
  written as a fact); `exit[i].cols` (1 | 2, its group's columns); `eeAccess` (T1 prints "EE none · access point
  ..."); ref floors `allTest` (a case test every place passes) and `factorCap` (no factor on more than n items of a
  page); `accepted` lines take placeholders; the library string `turn-two` (a one-line Guided header). Guided cell 1
  of an arrays-turn lesson has its first product traced in grey. An array is never a near twin by its product. The vocabulary picture kind
  `array` ({rows, cols, mark: 'row' | 'turn'}); the step icon `turn` (lesson-icons.js); the arrays-turn template
  writes `data-per-row` on each array (E27).

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
| E24, E24b | read the `#v21-pool` JSON. Its `places` list is the kit equivalent of V22's `data-item` / `data-rep` / `data-row`: the bridge reads every PRINTED cell from the plans the pages render from. The pool is V22's `{kind: 'list'}` form (the description's range, lesson 1: 21–999). E24b also fails near twins: two one-number items of one skill on a page within 2 (405 / 406, V22 LR-6) |
| E9 (no exemption), E9c | E9: every page 50–100 % used, teacher continuation pages included (critic r3: the old E9 exemption was reverted). E9c (V22 3131): a teacher page that continues onto another is ≥ 92 % used; `paginateTeacher` packs greedily first and only rebalances when that misses |
| E30 | `boardOnly` (description): numbers shown on the board only (lesson 1: 1,000). The bridge passes them to every ref as a HARD bound (`refHardOk`: never relaxed, not on a ref's last try); E30 fails if one is an item, an answer, or printed (digits or name) on any pupil page or key |
