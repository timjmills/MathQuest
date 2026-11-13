# lf-engine-roles: independent critic (Opus medium)

Branch `claude/sweet-newton-c8wrv1-lf-engine-roles`, head `2d7a7f158`, base master `8df014ab7`. The critic did not build this change.
Renders: `ws-grade-render.cjs` on the branch (after) and on a detached worktree of `8df014ab7` (before, removed afterwards).
Opener: `placevalue:expand / unit_form / combine` at S and L, pupil page and key. Mixed practice: set
`placevalue:compare + addition:add_facts + algebra:tape_diagram + area_perimeter:perimeter_intro` at S and L, pupil and key.
I also looked at the 8 proof PNGs. Every before/after PNG pair differs, combine S included (see N3).

## VERDICT: FAIL (min 5, on the C3 of the Opener `unit_form` S page)

The three engine changes are correct, and every page they touch is better than on master or no worse. The Mixed spill fix is
clean. But two Opener pages at S still fall below 8, and one of them falls below the 50 % line *because of* finding 1. The
tightRows cap moves the white from inside the cells to the foot of the page. That is right by PT-ENG-3, but it exposes a defect
already on master in `opener.js`: a one-column Guided band prints one cell, not the two rows PT-OPN-6 requires. This lane owns
that file, the fix is a small generalisation of a rule already there, and no gate catches the defect today. So it blocks.

## Page table (after pages; C1 ease / C2 teaching / C3 spacing / C4 fidelity)

| Page | Before (master) | After | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|---|
| opener expand S (pupil + key) | Guided 1, no Independent, 32 % used | Guided 1, Independent 2, 50 % used | 8 | 7 | 6 | 8 | no |
| opener unit_form S (pupil + key) | Guided 1, Indep 2, rows stretched, 55 % used | rows held, 47 % used (white moved to foot) | 8 | 7 | 5 (H5) | 8 | no |
| opener combine S (pupil + key) | 2 models, 4 guided, 8 indep, 65 % | same items, rows held, 58 %; model divider stub | 8 | 8 | 8 | 8 | yes (N2 nit) |
| opener expand L (pupil + key) | half-width wrapped Model, no Independent, 41 % | full-width Model + Steps band, Indep 2, 80 % | 8 | 7 | 8 | 8 | no (B1) |
| opener unit_form L (pupil + key) | no Independent, 42 % | full-width Model, Indep 2, 76 % | 8 | 7 | 8 | 8 | no (B1) |
| opener combine L (pupil + key) | no Independent, 37 % | full-width Model, Indep 2, 76 % | 8 | 7 | 8 | 8 | no (B1) |
| mixed compare+3 S p1/p2 (+ key) | p2 = 2 perimeter cells, 29 % used (PG-23) | p2 = 6 perimeter cells, 84 %; p1 unchanged bar Score /18 | 8 | 8 | 8 | 8 | yes |
| mixed compare+3 L p1/p2 (+ key) | p1 36 % used, p2 full | p1 10 compare + 8 facts, 92 %; p2 unchanged | 8 | 8 | 8 | 8 | yes |
| proof mix-addfacts-M p1/p2 | p2 2 perimeter cells | p1 +6 facts, p2 6 perimeter cells | 8 | 8 | 8 | 8 | yes |
| proof mix-value-L p1/p2 | p1 6 items, 60 % blank | p1 14 items; p2 same items renumbered | 8 | 8 | 8 | 8 | yes |

Keys: every key is a facsimile of its pupil page (same geometry, the answers in the slots, the Model divider stub reproduced).
No overflow, no split cell, no colour, Andika throughout.

## Blocking finding

**B1. The Opener's Guided band prints one cell when it has one column (PT-OPN-6: "Guided holds 2 to 4 cells ... 1 column gives
2 rows").** (C2 major on all five one-column pages; C3 major/critical at S.) `sheet/roles/opener.js` geometry():
`if (first && first.template === 'count-row' && gc === 1 && ...) { gRows = 2; ... }`. The second Guided row is built for
count rows only. Expand, unit_form and combine at L, and expand and unit_form at S, print a "We do" of ONE item. At S the page
then ends half blank: unit_form S is 47 % used (H5: under 50 % while the role expects one more Guided row), expand S 50 %. On
master unit_form S was 55 %. Its rows were stretched (the EB-BAND defect finding 1 fixes), and capping them pushed the page
under 50 %.
*Fix:* take the second Guided row for any `gc === 1` practice that fits (the same budget test, Independent rows fitted first),
not only count rows. At S that adds about 17 mm. unit_form S reaches about 55 % and expand S about 57 %, the most the page
holds under PT-OPN-7's two-Independent-row cap with no What's New or Vocabulary band.
*Automatic check (would have caught it):* `ws-print-lint` L-DENSITY **OPN-6**. On an Opener page, a Guided band with fewer
than 2 cells fails (major) unless the plan's notes say a second row did not fit the budget. Backtest: FAILs on `2d7a7f158` for
`placevalue:unit_form --roles opener --size S` and PASSes on the fix. Put it on ws-precritic's `--role opener` path. Today
`ws-print-lint --source kit --skills placevalue:unit_form,placevalue:expand,placevalue:combine --roles opener --size S` reports
0 findings on these pages.

## Non-blocking findings

- **N2 (minor, C4).** combine S: the Model band holds two models, and `modelTight` holds the grid to its own height
  (`flex:none`). The Steps column sets the band's height, so the vertical rule between the two Model cells now stops about
  2.5 mm above the band's bottom rule: a broken rule (pupil and key). *Fix:* apply `modelTight` only when `nModel === 1`, or
  keep the two-cell grid at band height with the cells top-aligned. *Check:* L-OVERLAP/RULE: inside a band, a grid column rule
  must end on the band's bottom rule (rule end within 0.5 mm).
- **N3 (process).** proof/README says only combine **L** changed and "No other opener changed". combine **S** changes here too
  (rows held, 65 % to 58 %, the divider stub). The sweep under-reported, so the README's table is not reliable evidence.
  *Check:* the render-hash sweep lists every changed (skill, role, size) by name in the README. A changed page the README does
  not list fails `ws-backtest`'s proof step.
- **N4 (filed on the skill, not this lane; RC2).** `algebra:tape_diagram` (not on the passed list), seen on every Mixed page:
  "Mia needs 187 shells. **He** already has..." and "Lily needs 60 books. **He**..." (the pronoun does not match the name), and
  "Leo needs 186 shells. He already has 9" draws the part 9 as a sliver bar with the digit outside it. This was already on
  master and is unchanged here.
- **N5 (observation).** In Mixed practice S, the fill adds every extra shelf to the skill on the spilled page (perimeter 2 to 6):
  page 2 is all Geometry. It is acceptable as GROUPED packing (PT-MIX), but it is a one-skill page on a "mixed" sheet. A later
  M2 interleave should spread the fill.

## Ruling on the check loosening (finding 3)

**Legitimate. Keep it, and add one guard.** WORKSHEET_DESIGN_STANDARD PG-23 reads "If the last page of a row-based **section**
would hold fewer than one third of a full page's rows, rows are rebalanced evenly across the **section's** pages". On a Sections
sheet each skill is its own section, and item counts between sub-sections of different cell heights (10 one-line compares vs
2 perimeter shapes) do not measure page use. The old whole-sheet count read full tape-diagram and perimeter pages as half
empty. The scoping is narrow: kit, independent / more-practice only, every cell attributed, more than one skill. Mixed practice
is excluded. A sub-section's own short last page still fails (self-test).

Counter-cases I built, as temporary scratch self-tests (removed, not committed):
- CC1: a mid-sheet sub-section page holding 1 cell between two full sub-section pages. DN-2 no longer fires, but the document
  still FAILs: L-DENSITY LONE + SPREAD (and PAGEFILL on a real page).
- CC2: the last page holds 1 cell of a one-page sub-section. PG-23 by count no longer fires, but the document still FAILs: LONE,
  plus the geometric PG-23 ORPHAN (problems under a third of the body), which the change does not touch.

So under the print screen's Auto count the loosening hides nothing that a geometric check does not still catch. **Residual
gap:** with a fixed `--count N`, PAGEFILL, ORPHAN and SPREAD are all off. A mid-sheet sub-section page that is under half used
(a sub-section that did not flow into the space left on the page before) then passes, where DN-2 by count used to catch it
crudely. *Recommended guard (non-blocking):* when `subSec` is true, DN-2 measures page FILL instead of item count. A page that is
not the sheet's last, whose problems fill under 50 % of the body, fails at any count. Self-test: CC1 with `--count 6`.

The finding-3 backtest is weak as a backtest. Its `fail` fixture (one-section.fail.html) is a constructed sheet that fails on
both trees, not the master state. That is acceptable for a loosening (it proves real defects still fire), but its row should say so.

## Engine grade

| Criterion | Score | Why |
|---|---|---|
| Correctness | 8 | `modelHAt` measured fallback, the `halfOk` full-width Model, the tightRows cap and `multi = !!A \|\| pagesOf() > 1` all do what they claim. No overflow and no lost items in any render. Lesson baseline byte-identical (builder's run). |
| Design fit | 7 | PT-ENG-3 and PG-23 honoured, but PT-OPN-6 is still unmet (B1), and finding 1 pushes unit_form S under 50 %. The two-Model divider stub (N2). |
| Maintainability | 8 | Additive `style` through grid / answer-key / compose. Comments name findings and rules. The `modelTight` and `modelCellH` logic is small. |
| Gates | 7 | Three backtests and two lint self-tests. No check covers PT-OPN-6, and the proof README under-reports the changed pages (N3). |

Min 7: the engine change fails the 8 bar on design fit and gates.
