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
- MIX-S (lead add): Mixed practice at S held fewer problems a page than M on 8 passed skills (master). Check: lf-roles'
  ws-capacity-pin SIZE-ORDER + mixed pins (FAIL on 8df014ab7); fix: a one-page sheet also tries each larger size's lattice
  at this size's metrics, and the shelf budget compare takes an epsilon (value / combine S 8 + 1 spill). Pin OK, 0 drops.
- OPENER-OVERFLOW (lead ruling): coordinate_q1 L fixed - the practice moves to page 2 when both pages close; every Opener
  is ratcheted against a master pin of L-OVERFLOW / L-SPLIT at M and L (all 727 live skills). Size S dropped (owner).
- Capacity pin scope: the interim scoping (pinned roles only) is dropped on the merge - master now pins every grid role at M / L
  (lf-roles merged); ws-capacity-pin --check --roles opener,mixed-practice OK on the merged branch.
- Merged origin/master 7a5bc902c (w2, size S dropped) at 4f448fa7e; sweeps and checks re-run at M / L.
- Findings 1-3 (r0), B1/N2/GUARD and MIX-S each a check FAIL-on-bad / PASS-on-fix; backtests all PASS.

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

## Resume here (round 3 parked by owner budget stop, 2026-11-14)
Critic r2 report: design/audit/runs/lf-engine-roles-r2/REPORT.md. Round 3 is WIP, ungated; do not deploy.
- F1 (side-by-side before split; page 2 fills): PARTLY. opener.js tries Model | first Guided cell side by side at the
  measured half-cell height (`side`) before splitting; a split page 2 takes the second Guided row (legacy too). Verified layout
  choice only: coordinate_q1 / shape_name_match_3d / add_wp_10k / multi_step_word M go side-by-side on one page; round_sort_10
  and multi_step_word L still split. NOT DONE: the side gate must require the half-cell measurement to fit (add_wp_10k's
  measured[2].fits is false: ink 117 mm > the half cell, so its side row likely overflows - lint run was interrupted);
  checks first (OPN-SPLIT lint: split Opener page < 50 % used fails unless notes say "side by side ... did not fit"; L-DENSITY
  DN-2 / LONE / PAGEFILL in the OPENER-OVERFLOW ratchet), backtests FAIL 27b8e540c / OK fix, precritic path, ledger rows.
- F2 (ratchet keyed on lint, rule, part, page; multi_step_word L page 2 2.1 mm): NOT DONE. opener.js keeps 3 mm in hand on a
  split page 2 (untested). Ratchet key change + re-trimmed pins (keep `parts`) not started.
- F3 (page 1 of a kit split): NOT DONE beyond the side row; covered by OPN-SPLIT once built.
- F7 (ledger rows: roles-mixed-size-order missing from backtests.json, MIX-S retirement row needs an exemption; README claims
  mixed_placevalue 1/2/0 -> 1/2/0 and fraction_of_set L 1 page; README counts from the sweep file): NOT DONE.
- Flake row (own row, owner lf-checks, "the harness leaks render state between documents (ws-print-lint long runs)",
  repro commands from the r2 report's flake section): NOT DONE.
Next command (after fixing the side gate in js/modules/sheet/roles/opener.js geometry(): require measured[2].fits !== false
for kit cells, and for legacy cells measured[2].inkMm below the half cell's inner width):
  S=<scratch>; node tests/scripts/ws-print-lint.cjs --source kit --roles opener --size L --lints L-OVERFLOW,L-SPLIT,L-DENSITY \
    --skills coordinates:coordinate_q1,shapes_early:shape_name_match_3d,number_sense:round_sort_10,addition:add_wp_10k,algebra:multi_step_word --verbose
then build the OPN-SPLIT lint + ratchet changes (checks first), the every-opener sweep (M, L) with a page-1 / page-2 % used list,
the overflow ratchet on every changed skill, PNGs (coordinate_q1, shape_name_match_3d, round_sort_10, add_wp_10k,
multi_step_word; pupil + key; M, L), gates, merge origin/master if moved.
