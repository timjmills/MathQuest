# ───────────────────────── Block 4: Multiplication and division A ─────────────────────────
_MD_PRE_W01 = [('multiplication:arrays_groups', 'Y3.B3.S1', 'P'), ('division:share_into_groups', 'Y3.B3.S5', 'P'),
               ('multiplication:mult_facts{"constant":[3]}', 'Y3.B3.S8', 'P'), ('division:div_facts{"constant":[3]}', 'Y3.B3.S7', 'P'),
               ('multiplication:dot_array_mult', 'Y3.B3.S2', 'P'), ('patterns:count_by_step_up{"step":[1]}', 'Y2.B1.S16', 'P')]

def table_steps(n, mul_id, fact_id, prev_fact, wk_pre):
    S(id=mul_id,
      direct=[f'multiplication:mult_facts{{"constant":[{n}],"support":["array"]}}', f'division:div_facts{{"constant":[{n}]}}', f'multiplication:count_by_tables{{"constant":[{n}]}}'],
      verdict='full',
      pre=wk_pre + ([prev_fact] if prev_fact else []),
      related=[(f'multiplication:mult_word_problems', f'equal-groups stories with {n} in a group'),
               (f'multiplication:nl_mult', f'jumps of {n} on a number line'),
               (f'number_theory:multiples', f'multiples of {n}'),
               ('division:missing_mult_div', 'missing-factor form of the same facts')],
      note=f'Existing tags are partial only because opts were not recorded; with constant {n} they are full.')
    S(id=fact_id,
      direct=[f'multiplication:mult_div_fact_family', f'multiplication:mult_facts{{"constant":[{n}]}}', f'division:div_facts{{"constant":[{n}],"support":["think"]}}'],
      verdict='full',
      pre=[(f'multiplication:count_by_tables{{"constant":[{n}]}}', mul_id, 'B')] + [x for x in wk_pre if 'fact_family' not in x[0]][:5],
      related=[('multiplication:number_families_mult', 'the four facts as a number family'),
               ('multiplication:mult_chart{"task":"fill"}', f'the {n} row of the chart'),
               ('division:div_word_problems', 'sharing and grouping stories'),
               ('multiplication:mult_chart_easy', 'missing products on the chart')],
      note='mult_div_fact_family has no constant option: its items are any table, so pair it with the constant-set fact skills.')

S(id='Y4.B4.S1',
  direct=['multiplication:count_by_tables{"constant":[3]}', 'number_theory:multiples', 'multiplication:mult_chart{"task":"shade","constant":[3]}'],
  verdict='full',
  pre=[('multiplication:arrays_groups', 'Y3.B3.S1', 'C'), ('division:share_into_groups', 'Y3.B3.S5', 'C')] + _MD_PRE_W01[2:],
  related=[('multiplication:mult_facts{"constant":[3]}', 'the 3 times-table facts'), ('patterns:skip_count_line', 'counting in 3s on a line'),
           ('number_theory:divisibility_sort', 'is it a multiple of 3?'), ('multiplication:nl_mult', 'jumps of 3')],
  note='number_theory:multiples has no table option; its items mix tables. Pair it with count_by_tables/mult_chart held to 3.')

table_steps(6, 'Y4.B4.S2', 'Y4.B4.S3', None, _MD_PRE_W01 + [('patterns:double', 'Y2.B5.S11', 'P')])
table_steps(9, 'Y4.B4.S4', 'Y4.B4.S5', ('multiplication:mult_facts{"constant":[6]}', 'Y4.B4.S3', 'B'),
            [('multiplication:mult_facts{"constant":[10]}', 'Y2.B5.S13', 'P'), ('multiplication:mult_facts{"constant":[3]}', 'Y3.B3.S8', 'P'),
             ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P'),
             ('multiplication:mult_properties', 'Y3.B4.S3', 'P'), ('number_theory:multiples', 'Y3.B3.S4', 'P')])

S(id='Y4.B4.S6',
  partial=[('multiplication:mult_chart{"task":"pattern","constant":[3,6,9]}', 'shows the 3, 6, 9 rows but does not ask the link (6 × 4 = double 3 × 4; 9 × 4 = 3 × 3 × 4)')],
  verdict='partial', missing='using the 3 times-table to find 6 and 9 facts (doubling, tripling) and spotting the shared multiples',
  build=['tables_links'],
  pre=[('multiplication:mult_facts{"constant":[9]}', 'Y4.B4.S5', 'B'), ('multiplication:mult_facts{"constant":[6]}', 'Y4.B4.S3', 'B'),
       ('multiplication:mult_facts{"constant":[3]}', 'Y3.B3.S8', 'P'), ('patterns:double', 'Y2.B5.S11', 'P'), ('multiplication:mult_properties', 'Y3.B4.S3', 'P')],
  related=[('number_theory:multiples', 'common multiples of 3, 6 and 9'), ('patterns:pattern_relationship', 'two patterns compared'),
           ('multiplication:count_by_tables{"constant":[3,6,9]}', 'count in 3s, 6s, 9s side by side')])

table_steps(7, 'Y4.B4.S7', 'Y4.B4.S8', ('multiplication:mult_facts{"constant":[3,6,9]}', 'Y4.B4.S6', 'B'),
            [('multiplication:mult_facts{"constant":[2,5,10]}', 'Y2.B5.S15', 'P'), ('multiplication:mult_facts{"constant":[4]}', 'Y3.B3.S11', 'P'),
             ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P'), ('multiplication:mult_properties', 'Y3.B4.S3', 'P'),
             ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'P'), ('multiplication:arrays_groups', 'Y1.B9.S5', 'P')])

for n, sid in ((11, 'Y4.B4.S9'), (12, 'Y4.B4.S10')):
    S(id=sid,
      direct=['multiplication:mult_div_fact_family', f'multiplication:mult_facts{{"constant":[{n}]}}', f'division:div_facts{{"constant":[{n}]}}', f'multiplication:count_by_tables{{"constant":[{n}]}}'],
      verdict='full',
      pre=[('multiplication:mult_facts{"constant":[10]}', 'Y2.B5.S13', 'P'), ('multiplication:mult_facts{"constant":[1]}', 'the ×1 facts (taught with Y4.B4.S11 in the same school week W03)', 'X'),
           ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'P'), ('multiplication:mult_properties{"forms":[1]}', 'Y3.B4.S3', 'P'),
           ('multiplication:mult_facts{"constant":[7]}', 'Y4.B4.S8', 'B')] + ([('multiplication:mult_facts{"constant":[6]}', 'Y4.B4.S3', 'L'), ('patterns:double', 'Y2.B5.S11', 'L')] if n == 12 else []),
      related=[('multiplication:area_model_mult', f'{n} × n split as 10 × n + {n - 10} × n'), ('multiplication:mult_chart{"band":144}', 'the 12 × 12 chart'),
               ('number_theory:multiples', f'multiples of {n}'), ('division:div_word_problems', 'division stories')],
      note='The 11 and 12 tables go beyond CCSS 3.OA.C.7 (within 100); WRM teaches them in Y4.')

S(id='Y4.B4.S11',
  direct=['multiplication:mult_properties{"forms":[2,3]}', 'multiplication:mult_facts{"constant":[0,1]}'],
  verdict='full',
  pre=[('multiplication:arrays_groups', 'Y3.B3.S1', 'P'), ('multiplication:mult_properties{"forms":[0]}', 'Y3.B4.S3', 'P'),
       ('multiplication:equal_or_unequal_groups', 'Y2.B5.S1', 'P'), ('multiplication:repeated_add_to_mult', 'Y1.B9.S5', 'P')],
  related=[('division:div_facts{"constant":[1]}', 'dividing by 1 (next step)'), ('multiplication:mult_chart', 'the 0 and 1 rows'),
           ('algebra:solve_unknown', '__ × 7 = 0')])

S(id='Y4.B4.S12',
  direct=['division:div_facts{"constant":[1]}'],
  partial=[('multiplication:mult_properties{"forms":[2]}', 'times 1 only; never n ÷ n = 1 or n ÷ 1 = n as a pair')],
  verdict='partial', missing='dividing a number by itself (n ÷ n = 1) alongside n ÷ 1 = n, with sharing pictures',
  build=['div_by_itself'],
  pre=[('multiplication:mult_properties{"forms":[2,3]}', 'Y4.B4.S11', 'B'), ('division:share_into_groups', 'Y3.B3.S5', 'P'),
       ('division:div_facts{"constant":[5]}', 'Y2.B5.S16', 'P'), ('composing:odd_even', 'Y2.B5.S12', 'P'), ('multiplication:arrays_groups', 'Y3.B3.S2', 'P')],
  related=[('division:div_equation_parts', 'dividend, divisor, quotient named'), ('multiplication:mult_div_fact_family', 'n × 1 = n so n ÷ 1 = n'),
           ('fractions:whole_as_fraction' if False else 'composing:whole_as_fraction', '4/4 = 1 is n ÷ n = 1 in fraction form')],
  note='mult_properties is tagged here today as partial; the existing proposal mult_three also lists this step, which looks like a numbering slip (owner question).')

S(id='Y4.B4.S13',
  verdict='gap', missing='multiplying three 1-digit numbers, choosing the order (associative property: 2 × 5 × 7 = 10 × 7)',
  build=['mult_three'],
  pre=[('multiplication:mult_properties{"forms":[0]}', 'Y3.B4.S3', 'P'), ('multiplication:mult_facts', 'Y4.B4.S10', 'B'),
       ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('addition:add_three', 'adding three numbers (Grade 1, 1.OA.A.2), the additive form of the same regrouping idea', 'X')],
  related=[('multiplication:mult_zeros', 'making 10 first (2 × 5)'), ('order_of_operations:two_ops_no_paren', 'two operations in one expression'),
           ('number_theory:factor_links_easy', 'factor pairs inside the product')],
  note='mult_three teaches exactly this step.')

NEW_PROPOSALS['div_by_itself'] = dict(kind='option', skill='division:div_facts', option='form "÷ 1 and ÷ itself"',
    name='Divide by 1 and by Itself (option)', teaches='n ÷ 1 = n and n ÷ n = 1 (and 0 ÷ n = 0), each with a sharing picture, then as facts only',
    representation='equation cell 7 ÷ 7 = □ with an optional row of dots ringed into one group / seven groups (hint scaffold that fades); one answer box',
    family='division', ccss=['3.OA.B.5', '3.OA.B.6'], why='the 1 constant gives n ÷ 1 only; dividing by itself is not dealt')

TAGFIXES += [
    dict(key='multiplication:mult_facts', step='Y4.B4.S2', action='add', why='re-tag as FULL with opts constant [6] (likewise S4 with [9], S7 [7], S9 [11], S10 [12])'),
    dict(key='division:div_facts', step='Y4.B4.S2', action='add', why='re-tag as FULL with opts constant [6] (likewise S4, S7, S9, S10)'),
    dict(key='multiplication:count_by_tables', step='Y4.B4.S1', action='add', why='re-tag as FULL with constant [3]'),
    dict(key='multiplication:mult_chart', step='Y4.B4.S1', action='add', why='missing tag: shade the multiples of 3'),
    dict(key='multiplication:count_by_tables', step='Y4.B4.S2', action='add', why='missing tag on S2, S4, S7, S9, S10 with the table constant'),
    dict(key='multiplication:mult_facts', step='Y4.B4.S11', action='add', why='missing tag: constant [0, 1]'),
    dict(key='division:div_facts', step='Y4.B4.S12', action='add', why='missing tag: constant [1] covers n ÷ 1'),
]

# ───────────────────────── Block 5: Multiplication and division B ─────────────────────────
S(id='Y4.B5.S1',
  direct=['number_theory:factors_identify', 'number_theory:factor_tchart_easy'],
  verdict='full',
  pre=[('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('multiplication:dot_array_mult', 'Y2.B5.S6', 'P'),
       ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P'), ('multiplication:mult_facts', 'Y4.B4.S10', 'L'), ('division:share_into_groups', 'Y1.B9.S8', 'P')],
  related=[('number_theory:factor_links_easy', 'factor pairs drawn as links'), ('number_theory:prime_composite', 'numbers with only one factor pair'),
           ('area_perimeter:area_unit_squares', 'rectangles of a given area are factor pairs'), ('number_theory:multiples', 'the inverse idea')])

S(id='Y4.B5.S2',
  direct=['number_theory:factor_links_easy'],
  partial=[('multiplication:mult_properties{"forms":[1]}', 'breaking apart by addition only; never replacing a factor by a factor pair (12 × 5 = 6 × 2 × 5)')],
  verdict='partial', missing='using a factor pair to multiply mentally (14 × 5 = 7 × 2 × 5 = 7 × 10)',
  build=['mult_three'],
  pre=[('number_theory:factor_tchart_easy', 'Y4.B5.S1', 'B'), ('multiplication:mult_zeros{"forms":[0]}', 'Y3.B4.S1', 'P'),
       ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P')],
  preBuild=['mult_three'],
  related=[('number_theory:factors_identify', 'listing the factor pairs'), ('multiplication:area_model_mult', 'another way to make a product easy'),
           ('multiplication:mult_facts{"constant":[10]}', 'the ×10 fact the pair makes')],
  note='Reusing mult_three: its associative regrouping (a × b × c) is the same move; the proposal should add the "split a factor" form.')

S(id='Y4.B5.S3',
  direct=['multiplication:mult_zeros{"forms":[0]}', 'placevalue:place_value_10x{"op":"x","power":[10],"band":1000}'],
  verdict='full',
  pre=[('multiplication:mult_facts{"constant":[10]}', 'Y2.B5.S13', 'P'), ('patterns:seq_10', 'Y1.B9.S2', 'P'),
       ('multiplication:mult_zeros', 'Y3.B4.S1', 'L'), ('placevalue:value', 'Y3.B1.S8', 'L')],
  related=[('placevalue:place_value_10x{"op":"/","power":[10],"band":1000}', 'the inverse: divide by 10 (Y4.B5.S5)'),
           ('measurement:length_metric{"forms":[0]}', '1 cm = 10 mm, a ×10 conversion'), ('multiplication:mult_placeholder_zero', 'the placeholder zero')],
  note='mult_zeros with form ×10 only; existing partial tags become full with opts.')

S(id='Y4.B5.S4',
  direct=['multiplication:mult_zeros{"forms":[1]}', 'placevalue:place_value_10x{"op":"x","power":[100],"band":10000}'],
  verdict='full',
  pre=[('multiplication:mult_zeros{"forms":[0]}', 'Y4.B5.S3', 'B'), ('composing:base10_build_hundreds', 'Y3.B1.S4', 'P'),
       ('patterns:seq_10', 'Y2.B1.S15', 'P'), ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P')],
  related=[('placevalue:place_value_10x{"op":"/","power":[100],"band":10000}', 'the inverse: divide by 100'),
           ('measurement:length_metric{"forms":[1]}', '1 m = 100 cm'), ('multiplication:mult_zeros{"forms":[2]}', 'multiples of ten (Y4.B5.S7)')])

S(id='Y4.B5.S5',
  direct=['placevalue:place_value_10x{"op":"/","power":[10],"band":10000}'],
  verdict='full',
  pre=[('placevalue:place_value_10x{"op":"x","power":[10],"band":1000}', 'Y4.B5.S3', 'L'), ('division:div_facts{"constant":[10]}', 'Y2.B5.S14', 'P'),
       ('placevalue:value', 'Y2.B1.S4', 'P'), ('placevalue:compare{"band":999}', 'Y3.B1.S12', 'P')],
  related=[('division:divide', 'division in other forms'), ('measurement:length_metric{"forms":[0]}', 'mm to cm divides by 10'),
           ('placevalue:place_value_10x{"op":"/","power":[10],"decimals":true}', 'later: dividing a 1-digit number by 10 (Y4.B8.S5)')],
  note='School teaches this as enrichment (W35).')

S(id='Y4.B5.S6',
  direct=['placevalue:place_value_10x{"op":"/","power":[100],"band":10000}'],
  verdict='full',
  pre=[('placevalue:place_value_10x{"op":"/","power":[10],"band":10000}', 'Y4.B5.S5', 'B'), ('division:div_facts{"constant":[10]}', 'Y2.B5.S14', 'P'),
       ('placevalue:value', 'Y2.B1.S4', 'P'), ('placevalue:place_value_10x{"op":"x","power":[100],"band":10000}', 'Y4.B5.S4', 'L')],
  related=[('measurement:length_metric{"forms":[1]}', 'cm to m divides by 100'), ('placevalue:place_value_10x{"op":"/","power":[100],"decimals":true}', 'Y4.B8.S10 divides 1- and 2-digit numbers by 100')])

S(id='Y4.B5.S7',
  partial=[('multiplication:mult_zeros{"forms":[2]}', 'multiplication only; not the matching division (120 ÷ 4 = 30) or the fact family of 3 × 4 = 12')],
  verdict='partial', missing='writing the related multiplication and division facts from one known fact scaled by 10 (3 × 4 = 12 so 30 × 4 = 120, 120 ÷ 4 = 30, 120 ÷ 30 = 4)',
  build=['tables_links'],
  pre=[('multiplication:mult_zeros{"forms":[0,1]}', 'Y4.B5.S4', 'B'), ('multiplication:mult_div_fact_family', 'Y3.B4.S6', 'P'),
       ('multiplication:mult_zeros', 'Y3.B4.S2', 'P'), ('multiplication:mult_properties', 'Y3.B4.S3', 'P'), ('placevalue:value', 'Y3.B1.S4', 'P')],
  related=[('multiplication:number_families_mult', 'number families'), ('division:missing_mult_div', 'missing factors'),
           ('number_sense:estimate_products', 'multiples of ten used to estimate')])

S(id='Y4.B5.S8',
  partial=[('multiplication:area_model_mult{"tiles":21}', 'the grid split, but not the informal partitioned layout with place-value counters'),
           ('multiplication:multiply{"tiles":21}', 'goes straight to the column method')],
  verdict='partial', missing='informal written multiplication by partitioning shown with place-value counters (23 × 4 = 20 × 4 + 3 × 4)',
  build=['informal_mult', 'vis_array_options'],
  pre=[('multiplication:mult_zeros{"forms":[2]}', 'Y4.B5.S7', 'B'), ('multiplication:area_model_mult', 'Y3.B4.S4', 'P'),
       ('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'P'), ('multiplication:mult_zeros', 'Y3.B4.S2', 'P')],
  related=[('multiplication:area_model_mult_hard', 'bigger area models'), ('area_perimeter:area_distributive_visual', 'the distributive area picture'),
           ('multiplication:mult_properties{"forms":[1]}', 'breaking apart')])

S(id='Y4.B5.S9',
  direct=['multiplication:multiply{"tiles":21}', 'multiplication:area_model_mult{"tiles":21}'],
  verdict='full',
  pre=[('multiplication:mult_zeros{"forms":[2]}', 'Y4.B5.S7', 'P'), ('multiplication:mult_facts', 'Y4.B4.S10', 'L'),
       ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'L'), ('multiplication:repeated_add_to_mult', 'Y1.B9.S5', 'P'), ('number_sense:estimate_products', 'Y3.B2.S20', 'P')],
  preBuild=['informal_mult'],
  related=[('multiplication:mult_word_problems', 'stories with 2-digit × 1-digit'), ('multiplication:mult_missing_digit', 'reasoning about digits'),
           ('division:box_division_easy', 'the inverse: 2-digit ÷ 1-digit')])

S(id='Y4.B5.S10',
  direct=['multiplication:multiply{"tiles":31}', 'multiplication:area_model_mult{"tiles":31}'],
  verdict='full',
  pre=[('multiplication:multiply{"tiles":21}', 'Y3.B4.S5', 'P'), ('placevalue:expand{"band":999}', 'Y3.B1.S6', 'P'),
       ('multiplication:mult_zeros{"forms":[1]}', 'Y4.B5.S4', 'L'), ('division:box_division_easy', 'Y3.B4.S7', 'P')],
  related=[('division:box_division_hard', 'the inverse'), ('number_sense:estimate_products', 'estimate first'),
           ('multiplication:mult_word_problems_plain', 'stories')])

S(id='Y4.B5.S11',
  direct=['division:divide{"tiles":21,"regroup":"none"}', 'division:box_division_easy', 'division:area_model_div_2by1'],
  verdict='full',
  pre=[('division:share_into_groups', 'Y3.B3.S5', 'P'), ('division:div_facts', 'Y2.B5.S16', 'P'), ('patterns:halve', 'Y2.B5.S11', 'P'),
       ('placevalue:expand{"band":99}', 'Y3.B1.S2', 'P'), ('multiplication:multiply{"tiles":21}', 'Y3.B4.S5', 'P')],
  related=[('division:div_word_problems', 'division stories'), ('division:div_check_by_multiplying', 'check by multiplying'),
           ('division:nl_div', 'division on a number line')])

S(id='Y4.B5.S12',
  direct=['division:divide{"tiles":21,"regroup":"always"}', 'division:area_model_div_2by1'],
  verdict='full',
  pre=[('division:divide{"tiles":21,"regroup":"none"}', 'Y4.B5.S11', 'B'), ('division:box_division_easy', 'Y3.B4.S7', 'P'),
       ('division:div_remainders', 'Y3.B4.S9', 'L'), ('placevalue:unit_form{"band":99,"rename":"more"}', 'Y3.B4.S8', 'L'),
       ('composing:base10_regroup', 'trading 1 ten for 10 ones with base-10 blocks (Grade 1-2 regrouping, the model of an exchange)', 'X')],
  related=[('division:remainder_interpret', 'what a remainder means when the exchange leaves one'), ('division:div_check_by_multiplying', 'check'),
           ('division:remainder_too_big', 'is the remainder finished?')],
  note='Step (2) is the exchange of a ten into ones (52 ÷ 4). box_division_easy deals exact no-exchange quotients, so it belongs to S11; divide with regroup "always" gives the exchange. Remainders stay a pre-skill (Y3.B4.S9).')

S(id='Y4.B5.S13',
  direct=['division:divide{"tiles":31}', 'division:box_division_hard', 'division:area_model_div_3by1'],
  verdict='full',
  pre=[('division:divide{"tiles":21,"regroup":"always"}', 'Y4.B5.S12', 'B'), ('division:div_remainders', 'Y3.B4.S9', 'P'),
       ('placevalue:expand{"band":999}', 'Y3.B1.S6', 'P'), ('multiplication:multiply{"tiles":31}', 'Y4.B5.S10', 'L')],
  related=[('division:div_zero_in_quotient', 'zero in the quotient'), ('division:remainder_interpret', 'remainders in context'),
           ('number_sense:estimate_quotient', 'estimate first')])

S(id='Y4.B5.S14',
  verdict='gap', missing='correspondence problems: how many combinations of n items with m items (3 shirts × 4 hats) using lists and tables',
  build=['correspondence'],
  pre=[('multiplication:arrays_groups', 'Y3.B3.S2', 'P'), ('multiplication:mult_facts', 'Y4.B4.S10', 'L'), ('multiplication:mult_word_problems', 'Y3.B4.S11', 'P')],
  preBuild=['how_many_ways'],
  related=[('multiplication:mult_word_problems_plain', 'multiplication stories'), ('probability:probability_basic', 'listing outcomes'),
           ('algebra:multi_step_word', 'reasoning with two quantities')])

S(id='Y4.B5.S15',
  partial=[('multiplication:mult_properties', 'order and breaking apart, but not choosing a method (doubling, near multiples, factor pairs) for a calculation')],
  verdict='partial', missing='choosing an efficient strategy for a given multiplication: doubling, near multiples (9 × 7 = 10 × 7 − 7), factor pairs, partitioning',
  build=['tables_links'],
  pre=[('number_theory:factor_links_easy', 'Y4.B5.S2', 'B'), ('multiplication:multiply{"tiles":21}', 'Y4.B5.S9', 'B'),
       ('patterns:double', 'Y2.B5.S11', 'P'), ('division:area_model_div_2by1', 'Y3.B4.S8', 'P')],
  preBuild=['mult_three'],
  related=[('multiplication:area_model_mult', 'partitioning as a method'), ('number_sense:compensation', 'compensation in addition'),
           ('number_sense:estimate_products', 'estimate to check')])

TAGFIXES += [
    dict(key='multiplication:mult_zeros', step='Y4.B5.S3', action='add', why='re-tag as FULL with forms [0] (S4: forms [1])'),
    dict(key='placevalue:place_value_10x', step='Y4.B5.S5', action='add', why='re-tag as FULL with op ÷, power [10] (S6: power [100])'),
    dict(key='multiplication:multiply', step='Y4.B5.S9', action='add', why='re-tag as FULL with tiles 21 (S10: tiles 31)'),
    dict(key='division:divide', step='Y4.B5.S11', action='add', why='missing tag: tiles 21, regroup none (S12: regroup always; S13: tiles 31)'),
    dict(key='multiplication:mult_properties', step='Y4.B5.S2', action='partial', why='kept partial (breaking apart by addition, not a factor pair)'),
    dict(key='division:box_division_easy', step='Y4.B5.S12', action='remove', why='deals exact quotients with no exchange-plus-remainder; it is the S11 skill'),
    dict(key='multiplication:multiply', step='Y4.B5.S8', action='partial', why='kept partial: the column method is not the informal layout'),
]
