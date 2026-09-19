# Family review: geometry

Categories: `shapes_early` (17), `area_perimeter` (13), `angles_lines` (7), `shapes_classify` (6), `coordinates` (10), `geo_mixed` (3). 56 skills. Generator: `js/modules/gen-geometry.js` (three skills live in `js/modules/gen-measurement.js`: `order_objects_length` :83, `measure_nonstandard` :148, `perimeter_intro` :913). Machine-readable tags and verdicts: `design/catalogue/geometry.overrides.json`.

## Family summary

1. Verdicts: keep 9, fix 20, redo 10, merge 2, split 15 (total 56). All 56 get host `visual-grid`; the catalogue's guesses of `word-problems` (7), `k-counting` (1), `equation-drill` (1), `computation-grid` (2) and `unassigned` (7) are wrong for this family.
2. Worst problem 1: answer leaks. The correct option is drawn green and the three wrong ones blue in all three transformation skills (`gen-geometry.js:3329`); printed "Plot points" grids already show a dashed circle on every target point (`print-generate.js:8080`); `compose_shapes` draws the finished shape next to "?" (:1136-1141); `shape_attributes` numbers the sides 1..n, so the last number is the answer (:1592-1603); option tiles carry the shape's name under the picture (:1390, :1515, :4597, hotspot label :4716), e.g. "Circle ALL the cones" with every tile captioned "cone".
3. Worst problem 2: blank print. `print-settings.js:1369-1389` copies a fixed list of fields and drops `q.tiles`, `q.bins`, `q.hotspotSvg`, hot-spot data and option SVGs. Result in the baseline: `shape_name_match_2d/3d`, `compose_hexagon`, `compose_rect_from_squares`, `hotspot_quads`, and every hot-spot and picture multi-select variant (`identify_angles`, `identify_lines`, `symmetry`, `classify_triangles`, `shape_attributes`) print a prompt with no figure. No answer sheet can be made for a page with no question on it.
4. Worst problem 3: silent type mixing (P-28). 17 ids rotate at random through 2-3 response types or problem types: a 30% multi-select and a 28.6% hot-spot branch sit in front of five skills (:25, :136, :1347, :2304, :2384, :2544, :2601, :3034, :3082, :4453, :4547); `perimeter`, `area`, `volume` rotate figure / missing side / story (:2026, :2127, :2217); `perimeter_grid` is 40% grid, 25% L-shape, 35% no grid at all (:1838); `coordinate_graph` picks quadrant I or all four at random (:3365).
5. Worst problem 4: skills that do not teach what the label says. `volume_composite` draws one plain box (:1719-1735). `measure_angles` has no protractor: the screen is a 4-option guess from 8 benchmark angles, the paper item is "Estimate this angle" with a write-in line (parity break, P-29), and obtuse angles are clipped on paper. `compose_rect_from_squares` is one fixed 2 x 3 item (distinct = 1 of 12). `classify_quads` marks true statements wrong (a square's options can include "Rhombus" and "Parallelogram" as wrong answers, :4634-4647) while its own hint says a square is a rhombus (:4660).
6. Worst problem 5: three different trapezoid conventions in one file (inclusive at :530-545, exclusive at :4604, and "1-2 most salient categories" at :4634). The paper version of `classify_quads` lists 7 boxes including "Quadrilateral" but says "check 1".
7. Also family-wide: colour carries meaning almost everywhere (part A blue / part B orange, red slice plane, coloured point labels, green parallel marks); real emoji are used as shapes in `name_2d_shapes` and `name_3d_shapes` (:27-34, :138-143: ice cream = cone, battery = cylinder, mountain = pyramid); formula boxes print on practice items (`STUDENT_DEF_*` :17-19, "Use A = (b x h) / 2" :3649, "Volume Formula" box); prompts use capitals for emphasis ("BOTH ... AND", "TOTAL", "AND NO RIGHT ANGLES") and run to 22-26 words.
8. What is already good: SVG figures exist for every skill and are drawn to scale; `area_triangle` forces a whole-number answer (:3612-3616); `coord_distance_q1`, `perimeter_intro`, `area_unit_squares`, `place_symmetry_lines` and `net_identify` are sound tasks; `count_sides_vertices_2d` has true scalene and irregular shapes; ranges are small and mostly scale with `Math.sqrt(state.range)` / cube root as CLAUDE.md asks; the three word-problem branches at :5004-5150 (`area_word_problems`, `perimeter_word_problems`, `area_perimeter_word`) are written but not listed in `data.js`, so they can seed the new story skills.
9. Existing worked-solution text is the hint restated as one equation in 2-3 lines (catalogue `workedMax` 2, `solStepsMax` 3; only `area_perimeter` reaches 5-7). It is usable as the key line, not as `workedSteps`. `workedSteps`, `wrongAnswer`, `Say:` frame and vocabulary must be authored for every non-mixed skill. 17 skills have no worked text at all (angles_lines 5 of 7, coordinates 7 of 10, shapes_classify 2, geo_mixed 1).
10. The ladders in `design/EXTENSION_PLAYBOOK.md` 4.1-4.5 fit and are adopted below with corrections. 21 ladder steps have no skill today (see "New skills needed").

## Proposed ladders

One delta per step. "opt" = an option/axis on an existing id, not a new id. `responseScope` values are the contract's.

### SH-A: recognise and count (K-2)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| SH-A1 | Find Triangles (then squares, rectangles, circles, hexagons: one shape per page) | one target shape, standard pictures | `name_2d_shapes` (redo: find-all) |
| SH-A2 | Find Shapes That Are Turned or Thin | representation: rotation, aspect ratio, near-miss non-examples | `name_2d_shapes` opt `varied` |
| SH-A3 | Name a Flat Shape (bank of 3, then 4) | response: copy a name | `name_2d_shapes` opt `task=name`; `shape_name_match_2d` is the match-with-a-line form |
| SH-A4 | Count Sides | response becomes a number | `count_sides_vertices_2d` opt `ask=sides` |
| SH-A5 | Count Corners | the counted part changes | `count_sides_vertices_2d` opt `ask=corners` (alias target of `shape_corners_count`) |
| SH-A6 | Tell Flat From Solid | 3-D enters, two check boxes | NEW `flat_or_solid` |
| SH-A7 | Name a Solid | response: copy a name | `name_3d_shapes` (redo), `shape_name_match_3d` |
| SH-A8 | Count Faces of a Solid | count on a 3-D drawing | `count_edges_faces_vertices` opt `ask=faces` |
| SH-A9 | Count Edges | counted part changes | same id, `ask=edges` |
| SH-A10 | Count Corners of a Solid | counted part changes | same id, `ask=vertices` |

### SH-B: attributes and classifying (grades 1-5)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| SH-B1 | Tell a Polygon From Not a Polygon | non-examples (open, curved, crossing) | NEW `polygon_or_not` |
| SH-B2 | Check for Equal Sides | one attribute, check marks shown | `shape_attributes` (redo) opt `attribute=equal_sides` |
| SH-B3 | Check for a Right Angle | attribute changes | `shape_attributes` opt `attribute=right_angle` |
| SH-B4 | Count Pairs of Parallel Sides | attribute changes | `shape_attributes` opt `attribute=parallel` |
| SH-B5 | Find Shapes With One Attribute | response: circle all in a set | `compose_from_attributes` (redo), one attribute |
| SH-B6 | Find the Quadrilaterals | category word replaces attribute | `hotspot_quads` |
| SH-B7 | Name Quadrilaterals (bank of 3) | naming from marks | `classify_quads` (redo) opt `bank=3` |
| SH-B8 | Name Quadrilaterals (bank of 6) | range of names | `classify_quads` opt `bank=6` |
| SH-B9 | Name Triangles by Their Sides | shape family changes | `classify_triangles` opt `by=sides` |
| SH-B10 | Name Triangles by Their Angles | attribute changes | NEW `classify_triangles_angles` (split) |
| SH-B11 | Find Shapes With Two Attributes | two stacked rules | `compose_from_attributes` opt `attributes=2` |
| SH-B12 | Say Always, Sometimes or Never (hierarchy) | Reason It page only | `classify_quads` `claims[]` |

Follow-on: `net_identify` (grade 5-6), `cross_section_3d` (grade 7 content, keep as optional follow-on).

### SH-C: compose and partition (K-3)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| SH-C1 | Put Two Shapes Together | pick the new shape from 3 outlines | `compose_shapes` (redo) |
| SH-C2 | Fill a Hexagon With Blocks | target outline given, no slot lines | `compose_hexagon` |
| SH-C3 | Tell Equal Parts From Unequal Parts | non-examples, yes/no | NEW `equal_or_unequal_parts` |
| SH-C4 | Count Equal Parts | response becomes a number | `partition_shapes` (keeps `count_parts`) |
| SH-C5 | Name Equal Shares (halves, thirds, fourths) | response: copy a word from a bank of 3 | NEW `name_equal_shares` |
| SH-C6 | Split a Rectangle Into Rows and Columns | draw lines, then count squares (2.G.2) | `compose_rect_from_squares` (redo) |

`partition_shapes`'s "What fraction is shaded? a/b" variant is grade 3 fraction notation and aliases to the fractions family (`fractions:identify_fraction` or that family's equivalent; confirm with the fractions review).

### POS: position words (K)

| Step | Delta | Skill |
|---|---|---|
| POS-1 above / below | two words | `shape_positions` opt `set=above_below` |
| POS-2 beside / next to (left and right side) | new pair | same id |
| POS-3 in front of / behind | new pair | same id (not generated today) |
| POS-4 between | third object | same id |

### AN: angles and lines (grade 4)

Playbook ladder AN-1 to AN-12 adopted. Mapping after this review:

| Step | Skill |
|---|---|
| AN-1 point, segment, line, ray | NEW `name_point_line_ray` (GAP-6-01; `identify_lines` never asks this) |
| AN-2 parallel / perpendicular / intersecting | `identify_lines` (keeps the name-one-pair type) |
| AN-2b find parallel sides in a shape | NEW `find_lines_in_shape` (split of the hot-spot branch) |
| AN-3 angle as a turn | NEW `angle_as_turn` |
| AN-4 right-angle test (yes/no, turned right angles) | NEW `right_angle_test` |
| AN-5 name acute / right / obtuse | `identify_angles` (keeps name-one-angle; "straight" enters as a later range step) |
| AN-5b find angles in a shape | NEW `find_angles_in_shape` (split of the hot-spot branch) |
| AN-6 choose the protractor scale (decide-only) | `measure_angles` (redo) `responseScope=decision` |
| AN-7 / AN-8 / AN-9 read a protractor: tens / fives and ones / ray points left | `measure_angles` opts `precision`, `orientation` |
| AN-10 missing angle on a straight line | `additive_angles` opt `whole=180, unknown=part` |
| AN-10b missing angle in a right angle | `additive_angles` opt `whole=90` |
| AN-11 add two angles (unknown = whole) | `additive_angles` opt `unknown=whole` (not generated today) |
| AN-12a judge a fold line (yes/no) | NEW `symmetry_judge` |
| AN-12b count lines of symmetry | `symmetry` |
| AN-12c draw lines of symmetry | `place_symmetry_lines` |

Follow-on: angles around a point (`additive_angles` `whole=360`), draw an angle (print only).

### AP-P perimeter, AP-A area (grades 3-6)

Playbook ladders adopted. Mapping:

| Step | Skill |
|---|---|
| AP-P1 count around on a grid (rectangles) | `perimeter_grid` (grid rectangles only) |
| AP-P1b count around an L-shape on a grid | `perimeter_grid` opt `shape=L` (later step, delta = shape) |
| AP-P2 add all the labelled sides | `perimeter_intro` (the "labelled" 35% of `perimeter_grid` aliases here) |
| AP-P3 write the missing sides of a rectangle (notate-only) | `perimeter` `responseScope=notation` |
| AP-P4 perimeter of a rectangle, two sides labelled | `perimeter` |
| AP-P5 equal-sided shapes (sides x length) | NEW `perimeter_regular` |
| AP-P6 missing side from the perimeter | NEW `perimeter_missing_side` (split of `perimeter` "missing") |
| AP-P7 perimeter story | NEW `perimeter_word` (seed: :5046) |
| AP-P8 perimeter of an L- or T-shape, all sides labelled, then two missing | NEW `composite_perimeter` (split of `composite_shapes` "perim_only") |
| AP-A1 count unit squares (rectangle) | `area_unit_squares` |
| AP-A2 rows x in each row | `area_unit_squares` opt `frame=rows` |
| AP-A3 area of a labelled rectangle | `area` (rect and square only) |
| AP-A4 choose area or perimeter (decide-only) | `area_perimeter` `responseScope=decision` |
| AP-A5 both P and A | `area_perimeter` |
| AP-A5b missing side from the area | NEW `area_missing_side` (split of `area` "missing") |
| AP-A5c area story | NEW `area_word` (seed: :5004, :5087) |
| AP-A6 split an L-shape (set-up only) | `area_polygon_decompose` `responseScope=setup` |
| AP-A7 write the missing sides (notate-only) | `area_polygon_decompose` `responseScope=notation` |
| AP-A8 area of an L-shape, then T, then U (one shape family per step) | `area_polygon_decompose`; `composite_shapes` "dual_pa" stays as the combine step |
| AP-A9 split a rectangle to multiply (distributive) | `area_distributive_visual` |
| AP-A10 area of a right triangle, then any triangle | `area_triangle` (the triangle branch of `area` aliases here) |
| AP-A11 polygon on a coordinate grid | `coord_polygon` |

### VO volume (grade 5), SA surface area (grade 6)

Playbook ladder VO adopted. VO-1 to VO-3 (count cubes by layer) have no skill: NEW `volume_count_cubes`. VO-4 to VO-6 = `volume` (labelled box only). VO-7 decide square or cubic units = `volume` `responseScope=decision`. VO-8 = NEW `volume_missing_edge`. VO-9 = `volume_composite` (redo as a real two-box figure). Story = NEW `volume_word`. SA-1 name the solid from its net = `net_identify`; SA-2 area of each face (step columns); SA-3 total = `net_surface_area` (SA type only).

### CO coordinates and transformations (grades 5-6)

Playbook ladder CO adopted. CO-1 to CO-4 = `coordinate_q1` with `task=name` and `responseScope` x-only / y-only / both. CO-5, CO-6 = `coordinate_q1` `task=plot` (alias target of `coordinate_graph`), CO-6 adds points on the axes and look-alike pairs. CO-7 = `coord_distance_q1`. CO-8 = `coord_polygon` (side length first, perimeter as a later step). CO-10 = `geo_translate`, CO-11 = `geo_reflect`, CO-12 slide / flip / turn = `geo_rotate` (redo). After the integers ladder: `coordinate_all` name, then plot.

### Skills in no ladder

`mixed_shapes_early`, `mixed_area_perimeter`, `mixed_angles_lines`, `mixed_shapes`, `mixed_coordinates`, `geometry_all`, `measurement_all`, `geo_meas_all` are review pools (Mixed practice, Daily spiral). `order_objects_length` and `measure_nonstandard` sit in `shapes_early` but belong to the measurement family's ladder ME (playbook 4.6). `cross_section_3d` is CCSS grade 7; optional follow-on only.

## Every skill

Host is `visual-grid` for all 56. "W" = `workedSteps` must be authored (existing worked text not usable except where stated). Misconception ids (SH-M, AN-M, AP-M, VO-M, CO-M) are the playbook's; new ones are written out.

| Skill id | Grade | Host | Special tags | Verdict | Defects (short) | To author |
|---|---|---|---|---|---|---|
| `name_2d_shapes` | K | visual-grid | k-one-page, hands-sort, hands-find | redo | 30% multi-select with emoji tiles captioned with the answer (:25-66); only one standard picture per shape, never turned or thin; no non-examples; "diamond", "star" in pool; distractor list omits Oval / Rhombus (:120) | W; SH-M1, SH-M2, "calls any 4-sided shape a square"; Say: "It is a ___. It has ___ sides."; vocab: side, corner, triangle |
| `name_3d_shapes` | K | visual-grid | k-one-page, hands-sort | redo | emoji objects as solids (:138-143); caption = answer; multi-select targets only 4 of 6 (:145); blue fills | W; "names a solid by its flat face (cube = square)", "cone / pyramid swapped", "cylinder / prism swapped"; Say: "It is a ___."; vocab: solid, flat, cube |
| `shape_name_match_2d` | M | visual-grid | hands-match | fix | print blank (no figures, empty word bank); prompt becomes "Write each value onto..."; distractor names star / arrow / crescent (:772); 20 shapes incl. nonagon, decagon in one pool (no range option) | W; SH-M2, SH-M7, "rhombus / parallelogram swapped"; Say: "This is a ___."; vocab from the bank, max 3 new |
| `shape_name_match_3d` | M | visual-grid | hands-match | fix | same print failure; pool not levelled | W; as `name_3d_shapes` plus "prism / pyramid swapped" |
| `shape_positions` | K | visual-grid | k-one-page | fix | colour names the objects (:231, :285); "Beside" is always the right side (:261); no "in front of / behind / next to" (K.G.1); all four words mixed; ball / star / heart are not from the line-art set; "compared to" is hard for ELL | W; "above / below reversed (reads from the wrong object)", "beside taken as between"; Say: "The ___ is ___ the ___."; vocab: above, below, beside |
| `shape_corners_count` | K | visual-grid | k-one-page | merge -> `shapes_early:count_sides_vertices_2d` | twin; regular polygons only, one orientation; every corner pre-dotted (permanent hint); heptagon at K | alias option `ask=corners, maxSides=6` |
| `count_edges_faces_vertices` | 2 | visual-grid | (none) | split | faces / edges / vertices picked at random per item (:359); cone "1 edge, 2 faces, 1 vertex", cylinder, sphere "1 face" are contested conventions (:352-354); hexagonal prism (18 edges) at grade 2 | variants `faces`, `edges`, `vertices`; W each; SH-M6, "counts an edge twice", "counts corners of the front face only"; Say: "A ___ has ___ faces."; vocab: face, edge, vertex |
| `count_sides_vertices_2d` | M | visual-grid | k-one-page | fix | sides / vertices random per item (:1039); vertices pre-dotted in orange (:1046); grade "M" with 3-12 sides in one pool | W; SH-M4, "skips a short side", "counts a curved side"; Say: "It has ___ sides and ___ corners."; vocab: side, corner (vertex from grade 2) |
| `order_objects_length` | 1 | visual-grid | k-one-page, hands-order | fix | bar colour pairs bar and letter; all bars start at the same x, so the unaligned edge case never appears; only shortest-to-longest; print path is generic drag fallback | W; "compares right-hand ends only", "orders longest first"; Say: "___ is shorter than ___."; vocab: shorter, longer, shortest. Ladder ME |
| `measure_nonstandard` | 1 | visual-grid | k-one-page | fix | themed colours; units always end flush, no gap / overlap non-examples (1.MD.2); object and unit both vary at random | W; "counts the gaps", "counts from 1 at the first edge line", "leaves gaps / overlaps"; Say: "The ___ is ___ ___ long."; vocab: long, unit, measure |
| `compose_shapes` | K | visual-grid | k-one-page | redo | finished shape is drawn beside "?" with its seam (:1136-1141), so the item is "name this shape"; 4 fixed items (distinct 4 of 12); parts distinguished by colour; paper answer is a written word | W; "thinks two triangles always make a triangle", "cannot see a turned piece"; Say: "Two ___ make a ___."; vocab: put together, make |
| `compose_hexagon` | 1 | visual-grid | k-one-page | fix | print blank; slot outlines pre-drawn so the task is shape matching; 3 plans only; 12-word prompt with two sentences of mouse instructions | W; "leaves a gap", "overlaps blocks", "uses a block that crosses the outline"; Say: "___ ___ make one hexagon."; vocab: hexagon, trapezoid, rhombus |
| `compose_rect_from_squares` | 2 | visual-grid | (none) | redo | one fixed 2 x 3 item, answer string "2 x 3 rectangle" (:1237-1270); print blank; the CCSS skill (2.G.2) is partition into rows and columns and count | W; "counts only the border squares", "draws unequal rows", "counts lines, not squares"; Say: "___ rows of ___ make ___ squares."; vocab: row, column |
| `partition_shapes` | 1 | visual-grid | k-one-page | split | two types rotate (count parts / write a/b) (:1287); a/b notation is grade 3; parts are always equal, no non-examples; thirds at grade 1 (CCSS grade 2); only vertical strips and sectors | variants `count_parts` (stays), NEW `equal_or_unequal_parts`, NEW `name_equal_shares`; a/b aliases to fractions; W; "unequal parts accepted as halves", "counts lines not parts", "fourths called fours"; Say: "___ equal parts. Each part is one ___."; vocab: equal parts, half, fourth |
| `shape_attributes` | 1 | visual-grid | k-one-page, hands-sort | redo | 70% branch is a third copy of count-sides with the sides numbered 1..n and the shape named in the prompt (:1592-1611); 30% branch is a different skill (:1347); tiles captioned with names (:1390); "green dots" print black | rebuild as one-attribute yes/no (SH-B2 to B4); W; "square corner only if the shape is upright" (AN-M4), "equal-looking = equal without marks", "parallel means same length" (AN-M6); Say: "It has ___ right angles."; vocab: right angle, equal sides, parallel |
| `compose_from_attributes` | M | visual-grid | hands-sort | redo | prompts 17-22 words with capitals and a bracketed second sentence (:1462-1481); 3 of 8 criteria can never be chosen because of the 1-4 match filter (:1492); captions leak ("right triangle", "equilateral triangle") (:1515); no attribute marks on tiles, judged by eye; two attributes before one; "Circle ALL" and "Check the box" on the same paper item | W; SH-M5, "stops after the first attribute", "turned square not counted"; Say: "It has ___ and ___."; vocab: at most 3 attribute words per page |
| `mixed_shapes_early` | M | visual-grid | (none) | keep | inherits; 5 of 12 samples are name-match (pool not weighted); pool must drop alias ids after merges | section instruction that says "mixed" |
| `perimeter_intro` | 1 | visual-grid | (none) | fix | grade tag 1 is wrong (perimeter is 3.MD.8) (`data.js:41`); no `__ + __ + __ = __` frame; rectangle / square / triangle mixed | W; AP-M1, "misses a side", "adds a side twice"; Say: "___ plus ___ plus ___ equals ___."; vocab: perimeter, side, around |
| `area_unit_squares` | 3 | visual-grid | (none) | fix | rectangle and L-shape mixed 60/40 (:1768); hint gives the multiplication; no "rows x in each row" frame; caption colour | W; AP-M3, "counts the border squares only", "skips a row"; Say: "___ rows of ___ is ___ square units."; vocab: area, square unit, row |
| `perimeter_grid` | 3 | visual-grid | (none) | split | three types at random: grid rectangle 40%, grid L 25%, labelled sides with no grid 35% (:1838-1842) | variants `grid_rect` (stays), `grid_L` (option), `labelled` -> alias `perimeter_intro`; W; AP-M3, CO-M4-style "counts squares not edges"; Say: "I count ___ units around."; vocab: perimeter, unit, edge |
| `perimeter` | 3 | visual-grid | sub-notate | split | figure / missing side / story rotate (:2026); missing-side and story items have no figure; stories to 26 words in one line; rectangle and square mixed; `STUDENT_DEF_PERIMETER` box on every item | variants `standard` (stays), NEW `perimeter_missing_side`, NEW `perimeter_word`; W; AP-M1, AP-M2, AP-M4; notate lines: "Write the two missing sides."; Say: "___ + ___ + ___ + ___ = ___."; vocab: length, width, perimeter |
| `area` | 3 | visual-grid | (none) | split | figure / missing side / story rotate (:2127); triangle inside a grade 3 skill (:2175) and its answer can be x.5 (5 x 3 / 2) (:2197-2200); "Multiply the sides" definition box leaks the method (:17) | variants `standard` rect + square (stays), triangle -> alias `area_triangle`, NEW `area_missing_side`, NEW `area_word`; W; AP-M2, AP-M4, AP-M7; Say: "___ times ___ equals ___ square units."; vocab: area, length, width |
| `area_perimeter` | 4 | visual-grid | sub-decide | fix | no discrimination step before it; "Find BOTH ... AND" capitals; definition boxes; square and rectangle mixed | W (existing 5-7 step text is a usable start); AP-M2, AP-M1, AP-M7; decision lines: "around = perimeter", "cover = area"; Say: "The perimeter is ___. The area is ___."; vocab: around, cover |
| `area_distributive_visual` | 4 | visual-grid | (none) | fix | parts told apart by blue / orange (:3563); "TOTAL" capitals; only the total is asked, no step columns; horizontal / vertical split random | W; "adds the two part lengths to the width", "finds one part only", AP-M2; Say: "___ x ___ plus ___ x ___ equals ___."; vocab: split, part, total |
| `area_triangle` | 6 | visual-grid | (none) | fix | right triangles only, height is always a drawn leg; "Use A = (b x h) / 2" printed under every item (:3649); red angle mark | W; "forgets to halve", "uses the slanted side as the height", "halves both numbers"; Say: "___ times ___ is ___. Half is ___."; vocab: base, height, half |
| `area_polygon_decompose` | 6 | visual-grid | sub-notate | fix | the split is already coloured in, so nothing is decomposed by the pupil; L / T / U mixed (:3658); instruction "add (or subtract)" offers two strategies (P-2); inner labels cramped on U-shapes; grade 6 tag for a grade 3-4 skill (3.MD.7d) | W; AP-M5, AP-M6, "uses the full side for a part"; set-up line: "Draw one line."; Say: "Area A is ___. Area B is ___. Total ___."; vocab: split, rectangle, total |
| `composite_shapes` | 6 | visual-grid | sub-notate | split | perimeter-only and P + A dual rotate (:4795); L and T mixed; grade tag as above; long hints with 8 addends | variants `dual_pa` (stays), NEW `composite_perimeter`; W; AP-M1 (adds labelled sides only), AP-M5, AP-M6; notate line: "Write the missing sides."; Say: as above |
| `volume` | 5 | visual-grid | sub-decide, sub-notate | split | figure / missing edge / story rotate (:2217); "Volume Formula" box on paper; no cube-counting stage; stories always inches | variants `standard` (stays), NEW `volume_missing_edge`, NEW `volume_word`; W; VO-M2, VO-M3, VO-M5; decision lines: "flat = square units", "solid = cubic units"; notate: "Write the layers."; Say: "___ x ___ x ___ = ___ cubic units."; vocab: volume, height, cubic unit |
| `volume_composite` | 5 | visual-grid | (none) | redo | not composite: one cube or one box, same as `volume` (:1719-1735); dims 3 to 7 at range 100 (up to 24 at range 10,000) | build a two-box figure with A / B letters and step columns; W; VO-M6, "adds only one box", "counts the shared face twice"; Say: "Box A is ___. Box B is ___. Total ___." |
| `mixed_area_perimeter` | M | visual-grid | (none) | keep | inherits | mixed instruction |
| `identify_angles` | 4 | visual-grid | hands-sort, hands-find | split | three types at random (:2304 multi-select, :2384 hot-spot, :2469 name one); 2 of the 3 print with no figure; degree value printed on the figure (:2488 `showLabel` true), so naming is number comparison; base ray always horizontal | variants `name_one` (stays), NEW `find_angles_in_shape`; multi-select becomes the hands-sort page; W; AN-M2, AN-M4, "obtuse / acute swapped"; Say: "It is ___ because it is ___ than a right angle."; vocab: acute, right, obtuse |
| `measure_angles` | 4 | visual-grid | sub-decide | redo | no protractor; 8 fixed angles; screen = 4 options, paper = write-in (P-29 break); obtuse figures clipped on paper; whole SVG rotated by CSS | W; AN-M1, AN-M2, AN-M3; decision lines: "ray on the right: inside scale", "ray on the left: outside scale"; Say: "The angle is ___ degrees."; vocab: protractor, degree, scale |
| `identify_lines` | 4 | visual-grid | hands-sort, hands-find | split | three types at random (:2544, :2601, :2688); lines / rays / segments vary silently but are never asked (GAP-6-01); green marks | variants `name_pair` (stays), NEW `find_lines_in_shape`, NEW `name_point_line_ray`; W; AN-M6, "lines that would meet off the page called parallel"; Say: "The lines are ___."; vocab: parallel, perpendicular, intersecting |
| `symmetry` | 4 | visual-grid | hands-sort | split | three types at random (:3034, :3082, :3148); count type has 5 regular shapes only (heavy repeats) and its hint names the shape (:3161); heart / butterfly pictures; 0-line shapes never appear in the count type | variants `count` (stays), NEW `symmetry_judge`; the hot-spot type aliases to `place_symmetry_lines`; W; AN-M7, "parallelogram has 2 lines", "counts only the vertical line"; Say: "It has ___ lines of symmetry."; vocab: line of symmetry, fold, match |
| `place_symmetry_lines` | 4 | visual-grid | (none) | fix | no 0-line figures (parallelogram, scalene triangle, letters F, R); prompt always states the count (make it a hint scaffold); repeats in a set of 6; "Shape: ... Lines: N" caption duplicates the prompt | W; AN-M7, "draws a line that cuts equal areas but does not mirror"; Say: "I fold on the line. The halves match."; vocab: fold line, mirror |
| `additive_angles` | 4 | visual-grid | sub-decide | fix | wholes 90 / 180 / 360 mixed (:1633); any whole degree (e.g. 137), no tens-first step; unknown is always a part, never the whole; 22-word prompt; orange / dashed meaning by colour; the visual labels the known part, so the prompt repeats the figure | W; AN-M5, "adds instead of subtracts", "subtracts from 100"; decision lines: "square corner = 90", "straight line = 180", "full turn = 360"; Say: "180 minus ___ equals ___."; vocab: straight angle, whole, part |
| `mixed_angles_lines` | M | visual-grid | (none) | keep | inherits (incl. blank prints) | mixed instruction |
| `classify_triangles` | 4 | visual-grid | hands-sort | split | by sides / by angles at random (:4529); figures carry no equal-side ticks or right-angle square, so the pupil must judge by eye; multi-select branch prints 4 empty boxes; equilateral shown under "by angles" | variants `by_sides` (stays), NEW `classify_triangles_angles`; W; SH-M7, SH-M1, "right triangle only if the right angle is bottom-left"; Say: "It is ___ because ___ sides are equal."; vocab: scalene, isosceles, equilateral |
| `classify_quads` | 5 | visual-grid | hands-sort | redo | true categories offered as wrong options (:4634-4647) against its own hint (:4660); "(select N)" tells how many (:4656); paper shows 7 boxes incl. Quadrilateral with "check 1" (key is wrong); kite drawn like a turned square; trapezoid rule differs from :530-545 and :4604 | W; SH-M2, SH-M3, "parallelogram called rectangle", "trapezoid / parallelogram swapped"; `claims[]` for always / sometimes / never; Say: "It is a ___ because ___."; vocab: parallel, rectangle, trapezoid (playbook exemplar) |
| `hotspot_quads` | 3 | visual-grid | hands-sort, hands-find | fix | print blank; every shape captioned with its name; always exactly 3 quadrilaterals + 2 others (pupils learn "pick 3"); only 4 non-examples, none open or concave; repeats (6 distinct of 12) | W; SH-M2, SH-M5, "only squares and rectangles are quadrilaterals"; Say: "It has 4 straight sides. It is a quadrilateral."; vocab: quadrilateral, side |
| `net_identify` | 5 | visual-grid | hands-match | fix | option letters A-D do not print, so the key "A" points at nothing; nets drawn at different scales; blue fills; invalid nets need checking against research | W; "any 6 squares make a cube", "counts faces only, ignores layout", "prism / pyramid net swapped"; Say: "The net has ___ faces. It makes a ___."; vocab: net, face, fold |
| `cross_section_3d` | 6 | visual-grid | (none) | fix | CCSS 7.G.3, beyond K-6 (`data.js:49` says 6); 16-word prompt; slice plane shown by red fill (:4039); 5 possible answers, 10 items | W; "answers with the solid's name", "horizontal cut of a cone = triangle"; Say: "The cut face is a ___."; vocab: slice, cross-section |
| `mixed_shapes` | M | visual-grid | (none) | keep | inherits | mixed instruction |
| `coordinate_q1` | 5 | visual-grid | sub-notate | split | name / plot alternate (:3368); paper "Plot points" grid shows a dashed coloured circle on each target (`print-generate.js:8080`); x and y never 0 (:3385), so no axis points; 1-3 points at random (:3372); only even axis numbers labelled; point colours | option `task=name|plot` (name is the default; `coordinate_graph` aliases to plot); W; CO-M1, CO-M2, CO-M3; notate: "Write only the first number."; Say: "Across ___, up ___."; vocab: across (x), up (y), ordered pair |
| `coordinate_all` | 6 | visual-grid | (none) | split | same name / plot rotation and the same print leak; needs integers ladder first | option `task=name|plot`; W; CO-M1, "drops the negative sign", "left / down sign swapped"; Say: "x is ___. y is ___."; vocab: quadrant, negative, origin |
| `coordinate_graph` | 5 | visual-grid | (none) | merge -> `coordinates:coordinate_q1` | twin: same code path, plus it silently picks quadrant I or all four (:3365) at grade 5 | alias option `task=plot, quadrants=1` |
| `coord_distance_q1` | 5 | visual-grid | (none) | keep | sound; minor: points never on an axis; coordinates in the prompt allow subtraction without the grid (acceptable) | W; CO-M4, "adds the two numbers", "uses the wrong coordinate"; Say: "From ___ to ___ is ___ units."; vocab: distance, units |
| `coord_polygon` | 6 | visual-grid | (none) | split | side length and perimeter at random (:3847); triangles have a diagonal side that is never asked; prompt lists every vertex (16 words) and the figure repeats them; red labels | option `ask=side|perimeter`; W; CO-M4, CO-M1, "adds only two sides"; Say: "Side AB is ___ units."; vocab: vertex, side length |
| `net_surface_area` | 6 | visual-grid | (none) | split | two types alternate (:3915): "which solid" is a twin of `net_identify`; SA to 600 at range 100 (10 x 10 faces); sits in `coordinates` but is a measurement skill | SA type stays; identify type aliases `shapes_classify:net_identify`; W; "adds 3 faces only", "multiplies l x w x h", VO-M5; Say: "Face 1 is ___ ... total ___ square units."; vocab: surface area, face |
| `geo_reflect` | 5 | visual-grid | (none) | fix | correct option green, wrong ones blue (:3329); 4-quadrant axes with no numbers at grade 5; mirror is always an axis, never a labelled "mirror line"; choose-only, never draw | W; CO-M6, CO-M7, "flips over the wrong axis"; Say: "Each corner is ___ squares from the mirror line."; vocab: flip (reflect), mirror line |
| `geo_rotate` | 5 | visual-grid | (none) | redo | same colour leak; rotation about the origin with the (x, y) -> (y, -x) rule is grade 8; playbook keeps rotation as recognise-only | rebuild as CO-12 slide / flip / turn discrimination + quarter turn about a corner; W; "flip called turn", "clockwise / anticlockwise swapped"; Say: "It is a ___."; vocab: slide, flip, turn |
| `geo_translate` | 5 | visual-grid | (none) | fix | same colour leak; negative moves on unlabelled 4-quadrant axes; choose-only | W; CO-M5, "counts squares from the far side of the shape"; Say: "Every corner moves ___ right and ___ up."; vocab: slide (translate), right, up |
| `mixed_coordinates` | M | visual-grid | (none) | keep | inherits; 7 of 12 samples are transformations | mixed instruction |
| `geometry_all` | M | visual-grid | (none) | keep | inherits | mixed instruction |
| `measurement_all` | M | visual-grid | (none) | keep | inherits emoji from the measurement family; catalogue host `computation-grid` wrong | mixed instruction |
| `geo_meas_all` | M | visual-grid | (none) | keep | same | mixed instruction |

Host notes: nothing in this family is read-and-choose without a picture, so none goes to `equation-drill`. The three story variants to be split out (`perimeter_word`, `area_word`, `volume_word`) will take host `word-problems` and tag `schema-story`. `sub-setup` is not given to any skill because the tag is defined as a horizontal-to-vertical rewrite; see owner question 5.

## Details (every verdict other than keep)

**`name_2d_shapes` (redo).** Two unrelated items share the id. The multi-select branch (:25-66) uses emoji glyphs for shapes and prints the shape's name beside each glyph, so "Click ALL the triangles" is a reading task with the answer written in. The main branch shows one standard picture per shape and four name buttons. Neither matches step SH-A1/A2 (find every triangle among turned, thin and near-miss shapes). Rebuild as find-all on line-art outlines with a `varied` option, and a separate `task=name` with a word bank. On paper the pupil circles; on screen the pupil taps the same figures.

**`name_3d_shapes` (redo).** Same structure. Emoji stand for solids (ice cream = cone, battery = cylinder, brick = prism, mountain = pyramid) against the owner's no-emoji ruling. Pyramid is never a target. Rebuild with the wireframes already drawn at :183-205 and plain line-art objects.

**`shape_name_match_2d`, `shape_name_match_3d` (fix).** The task is sound and the inclusive acceptance table is careful. Fixes: print path loses `bins` / `tiles` (see family summary 3); prompt rewrite "Write each value onto" is wrong English for this item; distractor tiles should be real near-miss names, not star / arrow / crescent; add a level option so K-2 pages draw from 6 shapes and grade 4-5 pages from the full set.

**`shape_positions` (fix).** Objects must be line art named by a label, not by colour. Generate both sides for "beside", add "next to", "in front of", "behind" (K.G.1), and offer one word pair per page (ladder POS). Replace "Where is the X compared to the Y?" with the frame "The X is ___ the Y."

**`shape_corners_count` (merge).** Alias to `count_sides_vertices_2d` with `ask=corners, maxSides=6`. Keep the id and its share code.

**`count_edges_faces_vertices` (split).** One counted part per section (`ask` option; three ladder steps). Separate the curved solids: the cone / cylinder / sphere counts at :352-354 follow one of several conventions and need an owner ruling (question 2). Drop the hexagonal prism from grade 2 pages.

**`count_sides_vertices_2d` (fix).** Make `ask` an option, not a coin flip. The orange corner dots are a hint scaffold: show them at scaffold level 2+, not always. Add a `maxSides` option so K pages stop at 6.

**`order_objects_length` (fix).** Letters already identify the bars; drop the colours. Add items where the bars do not start at the same line (the real misconception) and a longest-to-shortest orientation as a separate step. Give it a proper print cell (letters on rules) instead of the generic drag fallback.

**`measure_nonstandard` (fix).** One unit type per page. Add non-example pictures (gaps, overlaps, units not starting at the edge) for the True or False? and error pages. Black and white units.

**`compose_shapes` (redo).** Showing the composed result makes the item a naming question. Rebuild: show the two pieces only; the response is one of three outlines (circle-one on paper and on screen), later a drawing on dot paper. Widen the pool beyond 4.

**`compose_hexagon` (fix).** Remove the pre-drawn slot lines for the independent level (keep them as a hint scaffold), let more than one fill be right, print the outline and the block pictures.

**`compose_rect_from_squares` (redo).** A single hard-coded item cannot fill a page or a test A/B. Rebuild as 2.G.2: rectangle outline with tick marks, pupil draws rows and columns, writes "__ rows, __ in each row, __ squares". Dimensions 2-5.

**`partition_shapes` (split).** Keep counting equal parts here. Add the missing non-example step (equal or unequal), and a word-bank naming step. Move a/b notation out to the fractions family. Add horizontal and diagonal cuts and a square. Thirds belong to grade 2 pages only.

**`shape_attributes` (redo).** The id name and playbook steps SH-8/9 call for attribute checking; the code is a third copy of count-the-sides with the answer numbered on the figure. Rebuild as one attribute per page, yes/no boxes, attribute marks drawn in black. The old counting branch aliases to `count_sides_vertices_2d`.

**`compose_from_attributes` (redo).** Three criteria are dead code, captions give answers, prompts break the 12-word and no-capitals rules, and two-attribute items arrive before one-attribute items. Rebuild with short prompts ("Circle the shapes with 4 right angles."), marks on the figures, no captions, and an `attributes=1|2` option.

**`perimeter_intro` (fix).** Correct the grade to 3. Add the addition frame under the figure. One shape family per section.

**`area_unit_squares` (fix).** Rectangle and L-shape become an option, L later in the ladder. Add the rows frame as a second step.

**`perimeter_grid` (split).** Keep only grid figures; send the no-grid branch to `perimeter_intro`.

**`perimeter`, `area`, `volume` (split).** Same pattern in all three: a rotating `['standard','missing','word']` variant. Each becomes three ids so that a page, a test and its key hold one type; the unknown-side and story types are later ladder steps. Remove the definition / formula boxes from practice items (they belong in the Opener's Steps band). `area` must lose its triangle branch.

**`area_perimeter` (fix).** Add the decide-only data (`decision` lines "around" / "cover"). Replace the capitals. Keep the P = / A = dual cell; it is the right cell.

**`area_distributive_visual` (fix).** Parts labelled A and B, not coloured. Add step columns (A, B, add). One split orientation per section.

**`area_triangle` (fix).** Remove the printed formula. Add non-right triangles with a dotted height and a slanted side labelled as the distractor length. Show the dotted enclosing rectangle at scaffold level 2+.

**`area_polygon_decompose` (fix).** The pupil must draw or choose the split. Provide the uncoloured figure; candidate split lines dotted in the Model only. One shape family per step (L, then T, then U). Pick one strategy (add the parts) for the ladder. Correct the grade tag to 4 (owner question 4).

**`composite_shapes` (split).** Perimeter-only items become `composite_perimeter`. The dual item stays as the late combine step.

**`volume_composite` (redo).** Must draw two joined boxes. Until then it duplicates `volume`.

**`identify_angles`, `identify_lines`, `symmetry` (split).** Each hides "name one", "select all in a set" and "find inside a shape". Keep "name one" on the id, move "find inside a shape" to new ids, and let the select-all form live only as the hands-sort page. Remove the printed degree value from `identify_angles`. Vary the base ray's direction.

**`measure_angles` (redo).** Needs the printed protractor (XP-D-10) and a typed answer on both media. Options: `precision` tens / fives / ones, `orientation` right / left, plus the decide-only scale choice. Four items to a page.

**`place_symmetry_lines` (fix).** Add figures with no line of symmetry and the rectangle-diagonal trap. Move "(This shape has N.)" to a hint level.

**`additive_angles` (fix).** One whole per section; multiples of 10, then 5, then any; add the unknown-whole type; shorten the prompt to "Find the missing angle." with the numbers on the figure only.

**`classify_triangles` (split).** By sides and by angles are two steps. Draw tick marks and the right-angle square; without them the item tests eyesight. Fix the empty multi-select print.

**`classify_quads` (redo).** Wrong marking is the main reason. Rebuild as name-from-marks with a word bank (3, then 6 names), one best name per figure, hierarchy handled only on the always / sometimes / never page. One trapezoid rule across the file (owner question 1).

**`hotspot_quads` (fix).** Remove captions, vary the number of quadrilaterals from 1 to 4, add open, curved and concave non-examples, fix print.

**`net_identify` (fix).** Print the option letters, draw all nets at one scale, black outlines.

**`cross_section_3d` (fix).** Re-tag the grade, shorten the prompt ("Name the cut face."), show the slice by hatching, not red.

**`coordinate_q1`, `coordinate_all` (split), `coordinate_graph` (merge).** One `task` option (name / plot) on the two real ids; `coordinate_graph` becomes an alias for plot in quadrant I. Remove the target circles from the printed plot grid. Add x = 0 and y = 0 points and look-alike pairs (3, 5) / (5, 3). Label every axis integer. One grid with 3-4 lettered points per cell, fixed, not 1-3 at random.

**`coord_polygon` (split).** `ask` option; perimeter only for rectangles; drop the vertex list from the prompt (the figure has it).

**`net_surface_area` (split).** Keep surface area only, with step columns per face pair and dimensions 2-6. Consider moving the listing to `area_perimeter` by alias (ids stay).

**`geo_reflect`, `geo_translate` (fix), `geo_rotate` (redo).** Remove the colour leak first. Grade 5 versions should sit in quadrant I with a labelled mirror line or a "4 right, 2 up" rule box; the 4-quadrant axis versions become a grade 6+ option. `geo_rotate` is rebuilt as the slide / flip / turn discrimination step. Print and screen both stay choose-one until the draw-the-image cell exists; then drawing is the default on both.

## New skills needed

Proposed ids (append only; never reorder existing ids).

| Id | Category | Ladder step | Note |
|---|---|---|---|
| `flat_or_solid` | shapes_early | SH-A6 | two check boxes; GAP-6-03 |
| `polygon_or_not` | shapes_early | SH-B1 | GAP-6-02 |
| `equal_or_unequal_parts` | shapes_early | SH-C3 | non-examples for partitioning |
| `name_equal_shares` | shapes_early | SH-C5 | bank: halves, thirds, fourths |
| `classify_triangles_angles` | shapes_classify | SH-B10 | split |
| `name_point_line_ray` | angles_lines | AN-1 | GAP-6-01 |
| `find_lines_in_shape` | angles_lines | AN-2b | split of hot-spot branch |
| `angle_as_turn` | angles_lines | AN-3 | quarter / half / full turn dial |
| `right_angle_test` | angles_lines | AN-4 | yes / no, turned right angles |
| `find_angles_in_shape` | angles_lines | AN-5b | split of hot-spot branch |
| `symmetry_judge` | angles_lines | AN-12a | yes / no on a dotted fold line |
| `perimeter_regular` | area_perimeter | AP-P5 | sides x length |
| `perimeter_missing_side` | area_perimeter | AP-P6 | split; GAP-6-07 |
| `perimeter_word` | area_perimeter | AP-P7 | seed code at :5046; GAP-6-08 |
| `composite_perimeter` | area_perimeter | AP-P8 | split |
| `area_missing_side` | area_perimeter | AP-A5b | split; GAP-6-07 |
| `area_word` | area_perimeter | AP-A5c | seed code at :5004, :5087 |
| `volume_count_cubes` | area_perimeter | VO-1 to VO-3 | cube stacks by layer |
| `volume_missing_edge` | area_perimeter | VO-8 | split |
| `volume_word` | area_perimeter | story step | split |
| `draw_angle` | angles_lines | AN follow-on | print only; lowest priority |

Questions the missing reference-site research must answer: (1) which shapes and how many distractors appear on K find-all pages, and how turned / thin shapes are introduced; (2) how printed protractor items are laid out (size, which scale is bold, how many per page) and how interactive sites take the reading; (3) cone / cylinder / sphere face-edge-vertex conventions in US grade 1-2 materials; (4) how grade 5 worksheets pose translations and reflections without negative coordinates; (5) standard invalid-net distractors for cubes and prisms; (6) how composite-area pages fade from given split lines to pupil-drawn ones; (7) how partitioning pages show unequal-part non-examples; (8) whether grade 3 perimeter pages label all four sides before labelling two.

## Questions for the owner

1. **Trapezoid definition.** The code uses three rules. Recommendation: inclusive ("at least one pair of parallel sides"), which matches the acceptance table already written at :530-545 and most current US CCSS materials; naming pages still ask for the one best name, so pupils are not asked to call a rectangle a trapezoid except on the always / sometimes / never page.
2. **Curved solids in faces / edges / vertices.** Recommendation: leave cone, cylinder and sphere out of the counting steps (count only flat-faced solids), and describe curved solids with "flat face / curved surface" on a separate page. It avoids teaching "a sphere has 1 face", which many US texts contradict.
3. **Out-of-grade content.** `cross_section_3d` (grade 7) and origin rotations in `geo_rotate` (grade 8) are tagged 5-6. Recommendation: keep the ids, re-tag `cross_section_3d` as "M" follow-on, and rebuild `geo_rotate` as slide / flip / turn recognition.
4. **Grade tags.** `perimeter_intro` is tagged 1 (should be 3); `area_polygon_decompose` and `composite_shapes` are tagged 6 (rectilinear area by decomposing is 3.MD.7d; recommend 4); `partition_shapes` offers thirds at grade 1 (recommend halves and fourths at 1, thirds from 2). Grade tags only drive filters and footers, so this does not touch share codes. Recommendation: correct them in the geometry migration.
5. **Set-up-only pages in geometry.** The playbook has "draw one line to split the L-shape" as a set-up-only page, but the `sub-setup` tag is defined as a horizontal-to-vertical rewrite, so no geometry skill carries it. Recommendation: keep the tag's strict meaning and let the ladder step's `responseScope: 'setup'` unlock the page for `area_polygon_decompose` only.
6. **Transformations: choose or draw.** Today both media are choose-one-of-four. Recommendation: fix the leak now and keep choose-one on both media; make "draw the image" the default on both once the grid-drawing cell exists. Never draw on paper and choose on screen.
7. **`net_surface_area` sits in `coordinates`.** Recommendation: leave the id and code where they are (share codes), but list it under `area_perimeter` in the navigator and ladders.
8. **Hot-spot and multi-select branches.** Recommendation: remove the random 30% / 28.6% branches from every base id; keep select-all only as the hands-sort / hands-find page of a tagged skill, and keep find-inside-a-shape as its own id. This is the single change that makes one-type pages, tests A/B and facsimile keys possible for this family.
