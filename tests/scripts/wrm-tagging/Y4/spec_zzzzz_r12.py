# Round 12 after critic Y4 r11 (re-cites that ignore options; perimeter_grid deals written sides; whys).
_by = {s['id']: s for s in STEPS}
def _base(k): return k.split('{')[0].split('@')[0]
def setwhy(sid, role, full_key, text, kind='X'):
    lst = _by[sid][role]; hit = False
    for i, e in enumerate(lst):
        if e[0] == full_key:
            lst[i] = (e[0], text, kind) if role == 'pre' else (e[0], text); hit = True
    assert hit, (sid, role, full_key)

# C'. labels where the re-cite ignored the link's options (the gap is named where no tagged step fits)
setwhy('Y4.B1.S3', 'pre', 'patterns:count_by_step_up{"step":[0],"range":1000}', 'Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18; tagged there by a hand tagFix, critic Y4 r11)')
TAGFIXES.append(dict(key='patterns:count_by_step_up', step='Y2.B1.S15', action='add', opts={'step': [0]}, why='its step [0] counts in 2s, 5s and 10s: exactly Y2.B1.S15 (critic Y4 r11)'))
setwhy('Y4.B2.S4', 'pre', 'addition:add_10k_regroup{"band":1000}', 'Y3.B2.S14 Add two numbers (across a 100) (prior learning wk W15; nearest live practice: add_10k_regroup at band 1,000 deals 3-digit sums and is not tagged to it)')
setwhy('Y4.B2.S7', 'pre', 'subtraction:sub_10k_regroup{"band":1000}', 'Y3.B2.S16 Subtract two numbers (across a 100) (prior learning wk W16; nearest live practice: sub_10k_regroup at band 1,000 deals 3-digit differences and is not tagged to it)')
setwhy('Y4.B5.S12', 'pre', 'placevalue:unit_form{"band":99,"rename":"more"}', 'Y2.B1.S5')
# P. perimeter_grid {} deals written side lengths on 61 of 150 items (form 2 "find the perimeter of a rectangle")
P('Y4.B6.S3', direct=['area_perimeter:perimeter_grid{"forms":[0,1]}'])
_by['Y4.B6.S5']['partial'] = [(('area_perimeter:perimeter_grid{"forms":[1,3]}', 'L-shapes only (six sides), counted on a grid or with written whole-number sides; no T- or U-shapes')
                               if _base(k) == 'area_perimeter:perimeter_grid' else (k, m)) for k, m in _by['Y4.B6.S5']['partial']]
_by['Y4.B6.S5']['missing'] = 'perimeter of rectilinear shapes with more than six sides (T- and U-shapes) from written whole-number side lengths'
NEW_PROPOSALS['composite_whole_sides']['teaches'] = 'find the perimeter of a T- or U-shape whose side lengths are all whole numbers'
ENVISION['Y4.B6.S5'] = {'composite_whole_sides': 'add the written whole-number sides of a T- or U-shape to find its perimeter'}
_by['Y4.B6.S7']['partial'] = [((k, 'every side length is given (counted on a grid, or written on rectangles and L-shapes); no side has to be found first')
                               if _base(k) == 'area_perimeter:perimeter_grid' else (k, m)) for k, m in _by['Y4.B6.S7']['partial']]
CLOSES['Y4.B6.S7']['composite_whole_sides'] = 'the composite shapes must have whole-number sides (no 2.5 / 3.5 before W29)'
ENVISION['Y4.B6.S7']['composite_whole_sides'] = 'the same shapes with whole-number sides only'
# W. whys
setwhy('Y4.B5.S8', 'related', 'multiplication:repeated_add_to_mult', 'equal groups as repeated addition (3 + 3 + 3 + 3 = 4 × 3): the idea the partitioned method shortens')
setwhy('Y4.B1.S4', 'pre', 'patterns:count_by_step_up{"step":[0],"range":1000}', 'counting on in 2s, 5s and 10s to 1,000 (Y3.B1.S14 counts in 50s, which no live skill deals: count_50s is this step\'s build)')
# Optional
setwhy('Y4.B7.S4', 'pre', 'number_sense:place_on_number_line', 'Y1.B12.S4')
for sid in ('Y4.B8.S3', 'Y4.B8.S9'):
    setwhy(sid, 'pre', 'placevalue:place_value_disks{"band":99}', 'Y3.B1.S5 Represent numbers to 1,000 (lower grade, same idea; tens and ones)')
setwhy('Y4.B4.S2', 'pre', 'multiplication:count_by_tables{"constant":[3]}', 'Y3.B3.S8')
# own11 "why example": "to 10 × 10" reads as a 2-digit factor example; say the range in words
for _s in STEPS:
    for _role in ('pre', 'related'):
        for _i, _e in enumerate(_s[_role]):
            if _e[1] == 'the times-table facts to 10 × 10 (Y3 and Y4 block 4)': _s[_role][_i] = (_e[0], 'the times-table facts with products to 100 (Y3 and Y4 block 4)') + tuple(_e[2:])
            elif str(_e[1]).startswith('the times-table facts to 12 × 12 (Y4 block 4)'): _s[_role][_i] = (_e[0], str(_e[1]).replace('to 12 × 12', 'through the 12s table')) + tuple(_e[2:])
setwhy('Y4.B5.S15', 'related', 'multiplication:mult_zeros{"forms":[0]}', '× 10 is the anchor of near multiples (nine 7s is ten 7s take away one 7)')
# own11 "cited hundreds": band 9,999 deals thousands, which "Hundreds, tens and ones" does not say
setwhy('Y4.B1.S8', 'pre', 'placevalue:value{"band":9999}', 'the value of each digit up to the thousands (Y3.B1.S8 extended by Y4.B1.S5-S6, wk W11): the digit that 1,000 more changes')
