# Lesson cards (E4)

A **lesson card** is the one source of a lesson: `compileLesson(card)` (`js/modules/lessons/compile.js`) makes both the
short lesson (a routine + a lesson record in the `lessons/families/*.js` schema) and the long lesson (a description of the
shape of `lessons/detailed/<id>.js`) from it. One file per lesson: `design/lessons/cards/<unit-id>/<lesson-id>.md`.

**Owner ruling 2026-11-07 (via the lead): no owner sign-off.** The lane decides every line from
`WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md` and `design/LESSON_RULES.md`, records each decision with the rule it
rests on, and closes the card with the line `Decided: lf-<lane>, <date>` under the machine block. Nothing waits on the owner.

## The file

1. A readable summary (title line, the parts table, the hand-written line count, the open questions with their decisions).
   It is regenerated from the block by `ws-lesson-card --render`; never edit it by hand.
2. ONE fenced block, ` ```json lesson-card `, the source of truth.
3. `Decided: lf-<lane>, <date>` once every open question has an `answer` and a `rule`.

## The machine block (`format: "lesson-card/1"`)

| Field | What it holds | Who fills it |
|---|---|---|
| `id` | the lesson's file id (`g3-oa5-mult-properties`): the detailed id, the units/*.js key | draft |
| `lesson` | the WRM step id (`Y4.B4.S2`) or the site lesson id (`G3\|-\|patternsonthemultiplicationtable`); its library id is derived (`sup:G3.<slug>`, or `libraryId`) | draft |
| `unit`, `title`, `packTitle?`, `grade`, `level`, `strand`, `ccss`, `ee`, `eeAccess?`, `eeNote?`, `eeOwnerList?`, `cra`, `flowNote` | the lesson's identity; CCSS / EE from the links and SKILL_STANDARDS | draft |
| `shape` | a compiler shape (`js/modules/lessons/shapes/index.js`), as `design/lessons/SHAPES.md` gives it | draft (SHAPES.md) |
| `readers`, `shapeReaders` | extra item readers (`shapes/readers.js`, one per TEMPLATE); `shapeReaders: false` replaces the shape's | lane |
| `fns` | named hooks: `cqShow`, `chartSay`, `answerShow`, `lastName` (`readers.js` HOOKS) - a card never holds code | lane |
| `refs` | skill refs used twice or more, by name; a part names one `"@R1"` or `{"@": "R1", ...overrides}` (`opts` merged) | draft |
| `parts.lesson` | the practice skill of P2-P4: `{categoryId, skillId, opts, ...floors}` (floors: `minNum`, `maxNum`, `allTest`, `instructionKey` ... print-sheet.js refAccepts) | draft (links `direct`) |
| `parts.prereqs` | P0, the Prerequisite Check: `[{ref, items, lesson: {id, title}, atom: {n, type, skill, notes?}}]`, 3-4, most basic first, one prerequisite lesson each | draft (links `pre`) |
| `parts.chart` | the anchor chart and lesson sheet data (`lessonData`: concepts, vocab, steps, chant, format, example / second / third case tests, chart flags; `shortIcons` for LR-3 on the short lesson) | draft (provider `strings.steps`) + lane |
| `parts.weDo` | Guided practice: `guided`, `guidedWants`, `guidedRows`, `guidedStack`, `independent`, `practiceShape` | lane |
| `parts.practice` | `pages`, `sheets` (each Practice page's skill, shape, `edgeLast`), `edgeTest`, `edgeOnlyLast`, `fade`, `fadeMeans` | lane |
| `parts.mixed` | the Mixed page `{skills, strip}` or `null` | lane |
| `parts.numberSense` | P1 bands `{A: {items}, B: {items}}` (earlier content only) | draft |
| `parts.wordProblem` | P5: `{ref, want, ...page fields}` (its words are `story`) | draft + lane |
| `parts.exit` | P6: `{items: [{case, ref, want, detects, cols?, show?}], instruction, say, sayItem, sayAns, cols}` | draft + lane |
| `parts.retrieval` | spaced retrieval `[{ref, want?, ask, expect?}]` | draft (links `pre`) |
| `parts.checkQuestion` | `{ref?, want, correct, board?}`: the item and the right letter; the options are the provider's wrong answers; the response is ALWAYS "which is right" (owner Q9) | lane |
| `parts.chunks` | V22 Chunked Flow: `[{id: 'a', name}, {id: 'b', name, skill, lessonData}]` | lane |
| `parts.flags` | description-level engine flags a pack needs (rare) | lane |
| `timing` | minutes per section + `transitions`; must add to 60 (the shape's default otherwise) | lane |
| `ranges` | `lesson` (band / min / max, informational), `pool`, `boardOnly` (a hard bound on every ref) | draft + lane |
| `edgeCases` | `edgeTest`, `caseNames` (T5 Watch words), `cases` (LR-1 case families of the short lesson, when declared) | lane |
| `rulings` | `[{id, text, field?}]`: `board-only`, `family-repeats` (LR-5 keyed by the unordered × / ÷ family + the story frame: `repeatKey` on the pack and every ref) ... | lane |
| `followOn` | the lessons a clause is left to | lane |
| `misconceptions` | `[{id, name, step, option?, looks?, fix, caught?, exits?: [{k, label, next?}]}]`: `id` a provider misconception id; makes the T2 mistakes table, the Check Question options' meaning and the T6 wrong answers | draft (provider) + lane (words) |
| `vocabulary` | the T1 cards `[{word, gloss, diagram}]` (wrm-vocab.json words) | draft |
| **`story`** | P5's words: `instruction`, `lines` ({wp.*} placeholders), `answerLine`, `say`, `sayAns` | **hand-written** |
| **`hook`** | section 4, the Chaining bridge: lines (strings = Say rows) | **hand-written** |
| **`teach`** | the teaching notes: `t1Boxes`, `materials` (the lesson's own; whiteboards, packet and exit slips are added), `howToTeach`, `board`, `atoms` (the New atoms, each with its `n`), `routine` (tag and check per step; `step` only when it differs from the chart's), `sections` (5 / 6 / 5a ... rows and boxes in full; 1, 2, 3, 7, 8, 9, 10: only `add` rows past the shared ones, `boxes`, `name`, `say`), `loop`, `accepted`, `wrongAnswers` (rows no misconception makes), `slotRows`, `routeNote`, `situations`, `p3Score` | **hand-written** |
| `needs` | `[{kind, skill?, option?, id?, match, why}]`: what the card waits for from another lane (an option schema entry, a provider id). A problem whose text holds `match` prints as NEEDS and does not fail | lane |
| `open` | `[{id?, q, suggested, answer?, rule?}]`: every undecided line, with a suggested answer; the lane writes `answer` and `rule` | draft + lane |

## What the compiler makes (so the card does not hold it)

- the `vars` hook from the shape's readers (`{chart.rows}`, `{we.0.rule}` ...), statically checked: every placeholder of
  every script, mistake, T6 row, atom and story names a reader key (`ws-lesson-card --check`);
- the Pre-requisite atoms and their notes (`Prerequisite Check {pre.i.letters}.`) from `parts.prereqs`;
- the routine steps from the chart's Steps; the mistakes table and the T6 wrong answers from `misconceptions`;
- sections 1, 2, 3, 7, 8, 9 (first row) and 10 (`compile.js` `sharedRows`), section 4 from `hook`, the We Do's closing chant
  row; the Check Question as "Which answer is right? Show fingers." with the board's A-D;
- the 60-minute budget check, the shared materials, the CCSS routing note;
- the library entry entirely: archetype from the shape, the routine from the chart, the practice link, the Prerequisite
  Check when its questions name 3-4 distinct lessons (else `prereqsPending` with the reason and the Warm-up), Mixed partners;
- `repeatKey` from the `family-repeats` ruling; the refusal of a script line "no X" over a page that prints X.

## Commands

```bash
node tests/scripts/ws-lesson-card.mjs --draft --unit G3-Y4.B4          # the unit's CCSS BUILD lessons (--all: every CCSS lesson)
node tests/scripts/ws-lesson-card.mjs --check --unit G3-Y4.B4          # every field resolves, the card compiles and validates
node tests/scripts/ws-lesson-card.mjs --check-decided --unit G3-Y4.B4  # fails while a line is undecided (alias --check-signed)
node tests/scripts/ws-lesson-card.mjs --render --decided lf-<lane> <card.md>   # rewrite the summary, close the card
node tests/scripts/ws-lesson-card.mjs --compile --unit G3-Y4.B4 [--check]      # js/modules/lessons/units/G3-Y4.B4.js
node tests/scripts/ws-lesson-card.mjs --from-detailed <id> --unit <unit>       # seed a card from a hand-written lesson
node tests/scripts/ws-lesson-card.mjs --shapes [--check]               # design/lessons/SHAPES.md
node tests/scripts/ws-lesson-card.mjs --lines                          # hand-written lines per card
node tests/scripts/ws-lesson-compile-unit.mjs [--report]               # the proof gate
```

A decided card is never overwritten by `--draft` or `--from-detailed`; an undecided one only with `--force`.
