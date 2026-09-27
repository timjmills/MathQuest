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

## Make quiz (owner, 2026-09-26)

"For make a quiz it can be done by CCSS domain, specific CCSS or EE standards, by WRM units, lessons etc. — can be tagged
to. Questions can be tagged to specific standards. But you can use the same practice paper engine, just with score /
custom score per problem / type of problem and the tagging of problems."

- **Same engine as Practice.** A Quiz is a Practice paper with scoring and tags switched on — no separate quiz renderer.
- **Build it from what you teach to:** pick by **CCSS domain** (e.g. 3.NBT), **specific CCSS standards or lettered parts**,
  **EE standards**, **WRM year → block (unit) → small step**, or **lessons** in the library — or plain skills. The
  quiz finds the skills tagged to that choice (`skillsForStandard`, `skillsForWrmStep`, the lesson library) and adds
  them with equal weights (editable, as in Practice).
- **Every question is tagged** to its standard(s): CCSS code / part, EE code, WRM step. The tag prints small on the
  teacher key (and in the score summary), never on the pupil page (HD-6: codes only in the footer / key).
- **Scoring:** a default score per question (1), a **custom score per question**, or a **score per type of question**
  (e.g. all 2-step word problems = 3 points); the total and a per-standard subtotal print on the key and the score box.
- Versions A / B… with new numbers; size S / M / L (floors §8a).
- The key adds a **standards breakdown**: points per CCSS / EE / WRM step, so the teacher sees which standards a pupil
  missed.

## Selecting skills — gallery + saved sets (owner, 2026-09-27; RECORDED, NOT YET BUILT)

Owner: "whenever selecting problems for print, quiz, practice, etc. it should always show the gallery screen by default
with thumbnails with options for big 3, medium 4, small 5 across, search bar, grade and domain and topic selection. So
it's easy to select skills for the set. Then the set automatically saves in the browser unless deleted. There should be
a sets area to see all the sets and to select for different things. Lesson selection will be different but can still
use thumbnail view as well. Don't do this now. Just record."

- **Gallery by default.** Every place a teacher picks skills (Practice paper, mixed review, Quiz, Send practice code,
  practice) opens the gallery of skill thumbnails first.
- **Thumbnail size choice:** Big = 3 across, Medium = 4, Small = 5 (on desktop; fewer where the screen is too narrow,
  never a horizontal scroll). The list view stays available.
- **Filter bar:** a search box plus Grade, Domain and Topic selection (the shared search also accepts WRM / CCSS / EE
  codes).
- **The set saves itself.** The skills chosen form a set that is saved in the browser automatically (localStorage, like
  today's teacher sets) and stays until the teacher deletes it.
- **Sets area.** One place lists every saved set (thumbnails or list); a set can be picked for any paper, quiz or
  practice code.
- **Pick many at once** (owner, 2026-09-27): in both thumbnail and list view the teacher can select several skills in one go (tick each card or row, shift-click a range, "Select all shown" for the filtered view), then add them to the set together.
- **Lessons are picked separately** (the lesson library has its own picker), which may also use thumbnails.
- Owner: the teacher-UI lane builds this when work resumes; it supersedes "three columns" below.

## Browsing skills, sets, lessons

- **Thumbnail view and list view everywhere** a teacher picks from many things (skills library, the skill picker inside
  each paper, saved sets, the lesson library), with the same toggle in the same place, remembered per teacher.
- **Thumbnails in three columns** (was two) on desktop; fewer columns only where the screen is too narrow (tablet 2,
  phone 1) — never a horizontal scroll. *(Superseded 2026-09-27 by the Big 3 / Medium 4 / Small 5 choice above.)*
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
