# lf-studentopts — the pupil's options sheet (design/student-opts/CARD.md, signed 2026-11-19)

| Date | Step | State | Evidence |
|---|---|---|---|
| 2026-11-19 | Build (MEDIUM, first build of a new screen): `pupilOptionsFor`, the sheet (js/modules/student-options.js, lazy), Quick Start tap opens it, chip ✕ 48 px + chip body opens it, "You will play N skills", every pupil start through `playSelectedSkills`, teacher-link options locked | Built; waiting for the narrow critic (MEDIUM) at 1280 / 1366 / 1024 / 820 | `node tests/scripts/ws-student-opts.cjs` OK at all four widths; backtest rows `student-opts-carry`, `student-opts-count`, `student-opts-pupil`, `student-opts-unit` (FAIL 89b9dad95 → PASS this branch) |
