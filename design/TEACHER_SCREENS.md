# Teacher screens — owner rulings (2026-09-26)

The teacher side is organised around **three kinds of paper** (see `design/LESSON_LIBRARY_PLAN.md` §8e): **Practice**,
**Quiz** and **Lesson**. These rulings simplify the screens to match.

## Home screen

Owner: "the home screen is a bit too complicated. We only need: make skill sheet, make mixed review, make quiz, make
lesson, send practice code, practice map. (The skill sheet and mixed review are in reality the same practice sheets
with different default options.) Skills get weighted equally in mixed review unless chosen otherwise. The thumbnail view
and list view should be present throughout. Try to make it easy to navigate. Try to simplify and make visual. For
thumbnails try to have three columns instead of the two you now use."

The home screen shows **six large, visual actions** and nothing else competing with them:

| Action | Opens | Defaults |
|---|---|---|
| **Make skill sheet** | the Practice paper | one skill (→ "I Can" title), versions 1, size M |
| **Make mixed review** | the same Practice paper | several skills, **equal weights** (each skill's weight is still editable), "Mix in prerequisite skills" available |
| **Make quiz** | the Quiz paper | scored, versions A / B |
| **Make lesson** | the Lesson paper (the lesson library) | all parts; choose parts to print; "New numbers" per part |
| **Send practice code** | the share-code / send screen | — |
| **Practice map** | the pupil practice map | — |

- Each action is a big tile with an icon, a one-line purpose and a picture of the paper it makes (a thumbnail), in the
  app's cohesive teacher/student style. Touch targets ≥ 44 px; phone, tablet and desktop layouts.
- Everything else (sets, progress, settings, quizzes list) moves out of the home screen into a small secondary menu.

## Browsing skills, sets, lessons

- **Thumbnail view and list view everywhere** a teacher picks from many things (skills library, the skill picker inside
  each paper, saved sets, the lesson library), with the same toggle in the same place, remembered per teacher.
- **Thumbnails in three columns** (was two) on desktop; fewer columns only where the screen is too narrow (tablet 2,
  phone 1) — never a horizontal scroll.
- The thumbnail shows the real first page (or the screen card) of that skill / set / lesson.
- One consistent search-and-filter bar (grade, domain, WRM / CCSS / EE code, text).

## Papers

- The Print screen shows the three paper cards (Practice, Quiz, Lesson) with their options — `LESSON_LIBRARY_PLAN.md` §8e.
- Practice options: skills (one or more, each with a **weight**, default equal), **mix in prerequisite skills** (lists
  every prerequisite, none ticked), versions A / B / C…, fact columns 5–10, timed check, size S / M / L.
- Quiz: scored, versions, size. Lesson: all parts required; tick parts to print; "New numbers" per part.

## Quality bar

Teacher screens are graded by an independent critic like everything else (≥ 8 on every criterion): screenshots at
1280 / 820 / 390 px, every action clicked through to a built paper, keyboard and touch use, no console errors.
