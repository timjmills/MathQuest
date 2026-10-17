# Fix round r1 (local critic r1): blocks 5-13. Every opts value was generated with probe.mjs / linkfit.mjs first.
MET_W = {'units': [1]}          # unit_conversion_word: Metric (km, m, cm, kg, g) — index 1 of Time / Metric / Customary
MET_C = {'units': [0]}          # unit_conversions: Metric (m, g, L)
PV10 = {'power': [10, 100, 1000], 'band': 10000}
PCT = {'op': '/', 'power': [10, 100], 'band': 1000}

# ---- B5.S1 Metric measures (rule 18: inches and customary links on a metric step; class B, E)
setl('B5.S1', 'pre', 'measurement:unit_conversion_word', opts=MET_W, why='Y5.B14.S3 Convert units of length (prior learning wk W21): metric conversions in a story (4 kg = 4,000 g)')
setl('B5.S1', 'pre', 'placevalue:place_value_10x', opts=PV10, why='Y5.B3.S8 Multiply by 10, 100 and 1,000 (prior learning wk W21): × and ÷ by 10, 100 and 1,000, the step inside every metric conversion')
drop('B5.S1', 'pre', 'measurement:reading_ruler')        # it reads inches (rule 18 names this)
drop('B5.S1', 'related', 'measurement:length_customary')  # customary on a metric step
drop('B5.S1', 'related', 'conversions:double_num_line')   # miles/hours, ratio content (W33)
setl('B5.S1', 'related', 'decimals:mult_decimal', why='a decimal × a whole number (4.2 × 3), the calculation a metric amount like 2.5 needs')
add('B5.S1', 'related', 'decimals:div_decimal', opts={'forms': [0]}, why='a decimal ÷ a whole number (22.5 ÷ 9), as when a metric amount is shared')

# ---- B5.S2 Convert metric measures (class B, E, J)
setl('B5.S2', 'pre', 'placevalue:place_value_10x', opts={'op': 'x', 'decimals': True},
     why='Y6.B8.S5 Multiply by 10, 100 and 1,000 (taught earlier, W07): a decimal × 10, 100 or 1,000, the move from 3.4 km to 3,400 m')
add('B5.S2', 'pre', 'placevalue:place_value_10x', opts={'op': '/', 'decimals': True}, pos=1,
    why='Y6.B8.S6 Divide by 10, 100 and 1,000 (taught earlier, W07): a number ÷ 10, 100 or 1,000 with a decimal answer, the move from 650 g to 0.65 kg')
setl('B5.S2', 'pre', 'decimals:compare_thousandths', why='Y5.B7.S9 Order and compare decimals (lower grade): decimals to 3 places (0.728 > 0.237), the form a converted mass takes')
setl('B5.S2', 'pre', 'measurement:unit_conversion_word', opts=MET_W, why='Y5.B14.S3 Convert units of length (prior learning wk W21): metric conversions in a story')
drop('B5.S2', 'related', 'conversions:double_num_line')
drop('B5.S2', 'related', 'measurement:length_customary')
add('B5.S2', 'related', 'measurement:estimate_length', opts={'forms': [0]}, why='choose cm or m for a length (about how long?): the unit sense a conversion checks against')

# ---- B5.S3 Calculate with metric measures
setl('B5.S3', 'partial', 'measurement:unit_conversion_word', opts=MET_W)
setl('B5.S3', 'pre', 'measurement:unit_conversions', opts=MET_C, why='Y6.B5.S2 Convert metric measures (taught the same week, W21): convert one amount (900 cm = 9 m) before calculating with it')
setl('B5.S3', 'pre', 'measurement:capacity', opts={'units': [1]}, why='Y5.B14.S2 Millimetres and millilitres (prior learning wk W21): metric capacity, 0.25 L = 250 mL')
setl('B5.S3', 'pre', 'decimals:add_decimal', why='Y5.B12.S6 Add decimals (lower grade): adding decimals, as 1.2 + 0.45 when two masses in kg are added')
setl('B5.S3', 'related', 'placevalue:place_value_10x', opts={'power': [10, 100, 1000], 'band': 1000}, why='every metric conversion is a × or ÷ by 10, 100 or 1,000')

# ---- B5.S4 Miles and kilometres (class D: ratio W33; class E)
setl('B5.S4', 'pre', 'measurement:unit_conversion_word', opts=MET_W, why='Y5.B14.S3 Convert units of length (prior learning wk W22): km, m and cm converted in a story')
drop('B5.S4', 'pre', 'conversions:ratio_tables')   # ratio is W33
setl('B5.S4', 'pre', 'measurement:length_customary', why='Y5.B14.S3 Convert units of length (lower grade, customary half): miles, yards and feet, the imperial units a mile belongs to')
move('B5.S4', 'measurement:unit_conversions', 'related', 'pre', opts=MET_C, why='Y4.B6.S2 Equivalent lengths: m and cm / km and m (lower grade): 1 km = 1,000 m, the unit the 5 miles ≈ 8 km fact is written in')
drop('B5.S4', 'related', 'conversions:double_num_line')
drop('B5.S4', 'related', 'conversions:equiv_ratios')
add('B5.S4', 'related', 'patterns:double', opts={'band': 1000}, why='doubling: 5 miles ≈ 8 km, so 10 miles ≈ 16 km')
add('B5.S4', 'related', 'multiplication:mult_comparison_plain', why='"times as many" stories: 15 miles is 3 times 5 miles, so 3 times 8 km')

# ---- B5.S5 Imperial measures
setl('B5.S5', 'pre', 'measurement:reading_ruler', why='Y2.B6.S1 Measure in centimetres (lower grade): reading a ruler; this one is marked in inches, the imperial unit of this step')
drop('B5.S5', 'related', 'conversions:double_num_line')
setl('B5.S5', 'pre', 'measurement:unit_conversion_word', opts={'units': [1, 2]}, why='Y5.B14.S3 Convert units of length (prior learning wk W22): metric and customary conversions in a story (yd, ft, lb, kg, g)')

# ---- B6 Ratio (class E: ratio is W33; B6.S1 and B6.S6 are W19)
drop('B6.S1', 'related', 'conversions:ratio_tables')
drop('B6.S6', 'related', 'conversions:equiv_ratios')
setl('B6.S6', 'pre', 'multiplication:repeated_add_to_mult', why='Y3.B3.S1 Add equal groups (prior learning wk W19): equal groups written as a multiplication, the meaning of "3 times as long"')
setl('B6.S5', 'pre', 'patterns:double', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning wk W34): scale by 2')
setl('B6.S5', 'pre', 'conversions:ratio_tables', why='Y6.B6.S3 Introduction to the ratio symbol (taught earlier, W33): pairs of values scaled in a table, as 1 : 200 is scaled')
setl('B6.S5', 'pre', 'measurement:reading_ruler', why='Y3.B11.S4 Measure and draw accurately (prior learning wk W34): read a length on a ruler (this one is marked in inches; a cm ruler is pending)')
setl('B6.S7', 'pre', 'patterns:double', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning wk W34): scale factor 2')
setl('B6.S9', 'pre', 'patterns:double', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning wk W34/W35): scale by 2')
setl('B6.S9', 'related', 'measurement:unit_conversion_word', opts=MET_W, why='a unit conversion is a proportion: 1 kg = 1,000 g, so 4 kg = 4,000 g')
setl('B6.S10', 'pre', 'patterns:double', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning wk W34/W35): double a recipe')
setl('B6.S10', 'pre', 'patterns:halve', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning): halve a recipe')
drop('B6.S10', 'related', 'measurement:unit_conversions')
add('B6.S10', 'related', 'measurement:capacity', opts={'units': [1]}, why='recipe amounts in mL and L (0.25 L = 250 mL)')

# ---- B7 Algebra (class D: school order is W11-W13, then W35; class E, K)
drop('B7.S2', 'related', 'algebra:evaluate_expression_hard')
setl('B7.S2', 'pre', 'order_of_operations:two_ops_no_paren', opts={'band': 50}, why='Y6.B2.S15 Order of operations (taught earlier, W11): two operations done in order (7 + 24 ÷ 8)')
drop('B7.S3', 'pre', 'algebra:function_table_hard')   # B7.S2 is W12, after this W11 step
add('B7.S3', 'pre', 'algebra:function_table_easy', opts={'ftRules': ['+', '-', 'x', '/'], 'ftTask': 'rule'}, pos=0,
    why='Y6.B7.S1 1-step function machines (taught the same week, W11): find the rule of a machine, the rule an expression writes down')
setl('B7.S4', 'partial', 'algebra:evaluate_expression_hard',
     missing='one letter only, never a two-letter expression (a + 2b with a = 5, b = 3); some coefficient items substitute a negative value (4v − 3 at v = −5) and others square a bracket, both beyond Y6, with no option to remove them')
setl('B7.S4', 'pre', 'patterns:double', opts={'band': 1000}, why='Y2.B5.S11 Doubling and halving (prior learning wk W35): 2a means double a')
setl('B7.S4', 'pre', 'order_of_operations:two_ops_no_paren', opts={'band': 50}, why='Y6.B2.S15 Order of operations (taught earlier, W11): × before + when 3n + 2 is evaluated')
drop('B7.S5', 'pre', 'algebra:evaluate_expression')   # B7.S4 is W35
setl('B7.S5', 'pre', 'area_perimeter:area', opts={'forms': [1, 2]}, why='Y5.B8.S4 Area of rectangles (lower grade): rectangles only (a missing side, a floor to tile), the area formula in words')
setl('B7.S5', 'pre', 'order_of_operations:two_ops_no_paren', opts={'band': 50}, why='Y6.B2.S15 Order of operations (taught earlier, W11): × before + in P = 2 × l + 2 × w')
move('B7.S5', 'algebra:function_table_hard', 'related', 'pre', pos=0,
     why='Y6.B7.S2 2-step function machines (taught the same week, W12): a two-step rule worked forwards, as a formula is')
add('B7.S5', 'related', 'area_perimeter:area_perimeter', opts={'band': 50}, why='perimeter and area of one rectangle: the two formulas P = 2(l + w) and A = l × w in use')
for k in ('algebra:solve_eq_addsub', 'algebra:solve_eq_multdiv'):   # B7.S7 is W35, after this W12 step
    move('B7.S8', k, 'pre', 'related', why='1-step equations (Y6.B7.S7, taught W35): the one-step undoing inside each 2-step equation')
add('B7.S8', 'pre', 'number_ops_mixed:missing_factor_or_addend', pos=0,
    why='Y5.B2.S8 Find missing numbers (lower grade): ___ × 8 = 32 and ___ + 57 = 81, the one-step unknowns a 2-step equation is undone into')
drop('B7.S8', 'related', 'algebra:write_equation')       # forming equations is W35
step('B7.S8', note='The v3 crosswalk tags this 3.OA.D.8; the content is two-step equations, which solve_eq_twostep deals in four forms. The school teaches it in W12, 23 weeks BEFORE 1-step equations (W35), so the pre-skills are the Grade 4 missing-number facts and the W12 function machine, and the 1-step equation skills are related only.')
drop('B7.S9', 'pre', 'algebra:evaluate_expression')      # B7.S4 is W35
move('B7.S9', 'coordinates:coordinate_q1', 'related', 'pre', why='Y5.B11.S1 Read and plot coordinates (lower grade): plotting each pair (a, b) in the first quadrant')
add('B7.S9', 'pre', 'algebra:function_table_easy', opts={'ftRules': ['+', '-', 'x', '/'], 'ftTask': 'rule'},
    why='Y6.B7.S1 1-step function machines (taught earlier, W11): pairs of In and Out values that follow one rule')

# ---- B8 Decimals
move('B8.S1', 'decimals:order_decimals', 'related', 'pre', why='Y5.B7.S9 Order and compare decimals (prior learning wk W06): order decimals by the value of their digits')
setl('B8.S1', 'related', 'placevalue:place_value_10x', opts={'op': '/', 'decimals': True, 'band': 1000}, why='÷ 10, 100, 1,000 moves each digit to a place worth a tenth as much (742 ÷ 100 = 7.42)')
drop('B8.S2', 'pre', 'placevalue:compare')   # a Y1 tens compare: a weak link
setl('B8.S2', 'related', 'placevalue:place_value_10x', opts={'op': '/', 'decimals': True, 'band': 1000}, why='digit shifts: 491 ÷ 10 = 49.1')
move('B8.S4', 'measurement:money', 'related', 'pre', why='Y4.B9.S1 Money (lower grade): dollars and cents are two-place decimals added and subtracted')
add('B8.S4', 'pre', 'decimals:compare_decimal', why='Y4.B9.S5 Compare decimals (lower grade): the place of each digit, which lines the columns up')
drop('B8.S5', 'pre', 'patterns:skip_count_line')   # skip counts in 2s and 25s: no × 10 link
setl('B8.S5', 'related', 'measurement:unit_conversions', opts=MET_C, why='metric conversions (5 km = 5,000 m): a whole number × 1,000 in a unit')
drop('B8.S6', 'related', 'measurement:unit_conversions')   # "1 km = 100,000 cm", far past this step's numbers
add('B8.S6', 'related', 'measurement:unit_conversion_word', opts=MET_W, why='metric conversions in a story (4,000 g = 4 kg read the other way), ÷ 1,000')
setl('B8.S8', 'pre', 'placevalue:place_value_10x', opts={'op': '/', 'decimals': True, 'band': 1000}, why='Y6.B8.S6 Divide by 10, 100 and 1,000 (taught earlier, W07): the digits move right past the point (742 ÷ 100 = 7.42)')
drop('B8.S8', 'related', 'fraction_operations:frac_as_division')   # W20
drop('B8.S9', 'related', 'conversions:unit_rate_intro')            # ratio content, W33
setl('B8.S9', 'related', 'measurement:unit_conversion_word', opts=MET_W, why='metric measures in stories')

# ---- B9 Fractions, decimals, percentages (M1, class F, B, E)
for sid in ('B9.S3', 'B9.S4'):
    setl(sid, 'pre', 'placevalue:place_value_10x', opts=PCT, why='Y5.B3.S9 Divide by 10, 100 and 1,000 (prior learning wk W36/W37): ÷ 10 and ÷ 100, the steps to 10% and 1% of an amount')
move('B9.S3', 'conversions:f_to_p', 'related', 'pre', why='Y5.B7.S13 Percentages as fractions (prior learning wk W36): a fraction written as a percent')
move('B9.S3', 'conversions:p_to_f', 'related', 'pre', why='Y5.B7.S13 Percentages as fractions (prior learning wk W36): a percent written as a fraction')
setl('B9.S3', 'pre', 'subtraction:missing_add_sub', why='Y3.B2.S19 Complements to 100 (lower grade): missing addends within 20 (6 + ___ = 19); the same move as 30% + ___% = 100%, at a smaller size')
for k, w in (('conversions:p_to_f', 'Y5.B7.S13 Percentages as fractions (prior learning wk W37): the percent back to a fraction'),
             ('conversions:d_to_p', 'Y5.B7.S14 Percentages as decimals (prior learning wk W37): the decimal route to the same percentage'),
             ('conversions:order_fdp', 'Y5.B7.S15 Equivalent fractions, decimals and percentages (prior learning wk W37): the three forms side by side')):
    move('B9.S4', k, 'related', 'pre', why=w)
FDP = 'fractions with any denominator and their decimal and percent equivalents (it converts between decimals and percents only)'
to_partial('B9.S5', 'conversions:d_to_p', FDP)
to_partial('B9.S5', 'conversions:p_to_d', FDP)
move('B9.S5', 'conversions:order_fdp', 'related', 'pre', why='Y5.B7.S15 Equivalent fractions, decimals and percentages (prior learning wk W20): the three forms compared')
drop('B9.S5', 'related', 'conversions:mixed_conversions')   # ratio tables, unit rates and "50% of 90"
setl('B9.S5', 'pre', 'conversions:percent_visual', why='Y5.B7.S12 Understand percentages (prior learning wk W20): the percent shaded on a hundred square')
for sid in ('B9.S7', 'B9.S8'):
    setl(sid, 'pre', 'patterns:halve', opts={'band': 1000}, why='Y1.B10.S4 Find a half of a quantity (prior learning wk W36): 50% is a half')
    setl(sid, 'pre', 'placevalue:place_value_10x', opts=PCT, why='Y5.B3.S9 Divide by 10, 100 and 1,000 (prior learning wk W36): ÷ 10 and ÷ 100, the steps to 10% and 1%')
drop('B9.S7', 'related', 'conversions:find_whole_from_pct')   # its options reach 2,000; the inverse is B9.S9's partial
drop('B9.S8', 'related', 'conversions:find_whole_from_pct')
add('B9.S8', 'related', 'conversions:percent_visual', why='the percent of a hundred square: 35% is 30 squares and 5 more, as 35% = 3 × 10% + 5%')
setl('B9.S9', 'pre', 'placevalue:place_value_10x', opts=PCT, why='Y5.B3.S9 Divide by 10, 100 and 1,000 (prior learning wk W37): ÷ 10 and ÷ 100, the steps to 10% and 1%')
drop('B9.S9', 'related', 'conversions:double_num_line')   # miles and hours, not amount | percent

# ---- B10 Area, perimeter, volume (class D, G, B)
for sid in ('B10.S1', 'B10.S2'):
    setl(sid, 'pre', 'area_perimeter:area', opts={'forms': [1, 2]}, why='Y5.B8.S4 Area of rectangles (prior learning wk W22): rectangles only (a missing side, a floor to tile); the default also deals triangle area, W23')
setl('B10.S1', 'related', 'area_perimeter:area_perimeter', opts={'band': 50}, why='area and perimeter of one rectangle (the measurements, without the comparison)')
unbuild_pre('B10.S4', 'area_triangle_grid')
setl('B10.S4', 'related', 'area_perimeter:composite_shapes', why='rectilinear L and T shapes split into rectangles: the splitting that shows a right-angled triangle is half a rectangle')
setl('B10.S4', 'related', 'coordinates:coord_polygon', why='a polygon plotted on a grid and its side lengths read off the grid')
setl('B10.S5', 'related', 'area_perimeter:area_polygon_decompose', why='split an L, T or U shape into rectangles and add the areas: the same split-and-add a triangle area uses')
drop('B10.S6', 'related', 'area_perimeter:composite_shapes')   # 0 of 80 parallelograms
drop('B10.S6', 'related', 'coordinates:coord_polygon')
add('B10.S6', 'related', 'area_perimeter:area_polygon_decompose', why='cut a shape and rearrange the parts (L, T and U shapes): the cut-and-move that turns a parallelogram into a rectangle')
unbuild_pre('B10.S7', 'volume_cubes')
setl('B10.S7', 'related', 'area_perimeter:volume', opts={'band': 12}, why='next step: the volume of a box by length × width × height (edges to 12)')
drop('B10.S7', 'related', 'area_perimeter:volume_composite')   # a cube of side 24, 13,824
setl('B10.S8', 'pre', 'multiplication:multiply', opts={'tiles': 31}, why='Y5.B5.S1 Multiply by a 1-digit number (lower grade): 3-digit × 1-digit, the last product of l × w × h')
drop('B10.S8', 'related', 'area_perimeter:volume_composite')
setl('B10.S8', 'related', 'coordinates:net_surface_area', why='the surface area of a box from its net: the faces of the solid whose volume is found here')

# ---- B11 Statistics (class G, D, E, B)
unbuild_pre('B11.S1', 'line_graph')
setl('B11.S1', 'pre', 'coordinates:coordinate_q1', why='Y5.B11.S1 Read and plot coordinates (prior learning wk W30): read and plot a point from two scales, as each point of a line graph is')
setl('B11.S1', 'related', 'graphs:line_plot_fractions', why='data marked over a scaled line (a line plot), read the same way as a time axis')
setl('B11.S3', 'related', 'conversions:f_to_p', why='a fraction written as a percentage, which the next step (pie charts with percentages) reads')
drop('B11.S4', 'related', 'conversions:find_whole_from_pct')
drop('B11.S5', 'pre', 'graphs:pie_chart')   # B11.S3 is W37, after this W26 step
drop('B11.S5', 'related', 'conversions:percent_of_number')   # W36
drop('B11.S5', 'related', 'conversions:percent_visual')
setl('B11.S5', 'pre', 'angles_lines:additive_angles', why='Y5.B10.S6 Calculate angles around a point (lower grade): two angles that make a whole turn, 360°, the circle a pie chart shares out')
add('B11.S5', 'related', 'graphs:bar_graph', why='the same data shown as a bar chart')

# ---- B12 Shape (class G, I)
move('B12.S1', 'angles_lines:identify_lines', 'related', 'pre', why='Y4.B12.S2 Identify angles (lower grade): perpendicular lines meet at a right angle, the 90° mark angles are classified against')
note_add('B12.S1', 'Pre-skills are few: the Y5 lessons Classify angles and Measure angles up to 180° are this step\'s own partial skills (identify_angles, measure_angles), so they cannot be listed again as pre-skills.')
for sid in ('B12.S5', 'B12.S6', 'B12.S7', 'B12.S8'):
    unbuild_pre(sid, 'angle_rules')
setl('B12.S4', 'pre', 'angles_lines:additive_angles', why='Y5.B10.S7 Calculate angles on a straight line (prior learning wk W28): angles on a straight line total 180°, where the torn-off angles land')
setl('B12.S4', 'pre', 'angles_lines:identify_angles', why='Y5.B10.S2 Classify angles (prior learning wk W28): acute, right and obtuse angles by name')
setl('B12.S5', 'pre', 'angles_lines:identify_angles', why='Y5.B10.S2 Classify angles (prior learning wk W30): a right angle is 90°')
for sid in ('B12.S5', 'B12.S6', 'B12.S7', 'B12.S8'):
    s_ = _S(sid); s_['note'] = s_['note'].replace(', so it is both the build and the preBuild.', '; it is this step\'s build, so it is not repeated as a pre-build.').replace(' (angle_rules builds it), so angle_rules is also the preBuild;', ' (angle_rules, this step\'s build, makes it);').replace('; angle_rules is also the preBuild.', '; angle_rules, this step\'s build, makes it.')
setl('B12.S9', 'pre', 'patterns:double', opts={'band': 50}, why='Y2.B5.S11 Doubling and halving (lower grade): diameter = 2 × radius')
setl('B12.S9', 'pre', 'patterns:halve', opts={'band': 50}, why='Y2.B5.S11 Doubling and halving (lower grade): radius = half the diameter')
setl('B12.S9', 'pre', 'measurement:reading_ruler', why='Y2.B6.S1 Measure in centimetres (lower grade): read a length on a ruler, as a radius is measured (this ruler is marked in inches; a cm ruler is pending)')
setl('B12.S11', 'related', 'area_perimeter:volume', opts={'band': 12}, why='the volume of the box a cuboid net folds into')

# ---- B13 Position and direction (class E, G)
drop('B13.S1', 'related', 'coordinates:coordinate_graph')   # mixes four quadrants (W31)
drop('B13.S1', 'related', 'coordinates:coordinate_all')     # four quadrants, W31
setl('B13.S1', 'pre', 'patterns:seq_2', opts={'band': 50}, why='Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W13): axes numbered in steps')
add('B13.S1', 'related', 'graphs:line_plot', why='values marked along one scaled axis: half of a coordinate grid')
for sid in ('B13.S2', 'B13.S3'):
    drop(sid, 'related', 'integers:abs_value')
drop('B13.S2', 'related', 'coordinates:mixed_coordinates')   # mixes in nets and surface area
add('B13.S2', 'related', 'coordinates:coordinate_graph', why='the same read and plot items, mixing quadrant I with all four quadrants')
unbuild_pre('B13.S4', 'translate_grid')
unbuild_pre('B13.S5', 'reflect_grid')
for sid, b in (('B13.S4', 'translate_grid'), ('B13.S5', 'reflect_grid')):
    s_ = _S(sid); i_ = s_['note'].find(' Its ')
    if i_ > 0: s_['note'] = s_['note'][:i_]
