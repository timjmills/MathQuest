# Round 5 after critic Y4 r4 (8.06, FAIL on rule 18): links held to THEIR step (mechanical; no verdict/build changes).
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def relink(sid, role, key, new, ref=None, kind=None):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if _base(e[0]) == key:
            e = (new,) + tuple(e[1:])
            if role == 'pre' and ref: e = (new, ref, kind or 'X')
            if role == 'related' and ref: e = (new, ref)
            lst[i] = e; hit = True
    assert hit, (sid, role, key)
def drop(sid, role, key): _by[sid][role] = [e for e in _by[sid][role] if _base(e[0]) != key]

# A. coordinate_q1 links: build.py now carries @10 onto pre/related links too (it was dropped there in round 4)
# B. count_by_step_up counts by 3s and 4s from 4-digit starts: true multiples from 0 or a held range instead
relink('Y4.B1.S3', 'pre', 'patterns:count_by_step_up', 'patterns:count_by_step_up{"step":[0],"range":1000}')
relink('Y4.B1.S4', 'pre', 'patterns:count_by_step_up', 'patterns:count_by_step_up{"step":[0],"range":1000}',
       'counting on in 10s along a line to 1,000 (Y3.B1.S14 counts in 50s, which no live skill deals: count_50s is this step\'s build)', 'X')
for sid in ('Y4.B4.S1', 'Y4.B4.S2'):
    relink(sid, 'pre', 'patterns:count_by_step_up', 'multiplication:count_by_tables{"constant":[3]}', 'Y2.B1.S16', 'P')
relink('Y4.B7.S2', 'pre', 'patterns:count_by_step_up', 'patterns:count_by_step_up{"step":[0],"range":100}',
       'counting on in equal steps (2s, 5s, 10s) within 100 (Y2.B1.S15): the same counting routine used for fractions', 'X')
relink('Y4.B11.S1', 'pre', 'patterns:count_by_step_up', 'multiplication:count_by_tables{"constant":[7,12]}',
       'counting in 7s (days in weeks) and 12s (months in years), the counts the conversions use (Y4.B4 times-tables)', 'X')
# C. area_model_mult {} deals 3-digit numbers and exchanges; the cited step is 2-digit × 1-digit
for sid in ('Y4.B4.S9', 'Y4.B4.S10', 'Y4.B5.S8', 'Y4.B5.S15'):
    relink(sid, 'pre', 'multiplication:area_model_mult', 'multiplication:area_model_mult{"tiles":21}')
relink('Y4.B5.S2', 'related', 'multiplication:area_model_mult', 'multiplication:area_model_mult{"tiles":21}')
# D / E. missing_mult_div and halve held to Max Number 100
for sid in ('Y4.B4.S2', 'Y4.B4.S4', 'Y4.B4.S7', 'Y4.B5.S7'):
    relink(sid, 'related', 'division:missing_mult_div', 'division:missing_mult_div@100')
relink('Y4.B5.S11', 'pre', 'patterns:halve', 'patterns:halve@100')
# F. round_decimals precision 0 is the nearest TENTH
relink('Y4.B10.S4', 'pre', 'decimals:round_decimals', 'decimals:round_decimals{"precision":[0],"range":10}',
       'rounding a decimal to the nearest tenth: the same rounding move one place over (no live skill rounds a decimal to the nearest whole; that is round_whole, the build of Y4.B9.S7)', 'X')
drop('Y4.B8.S4', 'related', 'decimals:round_decimals')
# Small
relink('Y4.B9.S4', 'pre', 'conversions:f_to_d', 'conversions:f_to_d{"denoms":[5]}', 'Y4.B8.S2', 'X')
relink('Y4.B5.S9', 'pre', 'multiplication:mult_facts', 'multiplication:mult_facts',
       'the times-table facts to 12 × 12 (Y4 block 4), used in every column of the multiplication', 'X')
drop('Y4.B9.S6', 'related', 'measurement:money_compare')
_by['Y4.B1.S8']['note'] = 'more_less_100 offers step 100 and 1,000 but 100 more/less only on 3-digit numbers; more_less_10 stops at 120. more_less_all closes the step.'
_by['Y4.B8.S5']['note'] = 'Generated place_value_10x {op:"/", power:[10], decimals:true}: 3-digit dividends (990 ÷ 10, 298 ÷ 10 = 29.8) on an H T O chart; div10_small_numbers closes it.'

# Found by the step-relative linkfit (and its stricter block-only run): links held to the step, or dropped
for sid in ('Y4.B4.S9', 'Y4.B4.S10'):   # area_model_mult cannot be held under 7 × 86; mult_properties {forms:[1]} (breaking apart) is already a pre
    drop(sid, 'pre', 'multiplication:area_model_mult')
relink('Y4.B4.S13', 'pre', 'multiplication:mult_zeros', 'multiplication:mult_zeros{"forms":[0]}')          # × 10 only (2 × 5 = 10, then × 7)
relink('Y4.B7.S2', 'pre', 'patterns:count_by_step_up', 'multiplication:count_by_tables{"constant":[2,5]}',
       'counting on in equal steps of 2 and 5 from 0 (Y2.B1.S15): the same counting routine used for fractions', 'X')
relink('Y4.B7.S8', 'related', 'division:remainder_interpret', 'division:remainder_interpret{"range":100}')
drop('Y4.B7.S14', 'related', 'subtraction:sub_across_zeros')                                              # a 3-digit analogy, not a fraction link
for sid, p in (('Y4.B8.S5', 10), ('Y4.B8.S10', 100)):
    relink(sid, 'pre', 'placevalue:place_value_10x', f'placevalue:place_value_10x{{"op":"/","power":[{p}],"band":1000}}')
for sid in ('Y4.B3.S1', 'Y4.B3.S2', 'Y4.B3.S4'):   # area {} also deals triangles (base 36, height 9); rectangles only, band 10
    relink(sid, 'related', 'area_perimeter:area', 'area_perimeter:area{"forms":[0],"band":10}')
relink('Y4.B1.S1', 'related', 'composing:number_word_form', 'composing:number_word_form{"range":1000}')
for sid in ('Y4.B9.S1', 'Y4.B9.S3', 'Y4.B9.S4'):
    for e in list(_by[sid]['related']):
        if _base(e[0]) == 'decimals:add_decimal': relink(sid, 'related', 'decimals:add_decimal', 'decimals:add_decimal{"decimals":1,"range":100}@10' if sid == 'Y4.B9.S1' else 'decimals:add_decimal{"decimals":2,"range":100}@10')
for sid in ('Y4.B9.S1', 'Y4.B9.S2'):
    relink(sid, 'related', 'measurement:money_change', 'measurement:money_change{"currency":"usd","band":100,"step":5}')
relink('Y4.B10.S2', 'related', 'measurement:length_metric', 'measurement:length_metric{"forms":[1]}')
for sid in ('Y4.B11.S2', 'Y4.B13.S1'):
    relink(sid, 'pre', 'patterns:seq_5', 'patterns:seq_5@100')
for sid in ('Y4.B2.S8', 'Y4.B5.S3'):
    relink(sid, 'pre', 'patterns:seq_10', 'patterns:seq_10@1000')
drop('Y4.B12.S1', 'related', 'coordinates:geo_rotate'); drop('Y4.B12.S1', 'related', 'angles_lines:additive_angles')   # degrees (270°, 112°): Grade 4+
drop('Y4.B14.S4', 'related', 'coordinates:geo_rotate')
