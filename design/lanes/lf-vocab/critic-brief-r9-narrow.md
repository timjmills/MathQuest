# lf-vocab: narrow critic r9 brief (the Q-S2 re-check after round 9)

You are the INDEPENDENT CRITIC of lane lf-vocab's round 9 build. You did not build it, and you did not grade any earlier
round. Step: a narrow critic (Opus medium). Do NOT edit any repo file. Write only RENDERS_DIR/critic-r9-narrow.md.

## Read
- design/audit/RUBRIC.md: C1-C4, the hard caps, the screen-host rows.
- The signed card, design/cards/vocabulary/vocabulary.md. Its owner rulings:
  - R-1: highlight the focal part and make the right word glow yellow, after the answer only; the key shows the
    highlight in grey.
  - R-2: the wrong-answer explanation, read aloud.
  - O-1: the next answer box is blue behind ONE switch; yellow is used only for R-1; a wrong box stays red.
  - O-2: each picture means only its word.
  - O-3: no picture fits another word in its bank.
- Lead default for pick3: the blue "next" outline goes on the ANSWER LINE, not on the word pills.
- The previous narrow report, design/lanes/lf-vocab/critic-r7-narrow.md. Re-check every defect in it and say FIXED,
  PARTLY fixed or PERSISTS for each.
- js/modules/sheet/lesson-pages/vocab-words.js (`explain`, `notWith`) and js/modules/sheet/graphics/vocab-pictures.js
  (`alsoShows`, `vocabPictureDerived`).

## Grade the renders in RENDERS_DIR
- hosts/<skill>/: card-390, card-820, card-1280, worksheet-1280, quiz-1280 (look at the blue next box; on pick3 it is on
  the answer line), and independent-key-p1 (the grey key highlight: one underlay per dot group).
- answered/<skill>/: right and wrong answers on card-390, worksheet-1280 and quiz-1280, full page. In the Match 3 quiz,
  EVERY wrong letter box must be red, and the blue ring must never sit on a wrong box.
- pictures/pics-40.png: the 47 library pictures at 40 mm. For EVERY picture, answer: "could a pupil defend another bank
  word for it?" Check against the words of the sets it is dealt with (vocab-words.js). List each yes, with that word.
- g4/<skill>/: Grade 4 independent and guided pages. Three Grade 4 sets each changed one word this round:
  - growing patterns: pattern → total;
  - follow a rule: pattern → output;
  - times as many: equation → total.
  Judge them for O-3 and for C1 (do the words still teach the lesson?).
- lesson/identify-L-pupil-1.png and -key-1.png: the place-value lesson's vocabulary band.

## Out of scope
The other print pages passed critic r5 and are pinned by hash. Open lead ruling: Match 3 Guided at L holds the Model and
one try. Note it, but do not score it.

## Output
For each group (Match 3 screens, pick3 screens, the next box, keys, explanations, pictures, the Grade 4 sets, the band),
give:
- C1-C4 (integers);
- the hard caps hit;
- numbered defects with a concrete fix.

Verdict: PASS only if every criterion is >= 8 everywhere you graded.

End with:
- the automatic check that would catch each defect;
- speed-ups.

Keep it under 1,000 words. In your final message, return the verdict, the minimum score and the defect list.
