# Round 2 after the Y2-Y3 critic: verdicts re-judged from GENERATED items (6 per skill+opts,
# tests/scripts/.tmp-y4-gen.cjs, range 10,000, seeds 500-505), options as values, pre filtered to the domain.
_by = {s['id']: s for s in STEPS}
def P(sid, **k): _by[sid].update(k)
def drop_pre(sid, *keys): _by[sid]['pre'] = [p for p in _by[sid].get('pre', []) if p[0].split('{')[0] not in keys]
def drop_rel(sid, *keys): _by[sid]['related'] = [p for p in _by[sid].get('related', []) if p[0].split('{')[0] not in keys]

# B1.S4: count_by_powers_of_10 step [2] deals 10,000s to 1,000,000s, never 1,000s within 10,000 (generated).
P('Y4.B1.S4', direct=[], partial=[
    ('placevalue:place_value_disks{"band":9999}', 'reads 4-digit numbers from counters; never shows 1,000 as 10 hundreds or counts in 1,000s'),
    ('patterns:count_by_powers_of_10{"step":[2]}', 'generated items count in 10,000s-1,000,000s, not 1,000s within 10,000')],
  missing='1,000 = 10 hundreds as an exchange; counting in 1,000s within 10,000',
  note='Generated: count_by_powers_of_10 {step:[2]} gave "Count down by 100,000s", "Count up by 1,000,000s"; no 1,000s within 10,000.')
P('Y4.B1.S5', pre=[p for p in _by['Y4.B1.S5']['pre'] if not p[0].startswith('patterns:count_by_powers_of_10')])
drop_pre('Y4.B1.S9', 'patterns:count_by_powers_of_10')
drop_rel('Y4.B1.S8', 'patterns:count_by_powers_of_10'); drop_rel('Y4.B2.S1', 'patterns:count_by_powers_of_10')
drop_pre('Y4.B1.S17', 'composing:make_ten')
P('Y4.B1.S14', direct=['number_sense:rounding_visual{"place":10,"band":1000}', 'number_sense:nearest_10'],
  note='Generated: rounding_visual {place:10, band:1000} rounds 3-digit numbers (272 → 270); nearest_10 deals 2-digit numbers, the review form.')

# B2.S1: add_sub_patterns does not close this step (it is pattern spotting).
P('Y4.B2.S1', build=['add_sub_place_units'])
P('Y4.B2.S3', partial=[('addition:add_10k_regroup', 'generated items mix one and several exchanges and include 3-digit + 3-digit (868 + 697)')])
P('Y4.B2.S4', partial=[('addition:add_10k_regroup', 'generated items mix one and several exchanges (8,357 + 484 has two, 1,678 + 235 has two, 4,678 + 4,813 three)')])

P('Y4.B2.S10', partial=[('subtraction:sub_check_by_adding', 'generated: 3-digit subtractions only (525 − 457 = 68); no checking an addition by subtracting, no 4-digit numbers, no checking by estimating')])
for _t in TAGFIXES:
    if _t['key'] == 'subtraction:sub_check_by_adding': _t['why'] = '3-digit subtraction only (generated); the step checks 4-digit sums and differences both ways'

# B3
drop_pre('Y4.B3.S1', 'patterns:seq_2'); drop_pre('Y4.B3.S2', 'patterns:seq_5')
drop_rel('Y4.B3.S4', 'graphs:bar_graph')
P('Y4.B3.S3', partial=[('shapes_early:compose_rect_from_squares', 'generated: every item is the same 2 × 3 rectangle to fill; never different shapes with the same area')])

# B4
drop_pre('Y4.B4.S12', 'composing:odd_even'); drop_rel('Y4.B4.S11', 'algebra:solve_unknown')
drop_rel('Y4.B4.S13', 'order_of_operations:two_ops_no_paren')
P('Y4.B4.S1', direct=['multiplication:count_by_tables{"constant":[3]}', 'multiplication:mult_chart{"task":"shade","constant":[3]}'],
  related=[('multiplication:mult_facts{"constant":[3]}', 'the 3 times-table facts'), ('number_theory:multiples', 'multiples of other numbers (no table option: it mixes 6, 7, 8 …)'),
           ('patterns:skip_count_line', 'counting in 3s on a line')],
  note='Generated: number_theory:multiples has no table option and dealt multiples of 8, 6, 10, 7, 9 — moved to related.')

# B5
NEW_PROPOSALS['factor_pair_strategy'] = dict(kind='option', skill='multiplication:mult_properties', option='form "split a factor into a factor pair"',
    name='Use Factor Pairs to Multiply (option)', teaches='replacing a factor by a factor pair to make the product easy: 14 × 5 = 7 × 2 × 5 = 7 × 10; 12 × 4 = 12 × 2 × 2',
    representation='equation chain cell: 14 × 5 = □ × □ × 5 = □ × 10 = □, boxes in a row; the factor pair drawn as two branches under the split factor (hint, fades)',
    family='multiplication', ccss=['3.OA.B.5', '4.OA.B.4'], why='mult_properties breaks apart by addition only; mult_three multiplies three given numbers and never splits one')
NEW_PROPOSALS['scaled_fact_family'] = dict(kind='option', skill='multiplication:mult_zeros', option='form "related facts ×10" (both operations)',
    name='Related Facts Times Ten (option)', teaches='from a known fact write the scaled facts: 3 × 4 = 12 so 30 × 4 = 120, 120 ÷ 4 = 30, 120 ÷ 30 = 4',
    representation='a known-fact box at the top of the cell, then three equations with one answer box each; place-value counters beside the first (hint, fades)',
    family='multiplication', ccss=['3.NBT.A.3', '3.OA.B.6'], why='mult_zeros {forms:[2]} deals only the multiplication (generated: 70 × 4, 8 × 30); tables_links is about doubling tables, not ×10')
NEW_PROPOSALS['div_exchange'] = dict(kind='option', skill='division:divide', option='exchange "none" / "in the tens" (tiles 21, 31)',
    name='Division With or Without an Exchange (option)', teaches='2- and 3-digit ÷ 1-digit held to no exchange (84 ÷ 4) or to an exchange of a ten (52 ÷ 4), with no remainder',
    representation='the existing bus-stop/bracket cell with the exchange box; only the dealing changes',
    family='division', ccss=['3.OA.B.5', '4.NBT.B.6'], why='generated: divide {regroup:"none"} mixes 76 ÷ 4 (exchange) with 88 ÷ 2 (none); regroup "always" means a remainder, not an exchange')
P('Y4.B5.S2', build=['factor_pair_strategy'], preBuild=[])
P('Y4.B5.S7', build=['scaled_fact_family'])
P('Y4.B5.S15', build=['tables_links', 'factor_pair_strategy'], preBuild=[])
P('Y4.B5.S11', direct=['division:area_model_div_2by1'],
  partial=[('division:divide{"tiles":21,"regroup":"none"}', 'generated items mix no-exchange (88 ÷ 2) with exchange (76 ÷ 4, 96 ÷ 4)'),
           ('division:box_division_easy', 'generated items mix no-exchange (86 ÷ 2) and exchange (72 ÷ 4)')],
  verdict='partial', missing='a page held to no exchange (84 ÷ 4, 69 ÷ 3)', build=['div_exchange'],
  note='area_model_div_2by1 is the WRM partition picture; it is direct for the method but the page cannot be held to no exchange either.')
P('Y4.B5.S12', direct=['division:area_model_div_2by1'],
  partial=[('division:divide{"tiles":21,"regroup":"none"}', 'exchange items appear (76 ÷ 4) but mixed with no-exchange items')],
  verdict='partial', missing='a page held to an exchange of a ten with no remainder (52 ÷ 4, 72 ÷ 3)', build=['div_exchange'],
  pre=[('division:area_model_div_2by1', 'Y3.B4.S8', 'P'), ('division:div_remainders', 'Y3.B4.S9', 'L'),
       ('placevalue:unit_form{"band":99,"rename":"more"}', 'Y3.B4.S8', 'L'),
       ('composing:base10_regroup', 'trading 1 ten for 10 ones (the exchange inside the division)', 'X')],
  related=[('division:divide{"tiles":21,"regroup":"always"}', 'the same layout with a remainder every item (generated: 78 ÷ 4 = 19 R 2)'),
           ('division:div_check_by_multiplying', 'check by multiplying'), ('division:remainder_too_big', 'is the remainder finished?')],
  note='Generated: divide {regroup:"always"} gives a remainder on every item, so "regroup" is the remainder option, not the exchange.')

# B6
drop_pre('Y4.B6.S3', 'patterns:seq_2'); drop_rel('Y4.B6.S6', 'coordinates:coord_distance_q1')
P('Y4.B6.S1', partial=[('measurement:length_metric{"forms":[3]}', 'generated: only "How many m are in 7 km?"; no sense of 1 km, no mixed km and m')])

# B8: place_value_10x with decimals deals 3-digit numbers (274 ÷ 10 = 27.4); the steps are 1- and 2-digit.
NEW_PROPOSALS['div10_small_numbers'] = dict(kind='option', skill='placevalue:place_value_10x', option='band "1-digit" and "2-digit" when decimals are on',
    name='Divide 1- and 2-Digit Numbers by 10 and 100 (option)', teaches='7 ÷ 10 = 0.7, 34 ÷ 10 = 3.4, 7 ÷ 100 = 0.07, 34 ÷ 100 = 0.34 on a place-value chart with the digits sliding right',
    representation='the existing shift-chart cell (O . t h columns, arrows under the digits), one decimal answer box with a fixed point',
    family='placevalue', ccss=['4.NF.C.6', '5.NBT.A.2'], why='generated: place_value_10x {op:"/", decimals:true} dealt 274 ÷ 10, 866 ÷ 100; the smallest band is 1,000')
for sid, miss in (('Y4.B8.S5', 'only 1-digit numbers ÷ 10 (7 ÷ 10 = 0.7)'), ('Y4.B8.S6', 'only 2-digit numbers ÷ 10 (34 ÷ 10 = 3.4)'),
                  ('Y4.B8.S10', '1- and 2-digit numbers ÷ 100 (7 ÷ 100 = 0.07, 34 ÷ 100 = 0.34)')):
    p = 100 if sid == 'Y4.B8.S10' else 10
    P(sid, direct=[], partial=[(f'placevalue:place_value_10x{{"op":"/","power":[{p}],"decimals":true}}', f'generated items divide 3-digit numbers (274 ÷ {p}); the step needs {miss}')],
      verdict='partial', missing=miss, build=['div10_small_numbers'])
P('Y4.B8.S4', direct=['decimals:decimal_nl_drag{"ticks":"one"}'],
  note='Generated: tenths on a 0-1 line (0.2, 0.4, 0.8). WRM also goes past 1; the 0-1 line is the core of the step.')

# B10: US dollars as option values.
P('Y4.B10.S1', direct=['measurement:money_notation{"currency":"usd"}'])
P('Y4.B10.S2', partial=[('measurement:money_notation{"currency":"usd"}', 'writes the amount shown in coins; never converts 345¢ ↔ $3.45')])
P('Y4.B10.S5', direct=['measurement:money{"currency":"usd","step":5,"band":2000,"regroup":"mixed"}', 'measurement:money_change{"currency":"usd","step":5,"band":2000,"paid":"note"}'],
  note='Generated with defaults the money skill added whole dollars only (16, 8); with step 5 and USD it deals dollars and cents.')
P('Y4.B10.S6', partial=[('measurement:money{"currency":"usd","step":5}', 'one-step totals only'), ('measurement:money_change{"currency":"usd","step":5}', 'one-step change only')])
P('Y4.B10.S3', partial=[('measurement:money_compare{"response":"sign"}', 'coin sets only, and no US currency option (plain or riyal); not written amounts or ordering')],
  note='money_compare has no usd value: the money_compare_written option should add it.')
drop_pre('Y4.B10.S5', 'fractions:identify')

# B11
P('Y4.B11.S3', direct=['measurement:time_analog_digital{"dir":"to-digital","precision":1}', 'measurement:time_analog_digital{"dir":"to-analog","precision":1}'])
drop_rel('Y4.B11.S1', 'measurement:elapsed_mixed')

# B12-B14
drop_rel('Y4.B12.S5', 'area_perimeter:perimeter'); P('Y4.B12.S4', preBuild=[])
drop_pre('Y4.B14.S3', 'fractions:identify'); drop_rel('Y4.B14.S4', 'addition:add_facts')

TAGFIXES[:] = [t for t in TAGFIXES if not (t['key'] == 'division:box_division_easy' and t['step'] == 'Y4.B5.S12')
               and not (t['key'] == 'number_theory:multiples')
               and not (t['key'] == 'patterns:count_by_powers_of_10')
               and not (t['key'] == 'placevalue:place_value_10x' and t['step'] == 'Y4.B8.S5')]
TAGFIXES += [
    dict(key='patterns:count_by_powers_of_10', step='Y4.B1.S4', action='partial', why='generated items count in 10,000s and up, not 1,000s'),
    dict(key='number_theory:multiples', step='Y4.B4.S1', action='remove', why='no table option; generated items are multiples of 6, 7, 8, 9, 10'),
    dict(key='division:box_division_easy', step='Y4.B5.S11', action='partial', why='mixes exchange and no-exchange items'),
    dict(key='division:box_division_easy', step='Y4.B5.S12', action='remove', why='not an exchange-only page; S11 skill'),
    dict(key='division:area_model_div_2by1', step='Y4.B5.S11', action='add', why='direct method; page not held to no exchange'),
    dict(key='placevalue:place_value_10x', step='Y4.B8.S5', action='partial', why='generated 3-digit ÷ 10; step is 1-digit (S6 2-digit, S10 ÷100 likewise)'),
    dict(key='measurement:money_notation', step='Y4.B10.S1', action='add', why='full with opts currency usd'),
    dict(key='measurement:money_change', step='Y4.B10.S5', action='add', why='full with opts currency usd, step 5'),
]
