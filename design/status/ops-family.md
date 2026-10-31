Lane: ops-family
Title: Operations family lane (work order item 4) — first family lane
Session: session_013pHDnPm6jsqM66jkj7eD7L (lead session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-ops-family (base claude/sweet-newton-c8wrv1 fbeaa332)
Scope: addition / subtraction / multiplication / division skills, EXCEPT fact skills (Lane D) and the 7 passed column-subtraction skills
State: STOPPED (owner pause, 2026-10-30) after G1 critic r1 FAIL — hand-over below
Updated: 2026-10-30
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
