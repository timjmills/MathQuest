# Round 4 after critic Y4 r3 (7.98): the four steps under 8, the housekeeping list, and brief rule 18 (links carry opts).
import json as _json
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def drop_pre(sid, *keys): _by[sid]['pre'] = [p for p in _by[sid].get('pre', []) if _base(p[0]) not in keys]
def drop_rel(sid, *keys): _by[sid]['related'] = [r for r in _by[sid].get('related', []) if _base(r[0]) not in keys]
def set_link(sid, role, key, new):
    """Replace the link `key` (base key) in pre or related by `new` (key with opts / @maxNumber)."""
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key: lst[i] = (new,) + tuple(e[1:]); hit = True
    assert hit, (sid, role, key)

# 1. B7.S4: mixed_nl_drag {} only places, and some items have no mixed number at all
NEW_PROPOSALS['mixed_nl_read'] = dict(kind='option', skill='fractions:mixed_nl_drag', option='forms "place" | "read the number at the arrow"; every item holds a mixed number',
    name='Read and Place Mixed Numbers on a Line (option)',
    teaches='write the mixed number an arrow points to on a 0-3 line, and place mixed numbers, with a mixed number on every item',
    representation='the existing nl-place line (wholes labelled); one mixed-number answer slot under the arrow for the read form',
    family='fractions', ccss=['3.NF.A.2'], why='generated mixed_nl_drag {} only drags labels onto a line, and 2 of 8 items have no mixed number ("1/3, 2/3")')
P('Y4.B7.S4', direct=[], partial=[('fractions:mixed_nl_drag', 'generated: places improper fractions and mixed numbers on 0-3 lines, but never asks what mixed number is at a point, and some items hold no mixed number at all ("1/3, 2/3", "2/3, 1")')],
  verdict='partial', missing='reading the mixed number at a marked point on a line, and a mixed number on every item', build=['mixed_nl_read'],
  note='Generated mixed_nl_drag {} (print path): place-only, and 2 of 8 items carry no mixed number.')

# 2. B12.S3: noise pre out; the building block is turns (Y3 Turns and angles, W28), which has no live skill
drop_pre('Y4.B12.S3', 'angles_lines:symmetry', 'shapes_early:compose_shapes')
_by['Y4.B12.S3']['pre'] = list(_by['Y4.B12.S3']['pre']) + [('angles_lines:identify_lines', 'Y3.B11.S5', 'X'), ('measurement:time_quarter', 'Y2.B9.S2', 'X')]
_by['Y4.B12.S3']['preBuild'] = ['turns']
drop_rel('Y4.B12.S3', 'placevalue:order_least_to_greatest')
_by['Y4.B12.S3']['note'] = ('The main building block is Y3 "Turns and angles" (W28), which has no live skill: preBuild turns. '
                           'identify_lines (horizontal, vertical, perpendicular) and quarter turns of a clock hand are the live building blocks.')

# 3. B9.S4: decimal pre-skills; decimal_pv (B9.S3) is the preBuild and the flexible partition is the build
_by['Y4.B9.S4']['pre'] = [('conversions:f_to_d{"denoms":[5]}', 'Y4.B8.S8', 'X'), ('conversions:d_to_f{"forms":[0]}', 'Y4.B8.S2', 'X')] + \
    [p for p in _by['Y4.B9.S4']['pre'] if _base(p[0]) != 'fractions:equiv_frac_visual']
P('Y4.B9.S4', build=['flex_partition'], preBuild=['decimal_pv'])

# 4. B1.S13: Roman numerals are additive (and subtractive) place-value writing; the clock is not the building block
_by['Y4.B1.S13']['pre'] = [('placevalue:expand{"band":99}', 'Y2.B1.S5', 'P'), ('placevalue:combine{"band":99}', 'Y2.B1.S8', 'X'),
                           ('addition:add_three', 'adding three numbers (Grade 1, 1.OA.A.2): XXVI = 10 + 10 + 5 + 1', 'X')]
_by['Y4.B1.S13']['note'] = ('Beyond CCSS (UK National Curriculum); taught as enrichment in W12. Pre-skills are the additive writing of a '
    'number (expanded form, recombining parts, adding three numbers): a Roman numeral is read by adding its symbols. '
    '"Y3 Roman numerals to 12" is band 12 of the same roman_numerals build, so it is not a separate preBuild; '
    'time_hour (the Y3 clock lesson) was dropped, it is not a building block of reading numerals.')

# Housekeeping
WK_OVERRIDE = {'Y4.B8.S1': 'W30', 'Y4.B8.S2': 'W30', 'Y4.B8.S3': 'W30'}   # W29 is the Geometry test and MAP week; the list is W30's
set_link('Y4.B8.S6', 'pre', 'placevalue:place_value_10x', 'placevalue:place_value_10x{"op":"/","power":[10],"band":1000}')
for i, e in enumerate(_by['Y4.B8.S6']['pre']):
    if _base(e[0]) == 'placevalue:place_value_10x': _by['Y4.B8.S6']['pre'][i] = (e[0], 'Y4.B5.S5', 'X')
drop_pre('Y4.B6.S9', 'area_perimeter:perimeter_intro')          # cited B6.S8 with opts B6.S8 does not use
_rel = [r for r in _by['Y4.B6.S9']['related'] if _base(r[0]) == 'area_perimeter:composite_shapes']
drop_rel('Y4.B6.S9', 'area_perimeter:composite_shapes')
_by['Y4.B6.S9']['pre'] = list(_by['Y4.B6.S9']['pre'][:1]) + [('area_perimeter:composite_shapes{"forms":[0]}', 'Y4.B6.S7', 'X')] + list(_by['Y4.B6.S9']['pre'][1:])
for sid in ('Y4.B8.S2', 'Y4.B8.S8'):
    _by[sid]['partial'] = [(('conversions:d_to_f{"forms":[0]}' if _base(k) == 'conversions:d_to_f' else k), m) for k, m in _by[sid]['partial']]
_by['Y4.B2.S7']['partial'] = [(k, m.replace('half the items are 3-digit (900 − 205, 800 − 351, 801 − 427)',
    'half the items are 3- or 2-digit (900 − 205, 700 − 515, 100 − 29)')) for k, m in _by['Y4.B2.S7']['partial']]
drop_pre('Y4.B14.S2', 'counting:count_sequence'); drop_pre('Y4.B14.S4', 'counting:count_sequence'); drop_pre('Y4.B3.S4', 'comparing:compare_groups')
_by['Y4.B14.S2']['pre'] = list(_by['Y4.B14.S2']['pre']) + [('angles_lines:identify_lines', 'Y3.B11.S5', 'P')]
_by['Y4.B14.S4']['pre'] = list(_by['Y4.B14.S4']['pre']) + [('shapes_early:shape_positions', 'Y2.B11.S1', 'X')]
_by['Y4.B3.S4']['pre'] = list(_by['Y4.B3.S4']['pre']) + [('placevalue:compare{"band":99}', 'comparing two counts (which is greater, by how much)', 'X')] if False else _by['Y4.B3.S4']['pre']

# B7.S1: whole_as_fraction deals n/1 on half its items (7 = 7/1); the step is one whole = n/n
NEW_PROPOSALS['whole_nn_only'] = dict(kind='option', skill='composing:whole_as_fraction', option='items "1 = n/n only" (no whole numbers over 1)',
    name='One Whole as n/n (option)', teaches='write one whole as a fraction from a shape cut into n equal parts (1 = 4/4), and say how many parts make the whole',
    representation='the existing cell with the cut shape beside the equation 1 = □/n (picture is a hint that fades)',
    family='fractions', ccss=['3.NF.A.3c'], why='generated whole_as_fraction {}: half the items are "write 7 as a fraction with denominator 1" (7/1)')
P('Y4.B7.S1', direct=[], partial=[
    ('composing:whole_as_fraction', 'generated: 1 = 5/5, 1 = 8/8, but half the items write a whole number over 1 (7 = 7/1, 9 = 9/1), which is not this step'),
    ('composing:compose_whole', 'generated: makes 1 whole from mixed unit fractions (halves and quarters); never names the whole as n/n')],
  verdict='partial', missing='a page of "one whole = n/n" only: how many equal parts make the whole, written as a fraction', build=['whole_nn_only'])
# B7.S13: sub_fractions_like asks to simplify (4/8 − 2/8 = 1/4, "Subtract and simplify"); Y4 leaves the difference as it is
NEW_PROPOSALS['frac_answer_as_is'] = dict(kind='option', skill='fraction_operations:sub_fractions_like', option='answer "as it is" (2/8) | "simplified" (1/4); also on sub_frac_like_nv',
    name='Leave the Answer Unsimplified (option)', teaches='subtract fractions with the same denominator and write the difference with that denominator (4/8 − 2/8 = 2/8), with no simplifying',
    representation='the existing frac-model cell; the key shows the unsimplified fraction',
    family='fractions', ccss=['3.NF.A.1', '4.NF.B.3a'], why='generated sub_fractions_like: keys are simplified (4/8 − 2/8 = 1/4, 7/10 − 3/10 = 2/5) and the _nv items say "Subtract and simplify"; simplifying is not taught until later')
P('Y4.B7.S13', direct=[], partial=[
    ('fraction_operations:sub_fractions_like', 'generated: same-denominator subtraction with a bar model, but the key simplifies (4/8 − 2/8 = 1/4, 7/10 − 3/10 = 2/5)'),
    ('fraction_operations:sub_frac_like_nv', 'generated: "Subtract and simplify: 7/10 − 3/10" → 2/5; simplifying is not this step')],
  verdict='partial', missing='differences left with the same denominator (4/8 − 2/8 = 2/8), no simplifying', build=['frac_answer_as_is'])

# Coordinate items stay in the step's grid: Max Number 10 holds coordinate_q1 to 10 (10,000 lets it reach 20)
for st in STEPS:
    for role in ('partial', 'pre', 'related'):
        st[role] = [((e[0] + '@10') if _base(e[0]) == 'coordinates:coordinate_q1' and '@' not in e[0] else e[0],) + tuple(e[1:]) for e in st.get(role, [])]

# Rule 18: pre and related links carry the opts that fit THIS step (linkfit.mjs: no link past 10,000 or 2 places)
for sid, role, key, new in [
    ('Y4.B8.S3', 'related', 'placevalue:place_value_10x', 'placevalue:place_value_10x{"op":"/","power":[10],"decimals":true,"band":1000}'),
    ('Y4.B1.S4', 'related', 'placevalue:place_value_10x', 'placevalue:place_value_10x{"op":"x","power":[10,100],"band":10000}'),
    ('Y4.B1.S13', 'related', 'placevalue:number_word_names', 'placevalue:number_word_names{"band":999}'),
    ('Y4.B6.S1', 'pre', 'placevalue:place_value_10x', 'placevalue:place_value_10x{"op":"x","power":[1000],"band":10000}'),
    ('Y4.B6.S2', 'pre', 'placevalue:place_value_10x', 'placevalue:place_value_10x{"op":"/","power":[10,100],"band":10000}'),
    ('Y4.B1.S12', 'related', 'decimals:order_decimals', 'decimals:order_decimals{"decimals":1}@10'),
    ('Y4.B7.S5', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B8.S2', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":1,"forms":[0]}@10'),
    ('Y4.B8.S4', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":1,"forms":[0]}@10'),
    ('Y4.B8.S8', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B8.S9', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B9.S3', 'related', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B9.S6', 'pre', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B10.S3', 'pre', 'decimals:compare_decimal', 'decimals:compare_decimal{"decimals":2,"forms":[0]}@10'),
    ('Y4.B8.S4', 'related', 'decimals:round_decimals', 'decimals:round_decimals{"precision":[0],"range":10}'),
    ('Y4.B10.S4', 'pre', 'decimals:round_decimals', 'decimals:round_decimals{"precision":[0],"range":10}'),
    ('Y4.B10.S3', 'pre', 'placevalue:order_least_to_greatest', 'placevalue:order_least_to_greatest{"band":9999}'),
]:
    set_link(sid, role, key, new)
drop_rel('Y4.B1.S16', 'number_sense:nearest_10000')
drop_rel('Y4.B1.S3', 'patterns:count_by_powers_of_10')   # counts by 100s to 800,600 whatever the Max Number; count_by_step_up is already a pre
drop_rel('Y4.B5.S8', 'multiplication:area_model_mult_hard')   # 97 × 193 is past the step; area_model_mult is already a pre           # Grade 4: past this step
for sid in ('Y4.B4.S2', 'Y4.B4.S6', 'Y4.B4.S10', 'Y4.B5.S15', 'Y4.B6.S4'):
    for role in ('pre', 'related'):
        _by[sid][role] = [(('patterns:double{"band":50}' if _base(e[0]) == 'patterns:double' else e[0]),) + tuple(e[1:]) for e in _by[sid][role]]
