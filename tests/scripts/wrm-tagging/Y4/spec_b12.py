# ───────────────────────── Block 12: Shape ─────────────────────────
S(id='Y4.B12.S1',
  verdict='gap', missing='angles as an amount of turn: quarter, half, three-quarter and whole turns, clockwise and anticlockwise, and a right angle as a quarter turn',
  build=['turns_angles'],
  pre=[('angles_lines:identify_angles', 'Y3.B11.S2', 'P'), ('measurement:clock_parts', 'Y1.B14.S6', 'L'), ('shapes_early:shape_positions', 'Y2.B11.S1', 'P')],
  preBuild=['turns'],
  related=[('angles_lines:measure_angles', 'turn measured in degrees (Grade 4)'), ('coordinates:geo_rotate', 'rotations of a shape'),
           ('angles_lines:additive_angles', 'angles that add up')])

S(id='Y4.B12.S2',
  direct=['angles_lines:identify_angles'],
  verdict='full',
  pre=[('shapes_early:name_2d_shapes', 'R.B6.S1', 'P'), ('shapes_early:count_sides_vertices_2d', 'Y2/Gr.1 Count sides and vertices on 2D shapes (lower grade)', 'X'), ('angles_lines:identify_lines', 'Y3.B11.S5', 'L')],
  preBuild=['turns_angles'],
  related=[('angles_lines:measure_angles', 'estimating angle size'), ('shapes_classify:classify_triangles', 'triangles by their angles'),
           ('angles_lines:identify_lines', 'perpendicular lines make right angles')])

S(id='Y4.B12.S3',
  partial=[('angles_lines:identify_angles', 'names acute/right/obtuse; never compares two angles or orders three by size')],
  verdict='partial', missing='comparing and ordering angles by size (independent of line length)',
  build=['turns_angles'],
  pre=[('shapes_early:name_2d_shapes', 'R.B4.S1', 'P'), ('angles_lines:symmetry', 'Y2.B3.S5', 'P'), ('shapes_early:compose_shapes', 'Y3.B11.S8', 'L')],
  preBuild=['turns_angles'],
  related=[('angles_lines:measure_angles', 'measuring to compare'), ('placevalue:order_least_to_greatest', 'the ordering routine'),
           ('shapes_classify:classify_triangles', 'angles inside triangles')])

S(id='Y4.B12.S4',
  direct=['shapes_classify:classify_triangles'],
  verdict='full',
  pre=[('angles_lines:identify_angles', 'Y4.B12.S2', 'L'), ('shapes_early:name_2d_shapes', 'R.B4.S1', 'P'), ('shapes_early:shape_attributes', 'Y3.B11.S8', 'L'),
       ('angles_lines:symmetry', 'Y2.B3.S5', 'P')],
  preBuild=['polygons'],
  related=[('shapes_classify:classify_quads', 'the next step'), ('shapes_early:compose_from_attributes', 'shapes by attributes'),
           ('area_perimeter:perimeter_intro', 'perimeter of a triangle')],
  note='Classification by sides and angles is 4.G.A.2 content; WRM Y4 asks the same.')

S(id='Y4.B12.S5',
  direct=['shapes_classify:classify_quads', 'shapes_classify:hotspot_quads'],
  verdict='full',
  pre=[('shapes_classify:classify_triangles', 'Y4.B12.S4', 'B'), ('shapes_early:name_2d_shapes', 'R.B6.S1', 'P'),
       ('angles_lines:identify_lines', 'Y3.B11.S5', 'L'), ('angles_lines:identify_angles', 'Y4.B12.S2', 'L')],
  related=[('shapes_early:shape_attributes', 'attributes of shapes'), ('area_perimeter:perimeter', 'rectangle perimeter'),
           ('shapes_classify:mixed_shapes', 'mixed classification')])

S(id='Y4.B12.S6',
  partial=[('shapes_early:shape_attributes', 'shapes by sides and corners; no regular vs irregular, no naming polygons by number of sides past 6'),
           ('shapes_early:count_sides_vertices_2d', 'counts sides and vertices only')],
  verdict='partial', missing='naming polygons by their number of sides (pentagon … octagon) and sorting regular from irregular',
  build=['polygons'],
  pre=[('shapes_early:name_2d_shapes', 'R.B4.S1', 'P'), ('angles_lines:identify_angles', 'Y3.B11.S2', 'P'),
       ('shapes_classify:classify_quads', 'Y4.B12.S5', 'B')],
  preBuild=['shape_draw'],
  related=[('area_perimeter:perimeter_intro', 'perimeter of polygons (Y4.B6.S9)'), ('shapes_early:compose_from_attributes', 'find shapes by attributes'),
           ('angles_lines:symmetry', 'symmetry of regular polygons')])

S(id='Y4.B12.S7',
  direct=['angles_lines:symmetry', 'angles_lines:place_symmetry_lines'],
  verdict='full',
  pre=[('shapes_early:partition_shapes', 'Y2.B8.S3', 'L'), ('shapes_early:name_2d_shapes', 'R.B4.S1', 'P'),
       ('shapes_classify:classify_quads', 'Y4.B12.S5', 'B')],
  related=[('coordinates:geo_reflect', 'reflection of a shape'), ('shapes_classify:classify_triangles', 'symmetry of isosceles and equilateral triangles')],
  note='Existing tags kept.')

S(id='Y4.B12.S8',
  verdict='gap', missing='completing a symmetric figure on a square grid by reflecting it in a given line',
  build=['symmetry_complete'],
  pre=[('angles_lines:place_symmetry_lines', 'Y4.B12.S7', 'B'), ('angles_lines:symmetry', 'Y2.B3.S5', 'P'), ('area_perimeter:perimeter_grid', 'Y4.B6.S3', 'L')],
  preBuild=['symmetry_complete'],
  related=[('coordinates:geo_reflect', 'reflections'), ('coordinates:coordinate_q1', 'grid positions')],
  note='Y2.B3.S6 (Use lines of symmetry to complete shapes) is the prior step with the same proposal.')

# ───────────────────────── Block 13: Statistics ─────────────────────────
S(id='Y4.B13.S1',
  direct=['graphs:bar_graph{"forms":[0,1]}', 'graphs:pictograph', 'graphs:tally_chart'],
  verdict='full',
  pre=[('graphs:build_bar_graph', 'Y3.B12.S4', 'P'), ('measurement:bar_graph_intro', 'Y3.B12.S3', 'P'), ('graphs:tally_chart{}', 'Y2.B10.S1', 'X'),
       ('comparing:classify_count', 'Y1.B1.S1', 'P'), ('patterns:seq_5', 'Y2.B1.S15', 'P'), ('measurement:pictograph_intro', 'Y2.B10.S3', 'L')],
  preBuild=['two_way'],
  related=[('graphs:build_pictograph', 'drawing pictographs'), ('graphs:line_plot', 'line plots (3.MD.B.4)'),
           ('graphs:bar_graph{"forms":[2,3]}', 'the next step: comparison, sum, difference')],
  note='WRM charts include tables; graphs:tally_chart reads a table of tallies.')

S(id='Y4.B13.S2',
  direct=['graphs:bar_graph{"forms":[2,3]}', 'graphs:pictograph'],
  verdict='full',
  pre=[('graphs:bar_graph{"forms":[0,1]}', 'Y4.B13.S1', 'B'), ('addition:comparison_word', 'Y1.B5.S8', 'P'),
       ('comparing:compare_groups', 'Y1.B1.S11', 'P'), ('subtraction:sub_100_mixed', 'Y2.B2.S18', 'L')],
  related=[('graphs:build_bar_graph', 'drawing the chart'), ('addition:comparison_word', 'how many more stories'),
           ('graphs:mixed_graphs', 'mixed graph questions')],
  note='bar_graph forms "How many more?" and "The total of all the bars" give comparison, sum and difference; the existing partial tag becomes full. line_graph lists this step (Y4.B13.S2) by mistake; it belongs to S3/S4.')

S(id='Y4.B13.S3',
  verdict='gap', missing='reading a line graph: the value at a time, change between times, and when it was greatest',
  build=['line_graph'],
  pre=[('graphs:bar_graph{"forms":[2]}', 'Y4.B13.S2', 'B'), ('coordinates:coordinate_q1', 'Y4.B14.S1', 'L'),
       ('number_sense:place_on_number_line', 'Y3.B1.S3', 'P'), ('graphs:bar_graph', 'Y3.B12.S3', 'P')],
  related=[('graphs:line_plot', 'line plots are a different chart'), ('coordinates:coordinate_graph', 'points on a grid'),
           ('measurement:temperature', 'temperature over a day is the usual context')],
  note='5.G.A.2 preview, taught as enrichment W37.')

S(id='Y4.B13.S4',
  verdict='gap', missing='drawing a line graph from a table: scale the axes, plot points, join them',
  build=['line_graph'],
  pre=[('graphs:build_bar_graph', 'Y3.B12.S4', 'P'), ('coordinates:coordinate_q1', 'Y4.B14.S2', 'L')],
  preBuild=['line_graph'],
  related=[('graphs:build_bar_graph', 'drawing a bar chart from the same data'), ('coordinates:coordinate_graph', 'plotting points')])

# ───────────────────────── Block 14: Position and direction ─────────────────────────
S(id='Y4.B14.S1',
  direct=['coordinates:coordinate_q1'],
  verdict='full',
  pre=[('number_sense:place_on_number_line', 'Y3.B1.S3', 'P'), ('shapes_early:shape_positions', 'Y2.B11.S1', 'P'), ('angles_lines:identify_lines', 'Y3.B11.S5', 'P')],
  preBuild=['position_map'],
  related=[('coordinates:coordinate_graph', 'graphing points'), ('coordinates:coord_distance_q1', 'distance between points')],
  note='5.G.A.1 content; school enrichment W37.')

S(id='Y4.B14.S2',
  direct=['coordinates:coordinate_q1'],
  verdict='full',
  pre=[('shapes_early:shape_positions', 'R.B4.S4', 'P'), ('counting:count_sequence', 'Y1.B1.S8', 'P'), ('number_sense:place_on_number_line', 'Y3.B1.S3', 'P')],
  related=[('coordinates:coord_polygon', 'plotting the vertices of a shape (next step)'), ('coordinates:coordinate_graph', 'coordinate graphing')],
  note='coordinate_q1 deals both "read the coordinates" and "plot these points"; full for S1 and S2.')

S(id='Y4.B14.S3',
  partial=[('coordinates:coord_polygon', 'gives the vertices and asks side lengths/perimeter; never asks to plot and join, or to find the missing vertex')],
  verdict='partial', missing='drawing a 2-D shape by plotting given vertices, and finding the missing vertex of a square or rectangle',
  build=['coord_polygon_draw'],
  pre=[('coordinates:coordinate_q1', 'Y4.B14.S2', 'B'), ('shapes_classify:classify_quads', 'Y4.B12.S5', 'L'), ('shapes_early:shape_positions', 'Y2.B11.S1', 'P'),
       ('fractions:identify', 'Y3.B6.S1', 'P')],
  preBuild=['shape_draw'],
  related=[('coordinates:coord_distance_q1', 'side lengths from coordinates'), ('area_perimeter:perimeter_grid', 'perimeter on a grid')],
  note='translate_grid lists this step; translating is S4/S5, so drawing shapes needs its own option.')

S(id='Y4.B14.S4',
  partial=[('coordinates:geo_translate', 'multiple choice in four quadrants; the pupil never draws the translated shape on a first-quadrant grid')],
  verdict='partial', missing='translating a point or shape on a first-quadrant grid by drawing it, and giving the new coordinates',
  build=['translate_grid'],
  pre=[('coordinates:coord_polygon', 'Y4.B14.S3', 'B'), ('coordinates:coordinate_q1', 'Y4.B14.S2', 'P'), ('counting:count_sequence', 'Y1.B1.S8', 'P')],
  preBuild=['movement'],
  related=[('coordinates:geo_reflect', 'reflection, another transformation'), ('coordinates:geo_rotate', 'rotation'),
           ('addition:add_facts', 'adding to the x and y coordinates')])

S(id='Y4.B14.S5',
  partial=[('coordinates:geo_translate', 'picks the image for a given translation; does not ask the pupil to describe a translation (3 right, 2 up)')],
  verdict='partial', missing='describing a translation from a shape and its image ("__ right, __ up")',
  build=['translate_grid'],
  pre=[('coordinates:coordinate_q1', 'Y4.B14.S2', 'P'), ('shapes_early:shape_positions', 'Y2.B11.S1', 'P'), ('subtraction:sub_20_mixed', 'subtracting within 20 fluently (Grade 1-2 fact fluency)', 'X')],
  preBuild=['translate_grid'],
  related=[('coordinates:geo_reflect', 'reflection'), ('coordinates:coord_distance_q1', 'distance moved')])

NEW_PROPOSALS['coord_polygon_draw'] = dict(kind='option', skill='coordinates:coord_polygon', option='task "plot and join" and "find the missing vertex"',
    name='Draw Shapes on a Coordinate Grid (option)', teaches='plotting given vertices and joining them to draw a 2-D shape, and finding the missing vertex of a square or rectangle',
    representation='first-quadrant grid in the boxed cell (black lines, axes labelled 0-10), plotted points as filled dots; answer "( __ , __ )" boxes',
    family='coordinates', ccss=['5.G.A.1', '3.G.A.1'], why='coord_polygon gives the vertices and asks lengths; the WRM step is drawing the shape')

TAGFIXES += [
    dict(key='angles_lines:identify_angles', step='Y4.B12.S3', action='partial', why='kept partial: names angles, no compare/order'),
    dict(key='shapes_early:shape_attributes', step='Y4.B12.S6', action='add', why='missing partial tag for polygons'),
    dict(key='graphs:bar_graph', step='Y4.B13.S2', action='add', why='re-tag as FULL with forms [2, 3] (how many more, total)'),
    dict(key='graphs:tally_chart', step='Y4.B13.S1', action='add', why='missing tag: reading a table of tallies'),
    dict(key='coordinates:geo_translate', step='Y4.B14.S5', action='partial', why='multiple choice of the image; does not describe a translation'),
]
