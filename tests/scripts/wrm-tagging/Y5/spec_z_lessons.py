# Y5 (school Grade 4) SITE LESSONS: every lesson of data/curriculum/site-lessons.json with wrmYear Y5, i.e. the lessons the
# school site schedules or lists that are NOT White Rose small steps (owner rule 2026-10-16, "every site lesson tagged").
# Same contract as a step (BRIEF.md): direct / partial with opts and clause, verdict, missing, build (a proposal with its
# closes), pre >= 3 (cited by the step the skill is tagged to and the school week), related, note. Lessons tag NOTHING into
# SKILL_WRM (a site lesson is not a WRM step: no tagFixes); a proposal a lesson needs lists the lesson under `lessons`.
# Every direct / partial verdict below was judged from generated items (generateQuestionFor, the opts listed), see
# Y5-report.md "Site lessons"; pre / related links pass linkfit.mjs exactly as a step's do (week = the lesson's first week;
# a Support lesson with no week is judged at W38).
import json as _json

_Y4 = _json.load(open(R_ROOT + 'data/curriculum/links/Y4.json')) if 'R_ROOT' in globals() else None

def _from_y4(pid):
    p = {k: v for k, v in _Y4['proposals'][pid].items() if k not in ('steps', 'reused', 'closes', 'source', 'corrected', 'correctionWhy')}
    p['stepsOtherYears'] = list(_Y4['proposals'][pid].get('steps') or [])
    p['source'] = 'Y4.json (wave-2 tagging, critic r13 PASS)'
    NEW[pid] = p

_from_y4('div10_small_numbers')

# ── new proposals (only what no existing proposal does) ──
NEW['facts_times_tens'] = {
    'kind': 'option', 'skill': 'multiplication:mult_zeros',
    'option': 'forms "a multiple of ten × a multiple of ten (90 × 50)" and "÷ by a multiple of ten or a 1-digit number with zeros (300 ÷ 30, 2,400 ÷ 6)"',
    'name': 'Basic Facts With Tens: × and ÷ (option)',
    'teaches': 'using a basic fact and place value to multiply two multiples of ten (90 × 50 = 9 × 5 × 100) and to divide multiples of ten (300 ÷ 30 = 30 ÷ 3)',
    'representation': 'the existing across fact cell; a "9 × 5 = 45, so 90 × 50 = ___" fact line above as a hint that fades',
    'family': 'multiplication', 'ccss': ['4.NBT.A.1', '4.NBT.B.5', '4.NBT.B.6'],
    'why': 'generated mult_zeros {forms:[2]} multiplies one 1-digit number by a multiple of ten (6 × 40) only: no tens × tens and no division form'}
NEW['growing_shape_patterns'] = {
    'kind': 'new', 'skill': 'patterns:growing_shape_patterns',
    'name': 'Growing Shape Patterns',
    'teaches': 'drawing the next term of a growing pattern of dots or squares (1, 3, 5 …), counting each term and writing the number sequence and its rule',
    'representation': 'one boxed cell: three pictured terms (dots or squares) in boxes, an empty box to draw term 4, a count row under the terms',
    'family': 'patterns', 'ccss': ['4.OA.C.5'],
    'why': 'patterns:shape_pattern deals repeating patterns only (AB, ABC); no skill pictures a pattern that grows'}
NEW['comparison_unknown'] = {
    'kind': 'option', 'skill': 'multiplication:mult_comparison', 'also': ['multiplication:mult_comparison_plain'],
    'option': 'unknown "the larger amount" | "how many times as many" | "the smaller amount" (default all three)',
    'name': 'Times as Many: Choose the Unknown (option)',
    'teaches': 'one kind of comparison story per page, e.g. only "how many times as many?" (42 is how many times 7?), solved with a bar model or a division',
    'representation': 'the existing story cell with its comparison bar (two bars, one cut into equal parts); one answer box',
    'family': 'multiplication', 'ccss': ['4.OA.A.2'],
    'why': 'generated mult_comparison deals the three unknowns at random: 4 of 8 generated items ask "how many times as many?"; no option keeps a page on one'}
NEW['add_tenths_hundredths'] = {
    'kind': 'option', 'skill': 'fraction_operations:frac_10_100', 'also': ['fraction_operations:frac_10_100_nv'],
    'option': 'form "add a tenths and a hundredths fraction (3/10 + 4/100)"',
    'name': 'Add Tenths and Hundredths (option)',
    'teaches': 'renaming the tenths fraction as hundredths and adding: 3/10 + 4/100 = 30/100 + 4/100 = 34/100, with a hundred square',
    'representation': 'the existing frac_10_100 cell: a hundred square shading 3 columns and 4 squares, the two-step equation with answer boxes',
    'family': 'fraction_operations', 'ccss': ['4.NF.C.5'],
    'why': 'generated frac_10_100 renames 4/10 as 40/100 and finds equivalents of 0.05, but never adds a tenths and a hundredths fraction'}
NEW['weight_customary'] = {
    'kind': 'new', 'skill': 'measurement:weight_customary',
    'name': 'Customary Weight (oz/lb)',
    'teaches': 'knowing 1 lb = 16 oz and converting pounds to ounces (3 lb = 48 oz), and mixed pounds-and-ounces (2 lb 4 oz = 36 oz), as length_customary does for length',
    'representation': 'one boxed cell: the conversion fact "1 lb = 16 oz" as a hint that fades, the conversion, one answer box; a two-column lb | oz table option',
    'family': 'measurement', 'ccss': ['4.MD.A.1'],
    'why': 'length_customary deals inches, feet, yards and miles only; unit_conversions {units:[1]} mixes pounds with quarts, cups and fluid ounces'}
NEW['measure_word_four_ops'] = {
    'kind': 'new', 'skill': 'measurement:measurement_word_problems',
    'name': 'Measurement Word Problems (Four Operations)',
    'teaches': 'one- and two-step stories about distance, time, mass, capacity and money that add, subtract, multiply or divide measures, some with a unit change (2 kg 300 g, 1 ½ hours) and a number-line diagram',
    'representation': 'one boxed story cell: the story, a measuring-scale or number-line diagram, a work box and an answer box with the unit printed',
    'family': 'measurement', 'ccss': ['4.MD.A.2'],
    'why': 'unit_conversion_word only converts one measure; no skill adds, subtracts, multiplies or divides measures with money and fractions of a unit (4.MD.A.2)'}
NEW['frac_compare_same_part'] = {
    'kind': 'option', 'skill': 'fractions:compare', 'also': ['fractions:order_fractions'],
    'option': 'pairs "same denominator" | "same numerator" (3.NF.A.3d)',
    'name': 'Compare Fractions With the Same Numerator or Denominator (option)',
    'teaches': 'comparing two fractions that share a denominator (3/8 < 5/8) or a numerator (3/4 > 3/8), with bars, and saying why',
    'representation': 'the existing compare cell with two bars of the same whole; the < > = answer box',
    'family': 'fractions', 'ccss': ['3.NF.A.3d'],
    'why': 'generated fractions:compare {denoms:[2,3]} mixes unlike pairs (1/4 vs 7/10, 3/5 vs 1/2) with same-part pairs; Grade 3 compares same numerator or same denominator only'}

# STANDARD_PROPOSALS entries a lesson is the first to use carry templates, not a representation in our B&W cell terms
for _pid, _rep in (('make_line_plot', 'one boxed cell: the data list in a box, a number line marked 0 to 3 in eighths with an X column to fill per value, then one question box (how many longer than 1 1/2 in?)'),
                   ('points_lines_rays', 'one boxed cell: a drawn figure (dot, line with two arrows, segment with two end dots, ray with one) and a label bank to write from; a draw-it item on dot paper'),
                   ('patterns_notice', 'one boxed cell: a pattern row or a times-table strip, a "what do you notice?" sentence frame with a word bank (odd, even, ones digit, repeats) and a check-box choice')):
    PATCH[_pid] = {'representation': _rep, 'correctionWhy': 'representation written in our boxed-cell terms (the build-list entry names templates only)'}

# ── the 22 lessons ──
L = 'G4|-|'
lesson(L + 'placevalue10timesandonetenthofadigitsvalue',
    partial=[('placevalue:value{"band":9999}', 'the worth of one underlined digit only; never compares the same digit in two places (the 7 in 700 is 10 times the 7 in 70)'),
             ('placevalue:place_value_10x{"op":"x","power":[10],"band":10000}', 'multiplies a number by 10 on a shift chart; never says a digit is worth one tenth of the same digit one place to its left')],
    verdict='partial', missing='comparing the value of the same digit in neighbouring places: 10 times the place to its right and one tenth of the place to its left',
    build=['value_ten_times'],
    pre=[('placevalue:place_value_disks{"band":9999}', cite(L + 'placevalue10timesandonetenthofadigitsvalue', 'Y5.B1.S2')),
         ('placevalue:identify{"band":999}', cite(L + 'placevalue10timesandonetenthofadigitsvalue', 'Y3.B1.S8')),
         ('multiplication:mult_zeros{"forms":[0]}', cite(L + 'placevalue10timesandonetenthofadigitsvalue', 'Y4.B5.S3'))],
    related=[('placevalue:expand{"band":9999}', 'writing a number as the sum of its place values: each place is worth ten of the place to its right'),
             ('placevalue:unit_form{"band":9999}', '3 thousands = 30 hundreds: the ten-times link between places in unit form')],
    note='Domain-test build lesson (site: "New CCSS BUILD lesson so the domain test only asks what has been taught"), W05 in the place-value unit. 5.NBT.A.1 is the decimal half of the same idea (Grade 5).')

lesson(L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030',
    partial=[('multiplication:mult_zeros{"forms":[2]}', 'one 1-digit number times a multiple of ten (6 × 40) only: never tens × tens (90 × 50) and never a division (300 ÷ 30)')],
    verdict='partial', missing='a multiple of ten times a multiple of ten (90 × 50) and dividing multiples of ten with a basic fact (300 ÷ 30, 2,400 ÷ 6)',
    build=['facts_times_tens'],
    pre=[('multiplication:mult_zeros{"forms":[0,1]}', cite(L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', 'Y5.B3.S10')),
         ('division:div_facts', cite(L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', 'Y4.B4.S4')),
         ('placevalue:place_value_10x{"op":"x","power":[10,100],"band":10000}', cite(L + 'multiplyanddividemultiplesof10usingbasicfactseg90x5030030', 'Y4.B5.S4'))],
    related=[('placevalue:unit_form{"band":9999}', '45 hundreds = 4,500: the unit-form step inside 90 × 50')],
    note='Domain-test build lesson (W06). The pupil needs the fact and the place-value shift together; mult_zeros already does the shift for one factor.')

lesson(L + 'extendgrowingshapepatterns',
    partial=[('patterns:number_patterns_rule{"pattern":["add"],"places":[1]}', 'the number sequence of a growing pattern (find and continue the +3 rule); no pictured shapes that grow, and no drawing of the next term')],
    verdict='partial', missing='a pictured growing pattern of dots or squares: draw the next term and count it',
    build=['growing_shape_patterns'],
    pre=[('patterns:shape_pattern', cite(L + 'extendgrowingshapepatterns', 'Y2.B3.S12')),
         ('patterns:count_by_step_up{"step":[1]}', cite(L + 'extendgrowingshapepatterns', 'Y2.B1.S16')),
         ('patterns:skip_count_line{"step":[0],"band":50}', cite(L + 'extendgrowingshapepatterns', 'Y1.B9.S1')),
         ('composing:odd_even', cite(L + 'extendgrowingshapepatterns', 'Y2.B5.S12'))],
    related=[('algebra:function_table_easy{"ftTask":"outputs","ftRules":["+"]}', 'term number in, number of squares out: the same growing rule as an In/Out table')],
    note='Domain-test build lesson (W09, OA unit; intervention track W09, standard W10).')

lesson(L + 'findemergentfeaturesegunitsdigitcycle',
    partial=[('patterns:number_patterns_rule{"pattern":["add"],"places":[1,10]}', 'finds and continues the rule; never asks what else the pattern shows (the terms alternate odd and even, the ones digit repeats 5, 0, 5, 0)')],
    verdict='partial', missing='naming a feature of the pattern that the rule does not state (odd / even alternation, a repeating ones digit) and explaining it',
    build=['patterns_notice'],
    pre=[('composing:odd_even', cite(L + 'findemergentfeaturesegunitsdigitcycle', 'Y2.B5.S12')),
         ('number_theory:multiples', cite(L + 'findemergentfeaturesegunitsdigitcycle', 'Y5.B3.S1')),
         ('patterns:skip_count_line{"step":[0]}', cite(L + 'findemergentfeaturesegunitsdigitcycle', 'Y1.B9.S1'))],
    related=[('patterns:pattern_relationship', 'two patterns side by side and what links them: the next idea after one pattern\'s features')],
    note='Awsaj supplement lesson in Y5.B3 (Multiplication and division A), W09.')

lesson(L + 'followagivenruletoextendanumberpattern',
    direct=['patterns:number_patterns_rule{"pattern":["add","sub"],"places":[10,100],"rule":false}'],
    verdict='full',
    pre=[('patterns:skip_count_line{"step":[0]}', cite(L + 'followagivenruletoextendanumberpattern', 'Y1.B9.S1')),
         ('patterns:count_by_step_up{"step":[1]}', cite(L + 'followagivenruletoextendanumberpattern', 'Y2.B1.S16')),
         ('number_theory:multiples', cite(L + 'followagivenruletoextendanumberpattern', 'Y5.B3.S1')),
         ('subtraction:missing_add_sub', cite(L + 'followagivenruletoextendanumberpattern', 'Y5.B2.S8'))],
    related=[('algebra:function_table_easy{"ftTask":"outputs","ftRules":["+","-"]}', 'the same given rule applied to each In number of a table'),
             ('patterns:number_pattern', 'find the rule yourself and fill the gaps: the inverse task')],
    note='Awsaj supplement lesson in Y5.B3, W09. With rule:false the rule is printed above the row ("Rule: count on by 5") and the pupil continues it, which is the lesson.')

lesson(L + 'multiplicativecomparisontimesasmany',
    partial=[('multiplication:mult_comparison', 'times-as-many word problems only; never reads 35 = 5 × 7 as "35 is 5 times as many as 7" or writes the equation for a comparison statement')],
    verdict='partial', missing='interpreting a multiplication equation as a comparison (35 = 5 × 7: 35 is 5 times as many as 7) and writing the equation for a verbal comparison',
    build=['comparison_statements'],
    pre=[('multiplication:arrays_groups', cite(L + 'multiplicativecomparisontimesasmany', 'Y3.B3.S2')),
         ('division:div_facts', cite(L + 'multiplicativecomparisontimesasmany', 'Y4.B4.S4')),
         ('multiplication:multiply', cite(L + 'multiplicativecomparisontimesasmany', 'Y4.B5.S9'))],
    related=[('number_ops_mixed:word_problems_mixed', 'times-as-many stories among other multiplication and division stories (Y5.B5.S11)')],
    note='Awsaj supplement lesson in Y5.B3, W10 (power standard 4.OA.A.1).')

lesson(L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier',
    partial=[('multiplication:mult_comparison', 'mixes the three unknowns at random: about half the items ask "how many times as many?" (4 of 8 generated); no option keeps a page on the unknown multiplier')],
    verdict='partial', missing='a page of "how many times as many?" stories only (the unknown multiplier)',
    build=['comparison_unknown'],
    pre=[('division:div_facts', cite(L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier', 'Y4.B4.S4')),
         ('division:div_word_problems', cite(L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier', 'Y3.B3.S5')),
         ('multiplication:arrays_groups', cite(L + 'multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier', 'Y3.B3.S2'))],
    related=[('multiplication:mult_comparison_plain', 'the same comparison stories with no pictures, for pupils past the bar model')],
    note='Domain-test build lesson (W10, OA unit).')

lesson(L + 'multistepwordproblemsdivideandinterprettheremainder',
    partial=[('division:remainder_interpret', 'one-step stories only (how many full, how many left, how many needed); and it deals divisors past 9 (each car holds 19), which Grade 4 does not divide by'),
             ('algebra:multi_step_word', 'two-step stories with no division remainder to interpret')],
    verdict='partial', missing='a two-step story whose division leaves a remainder the pupil must interpret (round up, drop it or report it), with a 1-digit divisor',
    build=['multi_step_four_ops'],
    pre=[('division:div_remainders', cite(L + 'multistepwordproblemsdivideandinterprettheremainder', 'Y4.B5.S12')),
         ('division:div_word_problems', cite(L + 'multistepwordproblemsdivideandinterprettheremainder', 'Y3.B3.S5')),
         ('number_ops_mixed:word_problems_mixed', cite(L + 'multistepwordproblemsdivideandinterprettheremainder', 'Y5.B5.S11'))],
    related=[('division:remainder_too_big', 'checking that a remainder is smaller than the divisor before interpreting it')],
    note='Domain-test build lesson (W11, OA unit). 5.NBT.B.6 on the site is the Grade 5 extension.')

lesson(L + 'decomposeafractionintoasumoffractionsequationsanddrawings',
    direct=['fraction_operations:decompose_fractions'],
    verdict='full',
    pre=[('fraction_operations:add_fractions_like', cite(L + 'decomposeafractionintoasumoffractionsequationsanddrawings', 'Y4.B7.S11')),
         ('composing:fraction_number_line', cite(L + 'decomposeafractionintoasumoffractionsequationsanddrawings', 'Y4.B7.S4')),
         ('fractions:equivalent', cite(L + 'decomposeafractionintoasumoffractionsequationsanddrawings', 'Y4.B7.S10'))],
    related=[('fraction_operations:decompose_frac_nv{"forms":[0,1]}', 'the same decompositions as equations only, no drawings'),
             ('fractions:compose_target_frac', 'the inverse: build the fraction from unit-fraction tiles')],
    note='Domain-test build lesson (W13, NF unit). decompose_fractions deals the sum of unit fractions with fraction-bar drawings on most items and a "click all ways" item (2/3 = 1/3 + 1/3, 2/8 = 1/8 + 1/8 …), which is 4.NF.B.3b for fractions; mixed numbers are Y5.B4.')

lesson(L + 'addtenthsandhundredthsrenametenthsashundredths',
    partial=[('fraction_operations:frac_10_100', 'renames tenths as hundredths (4/10 = 40/100) but never adds a tenths and a hundredths fraction')],
    verdict='partial', missing='adding a tenths and a hundredths fraction by renaming the tenths (3/10 + 4/100 = 34/100)',
    build=['add_tenths_hundredths'],
    pre=[('fraction_operations:add_fractions_like', cite(L + 'addtenthsandhundredthsrenametenthsashundredths', 'Y5.B4.S9')),
         ('decimals:decimal_nl_drag', cite(L + 'addtenthsandhundredthsrenametenthsashundredths', 'Y4.B8.S4')),
         ('fractions:equivalent', cite(L + 'addtenthsandhundredthsrenametenthsashundredths', 'Y5.B4.S2'))],
    related=[('fraction_operations:frac_10_100_nv', 'renaming tenths as hundredths with no hundred square'),
             ('decimals:add_decimal{"decimals":2}', '0.3 + 0.04 = 0.34: the same sum in decimals')],
    note='Domain-test build lesson (W18, NF unit).')

lesson(L + 'pointslineslinesegmentsandrays',
    verdict='gap', missing='naming and drawing points, lines, line segments and rays (no skill deals them)',
    build=['points_lines_rays'],
    pre=[('angles_lines:identify_lines', cite(L + 'pointslineslinesegmentsandrays', 'Y3.B11.S6')),
         ('shapes_early:name_2d_shapes', cite(L + 'pointslineslinesegmentsandrays', 'Y3.B11.S7')),
         ('shapes_early:count_sides_vertices_2d', cite(L + 'pointslineslinesegmentsandrays', 'Y3.B11.S7'))],
    related=[('angles_lines:identify_angles', 'two rays from one point make an angle: the next idea (Y5.B10.S2)')],
    note='Domain-test build lesson (W21, G unit).')

lesson(L + 'anglesareadditivefindanunknownangleinadecomposedangle',
    direct=['angles_lines:additive_angles'],
    verdict='full',
    pre=[('angles_lines:measure_angles', cite(L + 'anglesareadditivefindanunknownangleinadecomposedangle', 'Y5.B10.S4')),
         ('angles_lines:identify_angles', cite(L + 'anglesareadditivefindanunknownangleinadecomposedangle', 'Y5.B10.S2')),
         ('subtraction:missing_add_sub', cite(L + 'anglesareadditivefindanunknownangleinadecomposedangle', 'Y5.B2.S8'))],
    related=[('angles_lines:mixed_angles_lines', 'measuring, naming and adding angles mixed on one page')],
    note='Domain-test build lesson (W28). additive_angles deals a drawn angle split in two with one part and the whole given (90°, 180° or 360°), the missing part to find, which is the lesson; Y5.B10.S6 / S7 hold the around-a-point and straight-line steps.')

lesson(L + 'lineplotswithfractions',
    partial=[('graphs:line_plot_fractions', 'reads a drawn line plot (how many at a mark, most common, how many in all); never makes the plot from a data list and never adds or subtracts the plotted fractions')],
    verdict='partial', missing='making a line plot of measurements in halves, quarters and eighths from a data list, and solving addition and subtraction problems with the plotted fractions',
    build=['make_line_plot'],
    pre=[('graphs:bar_graph', cite(L + 'lineplotswithfractions', 'Y4.B13.S1')),
         ('composing:fraction_number_line', cite(L + 'lineplotswithfractions', 'Y4.B7.S4')),
         ('fraction_operations:add_fractions_like', cite(L + 'lineplotswithfractions', 'Y5.B4.S9'))],
    related=[('graphs:tally_chart', 'recording a data list before plotting it')],
    note='Awsaj supplement lesson in Y5.B9 (Statistics), W28.')

lesson(L + 'customarycapacitycupspintsquartsandgallons',
    partial=[('measurement:capacity{"units":[0],"forms":[0]}', 'converts between cups, pints, quarts and gallons one item at a time; never records the equivalents in a two-column table')],
    verdict='partial', missing='recording customary capacity equivalents in a two-column conversion table (1 gal = 4 qt, 2 gal = 8 qt …)',
    build=['conversion_table'],
    pre=[('measurement:mass_volume_liquid', cite(L + 'customarycapacitycupspintsquartsandgallons', 'Y3.B7.S8')),
         ('division:div_facts', cite(L + 'customarycapacitycupspintsquartsandgallons', 'Y3.B3.S10')),
         ('measurement:capacity{"units":[1],"forms":[0]}', cite(L + 'customarycapacitycupspintsquartsandgallons', 'Y3.B7.S9'))],

    note='Awsaj supplement lesson in Y5.B14 (Converting units), W30; the school\'s first customary lesson. No related skill fits yet: the other customary skills (unit_conversions, unit_conversion_word, length_customary) deal lengths and weights past this lesson\'s numbers (120 in, 160 oz); the weight and length lesson a week later links them.')

lesson(L + 'customarylengthandweightinchesfeetyardsouncesandpounds',
    partial=[('measurement:length_customary{"forms":[0,1,2]}', 'feet, inches and yards only: no ounces and pounds, no two-column table'),
             ('measurement:unit_conversions{"units":[1],"forms":[0]}', 'converts pounds and ounces, but mixes in capacity (quarts, cups, fluid ounces) on the same page; no table')],
    verdict='partial', missing='a page of pounds and ounces on their own, and recording length and weight equivalents in a two-column table',
    build=['weight_customary', 'conversion_table'],
    pre=[('measurement:length_metric{"forms":[1]}', cite(L + 'customarylengthandweightinchesfeetyardsouncesandpounds', 'Y4.B6.S1')),
         ('measurement:reading_ruler', cite(L + 'customarylengthandweightinchesfeetyardsouncesandpounds', 'Y3.B11.S4')),
         ('measurement:unit_conversions{"units":[0],"forms":[0]}', cite(L + 'customarylengthandweightinchesfeetyardsouncesandpounds', 'Y3.B7.S4'))],
    related=[('measurement:capacity{"units":[0],"forms":[0]}', 'cups, pints, quarts and gallons: the customary capacity lesson taught beside it (W30-W31)')],
    note='Awsaj supplement lesson in Y5.B14, W31.')

lesson(L + 'measurementwordproblemsdistancetimemassmoneyandcapacity',
    partial=[('measurement:unit_conversion_word', 'one-step conversion stories only (4 yd = ? ft): no adding, subtracting, multiplying or dividing measures, no money, no fractions or decimals of a unit'),
             ('measurement:money', 'money calculations only, none of the other measures')],
    verdict='partial', missing='one- and two-step stories that add, subtract, multiply or divide distances, times, masses, capacities and money, with fractions or decimals of a unit and a number-line diagram',
    build=['measure_word_four_ops'],
    pre=[('measurement:elapsed_find_duration', cite(L + 'measurementwordproblemsdistancetimemassmoneyandcapacity', 'Y3.B10.S12')),
         ('measurement:length_metric{"forms":[1]}', cite(L + 'measurementwordproblemsdistancetimemassmoneyandcapacity', 'Y4.B6.S2')),
         ('algebra:multi_step_word', cite(L + 'measurementwordproblemsdistancetimemassmoneyandcapacity', 'Y5.B2.S6'))],
    related=[('measurement:capacity{"units":[0],"forms":[0]}', 'the capacity conversions a story may need first')],
    note='Awsaj supplement lesson in Y5.B14, W31 (standard track; priority and intervention W32).')

# Support (enrich-native) lessons: an earlier year's WRM step listed as support in Grade 4 under a title that matches no
# WRM step exactly; the nearest WRM step is named in the note (owner question 2 in the report)
lesson(L + '3dshapescubecuboidsphereconecylinder',
    direct=['shapes_early:name_3d_shapes'],
    verdict='full',
    pre=[('shapes_early:name_2d_shapes', cite(L + '3dshapescubecuboidsphereconecylinder', 'R.B4.S1')),
],
    related=[('shapes_early:count_edges_faces_vertices', 'describing the same solids by faces, edges and vertices (Y5.B10.S10)')],
    note='Support lesson (site flag enrich-native, Reception "Building 9 and 10"); nearest WRM step R.B12.S1 Recognise and name 3-D shapes. name_3d_shapes deals exactly the five solids named (cube, rectangular prism = cuboid, sphere, cone, cylinder). Pre-skills are few: it is a Reception lesson, so only 2-D shape naming and matching come before it.')

lesson(L + 'comparefractions',
    partial=[('fractions:compare{"denoms":[2,3],"forms":[0,1]}', 'mixes unlike pairs (1/4 vs 7/10, 3/5 vs 1/2) with same-denominator and same-numerator pairs; no option keeps the Grade 3 pairs only')],
    verdict='partial', missing='comparing two fractions with the same denominator or the same numerator only, with bars, and saying why',
    build=['frac_compare_same_part'],
    pre=[('composing:fraction_number_line', cite(L + 'comparefractions', 'Y3.B6.S7')),
         ('fractions:order_fractions', cite(L + 'comparefractions', 'Y3.B6.S2')),
         ('fractions:equivalent', cite(L + 'comparefractions', 'Y4.B7.S10'))],
    related=[('fractions:compare_frac_lcd', 'comparing unlike fractions by a common denominator: the Grade 4 step after it (Y5.B4.S6)')],
    note='Support lesson (site flag enrich-native, Year 3 "Fractions B"); nearest WRM steps Y3.B6.S2 / S5 Compare and order unit / non-unit fractions.')

lesson(L + 'dividea1digitnumberby100',
    partial=[('placevalue:place_value_10x{"op":"/","power":[100],"decimals":true}', 'divides 3- and 4-digit numbers by 100; the lesson needs a 1-digit number ÷ 100 (7 ÷ 100 = 0.07)')],
    verdict='partial', missing='only 1-digit numbers divided by 100 (7 ÷ 100 = 0.07)',
    build=['div10_small_numbers'],
    pre=[('division:div_facts', cite(L + 'dividea1digitnumberby100', 'Y2.B5.S14')),
         ('decimals:decimal_nl_drag', cite(L + 'dividea1digitnumberby100', 'Y4.B8.S4')),
         ('conversions:d_to_f', cite(L + 'dividea1digitnumberby100', 'Y4.B8.S8'))],
    related=[('fraction_operations:frac_10_100', '7/100 = 0.07: the fraction the quotient names')],
    note='Support lesson (site flag enrich-native, Year 4 "Decimals A"); nearest WRM step Y4.B8.S10 Divide a 1- or 2-digit number by 100. Reuses the Y4 lane\'s div10_small_numbers.')

lesson(L + 'hundredths',
    partial=[('fraction_operations:frac_10_100', 'hundredths as fractions renamed from tenths; never builds a hundredth on a place-value chart or with base-10 (flat = 1)'),
             ('conversions:d_to_f', 'writes hundredths decimals as fractions; no place-value chart or base-10 model')],
    verdict='partial', missing='hundredths as one whole cut into 100, shown with counters on a place-value chart and with base-10 (flat = 1)',
    build=['decimal_pv'],
    pre=[('decimals:decimal_nl_drag', cite(L + 'hundredths', 'Y4.B8.S4')),
         ('fractions:equivalent', cite(L + 'hundredths', 'Y4.B7.S10')),
         ('composing:fraction_number_line', cite(L + 'hundredths', 'Y3.B6.S7'))],
    related=[('decimals:compare_decimal', 'comparing hundredths once they are on the chart')],
    note='Support lesson (site flag enrich-native, Year 4 "Decimals A"); nearest WRM steps Y4.B8.S7-S9 Hundredths as fractions / as decimals / on a place value chart.')

# "Measure in centimetres" (Support, site source K) is no longer a site lesson: its title is exactly Y2.B6.S1, so the extractor
# now records it on that step (site.supportIn G4) with a disagreement for the source grade (critic r5 X1.3)

lesson(L + 'orderfractions',
    partial=[('fractions:order_fractions', 'orders sets of unlike fractions (3/4, 7/10, 2/3, 1/2, 3/8, 1/6); the Grade 3 lesson orders unit fractions or fractions with one denominator')],
    verdict='partial', missing='ordering fractions with the same denominator or unit fractions only',
    build=['frac_compare_same_part'],
    pre=[('fractions:compare', cite(L + 'orderfractions', 'Y3.B6.S2')),
         ('composing:fraction_number_line', cite(L + 'orderfractions', 'Y3.B6.S7')),
         ('fractions:equivalent', cite(L + 'orderfractions', 'Y4.B7.S10'))],
    related=[('fractions:order_frac_numline', 'ordering the same fractions by placing them on a number line')],
    note='Support lesson (site flag enrich-native, "Prerequisite ladder" from Year 3); nearest WRM steps Y3.B6.S2 / S5. The proposal frac_compare_same_part puts the same pairs option on order_fractions.')
