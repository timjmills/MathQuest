Lane: ops-family
Title: Operations family lane (work order item 4) — first family lane
Session: session_013pHDnPm6jsqM66jkj7eD7L (lead session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-ops-family (base claude/sweet-newton-c8wrv1 fbeaa332)
Scope: addition / subtraction / multiplication / division skills, EXCEPT fact skills (Lane D) and the 7 passed column-subtraction skills
State: G1 building
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
| G1 one-line sentences | addition:add_sub_10s, addition:add_sub_100s, subtraction:missing_add_sub, division:missing_mult_div, division:div_zero_in_quotient | fact (horiz), equation, division | building |
| later | word problems (wait for the spec), box_division / area_model_div, number families, mult_properties … (BACKLOG ops list) | — | queued |

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

