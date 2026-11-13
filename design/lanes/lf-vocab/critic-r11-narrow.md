# lf-vocab round 11: narrow critic r11 (Q-S2 re-check)

Critic: independent, Opus medium. Graded hosts/ (both skills), answered/ (right and wrong, card-390, worksheet-1280,
quiz-1280), the independent keys, pictures/pics-40 (47), sets/set0-3, 6-10 (both skills, pupil and key), lesson/identify-L.
Read the VOCAB_DEFS / VOCAB_FEATURES feature model, `explain` and `notWith`.

## Re-check of r10 defects
1. term / first term read as grow and rule: **FIXED**. term is 18, [14], 10 and first term is [30], 25, 20: falling runs
   with steps 4 and 5. Neither grows, neither shows +3. Sets 7 and 8 deal them with grow and rule, and no clash is left.
2. cycle explain referent: **FIXED**. "circle, square, triangle, diamond, circle" is what the picture draws.
3. unknown "the one in the box": **FIXED**. It now reads "the ? in the box", and only the unknown picture draws a ?.
4. Caret in a red box after Check: **PERSISTS (moved)**. answered-wrong-worksheet (Match 3), card 3 still shows a text
   caret inside the empty red "identity" box. That card has the focus ring after Check.

## Match 3 screens: C1 8 · C2 8 · C3 8 · C4 8. Caps: none.
In the quiz, all wrong boxes are red and dashed, the right box gets a green tick, and the blue ring is never on a red box.
The yellow highlight follows one rule everywhere: the right word glows, and the picture of a missed word is lit.
1. minor (defect 4 above). Caret in the red box. Fix: on Check, call `blur()` on the focused vocab slot and set
   `caret-color: transparent` on `.is-wrong` slots (additive CSS).

## Pick3 screens: C1 8 · C2 9 · C3 8 · C4 9. Caps: none.
## Next box (O-1): C1 8 · C2 8 · C3 8 · C4 8. On pick3 the blue box is on the answer line; on Match 3 it is on the first
empty slot. It is never on red.
## Keys: C1 9 · C2 9 · C3 9 · C4 8. One grey underlay per dot and per group; the Step labels are barred; letters are correct.
## Explanations (R-2): C1 8 · C2 9 · C3 9 · C4 9. Every referent named is drawn (term "the 14", first term "the 30",
cycle shapes, unknown "?").

## Pictures (O-2 / O-3): C1 8 · C2 7 · C3 8 · C4 9. Caps: none.
Could a pupil defend another bank word for a picture?
| picture | defensible word | dealt together |
|---|---|---|
| product (4 × 3 = [12]) | **multiple**: 12 is a multiple of 4 and of 3 (4.OA.B.4 says so in those words) | set 6 pick3 item 1 (multiple / product / ones digit); set 9 Match 3 item 3; set 0 core |
| term (18, [14], 10) | rule ("take 4"), weak | set 8 items 1, 4; set 7 item 2 |

Every other picture passes, including the redrawn term and first term against grow, sequence, multiple and pattern
(all notWith or not defined by a falling run).
2. **major (C2 -1).** product / multiple. `VOCAB_DEFS.multiple` only counts hops or skip-counting, so the feature model
   misses that a product is a multiple of its factors. On a pick3 item that offers both words, a pupil who writes
   "multiple" is right in maths but marked wrong. Fix: add `'multiple'` to product's notWith and `'product'` to multiple's
   notWith, plus a def rule `multiple: [['boxed-answer','times-sign']]`. Then re-pick the trios in sets 0, 6 and 9
   (set 6: {product, cycle, ones digit} / {multiple, sequence, repeat}; set 9: move multiple into the compare/unknown
   trio). The set 9 core already does that.
3. minor. The term picture can read as the rule "take away 4". Not a fail: the rule word means the op box. If it is
   worth closing, add `rule` to term's notWith (set 8 still has {term, repeat, ones digit}).

## Grade 4 changed sets (6-10): C1 8 · C2 7 · C3 8 · C4 8. Caps: none.
- C1: set 7 (4.OA.C.5: odd, term, first term, rule, grow, equation) and set 8 (rule, first term, term, repeat, grow,
  ones digit) teach extending by a rule. Set 6 teaches the cycle of ones digits. Set 9 is multiplicative. Set 10 is
  division (quotient, divisor, dividend, remainder, round up).
- C2: 7, because of defect 2 (sets 6 and 9). Sets 7, 8 and 10 have no clashes. The four r10 pins stay accepted.
- Grade 3 sets 0-3 were spot-checked: only product / multiple (set 0) is found.

## Identify lesson band: C1 8 · C2 8 · C3 8 · C4 8. The ringed 7 → digit, the HTO chart with T shaded → place,
and the rod with ringed ones → ones. The key lines match.

Out of scope, noted: Match 3 Guided at L (Model + one try) is still an open lead ruling.

## Verdict: FAIL. Minimum score 7 (Pictures C2, Grade 4 sets C2: product / multiple).

## Automatic checks
- Defect 2: a math-implication table in V-FEAT. `boxed-answer + times-sign` implies the feature set of `multiple` (and of
  `factor` for operands of a divide). `ws-vocab-unit` V5/V7 then fails any trio that holds both product and multiple
  unless they are notWith. Backtest: it must fail set 6 item 1 today.
- Defect 4: a host probe after Check. `document.activeElement` is not a `.vocab-slot.is-wrong`, and the computed
  `caret-color` of wrong slots is transparent. Run it on Match 3 worksheet and card.
- Defect 3 (optional): any run picture with a constant step implies `rule`, unless the word set marks rule as op-box only.

## Speed-ups
- Seed the feature model from the CCSS text of each set's own standard. 4.OA.B.4 ("a whole number is a multiple of each
  of its factors") names this clash outright, and a grep of the set's standard for pairs of its own bank words would have
  flagged it in round 1.
- The sets/ renders saved the whole re-render step. Keep them, and add a one-line "dealt pairs" table per set to
  manifest.json, so the critic does not have to read the trios off the images.
