# Round 6 after critic Y4 r5 (extended rule 18: size per step and school week, content, layout). Links only.
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def drop(sid, role, *keys): _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) not in keys]
def relink(sid, role, key, new, ref=None, kind='X'):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key:
            lst[i] = ((new, ref, kind) if role == 'pre' else (new, ref)) if ref else (new,) + tuple(e[1:]); hit = True
    assert hit, (sid, role, key)
def add(sid, role, *items): _by[sid][role] = list(_by[sid][role]) + list(items)

# §3 size misfits
for sid in ('Y4.B4.S2', 'Y4.B4.S4', 'Y4.B4.S7'): drop(sid, 'related', 'division:missing_mult_div')   # tables not yet taught; no table option
relink('Y4.B5.S4', 'pre', 'patterns:seq_10', 'patterns:seq_10@1000')
for sid in ('Y4.B5.S11', 'Y4.B5.S12'): relink(sid, 'related', 'division:div_check_by_multiplying', 'division:div_check_by_multiplying@100')
drop('Y4.B5.S13', 'related', 'division:div_zero_in_quotient')
relink('Y4.B6.S2', 'pre', 'multiplication:multiply', 'multiplication:multiply{"tiles":21}')
drop('Y4.B6.S2', 'related', 'conversions:double_num_line')
relink('Y4.B6.S2', 'pre', 'placevalue:expand', 'placevalue:expand{"band":9999}', 'Y3.B1.S6', 'X')   # label: 4-digit partition met in W14-W16 column work
drop('Y4.B9.S5', 'pre', 'placevalue:compare'); add('Y4.B9.S5', 'pre', ('placevalue:compare{"band":99}', 'Y2.B1.S13', 'X'))

# §4 content misfits
for sid in ('Y4.B13.S3', 'Y4.B13.S4', 'Y4.B14.S1', 'Y4.B14.S2'): drop(sid, 'related', 'coordinates:coordinate_graph')   # C1 four quadrants
for sid, role, key in (('Y4.B6.S3', 'related', 'coordinates:coord_polygon'), ('Y4.B6.S9', 'related', 'coordinates:coord_polygon'),
                       ('Y4.B14.S2', 'related', 'coordinates:coord_polygon'), ('Y4.B14.S4', 'pre', 'coordinates:coord_polygon'),
                       ('Y4.B14.S1', 'related', 'coordinates:coord_distance_q1'), ('Y4.B14.S3', 'related', 'coordinates:coord_distance_q1'),
                       ('Y4.B14.S5', 'related', 'coordinates:coord_distance_q1')):
    relink(sid, role, key, key + '@10')                                                                        # C2
# C3 customary units: unit_conversions / unit_conversion_word show customary keys even on metric pages (display defect, report)
for sid in ('Y4.B6.S1', 'Y4.B6.S2', 'Y4.B11.S1'): drop(sid, 'related', 'measurement:unit_conversions', 'measurement:unit_conversion_word')
drop('Y4.B11.S2', 'related', 'measurement:unit_conversion_word')
relink('Y4.B6.S3', 'related', 'area_perimeter:perimeter', 'area_perimeter:perimeter{"forms":[0],"band":20}')
drop('Y4.B6.S4', 'related', 'area_perimeter:perimeter')
relink('Y4.B6.S4', 'related', 'area_perimeter:area', 'area_perimeter:area{"forms":[0],"band":10}')
drop('Y4.B6.S7', 'related', 'area_perimeter:mixed_area_perimeter')
for sid in ('Y4.B6.S1', 'Y4.B6.S4', 'Y4.B6.S5'): drop(sid, 'pre', 'measurement:reading_ruler', 'measurement:estimate_length')   # inch rulers, feet
drop('Y4.B7.S15', 'related', 'fraction_operations:frac_word_mixed')       # cups
drop('Y4.B13.S1', 'related', 'graphs:line_plot'); drop('Y4.B13.S2', 'related', 'graphs:mixed_graphs')   # inches
# C4 decimals before W29; the money steps (W07-W22) cite later decimal steps
drop('Y4.B7.S4', 'related', 'decimals:decimal_nl_drag'); drop('Y4.B7.S5', 'related', 'decimals:compare_decimal')
drop('Y4.B7.S10', 'related', 'fraction_operations:frac_10_100')
drop('Y4.B10.S2', 'pre', 'placevalue:place_value_10x', 'conversions:f_to_d')
drop('Y4.B10.S3', 'pre', 'decimals:compare_decimal'); drop('Y4.B10.S4', 'pre', 'decimals:round_decimals')
drop('Y4.B10.S5', 'related', 'decimals:add_decimal')
# C5 unlike-fraction compares (Grade 3 compares same numerator or same denominator only)
drop('Y4.B7.S5', 'pre', 'fractions:compare'); drop('Y4.B9.S5', 'related', 'fractions:compare')
drop('Y4.B7.S6', 'related', 'fractions:mixed_fractions'); drop('Y4.B7.S7', 'related', 'fractions:mixed_fractions')
drop('Y4.B1.S11', 'related', 'algebra:inequalities')                       # C6

# Found by the new linkfit (step-relative size, content)
drop('Y4.B1.S13', 'related', 'placevalue:number_word_names'); add('Y4.B1.S13', 'related', ('composing:number_word_form{"range":100}', 'another way of writing a number to 100'))
drop('Y4.B1.S15', 'related', 'number_sense:nearest_1000')                  # 4-digit rounding is the next step
relink('Y4.B2.S8', 'pre', 'patterns:seq_10', 'patterns:seq_10@100')
relink('Y4.B2.S8', 'related', 'subtraction:sub_check_by_adding', 'subtraction:sub_check_by_adding{"range":100}')
relink('Y4.B4.S3', 'related', 'division:div_word_problems', 'division:div_word_problems{"range":100}')
for sid in ('Y4.B4.S3', 'Y4.B4.S12', 'Y4.B5.S1', 'Y4.B5.S2'):
    for role in ('pre', 'related'):
        if any(_base(e[0]) == 'multiplication:mult_div_fact_family' for e in _by[sid][role]):
            relink(sid, role, 'multiplication:mult_div_fact_family', 'multiplication:mult_div_fact_family@100')
relink('Y4.B5.S2', 'pre', 'multiplication:mult_facts', 'multiplication:mult_facts{"constant":[10],"band":100}')
drop('Y4.B5.S2', 'related', 'multiplication:area_model_mult')
drop('Y4.B5.S11', 'pre', 'multiplication:multiply')                        # products to 891; div_facts is the building block
drop('Y4.B5.S15', 'pre', 'multiplication:multiply', 'multiplication:area_model_mult'); drop('Y4.B5.S15', 'related', 'number_sense:estimate_products')
relink('Y4.B6.S6', 'pre', 'algebra:tape_diagram', 'algebra:tape_diagram{"band":50}')
for sid in ('Y4.B8.S2', 'Y4.B8.S8'): relink(sid, 'pre', 'placevalue:value', 'placevalue:value{"band":99}')
for sid in ('Y4.B8.S3', 'Y4.B8.S9'):
    relink(sid, 'pre', 'placevalue:pv_digit_drag', 'placevalue:place_value_disks{"band":99}', 'Y2.B1.S4', 'X')
    relink(sid, 'pre', 'placevalue:expand', 'placevalue:expand{"band":99}', 'Y2.B1.S5', 'X')
drop('Y4.B8.S3', 'related', 'placevalue:place_value_10x')
relink('Y4.B9.S3', 'pre', 'placevalue:expand', 'placevalue:expand{"band":99}', 'Y2.B1.S5', 'X')
drop('Y4.B9.S7', 'related', 'number_sense:estimate_sums_diffs')
drop('Y4.B10.S3', 'pre', 'placevalue:compare'); add('Y4.B10.S3', 'pre', ('placevalue:compare{"band":999}', 'Y3.B1.S12', 'X'))
for sid in ('Y4.B12.S1', 'Y4.B12.S2', 'Y4.B12.S3'): drop(sid, 'related', 'angles_lines:measure_angles')   # protractor degrees: Grade 4
for sid in ('Y4.B12.S4', 'Y4.B12.S6'): drop(sid, 'pre', 'shapes_early:compose_from_attributes')            # prints 90°

# Top-ups: every step keeps >= 3 pre and >= 1 related (real building blocks / the same idea)
add('Y4.B5.S2', 'related', ('multiplication:mult_properties{"forms":[0]}', 'the order of factors: a factor pair multiplies either way round'))
add('Y4.B5.S15', 'related', ('multiplication:mult_zeros{"forms":[0]}', '× 10 is the anchor of near multiples (9 × 7 = 10 × 7 − 7)'))
for sid in ('Y4.B6.S1', 'Y4.B6.S2'):
    add(sid, 'related', ('number_sense:place_on_number_line{"span":1000,"band":10000}', '1 km = 1,000 m: distances in metres placed on a 0-10,000 line'))
add('Y4.B7.S5', 'pre', ('composing:whole_as_fraction', 'Y4.B7.S1', 'X'))
add('Y4.B11.S1', 'related', ('division:div_facts{"constant":[7]}', 'the inverse: 21 days ÷ 7 = 3 weeks'))
add('Y4.B12.S1', 'related', ('measurement:time_quarter', 'a clock hand turning a quarter: quarter past, half past, quarter to'))
add('Y4.B13.S4', 'related', ('graphs:tally_chart', 'the table of data a line graph is drawn from'))
drop('Y4.B4.S3', 'related', 'multiplication:mult_div_fact_family')          # deals 10 × 11 = 110 even at Max Number 100
drop('Y4.B10.S2', 'related', 'measurement:length_metric')                   # 9 m = 900 cm is the B6 metric strand (W36)
relink('Y4.B10.S5', 'pre', 'addition:add_1k_regroup', 'addition:add_100_regroup', 'Y2.B2.S16', 'X')   # dollar totals stay under 100
relink('Y4.B10.S6', 'pre', 'algebra:tape_diagram', 'algebra:tape_diagram{"band":50}')
relink('Y4.B10.S6', 'related', 'number_ops_mixed:word_problems_mixed_plain', 'number_ops_mixed:word_problems_mixed_plain@100')
drop('Y4.B5.S5', 'related', 'division:divide')                            # its default page is a long-division layout (92 ÷ 4); div_facts {constant:[10]} is the pre

# Pre links that cited a step the SCHOOL teaches later: re-cite the earlier learning the pupil has met by this week
def recite(sid, key, new, ref):
    st = _by[sid]; st['pre'] = [((new, ref, 'X') if _base(e[0]) == key and ('9999' in e[0] or key in ('multiplication:mult_zeros', 'number_sense:compensation')) else e) for e in st['pre']]
recite('Y4.B1.S8', 'placevalue:unit_form', 'placevalue:unit_form{"band":999}', 'Y3.B1.S8')
recite('Y4.B1.S16', 'placevalue:compare', 'placevalue:compare{"band":999}', 'Y3.B1.S12')
recite('Y4.B2.S1', 'placevalue:unit_form', 'placevalue:unit_form{"band":999}', 'Y3.B1.S8')
recite('Y4.B2.S2', 'placevalue:expand', 'placevalue:expand{"band":999}', 'Y3.B1.S6')
recite('Y4.B5.S8', 'multiplication:mult_zeros', 'multiplication:mult_zeros{"forms":[0]}', 'Y3.B4.S1')
recite('Y4.B5.S15', 'number_sense:compensation', 'number_sense:compensation', 'Y3.B2.S10')
recite('Y4.B9.S6', 'placevalue:order_least_to_greatest', 'placevalue:order_least_to_greatest{"band":999}', 'Y3.B1.S13')
recite('Y4.B10.S3', 'placevalue:order_least_to_greatest', 'placevalue:order_least_to_greatest{"band":999}', 'Y3.B1.S13')
for sid in ('Y4.B8.S5', 'Y4.B8.S6'): drop(sid, 'pre', 'placevalue:place_value_10x')   # whole-number ÷ 10 is W35; the ×10 / ÷10 facts are the met block
add('Y4.B9.S6', 'pre', ('conversions:f_to_d{"denoms":[5]}', 'Y4.B8.S8', 'X'))   # hundredths written as decimals (W31) before ordering them
