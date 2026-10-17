# Detailed lesson 2 (g1-oa1-bar-model-wp-20): independent critic, round 3

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `2e37b1ba`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons` (the committed pack; the working-tree edits of lesson 3a were not
graded). Pack: `design/lesson-samples/detailed/g1-oa1-bar-model-wp-20/` (23 PNGs, seed 4242, SELF-CHECK 42 / 42).

What I checked:
- I read all 23 PNGs.
- I re-added every item, key, T2 / T6 wrong-answer row and every number a teacher page quotes.
- I read the pool JSON in `pack.html`, the lesson file, and the E24 / E24b code in `tests/scripts/ws-detailed-lesson.cjs`
  against V22 Appendix E (lines 6795–6865).
- I enumerated the possible Practice deals by script to test the builder's near-twin claim.

## Verdict: FAIL (8 of 23 pages have a criterion below 8; 15 pass)

Lowest score per criterion: **C1 7 · C2 7 · C3 8 · C4 8.**

All five r2 defects are fixed:
- D1: the chart is put-together, the board example is add-to, and the T4 quotes match the chart.
- D2: no first addend twice in a row and no twin answers.
- D3: on Mixed the stories are 4 of the 7 items.
- D4: every story is 3 lines, one sentence per line, and the slip assesses both situations.
- D5: T2b prints "/2 a half".

The pack still fails on three new defects, and in each the gate passes what V22 forbids:
1. **D1.** Two items are an I Do example turned round. P4-1 c (5 + 7) is the chart's 7 + 5, and P5 (3 + 8) is the board's
   8 + 3. E24 passes them because the repo's port of the check leaves out V22's turn-around test.
2. **D2.** T5 §8 says "The Steps are at the top of the page", but Practice 1 has no Steps band.
3. **D3.** Exit b (4 + 8) cannot tell the wrong sign from a story number, because 8 − 4 = 4 is a story number. Exit a is a
   Practice item turned round.

## r2 defect status

| r2 | Status | Evidence at 2e37b1ba |
|---|---|---|
| D1 Put-together not modelled; T4 ≠ chart | **Fixed** | P2: "Ana has 7 stamps. Noor has 5 stamps. How many stamps in all?" T4 row 6 asks "How many stamps in all?" (the chart's own question). Row 7 writes an add-to story on the board (Noor 8 crayons, gets 3 more, "now"). Row 8: "Gets more: a part. Now: the whole." E31 is added. |
| D2 LR-6 on P4-1, P4m-1, P6 | **Fixed for the rows and answers. The near-twin part rests on a narrowed rule** (ruling below) | P4-1 first addends by row: 9 / 7 · 5 / 8 · 9 / 7. Mixed: 6 / 9 · 8 / 7 · 4 / 2 / 6. All answers on each page differ. Under V22's literal test, P4 a / d, b / c and b / d and Mixed a / c and a / d are still near twins, and so are P4 b / d and Mixed a / d under the builder's own rule once the parts are read in either order. |
| D3 Mixed ≥ half the lesson skill | **Fixed** | P4m-1 has 4 stories and 3 add facts. The take-away partner was dropped (`leadDrop`). E33 gives 4 of 7. |
| D4 Exit stories ≤ 4 lines, one sentence a line, both situations | **Fixed** | a "Yuki has 8 shells. Aya has 7 shells. How many shells in all?" (put together). b "Mia has 4 cards. Mia gets 8 more cards. How many cards now?" (add to). Both are 3 lines, with the story above the bar. |
| D5 T2b score | **Fixed** | T2b "P6 Exit slip /2 a half". P6 prints "/2", and E34 is added. |
| n1 Mixed unscripted | Fixed | T5 §8 row 4: "Early finishers: Mixed 1 … Mixed 1 answers: T6." |
| n2 Vocabulary 6 \| 7 → 13 | Fixed | 5 \| 9 → 14 (P0 g 9 + 5 is its turn-around in another representation: a nit). |
| n3 P5 asks for the whole three times | Fixed | Say: "I add the parts to find the whole." It has no blank. |
| n4 T2 "Caught by" form | Fixed | "top 9 · below 15 and 6" is Check Question A exactly. |
| n5 P0 bonds with a part of 1 | Fixed, weakly | c 2 and 7, d 2 and 3. Both have a part of 1 or more, but both share the part 2, and d is tiny. T3 §3's retrieval bond is still "1 + 7". |
| n6 Names | Accepted across pages (lead's ruling) | But Mia is on P4-1 c **and** f, with 7 each time ("Mia has 7 apples", "Mia has 7 crayons"). That breaks the "kept apart within a page" claim. Yuki + Aya make the put-together pair on P3 cell 2, Mixed d and exit a. |
| n7 Fade labels | Fixed | T6: P5 ★★, P6 ★★. |
| n8 T6 "now" | Fixed | "'Now' asks for the whole: point at the top box." |
| n9 Bar parts ungraded | Fixed on the exit slip | `EXIT_BAR.gradeParts`. |

## Builder decisions: judgements

### The + near-twin rule narrowed to "one number the same, the other within 2"

**Not acceptable as built. The idea behind it is acceptable.**

What V22 says:
- The prose (line 2983) is "two items whose numbers are each within 2 of the other's". Its examples are subtraction and
  compare position by position: 51 − 44 / 53 − 45.
- V22's own reference E24b (line 6800) applies the near-twin test **only to −**. For + it checks first addends only.
- So V22 does not require the both-within-2 test on single-digit addition. Read for single-digit +, a narrower "looks
  alike" rule is a fair reading of the intent.

The builder's premise is wrong. I enumerated Practice 1 by script under the lesson's own constraints:
- parts 3–9, crossing ten, rows 1–2 sums 11–17 with no doubles;
- last row fixed at 9 + 9 and 7 + 13;
- distinct answers, no turn-around on the page, distinct first addends per row, never three running;
- the chart, board, Guided and Check Question facts and their turn-arounds excluded.

Result: **V22's literal ordered both-within-2 rule leaves 40 valid deals**, for example
3 + 9, 6 + 5 / 6 + 8, 9 + 4 / 9 + 9, 7 + 13. The infeasibility appears only when the test is also applied to the
turned-round order (then 0 deals).

The narrowed rule is implemented position by position (`da === 0 && db <= 2`; ws-detailed-lesson.cjs:362). A bar's two
parts have no order, so it misses near twins that differ only by a swap:
- P4-1 b 7 + 8 / d 8 + 6: both contain 8; the others are 7 and 6.
- P4m-1 a 6 + 8 / d 7 + 6: both contain 6; the others are 8 and 7.

Both pairs are also near twins under V22's literal test.

**Ruling:** keep the narrowed rule for +, but apply it in **either order** of the parts. That still leaves 328 valid
Practice 1 deals. Alternatively, apply V22's literal ordered rule (40 deals). Either way, re-deal P4-1 and P4m-1. On its
own this is scored as a nit on Mixed, and it forms part of D1 on P4-1.

### Exit slip: 2 full-size items a half, one per situation

**Acceptable.** With the story above a full-size bar, a 132.5 mm half holds 2 items at working size. The lead's
full-size ruling outranks V22's four items. One item per situation assesses both situations.

The cost is that each item must be diagnostically clean, because a 1-of-2 result is the whole signal. That is exactly
where exit b fails (D3).

### P0 bonds starting with 2 (2 and 7, 2 and 3)

**Acceptable as a nit, not a fix.** Neither part is 1, so "one more" no longer answers them. But:
- both items share the part 2 in one row (the spirit of LR-6);
- 2 + 3 = 5 is close to subitising;
- RESEARCH planned "4 and 3".

Suggestion: `partMin: 3` or distinct parts (e.g. 4 and 3, 5 and 2).

### Names repeat across pages

**Acceptable** (lead's ruling), but the within-page claim is not met: Mia is on P4-1 c and f, with 7 both times (nit m3).

## Scores (0–10; PASS = every criterion ≥ 8)

| # | Page | C1 | C2 | C3 | C4 | Pass | Defects / nits |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 9 | 9 | 9 | PASS | — |
| 02 | T2 Atomisation | 9 | 8 | 8 | 9 | PASS | — |
| 03 | T2b Reference key | 9 | 8 | 8 | 9 | PASS | — |
| 04 | T3 Sections 1–4 | 9 | 8 | 8 | 9 | PASS | m2 |
| 05 | T4 Sections 5–6 | 9 | 8 | 9 | 9 | PASS | (board example: see D1) |
| 06 | T5 Sections 7–10 | 7 | 8 | 8 | 9 | **FAIL** | D2 |
| 07 | P0 Prerequisite | 9 | 8 | 8 | 9 | PASS | m2 |
| 08 | P1 Number sense | 9 | 8 | 9 | 9 | PASS | — |
| 09 | P2 Anchor chart | 9 | 8 | 9 | 9 | PASS | — |
| 10 | P3 Lesson 1 | 8 | 8 | 8 | 8 | PASS | — |
| 11 | P4-1 Practice 1 | 9 | 7 | 8 | 9 | **FAIL** | D1, m3 |
| 12 | P4m-1 Mixed 1 | 9 | 8 | 8 | 8 | PASS | m1 |
| 13 | P5 Word problem | 9 | 7 | 8 | 8 | **FAIL** | D1 |
| 14 | P6 Exit slip | 8 | 7 | 8 | 8 | **FAIL** | D3 |
| 15 | P0 key | 9 | 8 | 8 | 9 | PASS | — |
| 16 | P1 key | 9 | 8 | 9 | 9 | PASS | — |
| 17 | P2 key | 9 | 8 | 9 | 9 | PASS | — |
| 18 | P3 key | 8 | 8 | 8 | 8 | PASS | — |
| 19 | P4-1 key | 9 | 7 | 8 | 9 | **FAIL** | as P4-1 |
| 20 | P4m-1 key | 9 | 8 | 8 | 8 | PASS | — |
| 21 | P5 key | 9 | 7 | 8 | 8 | **FAIL** | as P5 |
| 22 | P6 key | 8 | 7 | 8 | 8 | **FAIL** | as P6 |
| 23 | T6 Answer key | 8 | 7 | 8 | 9 | **FAIL** | D3 |

Every key is correct (P0 20 · 17 · 9 · 5 · 11 · 12 · 14 · 15; P1 as T6; P3 16 · 17; P4-1 13 · 15 · 12 · 14 · 18 · 20;
P4m-1 14 · 12 · 17 · 13 · 8 · 11 · 9; P5 3 + 8 = 11; P6 15 · 12), so cap H1 does not apply. Every T2 / T5 / T6 quote I
checked is on the page it names, except D2.

## Defects (every score below 8)

**D1. Two I Do examples come back turned round on pupil pages, and E24 passes them.** C2 · P4-1 c, P5 and their keys ·
rule: V22 LR-5, lines 2979–2980 and 3005: "A chart example is never dealt turned round … it never returns, in any
representation, on any page, and neither does its turn-around."

What is wrong:
- **P4-1 c** "Leo has 5 apples. Mia has 7 apples. How many apples in all?" is the anchor chart turned round: "Ana has 7
  stamps. Noor has 5 stamps. How many stamps in all?" It has the same frame, the same parts and the whole 12. The chart
  is on the wall during Practice, so item c has its answer on display.
- **P5** "Kofi has 3 pencils. Kofi gets 8 more pencils." is the T4 board example turned round: "Noor has 8 crayons. Noor
  gets 3 more crayons", with parts 8 + 3 and whole 11 spoken in row 8. The pack's own pool registers 8 + 3 as a **P2**
  place. So the lesson's one transfer item, the first bar a pupil draws alone, was solved in front of them 30 minutes
  earlier.
- **Gate:** `ws-detailed-lesson.cjs:220` builds the chart set from the P2 items only. V22's reference (line 6851) adds
  `turn(x.item)`. The port dropped the turn-around, so SELF-CHECK says "chart examples returning 0". This is the same
  false-pass class as r1 n7 and r2 D2.
- **Also:** the pool's `forbidden` is `[]`. It should list 5 + 7 and 3 + 8 (and the third P2 place, 7 + 7, which is
  dealt but printed nowhere: m4).
- **Near twins:** P4-1 b 7 + 8 / d 8 + 6 is a near twin by the builder's own rule read in either order, and so is a / d
  9 + 4 / 8 + 6 by V22's literal rule (see the ruling).

Fix:
- Put the chart, board and `third` examples' turn-arounds into `forbidden`.
- Restore `turn()` in E24, so the gate fails this tree.
- Apply the + near-twin test in either order of the parts.
- Re-deal P4-1 rows 1–2 and P5. For example, P4-1: 3 + 9, 6 + 5 / 6 + 8, 9 + 4 (P5 3 + 8 is then free to move), and P5
  a crossing-ten add-to story not on any page, e.g. 4 + 9.

**D2. T5 §8 tells the teacher "The Steps are at the top of the page." Practice 1 has no Steps band.** C1 · T5 · rule:
RUBRIC C1 (a teacher can run the page as printed); E29 / E35 spirit (a script line must be true of the page it names).

What is wrong:
- P4-1 (page 11, and the T5 thumbnail) goes straight from the instruction line to the grid. Only P4m-1 carries the Steps
  strip.
- The line is hard-typed at `g1-oa1-bar-model-wp-20.js:264`, so no gate reads it.
- A teacher sending pupils to "the Steps at the top" finds nothing at the very point of the lesson where hints are taken
  away.

Fix: one of:
- Change the line to "Pupils do Practice 1. The Steps are on the anchor chart." (★★: hints off).
- Or give P4-1 the same Steps strip as P4m-1 (then explain why Mixed and Practice match).

Then extend E35 to check a "Steps are at the top" claim against the page it names.

**D3. Exit b cannot tell "wrong sign" from "story number as answer", and exit a is a Practice item turned round.** C2 ·
P6, P6 key, T6 · rules: RUBRIC C2 (the exit slip separates the lesson's named mistakes; T2 Common mistakes); V22 line
3006 ("The exit slip takes items not on Practice in the same representation, using a turn-around … when the pool is
spent").

What is wrong:
- **Exit b is 4 + 8, and 8 − 4 = 4 is the first story number.** A pupil who writes 4 on top may have subtracted or may
  have copied a story number.
- T6 labels that answer as one mistake only: "top 4 · below 4 and 8 (b) → Wrong sign". The next step it gives ("'Now'
  asks for the whole") is not the remedy for the other mistake ("Count both cube trains together").
- With 2 items a half, one item that cannot separate the mistakes halves the slip's diagnostic value.
- **Exit a is 8 + 7.** "Yuki has 8 shells. Aya has 7 shells. How many in all?" is P4-1 b turned round ("Tom has 7
  stickers. Sam has 8 stickers. How many in all?"): the same frame and the same whole 15. The pool is not spent.
- It is also P3 Guided cell 2 with each number one less, under the same names (Yuki 9 / Aya 8 → Yuki 8 / Aya 7).

Fix: deal exit items that are fresh, on no page and not a turn-around of any page item, with no part equal to the
difference of the parts (`a ≠ 2b`, `b ≠ 2a`).
- For example, on today's deal: a put-together 5 + 8 (8 − 5 = 3, which is not a part; no page has 5 + 8 or 8 + 5).
- Choose b after the D1 re-deal, under the same two tests.
- Then T6's wrong-sign row reads a number that names only that mistake.

Add a gate check that no exit item has `|a − b| ∈ {a, b}`.

## Nits (no score below 8)

- **m1.** Mixed c 8 + 9 is P3 Guided 9 + 8 turned round, in the same put-together frame. Mixed a 6 + 8 / d 7 + 6 is a
  near twin in either order (see the ruling). Both clear with the D1 re-deal.
- **m2.** P0 c and d share the part 2 (2 and 7, 2 and 3), and d is 5. T3 §3's retrieval bond is "1 + 7", a part of 1:
  the r2 n5 class again on the board. Use 4 + 3 or 5 + 3.
- **m3.** Mia is on P4-1 c ("Mia has 7 apples") and f ("Mia has 7 crayons"): the same name and the same number on one
  page. Yuki + Aya are the put-together pair three times (P3, Mixed d, exit a).
- **m4.** The `third` example (7 + 7, "Equal parts? Still add the parts.") is placed on P2 in the pool but printed on no
  page and quoted by no script. Either model it (the ★★★ equal-parts row is otherwise unmodelled, along with the part of
  13 in 7 + 13), or drop the place.
- **m5.** The exit cells start the story about 1 mm under the "a." / "b." label. A 2–3 mm top pad would match the other
  pages.
- **m6.** The vocabulary picture 5 | 9 → 14 is P0 g (9 + 5) turned round. It is harmless (another representation), but
  a whole not dealt elsewhere (e.g. 6 | 10 → 16) avoids it.
- **m7.** The pool is a `list` of the dealt items, so "usable pool 39, places 39" is true by construction. Declaring the
  real rule (`{"op":"+","partMin":3,"crossTen":true,"maxSum":20}`) would let E24 measure something.
