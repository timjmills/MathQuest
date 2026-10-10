# Round 11 after critic Y4 r10 (3 classes + 3 isolated; cited titles; why wording). Links, plus B6.S5 / B6.S7 clauses.
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def drop(sid, role, *keys): _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) not in keys]
def relink(sid, role, key, new, ref=None, kind='X'):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key:
            if ref: lst[i] = (new, ref, kind) if role == 'pre' else (new, ref)
            else: lst[i] = (new,) + tuple(e[1:])
            hit = True
    assert hit, (sid, role, key)

# D. composite_shapes labels T-shape shoulders 2.5 / 3.5 (half units) at W20-W21
for sid, ref in (('Y4.B6.S6', 'Y4.B6.S5'), ('Y4.B6.S8', 'Y4.B6.S7'), ('Y4.B6.S9', 'Y4.B6.S7')):
    relink(sid, 'pre', 'area_perimeter:composite_shapes', 'area_perimeter:perimeter_grid', ref)
_HALF = 'some T-shapes label sides 2.5 / 3.5 (decimal side lengths before W29)'
NEW_PROPOSALS['composite_whole_sides'] = dict(kind='option', skill='area_perimeter:composite_shapes', option='sides "whole numbers only" (a T-shape\'s shoulders split evenly)',
    name='Composite Shapes With Whole-Number Sides (option)',
    teaches='find the perimeter of an L-, T- or U-shape whose side lengths are all whole numbers',
    representation='the existing composite-shape cell; only the dealing changes',
    family='measurement', ccss=['3.MD.D.8'], why='generated composite_shapes {forms:[0]}: T-shapes label sides 2.5 and 3.5 (half the difference of the two widths), decimals the pupil meets in W29')
P('Y4.B6.S5', direct=[], partial=[
    ('area_perimeter:perimeter_grid', 'counts the edges of rectilinear shapes on a grid; never a shape with its side lengths written'),
    ('area_perimeter:composite_shapes{"forms":[0]}', 'perimeter of L-, T- and U-shapes with the lengths given, but ' + _HALF)],
  verdict='partial', missing='perimeter of rectilinear shapes from written whole-number side lengths (no decimal side lengths before W29)',
  build=['composite_whole_sides'], note='Generated composite_shapes {forms:[0]}: T-shapes label sides 2.5 and 3.5.')
_by['Y4.B6.S7']['partial'] = [(k, m + '; ' + _HALF) if _base(k) == 'area_perimeter:composite_shapes' else (k, m) for k, m in _by['Y4.B6.S7']['partial']]
_by['Y4.B6.S7']['build'] = list(_by['Y4.B6.S7']['build']) + ['composite_whole_sides']
CLOSES.setdefault('Y4.B6.S7', {}).update({'missing_lengths': 'finding a side length not given before the perimeter', 'composite_whole_sides': 'decimal side lengths before W29'})
_by['Y4.B6.S7']['missing'] += '; the composite shapes must have whole-number sides (no 2.5 / 3.5 before W29)'
ENVISION['Y4.B6.S5'] = {'composite_whole_sides': 'add the written whole-number sides of an L-, T- or U-shape to find its perimeter'}
ENVISION.setdefault('Y4.B6.S7', {})['composite_whole_sides'] = 'the same shapes with whole-number sides only, so the missing side is a whole number'

# T'. 7s and 9s at W01
for sid in ('Y4.B4.S1', 'Y4.B4.S2'): relink(sid, 'pre', 'multiplication:dot_array_mult', 'multiplication:dot_array_mult{"band":25}')
relink('Y4.B4.S2', 'related', 'multiplication:mult_word_problems', 'multiplication:mult_chart{"task":"fill","constant":[6],"band":100}', 'the 6 row of the chart')

# C. cite the step the skill deals, and name the gap
IL = 'Y3.B11.S6 Parallel and perpendicular (lower grade, same CCSS cluster; Y3.B11.S5 Horizontal and vertical has no live skill)'
for sid in ('Y4.B12.S1', 'Y4.B12.S2', 'Y4.B12.S3', 'Y4.B12.S5', 'Y4.B12.S6', 'Y4.B14.S1', 'Y4.B14.S2'):
    relink(sid, 'pre', 'angles_lines:identify_lines', 'angles_lines:identify_lines', IL)
relink('Y4.B11.S1', 'pre', 'measurement:time_sense', 'measurement:time_sense', 'Y3.B10.S5 Use a.m. and p.m. (lower grade, same CCSS cluster; Y3.B10.S6 Years, months and days is time_calendar, this step\'s build)')
for sid in ('Y4.B11.S3', 'Y4.B12.S1'):
    relink(sid, 'pre', 'measurement:clock_parts', 'measurement:clock_parts', 'the clock face: the numbers 1-12 in their places (the face every time step reads)')
relink('Y4.B5.S14', 'pre', 'multiplication:mult_word_problems', 'multiplication:mult_word_problems{"range":100}', 'equal-groups stories (Y3.B4.S11 How many ways has no live skill; correspondence is this step\'s build)')

# Isolated misfits
relink('Y4.B2.S10', 'related', 'division:div_check_by_multiplying', 'division:div_check_by_multiplying@100')
relink('Y4.B5.S8', 'related', 'area_perimeter:area_distributive_visual', 'area_perimeter:area_distributive_visual{"band":50}')
relink('Y4.B6.S8', 'related', 'shapes_classify:classify_triangles', 'shapes_early:shape_attributes', 'sides and vertices of polygons: a regular polygon\'s sides are all equal')

# W. why wording
relink('Y4.B1.S8', 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', 'hundreds placed on a 1,000-wide piece of the 0-10,000 line (3,000-4,000, ticks of 100)')
relink('Y4.B5.S9', 'related', 'multiplication:mult_word_problems', 'multiplication:mult_word_problems', 'equal-groups stories: the facts each column of the multiplication uses')
relink('Y4.B1.S9', 'related', 'number_sense:round_nl_thousands', 'number_sense:round_nl_thousands', 'a 1,000-wide piece of the 0-10,000 line, used to round to the nearest 1,000')
for sid in ('Y4.B6.S1', 'Y4.B6.S2'):
    relink(sid, 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', '4-digit numbers placed on a 1,000-wide piece of the 0-10,000 line (metres before kilometres)')
relink('Y4.B1.S3', 'related', 'number_sense:rounding_visual', 'number_sense:rounding_visual{"place":100,"band":1000}', 'a 100-wide piece of the 0-1,000 line, used to round to the nearest 100')
for sid, w in (('Y4.B8.S2', 'an amount written from coins with the point ($7.05): the digits after the point are the cents'),
               ('Y4.B8.S9', 'an amount written from coins with the point: dollars before it, cents after it'),
               ('Y4.B9.S3', 'an amount written from coins with the point ($3.45 = 3 dollars and 45 cents)')):
    relink(sid, 'related', 'measurement:money_notation', 'measurement:money_notation{"currency":"usd"}', w)
# G18 where the re-cite would land on another table: keep the true prior-learning step and name the gap
for sid, n_opts, text in (('Y4.B4.S2', '{"constant":[3]}', 'Y2.B1.S16 Count in 3s (prior learning wk W01; nearest live practice: count_by_tables is not tagged to it)'),
                          ('Y4.B4.S5', '{"constant":[5,10]}', 'Y3.B3.S4 Multiples of 5 and 10 (prior learning wk W02; nearest live practice: count_by_tables is not tagged to it)')):
    for i, e in enumerate(_by[sid]['pre']):
        if e[0] == 'multiplication:count_by_tables' + n_opts: _by[sid]['pre'][i] = (e[0], text, 'X')

# The critic's own10 scan (r10 checks) on round 11
# line-span whys: the lines are a 1,000-wide piece, so the why must not say "0-10,000"
relink('Y4.B1.S8', 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', 'hundreds placed on a line between two thousands (such as 3,000-4,000, ticks of 100)')
relink('Y4.B1.S9', 'related', 'number_sense:round_nl_thousands', 'number_sense:round_nl_thousands', 'a line between two thousands, used to round to the nearest 1,000')
for sid in ('Y4.B6.S1', 'Y4.B6.S2'):
    relink(sid, 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', '4-digit numbers placed on a line between two thousands (metres before kilometres)')
# dividends of 100+ in the checks; ÷ 10 / ÷ 100 of whole numbers is W35 (B5.S5, B5.S6)
drop('Y4.B2.S10', 'related', 'division:div_check_by_multiplying')
for sid in ('Y4.B5.S11', 'Y4.B5.S12'): drop(sid, 'related', 'division:div_check_by_multiplying')
drop('Y4.B5.S12', 'related', 'division:remainder_too_big')           # 112 ÷ 9 at W06
drop('Y4.B5.S3', 'related', 'placevalue:place_value_10x'); drop('Y4.B5.S4', 'related', 'placevalue:place_value_10x')
drop('Y4.B8.S7', 'pre', 'placevalue:place_value_10x'); drop('Y4.B8.S10', 'pre', 'placevalue:place_value_10x')
# area is first taught W18 (B3.S1)
drop('Y4.B5.S1', 'related', 'area_perimeter:area_unit_squares'); drop('Y4.B5.S15', 'pre', 'division:area_model_div_2by1')
relink('Y4.B5.S8', 'related', 'area_perimeter:area_distributive_visual', 'multiplication:repeated_add_to_mult', '23 × 4 as 23 + 23 + 23 + 23: the repeated addition partitioning shortens')
# quarters as decimals (0.75) before W33
for sid in ('Y4.B8.S8', 'Y4.B8.S9', 'Y4.B9.S3'): drop(sid, 'related', 'decimals:compare_decimal')
drop('Y4.B9.S6', 'pre', 'decimals:compare_decimal')
_dn = [e for e in _by['Y4.B9.S6']['related'] if _base(e[0]) == 'decimals:decimal_nl_drag']
drop('Y4.B9.S6', 'related', 'decimals:decimal_nl_drag')
_by['Y4.B9.S6']['pre'] = [('decimals:decimal_nl_drag{"ticks":"some"}', 'Y4.B8.S4', 'X')] + list(_by['Y4.B9.S6']['pre'])
_by['Y4.B9.S6']['related'] = list(_by['Y4.B9.S6']['related']) + [('decimals:order_decimals{"decimals":1}@10', 'ordering tenths first: the same routine with one decimal place')]
