# Checks from critics — the lessons-first ledger

Owner rule (2026-11-09): every audit or critic finding becomes an automatic check, so lesson checking
reaches 8/10 in fewer rounds. One row per finding. A finding with no check gives its reason.
The lanes also record each row in `design/audit/LESSONS_LEARNED.md`, `design/status/speed-audit.md`
and `metrics.md`; this file is the one place to read them all.

| Date | Lane | Finding | Check id (new / extended) | Backtest row (FAIL failed state → PASS fix) | On precritic / ws-detailed-lesson path | Would have saved |
|---|---|---|---|---|---|---|
| 2026-11-07 | lf-checks | Empty bands on roles/hosts no check rendered (vocab, pv, ops critics) | ws-empty-band EB-BAND / EB-SIDE / EB-FOOT (new) | lf-checks backtests | precritic | ≈ 1 round per lane |
| 2026-11-07 | lf-placevalue | Live lesson 1 regressed by a skill lane (E9c, E11, E24, E24b) | Rule: every skill lane runs ws-detailed-lesson --check / --repeats on every passed lesson that deals its skills | — (process rule) | hand-over gate | 1 held deploy |
| 2026-11-08 | lf-placevalue | Vocabulary cell ink leaves a 27 mm band (identify E-A1) | ws-empty-band --vocab-ink EB-VOCAB (new) | pv-identify-vocab-ink (3 → 0) | precritic (lane opt-in) | 1 round |
| 2026-11-08 | lf-placevalue | unit_form rename write line leaves a side band (G2) | EB-SIDE (extended), --only for single-rule backtests | pv-unit-form-rename-side (27 → 0) | precritic | 1 round |
| 2026-11-08 | lf-engine | Lesson 2 near twins; diagnosis "pool capacity" was wrong | pack-feasible with placeSources (P0 ranges, chart case pools, Practice solved set) | pack-feasible-p0, pack-feasible-sources (FAIL 26/26 seeds → PASS) | ws-lesson-unit | 2 rounds |
| 2026-11-08 | lf-ops | div_facts aids r6: white under grid, 3 mm pad, L denser than M, fact x spread | ws-empty-band EB-PAGE / EB-PAD / EB-COLS / EB-FACTX (new, div_facts opt-in) | 4 rows, FAIL on 49a7b12a | precritic | ≈ 1 round |
