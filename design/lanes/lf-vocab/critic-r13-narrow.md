# lf-vocab round 13: narrow critic r13 (Q-S2 re-check)

Critic: independent, Opus medium. Graded: hosts/ (both skills), answered/ (right and wrong), the independent keys, pictures/pics-40
(47 pictures), sets/set0-10 on both skills (pupil and key), ALL 234 banks in sets/manifest.json `dealtBanks`, and lesson/identify-L.
Read vocab-words.js (`explain`, `notWith`, defs) and vocab-pictures.js (`PIC_FEAT`, V-NUM in `vocabReadFeatures`).

## Re-check of r12 defects
1. row reads "even": **FIXED**. Row rings 3, 6, 9, 12 (odd and even); In/Out is In 2, 3 / Out 5, 6.
2. row / column read "product": **FIXED**. Product is out of set 0 (factor in); no dealt bank holds product with row or column.
3. first term / rule: **FIXED** for first term (rule is notWith it; no set 7 or 8 bank pairs them). The class survives on a third
   run picture, grow (defect 3 below), because the fix was a hand pin, not the derived `run + step` implies rule.

## Match 3 screens: C1 8 · C2 8 · C3 8 · C4 8. Caps: none.
Quiz wrong: both wrong letter boxes red and dashed, right box green-ticked, no blue ring on a red box. Yellow is used only for R-1.

## Pick3 screens: C1 8 · C2 8 · C3 8 · C4 9. Caps: none.
The wrong word stays red on the answer line; the right pill glows yellow; the explanation names it. Check shows no caret.

## Next box (O-1): 8 · 8 · 8 · 8. On pick3 the blue box is on the answer line (quiz-1280), never on a pill or a red box.

## Keys: 9 · 9 · 9 · 8. One grey underlay per dot group and per bracket; answers in key ink on the line.

## Explanations (R-2): 8 · 9 · 9 · 9. Every referent is drawn.

## Pictures (O-2 / O-3): C1 8 · C2 **7** · C3 8 · C4 9
Every bank in the manifest was judged. Defensible second words:
| picture | defensible word | dealt banks |
|---|---|---|
| ones digit (47[3]) | **odd**: the one boxed number is 3, and 473 is odd; ones digit decides odd/even, which is the 4.OA.5 lesson | set 8: {rule, odd, ones digit}, {odd, ones digit, term} |
| digit (4(7)2, the 7 ringed) | **ten**: the ringed 7 is the tens digit ("7 is in the tens") | set 5: {digit, number name, ten}, {digit, hundred, ten} (seen on set 5 key item 5) |
| grow (towers 1, 3, 5) | **rule** ("add 2 squares"): the same constant-step run that made first term read as rule | set 7: {grow, repeat, rule}, {grow, rule, equation}; set 8: {rule, ones digit, grow}, {rule, repeat, grow} |
Weak, not counted: repeat as rule/multiple, array as product, product as total, expanded form as hundred, input as rule.

## Sets 0-10: C1 8 · C2 **7** · C3 8 · C4 8. Caps: none.
- C1: each set's words teach its lesson (multiplication-table patterns, input-output, properties, two-step, count to 120, read to
  1,000, units-digit cycle, shape and number patterns, multiplicative compare, remainders). The four r10 pins stay accepted.
- C2: 7, from the three rows above. Sets 0, 1, 2, 3, 4, 6, 9 and 10 are clean.

## Identify lesson band: 8 · 8 · 8 · 8. Unchanged and correct (place / ones / digit, no place word dealt against 4(7)2).

Out of scope, noted: the open lead ruling on Match 3 Guided at L.

## Defects
1. **major (C2).** ones digit 47[3] is dealt with odd in set 8. V-NUM only fires on two or more marked numbers. Fix: box an even ones
   digit (e.g. 47[6]; no set deals ones digit with even), or add odd to ones digit's notWith both ways, then re-pick set 8.
2. **major (C2).** digit 4(7)2 rings the tens digit and is dealt with ten (set 5). Fix: add ten, hundred and one to digit's notWith
   (both ways) and re-pick set 5 in place, or redraw digit so the marked digit has no place (a digit card 0-9 strip with one ringed).
3. **minor (C2).** grow (1, 3, 5 squares, step 2) is dealt with rule in sets 7 and 8. Fix: declare grow's run (`rising-run`, `step:2`)
   in PIC_FEAT and derive rule from `run + step:n`; then notWith rule/grow, and re-pick sets 7 and 8 (grow and rule are both core in
   4.OA.5, so keep them in different trios).

## Verdict: FAIL. Minimum score 7 (Pictures C2, sets C2).

## Automatic checks
- Defect 1: V-NUM on ONE marked number too: a single ringed or boxed digit adds `marked-even` / `marked-odd`, which satisfies even /
  odd. Backtest: fails set 8 bank {rule, odd, ones digit}.
- Defect 2: V-PLACE: a picture that rings or boxes a digit inside a multi-digit number adds feature `place:<ones|tens|hundreds>`, which
  satisfies one / ten / hundred. Backtest: fails set 5 bank {digit, hundred, ten}. The same feature fires on ones digit (place:ones),
  correctly with no `one` dealt there.
- Defect 3: V-TWIN extended to every run picture: grow's counts (1, 3, 5) must be read from its tower heights, and any picture whose
  features hold a run with a constant step implies rule unless notWith. Backtest: fails set 7 bank {grow, repeat, rule}.

## Speed-ups
- The dealt-banks table in manifest.json made a full 234-bank pass possible in one sitting; keep it, and add a column with the
  numbers each picture marks and their place, so number readings show without opening the picture.
- When a check has a threshold (V-NUM's ">= 2 marked"), backtest the boundary case (one marked number) in the same change.
