# ───────────────────────── Block 6: Length and perimeter ─────────────────────────
S(id='Y4.B6.S1',
  partial=[('measurement:length_metric{"forms":[3]}', 'converts whole km to m only; no sense of 1 km, no mixed measures (2 km 300 m), no choosing km or m')],
  verdict='partial', missing='a sense of 1 km (distances on a map or route), writing mixed km and m measures, and choosing the unit',
  build=['km_m'],
  pre=[('measurement:length_metric{"forms":[1]}', 'Y3.B5.S1', 'P'), ('measurement:reading_ruler', 'Y1.B7.S3', 'P'),
       ('measurement:estimate_length', 'Y2.B6.S2', 'P'), ('multiplication:mult_zeros{"forms":[1]}', 'Y4.B5.S4', 'L')],
  preBuild=['metres'],
  related=[('measurement:unit_conversions', 'other unit conversions'), ('measurement:unit_conversion_word', 'conversion stories'),
           ('placevalue:place_value_10x{"op":"x","power":[1000]}', '× 1,000 is the km → m move')],
  note='School teaches this as enrichment (W36).')

S(id='Y4.B6.S2',
  partial=[('measurement:length_metric{"forms":[3]}', 'km to m in whole kilometres only; not m to km, half kilometres (1,500 m = 1 1/2 km) or mixed units')],
  verdict='partial', missing='converting both ways between km and m, including 500 m = 1/2 km and mixed measures',
  build=['km_m'],
  pre=[('measurement:length_metric{"forms":[1]}', 'Y3.B5.S5', 'P'), ('multiplication:multiply{"tiles":31}', 'Y3.B4.S5', 'P'),
       ('placevalue:expand{"band":9999}', 'Y3.B1.S6', 'P'), ('placevalue:place_value_10x{"op":"/","power":[10,100]}', 'Y4.B5.S6', 'L')],
  related=[('measurement:unit_conversion_word', 'conversion stories'), ('conversions:double_num_line', 'a double number line for km and m'),
           ('measurement:unit_conversions', 'other conversions')])

S(id='Y4.B6.S3',
  direct=['area_perimeter:perimeter_grid'],
  verdict='full',
  pre=[('area_perimeter:perimeter_intro', 'Y3.B5.S10', 'P'), ('area_perimeter:perimeter_grid{}', 'Y3.B5.S11', 'X'),
       ('area_perimeter:area_unit_squares', 'Y4.B3.S2', 'L'), ('counting:count_objects', 'Y1.B4.S1', 'P'), ('patterns:seq_2', 'Y2.B1.S15', 'P')],
  related=[('area_perimeter:area_perimeter', 'area and perimeter of the same shape'), ('area_perimeter:perimeter', 'the next step: rectangles'),
           ('coordinates:coord_polygon', 'perimeter on a coordinate grid')])

S(id='Y4.B6.S4',
  direct=['area_perimeter:perimeter{"forms":[0,1]}'],
  verdict='full',
  pre=[('area_perimeter:perimeter_grid', 'Y4.B6.S3', 'B'), ('area_perimeter:perimeter_intro', 'Y3.B5.S10', 'P'),
       ('patterns:double', 'Y2.B5.S11', 'P'), ('subtraction:missing_add_sub', 'Y2.B2.S21', 'P'), ('measurement:reading_ruler', 'Y2.B6.S1', 'P')],
  related=[('area_perimeter:perimeter{"forms":[2]}', 'perimeter stories (fences, frames)'), ('area_perimeter:area', 'area of the same rectangle'),
           ('area_perimeter:area_perimeter', 'both measures together')],
  note='Existing partial tag becomes full: forms "find the perimeter" and "find a missing side" are the WRM step.')

S(id='Y4.B6.S5',
  direct=['area_perimeter:perimeter_grid', 'area_perimeter:composite_shapes{"forms":[0]}'],
  verdict='full',
  pre=[('area_perimeter:perimeter{"forms":[0]}', 'Y4.B6.S4', 'B'), ('area_perimeter:perimeter_intro', 'Y3.B5.S12', 'P'),
       ('addition:add_column_multi', 'Y3.B5.S8', 'L'), ('measurement:reading_ruler', 'Y2.B6.S1', 'P')],
  related=[('area_perimeter:area_polygon_decompose', 'area of the same L/T/U shapes'), ('area_perimeter:area_unit_squares{"forms":[1]}', 'L-shape area by counting'),
           ('shapes_early:shape_attributes', 'what makes a shape rectilinear')],
  note='perimeter_grid deals L-shapes on a grid; composite_shapes deals L/T/U shapes with lengths given.')

S(id='Y4.B6.S6',
  verdict='gap', missing='finding a missing side length of a rectilinear shape from the opposite sides (the two short sides add to the long side)',
  build=['missing_lengths'],
  pre=[('area_perimeter:composite_shapes{"forms":[0]}', 'Y4.B6.S5', 'B'), ('subtraction:missing_add_sub', 'Y2.B2.S21', 'P'),
       ('area_perimeter:perimeter{"forms":[1]}', 'Y4.B6.S4', 'B'), ('algebra:tape_diagram', 'Y3.B2.S19', 'L')],
  related=[('area_perimeter:area_polygon_decompose', 'splitting the same shapes into rectangles'), ('subtraction:sub_100_mixed', 'the subtraction used'),
           ('coordinates:coord_distance_q1', 'side lengths read from coordinates')],
  note='composite_shapes asks only for the perimeter; it never asks for the missing side by itself.')

S(id='Y4.B6.S7',
  direct=['area_perimeter:composite_shapes{"forms":[0]}'],
  partial=[('area_perimeter:perimeter_grid', 'on a grid only (lengths counted, not calculated)')],
  verdict='partial', missing='calculating the perimeter when some side lengths are not given and must be found first',
  build=['missing_lengths'],
  pre=[('area_perimeter:perimeter{"forms":[0]}', 'Y3.B5.S12', 'P'), ('area_perimeter:perimeter_intro', 'Y3.B5.S12', 'P'),
       ('addition:add_column_multi', 'Y3.B5.S8', 'L')],
  preBuild=['missing_lengths'],
  related=[('area_perimeter:area_polygon_decompose', 'area of the same shapes'), ('area_perimeter:mixed_area_perimeter', 'mixed review')])

S(id='Y4.B6.S8',
  partial=[('area_perimeter:perimeter_intro', 'adds the sides of a drawn polygon; never uses "regular" (side × number of sides) or finds the side from the perimeter')],
  verdict='partial', missing='perimeter of a regular polygon as side length × number of sides, and the side from the perimeter',
  build=['regular_polygon', 'polygons'],
  pre=[('area_perimeter:composite_shapes{"forms":[0]}', 'Y4.B6.S7', 'B'), ('multiplication:mult_facts', 'Y4.B4.S10', 'L'),
       ('shapes_early:count_sides_vertices_2d', 'Y2/Gr.1 Count sides on 2D shapes (prior learning list; no WRM step id in our data)', 'X'), ('division:div_facts', 'Y4.B4.S10', 'L')],
  preBuild=['polygons'],
  related=[('shapes_classify:classify_triangles', 'equilateral triangles are regular'), ('shapes_early:name_2d_shapes', 'naming the polygons'),
           ('multiplication:mult_word_problems', 'equal sides as equal groups')])

S(id='Y4.B6.S9',
  direct=['area_perimeter:perimeter_intro'],
  verdict='full',
  pre=[('area_perimeter:perimeter_intro{}', 'Y3.B5.S12', 'X'), ('addition:add_column_multi', 'Y3.B5.S8', 'L'),
       ('shapes_early:count_sides_vertices_2d', 'Y2/Gr.1 Count sides and vertices on 2D shapes (lower grade)', 'X')],
  related=[('area_perimeter:perimeter', 'rectangles'), ('area_perimeter:composite_shapes', 'rectilinear shapes'), ('coordinates:coord_polygon', 'polygons on a grid')])

TAGFIXES += [
    dict(key='area_perimeter:perimeter', step='Y4.B6.S4', action='add', why='re-tag as FULL with forms [0, 1]'),
    dict(key='area_perimeter:composite_shapes', step='Y4.B6.S5', action='add', why='missing tag: L/T/U perimeters with lengths given'),
    dict(key='area_perimeter:perimeter_grid', step='Y4.B6.S5', action='add', why='re-tag as FULL (L-shapes on a grid)'),
    dict(key='area_perimeter:composite_shapes', step='Y4.B6.S7', action='add', why='missing tag (direct); perimeter_grid stays partial'),
    dict(key='area_perimeter:perimeter_intro', step='Y4.B6.S8', action='add', why='missing tag (partial): adding sides of a polygon'),
    dict(key='measurement:length_metric', step='Y4.B6.S2', action='partial', why='km → m whole numbers only'),
]

# Y4.B6.S3 pre lists perimeter_grid at the Y3 level; that is the same skill, so the builder keeps it out (see below).

# ───────────────────────── Block 7: Fractions ─────────────────────────
S(id='Y4.B7.S1',
  direct=['composing:whole_as_fraction', 'composing:compose_whole'],
  verdict='full',
  pre=[('fractions:identify', 'Y2.B8.S10', 'P'), ('fractions:write_fraction', 'Y3.B6.S3', 'P'), ('fractions:shade_fraction', 'Y3.B6.S3', 'P'),
       ('composing:fraction_number_line', 'Y3.B6.S7', 'P'), ('shapes_early:partition_shapes', 'Y1.B10.S1', 'P')],
  preBuild=['frac_count'],
  related=[('fractions:mixed_improper_visual', 'wholes beyond 1 (Y4.B7.S6)'), ('fractions:fraction_of_set', 'a whole as a set'),
           ('fractions:benchmark_fractions', '0, 1/2 and 1 on a line')])

S(id='Y4.B7.S2',
  partial=[('composing:fraction_number_line', 'reads mixed numbers at an arrow sometimes; no counting on in fractions past 1 with wholes as diagrams')],
  verdict='partial', missing='counting in unit fractions beyond 1 (…, 3/4, 1, 1 1/4) with diagrams and on a line, and naming the mixed number',
  build=['frac_beyond_1', 'frac_count'],
  pre=[('composing:whole_as_fraction', 'Y4.B7.S1', 'B'), ('composing:compose_whole', 'Y3.B6.S4', 'P'),
       ('fractions:write_fraction', 'Y2.B8.S10', 'P'), ('fractions:graph_fractions', 'Y3.B6.S7', 'P')],
  preBuild=['frac_count'],
  related=[('fractions:mixed_nl_drag', 'placing mixed numbers on a line'), ('fractions:mixed_improper_visual', 'pictures of mixed numbers'),
           ('patterns:count_by_step_up', 'counting in equal steps')])

S(id='Y4.B7.S3',
  verdict='gap', missing='partitioning a mixed number into wholes and a fraction (2 3/4 = 2 + 3/4 = 1 + 1 + 3/4) with a part-whole model',
  build=['frac_beyond_1'],
  pre=[('composing:fraction_number_line', 'Y4.B7.S2', 'B'), ('composing:compose_whole', 'Y3.B6.S4', 'P'),
       ('fractions:shade_fraction', 'Y2.B8.S11', 'P'), ('placevalue:expand{"band":99}', 'Y2.B1.S5', 'L')],
  preBuild=['frac_whole_partition'],
  related=[('fraction_operations:decompose_fractions', 'decomposing a fraction into unit fractions'), ('fractions:improper_mixed', 'mixed ↔ improper'),
           ('fraction_operations:add_mixed_like', 'adding the parts back')])

S(id='Y4.B7.S4',
  direct=['composing:fraction_number_line', 'fractions:mixed_nl_drag'],
  verdict='full',
  pre=[('fractions:graph_fractions', 'Y3.B6.S7', 'P'), ('fractions:fraction_nl_drag', 'Y3.B6.S7', 'P'),
       ('number_sense:place_on_number_line', 'Y1.B4.S8', 'L'), ('composing:whole_as_fraction', 'Y4.B7.S1', 'B')],
  preBuild=['frac_count'],
  related=[('fractions:order_frac_numline', 'ordering on a line'), ('fractions:improper_mixed', 'the same point as an improper fraction'),
           ('decimals:decimal_nl_drag', 'decimals on a line (Y4.B8.S4)')])

S(id='Y4.B7.S5',
  partial=[('fractions:mixed_nl_drag', 'places mixed numbers on a line, which shows the order, but never asks to compare (<, >) or write an order')],
  verdict='partial', missing='comparing two mixed numbers with < > = and ordering three or more, whole parts first then fractional parts',
  build=['frac_compare_gt1', 'frac_beyond_1'],
  pre=[('fractions:mixed_nl_drag{}', 'Y4.B7.S4', 'X'), ('fractions:compare', 'Y3.B6.S5', 'C'), ('fractions:order_fractions', 'Y3.B6.S2', 'P'),
       ('placevalue:compare{"band":99}', 'Y2.B1.S13', 'L')],
  related=[('fractions:compare{"forms":[0]}', 'comparing proper fractions with bars'), ('fractions:improper_mixed', 'converting to compare'),
           ('decimals:compare_decimal', 'the same idea with decimals')],
  note='fractions:compare deals proper fractions only; the existing partial tag of compare on this step should be dropped (it covers none of mixed numbers).')

S(id='Y4.B7.S6',
  direct=['fractions:mixed_improper_visual', 'fractions:improper_mixed'],
  verdict='full',
  pre=[('composing:fraction_number_line', 'Y3.B6.S8', 'P'), ('composing:compose_whole', 'Y3.B6.S4', 'P'),
       ('fractions:equiv_frac_visual', 'Y2.B8.S12', 'P'), ('composing:whole_as_fraction', 'Y4.B7.S1', 'L')],
  preBuild=['frac_count'],
  related=[('fractions:mixed_nl_drag', 'improper fractions on a line'), ('fraction_operations:add_fractions_like', 'sums past 1 make improper fractions'),
           ('fractions:mixed_fractions', 'mixed fractions review')])

S(id='Y4.B7.S7',
  direct=['fractions:improper_mixed'],
  verdict='full',
  pre=[('fractions:mixed_improper_visual', 'Y4.B7.S6', 'B'), ('composing:whole_as_fraction', 'Y4.B7.S1', 'L'),
       ('multiplication:mult_facts', 'Y4.B4.S10', 'L'), ('fractions:equiv_frac_visual', 'Y3.B6.S9', 'P')],
  related=[('fraction_operations:add_mixed_like', 'converting inside addition'), ('fractions:mixed_nl_drag', 'both forms at one point'),
           ('fractions:mixed_fractions', 'review')],
  note='improper_mixed deals both directions; there is no direction option (owner question).')

S(id='Y4.B7.S8',
  direct=['fractions:improper_mixed'],
  verdict='full',
  pre=[('fractions:mixed_improper_visual', 'Y4.B7.S6', 'L'), ('division:div_remainders', 'Y3.B4.S9', 'L'),
       ('division:div_facts', 'Y4.B4.S10', 'L'), ('fractions:equiv_frac_visual', 'Y3.B6.S9', 'P'), ('fraction_operations:add_fractions_like', 'Y3.B8.S1', 'P')],
  related=[('fraction_operations:add_fractions_like', 'sums past 1 written as mixed numbers'), ('fractions:mixed_nl_drag', 'both forms at one point'),
           ('division:remainder_interpret', 'the remainder becomes the fraction')])

S(id='Y4.B7.S9',
  partial=[('fractions:equiv_frac_visual', 'bar and area models only; no stacked number lines')],
  verdict='partial', missing='equivalent fractions shown on two or more stacked number lines (same point, different names)',
  build=['frac_nl_equiv', 'frac_count'],
  pre=[('composing:fraction_number_line', 'Y3.B6.S7', 'P'), ('fractions:equiv_frac_visual{}', 'Y3.B6.S10', 'X'),
       ('fractions:fraction_nl_drag', 'Y3.B6.S8', 'P'), ('composing:whole_as_fraction', 'Y4.B7.S1', 'L')],
  related=[('fractions:equiv_frac_nv', 'equivalent fractions without pictures'), ('fractions:select_equiv_frac', 'circle the equivalent fractions'),
           ('fractions:mixed_nl_drag', 'fractions on a line beyond 1')])

S(id='Y4.B7.S10',
  direct=['fractions:equiv_frac_nv', 'fractions:equivalent', 'fractions:select_equiv_frac'],
  verdict='full',
  pre=[('fractions:equiv_frac_visual', 'Y3.B6.S10', 'P'), ('multiplication:mult_facts', 'Y4.B4.S10', 'L'),
       ('multiplication:mult_chart', 'Y4.B4.S6', 'L'), ('fractions:identify', 'Y3.B6.S1', 'P')],
  preBuild=['frac_nl_equiv'],
  related=[('fractions:simplify', 'the family read backwards'), ('fraction_operations:frac_10_100', 'tenths and hundredths family'),
           ('conversions:ratio_tables', 'the same multiplicative pattern later')])

S(id='Y4.B7.S11',
  partial=[('fraction_operations:add_fractions_like', 'two addends only; no three or more addends')],
  direct=['fraction_operations:add_frac_like_nv'],
  verdict='partial', missing='adding three or more fractions with the same denominator, with totals past 1',
  build=['frac_add_multi'],
  pre=[('fraction_operations:add_fractions_like{}', 'Y3.B8.S1', 'X'), ('fractions:improper_mixed', 'Y4.B7.S8', 'B'),
       ('composing:compose_whole', 'Y3.B6.S4', 'P'), ('addition:add_three', 'adding three numbers (Grade 1, 1.OA.A.2), the additive form of the same regrouping idea', 'X')],
  related=[('fraction_operations:decompose_fractions', 'the reverse: one fraction as a sum'), ('fraction_operations:frac_word_problems', 'fraction stories'),
           ('fraction_operations:fraction_bar_ops' if False else 'fractions:fraction_bar_ops', 'bar model of the sum')],
  note='add_frac_like_nv is listed direct for the two-addend part; the step verdict stays partial.')

S(id='Y4.B7.S12',
  direct=['fraction_operations:add_mixed_like', 'fraction_operations:add_mixed_like_nv'],
  verdict='full',
  pre=[('fraction_operations:add_fractions_like', 'Y4.B7.S11', 'B'), ('fractions:improper_mixed', 'Y4.B7.S7', 'P'),
       ('fraction_operations:add_fractions_like', 'Y3.B8.S1', 'P'), ('fractions:mixed_nl_drag', 'Y4.B7.S4', 'L')],
  preBuild=['frac_beyond_1'],
  related=[('fraction_operations:sub_mixed_like', 'the inverse (Y4.B7.S15)'), ('fraction_operations:frac_word_problems', 'stories'),
           ('fractions:round_fractions', 'estimating with mixed numbers')])

S(id='Y4.B7.S13',
  direct=['fraction_operations:sub_fractions_like', 'fraction_operations:sub_frac_like_nv'],
  verdict='full',
  pre=[('fraction_operations:sub_fractions_like{}', 'Y3.B8.S2', 'X'), ('fractions:shade_fraction', 'Y3.B6.S3', 'P'),
       ('composing:compose_whole', 'Y3.B6.S4', 'P'), ('placevalue:place_value_disks', 'Y3.B1.S5', 'P')],
  related=[('fraction_operations:add_fractions_like', 'the inverse'), ('fraction_operations:frac_word_problems', 'stories'),
           ('fraction_operations:sub_mixed_like', 'the next step with mixed numbers')])

S(id='Y4.B7.S14',
  verdict='gap', missing='subtracting a fraction from a whole number (3 − 1/4) by renaming one whole as a fraction',
  build=['sub_break_whole', 'frac_add_multi'],
  pre=[('fraction_operations:sub_fractions_like', 'Y4.B7.S13', 'B'), ('composing:whole_as_fraction', 'Y4.B7.S1', 'L'),
       ('composing:compose_whole', 'Y3.B6.S4', 'P'), ('fractions:improper_mixed', 'Y4.B7.S7', 'L')],
  related=[('fraction_operations:sub_mixed_like', 'subtracting from mixed numbers'), ('subtraction:sub_across_zeros', 'exchanging a whole is like subtracting across zeros'),
           ('fraction_operations:frac_word_problems', 'stories')],
  note='sub_mixed_like never deals a whole-number minuend; sub_break_whole (Y5) and frac_add_multi both name this exchange.')

S(id='Y4.B7.S15',
  direct=['fraction_operations:sub_mixed_like', 'fraction_operations:sub_mixed_like_nv'],
  verdict='full',
  pre=[('fraction_operations:sub_fractions_like', 'Y4.B7.S13', 'B'), ('fractions:improper_mixed', 'Y4.B7.S8', 'L'),
       ('fraction_operations:add_mixed_like', 'Y4.B7.S12', 'L'), ('fraction_operations:sub_fractions_like', 'Y3.B8.S2', 'P')],
  preBuild=['sub_break_whole'],
  related=[('fraction_operations:add_mixed_like', 'the inverse'), ('fraction_operations:frac_word_mixed', 'mixed fraction stories'),
           ('fraction_operations:estimate_frac_ops', 'estimate the difference')],
  note='WRM (1) and (2) are no-exchange and exchange; sub_mixed_like samples include exchange (5 1/6 − 2 2/6), so full.')

TAGFIXES += [
    dict(key='fractions:compare', step='Y4.B7.S5', action='remove', why='deals proper fractions only; nothing about mixed numbers'),
    dict(key='fractions:mixed_nl_drag', step='Y4.B7.S5', action='partial', why='ordering shown on a line, no compare/order task'),
    dict(key='fractions:mixed_nl_drag', step='Y4.B7.S4', action='add', why='missing tag: place mixed numbers on a line'),
    dict(key='composing:fraction_number_line', step='Y4.B7.S2', action='partial', why='reads mixed numbers on a line, part of counting beyond 1'),
    dict(key='fractions:select_equiv_frac', step='Y4.B7.S10', action='add', why='missing tag'),
    dict(key='fraction_operations:add_frac_like_nv', step='Y4.B7.S11', action='add', why='missing tag (two-addend part)'),
    dict(key='fraction_operations:add_mixed_like_nv', step='Y4.B7.S12', action='add', why='missing tag'),
    dict(key='fraction_operations:sub_mixed_like_nv', step='Y4.B7.S15', action='add', why='missing tag'),
    dict(key='fractions:improper_mixed', step='Y4.B7.S6', action='add', why='kept: improper fractions shown and named'),
]
