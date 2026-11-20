# lf-myworksheets — My Worksheets (design/my-worksheets/CARD.md, signed 2026-11-20, rulings A15)

| Date | Step | State | Evidence |
|---|---|---|---|
| 2026-11-20 | Build (MEDIUM, first build of a new screen): checks first (`tests/scripts/ws-my-worksheets.cjs`), then js/modules/sheet-library.js (IndexedDB `sheets` store, DB_VERSION 2 adds only it; packed options; export / merge-by-id import; SH1 share code), js/modules/my-worksheets.js (lazy screen + Save dialog + ?sheet=), Save on Print worksheets, simple print and the online worksheet (teacher-only), Open interactive (page-1 items), 450 warning / 500 cap, unit folders, Edit re-save with Save as a copy | Built; waiting for the narrow critic (MEDIUM) at 1280 / 1366 / 1024 / 820 | ws-my-worksheets OK at all four widths; backtest rows `mws-*` (FAIL 903f2780e → OK this branch); precritic --teacher row `my-worksheets` |
