# lf-vocab: narrow critic r14 brief (the Q-S2 re-check after round 14)

You are the INDEPENDENT CRITIC of lane lf-vocab's round 14 build. You did not build it, and you did not grade any earlier
round. Step: a narrow critic (Opus medium). Do NOT edit any repo file. Write only RENDERS_DIR/critic-r14-narrow.md.

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
- The previous narrow report, design/lanes/lf-vocab/critic-r13-narrow.md. Re-check every defect in it and say FIXED,
  PARTLY fixed or PERSISTS for each.
- js/modules/sheet/lesson-pages/vocab-words.js (`explain`, `notWith`) and js/modules/sheet/graphics/vocab-pictures.js
  (`alsoShows`, `vocabPictureDerived`).

## Grade the renders in RENDERS_DIR
- hosts/<skill>/: card-390, card-820, card-1280, worksheet-1280, quiz-1280 (look at the blue next box; on pick3 it is on
  the answer line), and independent-key-p1 (the grey key highlight: one underlay per dot group).
- answered/<skill>/: right and wrong answers on card-390, worksheet-1280 and quiz-1280, full page. In the Match 3 quiz,
  EVERY wrong letter box must be red, and the blue ring must never sit on a wrong box.
- pictures/pics-40.png (term and first term are redrawn): the 47 library pictures at 40 mm. For EVERY picture, answer: "could a pupil defend another bank
  word for it?" Check against the words of the sets it is dealt with (vocab-words.js). List each yes, with that word.
- sets/set<i>/<skill>/: EVERY vocabulary set (sets 0-10), rendered on both skills (independent at L, pupil and
  key), by tests/scripts/ws-vocab-set-renders.mjs. Round 14 (focus: sets 5, 7 and 8, the three r13 clashes): ones digit is now 47[6]; digit is notWith one / ten / hundred (set 5 splits {digit, expanded form, number name} / {hundred, ten, one}); grow and rule, and sequence and rule, are notWith; new checks V-NUM (a single mark), V-PLACE, V-TWIN over every run. The dealt-banks table (sets/manifest.json, now 180 banks) carries each picture's marked numbers, parity, places and runs. The screen pick3 picture now fits its paper box (it was 81 % of print) and the Match 3 worksheet tile is 100 px. Grade every bank of sets 5, 7 and 8; spot-check the rest. KNOWN FINDINGS (lead ruling): 4 ws-screen-ink-size SIZE-REF findings at defaults are a gate coverage gap; check the same-word proof in RENDERS_DIR/size-proof.txt (re-run any line yourself if you doubt it) and do not score them. Round 13: "1 picture, 3 words" now deals ONLY from each set's two vetted trios, so every bank a pupil can see is listed in sets/manifest.json (the dealt-pairs table, 234 banks). Grade EVERY bank in that table, not a sample: for each, could a pupil defend another of its three words for the picture? Row now rings 3, 6, 9, 12; the In/Out table is In 2, 3 / Out 5, 6; set 0 product -> factor, set 7 term -> repeat, set 8 first term -> odd; new checks V7-ALL, V-NUM, V-TWIN, a times table implies product. Round 12: product / multiple and term / rule are kept apart, multiple is also defined as a boxed answer with a times sign, sets 0, 6 and 7 are re-picked in place, a new check V-STD reads each set's standard text for its clashes, and Check blurs every vocab slot (no caret). Round 11 replaced the look-alike rules with a feature model (V-FEAT:
  pictures declare what they draw, words declare what defines them). Term is now 18, [14], 10, first term [30], 25, 20,
  and the cycle and unknown explanations are rewritten. For EVERY set, answer: could a pupil defend another dealt word
  for any picture? List each yes. Also judge C1 (do the words teach the lesson?). The four misfit pins the r10 critic
  accepted stay accepted.
- lesson/identify-L-pupil-1.png and -key-1.png (or the files in lesson/): the place-value identify lesson's vocabulary band (rendered by the new
  tests/scripts/ws-lesson-render.cjs).

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
