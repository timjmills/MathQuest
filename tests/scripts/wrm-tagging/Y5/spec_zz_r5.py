# Y5 round 4 (critic r5, FAIL: B12.S11 = 6; B1.S2 / B1.S9 / B10.S3 = 7; lessons customary 6, compare / order fractions 7).
# Build-level classes are fixed at the source:
#   G  linkfit.mjs: a FULL unit whose title, WRM block or every CCSS names decimals must have a decimal in a direct item's
#      question; B12.S11 is the one it finds (B3.S9 is the whole-number half: 4.NBT.A.1 + 5.NBT.A.2, Autumn block)
#   F  build.py own_repeats(): a pre / related link with the unit's own direct or partial key + opts steps one band down (pre)
#      or is dropped, before and after the linkfit pass; linkfit fails a link that deals the same items as an own direct
#   H  linkfit.mjs: a Support lesson is judged against its SOURCE grade (no Grade-4 content, no unlike-fraction compare in a
#      pre, the source year's number range, no customary units on a metric title, no pre citing a year above the source);
#      a cited "unit fractions" step must be true of the items; every unit a why names must be in a fifth of the items
# Applied after spec_z_lessons.py (file-name order). This file holds the per-entry rows.

def _u(sid): return ST[sid] if sid in ST else LESSONS[sid]
def dropkey(sid, role, k):
    n = len(_u(sid)[role]); _u(sid)[role] = [e for e in _u(sid)[role] if e['key'] != k]
    if len(_u(sid)[role]) == n: errs.append(f'r5 dropkey: {sid} {role} has no {k}')
def addl(sid, role, k, why, at=None):
    e = E(k); e['why'] = why
    if at is None: _u(sid)[role].append(e)
    else: _u(sid)[role].insert(at, e)

# ── G: Y5.B12.S11 Divide by 10, 100 and 1,000 (Decimals block) ──
NEW['div10_decimal_dividend'] = {
    'kind': 'option', 'skill': 'placevalue:place_value_10x',
    'option': 'with decimals on and op ÷: "decimal dividends" (3.4 ÷ 10, 45.6 ÷ 100, 7.2 ÷ 1,000), today the ÷ items keep whole-number dividends',
    'name': 'Divide Decimals by 10, 100 and 1,000 (option)',
    'teaches': 'dividing a number that already has a decimal point by 10, 100 or 1,000: the digits move one, two or three places right past the point (3.4 ÷ 10 = 0.34)',
    'representation': 'the existing shift-chart cell with tenths, hundredths and thousandths columns; arrows under the sliding digits; one decimal answer box with a fixed point',
    'family': 'placevalue', 'ccss': ['5.NBT.A.2'],
    'why': 'generated place_value_10x {op:"/", decimals:true} deals only whole-number dividends (689 ÷ 10 = 68.9, 869 ÷ 1,000); the × form does deal decimals (68.9 × 10)'}
to_partial('Y5.B12.S11', 'placevalue:place_value_10x', 'whole-number dividends only (689 ÷ 10 = 68.9); never a decimal divided by 10, 100 or 1,000 (3.4 ÷ 10 = 0.34)')
ST['Y5.B12.S11']['verdict'] = 'partial'
ST['Y5.B12.S11']['missing'] = 'dividing a decimal by 10, 100 and 1,000 (3.4 ÷ 10 = 0.34, 45.6 ÷ 100 = 0.456)'
ST['Y5.B12.S11']['build'] = ['div10_decimal_dividend']
CLOSES.setdefault('Y5.B12.S11', {})['div10_decimal_dividend'] = 'dividing a decimal by 10, 100 and 1,000 (3.4 ÷ 10 = 0.34, 45.6 ÷ 100 = 0.456)'
add('Y5.B12.S11', 'pre', 'placevalue:place_value_10x{"op":"x","decimals":true}', cite('Y5.B12.S11', 'Y5.B12.S10', 'the inverse: a decimal times 10, 100, 1,000'), at=0)
ST['Y5.B12.S11']['note'] = '÷ 1,000 gives thousandths (439 ÷ 1,000 = 0.439). The step\'s decimal dividends wait for the div10_decimal_dividend option; Y5.B3.S9 is the whole-number half of the same title.'

# ── F: a pre that repeated the step's own direct / partial ──
# B1.S2 Numbers to 10,000 (repeats Y4.B1.S5): the pre come from the numbers-to-1,000 steps below it
for k in ('placevalue:place_value_disks', 'placevalue:pv_digit_drag', 'placevalue:expand'): dropkey('Y5.B1.S2', 'pre', k)
addl('Y5.B1.S2', 'pre', 'placevalue:place_value_disks{"band":999}', cite('Y5.B1.S2', 'Y4.B1.S1'), at=0)
addl('Y5.B1.S2', 'pre', 'placevalue:expand{"band":999}', cite('Y5.B1.S2', 'Y4.B1.S2'))
# B1.S3: the disks link was its own partial
dropkey('Y5.B1.S3', 'pre', 'placevalue:place_value_disks')
addl('Y5.B1.S3', 'pre', 'placevalue:unit_form{"band":9999}', cite('Y5.B1.S3', 'Y5.B1.S2'))
# B1.S9: the number-line link was its own partial; the 0-1,000 line is the step below
dropkey('Y5.B1.S9', 'pre', 'number_sense:place_on_number_line')
addl('Y5.B1.S9', 'pre', 'number_sense:place_on_number_line{"span":100,"band":1000}', cite('Y5.B1.S9', 'Y4.B1.S3'), at=0)
# B10.S3: measure_angles is the step's own partial
dropkey('Y5.B10.S3', 'pre', 'angles_lines:measure_angles')
ST['Y5.B10.S3']['note'] = ('Pre-skills are few: estimating an angle builds on naming it (acute, obtuse, right), which identify_angles deals; '
    'measure_angles is the step\'s own partial, so it is not repeated as a pre, and no other angle skill is taught by wk W31 without degrees past the step.')

# ── minor: B5.S11 clause (the generated stories reach a divisor of 19) ──
set_missing('Y5.B5.S11', 'division:remainder_interpret', '÷ only, one step; no × and no two-step problems; some stories divide by 12-19 (2-digit divisor, 5.NBT.B.6)')

# ── lessons ──
L = 'G4|-|'
# customary length and weight: the pre that linkfit re-optioned onto the lesson's own partial (with a false "kilograms and
# grams" why) is replaced by the × 12 fact the inch-foot conversions use
CL = L + 'customarylengthandweightinchesfeetyardsouncesandpounds'
dropkey(CL, 'pre', 'measurement:unit_conversions')
addl(CL, 'pre', 'multiplication:mult_facts{"constant":[12]}', cite(CL, 'Y4.B4.S10', '1 ft = 12 in: 3 ft = 3 × 12 in'))
# div_facts {}: every table, not "multiply and divide by 9"
for lid in (L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', L + 'multiplicativecomparisontimesasmany',
            L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier'):
    for e in LESSONS[lid]['pre']:
        if e['key'] == 'division:div_facts': e['why'] = 'division facts to 12 × 12, every table (the Y4.B4 times-tables and division facts)'
# Support lessons: judged against their SOURCE grade (Year 3 fractions: unit and same-denominator fractions only)
CF = L + 'comparefractions'
dropkey(CF, 'pre', 'fractions:order_fractions'); dropkey(CF, 'pre', 'fractions:equivalent')
addl(CF, 'pre', 'fractions:identify', cite(CF, 'Y3.B6.S1'), at=0)
addl(CF, 'pre', 'fractions:shade_fraction', cite(CF, 'Y3.B6.S3'), at=1)
addl(CF, 'pre', 'fractions:equiv_frac_visual', cite(CF, 'Y3.B6.S10'))
OF = L + 'orderfractions'
dropkey(OF, 'pre', 'fractions:compare'); dropkey(OF, 'pre', 'fractions:equivalent')
addl(OF, 'pre', 'fractions:identify', cite(OF, 'Y3.B6.S1'), at=0)
addl(OF, 'pre', 'fractions:shade_fraction', cite(OF, 'Y3.B6.S3'), at=1)
addl(OF, 'related', 'fractions:compare', 'comparing two fractions, the step inside ordering; with the frac_compare_same_part option it keeps to the Year 3 pairs')
LESSONS[OF]['note'] += ' Judged against its source year (Year 3): no pre compares or orders unlike fractions.'
LESSONS[CF]['note'] += ' Judged against its source year (Year 3): no pre compares or orders unlike fractions.'
D1 = L + 'dividea1digitnumberby100'
dropkey(D1, 'pre', 'conversions:d_to_f')
addl(D1, 'pre', 'conversions:d_to_f{"forms":[0]}', cite(D1, 'Y4.B8.S2'))

# ── F (items): a _plain twin that prints the same items as the unit's own direct / partial is a repeat, not a link ──
drop_if('Y5.B2.S6', 'related', 'algebra:multi_step_word_plain')
drop_if('Y5.B5.S11', 'pre', 'multiplication:mult_comparison_plain')
U7 = L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier'
dropkey(U7, 'related', 'multiplication:mult_comparison_plain')
addl(U7, 'related', 'algebra:tape_diagram', 'the bar model a times-as-many story is drawn with: one bar cut into equal parts beside the other')
LESSONS[D1]['note'] += (' No related skill fits: frac_10_100 (7/100 = 0.07) also deals thousandths, above the lesson\'s Year 4 source, '
    'and the other ÷ 100 skill is the lesson\'s own partial.')
