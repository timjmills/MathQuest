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

## Lesson 2 additions (word problems with a bar, rounds 4-5, 2026-10-17)

Description keys (each absent on every other lesson, so lessons 1 and 3a deal as before):
- `situations` [{id, test}] (CASE_TESTS names): the story situations the lesson teaches; each story place in the pool
  carries its `sit`, and E31 holds the pack to modelling, practising and assessing exactly those.
- `fade` {P5, P6}: the lesson's own fade labels on T6.
- `mixed.leadDrop`: `leadHalf` may drop a partner's only shelf, then narrow the last partner's shelf to the next
  lattice divisor, until the lesson skill holds half the Mixed page (V22 §9.5).
- `practiceSheets[k].edgeLast.first`: the ★★★ places are dealt first, so the rows above keep LR-6 against them.
- Ref keys: `shortQuestion` (the question sentence in its short library form, so a story is one sentence a line),
  `cellPayload.storyTight` / `gradeParts` (word-work bar cell: Practice-size story in a one-across cell; graded bar
  boxes), `fresh` (a dealt-one item that is no lesson page's fact turned round, while the pool lasts), `itemSpread`
  (dealOne runs the item index through every name and noun), `tries`. `want` may be a list (every test must pass).
- Placeholders: `{p4.steps}` (where the Steps are, read from whether Practice 1 prints its Steps band), the
  description's `vars` `question` (the story's own printed question).

Bridge rules for the detailed lesson's printed pages (refs flagged `lr6` by the bridge: Practice, Mixed, P0):
- LR-6 for + / − items and stories (`lr6Ok`): no first addend twice in a grid row, no number taken away twice, no near
  twins (V22 2983 as written: both numbers within 2, place by place - read in either order it leaves at most 3
  crossing-ten stories with parts 3-9 on a page, so a 6-item page could not be dealt), no answer twice, and while it
  can, no story name or unit word twice. Per page (`edgeLast.per`), the first-addend rule per row. A Mixed page deals
  each skill against the ones already placed. An `lr6` run that had to drop a rule is dealt again under the next seed
  (up to 12; attempt 0 is the run's own seed, so a clean run deals as before).
- LR-5 identity (E24): a + fact is its UNORDERED pair across the pack (7 + 5 and 5 + 7 are one fact); the chart's
  examples, board examples included, and their turn-arounds are never dealt (`plusTurn`, the pool's `forbidden`).

Round 5 (2026-10-17, critic r3 D1-D3, m1-m7):
- **No Mixed page on lesson 2** (V22 §9.5: optional). Under the unordered identity the crossing-ten stories with parts
  3-9 are 15 facts; chart 2, Guided 2, Practice 4 (above ★★★), P5 1, exit 2 and the Check Question 1 take 12, P0 1-2,
  so a Mixed page's 4 stories (16-18 of 15) cannot be dealt fresh. T5 §8's early-finisher row and T2b's P4 tab follow
  (`d.mixed` absent: "Practice n").
- **Near twins, either order: not dealable.** V22's both-within-2 test applied to the parts in either order leaves at
  most 3 of the 15 crossing-ten pairs mutually apart, so no 6-item Practice page exists (0 deals; the critic's narrowed
  rule in either order AND V22's ordered rule together: also 0). The bridge and E24b apply V22's rule place by place,
  as V22's own examples do (the critic's accepted alternative).
- `pool: {kind: 'plus', skill, partMin, noPart, crossTen, sums, maxSum}` (critic m7): the lesson skill's + facts by
  their RULE (every ordered a + b: parts >= partMin, none in noPart, crossing ten with both parts <= 9 or a whole in
  `sums`, the whole <= maxSum); every other skill's places by list (`decl.items`). E24 recomputes both, fails a story
  place the rule does not hold, and counts the usable pool in FACTS (a turned pair one fact).
- `forbidden` lists every chart / board example's turn-around, also when the rule already holds it.
- Ref keys: `dealTries` (dealOne's seed budget, up to 6000; the first 600 seeds as before) - a put-together story with
  the big part first and a whole of 14+ is about one try in a hundred; `lr6Names` (a story ref: the tier that drops
  the unit word keeps every story person apart, and a run with a person twice on a page is re-dealt). `lr6Ok` now holds
  EVERY person of a story apart, not only the first ("Leo has 3. Mia has 9." after "Mia has 7.").
- `guidedWants` picks Guided cells with no story person in common first (roles/lesson.js), then as before.
- `checkQuestion.want` may be a list (lesson 2: `['wpBridgeBigFirst', 'wpClean']`: option C's wrong-sign top is no
  story number); the exit refs carry `wpClean` too.
- `storyTight` cells take a 2.5 mm top pad (critic m5). dealOne's error names why candidates were turned away.

### Hooks and checks added since lesson 1 (index)

| Name | Where | What |
|---|---|---|
| E31 | gate | declared `situations` modelled on P2, assessed on P6, nothing practised unmodelled |
| E32 | gate | stories one sentence a line, at most 4 lines |
| E33 | gate | Mixed: the lesson's own skills hold at least half (passes with no Mixed page) |
| E34 | gate | T2b's exit score = the slip's item count |
| E35 | gate | T4 quotes only printed / board questions; "Steps are at the top of the page" only when P4-1 prints its Steps band |
| E36 | gate | exit + items: no part = the difference of the parts; each a fact on no other page (`factId`) |
| E24 turn-around | gate `poolCheck` | V22's `turn()` restored: chart examples and their turn-arounds never return; no turn-around pair on a page |
| fact identity | gate `canon` / `factId`, bridge `plusTurn` / `mulId` | one sign per key (× for x * ×, − for - −, ÷ for / ÷); + and × facts unordered across the pack, − and ÷ ordered; inside one item a turned pair may be the content |
| `lr6` | bridge | LR-6 on Practice, Mixed and P0 refs of a detailed lesson (`lr6Ok` / `lr6Record`), re-dealt up to 12 seeds |
| `leadDrop` | `mixed.leadDrop` | the lesson skill reaches half the Mixed page by dropping / narrowing a partner shelf |
| `edgeLast.first` | `practiceSheets[k]` | the ★★★ places are dealt first |
| `{p4.steps}` | placeholder | the Steps line from whether Practice 1 prints its Steps band |

## Generic by design (round 2)

`print-sheet.js` holds no per-family code. Script values come from each dealt item through the kit's own
readers (`itemNumberOf`, `answerOf`-style `dlAns`, compose.js `operandsOf` / `opOf` / `oralFrameOf`,
`numberWords`), plus the description's optional `vars(q, base)` hook for lesson-specific names. The
Check Question options are the main skill provider's `wrongAnswer`s (collected over seed rotations),
named by the description's `mistakes[].misconception`. `want` names are roles/lesson.js `CASE_TESTS`.
The pool keys are `factKeyOf(q)` (an operation item's operands and sign, else its number). P5's
instruction is `wordProblem.instruction` (fallback: the kit's `story` string); its lines are the
description's (placeholders) or the dealt item's own story.

## Skill coverage rule (owner, 2026-10-17) — every lesson, lessons 1-5 included

A lesson is not done until its practice skills cover it on screen exactly as the paper does:

1. **Paper = skill + options.** Every item type printed on a pupil page (P0, P1, P2 chart examples, P3 Guided,
   P4 Practice, Mixed, P5, P6, the Check Question) is dealt by a registered skill with option values — never a
   hand-written item. A pupil who practises that skill with those options online (practice card, online
   worksheet, quiz) meets the same item type, the same response (what is written, ringed or chosen), the same
   number range and the same edge cases as on the paper.
2. **The skills cover the lesson and its standard.** Taken together, the lesson's skills + options deal every
   atom and routine step the lesson teaches and every clause of each CCSS standard it is tagged to (its lettered
   part where tagged). A clause the lesson deliberately leaves to another lesson is named, with that lesson or
   skill; anything else missing is built (option or skill, per CLAUDE.md) in the same change — not proposed.
3. **Recorded.** `data/curriculum/detailed-lessons.json` gives each lesson `skills.used` (every page role with its
   skill key and opts) and `skills.coverage`: one row per standard clause and per lesson atom → the skill + opts
   that deal it, `full` / `partial` / `elsewhere: <lesson or skill>`. A lesson passes only with no `partial` row.
4. **Checked.** The critic checks rules 1-3 for every page; a printed item type with no skill + options that
   deal it, or a standard clause with no covering skill, is a blocker.

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
| E9b, E11 | the site's own `sheetCheck` (ws-lesson-samples H13 and its body-blank lint); E11 follows `ws-print-lint` L-DENSITY since CL-4b (owner, 2026-10-23, "top of the box is the default"): under a top cell the band below the item is writing room, judged against its row's other cells (H13-ROW) - 2026-10-30, lesson 6 r4 |
| E41 | every relation a teacher page states is true of the numbers it names ("100 is 10 times 10", "30 and 300, one tenth of", "Bigger / Smaller, so …" against the pair before it); lesson 6 critic r2 D1; `--e41-fixture` runs it on a text file (ws-backtest row `e41-relation`) |
| E8 (28 pt working digits) | the kit sets `--ws-digit: 28pt` at L for every pupil page; measured by `ws-print-lint --source kit` |
| E15 | V22 Appendix C.1 **or** the kit's `INSTRUCTION_LIBRARY` (sheet/contract.js, the PED 10.1 library C.1 copies); strings found only in the kit are listed in the result |
| E24, E24b | read the `#v21-pool` JSON. Its `places` list is the kit equivalent of V22's `data-item` / `data-rep` / `data-row`: the bridge reads every PRINTED cell from the plans the pages render from. The pool is V22's `{kind: 'list'}` form (the description's range, lesson 1: 21–999). E24b also fails near twins: two one-number items of one skill on a page within 2 (405 / 406, V22 LR-6) |
| E9 (no exemption), E9c | E9: every page 50–100 % used, teacher continuation pages included (critic r3: the old E9 exemption was reverted). E9c (V22 3131): a teacher page that continues onto another is ≥ 92 % used; `paginateTeacher` packs greedily first and only rebalances when that misses |
| E24 (round 5, plus rule) | a `plus` decl is recomputed from its rule and list; a story place outside the rule fails; usable pool counted in facts |
| E24 (round 5) | V22's `poolCheck` turn-around test restored (`turn()`: a chart example never returns turned round; no turn-around pair on a page). One canonical sign in every key (× / x / *, − / -), and a commutative fact (+, ×) is its unordered pair across the pack, − and ÷ ordered; inside one item a turned pair may be the content (an arrays-turn cell) |
| E24b (round 4-5) | also reads + / − items (stories too): first addend twice in a grid row (a place's `grid` and `row`) or three running, a number taken away twice, near twins (both numbers within 2, place by place), and a story's and a fact's equal answers as twins |
| E24b (lesson 4 r4, mult-grid windows; lead ruling 2026-10-17) | windows are keyed `grid r0-r1 x c0-c1:task`, a cell's box unordered (a turned box is the same box). Two windows of one pupil page share AT MOST HALF their boxes (more than half of either window's cells inside the other fails); a Practice window is never a copy of an earlier page's window (all its boxes inside one, any task); an exit window is fresh (no window of another page, any task, holds more than half of it); the ★★★ row's windows are the lesson's edge case (`edgeTest`) and no Practice row above holds one. The dealer holds the same rules (print-sheet.js `gridOverHalf` / `gridCopy`; a Practice ref's `gridRevisit` keeps Practice on the lesson's ground so the fresh windows are left for the exit and the Check Question; `checkQuestion.first` deals it before the slip) |
| E16c (lesson 4 r1; narrowed by the lead ruling 2026-10-17) | a pupil page's Say band may hold the GIVEN numbers of its items (a story's numbers, the factors shown, a window's headers and printed products) but never an answer that is not a given, and never names an item letter ("b. ...") |
| E31 | declared `situations`: each modelled on P2 (chart or board example), assessed on P6; nothing practised that was not modelled |
| E32 | stories: one sentence per line (AX-3), at most 4 lines (SF-50), measured as each sentence's height over its line height |
| E33 | Mixed page: the lesson's own skills (P2, P3, P4, P6) hold at least half the items (V22 §9.5) |
| E34 | T2b scores the exit slip by its own item count |
| E35 | with `situations`: T4 quotes only story questions the pack prints or writes on the board; any "Steps are at the top of the page" line names a Practice 1 that prints its Steps band |
| E36 | exit-slip + items: no part equals the difference of the parts (4 + 8: 8 − 4 = 4), and none is a fact (unordered) of any other page |
| E30 | `boardOnly` (description): numbers shown on the board only (lesson 1: 1,000). The bridge passes them to every ref as a HARD bound (`refHardOk`: never relaxed, not on a ref's last try); E30 fails if one is an item, an answer, or printed (digits or name) on any pupil page or key |

## Lesson 6 additions (10 times and one tenth, 4.NBT.A.1, 2026-10-17)

Built for `g4-nbt1-ten-times-value` and meant for lesson 9 (5.NBT.A.1, decimals) too:
- **Skill option** `placevalue:value` form `times` (build list `value_ten_times`) with `tenDir` (times / tenth / both),
  `tenValues` (write both values before ringing) and `tenPlain` (700 and 70); codec keys 4E-4G, `form` token T.
- **Template** `pv-times` (`sheet/cells/pv-times.js`): a two-row place chart, a worth box per row, the ring sentence.
  Rows are strings with their places (a point column when a row has decimals), the choices come from the payload.
  `stepState` draws the chart; `guidedStepOne: true` opts a template into Guided cell 1 drawn at step 1 (roles/lesson.js,
  generic for any template with a stepState).
- **Case tests** `ten*` (roles/lesson.js), read from `q.pv` kind `times`.
- **Bridge** `q.dealAnswer` (print-sheet.js `dlAns`): what tells an item apart when its answer is one of two words (a
  ring), so two ring items of one page are not the same answer. Absent on every other item: lessons 1-5 render
  byte-identical.

Lesson 6 round 2 (critic r1 D1-D4):
- `q.factKey` (print-sheet.js `factKeyOf`): a generator names the fact the pupil produces; for "10 times" items the
  digit and the place pair, either direction ONE key, so no chart example, Guided item or Practice item returns and
  no turn-around shares a page (LR-5 / E24 read the same key).
- `spreadMax` (ref) with `q.spreadKey`: no more than n items of the pack share a spread key (lesson 6: a digit, 2).
- `pv-times` payload `sayTwo` (the sentence beside the chart, choices stacked) and `oneValue` (one worth box): the
  exit slip half holds three items that each write a value.
- P1 rows: the instruction column is 50 mm and a pv frame does not wrap, so a "100 more than ___" row stays on one line.
- Gate **E40**: no item text or slot drawn outside its cell (a clip inside a fixed-height row passed E9 / E11).
- Skill coverage (owner rule): the exit item is `placevalue:value` form times `tenWrite: 'top'` (codec 4H) and the word
  problem `tenTask: 'story'` (4I; `q.storyText` prints the story without its screen blanks). On screen `pv-times` has
  its own twin (screen-cell.js `pvTimesTwin`): the chart, typed value boxes and the ring words as tap tiles into a word
  box (slot kind `word`); `ws-screen-answer --skills placevalue:value --opts {...}` passes on card, worksheet and quiz
  for every form the lesson prints.

## Lesson 7 additions (two-step stories, 3.OA.D.8, 2026-10-17)

Built for `g3-oa8-two-step-wp` (build list `multi_step_four_ops`, first part):
- **Skill options** `algebra:multi_step_word(_plain)` `msOps` (codec 4P: `addsub` default | `mult` | `div` | `multdiv`): a × or
  ÷ table fact feeding a + or − step; guards: the Step 2 number is no Step 1 number, the answer is no story number and not
  the Step 1 answer. The + / − archetypes also lost their cancelling case (got 9, lost 9). Every word-work skill: `wpFrames`
  (codec 4Q): the compact cell, one number sentence a step (`Step 1: [ ] ( ) [ ] = [ ]`), the unit printed.
- **Kit** (sheet/cells/word-work.js): `tellTwoStep` × / ÷ grammar; `layout: 'frames'`; `twoStepPart(p, k, ctx)` (a chart
  panel's own part); `traceOp0` (Guided cell 1's Step 1 sign ringed grey); `factDiv` (a ÷ fact first step: no working rows).
- **Provider**: four worked steps for a × / ÷-first story (the last unmarked: the chart's closing line), and the two-step
  wrong answers `ms-stop-step1`, `ms-story-number`, `ms-one-op` (Check Question, T6).
- **Lesson data**: `chartRow` (with `chartWide`: heads beside the drawings), `noStripChant`, `tailRead`. Case tests `ms*`.
- **P5** `wordProblem.eqSteps` (with the vars hook `eqSteps`): one number-sentence line a step. Library string `story-steps`.
- **Round 2 (owner skill coverage rule)**: `msOps` `addmult` / `adddiv` (+ or − first, then × or ÷; tokens P / Q);
  `msLetter` (codec 4R: one equation with n, brackets when + or − comes first, then n) and `msCheck` (codec 4S: + / −
  stories - each story number rounded to the nearest ten, the estimate, Yes / No) - both drawn by the frames layout;
  library strings `story-letter`, `story-check`. The frames layout has a screen twin (inputs for every number and sign,
  the answer box the host's cell), so wpFrames / msLetter / msCheck practise online as on paper. 3.OA.D.8 is FULL.
