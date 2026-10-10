# Round 10 after critic Y4 r9 (15 links in two classes + 1 isolated; why texts). Links only. The critic's fix table.
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

# T. the 11s and 12s before W03 (mult_div_fact_family, multiples and nl_mult have no table hold at their defaults)
for sid in ('Y4.B4.S4', 'Y4.B4.S7'):
    relink(sid, 'pre', 'multiplication:mult_div_fact_family', 'multiplication:number_families_mult', 'Y3.B4.S6')
drop('Y4.B4.S5', 'related', 'multiplication:mult_div_fact_family')
relink('Y4.B4.S5', 'pre', 'number_theory:multiples', 'multiplication:count_by_tables{"constant":[5,10]}', 'Y3.B3.S4')
relink('Y4.B4.S4', 'related', 'number_theory:multiples', 'multiplication:mult_chart{"task":"fill","constant":[9],"band":100}', 'the 9 row of the chart')
relink('Y4.B4.S6', 'related', 'number_theory:multiples', 'multiplication:mult_chart{"task":"fill","constant":[3,6,9],"band":100}', 'the 3, 6 and 9 rows of the chart')
relink('Y4.B4.S4', 'related', 'multiplication:nl_mult', 'multiplication:nl_mult{"constant":[9]}', 'hops of 9 along a number line')
relink('Y4.B4.S7', 'related', 'multiplication:nl_mult', 'multiplication:nl_mult{"constant":[7]}', 'hops of 7 along a number line')
for sid, n in (('Y4.B4.S9', 11), ('Y4.B4.S10', 12)):
    drop(sid, 'related', 'number_theory:multiples')
    relink(sid, 'related', 'multiplication:mult_chart', f'multiplication:mult_chart{{"task":"fill","constant":[{n}],"band":144}}', f'the {n} row and column of the chart')
# S. story factors and divisors of 13-20 at their default range
for sid in ('Y4.B4.S5', 'Y4.B4.S9', 'Y4.B4.S10'): relink(sid, 'related', 'division:div_word_problems', 'division:div_word_problems{"range":100}')
relink('Y4.B4.S4', 'related', 'multiplication:mult_word_problems', 'multiplication:mult_word_problems{"range":100}')
relink('Y4.B5.S14', 'pre', 'multiplication:mult_word_problems', 'multiplication:mult_word_problems{"range":100}')
relink('Y4.B5.S13', 'related', 'division:remainder_interpret', 'division:remainder_interpret{"range":100}')
# Isolated: rounding to tenths is a later step
relink('Y4.B9.S7', 'related', 'number_sense:round_sort_tenths', 'number_sense:round_sort_10', 'sorting by the nearer ten: the same halfway rule between two neighbours')
# whys and opts
relink('Y4.B9.S8', 'pre', 'shapes_early:partition_shapes', 'shapes_early:partition_shapes{"parts":[0,2],"forms":[0]}')   # halves and fourths
relink('Y4.B1.S8', 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', '4-digit numbers placed on a 0-10,000 line (where 1,000 more lands)')
for sid in ('Y4.B8.S2', 'Y4.B8.S6', 'Y4.B8.S8', 'Y4.B8.S9', 'Y4.B8.S10', 'Y4.B9.S3'):
    relink(sid, 'related', 'measurement:money_notation', 'measurement:money_notation{"currency":"usd"}')   # the $ sign prints

# The critic's own9 why checks on CITED titles: a cited step that names one table / one family while the link deals several
def recite_txt(sid, key, text, new=None):
    lst = _by[sid]['pre']; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key and (new is None or True):
            lst[i] = (new or e[0], text, 'X'); hit = True
    assert hit, (sid, key)
FACTS = 'the times-table facts to 12 × 12 (Y4 block 4, taught W01-W03)'
for sid in ('Y4.B4.S13', 'Y4.B5.S1', 'Y4.B5.S14', 'Y4.B6.S8', 'Y4.B7.S7', 'Y4.B7.S10'):
    if any(e[0] == 'multiplication:mult_facts' for e in _by[sid]['pre']): recite_txt(sid, 'multiplication:mult_facts', FACTS)
for sid in ('Y4.B6.S8', 'Y4.B7.S8', 'Y4.B5.S11'):
    if any(e[0] == 'division:div_facts' for e in _by[sid]['pre']): recite_txt(sid, 'division:div_facts', 'the division facts for the tables to 12 (Y4 block 4, taught W01-W03)')
recite_txt('Y4.B4.S6', 'multiplication:count_by_tables', 'counting along the 3, 6 and 9 tables (Y4.B4.S1, S2 and S4, wk W01-W02)')
for i, e in enumerate(_by['Y4.B4.S7']['pre']):
    if e[0] == 'multiplication:mult_facts{"constant":[2,5,10]}': _by['Y4.B4.S7']['pre'][i] = (e[0], 'the 2, 5 and 10 facts (Y3), the anchors for the 7s', 'X')
    if e[0] == 'multiplication:mult_facts{"constant":[3,6,9]}': _by['Y4.B4.S7']['pre'][i] = (e[0], 'the 3, 6 and 9 facts (Y4 W01-W02), the anchors for the 7s', 'X')
for i, e in enumerate(_by['Y4.B4.S8']['pre']):
    if e[0] == 'multiplication:mult_facts{"constant":[2,5,10]}': _by['Y4.B4.S8']['pre'][i] = (e[0], 'the 2, 5 and 10 facts (Y3), the anchors for the 7s', 'X')
recite_txt('Y4.B7.S10', 'multiplication:mult_chart', 'the multiplication chart: equivalent fractions sit in two rows of the same columns (Y4 block 4)')
for sid in ('Y4.B3.S2', 'Y4.B7.S1', 'Y4.B8.S1', 'Y4.B12.S7'):
    for i, e in enumerate(_by[sid]['pre']):
        if _base(e[0]) == 'shapes_early:partition_shapes': _by[sid]['pre'][i] = ('shapes_early:partition_shapes{"parts":[0]}',) + tuple(e[1:])   # halves, as the cited step says
for sid in ('Y4.B8.S2', 'Y4.B8.S7', 'Y4.B8.S8', 'Y4.B8.S9', 'Y4.B9.S2', 'Y4.B9.S3', 'Y4.B9.S4', 'Y4.B9.S5', 'Y4.B9.S6', 'Y4.B10.S1'):
    for i, e in enumerate(_by[sid]['pre']):
        if e[0] == 'fractions:write_fraction{"denoms":[5]}': _by[sid]['pre'][i] = (e[0], 'tenths and fifths written as fractions (Y4.B8.S1 Tenths as fractions, wk W30)', 'X')
drop('Y4.B4.S12', 'related', 'composing:whole_as_fraction')   # fractions before W07
# hold the re-cited fact links to 10 × 10 (12 × 10 = 120 is past these steps' own numbers)
for sid in ('Y4.B4.S13', 'Y4.B5.S1', 'Y4.B5.S14', 'Y4.B6.S8', 'Y4.B7.S7', 'Y4.B7.S10', 'Y4.B7.S8', 'Y4.B5.S11'):
    for i, e in enumerate(_by[sid]['pre']):
        if e[0] == 'multiplication:mult_facts' and e[1] == FACTS: _by[sid]['pre'][i] = ('multiplication:mult_facts{"band":100}', 'the times-table facts to 10 × 10 (Y3 and Y4 block 4)', 'X')
        if e[0] == 'division:div_facts': _by[sid]['pre'][i] = ('division:div_facts{"band":100}', 'the division facts to 100 ÷ 10 (Y3 and Y4 block 4)', 'X')
        if e[0] == 'multiplication:mult_chart': _by[sid]['pre'][i] = ('multiplication:mult_chart{"band":100}', e[1], 'X')
for sid in ('Y4.B5.S3', 'Y4.B8.S6'):
    for i, e in enumerate(_by[sid]['pre']):
        if e[0] == 'multiplication:mult_zeros': _by[sid]['pre'][i] = ('multiplication:mult_zeros{"forms":[0]}',) + tuple(e[1:])   # × 10, as "Multiples of 10" says
