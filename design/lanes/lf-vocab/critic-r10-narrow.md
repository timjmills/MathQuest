# lf-vocab round 10: narrow critic r10 (Q-S2 re-check)

Critic: independent, Opus medium. Graded hosts/, answered/ (both skills), keys, pictures/pics-40 (47), g4/ (guided +
independent), lesson/, plus extra renders of sets 7, 8, 9 (extra/s7, s8, s9: Match 3 and pick3, independent, L).
Ran `compatible()` and `vocabPictureAlsoShows()` on every pair below.

## Re-check of r9 defects
1. Wrong-box focus outline / quiz right tick: **PARTLY**. Quiz right box B now has the green tick; wrong boxes are red
   dashed and the ring is never on them. answered-wrong-worksheet card 1 still shows a text caret inside the red "A" box.
2. rule picture reads as input/output: **FIXED** (empty arrows into and out of [+3]; derive rule 6 added).
3. cycle reads as sequence: **FIXED** (loop of shapes; derive rule 7 added).
4. times as many core "total": **FIXED** (core trio times as many / factor / product, all multiplicative).
5. follow a rule "output", growing "total": **FIXED**, but the swap brings in grow, see defect 1.
6. Identify band blank: **FIXED** (renders "I Can name the place of a digit", key lines correct).

## Match 3 screens: C1 8 · C2 8 · C3 8 · C4 8. Caps: none.
4. minor. Wrong worksheet card 1: caret left in the red box after Check. Fix: blur vocab slots on check.

## Pick3 screens: C1 8 · C2 9 · C3 8 · C4 9. Caps: none.
## Next box (O-1): C1 8 · C2 8 · C3 8 · C4 8. Blue on the answer line (pick3), on the next empty slot (Match 3); never on red.
## Keys: C1 9 · C2 9 · C3 9 · C4 8. One grey underlay per dot; all letters checked.
## Explanations (R-2): C1 8 · C2 8 · C3 9 · C4 9.
2. minor. cycle: "like ones digits do", but the picture is now shapes; the referent is not on the page. Fix: "Cycle means it
   goes round and back to the start: circle, square, triangle, diamond, then circle again."
3. minor. unknown: "the one in the box" also fits the boxed 4 and 3 of the factor picture (compatible, dealt together on
   pick3 worksheet item 2). Fix: "the number we must find, the ? in the box".

## Pictures (O-2 / O-3): C1 8 · C2 7 · C3 8 · C4 9.
Yes, a pupil could defend another bank word for:

| picture | defensible word | dealt together |
|---|---|---|
| term (4, [7], 10) | **grow** ("gets bigger each time"), **rule** (it is literally +3, the rule picture) | s7 item 2 (term, grow, rule); s8 items 1, 4 |
| first term ([3], 7, 11) | **grow** | s7 item 3; s8 items 2, 3 |
| times as many | factor (the ×3), weak | s9 item 2 |

All other pictures pass.
1. **major (C2 -1).** term and first term draw increasing runs, so they read as grow; term's +3 run is the rule picture's
   +3. `compatible()` is true for term/grow, first term/grow, term/rule. Adding notWith alone leaves sets 7 and 8 without two
   clash-free trios. Fix: redraw term as a falling run with a different step, e.g. 18, [14], 10, and first term as [30], 25, 20,
   so they neither grow nor show +3; update their explains ("like the 14", "like the 30").

## Grade 4 changed sets: C1 8 · C2 7 · C3 8 · C4 8. Caps: none.
The words teach the lessons: set 9 core is all multiplicative; set 8 rule / first term / grow fit extending by a rule;
set 7 odd fits 4.OA.C.5 (grow and odd are notWith and never dealt together). C2 is 7 because of defect 1.
Pins:
- G4 cycle "product": **accept** (the units digits of products are what cycles).
- growing "equation": **accept** as a non-core word; it does not teach growing shapes, so swap it when a fitting picture exists.
- times as many "compare" (additive difference arrow): **accept** as a non-core word. It shows the additive contrast of
  4.OA.A.2, but the explain says "by how much"; replace it when a multiplicative compare picture exists.
- times as many "unknown" (8 + ? = 13): **accept**. A 3 × ? picture would clash with factor.

## Identify lesson band: C1 8 · C2 8 · C3 8 · C4 8. Three pictures, three words, the key matches.

## Verdict: FAIL. Minimum score 7 (Pictures C2, Grade 4 sets C2).

## Automatic checks
1. Derivation rules in `derivedFromBody`: a rising arithmetic run gives **grow**, and a run whose step equals a library
   picture's "+d" gives **rule**. Then V5/V7 must fail the term/grow and term/rule deals in sets 7 and 8.
2. A word-in-picture lint: every noun a picture's explain points at ("ones digits", "dots", "box") must be drawn in that
   picture. Use a referent list for each picture id.
3. Explain-referent overlap: if a word's explain names a mark ("in the box") that another dealt picture also draws, fail
   unless notWith.
4. Host probe after Check: `document.activeElement` is not a vocab slot, and no caret shows inside a wrong box.

## Speed-ups
- When a word is swapped into a set, run the derived look-alike table for the new word against every picture of that
  set in the same change. Here, grow vs number runs would have shown up before the critic.
- Have the harness render all three changed sets (Match 3 + pick3) every time, so the critic does not re-render them.
