# Detailed lesson 7 (g3-oa8-two-step-wp): independent critic, round 1

Critic: Opus, medium effort, 2026-10-30. I graded the pack on branch `claude/sweet-newton-c8wrv1-lessons-6-7` at
`92cd31f3` cold. I did not build it.

Pack: `design/lesson-samples/detailed/g3-oa8-two-step-wp/`. It has 28 PNGs, seed 4242, and SELF-CHECK passes
50 / 50 rows.

## What I ran

- `ws-detailed-lesson --lesson g3-oa8-two-step-wp --check --out <scratch>` printed `ws-detailed-lesson: OK`. All 28 fresh
  PNGs are byte-identical to the committed ones.
- `ws-detailed-lesson --repeats` printed OK (29 places, 0 findings).
- `generateQuestionFor` in node, 400 seeds per form of `multi_step_word_plain`:
  - forms: `msOps` mult / div / multdiv, the `wpFrames` forms, msLetter, addmult, adddiv;
  - `multi_step_word` mult as well.
  - Results, all 0:
    - no answer is a story number;
    - no Step 1 answer is a story number or equals the answer;
    - every × fact is within 10 × 10;
    - every quotient is ≤ 10;
    - no answer is ≤ 0;
    - nothing is non-whole.
- `msChoose`, 500 seeds × mult / div / multdiv on both skills:
  - always 4 different values;
  - the answer is never the biggest or the smallest;
  - the answer's position is spread 25 % each;
  - `correct` always points at the answer;
  - Step 2 is always a take-away.
  - So the A–D set does not give the answer away.
- Presets, checked in the code and by sampling:
  - `algebra:two_step_mult_div_first`, `two_step_add_then_mult`, `two_step_add_then_div`,
    `two_step_letter_equation`, `two_step_estimate_check`;
  - label, grade 3, `SKILL_STANDARDS` (3.OA.D.8 + 4.OA.A.3 / M.EE.3.OA.7 + M.EE.4.OA.3) and 6–8 search terms each;
  - links in `data/curriculum/links/Y2–Y6`;
  - `skill-presets.js` opens `multi_step_word_plain` with the right `msOps` / `msLetter` / `msCheck`;
  - generated items match each name. Letter and check payloads carry `letter: true` and `check: {…}`.
- `ws-screen-answer`: card ok, worksheet 3/3 and quiz 3/3 for each of these:
  - `multi_step_word_plain` + `multi_step_word` `{mult, msChoose}`;
  - `{div, wpFrames}`;
  - `{mult}`;
  - the P0 forms (`mult_word_problems_plain`, `div_word_problems_plain`, `multi_step_word_plain`
    `{forms [0], wpFrames, band 30}`);
  - all five presets.
- `data/curriculum/detailed-lessons.json` has lesson 7 with every role and no `partial` row. Three clauses are
  `elsewhere:` the named presets.

What I checked by hand:
- I read all 28 PNGs, the `#v21-pool` JSON and `build.json`.
- I re-derived every answer and key:
  - P0: 25 · 6 · 5 · 21;
  - P1: 57 · 10 · > · 3 tens 9 ones · 34 · 887 · 295 · < · 8 tens 4 ones · 104;
  - chart 1: 5 × 9 = 45, 45 − 31 = 14 · the board example: 3 × 5 = 15, 15 + 10 = 25;
  - P3: 4 × 7 = 28, 28 − 9 = 19 · 6 × 4 = 24, 24 + 18 = 42;
  - chart 2: 20 ÷ 4 = 5, 5 + 8 = 13;
  - P3b: 24 ÷ 6 = 4, 4 + 3 = 7 · 30 ÷ 5 = 6, 6 − 4 = 2;
  - the Check Question: 3 × 9 = 27, 27 − 7 = 20. A 27 is "stops after Step 1", B 2 is 9 − 7, C 5 is 3 + 9 − 7;
  - P4-1: 2 × 4 + 3 = 11 · 2 × 6 − 7 = 5;
  - P4-2: 20 ÷ 5 − 3 = 1 · 6 ÷ 2 + 8 = 11;
  - P5: 5 × 7 − 10 = 25;
  - exit: 2 × 8 − 4 = 12 · 24 ÷ 3 + 2 = 10.
- T6's wrong answers check out: exit 1 gives 16 / 4 and exit 2 gives 8 / 5.
- I checked every T3–T6 line against the page and the item it names.

## Verdict: FAIL (6 pages below 8: P2, P2b, their two keys, P4-2, T5)

Lowest score per criterion: **C1 8 · C2 7 · C3 7 · C4 7.**

The numbers, keys, choice set, presets and screen parity are sound. The generator guards are good work. Three things
hold the pack:
- **D1:** the anchor charts are drawn at 0.77 and 0.7 of size L, so the story and digits are the smallest things on
  the poster.
- **D2:** fact families and story frames repeat across the pack. Chart 2's "20 marbles shared" comes back on P4-2.
- **D3:** a T5 script tells pupils the P5 page has no step boxes, when it has two.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 8 | 9 | 9 | n1 (Flow says Standard) |
| T2 Teacher 2 | 8 | 8 | 9 | 9 | n2 |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | n6 |
| T4 Teacher 4 | 9 | 8 | 9 | 9 | n3 (the chunk-b second example is missing) |
| T5 Teacher 5 | 8 | **7** | 9 | 9 | **D3**, n4 |
| P0 Prerequisite | 9 | 8 | 9 | 9 | n9 |
| P1 Number sense | 9 | 8 | 9 | 9 | n6 |
| P2 Anchor chart 1 | 8 | 8 | **7** | **7** | **D1** |
| P2b Anchor chart 2 | 8 | 8 | **7** | **7** | **D1**, n3 |
| P3 Lesson 1a | 9 | 8 | 9 | 9 | D2 (6 × 4 = 24) |
| P3b Lesson 1b | 9 | 8 | 9 | 9 | D2 (24 ÷ 6 = 4) |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | n7 |
| P4-2 Practice 2 | 9 | **7** | 9 | 9 | **D2**, n5 |
| P5 Word problem | 8 | 8 | 8 | 8 | D3 (counterpart), n8 |
| P6 Exit slip | 9 | 8 | 9 | 9 | D2 (24 buttons shared again) |
| P0 key | 9 | 8 | 9 | 9 | ✓ |
| P1 key | 9 | 8 | 9 | 9 | ✓ |
| P2 key | 8 | 8 | **7** | **7** | D1 |
| P2b key | 8 | 8 | **7** | **7** | D1 |
| P3 key | 9 | 8 | 9 | 9 | 19, 42 with regroup boxes ✓ |
| P3b key | 9 | 8 | 9 | 9 | 7, 2 ✓ |
| P4-1 key | 9 | 8 | 9 | 9 | 11, 5 ✓ |
| P4-2 key | 9 | 8 | 9 | 9 | 1, 11 ✓ (n5) |
| P5 key | 8 | 8 | 8 | 8 | 5 × 7 = 35, 35 − 10 = 25, Say 35 ✓ |
| P6 key | 9 | 8 | 9 | 9 | 12, 10, "answer" ✓ |
| T6 Answer Key | 9 | 8 | 9 | 9 | ✓ |

## Blockers

**D1. Both anchor charts are shrunk below size L, so the story and the digits are the smallest things on the poster.**
RUBRIC C4 / C3; this also breaks PT-ANC-1, TY-10 and the LESSONS_LEARNED classes "Size S" and "wasted space".

- **What the page says:**
  - P2 draws its panels inside `.mq-cdraw` at `zoom: 0.77`, and P2b at `zoom: 0.7`. 0.7 is `chartPage`'s fallback
    floor, used when the estimate says nothing fits. In every other detailed lesson the zoom is 0.84–1.39.
  - The story is set at 17 pt × 0.77 ≈ 13 pt on P2, and ≈ 12 pt on P2b. The working digits come out at about 20 pt
    (28 × 0.7–0.77).
  - The step titles beside them ("Step 1: the groups. Multiply.") are about 22 pt bold. "Read the story two times."
    is printed larger than the story it refers to.
- **Why it is wrong:**
  - PT-ANC-1 draws the example at 1.5 × L, because the poster is read from the board.
  - TY-10: working digits are the largest element on a page, at least 1.4 × the instruction. Here they are smaller
    than the step titles.
  - The story is the text the teacher points at in T4 §5a and §5b rows 1–2, and it is set below the L cell-text size
    (15 pt).
  - Meanwhile every panel has room spare. On P2:
    - the Step 2 drawing is about 41 mm tall in a 65 mm row;
    - the story block is about 22 mm tall in a 65 mm row with its right half empty.
  - At zoom 1 both would fit, so this is content shrunk while space is wasted.
- **Cause:**
  - `roles/lesson.js` `chartPage`, mode `one` with a `tailItem` (the step-4 band).
  - `solve(…, 1, zMax)` fails on the estimated `H(z)`, then falls back to `solve(…, 0.7, 1) || 0.7`.
  - The estimate (from `hOf(st, cols)`, i.e. side words + drawing) is larger than what renders, so the panel's real
    height is never used.
  - The second example (n3) was dropped by the same layout.
- **Fix:**
  - Measure the rendered panel, not the estimate. Give the chart zoom ≥ 1, as lesson 6 does, and let the side words
    wrap narrower.
  - Or move "Read the story two times." / "Step 1: 5 × 9 = 45." into the panel heads, so the drawing column is wider.
  - Add a gate: fail a chart whose `mq-cdraw` zoom is < 1, or whose story font is < 15 pt, or whose digits are < 1.4 ×
    the step-title size.

**D2. The pack repeats fact families and story frames. The anchor chart comes back as a practice item.**
RUBRIC C2 "no repeats" (LR-5); LESSONS_LEARNED "repeats". RESEARCH §H: "key freshness on the Step 1 fact AND its
turn-around".

- **What the pages say:**
  - Chart 2 (P2b): "Ravi has 20 marbles. Ravi shares them equally among 4 friends." 20 ÷ 4 = 5.
  - P4-2 item 1: "Tom has 20 marbles. Tom shares them equally among 5 friends." 20 ÷ 5 = 4. Spaced retrieval §3 asks
    4 × 5 = 20 as well.
  - P3 cell 2 (6 × 4 = 24, Tom, jars of stamps) and P3b cell 1 (24 ÷ 6 = 4, Ana, 24 buttons) are one fact family.
  - The exit slip's item 2 is "Leo has 24 buttons. Leo shares them equally among 3 friends. Each friend gets 2 more."
    That is P3b cell 1's object, total and frame, now on the assessment.
  - P0 item 3 (30 ÷ 6) and P3b cell 2 (30 ÷ 5) are one family.
  - Names: Zara is on 5 items (the board example, P3 cell 1, P3b cell 2, P4-1 item 2, P5). The board example and P5
    are both "Zara has N plates. Each plate has N beads", with 10 as the Step 2 number.
- **Why it is wrong:**
  - On P4-2 a pupil can copy the poster on the wall: same total, same object, same verb, the divisor and quotient
    swapped.
  - The exit item repeats a Guided frame, so it partly measures memory of P3b.
  - E24 reports "chart examples and their turn-arounds never return: 0". It keys `20÷4` and `20÷5` as different items
    and never folds a × fact into its ÷ family, so the gate is green on the very defect it names.
- **Fix:**
  - Key the pool on the unordered family {a, b, a·b} for × and ÷ together (`6×4`, `24÷6` and `24÷4` are one key), with
    retrieval in the pool.
  - Add the story frame (total + object) as a second key.
  - Let `lr6Names` spread names across chunks (at most 2 items per name).

**D3. T5 §9 tells the class there are no step boxes on P5. P5 prints two rows of step boxes.**
RUBRIC C2 "scripts match the pages they name"; LESSONS_LEARNED "scripts ≠ pages". T5 C2 → 7.

- **What the page says:**
  - T5 §9 row 2 reads: Say "No step boxes this time. Draw it. Write both steps."
  - P5 prints a Workspace, then a band with "Step 1: [ ] ○ [ ] = [ ]" and "Step 2: [ ] ○ [ ] = [ ]".
- **Why it is wrong:**
  - The teacher's sentence, read aloud to ELL and SPED pupils, contradicts what they see, and the boxes are labelled
    "Step 1" and "Step 2".
  - The builder means "no column work blocks". The pupil hears "no step boxes".
- **Fix:**
  - Script: "This time you draw it. Then write Step 1 and Step 2 in the boxes."
  - Add a gate: a script line that says "no <slot>" fails when the page it names prints that slot's label.

## Minors (no score effect)

- **n1. T1's Flow line reads "Standard (2 new routine steps)", and T2 says "Flow: Standard".** The lesson is chunked
  (5a 6a 5b 6b, P2b, P3b). DETAILED_MAKER's Chunked rule says T1 prints `Flow: Chunked (…)`.
- **n2. T2's common-mistakes rows say "Looks like 27 / 2 / 5" with no item named.**
  - The teacher has to find the Check Question on T5 to read them.
  - Name it: "27 for the Check Question (3 jars of 9, gives away 7)".
- **n3. Chunk b's second example is dealt, then printed nowhere.**
  - The pool holds P2b `18÷2` (ans 5, ÷ then −). The description's label "Gives away? Step 2 is −." is not on P2b,
    and T4 §5b has no board row, unlike §5a row 7.
  - ÷ then − is first met in P3b cell 2, which "Pupils do on their own".
  - E31 passes because it judges situations, not the Step 2 sign.
  - Put the board row in §5b, as §5a does.
- **n4. T5 §8 Watch names the last rows by their answer only.**
  - It reads "Practice 1: 5 …; Practice 2: 11 …".
  - Name the story, as lesson 6's `lastName` does: "Zara: 2 plates of 6, gives away 7".
- **n5. P4-2 item 1's unit bank prints "marble" (singular) beside "boxes" and "days".**
  - The singular form tells the pupil the answer is 1.
  - Keep the bank plural, and accept "marble" in T6's Accepted answers.
- **n6. P1 Number sense is Grade 1–2 place value.**
  - "1 more than 33", "10 less than 20", "39 = _ tens _ ones".
  - RESEARCH §I planned × facts, ÷ facts and 2-digit − 1-digit: the numbers this lesson's Steps use.
  - The facts are only in Spaced retrieval (3 items).
- **n7. Practice and the exit use one × table.** Every independent × Step 1 is a ×2 fact: 2 × 4, 2 × 6, and the exit's
  2 × 8.
- **n8. P5's Say frame names Step 2's operation: "My Step 1 answer is __. Then I take away."** That decides the Step 2
  sign for the pupil on the same page. Use "Then I ___." with a sign bank, or "Step 2 uses ___."
- **n9. P0 items 1–3 are one-step stories, but their bands say "Read the story. Write each step. Solve."**
- **n10. The preset `algebra:two_step_estimate_check` (msOps addsub, msCheck) can deal an answer equal to a story
  number.**
  - It happens on 8 of 1,000 seeds, e.g. "Ana had 29 shells. Ana got 15 more. Then Ana lost 29." → 15.
  - It deals answers above 100 on 5 % of seeds.
  - The msOps guards do not cover the addsub path, which RESEARCH §3 flagged.
  - It is not on this lesson's pages; fix it with the skill.
- **n11. The five lesson-7 presets have no `SKILL_WRM` tag.**
  - The builder argues that no WRM step teaches this.
  - RESEARCH §1 lists Y4.B10.S5 "Calculate with money (3.OA.D.8)" and Y4.B5.S14 "Correspondence problems (3.OA.D.8)".
  - Tag them as `{step, partial}`, per the CLAUDE.md linking rule.
- **n12. `multi_step_word*` has not had its own 8/10 redesign.**
  - It is out of scope here. Nothing from its skill page shows on this lesson's pages beyond D1's chart drawing.

## Skill coverage check (DETAILED_MAKER rules 1–4)

| Printed item | Skill + opts | Online form matches paper? |
|---|---|---|
| P0 1 | `mult_word_problems_plain {forms [0], wpFrames}` | yes (screen OK) |
| P0 2–3 | `div_word_problems_plain {forms [0], wpFrames}` | yes |
| P0 4 | `multi_step_word_plain {forms [0], band 30, wpFrames}` | yes |
| P1 | `more_less_10`, `more_less_100`, `compare`, `unit_form` | yes (their own forms) |
| P2, P3, P4-1 | `multi_step_word_plain {msOps mult}` (preset `two_step_mult_div_first`) | yes: two-step blocks, sign tiles, unit bank |
| P2b, P3b, P4-2 | `{msOps div}` | yes |
| P5 | `{msOps mult}`; Step frames = the `wpFrames` response | yes |
| P6 | `{msOps mult / div, wpFrames}` | yes |
| Check Question (A–D) | `{msOps mult, msChoose}` | **yes**: 4 rows with a tick box, the same three errors, the answer never at an extreme |

Clause coverage:
- 3.OA.D.8 four operations (× or ÷ then + or −): full in this lesson.
- Brackets, the letter equation and reasonableness: `elsewhere:` presets that are built, sampled and screen-checked.
- There is no `partial` row, so rule 3 holds.

## Automatic checks that would have caught each finding

| Finding | Class | Check | Exists? |
|---|---|---|---|
| D1 chart at zoom 0.7 / 0.77, story 12–13 pt, digits under the step titles, room left over | Size S / wasted space | `ws-detailed-lesson` E-row: read every `.mq-cdraw` zoom and the computed font size of `.mq-wwstory` and the stack digits on P2 / P2b. Fail if zoom < 1, story < 15 pt, or digits < 1.4 × the `.mq-chead` size. Also have `chartPage` log `sizing.mode` and fail when the 0.7 fallback is taken. | No: E8 measures digits "outside the anchor chart" only. |
| D2 a × / ÷ family or story frame returns | repeats | E24 keys a × or ÷ item as the unordered family {a, b, a·b} and adds a frame key (Step 1 total + object noun), with retrieval in the pool. Backtest row: this pack (`20÷4` / `20÷5`, `6×4` / `24÷6`, 24 buttons twice) must FAIL. | Partly: E24 keys the printed fact string only. |
| D3 "No step boxes" said over a page with step boxes | scripts ≠ pages | E29 extension: a script line naming its page that says "no <word>" fails when that page's text holds `<word>` as a label ("Step 1:"). | No |
| n1 Flow word | scripts ≠ pages | When the description has `chunks`, T1's Flow line must read "Chunked". | No |
| n3 a dealt second example printed nowhere | dropped content | Every pool place must appear in some page's rendered text. P2b `18÷2` did not. | No |
| n5 singular word in a plural bank | answer given away | A `bank` must be all one grammatical number. Fail a singular word among plurals. | No |
| n8 Say frame names the operation | answer given away | A Say frame may not hold an operation word (add / take away / times / share) when its page has a sign slot. | No |

## Speed-ups this round revealed

- **A green gate on a named rule cost a critic round.** E24 says "turn-arounds never return" and passed a pack where
  the chart's ÷ fact returns turned round.
  - A gate whose text names a rule must have a backtest row that fails on that rule (the ws-backtest discipline).
  - Add `e24-family` with this pack.
- **The chart layout's silent fallback.** `chartPage` drops to zoom 0.7 without a word, so both builder rounds missed
  it.
  - Have the role return `sizing.mode`, and have `ws-detailed-lesson` print a FAIL whenever the fallback fires. The
    builder would then see it at build time, not the critic.
- **One render, many reads.** The pool JSON already lists every Step 1 fact. A one-line family fold over that list
  (D2) took a minute and found what 28 PNGs hide.
  - Put that fold in `--repeats`, so the next lane's builder runs it.
