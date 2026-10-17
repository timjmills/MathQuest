# Detailed lesson 2 (g1-oa1-bar-model-wp-20): independent critic, round 2

Critic: Opus, medium effort, 2026-10-16. Graded cold at commit `a09a3a90`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. The pack is `design/lesson-samples/detailed/g1-oa1-bar-model-wp-20/`
(23 PNGs, seed 4242; the PNGs were regenerated in this commit).

What I checked:
- I read all 23 PNGs.
- I worked every item, key, wrong-answer row and quoted number by hand.
- I read the lesson file, the `buildDetailedLesson` mixed branch in `print-sheet.js`, the T2b table in
  `roles/detailed-lesson.js`, the `leadHalf` logic in `roles/mixed-practice.js`, and RESEARCH.md.
- The lead's rulings applied: bars are schematic (RP-72 / XP-G-15); 3 full-size exit items per half; P3 has no
  Independent cells; P5 Workspace is unlabelled.

## Verdict: FAIL (8 of 23 pages have a criterion below 8; 15 pass)

Lowest score per criterion: **C1 7 · C2 6 · C3 7 · C4 8.**

The r1 core defects are fixed:
- The bar slots are full size: part and whole boxes are about 17 × 10 mm, segments 14 mm, bars ≥ 42 mm.
- Every story crosses ten with parts of 3 or more.
- The ★★★ row is equal parts plus a whole of 20.
- The count slip is caught by exit c.
- P5 makes the pupil write the sign.

What still fails:
1. **The I Do script describes a different anchor chart from the one printed.** The chart dealt an add-to story, so
   "put together … in all" is never modelled.
2. **Practice 1, Mixed 1 and the exit slip break LR-6** (repeated first addends, near twins, a twin answer). The gate
   E24b passes them anyway.
3. **On Mixed 1 the lesson skill is 2 of the 14 items.** V22 §9.5 asks for at least half.
4. **The exit-slip stories run to 5 lines and split sentences.** Every story on the slip assesses add-to.
5. **T2b prints "/4 a half" for a slip that scores /3.**

## r1 defect status

| r1 | Status | Evidence at a09a3a90 |
|---|---|---|
| D1 Bar slots below Hw | **Fixed** | P3, P4, P4m: label boxes ≈ 17 × 10 mm, segments 14 mm, bars ≈ 52 mm. P6: ≈ 17 × 10 mm, bar 44 mm. The key digits are at working size. |
| D2a Easy wholes | **Fixed** | Chart 7 + 6 = 13 · Check Question 9 + 7 = 16 · P5 3 + 8 = 11 · Exit 13 / 11 / 14. Every story crosses ten, and no part is 1 or 10. |
| D2b ★★★ row not edges | **Fixed** | P4 e 9 + 9 (equal parts) and f 7 + 13 = 20. T5 §8 Watch names exactly those two. |
| D2c Count slip uncaught | **Fixed** | Exit c is 8 + 6. T2 row "13 for 8 + 6 · Exit c". T6 has rows 12 (a) and 13 (c). |
| D3 Add-to never modelled | **Inverted, still open** → new D1 | The chart itself is now add-to ("gets … more … now?"). The script still treats it as put-together ("How many books in all?") and models "an add-to story" second. So put-together is now the case that is never modelled. |
| D4 P3 compromise on T2b/T6 | **Fixed** | T2b "Guided: not scored". T6 "P3 Guided 15 · 11 ★". |
| D5 T3 §3 quotes no question | **Fixed** | "Board: 7 + 2 = ? Expected: 9" and "Board: 7 + 7 = ? Expected: 14". |
| D6 Model-it-wrong unscripted | **Fixed** | T4 §5 row 5: "Wrong. 13 is the whole …", with the note "write 13 in a lower box. Then move it." |
| D7 Label step | **Fixed** | Step 4 now reads "Write the whole in the answer box". The chart caption reads "Write 13. Read: 13 books." T6: "The label word is printed: never marked." |
| D8 P5 | **Fixed** | Kofi 3 + 8 pencils. The sign goes in a circle (□ ○ □ = □). §9 says "Expected: 3 + 8 = 11 pencils". |
| D9 Vocabulary marks | **Fixed** | A ▶ arrow at the parts row (part) and at the top (whole). The whole figure is outlined (bar). The P3 key matching lines are correct. |
| D10 Strand tab | **Fixed** | All 23 tabs read "Level 1 · Operations". |
| D11 Exit cells cramped | **Partly fixed** → new D4 | 3 items per half at full size, and min free 45 %. But each story is now 5 lines, and its second sentence breaks ("Kofi gets 5 more / cards."). |
| n1 T1 vocabulary marks | Fixed | Same arrows as P3. |
| n2 T3 §2 skips item 3 | Fixed | "11 · > · 2 tens 4 ones · 37 · 6". |
| n3 P3 cell 2 trace | Accepted | Cell 1 has the parts circled and cell 2 is plain: the fade is right. |
| n4 Bar parts ungraded | Open (nit) | Unchanged. |
| n5 P0 c/d easy bonds | Open (nit, ruled below) | 4 + 1 and 1 + 7, unchanged. |
| n6 Name loop | Open (nit) | Kofi appears on P4 d/e, P5 and exit a. Leo with 9 marbles appears on both the Check Question and P4m a. |
| n7 Gate E24b | Open, worse → new D2 | It passes three LR-6 breaches (see D2). |

## Ruling on the open nit n5 (P0 c/d: 4 + 1, 1 + 7)

A prerequisite item should be easy. These two items check atom 2 ("two parts make a whole"), and the arithmetic is
checked separately on e–h. So small numbers are right in principle.

The flaw is that both items have a part of 1. "4 and 1" and "1 and 7" can be answered by saying the next number
("one more"), with no part-whole idea at all. A pupil who lacks atom 2 can pass both, so the routing on T6 gets a false
"go on".

RESEARCH.md planned "4 and 3 → 7".

- **Ruling:** a nit, not a score below 8.
- **Fix:** give the prerequisite bonds two parts of 2 or more, within 10 (`partMin: 2`; e.g. 4 and 3, 5 and 2).

## Scores (0–10; PASS = every criterion ≥ 8)

| # | Page | C1 | C2 | C3 | C4 | Pass | Defects / nits |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 9 | 9 | 9 | PASS | — |
| 02 | T2 Atomisation | 9 | 8 | 8 | 9 | PASS | n4 |
| 03 | T2b Reference key | 7 | 8 | 8 | 8 | **FAIL** | D5, n7 |
| 04 | T3 Sections 1–4 | 9 | 8 | 8 | 9 | PASS | — |
| 05 | T4 Sections 5–6 | 7 | 6 | 9 | 9 | **FAIL** | D1 |
| 06 | T5 Sections 7–10 | 8 | 8 | 8 | 9 | PASS | n1 |
| 07 | P0 Prerequisite | 9 | 8 | 8 | 9 | PASS | n5 ruling |
| 08 | P1 Number sense | 9 | 8 | 9 | 9 | PASS | — |
| 09 | P2 Anchor chart | 9 | 8 | 9 | 9 | PASS | (D1 fix may change it) |
| 10 | P3 Lesson 1 | 8 | 8 | 8 | 8 | PASS | n2 |
| 11 | P4-1 Practice 1 | 9 | 7 | 8 | 9 | **FAIL** | D2 |
| 12 | P4m-1 Mixed 1 | 9 | 6 | 8 | 8 | **FAIL** | D2, D3 |
| 13 | P5 Word problem | 9 | 8 | 8 | 8 | PASS | n3, n6 |
| 14 | P6 Exit slip | 8 | 7 | 7 | 8 | **FAIL** | D2, D4 |
| 15 | P0 key | 9 | 8 | 8 | 9 | PASS | — |
| 16 | P1 key | 9 | 8 | 9 | 9 | PASS | — |
| 17 | P2 key | 9 | 8 | 9 | 9 | PASS | — |
| 18 | P3 key | 8 | 8 | 8 | 8 | PASS | — |
| 19 | P4-1 key | 9 | 7 | 8 | 9 | **FAIL** | as P4-1 |
| 20 | P4m-1 key | 9 | 6 | 8 | 8 | **FAIL** | as P4m-1 |
| 21 | P5 key | 9 | 8 | 8 | 8 | PASS | — |
| 22 | P6 key | 8 | 7 | 7 | 8 | **FAIL** | as P6 |
| 23 | T6 Answer key | 8 | 8 | 8 | 9 | PASS | n7, n8 |

All keys are correct (I re-added every one), so cap H1 does not apply anywhere.

## Defects (every score below 8)

**D1. The I Do script does not match the anchor chart, and "put together" is never modelled.** C1, C2 · T4 §5 (P2,
P3 cell 2) · rules: PEDAGOGY P-1 (model each new thing before practice); T2 atom 7; E29 spirit (a script quote must
match its page).

What is wrong:
- The seeded chart dealt an add-to story: "Mia has 7 books. Mia gets 6 more books. How many books does Mia have now?"
- The lesson file was written for a put-together chart:
  - Line 222: `ask: 'How many {chart.unit} in all?'`
  - Line 223: `'Now an add-to story. Write on the board: {chart2.text}'`
- So T4 row 6 asks "How many books in all?" for a chart that says "now".
- T4 row 7 announces "Now an add-to story", then writes a second add-to story (Noor 9 cookies, gets 5 more, "now").
- Row 8 ("Gets more: a part. Now: the whole.") teaches what the chart already showed.
- The two-separate-sets frame ("Ana has … Noor has … in all?") first appears unmodelled in P3 Guided cell 2. It then
  makes up half of Practice 1 (b, d) and Mixed a.
- Atom 7 ("'In all' and 'now' ask for the whole") is half taught.
- E29 cannot catch this, because it compares numbers, not story frames.

Fix:
- Pin the chart's story frame to put-together (`frame: 'put-together'` on the `example` match), so rows 6–8 become true
  as written.
- Or, if the add-to chart stays:
  - Row 6 reads the chart's own question: `{chart.question}`.
  - `chart2` is pinned to a put-together story ("Leo has 8 … Ana has 5 … in all?").
  - Row 7 reads "Now a put-together story", and row 8 reads "Has … and has …: two parts. In all: the whole."
- Either way, add a gate check: every frame the Practice page deals (add-to, put-together) appears in the I Do (chart or
  `chart2`).

**D2. LR-6 (variety on a page) is broken on Practice 1, Mixed 1 and the exit slip, and E24b passes them.** C2 · P4-1,
P4m-1, P6 and their keys · rule: V22 LR-6 ("Addition: no first addend twice in one row of a grid"; "No two answers on a
page are alike"; "No near twins: two items whose numbers are each within 2 of the other's").

What is wrong:

| Page | Breach |
|---|---|
| P4-1 | Row 2 is c 5 + 7 and d 5 + 6: first addend 5 twice in one row, and a near twin. c and f also share a noun ("crayons"). |
| P4m-1 | Story row: a 9 + 11 and b 9 + 3 (9 twice). Fact row c–h: d 2 + 5 and f 2 + 7 (2 twice, and a near twin); e 9 + 2 and h 9 + 6 (9 twice). Answer 7 twice: d (2 + 5) and n (10 − 3). |
| P6 | a 8 + 5 and c 8 + 6: a near twin. The wholes are 13 and 14, and the first part is 8 both times. |

- SELF-CHECK E24b reports "no twin answers and no near twins on any page".
- So the check either does not run the addition first-addend rule per grid row, or it runs per skill and not per page.
- That is the same false-pass class as r1 n7.

Fix:
- Re-deal with LR-6 enforced per page across all skills: distinct first addends per grid row, no near twins, no answer
  twice.
- On the exit slip: e.g. 8 + 5, 4 + 7, 6 + 9.
- Fix E24b so that it fails this tree.

**D3. On Mixed 1 the lesson skill is 2 of the 14 items.** C2 · P4m-1 and its key · rule: V22 §9.5 ("Optional Mixed
page: earlier skills only, the lesson skill fills at least half the items"). The code intends this (`leadHalf` in
`mixed-practice.js`).

What is wrong:
- The page deals 2 bar stories, 6 addition facts and 6 subtraction facts.
- So the review page mostly practises Grade 1 facts, not stories with a bar.
- `leadHalf` stopped once it could neither add a lesson shelf nor drop a partner shelf: each partner has a single
  shelf, so `drop` finds none.

Fix: let `leadHalf` drop a partner section entirely, or shorten a fact row to fewer columns. For example:
- 4 bar stories (2 rows of 2) plus one row of 6 mixed + / − facts.
- Or 4 stories plus 4 facts.

Either way the lesson skill is at least half the items or rows. The subtraction partner is fine as an earlier skill. Then
script Mixed 1 in T5 §8 (n1).

**D4. The exit-slip stories split their sentences, and every item on the slip is the same story frame.** C3 (layout),
C2 (assessment coverage) · P6 and its key · rules: AX-3 ("one sentence per line in stories"), SF-50 ("at most 4 lines"),
and RUBRIC C2 (the exit slip checks the lesson's named cases).

What is wrong:
- With the bar beside the story, the text column is about 60 mm wide.
- Every story runs to 5 lines, and its middle sentence breaks: "Kofi gets 5 more / cards.", "Lena gets 7 more /
  books.", "Sam gets 6 more / pencils."
- All three items are add-to. Put-together ("… has …, … has …, in all?"), half of the lesson's scope, is not assessed at
  exit.

Fix:
- Pin item a or c to a put-together frame.
- Shorten the sentences so each fits its line: use "He/She gets 5 more." and "How many now?" or "How many in all?", from
  the instruction-string library.
- Or narrow the bar to its 42 mm minimum, which gives the text about 70 mm.
- A story of 4 lines or fewer, one sentence per line, closes both AX-3 and SF-50 without shrinking anything.

**D5. T2b scores the exit slip "/4 a half", but the slip prints "/3".** C1 · T2b · rule: RUBRIC C1 (a teacher can use
the page as printed); consistency with P6 and T5 §10.

What is wrong:
- The string is hard-coded in `roles/detailed-lesson.js` line 149: `['P6', 'Exit slip', '/4 a half']`.
- Lesson 2 deals 3 items a half (the lead's capacity ruling).
- A teacher sorting slips by the reference card's /4 misreads 3 / 3 as "not all right".

Fix: derive the score from the dealt exit (`/${exit.length} a half`).

## Nits (no score below 8)

- **n1. Mixed 1 is not scripted.** T1 row 8 lists "Practice 1, Mixed 1" (10 min), but T5 §8 mentions only Practice 1.
  This is the class lesson 1 fixed in its r4 m3. Add "Mixed 1: early finishers / homework."
- **n2. The vocabulary pictures use 6 | 7 → 13, the chart example turned round** (7 + 6 = 13). LR-5 bans that for dealt
  items. The vocabulary picture is not an item, but a different whole (e.g. 5 | 9 → 14) avoids pre-showing the chart's
  answer on P3 and T1.
- **n3. P5 asks for the whole three times:** the story-line blank, the equation's last box and the Say blank. SF-50
  allows the story blank plus the equation, but the Say blank makes it three writes for a Grade 1 pupil. Consider "Say:"
  with no blank on P5 (the pupil reads the story line aloud).
- **n4. T2 Common mistakes:** "Whole in a part box" shows the exit-b form (top 4 · below 11 and 7), but its "Caught by"
  cell is "Check Question A" (top 9 · below 16 and 7). Quote the Check Question's own form, or name "Check Question A,
  exit b".
- **n5. (Ruled above.)** P0 c/d both have a part of 1.
- **n6. Names and frames repeat.**
  - Kofi is on P4 d/e, P5 and exit a.
  - Leo with 9 marbles is the Check Question and P4m a.
  - The T4 board story "Noor 9 cookies, gets 5 more" is near P4 a "Mia 9 cookies, gets 4 more".
- **n7. Fade labels.**
  - T6 marks P5 "★" (whose T2b meaning is "hints on, step 1 traced"), but P5 has no trace.
  - It marks the exit slip "★★★" (T2b: "last row: the edge cases"), but the slip has no edge item.
  - Use ★★ for both, or define the labels for those pages on T2b.
- **n8. T6 wrong-answer row "top 3 · below 4 and 7 (b)":** the next step says "'In all': point at the top box", but
  exit b asks "now". It comes from the same frame confusion as D1. Use "'Now' asks for the whole: point at the top box."
- **n9. The bar parts are still `data-ws-graded="0"`.** This is the r1 n4 suggestion. The exit-slip sort reads them, so
  grading them on P6 at least would be consistent.
