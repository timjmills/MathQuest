# lf-vocab round 9: narrow critic r9 (Q-S2 re-check)

Critic: independent, Opus medium. Graded hosts/, answered/ (both skills, right and wrong, 390 / worksheet / quiz), both keys,
pictures/pics-40 (47), g4/ (both skills, independent + key), lesson/. Read `explain`, `notWith`, `VOCAB_ALSO_SHOWS`,
`vocabPictureDerived`; ran `compatible()` on every pair flagged below (all return true, so each pair can be dealt together).

## Re-check of r7 defects
1. Match 3 quiz wrong boxes not red, blue ring on a wrong box: **FIXED** (A and C red dashed, no ring on them).
2. Pick3 had no next cue: **FIXED** (blue outline on the answer line, card-390 and worksheet).
3. / r6-6 Key dot halos fuse: **FIXED** (equal groups: grey ring on the group circle only; array halos do not touch).
4. Ladder verb "Type" on pick3: **FIXED** ("Tap odd.").
5. / r6-7 ELL wording: **FIXED** ("4 dots in each", "3 times as long as the other").
6. O-3 look-alikes: **PARTLY**. Every r7 pair is now notWith or derived (row/column/input/output/array/odd/cycle/equation
   pairs, term/first term vs pattern). New and remaining pairs below (defects 2, 3).

## Match 3 screens: C1 8 · C2 8 · C3 8 · C4 8. Caps: none.
1. **minor.** answered-wrong-worksheet-1280 card 1: the wrong "step" box A shows a heavy black focus outline over the red
   dashed fill, so it reads differently from the wrong "rule" box. The quiz right box B has no green tick (the card has one).
   Fix: box-wrong outline wins over :focus on vocab slots; the quiz host adds the same right tick as the card.

## Pick3 screens: C1 8 · C2 9 · C3 8 · C4 9. Caps: none.

## Next box (O-1): C1 8 · C2 8 · C3 8 · C4 8. Caps: none. Blue on the answer line (pick3), on the next empty slot
(Match 3); never on a red box; yellow only on R-1.

## Keys: C1 9 · C2 9 · C3 9 · C4 8. Caps: none. All answers checked; single grey.

## Explanations (R-2): C1 9 · C2 8 · C3 9 · C4 9. Caps: none.

## Pictures (O-2 / O-3): C1 8 · C2 7 · C3 8 · C4 9. Caps: none.
"Could a pupil defend another bank word?" Yes only for:

| picture | defensible word | dealt together in |
|---|---|---|
| rule (2 → [+3] → 5) | **output** (the 5 comes out), **input** (the 2 goes in) | G3 set 1 (input, output, rule); G4 set 8 (rule, output) |
| cycle (2 → 4 → 8 → 6 loop) | **sequence** (numbers one after another) | G4 set 6, in the core trio |
| times as many (bracket under the 3-box bar) | total (weaker: the bracket marks a whole) | G4 set 9 |

All other 44 pictures pass (step, digit, place, factor/product/quotient/divisor/dividend boxes are unambiguous).
2. **major (C2 -1).** rule picture is the function-machine image, whose ends ARE an input and an output. Fix: redraw rule
   without number ends (an empty "in" arrow → [+3] → empty "out" arrow, or "+3 each time" drawn round under a short list),
   or add input/output to rule's notWith and re-run V5/V7 on sets 1 and 8.
3. **minor (C2).** cycle reads as a sequence and both sit in set 6's core trio. Fix: redraw cycle as a loop of shapes
   (no number run), so it cannot be read as numbers in order; keep the units-digit link in the explanation.

## Grade 4 changed sets: C1 7 · C2 7 · C3 8 · C4 8. Caps: none.
4. **major (C1 -1).** times as many: "total" is now a CORE word (Match 3 trio) and its picture is the additive 5 + 3 bar,
   which teaches additive part-whole in a multiplicative-comparison lesson (4.OA.A.1). Fix: replace total with a
   multiplicative word whose picture fits, e.g. `['times as many','factor','product','compare','multiple','unknown']`
   (trios: {times as many, factor, product} / {compare, multiple, unknown} are clash-free).
5. **minor (C1).** follow a rule: "output" belongs to input-output tables, not to extending a number pattern (4.OA.C.5), and
   brings defect 2's clash into the set. growing patterns: dropping "pattern" leaves grow/rule/term to carry the lesson
   (acceptable), but "total" again uses the part-whole bar. Fix: once rule is redrawn (defect 2), consider "grow" or a
   redrawn "pattern" for set 8; for set 7 accept total only if its picture shows a growing-stack total.

## Identify lesson band: NOT GRADABLE.
6. **blocker.** lesson/identify-L-pupil-1.png and -key-1.png are blank bodies titled "I Can write a number in expanded
   form" (expand, seed 27913), not the identify lesson. Fix: re-render the identify lesson (r8 o2-identify-band.png was the
   last good evidence) and check the harness's lesson id.

## Verdict: FAIL. Minimum score 7 (Pictures C2; Grade 4 sets C1 and C2). Band not graded (blank render).

## Automatic checks
1. Host probe: on answered-wrong, every wrong slot's computed outline is the box-wrong style even when focused; quiz right
   slots carry the same tick class as the card.
2. V-AMBIG+ rule: a picture with an arrow INTO and OUT OF a drawn box with numbers at both ends derives input and output.
3. V-AMBIG+ rule: a loop of 3+ numbers derives sequence (as it already derives pattern).
4. ws-vocab-unit: a core (first three) word's picture must carry a lesson tag matching the set's operation (additive
   picture in a 4.OA.A.1 set fails); or V7 forbids a swap that puts a new word in the core trio without a lead note.
5. Same as 4 (word-to-standard tag check on swapped words).
6. Render gate: a lesson page whose body has fewer than N ink pixels, or whose title is not the requested lesson, fails.

## Speed-ups
- Generate the O-3 table (picture × same-grade compatible words) by script so the critic marks yes/no only.
- Have the render step assert lesson title and non-empty body before handing renders to a critic.
- When a word is swapped to dodge a clash, run the core-trio-relevance check in the same change, not in the next round.
