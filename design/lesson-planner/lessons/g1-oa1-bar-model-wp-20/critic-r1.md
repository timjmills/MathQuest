# Detailed lesson 2 (g1-oa1-bar-model-wp-20): independent critic, round 1

Critic: Opus, medium effort, 2026-10-16. I graded it cold at commit `43f9483d`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. The pack is `design/lesson-samples/detailed/g1-oa1-bar-model-wp-20/`
(23 PNGs, seed 4242).

What I checked:
- I read all 23 PNGs.
- I worked out every item, every key answer and every number a script quotes by hand.
- I read the lesson file, `barModel` / `barLayout` in `cells/word-work.js`, and RESEARCH.md.
- I re-ran the gate (`ws-detailed-lesson.cjs --check`, one browser). It gives 37 / 37 again and prints `ws-detailed-lesson: OK`.

## Verdict: FAIL (18 of 23 pages have a criterion below 8; 5 pass: T1, P0, P1 and their two keys)

Lowest score per criterion: **C1 6 · C2 6 · C3 7 · C4 7**.

What is right:
- The maths is clean. Every sum is ≤ 20, and every key and every quoted number is correct.
- The four-panel anchor chart fills the bar one step at a time, with the newest mark in grey.
- The chant and the Steps strip are consistent on every page.
- The check question's distractors are the three real misconceptions.
- T6 "Wrong answers" are worked from the dealt exit slip.
- The frame, ink and font are clean.

What fails:
- **The bar's writing boxes are too small to write in.** These are the boxes for the Critical Atom ("write the parts in the bar").
- **The numbers are easier than the research planned**, and the named edge cases are missing.
- **"Add to" is never modelled.**
- **Several teacher lines quote nothing, or quote the wrong thing.**

## The builder's compromises, judged

| Compromise | Ruling |
|---|---|
| P3 has 2 Guided cells and no Independent cells (Practice 1 has them) | **Acceptable.** The page is 94 % full: vocabulary, two tall bar cells and Steps. The fade from ★ to ★★ happens across P3 → P4. But the references to it are stale: T2b says P3 is scored by "Independent cells", and T6 prints an empty "P3 Independent ★★" row (D4). |
| Exit-slip part boxes about 7 mm wide | **Not acceptable.** See D1. A Grade 1 pupil cannot write "16" in a 7 × 7 mm box. |
| The P5 Workspace has no instruction string | **Acceptable.** The band label "Workspace:" plus RCDWS "Draw it." is enough. Nit: RP-80 asks for a rounded "Draw" box of at least 60 × 30 mm. The square band is bigger, so this is cosmetic. |
| The count-slip error is described in words on T2 | **Acceptable as wording, but no item catches it** (D2c). |

## Scores (0–10; PASS = every criterion ≥ 8)

| # | Page | C1 | C2 | C3 | C4 | Pass | Defects |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 8 | 9 | 9 | PASS | n1 |
| 02 | T2 Atomisation | 8 | 7 | 8 | 8 | FAIL | D2c, D7 |
| 03 | T2b Reference key | 8 | 7 | 8 | 8 | FAIL | D4, D7 |
| 04 | T3 Sections 1–4 | 7 | 8 | 8 | 9 | FAIL | D5, n2 |
| 05 | T4 Sections 5–6 | 8 | 7 | 9 | 9 | FAIL | D3, D6 |
| 06 | T5 Sections 7–10 | 8 | 7 | 8 | 9 | FAIL | D2, D8b |
| 07 | P0 Prerequisite | 9 | 9 | 8 | 9 | PASS | — |
| 08 | P1 Number sense | 9 | 8 | 9 | 9 | PASS | — |
| 09 | P2 Anchor chart | 8 | 7 | 9 | 9 | FAIL | D2a, D3, D7 |
| 10 | P3 Lesson 1 | 7 | 8 | 8 | 8 | FAIL | D1, D9 |
| 11 | P4-1 Practice 1 | 7 | 7 | 8 | 7 | FAIL | D1, D2b, D10 |
| 12 | P4m-1 Mixed 1 | 7 | 8 | 8 | 8 | FAIL | D1 |
| 13 | P5 Word problem | 8 | 6 | 8 | 8 | FAIL | D2a, D8 |
| 14 | P6 Exit slip | 6 | 7 | 7 | 8 | FAIL | D1, D2, D11 |
| 15 | P0 key | 9 | 9 | 8 | 9 | PASS | — |
| 16 | P1 key | 9 | 8 | 9 | 9 | PASS | — |
| 17 | P2 key | 8 | 7 | 9 | 9 | FAIL | as P2 |
| 18 | P3 key | 7 | 8 | 8 | 8 | FAIL | as P3 |
| 19 | P4-1 key | 7 | 7 | 8 | 7 | FAIL | as P4-1 |
| 20 | P4m-1 key | 7 | 8 | 8 | 8 | FAIL | as P4m-1 |
| 21 | P5 key | 8 | 6 | 8 | 8 | FAIL | as P5 |
| 22 | P6 key | 6 | 7 | 7 | 8 | FAIL | as P6 |
| 23 | T6 Answer key | 8 | 7 | 8 | 9 | FAIL | D4, D7, D2c |


## Defects (every score below 8)

**D1. The bar's writing boxes are below the slot minimum.** C1 · P3, P4-1, P4m-1, P6 and their keys · rules SL-4, RP-70, table 11.2, RUBRIC C1 "Writing room".
- What is wrong:
  - `barModel()` draws every label box 7 mm tall, and each bar segment 11 mm tall.
  - At size L the contract asks for a writing height Hw of 10 mm and bars 14 mm tall (min length 42 mm).
  - The box width is `min(16, mp − 3)`. That is about 11 mm on P3 and P4, and 7.2 mm on the exit slip, whose bar is 34 mm long.
  - The key writes its digits there at about 14 pt, against the 28 pt working digit size.
  - So the Critical-Atom step (step 2, "Write the parts in the bar") is written in the smallest boxes on the page.
  - On P6, b, c and d need "16", "11" and "10" in 7 × 7 mm boxes.
  - E8 passes only because it does not measure these boxes.
- Fix:
  - For `layout: 'bar'`, draw the bar segments 14 mm tall at L, and make the label boxes Hw 10 mm × B(2), with digits at `digitPt`.
  - Keep each bar at least 42 mm long.
  - On the exit slip, use 3 items per half in one column (full-width bars), or two items a row with the answer box under the bar so the bar can take the whole cell width.
  - Add a lint row: every `data-ws-slot="bar"` must have height ≥ Hw.

**D2. The numbers are easier than the band and the research, and the named edge cases are missing.** C2 · P2, P4-1, P5, P6, T5 · rules RUBRIC C2 ("include the edge cases the research names", "not one trivially easy item"), RESEARCH §5/§E.
- a. **Wholes below the band where the research chose crossing-ten items:**

  | Page | Pack | Research |
  |---|---|---|
  | Anchor chart (P2) | 5 + 10 = 15 | 6 + 7 = 13. It says "avoid parts of 10 … 10 + n as the I Do (too easy)". |
  | Check Question (T5 §7) | 4 + 5 = 9 | 9 + 4 = 13 |
  | P5 Word problem | 1 + 4 = 5 | 5 + 9 = 14 |
  | Exit slip a | 4 + 2 = 6 | — |

  - Across 15 story items, only 7 + 6, 6 + 14 and 9 + 11 combine across ten.
  - A part of 1 appears four times (P4 a 1 + 19, P4 d 1 + 17, P6 b 1 + 16, P5 1 + 4).
- b. **The ★★★ row is not the edge cases.**
  - `edgeTest: 'bigSecond'` makes the last row 4 + 11 and 5 + 11. These are ordinary items, and they are near twins (+11, wholes 15 and 16).
  - The real edges (a part of 1, a whole of exactly 20) sit in row 1 (a: 1 + 19 = 20).
  - "Small part first" is also true of a and d. So T5 §8 Watch ("The last row has the small part first. Walk there first.") does not single out the last row.
  - Equal parts (7 + 7 or 8 + 8; the EE .b turn-around/same-length case in the research) is on no pupil page.
- c. **The count-slip mistake is caught by nothing.**
  - Exit d is labelled "a whole past 10 … detects count slip past 10", but it dealt 2 + 10 = 12. That needs no counting on.
  - T2 "Count slip past 10" has an empty "Caught by" cell, and T6 has no row for it.
- Fix:
  - Pin the chart pair to (6, 7), the check question to 9 + 4, and P5 to a pair whose whole is 11–19 and crosses ten.
  - Give the exit slip and P5 `minNum: 11` on the whole, with no part of 10.
  - Allow at most one part of 1 per page.
  - Make the ★★★ row two of: equal parts, whole = 20, a part of 1. Point T5 §8 Watch at that.
  - Exit d should bridge ten (e.g. 8 + 5, or 9 + 7). Add its count-slip wrong answer (whole − 1) to T2 "Caught by" and to the T6 wrong-answers table.

**D3. "Add to" (gets more … now) is never modelled.** C2 · P2, T4 · rules PEDAGOGY P-1 (model each new thing before practice), RESEARCH §E ("Another example 2: add to").
- What is wrong:
  - All four chart panels use one put-together story ("Omar has … Kofi has … in all?").
  - The first add-to story ("Mia gets 14 more beads … now?") arrives in Guided cell 1. No script line says that "gets more" is the second part and "now" asks for the whole.
  - Atom 7 ("'In all' and 'now' ask for the whole") is never taught on T4.
- Fix:
  - Add a T4 §5 row with an add-to board example: "Kim has 12. Kim gets 3 more. The 3 more is a part. 'Now' asks for the whole."
  - Or add an "Another example" band to P2.
  - Also add a T4 §6 note on cell 1: "'Gets more' is a part."

**D4. The P3 compromise is not carried through the teacher pages.** C2 · T2b, T6.
- What is wrong:
  - T2b "Pages and order" scores P3 "Independent cells". There are none.
  - T6 "Answers at a glance" prints a "P3 Independent ★★" row with no answers.
- Fix:
  - Score P3 "Guided: not scored" on T2b.
  - Drop the empty T6 row, or have the role omit glance rows for sections with no items.

**D5. T3 §3 Spaced retrieval quotes the expected answers but not the questions.** C1 · T3.
- What is wrong:
  - The rows read "Write the whole: the bond on the board. Expected: 9" and "Solve the fact on the board. Expected: 18".
  - The teacher is told to "write each question on the board", but is never told which bond or fact to write.
  - Lesson 1 quoted the dealt text (`{ret.0.text}`).
- Fix: make `ask` read the dealt item, e.g. "Write the whole: {ret.0.text}" → "4 and 5 make __", and "{ret.1.text}" → "9 + 9 = __".

**D6. The T4 §5 Watch tells the teacher to model the error, but no row does it.** C2 · T4.
- What is wrong:
  - The Watch box says "Model it wrong once, say 'Wrong', fix it."
  - None of the 10 rows says when to do it, or what to write.
- Fix: after row 6, add: "Do: write 15 in a lower box. Say: 'Wrong. 15 is the whole. The whole goes on top.' Move it."

**D7. Step 4 asks for a label that no pupil writes.** C2 · P2, T2, T2b, T6 (and the Steps strip on P3, P4 and P4m).
- What is wrong:
  - Every bar cell prints the label word ("marbles", "crayons") under the answer box. So "Write the whole and the label" sends pupils to look for a place to write a word.
  - T2b lists "P5: the answer, then its label word", but P5 prints "marbles" too.
  - T6 accepts "the label word is the story noun" and "a story answer [needs a label word]" for responses that do not exist.
  - The research planned a label bank. The build pre-prints the label instead, which is fine for writing load, but the strings were not changed to match.
- Fix:
  - Change step 4 to "Write the whole in the answer box." Change the chart caption to "Write 15. Read: 15 marbles."
  - Drop the label clauses from T2b and T6.
  - Or bring back a graded label line.

**D8. P5 does not test this lesson's decisions.** C2 · P5, T5 §9.
- a. The story is 1 + 4 = 5 (see D2a), and it reuses the check question's frame (Tom/Sam, marbles; the check question is Tom 4, Sam 5 marbles).
- b. The equation frame pre-prints the "+" (□ + □ = □). That gives away step 3 ("The whole is missing. Add.") and makes "Wrong sign" impossible on P5.
  - The answer is also written three times: the story line, the equation, and the Say blank.
- c. T5 §9 quotes no expected answer at all. E29 passes because there is nothing to compare.
- Fix:
  - Deal a crossing-ten story with new names.
  - Use □ ○ □ = □, with the sign written by the pupil (the kit's sign row).
  - Add "Expected: {wp.a} + {wp.b} = {wp.ans} {wp.unit}" to §9.

**D9. The vocabulary pictures cannot be told apart.** C1 · P3 (T1 nit).
- What is wrong:
  - The "part" and "whole" pictures differ from the plain "bar" picture only by a 1.5 pt instead of a 0.75 pt outline on one row.
  - For an ELL matching task the cue is too faint, and the "bar" picture is the same drawing with no mark.
- Fix:
  - Mark the named box with the one grey fill, or with a bracket or arrow (0.75 pt).
  - For "bar", outline the whole two-row figure.

**D10. The strand tab is not the same on every page.** C4 · P4-1 and P4-1 key.
- What is wrong: these two tabs read "Level 1 · Addition", while the other 21 pages read "Level 1 · Operations".
- Fix: the practice role should take the lesson's `strand`, not the skill's category.

**D11. The exit-slip cells are cramped.** C3 · P6 and P6 key.
- What is wrong:
  - Story a runs to 5 lines and breaks a sentence ("Kofi gets 2 more / crayons."). That breaks SF-50 (at most 4 lines) and AX-3 (one sentence per line).
  - The "a." label touches the first line.
  - Cell free area is 35 %, against the 40 % bar. It is waived only as a "reading cell".
- Fix: this is solved together with D1 (3 items per half, full width).

## Ruling needed (not scored)

- **R1. Bar proportions.**
  - Contract RP-72 / L-LEAK says bar lengths are schematic and "never encode the actual numbers". This pack draws them to scale, as the brief asked.
  - But the 14 mm clamp makes 1 | 19, 1 | 17, 2 | 11 and 6 | 14 identical (P4 a ≡ P3 cell 1 ≡ P3 cell 2). So the bars are neither schematic nor to scale.
  - Either rule an exception to RP-72 for whole-unknown part-whole bars (the whole bar is always full width, so no answer leaks), and size the minimum part from the label box, not 30 %.
  - Or revert to fixed schematic halves.
- **R2. EE codes.** The owner list names M.EE.1.OA.1.a / .b, and the repo holds only M.EE.1.OA.1. Noted, not failed (as briefed).

## Nits

- n1: T1 vocabulary has the same faint mark issue as D9 (teacher-facing, so not scored down).
- n2: T3 §2 "Band A: 11 · > · 37 · 6" skips item 3 (2 tens 4 ones).
- n3: P3 Guided cell 2 says "the circles show the two parts" only for cell 1. The fade is right, but research planned a grey trace of the parts, not circles. Either is fine.
- n4: The bar label slots are `data-ws-graded="0"`. Since step 2 is the Critical Atom, consider grading the parts on the exit slip (the sort uses them anyway).
- n5: P0 c and d are both near-trivial bonds (4 + 1, 1 + 7). One of them could be a teen bond (10 + 3).
- n6: The names repeat in a tight loop: Tom/Sam/marbles appear on T5 §7, P5, P6 b and P4 d; Kofi on P2, P3 and P6.
- n7: The gate's E24b treats `bigSecond` as an edge case. It should test the lesson's real edge list (D2b), or it will keep passing a non-edge last row.
