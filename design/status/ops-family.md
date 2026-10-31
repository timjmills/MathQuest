Lane: ops-family
Title: Operations family lane (work order item 4) — first family lane
Session: session_013pHDnPm6jsqM66jkj7eD7L (lead session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-ops-family (base claude/sweet-newton-c8wrv1 fbeaa332)
Scope: addition / subtraction / multiplication / division skills, EXCEPT fact skills (Lane D) and the 7 passed column-subtraction skills
State: PAUSED (owner, 2026-10-31 ~19:00, weekly usage) — see "PAUSE 2026-10-31"
Updated: 2026-10-31
Budget: lane cap ~$300

## Findings at lane start (2026-10-30)
- `origin/claude/sweet-newton-c8wrv1-wip-operations` shares NO history with today's main (git merge-base: none). Its useful part is
  1ce88685 (add_sub_10s/100s → fact horiz; missing_add_sub / missing_mult_div → equation; div_zero_in_quotient → `short-division`).
  It is re-applied by hand onto today's gen-operations.js. `short-division` does not exist on main; the `division` template does.
  The branch's other cells (gen-ops-build.js, fact-ladder, int-line, long-multiplication, share-plates, providers/integers.js) are
  out of this lane's first batch; fact-ladder / long-multiplication belong to Lane D (item 3).
- The visual-redesign spec (design/specs/visual-redesign-2026-10-30.md, design/GRAPHIC_LIBRARY.md) has NOT landed on
  claude/sweet-newton-c8wrv1 yet, so this lane starts with skills that need no new drawing (G1) and leaves word problems.
- Spec card: no card exists for the `fact` / `equation` / `division` templates. Card drafted unsigned (owner signs); built under the
  s3-stack precedent (card INCOMPLETE reported to the lead).

## Groups (same-shape siblings, one batch each)
| Group | Skills | Template | State |
|---|---|---|---|
| G1 one-line sentences | addition:add_sub_10s, addition:add_sub_100s, subtraction:missing_add_sub, division:missing_mult_div, division:div_zero_in_quotient | equation (fact look), equation, division | critic r1 FAIL (min 4); div_zero held out |
| later | word problems (wait for the spec), box_division / area_model_div, number families, mult_properties … (BACKLOG ops list) | — | queued |


## PAUSE 2026-10-31 (owner: weekly usage nearly used up; resume after Thursday 22:00 UTC)

**Nothing passed; nothing added to redesign-passed.js.** Lane branch HEAD = presets + fix round 2 merged (all on origin).

### Done this session
- Merged main (899c147). **7 presets built** (0d58680, branch claude/ops-family-presets-r2): ten_more ZF, ten_less ZG,
  hundred_more ZH, hundred_less ZJ (task presets of add_sub_10s / add_sub_100s), missing_mult_only ZK, missing_div_only ZL
  (new `task` option on missing_mult_div), missing_add_sub_answer ZM. Gates OK: presets-unit, code-snapshot (738), search-terms,
  standards, wrm --report-only, wrm-page-unit, boot-smoke, catalogue. WRM links are `partial` (each covers part of its step).
- **Fix round 2** (builder mq-opus-medium, branch claude/ops-family-fix-r2, 19 commits, merged): F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F12
  F13 F15 F16 F17 F18 F19 fixed with a check + backtest row each (table in "Fix round 2" above); F11 no repro (CELL-ONE guards it);
  F14 fixed for Test / anchor chart, **Mixed practice page still 38 % empty: the mixed path is mixed-m2's**. div_zero HELD OUT
  (not attempted). The builder was STOPPED by the pause while it ran `ws-precritic --role lesson`: the precritic table for
  round 2 was NOT completed, and the byte-identical check of the redesign-passed default pages was NOT run on the merged tree.
- Post-merge on lane HEAD: ws-boot-smoke OK, ws-presets-unit OK, ws-code-snapshot OK (738).
- **Card ops-g1**: card.json now carries the 7 presets in skills.include and all **83** live lines decided `offered`
  ("offered, as built", owner 2026-10-31; 83 not 81 because the presets and the new `task` option add lines). Regenerated with
  --resign. **NOT signed**: `--check-signed` fails on rule coverage: 38 rule ids cited by past critics for equation/division
  are missing from §4 (AK-1 BD-4 BD-7 BD-10 BD-11 CL-8 FPR-6 FRM-6 FRW-5 FRW-6 GDP-1 GDP-2 P-1 PG-14 RP-1 RP-20 RP-21 SCR-1 SL-2
  SL-3 SP-2 SP-10 SP-12 VA-10 VA-62 VA-66 …; the full list is in the check's output). Signing would be meaningless until they are added.

### Next steps on resume (in order)
1. Card: add the missing rules to card.json (§4 rules / not-applicable with a reason), then
   `node tests/scripts/ws-spec-card.mjs --family ops-g1 --resign`; set the line to `Signed: owner, 2026-10-31` (owner's
   decision already given); `node tests/scripts/ws-spec-card.mjs --check-signed design/cards/ops-g1/ops-g1.md` must pass.
2. `node tests/scripts/ws-options-pin*` / `ws-options-count` for the new missing_mult_div `task` option (timed out at 200 s in the presets build).
3. Byte-identical check of every redesign-passed.js skill's default page vs merge-base 899c147.
4. Merge current claude/sweet-newton-c8wrv1 (and run tests/scripts/ws-teacher-plan-match.cjs, per mixed-m2: F1 row heights feed their flowLayout).
5. `node tests/scripts/ws-precritic.cjs --skill <each of the 4 + 7 presets> --strict` and `--role lesson --strict`; document rows red on main.
6. Critic r2 (mq-opus-medium, independent). Open rulings for it: missing_mult_div "all three notations" H13-ROW (across beside a
   two-line bracket in one row); Mixed practice PAGEFILL belongs to mixed-m2.
7. div_zero_in_quotient lesson chart (engine item) — still open.

Budget: this session ≈ $45–55 est. (≈ 2 % of the weekly limit; builders 226k + ~1.4M tokens est.); cap $150.

## HAND-OVER (2026-10-30, owner pause after the current pieces)

**Nothing passed; nothing goes into redesign-passed.js.** Do not merge this branch for deploy yet: the four sentence skills
are better than main on Independent / More practice / screen hosts (≥ 8 there per critic r1) but fail on Sections, Lesson,
Test S, mixed pages and the Bracket notation. Critic report: design/audit/runs/ops-family/critic-r1/REPORT.md.

### Done (on the branch)
- add_sub_10s / add_sub_100s on the kit `equation` cell (fact look): 10 / 100 more or less than ANY number in the band
  (1.NBT.C.5, 2.NBT.B.8), `task` + band options read, answer line from the widest page answer, hint names the move, page
  dealer with caps. missing_add_sub: default deals the unknown before =, whole numbers, `unknown` default [1].
  missing_mult_div: equation cell in every notation, unknown always before =, box width from the band, Bracket/Fraction-only
  pages deal ÷ only. div_zero_in_quotient: kit `division` bracket, a box over every dividend digit, three kinds.
- Providers + lesson data for all five; kit fixes: equation footprint double-counted unknown digits (DN-22), key value out of
  its box, "thesign" space, Guided strip `_sign_`, lesson practice packs one-line fact sentences 10 a page, CL-40 pad,
  card shows `q.screenInstr`; layout.js `topFill` (top-start one-line sections fill the grid); ws-card-rulings readItem
  reads a missing-number sentence's result as the answer.
- Spec card drafted UNSIGNED: design/cards/ops-g1/ops-g1.md (81 option/host lines undecided).
- PNGs: design/status/ops-family/before|after/<skill>-{paper,card}.png (independent paper L + card 1280, all five).

### Remaining (next round, rebuild of failed work → mq-opus-medium)
1. F1 Sections overflow — the sections composer (print-sheet.js shareRows / resolveBandedLayout) must size rows from
   `measured[cols]` at the drawn column count. Engine-owned; was red in precritic before the critic.
2. F5 Bracket notation: quotient above the bar, never "= 7" after it; never mix bracket items with × in one section.
3. F6/F7/F8 options: missing_mult_div products ≤ Max; missing_add_sub "Up to 100" must deal past 20; support `level`
   must change print (or declare levelSubset).
4. F2/F17/F11/F3/F18 lesson: anchor chart page fill, warm-up band, one item per box, vocab pairs, warm-up grade.
5. F4 role titles; F9 Test S empty ruled cell; F10 M capacity > L; F13 mixed heading; F14 page fill on mixed/Test;
   F15 card 390 gap; F16 hints; F19 tags (add_sub_10s primary 1.NBT.C.5; EE for missing_*), option help text.
6. div_zero_in_quotient: lesson.js chart cannot hold a 6-row bracket (engine item, no owner); then its own critic.
7. Word problems: wait for design/specs/visual-redesign-2026-10-30.md (not on main at stop time).

### Open decisions (lead / owner)
- Sign the ops-g1 spec card (81 undecided lines).
- Presets (owner rule "a distinct option is also a findable skill"): 10 more, 10 less, 100 more, 100 less; missing_mult_div
  × only / ÷ only; missing_add_sub with the answer position. Not built.
- options-render: is Fraction a drawing change (accept 28/15 capacity) — lead ruled yes in-lane; confirm.
- Owner of the sections composer row sizing (F1) and lesson.js long-division chart.
- Advisory from the critic, outside this lane: quiz builder's own print (printQuizTest) is the legacy renderer for every
  skill; Fact rows / probe refused with a false reason; Guided / Scripted model pages at L 45–70 % empty.

### Per-round findings (rule 00) — critic r1
Automatic checks that would have caught each finding: see the Check column of REPORT.md. Already existing and red at
round start: F1 (slot-clip), F17 (print-lint lesson). Not on precritic's path: L1 --sizes (F10), PAGEFILL on mixed/Test
(F14), card-rulings (SKIPPED because the card is unsigned → F6). New checks proposed: lesson p1 PAGEFILL, VOCAB-TYPE,
ROLE-TITLE, L-NOTATION, options-verify range-max + level, EMPTYCELL, L-CELL-ONE, L-ANSAREA SHAPE, mixed heading,
phone-card inner gap, providers HINT, warm-up grade, OPTION-HELP dealable example.
Speed-ups: see design/status/speed-audit.md "ops-family 2026-10-30".

## Owner design list

## Times
- Times: G1 build (builder, Opus 5.5 medium) 2026-10-30 17:35 -> see Log; precritic runs ~45 min each (matrix ~25 min of it, two browser slots).

## Per-round findings

## Fix round 2 (2026-10-31, builder mq-opus-medium: rebuild of failed work) — branch claude/ops-family-fix-r2
Merged the presets (0d58680). Each finding: fix → check (backtest row in tests/fixtures/precritic/backtests.json, FAIL on
899c147, PASS on the fix; all 12 rows PASS).
| F | Fix | Check · backtest row |
|---|---|---|
| F1 | print-sheet.js shareRows: a section is held to the widest column count whose MEASURED height (+2.5 mm label spacer for sentence sections) fits its share; a sentence section's least row is its row at the chosen column count (layout.js / paginate.js untouched) | print-lint L-OVERFLOW --kind sections · ops-f1-sections-clip |
| F5 | equation.js: `fact` + bracket draws the quotient above the bar, no "="; a Bracket page deals ÷ only (the ×/÷-only `task` path of the presets kept) | print-lint L-NOTATION VA-61 / VA-65 · ops-f5-bracket-notation |
| F6 | missing_mult_div deals factor pairs with f1 × f2 ≤ Max (at Max 100 the tables stop at 99) | node-lint OPT-VALUES range-max · ops-f6-f7-f8-f19-opt-values |
| F7 | missing_add_sub honours an explicit Max Number past the grade cap ("Up to 100" deals to 100) | OPT-VALUES range-reach (same row) |
| F8 | levelSubset([3, 1]) on the 4 skills; level 3 writes the answer in trace grey (`trace` payload) | OPT-VALUES level-dead (same row) |
| F19 | tags: add_sub_10s primary 1.NBT.C.5; EE M.EE.1.OA.5 (missing_add_sub), M.EE.3.OA.1 (missing_mult_div; no EE links 1.OA.D.8 / 3.OA.A.4 - closest); notation labels show dealt forms | OPT-VALUES example-not-dealt (same row); ws-standards OK. A card-vs-tag check is not built: the card is unsigned, so there is no signed primary to compare |
| F2 | lesson.js: `second.whole` shows the other sign's example whole under the panels and spreads one-line panels (to 1.6×); lesson data adds the other-sign case | print-lint PAGEFILL on the anchor chart · ops-f2-chart-pagefill |
| F17 | missing_add_sub warm-up: add_facts + sub_facts across (one shape a row) | print-lint lesson H13 / H13-ROW (ops-f2 row's lint run) |
| F11 | no repro on the merged tree (each Guided / Independent sentence has its own box at S) | print-lint L-DENSITY CELL-ONE (new, guards it) |
| F3 | vocab: "whole" = part-whole bar with the whole marked; "factor"/"6 × 7" replaced by "times" = × | node-lint LESSON-DATA vocab-type · ops-f3-f18-lesson-data |
| F18 | warm-ups at or below grade (add_sub_10s: base10_build, tens_foundation_visual; mult/div facts to 10 × 10) | LESSON-DATA warmup-grade (same row) |
| F4 | compose.js topicOf: every joined verb takes -ing | node-lint ROLE-TITLE · ops-f4-role-title |
| F9 | test.js: a full Test takes a neighbouring column count that divides its ceiling; a Test of top-start sentences takes its grid | print-lint L-DENSITY EMPTYCELL · ops-f9-test-emptycell |
| F10 | missing-number sentences on the tight across tracks (paper); M prints 3 × 8 = 24 (was 16 = L) | print-lint L-DENSITY SIZE-M · ops-f10-size-m (node-lint L1-M added, but node footprints did not catch it) |
| F12 | `slotShape: 'box'` when answers mix with missing numbers | print-lint L-ANSAREA SHAPE · ops-f12-slot-shape |
| F13 | `q.sectionLabel` names the operations dealt ("Adding and subtracting", "Dividing") | print-lint L-NOTATION HEADING · ops-f13-mixed-heading |
| F14 | Test pages fill (above); PAGEFILL now on anchor chart / Test / Mixed. **Mixed practice page still 38 % empty: the mixed path (print-sheet 3160-3640, flowSections) is mixed-m2's** | print-lint PAGEFILL (extended) |
| F15 | screen-cell.css (additive): on a phone the sentence wraps its slot under, 12 px inside the border | ws-phone-card GAP · ops-f15-phone-gap |
| F16 | hints name the item's numbers (missing_mult_div, missing_add_sub answer items) | node-lint HINT · ops-f16-hint |
| div_zero | HELD OUT again: not attempted (lesson.js chart vs a 6-row bracket; no room in this round's budget) | — |
Open (not this lane's): Mixed practice PAGEFILL (mixed-m2); missing_mult_div "all three notations" options page H13-ROW (an across
sentence beside a two-line bracket / fraction in one row: CL-4b top-start vs centred write-above; needs a ruling); sections PG-23
on the partner skills' second page (tape_diagram / perimeter_intro pagination, as in r1).
After PNGs: design/status/ops-family/after-r2/ (paper L independent ×4, sections ×2, card 1280 / 390 ×4).

## Log
- 2026-10-30 G1 build (builder session_013pHDnPm6jsqM66jkj7eD7L, Opus 5.5 medium; first builds on uncertified pairs, rule 0a).
  - Before PNGs: design/status/ops-family/before/<skill>-{paper,card}.png (independent L, card 1280).
  - Spec card design/cards/ops-g1/ops-g1.md drafted, UNSIGNED (owner signs; 81 option/host lines undecided).
  - Built: add_sub_10s / add_sub_100s (any number in the band, task + band options read by the generator, equation cell
    with the across-fact look - NOT `fact` horiz: measured 3 x 4 = 12 at S and L, cells > 50 % empty); missing_add_sub
    (unknown before = by default, answer opt-in, whole numbers only); missing_mult_div (unknown before =, equation cell
    in every notation); div_zero_in_quotient (kit `division`, box over every dividend digit, 2 work rows a digit).
    Providers + lesson data for all five; page dealer with caps (a <= 2, answer <= 3, no pair twice in 20).
  - Kit fixes found on the way: equation footprint counted the unknown twice (DN-22); key value hung out of a box;
    "Look at thesign." (flex ate the space); Guided strip printed `_sign_` raw.
  - Preset candidates for the lead (not built): 10 more, 10 less, 100 more, 100 less (task presets of add_sub_10s/100s);
    missing_add_sub with the answer position; missing_mult_div × only / ÷ only.

  - Precritic (merged with main 89a19189, commit a42b896d), `--strict`: 12 PASS, 8 FAIL, 1 N/A, 3 SKIPPED/INCOMPLETE.
    Green: node-lint, code-snapshot, LESSON-DATA/OPTION-HELP/WRONG-FITS, content-audit, options-verify, print-lint L,
    screen-slots, screen-answer, boot-smoke, chromebook-fit, phone-card, coverage-matrix.
    Red (ours, open): print-lint S (add_sub_100s PAGEFILL at count 20; div_zero H13 side band 34 % - the `division`
    template's own, long_div_2digit pinned at 31 %), print-lint M (add_sub_10s PAGEFILL at count 20), lesson L/S
    (div_zero chart overflow + illegible words under a 6-row bracket; missing_add_sub warm-up add_facts cell 34 % band),
    dealer-uniform (div_zero: zero digits are the skill - the learner cannot express "has a 0"; missing_mult_div ÷:
    divisibility not learnable), options-render (missing_mult_div Fraction mixes 2-line ÷ with 1-line ×), slot-clip
    (add_sub_10s/100s across fact drawn beside in a mixed-sections column: render has no column count), sibling-compare
    (no approved sibling on `equation` / `division`: 145 counts unproven).
  - After PNGs: design/status/ops-family/after/<skill>-{paper,card}.png. Run logs: design/audit/runs/ops-family/.
- 2026-10-30 G1 fix round (lead ruling): add_sub_10s, add_sub_100s, missing_add_sub, missing_mult_div only.
  - Times: fix round ~75 min builder wall time (sibling check 5 min, fixes 25 min, slot-clip attempt 15 min + 20 min rerun, gates 10 min).
  - Rulings recorded: `equation` + `fact: true` accepted for add_sub_10s/100s (card updated); missing_mult_div keeps no
    product/quotient-after-= (option/preset candidate); div_zero_in_quotient HELD OUT of the critic round.
  - OPEN ENGINE ITEM (no owner in this lane): lesson.js chart cannot hold a 6-row long-division bracket (div_zero lesson
    L/S: OVERFLOW ×8, ILLEGIBLE ×6 - the step words fall under the drawing into the Say / Rule bands; a zoom-below-1
    fallback did not help and was reverted). div_zero's S side band (34 %) is the class pinned on long_div_2digit (31 %).
  - Fixed: PAGEFILL (S add_sub_100s 29 %, M add_sub_10s 27 % -> clean; sibling sub_100_no_regroup clean on main, so ours
    was fixed: a section of top-start one-line sentences fills the grid, layout.js `topFill`); options-render Fraction
    (H13 + CL-40 -> clean: a Bracket/Fraction-only page deals ÷ sentences only, the fraction sentence clears the label);
    dealer-uniform (missing_mult_div 1 -> OK: ws-card-rulings readItem reads a missing-number sentence's result as `ans`,
    and the page dealer caps the result too; results for the 7 approved / div_facts / add_facts unchanged).
  - Still red: options-render capacity, Fraction ticked (S 28 vs 30, L 15 vs 16: the two-line fraction form is a drawing
    the tool counts as appearance - asks for a ruling); slot-clip on mixed-sections pages (add_sub_10s/100s, CLIP 6-8 own
    a row): see cause below.
  - slot-clip cause: on a Sections sheet the composer gives the add_sub across-fact rows the BESIDE-form height
    (17.3 / 14.9 / 12.4 mm at L / M / S) while the cell, at 3-4 columns, draws the answer-below form (~26 mm at L), so it
    spills 4-8 mm. Change needed: the sections composer (print-sheet shareRows / resolveBandedLayout) must size a section's
    rows from `measured[cols]` at the column count it finally draws. Attempt (draw below whenever the column count is
    unknown) moved the spill from horizontal to vertical; reverted.
Times: critic r1 (mq-opus-medium), start 2026-10-30T~22:15Z, wall ≈ 1 h 50 min (≈ 50 min renders on one browser slot), tokens ≈ 353k — FAIL min 4.
Times: lane totals — builder 2 runs ≈ 4 h 50 min, 646k tokens; critic 353k; lead session cost see report.
