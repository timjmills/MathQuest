# lf-vocab round 8: narrow critic r7 (Q-S2 re-check of R-1 / R-2, plus O-1, O-2 and O-3)

Critic: independent, Opus medium. I graded hosts/, answered/ (right and wrong on 390, worksheet 1280 and quiz 1280), the two keys,
pictures/ (47), lesson/identify-L-pupil-1 and design/status/lf-vocab/r8/o1-*, o2-*. I read `explain` and `VOCAB_ALSO_SHOWS`, and
ran `compatible()` on every pair I flag below.

## Re-check of r6 defects 1-7
1. Match 3 line names the letter, and only wrong pictures glow: **FIXED** ("Output is picture C!", letters ringed).
2. Ladder repeats the definition: **FIXED** (the rungs are now "Say what each picture shows" and "Type C next to ...").
3. Weak rung after the answer is shown: **FIXED**, but see new defect 4 (the verb).
4. Active card had no ladder: **FIXED** (cards 1 and 3 show the same blocks).
5. Wrong pick3 line had no mark: **FIXED** (red box-wrong outline, also on a blank answer).
6. Grey halo smudges marks: **PARTLY**. The "+2" labels now sit on grey underlay boxes, which is fixed. The dot halos in equal groups
   (Match 3 key item 4, pick3 key item 4) still overlap, and the four dots in each ring fuse into one grey blob.
7. ELL wording: **PARTLY**. Digit and ones digit are fixed. Equal groups still says "like 4 dots", and the times-as-many line
   ("one bar is 3 of the other bar") is not grammatical.

## Match 3 Pictures screens
C1 8 · C2 8 · C3 8 · C4 8. Hard caps: none. R-1 and R-2 are correct on card-390 and on the worksheet.

## 1 Picture, 3 Words screens
C1 8 · C2 8 · C3 8 · C4 9. Hard caps: none.

## The next box (O-1)
C1 7 · C2 8 · C3 8 · C4 8. Hard caps: none. The blue next box is correct on card-390, card-1280, worksheet and quiz before an
answer, and a wrong box stays red on card and worksheet.
1. **major (C1 -2).** answered-wrong-quiz-1280 (Match 3): the wrong letters A (output) and C (pattern) are plain black boxes with
   no red mark, and the blue next ring sits on the wrong "A". O-1 says a wrong box keeps its red. Fix: the quiz host applies
   box-wrong to each wrong Match 3 slot, as the card already does, and box-wrong wins over the next-box ring.
2. **note (no points).** Pick3 has no next-answer cue on any host: the line stays black. Decide whether the line or the pill row
   counts as the "box" for O-1.

## Printed keys
C1 9 · C2 9 · C3 9 · C4 8. Hard caps: none. All 18 answers are checked and correct, and the highlight is in the single grey.
3. **minor (C4).** See defect 6 above. Fix: one grey underlay behind the group (or the group circle only), not a ring round each dot.

## Explanations (R-2)
C1 8 · C2 8 · C3 9 · C4 9. Every word has an explanation, each names its word, and none contradicts its picture (I checked grow
1-3-5, one less 6-cross-1, hundred, equation 12 = 3 × 4).
4. **minor (C1 -1, pick3).** The instruction says "Tap its word", but rung 2 says "Type even on the line". Fix: "Tap even."
5. **minor.** See defect 7 above. Fix: "Equal groups means each group has the same number: 4 dots in each." and "Times as many
   means one bar is 3 times as long as the other."

## Pictures (O-2 / O-3)
C1 7 · C2 6 · C3 8 · C4 9. Hard caps: none (H14 and H1 not hit). For each picture, I asked: could a pupil defend another bank word
that `compatible()` lets share its bank, in the same grade? These pictures fail:

| picture | defensible word (same grade, compatible = true) |
|---|---|
| row (2 4 6 8 drawn round) | **pattern** (the same numbers as the pattern picture; dealt together on worksheet card 2), multiple, sequence |
| column (3 6 9) | multiple, pattern |
| input (In column drawn round) | **column** |
| output (Out column drawn round) | **column** |
| array (3 rows of 4) | row, column (its own explanation says "3 rows") |
| odd (pairs + 1) | **left** (its explanation says "one dot is left over") |
| cycle (2→4→8→6) | **pattern** |
| factor, product, quotient, unknown (each a full number sentence) | **equation** (G4: they share the times-as-many and remainder sets) |
| first term, term (3, 7, 11 / 4, 7, 10) | pattern (weaker: the box singles out one number) |
| pattern (+2 jumps) | step (weaker) |

All the other pictures pass, including the redrawn step, digit and place.
6. **major (C2 -2, C1 -1).** O-3 is not met. The root cause is that `VOCAB_ALSO_SHOWS` is a list written by hand, and it leaves out
   the words a picture's own numbers or drawing show. For example, row lists only "times table" and "line". Fix: add each word
   above to that picture's alsoShows, and either make the pair notWith (row/pattern, row/multiple, column/multiple,
   column/pattern, input/column, output/column, array/row, array/column, odd/left, cycle/pattern, equation with
   factor/product/quotient/unknown) or redraw the picture: row as a row of objects with no skip-count, and equation in a way
   that sets it apart from a boxed part. Then re-check the V5/V7 trio split.

## Identify lesson band (O-2)
C1 9 · C2 8 · C3 8 · C4 9. Hard caps: none. Digit (472, 7 circled, with arrow), place (H T O with T shaded) and ones (the ones
looped beside a ten) each mean only their word. The words sit under non-matching pictures, so the band does not give the answers
away.

## Verdict: FAIL. Minimum score 6 (Pictures, C2). The next box group also scores C1 7.

## Automatic checks that would catch each defect
1. Host probe on quiz-answered-wrong: every wrong Match 3 slot carries box-wrong, and no `.mq-next` ring sits on a box-wrong slot.
3. Key lint: no two `.mq-vhalo` circles overlap (centre distance > the sum of their halo radii).
4. ws-vocab-unit: the ladder verb matches the instruction verb (Tap → Tap).
5. Lint `explain`: a minimum length, plus a grammar list ("is N of the other").
6. A derived V-AMBIG: build alsoShows from what each picture draws, not by hand. A number sentence with "=" adds equation. Two or
   more terms in arithmetic progression add pattern, sequence and multiple. A drawn-round table column adds column. A lone or
   crossed mark adds left. A loop of arrows adds pattern. Then fail every compatible pair in the same grade.

## Speed-ups
- Run the O-3 critic question once as a table (picture × same-grade compatible words) made by a script, so the critic only marks
  yes or no. This review would have taken a third of the time.
- Add quiz-answered-wrong for both skills to the standard host set (now present; keep it).
