# Critic verdict: STEP-FORM on algebra:two_step_* (commits 22f10586f, 766a7acfd)

Tree: claude/sweet-newton-c8wrv1-lf-algebra @ b0050526d. Critic: independent, narrow (budget stop).
Renders: `critic-stepform/r/` (two_step_add_then_div and two_step_mult_div_first; guided and independent; M and L; screen hosts) plus the
Opener at M in `stepform-merged/algebra__two_step_add_then_div/`.

## VERDICT: FAIL (on alignment, the lead's rule). STEP-FORM itself is correct.

| Criterion | Score |
|---|---|
| C1 Ease of use | 7 |
| C2 Educational value | 8 |
| C3 Spacing and layout | 6 |
| C4 Standard fidelity | 7 |

## What passes (checks 1 to 3)
1. Every fact step is horizontal, has the right sign, and has the right answer on the key: 6+4=10 and 10÷2=5 (Opener M); 7+5=12 and 12÷3=4,
   40÷5=8 (independent L); 28÷4=7, 7−2=5, 3×4=12, 12−2=10 (mult_div_first independent M); 6×2 (guided L p2); 15−7, 5+7 and the
   ÷ steps on the online worksheet. Predicate `isFactStep` (word-work.js) matches the brief, with two one-digit addends counting as a fact (7+5).
2. Non-fact steps keep their frame: 47−7 (independent L item 2), 12+16 (guided L p2), and 29−9, 29−8, 33−3, 27−7 (screen worksheet)
   are all columns. No long-division frame was seen on a fact ÷.
3. The sentences meet the standard: working digit size, boxed slots, the round sign slot, nothing clipped, and an empty sign circle with
   empty boxes on the pupil pages. Paper and screen match (the screen worksheet stacks Step 1 over Step 2, the same sentence).

## Findings
**F1 (FAIL, C1/C3/C4): staggered steps, STEP-ALIGN.** The Step 1 and Step 2 blocks are bottom-aligned, so their captions, sign rows
and sentences sit on different lines; Step 2 rides 60–140 px higher. Seen in every print render with two blocks on one row:
- Opener M p1 (add_then_div): Step 2 about 80 px higher.
- independent L p1 (add_then_div): item 1 Step 2 about 70 px higher; item 2 Step 1 (column) is taller, so Step 2 sits lower.
- independent M p1 (mult_div_first): the sentences share a line, but Step 2's caption and sign row sit about 40 px higher (the
  unit bank is stacked above the line in that block).
- guided L p2 (mult_div_first): Step 2 (a column) is about 140 px higher than Step 1.
The page reads as a staircase. On mult_div_first, Step 2 is the higher block, which invites reading it first. RUBRIC C3 says "the
answer in the same place in every cell".
Cause: `js/modules/sheet/cells/word-work.js:1481`, where the step row uses `align-items:flex-end`, and the unit and bank sit inside the
last step's block. Rule: top-align (`flex-start`) both `.mq-wwstep` blocks. Put the unit and bank in their own column, so the two
sign rows share one line, and so do the two sentences (or the column's top operand row) when both are sentences.
**Automatic check:** `ws-two-step STEP-ALIGN` (or a print-lint PG rule) checks DOM geometry on every two-step cell in every role and
size (M, L) and on every screen host. It requires |top(caption₁) − top(caption₂)| ≤ 1 mm and |top(sign-row₁) − top(sign-row₂)| ≤ 1 mm,
and, when both steps are `.mq-wwfact`, equal sentence tops. It should be backtested FAIL at b0050526d.

**F2 (minor, C3): uneven boxes in a fact sentence.** The final answer of a fact step is drawn one box per digit ("1|0" for 10,
mult_div_first independent M key, item 2), while the operands and Step 1's result are whole-number boxes ("12" in one box).
This is the intended graded slot, so it is not a fail. Fine at one digit; at two digits it reads as a different object.
Check: `ws-two-step` could assert that the final-answer box width matches the operand box width when T > 1.

**F3 (note, not graded): the bar plus the sentence.** On the Opener and the guided page, the bar models sit above the sentences, with their own
"Step 1 / Step 2" captions, so the captions appear twice. Bar first, then the sentence, is concrete then abstract and is not confusing. But
with F1 the Step 2 bar and the Step 2 sentence are in different columns and rows, and the eye cannot pair them. Once F1 is fixed, align
each sentence under its bar.

**F4 (note): grey "Step 1: 6 × 2 = 12." under Step 1, guided L p2 pupil page.** This gives the Step 1 answer away, on the pupil page.
If it is the guided page's deliberate first-item hint (a fading hint scaffold), it is allowed. Confirm with the card. If it is not, check
for it with H-answer-leak (the expected value of a slot must not appear as text on the pupil page).

Out of scope, seen but not graded: the column for 12+16 draws a third (hundreds) column; the Steps band item "× or ÷." wraps with "÷." alone.

## PAGEFILL verdict (two_step_add_then_div, independent, L, p1)
The page is full: two equal cells run from the instruction line to the footer. There is no empty strip at the bottom of the page. The
freed space (the ~52 mm the brief mentions) sits inside the cells, below the work: about 15 mm in item 1 and about 25 mm in item 2.
That reads as deliberate working space, and each cell keeps more than 40 % free area. **Fill on its own is ≥ 8 (C3 fill: 8).**
**But the page is NOT ≥ 8 on all four criteria**: F1 (the stagger) is on this page in both items, scoring C1 7, C2 8, C3 6, C4 7.
Once STEP-ALIGN is fixed, I expect this page to reach 8 on every criterion, with no change to the fill.

---

# Round 2 (head c3b04762a, fix 938fdadbe; renders `stepalign/`)

## VERDICT: FAIL. F1 is fixed for fact + fact cells and still open for column + fact cells.

| Criterion | Score |
|---|---|
| C1 Ease of use | 8 |
| C2 Educational value | 8 |
| C3 Spacing and layout | 7 |
| C4 Standard fidelity | 7 |

## What is fixed
- **Fact + fact cells now align.** The captions, the sign rows and the sentences sit on one line, and the unit stands at the top of the
  sentence. Seen in add_then_div Opener M p1 (6+4=10, 10÷2=5, with bars above), add_then_div independent M and L item 1, and
  mult_div_first independent L key item 1 (28÷4=7, 7−2=5). The bars and the sentences now pair in columns (round-1 F3 is resolved).
- STEP-FORM is still correct: fact steps are sentences, and 47−7 keeps its column.

## Findings
**F1b (FAIL, C3/C4): column + fact cells are still staggered.** In `algebra__two_step_add_then_div/independent-L-p1.png`, item 2
(47−7, then 40÷5), the Step 1 caption is at about y 714 and the Step 2 caption at about y 766, a gap of about 52 px. The sign rows and the
sentence or top operand row are also on different lines. `independent-M-p1.png` item 2 shows the same at about 46 px. The keys follow
the pupil pages. Step 1 is now the higher block, so the reading order holds, which is why C1 recovers to 8. But the cell still does not
follow the round-1 rule (caption tops and sign-row tops within 1 mm in **every** two-step cell), and keep-then-share items are common in
this skill.
**Cause:** 938fdadbe switches the step row to `flex-start` only when both steps are facts (word-work.js, step row and line 881's
`factHere`/÷ test). A column + fact row still bottom-aligns or centres.
**Fix:** top-align the step row for every pair of step forms.
**Check:** `ws-two-step --align STEP-ALIGN` judges only "fact-pair" cells (its own comment says "In a cell whose two steps are both fact
sentences"), so it passed 52 cells while this one is off. Widen it to every two-block step row: caption tops and sign-row tops each within
1 mm, at M and L, pupil and key, on every screen host. Backtest it FAIL at c3b04762a (add_then_div independent L item 2, seed 784454).

**F5 (minor, C3): the wrapped row has uneven left edges.** In `algebra__two_step_mult_div_first/independent-L-key-p1.png`, item 2 (3×4=12,
then 12−2=10): Step 2 drops under Step 1, which reads cleanly and in order (Step 1 above Step 2, the unit bank beside Step 2). However,
Step 1 is centred (left edge about x 273), while Step 2 starts at about x 205. The two sentences do not share a left edge, so the "="
signs and the answer boxes do not line up vertically. This is acceptable as a wrapped form once the steps are left-aligned to one edge.
**Check:** in STEP-ALIGN, when Step 2's top is greater than or equal to Step 1's bottom (a wrapped row), require the left edges of the two
`.mq-wwstep` blocks to agree within 1 mm.

Not graded, as the brief says: F2 (one box per digit; "1|0" is still visible), F4, LDIV-JOIN, lesson layout, size S, and 390 px.

## PAGEFILL verdict (two_step_add_then_div, independent, L, p1)
**Not yet.** The fill is still 8, with the same working space inside each cell. Item 1 is now clean. But item 2 on this exact page is
the F1b column + fact stagger, so C3 is 7 and C4 is 7. Once the step row top-aligns for every form, I expect this page to score 8 or
better on all four criteria.

---

# Round 3 (head 488142df6, fix 517639a61; renders `stepalign3/`). Final round under the cap.

## VERDICT: FAIL, on one screen host only. Every print page passes.

| Criterion | Print (all roles, M and L) | Worst host (worksheet 1280) |
|---|---|---|
| C1 Ease of use | 8 | 8 |
| C2 Educational value | 8 | 8 |
| C3 Spacing and layout | 8 | **7** |
| C4 Standard fidelity | 8 | 8 |

## What is fixed
- **F1b is fixed.** In add_then_div independent-L-p1 item 2 (the 47−7 column beside 40÷5), the Step 1 and Step 2 captions now sit on one
  line (y about 714). The sign rows are on one line too (y about 745). The sentence's top lines up with the top of the column block
  (its carry row). The key matches the pupil page. The same holds on independent-M-p1 item 2 and on mult_div_first guided-L-p2 (fact
  beside column, with the bars paired above).
- **F5 is fixed.** In mult_div_first independent-L (pupil and key), item 2 wraps: Step 1 sits above Step 2, and both start at x about 78,
  so the "=" signs and the answer boxes stack in order.
- STEP-FORM is still correct everywhere I looked. Fact steps are horizontal sentences with boxes; 47−7 and 12+16 keep their columns.

## Findings
**F6 (FAIL, C3, screen host): a fact sentence breaks across two lines on the online worksheet.** In
`stepalign3/algebra__two_step_mult_div_first/worksheet-1280.png`, item 4 (45÷5=9, then 9+3=12), Step 2 draws "□ ○ □ =" on one line. The
two answer boxes for 12 drop to the next line, under the first operand. The number sentence is cut in two, and the answer is no longer in
the same place as in the other five cells. That is the C3 rule "the answer in the same place in every cell". The three-up worksheet
cell (about 330 px wide) cannot hold a 5-slot sentence plus a 2-digit answer, and the sentence's slots are allowed to wrap.
**Fix:** a `.mq-wwfact` sentence must never wrap inside itself. Make it `nowrap`, and wrap or shrink the step row or the host column
instead. Another option is a wider worksheet cell or two-up for this template. Do not shrink the content.
**Check:** extend `ws-two-step --align STEP-ALIGN` to the screen hosts (card 820/1024/1280/1366, worksheet 1280, quiz 1280). In every
`.mq-wwfact`, all slot boxes and the "=" must share one line, with max(top) − min(top) ≤ 1 mm. Seed the run so that a 2-digit Step 2
answer occurs (item 4 above), and backtest it FAIL at 488142df6.

**F7 (minor, note): the unit line is placed differently from cell to cell.** In add_then_div independent-L the unit line sits beside the final box, above the
bank. In mult_div_first independent-L it sits under the bank at the bottom right. On worksheet 1280, item 1's line is left of the bank,
and in the other items it is above the bank. Not a fail. Check: the unit-slot position relative to the bank is the same in every cell
of a page.

**Observation (not graded):** on the card and quiz screens, the focused first operand box draws as a wider box with an inner divider and a
caret bar (card-1280, quiz-1280). This looks like the focus style, not a slot split. Confirm it outside this review.

Not graded, as the brief says: F2 (per-digit answer slots), F4, LDIV-JOIN, lesson layout, size S, 390 px, and the earlier guided
print-lint EB/OVERFLOW findings.

## PAGEFILL verdict (two_step_add_then_div, independent, L, p1)
**Yes: ≥ 8 on all four (C1 8, C2 8, C3 8, C4 8).** The page is full, with working space inside each cell. Item 1 (fact + fact) and
item 2 (column + fact) now share their caption and sign-row lines. The key follows the pupil page.

# Round 4 (F6, screen) (head b568ac14f, fix 85bfa6313; renders `f6/`). Screen hosts only.

## VERDICT: PASS. C1 8, C2 8, C3 8, C4 8 on every screen host looked at.

| Criterion | worksheet-1280 (3 skills) | card-820 | quiz-1280 |
|---|---|---|---|
| C1 Ease of use | 8 | 8 | 8 |
| C2 Educational value | 8 | 8 | 8 |
| C3 Spacing and layout | 8 | 8 | 8 |
| C4 Standard fidelity | 8 | 8 | 8 |

## What is fixed
- **F6 is fixed.** In `f6/algebra__two_step_mult_div_first/worksheet-1280.png` item 4 (45÷5=9, then 9+3=12), Step 2 now reads
  "□ ○ □ = □□" on one line, and the two answer boxes sit at the right end of the sentence like every other cell. The same holds for
  every 2-digit Step 2 answer in `add_then_mult/worksheet-1280.png` (items 1–6, all "= □□" on one line inside the ~330 px cell) and
  in `add_then_div/worksheet-1280.png`. No fact sentence wraps on any of the three worksheets, the card at 820 or the quiz at 1280.
- In every cell the "=" and the answer boxes share one baseline with the operands; each step's answer sits at the end of its sentence,
  and Step 1 / Step 2 rows line up across cells in the same row of the grid.
- **Narrow one-digit boxes read well.** One-digit operand boxes are one digit box wide, the same height as the others, and a 2-digit
  operand keeps a wider box (e.g. 45, 12, 24 on worksheet 1280; 54 on quiz 1280), so the box width now hints at the size of the number
  without giving the number away. The 0.8 mm gaps keep boxes, the sign circle and "=" apart; nothing touches or is clipped.
- **Paper still matches screen.** `print-p1.png` draws the same sentence: two operand boxes, sign circle, "=", 1 box for a 1-digit and 2
  boxes for a 2-digit Step 2 answer, columns kept for 47−7 style steps. The only difference is the screen-only narrower one-digit
  operand box, which the brief allows; the structure and order are identical.

## Notes (not failing)
- **N1 (F2 territory, not graded):** a 2-digit *Step 1* answer is one wide box (`add_then_div/worksheet-1280` item 5 "5+7=[ 12 ]",
  `mult_div_first/card-820` "6×8=[ 48 ]"), while a 2-digit Step 2 answer is two digit boxes. Print does the same, so parity holds;
  it belongs to F2. Check: per-digit slot count equals answer digit count for every step's answer slot.
- **N2 (F7, minor):** the unit line still moves: left of the bank in `mult_div_first/worksheet-1280` item 1, above the bank in items
  2–6. Check as in round 3 (unit-slot position relative to the bank is the same in every cell of a page).
- The focused first-operand box on card/quiz still draws an inner divider and caret (focus style; observation carried from round 3).

Not graded, as the brief says: print, LDIV-JOIN, lesson layout, 390 px, F2, touch targets at 1024.
