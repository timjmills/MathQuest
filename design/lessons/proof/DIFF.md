# E4 proof: compiled lessons vs the passed hand-written ones (node side)

The structural and content comparison of every compiled description (cards → `js/modules/lessons/compile.js`) against
the hand-written `js/modules/lessons/detailed/<id>.js`. Generated detail: `STRUCTURE.md`
(`node tests/scripts/ws-lesson-compile-unit.mjs --report`). This file explains each difference. **Render diffs are not
here**: the lane lead renders both packs in the browser (`ws-lesson-hash` / PNGs) and adds what the pages show.

State on 2026-11-07 (branch `claude/sweet-newton-c8wrv1-lf-engine-p2`): all 7 cards compile; the 7 library entries pass
`lessons/schema.js` (validateRoutine with the drawn icons, validateLesson with live skills); the 7 descriptions pass
`detailed/index.js` validateDescription; no compiled description lacks a field the hand-written one has; the compiled
hooks (`vars` from the readers, `checkQuestion.show`, `lastName`, `answerShow`, `chartSay`) return what the hand ones
return on sample items of each lesson's templates (`ws-lesson-compile-unit: OK (45 checks)`).

## How the proof cards were made

`ws-lesson-card --from-detailed <id> --unit <unit>` seeds a card from the passed lesson: it KEEPS what is the lesson's
own (its skills + options, ranges, cases, the story, the hook, the I Do / We Do scripts, the T1 boxes, the New atoms, the
mistakes' words) and DROPS everything the compiler derives (the `vars` code, the Pre-requisite atoms, the routine steps,
the generated mistakes "looks like", the T6 rows a misconception makes, the shared sections 1, 2, 3, 7, 8, 9, 10 except the
rows past the shared slots, the shared materials, the routing note, the chant row closing each We Do, the loop's first
line). So every difference below is the compiler's own output standing where the hand-written text stood.

## Classes of difference (all seven lessons)

| # | Class | Lessons | Why | Verdict |
|---|---|---|---|---|
| C1 | `checkQuestion.response: "which-right"` added; section 7's ask is "Which answer is right? Show fingers." and its board lists the options on their own row ("Write three / four answers. A: … · B: …") | all | owner Q9: ONE shared Check Question response. The lesson's own board line is kept (`parts.checkQuestion.board`: "Draw four bars on the board.", "Write the table on the board: {cq.rows}.") | by design; the render proof must show the board A-D count = the options (lf-checks' check) |
| C2 | the shared first rows of sections 1, 2, 3, 8, 10 replace a lesson's variant wording ("Routing is on T6." → "… on the last page (T6)."; "Write each fact" → "Write each question"; "Then sort the slips." → "… by the boxes ticked."; lesson 4's "Band A, then band B" Number-sense rows; lessons 2 / 4 / 7's "Pupils do Practice 1. {p4.steps}" → "Pupils finish the lesson sheet, then Practice 1.") | 1, 2, 3a, 4, 5, 6, 7 | the point of the shared sections: one wording for every lesson | accept; two content losses to restore as card `add` rows if the critic wants them: lesson 2 §1 "Read each question aloud. Wait 30 seconds." and §8 `{p4.steps}` (the Steps said aloud) |
| C3 | materials reordered: the lesson's own items first, then "Mini whiteboards and pens", "Pupil packet, one per pupil", "Exit slips, cut in half" | 1, 2, 3a, 4, 7 | the shared items are the compiler's | accept (T1 check-box list order only) |
| C4 | T6 wrong answers reordered: the rows a misconception makes (each exit item that can show it) first, the card's own rows after | 2, 3a, 7 | generated from `misconceptions[].exits` | accept |
| C5 | section 10's note "Say it together twice." vs "The Remember line. Say it twice." (lesson 4) | 4 | generated plenary row | accept |
| C6 | lesson 1 §8 "… then Practice 1. Mixed 1 is homework." → "… then Practice 1 and 2." | 1 | the generated row counts the Practice pages; "Mixed 1 is homework" was the lesson's own | restore as an `add` row (a teaching note) if wanted |

No other field differs: skills and options, floors, case tests, pools, `boardOnly`, chunks, P0 / P1 / P5 / P6 refs,
retrieval, vocabulary, atoms, routine, mistakes, the I Do / We Do scripts, accepted answers are byte-identical
(`plain()` JSON) for lessons 1–5.

## Per lesson

**Lesson 1 — g2-nbt3-read-write-1000 (G2-Y3.B1, shape `forms`).** 4 differences: C1, C2 (§8), C3, C6. Library: the
Prerequisite Check routes two questions to 2.NBT.A.1, so the short lesson keeps a Warm-up and `prereqsPending` (the
library needs 3-4 DISTINCT prerequisite lessons, LR-17). LR-3: the chart's Steps share `write`; decided `shortIcons`
start, write, look, check for the short lesson only. NEEDS: `zeroPlace` is not in the schema of `placevalue:unit_form` /
`placevalue:value` (gen-pv.js reads it) → skill-options lane.

**Lesson 2 — g1-oa1-bar-model-wp-20 (G1-Y2.B2, shape `bar-story`).** 9 differences: C1, C2 (§1, §2, §3 "Board: …" notes,
§8, §10), C3, C4. Prerequisite ids "K CC 5" / "G1 OA 6" are read as CCSS K.CC.5 / 1.OA.6. NEEDS: `band` is not in
`addition:add_wp_20`'s schema (5 refs); `bar-whole-in-part`, `bar-part-on-top` are returned by the word-work provider's
`wrongAnswers` but not declared in its `misconceptions` list → providers lane.

**Lesson 3a — g3-oa5-mult-properties (G3-Y4.B4, shape `property`).** 6 differences: C1 ("Which turned fact is true?" →
the shared ask), C2 (§3, §10), C3, C4. LR-3 decided `shortIcons` look, write, turn, start, check.

**Lesson 4 — g3-oa9-mult-table-patterns (G3-Y4.B4, shape `table-pattern`).** 8 differences: C1, C2 (§1, §2, §3, §8, §10),
C3, C5. Library `prereqsPending` (two questions to one CCSS code).

**Lesson 5 — g3-oa9-input-output-rule (G3-Y4.B4, shape `rule-table`).** 3 differences: C1 ("What is the rule?" → shared),
C2 (§10 "Sort the slips by item 3."). Library `prereqsPending` (2.OA.B.2 twice).

## The hold-outs (the compiler was not shaped on them)

**Lesson 6 — g4-nbt1-ten-times-value (G4-Y5.B2, SHAPES.md: `forms`, the nearest passed shape).**
- Run 1 (the card as seeded, the `forms` shape's readers only): **compiled, the library entry and the description
  validated, and `ws-lesson-card --check` FAILED on 61 placeholders** ({chart.nF}, {we.0.v0}, {cq.sentQ} …): the forms
  shape reads 3-digit numbers (`hto`), lesson 6 deals pv-times pairs.
- Fix (decided on the card, not in the compiler's shape): `readers: ["pvTimes"]`, `shapeReaders: false` — a TEMPLATE
  reader for the pv-times item (`shapes/readers.js`), not a lesson hook; `shapeReaders: false` because `hto` would shadow
  the base `say` name on these items (the unit gate now fails any compiled reader that shadows a base name). Hooks
  `dropParen`, `pvPair`, `commas` were added to `readers.js` HOOKS for it.
- Run 2: resolves; 3 differences (C1, C2 §10 — "Sort the slips by item 2." and its note "[[{exit.0.v0}]], [[{exit.0.rel}]]"
  kept through the item's `show` template).
- Lesson: a shape is not enough to name an item's parts: the READER belongs to the template. `forms` stays the right shape
  (the teaching sequence), its item kind needed one more reader. SHAPES.md should list lesson 6 with readers `pvTimes`.

**Lesson 7 — g3-oa8-two-step-wp (G3-Y4.B4, SHAPES.md: `bar-story`).**
- Run 1: an option value the skill does not offer (`subtraction:sub_facts` band 100; the schema offers 5–20), then
  **the compiler's script-vs-page check refused §9 "No step boxes this time. Draw it. Write both steps." over a P5 that
  prints the Step 1 / Step 2 boxes (critic r1 D3)**, and 33 placeholders unresolved ({chart.step1}, {we.0.s1}, {wp.l0} …):
  `bar-story` read one-step stories only.
- Fix: the `twoStep` reader joins the `bar-story` shape (it returns nothing for a one-step story: lesson 2's hooks are
  unchanged, the unit gate checks it); decisions on the card: retrieval band 20; §9 says what P5 prints, "Use the two step
  boxes. Write Step 1, then Step 2."; ruling `family-repeats`.
- **D2 from the card:** the ruling `family-repeats` makes the compiler put `repeatKey: {family: 'unordered', frame: true}`
  on the description and `repeatKey: 'family+frame'` on every ref of the pack (chart, chunks, Practice, word problem,
  exit, retrieval, Check Question, P0). The bridge must read it: `print-sheet.js` refAccepts keys a × / ÷ item by its
  unordered family {a, b, a·b} (print-sheet's `familyKey` already computes it for the Mixed page) plus the frame (Step 1
  total + object noun) across the whole pack, retrieval in the pool. That bridge change is NOT made here (print-sheet.js is
  outside this builder's files): **until it lands, D2 is declared by the card and compiled into the description, not yet
  enforced in the deal.** lf-checks' family-keyed E24 (backtest `e24-family`) is what proves it on the render.
- **D3 from the card:** comes out right by construction — the compiler refuses any "no X" line on a page that prints X
  (the labels come from the card's parts: `wordProblem.eqSteps` / a two-step ref → step boxes), so the old line cannot
  compile, and the card's §9 row names the boxes.
- Run 2: resolves; 17 differences: C1, C2 (§1 "Read each story aloud", §2, §8 "Practice 1 (× first), then Practice 2
  (÷ first)", §10), C3, C4, the D3 row, and `repeatKey` on the refs (chunks, skill, practiceSheets, prerequisites,
  wordProblem.ref, exit, retrieval, checkQuestion.ref) plus retrieval band 20 — these last are the D2/D3 fixes, wanted.
- D1 (chart zoom fallback) is an engine fix (`chartPage` `sizing.mode`), not a card field: not in this step.

## What the render proof must look at (lane lead, browser)

1. C1 on every lesson: the Check Question board row, the A-D count, "Which answer is right?" on T4.
2. C2 rows on T3–T5 (wording only; check no line now overflows its cell).
3. Lesson 7 with the `repeatKey` bridge in place: no family / frame repeats (E24 family-keyed), P5 + §9 agree.
4. The short lessons (library entries in `units/*.js` LESSONS) are new: the standard lesson packet of each, LR-3 icons.
