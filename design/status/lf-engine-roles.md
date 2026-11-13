Lane: lf-engine-roles
Title: Engine round on the shared role layouts (opener, mixed-practice, sections density)
Session: session_01HVwpAE3g6EZH8idgErP6LP
Branch: claude/sweet-newton-c8wrv1-lf-engine-roles
Owner of files: sheet/roles/{opener,mixed-practice}.js, sheet/grid.js, sheet/roles/{answer-key,compose}.js (additive style param), tests/scripts/ws-print-lint.cjs (sections DN-2/PG-23), tests/fixtures/precritic/{backtests,sections-density}
State: building
Updated: 2026-11-13
Builder profile: mq-opus-medium
Critic rounds: 1 (FAIL min 5 on B1; rebuild Opus medium 2026-11-13)

## Now
- Critic r1 FAIL (min 5, B1). Rebuilt:
  B1 the Opener takes a second Guided row on ANY one-column page that fits (was count rows only); PT-OPN-6. Check
  ws-print-lint L-DENSITY OPN-6 (Guided band < 2 cells fails unless the plan notes the second row did not fit).
  unit_form S 46->53 %, expand S 49->56 % used, all one-column pv openers Guided 2.
  N2 modelTight only when nModel===1, so a two-Model band's column rule reaches the band bottom; check L-OVERLAP RULE.
  GUARD on finding 3: on a sections sheet DN-2 measures page FILL, so a mid-sheet page under half used fails at any
  --count (self-tests CC1/CC2). N3 proof README re-done (sweep re-run base vs head, every changed page listed, opener
  PNGs re-rendered). N4 (tape_diagram) not this lane - routed by the lead.
- Findings 1-3 (r0) and B1/N2/GUARD each a check FAIL-on-bad / PASS-on-fix; backtests all PASS.

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
