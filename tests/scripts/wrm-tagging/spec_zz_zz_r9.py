# Round 9 after critic Y4 r8 (9 new misfit links found by fresh seeds; why texts). Links only (+ B7.S7/S8 clauses).
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def drop(sid, role, *keys): _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) not in keys]
def relink(sid, role, key, new, ref=None, kind='X'):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key:
            lst[i] = ((new, ref, kind) if role == 'pre' else (new, ref)) if ref else (new,) + tuple(e[1:]); hit = True
    assert hit, (sid, role, key)

# R. improper_mixed's "Click ALL fractions equal to" branch scales to 15ths-24ths (54/15, 93/24) whatever `denoms` says
for sid in ('Y4.B7.S11', 'Y4.B7.S12', 'Y4.B7.S14', 'Y4.B7.S15'):
    relink(sid, 'pre', 'fractions:improper_mixed', 'fractions:mixed_improper_visual', 'Y4.B7.S6')
for sid in ('Y4.B7.S3', 'Y4.B7.S4', 'Y4.B7.S5'):
    relink(sid, 'related', 'fractions:improper_mixed', 'fractions:mixed_improper_visual', 'the same amount as a mixed number and an improper fraction')
# B7.S7 / B7.S8 use improper_mixed as their own partial skill: the 15ths-24ths items breach the step too (named in the clause)
_X = '; its "Click ALL fractions equal to" items also scale to 15ths-24ths (54/15, 93/24), past the step\'s twelfths'
for sid in ('Y4.B7.S7', 'Y4.B7.S8'):
    _by[sid]['partial'] = [(k, m + _X) if _base(k) == 'fractions:improper_mixed' else (k, m) for k, m in _by[sid]['partial']]
    _by[sid]['missing'] += ', with denominators no larger than twelfths'
NEW_PROPOSALS['improper_mixed_dir']['teaches'] += '; the click-all equivalents stay at twelfths or below'
# Later-grade concepts
drop('Y4.B12.S5', 'related', 'shapes_classify:mixed_shapes')          # nets and 3-D cross-sections (6.G.A.4, 7.G.A.3)
drop('Y4.B5.S14', 'related', 'probability:probability_basic')         # probability as a fraction in W06 (7.SP)
# why texts that must say what the skill deals
relink('Y4.B7.S10', 'related', 'fractions:fraction_nl_drag', 'fractions:fraction_nl_drag{"denoms":[2]}', 'quarters or eighths placed on a 0-1 line, one denominator a line')
relink('Y4.B7.S9', 'related', 'fractions:graph_fractions', 'fractions:graph_fractions{"denoms":[2]}', 'halves, quarters and eighths placed on a 0-1 line')
relink('Y4.B4.S7', 'related', 'multiplication:mult_word_problems', 'multiplication:mult_word_problems{"range":100}', 'equal-groups stories (the facts the stories use)')
for sid in ('Y4.B6.S1', 'Y4.B6.S2'):
    relink(sid, 'related', 'number_sense:place_on_number_line', 'number_sense:place_on_number_line{"span":1000,"band":10000}', '4-digit numbers placed on a 0-10,000 line (metres before kilometres)')
relink('Y4.B9.S8', 'pre', 'composing:compose_whole', 'composing:compose_whole{"parts":[0]}', 'Y3.B6.S4')   # halves, quarters and eighths only
for sid in ('Y4.B4.S2', 'Y4.B4.S4', 'Y4.B4.S7', 'Y4.B4.S9', 'Y4.B4.S10'):
    for i, e in enumerate(_by[sid]['related']):
        if _base(e[0]) == 'multiplication:mult_word_problems': _by[sid]['related'][i] = (e[0], 'equal-groups stories (the facts the stories use)')
drop('Y4.B4.S8', 'related', 'multiplication:mult_div_fact_family')   # 11 × 12 = 132 past the step (12s are taught the same week)
drop('Y4.B9.S7', 'related', 'fractions:round_fractions')             # fifths as decimals (0.4 = 2/5)
# B9.S8 (halves and quarters as decimals): pre links held to halves and quarters
relink('Y4.B9.S8', 'pre', 'shapes_early:partition_shapes', 'shapes_early:partition_shapes{"parts":[2],"forms":[0]}')   # fourths, "how many equal parts?" (the shaded form offers 4/3 decoys)
relink('Y4.B9.S8', 'pre', 'fractions:benchmark_fractions', 'measurement:money_notation{"currency":"usd"}', 'Y3.B9.S1')   # a quarter is 25¢ = $0.25 (no eighths)
relink('Y4.B5.S11', 'related', 'division:div_word_problems', 'division:div_word_problems{"range":100}')
