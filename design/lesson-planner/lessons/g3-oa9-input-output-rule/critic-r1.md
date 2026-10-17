# Detailed lesson 5 (g3-oa9-input-output-rule): independent critic, round 1

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `704f5894`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`, from the committed PNGs (23), `pack.html` and the lesson file. Pack:
`design/lesson-samples/detailed/g3-oa9-input-output-rule/` (seed 4242, SELF-CHECK 44 / 44).

What I checked:
- I read all 23 PNGs.
- I recomputed every In → Out row under its rule: chart, Guided, both Practice pages, the exit slip, the story, the Check
  Question, and every T2 / T6 wrong-answer row.
- For every "find the rule" table I checked that only one +, − or × rule fits all its rows. Every table passes.
- Every key is correct.
- I checked every Say band and script against the pupil pages.
- I read `js/modules/lessons/detailed/g3-oa9-input-output-rule.js`, lines 16, 44, 51–52 and 158, to find where the
  defects come from.

The EE code (M.EE.3.OA.8 here, M.EE.3.OA.9 on the owner's list) is recorded and not failed, as instructed.

## Verdict: FAIL (13 of 23 pages have a criterion below 8)

Lowest score per criterion: **C1 6 · C2 4 · C3 8 · C4 7.**

What is good:
- The frame, the ink and the type are clean.
- The keys are right.
- The chart teaches the method well: it reads the rows, tests them, writes the rule, and shows the wrong try "n + 2? ✗ row 2"
  before the right rule × 2.

What fails is the item pool:
- Practice and exit tables copy earlier tables, rows and rules, so the exit slip measures copying, not the skill.
- Practice 1 never practises the Critical Atom.
- Practice 2 brings in an unmodelled change.
- The word problem asks a different task in a different response format.
- T2 prints a raw template placeholder.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 8 | 9 | 9 | |
| T2 Teacher 2 | **7** | 8 | 9 | **7** | D5 |
| T2b Reference | 9 | 8 | 9 | 9 | n4 |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | |
| T4 Teacher 4 | 9 | **7** | 9 | 9 | D1 (Guided rules reused) |
| T5 Teacher 5 | 8 | **6** | 9 | 9 | D1 (Check = Guided 3), D2 (÷ "traps"), D3, D4 |
| P0 Prerequisite | 9 | 8 | 9 | 9 | n6 |
| P1 Number sense | 9 | 8 | 9 | 9 | |
| P2 Anchor chart | 8 | 8 | 9 | 9 | n1, n2 |
| P3 Lesson 1 | 8 | 8 | 8 | 9 | n3 |
| P4-1 Practice 1 | 8 | **4** | 9 | 9 | D1, D2 |
| P4-2 Practice 2 | **7** | **6** | 9 | 9 | D1, D2, D3 |
| P5 Word problem | **6** | **5** | 8 | 9 | D4 |
| P6 Exit slip | 8 | **4** | 8 | 9 | D1, D6 |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 8 | 9 | 9 | n1, n2 |
| P3 key | 9 | 8 | 9 | 9 | |
| P4-1 key | 9 | **4** | 9 | 9 | D1, D2 (mirrors) |
| P4-2 key | 9 | **6** | 9 | 9 | D1, D3 (mirrors) |
| P5 key | 8 | **5** | 9 | 9 | D4 (mirrors) |
| P6 key | 9 | **4** | 9 | 9 | D1, D6 (mirrors) |
| T6 Answer Key | 9 | **7** | 9 | 9 | D1, n5 |

## Defects (each one causes a score below 8)

**D1. The Practice and exit tables repeat earlier tables, rows and rules. The exit slip is not fresh.**
Rules broken: LR-5 / LR-6 (no repeats), "fresh exit items" (E36) and "the Check Question is not a lesson item".

| Page | Table | Repeats |
|---|---|---|
| P4-1 b | 13→6, 14→7, 15→8, 20→13, rule − 7 | It is **Guided cell 2** (13→6, 15→8, 20→13, − 7) with one row added. A pupil can copy the rule from the lesson sheet. |
| P4-1 a | rule + 8 | Same rule as Guided cell 1, and it repeats the row 8→16. Its row 1, 2→10, is Guided cell 3's row 1. |
| Check Question (T5 §7) | 1→5, 3→15, 4→20, rule × 5 | Rows 2–3 (3→15, 4→20) and the rule are **Guided cell 3**, which the class has just solved. |
| P6 exit a | 2→10, 3→11, 7→15, rule + 8 | Same rule and same row 1 as P4-1 a. That makes three + 8 tables, and 2→10 appears on four pages. |
| P6 exit b | 6→2, 8→4, 13→9, rule − 4 | Same rule as P4-1 d, and rows 8→4 and 13→9 are P4-1 d's rows. The whole table is also the T2 "Sign flipped" example. |
| P6 exit c | 5→25, 9→45, 10→50, rule × 5 | Same rule as P4-2 c, and rows 5→25 and 9→45 are P4-2 c's rows. It is the fourth × 5 table, after Guided 3, the Check Question and P4-2 c. |
| P5 story | 8→16 | Repeats Guided cell 1's 8→16 and P4-1 a's 8→16. |

- Every exit item can be answered by remembering a Practice table. The exit slip therefore cannot route anyone.
- E24 passed because it keys the pool on **numbers**. E36 passed because it is vacuous ("no + exit items").
- **Fix:**
  - Key the pool on the **(In, Out) pair** and on the **rule**. No pair may appear twice in the pack. No rule may appear
    twice across Guided, the Check Question, Practice and the exit slip. The chart's rules (+ 2, − 6, × 2) never return.
  - Deal the exit slip from rules that appear nowhere else, still one +, one − and one × with the trap.
  - Extend E24 / E36 to pairs and rules, so the gate fails on this pack.

**D2. Practice 1 never practises the Critical Atom. The "trap" rows on the Practice pages do not trap.**
Rules broken: T2 atoms 6–7, PEDAGOGY P-3 (practise what was modelled), and the ★★★-last-row rule.
- Line 51 of the lesson file deals Practice 1 with `ftRules: ['+','-']`, so P4-1 has **no × table**.
- The Critical Atom is "+ fails on row 2, try ×" (chart panel 6, Guided 3, Check Question, exit c). It is never exercised
  on Practice 1.
- P4-1's last-row "traps" do not trap under the taught method:
  - c is + 6, and its row 1 also fits × 2. A pupil following Step 2 ("bigger → try +") gets + 6 right without testing.
  - d is − 4, and its row 1 also fits "÷ 2". ÷ was never taught, so it is not a trap at all. T5 §8 still calls it one.
    P4-2 d (÷ 2) has the same problem.
- Every × table's row 1 fits some + rule (Out − In). So the real trap sits wherever a × table sits, including grid row 1:
  - P4-2 a (× 10, 2→20 fits + 18) is labelled ★★.
  - P4-1 a (+ 8, 2→10 fits × 5) is the mirror case.
- **Fix:**
  - Put one × table on each Practice page, on the last row, as its ★★★. Keep row 1 to + / − tables whose row 1 does not
    fit × 2 / × 5 / × 10.
  - Drop the "÷ 2" traps until ÷ rules are taught.
  - Make the edge test count "any × table" as the edge case.

**D3. Practice 2 brings in In numbers out of order, which no page models.**
Rule broken: PEDAGOGY P-1 (one new thing per step; modelled before practised).
- Every chart table and every Guided table lists the Ins in order. P4-2 shuffles them (2, 4, 1, 3; 8, 11, 2, 22; 40, 46,
  35, 41).
- At the same time the numbers jump past 20 (22, 35–46, Outs up to 45).
- T5 §8 expects the error this causes ("Look for the gap between Outs written as the rule"). The pack predicts the mistake
  but never models the case.
- **Fix:** add one out-of-order table to the chart (or as Guided cell 3) with its Say line, or keep the Ins in order on
  Practice 2. Pick one change for P4-2, not two.

**D4. The word problem is a different task in a different response format.**
Rules broken: P-1, PEDAGOGY 4 (the routine is the same as practised), AX-4.
- The pupils have only ever **found a rule** from a table. P5 asks them to:
  - (a) build the table from three sentences;
  - (b) **apply** the rule to a new In ("How many cars do 16 boxes make?", 16 × 2 = 32). No page models or practises this;
  - (c) answer in a new frame, ☐ ◯ ☐ = ☐, instead of the rule frame n ◯ ☐.
- "Draw it." has no modelled drawing.
- The story is implausible ("5 boxes make 10 cars").
- 16 × 2 is outside the × 2 facts the lesson checks.
- The Say band and its key ("The rule is × 2") show what the page should assess: the rule.
- **Fix:**
  - Ask "What is the rule?". The answer goes in the n ◯ ☐ frame, with an In / Out table the pupil fills from the story (or
    printed half-filled).
  - Use a context where the rule makes sense, such as tricycles → wheels or packs → pencils, with fresh pairs.
  - Leave applying the rule to a new In for the next lesson, or model it on the chart first.

**D5. T2 prints a raw template placeholder.**
Rules broken: frame / teacher fill, C4.
- "What students do", step 2, "Check it with" reads **"Prerequisite Check {pre.0.letters}, {pre.1.letters}"**.
- **Fix:** resolve the token (it should read "a–d, e–h"). Add a self-check that fails on any `{…}` left on a page.

**D6. The exit-slip Say band asks for a rule from one pair, against the lesson's own Critical Atom.**
Rule broken: T1 Watch, "One row is not enough".
- The band reads "In 6, out 11. The rule is ___." The key gives + 5, read off one row. That is the "One pair only" mistake
  the lesson is built to remove.
- It is the last thing the pupil says.
- **Fix:** use a frame such as "I tested every row. The rule is ___." or give the frame two rows (6 → 11, 9 → 14).

## Nits (no score below 8 on their own)

- **n1 (P2):** panel 1 says "Read row 1 across", but it boxes rows 1 *and* 2, and its caption reads both. Box row 1 only,
  or retitle the panel.
- **n2 (P2):** the chart Say uses "input / output". The pupil vocabulary is In / Out. For ELL pupils, use one pair of words.
- **n3 (P3):** T2b says "★ Guided: hints on, step 1 traced", but nothing on the Guided page is traced. Either trace cell 1's
  sign, or reword T2b. The machine picture drops on Practice; that is an acceptable hint fade.
- **n4 (T2b):** the answer-slot list shows the generic "a number after =" and "a part inside an expression" rows. Neither
  slot is on this lesson's pupil pages, except the story frame that D4 removes.
- **n5 (T6):** the exit slip is labelled ★★★ as a whole, but a and b are plain tables. P4-2 row 1 is labelled ★★ and holds
  a × 10 table (D2).
- **n6 (P0):** l. 2 × 11 sits outside the "×2, ×5, ×10 facts" it checks. The footer seed is 4343; every other page uses 4242.
- **n7 (T5 §7):** Check Question option B (+ 10) does not fit row 1. It is a weak distractor next to A, which does fit row 1.
  It is acceptable as the "gap between Outs" mistake.

## Judgements on the builder's stated weaknesses

- **Exit slip has 3 items (+, −, × trap):** the count and the mix are acceptable for a 4-minute slip, and the trap item c is
  right. The items are not fresh (D1).
- **Practice tables have 4 rows, no machine picture, 4 per page:** acceptable. A fourth row is a fair step up for
  independent practice, the machine is a hint that may fade, and 4 cells fill the page well (C3 9).
- **Check Question option B is the "+ gap between Outs" mistake:** acceptable (n7). The real problem is that the Check
  Question repeats Guided cell 3 (D1).
- **No Mixed page:** acceptable. No pupil page claims one, and E33 is not applicable.
- **Fixed story of our own:** a fixed story is fine. Its task and frame are not (D4).
