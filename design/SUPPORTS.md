# Supports

The supports program (plan: touch dots, pictures, visual supports, anchor problems). Other lanes
append their own sections (S1 touch dots, S2 the supports model, S4 visual panes); this file starts
with the two anchor sections.

## S5 · Step-by-step anchor problems

**Owner rulings (2026-09-25).** A step-by-step anchor problem shows a problem worked out step by
step. Anchors are unscored and unlabelled and carry a Model tab. Research: the example comes before
the problem; examples are correct only; easy numbers first; short steps with a Say line.

**What an anchor is.** A worked example printed on a practice page. It is a *sibling* of the
pupil's problems: the same skill and structure, with different and easier numbers. It is never one
of the pupil's problems.

- **Generation.** Examples are generated under seeds of their own (`print-sheet.js anchorSet`,
  base `seed ^ 0x2545F491`), never a pupil item's seed, with `itemIndex 0`. They are sorted easy
  first (`anchors.js easeScore`: the size of the operands and the answer).
- **No clash.** `pickDistinct` drops every example whose signature (text, answer, payload) matches
  a problem on the sheet. If a skill runs out of distinct examples, the list cycles. With none, the
  skill gets no anchor.
- **Who gets one.** Only skills whose provider really implements `workedSteps`
  (`p.real.includes('workedSteps')`, the same test as `compose.js providerWorkedSteps`). Other skills
  print no anchor, and the Print screen's note says: "No worked example for <skill>: it has no
  step-by-step steps yet."

**The step renderer (P-LC-9).** Provider marks name *logical* slots (`ones`, `tens`,
`regroup:tens`, `answer`, `q0`, `part1`, …). Each template maps them onto its own geometry through
a `stepState(payload, steps, k, ctx)` member (the registry keeps extra members). It draws the cell
as it looks after step `k`:

- the marks of step `k` (the newest) are in trace grey;
- every earlier mark is in solid black;
- nothing from a later step is drawn.

`js/modules/sheet/steps.js` holds the shared helpers:

| Helper | What it does |
|---|---|
| `stepMarks` | the marks and their ink |
| `placeDigits` | digits right-aligned on a place's track. A track that already holds the same digit keeps its ink, so "The sum is 224." turns nothing grey that was already written. |
| `regroupMarks` | the regroup marks |
| `singleSlotState` | blank, then traced, then answered |
| `slotInks` | slot values with their ink |

| Template | Step state |
|---|---|
| `stack` | Place marks go in the answer boxes (or the open answer tracks). `regroup:<place>` goes in the carry box over that place. The geometry is identical to the cell's other states (SCC-T10). |
| `fact` | A vertical fact writes the answer tracks digit by digit. An across fact has one slot. A fact drawn as a stack hands over to the stack. |
| `equation` | One slot: blank, then grey, then black. |
| `division` | `q<j>` writes quotient digit j over its dividend digit, **and** that step's two work rows (the product, then the difference and bring-down), in the same ink. `answer` fills every quotient digit. `remainder` fills the R box. |
| `area-model` | `part<i>` fills part box i, and `total` fills the total. |

Number line, arrays, counters, function tables and place value have no `stepState` yet. An anchor
for those skills falls back to **the whole trace plus the numbered text steps**: one state, with the
answer traced grey, and every step listed beside it.

**The anchor cell (`js/modules/sheet/anchors.js`).**

- **Band** (full width): a strip of 2–4 step states. States come from `anchorGroups`:
  - a group ends on a step that makes a mark;
  - the steps before the first mark get a state of their own (the problem, not yet worked);
  - beyond 4 states, the shortest adjacent pair is merged.

  The states are drawn one preset smaller than the page (S on a page at L), so the example reads as
  the teacher's worked example beside the pupil's full-size problems. States are divided by a grey
  hairline.
- **Steps.** Each state's numbered steps sit under it, one sentence a line (`stepLines`). A line
  that is still over 10 words breaks after its colon, so every printed line is at most 10 words
  (P-5).
- **Say line.** The strip closes with `Say:` and the provider's frame, filled with the example's
  numbers (`strings.sayFill`).
- **Model tab, no label.** The anchor is a plan item with `model: true, nolabel: true`, so the grid
  draws the outlined `Model` tab (PT-LBL-6). It has no letter and no tab.
- **Unscored.** Every `data-ws-slot` inside it is renamed `data-ws-aslot`. The key's `fillSlots`,
  the lints and the Score cannot see it.
- **Same on the key.** It draws the same in every state (`drawsAnswer: true`, an empty key). The
  answer key shows it byte for byte as the pupil page does, with no gap reported (AK-1).
- **Side twin** (half width): one state (the worked example, its last marks grey) at M, with its
  steps beside it and the Say line under it.
- **Compact band** (Mixed practice): the side twin's one-state layout at full width, which keeps a
  skill's shelf band short.
- **Wide models.** A band whose states would not fit their columns (the width is estimated from the
  cell's footprint at the smaller preset) merges states down to 2. If even 2 do not fit, it is drawn
  as the compact band.

## S6 · Anchor layouts on practice sheets

**Request.** `buildSheet({... anchors: 'off' | 'side' | 'sections'})`. `'on'` means the role's
default, sections. `normaliseRequest` accepts it on `independent`, `more-practice` and
`mixed-practice`, and forces `'off'` on every other role. The default is `'off'`, so existing pages
and links are unchanged.

**Print screen.** `teacher-print.js` has an "Anchor problems: Off / Side by side / Sections"
segmented control in Page setup (`pr.anchors` → `requestFor` → `normaliseRequest`). A one-line
caption explains each choice.

**SIDE BY SIDE.** The section becomes rows of [worked twin | pupil problem]: the example first,
never the problem first.

- **Twins.** Each pupil item carries its own twin (`it.twin`), a distinct example.
  `practice.js withAnchors` interleaves the twins, and the section is set to 2 columns.
- **Layout.** The host measures the twins with the problems, so the layout's floor holds both.
- **One column.** When a problem is too wide for half the page, each twin sits above its problem.
  A page then holds whole pairs: an even number of rows, paginated as pairs. An example is never
  left at the foot of a page with its problem overleaf.
- **Mixed practice.** A shelf of k cells becomes k/2 pairs, if the twins fit at k. A skill whose
  pairs do not fit takes the compact band instead.

**SECTIONS.** Each section is printed as **blocks**: an anchor band, then its 3–4 problems.

- **Block size** (`anchors.js blockPlan`):
  - 1 row at 3–4 columns, 2 rows at 2 columns, 3 rows at 1 column;
  - the section's columns are capped at 4, so a block never holds 5–10 fact columns;
  - when only ONE block fits a page (tall problems), the block takes the rows that fit, up to 6
    problems, rather than leave half the page empty.
- **Pages.** `blockPages` puts whole blocks on pages, and a block is never split. PG-23 rebalances
  a lone last block. Each chunk carries its `anchorMm`, which `paginate.js placeSections` adds to
  the section's height (`heightMm = instrMm + anchorMm + rows × cellH`).
- **One example per block.** The examples are distinct and taken easy-first. A More Practice
  letter restarts at the first example.
- **Mixed practice.** One anchor per skill (the compact band), on the skill's first shelf band,
  above its problems. With anchors, a set may need more than one page. Whole shelves spill, and the
  extra shelves fill the pages the anchors already take, never adding a page
  (`mixed-practice.js packing`).

**Heights.**

- The host measures every anchor in the real stylesheet (`measureItems`). The band a page
  reserves is the tallest of the three easiest examples, plus 6 mm. The app page renders at device
  scale 2 and the printed document at 1, and a step line that wraps one way in one can wrap the
  other way in the other.
- An example taller than the reserved band is never picked into it.

**Score and labels.** Only pupil problems are labelled and counted: `pupilCount` for each page's
label starts, and the Score denominators. Anchors add neither.

**Gates.**

- `tests/scripts/ws-anchors-unit.mjs` (pure node, then 26 real builds in Chrome) checks:
  - each template's step states;
  - the strip's 2–4 states, and step lines of 10 words or fewer;
  - that anchors are unscored and carry the Model tab;
  - that the key draws the anchors the same;
  - that no anchor is orphaned (side: whole pairs per page, including one column);
  - block pagination and rebalancing;
  - Score denominators;
  - that no real anchor of add, subtract, mult_facts, add_column_multi, long_div_2digit or
    area_model_mult equals a problem on its page;
  - that a skill without real worked steps prints no anchor and gets the note.
- `ws-print-lint --source kit --anchors side|sections` adds **L-ANCHOR**: every anchor cell has
  the Model tab, no letter or tab label and no answer slot, and it draws the same on the key.
- `ws-grade-render --anchors side|sections` renders the specimens. See
  `design/specimens/anchors-*.png`.

**Known limits.**

- A GROUPED Independent section of several skills (one section, several skills, page-driven) gives
  each skill at least one block. With tall problems, one block does not share a page with another,
  so each skill takes its own page. Mixed practice (one compact anchor per skill) is the multi-skill
  sheet with anchors.
- Side by side halves the problems a page holds; that is the layout's cost.

**Not built yet.** The on-screen "Show me an example" panel (a later lane), and step states for
the number line, arrays, counters, function tables and place value.
