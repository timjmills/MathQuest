# Rule 13: the envisioned skill of every partial or gap step is SHORT: name, kind, teaches (what the pupil does), closes (the
# step's own missing clause: build.py takes the step's `missing` unless CLOSES names a narrower clause for one proposal of a
# step with two builds), representation in a few words. These fill the proposals that have no `teaches` or `representation`
# of their own (visual builds and older options).
ENVTEACH.update({
    'vis_pv_bands_millions': 'read, build and partition 7-digit numbers in a place-value chart with a Millions period (commas in threes)',
    'vis_division_layouts': 'divide a 3- or 4-digit number by a 1-digit number set out as the bus stop, writing the exchanged digits small',
    'vis_bar_family': 'write the equation (n + 5 = 12, 3n = 24) for a bar model of parts and a whole, or of two compared bars',
    'vis_hundred_square': 'read the percent shaded and the percent not shaded on a hundred square, and on bars of 10, 20, 4 or 50 equal parts',
    'vis_mean_levelling': 'level towers of cubes (or shared objects) so every column is equal, and write the mean as the level',
    'vis_value_line_vertical': 'read and mark temperatures on a vertical thermometer scale through 0 and count the degrees between two of them',
})
ENVREP.update({
    'vis_pv_bands_millions': 'place-value chart with a Millions | Thousands | Ones period head, digit slots',
    'vis_division_layouts': 'bus-stop division frame with small exchange-digit slots and an answer row',
    'vis_bar_family': 'a part-whole or comparison bar model with an equation slot under it',
    'vis_hundred_square': 'a 10 × 10 square (or a bar of 10/20/4/50 parts) partly shaded, with percent slots',
    'vis_mean_levelling': 'cube towers drawn before and after levelling, a slot for the mean',
    'vis_value_line_vertical': 'a vertical thermometer scale through 0 with two marked readings and a difference slot',
    'frac_wp_unlike': 'one story per boxed cell with a fraction answer slot and a benchmark "reasonable?" tick box',
    'multi_step_four_ops': 'one two-step story per cell, an equation slot with a letter and an answer slot',
    'protractor_read': 'an angle with a drawn protractor over it; a degrees slot',
    'pv10_exponents': 'a place-value chart with the power of ten written as 10³; a product slot',
    'value_ten_times': 'two place-value charts showing the same digit in two places; a "how many times greater" slot',
})
# Steps with two builds: each proposal closes its own part of the step's missing clause (words taken from that clause).
CLOSES.update({
    'Y6.B1.S2': {'big_numbers': 'representing and partitioning 7-digit numbers (1,000,000 to 9,999,999)',
                 'vis_pv_bands_millions': 'in a place-value chart with a Millions period'},
    'Y6.B1.S3': {'big_numbers': 'reading and writing numbers from 1,000,000 to 10,000,000 in words and numerals',
                 'vis_pv_bands_millions': 'with commas in threes (the Millions period of the chart)'},
    'Y6.B1.S4': {'value_ten_times': 'recognising that each place is ten times the place to its right up to 1,000,000',
                 'pv10_exponents': 'naming 10, 100 ... 1,000,000 as powers of ten'},
    'Y6.B1.S5': {'nl_20': 'reading, placing and estimating numbers on number lines with any scale',
                 'big_numbers': '6- and 7-digit numbers on number lines to 10,000,000'},
    'Y6.B1.S8': {'negative_count': 'finding the interval (difference) between a positive and a negative number',
                 'vis_value_line_vertical': 'in context, e.g. from −6 °C to 4 °C (a vertical thermometer scale)'},
    'Y6.B2.S8': {'wp_multidigit': 'word problems that need multi-digit multiplication',
                 'long_mult': 'up to 4-digit x 2-digit (the long multiplication the stories need)'},
    'Y6.B2.S9': {'long_mult': '4-digit / 1-digit and 4-digit / 2-digit',
                 'vis_division_layouts': 'short division set out as the bus stop'},
    'Y6.B3.S9': {'frac_multistep': 'multi-step word problems adding and subtracting fractions and mixed numbers, with a bar model',
                 'frac_wp_unlike': 'adding and subtracting fractions with unlike denominators in a story'},
    'Y6.B9.S3': {'vis_hundred_square': 'the percentage not shaded (30% shaded so 70% not: complements to 100%)',
                 'vis_bar_family': 'percentages of a whole that is not split into 100 (a bar of 10, 20, 4 or 50 equal parts)'},
    'Y6.B9.S4': {'f_to_p_denoms': 'denominators 25 and 50 (7/25 = 28%), fractions to simplify first (9/12 = 3/4 = 75%, 12/40 = 3/10 = 30%)',
                 'f_to_d_division': 'eighths by division (3/8 = 0.375 = 37.5%)'},
    'Y6.B9.S5': {'f_to_p_denoms': 'equivalents that need denominators 20, 25, 50 or 8 as percentages (7/20 = 35%, 3/8 = 37.5%), and any percentage other than 10, 20, 25, 50 or 75% written as a fraction',
                 'f_to_d_factors': 'decimals for denominators 20, 25, 50 or 8 (7/20 = 0.35, 3/8 = 0.375)'},
    'Y6.B11.S6': {'mean_missing': 'finding a missing value from a given mean (mean x number of items = total)',
                  'vis_mean_levelling': 'the mean as levelling'},
    'Y6.B12.S1': {'protractor_read': 'measuring any angle to the nearest degree with a protractor',
                  'reflex_angles': 'classifying (and measuring) reflex angles'},
})
ENVISION.setdefault('Y6.B9.S3', {})['vis_bar_family'] = 'read the percent shaded on a bar cut into 10, 20, 4 or 50 equal parts (one part of 20 is 5%)'
