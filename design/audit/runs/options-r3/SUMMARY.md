# Option panels, round 3 — independent critic (OPTIONS-RUBRIC v2)

Tree `claude/sweet-newton-c8wrv1` @ 9babcc0, 2026-09-25. Scope: 123 skills (K-2, integers lines, fractions,
fraction_operations like, shapes_early, area_perimeter, angles_lines, coordinates, measurement, graphs, round_nl).
Per-skill rows (O1–O6, caps, 349 defects with criterion / what / fix): `grades.jsonl`.

**Result: 3 / 123 pass** (round_nl_thousands, round_nl_ten_thousands, round_nl_hundred_thousands). 16 fail on one
criterion only (7 of them only on OC14 Size S: mixed_counting, compare_groups, mixed_comparing, identify_angles,
elapsed_mixed, elapsed_find_start, teen_compose).

Below 8 per criterion: O1 54 · O2 84 · O3 94 · O4 34 · O5 72 · O6 110. Caps: OC14 ×87, OC8 ×12, OC4 ×11, OC15 ×9,
OC11 ×2, OC3 ×1, OC1 ×1. Verifier: 760 values, 759 pass (mixed_graphs "Numbers for the whole review: Harder" does
nothing — OC1). The controls are wired; the panels fail on what the controls produce on paper and on missing controls.

| Family | skills | pass | O1 | O2 | O3 | O4 | O5 | O6 |
|---|---|---|---|---|---|---|---|---|
| counting | 4 | 0 | 8.3 | 7.8 | 6.8 | 8.0 | 7.5 | 4.8 |
| comparing | 4 | 0 | 8.0 | 7.5 | 6.8 | 9.0 | 7.8 | 4.8 |
| composing | 18 | 0 | 7.3 | 6.9 | 5.8 | 8.2 | 7.6 | 5.5 |
| integers (number lines) | 3 | 0 | 7.0 | 7.3 | 6.0 | 8.7 | 7.7 | 4.3 |
| fractions | 5 | 0 | 7.8 | 6.8 | 5.2 | 5.4 | 6.4 | 3.8 |
| fraction_operations (like) | 8 | 0 | 6.5 | 6.0 | 5.6 | 4.8 | 6.4 | 3.8 |
| shapes_early | 2 | 0 | 8.0 | 6.5 | 8.0 | 9.0 | 8.0 | 4.5 |
| area_perimeter | 13 | 0 | 7.0 | 6.5 | 5.1 | 7.8 | 7.5 | 3.7 |
| angles_lines | 7 | 0 | 7.3 | 6.6 | 5.6 | 8.3 | 7.6 | 4.4 |
| coordinates | 10 | 0 | 7.2 | 6.1 | 6.1 | 8.7 | 7.2 | 2.7 |
| measurement | 36 | 0 | 8.3 | 7.4 | 7.1 | 8.5 | 7.1 | 5.7 |
| graphs | 10 | 0 | 6.9 | 6.2 | 4.9 | 5.5 | 6.8 | 3.9 |
| round_nl | 3 | 3 | 9.0 | 9.0 | 9.0 | 9.0 | 8.0 | 8.0 |

## Root causes
1. **Size S ignored (OC14, 87 skills):** same columns × rows and drawing size at S as at L; drawings are fixed-size,
   not scaled from `ctx.metrics`. Files: `sheet/cells/*`, `sheet/layout.js`, legacy measurement in `print-sheet.js`.
2. **Cells far too big (1–3 items per A4):** fraction_number_line, area_unit_squares, perimeter_grid, coordinate_q1,
   coordinate_graph, geo_reflect/rotate/translate, mixed_area_perimeter default, fraction No-Visuals and pictures-off
   pages, money_count notes+coins; many more 2–4 with half-empty cells.
3. **Broken content no option fixes:** write_fraction / equiv_frac_visual default circles unshaded under "Write the
   fraction that is shaded"; identify "Pick the model" prints no models; build_bar_graph axis 0, 1.8, 3.7, 5.5 … 11;
   line_plot_fractions tick labels out of order, unequal fractions equally spaced; select_even_odd "Up to 10" prints
   11–19 and always says "even"; number_word_form "Up to 10" makes every item "ten"; fraction No-Visuals item-type
   ticks don't limit the page; volume_composite prints single cubes; area (grade 3) prints ½ × b × h triangles.
4. **No support control where a hint could fade (O3 < 8 on 94):** 12 skills print an unfadeable hint (OC8: formula
   boxes, blue definition boxes, "one frame is one ten", paired dots, equation frames); graphs, coordinates, most
   composing and No-Visuals twins have no support control.
5. **Missing difficulty controls (O2 < 8 on 84):** mixed-number regrouping, like/unlike denominators for compare,
   bar-graph scale, item type on the Visual fraction-op twins, triangle type for area_triangle, slide distance; some
   values fall outside the skill's name (make_ten "Make 20", reading_ruler_hard "Whole inches").
6. **Wording (O5 < 8 on 72):** subtraction twins' labels use addition examples; bar_graph has two "Bars"; fraction
   identify/compare print place-value "I Can" titles (shared id); page instructions don't follow the chosen value
   (elapsed, money_compare, time_analog_digital, tally_chart, temperature); help cites "ruling Q11"; money labels
   say riyals/dollars under Plain numbers; "(default)" marked inconsistently.
7. **Figure labels missing (OC15 ×9)** and small print everywhere (axis numerals, ticks, side lengths, nets,
   counting track at ≈ 5–8 pt).
8. **Mixed reviews:** members' appearance options unreachable from the review panel; mixed_composing,
   mixed_area_perimeter, mixed_coordinates could not be reproduced by the verifier; several reviews lack
   whole-review Numbers / Support.

## Files that must change
`sheet/cells/*`, `sheet/layout.js`, `print-sheet.js` (1, 2, 7) · `svg-fractions.js` / fraction cell (unshaded circles)
· `gen-fractions.js` (fractions + 8 fraction_operations) · `gen-data-stats.js` (10 graphs) · `gen-geometry.js`
(area_perimeter, angles_lines, coordinates) · `gen-counting.js`, `gen-algebraic.js` (composing, counting,
comparing) · `gen-measurement.js` (instructions per value, riyal coins, elapsed line, temperature) ·
`skill-options.js` (labels, missing options, whole-review controls) · `skill-options-ui.js` ("(default)", "none
ticked") · the "I Can" title lookup in `print-sheet.js` (shared ids).
