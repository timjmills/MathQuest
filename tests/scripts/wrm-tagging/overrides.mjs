// Hand verdicts for Y2 / Y3, round 2. Every entry was judged from items generated WITH the opts below
// (tests/scripts/wrm-tagging/items.mjs; log in design/audit/runs/wrm-tagging/Y2-Y3-items.md).
//   direct:[{key,opts}]  partials:[{key,missing,opts?}]  verdict  missing  build  pre  preBuild  related  note
//   reviewed:true = the SKILL_WRM tags were re-generated and stand as they are.
export const exclude = ['addition:equal_sign']; // deals plain column addition today (build-list equal_sign_repair)
const D = (key, opts = {}) => ({ key, opts });
const P = (key, missing, opts) => ({ key, missing, ...(opts ? { opts } : {}) });
const R = (key, why, opts) => ({ key, why, ...(opts ? { opts } : {}) });
const USD = { currency: 'usd' };
const zero = (step) => ({ rows: [{ step, start: 'zero', dir: 'up' }] });
const OK = { reviewed: true };

export const steps = {
  // ---------------- Y2 B1 place value ----------------
  'Y2.B1.S1': { direct: [D('composing:teen_compose'), D('composing:base10_build', { band: 20 })] },
  'Y2.B1.S2': { partials: [P('composing:base10_build', 'grouping loose objects into tens to count them (the skill shows ready-made tens rods)', { band: 99 })],
    pre: [R('counting:count_objects', 'Y1.B1.S2 count objects one by one, the first step of counting by tens')] },
  'Y2.B1.S3': { direct: [D('composing:tens_foundation_visual', { band: 90 }), D('composing:base10_build', { band: 99 })] },
  'Y2.B1.S4': { direct: [D('placevalue:identify', { band: 99 }), D('placevalue:value', { band: 99 })], note: 'band 99 keeps the chart to tens and ones (the default 999 deals 3-digit numbers, above Y2)' },
  'Y2.B1.S5': { direct: [D('placevalue:expand', { band: 99 }), D('placevalue:unit_form', { band: 99 })] },
  'Y2.B1.S7': OK,
  'Y2.B1.S8': { direct: [D('placevalue:expand', { band: 99 }), D('placevalue:combine', { band: 99 })] },
  'Y2.B1.S6': { direct: [D('composing:number_word_form', { wordform: ['to_words', 'to_number'], range: 100 })],
    related: [R('placevalue:unit_form', 'the same number said as tens and ones before it is written in words')] },
  'Y2.B1.S9': { partials: [P('number_sense:place_on_number_line', 'counting in 10s along a whole 0-100 line marked in tens (the line spans one ten)', { span: 10, band: 100 })], build: ['nl_20'] },
  'Y2.B1.S10': { partials: [P('number_sense:place_on_number_line', 'a whole 0-100 line counted in tens then ones (the line spans one ten)', { span: 10, band: 100 })], build: ['nl_20'] },
  'Y2.B1.S11': { partials: [P('number_sense:place_on_number_line', 'estimating on a 0-100 line with only the ends marked (every tick is drawn)', { span: 10, band: 100 })], build: ['nl_20'] },
  'Y2.B1.S12': OK,
  'Y2.B1.S13': { direct: [D('placevalue:compare', { band: 99 })] },
  'Y2.B1.S14': { direct: [D('placevalue:order_least_to_greatest', { band: 99 }), D('placevalue:order_greatest_to_least', { band: 99 })] },
  'Y2.B1.S15': { direct: [D('multiplication:count_by_tables', { rows: [{ step: 2, start: 'zero', dir: 'up' }, { step: 5, start: 'zero', dir: 'up' }, { step: 10, start: 'zero', dir: 'up' }] })],
    why: { 'patterns:seq_2': 'items start anywhere (49, 51, 53): not the multiples of 2', 'patterns:seq_5': 'items start anywhere (49, 54, 59): not multiples of 5', 'patterns:seq_10': 'items start anywhere (23, 33, 43): not multiples of 10' },
    related: [R('patterns:seq_10', 'counting on in 10s from any number: the next idea (1.NBT.C.5)'), R('patterns:skip_count_line', 'the same count as jumps on a number line')] },
  'Y2.B1.S16': { direct: [D('multiplication:count_by_tables', zero(3))], verdict: 'full',
    note: 'count_by_tables with a row {step 3, from 0} deals 0, 3, 6 ... 33: the count_3s proposal is already built (retire it)',
    related: [R('patterns:skip_count_line', 'counting in 3s as jumps on a number line')] },
  // ---------------- Y2 B2 addition and subtraction ----------------
  'Y2.B2.S1': { direct: [D('composing:make_ten')], why: { 'composing:number_bonds': 'deals bonds of 4, 5, 6 ... within 10, not bonds TO 10: kept as a pre-skill' },
    pre: [R('composing:number_bonds', 'Y1 bonds within 10: the part-whole step before bonds to 10'), R('composing:ten_frame_build', 'numbers to 10 on a ten frame, the picture a bond to 10 is read from')] },
  'Y2.B2.S2': OK, 'Y2.B2.S3': OK, 'Y2.B2.S4': OK, 'Y2.B2.S7': OK, 'Y2.B2.S8': OK, 'Y2.B2.S10': OK, 'Y2.B2.S11': OK,
  'Y2.B2.S15': OK, 'Y2.B2.S16': OK, 'Y2.B2.S18': OK, 'Y2.B2.S21': OK,
  'Y2.B2.S5': { partials: [P('placevalue:more_less_10', 'only ±1; adding or subtracting several ones to a 2-digit number (34 + 3) without crossing a ten is not dealt', { step: 1 }),
      P('addition:number_line_add', 'within 20 only, not ones added to a 2-digit number')], build: ['one_digit_addend'] },
  'Y2.B2.S6': OK,
  'Y2.B2.S9': { partials: [P('addition:add_50_regroup', 'items mix 1-digit + 1-digit and 2-digit + 2-digit; 2-digit + 1-digit across a ten (38 + 5) is not alone on a page'),
      P('number_sense:make_a_ten', 'bridges 10 within 20 only, not a 2-digit number across the next ten')], build: ['add_next_10'] },
  'Y2.B2.S12': { partials: [P('subtraction:sub_50_regroup', 'items mix 2-digit − 2-digit with 2-digit − 1-digit; a page of 2-digit − 1-digit across a ten is not available', { band: 50 })],
    why: { 'subtraction:sub_100_regroup': 'deals 2-digit − 2-digit (66 − 17): that is Y2.B2.S18' }, build: ['one_digit_addend'],
    related: [R('subtraction:sub_100_regroup', 'the next step: 2-digit − 2-digit across a ten')] },
  'Y2.B2.S13': { direct: [D('placevalue:more_less_10', { step: 10 })] },
  'Y2.B2.S14': { partials: [P('addition:add_sub_10s', 'deals only a decade ± 10 (70 − 10); adding 20 or subtracting 30, and a 2-digit number ± tens (34 + 20), are not dealt')],
    build: ['tens_any'], pre: [R('placevalue:more_less_10', 'Y2.B2.S13 10 more, 10 less')] },
  'Y2.B2.S17': { reviewed: true, pre: [R('subtraction:sub_50_no_regroup', 'subtracting within 50 without an exchange, the smaller band first')] },
  'Y2.B2.S19': { direct: [D('addition:add_wp_100'), D('subtraction:sub_wp_100')], why: { 'subtraction:mixed_add_sub': 'sums pass 100 (96 + 44 = 140) and its range option is ignored: kept as related' }, related: [R('subtraction:mixed_add_sub', 'mixed + and − without a story (sums can pass 100)')], pre: [R('addition:add_100_no_regroup', 'Y2.B2.S15 adding two 2-digit numbers'), R('subtraction:sub_100_no_regroup', 'Y2.B2.S17 subtracting two 2-digit numbers'), R('addition:add_wp_20', 'one-step addition stories within 20'), R('subtraction:sub_wp_20', 'one-step subtraction stories within 20')], preOnly: true },
  'Y2.B2.S20': OK,
  // ---------------- Y2 B3 shape ----------------
  'Y2.B3.S1': OK, 'Y2.B3.S4': OK, 'Y2.B3.S5': OK, 'Y2.B3.S7': OK, 'Y2.B3.S11': OK, 'Y2.B3.S12': OK,
  'Y2.B3.S2': { direct: [D('shapes_early:count_sides_vertices_2d', { forms: [0] })] },
  'Y2.B3.S3': { direct: [D('shapes_early:shape_corners_count'), D('shapes_early:count_sides_vertices_2d', { forms: [1] })] },
  'Y2.B3.S6': { reviewed: true, preOnly: true, pre: [R('angles_lines:symmetry', 'Y2.B3.S5 lines of symmetry: find the mirror line before completing the half'), R('angles_lines:place_symmetry_lines', 'Y2.B3.S5 drawing the line of symmetry'), R('shapes_early:name_2d_shapes', 'Y2.B3.S1 naming the shape that is being completed')] },
  'Y2.B3.S8': { direct: [D('shapes_early:count_edges_faces_vertices', { forms: [0] })], verdict: 'full',
    note: 'forms [0] = faces only: the shape_faces proposal is already built (retire it). Owner question: the skill says a cylinder has 3 faces; WRM Y2 says 2 flat faces and 1 curved surface.' },
  'Y2.B3.S9': { direct: [D('shapes_early:count_edges_faces_vertices', { forms: [1] })] },
  'Y2.B3.S10': { direct: [D('shapes_early:count_edges_faces_vertices', { forms: [2] })] },
  // ---------------- Y2 B4 money (US dollars, owner answer) ----------------
  'Y2.B4.S1': { direct: [D('measurement:money_count', { currency: 'usd', kind: 'like' }), D('measurement:coin_value', USD)] },
  'Y2.B4.S2': { direct: [D('measurement:money_count', { currency: 'usd', kind: 'note' })], verdict: 'full', note: 'kind "note" counts $1, $5, $10, $20 bills: the money_uk option is built for this step' },
  'Y2.B4.S3': { direct: [D('measurement:money_count', { currency: 'usd', kind: 'both' })], verdict: 'full', note: 'kind "both": count the bills, then the coins, write both numbers' },
  'Y2.B4.S4': { partials: [P('measurement:make_change_least_coins', 'coins only and always the FEWEST coins; choosing bills and coins to make an amount (any way) is not dealt', USD)], build: ['make_amount_notes'] },
  'Y2.B4.S5': { direct: [D('measurement:equiv_coin_sets', USD)] },
  'Y2.B4.S6': { reviewed: true, note: 'money_compare has no US option (plain or QAR): plain cents are dealt' },
  'Y2.B4.S7': { partials: [P('measurement:money', 'adds whole-dollar prices only; finding the difference between two amounts is not dealt', USD)],
    why: { 'measurement:enough_money': 'asks "is there enough?" (a compare), not a calculation: kept as related' }, build: ['money_difference'],
    related: [R('measurement:enough_money', 'compare an amount with a price, the reasoning behind a difference'), R('measurement:money_change', 'the next step: change is a difference')] },
  'Y2.B4.S8': { partials: [P('measurement:equiv_coin_sets', 'checks whether coins make an amount up to $1; making exactly $1 (100 cents) in different ways is not asked', { currency: 'usd', band: 100 })], build: ['money_uk'] },
  'Y2.B4.S9': { direct: [D('measurement:money_change', { currency: 'usd', step: 100 })] },
  'Y2.B4.S10': { reviewed: true, preOnly: true, pre: [R('measurement:money', 'Y2.B4.S7 adding prices'), R('measurement:money_change', 'Y2.B4.S9 finding change'), R('addition:add_wp_100', 'one-step addition stories within 100'), R('subtraction:sub_wp_100', 'one-step subtraction stories within 100')] },
  // ---------------- Y2 B5 multiplication and division ----------------
  'Y2.B5.S1': OK, 'Y2.B5.S2': OK, 'Y2.B5.S4': OK, 'Y2.B5.S5': OK, 'Y2.B5.S7': OK, 'Y2.B5.S8': OK, 'Y2.B5.S12': OK,
  'Y2.B5.S3': { direct: [D('multiplication:arrays_groups', { forms: [1] }), D('multiplication:repeated_add_to_mult', { band: 25 })] },
  'Y2.B5.S6': { direct: [D('multiplication:arrays_groups', { forms: [0] }), D('multiplication:dot_array_mult', { band: 25 })] },
  'Y2.B5.S9': { direct: [D('multiplication:mult_facts', { constant: [2] }), D('multiplication:count_by_tables', zero(2))] },
  'Y2.B5.S10': { direct: [D('division:div_facts', { constant: [2] })] },
  'Y2.B5.S11': { direct: [D('patterns:double', { band: 20 }), D('patterns:halve', { band: 20 })] },
  'Y2.B5.S13': { direct: [D('multiplication:mult_facts', { constant: [10] }), D('multiplication:count_by_tables', zero(10))] },
  'Y2.B5.S14': { direct: [D('division:div_facts', { constant: [10] })] },
  'Y2.B5.S15': { direct: [D('multiplication:mult_facts', { constant: [5] }), D('multiplication:count_by_tables', zero(5))] },
  'Y2.B5.S16': { direct: [D('division:div_facts', { constant: [5] })] },
  'Y2.B5.S17': { direct: [D('multiplication:mult_facts', { constant: [5, 10] }), D('multiplication:mult_chart_easy', { constant: [5, 10] })] },
  // ---------------- Y2 B6 length ----------------
  'Y2.B6.S1': { reviewed: true, pre: [R('shapes_early:measure_nonstandard', 'Y1.B7.S2 measuring length with cubes and paper clips (prior learning wk W21)'), R('comparing:compare_objects', 'Y1.B7.S1 compare lengths and heights')],
    related: [R('measurement:estimate_length', 'estimating a length before measuring it'), R('measurement:length_metric', 'cm and m as units of the same length')] },
  'Y2.B6.S2': { reviewed: true, related: [R('measurement:estimate_length', 'choosing cm or m for an object'), R('measurement:reading_ruler', 'measuring on a scale (the ruler)')] },
  'Y2.B6.S3': { partials: [P('comparing:compare_objects', 'compares pictured objects; comparing lengths given in cm and m with <, > and = is not dealt'), P('shapes_early:order_objects_length', 'orders pictured objects; no lengths in cm or m')], build: ['compare_lengths'],
    related: [R('placevalue:compare', 'comparing the numbers of the measurements with <, >, =')] },
  'Y2.B6.S4': { partials: [P('shapes_early:order_objects_length', 'orders pictured objects; ordering lengths given in cm and m is not dealt')], build: ['compare_lengths'],
    related: [R('placevalue:order_least_to_greatest', 'ordering the numbers of the measurements')] },
  'Y2.B6.S5': { reviewed: true, preOnly: true, pre: [R('measurement:reading_ruler', 'Y2.B6.S1 measuring a length'), R('addition:add_wp_100', 'addition stories within 100'), R('subtraction:sub_wp_100', 'subtraction and difference stories within 100'), R('multiplication:mult_facts', 'Y2.B5 the 2, 5 and 10 times-tables ("twice as tall")'), R('patterns:halve', 'Y2.B5.S11 halving ("half as tall")')],
    related: [R('measurement:estimate_length', 'estimating lengths to check a calculation'), R('measurement:unit_conversion_word', 'measure word problems in the next years')] },
  // ---------------- Y2 B7 mass, capacity, temperature ----------------
  'Y2.B7.S1': { reviewed: true, related: [R('comparing:compare_objects', 'comparing by length and height, the same compare language')] },
  'Y2.B7.S2': { partials: [P('measurement:mass_volume_liquid', 'reads one kind of g scale (and some kg items); reading scales in grams with different steps is not dealt', { forms: [1] })], build: ['mass_scales'] },
  'Y2.B7.S3': { partials: [P('measurement:mass_volume_liquid', 'mostly grams; reading a kilogram scale is not dealt', { forms: [1] })], build: ['mass_scales'] },
  'Y2.B7.S4': { reviewed: true, preOnly: true, pre: [R('measurement:mass_volume_liquid', 'Y2.B7.S2 reading a mass in grams'), R('addition:add_wp_100', 'addition stories within 100'), R('subtraction:sub_wp_100', 'subtraction stories within 100'), R('measurement:heavier_lighter_visual', 'Y2.B7.S1 heavier and lighter')],
    related: [R('measurement:capacity', 'the same operations with capacity (Y2.B7.S8)')] },
  'Y2.B7.S5': { reviewed: true, pre: [R('comparing:compare_objects', 'compare language (more, less) from length and height')], related: [R('measurement:capacity', 'capacity units and comparing containers'), R('measurement:heavier_lighter_visual', 'comparing mass, the same compare language')] },
  'Y2.B7.S6': { direct: [D('measurement:mass_volume_liquid', { forms: [0] })] },
  'Y2.B7.S7': { partials: [P('measurement:mass_volume_liquid', 'reads millilitres only; reading a jug in litres is not dealt', { forms: [0] })], build: ['mass_scales'] },
  'Y2.B7.S8': { reviewed: true, preOnly: true, pre: [R('measurement:mass_volume_liquid', 'Y2.B7.S6 reading millilitres'), R('addition:add_wp_100', 'addition stories within 100'), R('subtraction:sub_wp_100', 'subtraction stories within 100')], related: [R('measurement:capacity', 'capacity units')] },
  'Y2.B7.S9': { direct: [D('measurement:temperature', { forms: [1] })], note: 'forms [1] reads a °C thermometer (forms [0] is °F)' },
  // ---------------- Y2 B8 fractions ----------------
  'Y2.B8.S1': OK, 'Y2.B8.S2': OK, 'Y2.B8.S9': OK, 'Y2.B8.S15': OK,
  'Y2.B8.S3': { direct: [D('shapes_early:partition_shapes', { parts: [0] })] },
  'Y2.B8.S4': { direct: [D('patterns:halve', { band: 20 })], partials: [P('fractions:shade_fraction', 'denoms [2] is the halves family: it also deals 4/8 and 5/8, not only 1/2', { denoms: [2] })],
    why: { 'fractions:fraction_of_set': 'ignores denoms in its missing-numerator items (generator bug): cannot be narrowed to halves' },
    note: 'half of an amount is dealt by halve {band 20}; a page of 1/2 of a shape needs single_fraction',
    related: [R('shapes_early:partition_shapes', 'Y2.B8.S3 recognising a half of a shape')] },
  'Y2.B8.S5': { direct: [D('shapes_early:partition_shapes', { parts: [2] })] },
  'Y2.B8.S6': { partials: [P('fractions:shade_fraction', 'the halves family (1/2, 1/4, 3/4, eighths): a page of quarters only is not available', { denoms: [2] })],
    why: { 'fractions:fraction_of_set': 'ignores denoms in missing-numerator items (bug)' }, build: ['single_fraction'] },
  'Y2.B8.S7': { direct: [D('shapes_early:partition_shapes', { parts: [1] })] },
  'Y2.B8.S8': { partials: [P('fractions:shade_fraction', 'the thirds family also deals sixths and twelfths; a page of 1/3 only is not available', { denoms: [3] })],
    why: { 'fractions:fraction_of_set': 'ignores denoms in missing-numerator items (bug)' }, build: ['single_fraction'] },
  'Y2.B8.S10': { partials: [P('fractions:identify', 'denoms [2,3] are families: items deal 2/6, 1/6 and 7/8, not only unit halves, quarters and thirds', { denoms: [2, 3] }), P('fractions:write_fraction', 'deals 7/8 and 1/6 (non-unit, sixths, eighths)', { denoms: [2, 3] })], build: ['single_fraction'] },
  'Y2.B8.S11': { partials: [P('fractions:write_fraction', 'denoms [2,3] also deal sixths and eighths (7/8), above Y2', { denoms: [2, 3] }), P('fractions:shade_fraction', 'deals 7/8 and 1/6', { denoms: [2, 3] })], build: ['single_fraction'] },
  'Y2.B8.S12': { partials: [P('fractions:equiv_frac_visual', 'the halves family deals 3/4 = 12/16 and eighths too; a page of 1/2 = 2/4 only is not available', { denoms: [2] })], build: ['single_fraction'] },
  'Y2.B8.S13': { partials: [P('shapes_early:partition_shapes', 'quarters shapes: shades 1/4, 2/4 and 3/4, not three-quarters alone', { parts: [2] }), P('fractions:identify', 'the halves family, not 3/4 alone', { denoms: [2] })],
    why: { 'fractions:write_fraction': 'deals sixths, fifths and eighths at Y2 (no single-fraction option)' }, build: ['single_fraction'] },
  'Y2.B8.S14': { partials: [P('fractions:shade_fraction', 'the halves family; a page of 3/4 of a shape or amount is not available', { denoms: [2] })],
    why: { 'fractions:fraction_of_set': 'ignores denoms in missing-numerator items (bug)' }, build: ['single_fraction'] },
  // ---------------- Y2 B9 time ----------------
  'Y2.B9.S1': OK, 'Y2.B9.S2': OK,
  'Y2.B9.S3': { partials: [P('measurement:time_5min', 'words-past turns "twenty past two" into 2:20 but mixes in "to" times; reading a clock and saying it as minutes PAST the hour is not dealt', { stimulus: 'words-past' })], build: ['time_past_to'],
    related: [R('measurement:time_analog_digital', 'the same time written as digits')] },
  'Y2.B9.S4': { partials: [P('measurement:time_5min', 'words-past mixes "past" and "to"; reading a clock and saying it as minutes TO the next hour is not dealt', { stimulus: 'words-past' })], build: ['time_past_to'] }, 'Y2.B9.S5': OK, 'Y2.B9.S6': OK, 'Y2.B9.S7': OK,
  // ---------------- Y2 B10 statistics ----------------
  'Y2.B10.S1': OK, 'Y2.B10.S2': OK, 'Y2.B10.S3': OK, 'Y2.B10.S4': OK, 'Y2.B10.S5': OK, 'Y2.B10.S6': OK, 'Y2.B10.S7': OK,
  // ---------------- Y2 B11 position ----------------
  'Y2.B11.S1': OK, 'Y2.B11.S2': OK, 'Y2.B11.S4': OK, 'Y2.B11.S5': OK,
  'Y2.B11.S3': { reviewed: true, pre: [R('shapes_early:shape_positions', 'Y2.B11.S1 the language of position (left, right)'), R('fractions:shade_fraction', 'Y2.B8 halves and quarters: a half turn and a quarter turn')] },

  // ================= Y3 B1 place value =================
  'Y3.B1.S1': { direct: [D('composing:base10_build', { band: 99 }), D('placevalue:unit_form', { band: 99 })] },
  'Y3.B1.S2': { direct: [D('placevalue:expand', { band: 99 })], related: [R('composing:base10_build', 'the same partition built with tens rods and ones cubes')] }, 'Y3.B1.S3': OK, 'Y3.B1.S5': OK, 'Y3.B1.S6': OK, 'Y3.B1.S7': OK, 'Y3.B1.S8': OK, 'Y3.B1.S12': OK, 'Y3.B1.S13': OK,
  'Y3.B1.S4': { partials: [P('composing:base10_build_hundreds', 'builds 3-digit numbers; counting in 100s and 10 hundreds = 1,000 are not dealt'),
      P('multiplication:count_by_tables', 'counts in 100s from 0 but runs past 1,000 (to 1,100)', zero(100))], build: ['count_50s'] },
  'Y3.B1.S9': { partials: [P('placevalue:more_less_100', 'steps of 10 and 100 only (step "mixed" also adds 1,000 more, past the step); 1 more and 1 less on a 3-digit number is not dealt', { step: 0 })], build: ['more_less_1_3digit'] },
  'Y3.B1.S10': { partials: [P('number_sense:place_on_number_line', 'marks a number between two hundreds; a whole 0-1,000 line counted in 100s, and reading the value at an arrow, are not dealt', { span: 100, band: 1000 })], build: ['nl_20'] },
  'Y3.B1.S11': { partials: [P('number_sense:place_on_number_line', 'the hundreds are marked; estimating on a line with only the ends (0 and 1,000) marked is not dealt', { span: 100, band: 1000 })], build: ['nl_20'] },
  'Y3.B1.S14': { direct: [D('multiplication:count_by_tables', zero(50))], verdict: 'full',
    preOnly: true, pre: [R('patterns:seq_10', 'Y2.B1.S15 counting in 10s'), R('multiplication:mult_facts', 'Y2.B5.S15 the 5 times-table: 50 is 5 tens (opts constant [5])'), R('placevalue:more_less_100', 'Y3.B1.S4 counting in 100s: two 50s make 100')],
    related: [R('patterns:skip_count_line', 'counting in 50s as jumps on a number line')],
    note: 'count_by_tables with a row {step 50, from 0} deals 0, 50 ... 550: count_50s is built for this step (still open for Y3.B1.S4)' },
  // ================= Y3 B2 addition and subtraction =================
  'Y3.B2.S1': { partials: [P('addition:add_sub_10s', 'a decade ± 10 only; 30 + 40 from 3 + 4 is not dealt'), P('addition:add_sub_100s', 'a hundred ± 100 only; 300 + 400 from 3 + 4 is not dealt')],
    why: { 'addition:add_facts': 'within-20 facts: the bonds themselves, not applied to tens and hundreds (kept as pre)', 'subtraction:sub_facts': 'within-20 facts (kept as pre)' },
    build: ['add_sub_patterns'], preOnly: true, pre: [R('composing:number_bonds', 'Y2.B2.S1 bonds within 10: the facts being applied'), R('composing:make_ten', 'bonds to 10'), R('addition:add_facts', 'addition facts within 20'), R('subtraction:sub_facts', 'subtraction facts within 20'), R('addition:add_sub_10s', 'Y2.B2.S14 adding and subtracting 10s')] },
  'Y3.B2.S2': { reviewed: true, build: ['add_sub_patterns', 'one_digit_addend'] },
  'Y3.B2.S3': { partials: [P('addition:add_sub_10s', 'a decade ± 10 only; adding and subtracting 10s to a 2- or 3-digit number (234 + 30) is not dealt'), P('placevalue:more_less_100', '10 more / 10 less only, not several tens', { step: 10 })], build: ['tens_any'] },
  'Y3.B2.S4': { partials: [P('addition:add_sub_100s', 'a hundred ± 100 only; adding hundreds to a 3-digit number (234 + 200) is not dealt'), P('placevalue:more_less_100', '100 more / 100 less only', { step: 100 })], build: ['hundreds_any'] },
  'Y3.B2.S5': OK, 'Y3.B2.S6': OK, 'Y3.B2.S7': OK, 'Y3.B2.S8': OK, 'Y3.B2.S9': OK, 'Y3.B2.S10': OK, 'Y3.B2.S11': OK, 'Y3.B2.S12': OK,
  'Y3.B2.S19': OK, 'Y3.B2.S20': OK, 'Y3.B2.S21': OK, 'Y3.B2.S22': OK,
  'Y3.B2.S13': { partials: [P('addition:add_1k_regroup', 'exchanges in the ones and the tens are mixed (167 + 499 exchanges twice); a page with one exchange in the ones only is not available')], build: ['exchange_count'] },
  'Y3.B2.S14': { partials: [P('addition:add_1k_regroup', 'exchanges are mixed; a page with one exchange in the tens (across a 100) only is not available')], build: ['exchange_count'] },
  'Y3.B2.S15': { partials: [P('subtraction:sub_1k_regroup', 'exchanges are mixed (307 − 278 exchanges twice); one exchange from the tens only is not available')], build: ['exchange_count'] },
  'Y3.B2.S16': { direct: [D('subtraction:sub_across_zeros', { band: 500 })], partials: [P('subtraction:sub_1k_regroup', 'exchanges are mixed; one exchange from the hundreds only is not available')], verdict: 'partial', build: ['exchange_count'] },
  'Y3.B2.S17': { partials: [P('addition:add_1k_mixed', 'mostly 3-digit + 3-digit (404 + 134); a page of 2-digit + 3-digit is not available')], build: ['two_and_three_digit'] },
  'Y3.B2.S18': { partials: [P('subtraction:sub_1k_mixed', 'mostly 3-digit − 3-digit (538 − 404); a page of 3-digit − 2-digit is not available')], build: ['two_and_three_digit'] },
  // ================= Y3 B3 multiplication and division A =================
  'Y3.B3.S1': { direct: [D('multiplication:arrays_groups', { forms: [1] }), D('multiplication:repeated_add_to_mult', { band: 36 })] },
  'Y3.B3.S2': { direct: [D('multiplication:arrays_groups', { forms: [0] }), D('multiplication:dot_array_mult', { band: 100 })] },
  'Y3.B3.S3': { reviewed: true, related: [R('composing:odd_even', 'multiples of 2 are the even numbers')] },
  'Y3.B3.S4': { reviewed: true, related: [R('multiplication:count_by_tables', 'counting in 5s and 10s from 0 lists the multiples')] },
  'Y3.B3.S5': OK,
  'Y3.B3.S6': { direct: [D('multiplication:mult_facts', { constant: [3] })] },
  'Y3.B3.S7': { direct: [D('division:div_facts', { constant: [3] })] },
  'Y3.B3.S8': { direct: [D('multiplication:mult_facts', { constant: [3] }), D('multiplication:count_by_tables', zero(3))] },
  'Y3.B3.S9': { direct: [D('multiplication:mult_facts', { constant: [4] })] },
  'Y3.B3.S10': { direct: [D('division:div_facts', { constant: [4] })] },
  'Y3.B3.S11': { direct: [D('multiplication:mult_facts', { constant: [4] }), D('multiplication:count_by_tables', zero(4))] },
  'Y3.B3.S12': { direct: [D('multiplication:mult_facts', { constant: [8] })] },
  'Y3.B3.S13': { direct: [D('division:div_facts', { constant: [8] })] },
  'Y3.B3.S14': { direct: [D('multiplication:mult_facts', { constant: [8] }), D('multiplication:count_by_tables', zero(8))] },
  'Y3.B3.S15': { partials: [P('multiplication:mult_facts', 'drills the three tables mixed; the doubling link (2 → 4 → 8) is not taught', { constant: [2, 4, 8] })], build: ['tables_links'] },
  // ================= Y3 B4 multiplication and division B =================
  'Y3.B4.S1': { direct: [D('multiplication:mult_zeros', { forms: [0] }), D('multiplication:count_by_tables', zero(10))],
    why: { 'patterns:seq_10': 'counts on in 10s from any number (49, 59): not the multiples of 10' }, related: [R('patterns:seq_10', 'counting on in 10s from any number, the next idea')] },
  'Y3.B4.S2': OK, 'Y3.B4.S3': OK, 'Y3.B4.S6': OK,
  'Y3.B4.S7': { partials: [P('division:box_division_easy', 'regroup "none" still deals 75 ÷ 5 and 84 ÷ 7 (an exchange of tens) and 1-digit dividends (15 ÷ 3): a page of 2-digit ÷ 1-digit with no exchange is not available', { regroup: 'none' })],
    why: { 'division:area_model_div_2by1': 'partitions with an exchange (65 ÷ 5 = 50 ÷ 5 + 15 ÷ 5): that is Y3.B4.S8' }, build: ['exchange_count'],
    related: [R('division:area_model_div_2by1', 'the next step: dividing by flexible partitioning')] }, 'Y3.B4.S8': OK, 'Y3.B4.S9': OK, 'Y3.B4.S10': OK,
  'Y3.B4.S4': { partials: [P('multiplication:multiply', '2-digit × 1-digit with and without exchanges mixed (53 × 8); a no-exchange page is not available', { tiles: 21 }), P('multiplication:area_model_mult', 'the partition picture, exchanges mixed', { tiles: 21 })], build: ['exchange_count'] },
  'Y3.B4.S5': { partials: [P('multiplication:multiply', 'mostly with an exchange, but no-exchange items (30 × 2) are mixed in', { tiles: 21 }), P('multiplication:area_model_mult', 'the partition picture; exchanges are not controlled (3 × 13)', { tiles: 21 })], build: ['exchange_count'] },
  'Y3.B4.S11': { reviewed: true, preOnly: true, pre: [R('multiplication:mult_facts', 'Y3.B3 the 2, 3, 4, 5, 8, 10 tables'), R('multiplication:arrays_groups', 'Y3.B3.S2 rows and columns: a table of combinations is an array'), R('multiplication:mult_word_problems', 'multiplication in stories')] },
  // ================= Y3 B5 length and perimeter =================
  'Y3.B5.S1': { partials: [P('measurement:length_metric', 'converts whole metres to cm; measuring in m and cm with a mixed answer (1 m 25 cm) is not dealt', { forms: [1] })], build: ['mm_cm_m'] },
  'Y3.B5.S2': OK, 'Y3.B5.S3': OK, 'Y3.B5.S7': OK, 'Y3.B5.S8': OK, 'Y3.B5.S9': OK, 'Y3.B5.S10': OK, 'Y3.B5.S11': OK, 'Y3.B5.S12': OK,
  'Y3.B5.S4': { direct: [D('measurement:length_metric', { forms: [0, 1, 2] })], note: 'forms 0-2 = mm/cm, cm/m, mm/m; form 3 (m in km) is above the step' },
  'Y3.B5.S5': { partials: [P('measurement:length_metric', 'whole metres to cm only (3 m = 300 cm); mixed units (1 m 20 cm = 120 cm) are not dealt', { forms: [1] })], build: ['mm_cm_m'] },
  'Y3.B5.S6': { partials: [P('measurement:length_metric', 'whole cm to mm only; mixed units (4 cm 5 mm = 45 mm) are not dealt', { forms: [0] })], build: ['mm_cm_m'] },
  // ================= Y3 B6 fractions A =================
  'Y3.B6.S1': OK, 'Y3.B6.S3': OK, 'Y3.B6.S4': OK, 'Y3.B6.S6': OK, 'Y3.B6.S7': OK, 'Y3.B6.S8': OK, 'Y3.B6.S9': OK, 'Y3.B6.S10': OK,
  'Y3.B6.S2': { partials: [P('fractions:compare', 'compares any two fractions (2/6 and 7/8); a page of unit fractions only is not available', { forms: [0] }), P('fractions:order_fractions', 'orders non-unit fractions too')], build: ['compare_kind'] },
  'Y3.B6.S5': { partials: [P('fractions:compare', 'forms [1] mixes same-denominator pairs (3/10, 9/10) with others (5/8, 1/3)', { forms: [1] }), P('fractions:order_fractions', 'mixed denominators')], build: ['compare_kind'] },
  // ================= Y3 B7 mass and capacity =================
  'Y3.B7.S1': { partials: [P('measurement:mass_volume_liquid', 'reads one kind of scale each; scales with different intervals are not dealt', { forms: [0, 1] })], build: ['mass_scales'] },
  'Y3.B7.S2': { partials: [P('measurement:mass_volume_liquid', 'grams on a scale, but some items ask the mass in kg (answer 0) on the same scale', { forms: [1] })], build: ['mass_scales'] },
  'Y3.B7.S3': { partials: [P('measurement:mass_volume_liquid', 'g or kg alone; mixed kg and g readings are not dealt', { forms: [1] })], build: ['mass_scales'] },
  'Y3.B7.S4': { partials: [], verdict: 'gap', why: { 'measurement:unit_conversions': 'customary units only (ounces and pounds) with every option: no kg and g' }, build: ['metric_mass_capacity'], missing: 'converting kilograms and grams, including mixed units (1 kg 250 g = 1,250 g)' },
  'Y3.B7.S5': { partials: [P('measurement:heavier_lighter_visual', 'pictured objects; comparing masses in g and kg with <, > and = is not dealt')], build: ['compare_measures'] },
  'Y3.B7.S6': OK,
  'Y3.B7.S7': { direct: [D('measurement:mass_volume_liquid', { forms: [0] })] },
  'Y3.B7.S8': { partials: [P('measurement:mass_volume_liquid', 'millilitres only; mixed l and ml readings are not dealt', { forms: [0] })], build: ['mass_scales'] },
  'Y3.B7.S9': { partials: [P('measurement:capacity', 'L ↔ mL but with decimals (1.5 L), above the step; mixed units (1 l 500 ml) are not dealt', { units: [1], forms: [0] })], build: ['metric_mass_capacity'] },
  'Y3.B7.S10': { reviewed: true, build: ['compare_measures'] },
  'Y3.B7.S11': OK,
  // ================= Y3 B8 fractions B =================
  'Y3.B8.S1': { partials: [P('fraction_operations:add_fractions_like', 'sums pass one whole (4/5 + 2/5 = 1 1/5), above the step; adding within a whole only is not available', { denoms: [2, 3, 5] })], why: { 'fraction_operations:add_frac_like_nv': 'deals elevenths and sums above 1 (no picture): kept as related' }, build: ['within_whole'],
    related: [R('fraction_operations:add_frac_like_nv', 'the same sums without a picture')] },
  'Y3.B8.S2': { direct: [D('fraction_operations:sub_fractions_like', { denoms: [2, 3, 5] }), D('fraction_operations:sub_frac_like_nv', { denoms: [2, 3, 5] })] },
  'Y3.B8.S3': OK, 'Y3.B8.S6': OK,
  'Y3.B8.S5': { partials: [P('fractions:fraction_of_set', 'mixes unit fractions (1/5 of 60) and missing-numerator items, and ignores denoms there (generator bug); a page of non-unit fractions of a set (3/5 of 20) is not available'),
      P('fractions:fraction_of_set_nv', 'mixes unit and non-unit fractions, without the set pictured')], build: ['fos_kind'] },
  'Y3.B8.S4': { partials: [P('fractions:fraction_of_set', 'mixes non-unit fractions (3/5 of the cats) and ignores denoms in missing-numerator items (generator bug); a page of unit fractions of a set is not available')], build: ['fos_kind'] },
  // ================= Y3 B9 money (US dollars) =================
  'Y3.B9.S1': { direct: [D('measurement:money_count', { currency: 'usd', kind: 'both' }), D('measurement:money_notation', USD)], note: 'pounds and pence taught as dollars and cents (school uses US money)' },
  'Y3.B9.S2': OK,
  'Y3.B9.S3': { direct: [D('measurement:money', { currency: 'usd', step: 5 })] },
  'Y3.B9.S4': { partials: [P('measurement:money_change', 'subtracts a price from a whole-dollar payment; subtracting any two amounts (a difference) is not dealt', { currency: 'usd', step: 5 })], build: ['money_difference'] },
  'Y3.B9.S5': { direct: [D('measurement:money_change', { currency: 'usd', step: 5 })] },
  // ================= Y3 B10 time =================
  'Y3.B10.S1': { reviewed: true, note: 'beyond CCSS (owner ruling: keep); roman_12 is the clock band of the one roman_numerals skill (wrm.js roman_100 / roman_1000)' },
  'Y3.B10.S2': OK, 'Y3.B10.S3': OK, 'Y3.B10.S4': OK, 'Y3.B10.S5': OK, 'Y3.B10.S6': OK, 'Y3.B10.S7': OK, 'Y3.B10.S8': OK, 'Y3.B10.S9': OK, 'Y3.B10.S10': OK, 'Y3.B10.S11': OK, 'Y3.B10.S12': OK,
  // ================= Y3 B11 shape =================
  'Y3.B11.S1': OK, 'Y3.B11.S2': OK, 'Y3.B11.S3': OK, 'Y3.B11.S4': OK, 'Y3.B11.S5': OK, 'Y3.B11.S6': OK, 'Y3.B11.S7': OK, 'Y3.B11.S8': OK, 'Y3.B11.S10': OK,
  'Y3.B11.S9': OK,
  // ================= Y3 B12 statistics =================
  'Y3.B12.S1': OK, 'Y3.B12.S2': OK, 'Y3.B12.S3': OK, 'Y3.B12.S4': OK, 'Y3.B12.S5': OK, 'Y3.B12.S6': OK,
};
export const extendSteps = {
  tens_any: ['Y2.B2.S14', 'Y3.B2.S3'],
  mm_cm_m: ['Y3.B5.S5', 'Y3.B5.S6'],
  add_next_10: ['Y2.B2.S9'],
};
export const retireBuilt = [
  { id: 'count_50s', by: 'multiplication:count_by_tables {rows:[{step:50,start:"zero"}]} closes Y3.B1.S14; still open for Y3.B1.S4 (100s run past 1,000) and Y4', steps: ['Y3.B1.S14'] },
  { id: 'count_3s', by: 'multiplication:count_by_tables {rows:[{step:3,start:"zero"}]}', steps: ['Y2.B1.S16'] },
  { id: 'shape_faces', by: 'shapes_early:count_edges_faces_vertices {forms:[0]} / [1] / [2]', steps: ['Y2.B3.S8', 'Y2.B3.S9', 'Y2.B3.S10'] },
  { id: 'money_uk', by: 'measurement:money_count {kind:"note"|"both", currency:"usd"} (Y2.B4.S2, S3); still open for Y2.B4.S8 "make $1"', steps: ['Y2.B4.S2', 'Y2.B4.S3'] },
];
export const proposals = {

  more_less_1_3digit: { kind: 'option', skill: 'placevalue:more_less_100', option: 'step 1 (1 more / 1 less), step "ones" (add or subtract 1-9 without crossing a ten) and a "1, 10 or 100" mix, all within 1,000', name: 'Find 1, 10 or 100 More or Less; Add and Subtract Ones (option)',
    teaches: 'finding 1, 10 or 100 more or less than a 3-digit number, including across a ten or hundred (399 + 1, 305 − 10), and adding or subtracting ones to a 3-digit number where only the ones digit changes (234 + 5, 238 − 6)',
    representation: 'the existing frame cell "1 more than 489 is ____" with the place-value chart support; answer box', family: 'place value',
    steps: ['Y3.B1.S9', 'Y3.B2.S2'], ccss: ['2.NBT.B.8', '2.NBT.B.5'], why: 'more_less_100 has steps 10, 100, 1,000 only; more_less_10 stops at 120; no skill adds ones to a 3-digit number (one_digit_addend is 2-digit only)' },
  hundreds_any: { kind: 'option', skill: 'addition:add_sub_100s', option: 'task: any multiple of 100 to or from a 3-digit number (234 + 200, 650 − 300)', name: 'Add and Subtract Hundreds (option)',
    teaches: 'adding and subtracting multiples of 100 to and from 3-digit numbers, seeing only the hundreds digit change',
    representation: 'equation cell with place-value counters (hundreds, tens, ones) drawn beside it as the structural support; answer box', family: 'operations',
    steps: ['Y3.B2.S4'], ccss: ['2.NBT.B.7', '2.NBT.B.8'], why: 'add_sub_100s deals only a hundred ± 100 (900 − 100); tens_any is the tens version' },
  exchange_count: { kind: 'option', skill: 'addition:add_1k_regroup', skills: ['addition:add_1k_regroup', 'subtraction:sub_1k_regroup', 'subtraction:sub_across_zeros', 'multiplication:multiply', 'multiplication:area_model_mult', 'division:box_division_easy'], option: 'exchanges: none / one in the ones / one in the tens / two or more (owner ruling 2026-10-10: on every regroup band, + − × and short ÷)', name: 'Number and Place of Exchanges (option)',
    teaches: 'column addition, subtraction and short multiplication with exactly one exchange (across a 10, or across a 100) before two or more, so each WRM step adds one new thing',
    representation: 'the existing column cell with its regroup boxes; the generator only picks operands with the chosen exchanges', family: 'operations',
    steps: ['Y3.B2.S13', 'Y3.B2.S14', 'Y3.B2.S15', 'Y3.B2.S16', 'Y3.B4.S4', 'Y3.B4.S5', 'Y3.B4.S7'], ccss: ['2.NBT.B.7', '3.NBT.A.2', '4.NBT.B.5', '3.OA.C.7'], why: 'the regroup bands mix exchange places and counts; WRM splits "across a 10" from "across a 100", and Y3.B4.S4 needs no exchange' },
  two_and_three_digit: { kind: 'option', skill: 'addition:add_1k_mixed', option: 'digits: 2-digit and 3-digit operands (also on subtraction:sub_1k_mixed)', name: 'Add or Subtract a 2-Digit and a 3-Digit Number (option)',
    teaches: 'adding a 2-digit number to a 3-digit number and subtracting a 2-digit number from a 3-digit number in columns, lining up the places',
    representation: 'the column cell with the empty hundreds place of the 2-digit number shown, place headings H T O; answer boxes', family: 'operations',
    steps: ['Y3.B2.S17', 'Y3.B2.S18'], ccss: ['2.NBT.B.7'], why: 'the 1k bands deal mostly 3-digit with 3-digit; lining up a shorter number is the step' },
  compare_kind: { kind: 'option', skill: 'fractions:compare', option: 'kind: unit fractions / same denominator / same numerator (also on order_fractions)', name: 'Compare Unit or Same-Denominator Fractions (option)',
    teaches: 'comparing and ordering unit fractions (1/3 > 1/5: more parts, smaller part) and fractions with the same denominator (2/5 < 4/5)',
    representation: 'two bar models of the same whole length, one under the other, with the sign box between; ordering cell with 3 fractions', family: 'fractions',
    steps: ['Y3.B6.S2', 'Y3.B6.S5'], ccss: ['3.NF.A.3d'], why: 'compare mixes every kind of pair; WRM teaches unit fractions, then same denominators, as separate steps' },
  metric_mass_capacity: { kind: 'option', skill: 'measurement:capacity', option: 'metric whole and mixed units without decimals: kg ↔ g and l ↔ ml (2 kg = 2,000 g; 1 l 500 ml = 1,500 ml)', name: 'Equivalent Masses and Capacities (option)',
    teaches: 'converting kilograms and grams, litres and millilitres, using 1 kg = 1,000 g and 1 l = 1,000 ml and number bonds to 1,000',
    representation: 'conversion cell "1 kg 250 g = ____ g" with a part-whole bar (1,000 + 250); answer box', family: 'measurement',
    steps: ['Y3.B7.S4', 'Y3.B7.S9'], ccss: ['3.MD.A.2', '4.MD.A.1'], why: 'unit_conversions is customary only (ounces, pounds); capacity converts L/mL with decimals (1.5 L) and has no mass' },
  compare_measures: { kind: 'new', skill: 'measurement:compare_measures', name: 'Compare Measures', options: 'measure: length / mass / capacity; units: one unit (cm or m, g or kg, ml or l) / mixed units; task: compare two / order three',
    teaches: 'comparing two lengths, masses or capacities with <, > and =, and ordering three: first in one unit (24 cm < 31 cm), then in mixed units (450 g < 1 kg; 1,200 ml > 1 l)',
    representation: 'two measurement labels (or two drawn bars or scales) with a sign box between; the ordering cell has three labels and three answer boxes', family: 'measurement',
    steps: ['Y2.B6.S3', 'Y2.B6.S4', 'Y3.B7.S5', 'Y3.B7.S10'], ccss: ['1.MD.A.1', '2.MD.A.4', '3.MD.A.2'], why: 'compare_lengths (Y3) is mixed units only; heavier_lighter_visual, compare_objects and order_objects_length compare pictures without units; no skill compares measures given as numbers with units' },
  within_whole: { kind: 'option', skill: 'fraction_operations:add_fractions_like', skills: ['fraction_operations:add_fractions_like', 'fraction_operations:sub_fractions_like', 'fraction_operations:sub_frac_like_nv'], option: 'within one whole: sums at most 1, differences from a fraction at most 1, no compare-to-1/2 sort items, no simplifying', name: 'Add and Subtract Fractions Within a Whole (option)',
    teaches: 'adding and subtracting fractions with the same denominator within one whole (2/5 + 1/5 = 3/5; 4/5 − 1/5 = 3/5), the answer over the same denominator',
    representation: 'the existing bar-model add cell; answer: numerator over the given denominator', family: 'fractions',
    steps: ['Y3.B8.S1', 'Y3.B8.S2'], ccss: ['3.NF.A.1', '4.NF.B.3'], why: 'the add skill deals sums past 1 (4/5 + 2/5 = 1 1/5), which is Y4; both subtract skills mix in compare-to-1/2 sort items and "simplify"' },
  one_digit_addend: { kind: 'option', skill: 'addition:add_100_mixed', option: 'second number 1-digit (also on subtraction:sub_100_mixed): across a ten / not across', name: 'Add or Subtract Ones to a 2-Digit Number (option)',
    teaches: 'adding and subtracting a 1-digit number to or from a 2-digit number, first without and then across a ten (34 + 3, 34 − 3; 38 + 5, 42 − 5)',
    representation: 'one boxed cell per item: the across sentence with a base-10 picture (tens rods, ones cubes) under it as the structural support; answer box', family: 'operations',
    steps: ['Y2.B2.S5', 'Y2.B2.S12', 'Y3.B2.S2'], ccss: ['1.NBT.C.4', '1.OA.C.6', '2.NBT.B.5'], why: 'the bands mix 1-digit + 1-digit and 2-digit + 2-digit; no option isolates 2-digit ± ones' },
  make_amount_notes: { kind: 'option', skill: 'measurement:equiv_coin_sets', option: 'task "make": choose bills and coins to make a given amount, any way (drawn bills $1/$5/$10/$20 and coins)', name: 'Make an Amount With Bills and Coins (option)',
    teaches: 'choosing bills and coins to make an amount ($35 = $20 + $10 + $5) and finding more than one way',
    representation: 'the amount in a box; a bank of drawn bills and coins to ring or tally; answer: tally boxes under each value', family: 'measurement',
    steps: ['Y2.B4.S4'], ccss: ['2.MD.C.8'], why: 'make_change_least_coins uses coins only and asks for the fewest coins; no skill deals bills to make an amount' },
  money_difference: { kind: 'option', skill: 'measurement:money', option: 'op "difference": subtract two prices / find how much more', name: 'Difference Between Two Amounts (option)',
    teaches: 'finding the difference between two amounts of money (a $7 toy and a $15 toy: $8 more), by counting on or subtracting',
    representation: 'two price tags in one cell, the sentence "___ − ___ = ___" with a bar model support; answer box with the $ sign printed', family: 'measurement',
    steps: ['Y2.B4.S7', 'Y3.B9.S4'], ccss: ['2.MD.C.8'], why: 'measurement:money only adds prices; money_change finds change from a whole amount, not a difference' },
  time_past_to: { kind: 'option', skill: 'measurement:time_5min', option: 'say: "past" only / "to" only — a clock is shown and the pupil completes "___ minutes past ___" or "___ minutes to ___"', name: 'Minutes Past and To the Hour (option)',
    teaches: 'reading the minute hand on a clock and saying the time as minutes past the hour (20 past 3), then as minutes to the next hour (10 to 4)',
    representation: 'the B&W clock in its cell with the frame "___ minutes past ___" (two answer boxes); the "to" page shades nothing and keeps the same frame',
    family: 'measurement', steps: ['Y2.B9.S3', 'Y2.B9.S4'], ccss: ['2.MD.C.7'], why: 'time_5min reads the clock as digital (6:05); its words stimulus mixes past and to and goes words → digits' },
  fos_kind: { kind: 'option', skill: 'fractions:fraction_of_set', option: 'kind: unit fractions only / non-unit fractions only (and denoms honoured in every item type)', name: 'Unit or Non-Unit Fractions of a Set (option)',
    teaches: 'finding a unit fraction of a set (1/3 of 12: share into 3, count one group), then a non-unit fraction (2/3 of 12: count two groups)',
    closes: 'Y3.B8.S4 unit fractions of a set; Y3.B8.S5 non-unit fractions of a set',
    representation: 'the pictured set ringed into equal groups, the sentence "2/3 of 12 = ___"; answer box', family: 'fractions',
    steps: ['Y3.B8.S4', 'Y3.B8.S5'], ccss: ['3.NF.A.1'], why: 'fraction_of_set mixes unit and non-unit items and ignores denoms in its missing-numerator items' },
  sub_from_ten: { kind: 'option', skill: 'subtraction:sub_100_mixed', option: 'first number a multiple of 10, second number 1-digit (40 − 3, 70 − 6)', name: 'Subtract Ones From a Multiple of 10 (option)',
    teaches: 'subtracting a 1-digit number from a multiple of 10 by exchanging one ten for ten ones (40 − 3 = 37)',
    representation: 'one boxed cell: the sentence "40 − 3 = ___" with 4 tens rods drawn, one rod shown as 10 ones to cross out; answer box', family: 'operations',
    steps: ['Y2.B2.S11'], ccss: ['1.NBT.C.6', '2.NBT.B.5'], why: 'no band isolates a multiple of 10 minus ones; add_next_10 adds to the next 10 and one_digit_addend subtracts from any 2-digit number' },
  order_pictures: { kind: 'option', skill: 'placevalue:order_least_to_greatest', skills: ['placevalue:order_least_to_greatest', 'placevalue:order_greatest_to_least'], option: 'show: numerals / base-10 pictures (tens rods and ones) / objects in groups of ten', name: 'Order Numbers Shown as Pictures (option)',
    teaches: 'ordering three numbers to 100 shown as base-10 pictures or groups of objects, by comparing tens first and then ones',
    representation: 'three boxed pictures of tens rods and ones cubes, labelled A, B, C; answer: the letters (or the numbers) written in order in three boxes', family: 'place value',
    steps: ['Y2.B1.S14'], ccss: ['1.NBT.B.3'], why: 'the order skills show numerals only; WRM Y2 orders objects and numbers' },
  single_fraction: { kind: 'option', skill: 'fractions:shade_fraction', option: 'fraction: one chosen fraction (1/2, 1/4, 3/4, 1/3, 2/4) instead of a denominator family; also on identify, write_fraction, equiv_frac_visual, fraction_of_set', name: 'One Fraction per Page (option)',
    teaches: 'a page about ONE fraction (find a quarter, find a third, three-quarters) of a shape and of an amount, as WRM Y2 teaches them one at a time',
    representation: 'the existing fraction cells (area, bar, circle, set of objects) with the one fraction; answer: shade or write the number', family: 'fractions',
    steps: ['Y2.B8.S6', 'Y2.B8.S8', 'Y2.B8.S10', 'Y2.B8.S11', 'Y2.B8.S12', 'Y2.B8.S13', 'Y2.B8.S14'], ccss: ['1.G.A.3', '2.G.A.3'], why: '`denoms` picks a family (halves → quarters, eighths); WRM Y2 needs one fraction per step' },
};
export const extraPre = {
  'Y3.B7.S2': [R('measurement:mass_volume_liquid', 'Y2.B7.S2 reading a mass in grams on a simple scale (the same skill, Y2 opts forms [1])'), R('multiplication:count_by_tables', 'counting in 10s, 50s and 100s from 0 to read the scale marks')],
  'Y3.B7.S3': [R('measurement:heavier_lighter_visual', 'Y2.B7.S1 heavier and lighter'), R('multiplication:count_by_tables', 'counting in 100s to read a kg scale marked in 100 g')],
  'Y3.B7.S7': [R('measurement:capacity', 'capacity language and units (Y2.B7.S5 compare capacity)')],
  'Y3.B7.S8': [R('measurement:mass_volume_liquid', 'Y3.B7.S7 reading millilitres (partial skill of this step too)'), R('number_sense:place_on_number_line', 'reading a scale')],
  'Y3.B3.S12': [R('division:div_facts', 'the 4 times-table and dividing by 4 (Y3.B3.S9-S11): mult_facts {constant:[4]} doubled gives the 8s')],
  'Y3.B3.S14': [R('patterns:double', 'Y3.B3.S11 the 4 times-table doubled (practise mult_facts {constant:[4]} first)')],
  'Y2.B7.S6': [R('number_sense:place_on_number_line', 'reading a scale is reading a number line in steps'), R('multiplication:count_by_tables', 'counting in 2s, 5s and 10s from 0 to read the scale marks')],
  'Y2.B7.S7': [R('measurement:mass_volume_liquid', 'Y2.B7.S6 reading millilitres on a jug (a partial skill of this step too)'), R('number_sense:place_on_number_line', 'reading a scale is reading a number line')],
  'Y2.B7.S9': [R('number_sense:place_on_number_line', 'a thermometer is a vertical number line'), R('multiplication:count_by_tables', 'counting in 2s, 5s and 10s from 0 to read the marks')],
  'Y2.B9.S1': [R('measurement:clock_parts', 'the parts of a clock face: hour hand and minute hand')],
};
export const extraRelated = {
  'Y3.B5.S3': [R('measurement:estimate_length', 'choosing mm or cm for an object')],
  'Y3.B5.S12': [R('addition:add_three', 'adding three or four side lengths is adding three numbers')],
  'Y3.B7.S10': [R('measurement:heavier_lighter_visual', 'comparing masses, the same compare idea'), R('placevalue:compare', 'comparing the numbers once the units match')],
  'Y3.B7.S7': [R('number_sense:place_on_number_line', 'a measuring jug scale is a vertical number line')],
  'Y3.B1.S1': [R('placevalue:place_value_disks', 'the same number shown with place-value counters'), R('placevalue:expand', 'the same number written as tens + ones')],
  'Y3.B1.S5': [R('placevalue:expand', 'the number written as hundreds + tens + ones'), R('number_sense:place_on_number_line', 'the same number placed on a line')],
  'Y3.B1.S6': [R('placevalue:combine', 'the inverse: recombine the parts'), R('placevalue:place_value_disks', 'the parts shown as counters')],
  'Y3.B1.S13': [R('placevalue:compare', 'comparing two numbers, the step inside ordering')],
  'Y3.B2.S5': [R('placevalue:more_less_100', 'which digit changes when adding 10 or 100')],
  'Y3.B2.S7': [R('placevalue:more_less_100', '10 more across a hundred (298 + 10)'), R('addition:add_1k_regroup', 'the written method for crossing a hundred')],
  'Y3.B2.S21': [R('subtraction:missing_add_sub', 'finding a missing number with the inverse'), R('addition:add_sub_fact_family', 'fact families show the inverse')],
  'Y3.B3.S5': [R('multiplication:arrays_groups', 'equal groups written as a multiplication: the inverse')],
  'Y3.B3.S8': [R('division:div_facts', 'the inverse: dividing by 3')],
  'Y3.B3.S10': [R('multiplication:count_by_tables', 'counting in 4s from 0 finds the multiples used')],
  'Y3.B3.S11': [R('division:div_facts', 'the inverse: dividing by 4')],
  'Y3.B3.S12': [R('patterns:double', 'double the 4 times-table to get the 8 times-table')],
  'Y3.B3.S13': [R('multiplication:count_by_tables', 'counting in 8s from 0')],
  'Y3.B3.S14': [R('division:div_facts', 'the inverse: dividing by 8')],
  'Y3.B3.S15': [R('patterns:double', 'doubling links the 2, 4 and 8 tables')],
  'Y3.B5.S1': [R('measurement:estimate_length', 'choosing m or cm for an object')],
  'Y3.B5.S2': [R('measurement:length_metric', 'mm and cm as units of the same length (10 mm = 1 cm)')],
  'Y3.B5.S4': [R('measurement:estimate_length', 'choosing a sensible unit')],
  'Y3.B5.S5': [R('measurement:estimate_length', 'choosing m or cm'), R('placevalue:unit_form', 'the same exchange as 1 hundred = 10 tens (1 m = 100 cm)')],
  'Y3.B5.S6': [R('measurement:reading_ruler', 'measuring on a ruler marked in cm and mm')],
  'Y3.B5.S7': [R('placevalue:compare', 'comparing the numbers once the units match')],
  'Y3.B6.S8': [R('composing:fraction_number_line', 'reading a fraction at a point on the line')],
  'Y3.B6.S10': [R('fractions:equiv_frac_nv', 'equivalent fractions without a picture (the next idea)')],
  'Y3.B7.S1': [R('number_sense:place_on_number_line', 'a scale is a number line with intervals')],
  'Y3.B7.S2': [R('number_sense:place_on_number_line', 'a scale is a number line')],
  'Y3.B7.S3': [R('number_sense:place_on_number_line', 'a scale is a number line')],
  'Y3.B7.S4': [R('placevalue:unit_form', '1 kg = 1,000 g is the same exchange as 1 thousand = 10 hundreds')],
  'Y3.B7.S5': [R('placevalue:compare', 'comparing the numbers once the units match')],
  'Y3.B7.S6': [R('addition:add_1k_mixed', 'the column addition used with masses'), R('subtraction:sub_1k_mixed', 'the column subtraction used with masses')],
  'Y3.B7.S9': [R('placevalue:unit_form', '1 l = 1,000 ml, the same exchange as 1 thousand')],
  'Y3.B8.S6': [R('fractions:fraction_of_set_nv', 'fractions of amounts without pictures')],
  'Y3.B9.S1': [R('measurement:coin_value', 'the value of each coin'), R('placevalue:expand', 'dollars and cents as two parts of one amount')],
  'Y3.B9.S2': [R('placevalue:unit_form', '345 cents = 3 dollars 45 cents is the same exchange as 3 hundreds 45 ones')],
  'Y3.B9.S3': [R('addition:add_1k_mixed', 'the column addition behind adding amounts')],
  'Y3.B9.S4': [R('subtraction:sub_1k_mixed', 'the column subtraction behind a difference')],
  'Y3.B9.S5': [R('subtraction:sub_wp_100', 'take-away stories: change is a subtraction')],
  'Y3.B10.S8': [R('measurement:time_analog_digital', 'reading the start and end times')],
  'Y3.B10.S9': [R('measurement:time_analog_digital', 'reading the start and end times')],
  'Y3.B10.S10': [R('measurement:time_1min', 'minutes on the clock, the next unit up')],
  'Y3.B10.S12': [R('measurement:elapsed_mixed', 'finding an end time from a duration')],
  'Y3.B11.S9': [R('shapes_early:shape_name_match_3d', 'matching 3-D shapes and their names')],
  'Y3.B11.S10': [R('shapes_early:name_3d_shapes', 'naming the shape made'), R('area_perimeter:net_surface_area', 'nets of 3-D shapes in later years')],
  'Y3.B12.S4': [R('graphs:bar_graph', 'reading the bar chart drawn')],
  'Y3.B12.S5': [R('graphs:bar_graph', 'reading a chart of the data collected')],
  'Y3.B12.S6': [R('graphs:bar_graph', 'the same data as a chart')],
  'Y2.B1.S9': [R('multiplication:count_by_tables', 'counting in 10s from 0, the count the line is marked in')],
  'Y2.B1.S11': [R('measurement:estimate_length', 'estimating a length, the same judging-by-eye'), R('placevalue:compare', 'deciding which number is nearer, the same reasoning as an estimate')],
  'Y2.B2.S1': [R('subtraction:sub_facts', 'the inverse: 10 − 3 = 7 from 3 + 7 = 10')],
  'Y2.B3.S8': [R('shapes_early:shape_attributes', 'describing shapes by their properties'), R('shapes_early:shape_name_match_3d', 'matching 3-D shapes to names by their faces'), R('shapes_early:name_3d_shapes', 'naming the shape whose faces are counted')],
  'Y2.B3.S9': [R('shapes_early:shape_attributes', 'describing shapes by their properties'), R('shapes_early:shape_name_match_3d', 'matching 3-D shapes to names by their properties'), R('shapes_early:name_3d_shapes', 'naming the shape whose edges are counted')],
  'Y2.B4.S1': [R('measurement:money_compare', 'comparing two amounts of coins, the next use of a total')],
  'Y2.B4.S9': [R('subtraction:sub_wp_100', 'take-away stories: change is a subtraction')],
  'Y2.B5.S1': [R('multiplication:mult_word_problems', 'equal groups in stories'), R('division:share_into_groups', 'making equal groups from a total, the inverse view'), R('multiplication:arrays_groups', 'equal groups written as "groups of" sentences, the next idea')],
  'Y2.B5.S2': [R('multiplication:mult_word_problems', 'equal groups in stories'), R('multiplication:dot_array_mult', 'equal groups set out in rows as an array'), R('multiplication:repeated_add_to_mult', 'adding the equal groups made')],
  'Y2.B5.S3': [R('multiplication:mult_facts', 'the multiplication fact the repeated addition becomes')],
  'Y2.B5.S4': [R('multiplication:mult_facts', 'the × facts the symbol is used for'), R('multiplication:arrays_groups', 'the × sentence read from a picture of groups')],
  'Y2.B5.S5': [R('multiplication:mult_word_problems', 'multiplication sentences in stories'), R('multiplication:dot_array_mult', 'the same sentence read from an array')],
  'Y2.B5.S6': [R('multiplication:mult_facts', 'the facts an array shows'), R('multiplication:repeated_add_to_mult', 'an array row by row is a repeated addition')],
  'Y2.B5.S15': [R('measurement:time_fives_ring', 'counting in 5s round a clock face'), R('division:div_facts', 'the inverse: dividing by 5 (Y2.B5.S16)')],
  'Y2.B5.S17': [R('measurement:money_count', 'counting 5-cent and 10-cent coins'), R('division:div_facts', 'the inverse: dividing by 5 and 10')],
  'Y2.B8.S15': [R('multiplication:count_by_tables', 'counting in equal steps from 0, the same count with whole numbers')],
  'Y2.B9.S3': [R('measurement:time_analog_digital', 'the same time written as digits')],
  'Y2.B9.S5': [R('measurement:time_analog_digital', 'matching a clock to its digital time')],
  'Y2.B9.S6': [R('measurement:elapsed_hour', 'durations in hours, where minutes-in-an-hour is used')],
  'Y2.B9.S7': [R('measurement:time_sense', 'which unit of time an activity takes')],
  'Y2.B10.S1': [R('graphs:pictograph', 'the same data shown as a pictogram')],
  'Y2.B10.S7': [R('graphs:bar_graph', 'the same questions read from a bar chart')],
  'Y2.B11.S5': [R('patterns:shape_pattern', 'repeating shape patterns without turns')],
  'Y2.B1.S1': [R('placevalue:expand', 'a teen number written as 10 + 5, the same idea in symbols')],
  'Y2.B1.S5': [R('placevalue:combine', 'the inverse: put the parts back together (50 + 7 = 57)')],
  'Y2.B6.S4': [R('measurement:estimate_length', 'estimating lengths before ordering them')],
  'Y2.B7.S2': [R('number_sense:place_on_number_line', 'a scale is a number line: find the value at the pointer')],
  'Y2.B7.S3': [R('number_sense:place_on_number_line', 'a scale is a number line: find the value at the pointer')],
  'Y2.B7.S6': [R('measurement:capacity', 'capacity units and comparing containers')],
  'Y2.B7.S7': [R('measurement:capacity', 'capacity units: litres and smaller units')],
  'Y2.B7.S9': [R('comparing:compare_objects', 'warmer and colder as comparison language, like longer and shorter')],
  'Y2.B8.S1': [R('fractions:identify', 'naming a part of a whole as a fraction, where parts and wholes lead')],
  'Y2.B8.S3': [R('fractions:identify', 'name the fraction shaded: 1/2 among others')],
  'Y2.B8.S4': [R('patterns:double', 'doubling is the inverse of halving')],
  'Y2.B8.S5': [R('fractions:identify', 'name the fraction shaded, quarters among others')],
  'Y2.B8.S6': [R('fractions:identify', 'name the fraction shaded: 1/4 among others')],
  'Y2.B8.S7': [R('fractions:identify', 'name the fraction shaded, thirds among others')],
  'Y2.B11.S1': [R('coordinates:coordinate_q1', 'describing position on a grid, where this language leads')],
  'Y2.B11.S2': [R('coordinates:geo_translate', 'movement on a grid as a translation (later years)')],
  'Y2.B11.S3': [R('coordinates:geo_rotate', 'turns of a shape as a rotation (later years)')],
  'Y2.B11.S4': [R('coordinates:geo_translate', 'movement on a grid as a translation'), R('coordinates:geo_rotate', 'turns as a rotation')],
};
// self-check r2b: hand pre lists where the filtered week list still gave weak ladders (preOnly = no automatic entries)
export const prePatch = {
  'Y2.B4.S1': { preOnly: true, pre: [R('multiplication:count_by_tables', 'Y2.B1.S15 counting in 2s, 5s and 10s from 0: counting 5-cent and 10-cent coins'), R('measurement:coin_value', 'Y1.B13.S2 recognising coins'), R('counting:count_objects', 'counting a set one by one, for 1-cent coins')] },
  'Y2.B4.S5': { preOnly: true, pre: [R('measurement:make_change_least_coins', 'Y2.B4.S4 choosing coins'), R('measurement:money_count', 'Y2.B4.S1 counting coins'), R('measurement:coin_value', 'Y1.B13.S2 coin values'), R('addition:add_three', 'adding three small numbers (three coins)')] },
  'Y3.B2.S17': { preOnly: true, pre: [R('addition:add_1k_regroup', 'Y3.B2.S13 adding two 3-digit numbers in columns'), R('addition:add_100_regroup', 'Y2.B2.S16 adding two 2-digit numbers across a 10'), R('placevalue:identify', 'Y2.B1.S4 the place of each digit (lining up the columns)'), R('placevalue:value', 'the value of each digit')] },
  'Y3.B2.S19': { preOnly: true, pre: [R('composing:make_ten', 'Y2.B2.S1 bonds to 10: 3 + 7 gives 30 + 70'), R('addition:add_sub_10s', 'Y2.B2.S14 adding and subtracting 10s'), R('placevalue:more_less_10', 'Y2.B2.S13 10 more, 10 less'), R('addition:cloze_addition', 'Y2.B2.S21 missing-number additions')] },
  'Y3.B11.S3': { preOnly: true, pre: [R('angles_lines:identify_angles', 'Y3.B11.S2 right angles: the angle every other is compared with'), R('shapes_early:shape_corners_count', 'Y2.B3.S3 corners (vertices) of 2-D shapes'), R('shapes_early:shape_positions', 'Y2.B11 position and turn language')], preBuild: ['turns'],
    related: [R('angles_lines:angle_types', 'naming acute, right and obtuse angles (the next idea)')] },
  'Y3.B11.S4': { preOnly: true, pre: [R('measurement:estimate_length', 'Y2.B6 choosing and estimating lengths in cm'), R('angles_lines:identify_angles', 'Y3.B11.S2 right angles for drawing a rectangle'), R('shapes_early:count_sides_vertices_2d', 'Y2.B3.S2 sides of 2-D shapes')] },
};

// ======================= round 3 (critic Y2-Y3 r2: S6 pre/related swap, S7 thin measure pre, S8 step fixes) =======================
// r3 entries are merged OVER steps + prePatch. `core` = the main building block (pre tier 1, never pushed out by the cap);
// `dropPre` removes an automatic pre entry that is not a building block.
const C = (key, why, opts) => ({ key, why, ...(opts ? { opts } : {}) });
const CBT = 'multiplication:count_by_tables';
export const r3 = {
  // S6: the main building block first
  'Y2.B2.S6': { core: [C('composing:make_ten', 'Y2.B2.S1 bonds to 10: making 10 is the first jump (8 + 5 = 8 + 2 + 3)'), C('composing:number_bonds', 'Y1 bonds within 10: splitting the second number')] },
  'Y2.B5.S13': { core: [C('patterns:seq_10', 'Y2.B1.S15 counting in 10s: the 10 times-table is the count of 10s')] },
  'Y2.B3.S8': { core: [C('shapes_early:name_3d_shapes', 'Y1.B3.S1 / Y2.B3.S1 naming 3-D shapes (xlsx prior learning: recognise and name 3-D shapes)'), C('shapes_early:shape_name_match_3d', 'Y1.B3.S1 / Y2.B3.S1 matching a 3-D shape to its name')] },
  'Y2.B3.S9': { core: [C('shapes_early:name_3d_shapes', 'Y1.B3.S1 / Y2.B3.S1 naming 3-D shapes'), C('shapes_early:shape_name_match_3d', 'Y1.B3.S1 / Y2.B3.S1 matching a 3-D shape to its name')] },
  'Y2.B3.S10': { core: [C('shapes_early:name_3d_shapes', 'Y1.B3.S1 / Y2.B3.S1 naming 3-D shapes')] },
  'Y2.B10.S3': { partials: [P('measurement:bar_graph_intro', 'reads a 1-to-1 bar chart (how many, how many more); drawing a block diagram, and blocks stacked as squares (one square = one) rather than bars, are not dealt')],
    build: ['block_diagram'], core: [C('graphs:tally_chart', 'Y2.B10.S1 tally charts: the counts a block diagram shows'), C('measurement:pictograph_intro', 'Y2.B10.S5 one picture = one: the same 1-to-1 idea')] },
  'Y3.B4.S4': { core: [C('placevalue:expand', 'Y2.B1.S8 / Y3.B1.S6 partitioning into tens and ones: 23 × 3 = 20 × 3 + 3 × 3'), C('multiplication:mult_zeros', 'Y3.B4.S1 multiples of 10: 20 × 3')] },
  'Y3.B4.S5': { core: [C('placevalue:expand', 'Y2 "Partition numbers to 100" (xlsx prior learning): 24 × 4 = 20 × 4 + 4 × 4'), C('multiplication:mult_zeros', 'Y3.B4.S1 multiples of 10: 20 × 4')] },
  'Y3.B4.S10': { dropPre: ['division:div_remainders'] },
  'Y3.B12.S5': { core: [C('graphs:tally_chart', 'Y2.B10.S1 tally charts: collecting the data')] },
  'Y3.B12.S6': { core: [C('graphs:tally_chart', 'Y2.B10.S1 tally charts and Y2.B10.S2 tables: a table of counts')] },
  'Y2.B4.S2': { dropPre: ['composing:make_ten', 'addition:add_5_pictures'], core: [C(CBT, 'Y2.B1.S15 counting in 5s and 10s from 0: counting $5 and $10 bills'), C('measurement:money_count', 'Y2.B4.S1 counting coins (kind "like")')] },
  'Y2.B4.S3': { dropPre: ['composing:make_ten', 'addition:add_5_pictures'], core: [C(CBT, 'Y2.B1.S15 counting in 5s and 10s from 0: counting bills and coins'), C('measurement:money_count', 'Y2.B4.S2 counting bills')] },
  'Y2.B4.S4': { core: [C(CBT, 'Y2.B1.S15 counting in 5s and 10s: making an amount from $5 and $10 bills'), C('measurement:money_count', 'Y2.B4.S3 counting bills and coins')] },
  // S8: options that change what is dealt (generated: $5/$10/$20 paid, change $1-$8; Y3 $1/$5 paid, change in dollars and cents)
  'Y2.B4.S9': { direct: [D('measurement:money_change', { currency: 'usd', step: 100, paid: 'note', band: 2000 })],
    core: [C('subtraction:sub_wp_100', 'Y2.B2.S19 take-away stories: change is a subtraction'), C('measurement:money', 'Y2.B4.S7 adding prices')] },
  'Y3.B9.S5': { direct: [D('measurement:money_change', { currency: 'usd', step: 5, paid: 'note' })],
    core: [C('subtraction:sub_1k_mixed', 'Y3.B2.S18 subtracting in columns: change is a subtraction'), C('measurement:money', 'Y3.B9.S3 adding money')] },
  'Y3.B9.S4': { core: [C('subtraction:sub_1k_mixed', 'Y3.B2.S18 subtracting in columns: the calculation behind a difference')] },
  'Y2.B6.S3': { partials: [P('comparing:compare_objects', 'compares pictured objects; comparing two lengths given in the same unit (cm or m) with <, > and = is not dealt'), P('shapes_early:order_objects_length', 'orders pictured objects; no lengths in cm or m')], build: ['compare_measures'] },
  'Y2.B6.S4': { partials: [P('shapes_early:order_objects_length', 'orders pictured objects; ordering three lengths given in the same unit (cm or m) is not dealt')], build: ['compare_measures'] },
  'Y2.B2.S11': { partials: [], verdict: 'gap', build: ['sub_from_ten'], why: { 'addition:add_next_10': 'the proposed bridge-to-10 skill adds to the next 10; it does not subtract from a multiple of 10' } },
  'Y3.B2.S2': { partials: [], verdict: 'gap', build: ['more_less_1_3digit'], removeWhy: 'add_100_no_regroup deals 2-digit + 2-digit (41 + 30, 20 + 52): it never adds ones to a 3-digit number' },
  'Y3.B11.S3': { partials: [P('angles_lines:identify_angles', 'names one angle at a time as acute, right or obtuse (and also deals straight angles, above the step); comparing two angles, or an angle with a right angle, using a right-angle tester is not dealt', { forms: [0] })], build: ['turns_angles'] },
  'Y3.B9.S2': { partials: [P('measurement:money_notation', 'writes "7 dollars 5 cents" or "75 cents" as $7.05 / $0.75; converting a number of cents to dollars and cents and back (345 cents = $3.45, $2.10 = 210 cents) is not dealt', { currency: 'usd', task: 'words' })], build: ['money_convert'] },
  'Y3.B8.S2': { direct: [], partials: [P('fraction_operations:sub_fractions_like', 'subtracts within a whole with a bar picture, but "differences less than 1/2" sort items are mixed in; a page of subtraction only is not available', { denoms: [2, 3, 5] }),
      P('fraction_operations:sub_frac_like_nv', 'forms [0] is plain subtraction, but the compare-to-1/2 sort items are still mixed in and the families deal eighths and tenths', { denoms: [2, 3, 5], forms: [0] })],
    verdict: 'partial', build: ['within_whole'] },
  'Y2.B8.S4': { partials: [], why: { 'fractions:shade_fraction': 'denoms [2] is the halves family: it also deals 4/8 and 5/8, not a page of 1/2 (kept as related)', 'fractions:fraction_of_set': 'ignores denoms in its missing-numerator items (generator bug): cannot be narrowed to halves' }, related: [R('fractions:shade_fraction', 'shading 1/2 of a shape (denoms [2]): the same half shown on a shape'), R('composing:compose_whole', 'two halves make a whole')] },
  'Y2.B8.S6': { partials: [P('fractions:shade_fraction', 'the halves family (1/2, 1/4, 3/4, eighths): a page of quarters only is not available, and a quarter of a quantity (1/4 of 12) is not dealt', { denoms: [2] })] },
  'Y2.B8.S8': { partials: [P('fractions:shade_fraction', 'the thirds family also deals sixths and twelfths: a page of 1/3 of a shape only is not available, and a third of a quantity (1/3 of 12) is not dealt', { denoms: [3] })] },
  // related noise named by the critic: hand related only (relOnly), sharing the idea
  'Y3.B11.S5': { preOnly: true, pre: [R('shapes_early:shape_positions', 'Y2.B11.S1 position language: up and down, left and right are the vertical and horizontal directions'), R('angles_lines:identify_angles', 'Y3.B11.S2 right angles: a horizontal and a vertical line meet at a right angle'), R('angles_lines:symmetry', 'Y2.B3.S5 a vertical line of symmetry: the first vertical line pupils name')],
    preBuild: ['movement'], relOnly: true, related: [R('angles_lines:identify_lines', 'naming parallel and perpendicular lines, the next idea (Y3.B11.S6)'), R('coordinates:coordinate_q1', 'grid lines run horizontally and vertically')] },
  'Y2.B1.S14': { direct: [], partials: [P('placevalue:order_least_to_greatest', 'orders numerals only; ordering objects or base-10 pictures of numbers is not dealt', { band: 99 }), P('placevalue:order_greatest_to_least', 'orders numerals only; objects are not ordered', { band: 99 })],
    verdict: 'partial', build: ['order_pictures'], core: [C('placevalue:compare', 'Y2.B1.S13 comparing two numbers: the step inside ordering')],
    relOnly: true, related: [R('shapes_early:order_objects_length', 'ordering objects by length: the same ordering idea with objects')] },
  'Y2.B3.S6': { relOnly: true, related: [R('coordinates:geo_reflect', 'reflecting a shape in a mirror line (later years): the same idea on a coordinate grid')] },
  'Y3.B2.S19': { relOnly: true, related: [R('measurement:money_change', 'change from $1 (100 cents) is a complement to 100'), R('subtraction:missing_add_sub', '37 + ? = 100 is a missing-number addition')] },
  'Y3.B11.S8': { core: [C('measurement:reading_ruler', 'Y3.B11.S4 measuring and drawing lines accurately with a ruler'), C('shapes_early:name_2d_shapes', 'Y3.B11.S7 recognising and naming 2-D shapes')],
    relOnly: true, related: [R('coordinates:coord_polygon', 'drawing a polygon from its vertices on a grid (later years)')] },
  'Y3.B4.S1': { core: [C('patterns:seq_10', 'Y2.B1.S15 counting in 10s: the multiples of 10 are the 10s count'), C('placevalue:unit_form', 'Y3.B1.S8 ten tens = 1 hundred: 12 tens = 120')] },
  'Y2.B4.S1': { core: [C('patterns:seq_5', 'Y1.B9.S3 counting in 5s: counting 5-cent coins'), C('patterns:seq_10', 'Y1.B9.S2 counting in 10s: counting 10-cent coins')] },
  'Y2.B11.S1': { preOnly: true, pre: [R('shapes_early:name_2d_shapes', 'Y1.B3.S3 naming the shapes whose positions are described'), R('shapes_early:name_3d_shapes', 'Y1.B3.S1 naming the objects (cube, ball) placed on, under, next to'), R('counting:count_objects', 'Y1.B1.S2 counting along a row: "the 3rd from the left"'), R('comparing:compare_objects', 'Y1.B7.S1 comparing words (taller, nearer): the same describing language')] },
  'Y2.B1.S16': { core: [C('patterns:seq_2', 'Y1.B9.S1 / Y2.B1.S15 counting in 2s: counting in equal steps'), C('patterns:seq_5', 'Y1.B9.S3 / Y2.B1.S15 counting in 5s'), C('patterns:seq_10', 'Y2.B1.S15 counting in 10s')], dropPre: ['comparing:compare_groups'] },
  'Y2.B2.S13': { core: [C('patterns:seq_10', 'Y2.B1.S15 counting on and back in 10s'), C('composing:base10_build', 'Y2.B1.S3 tens and ones: one more tens rod is 10 more'), C('placevalue:identify', 'Y2.B1.S4 the tens digit is the digit that changes')] },
  // S7: measurement steps keep a real ladder (rule 15)
  'Y3.B7.S7': { core: [C('measurement:mass_volume_liquid', 'Y2.B7.S6 reading millilitres on a jug (the same skill at Y2, forms [0])')] },
};
// rule 16: every gap step's own missing clause (the step, not the proposal's `teaches`)
export const gapMissing = {
  'Y2.B1.S7': 'partitioning a 2-digit number in more than one way (45 = 40 + 5 = 30 + 15 = 20 + 25) with base-10 and part-whole models',
  'Y2.B2.S8': 'adding the ones that take a 2-digit number to the next multiple of 10 (38 + 2 = 40; 64 + ? = 70)',
  'Y2.B2.S11': 'subtracting a 1-digit number from a multiple of 10 (40 − 3 = 37), exchanging one ten for ten ones',
  'Y2.B3.S4': 'drawing a named 2-D shape (square, rectangle, triangle) on dot or square paper, and drawing a shape from a description of its sides',
  'Y2.B3.S6': 'completing the other half of a shape or pattern across a vertical line of symmetry on a square grid',
  'Y2.B3.S11': 'sorting 3-D shapes by one property (flat or curved faces, rolls or stacks, number of faces) and naming the sorting rule',
  'Y2.B4.S10': 'two-step money stories: add two prices, then find the change or the amount left (buy a $3 and a $4 toy with $10)',
  'Y2.B5.S2': 'making equal groups: arranging a given number of objects into equal groups and drawing them (12 as 3 groups of 4)',
  'Y2.B6.S2': 'measuring lengths and heights in whole metres (a metre stick) and choosing cm or m for an object',
  'Y2.B6.S5': 'adding, subtracting, doubling and halving lengths in cm or m in short stories (a 15 cm tower and one 8 cm taller)',
  'Y2.B7.S4': 'adding, subtracting, multiplying and dividing masses in g or kg in short stories (two 5 kg bags; half of 20 kg)',
  'Y2.B7.S5': 'comparing how much two containers hold, with the words full, empty, half full, nearly full and nearly empty',
  'Y2.B7.S8': 'adding, subtracting, multiplying and dividing capacities in ml or l in short stories (two 250 ml cups; 20 l shared between 4)',
  'Y2.B8.S1': 'naming the parts and the whole of an object, shape or quantity in a part-whole picture, before any fraction is named',
  'Y2.B8.S2': 'deciding whether a shape is split into equal or unequal parts',
  'Y2.B8.S9': 'finding the whole from a given part (half of the cubes is 4: how many cubes in the whole?)',
  'Y2.B8.S15': 'counting on and back in halves and quarters up to one whole (1/4, 2/4, 3/4, 1) on a number line',
  'Y2.B9.S6': 'knowing that an hour has 60 minutes and using it (half an hour = 30 minutes; minutes in 2 hours)',
  'Y2.B9.S7': 'knowing that a day has 24 hours and using it to compare durations (more or less than a day)',
  'Y2.B10.S2': 'reading and completing a simple table of counts (made from a tally) and answering how many / how many more',
  'Y2.B11.S2': 'describing movement on a grid by direction and number of squares (2 squares right, 3 squares up)',
  'Y2.B11.S3': 'describing whole, half, quarter and three-quarter turns, clockwise and anticlockwise, of an object or an arrow',
  'Y2.B11.S4': 'describing a route that combines moves on a grid with turns (forward 3, quarter turn clockwise, forward 2)',
  'Y2.B11.S5': 'continuing and completing a pattern in which a shape turns a quarter or a half turn each time',
  'Y3.B1.S7': 'partitioning a 3-digit number in more than one way (245 = 200 + 45 = 100 + 145 = 240 + 5) with base-10 and part-whole models',
  'Y3.B2.S2': 'adding and subtracting ones (1-9) to and from a 3-digit number without crossing a ten (234 + 5, 238 − 6)',
  'Y3.B2.S5': 'using a known fact to add or subtract tens and hundreds (3 + 4 = 7, so 30 + 40 = 70 and 300 + 400 = 700) and saying which digit changes',
  'Y3.B2.S7': 'adding multiples of 10 that cross a hundred (180 + 30 = 210; 375 + 40 = 415)',
  'Y3.B2.S9': 'subtracting multiples of 10 that cross back over a hundred (210 − 40 = 170; 405 − 20 = 385)',
  'Y3.B2.S19': 'finding the number that makes 100 with a multiple of 10 (30 + ? = 100) and then with any 2-digit number (37 + ? = 100)',
  'Y3.B2.S22': 'choosing a mental strategy or the column method for a given calculation and saying why',
  'Y3.B4.S11': 'finding every combination of two sets systematically (3 tops and 4 bottoms) and seeing the count as 3 × 4',
  'Y3.B5.S3': 'measuring a length on a ruler in cm and mm (4 cm 5 mm)',
  'Y3.B5.S7': 'comparing and ordering lengths given in mm, cm and m, including mixed units (1 m 20 cm vs 125 cm)',
  'Y3.B5.S8': 'adding lengths in the same unit and in mixed units (1 m 20 cm + 50 cm)',
  'Y3.B5.S9': 'subtracting lengths and finding how much longer or shorter, in the same and mixed units (1 m − 35 cm)',
  'Y3.B6.S6': 'reading a value on a scale or number line split into halves, quarters, fifths or tenths of a unit',
  'Y3.B6.S8': 'counting on and back in unit fractions along a number line, past one whole (3/4, 4/4, 5/4)',
  'Y3.B7.S4': 'converting kilograms and grams, including mixed units (1 kg 250 g = 1,250 g)',
  'Y3.B7.S6': 'adding and subtracting masses in g and kg, including mixed units (1 kg 200 g + 500 g)',
  'Y3.B7.S10': 'comparing and ordering capacities given in ml and l (1,200 ml > 1 l) with <, > and =',
  'Y3.B7.S11': 'adding and subtracting capacities in ml and l, including mixed units (1 l 300 ml − 500 ml)',
  'Y3.B8.S3': 'finding the fraction that completes one whole (3/5 + ? = 1) with a part-whole or bar model',
  'Y3.B10.S1': 'reading Roman numerals I to XII, as on a clock face',
  'Y3.B10.S6': 'knowing the months of the year and the days in each month and in a year (and a leap year), and converting years, months and days',
  'Y3.B10.S7': 'converting between days and hours (24 hours in a day; 3 days = 72 hours) and comparing durations',
  'Y3.B10.S10': 'knowing that a minute has 60 seconds, converting minutes and seconds, and comparing short durations',
  'Y3.B10.S11': 'choosing a sensible unit of time and comparing durations given in different units',
  'Y3.B11.S1': 'seeing an angle as an amount of turn, and a quarter turn as a right angle',
  'Y3.B11.S5': 'naming horizontal and vertical lines in shapes, pictures and on a grid',
  'Y3.B11.S8': 'drawing polygons from a name or from given side lengths on dot or square paper, with a ruler',
  'Y3.B11.S10': 'making skeleton 3-D shapes (straws and modelling clay) and matching nets or faces to the shape made',
  'Y3.B12.S5': 'collecting data into a tally chart and choosing a table, pictogram or bar chart to show it',
  'Y3.B12.S6': 'reading and completing two-way tables (rows, columns and totals)',
};
// rule 15: the topic ladder, used only while a step has fewer than 3 pre entries (every entry is earlier learning)
export const ladders = {
  length: [C('measurement:reading_ruler', 'Y2.B6.S1 measuring on a ruler'), C('shapes_early:measure_nonstandard', 'Y1.B7.S2 measuring with cubes and paper clips'), C('comparing:compare_objects', 'Y1.B7.S1 comparing lengths and heights'), C('number_sense:place_on_number_line', 'Y2.B1.S9 a ruler is a number line')],
  mass: [C('measurement:heavier_lighter_visual', 'Y1.B8.S3 / Y2.B7.S1 heavier and lighter'), C('number_sense:place_on_number_line', 'Y2.B1.S9 a scale is a number line: find the value at the pointer'), C(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s from 0 to read the scale marks'), C('comparing:compare_objects', 'Y1.B7.S1 the compare language (more, less)')],
  capacity: [C('comparing:compare_objects', 'Y1.B7.S1 the compare language (more, less)'), C('number_sense:place_on_number_line', 'Y2.B1.S9 a jug scale is a vertical number line'), C(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s from 0 to read the jug marks'), C('measurement:heavier_lighter_visual', 'Y2.B7.S1 comparing masses: the same compare idea')],
  temp: [C('number_sense:place_on_number_line', 'Y2.B1.S9 a thermometer is a vertical number line'), C(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s to read the marks'), C('comparing:compare_objects', 'Y1.B7.S1 the compare language (warmer, colder)')],
  time: [C('measurement:clock_parts', 'the parts of a clock face: hour hand and minute hand'), C('shapes_early:partition_shapes', 'Y1.B10.S1 a half of a shape: half past is half way round'), C(CBT, 'Y2.B1.S15 counting in 5s from 0: the minutes on the clock')],
  stats: [C('graphs:tally_chart', 'Y2.B10.S1 tallying a count'), C('counting:count_objects', 'Y1.B1.S2 counting a set'), C('comparing:compare_groups', 'Y1.B1.S12 more, fewer, the same'), C('comparing:classify_count', 'Y1.B1.S1 sorting objects into groups')],
  position: [C('shapes_early:shape_positions', 'Y1.B11.S4 position words (left, right, above, below)'), C('shapes_early:partition_shapes', 'Y1.B10.S5 quarters: a quarter turn is a quarter of a whole turn'), C('shapes_early:name_2d_shapes', 'Y1.B3.S3 naming the shapes that are moved and turned'), C('counting:count_objects', 'Y1.B1.S2 counting the squares moved')],
  shape: [C('shapes_early:name_2d_shapes', 'Y1.B3.S3 naming 2-D shapes'), C('shapes_early:name_3d_shapes', 'Y1.B3.S1 naming 3-D shapes'), C('shapes_early:shape_corners_count', 'Y2.B3.S3 counting corners')],
};
// rule 5/14: related for steps whose old related entries were earlier steps (now pre): the same idea in another form,
// the inverse, or the next idea
export const relR3 = {
  'Y2.B2.S20': [R('algebra:balance_addsub', '7 + 5 = __ + 3: the two sides of a number sentence balance'), R('number_ops_mixed:which_sign', 'choosing the sign that makes a sentence true')],
  'Y2.B2.S21': [R('algebra:balance_addsub', 'a missing number that makes both sides equal'), R('algebra:tape_diagram', 'a bar model shows the missing part')],
  'Y2.B3.S12': [R('patterns:number_pattern', 'a repeating pattern of numbers: the same rule-spotting')],
  'Y2.B4.S9': [R('addition:comparison_word', 'how many more: the difference behind change'), R('algebra:tape_diagram', 'a bar model: the amount paid split into the price and the change')],
  'Y2.B4.S10': [R('algebra:multi_step_word', 'two-step stories in other contexts'), R('measurement:enough_money', 'is there enough money: the check after a two-step total')],
  'Y2.B5.S12': [R('patterns:skip_count_grid', 'counting in 2s on a grid marks the even numbers')],
  'Y2.B5.S17': [R('patterns:skip_count_line', 'the 5s and 10s as jumps on a number line'), R('measurement:time_fives_ring', 'counting in 5s round a clock face'), R('multiplication:mult_word_problems', 'the 5 and 10 times-tables in stories')],
  'Y2.B6.S3': [R('measurement:estimate_length', 'estimating lengths in cm or m before comparing'), R('measurement:heavier_lighter_visual', 'comparing masses (Y2.B7.S1): the same compare language')],
  'Y2.B7.S2': [R('measurement:temperature', 'a thermometer (Y2.B7.S9): another scale read at a pointer')],
  'Y2.B7.S3': [R('measurement:temperature', 'a thermometer (Y2.B7.S9): another scale read at a pointer')],
  'Y2.B7.S9': [R('number_sense:between_tens', 'which two tens a reading lies between')],
  'Y2.B8.S12': [R('fractions:select_equiv_frac', 'circle the fractions equal to 1/2'), R('fractions:equiv_frac_nv', '1/2 = 2/4 without a picture, the next idea')],
  'Y2.B8.S13': [R('composing:compose_whole', 'three quarters and one more quarter make the whole')],
  'Y2.B8.S14': [R('composing:compose_whole', '3/4 and 1/4 make the whole'), R('fractions:fraction_of_set_nv', 'a fraction of an amount without the picture')],
  'Y2.B8.S15': [R('composing:fraction_number_line', 'reading fractions at points on a line'), R('composing:compose_whole', 'counting quarters up to one whole')],
  'Y2.B11.S5': [R('coordinates:geo_rotate', 'turning a shape as a rotation (later years)'), R('patterns:number_pattern', 'continuing a repeating pattern')],
  'Y3.B1.S13': [R('fractions:order_fractions', 'ordering fractions (Y3.B6): the same ordering idea with another kind of number')],
  'Y3.B2.S22': [R('number_sense:estimate_sum', 'estimating first to judge a method and check the answer'), R('number_sense:compensation', 'a mental strategy: 299 + 50 as 300 + 50 − 1'), R('number_sense:doubles_near_doubles', 'another mental strategy: near doubles (25 + 26)')],
  'Y3.B3.S5': [R('division:nl_div', 'grouping as equal jumps back on a number line'), R('division:div_equation_parts', 'the parts of a division sentence')],
  'Y3.B3.S7': [R('division:nl_div', 'dividing by 3 as jumps on a number line'), R('division:missing_mult_div', '3 × ? = 12: division as a missing factor')],
  'Y3.B3.S8': [R('multiplication:nl_mult', 'the 3 times-table as jumps on a number line'), R('multiplication:mult_word_problems', 'the 3 times-table in stories')],
  'Y3.B3.S9': [R('multiplication:nl_mult', 'multiplying by 4 as jumps on a number line'), R('multiplication:mult_word_problems', 'multiplying by 4 in stories')],
  'Y3.B3.S10': [R('division:nl_div', 'dividing by 4 as jumps on a number line'), R('division:missing_mult_div', '4 × ? = 20: division as a missing factor')],
  'Y3.B3.S11': [R('multiplication:nl_mult', 'the 4 times-table as jumps on a number line'), R('multiplication:mult_div_fact_family', '4 × 3 = 12 and 12 ÷ 4 = 3: the fact family')],
  'Y3.B3.S12': [R('multiplication:nl_mult', 'multiplying by 8 as jumps on a number line'), R('multiplication:mult_word_problems', 'multiplying by 8 in stories')],
  'Y3.B3.S13': [R('division:nl_div', 'dividing by 8 as jumps on a number line'), R('division:missing_mult_div', '8 × ? = 32: division as a missing factor')],
  'Y3.B3.S14': [R('multiplication:mult_div_fact_family', '8 × 3 = 24 and 24 ÷ 8 = 3: the fact family'), R('multiplication:nl_mult', 'the 8 times-table as jumps on a number line')],
  'Y3.B3.S15': [R('multiplication:mult_chart_easy', 'the 2, 4 and 8 rows of a times-table chart side by side'), R('multiplication:mult_div_fact_family', 'fact families across the three tables')],
  'Y3.B4.S10': [R('algebra:tape_diagram', 'a bar model: 3 times as long'), R('multiplication:mult_word_problems', 'multiplication in stories')],
  'Y3.B4.S11': [R('multiplication:mult_chart_easy', 'a times-table chart is a table of combinations: rows × columns')],
  'Y3.B5.S2': [R('measurement:estimate_length', 'choosing mm or cm for an object'), R('measurement:reading_ruler_hard', 'a ruler in cm and mm with harder readings')],
  'Y3.B6.S8': [R('fractions:order_frac_numline', 'placing and ordering fractions on a line'), R('fractions:fraction_nl_drag', 'placing a fraction on the line')],
  'Y3.B6.S9': [R('fractions:select_equiv_frac', 'circle the equivalent fractions'), R('fractions:equiv_frac_nv', 'equivalent fractions without a picture, the next idea')],
  'Y3.B7.S1': [R('measurement:temperature', 'a thermometer: the same scale reading'), R('measurement:reading_ruler_hard', 'a ruler: another scale with intervals')],
  'Y3.B7.S2': [R('measurement:temperature', 'a thermometer: the same scale reading')],
  'Y3.B7.S3': [R('measurement:temperature', 'a thermometer: the same scale reading'), R('measurement:length_metric', 'm and cm: mixed units like kg and g')],
  'Y3.B7.S4': [R('measurement:length_metric', 'converting m and cm: the same exchange with 100'), R('measurement:unit_conversions', 'the same conversion with customary units (ounces and pounds)')],
  'Y3.B7.S5': [R('measurement:money_compare', 'comparing two amounts of money: the same <, > and = with units')],
  'Y3.B7.S6': [R('measurement:money', 'adding amounts of money (Y3.B9.S3): the same calculation with units'), R('algebra:tape_diagram', 'a bar model of two masses and their total')],
  'Y3.B7.S7': [R('measurement:temperature', 'a thermometer: the same scale reading')],
  'Y3.B7.S9': [R('measurement:length_metric', 'converting m and cm: the same exchange with 100'), R('measurement:unit_conversions', 'the same conversion with customary units')],
  'Y3.B7.S10': [R('measurement:money_compare', 'comparing two amounts of money: the same <, > and = with units')],
  'Y3.B7.S11': [R('measurement:money', 'adding amounts of money: the same calculation with units'), R('algebra:tape_diagram', 'a bar model of two capacities and their total')],
  'Y3.B8.S6': [R('fractions:fraction_of_set_hard_nv', 'fractions of amounts without pictures, harder'), R('fraction_operations:mult_frac_whole', 'a fraction of an amount as fraction × whole number (Grade 4)')],
  'Y3.B9.S1': [R('measurement:enough_money', 'is there enough money: reading the amount first'), R('measurement:money_compare', 'comparing two amounts')],
  'Y3.B9.S2': [R('measurement:money_compare', 'comparing two amounts once they are in the same form'), R('measurement:unit_conversions', 'converting a bigger unit into smaller ones (feet to inches): the same idea as dollars to cents')],
  'Y3.B9.S3': [R('measurement:enough_money', 'is there enough: the total compared with what you have'), R('algebra:tape_diagram', 'a bar model of two prices and the total')],
  'Y3.B9.S4': [R('measurement:enough_money', 'is there enough: the difference between what you have and a price'), R('addition:comparison_word', 'how many more: a difference')],
  'Y3.B10.S8': [R('measurement:elapsed_visual_easy', 'elapsed time on a time line'), R('measurement:elapsed_visual_medium', 'elapsed time on a time line, harder')],
  'Y3.B10.S9': [R('measurement:elapsed_visual_easy', 'a duration on a time line'), R('measurement:elapsed_visual_medium', 'a duration on a time line, harder')],
  'Y3.B10.S10': [R('measurement:unit_conversions', 'converting a bigger unit into smaller ones (pounds to ounces): the same idea as minutes to seconds')],
  'Y3.B10.S11': [R('measurement:unit_conversions', 'choosing and converting units of length, mass and capacity: the same idea with time')],
  'Y3.B10.S12': [R('measurement:elapsed_visual_medium', 'durations on a time line'), R('algebra:multi_step_word', 'two-step stories in other contexts')],
  'Y3.B11.S10': [R('area_perimeter:net_surface_area', 'nets of 3-D shapes in later years'), R('shapes_early:compose_shapes', 'building a shape from other shapes')],
  'Y3.B12.S4': [R('graphs:line_plot_g2', 'another way to draw data (Grade 2 line plots)')],
  'Y3.B12.S5': [R('graphs:line_plot_g2', 'another way to show collected data')],
  'Y3.B12.S6': [R('coordinates:coordinate_q1', 'reading a grid by row and column, like a two-way table')],
};

// rule 18 (lead, 2026-10-10): pre and related LINKS carry opts. build.mjs gives a link the opts its referenced step uses
// for that key; else these year defaults; linkscan.mjs then generates every link and flags numbers past the year's range.
export const linkOpts = {
  Y2: { 'patterns:seq_10': { band: 50 }, 'patterns:seq_5': { band: 50 }, 'patterns:seq_2': { band: 50 }, 'patterns:double': { band: 20 },
    'patterns:halve': { band: 20 }, 'patterns:number_pattern': { band: 50 }, 'patterns:skip_count_line': { band: 50 }, 'graphs:pictograph': { range: 20 },
    'algebra:tape_diagram': { band: 50 }, 'algebra:multi_step_word': { band: 50 }, 'placevalue:combine': { band: 99 }, 'placevalue:expand': { band: 99 },
    'placevalue:order_least_to_greatest': { band: 99 }, 'placevalue:order_greatest_to_least': { band: 99 }, 'placevalue:identify': { band: 99 },
    'placevalue:value': { band: 99 }, 'placevalue:unit_form': { band: 99 }, 'placevalue:compare': { band: 99 }, 'subtraction:mixed_add_sub': { range: 100 },
    'multiplication:mult_chart_easy': { band: 100 }, 'counting:number_seq_fill': { range: 100 }, 'composing:hundreds_chart_fill': { band: 100 },
    'measurement:money_count': { currency: 'usd' }, 'measurement:money': { currency: 'usd' }, 'measurement:money_change': { currency: 'usd', step: 100, paid: 'note', band: 2000 },
    'measurement:coin_value': { currency: 'usd' }, 'measurement:equiv_coin_sets': { currency: 'usd' }, 'measurement:make_change_least_coins': { currency: 'usd' },
    'measurement:temperature': { forms: [1] }, 'fractions:shade_fraction': { denoms: [2] }, 'fractions:identify': { denoms: [2] } },
  Y3: { 'placevalue:combine': { band: 999 }, 'placevalue:expand': { band: 999 }, 'placevalue:order_least_to_greatest': { band: 999 },
    'placevalue:order_greatest_to_least': { band: 999 }, 'placevalue:compare': { band: 999 }, 'measurement:capacity': { units: [1], forms: [0] },
    'measurement:money_count': { currency: 'usd', kind: 'both' }, 'measurement:money': { currency: 'usd', step: 5 }, 'measurement:money_change': { currency: 'usd', step: 5, paid: 'note' },
    'measurement:coin_value': { currency: 'usd' }, 'measurement:equiv_coin_sets': { currency: 'usd' }, 'measurement:make_change_least_coins': { currency: 'usd' },
    'measurement:money_notation': { currency: 'usd' }, 'measurement:enough_money': { currency: 'usd' }, 'measurement:money_compare': {},
    'measurement:temperature': { forms: [1] }, 'graphs:pictograph': { range: 100 } },
};
// per-link fixes: opts, or null = the link is dropped (its defaults are beyond the step and no option narrows it)
export const linkFix = {
  'Y2.B5.S12': { 'patterns:skip_count_grid': null },
  'Y2.B2.S19': { 'subtraction:mixed_add_sub': null },
  'Y2.B6.S1': { 'measurement:length_metric': null },
  'Y2.B6.S5': { 'measurement:unit_conversion_word': null },
  'Y2.B7.S4': { 'measurement:capacity': null }, 'Y2.B7.S5': { 'measurement:capacity': null }, 'Y2.B7.S6': { 'measurement:capacity': null },
  'Y2.B7.S7': { 'measurement:capacity': null }, 'Y2.B7.S8': { 'measurement:capacity': null },
  'Y3.B1.S1': { 'multiplication:count_by_tables': null }, 'Y3.B1.S2': { 'multiplication:count_by_tables': null },
  'Y3.B1.S5': { 'multiplication:count_by_tables': null },
};
relR3['Y2.B5.S12'] = [...(relR3['Y2.B5.S12'] || []), R('counting:number_seq_fill', 'counting in 2s fills in the even numbers', { step: 2, range: 20 })];
relR3['Y2.B7.S4'] = [R('algebra:tape_diagram', 'a bar model of two masses and their total', { band: 50 }), R('algebra:multi_step_word', 'two-step stories in other contexts', { band: 50 })];
relR3['Y2.B7.S8'] = [R('algebra:tape_diagram', 'a bar model of two capacities and their total', { band: 50 }), R('algebra:multi_step_word', 'two-step stories in other contexts', { band: 50 })];
relR3['Y2.B7.S5'] = [R('fractions:shade_fraction', 'half full is a half of the container (Y2.B8 halves)', { denoms: [2] })];
relR3['Y2.B7.S6'] = [R('measurement:temperature', 'a thermometer (Y2.B7.S9): another scale read at a pointer', { forms: [1] })];
relR3['Y2.B7.S7'] = [R('measurement:temperature', 'a thermometer (Y2.B7.S9): another scale read at a pointer', { forms: [1] })];
// rule 18, ×/÷ and fractions: links with default opts deal every table to 12 and every denominator family; narrow them
// to the tables and fractions this year knows (Y2: 2, 5, 10, halves; Y3: 2, 3, 4, 5, 8, 10; halves, thirds, fifths).
// null = drop the link in this year (no option narrows it: mult_word_problems deals 5 × 8; fraction_of_set ignores denoms).
const ZR = (...st) => ({ rows: st.map((step) => ({ step, start: 'zero', dir: 'up' })) });
Object.assign(linkOpts.Y2, {
  'multiplication:mult_facts': { constant: [2, 5, 10], band: 100 }, 'division:div_facts': { constant: [2, 5, 10], band: 100 },
  'multiplication:mult_word_problems': null, 'division:share_into_groups': { band: 12 }, 'multiplication:dot_array_mult': { band: 25 },
  'multiplication:repeated_add_to_mult': { band: 25 }, 'fractions:fraction_of_set': null, 'fractions:fraction_of_set_nv': null,
  'fractions:equiv_frac_nv': { denoms: [2] }, 'fractions:select_equiv_frac': { denoms: [2] }, 'multiplication:count_by_tables': ZR(2, 5, 10),
});
const T3 = [2, 3, 4, 5, 8, 10];
Object.assign(linkOpts.Y3, {
  'multiplication:mult_facts': { constant: T3, band: 100 }, 'division:div_facts': { constant: T3, band: 100 },
  'multiplication:mult_chart_easy': { constant: T3, band: 100 }, 'multiplication:nl_mult': { constant: T3, band: 100 }, 'division:nl_div': { constant: T3, band: 100 },
  'division:missing_mult_div': { range: 100 }, 'multiplication:mult_word_problems': { range: 100 }, 'division:div_word_problems': { range: 100 },
  'multiplication:mult_comparison': { range: 50 }, 'division:div_remainders': { constant: [2, 3, 4, 5] }, 'division:area_model_div_2by1': { constant: [2, 3, 4, 5] },
  'division:div_equation_parts': { band: 25 }, 'fractions:fraction_of_set_hard': { denoms: [2, 3], range: 50 }, 'fractions:fraction_of_set': { denoms: [2, 3, 5], range: 50 },
  'fractions:fraction_of_set_nv': { denoms: [2, 3, 5] }, 'fraction_operations:add_frac_like_nv': { denoms: [2, 3, 5], forms: [0] }, 'fractions:identify': { denoms: [2, 3] },
  'fractions:shade_fraction': { denoms: [2, 3] }, 'fractions:write_fraction': { denoms: [2, 3] }, 'fractions:equiv_frac_nv': { denoms: [2] },
  'fractions:equiv_frac_visual': { denoms: [2] }, 'multiplication:count_by_tables': ZR(2, 5, 10), 'fraction_operations:mult_frac_whole': { denoms: [2] },
});
relR3['Y2.B5.S1'] = [R('multiplication:repeated_add_to_mult', 'adding the equal groups (Y2.B5.S3): the next idea', { band: 25 }), R('multiplication:dot_array_mult', 'equal groups set out in rows as an array', { band: 25 })];
relR3['Y2.B5.S2'] = [R('multiplication:repeated_add_to_mult', 'adding the equal groups made (Y2.B5.S3)', { band: 25 }), R('multiplication:dot_array_mult', 'equal groups set out in rows as an array', { band: 25 })];
relR3['Y2.B5.S1'].push(R('multiplication:mult_facts', 'equal groups written as a multiplication fact (Y2.B5.S9): where this leads', { constant: [2, 5, 10], band: 100 }));
relR3['Y2.B5.S2'].push(R('multiplication:mult_facts', 'equal groups written as a multiplication fact (Y2.B5.S9): where this leads', { constant: [2, 5, 10], band: 100 }));

// ======================= round 4 (critic Y2-Y3 r3: S9 = rule 18 CONTENT of links, step fixes) =======================
const FR_DROP = { to: null, preBuild: 'single_fraction' };
const PS = { to: 'shapes_early:partition_shapes', opts: { parts: [0, 1, 2] } }; // halves, thirds, quarters only (1.G.A.3)
const BEFORE_COLUMNS_Y2 = /^Y2\.B(1|2)\.S([1-9]|1[0-4])$/; // Y2.B2.S15 is the first 2-digit column step
export const linkSwap = {
  Y2: {
    // fractions: every fraction skill deals eighths, fifths or sixths whatever `denoms` says (denoms picks a FAMILY)
    'fractions:shade_fraction': PS, 'fractions:identify': PS, 'fractions:write_fraction': PS,
    'fractions:equiv_frac_visual': FR_DROP, 'fractions:select_equiv_frac': FR_DROP, 'fractions:equiv_frac_nv': FR_DROP,
    'composing:compose_whole': FR_DROP, 'composing:fraction_number_line': FR_DROP,
    'fractions:fraction_of_set': { to: 'patterns:halve', opts: { band: 20 } }, 'fractions:fraction_of_set_nv': { to: 'patterns:halve', opts: { band: 20 } },
    // × ÷ and sums past 120 at Grade 1
    'number_ops_mixed:which_sign': { to: null }, 'algebra:balance_addsub': { to: null },
    // pictograph totals pass 150 whatever `range` says; the 1-to-1 intro fits
    'graphs:pictograph': { to: 'measurement:pictograph_intro', opts: {} },
    // coordinate plane and transformations are Grade 5-8
    'coordinates:geo_rotate': { to: null }, 'coordinates:geo_translate': { to: null }, 'coordinates:geo_reflect': { to: null },
    'coordinates:coordinate_q1': { to: null }, 'coordinates:coord_polygon': { to: null },
    // no 2-digit column regrouping before the column steps: the 1-digit-across-10 facts, written across
    'addition:add_50_regroup': { to: 'addition:add_10_regroup', opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y2 },
    'subtraction:sub_50_regroup': { to: 'subtraction:sub_10_regroup', opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y2 },
    'addition:add_10_regroup': { to: 'addition:add_10_regroup', opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y2 },
    'subtraction:sub_10_regroup': { to: 'subtraction:sub_10_regroup', opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y2 },
    'measurement:unit_conversions': { to: null },
  },
  Y3: {
    // unlike-fraction compares and orders are 4.NF.A.2; the same-denominator / unit-fraction compare is compare_kind (to build)
    'fractions:compare': { to: null, preBuild: 'compare_kind' }, 'fractions:order_fractions': { to: null, preBuild: 'compare_kind' },
    // missing_mult_div deals "__ × 12 = 144" (range ignored); the 12 times-table is not Y3
    'division:missing_mult_div': { to: 'division:div_facts', opts: { constant: [2, 3, 4, 5, 8, 10], band: 100 } },
    // customary conversions on metric and time steps
    'measurement:unit_conversions': { to: null },
    'coordinates:geo_rotate': { to: null }, 'coordinates:geo_translate': { to: null }, 'coordinates:geo_reflect': { to: null },
    'coordinates:coordinate_q1': { to: null }, 'coordinates:coord_polygon': { to: null },
  },
};
ladders.frac = [C('shapes_early:partition_shapes', 'Y1.B10 / Y2.B8 halves, thirds and quarters of a shape', { parts: [0, 1, 2] }), C('patterns:halve', 'Y2.B5.S11 halving an amount within 20', { band: 20 }),
  C('division:share_into_groups', 'Y2.B5.S8 sharing into equal groups', { band: 12 }), C('multiplication:equal_or_unequal_groups', 'Y2.B5.S1 equal and unequal groups')];
Object.assign(linkOpts.Y2, { 'measurement:enough_money': { currency: 'usd' }, 'addition:add_10_regroup': { notation: ['across'] }, 'subtraction:sub_10_regroup': { notation: ['across'] } });
Object.assign(linkFix, {
  'Y3.B11.S2': { 'measurement:reading_ruler': null }, 'Y3.B11.S3': { 'measurement:reading_ruler': null }, 'Y3.B11.S7': { 'measurement:reading_ruler': null },
  'Y3.B7.S7': { 'measurement:capacity': null },
  'Y3.B7.S3': { 'multiplication:count_by_tables': ZR(100) },
  'Y3.B6.S6': { 'shapes_early:shape_corners_count': null },
});
Object.assign(r3, {
  'Y2.B7.S1': { partials: [P('measurement:heavier_lighter_visual', 'picture judgements only (which is heavier, a car or an apple); comparing on a balance scale, and "equal mass / the same as", are not dealt')], build: ['compare_measures'] },
  'Y2.B2.S20': { partials: [], verdict: 'gap', build: ['compare_sentences'], why: { 'addition:equal_sign': 'deals plain sums (12 + 12 = ?, 16 + 20 = ?) on every item: it compares nothing' } },
  'Y2.B3.S5': { direct: [], partials: [P('angles_lines:symmetry', 'deals diagonal and horizontal lines and counts of lines ("a square has 4"), 4.G.A.3; a page of vertical lines of symmetry only is not available'), P('angles_lines:place_symmetry_lines', 'draws every line of symmetry, diagonals included; a vertical line only is not available')], verdict: 'partial', build: ['symmetry_vertical'] },
  'Y2.B3.S12': { partials: [P('patterns:shape_pattern', '2-D shapes and stars only; patterns made of 3-D shapes (cube, sphere, cone) are not dealt')], verdict: 'partial', build: ['pattern_3d'] },
  'Y2.B10.S7': { direct: [D('graphs:pictograph', { range: 50, scale: [0, 1, 2] })] },
  'Y2.B2.S11': { ...r3['Y2.B2.S11'], core: [C('composing:make_ten', 'Y2.B2.S1 bonds to 10: 10 − 3 = 7, so 40 − 3 = 37'), C('composing:number_bonds', 'Y1 bonds within 10')] },
  'Y2.B9.S5': { core: [C(CBT, 'Y2.B1.S15 counting in 5s from 0: the minutes round the clock', ZR(5))] },
  'Y2.B10.S6': { core: [C(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s from 0: reading a key of 2, 5 or 10', ZR(2, 5, 10))] },
  'Y2.B10.S3': { ...r3['Y2.B10.S3'], core: [C('graphs:tally_chart', 'Y2.B10.S1 tally charts: the counts a block diagram shows'), C('comparing:compare_groups', 'Y1.B1.S12 more, fewer, the same')] },
  'Y2.B1.S14': { ...r3['Y2.B1.S14'], missing: 'orders numerals only; ordering objects or base-10 pictures of numbers is not dealt' },
  'Y3.B2.S20': { direct: [], partials: [P('number_sense:estimate_sum', 'rounds 2-digit numbers to the nearest 10 (56 + 24); estimating 3-digit sums to the nearest 100 within 1,000 is not dealt (place 100 also deals sums past 1,000: 538 + 775)', { place: 10 }), P('number_sense:estimate_sums_diffs', 'the same: 2-digit only at place 10', { place: 10 })],
    verdict: 'partial', build: ['estimate_1000'], core: [C('number_sense:place_on_number_line', 'Y3.B1.S11 estimating on a number line to 1,000: which hundred is nearer', { span: 100, band: 1000 }), C('placevalue:more_less_100', 'Y3.B1.S9 100 more, 100 less', { step: 100 })] },
  'Y3.B6.S6': { preOnly: true, pre: [R('number_sense:place_on_number_line', 'Y2.B1.S9 reading a number line in equal steps', { span: 10, band: 100 }), R('measurement:reading_ruler', 'Y2.B6.S1 / Y3.B5.S2 reading a scale (a ruler)'), R('shapes_early:partition_shapes', 'Y2.B8 halves, thirds and quarters of a whole', { parts: [0, 1, 2] })], preBuild: ['frac_count'] },
  'Y3.B3.S2': { direct: [D('multiplication:arrays_groups', { forms: [0] }), D('multiplication:dot_array_mult', { band: 25 })] },
  'Y3.B2.S16': { direct: [], partials: [P('subtraction:sub_1k_regroup', 'exchanges are mixed; one exchange from the hundreds only is not available')], verdict: 'partial', build: ['exchange_count'],
    related: [R('subtraction:sub_across_zeros', 'subtracting across zeros (302 − 264): the double exchange that comes next', { band: 500 })] },
  'Y3.B7.S7': { core: [C('number_sense:place_on_number_line', 'Y3.B1.S10 a jug scale is a vertical number line', { span: 100, band: 1000 }), C(CBT, 'Y2.B1.S15 counting in 10s to read the jug marks', ZR(10)), C('measurement:mass_volume_liquid', 'Y2.B7.S6 reading millilitres on a jug', { forms: [0] })], preBuild: ['nonstandard_capacity'] },
});
// related replacements where the S9 swaps emptied a step
relR3['Y2.B2.S20'] = [R('addition:cloze_addition', 'a missing number in a sentence (Y2.B2.S21): the next idea'), R('subtraction:missing_add_sub', 'missing-number sentences (Y2.B2.S21)')];
relR3['Y2.B2.S21'] = [R('algebra:tape_diagram', 'a bar model shows the missing part', { band: 20 })];
gapMissing['Y2.B2.S20'] = 'comparing two number sentences with <, > or = by reasoning about their parts (4 + 5 ○ 4 + 6) rather than always working both out';
Object.assign(proposals, {
  symmetry_vertical: { kind: 'option', skill: 'angles_lines:symmetry', skills: ['angles_lines:symmetry', 'angles_lines:place_symmetry_lines'], option: 'lines: vertical only (no diagonal or horizontal lines, no "how many lines")', name: 'Vertical Line of Symmetry (option)',
    teaches: 'deciding whether a vertical line splits a picture or shape into two matching halves, and drawing that one vertical line',
    representation: 'one shape per boxed cell with a dashed vertical line to judge (tick or cross), or a shape to draw the vertical line on', family: 'geometry',
    steps: ['Y2.B3.S5'], ccss: ['4.G.A.3'], why: 'both skills deal diagonal lines and counts of lines (Grade 4); WRM Y2 uses a vertical mirror line only' },
  pattern_3d: { kind: 'option', skill: 'patterns:shape_pattern', option: 'shapes: 3-D (cube, sphere, cone, cylinder pictures) as well as 2-D', name: 'Patterns With 3-D Shapes (option)',
    teaches: 'continuing and completing repeating patterns made of 3-D shapes, and of 2-D and 3-D shapes together',
    representation: 'a row of drawn 3-D shapes in boxes with the next one or two boxes empty; answer: draw or name the shape', family: 'patterns',
    steps: ['Y2.B3.S12'], ccss: ['1.G.A.1'], why: 'shape_pattern draws 2-D shapes and stars only' },
  estimate_1000: { kind: 'option', skill: 'number_sense:estimate_sum', skills: ['number_sense:estimate_sum', 'number_sense:estimate_sums_diffs'], option: 'place 100 with every sum and difference within 1,000', name: 'Estimate 3-Digit Sums Within 1,000 (option)',
    teaches: 'estimating the answer to a 3-digit addition or subtraction by rounding each number to the nearest 100 on a number line, with every answer within 1,000',
    representation: 'the existing estimate cell "309 + 186 ≈ ___ + ___ = ___" with a 0-1,000 number line marked in hundreds as the support', family: 'number sense',
    steps: ['Y3.B2.S20'], ccss: ['2.NBT.B.7', '3.NBT.A.1'], why: 'place 10 rounds 2-digit numbers only; place 100 deals sums past 1,000 (538 + 775)' },
});
proposals.compare_measures.steps.push('Y2.B7.S1');
proposals.compare_measures.teaches += '; the balance-scale form shows two objects on a pan balance (heavier, lighter, or the same mass)';
const TQ = R('measurement:time_quarter', 'quarter past / quarter to: a quarter of a turn of the clock (Y2.B9.S2)');
const TH = R('measurement:time_half_hour', 'half past: half a turn of the minute hand (Y2.B9.S1)');
const CS = R('shapes_early:compose_shapes', 'two or more equal parts put back together make the whole shape');
Object.assign(relR3, {
  'Y2.B2.S8': [R('subtraction:sub_10_regroup', 'the inverse: subtracting back across 10', { notation: ['across'] }), R('number_sense:between_tens', 'which ten comes next after a number')],
  'Y2.B2.S10': [R('addition:add_10_regroup', 'the inverse: adding across 10', { notation: ['across'] }), R('number_sense:between_tens', 'the ten a number crosses back over')],
  'Y2.B3.S6': [CS],
  'Y2.B8.S1': [CS, R('composing:number_bonds', 'part-part-whole with numbers: the same idea with a quantity')],
  'Y2.B8.S2': [CS, R('multiplication:equal_or_unequal_groups', 'equal and unequal groups of objects: the same idea with a set')],
  'Y2.B8.S3': [TH, R('patterns:double', 'doubling undoes halving', { band: 20 })], 'Y2.B8.S4': [TH, R('patterns:double', 'doubling undoes halving', { band: 20 })],
  'Y2.B8.S5': [TQ, CS], 'Y2.B8.S6': [TQ, CS], 'Y2.B8.S7': [CS], 'Y2.B8.S8': [CS],
  'Y2.B8.S9': [R('patterns:double', 'the whole is double the half', { band: 20 }), CS],
  'Y2.B8.S10': [CS, TQ], 'Y2.B8.S11': [CS, TQ], 'Y2.B8.S12': [TQ, TH], 'Y2.B8.S13': [TQ], 'Y2.B8.S14': [TQ], 'Y2.B8.S15': [TQ, TH],
  'Y2.B10.S5': [R('graphs:build_bar_graph', 'the same data drawn as a bar chart (Grade 2)')], 'Y2.B10.S6': [R('graphs:build_bar_graph', 'the same data drawn as a bar chart (Grade 2)')],
  'Y2.B11.S1': [R('counting:count_sequence', 'first, next, last: the position of a number in a count')],
  'Y2.B11.S2': [R('number_sense:place_on_number_line', 'moving right and left along a line by a number of steps', { span: 10, band: 20 })],
  'Y2.B11.S3': [TQ, TH], 'Y2.B11.S4': [TQ, R('number_sense:place_on_number_line', 'moving along a line by a number of steps', { span: 10, band: 20 })],
  'Y3.B1.S13': [R('measurement:order_clocks_digital_asc', 'putting times in order: the same ordering idea with another kind of number')],
  'Y3.B6.S1': [R('fractions:graph_fractions', 'placing a unit fraction on a number line (the next idea)', { denoms: [2, 3] })],
  'Y3.B7.S9': [R('measurement:money_notation', '345 cents = $3.45: another exchange between a big and a small unit', { currency: 'usd', task: 'words' })],
  'Y3.B10.S10': [R('measurement:elapsed_visual_easy', 'a short duration on a time line')], 'Y3.B10.S11': [R('measurement:elapsed_visual_easy', 'comparing durations on a time line')],
  'Y3.B11.S8': [CS],
  'Y3.B12.S6': [R('multiplication:mult_chart_easy', 'a times-table chart is read by row and column, like a two-way table', { constant: [2, 3, 4, 5, 8, 10], band: 100 })],
});
relR3['Y2.B2.S20'] = [R('number_sense:doubles_near_doubles', '4 + 5 is one more than 4 + 4: comparing sentences by their parts')];
const NOREL_POS = 'no related skill: every skill that shares the idea (position words, quarter and half turns on the clock, moving along a line) is earlier learning and is listed as pre; the grid and coordinate skills are Grade 5+ (rule 18)';
for (const id of ['Y2.B11.S2', 'Y2.B11.S3', 'Y2.B11.S4']) r3[id] = { ...(r3[id] || {}), relNote: NOREL_POS };
Object.assign(linkFix, {
  'Y3.B1.S1': { ...linkFix['Y3.B1.S1'], 'placevalue:place_value_disks': { band: 99 }, 'composing:base10_build_hundreds': null },
  'Y3.B1.S2': { ...linkFix['Y3.B1.S2'], 'composing:base10_build_hundreds': null },
});
relR3['Y3.B1.S2'] = [...(relR3['Y3.B1.S2'] || []), R('placevalue:place_value_disks', 'the same partition shown with place-value counters', { band: 99 })];
r3['Y2.B1.S1'] = { ...(r3['Y2.B1.S1'] || {}), note: 'pre and related links count to 100 (Y1.B12 tens to 100, Y1.B6 count to 50; the next steps write 2-digit numbers): K learning (K.CC.A.1), already met before this Grade 1 week' };
// no 2-digit (Y2) / 3-digit (Y3) column steps as the "next idea" before the column steps begin (rule 18 layout)
const BEFORE_COLUMNS_Y3 = /^Y3\.B(1|2)\.S([1-9]|10)$/;
for (const k of ['addition:add_100_no_regroup', 'addition:add_100_regroup', 'subtraction:sub_100_no_regroup', 'subtraction:sub_100_regroup']) linkSwap.Y2[k] = { to: null, only: BEFORE_COLUMNS_Y2 };
for (const k of ['addition:add_1k_no_regroup', 'addition:add_1k_regroup', 'addition:add_1k_mixed', 'subtraction:sub_1k_no_regroup', 'subtraction:sub_1k_regroup', 'subtraction:sub_1k_mixed']) linkSwap.Y3[k] = { to: null, only: BEFORE_COLUMNS_Y3 };
linkOpts.Y3['area_perimeter:perimeter'] = { forms: [0, 1] };
r3['Y3.B5.S12'] = { direct: [D('area_perimeter:perimeter', { forms: [0, 1] })], note: 'forms [0, 1]: perimeter from side lengths and the missing side, in cm; form 2 is stories in feet and inches (customary)' };
Object.assign(linkFix, {
  'Y2.B1.S9': { 'multiplication:count_by_tables': null }, 'Y2.B1.S13': { 'multiplication:count_by_tables': null },
  'Y2.B5.S13': { 'multiplication:mult_chart_easy': { constant: [5, 10], band: 100 } }, 'Y2.B5.S15': { 'multiplication:mult_chart_easy': { constant: [5, 10], band: 100 } },
});
const BT = R('number_sense:between_tens', 'which two tens a number sits between');
const SCL = R('patterns:skip_count_line', 'counting in 10s as jumps on a number line', { band: 50 });
const HCF = R('composing:hundreds_chart_fill', 'one row down a hundred square is 10 more', { band: 100 });
Object.assign(relR3, {
  'Y2.B1.S9': [BT, HCF], 'Y2.B2.S11': [R('subtraction:nl_sub', 'counting back from a ten on a number line'), BT, R('addition:add_10_regroup', 'the inverse: adding across 10', { notation: ['across'] })],
  'Y2.B2.S12': [R('subtraction:nl_sub', 'counting back across a ten on a number line'), R('addition:add_10_regroup', 'the inverse: adding across 10', { notation: ['across'] }), BT],
  'Y2.B2.S13': [SCL, HCF, BT], 'Y2.B2.S14': [SCL, HCF, BT],
  'Y3.B2.S10': [R('number_sense:doubles_near_doubles', 'another known-fact strategy (near doubles)'), R('addition:add_sub_fact_family', 'related facts: the same connections between + and −', { range: 100 })],
});
Object.assign(linkOpts.Y2, { 'addition:add_facts': { notation: ['across'] }, 'subtraction:sub_facts': { notation: ['across'] } });
r3['Y2.B3.S5'] = { ...r3['Y2.B3.S5'], relOnly: true, related: [R('shapes_early:compose_shapes', 'two matching halves put together make a symmetrical shape'), R('angles_lines:symmetry', 'x', {})].slice(0, 1) };
// 1-digit facts written across (WRM writes them as sentences and part-whole models), wherever the skill takes `notation`
for (const k of ['addition:add_20_mixed', 'addition:add_10_mixed']) linkSwap.Y2[k] = { to: k, opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y2 };
for (const k of ['addition:add_10_regroup', 'subtraction:sub_10_regroup', 'addition:add_20_mixed', 'addition:add_10_mixed']) linkSwap.Y3[k] = { to: k, opts: { notation: ['across'] }, only: BEFORE_COLUMNS_Y3 };

// ======================= round 5 (critic Y2-Y3 r4: S10 = content taught LATER than the step's school week; rule 19) ===
// markerFix: when a link's generated items carry content first met after the step's school week (markers.mjs), build.mjs
// tries these alternatives in order (other opts, or another skill) before it drops the link.
const PSq = (p) => ({ key: 'shapes_early:partition_shapes', opts: { parts: p } });
const T3b = [2, 3, 4, 5, 10];
export const markerFix = {
  Y2: {
    'shapes_early:partition_shapes': [{ opts: { parts: [0, 2] } }, { opts: { parts: [0] } }],
    'measurement:estimate_length': [{ opts: { forms: [0, 1] } }],
    'measurement:time_quarter': [{ key: 'measurement:time_half_hour' }], 'measurement:time_5min': [{ key: 'measurement:time_half_hour' }],
    'measurement:elapsed_hour': [{ key: 'measurement:time_half_hour' }],
    'shapes_early:compose_from_attributes': [{ key: 'shapes_early:shape_attributes', opts: { forms: [0, 1] } }],
    'fractions:shade_fraction': [PSq([0, 2])], 'fractions:identify': [PSq([0, 2])], 'fractions:write_fraction': [PSq([0, 2])],
  },
  Y3: {
    'division:div_facts': [{ opts: { constant: [2, 5, 10], band: 100 } }],
    'multiplication:nl_mult': [{ opts: { constant: T3b, band: 100 } }, { opts: { constant: [2, 5, 10], band: 100 } }],
    'division:nl_div': [{ opts: { constant: [2, 5, 10], band: 100 } }],
    'multiplication:mult_facts': [{ opts: { constant: T3b, band: 100 } }, { opts: { constant: [2, 5, 10], band: 100 } }],
    'multiplication:mult_chart_easy': [{ opts: { constant: T3b, band: 100 } }],
    'division:box_division_easy': [{ opts: { regroup: 'none', constant: [2, 3, 4, 5, 8] } }, { opts: { regroup: 'none', constant: [2, 3, 4, 5] } }],
    'multiplication:mult_word_problems': [{ key: 'multiplication:repeated_add_to_mult', opts: { band: 25 } }],
    'multiplication:multiply': [{ key: 'multiplication:mult_zeros', opts: { forms: [0] } }], 'multiplication:area_model_mult': [{ key: 'multiplication:mult_zeros', opts: { forms: [0] } }],
    'fractions:identify': [PSq([0, 1, 2])], 'fractions:write_fraction': [PSq([0, 1, 2])], 'fractions:shade_fraction': [PSq([0, 1, 2])], 'composing:compose_whole': [PSq([0, 1, 2])],
    'measurement:estimate_length': [{ opts: { forms: [0, 1] } }],
  },
};
for (const Y of ['Y2', 'Y3']) linkOpts[Y]['measurement:estimate_length'] = { forms: [0, 1] };
ladders.frac = [C('shapes_early:partition_shapes', 'Y1.B10.S1 / Y1.B10.S5 halves and quarters of a shape (K)', { parts: [0, 2] }), C('patterns:halve', 'Y1.B10.S4 / Y2.B5.S11 halving an amount within 20', { band: 20 }),
  C('division:share_into_groups', 'Y1.B9.S9 sharing into equal groups (K)', { band: 12 }), C('multiplication:equal_or_unequal_groups', 'Y1.B9.S4 equal and unequal groups (K)')];
ladders.money = [C(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s from 0', ZR(2, 5, 10)), C('measurement:coin_value', 'Y1.B13.S2 recognising coins (K)', { currency: 'usd' }), C('measurement:money_count', 'Y1.B13 / Y2.B4.S1 counting coins', { currency: 'usd', kind: 'like' }), C('subtraction:sub_wp_20', 'Y1.B5 subtraction stories within 20 (K)')];
markerFix.Y3['multiplication:nl_mult'] = [{ opts: { constant: T3b, band: 50 } }, { opts: { constant: [2, 5, 10], band: 50 } }, { opts: { constant: [2, 5, 10], band: 20 } }];
markerFix.Y3['multiplication:mult_facts'] = [{ opts: { constant: T3b, band: 50 } }, { opts: { constant: [2, 5, 10], band: 50 } }];
// ---- round 5 step fixes ----
const NOTE_POS = 'no related skill a Grade 1 pupil has met by this school week (W19-W20): quarter past and quarter to come in W36 and grid or coordinate skills are Grade 5+ (rule 19); position words and halves and quarters of a shape (K learning) are pre';
for (const id of ['Y2.B11.S2', 'Y2.B11.S3', 'Y2.B11.S4']) r3[id] = { ...(r3[id] || {}), relNote: NOTE_POS };
Object.assign(r3, {
  'Y2.B7.S1': { ...r3['Y2.B7.S1'], relNote: 'no related skill yet: reading a scale in grams or kilograms comes in W34-W35 (rule 19); compare language and heavier/lighter are pre' },
  'Y2.B9.S6': { ...(r3['Y2.B9.S6'] || {}), relNote: 'no related skill met by W23: quarter past/to (W36), 5-minute times (W37) and durations come later (rule 19); o\'clock and half past are pre' },
  'Y3.B4.S3': { partials: [P('multiplication:mult_properties', '×6 and ×7 items (7 × 6 = 3 × 6 + 4 × 6, 9 × 1) beyond the Grade 2 tables are mixed in; a page on the 2, 3, 4, 5, 8 and 10 tables only is not available')], verdict: 'partial', build: ['props_tables'],
    core: [C('multiplication:arrays_groups', 'Y3.B3.S2 arrays: turning an array gives the same product', { forms: [0] }), C('multiplication:repeated_add_to_mult', 'Y2.B5.S3 adding equal groups', { band: 25 })],
    related: [R('patterns:double', 'doubling: the 4 times-table is double the 2 times-table', { band: 20 })] },
  'Y3.B4.S4': { partials: [P('multiplication:multiply', '2-digit × 1-digit with and without exchanges mixed (53 × 8), and ×6, ×7, ×9 items beyond the Grade 2 tables (23 × 9, 7 × 63); a no-exchange page on the 2, 3, 4, 5 and 8 tables is not available', { tiles: 21 }), P('multiplication:area_model_mult', 'the partition picture, exchanges mixed, and ×6, ×7, ×9 items', { tiles: 21 })], build: ['exchange_count'] },
  'Y3.B4.S5': { ...r3['Y3.B4.S5'], partials: [P('multiplication:multiply', 'mostly with an exchange, but no-exchange items (30 × 2) are mixed in, and ×6, ×7, ×9 items beyond the Grade 2 tables (23 × 9)', { tiles: 21 }), P('multiplication:area_model_mult', 'the partition picture; exchanges are not controlled (3 × 13), and ×6, ×7, ×9 items appear', { tiles: 21 })], build: ['exchange_count'] },
  'Y3.B4.S7': { ...(r3['Y3.B4.S7'] || {}), partials: [P('division:box_division_easy', 'regroup "none" still deals 75 ÷ 5 (an exchange of tens) and 1-digit dividends (15 ÷ 3); a page of 2-digit ÷ 1-digit with no exchange is not available. `constant` keeps it to the Grade 2 tables (no ÷6, ÷7, ÷9)', { regroup: 'none', constant: [2, 3, 4, 5, 8] })], build: ['exchange_count'] },
  'Y3.B4.S8': { direct: [D('division:area_model_div_2by1', { constant: [2, 3, 4, 5, 8] })], note: 'constant [2,3,4,5,8]: no ÷6, ÷7, ÷9 (the default deals 42 ÷ 7, 96 ÷ 6, 81 ÷ 9)' },
  'Y3.B6.S7': { preOnly: true, pre: [R('shapes_early:partition_shapes', 'Y2.B8 halves, thirds and quarters of a whole', { parts: [0, 1, 2] }), R('number_sense:place_on_number_line', 'Y2.B1.S9 a number line marked in equal steps', { span: 10, band: 100 }), R('measurement:reading_ruler', 'Y2.B6.S1 reading a scale (a ruler)')] },
  'Y3.B2.S20': { ...r3['Y3.B2.S20'], core: [C('number_sense:place_on_number_line', 'Y2.B1.S11 estimating on a number line to 100: which ten is nearer', { span: 10, band: 100 }), C('placevalue:more_less_100', 'Y3.B1.S9 10 and 100 more or less', { step: 10 })] },
  'Y3.B7.S9': { ...(r3['Y3.B7.S9'] || {}), relNote: 'no related skill: the same exchange with mass (kg ↔ g) has no skill yet (metric_mass_capacity), and 1,000 = 10 hundreds is pre' },
  'Y3.B7.S4': { ...(r3['Y3.B7.S4'] || {}), relOnly: true, related: [], relNote: 'no related skill: the same exchange with capacity (l ↔ ml) is taught later (W34) and has no whole-number skill yet (metric_mass_capacity)' },
  'Y3.B1.S13': { ...(r3['Y3.B1.S13'] || {}), relOnly: true, related: [], relNote: 'no related skill: ordering other kinds of numbers (fractions, decimals) is above Grade 2; comparing and partitioning are pre' },
  'Y2.B9.S1': { ...(r3['Y2.B9.S1'] || {}), related: [R('shapes_early:partition_shapes', 'half past: the minute hand has gone half way round, like half of a shape', { parts: [0] })] },
});
Object.assign(proposals, {
  props_tables: { kind: 'option', skill: 'multiplication:mult_properties', option: 'tables: only the 2, 3, 4, 5, 8 and 10 times-tables (Grade 2)', name: 'Reasoning About Multiplication Within the Grade 2 Tables (option)',
    teaches: 'using arrays, doubling and splitting to reason about multiplication facts, using only the tables taught at Grade 2 (4 × 3 = 3 × 4; 8 × 3 = double 4 × 3)',
    representation: 'the existing properties cell (array picture with the two sentences), facts drawn from the Grade 2 tables only', family: 'operations',
    steps: ['Y3.B4.S3'], ccss: ['3.OA.B.5'], why: 'mult_properties deals ×6 and ×7 splits (7 × 6 = 3 × 6 + 4 × 6), beyond the Grade 2 tables' },
});
delete relR3['Y3.B7.S9'];
Object.assign(linkFix, { 'Y3.B3.S10': { 'multiplication:count_by_tables': ZR(4) }, 'Y3.B11.S7': { 'angles_lines:identify_lines': null, 'angles_lines:identify_angles': null } });
const NOREL3 = {
  'Y3.B2.S21': 'no related skill beyond the pre list: fact families and missing numbers (the same inverse idea) are earlier learning listed as pre',
  'Y3.B4.S9': 'no related skill at Grade 2 tables: comparison stories deal ×6, ×7, ×9 (rule 19); sharing with remainders is pre',
  'Y3.B6.S1': 'no related skill met by this week: equivalent fractions and number lines of fractions come later (rule 19)',
  'Y3.B6.S7': 'no related skill met by W18: equivalence (W37) comes later (rule 19)',
  'Y3.B7.S8': 'no related skill: litres-and-millilitres conversion (W34) uses decimal litres in the only skill (rule 18)',
  'Y3.B11.S4': 'no related skill met by W23: angles and parallel or perpendicular lines come in W28-W29 (rule 19)',
};
for (const [id, n] of Object.entries(NOREL3)) r3[id] = { ...(r3[id] || {}), relNote: n };
r3['Y2.B5.S1'] = { ...(r3['Y2.B5.S1'] || {}), relNote: 'no related skill beyond the pre list: in school order the 5 and 10 times-tables (W26) come before this step (W27), so they are pre; sharing and grouping are pre' };
r3['Y2.B9.S1'] = { ...(r3['Y2.B9.S1'] || {}), related: [], relNote: 'no related skill met by this week: quarter past and to (W36) and 5-minute times (W37) come later (rule 19); half of a shape and clock parts are pre' };

// ======================= round 6 (critic Y2-Y3 r5: marker blind spots, S11 stale whys, direct never-in-grade) =======
for (const Y of ['Y2', 'Y3']) { linkOpts[Y]['measurement:estimate_length'] = { forms: [0] }; markerFix[Y]['measurement:estimate_length'] = [{ opts: { forms: [0] } }]; }
linkSwap.Y3['multiplication:mult_properties'] = { to: null, preBuild: 'props_tables' };   // no table option: ×6/×7 splits
linkSwap.Y3['multiplication:mult_div_fact_family'] = { to: 'multiplication:mult_facts', opts: { constant: [2, 3, 4, 5, 8, 10], band: 100 } };
markerFix.Y3['multiplication:mult_zeros'] = [{ opts: { forms: [0] } }];
markerFix.Y3['multiplication:nl_mult'] = [{ opts: { constant: [3], band: 50 } }, { opts: { constant: [4], band: 50 } }, ...markerFix.Y3['multiplication:nl_mult']];
markerFix.Y3['measurement:money_change'] = [{ opts: { currency: 'usd', step: 100, paid: 'note', band: 2000 } }];
Object.assign(linkFix, {
  'Y2.B1.S11': { 'measurement:estimate_length': null }, 'Y3.B11.S4': { ...(linkFix['Y3.B11.S4'] || {}), 'measurement:estimate_length': null },
  'Y3.B3.S7': { 'multiplication:mult_zeros': { forms: [0] } },
  'Y3.B3.S8': { 'multiplication:nl_mult': { constant: [3], band: 50 } }, 'Y3.B3.S9': { 'multiplication:nl_mult': { constant: [4], band: 50 } }, 'Y3.B3.S11': { 'multiplication:nl_mult': { constant: [4], band: 50 } },
  'Y3.B3.S4': { 'multiplication:count_by_tables': ZR(5, 10) }, 'Y3.B3.S13': { 'multiplication:count_by_tables': ZR(8) },
  'Y3.B2.S19': { 'measurement:money_change': { currency: 'usd', step: 100, paid: 'note', band: 2000 } },
  'Y3.B6.S4': { 'shapes_early:shape_corners_count': null, 'shapes_early:count_sides_vertices_2d': null },
  'Y3.B7.S3': { ...(linkFix['Y3.B7.S3'] || {}), 'measurement:length_metric': { forms: [1] } }, 'Y3.B7.S4': { 'measurement:length_metric': { forms: [1] } },
  'Y3.B1.S13': { 'measurement:order_clocks_digital_asc': null },
});
const NN = (id, keys, extra = {}) => { r3[id] = { ...(r3[id] || {}), neverNamed: keys, ...extra }; };
NN('Y2.B3.S7', ['shapes_early:compose_from_attributes'], { partials: [P('shapes_early:compose_from_attributes', 'sorts by attributes that include right angles and parallel sides ("4 right angles", "no parallel sides"), which Grade 1 never meets; sorting 2-D shapes into labelled groups by number of sides or corners is not dealt')] });
NN('Y3.B4.S2', ['multiplication:mult_zeros'], { direct: [], partials: [P('multiplication:mult_zeros', 'related calculations with a multiple of 10 (3 × 4 = 12, so 30 × 4 = 120) are dealt, but ×6, ×7 and ×9 facts beyond the Grade 2 tables appear too (7 × 60, 70 × 7, 3 × 60); a page on the 2, 3, 4, 5, 8 and 10 tables only is not available')], verdict: 'partial', build: ['zeros_tables'] });
NN('Y3.B4.S3', ['multiplication:mult_properties']); NN('Y3.B4.S4', ['multiplication:multiply', 'multiplication:area_model_mult']); NN('Y3.B4.S5', ['multiplication:multiply', 'multiplication:area_model_mult']);
NN('Y3.B7.S9', ['measurement:capacity']); NN('Y3.B8.S5', ['fractions:fraction_of_set_nv'], { note: 'fraction_of_set_nv: the only beyond-grade hit is a "10 ÷ 6" distractor among the choices' });
NN('Y3.B4.S6', ['division:missing_mult_div', 'multiplication:mult_div_fact_family'], { direct: [], partials: [
  P('division:missing_mult_div', 'missing-number × and ÷ sentences, but ÷6, ÷7, ÷9, ×11 and ÷12 items beyond the Grade 2 tables appear (84 ÷ 7, 7 × 11, ___ × 6 = 72, 108 ÷ 12)'),
  P('multiplication:mult_div_fact_family', 'fact families, but with ×6, ×7, ×9 and ×11 facts (6, 7, 42; 9, 11, 99) beyond the Grade 2 tables')], verdict: 'partial', build: ['muldiv_tables'] });
NN('Y3.B4.S10', ['multiplication:mult_comparison'], { direct: [], partials: [P('multiplication:mult_comparison', '"times as many" stories, but with ×6, ×7 and ×9 facts (6 times as many as 6; 63 is 9 times as many) beyond the Grade 2 tables')], verdict: 'partial', build: ['comparison_tables'] });
Object.assign(proposals, {
  zeros_tables: { kind: 'option', skill: 'multiplication:mult_zeros', option: 'constant: the single-digit factor from the 2, 3, 4, 5, 8 and 10 tables only', name: 'Related Calculations Within the Grade 2 Tables (option)',
    teaches: 'using a known table fact to multiply a multiple of 10 (3 × 4 = 12, so 30 × 4 = 120), with facts from the Grade 2 tables only',
    representation: 'the existing two-line cell: the known fact above, the related calculation below with base-10 rods; answer box', family: 'operations', steps: ['Y3.B4.S2'], ccss: ['3.NBT.A.3'], why: 'mult_zeros form 2 deals 70 × 7 and 3 × 60' },
  muldiv_tables: { kind: 'option', skill: 'division:missing_mult_div', skills: ['division:missing_mult_div', 'multiplication:mult_div_fact_family'], option: 'constant: the 2, 3, 4, 5, 8 and 10 tables only', name: 'Link × and ÷ Within the Grade 2 Tables (option)',
    teaches: 'writing the multiplication and division facts of one array or fact family (4 × 5 = 20, 20 ÷ 4 = 5) and finding a missing factor, using the Grade 2 tables only',
    representation: 'the existing fact-family cell (three numbers in a triangle, four sentences to complete) and missing-number sentences', family: 'operations', steps: ['Y3.B4.S6'], ccss: ['3.OA.B.6', '3.OA.C.7'], why: 'both skills deal ×6, ×7, ×9, ×11 and ÷12 facts (84 ÷ 7, 9, 11, 99); `range` is ignored' },
  comparison_tables: { kind: 'option', skill: 'multiplication:mult_comparison', option: 'constant: the scale factor from 2, 3, 4, 5, 8 and 10 only', name: 'Scaling Within the Grade 2 Tables (option)',
    teaches: 'solving "times as many / times as long" stories with a scale factor from the Grade 2 tables (4 times as many as 5)',
    representation: 'the existing story cell with a bar model of the two amounts; answer box', family: 'operations', steps: ['Y3.B4.S10'], ccss: ['3.OA.A.3'], why: 'mult_comparison deals 6 times as many as 6 and 63 = 9 × 7' },
});
// step fixes
Object.assign(r3, {
  'Y2.B9.S6': { ...r3['Y2.B9.S6'], core: [C(CBT, 'Y2.B1.S15 counting in 5s from 0: 12 fives make the 60 minutes (xlsx W23 prior learning)', ZR(5))] },
  'Y2.B8.S12': { ...(r3['Y2.B8.S12'] || {}), partials: [P('fractions:equiv_frac_visual', 'denoms [2] is the halves family: it deals 3/4 = 12/16, sixths, twelfths and eighths (and 5/3 choices); a page of 1/2 = 2/4 only is not available', { denoms: [2] })] },
  'Y2.B8.S13': { ...(r3['Y2.B8.S13'] || {}), partials: [P('shapes_early:partition_shapes', 'quarters shapes: shades 1/4, 2/4 and 3/4, not three-quarters alone', { parts: [2] }), P('fractions:identify', 'denoms [2] is the halves family: it deals eighths (1/8, 7/8) and fifths among the choices (2/5), not 3/4 alone', { denoms: [2] })] },
  'Y3.B4.S4': { ...r3['Y3.B4.S4'], neverNamed: ['multiplication:multiply', 'multiplication:area_model_mult'], dropPre: ['division:div_remainders'],
    core: [C('multiplication:mult_zeros', 'Y3.B4.S1 / Y3.B4.S2 multiples of 10 and related calculations: 20 × 3', { forms: [0, 2] }), C('placevalue:expand', 'Y2.B1.S8 / Y3.B1.S6 partitioning into tens and ones: 23 × 3 = 20 × 3 + 3 × 3', { band: 99 })] },
  'Y3.B4.S7': { ...r3['Y3.B4.S7'], core: [C('division:div_facts', 'Y3.B3.S7 / S10 / S13 dividing by 3, 4 and 8', { constant: [3, 4, 8] })] },
  'Y3.B2.S21': { ...(r3['Y3.B2.S21'] || {}), core: [C('addition:add_sub_fact_family', 'Y2.B2.S2 fact families: the inverse as a fact family', { range: 100 }), C('subtraction:missing_add_sub', 'Y2.B2.S21 missing-number problems'), C('addition:cloze_addition', 'Y2.B2.S21 missing-number additions')] },
  'Y3.B6.S1': { ...(r3['Y3.B6.S1'] || {}), relNote: undefined, related: [R('fractions:write_fraction', 'the numerator of a non-unit fraction (Y3.B6.S3, the same week): the next idea', { denoms: [2, 3] })] },
  'Y3.B7.S4': { ...(r3['Y3.B7.S4'] || {}), relNote: 'no related skill: the same exchange with capacity (l ↔ ml, W34) has no whole-number skill yet (metric_mass_capacity); capacity reads decimal litres' },
  'Y3.B1.S13': { ...(r3['Y3.B1.S13'] || {}), relOnly: true, related: [R('number_sense:place_on_number_line', 'placing the numbers on a 0-1,000 line shows their order', { span: 100, band: 1000 })], relNote: undefined },
});
const DIVP = R('division:area_model_div_2by1', 'the inverse: dividing by partitioning (Y3.B4.S8)', { constant: [2, 3, 4, 5, 8] });
Object.assign(relR3, {
  'Y3.B6.S1': [R('composing:compose_whole', 'how many unit fractions make one whole (Y3.B6.S4)')],
  'Y3.B4.S1': [R('multiplication:mult_chart_easy', 'the 10 row of a times-table chart', { constant: [10], band: 100 }), R('placevalue:unit_form', '12 tens = 120: the same multiple of 10 as place value', { band: 999 })],
  'Y3.B4.S2': [R('placevalue:unit_form', '4 × 3 tens = 12 tens = 120: the same calculation as place value', { band: 999 }), DIVP],
  'Y3.B4.S4': [DIVP], 'Y3.B4.S5': [DIVP],
});
r3['Y3.B1.S13'] = { ...r3['Y3.B1.S13'], related: [], relNote: 'no related skill: the number line to 1,000 (the other way to see the order) is earlier learning listed as pre; ordering other kinds of numbers is above Grade 2' };
// teacher-facing wording for a skill that a swap puts in place of another (descWhy)
export const whyText = { 'measurement:time_half_hour': 'half past: the minute hand makes a half turn of the clock', 'shapes_early:partition_shapes': 'equal parts of a shape' };
linkFix['Y3.B2.S19'] = { 'measurement:money_change': null };
r3['Y3.B3.S12'] = { ...(r3['Y3.B3.S12'] || {}), core: [C('multiplication:mult_facts', 'Y3.B3.S9 multiplying by 4: double the 4 times-table to get the 8s', { constant: [4] })] };
r3['Y3.B3.S12'] = { ...(r3['Y3.B3.S12'] || {}), core: [C(CBT, 'Y3.B3.S11 counting in 4s from 0: double each multiple of 4 to count in 8s', ZR(4))] };
linkFix['Y3.B11.S1'] = { 'measurement:reading_ruler': null };

// ======================= round 7 (critic Y2-Y3 r6: inch ruler, skip counts, ÷ payloads, hand whys) =======================
// B. links. reading_ruler draws an INCH ruler (80/80 items): never a pre for a metric step; the cm ruler is ruler_cm (to build)
for (const Y of ['Y2', 'Y3']) {
  linkSwap[Y]['measurement:reading_ruler'] = { to: null, preBuild: 'ruler_cm' };
  linkSwap[Y]['measurement:reading_ruler_hard'] = { to: null };
}
linkSwap.Y3['fraction_operations:mult_frac_whole'] = { to: null };
linkSwap.Y3['division:div_word_problems'] = { to: null }; // its payloads deal 42 ÷ 6, 49 ÷ 7 (never at Grade 2) and ÷3/4/8 at W9
linkSwap.Y2['patterns:skip_count_line'] = { to: 'patterns:skip_count_line', opts: { step: [0], band: 50 } }; // 2s and 5s only
linkSwap.Y3['patterns:skip_count_line'] = { to: null };
// Y2 B8 (W16-W18): equal_or_unequal_groups answers "multiply / add" ten weeks before × (W26): compare groups instead
linkSwap.Y2['multiplication:equal_or_unequal_groups'] = { to: 'comparing:compare_groups', opts: {}, only: /^Y2\.B8\./ };
ladders.length = [C('shapes_early:measure_nonstandard', 'Y1.B7.S2 measuring with cubes and paper clips'), C('comparing:compare_objects', 'Y1.B7.S1 comparing lengths and heights'),
  C('number_sense:place_on_number_line', 'Y2.B1.S9 a ruler is a number line marked in equal steps', { span: 10, band: 100 }), C('measurement:length_metric', 'Y3.B5.S5 m and cm: 1 m = 100 cm', { forms: [1] }), C('measurement:length_metric', 'Y3.B5.S6 cm and mm: 1 cm = 10 mm', { forms: [0] })];
ladders.frac = ladders.frac.map((l) => l.key === 'multiplication:equal_or_unequal_groups' ? C('comparing:compare_groups', 'Y1.B1.S12 more, fewer, the same: comparing groups (K)') : l);
Object.assign(linkFix, {
  'Y2.B5.S6': { 'patterns:skip_count_line': null }, 'Y2.B5.S7': { 'patterns:skip_count_line': null }, 'Y2.B5.S8': { 'patterns:skip_count_line': null },
  'Y2.B5.S10': { 'patterns:skip_count_line': null }, 'Y2.B5.S11': { 'patterns:skip_count_line': null }, 'Y2.B5.S12': { ...(linkFix['Y2.B5.S12'] || {}), 'patterns:skip_count_line': null },
  'Y2.B1.S16': { 'patterns:skip_count_line': null },
  'Y2.B1.S11': { ...linkFix['Y2.B1.S11'], 'composing:number_word_form': null },
  'Y3.B5.S2': { 'measurement:reading_ruler_hard': null },
});
// the B6.S2-S5 / B5 measuring steps: refill pre from metric skills (ladder) after the inch ruler leaves
for (const id of ['Y2.B6.S2', 'Y2.B6.S3', 'Y2.B6.S4', 'Y2.B6.S5']) r3[id] = { ...(r3[id] || {}), core: [C('shapes_early:measure_nonstandard', 'Y1.B7.S2 measuring with cubes and paper clips'), C('number_sense:place_on_number_line', 'Y2.B1.S9 a ruler is a number line marked in equal steps', { span: 10, band: 100 })] };
relR3['Y2.B2.S13'] = [R(CBT, 'counting in 10s from 0: the same jump of 10', ZR(10)), HCF, BT];
relR3['Y2.B2.S14'] = [R(CBT, 'counting in 10s from 0: adding a 10 is the next count', ZR(10)), HCF, BT];
relR3['Y2.B1.S15'] = [R('patterns:seq_10', 'counting on in 10s from any number, the next idea', { band: 100 }), R('patterns:skip_count_line', 'counting in 2s and 5s as jumps on a number line', { step: [0], band: 50 })];
relR3['Y2.B5.S17'] = [R('patterns:skip_count_line', 'counting in 5s as jumps on a number line', { step: [0], band: 50 }), R('measurement:money_count', 'counting 5-cent and 10-cent coins', { currency: 'usd' })];
// C. verdicts and clauses
Object.assign(r3, {
  'Y3.B3.S5': { direct: [D('division:share_into_groups')], partials: [P('division:div_word_problems', 'sharing and grouping stories, but ÷6 and ÷7 facts beyond the Grade 2 tables appear (42 ÷ 6, 36 ÷ 6, 49 ÷ 7)')], verdict: 'partial', build: ['muldiv_tables'], neverNamed: ['division:div_word_problems'] },
  'Y3.B5.S2': { partials: [P('measurement:reading_ruler', 'reads an INCH ruler (whole inches); a ruler marked in cm and mm, and measuring in millimetres, are not dealt')], build: ['ruler_cm'], neverNamed: ['measurement:reading_ruler'],
    related: [R('measurement:estimate_length', 'about how long is it? estimating a length in metric units', { forms: [0] })] },
  'Y3.B11.S4': { ...(r3['Y3.B11.S4'] || {}), partials: [P('measurement:reading_ruler', 'reads an INCH ruler; drawing a line of a given length and measuring in mm are not dealt')], build: ['draw_measure'], neverNamed: ['measurement:reading_ruler'] },
  'Y2.B6.S1': { ...(r3['Y2.B6.S1'] || {}), neverNamed: ['measurement:reading_ruler'] },
  'Y3.B6.S1': { ...(r3['Y3.B6.S1'] || {}), direct: [], partials: [P('fractions:identify', 'names fractions of shapes, but most items are non-unit fractions or ask for the numerator ("the numerator of 5/9"), which is Y3.B6.S3; a page of unit fractions (1/2, 1/3, 1/4, 1/5) is not available'), P('fractions:write_fraction', 'writes the fraction shaded, but non-unit fractions (3/5, 2/3) are most of the items; unit fractions only are not available')], verdict: 'partial', build: ['single_fraction'] },
  // D. pre rank
  'Y3.B4.S4': { ...r3['Y3.B4.S4'], core: [...r3['Y3.B4.S4'].core, C('multiplication:mult_facts', 'Y3.B3.S8 / S11 / S12 the 3, 4 and 8 times-tables', { constant: [3, 4, 8] })], dropPre: ['division:div_remainders', 'division:div_facts', 'patterns:halve'] },
  'Y3.B4.S5': { ...r3['Y3.B4.S5'], core: [...(r3['Y3.B4.S5'].core || []), C('multiplication:mult_facts', 'Y3.B3.S8 / S11 / S12 the 3, 4 and 8 times-tables', { constant: [3, 4, 8] })], dropPre: ['division:div_facts', 'patterns:halve'] },
  'Y3.B4.S6': { ...r3['Y3.B4.S6'], core: [C('multiplication:mult_facts', 'Y3.B3.S15 the 2, 3, 4, 5, 8 and 10 times-tables', { constant: [2, 3, 4, 5, 8, 10], band: 100 }), C('division:div_facts', 'Y3.B3.S7 / S10 / S13 dividing by 2, 3, 4, 5, 8 and 10', { constant: [2, 3, 4, 5, 8, 10], band: 100 }), C('division:share_into_groups', 'Y3.B3.S5 sharing and grouping')], dropPre: ['patterns:double', 'patterns:halve'] },
  'Y3.B4.S8': { ...r3['Y3.B4.S8'], core: [C('division:box_division_easy', 'Y3.B4.S7 dividing a 2-digit number with no exchange', { regroup: 'none', constant: [2, 3, 4, 5, 8] }), C('division:div_facts', 'Y3.B3.S7 / S10 / S13 dividing by 3, 4 and 8', { constant: [3, 4, 8] })] },
  'Y3.B4.S2': { ...r3['Y3.B4.S2'], core: [C('multiplication:mult_facts', 'Y3.B3.S15 the 2, 3, 4, 5, 8 and 10 times-tables: the known fact', { constant: [2, 3, 4, 5, 8, 10], band: 100 }), C('placevalue:unit_form', 'Y3.B1.S8 hundreds, tens and ones: 12 tens = 120', { band: 999 })] },
  'Y2.B3.S7': { ...r3['Y2.B3.S7'], core: [C('shapes_early:count_sides_vertices_2d', 'Y2.B3.S2 counting the sides of 2-D shapes', { forms: [0] }), C('shapes_early:shape_corners_count', 'Y2.B3.S3 counting corners'), C('shapes_early:name_2d_shapes', 'Y1.B3.S3 naming 2-D shapes')], dropPre: ['shapes_early:name_3d_shapes', 'shapes_early:shape_name_match_3d'] },
  'Y2.B1.S11': { ...(r3['Y2.B1.S11'] || {}), core: [C('patterns:seq_10', 'Y1.B12.S2 / Y2.B1.S15 counting in 10s: the tens on the line', { band: 100 }), C('counting:number_seq_fill', 'Y1.B12.S1 counting to 100 in order', { range: 100 })], dropPre: ['composing:number_word_form'] },
  // E. small fixes
  'Y2.B8.S13': { ...r3['Y2.B8.S13'], relOnly: true, related: [], relNote: 'no related skill met by W17: three-quarters of a turn on the clock (quarter to) comes in W36 (rule 19)' },
  'Y2.B1.S16': { ...(r3['Y2.B1.S16'] || {}), relOnly: true, related: [], relNote: 'no related skill: the only number-line skip count deals 4s and 6s with the 3s (beyond Grade 1); counting in 2s, 5s and 10s is pre' },
  'Y3.B1.S14': { ...(r3['Y3.B1.S14'] || {}), relOnly: true, related: [], relNote: 'no related skill: the number-line skip count deals 6s and 25s, never 50s; counting in 10s and 100s is pre' },
});
// muldiv_tables now also closes Y3.B3.S5 (div_word_problems); single_fraction gets a unit-fractions page for Y3.B6.S1
proposals.muldiv_tables.skills.push('division:div_word_problems'); proposals.muldiv_tables.steps.push('Y3.B3.S5');
proposals.muldiv_tables.teaches += '; sharing and grouping stories use the same tables';
proposals.single_fraction.option += '; unit_only: unit fractions only (1/2, 1/3, 1/4, 1/5, 1/8)';
proposals.single_fraction.steps.push('Y3.B6.S1');
whyText['measurement:mass_volume_liquid'] = 'reading a scale in mL';
Object.assign(linkFix, { 'Y2.B2.S13': { 'multiplication:count_by_tables': ZR(10) }, 'Y2.B2.S14': { 'multiplication:count_by_tables': ZR(10) } });
Object.assign(whyText, {
  'patterns:skip_count_line': 'counting in equal jumps along a line', 'subtraction:nl_sub': 'counting back in jumps along a line', 'division:nl_div': 'dividing as equal jumps back along a line',
  'multiplication:mult_chart_easy': 'filling the missing products in a times-table chart', 'measurement:length_metric': 'converting metric lengths', 'graphs:pictograph': 'reading a picture graph with a key',
});
r3['Y3.B12.S1'] = { ...(r3['Y3.B12.S1'] || {}), direct: [D('graphs:pictograph', { scale: [0, 1, 2] })], note: 'scale [0,1,2]: keys of 2, 5 and 10 (scale 3 is a key of 25)' };
r3['Y3.B4.S1'] = { ...r3['Y3.B4.S1'], core: [...r3['Y3.B4.S1'].core, C(CBT, 'Y2.B1.S15 counting in 10s from 0', ZR(10))] };
Object.assign(relR3, {
  'Y3.B3.S1': [R('multiplication:mult_word_problems', 'x', {})].slice(0, 0).concat([R('multiplication:nl_mult', 'equal groups as equal jumps along a line', { constant: [2, 5, 10], band: 50 })]),
  'Y3.B3.S2': [R('multiplication:nl_mult', 'the same product as equal jumps along a line', { constant: [2, 5, 10], band: 50 })],
  'Y3.B3.S4': [R('measurement:money_count', 'counting nickels and dimes: multiples of 5 and 10', { currency: 'usd', kind: 'like' })],
});
r3['Y3.B3.S3'] = { ...(r3['Y3.B3.S3'] || {}), partials: [P('number_theory:multiples', 'lists multiples, but of any number to 12 (multiples of 6, 7, 9: "7, 14, 21 …", beyond the Grade 2 tables); multiples of 2 as the even numbers to 100 are not a page of their own')], neverNamed: ['number_theory:multiples'] };
r3['Y3.B3.S4'] = { ...(r3['Y3.B3.S4'] || {}), partials: [P('number_theory:multiples', 'lists multiples, but of any number to 12 (multiples of 6, 7, 9: "7, 14, 21 …", beyond the Grade 2 tables); a page of multiples of 5 and 10 only is not available')], neverNamed: ['number_theory:multiples'] };
Object.assign(linkFix, { 'Y3.B3.S7': { ...linkFix['Y3.B3.S7'], 'division:nl_div': { constant: [3], band: 50 } }, 'Y3.B3.S10': { ...linkFix['Y3.B3.S10'], 'division:nl_div': { constant: [4], band: 50 } } });
r3['Y3.B4.S1'] = { ...r3['Y3.B4.S1'], core: [...r3['Y3.B4.S1'].core, C('placevalue:more_less_10', 'Y2.B2.S13 10 more, 10 less', { step: 10 })] };
// seq_10 {band:100} deals 99, 109, 119, 129 (past 100 at W03): band 50 keeps it inside what the pupil has met
r3['Y2.B1.S11'].core = [C('patterns:seq_10', 'Y1.B12.S2 / Y2.B1.S15 counting in 10s: the tens on the line', { band: 50 }), C('counting:number_seq_fill', 'Y1.B12.S1 counting to 100 in order', { range: 100 })];

// ======================= round 8 (critic Y2-Y3 r7: S13 school-week related, S12 whys, rule-14 ladders) =======================
Object.assign(whyText, {
  'multiplication:count_by_tables': 'counting in equal steps from 0', 'placevalue:unit_form': 'a number as hundreds, tens and ones', 'placevalue:expand': 'a number split into its parts (expanded form)',
  'patterns:double': 'doubling', 'patterns:halve': 'halving', 'counting:number_seq_fill': 'filling in the missing numbers of a number track', 'counting:count_objects': 'counting objects one by one',
  'measurement:pictograph_intro': 'reading a picture graph where one picture is one', 'placevalue:order_least_to_greatest': 'putting numbers in order, smallest first',
  'placevalue:order_greatest_to_least': 'putting numbers in order, greatest first', 'division:div_facts': 'division facts', 'multiplication:mult_facts': 'multiplication facts',
  'placevalue:more_less_100': '10 or 100 more or less', 'placevalue:more_less_10': '1 or 10 more or less', 'multiplication:repeated_add_to_mult': 'adding equal groups, written as a multiplication',
  'patterns:seq_10': 'counting on in 10s', 'patterns:seq_5': 'counting on in 5s', 'patterns:seq_2': 'counting on in 2s', 'placevalue:compare': 'comparing two numbers with <, > or =',
  'shapes_early:name_2d_shapes': 'naming 2-D shapes', 'shapes_early:name_3d_shapes': 'naming 3-D shapes', 'measurement:time_quarter': 'telling the time to quarter past and quarter to',
  'measurement:money_count': 'counting coins and bills', 'number_sense:place_on_number_line': 'placing numbers on a number line',
});
r3['Y2.B4.S9'] = { ...r3['Y2.B4.S9'], core: [C('subtraction:sub_wp_100', 'Y2.B2.S19 take-away stories: change is a subtraction')] };
r3['Y3.B4.S2'] = { ...r3['Y3.B4.S2'], core: [C('multiplication:mult_facts', 'Y3.B3.S8 / S11 and Y2.B5: the known fact (3 × 4 = 12)', { constant: [2, 3, 4, 5, 10] }), C('placevalue:unit_form', 'Y3.B1.S8 hundreds, tens and ones: 12 tens = 120', { band: 999 })], dropPre: ['division:share_into_groups'] };
// ---- round 8 step fixes ----
const ZR1 = (n) => ZR(n);
Object.assign(r3, {
  'Y2.B4.S8': { ...(r3['Y2.B4.S8'] || {}), core: [C('measurement:money_change', 'Y2.B4.S9 Find change (W12): change from a dollar', { currency: 'usd', step: 100, paid: 'note', band: 2000 })],
    related: [R('measurement:enough_money', 'is there enough to make a dollar?', { currency: 'usd' })] },
  'Y2.B4.S4': { ...r3['Y2.B4.S4'], core: [...r3['Y2.B4.S4'].core, C('measurement:money_compare', 'Y2.B4.S6 comparing two amounts of money (W8)')] },
  'Y2.B4.S5': { ...(r3['Y2.B4.S5'] || {}), core: [C('measurement:money_compare', 'Y2.B4.S6 comparing two amounts of money (W8)')] },
  'Y2.B1.S7': { ...(r3['Y2.B1.S7'] || {}), core: [C('placevalue:expand', 'Y2.B1.S5 partitioning a number into tens and ones', { band: 99 }), C('placevalue:unit_form', 'Y2.B1.S5 the same number as tens and ones', { band: 99 }), C('composing:base10_build', 'Y2.B1.S3 tens and ones with base-10 blocks', { band: 99 })], dropPre: ['composing:number_word_form'] },
  'Y3.B3.S14': { ...(r3['Y3.B3.S14'] || {}), core: [C('multiplication:mult_facts', 'Y3.B3.S11 the 4 times-table (W11): double each fact for the 8s', { constant: [4] }), C('patterns:double', 'doubling a 4s fact gives the 8s fact', { band: 50 })] },
  'Y3.B3.S15': { ...(r3['Y3.B3.S15'] || {}), core: [C('multiplication:mult_facts', 'Y3.B3.S11 the 4 times-table (W11): double each fact for the 8s', { constant: [4] }), C('patterns:double', 'doubling links the 2, 4 and 8 tables', { band: 50 })] },
  'Y3.B3.S9': { ...(r3['Y3.B3.S9'] || {}), core: [C('multiplication:mult_facts', 'Y2.B5.S9 the 2 times-table: × 4 is double × 2', { constant: [2] }), C(CBT, 'Y2.B1.S15 counting in 2s from 0', ZR(2))] },
  'Y3.B3.S3': { ...(r3['Y3.B3.S3'] || {}), core: [C(CBT, 'Y2.B1.S15 counting in 2s from 0: the multiples of 2', ZR(2)), C('multiplication:mult_facts', 'Y2.B5.S9 the 2 times-table', { constant: [2] })], dropPre: ['addition:add_wp_100', 'subtraction:sub_wp_100', 'addition:cloze_addition', 'subtraction:missing_add_sub'] },
  'Y3.B5.S1': { ...(r3['Y3.B5.S1'] || {}), core: [C('number_sense:place_on_number_line', 'Y2.B1.S10 a ruler is a number line marked in equal steps', { span: 10, band: 100 }), C(CBT, 'Y2.B1.S15 counting in 10s: 100 cm make 1 m', ZR(10))] },
  'Y3.B5.S3': { ...(r3['Y3.B5.S3'] || {}), core: [C('number_sense:place_on_number_line', 'Y2.B1.S10 a ruler is a number line marked in equal steps', { span: 10, band: 100 }), C(CBT, 'Y2.B1.S15 counting in 10s: 10 mm make 1 cm', ZR(10))] },
  'Y3.B5.S5': { ...(r3['Y3.B5.S5'] || {}), core: [C('placevalue:unit_form', 'Y3.B1.S8 hundreds, tens and ones: 1 m = 100 cm is the same exchange as 1 hundred = 100 ones', { band: 999 }), C(CBT, 'Y3.B1.S4 counting in 100s from 0: 1 m, 2 m, 3 m in cm', ZR(100))] },
  'Y3.B5.S10': { ...(r3['Y3.B5.S10'] || {}), core: [C('shapes_early:count_sides_vertices_2d', 'Y2.B3.S2 counting the sides of a shape', { forms: [0] }), C('addition:add_three', 'Y2.B2.S7 adding three numbers: the sides added in turn'), C('measurement:length_metric', 'Y3.B5.S6 cm and mm', { forms: [0] })] },
  'Y3.B11.S4': { ...(r3['Y3.B11.S4'] || {}), preOnly: true, pre: [R('measurement:length_metric', 'Y3.B5.S6 cm and mm: 1 cm = 10 mm', { forms: [0] }), R('number_sense:place_on_number_line', 'Y2.B1.S10 a ruler is a number line marked in equal steps', { span: 10, band: 100 }), R('shapes_early:measure_nonstandard', 'Y1.B7.S2 measuring with cubes and paper clips'), R(CBT, 'Y2.B1.S15 counting in 2s, 5s and 10s from 0', ZR(2, 5, 10))] },
  'Y3.B11.S6': { ...(r3['Y3.B11.S6'] || {}), related: [R('shapes_early:compose_from_attributes', 'sorting shapes by parallel sides and right angles (the same week)')] },
  'Y3.B3.S4': { ...(r3['Y3.B3.S4'] || {}), related: [R('measurement:money_count', 'counting coins of one kind: pennies, and nickels, dimes and quarters, which are multiples of 5', { currency: 'usd', kind: 'like' })] },
  'Y3.B1.S14': { ...(r3['Y3.B1.S14'] || {}), preOnly: true, pre: [R('patterns:seq_10', 'Y2.B1.S15 counting in 10s'), R('multiplication:mult_facts', 'Y2.B5.S15 the 5 times-table: 50 is 5 tens', { constant: [5] }), R('placevalue:more_less_100', 'Y3.B1.S4 counting in 100s: 100 is two 50s', { step: 100 })] },
  'Y2.B5.S12': { ...(r3['Y2.B5.S12'] || {}) },
});
relR3['Y2.B5.S12'] = [R('counting:number_seq_fill', 'counting in 2s along a number track: the even and odd numbers in order', { step: 2, range: 20 })];
linkFix['Y3.B7.S3'] = { ...linkFix['Y3.B7.S3'], 'multiplication:count_by_tables': ZR(100) };
extraPre['Y3.B7.S3'] = [R('measurement:heavier_lighter_visual', 'Y2.B7.S1 heavier and lighter'), R('multiplication:count_by_tables', 'counting in 100s to read a kg scale marked in 100 g', ZR(100))];
const RN = (id, n) => { r3[id] = { ...(r3[id] || {}), relNote: n }; };
const LATER = 'no related skill: by school week the skills that share this idea are taught earlier (they are pre), and no later step on the same topic adds a new skill';
for (const id of ['Y2.B2.S4', 'Y2.B3.S1', 'Y2.B3.S6', 'Y2.B5.S2', 'Y2.B5.S3', 'Y2.B5.S4', 'Y2.B5.S5', 'Y2.B5.S14', 'Y2.B5.S16', 'Y2.B7.S2', 'Y2.B7.S3', 'Y2.B7.S6', 'Y2.B7.S7',
  'Y3.B1.S3', 'Y3.B1.S10', 'Y3.B1.S11', 'Y3.B2.S1', 'Y3.B3.S6', 'Y3.B4.S6', 'Y3.B6.S4', 'Y3.B6.S6', 'Y3.B11.S2', 'Y3.B11.S8']) RN(id, LATER);
extraPre['Y3.B3.S14'] = [];
const FNL = [C('composing:fraction_number_line', 'Y3.B6.S7 fractions on a number line (taught earlier, W18)'), C('fractions:graph_fractions', 'Y3.B6.S7 placing a fraction on a number line (taught earlier, W18)', { denoms: [2, 3] })];
for (const id of ['Y3.B6.S2', 'Y3.B6.S3', 'Y3.B6.S4', 'Y3.B6.S5', 'Y3.B6.S6']) r3[id] = { ...(r3[id] || {}), core: [...((r3[id] || {}).core || []), ...FNL] };
r3['Y3.B3.S4'] = { ...r3['Y3.B3.S4'], core: [C(CBT, 'Y2.B1.S15 and Y2.B5.S17 counting in 5s and 10s from 0: the multiples of 5 and 10', ZR(5, 10))] };
Object.assign(whyText, { 'subtraction:sub_10_regroup': 'subtracting ones across 10 (within 20)', 'addition:add_10_regroup': 'adding ones across 10 (within 20)',
  'multiplication:mult_zeros': 'multiplying by 10 and by multiples of 10', 'measurement:estimate_length': 'estimating a length' });
r3['Y3.B11.S6'] = { ...r3['Y3.B11.S6'], core: [C('shapes_early:name_2d_shapes', 'Y3.B11.S7 recognising and describing 2-D shapes (taught earlier, W27)'), C('shapes_early:name_3d_shapes', 'Y3.B11.S9 recognising 3-D shapes (taught earlier, W28)'), C('shapes_early:count_edges_faces_vertices', 'Y3.B11.S9 faces, edges and vertices of 3-D shapes (taught earlier, W28)')] };
