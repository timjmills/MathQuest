Lane: lf-engine-lessonfirst (lf-engine)
Title: LESSON-EMPTY-FIRST + LESSON-OPENER-SAME root-cause fix (owner's grade-3 WRM lesson review, 2026-11-19)
Branch: claude/sweet-newton-c8wrv1-lf-engine-lessonfirst (from lf-checks 0983c6791; merged master eb2e26972 by ws-merge-master)
Builder: lane session at medium effort (first build of this fix)
State: critic-ready (shared narrow critic, with lf-checks' two checks)
Updated: 2026-11-20 (c added)

## Now
- Root causes: `design/audit/runs/lf-engine-lessonfirst/DIAGNOSIS.md`. Proof, misfires and PNGs: `CRITIC-READY.md` (same folder).
- (a) The anchor-chart part was always built and printed. A lesson with no chart states (no lesson record) planned no chart page,
  and assemble() printed a header over an empty body as page 1. Fix: buildLesson drops that part.
- (b) pickExample's widest-operands rule (meant for column skills) gave every times-table lesson "11 × table". Every WRM lesson
  also used seed 4242, so steps with the same skill and options printed identical packets. Fix: a fixed-table fact pool is
  modelled as n × table (table second, n in 3-9 by step); the WRM screen sends `seed: wrmLessonSeed(l)` and
  `lessonVariant: wrmLessonVariant(l)`. ws-lesson-pages builds with the same request (its rules are unchanged).
- Grade 3 (135 lessons): EMPTY-FIRST 59 → 0; OPENER-SAME 22 → 6. Of those 6, 5 are text-only signature misfires (the cells
  differ). 1 is real: Y4.B14.S4/S5, the geo_rotate warm-up dealt the same figure. Backtests FAIL → OK. Baseline: 2590 identical,
  no re-pin.
- (c) CELL-FITS (lead 2026-11-20): new `tests/scripts/ws-lesson-cellfits.mjs`, precritic --role lesson gate `lesson-cellfits`, backtest
  `lesson-cell-fits`, ledger row. Fix: a 2 x 2 chart that cannot fit at zoom 1 and whose drawings fit one across only takes
  `chartFull` (one full-width panel a row), and runs onto further chart pages at full size, each under the chart's full header.
  two_step_letter_equation: CELL-FITS OK. Its chart is now 4 pages: the one-page CHART-HEAD rule conflicts, and the content fix
  (the story printed once) belongs to the algebra lesson lane. Baseline re-pinned for that lesson only.
- Gates (head merged with master a98297951): boot OK; roles-unit OK; precritic-plan OK; backtest rows OK. layout-unit crashes at
  :918 on master and on the base too. precritic --role lesson --strict: every red is master's or named in CRITIC-READY.
