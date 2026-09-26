# Error-analysis round 5 — independent critic (2026-09-26)

Tree 99d2f50. Grades: branch `critic-ea-r5` b6f1817, `design/audit/runs/ea-r5/grades.jsonl` (108 page lines + 6
independent samples). Renders `ws-grade-render.cjs --roles error-analysis --size L|S --no-screen --dpi 120`.
H13 applied when a full band ≥ 30 % or a 60 %-span strip ≥ 45 %.

**Result:** S 7/27, L 10/27, both sizes + keys 3/27 skills (add_three, count_objects, round_nl_ten_thousands).
Keys: 52/54 correct (compose_shapes L b keyed "Correct" for a hexagon the pieces cannot make — H1; mixed_placevalue S f
"10 = [1]" keyed as needing a fix). Every "wrong" item is really wrong. Independent sample: 6 keys correct and
facsimiles; div_remainders H13 34.6 %; fractions:compare, tally C3 7.

Slot sizes: write box 25.6–25.8 mm wide, 13.3–13.8 tall at L, 9.5–9.7 at S; check box 6.8 / 4.7 mm; sign circle
11.4 / 7.6 mm. S write box is at the writing-height floor (K writer < 8 mm).

## Per skill (S items / L items; S grade; L grade)
add_three 6/4 pass/pass · count_objects 6/4 pass/pass · round_nl_ten_thousands 3/2 pass/pass · add_5_pictures 6/4
8787 / pass · perimeter_intro 4/2 pass / 8868 · classify_count 4/4 8878 / pass · compare_groups 4/4 8878 / pass ·
hundreds_chart_fill 4/4 7878 / pass · number_chart_fill 4/4 7877 / 7877 · teen_compose 4/4 8878 / pass ·
div_remainders 6/4 7868 H13 (31.8 %) / 7878 · fractions:compare 6/4 8868 H13 (30.8 % W) / 8878 · fractions:identify 6/4
6786 / 6786 · bar_graph 2/1 pass / 8738 H5 · pictograph 3/2 8788 / 8788 · tally_chart 4/2 7878 / pass ·
bar_graph_intro 2/1 6878 / 8738 H5 · money_compare 6/4 6788 / 6788 · pictograph_intro 4/3 7688 / 7688 · reading_ruler
3/2 8478 / 8468 · temperature 4/2 pass / 8868 (40.9 % strip) · round_nl_hundred_thousands 3/2 8688 / 8788 ·
round_nl_thousands 3/2 pass / 8788 · placevalue:compare 6/4 8768 H13 (51.5 %) / 8868 H13 (56.9 %) · mixed_placevalue
6/4 6467 / 6766 H13 (38.1 %) · compose_shapes 2/2 5466 / 5366 H1 · nl_sub 3/3 8778 / pass.

## Prior defects re-checked
Fixed: missing pages (fractions:compare, perimeter_intro, temperature, bar_graph now print); add_three H1; H13 bands
(round_nl 30→13, classify 29→13, div_rem L 33→17, count_objects 45/34→21/12, ruler 36→10, tally 45→23, pictograph_intro
34–36→15); instructions and slot labels (compare_groups / money_compare "check Fix it", "Sam chose"; compare skills fix
with a sign circle; chart skills label fix boxes A B C); rounding dots grey and placed; nl_sub hops agree; block position
consistent on pictograph_intro S, compose_shapes S, tally L.

Not fixed: bar_graph and bar_graph_intro 1 per page at L (H5); several slot shapes in one section (bar_graph_intro S,
fractions:identify, mixed_placevalue); Correct/Fix block not in one place (tally S; newly hundreds S, number_chart S+L,
fractions:identify S, bar_graph_intro S, mixed_placevalue S — stacked for multi-blank, inline for one-blank);
placevalue:compare H13; mixed_placevalue "10 = [1]"; number_chart_fill "All levels" tab / "Grade mixed" footer / 3-digit
numerals crowd tracks; content (pictograph icons contradict rows; money_compare sets not in panels; reading_ruler copy
task; round_nl_hundred_thousands deals only 900,000–1,000,000; add_5_pictures repeats at S; div_remainders counters
4.7 mm rows of 10; nl_sub pupil hops black; compose_shapes legacy cell with the result drawn).

## Defects by root cause
**A. Page layout wastes size S and leaves strips (14 versions)** — `sheet/roles/error-analysis.js` (`measuredLayout`,
`plan`), `sheet/layout.js` (`rowGapFor`). S no fuller than L on compare_groups, classify_count, teen_compose,
hundreds_chart_fill, number_chart_fill, nl_sub, compose_shapes (drawings don't scale, L1). Spare height becomes a ~24 mm
strip between rows plus one under the grid (18–33 % on div_remainders L, teen S, reading_ruler L, mixed_placevalue S).
One column where two fit: placevalue:compare and fractions:compare (H13), perimeter_intro L and temperature L (2 where S
fits 4). Bar graphs 1 per page at L (H5).

**B. Correct/Fix block and fix slot vary within a page (9 versions)** — `error-analysis.js` (judge modes,
`answerParts` / `glueOf`, `plan`). Multi-blank items stack the block, one-blank inline; tally cell puts its question
beside the chart in one cell, below in others; mixed pools print several slot shapes in one section; "3/5" split into a
slashed two-box slot (a slashed fraction on paper); **fix box width follows the right answer's length — gives the answer
away** (round_nl_thousands L 47 vs 55 mm; hundred_thousands 63.5 vs 79.6 mm); fractions:identify says "wrote" for a
circled choice and prints the given prompt in pupil grey.

**C. Item content and drawings (12 versions)** — gen-geometry compose_shapes (result drawn, H1 hexagon, K writes a word);
gen-measurement reading_ruler copy task; cells/figures pictograph icons; cells/coins money_compare panels; gen-algebraic
mixed_placevalue "10 = __" without a unit and "80 = 80 + 0", hundred_thousands 900k–1M only; cells/ops-counters
div_remainders 4.7 mm counters rows of 10, single-row pictures 32 % band; gen-counting add_5_pictures repeats at S;
gen-operations nl_sub repeats and a missing-change item; providers/pv.js and providers/fractions.js every fixed sign on a
page is ">" (L10).

**D. Frame metadata** — data.js grade, sheet/adapters.js title, standards.js footer: "All levels" / "Grade mixed" on
number_chart_fill and mixed_placevalue; titles "I Can work on mixed place value", "I Can work on combine shapes",
div_remainders "I Can divide by 2-6" (no remainders); temperature footer has no code; pictograph_intro tabbed K with a
1.MD.4 code.

## Top fixes
1. Scale drawings from ctx.metrics at S; let the page reach the S ceiling of 6 (~6 S versions).
2. One Correct/Fix layout per page: multi-blank fixes inline with captions; chart cell's question follows the page mode.
3. Two columns for one-line items and small figures; two bar graphs per L page (3 caps, 4 C3 fails).
4. Fix slots: stacked fraction slot; width from the widest possible answer; one item kind per section; "chose" for
   circled items; prompt in black.
5. Content: compose_shapes kit cell (pieces only, word bank, only makeable compositions); ruler items that measure;
   pictograph icon per row; coin panels; even hundred-thousands spread; no "N = __" without a unit.
