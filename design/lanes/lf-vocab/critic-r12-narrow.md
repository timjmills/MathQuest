# lf-vocab round 12: narrow critic r12 (Q-S2 re-check)

Critic: independent, Opus medium. I graded hosts/ (both skills), answered/ (right and wrong), the independent keys, pictures/pics-40
(47 pictures), sets/set0-3 and 6-9 (both skills, pupil and key) and lesson/identify-L. I read the r12 diff of vocab-words.js,
vocab-pictures.js and gen-vocabulary.js.

Note: pick3 banks come from `_compatiblePick` over the WHOLE set, which is checked pair by pair against notWith. The set's two trios
order only Match 3. So every pick3 bank below crosses trios.

## Re-check of r11 defects
1. Caret in a red box after Check: **FIXED**. In answered-wrong-worksheet card 3, the three empty red boxes show no caret.
2. product / multiple: **FIXED**. The words are notWith both ways, and the def rule `['boxed-answer','times-sign']` is added. In sets 0, 6
   and 9 no bank holds both words (I checked every set pupil page).
3. term / rule: **PARTLY fixed**. term is notWith rule now, but the same clash survives on **first term**. Its picture ([30], 25, 20) is
   the same falling run with a constant step, and it is dealt with rule in set 7 (items 3 and 8: {grow, rule, first term},
   {odd, first term, rule}) and set 8 (item 2: {first term, rule, repeat}). Set 7's own comment puts {rule, odd, first term} in the
   core trio. This was fixed by a hand pin (`alsoShows.term += rule`), not by a feature, so the twin picture was missed.

## Match 3 screens: C1 8 · C2 8 · C3 8 · C4 8. Caps: none.
In the quiz, every wrong box is red and dashed, the right box gets a green tick, and there is no blue ring on a red box. The yellow
highlight works only under R-1.

## Pick3 screens: C1 8 · C2 8 · C3 8 · C4 9. Caps: none.
The wrong word stays red on the answer line. The right word glows yellow, and the explanation is read out.

## Next box (O-1): 8 · 8 · 8 · 8. On pick3 the blue box is on the answer line, never on the pills and never on a red box.

## Keys: 9 · 9 · 9 · 8. Each dot and each group has one grey underlay.

## Explanations (R-2): 8 · 9 · 9 · 9. Every referent is drawn.

## Pictures (O-2 / O-3): C1 8 · C2 **7** · C3 8 · C4 9
Could a pupil defend another bank word for a picture? Yes for:
| picture | defensible word | where dealt |
|---|---|---|
| row (table, ringed row **2, 4, 6, 8**) | **even**: every ringed number is even. Set 0's own standard 3.OA.9 says "4 times a number is always even". | set 0 pick3 item 4 {even, row, product} |
| row / column (times table) | **product**: every cell is a product. row is already notWith multiple for the same reason. | set 0 item 4; host worksheet item 5 {total, product, row}; set 0 item 1 {row, column, even} is fine |
| first term ([30], 25, 20) | **rule** ("take 5"), the twin of term / rule | set 7 items 3 and 8; set 8 item 2 |
| repeat (2 4 8 2 4 8) | multiple / term: weak, not counted | sets 6 and 8 |
All the other pictures pass.

## Grade 4 sets (6-9) and Grade 3 sets (0-3): C1 8 · C2 **7** · C3 8 · C4 8. Caps: none.
- C1: the sets still teach their lessons: set 6 is ones-digit cycles, sets 7 and 8 extend by a rule, set 9 is multiplicative compare.
- C2: 7. Set 0 has row / even (and product), and sets 7 and 8 have first term / rule. Sets 6 and 9 are clean now. The four r10 pins
  stay accepted.
- C3 (note, not a cap): set 0 Match 3 now repeats the same two trios with the words rotated (items 3 and 4 = items 1 and 2), so the
  12 marks test 6 matches twice. This is accepted as the EB-FOOT trade-off, but say so on the lane card.

## Identify lesson band: 8 · 8 · 8 · 8. Unchanged from r11 and correct.

Out of scope, noted: the open lead ruling on Match 3 Guided at L.

## Defects
1. **major (C2 -1).** The row picture rings 2, 4, 6, 8, and it is dealt with "even" (set 0 pick3 item 4). Fix: ring the third row
   (3, 6, 9, 12, which mixes odd and even), or add `even` to row's notWith and `row` to even's. Either way, re-pick set 0 in place.
2. **major (with 1).** The row and column pictures read as "product" (set 0 item 4, the grade-3 host item 5). Fix: add `product` to the
   notWith of row and column (and the reverse). With those pairs, product can sit only with even and odd, and then
   {multiple, row, column} clashes (row and column are notWith multiple). So set 0 has no clash-free split: replace product (sets 1-3
   already teach it) with a 3.OA.9 word that V7 can split, and re-check it with V-STD.
3. **minor (C2).** first term / rule (sets 7 and 8). Fix: add `rule` to first term's notWith (and the reverse), then re-pick sets 7 and 8.
   The better fix is to derive it: in V-FEAT, `*-run + step:n` implies `rule`, and then drop the term hand pin.

## Verdict: FAIL. Minimum score 7 (Pictures C2, sets C2).

## Automatic checks
- Defect 1: V-NUM. Each picture declares the numbers it marks (ringed or boxed). A derived feature `all-even` / `all-odd` maps to
  even / odd, and V5/V7 fail a bank that holds both. Backtest: it must fail set 0 seed 721973 item 4.
- Defect 2: a V-FEAT implication: `table + times-table` implies product (as it already implies multiple). Also extend V-STD to read
  "multiplication table" and "even" in 3.OA.9 against the set's own pictures, not only against word pairs.
- Defect 3: a twin rule. Any two pictures with the same feature class (`falling-run`, `step:n`) must have the same notWith against the
  other bank words. V-TWIN fails term ≠ first term on `rule`.
- Also: a pick3 bank audit. Enumerate every pair a set's `_compatiblePick` can deal (not only the trios) into manifest.json, and have
  V7 judge those pairs. The trio comments in vocab-words.js mislead, because pick3 ignores the trios.

## Speed-ups
- Write the dealt pairs table per set into manifest.json (asked for in r11 and still missing). It would have shown row+even straight away.
- When a clash is fixed by a hand pin, grep the feature list for pictures that share the pinned feature, and fix all of them in the
  same change.
