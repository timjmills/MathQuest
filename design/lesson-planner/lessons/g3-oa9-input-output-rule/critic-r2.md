# Detailed lesson 5 (g3-oa9-input-output-rule): independent critic, round 2

Critic: Opus, medium effort, 2026-10-17. I graded the pack cold at commit `eae93819`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I worked from the committed PNGs (23), `pack.html` and its pool JSON,
`js/modules/lessons/detailed/g3-oa9-input-output-rule.js`, `js/modules/print-sheet.js` (glance builder) and the E37 / E38
code in `tests/scripts/ws-detailed-lesson.cjs`. SELF-CHECK reads 46 / 46. The EE code is recorded and not graded, as
instructed.

What I checked:
- I read every PNG.
- I recomputed every In → Out row under its rule (chart, Guided, P4-1, P4-2, story, exit slip, Check Question, and every
  T2 / T6 wrong-answer row).
- For every table I checked that exactly one taught +, − or × rule fits.
- I checked every key against its page.
- I listed every (In, Out) pair and every rule across the pack from `#v21-pool`.
- I compared every script line, Say band and teacher fill with the pupil page it names.

## Verdict: FAIL (2 of 23 pages have a criterion below 8)

Lowest score per criterion: **C1 7 · C2 7 · C3 8 · C4 9.**

Round 1's six defects are all closed:
- The tables are fresh by pair.
- Every Practice page now ends on a real × trap and a − table with an Out of 0.
- The Ins are in order.
- The word problem is the lesson's own task, in the rule frame.
- No placeholder is left on any page.
- The exit Say is generic.

Two new defects block the pass, and each is a one-line fix:
- **D7:** the T6 key prints an answer, "38 + 5 = 43", for a question the word problem no longer asks.
- **D8:** the T4 anchor-chart script sends the teacher to the wrong chart panels.

## Round 1 status

| r1 | Status | Evidence |
|---|---|---|
| D1 Tables, rows and rules repeated; exit not fresh | **Fixed** (relaxed rule accepted) | 0 (In, Out) pairs repeat across pages (pool listing, 18 pupil tables). No table is a copy of another. Each rule is on at most 2 pupil tables: −3 chart + P4-1 b; −8 Guided 2 + exit b; +5 story + exit a; ×5 P4-1 c + exit c; ×2 chart + P4-2 d. Every exit item has to be worked out from new pairs. See n8 and n9. |
| D2 No × on Practice 1; ÷ "traps" | **Fixed** | P4-1 last row: ×5 (2→10 also fits +8) and −6 (6→0). P4-2 last row: −9 (9→0) and ×2 (7→14 also fits +7). On both pages the row-1 tables fit no × rule. T5 §8 no longer calls anything a ÷ trap. |
| D3 Ins out of order on Practice 2 | **Fixed** | Every table lists its Ins in ascending order. P4-2 changes nothing from P4-1 (fresh numbers only). |
| D4 Word problem: different task and frame | **Fixed on the page; residue on T6 (D7)** | P5 is "What is the rule from Ben to Ann?", with the table printed and the n ◯ ☐ frame. The age gap (+5) is a context where a + rule makes sense. |
| D5 Raw `{pre.0.letters}` on T2 | **Fixed** | T2 reads "Prerequisite Check: add and subtract". E38 passes and its code reads every page. |
| D6 Exit Say read a rule from one pair | **Fixed** | "I test every row. Then I write the rule." |
| n1 Panel 1 title against the box | Fixed | "Read rows 1 and 2 across." |
| n2 input / output wording | Fixed | Chart Say: "In 10, out 14 …" |
| n3 T2b "step 1 traced" | Fixed | T2b ★ reads "Guided: the machine picture and the Steps; the teacher leads". |
| n4 T2b generic answer-slot rows | **Open** | "a number after =" and "a part inside an expression" are still listed. Neither slot is on any pupil page. |
| n5 Exit labelled ★★★ as a whole | **Open** | T6: "P6 Exit slip … ★★★". Only item c is the trap. |
| n6 P0 2 × 11; seed 4343 | 2 × 11 fixed (now 5 × 5). Seed accepted | The shared code is documented. |
| n7 Check Question option B | Accepted | B (+4) is the "Down the Out column" mistake. It is consistent with T2. |

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 8 | 9 | 9 | |
| T2 Teacher 2 | 9 | 8 | 9 | 9 | n10, n11 |
| T2b Reference | 9 | 8 | 9 | 9 | n4 |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | |
| T4 Teacher 4 | **7** | 8 | 9 | 9 | D8 |
| T5 Teacher 5 | 8 | 8 | 9 | 9 | n9 |
| P0 Prerequisite | 9 | 8 | 9 | 9 | n12 |
| P1 Number sense | 9 | 8 | 9 | 9 | |
| P2 Anchor chart | 9 | 8 | 9 | 9 | |
| P3 Lesson 1 | 9 | 8 | 9 | 9 | |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | n11 |
| P4-2 Practice 2 | 9 | 8 | 9 | 9 | |
| P5 Word problem | 8 | 8 | 8 | 9 | n13 |
| P6 Exit slip | 8 | 8 | 8 | 9 | n8, n14 |
| P0 key | 9 | 8 | 9 | 9 | |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 8 | 9 | 9 | |
| P3 key | 9 | 8 | 9 | 9 | |
| P4-1 key | 9 | 8 | 9 | 9 | |
| P4-2 key | 9 | 8 | 9 | 9 | |
| P5 key | 9 | 8 | 9 | 9 | |
| P6 key | 9 | 8 | 9 | 9 | |
| T6 Answer Key | 8 | **7** | 9 | 9 | D7, n5 |

## What I verified

**Tables.** Every row of all 18 pupil tables is correct under its keyed rule. So are the board tables: Check Question
3→6 / 5→10 / 8→16 (×2), the T2 / T4 board table 9→18 / 19→38 / 23→46 (×2), and the T2 "Sign flipped" table.

**One rule fits.** Exactly one taught rule fits each table:
- Each × table's row 1 also fits a + rule, and that + rule fails on row 2. This holds for chart ×2, Guided ×10, P4-1 c,
  P4-2 d and exit c.
- No + or − row-1 table also fits ×2, ×5 or ×10.
- Two row-1 tables, P4-1 b (4→1) and P4-2 b (5→1), would also fit a ÷ rule. ÷ is untaught and these tables are not
  labelled as traps, so this is not a defect.

**Keys.** Every pupil key is correct. The Vocabulary match key is correct (4→ In, →7 Out, 4→+3→7 rule).

**T6 wrong-answer rows.** All ten "Pupil wrote" values are the true mistake value for their table. For example, "Down the
Out column" is the first gap between Outs (+25, +10, +11, +13, +4, +26).

**Say bands.**
- None gives away an answer.
- The P5 frame "I tested every row. The rule is ___." matches its key (+ 5).

**Frame.** The ©, strand tab and I Can title are on all 23 pages. The ink is black, white and the single grey, with the
accent only on step marks. Every page is well filled.

## Defects (each one causes a score below 8)

**D7 (T6, C2 7). "Answers at a glance" prints an answer to a question that no longer exists.**
- The row reads "P5 Word problem: **+ 5 · 38 + 5 = 43**".
- The P5 page and its key ask only for the rule. The numbers 38 and 43 appear nowhere in the story or the table.
- A teacher marking P5 from T6 would look for a 43 that no pupil can write.
- Rules broken: every key is correct; T6 matches the pupil pages (E29's intent).
- Source:
  - `print-sheet.js:3616` pushes `${wpV.ans} · ${wpV.eq}` whenever the dealt `eq` differs from `ans`. The story still
    deals the old "one more In past the table" equation.
  - The stale comment at lessons file lines 137–138 still describes that design ("its numbers are a dealt × table (no
    trap) and one more In past the table").
- **Fix:**
  - For a `tableItem` word problem, print only the rule (`+ 5`) in the glance row.
  - Update the comment.
  - Extend E29 so it reads the P5 glance row against the P5 key's marks (it reads only §1, §10 and the routing table
    today).

**D8 (T4, C1 7). The anchor-chart script names panels the chart does not have in those places.**

The printed chart has six panels. Panels 1–4 carry the step marks ① to ④ and all show the + 4 table. Panel 5 is the − 3
example and panel 6 is the × 2 trap. The script numbers the *examples*, not the panels:

| T4 says | That printed panel shows | Should name |
|---|---|---|
| Watch box: "Pupils who nod at + 9 **on panel 3**" | ③ "Test every row." (+ 4) | the × 2 trap, panel 6 |
| Step 5 note: "**Panel 2.** The rule: − 3." | ② "Bigger or smaller?" (+ 4) | panel 5 |
| Step 6 note: "**Panel 3:** the trap." | ③ (+ 4) | panel 6 |

- A teacher pointing at a projected chart will point at the wrong table three times, in the lesson's core 10 minutes.
- This was already in r1's build (lessons file lines 250, 256–257). Round 1 missed it.
- Rules broken: scripts match the pupil pages; C1.
- **Fix:** say "the − example (bottom middle)" and "the × example (bottom right)", or "panel 5" and "panel 6".
  - Line 107's `why` text ("Panel 3 shows it failing") and the comment at line 109 use the same numbering. Fix them
    together.

## Nits (no score below 8 on their own)

- **n8 (P6): every exit rule is used on another pupil table.**
  - The repeats: + 5 is the word problem done just before, − 8 is Guided 2, × 5 is P4-1 c.
  - The pairs are all fresh, so each item still has to be worked out. I accept the builder's "≤ 2 tables" rule. But only
    × has to repeat (three × rules); + and − had four unused rules each (+ 7, + 8, + 9, + 10; − 2, − 5, − 7, − 10).
  - Prefer a fresh + rule and a fresh − rule on the exit. A + 5 exit straight after a + 5 story invites a carried-over
    answer.
- **n9 (T5 §7): the Check Question rule × 2 is on three tables, not two.**
  - It is the Check Question, the chart's trap and P4-2 d. The builder's note says "one other table".
  - E37 cannot see it, because board-only tables are not in the pool. Either add board tables to E37's count, or accept
    × 2 here and correct the note.
  - The Check Question also has only one × option, so "the trap answer is the × one" can be guessed without testing.
    This is acceptable for a 3-minute hinge.
- **n10 (T2): wording differs between T2 and the pupil Steps band.**
  - T2 step 1 reads "Read In and Out across row 1". Every pupil Steps band reads "Read rows 1 and 2 across." Use the
    pupil wording.
  - Atom 8 "An Out of 0" is listed as a Category atom, but no script line (T4 / T5 §5–6) shows it before the ★★★ rows.
    It is the same procedure (6 − 0 = 6, so − 6), so it is a fair ★★★ edge case under V22 §★★★. Still, add one T4 note
    ("If Out is 0, the In is the number taken away") so the atom is taught where T2 says it is.
- **n11 (T2): "Caught by: Exit b · Practice 1" for "Sign flipped".** Practice 1's − tables are b and d. Name them ("P4-1
  b, d") so the teacher knows where to look.
- **n12 (P0): the Prerequisite Check tests facts to 20, but the lesson asks for a change of up to 10 across a ten.**
  - Examples are 34 → 26, 45 → 37 and 20 → 12.
  - The chart and Guided 2 model this, and P1 practises ±10, so I accept it. One ± bridge-through-ten item (such as
    32 − 5) in P0 e–h would check the real prerequisite.
- **n13 (P5): the printed table is headed In (n) / Out, not Ben / Ann.**
  - The story is fully duplicated by the table, so its reading demand is decoration. Only the T5 Ask ("Ben is In, Ann is
    Out") links the two.
  - Head the columns "Ben (n)" / "Ann", or print the table half-filled for the pupil to complete from the story.
- **n14 (P6): exit a has consecutive Ins (27 → 32, 28 → 33).** Testing row 3 after row 2 is near-trivial. Spread the Ins.
- **n4, n5 remain open** (see the status table).

## Judgements on the builder's notes

- **× rules shared with one other table, pairs fresh: accepted.** The pairs really are all fresh (pool listing), and with
  only × 2, × 5 and × 10 some rule has to repeat. The note understates × 2 (n9), and + and − did not need to repeat (n8).
- **Prerequisite facts to 20 while the lesson uses numbers to 50: accepted.** It is modelled on the chart and Guided
  (n12).
- **P0 footer seed 4343: accepted** (shared code).
- **Word problem as a + age story with its own table and rule frame: accepted.** Ann is always 5 years older: a sound
  context, the right task and the right frame. The only residue is on T6 (D7). The column labels are a nit (n13).
- **E37 and E38:** both are implemented and pass honestly on the pupil pages. E37 does not count board-only tables (n9).
  E38 reads every page's `{…}` remnants.
