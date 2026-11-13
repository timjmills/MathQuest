# lf-vocab: narrow critic r7 brief (the Q-S2 re-check of R-1 / R-2, plus O-1, O-2 and O-3)

You are the INDEPENDENT CRITIC of lane lf-vocab's round 8 build. You did not build it, and you did not grade any
earlier round. Step: a narrow critic (Opus medium). Do NOT edit any repo file. Write only
RENDERS_DIR/critic-r7-narrow.md.

## Read
- design/audit/RUBRIC.md: C1-C4, the hard caps, the screen-host rows.
- The signed card, design/cards/vocabulary/vocabulary.md. Its owner rulings:
  - R-1: highlight the focal part and make the right word glow yellow, after the answer only; the key shows the
    highlight in grey.
  - R-2: the wrong-answer explanation, read aloud.
  - O-1: the next answer box is blue behind ONE switch; yellow is used only for R-1; a wrong box stays red.
  - O-2: each picture means only its word.
  - O-3: no picture fits another word in its bank.
- The previous narrow report, design/lanes/lf-vocab/critic-r6-narrow.md. Re-check its defects 1-7 and say FIXED,
  PARTLY fixed or PERSISTS for each.
- js/modules/sheet/lesson-pages/vocab-words.js (`explain`) and js/modules/sheet/graphics/vocab-pictures.js
  (`alsoShows`).

## Grade the renders in RENDERS_DIR
- hosts/<skill>/: card-390, card-820, card-1280, worksheet-1280, quiz-1280 (look at the blue next box), and
  independent-key-p1 (the grey key highlight).
- answered/<skill>/: right and wrong answers on card-390, worksheet-1280 and quiz-1280, full page.
- pictures/: the 47 library pictures at 40 mm. For EVERY picture, answer: "could a pupil defend another bank word
  for it?" List each picture where the answer is yes, with that word.
- lesson/identify-L-pupil-1.png: the place-value identify lesson's vocabulary band (ones / digit / place), redrawn
  under O-2.
- Also: /home/user/MathQuest/design/status/lf-vocab/r8/*.png (o1-*, o2-*).

## Out of scope
Every print page except the keys. The print pages passed critic r5, and the pupil pages are pinned by hash.

## Output
For each group (Match 3 screens, pick3 screens, the next box, keys, explanations, pictures, the identify band), give:
- C1-C4 (integers);
- the hard caps hit;
- numbered defects with a concrete fix.

Verdict: PASS only if every criterion is >= 8 everywhere you graded.

End with:
- the automatic check that would catch each defect;
- speed-ups.

Keep it under 1,000 words. In your final message, return the verdict, the minimum score and the defect list.
