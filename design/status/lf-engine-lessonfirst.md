Lane: lf-engine-lessonfirst (lf-engine)
Title: LESSON-EMPTY-FIRST + LESSON-OPENER-SAME root-cause fix (owner's grade-3 WRM lesson review, 2026-11-19)
Branch: claude/sweet-newton-c8wrv1-lf-engine-lessonfirst (from lf-checks 0983c6791; merged master 65c28ccdf by ws-merge-master)
Builder: lane session at medium effort (first build of this fix)
State: critic-ready (shared narrow critic, with lf-checks' two checks)
Updated: 2026-11-20

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
- Gates: boot OK; roles-unit OK; precritic-plan OK. layout-unit crashes at :918 on master and on the base too. precritic
  --role lesson --strict reds: see the report.
