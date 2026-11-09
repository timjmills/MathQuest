# lf-vocab: narrow critic r6 brief (owner additions R-1 and R-2)

You are the INDEPENDENT CRITIC of lane lf-vocab's round 7 build: the owner's additions R-1 and R-2. You did not build
it. Step: a narrow critic (Opus medium). Both skills passed critic r5 (min 8) on every page type. This round grades ONLY
the screen hosts and the key pages. Do NOT edit any repo file. Write only RENDERS_DIR/critic-r6-narrow.md.

## Read
- design/audit/RUBRIC.md: C1-C4 and the hard caps; the screen-host rows.
- The signed card, design/cards/vocabulary/vocabulary.md: the owner rulings R-1 and R-2 (2026-11-09), Q-C, and OQ-1.
  - R-1: after an on-screen answer, the picture's focal part gets a thick highlight and the correct word glows yellow.
    Before the answer, and on the printed pupil page, everything is black and white. The printed key shows the
    highlight in the single grey.
  - R-2: on a wrong screen answer, "The answer is <word>! <Word> means ..." appears: one kid-friendly reason tied to
    the picture, read aloud, muted by the sound toggle.
- js/modules/sheet/lesson-pages/vocab-words.js, the `explain` field of every word. Judge every explanation: is it
  kid-friendly, true, and never contradicting its picture?

## Grade the renders in RENDERS_DIR
- hosts/vocabulary__vocab_grade_pictures/ and hosts/vocabulary__vocab_pick3_words/:
  - card-390, card-820, card-1280, worksheet-1280 and quiz-1280, before an answer;
  - independent-key-p1, the printed key with the grey focal highlight;
  - independent-p1, the pupil page, for comparison only. The machine check pins it as byte-identical to the r5 PASS.
- answered/<skill>/: answered-right-390, answered-right-1280, answered-wrong-390, answered-wrong-1280.

## Known from the builder, to judge
- On the practice card, a wrong answer shows the support ladder's "Here is how" under the explanation.
- Match 3 shows one "The answer is <word>!" line for each wrongly matched word.
- In the quiz, a 1 picture, 3 words tap is saved only on Next, so the quiz shows feedback for Match 3 only.

## Output
For each group (Match 3 screens, pick3 screens, keys, the explanations), give:
- C1-C4 (integers);
- the hard caps hit;
- numbered defects with a concrete fix.

Verdict: PASS only if every criterion is >= 8 everywhere you graded.

End with:
- the automatic check that would catch each defect;
- speed-ups.

Keep it under 900 words. In your final message, return the verdict, the minimum score and the defect list.
