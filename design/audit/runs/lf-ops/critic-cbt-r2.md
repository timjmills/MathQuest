# Critic cbt r2 — multiplication:count_by_tables (lf-ops) — FINAL round under the cap

Independent critic (Opus medium), frozen tree 8f76b6401 (merged master). Renders: scratchpad crit-cbt2/ (session-local).
Scope: M / L; screens 1366 / 1280 / 1024 / 820. Out of scope: S, 390, and the 8 routed EB reds (lf-roles Guided EB-REFILL; lf-engine opener band, lesson-vocab band, EB-VOCAB).

**Verdict: FAIL — lowest 4** (C3: Scripted Model L, Say band clipped; Pre-skill check M / L, one quadrant, ~75 % empty).

r1 rendered 7 of the card's 13 roles; the skipped roles hold most new defects (E1, E2, E3, E5, E6). E3 / E5 / E6 are already red in plain `ws-print-lint --source kit` (10 findings per size) — precritic's `--skill` path lints only the Independent page at defaults, so they never gated.

## Scores (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| Page | M | L |
|---|---|---|
| Independent / More practice / Test | 8·8·8·8 | 9·8·8·8 |
| Guided | 8·8·(ledgered)·8 | 8·8·8*·8 (N1) |
| Mixed practice | 8·8·8·8 | 8·8·8·8 |
| Review | 8·8·8·8 | 8·8·8·8 |
| Reason It | 8·8·8·8 | 8·8·8·8 |
| True or False? | 8·5·8·5 FAIL E1 | 8·5·7·5 FAIL E1 |
| Pre-skill check | 8·7·4·7 FAIL E2 | 8·7·4·7 FAIL E2 |
| Scripted Model | 8·8·8·8 | 7·8·4·5 FAIL E3 |
| Opener | 8·8·(ledgered)·7 FAIL E5 | 8·8·(ledgered)·7 FAIL E5 |
| Error analysis | 8·8·7·8 FAIL E6 | 8·8·7·8 FAIL E6 |
| Lesson default | 8·8·8·8 | 8·8·8·8 |
| Lesson times=each / given | 8·7·8·8 FAIL E7 | 8·7·8·8 FAIL E7 |
| Lesson jumps=15 | 7·7·6·7 FAIL E4 E7 | 7·7·6·7 FAIL E4 E7 |
| Lesson onePage=true | 7·8·6·7 FAIL E8 | 7·8·6·7 FAIL E8 |
| Guided onePage=true | 7·8·7·7 FAIL E8 | FAIL E8 |
| Independent / Test onePage (owner ruling, N3) | 8·8·8·8 | 8·8·8·8 |
| Independent fill=half / spaces=line / times | 8·8·8·8 | 9·8·8·8 |

Screen: card and quiz at all four widths ≥ 8. cbt worksheet 1280 / 1024 / 820: 8·8·8·8 (D2 fixed). **number_patterns_rule worksheet 1280 / 1024: 8·8·6·8 FAIL E9.**

## Findings
- **E1 (critical) True or False? prints false equations, pupil page and key, M / L.** "3 × 12 = 12, 18, 24, 30, 36." Cause `js/modules/sheet/roles/true-false.js:53-56`: the `a × b = ` stem is used whenever `operandsOf(q)` returns two operands; cbt exposes [step, 12]. Check: TOF-STEM — a stem with "=" holds exactly one slot, and the key's filled frame is a true equation.
- **E2 (critical, H5) Pre-skill check: 1 quadrant of 4 items, ~75 % empty, M / L.** Prerequisites resolve to one skill (number_seq_fill); PT-PRE-1 wants 4 quadrants. Lint passed it. Check: ws-empty-band --page-fill on pre-skill-check, plus a ≥ 3 quadrants assertion.
- **E3 (critical, H2) Scripted Model L: Say band clipped, covered by state 4,** free page below. Lint: L-OVERLAP SECTION major. Check: scripted-model at L plus --raster-fit RR-CLIP on precritic's path.
- **E4 (major) D8 not fixed for jumps=15:** lesson chart drawn 9 + 6, boxes ~9–11 mm, arrows touching, trace 1 mm from border. TY-10a wants 3 lines of 5, which fits. Check: CHART-DIGIT plus a numbers-per-line shape (6/6 or 5/5/5) plus slot-fit.
- **E5 (major) Opener: step tab paints in the label keep-out, M / L** (the r1 D7 class). Lint CL40-INK ×4 M, ×2 L. Check: the opener role on precritic's lint roles.
- **E6 (major) Error analysis: ~16 mm empty above "Sam wrote:" at M (9.5 L).** Lint L-TOPSTART CL-4b ×4. Check: error-analysis on precritic's lint roles.
- **E7 (major, P-1) times=each / given / jumps=15 merge chart steps 1 and 2 into one panel;** both remaining panels keep ~25 % empty. Check: ws-lesson-check — chart panels = workedSteps count for every option value.
- **E8 (major) onePage=true leaks into the lesson anchor chart** (one line of 12 at ~13 pt, 8 mm boxes) **and Guided** (9 compact rows, ~10 pt grey captions, 9 mm boxes vs SL-1 14 mm). The card limits it to Independent / More practice / Test. Check: ws-options-verify — roles outside an option's role list render identically on and off.
- **E9 (major) number_patterns_rule worksheet 1280 / 1024: full-row cards, content in the middle third** (~1130 px card, train 4 + 4 in ~340 px, ~70 % empty, sheet ~2600 px). A side effect of the template-wide WS-REFLOW exemption. Fix: exempt only cards whose train would fall below 3 a line in a column, or let the train use the card width. Check: a per-card exemption plus full-row content ≥ 50 % of the card width.

Notes (not scored):
- **N1** Guided L (default, times=given): 15–22 % feet with room for a row. Likely the lf-roles fitRows cause, but the ruling names M only; the lead to confirm the ledger covers L and the times options.
- **N2** Lesson p2 M has a 16.9 % foot, likely the ledgered vocab share.
- **N3** onePage Independent / Test answer boxes are ~9 mm for 3-digit answers. Owner ruling; flagged for the owner.
- **N4** L-KEY AK-2 on true-false and scripted-model looks like a false positive.
- **N5** A "detached Frame" harness flake on the first times=given render; the rerun passed.

## r1 re-verification
| r1 | Status |
|---|---|
| D1 S | out of scope |
| D2 worksheet train | fixed for cbt; regressed npr (E9) |
| D3 Warm-up bands | fixed |
| D4 Guided stretch | fixed (feet → N1) |
| D5 Mixed lone item | fixed |
| D6 Reason It boxes | fixed |
| D7 Reason It CL40 | fixed; same class open on the opener (E5) |
| D8 chart shrink | fixed for times; not for jumps=15 (E4); new onePage form (E8) |
| D9 jumps=15 L Practice | fixed |
| D10 390 | out of scope |
| m1 title | fixed |
| m2 circles / hexagons mixed | NOT fixed (number_seq_fill drawing: Review, Warm-up, Pre-skill check) |
| m3 wording | fixed |
| m4 Review shelf | fixed |

## Root cause of the round loss (rule 7, round cap)
Precritic `--skill` lints and empty-bands only part of the card's role list. Six of the 13 offered roles (true-false, pre-skill-check, scripted-model L, opener, error-analysis, and the lesson under each drawing option) were never machine-gated, and three of them were already red in plain print-lint. Machine fix before any further round: precritic `--skill` runs print-lint, empty-band and raster-fit on EVERY role the signed card offers, at M and L, and under every option value that changes the drawing.
