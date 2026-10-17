# Detailed lesson 5 (g3-oa9-input-output-rule): independent critic, round 3

Critic: Opus, medium effort, 2026-10-17. I graded the pack cold at commit `5502f0be`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I used the committed PNGs (23), `pack.html` and its pool JSON,
the HEAD diff of `js/modules/lessons/detailed/g3-oa9-input-output-rule.js`, `print-sheet.js`, `sheet/roles/lesson.js`,
`gen-function-table.js`, `skill-options.js` / `skill-option-keys.js` and `tests/scripts/ws-detailed-lesson.cjs`.
SELF-CHECK reads 47 / 47. The EE code M.EE.3.OA.8 is the repo's code. The owner's M.EE.3.OA.9 is recorded and not graded.

What I checked:
- I read every PNG.
- I recomputed every In → Out row under its rule: chart, Guided, P4-1, P4-2, story, exit, Check Question, the T2 board
  table and every T2 / T6 wrong-answer row.
- For every table I checked that exactly one taught rule (+ / − by 2–10, × 2 / 3 / 5 / 10) fits.
- I checked every key against its page and every script line and Say band against the page it names.

## Verdict: PASS

Lowest score per criterion: **C1 8 · C2 8 · C3 8 · C4 9.** No page has a criterion below 8.

Both round-2 blockers are closed:
- **D7:** the T6 P5 glance row prints only the rule, and E29 now checks it.
- **D8:** T4 names panels 5 and 6.

Every pupil table, key and teacher quotation is correct. Each rule is on at most two tables, and that count now includes
the board-only Check Question. The exit rules are fresh. The new × 3 factor is sound; my judgement is below. What remains
is nits.

## Round 2 status

| r2 | Status | Evidence |
|---|---|---|
| D7 T6 glance row printed "+ 5 · 38 + 5 = 43" | **Fixed** | T6 reads "P5 Word problem + 5 ★". `print-sheet.js` gives a `tableItem` story its rule only. The new E29 clause reads each number in that row against the P5 key's text. The stale lessons-file comment is corrected. |
| D8 T4 chart panels misnamed | **Fixed** | Watch box: "+ 9 on panel 6". Step 5: "Panel 5. The rule: − 9". Step 6: "Panel 6: the trap". These match the printed chart: panels 1–4 show + 8, panel 5 shows 26 → 17 (− 9) and panel 6 shows 9 → 18 (× 2). They come from `{panel.second}` / `{panel.third}`, so they cannot drift. The `why` text is corrected too. |
| n8 Exit rules repeated | **Fixed** | Exit a + 7, b − 8 and c × 5 appear on no other pupil table. − 8 is printed only as the T2 / T6 "Sign flipped" illustration of exit b itself. |
| n9 × 2 on three tables; E37 blind to the board | **Fixed** | The Check Question is now × 3 (2 → 6, 6 → 18, 7 → 21). E37 counts the `pool.board` key `ftrulex3:…`. Tally: × 2 chart + P4-2 d; × 3 CQ + P4-1 c; − 9 chart + P4-2 c; every other rule on one table. The T2 / T4 board table 9 → 18 / 19 → 38 / 23 → 46 is the chart's own panel 6, not a third table. |
| n10 T2 step 1 wording | **Fixed** | T2 step 1 is "Read rows 1 and 2 across.", the same as every pupil Steps band. |
| n10 Atom 8 not scripted | **Fixed (told, not shown)** | T4 §6 step 5: "If Out is 0, In is the number taken away." The note says the ★★★ rows have an Out of 0. See n15. |
| n11 "Caught by: Exit b · Practice 1" | **Mostly fixed** | Now "Exit b · Practice 1 and 2 − tables". Letters (P4-1 b, d; P4-2 b, c) would be quicker, but this is acceptable. |
| n13 P5 headed In (n) / Out, not Ben / Ann | **Open, accepted** | The cell has no header option. The T5 Ask "Ben is In, Ann is Out" links story and table. |
| n14 Exit a had Ins back to back | **Fixed** | 27, 33, 36. The new `ftSpread` case test enforces a gap of 2 or more. |
| n4 T2b generic slot rows | **Open (nit)** | "a number after =" and "a part inside an expression" still describe P1's slots only loosely. |
| n5 Exit ★★★ as a whole | **Open (nit)** | T6 "P6 Exit slip … ★★★". Only c is the trap; a and b are ★★. |
| n12 P0 has no bridge-through-ten item | **Open, accepted** | As in r2. |

## The × 3 judgement (ftFactors `2-3-5-10`; the Prerequisite Check gains × 3)

**Accepted.** The reasons:
- 3.OA.C.7 includes × 3, so the factor is grade-level.
- Adding it was the honest way to keep every × table fresh with no rule on three tables. × 10 had run out of fresh
  pairs, and × 2 was on three tables.
- The procedure taught does not change: the × table whose row 1 also fits + is modelled on chart panel 6 (× 2) and Guided
  3 (× 10). The factor is a prerequisite fact, so nothing unmodelled is practised.
- The plumbing is correct:
  - The new value is appended to `skill-options.js` with its own share token `F` (`any` A, `2-5-10` T). No existing code
    changes.
  - `gen-function-table.js` maps it.
  - `ftPlainFirst` now rejects a + table whose row 1 also fits × 3. I checked every + row 1 in the pack (8 → 10, 11 → 14,
    4 → 10, 4 → 9, 27 → 34, 21 → 29); none fits × 2, 3, 5 or 10.
- Matching the Prerequisite Check is correct: a factor the lesson deals must be a fact the Check routes on. T2 atom 3 and
  the T6 routing ("3.OA.C.7 Multiply by 2, 3, 5 and 10") now agree.

Two weaknesses, both nits:
- **n16:** the P0 Multiply band is lopsided (details under Nits).
- **n17:** P4-1 c's last row, 13 → 39, is a product beyond the facts (details under Nits).

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 8 | 9 | 9 | |
| T2 Teacher 2 | 9 | 9 | 9 | 9 | n11 |
| T2b Reference | 9 | 8 | 9 | 9 | n4 |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | n16 |
| T4 Teacher 4 | 9 | 8 | 9 | 9 | n15 |
| T5 Teacher 5 | 9 | 8 | 9 | 9 | |
| P0 Prerequisite | 9 | 8 | 9 | 9 | n16 |
| P1 Number sense | 9 | 8 | 9 | 9 | |
| P2 Anchor chart | 9 | 9 | 9 | 9 | |
| P3 Lesson 1 | 9 | 9 | 9 | 9 | |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | n17 |
| P4-2 Practice 2 | 9 | 9 | 9 | 9 | |
| P5 Word problem | 8 | 8 | 8 | 9 | n13 |
| P6 Exit slip | 9 | 9 | 8 | 9 | |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 9 | 9 | 9 | |
| P3 key | 9 | 9 | 9 | 9 | |
| P4-1 key | 9 | 8 | 9 | 9 | |
| P4-2 key | 9 | 9 | 9 | 9 | |
| P5 key | 9 | 8 | 9 | 9 | |
| P6 key | 9 | 9 | 9 | 9 | |
| T6 Answer Key | 9 | 8 | 9 | 9 | n5 |

## What I verified

**Tables and rules.**

| Table | Rows | Rule |
|---|---|---|
| Chart, step panels 1–4 | 21 → 29, 28 → 36, 42 → 50 | + 8 |
| Chart panel 5 | 26 → 17, 27 → 18, 42 → 33 | − 9 |
| Chart panel 6 | 9 → 18, 19 → 38, 23 → 46 | × 2 |
| Guided 1 | 4 → 10, 17 → 23, 34 → 40 | + 6 |
| Guided 2 | 24 → 21, 35 → 32, 38 → 35 | − 3 |
| Guided 3 | 2 → 20, 3 → 30, 5 → 50 | × 10 |
| P4-1 a | 8 → 10, 19 → 21, 26 → 28, 48 → 50 | + 2 |
| P4-1 b | 5 → 1, 23 → 19, 40 → 36, 50 → 46 | − 4 |
| P4-1 c | 3 → 9, 4 → 12, 8 → 24, 13 → 39 | × 3 |
| P4-1 d | 6 → 0, 31 → 25, 40 → 34, 46 → 40 | − 6 |
| P4-2 a | 11 → 14, 30 → 33, 35 → 38, 41 → 44 | + 3 |
| P4-2 b | 15 → 5, 23 → 13, 39 → 29, 47 → 37 | − 10 |
| P4-2 c | 9 → 0, 10 → 1, 16 → 7, 40 → 31 | − 9 |
| P4-2 d | 7 → 14, 10 → 20, 20 → 40, 24 → 48 | × 2 |
| Story | 4 → 9, 30 → 35, 37 → 42 | + 5 |
| Exit a | 27 → 34, 33 → 40, 36 → 43 | + 7 |
| Exit b | 34 → 26, 45 → 37, 48 → 40 | − 8 |
| Exit c | 2 → 10, 5 → 25, 6 → 30 | × 5 |
| Check Question | 2 → 6, 6 → 18, 7 → 21 | × 3 |

- Every row is right.
- Every × table's row 1 also fits a + rule that fails on row 2: + 9, + 18, + 6, + 7, + 8, + 4. That is the Critical
  Atom in every place it is meant to be.
- Each Practice last row is a × trap and a − table with an Out of 0.
- The Ins are in order everywhere.

**Keys.** Every pupil key matches its page. The Vocabulary key is correct: 4 → to In, → 7 to Out, 4 → + 3 → 7 to rule.
The P5 key's Say band reads "+ 5". The T3 P0 list and the T6 glance rows agree with the keys.

**Wrong-answer rows (T2, T6).** All are the true mistake value for their table:
- + 8 one-pair on exit c.
- + 6 and + 13 down-the-Out-column on exit a and Guided 1.
- + 8 and + 3 sign-flipped.
- + 18 one-pair on Guided 3.
- + 12 on the Check Question (18 − 6).
- + 26 on the story (35 − 9).
- Check Question A is + 4 (2 + 4 = 6, one pair) and B is + 12. Both are T2 mistakes.

**Say bands.** None gives an answer away:
- The chart Say quotes the chart's own worked example.
- P5 "I tested every row. The rule is ___." matches its key.
- The exit Say is generic.

**Frame and look.**
- The ©, the strand tab and the one I Can title are on all 23 pages.
- Ink is black, white and the single grey. The accent is only on step marks; the key colour only on answer marks.
- Andika, 28 pt working digits.
- Every page is well filled; the lowest is P3 at 89 %.

## Defects

None. No score is below 8.

## Nits (no score below 8 on their own)

- **n15 (T4 §6 step 5): atom 8 is told, not shown.**
  - "If Out is 0, In is the number taken away" is said with no Out-of-0 table in view.
  - Write one row on the board (for example 7 → 0, so − 7) as the line is said. The ★★★ rows then meet a seen case.
  - The same section asks "Cell 2: bigger or smaller?" (step 4) after pairs have already done cell 2 (step 3). Swap the
    two, or word step 4 as the check of the pairs' work.
- **n16 (P0 i–l, T2 atom 3): the × band does not test each factor on its own.**
  - The items are 2 × 10, 10 × 7, 5 × 10 and 3 × 7.
  - × 2 and × 5 are tested only with 10, and three of the four items are × 10 facts. A pupil who knows only × 10 and
    3 × 7 passes atom 3.
  - Deal one fact per constant, with a non-10 partner for × 2 and × 5, such as 2 × 8, 3 × 7, 5 × 6 and 10 × 4. This could
    be a per-item `constant` or a "one of each" test beside `factTen`.
- **n17 (P4-1 c): 13 → 39 is the one product past the facts on a pupil page.**
  - The chart and P4-2 already double teens and twenties (23 → 46, 24 → 48), and r1 and r2 accepted that. Tripling 13
    asks for tens-and-ones thinking that nothing in this lesson models.
  - It is the ★★★ row and rows 1–3 already fix × 3, so I accept it.
  - A cap of In ≤ 10 for × 3 and × 5 (or Out ≤ 30 for × 3) would remove it.
- **n18 (skill-options.js): the `ftFactors` comment and `help` text still name only "2, 5 and 10".** Mention the new
  value. This is cosmetic, and it is a teacher-facing string.
- **n4, n5, n11, n13** remain as in the status table.
