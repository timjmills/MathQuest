# MathQuest Page Types

This document is the catalogue of every page role MathQuest can compose, on paper and on screen.
A page role is a skill-agnostic composer: it owns the page anatomy, the capacity arithmetic and the teacher
options, and it asks the skill only for a cell. Any skill can appear on any page role (rule PT-CMP-1).
An implementer must be able to build every role from this file without seeing the reference workbooks.
All geometry is for A4 and is written as formulas on the body size, so US Letter is a parameter, not a redesign.

## Related documents

| Document | Owns |
|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` (repo root) | The visual contract: tokens, two looks, header, cells, labels, answer-slot shapes, line-style meanings, grey and hatch, type table, drawing rules for each representation. It wins over this file on any token value. |
| `PEDAGOGY_STANDARD.md` (repo root) | The teaching rules: lesson cycle, fade ladder, review cadence, instruction and verb library, band-label strings, vocabulary rule, word-problem system, options policy for hints and timing. |
| `design/PAGE_TYPES.md` | This file. |
| `design/PROBLEM_TYPES.md` | The problem catalogue by domain, response modes (print and screen), representations library. |
| `design/EXTENSION_PLAYBOOK.md` | How domains the reference workbooks barely cover get the same look and teaching cycle. |
| `design/SKILL_CELL_CONTRACT.md` | The data contract every skill fulfils (`renderCell`, `workedSteps`, `wrongAnswer`, `strings`, `footprint`, optional members) and the default adapters. |

"The reference workbooks" means the owner's private sample corpus. Nothing in this file quotes it.
Example strings in drawings (titles, instructions, stories) are illustrations written for this file;
the controlled wording lives in `PEDAGOGY_STANDARD.md`.

## Contents

0. Conventions of this document
1. Shared page grammar (frame, tokens, looks, labels, layout engine, columns, scaffolds, skill contract, footprints, screen)
2. Lesson packet roles
3. Practice roles
4. Fact layouts
5. Review roles
6. Thinking roles
7. Companions
8. Hands-on family (later)
9. Print-dialog option model
10. Skill x page role compatibility

---

## 0. Conventions of this document

- **PT-DOC-1.** Every rule has an id `PT-<AREA>-<n>`. Lints and manual checks cite the id.
- **PT-DOC-2.** All lengths are millimetres unless marked pt or px. Three figures separated by slashes mean S / M / L.
- **PT-DOC-3.** "Body" is the 186 x 236 mm area between header and footer on an A4 first page. Every capacity table shows its arithmetic against that body.
- **PT-DOC-4.** Every role section has the same parts: Purpose, Look, Page anatomy, Cell anatomy (where a cell exists), Geometry and capacity, Teacher options, Skill supplies, Screen.
- **PT-DOC-5.** Pupil-facing text says "Level N" (K, 1 to 6). Grade and CCSS codes appear only in the footer (PT-FRM-7).
- **PT-DOC-6.** US maths conventions: "regroup", customary and metric units, the US long-division bracket, comma thousands separator. Spelling elsewhere follows the owner's usage (pupil, colour).
- **PT-DOC-7.** Drawings are plain ASCII and not to scale. In them `x`, `/` and `-` stand for the real multiplication, division and minus signs (PT-EQD-6), `[Level|strand|id]` abbreviates the three-line strand tab, `#n#` is a black number tab, `( )` with dotted edges is a rounded box, and figures at the right edge are heights in mm.

---

## 1. Shared page grammar

### 1.1 Page frame

```
<------------------------- 210 ------------------------->
+-------------------------------------------------------+  ^
|  top margin 12                                        |  |
|  +-------------------------------------------------+  |  |
|  | HEADER  <= 26   (continuation pages: 12)        |  |  |
|  +=================================================+  |  |
|  |                                                 |  |  |
|  | BODY  186 x 236                                 |  | 297
|  | (186 x 250 on continuation pages)               |  |  |
|  |                                                 |  |  |
|  +-------------------------------------------------+  |  |
|  | gap 3                                           |  |  |
|  | FOOTER 6  (teacher line)                        |  |  |
|  +-------------------------------------------------+  |  |
|  bottom margin 14                                     |  v
+-------------------------------------------------------+
  heights: 12 + 26 + 236 + 3 + 6 + 14 = 297
  widths:  12 + 186 + 12 = 210        live area 186 x 271
```

Header, first page (every field is a teacher check box, PT-FRM-3):

```
| Name ______________   Date ________   Score ____/20   +-----------+ |
|                                                       |  Level 2  | |
|             I Can add two-digit numbers               | Addition  | |
|                                          (1 minute)   | Lesson 5  | |
|=======================================================+-----------+=|  2.25 pt rule
```

- **PT-FRM-1.** Paper is a parameter `paper = {w, h, margins}`. A4 is the default (210 x 297, margins 12 / 12 / 12 / 14, live area 186 x 271). US Letter is selectable. The live width stays 186 on both papers; only the body height changes. Every formula below reads `bodyH`, never the literal 236. Tables in this file are A4.
- **PT-FRM-2.** First-page header is at most 26 tall. Continuation pages of the same sheet carry a 12 mm header (Name line, strand tab, rule), so their body is 236 + 14 = 250.
- **PT-FRM-3.** The header has five fields: Name, Date, Score, strand tab, centred bold title. Each is a check box in the print dialog and the ticks are remembered between sessions. Defaults: all on.
- **PT-FRM-4.** Score always prints with its denominator: a ruled write-in line followed by `/N`. N is the number of scored cells on the whole sheet (all its pages). A sheet with no scored cell (Opener without Independent rows, Scripted Model, Guided page, Fact-family Intro and Warm-up, Anchor chart, Steps card) omits Score even when the box is checked.
- **PT-FRM-5.** The strand tab is a 30 x 14 rectangle flush top-right with 3 centred lines: `Level N`, strand, sheet id (2 lines on a sheet with no single strand: Daily Spiral, Mixed Skill Practice, Daily 4; design standard HD-5). Sheet ids by role are listed in PT-FRM-9. The tab never shows a grade.
- **PT-FRM-6.** The title is one centred bold line in the form "I Can <verb> <object> (<constraint>)": "I Can" capitalised, the rest sentence case, the constraint optional, no closing period. It is identical on every page of one lesson packet. Exceptions (the fixed titles of design standard HD-13): Review ("Review: <topic>"), Test ("Test A: <topic>"), Pre-skill check ("Pre-skill check: <topic>"), fact layouts (the fact stub, for example "Multiply by 3"), Daily Spiral ("Daily review"), Mixed Skill Practice ("Mixed practice"), "Today's Number", "Daily 4", "True or False?", "Reason It" and "Stretch". The Level sits on the tab, never in the title. A title that wraps takes its second line from spare body height, never from cell height.
- **PT-FRM-7.** The footer is one 6 mm line outside the body, 7 pt: skill code(s), grade and CCSS code(s), form and seed, `page n/N`. It never grows; it holds about 9 CCSS codes. No pupil-facing information sits in it.
- **PT-FRM-7a (owner ruling 2026-09-26).** Every printed paper carries the copyright line "© <year> Cultivating the Digital. All rights reserved." On kit sheets, keys and lessons it hangs just below the footer band in the bottom margin (6.5 pt, black, centred), so the band never grows and the body keeps its height; the legacy print path and the Quiz Builder's printed test carry it in their running page footer. The year is the print year.
- **PT-FRM-8.** Optional header extras (all off by default, PT-DLG-13): a "(1 minute)" tag after the title, a `Time ____` line beside Score, a `Goal ____` line beside Score. They never add header height.
- **PT-FRM-9.** Sheet ids printed on the tab's last line:

| Role | Tab id | Role | Tab id |
|---|---|---|---|
| Opener, Guided, Independent | `Lesson n` | Fact rows | `Facts` or `Day 1-5` |
| Scripted Model | `Model` | Fact Fluency Probe | `Probe x3 A` (operation, fact, form) |
| More Practice | `Practice A` ... `Practice J` | Fact-family pages | `Family A` ... `D`, `Intro`, `Warm-up` |
| Sub-skill pages | `Lesson n` | Practice strips | `Strip A` |
| Error analysis | `Check it` | Cumulative fact review | `Review 0-7` (range) |
| Review | `Review n` | Daily Spiral, Daily 4 | `Week n - Day n` / `Week n` |
| Test | `Test A`, `Test B` | Mixed Skill Practice | `Mixed n` |
| Pre-skill check | `Check A`, `Check B` | Today's Number | range and version, `to 120 - B` |
| Blank template | `Template` | Answer key | `Answer Key` replaces the id |

- **PT-FRM-10.** When header fields are switched off, the freed height is added to the body and rows are recomputed with the same formulas. Content never grows in size because of it; only row counts or answer space change.

### 1.2 Tokens used in this file's arithmetic

Owned by `WORKSHEET_DESIGN_STANDARD.md`; restated so the arithmetic below can be checked.

| Token | S | M | L (default) |
|---|---|---|---|
| Digit size (pt) / em (mm) | 16 / 5.64 | 22 / 7.76 | 28 / 9.88 |
| Ladder steps between presets (pt / em) | 18 / 6.35, 20 / 7.06, 24 / 8.47 | | |
| Digit line height, 1.15 em | 6.49 | 8.93 | 11.36 |
| Track, I Can look, 0.72 em | 4.06 | 5.59 | 7.11 |
| Track, Daily look or any regroup scaffold, 0.95 em | 5.36 | 7.37 | 9.38 |
| Facts track (both looks), 0.72 em of the ladder size | see 4.1 | | |
| Writing height Hw | 6 | 8 | 10 |
| Tableau final-answer row | 8 | 10 | 12 |
| Partial-product row | 6 | 8 | 10 |
| Cell text (pt), text a pupil must read to act | 11 | 13 | 15 |
| Label text (pt), text that names a zone | 9 | 10 | 12 |
| Instruction block I (line plus gap) | 8 | 8 | 9 |
| Band strip (title plus instruction on one baseline) | 6 | 6 | 8 |
| Strip that holds a write-in (Day Score) | 7 | 8 | 10 |
| Label box side (4 under 20 pt, 5 at 20-25 pt, 6 at 26 pt and over) | 4 | 5 | 6 |
| Side pad of a stacked multi-digit cell | 4 | 6 | 6 |
| Answer zone under a visual, AZ = Hw + 4 | 10 | 12 | 14 |
| Blank width B(n) for n answer digits, n = 1 / 2 / 3 / 4 | 14 / 14 / 16 / 21 | 14 / 14 / 20 / 27 | 14 / 17 / 25 / 33 |
| Grid height under one instruction line, G = 236 - I | 228 | 228 | 227 |

- **PT-TOK-1.** B(n) = max(14, ceil(n x 0.75 x Hw + 2 + s)), where s = 1 mm for each comma or decimal point in the longest answer (the n = 4 figures above include the comma). Blank height is Hw inside the stroke. An answer after "=" is a baseline line; a blank inside an expression is a box; one section uses one style, and if any blank is mid-expression every blank in the section is a box.
- **PT-TOK-2.** Shading uses one flat 40% grey (`#949494`) for shaded parts, trace or model digits and faded scaffolds; this is the default. The Photocopy-safe switch, a print-dialog option that is off by default (PT-DLG-19), replaces grey fills with 45-degree hatch (0.75 pt, 1.6 mm pitch, areas of 6 mm or more) and grey trace digits with dotted-outline digits. No other grey, gradient, shadow, colour or emoji appears on any role.
- **PT-TOK-3.** Line style carries meaning on every role: dotted = trace or model; **dashed = cut, with one exception: the short-dash missing-digit box, which marks the unknown digit inside a stacked problem (design standard LS-8, VA-7); nothing else is ever dashed**; square corners = structure (cells, answer boxes, frames); rounded corners = read or think containers (story box, steps box, support strips, flashcards, think box). An unknown quantity in a diagram is a solid-outline box with a label-size "?" in its corner, never a dashed box.

### 1.3 The two looks — one worksheet look, Daily (owner ruling 2026-09-26)

> **Owner ruling 2026-09-26:** "the daily and I Can pages look the same almost — get rid of the 'I Can'
> page, use the daily, but if it's a single skill put an I Can on it. And it's just an option for the daily
> page to have one or more skills." **Every worksheet page type prints in the Daily look.** The "I Can" look
> is **retired for worksheets**: it stays in the kit (`LOOKS` / `LOOK_IDS` in `sheet/tokens.js`) only so old
> saved sets and share codes still decode — a stored `ican` or `auto` prints Daily — and for the **lesson
> packet**, whose pages are a fixed one-size design that pins its own look (`LESSON_LIBRARY_PLAN.md` §8a).
> The title rule (PT-TTL-1) replaces the look choice: a one-skill page carries its "I Can ..." line.

| | "I Can" look (retired for worksheets; lesson packet only) | "Daily" look (every worksheet) |
|---|---|---|
| Cell rules | 0.75 pt, cells share borders, 1.5 pt outer frame | 1.5 pt grid throughout (fact grids: 0.75 pt interiors, 1.5 pt frame and band edges) |
| Stacked digit tracks | 0.72 em (0.95 em when any regroup scaffold is on) | 0.95 em, plus a 2 mm gap between operand rows |
| Cell label | quiet lowercase letter `a.` `b.` `c.` | black number tab, white Andika 700 numeral |
| Model and Guided cells | unlabelled | outlined white tab reading `Model` (PT-LBL-6) |
| Sum rule | 1.5 pt | 1.5 pt |
| Band and section titles | the fixed band labels of design standard BD-1, bold, ending in a colon (`Guided Practice:`), under a 2.25 pt rule | plain bold sentence-case section titles under a 2.25 pt rule; never a black title tab |

- **PT-LOOK-1.** *(Owner ruling 2026-09-26.)* One worksheet look: **Daily**, on every page type. There is no Look control in the print dialog and no look preset or quick pick; `buildSheet` prints Daily whatever look a request names (`WORKSHEET_LOOK` in `sheet/tokens.js`), so an old saved set or share code that stored `ican` or `auto` still builds, in Daily. The dialog keeps the separate label-style option (PT-DLG-3). Where a role section below still says **Look. I Can**, read Daily: that line describes the retired default, and the I Can label and band rules survive only for the lesson packet.

  *Superseded default table (kept for the record):* "I Can" by default on Opener, Scripted Model, Guided, Independent, More Practice, Sub-skill pages, Error analysis, Review, Test, Pre-skill check, K one-page lesson, Visual grid, K counting, Chart and table pages, Word problems, Blank template, Fact-family Intro and Warm-up, True or False?, Reason It, Stretch, Anchor chart, Steps card, Hands-on family; "Daily" on Computation grid, Equation drill, Long division, Fact rows, Fact Fluency Probe, Fact-family Probe, Practice strips, Cumulative fact review, Daily Spiral, Mixed Skill Practice, Today's Number, Daily 4.

- **PT-LOOK-2.** The lesson packet (role `lesson`: anchor chart, lesson sheet, its practice and mixed pages) keeps its own pinned look (`LESSON_LOOK`, the I Can rules) — a fixed one-size design that passed the critic 48/48 (`LESSON_LIBRARY_PLAN.md` §8a). The one-look rule does not reach inside it; its render is byte-identical before and after the ruling (`ws-lesson-samples --stats`).
- **PT-TTL-1.** *(Owner ruling 2026-09-26.)* The title follows the skills, not a look. A sheet whose items all come from **one** skill carries that skill's "I Can ..." line (`frame.js` `pageTitle`) in the Daily header. A sheet of **two or more** skills — counted by skill id, so two skills that share a wording are still two — carries no I Can line: the neutral `Mixed practice`, or the role's fixed title without a topic (`Test A`, `Review`). A role with a fixed title keeps it for one skill (`Test A: adding within 20`, `Review: rounding to the nearest 10`). One skill or several is simply what the teacher puts in the set; the Daily page is built for both.
- **PT-LOOK-3.** Black is reserved for identifiers (strand tab, Day tab, number tabs), digits, rules and marks of 7 mm or less. Section titles are never reversed out.

### 1.4 Labels, numbering and Score

```
"I Can" label                 "Daily" label                 keep-out (both looks)
+----+--------------          +####+--------------          +----+-+------------
| a. |                        |#12#|                        |    |1|   nothing may enter the
+----+                        +####+                        +----+ |   label box + 1 mm square;
|                             |                             +------+   left-aligned content beside
                                                                       or below starts at box + 2
```

- **PT-LBL-1.** The label box is a square of side 4 / 5 / 6 mm chosen by the effective digit size (PT-TOK table), flush in the cell's top-left corner, in both looks. Width is 1.0 x side for a 1-character label, 1.4 x side for 2 characters, 1.5 x side for 3. Using one box for both looks means no geometry in this file changes when the label style changes.
- **PT-LBL-2.** Quiet letter: Andika 400 at 8 / 9 / 10 pt, lowercase, followed by a full stop, its cap-height box inset 1.5 mm from the top and left inner edges of the cell, no box drawn. Letters run `a.` to `z.` and are never doubled: a run that would need a 27th letter restarts at `a.` at the next page boundary, with a dialog note.
- **PT-LBL-3.** Black tab: solid black label box, white Andika 700 numeral at 8 / 10 / 11 pt for 4 / 5 / 6 mm tabs. Tab ink stays under 5% of cell area at every column count.
- **PT-LBL-4.** Label style options: `letters`, `tabs`, `none`. With `none` the label box stays reserved, so switching style never reflows a page.
- **PT-LBL-5.** Numbering order is row-major. Exception: Mixed Skill Practice in shuffled arrangement numbers by strip, then block, then inside the block (PT-MIX-7).
- **PT-LBL-6.** A cell whose complete answer is printed is unlabelled and unscored. In the "I Can" look Model and Guided cells are simply unlabelled; the band strip names them. In the "Daily" look a worked cell carries an outlined tab (white fill, 0.75 pt border, black Andika 700 at strand-tab size) reading `Model`, tab height = label side, width 13 / 15 / 17. Solid black always means "a problem to answer".
- **PT-LBL-7.** Running labels. Inside one lesson, letters run on from the first Independent page to the last Independent page. Each More Practice page, Sub-skill page, Review, Test, Pre-skill check, Error analysis, True or False?, Reason It and Stretch page restarts at `a.` because it is handed out alone (design standard CL-12). In the "Daily" look numbers run 1 to N across sections and pages of one sheet and the last number equals the Score denominator; they restart only inside Day bands, which carry their own Score.
- **PT-LBL-8.** Exempt from cell labels: trace rows, chart cells, table cells, Day-band fact rows (default), flashcards, cut tiles.

### 1.5 Layout engine

One pure function serves the dialog note, the preview thumbnail and the printer:
`resolveSectionLayout(section, problems, paper) -> {cols, clamped, reason, digitPt, trackMm, cellW, cellH, rows, perPage, pages}`.

- **PT-ENG-1. Never shrink.** Size fixes the writing space (Hw, B(n), label box, text sizes). Content is never scaled below its footprint minimum to fit. When it does not fit, the engine drops a row, drops a column, paginates, or lowers the item count, in that order of preference for the role.
- **PT-ENG-2. Grid pages** (one instruction line over a fixed-height grid): `rows = min(targetRows, floor((G - 1) / hMin))`, `cellH = min(G / rows, hMin x k)`. The grid is a fixed-height box with `repeat(rows, 1fr)` rows. The 1 mm is the safety for borders and print rounding. `k` is the stretch cap: 1.3 for fact layouts and K trace rows; 2.0 for equation rows (1.3 in box-above mode); unlimited (fill) for tableau, visual, word-problem, mixed and spiral cells.
- **PT-ENG-3. Banded pages** (Opener, Guided page, Review, K one-page lesson, word problems v1): bands are content-sized and their fixed heights must total no more than `bodyH - 4` = 232. Rows inside a band gain at most 8 mm each from spare height; the remainder stays blank at the foot of the body.
- **PT-ENG-4. Widths** must fit `cellW - 0.6` (one shared rule plus rounding).
- **PT-ENG-5. Spare height** always goes to the answer or work zone, never to the problem. The problem sits in the upper half of its cell; at every size at least 40% of every cell is free.
- **PT-ENG-6. Computed once.** Rows, cell height and stretch are computed once per section and reused on every page of the sheet, so cells never change size between pages.
- **PT-ENG-7. Trailing cells.** The generator rounds the item count to full rows. If a teacher forces a count that leaves a partial row, the remainder is one unruled blank area inside the closed outer frame (no borders, no labels).
- **PT-ENG-8. Pagination.** A cell, a band, a Day band, a shelf, a strip or a chart with its questions never splits across pages. Continuation pages repeat the instruction line.
- **PT-ENG-9. One T per section.** Every stacked cell in a section uses the track count of its widest problem, including the answer track under the operator, so layout never reveals which items regroup or gain a digit. Long division prints a quotient slot over every dividend track and always prints the remainder box on a remainders sheet.
- **PT-ENG-10. Seeds.** Every sheet stores `{seed, form}`. The same seed reproduces the same page. Form B, C, D of a sheet hold the same items as Form A, reordered or commuted, from seed = (skill, step, form).

### 1.6 Columns and size

- **PT-COL-1. One rule.** Size fixes the writing space and the top digit size. Columns may move digits only along the section type's ladder. Past the ladder floor the column count clamps.
- **PT-COL-2. Ladders.**

| Section type | Ladder |
|---|---|
| Vertical facts, K trace rows | Keyed by column count N, independent of S / M / L: N <= 5: 28 pt, 6: 24, 7: 20, 8: 18, 9: 16, 10: 16. Columns win. |
| Horizontal equations | L: 28, 24, 22 pt. M: 22, 20, 18, 16 pt. S: 16 pt. |
| Everything else | The preset size only. Size wins; columns only divide the width. |

- **PT-COL-3. Explicit N.** The dialog offers Auto, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. An explicit count is honoured if the widest problem fits at some ladder step; otherwise it clamps to the largest count that fits at the ladder floor. The stored choice is never overwritten by the clamp.
- **PT-COL-4. Auto** is the largest N, up to the role's Auto cap, that keeps the top ladder step with width fill of 92% or less (tableaux: at least 6 mm slack). Auto never returns 1 when the maximum is 2 or more.
- **PT-COL-5. Clamp notes** appear in the dialog and the preview only, as persistent text beside the Columns control. Nothing about a clamp is printed on the pupil sheet. Three templates:
  - Clamp: "3-digit problems, size M: max 4 columns. Showing 4. Size S fits 6."
  - Step-down: "10 columns: digits 16 pt (size L is 28 pt). Writing space stays 10 mm."
  - Forced: "Word problems print in 1 column." / "Charts use the full page." / "Mixed sheets use even columns. Using 4." / "Max 4 columns for horizontal facts. Use fact rows for 5-10."
- **PT-COL-6. Auto and caps by role.**

| Role | Auto | Cap |
|---|---|---|
| Fact rows | 10 / 6 / 5 | 10; 8 when answers exceed 99; 8 for bracket division facts; 6 for wide division |
| Fact Fluency Probe | 5 | 5 to 10 (1 to 4 become 5); division sheets 2 to 3 |
| Computation grid | 3 (Daily), 2 (I Can) | 6 |
| Equation drill | 3 (2 for L classes F and T; 1 for L class H; 2 for M class H) | by fit, up to 5; 2-digit comparisons reach 6 at S |
| Long division | table 3.3 | 6, with a 30 mm minimum cell |
| Lesson packet grids | 4 / 3 / 3 for stacks on the Opener and Guided page; 2 on Independent pages; visuals up to 4 | stacks 6, visuals 4 |
| Visual grid | the visual's table maximum; clocks 4x4, 3x3, 2x3 | 5 |
| Mixed Skill Practice | I Can 10 / 8 / 6; Daily 8 / 6 / 4 | N in {1, 2, 3, 4, 6, 8, 10}; odd N only when every skill is 1x1 |
| K counting | 2 (side layout) | count cells 1 to 3; trace rows 5 to 10; charts fixed |
| Word problems, Daily Spiral, Today's Number, Daily 4 | fixed | fixed |

### 1.7 Scaffold levels

Hint supports fade; structural supports persist (`PEDAGOGY_STANDARD.md`). A page role asks the cell for a level; individual supports can be checked on or off per section (PT-DLG-10).

| `scaffoldLevel` | Meaning | Cell `state` used | Requested by default on |
|---|---|---|---|
| 3 | Model: every answer and mark printed in trace grey, every hint in black, all structural supports | `traced` / `answered` | Model cells, Scripted Model, Fact-family Intro, first cell of a Guided page |
| 2 | Guided: every hint the step declares for level 2, drawn grey (first answer digit grey, captions, dot tile), plus all structural supports; no traced answer | `blank` with hints | Guided cells, Guided page, More Practice "with hints", Probe part 1 |
| 1 | Independent: the step's level-1 cue in the first cell of the page or section only, plus all structural supports (digit grid, regroup boxes, place-value letters, frames, tally box, equation frame) | `blank` | Independent, More Practice, Sub-skill, Error analysis, Review, Daily Spiral, Mixed, Thinking roles, Probe part 2 |
| 0 | Test: no hints. Structural supports stay while "keep structural supports" is checked (default on); unchecked, the cell is bare: the problem and the answer slot | `blank` | Test, Pre-skill check, Daily 4, Probe parts 3 and 4 |

The level names, meanings and the level each role asks for are fixed by `PEDAGOGY_STANDARD.md` section 4.3. The cell states are the contract's four: `blank`, `traced`, `answered`, `wrong` (shows `wrongAnswer`). The blank reusable template is state `blank` with `ctx.template` (all structure, no numbers); the empty set-up frame of a sub-skill page is `responseScope: 'setup'`. Neither is a separate state.

### 1.8 What a skill supplies

Defined in `design/SKILL_CELL_CONTRACT.md`. Each role section names the members it reads.

| Member | What a role uses it for | Default adapter (so every skill reaches every role) |
|---|---|---|
| `renderCell(q, ctx)` with the contract's `CellCtx`: `mode`, `look`, `size`, `scaffoldLevel`, `state`, `label`, `mono`, `photocopySafe`, and the optional `step`, `wrong`, `compact`, `template`, `options` | The cell, on paper and on the screen card | The legacy print handler output wrapped in a standard cell |
| `workedSteps(q)` -> `[{text, marks}]` | Steps band, Model cell, Scripted Model, Steps card, screen hint ladder | The existing worked-solution generator |
| `wrongAnswer(q)` -> misconception-based error | Error analysis, True or False?, Reason It | Existing distractor logic or `q.options` |
| `strings` = `{iCan, instruction, instructionKey, whatsNew, vocabulary (<= 3), oralFrame, rule}` | Titles, bands, instruction lines, read-aloud | Built from the skill label |
| `footprint` = minimum cell `wMm` x `hMm` per look and size, `maxCols`, `factLike`, optional `span` for mixed sheets | Column clamp, capacity, mixed packing, fact layouts | From the legacy print-size class (1.9) |
| optional `decision(q)`, `setupOnly(q)`, `open(q)`, `claims[]`, `variants[]`, `notations[]`, `representations[]` | Sub-skill pages, Reason It (always / sometimes / never), Stretch, problem-mix control, representation stage | A generic fallback where one exists (section 10); otherwise the dialog marks the part "basic" |

### 1.9 Footprint reference

Minimum cell sizes the capacity tables below rely on. "T" is the track count including the operator track; "t" is the look's track width.

| Class | Typical skills | Min width | Min height S / M / L |
|---|---|---|---|
| F vertical fact | basic facts to 12 x 12 | 2.16 em of the ladder size + 2 x pad (pad 3, or 2 at 7+ columns) | table 4.1 |
| E horizontal equation | facts, missing number, comparison | eqW(pt) + B(n) + overhead (3.2) | pitch 12 / 14 / 18 (label beside), 14 / 17 / 20 (label above), 20 / 24 / 30 (think box above) |
| T stacked tableau | multi-digit add, subtract, multiply, decimals | T x t + separators x 0.3 em + 2 x side pad, plus borders | I Can plain 33 / 41 / 49; Daily plain 35 / 43 / 51; with options table 3.1 |
| D long division | bracket division | max(T x t + 8, 30) | 21.5 + 6n / 26.9 + 8n / 32.4 + 10n, n = work lines |
| V medium visual | clock, fraction model, ten frame, base-10, shape, array | max(visual, answer) + 6 | visual + label + inset + 2 + AZ + 3 (3.4) |
| W wide row | number line, coin row, tape diagram, table row | 186 | 34 to 48 |
| P word-problem band | any story problem | 186 | 50 / 57 / 76 |
| C chart | hundred chart, graph, tally chart | 186 | fixed by chart (3.6) |

### 1.10 Screen conventions shared by every role

- **PT-SCR-1.** The question card and every skill visual render the same black-and-white cell as print (same DOM, same CSS custom properties, mm converted to px by one scale the container sets). Game chrome keeps colour: XP, boss and race scenes, buttons, progress, the correct / incorrect ring and banner. Feedback never tints the paper.
- **PT-SCR-2.** Blanks become inputs with the same slot shape. A production item never becomes multiple choice on screen unless the paper item is a choice.
- **PT-SCR-3.** Tracks are max(0.95 em, 44 px) in both looks. At 375 px a focus cell with 7 or more tracks runs edge to edge (353 px inner width); 9 or more tracks are not offered on phones. A sheet whose tracks would be under 44 px is shown as an overview in which whole cells are the targets; a tap opens the focus cell. The only exception is a 10-column chart on a phone (34.5 x 44 px cells).
- **PT-SCR-4.** Entry order follows the algorithm: add, subtract and multiply fill right to left from the ones; division quotients fill left to right. Backspace in an empty box steps back. Regroup boxes are reachable by tap or arrow key, never by auto-advance.
- **PT-SCR-5. Feedback timing.** Live check mark or cross per digit in Model and Guided items. On Check in Independent, More Practice, Probe, Review, Test, Spiral, Mixed and Daily 4. One 16 px badge sits outside each box; wrong digits stay visible and the rightmost wrong box takes focus. Regroup boxes and scratch boxes are never marked. Feedback is never colour alone.
- **PT-SCR-6.** Hint sits left and Check sits right, below the cell or in a sticky bar, at every width. The hint ladder is the one in `PEDAGOGY_STANDARD.md` section 11.2: the first press shows and speaks the next step's sentence, the second press also draws that step's working marks in grey; a hint never fills an answer slot, and "Show me" is offered after two wrong Checks. Test mode hides Hint unless "hints on tests" is checked.
- **PT-SCR-7.** Breakpoints used in the role sections: 375 (one cell per view), 768 (2 cells, or the role's note), 1440 (print column count inside a sheet capped at 960 to 1120 px).
- **PT-SCR-8.** Online modes map to roles: Learn = Opener then Scripted Model then Guided; Practice = Independent and More Practice; Mixed review = Daily Spiral, Mixed Skill Practice, Daily 4; Test = Test A/B with hints off; Find-the-mistake = Error analysis and Reason It; the existing timed modes = Fact Fluency Probe and Fact rows.

---

## 2. Lesson packet roles

A lesson packet is one ladder step (or one teacher-chosen skill) printed as a set of parts. The teacher picks a preset or checks parts.

- **PT-PKT-1.** Parts, in print order: Opener, Scripted Model, Guided page, Independent page x N, More Practice A to J, Sub-skill pages, Error analysis, Review, Test A / B, Pre-skill check. Preset "Standard packet" = Opener, Independent x 2, More Practice A, Review, Test A.
- **PT-PKT-2.** Every part of one packet carries the identical title (PT-FRM-6) and the same Level and strand on the tab; only the tab id changes.
- **PT-PKT-3.** Every part uses the same cell template at the same size, so the format never changes inside a step. Only `scaffoldLevel` and `state` change between parts.
- **PT-PKT-4.** Sides option: `one-sided` (default), `Learn / Practice` (Opener bands on side A, Independent rows plus an optional exit word-problem band on side B), `Pair` (two complete one-sided lessons back to back, each with its own header, for a prerequisite day and a pre-teach day).
- **PT-PKT-5.** Worked-example figures in this section use the running example "2-digit addition with regroup boxes and place-value letters": guided cell height Hg = 36 / 45 / 54, independent cell height Hi = 32 / 41 / 49, minimum cell width 26.1 / 34.1 / 42.2. For any other skill substitute the cell template's `footprint(payload, ctx).hMm` at level 2 for Hg and at level 1 for Hi.

### 2.1 Opener

**Purpose.** "I do" and "We do" on one sheet. It names the one new thing, pre-teaches at most three words, shows the steps beside a model, and gives 2 to 4 guided items. The printed steps are the adult's script.
**Look.** I Can. Model and Guided cells unlabelled.

```
| Name ________  Date ______                          [Level 2|Addition|Lesson 5]
|                  I Can add two-digit numbers 
+=======================================================================+
| What's New:  one sentence that names the single change                |  8
+=======================================================================+
| Vocabulary:   [pic] tens (T)     [pic] ones (O)     [pic] regroup     |
|   Say: "___ tens and ___ ones."                                       | 36
+=======================================================================+
| Warm-up:  oral prompts only, nothing is written                       |  8
+=======================================================================+
| Model:                              | Steps:                          |  6
| +---------------+---------------+   |  (1) Add the ones.              |
| | traced, grey  | blank: worked |   |  (2) Write the ones. Regroup.   | 45
| | answers       | live together |   |  (3) Add the tens.              |
| +---------------+---------------+   |  (4) Read the sum.              |
+-----------------------------------------------------------------------+
| Say:  "___ plus ___ equals ___."          (option, on by default)     | 11
+=======================================================================+
| Guided Practice:  Add.                                                |  6
| +---------------------+----------------------+---------------------+  |
| | (unlabelled)        |                      |                     |  | 45
| +---------------------+----------------------+---------------------+  |
+=======================================================================+
| Independent Practice:  Add.                  (rows added only if they fit)
| | a.                  | b.                   | c.                  |  | 6 + 41
+-----------------------------------------------------------------------+
| skill code   grade + CCSS   form / seed                     page 1/1  |
```
`=====` is a 2.25 pt band rule; the rule above `Say:` is the 1.5 pt divider (PT-OPN-9). Heights at the right are size M.

**Geometry and capacity** (banded page, budget 232, PT-ENG-3):

| Band | S | M | L |
|---|---|---|---|
| What's New (strip + 2) | 8 | 8 | 10 |
| Vocabulary (strip + cards + oral frame) | 6 + 18 + 6 = 30 | 6 + 22 + 8 = 36 | 8 + 26 + 10 = 44 |
| Rule (optional; strip + 2 text lines) | 6 + 10 = 16 | 6 + 12 = 18 | 8 + 14 = 22 |
| Warm-up (strip + 2) | 8 | 8 | 10 |
| Model (strip + max(Hg, steps)) | 6 + 36 = 42 | 6 + 45 = 51 | 8 + 54 = 62 |
| Say (Hw + 3; option, on by default) | 9 | 11 | 13 |
| Guided (strip + one row of Hg) | 6 + 36 = 42 | 6 + 45 = 51 | 8 + 54 = 62 |
| **Fixed total, Rule off, Say on** | 8+30+8+42+9+42 = **139** | 8+36+8+51+11+51 = **165** | 10+44+10+62+13+62 = **201** |
| Spare against 232 (with Say off: 102 / 78 / 44) | 93 | 67 | 31 |
| Independent rows that fit (strip + n x Hi); the same with Say off | 6 + 2 x 32 = 70 -> 2 rows | 6 + 41 = 47 -> 1 row | 8 + 49 = 57 > 31 -> none |
| Items | 4 guided + 8 independent | 3 guided + 3 independent | 3 guided |
| Left over (rows then gain <= 8 each) | 23 | 20 | 31 |

- **PT-OPN-1.** Band order is fixed: What's New, Vocabulary or Rule, Warm-up, Model with Steps, Say, Guided, optional Independent rows. Each band opens with a 2.25 pt rule drawn inside its strip; the strip holds the bold band label and, where the band has items, one instruction on the same baseline.
- **PT-OPN-2.** Model band split: the left 93 mm is the model zone, the right 93 mm is the Steps zone. Two model cells print side by side when `footprint.wMm <= 45.9`; the first is `traced` (level 3), the second is blank with every support (level 2) and is worked live. When two do not fit, only the traced model prints (93 wide) and the first Guided cell serves as the live model.
- **PT-OPN-3.** Steps: 3 to 6 numbered imperatives, 10 words or fewer each, cell-text size, line pitch 5.0 / 6.0 / 6.9. Step markers are outlined circles (never solid, so they cannot be read as problem numbers). Steps height = printed lines x pitch + 4. If that exceeds Hg the Model band grows and Independent rows are fitted again.
- **PT-OPN-4.** A lesson whose visual is wider than 93 mm (coin rows, number lines, tape diagrams) replaces the split Model band with one full-width worked row; the outlined step markers are drawn on the visual and the step text runs beneath it.
- **PT-OPN-5.** Vocabulary holds at most 3 cards, 62 wide, each a line-art mini-diagram (14 / 18 / 22 tall) and the bold word; a word is never hyphenated or shrunk (drop to 2 cards instead). Place-value letters are keyed here, for example "tens (T)". The oral frame uses 14 mm blanks.
- **PT-OPN-6.** Guided holds 2 to 4 cells in one row (columns Auto 4 / 3 / 3, clamped digit-aware; 1 column gives 2 rows). Guided cells show hint and structural supports with the first answer digit in trace grey.
- **PT-OPN-7.** Independent rows are added only while whole rows fit the budget, at most 2 rows. They are lettered and scored; if none fit, Score is omitted (PT-FRM-4).
- **PT-OPN-8.** At most 2 scaffold types appear in one Guided cell (for example a pictorial row and a side strip cannot both be on).
- **PT-OPN-9. The `Say:` band** is an official band of the Opener (owner ruling 2026-09-19): the step's oral sentence frame in a full-width strip directly under the Model and Steps zones. It is a print-dialog option, on by default (PT-DLG-29). Height Hw + 3 = 9 / 11 / 13; top edge the 1.5 pt divider, not a 2.25 pt band rule; bold `Say:` at cell-text size 3 from the left edge, then the frame at cell-text size inside curly double quotes on a baseline 2.5 above the band's bottom edge; blanks are ruled lines of width B(n), 14 at least. The blanks are said, not written: the band has no label tab, no instruction and no score. Switched off, its 9 / 11 / 13 returns to the spare height and Independent rows are fitted again (design standard BD-8; pedagogy P-17, P-LC-15).

**Teacher options.** Each band on or off; Steps placement (beside the model, in the first cell, as a strip, as a check box checklist); model count 1 or 2; guided count 2 to 4; Independent rows Auto or off; `Say:` band on or off (on by default); teacher-prompt strip (8 mm, foot of body); place-value labels; individual supports; sides (PT-PKT-4).
**Skill supplies.** `strings` (`iCan`, `whatsNew`, `vocabulary`, `rule`, `oralFrame`, `instruction`), `workedSteps`, `renderCell` at levels 3, 2 and 1, `footprint`.
**Screen.** Learn mode, one band per card in the same order: change sentence, vocabulary cards (tap to hear), Model as a Step 1-2-3 stepper with Next, then Guided items with live per-digit feedback and Hint revealing the next grey support. At 375 px bands stack and the Model is the stepper; at 768 and 1440 the model and steps sit side by side.

### 2.2 Scripted Model page

**Purpose.** Teach an algorithm as frozen states: the same problem redrawn once per step, the newest marks in trace grey, the step text aligned to its state, closing with a read-aloud sentence.
**Look.** I Can. No labels, no Score.

```
+=======================================================================+
| Model:  Trace the answer. Say the steps.                              |  6
| +-----------------+---------------------------------------------------+
| | state 1         | (1) Add the ones.  7 + 5 = 12                     | 45
| | newest marks    |     the active column has a dotted 1 pt outline   |
| | in trace grey   |                                                   |
| +-----------------+---------------------------------------------------+
| | state 2         | (2) Write 2. Regroup 1 ten.                       | 45
| +-----------------+---------------------------------------------------+
| | state 3         | (3) Add the tens.  1 + 4 + 3 = 8                  | 45
| +-----------------+---------------------------------------------------+
| | state 4         | (4) Read the sum.                                 | 45
| +-----------------+---------------------------------------------------+
| Say: "47 plus 35 equals 82."                                          | 11
+-----------------------------------------------------------------------+
```

| | S | M | L |
|---|---|---|---|
| State row height = Hg | 36 | 45 | 54 |
| Closing `Say:` band (Hw + 3, PT-OPN-9) | 9 | 11 | 13 |
| States per page = floor((232 - strip - frame) / Hg) | (232-6-9)/36 = 6 | (232-6-11)/45 = 4 | (232-8-13)/54 = 3 |

- **PT-MOD-1.** One state per `workedSteps` entry. Marks made in earlier steps are black, the newest marks are trace grey (dotted outline when Photocopy-safe), later steps are blank. Exactly one new mark group per state.
- **PT-MOD-2.** State cell width = max(`footprint.wMm`, 62); the text column takes the rest. Step text is cell-text size, 2 lines at most.
- **PT-MOD-3.** Steps beyond the page capacity continue on a page whose band label again reads "Model:" (band labels come only from the fixed vocabulary; the page number shows the continuation), same title, same row height.
- **PT-MOD-4.** The page ends with the `Say:` band (PT-OPN-9): the skill's oral frame filled in for this problem. The band is on by default and follows the same dialog option as the Opener's.

**Teacher options.** One or two examples (the second uses identical wording); arrows and callouts on or off; `Say:` band on or off (on by default).
**Skill supplies.** `workedSteps(q)` with `marks` per step; `renderCell` with `state: traced` and `ctx.step = {index: i, marks}`; `strings.oralFrame`. Default adapter: states before the last show the blank problem, the last shows it answered.
**Screen.** A stepper: one state at a time with Next and Back, the step read aloud, no inputs. It is also the last rung of the Hint ladder (PT-SCR-6).

### 2.3 Guided page

**Purpose.** "We do" with many repetitions while the steps stay in view.
**Look.** I Can. Cells are **unlabelled** (CL-14: the band names them; round-4 re-grade, superseding round 2's quiet letters) and scored: the Score counts every cell but the worked example, which carries the `Model` tab. The fade: cell 1 fully traced (answer and working); the first try row the first step of the working in grey - a column stack's ones digit and carried ten, the count cue (a grey dot tile for + and −, the missing-factor think line for ÷), or a grey hint line: the problem's own first worked step that holds none of its answer (when every step names part of the answer, as a clock's hour does, the first step as a frame with the answer left as a gap: "The short hand has passed ___."); later rows blank. When every try sits in that one row, only the FIRST try is hinted, so the page fades to "none". A lone grey digit or half the blanks is never traced. One kind of problem per page (the kind the pool deals most), so the Steps fit every item; the Model is the forward item whose worked steps are the most (it exercises every printed step), and it draws that working in trace grey: a subtraction's cross-outs and new numbers, a remainder's rings round each group, a fact's skip count, a table's answers. A Model too tall to leave a row of tries under it takes a cell of its own with a hinted try beside it, never a page alone. A column stack keeps its black digit grid on every try.

```
+=======================================================================+
| Steps:  (1) ...      (2) ...      (3) ...      (4) ...                | 27
+=======================================================================+
| Guided Practice:  Add.                                                |  6
| +----------------------+----------------------+---------------------+ |
| | cell 1 fully traced  | first digit grey     | first digit grey    | | 45
| +----------------------+----------------------+---------------------+ |
| | row 2: level 1 (first-cell cue, then structural supports only)    | | 45
| +----------------------+----------------------+---------------------+ |
| (rows grow to 1.5 x their content, then more rows up to the ceiling of  |
| 10 / 8 / 6 tries plus the Model; the rest stays under the grid - never |
| as gaps between rows)                                                  |
| Teacher prompts (optional strip)                                      |  8
+-----------------------------------------------------------------------+
```

| | S | M | L |
|---|---|---|---|
| Steps strip (strip + 3 text lines + 3) | 6 + 15 + 3 = 24 | 6 + 18 + 3 = 27 | 8 + 21 + 3 = 32 |
| Rows = floor((232 - steps - band strip) / Hg) | (232-24-6)/36 = 5 | (232-27-6)/45 = 4 | (232-32-8)/54 = 3 |
| Columns (Auto) | 4 | 3 | 3 |
| Tries (design-standard 12.1 ceiling 10 / 8 / 6, plus the Model; rows beyond it are not printed) | up to 10 | up to 8 | up to 6 |

- **PT-GDP-1.** The fade inside the page is monotone: cell 1 is level 3, the rest of row 1 is level 2, every later row is level 1. Structural supports never drop on this page.
- **PT-GDP-2.** The Steps strip is two text columns, 3 lines at most; longer step lists move to a Scripted Model page and the strip shows the step verbs only.
- **PT-GDP-3.** The teacher-prompt strip costs 8 mm and is taken off the row budget before rows are counted.

**Teacher options.** Steps strip on or off or as a check box checklist; cell count 3, 6 or 8 (never above the ceiling for the size: 10 / 8 / 6 tries); teacher-prompt strip; individual supports.
**Skill supplies.** `workedSteps`, `renderCell` at levels 3, 2, 1, `strings.instruction`.
**Screen.** Guided items in Learn mode: live per-digit feedback, Hint reveals the next grey support, the steps stay docked above (375) or left (1440) of the cell.

### 2.4 Independent page

**Purpose.** "You do" with a clear stopping point: six items, fewer for long algorithms.
**Look.** I Can. Quiet letters that run on across the lesson's Independent pages.

```
| Name ________  Date ______  Score ____/6          [Level 2|Addition|Lesson 5]
|                  I Can add two-digit numbers 
+=======================================================================+
| Add.                                                                  |  8
| +----+------------------------------+----+---------------------------+
| | a. |                              | b. |                           |
| +----+       H  T  O                +----+                           | 76
| |          [ ][ ]                   |                                |
| |            4  7                   |    problem in the upper half,  |
| |         +  3  5                   |    at least 40% of the cell    |
| |         ---------                 |    free, answer space below    |
| |                                   |                                |
| +-----------------------------------+--------------------------------+
| | c.                                | d.                             | 76
| +-----------------------------------+--------------------------------+
| | e.                                | f.                             | 76
| +-----------------------------------+--------------------------------+
```

| Footprint class | Grid (cols x rows) | Cell at S, M / L | Items |
|---|---|---|---|
| Stack, short computation, medium visual | 2 x 3 | 93 x 76 / 93 x 75.67 | 6 |
| Long algorithm (multi-row multiply, long division), heavy visual | 2 x 2 | 93 x 114 / 93 x 113.5 | 4 |
| One-symbol answer (compare, equation, yes / no) | 2 x 4, 2 x 5, 2 x 8 | 93 x 57, 45.6, 28.5 | 8, 10, 16 |
| Wide visual row (number line, coin row, table row) | 1 x 3, 4 or 5 | 186 x 76, 57, 45.6 | 3 to 5 |

Arithmetic: G = 236 - I = 228 / 228 / 227; cell height = G / rows (228 / 3 = 76; 227 / 3 = 75.67; 227 / 2 = 113.5). Check against a plain I Can stack at L with addition regroup boxes on (table 3.1): hMin = 49 + 8 = 57, floor((227 - 1) / 57) = 3 rows, so 2 x 3 stands.

- **PT-IND-1.** `rows = min(targetRows, floor((G - 1) / hMin))`. Target rows come from the footprint class above; when the teacher sets columns 1 to 6 explicitly the targets are {1: 4, 2: 3, 3: 3, 4: 4, 5: 5, 6: 6}. Columns clamp digit-aware (PT-COL-3); digits never change size on this role.
- **PT-IND-2.** Cells show structural supports only (level 1). No steps and no model.
- **PT-IND-3.** Optional last cell: a rounded, unlabelled, unscored check box list of the step verbs. It replaces the final item, so a 2 x 3 page scores /5.
- **PT-IND-4.** Seeded content: item sets mix regroup and no-regroup cases, ragged operand lengths, zeros and every unknown position the step allows (`PEDAGOGY_STANDARD.md`).

**Teacher options.** Pages 1 to 3; columns; size; supports; step checklist cell; problem mix (one type and notation, or deliberately mixed).
**Skill supplies.** `renderCell` level 1, `footprint`, `strings.instruction`.
**Screen.** Practice mode: one cell per view at 375, feedback on Check, Hint on request, "Show me" offered after two wrong Checks (PT-SCR-6).

### 2.5 More Practice A to J

**Purpose.** A repetition bank for the same step: up to ten parallel pages.
**Look, anatomy, geometry.** Identical to the Independent page (2.4).

- **PT-MPR-1.** The tab reads `Practice A` to `Practice J`; the title is the lesson title; letters restart at `a.` on each page.
- **PT-MPR-2.** Each letter is its own seed (lesson, letter), so Practice C reprints identically.
- **PT-MPR-3.** Supports match the last Independent page of the lesson. Fact-like skills may use the cue layout of 4.2 (cue strip, then vertical rows, then horizontal rows) as their More Practice page.

**Teacher options.** Which letters; otherwise as 2.4. **Skill supplies.** As 2.4. **Screen.** Practice mode, "more like this".

### 2.6 Sub-skill pages

**Purpose.** Isolate one decision or one motor step of a procedure before combining. No answer is computed on these pages.
**Look.** I Can, lettered, scored.

Three variants share the Independent grid:

```
DECIDE-ONLY                          NOTATE-ONLY                  SET-UP (rewrite)
+----+-------------------------+     +----+-----------------+     +----+-------------+--------------+
| a. |       4 2               |     | a. |   [ ][ ]        |     | a. |             |   H  T  O    |
+----+     - 1 7               |     +----+    5  3         |     +----+ 346 + 87    | +--+--+--+   |
|         ------               |     |       - 2  8         |     |                  | |  |  |  |   |
| [ ] I can subtract the ones. |     |       ------         |     |                  |+|  |  |  |   |
| [ ] I need to regroup.       |     | make the regroup     |     |                  | +========+   |
+------------------------------+     | marks; do not solve  |     +------------------+--------------+
 no answer slot; check one box       +----------------------+      copy into the frame; do not solve
```

| Variant | Grid S / M / L | Cell height check at L | Items S / M / L |
|---|---|---|---|
| Decide-only, stacked expression | 2x4 / 2x4 / 2x3 | label 8 + problem 25 + 3 + two check-box lines 18 + 3 = 57 > 56.75, so 3 rows | 8 / 8 / 6 |
| Decide-only, horizontal expression | 2x4 | 7 + 11.4 + 3 + 18 + 3 = 42.4 <= 56.75 | 8 |
| Notate-only | 2x3, 2x4 or 3x4 | cell = the skill's level-1 cell without its answer row | 6 to 12 |
| Set-up (rewrite horizontal to vertical) | 2x3 (2x2 for 4+ digit frames) | statement zone 40 + frame zone 53 = 93 wide | 6 (4) |

- **PT-SUB-1.** Decide-only: the problem prints without an answer slot, followed by two or three first-person check box lines (check box 5 / 6 / 7 square, cell text). About half the items are non-examples or items the rule does not apply to.
- **PT-SUB-2.** Notate-only: the cell keeps every structural support and drops the answer row. The instruction states that nothing is solved today.
- **PT-SUB-3.** Set-up: the statement sits left, an empty frame sits right with the operator pre-printed and an open top row for regrouping. The frame fades down the page: row 1 lettered frame with the first item traced, row 2 lettered outline frame, row 3 plain square grid. No frame is ever dashed (PT-TOK-3).
- **PT-SUB-4.** Score counts one point per cell.

**Teacher options.** Variant; count; share of non-examples (decide-only, 30 to 60%); frame fade on or off.
**Skill supplies.** `decision(q)` and `setupOnly(q)`, each returning a derived question (contract section 3.2) with `responseScope` `decision` or `setup`; the decision lines and the correct line, or the statement and its empty frame, travel in that question's cell payload. Fallbacks: decide-only falls back to a judgement on a shown answer with two check boxes labelled exactly "Correct" and "Not correct" (library strings `judge-correct`, `judge-not-correct`), built from `wrongAnswer`; notate-only and set-up fall back to "copy the problem into the skill's empty frame" (`responseScope: 'setup'`). The dialog marks a fallback part "basic".
**Screen.** Check-box lines become tap targets; set-up frames become one-digit inputs checked for position only; feedback on Check.

### 2.7 Error analysis

**Purpose.** Self-monitoring: judge finished work, then fix only what is wrong.
**Look.** I Can, lettered from `a.` (PT-LBL-7), scored.

```
+----+------------------------------+
| a. |        4 7                   |   the skill's cell in state `answered`
+----+      + 3 5                   |   or `wrong`; about half are wrong
|          ------                   |
|           7 2                     |   shown answer: black Andika 400
|  [ ] Correct    [ ] Fix it        |   decision row, one line (library string `check-fix`)
|  ________                         |   fix slot in the skill's answer shape
+-----------------------------------+
```

| | S | M | L |
|---|---|---|---|
| Cell height = answered cell + decision row (check box + 2, doubled for wrap allowance) + fix row (Hw + 4) | 33 + 14 + 10 = 57 | 41 + 16 + 12 = 69 | 49 + 18 + 14 = 81 |
| Rows on a 2-column page | floor(227 / 57) = 3 | floor(227 / 69) = 3 | floor(226 / 81) = 2 |
| Items (design-standard ceiling 6 / 4 / 4; rows beyond it are not printed) | 6 | 4 (2 rows used) | 4 |

- **PT-ERR-1.** 40 to 60% of the shown answers are wrong, each from `wrongAnswer(q)` (a real misconception, never a random number).
- **PT-ERR-2.** The fix slot has the skill's answer-slot shape and is scored only on wrong items; a correct item left unfixed scores its point from the check mark alone.
- **PT-ERR-3.** Counts offered: 2 (1 x 2, long algorithms with shown working), 4 or 6, never above the design-standard ceiling for the size (6 / 4 / 4).

**Teacher options.** Count; share wrong; show full working or the answer only; multiply-to-check grid for division.
**Skill supplies.** `wrongAnswer(q)`, `renderCell` with `state: answered | wrong`, optional `workedSteps` for shown working.
**Screen.** Find-the-mistake mode: tap Correct or Fix it, then the fix input opens only after "Fix it"; feedback on Check.

### 2.8 Review

**Purpose.** Rehearse the test: the lesson cells again, in teaching order, with 25 to 35% earlier items.
**Look.** I Can, lettered from `a.`, Score in the header.

```
| Name ________  Date ______  Score ____/10         [Level 2|Addition|Review 3]
|                  Review: adding two-digit numbers
+=======================================================================+
| Add.                                                                  |  6
| | a.                   | b.                    | c.                  || 41
| | d.                   | e.                    | f.                  || 41
+=======================================================================+
| Mixed Review:  Add.                       (earlier step)              |  6
| | g.                   | h.                    | i.                  || 41
+=======================================================================+
| Solve. Write the number and the label.                                |  6
| | j.  word-problem band (3.7)                                        || 57
+-----------------------------------------------------------------------+
```
M: 6 + 82 + 6 + 41 + 6 + 57 = 198 <= 232; spare 34 lets the three stack rows gain 8 each (222). At L the same plan needs 8 + 98 + 8 + 49 + 8 + 76 = 247 > 232, so the word-problem section moves whole to page 2 (PT-ENG-8).

- **PT-REV-1.** Two or three sections, each a band strip that holds the instruction (weight 400; the earlier-items section also carries the band label `Mixed Review:`), followed by whole rows of the section's cell. 8 to 20 items in total, from the pedagogy standard's allowed totals (8, 10, 12, 16, 20; P-23), never above the design-standard ceiling per page (16 / 12 / 8-12).
- **PT-REV-2.** Supports equal those of the last lesson taught. Steps, models and traces do not appear.
- **PT-REV-3.** Earlier-step items make up 25 to 35% of the labelled cells; the lint checks the ratio.
- **PT-REV-4** (critic guided-r1). The earlier share never passes 45%: 20-45% when whole rows allow it, else one mixed row, else none. A skill with no earlier step in its category rehearses the nearest earlier skill in its domain (same grade or lower), so every Review has its `Mixed Review:` section. The skill's own problems come in one band per instruction kind (a kind names its own line; problems with no line of their own take the neutral `Solve.`), each band whole rows, and every row is as tall as what it holds - a page of mixed heights fills by the rows it prints, never by its tallest problem.

**Teacher options.** Sections and their skills; counts; mix ratio; hints (off by default).
**Skill supplies.** `renderCell` level 1, `footprint`, `strings.instruction`. **Screen.** Mixed review mode, feedback on Check.

### 2.9 Test A / B

**Purpose.** An end-of-step check that mirrors practice, in parallel seeded forms.
**Look.** I Can, thin ruled cells, quiet letters, Score in the header.

```
| Name ________  Date ______  Score ____/16          [Level 2|Addition|Test A]
|                  Test A: adding two-digit numbers
+=======================================================================+
| Add.                                                                  |  8
| | a.            | b.             | c.             | d.             |  | 57
| | e.            | f.             | g.             | h.             |  | 57
| | i.            | j.             | k.             | l.             |  | 57
| | m.            | n.             | o.             | p.             |  | 57
+-----------------------------------------------------------------------+
```

| Footprint class | 12 | 16 | 20 | Note |
|---|---|---|---|---|
| Fact, equation | 4 x 3 (76) | 4 x 4 (57) | 4 x 5 (45.6) | Facts normally use the probe (4.2) |
| Stack, 2- or 3-digit | 4 x 3 | 4 x 4 | 4 x 5 at S and M; at L 45.4 < 49, so 20 items take 2 pages | 4-digit at L needs 47.6 > 46.5, so 3 columns: 3 x 4 = 12 |
| Long algorithm | 2 x 2 = 4 per page | | | |
| Medium visual | 3 x 3 grid, 8 items (the ninth position is the unruled trailing area, PT-ENG-7) | 3 x 4 = 12 only when the visual's row fits 57 | | |

- **PT-TST-1.** Form B holds the same items as Form A, reordered or commuted, from seed (skill, step, form). The unknown appears in every position the step covers.
- **PT-TST-2.** Hints (traces, cue dots, captions, steps) are off. Structural supports follow the "keep structural supports" check box, default on. "Hints on tests" is a separate check box, default off. Place-value letters are a structural support, so they follow the "keep structural supports" check box (design standard VA-32).
- **PT-TST-3.** Timing extras (the "(1 minute)" tag, Time line, Goal) are options, never defaults.

**Teacher options.** Form A or B (or both); count 4 (long algorithms), 8, 10, 12, 16, 20 (the pedagogy standard's allowed totals, P-23); keep structural supports; hints on tests; timing extras.
**Skill supplies.** `renderCell` at level 1 or 0, `footprint`. **Screen.** Test mode: Hint hidden, feedback after the whole test is submitted.

### 2.10 Pre-skill check

**Purpose.** A short check of the prerequisite sub-skills before a ladder starts. Two forms. No supports.
**Look.** I Can, lettered, Score in the header.

```
+=================================+=================================+
| Add.                            | Subtract.                       |  6
| | a.      | b.      | c.      | | | g.      | h.      | i.      | |
| | d.      | e.      | f.      | | | j.      | k.      | l.      | | 2 x 55.7
+=================================+=================================+
| Count. Write the number.        | Circle the bigger number.       |  6
| | m.      | n.      | o.      | | | s.      | t.      | u.      | |
| | p.      | q.      | r.      | | | v.      | w.      | x.      | |
+---------------------------------+---------------------------------+
```

- **PT-PRE-1.** Four boxed quadrants, 93 x 117.5 ((236 - 1) / 2), one prerequisite skill each, each with its own strip.
- **PT-PRE-2.** Quadrant grid: 3 x 2 at S and M (cells 31 x 55.7), 2 x 2 at L (46.5 x 54.7); long algorithms 1 x 2. Each quadrant holds 4 or 5 scored items and prints its own small score `__/4` or `__/5` (pedagogy standard P-25); at S and M the unused grid positions are the unruled trailing area (PT-ENG-7), so the drawing above shows positions, not a count. Totals at most 20 / 20 / 16.
- **PT-PRE-3.** Prerequisite skills come from the ladder's pre-skill list; without a ladder the teacher picks four skills. Forms A and B are seeded.

**Teacher options.** Form; the four skills; count per quadrant. **Skill supplies.** `renderCell` level 0 or 1, `footprint`. **Screen.** Test mode, four short sets.

### 2.11 K one-page lesson (2 model / 2 guided / 2 alone)

**Purpose.** The whole cycle on one sheet for Level K.
**Look.** I Can. Only the last two cells are lettered and scored.

```
| Name ________  Date ______  Score ____/2            [Level K|Counting|Lesson 3]
|                  I Can count to 5 
| .-------------------------------------------------------------------. |
| ( Steps:  (1) Look at each one.  (2) Count.  (3) Write the number.   )| 34
| '-------------------------------------------------------------------' |
+=======================================================================+
| Model:                                                                |  6
| | worked, traceable answer      | drawing given, answer to trace     || 60
+=======================================================================+
| Guided Practice:                                                      |  6
| |                               |                                    || 60
+=======================================================================+
| Independent Practice:                                                 |  6
| | a.                            | b.                                 || 60
+-----------------------------------------------------------------------+
```

| | S | M | L |
|---|---|---|---|
| Steps box (rounded, a read container) | 30 | 34 | 40 |
| Row height = (232 - steps - 3 strips) / 3 | (232-30-18)/3 = 61 | (232-34-18)/3 = 60 | (232-40-24)/3 = 56 |
| Cell | 93 x 61 | 93 x 60 | 93 x 56 |

- **PT-KLS-1.** Three rows of two cells. Row 1: cell 1 fully worked with a traceable answer, cell 2 with the drawing given. Row 2: guided. Row 3: alone, lettered `a.` `b.`.
- **PT-KLS-2.** The K counting side layout (3.5) needs 93 x 32 / 36 / 44, so it fits every size. A footprint taller than the row height sends the page to the Opener plus Independent pair instead.

**Teacher options.** Objects (plain counters or pictures); arrangement; response mode (write, circle the number). **Skill supplies.** As 2.1 with 3 steps or fewer. **Screen.** As the Opener, shortened to one model.

---

## 3. Practice roles

### 3.1 Computation grid

**Purpose.** A daily set of stacked multi-digit problems (add, subtract, multiply, decimals): one problem per box, every box identical.
**Look.** Daily by default (heavier grid, widely tracked digits, black number tabs). The I Can look is the same composer with thin rules, 0.72 em tracks and quiet letters.

```
| Name ________  Date ______  Score ____/9           [Level 3|Addition|Week 2]
|                  I Can add three-digit numbers 
+=======================================================================+
| Add.                                                                  |  8
+####+------------------+####+------------------+####+------------------+
|# 1#|                  |# 2#|                  |# 3#|                  |
+####+   2   5   2      +####+   4   2   0      +####+   6   8   5      | 76
|      + 2   4   7      |      + 5   1   5      |      + 3   0   2      |
|      -------------    |      -------------    |      -------------    |
|      (answer space)   |                       |                       |
+####+------------------+####+------------------+####+------------------+
|# 4#|                  |# 5#|                  |# 6#|                  | 76
+####+------------------+####+------------------+####+------------------+
|# 7#|                  |# 8#|                  |# 9#|                  | 76
+-----------------------+-----------------------+-----------------------+
```

One cell:

```
+####+---------------------------------+
|# 1#|                                 |  label box; top pad = label side + 2 (6 / 7 / 8)
+####+     H    T    O                 |  place-value letters, bold, 4 / 5 / 6 row (option)
|         [ ]  [ ]                     |  regroup boxes: track - 1 wide, 5 / 6 / 7 tall, in a 6 / 7 / 8 row
|          6    8    5                 |  operand rows, one digit per track, right-aligned
|     +    3    0    2                 |  operator alone in the leftmost track, weight 700
|    ====================              |  sum rule 1.5 pt from the operator track to the ones track
|    ( )   _    _    _                 |  answer row 8 / 10 / 12, open space, no boxes on paper;
|                                      |  an extra answer digit is written under the operator
+--------------------------------------+  bottom pad 4; all spare height goes here
   side pad 4 / 6 / 6 | T tracks x t | side pad
```

Track count T (operator track included): add or subtract d-digit operands: d + 1; multiply m x 1-digit: m + 1; multiply m x n (n >= 2): m + n + 1; money: + 1; each decimal point or comma: + 0.3 em separator track.

Maximum columns = largest c <= 6 with `c x (T x t + separators x 0.3 em + 2 x sidePad) + (c + 1) x border <= 186` (border 0.26 I Can, 0.53 Daily). Cells show width needed -> columns:

| T | I Can S | I Can M | I Can L | Daily S | Daily M | Daily L |
|---|---|---|---|---|---|---|
| 3 (2-digit) | 20.2 -> 6 | 28.8 -> 6 | 33.3 -> 5 | 24.1 -> 6 | 34.1 -> 5 | 40.2 -> 4 |
| 4 (3-digit) | 24.3 -> 6 | 34.4 -> 5 | 40.5 -> 4 | 29.5 -> 6 | 41.5 -> 4 | 49.5 -> 3 |
| 5 (4-digit, 2 x 2) | 28.3 -> 6 | 39.9 -> 4 | 47.6 -> 3 | 34.8 -> 5 | 48.9 -> 3 | 58.9 -> 3 |
| 6 (5-digit, 3 x 2) | 32.4 -> 5 | 45.5 -> 4 | 54.7 -> 3 | 40.2 -> 4 | 56.2 -> 3 | 68.3 -> 2 |
| 7 (6-digit, 4 x 2, 3 x 3) | 36.5 -> 5 | 51.1 -> 3 | 61.8 -> 2 | 45.5 -> 4 | 63.6 -> 2 | 77.7 -> 2 |
| 8 | 40.5 -> 4 | 56.7 -> 3 | 68.9 -> 2 | 50.9 -> 3 | 71.0 -> 2 | 83.1 -> 2 |

Minimum cell height = top pad + [letters 4 / 5 / 6] + [add regroup row 6 / 7 / 8, or subtract headroom 8 / 10 / 12] + 2 line heights + [Daily gap 2] + rule 2 + [n partial-product rows + rule 2] + answer row + 4. Rows = floor((G - 1) / hMin) with G - 1 = 227 / 227 / 226, then capped by the column target.

| Case | I Can hMin | Daily hMin | Rows that fit S / M / L |
|---|---|---|---|
| Plain | 33 / 41 / 49 | 35 / 43 / 51 | 6 / 5 / 4 |
| + place-value letters | 37 / 46 / 55 | 39 / 48 / 57 | I Can 6 / 4 / 4; Daily 5 / 4 / 3 |
| + addition regroup boxes | 39 / 48 / 57 | 41 / 50 / 59 | 5 / 4 / 3 |
| + both | 43 / 53 / 63 | 45 / 55 / 65 | 5 / 4 / 3 |
| + subtraction headroom | 41 / 51 / 61 | 43 / 53 / 63 | 5 / 4 / 3 |
| Multiply by 2 digits | 47 / 59 / 71 | 49 / 61 / 73 | 4 / 3 / 3 |
| Multiply by 3 digits | 53 / 67 / 81 | 55 / 69 / 83 | 4 / 3 / 2 |

| Columns | Cell width | Target rows | Rows S / M / L (plain) | Cell height | Problems per page |
|---|---|---|---|---|---|
| 1 (stack centred in the left 62 mm) | 186 | 4 | 4 / 4 / 4 | 57 / 57 / 56.75 | 4 |
| 2 | 93 | 3 | 3 / 3 / 3 | 76 / 76 / 75.67 | 6 |
| 3 (Daily Auto) | 62 | 3 | 3 / 3 / 3 | 76 / 76 / 75.67 | 9 |
| 4 | 46.5 | 4 | 4 / 4 / 4 | 57 / 57 / 56.75 | 16 |
| 5 | 37.2 | 5 | 5 / 5 / 4 | 45.6 / 45.6 / 56.75 | 25 / 25 / 20 |
| 6 | 31 | 6 | 6 / 5 / not reachable | 38 / 45.6 | 36 / 30 (M: I Can, T = 3 only) |

- **PT-CGR-1.** Size fixes the digit size; columns only divide the width. A choice above the table maximum, including 7 to 10, clamps with a dialog note (PT-COL-5). Two-digit fact drills that need 7 to 10 columns belong on Fact rows (4.1).
- **PT-CGR-2.** Any regroup scaffold forces 0.95 em tracks in both looks. Addition and multiplication get regroup boxes above every column except the ones. Subtraction gets a blank headroom row above the top operand; subtraction boxes are offered only at L and only in Model and Guided cells.
- **PT-CGR-3.** Regroup boxes are square-cornered, solid 0.75 pt. Guided track marks are grey, 1 pt, 2 mm long. Nothing is dashed except the missing-digit box of PT-CGR-9.
- **PT-CGR-4.** Place-value labels default to bold letters H T O (Th) at label size in a ruled strip above the tracks; the full words appear once, in the Model cell and the vocabulary box. Dialog option: words, letters, none. Words are offered only where a column is at least 14 mm wide.
- **PT-CGR-5.** The operator never moves next to a shorter operand. Operands are right-aligned; mixed digit lengths share T (PT-ENG-9).
- **PT-CGR-6.** Decimals: the printed point on the operands always stays; a grey point in the answer row is a hint and drops at level 1. Money: no currency sign prints in a cell (PT-VIS-6).
- **PT-CGR-7.** Partial-product rows are ruled in Model and Guided cells; Independent cells get open space of the same height.
- **PT-CGR-8.** Worked model (option): the first cell position holds a Model cell: left half identical to a practice cell, right half at most 3 numbered steps of 4 words or fewer plus the place-value key. It is unscored (PT-LBL-6). At 1 column the steps sit to the right of the stack.
- **PT-CGR-9. Missing-digit items.** When one digit inside a stacked problem is unknown, its track holds a **dashed** digit box (0.75 pt, short dash 1.5 mm on / 1 mm off, track - 1 wide x Hw tall) in place of the glyph, on the digit's own row. Dashed = unknown, so the box cannot be mistaken for the solid regroup box above the stack (owner ruling 2026-09-19). One unknown digit per item at first, then two. The cell's footprint is unchanged (design standard LS-8, SL-10, VA-7).

**Teacher options.** Look; columns; size; place-value labels; regroup boxes or headroom; worked model; fade (Model, Guided, Independent rows); commas in 4-digit numbers; problem mix (one operation and type, or mixed with the library instruction `mixed-sign` or `mixed-ops`).
**Skill supplies.** `renderCell` (stack template), `footprint` (T, options), `workedSteps` for the model cell.
**Screen.** The same grid cell with one-digit inputs per answer track, right to left; regroup boxes and partial-product rows are inputs too. 375 px: one cell, track = min(56, floor(311 / T)) px for T <= 7, edge to edge at T = 8; 768 px: 56 px tracks; 1440 px: 64 px tracks or a 3-column review grid.

### 3.2 Equation drill

**Purpose.** Horizontal equations in ruled columns: facts, missing numbers in every position, missing signs, comparisons.
**Look.** Daily by default (1.5 pt rules, black tabs). Horizontal equations keep 1 em operator slots in both looks.

```
+=======================================================================+
| Write the missing number.                                             |  8
+####+------------------+####+------------------+####+------------------+
|# 1#  85 + [    ] = 96 |# 2#  38 - [    ] = 25 |# 3#  34 + [    ] = 55 |
+####+------------------+####+------------------+####+------------------+
|# 4#  27 - [    ] = 14 |# 5#  74 + [    ] = 85 |# 6#  84 - [    ] = 70 |
+-----------------------+-----------------------+-----------------------+
|  ... default 7 / 10 / 12 rows at L / M / S ...                        |
```

One cell (label beside; when that does not fit, the equation drops below the label):

```
+####+-------------------------------------------------+
|#12#|   2 7     +     [      ]    =     7 7           |  operands right-aligned in fixed tracks;
+####+   A      1 em      B       1 em    C            |  operators, "=" and blanks align down each column
+------------------------------------------------------+
 blank B: box inside an expression, baseline line after "=", circle Hw + 2 for a sign or comparison
```

Equation widths: class F ("7 x 3 = _") 3.16 em; F2 ("24 / 3 = _") 3.74 em; T (one 2-digit operand or more, "27 + [ ] = 77") 4.32 em; H (3-digit) 5.48 em; class comes from digit counts, not from the operation. Overhead OH: label beside 9 / 10 / 11, label above 4. Fit test: `eqW(pt) + B + OH <= cellW - 0.6`; at each ladder step try label-beside first, then label-above.

Row pitch: label beside 12 / 14 / 18 (19 / 16 / 12 rows); label above 14 / 17 / 20 (16 / 13 / 11 rows); think box above 20 / 24 / 30 (10 / 8 / 6 rows). Rows = floor(G / pitch); with the think box on, rows = floor(G / pitch) - 1, one fewer than the 11 / 9 / 7 the pitch allows, and the freed height is shared among the rows below the answer line so that the fact stays in the top half of the space under the think box (design standard CL-4a) (PT-FPR-7).

Fit table, no strip (pt, b = label beside, s = label above, total width):

| Cols | Cell | S: F | S: T | S: H | M: F | M: T | M: H | L: F | L: T | L: H |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 186 | 16 b | 16 b | 16 b | 22 b | 22 b | 22 b | 28 b | 28 b | 28 b |
| 2 | 93 | 16 b 40.8 | 16 b 47.4 | 16 b 55.9 | 22 b 48.5 | 22 b 57.5 | 22 b 72.5 | 28 b 59.2 | 28 b 70.7 | 28 b 90.1 |
| 3 | 62 | 16 b | 16 b | 16 b | 22 b | 22 b | 18 s 58.8 | 28 b 59.2 | 24 s 57.6 | clamp 2 |
| 4 | 46.5 | 16 b 40.8 | 16 s 42.4 | clamp 3 | 22 s 42.5 | 18 s 45.4 | clamp 3 | 22 s 45.5 | clamp 3 | clamp 2 |
| 5 | 37.2 | 16 s 35.8 | clamp 4 | clamp 3 | 16 s 35.8 | clamp 4 | clamp 3 | clamp 4 | clamp 3 | clamp 2 |
| 6-10 | <= 31 | clamp 5 | clamp 4 | clamp 3 | clamp 5 | clamp 4 | clamp 3 | clamp 4 | clamp 3 | clamp 2 |

Maximum problems per page (rows x columns, columns 1 upward): S class F 19 / 38 / 57 / 76 / 80; M class F 16 / 32 / 48 / 52 / 65; L class F 12 / 24 / 36 / 44. Default counts are 7 / 10 / 12 rows at L / M / S times the Auto column count (21 / 30 / 36 at 3 columns); the row pitch then stretches to fill (L: 227 / 7 = 32.4 <= 2.0 x 18).

With a side support strip (4.2) the grid is 168 / 168 / 166 wide; class F then fits 3 columns at 28 pt label-above at L (52.2 <= 54.7) and 4 columns at 20 pt at M.

Comparison items: circle diameter Hw + 2 = 8 / 10 / 12; width = n ch + circle + 4 + OH; 2-digit numbers fit 6 / 5 / 4 columns, 3-digit 5 / 4 / 3.

- **PT-EQD-1.** This fit function is the only authority for horizontal equations on every role (fact layouts, mixed sheets, spiral cells, tests).
- **PT-EQD-2.** In a single-type section operands are right-aligned in fixed tracks so signs and blanks align down each column. A section whose blank position varies counts as mixed: left edges align and the column maximum comes from the widest item.
- **PT-EQD-3.** The unknown appears in every position the skill allows, including the form `5 = 2 + [ ]`.
- **PT-EQD-4.** Remainder form: both blanks are boxes, `17 / 5 = [B] R [12]`; 2 columns at M, 3 columns label-above at S.
- **PT-EQD-5.** Worked example (option): a full-width Example band above the grid, 1.5 x pitch tall, unscored; with fade on, the first grid row carries grey trace answers. Never replaces cell 1.
- **PT-EQD-6.** Glyphs are the real signs (U+00D7, U+00F7, U+2212), never letters.

**Teacher options.** Look; columns; size; count; blank position (result, first, second, mixed); answer-slot type (number, sign, comparison); think box above (4.2, off by default; when on, the page drops one row); side strip; number-line band replacing the first row; related-fact rewrite line under each item.
**Skill supplies.** `renderCell` (equation template), `footprint` (class, answer digits), `variants[]` for unknown positions.
**Screen.** Inputs at least 44 x 44 px keep the box or line styling; a comparison circle or sign box opens a row of 48 px choice buttons; font = min(cap, (container - 32 - blank px) / eqW em). Grid 1 / 3 / 5 columns at 375 / 768 / 1440.

### 3.3 Long division

**Purpose.** US-bracket long division with aligned work space, 4 per page by default at L.
**Look.** Daily when printed alone, I Can inside a lesson packet.

```
+=======================================================================+
| Divide.    (1 Divide) (2 Multiply) (3 Subtract) (4 Bring down)        |  9
| +----+-----------------------------+----+-----------------------------+
| | a. |  [q][q][q]   R [   ]        | b. |                             |
| +----+  _________                  +----+                             | 113.5
| |    4 ) 6  5  8                   |                                  |
| |    -   :  :  :                   |                                  |
| |      ---------   rule under each product row only                   |
| |                                  |                                  |
| |      ---------                   |                                  |
| |      (unruled stretch space)     |                                  |
| +----------------------------------+----------------------------------+
| | c.                               | d.                               | 113.5
| +----------------------------------+----------------------------------+
```

Tableau width in tracks T = divisor digits + 0.6 (bracket and operator gutter) + dividend digits + R-block (2.9 tracks for a 1-digit divisor, 3.9 for a 2-digit divisor; none on an exact-division sheet). Work lines n = 2 x (dividend digits - divisor digits + 1). `minCellW = max(T x t + 8, 30)`. `hMin = 21.5 + 6n / 26.9 + 8n / 32.4 + 10n`. `rows = floor((G - 1) / hMin)`.

Remainders sheets (I Can track; Daily columns in the last pair):

| Type (T, n) | Size | Min w | Max cols | Auto | hMin | Rows | Per page max / Auto | Daily max | Daily Auto |
|---|---|---|---|---|---|---|---|---|---|
| 2 by 1 (6.5, 4) | S | 34.4 | 5 | 4 | 45.5 | 4 | 20 / 16 | 4 | 3 |
| | M | 44.3 | 4 | 3 | 58.9 | 3 | 12 / 9 | 3 | 3 |
| | L | 54.2 | 3 | 3 | 72.4 | 3 | 9 / 9 | 2 | 2 |
| 3 by 1 (7.5, 6) | S | 38.5 | 4 | 4 | 57.5 | 3 | 12 / 12 | 3 | 3 |
| | M | 49.9 | 3 | 3 | 74.9 | 3 | 9 / 9 | 2 | 2 |
| | L | 61.3 | 3 | 2 | 92.4 | 2 | 6 / 4 | 2 | 2 |
| 4 by 1 (8.5, 8) | S | 42.5 | 4 | 3 | 69.5 | 3 | 12 / 9 | 3 | 3 |
| | M | 55.5 | 3 | 3 | 90.9 | 2 | 6 / 6 | 2 | 2 |
| | L | 68.5 | 2 | 2 | 112.4 | 2 | 4 / 4 | 2 | 2 |
| 3 by 2 (9.5, 4) | S | 46.6 | 3 | 3 | 45.5 | 4 | 12 / 12 | 3 | 2 |
| | M | 61.1 | 3 | 2 | 58.9 | 3 | 9 / 6 | 2 | 2 |
| | L | 75.6 | 2 | 2 | 72.4 | 3 | 6 / 6 | 2 at 0.80 em (83.1) | 2 |
| 4 by 2 (10.5, 6) | S | 50.7 | 3 | 3 | 57.5 | 3 | 9 / 9 | 2 | 2 |
| | M | 66.7 | 2 | 2 | 74.9 | 3 | 6 / 6 | 2 | 2 |
| | L | 82.7 | 2 | 2 | 92.4 | 2 | 4 / 4 | 2 at 0.80 em (91.0) | 2 |

Exact-division sheets (no R-block, 30 mm floor) reach at most 6 / 6 / 5 columns for 2 by 1 down to 5 / 4 / 3 for 4 by 2 (I Can), one column fewer in most Daily cases. With a page-side multiples strip the grid is 173 / 172 / 170 wide and a few layouts lose one column.

- **PT-LDV-1.** One quotient slot sits over every dividend track, so the layout never reveals the quotient's length. With the digit grid off the vinculum itself is the answer line; with it on, slots are thin boxes.
- **PT-LDV-2.** On a remainders sheet "R" and its box print in every cell, including remainder 0.
- **PT-LDV-3.** A 0.75 pt black rule prints under product rows only (it is the subtraction bar); difference rows have no rule. The minus sign is pre-printed in the gutter of each subtract row as a structural support (design standard VA-63).
- **PT-LDV-4.** The bracket is one SVG path at 1.5 pt in both looks. The tableau is anchored so the dividend's ones track sits at the same x in every cell of a column.
- **PT-LDV-5.** The Daily track may compress from 0.95 em to a floor of 0.80 em only where that lifts the maximum from 1 to 2 columns, and the whole section then uses one track width.
- **PT-LDV-6.** Step chips (four outlined chips with the sign drawn in each) share the instruction row; with chips on, the instruction is the single word for the operation. Chips never take a row of their own.
- **PT-LDV-7.** Multiples strip: a single-divisor sheet gets one rounded page-side strip (9 / 10 / 12 wide, 4 gap); mixed-divisor sheets get per-cell strips in Model and Guided cells only.
- **PT-LDV-8.** Options and their cost: check lines (two rows on the track grid, + 2 x Hw); place-value letters over the quotient slots (no cost, they sit in the top pad); digit grid (no cost; default on in Model and Guided, off in Independent).

**Teacher options.** Columns; size; remainders or exact; digit grid; step chips; multiples strip; check lines; worked model (spans min(2, cols) cells, unscored); estimation box for 2-digit divisors; answer-then-rounded line for decimal quotients.
**Skill supplies.** `renderCell` (division template), `footprint` (T, n), `workedSteps`.
**Screen.** Quotient slots and the R box are graded inputs (the R input always renders); work-line tracks are scratch in Independent and graded per step in Guided. 375 px: one cell, tracks 44 to 48 px, the R-block wraps below; 768 px: 2 cells when T <= 7.5; 1440 px: 3 cells when T <= 8.5, else 2.

### 3.4 Visual grid

**Purpose.** One visual per box with the answer in a fixed place: clocks, generic coins, fraction models, shapes, ten frames, arrays, base-10 blocks.
**Look.** I Can.

```
+=======================================================================+
| Write the time.                                                       |  8
| +----+------------------+----+------------------+----+---------------+
| | a. |                  | b. |                  | c. |               |
| +----+    ( clock )     +----+    ( clock )     +----+   ( clock )   | 76
| |                       |                       |                    |
| |     [    ] : [    ]   |     [    ] : [    ]   |    [    ] : [    ] |
| +-----------------------+-----------------------+--------------------+
| | d. ...                | e. ...                | f. ...             | 76
| | g. ...                | h. ...                | i. ...             | 76
+-----------------------------------------------------------------------+

+----+----------------------------+   cell pad 3; visual centred in the visual zone
| a. |                            |   round visuals: clear of the label if dist(centre, corner) >= R
+----+   ....................     |   rectangular visuals: clear if (cellW - visualW) / 2 >= label + 1,
|        .   VISUAL ZONE    .     |   otherwise top inset = label + 1 instead of 3
|        ....................     |   gap 2
|        [ answer zone AZ ]       |   AZ 10 / 12 / 14, centred at the bottom, one answer type per cell
+---------------------------------+
```

Required cell height = visual + name label + inset (3, or label + 1) + 2 + AZ + 3. Rows = min(4, floor((G - 1) / required)). Max columns = floor(186 / (max(visual min width, answer width) + 6)), never more than 5.

| Visual | Min size S / M / L | Max cols | Rows | Per page |
|---|---|---|---|---|
| Analog clock, hour / half hour / 5 minutes | D 36 / 42 / 50 | 4 / 3 / 3 | 4 / 3 / 3 | 16 / 9 / 9 (Auto at L: 2 x 3 = 6) |
| Analog clock, 1 minute, or draw the hands | D 46 / 50 / 52 | 3 / 3 / 3 | 3 / 3 / 3 | 9 |
| Clock with outer minute ring (Model cells) | 47 / 55 / 65 | 3 / 3 / 2 | 3 / 3 / 2 | 9 / 9 / 4 |
| Digital clock (digits 1.5 x digit size) | 31x14 / 40x17 / 48x19 | 4 / 4 / 3 | 4 | 16 / 16 / 12 |
| Generic coins, scale 0.85 / 1.0 / 1.0, Independent | up to 6 of the largest coin | 2 (3 if <= 4 coins at S, M) | 3 | 6 |
| Generic coins, Model and Guided (value labels or running-total boxes) | one row of <= 6 | 1 | 3 | 3 |
| Generic notes 60 x 26 (design standard RP-115) | | 2 | 4 / 4 / 3 | 8 / 8 / 6 |
| Fraction circle with a side-by-side answer stack | w 52 / 62 / 72 | 3 / 2 / 2 | 4 / 4 / 3 | 12 / 8 / 6 |
| Fraction bar with a side-by-side answer stack | 64x15 / 72x20 / 78x26 | 2 | 4 | 8 |
| 2D or 3D shape with name label | 30 / 36 / 42 | 5 / 4 / 3 | 4 / 3 / 3 | 20 / 12 / 9 |
| Ten frame, single / double | 40x16, 45x18, 50x20 / h 35, 39, 43 | 4 / 3 / 3 | 4 / 4 / 4 and 4 / 3 / 3 | 16 / 12 / 12 and 16 / 9 / 9 |
| Ten frame, draw the counters (cells 10 / 10 / 11) | 50x20 / 50x20 / 55x22 | 3 | 4 | 12 |
| Array up to 5 x 5 | 35 / 40 / 45 | 4 / 4 / 3 | 4 / 3 / 3 | 16 / 12 / 9 |
| Array up to 10 x 10 (gap after the 5th row and column) | 70 / 80 / 81.5 | 2 | 2 | 4 |
| Base-10 blocks to 99 | 39.5x25 / 45x30 / 50.5x35 | 4 / 3 / 3 | 4 / 4 / 3 | 16 / 12 / 9 |
| Base-10 blocks 100 to 299 | 66.5x52 / 77x62 / 85.4x70 | 2 | 3 / 2 / 2 | 6 / 4 / 4 |

- **PT-VIS-1.** A visual is never smaller than its minimum, never larger than 1.25 x its minimum, never distorted. If it does not fit, a row is dropped.
- **PT-VIS-2.** Clock precision needs diameter: hour and half hour 26, 5 minutes 30, 1 minute 42, draw the hands 46. In a half-width panel (Daily Spiral sections, Daily 4 cells) a 38 mm clock is allowed at S, M and L only for read-the-time items to the hour, half hour or 5 minutes; 1-minute reading and draw-the-hands items take the full minimum of the table above and therefore a full-width panel (design standard RP-102). Hands differ by length and weight only. The time answer is two boxes 16 / 18 / 20 wide with a printed colon.
- **PT-VIS-3.** A fraction answer or target is a side-by-side stack (12 / 14 / 16 wide) beside the model, never under it. Shade-the-model parts are at least 6 mm wide at mid-radius: circles up to 8 / 10 / 12 parts, bars up to 8 parts in 3 columns and 12 in 2.
- **PT-VIS-4.** Shaded parts use the flat grey, or 45-degree hatch when Photocopy-safe (PT-TOK-2).
- **PT-VIS-5.** Generic coins: outlined circles sized by value (diameters 17.5, 19.75, 22.0 and 24.26 mm for the values 1, 5, 10 and 25 at scale 1.0: 1 the smallest, 25 the largest, 2.25 mm a step; not US relative sizes) showing only the value in Andika 700. No portraits, no national art, no edge detail. Coins sit in rows, largest value first, 2 mm apart, never overlapping or fanned. Scale is 1.0 at M and L, 0.85 at S, 0.8 in half-width sections of other roles; never smaller.
- **PT-VIS-6.** Money answers are plain number blanks B(n). No currency sign prints in any cell; a currency sign may appear only inside word-problem text. The section may print one teacher-chosen unit word after the blank.
- **PT-VIS-7.** Counting objects and array marks come from the teacher-picked set (PT-DLG-15): plain counters, or one of 8 in-house line-art pictures, one kind per cell.
- **PT-VIS-8.** Mixed sections are allowed only among visuals that share one answer type.

**Teacher options.** Columns; size; read or produce (write the time or draw the hands; name or shade the fraction; count or draw counters); coin supports (value labels, running-total boxes, faded Model to Guided to Independent); clock minute ring; shape name bank band; place-value letter boxes under base-10.
**Skill supplies.** `renderCell` (a visual template with the shared SVG builders, `opts.mono`), `footprint` (visual min size, answer width), `representations[]`.
**Screen.** Same SVG strings, viewBox in mm. 375: one cell per row; 768: 2 columns; 1440: 3 columns. Draw the hands = snapping drag; shade = toggle parts (each at least 44 px; bars at least 56 px tall on phones); counters = tap a frame cell.

### 3.5 K counting and trace numerals

**Purpose.** Count sets, compare groups, number bonds, numeral formation and sequences for Level K and 1, age-neutral enough for older pupils working at that level.
**Look.** I Can.

```
COUNT (side layout, 2 columns)                      TRACE ROW (N = 6)
+----+--------------------------+-----------+       +------+------+------+------+------+------+
| a. |  o   o   o   o   o       | +-------+ |       |  3   |  3   |  3   |  .   |  .   |  .   |
+----+  o   o                   | |answer | |       | model| grey | grey | start dot only     |
|       picture box             | |square | |       +------+------+------+------+------+------+
+-------------------------------+-----------+        no labels; the model digit is the label
  objects one kind per cell, 1.5 pt outline; answer square 16 / 20 / 24 at 0.75 pt
```

| Variant | Columns | Cell w x h S / M / L | Rows (total) | Per page |
|---|---|---|---|---|
| Count 1 to 10, side layout | 2 | 93 x 32 / 36 / 44; picture box 65x24 / 60x28 / 55x36 | 7 (224) / 6 (216) / 5 (220) | 14 / 12 / 10 |
| Count, stacked layout, or circle-a-number | 3 | 62 x 64 / 69 / 74 | 3 | 9 |
| Count 11 to 20 in double ten frames | 1 (forced) | 186 x 30 / 34 / 40; frame cells 11 / 12 / 13 | 7 / 6 / 5 | 7 / 6 / 5 |
| Compare groups, n <= 10 each | 1 (forced) | 186 x 32 / 36 / 40; group boxes 72 wide | 7 / 6 / 5 | 7 / 6 / 5 |
| Compare groups, n <= 5 each | 2 | 93 x 32 / 36 / 40 | 7 / 6 / 5 | 14 / 12 / 10 |
| Number bond | 3 | 62 x 50 / 60 / 68; square-cornered boxes of side 14 / 16 / 20 (design standard RP-60) | 4 / 3 / 3 | 12 / 9 / 9 |
| Function table (6 / 5 / 4 data rows) | 3 | 62 x 98 / 110 / 102 | 2 | 6 |

Trace rows and sequence strips: the column count N sets the trace digit size (PT-COL-2); S / M / L sets only Auto N (10 / 8 / 6) and the instruction size.

| N | Trace cell | Cap height / pt | Rows (total) | Strip box | Strips per page |
|---|---|---|---|---|---|
| 5 | 37.2 x 34 | 20.4 / 80 | 6 (204) | 35.6 x 22 | 8 |
| 6 | 31 x 31 | 18.6 / 73 | 7 (217) | 29.7 x 22 | 8 |
| 7 | 26.6 sq | 16.0 / 63 | 8 (212.6) | 25.4 x 22 | 8 |
| 8 | 23.25 sq | 14.0 / 55 | 9 (209.3) | 22.3 x 22 | 8 |
| 9 | 20.7 sq | 12.4 / 49 | 10 (206.7) | 19.8 sq | 8 |
| 10 | 18.6 sq | 11.2 / 44 | 12 (223.2) | 17.8 sq | 9 |

- **PT-KCT-1.** Arrangement is a per-section choice: scattered (n <= 10 only; jittered slot grid, slot pitch >= object + 2 + 2 x jitter, no overlap), rows of 5, or ten-frame order. Counts 11 to 20 are never scattered.
- **PT-KCT-2.** The fade uses arrangement, not extra ink: Model = ten-frame order with a worked answer; Guided = rows of 5 with a grey trace numeral in the square; Independent = scattered with an empty square.
- **PT-KCT-3.** Content beside or below the label starts at label + 2 (6 / 7 / 8).
- **PT-KCT-4.** Response modes: write in the answer square, or circle one of three numerals printed under the picture (stacked layout). Cut-and-paste numerals belong to the hands-on family (8.3).
- **PT-KCT-5.** Compare at Level K has no middle symbol: each group sits in its own 0.75 pt box and the pupil circles a box. From Level 1 numerals print under the groups and a comparison circle (diameter Hw + 2 = 8 / 10 / 12) sits between them.
- **PT-KCT-6.** Trace rows: cell 1 is a black model digit with a start dot and a numbered stroke arrow; the next round(0.4 x N) cells are trace grey with the start dot; the rest carry the start dot only. Two-digit tracing clamps to N <= 8 at L and N <= 9 at M. Trace digits are dotted outlines when Photocopy-safe.
- **PT-KCT-7.** Objects: plain counters are the default at every Level (age-neutral; design standard RP-20, PT-DLG-15); the 8 pictures (star, apple, fish, car, ball, flower, turtle, block) are the teacher's alternative. One kind per cell.

**Teacher options.** Variant; arrangement; response mode; objects; N for trace rows; sequence step (+1, -1, 2, 5, 10).
**Skill supplies.** `renderCell` (count, compare, bond, trace templates), `footprint`.
**Screen.** Answer squares and bond boxes are numeric inputs (56 px at 375); circle-a-number is a tap ring; trace rows become a finger-trace canvas with the same start dot, or are skipped in timed modes.

### 3.6 Chart and table pages

**Purpose.** One chart carries many items: hundred chart, tally chart, bar graph, pictograph, line plot, function and rule tables.
**Look.** I Can. Charts always use the full width; the Columns control shows the forced note.

```
HUNDRED CHART (1-120) + band            BAR GRAPH + question band
+--+--+--+--+--+--+--+--+--+--+         title line ____________________
| 1| 2|  | 4| 5| 6|  | 8| 9|10|      10 +----+----+----+----+
+--+--+--+--+--+--+--+--+--+--+       9 |    |    |    |    |   cells 15 tall,
|11|  |13| ...                         . |    |    |    |    |   columns <= 36 wide,
| ... 12 rows x 15.3                   1 +----+----+----+----+   axis numerals ON the lines
+-----------------------------+          [pic] [pic] [pic] [pic]
| follow-up band 40           |        +------------------------------+
+-----------------------------+        | question band 40             |
```

| Chart | Geometry | Capacity |
|---|---|---|
| Hundred chart | 10 columns x 18.6; cell height = min(18.6, (body - I - [4 + band]) / rows), minimum 15, else paginate: 1-100 with band 18.4; 1-120 with band 15.3; 1-120 alone 18.6; 1-150 alone 15.2. Digits 16 / 22 / 28 pt, 24 pt cap when any 3-digit number shows. Frame 1.5 pt, interior 0.75 pt. | one chart + a 40 mm band |
| Tally chart | columns 50 (picture and word), 96 (tally), 40 (number); header row 12; row height 22 / 26 / 30 | 9 / 8 / 7 rows; pupil-drawn counts <= 15 |
| Bar graph | 14 gutter + grid up to 172, column width <= 36, cells 15 tall; 10 rows: title 12 + 150 + labels 22 + I 8 = 192, leaving 44 = gap 4 + band 40 | up to 12 rows (222); scale 1, 2, 5 or 10 |
| Pictograph | label column 46 + 10 slots of 14; rows 18; key 14 (always boxed); title 12 | 8 rows (170 + I = 178), 58 left for questions |
| Line plot | 170 line, 11 ticks at 17 pitch; X marks 8 tall, stacks to 8; block 86 | 2 blocks per page (188) |
| Function or rule table | see 3.5; the rule prints in words above the table in Model cells | 6 per page |

- **PT-CHT-1.** Chart cells and table cells are the blanks: no underscores, no inner lines; any write-in cell is at least 12 to 14 mm wide.
- **PT-CHT-2.** Hundred-chart blanks are teacher-set: share (10, 25, 50, 100%) and pattern (random, a row, a column, skip-count multiples). At M and L cells above 99 are not blanked unless the teacher overrides; they print as trace grey instead.
- **PT-CHT-3.** The same graph may be asked about on two days: read-off questions first, compare-and-combine questions second. Questions sit in the band in the skill's cell template, lettered.
- **PT-CHT-4.** Pupils shade bars and draw tallies or X marks; the key and any pre-filled bars use hatch or the flat grey.

**Teacher options.** Chart type; range; blank share and pattern; follow-up band on or off; data source (given, or a tally table on the same page); picture or word labels.
**Skill supplies.** `renderCell` (chart template with `layout: full`), `footprint.factLike = false`, question items for the band.
**Screen.** Chart blanks and table cells are inputs; tally, bar, pictograph and line-plot cells are tap-to-toggle; at 375 px a 10-column chart uses 34.5 x 44 px cells with auto-advance to the next blank.

### 3.7 Word problems

**Purpose.** Apply a computation that is already fluent. Two systems, teacher's choice: **schema-based** (default) or a **keyword-checklist panel**. All stories are original, short, neutral in context; one sentence per line; the question last.
**Look.** I Can. Story boxes are rounded (read containers); answer slots are square.

**v1: one per page, fully scaffolded** (heights at L)

```
+=======================================================================+
| Read the story. Fill in the diagram. Solve.                           |   9
| .-------------------------------------------------------------------. |
| (  Sam has 24 stickers.                                              )|
| (  Lin gives Sam 18 more stickers.                                   )|  56
| (  How many stickers does Sam have now?                              )|  (4 lines; 5 if two-step
| (  Sam has [________] stickers now.      <- unit word pre-printed    )|   + answer row 12)
| '-------------------------------------------------------------------' |
| +-------------------------------------------------------------------+ |
| |  schema diagram to fill:   [ part ] [ part ]                      | |  56+
| |                            [      whole  ?   ]                    | |
| +-------------------------------------------------------------------+ |
| [ ] I know both parts. I add.                                         |  20
| [ ] I know the whole and one part. I subtract.                        |
| +------------------------------------------+ +----------------------+ |
| | [    ] ( ) [    ] = [    ]   equation    | | 5 x 5 work grid      | |  52+
| +------------------------------------------+ +----------------------+ |
+-----------------------------------------------------------------------+
```

| Zone | S | M | L |
|---|---|---|---|
| Story box: pad 3 + up to 5 lines (5.43 / 6.42 / 7.41 each, rounded up: 28 / 33 / 38) + answer row 8 / 10 / 12 + pad 3 | 42 | 49 | 56 |
| Schema diagram zone (minimum) | 40 | 48 | 56 |
| Decision check-box lines, 2 x (check box 5 / 6 / 7 + 3) | 16 | 18 | 20 |
| Equation frame beside a 5 x 5 work grid (squares 6 / 8 / 10) | 32 | 42 | 52 |
| Three gaps of 3 | 9 | 9 | 9 |
| Total against G - 1 = 227 / 227 / 226 | 139 | 166 | 193 |
| Spare, shared equally by the diagram and work zones | 88 | 61 | 33 |

**v2: two per page, faded.** Each cell 186 x 113: story box (as v1, but the answer row is a number blank plus a label blank) 56, gap 3, one open work zone 54 with an equation line; no pre-drawn schema, no check-box lines. Problems are numbered continuously through a set.

**Two-step: one per page.** Story box 56; below it a vertical 1.5 pt rule splits two columns of 91.5, each with a sub-goal label (8), a schema (50), a `Total` blank (12) and a work grid (50); a full-width final answer row (14) closes the page: 56 + 3 + 120 + 3 + 14 = 196 <= 226 (the instruction line is already outside G).

**K picture version.** Story of 15 words or fewer in 3 lines (29), a picture zone with countable line-art objects and "draw lines to show it" space (80 at L), the frame `[__] ( ) [__] = [__]` with 16 / 20 / 24 answer squares and a sign circle (30), and an oral answer line (10): 29 + 3 + 80 + 3 + 30 + 3 + 10 = 158 <= 226 at L, the spare going to the picture zone. One per page at M and L; two per page at S (each cell 113.5: 23 + 3 + 40 + 3 + 22 + 3 + 8 = 102). Compare stories use bottom-aligned stacked object columns.

**Keyword-checklist panel variant.** One per page: it is the v1 page with the schema diagram and the decision check-box lines replaced by the panel (`PEDAGOGY_STANDARD.md` section 8.5). The two-per-page form (v2) never carries the panel. The right 62 mm of the page body is a rounded panel holding the six fixed check box steps of P-WP-14, identical on every page, and nothing else; the left 124 mm holds the story box and the work zone. With fade on, the panel is withdrawn on the last problem of a set.

**Word-problem band** (the form other roles embed: Review, Exit band, Daily Spiral, Mixed): 186 x 76 / 57 / 50 at L / M / S = pad 2 + story (3 lines: 23 / 20 / 17) + 2 + work row (33 / 19 / 17) + 2 + answer row (12 / 10 / 8) + 2. The M band holds the equation frame only; L and S also hold a two-row bar model.

- **PT-WPR-1.** Word problems always print in 1 column. The Columns control shows the forced note; a "Problems per page" control (Auto, 1, 2, 3, 4) takes its place: 1 = v1, two-step, K picture, keyword variant; 2 = v2; 3 = bands at L or M; 4 = bands at M or S.
- **PT-WPR-2.** The variant is picked by measured line count, not word count; a wrapped sentence counts as two lines. Text never shrinks: drop the illustration first, then step down the density.
- **PT-WPR-3.** Reading load caps by Level band: K-1 15 words, 3 sentences; 2-3 25 words, 4 sentences; 4-6 35 words, 4 sentences; multi-step 40 words, 5 sentences; sentence length within P-WP-18 (8 / 10 / 12 words by Level band). Present or simple past tense, one fact per sentence, the name repeated instead of a pronoun.
- **PT-WPR-4.** v1 answer sentence: the blank is `max(24 / 20 / 16, chars x 6 / 5 / 4 + 4)` long and the unit word is pre-printed after it. Equation boxes are `digits x 6 / 5 / 4 + 4` wide, the sign circle Hw + 2. When the frame would squeeze the diagram below 80 mm it takes its own full-width row.
- **PT-WPR-5.** Decision lines are first-person and tie the story's structure to the operation. They are the schema system's alternative to keyword lists.
- **PT-WPR-6.** Key numbers may print bold; they are never boxed (a box reads as a blank). Cue words may be underlined.
- **PT-WPR-7.** A worked Model problem prints in black with every zone filled, unlabelled and unscored; Guided problems carry trace-grey numbers in the diagram; Independent problems are blank.
- **PT-WPR-8.** Score is one point per problem and prints with its denominator like every other sheet ("Score ___/1" on a one-problem page); the teacher can untick it.

**Teacher options.** System (schema or keyword panel); version (v1, v2, two-step, K picture); schema type (part-part-whole, change, compare, equal groups, area or array, elapsed time); unknown position; one illustration on Model problems; key numbers bold; cue words underlined; sentence frame or "Answer:" line; work grid or plain space; sense-check check-box line for Levels 4-6.
**Skill supplies.** `renderCell` (word-problem template: story lines, schema id, equation, answer sentence, unit word), `strings`, `workedSteps` for the Model problem, `variants[]` for unknown positions.
**Screen.** Same zones stacked at 375 (story, picture, diagram, equation, answer). Diagram parts, equation boxes, a Level-aware sign picker (add and subtract only to Level 2) and the answer blank are inputs; decision lines are tap targets; commutative equations are accepted; Hint reads the story aloud.

**The word-work cell (owner ruling 2026-09-25) — every whole-number story, on every page role and
every screen host.** Template `word-work` (`js/modules/sheet/cells/word-work.js`), attached to the
story skills by `js/modules/word-work.js`. Top to bottom: the story (one sentence per line); a SMALL
row of four boxes `+ − × ÷` the pupil circles (taps on screen); the work area of COLUMN BOXES the
pupil writes the story's numbers into — the sign box on the left of the bottom row, a regroup row on
top when that item can regroup, one partial-product row per digit of a 2-digit multiplier, the long
division frame (divisor, bracket, dividend, quotient, two work rows per step, `R [ ]` when there is
a remainder); the answer written ONCE in the bottom row of the columns (the quotient row of ÷), with a label line
beside it and a three-word label bank to copy from (round-4 critic, H8); only a ÷ story whose answer
is not the quotient keeps a separate `Answer: [ ] ______` line. Every item of a page stands on the
skill's tracks, and every + / − item carries the regroup row (structural, empty on the pupil page);
× carries only when a 2-digit number is multiplied by one digit. Stories are retold in one controlled
grammar (`tellStory`; gate `tests/scripts/ws-story-lint.mjs`). Two-step stories draw two blocks, `Step 1` and `Step 2`, each with
its own sign row. Supports, all OFF by default (Support group; share keys 8A–8C): `wpCues` key words
bold + underlined, `wpBank` a keyword bank box, `wpBar` a bar model with blank labels (the ranged
stories keep their own `support: bar`). The cell is measured: a story whose work and answer fit side
by side in a 2-column cell prints 2 columns; a wider one keeps its full-width layout and goes to the
full-width group at the bottom of the page. Key: the ringed sign, every box filled, the answer and
unit. Error analysis shows the story worked with the wrong sign (`wrong-operation`). Instruction
`story-work`: "Circle the sign. Write the numbers in the boxes. Solve."

### 3.8 Blank reusable template

**Purpose.** All structure and no content, so a teacher can write in their own numbers.
**Look.** Inherits the source role.

- **PT-TPL-1.** Any grid role (2.4, 3.1, 3.2, 3.3, 3.7) can print with `ctx.template` (state `blank`): the cell keeps its frame, tracks, regroup boxes, bracket, equation boxes, schema outline and answer slot, and prints no numbers.
- **PT-TPL-2.** The teacher sets the digit count (tracks per operand) and the item count; capacity is the source role's table. Long procedures print 2 to 4 per page.
- **PT-TPL-3.** The tab reads `Template`; labels follow the look; Score prints with the cell count.

**Teacher options.** Source role; digit count; count; supports. **Skill supplies.** `renderCell` with `ctx.template` (default adapter: the blank cell with its numbers hidden). **Screen.** Not offered; templates are paper only.

---

## 4. Fact layouts

Fact layouts are the high-column pages for fact-like skills (`footprint.factLike = true`: single-step facts whose operands and answer fit 3 tracks, up to 12 x 12 = 144). A fact-like skill also works on every other role. A skill that is not fact-like (decimals, remainders, multi-digit) is routed to the Computation grid or Equation drill with a dialog note.

### 4.1 Fact rows, 5 to 10 columns

**Purpose.** Dense daily fact practice in vertical form, 25 to 90 facts per page, readable at every column count from 5 to 10.
**Look.** Daily: 0.75 pt interior rules, 1.5 pt frame and band edges, 1.5 pt sum rule. Facts use 0.72 em tracks and T = 3 in both looks.

Page with Day bands at 10 columns, size M:

```
| Name ________  Date ______                          [Level 2|Addition|Day 1-5]
|                  Add facts to 10
+=======================================================================+
| Add.                                                                  |  8
|[Day 1]                                              Score ____/30     |  8
+------+------+------+------+------+------+------+------+------+------+
|   4  |   7  |   2  |   5  |   3  |   6  |   1  |   8  |   0  |   9  | 26
| + 3  | + 2  | + 6  | + 5  | + 4  | + 1  | + 9  | + 2  | + 7  | + 1  |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
+------+------+------+------+------+------+------+------+------+------+
| ... row 2 ...                                                       | 26
| ... row 3 ...                                                       | 26
+---------------------------------------------------------------------+
                                                              gap 3
|[Day 2]                                              Score ____/30     |  8
| ... 3 rows ...                                                      | 78
+---------------------------------------------------------------------+
```

One cell:

```
<---------- w = 186 / N ---------->
+----+----------------------------+   label box lives in the empty corner over the operator track
|    |       .      1      2      |   top operand; the operator track is always empty on this row
+----+ x     .      1      2      |   operator on the bottom-operand row only
|   ===========================   |   sum rule 1.5 pt, operator track to ones track
|                                 |   answer row = max(0.936 em, Hw); blank on paper, one input on screen
+---------------------------------+   a 3-digit answer's hundreds digit is written under the operator
 pad | op | tens | ones | pad        fact width = 3 x 0.72 em = 2.16 em at every N
```

Geometry. `h = padTop + 2.30 em + 1 + answerRow + 2`, rounded up; padTop = 2 at N = 5 and N >= 8, 3 at N = 6 or 7. `rows = floor((G - 1) / h)` with G - 1 = 227 / 227 / 226; stretch cap 1.3.

| N | w | digit pt (em) | track | fact width (fill) | gap between facts | free corner | h S / M / L | rows S / M / L | facts S / M / L |
|---|---|---|---|---|---|---|---|---|---|
| <= 5 | 37.2 | 28 (9.88) | 7.11 | 21.34 (57%) | 15.9 | 15.0 | 37 / 37 / 38 | 6 / 6 / 5 | 30 / 30 / 25 |
| 6 | 31.0 | 24 (8.47) | 6.10 | 18.29 (59%) | 12.7 | 12.5 | 34 / 34 / 36 | 6 / 6 / 6 | 36 / 36 / 36 |
| 7 | 26.57 | 20 (7.06) | 5.08 | 15.24 (57%) | 11.3 | 10.8 | 29 / 31 / 33 | 7 / 7 / 6 | 49 / 49 / 42 |
| 8 | 23.25 | 18 (6.35) | 4.57 | 13.72 (59%) | 9.5 | 9.3 | 26 / 28 / 30 | 8 / 8 / 7 | 64 / 64 / 56 |
| 9 | 20.67 | 16 (5.65) | 4.06 | 12.19 (59%) | 8.5 | 8.3 | 24 / 26 / 28 | 9 / 8 / 8 | 81 / 72 / 72 |
| 10 | 18.6 | 16 (5.65) | 4.06 | 12.19 (66%) | 6.4 | 7.3 | 24 / 26 / 28 | 9 / 8 / 8 | 90 / 80 / 80 |

Worked row, N = 10 at M: 2 + 12.98 + 1 + 8 + 2 = 25.98 -> 26; floor(227 / 26) = 8 rows; 80 facts; rows stretch to 228 / 8 = 28.5 (<= 1.3 x 26).
At 1 to 4 columns digits stay 28 pt and h = 37 / 37 / 38.

Day bands: band height = strip (7 / 8 / 10) + rowsPerBand x h; bands are separated by 3 mm and never split.

| N | Band, 3 rows, S / M / L | Bands per page S / M / L | Five-day set |
|---|---|---|---|
| 5 | 118 / 119 / 124 | 1 / 1 / 1 | 5 pages (or 2 rows per band: 2 per page) |
| 6 | 109 / 110 / 118 | 2 (221) / 2 (223) / 1 | 3 pages; 5 at L |
| 7 | 94 / 101 / 109 | 2 / 2 / 2 (221) | 3 pages (2 + 2 + 1) |
| 8 | 85 / 92 / 100 | 2 / 2 / 2 | 3 pages |
| 9, 10 | 79 / 86 / 94 | 2 / 2 / 2 | 3 pages; with 2 rows per band, 3 bands fit (M: 3 x 60 + 6 = 186; L: 3 x 66 + 6 = 204), so 2 pages |

- **PT-FRW-1. Columns drive digit size** along the fact ladder (PT-COL-2). S / M / L sets only the answer-row height, label and text sizes, and therefore the rows per page. The dialog's step-down note reports the real digit size.
- **PT-FRW-2. Auto** is 10 / 6 / 5 columns at S / M / L, so Auto never prints digits below the preset size.
- **PT-FRW-3.** Every cell in a section uses T = 3, so ones digits align down the page. Tracks stay 0.72 em in the Daily look too (0.95 em would crowd at 10 columns and merge neighbouring sum rules).
- **PT-FRW-4. Label options** for dense rows (8 to 10 columns), also available at 5 to 7:
  - `Day bands` (default when two or more days are chosen): a black `Day N` tab and a Score write-in per band, no cell labels; the header Score is hidden; numbering, if any, restarts in each band.
  - `Row letters`: one quiet lowercase letter at the left of each row, outside the first cell's fact, in a 6 mm gutter taken from the grid width (design standard CL-21), so a teacher can say "row c, fourth fact".
  - `Every fact numbered`: the standard label in every cell. It fits at every N: the free corner is 7.3 mm at N = 10 and a 4 mm tab plus 1 mm clearance needs 5 (6.6 for a 2-digit tab).
  - A bare black numeral is never used as a label; it would read as part of the sum.
- **PT-FRW-5.** Clamps: answers over 99 (x10 to x12 tables) clamp to 8 columns, because a handwritten 3-digit answer needs about 21 mm. Bracket division facts clamp to 8, wide division to 6. The clamp is read off the **band**, which bounds the answer (`PEDAGOGY_STANDARD.md` P-35), so it never fires on a + or − fact section: those bands stop at 30.
- **PT-FRW-6.** Bracket division is always its own section with its own instruction; the write zone is a thin answer box 12 wide x Hw, right-aligned over the dividend. A mixed-operations vertical section excludes division.
- **PT-FRW-7.** Horizontal facts are a separate section sized by the equation fit function (3.2): in practice at most 4 columns (3 for 2-digit by 2-digit). "Both orientations" prints vertical rows first, then a horizontal block.
- **PT-FRW-8.** Day bands carry no timing by default; the "(1 minute)" tag, Time line and Goal are options (PT-DLG-13).

**Teacher options.** Columns; size; label option; Day bands 1 to 5 and rows per band 1 to 3; "Day 5 repeats Day 1"; single-fact unmixed set (one constant in both positions, including 0 and 1), one family, a cumulative range, or "hard facts"; for + and − the constant 0 to 13 and the band (PT-DLG-30, PT-DLG-31); for × and ÷ the fact range (PT-DLG-28); both orientations; support strip (top form, 10 mm, only at 7 or more columns with a single table); Model cell or grey first row; division notation.
**Skill supplies.** `footprint.factLike`, `renderCell` (fact template), fact-set descriptors (`variants[]`: constant, family, range).
**Screen.** Same cell; digit size = 0.28 x cell width clamped to 24-36 px; 3 / 6 / print columns at 375 / 768 / 1440 (sheet capped at 1100 px); one right-aligned numeric input per cell, Enter moves on; in Day-band mode feedback comes from a per-band Check so a fluency run is not interrupted; Day bands are tabs, one open at a time.

### 4.2 Fact Fluency Probe

**Purpose.** A short daily probe on one fact set (add 7, subtract 8, multiply by 3, divide by 3): 15 vertical plus 5 horizontal facts, with a support strip that fades.
**Look.** Daily: boxed cells, black tabs 1 to 20, Score /20 in the header.

```
| Name ________  Date ______  Score ____/20        [Level 3|Multiply|Probe x3 A]
|                  Multiply by 3
+=======================================================================+
| Multiply.                                                             |  9
+####+-------+####+-------+####+-------+####+-------+####+-------+   .------.
|# 1#    2   |# 2#    9   |# 3#    5   |# 4#    0   |# 5#    4   |   (   3  )
+####+ x 3   +####+ x 3   +####+ x 3   +####+ x 3   +####+ x 3   | 49(   6  )
|      ---   |      ---   |      ---   |      ---   |      ---   |   (   9  )
+------------+------------+------------+------------+------------+   (  12  )
|# 6# ...                                            |#10# ...    | 49(  ..  )
|#11# ...                                            |#15# ...    | 49(  30  )
+------------+------------+------------+------------+------------+   '------'
                                                          gap 6     support strip:
+####+------------------------+####+------------------------+        rounded, 1.5 pt,
|#16#   7 x 3 = ________      |#17#   5 x 3 = ________      |   24   anchored to the
|#18#   ...                   |#19#   ...                   |   24   grid top
|#20#   8 x 3 = ________      |  (unruled remainder)        |   24
+-----------------------------+-----------------------------+
```

Geometry (one section, one instruction). Grid width W = 186 - strip - 4: strip 10 / 10 / 12 wide for 2-digit entries (W = 172 / 172 / 170), 14 / 14 / 16 for 3-digit entries (W = 168 / 168 / 166). Height budget = 236 - I - 6 (block gap) - 1.

| C | Vertical + horizontal | Digits (ladder) | Cell w at W = 170 | hMin at L | Row used at L | Page total at L |
|---|---|---|---|---|---|---|
| 5 (Auto) | 15 + 5 | 28 pt | 34.0 | 38 | min(1.3 x 38, (220 - 72) / 3) = 49 | 9 + 147 + 6 + 72 = 234 |
| 6 | 12 + 8 | 24 pt | 28.3 | 36 | min(46.8, (220 - 96) / 2) = 46 | 9 + 92 + 6 + 96 = 203 |
| 7 | 14 + 6 | 20 pt | 24.3 | 33 | 42 | 9 + 84 + 6 + 72 = 171 |
| 8 | fills the page: 8 x 7 = 56 vertical | 18 pt | 21.25 | 30 | 226 / 7 = 32.3 | 235 |
| 9 | fills the page: 9 x 8 = 72 | 16 pt | 18.9 | 28 | 28.25 | 235 |
| 10 | fills the page: 10 x 8 = 80 | 16 pt | 17.0 | 28 | 28.25 | 235 |

Horizontal block: 2 columns, row 16 / 20 / 24; its digits follow the equation fit (28 pt label-beside at L: 59.2 <= 84.4). At C = 5, sizes S and M use vertical rows of 48 (1.3 x 37) and totals of 206 and 218.

- **PT-FPR-1.** Auto is always 5 columns; a choice of 1 to 4 becomes 5 with a note. At 8 to 10 columns the probe fills the page with vertical facts (the Fact rows grid with the probe's header, strip and forms) and Score becomes /N; a "Keep 20" switch restores 16 + 4 or 20 + 0.
- **PT-FPR-2.** The set's constant is always the second (bottom) operand unless "turn-around facts" is checked. The other operand is drawn so the answer stays inside the band (PT-FPR-12), never from the band itself. Every fact of the set appears at least once across the probe; the horizontal block repeats the hardest facts; no identical fact sits in adjacent cells.
- **PT-FPR-3. Support strips per operation.** Multiply and divide: the skip-count list k to 12k (to 10k when the fact range is limited to 10, PT-FPR-11), side form, numerals Andika 700 at 11 / 13 / 15 pt, pitch 8 / 9 / 10.5. Add and subtract: a vertical number track from the largest value the page can reach down to 0, multiples of 5 bold, capped at **20 entries** (add 7 at band 20: the largest sum is 20, so the track runs 20 down to 1, 20 x 10.5 + 6 = 216 <= 226 at L). The cap is what the band ruling forces: a 0-to-30 track would need 31 entries and does not fit at any pitch, so at bands above 20 the track starts at the largest value on the page and stops 19 below it, and the dialog says so. If a shorter track is still taller than the grid, use the next smaller pitch. The strip is switched off for the x0 set. Fade: `Full`, `Grey`, `Off`; for multiplication and division these are cue parts 1, 2 and 3 (PT-FPR-10). There is no write-in strip on a probe.
- **PT-FPR-4. Cue-fade parts** (addition and subtraction sets; item order identical in Parts 1 to 3):

| Part | Cue printed | Pupil action |
|---|---|---|
| 1 | a dot tile beside the smaller numeral; cell 1 shows a dotted ring round the bigger number as the model | circle the bigger number, count on from it with the dots |
| 2 | no tile; cell 1 keeps the dotted ring | circle the bigger number |
| 3 | none | answer |
| 4 | none; facts are mixed with earlier sets (cumulative) | answer |

- **PT-FPR-5. Cue styles for addition and subtraction sets** (both are options; neither is offered for multiplication or division, PT-FPR-10): `Dot tile` (default): a rounded tile, side max(6, 0.62 em), 0.75 pt outline, solid dots in dice patterns for 1 to 6 and two-row ten-frame patterns for 7 to 9 (design standard SF-30), placed 2 to the right of the smaller numeral inside the column gap; the widened fact block (fact + 1.5 + tile) is centred and the tile slot stays reserved in Parts 2 and 3 so positions never move between parts. `Dots on the numeral` (toggle): MathQuest's own dots drawn on the strokes of the smaller numeral, no tile. The tile is offered at 7 columns or fewer; dots on the numeral need 24 pt digits, so 6 columns or fewer. At 8 to 10 columns the probe prints without a cue (parts 3 and 4 only). The cue part is named in the teacher footer, never in the pupil area.
- **PT-FPR-6. Division probes.** Horizontal form: 3 columns x 7 rows (20 facts and one unruled slot), label above, 24 pt at L (52.7 <= 54.7 with the strip), row 226 / 7 = 32. Sets 10 to 12 fall below the L ladder floor in 3 columns, so they print in 2 columns x 10 rows (pitch 22.6). With the think box on (PT-FPR-7): 3 columns x 6 rows = 18 facts, row 226 / 6 = 37.7, Score /18; sets 10 to 12 print 2 columns x 6 rows = 12 facts (floor(226 / 30) - 1), row 37.7, Score /12. Bracket form: the vertical grid at 5 columns with a quotient zone at least Hw tall above the bracket.
- **PT-FPR-7. Think box** (division only): an optional helper above each fact for the related multiplication fact. Off by default. When on it is flat grey, 1 pt, rounded, at least 24 wide x (Hw + 4) tall with a grey multiplication sign at its centre, and the row pitch becomes 20 / 24 / 30. **When the think box is on, the page drops one row** (owner ruling 2026-09-19): rows = floor(G / pitch) - 1, the freed height is shared equally among the remaining rows and sits below the answer line, and the box and fact stay anchored at the top of the cell, so the fact stays in the top half of its cell and the top-half rule (design standard CL-4) is never broken. Capacity this implies:

| Page | Think box off | Think box on |
|---|---|---|
| Division probe, horizontal form, L | 3 x 7 = 20 facts + one unruled slot, Score /20 | 3 x 6 = 18 facts, Score /18 |
| Division probe, sets 10 to 12, L | 2 x 10 = 20 facts, Score /20 | 2 x 6 = 12 facts, Score /12 |
| Equation drill, rows at S / M / L | 19 / 16 / 12 (label beside) or 16 / 13 / 11 (label above) | 10 / 8 / 6 |

  Every fact of the set still appears at least once (PT-FPR-2); the repeats of the hardest facts are what the dropped row removes. The black answer line is the only place an answer goes. A Model cell shows the box filled in.
- **PT-FPR-8. Forms.** Form B (C, D) holds Form A's facts in a seeded re-order (seed = set + form). "Strip on" and "strip off" versions keep identical rows and order.
- **PT-FPR-10. Multiplication and division cue** (owner ruling 2026-09-19). The teacher chooses per print: `Skip-count strip` (default; the side strip of PT-FPR-3), `Array tile`, or `None`. The dot tile and dots on the numeral stay with + and − only. The array tile is a rounded tile in the dot tile's slot showing the fact as an array of solid dots, the set's constant in each row (design standard SF-33); it is offered only at **5 columns or fewer** and is disabled with its reason when a fact of the set cannot be drawn at the 1.5 mm minimum dot pitch. Fade ladder, item order identical in parts 1 to 3:

| Part | Cue printed | Pupil action |
|---|---|---|
| 1 | full skip-count strip (or the array tile in black) | count by k on the strip, answer |
| 2 | grey strip (or the tile in grey) | answer; glance at the strip only when stuck |
| 3 | none; the grid keeps its narrowed width so no digit moves | answer |
| 4 | none; facts are mixed with earlier sets (cumulative) | answer |

- **PT-FPR-11. Fact range and set order** (owner ruling 2026-09-19). Multiplication and division facts run to 12 by default; `Limit to 10` is an option (CCSS 3.OA.C.7 asks only for one-digit factors) that drops the 11 and 12 sets, the 11k and 12k strip entries and every fact with a factor above 10. The set picker lists × ÷ sets in teaching order: {0, 1, 2, 5, 10}, {3, 4, 6}, {7, 8, 9}, {11, 12}; for + and − the 0 set is listed last (pedagogy P-FL-18, P-FL-19). At L the 12-entry strip is 12 x 10.5 + 6 = 132, inside the 147 of the three vertical rows.
- **PT-FPR-12. + and − fact constant and band** (owner ruling 2026-09-19). Both are options **of the skill**, not of this page: the probe prints whatever the configured skill carries, and the same configuration prints on the Opener, the Independent page and Test A / B. An addition or subtraction probe practises one **constant, 0 to 13** ("Add 6", "Subtract 2"), or a range of constants, or all of them (mixed / cumulative, cue part 4). Separately it carries a **band** that caps the sum (for +) or the minuend (for −): to 30 by default, narrowable to 20, 18, 12 or 10. The two are independent, so "Add 6" at band 20 draws the other addend from 0 to 14. The set picker lists the constants 1 to 10, then 11 to 13, then 0 last (pedagogy P-FL-18, P-FL-20). A constant the band cannot host is disabled with its reason, never quietly widened. × and ÷ keep the factor limit of PT-FPR-11 instead of a band.
- **PT-FPR-9. Half-page 2-up**: two half-page probes side by side on a landscape sheet, a dashed cut line down the centre with 3 mm clear each side, Form A left and Form B right. Nothing is scaled: each half is laid out by the engine at size S or M with the half's live width (133.5 on A4) as its available width, so writing height stays 6 or 8, text keeps its size-table values, and the fact digits take the largest ladder step that fits the half (20 pt at 5 columns). Size L is not offered on a half page. The job injects one landscape page rule; it never mixes orientations.

**Teacher options.** Operation and set; for + and − the constant (0 to 13, a range, or all) and the band (to 30, 20, 18, 12 or 10); for × and ÷ the fact range (to 12, or limit to 10); columns; size; form; strip fade; cue part and cue style (+ and −: dot tile, dots on the numeral, off; × and ÷: skip-count strip, array tile, none); think box (drops one row); division notation; turn-around facts; Keep 20; half page; timing extras.
**Skill supplies.** `footprint.factLike`, fact-set descriptor, `renderCell` (fact and equation templates), strip entries (derived from the set).
**Screen.** The timed activity: same cells, 2 columns at 375 (strip folds into a row behind Hint), 5 columns with a sticky strip at 768, capped at 960 px at 1440. Feedback on Check; the header Score fills itself in; timer optional.

### 4.3 Fact-family Intro, Warm-up and Probe

**Purpose.** Introduce two or three fact families without error, rehearse them aloud, then probe only those facts.
**Look.** Intro and Warm-up: I Can, no labels, no Score. Probe: Daily, Score /40.

```
INTRO (answers shown, read aloud)           WARM-UP (no answers, no writing)
 .--------------.                           families: (3, 4, 7)  (2, 6, 8)  ...
 (  3    4    7  )   the family, rounded     .--------. .--------. .--------. .--------.
 '--------------'                            ( 3 + 4  ) ( 4 + 3  ) ( 7 - 3  ) ( 7 - 4  )
+---------+---------+---------+---------+    '--------' '--------' '--------' '--------'
|    3    |    4    |    7    |    7    |    ... one family per row, 8 to 10 rows ...
|  + 4    |  + 3    |  - 3    |  - 4    |
|  ---    |  ---    |  ---    |  ---    |   PROBE A-D: Fact rows grid (4.1), 8 x 5 = 40,
|    7    |    7    |    4    |    3    |   only these families, forms A to D seeded
+---------+---------+---------+---------+
```

| Page | Geometry | Capacity |
|---|---|---|
| Intro | family band = family box 22 + gap 3 + one row of four answered facts (28 pt, h 38) + pad 6 = 69; I + 3 x 69 = 216 <= 232 | 2 or 3 families; a doubles family shows 2 facts |
| Warm-up | row pitch = 227 / rows; four rounded cards 40 x 18 per row, facts at 22 pt with no "=" and no blank | 8 to 10 families (10 rows x 22.7) |
| Probe | Fact rows at 8 columns x 5 rows (18 pt; h 26 / 28 / 30, stretched to at most 1.3 x h) or 10 x 4 | 40; at 5 columns only 30 / 30 / 25 fit, so the rest paginates (dialog note) |

- **PT-FFM-1.** Intro facts print complete, in black; the pupil reads them aloud. Nothing is written.
- **PT-FFM-2.** The Warm-up lists its families under the title. Cards are rounded (read containers).
- **PT-FFM-3.** A cumulative family probe (all families so far) precedes each new family set.

**Teacher options.** Families; operation pair; form A to D; columns for the probe. **Skill supplies.** Family descriptors; `renderCell` with `state: answered` for the Intro. **Screen.** Intro = tap-through cards with read-aloud; Warm-up = flashcard mode without input; Probe = 4.2's timed activity.

### 4.4 Practice strips

**Purpose.** A warm-up or exit slip: two strips per sheet, cut apart, 10 or 11 facts each.
**Look.** Daily. Items lettered `a.` to `k.` in every look (a strip is handed out alone).

```
+---------------------------------+ : +---------------------------------+
| Name ____________     [ x 3 ]   | : | Name ____________     [ x 3 ]   |  14
| a.   3 x 3 = [      ]           | : | a.   7 x 3 = [      ]           |
| b.   5 x 3 = [      ]           | : | b.   2 x 3 = [      ]           |  11 rows,
| ...                             | : | ...                             |  pitch 21.4
| k.   9 x 3 = [      ]           | : | k.   4 x 3 = [      ]           |
| Score ____/11         Strip A   | : | Score ____/11         Strip B   |  12
+---------------------------------+ : +---------------------------------+
  90 wide                     dashed cut line, 3 mm clear each side
```

- **PT-STR-1.** No page header prints; the body is 262 tall and each strip carries a 14 mm mini header and a 12 mm Score row: pitch = (262 - 14 - 12 - 1) / 11 = 21.4 (L needs 18).
- **PT-STR-2.** Answer boxes align in one column at the right of the strip (an answer ladder), B(n) wide x Hw tall. At L a class F fact needs 59.2 <= 89.4.
- **PT-STR-3.** The centre line is dashed because it is cut. Nothing else on the page is dashed.
- **PT-STR-4.** Variants: facts in order, facts mixed, or "pick a factor" (the constant is a blank box the pupil or teacher fills).

**Teacher options.** Set; variant; 10 or 11 items; same or different strips left and right. **Skill supplies.** As 4.1. **Screen.** A 10-item sprint in the fact widget; feedback on Check.

### 4.5 Cumulative fact review

**Purpose.** After a run of fact sets, review the whole range in both orientations.
**Look.** Daily, numbered, Score /40 or /20.

```
+=======================================================================+
| Add.                                                                  |   9
| 8 columns x 3 rows of vertical facts (18 pt)                 24 facts | 3 x 39
|                                                              gap 6    |
| 4 columns x 4 rows of horizontal facts (22 pt, label above)  16 facts | 4 x 25.75
+-----------------------------------------------------------------------+
```

- **PT-CFR-1.** Long form: 24 vertical + 16 horizontal. At L: 9 + 117 + 6 + 103 = 235 (vertical rows 1.3 x 30 = 39; horizontal pitch (220 - 117) / 4 = 25.75 <= 2.0 x 20). Short form: 16 vertical (8 x 2) + 4 horizontal (4 x 1).
- **PT-CFR-2.** The title names the range of constants in the Review form ("Review: adding 0 to 7"), and its bracketed constraint names the band when that is not the skill's default ("Review: adding 0 to 7 (sums to 20)"). Facts are drawn evenly from every set in the range, and every answer stays inside the band. No supports.

**Teacher options.** Range of constants; band; long or short form; columns. **Skill supplies.** As 4.1. **Screen.** Mixed fact review, feedback on Check.

---

## 5. Review roles

### 5.1 Daily Spiral Review

**Purpose.** The same skeleton every day: a computation block, a word problem and six short sections, in fixed positions, reusing the exact lesson cells reduced to 2 to 4 items. A taught step enters the spiral the next day.
**Look.** Daily. Every answerable item carries a black number tab, numbered 1 to N through the whole sheet. Section titles are plain bold sentence case (no decorative lettering, no clip-art, no black title tabs).

Two-page spread (default; prints duplex):

```
PAGE 1                                        PAGE 2 (12 mm header, body 250)
| Name ____ Date ____ Score ___/28  [Week 1-Day 3]   | Name ____            [Week 1-Day 3]
|        Daily review                                +====================================+
+==================================================+ | Word problem  Solve.               | 52
| Computation  Add.                                | | [9] story ...      | work box 60   |
+####+-----------+####+-----------+----------------+ +=================+==================+
|# 1#            |# 2#            | .------------. | | Time            | Fractions        | 64
|                |                | ( Remember:  ) | | [10]   [11]     | [12] [13]        |
|                |                | ( steps or   ) | |                 | [14] [15]        |
|                |                | ( rule box   ) | +=================+==================+
+####+-----------+####+-----------+####+-----------+ | Money           | Puzzles          | 77
|# 3#            |# 4#            |# 5#            | | [16]   [17]     | [18] [19]        |
+####+-----------+####+-----------+####+-----------+ |                 | [20] [21]        |
|# 6#            |# 7#            |# 8#            | +=================+==================+
+----------------+----------------+----------------+ | Rounding        | Patterns         | 57
  3 x 3 cells of 62 x 76; slot 3 is the reference box | [22]-[25]       | [26]-[28]        |
```

Compact one page (S and M only): strip 6 + 2 rows of four 46.5 x 38 cells (76) + word problem 34 + Time|Fractions 46 + Money|Puzzles 42 + Rounding|Patterns 32 = 236.

| Variant | Computation grid | Cell | Max tracks S / M / L | Items |
|---|---|---|---|---|
| Spread, 3 columns (default) | 3 x 3, slot 3 = reference box | 62 x 76.67 (76 at L) | 8 / 7 / 5 | 8 + 20 = 28 |
| Spread, 2 columns (add, subtract, decimals only) | 2 x 4 | 93 x 57.5 | 8 / 8 / 9 | 28 |
| Spread, tall cells (long division, multi-row multiply) | 4 x 2 | 46.5 x 115 | 7 / 5 / 4 | 28 |
| Compact one page, S and M | 4 x 2 | 46.5 x 38 | 7 / 5 / - | 8 + 12 = 20 |

| Page-2 section (spread) | Height | Interior at L (height - 14) | Holds |
|---|---|---|---|
| Word problem | 52 | 38 | one word-problem band, up to 30 words in 4 lines; work box 60 wide |
| Time, Fractions | 64 | 50 | two 38 mm clocks with two-box answers (read the time to the hour, half hour or 5 minutes only, PT-VIS-2); four fraction models in 23.5 mm rows |
| Money, Puzzles | 77 | 63 | two generic-coin rows of 24 at scale 0.8 (<= 4 coins each); four chart-fragment puzzles with 13 x 10 boxes |
| Rounding, Patterns | 57 | 43 | four rounding items (number line 8 + answer 10 per row); three pattern rows at 13.5 pitch with 12-wide boxes |
| Total | 250 | | 1 + 2 + 4 + 2 + 4 + 4 + 3 = 20 |

Slot map (positions never move; the binding changes by Level band; any slot can be rebound by the teacher to any skill whose footprint fits the slot):

| Slot | Level K-1 | Level 2-3 | Level 4-5 |
|---|---|---|---|
| Computation | add and subtract within 20 | 2- and 3-digit add and subtract with regrouping, multiplication facts | multi-digit multiply, bracket division, decimal add and subtract |
| Word problem | add-to and take-from with a picture | one- and two-step | multi-step, fractions and decimals |
| Time | hour and half hour | to 5 minutes (1-minute reading and draw the hands need a full-width panel, PT-VIS-2) | elapsed time (two clocks read to 5 minutes) |
| Fractions | equal parts, halves and fourths | shade or name a fraction | equivalent, compare, mixed numbers |
| Rounding | rebinds to Compare (circle the greater) | nearest 10 and 100 | any place, decimals |
| Money | like generic coins | mixed coins to 100 | amounts and change |
| Patterns | count by 1, 2, 5, 10 | 3s, 4s, 100s from any start | rule tables, decimals |
| Puzzles | one more and one less, to 50 | +/- 1 and 10, to 120 or 1,000 | missing factor, fact family |

- **PT-DSR-1.** The spread is the default and the only variant at L. The compact page is opt-in at S and M, scored /20, and carries no multi-row multiplication, no long division, clocks to 5 minutes only and one coin group.
- **PT-DSR-2.** A slot with nothing taught yet rebinds to its prerequisite skill and retitles itself; it is never left blank.
- **PT-DSR-3.** Half-width section titles are at most 9 characters and their instructions at most 20, so title and instruction share one line inside 87 mm. Titles sit under a 2.25 pt rule.
- **PT-DSR-4.** Slot 3 of the 3 x 3 grid is a rounded reference box built from the day's computation skill (`strings.rule` or up to 3 `workedSteps`); the teacher may choose a ninth problem instead (Score /29).
- **PT-DSR-5.** On tall-procedure days the sheet keeps 8 cells by switching page 1 to the tall 4 x 2 variant; a problem too wide for it steps the section down one size with a dialog note. On width overflow the 2-column variant is used only if block height + 3 fits 57.5; on height overflow the sheet never widens.
- **PT-DSR-6.** Seed = (Level band, week, day); the footer carries the code. The same graph or data set may serve two days with different questions.
- **PT-DSR-7.** The word-problem slot uses the schema band; its scaffolds fade across the week.

**Teacher options.** Spread or compact; Level band; slot rebinding; one operation per day or mixed; regroup boxes or place-value letters (both only on the spread); reference box or ninth problem; Today's Number thread (replaces the Puzzles slot with a band from 5.3).
**Skill supplies.** `renderCell` at level 1 with `ctx.compact` for half-width slots, `footprint`, `strings.rule`.
**Screen.** Mixed review mode: one slot active at a time in slot order; computation 2 x 4 at 375 px (one per view when tracks would fall under 44 px), 2 across at 768, 3 to 4 across at 1440; feedback per section on Check; Hint on request (PT-SCR-6).

### 5.2 Mixed Skill Practice

**Purpose.** Any set of skills, in any proportions, on one ruled rectangle where every vertical rule lands on a shared unit lattice.
**Look.** Daily by default (I Can available). Default arrangement GROUPED.

```
GROUPED (default): one shelf per skill             SHUFFLED: strips two units high, built from 2 x 2 blocks
+=============================================+     +---------------+---------------+---------------+
| Addition  Add.                              |     |[1]            |[2] 2 5 2      |[5]            |
| [1]          | [2]          | [3]           |     |   ( clock )   |  + 2 4 7      |   ( clock )   |
+=============================================+     |               +---------------+               |
| Time  Write the time.                       |     |               |[3] fraction   |               |
| [4] (clock)  | [5] (clock)  | [6] (clock)   |     |   [  ]:[  ]   |    of a set   |   [  ]:[  ]   |
+=============================================+     +---------------+---------------+---------------+
| Fractions  Shade the fraction.              |     | ... second strip ...                          |
| [7]          | [8]          | [9]           |     +-----------------------------------------------+
+=============================================+     |[10] word-problem band closes the page          |
| Word problem  Solve.                        |     +-----------------------------------------------+
| [10] story ...            | work box        |      numbering: by strip, then block left to right,
+---------------------------------------------+      then top to bottom inside the block
```

Unit grid. The page is N units wide; unit width = 186 / N. A template's `footprint.span` is `w x h` in units: vertical fact 1 x 1; 3- to 6-digit stack 2 x 1 (1 x 1 in a Daily L unit of 46.5 for 3 digits); horizontal equation 2 or 3 x 1; clock or other medium visual 2 x 2; fraction of a set 2 x 1; number line 3 or 4 x 1; word problem N x 1 (N x 2 when the story exceeds 3 lines at L, 2 lines at M and S).

| | S | M | L |
|---|---|---|---|
| Auto N on a mixed sheet, I Can / Daily | 10 / 8 | 8 / 6 | 6 / 4 |
| Unit width, I Can / Daily | 18.6 / 23.25 | 23.25 / 31.0 | 31.0 / 46.5 |
| Fixed stack of a 2-row problem (top pad 3 + 2 digit rows + rule 1) | 16.98 | 21.85 | 26.72 |
| Unit height minimum U_min = stack + answer zone + 2 (at L the answer zone + 2 must be >= 35% of U) | 24.98 | 31.85 | 41.1 |
| Tall U_min, one scaffold / both | 29.98 / 33.98 | 37.85 / 41.85 | 48.1 / 53.1 |
| SHUFFLED rows and U = (236 - I - 1) / rows | 9 rows, 25.2 | 7 rows, 32.4 | 5 rows, 45.2 |
| Shelf minimum heights: fact or stack / clock (dial) / number line / word problem | 25 / 48 (30) / 27 / 25 | 31.85 / 61 (38) / 34 / 31.85 | 41.1 / 74 (46) / 44 / 41.1 |
| Facts-only capacity, I Can / Daily | 90 / 72 | 56 / 42 | 30 / 25 |

- **PT-MIX-1. Lattice.** Every vertical rule sits on a unit line. A shelf of span-s templates holds k cells, k = the largest divisor of N that is <= floor(N / s), each 186 / k wide.
- **PT-MIX-2.** Mixed sheets accept N in {1, 2, 3, 4, 6, 8, 10}. N = 5, 7 or 9 steps down by one with the forced note, unless every skill is 1 x 1. Size wins: N above the size's maximum clamps ("L fits 6 columns. Using 6.").
- **PT-MIX-3. One track width per sheet**, set by the look, for every stacked cell.
- **PT-MIX-4. GROUPED packing.** Each skill gets one shelf first; further shelves go to the skill with the largest gap between its target share and its achieved share, while they fit. Each shelf uses its own template's minimum height; spare height is shared equally into the answer zones. Each shelf opens with a band strip (bold skill title plus one instruction).
- **PT-MIX-5. SHUFFLED packing.** The page is strips two units high made of 2 x 2 blocks. A block holds one 2 x 2, two 2 x 1, one 2 x 1 plus two 1 x 1, or four 1 x 1. A 4 x 1 spans half of two adjacent blocks. A leftover single row takes height-1 templates. Word-problem bands close the page. Residue is filled from the highest-weight small skill. One sheet instruction (the library string `default-solve`, "Solve."); non-computation cells carry a cue beside the label at cell-text size, no wider than cell width - label - 5.
- **PT-MIX-6.** Skills are dealt by weighted round-robin; in SHUFFLED, runs of the same skill are 2 or fewer.
- **PT-MIX-7.** Numbering: GROUPED row-major; SHUFFLED by strip, block, then inside the block. No in-cell skill letter prints (it would read as multiple choice); the skill-to-item map lives on the answer key and the footer lists plain CCSS codes.
- **PT-MIX-8.** The dialog shows achieved against requested percentages, and the cells across for each skill ("3-digit sums: 3 across"), before printing.
- **PT-MIX-9.** A shelf or strip never splits; too many tall skills spill to page 2 with weights re-solved across both pages.

Worked packing example: requested mix 40 / 30 / 20 / 10 (3-digit addition / clocks / fraction of a set / word problem), I Can look.

| Sheet | Layout and arithmetic | Problems | Achieved mix |
|---|---|---|---|
| L, N = 6, SHUFFLED | 2 strips x 3 blocks: 3 clock blocks + 3 stacked blocks (4 sums + 2 fraction cells), then a word-problem row: 9 + 5 x 45.2 = 235 | 4 + 3 + 2 + 1 = 10 | 40 / 30 / 20 / 10 |
| L, N = 6, GROUPED | k = 3 on every shelf: strips 4 x 8 = 32, shelves 41.1 + 74 + 41.1 + 41.1 = 197.3; total 229.3 <= 235, 1.4 extra per shelf | 3 + 3 + 3 + 1 = 10 | 30 / 30 / 30 / 10 |
| M, N = 8, GROUPED | strips 4 x 6 = 24; sums 2 x 31.85, clocks 61, fractions 31.85, word problem 31.85 = 188.4; total 212.4, 4.5 extra per shelf | 8 + 4 + 4 + 1 = 17 | 47 / 24 / 24 / 6 |
| M, N = 8, SHUFFLED | 3 strips and a word-problem row: 8 + 7 x 32.4 = 235 | 7 + 5 + 3 + 2 = 17 | 41 / 29 / 18 / 12 |

**Teacher options.** Skills and weights (counted in problems); arrangement; look; columns N; size; regroup boxes and place-value letters (switch the sheet to tall units); Model cell per shelf (GROUPED, off by default on review sheets); cue key strip (SHUFFLED, off by default, costs a row); discrimination items ("cross out the ones you cannot work").
**Skill supplies.** `footprint.span` per look and size, `renderCell` level 1, `strings.instruction` and a short cue.
**Screen.** One routine at every width: the sheet is an overview whose whole cells are the targets (at least 117 px); a tap opens the focus cell scaled so a track is at least 44 px. 375 px: one cell per view with Next. Hint sits top-right of the focus cell.

### 5.3 Today's Number

**Purpose.** One number threaded through every representation, on an identical layout every day. Two-sided. Ranges to 20, to 120, to 1,000 and to 10,000 and beyond; versions A to D.
**Look.** Daily; bands numbered with black tabs 1 to 6 on side 1 and onward on side 2.

```
SIDE 1                                                    SIDE 2 (12 mm header, body 250)
| Name ____ Date ____ Score ___/N   [Level 2|to 120 - B]  +==================================+
|              Today's Number                             | [7] Write the missing numbers.   |
+=======================================================+ | +--+--+--+--+--+--+--+--+--+--+  |
|[1] .------.  Count on from 47. Count back from 47.    | | | 1| 2| 3|  ... 1 to 120 chart  |
|    (  47  )  Word form:  forty-seven  (trace / circle)| | | targeted blanks round today's |
+=======================================================+ | | number; rows 15.3 tall        |
|[2]  Tens | Ones      circle the blocks that show it   | | +--+--+--+--+--+--+--+--+--+--+  |
+=======================================================+ +==================================+
|[3]  ____ + ____            expanded form              | | [8]-[10] follow-up band, 40 mm   |
+=======================================================+ +----------------------------------+
|[4]  compare with a stacking grid:  47 ( ) 52          |
+=======================================================+
|[5]  hops:  [-10] [-1]  47  [+1] [+10]                 |
+=======================================================+
|[6]  nearest ten:  number line 40 ------- 50           |
+-------------------------------------------------------+
  six equal bands of (236 - 1) / 6 = 39.1
```

| Range (Level) | Side 1 bands 2 to 6 | Side 2 |
|---|---|---|
| to 20 (K-1) | double ten frame (draw counters); number bond two ways; one more and one less on a track piece; compare (circle the bigger; symbols from version C); make it: `__ + __` | number track 0 to 20 with blanks; three trace rows; two count cells |
| to 120 (1-2) | tens and ones chart with a circle-the-blocks bank; expanded form; compare with a stacking grid; hops -10, -1, +1, +10; nearest ten on a number line (versions C and D; A and B: count-by strip) | 120 chart with targeted blanks (18.6 x 15.3) and a 40 mm follow-up band |
| to 1,000 (2-3) | H T O chart and blocks bank; expanded form; compare; round to the nearest 10 and 100 (target letter bold); hops +/- 1, 10, 100 | open number line between hundreds; four chart-fragment puzzles (boxes 13 x 10); add and subtract 10 and 100 table |
| 10,000 and beyond (4-5) | place-value chart with the comma pre-printed; expanded form; compare with a stacking grid; round to each place (table); hops +/- 1 to 1,000 | number line between benchmarks; 10 times and one tenth of (Level 5); word form circled from a bank |

- **PT-TDN-1.** Band 1 is fixed: the number in a rounded box at trace-tier size, an oral counting prompt, and the word form. Word form is traced (A), circled from a closed bank (B, C) or written with a first-letter cue (D); pupils never compose sentences.
- **PT-TDN-2.** Side 1 is six equal bands (39.1 tall) at every size; each band is a full-width cell with a tab, one instruction at cell-text size on its first line and a work area of at least 28. Within a version the layout never changes from day to day; only the number changes.
- **PT-TDN-3. Versions A to D** are a support progression over one fixed band set per range, not harder numbers (`PEDAGOGY_STANDARD.md` P-RV-16): A = the first task of each kind traced, captions on, representations drawn for the pupil (first digit grey, filled example hop); B = no trace, captions on; C = captions off, the pupil draws the representation, comparison symbols replace circle-the-bigger; D = the most abstract form of every task, with the later tasks switched on (rounding, ordering, and reverse tasks: given the expanded form or the blocks, write the number).
- **PT-TDN-4.** The number range slides (for example 35 to 45) and is set by the teacher; the tab shows range and version. Seed = (range, version, day).
- **PT-TDN-5.** Side 2's chart follows 3.6; on side 2 the body is 250: I 9 + chart 12 x 15.3 (183.6) + gap 4 + band 40 = 236.6 <= 249.

**Teacher options.** Range; version; sliding window; which side(s); objects for the to-20 range; rounding on or off.
**Skill supplies.** Today's Number is a composer over existing place-value, comparing, rounding and counting skills; each band calls that skill's `renderCell` with the day's number injected (`opts.value`) and `ctx.compact`.
**Screen.** A daily routine card set: one band per card in the same order, inputs for blanks, tap-to-circle blocks, number-line tap; feedback on Check per band.

### 5.4 Daily 4

**Purpose.** Four boxed retrieval questions a day, from four distances: last lesson, last week, last unit, last year. Five days on a page. MathQuest generates every question.
**Look.** Daily: heavier grid, black number tabs 1 to 4 restarting each day, a black `Day N` tab and a Score /4 per band.

```
| Name ________  Date ______                            [Level 3|Week 12]
|                  Daily 4
+=======================================================================+
| Solve.                  last lesson | last week | last unit | last year |  8
|[Day 1]                                              Score ____/4      |  8
+####+------------+####+------------+####+------------+####+------------+
|# 1#             |# 2#             |# 3#             |# 4#             | 35
+-----------------+-----------------+-----------------+-----------------+
                                                                gap 3
|[Day 2]                                              Score ____/4      |
| ...                                                                   |
|[Day 5] ...                                                            |
+-----------------------------------------------------------------------+
```

| | S | M | L |
|---|---|---|---|
| Band pitch, 5 days = (236 - I - 1 - 4 x 3) / 5 | 43.0 | 43.0 | 42.8 |
| Cell = pitch - Day strip (7 / 8 / 10); width 46.5 | 36.0 | 35.0 | 32.8 |
| What fits a 5-day cell | any compact equation; S stack (35) | compact equation (pitch 17); facts (31.85) | compact equation (pitch 20) |
| Tall layout, 3 days per page: pitch = (G - 1 - 2 x 3) / 3 | 73.7 | 73.7 | 73.3 |
| Tall cell | 66.7 | 65.7 | 63.3 |
| What fits a tall cell | everything up to a medium visual | stacks (43), clock D 38 (56) | stacks (51), clock D 38 (56) |
| Clock D 38 in a Daily 4 cell (PT-VIS-2) | read the time to the hour, half hour or 5 minutes only | same | same |

- **PT-D4-1.** The four slots are fixed positions, left to right: last lesson, last week, last unit, last year. The four sources are always named in the teacher footer. An option "Source captions" (default off) also prints them once, at label size, over the first band, as in the drawing; never inside a box.
- **PT-D4-2.** Each slot asks the skill for its compact retrieval form (`ctx.compact = true`, `scaffoldLevel 0`): the smallest legal footprint, horizontal notation where the skill declares one. Writing space never drops below Hw.
- **PT-D4-3. Five days per page is the design.** It holds when every question of the week fits the 5-day cell. When any question does not, the engine uses the tall layout for the whole week: 3 days on page 1 and 2 on page 2 at the same cell size, printed duplex, with a dialog note. Content is never shrunk to keep five bands.
- **PT-D4-4.** A question wider than 46.5 (number line, coin row) turns its day into a 2 x 2 block of 93-wide cells, which also triggers the tall layout.
- **PT-D4-5. Sources.** With a ladder: slot 1 = the previous step, slot 2 = a step about five lessons back, slot 3 = the previous ladder or unit, slot 4 = the previous Level's strand. Without a ladder the teacher picks a skill pool for each slot. Nothing about a pupil is recorded or read.
- **PT-D4-6.** Seed = (Level, week); Day bands never split.

**Teacher options.** Slot pools; week number; days 1 to 5; captions on or off; timing extras.
**Skill supplies.** `renderCell` with `ctx.compact`, `footprint` (compact size).
**Screen.** Mixed review, four cards a day; feedback on Check after the fourth.

---

## 6. Thinking roles

Retrieval-and-reasoning pages whose questions MathQuest generates from any skill. Shared rules:

- **PT-THK-1. Low writing load.** Pupils check boxes, ring, and write numbers. They never compose a sentence; every sentence is a printed frame with number blanks or check-box choices.
- **PT-THK-2.** All wording is MathQuest's own and comes from the controlled frame library in `PEDAGOGY_STANDARD.md`. No third-party curriculum's wording or branding appears on any page or in any document.
- **PT-THK-3.** Look: I Can, lettered from `a.` on each page (PT-LBL-7), Score in the header (one point per item).

### 6.1 True or False?

**Purpose.** Judge a finished statement, then complete a frame that says what is true.

```
+----+---------------------------------+
| a. |    46 + 38 = 74                 |  statement: the skill's cell in state `answered` or `wrong`
+----+                                 |
|    [ ] True        [ ] False         |  check-box row: box + 4 = 9 / 10 / 11
|    The answer is ________ .          |  frame row: Hw + 4 = 10 / 12 / 14, number blanks only
+--------------------------------------+
```

| Statement footprint | Cell height needed S / M / L | Grid | Items S / M / L |
|---|---|---|---|
| Horizontal equation (14 / 17 / 20) | 14+3+9+2+10+3 = 41 / 47 / 53 | 2 x 4 (57); 2 x 3 at M, 2 x 2 at L | 8 / 6 / 4 (design-standard ceiling) |
| Stack, answered (33 / 41 / 49) | 60 / 71 / 82 | 2 x 3; L 2 x 2 (113.5) | 6 / 6 / 4 |
| Medium visual with its claim in the answer zone | 78 / 89 / 102 | 3 x 2, 3 x 2, 2 x 2 | 6 / 6 / 4 |

- **PT-TOF-1.** 40 to 60% of statements are false; each false statement comes from `wrongAnswer(q)`.
- **PT-TOF-2.** The frame is scored only with the check mark: a correct "True" needs no correction; a "False" needs the frame's number.
- **PT-TOF-3.** The check-box row and frame row sit at the same y in every cell of a row.

**Teacher options.** Count; share false; frame on or off. **Skill supplies.** `renderCell` with `state: answered | wrong`, `wrongAnswer`, a frame id from `strings`. Default adapter: the generic frame "The answer is ____." **Screen.** Tap True or False; the frame input opens after "False"; feedback on Check.

### 6.2 Reason It

**Purpose.** Short reasoning items in four formats: spot the mistake, odd one out, always / sometimes / never, which is correct.

```
SPOT THE MISTAKE (186 wide; height by size, PT-RSN-1)
+----+-------------------+----------------------------------+----------------------+
| a. |  worked solution  | (1) step text                    | Circle the wrong step|
+----+  with one wrong   | (2) step text                    |   (1)   (2)   (3)    |
|       step, all marks  | (3) step text                    | The answer is ____ . |
+------------------------+----------------------------------+----------------------+
ODD ONE OUT                                   WHICH IS CORRECT
| b. | [ 12 ] [ 18 ] [ 25 ] [ 30 ] circle one | c. |     A      |     B      | circle  A   B        |
|    | __ does not belong. It is not ____ .   |    | (worked)   | (worked)   | __ is correct.       |
|    | ( bank:  odd   even )                  |                            | The answer is __ .   |
ALWAYS / SOMETIMES / NEVER
| d. | statement ...          [ ] Always  [ ] Sometimes  [ ] Never     Example: __ + __ = __    |
```

- **PT-RSN-1.** Default page: one format per page (one of each only when the teacher chooses Mixed; pedagogy standard 9.4, design standard SF-61), 1 column x 4 / 3 / 2 rows at S / M / L (cells 186 x 57 / 76 / 113.5; design-standard ceiling 4 / 3 / 2). Long algorithms use 2 rows at every size.
- **PT-RSN-2.** Spot the mistake: the solution is `workedSteps(q)` with exactly one step replaced by the misconception behind `wrongAnswer(q)`; step rings are outlined circles at least Hw + 2 across.
- **PT-RSN-3.** Odd one out: four boxed items, three sharing a property the skill names; the pupil circles one and completes the frame "__ does not belong. It is not ______ ." with a word from a printed bank of at most 4 words (pedagogy standard 9.4, P-TH-15).
- **PT-RSN-4.** Which is correct: two worked solutions labelled "A" and "B" (never named characters, P-TH-14), side by side at the same cell size; the pupil circles A or B and completes "__ is correct. The answer is __ ."
- **PT-RSN-5.** Always / sometimes / never needs a skill-supplied claim with its verdict and an example frame (two frames for "sometimes": one example that works and one that does not, P-TH-16); it is offered only when the skill declares `claims[]`.

**Teacher options.** Format (one, or Mixed); count up to the ceiling for the size (4 / 3 / 2). **Skill supplies.** `wrongAnswer` (with the step it belongs to), `workedSteps`, optional `claims[]` and property tags. Default adapters cover spot the mistake and which is correct for every skill; odd one out falls back to "three correct statements and one wrong". **Screen.** Find-the-mistake mode: tap the step, the box or the solution; number inputs for frames; feedback on Check.

### 6.3 Stretch

**Purpose.** An open problem with several answers. A results table is the entry scaffold, so every pupil can start.

```
+=======================================================================+
| Find more than one answer. Fill in the table.                         |   9
| .-------------------------------------------------------------------. |
| (  Two numbers add to 50. Both numbers are even.                     )|  40
| (  What could the numbers be?                                        )|
| '-------------------------------------------------------------------' |
| +------------------+------------------+---------------------------+  |
| | first number     | second number    | check: sum                |  |  12
| +------------------+------------------+---------------------------+  |
| |       20         |       30         |       50    (traced row)  |  |  1 + 3 to 6
| |                  |                  |                           |  |  rows x 16
| |                  |                  |                           |  |
| +------------------+------------------+---------------------------+  |
| I found ____ answers.    [ ] There are more.   [ ] I found them all.  |  28
+-----------------------------------------------------------------------+
```

| | S | M | L |
|---|---|---|---|
| Prompt box (rounded) | 32 | 36 | 40 |
| Table header + 1 traced row + up to 6 empty rows (row = Hw + 6) | 9 + 7 x 12 = 93 | 10 + 7 x 14 = 108 | 12 + 7 x 16 = 124 |
| Closing frame | 20 | 24 | 28 |
| Total with I and two gaps of 3 (spare height stays blank below the closing frame) | 8+32+93+20+6 = 159 | 8+36+108+24+6 = 182 | 9+40+124+28+6 = 207 |

- **PT-STC-1.** One problem per page by default; two only where two whole problems fit with fewer rows (design-standard ceiling 2 / 1-2 / 1). Row 1 of the table is a worked answer traced in grey; then 3 to 6 empty rows (pedagogy standard P-TH-18, design standard SF-62).
- **PT-STC-2.** The last column is always a self-check the pupil can compute.
- **PT-STC-3.** The closing frame uses number blanks and check-box lines only.

**Teacher options.** Empty rows 3 to 6; traced row on or off; closing frame on or off. **Skill supplies.** `open(q)`, returning a derived question (contract section 3.2) whose cell payload holds `{prompt, columns[], exampleRow, check}`; `check` is a plain-data rule (for example `{sum: 12}`), never a function. Default adapter for any numeric skill: "find different problems with the answer N", columns = the skill's operands plus the check. **Screen.** An add-a-row table; each row is checked against that rule and duplicates are refused; no upper limit on rows.

---

## 7. Companions

### 7.1 Facsimile answer key

**Purpose.** Mark by position: the same page with the answers in place. The facsimile answer key is a **base companion of every role, for every skill**: there is no page type and no skill without an answer sheet (owner ruling 2026-09-19; PT-KEY-7, PT-CMP-5).

- **PT-KEY-1.** Every page of every role has a key, for every skill; a page with scored cells can never print without one being available. The key is the identical page rendered with `state: answered`: same geometry, same labels, same pagination. The lint checks that the key's cell count equals the pupil page's.
- **PT-KEY-2.** Answers print in black Andika 700 in the answer slots, with regrouping marks, partial products, quotient working, drawn clock hands and shading shown (the flat grey, or hatch when Photocopy-safe). The key is black and white like everything else.
- **PT-KEY-3.** The tab's id line reads `Answer Key` and "Answer Key" prints on the Name rule, so a key cannot be mistaken for a pupil page.
- **PT-KEY-4.** Reduction is an option, never a default: full size, or 2-up (landscape). A reduced key is rendered from the size-S layout of the same items in the same cell order, never by scaling the page down (design standard AK-5, PG-20); no other reduction is offered. Text never drops below 7 pt on a key.
- **PT-KEY-5.** Mixed Skill Practice keys add the skill-to-item map and per-skill subtotals under the grid. Daily Spiral and Daily 4 may add one weekly table (slots as rows, days as columns). Word-problem keys show the equation and the answer sentence and list accepted equivalent equations.
- **PT-KEY-6.** Keys print after the pupil pages, on their own sheet by default.
- **PT-KEY-7. No role and no skill is without an answer sheet.** The key is built by the page role itself from `renderCell(q, {state: 'answered'})`, which every skill has through the default adapter (the legacy answer placed in the slot), so it never depends on a skill opting in. Pages whose cells are unscored (Opener Model and Guided cells, the Guided page, Scripted Model, decision, notate-only and set-up pages, error analysis, thinking pages) get the same key with every cell answered: set-up frames filled, the right check box checked, the fix written. Open tasks (Stretch) list every correct answer, or the rule when there are more than 12. Pages with nothing to answer (Anchor chart, Steps card, fact-family Intro and Warm-up, flashcards) are their own key and the job says so rather than reporting that no key exists. Hands-on sorts print the completed arrangement. The dialog's Answer key option (PT-DLG-23) is on by default for every role.

**Skill supplies.** `renderCell` with `state: answered` (default adapter: the legacy answer placed in the slot). **Screen.** The review screen after Check shows the same answered cell beside the pupil's entry.

### 7.2 Anchor chart

**Purpose.** A wall or desk reference for one ladder step that matches the page diagrams exactly.

```
|                  I Can add two-digit numbers                          |
+=======================================================================+
|  one worked example, answered, with callout arrows to the             | 110
|  critical spot (the regroup box)                                      |
+=======================================================================+
|  Steps:  (1) ...  (2) ...  (3) ...  (4) ...                           |  70
+=======================================================================+
|  Vocabulary:  [pic] tens (T)   [pic] ones (O)   [pic] regroup         |  44
+-----------------------------------------------------------------------+
```

- **PT-ANC-1.** Zones 110 + 70 + 44 plus two 3 mm gaps = 230 <= 232. The example is the skill's cell at size L drawn at 1.5 x (a poster exception to PT-ENG-1: nothing is written on it).
- **PT-ANC-2.** One picture per rule; arrows point to the one critical spot. Half-page (2-up, cut line dashed) is the desk version.

**Skill supplies.** `strings`, `workedSteps`, `renderCell` answered. **Screen.** The "Show me" panel in Learn mode.

### 7.3 Steps card

**Purpose.** A desk checklist that can be uncovered one step at a time.

- **PT-STP-1.** Four cards per sheet (2 x 2, each 93 x 117.5, dashed cut lines). A card has a 16 mm title strip, then up to 6 steps at equal pitch ((117.5 - 16 - 6) / 6 = 15.9), so a cover slip reveals one step at a time.
- **PT-STP-2.** Each step has an outlined step marker, one in-house line-art icon (14 mm) and the step text (10 words or fewer).

**Skill supplies.** `workedSteps`, `strings.iCan`. **Screen.** The second rung of the Hint ladder.

---

## 8. Hands-on family (later)

Specified now so the standards cover them; built after the other families. Look: I Can. Shared rules:

- **PT-HND-1.** Dashed always means cut. Cut pieces sit in a strip at the foot of the page (or on a second sheet), so cutting never destroys the work area.
- **PT-HND-2.** The first item is pre-marked with dotted lines (a dotted tile outline in its glue box, a dotted match line, a dotted colour ring) as the model.
- **PT-HND-3.** Tiles are at least 25 x 20 (design standard RP-140); glue boxes are the tile size + 2, so 27 x 22 (solid, square, 0.75 pt; RP-141); cards are at least 40 x 28.
- **PT-HND-4.** Instructions use the hands-on verbs (Cut, Sort, Glue, Match, Color) and the library strings `cut-sort`, `cut-order`, `match` and `find-color` from `PEDAGOGY_STANDARD.md`. A hands-on page always prints single-sided (RP-146).
- **PT-HND-5.** Screen twins: cut-and-paste = drag a tile; match = tap, then tap, and a line is drawn; find-and-colour = tap to fill with the flat grey; layered strips = drag to stack.

| Role | Anatomy | Geometry and capacity | Skill supplies |
|---|---|---|---|
| 8.1 Cut-and-glue sort | two bins side by side with bold headings; a foot strip of dashed tiles | bins 93 x 140, each 3 x 5 glue boxes of 27 x 22 (5 x 22 + 6 x 3 = 128); tile strip 2 rows x 7 tiles of 25 x 20 (175 x 44); 9 + 140 + 6 + 44 = 199 <= 226; up to 14 tiles | two category labels and items tagged by category (`decision(q)` or property tags) |
| 8.2 Cut-and-order | per set: a row of numbered glue boxes over a dashed strip of cards | set = boxes 32 + gap 4 + cards 30 + gap 8 = 74; 3 sets per page (222); 4 cards of 44 wide per set | an ordered list (times, lengths, numbers) |
| 8.3 Closed-set paste tiles | any grid page whose answer slots are 27 x 22 glue boxes, plus a foot strip of 7 dashed tiles (25 x 20) holding the answers and up to 2 distractors | the strip costs one row of cells (K count, side layout at L: 5 to 7 per page) | `renderCell` with a `paste` slot; the answer set |
| 8.4 Match with a line | two columns of boxed items with solid 2.5 mm anchor dots (design standard RP-142) facing each other | columns 70 wide, 46 between; 5 or 6 pairs at pitch >= 30 (6 x 36 = 216) | pairs (representation A, representation B) |
| 8.5 Find-and-colour | a field of 12 to 20 items and a rounded count badge ("Find 6") | field 186 x 180, items >= 20 across, >= 6 apart; badge 30 x 14, top right | a target property and a stated count |
| 8.6 Layered place-value strips | cut strips 4u, 3u, 2u and 1u wide that stack right-aligned to build a number, and a mat | u = 40 (160 wide), strips 34 tall, digits 63 pt (poster-size exception for cut-and-layer strips only, design standard RP-144); 9 + 4 x 38 + 6 + mat 40 = 207; one number per page (two at u = 30) | a number and its expanded form |
| 8.7 Flashcards | 3 x 3 rounded cards with dashed cut lines between them; single-sided, backs blank (design standard RP-145, RP-146); an answered set is a separate page | no header; cards 62 x 87 (262 / 3); fact centred at 28 pt; versions with and without the dot cue | fact-set descriptor; `state: answered` for the separate answered page |

---

## 9. Print-dialog option model

Every option on every role lives in the print dialog. Scope is `job` (the whole print job), `section` (one block of skills on a sheet) or **`skill`** (one configured skill inside a section). Remembered options persist between sessions.

**Skill-scope options belong to the skill, not to the page** (owner clarification 2026-09-19). A skill declares its own option schema — what it takes, the allowed values and the default (`design/SKILL_CELL_CONTRACT.md` section 3.6, SCC-P13). The dialog reads that schema and shows those options **per skill**, so a section holding several skills shows each skill's own set, and "Add 6, band 20, practice level 2" beside "Subtract 2, band 10" is one section with two configured skills. The chosen values then ride with the skill into any page role — Opener, Scripted Model, Guided, Independent, More Practice, daily or mixed review, Test A / B, Error analysis — on screen and in print, and a page role never invents or overrides one (SCC-P14, SCC-P15). Job and section scope keep the page's own choices: paper, look, size, columns, label style, header fields, photocopy-safe, seed, answer key. The values are saved with a favourite, a quick skill, a saved quiz and a print section, and travel in the settings segment of a share code, so a shared link reopens the same configured skill (SCC-P16).

### PT-DLG-0 — three papers: Practice, Quiz, Lesson (owner ruling 2026-09-26)

> "we then have three types of papers: practice, quiz, and lesson" (`LESSON_LIBRARY_PLAN.md` §8e). The Print screen
> shows **three paper cards** in place of the 17 page-type cards. A section carries a paper and that paper's options;
> the request goes to `buildSheet` as `{kind: 'practice'|'quiz'|'lesson', versions, factColumns, timed, parts}` and
> `print-sheet.js` routes it to today's roles through ONE table, `PAPER_ROUTES` in `js/modules/sheet/papers.js`. When
> the engine lane rebuilds Practice and Quiz on the lesson page builders (§8c), only that table's role column changes.

| Paper | Options on the Print screen | Routes to (today) |
|---|---|---|
| **Practice** | skills, one or more (one skill -> its I Can title, PT-TTL-1); a **weight** per skill (default 1: equal), items per skill = page items x weight / total weight, largest remainder, every weighted skill at least one (`weightedCounts`); **Prerequisites (n)** under each skill: every prerequisite skill as a check box, none ticked; a ticked one joins the set with weight 1 and a "Prerequisite of X" note (`prerequisite-skills.js`, the lesson library's graph when it lands, else the WRM steps before the skill's step); **versions** 1 or A, B, C... (new numbers each); pages; columns; **fact columns** off / auto / 5-10 across and **timed check** off / 1-5 minutes (fact and operation skills only); size S / M / L | timed check -> `fact-probe`; fact columns -> `fact-rows`; versions -> `more-practice`; word-problem skills only -> `word-problems`; else `independent` (several skills: `weightedMix`, exact weights) |
| **Quiz** | skills (weights as Practice); versions Form A and / or Form B; columns; size | `test`, one sheet per form |
| **Lesson** | the first skill (the card is withheld, with its reason, for a skill with no lesson yet); **parts to print** as check boxes, all ticked by default: Prerequisite Check, anchor chart, lesson sheet (We Do), practice, mixed; practice pages 1-3; one size (§8a: the Size control is replaced by a note when every section is a Lesson); "New numbers" re-deals the whole packet until the engine lane ships per-part seeds (`req.lessonSeeds`) | `lesson` with `lessonParts` (every part is built, only the ticked ones print; the Prerequisite Check prints on the lesson sheet until it has a page of its own) |

- **Paused, hidden, code kept:** True or False?, Reason It, Stretch, Find the mistake (§8d, §8e). No card offers them;
  their roles still build, so an old stored printout that used one still reprints.
- **Old role ids decode to a paper** (`paperOfRole`, never break a saved set or a link): independent / more-practice /
  mixed-practice / review / fact-rows / fact-probe / word-problems -> Practice with the matching options; test / test-b
  -> Quiz Form A / B; lesson / opener / pre-skill-check / scripted-model / guided -> Lesson with the matching part.
  `buildSheet` still takes every old role id directly (Home's "Recent printouts" rebuild the stored request as it was).
- **Weights on screen:** a skill code's weights (`AB3-CD-EF`) reach live practice too (`playSelectedSkills` ->
  `mixedModeSettings.weights`; `generate-question.js` `weightedMixPick` deals a shuffled block of sum(weights), so
  3 : 1 : 1 is exactly 60 / 20 / 20 over every five questions).
- The rows below that name a page role (PT-DLG-1 "Sheet type") describe the engine's roles, which the papers route to;
  the teacher no longer picks a role.

| Id | Option | Values | Default | Scope | Notes |
|---|---|---|---|---|---|
| PT-DLG-1 | Sheet type and packet parts | *superseded 2026-09-26 by PT-DLG-0 (three papers)*; was: any role in sections 2 to 8; "Lesson packet" opens a checklist of parts (PT-PKT-1) and presets | Practice | section | the paper routes to a role (PT-DLG-0) |
| PT-DLG-2 | Look | *retired 2026-09-26* — no control; every worksheet prints Daily (PT-LOOK-1) | Daily | — | a stored `ican` / `auto` decodes and prints Daily; the lesson packet pins its own look (PT-LOOK-2); the title follows the skills (PT-TTL-1) |
| PT-DLG-3 | Label style | Auto, letters, black tabs, none | Auto (black tabs, the Daily look) | section | never reflows the page (PT-LBL-4) |
| PT-DLG-4 | Columns | Auto, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | Auto | section | the stored choice is never overwritten; the clamp, step-down or forced note shows beside the control and in the preview only (PT-COL-5) |
| PT-DLG-5 | Size | S, M, L | L | section | fixes writing space; content never shrinks to fit |
| PT-DLG-6 | Count | problems, pages, or problems per page (word problems: Auto, 1, 2, 3, 4) | role default | section | rounded to full rows (PT-ENG-7) |
| PT-DLG-7 | Problem mix | `single` (one problem type + one notation: vertical, horizontal, missing number, bracket) or `mixed` (ratio chips) | single | section | unknown position and edge-case seeding sit under it |
| PT-DLG-8 | Dense fact labels | Day bands, row letters, every fact numbered | PT-FRW-4 | section | Fact rows and Probe fill-page only |
| PT-DLG-9 | Scaffold level and fade | Auto by role, 3, 2, 1, 0; fade none or Model -> Guided -> Independent | Auto (1.7) | section | |
| PT-DLG-10 | Individual supports | checklist: worked model, steps, place-value labels, regroup boxes or headroom, digit grid, partial-product rules, support strip (full, grey, off), dot cue, number line, ten frame, tally box, multiples strip, estimation box, check lines, schema diagram, decision lines, equation frame, work grid, sentence frame, vocabulary box, unit word | by level | section | a box the role cannot host is disabled with its reason |
| PT-DLG-11 | Tests | "hints on tests" (off); "keep structural supports" (on) | as shown | section | options, not policy |
| PT-DLG-12 | Think box above division facts | on, off | off | section | PT-FPR-7; when on, the page drops one row and the "Fits:" line and Score denominator show the new count |
| PT-DLG-13 | Timing | "(1 minute)" tag; Time line; Goal line | all off | section | mirrors the app's timed activities; never adds header height |
| PT-DLG-14 | Place-value labels | words, letters, none | letters | section | words only where a column is >= 14 mm |
| PT-DLG-15 | Objects | plain counters (dots, squares, ten-frame counters) or pictures (star, apple, fish, car, ball, flower, turtle, block) | plain counters at every Level (age-neutral); pictures are the teacher's choice | section | one kind per cell |
| PT-DLG-16 | Coin style | generic value circles 1, 5, 10, 25, sized by value (fixed); count-by-fives dots and running-total boxes on, grey, off | supports by level | section | no national art; coin totals are plain numbers with no currency sign and no unit word (design standard SL-9) |
| PT-DLG-17 | Fact cue, + and − facts | style: dot tile, dots on the numeral or off; part 1, 2, 3, 4 | tile; part by ladder step | section | tile at 7 columns or fewer; dots on the numeral at 6 or fewer; never offered for × or ÷ (PT-DLG-27) |
| PT-DLG-18 | Word problems | system: schema or keyword panel; version v1, v2, two-step, K picture; schema type; illustration; bold key numbers; underlined cue words | schema, v1 | section | |
| PT-DLG-19 | Photocopy-safe | on, off | off | job | grey -> 45-degree hatch; trace digits -> dotted outlines |
| PT-DLG-20 | Header fields | check boxes Name, Date, Score, tab, title; editable title text and tab lines | all on | job, remembered | Score always prints its denominator; freed height goes to the body |
| PT-DLG-21 | Form and seed | form A to D; practice letter A to J; version A to D (Today's Number); week and day; seed; "new numbers" | form A, random seed stored with the job | section | the same seed reprints the same page |
| PT-DLG-22 | Paper | A4, US Letter | A4 | job, remembered | one page rule injected per job |
| PT-DLG-23 | Answer key | on, off; full size, 2-up; own sheet | on, full size, own sheet | job | PT-KEY-1 to 6 |
| PT-DLG-24 | Preview | live page thumbnail built from the real print DOM with a fixed seed; "Fits:" line (columns, digit pt, per page, pages); achieved mix for mixed sheets | always on | job | preview and print share `resolveSectionLayout` |

State sketch (persisted with a schema version; older saved states migrate with defaults):

```
{ v: 3,
  job:  { paper, photocopySafe, header: {name, date, score, tab, title}, titleText, tabLines,
          answerKey: {on, layout, ownSheet} },
  sections: [ { id, role, packetParts[], weights[], look, labelStyle, columns, size,
                skills: [ { categoryId, skillId, weight,
                            opts: { factConstant, band, practiceLevel, simplestForm,
                                    pictures, notation, unknown, ... } } ],   <- the configured skill
                count: {mode, n}, mix: {mode, type, notation, ratio}, denseLabels,
                scaffold: {level, fade, supports{}}, tests: {hints, keepStructural}, thinkBox,
                timing: {minuteTag, timeLine, goal}, pvLabels, objects, coins: {supports},
                factCue: {style, part}, wordProblems: {system, version, schema},
                form, seed } ] }
```

- **PT-DLG-27 to 29** were added by the owner rulings of 2026-09-19 and sit at the end of the series so that earlier ids stay stable:

| Id | Option | Values | Default | Scope | Notes |
|---|---|---|---|---|---|
| PT-DLG-27 | Fact cue, × and ÷ facts | skip-count strip, array tile, none; part 1, 2, 3, 4 | skip-count strip; part by ladder step | section | chosen per print; array tile only at 5 columns or fewer; fade strip -> grey strip -> none -> mixed (PT-FPR-10) |
| PT-DLG-28 | Fact range, × and ÷ facts | to 12, limit to 10 | to 12 | section | CCSS 3.OA.C.7 needs one-digit factors only, so the limit stays available (PT-FPR-11) |
| PT-DLG-29 | `Say:` band | on, off | on | section | the oral frame under the Model on the Opener and at the foot of the Scripted Model page (PT-OPN-9) |

  Persisted as `factCueMD: {style, part}`, `factRange: 12 | 10` and `sayBand: true | false` on the section; a saved state without them takes the defaults.

- **PT-DLG-30 to 33** were added by the owner rulings of 2026-09-19 (round 2) and likewise sit at the end of the series. All four are **skill** scope: the skill declares them, the teacher configures them once, and they ride with the skill into every page role:

| Id | Option | Values | Default | Scope | Notes |
|---|---|---|---|---|---|
| PT-DLG-30 | Fact constant, + and − facts | 0 to 13; a range of constants; all (mixed / cumulative) | the skill's declared default (the ladder step's constant when a step supplies one) | **skill** | named in the title, never in the instruction (P-LG-16); listed 1 to 10, then 11 to 13, then 0 last (PT-FPR-12) |
| PT-DLG-31 | Band (the answer cap) | + and − facts: 30, 20, 18, 12, 10. Computation skills: the skill's declared band list (10, 20, 50, 100, 1,000, 10,000) | the skill's declared default; 30 for + and − facts | **skill** | the band bounds the **answer** — sum, minuend, product, dividend — never the operands (P-35). A band the chosen constant or profile cannot host is refused with its reason (VA-R-07) |
| PT-DLG-32 | Practice level | 1, 2, 3 | the skill's declared default (the ladder step's level when a step supplies one); 1 on a stand-alone print | **skill** | replaces the retired easy / medium / hard twins (P-AT-9). One named composite that sets the underlying axes (bank shown, picture shown, blanks, `within`). Shown as "Practice level" and printed only in the teacher footer, so the pupil-facing "Level N" keeps meaning the grade band |
| PT-DLG-33 | Simplest form required | on, off | off (the skill's declared default) | **skill** | on only where the task is to simplify; it swaps the instruction to `simplest-form` and makes the check strict. Off, every equivalent answer is accepted (P-LG-15) |

  These four are **skill-scope**: they are declared by the skill (`design/SKILL_CELL_CONTRACT.md` section 3.6) and persisted inside that skill's entry in `sections[].skills[].opts` as `factConstant: number | [number, number] | 'all'`, `band: number`, `practiceLevel: 1 | 2 | 3` and `simplestForm: boolean` (`practiceLevel`, not `level`, because `scaffold.level` already names the 3-to-0 scaffold ladder). A section holding several skills stores one `opts` per skill and the dialog shows one group per skill. A saved state without them takes the skill's declared defaults, and a section that already stored a section-wide `range` keeps it, read as the band of every skill in it that declares one. The same values travel in a share code's settings segment (SCC-P16).

- **PT-DLG-24a.** The sketch above is the persisted dialog state. `compose()` receives the contract's `ComposeOptions` (`design/SKILL_CELL_CONTRACT.md` section 6.2), whose names win: `tests` maps to `hints: {onTests, keepStructural}`, `denseLabels` to `denseFactLabels`, `factCue.style` to `cue`, `wordProblems.system` to `wordProblemMode`, and the `labelStyle` values letters / black tabs / none to `letter` / `tab` / `none`.
- **PT-DLG-25.** The dialog keeps Sheet type, Columns, Size, Count and Supports visible; Look, Label style, Mix and Fade sit under a collapsed "More" area. A skill's own options (PT-DLG-30 to 33 and every other option its schema declares) sit in a group under that skill's row inside the section, one group per skill, each control built from the declared type, allowed values and default; an option the skill does not declare is not shown, and a value another option rules out is disabled with its reason (`dependsOn`, VA-R-07).
- **PT-DLG-26.** No option, field or page in this model records, stores or charts a pupil's results. There are no goal pages, trackers, class records, mastery logs, progress graphs or mastery gates.

---

## 10. Skill x page role compatibility

- **PT-CMP-1. Governing rule.** Any skill can appear on any page role. A role never refuses a skill; the skill's `footprint` decides how many items fit, never whether the skill is allowed. What travels into the role is the **configured** skill — the id plus the option values the teacher set (fact constant, band, practice level, pictures, notation, unknown position, simplest form). A role lays that out; it never invents or overrides one of those values (`design/SKILL_CELL_CONTRACT.md` SCC-P14, SCC-P15). Where a role holds something constant — a probe's 15 vertical + 5 horizontal split, a Test at scaffold level 0 — that is a role rule stated in this document, and it is named in the dialog when it overrides nothing the teacher chose.
- **PT-CMP-2. Fact layouts are additional.** Section 4 roles require `footprint.factLike = true`. A fact-like skill still works on every other role. A skill that is not fact-like and is sent to a fact layout is rerouted to the Computation grid or Equation drill with a dialog note.
- **PT-CMP-3. Default adapters** guarantee PT-CMP-1 from day one. A family migration replaces adapters with real members; the roles never change.
- **PT-CMP-4.** `coverage()` in the cell registry must show every skill x every role rendering without overflow at S, M and L in both looks; the compliance harness fails a migrated family that is red.
- **PT-CMP-5. Every skill on every role has an answer sheet.** The facsimile answer key (7.1) is a base companion of every role in sections 2 to 8, for every skill, migrated or not. `coverage()` therefore checks `state: answered` as well as `blank` for every skill x role pair, and a pair whose key cannot be rendered is red in the same way as an overflow (PT-KEY-1, PT-KEY-7).

| Role group | Members read | With default adapters only | Becomes fully useful when the skill supplies |
|---|---|---|---|
| Independent, More Practice, Review, Test, Pre-skill check, Computation grid, Equation drill, Visual grid, Daily Spiral, Mixed, Daily 4, template, answer key | `renderCell`, `footprint`, `strings.instruction` | works: legacy output in a standard cell, size class from the legacy print-size map | a real cell template and an exact footprint (and `ctx.compact`) |
| Opener, Scripted Model, Guided page, K one-page lesson, Anchor chart, Steps card | + `workedSteps`, `strings` | works: steps from the existing worked-solution text; states without marks; title from the skill label | `workedSteps` with marks, `whatsNew`, `vocabulary`, `oralFrame` |
| Error analysis, True or False?, Reason It (spot the mistake, which is correct, odd one out) | + `wrongAnswer` | works: error from existing distractors | misconception-based `wrongAnswer` tagged with its step |
| Sub-skill pages | `decision`, `setupOnly` | "basic": "Correct" / "Not correct" judgement; copy into the empty frame | real decision lines; a real set-up frame |
| Reason It: always / sometimes / never | `claims[]` | not offered for that skill (the other three formats are) | `claims[]` |
| Stretch | `open` | "basic": find problems with a given answer | a real open task |
| Word problems | word-problem template | works for story skills; a non-story skill is wrapped in a neutral one-step story frame only if it declares a unit word, otherwise the role prints the skill's cell inside the band | story lines, schema id, unit word |
| Today's Number | place-value, compare, round, count skills with `opts.value` | works with the built-in band set | extra bands for new representations |
| Fact layouts | `footprint.factLike`, fact-set descriptor | not applicable to non-fact skills (PT-CMP-2) | constant, family and range descriptors |
| Hands-on family | property tags, pairs, ordered lists | sort and match fall back to answer = tile | tagged categories and representation pairs |

---

## Appendix: decisions taken in this document that the owner has not yet ruled on

Each can be changed without touching the rest of the file.

1. Page arithmetic: 12 + 26 + 236 + 3 (gap) + 6 + 14 = 297; the 3 mm gap above the footer is this file's choice.
2. One label box (4 / 5 / 6 mm) serves both looks, so the quiet letter occupies the same keep-out as the black tab and label style never reflows a page; quiet letters are Andika 400 at 8 / 9 / 10 pt (design standard CL-10).
3. Letters run on across a lesson's Independent pages only; More Practice, Sub-skill, Review, Test, Pre-skill, Error analysis, True or False?, Reason It and Stretch pages each restart at `a.`.
4. Default look for roles the owner did not list: fact layouts, Equation drill, standalone Long division, Today's Number = Daily; Visual grid, K counting, charts, word problems, Thinking roles, companions, hands-on = I Can.
5. In the Daily look a worked cell carries an outlined `Model` tab; in the I Can look it is unlabelled.
6. Opener Model band: 93 mm model zone beside a 93 mm Steps zone; Independent rows are added to the Opener only when whole rows fit.
7. Guided page holds up to the design standard's ceiling (8 / 6 / 6 cells) with a row-by-row fade.
8. "Row letters" on dense fact rows put one quiet lowercase letter in a 6 mm gutter at the left of each row.
9. At 8 to 10 columns the probe fills the page and prints without a cue; the dot tile (side max(6, 0.62 em)) is offered at 7 columns or fewer and dots on the numeral at 6 or fewer. (Ruled 2026-09-19: these two cues are for + and − only; × and ÷ use the skip-count strip, the array tile at 5 columns or fewer, or none. The array tile's exact geometry is still this file's choice.)
10. Daily 4 keeps five days per page only when every question fits the 5-day cell; otherwise 3 + 2 days over two pages.
11. Today's Number versions A to D are a support progression over one band set per range; side 1 is six equal bands.
12. Money answers are plain number blanks with no currency sign and no unit word; notes are generic rectangles showing only a value.
13. Word-problem Score is one point per problem and always prints with its denominator.
14. Every page gets a full-size facsimile key; a reduced 2-up key, rendered from the size-S layout and never scaled, is the only other option.
15. Sub-skill pages, always / sometimes / never and Stretch use "basic" fallbacks (or are withheld) until a skill supplies the optional members.

Ruled by the owner on 2026-09-19, round 2 (no longer open): a band bounds the **answer**, not the operands (P-35), so "add within 10 with regrouping" becomes bridging ten and ragged operand lengths are generated deliberately and first; + and − facts run to 30 with a constant of 0 to 13 (PT-DLG-30, PT-DLG-31, PT-FPR-12); the easy / medium / hard twins merge into one skill with a Practice level, every retired id kept as a positional alias (PT-DLG-32); any equivalent fraction is accepted unless the instruction asks for simplest form (PT-DLG-33). Clarified the same day: these are options **on the skill**, declared by the skill and configured once, which then ride with it into every page role; the dialog shows them per skill, and a page role never invents or overrides one.

Ruled by the owner on 2026-09-19 (no longer open): digits are Andika with `cv04` only; flat grey is the default and Photocopy-safe is a switch that is off by default; the think box drops one row (PT-FPR-7); the × ÷ cue, set order and fact range (PT-FPR-10, PT-FPR-11); "Check" replaces "Tick"; generic coins are sized by value (PT-VIS-5); the `Say:` band is official and on by default (PT-OPN-9); the missing-digit box is dashed (PT-CGR-9); the "This time you will" stem and the outlined strand tab are approved as written.
