# lf-partopts — per-part "how many" and supports (lesson parts, Practice and Quiz papers)

| Date | Step | State |
|---|---|---|
| 2026-11-12 | 1 · design | `design/partopts/DESIGN.md` + mocks (`mock-lesson-desktop.png`, `mock-lesson-mobile.png`, `mock-quiz-supports.png`, source `mock.html`). Waiting for owner approval through the lead. No code changed. |

Findings while designing (master d34311d):
- 725 live skills; every one has the universal `level` option; 227 declare at least one `group: 'support'` option
  (25 the S2 `support` set); 498 declare none of their own.
- PT-DLG-10 (individual supports checklist) is specified but not built; role-drawn supports (traced answer, first-step
  cue, regroup boxes, PV letters, digit grid) follow `scaffoldLevel` only.
- Lesson parts / per-part seeds exist in the request (`parts`, `lessonSeeds`, LR-18) but have no screen control.

Spend this round: design only (see report to lead).

| Date | Step | State |
|---|---|---|
| 2026-11-12 | A · build (How many on every lesson part, Parts table) | `js/modules/sheet/part-opts.js` (partLimits, normalizePartOpts, …, exported through `sheet/index.js`); `partOpts` plumbed teacher-print `requestFor` → print-sheet `buildLesson` → lesson role (`lessonInput.partN`: chart / vocab / remember / We Do / rows), prereq slice, Practice cap in whole rows; `res.lesson.partFit` reports each part's fit (the ranges are measured, never typed). Lesson section's "Practice pages" / "Mixed" controls replaced by the Parts table (desktop grid, one card per part at ≤ 640 px; additive CSS in `css/teacher.css`). Supports column = read-only "Standard" (step B). Gates: `tests/scripts/ws-partopts-unit.cjs` (PO-2, PO-4), `tests/scripts/ws-partopts-shots.cjs` (screens + packet PNGs in `design/partopts/shots-A/`). Results in the lead report. |

Step A decisions:
- Mixed is FIXED in step A ("N problems (the Mixed page fills its page)"): its count is shelves that fill the page with the lesson
  skill at least half (lessons r2/r3); fewer shelves would leave the page short. Its tick (print or not) works.
- Anchor chart offers only the counts whose layout keeps sizing.ok (a grid3 chart cut to one example lost its planned size at M);
  a chart with one example is fixed.
- Lesson practice rows: max = the rows that fit (the default), which can exceed DESIGN's "≤ 2" where a fact lesson fits more -
  the default must stay today's packet.
- Share codes: Print-screen lesson sections are not in any share code or saved set today (`skill-codes.js`, `encodeSetParam`
  carry skills and the Teacher 2.0 sheet print, not teacher-print sections), so no token was added. `partOptsFromSection`
  is the load path a future saved section uses (PO-4 round-trips it).
