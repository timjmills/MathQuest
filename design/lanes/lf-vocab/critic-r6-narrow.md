# lf-vocab round 7: narrow critic (R-1, R-2)

Critic: independent, Opus medium. Graded: hosts/ (before answer), answered/ (right and wrong, 390 and 1280), the two
independent keys, and `explain` in js/modules/sheet/lesson-pages/vocab-words.js. Pupil pages: looked at for comparison only.

## Match 3 Pictures screens (vocab_grade_pictures)
C1 8 · C2 7 · C3 8 · C4 8. Hard caps: none. H4 does not apply: R-1 allows the yellow after an answer.

1. **major (C2 -2, C1 -1).** The wrong-answer line says "The answer is input!", but in Match 3 the word is given and the
   answer is a LETTER. The letter never appears on screen. After the answer, all three pictures glow at once
   (answered-wrong-390: A number line, B dot, C In column), so the glow does not link the word to its picture.
   On the worksheet (answered-wrong-1280) there is no retry, so the pupil never sees the right match.
   Fix: for the Match 3 skill, write the line as "Input is picture C! Input means ...". Glow only the pictures of the
   wrongly matched words, and put each letter beside its glow.
2. **minor (C1 -1).** The support ladder shown under the explanation goes back over what the explanation already
   said. In answered-wrong-390, rung 1 is "input means the number that goes in", word for word the line above it.
   Fix: when `.mq-vexplain` is shown, leave out the ladder's definition rung.

## 1 Picture, 3 Words screens (vocab_pick3_words)
C1 8 · C2 8 · C3 8 · C4 9. Hard caps: none.

3. **minor (C1 -1).** The ladder gives a weaker hint after the answer has been shown. In answered-wrong-390 and
   answered-wrong-1280 (items 2 and 3), "The answer is step!" is followed by "1. Its word starts with "s"" and
   "3. Type "____" on the line". A blank in quotation marks tells the pupil nothing. Fix: when the explanation is
   shown, drop the first-letter rung and put the word into rung 3 ("Type step on the line").
4. **minor.** In answered-wrong-1280, items 2 and 3 show "Here is how", but item 1 (the active card) does not. One
   wrong state should look the same on every card. Fix: give the active card the same ladder, or none on every card.
5. **minor.** The wrong word stays on the line with no wrong mark ("product" in answered-wrong-390, "total" and
   "unknown" in answered-wrong-1280), and the tapped pill is not marked either. Only the badge shows the error. Fix:
   put the slot's existing wrong outline (box-wrong) on the line.

## Printed keys (independent-key-p1, both skills)
C1 9 · C2 9 · C3 9 · C4 8. Hard caps: none. Every key answer is checked and correct. The focal highlight is the single
grey, and only the key has it.

6. **minor (C4 -1).** The grey halo is stroked round glyphs and small marks, which blurs them. The "+2" labels in
   pick3 key item 5 and every dot of the array in Match 3 key item 1 look smudged at print scale. Fix: draw a grey
   underlay box behind text labels, or a thinner halo, not a stroke round each glyph or dot.

## The explanations (vocab-words.js `explain`)
C1 8 · C2 8 · C3 9 · C4 9. Every word has an explanation, every explanation names its word, and I found none that
contradicts its picture: array 3 rows of 4, multiple in threes, left: four, equal groups of 4, identity 5 stays 5.

7. **minor (C1 -1).** The words "figure" and "figures" (digit, ones digit) are hard for ELL pupils. "Times as many
   means the same amount again and again" does not say what it is compared with. "Equal groups ... like 4" is too
   short to follow. Fix: "Digit means one of the numbers 0 to 9", "the number in the ones place", "Times as many
   means one bar is 3 of the other bar", "like 4 dots in each".

## Open question (does not cost points)
Before an answer, the 2026-10-04 owner rule makes the active answer box pulse yellow (card-390, card-1280, quiz-1280,
worksheet card 1). R-1 now uses yellow to mean "correct". That gives one colour two meanings. Ask the owner whether
the correct glow should use a different hue.

## Evidence gaps
- answered-wrong-1280 is cut off at 900 px, so the bottoms of the cells were not seen.
- There is no answered render of the quiz, so the builder's note that the quiz shows feedback for Match 3 only is
  unchecked. Add quiz-answered-wrong-1280.

## Verdict: FAIL. Minimum score 7 (Match 3 screens, C2).

## Automatic checks that would catch each defect
1. ws-vocab-unit: for vocab_grade_pictures, every wrong-word line matches /picture [A-C]/, and a wrong render glows
   only the pictures of the wrongly matched words.
2. and 3. Host probe: when `.mq-vexplain` is present, the ladder text holds neither the explanation sentence, a
   first-letter rung, nor a literal `"____"`.
4. Host probe: every wrong worksheet card shows the same set of feedback blocks.
5. Host probe: a wrong pick3 slot carries box-wrong.
6. Key lint: no `.mq-vhalo` stroke on `<text>`, and no halo stroke wider than a mark's own radius.
7. Lint `explain` against a list of words that are hard for ELL pupils ("figure", ...) and a minimum length.

## Speed-ups
- Render the answered states full-page, and add the quiz's answered state to the standard host set.
- Keep a per-skill feedback wording (Match 3 versus pick3) in the card. Then the "letter, not word" case is decided
  at the build brief, not found by the critic.
