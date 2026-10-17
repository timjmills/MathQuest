# Detailed lesson 3a (g3-oa5-mult-properties): independent critic, round 1

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `c6a1ede0`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I graded the committed pack. The working-tree edit to `print-sheet.js`
belongs to another agent and was not graded. Pack: `design/lesson-samples/detailed/g3-oa5-mult-properties/` (23 PNGs,
seed 4242, SELF-CHECK 42 / 42).

What I checked:
- I read all 23 PNGs.
- I re-multiplied every fact, product, key, and every T2 / T6 wrong-answer row.
- I counted the rows and columns of every drawn array and its turn. All are drawn correctly:
  - chart: 4 rows of 2 turned to 2 rows of 4;
  - Guided: 4 × 3 turned to 3 rows of 4, and 4 × 5 turned to 5 rows of 4;
  - P4-1: 2 × 5 turned to 5 rows of 2, 3 × 3, 4 × 4, and 5 × 3 turned to 3 rows of 5;
  - exit: 2 × 3 turned to 3 rows of 2;
  - P0: f is 3 rows of 5 and g is 2 rows of 4.
- I read the item pool in `pack.html` and the lesson file.

## Verdict: FAIL (12 of 23 pages have a criterion below 8)

Lowest score per criterion: **C1 7 · C2 6 · C3 8 · C4 9.**

The frame, the ink, the type and the keys are clean. Every answer on every key is right, and the chart's fade (grey newest,
traced 8) is correct. The pack fails on what it teaches and assesses:
- squares used where they cannot show a turn;
- a response format that is never modelled;
- the Critical Atom missing from every pupil page;
- a word problem that does not use the property;
- prerequisite facts that return on Practice 2.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | |
| T2 Teacher 2 | 9 | **7** | 9 | 9 | D7 |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 9 | 9 | 9 | |
| T4 Teacher 4 | 9 | 8 | 9 | 9 | n2 |
| T5 Teacher 5 | 9 | 8 | 9 | 9 | n3 (D5 oral only) |
| P0 Prerequisite | 8 | 8 | 9 | 9 | n1 |
| P1 Number sense | 9 | 8 | 9 | 9 | n6 |
| P2 Anchor chart | 9 | 8 | 9 | 9 | D3 (Say covers it orally) |
| P3 Lesson 1 | 8 | **7** | 8 | 9 | D2, D3 |
| P4-1 Practice 1 | 8 | **6** | 8 | 9 | D1, D2 |
| P4-2 Practice 2 | 9 | **7** | 9 | 9 | D6 |
| P5 Word problem | **7** | **6** | 8 | 9 | D5 |
| P6 Exit slip | 8 | **6** | 9 | 9 | D4 |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 8 | 9 | 9 | |
| P3 key | 9 | **7** | 9 | 9 | D2, D3 (mirrors) |
| P4-1 key | 9 | **6** | 9 | 9 | D1 (mirrors) |
| P4-2 key | 9 | **7** | 9 | 9 | D6 (mirrors) |
| P5 key | 8 | **6** | 9 | 9 | D5 (mirrors) |
| P6 key | 9 | **6** | 9 | 9 | D4 (mirrors) |
| T6 Answer Key | 9 | **7** | 9 | 9 | D7 |

## Defects (each one causes a score below 8)

**D1. P4-1: half of Practice 1 is squares, and one is in row 1** (P-1, edge-last rule, T1's own tip).
- b is 3 × 3 and c is 4 × 4. A square "turns into itself", so in 2 of the 4 items the "new fact" is a copy of the old one.
  Only a (2 × 5) and d (5 × 3) actually practise the turn.
- b sits in row 1. That breaks three things:
  - T1's tip "No square… It waits for the last row";
  - the ★★★-last-row rule;
  - T6, which labels b ★★ ("rows 1–1: … 3, 3, 9").
- T5 §8's "Watch: the last row" names only 16 and 15, so the 9 in row 1 is unflagged.
- E24b passes because the edge test it applies to row 1 (`arrNoSmall`) does not exclude squares.
- **Fix:**
  - Row 1 must be two non-square arrays, each an unordered pair not used anywhere else in the pack. For example, keep
    2 × 5 and replace 3 × 3 with a fresh pair such as 3 × 5 or 2 × 7 once D6 frees them. Avoid 1-row arrays, which
    belong to 3b.
  - The last row keeps one square and one 5-row array.
  - Add the rule "a square only on the last row, at most one per page" to the edge test.

**D2. P3 → P4-1: two new things at once** (PEDAGOGY P-1, scaffold fade).
- The chart and Guided pre-print the turned factors ("2 × 4 = ☐", "3 × 4 = ☐"). The pupil writes only the product.
- Practice 1 switches to "☐ × ☐ = ☐": the pupil now writes the factor order. That is exactly where the no-swap error
  (T2 row 3, exit a) is made. It also drops the trace.
- Writing the swapped factors is never modelled or guided.
- **Fix:** Guided cell 2 uses the "☐ × ☐ = ☐" response, with the first factor traced. Or chart panel 4 shows the turned
  fact being written into boxes. Then Practice 1 changes only the fade.

**D3. P2 / P3: the Critical Atom is not on any pupil page** (V22 routine panel and Steps rules).
- T2 lists 5 routine steps. Step 5, "Check: same product. No recount.", is the Critical Atom (🔑). T2b's step icons show 5.
- The chart has 4 panels, and the P3 Steps panel lists 4 rows. Step 5 survives only as the chart's Say line and the
  teacher's oral "Did a dot move away?".
- The pupil working Practice 1 alone (★★) has no written reminder of the one step the lesson exists for.
- The P3 Steps column has about 40 % free height, so "no space" (the builder's compromise 4) does not hold.
- **Fix:** add step 5 ("Check: same product." with the check icon) to the Steps panel. Either give the chart a fifth mark
  (the Say band labelled ⑤ / check icon) or fold it into panel 4's header ("…= 8. Same product.").

**D4. P6: the exit slip cannot measure the property** (assessment validity; nothing given away).
- c is 6 × 6 = 36, "6 × ☐ = 36". For a square, any position-copying strategy gives 6. It cannot tell the property from a
  copy, and its catch (36, product as a factor) is a box-map error, not a commutativity error.
- a has the turned array drawn, so counting 3 rows of 2 gets it without the property. T6 itself accepts a recount on
  Practice 1.
- That leaves b as the only item testing the Critical Atom. The Say band directly under it reads "3 times 9 equals
  9 times 3", which states b's answer relation on an assessment.
- **Fix:**
  - c becomes a non-square missing factor with distinct factors (e.g. 7 × 4 = 28, 4 × ☐ = 28). Keep the square for
    Practice only.
  - The exit Say frame becomes generic ("___ times ___ equals ___ times ___") or uses the numbers of a, which is shown
    with a picture.
  - Consider dropping the turned drawing on a (show only the first array), so a tests "write the new fact" from the
    known fact.

**D5. P5: the word problem does not use the lesson's skill, and its numbers are unsupported** (SC contract, LR rows of
≤ 5, prerequisite chain).
- The story asks only for the total of 6 rows of 7, with one "☐ × ☐ = ☐" line. A pupil who never heard of turning
  scores 1 / 1. "Say both facts" is in T5 §9 only, not on the page.
- 6 × 7 = 42 needs a 7s fact that the prerequisite never checks (P0 checks 2s and 5s only).
- "Draw it" means 42 eggs in rows of 7, while the pack keeps every array at rows of ≤ 5 (E27).
- **Fix:** keep the arrays ≤ 5 × 5 and make the turn the question. Example: "A tray has 3 rows of 5 cakes. Sam turns the
  tray. Now there are 5 rows. How many cakes in each row? How many cakes in all?" Give it two equation lines (fact and
  turned fact) and a Say frame that holds both facts. Or give the first fact and ask for the turned one.

**D6. P4-2 (with P0): prerequisite items return on Practice 2** (LR-5; gate bug).
- Two items are identical repeats: P0 d 2 × 8 = 16 is P4-2 a, and P0 e 2 × 6 = 12 is P4-2 g.
- P0 c (2 × 9) returns turned as P4-2 c (9 × 2, missing 9).
- P0 f's 3 rows of 5 is P4-1 d's turned array.
- P0 g's 2 rows of 4 is the chart's turned array (it comes before the chart, so this one is only a nit).
- Pupils saw P0's answers marked about 20 minutes earlier.
- E24 passes for a reason that is visible in the `pack.html` pool. The prerequisite items are keyed "2×8", "2×6" (the
  multiplication sign), and the lesson items are keyed "2x8", "2x6" (letter x). The keys never collide, and the pool has
  no unordered-pair test.
- **Ruling on LR-5 for this lesson:**
  - Inside one item, a pair and its turn is the content and is allowed.
  - Across items, an item is the unordered pair {a, b}. A pair, or its turn, may appear only once in the pack, and the
    chart's {2, 4} never again.
- **Fix:**
  - Normalise the pool key to the sorted pair, e.g. `2x8` → `{2,8}`.
  - Re-deal P0 b–e on facts not used later, or keep Practice 2 off P0's factors.
  - Add the unordered-pair test to E24.

**D7. T2 / T6: the prerequisite atoms do not match their items** (teacher routing correctness).
- Atom 1 "Count by 2, 5, 10" is checked by a, which counts by 5 only.
- Atom 2 "× means groups of / rows of" is checked by b–e, which are vertical 2 × n recall facts. They test 2s recall, not
  the meaning of ×.
- The T6 routing then sends a miss on b–e to "3.OA.A.1 Equal groups", which is the wrong reteach for a pupil who
  cannot recall 2 × 9.
- P0's instruction says "Write the groups…" but the frame says "rows of", which compounds this.
- **Fix:** either
  - re-word the atoms to what is tested ("Count by 5"; "Recall × 2 facts" → route 2.OA.C.4 / 3.OA.C.7); or
  - change b–e to "groups of" items (e.g. a picture of 3 groups of 4 with "☐ groups of ☐"), and set the P0 instruction
    to "Write the rows, the number in each row and the total."

## Nits (do not by themselves block)

- n1. P0's instruction says "groups", and the cell says "rows of" (see D7).
- n2. T4 / T5: every I Do and We Do example starts with 4 (chart 4 × 2, Guided 4 × 3 and 4 × 5, Check Question 4 × 8). A
  pupil can take the property to be "about 4". Vary the first factor.
- n3. T5 §7 option A is "Recounts: a new product" on a board fact with no dots. With no picture, 28 is a mis-recall, not
  a recount. Name it "a new product".
- n4. T6 "P4-1 Practice, rows 1–1" reads oddly. Say "row 1".
- n5. P4-1 and the exit say "Turn the array." when the turn is already drawn. "Look at the turned array. Write the new
  fact." is truer. (The chart's panel 3 has the same wording, so this is consistent, but it misleads.)
- n6. P1 Number sense is Grade 1–2 work (10 more or less, 1 more, 2-digit place value). It is acceptable as warm-up, but
  Band B could reach 3-digit numbers for Grade 3.
- n7. T6 row "3, 6, 6 (a) Product as a factor" is an improbable error. "6, 2, 3" or "3 × 2 = 5 (counting slip)" would
  be more diagnostic.

## Judgements on the builder's stated compromises

1. **No Mixed page: accepted for 3a**, but not for the reason given. Practice 2 is facts-only, so a facts-only Mixed page
   would fit. It is optional in a first lesson on a property. Record it as a choice, not a capacity limit.
2. **× facts as spaced retrieval, not P1: accepted.** 5 × 5, 2 × 10 and 10 × 5 are sound retrieval, and P1 stays the
   generic number-sense band.
3. **Facts-only (abstract) items modelled on the T4 board plus the chart's Say line: accepted.** T4 rows 8–10 model both
   the known form (2 × 4) and the missing form (2 × ☐ = 8) explicitly. That covers Practice 2 and exit b / c.
4. **P3's "Same two numbers, same product" line not printed for space: rejected.** The Steps column has room, and the
   omission is the Critical Atom (D3).
5. **Practice 1 row 1 is 2 × 5 and 3 × 3:**
   - 2 × 5 is accepted. It is a good "5" item and a strong turn (a long row against a tall column).
   - 3 × 3 is rejected (D1).
6. **Prerequisite uses legacy `arrays_groups`: accepted for the drawing.** The arrays are correct and in rows of ≤ 5.
   The instruction wording ("groups" against "rows of") must be fixed (D7 / n1).

## To pass round 2

Fix D1–D7. Then re-run the self-check with E24 fixed:
- keys normalised to the sorted pair;
- the unordered-pair test added;
- the edge test that rejects a square before the last row.
