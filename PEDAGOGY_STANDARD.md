# MathQuest Pedagogy Standard

This is the teaching contract for MathQuest. Every skill, every printed page and every online session
must follow it. It says how a skill is broken into small steps, how a lesson is sequenced, which supports
appear and when they go, how review and fluency work, how word problems and thinking pages are built, and
which words may be printed in front of a pupil. It does not say what anything looks like; the visual
contract lives in `WORKSHEET_DESIGN_STANDARD.md`.

## Related documents

| Document | What it holds |
|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract: tokens, the two looks, header, cells, labels, answer-slot shapes, line styles, grey and hatching, type, density, drawing rules, screen parity. |
| `PEDAGOGY_STANDARD.md` | This document: the teaching contract. |
| `design/PAGE_TYPES.md` | Every page role: anatomy drawing, geometry, options. |
| `design/PROBLEM_TYPES.md` | Problem catalogue by domain, response modes (print and screen), representations library. |
| `design/EXTENSION_PLAYBOOK.md` | Ladders, page types and exemplars for the domains the reference workbooks barely cover. |
| `design/SKILL_CELL_CONTRACT.md` | The data each skill supplies so that any skill can render on any page role. |

The layout ideas in these documents were studied from a private collection of special-education workbooks,
referred to only as "the reference workbooks". Every string, story, title, example and drawing here is
MathQuest's own.

---

## 0. How to read this document

**Rule ids.** Every rule has an id. Core rules are `P-1` … `P-34` (section 3). Section rules carry a
section code: `P-PR` principles, `P-LC` lesson cycle, `P-SC` scaffolds, `P-AT` atomisation, `P-FL`
fluency, `P-RV` review, `P-WP` word problems, `P-TH` thinking pages, `P-LG` language, `P-ON` online.
Rubric criteria are `Q-1` … `Q-20` (section 12). Ids are permanent: a retired rule keeps its number and
is marked "retired"; numbers are never reused.

**Force words.** MUST = a build fails review if broken. SHOULD = default behaviour; a deviation needs a
written reason in the skill's notes. OPTION = a teacher tick-box; the default is stated.

**Test line.** Each core rule ends with a *Test* that a reviewer, a DOM lint, or a unit test over the
ladder data can pass or fail.

**Terms used throughout.**

| Term | Meaning |
|---|---|
| Skill | One generator in `SKILLS` (what is generated). Skill ids are never renamed by this standard. |
| Ladder | An ordered list of steps that teaches one procedure or concept with one strategy. Data only (`js/modules/ladders.js`). |
| Step | One rung of a ladder: a constrained slice of a skill, in one representation, with a stated set of supports. One step = one lesson = one "I Can" title. |
| Page role | A skill-agnostic page composer: Opener, scripted Model, Guided, Independent, More Practice, Sub-skill / Decision, Error analysis, Review, Test A/B, Pre-skill check, Daily Spiral panel, Mixed practice, Daily 4, True or False?, Reason It, Stretch, Word problem, plus the fact layouts. |
| Cell | One problem in its ruled box. The same cell anatomy is used on paper and on screen. |
| Scaffold level | 3, 2, 1 or 0. How much support a cell carries (section 4). |
| Section | One instruction line and the cells under it. |
| Form | A parallel version of the same page (Test A / Test B; probe forms; Today's Number versions). Forms are seeded and reproducible. |
| Level | The pupil-facing name for a grade band: Level K, 1, 2, 3, 4, 5, 6. Pupil pages never print "Grade". |
| Teaching sequence list | A teacher's ordered list of the steps or skills already taught. It is planning data. It holds no pupil names, scores or results. |

**Out of scope, permanently.** This standard specifies no tracking of any kind: no goal pages, pupil
trackers, class records, accuracy logs, progress graphs, pass marks or locked steps. Moving a pupil to the
next step is always the teacher's decision. Nothing in MathQuest's sheet system may block a page, a step
or a mode behind a score. (The app's existing game chrome — XP, streaks, badges — is outside this
standard and is neither extended nor relied on by it.)

---

## 1. Who we teach, and the principles

MathQuest sheets are written for pupils who are learning mathematics in a second language, pupils with
identified learning needs, and pupils working below their age level. The content runs from Level K to
Level 6, but the pupil holding the page may be several years older than the level. Typical barriers, and
what each one demands of us:

| Barrier | What it demands |
|---|---|
| Small working memory | One new idea at a time; the steps stay visible; nothing on the page that is not needed. |
| English as an additional language | Few words, the same words every time, a picture for every new term, numbers as digits. |
| Slow or effortful handwriting | Large fixed writing spaces; responses that are a mark, a digit or one number. |
| Low reading level | Instructions a teacher can read aloud once; on screen, text-to-speech on every string. |
| Fragile attention | The same page routine every day; no decoration; white space inside every cell. |
| Anxiety about failure and the clock | A worked example first; supports that fade slowly; timing is never imposed. |
| Older pupils on early content | Age-neutral pages: "Level N", plain counters, no childish art. |

### Principles

| Id | Principle | In practice |
|---|---|---|
| P-PR-1 | **One idea at a time.** | A step changes exactly one thing from the step before it (P-1). A page teaches one step. |
| P-PR-2 | **Protect working memory.** | Small numbers while the procedure is new (P-12). The steps are printed beside the Model. Partial results have a box to live in (regroup boxes, tally box, work grid) so the pupil never holds them in the head. |
| P-PR-3 | **Worked example first.** | Every new step opens with a fully worked item in grey trace digits that the pupil traces while the teacher says the steps (P-4). |
| P-PR-4 | **Concrete, then pictorial, then abstract — with a bridge.** | A concept starts with objects or pictures. One bridging step shows the picture and the symbols in the same row. Only then do the pictures go (P-8). |
| P-PR-5 | **A consistent routine.** | The same bands in the same order on every Opener; the same cell anatomy from Model to Test (P-6); the same title on every page of a lesson (P-3); the same instruction string for the same task everywhere (P-14). |
| P-PR-6 | **Language load is load.** | Every printed word costs working memory. Instructions are capped at 12 words, vocabulary at 3 terms per step, stories at 4 lines. Pupils never compose sentences (P-13). |
| P-PR-7 | **Supports are of two kinds.** | Hints are temporary and fade in a fixed order. Structure is an accommodation and stays until a dedicated step removes it (P-7, section 4). |
| P-PR-8 | **Accuracy before speed.** | Fluency work is untimed by default. Timing, time lines and goals are teacher options (P-30, section 6). |
| P-PR-9 | **No surprises.** | Review and Test pages reuse the cell formats the pupil practised, in teaching order (P-23). |
| P-PR-10 | **Options, not policy.** | Where good teachers disagree (hints on tests, timing, keyword panels, labels), MathQuest offers a remembered tick-box with a safe default rather than a fixed rule (P-31). |

---

## 2. The lesson cycle

One step of a ladder is taught with a gradual-release cycle: **I Do** (teacher models), **We Do** (guided
together), **You Do** (independent). The cycle is printed on the pupil's pages, not hidden in a manual.

### 2.1 The Opener: bands in fixed order

```
+--------------------------------------------------------------------+
| Name ________   Date ________   Score ___/N          [strand tab]  |
|                  I Can <verb> <object> (<constraint>)               |
+--------------------------------------------------------------------+
| What's New:    one sentence: "This time you will ..."               |
+--------------------------------------------------------------------+
| Vocabulary: / Rule: <= 3 terms, each: term - gloss - mini-diagram   |
|                     optional "Remember ... NOT ..." line            |
+--------------------------------------------------------------------+
| Warm-up:       2-4 quick prerequisite items (oral or one-mark)      |
+---------------------------+----------------------------------------+
| Steps: (teacher script)   | Model:  (I Do)                          |
| 1. ...                    |  [ item 1: answer in grey trace ]       |
| 2. ...                    |  [ item 2: same anatomy, blank  ]       |
| 3. ...                    |  Say: "<oral frame>"                    |
+---------------------------+----------------------------------------+
| Guided Practice:  (We Do) 2-4 cells, same anatomy, hints, no trace |
+--------------------------------------------------------------------+
```

| Id | Rule |
|---|---|
| P-LC-1 | The Opener bands appear in this order and no other: What's New, Vocabulary and / or Rule, Warm-up, Steps beside Model, Guided Practice. Printed band labels are the fixed strings of the design standard (BD-1), never capitals. A band with no content is omitted; the order of the rest does not change. |
| P-LC-2 | **What's New** is exactly one sentence that begins "This time you will". It names the single change from the previous step (P-1). When the change is a support being removed, the sentence names that support ("… without the picture", "… without the regroup boxes"). |
| P-LC-3 | **Vocabulary / Rule** holds at most 3 terms (P-15). When place-value letters are in use, this band is where the full words appear once (ones, tens, hundreds, thousands). |
| P-LC-4 | **Warm-up** holds 2-4 items that rehearse the prerequisite the step leans on (count back from 12; say the multiples of 5; 10 + 4). Items are oral or one-mark. The Warm-up never previews the new step. |
| P-LC-5 | **Steps** sit beside the Model, never above or below it, so that each numbered step can be pointed at while the matching mark is made. Steps are a teacher script (P-5) and can be hidden by an OPTION ("Show steps", default on for the Opener, off everywhere else). |
| P-LC-6 | **Model (I Do)** has 2 items: item 1 fully answered in grey trace (scaffold level 3), item 2 identical in anatomy but blank, worked aloud by the teacher while pupils copy. Model cells are unlabelled. The band ends with the oral frame (P-17). |
| P-LC-7 | **Guided (We Do)** has 2-4 items at scaffold level 2: all the step's hints, no traced answer. Guided cells are unlabelled. |
| P-LC-8 | Guided practice is delivered with a four-rung prompt fade. The rungs are printed in the teacher footer of the Opener, not in the pupil area: (1) the teacher does the step and says it, pupils repeat it together; (2) the teacher asks "What comes next?", the group answers, the teacher writes; (3) one pupil at a time names the next step, everyone writes; (4) the teacher says only the step number, pupils do and say the step. |
| P-LC-9 | Algorithms with 3 or more steps also get a **scripted Model page**: one problem redrawn once per step, left to right and top to bottom; in each redraw only the newest marks are grey, all earlier marks are black; the step's sentence sits under its redraw. |

### 2.2 The pages that follow the Opener

```
Opener -> [scripted Model] -> [Guided page] -> Independent 1..N -> More Practice A..J
       -> (every 2-3 steps) Review -> (end of ladder or sub-unit) Test A / Test B
Pre-skill check: before the first step of a ladder.
```

| Page role | Release stage | Scaffold level | Items | Labels |
|---|---|---|---|---|
| Opener: Model | I Do | 3 | 2 (1 traced + 1 blank) | none |
| Opener: Guided | We Do | 2 | 2-4 | none |
| Scripted Model page | I Do | 3 | 1 problem, redrawn once per step (3-8 redraws) | step numbers |
| Guided page (optional, Levels 3-6) | We Do, partner | 2 | same cap as Independent | none (Guided cells are never labelled or scored) |
| Independent | You Do | 1 | see item caps below; usually 2 pages = 12 items per step | letters a. b. c. running on across the lesson |
| More Practice A-J | You Do, repeat | 1 (or 2 by OPTION) | same cap as Independent; up to 10 parallel seeded pages | letters restart at a. on each page; page tag "More Practice C" |
| Sub-skill / Decision | You Do | 1 | 8-16 one-mark items | letters, restart at a. |
| Error analysis | You Do | 1 | 6 (4 for long algorithms) | letters, restart at a. |
| Review | You Do | 1 | 8-20; total from {8, 10, 12, 16, 20} (P-23) | letters, restart at a. |
| Test A / Test B | assessment | 0 | 8, 10, 12, 16 or 20 (4 for long algorithms) | letters, restart at a. |
| Pre-skill check | assessment | 0 | one boxed section per prerequisite, 4 or 5 items each; total from {8, 10, 12, 16, 20} | letters inside each box |

**Item caps per page.** These are teaching caps at any size, not layout results. The design standard's
density table (12.1) sets the ceiling for each size S / M / L; the layout engine may place fewer than a
cap, never more.

| Item kind | Cap per page |
|---|---|
| Standard computation cell (2 rows x 3) | 6 |
| Digit-grid or long algorithm cell (2 x 2) | 4 |
| Multi-step template (Step 1 / Step 2 columns) | 2 |
| Scaffolded word problem (v1) | 1 |
| Faded word problem (v2) | 2 |
| One-mark items (circle, tick, shade, match) | 8-16 |
| Review | 8-20 |
| Test | 8, 10, 12, 16 or 20 (4 for long algorithms) |
| Fact probe | 20; fact-family probe 40. Fact rows at 5-10 columns follow the design standard's capacity table, split into Day bands of 30 facts or fewer |

| Id | Rule |
|---|---|
| P-LC-10 | If the chosen item count does not fit at the chosen size, the content paginates or the item count drops to the next allowed total. Content never shrinks to fit. |
| P-LC-11 | Level K uses a one-page cycle: 2 Model, 2 Guided, 2 on my own, in three bands on one page. Number-recognition lessons at Level K replace the Steps band with the fixed daily routine **count aloud, find the numeral, write the numeral, put numbers in order**. |
| P-LC-12 | Levels 3-6 may split the cycle over separate pages (scripted Model page, Guided page for partner work, Independent pages). The title and the running letters carry across all of them. |
| P-LC-13 | Every page has a companion answer key that is a facsimile of the page with the answers filled in. It is never a list of raw answers. |
| P-LC-14 | A suggested 45-minute block (guidance, not a rule; printed nowhere on pupil pages): number warm-up 5-10 min, Model 5, Guided 10, Independent 15, fact fluency 5, one closing word problem. |

---

## 3. The core rule set

### Sequencing

**P-1 One new thing per step.** Compared with the same page role of the previous step, exactly one of
these changes: `range` (number size or the fact set), `representation`, `format` (vertical / horizontal /
notation), `unknown` (position of the unknown), `opMix` (which operations appear), `scaffold` (one
support removed), `responseScope` (the contract's values: `decision` = decide-only, `notation` = notate-only, `setup` = set-up-only, `judge` = check-only, `answer-only`, `full`). Each step
stores that one change as `delta` and a one-sentence `whatsNew` beginning "This time you will".
*Test:* the ladder validator rejects a step with zero or several deltas; the string check rejects a
`whatsNew` that does not start with the stem or has more than one sentence.

**P-2 One strategy per ladder.** A ladder teaches one way of getting the answer. A second strategy is a
separate, optional ladder placed after the first. House strategies:

| Topic | First ladder | Separate optional ladders |
|---|---|---|
| Addition facts | Count on from the bigger number with a dot cue | Doubles and doubles plus one; make ten |
| Subtraction facts | Count back with a dot cue | Think addition (fact families); halves of doubles |
| Multiplication facts | Skip count on a count-by strip | Known-fact strategies (double a double, ten minus one group) |
| Division facts | Skip count the divisor into a tally box | Think multiplication (the think box) |
| Multi-digit multiplication | Standard algorithm on a digit grid | Area (box) method |
| Rounding | Number line, then a cut line after the target place | — |
| Word problems | Schema and structure rule (section 8) | Keyword checklist panel (teacher OPTION) |

*Test:* each ladder record has exactly one `strategy` value; no step's `teacherSteps` reference another
strategy.

**P-3 The title is "I Can <verb> <object> (<constraint>)".** It is centred, bold and identical on every
page of the step: Opener, Independent, More Practice. Review and Test pages use "Review: <object>" and
"Test A: <object>" / "Test B: <object>". The constraint in brackets states the number limit or the
support in plain words ("sums to 10", "with regroup boxes", "no remainders").
*Test:* string equality across the pages of one packet; title begins "I Can ", "Review: " or "Test ", or is one of the other fixed titles of design standard HD-13 ("Pre-skill check: <object>", "Mixed practice", "Daily review", "Daily 4", "True or False?", "Reason It", "Stretch", "Today's Number", a fact stub).

**P-4 A worked example comes first.** The first item a pupil meets in a new step is fully answered in
grey trace. Stand-alone practice pages printed without an Opener offer the OPTION "Worked first cell"
(default off), which renders cell a at level 3.
*Test:* every Opener has a level-3 cell before any blank cell.

**P-5 Steps are 3-6 numbered imperatives of 10 words or fewer.** Each starts with a verb from the print
verb list (section 10.2). A step may carry one line of quoted self-talk after it ("Think: is 3 less than
7?") of 8 words or fewer. The last step is always a check or the oral frame ("Check: add the answer and
the bottom number." / "Say the equation."). Steps are teacher-facing and hideable.
*Test:* count, word count, first-word lookup, last-step pattern.

**P-6 The format never changes inside a step.** Model, Guided, Independent, More Practice, Review and
Test items of one step use the same cell anatomy: the same layout, the same answer-slot shapes, the same
position of every part. Only the scaffold level differs.
*Test:* the cell template id and its slot map are identical across the page roles of a step.

**P-7 Scaffolds come in two classes.** Hint scaffolds fade in a fixed order, one per step, and on a
practice page appear in the first cell only. Structural scaffolds persist until a dedicated fade step.
Full definition in section 4.
*Test:* per-level scaffold sets are nested (level 3 contains 2 contains 1 contains 0); on a level-1 page
only the first cell has hint marks.

**P-8 Concrete, pictorial, abstract, with a bridging step.** A new concept begins with a picture of the
quantity. Exactly one bridging step shows the picture and the symbols in the same row of the cell.
Pictures are gone within two further steps. Fading inside a page (picture rows first, bare rows after) is
allowed on the bridging step only.
*Test:* each concept ladder has one step with `representation: 'bridging'`, preceded by a pictorial step
and followed within two steps by an abstract step.

**P-9 Isolate sub-skills before combining them.** Where a procedure has a decision, a notation or a
set-up that pupils get wrong, the ladder has a step that practises only that part: decide-only,
notate-only, set-up / rewrite-only, check-only. These steps say so in the title or instruction ("Do not
solve.").
*Test:* a procedure ladder of 3+ algorithm steps has at least one step with a non-`full`
`responseScope` before its first `full` step.

**P-10 Seed edge cases and non-examples.** Every Independent, Review and Test set of 6 or more items
includes at least one boundary item for the skill (zero, one, no regrouping needed, no remainder, a
fraction equal to one, dividend smaller than divisor, addends of unequal length, a repeated digit). Rule
and concept pages mix examples with non-examples at between 1:3 and 1:1.
*Test:* each skill declares `edgeCases[]`; the content audit finds at least one per seeded set.

**P-11 Add a discrimination step wherever two procedures collide.** Examples: regroup or not; add or
multiply; missing addend or missing factor; "can these fractions be added yet?"; area or perimeter. The
response is a tick-box beside a rule sentence, or "Circle the problems you can solve. Solve only those."
*Test:* every pair listed in a ladder's `collidesWith[]` has a step of kind `discriminate`.

**P-12 Numbers stay small while a step is new.** Number size is a setting separate from the step
(`state.range`, `state.decimalPlaces`). A procedure step's default range is the smallest that shows the
procedure. The range rises in a later step whose only delta is `range`.
*Test:* a step with a non-`range` delta has the same `constraints.range` as its predecessor.

### Responses and language

**P-13 Responses are low-load.** The order of preference: circle, tick, match, shade; then a digit in a
box; then a number on a line with its unit word pre-printed; then a sentence frame with one or two
blanks. Pupils never compose a sentence. The shape of the answer slot tells the shape of the answer (see
the answer-slot table in the design standard).
*Test:* no pupil page has an unruled "explain" area; every sentence frame has 2 blanks or fewer, each a
number or a word from a printed bank of 4 words or fewer.

**P-14 Instructions use a controlled library.** One instruction line per section, 12 words or fewer, up
to three short imperative sentences, taken word for word from the instruction library (section 10.1).
Key words are underlined, never coloured, never in capitals. When a task needs several marks, each mark
gets its own verb (Circle … Box … Cross out …).
*Test:* every printed instruction resolves to a library key; word count; verbs from the list.

**P-15 Vocabulary is capped at 3 terms per step.** Each term has a one-sentence plain gloss and a
labelled mini-diagram. Known confusions get a "Remember … NOT …" line (section 10.4).
*Test:* `vocabulary.length <= 3`; each entry has `term`, `meaning` (the gloss), `diagram`.

**P-16 Both orientations, every unknown position.** Every fact or computation ladder has one step whose
only delta is the second orientation (vertical first, then horizontal). From that step on, practice
includes both orientations in separate sections. Every equation ladder cycles the unknown through all
positions (result, second term, first term; and the equals sign on the left), one position per step,
then mixed.
*Test:* coverage check over the ladder's steps and over a seeded sample of the skill.

**P-17 Every Model ends with an oral frame.** A fixed sentence with blanks that the pupil reads aloud
with the numbers in ("__ plus __ equals __."). Pupils state the steps and the result; they are not asked
to explain their thinking in open speech. Online, the frame is the "Say it" line spoken by
text-to-speech.
*Test:* every step has `oralFrame`; every Opener prints it under the Model.

**P-18 Art is functional only.** A picture is either something to count or something that carries the
mathematics. No decoration inside cells, no mascots, no borders. Pages are age-neutral. The tab says
"Level N". Counting objects come from the teacher's chosen set (plain counters or the 8 in-house
line-art pictures). Coins are generic value circles (1, 5, 10, 25).
*Test:* manual review; emoji and colour lints.

**P-19 Digits must be unambiguous.** Question content is set in Andika so that 1 has a flag, 4 is open,
and a and g are single-storey. A digit is never confusable with a letter on a pupil page.
*Test:* computed font on question content resolves to Andika.

**P-20 Pupil pages say "Level N".** Grade and CCSS code appear only in the small teacher footer, never
in a cell, a title or a tab.
*Test:* text search of the pupil area for "Grade" and for CCSS code patterns.

### Application, review, assessment

**P-21 Word problems follow computation.** In a ladder, the word-problem step comes after the
computation steps at the same range. A set uses one schema. Each sentence sits on its own line, a schema
diagram is supplied, the unit word is pre-printed after the blank, and the operation is chosen by a
first-person structure rule, not by a keyword alone. Every problem exists in a scaffolded version and a
faded version from the same seed (section 8).
*Test:* ladder order; set-level schema check; sentence-per-line lint.

**P-22 Cumulative review is mechanical.** A Review follows every 2-3 steps. 25-35% of its items come
from earlier steps or units. A taught step enters daily review the next school day as a strip of 2-4
items with its supports, and stays at least 15 school days (section 7).
*Test:* ladder checkpoints; mix ratio computed on the generated Review.

**P-23 Assessment mirrors practice.** Review and Test use the practised cell formats in teaching order.
Forms A and B are seeded and reproducible: the same item templates, new numbers, a new order; for fact
tests, the same facts reordered or commuted. Totals are limited to 8, 10, 12, 16 or 20 (4 for long
algorithms, which print 4 to a page) so percentages are easy. The Score field always prints its denominator. A facsimile answer key is produced.
*Test:* same seed gives the same form; A and B share a template multiset; total in the allowed set.

**P-24 Extra support means the same format one level up.** When a pupil needs more help, the next page
(More Practice) or the next on-screen item is the same cell at the next higher scaffold level. It is
never a different format, a different strategy or an easier skill. The teacher chooses this on paper;
online it is offered on request and after two wrong attempts at an item (P-ON-7).
*Test:* More Practice OPTION "with hints" changes only `scaffoldLevel`.

**P-25 A pre-skill check opens every ladder.** The ladder lists its prerequisite steps. The check has
one boxed section per prerequisite, 4 or 5 items each, a small per-section score (`__/4`), and two
parallel forms. Its purpose is to tell the teacher what to pre-teach; it unlocks nothing.
*Test:* every ladder has `preSkillCheck.skills.length >= 1` (one boxed section per listed skill) and two forms.

**P-26 Cues are colour-free and carry fixed meanings.** Dotted or grey = trace or model. Dashed = cut
here, and nothing else (the unknown part of a diagram is a solid box marked `?`). Solid versus hollow = the two sets being compared or combined.
Square box = a digit or number; circle = a sign or symbol; rounded box = something to read or think
about; square-cornered box = structure. Bold place letter = the target place. Underline = the key word
or the part to work first. The design standard owns the drawing of each.
*Test:* manual review against the design standard's line-style table.

### Options and governance

**P-27 Any skill on any page role.** Every skill must render on every page role in the list in section
0. Fact-like skills additionally get the high-column fact layouts (fact rows at 5-10 columns, fact probe,
fact-family intro / warm-up / probe, practice strips) and must still work on every other role. A skill
without `workedSteps`, `wrongAnswer` or `decision` data uses the default adapters in the Skill Cell
Contract; a page role is withheld only when the contract says the needed data cannot be derived.
*Test:* the compliance matrix renders skill x page role with no blank cells for migrated families.

**P-28 No silent mixing.** A section contains one problem type in one notation unless the teacher chose
"Mixed". When a section is mixed, its instruction says so ("Add or subtract. Look at the sign."), and the
first mixed exposure in a ladder is a discrimination step (P-11).
*Test:* in a non-mixed section all items share `variant` and `notation`.

**P-29 Print and screen are the same item.** The on-screen card is the printed cell with inputs in place
of blanks. A production item (write the number) is never turned into multiple choice on screen unless
the paper item is multiple choice.
*Test:* response-mode parity check per cell template.

**P-30 Accuracy before speed.** Fluency pages are untimed by default. The "(1 minute)" tag, the Time
line and the Goal line are teacher OPTIONS, off by default. MathQuest stores no times and no goals.
*Test:* default dialog state; no persistence keys for times or goals.

**P-31 Options, not policy.** These are remembered teacher tick-boxes, with these defaults:

| Option | Default |
|---|---|
| Hints on tests | off |
| Keep structural supports on tests | on |
| Show steps (Opener) | on |
| Worked first cell (stand-alone practice pages) | off |
| More Practice with hints (level 2 instead of 1) | off |
| "(1 minute)" tag, Time line, Goal line | off |
| Think box above division facts | off |
| Fact cue style | dot tile beside the smaller numeral (alternative: dots on the numeral) |
| Place-value labels | letters (alternatives: words, none) |
| Word-problem support | schema (alternative: keyword checklist panel) |
| Problem mix per section | one type and notation (alternative: mixed) |
| Counting objects | plain counters (alternative: line-art pictures) |
| Units in generated items | both customary and metric (alternatives: customary only, metric only) |

*Test:* each option exists in the print dialog, persists, and has the stated default.

**P-32 US / Common Core conventions.** The term is "regroup" (never borrow, carry, exchange or rename in
pupil text). Thousands use a comma separator. Long division uses the US bracket. Customary and metric
units are both supported. Pupil-facing strings use US spelling.
*Test:* banned-word search of pupil strings; number formatter check.

**P-33 Original, neutral content.** Every story, title, instruction and example is MathQuest's own
wording. Contexts are neutral for an international school (section 8.6). No third-party curriculum's
wording, page names or branding appears on any page or in any document.
*Test:* manual review; banned-term list in the static lint.

**P-34 Feedback never erases the pupil's work.** On screen, a wrong digit stays visible with a cross
beside it; regroup boxes and other working marks are never marked right or wrong (section 11.3).
*Test:* UI test: after a wrong entry the entered value is still in the input; regroup inputs carry no
feedback state.

---

## 4. Scaffolds

### 4.1 Two classes

| | Hint scaffolds | Structural scaffolds |
|---|---|---|
| What they are | Extra marks that show what to do or where to look | The frame the work is written in |
| Examples | Grey trace digits; pictures of the quantity beside the symbols; small captions naming a blank ("ones total"); the dot tile or dots on a numeral; a pre-filled count-by strip; a number strip; a circled bigger number; an arrow over the ones column; an underlined first part; a partly traced first mark; the think box above division facts (OPTION, grey; when ticked on it prints in every cell of its section) | Digit grid; regroup boxes; place-value letters H T O (Th); tally box; an empty count-by strip the pupil fills in; equation frame; work grid; estimation box; factor-tree stubs |
| Purpose | Teach the step | Accommodate handwriting, alignment and memory |
| Life | Temporary. Fade in the fixed order below, one per step | Persist through every page of the step, including Review. Removed only by a dedicated step whose single delta is that removal |
| On a practice page | First cell of the page only | Every cell |
| On tests | Off (OPTION "Hints on tests") | On (OPTION "Keep structural supports on tests") |
| Print colour | The one flat 40% grey, or hatching / dotted outlines in Photocopy-safe mode | Black hairlines |

### 4.2 The fixed fade order for hints

A ladder removes its hints in this order, one per step, skipping any it never used. A hint that has been
removed does not come back in a later step of the same ladder (it may return by teacher choice under
P-24).

| Order | Hint | Goes when |
|---|---|---|
| H1 | Picture of the quantity beside the symbols | Within two steps after the bridging step (P-8) |
| H2 | Captions inside the cell that name a blank or a part | When the blanks have been used for one full step |
| H3 | Count cue: dot tile or dots on the numeral, pre-filled count-by strip, number strip | Fluency part 2 (section 6.3) or the next procedure step |
| H4 | Attention marks: circled number, column arrow, underlined first part, bold target place | Fluency part 3 or the next procedure step |
| H5 | Partial trace: the first mark or first digit in grey | Last to go |

The fully traced answer is not in this list: it belongs to level 3 only.

### 4.3 Scaffold levels 3 to 0

```
level 3  MODEL        [trace answer] + all hints + all structure     I Do
level 2  GUIDED                        all hints + all structure     We Do
level 1  INDEPENDENT  hints in first cell only   + all structure     You Do
level 0  TEST                          no hints  + structure (option) assessment
```

| Level | Used by | Answer | Hints | Structure |
|---|---|---|---|---|
| 3 | Model cells; scripted Model page; online Learn: worked | Grey trace | Every hint the step declares | All |
| 2 | Guided cells; Guided page; More Practice "with hints"; online Learn: guided | Blank | Every hint the step declares for level 2 (never a traced answer) | All |
| 1 | Independent; More Practice; Sub-skill; Error analysis; Review; daily review strip; Daily Spiral panel; Mixed practice; thinking pages; online Practice and Mixed review | Blank | The step's level-1 hints in the first cell of the page (cell a, or the first cell of each section on a multi-section page); none elsewhere | All |
| 0 | Test A/B; pre-skill check; fact probe parts 3-4; Daily 4; online Test | Blank | None. With "Hints on tests" ticked the page renders as level 1 | Kept by default. With "Keep structural supports" unticked the cell is bare: problem and answer slot only |

| Id | Rule |
|---|---|
| P-SC-1 | Each step declares its scaffolds per level: `scaffolds: {3: [...], 2: [...], 1: [...], 0: [...]}`. The sets are nested: every token at level n is also present at level n+1. |
| P-SC-2 | A page role asks for a level; it never names individual scaffolds. The cell renderer draws whatever the step declares for that level. |
| P-SC-3 | Across the steps of a ladder, the level-2 hint set never grows except at a step whose delta is `representation` (a new picture brings its own hints). |
| P-SC-4 | Removing a structural scaffold is a step of its own, with `delta: 'scaffold'`, a What's New sentence that names the support, and its own Model. |
| P-SC-5 | Hints on tests, structural supports on tests, and all timing marks are teacher OPTIONS (P-31). No page type hard-codes them. |
| P-SC-6 | The think box above division facts is an optional helper drawn in grey. It is a place to write the related multiplication fact. The black answer line is the only place an answer goes, and only the answer line is checked on screen. |
| P-SC-7 | Place-value labels default to bold letters (H T O, and Th) above the columns. The full words appear once in the Model cell and in the vocabulary box of the step that introduces them. |
| P-SC-8 | In Photocopy-safe mode the meaning of every scaffold is unchanged: grey fills become fine 45-degree hatching and trace digits become dotted outlines. No scaffold may depend on grey being distinguishable from black. |

---

## 5. Atomisation: how a skill becomes a ladder

### 5.1 The generic ladder

```
 0  pre-skill check          (assessment, two forms)
 1  concept                  picture of the idea; one-mark responses
 2  bridging                 picture and symbols in the same row
 3  decide-only              "Do you need to ...?"  tick a box; do not solve
 4  notate-only              make the marks of one sub-step; do not solve
 5  set-up / rewrite-only    write the problem in the grid; do not solve
 6  full procedure           all structure, all hints, small numbers
 7  fade                     hints go in the fixed order, one per step;
                             then a dedicated step removes each structure
 8  special cases            zeros, ones, ragged lengths, no-regroup mixed in
 9  second orientation       across as well as down (or the reverse)
10  discrimination           where this procedure collides with another
11  word problems            one schema per set, v1 then v2
12  review                   after every 2-3 steps throughout, not only here
13  test A / test B
```

Not every ladder has every rung. The order of the rungs that are present does not change, except that
Review steps are inserted every 2-3 steps and range-only steps may follow any procedure step.

| Id | Rule |
|---|---|
| P-AT-1 | A step record holds: `id`, `kind`, `iCan`, `whatsNew`, `delta`, `skillId`, `constraints`, `representation`, `responseMode`, `teacherSteps`, `vocabulary`, `oralFrame`, `instructionKey`, `scaffolds` by level, `pages`, `items`, `variants`. A ladder adds `strategy`, `prerequisites`, `collidesWith`, `checkpoints` (reviews and tests) and `preSkillCheck`. It holds nothing about pupils. |
| P-AT-2 | `kind` is one of: concept, bridging, decide, notate, setup, procedure, range, fade, case, format, discriminate, apply, review, test. A `range` step repeats the previous procedure with bigger numbers or the next fact set and nothing else. |
| P-AT-3 | `delta` is one of: range, representation, format, unknown, opMix, scaffold, responseScope (P-1). The first step of a ladder has `delta: 'start'`. |
| P-AT-4 | A ladder references existing skill ids. It never renames a skill and never touches share codes. A step is a constrained slice of a skill: "which numbers, which picture, which supports, which page". |
| P-AT-5 | Fact ladders introduce one fact set per step (Add 3; the 4 times table). A set's pages contain only that set until its cumulative review, which mixes it with earlier sets. |
| P-AT-6 | A decide-only, notate-only or set-up-only step uses the full procedure's cell with the unused parts absent, not greyed, so the pupil is not tempted to solve. |
| P-AT-7 | Validators (unit tests over the data): one delta per step; one strategy per ladder; nested scaffold sets; item counts within the caps; a Review at least every 3 steps; a Test with two forms; a pre-skill check with two forms; every `skillId` exists; every `instructionKey` exists; every `whatsNew` starts with the stem. |
| P-AT-8 | A skill without a ladder keeps today's behaviour and still reaches every page role (P-27). Its Opener bands are built from the skill's default strings. |

### 5.2 Worked example ladders

Eleven ladders follow. Each is written as a table: step number, kind, the "I Can" object, the one change,
and what the cell asks for. Review steps are shown once per block; in the data a Review follows every 2-3
steps. Titles are shown without the leading "I Can" and are capitalised here only so the tables scan; the
printed title is sentence case after "I Can" with no closing period (design standard HD-10).

#### L-1 One-digit addition (sums to 18)

Strategy: count on from the bigger number with a dot cue. Prerequisites: count on aloud from any number
to 20; read numerals 0-20; tell which of two numbers is bigger.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Join Two Groups and Count | start | Two groups of counters; frame `__ + __ = __` with the addends printed; write the total. |
| 2 | bridging | Add With a Picture and Numbers | representation | The picture and the vertical fact in the same row. |
| 3 | decide | Circle the Bigger Number | responseScope | Fact shown, no answer line. Circle only. "Do not add." |
| 4 | procedure | Add 1 and Add 2 (count on) | responseScope: full | Vertical. Bigger number circled, dot tile beside the smaller number (cue part 1). Say the bigger number, then count on, one count for each dot. |
| 5 | format | Add 1 and Add 2 Written Across | format | The same facts, horizontal. Both orientations from here on, in separate sections. |
| 6-12 | procedure | Add 3 … Add 9 (one set per step) | range | New set only. Pages run cue parts 1, 2, 3; part 4 is the cumulative 20-item review of all sets so far. |
| 13 | case | Add 0 and Use Turn-Around Facts | range | `n + 0`; pairs such as 3 + 6 and 6 + 3 side by side from a part-whole box. |
| 14 | concept | Tell If Two Sides Are Equal | representation | Ten frames on each side of `=`; tick True or False; includes `7 = 3 + 4`. |
| 15 | procedure | Find the Missing Number (with tallies) | unknown | `5 + __ = 8` with a tally space; count up and tally. |
| 16 | fade | Find the Missing Number | scaffold | Tally space removed; unknown in second, then first position. |
| 17 | apply | Solve Addition Stories | representation | Change (join) and part-whole stories, result unknown, schema v1 then v2. |
| 18 | test | Test A / B: Addition Facts | — | 20 items, both orientations, level 0. |

Sibling ladders that reuse this pattern: adding at Level K (pictures, then a ten frame, then
draw-your-own marks); teen number plus one digit (add 10 first, then +1 to +3, +4 to +6, +7 to +9);
three addends (cue kept to sums of 10, then 15, then 20, then across, then no cue, then stories).

#### L-2 One-digit subtraction (from 18 or less)

Strategy: count back with a dot cue on the number being subtracted. Prerequisites: count back aloud from
any number to 20; L-1 steps 1-5.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Take Away and Count What Is Left | start | Counters; cross out; frame `__ - __ = __` with the first two numbers printed. |
| 2 | bridging | Subtract With a Picture and Numbers | representation | Picture and vertical fact in one row. |
| 3 | procedure | Subtract 1 and Subtract 2 (count back) | responseScope: full | Vertical. Dot tile beside the number being subtracted. Warm-up band: count back aloud, number strip available. |
| 4 | format | Subtract 1 and Subtract 2 Written Across | format | Horizontal. |
| 5-11 | procedure | Subtract 3 … Subtract 9 (one set per step) | range | First page with the dot tile printed (cue part 1); second page with the tile removed (cue part 2); cumulative 20-item review after each set. |
| 12 | case | Subtract 0 and Subtract a Number From Itself | range | `n - 0`, `n - n`. |
| 13 | procedure | Find the Missing Part | unknown | Part-whole box with one part missing, then `9 - __ = 4`. |
| 14 | discriminate | Add or Subtract: Look at the Sign | opMix | Circle the sign first, then solve. Mixed + and - facts. |
| 15 | apply | Solve Subtraction Stories | representation | Change (separate) and part-whole (part unknown), v1 then v2. |
| 16 | test | Test A / B: Subtraction Facts | — | 20 items. |

#### L-3 Two-digit addition and subtraction without regrouping

Strategy: standard algorithm, ones first. Prerequisites: facts within 10; tens and ones.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | bridging | Add Tens and Ones | start | Base-10 picture beside a labelled T O digit grid. Arrow over the ones: start here. |
| 2 | setup | Write an Addition Problem From Blocks | responseScope | Two base-10 pictures; write the digits into the grid. "Do not solve." |
| 3 | procedure | Add Two-Digit Numbers | responseScope: full | Labelled grid, no picture. |
| 4 | procedure | Subtract Two-Digit Numbers | opMix | Same grid, subtraction only. |
| 5 | case | Leave Off a Zero at the Front | range | Answers such as 47 - 42: examples and non-examples; cross out the zero that is not needed (not the zero in 40). |
| 6 | setup | Rewrite a Problem in the Grid | format | Horizontal problem above an empty grid; first one traced. "Do not solve." Then a section that solves. |
| 7 | fade | Add and Subtract Without Labels | scaffold | T O letters removed; grid lines stay. |
| 8 | case | Add or Subtract a One-Digit Number | range | 34 + 5, 68 - 6: line the ones up under the ones. |
| 9 | discriminate | Add or Subtract: Look at the Sign | opMix | Circle the sign, then solve. |
| 10 | apply | Solve Two-Digit Stories | representation | Work grid beside the story. |
| 11 | review / test | Review; Test A / B | — | 16 items, level 0. |

#### L-4 Addition with regrouping

Strategy: standard algorithm with a regroup box above the next column. Pre-skill check sections: facts
with sums 10-18; "10 + n"; two-digit addition without regrouping.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Trade 10 Ones for 1 Ten | start | Base-10 picture; ring ten ones; write `__ tens __ ones`. |
| 2 | decide | Tell When I Need to Regroup | responseScope | Add the ones only; tick "Regroup" or "No regrouping". "Do not solve." |
| 3 | notate | Write a Ones Total as Tens and Ones | responseScope | Ones column only: the ten goes in the regroup box, the ones go in the answer box. |
| 4 | procedure | Add Two-Digit Numbers With Regrouping | responseScope: full | Regroup box above the tens, T O letters. Sets include no-regroup items (P-10). |
| 5 | setup | Rewrite and Add | format | Horizontal to grid, then solve. |
| 6 | apply | Solve Regrouping Stories | representation | Work grid with a regroup row. |
| 7 | range | Add Three-Digit Numbers (regroup the ones) | range | H T O, one regroup box. |
| 8 | range | Add Three-Digit Numbers (regroup the tens) | range | Box above the hundreds. |
| 9 | range | Add Three-Digit Numbers (regroup twice) | range | Two boxes; addends of unequal length included. |
| 10 | case | Add When the Answer Needs a New Place | range | 68 + 57; 999 + 1. |
| 11 | range | Add Four-Digit Numbers | range | Th H T O; comma in the answer. |
| 12 | range | Add Three, Then Four Numbers | range | Column totals above 19: regroup 2. |
| 13 | fade | Add Without Regroup Boxes | scaffold | Boxes removed; pupils write the small digit themselves. |
| 14 | review / test | Review; Test A / B | — | Reviews interleave subtraction without regrouping (25-35%). |

#### L-5 Subtraction with regrouping, including across zeros

Strategy: standard algorithm; regroup from the next place. Pre-skill check sections: subtract without
regrouping; which number is greater; teen minus one digit; 10 + digit; one less than a tens number
(30 - 1); tens and ones.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Trade 1 Ten for 10 Ones | start | Base-10 picture: cross out one rod, draw ten ones; write the new tens and ones. |
| 2 | decide | Tell When I Need to Regroup | responseScope | Look at the ones. Top digit smaller? Tick "Regroup" or "No regrouping". No computing. Includes zero in the ones and two-digit minus one-digit. |
| 3 | bridging | Regroup With a Picture | representation | Picture and grid in one row. |
| 4 | notate | Show the Regrouping | responseScope | A bare number with regroup boxes: cross out the tens, write one less, write the new ones. No subtraction. |
| 5 | procedure | Subtract With Regrouping (with boxes) | responseScope: full | Regroup boxes, T O letters. |
| 6 | fade | Subtract With Regrouping (no boxes) | scaffold | Mixed with no-regroup items and two-digit minus one-digit. |
| 7 | setup | Rewrite and Subtract | format | Horizontal to grid. |
| 8 | apply | Solve Regrouping Stories | representation | Work grid with a regroup row. |
| 9 | review / test | Review; Test A / B | — | One-page review, 16-item tests. |
| 10 | range | Subtract Three-Digit Numbers (regroup a ten) | range | |
| 11 | range | Subtract Three-Digit Numbers (regroup a hundred) | range | |
| 12 | range | Subtract Three-Digit Numbers (regroup twice) | range | |
| 13 | notate | Regroup Across a Zero | responseScope | 304: a wide box over the hundreds and tens so that "30 tens" becomes "29 tens", and the ones get 10 more. Notation only. |
| 14 | case | Subtract Across a Zero | responseScope: full | Zero in the tens. |
| 15 | range | Subtract Four-Digit Numbers | range | |
| 16 | notate, then case | Regroup Across Two Zeros | range | 4,000: a wide box over the first three digits so that "400 tens" becomes "399 tens", and the ones get 10 more. Notation page first, full page second. |
| 17 | review / test | Review; Test A / B | — | |

#### L-6 Multiplication: concepts and facts

Strategy: skip count on a count-by strip. Prerequisites: skip counting by 2, 5, 10; repeated addition.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Count Equal Groups | start | Picture; frame `__ groups of __`. Includes one group, groups of 1 and empty groups. |
| 2 | concept | Read an Array | representation | `__ rows, __ in each row`; small count numerals on the first rows, then none. |
| 3 | bridging | Write Adding as Multiplying | representation | `4 + 4 + 4 = __` and `3 x 4 = __` in one row. |
| 4 | discriminate | Tell If I Can Multiply | opMix | Equal groups against unequal groups; tick "I can multiply" or "I must add". |
| 5 | case | Multiply by 1 and by 0 | range | Rule box with examples and non-examples. |
| 6 | concept | Switch the Factors | representation | One array, turned; two facts in digit boxes. |
| 7a | setup | Set Up the 2 Times Table | responseScope | Circle the count-by number, underline how many counts. "Do not solve." |
| 7b | procedure | Multiply by 2 (other factor 1-5) | responseScope: full | Printed count-by strip above the section. |
| 7c | range | Multiply by 2 (other factor 6-10) | range | |
| 7d | fade | Multiply by 2 With My Own Strip | scaffold | Empty strip the pupil fills in first; then no strip. |
| 7e | apply | Solve Equal-Groups Stories (twos) | representation | One story frame, numbers change. |
| 7f | review | Review: 2 Times Table | — | 20 items, either factor position, down and across. |
| 8-15 | — | Repeat 7a-7f for 5, 10, 3, 4, 6, 9, 7, 8 | range | Reviews become cumulative. Fact sets introduce only the new facts and their turn-arounds. |
| 16 | review / test | Unit Review; Test A / B | — | |

#### L-7 Division: concepts and facts

Strategy: skip count the divisor, one tally per count, in a tally box. Prerequisites: L-6 for the same
table; multiples of the divisor.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Ring Equal Groups | start | Picture of a total; ring groups of d; write how many groups. |
| 2 | concept | Read a Division Equation | representation | `12 ÷ 3` with a frame to say: "12 in all, 3 in each group." |
| 3 | notate | Write a Division Equation | responseScope | Labelled blanks: total ÷ in each group = number of groups. |
| 4 | format | Read Division in a Bracket | format | The same fact in both notations; match, then copy. |
| 5 | bridging | Divide on a Number Line | representation | 0-20 line; hop by d to the total; count the hops. |
| 6 | decide | Circle the Multiples of 5 | responseScope | Near misses included (24, 51). Warm-up for ÷ 5. |
| 7 | procedure | Divide by 5 (tally box) | responseScope: full | Count by 5 to the total; one tally per count; write the tally count on the answer line. |
| 8 | case | Divide 0, Divide a Number by Itself, Divide by 1 | range | `0 ÷ 5`, `5 ÷ 5`, `7 ÷ 1`. |
| 9 | range | Divide by 2, 10, 3, 4, 6, 9, 7, 8 (one per step) | range | Review every two steps; both notations. |
| 10 | concept | Build a Fact Family (multiply and divide) | representation | Three numbers, four facts. The optional think box belongs from here on. |
| 11 | concept | Divide With Some Left Over | representation | Ring groups; count the left-overs; frame `__ groups, __ left`. |
| 12 | procedure | Find a Remainder With a Multiples Strip | representation | Pupil writes the strip, finds the last multiple that fits, subtracts. |
| 13 | case | Fix a Remainder That Is Too Big | responseScope: judge | Given answers, some with remainder >= divisor; tick Correct or Fix it. |
| 14 | apply | Solve Sharing and Grouping Stories | representation | Equal-groups schema: groups unknown, then size unknown. |
| 15 | review / test | Review; Test A / B | — | 12 items. |

#### L-8 Long division

Strategy: divide, multiply, subtract, bring down, on a digit grid. Prerequisites: L-7 facts and
remainders; multi-digit subtraction; multiplying a one-digit number.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | decide | Underline the Part I Divide First | start | Bracket problems; underline the first digit, or the first two when the first is smaller than the divisor. "Do not solve." |
| 2 | procedure | Divide a Two-Digit Number (no remainder) | responseScope: full | Scripted Model page first (one redraw per step). Digit grid; 4 per page. |
| 3 | case | Divide With a Remainder | range | `R` slot after the quotient. |
| 4 | range | Divide a Three-Digit Number | range | |
| 5 | case | Write a Zero in the Quotient | range | Items such as 312 ÷ 3. |
| 6 | procedure | Check by Multiplying | responseScope: judge | Given answers, half of them wrong; multiply to check; tick Correct or Fix it. |
| 7 | apply | Solve Division Stories and Use the Remainder | representation | Two unit-labelled questions: "How many full boxes?" "How many left over?" |
| 8 | review / test | Review; Test A / B | — | 12 items. |
| 9 | decide | Round the Divisor to the Nearest Ten | start (two-digit divisors) | Pre-skill taught as a lesson. |
| 10 | notate | Write My Estimate in the Estimate Box | responseScope | Estimation box beside the grid; no dividing yet. |
| 11 | procedure | Divide by a Two-Digit Number (estimate works) | responseScope: full | |
| 12 | case | Fix an Estimate That Is Too Big | range | |
| 13 | case | Fix an Estimate That Is Too Small | range | |
| 14 | review / test | Review; Test A / B | — | Structural supports (grid, estimate box) kept by default. |

#### L-9 Fractions: basic concepts

Strategy: count equal parts in one whole. Prerequisites: count to 12; equal / not equal.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | concept | Tell Equal Parts From Unequal Parts | start | Shapes cut into parts; tick Equal or Not equal. Half the items are non-examples. |
| 2 | concept | Shade One Half | representation | |
| 3 | range | Shade Thirds | range | |
| 4 | range | Shade Fourths | range | Shade n fourths. |
| 5 | concept | Name the Parts | responseScope | Circle halves, thirds or fourths; includes "not cut into equal parts" and an uncut whole. |
| 6 | notate | Write the Denominator | responseScope | Count all equal parts; the numerator is printed. |
| 7 | notate | Write the Numerator | responseScope | Count shaded parts; the denominator is printed; includes more than one whole. |
| 8 | procedure | Write the Fraction | responseScope: full | Captions beside the boxes: "shaded parts" and "equal parts in one whole". |
| 9 | fade | Write the Fraction Without Labels | scaffold | Captions removed. |
| 10 | procedure | Shade to Match a Fraction | unknown | Fraction and its word form given; pupil shades. |
| 11 | case | Show Fractions Equal to 1 and More Than 1 | range | |
| 12 | concept | Compare Unit Fractions | opMix | Two equal wholes; circle the bigger fraction. Remember line: more parts means smaller parts. |
| 13 | review / test | Review; Test A / B | — | |

#### L-10 Fractions on a number line

Strategy: count equal spaces from zero. Prerequisites: L-9 steps 6-8; number lines with whole numbers.

| # | Kind | I Can … | One change | Cell and response |
|---|---|---|---|---|
| 1 | notate | Count the Parts Between 0 and 1 | start | Denominator only. First row marked "one whole starts here / ends here". Count spaces, not marks. |
| 2 | notate | Count the Hops From 0 | responseScope | Numerator only; hop arcs drawn in the first cell. |
| 3 | procedure | Write the Fraction at the Dot | responseScope: full | Points between 0 and 1. |
| 4 | case | Write Fractions at 1 and Past 1 | range | n/n at 1; lines to 2 and 3. |
| 5 | bridging | Match a Shaded Bar to the Line | representation | Shaded bar drawn above the line; write the fraction where the shading ends. |
| 6 | format | Read a Line That Goes Up | format | Vertical line. |
| 7 | bridging | Write the Fraction From Circles, Then Find It on the Line | representation | |
| 8 | notate | Cut a Line Into Equal Parts | responseScope | Guide dots on the line; pupil draws the marks. |
| 9 | procedure | Put a Fraction on the Line | unknown | Fraction given; pupil marks the point. |
| 10 | concept | Compare a Fraction to 1 | opMix | Circle "less than 1", "equal to 1" or "more than 1"; with the line, then without. |
| 11 | review / test | Review; Test A / B | — | |

#### L-11 Numbers to 20, to 120, and three-digit numbers

These are three linked ladders. Each is mostly a daily routine in which the number changes and the page
does not (see Today's Number, section 7.4).

**To 20.**

| # | Kind | What happens | One change |
|---|---|---|---|
| 1 | concept | Fixed daily routine: count aloud, find the numeral, write the numeral, put numbers in order. Ceiling 5. | start |
| 2-n | range | The ceiling rises by one number every few lessons (to 10, then to 20). | range |
| alongside | format | Practice pages rotate the response while the number set stays: circle the numeral; draw that many; match to a dot tile; circle N objects; write the numeral. One rotation per page, never two on a page. | format |
| later | concept | Relationships, one at a time: one more; the number after; the number before; one less. | unknown |
| later | bridging | Teen numbers as ten and some ones: a full ten frame and a part frame beside `10 + __`. | representation |

**To 120.** A sliding window of 10-15 numbers (10-15, 15-25, … 110-120). Within a window the routine is
identical every day. The representation is upgraded, one upgrade per block of windows, in this order:
ten frames; rods and units; a tens-and-ones chart with the blocks drawn; a chart the pupil draws plus
expanded form; H T O letters at 100. The second side of the daily sheet is a 120 chart with 1 more /
1 less / 10 more / 10 less prompts. Rounding to the nearest ten enters late, on a number line.

**Three-digit numbers.**

| # | Kind | I Can … | One change |
|---|---|---|---|
| 1 | bridging | Read Hundreds, Tens and Ones | start (blocks beside an H T O chart) |
| 2 | procedure | Write a Number in Expanded Form | representation |
| 3 | case | Write Numbers With a Zero in Them | range (305, 350) |
| 4 | procedure | Compare Two Numbers | opMix (stacked on an H T O grid; compare from the left; write <, > or = in the circle) |
| 5 | procedure | Round to the Nearest Ten | opMix (number line with the two tens marked, then a cut line) |
| 6 | range | Round to the Nearest Hundred | range |
| 7 | review | Review, then the Today's Number routine daily | — |

Thousands and beyond repeat the three-digit ladder with a comma and Th; block pictures are dropped above
four digits.

---

## 6. Fluency routine

### 6.1 Rules

| Id | Rule |
|---|---|
| P-FL-1 | Fluency practice is daily and short: one probe or fact-row page, 3-5 minutes, inside the lesson block. |
| P-FL-2 | **Single-fact sets.** A fact page practises one set (Add 4; Subtract 7; the 6 times table; Divide by 3). Mixed pages exist only as the cumulative review (part 4) or by the teacher's "Mixed" choice (P-28). |
| P-FL-3 | A new set introduces only the facts not already met, plus their turn-arounds. |
| P-FL-4 | A fact probe has 20 items: 15 vertical and 5 horizontal by default. A fact-family probe holds 40. Dense fact rows (8-10 columns) follow the design standard's capacity table and are split into Day bands of 30 facts or fewer. Forms A and B hold the same facts reordered or commuted. |
| P-FL-5 | **Accuracy before speed.** Pages are untimed by default. Timing marks are OPTIONS: a "(1 minute)" tag beside the title, a `Time ____` line, a `Goal ____` line. When several days are printed as Day bands, the suggested pattern is days 1-4 untimed and day 5 tagged, with day 1 and day 5 holding the same facts. MathQuest records neither times nor goals. |
| P-FL-6 | A suggested personal goal, for the teacher's use only and printed nowhere by default: about 3 seconds per fact, adjusted for the pupil's writing speed. |
| P-FL-7 | Fact skills also appear on every ordinary page role (P-27): an Opener for "Add 4" has What's New, a Model with the cue, Guided, and so on. |
| P-FL-8 | The division think box is off by default (P-SC-6). |
| P-FL-9 | Supports specific to an operation fade in the same four parts: subtraction fades a vertical number strip; multiplication ends with an empty count-by strip the pupil fills in; division keeps a tally box per fact as structure. |

### 6.2 The fact-family sequence

```
INTRO page    -> WARM-UP page     -> PROBES A, B, C, D        -> CUMULATIVE REVIEW probe
triples with     flash-card cells    40 items each, only         all families so far,
all four facts   read aloud;         these 8-10 facts            before new families
answered;        nothing written
read aloud
```

| Id | Rule |
|---|---|
| P-FL-10 | **Intro:** each family is shown as its three numbers with all four facts written out and answered in black. The pupil reads them aloud; the only marks are optional traces. |
| P-FL-11 | **Warm-up:** large single-fact cells, answered aloud with a partner or the teacher. No writing. Online: the fact is shown, the pupil says it, taps to reveal, taps "I was right" or "Show me again" (nothing is stored). |
| P-FL-12 | **Probes A-D:** the same 8-10 facts, reordered and commuted per form. |
| P-FL-13 | A cumulative review probe comes before any new families are introduced. |

### 6.3 The cue fade in four parts

The strategy cue has two interchangeable styles (OPTION): a dot tile (dice or ten-frame pattern) printed
beside the smaller numeral — the default — or MathQuest's own dots drawn on the numeral.

```
part 1            part 2            part 3            part 4
 (8)               (8)                8                mixed sets,
+ 5  [:.:]        + 5               + 5                no cue,
----              ----              ----               cumulative
tile + circle     circle only       no cue
(8) = the bigger number, circled.   [:.:] = a five-dot tile beside the smaller number.
```

| Part | Cue | Scaffold level | Typical use |
|---|---|---|---|
| 1 | Dot tile (or dots on the numeral) and the bigger number circled | 2 | First pages of a new set |
| 2 | Bigger number circled only | 1 | After the count is reliable |
| 3 | None | 0 | The set alone, no cue |
| 4 | None; the set mixed with all earlier sets | 0 | Cumulative review |

| Id | Rule |
|---|---|
| P-FL-14 | Parts are printed in order 1 to 4 across the repeats of a set. The part is chosen in the dialog and shown in the teacher footer, never in the pupil area. |
| P-FL-15 | The circle always goes on the bigger number for count-on addition, and the tile always beside the smaller number (for subtraction, beside the number being subtracted). The cue never reveals the answer. |
| P-FL-16 | Within one page the cue part is the same for every cell: a probe is not a teaching page, so the "first cell only" rule of level 1 does not apply to parts 1 and 2. |

---

## 7. Review routines

### 7.1 Cadence

| Id | Rule |
|---|---|
| P-RV-1 | A Review page follows every 2-3 steps of a ladder; a Test A/B follows each sub-unit or about every 12-15 steps, and the end of every ladder. |
| P-RV-2 | 25-35% of a Review's items come from earlier steps of the same ladder or from an earlier ladder (for 12 items: 3-4; for 16: 4-5; for 20: 5-7). The rest come from the steps since the last Review, in teaching order. |
| P-RV-3 | Review items use the cell format of the step they came from, at level 1. Earlier items are grouped in their own section with their own instruction line unless the teacher chose "Mixed". |
| P-RV-4 | Fact sets get a cumulative review after every set (section 6). |
| P-RV-5 | The default interleave partner for a computation ladder is the inverse or neighbouring operation already taught (addition with regrouping reviews subtraction without regrouping). |

### 7.2 The daily review strip

| Id | Rule |
|---|---|
| P-RV-6 | The school day after a step is taught, it enters daily review as a strip of 2-4 items. |
| P-RV-7 | The strip brings its supports with it: its structural scaffolds, and any reference thumbnail the step used (a fraction wall, a rule box with the conversion fact, a count-by strip). |
| P-RV-8 | A strip stays for at least 15 school days. While it stays it is upgraded: when the ladder's next step is taught, the strip switches to that step. |
| P-RV-9 | "Taught" is read from the Teaching sequence list. With no list, the teacher picks the skills for each panel by hand. No pupil data is involved. |

### 7.3 Daily Spiral Review

A two-page spread by default: a computation page facing a mixed page. A compact one-page version exists
at sizes S and M. Section titles are plain, bold, sentence case.

| Id | Rule |
|---|---|
| P-RV-10 | Panel positions are fixed for the whole run of a spiral: the same kind of task sits in the same place every day (computation top left, word problem top of the mixed page, and so on). Only the numbers and, by rule P-RV-8, the step change. |
| P-RV-11 | Each panel holds one skill at 2-4 items, in that skill's own cell format, at level 1 with supports (P-RV-7). |
| P-RV-12 | The mixed page draws on these panel kinds, chosen by Level: word problem (v2 form), graph or table reading, time, money with generic coins, fraction models, rounding, multiples or skip counting, area and perimeter, in / out table, unit conversion with the fact given in a rule box. |
| P-RV-13 | Pages are coded Week and Day in the footer and seeded from that code, so any day can be reprinted exactly. |
| P-RV-14 | A weekly rhythm for the word-problem and graph panels is suggested: days 1-2 a story with the solving frame; days 3-4 the same graph twice (read-off questions first, compare and combine questions second); day 5 an error-analysis or Stretch item. |

### 7.4 Today's Number

Its own two-sided daily sheet in the Daily look. One number runs through a fixed list of numbered tasks (black number tabs); the layout is
identical for the whole run so that the routine costs no working memory.

| Range | Tasks in order (the first six fill the six bands of side 1; any further task opens side 2) | Side 2 chart or line task |
|---|---|---|
| To 20 | count aloud to it; trace and write the numeral; draw that many counters in a ten frame; tally it; one more / one less; number before / after; mark it on a 0-20 line; compare with a given number | 1-20 strip: fill the gaps; circle Today's Number; count on and back from it |
| To 120 | tens-and-ones chart; draw rods and units; expanded form; 1 more / 1 less; 10 more / 10 less; compare; odd or even; nearest ten on a line | 120 chart fragment with +1 / -1 / +10 / -10 prompts |
| To 1,000 | H T O chart; circle the blocks; expanded form; word form from a bank; 1 / 10 / 100 more and less; compare; round to ten and to hundred | number line between two hundreds; order three numbers |
| To 10,000 and beyond | place-value chart with comma; value of the underlined digit; expanded form; word form; 1 / 10 / 100 / 1,000 more and less; compare and order; round to a named place (cut line) | number line; rounding table for several places |

| Id | Rule |
|---|---|
| P-RV-15 | The task list for a range is fixed; tasks keep their numbers for the whole run. At most 11 tasks (tabs 1-11) over the two sides. |
| P-RV-16 | Versions A-D are a support progression over the same task list, not harder numbers: A = first task of each kind traced, captions on, representations drawn for the pupil; B = no trace, captions on; C = captions off, the pupil draws the representation; D = the most abstract form of every task, later tasks (rounding, ordering) switched on. The number range is a separate setting. |
| P-RV-17 | The first task is always oral (count aloud or read the number aloud). |
| P-RV-18 | Block pictures are dropped above four digits. |

### 7.5 Daily 4

Four boxed retrieval questions a day, five days to a page.

```
Day 1  [ 1 last lesson ] [ 2 last week ] [ 3 last unit ] [ 4 last year ]
Day 2  [ 1             ] [ 2           ] [ 3           ] [ 4           ]
...
Day 5
```

| Id | Rule |
|---|---|
| P-RV-19 | Box 1 draws from the most recently taught step; box 2 from steps taught 4-8 school days ago; box 3 from the previous ladder or unit; box 4 from skills one Level below the pupil's Level. Sources come from the Teaching sequence list (P-RV-9), or are picked by hand. |
| P-RV-20 | Each question is one item in its source skill's own cell at level 0 with structural supports kept (OPTION as for tests). A skill whose cell cannot fit a Daily 4 box supplies a compact variant or is skipped; the cell is never shrunk. |
| P-RV-21 | No instruction line inside a box beyond the library string for that item. The box position tells the pupil nothing about difficulty. The four source labels always appear in the teacher footer; an OPTION "Source captions" (default off) also prints them once per page as column captions above the first Day band, never inside a box. |
| P-RV-22 | Questions are MathQuest-generated. No third-party question set, wording or page name is used. |

---

## 8. Word-problem system

### 8.1 Two supports, both offered

The default support is **schema-based**: the pupil identifies the structure of the story, fills a
diagram, and chooses the operation from the structure. The alternative, a teacher OPTION, is a
**keyword-checklist panel**. All stories are original and neutral.

### 8.2 Schemas by Level

| Level | Schemas | Numbers |
|---|---|---|
| K | Join, Separate (result unknown); Compare and Combine with stacked picture columns. Pictures pre-drawn. | to 10 |
| 1 | Change; Part-whole; Compare — unknown in every position. Missing-part stories ("some … the rest … in all"). | one-digit, then to 20 |
| 2 | The same three with two-digit numbers; three-part part-whole; two changes in a row. Distractor verbs and inconsistent language begin. | to 100 |
| 3 | Equal groups; two-step; perimeter; elapsed time on a timeline; missing-factor stories. | to 1,000; facts to 10 x 10 |
| 4 | Area; multiplicative compare ("times as many"); equal groups with larger numbers; elapsed time; two-step shown as Step 1 / Step 2 columns; remainder interpretation with two unit-labelled questions. | to 10,000 |
| 5-6 | Volume; multi-step; the three additive schemas with decimals; fraction and percent stories with labelled equation boxes that reuse the story's nouns. | decimals per `decimalPlaces` |

### 8.3 Unknown positions and language

| Schema | Unknown positions (all must be generated) |
|---|---|
| Change | result; change; start |
| Part-whole | whole; one part |
| Compare | difference; bigger amount; smaller amount |
| Equal groups | total; number of groups; size of each group |
| Multiplicative compare | bigger amount; smaller amount; the multiplier |
| Area / perimeter / volume | the measure; one missing dimension |
| Elapsed time | end; elapsed; start |

| Id | Rule |
|---|---|
| P-WP-1 | A set uses one schema. Schemas are interleaved only after each has had its own sets; the first interleaved set is a discrimination page ("Which diagram fits? Tick one."). |
| P-WP-2 | Within a schema, unknown positions are introduced one per step in the order listed above, then mixed. |
| P-WP-3 | **Consistent language first.** In a consistent story the relational word points to the operation that solves it ("3 more … how many now?"). Inconsistent stories ("Ali has 12. That is 5 fewer than Sara. How many does Sara have?") come only after the consistent form of that schema, from Level 2 up, and are flagged `language: 'inconsistent'` so a teacher can include or exclude them. |
| P-WP-4 | Distractor verbs (an action word that suggests the wrong operation) are seeded from Level 2 up, at most one per story. Extra numbers that are not needed are seeded from Level 3 up, at most one per story, never in v1 of a new schema. |
| P-WP-5 | Number profile comes from `state.range` and `state.decimalPlaces`, and from the ladder step's regrouping constraint. The computation inside a story is never harder than the computation steps already taught at that range (P-21). |

### 8.4 Versions

```
v1  one per page, fully scaffolded        v2  two per page, faded
+--------------------------------------+  +--------------------------------------+
| ( story box, rounded )               |  | a. story, one sentence per line      |
|   Sentence one.                      |  |                                      |
|   Sentence two.                      |  |    work space                        |
|   Question?          ____ stickers   |  |    ______  __________                |
+--------------------------------------+  |    number   label                    |
| schema diagram to fill               |  +--------------------------------------+
|   [ part ][ part ]                   |  | b. ...                               |
|   [     whole    ]                   |  +--------------------------------------+
+--------------------------------------+
| [ ] I know both parts. I add.        |     K picture version
| [ ] I know the whole and one part.   |  +--------------------------------------+
|     I subtract.                      |  | picture of the two groups            |
+--------------------------------------+  | Show the story with lines.           |
| equation frame  __ O __ = __         |  |   __ O __ = __                       |
| or work grid                         |  | Say the number and its label.        |
+--------------------------------------+  +--------------------------------------+
```

| Id | Rule |
|---|---|
| P-WP-6 | **v1** holds one story per page with, top to bottom: a rounded story box; the schema diagram with empty labelled parts; first-person decision tick-boxes tied to structure; an equation frame (Levels K-2) or a work grid (Levels 3-6). The answer blank sits inside the story box, after the question, with the unit word pre-printed after it. |
| P-WP-7 | **v2** holds two stories per page with no diagram and no tick-boxes: the story, a work space, a short number blank and a long label blank. v2 is where the pupil writes the label without help. |
| P-WP-8 | **K picture version:** a pre-drawn picture of the quantities; an action instruction ("Show the story with lines."); the frame `__ O __ = __` where the circle takes the sign; then an oral instruction to say the number and its label. |
| P-WP-9 | v1 and v2 of a problem come from the same seed, so a pupil can meet the same structure scaffolded on paper and faded on screen, or the reverse. |
| P-WP-10 | The decision tick-boxes state structure, in the first person, in two short sentences: what I know, then what I do. They never name a keyword. Exactly one box is correct. Library: "I know both parts. I add." / "I know the whole and one part. I subtract." / "I know the start and the change. I add." (or "I subtract.") / "I am finding the difference. I subtract." / "I know the groups and the size. I multiply." / "I know the total and the size. I divide." |
| P-WP-11 | Two-step stories are laid out as two titled columns, Step 1 and Step 2, each with its own question line (the hidden middle question is printed in v1 and left for the pupil in v2). |
| P-WP-12 | A set of 4 stories holds one context constant so that only the numbers and the unknown position change. |
| P-WP-13 | A Review page follows every 25-50 problems of a schema run. |

### 8.5 The solving frame

Every word-problem page, in both supports, follows the same six moves. They are printed as the Steps band
on a word-problem Opener and are the on-screen hint ladder.

| Move | Pupil action | Printed form |
|---|---|---|
| 1 Read | Read, or listen to, the story twice | story box, one sentence per line |
| 2 Show | Fill the diagram (or, K: draw lines on the picture) | schema diagram |
| 3 Decide | Tick the sentence that fits | decision tick-boxes |
| 4 Solve | Write the equation or work in the grid | equation frame / work grid |
| 5 Label | Write the answer with its unit word | number blank + pre-printed or written label |
| 6 Say | Say the answer sentence aloud | oral frame: "The answer is __ [unit]." |

**Keyword-checklist panel (OPTION).** When the teacher chooses it, the diagram and tick-boxes of v1 are
replaced by a fixed panel at the side of the story:

```
[ ] 1. Read the story two times.
[ ] 2. Circle the numbers.
[ ] 3. Underline the question.
[ ] 4. Box the clue words.
[ ] 5. Choose:  +   -   x   ÷
[ ] 6. Solve. Write the label.
```

| Id | Rule |
|---|---|
| P-WP-14 | The panel text is fixed and identical on every page. Pupils tick each line as they go. |
| P-WP-15 | With the keyword panel on, inconsistent-language stories are excluded by default, because in those stories the clue word points to the wrong operation. A tick-box can include them. |
| P-WP-16 | In both supports the relational phrase of the story is underlined. In the schema support it is a cue for filling the diagram, not the rule for choosing the operation. |

### 8.6 Generating original, neutral stories

A story is built from four choices — schema, unknown position, language consistency, number profile —
and rendered from MathQuest's own sentence templates.

| Id | Rule |
|---|---|
| P-WP-17 | One sentence per line; at most 4 lines (5 for two-step); the question is the last line. |
| P-WP-18 | Sentence length: Levels K-1 at most 8 words; Levels 2-3 at most 10; Levels 4-6 at most 12. |
| P-WP-19 | Grammar: present or simple past tense; active voice; no pronoun chains (repeat the name or the noun); no idioms; no conditionals at Levels K-3; numbers always as digits. |
| P-WP-20 | Vocabulary comes from a controlled noun list (school, home, market, garden, library, sport, bus, kitchen). Each noun has its singular and plural so the pre-printed unit word is always grammatical ("1 box", "4 boxes"). |
| P-WP-21 | Names come from a short, mixed, international list, two syllables or fewer where possible. A story uses at most two names. |
| P-WP-22 | Contexts are neutral for an international school: no pork, alcohol, gambling, dating, religious festivals or national symbols. Money stories use plain amounts with the word "coins" or a number of generic value coins; a currency sign appears only where the story cannot be told without one. |
| P-WP-23 | No story, name set, sentence or context is taken from any workbook or curriculum. The static lint holds a banned-phrase list. |
| P-WP-24 | The answer is always a whole sentence frame away: the pupil writes a number (and in v2 a label), never a sentence. |

---

## 9. Thinking pages

Reasoning is taught with the same low writing load as everything else. Pupils judge, choose, mark and
complete a frame; they do not write explanations. Any skill can appear on any of these pages (P-27): the
skill supplies a correct worked cell, and `wrongAnswer(q)` supplies an error that comes from a real
misconception.

| Id | Rule (all thinking pages) |
|---|---|
| P-TH-1 | Every response is a tick, a circle, a number, or a sentence frame with at most 2 blanks, each blank a number or a word copied from a printed bank of at most 4 words. An equation frame (`__ + __ = __`) is a set of number slots, not a sentence frame, and may have 3 blanks. |
| P-TH-2 | Wrong work shown to pupils comes from the skill's misconception list (Q-12), never from random numbers. A wrong answer is never equal to the right one and never absurd. |
| P-TH-3 | The share of correct and incorrect items is close to half and half, in an order with no pattern (seeded shuffle; never alternating, never all-true). |
| P-TH-4 | Given work is printed in black, like a finished pupil page. It is not grey: grey means "trace me". |
| P-TH-5 | Thinking pages come after the procedure steps of a ladder, at level 1, with structural supports kept. |

### 9.1 Error analysis ("Check and fix")

```
+-------------------------------+
| a.    4 6                     |
|     + 2 7       [ ] Correct   |
|     -----       [ ] Fix it    |
|       6 3                     |
|                 ______        |
+-------------------------------+
```

| Id | Rule |
|---|---|
| P-TH-6 | Each cell shows a finished problem. The pupil checks it, ticks Correct or Fix it, and for Fix it writes the right answer on the line. Up to 6 per page (4 for long algorithms), never above the design standard's ceiling for the size (6 / 4 / 4). |
| P-TH-7 | At level 2 the pupil also circles the digit or step where the mistake is, and the first cell shows this done in trace. |
| P-TH-8 | Where a check procedure exists (multiply to check a division, add to check a subtraction) the cell gives a small work space for it and the instruction names it. |

### 9.2 Discrimination pages

| Id | Rule |
|---|---|
| P-TH-9 | A discrimination page asks one decision about every item and, by default, no solving: tick Regroup / No regrouping; tick Add / Multiply; tick Yes / No under "Can I add these fractions yet?". 8-16 items. |
| P-TH-10 | A second form asks the pupil to act on the decision: "Circle the problems you can solve. Solve only those." |
| P-TH-11 | The rule that drives the decision is printed once, in a rounded box at the top, as one sentence. |

### 9.3 True or False?

```
+--------------------------------------------------+
| a.   6 x 4 = 4 x 6            [ ] True [ ] False |
|      6 x 4 = __  and  4 x 6 = __ .               |
+--------------------------------------------------+
```

| Id | Rule |
|---|---|
| P-TH-12 | Each item is one statement (an equation, an inequality, a fact about a picture), two tick-boxes, and one frame of at most 2 blanks that makes the pupil compute the evidence. Blanks are numbers, or a word from a bank. Up to 8 / 6 / 4 per page at S / M / L (the design standard's ceiling). |
| P-TH-13 | Statements are generated from the skill's own items: a true statement uses the correct answer; a false one uses `wrongAnswer(q)`. Statement forms rotate: result on the right; result on the left; two expressions compared; a picture with a claim. |

### 9.4 Reason It

Four item forms. A page uses one form (or, by "Mixed", one of each). 2-4 items per page.

| Form | What the pupil sees | Response |
|---|---|---|
| Spot the mistake | One worked problem with one wrong step | Circle the mistake. Frame: "The mistake is in the ______ ." (bank: ones, tens, hundreds, sign) Write the correct answer. |
| Odd one out | Four items (numbers, shapes, facts); three share a property | Circle one. Frame: "__ does not belong. It is not ______ ." (bank supplied) |
| Always, sometimes, never | One statement ("When I add 0 the number stays the same.") | Tick one of three boxes. Frame: "Example: __ + __ = __" |
| Which is correct? | Two finished answers labelled A and B | Circle A or B. Frame: "__ is correct. The answer is __ ." |

| Id | Rule |
|---|---|
| P-TH-14 | People in Reason It items are "A" and "B", never named characters: fewer words, no reading of names. |
| P-TH-15 | Odd-one-out sets are built so that exactly one property in the word bank singles out exactly one item. |
| P-TH-16 | "Sometimes" statements must have a printed space for one example that works and one that does not. |

### 9.5 Stretch

Open problems with several correct answers. The entry scaffold is a results table.

```
+----------------------------------------------------------+
| Two numbers add to 12. Find pairs.                       |
|   first number | second number | check: total            |
|        5       |       7       |   12      <- traced row  |
|      ____      |     ____      |  ____                   |
|      ____      |     ____      |  ____                   |
| I found __ answers.                                      |
+----------------------------------------------------------+
```

| Id | Rule |
|---|---|
| P-TH-17 | A Stretch problem has at least 3 correct answers within the pupil's number range. The answer key lists all of them, or states the rule when there are more than 12. |
| P-TH-18 | The results table has one traced first row, 3-6 empty rows, and a check column so each row can be verified by the pupil. |
| P-TH-19 | The closing frame is a count ("I found __ answers.") or a number pattern blank. There is no "explain" line. |
| P-TH-20 | 1-2 problems per page. The problem statement is at most 2 sentences within the reading caps of P-WP-18. |

---

## 10. Language

### 10.1 The controlled instruction library

One string per task, reused word for word on every page and screen. Underlined words are shown here
between underscores. `{n}` is a number placeholder; `{place}` is a place-value word; `{unit}` is a unit
word. New strings may be added only by adding a key here.

| Key | Instruction string | Used for |
|---|---|---|
| `add` | Add. | addition sections |
| `subtract` | Subtract. | subtraction sections |
| `multiply` | Multiply. | multiplication sections |
| `divide` | Divide. | division sections |
| `mixed-sign` | Add or subtract. Look at the _sign_. | mixed + and - |
| `mixed-ops` | Look at the _sign_. Solve. | any mixed operations |
| `missing` | Write the missing number. | unknowns |
| `trace-say` | Trace the answer. Say the steps. | Model cells |
| `say-write` | Say the fact. Then write the answer. | fact warm-ups |
| `rewrite-solve` | Write the problem in the grid. Then solve. | horizontal to vertical |
| `rewrite-only` | Write the problem in the grid. Do _not_ solve. | set-up only |
| `decide-regroup` | Do you need to regroup? Tick one box. Do _not_ solve. | decide only |
| `notate-regroup` | Show the regrouping. Do _not_ subtract. | notate only |
| `circle-bigger` | Circle the bigger number. | cue set-up |
| `underline-first` | Underline the part you work first. | division, order of operations |
| `circle-sign` | Circle the sign. Then solve. | discrimination |
| `can-solve` | Circle the problems you can solve. Solve only those. | discrimination |
| `tick-rule` | Read the rule. Tick Yes or No. | rule pages |
| `compare` | Write <, > or = in the circle. | comparing |
| `order-up` | Write the numbers in order. Start with the smallest. | ordering |
| `count-write` | Count. Write the number. | counting |
| `draw-count` | Draw counters to show the number. | counting, ten frames |
| `ring-groups` | Circle groups of {n}. Write how many groups. | grouping, division |
| `groups-of` | Write how many groups. Write how many in each group. | equal groups |
| `array` | Write how many rows. Write how many in each row. | arrays |
| `skip-count` | Count by {n}. Write the missing numbers. | count-by strips |
| `expanded` | Write the number in expanded form. | place value |
| `digit-value` | Write the value of the underlined digit. | place value |
| `round` | Round to the nearest {place}. | rounding |
| `more-less` | Write 1 more and 1 less. | number sense (also 10, 100, 1,000) |
| `shade` | Shade the fraction. | fractions |
| `write-fraction` | Write the fraction. | fractions |
| `denominator` | Count the equal parts. Write the denominator. | denominator only |
| `numerator` | Count the shaded parts. Write the numerator. | numerator only |
| `line-write` | Write the number at each dot. | number lines |
| `line-mark` | Mark the number on the line. | number lines |
| `time-write` | Write the time. | clocks |
| `time-draw` | Draw the hands. | clocks |
| `coins` | Count the coins. Write the total. | generic coins |
| `measure` | Measure the line. Write the length. | rulers |
| `convert` | Use the rule. Write the missing number. | conversions with a rule box |
| `graph` | Use the graph. Answer the questions. | data |
| `table` | Use the rule. Fill in the table. | in / out tables |
| `match` | Draw a line to match. | matching |
| `story` | Read the story. Fill in the diagram. Solve. | word problems v1 |
| `story-v2` | Solve. Write the number and the label. | word problems v2 |
| `story-k` | Show the story with lines. Write the equation. | K picture version |
| `check-fix` | Check the work. Tick Correct or Fix it. | error analysis |
| `check-by` | Multiply to check. Tick Correct or Fix it. | check-only steps |
| `judge-correct` | Correct | judge tick-box label (a label, not an instruction, so P-LG-1 does not apply); first of the two boxes of the judge frame; the wording is exactly this everywhere |
| `judge-not-correct` | Not correct | judge tick-box label; second of the two boxes, always paired with `judge-correct`; never "right / not right" or any other wording |
| `true-false` | Tick True or False. Finish the sentence. | True or False? |
| `spot` | Find the mistake. Circle it. Write the correct answer. | Reason It |
| `odd-one` | Circle the one that does not belong. Finish the sentence. | Reason It |
| `asn` | Tick Always, Sometimes or Never. Write an example. | Reason It |
| `which` | Which answer is correct? Circle A or B. | Reason It |
| `stretch` | Find more than one answer. Fill in the table. | Stretch |
| `cut-sort` | Cut. Sort. Glue. | hands-on sorts |
| `cut-order` | Cut. Put in order. Glue. | hands-on ordering |
| `find-color` | Find every {n}. Color it. | find-and-color |
| `default-write` | Solve. Write the answer. | default adapter: skills with no provider, number or text answer |
| `default-circle` | Circle the answer. | default adapter: choice items |
| `default-circle-all` | Circle all the correct answers. | default adapter: multi-select items |
| `default-order` | Write the numbers in order. | default adapter: ordering items with no stated direction |
| `default-solve` | Solve. | default adapter: any other answer type |

| Id | Rule |
|---|---|
| P-LG-1 | An instruction is at most 12 words and at most three sentences, each starting with a print verb (a question is allowed as the first sentence of a decide instruction). |
| P-LG-2 | The same task always gets the same string. Two different strings never describe the same task. |
| P-LG-3 | "Do not solve." always has _not_ underlined, and always comes last. |
| P-LG-4 | Instructions never contain the words explain, describe, justify, discuss, prove, or "in your own words". |
| P-LG-5 | One instruction line per section. It is not repeated inside cells. |

### 10.2 The print verb list

Steps, instructions and Today's Number tasks start with one of these verbs and no others:

`Look` `Read` `Say` `Count` `Circle` `Underline` `Box` `Cross out` `Tick` `Trace` `Write` `Draw` `Shade`
`Mark` `Match` `Measure` `Use` `Find` `Fill in` `Finish` `Check` `Fix` `Think` `Start` `Put` `Move`
`Add` `Subtract` `Multiply` `Divide` `Solve` `Round` `Compare` `Estimate` `Regroup` `Bring down`
`Cut` `Sort` `Glue` `Color`

On screen the action verbs are swapped by a fixed map so the instruction stays true: Circle → Tap;
Tick → Tap; Write → Type; Draw a line to match → Tap the two that match; Shade → Tap the parts;
Mark → Tap the line; Draw the hands → Drag the hands; Cut / Sort / Glue → Drag; Box, Cross out, Underline,
Trace and Color → Tap; Measure → Drag the ruler. No other rewording is allowed between print and screen.

### 10.3 Vocabulary

| Id | Rule |
|---|---|
| P-LG-6 | At most 3 terms per step. A term counts once per ladder: later steps may use it without listing it again. |
| P-LG-7 | Each term is printed as: **term** — a plain gloss of 8 words or fewer — a labelled mini-diagram with an arrow to the thing named. Example: **denominator** — the bottom number: how many equal parts — a fraction with an arrow to its bottom number. |
| P-LG-8 | Everyday glosses may sit in brackets after a term the first time it is used on a page: "faces (flat sides)". |
| P-LG-9 | One term, one meaning, one spelling. Preferred terms: regroup; equation; equal groups; turn-around facts; fact family; remainder; numerator / denominator; ones, tens, hundreds, thousands; sum, difference, product, quotient are taught as vocabulary from Level 3 and never appear in an instruction before they are taught. |
| P-LG-10 | Place-value words appear in full once in the Model cell and in the vocabulary box of the step that introduces them; elsewhere the columns carry letters (OPTION words / letters / none). |
| P-LG-11 | A vocabulary entry has an optional `meaning2` field reserved for a home-language gloss. It is not printed in this version. |

### 10.4 "Remember … NOT …" contrast lines

One line, in the Vocabulary / Rule band, aimed at a known confusion. The wrong idea is named after NOT
so the pupil hears the contrast. At most one per step. Examples (all MathQuest's own):

| Confusion | Line |
|---|---|
| tenths / tens | Remember: tenths are parts of one, NOT groups of ten. |
| denominator | Remember: the denominator counts all the equal parts, NOT only the shaded parts. |
| number-line fractions | Remember: count the spaces, NOT the marks. |
| perimeter / area | Remember: perimeter goes around the shape, NOT inside it. |
| < and > | Remember: the small end points to the smaller number, NOT the bigger one. |
| regrouping | Remember: the ten you regroup is still there. Add it, do NOT forget it. |
| unit fractions | Remember: more parts means smaller parts, NOT bigger parts. |
| "fewer than" | Remember: "fewer than" compares two amounts. It does NOT always mean subtract. |
| minute hand | Remember: the long hand shows minutes. Count by 5, NOT by 1. |
| zero in a number | Remember: the zero holds a place. Do NOT leave it out. |

### 10.5 Sentence stems and oral frames

Sentence stems are the written frames of section 9. Oral frames are said aloud at the end of every Model
(P-17); online they are the "Say it" line read by text-to-speech, with the blanks filled once the item is
correct.

| Context | Oral frame |
|---|---|
| Addition | "__ plus __ equals __." |
| Subtraction | "__ minus __ equals __." |
| Multiplication | "__ groups of __ is __." then "__ times __ equals __." |
| Division | "__ divided by __ equals __." / "… equals __, remainder __." |
| Regroup decision | "__ is less than __. I need to regroup." / "I do not need to regroup." |
| Place value | "__ hundreds, __ tens, __ ones." |
| Compare | "__ is greater than __." / "__ is less than __." / "__ is equal to __." |
| Fractions | "__ out of __ equal parts are shaded." |
| Rounding | "__ is between __ and __. It is closer to __." |
| Time | "The time is __." |
| Measurement | "The line is __ {unit} long." |
| Word problem | "The answer is __ {unit}." |
| Error analysis | "The mistake is in the __. The correct answer is __." |

| Id | Rule |
|---|---|
| P-LG-12 | An oral frame is one or two sentences, 12 words or fewer each, with blanks only for numbers, unit words, or a word from a bank. |
| P-LG-13 | Every string a pupil sees — title, What's New, instruction, vocabulary gloss, story sentence, frame — is available to text-to-speech online, sentence by sentence. |

---

## 11. Online practice

The on-screen question card and every skill visual are the same black-and-white cell as print. Game
chrome (XP, boss and race views, buttons, correct / incorrect feedback) keeps its colour and sits outside
the cell.

### 11.1 Modes mirror page roles

| Online mode | Mirrors | Scaffold level | Hints | Feedback timing |
|---|---|---|---|---|
| Learn 1: Worked | Model cell, scripted Model page | 3 | Steps shown one at a time; the pupil traces by typing over each grey digit | live, per digit |
| Learn 2: Guided | Guided cells | 2 | Hint ladder available; all step hints drawn | live, per digit |
| Learn 3: On my own | Independent | 1 | Hint ladder on request | on Check, per item |
| Practice | More Practice, fact rows | 1 | On request | on Check, per item |
| Mixed review | Review, Daily Spiral, Mixed practice, Daily 4 | 1 (Daily 4: 0) | On request | on Check, per item |
| Test | Test A/B, pre-skill check, fact probe | 0 | Off (teacher OPTION, as in print) | on Check, once, for the whole set |
| Find the mistake | Error analysis, Reason It: spot the mistake | 1 | On request | on Check, per item |
| True or False? / Reason It / Stretch | The thinking pages | 1 | On request | on Check, per item |
| Timed modes (the app's existing timer, boss and race) | Fact probe with the "(1 minute)" tag | 0 or the chosen cue part | Off | on Check or per answer, as the mode already works |

| Id | Rule |
|---|---|
| P-ON-1 | Learn runs 3 → 2 → 1 on the same step with the same cell. The default counts mirror the Opener: 1 worked, 1 worked-along, 2-4 guided, then 6 independent. The pupil or teacher can repeat or skip any part; nothing is locked. |
| P-ON-2 | A mode asks the cell renderer for a level (P-SC-2). Modes never build their own question HTML. |
| P-ON-3 | Inputs replace blanks one for one. Digit boxes are one-digit inputs filled right to left in column arithmetic. Response modes map as listed in `design/PROBLEM_TYPES.md`; a written-answer item is never converted to multiple choice (P-29). |
| P-ON-4 | Timed modes are opt-in and never the default for a step's first session. Timer, race and boss visuals live in the chrome; the cell is unchanged. Accuracy is reported before speed on any end screen. |
| P-ON-5 | Test forms online use the same seeds as print, so "Test A" on screen is the printed Test A. |
| P-ON-6 | This standard adds no stored record of a pupil's attempts. A mode may hold state for the current session only. |

### 11.2 The on-screen hint ladder

The hint ladder is the four-rung prompt fade of guided practice (P-LC-8), driven by `workedSteps(q)`.

| Rung | What appears |
|---|---|
| 1 | The next step's sentence is shown and spoken, and its marks are drawn in grey in the cell. |
| 2 | The next step's sentence only. |
| 3 | The prompt "What comes next?" and the step number highlighted in the Steps list. |
| 4 | Nothing; the pupil works alone. |

| Id | Rule |
|---|---|
| P-ON-7 | Learn 2 starts at rung 1 and moves down one rung per item answered correctly. In other modes a hint request opens rung 2, a second request rung 1. After two wrong Checks on one item, the app offers "Show me" (rung 1 for that item) and offers the next item at one scaffold level higher in the same format (P-24). |
| P-ON-8 | A hint never fills the answer slot. Rung 1 draws working marks only. |

### 11.3 The feedback rule

| Id | Rule |
|---|---|
| P-ON-9 | **Model and Guided items (levels 3 and 2): live feedback per digit.** As each digit is entered, a tick or cross appears beside that digit's box. |
| P-ON-10 | **Independent, probe, review and test items: feedback on Check.** Per item in Learn 3, Practice, Mixed review and the thinking modes; once for the whole set in Test and probe modes. |
| P-ON-11 | **Wrong digits stay visible.** A wrong entry is not cleared, shaken away or replaced. It keeps its value with a cross beside it. The pupil may overwrite it; the cross clears when the entry changes. |
| P-ON-12 | **Regroup boxes are never marked.** Regroup boxes, tally boxes, think boxes, work grids, count-by strips the pupil fills, and any other working space take input but are never checked, never required and never marked right or wrong. Only answer slots are checked. |
| P-ON-13 | Feedback marks are a tick and a cross (shape carries the meaning; colour is extra) and belong to the chrome. They are excluded from the black-and-white lint. |
| P-ON-14 | After a correct item the oral frame is shown filled in and can be played aloud. After a wrong Check in a non-test mode, the pupil can try again, ask for a hint, or see the facsimile answer; the choice is theirs. |
| P-ON-15 | In Test mode no right / wrong marks appear until the whole set is checked; then every item shows its marks and the facsimile answer is available. |

---

## 12. Content-quality rubric

Use this rubric to audit any skill, new or existing. Each criterion is Pass, Fail or Not applicable. A
skill meets the standard when every applicable criterion passes. "Auto" means the content audit script
can check it over seeded samples at ranges 10 / 20 / 100 / 1,000; "Manual" means a reviewer checks it.

| Id | Criterion | Pass when | Check |
|---|---|---|---|
| Q-1 | Problem types enumerated | The skill lists its problem types as named `variants[]` (3-5 where the reference sites show that many); each can be requested alone. | Auto |
| Q-2 | Difficulty ladder | The variants and constraints can be ordered from concrete to abstract, and each ladder step that uses the skill maps to a reachable constraint set. | Manual |
| Q-3 | Honours Max Number | Every generated number respects `state.range` (10, 20, 50, 100, 500, 1,000, 10,000), except fixed-domain skills (time, angles, coordinates), which declare `fixedDomain: true`. | Auto |
| Q-4 | Honours Decimal Places | Operands and answers use exactly `state.decimalPlaces` places where the skill supports decimals; otherwise the skill declares that it ignores the setting. | Auto |
| Q-5 | Small numbers available | At range 10 or 20 the skill still generates valid, non-degenerate items (P-12). | Auto |
| Q-6 | Edge cases seeded | The skill declares `edgeCases[]`; a seeded set of 6+ contains at least one (P-10). | Auto |
| Q-7 | Non-examples | Identify / classify / rule skills generate non-examples at 1:3 to 1:1, including near misses. | Auto |
| Q-8 | No answer leaks | The answer does not appear in the question text, the visual, a label, an `alt` / `title` attribute, a data attribute, or the hint. Counts printed as self-check badges are allowed only where the task is not to count. | Auto + Manual |
| Q-9 | Answers recomputed | An independent recomputation matches `q.ans` for every sample; equivalent forms (fractions, times, units) are accepted by the answer check. | Auto |
| Q-10 | Duplicates | At most 10% duplicate items in a set of 20 where the item space allows; never two identical items side by side. | Auto |
| Q-11 | No silent mixing | With one variant and notation requested, 100% of items match (P-28). | Auto |
| Q-12 | Distractors from real misconceptions | `wrongAnswer(q)` and multiple-choice options come from a declared misconception list (table below), are distinct from the answer and from each other, and are plausible in size. | Auto + Manual |
| Q-13 | Reading-load cap | Instruction from the library, at most 12 words; stories within P-WP-17 to P-WP-19; no sentence for the pupil to write. | Auto |
| Q-14 | Both orientations | Computation and fact skills generate vertical and horizontal forms on request (P-16). | Auto |
| Q-15 | Every unknown position | Equation and word-problem skills generate every position in the table of section 8.3 on request. | Auto |
| Q-16 | Worked steps | `workedSteps(q)` is non-empty, 3-6 steps, each within P-5, and the final marks equal the answer. | Auto |
| Q-17 | Strings complete | `iCan`, `whatsNew`, `instructionKey`, `vocabulary` (at most 3, each with gloss and diagram), `oralFrame` are present and pass section 10. | Auto |
| Q-18 | Works on every page role | The skill renders on every role in P-27 at S / M / L in both looks without overflow or shrinkage. | Auto |
| Q-19 | Print and screen parity | Same cell, same response mode, inputs for blanks (P-29); feedback follows section 11.3. | Auto + Manual |
| Q-20 | Level and neutrality | The skill has a Level (K, 1-6, or M for multi-level); pupil text says "Level"; contexts pass P-WP-22; coins are generic; no emoji, no colour dependence. | Auto + Manual |

### Misconception list for distractors (starter set)

| Domain | Misconception | Example of the wrong answer it produces |
|---|---|---|
| Addition with regrouping | Writes the whole column total | 47 + 28 = 615 |
| Addition with regrouping | Forgets the regrouped ten | 47 + 28 = 65 |
| Subtraction with regrouping | Subtracts the smaller digit from the bigger in each column | 52 - 18 = 46 |
| Subtraction with regrouping | Regroups the ones but does not reduce the tens | 52 - 18 = 44 |
| Subtraction across zero | Treats 0 - n as n, or as 0 | 304 - 126 = 222 |
| Facts | Off by one when counting on or back (counts the start number) | 8 + 5 = 12 |
| Multiplication | Adds instead of multiplying | 6 x 4 = 10 |
| Multiplication | n x 0 = n; n x 1 = n + 1 | 7 x 0 = 7 |
| Division | Remainder equal to or bigger than the divisor | 17 ÷ 3 = 4 R5 |
| Long division | Leaves out a zero in the quotient | 312 ÷ 3 = 14 |
| Place value | Writes expanded parts side by side | three hundred five → 3005 |
| Place value | Reverses teen digits | 17 → 71 |
| Comparing | Compares the first digit only, or the number of digits only | 98 > 102; 0.35 > 0.4 |
| Rounding | Always rounds down, or rounds the wrong place | 67 → 60; 348 → 400 (to tens) |
| Fractions | Counts shaded against unshaded | 3 shaded of 4 → 3/1 |
| Fractions | Accepts unequal parts | names any 1-of-3 split "one third" |
| Fractions | Bigger denominator means bigger fraction | 1/8 > 1/4 |
| Fractions | Adds numerators and denominators | 1/4 + 2/4 = 3/8 |
| Number-line fractions | Counts marks instead of spaces | denominator one too big |
| Time | Reads the minute-hand numeral as minutes | 3:15 → 3:03 |
| Time | Takes the next hour when the hour hand is between numbers | 2:50 → 3:50 |
| Measurement | Starts at 1 or at the ruler's edge, not at 0 | length one unit too long |
| Area and perimeter | Swaps the two | adds sides for area |
| Word problems | Follows the keyword in an inconsistent story | adds on "more than" when the larger amount is known |
| Equality | Reads = as "the answer comes next" | 8 = __ + 3 → 11 |

---

## Appendix A. Checks a machine can run from this standard

| Check | Rules |
|---|---|
| Ladder validators | P-1, P-2, P-8, P-9, P-11, P-12, P-AT-1 to P-AT-7, P-SC-1, P-SC-3, P-SC-4, P-RV-1 |
| String lints | P-3, P-5, P-14, P-15, P-LC-2, P-LG-1 to P-LG-7, P-LG-12, P-20, P-32, P-33 |
| Page lints (DOM) | P-6, P-7, P-13, P-LC-1, P-LC-6, P-LC-7, P-LC-10, P-23 (totals), P-19, P-TH-1, P-WP-17 |
| Content audit | Q-1 to Q-17, P-10, P-16, P-28, P-RV-2, P-TH-3, P-WP-2 to P-WP-5 |
| UI tests | P-29, P-34, P-ON-7 to P-ON-15 |
| Dialog tests | P-30, P-31, P-SC-5 |
| Manual review | P-26, P-18, P-33, Q-2, Q-12, Q-20 |
