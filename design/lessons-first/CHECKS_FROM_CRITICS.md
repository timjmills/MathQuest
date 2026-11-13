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
| 2026-11-13 | owner | div_facts screen arrays drawn as tall narrow strips with tiny dots — the screen critic noted "array dots are small on screen" as UNSCORED and passed it | SCREEN-INK-SIZE (new: picture ink ≥ print size on screen; drawings fill ≥ 60 % of free width before growing taller) + ARRAY-ORIENT (landscape for ≥ 2 rows); PROCESS: a legibility / size note is a scored defect, never an unscored note | to build (lf-checks, lf-ops) | precritic, all passed skills | the owner caught it — the critic did not |
| 2026-11-13 | lf-engine | Prerequisite Check r3: pv "ones tens" heads gave the answer away; Q6–8 clip; sub L Independent band cut off; LR-5 repeat only with the check on; Mixed 55 % band; dead hundreds carry box on add_100_regroup Mixed partners; round Practice 49 % band | PC-CLIP on ink, frame closure on every lesson page, H13/H15 on Practice/Mixed (blocking), carry-box live-part lint, pv heads off on routed checks, LR-5/LR-6 in --force-check | next round | precritic --force-check | PROCESS: "critic-ready" = every page of the packet gated, not only changed pages |
| 2026-11-13 | lf-engine live-fix | r3 F5 (add L Mixed 55 % band), F7 (round Practice 49 % band) LIVE on master | PM-H13 (new, ws-lesson-samples --check, blocking on every Practice / Mixed page) | lesson-pm-h13 (cf1e5abe FAIL → ce1d96f5 OK) | precritic lesson-samples-check | 1 round |
| 2026-11-13 | lf-engine live-fix | r3 F6 dead hundreds carry box on the add_100_regroup Mixed partner (sub, round) LIVE on master | LIVE-PART (new, ws-lesson-samples --check: every drawn carry box filled on the key by >= 1 stack of its section) | lesson-live-carry (cf1e5abe FAIL → ce1d96f5 OK) | precritic lesson-samples-check | 1 round |
| 2026-11-13 | lf-engine live-fix | PROCESS: F5-F7 sat on pages the lane did not change | Rule: critic-ready means every page of the packet is gated, not only the pages that changed | — (process rule) | precritic | 1 round |
| 2026-11-13 | lf-roles | Shared roles wrote a list answer ("12, 15, 18") or a sentence into ONE frame / fix slot (lf-algebra KEYJOIN 340) | ws-roles-unit KEYJOIN-ROLE (new, node); ws-cell-checks KEYJOIN skips open zones | roles-keyjoin-frame (FAIL 24 on eef75f5 → OK) | ws-roles-unit: to add to precritic node rows | ≈ 1 round per pattern / table lane |
| 2026-11-13 | lf-roles | Review body ran 1.3 mm over under a two-line title it never budgeted | ws-roles-unit REVIEW-TITLE (new) | roles-review-title | as above | 1 round |
| 2026-11-13 | lf-roles | Tall-state Scripted Model: two half-empty pages, text cells 60-80 % empty | ws-roles-unit MOD-ACROSS (new) + ws-empty-band EB-BAND / EB-SIDE | roles-model-across | as above | 1 round |
| 2026-11-13 | lf-roles | EB-FOOT paired full-width cells with the 2-column measure | ws-empty-band gridCols pairing (tool fix) | — (tool) | precritic | false reds |
