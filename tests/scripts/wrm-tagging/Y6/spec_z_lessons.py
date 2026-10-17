# Y6 (school Grade 5) SITE LESSONS: every entry of data/curriculum/site-lessons.json with wrmYear "Y6" (24): the lessons the school
# site schedules or lists that are NOT White Rose small steps (owner rule 2026-10-16, "every site lesson tagged"): 16 committee
# lessons (Awsaj supplements and domain-test builds, all SUP in the pacing), 4 unflagged Grade 5 end-of-year entries (Projects &
# Taskmaster, W38) and 4 Support titles (enrich-native, judged at their SOURCE grade).
# Contract: the Y5 lane's (Y5-report.md "Site lessons"); lessons.py writes, checks and gates it, lessonfit.mjs judges every link
# from generated items. Every direct / partial verdict below was judged from 40 generated items with the opts listed (fresh seeds,
# lessonfit.mjs and the report's audit table). Lessons tag NOTHING into SKILL_WRM.
# Shape: lesson(id, direct=[(key, opts)], partial=[(key, opts, missing)], verdict, missing, build=[ids], closes={id: clause},
#   pre=[(key, opts, cited step or lesson, reason)], preBuild, related=[(key, opts, why)], note)

G5 = 'G5|-|'

# ── proposals reused verbatim from a passed lane's links file (same id = same spec) ──
LANE.update({
    'make_line_plot': 'Y5',          # Y5 wrote its representation in our boxed-cell terms
    'frac_compare_same_part': 'Y5',  # the Y5 "Order fractions" Support lesson (the same Grade 3 lesson)
    'map_frac_side_area': 'MAP',     # 5.NF.B.4b tiling with unit-fraction squares
})

# ── new proposals (only what no existing proposal does) ──
LNEW['div_by_decimal_model'] = {
    'kind': 'option', 'skill': 'decimals:div_decimal',
    'option': 'support "how many groups" model and the ×10 rename: 4 ÷ 0.2 as "how many 0.2s make 4?" on a tenths strip, then 40 ÷ 2; divisors in tenths and hundredths (1.2 ÷ 0.04)',
    'name': 'Divide by a Decimal: Model and Rename (option)',
    'teaches': 'dividing a whole number or a decimal by a tenths or hundredths decimal by counting how many of the divisor fit (a tenths strip or hundred square) and by multiplying both numbers by 10 or 100 (4 ÷ 0.2 = 40 ÷ 2 = 20)',
    'representation': 'the existing decimal-div cell with a tenths strip or hundred square above the equation, the divisor marked off in groups, and a "× 10: __ ÷ __" rename line as a hint that fades',
    'family': 'decimals', 'ccss': ['5.NBT.B.7'],
    'why': 'div_decimal {forms:[1,2]} divides by tenths only (4 ÷ 0.5, 5.6 ÷ 0.7) in numbers alone: no model, no place-value rename, never a hundredths divisor'}
LNEW['oop_braces'] = {
    'kind': 'option', 'skill': 'order_of_operations:nested_complex',
    'option': 'grouping "braces": { } as the outer grouping around brackets and parentheses ({[2 + (6 × 3)] − 4} ÷ 8)',
    'name': 'Braces { } (option)',
    'teaches': 'evaluating expressions with three levels of grouping, parentheses inside brackets inside braces, working from the innermost out ({20 − [3 × (2 + 4)]} × 5 = 10)',
    'representation': 'the existing order-of-operations cell; each level of grouping underlined as it is worked, one answer box',
    'family': 'order_of_operations', 'ccss': ['5.OA.A.1'],
    'why': 'nested_complex and oop_hard deal parentheses and square brackets; no skill writes braces { }'}
LNEW['scaling_equiv'] = {
    'kind': 'option', 'skill': 'fraction_operations:mult_scaling_nv', 'also': ['fraction_operations:mult_scaling'],
    'option': 'forms "scale a fraction" (3/4 × 2/5 vs 2/5) and "times n/n = 1" (2/3 × 4/4 = 8/12: the same size)',
    'name': 'Scaling a Fraction, and Multiplying by n/n (option)',
    'teaches': 'comparing a product with a fraction factor without calculating (3/4 × 2/5 is less than 2/5), and seeing that multiplying by n/n = 1 keeps the size, so 2/3 = (4 × 2)/(4 × 3) = 8/12',
    'representation': 'the existing scaling cell: the given number as a bar, the product bar under it, the < > = answer box; for n/n the two equal bars cut into 3 and 12 parts',
    'family': 'fraction_operations', 'ccss': ['5.NF.B.5a', '5.NF.B.5b'],
    'why': 'mult_scaling_nv always scales a whole number (4/3 × 12 vs 12) and never shows multiplying by n/n as the equivalence a/b = (n × a)/(n × b)'}
LNEW['whole_div_unit_frac'] = {
    'kind': 'option', 'skill': 'fraction_operations:div_unit_fraction', 'also': ['fraction_operations:div_unit_frac_nv'],
    'option': 'direction "whole number ÷ unit fraction only" with a bar on every item, and a story form ("How many 1/3-cup servings are in 2 cups?"), checked by multiplying (6 × 1/3 = 2)',
    'name': 'Whole Number ÷ Unit Fraction: Model and Story (option)',
    'teaches': 'dividing a whole number by a unit fraction (4 ÷ 1/5 = 20) by cutting each whole of a bar into fifths and counting them, in stories that ask how many servings or pieces, and checking with 20 × 1/5 = 4',
    'representation': 'the existing frac-model cell: the whole-number bars cut into the unit fraction, the parts counted, the equation and a "check: __ × 1/__ = __" line; a story above for the story form',
    'family': 'fraction_operations', 'ccss': ['5.NF.B.7b', '5.NF.B.7c'],
    'why': 'div_unit_fraction draws the bar but mixes in unit fraction ÷ whole (1/2 ÷ 4); div_unit_frac_nv {forms:[0,1]} keeps the direction but has no model and no story'}
LNEW['length_customary_both'] = {
    'kind': 'option', 'skill': 'measurement:length_customary',
    'option': 'forms "smaller unit to larger" (84 in = __ ft), "mixed units" (5 ft 3 in = __ in), "fraction of a unit" (1 1/2 ft = __ in) and "two-step problem"',
    'name': 'Customary Length: Both Directions, Mixed Units and Problems (option)',
    'teaches': 'converting inches, feet, yards and miles in both directions, with mixed units and fractional amounts (30 in = 2 1/2 ft), and using the conversion in a two-step problem (a 5 ft 6 in board cut into 3 equal pieces)',
    'representation': 'the existing conversion cell with the fact "1 ft = 12 in" as a hint that fades, an answer box with the unit printed; a two-column ft | in table option',
    'family': 'measurement', 'ccss': ['5.MD.A.1'],
    'why': 'length_customary converts a larger unit to a smaller one in whole numbers only (4 yd = 144 in); unit_conversions {units:[1]} mixes length with pounds, quarts and cups'}
LNEW['shape_hierarchy'] = {
    'kind': 'option', 'skill': 'shapes_classify:classify_quads', 'also': ['shapes_classify:classify_triangles'],
    'option': 'form "hierarchy": complete a hierarchy diagram (quadrilateral → trapezoid, parallelogram → rectangle, rhombus → square; triangle by sides and by angles) and tick "always / sometimes / never" statements (a square is a rectangle; every rectangle has 4 right angles, so every square does)',
    'name': 'Shape Hierarchy (option)',
    'teaches': 'placing quadrilaterals and triangles in a hierarchy by their properties, and reasoning that a property of a category belongs to every subcategory (all rectangles have four right angles and squares are rectangles, so squares have four right angles)',
    'representation': 'one boxed cell: a tree diagram with empty boxes and a name bank to write from; or a statement with Always / Sometimes / Never check boxes beside a drawn shape',
    'family': 'shapes_classify', 'ccss': ['5.G.B.3', '5.G.B.4'],
    'why': 'classify_quads ticks every name that fits one drawn shape, but never asks for the hierarchy itself or the inherited property; classify_triangles names sides or angles, never both'}
LNEW['g5_arith_review'] = {
    'kind': 'option', 'skill': 'number_ops_mixed:mixed',
    'option': 'pool "Grade 5 review": 4-digit × 2-digit, long division by a 2-digit number, decimal + − × ÷ to hundredths and fraction + − × ÷ on one page, each item in its own skill\'s cell',
    'name': 'Grade 5 Arithmetic Review (option)',
    'teaches': 'a consolidation page of the year\'s written calculation: multiplying 4-digit by 2-digit numbers, long division, and the four operations with decimals and with fractions, mixed so the pupil reads the sign and chooses the method',
    'representation': 'mixed boxed cells, each in its own skill\'s look (stack, long division, fraction cell); one item per cell, an operation sign printed large',
    'family': 'number_ops_mixed', 'ccss': ['5.NBT.B.5', '5.NBT.B.6', '5.NBT.B.7', '5.NF.A.1', '5.NF.B.4', '5.NF.B.7'],
    'why': 'number_ops_mixed:mixed deals whole numbers and decimals with + and − only for the decimals; no live pool mixes the Grade 5 fraction operations with long division'}
LNEW['cross_strand_problems'] = {
    'kind': 'option', 'skill': 'algebra:multi_step_word',
    'option': 'strand "across strands": two- and three-step stories that join a measure (a length or a mass with a unit change), a fraction or decimal amount, a shape\'s area or volume, or a data value in one problem',
    'name': 'Problems Across Strands (option)',
    'teaches': 'solving two- and three-step problems that cross strands: a garden 4 1/2 m long with a 2.5 m path, a tank\'s volume filled at 3 L a minute, the mean of a table used in a cost',
    'representation': 'one boxed story cell: the story, a small diagram (a shape, a scale or a table) when the story needs one, a work box and an answer box with the unit printed',
    'family': 'algebra', 'ccss': ['5.MD.A.1', '5.MD.C.5b', '5.NF.B.6', '5.NBT.B.7'],
    'why': 'multi_step_word deals four-operation stories with whole numbers only; no skill puts a measure, a fraction, a shape and a data value in the same problem'}
LNEW['investigation_project'] = {
    'kind': 'new', 'skill': 'all_mixed:investigation_projects',
    'name': 'Investigation Projects',
    'teaches': 'a short open investigation over several boxed tasks that build on each other (plan a class trip: a budget in decimals, travel times, distances in miles and a table of results), ending with a sentence that explains the answer',
    'representation': 'a project page: a context box, then 3 to 5 numbered boxed tasks, each with its own answer box, and a sentence frame with a word bank at the end',
    'family': 'all_mixed', 'ccss': ['5.NBT.B.7', '5.MD.A.1', '5.OA.A.2'],
    'why': 'every live skill deals one item at a time; no skill links several tasks of one investigation'}

# ───────────────────────── committee lessons (Awsaj supplements and domain-test builds) ─────────────────────────
lesson(G5 + 'comparedigitvaluesadigitisworth10timestheplacetoitsrightand110oftheplacetoitsleft',
    partial=[('placevalue:value', {'band': 999999}, 'the value of one underlined digit (the 8 in 857,542 is worth 800,000); never compares the same digit in two places')],
    verdict='partial',
    missing='comparing the value of the same digit in neighbouring places: 10 times the place to its right and 1/10 of the place to its left (the 3 in 300 is 10 times the 3 in 30; the 3 in 0.3 is 1/10 of the 3 in 3)',
    build=['value_ten_times'],
    pre=[('placevalue:pv_digit_drag', {'band': 999999}, 'Y6.B1.S1', 'each digit of a 6-digit number in its place on the chart'),
         ('placevalue:expand', {'band': 999999}, 'Y6.B1.S1', 'the value of every digit of a 6-digit number, as a sum'),
         ('decimals:compare_thousandths', {}, 'Y6.B8.S1', 'tenths, hundredths and thousandths: the places to the right of the ones')],
    related=[('placevalue:unit_form', {'band': 9999, 'rename': 'more'}, 'renaming in unit form (4 thousands 16 hundreds = 5,600; 7,268 = 726 tens 8 ones): ten of one place make one of the next'),
             ('placevalue:place_value_10x', {'op': 'both', 'power': [10], 'decimals': True}, '× 10 and ÷ 10 moving every digit one place (69.7 × 10 = 697; 252 ÷ 10 = 25.2): the same digit worth 10 times as much, or a tenth as much')],
    note='Domain-test build lesson (site: "New CCSS BUILD lesson so the domain test only asks what has been taught"), W06, 5.NBT.A.1. The Y5 lane tags the Grade 4 twin (G4 "Place value: 10 times and one tenth") with the same build value_ten_times.')

lesson(G5 + 'readandwritedecimalstothousandthsinwordformandexpandedform',
    verdict='gap',
    missing='reading and writing decimals to thousandths in words (three and four hundred seven thousandths) and in expanded form (3.407 = 3 × 1 + 4 × 1/10 + 7 × 1/1000)',
    build=['thousandths_pv'],
    pre=[('placevalue:number_word_names', {'band': 999999}, 'Y6.B1.S3', 'whole numbers to 999,999 matched to their word names'),
         ('placevalue:expand', {'band': 999999}, 'Y6.B1.S1', 'whole numbers written in expanded form'),
         ('decimals:compare_thousandths', {}, 'Y6.B8.S1', 'reading decimals to thousandths to compare them (0.450 = 0.45)'),
         ('conversions:d_to_f', {'forms': [0]}, 'Y5.B7.S2', 'a decimal written as a fraction (0.6 = 3/5)')],
    related=[('decimals:round_thousandths', {}, 'reading a thousandths decimal to round it to tenths or hundredths (0.725 → 0.7)')],
    note='Domain-test build lesson, W06, 5.NBT.A.3a. No live skill writes a decimal in words or in expanded form (number_word_names and expand stop at whole numbers). The build is thousandths_pv, already a Y6 step proposal (Y6.B8.S1-S2); its WRM_EXTENSIONS entry in build-list.js adds exactly this lesson\'s clause, "number names and expanded form to thousandths (5.NBT.A.3a)".')

lesson(G5 + 'multiplyanddividedecimalsbypowersof10writtenwithexponents101102103andexplainthepattern',
    partial=[('placevalue:place_value_10x', {'decimals': True}, 'multiplies and divides whole numbers and decimals by 10, 100 and 1,000 written in full (20.4 × 1,000 = 20,400; 301 ÷ 1,000 = 0.301); never a power written with an exponent (10², 10³) and never the pattern of zeros or of the point explained')],
    verdict='partial',
    missing='the powers of 10 written with whole-number exponents (10¹, 10², 10³) and explaining the pattern: the number of zeros, and the point moving one place for each power',
    build=['pv10_exponents'],
    pre=[('multiplication:mult_zeros', {'forms': [0, 1]}, 'Y5.B3.S10', 'a 1-digit number times 10 or 100 (6 × 100 = 600)'),
         ('decimals:compare_thousandths', {}, 'Y6.B8.S1', 'decimals to thousandths: where the point and the places sit'),
         ('patterns:count_by_powers_of_10', {'step': [1]}, 'Y4.B1.S4', 'counting up and down in 100s: ten 100s make the next power of ten')],
    related=[('decimals:mult_decimal', {}, 'a decimal times a whole number (37.4 × 3), the same week: the point stays in its place')],
    note='Domain-test build lesson, W07-W08, 5.NBT.A.2. Y6.B1.S4 (Powers of 10, W01) has the same build.')

lesson(G5 + 'dividebyadecimal',
    partial=[('decimals:div_decimal', {'forms': [1, 2]}, 'a whole number or a tenths decimal divided by a tenths divisor (4 ÷ 0.5 = 8; 5.6 ÷ 0.7 = 8) in numbers only; never a hundredths divisor, never a model or the ×10 rename (4 ÷ 0.2 = 40 ÷ 2)')],
    verdict='partial',
    missing='dividing by a decimal with a model or a place-value strategy (how many 0.2s make 4; 4 ÷ 0.2 = 40 ÷ 2) and dividing by a hundredths divisor (1.2 ÷ 0.04)',
    build=['div_by_decimal_model'],
    pre=[('placevalue:place_value_10x', {'op': 'x', 'decimals': True}, 'Y6.B8.S5', 'a decimal times 10, 100 or 1,000 (0.2 × 10 = 2): the step that turns the divisor into a whole number'),
         ('decimals:mult_decimal', {}, 'Y6.B8.S7', 'a decimal times a whole number (0.4 × 3 = 1.2): the check of a division'),
         ('division:box_division_hard', {}, 'Y6.B2.S9', 'short division by a 1-digit number')],
    related=[('number_sense:estimate_quotient', {'place': 10}, 'estimating a quotient before working it out (430 ÷ 6 is about 70)')],
    note='Domain-test build lesson, W08-W09, 5.NBT.B.7. div_decimal {forms:[0]} (a decimal ÷ a whole number) is Y6.B8.S8, the same week.')

lesson(G5 + 'multiplydecimalsbydecimals',
    partial=[('decimals:mult_decimal', {}, 'a decimal with 1 or 2 places times a 1-digit whole number (37.4 × 3 = 112.2); never a decimal times a decimal')],
    verdict='partial',
    missing='a decimal times a decimal (0.3 × 0.4 = 0.12; 1.2 × 0.5 = 0.6), with an area model on a hundred square related to the written method',
    build=['mult_dec_dec', 'decimal_models'],
    closes={'mult_dec_dec': 'a decimal times a decimal (0.3 × 0.4 = 0.12; 1.2 × 0.5 = 0.6)',
            'decimal_models': 'the area model on a hundred square beside the written method, for a decimal times a decimal'},
    pre=[('placevalue:place_value_10x', {'op': '/', 'decimals': True}, 'Y6.B8.S6', 'a number divided by 10, 100 or 1,000 (12 ÷ 100 = 0.12): where the point goes in the product'),
         ('multiplication:area_model_mult_hard', {}, 'Y6.B2.S7', 'the area model for a 2-digit times a 2-digit number'),
         ('decimals:add_decimal', {}, 'Y6.B8.S4', 'adding decimals to hundredths: the partial products of a decimal product are added')],
    related=[('decimals:div_decimal', {'forms': [2]}, 'a decimal divided by a decimal (1.2 ÷ 0.6 = 2), the inverse, taught the same week')],
    note='Domain-test build lesson, W08-W09, 5.NBT.B.7. mult_dec_dec (STANDARD_PROPOSALS) is the decimal × decimal form; decimal_models (STANDARD_PROPOSALS) is the drawn model 5.NBT.B.7 asks for.')

lesson(G5 + 'evaluateexpressionswithparenthesesbracketsandbraces',
    partial=[('order_of_operations:nested_complex', {'band': 50}, 'parentheses inside square brackets (5 × [2 + (6 × 3)] ÷ 5 = 20); never braces { }'),
             ('order_of_operations:oop_hard', {'forms': [0], 'band': 50}, 'one pair of parentheses inside square brackets (4 × [7 − (16 ÷ 4)] = 12); never braces { }')],
    verdict='partial',
    missing='braces { } as a third level of grouping ({20 − [3 × (2 + 4)]} × 5)',
    build=['oop_braces'],
    pre=[('order_of_operations:paren_simple', {'band': 50}, 'Y6.B2.S15', 'one pair of parentheses worked first (a × (b − c))'),
         ('order_of_operations:two_ops_no_paren', {'band': 50}, 'Y6.B2.S15', 'multiply or divide before adding or subtracting, with no brackets'),
         ('order_of_operations:oop_medium', {'forms': [3]}, 'Y6.B2.S15', 'brackets inside brackets (5 × (5 + (6 − 4)))')],
    related=[('order_of_operations:compare_expressions', {'forms': [0], 'band': 20}, 'comparing two expressions by working out each side in the right order')],
    note='Domain-test build lesson, W11, 5.OA.A.1. The CCSS asks for parentheses, brackets "or" braces; the site title asks for all three, so braces are the missing clause. Order of operations itself is Y6.B2.S15, the same week.')

lesson(G5 + 'writeandinterpretnumericalexpressionswordstoexpressionsexpressionstowords',
    partial=[('algebra:write_expression', {'forms': [0]}, 'writes a one-operation expression with a letter from words (a number plus 30 = n + 30); never a numerical expression with brackets from words and never an expression read back into words')],
    verdict='partial',
    missing='writing numerical expressions with brackets from words ("add 8 and 7, then multiply by 2" = 2 × (8 + 7)), reading an expression back into words, and interpreting without calculating (3 × (18,932 + 921) is three times as large as 18,932 + 921)',
    build=['write_numeric_expression'],
    pre=[('order_of_operations:paren_simple', {'band': 50}, 'Y6.B2.S15', 'parentheses in a numerical expression, worked first'),
         ('multiplication:mult_comparison', {}, 'Y6.B2.S8', 'times-as-many stories (3 times as many): what "three times as large" means'),
         ('algebra:function_table_easy', {'ftRules': ['+', '-', 'x', '/'], 'ftTask': 'rule'}, 'Y6.B7.S1', 'a one-step rule written as an operation')],
    related=[('order_of_operations:compare_expressions', {'forms': [0], 'band': 20}, 'two expressions compared: the next step after writing one is judging its size')],
    note='Domain-test build lesson, W11, 5.OA.A.2. Y6.B7.S3 (Form expressions, W11) writes letter expressions; this lesson writes number expressions.')

lesson(G5 + 'formorderedpairsfromcorrespondingterms',
    partial=[('patterns:pattern_relationship', {'forms': [0]}, 'names the rule from pattern A to pattern B (Add 5, Multiply by 2) for four corresponding terms; never writes the terms as ordered pairs and never graphs them')],
    verdict='partial',
    missing='writing corresponding terms of two patterns as ordered pairs ((0, 0), (1, 3), (2, 6)) and graphing the pairs on a coordinate grid',
    build=['pattern_pairs_graph'],
    pre=[('coordinates:coordinate_q1', {'forms': [1]}, 'Y6.B13.S1', 'plotting points in the first quadrant'),
         ('algebra:function_table_easy', {'ftRules': ['+', 'x'], 'ftTask': 'outputs'}, 'Y6.B7.S1', 'an input and its output made by one rule: a pair of corresponding terms'),
         ('patterns:number_patterns_rule', {'pattern': ['add'], 'places': [1], 'rule': False}, 'G4|-|followagivenruletoextendanumberpattern', 'continuing a number pattern from its printed rule')],
    related=[('patterns:count_by_step_up', {'step': [1], 'range': 100}, 'counting on in 3s and 4s: one pattern from its rule, before two are paired')],
    note='Awsaj supplement lesson, W13, 5.OA.B.3 (block Y6.B7). It is taught the same week as Y6.B13.S1 (The first quadrant).')

lesson(G5 + 'generatetwosequencesusingtwodifferentrules',
    partial=[('patterns:number_patterns_rule', {'pattern': ['add'], 'places': [1], 'rule': False}, 'continues one sequence from its printed rule (Rule: count on by 5); never two sequences from two rules side by side'),
             ('patterns:pattern_relationship', {'forms': [0]}, 'pattern A always counts on by 1 and pattern B is made from it (Add 5, Multiply by 2); never two sequences each from its own rule')],
    verdict='partial',
    missing='two sequences generated side by side from two given rules and the same start (add 3 and add 6 from 0), and the relationship between their corresponding terms (each term of the second is twice the first)',
    build=['pattern_pairs_graph'],
    pre=[('number_theory:lcm', {'forms': [1]}, 'Y6.B2.S3', 'the multiples of two numbers listed side by side and compared for the ones they share'),
         ('algebra:function_table_easy', {'ftRules': ['+', 'x'], 'ftTask': 'outputs'}, 'Y6.B7.S1', 'a rule applied to a list of inputs'),
         ('multiplication:mult_comparison', {}, 'Y6.B2.S8', 'times-as-many: the relationship two sequences show (twice as many)')],
    related=[('coordinates:coordinate_q1', {'forms': [1]}, 'plotting points: the pairs the two sequences make, the same week')],
    note='Awsaj supplement lesson, W13, 5.OA.B.3 (block Y6.B7). pattern_pairs_graph closes this lesson and the ordered-pairs lesson the same week.')

lesson(G5 + 'multiplicationasscaling',
    partial=[('fraction_operations:mult_scaling_nv', {}, 'a whole number scaled by a fraction less than, equal to or greater than 1 (4/3 × 12 vs 12), judged without calculating; never a fraction scaled and never multiplying by n/n as fraction equivalence')],
    verdict='partial',
    missing='comparing a product with a fraction factor (3/4 × 2/5 vs 2/5), and relating fraction equivalence a/b = (n × a)/(n × b) to multiplying a/b by n/n = 1',
    build=['scaling_equiv'],
    pre=[('fraction_operations:mult_frac_whole', {}, 'Y5.B6.S2', 'a fraction times a whole number (4 × 2/3 = 2 2/3)'),
         ('multiplication:mult_comparison', {}, 'Y6.B2.S8', 'times-as-many: multiplying by a whole number greater than 1 makes it bigger'),
         ('fractions:improper_mixed', {}, 'Y5.B4.S4', 'fractions greater than 1 as mixed numbers (7/4 = 1 3/4)'),
         ('fractions:equivalent', {}, 'Y6.B3.S1', 'equivalent fractions (2/3 = 8/12): the n/n = 1 idea')],
    related=[('fraction_operations:mult_frac_frac', {}, 'a fraction times a fraction (1/2 × 3/4 = 3/8), taught the next week: the product is smaller than each factor')],
    note='Awsaj supplement lesson, W16-W17, 5.NF.B.5 (block Y6.B3). standards-audit.js judges 5.NF.B.5a/b full on mult_scaling; read against every clause, the n/n = 1 equivalence of 5.NF.B.5b is not dealt.')

lesson(G5 + 'findtheareaofarectanglewithfractionalsidelengths',
    partial=[('fraction_operations:mult_frac_frac', {}, 'multiplies two fractions with an overlapping area model (1/2 × 3/4 = 3/8) and clicks equal products; never a rectangle with fractional side lengths tiled by unit-fraction squares')],
    verdict='partial',
    missing='a rectangle with fractional side lengths tiled with unit-fraction squares, the tiles counted and shown equal to length × width (2/3 × 3/4)',
    build=['map_frac_side_area'],
    pre=[('area_perimeter:area_unit_squares', {}, 'Y5.B8.S4', 'the area of a rectangle by counting unit squares'),
         ('fraction_operations:mult_frac_whole', {}, 'Y6.B4.S1', 'a fraction times a whole number, the same week'),
         ('fractions:simplify', {'forms': [2]}, 'Y6.B3.S1', 'simplifying a fraction by its greatest common factor first: the product written in its simplest form')],
    related=[('fraction_operations:frac_mult_word', {'denoms': [2, 5]}, 'fraction stories, some the area of a garden bed with fractional sides')],
    note='Domain-test build lesson, W17, 5.NF.B.4b. The MAP lane\'s map_frac_side_area is exactly the missing form.')

lesson(G5 + 'divideawholenumberbyaunitfraction',
    partial=[('fraction_operations:div_unit_frac_nv', {'forms': [0, 1]}, 'a whole number divided by a unit fraction (7 ÷ 1/2 = 14), one number missing in some; numbers only: no model and no story'),
             ('fraction_operations:div_unit_fraction', {}, 'draws the bar for each division but mixes in a unit fraction divided by a whole number (1/2 ÷ 4); never a story')],
    verdict='partial',
    missing='a whole number divided by a unit fraction on a model on every item, in stories (how many 1/3-cup servings are in 2 cups?), checked by multiplying (20 × 1/5 = 4)',
    build=['whole_div_unit_frac'],
    pre=[('fraction_operations:mult_frac_whole', {}, 'Y6.B4.S1', 'a fraction times a whole number (20 × 1/5 = 4): the check of the division'),
         ('fraction_operations:mult_frac_frac', {}, 'Y6.B4.S2', 'a fraction times a fraction'),
         ('fractions:improper_mixed', {}, 'Y5.B4.S4', 'improper fractions as whole and mixed numbers: how many parts make a whole number of wholes')],
    related=[('fraction_operations:frac_mult_word_plain', {'denoms': [2, 3]}, 'fraction stories, some that cut a length into unit-fraction pieces (4 meters of ribbon cut into 1/2-meter pieces)')],
    note='Awsaj supplement lesson, W18-W19, 5.NF.B.7b/c (block Y6.B4). Generator note (Y6-report.md): div_unit_frac_nv forms 0/1 and 2/3 have swapped labels; {forms:[0,1]} is the whole ÷ unit fraction direction (40 of 40 items).')

lesson(G5 + 'convertcustomaryunitsoflengthinchesfeetyardsmiles',
    partial=[('measurement:length_customary', {}, 'converts a larger unit to a smaller one, one whole-number amount at a time (4 yards = 144 inches; 7 miles = 36,960 feet); never smaller to larger, mixed units or fractional amounts, and never a problem')],
    verdict='partial',
    missing='converting from a smaller unit to a larger one (84 in = 7 ft), mixed units (5 ft 3 in = 63 in) and fractional amounts (1 1/2 ft = 18 in), and using the conversions in multi-step problems',
    build=['length_customary_both'],
    pre=[('measurement:length_metric', {}, 'Y6.B5.S1', 'converting metric lengths (km, m, cm, mm), the same week: the same multiply-or-divide reasoning'),
         ('multiplication:mult_facts', {'constant': [12]}, 'Y4.B4.S10', 'the 12 times-table (× 12)'),
         ('measurement:unit_conversion_word', {'units': [1]}, 'Y6.B5.S3', 'one-step conversion stories in metric units, the same week')],
    related=[('measurement:unit_conversions', {'units': [1], 'forms': [0]}, 'customary conversions both ways, a smaller unit to a larger one too, with weight and capacity mixed in with length')],
    note='Domain-test build lesson, W21, 5.MD.A.1. Y6.B5.S5 (Imperial measures, W22) uses length_customary too.')

lesson(G5 + 'volumeofcompositesolids',
    verdict='gap',
    missing='the volume of a solid made of two non-overlapping cuboids, found by adding the volumes of the parts, in real-world problems',
    build=['volume_composite_repair'],
    pre=[('area_perimeter:composite_shapes', {'forms': [1]}, 'Y6.B10.S2', 'the area of an L- or T-shape by adding its rectangles: the same additive idea in 2-D'),
         ('area_perimeter:area_perimeter', {}, 'Y6.B10.S2', 'the area of a rectangle: the base layer of a box shape'),
         ('area_perimeter:area_unit_squares', {}, 'Y6.B10.S1', 'counting unit squares, the 2-D unit before the unit cube')],
    related=[('area_perimeter:volume', {'forms': [0], 'band': 30}, 'the volume of one box shape from its length, width and height, taught the next week: each part of a composite solid')],
    note='Awsaj supplement lesson, W24-W25, 5.MD.C.5c (block Y6.B10). area_perimeter:volume_composite is named for this but deals one prism (standards-audit.js mis-tag); volume_composite_repair is the build. Owner question: the site puts this lesson (W24) before the WRM volume steps (Y6.B10.S7-S8, W25), so no pre can be a volume skill.')

lesson(G5 + 'fractionlineplots',
    partial=[('graphs:line_plot_fractions', {}, 'reads a drawn line plot in halves, quarters and eighths (how many measurements, the most common, how many at one mark); never makes the plot and never uses fraction operations on the data')],
    verdict='partial',
    missing='making a line plot of measurements in halves, quarters and eighths from a data list, and using fraction operations on it (the total, the difference, sharing the total equally)',
    build=['make_line_plot'],
    pre=[('fraction_operations:add_frac_unlike', {'denoms': [2]}, 'Y6.B3.S5', 'adding halves, quarters and eighths (5/8 + 1/2): totals of plotted values'),
         ('fraction_operations:mult_frac_whole', {}, 'Y6.B4.S1', 'a fraction times a whole number: several equal measurements'),
         ('fraction_operations:div_unit_frac_nv', {'forms': [2, 3]}, 'Y6.B4.S3', 'mostly a unit fraction divided by a whole number (1/4 ÷ 2 = 1/8), with some clicks of a whole number divided by a unit fraction: sharing a total equally')],
    related=[('graphs:line_plot', {}, 'reading a line plot of plant heights in quarters and eighths')],
    note='Awsaj supplement lesson, W25-W26, 5.MD.B.2 (block Y6.B11). make_line_plot (STANDARD_PROPOSALS, the Y5 lane\'s text) makes the plot and solves problems from it, Grade 5 redistribution included.')

lesson(G5 + 'classifytwodimensionalfiguresinahierarchy',
    partial=[('shapes_classify:classify_quads', {}, 'ticks every category a drawn quadrilateral belongs to (a square is a rectangle, a rhombus and a parallelogram), or clicks every shape of one kind; never the hierarchy itself and never a property passed down to a subcategory'),
             ('shapes_classify:classify_triangles', {}, 'names a drawn triangle by its sides or by its angles; never both together and never as a branch of a hierarchy')],
    verdict='partial',
    missing='placing quadrilaterals and triangles in a hierarchy diagram by their properties, and reasoning that a property of a category belongs to every subcategory (all rectangles have four right angles, so squares do)',
    build=['shape_hierarchy'],
    pre=[('angles_lines:identify_lines', {}, 'Y3.B11.S6', 'parallel and perpendicular lines'),
         ('angles_lines:identify_angles', {}, 'Y6.B12.S1', 'right, acute and obtuse angles'),
         ('shapes_classify:hotspot_quads', {}, 'Y4.B12.S5', 'clicking the quadrilaterals among other shapes')],
    related=[('angles_lines:symmetry', {}, 'lines of symmetry, another property of a shape')],
    note='Awsaj supplement lesson, W29, 5.G.B.3 and 5.G.B.4 (block Y6.B12). standards-audit.js judges both full on classify_quads; read against every clause, the hierarchy and the inherited property are not dealt.')

# ───────────────────────── Grade 5 end-of-year entries (Projects & Taskmaster, W38; site CCSS 5.OA.A.1 is a placeholder) ─────────────────────────
lesson(G5 + 'consolidationofarithmetic',
    partial=[('number_ops_mixed:mixed', {'decimals': 2}, 'whole-number multiplying and dividing and decimal adding and subtracting to hundredths (62 × 11; 425.46 − 372.13); never a fraction, long division by a 2-digit number or a decimal multiplied or divided')],
    verdict='partial',
    missing='one review page of the year\'s written calculation: 4-digit × 2-digit, long division by a 2-digit number, and the four operations with decimals and with fractions',
    build=['g5_arith_review'],
    pre=[('multiplication:area_model_mult_hard', {}, 'Y6.B2.S7', 'multiplying a 2- or 3-digit number by a 2-digit number'),
         ('division:long_div_2digit', {}, 'Y6.B2.S11', 'long division by a 2-digit number'),
         ('decimals:mult_decimal', {}, 'Y6.B8.S7', 'a decimal times a whole number'),
         ('fraction_operations:mixed_fraction_ops', {}, 'Y6.B4.S5', 'mixed fraction questions: choosing the operation')],
    related=[('order_of_operations:paren_multi', {'band': 50}, 'expressions with two operations and parentheses (3 × (4 + 5)): a written calculation done in the right order')],
    note='Grade 5 end-of-year entry (site unit "Projects & Taskmaster", Enrichment, W38, standard track only; the site lists 5.OA.A.1 for all four, a placeholder). A consolidation lesson: the review draws on the year\'s calculation skills. fraction_operations:mixed_fraction_ops (a pre) is the fractions-only pool; no live pool mixes it with the whole-number and decimal skills, which is the build.')

lesson(G5 + 'endofyearinvestigationprojects',
    verdict='gap',
    missing='an open investigation over several linked tasks (plan a class trip: a budget, times, distances and a table of results) ending with a written explanation',
    build=['investigation_project'],
    pre=[('algebra:multi_step_word', {}, 'Y6.B2.S14', 'two-step adding and subtracting stories (had 66, gave away 13, then found 26 more)'),
         ('measurement:unit_conversion_word', {'units': [1]}, 'Y6.B5.S3', 'metric conversions in stories'),
         ('data_analysis:mean', {}, 'Y6.B11.S6', 'the mean of a set of results, rounded to one decimal place when it does not come out exactly (133 ÷ 4 = 33.25, written 33.3)'),
         ('decimals:mult_decimal', {}, 'Y6.B8.S7', 'a decimal times a whole number (18.56 × 4): costing several of one item')],
    related=[('decimals:add_decimal', {}, 'adding decimals to hundredths, the commonest step of a project budget')],
    note='Grade 5 end-of-year entry (Projects & Taskmaster, W38). A project is several linked tasks; no live skill links them, so this is a gap with a new skill.')

lesson(G5 + 'problemsolvingacrossstrands',
    partial=[('algebra:multi_step_word', {}, 'two-step adding and subtracting stories with whole numbers to about 100; never a problem that joins measures with fractions or shapes or data'),
             ('number_ops_mixed:word_problems_mixed', {}, 'one-step stories with the four operations and times-as-many (90 marbles, 9 in each bag); one strand at a time: never a measure or fraction or shape')],
    verdict='partial',
    missing='problems that cross strands: a measure with a unit change, a fraction or decimal amount, an area or volume, or a data value in the same problem',
    build=['cross_strand_problems'],
    pre=[('fraction_operations:frac_word_mixed', {}, 'Y6.B3.S9', 'fraction word problems'),
         ('measurement:unit_conversion_word', {'units': [1]}, 'Y6.B5.S3', 'metric conversion stories'),
         ('decimals:mult_decimal', {}, 'Y6.B8.S9', 'the multiplying of this step, as bare numbers (a decimal times a whole number, 49.6 × 5)')],
    related=[('algebra:algebra_word_mixed', {}, 'joining, taking-away and how-many-more stories within about 100, one and two steps: the pool the cross-strand problems grow from')],
    note='Grade 5 end-of-year entry (Projects & Taskmaster, W38).')

lesson(G5 + 'reasoningtasks',
    partial=[('order_of_operations:compare_expressions', {'forms': [1], 'band': 20}, 'sorts number statements into true and false by working out each side; the reasoning is calculation, never an explanation, a pattern spotted or an "always, sometimes, never" judgement')],
    verdict='partial',
    missing='reasoning tasks that ask the pupil to explain and convince: always / sometimes / never statements, which method is right and why, spotting and explaining a pattern, with a sentence frame and a word bank',
    build=['vis_reasoning_frames'],
    pre=[('fraction_operations:mult_scaling_nv', {}, 'G5|-|multiplicationasscaling', 'deciding whether a product is greater or less without calculating'),
         ('number_theory:prime_composite', {}, 'Y6.B2.S5', 'prime or composite: a reason from the factors'),
         ('number_sense:estimate_products', {'task': 'reasonable', 'place': 100}, 'Y6.B2.S16', 'is the answer reasonable? judged from an estimate')],
    related=[('order_of_operations:oop_medium', {'forms': [4]}, 'clicking every expression equal to a number: reasoning about equal expressions')],
    note='Grade 5 end-of-year entry (Projects & Taskmaster, W38). vis_reasoning_frames (VISUAL_BUILDS) is the frame for reasoning and error-analysis pages over the existing panes.')

# ───────────────────────── Support titles (enrich-native: judged at their SOURCE grade) ─────────────────────────
lesson(G5 + 'dividea2digitnumberby100',
    partial=[('placevalue:place_value_10x', {'op': '/', 'power': [100], 'decimals': True}, 'divides 3-digit numbers by 100 (697 ÷ 100 = 6.97); now and then a 2-digit number (89 ÷ 100 = 0.89, about 1 item in 10), never a 1-digit number; no option gives a page of the small dividends')],
    verdict='partial',
    missing='a page of 1- and 2-digit numbers divided by 100 (34 ÷ 100 = 0.34; 7 ÷ 100 = 0.07), the digits moving two places right past the point',
    build=['div10_small_numbers'],
    pre=[('division:div_facts', {'constant': [10]}, 'Y2.B5.S14', 'dividing by 10'),
         ('decimals:decimal_nl_drag', {}, 'Y4.B8.S4', 'tenths on a number line'),
         ('conversions:d_to_f', {'forms': [0]}, 'Y4.B8.S2', 'a decimal written as a fraction (0.7 = 7/10; 0.25 = 1/4)')],
    related=[('conversions:f_to_d', {'denoms': [5]}, 'fifths, tenths and hundredths written as decimals (50/100 = 0.5): the same 0.34 = 34/100 idea')],
    note='Support lesson (site flag enrich-native, "From Decimals A (Y4 Spring)", source Grade 3); nearest WRM step Y4.B8.S10 Divide a 1- or 2-digit number by 100. Judged at its source year (Year 4). Reuses the Y4 lane\'s div10_small_numbers.')

lesson(G5 + 'orderfractions',
    partial=[('fractions:order_fractions', {}, 'orders sets of unlike fractions (3/4, 7/10, 2/3, 1/2); the Grade 2 source lesson orders unit fractions or fractions with one denominator')],
    verdict='partial',
    missing='ordering unit fractions, or fractions with the same denominator, with bars of the same whole',
    build=['frac_compare_same_part'],
    pre=[('fractions:identify', {'forms': [1]}, 'Y3.B6.S1', 'choosing the model that shows a fraction'),
         ('fractions:shade_fraction', {}, 'Y3.B6.S3', 'shading a fraction of a shape'),
         ('composing:fraction_number_line', {}, 'Y3.B6.S7', 'fractions on a number line')],
    related=[('fractions:order_frac_numline', {}, 'fractions found on a 0-1 number line (which letter shows 5/8?) and dragged into order: the line an order is read from; its fractions are unlike (5/8, 4/5), the next step after the Grade 2 source')],
    note='Support lesson (site flag enrich-native, "From earlier work (Prerequisite ladder)", source Grade 2); nearest WRM steps Y3.B6.S2 / S5 (Compare and order unit / non-unit fractions). Judged at its source year (Year 3): no pre compares or orders unlike fractions. The same lesson as the Y5 lane\'s G4 "Order fractions", with its reused build.')

lesson(G5 + 'whatisvolume',
    verdict='gap',
    missing='volume as the space a solid takes up, counted in unit cubes (a shape built of 12 centimetre cubes has a volume of 12 cm³), comparing volumes',
    build=['volume_cubes'],
    pre=[('area_perimeter:area_unit_squares', {}, 'Y5.B8.S4', 'area by counting unit squares: the 2-D idea of counting units'),
         ('shapes_early:name_3d_shapes', {}, 'Y5.B10.S10', 'naming 3-D shapes'),
         ('measurement:capacity', {'units': [1], 'forms': [0]}, 'Y5.B15.S4', 'capacity in litres and millilitres, the other "how much space" measure')],
    related=[('measurement:mass_volume_liquid', {'forms': [0]}, 'the volume of a liquid read on a measuring cylinder in mL')],
    note='Support lesson (site flag enrich-native, "From Volume (Y5 Summer)", source Grade 4); nearest WRM step Y5.B15.S1 Cubic centimetres (gap, volume_cubes). Judged at its source year (Year 5).')

lesson(G5 + 'writedecimals',
    partial=[('conversions:f_to_d', {'denoms': [5]}, 'writes fifths, tenths and hundredths as decimals one fraction at a time (2/5 = 0.4; 50/100 = 0.5), numbers only: fifths mixed in, and no picture (a strip or a hundred square)')],
    verdict='partial',
    missing='writing tenths and hundredths as decimals with a tenths strip or hundred square beside each, on a page held to tenths and hundredths',
    build=['dec_fraction_basics'],
    pre=[('conversions:d_to_f', {'forms': [0]}, 'Y4.B8.S2', 'a decimal written as a fraction'),
         ('decimals:decimal_nl_drag', {}, 'Y4.B8.S4', 'tenths on a number line'),
         ('fractions:write_fraction', {'denoms': [5]}, 'Y4.B8.S1', 'a shaded fraction written down: tenths (8/10), fifths mixed in')],
    related=[('decimals:compare_decimal', {'forms': [1]}, 'clicking every decimal greater or less than a given one, in tenths and hundredths: the written decimal read for its size')],
    note='Support lesson (site flag enrich-native, "From Decimals B (Y4 Summer)", source Grade 3); nearest WRM steps Y4.B8.S2 / S8 (Tenths / Hundredths as decimals). Judged at its source year (Year 4). Reuses the Y4 lane\'s dec_fraction_basics.')
