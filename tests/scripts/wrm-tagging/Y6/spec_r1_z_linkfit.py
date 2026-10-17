# Fix round r1, last pass: what linkfit.mjs still found after the block fixes (whys that name what the items do not deal,
# links past the step's size or school week, customary distractors on metric steps).
setl('B1.S4', 'related', 'order_of_operations:exponents_simple', why='index notation (7² = 49, 3³ = 27): the small raised number that 10², 10³ … use')
setl('B1.S5', 'related', 'number_sense:nearest_100000', opts={'band': 10000000}, why='round a 7-digit number to the nearest 100,000 (Y6.B1.S7)')
setl('B2.S6', 'related', 'area_perimeter:volume', opts={'band': 12})
drop('B3.S1', 'pre', 'fractions:fraction_bar_ops')          # its items add and subtract unlike fractions (W15)
drop('B4.S5', 'pre', 'fraction_operations:div_unit_frac_nv')  # about 3 in 10 items are whole ÷ unit fraction (W19)
# metric steps: unit_conversions' "click every equal measurement" form offers "1 mile"; forms [0] converts one measurement
setl('B5.S1', 'direct', 'measurement:unit_conversions', opts={'units': [0], 'forms': [0]})
setl('B5.S2', 'partial', 'measurement:unit_conversions', opts={'units': [0], 'forms': [0]})
setl('B5.S3', 'pre', 'measurement:unit_conversions', opts={'units': [0], 'forms': [0]})
setl('B5.S4', 'pre', 'measurement:unit_conversions', opts={'units': [0], 'forms': [0]}, why='Y4.B6.S2 Equivalent lengths (lower grade): one metric conversion at a time (5 km = 5,000 m), the unit the miles fact is written in')
setl('B8.S5', 'related', 'measurement:unit_conversions', opts={'units': [0], 'forms': [0]}, why='one metric conversion at a time (5 kilometers = 5,000 meters): a whole number × 1,000 in a unit')
setl('B5.S2', 'pre', 'placevalue:place_value_10x', opts={'op': 'x', 'decimals': True}, why='Y6.B8.S5 Multiply by 10, 100 and 1,000 (taught earlier, W07): a decimal × 10, 100 or 1,000 (9.7 × 100), the move a conversion to the smaller unit makes')
_e = [e for e in _S('B5.S2')['pre'] if e['key'] == 'placevalue:place_value_10x' and (e.get('opts') or {}).get('op') == '/'][0]
_e['why'] = 'Y6.B8.S6 Divide by 10, 100 and 1,000 (taught earlier, W07): ÷ 10, 100 or 1,000 with a decimal answer (742 ÷ 100 = 7.42), the move a conversion to the larger unit makes'
setl('B5.S3', 'pre', 'decimals:add_decimal', why='Y5.B12.S6 Add decimals (lower grade): adding decimals (92.6 + 94.7), as two decimal amounts are added once converted')
setl('B5.S4', 'related', 'patterns:double', why='doubling: when 5 miles is about 8 of the other unit, 10 miles is about 16')
setl('B5.S4', 'related', 'multiplication:mult_comparison_plain', why='"times as many" stories: 3 times the distance is 3 times the converted distance')
setl('B6.S5', 'pre', 'measurement:reading_ruler', why='Y3.B11.S4 Measure and draw accurately (prior learning wk W34): read a length on a ruler (this ruler is marked in inches; a metric ruler is pending)')
setl('B12.S9', 'pre', 'measurement:reading_ruler', why='Y2.B6.S1 Measure length (lower grade): read a length on a ruler, as a radius is measured (this ruler is marked in inches; a metric ruler is pending)')
for sid in ('B6.S9', 'B8.S9'):
    drop(sid, 'related', 'measurement:unit_conversion_word')     # 10 kg = 10,000 g: past these steps' numbers
drop('B8.S6', 'related', 'measurement:unit_conversion_word')
drop('B6.S10', 'related', 'measurement:capacity')
add('B6.S10', 'related', 'fraction_operations:frac_mult_word', why='scaling an amount by a fraction in a story (serves 4 → serves 6 is × 1½)')
for sid in ('B10.S1', 'B10.S2'):
    setl(sid, 'pre', 'area_perimeter:area', why='Y5.B8.S4 Area of rectangles (prior learning wk W22): rectangles only (a missing side, a floor to tile); the default forms also deal later content (W23)')
setl('B10.S4', 'related', 'area_perimeter:composite_shapes', why='rectilinear L and T shapes split into rectangles to find area and perimeter: the same split-into-rectangles reasoning')
setl('B10.S5', 'related', 'area_perimeter:area_polygon_decompose', why='split an L, T or U shape into rectangles and add the areas: the split-and-add an area of a compound shape uses')
setl('B10.S6', 'related', 'area_perimeter:area_polygon_decompose', why='cut a compound shape into parts and add their areas (L, T and U shapes): cutting and moving parts keeps the area the same')
setl('B11.S1', 'pre', 'coordinates:coordinate_q1', why='Y5.B11.S1 Read and plot coordinates (prior learning wk W30): read and plot a point from two scales, as each point on a time graph is read')
setl('B11.S3', 'related', 'conversions:f_to_p', why='a fraction written as a percentage, which the next step (sectors labelled in percent) reads')
setl('B11.S5', 'pre', 'angles_lines:additive_angles', why='Y5.B10.S6 Calculate angles around a point (lower grade): angles that make a whole turn total 360°, the turn shared into sectors')
setl('B12.S11', 'related', 'area_perimeter:volume', why='the volume of the box a net of a box folds into (length × width × height)')
setl('B5.S3', 'pre', 'measurement:unit_conversions', why='Y6.B5.S2 Convert metric measures (taught the same week, W21): convert one amount (900 centimeters = 9 meters) before calculating with it')
setl('B5.S4', 'pre', 'measurement:unit_conversions', why='Y4.B6.S2 Equivalent lengths (lower grade): one metric conversion at a time (5 kilometers = 5,000 meters), the unit the miles fact is written in')
setl('B8.S6', 'related', 'decimals:div_decimal', opts={'forms': [0]}, why='a decimal ÷ a whole number (22.5 ÷ 9), the next step (Y6.B8.S8)')
setl('B3.S9', 'pre', 'fraction_operations:estimate_frac_ops', why='estimate a fraction sum with benchmarks (0, ½, 1), the check on a story answer (Grade 5 unlike-denominator content, taught W15)')
note_add('B8.S4', 'The Y5/Grade 4 decimal + and − lesson is practised by add_decimal and sub_decimal, which are this step\'s own partial skills, so the pre-skills are money and comparing decimals.')
