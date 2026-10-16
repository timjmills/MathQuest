# Fix round r1 (local critic r1, FAIL 7.02): blocks 1-4. Class letters are the critic's (§2). Every opts value below was
# generated with probe.mjs / linkfit.mjs (print path, seeded) before it was written here.
B999 = {'band': 999999}

# ---- B1.S1 Numbers to 1,000,000 (rule 7, class L): the band stops at 999,999, so 1,000,000 itself is never dealt
for k in ('placevalue:pv_digit_drag', 'placevalue:number_word_names', 'placevalue:expand'):
    to_partial('B1.S1', k, '1,000,000 itself: the band stops at 999,999, so the step\'s end number is never dealt')
step('B1.S1', verdict='partial', build=['big_numbers'],
     missing='the number 1,000,000 itself (every band stops at 999,999); 6-digit numbers are dealt in full')
setl('B1.S1', 'pre', 'placevalue:combine', opts=B999, why='Y5.B1.S8 Partition numbers to 1,000,000 (prior learning wk W01): write a 6-digit number from its parts')
setl('B1.S1', 'pre', 'placevalue:place_value_disks', opts={'band': 9999}, why='Y4.B1.S5 Represent numbers to 10,000 (prior learning wk W01): read a 4-digit number from place-value disks')
setl('B1.S1', 'related', 'placevalue:compare', opts=B999, why='compare 6-digit numbers from the greatest place (the next use of the chart, Y6.B1.S6)')
setl('B1.S1', 'related', 'placevalue:order_least_to_greatest', opts=B999, why='order three 6-digit numbers (Y6.B1.S6)')
drop('B1.S1', 'related', 'patterns:count_by_powers_of_10')   # class L: no band, reaches 23,000,000
setl('B1.S1', 'related', 'number_sense:nearest_100000', opts={'band': 1000000}, why='round a 6-digit number to the nearest 100,000 (Y6.B1.S7)')

# ---- B1.S2 Numbers to 10,000,000 (class C, J, B)
setl('B1.S2', 'partial', 'placevalue:pv_digit_drag', opts=B999, missing='numbers with a millions digit (the band stops at 999,999)')
setl('B1.S2', 'partial', 'placevalue:expand', opts=B999, missing='7-digit numbers partitioned (the band stops at 999,999)')
add('B1.S2', 'pre', 'placevalue:number_word_names', opts=B999, pos=0, why='Y6.B1.S1 Numbers to 1,000,000 (taught the same week, W01): every place to hundred thousands, the chart this step adds a millions period to')
add('B1.S2', 'pre', 'placevalue:combine', opts=B999, pos=1, why='Y5.B1.S8 Partition numbers to 1,000,000 (prior learning wk W01): a 6-digit number from its parts, the partition this step extends')
setl('B1.S2', 'pre', 'placevalue:place_value_disks', opts={'band': 9999}, why='Y4.B1.S5 Represent numbers to 10,000 (prior learning wk W01): read a 4-digit number from disks')
drop('B1.S2', 'related', 'placevalue:number_word_names')   # now the main pre (rule 10)
drop('B1.S2', 'related', 'placevalue:combine')
add('B1.S2', 'related', 'placevalue:compare', opts=B999, why='compare the 6-digit numbers built here, place by place (Y6.B1.S6)')

# ---- B1.S3 Read and write numbers to 10,000,000 (class C, B)
setl('B1.S3', 'partial', 'placevalue:number_word_names', opts=B999, missing='7-digit numbers and the word "million" (the band stops at 999,999)')
setl('B1.S3', 'partial', 'placevalue:pv_digit_drag', opts={'source': 'word', 'band': 999999}, missing='7-digit numbers read from words (the band stops at 999,999)')
setl('B1.S3', 'pre', 'placevalue:combine', opts=B999, why='Y5.B1.S8 Partition numbers to 1,000,000 (prior learning wk W01): write a 6-digit numeral from its parts')
setl('B1.S3', 'related', 'placevalue:expand', opts=B999, why='expanded form of the same 6-digit numbers')
setl('B1.S3', 'related', 'placevalue:compare', opts=B999, why='compare the 6-digit numbers read here (Y6.B1.S6)')

# ---- B1.S4 Powers of 10 (class B, E, L)
setl('B1.S4', 'pre', 'placevalue:pv_digit_drag', opts=B999, why='Y5.B1.S4 Numbers to 1,000,000 (prior learning wk W01): every place to hundred thousands')
setl('B1.S4', 'pre', 'placevalue:place_value_disks', opts={'band': 9999}, why='Y4.B1.S4 Thousands (prior learning wk W01): ten 100 disks make one 1,000 disk, the ×10 between places')
setl('B1.S4', 'related', 'patterns:count_by_powers_of_10', opts={'step': [0, 1]}, why='count on and back in 10s and 100s across a hundred or a thousand: one place at a time, ten of one place make the next')
setl('B1.S4', 'related', 'order_of_operations:exponents_simple', opts={'step': [0], 'band': 50}, why='index notation for small squares and cubes (7² = 49, 3³ = 27): the notation 10², 10³ … uses')

# ---- B1.S5 Number line to 10,000,000 (class C, B)
setl('B1.S5', 'partial', 'number_sense:place_on_number_line', opts={'span': 1000, 'band': 10000},
     missing='lines between hundred-thousands and millions: its widest line spans one thousand and its numbers stop at 10,000')
setl('B1.S5', 'pre', 'placevalue:compare', opts=B999, why='Y5.B1.S11 Compare and order numbers to 1,000,000 (prior learning wk W02): 6-digit numbers compared by place')
setl('B1.S5', 'pre', 'placevalue:pv_digit_drag', opts=B999, why='Y6.B1.S1 Numbers to 1,000,000 (taught earlier, W01): the place values a scale counts in')
setl('B1.S5', 'pre', 'number_sense:rounding_visual', why='Y4.B1.S15 Round to the nearest 100 (lower grade): where a 2-digit number sits between two tens decides how it rounds')
setl('B1.S5', 'related', 'placevalue:order_least_to_greatest', opts=B999, why='order 6-digit numbers by where they would sit on the line')
setl('B1.S5', 'related', 'number_sense:nearest_100000', why='round a 7-digit number to the nearest 100,000 (Y6.B1.S7)')
setl('B1.S5', 'related', 'integers:number_line_int', why='a scaled line through zero, read the same way (Y6.B1.S8)')

# ---- B1.S6 Compare and order any integers (M1, class C, E, B)
NEGHALF = 'comparing and ordering whole numbers to 10,000,000 (it deals integers from −100 to 100 only)'
to_partial('B1.S6', 'integers:compare_int', NEGHALF)
to_partial('B1.S6', 'integers:order_negatives', NEGHALF)
for k in ('placevalue:compare', 'placevalue:order_least_to_greatest', 'placevalue:order_greatest_to_least'):
    setl('B1.S6', 'partial', k, opts=B999, missing='7-digit numbers (the band stops at 999,999)')
setl('B1.S6', 'pre', 'number_sense:place_on_number_line', opts={'span': 1000, 'band': 10000},
     why='Y4.B1.S9 Number line to 10,000 (prior learning wk W02): the further along the line, the greater the number')
drop('B1.S6', 'related', 'integers:ordering_rationals')   # E: −1/3, −0.5 (6.NS.C.7)
drop('B1.S6', 'related', 'integers:abs_value')            # beyond Grade 5
setl('B1.S6', 'related', 'integers:integer_nl_drag', why='place integers on a line through zero: the order is the position')
add('B1.S6', 'related', 'number_sense:round_sort_million', why='sort 7-digit numbers by their nearest million: a first ordering of large numbers')
step('B1.S6', note='"Any integers" = large whole numbers AND negatives. compare_int and order_negatives deal integers through zero (−100 to 100) in full, so the negative half is taught; the place-value compare and order skills deal 6-digit numbers at band 999,999, so the 7-digit half is missing. Every skill is a partial cover; big_numbers closes it.')

# ---- B1.S7 Round any integer
setl('B1.S7', 'pre', 'number_sense:place_on_number_line', opts={'span': 1000, 'band': 10000},
     why='Y4.B1.S9 Number line to 10,000 (prior learning wk W02): where a number sits between two thousands')
setl('B1.S7', 'pre', 'number_sense:rounding_visual', why='Y4.B1.S14 Round to the nearest 10, 100 or 1,000 (prior learning wk W02): round to the nearest ten with the two tens shown')

# ---- B1.S8 Negative numbers (G, E, size)
unbuild_pre('B1.S8', 'negative_count')
drop('B1.S8', 'partial', 'integers:sub_int')     # "−3 − (−13)": 7.NS, not a Grade 5 cover
drop('B1.S8', 'related', 'integers:add_int')     # E: 5 + (−12), 7.NS
drop('B1.S8', 'related', 'integers:abs_value')
setl('B1.S8', 'pre', 'patterns:count_by_step_down', opts={'range': 100},
     why='Y1.B5.S3 Count backwards within 100 (prior learning wk W33, "Y1 Count backwards"): counting back in steps of 2, 3 and 10 to 0, the move continued past 0 on a line')
step('B1.S8', missing='finding the interval (difference) between a positive and a negative number in context, e.g. from −6 °C to 4 °C')
add('B1.S8', 'related', 'number_sense:place_on_number_line', opts={'span': 10, 'band': 100}, why='reading a position on a scaled line between two marks, the same reading a vertical thermometer needs')

# ---- B2.S1 Add and subtract integers: links fine; the cites are re-checked by build.py (class H)
# ---- B2.S2 Common factors / B2.S3 Common multiples / B2.S4 Rules of divisibility (class B, E)
setl('B2.S3', 'pre', 'number_theory:multiples', why='Y5.B3.S1 Multiples (prior learning wk W09): fill in and pick the multiples of the 3- to 12-times tables')
setl('B2.S3', 'pre', 'multiplication:count_by_tables', why='skip counting in a times-table gives its multiples in order')
drop('B2.S3', 'related', 'fraction_operations:add_frac_unlike')   # E: unlike denominators, W15
drop('B2.S3', 'related', 'fractions:compare_frac_lcd')            # W14, five weeks ahead
setl('B2.S3', 'pre', 'number_theory:gcf_easy', why='Y6.B2.S2 Common factors (taught the same week, W09): the common-factor list this step mirrors with multiples')
setl('B2.S4', 'pre', 'number_theory:multiples', why='Y5.B3.S1 Multiples (prior learning wk W10): is a number a multiple of 3 to 12? A divisibility rule is a quick test of that')
setl('B2.S4', 'pre', 'multiplication:count_by_tables', opts={'constant': [3]}, why='Y4.B4.S1 Multiples of 3 (prior learning wk W10): counting in 3s, the multiples the ÷3 rule tests')

# ---- B2.S6 Square and cube numbers (G, E, B)
unbuild_pre('B2.S6', 'square_cube')
setl('B2.S6', 'partial', 'order_of_operations:exponents_simple', opts={'step': [0], 'band': 50},
     missing='square numbers as square arrays and cube numbers as cubes, and deciding whether a number is square or cube (it evaluates 7² or 3³ only)')
drop('B2.S6', 'related', 'algebra:evaluate_expression_hard')   # E: (a + 1)² at a = −3
setl('B2.S6', 'related', 'area_perimeter:volume', why='the volume of a box is length × width × height; a cube number is that product when all three edges are equal')
step('B2.S6', missing='square and cube numbers as pictures (square arrays, cubes) and recognising whether a number is square or cube; at band 50 exponents_simple evaluates small squares and cubes (7², 3³) as notation only')

# ---- B2.S7 Multiply up to a 4-digit number by a 2-digit number (class B, J)
setl('B2.S7', 'pre', 'multiplication:multiply', opts={'tiles': 31},
     why='Y5.B5.S1 Multiply up to a 4-digit number by a 1-digit number (prior learning wk W03): 3-digit × 1-digit in columns, the first row of long multiplication (its widest column band is 3 digits)')
add('B2.S7', 'pre', 'multiplication:multiply', opts={'tiles': 22}, pos=1,
    why='Y5.B5.S3 Multiply a 2-digit number by a 2-digit number (prior learning wk W03): two-row products of 2-digit numbers')
setl('B2.S7', 'pre', 'multiplication:mult_facts', why='Y4.B4.S6 The 3, 6 and 9 times-tables (lower grade): the facts inside every row')

# ---- B2.S8 Solve problems with multiplication (class B)
setl('B2.S8', 'pre', 'multiplication:mult_placeholder_zero', why='Y5.B5.S5 Multiply a 4-digit number by a 2-digit number (prior learning wk W03): the placeholder 0 of the second row, on 2-digit × 2-digit')

# ---- B2.S9 Short division (class B)
setl('B2.S9', 'pre', 'division:div_remainders', why='Y3.B4.S9 Divide a 2-digit number by a 1-digit number with remainders (prior learning wk W04): ring the groups and write the quotient and remainder (small numbers, to 30)')

# ---- B2.S10 Division using factors (class B; Y4's factor_pair_strategy is the missing pre-skill)
setl('B2.S10', 'pre', 'multiplication:mult_properties', why='Y4.B5.S2 Use factor pairs (prior learning wk W03): the commutative and distributive properties (6 × 8 = 8 × 6; 7 × 3 = 6 × 3 + 1 × 3); the factor-pair regrouping itself (12 × 5 = 6 × 2 × 5) has no skill yet: factor_pair_strategy')
_S('B2.S10')['preBuild'].append('factor_pair_strategy')
setl('B2.S10', 'pre', 'division:mixed_mult_div', why='relating × and ÷ with 2- and 3-digit numbers (947 × 7, its inverse)')

# ---- B2.S11 Introduction to long division (class B)
setl('B2.S11', 'pre', 'division:div_zero_in_quotient', why='Y5.B5.S7 Short division (prior learning wk W04): 3- and 4-digit ÷ 1-digit with a 0 in the quotient (824 ÷ 8 = 103)')

# ---- B2.S12 Long division with remainders (class D)
drop('B2.S12', 'pre', 'fraction_operations:frac_as_division')   # fraction as division is W20
setl('B2.S12', 'pre', 'division:box_division_hard', why='Y5.B5.S7 Short division (prior learning wk W04): 3-digit ÷ 1-digit with remainders in a box grid')

# ---- B2.S14 Solve multi-step problems (class E)
setl('B2.S14', 'related', 'order_of_operations:paren_simple', opts={'band': 50}, why='write the steps as one expression with brackets (next step, Y6.B2.S15)')

# ---- B2.S15 Order of operations (rule 7 / generator bug): band 50 removes the negative answers and operands
for k in ('order_of_operations:two_ops_no_paren', 'order_of_operations:three_ops_no_paren', 'order_of_operations:paren_simple'):
    setl('B2.S15', 'direct', k, opts={'band': 50})
setl('B2.S15', 'direct', 'order_of_operations:oop_medium', opts={'forms': [0, 1, 2, 4], 'band': 50})
drop('B2.S15', 'pre', 'number_ops_mixed:mixed')   # 4- and 5-digit sums, far past the step's band
setl('B2.S15', 'related', 'order_of_operations:paren_multi', opts={'band': 50}, why='several operations with brackets, at the same band')
step('B2.S15', note='Y6 = 5.OA.A.1: brackets first, × and ÷ before + and −. Every direct is set to band 50 (numbers to 50): checked on 200 items each, no negative answer or operand. GENERATOR BUG (record; not fixed here): at the default band (the Max Number) two_ops_no_paren / three_ops_no_paren give negative answers ("21 × 2 − 47 + 1 = −4") and paren_simple negative operands ("(62 + −28) ÷ 17"), 2-3% of items. oop_medium is tagged without "Brackets inside brackets".')

# ---- B2.S17 Reason from known facts (size)
setl('B2.S17', 'pre', 'placevalue:place_value_10x', opts={'op': 'x', 'power': [10, 100], 'band': 1000}, why='Y5.B3.S8 Multiply by 10, 100 and 1,000 (lower grade): × 10 and × 100 of a 3-digit number, the scaling inside 24 × 15 = 360 so 240 × 15 = 3,600')
drop('B2.S17', 'related', 'multiplication:area_model_mult_hard')
add('B2.S17', 'related', 'multiplication:area_model_mult', why='partial products: 24 × 16 is 24 × 15 plus one more 24')

# ---- B3 (class E: estimate_frac_ops negative estimates; {task:[0]} = adding only, verified 0 negatives in 80)
for sid in ('B3.S5', 'B3.S6', 'B3.S8'):
    setl(sid, 'related', 'fraction_operations:estimate_frac_ops', opts={'task': [0]}, why='estimate a sum of two fractions with benchmarks (0, ½, 1) before working it out')
setl('B3.S9', 'pre', 'fraction_operations:estimate_frac_ops', opts={'task': [0]}, why='Y6.B3.S5 Add and subtract simple fractions (taught earlier, W15): estimate a fraction sum with benchmarks, the check on a story answer')
setl('B3.S1', 'pre', 'fractions:fraction_bar_ops', opts={'denoms': [2]}, why='Y3.B6.S10 Equivalent fractions as bar models (prior learning wk W14): halves, quarters and eighths compared on fraction bars (related denominators only)')

# ---- B4.S3 / B4.S4 Divide a fraction by an integer (class C; the form labels of div_unit_frac_nv are swapped)
drop('B4.S3', 'partial', 'fraction_operations:div_unit_fraction')
add('B4.S3', 'related', 'fraction_operations:div_unit_fraction', why='the same unit fraction ÷ whole with bar, area or circle models (it also mixes in whole ÷ unit fraction, W19)')
DUF = 'non-unit fractions (6/7 ÷ 3); the items are unit fraction ÷ whole (1/3 ÷ 6), and about 3 in 10 are a "click all expressions equal to 3 ÷ 1/3" item (whole ÷ unit fraction, 5.NF.B.7b, taught W19) that the forms option does not remove'
setl('B4.S3', 'partial', 'fraction_operations:div_unit_frac_nv', opts={'forms': [2, 3]}, missing=DUF)
setl('B4.S4', 'partial', 'fraction_operations:div_unit_frac_nv', opts={'forms': [2, 3]},
     missing='non-unit fractions and renaming with an equivalent fraction first (2/3 ÷ 4 = 8/12 ÷ 4); the items are unit fraction ÷ whole, and about 3 in 10 are a whole ÷ unit fraction "click all" item (W19)')
drop('B4.S3', 'related', 'fraction_operations:frac_as_division')   # W20
step('B4.S3', note='Use div_unit_frac_nv with forms [2, 3]: GENERATOR BUG (record; not fixed here) — its form labels are swapped: forms [0, 1] "Unit fraction ÷ whole" deal 8 ÷ 1/3, and forms [2, 3] "Whole ÷ unit fraction" deal 1/3 ÷ 6. Its "click all expressions equal to n ÷ 1/k" item ignores forms (17 of 60 items with forms [2, 3]).')
note_add('B4.S4', 'div_unit_frac_nv is set to forms [2, 3] because its form labels are swapped (see Y6.B4.S3).')
setl('B4.S5', 'pre', 'fraction_operations:div_unit_frac_nv', opts={'forms': [2, 3]}, why='Y6.B4.S3 Divide a fraction by an integer (taught earlier, W17): unit fraction ÷ whole, the sharing items (forms [2, 3]: the labels are swapped)')

# ---- B4.S6 / B4.S7 (class E: percent of an amount is W36)
drop('B4.S6', 'related', 'conversions:percent_of_number')
drop('B4.S7', 'related', 'conversions:find_whole_from_pct')
drop('B4.S7', 'related', 'algebra:solve_eq_multdiv')   # 1-step equations are W35; the step is W18
