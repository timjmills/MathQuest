# Y5 round 1: every defect of design/audit/runs/wrm-tagging/Y5-critic-local-r1.md (local critic r1, FAIL 6.30).
# File-wide classes 1-4, 13, 14 (opts on links, school-week content, range, re-cites, degenerate links) are fixed by
# build.py passes 3-4 (re-cite + linkfit --fit); class 8 (tagFixes) by pass 5; class 11 (own build in preBuild) and
# class 15 (`closes`) by build.py. This file holds the hand fixes: classes 5-7, 9, 10, 12, 16, 17, the sampled steps and the
# HELPERS leftovers.
def has(sid, role, k): return any(e['key'] == k for e in ST[sid][role])
def drop_if(sid, role, k):
    if has(sid, role, k): drop(sid, role, k)

# ── proposals (classes 15-17, owner rulings, HELPERS leftovers) ──
NEW['multiples_2digit'] = {
    'kind': 'option', 'skill': 'number_theory:multiples', 'option': 'number "2-digit" (15, 20, 25, 50, 75) and band past 144',
    'name': 'Multiples of 2-Digit Numbers (option)',
    'teaches': 'listing, circling and filling in multiples of 15, 20, 25, 50 and 75 (25, 50, 75, 100 …) past the 12 × 12 grid',
    'representation': 'the existing multiples cell: a number track of multiples with gaps, one write-on box per gap',
    'family': 'number_theory', 'ccss': ['4.OA.B.4'],
    'why': 'generated number_theory:multiples {} stops at the 12 times-table (multiples of 3, 8, 9, 12); WRM Y5 lists multiples of 15, 25 and 50'}
NEW['area_rect_only'] = {
    'kind': 'option', 'skill': 'area_perimeter:area', 'option': 'shape "rectangles and squares only" (no triangle items)',
    'name': 'Area of Rectangles Only (option)',
    'teaches': 'finding the area of rectangles and squares by length × width, and a missing side from the area, in cm² and m²',
    'representation': 'the existing area cell: a labelled rectangle (not to scale) with cm or m sides, one answer box with the square unit',
    'family': 'area_perimeter', 'ccss': ['4.MD.A.3'],
    'why': 'generated area {forms:[0,1], band:25} still deals a triangle area in about 1 item in 13 (6.G.A.1); no option keeps it to rectangles'}
NEW['frac_hundredths_dec'] = {
    'kind': 'option', 'skill': 'conversions:d_to_f', 'also': ['conversions:f_to_d'],
    'option': 'place "hundredths": x/100 ↔ 0.xx only (no fifths, no drag-bin sort with percent tiles)',
    'name': 'Hundredths as Fractions and Decimals (option)',
    'teaches': 'writing 27/100 as 0.27 and 0.08 as 8/100, with a hundred square shaded beside the number',
    'representation': 'one boxed cell: the fraction or decimal, a 10 × 10 hundred square (hint, fades), one answer box',
    'family': 'conversions', 'ccss': ['4.NF.C.6'],
    'why': 'generated d_to_f {forms:[0]} deals tenths, fifths and quarters (0.2 = 1/5, 0.75 = 3/4) and no hundredths; f_to_d {denoms:[5]} adds a drag-bin sort'}
# fd_place_band vs thousandths_pv (HELPERS leftover, B7.S5): fd_place_band keeps tenths and hundredths; thousandths are
# thousandths_pv only (an option on the decimal_pv proposal's new skill, not on a live skill)
NEW['fd_place_band']['teaches'] = 'writing tenths, then hundredths, as both a fraction and a decimal (3/10 = 0.3; 27/100 = 0.27), one place per page'
NEW['fd_place_band']['option'] = 'place "tenths" / "hundredths" with a tenths strip / hundred square support (thousandths are thousandths_pv, not this option)'
PATCH['thousandths_pv'] = {
    'on': 'decimal_pv',
    'representation': 'the decimal_pv proposal (decimals:decimal_place_value, not yet built) extended to 3 dp: a Ones . Tenths Hundredths Thousandths chart with counters',
    'correctionWhy': 'critic Y5 local r1 class 16: thousandths_pv is an option on the decimal_pv PROPOSAL, not on a live skill'}
PATCH['time_convert'] = {
    'teaches': 'converting between days, weeks, months and years, and from smaller to larger units (180 s = 3 min; 21 days = 3 weeks)',
    'representation': 'a time-only page on unit_conversion_word: the conversion fact (1 week = 7 days) in a hint strip that fades, one answer box',
    'correctionWhy': 'critic Y5 local r1 class 17: unit_conversion_word {units:[0]} already deals hours, minutes and seconds (larger → smaller); only days / weeks / months / years and smaller → larger are missing'}
PATCH['mult_multiples'] = {
    'representation': 'a new form on mult_zeros: "Is it a multiple of 10 / 100 / 1,000?" tick-box cell and "write the next multiples of 1,000" track',
    'correctionWhy': 'the live entry names mult_zeros as its skill but describes the cell on number_theory:multiples; one skill only'}

# ── class 9: partial steps that listed FULL directs ──
to_partial('Y5.B1.S3', 'placevalue:pv_digit_drag', 'reads and writes 5-digit numbers in a place-value chart, but never with place-value counters or base-10')
to_partial('Y5.B1.S3', 'placevalue:value', 'the value of a digit in a 5-digit number; no counters or base-10 representation of the number')
to_partial('Y5.B1.S3', 'placevalue:identify', 'names the place of a digit in a 5-digit number; no counters or base-10 representation')
to_partial('Y5.B1.S4', 'placevalue:pv_digit_drag', 'reads and writes 6-digit numbers in a chart, but not with counters and not in the period-grouped (Thousands | Ones) chart')
to_partial('Y5.B1.S4', 'placevalue:value', 'the value of a digit in a 6-digit number; no counters or period-grouped chart')
to_partial('Y5.B1.S4', 'placevalue:identify', 'names the place of a digit in a 6-digit number; no counters or period-grouped chart')
to_partial('Y5.B1.S5', 'placevalue:pv_digit_drag', 'reads a 6-digit number from its words into a chart; the pupil never writes the number in words')
to_partial('Y5.B1.S8', 'placevalue:expand', 'standard partitioning only (400,000 + 30,000 + …); no flexible partitioning and no part-whole or bar model')
to_partial('Y5.B1.S8', 'placevalue:combine', 'recombines standard parts only; no flexible partitioning and no part-whole or bar model')
to_partial('Y5.B5.S4', 'multiplication:area_model_mult_hard', '3-digit × 2-digit by the area model only; the column (long) multiplication layout is not dealt')
to_partial('Y5.B5.S7', 'division:div_zero_in_quotient', 'quotients with a zero digit only, in the box/long layout; not the short-division (bus stop) layout with exchange digits')
to_partial('Y5.B5.S11', 'multiplication:mult_comparison', 'one-step times-as-many stories only; no multi-digit or two-step problems')
to_partial('Y5.B5.S11', 'division:remainder_interpret', '÷ only, one step; no × and no two-step problems')

# ── class 7: overstated FULL verdicts (generated) ──
# B3.S1 Multiples (critic hardest 5): multiples stops at the 12 times-table
to_partial('Y5.B3.S1', 'number_theory:multiples', 'multiples of 2-digit numbers (15, 25, 50) and multiples past the 12 times-table are never dealt')
ST['Y5.B3.S1'].update(verdict='partial', build=['multiples_2digit'],
    missing='multiples of 2-digit numbers (15, 25, 50) and multiples past 12 × 12; every generated item is a multiple of 2-12')
ST['Y5.B3.S1']['note'] = 'WRM lists multiples of 15, 25 and 50 as well as the times-tables; multiples_2digit closes them.'
# B4.S11 Add fractions with total greater than 1
for k in ('fraction_operations:add_frac_unlike{"denoms":[2]}', 'fraction_operations:add_frac_unlike_nv{"denoms":[2]}'):
    to_partial('Y5.B4.S11', k, 'no total-greater-than-1 control: about half the computed sums are 1 or less (3/4, 1, 7/8) and many items are "click all sums greater than 1" sorts')
for e in list(ST['Y5.B4.S11']['direct']):
    if e['key'] == 'fraction_operations:add_fractions_like': ST['Y5.B4.S11']['direct'].remove(e)
ST['Y5.B4.S11'].update(verdict='partial', build=['frac_total_band'], preBuild=[],
    missing='a page of additions whose total is always greater than 1, renamed as a mixed number (3/4 + 5/8 = 11/8 = 1 3/8)')
drop_if('Y5.B4.S11', 'related', 'fraction_operations:estimate_frac_ops')
add('Y5.B4.S11', 'pre', 'fraction_operations:add_fractions_like', cite('Y5.B4.S11', 'Y5.B4.S9'))
add('Y5.B4.S11', 'pre', 'fractions:mixed_improper_visual', cite('Y5.B4.S11', 'Y5.B4.S4'))
# B8.S4 Area of rectangles
to_partial('Y5.B8.S4', 'area_perimeter:area', 'also deals triangle areas (base × height ÷ 2, 6.G.A.1); no option keeps it to rectangles')
setopts('Y5.B8.S4', 'partial', 'area_perimeter:area', {'forms': [0, 1], 'band': 25})
to_partial('Y5.B8.S4', 'area_perimeter:area_unit_squares', 'counts unit squares only (no length × width); about a third of the shapes are L-shapes')
ST['Y5.B8.S4'].update(verdict='partial', build=['area_rect_only'],
    missing='a rectangles-and-squares-only page of area by length × width (and a missing side from the area)')
drop_if('Y5.B8.S4', 'pre', 'shapes_early:compose_rect_from_squares')
# B7.S3 Equivalent fractions and decimals (hundredths): d_to_f deals no hundredths, f_to_d has a percent drag-bin branch
to_partial('Y5.B7.S3', 'conversions:d_to_f', 'tenths, fifths and quarters only (0.2 = 1/5, 0.75 = 3/4); no hundredths')
setopts('Y5.B7.S3', 'partial', 'conversions:d_to_f', {'forms': [0]})
to_partial('Y5.B7.S3', 'conversions:f_to_d', 'half the items are a drag-bin sort of halves and quarters (with percent tiles); the rest mix fifths and tenths with hundredths')
to_partial('Y5.B7.S3', 'fraction_operations:frac_10_100', 'mostly tenths ↔ hundredths as fractions (6/10 = 60/100); decimals appear only in "click all equal to 0.07"')
ST['Y5.B7.S3'].update(verdict='partial', build=['frac_hundredths_dec'],
    missing='writing hundredths as decimals and decimals as hundredths (27/100 = 0.27, 0.08 = 8/100) as the whole page',
    preBuild=['decimal_pv'])
ST['Y5.B7.S3']['note'] = ''

# ── class 10: notes used as opts ──
setopts('Y5.B6.S6', 'partial', 'fractions:fraction_of_set_hard_nv', {'forms': [1]},
        why='finds the whole in numbers only ("3/7 of a number is 12"); the bar model that shows the whole is missing')
setopts('Y5.B8.S2', 'partial', 'area_perimeter:composite_shapes', {'forms': [0]},
        why='every side of the L / T shape is labelled, so the pupil never finds a missing side before adding')
for sid in ('Y5.B4.S10', 'Y5.B4.S12', 'Y5.B4.S14', 'Y5.B4.S15'):
    for role in ('direct', 'partial'):
        for e in ST[sid][role]:
            if e['key'].startswith('fraction_operations:') and 'unlike' in e['key'] and not (e.get('opts') or {}).get('denoms'):
                e.setdefault('opts', {})['denoms'] = [2]
for e in ST['Y5.B7.S11']['direct'] + ST['Y5.B7.S11']['partial']:
    if e['key'] == 'decimals:round_thousandths': e['opts'] = {'forms': [0]}
for e in ST['Y5.B7.S9']['direct']:
    if e['key'] == 'decimals:order_decimals': e['opts'] = {'decimals': 3}
ST['Y5.B7.S9']['note'] = 'order_decimals with decimals 3 mixes 1-3 dp (6.88, 0.425, 7.7), which is the step.'
ST['Y5.B7.S9']['preBuild'] = [p for p in ST['Y5.B7.S9']['preBuild'] if p != 'dec_dp_match']
for e in ST['Y5.B12.S4']['partial']:
    if e['key'] == 'decimals:add_decimal':
        e['opts'] = {'decimals': 1}
        e['missing'] = 'with decimals 1 every item is tenths + tenths; there is no same-number-of-places control at 2 or 3 places (decimals 2 mixes 4.53 + 4.4)'
ST['Y5.B12.S4']['missing'] = 'adding hundredths to hundredths and thousandths to thousandths on one page (a same-number-of-places control at 2 and 3 places)'

# ── HELPERS / sampled steps ──
# B1.S1 Roman numerals: one roman_numerals skill (owner); the additive building block is a pre
ST['Y5.B1.S1']['build'] = ['roman_numerals']; ST['Y5.B1.S1']['preBuild'] = []
ST['Y5.B1.S1']['note'] = ("Beyond CCSS (UK National Curriculum). The school's prior-learning list names Y3.B10.S1 Roman numerals to 12 and "
                          "Y4.B1.S13 Roman numerals: no skill yet; the same roman_numerals skill, bands 12 and 100, is their practice.")
ST['Y5.B1.S1']['missing'] = 'reading and writing Roman numerals to 1,000 (I, V, X, L, C, D, M; additive and subtractive pairs; years); no Roman-numeral skill exists'
drop('Y5.B1.S1', 'pre', 'subtraction:missing_add_sub'); drop('Y5.B1.S1', 'pre', 'addition:cloze_addition')
setopts('Y5.B1.S1', 'pre', 'placevalue:expand', {'band': 999}, why=cite('Y5.B1.S1', 'Y4.B1.S2', 'a numeral is read by adding its parts, as CLX = 100 + 50 + 10'))
move('Y5.B1.S1', 'placevalue:combine', 'related', 'pre', cite('Y5.B1.S1', 'Y3.B1.S6', 'add the parts to make the number: the additive rule'))
setopts('Y5.B1.S1', 'pre', 'placevalue:combine', {'band': 999})
add('Y5.B1.S1', 'pre', 'addition:add_sub_100s', cite('Y5.B1.S1', 'Y3.B2.S4', 'adding hundreds and tens is how D, C, L and X combine'))
add('Y5.B1.S1', 'related', 'placevalue:unit_form{"band":999}', 'the same number in parts: 3 hundreds 4 tens, as CCC XL')
# B1.S11
drop_if('Y5.B1.S11', 'related', 'integers:order_negatives')
setopts('Y5.B1.S11', 'pre', 'placevalue:pv_digit_drag', {'band': 999999})
# B4.S13: no customary / 5.NF links; one "next step" subtract link
for k in ('fraction_operations:frac_word_mixed', 'fraction_operations:mixed_fraction_ops', 'fraction_operations:sub_fractions_like', 'fraction_operations:sub_frac_unlike_nv'):
    drop_if('Y5.B4.S13', 'related', k)
# B5.S1
add('Y5.B5.S1', 'pre', 'multiplication:multiply{"tiles":31}', cite('Y5.B5.S1', 'Y4.B5.S10', 'the step below: one digit fewer'), at=0)
setopts('Y5.B5.S1', 'pre', 'multiplication:multiply{"tiles":21}', why=cite('Y5.B5.S1', 'Y4.B5.S9'))
setopts('Y5.B5.S1', 'pre', 'multiplication:area_model_mult{"tiles":21}', why=cite('Y5.B5.S1', 'Y4.B5.S9'))
for e in list(ST['Y5.B5.S1']['partial']):
    if e['key'] == 'multiplication:multiply': ST['Y5.B5.S1']['partial'].remove(e)   # 3-digit × 1-digit is a pre (above)
for e in ST['Y5.B5.S1']['pre']:
    if e['key'] == 'multiplication:mult_facts': e['opts'] = {'constant': [3, 6, 9]}; e['why'] = cite('Y5.B5.S1', 'Y4.B4.S6')
if not has('Y5.B5.S1', 'pre', 'multiplication:mult_facts'):
    add('Y5.B5.S1', 'pre', 'multiplication:mult_facts{"constant":[3,6,9]}', cite('Y5.B5.S1', 'Y4.B4.S6'))
# B5.S11
for k in ('division:divide', 'multiplication:multiply', 'division:share_into_groups'): drop_if('Y5.B5.S11', 'pre', k)
add('Y5.B5.S11', 'pre', 'multiplication:multiply{"tiles":21}', cite('Y5.B5.S11', 'Y4.B5.S9', 'the multi-digit × building block'), at=0)
add('Y5.B5.S11', 'pre', 'multiplication:mult_comparison_plain', cite('Y5.B5.S11', 'Y3.B4.S10'))
drop_if('Y5.B5.S11', 'related', 'multiplication:mult_comparison_plain')
# B5.S6
for k in ('multiplication:equal_or_unequal_groups', 'division:missing_mult_div', 'multiplication:multiply'): drop_if('Y5.B5.S6', 'pre', k)
add('Y5.B5.S6', 'pre', 'multiplication:multiply{"tiles":21}', cite('Y5.B5.S6', 'Y4.B5.S9', 'the multi-digit × building block'), at=0)
add('Y5.B5.S6', 'pre', 'multiplication:mult_facts{"constant":[6,7,9]}', cite('Y5.B5.S6', 'Y4.B4.S8'))
# B6.S5 / B6.S6: the building block is a multiplication fact, not × 100
for sid in ('Y5.B6.S5', 'Y5.B6.S6'):
    drop_if(sid, 'pre', 'multiplication:mult_zeros')
    add(sid, 'pre', 'multiplication:mult_facts', cite(sid, 'Y4.B4.S10', 'multiply the unit part back up'))
    for k in ('conversions:percent_of_number', 'conversions:find_whole_from_pct'): drop_if(sid, 'related', k)
add('Y5.B6.S6', 'related', 'fraction_operations:mult_frac_whole_nv', 'the same fraction-and-whole relation written as fraction × whole number')
# B7.S9
drop_if('Y5.B7.S9', 'related', 'decimals:round_thousandths')
# B8.S2 / B8.S3
drop_if('Y5.B8.S2', 'related', 'area_perimeter:mixed_area_perimeter')
setopts('Y5.B8.S2', 'pre', 'area_perimeter:perimeter', {'forms': [0, 1], 'band': 20})
setopts('Y5.B8.S3', 'pre', 'area_perimeter:perimeter', {'forms': [0, 1], 'band': 20})
add('Y5.B8.S3', 'pre', 'multiplication:mult_facts', cite('Y5.B8.S3', 'Y4.B4.S10', 'number of sides × side length'), at=1)
add('Y5.B8.S3', 'related', 'area_perimeter:perimeter_grid', 'the same perimeter counted on a grid')
# B9.S1 / B9.S2: drop four-quadrant coordinate_graph
for sid in ('Y5.B9.S1', 'Y5.B9.S2'): drop_if(sid, 'related', 'coordinates:coordinate_graph')
# B10.S8
for e in ST['Y5.B10.S8']['pre']:
    if e['key'] == 'angles_lines:additive_angles': e['why'] = cite('Y5.B10.S8', 'Y5.B10.S1')
setopts('Y5.B10.S8', 'pre', 'area_perimeter:perimeter', {'forms': [0, 1], 'band': 20})
# B10.S10 3-D shapes
drop_if('Y5.B10.S10', 'pre', 'shapes_early:shape_name_match_3d')
add('Y5.B10.S10', 'pre', 'shapes_classify:classify_quads', cite('Y5.B10.S10', 'Y4.B12.S5', 'the faces of prisms and pyramids'))
add('Y5.B10.S10', 'pre', 'shapes_classify:classify_triangles', cite('Y5.B10.S10', 'Y4.B12.S4', 'the faces of pyramids'))
for k in ('area_perimeter:volume', 'coordinates:net_surface_area', 'shapes_classify:cross_section_3d'): drop_if('Y5.B10.S10', 'related', k)
add('Y5.B10.S10', 'related', 'shapes_early:shape_attributes', 'the same naming from properties, on 2-D shapes')
# B12.S4 / B12.S8 / B12.S9
ST['Y5.B12.S4']['preBuild'] = [p for p in ST['Y5.B12.S4']['preBuild'] if p != 'decimal_models']
for sid in ('Y5.B12.S3', 'Y5.B12.S4', 'Y5.B12.S5', 'Y5.B12.S6', 'Y5.B12.S7', 'Y5.B12.S8'): drop_if(sid, 'related', 'decimals:mixed_decimals')
drop_if('Y5.B12.S8', 'pre', 'decimals:round_decimals')
add('Y5.B12.S8', 'pre', 'number_sense:compensation', cite('Y5.B12.S8', 'Y5.B2.S2', 'round and adjust with whole numbers'))
add('Y5.B12.S8', 'related', 'number_sense:estimate_sums_diffs', 'estimate first, then adjust: the same rounding idea')
drop_if('Y5.B12.S9', 'pre', 'decimals:add_decimal')
for e in ST['Y5.B12.S9']['pre']:
    if e['key'] == 'patterns:count_by_step_up': e['opts'] = {'range': 1000}
drop_if('Y5.B12.S9', 'related', 'placevalue:place_value_10x')
# B7.S6
ST['Y5.B7.S6']['preBuild'] = [p for p in ST['Y5.B7.S6']['preBuild'] if p != 'thousandths_pv']
for k in ('decimals:round_thousandths', 'placevalue:place_value_10x'): drop_if('Y5.B7.S6', 'related', k)
# B14.S5 / B14.S6
for e in ST['Y5.B14.S5']['partial']:
    if e['key'] == 'measurement:unit_conversion_word':
        e['opts'] = {'units': [0]}
        e['missing'] = 'hours, minutes and seconds, larger to smaller only; no days, weeks, months or years and no smaller to larger'
setopts('Y5.B14.S6', 'pre', 'measurement:unit_conversion_word', {'units': [0]}, why=cite('Y5.B14.S6', 'Y5.B14.S5'))
for sid in ('Y5.B9.S5', 'Y5.B14.S6'):
    for role in ('pre', 'related'): drop_if(sid, role, 'measurement:time_sense')
ST['Y5.B14.S6']['preBuild'] = []
# B3.S10 / B3.S1 pre opts (critic list; linkfit then checks them)
for e in ST['Y5.B3.S10']['pre']:
    if e['key'] == 'patterns:seq_10': e['opts'] = {'band': 1000}
add('Y5.B3.S10', 'pre', 'placevalue:place_value_10x{"op":"x","power":[10,100],"band":1000}', cite('Y5.B3.S10', 'Y4.B5.S4'), at=0)
add('Y5.B3.S1', 'pre', 'multiplication:count_by_tables{"constant":[3,6,9]}', cite('Y5.B3.S1', 'Y4.B4.S6'), at=0)
add('Y5.B3.S1', 'pre', 'multiplication:mult_facts{"constant":[2,4,8]}', cite('Y5.B3.S1', 'Y3.B3.S15'))
for e in ST['Y5.B3.S1']['pre']:
    if e['key'] in ('patterns:seq_5', 'patterns:seq_10'): e['opts'] = {'band': 1000}

# ── class 12: fewer than 3 pre ──
add('Y5.B10.S3', 'pre', 'angles_lines:measure_angles', cite('Y5.B10.S3', 'Y5.B10.S4'))
add('Y5.B10.S4', 'pre', 'angles_lines:identify_angles', cite('Y5.B10.S4', 'Y4.B12.S2'))
for sid in ('Y5.B15.S3', 'Y5.B15.S4'):
    add(sid, 'pre', 'area_perimeter:area_unit_squares', cite(sid, 'Y4.B3.S2', 'count unit squares before counting unit cubes'))

# ── after the linkfit pass: steps left thin (rule 15 / no related), refilled with links that fit their school week ──
def to_pre(sid, k, why):
    move(sid, k, 'related', 'pre', why); ST[sid]['pre'].append(ST[sid]['pre'].pop(0))
FEWN = 'Pre-skills are few: '
add('Y5.B2.S8', 'pre', 'division:missing_mult_div{"range":100}', cite('Y5.B2.S8', 'Y3.B4.S6', 'the same missing number with × and ÷'))
add('Y5.B3.S2', 'pre', 'multiplication:mult_facts{"constant":[3,6,9]}', cite('Y5.B3.S2', 'Y4.B4.S6'))
drop_if('Y5.B3.S2', 'related', 'multiplication:mult_facts')
to_pre('Y5.B3.S7', 'multiplication:mult_properties', cite('Y5.B3.S7', 'Y4.B4.S13', 'a cube number is three equal factors'))
add('Y5.B4.S17', 'related', 'fraction_operations:sub_fractions_like', 'the same subtraction without the wholes')
add('Y5.B4.S17', 'related', 'fraction_operations:add_mixed_like_nv', 'the inverse: add the mixed numbers back')
for sid in ('Y5.B7.S2', 'Y5.B7.S4'):
    add(sid, 'related', 'fraction_operations:frac_10_100_nv', 'the same tenths and hundredths, as fractions only')
    add(sid, 'related', 'decimals:compare_decimal{"decimals":1}', 'compare the decimals once they are written')
add('Y5.B7.S3', 'pre', 'fractions:write_fraction', cite('Y5.B7.S3', 'Y4.B8.S7', 'write the fraction of the hundred square that is shaded'))
add('Y5.B7.S6', 'pre', 'decimals:decimal_nl_drag', cite('Y5.B7.S6', 'Y4.B8.S4', 'tenths placed on a line, before thousandths'))
add('Y5.B7.S6', 'pre', 'fraction_operations:frac_10_100', cite('Y5.B7.S6', 'Y4.B8.S7', 'tenths and hundredths as fractions, the pattern thousandths continue'))
add('Y5.B7.S15', 'related', 'fraction_operations:frac_10_100', 'hundredths as fractions: a percent is a number of hundredths')
add('Y5.B7.S15', 'related', 'decimals:compare_decimal', 'compare once all three are written as decimals')
add('Y5.B8.S5', 'related', 'area_perimeter:perimeter_grid', 'the perimeter of the same rectilinear shapes')
add('Y5.B8.S5', 'related', 'multiplication:area_model_mult{"tiles":21}', 'a rectangle split into two parts to multiply: the same splitting')
add('Y5.B8.S6', 'related', 'area_perimeter:area_perimeter', 'the exact area of a rectangle, to check an estimate against')
add('Y5.B9.S2', 'related', 'measurement:temperature{"forms":[1]}', 'reading a value between labelled marks on a scale, as on a line graph axis')
add('Y5.B9.S3', 'related', 'graphs:build_bar_graph', 'the same data, drawn from the table as a chart')
add('Y5.B9.S5', 'related', 'measurement:elapsed_visual_hard', 'the time between two clocks, as between two timetable times')
add('Y5.B9.S5', 'related', 'measurement:time_1min', 'reading the time to the minute, as a timetable lists it')
ST['Y5.B10.S3']['note'] = (ST['Y5.B10.S3']['note'] + ' ' if ST['Y5.B10.S3']['note'] else '') + FEWN + \
    'estimating an angle builds on naming it (acute, obtuse) and measuring it; no other angle skill is taught by wk W31 without degrees past the step.'
ST['Y5.B10.S4']['pre'] = [e for e in ST['Y5.B10.S4']['pre'] if not (e['key'] == 'angles_lines:identify_angles' and not e['why'].startswith('Y'))]
to_pre('Y5.B10.S4', 'measurement:temperature', cite('Y5.B10.S4', 'Y4.B10.S1', 'reading a scale between numbered marks, as on a protractor'))
add('Y5.B10.S4', 'related', 'angles_lines:identify_lines', 'lines, rays and the vertex: what the protractor is laid on')
ST['Y5.B10.S4']['note'] = (ST['Y5.B10.S4']['note'] + ' ' if ST['Y5.B10.S4']['note'] else '') + FEWN + \
    'the school meets degrees first in this unit (W23); reading a ruler is in inches only (customary, W33), so naming angles and reading a °C scale are the earlier skills.'
to_pre('Y5.B10.S5', 'angles_lines:identify_angles', cite('Y5.B10.S5', 'Y4.B12.S2', 'know the angle you are drawing'))
ST['Y5.B10.S5']['note'] = (ST['Y5.B10.S5']['note'] + ' ' if ST['Y5.B10.S5']['note'] else '') + FEWN + \
    'drawing with a ruler in cm has no skill (the ruler skill is in inches, W33); measuring and naming angles are the earlier skills.'
to_pre('Y5.B10.S6', 'angles_lines:identify_angles', cite('Y5.B10.S6', 'Y4.B12.S1', 'a right angle is a quarter turn: four make a full turn'))
to_pre('Y5.B11.S2', 'coordinates:coord_distance_q1', cite('Y5.B11.S2', 'Y4.B14.S3', 'a side length read from two coordinates'))
add('Y5.B11.S4', 'related', 'coordinates:coord_distance_q1', 'the distance moved, read from two coordinates')
ST['Y5.B11.S5']['note'] = (ST['Y5.B11.S5']['note'] + ' ' if ST['Y5.B11.S5']['note'] else '') + \
    'No related link fits wk W28: the live reflection skill reflects in the x- or y-axis (later grade), and the other symmetry skills are this step\'s own.'
add('Y5.B12.S3', 'related', 'decimals:compare_decimal{"decimals":1}', 'which decimal is nearer to 1: the same crossing of the whole')
add('Y5.B12.S3', 'related', 'composing:number_bonds', 'bonds to 10, the same bridging as bonds to 1 in tenths')
add('Y5.B12.S7', 'pre', 'subtraction:sub_1k_regroup{"band":100}', cite('Y5.B12.S7', 'Y3.B2.S15', 'exchange in a column subtraction'))
add('Y5.B12.S8', 'related', 'number_sense:make_a_ten', 'make a ten (or a whole) first: the efficient step')
add('Y5.B12.S9', 'related', 'patterns:seq_10{"band":50}', 'a whole-number sequence that goes up by the same step')
add('Y5.B12.S10', 'related', 'division:div_facts{"constant":[10]}', 'the inverse: divide by 10')
add('Y5.B12.S11', 'pre', 'multiplication:mult_zeros', cite('Y5.B12.S11', 'Y4.B5.S3', 'the inverse: multiply by 10'))
add('Y5.B12.S12', 'pre', 'multiplication:mult_facts{"constant":[3,6,9]}', cite('Y5.B12.S12', 'Y4.B4.S6', 'the fact behind 0.3 × 4 = 1.2'))
add('Y5.B12.S12', 'pre', 'division:div_facts{"constant":[3,6,9]}', cite('Y5.B12.S12', 'Y4.B4.S6', 'the inverse fact that finds the missing value'))
ST['Y5.B12.S12']['note'] = (ST['Y5.B12.S12']['note'] + ' ' if ST['Y5.B12.S12']['note'] else '') + \
    'No related link fits: every live decimal × / ÷ skill deals decimal × decimal or results past this step (5.NBT.B.7); dec_known_facts is the related build.'
ST['Y5.B14.S2']['note'] = (ST['Y5.B14.S2']['note'] + ' ' if ST['Y5.B14.S2']['note'] else '') + \
    'No related link fits wk W31: the metric story skill deals km to cm (500,000), and the other metric skills are this step\'s own partials or pre-skills.'
add('Y5.B14.S3', 'pre', 'measurement:mass_volume_liquid', cite('Y5.B14.S3', 'Y3.B7.S8', 'reading two units at once (L and mL), as m and cm'))
add('Y5.B14.S3', 'related', 'measurement:capacity{"units":[1]}', 'the same ×1,000 conversion for litres and millilitres')
add('Y5.B14.S4', 'pre', 'measurement:length_metric', cite('Y5.B14.S4', 'Y3.B5.S5', 'the metric side of each conversion'))
to_pre('Y5.B15.S2', 'placevalue:compare', cite('Y5.B15.S2', 'Y3.B1.S12', 'compare the two counts of cubes'))
add('Y5.B15.S2', 'related', 'measurement:mass_volume_liquid{"forms":[0]}', 'capacity read on a scale: the other "how much space" measure')
