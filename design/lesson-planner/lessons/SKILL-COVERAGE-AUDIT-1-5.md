# Skill coverage audit: detailed lessons 1-5 (2026-10-17)

This audit checks the five PASSED detailed lessons against the **Skill coverage rule** in
`design/lesson-planner/DETAILED_MAKER.md` (owner, 2026-10-17). It is an audit only: no code, lesson
file, pack or record was changed.

**Method.**
- **Printed items.** Every printed item was read from each pack's `#v21-pool` `places` list (the
  bridge's record of every printed cell) and from the lesson file's refs. The word-problem pages
  (P5) were also checked in their PNGs.
- **Online items.** Every ref (skill + opts) was dealt 100 times through `generateQuestionFor`, the
  same path live play uses. Harness:
  `/tmp/claude-0/-home-user-MathQuest/63a299d9-8531-5862-9312-b99445c10d44/scratchpad/cov/audit.mjs <lesson> <n> <caseTests>`.
  For each item it records:
  - `answerType` and `q.cell.template`;
  - the item number (`itemNumberOf`);
  - the share rate against the paper's hard bounds (`refHardOk`) and against the lesson's case tests
    (`CASE_TESTS`, roles/lesson.js);
  - a share-code round trip (`encodeOptionPayload` → `decodeOptionPayload`, normalised);
  - any opts key that the skill's schema does not hold.

**Legend.**
- *lesson-only* is a ref key that the skill-options UI and the share code cannot express:
  `minNum`, `maxNum`, `partMin`, `noPart`, `crossTen`, `allTest`, `want`, `factorCap`,
  `shortQuestion`, `signSlot`, `cellPayload`, `gridRevisit`, `gridFresh`, `ftRuleMax`.
  An online pupil never gets these.
- *pass X/100* is the share of online items that the paper's bounds would accept.

## Findings that apply to all five lessons

- **X1. Check Question.** In every lesson the Check Question is written on the board as a "which is
  right?" choice of A to D. Its stem is skill-dealt and the wrong options come from the provider.
  Online, every one of these skills deals a production item (a number, a rule, or a shade), never
  the choice, and no skill option deals "choose the right one from the provider's wrong answers".
  - Verdict: partial in all 5 lessons.
  - Smallest fix: one shared response option, `response: 'which-right'`. It would deal the item as
    a multiple choice of the provider's `wrongAnswer` set, the same set `sheet/roles/error-analysis.js`
    and `true-false.js` already read. Add it in `skill-options.js` (a generic option, like
    `count_objects` `response`), plus a codec key in `skill-option-keys.js`.
- **X2. Word problems (P5) in lessons 1, 3, 4 and 5 are hand-written.** The lesson file writes the
  story `lines`, and a dealt fact, number or table only fills its numbers. No skill deals these
  stories online. Lesson 2's P5 is the exception: it is `add_wp_20`'s own story.
- **X3. P0, P1 and retrieval floors are lesson-only.** These refs carry `minNum` / `maxNum` floors
  (for example `more_less_10` minNum 85 / 120–880, or `mult_facts` minNum 12, which online deals as
  2 × 0). Online, the same item type comes with a wider range: pass 14–100/100.
  - The item types match; these are earlier-content pages.
  - Low priority. Note them in `skills.used` as `ref`.
- **X4. Unknown opts keys.** Some refs pass opts that the skill's schema ignores:
  - `zeroPlace` on `placevalue:unit_form` and `placevalue:value` (lesson 1);
  - `band` on `addition:add_wp_20` (lesson 2).

  The generator ignores them and the share code drops them. Remove them from the refs, or add the
  option.

---

## Lesson 1: g2-nbt3-read-write-1000 (2.NBT.A.3)

### 1. Printed item types (pool) → skill + opts

| Page | Item type (paper) | Skill + opts (lesson-only keys) | Online: answerType / cell, range, edge cases | Parity |
|---|---|---|---|---|
| P0 a–d | number name to numeral, 21–99 | composing:number_word_form {wordform:[to_number], band:100, zeroPlace:none} (min 21, max 99) | number / `words`; 21–100 (deals 100 on 2/100) | same type; range differs (100) |
| P0 e–g | unit form, 3 digits | placevalue:unit_form {band:999} (`zeroPlace` ignored; min 101) | inline-blanks / pv; 102–993; a 0 place on 14/100 | same |
| P0 h–i | value of the underlined digit | placevalue:value {band:999} | number / pv; 122–981 | same |
| P1 A/B | 10 more, 1 less, 10 less, compare, tens and ones (2-digit) | placevalue:more_less_10 {step, dir, band:100}, placevalue:compare {band:99, closeness}, placevalue:unit_form {band:99} (B: min 85) | number / symbol / inline-blanks, pv | same type; floors lesson-only (X3) |
| P2 chart, P3 Guided, P4-1 | numeral to expanded form, one box per place | placevalue:expand {band:999, zeroPlace:some} (min 101) | interactive / pv boxes; 102–999; 0 tens 26, 0 ones 24, teen 4 per 100 | same; teen ending rare online |
| P2b, P3b, P4-2 | number name to numeral, H T O boxes | composing:number_word_form {wordform:[to_number], band:1000, zeroPlace:some, answerSlot:hto} (max 999) | number / `words`; 102–**1000** (8/100 deal 1,000, a board-only number); 0 tens 19, teen 3 per 100 | **differs**: 1,000 online; the screen shows the legacy place chart and ONE number input, not the kit `words` cell with three digit boxes (no screen twin for `words` in screen-cell.js) |
| Mixed | expanded form to numeral | placevalue:combine {band:999, zeroPlace:some} | number / pv | same |
| Mixed | name to numeral, unit form, value | as above | | as above |
| P5 | story: N bags of 100 and M more beads; write h + t + o = n | **hand-written** `lines` on a placevalue:combine item (want pvZeroTens) | no skill deals a hundreds-and-ones story | **gap (X2)** |
| P6 a–b | name to numeral | number_word_form (as P4-2) | | as P4-2 |
| P6 c | expanded form to numeral | combine | | same |
| P6 d | numeral to expanded form, a 0 place | expand | | same |
| Check Question | "Which is 703 in expanded form?" A–D | expand (want pvZeroTens) + provider wrong answers | production only | **X1** |

### 2. Online parity gaps

1. **`number_word_form` band 1000 deals 1,000 online.** The paper's `maxNum: 999` is lesson-only.
2. **The `words` cell has no screen twin.** On screen the H T O slot response is not the paper's.
3. **P5 story has no skill.**
4. **Teen ending (`pvTeen`) is rare online**: 3–4/100, against a forced ★★★ row on paper.
5. **Stray opts keys (X4).** `zeroPlace` is passed to unit_form and value but is not in their schema.

### 3. Coverage

| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| CCSS: read number names → write the numeral (to 999) | number_word_form to_number, band 1000, answerSlot hto | full |
| CCSS: 1,000 (numeral, name) | board only (lesson ruling) | elsewhere: composing:number_word_form band 1000 (deals 1,000) |
| CCSS: write number names (numeral → words) | (owner ruling R1: said only) | elsewhere: follow-on lesson "Write numbers to 1,000 in words" (number_word_form {wordform:[to_words]}) |
| CCSS: write expanded form | placevalue:expand {zeroPlace:some} | full |
| CCSS: read expanded form → numeral | placevalue:combine | full |
| CCSS: read a numeral aloud (say its name) | Say bands only; no item | elsewhere: placevalue:number_word_names (choose the name) |
| Atom: number words 21–99 | number_word_form band 100 | full |
| Atom: 3 digits, 3 places | unit_form band 999 | full |
| Atom: value of a digit | value band 999 | full |
| Atom: word parts, hundreds first | number_word_form to_number | full |
| Atom (critical): 0 holds a place | expand / number_word_form zeroPlace some | full |
| Atom: teen or ty (213 not 230) | number_word_form / expand, teen ending only via `pvTeen` ref | partial (online 3/100; no option) |
| Atom: expanded = digit × place | expand | full |
| Routine 1–4 (hundreds, tens, 0 place, ones, read with plus) | expand | full |
| Routine 5 (name → numeral in H T O) | number_word_form answerSlot hto | full on paper; partial on screen (no `words` twin) |

### 4. Gaps and smallest fixes

- **1,000 online.** Add band value `999` to `composing:number_word_form` (`skill-options.js` line ~1550,
  "deals 101 to 999"), use it in the lesson, and drop `maxNum: 999`.
- **H T O on screen.** Give the `words` template a screen twin:
  - extend `kitCellTwin` in `screen-cell.js` (pv only today, line 3415);
  - or have `gen-algebraic.js` set `q.visual` from the kit `words` cell when `answerSlot: 'hto'`,
    the way `gen-operations.js` `_kitTwin` does.
- **P5 story.** Add an option to `placevalue:combine` (`form: 'story'`, word-work cell): N hundreds
  and M ones in context. Or name a follow-on story skill.
- **Teen endings.** Add an option `teens: 'some'` (every third item a teen ending) on `expand` and
  `number_word_form`, like `zeroPlace`.
- **Stray opts and stale record.**
  - Remove `zeroPlace` from the unit_form / value refs (lesson file `PV()` helper).
  - The current `skills.used` lists `placevalue:identify`, which no page deals. Replace it.

### `skills.used` (JSON)

```json
[
  {"role": "P0 a-d", "key": "composing:number_word_form", "opts": {"wordform": ["to_number"], "band": 100, "zeroPlace": "none"}, "ref": {"minNum": 21, "maxNum": 99}},
  {"role": "P0 e-g, Mixed", "key": "placevalue:unit_form", "opts": {"band": 999}, "ref": {"minNum": 101, "maxNum": 999}},
  {"role": "P0 h-i, Mixed", "key": "placevalue:value", "opts": {"band": 999}, "ref": {"minNum": 101, "maxNum": 999}},
  {"role": "P1 A/B", "key": "placevalue:more_less_10", "opts": {"step": [10, 1], "dir": ["more", "less"], "band": 100}, "ref": {"minNum": "10 (B: 85)", "maxNum": 99}},
  {"role": "P1 A/B", "key": "placevalue:compare", "opts": {"band": 99, "closeness": ["far", "close"]}},
  {"role": "P1 A/B", "key": "placevalue:unit_form", "opts": {"band": 99}},
  {"role": "P2, P3, P4-1, P6 d (chunk a)", "key": "placevalue:expand", "opts": {"band": 999, "zeroPlace": "some"}, "ref": {"minNum": 101, "maxNum": 999}},
  {"role": "P2b, P3b, P4-2, Mixed, P6 a-b (chunk b)", "key": "composing:number_word_form", "opts": {"wordform": ["to_number"], "band": 1000, "zeroPlace": "some", "answerSlot": "hto"}, "ref": {"minNum": 101, "maxNum": 999}},
  {"role": "Mixed, P6 c", "key": "placevalue:combine", "opts": {"band": 999, "zeroPlace": "some"}, "ref": {"minNum": 101, "maxNum": 999}},
  {"role": "P5 (numbers only; story hand-written)", "key": "placevalue:combine", "opts": {"band": 999, "zeroPlace": "some"}, "ref": {"want": "pvZeroTens"}},
  {"role": "Check Question (board)", "key": "placevalue:expand", "opts": {"band": 999, "zeroPlace": "some"}, "ref": {"want": "pvZeroTens"}}
]
```

### `skills.coverage` (JSON)

```json
[
  {"clause": "2.NBT.A.3 read number names, write the numeral (to 999)", "skill": "composing:number_word_form", "opts": {"wordform": ["to_number"], "answerSlot": "hto"}, "verdict": "full"},
  {"clause": "2.NBT.A.3 the number 1,000", "skill": null, "verdict": "elsewhere: composing:number_word_form band 1000"},
  {"clause": "2.NBT.A.3 write number names", "skill": null, "verdict": "elsewhere: follow-on lesson Write numbers to 1,000 in words (composing:number_word_form {wordform:[to_words]})"},
  {"clause": "2.NBT.A.3 write expanded form", "skill": "placevalue:expand", "opts": {"zeroPlace": "some"}, "verdict": "full"},
  {"clause": "2.NBT.A.3 read expanded form", "skill": "placevalue:combine", "verdict": "full"},
  {"clause": "2.NBT.A.3 read a numeral aloud", "skill": null, "verdict": "elsewhere: placevalue:number_word_names"},
  {"atom": "Number words 21-99", "skill": "composing:number_word_form", "opts": {"band": 100}, "verdict": "full"},
  {"atom": "3 digits, 3 places", "skill": "placevalue:unit_form", "verdict": "full"},
  {"atom": "Value of a digit", "skill": "placevalue:value", "verdict": "full"},
  {"atom": "Word parts: hundreds first", "skill": "composing:number_word_form", "verdict": "full"},
  {"atom": "Zero holds a place (critical)", "skill": "placevalue:expand + composing:number_word_form", "opts": {"zeroPlace": "some"}, "verdict": "full"},
  {"atom": "Teen or ty", "skill": "composing:number_word_form", "verdict": "partial"},
  {"atom": "Expanded form: digit x place", "skill": "placevalue:expand", "verdict": "full"},
  {"atom": "Routine 1-4", "skill": "placevalue:expand", "verdict": "full"},
  {"atom": "Routine 5: name to numeral in H T O", "skill": "composing:number_word_form", "opts": {"answerSlot": "hto"}, "verdict": "partial"}
]
```

---

## Lesson 2: g1-oa1-bar-model-wp-20 (1.OA.A.1)

### 1. Printed item types → skill + opts

| Page | Item type | Skill + opts (lesson-only) | Online | Parity |
|---|---|---|---|---|
| P0 | count counters in ten frames, 17–20 | counting:count_objects {band:20, objects:frame} (min 17) | number / counters; 1–20 (pass 17/100) | same type; range X3 |
| P0 | number bond, whole missing | composing:number_bonds {band:10, unknown:answer, orientation:horizontal} (partMin 3, min 6, distinctFirst) | number / bond; 3–10 (pass 20/100) | same type; range X3 |
| P0 | + fact within 20, stacked | addition:add_facts {band:20, notation:[stacked]} (11–16, noPart 10) | number / fact; 1–19 (pass 50/100) | same type; range X3 |
| P1 A/B | 1 more / 1 less / 10 more, compare, tens and ones | placevalue:more_less_10, compare, unit_form | same | X3 |
| P2 chart, P3 Guided, P4-1, P6 a–b | join story, whole unknown, bar under it; pupil writes the parts in the bar and the whole in the answer box | addition:add_wp_20 {pictures:false, support:bar, wpCues:false, wpBank:false} (partMin 3, noPart [10], crossTen, 11–18/20, cellPayload {layout:'bar'}, shortQuestion, want …) | number / `word-work` (bar drawn); wholes **5–20**, parts 1–13: **pass 18/100** (online deals 4 + 5, 7 + 1, 12 + 7, 13 + 7); put together / add to 50 / 50; equal parts 6, whole of 20 7 per 100 | **differs**: number range and parts (the lesson's crossing-ten design); the response online is the whole only (paper also writes both parts in the bar); the long question form ("How many pencils does Lena have now?") against the paper's short form |
| P5 | the same story, bar off; pupil draws the bar and writes `□ ○ □ = □` (the sign in a circle) | add_wp_20 {support:none} (signSlot, keyBar) | number only | **partial**: the equation and sign response is paper-only |
| Check Question | which bar is right (A–D) | add_wp_20 (want wpBridgeBigFirst) | production | **X1** |

### 2. Online parity gaps

1. **No option bounds the parts.** The crossing-ten design (parts 3–9, whole 11–18, 20 as the edge
   case) is lesson-only (`partMin`, `noPart`, `crossTen`). Online only 18/100 stories fit it.
2. **The bar's parts are not checked online.** Only the whole is answered.
3. **The equation response on P5 has no screen equivalent.** The pupil writes the sign in a circle
   (`signSlot`) on paper only.
4. **`shortQuestion` is a print-only ref key.**
5. **`band: 20` is not an add_wp_20 option (X4).**

### 3. Coverage

| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| CCSS: add to, result unknown, within 20 | add_wp_20 {support:bar} | full |
| CCSS: put together, total unknown | add_wp_20 {support:bar} | full |
| CCSS: taking from | — | elsewhere: subtraction:sub_wp_20 (follow-on "take from") |
| CCSS: taking apart (part unknown) | — | elsewhere: subtraction:sub_wp_20 / follow-on "take apart" |
| CCSS: comparing | — | elsewhere: addition:comparison_word (follow-on "compare with two bars") |
| CCSS: unknowns in all positions (change, start) | — | elsewhere: subtraction:unknown_start_wp (follow-on "change / start unknown") |
| CCSS: drawings (bar) | add_wp_20 {support:bar}; P5 {support:none} | full |
| CCSS: equation with a symbol for the unknown | P5 sign / equation boxes (paper only); no unknown symbol | partial |
| Atom: count a set | count_objects {objects:frame} | full |
| Atom: parts and whole | number_bonds {unknown:answer} | full |
| Atom: add within 20, count on past 10 | add_facts {band:20} | full |
| Atom: missing whole → add | add_wp_20 | full |
| Atom: story numbers are parts | add_wp_20 {support:bar} | full on paper; partial online (parts not answered) |
| Atom (critical): whole on top, parts below | add_wp_20 {support:bar} | partial online (the bar is shown but not filled) |
| Atom: "in all" / "now" ask for the whole | add_wp_20 | full |
| Atom: same parts, same whole (turn-around) | equal parts / turn-around via `fresh` | full on paper (a dealing rule) |
| Routine 1–4 | add_wp_20 {support:bar} | steps 2 and 4: partial online (one answer only) |

### 4. Gaps and smallest fixes

- **Parts.** Add an `add_wp_20` option, `wpParts: 'bridge'`: both parts 3–9 and crossing ten, plus a
  whole of 20 as the edge case. That is the lesson's `partMin` / `noPart` / `crossTen` as a skill
  option, in `skill-options.js` (`addition:add_wp_20`), `gen-operations.js` and a codec key.
- **Bar response.** Build the record's own proposal `barFill` as the bar response: the parts and the
  whole are typed into the bar boxes (word-work bar layout, answerType `inline-blanks`). Make the
  `layout: 'bar'` payload the skill's own when `support: 'bar'`.
- **Equation.** Add an option `wpEquation: true` (write `a ○ b = □`, sign included) on add_wp_20.
  That moves `signSlot` from the lesson into the skill.
- **`shortQuestion`.** Make it a skill option (`wpShort`).
- **Situations.** The follow-ons are already proposed in the record. Name each with its existing
  skill (table above) so that no row stays partial.

### `skills.used` (JSON)

```json
[
  {"role": "P0 atom 1", "key": "counting:count_objects", "opts": {"band": 20, "objects": "frame"}, "ref": {"minNum": 17, "maxNum": 20}},
  {"role": "P0 atom 2", "key": "composing:number_bonds", "opts": {"band": 10, "unknown": "answer", "orientation": "horizontal"}, "ref": {"partMin": 3, "minNum": 6, "distinctFirst": true}},
  {"role": "P0 atom 3", "key": "addition:add_facts", "opts": {"band": 20, "notation": ["stacked"]}, "ref": {"minNum": 11, "maxNum": 16, "noPart": [10]}},
  {"role": "P1 A/B", "key": "placevalue:more_less_10", "opts": {"step": [1, 10], "dir": ["more", "less"], "band": [20, 100]}},
  {"role": "P1 A/B", "key": "placevalue:compare", "opts": {"band": 99, "closeness": ["far", "close"]}},
  {"role": "P1 A/B", "key": "placevalue:unit_form", "opts": {"band": 99}},
  {"role": "P2 chart, P3 Guided, P4-1, P6 a-b, Check Question", "key": "addition:add_wp_20", "opts": {"pictures": false, "support": "bar", "wpCues": false, "wpBank": false}, "ref": {"partMin": 3, "noPart": [10], "crossTen": true, "minNum": 11, "maxNum": 20, "cellPayload": {"layout": "bar"}, "shortQuestion": true}},
  {"role": "P5", "key": "addition:add_wp_20", "opts": {"pictures": false, "support": "none", "wpCues": false, "wpBank": false}, "ref": {"partMin": 3, "noPart": [10], "crossTen": true, "signSlot": true, "keyBar": true}}
]
```

### `skills.coverage` (JSON)

```json
[
  {"clause": "1.OA.A.1 adding to, result unknown, within 20", "skill": "addition:add_wp_20", "opts": {"support": "bar"}, "verdict": "full"},
  {"clause": "1.OA.A.1 putting together, total unknown", "skill": "addition:add_wp_20", "opts": {"support": "bar"}, "verdict": "full"},
  {"clause": "1.OA.A.1 taking from", "skill": null, "verdict": "elsewhere: subtraction:sub_wp_20"},
  {"clause": "1.OA.A.1 taking apart", "skill": null, "verdict": "elsewhere: subtraction:sub_wp_20"},
  {"clause": "1.OA.A.1 comparing", "skill": null, "verdict": "elsewhere: addition:comparison_word"},
  {"clause": "1.OA.A.1 unknowns in all positions", "skill": null, "verdict": "elsewhere: subtraction:unknown_start_wp"},
  {"clause": "1.OA.A.1 drawings", "skill": "addition:add_wp_20", "opts": {"support": "bar"}, "verdict": "full"},
  {"clause": "1.OA.A.1 equations with a symbol for the unknown", "skill": "addition:add_wp_20", "opts": {"support": "none"}, "verdict": "partial"},
  {"atom": "Count a set", "skill": "counting:count_objects", "verdict": "full"},
  {"atom": "Parts and whole", "skill": "composing:number_bonds", "verdict": "full"},
  {"atom": "Add within 20", "skill": "addition:add_facts", "verdict": "full"},
  {"atom": "Missing whole: add", "skill": "addition:add_wp_20", "verdict": "full"},
  {"atom": "Story numbers are parts", "skill": "addition:add_wp_20", "opts": {"support": "bar"}, "verdict": "partial"},
  {"atom": "Bar: whole on top, parts below (critical)", "skill": "addition:add_wp_20", "opts": {"support": "bar"}, "verdict": "partial"},
  {"atom": "In all / now ask for the whole", "skill": "addition:add_wp_20", "verdict": "full"},
  {"atom": "Same parts, same whole", "skill": "addition:add_wp_20", "verdict": "full"}
]
```

---

## Lesson 3: g3-oa5-mult-properties (3.OA.B.5, lesson 3a: the order property)

### 1. Printed item types → skill + opts

| Page | Item type | Skill + opts (lesson-only) | Online | Parity |
|---|---|---|---|---|
| P0 | count by 5, two printed | multiplication:count_by_tables {rows:[{step:5}], fill:two, times:none} | text / count-row | same |
| P0 | × 2 facts, stacked | mult_facts {constant:[2], notation:[stacked], band:100} (12–18) | number / fact; 0–20 (pass 34/100; deals 2 × 0) | same type; range X3 |
| P0 | array: rows of __ make __ (squares) | arrays_groups {forms:[0]} (allTest arrGridSquare, 4–25) | inline-blanks / arrays; squares 20/100 | same type |
| P1 A/B | Y2 place value bank | more_less_10 / more_less_100 / compare / unit_form | same | X3 |
| P2 chart, P3 Guided | array and its turn: both products; known fact gives the turned fact | multiplication:mult_properties {forms:[0], task:[0,1], band:25} (6–20) | text / `arrays-turn`; products 4–25 (pass 96/100) | same |
| P4-1 | known fact → turned fact, pictures | mult_properties {forms:[0], task:[1], band:25} (6–16, allTest arrP1) | text / arrays-turn; pass 73/100 | same type; floors lesson-only |
| P4-2 | facts only, missing number | mult_properties {forms:[0], task:[2], band:81} (min 12, factorCap 4, allTest arrP2) | number / arrays-turn; 6–72; arrP2 71/100 | same type |
| P5 | tray story: R rows of C, turned, how many in each row? | **hand-written** `lines` on a task-2 item (want arrWpTurn) | no skill deals a turn story | **gap (X2)** |
| P6 a | turn the fact, no picture | mult_properties {forms:[0], task:[1], band:81, pictures:false} | text; arrKnownBare 68/100 | same |
| P6 b–c | same product / missing factor | mult_properties {forms:[0], task:[2], band:81} | number | same |
| Check Question | which turned fact is true (A–C) | task 2 (want arrProductP2) | production | **X1** |

### 2. Online parity gaps

1. **P5 turn story has no skill.**
2. **Product floors (6–20, 6–16, min 12) and `factorCap` are lesson-only.** Online deals 2 × 2 and
   2 × 5 = 10.
3. **Stale head comment.** The lesson file's header comment (lines 7–14) still says
   `mult_properties` is not used on pupil pages and that `arrays_groups` is the practice skill. The
   pages use `mult_properties`. Fix the comment.

### 3. Coverage

| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| CCSS: commutative (6 × 4 known → 4 × 6) | mult_properties {forms:[0], task:[0,1,2]} | full |
| CCSS: associative (3 × 5 × 2) | — | elsewhere: build-list `mult_three` (not built); name a follow-on lesson "Multiply three numbers" |
| CCSS: distributive (8 × 7 = 8 × 5 + 8 × 2) | — | elsewhere: follow-on 3c "Break apart an array" (mult_properties {forms:[1]}, legacy, needs P-A) |
| CCSS: × 1 (identity), × 0 contrast | — | elsewhere: follow-on 3b (mult_properties {forms:[2,3]}) |
| CCSS: properties as strategies to divide | — | elsewhere: none (no skill); add to the 3b / 3c follow-ons or the build list |
| Atom: count by 5 | count_by_tables step 5 | full |
| Atom: × 2 facts | mult_facts {constant:[2]} | full |
| Atom: array fact rows × in each row | arrays_groups {forms:[0]} | full |
| Atom: turned array, rows become columns | mult_properties task 0 | full |
| Atom (critical): same product, no recount | mult_properties task 2 | full |
| Atom: known fact gives the turned fact | mult_properties task 1 | full |
| Routine 1–5 | mult_properties task 0 / 1 / 2 | full |

### 4. Gaps and smallest fixes

- **P5 turn story.** Add a `task` value 3 to `multiplication:mult_properties`: "a turn story"
  (word-work cell, rows / cols turned). That is `skill-options.js` line ~2072 plus the generator in
  `gen-operations.js`.
- **Associative.** Name `mult_three` as follow-on lesson 3d in `followOn`.
- **Division.** Name the division-strategy gap in `followOn` or on the build list.
- **Floors.** Optional: a `minProduct` option on mult_properties.

### `skills.used` (JSON)

```json
[
  {"role": "P0 atom 1", "key": "multiplication:count_by_tables", "opts": {"rows": [{"step": 5, "start": "step", "dir": "up"}], "fill": "two", "times": "none"}},
  {"role": "P0 atom 2", "key": "multiplication:mult_facts", "opts": {"constant": [2], "notation": ["stacked"], "band": 100}, "ref": {"minNum": 12, "maxNum": 18}},
  {"role": "P0 atom 3", "key": "multiplication:arrays_groups", "opts": {"forms": [0]}, "ref": {"allTest": "arrGridSquare"}},
  {"role": "P1 A/B", "key": "placevalue:more_less_10 / more_less_100 / compare / unit_form", "opts": {"band": [99, 100]}},
  {"role": "P2 chart, P3 Guided", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [0, 1], "band": 25}, "ref": {"minNum": 6, "maxNum": 20}},
  {"role": "P4-1", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [1], "band": 25}, "ref": {"minNum": 6, "maxNum": 16, "allTest": "arrP1"}},
  {"role": "P4-2", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [2], "band": 81}, "ref": {"minNum": 12, "factorCap": 4, "allTest": "arrP2"}},
  {"role": "P5 (numbers only; story hand-written)", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [2], "band": 81}, "ref": {"want": "arrWpTurn"}},
  {"role": "P6 a", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [1], "band": 81, "pictures": false}},
  {"role": "P6 b-c, Check Question", "key": "multiplication:mult_properties", "opts": {"forms": [0], "task": [2], "band": 81}}
]
```

### `skills.coverage` (JSON)

```json
[
  {"clause": "3.OA.B.5 commutative property", "skill": "multiplication:mult_properties", "opts": {"forms": [0], "task": [0, 1, 2]}, "verdict": "full"},
  {"clause": "3.OA.B.5 associative property", "skill": null, "verdict": "elsewhere: build-list mult_three (follow-on lesson Multiply three numbers)"},
  {"clause": "3.OA.B.5 distributive property", "skill": null, "verdict": "elsewhere: lesson 3c Break apart an array (multiplication:mult_properties {forms:[1]})"},
  {"clause": "3.OA.B.5 x 1 / x 0", "skill": null, "verdict": "elsewhere: lesson 3b Multiply by 1 and by 0 (multiplication:mult_properties {forms:[2,3]})"},
  {"clause": "3.OA.B.5 properties as strategies to divide", "skill": null, "verdict": "elsewhere: none yet (build list)"},
  {"atom": "Count by 5", "skill": "multiplication:count_by_tables", "verdict": "full"},
  {"atom": "Recall x 2 facts", "skill": "multiplication:mult_facts", "opts": {"constant": [2]}, "verdict": "full"},
  {"atom": "Array fact", "skill": "multiplication:arrays_groups", "opts": {"forms": [0]}, "verdict": "full"},
  {"atom": "Turned array", "skill": "multiplication:mult_properties", "opts": {"task": [0]}, "verdict": "full"},
  {"atom": "Same product (critical)", "skill": "multiplication:mult_properties", "opts": {"task": [2]}, "verdict": "full"},
  {"atom": "Known fact gives the turned fact", "skill": "multiplication:mult_properties", "opts": {"task": [1]}, "verdict": "full"}
]
```

---

## Lesson 4: g3-oa9-mult-table-patterns (3.OA.D.9, 3.OA.C.7)

### 1. Printed item types → skill + opts

| Page | Item type | Skill + opts (lesson-only) | Online | Parity |
|---|---|---|---|---|
| P0 | count by 2 | count_by_tables {rows:[{step:2}], fill:two, times:none, missing:20} | text / count-row | same |
| P0 | × 2 / × 4 facts | mult_facts {constant:[2,4], notation:[stacked], band:100} (12–36) | number; 0–40 (pass 54/100) | X3 |
| P0 | chart window, fill the missing products | mult_chart {chart:window, band:100, task:fill, minFactor:2, winRows:2, winCols:3} (allTest chartIn9) | text / mult-grid; pass 72/100 | same type |
| P1 A/B | place-value bank | more_less_10 / more_less_100 / compare / unit_form | same | X3 |
| P2 chart, P3 Guided | shade the even products, 2 × 4 window | mult_chart {chart:window, band:144, task:even, minFactor:2, winRows:2, winCols:4} (allTest chartFresh, allHard) | multi-select-check ("Tap every even product") / mult-grid | same response (shade = tap); **46/100 windows hold the 10 row or column**, which the paper never deals (chartFresh) |
| P4-1 | shade even, 2 × 3 windows | mult_chart {…, winRows:2, winCols:3} (gridRevisit) | as above; pass 59/100 | as above |
| P5 | apples story: a bags of b; how many; even or odd? | **hand-written** `lines` on a mult_facts {constant:[4,6,8]} item; the parity is answered in the Say band | no skill deals "is the product even or odd" | **gap (X2)**: patterns_notice is not built |
| P6 a–c | shade even, fresh 2 × 3 windows | mult_chart (as P4-1) (gridFresh) | as above | as above |
| Check Question | which shading is right (A–C) | mult_chart (want chartMixed, chartRowOnly) | production | **X1** |

### 2. Online parity gaps

1. **The 10 row and column.** The lesson's chart is 2–12 without 10 (`chartFresh`). No option
   excludes 10, so 46/100 of online windows contain it.
2. **Parity of a product is not a skill.** "Is it even or odd?" (P5, the Say band) has no skill.
   That is B5 `patterns_notice`.

### 3. Coverage

| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| 3.OA.D.9: identify a pattern in the multiplication table | mult_chart {task:even} | full |
| 3.OA.D.9: patterns in the addition table | — | elsewhere: none (gap in standards-audit.js P verdict) |
| 3.OA.D.9: explain a pattern using properties (4 × n is two equal addends) | Say / T4 cubes only; no pupil item | partial; fix: build `patterns_notice` (build-list.js line 591), or name it as a follow-on lesson |
| 3.OA.D.9: other arithmetic patterns (rules) | — | elsewhere: g3-oa9-input-output-rule (function_table_easy) |
| 3.OA.C.7: multiply within 100 / know products from memory | P0 mult_facts ×2, ×4 only | elsewhere: multiplication:mult_facts (all tables) |
| 3.OA.C.7: divide within 100; × / ÷ relationship | — | elsewhere: division:div_facts |
| Atom: even numbers, count by 2s | count_by_tables step 2 | full |
| Atom: facts of 2 and 4 | mult_facts {constant:[2,4]} | full |
| Atom: read the chart | mult_chart {task:fill} | full |
| Atom: even row → every product even | mult_chart {task:even} | full |
| Atom: why, two equal parts | no item | partial (patterns_notice) |
| Atom (critical): one even factor is enough | mult_chart {task:even} (chartMixed) | full |
| Atom: odd × odd is odd | mult_chart {task:even} (chartOddOdd) | full |
| Routine 1–3 | mult_chart {task:even} | full |

### 4. Gaps and smallest fixes

- **The 10 row.** Add a `mult_chart` option, `skipTen` ("no 10 row or column"). Or let `constant`
  choose the window's rows and columns when `task` is `even`. That is `skill-options.js` line ~1073,
  `gen-mult-patterns.js` and a codec key.
- **Explain clause and P5 parity.** Build `patterns:notice_patterns` (B5 / `patterns_notice`):
  n × m, check Even or Odd, with a reason bank. That closes the explain clause and the P5 parity
  item together, and adds the second Practice page and the Mixed page already planned.

### `skills.used` (JSON)

```json
[
  {"role": "P0 atom 1", "key": "multiplication:count_by_tables", "opts": {"rows": [{"step": 2, "start": "step", "dir": "up"}], "fill": "two", "times": "none", "missing": 20}},
  {"role": "P0 atom 2", "key": "multiplication:mult_facts", "opts": {"constant": [2, 4], "notation": ["stacked"], "band": 100}, "ref": {"minNum": 12, "maxNum": 36}},
  {"role": "P0 atom 3", "key": "multiplication:mult_chart", "opts": {"chart": "window", "band": 100, "task": "fill", "minFactor": 2, "winRows": 2, "winCols": 3}, "ref": {"allTest": "chartIn9"}},
  {"role": "P1 A/B", "key": "placevalue:more_less_10 / more_less_100 / compare / unit_form"},
  {"role": "P2 chart, P3 Guided", "key": "multiplication:mult_chart", "opts": {"chart": "window", "band": 144, "task": "even", "minFactor": 2, "winRows": 2, "winCols": 4}, "ref": {"allTest": "chartFresh"}},
  {"role": "P4-1, P6 a-c, Check Question", "key": "multiplication:mult_chart", "opts": {"chart": "window", "band": 144, "task": "even", "minFactor": 2, "winRows": 2, "winCols": 3}, "ref": {"allTest": "chartFresh", "gridRevisit|gridFresh": true}},
  {"role": "P5 (numbers only; story and parity hand-written)", "key": "multiplication:mult_facts", "opts": {"constant": [4, 6, 8], "notation": ["stacked"], "band": 100}}
]
```

### `skills.coverage` (JSON)

```json
[
  {"clause": "3.OA.D.9 identify a pattern in the multiplication table", "skill": "multiplication:mult_chart", "opts": {"task": "even"}, "verdict": "full"},
  {"clause": "3.OA.D.9 patterns in the addition table", "skill": null, "verdict": "elsewhere: none (standards-audit gap)"},
  {"clause": "3.OA.D.9 explain a pattern using properties", "skill": null, "verdict": "partial"},
  {"clause": "3.OA.D.9 rules in a table", "skill": null, "verdict": "elsewhere: g3-oa9-input-output-rule (algebra:function_table_easy)"},
  {"clause": "3.OA.C.7 multiply within 100, know from memory", "skill": null, "verdict": "elsewhere: multiplication:mult_facts"},
  {"clause": "3.OA.C.7 divide within 100", "skill": null, "verdict": "elsewhere: division:div_facts"},
  {"atom": "Even numbers: count by 2s", "skill": "multiplication:count_by_tables", "verdict": "full"},
  {"atom": "Facts of 2 and 4", "skill": "multiplication:mult_facts", "opts": {"constant": [2, 4]}, "verdict": "full"},
  {"atom": "Read the chart", "skill": "multiplication:mult_chart", "opts": {"task": "fill"}, "verdict": "full"},
  {"atom": "Even row: every product even", "skill": "multiplication:mult_chart", "opts": {"task": "even"}, "verdict": "full"},
  {"atom": "Why: two equal parts", "skill": null, "verdict": "partial"},
  {"atom": "One even factor is enough (critical)", "skill": "multiplication:mult_chart", "opts": {"task": "even"}, "verdict": "full"},
  {"atom": "Odd x odd is odd", "skill": "multiplication:mult_chart", "opts": {"task": "even"}, "verdict": "full"}
]
```

---

## Lesson 5: g3-oa9-input-output-rule (3.OA.D.9)

### 1. Printed item types → skill + opts

| Page | Item type | Skill + opts (lesson-only) | Online | Parity |
|---|---|---|---|---|
| P0 | + facts, − facts, × 2 / 3 / 5 / 10 facts | add_facts {band:20} (11–19); sub_facts {band:20} (3–10); mult_facts {constant:[2,3,5,10]} (min 20, allTest factTen) | number; ranges wider (pass 60 / 87 / 60 per 100) | X3; the sub_facts screen has no kit cell (`cell` none) |
| P1 A/B | place-value bank | more_less_10 / more_less_100 / compare / unit_form | same | X3 |
| P2 chart, P3 Guided | find the rule (+, −, ×), 3 rows in order, frame and machine picture | algebra:function_table_easy {ftTask:rule, ftRules:[+,-,x], band:50, ftTable:31, support:frame, ftFactors:'2-3-5-10'} (allTest ftLessonAny) | text / function-table; **pass ftLessonAny 55/100**: online + / − steps reach 13 (paper: 2 to 10) | same type and response; range differs |
| P4-1, P4-2 | the same, 4 rows, frame only; ★★★: a × table and a − table with an Out of 0 | function_table_easy {…, ftTable:41, support:frame-bare} (allTest ftPracticeAny) | pass 54/100; Out of 0 on 2/100 online | range and edge case differ |
| P5 | Ben / Ann ages story + the table + rule frame | **hand-written** `lines` on a function_table_easy {ftRules:['+']} table | no story skill (`function_table_story` is a followOn, not on build-list.js) | **gap (X2)** |
| P6 a–c | + rule, − rule, × rule whose row 1 fits + | function_table_easy {ftRules:[op], support:frame-bare} (ftRuleMax, cellPayload ruleBelow) | same type; × trap on 77/100 | same |
| Check Question | which rule (A–C) | function_table_easy {ftRules:['x']} (want ftTimes) | production | **X1** |

### 2. Online parity gaps

1. **+ / − steps are unbounded.** "+ / − by 2 to 10" is lesson-only (`ftLessonAny` /
   `ftPracticeAny`). `ftFactors` bounds only × and ÷.
2. **The Out of 0 edge case is rare online**: 1–2 per 100.
3. **P5 story has no skill.**

### 3. Coverage

| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| 3.OA.D.9: identify an arithmetic pattern (a one-step rule) | function_table_easy {ftTask:rule} | full |
| 3.OA.D.9: patterns in the addition / multiplication table | — | elsewhere: g3-oa9-mult-table-patterns (mult_chart even); addition table: none |
| 3.OA.D.9: explain a pattern using properties | "test every row" said; no explain item | elsewhere: patterns_notice (lesson 4's fix) |
| Atom: add / subtract facts to 20 | add_facts, sub_facts {band:20} | full |
| Atom: × 2, 3, 5, 10 facts | mult_facts {constant:[2,3,5,10]} | full |
| Atom: In and Out, a pair per row | function_table_easy {ftTask:rule} | full |
| Atom: bigger or smaller | function_table_easy {ftRules:[+,-,x]} | full |
| Atom (critical): test every row | function_table_easy {ftRules:['x']} (ftTrap-like) | full |
| Atom: + or × | function_table_easy (× trap) | full; option `ftTrap: true` exists but is not passed |
| Atom: an Out of 0 | function_table_easy ★★★ ref only | partial (online 1–2 per 100, no option) |
| Routine 1–4 | function_table_easy {support:frame / frame-bare} | full |

### 4. Gaps and smallest fixes

- **Step bound.** Add a function-table option for the + / − step, `ftSteps: '2-10'`, alongside
  `ftFactors` (`skill-options.js` `_ftOptions`, `gen-function-table.js`, a codec key).
- **Out of 0.** Add an option `ftZero: true`: one − table a page has an Out of 0.
- **Critical-atom refs.** Pass `ftTrap: true` on the Check Question and P6 c refs, so that online
  practice deals the trap by option.
- **P5 story.** Build `algebra:function_table_story`; add it to build-list.js. Or keep P5 as the
  named follow-on and drop the hand-written story.

### `skills.used` (JSON)

```json
[
  {"role": "P0 atom 1", "key": "addition:add_facts", "opts": {"band": 20}, "ref": {"minNum": 11, "maxNum": 19}},
  {"role": "P0 atom 2", "key": "subtraction:sub_facts", "opts": {"band": 20}, "ref": {"minNum": 3, "maxNum": 10}},
  {"role": "P0 atom 3", "key": "multiplication:mult_facts", "opts": {"constant": [2, 3, 5, 10]}, "ref": {"minNum": 20, "allTest": "factTen"}},
  {"role": "P1 A/B", "key": "placevalue:more_less_10 / more_less_100 / compare / unit_form"},
  {"role": "P2 chart, P3 Guided", "key": "algebra:function_table_easy", "opts": {"ftTask": "rule", "ftRules": ["+", "-", "x"], "band": 50, "ftTable": 31, "support": "frame", "ftFactors": "2-3-5-10"}, "ref": {"allTest": "ftLessonAny"}},
  {"role": "P4-1, P4-2", "key": "algebra:function_table_easy", "opts": {"ftTask": "rule", "ftRules": ["+", "-", "x"], "band": 50, "ftTable": 41, "support": "frame-bare", "ftFactors": "2-3-5-10"}, "ref": {"allTest": "ftPracticeAny"}},
  {"role": "P5 (table only; story hand-written)", "key": "algebra:function_table_easy", "opts": {"ftTask": "rule", "ftRules": ["+"], "band": 50, "ftTable": 31, "support": "frame-bare", "ftFactors": "2-3-5-10"}},
  {"role": "P6 a / b / c", "key": "algebra:function_table_easy", "opts": {"ftTask": "rule", "ftRules": ["+ | - | x"], "band": 50, "ftTable": 31, "support": "frame-bare", "ftFactors": "2-3-5-10"}, "ref": {"ftRuleMax": 1, "cellPayload": {"ruleBelow": true}}},
  {"role": "Check Question", "key": "algebra:function_table_easy", "opts": {"ftTask": "rule", "ftRules": ["x"], "band": 50, "ftTable": 31, "support": "frame", "ftFactors": "2-3-5-10"}, "ref": {"want": "ftTimes"}}
]
```

### `skills.coverage` (JSON)

```json
[
  {"clause": "3.OA.D.9 identify an arithmetic pattern (one-step rule)", "skill": "algebra:function_table_easy", "opts": {"ftTask": "rule"}, "verdict": "full"},
  {"clause": "3.OA.D.9 patterns in the multiplication table", "skill": null, "verdict": "elsewhere: g3-oa9-mult-table-patterns"},
  {"clause": "3.OA.D.9 patterns in the addition table", "skill": null, "verdict": "elsewhere: none (standards-audit gap)"},
  {"clause": "3.OA.D.9 explain using properties", "skill": null, "verdict": "elsewhere: patterns:notice_patterns (build-list patterns_notice)"},
  {"atom": "Add facts to 20", "skill": "addition:add_facts", "verdict": "full"},
  {"atom": "Subtract facts to 20", "skill": "subtraction:sub_facts", "verdict": "full"},
  {"atom": "x2, x3, x5, x10 facts", "skill": "multiplication:mult_facts", "verdict": "full"},
  {"atom": "In and Out", "skill": "algebra:function_table_easy", "verdict": "full"},
  {"atom": "Bigger or smaller", "skill": "algebra:function_table_easy", "verdict": "full"},
  {"atom": "Test every row (critical)", "skill": "algebra:function_table_easy", "opts": {"ftRules": ["x"]}, "verdict": "full"},
  {"atom": "+ or x", "skill": "algebra:function_table_easy", "verdict": "full"},
  {"atom": "An Out of 0", "skill": "algebra:function_table_easy", "verdict": "partial"}
]
```
