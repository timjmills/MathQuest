# ───────────────────────── Block 8: Decimals A ─────────────────────────
S(id='Y4.B8.S1',
  partial=[('fractions:write_fraction{"denoms":[5]}', 'tenths are mixed with fifths and hundredths; no tenths-only page and no counting in tenths past 1')],
  verdict='partial', missing='tenths only: a whole cut into 10 equal parts, writing n/10, and counting in tenths on a line past 1',
  build=['tenths_only', 'frac_count'],
  pre=[('fractions:identify', 'Y3.B6.S1', 'P'), ('fractions:shade_fraction', 'Y3.B6.S3', 'P'), ('composing:fraction_number_line', 'Y3.B6.S7', 'L'),
       ('shapes_early:partition_shapes', 'Y1.B10.S1', 'P'), ('composing:compose_whole', 'Y4.B7.S1', 'L')],
  related=[('conversions:d_to_f', 'the same tenth as a decimal (next step)'), ('fraction_operations:frac_10_100', 'tenths as hundredths (Y4.B8.S7)'),
           ('decimals:decimal_nl_drag', 'tenths on a line')],
  note='frac_10_100 (tenths written as hundredths) is the hundredths step, not this one: tag fix.')

S(id='Y4.B8.S2',
  partial=[('conversions:f_to_d{"denoms":[5]}', 'mixes fifths and hundredths with tenths; no tenths model'),
           ('conversions:d_to_f', 'mixes fifths (0.6 = 3/5); no tenths-only page')],
  verdict='partial', missing='tenths only, both ways (3/10 = 0.3), with a tenths strip, including numbers past 1 (1.3)',
  build=['dec_fraction_basics'],
  pre=[('fractions:write_fraction{"denoms":[5]}', 'Y4.B8.S1', 'B'), ('placevalue:value', 'Y2.B1.S4', 'P'),
       ('composing:fraction_number_line', 'Y3.B6.S7', 'P'), ('composing:ten_frame_build', 'Y1.B4.S2', 'P')],
  preBuild=['tenths_only'],
  related=[('decimals:decimal_nl_drag', 'tenths on a number line (Y4.B8.S4)'), ('measurement:money_notation', 'dimes as tenths of a dollar'),
           ('decimals:compare_decimal', 'comparing tenths')])

S(id='Y4.B8.S3',
  verdict='gap', missing='tenths in a place-value chart (ones . tenths) with counters, reading and writing the number',
  build=['decimal_pv', 'vis_pv_decimal_places'],
  pre=[('placevalue:place_value_disks', 'Y3.B1.S5', 'L'), ('placevalue:pv_digit_drag{"band":999}', 'Y2.B1.S4', 'P'),
       ('conversions:f_to_d{"denoms":[5]}', 'Y4.B8.S2', 'B'), ('placevalue:value', 'Y3.B1.S8', 'P')],
  preBuild=['dec_fraction_basics'],
  related=[('placevalue:expand', 'the same chart for whole numbers'), ('decimals:decimal_nl_drag', 'tenths on a line'),
           ('placevalue:place_value_10x{"decimals":true}', 'digits moving into the tenths column')])

S(id='Y4.B8.S4',
  direct=['decimals:decimal_nl_drag'],
  verdict='full',
  pre=[('composing:fraction_number_line', 'Y3.B6.S8', 'P'), ('conversions:d_to_f', 'Y4.B8.S2', 'L'),
       ('number_sense:place_on_number_line', 'Y3.B1.S3', 'L'), ('fractions:fraction_nl_drag', 'Y3.B6.S7', 'P')],
  preBuild=['dec_fraction_basics'],
  related=[('decimals:round_decimals', 'rounding uses the same line'), ('fractions:mixed_nl_drag', 'mixed numbers on a line'),
           ('decimals:compare_decimal', 'position shows which is greater')],
  note='decimal_nl_drag samples are tenths on 0-1; numbers past 1 should be checked by the critic.')

S(id='Y4.B8.S5',
  direct=['placevalue:place_value_10x{"op":"/","power":[10],"decimals":true}'],
  verdict='full',
  pre=[('placevalue:place_value_10x{"op":"/","power":[10],"band":10000}', 'Y4.B5.S5', 'L'), ('division:div_facts{"constant":[10]}', 'Y2.B5.S14', 'P'),
       ('placevalue:value', 'Y2.B1.S4', 'P'), ('conversions:f_to_d', 'Y4.B8.S2', 'L')],
  preBuild=['decimal_pv'],
  related=[('conversions:d_to_f', '7 ÷ 10 = 7/10 = 0.7'), ('measurement:length_metric{"forms":[0]}', 'mm to cm (÷10)'),
           ('decimals:decimal_nl_drag', 'tenths on a line')],
  note='Needs the decimals option ON; verify the generator gives 1-digit ÷ 10 = 0.n items.')

S(id='Y4.B8.S6',
  direct=['placevalue:place_value_10x{"op":"/","power":[10],"decimals":true}'],
  verdict='full',
  pre=[('placevalue:place_value_10x{"op":"/","power":[10],"band":1000}', 'Y4.B8.S5', 'B'), ('multiplication:mult_facts{"constant":[10]}', 'Y2.B5.S13', 'P'),
       ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'P'), ('multiplication:mult_zeros', 'Y3.B4.S1', 'P')],
  related=[('placevalue:place_value_10x{"op":"x","power":[10]}', 'the inverse'), ('measurement:money_notation', 'cents as tenths and hundredths')])

S(id='Y4.B8.S7',
  partial=[('fraction_operations:frac_10_100', 'tenths renamed as hundredths; never reads hundredths from a hundred square or counts in hundredths')],
  verdict='partial', missing='hundredths as fractions read from a hundred square (37/100) and counted on a line',
  build=['vis_hundred_square', 'dec_fraction_basics'],
  pre=[('fractions:write_fraction{"denoms":[5]}', 'Y4.B8.S1', 'L'), ('placevalue:place_value_10x{"op":"/","power":[10],"decimals":true}', 'Y4.B8.S6', 'B'),
       ('multiplication:mult_facts{"constant":[10]}', 'Y2.B5.S13', 'P'), ('composing:compose_whole', 'Y3.B6.S4', 'P'),
       ('composing:hundreds_chart_fill', 'Y2.B1.S9', 'L')],
  related=[('fraction_operations:frac_10_100_nv', 'tenths to hundredths without pictures'), ('conversions:percent_visual', 'the hundred grid as percent later'),
           ('conversions:f_to_d', 'hundredths as decimals (next step)')])

S(id='Y4.B8.S8',
  partial=[('conversions:f_to_d{"denoms":[5]}', 'hundredths mixed with fifths and tenths; no hundred-square model'),
           ('conversions:d_to_f', 'mixes fifths; no hundredths-only page')],
  verdict='partial', missing='hundredths both ways (37/100 = 0.37, 0.07 = 7/100) with a hundred square, held to hundredths',
  build=['dec_fraction_basics', 'vis_hundred_square'],
  pre=[('fraction_operations:frac_10_100', 'Y4.B8.S7', 'B'), ('placevalue:value', 'Y2.B1.S4', 'L'), ('fractions:write_fraction{"denoms":[5]}', 'Y4.B8.S1', 'L')],
  related=[('decimals:compare_decimal', 'comparing hundredths'), ('measurement:money_notation', 'cents are hundredths of a dollar'),
           ('conversions:percent_visual', 'hundred grid')])

S(id='Y4.B8.S9',
  verdict='gap', missing='hundredths in a place-value chart (ones . tenths hundredths) with counters, and exchanging 10 hundredths for 1 tenth',
  build=['decimal_pv', 'vis_pv_decimal_places'],
  pre=[('conversions:f_to_d{"denoms":[5]}', 'Y4.B8.S8', 'B'), ('placevalue:pv_digit_drag{"band":999}', 'Y2.B1.S4', 'L'),
       ('placevalue:place_value_disks', 'Y3.B1.S5', 'L'), ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X')],
  preBuild=['decimal_pv'],
  related=[('placevalue:expand', 'whole-number partition in the same chart'), ('measurement:money_notation', 'dollars, dimes, cents'),
           ('decimals:compare_decimal', 'compare digit by digit')])

S(id='Y4.B8.S10',
  direct=['placevalue:place_value_10x{"op":"/","power":[100],"decimals":true}'],
  verdict='full',
  pre=[('placevalue:place_value_10x{"op":"/","power":[10],"decimals":true}', 'Y4.B8.S6', 'B'), ('placevalue:place_value_10x{"op":"/","power":[100],"band":10000}', 'Y4.B5.S6', 'L'),
       ('division:div_facts{"constant":[10]}', 'Y2.B5.S14', 'P'), ('addition:add_sub_10s', 'Y2.B2.S4', 'P'), ('subtraction:missing_add_sub', 'Y2.B2.S21', 'P')],
  related=[('measurement:length_metric{"forms":[1]}', 'cm to m (÷100)'), ('measurement:money_notation', 'cents to dollars (÷100)'),
           ('conversions:f_to_d', '7/100 = 0.07')])

NEW_PROPOSALS['tenths_only'] = dict(kind='option', skill='fractions:write_fraction', option='denominators "tenths only" and wholes past 1',
    name='Tenths as Fractions (option)', teaches='a whole cut into 10 equal parts: write the tenths shaded, count in tenths, and go past one whole (13/10)',
    representation='a 10-part strip (black outline, the single grey for shaded parts) in the boxed cell, one fraction slot (stacked numerator/denominator boxes); optional 0-2 line marked in tenths',
    family='fractions', ccss=['3.NF.A.1', '4.NF.C.6'], why='the "fifths, tenths, hundredths" family mixes fifths and hundredths with tenths')
NEW_PROPOSALS['dec_fraction_basics'] = dict(kind='option', skill='conversions:f_to_d', option='set "tenths", "hundredths", "halves and quarters" (and the mirror on d_to_f)',
    name='Tenths, Hundredths, Halves and Quarters as Decimals (option)', teaches='writing tenths and hundredths as decimals and back, and 1/2, 1/4, 3/4 as 0.5, 0.25, 0.75, each with its model',
    representation='equation cell 3/10 = □ with a tenths strip or hundred square beside it (hint scaffold, fades); one decimal box with a fixed decimal point',
    family='conversions', ccss=['4.NF.C.6', '3.NF.A.1'], why='f_to_d/d_to_f mix fifths and denominators; WRM teaches tenths, hundredths and halves/quarters as separate steps')

TAGFIXES += [
    dict(key='fraction_operations:frac_10_100', step='Y4.B8.S1', action='remove', why='tenths as hundredths is Y4.B8.S7, not tenths as fractions'),
    dict(key='fractions:write_fraction', step='Y4.B8.S1', action='partial', why='kept partial with denoms [5]'),
    dict(key='fraction_operations:frac_10_100', step='Y4.B8.S7', action='partial', why='renames tenths as hundredths; does not read hundredths from a hundred square'),
    dict(key='conversions:d_to_f', step='Y4.B8.S2', action='partial', why='mixes fifths'),
    dict(key='conversions:d_to_f', step='Y4.B8.S8', action='partial', why='mixes fifths'),
    dict(key='placevalue:place_value_10x', step='Y4.B8.S5', action='add', why='re-tag as FULL with op ÷, power [10], decimals on (S6 same; S10 power [100])'),
]

# ───────────────────────── Block 9: Decimals B ─────────────────────────
S(id='Y4.B9.S1',
  verdict='gap', missing='making 1 whole from tenths (0.3 + 0.7 = 1) with a tenths strip and a part-whole model',
  build=['decimal_whole'],
  pre=[('composing:make_ten', 'R.B11.S8', 'P'), ('composing:number_bonds', 'Y1.B2.S7', 'P'), ('conversions:d_to_f', 'Y4.B8.S2', 'L'),
       ('composing:compose_whole', 'Y3.B6.S4', 'L')],
  preBuild=['dec_fraction_basics'],
  related=[('decimals:add_decimal', 'adding decimals'), ('fraction_operations:add_fractions_like', '3/10 + 7/10 = 1'),
           ('measurement:money_change', 'change from $1')])

S(id='Y4.B9.S2',
  verdict='gap', missing='making 1 whole from hundredths (0.36 + 0.64 = 1) with a hundred square',
  build=['decimal_whole', 'vis_hundred_square'],
  pre=[('addition:add_sub_10s', 'Y2.B2.S4', 'P'), ('subtraction:missing_add_sub', 'Y2.B2.S21', 'P'), ('composing:make_ten', 'Y1.B2.S7', 'P'),
       ('fraction_operations:frac_10_100', 'Y4.B8.S7', 'L')],
  preBuild=['decimal_whole'],
  related=[('measurement:money_change', 'change from $1.00'), ('conversions:percent_visual', 'hundred grid'),
           ('decimals:sub_decimal', '1 − 0.36')],
  note='Bonds to 100 (Y3.B2.S19) are the key pre-skill and have no skill yet.')

S(id='Y4.B9.S3',
  verdict='gap', missing='partitioning a decimal into ones, tenths and hundredths (3.45 = 3 + 0.4 + 0.05) with a place-value chart',
  build=['decimal_pv'],
  pre=[('placevalue:expand{"band":999}', 'Y2.B1.S5', 'P'), ('conversions:f_to_d', 'Y4.B8.S8', 'L'), ('placevalue:unit_form', 'Y3.B1.S6', 'L')],
  preBuild=['decimal_pv'],
  related=[('decimals:compare_decimal', 'compare by place'), ('measurement:money_notation', '$3.45 = 3 dollars 4 dimes 5 cents'),
           ('decimals:add_decimal', 'recombine the parts')])

S(id='Y4.B9.S4',
  verdict='gap', missing='partitioning decimals in more than one way (3.45 = 3.4 + 0.05 = 2 + 1.45) with a part-whole model',
  build=['decimal_pv'],
  pre=[('placevalue:unit_form{"band":999,"rename":"more"}', 'Y3.B1.S7', 'P'), ('placevalue:expand{"band":99}', 'Y2.B1.S7', 'P'),
       ('fractions:equiv_frac_visual', 'Y2.B8.S12', 'P')],
  preBuild=['decimal_pv', 'flex_partition'],
  related=[('decimals:add_decimal', 'adding the parts'), ('measurement:money_count', 'money made in different ways')])

S(id='Y4.B9.S5',
  partial=[('decimals:compare_decimal', 'deals up to thousandths and mixed lengths; cannot be held to 1 or 2 decimal places, no models')],
  verdict='partial', missing='comparing decimals with one or two decimal places (0.4 vs 0.38) with hundred-square models',
  build=['dec_compare_2dp', 'dec_compare_model'],
  pre=[('placevalue:compare{"band":9999}', 'Y4.B1.S11', 'L'), ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'P'),
       ('decimals:decimal_nl_drag', 'Y4.B8.S4', 'L'), ('conversions:f_to_d', 'Y4.B8.S8', 'L')],
  preBuild=['decimal_pv'],
  related=[('decimals:order_decimals', 'the next step'), ('measurement:money_compare', 'comparing money amounts'),
           ('fractions:compare', 'comparing fractions')])

S(id='Y4.B9.S6',
  partial=[('decimals:order_decimals', 'deals up to thousandths; cannot be held to 1 or 2 decimal places')],
  verdict='partial', missing='ordering decimals with up to two decimal places, including whole-number parts',
  build=['dec_order_2dp'],
  pre=[('decimals:compare_decimal', 'Y4.B9.S5', 'B'), ('placevalue:order_least_to_greatest{"band":9999}', 'Y4.B1.S12', 'L'),
       ('placevalue:order_least_to_greatest{"band":999}', 'Y2.B1.S14', 'P')],
  related=[('decimals:decimal_nl_drag', 'order shown on a line'), ('conversions:order_fdp', 'ordering mixed forms later'),
           ('measurement:money_compare', 'ordering prices')])

S(id='Y4.B9.S7',
  partial=[('decimals:round_decimals', 'rounds to the nearest tenth/hundredth; never to the nearest whole number')],
  verdict='partial', missing='rounding a decimal with one or two places to the nearest whole number on a number line',
  build=['round_whole', 'vis_round_line_decimals'],
  pre=[('number_sense:rounding_visual{"place":10}', 'Y4.B1.S14', 'L'), ('decimals:decimal_nl_drag', 'Y4.B8.S4', 'L'),
       ('placevalue:expand{"band":999}', 'Y3.B1.S6', 'P'), ('composing:fraction_number_line', 'Y3.B6.S7', 'P')],
  related=[('number_sense:round_sort_tenths', 'rounding sort'), ('fractions:round_fractions', 'rounding mixed numbers'),
           ('number_sense:estimate_sums_diffs', 'estimating by rounding')])

S(id='Y4.B9.S8',
  partial=[('conversions:f_to_d{"denoms":[2]}', 'halves and quarters mixed with eighths; no hundred-square model')],
  verdict='partial', missing='1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75 (and 0.5 = 5/10 = 50/100) with a hundred square',
  build=['dec_fraction_basics'],
  pre=[('fractions:equiv_frac_visual', 'Y2.B8.S12', 'P'), ('shapes_early:partition_shapes', 'Y2.B8.S3', 'P'),
       ('fraction_operations:frac_10_100', 'Y4.B8.S7', 'L'), ('fractions:benchmark_fractions', 'Y3.B6.S7', 'L')],
  related=[('measurement:coin_value', 'quarters and half dollars'), ('conversions:percent_visual', 'halves and quarters as percents'),
           ('conversions:d_to_f', 'the reverse')])

NEW_PROPOSALS['dec_compare_2dp'] = dict(kind='option', skill='decimals:compare_decimal', option='places "1 or 2" (no thousandths)',
    name='Compare Decimals to Hundredths (option)', teaches='comparing decimals with one or two decimal places, including different lengths (0.4 vs 0.38)',
    representation='compare cell: two decimals with a boxed sign slot; optional hundred squares beside each (dec_compare_model)',
    family='decimals', ccss=['4.NF.C.7'], why='compare_decimal deals thousandths; Grade 3/Y4 stops at hundredths')
NEW_PROPOSALS['dec_order_2dp'] = dict(kind='option', skill='decimals:order_decimals', option='places "1 or 2"',
    name='Order Decimals to Hundredths (option)', teaches='ordering three to five decimals with up to two places',
    representation='order cell: numbers in boxed cards, answer slots in a row; optional 0-1 or 0-10 line',
    family='decimals', ccss=['4.NF.C.7'], why='order_decimals deals thousandths')

TAGFIXES += [
    dict(key='decimals:compare_decimal', step='Y4.B9.S5', action='partial', why='thousandths; cannot be held to hundredths'),
    dict(key='decimals:order_decimals', step='Y4.B9.S6', action='partial', why='thousandths'),
    dict(key='decimals:round_decimals', step='Y4.B9.S7', action='add', why='missing partial tag: rounding decimals, but not to the whole'),
]

# ───────────────────────── Block 10: Money (school: US dollars and cents) ─────────────────────────
S(id='Y4.B10.S1',
  direct=['measurement:money_notation'],
  verdict='full',
  pre=[('measurement:money_count', 'Y3.B9.S1', 'P'), ('measurement:coin_value', 'Y1.B13.S2', 'L'), ('conversions:f_to_d', 'Y4.B8.S8', 'L'),
       ('number_sense:place_on_number_line', 'Y3.B1.S3', 'P')],
  preBuild=['money_convert'],
  related=[('measurement:money_compare', 'comparing amounts'), ('measurement:money', 'adding amounts'),
           ('measurement:equiv_coin_sets', 'the same amount in other coins')])

S(id='Y4.B10.S2',
  partial=[('measurement:money_notation', 'writes the amount shown; never converts 345¢ ↔ $3.45')],
  verdict='partial', missing='converting between cents and dollars-and-cents both ways',
  build=['money_convert'],
  pre=[('measurement:money_count', 'Y2.B4.S3', 'P'), ('measurement:equiv_coin_sets', 'Y2.B4.S8', 'P'),
       ('measurement:money_change', 'Y3.B9.S5', 'P'), ('placevalue:place_value_10x{"op":"/","power":[100],"decimals":true}', 'Y4.B8.S10', 'L')],
  related=[('measurement:money_compare', 'compare after converting'), ('measurement:length_metric', 'another ×100 / ÷100 conversion'),
           ('conversions:f_to_d', 'cents as hundredths')],
  note='School swaps pounds and pence for dollars and cents.')

S(id='Y4.B10.S3',
  partial=[('measurement:money_compare', 'compares two sets of coins; not written amounts ($2.35 vs 189¢) or ordering three amounts')],
  verdict='partial', missing='comparing and ordering amounts written in $ and ¢ notation',
  build=['money_compare_written'],
  pre=[('measurement:money_compare{}', 'Y2.B4.S6', 'X'), ('measurement:money_notation', 'Y3.B9.S1', 'P'), ('measurement:money_count', 'Y2.B4.S2', 'P'),
       ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'L'), ('measurement:coin_value', 'Y1.B13.S2', 'P')],
  preBuild=['money_convert'],
  related=[('decimals:compare_decimal', 'comparing decimals'), ('measurement:enough_money', 'is there enough?'),
           ('placevalue:order_least_to_greatest', 'ordering')])

S(id='Y4.B10.S4',
  verdict='gap', missing='estimating totals and change by rounding prices to the nearest dollar',
  build=['money_estimate'],
  pre=[('number_sense:estimate_sums_diffs{"place":100}', 'Y3.B2.S20', 'P'), ('measurement:money_notation', 'Y3.B9.S1', 'P'),
       ('number_sense:nearest_10', 'Y4.B1.S14', 'L'), ('number_sense:estimate_products', 'Y3.B2.S20', 'L')],
  preBuild=['round_whole'],
  related=[('measurement:enough_money', 'is there enough money?'), ('measurement:money', 'exact totals'),
           ('decimals:round_decimals', 'rounding decimals')])

S(id='Y4.B10.S5',
  direct=['measurement:money', 'measurement:money_change'],
  verdict='full',
  pre=[('measurement:money{}', 'Y3.B9.S3', 'X'), ('measurement:money_change{}', 'Y3.B9.S5', 'X'), ('measurement:enough_money', 'Y2.B4.S7', 'P'),
       ('addition:add_1k_regroup', 'Y3.B2.S13', 'L'), ('fractions:identify', 'Y2.B8.S10', 'P')],
  related=[('measurement:money_compare', 'which costs more'), ('decimals:add_decimal', 'adding decimals'),
           ('multiplication:mult_word_problems', 'multiple items at one price')])

S(id='Y4.B10.S6',
  partial=[('measurement:money', 'one-step totals only'), ('measurement:money_change', 'one-step change only')],
  verdict='partial', missing='two-step money word problems (buy three items then find the change)',
  build=['money_2step'],
  pre=[('measurement:money_compare', 'Y2.B4.S6', 'P'), ('measurement:money_notation', 'Y3.B9.S1', 'P'), ('algebra:tape_diagram', 'Y3.B2.S19', 'L')],
  related=[('algebra:multi_step_word', 'two-step problems with other contexts'), ('word_problems_mixed' if False else 'number_ops_mixed:word_problems_mixed_plain', 'mixed word problems'),
           ('measurement:enough_money', 'enough money?')])

NEW_PROPOSALS['money_compare_written'] = dict(kind='option', skill='measurement:money_compare', option='form "written amounts" and task "order three"',
    name='Compare Amounts Written in $ and ¢ (option)', teaches='comparing and ordering amounts written as $2.35, 189¢, $1 and 9¢, converting to one unit first',
    representation='compare cell: two price tags (black outline) with a boxed sign slot; order form: three tags and three answer boxes',
    family='measurement', ccss=['2.MD.C.8', '4.MD.A.2'], why='money_compare deals coin pictures only')

TAGFIXES += [
    dict(key='measurement:money', step='Y4.B10.S6', action='add', why='missing partial tag (one-step only)'),
    dict(key='measurement:money_compare', step='Y4.B10.S3', action='partial', why='coin sets only, not written amounts'),
    dict(key='measurement:money_notation', step='Y4.B10.S2', action='add', why='missing partial tag'),
]

# ───────────────────────── Block 11: Time ─────────────────────────
S(id='Y4.B11.S1',
  verdict='gap', missing='converting between years, months, weeks and days (and days in each month, leap years)',
  build=['time_calendar'],
  pre=[('measurement:time_sense', 'Y3.B10.S6', 'L'), ('multiplication:mult_facts{"constant":[7,12]}', 'Y4.B4.S10', 'L'),
       ('patterns:count_by_step_up', 'Y2.B1.S16', 'L')],
  preBuild=['day_order', 'time_calendar'],
  related=[('measurement:unit_conversion_word', 'other conversions'), ('measurement:unit_conversions', 'conversion tables'),
           ('measurement:elapsed_mixed', 'time intervals')],
  note='The xlsx prior list (Days of the week, Months of the year, Y3 Years, months and days) maps to no live skill.')

S(id='Y4.B11.S2',
  verdict='gap', missing='converting between hours, minutes and seconds (and comparing durations given in different units)',
  build=['time_calendar', 'time_convert'],
  pre=[('measurement:time_5min', 'Y3.B10.S2', 'P'), ('measurement:time_fives_ring', 'Y2.B9.S6', 'P'),
       ('patterns:seq_5', 'Y2.B1.S15', 'P'), ('multiplication:mult_facts{"constant":[6]}', 'Y4.B4.S3', 'L')],
  preBuild=['time_units'],
  related=[('measurement:unit_conversion_word', 'its "hr → min" items'), ('measurement:elapsed_find_duration', 'durations'),
           ('measurement:time_1min', 'minutes on the clock')],
  note='unit_conversion_word deals some hr → min items among customary units; not a cover.')

S(id='Y4.B11.S3',
  direct=['measurement:time_analog_digital', 'measurement:time_match_clock'],
  verdict='full',
  pre=[('measurement:time_1min', 'Y3.B10.S3', 'P'), ('measurement:time_5min', 'Y3.B10.S2', 'P'), ('measurement:clock_parts', 'Y1.B14.S6', 'L'),
       ('measurement:time_half_hour', 'Y1.B14.S6', 'P'), ('measurement:time_sense', 'Y3.B10.S5', 'L')],
  related=[('measurement:order_clocks_digital_asc', 'ordering digital times'), ('measurement:elapsed_mixed', 'time later'),
           ('measurement:time_quarter', 'quarter past/to wording')])

S(id='Y4.B11.S4',
  verdict='gap', missing='converting 12-hour times (a.m./p.m.) to the 24-hour clock',
  build=['time_24h_convert'],
  pre=[('measurement:time_analog_digital', 'Y4.B11.S3', 'B'), ('measurement:time_sense', 'Y3.B10.S5', 'L'), ('addition:add_20_mixed', 'adding to 20 fluently: 1 p.m. + 12 = 13:00 (Grade 1-2 fact fluency)', 'X')],
  related=[('measurement:elapsed_mixed', 'time intervals'), ('measurement:time_1min', 'reading the clock')],
  note='The US school uses a.m./p.m.; 24-hour time is a WRM/UK step (owner question).')

S(id='Y4.B11.S5',
  verdict='gap', missing='converting 24-hour times to 12-hour times with a.m./p.m.',
  build=['time_24h_convert'],
  pre=[('measurement:time_sense', 'Y3.B10.S5', 'L'), ('measurement:time_analog_digital', 'Y4.B11.S3', 'L'), ('subtraction:sub_20_mixed', 'subtracting within 20 fluently (Grade 1-2 fact fluency)', 'X')],
  related=[('measurement:elapsed_mixed', 'time intervals'), ('measurement:order_clocks_digital_asc', 'ordering times')])
