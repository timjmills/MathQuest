# Y5 round 2: every row of design/audit/runs/wrm-tagging/Y5-critic-r4.md (critic r4, FAIL 7.58).
# Build-level classes are fixed at the source:
#   A  linkfit.mjs laterGrade: unrelated denominators (5.NF.A.1); the content and week checks run on direct and partial
#      items too (a partial may deal it only when its clause names it)
#   B  optcheck.mjs: an option value a clause / why / note names must equal the entry's opts
#   C  linkfit.mjs: a partial or gap step is sized from its title or its own clause's example (clauseCeil), and a why that
#      names a LIST of tables ("2, 4 and 8 times-tables") is no longer read as its last table alone
#   D  linkfit.mjs whyCheck: a size a why claims must be dealt (claim >= 10 x the items' max fails), so a re-optioned link
#      cannot keep a stale why: the fit pass rejects that option set, and the whys below are rewritten
#   E  build.py dedupes pre / related by key + opts; linkfit fails two links of one role with the same items
# This file holds the per-step rows and the whys / clauses the new checks exposed.

# ── proposals ──
NEW['denoms_all_forms'] = {
    'kind': 'option', 'skill': 'fraction_operations:add_frac_unlike',
    'also': ['fraction_operations:sub_frac_unlike', 'fraction_operations:add_mixed_unlike', 'fraction_operations:sub_mixed_unlike',
             'fraction_operations:add_frac_unlike_nv', 'fraction_operations:sub_frac_unlike_nv'],
    'option': 'denoms honoured by every form: the click-all and sort items draw their pairs from the ticked family too',
    'name': 'One Denominator Family on Every Item (option)',
    'teaches': 'adding and subtracting fractions and mixed numbers whose denominators are related (halves, quarters, eighths; thirds, sixths, twelfths), on every item of the page, the click-all and sort items included',
    'representation': 'the existing calculate, click-all and sort cells, unchanged; only the pairs they draw change',
    'family': 'fraction_operations', 'ccss': ['4.NF.B.3a', '4.NF.B.3c', '4.NF.C.5'],
    'why': 'generated with {denoms:[2]}, the calculate items keep one family but the click-all ("click all sums greater than 1") and sort items '
           'ignore it and pair unrelated denominators (3/5 + 3/8, 2 1/3 + 3 1/4): the ACCEPT filter reads only the item text, not its option labels'}
NEW['f_to_d_forms'] = {
    'kind': 'option', 'skill': 'conversions:f_to_d',
    'option': 'forms "Convert one fraction" | "Sort values into bins" (as d_to_f already has)',
    'name': 'Fraction to Decimal: Convert Only (option)',
    'teaches': 'writing 1/2, 1/4, 3/4, fifths, tenths and hundredths as decimals, one fraction per cell, with no drag-bin sort',
    'representation': 'the existing f_to_d convert cell: the fraction, one decimal answer box',
    'family': 'conversions', 'ccss': ['4.NF.C.6'],
    'why': 'generated f_to_d {} deals a drag-bin sort with percent tiles (75%) in about 1 item in 5, and f_to_d has no forms option to turn it off; d_to_f does'}
NEW['dec_same_whole'] = {
    "kind": "option", "skill": "decimals:compare_decimal", "option": "items \"same whole part\" (also on decimals:order_decimals)",
    "name": "Decimals With the Same Whole Part (option)",
    "teaches": "comparing and ordering decimals that share the whole-number part, with 1 and 2 places mixed (0.4 vs 0.38; 3.6, 3.65, 3.06), so the tenths digit decides",
    "representation": "the existing compare / order cell; a ones . tenths hundredths column header over the numbers (hint, fades)",
    "family": "decimals", "ccss": ["4.NF.C.7"],
    "why": "generated compare_decimal / order_decimals {decimals:2} at Max Number 10: whole parts differ on nearly every compare item (8.23 vs 9.92), and every number has exactly two places, so 0.4 vs 0.38 (the length misconception) never comes up",
    "addValue": "Y5 asks one more value of the same option: \"same whole part, same number of places\" (0.47 vs 0.43; 3.6, 3.2, 3.9), for WRM Y5.B7.S8; Y4's value (places mixed) is unchanged",
    "stepsOtherYears": ["Y4.B9.S5", "Y4.B9.S6"], "source": "Y4.json (wave-2 tagging, 7314ee1e); Y5 dec_compare_same folded in (critic r4)"}
RENAME['dec_compare_same'] = 'dec_same_whole'
NEW.pop('dec_compare_same', None)

# ── class A: the denoms option is ignored by the click-all and sort forms (B4.S9-S17) ──
DEN = 'related denominators on the calculate items only: the click-all and sort items ignore {denoms:[2]} and pair unrelated denominators'
def set_missing(sid, k, text):
    for e in ST[sid]['partial']:
        if _match(e, k): e['missing'] = text; return
    errs.append(f'spec set_missing: {sid} has no partial {k}')
# B4.S13 Add two mixed numbers: FULL was overstated
to_partial('Y5.B4.S13', 'fraction_operations:add_mixed_unlike', DEN + ' (2 1/3 + 3 1/4 in 28 of 60 items)')
to_partial('Y5.B4.S13', 'fraction_operations:add_mixed_like', 'like denominators only (2 1/5 + 1 3/5); never related denominators (2 1/4 + 1 3/8)')
to_partial('Y5.B4.S13', 'fraction_operations:add_mixed_like_nv', 'like denominators only, numbers only; never related denominators')
ST['Y5.B4.S13'].update(verdict='partial', build=['denoms_all_forms'],
    missing='adding two mixed numbers with related denominators (2 1/4 + 1 3/8) on a page that stays inside one denominator family')
CLOSES.setdefault('Y5.B4.S13', {})['denoms_all_forms'] = 'every item of an add-two-mixed-numbers page inside one related family: today the click-all items pair 2 1/3 + 3 1/4'
# B4.S17 Subtract two mixed numbers
to_partial('Y5.B4.S17', 'fraction_operations:sub_mixed_unlike', DEN + ' (1 1/2 − 3/10 in 26 of 60 items); unlike denominators are first taught W17, a week after this step')
to_partial('Y5.B4.S17', 'fraction_operations:sub_mixed_like', 'like denominators only (4 3/5 − 1 1/5); never related denominators')
to_partial('Y5.B4.S17', 'fraction_operations:sub_mixed_like_nv', 'like denominators only, numbers only; never related denominators')
ST['Y5.B4.S17'].update(verdict='partial', build=['denoms_all_forms'],
    missing='subtracting two mixed numbers with related denominators (3 3/4 − 1 1/8) on a page that stays inside one denominator family')
CLOSES.setdefault('Y5.B4.S17', {})['denoms_all_forms'] = 'every item of a subtract-two-mixed-numbers page inside one related family: today the click-all items pair 1 1/2 − 3/10'
# B4.S10 Add fractions within 1
set_missing('Y5.B4.S10', 'fraction_operations:add_frac_unlike', 'no "total within 1" control (sums over 1 are mixed in); ' + DEN + ' (3/5 + 1/8)')
set_missing('Y5.B4.S10', 'fraction_operations:add_frac_unlike_nv', 'numbers only; no total-within-1 control; ' + DEN + ' in the sort items (2/3 + 1/4)')
ST['Y5.B4.S10']['build'] = ['frac_total_band', 'denoms_all_forms']
ST['Y5.B4.S10']['note'] = 'Both partials carry {denoms:[2]}: it keeps the calculate items in one family, but not the click-all and sort items (denoms_all_forms).'
CLOSES.setdefault('Y5.B4.S10', {})['denoms_all_forms'] = 'the click-all and sort items of an add-within-1 page stay in one related family (today 3/5 + 1/8)'
# B4.S11 Add fractions with total greater than 1
set_missing('Y5.B4.S11', 'fraction_operations:add_frac_unlike', 'no total-greater-than-1 control: about half the computed sums are 1 or less (3/4, 1, 7/8); ' + DEN + ' (3/5 + 3/8, 4/5 + 5/6 in 45 of 60 items)')
set_missing('Y5.B4.S11', 'fraction_operations:add_frac_unlike_nv', 'no total-greater-than-1 control: about half the computed sums are 1 or less; ' + DEN + ' in the sort items (2/3 + 1/4)')
ST['Y5.B4.S11']['build'] = ['frac_total_band', 'denoms_all_forms']
ST['Y5.B4.S11']['note'] = 'Both partials carry {denoms:[2]}: it keeps the calculate items in one family, but not the click-all and sort items (denoms_all_forms).'
CLOSES.setdefault('Y5.B4.S11', {})['denoms_all_forms'] = 'the "click all sums greater than 1" items stay in one related family (today 3/5 + 3/8, 4/5 + 5/6)'
drop_if('Y5.B4.S11', 'related', 'fraction_operations:add_mixed_unlike')
add('Y5.B4.S11', 'related', 'fraction_operations:add_mixed_like', 'the next idea: a total past 1 written as a mixed number, then adding the wholes too')
# B4.S12 / B4.S14 / B4.S15
set_missing('Y5.B4.S12', 'fraction_operations:add_mixed_unlike', 'deals mixed + mixed only, no mixed + proper fraction form; ' + DEN + ' (1 1/2 + 3 1/3)')
for k in ('fraction_operations:sub_frac_unlike', 'fraction_operations:sub_frac_unlike_nv'):
    set_missing('Y5.B4.S14', k, ('numbers only; ' if k.endswith('_nv') else '') + 'minuend within 1, no whole or improper minuend (2 − 3/4); ' + DEN + ' (4/6 − 1/5)')
set_missing('Y5.B4.S15', 'fraction_operations:sub_mixed_unlike', 'deals mixed − mixed only, no mixed − proper fraction form; ' + DEN + ' (3 1/2 − 2 2/3)')
ST['Y5.B4.S14']['note'] = 'WRM includes subtracting from a whole or an improper fraction; sub_fractions_like covers the same denominator. {denoms:[2]} keeps only the calculate items in one family (denoms_all_forms).'
for sid, cl in (('Y5.B4.S12', 'the click-all and sort items of an add-to-a-mixed-number page stay in one related family (today 1 1/2 + 3 1/3)'),
                ('Y5.B4.S14', 'the click-all and sort items of a subtract-fractions page stay in one related family (today 4/6 − 1/5)'),
                ('Y5.B4.S15', 'the click-all and sort items of a subtract-from-a-mixed-number page stay in one related family (today 3 1/2 − 2 2/3)')):
    ST[sid]['build'] = ST[sid]['build'] + ['denoms_all_forms']; CLOSES.setdefault(sid, {})['denoms_all_forms'] = cl
# links on B4.S9-S16 that deal unrelated pairs -> the like-denominator twins (or dropped where the twin is already there)
for k in ('fraction_operations:add_frac_unlike', 'fraction_operations:add_frac_unlike_nv'): drop_if('Y5.B4.S9', 'related', k)
drop_if('Y5.B4.S10', 'related', 'fraction_operations:sub_frac_unlike')
add('Y5.B4.S10', 'related', 'fraction_operations:sub_fractions_like', 'the inverse: subtract, with one denominator')
drop_if('Y5.B4.S12', 'pre', 'fraction_operations:add_frac_unlike')
drop_if('Y5.B4.S13', 'pre', 'fraction_operations:add_frac_unlike')
add('Y5.B4.S13', 'pre', 'fraction_operations:add_fractions_like', cite('Y5.B4.S13', 'Y5.B4.S9', 'add the fraction parts'), at=0)
add('Y5.B4.S13', 'pre', 'fractions:mixed_nl_drag', 'mixed numbers on a number line: the wholes and the parts (CCSS 4.NF.B.3)')
drop_if('Y5.B4.S13', 'related', 'fraction_operations:sub_frac_unlike')
drop_if('Y5.B4.S14', 'related', 'fraction_operations:add_frac_unlike')
add('Y5.B4.S14', 'related', 'fraction_operations:add_fractions_like', 'the inverse: add the parts back, one denominator')
drop_if('Y5.B4.S14', 'related', 'fraction_operations:sub_mixed_unlike')
drop_if('Y5.B4.S15', 'pre', 'fraction_operations:sub_frac_unlike')
drop_if('Y5.B4.S16', 'pre', 'fraction_operations:sub_mixed_unlike')

# ── class B: option values in opts, not in notes ──
for sid in ('Y5.B14.S1', 'Y5.B14.S3'):
    setopts(sid, 'partial', 'measurement:unit_conversions', {'units': [0]})
    setopts(sid, 'partial', 'measurement:unit_conversion_word', {'units': [1]})
setopts('Y5.B14.S1', 'partial', 'measurement:unit_conversions', why='with units [0] (metric) it converts kg↔g, km↔m, m↔cm and L↔mL both ways, but mixes length, mass and capacity on one page, and a click-all distractor reads "1 mile" (customary); no mixed units (2 kg 300 g)')
setopts('Y5.B14.S1', 'partial', 'measurement:unit_conversion_word', why='with {units:[1]} (metric) the stories go larger to smaller only (8 kg = ? g; 4 km = ? m) and mix in L and cm; no smaller to larger, no mixed units')
setopts('Y5.B14.S1', 'partial', 'measurement:length_metric', {'forms': [3]}, why='with {forms:[3]} km → m only, larger to smaller; no m → km and no mixed units (2 km 400 m)')
setopts('Y5.B14.S3', 'partial', 'measurement:unit_conversions', why='with units [0] (metric) it gives m↔cm and km↔m both ways but mixes mass and capacity items into a length page, and a click-all distractor reads "1 mile" (customary); no mixed units')
setopts('Y5.B14.S3', 'partial', 'measurement:unit_conversion_word', why='with {units:[1]} (metric) larger to smaller only, and mass and capacity stories are mixed in')
setopts('Y5.B14.S2', 'partial', 'measurement:capacity', {'units': [1]}, why='with {units:[1]} (metric) it converts L↔mL both ways (1,500 mL = 1.5 L) and sorts containers against 1 litre; no mixed units (1 l 250 ml = 1,250 ml)')
setopts('Y5.B14.S2', 'partial', 'measurement:length_metric', {'forms': [0, 2]}, why='with {forms:[0,2]} cm → mm and m → mm, larger to smaller only; no measuring in mm and no mixed units (4 cm 3 mm)')
# B14 links: no "0 kg" scale items; a metric related for B14.S1
setopts('Y5.B14.S1', 'pre', 'measurement:mass_volume_liquid', {'forms': [2]}, why=cite('Y5.B14.S1', 'Y3.B7.S3', 'choose g or kg for an object before converting between them'))
setopts('Y5.B14.S2', 'pre', 'measurement:mass_volume_liquid', {'forms': [0]})
setopts('Y5.B14.S3', 'pre', 'measurement:mass_volume_liquid', {'forms': [0]})
drop('Y5.B14.S1', 'related', 'multiplication:multiply')
# B7.S1-S4: d_to_f {forms:[0]} has no percent drag-bin; f_to_d has no such option
for sid in ('Y5.B7.S1', 'Y5.B7.S2'): setopts(sid, 'partial', 'conversions:d_to_f', {'forms': [0]})
setopts('Y5.B7.S1', 'partial', 'conversions:d_to_f', why='with {forms:[0]} it writes tenths, fifths and quarters as fractions (0.7 = 7/10, 0.75 = 3/4) and few hundredths; no place-value chart or counters')
setopts('Y5.B7.S2', 'partial', 'conversions:d_to_f', why='with {forms:[0]} it mixes tenths with fifths and quarters (0.75 = 3/4); no tenths-only page')
setopts('Y5.B7.S2', 'partial', 'conversions:f_to_d', {'denoms': [5]}, why='with {denoms:[5]} it mixes fifths and hundredths with the tenths, and about 1 item in 3 is a drag-bin sort of halves and quarters with percent tiles (percent is W22); no tenths-only page or tenths strip')
ST['Y5.B7.S2']['missing'] = 'a tenths-only page with a tenths strip / number line showing 3/10 = 0.3 (f_to_d with {denoms:[5]} still mixes hundredths and fifths; d_to_f mixes 0.75 = 3/4)'
for e in ST['Y5.B7.S4']['direct']:
    if e['key'] == 'conversions:d_to_f': e['opts'] = {'forms': [0]}
to_partial('Y5.B7.S4', 'conversions:f_to_d', 'about 1 item in 5 is a drag-bin sort of halves and quarters with percent tiles (75%), a week before percent (W22); f_to_d has no option to leave it out')
to_partial('Y5.B7.S4', 'conversions:d_to_f', 'decimal → fraction only (0.75 = 3/4, 0.7 = 7/10), chosen from four fractions; the fraction → decimal direction is f_to_d')
ST['Y5.B7.S4'].update(verdict='partial', build=['f_to_d_forms'],
    missing='a fraction → decimal page (1/2, 1/4, 3/4, fifths, tenths, hundredths) without the drag-bin sort and its percent tiles')
CLOSES.setdefault('Y5.B7.S4', {})['f_to_d_forms'] = 'f_to_d with the drag-bin sort left out, so the fraction → decimal page has no percent tiles a week before W22'
# B12.S5 / B12.S6: the Decimal Places value each clause judged
setopts('Y5.B12.S5', 'partial', 'decimals:sub_decimal', {'decimals': 1}, why='with Decimal Places 1 every item is tenths − tenths, so the places match; there is no same-number-of-places control at 2 or 3 places (43.53 − 41.4 when two places are asked)')
setopts('Y5.B12.S6', 'partial', 'decimals:add_decimal', {'decimals': 2}, why='with Decimal Places 2 different-place pairs come only some of the time (4.53 + 4.4); no page that always adds different numbers of places with a place-holder 0')
# B8.S1: no ft stories at W28 (customary is W33)
for e in ST['Y5.B8.S1']['direct']:
    if e['key'] == 'area_perimeter:perimeter': e['opts'] = {'forms': [0, 1]}
ST['Y5.B8.S1']['note'] = ('perimeter {forms:[0,1]} (find the perimeter; find a missing side from the perimeter) covers the WRM lesson; the story form '
                         'is left out because its fences are in feet (customary, W33). perimeter_grid gives the counting-on-squares start.')

# ── class C: building blocks the size rule dropped ──
ST['Y5.B5.S11']['missing'] = '× and ÷ problems with multi-digit calculations (4-digit × 1-digit, 4-digit ÷ 1-digit) and two-step problems mixing × / ÷ with + / −'
set_missing('Y5.B5.S11', 'division:remainder_interpret', '÷ only, one step; no × and no two-step problems; some stories divide by 12-17 (2-digit divisor, 5.NBT.B.6)')
setopts('Y5.B5.S6', 'pre', 'multiplication:area_model_mult', {'tiles': 21}, why=cite('Y5.B5.S6', 'Y4.B5.S9', 'the area model of the same multiplication'))
drop('Y5.B5.S6', 'related', 'division:remainder_interpret')
add('Y5.B5.S6', 'related', 'division:div_word_problems_plain', 'the inverse: one-step division stories')
add('Y5.B8.S3', 'pre', 'multiplication:mult_facts{"band":100}', 'sides × side length: a regular polygon\'s perimeter is one times-table fact (5 sides × 7 cm = 35 cm)', at=0)
ST['Y5.B8.S3']['pre'] = [e for e in ST['Y5.B8.S3']['pre'] if not (e['key'] == 'multiplication:mult_facts' and not e.get('opts'))]
for e in ST['Y5.B3.S1']['pre']:
    if e['key'] == 'multiplication:count_by_tables': e['opts'] = {'constant': [3]}; e['why'] = cite('Y5.B3.S1', 'Y4.B4.S1')
add('Y5.B12.S12', 'pre', 'division:missing_mult_div{"range":100}', cite('Y5.B12.S12', 'Y3.B4.S6', 'the same missing number in × and ÷, with whole numbers'), at=0)

# ── class D: whys that named a range the link does not deal ──
def why(sid, role, k, opts, text):
    setopts(sid, role, k, opts, why=text)
for sid in ('Y5.B1.S2',):
    for k in ('placevalue:place_value_disks', 'placevalue:pv_digit_drag', 'placevalue:expand'):
        for e in ST[sid]['pre']:
            if e['key'] == k: e['opts'] = {'band': 9999}
setopts('Y5.B1.S3', 'pre', 'placevalue:place_value_disks', {'band': 9999})
setopts('Y5.B1.S3', 'pre', 'placevalue:expand', {'band': 9999})
setopts('Y5.B1.S3', 'related', 'placevalue:compare', {'band': 99999}, why='compare two numbers to 100,000 (Y5.B1.S10)')
for sid in ('Y5.B1.S4', 'Y5.B1.S5'):
    for k in ('placevalue:place_value_disks', 'placevalue:expand'):
        for e in ST[sid]['pre']:
            if e['key'] == k: e['opts'] = {'band': 9999}
setopts('Y5.B1.S4', 'related', 'placevalue:combine', {'band': 999999}, why='standard form from parts, to 1,000,000')
for sid in ('Y5.B1.S6', 'Y5.B1.S7', 'Y5.B1.S8', 'Y5.B1.S9', 'Y5.B1.S11', 'Y5.B1.S14', 'Y5.B2.S2'):
    for e in ST[sid]['pre']:
        if e['key'] == 'placevalue:pv_digit_drag': e['opts'] = {'band': 999999}
for e in ST['Y5.B1.S9']['pre']:
    if e['key'] == 'number_sense:place_on_number_line': e['opts'] = {'span': 1000, 'band': 10000}
setopts('Y5.B1.S13', 'related', 'placevalue:compare', {'band': 99999}, why='compare the numbers before and after rounding, to 100,000')
setopts('Y5.B1.S14', 'related', 'placevalue:compare', {'band': 999999}, why='compare the numbers before and after rounding, to 1,000,000')
setopts('Y5.B1.S11', 'related', 'placevalue:number_word_names', why='the same 6-digit numbers named in words, read before they are compared')
setopts('Y5.B2.S6', 'related', 'subtraction:sub_wp_1m_plain', why='one-step subtraction stories: the single steps a multi-step problem is built from')
setopts('Y5.B5.S1', 'related', 'division:divide', why='the inverse: division facts and 2-digit ÷ 1-digit, before 4-digit ÷ 1-digit (Y5.B5.S8)')

# ── class E: duplicates ──
drop('Y5.B12.S4', 'pre', 'addition:add_10k_regroup')
move('Y5.B12.S4', 'decimals:compare_decimal', 'related', 'pre', cite('Y5.B12.S4', 'Y4.B9.S5', 'line up the tenths: the place-value reasoning column addition uses'))
setopts('Y5.B12.S4', 'pre', 'decimals:compare_decimal', {'decimals': 1})
ST['Y5.B15.S3']['pre'] = [e for i, e in enumerate(ST['Y5.B15.S3']['pre']) if not (e['key'] == 'area_perimeter:area_unit_squares' and any(x['key'] == e['key'] for x in ST['Y5.B15.S3']['pre'][:i]))]
move('Y5.B15.S3', 'measurement:estimate_length', 'related', 'pre', 'estimate a length from a known benchmark: the same estimate-from-a-known-size, before estimating volume')

# ── remaining step rows ──
# B3.S10
setopts('Y5.B3.S10', 'pre', 'number_theory:multiples', why='list the multiples of a number: a multiple of 100 is the same idea one place up (lower grade, Y3.B3 times-table multiples)')
setopts('Y5.B3.S10', 'related', 'placevalue:more_less_100', {'step': 1000}, why='1,000 more or 1,000 less: the next multiple of 1,000')
# B2.S1
setopts('Y5.B2.S1', 'pre', 'placevalue:more_less_100', {'step': 1000})
drop('Y5.B2.S1', 'related', 'addition:add_sub_10s')
# B2.S7
drop('Y5.B2.S7', 'pre', 'addition:equal_sign')
move('Y5.B2.S7', 'algebra:balance_addsub', 'related', 'pre', 'keep both sides equal: the balance behind comparing two calculations (Y3/Y4 equal-sides number sentences)')
add('Y5.B2.S7', 'related', 'number_sense:estimate_sums_diffs', 'compare by estimating: judge two calculations without working them out exactly')
# B1.S3: see class D above.  B12.S3
drop('Y5.B12.S3', 'related', 'decimals:compare_decimal')
add('Y5.B12.S3', 'related', 'measurement:money_change{"currency":"usd"}', 'change from a whole dollar: the same crossing of 1 ($1.00 − $0.25 = $0.75)')
# B10.S7
drop('Y5.B10.S7', 'related', 'graphs:pie_chart')
for e in ST['Y5.B10.S7']['pre']:
    if e['key'] == 'subtraction:subtract': e['key'] = 'subtraction:sub_1k_regroup'; e['why'] = cite('Y5.B10.S7', 'Y3.B2.S15', 'subtraction with an exchange, the step behind 180 − 45')
ST['Y5.B10.S7']['note'] = (ST['Y5.B10.S7']['note'] + ' ' if ST['Y5.B10.S7']['note'] else '') + \
    'No related link fits: the other angle skills are this step\'s pre-skills (naming, measuring) or its own partial; the pie-chart skill asks percents, not angles.'
# B13.S5
drop('Y5.B13.S5', 'related', 'integers:add_int')
# B14.S5
drop('Y5.B14.S5', 'pre', 'multiplication:multiply')
add('Y5.B14.S5', 'pre', 'multiplication:mult_facts{"constant":[6,7]}', '× 6 and × 7 facts: 6 × 10 = 60 and 7 days make a week, the facts behind each conversion')
# B7.S8: the build folds into Y4's dec_same_whole (RENAME above); the filler pre goes
drop('Y5.B7.S8', 'pre', 'placevalue:compare')
CLOSES.setdefault('Y5.B7.S8', {})['dec_same_whole'] = ('a page where every number has the same number of decimal places and the same whole part (0.47 vs 0.43; '
    '3.6, 3.2, 3.9): order_decimals at 2 dp mixes 1 and 2 dp, compare_decimal pairs usually differ in the whole part')
# B11.S2: the clause asks only what coord_polygon_draw closes
ST['Y5.B11.S2']['missing'] = 'finding the missing vertex of a rectangle or square from the coordinates of the other three'
# B1.S9 (critic r4 random 20, minor): see class D.  B1.S11 related why: class D.
# clauses the direct/partial content gate (class A(2)) found silent
set_missing('Y5.B1.S6', 'placevalue:place_value_10x', 'the powers of ten themselves: 10, 100 ... 1,000,000 and that each is 10 times the one before (10 hundreds = 1,000); it only multiplies/divides a number by 10, 100, 1,000, with ÷ 1,000 and decimal results that the school teaches from W10')
set_missing('Y5.B11.S6', 'coordinates:geo_reflect', 'multiple choice over a reflection in the x- or y-axis only (a later-grade coordinate form); no drawing in a horizontal or vertical mirror line on squared paper')
setopts('Y5.B2.S1', 'pre', 'placevalue:more_less_100', why='Y5.B1.S7 1,000 more or 1,000 less (taught earlier this year): the jump a mental calculation counts on in')
ST['Y5.B2.S7']['missing'] = 'comparing two +/− calculations by reasoning about how they differ (same start, one addend 1 less), with large numbers (4,580 + 2,000 vs 4,580 + 1,999)'
for sid in ('Y5.B7.S10', 'Y5.B7.S11'): drop_if(sid, 'pre', 'number_sense:nearest_10')   # deals the same items as rounding_visual (class E)
# the metric stories' "Length Key" also prints 1 ft = 12 in and 1 yd = 3 ft (customary): a generator defect, named in the clause
setopts('Y5.B14.S1', 'partial', 'measurement:unit_conversion_word', why='with {units:[1]} (metric) the stories go larger to smaller only (8 kg = ? g; 4 km = ? m) and mix in L and cm, and the length key beside them also lists 1 ft = 12 in and 1 yd = 3 ft (customary); no smaller to larger, no mixed units')
setopts('Y5.B14.S3', 'partial', 'measurement:unit_conversion_word', why='with {units:[1]} (metric) larger to smaller only, mass and capacity stories are mixed in, and the length key also lists 1 ft = 12 in and 1 yd = 3 ft (customary)')
drop('Y5.B12.S12', 'pre', 'division:div_facts')   # its why named the 7s while it dealt 3, 6, 9; missing_mult_div is the ×/÷ link now

# ── full sweep (every why and clause against generated items, round 2) ──
# B1: whys that named a size or a place the link did not deal
setopts('Y5.B1.S2', 'related', 'placevalue:compare', {'band': 9999})
setopts('Y5.B1.S5', 'related', 'placevalue:identify', {'band': 999999})
setopts('Y5.B1.S9', 'related', 'placevalue:compare', {'band': 999999})
setopts('Y5.B1.S10', 'related', 'placevalue:number_word_names', why='the same 5-digit numbers named in words, read before they are compared')
# B3: the 3, 6 and 9 chart deals those tables; whys that described another item
for sid in ('Y5.B3.S1', 'Y5.B3.S2', 'Y5.B3.S6', 'Y5.B3.S7'):
    for e in ST[sid]['pre']:
        if e['key'] == 'multiplication:mult_chart': e['opts'] = {'task': 'headers', 'band': 100, 'constant': [3, 6, 9]}
setopts('Y5.B3.S6', 'related', 'area_perimeter:area_perimeter', why='area of a rectangle; a square number is the area of a square with whole-number sides')
setopts('Y5.B3.S6', 'related', 'multiplication:mult_facts', why='times-table facts: a square number is the fact with two equal factors (6 × 6)')
setopts('Y5.B3.S7', 'related', 'area_perimeter:volume', why='volume of a box (length × width × height): a cube number is the volume of an n × n × n cube')
setopts('Y5.B3.S10', 'related', 'number_theory:divisibility_sort', why='divisibility: is the number a multiple of the divisor? (2, 5, 9, 10 …)')
# B5
for sid in ('Y5.B5.S2', 'Y5.B5.S4'):
    setopts(sid, 'related', 'multiplication:mult_properties', {'forms': [1]}, why='breaking a factor apart (6 × 17 = 6 × 10 + 6 × 7): the distributive idea the area model and the column use')
drop('Y5.B5.S2', 'related', 'algebra:distributive_expr')   # letters and factoring out (6.EE): later grade
for sid in ('Y5.B5.S2', 'Y5.B5.S3'):
    for e in ST[sid]['pre']:
        if e['key'] == 'placevalue:place_value_10x': e['opts'] = {'op': 'x', 'power': [10, 100], 'band': 10000}
for e in ST['Y5.B5.S7']['pre']:
    if e['key'] == 'placevalue:place_value_10x': e['opts'] = {'op': '/', 'power': [10, 100], 'band': 10000}
for sid in ('Y5.B14.S1', 'Y5.B14.S2', 'Y5.B14.S3'):
    for e in ST[sid]['pre']:
        if e['key'] == 'placevalue:place_value_10x': e['opts'] = {'op': '/', 'power': [10, 100, 1000], 'band': 10000}
for e in ST['Y5.B5.S3']['pre']:
    if e['key'] == 'multiplication:multiply' and (e.get('opts') or {}).get('tiles') == 21: e['why'] = cite('Y5.B5.S3', 'Y4.B5.S9')
for e in ST['Y5.B5.S4']['pre']:
    if e['key'] == 'multiplication:multiply': e['opts'] = {'tiles': 22}
setopts('Y5.B5.S8', 'related', 'multiplication:multiply', why='the inverse: multiply the quotient by the divisor to get back to the dividend')
setopts('Y5.B5.S10', 'pre', 'division:divide', why='division facts: the known facts an efficient method starts from (Y5.B5.S9 Divide with remainders, previous step)')
set_missing('Y5.B5.S6', 'number_ops_mixed:word_problems_mixed', 'one-step stories of all four operations with table-fact numbers; no multi-digit × and no two-step problems')
# B6 / B7: later-grade related links (5.NF.B.5 scaling, 6.RP percent of a number)
drop('Y5.B6.S1', 'related', 'fraction_operations:mult_scaling')
drop('Y5.B6.S7', 'related', 'fraction_operations:mult_scaling')
add('Y5.B6.S7', 'related', 'fraction_operations:frac_mult_word{"denoms":[5]}', 'the operator applied to a quantity in a story (4/5 of a litre, 4 times)')
drop('Y5.B7.S12', 'related', 'conversions:percent_of_number')
# B10.S6 like B10.S7: no pie-chart percents; the subtraction is 3-digit-ready
drop('Y5.B10.S6', 'related', 'graphs:pie_chart')
for e in ST['Y5.B10.S6']['pre']:
    if e['key'] == 'subtraction:subtract': e['key'] = 'subtraction:sub_1k_regroup'; e['why'] = cite('Y5.B10.S6', 'Y3.B2.S15', 'subtraction with an exchange, the step behind 360 − 145')
ST['Y5.B10.S6']['note'] = (ST['Y5.B10.S6']['note'] + ' ' if ST['Y5.B10.S6']['note'] else '') + \
    'No related link fits: the other angle skills are this step\'s pre-skills (naming, measuring) or its own partial; the pie-chart skill asks percents, not angles.'
# B12
setopts('Y5.B12.S1', 'related', 'fraction_operations:add_fractions_like', why='the same fact with tenths as fractions: 3/10 + 4/10 = 7/10, as 0.3 + 0.4 = 0.7')
setopts('Y5.B12.S2', 'related', 'decimals:sub_decimal', why='column subtraction of decimals: 1.0 − 0.3 written in columns checks a complement')
for sid in ('Y5.B12.S5', 'Y5.B12.S6', 'Y5.B12.S7'):
    setopts(sid, 'related', 'decimals:order_decimals', why='order decimals with different numbers of places (7.087, 13.9): line up the places, as the column does')
setopts('Y5.B12.S5', 'pre', 'decimals:compare_decimal', why=cite('Y5.B12.S5', 'Y4.B9.S5', 'compare decimals place by place before subtracting them'))
setopts('Y5.B12.S10', 'pre', 'conversions:d_to_f', why='tenths written as a decimal and as a fraction (0.7 = 7/10), lower grade (Y4.B8 tenths)')
drop('Y5.B12.S11', 'pre', 'decimals:compare_thousandths')   # thousandths are taught after this step (W12); the why cited the later step
# B13: formal integer addition (7.NS.A.1) is not a Grade 4 related link
for sid in ('Y5.B13.S2', 'Y5.B13.S3'): drop(sid, 'related', 'integers:add_int')
# B14 / B15
setopts('Y5.B14.S3', 'pre', 'measurement:mass_volume_liquid', why=cite('Y5.B14.S3', 'Y3.B7.S8', 'choose the unit (mL or L, g or kg) before converting between them'))
setopts('Y5.B14.S4', 'related', 'measurement:capacity', {'units': [0], 'forms': [1]}, why='customary capacity: sort containers by size in pints, quarts and gallons')
setopts('Y5.B15.S2', 'related', 'measurement:mass_volume_liquid', {'forms': [0]}, why='capacity read on a scale in mL: the other "how much space" measure')
setopts('Y5.B15.S3', 'pre', 'measurement:estimate_length', {'forms': [0]}, why='estimate a length from a known benchmark ("about how long is a classroom?"): the same estimate-from-a-known-size, before estimating volume')
setopts('Y5.B15.S4', 'partial', 'measurement:capacity', {'units': [1], 'forms': [1]}, why='with {units:[1], forms:[1]} it sorts metric containers against 1 litre (a juice box 200 mL, a bucket 8 L); the pupil never writes an estimate in ml or l')
setopts('Y5.B15.S4', 'pre', 'measurement:mass_volume_liquid', {'forms': [0]})
setopts('Y5.B15.S4', 'pre', 'measurement:estimate_length', {'forms': [0]})
setopts('Y5.B15.S4', 'related', 'measurement:unit_conversions', {'units': [0]}, why='metric conversions: L ↔ mL beside m and g, the units an estimate is written in')
set_missing('Y5.B5.S6', 'number_ops_mixed:word_problems_mixed', 'one-step stories of all four operations with table-fact numbers; no multi-digit × and no two-step problems; a few division stories have a 2-digit divisor (13)')
set_missing('Y5.B5.S11', 'number_ops_mixed:word_problems_mixed', 'multi-digit × and ÷ numbers: table-fact stories only; a few division stories have a 2-digit divisor (13)')
for sid in ('Y5.B14.S1', 'Y5.B14.S2', 'Y5.B14.S3'):
    for e in ST[sid]['pre']:
        if e['key'] == 'placevalue:place_value_10x': e['opts'] = {'op': '/', 'power': [10, 100], 'band': 10000}
# B15.S3: the clause carries the step's own range (benchmarks run from 1 cm³ to a few thousand), so the metric estimate link fits
ST['Y5.B15.S3']['missing'] = 'estimating the volume of an object in cm³ (or cubes) from a benchmark (a sugar cube is about 1 cm³; a cereal box about 3,000 cm³)'
