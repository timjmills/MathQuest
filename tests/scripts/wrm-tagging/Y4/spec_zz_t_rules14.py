# Rules 14-17 (after critic Y2-Y3 r2). 14: an earlier step's skill the step builds on is PRE, never only related, and pre is
# ranked by how directly it is a building block (the main block first). 15: >= 3 pre where earlier learning exists.
_by = {s['id']: s for s in STEPS}
def to_pre(sid, key, ref, first=False):
    """Move `key` (any opts) from related to pre, citing the earlier step `ref`."""
    st = _by[sid]
    hit = [r for r in st.get('related', []) if r[0].split('{')[0] == key]
    assert hit, (sid, key)
    st['related'] = [r for r in st['related'] if r[0].split('{')[0] != key]
    items = [(h[0], ref, 'X') for h in hit]
    st['pre'] = (items + list(st.get('pre', []))) if first else (list(st.get('pre', [])) + items)

# (step, key, earlier step it comes from, main building block?)
for sid, key, ref, main in [
    ('Y4.B1.S2', 'placevalue:identify', 'Y3.B1.S8', False),
    ('Y4.B1.S6', 'placevalue:pv_digit_drag', 'Y4.B1.S5', True),
    ('Y4.B1.S8', 'placevalue:value', 'Y3.B1.S8', False),
    ('Y4.B1.S8', 'addition:add_sub_100s', 'Y3.B2.S4', False),
    ('Y4.B1.S13', 'placevalue:combine', 'Y4.B1.S6', False),
    ('Y4.B1.S17', 'number_sense:round_nl_thousands', 'Y4.B1.S16', False),
    ('Y4.B1.S17', 'number_sense:round_sort_1000', 'Y4.B1.S16', False),
    ('Y4.B2.S1', 'placevalue:unit_form', 'Y4.B1.S6', True),
    ('Y4.B2.S8', 'subtraction:sub_10k_regroup', 'Y4.B2.S6', True),
    ('Y4.B2.S8', 'number_sense:make_a_ten', 'Y3.B2.S6', False),
    ('Y4.B2.S9', 'number_sense:rounding_table', 'Y4.B1.S17', True),
    ('Y4.B2.S10', 'addition:number_families_add', 'Y2.B2.S3', False),
    ('Y4.B4.S6', 'multiplication:count_by_tables', 'Y4.B4.S2', False),
    ('Y4.B4.S9', 'multiplication:area_model_mult', 'Y3.B4.S4', False),
    ('Y4.B4.S10', 'multiplication:area_model_mult', 'Y3.B4.S4', False),
    ('Y4.B4.S12', 'multiplication:mult_div_fact_family', 'Y3.B4.S6', False),
    ('Y4.B4.S13', 'multiplication:mult_zeros', 'Y3.B4.S1', False),
    ('Y4.B5.S2', 'number_theory:factors_identify', 'Y4.B5.S1', True),
    ('Y4.B5.S2', 'multiplication:mult_facts', 'Y4.B4.S11', False),
    ('Y4.B5.S8', 'multiplication:mult_properties', 'Y4.B5.S2', True),
    ('Y4.B5.S15', 'multiplication:area_model_mult', 'Y4.B5.S9', False),
    ('Y4.B5.S15', 'number_sense:compensation', 'Y4.B2.S8', False),
    ('Y4.B6.S1', 'placevalue:place_value_10x', 'Y4.B5.S4', False),
    ('Y4.B6.S8', 'shapes_early:name_2d_shapes', 'Y3.B11.S7', False),
    ('Y4.B7.S2', 'patterns:count_by_step_up', 'Y2.B1.S16', False),
    ('Y4.B7.S4', 'composing:fraction_number_line', 'Y3.B6.S7', True),
    ('Y4.B7.S6', 'fractions:mixed_nl_drag', 'Y4.B7.S4', True),
    ('Y4.B7.S7', 'fractions:mixed_nl_drag', 'Y4.B7.S4', False),
    ('Y4.B7.S8', 'fractions:mixed_nl_drag', 'Y4.B7.S4', False),
    ('Y4.B7.S9', 'fractions:mixed_nl_drag', 'Y4.B7.S4', False),
    ('Y4.B8.S3', 'placevalue:expand', 'Y4.B1.S6', False),
    ('Y4.B8.S4', 'fractions:mixed_nl_drag', 'Y4.B7.S4', False),
    ('Y4.B8.S5', 'conversions:d_to_f', 'Y4.B8.S2', True),
    ('Y4.B8.S5', 'decimals:decimal_nl_drag', 'Y4.B8.S4', False),
    ('Y4.B8.S6', 'conversions:f_to_d', 'Y4.B8.S2', True),
    ('Y4.B8.S9', 'placevalue:expand', 'Y4.B1.S6', False),
    ('Y4.B8.S10', 'conversions:f_to_d', 'Y4.B8.S8', True),
    ('Y4.B9.S1', 'fraction_operations:add_fractions_like', 'Y4.B7.S11', True),
    ('Y4.B10.S2', 'conversions:f_to_d', 'Y4.B8.S8', False),
    ('Y4.B10.S3', 'decimals:compare_decimal', 'Y4.B9.S5', True),
    ('Y4.B10.S3', 'placevalue:order_least_to_greatest', 'Y4.B1.S12', False),
    ('Y4.B10.S4', 'decimals:round_decimals', 'Y4.B9.S7', True),
    ('Y4.B10.S4', 'measurement:money', 'Y3.B9.S3', True),
    ('Y4.B11.S3', 'measurement:time_quarter', 'Y2.B9.S2', False),
    ('Y4.B11.S4', 'measurement:time_1min', 'Y3.B10.S3', True),
    ('Y4.B12.S4', 'shapes_early:compose_from_attributes', 'Y2.B3.S7', False),
    ('Y4.B12.S6', 'shapes_early:compose_from_attributes', 'Y2.B3.S7', False),
    ('Y4.B13.S4', 'graphs:bar_graph', 'Y4.B13.S1', True),
]:
    to_pre(sid, key, ref, first=main)

# Guard: the cap of 8 would drop the weakest (last) pre-skill, never the main block (none passes it today).
for st in STEPS:
    if len(st.get('pre', [])) > 8: st['pre'] = st['pre'][:8]

# 15: steps with fewer than 3 pre-skills must say why
_by['Y4.B1.S13']['note'] += ' Pre-skills are few because Roman numerals have no earlier WRM step except "Roman numerals to 12" (band 12 of the same build).'
_by['Y4.B1.S8']['related'] = list(_by['Y4.B1.S8'].get('related', [])) + [('number_sense:place_on_number_line{"span":1000,"band":10000}', 'jumps of 1,000 along a 0-10,000 line: the same move pictured')]

# 14 (ranking): the main building block first, not the nearest step.
def rank(sid, *keys):
    pre = list(_by[sid].get('pre', []))
    front = []
    for k in keys:
        for p in pre:
            if p not in front and (p[0] == k or p[0].split('{')[0] == k): front.append(p); break
    _by[sid]['pre'] = front + [p for p in pre if p not in front]
def add_first(sid, item): _by[sid]['pre'] = [item] + [p for p in _by[sid].get('pre', []) if p[0] != item[0]]

add_first('Y4.B1.S5', ('placevalue:place_value_disks{"band":999}', 'Y3.B1.S5', 'X'))
rank('Y4.B1.S5', 'placevalue:place_value_disks', 'composing:base10_build_hundreds', 'placevalue:value')
rank('Y4.B4.S1', 'patterns:count_by_step_up', 'multiplication:mult_facts', 'division:div_facts')
rank('Y4.B4.S2', 'multiplication:mult_facts', 'patterns:double', 'division:div_facts')
for sid, n, src in (('Y4.B4.S3', 6, 'Y4.B4.S2'), ('Y4.B4.S5', 9, 'Y4.B4.S4'), ('Y4.B4.S8', 7, 'Y4.B4.S7')):
    add_first(sid, (f'multiplication:mult_facts{{"constant":[{n}],"support":["array"]}}', src, 'X'))
rank('Y4.B5.S11', 'division:div_facts', 'placevalue:expand')
rank('Y4.B5.S12', 'composing:base10_regroup', 'placevalue:unit_form')
add_first('Y4.B6.S8', ('area_perimeter:perimeter{"forms":[0]}', 'Y4.B6.S4', 'X'))
rank('Y4.B6.S8', 'area_perimeter:perimeter', 'multiplication:mult_facts', 'shapes_early:name_2d_shapes', 'shapes_early:count_sides_vertices_2d')
# B7.S13: subtracting builds on adding fractions (the inverse, B7.S11); place_value_disks was noise
_by['Y4.B7.S13']['pre'] = [p for p in _by['Y4.B7.S13']['pre'] if not p[0].startswith('placevalue:place_value_disks')]
to_pre('Y4.B7.S13', 'fraction_operations:add_fractions_like', 'Y4.B7.S11', first=True)
rank('Y4.B9.S2', 'fraction_operations:frac_10_100', 'composing:make_ten', 'subtraction:missing_add_sub')
rank('Y4.B13.S1', 'measurement:bar_graph_intro', 'measurement:pictograph_intro', 'graphs:build_bar_graph')
for st in STEPS:
    if len(st.get('pre', [])) > 8: st['pre'] = st['pre'][:8]
