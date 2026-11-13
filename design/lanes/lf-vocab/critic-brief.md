You are the INDEPENDENT CRITIC, round 1, of lane lf-vocab (MathQuest lessons-first wave 1): the owner's vocabulary
redesign. You did not build this work. Step: critic r1 of a first build of a new drawing family (Opus medium).

Repo: /home/user/MathQuest (branch claude/sweet-newton-c8wrv1-lf-vocab; the lane's manifest is applied in the working
tree for testing). Do NOT edit any repo file. Write only your report to RENDERS_DIR/critic-r1.md.

Read, in this order:
1. design/audit/RUBRIC.md (whole: C1-C4, the hard caps H1-H13, §6.1 visual-quality questions).
2. design/audit/VISUAL_QUALITY.md, and WORKSHEET_DESIGN_STANDARD.md §18 (the VQ rules) plus the rules the card quotes.
3. The signed card, design/cards/vocabulary/vocabulary.md (signed by the owner 2026-11-07). Its owner rulings
   include: Q1, role:lesson is OUT OF SCOPE for the two vocabulary skills (their lesson is the lesson part vocab-page);
   Q2, the page counts 4 (Match 3), 4 / 6 / 8 (1 picture, 3 words at K-1 / grades 2-3 / grades 4-5) are the owner's.
4. The owner's design: design/IMPROVEMENT_PLAN.md section "Vocabulary redesign and the graphic library".
5. For reference only: js/modules/sheet/graphics/vocab-pictures.js, js/modules/sheet/cells/vocab-match3.js,
   js/modules/sheet/cells/vocab-pick3.js, js/modules/sheet/lesson-pages/vocab-words.js and vocab-pages.js.

Grade the renders in RENDERS_DIR (PNG files; read every one you grade):
- pictures/pics-34.png, pics-40.png, pics-74.png: all 47 library pictures at the widths they are used at (red labels
  are NOT part of the drawing; they name the word for you). Judge each picture: does it show its word unambiguously
  to a grade 1-4 ELL / special-education pupil, black and white, clean strokes, readable text, never printing its own
  word? List every picture below 8 with the reason.
- skill/<size>/vocabulary__<skill>/: the two skills (vocab_grade_pictures = Match 3 pictures; vocab_pick3_words =
  1 picture, 3 words) on independent, more-practice, test, guided, error-analysis at S, M and L (pupil page and key),
  plus the screen hosts card-390 / card-820 / card-1280, worksheet-1280 and quiz-1280.
- grades/: 1 picture, 3 words at grade 1, 2, 3 and 4 (owner counts above), at L.
- lesson/: the lesson vocabulary page (lesson part vocab-page) for the pilot lesson "Patterns on the multiplication
  table" (grade 3) at M and L, and for the grade 1 and grade 4 sets, each with its key.

For each artefact group give C1-C4 scores (integers), the hard caps hit, and a numbered defect list (what, where, the
rule id, a concrete fix). Verdict PASS only if every criterion is >= 8 on every page type and host you graded; else
FAIL. End with (a) the automatic checks that would have caught each defect and (b) speed-ups for the next round.
Keep the report under 1,500 words. Return the verdict line, the minimum score and the defect list in your final message.
