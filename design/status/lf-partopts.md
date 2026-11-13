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
| 2026-11-12 | A · build (How many on every lesson part, Parts table) | `js/modules/sheet/part-opts.js` (partLimits, normalizePartOpts, …, exported through `sheet/index.js`); `partOpts` plumbed teacher-print `requestFor` → print-sheet `buildLesson` → lesson role (`lessonInput.partN`: chart / vocab / remember / We Do / rows), prereq slice, Practice cap in whole rows; `res.lesson.partFit` reports each part's fit (the ranges are measured, never typed). Lesson section's "Practice pages" / "Mixed" controls replaced by the Parts table (desktop grid, one card per part at ≤ 640 px; additive CSS in `css/teacher.css`). Supports column = read-only "Standard" (step B). Gates: `tests/scripts/ws-partopts-unit.cjs` (PO-2, PO-4), `tests/scripts/ws-partopts-shots.cjs` (screens + packet PNGs in `design/partopts/shots-A/`). PO-1 `ws-lesson-baseline --all-lessons --check` OK (1556 hashes identical, baseline written from master 12ec080); PO-2 `ws-partopts-unit --full 3` OK (249 builds, 26 lessons x M/L at min/max + toggles, every value for 3 lessons); PO-4 OK; backtest: PRACTICE_GROW_CAP 3 -> PO-2d FAIL 2 (EB-BAND/EB-SIDE on Practice 6 at L), restored -> OK; ws-partopts-shots OK; ws-code-snapshot OK; ws-boot-smoke OK. |

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
- Found by PO-2 while building (each now a rule in the code, the check stays): one We Do cell (EB-SIDE 34-41 %); two worked
  (stack) We Do cells (EB-SIDE 30.0 %) - We Do may go below its fit only for one-line facts whose ink fills half the cell;
  Remember off / Vocabulary 0 / We Do off grew the other bands past 30 % or let 3-across stack rows appear with 30 % sides -
  with teacher counts the bands grow by a tenth at most and the rows' range stays the standard sheet's (freed height stays
  white at the sheet's foot: a critic question for step C); an anchor chart cut from a grid3 layout lost its planned size -
  only counts with sizing.ok are offered; Remember that had already given way could not be toggled - the fit says so.
- No live lesson prints a Prerequisite Check today (every `prereqs` record has prereqsLive false), so the prereq row is
  unit-tested (PO-4) but has no browser sample.

| 2026-11-13 | A · critic r1 | FAIL (11 of 12 cells < 8): `design/partopts/critic-A-r1.md`. Defaults unchanged (baseline 1556 identical, ws-partopts-unit OK). ws-detailed-lesson: g1-oa1 E9/E35 and g3-oa8 E35 fail identically on master d34311d (not this lane). Main finding: lower counts leave the sheet foot blank (F1), so most counts are fixed (F2). Scope decision asked of the lead (total-count Practice, freed height returned, We Do re-flow); holding. Spend ≈ $55–60 (est.). |
