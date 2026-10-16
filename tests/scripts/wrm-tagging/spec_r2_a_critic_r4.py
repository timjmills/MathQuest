# Fix round r2, for Y6-critic-r4.md §7 (rows 1-17). Each row is checked against freshly generated items (probe.mjs).
# 1. B2.S6
setl('B2.S6', 'pre', 'multiplication:mult_facts', why='times-table facts to 12 × 12; the square numbers are the n × n facts among them')
step('B2.S6', note='W33 holds the negative-number lessons (for Y6.B1.S8) and Y3 Use arrays, Y4 Multiply three numbers, Y5 Square numbers and Cube numbers. '
     'Y4 Multiply three numbers has no skill (mult_three is the preBuild); Y5 Square and Cube numbers are this step\'s own build (square_cube). '
     'exponents_simple is tagged with "The power alone" so the "+ 96" second step is off.')
# 2. B9.S9: fraction_of_set_hard has no find-the-whole form (fraction_of_set_hard_nv is already a pre)
drop('B9.S9', 'related', 'fractions:fraction_of_set_hard')
setl('B9.S9', 'related', 'conversions:ratio_tables', why='a missing value in a scaling table (no percents): the scaling behind 12/40 = 30/100')
# 3. B6.S5: the inch ruler is customary on a cm scale-drawing step (rule 18); length_metric stays
drop('B6.S5', 'pre', 'measurement:reading_ruler')
setl('B6.S5', 'related', 'conversions:double_num_line', why='two quantities on paired scales (miles | hours, cups | pancakes): the paired-scale reading a scale key uses')
# 4. B12.S9: the inch ruler goes (owner Q3, a cm ruler option, stays open); the name_2d_shapes cite becomes a step id
drop('B12.S9', 'pre', 'measurement:reading_ruler')
setl('B12.S9', 'pre', 'shapes_early:name_2d_shapes', why='R.B4.S1 Identify and name circles and triangles (prior learning wk W29, with Y1.B3.S3 Recognise and name 2-D shapes): naming a circle among 2-D shapes')
# 5. B6.S6
setl('B6.S6', 'pre', 'area_perimeter:perimeter', why='perimeter of a rectangle from its two side lengths (numbers, no grid)')
# 6. B1.S8
setl('B1.S8', 'pre', 'patterns:count_by_step_down', why='Y1.B5.S3 Count backwards within 100 (prior learning wk W33, "Y1 Count backwards"): counting back in 2s, 3s, 4s, 5s and 10s from numbers below 200: the move that continues past 0 on a line')
# 7. B12.S2, B12.S6
for _s in ('B12.S2', 'B12.S6'):
    setl(_s, 'pre', 'subtraction:missing_add_sub', why='a missing addend within 20 (___ + 10 = 17): the missing-part move that 180 − 164 uses')
# 8. B4.S3
setl('B4.S3', 'related', 'fraction_operations:frac_mult_word', why='fraction stories: × (servings, area) and whole ÷ unit fraction (ribbon pieces); no fraction ÷ whole story yet')
# 9. B11.S4
setl('B11.S4', 'related', 'conversions:p_to_f', why='a percent written as a fraction (25% = 1/4): the share of the whole a sector shows')
# 10. B8.S2
setl('B8.S2', 'partial', 'decimals:compare_thousandths', missing='compares decimals within 1 only (0.738 vs 0.589); never a number with an integer part, never the value of a digit or a partition')
# 11. B4.S7
setl('B4.S7', 'partial', 'fractions:fraction_of_set_hard_nv', missing="the bar model; and about a third of the items are the forward 'click all expressions equal to 2/3 of 12' (that form ignores forms: generator bug, recorded)")
# 12. B7.S5
_e = _find('B7.S5', 'partial', 'algebra:evaluate_expression_hard')
if _e: _e['missing'] += '; about 4 in 10 of its Evaluate items substitute a negative value or square a bracket ((a + 2)² at a = −1), beyond Grade 5; band 20/50 does not remove them'
# 13. stale notes (class N)
step('B9.S5', note='Partial (round 3): d_to_p and p_to_d are partial: decimal ↔ percent only (they also deal 150% = 1.5, beyond the step but harmless). '
     'The four converters that involve a fraction are held to the small denominator pools listed.')
step('B10.S7', note='Y5.B15 volume steps are also untaught, so pupils meet cube counting here for the first time; volume_cubes is the build; mult_three is the preBuild.')
step('B11.S1', note='Corrected (round 3): the W30 prior list names "Y5 Read and interpret line graphs" and "Y5 Draw line graphs" (Y5.B9.S1-S2). '
     'line_graph is the build; the Y5 line-graph steps are also gaps, so there is no separate preBuild. coordinate_graph was dropped from pre: it mixes in four-quadrant items.')
step('B12.S7', note='Grounded on the W29 prior list (sheet row 139): Rec/PK4 shapes with 4 sides, Y3 Right angles, Y4 Triangles and Quadrilaterals, Y5 Measure angles up to 180°, '
     'Calculate angles around a point and on a straight line. The triangle sum (Y6.B12.S4) that the 360° argument uses has no skill; angle_rules (this step\'s build) also makes the triangle sum.')
# 14. B5.S2, B5.S5: forms [0, 2] (cylinder, sort by unit) avoids the kg-dial bug ("mass in kg? → 0")
setl('B5.S2', 'related', 'measurement:mass_volume_liquid', opts={'forms': [0, 2]}, why='choose g or kg; read a mL scale')
setl('B5.S5', 'related', 'measurement:mass_volume_liquid', opts={'forms': [0, 2]}, why='metric mass and capacity: choose g, kg, mL or L; read a mL scale')
# 15. B13.S4, B13.S5: the envisioned skill as this step needs it (the reused WRM_PROPOSALS text is the Y4/Y5 first-quadrant one)
ENVTEACH.update({
    'translate_grid': "translating a shape on a four-quadrant grid, describing the translation (3 left, 2 down) and writing the image's coordinates",
    'reflect_grid': 'reflecting a shape in the x- or y-axis on a four-quadrant grid and writing the new coordinates',
})
note_add('B13.S4', 'The reused translate_grid proposal is written for the first quadrant (Y4/Y5); this step needs it with four quadrants and the new coordinates written (envision.teaches).')
note_add('B13.S5', 'The reused reflect_grid proposal is written for a square grid and the axes (Y5); this step needs four quadrants and the new coordinates written (envision.teaches).')
# 16. unsampled, same classes
drop('B9.S7', 'related', 'conversions:double_num_line')
for _s in ('B10.S7', 'B10.S8'):
    setl(_s, 'pre', 'multiplication:mult_facts', why='times-table facts to 12 × 12, the products inside l × w × h (Y4.B4.S13 Multiply three numbers, prior learning wk W25, has no skill: mult_three)')
# 17. the 9 non-id pre cites, as step ids (the H re-cite check then runs on them)
setl('B2.S2', 'pre', 'number_theory:factor_tchart_easy', why='Y4.B5.S1 Factor pairs (prior learning wk W09, with Y4.B5.S2 Use factor pairs)')
setl('B2.S16', 'pre', 'number_sense:estimate_sum', why='Y3.B2.S20 Estimate answers (prior learning wk W10, with Y4.B2.S9 Estimate answers)')
setl('B2.S16', 'pre', 'multiplication:mult_zeros', why='Y4.B5.S7 Related facts – multiplication and division (lower grade): × by a multiple of ten mentally (30 × 4 = 120), used in every estimate of a product')
setl('B3.S1', 'pre', 'number_theory:gcf_easy', why='Y5.B3.S4 Common factors (prior learning wk W14, with Y6.B2.S2)')
setl('B3.S2', 'pre', 'fractions:fraction_nl_drag', why='Y3.B6.S9 Equivalent fractions on a number line (prior learning wk W14)')
setl('B4.S1', 'pre', 'multiplication:repeated_add_to_mult', why='Y3.B3.S1 Multiplication - equal groups (lower grade): equal groups as multiplication')
setl('B9.S8', 'pre', 'subtraction:missing_add_sub', why='Y5.B2.S8 Find missing numbers (prior learning wk W36, with Y3.B2.S19 Complements to 100): the part left after a discount')
setl('B12.S1', 'pre', 'composing:fraction_number_line', why='Y3.B6.S7 Fractions on a number line (prior learning wk W27, "Y3/Y4 reading a scale"): reading a marked scale between labelled marks')
