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
| 2026-11-13 | A · fix round (critic r1 F1-F12, DESIGN §8) | **Engine.** Lesson sheet (§8b): on a sheet whose bands the teacher changed, freed height goes to more Independent rows (the 6 of 12.1 lifted to the pool; rows keep their ink at half the cell and CL-8 + 1.5 mm, else none), bands grow a tenth at most; `roles/lesson.js sheetOffers` probes every value of Vocabulary / Remember / We Do / rows with the others as asked (pure, before the plan) and offers only those whose sheet uses ≥ 72 % of every page (≥ 55 % on the last of two), prints the count asked, keeps We Do cells' ink ≥ half their width (new `measured[c].inkMm`) and no We Do band stretched past 1.3 × its cells. We Do (§8c): the `max(2, fit.min)` floor is gone; fewer cells re-flow wider (under a strip at their own column). Practice / Mixed (§8a): How many is the TOTAL - P equal pages of k whole rows (k from the fewest rows under the growth cap to the page's fit, P ≤ 5), the pages stepper is gone; Mixed is 1-2 whole Mixed pages (a Mixed sheet that already runs to 2 pages stays fixed). **UI.** F3 settings reset when the skill / lesson changes; F4 0 = off on Vocabulary / We Do / rows / Practice / Mixed, + from 0 ticks it back; F5 no nested card, rows separated by rules, Parts take the section's padding back at 390 (298 px); F6 a fixed count reads "Fixed: n (why)" once; F7 no-room rows: no tick, no New numbers; F8 Supports as plain text; F9 at ≥ 1000 px the Lesson parts are a full-width table card under the Print screen's columns; F10 one New numbers for the lesson-sheet group; a snapped count says so under its stepper. **Gates.** `ws-lesson-baseline --all-lessons --check` vs master d34311d: OK (1556 hashes identical); `ws-partopts-unit` full: PO-4 / PO-2a-d PASS (877 builds), PO-2e FAIL - We Do range 7 / 52, Practice range 52 / 52 (floors 40 % / 90 %, the lead to set); backtest F12: 327356e FAIL EB-PAGE 41 / 77 / 62 % (nearest_10 M) → PASS; `ws-partopts-shots` OK; ws-code-snapshot OK; ws-boot-smoke OK; ws-detailed-lesson --check --repeats: 5 OK, g1-oa1 (E9, E35) and g3-oa8 (E35) fail as on master. Shots: `design/partopts/shots-A2/`. |

Fix-round decisions (for the critic):
- We Do ranges stay rare (7 of 52): stacks (25.9 mm ink in a 58 mm cell), stories (fit 1) and Steps-stretched bands cannot lose a cell without an EB-SIDE / EB-BAND band. Facts (add_facts, nearest_10 M, sub_1k M, sub_100_regroup L) offer 2-3. Widening the coverage needs a different We Do layout (cells that keep their width) - a scope question for the lead.
- PO-2 excuses a cell finding only when the standard packet draws a cell of the same template, sheet and size with that finding (F11b defects of other lanes); EB-PAGE has no excuse but an identical page.
- Practice totals are equal pages only (no unequal last page); a total between them rounds with the note "Rounded to n so no page is under half full".

| 2026-11-13 | Lead decisions after the fix round | We Do accepted as mostly fixed in step A ("Fixed: n (why)"); the PO-2e We Do floor is set to the measured 7/52, a ratchet that may only rise. Follow-up entry **partopts-wedo-layout**: a We Do layout (stacks, word problems, Steps-stretched bands) that frees more counts without an EB-SIDE or EB-BAND failure. +$25 for critic r2. |
