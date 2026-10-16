# Y5 round 5 (critic r6, FAIL narrowly: B15.S4 / B15.S1 / B15.S3 = 7; lessons 7 and 10 = 7). Builder escalated to Opus medium.
# Build-level classes are fixed at the source (linkfit.mjs):
#   K  the customary-on-metric check runs on EVERY metric or time unit (Y5.B8, B10, B14 except S4, B15, and any unit whose
#      title names a metric unit), pre and related; a why that says "metric", "L", "mL", "kg" … must be true of the items
#   L  a why that claims a multiplicative idea ("times as many", "equal parts", "equal groups", "multiplicative") must be
#      true of the items (tape_diagram is additive in every form)
#   M  a clause that says "never X" / "no X" is checked against every option value label of the unit's own skills
#      (frac_10_100_nv forms value 2 "Add tenths and hundredths"), and against the items
#   H' unlikeCompare reads the answer, the payload and the words "greatest / least / order"; the why-unit check reads the
#      whole cited title, the text in parentheses included
#   S  the root-cause sweep (sweep.mjs): every claim word of every why and clause checked against 30 fresh-seed items;
#      its rules are claims.mjs, which linkfit.mjs runs on every build
# Applied after spec_zz_r5.py (file-name order). This file holds the per-entry rows.

L = 'G4|-|'
def sw(sid, role, k, why=None, opts=None, maxNumber=None):
    """Set the why (or clause) and / or opts of one link of a step or a lesson, by key or 'key{opts}'."""
    hit = False
    for e in _u(sid)[role]:
        if _match(e, k):
            if why is not None: e['why' if role in ('pre', 'related') else 'missing'] = why
            if opts is not None:
                if opts: e['opts'] = opts
                else: e.pop('opts', None)
            if maxNumber is not None: e['maxNumber'] = maxNumber
            hit = True
    if not hit: errs.append(f'r6 sw: {sid} {role} has no {k}')

# ── K: Y5.B15 metric steps ──
# B15.S4 Estimate capacity: the related link is metric conversions (5 L = 5,000 mL), one conversion a cell (no "1 mile"
# distractor of the click-all form); the weak area pre gives way to the litre-millilitre conversions an estimate is checked by
dropkey('Y5.B15.S4', 'related', 'measurement:unit_conversions')
addl('Y5.B15.S4', 'related', 'measurement:unit_conversions{"units":[0],"forms":[0]}',
     'metric conversions, one a cell, capacity among length and mass: the metric measures an estimate is written in and checked by')
# the step's own range: a large container's estimate is written both ways (a bucket about 5 l = 5,000 ml), the size the Y5.B14
# conversions (W31-W32) reach; linkfit sizes the links from it (the r2 why on {units:[0]} had been re-optioned to the customary
# {units:[1]} by the fit pass because 5,000 passed the 500 ceiling of the partial's items: the claim rules now stop that)
ST['Y5.B15.S4']['missing'] = ('estimating a container\'s capacity in ml and l against benchmarks (a cup ≈ 250 ml, a bottle 1 l) and writing a large one '
                              'both ways (a bucket ≈ 5 l = 5,000 ml)')
dropkey('Y5.B15.S4', 'pre', 'area_perimeter:area_unit_squares')
addl('Y5.B15.S4', 'pre', 'measurement:capacity{"units":[1],"forms":[0]}', cite('Y5.B15.S4', 'Y3.B7.S9', '1 L = 1,000 mL: the benchmark a capacity estimate is compared to'), at=1)
# B15.S1 / B15.S3: volume with the "find the volume" form only (length = 3, width = 3, height = 2 … cubic units; no ft / in)
for sid in ('Y5.B15.S1', 'Y5.B15.S3'):
    setopts(sid, 'related', 'area_perimeter:volume', {'forms': [0], 'band': 30})
setopts('Y5.B15.S1', 'related', 'area_perimeter:volume', why='length × width × height in cubic units (length = 3, width = 3, height = 2): counting the cubes by layers, the Grade 5 step after this one')
setopts('Y5.B15.S3', 'related', 'area_perimeter:volume', why='working out a cuboid\'s volume in cubic units (length × width × height) to check an estimate')
# B15.S1 pre: the graduated-cylinder millilitres (1 mL fills 1 cm³), not the click / sort-by-unit form (which sorts grams too)
setopts('Y5.B15.S1', 'pre', 'measurement:mass_volume_liquid', {'forms': [0]},
        why=cite('Y5.B15.S1', 'Y3.B7.S7', 'reading millilitres on a cylinder: one millilitre is the space of one small cube'))

# ── L: false "times as many" why on an additive bar ──
U7 = L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier'
dropkey(U7, 'related', 'algebra:tape_diagram')
addl(U7, 'related', 'division:div_word_problems_plain{"forms":[1],"range":100}',
     'grouping stories (42 shells, 6 in each basket: how many baskets?): the division that answers "how many times as many?" (42 is 7 times 6)')
addl(U7, 'related', 'division:missing_mult_div{}@100',
     'the unknown-factor equation of the story (___ × 7 = 42, 48 ÷ ___ = 8): the multiplier is the missing factor')
dropkey('Y5.B5.S11', 'related', 'algebra:tape_diagram')

# ── M: lesson 10 Add tenths and hundredths: frac_10_100_nv already adds them (forms value 2) ──
A10 = L + 'addtenthsandhundredthsrenametenthsashundredths'
dropkey(A10, 'related', 'fraction_operations:frac_10_100_nv')
_p10 = E('fraction_operations:frac_10_100_nv{"forms":[2]}')
_p10['missing'] = ('adds a tenths and a hundredths fraction in numbers (3/10 + 5/100 = ?/100), but the forms value does not keep the page to them '
            '(on the print path a page still mixes in renaming and click-all items), and there is no hundred-square picture')
LESSONS[A10]['partial'].insert(0, _p10)
LESSONS[A10]['missing'] = ('a page of tenths-plus-hundredths additions only (3/10 + 4/100 = 34/100), and the same addition pictured on a '
                           'hundred square (shade 3 columns and 4 squares)')
for e in LESSONS[A10]['partial']:
    if e['key'] == 'fraction_operations:frac_10_100':
        e['missing'] = 'renames tenths as hundredths (4/10 = 40/100) with its picture, but has no add form; the additions are on frac_10_100_nv'
CLOSES.setdefault(A10, {})['add_tenths_hundredths'] = ('a page of tenths-plus-hundredths additions only (frac_10_100_nv forms:[2] does not filter '
                                                       'on the print path), and the addition pictured on a hundred square')
NEW['add_tenths_hundredths'] = {
    'kind': 'option', 'skill': 'fraction_operations:frac_10_100', 'also': ['fraction_operations:frac_10_100_nv'],
    'option': 'form "add a tenths and a hundredths fraction (3/10 + 4/100)" on frac_10_100 (pictured); and make the existing forms value 2 '
              '"Add tenths and hundredths" of frac_10_100_nv keep a printed page to the additions',
    'name': 'Add Tenths and Hundredths, Pictured (option)',
    'teaches': 'renaming the tenths fraction as hundredths on a hundred square and adding: 3/10 + 4/100 = 30/100 + 4/100 = 34/100',
    'representation': 'the existing frac_10_100 cell: a hundred square shading 3 columns and 4 squares, the two-step equation with answer boxes',
    'family': 'fraction_operations', 'ccss': ['4.NF.C.5'],
    'why': 'frac_10_100_nv already adds tenths and hundredths in numbers (its forms value 2), but on the print path forms:[2] still deals renaming and '
           'click-all items (6 of 20 are additions); frac_10_100, the pictured skill, has no add form'}
# carried r5 minor: the decimal-addition link is what it deals (2-place decimals past 1), not "0.3 + 0.04"
sw(A10, 'related', 'decimals:add_decimal', why='adding decimals with hundredths, sometimes with different numbers of places (76.28 + 18.2): the '
        'same tenths-and-hundredths sum written as decimals (Y5.B12.S6, W14)')

# ── carried r5 minor: lesson 14 pre "capacity" is the millilitre cylinder, not the sort that mixes in grams ──
C14 = L + 'customarycapacitycupspintsquartsandgallons'
dropkey(C14, 'pre', 'measurement:mass_volume_liquid')
addl(C14, 'pre', 'measurement:mass_volume_liquid{"forms":[0]}', cite(C14, 'Y3.B7.S7', 'reading a capacity on a scale before converting it'), at=0)

# ── minors ──
# B2.S6: the plain twin of its own partial and the pool that deals its own partials' items are not related links
dropkey('Y5.B2.S6', 'related', 'algebra:tape_diagram_plain')
dropkey('Y5.B2.S6', 'related', 'algebra:algebra_word_mixed')
# B3.S3: the "× 1 and commutative" pre deals exactly those two properties
setopts('Y5.B3.S3', 'pre', 'multiplication:mult_properties', {'forms': [0, 2]})
# B10.S3: the turns-and-angles skill a benchmark estimate builds on is a proposal: it is this step's preBuild
ST['Y5.B10.S3']['preBuild'].append('turns_angles')
ST['Y5.B10.S3']['note'] = ('Pre-skills are few: estimating an angle builds on naming it (acute, obtuse, right), which identify_angles deals, and on '
    'quarter, half and whole turns (90°, 180°, 360°), which no live skill deals: turns_angles is the preBuild. measure_angles is the step\'s own '
    'partial, so it is not repeated as a pre.')

# ── S: the root-cause sweep (sweep.mjs, 30 fresh-seed items a link): every false claim found, fixed at its row ──
# clauses that named what the items do not deal
sw('Y5.B1.S6', 'partial', 'placevalue:place_value_10x', why='the powers of ten themselves: 10, 100 ... 1,000,000 and that each is 10 times the one before '
   '(10 hundreds = 1,000); it only multiplies and divides whole numbers by 10, 100 and 1,000 (43 × 1,000; 58,800 ÷ 100), with no decimal '
   'results, and × / ÷ 1,000 is content the school teaches from W10')
sw('Y5.B12.S3', 'partial', 'decimals:add_decimal', why='the sums (23.2 + 64.4 = ?) cross 1 at random; no "across 1" control or number-line / place-value model')
sw('Y5.B12.S3', 'partial', 'decimals:sub_decimal', why='the differences (64.4 − 23.2 = ?) cross 1 at random; no across-1 control or model')
# whys whose words the items do not bear out
sw('Y5.B1.S13', 'related', 'placevalue:compare', why='comparing numbers to 100,000 place by place: is 46,500 nearer 46,000 or 47,000?')
sw('Y5.B1.S14', 'related', 'placevalue:compare', why='comparing numbers to 1,000,000 place by place: is 465,000 nearer 460,000 or 470,000?')
sw('Y5.B3.S8', 'related', 'multiplication:mult_facts', why='times-table facts (6 × 7 = 42): the fact behind 6 × 70 and 60 × 700')
sw('Y5.B3.S9', 'related', 'number_sense:estimate_quotient', why='a near number that divides easily, then divide (34 ÷ 5 ≈ 35 ÷ 5 = 7)')
for sid in ('Y5.B4.S4', 'Y5.B4.S5'):
    sw(sid, 'pre', 'multiplication:mult_facts', why='times-table facts: wholes × denominator (3 wholes = 3 × 4 quarters)')
sw('Y5.B4.S4', 'pre', 'division:div_remainders', why='division with remainders (17 ÷ 5 = 3 r 2): the wholes and the part left over, as in 17/5 = 3 2/5')
sw('Y5.B4.S14', 'pre', 'composing:whole_as_fraction', why='1 = 4/4: the whole renamed as a fraction, the first move when a fraction is taken from a whole (CCSS 3.NF.A.3c)')
for sid in ('Y5.B5.S2', 'Y5.B5.S4'):
    sw(sid, 'related', 'multiplication:mult_properties', why='breaking a factor apart (6 × 17 = 6 × 10 + 6 × 7): the distributive idea every written × method uses')
sw('Y5.B5.S8', 'related', 'multiplication:multiply', why='the inverse operation: a multi-digit × 1-digit product undoes the sharing (749 × 9 = 6,741)')
sw('Y5.B5.S9', 'related', 'division:div_check_by_multiplying', why='checking a division by multiplying back (quotient × divisor = dividend), here without a remainder')
sw('Y5.B5.S10', 'pre', 'division:divide', why='short division with 1-digit divisors and no remainder: the known facts an efficient method starts from')
sw('Y5.B7.S4', 'pre', 'fractions:equivalent', opts={'denoms': [5]}, why=cite('Y5.B7.S4', 'Y4.B7.S10', 'fifths renamed as tenths, 1/5 = 2/10'))
sw('Y5.B7.S13', 'pre', 'fractions:equivalent', opts={'denoms': [5]}, why='renaming fifths as tenths and twentieths (1/5 = 2/10 = 4/20): the same scaling a fraction out of 100 needs (CCSS 4.NF.A.1)')
sw('Y5.B7.S6', 'pre', 'decimals:decimal_nl_drag', why=cite('Y5.B7.S6', 'Y4.B8.S4', 'tenths placed on a line, the first of the decimal places'))
sw('Y5.B7.S6', 'pre', 'fraction_operations:frac_10_100', why=cite('Y5.B7.S6', 'Y4.B8.S7', 'tenths and hundredths as fractions, the pattern the third place continues'))
sw('Y5.B7.S8', 'pre', 'conversions:d_to_f', why=cite('Y5.B7.S8', 'Y4.B8.S8'))
sw('Y5.B8.S1', 'pre', 'multiplication:multiply', why=
   '× 2 facts and doubling: a rectangle has two of each side (CCSS 3.OA.C.7)')
sw('Y5.B8.S3', 'pre', 'multiplication:mult_facts', why='sides × side length: a regular polygon\'s perimeter is one times-table fact (5 sides of 7 make 35)')
sw('Y5.B9.S1', 'related', 'graphs:line_plot', why='a line PLOT is not a line graph: tell the two apart')
sw('Y5.B10.S4', 'related', 'angles_lines:identify_lines', why='lines, rays and the vertex: the parts of every angle')
sw('Y5.B11.S4', 'pre', 'addition:add', why='adding the squares moved to a position number (3 + 4 = 7)')
sw('Y5.B12.S1', 'related', 'decimals:add_decimal', why='decimal addition written in a line (23.2 + 64.4): the written sums known facts make quick')
sw('Y5.B12.S1', 'related', 'decimals:sub_decimal', why='decimal subtraction written in a line (64.4 − 23.2): the written differences known facts make quick')
sw('Y5.B12.S2', 'related', 'decimals:sub_decimal', why='subtracting decimals with tenths and hundredths (68.6 − 64.4): the inverse of making a complement')
sw('Y5.B12.S4', 'pre', 'decimals:compare_decimal', why=cite('Y5.B12.S4', 'Y4.B9.S5', 'line up the tenths: the same place-value reading of each digit'))
sw('Y5.B14.S3', 'related', 'measurement:capacity', why='the same 1,000-to-1 conversion for litres and millilitres')
sw('Y5.B14.S4', 'pre', 'measurement:length_metric', opts={'forms': [1]})
# a pre whose skill the school teaches only after the entry (sweep c): adding angles is W31, this step W26
dropkey('Y5.B10.S8', 'pre', 'angles_lines:additive_angles')
addl('Y5.B10.S8', 'related', 'angles_lines:additive_angles', 'angles that add up to a whole turn or a straight line: finding a missing angle, the step after this one (Y5.B10.S6)')
# lessons
for lid in (L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', L + 'multiplicativecomparisontimesasmany', U7):
    sw(lid, 'pre', 'division:div_facts', why='division facts to 144 ÷ 12, every divisor from 2 to 12 (the Y4.B4 division facts)')
sw(L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', 'related', 'placevalue:unit_form', why='45 hundreds = 4,500: the unit-form step inside 9 tens times 5 tens')
sw(L + 'anglesareadditivefindanunknownangleinadecomposedangle', 'related', 'angles_lines:mixed_angles_lines', why='measuring, naming and finding angles mixed on one page')
CL15 = L + 'customarylengthandweightinchesfeetyardsouncesandpounds'
sw(CL15, 'pre', 'multiplication:mult_facts', why=cite(CL15, 'Y4.B4.S10', 'the × 12 fact behind changing 3 of the larger length unit into 36 of the smaller'))
MW = L + 'measurementwordproblemsdistancetimemassmoneyandcapacity'
sw(MW, 'pre', 'measurement:length_metric', opts={'forms': [3]})
sw(MW, 'related', 'measurement:capacity', why='the capacity conversions a measurement problem may need first')
sw(CF, 'pre', 'fractions:equiv_frac_visual', opts={'model': ['bar']})
# class M: the remainder option of div_word_problems is named, and why it is not the lesson's partial
MS = L + 'multistepwordproblemsdivideandinterprettheremainder'
LESSONS[MS]['note'] += (' div_word_problems / div_word_problems_plain with forms value 2 ("A remainder to interpret") are not listed: on the print path that '
                        'value does not filter, and 12 of 12 generated items are sharing stories with no remainder (a generator defect, Y5-report.md).')
# the "Divide a number by 1 and itself" cite on a × skill: the multiplication half, with the property forms that deal it
sw('Y5.B3.S3', 'pre', 'multiplication:mult_properties', why=cite('Y5.B3.S3', 'Y4.B4.S12', 'the multiplication half: n × 1 = n and 3 × 4 = 4 × 3, the facts behind "1 and itself" and factor pairs'))
sw('Y5.B3.S5', 'pre', 'multiplication:mult_properties', opts={'forms': [2]}, why=cite('Y5.B3.S5', 'Y4.B4.S12', 'the multiplication half: n × 1 = n, so every number has 1 and itself as factors'))
sw('Y5.B3.S7', 'pre', 'multiplication:mult_properties', opts={'forms': [0]}, why=cite('Y5.B3.S7', 'Y4.B4.S12', 'the multiplication half: the order facts (3 × 4 = 4 × 3) a product of three equal factors is regrouped by'))
sw(U7, 'related', 'division:missing_mult_div', why='the unknown-factor equation (___ × 7 = 42, 48 ÷ ___ = 8): the multiplier a comparison asks for is the missing factor')
# sweep (c): a pre with larger numbers than its entry deals
sw('Y5.B8.S4', 'pre', 'area_perimeter:perimeter', opts={'forms': [0], 'band': 20})
sw(L + 'lineplotswithfractions', 'pre', 'graphs:bar_graph', opts={'most': 10})
