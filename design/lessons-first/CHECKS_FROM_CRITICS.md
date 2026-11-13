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
| 2026-11-09 | lf-vocab | Base-ten "one" a 2.5 mm speck (OQ-1) | V16+ (one unit per item, ≥ 5 mm with no hundred) | vocab-v16-base10-per-item | precritic | 1 round |
| 2026-11-09 | lf-vocab | pick3 error analysis at S, 30.1 % band | ws-empty-band --slot-ink off (opt-in, vocab only) | eb-vocab-pick3-ea-s-critic | precritic | 1 round |
| 2026-11-09 | lf-vocab | pick3 guided rows unequal at L (survived 4 rounds) | V18+ (rendered row boxes, S/M/L) | vocab-v18-rendered-rows | precritic (vocab-unit-browser) | 3 rounds |
| 2026-11-09 | lf-vocab | Match 3 error analysis at S drawn at L height | V20 (S ≤ 0.9 × L) | vocab-v20-ea-s-height | precritic | 1 round |
| 2026-11-09 | lf-vocab | Picture text printed a bank word ("number name" with "hundred") | V17+ (no bank word in the picture's text) | vocab-v17-printed-text | precritic | 1 round |
| 2026-11-09 | lf-vocab | "left" read as take-away | V21 (referent carries the heavy mark) | vocab-v21-referent | precritic | 1 round |
| 2026-11-09 | lf-vocab | 8 r5 nits under the bar | none yet: proposed in LESSONS_LEARNED | — | — | 0 |
| 2026-11-09 | lf-engine | Landing proof: lane's vocab zoom and nearest_10 practice rows silently changed 10 live lessons; the lane's refactor-guard baseline covered only 10 of 35 live packets | ws-lesson-baseline --all-lessons --check (every live packet, L+S, seeds 4242 + 1) — PROCESS RULE: runs on every engine change | landing backtest pair | landing gate | 1 round + 2 days unseen |
| 2026-11-09 | lf-ops | div_facts Test printed fewer than Independent (R6-1, R7-1) | EB-PAGE (test), EB-TESTEQ (new) | eb-page-divfacts-test, test-eq-ind-divfacts | precritic | 1 round each |
| 2026-11-09 | lf-ops | Pad, L denser than M, fact x moves, packet page empty (R6-2…5) | EB-PAD, EB-COLS, EB-FACTX, EB-PAGE (fade) | eb-pad-divfacts-M, eb-pad-page-divfacts-L, eb-cols-divfacts-array, eb-factx-divfacts, eb-page-divfacts-fade | precritic | ≈ 1 round |
| 2026-11-09 | lf-ops | Fact-to-line gap 20 mm when the fact starts under the tab (R7-2) | EB-GAP (new) | eb-gap-divfacts | precritic | 1 round |
| 2026-11-09 | lf-ops | R5-3 array gap, R5-5 think shrink, R5-7 fits-line wording | none: reasons in design/status/lf-ops.md | — | — | — |
| 2026-11-09 | lf-vocab | R-1/R-2 screen feedback r7 (Match 3 line names word not letter; all pictures glow; ladder repeats; unequal blocks; key halo; hard words) | V22+, V24+, V25+ built; V26, V27 specified | V22–V25 rows | precritic | next round |
| 2026-11-09 | lf-engine | ws-backtest checkouts filled the disk; full re-run then hung silently (prints only at the end) | tool fix c3245504 (checkout removed after each state); PROPOSED: --row per-row runs, per-row timeout, stream each row | — | — | ≈ 2.5 h lost |
| 2026-11-10 | owner | Vocab picture fits a distractor ("step" staircase read as "column"); "digit" / "place" pictures unclear | V-AMBIG (new, proposed): each picture lists the words it could also show, fails if a distractor is one; critic answers "could a pupil defend another bank word?" | to build | precritic | owner caught it — the critic did not |
| 2026-11-13 | lf-partopts | A r1 F1: lower counts left the lesson sheet 23–77 % blank at its foot | ws-partopts-unit PO-2d EB-PAGE absolute on every page, last pages included (30 %; last of 2+ pages: H5 half) + roles/lesson.js sheetOffers (a value whose sheet does not fill is not offered) | nearest_10 M: FAIL 41 / 77 / 62 % on 327356e → PASS | ws-partopts-unit (precritic) | 1 round |
| 2026-11-13 | lf-partopts | A r1 F2: We Do / Practice counts fixed almost everywhere | ws-partopts-unit PO-2e coverage line (We Do and Practice ranges of 2+ values vs floors) | 0 / 50 We Do on 31a44f9 → see status | ws-partopts-unit | 1 round |
| 2026-11-13 | lf-partopts | A r1 F3: part settings carried to another lesson | ws-partopts-shots F3 step (switch the skill → no Reset link, defaults back) | FAIL on 327356e (critic repro) → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F4: stepper dead at 0 | ws-partopts-shots F4 (at 0: + live, tick cleared; + ticks it again) | critic repro → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F5: 390 px label under the New numbers button | ws-partopts-shots overlap test inside every part row at 390 and 1280 | critic repro → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F6: fixed counts written twice ("15 · 15 a page") | ws-partopts-shots lint: a row with no stepper reads "Fixed: n (why)" once; PO-4 rangeText lint | → PASS | ws-partopts-shots, ws-partopts-unit --unit | — |
| 2026-11-13 | lf-partopts | A r1 F7: "rows 0, no row fits" kept a tick and New numbers | partLimits `none`; PO-4 (no off, no tick) + ws-partopts-shots (no tick / no button on "Not on this lesson sheet") | → PASS | both | — |
| 2026-11-13 | lf-partopts | A r1 F8: read-only Supports pills looked like controls | ws-partopts-shots: no `.tv-part-chip` | → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F9: mock's table never appeared at 1280; lone "—" | ws-partopts-shots: Parts in the full-width card at 1280, ≤ 700 px tall; no lone dash | → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F10: two New numbers re-dealt the same sheet | ws-partopts-shots: one New numbers for the lesson sheet group, none on its parts | → PASS | ws-partopts-shots | — |
| 2026-11-13 | lf-partopts | A r1 F12: PO-2 judged relative to the standard, one part at a time, skipped last pages | ws-partopts-unit rewritten: absolute judge, combinations (all min; all min + We Do off; Vocab 0 + We Do off; Remember off + rows 0), the Print screen's snap loop | FAIL 3 on 327356e → PASS | ws-partopts-unit | 1 round |
