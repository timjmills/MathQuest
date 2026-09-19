# Skill Cell Contract

This is the technical contract that makes one sentence true: **any skill can appear on any page role, on paper
and on screen, drawn by one renderer.** It defines the data a question carries (`q.cell`), the registry that
draws it, the interface each skill supplies, the default adapters that make every existing skill work on day
one, the single generation wrapper, the page-role composer, and the safety rules for share codes.
It is written for a vanilla ES-module codebase: no build step, no new dependencies, 200+ inline `window`
handlers, one `globals.js` barrel. An implementer must be able to build from this file alone.

## Related documents

- `WORKSHEET_DESIGN_STANDARD.md` (repo root) - the visual contract: tokens, the two looks, header, cells, labels, slot shapes, grey and hatch, capacity tables.
- `PEDAGOGY_STANDARD.md` (repo root) - the teaching rules: lesson cycle, fade ladder, instruction verb library, vocabulary rule, options policy.
- `design/PAGE_TYPES.md` - every page role: anatomy drawing, geometry table, options.
- `design/PROBLEM_TYPES.md` - problem catalogue by domain, response modes print and screen, representations library.
- `design/EXTENSION_PLAYBOOK.md` - how domains with little reference material get the same look and teaching pattern.
- `design/SKILL_CELL_CONTRACT.md` - this file.

Where this file and a standard disagree on a **visual value** (a millimetre, a point size, a line weight), the
standard wins. Where they disagree on a **function signature, field name or data shape**, this file wins.

---

## 0. Conventions, scope and architecture

### 0.1 Rule ids and keywords

Every rule has an id `SCC-<section letter><number>`. MUST, MUST NOT, SHOULD and MAY carry their usual meaning.
Lints in section 10 name the rule ids they prove.

| Prefix | Section |
|---|---|
| `SCC-Q` | 1 question object |
| `SCC-T` | 2 cell template registry and `ctx` |
| `SCC-P` | 3 per-skill provider |
| `SCC-A` | 4 default adapters |
| `SCC-G` | 5 generation wrapper |
| `SCC-R` | 6 page-role composer |
| `SCC-S` | 7 strangler hook and screen adoption |
| `SCC-L` | 8 layout routing |
| `SCC-D` | 9 ladders |
| `SCC-M` | 10 migration and lints |
| `SCC-X` | 11 share-code safety |

### 0.2 Code citations

Every `file:line` below was read in the working tree of branch `sped-worksheet-standard` on 2026-09-19.
Line numbers drift; **the function or constant name is authoritative**, the line number is a convenience.
`data.js`, `skill-codes.js` and `mixed-mode-settings.js` were being edited for the share-code safety net at the
time of writing, so their line numbers are the most likely to move.

### 0.3 Architecture

```
 gen-*.js generator                     skill provider (sheet/providers.js)
   fills q.text q.ans q.visual            strings, workedSteps, wrongAnswer,
   q.printFormat  + q.cell (new)          footprint, decision, setupOnly,
        |                                 variants, notations, representations
        v                                          |
 generateQuestion()  --finalizeQuestion(q)--       |   default adapters fill every gap
        |                                          |
        v                                          v
 generateQuestionFor({...})  <----- page-role composer: compose(role, sections, options)
   state swap, seeded RNG,                         |
   forced variants                                 |  asks for cells in a STATE
        |                                          v
        |                          cell template registry (sheet/registry.js)
        |                          render(payload, ctx) -> inner HTML
        |                          answerKey / footprint / inputs
        |                                          |
        |                                          v
        |                          sheet/cell.js  renderCellBox(q, ctx)
        |                          frame + label + slots (print blank | screen input)
        |                                          |
        +------------------+-----------------------+
                           v
        print: .sheet-page divs            screen: question card, online worksheet,
        (new dialog, quiz print)           quiz, previews  (.mq-mono scope)
```

### 0.4 Module map and layers

New files. The kit lives in `js/modules/sheet/`; two new modules live beside the existing ones.

| File | Layer | Holds |
|---|---|---|
| `js/modules/skill-aliases.js` | 0 | `SKILL_ALIASES`, `resolveSkill()` (section 11). Already present, table empty |
| `js/modules/skill-codes-frozen.js` | 0 | frozen share-code tables (section 11). Already present |
| `js/modules/ladders.js` | 0 | ladder and step data only (section 9) |
| `js/modules/sheet/tokens.js` | 1 | sizes S/M/L, looks, paper, the grey token, line weights |
| `js/modules/sheet/rng.js` | 1 | `mulberry32`, `deriveSeed` |
| `js/modules/sheet/registry.js` | 1 | `registerCell`, `getCell`, `hasCell`, `listCells`, `coverage` |
| `js/modules/sheet/cell.js` | 1 | `renderCellBox`, `blank`, `mountCell`, `gradeSlots`, `markSlots`, `cutLine` |
| `js/modules/sheet/scaffolds.js` | 1 | strips, place-value labels, regroup boxes, think box, dot tile, vocabulary box |
| `js/modules/sheet/mono.js` | 1 | grey or hatch fill, trace digit style, line-art icon and counter sets |
| `js/modules/sheet/providers.js` | 1 | `registerSkill`, `getProvider`, `installLegacyAdapters` |
| `js/modules/sheet/layout.js` | 1 | `resolveLayout`, `legacySniff` |
| `js/modules/sheet/finalize.js` | 1 | `finalizeQuestion` |
| `js/modules/sheet/page.js` | 1 | `resolveSectionLayout`, `paginate`, unit packer |
| `js/modules/sheet/frame.js` | 1 | header fields, strand tab, title, footer, bands |
| `js/modules/sheet/cells/*.js` | 2 | cell templates (`legacy`, `stack`, `fact`, `equation`, `division`, `visual-*`, `table`, `word-problem`, ...) |
| `js/modules/sheet/roles/*.js` | 2 | page-role composers and `compose()` |
| `js/modules/generate-for.js` | 5 | `generateQuestionFor`, `generateBatchFor` (touches `state`, so it is outside the kit) |

Global constraints:

- **SCC-01** The kit (`js/modules/sheet/**`) is pure ES modules. It MUST NOT write to `window`, MUST NOT import
  `state.js`, `storage.js`, `progress.js`, `gamification.js`, `dashboard.js` or any `gen-*.js`, and MUST NOT
  call `Math.random`. Anything it needs from higher layers is injected (section 4.1).
- **SCC-02** No pupil data of any kind flows into the kit or the composers. There are no tracker, log, goal or
  mastery page roles, and no role reads saved progress. "Earlier work" on review pages always means skills the
  teacher listed, never stored history.
- **SCC-03** New functions called from inline HTML handlers are added to **both** the import line and the
  `Object.assign(window, {...})` block of `js/globals.js`. The kit itself attaches screen behaviour with
  `addEventListener` inside `mountCell`, so it adds no inline handlers.
- **SCC-04** No new dependency, CDN entry or build step. Every touched module passes
  `node --input-type=module --check < file.js`.
- **SCC-05** Generation is synchronous. No code between installing and restoring the seeded RNG may `await`.

---

## 1. The question object extension

### 1.1 What exists today and must keep working

`generateQuestion()` (`generate-question.js:53`) resolves skill aliases and calls `generateResolvedQuestion()`
(`:72`), which creates the base object at `:91`; a generator then fills it.
Existing consumers and the fields they read:

| Field | Read by (examples) |
|---|---|
| `text` | question card (`question-render.js:1508`), hidden text for screen readers (`:1483`), text-to-speech (`hints-speech.js:296`), quiz snapshot, form export (`google-classroom.js:810-819`), legacy print |
| `ans` | every checker (`answer-check.js:929`, `:1280`; `question-render.js:882-900`; `worksheet.js:1965`), answer keys. May be a number, a string or an object (for example `{num, den}` from `gen-fractions.js:5419`) |
| `visual` (HTML string) | seven hosts: game card `question-render.js:1595`, online worksheet, `quiz-take.js:314`, `quiz-builder.js:580`, `skills-organizer.js:668`, `google-classroom.js:815`, `map-engine.js:872` and `:1125` |
| `printFormat` | legacy print branches inside `formatProblemForPrint`, `getSkillPrintSize` (`data.js:2042`), card sizing lists (`worksheet.js:899`, `:969`), `question-render.js:1583-1590` |
| `answerType`, `options`, `interactiveType` | answer UI, checkers, `generate-question.js:502-523` |
| `hint`, `hintVisual`, `skillLabel`, `skillId` | hint popup, labels |
| `a`, `b`, `op` and the `*Data` bags | legacy print, `generateWorkedSolution`, `generateSolutionSteps`, `extractAnswerKeyHint` |
| `distractorTags` | misconception feedback (`answer-check.js:19-23`, `:44-52`) |
| `_variant` | variant bookkeeping for `recordVariantWrong/Right` |

- **SCC-Q1** The extension is **additive**. No existing field changes name, type or meaning. A consumer that
  has never heard of `q.cell` behaves exactly as it does today.
- **SCC-Q2** A migrated generator MUST still set `text` and `ans`. `text` stays a plain readable sentence or
  expression because speech, export and screen readers depend on it.

### 1.2 New fields

```js
/**
 * @typedef {Object} QuestionExtension
 * @property {{template: string, payload: Object, v?: number}} cell
 * @property {string}  [title]          caption that used to be baked into q.visual; plain text
 * @property {{iCan?: string, instruction?: string|{print: string, screen: string}}} [objective]
 * @property {LayoutHint} [layout]      section 8
 * @property {ScaffoldDecl[]} [scaffolds]
 * @property {'full'|'answer-only'|'decision'|'setup'|'notation'|'judge'|'none'} [responseScope]
 * @property {number}  [seed]           set by generateQuestionFor
 * @property {string}  [variant]        problem-type id actually generated
 * @property {string}  [notation]       notation id actually generated
 * @property {string}  [representation] representation id actually generated
 * @property {string[]} [ignoredOpts]   requested options the skill does not declare
 * @property {string}  categoryId       category the skill was generated under
 * @property {string}  [requestedSkillId] already set by generateQuestion() when an alias redirected the call
 */
```

### 1.3 `q.cell`

- **SCC-Q3** `q.cell.template` is the id of a registered cell template. `q.cell.payload` is **plain data**:
  numbers, strings, booleans, arrays and plain objects. It MUST survive `JSON.parse(JSON.stringify(payload))`
  unchanged. It MUST NOT contain HTML, DOM ids, functions, colours, font names or sizes.
- **SCC-Q4** The payload alone is enough to draw the cell in all four states (section 2.4) and to compute the
  answer key. A template never reads `q.visual`, `q.text` or `state`.
- **SCC-Q5** The only exception to SCC-Q3 is the `legacy` template (section 4.2), whose payload holds the whole
  legacy problem object including its HTML.
- **SCC-Q6** `q.cell.v` is the payload schema version of that template, default `1`. A template that changes
  its payload shape bumps the version and supplies `migrate(payload, fromV)`. This matters because saved
  quizzes keep question data in IndexedDB.

### 1.4 `q.title` and `q.objective`

Today generators bake a caption into the visual (for example the bold "Column Addition" line at
`gen-operations.js:503-507`) and the print path strips purple titles with a regular expression
(`print-generate.js:3971`).

- **SCC-Q7** A migrated generator puts any caption in `q.title` as plain text. Screen chrome may show it above
  the card. It is never drawn inside a cell and never printed inside a cell.
- **SCC-Q8** `q.objective` is set only when one item needs a different wording from the provider's strings
  (section 3.4), for example when a variant changes the verb. Otherwise it is omitted.
- **SCC-Q9** No string on a question says "Grade". Level wording ("Level 3") is produced by `frame.js` from
  `getSkillGrade` (`data.js:253`). Grade and standard codes appear only in the teacher footer.

### 1.5 `q.scaffolds`

```js
/**
 * @typedef {Object} ScaffoldDecl
 * @property {string} id                 e.g. 'pv-labels', 'regroup-boxes', 'dot-tile', 'circle-bigger',
 *                                       'skip-strip', 'number-line', 'ten-frame', 'think-box', 'trace'
 * @property {'hint'|'structural'} kind  hints fade; structural supports persist
 * @property {number[]} levels           scaffold levels at which it shows, subset of [3,2,1,0]
 * @property {Object} [data]             plain data the scaffold needs (e.g. {step: 3, upTo: 30})
 */
```

- **SCC-Q10** `q.scaffolds` lists what this item **can** host. Whether a scaffold is drawn is decided at render
  time from `ctx.scaffoldLevel` and the dialog options. Generators never draw a scaffold themselves.
- **SCC-Q11** A `hint` scaffold's `levels` MUST be a prefix of `[3,2,1,0]` (it may only disappear as the level
  falls). A `structural` scaffold defaults to `[3,2,1,0]`.

### 1.6 `q.responseScope`

What the pupil produces, and therefore which slots exist and which are graded.

| Value | The pupil... | Slots present |
|---|---|---|
| `full` (default) | works the problem and writes the answer | all |
| `answer-only` | writes only the final answer | final answer slots; work slots hidden |
| `decision` | ticks a decision tied to the structure; does not compute | tick boxes only |
| `setup` | sets the problem up (for example rewrites it vertically); does not compute | operand slots only |
| `notation` | adds the marks only (for example regroup marks) | notation slots only |
| `judge` | judges a finished cell: correct or not, then fixes it | tick boxes plus one fix slot |
| `none` | nothing; the cell is for reading | none |

- **SCC-Q12** Generators emit `full` or omit the field. The other values are set by `provider.decision(q)`,
  `provider.setupOnly(q)` and by composers on a **shallow copy** of `q`. A composer never mutates a shared `q`.

### 1.7 `finalizeQuestion(q)`

```js
// js/modules/sheet/finalize.js
export function finalizeQuestion(q) { /* idempotent */ }
```

Called once, immediately before `return q` in `generateResolvedQuestion()` (`generate-question.js:561`). It runs
after the numeric-option strip (`:502-523`), the plain word-problem rewrite (`:525-531`) and the fraction-input
promotion (`:533-548`).

1. If `q.cell` is missing, set `q.cell = { template: 'legacy', payload: null }`. The `legacy` template resolves
   its payload lazily to a shallow copy of `q` without the `cell` key (no cycle, nothing duplicated in storage).
2. If `q.cell.template` is registered and is not `legacy`, and `q.visual` is empty, fill the **legacy visual
   shim**: `q.visual = renderCellBox(q, { mode: 'screen', state: 'blank', static: true, mono: true })`.
   `static: true` draws slots as empty boxes, not inputs. This keeps the hosts that still print `q.visual`
   (quiz preview, skill preview popup, classroom export, test review) showing the right picture.
3. If `q.layout` is a string, move it to `q.dragFillLayout` (section 8.4).
4. Set `q.responseScope ??= 'full'`.

- **SCC-Q13** `finalizeQuestion` is idempotent. The recursive mixed path (`generate-question.js:485-486`)
  finalizes the inner question and copies it onto the outer one; the second call is a no-op.

### 1.8 Before and after, column addition

Today (`gen-operations.js:983-985`) the generator builds HTML with inline colours, a title and digit inputs.
After migration the same branch also emits data, and stops building the HTML:

```js
q.a = a; q.b = b; q.op = '+';
q.text = `${a} + ${b} = ?`;
q.ans = a + b;
q.printFormat = 'column-add';                 // kept until the legacy print branch is deleted
q.title = 'Column addition';
q.cell = { template: 'stack', payload: { op: '+', operands: [a, b] } };
q.layout = { card: 'card-column', checker: 'columns', requiresVisual: true };
q.scaffolds = [
    { id: 'pv-labels',     kind: 'structural', levels: [3, 2, 1, 0] },
    { id: 'regroup-boxes', kind: 'structural', levels: [3, 2, 1, 0] },
    { id: 'trace',         kind: 'hint',       levels: [3] },
];
```

---

## 2. The cell template registry

### 2.1 API

```js
// js/modules/sheet/registry.js
export function registerCell(id, template) {}
export function getCell(id) {}          // throws on an unknown id
export function hasCell(id) {}
export function listCells() {}          // string[]
export function coverage(skillKeys) {}  // {[skillKey]: {template, isLegacy, defaults: string[]}}

/**
 * @typedef {Object} CellTemplate
 * @property {(payload: Object, ctx: CellCtx) => string} render      inner HTML only
 * @property {(payload: Object) => AnswerKey} answerKey
 * @property {(payload: Object, ctx: CellCtx) => Footprint} footprint
 * @property {(payload: Object, ctx: CellCtx) => SlotSpec[]} inputs
 * @property {(payload: Object) => LayoutHint} [layout]              default layout hint (section 8)
 * @property {(payload: Object, fromV: number) => Object} [migrate]
 * @property {Array<'blank'|'traced'|'answered'|'wrong'>} [states]   default: all four
 */
```

- **SCC-T1** Template ids are lower-case kebab strings and are permanent. A template may be superseded, never
  renamed, because ids are stored in saved quizzes.
- **SCC-T2** Registering the same id twice throws. Registration happens at module load of `cells/*.js`, which
  `globals.js` imports once.

### 2.2 `ctx`

```js
/**
 * @typedef {Object} CellCtx
 * @property {'print'|'screen'} mode
 * @property {'ican'|'daily'} look
 * @property {'S'|'M'|'L'} size                      default 'L'
 * @property {3|2|1|0} scaffoldLevel                 3 Model, 2 Guided, 1 Independent, 0 Test (section 2.5)
 * @property {'blank'|'traced'|'answered'|'wrong'} state
 * @property {null|{style: 'letter'|'tab'|'model'|'none', text: string}} label   'model' = the outlined "Model" tab of a worked Daily-look cell
 * @property {boolean} mono                          true: black and white drawing rules
 * @property {boolean} photocopySafe                 true: hatch instead of grey, dotted-outline trace digits
 *
 * Extensions. Optional; a template MUST work when they are absent.
 * @property {{digitPt: number, writeMm: number, trackMm: number}} [metrics]  resolved by page.js
 * @property {{value: *, slots?: Object, misconception?: string}} [wrong]     required when state === 'wrong'
 * @property {{index: number, marks: Mark[]}} [step]   scripted Model: draw marks up to this step
 * @property {boolean} [compact]                      the role wants the smallest legal footprint (Daily 4 boxes, half-width
 *                                                    spiral panels, Today's Number bands); writing height never drops
 * @property {boolean} [template]                     print only: state 'blank' drawn with every structure and no numbers
 *                                                    (the blank reusable template page)
 * @property {'live'|'check'} [feedback]              screen only (section 7.4)
 * @property {boolean} [static]                       screen only: slots drawn as boxes, not inputs
 * @property {string} [idPrefix]                      screen only: unique prefix for input names
 * @property {Object} [options]                       frozen bag of dialog options (section 6.2)
 */
```

| Field | Default | Set by |
|---|---|---|
| `look` | role default: `ican` for lesson, review, test, reasoning and word-problem roles; `daily` for computation grid, fact layouts, spiral, mixed, Daily 4, Today's Number | composer; the dialog may override it (one look per page) |
| `size` | `L` | dialog |
| `metrics` | from `tokens.js`: digits 16 / 22 / 28 pt and writing height 6 / 8 / 10 mm at S / M / L | `page.js`. For fact sections the chosen column count sets `digitPt`: up to 5 columns 28, 6: 24, 7: 20, 8: 18, 9: 16, 10: 16 |
| `label.style` | `letter` in the I Can look, `tab` in the Daily look | composer; dialog override letters / black tabs / none |
| `mono` | `true` | always `true` inside the question card, sheets and migrated hosts |

- **SCC-T3** A template MUST NOT choose a font size, a line weight or a grey. It reads `ctx.metrics` and uses
  the classes and helpers from `cell.js`, `scaffolds.js` and `mono.js`.
- **SCC-T4** Content never shrinks. If the content does not fit the box the layout engine gave it, that is a
  layout-engine bug (fewer items per row, or another page), not something a template fixes by scaling.

### 2.3 Render output

`template.render` returns **inner HTML only**. `renderCellBox(q, ctx)` in `cell.js` wraps it:

```
 I Can look, labelled                       Daily look, labelled
 +---------------------------+              +===+---------------------+
 | a.                        |              |#3 |                     |   #3 = white bold numeral
 |       4 7                 |              +===+     4   7           |        on a black square,
 |     + 2 5                 |              |       + 2   5           |        flush top-left
 |     -----                 |              |       -------           |
 |     [ ][ ]                |              |       [ ] [ ]           |
 |   (at least 40% empty)    |              |                         |
 +---------------------------+              +-------------------------+
  hairline rules, cells share borders        heavier grid, widely tracked digits

 Model and Guided cells: same box, ctx.label === null, no letter and no tab.
```

```html
<div class="ws-cell" data-ws-cell="stack" data-ws-state="blank" data-ws-look="ican" data-ws-size="L"
     data-ws-skill="addition:add_100_regroup" data-ws-scope="full">
  <span class="ws-label ws-label--letter">a.</span>
  <div class="ws-cell-body"><!-- template.render output --></div>
</div>
```

- **SCC-T5** A template never draws the cell border, the label, the skill name, an instruction line, a level,
  a grade or a standards code. Those belong to `cell.js` and `frame.js`.
- **SCC-T6** Inside `.ws-cell` the only inks are black, white and the single grey token (or hatch when
  `photocopySafe`). No gradients, shadows, colour, emoji or decorative art.
- **SCC-T7** A dashed line means "cut here" and nothing else. Templates draw one only through `cutLine()`,
  which marks it `data-ws-cut`. Unknowns use a box or a line, never a dashed outline.
- **SCC-T8** Print mode output contains no `<input>`, `<button>`, `<select>` and no `on*` attribute.
- **SCC-T9** All lints key off `data-ws-*` attributes, never off class names used for styling.

### 2.4 States

| State | Response slots show | Used by |
|---|---|---|
| `blank` | nothing | Guided, Independent, More Practice, Review, Test, probes, Daily 4 |
| `traced` | the correct values in trace style: grey, or dotted outline when `photocopySafe`; intermediate marks (regroup digits) included. With `ctx.step`, only marks up to that step: the newest step grey, earlier steps black | Model cell, scripted Model page |
| `answered` | the correct values in solid black | answer key, True or False?, Reason It |
| `wrong` | the values from `ctx.wrong` in solid black, with **no** sign of which part is wrong | error analysis, True or False?, Reason It |

- **SCC-T10** Geometry is identical across states. An answer key page laid over its pupil page lines up
  exactly (the key is a facsimile).
- **SCC-T11** In state `blank` the text content of the cell MUST NOT contain the answer unless the answer is
  also a given of the problem.
- **SCC-T12** On screen, `traced` slots are real inputs showing the trace value as a ghost; the pupil types
  over it and gets live feedback.

### 2.5 Scaffold levels

| Level | Name | Hint scaffolds | Structural scaffolds |
|---|---|---|---|
| 3 | Model | all the step declares, plus the traced answer | all |
| 2 | Guided | all the step declares for level 2, drawn grey; no traced answer | all |
| 1 | Independent | the step's level-1 cue in the first cell of the page or section only | all |
| 0 | Test | none (with "hints on tests" ticked the page renders as level 1) | kept while "keep structural supports" is ticked (default on); unticked, the cell is bare |

These names and meanings are the ones in `PEDAGOGY_STANDARD.md` section 4.3, which also fixes the level each
page role asks for. The fact strategy cue maps onto this ladder as the pedagogy standard's four parts: part 1
(dot tile or dots on the numeral, plus "circle the bigger number") is level 2, part 2 (circle only) is level 1,
parts 3 and 4 (no cue) are level 0. Part 4 (mixed or cumulative) is also a **section mix**. On a probe the cue
part applies to every cell of the page. The think box above division facts is a hint scaffold that is off
unless the dialog option is ticked; when on it is drawn in every cell of its section.

### 2.6 Slots

Every place a pupil writes is created by one helper, so print and screen can never disagree.

```js
// js/modules/sheet/cell.js
export function blank(slot, ctx, key) {}   // returns HTML for one slot in the current mode and state

/**
 * @typedef {Object} SlotSpec
 * @property {string} id                    unique inside the cell, e.g. 'ans-0', 'regroup-1', 'sign'
 * @property {'digit'|'number'|'text'|'sign'|'fraction'|'time'|'money'|'unit'|'check'|'choice'|'place'|'drag'} kind
 * @property {'line'|'box'|'circle'|'fraction'|'mixed'|'time'|'unit'|'unit-open'|'check'|'choice'|'none'} shape   the design standard's section 6 keys; printed as data-ws-shape
 * @property {boolean} graded               false for regroup boxes and scratch space
 * @property {number} order                 focus order on screen (0 first)
 * @property {number} [maxLength]
 * @property {string} [inputmode]           'numeric' | 'decimal' | 'text'
 * @property {string} [unitWord]            pre-printed after a number slot
 * @property {string} [legacyClass]         e.g. 'column-answer-input' (section 7.3)
 * @property {Array<'full'|'answer-only'|'decision'|'setup'|'notation'|'judge'>} scopes  scopes that include this slot
 */
```

Slot shape tells the answer type: a line for a number, a box for a digit, a circle for a sign, a fraction
stack, two boxes with a printed colon for a time, a number slot followed by its unit word, a tick box for a
decision.

| Mode and state | `blank(slot, ctx, key)` returns |
|---|---|
| print, `blank` | `<span class="ws-slot" data-ws-slot="ans-0" data-ws-shape="box"></span>` |
| print, `traced` / `answered` / `wrong` | the same span holding the value, with `data-ws-ink="trace"` or `"solid"` |
| screen, not static | `<input data-slot="ans-0" data-ws-slot="ans-0" data-ws-shape="box" inputmode="numeric" maxlength="1" ...>` plus `legacyClass` when declared |
| screen, static | the print form |

- **SCC-T13** `inputs(payload, ctx)` returns exactly the slots that `render` draws for the same arguments,
  filtered by `q.responseScope`.
- **SCC-T14** Digit entry order follows the algorithm, not the DOM: right to left for add, subtract and
  multiply rows, left to right for a division quotient. DOM order stays left to right (section 7.3).
- **SCC-T15** Parity: a slot the pupil writes on paper is typed on screen. A template never turns a production
  item into multiple choice unless the paper form is multiple choice.

### 2.7 `answerKey`

```js
/**
 * @typedef {Object} AnswerKey
 * @property {*} value                       same meaning and type as q.ans
 * @property {string} display                how the key prints it, e.g. '1,204' or '3 R 2'
 * @property {{[slotId: string]: {value: string, graded: boolean, accept?: string[]}}} slots
 */
```

- **SCC-T16** `answerKey(payload).value` equals `q.ans` after normalisation (numbers by value, strings trimmed
  with thousands separators removed, objects by deep equality).
- **SCC-T17** Regroup boxes, scratch space and think boxes are always `graded: false`. They are never marked
  right or wrong, on paper or on screen.
- **SCC-T18** Thousands use a comma separator in `display`. Units are US customary or metric as the payload
  says. Division uses the US long-division bracket.

### 2.8 `footprint`

```js
/**
 * @typedef {Object} Footprint
 * @property {number} wMm        minimum content width for this ctx
 * @property {number|null} hMm   minimum content height, or null when it must be measured
 * @property {boolean} measure   true: the paginator measures the rendered cell (legacy cells)
 * @property {boolean} factLike  true: eligible for the 5-10 column fact layouts
 * @property {number} maxCols    hard cap on cells per row, before the digit-aware clamp
 * @property {number} [tracks]   digit tracks for stacked problems (drives the digit-aware clamp)
 * @property {number} [workRows] ruled work rows to add below the problem (word problems)
 * @property {{w: number, h: number}} [span]  grid units on a mixed-practice sheet for this look and size;
 *                                            when absent, page.js derives it (SCC-T19)
 */
```

- **SCC-T19** `page.js` turns footprints into spans: `span = ceil(wMm / unitWidth)` where `unitWidth` is the
  live width of the paper divided by the chosen column count. A4 live area is 186 x 271 mm; paper is a
  parameter and US Letter is selectable. When a multi-digit problem cannot fit the chosen column count, the
  column count is clamped for that section and a note is returned to the dialog. The note is never printed.
- **SCC-T20** A cell is unbreakable. If it does not fit the remaining page it moves to the next page. If a
  single cell is taller than a whole page at the chosen size, the section's item count drops and the dialog
  says so.

### 2.9 Example template

```js
// js/modules/sheet/cells/fact.js
import { registerCell } from '../registry.js';
import { blank } from '../cell.js';

const SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

registerCell('fact', {
    render(p, ctx) {
        const key = this.answerKey(p);
        const slot = blank({ id: 'ans', kind: 'number', shape: 'line', graded: true, order: 0,
                             maxLength: 3, inputmode: 'numeric', scopes: ['full', 'answer-only'] }, ctx, key);
        if (p.notation === 'vertical') {
            return `<div class="ws-stack" style="--ws-digit-pt:${ctx.metrics.digitPt}">
                <div class="ws-stack-row">${p.a}</div>
                <div class="ws-stack-row ws-stack-row--op"><span class="ws-op">${SYMBOL[p.op]}</span>${p.b}</div>
                <div class="ws-stack-rule"></div>${slot}</div>`;
        }
        return `<div class="ws-equation">${p.a} ${SYMBOL[p.op]} ${p.b} = ${slot}</div>`;
    },
    answerKey(p) {
        const value = p.op === '+' ? p.a + p.b : p.op === '-' ? p.a - p.b : p.op === '*' ? p.a * p.b : p.a / p.b;
        return { value, display: String(value), slots: { ans: { value: String(value), graded: true } } };
    },
    footprint(p, ctx) {
        return { wMm: 18, hMm: p.notation === 'vertical' ? 3.2 * ctx.metrics.writeMm : 2 * ctx.metrics.writeMm,
                 measure: false, factLike: true, maxCols: 10, tracks: 3 };
    },
    inputs(p, ctx) {
        return [{ id: 'ans', kind: 'number', shape: 'line', graded: true, order: 0,
                  maxLength: 3, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
    },
});
```

The millimetre values above only illustrate the shape of a footprint; the real values are the fact-cell geometry of `WORKSHEET_DESIGN_STANDARD.md` (VA-70 and the capacity tables), which govern.

---

## 3. The per-skill provider

### 3.1 API

```js
// js/modules/sheet/providers.js
export function registerSkill(key, provider) {}     // key: 'categoryId:skillId' or 'skillId'
export function getProvider(categoryId, skillId) {} // never null: gaps are filled by default adapters
```

- **SCC-P1** Lookup order is `categoryId:skillId`, then `skillId`, then the default adapters. The category key
  exists because some skill ids are reused across categories (the print path already works around this at
  `print-generate.js:3912-3922`).
- **SCC-P2** `getProvider` returns a complete object. Each missing member is filled from section 4 and listed
  in `provider.defaults` (for example `['strings', 'wrongAnswer']`) so `coverage()` and the lints can see it.

### 3.2 Shape

```js
/**
 * @typedef {Object} SkillProvider
 * @property {(q, ctx: CellCtx) => string} renderCell
 * @property {(q) => WorkedStep[]} workedSteps
 * @property {(q) => WrongAnswer|null} wrongAnswer
 * @property {SkillStrings} strings
 * @property {StaticFootprint} footprint
 * @property {(q) => Object|null} [decision]      derived question, responseScope 'decision'
 * @property {(q) => Object|null} [setupOnly]     derived question, responseScope 'setup'
 * @property {(q) => Object|null} [open]          derived open problem for the Stretch role
 * @property {string[]} [claims]                  general statements for Reason It: always / sometimes / never
 * @property {OptionDecl[]} [variants]            problem types
 * @property {OptionDecl[]} [notations]           e.g. vertical, horizontal, missing number
 * @property {OptionDecl[]} [representations]     concrete, pictorial, abstract forms
 * @property {string[]} [supports]                constraint keys the generator honours (section 9.3)
 * @property {string[]} [misconceptions]          ids wrongAnswer may return
 * @property {string[]} defaults                  filled in by getProvider
 */
```

### 3.3 `renderCell`, `workedSteps`, `wrongAnswer`

- **SCC-P3** `renderCell(q, ctx)` defaults to `renderCellBox(q, ctx)`. A provider overrides it only to choose
  between templates for one skill; it never emits HTML of its own.

```js
/**
 * @typedef {Object} WorkedStep
 * @property {string} text      one numbered imperative, at most 10 words, print verbs only
 * @property {Mark[]} marks     what appears in the cell when this step is done
 * @typedef {Object} Mark
 * @property {string} slot      a slot id of the cell, or a scaffold anchor such as 'circle:a'
 * @property {string} value
 */
```

- **SCC-P4** `workedSteps(q)` returns 3 to 6 steps. After the last step every graded slot has its value. The
  same array feeds the Steps band on the opener, the traced Model cell, the scripted Model page (the problem
  redrawn once per step: newest marks grey, older marks black) and the screen hint ladder.
- **SCC-P5** Step text uses "regroup", never "carry" or "borrow".

```js
/**
 * @typedef {Object} WrongAnswer
 * @property {*} value                  a wrong final answer of the same type as q.ans
 * @property {string} misconception     id from provider.misconceptions, or 'unknown'
 * @property {{[slotId: string]: string}} [slots]   wrong working, slot by slot
 * @property {string} [explain]         one short sentence for the teacher key
 */
```

- **SCC-P6** `wrongAnswer(q).value` differs from `q.ans`, has the same type and magnitude, and comes from a
  real misconception wherever the skill has one (forgot to regroup, added instead of subtracted, read the wrong
  clock hand). It returns `null` when no sensible wrong answer exists; the composer then picks another item.

### 3.4 `strings`

```js
/**
 * @typedef {Object} SkillStrings
 * @property {string} iCan                        'I Can add two-digit numbers'
 * @property {string|{print: string, screen: string}} instruction   a string from the instruction library, at most 12 words
 * @property {string} [instructionKey]             the library key of that string (PEDAGOGY_STANDARD.md section 10.1)
 * @property {string} [whatsNew]                  one sentence: the one new thing
 * @property {Array<{term: string, meaning: string, diagram?: string}>} [vocabulary]   at most 3
 * @property {string} [oralFrame]                 '__ plus __ equals __.'
 * @property {string} [rule]                      one rule sentence for the Rule band or a spiral rule box
 */
```

- **SCC-P7** `iCan` starts with "I Can " (both words capitalised), continues in sentence case with no closing
  period, follows `I Can <verb> <object> (<constraint>)`, and is identical on every page of a lesson packet.
- **SCC-P8** `instruction` comes from the controlled verb library in `PEDAGOGY_STANDARD.md`. The print form uses
  paper verbs (write, circle, tick, draw, match); the screen form may use type and tap. This replaces the
  regular-expression verb sweep at `print-generate.js:3872-3890`.
- **SCC-P9** No string contains a grade, a standards code, a product or publisher name, or wording copied from
  any third-party material. Stories and sentences are original and use neutral contexts.
- **SCC-P10** `vocabulary[].diagram` is the id of a labelled mini-diagram in `scaffolds.js`, never HTML.

### 3.5 `footprint` (static)

Used before anything is generated: dialog clamp notes, capacity, whether the fact layouts are offered.

```js
/**
 * @typedef {Object} StaticFootprint
 * @property {'fact'|'stack'|'equation'|'division'|'visual-half'|'visual-full'|'table'|'text'|'word-problem'|'legacy'} kind
 * @property {boolean} factLike
 * @property {number} maxCols
 * @property {(range: number, decimals: number) => number} [tracksAt]   digit tracks at a number range
 * @property {{ican: number, daily: number}} [perPage]   default item count per page at size L
 */
```

### 3.6 Option declarations

```js
/**
 * @typedef {Object} OptionDecl
 * @property {string} id          stable id, e.g. 'vertical', 'start_unknown', 'ten-frame'
 * @property {string} code        1-2 characters from the share alphabet; unique in this list; never reused
 * @property {string} label       teacher-facing
 * @property {string} cyclerKey   the key the generator passes to pickVariant()
 * @property {number} [weight]    default mix weight
 */
```

- **SCC-P11** A skill declares an option only when its generator chooses that option through
  `pickVariant(cyclerKey, [...ids])` (`variant-cycler.js:124`). Declared ids MUST equal the strings the generator
  passes. Example today: division facts rotate `horiz / fraction / long` under the key `div_facts_visual`
  (`gen-operations.js:5266-5268`), so that list can be declared as `notations` as soon as it has a provider.
  Counter-example: add, subtract and multiply facts pick vertical or horizontal with a bare
  `Math.random() < 0.5` (`gen-operations.js:5222`, `:5237`, `:5251`); they cannot declare `notations` until those
  lines call `pickVariant`.
- **SCC-P12** Option lists are append-only and `code` values are permanent, because share codes store them
  (section 11.4).

### 3.7 Example provider

```js
registerSkill('division:div_facts', {
    strings: {
        iCan: 'I Can divide (facts within 100)',
        instructionKey: 'divide',
        instruction: 'Divide.',
        oralFrame: '__ divided by __ equals __.',
    },
    footprint: { kind: 'fact', factLike: true, maxCols: 10, tracksAt: () => 2, perPage: { ican: 20, daily: 40 } },
    notations: [
        { id: 'horiz',    code: 'H', label: 'Horizontal',   cyclerKey: 'div_facts_visual' },
        { id: 'fraction', code: 'F', label: 'Fraction bar', cyclerKey: 'div_facts_visual' },
        { id: 'long',     code: 'L', label: 'Bracket',      cyclerKey: 'div_facts_visual' },
    ],
    misconceptions: ['subtracted', 'off-by-one-group'],
    workedSteps: (q) => [
        { text: `Think: ${q.b} times what is ${q.a}?`, marks: [] },
        { text: 'Skip count to check.',                 marks: [] },
        { text: 'Write the answer.',                    marks: [{ slot: 'ans', value: String(q.ans) }] },
    ],
    wrongAnswer: (q) => ({ value: q.a - q.b, misconception: 'subtracted' }),
});
```

---

## 4. Default adapters: every existing skill works immediately

### 4.1 Injection

The adapters need functions from higher layers. To keep the kit pure and the import graph acyclic, they are
injected once from `globals.js`, before `bootstrap()`:

```js
// js/globals.js
import { installLegacyAdapters } from './modules/sheet/providers.js';
installLegacyAdapters({
    formatLegacy:     formatProblemForPrintLegacy,   // print-generate.js, section 7.1
    workedSolution:   generateWorkedSolution,        // print-generate.js:12167
    solutionSteps:    generateSolutionSteps,         // solution-display.js:50
    answerKeyHint:    extractAnswerKeyHint,          // print-generate.js:308
    printSize:        getSkillPrintSize,             // data.js:2042
    sizeColumns:      PRINT_SIZE_COLUMNS,            // data.js:2034
    fullLabels:       SKILL_FULL_LABELS,             // data.js:2144
    shortLabel:       getSkillLabelForQuestion,      // game-control.js:873
});
```

- **SCC-A1** If `installLegacyAdapters` has not run, `getProvider` still returns a provider; the affected members
  return their empty forms (`[]`, `null`, a text-only cell). Tests rely on this.

### 4.2 Cell: the `legacy` template

| ctx | Output |
|---|---|
| print, `blank` | `formatLegacy(clone, 0, min(columns, 9), sizeCategory, false)`, with the legacy number header (`.p-head`, `print-generate.js:3937-3945`) removed through a detached `<template>` element, placed in `.ws-cell-body` |
| print, `answered` | the same, plus a stamped answer row below it: the word "Answer" and `display` in solid black |
| print, `traced` | the same, stamped row in trace style |
| print, `wrong` | the same, stamped row showing `ctx.wrong.value` in solid black |
| screen | nothing new: the host keeps today's path (`visualAid.innerHTML = q.visual`) inside a `.mq-mono` scope |

- **SCC-A2** The adapter always passes a **shallow clone** to `formatLegacy`, because the legacy function
  rewrites `problem.text` and `problem.visual` in place (`print-generate.js:3868-3906`). Without the clone a
  second render (key page, thumbnail) double-processes the strings.
- **SCC-A3** `columns` is capped at 9 so the ten-column shortcut (`print-generate.js:4028-4042`) never fires
  inside a cell. Real 5-10 column fact rows come from the `fact` template.
- **SCC-A4** `showSkillLabels` is always `false`: the kit owns labels.
- **SCC-A5** The cell is marked `data-ws-legacy="1"`. The legacy work-space box (`.ws-work-space`,
  `print-generate.js:12042-12044`) is restyled to a solid hairline by one additive rule in `css/sheet-kit.css`,
  so that dashed keeps its single meaning.
- **SCC-A6** `footprint` for a legacy cell is `{ measure: true, hMm: null }`. The caller of `paginate` supplies a
  `measure(html)` function (a hidden off-screen `.sheet-page` with the real stylesheets).
- **SCC-A7** `display` for the stamp is `String(q.ans)` for simple values, otherwise `answerKeyHint(q)` joined
  with the answer. `inputs` returns the single entry `{ id: 'answer', kind: 'text', shape: 'line', graded: true }`.

### 4.3 `workedSteps`

1. Call `workedSolution(problem)` (`generateWorkedSolution`, `print-generate.js:12167`). It returns an array of
   HTML strings keyed off `printFormat`.
2. If that produced only its fallback (a "Problem" line and an "Answer" line, `print-generate.js:12805-12808`),
   call `solutionSteps(q)` (`generateSolutionSteps`, `solution-display.js:50`), which keys off `a / b / op` and
   the data bags.
3. Normalise: strip tags and `&nbsp;`, drop the "Problem" line, drop leading "Step N:" text, replace
   carry / borrow wording with regroup wording, merge indented detail lines into their parent, cap at 6.
4. The "Answer" line becomes the final step `{ text: 'Write the answer.', marks: [{ slot: 'answer', value }] }`.
5. If nothing remains, split `q.hint` into sentences. If that is empty too, return the single final step.

The default result is flagged in `provider.defaults`; content lint SCC-LINT-14 only passes for real providers.

### 4.4 `wrongAnswer`

Tried in order; the first usable result wins. All random choices run under the seeded RNG.

1. **Tagged distractors.** `q.distractorTags` (written by `window.tagDistractor`, `answer-check.js:19-23`): the
   first tagged value that differs from `q.ans`. `misconception` is `'tagged'` and `explain` is the tag text.
2. **Options.** Entries of `q.options` that differ from `q.ans`. Note that numeric options are removed for most
   answer types at `generate-question.js:502-523`, so this source mostly serves word and symbol choices.
3. **Typed perturbation** by answer shape:

| `q.ans` shape | Perturbation |
|---|---|
| integer with `a`, `b`, `op` known | the other operation of the pair (`a - b` for `+`, `a + b` for `-` and for `x`, `a - b` for division); if that equals the answer or is negative, fall through |
| integer | plus or minus 10 when the answer is 20 or more, otherwise plus or minus 1; never negative, never equal |
| decimal string or number | decimal point moved one place |
| fraction `n/d` | denominators added as well as numerators when `fractionData` has an operation; otherwise numerator and denominator swapped |
| time `h:mm` | hour hand and minute hand read the wrong way round when that is a valid time; otherwise plus or minus 5 minutes |
| one of a fixed word set (yes / no, greater / less, odd / even) | another member of the set |
| anything else | `null` |

### 4.5 `strings`

| Member | Default |
|---|---|
| `iCan` | label = `fullLabels[skillId]`, else `shortLabel(skillId, categoryId)`; remove bracketed tags such as "(Visual)" and ranges in brackets; lower-case the first letter. If the first word is in the verb list (add, subtract, multiply, divide, count, compare, order, round, estimate, find, identify, name, sort, read, write, tell, measure, convert, simplify, solve, make, build, plot, graph, classify, partition, compose, decompose) the string is `I Can <label>`. Otherwise it is `I Can work on <label>`. Neither takes a closing period |
| `instruction` | a library string chosen by `answerType`: number or text `default-write` "Solve. Write the answer."; multiple choice `default-circle` "Circle the answer."; multi-select `default-circle-all` "Circle all the correct answers."; ordering `default-order` "Write the numbers in order."; drag or match `match` "Draw a line to match."; placement `line-mark` "Mark the number on the line."; otherwise `default-solve` "Solve." |
| `whatsNew`, `vocabulary`, `oralFrame` | empty; the band, box or line is omitted, never filled with placeholder text |

### 4.6 `footprint`

`size = printSize(skillId, q.printFormat)` (`getSkillPrintSize`, which reads `SKILL_PRINT_SIZE`, `data.js:1662`,
then `PRINT_FORMAT_SIZE`, `data.js:1951`, then `'standard'`). `maxCols = sizeColumns[size]`.

| Legacy size | `maxCols` | `wMm` on A4 (186 / maxCols) | `workRows` | `kind` |
|---|---|---|---|---|
| `compact` | 3 | 62 | 0 | `legacy` |
| `standard` | 2 | 93 | 0 | `legacy` |
| `medium` | 2 | 93 | 0 | `legacy` |
| `wide` | 1 | 186 | 0 | `legacy` |
| `spacious` | 1 | 186 | 4 | `legacy` |

The column counts are the ones in code (`PRINT_SIZE_COLUMNS`, `data.js:2034`), which gives `standard` 2 columns.

`factLike` is `true` by default only for `add_facts`, `sub_facts`, `mult_facts`, `div_facts` and any question
whose `printFormat` matches `/-facts-(vertical|horizontal|fraction|long)$/` (`gen-operations.js:5223-5285`).

### 4.7 Optional members

The owner's rule is that any skill reaches any page role, including the sub-skill page, error analysis and
Stretch. So the optional members also have defaults. They are deliberately plain and are flagged
`data-ws-default` so a family migration replaces them.

| Member | Default derived question |
|---|---|
| `decision(q)` | scope `judge`: the cell drawn `answered` or `wrong` (seeded, half each) with two tick boxes, "Correct" and "Not correct". A real provider replaces this with a decision tied to the structure (regroup or not, which operation, which unit). |
| `setupOnly(q)` | scope `setup`: the blank cell with computation slots removed. Stacked problems show empty operand tracks to copy the numbers into; other cells show the givens with an instruction to circle what is needed. |
| `open(q)` | numeric answers: "make this answer in different ways" with a results table of 4 rows as the entry scaffold. Non-numeric answers: "change one part, then solve" with a two-column results table. |
| `variants`, `notations`, `representations` | none. The dialog's problem-mix control shows "one type" only and says why. |

---

## 5. `generateQuestionFor`

### 5.1 Signature

```js
// js/modules/generate-for.js
/**
 * @param {Object} spec
 * @param {string} spec.category          UI category id, e.g. 'addition'
 * @param {string} spec.skill             skill id, e.g. 'add_100_regroup'
 * @param {number} [spec.range=100]       10 | 20 | 50 | 100 | 500 | 1000 | 10000
 * @param {number} [spec.decimals=0]      0..3
 * @param {GenOpts} [spec.opts]
 * @param {number} [spec.seed]            uint32. Omit for unseeded (live preview) generation
 * @returns {Object|null}                 the full question object, or null after 3 retries
 */
export function generateQuestionFor({ category, skill, range = 100, decimals = 0, opts = {}, seed } = {}) {}

/** Same, for a run of items that share one variant rotation. Item i uses deriveSeed(seed, 'item', i). */
export function generateBatchFor(spec, count) {}

/**
 * @typedef {Object} GenOpts
 * @property {string} [variant]          an id from provider.variants
 * @property {string} [notation]         an id from provider.notations
 * @property {string} [representation]   an id from provider.representations
 * @property {3|2|1|0} [scaffoldLevel]   only for generators that bake level-dependent content
 * @property {number[]} [tables]         fact tables; swapped into state.selectedNumbers
 * @property {number} [value]           a number the item must be built around (Today's Number bands)
 * @property {Object} [constraints]      ladder constraints (section 9.3)
 * @property {string} [gameMode='practice']
 * @property {Object} [batch]            internal: shared variant history for generateBatchFor
 */
```

### 5.2 Behaviour

- **SCC-G1 State swap in try/finally.** Save, set, generate, restore. Restored in `finally`, so an exception in a
  generator can never leave the app in the wrong skill. Swapped keys: `category`, `skill`, `range`,
  `decimalPlaces`, `gameMode`, `isMixedMode`, `difficulty`, `hasAnswered`, `currentQ`, `qCount`, `quizMode`,
  `mapMode`, `adaptiveModeEnabled`, `skillOptions`, and a copy of `selectedNumbers`.
- **SCC-G2 Fixed difficulty.** Inside the swap `adaptiveModeEnabled` and `mapMode` are `false`. The adaptive hook
  at `generate-question.js:83-89` otherwise changes `state.range` whenever `gameMode` is `'practice'`, which is
  what all four existing swap sites set.
- **SCC-G3 `gameMode` stays `'practice'`** by default, to match the four existing sites and the baseline images.
  (It also keeps the fraction-input promotion at `generate-question.js:533-548` behaving as it does today.)
- **SCC-G4 Full payload pass-through.** The function returns the object `generateQuestion()` returned, plus
  `categoryId`, `skillId` (if the generator left it unset), `seed`, `variant`, `notation`, `representation` and
  `ignoredOpts`. There is no field whitelist. The print call site applies `q.printFormat ||= 'horizontal'` as it
  does today (`print-settings.js:1374`).
- **SCC-G5 Seeded RNG.** When `seed` is an integer, `mulberry32(seed)` is installed over `Math.random` and the
  original function is put back in `finally`. `randInt`, `shuffle` and `pick` (`utils.js:3-7`) and every bare
  `Math.random()` in the generators then become reproducible with no generator edits.
- **SCC-G6 What "reproducible" covers.** For the same spec and seed, `q.text`, `q.ans` and
  `JSON.stringify(q.cell.payload)` are identical. `q.visual` is **not** covered: some generators build DOM ids
  from `Date.now()` (`gen-operations.js:983`, `:5179`).
- **SCC-G7 Variant history is isolated.** `pickVariant` keeps least-recently-used history on
  `window.__variantHistory` and `window.__variantWrongCounts` (`variant-cycler.js:45-49`). A seeded call swaps in
  fresh buckets (or the batch's buckets) and restores the live ones in `finally`, so gameplay history neither
  affects nor is affected by sheet generation. The tie-break jitter (`variant-cycler.js:108`) uses
  `Math.random`, so it is seeded too.
- **SCC-G8 Options are honoured only when declared.** For each of `variant`, `notation`, `representation`: if the
  provider declares an option with that id, the pair `{ [cyclerKey]: id }` is forced through the variant cycler.
  If not, the option is dropped and named in `q.ignoredOpts`; the dialog shows it, the sheet does not.
  `scaffoldLevel` is forced under the key `<skillId>#scaffold` and only matters to generators that call
  `pickVariant('<skillId>#scaffold', ['3','2','1','0'])`. For everyone else the level is purely a render-time
  `ctx` value.
- **SCC-G9 Retries.** Up to 3 retries when the result is unusable (`!q || !(q.text || q.visual || q.cell)`), each
  with `deriveSeed(seed, 'retry', n)`. After that, `null`; the caller keeps its fallback
  (`generateCategoryFallbackStatic`, `print-settings.js:1403`).
- **SCC-G10 Aliases first.** The spec passes through `resolveSkill` (section 11.3) before anything else; alias
  options are the base and `spec.opts` overrides them. `generateQuestion()` also resolves aliases for live play
  (`generate-question.js:53-70`); because the wrapper has already resolved, that second pass is a no-op.
- **SCC-G10a One channel for generator-readable options.** Inside the swap, `state.skillOptions` holds the merged
  options (`variant`, `notation`, `representation`, `scaffoldLevel`, `tables`, `constraints`). This is the same
  field the alias redirect in `generateQuestion()` fills (`generate-question.js:57-68`). Generators MAY read it;
  the variant cycler remains the mechanism that actually forces a declared variant, notation or representation.
- **SCC-G11 Seeds.** A sheet has one base seed, shown in the dialog in base 36. Derived seeds:
  `deriveSeed(base, 'section', id)`, then `'item', i`; test forms `'form', 'A'` and `'form', 'B'`; probe versions
  and Today's Number versions `'version', 'A'..'D'`; day bands `'day', n`.

### 5.3 The variant cycler hook

```js
// js/modules/variant-cycler.js  (additions)
let _forced = null;

export function withForcedVariants(map, fn) {
    const prev = _forced;
    _forced = map && Object.keys(map).length ? map : null;
    try { return fn(); } finally { _forced = prev; }
}

export function swapVariantBuckets(batch) {
    const saved = { h: window.__variantHistory, w: window.__variantWrongCounts };
    window.__variantHistory = batch ? batch.history : {};
    window.__variantWrongCounts = {};
    return { restore() { window.__variantHistory = saved.h; window.__variantWrongCounts = saved.w; } };
}

// inside pickVariant(), directly after the empty-array guard at :125
if (_forced && Object.prototype.hasOwnProperty.call(_forced, skillId)) {
    const want = String(_forced[skillId]);
    const hit = variants.find(v => String(v) === want);
    if (hit !== undefined) { pushHistory(skillId, hit); return hit; }
}
```

A forced id that is not in the generator's list is ignored, so a stale share code can never break generation.

### 5.4 Reference implementation

```js
import { state } from './state.js';
import { generateQuestion } from './generate-question.js';
import { withForcedVariants, swapVariantBuckets } from './variant-cycler.js';
import { resolveSkill } from './skill-aliases.js';
import { getProvider } from './sheet/providers.js';
import { mulberry32, deriveSeed } from './sheet/rng.js';

const SWAP = ['category', 'skill', 'range', 'decimalPlaces', 'gameMode', 'isMixedMode', 'difficulty',
              'hasAnswered', 'currentQ', 'qCount', 'quizMode', 'mapMode', 'adaptiveModeEnabled', 'skillOptions'];

function honouredOpts(provider, want) {
    const forced = {}, ignored = [];
    const lists = { variant: provider.variants, notation: provider.notations,
                    representation: provider.representations };
    for (const name of Object.keys(lists)) {
        if (want[name] == null) continue;
        const decl = (lists[name] || []).find(o => o.id === want[name]);
        if (decl) forced[decl.cyclerKey] = decl.id; else ignored.push(name);
    }
    return { forced, ignored };
}

function optionsForGenerator(want) {
    const { batch, gameMode, ...rest } = want;          // plain data only
    return Object.keys(rest).length ? rest : undefined;
}

function once(target, range, decimals, want, forced, seed) {
    const saved = {};
    for (const k of SWAP) saved[k] = state[k];
    const savedTables = Array.isArray(state.selectedNumbers) ? [...state.selectedNumbers] : state.selectedNumbers;
    const realRandom = Math.random;
    const seeded = Number.isInteger(seed);
    const buckets = seeded ? swapVariantBuckets(want.batch) : null;
    try {
        Object.assign(state, {
            category: target.categoryId, skill: target.skillId, range, decimalPlaces: decimals,
            gameMode: want.gameMode || 'practice', isMixedMode: false, quizMode: false, mapMode: false,
            adaptiveModeEnabled: false, skillOptions: optionsForGenerator(want),
        });
        if (Array.isArray(want.tables) && want.tables.length) state.selectedNumbers = [...want.tables];
        else if (!state.selectedNumbers || !state.selectedNumbers.length) {
            state.selectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
        }
        if (want.scaffoldLevel != null) forced[`${target.skillId}#scaffold`] = String(want.scaffoldLevel);
        if (seeded) Math.random = mulberry32(seed);
        return withForcedVariants(forced, () => generateQuestion());
    } catch (e) {
        console.warn('generateQuestionFor failed', target.categoryId, target.skillId, e);
        return null;
    } finally {
        Math.random = realRandom;
        if (buckets) buckets.restore();
        for (const k of SWAP) state[k] = saved[k];
        state.selectedNumbers = savedTables;
    }
}

export function generateQuestionFor({ category, skill, range = 100, decimals = 0, opts = {}, seed } = {}) {
    const target = resolveSkill(category, skill);
    const provider = getProvider(target.categoryId, target.skillId);
    const want = { ...target.opts, ...opts };
    const { forced, ignored } = honouredOpts(provider, want);
    for (let n = 0; n <= 3; n++) {
        const s = Number.isInteger(seed) ? (n === 0 ? seed >>> 0 : deriveSeed(seed, 'retry', n)) : undefined;
        const q = once(target, range, decimals, want, { ...forced }, s);
        if (q && (q.text || q.visual || q.cell)) {
            q.categoryId = target.categoryId;
            q.skillId = q.skillId || target.skillId;
            if (s !== undefined) q.seed = s;
            for (const name of ['variant', 'notation', 'representation']) {
                if (want[name] != null && !ignored.includes(name)) q[name] = want[name];
            }
            if (ignored.length) q.ignoredOpts = ignored;
            return q;
        }
    }
    return null;
}
```

```js
// js/modules/sheet/rng.js
export function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function deriveSeed(seed, ...parts) {
    let h = (0x811c9dc5 ^ (seed >>> 0)) >>> 0;
    const s = parts.join('');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
}
```

### 5.5 The four call sites it replaces

| # | Site | Today | Defect removed |
|---|---|---|---|
| 1 | `print-settings.js:1343-1401` `generateProblemForSkillStatic` | manual save and restore written twice (success path and `catch`), then a field whitelist at `:1368-1389` | the whitelist drops every field it does not name, which is why several print branches never receive their data; `selectedNumbers` set at `:1356-1358` is never restored |
| 2 | `quiz-builder.js:151-178` `safeGenerateQuestion` | try / finally with `Object.assign(state, saved)` | duplicate of site 3; no seed, so quiz print versions cannot be reproduced |
| 3 | `skills-organizer.js:570-600` `safeGenerateQuestion` | the same code again | duplicate |
| 4 | `google-classroom.js:778-786` inline swap | swaps `state.skill` only, no `try` | `state.category` is never set, so a skill from another category is generated under the wrong category; an exception leaves `state.skill` changed |

Each becomes a one-line call. Site 1 keeps its name and signature as a wrapper so its callers do not change.

**Not replaced:** `game-control.js:794`, `worksheet.js:816` and `:1372`, `map-engine.js:312`. They generate from
the live `state` on purpose. The swaps inside the dead legacy function `generatePrintProblem`
(`print-generate.js:377`; calls at `:3666`, `:3710`, `:3742`, `:3837`) disappear with its deletion-only commit,
which also removes it from `globals.js:66` and `:396`.

- **SCC-G12** Switching site 1 to full pass-through wakes print branches that have been starved of data.
  Baseline images of every skill MUST exist before that commit and every difference MUST be reviewed.

---

## 6. The page-role composer

### 6.1 API

```js
// js/modules/sheet/roles/index.js
export function registerRole(id, role) {}
export function listRoles() {}
/**
 * @param {string} role
 * @param {Section[]} sections
 * @param {ComposeOptions} options
 * @returns {Page[]}
 */
export function compose(role, sections, options) {}

/**
 * @typedef {Object} RoleDef
 * @property {'ican'|'daily'} look                    default look
 * @property {boolean} [factOnly]                     true: offered only when footprint.factLike
 * @property {(sections: Section[], options: ComposeOptions, api: RoleApi) => Page[]} compose
 *
 * @typedef {Object} RoleApi
 * @property {(skillSpec, n: number, seedPath: string[]) => Object[]} need      questions, via options.generate
 * @property {(q, state: string, over?: Partial<CellCtx>) => string} cell       HTML for one cell
 * @property {(q) => WorkedStep[]} steps
 * @property {(q) => WrongAnswer|null} wrong
 * @property {(skillSpec) => SkillStrings} strings
 * @property {Function} layout                        page.js resolveSectionLayout
 * @property {Function} paginate                      page.js paginate
 * @property {Object} frame                           frame.js
 * @property {() => string} nextLabel                 running label for this packet
 */
```

### 6.2 Inputs and output

```js
/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {Array<{categoryId: string, skillId: string, weight?: number, opts?: GenOpts}>} skills
 * @property {number} count
 * @property {'auto'|1|2|3|4|5|6|7|8|9|10} columns     the teacher's choice; never overwritten by a clamp
 * @property {{mode: 'single'|'mixed', variant?: string, notation?: string, ratio?: Object}} mix
 * @property {number} [range]  @property {number} [decimals]
 * @property {string[]} [reviewSkills]                 teacher-listed earlier skills for review mixes
 * @property {Object} [scaffolds]                      per-section tick-boxes
 *
 * @typedef {Object} ComposeOptions
 * @property {{id: 'A4'|'Letter', wMm: number, hMm: number, margins: number[]}} paper
 * @property {'S'|'M'|'L'} size   @property {'ican'|'daily'|'auto'} look
 * @property {'auto'|'letter'|'tab'|'none'} labelStyle
 * @property {'day-bands'|'row-letters'|'numbered'} denseFactLabels
 * @property {{name: boolean, date: boolean, score: boolean, tab: boolean, title: boolean}} header
 * @property {boolean} photocopySafe
 * @property {'letters'|'words'|'none'} pvLabels
 * @property {'counters'|'pictures'} objects
 * @property {'tile'|'on-numeral'} cue   @property {boolean} thinkBox
 * @property {'schema'|'keyword'} wordProblemMode
 * @property {{onTests: boolean, keepStructural: boolean}} hints
 * @property {{minuteTag: boolean, timeLine: boolean, goal: boolean}} timing
 * @property {number} seed   @property {'A'|'B'|'C'|'D'} [form]
 * @property {boolean} answerKey
 * @property {Function} generate                       defaults to generateBatchFor; injectable for tests
 * @property {(html: string) => {wMm: number, hMm: number}} [measure]   needed when legacy cells are present
 *
 * @typedef {Object} Page
 * @property {string} role   @property {string} html   one <section class="sheet-page" ...>
 * @property {number} index  @property {number} of
 * @property {boolean} isKey
 * @property {{items: number, scoreOutOf: number, labels: [string, string], notes: string[]}} meta
 */
```

- **SCC-R1** `compose` is pure: no DOM writes, no `window`, no `state`. The same inputs give the same pages.
- **SCC-R2** `meta.notes` carries clamp notes and "basic version" notes for the dialog and preview. No note text
  ever appears inside `page.html`.
- **SCC-R3** `meta.scoreOutOf` equals the number of graded items on the page. When the Score header field is on,
  `frame.js` prints the score with that denominator.
- **SCC-R4** In the I Can look, quiet letters run on from the first Independent page of a lesson to its last
  (`a.` to `z.`, never doubled; design standard CL-12, CL-13). Each More Practice page, Review, Test, Pre-skill
  check, sub-skill page, Error analysis, True or False?, Reason It and Stretch page restarts at `a.` (each is
  handed out alone). Model and Guided cells take no label and do not advance the counter.
  In the Daily look the label is a black number tab numbered 1 to N across the sheet, restarting only inside Day
  bands. Dense fact rows follow `denseFactLabels`.
- **SCC-R5** The title string is `strings.iCan` and is identical on every page of a packet.

### 6.3 How each role asks a skill for cells

| Role id | Cell state | Level | Scope | Label | Also needs |
|---|---|---|---|---|---|
| `opener` | 1 `traced` + 1 `blank` Model cell, then 2-4 Guided cells `blank` | 3, then 2 | full | none | `strings.whatsNew`, `vocabulary`, `workedSteps` beside the Model, `oralFrame` |
| `model-scripted` | one cell per step, `traced` with `ctx.step` | 3 | none | none | `workedSteps` |
| `guided` | `blank`, hints drawn grey | 2 | full | none | |
| `independent` | `blank` | 1 | full | running | |
| `more-practice` (A-J) | `blank` | 1 (2 with the option "More Practice with hints") | full | letters, restart at `a.` on each page | form seed per letter |
| `sub-skill` | `blank` of `decision(q)`, `setupOnly(q)`, or scope `notation` | 1 | decision, setup, notation | letters, restart at `a.` (SCC-R4) | |
| `error-analysis` | `answered` or `wrong` (seeded, about half each) with `ctx.wrong = wrongAnswer(q)`, beside a judge frame with the tick boxes "Correct" and "Fix it" | 1 | judge | letters, restart at `a.` | key shows `misconception` and `explain` |
| `review` | `blank`; 25-35% of items come from `section.reviewSkills` | 1 | full | letters, restart at `a.` | |
| `test` (A, B) | `blank` | 0, or 1 when `hints.onTests` | full | letters, restart at `a.` | seeds `'form','A'` and `'form','B'`; same constraints, different numbers |
| `pre-skill-check` | `blank` | 0 | full or answer-only | letters, restart at `a.` | prerequisite skills from the ladder step or the teacher |
| `spiral-panel` | `blank`, `ctx.compact` in half-width panels | 1 | full | tab | fixed panels; plain bold sentence-case titles |
| `mixed-practice` | `blank` | 1 | full | tab | unit packer (`footprint.span`); grouped or shuffled |
| `daily-4` | `blank` with `ctx.compact`, four boxes a day, five days a page | 0 | answer-only or full | tab, restarting in each Day band | the teacher assigns a skill list to each of the four boxes (SCC-02) |
| `true-false` | `answered` or `wrong`, seeded half each | 1 | judge | letters, restart at `a.` | tick boxes plus a sentence frame |
| `reason-it` | spot the mistake: 1 `wrong`; odd one out: 3 `answered` + 1 `wrong`; which is correct: 1 `answered` + 1 `wrong` | 1 | judge | letters, restart at `a.` | the always / sometimes / never sub-type reads `provider.claims` and is skipped for skills that offer none |
| `stretch` | `blank` of `open(q)` with its results table | 1 | full | letters, restart at `a.` | |
| `word-problem` | the `word-problem` template: schema v1 (one per page), v2 (two per page), K picture form, or keyword panel (one per page, in place of the v1 schema diagram) | 3 to 0 | full | running | skills with `a`, `b`, `op` get an original neutral story from the template's story bank; other skills are framed in the story box with a work grid |
| `answer-key` | `answered` for every cell of the page it mirrors | same | none | same | produced for every page when `options.answerKey` |
| `fact-rows`, `fact-probe`, `fact-family-intro`, `fact-family-warmup`, `fact-family-probe`, `fact-review`, `practice-strips` | `blank` (`answered` on the fact-family intro); probes fade the cue through parts 1-4 | 2, 1, 0, 0 for cue parts 1 to 4 (section 2.5); intro 3 | answer-only | per `denseFactLabels` | `factOnly: true`; `fact-review` is the cumulative fact review |
| `k-lesson` | the opener cycle on one page: 2 Model, 2 Guided, 2 alone | 3, 2, 1 | full | only the last two cells are lettered | Level K one-page lesson |
| `computation-grid`, `equation-drill`, `long-division` | `blank`; an optional worked cell is `traced` under an outlined Model tab | 1 | full | tab in the Daily look, letters inside a lesson packet | stack, equation and division templates; digit-aware column clamp |
| `visual-grid`, `k-counting`, `chart-table` | `blank` | 1 | full | letters; none on trace rows and chart cells | visual, count, trace and chart templates |
| `blank-template` | `blank` with `ctx.template` | same as its source role | none | none | paper only |
| `anchor-chart`, `steps-card` | `answered` cell beside `workedSteps` and `strings` | 3 | none | none | companions: nothing to answer, no Score |

`todays-number` and the hands-on family are roles too: `cut-sort` (cut and glue), `cut-order`, `paste-tiles`
(closed-set paste tiles), `match-lines`, `find-color`, `pv-strips` (layered strips) and `flashcards`. `todays-number` calls `renderCell` with the day's number injected
(`opts.value`) and `ctx.compact`; the hands-on roles read property tags, pairs and ordered lists. See
`design/PAGE_TYPES.md`, whose every role maps to one id in this section. Which level a role asks for is fixed by
`PEDAGOGY_STANDARD.md` section 4.3; this table restates it.

- **SCC-R6** When a role needs something a skill cannot give (`wrongAnswer` returned `null`, no claims for a
  sub-type), the composer draws another item or drops that sub-type. It never prints an empty or broken cell.
- **SCC-R7** Every non-fact role accepts every skill. Fact roles accept only `footprint.factLike` skills, and
  fact skills are accepted by every other role too.

```
 scripted Model page: one skill, workedSteps(q) = 4 steps

 +---------+---------+---------+---------+
 | step 1  | step 2  | step 3  | step 4  |    each box is the SAME cell, state 'traced',
 | marks:  | marks:  | marks:  | marks:  |    ctx.step.index = 0..3
 | new grey| 1 black | 1-2 blk | 1-3 blk |    newest marks grey, older marks black
 |         | 2 grey  | 3 grey  | 4 grey  |
 +---------+---------+---------+---------+
   1. text   2. text   3. text   4. text      step text under each box, teacher script, hideable
```

---

## 7. Strangler hook and screen adoption

### 7.1 Print hook

`formatProblemForPrint` (`print-generate.js:3859`) runs to line 12079 and must never be edited wholesale. The
existing body is renamed; a thin function takes its name. Four call sites keep working unchanged:
`print-settings.js:1160`, `:1228`, `print-generate.js:12111`, `:12947`.

```js
// print-generate.js
import { hasCell } from './sheet/registry.js';
import { renderCellBox } from './sheet/cell.js';

export function formatProblemForPrintLegacy(problem, index, columns = 2, sizeCategory = '', showSkillLabels = true) {
    /* today's body, unchanged */
}

export function formatProblemForPrint(problem, index, columns = 2, sizeCategory = '',
                                      showSkillLabels = true, ctx = null) {
    if (!ctx) return formatProblemForPrintLegacy(problem, index, columns, sizeCategory, showSkillLabels);
    const id = problem && problem.cell && hasCell(problem.cell.template) ? problem.cell.template : 'legacy';
    const q = id === problem?.cell?.template ? problem : { ...problem, cell: { template: 'legacy', payload: null } };
    return renderCellBox(q, { ...ctx, mode: 'print', columns, sizeCategory });
}
```

```
 caller passes no ctx  ---------------------------->  legacy output, byte-identical to today
 caller passes ctx, template registered  ---------->  kit cell
 caller passes ctx, template unknown or legacy  --->  legacy output wrapped in a standard kit cell
```

- **SCC-S1** With `ctx === null` the output is byte-identical to today. The old dialog path therefore produces no
  baseline differences until a call site opts in.
- **SCC-S2** When a family is green, its `printFormat` branches are deleted from
  `formatProblemForPrintLegacy` in a deletion-only commit, and its `generateWorkedSolution` branches with them.
- **SCC-S3** The quiz print path (`printQuizTest`, `quiz-results.js:464`) moves onto `compose` in the same phase
  as the operations family.

### 7.2 Screen hook

In `renderQuestion` (`question-render.js:1333`), the visual is injected at `:1593-1595`. The hook sits there:

```js
const useCell = q.cell && q.cell.template !== 'legacy' && hasCell(q.cell.template);
if (useCell) {
    const ctx = screenCtxFor(state, q);                 // section 7.4
    visualAid.style.display = 'block';
    visualAid.classList.add('mq-mono');
    visualAid.innerHTML = renderCellBox(q, ctx);
    mountCell(visualAid, q, ctx);                       // focus order, arrow keys, feedback wiring
    setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 0);
} else if (requiresVisual || q.visual) {
    /* today's code, unchanged */
}
```

- **SCC-S4** The question card and every skill visual are black and white, the same cell as print. Colour stays
  in the chrome only: XP, boss and race art, buttons, the correct / incorrect ring and banner. The card's
  `.correct-bg` / `.incorrect-bg` tint applies to the chrome frame, never to the paper area.
- **SCC-S5** The same hook pattern is applied to the other hosts as they migrate: online worksheet cards
  (`worksheet.js:816`, `:1372`), `quiz-take.js:314`, `quiz-builder.js:580`, `skills-organizer.js:668`,
  `google-classroom.js:815`, `map-engine.js:872` and `:1125`. Until a host migrates it keeps printing `q.visual`,
  which the legacy visual shim (section 1.7) keeps correct, inside a `.mq-mono` wrapper.
- **SCC-S6** The quiz builder snapshots a whitelist of fields into IndexedDB (`quiz-builder.js:743-757`). `cell`,
  `layout`, `title` and `responseScope` are added to that snapshot. Quizzes saved earlier hold only HTML, so
  every CSS class that legacy visuals use stays defined: **CSS changes are additive only.**

### 7.3 The `.column-answer-input` contract

Three checkers read digit boxes by class name today. Until all three are migrated, a kit cell with digit slots
MUST satisfy the contract they assume.

| Checker | Where | What it assumes |
|---|---|---|
| live per-digit validation and auto-advance | `wireBoxValidation`, `question-render.js:818`; selection at `:822`; expected digits at `:882-900` | N boxes in DOM order; expected string is `String(q.ans)` right-aligned across them; leading boxes expect empty |
| submit harvest | `submitAnswer`, `answer-check.js:1280`; harvest at `:1611-1618` | when `#answerInput` is empty, the values of all `.column-answer-input` joined in DOM order are the answer |
| online worksheet | `checkWorksheetAnswerFromColumns`, `worksheet.js:1938-2007`; check-all branch at `:2486-2500`; listeners attached at `:1286-1290` and `:1824-1828` | the same join; it waits until at least `String(q.ans).length` boxes are filled |

Contract rules:

- **SCC-S7** Final-answer digit inputs carry `class="column-answer-input"` (set through `legacyClass`) **and**
  `data-slot`. They are the same elements, not mirrors.
- **SCC-S8** DOM order is left to right, most significant digit first, one digit per box (`maxlength="1"`).
  The number of boxes is at least the number of characters in `String(q.ans)`.
- **SCC-S9** Regroup boxes and scratch inputs MUST NOT carry `column-answer-input`. They use
  `column-carry-input` (as at `gen-operations.js:510`) and `graded: false`.
- **SCC-S10** A cell may use `legacyClass` only when `String(q.ans)` with commas removed is all digits.
  Remainders, decimals, negatives and fractions keep the single `#answerInput` path (or their existing
  dedicated checkers) until `gradeSlots` replaces the three checkers.
- **SCC-S11** Right-to-left entry is done by `mountCell` with focus management over a CSS grid. To stop the old
  left-to-right auto-advance (`question-render.js:1601-1619`) from fighting it, the kit pre-sets
  `data-_col-adv-attached="1"` on its inputs; that listener skips any input where
  `dataset._colAdvAttached === '1'` (`:1604`).
- **SCC-S12** The grid is one tab stop with a roving `tabindex`; arrow keys move inside it; Enter checks.
  Auto-advance never enters a regroup box; a regroup box is reached by tap or the Up arrow.
- **SCC-S13** Exit: when `gradeSlots(container, answerKey)` backs all three checkers and the typed-correct-answer
  test passes in practice, worksheet and quiz modes, `legacyClass` is removed from templates and SCC-S7 to S11
  retire. Note that `widgets/col-arith.js` (`renderColArith`, `:404`) already has per-digit validation
  (`:443-455`) and ungraded regroup inputs (`:559-563`) but advances left to right (`:491-493`); it is folded
  into the `stack` and `division` templates rather than kept as a second implementation.

### 7.4 Screen feedback

```js
// question-render.js (host side, not in the kit)
function screenCtxFor(state, q) {}   // -> CellCtx
```

| Practice role on screen | `state` | Level | `feedback` |
|---|---|---|---|
| Model | `traced` | 3 | `live` |
| Guided | `blank` | 2 | `live` |
| Independent, probe, review, test | `blank` | 1 or 0 | `check` |

- **SCC-S14 `live`:** each digit is marked as it is typed. The existing `wireBoxValidation` does this by adding
  `box-correct` / `box-wrong` (`question-render.js:1039-1056`); `sheet-kit.css` adds a tick or cross glyph to those
  classes inside `.ws-cell` so the mark never depends on colour alone.
- **SCC-S15 `check`:** nothing is marked until Check. The kit pre-sets `data-_box-val-attached="1"` on its
  inputs, which makes `wireBoxValidation` skip its input listener (`:1149-1153`). Because that function also hides
  `#answerInputArea` when digit boxes exist (`:860-862`), the host draws a chrome Check button under the cell
  that calls `window.submitAnswer()`. After the result, `markSlots(container, answerKey)` marks each graded slot.
- **SCC-S16** Wrong digits stay visible after marking. The kit never clears a slot. Regroup boxes are never
  marked in either mode.
- **SCC-S17** Touch targets are at least 44 px; at 375 px wide nothing scrolls sideways.

---

## 8. Layout routing

### 8.1 The problem

Card size, "this visual is the question", hidden question text and which checker to attach are all decided by
searching HTML strings. The same block exists twice in `worksheet.js` (first render `:830-1046`, "load more"
`:1385-1600`) and again in `question-render.js`.

| Sniff | Where |
|---|---|
| title strings "Column Addition", "Column Subtraction", "Column Multiplication", "Long Division" | `worksheet.js:830-838`, `:1385-1393`; `question-render.js:1575-1578` |
| "Function Table" | `worksheet.js:841`, `:1396` |
| `frac{` or the word "fraction" | `worksheet.js:853`, `:1408` |
| `<svg`, the words Perimeter, Area, Volume, Angle, Triangle, Quadrilateral, Symmetry, coordinate, and a set-square emoji | `worksheet.js:856-868` |
| a chart emoji and a dice emoji | `worksheet.js:961-966` |
| class-name probes `facts-column-visual`, `column-answer-input`, `area-model-input` | `worksheet.js:896`; `question-render.js:1471`, `:1579-1581` |
| the two `printFormat` lists | `worksheet.js:899-957` and `:969-1007`, repeated at `:1454` and `:1524`; a third, shorter list at `question-render.js:1583-1590` |

### 8.2 `q.layout` and `resolveLayout`

```js
/**
 * @typedef {Object} LayoutHint
 * @property {'card-simple'|'card-column'|'card-division'|'card-fraction'|'card-medium-visual'|'card-wide-visual'
 *           |'card-geometry'|'card-data-stats'|'card-table'|'card-tchart'|'card-number-family'|'card-ordering'
 *           |'card-dnd'|'card-msc'|'card-cs'|'card-df'|'card-divisibility'} [card]
 * @property {boolean} [requiresVisual]     the visual is the question
 * @property {boolean} [textHidden]         question text kept for screen readers only
 * @property {boolean} [fullWidthAnswer]    inputs live inside the visual; card goes single column
 * @property {'standard'|'columns'|'func-table'|'ordering'|'expanded'|'tchart'|'mc'|'msc'|'clock-set'|'dnd'
 *           |'drag-fill'|'divisibility'|'number-family'|'dual'|'coordinate'} [checker]
 */

// js/modules/sheet/layout.js
export function resolveLayout(q) {}   // -> Required<LayoutHint> & { flags: Object, source: 'q'|'template'|'sniff' }
export function legacySniff(q) {}     // the ONLY place string and emoji sniffing may live
```

Resolution order:

1. `q.layout` is an object: fill the gaps from step 2 and return (`source: 'q'`).
2. `q.cell` names a registered, non-legacy template: use `template.layout(payload)` (`source: 'template'`).
3. Otherwise `legacySniff(q)` (`source: 'sniff'`).

`flags` carries the booleans the worksheet stores on the question today (`q.isVerticalFormat`,
`q.isFunctionTable`, ... at `worksheet.js:1049-1054`) because later checkers read them (`worksheet.js:2486`).

- **SCC-L1** `legacySniff` reproduces today's decisions exactly, including the precedence of the `if` chain at
  `worksheet.js:1012-1046`. Before it is written, the two copies in `worksheet.js` are diffed; any difference is
  recorded as a finding and the first-render copy wins.
- **SCC-L2** Both copies in `worksheet.js`, and `question-render.js:1471`, `:1536-1591` and `:1644-1647`, are
  replaced by a call to `resolveLayout(q)`. The listener attachment at `worksheet.js:1286` and `:1824` switches
  from `isVerticalFormat` to `layout.checker === 'columns'`.
- **SCC-L3** `legacySniff` is frozen. New and migrated skills set `q.layout` (or rely on their template). Nobody
  adds a string to it; entries are only ever deleted as families migrate.
- **SCC-L4** Outside `sheet/layout.js` no module may test `q.visual` with `includes`, a regular expression or an
  emoji literal to decide layout or behaviour.

### 8.3 Print size

`SKILL_PRINT_SIZE` (`data.js:1662`) stays mandatory for every skill while the old auto-layout path exists; it is
also the source of the default footprint (section 4.6). It retires per family when that family's provider
declares a real footprint and the old dialog path is removed.

### 8.4 Name collision: `q.layout` as a string

One widget already uses `q.layout` as a **string** hint (`'fraction' | 'inline' | 'grid'`): written at
`gen-fractions.js:5420`, read at `widgets/drag-fill.js:134`, copied through at `map-engine.js:880` and `:1127`.

- **SCC-L5** `q.layout` is an object from now on. `finalizeQuestion` moves a string value to `q.dragFillLayout`;
  `drag-fill.js` reads `q.dragFillLayout ?? (typeof q.layout === 'string' ? q.layout : 'inline')`;
  `resolveLayout` treats a string as absent. The generator line is changed in the same commit.

---

## 9. `ladders.js`: step objects and how a step constrains a generator

### 9.1 Shape

Data only. It references existing skill ids and never renames them.

```js
/**
 * @typedef {Object} Ladder
 * @property {string} id   @property {string} strand   @property {string} strategy   one strategy per ladder
 * @property {string[]} [prerequisites]   ladder or step ids   @property {string[]} [collidesWith]   ladder ids that need a discrimination step
 * @property {LadderStep[]} steps
 * @property {Array<{after: string, role: 'review'|'test', forms?: string[]}>} checkpoints
 * @property {{skills: Array<{categoryId: string, skillId: string}>}} [preSkillCheck]
 *
 * @typedef {Object} LadderStep
 * @property {string} id
 * @property {string} kind              one of the kinds in PEDAGOGY_STANDARD.md P-AT-2
 * @property {string} iCan              @property {string} whatsNew      'This time you will ...'
 * @property {string} delta             the ONE thing that changed since the previous step (P-AT-3)
 * @property {string} [instructionKey]  @property {string} [oralFrame]   override the provider's strings for this step
 * @property {string} categoryId        @property {string} skillId
 * @property {StepConstraints} constraints
 * @property {string} [variant]  @property {string} [notation]  @property {string} [representation]
 * @property {string} responseMode      a response mode id from design/PROBLEM_TYPES.md
 * @property {string[]} teacherSteps    3-6 imperatives, at most 10 words each
 * @property {Array<{term: string, meaning: string, diagram?: string}>} vocabulary   at most 3
 * @property {{3: string[], 2: string[], 1: string[], 0: string[]}} scaffolds   scaffold ids per level
 * @property {string[]} pages           role ids in packet order
 * @property {{[role: string]: number}} items   item count per page for each role
 */
```

### 9.2 From a step to questions

```js
function specForStep(step, role, seed) {
    return {
        category: step.categoryId, skill: step.skillId,
        range: step.constraints.range ?? 100, decimals: step.constraints.decimals ?? 0,
        opts: { variant: step.variant, notation: step.notation, representation: step.representation,
                tables: step.constraints.tables, constraints: step.constraints },
        seed: deriveSeed(seed, 'step', step.id, role),
    };
}
```

A step's `iCan`, `whatsNew`, `teacherSteps` and `vocabulary` override the provider's strings for that packet.
`step.scaffolds[level]` is intersected with `q.scaffolds` (a step cannot ask for a scaffold the cell cannot draw).

### 9.3 Constraints

A closed vocabulary. Unknown keys fail validation.

| Key | Meaning |
|---|---|
| `range`, `decimals` | passed straight to `generateQuestionFor` |
| `tables: number[]` | fact tables; becomes `state.selectedNumbers` inside the swap |
| `fixedOperand: number` | single-fact sets such as "add 3" |
| `operands: {a?: {min, max}, b?: {min, max}}` | operand bounds |
| `digits: {a?: [min, max], b?: [min, max]}` | digit counts |
| `regroup: 'none' | 'ones' | 'tens' | 'multiple' | 'across_zero' | 'any' | 'required'` | regrouping pattern |
| `unknown: string` | position of the unknown, one of the values of axis VA-03 in `design/PROBLEM_TYPES.md` (`result`, `second`, `first`, `both_sides`; per schema `result / change / start`, `whole / part`, `difference / bigger / smaller`, `total / groups / size`, `bigger / smaller / multiplier`) |
| `answerMax: number` | cap on the answer |
| `zeros: 'avoid' | 'allow' | 'seed'` | zeros in operands |
| `edgeCases: string[]` | named cases that must appear at least once per page |
| `edge: 'off' | 'seeded' | 'only'` | edge-case seeding mode (axis VA-07); default `seeded` |
| `profile: Object` | the remaining number-profile flags of axis VA-06: `lengths`, `within`, `facts`, `denominators`, `result`, `remainder`, `decimals` |
| `nonExample: number` | share of items whose correct response is "no", 0 to 0.5 (axis VA-08) |
| `contrast: {skill: string, ratio: number}` | a second skill or type to interleave on discrimination pages (axis VA-09) |
| `language: string` | word-problem language form (axis VA-10): `consistent`, `inconsistent`, `distractor_verb`, `extra_number`, `symbolic`, `words` |
| `context: string` | `vary`, `hold` or a named neutral context id (axis VA-11) |

How a constraint is enforced, in order of preference:

1. **By skill choice.** The ladder points at the existing skill id that already means it (for example a
   no-regrouping skill at the right range). No generator change.
2. **By the generator.** The provider lists the key in `supports`; the generator reads
   `state.skillOptions?.constraints` (set inside the swap, restored afterwards) and obeys it.
3. **By rejection.** `accepts(q, constraints)` in `generate-for.js` checks `q.a`, `q.b`, `q.op` and the payload.
   The wrapper retries with `deriveSeed(seed, 'reject', n)` up to 40 times.

- **SCC-D1** If a constraint is neither supported nor checkable, or rejection runs out, generation for that step
  fails loudly in the dialog. A constraint is never silently relaxed.
- **SCC-D2** Skills with no ladder keep today's behaviour and still reach every page role.

### 9.4 Validators (unit tests, also run by the static lint)

One `delta` per step, non-empty. One `strategy` per ladder. Hint scaffolds fade monotonically from level 3 to
0 across and within steps. Item caps per role respected. Every `categoryId:skillId` exists (after aliases).
Every constraint key is in the table above. `vocabulary.length <= 3`. `teacherSteps.length` is 3 to 6 and each
has at most 10 words. `iCan` starts with "I Can ". No string contains "Grade" or a standards code.

---

## 10. Migration checklist and compliance lints

### 10.1 Per family, in this order

| # | Step | Done when |
|---|---|---|
| 0 | Research the family on the reference sites named in `CLAUDE.md`; list problem types, visuals, answer formats, progression, edge cases | notes attached to the PR |
| 1 | Baseline images exist for every skill in the family, print and screen | archived |
| 2 | Write or extend the cell template(s); register them | SCC-LINT-01 |
| 3 | Generator emits `q.cell`, `q.layout`, `q.title`, `q.scaffolds`; stops baking titles, colours, emoji and inputs into `q.visual`; keeps `text`, `ans`, `printFormat` | SCC-LINT-07, -20 to -27 |
| 4 | Replace bare `Math.random()` type and notation choices with `pickVariant`; declare `variants`, `notations`, `representations` with permanent codes | SCC-LINT-05, -15 |
| 5 | Register the provider: `strings`, `workedSteps`, `wrongAnswer` with named misconceptions, static `footprint`, then `decision`, `setupOnly`, `open` | SCC-LINT-13, -14; `provider.defaults` is empty |
| 6 | Screen: slots through `blank()`, `legacyClass` where SCC-S10 allows, entry order, feedback mode | SCC-LINT-28 |
| 7 | Twin skills merged through aliases, never by deleting or reordering | SCC-LINT-02, share-code tests |
| 8 | Delete the family's branches from `formatProblemForPrintLegacy`, `generateWorkedSolution` and `legacySniff` in deletion-only commits | baseline differences reviewed |
| 9 | Compliance run green at S, M, L, both looks, print and screen, every role | matrix row green |
| 10 | The two gates: independent code review of the full diff, then live browser QA | report triaged |

### 10.2 Family notes

| Family | Templates | Specific hazards |
|---|---|---|
| Operations and facts | `fact`, `stack`, `equation`, `division`, `fact-family` | `add`, `subtract`, `multiply`, `divide` and several others never set `printFormat`; facts choose notation with bare `Math.random` (`gen-operations.js:5222`); the ten-column shortcut (`print-generate.js:4028`) goes; `col-arith.js` folds into `stack` and `division` |
| Word problems | `word-problem` with schema diagrams | `_plain` twins (`generate-question.js:19-41`) become `pictures: false`; the operator-picker widget (`gen-operations.js:18-30`) becomes first-person decision tick boxes; stories original and neutral |
| K-2 number sense | `count`, `ten-frame`, `number-bond`, `hundred-chart` | emoji counters replaced by the two object sets (plain counters, eight line-art pictures) |
| Time and money | `clock`, `coins` | coins are outlined circles at true relative size showing only 1, 5, 10, 25; a currency sign appears only inside word-problem text |
| Place value and rounding | `pv-chart`, `base10`, `number-line` | H T O letters by default, words once in the Model cell and the vocabulary box; dialog option words / letters / none |
| Fractions and decimals | `fraction-model`, `fraction-line`, `equation` | `q.ans` may be an object; shaded parts use the grey token or hatch |
| Geometry, measurement | `figure`, `grid`, `ruler` | raw hex colours in `svg-geometry.js`; pass `opts.mono` (keep `forPrint` as an alias) |
| Data and statistics | `graph`, `table` | chart and dice emoji sniffs (`worksheet.js:961-966`) go; no colour series, use patterns |
| Algebra, order of operations, number theory | `equation`, `table`, `t-chart` | drag interactions need a paper twin (write or draw a line) |

### 10.3 Lints

**Static** (`tests/scripts/ws-lint-static.mjs`, Node, no browser):

| Id | Proves | Check |
|---|---|---|
| SCC-LINT-01 | SCC-Q3, T1 | every `template:` string literal in `gen-*.js` is registered |
| SCC-LINT-02 | SCC-X1 to X6 | every skill id has a generator route, a share code, and a valid alias target |
| SCC-LINT-03 | SCC-L4 | no `visual.includes(`, no emoji literal and no title-string test outside `sheet/layout.js` |
| SCC-LINT-04 | SCC-01, -02 | kit files contain no `window.` assignment, no `Math.random`, no forbidden import |
| SCC-LINT-05 | SCC-P12 | option `code`s are unique per list and unchanged against `tests/baselines/skill-options.snapshot.json` |
| SCC-LINT-06 | SCC-D1, 9.4 | ladder validators |
| SCC-LINT-07 | SCC-T6, P9 | no hex colour, emoji, "Grade" or standards-code pattern in `sheet/cells/*.js`, provider strings or migrated generator branches |
| SCC-LINT-08 | SCC-04 | `node --input-type=module --check` on every module |

**Content** (`tests/scripts/ws-content-audit.cjs`, seeded samples per skill at ranges 10, 20, 100, 1000):

| Id | Proves | Check |
|---|---|---|
| SCC-LINT-10 | SCC-G5, G6 | same spec and seed twice gives identical `text`, `ans` and payload JSON |
| SCC-LINT-11 | SCC-T16 | `answerKey(payload).value` equals `q.ans`; answers recomputed independently where `a`, `b`, `op` exist |
| SCC-LINT-12 | SCC-Q3 | payload survives a JSON round trip; contains no `<` character (legacy exempt) |
| SCC-LINT-13 | SCC-P6 | `wrongAnswer` differs from the answer, same type, within one order of magnitude, misconception id declared |
| SCC-LINT-14 | SCC-P4, P5 | 3-6 steps, at most 10 words each, no "carry" or "borrow", final marks complete every graded slot |
| SCC-LINT-15 | SCC-G8, P11 | every declared option is produced when forced (100 seeds); range and decimals honoured; duplicates at most 10% |
| SCC-LINT-16 | SCC-G1, G7 | after a call, `state` is deep-equal to before, `Math.random` is the original function, variant buckets are the originals, also when the generator throws |

**DOM** (`tests/scripts/ws-compliance.cjs`, skill x role x look x size x print and screen):

| Id | Proves | Check |
|---|---|---|
| SCC-LINT-20 | SCC-T8, T13 | print has no form controls or `on*` attributes; every slot has `data-ws-slot` and a shape that matches its kind |
| SCC-LINT-21 | SCC-T10, T11 | the four states share geometry; `blank` leaks no answer; `traced` uses trace ink only; `wrong` shows the wrong value |
| SCC-LINT-22 | 10.1 | migrated skills render zero `[data-ws-legacy]` and zero `[data-ws-default]` |
| SCC-LINT-23 | SCC-R4 | label style matches the look; Model and Guided cells have no label; letters run on across a lesson's Independent pages and restart where SCC-R4 says |
| SCC-LINT-24 | SCC-T6, T7 | computed colours inside `.ws-cell` are black, white or the grey token; hatch when photocopy-safe; dashed only on `[data-ws-cut]` |
| SCC-LINT-25 | SCC-T3 | computed font family resolves to Andika; digit size equals `ctx.metrics.digitPt` |
| SCC-LINT-26 | SCC-T4, T20 | no overflow, no cell split across pages, writing height at least the size minimum |
| SCC-LINT-27 | SCC-Q9, R2 | no "Grade", standards code or clamp-note text inside `.sheet-page` cells |
| SCC-LINT-28 | SCC-S7 to S16 | digit slots meet the class contract; typing the correct answer passes in practice, worksheet and quiz modes; regroup boxes never marked; wrong digits remain |
| SCC-LINT-29 | SCC-T10, R3 | key page item count and geometry equal the pupil page; score denominator equals graded items |

A skill is **compliant** when every lint passes for it and `coverage()` reports a non-legacy template with an
empty `defaults` list. A migrated family that turns red fails the run.

---

## 11. Share-code safety

### 11.1 What can break

| System | Format | Stores a skill as | Code |
|---|---|---|---|
| Skill codes | `AB3-CD5-EF` | a 2-character code | built in `buildSkillCodes` (`data.js:1288` onward); decoded at `skill-codes.js:44-48` |
| Enhanced codes | `AB3-CD5|T300-N20-Gp-R100-D0` | the same, plus a settings segment | `generateEnhancedSkillCode` `skill-codes.js:630`, `parseEnhancedSkillCode` `:665` |
| 7-character settings codes | category letter + 2-digit index + settings | **index** in the category list | `getSkillCode` `skill-codes.js:219`, `getSkillFromCode` `:225` |
| `MX-` codes | `MX-A00.A01.B02-40MSP` | **index** | `applyMixedCode` `skill-codes.js:347`, index lookup at `:369-372` |
| Compact mixed codes | per-category **bitfield**, bit = index | **index** | `skillsToBitfield` / `bitfieldToSkills`, `mixed-mode-settings.js:776-795` |

Two of these are positional. Deleting or reordering one entry in `SKILLS[category]` silently changes the meaning
of every link, favourite and saved code that comes after it.

### 11.2 Frozen tables and tombstones

- **SCC-X1** `js/modules/skill-codes-frozen.js` holds `FROZEN_SKILL_CODES` (`:9`) and `FROZEN_CATEGORY_ORDER`
  (`:285`). Both are append-only: an existing entry is never edited, moved or removed.
- **SCC-X2** Codes are assigned frozen-first, then new skills take the next free code (`data.js`, pass 0 and pass
  1 of `buildSkillCodes`). New skills need no frozen entry.
- **SCC-X3** Every positional lookup goes through `getPositionalSkills(categoryId)` (`data.js:1277`): frozen ids
  first in frozen order, newer skills appended. A retired id stays in place as a **tombstone**
  `{ v: id, l: id, retired: true }`, so later indices and bits never shift. Nothing may index into
  `SKILLS[category]` directly.
- **SCC-X4** A skill is never spliced out of the frozen tables. A retired id MAY leave the live `SKILLS` list so
  that menus stop offering it; `getPositionalSkills` then fills its position with the tombstone. Either way the
  retired id gets an alias.
- **SCC-X5** `tests/scripts/ws-code-snapshot.mjs` fails when any existing frozen entry changes, and a
  decode-every-code test decodes every code in the snapshot through all five systems.

### 11.3 `skill-aliases.js`

The module exists (layer 0, no imports) with an empty table. Its shape is part of this contract:

```js
// js/modules/skill-aliases.js
// key:   'categoryId:skillId' (preferred) or bare 'skillId'
// value: { skillId, categoryId?, opts? }
export const SKILL_ALIASES = {
    // 'addition:add_word_problems_plain': { skillId: 'add_word_problems',
    //                                       opts: { representation: 'no-pictures' } },
};

/** @returns {{categoryId: string, skillId: string, opts: Object|null, aliased: boolean}} */
export function resolveSkill(categoryId, skillId) {}
```

Aliases are applied **at generation time**, not at decode time. `generateQuestion()` (`generate-question.js:53-70`)
redirects a retired id for the length of one call, merges the alias `opts` into `state.skillOptions`, stamps
`q.requestedSkillId`, and puts `state` back in `finally`. The selected id is what favourites, share codes and
saved sections keep storing.

- **SCC-X6** The alias **data** resolves in one hop: no chains, no cycles, the target exists in `SKILLS`, and
  every `opts` entry is declared by the target's provider. SCC-LINT-02 checks all four. (The resolver itself
  tolerates up to five hops defensively; the lint is what keeps the table flat.)
- **SCC-X7** There are exactly two places that turn a stored id into a generated question: `generateQuestion()`
  and `generateQuestionFor()`. Both call `resolveSkill`. Decode points (`applySkillCode` `skill-codes.js:48`,
  `getSkillFromCode` `:225`, `applyMixedCode` `:369`, `bitfieldToSkills` `mixed-mode-settings.js:787`, favourites,
  quick skills, print sections `print-settings.js:61`, saved quizzes) keep the stored id and call `resolveSkill`
  only to find a **label** for a tombstone, whose own label is just its id.
- **SCC-X7a** Provider lookup, `coverage()` and layout use the **resolved** id. `q.skillId` is the resolved id;
  `q.requestedSkillId` is the id the caller selected.
- **SCC-X8** Stored data is not rewritten on load. A favourite that names a retired id keeps naming it and keeps
  resolving. Progress keys are out of scope: nothing in this contract reads them (SCC-02).

### 11.4 Options travel in the `|` settings segment

The settings segment is a list of tokens joined by `-`; a token is one key letter plus a value
(`skill-codes.js:676-708`). Letters in use: `T` timer, `N` count, `G` mode, `R` range, `D` decimals, `Q` quick-start
lock, `A` adaptive. The parser's `switch` has no default branch, so **unknown tokens are ignored by older
clients**; that is what makes this segment the safe place for new data.

New tokens:

| Token | Meaning | Value |
|---|---|---|
| `X<n><k><code>` | an option for the n-th skill of the skills part (1-based, base 32 from the share alphabet) | `k` is `V` variant, `O` notation, `P` representation, `S` scaffold level; `code` is the option's permanent `code` (for `S`, a digit 0-3) |
| `L<i or d>` | look | `I` I Can, `D` Daily |
| `Z<s, m or l>` | size | |
| `H1` | photocopy-safe | omitted when off |
| `K<base36>` | base seed | lets a colleague print the identical sheet |

- **SCC-X9** Token values use only characters of the share alphabet
  (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, `data.js` `buildSkillCodes`) plus digits; never `-` or `|`. Parsing is
  case-insensitive, because skill codes are upper-cased on entry (`skill-codes.js:30`); tokens are emitted in
  upper case.
- **SCC-X10** Options are never appended to a skill part. The skill-part parser reads characters 0-1 as the code
  and the rest as a weight (`skill-codes.js:44-46`); extra characters there would corrupt the weight on older
  clients.
- **SCC-X11** The three positional formats (7-character, `MX-`, compact) are decode-only for options: they never
  carry option tokens. A link that needs options is generated in the enhanced format.
- **SCC-X12** An option code that the target skill no longer declares is dropped on decode and reported in the
  dialog, exactly like an undeclared option in `generateQuestionFor` (SCC-G8). Decoding never throws.
- **SCC-X13** Because option codes are stored in links, `variants`, `notations` and `representations` lists are
  append-only and a `code` is never reused (SCC-P12, SCC-LINT-05).

### 11.5 Twin merge, worked through

Merging a "plain" word-problem twin into its base skill:

1. The base skill's provider declares `representations: [{ id: 'pictures', code: 'P', ... }, { id: 'no-pictures', code: 'N', ... }]` and its generator chooses through `pickVariant('<skillId>#representation', ['pictures', 'no-pictures'])`.
2. Add the alias `category:twin_id -> { base skill, opts: { representation: 'no-pictures' } }`.
3. Remove the twin from the `PLAIN_WORD_SKILLS` map (`generate-question.js:19-41`) and, once menus should stop offering it, from `SKILLS`. Do not touch the frozen tables.
4. Run the snapshot test, the decode-every-code test and a round trip: the twin's old 2-character code, its old
   index in a 7-character code, its bit in a compact code and a favourite naming it all open the base skill with
   pictures off.

---

## Appendix A. Glossary

| Term | Meaning |
|---|---|
| cell | one ruled box holding one problem |
| template | the code that draws a kind of cell from a payload |
| provider | what one skill supplies beyond its generator: strings, steps, wrong answers, footprint, options |
| role | a skill-agnostic page composer (opener, independent, test, Daily 4, ...) |
| state | what the response slots show: blank, traced, answered, wrong |
| scaffold level | 3 Model, 2 Guided, 1 Independent (cue in the first cell only), 0 Test (no hints) |
| response scope | which part of the work the pupil is asked to produce |
| hint scaffold | support that fades (trace, dot tile, circle cue, picture, think box) |
| structural scaffold | support that persists (digit grid, regroup boxes, place-value labels, frames) |
| tombstone | a retired skill id kept in its position so indices never shift |
| alias | a redirect from a retired skill id to a live skill plus options |

## Appendix B. Build order inside the foundation phase

1. `sheet/rng.js`, `variant-cycler.js` additions, `generate-for.js`; SCC-LINT-10 and -16 green; replace call sites 2, 3, 4.
2. Baseline images, then call site 1 with full pass-through; review every difference.
3. `sheet/registry.js`, `cell.js`, `providers.js` with default adapters, `cells/legacy.js`, `finalize.js`; `coverage()` lists every skill as legacy.
4. `sheet/layout.js` with `legacySniff`; replace the three sniff blocks; screenshots unchanged.
5. `roles/*.js` and `compose`; the print hook with `ctx`; dialog v2 calls `compose`.
6. `cells/fact.js` replaces the ten-column shortcut; first real family follows section 10.1.
