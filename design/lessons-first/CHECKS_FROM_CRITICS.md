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
| 2026-11-09 | lf-placevalue | unit_form G2 passed by 0.1 point (fragile) | ws-empty-band --margin N | pv-unit-form-rename-margin | backtest only (opt-in once pinned) | 1 round |
| 2026-11-09 | lf-placevalue | Error-analysis Fix-it frame printed a singular word that gave the answer away (G5) | ws-fixit-words FIX-WORDS (new) | pv-unit-form-fixit-words | precritic (lane opt-in) | 2 rounds |
| 2026-11-09 | lf-placevalue | identify L lesson page 2 43 % empty (E-r4-1) | ws-empty-band --page-fill EB-PAGE (new) | pv-identify-lesson-page-fill | precritic (lane opt-in) | 1 round |
| 2026-11-09 | lf-engine | Lane's extracted engine lacked master's pre-skill-check shared answer set (P0 drift) | ws-lesson-unit --only p0-overlap (wiring part, new) + ws-lesson-deal-diff.cjs | p0-overlap (FAIL dcdb50d4 → PASS b1e30155) | lane gate list | ≈ 2 rounds |
| 2026-11-09 | lf-engine | P0 one-number questions whose answer ranges meet (count 11–20 vs + 13–19; also g2-nbt3, g3-oa5) | p0-overlap (ranges part) | same row | lane gate list | ≈ 1 round |
| 2026-11-09 | lf-placevalue | unit_form worksheet host 32 % band; identify L warm-up EB-SIDE 31 %; vocab cell grows into freed height | none yet: hosts / engine code (EB-BAND on .mq-lvocabcell proposed) | — | — | — |

Speed-up worth spreading (lf-engine, 11-09): when one tree passes and another with the same data fails, diff the engine hunks
since the merge base against the lane's extracted copies before rendering anything.
