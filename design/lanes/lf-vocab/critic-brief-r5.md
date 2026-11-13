# lf-vocab: critic r5 brief

You are the INDEPENDENT CRITIC, round 5, of lane lf-vocab (MathQuest lessons-first wave 1): the owner's vocabulary
redesign. You did not build this work, and you did not grade rounds 1 to 4. Step: critic r5, after a rebuild by a fresh
builder (r6) (Opus medium).

Repo: /home/user/MathQuest (branch claude/sweet-newton-c8wrv1-lf-vocab; the lane's manifest is applied in the working
tree for testing). Do NOT edit any repo file. Write only your report to RENDERS_DIR/critic-r5.md.

Read, in this order:
1. design/audit/RUBRIC.md (whole: C1-C4, the hard caps H1-H13, §6.1 visual-quality questions).
2. design/audit/VISUAL_QUALITY.md, and WORKSHEET_DESIGN_STANDARD.md §18 (the VQ rules) plus the rules the card quotes.
3. The signed card, design/cards/vocabulary/vocabulary.md (signed by the owner 2026-11-07). The owner's rulings are
   binding and are not defects:
   - Q1: role:lesson is OUT OF SCOPE for the two skills (their lesson is the lesson part vocab-page).
   - Q2: the page counts are 4 for Match 3 at EVERY size (so S prints 4, like M and L), and 4 / 6 / 8 for
     1 picture, 3 words (K-1 / grades 2-3 / grades 4-5).
   - Q-A: the footer names the dealt set's standards.
   - Q-B: on Letter at L, grades 2-3 print 4 a page (A4 stays 6).
   - Q-C: a page is scored per word, so a Match 3 page of 4 cells is /12.
   - OQ-1 (T-5.9): base-ten unit per item, larger when the item has no hundred.
4. The owner's design: design/IMPROVEMENT_PLAN.md, section "Vocabulary redesign and the graphic library".
5. Round 4's report, design/lanes/lf-vocab/critic-r4.md. Re-check every defect it lists (1-5, the nits and OQ-1) and say whether each
   is FIXED, PARTLY fixed or PERSISTS.
6. For reference only:
   - js/modules/sheet/graphics/vocab-pictures.js
   - js/modules/sheet/cells/vocab-match3.js
   - js/modules/sheet/cells/vocab-pick3.js
   - js/modules/sheet/lesson-pages/vocab-words.js and vocab-pages.js

Grade the renders in RENDERS_DIR. They are PNG files; read every one you grade.

- pictures/pics-34.png, pics-40.png, pics-70.png: all 47 library pictures at the widths they are used at. The red
  labels are NOT part of the drawing; they name the word for you. For each picture, ask: does it show its word
  unambiguously to a grade 1-4 ELL / special-education pupil? Is it black and white, with clean strokes and readable
  text, and does it never print its own word? List every picture below 8, with the reason.
- skill/<S|M|L>/vocabulary__<skill>/: the two skills on independent, more-practice, test, guided and error-analysis
  at S, M and L, each as a pupil page and a key. The two skills are vocab_grade_pictures (Match 3 pictures) and
  vocab_pick3_words (1 picture, 3 words). The L folder also has the screen hosts: card-390, card-820, card-1280,
  worksheet-1280 and quiz-1280.
- grades/g1..g4/: 1 picture, 3 words at grades 1, 2, 3 and 4, independent at L.
- lesson/: the lesson vocabulary page (lesson part vocab-page), pupil and key, each inside its OWN lesson (round 3's
  grade 1 and grade 4 renders borrowed the pilot's frame; those two sets have no lesson file yet, so their words are graded
  on grades/g1 and g4):
  - pilot-M, pilot-L: "Patterns on the multiplication table" (grade 3);
  - grade2-L: "Read and write numbers to 1,000" (grade 2);
  - props-L: "Properties of multiplication" (grade 3).

Owner ruling OQ-1 (2026-11-08, card T-5.9, signed 2026-11-09): when an item has no hundred, the base-ten one and ten may
use a larger unit; one scale within each item. Grade the base-ten pictures against it.

For each artefact group, give:
- C1-C4 scores (integers);
- the hard caps hit;
- a numbered defect list: what, where, the rule id, and a concrete fix.

Verdict: PASS only if every criterion is >= 8 on every page type and host you graded; otherwise FAIL.

End the report with:
- (a) the automatic check that would have caught each defect;
- (b) speed-ups for the next round.

Keep the report under 1,500 words. In your final message, return the verdict line, the minimum score and the defect
list.
