Lane: lf-engine-roles
Title: Engine round on the shared role layouts (opener, mixed-practice, sections density)
Session: session_01HVwpAE3g6EZH8idgErP6LP
Branch: claude/sweet-newton-c8wrv1-lf-engine-roles
Owner of files: sheet/roles/{opener,mixed-practice}.js, sheet/grid.js, sheet/roles/{answer-key,compose}.js (additive style param), tests/scripts/ws-print-lint.cjs (sections DN-2/PG-23), tests/fixtures/precritic/{backtests,sections-density}
State: building
Updated: 2026-11-13
Builder profile: mq-opus-medium
Critic rounds: 0 (engine round; findings from lf-placevalue compare r2)

## Now
- Three findings fixed, each a check that FAILS on master 8df014ab7 and PASSES on its fix (backtest rows added):
  1 Opener EB-BAND (tightRows rows + one-column Model held to ink); 2 Mixed PG-23 (spilled start fills its pages);
  3 Sections DN-2/PG-23 compare each page with its own sub-section.
- Proof the passed skills are unharmed: render-hash sweep (opener 9 pv pages changed, items rose; mixed 242 pages,
  items rose, pages never dropped; 0 independent-sections changed; lessons byte-identical). Before/after PNGs in
  design/audit/runs/lf-engine-roles/proof/. Pushed; ready for an independent critic.

## Owner go

## Open questions
- compare's own cell fixes (tightRows/spreadMax/keepCols) are on lf-placevalue-w2, not master; finding 1's backtest
  uses placevalue:expand,unit_form (same footprint on master). Full ws-precritic --skill placevalue:compare still shows
  compare-cell pre-w2 findings outside this lane's scope.

## Times
- Times: builder findings 1-3, start 2026-11-13T08:55Z, end 2026-11-13T11:00Z, profile mq-opus-medium

## Log
- 2026-11-13: findings 1-3 built and committed (53732be32, 77bfb1786, a527687a2 + backtests 6ef7212f9). Backtests
  roles-opener-tightrows-band / roles-mixed-spill-pg23 / roles-sections-subsection-density all PASS. ws-boot-smoke,
  ws-code-snapshot, ws-content-audit --self-test, ws-layout-unit (1 known red unchanged) green. ws-lesson-baseline
  --all-lessons 1596 hashes identical. Merge with current master (33c7487cd) composes clean (only backtests.json
  appended-both conflict). ws-precritic-plan OK on the two skill backtest rows.
