# Round 8 after critic Y4 r7 (21 links on 18 steps; rules 18-19). Links only.
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
TENTHS_LINE = 'decimals:decimal_nl_drag{"ticks":"some"}'      # tenths on a 0-1 line (B8.S4, W30): clean on every seed set
TENTHS_FRAC = 'fractions:write_fraction{"denoms":[5]}'          # tenths as fractions (B8.S1, W30): fifths and tenths only, no decimals

# C. f_to_d / d_to_f: a drag-bin branch that ignores denoms prints 25/50/75% tiles and quarters as decimals before W33,
#    and its plain items need fifths (0.4 = 2/5). frac_10_100(_nv) is not clean either: its "click the equal fractions"
#    item (0.25 = 1/4, 40/1000 decoys) comes whatever `forms` says on the print path. Relinked to the clean tenths skills.
relink('Y4.B8.S6', 'pre', 'conversions:f_to_d', TENTHS_LINE, 'Y4.B8.S4')
drop('Y4.B8.S7', 'related', 'conversions:f_to_d', 'fraction_operations:frac_10_100_nv')
drop('Y4.B8.S8', 'pre', 'fraction_operations:frac_10_100')
relink('Y4.B8.S9', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
relink('Y4.B8.S10', 'pre', 'conversions:f_to_d', TENTHS_LINE, 'Y4.B8.S4')
relink('Y4.B9.S1', 'pre', 'conversions:d_to_f', TENTHS_LINE, 'Y4.B8.S4')
relink('Y4.B9.S2', 'pre', 'fraction_operations:frac_10_100', TENTHS_FRAC, 'Y4.B8.S1')
relink('Y4.B9.S3', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
relink('Y4.B9.S4', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
relink('Y4.B9.S4', 'pre', 'conversions:d_to_f', TENTHS_LINE, 'Y4.B8.S4')
relink('Y4.B9.S5', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
relink('Y4.B9.S6', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
drop('Y4.B9.S8', 'pre', 'fraction_operations:frac_10_100'); drop('Y4.B9.S8', 'related', 'conversions:d_to_f')
relink('Y4.B10.S1', 'pre', 'conversions:f_to_d', TENTHS_FRAC, 'Y4.B8.S1')
# F. equivalence links that deal past twelfths (select_equiv_frac 15ths-40ths; equiv_frac_nv 24ths; equivalent form 0 16ths)
for sid in ('Y4.B7.S6', 'Y4.B7.S7', 'Y4.B7.S8'): drop(sid, 'pre', 'fractions:select_equiv_frac')
drop('Y4.B7.S9', 'related', 'fractions:select_equiv_frac', 'fractions:equiv_frac_nv')
_rel = [e for e in _by['Y4.B7.S10']['related'] if _base(e[0]) == 'composing:fraction_number_line']
drop('Y4.B7.S10', 'related', 'composing:fraction_number_line')
relink('Y4.B7.S10', 'pre', 'fractions:equivalent', 'composing:fraction_number_line', 'Y3.B6.S9')   # equivalent fractions on a line (2nds-8ths)
relink('Y4.B9.S8', 'pre', 'fractions:equivalent', 'composing:compose_whole', 'Y3.B6.S4')          # halves and quarters making a whole
# D / U. decimal and unlike-denominator arithmetic from a later grade
drop('Y4.B9.S2', 'related', 'decimals:sub_decimal'); drop('Y4.B7.S11', 'related', 'fraction_operations:fraction_bar_ops', 'fractions:fraction_bar_ops')
# Lead ruling: add_decimal has no make-a-whole option (decimal_whole is the build of Y4.B9.S1-S2): dropped
for sid in ('Y4.B9.S1', 'Y4.B9.S3', 'Y4.B9.S4'): drop(sid, 'related', 'decimals:add_decimal')
# B12.S6: a met building block, and the right citation
add('Y4.B12.S6', 'pre', ('shapes_early:shape_corners_count', 'Y2.B3.S3', 'X'))
for i, e in enumerate(_by['Y4.B12.S6']['pre']):
    if _base(e[0]) == 'shapes_early:name_2d_shapes': _by['Y4.B12.S6']['pre'][i] = (e[0], 'Y3.B11.S7', 'X')
_by['Y4.B12.S6']['note'] = ''
# Minor: equal-groups stories and chart windows held to the step
for sid, role in (('Y4.B4.S2', 'related'), ('Y4.B4.S7', 'related'), ('Y4.B6.S8', 'related'), ('Y4.B10.S5', 'related')):
    if any(_base(e[0]) == 'multiplication:mult_word_problems' for e in _by[sid][role]):
        relink(sid, role, 'multiplication:mult_word_problems', 'multiplication:mult_word_problems{"range":100}')
for i, e in enumerate(_by['Y4.B4.S2']['related']):
    if _base(e[0]) == 'multiplication:mult_word_problems': _by['Y4.B4.S2']['related'][i] = (e[0], 'equal-groups and array stories (the facts the stories use)')
if any(_base(e[0]) == 'multiplication:mult_word_problems_plain' for e in _by['Y4.B5.S14']['related']):
    relink('Y4.B5.S14', 'related', 'multiplication:mult_word_problems_plain', 'multiplication:mult_word_problems_plain{"range":100}')
for sid, n in (('Y4.B4.S1', 3), ('Y4.B4.S3', 6), ('Y4.B4.S5', 9), ('Y4.B4.S8', 7), ('Y4.B4.S11', 1)):
    relink(sid, 'related', 'multiplication:mult_chart', f'multiplication:mult_chart{{"task":"fill","constant":[{n}],"band":100}}')   # 10 × 10 window: no 11s/12s given
add('Y4.B7.S9', 'related', ('fractions:graph_fractions', 'fractions marked on a line (halves to eighths): equal ones land on one point'))
add('Y4.B7.S10', 'related', ('fractions:fraction_nl_drag{"denoms":[2]}', 'quarters and eighths placed on one line: 2/4 and 4/8 share a point'))
add('Y4.B8.S7', 'related', ('measurement:money_notation{"currency":"usd"}', 'cents are hundredths of a dollar (37¢ = $0.37)'))
add('Y4.B8.S8', 'pre', (TENTHS_LINE, 'Y4.B8.S4', 'X'))
