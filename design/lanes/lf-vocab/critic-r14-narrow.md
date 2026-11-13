# lf-vocab round 14: narrow critic r14 (Q-S2 re-check)

Critic: independent, Opus medium. Graded: hosts/ (both skills), answered/ (right and wrong, card-390, worksheet-1280, quiz-1280),
the independent keys, pictures/pics-40 (47 pictures), sets/set0-10 on both skills (pupil and key; every bank of sets 5, 7 and 8),
ALL 180 banks in sets/manifest.json `dealtBanks`, and lesson/identify-L. Read vocab-words.js (`explain`, `notWith`) and
vocab-pictures.js (focal / halo / key underlay). size-proof.txt read: the 8 same-word SIZE-INK runs are OK; the 4 SIZE-REF
findings are not scored (lead ruling).

## Re-check of r13 defects
1. ones digit read "odd": **FIXED**. 47[6] is even; set 8 {rule, odd, ones digit} now has no defensible second word.
2. digit read "ten": **FIXED**. Set 5 splits {digit, expanded form, number name} / {hundred, ten, one}; no bank pairs 4(7)2 with a
   place word (set 5 pupil and key, both skills).
3. grow read "rule": **FIXED**. grow / rule notWith; set 7 deals grow with first term, repeat, equation; set 8 with ones digit,
   term, repeat. None is defensible (term for a tower is weak, not counted).

## Match 3 screens: 8 · 8 · 8 · 8. Caps: none.
Quiz wrong: both wrong letter boxes red and dashed, right box green-ticked, no blue ring on a red box; only the wrongly matched
pictures glow (r8 design), letters beside them lit. The 100 px worksheet tile holds the picture and the answer box above the fold.

## Pick3 screens: 8 · 8 · 8 · 9. Caps: none.
Wrong word stays red on the answer line, the right pill glows yellow, the explanation names it. Picture now fits its paper box.

## Next box (O-1): 8 · 8 · 8 · 8. Blue on the pick3 answer line (quiz-1280) and on the first Match 3 box; never on a pill or red box.

## Keys: 9 · 9 · 8 · 8. One grey underlay per dot group and bracket. Defect 2 below.

## Explanations (R-2): 8 · 9 · 9 · 9. Every referent is drawn.

## Pictures (O-2 / O-3): 8 · 8 · 8 · 9
Every picture checked against every bank it is dealt in. One defensible second word, minor:
| picture | word | banks |
|---|---|---|
| sequence (5, 10, 15...) | **cycle**: in the units-digit-cycle lesson the ones digits read 5, 0, 5 and the ellipsis says it goes on | set 6 {product, sequence, cycle} (pick3 key item 4) |
Weak, not counted (as r13): repeat as rule / multiple, array as product, equal groups as product, term for a grow tower, ten as one.

## Sets 0-10: 8 · 8 · 8 · 8. Caps: none.
C1: each set's words teach its lesson; the four r10 pins stay accepted. C2: clean apart from the sequence / cycle row above.
Defect 3 (set 5 repetition) is C1 minor.

## Identify lesson band: 8 · 8 · 8 · 8. Unchanged; no place word against 4(7)2.

Out of scope, noted: the open lead ruling on Match 3 Guided at L.

## Defects (all minor)
1. **C2, set 6.** sequence 5, 10, 15... can be read as cycle (ones digits 5, 0, 5). Fix: draw a run whose visible ones digits
   do not repeat (e.g. 4, 7, 10...) and update the explanation, or add cycle to sequence's notWith both ways and re-pick set 6 in place.
2. **C4, keys.** Hundred chart (set 4 pick3 key item 1): the per-text key underlays (width n x 0.62 x fs) are wider than the
   3-digit cells, so rows 104 and 114 grow grey lobes outside the grid, with white specks in the cell corners, and the whole chart
   is grey. Fix: clip a text underlay to its cell (or underlay the cell rect, not the glyphs), and give the hundred chart a focal
   part (one row) instead of `focal: 'all'`.
3. **C1, set 5 Match 3.** With two trios a 4-item page repeats each trio; items 2 and 3 show the same pictures in the same
   A/B/C places (only the word order changes). Fix: when a trio repeats on a page, permute its picture order too.

## Verdict: PASS. Minimum score 8.

## Automatic checks
- Defect 1: V-TWIN / V-NUM extended to ones-digit readings: a run with `step:k` where k divides 10 (or whose visible ones digits
  repeat) adds feature `ones-cycle`, which satisfies cycle unless notWith. Backtest: fails set 6 bank {product, sequence, cycle}.
- Defect 2: key lint: every key underlay's bbox lies inside the bbox of its focal group (+0.5 mm); a `focal: 'all'` picture whose
  underlay covers > 60 % of its area is flagged. Backtest: fails the hundred chart key.
- Defect 3: page lint: no two items on one page share the same (picture, letter) mapping set. Backtest: fails set 5 Match 3 p1.

## Speed-ups
- The marks / parity / places / runs columns made the 180-bank pass quick; add a `onesDigits` column for runs.
- Render one key per picture with `focal: 'all'` in a strip so underlay overflow is seen in one image.
