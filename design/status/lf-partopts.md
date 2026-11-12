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
