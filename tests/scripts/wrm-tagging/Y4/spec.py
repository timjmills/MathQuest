# Y4 (Grade 3) wave-2 tagging spec. pre kinds: P = school prior-learning list of the week, B = step before in block,
# L = lower grade same cluster, C = Grade 2 lesson copied in, X = free text.
STEPS = []
def S(**k): STEPS.append(k)

NEW_PROPOSALS = {}
TAGFIXES = []

# ───────────────────────── Block 1: Place value ─────────────────────────
S(id='Y4.B1.S1',
  direct=['composing:base10_build_hundreds{"band":999}', 'placevalue:place_value_disks{"band":999}', 'placevalue:pv_disks_build{"band":999}'],
  verdict='full',
  pre=[('placevalue:value', 'Y3.B1.S8', 'P'), ('placevalue:identify', 'Y3.B1.S8', 'P'),
       ('composing:tens_foundation_visual', 'Y2.B1.S3', 'P'), ('composing:base10_build', 'Y1.B6.S4', 'P'),
       ('composing:teen_compose', 'R.B13.S1', 'P')],
  related=[('placevalue:unit_form{"band":999}', 'the same number written in unit form (4 hundreds 7 tens 6 ones)'),
           ('placevalue:expand{"band":999}', 'the next step: the representation written as a partition'),
           ('placevalue:number_word_names{"band":999}', 'the same number as a word name'),
           ('composing:number_word_form', 'numerals and words side by side')],
  note='A Y3 step repeated as review; the three skills give base-10, place-value counters (read) and counters (draw).')

S(id='Y4.B1.S2',
  direct=['placevalue:expand{"band":999}', 'placevalue:unit_form{"band":999}', 'placevalue:combine{"band":999}'],
  verdict='full',
  pre=[('placevalue:place_value_disks{"band":999}', 'Y3.B1.S5', 'P'), ('composing:base10_build_hundreds', 'Y3.B1.S4', 'P'),
       ('placevalue:value', 'Y3.B1.S8', 'P'), ('composing:tens_foundation_visual', 'Y2.B1.S3', 'P')],
  related=[('placevalue:pv_digit_drag{"band":999}', 'the partition written into a place-value chart'),
           ('placevalue:identify', 'naming the place of each part'),
           ('addition:add_sub_100s', 'adding the parts back together')],
  note='WRM also draws the part-whole model; the kit part-whole visual is vis_bond_options (not needed for the verdict).')

S(id='Y4.B1.S3',
  direct=[], partial=[('number_sense:place_on_number_line{"span":100,"band":1000}', 'reading an unlabelled point and lines counting in 2s, 5s, 50s, 100s; estimating where a number goes on 0-1,000')],
  verdict='partial', missing='reading the number at a point and lines with intervals other than 10/100; estimating on an unmarked 0-1,000 line',
  build=['nl_20'],
  pre=[('number_sense:place_on_number_line{"span":10,"band":100}', 'Y3.B1.S3', 'P'), ('patterns:count_by_step_up', 'Y2.B1.S15', 'P'),
       ('number_sense:between_tens', 'Y2.B1.S10', 'L'), ('composing:hundreds_chart_fill', 'Y2.B1.S9', 'L')],
  related=[('number_sense:rounding_visual{"place":100,"band":1000}', 'the same 0-1,000 line used to round'),
           ('patterns:count_by_powers_of_10', 'counting in 10s and 100s along the line'),
           ('placevalue:compare{"band":999}', 'position on the line decides which is greater')])

S(id='Y4.B1.S4',
  direct=['patterns:count_by_powers_of_10{"step":[2]}'],
  partial=[('placevalue:place_value_disks{"band":9999}', '1,000 shown as 10 hundreds (the exchange) and thousands counted in base-10 cubes')],
  verdict='partial', missing='1,000 = 10 hundreds = 100 tens as an exchange; counting in 1,000s from any multiple of 1,000 with base-10 cubes',
  build=['regroup_thousands', 'count_50s'],
  pre=[('composing:base10_build_hundreds', 'Y3.B1.S4', 'L'), ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X'),
       ('patterns:count_by_step_up', 'Y3.B1.S14', 'L'), ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y4.B1.S3', 'B')],
  related=[('placevalue:unit_form{"band":9999}', 'thousands named in unit form'),
           ('multiplication:mult_zeros', '10 × 100 = 1,000'),
           ('placevalue:place_value_10x', 'a digit moving into the thousands place')],
  note='School teaches this step in W33 (enrichment after MAP).')

S(id='Y4.B1.S5',
  direct=['placevalue:place_value_disks{"band":9999}', 'placevalue:pv_digit_drag{"band":9999}', 'placevalue:unit_form{"band":9999}'],
  verdict='full',
  pre=[('patterns:count_by_powers_of_10{"step":[2]}', 'Y4.B1.S4', 'B'), ('placevalue:compare{"band":999}', 'Y3.B1.S12', 'P'),
       ('placevalue:order_least_to_greatest{"band":999}', 'Y3.B1.S13', 'P'), ('placevalue:value', 'Y3.B1.S8', 'P'),
       ('composing:base10_build_hundreds', 'Y3.B1.S5', 'L')],
  related=[('placevalue:expand{"band":9999}', 'the next step: partitioning the 4-digit number'),
           ('placevalue:number_word_names{"band":9999}', 'the same number as a word name'),
           ('placevalue:value{"band":9999}', 'the value of each digit')],
  note='Existing partial tags on place_value_disks and pv_digit_drag become full with band 9,999.')

S(id='Y4.B1.S6',
  direct=['placevalue:expand{"band":9999}', 'placevalue:combine{"band":9999}', 'placevalue:unit_form{"band":9999}'],
  verdict='full',
  pre=[('placevalue:place_value_disks{"band":9999}', 'Y4.B1.S5', 'B'), ('placevalue:expand{"band":999}', 'Y3.B1.S6', 'P'),
       ('placevalue:value', 'Y3.B1.S8', 'P'), ('composing:base10_build', 'Y1.B6.S4', 'P')],
  related=[('placevalue:pv_digit_drag{"band":9999}', 'the parts placed in a place-value chart'),
           ('placevalue:value{"band":9999}', 'value of each digit'),
           ('addition:add_10k_no_regroup', 'recombining parts by column addition')])

S(id='Y4.B1.S7',
  partial=[('placevalue:unit_form{"band":9999,"rename":"more"}', 'other partitions (3,452 = 2,000 + 1,400 + 52) and the part-whole/bar layout')],
  verdict='partial', missing='non-standard partitions of 4-digit numbers into two or more parts, with a part-whole or bar model',
  build=['flex_partition'],
  pre=[('placevalue:expand{"band":9999}', 'Y4.B1.S6', 'B'), ('placevalue:unit_form{"band":999,"rename":"more"}', 'Y3.B1.S7', 'P'),
       ('composing:base10_regroup', 'Y2.B1.S7', 'P'), ('placevalue:place_value_disks{"band":9999}', 'Y3.B1.S5', 'P')],
  preBuild=['flex_partition'],
  related=[('placevalue:combine{"band":9999,"order":"scrambled"}', 'recombining scrambled parts'),
           ('addition:add_10k_regroup', 'regrouping inside column addition uses the same idea'),
           ('subtraction:sub_10k_regroup', 'exchanging in subtraction is a flexible partition')])

S(id='Y4.B1.S8',
  direct=['placevalue:more_less_100{"step":1000}', 'placevalue:more_less_100{"step":100}'],
  partial=[('placevalue:more_less_10{"step":[1,10]}', '1 more/less and 10 more/less on 4-digit numbers (the skill stops at 120)')],
  verdict='partial', missing='1 and 10 more/less of 4-digit numbers and a mixed page of all four steps (1, 10, 100, 1,000), crossing boundaries',
  build=['more_less_all'],
  pre=[('placevalue:more_less_100{"step":0}', 'Y3.B1.S9', 'P'), ('placevalue:more_less_10', 'Y2.B2.S13', 'P'),
       ('counting:count_sequence', 'Y1.B4.S7', 'P'), ('placevalue:unit_form{"band":9999}', 'Y4.B1.S6', 'B')],
  related=[('addition:add_sub_100s', 'adding and subtracting 100s is the same move'),
           ('patterns:count_by_powers_of_10', 'counting on in 10s, 100s and 1,000s'),
           ('placevalue:value{"band":9999}', 'which digit changes and why')],
  note='more_less_100 already offers step 1,000; with it the existing partial tag is full for the 100/1,000 part.')

S(id='Y4.B1.S9',
  partial=[('number_sense:place_on_number_line{"span":1000,"band":10000}', 'reading the number at a point and lines in 100s/1,000s with only some ticks labelled')],
  verdict='partial', missing='reading numbers at points and lines counting in 100s, 500s or 1,000s with some labels missing',
  build=['nl_20'],
  pre=[('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S10', 'P'), ('placevalue:more_less_100{"step":1000}', 'Y4.B1.S8', 'B'),
       ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'L'), ('patterns:count_by_powers_of_10', 'Y4.B1.S4', 'L')],
  related=[('number_sense:round_nl_thousands', 'the same 0-10,000 line used for rounding'),
           ('number_sense:rounding_visual{"place":1000,"band":10000}', 'rounding to the nearest 1,000 on a line'),
           ('placevalue:order_least_to_greatest{"band":9999}', 'ordering by position on the line')])

S(id='Y4.B1.S10',
  verdict='gap', missing='estimating where a number sits, and which number is at an arrow, on 0-10,000 lines with only the ends labelled',
  build=['nl_20'],
  pre=[('number_sense:place_on_number_line{"span":1000,"band":10000}', 'Y4.B1.S9', 'B'), ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S10', 'P'),
       ('number_sense:between_tens', 'Y2.B1.S11', 'P'), ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'P')],
  related=[('number_sense:round_nl_thousands', 'rounding uses the same halfway reasoning'),
           ('number_sense:rounding_visual{"place":1000,"band":10000}', 'midpoint of an interval'),
           ('placevalue:compare{"band":9999}', 'comparing estimates')],
  note='place_on_number_line marks a number on a ticked line; estimation on a line with only end labels is not dealt.')

S(id='Y4.B1.S11',
  direct=['placevalue:compare{"band":9999}'],
  verdict='full',
  pre=[('placevalue:compare{"band":999}', 'Y3.B1.S12', 'P'), ('placevalue:order_least_to_greatest{"band":999}', 'Y3.B1.S13', 'P'),
       ('placevalue:place_value_disks{"band":9999}', 'Y4.B1.S5', 'L'), ('number_sense:place_on_number_line{"span":1000,"band":10000}', 'Y4.B1.S9', 'L'),
       ('comparing:compare_groups', 'Y1.B1.S12', 'P')],
  related=[('placevalue:order_greatest_to_least{"band":9999}', 'the next step: ordering'),
           ('placevalue:compare{"band":9999,"lengths":"mixed"}', 'numbers with different numbers of digits'),
           ('algebra:inequalities', 'the < > symbols in a later form')],
  note='Existing tag is partial only because of band; with band 9,999 and closeness "some" it is full.')

S(id='Y4.B1.S12',
  direct=['placevalue:order_least_to_greatest{"band":9999}', 'placevalue:order_greatest_to_least{"band":9999}'],
  verdict='full',
  pre=[('placevalue:compare{"band":9999}', 'Y4.B1.S11', 'B'), ('placevalue:order_least_to_greatest{"band":999}', 'Y3.B1.S13', 'P'),
       ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'P'), ('placevalue:value', 'Y2.B1.S4', 'P')],
  related=[('number_sense:place_on_number_line{"span":1000,"band":10000}', 'order shown by position on a line'),
           ('decimals:order_decimals', 'the same ordering routine with decimals later in the year')])

S(id='Y4.B1.S13',
  verdict='gap', missing='reading and writing Roman numerals to 100 (I, V, X, L, C), and Roman numerals on clocks',
  build=['roman_100'],
  pre=[('measurement:time_hour', 'Y3.B10.S1', 'P'), ('placevalue:expand{"band":99}', 'Y2.B1.S5', 'P')],
  preBuild=['roman_12'],
  related=[('placevalue:number_word_names', 'another way of writing a number'),
           ('placevalue:combine', 'Roman numerals are additive like expanded form')],
  note='Non-CCSS (UK only); taught as enrichment in W12.')

S(id='Y4.B1.S14',
  direct=['number_sense:rounding_visual{"place":10,"band":1000}', 'number_sense:nearest_10'],
  verdict='full',
  pre=[('number_sense:between_tens', 'Y3.B1.S10', 'L'), ('number_sense:place_on_number_line{"span":10,"band":1000}', 'Y3.B1.S10', 'P'),
       ('placevalue:more_less_10', 'Y2.B2.S13', 'P'), ('number_sense:place_on_number_line{"span":1000,"band":10000}', 'Y4.B1.S9', 'P')],
  related=[('number_sense:round_sort_10', 'sorting numbers by what they round to'),
           ('number_sense:nearest_100', 'the next step'),
           ('number_sense:estimate_sums_diffs{"place":10}', 'rounding used to estimate')])

S(id='Y4.B1.S15',
  direct=['number_sense:nearest_100', 'number_sense:round_sort_100', 'number_sense:rounding_visual{"place":100,"band":1000}'],
  verdict='full',
  pre=[('number_sense:nearest_10', 'Y4.B1.S14', 'B'), ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S10', 'P'),
       ('placevalue:more_less_100{"step":100}', 'Y3.B1.S9', 'L'), ('placevalue:compare{"band":999}', 'Y2.B1.S13', 'P')],
  related=[('number_sense:nearest_1000', 'the next step'),
           ('number_sense:estimate_sums_diffs{"place":100}', 'rounding to 100 to estimate'),
           ('number_sense:rounding_table', 'the same number rounded to 10 and 100')])

S(id='Y4.B1.S16',
  direct=['number_sense:nearest_1000', 'number_sense:round_nl_thousands', 'number_sense:round_sort_1000'],
  verdict='full',
  pre=[('number_sense:nearest_100', 'Y4.B1.S15', 'B'), ('number_sense:place_on_number_line{"span":1000,"band":10000}', 'Y4.B1.S9', 'L'),
       ('number_sense:rounding_visual{"place":100,"band":1000}', 'Y4.B1.S15', 'B'), ('placevalue:compare{"band":9999}', 'Y4.B1.S11', 'L')],
  related=[('number_sense:rounding_table', 'the next step: 10, 100 and 1,000 together'),
           ('number_sense:estimate_sums_diffs{"place":1000}', 'rounding to 1,000 to estimate'),
           ('number_sense:nearest_10000', 'Grade 4 extension')])

S(id='Y4.B1.S17',
  direct=['number_sense:rounding_table', 'number_sense:round_nl_thousands'],
  verdict='full',
  pre=[('number_sense:nearest_1000', 'Y4.B1.S16', 'B'), ('number_sense:nearest_100', 'Y4.B1.S15', 'B'), ('number_sense:nearest_10', 'Y4.B1.S14', 'B'),
       ('number_sense:place_on_number_line{"span":100,"band":1000}', 'Y3.B1.S10', 'P'), ('composing:make_ten', 'Y1.B2.S7', 'P')],
  related=[('number_sense:mixed_number_sense', 'mixed rounding review'),
           ('number_sense:estimate_sums_diffs{"place":1000}', 'the next block uses rounding to estimate'),
           ('number_sense:round_sort_1000', 'sort by rounded value')])

NEW_PROPOSALS['regroup_thousands'] = dict(kind='option', skill='composing:base10_regroup', option='band 9,999: exchange 1 thousand for 10 hundreds',
    name='A Thousand Is Ten Hundreds (option)', teaches='1,000 as 10 hundreds and 100 tens: exchange a thousand cube for ten hundred flats and back, and count in 1,000s',
    representation='one boxed cell: a black-outline thousand cube beside ten flats with an exchange arrow; the pupil writes "1 thousand = __ hundreds"; numbers in Andika, no colour',
    family='placevalue', ccss=['4.NBT.A.1', '4.NBT.A.2'], why='the exchange of thousands is the core of the Thousands step and no skill shows it')
NEW_PROPOSALS['more_less_all'] = dict(kind='option', skill='placevalue:more_less_100', option='step "1, 10, 100 or 1,000 (mixed)" and band 9,999',
    name='1, 10, 100 or 1,000 More or Less (option)', teaches='finding 1, 10, 100 and 1,000 more or less than a 4-digit number, including across a boundary (3,995 + 10)',
    representation='a "−n | number | +n" table cell with one empty box per row; optional place-value chart beside it with the changing column outlined',
    family='placevalue', ccss=['2.NBT.B.8', '4.NBT.A.1'], why='the skill offers 10, 100 and 1,000 but not 1, and never mixes all four on 4-digit numbers')

TAGFIXES += [
    dict(key='placevalue:compare', step='Y4.B1.S11', action='add', why='re-tag as FULL (drop the partial flag) with opts band 9,999'),
    dict(key='placevalue:order_least_to_greatest', step='Y4.B1.S12', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:order_greatest_to_least', step='Y4.B1.S12', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:place_value_disks', step='Y4.B1.S5', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:pv_digit_drag', step='Y4.B1.S5', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:unit_form', step='Y4.B1.S5', action='add', why='missing tag: unit form to 9,999 represents 4-digit numbers'),
    dict(key='placevalue:expand', step='Y4.B1.S6', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:combine', step='Y4.B1.S6', action='add', why='re-tag as FULL with band 9,999'),
    dict(key='placevalue:expand', step='Y4.B1.S2', action='add', why='re-tag as FULL with band 999 (standard partition is all the step asks)'),
    dict(key='placevalue:pv_disks_build', step='Y4.B1.S1', action='add', why='missing tag: draw counters for a 3-digit number'),
    dict(key='patterns:count_by_powers_of_10', step='Y4.B1.S4', action='add', why='missing tag: counting in 1,000s (opts step [2])'),
    dict(key='placevalue:place_value_disks', step='Y4.B1.S1', action='add', why='re-tag as FULL with band 999'),
    dict(key='placevalue:unit_form', step='Y4.B1.S7', action='partial', why='unit form with rename "more" is a partial cover of flexible partitioning'),
    dict(key='placevalue:unit_form', step='Y4.B1.S1', action='remove', why='unit form is the partition step (Y4.B1.S2), not representing'),
]
