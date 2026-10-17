# Y4 (school Grade 3) SITE LESSONS: every entry of data/curriculum/site-lessons.json with wrmYear "Y4" (23): the lessons the school
# site schedules or lists that are NOT White Rose small steps (owner rule 2026-10-16, "every site lesson tagged"):
#   11 committee lessons (Awsaj supplements and domain-test builds, school weeks W05 to W28), judged at Grade 3 in their week;
#   11 Support titles (enrich-native, "Source: G<n>": a lesson of a lower grade that matches no WRM step title), each judged at its
#      SOURCE year (GPK = Reception R, GK = Kindergarten Y1, G1 = Grade 1 Y2, G2 = Grade 2 Y3; critic Y5 r5 class H): its links
#      are sized for that year and its pre cite only that year or below (a GPK lesson with a Reception phase: an R step of a block
#      BEFORE the phase, phases.json);
#   1 native lesson ("Pounds, tens, ones and pence"), which the pacing reviews as the retitled Y4.B10.S1 and takes its week (W37).
# Contract: the Y5 lane's (Y5-report.md "Site lessons"); lessons.py writes, checks and gates it, lessonfit.mjs judges every link
# from generated items. Every direct / partial verdict below was judged from at least 40 generated items with the opts listed (fresh
# seeds; the report's audit table). Lessons tag NOTHING into SKILL_WRM.
# Shape: lesson(id, direct=[(key, opts)], partial=[(key, opts, missing)], verdict, missing, build=[ids], closes={id: clause},
#   pre=[(key, opts, cited step or lesson, reason)], preBuild, related=[(key, opts, why)], note, search). '@max' in opts is the
#   link's Max Number (written as maxNumber). `search` is the rule-5 record of a partial / gap lesson.

G = 'G3|-|'

# ── proposals reused verbatim from a passed lane's links file (same id = same spec); Y4's own and the live lists need no entry ──
LANE.update({'make_amount_notes': 'Y3', 'frac_compare_same_part': 'Y5'})

# ── the envisioned representation of a reused proposal whose source gives none ──
ENVREP['patterns_notice'] = 'one boxed cell: a window of the multiplication table with a pattern shaded, the question "What do you notice? Why?" and a sentence frame with a property word bank (turn around, double, even)'
ENVREP['make_line_plot'] = 'one boxed cell: a list of 6 to 10 measurements (or ruler pictures) and a number line marked in halves or quarters to draw an x above each measurement'
ENVREP['area_tile_multiply'] = 'one boxed cell: a rectangle on a black-line unit grid; the pupil writes the count of squares, then rows × columns = the area'
ENVREP['multi_step_four_ops'] = 'the existing word-work cell with two steps: the story, two operation choices (+ − × ÷), a letter equation slot and the answer'
ENVREP['measurable_attributes'] = 'one boxed cell: one pictured object and the words long, tall, heavy, holds; the pupil circles every word that can be measured about it'
ENVREP['partition_draw'] = 'one boxed cell: a shape outline with dots on its sides; the pupil draws the cuts into n equal parts and writes the unit fraction of each part'

# ── new proposals (only what no existing proposal does) ──
LNEW['estimate_mass_volume'] = {
    'kind': 'option', 'skill': 'measurement:mass_volume_liquid',
    'option': 'form "about how much?": one pictured object or container and a benchmark (a paper clip is about 1 g, a bag of flour about 1 kg, a water bottle about 1 L); the pupil picks the sensible estimate from three amounts in the same unit',
    'name': 'Estimate a Mass or a Liquid Volume (option)',
    'teaches': 'estimating the mass of an object in grams or kilograms and the liquid volume of a container in litres or millilitres against a known benchmark, before measuring',
    'representation': 'one boxed cell: the object drawn in black line beside its benchmark, three estimates in a bank below and one answer slot; no colour fill',
    'family': 'measurement', 'ccss': ['3.MD.A.2'],
    'why': 'mass_volume_liquid reads a drawn scale (forms 0, 1) or sorts objects by the unit to measure them in (forms 2); nothing asks the pupil how heavy or how full a thing is likely to be (3.MD.A.2 "measure and estimate"). Overlap (critic r1 n2): Y5\'s capacity_estimate ("Estimate Capacity (option)", 3.MD.A.2) already plans the liquid-volume half; this option is still needed for the mass half (grams and kilograms against a benchmark), and the lead may merge the volume half into capacity_estimate'}
LNEW['ruler_object_inch'] = {
    'kind': 'option', 'skill': 'measurement:reading_ruler',
    'option': 'form "measure the object": a drawn object (pencil, crayon, leaf, key) laid along an inch ruler marked in halves or quarters, its left end at 0 or at a whole inch; the pupil writes its length to the nearest half or quarter inch',
    'name': 'Measure an Object to the Nearest Half or Quarter Inch (option)',
    'teaches': 'measuring a drawn object with an inch ruler marked in halves and fourths: lining up its end, reading where the other end falls, and writing the length to the nearest half or quarter inch',
    'representation': 'one boxed cell: the ruler in black line with the object drawn on it, the answer slot "__ in"; the same cell can list 4 to 8 measured objects for a line plot',
    'family': 'measurement', 'ccss': ['3.MD.B.4'],
    'why': 'reading_ruler {parts: halves / quarters} reads where an arrow points; no item lays an object on the ruler, so the pupil never measures a length (3.MD.B.4 "generate measurement data by measuring lengths")'}
LNEW['money_place_value'] = {
    'kind': 'option', 'skill': 'measurement:money_notation',
    'option': 'task "place value": an amount to $99.99 shown with $10 bills, $1 bills, dimes and pennies; the pupil fills a chart (tens, ones . dimes, pennies) and writes the amount with $ and the point ($24.53 = 2 tens, 4 ones, 5 dimes, 3 pennies)',
    'name': 'Dollars and Cents in a Place-Value Chart (option)',
    'teaches': 'the place value of money: dollars as tens and ones, cents as dimes (tenths of a dollar) and pennies (hundredths), read from bills and coins, written in a chart and with $ and the point',
    'representation': 'one boxed cell: the bills and coins drawn in black line, a four-column chart (tens | ones . dimes | pennies) and one money slot "$__.__"',
    'family': 'measurement', 'ccss': ['2.MD.C.8', '4.NF.C.6'],
    'why': 'money_notation writes amounts under $10 from $5 / $1 bills and coins (never a $10 bill, never a tens digit of dollars) and no money item splits an amount into tens, ones, dimes and pennies; money_convert (Y4) converts cents to dollars and cents. Overlaps (critic r1 n5): VISUAL_BUILDS vis_coin_options plans a place-value chart of coins (£1 / 10p / 1p) and Y4\'s money_convert spec a place chart $ | ¢; neither has a tens column of dollars or bills to $99.99, so the tens-and-ones-of-dollars chart is still a separate option (the lead may fold the coin chart into it)'}
LNEW['area_split_tiles'] = {
    'kind': 'option', 'skill': 'area_perimeter:area_distributive_visual',
    'option': 'form "tile the parts": the split rectangle drawn on unit squares (a by b + c), the pupil counts or multiplies each part and writes a × (b + c) = a × b + a × c; form "rooms": a floor plan of two rectangles in a story (a room and a hall), find the floor area',
    'name': 'Split Rectangles on Unit Squares, and Floor Plans (option)',
    'teaches': 'showing with unit squares that a rectangle a by (b + c) has the area a × b + a × c (the distributive property), and finding the area of a rectilinear floor plan in a story by adding the areas of its rectangles',
    'representation': 'one boxed cell: the rectangle on a black-line unit grid with the split line heavy, the two part areas and the total as answer slots and the equation a × (b + c) = a × b + a × c; the floor-plan form draws the plan with its side lengths and a one-line story',
    'family': 'area_perimeter', 'ccss': ['3.MD.C.7c', '3.MD.C.7d'],
    'why': 'area_distributive_visual labels a split rectangle with its side lengths (no unit squares, no equation a × (b + c)); area_polygon_decompose finds the area of an L-, T- or U-shape with no story; no item ties the split to the distributive property or sets the area in a real-world plan'}

LNEW['compare_durations'] = {
    'kind': 'option', 'skill': 'measurement:elapsed_visual_easy',
    'option': 'form "which took longer?": two activities, each with a start clock and an end clock on its own time line; the pupil writes both durations (whole and half hours, later quarter hours) and ticks the one that took longer',
    'name': 'Which Took Longer? Compare Two Durations (option)',
    'teaches': 'finding two durations from their start and end times and comparing them: which activity took longer and which took less time',
    'representation': 'one boxed cell: two rows, each an activity word, a start clock, an end clock and a time line with an answer slot "__ h __ min"; a tick box beside each row for "took longer"',
    'family': 'measurement', 'ccss': ['3.MD.A.1'],
    'why': 'elapsed_visual_easy / medium / hard and elapsed_find_duration find ONE duration; no time item shows two activities side by side to compare how long each took'}

# ───────────────────────── committee lessons (Awsaj supplements and domain-test builds, Grade 3) ─────────────────────────
lesson(G + 'findtheruleinaninputoutputtable',
    direct=[('algebra:function_table_easy', {'ftTask': 'rule', 'ftRules': ['+', '-'], 'band': 100}),
            ('algebra:function_table_easy', {'ftTask': 'rule', 'ftRules': ['x', '/'], 'band': 20})],
    verdict='full',
    pre=[('multiplication:mult_facts', {'constant': [6]}, 'Y4.B4.S3', 'the 6 times-table facts: a × rule is a times-table'),
         ('division:div_facts', {'constant': [9]}, 'Y4.B4.S4', 'dividing by 9: a ÷ rule undoes a times-table'),
         ('multiplication:count_by_tables', {'constant': [3]}, 'Y4.B4.S1', 'counting in 3s: the Out numbers of a × 3 rule')],
    related=[('patterns:number_patterns_rule', {'pattern': 'add', 'places': 1}, 'a rule continued along a sequence (count on by the same number each time)')],
    note='Domain-test build lesson (site: "New CCSS BUILD lesson so the domain test only asks what has been taught"), W05-W07, 3.OA.D.9. '
         'function_table_easy {ftTask: rule} shows an In / Out table with every row filled and the pupil writes the rule: the + and − rules with '
         'numbers to 100 (+ 23, − 10), the × and ÷ rules (× 2 to × 5, ÷ 2 to ÷ 5) with every number to 20, so every row is a table fact (× 4: '
         '2 → 8; ÷ 4: 12 → 3); at band 100 the × and ÷ rows leave the tables (× 6: 15 → 90; ÷ 3: 87 → 29, a division taught in W06), so the '
         'two kinds of rule are two links. '
         'The two-step rules (× then +) are left out at W05. Explaining a pattern with the properties of operations (the other half of 3.OA.D.9) '
         'is the same week\'s "Patterns on the multiplication table" lesson (partial, patterns_notice).')

lesson(G + 'patternsonthemultiplicationtable',
    partial=[('multiplication:mult_chart', {'task': 'pattern'}, 'fills two blanks in one row of a window of the chart and writes the row\'s rule (across the 7 row, add 7 each time); never asks why a pattern holds'),
             ('multiplication:mult_chart', {'task': 'even'}, 'shades every even product in a window of the chart; never asks which factors make an even product or why')],
    verdict='partial',
    missing='explaining the patterns of the multiplication table with the properties of multiplication: the table is the same on both sides of its diagonal (3 × 7 = 7 × 3), an even factor makes an even product (4 × a number is always even: it is double 2 × that number), the 9s go up one ten and down one one',
    build=['patterns_notice'],
    pre=[('multiplication:count_by_tables', {'constant': [3]}, 'Y4.B4.S1', 'counting in 3s: one row of the table'),
         ('multiplication:mult_facts', {'constant': [9]}, 'Y4.B4.S5', 'the 9 times-table facts'),
         ('multiplication:mult_facts', {'constant': [7]}, 'Y4.B4.S8', 'the 7 times-table facts')],
    related=[('multiplication:mult_chart_easy', {}, 'filling the missing products of the chart: the table the patterns are found in')],
    note='Awsaj supplement lesson, W05-W06, 3.OA.C.7 and 3.OA.D.9, block Y4.B4. Y4.B4.S6 "The 3, 6 and 9 times-tables" (W02) uses the lesson\'s own '
         'mult_chart key, so it is not listed as a pre (one key, one role). mult_chart finds a pattern but never explains it, which is the core '
         'of 3.OA.D.9 ("observe that 4 times a number is always even, and explain why").',
    search='Searched skill-options.js and the generators for an item that explains a multiplication-table pattern: mult_chart tasks fill / headers / '
           'shade / pattern / even (none asks why), mult_chart_easy (the same tasks), mult_properties forms 0-3 (one property at a time, never read '
           'off the table), count_by_tables, number_patterns_rule (sequences, not the table). None explains a pattern; patterns_notice '
           '(STANDARD_PROPOSALS) is the build.')

lesson(G + 'propertiesofmultiplicationcommutativeidentityanddistributive',
    direct=[('multiplication:mult_properties', {'forms': [0, 1, 2]})],
    verdict='full',
    pre=[('multiplication:mult_facts', {'constant': [0, 1]}, 'Y4.B4.S11', 'multiplying by 1 and by 0: the identity facts'),
         ('multiplication:arrays_groups', {'forms': [0]}, 'Y3.B3.S2', 'an array of rows of dots read as a multiplication'),
         ('division:div_facts', {'constant': [1]}, 'Y4.B4.S12', 'dividing by 1: the number is unchanged')],
    related=[('multiplication:dot_array_mult', {'band': 25}, 'a dot array read as rows times columns: the product of the turned array is the same')],
    note='Domain-test build lesson, W05-W06, 3.OA.B.5. mult_properties {forms: 0, 1, 2} deals the three properties the title names: forms 0 an '
         'array and its turn, two facts with one product (3 × 4 = 4 × 3, commutative); forms 1 breaking a fact apart by its rows (5 × 9 = 1 × 9 + 4 × 9, distributive); '
         'forms 2 times 1 (1 × 11 = 11, identity). Forms 3 (times 0) is left out: the title does not name it. The associative property of '
         '3.OA.B.5 is not in the title; Y4.B4.S13 "Multiply three numbers" (W04, a gap, mult_three) is the step that teaches it.')

lesson(G + 'twostepwordproblemswiththefouroperations',
    partial=[('algebra:multi_step_word', {}, 'two-step stories that only add and subtract (add twice, add then take away, take away then add, take away twice), with numbers to about 120; never a × or ÷ step and never a letter for the unknown'),
             ('number_ops_mixed:word_problems_mixed', {'@max': 100}, 'one-step stories with +, −, × or ÷ (5 plates of 8 beads; 10 stamps, 2 in each jar; how many more), the factors and divisors within the tables at Max Number 100, and "times as many" comparisons in about 1 in 5 (Noor has 90 crayons, 9 times as many as Omar: 4.OA.A.2, Grade 4 content); never a second step')],
    verdict='partial',
    missing='two-step stories that mix × or ÷ with + or − (3 boxes of 8 pens and 5 more pens), written as an equation with a letter for the unknown and checked by estimating',
    build=['multi_step_four_ops'],
    pre=[('multiplication:mult_facts', {'constant': [7]}, 'Y4.B4.S8', 'the 7 times-table facts used in a × step'),
         ('division:div_word_problems', {'range': 100}, 'Y3.B3.S5', 'sharing and grouping stories: a one-step ÷ story, dividing by 2 to 8'),
         ('addition:add_wp_100', {'band': 100}, 'Y2.B2.S19', 'a one-step addition story to 100'),
         ('subtraction:sub_wp_100', {'band': 100}, 'Y2.B2.S19', 'a one-step subtraction story to 100')],
    related=[('algebra:tape_diagram', {}, 'a bar model of a one-step story: one of the two bars of a two-step story')],
    note='Awsaj supplement lesson, W06-W07, 3.OA.D.8, block Y4.B4.',
    search='Searched for a two-step story with a × or ÷ step: algebra:multi_step_word forms 0-3 (+ and − only, wpBar draws a bar but keeps + and −), '
           'algebra:multi_step_word_plain (the same), number_ops_mixed:word_problems_mixed (four operations, one step), algebra:algebra_word_mixed '
           '(one equation), multiplication:mult_word_problems forms 0-2 (one step), measurement:money (one step). None has two steps with × or ÷; '
           'multi_step_four_ops (STANDARD_PROPOSALS) is the build.')

lesson(G + 'partitionshapesintoequalareas',
    partial=[('shapes_early:partition_shapes', {}, 'counts the equal parts of a shape already cut into halves, thirds or fourths, or picks the fraction shaded (1/4, 2/4, 2/3); never cuts a shape itself and never sixths or eighths')],
    verdict='partial',
    missing='partitioning a shape into 2, 3, 4, 6 or 8 parts with equal areas (the pupil draws the cuts; sixths and eighths among them) and naming the area of each part as a unit fraction of the whole (each part is 1/6 of the area)',
    build=['partition_draw'],
    pre=[('fractions:identify', {'forms': [1]}, 'Y3.B6.S1', 'picking the model, cut into equal parts, that shows a fraction'),
         ('fractions:shade_fraction', {}, 'Y3.B6.S3', 'shading a fraction of a shape cut into equal parts'),
         ('composing:compose_whole', {}, 'Y3.B6.S4', 'making 1 whole from smaller pieces')],
    note='Awsaj supplement lesson, W07, 3.G.A.2, block Y4.B7. No related: composing:whole_as_fraction (the round-1 related) writes wholes to 10 as fractions, past this lesson\'s own numbers (parts 2 to 4; lessons critic r1 G1), and the other fraction skills read or shade a cut shape, which the pre already do.',
    search='Searched for an item that cuts a shape into equal areas: shapes_early:partition_shapes forms 0 / 1 and parts 0-2 (halves, thirds, fourths; '
           'the shape is cut already), fractions:identify / shade_fraction / write_fraction (a cut shape is read or shaded), composing:compose_whole, '
           'whole_as_fraction, half_or_not (Y2, "is it a half?"). None asks the pupil to cut, none deals sixths or eighths as equal areas; '
           'partition_draw (STANDARD_PROPOSALS) is the build.')

lesson(G + 'solveadditionandsubtractionwordproblemswithin1000usingbarmodels',
    direct=[('addition:add_wp_1k', {'band': 1000, 'support': 'bar'}), ('subtraction:sub_wp_1k', {'band': 1000, 'support': 'bar'})],
    verdict='full',
    pre=[('addition:add_1k_regroup', {}, 'Y3.B2.S14', 'adding two 3-digit numbers with an exchange'),
         ('subtraction:sub_1k_regroup', {}, 'Y3.B2.S16', 'subtracting two 3-digit numbers with an exchange'),
         ('number_sense:nearest_100', {}, 'Y4.B1.S15', 'rounding a number to the nearest 100: the estimate that checks an answer'),
         ('addition:add_wp_100', {'band': 100}, 'Y2.B2.S19', 'a one-step addition story to 100')],
    related=[('addition:comparison_word', {}, 'how many more or how many fewer stories to 20: the compare story, which these items do not tell')],
    note='Domain-test build lesson, W17, 3.NBT.A.2 and 3.OA.D.8. add_wp_1k and sub_wp_1k {band 1000, support: bar} tell a one-step story '
         'within 1,000 (join, put together; take away) and draw the bar model under it (payload bar: true on every item); the pupil writes the '
         'operation and the answer. The two-step stories of 3.OA.D.8 are the W06 lesson "Two-step word problems with the four operations".')

lesson(G + 'areaasmultiplication',
    partial=[('area_perimeter:area_unit_squares', {'forms': [0]}, 'counts the unit squares that cover a shape drawn on a grid (areas 4 to 48) under the printed hint "Multiply the sides"; never writes the rows × the columns beside the count'),
             ('area_perimeter:area', {'forms': [2], '@max': 100}, 'a story of a rectangular floor, patio or wall in feet whose area is the side lengths multiplied (8 ft by 5 ft: 40 square feet); never tiled')],
    verdict='partial',
    missing='showing on the tiled rectangle that the count of unit squares equals the side lengths multiplied (rows × columns = the area)',
    build=['area_tile_multiply'],
    pre=[('multiplication:arrays_groups', {'forms': [0]}, 'Y3.B3.S2', 'an array of rows of dots read as a multiplication'),
         ('area_perimeter:perimeter_grid', {'forms': [0, 1]}, 'Y4.B6.S3', 'the side lengths of a shape on a grid'),
         ('multiplication:mult_facts', {'constant': [7]}, 'Y4.B4.S7', 'the 7 times-table facts: side lengths multiplied')],
    related=[('area_perimeter:area_distributive_visual', {'band': 30}, 'a rectangle split into two parts and their areas added: the same week\'s next lesson')],
    note='Awsaj supplement lesson, W20, 3.MD.C.7, 7a, 7b, block Y4.B3. area forms 0 is not linked: it mixes triangles (base × height ÷ 2), '
         'which is Grade 6. Forms 2 deals 3.MD.C.7b (multiply side lengths in a real-world story); 7a (tiling shown equal to multiplying) is missing.',
    search='Searched for an item that tiles a rectangle and writes rows × columns: area_perimeter:area_unit_squares forms 0 / 1 (count only, a printed '
           'hint), area forms 0-2 (forms 0 multiplies side lengths, with triangles; forms 1 a missing side; forms 2 a story), area_perimeter:area_perimeter, '
           'shapes_early:compose_rect_from_squares, multiplication:dot_array_mult / arrays_groups (arrays of dots, not area). None shows the tiled '
           'count equal to the product; area_tile_multiply (STANDARD_PROPOSALS) is the build.')

lesson(G + 'distributiveandadditivearea',
    partial=[('area_perimeter:area_distributive_visual', {'band': 30}, 'a rectangle split into two parts with its side lengths labelled; the pupil adds the two areas (3 × 4 + 3 × 2 = 18); never on unit squares and never written as 3 × (4 + 2)'),
             ('area_perimeter:area_polygon_decompose', {'band': 25}, 'the area of an L-, T- or U-shape split into rectangles and added; never a story')],
    verdict='partial',
    missing='the split rectangle tiled in unit squares to show a × (b + c) = a × b + a × c, and the area of a rectilinear floor plan in a story',
    build=['area_split_tiles'],
    pre=[('area_perimeter:area_unit_squares', {'forms': [1]}, 'Y4.B3.S2', 'counting the unit squares of an L-shape'),
         ('multiplication:mult_properties', {'forms': [1]}, 'Y4.B5.S2', 'breaking a fact apart by its rows (5 × 8 = 4 × 8 + 1 × 8)'),
         ('multiplication:area_model_mult', {'tiles': 21}, 'Y4.B5.S9', 'a number split into tens and ones, each part multiplied and the parts added')],
    related=[('area_perimeter:composite_shapes', {'forms': [1], 'band': 25}, 'the perimeter and the area of a small L- or T-shape with every side length given (areas 14 to 24)')],
    note='Awsaj supplement lesson, W20-W21, 3.MD.C.7, 7c, 7d, block Y4.B3. The story forms of other skills are not this clause: area_perimeter:area '
         'forms 2 tells a story of ONE rectangle (linked in the area-as-multiplication lesson), area_perimeter:perimeter forms 2 a perimeter story and '
         'area_perimeter:volume forms 2 a box (3-D); none is a rectilinear floor plan.',
    search='Searched for a split rectangle on unit squares written as a × (b + c), and for a rectilinear area story: area_distributive_visual (band 30 / 50, '
           'labelled sides only), area_polygon_decompose shapes 0-2 (L, U, T, no story), composite_shapes forms 0 / 1 (perimeter, perimeter and area, no '
           'story), area forms 2 (stories of one rectangle), mult_properties forms 1 (breaking apart, no area). None does either; area_tile_multiply '
           '(STANDARD_PROPOSALS) tiles one rectangle only, so area_split_tiles is new.')

lesson(G + 'measureandestimatemassandliquidvolumegkgmll',
    partial=[('measurement:mass_volume_liquid', {'forms': [0]}, 'reads the millilitres of water in a drawn graduated cylinder (scales to 100, 200, 500 or 1,000 mL); never litres, never estimates'),
             ('measurement:mass_volume_liquid', {'forms': [1]}, 'reads a dial scale in grams (to 2,000 g) or in kilograms (to 10 kg); never estimates'),
             ('measurement:mass_volume_liquid', {'forms': [2]}, 'sorts or picks objects by the unit they are measured in (g, kg, mL, L); never an amount to read or write')],
    verdict='partial',
    missing='reading litres on a scale, estimating a mass or a liquid volume against a benchmark, and one-step stories that add, subtract, multiply or divide masses or volumes in the same unit',
    build=['mass_scales', 'estimate_mass_volume', 'mass_ops'],
    closes={'mass_scales': 'reading litres on a jug scale, and scales stepped in 1s, 2s, 5s or 10s (the skill reads millilitres, grams and kilograms on 100- or 200-step scales)',
            'estimate_mass_volume': 'estimating a mass in grams or kilograms and a liquid volume in litres against a benchmark',
            'mass_ops': 'one-step stories that add, subtract, multiply or divide masses or liquid volumes in the same unit (3.MD.A.2)'},
    pre=[('number_sense:estimate_sums_diffs', {'place': 100}, 'Y4.B2.S9', 'estimating a sum or a difference'),
         ('addition:add_wp_100', {'band': 100}, 'Y2.B2.S19', 'a one-step addition story to 100'),
         ('division:div_facts', {'constant': [6]}, 'Y4.B4.S2', 'dividing by 6')],
    related=[],
    note='Awsaj supplement lesson, W22-W23, 3.MD.A.2, block Y4.B6. Grade 2 met grams, kilograms, millilitres and litres in Y3.B7, whose steps use '
         'this lesson\'s own mass_volume_liquid key (so they are not listed as pre). No related: the other measure skills (measurement:capacity, '
         'unit_conversions, unit_conversion_word) change units with decimals (taught W29) or numbers past 1,000.',
    search='Searched for grams / litres scales, estimates and mass or volume stories: mass_volume_liquid forms 0-2 (mL cylinder, kg scale, sort by unit), '
           'measurement:capacity units 0 / 1 forms 0 / 1 (convert, click containers above 1 L), measurement:unit_conversions and unit_conversion_word '
           '(change units), measurement:estimate_length (estimates length only), heavier_lighter_visual (no units), Y5\'s proposal capacity_estimate (estimates capacity only: the volume half of estimate_mass_volume, an overlap the lead reconciles). None reads grams or litres on a '
           'scale, estimates a mass or volume, or tells a same-unit story; mass_scales and mass_ops (WRM_PROPOSALS) and the new estimate_mass_volume.')

lesson(G + 'measuretothehalfandquarterinch',
    partial=[('measurement:reading_ruler', {'parts': [1, 2]}, 'reads where an arrow points on a 6-inch ruler marked in halves or quarters (3 1/4, 4 1/2); never lays an object on the ruler')],
    verdict='partial',
    missing='measuring a drawn object with the inch ruler to the nearest half or quarter inch',
    build=['ruler_object_inch'],
    pre=[('composing:fraction_number_line', {}, 'Y3.B6.S7', 'reading and placing a fraction on a number line (1/2, 3/8, 5/2)'),
         ('fractions:mixed_nl_drag', {}, 'Y4.B7.S4', 'placing fractions and mixed numbers on a number line of three wholes'),
         ('fractions:identify', {'forms': [1], 'denoms': [2]}, 'Y2.B8.S10', 'picking the model that shows halves, quarters or eighths; some of the other models are in thirds, fifths or sixths')],
    related=[('graphs:line_plot_fractions', {'tiles': 6}, 'measurements shown on a line plot: the next lesson')],
    note='Awsaj supplement lesson, W27-W28, 3.MD.B.4, block Y4.B13. The ruler cell is in inches (the US customary unit 3.MD.B.4 names).',
    search='Searched for an item that measures an object in inches: reading_ruler parts 0-2 and labels (an arrow on the ruler), reading_ruler_hard (the same), '
           'measurement:estimate_length (estimates, sorts by unit), length_customary (conversions), make_line_plot (STANDARD, a build: measuring for a '
           'line plot), ruler_difference (STANDARD, how much longer, a build). None lays an object on the ruler; ruler_object_inch is new.')

lesson(G + 'buildalineplotfrominchmeasurements',
    partial=[('graphs:line_plot_fractions', {}, 'reads a drawn line plot of measurements in halves and quarters, some in eighths (how many at a mark, the most common, how many in all); never makes the plot')],
    verdict='partial',
    missing='making a line plot from inch measurements: marking a scale in halves or quarters and drawing an x for each measurement',
    build=['make_line_plot'],
    pre=[('measurement:reading_ruler', {'parts': [1, 2]}, G + 'measuretothehalfandquarterinch', 'reading an inch ruler marked in halves and quarters'),
         ('graphs:tally_chart', {}, 'Y4.B13.S1', 'reading data from a tally chart'),
         ('fractions:mixed_nl_drag', {}, 'Y4.B7.S4', 'placing fractions and mixed numbers on a number line: the scale of the plot')],
    related=[('graphs:bar_graph', {'forms': [0, 1], 'most': 10}, 'another way to show counted data')],
    note='Awsaj supplement lesson, W28, 3.MD.B.4, block Y4.B13.',
    search='Searched for an item that builds a line plot: graphs:line_plot forms 0 / 1 (reads, eighths), line_plot_g2 forms 0-2 (reads whole-number sizes), '
           'line_plot_fractions forms 0-2 (reads), build_bar_graph and build_pictograph (other graphs). None builds a line plot; make_line_plot '
           '(STANDARD_PROPOSALS) is the build.')

# ───────────────────────── Support lessons (judged at their source year) ─────────────────────────
lesson(G + 'compareamountsmorefewersame',
    direct=[('comparing:compare_groups', {'band': 5, 'level': [1]})],
    verdict='full',
    pre=[('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'picking out every object of one kind among others and counting them')],
    related=[('counting:count_objects', {'band': 5}, 'counting a group of objects to 5')],
    note='Support lesson (source Pre-K, "Prerequisite ladder"), judged at Reception. compare_groups {band 5, level 1} shows two pictured groups of '
         '1 to 5 counters and asks which has more, which has fewer, or whether they are the same: the content of R.B1.S7 "Compare amounts", the '
         'first block of Reception. Pre-skills are few: only R.B1 comes before it, and its matching and sorting steps are the building blocks; '
         'R.B1.S7 itself uses the lesson\'s own key.')

lesson(G + 'comparedurationsoftime',
    partial=[('measurement:elapsed_visual_easy', {}, 'finds one duration between two clocks on a time line, in whole and half hours (1 h 30 min); never two durations compared')],
    verdict='partial',
    missing='comparing two durations: which takes longer (a film of 1 hour or a walk of 20 minutes; two start and end times)',
    build=['time_units', 'compare_durations'],
    closes={'time_units': 'which of two activities takes longer, from a sense of hours, minutes and seconds (a film or a walk)',
            'compare_durations': 'two durations found from their start and end times and compared: which took longer'},
    pre=[('measurement:time_half_hour', {}, 'Y2.B9.S1', 'telling the time to the hour and half hour'),
         ('measurement:time_5min', {}, 'Y2.B9.S5', 'telling the time to 5 minutes'),
         ('measurement:time_quarter', {}, 'Y2.B9.S2', 'quarter past and quarter to')],
    related=[('measurement:elapsed_hour', {}, 'a time on a time line 1, 2 or 3 hours later or earlier than a start time')],
    note='Support lesson (source Grade 1, Time, Y2 Summer), judged at Grade 1 (WRM Year 2). The site tags 3.MD.A.1 (Grade 3); at the source grade '
         'the durations are whole and half hours.',
    search='Searched for an item that compares two durations: elapsed_visual_easy / medium / hard (one duration), elapsed_find_duration (one duration), '
           'elapsed_hour, elapsed_30min, elapsed_15min (a later or earlier time), order_clocks_* (orders times, not durations), time_sense (a.m. / p.m.). '
           'None compares two durations; time_units (Y4\'s own, WRM_PROPOSALS "Hours, Minutes or Seconds?", with its longer / shorter option) closes '
           'the sense of which activity is longer, and compare_durations (new) the comparison of two durations read from clocks.')

lesson(G + 'comparingmultiplicationstatements',
    verdict='gap',
    missing='comparing two multiplication statements with <, > or = by reasoning (4 × 5 ○ 4 × 6; 3 × 8 ○ 8 × 3; 5 × 4 ○ 2 × 10)',
    build=['compare_sentences'],
    pre=[('multiplication:mult_facts', {'constant': [4]}, 'Y3.B3.S11', 'the 4 times-table facts'),
         ('multiplication:mult_facts', {'constant': [8]}, 'Y3.B3.S14', 'the 8 times-table facts'),
         ('placevalue:compare', {'band': 99}, 'Y2.B1.S13', 'comparing two numbers with <, > or =')],
    related=[('multiplication:mult_properties', {'forms': [0]}, 'an array and its turn give the same product (3 × 4 = 4 × 3): one statement that is equal')],
    note='Support lesson (source Grade 2, Multiplication and Division B, Y3 Spring), judged at Grade 2 (WRM Year 3).',
    search='Searched for an item that compares two products with <, > or =: order_of_operations:compare_expressions forms 0 / 1 (mixes + with × and ÷ '
           'under the order of operations, above Grade 2), placevalue:compare (two numbers), addition:equal_sign (true / false + facts), '
           'algebra:balance_addsub (+ only), multiplication:mult_properties forms 0 (writes the two equal facts of one array, never compares). None '
           'compares two multiplication statements; compare_sentences (WRM_PROPOSALS "Compare Number Sentences") is the build.')

lesson(G + 'countmoneynotesandcoins',
    direct=[('measurement:money_count', {'currency': 'usd', 'kind': 'both'})],
    verdict='full',
    pre=[('measurement:coin_value', {'currency': 'usd'}, 'Y1.B13.S2', 'the value of each coin'),
         ('multiplication:count_by_tables', {'constant': [5]}, 'Y2.B5.S15', 'counting in 5s'),
         ('multiplication:count_by_tables', {'constant': [10]}, 'Y2.B5.S13', 'counting in 10s')],
    related=[('measurement:money_compare', {}, 'which of two sets of coins is worth more')],
    note='Support lesson (source Grade 1, "Prerequisite ladder"), judged at Grade 1 (WRM Year 2), tagged as the Grade 2 lane tagged the same '
         'Support title (Y3.json, G2|-|countmoneynotesandcoins, critic passed). money_count {kind: both} counts the bills, then the coins, and '
         'writes both numbers. The Grade 2 lane\'s pre counted money with the lesson\'s own money_count key; one key, one role here, so the pre are '
         'the coin values and counting in 5s and 10s.')

lesson(G + 'doublesandneardoubleswithin20',
    direct=[('number_sense:doubles_near_doubles', {})],
    verdict='full',
    pre=[('patterns:double', {'band': 20}, 'Y2.B5.S11', 'doubling a number'),
         ('composing:make_ten', {'band': 10}, 'Y2.B2.S1', 'the number bonds to 10'),
         ('counting:count_sequence', {'band': 20, 'dir': 'forward'}, 'Y1.B4.S7', 'one more than a number')],
    related=[('number_sense:make_a_ten', {}, 'another mental strategy for sums within 20: make a ten first')],
    note='Support lesson (source Grade 2, Mental Fluency, committee-authored), judged at Grade 2 (WRM Year 3). doubles_near_doubles deals all '
         'three forms: doubles (6 + 6), doubles plus one (8 + 9) and doubles minus one (8 + 7), sums 2 to 20.')

lesson(G + 'finddurationsoftime',
    direct=[('measurement:elapsed_visual_easy', {})],
    verdict='full',
    pre=[('measurement:time_half_hour', {}, 'Y2.B9.S1', 'telling the time to the hour and half hour'),
         ('measurement:time_5min', {}, 'Y2.B9.S5', 'telling the time to 5 minutes'),
         ('measurement:time_quarter', {}, 'Y2.B9.S2', 'quarter past and quarter to')],
    related=[('measurement:elapsed_30min', {}, 'the time 30 minutes later or earlier')],
    note='Support lesson (source Grade 1, Time, Y2 Summer), judged at Grade 1 (WRM Year 2). elapsed_visual_easy shows two clocks and a time line and '
         'the pupil writes how long it takes, in whole and half hours (0 h 30 min to 3 h 0 min).')

lesson(G + 'introducecapacityandvolume',
    verdict='gap',
    missing='capacity and volume words (full, empty, half full) and comparing how much two containers hold or how much water is in them (holds more, holds less)',
    build=['capacity_early'],
    pre=[('comparing:compare_objects', {'task': 'all', 'dir': 'mixed'}, 'R.B2.S1', 'comparing two objects by size: longer, taller, shorter'),
         ('measurement:heavier_lighter_visual', {}, 'R.B2.S2', 'comparing two objects by mass: heavier and lighter'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'more, fewer and the same')],
    related=[],
    note='Support lesson (source Kindergarten, Mass and Volume, Y1 Spring), judged at Kindergarten (WRM Year 1). No related: the only capacity skills '
         '(measurement:capacity, mass_volume_liquid) convert or read litres and millilitres, above Kindergarten.',
    search='Searched for an item about full, empty or holds more: measurement:capacity units 0 / 1 forms 0 / 1 (customary or metric units: convert, click '
           'containers above 1 L), mass_volume_liquid forms 0 (read mL), comparing:compare_objects tasks length / height / thickness (no capacity), '
           'heavier_lighter_visual (mass). None deals capacity at Kindergarten; capacity_early (WRM_PROPOSALS "Full, Empty, Holds More") is the build.')

lesson(G + 'introduceweightandmass',
    partial=[('measurement:heavier_lighter_visual', {}, 'picks the heavier or the lighter of 2 or 3 pictured objects by what they are; never a balance and never "as heavy as"')],
    verdict='partial',
    missing='describing weight as a thing to measure about an object (how heavy it is, beside how long and how much it holds: K.MD.A.1), and comparing two objects on a pan balance: the lower pan holds the heavier object, a level balance means the same mass',
    build=['measurable_attributes', 'balance'],
    closes={'measurable_attributes': 'describing weight as one of the measurable attributes of an object (how heavy, how long, how much it holds; K.MD.A.1)',
            'balance': 'comparing two objects on a pan balance: the lower pan holds the heavier object, a level balance means the same mass'},
    pre=[('comparing:compare_objects', {'task': 'all', 'dir': 'mixed'}, 'R.B2.S1', 'comparing two objects by size: longer, taller, shorter'),
         ('comparing:compare_groups', {'band': 5, 'level': [1]}, 'R.B1.S7', 'more, fewer and the same'),
         ('comparing:classify_count', {'band': 3, 'tiles': 2, 'objects': 'pictures'}, 'R.B1.S4', 'picking out every object of one kind among others')],
    related=[],
    note='Support lesson (source Kindergarten, Mass and Volume, Y1 Spring), judged at Kindergarten (WRM Year 1). The WRM step Y1.B8.S1 "Heavier and '
         'lighter" is FULL on the same heavier_lighter_visual (Y1 lane); this title introduces weight as an attribute, and the site tags K.MD.A.1 '
         '("describe several measurable attributes of a single object"), which no item deals, so the lesson is partial. Y1.B8.S1 and R.B8.S1 use the '
         'lesson\'s own key, so they are not listed as pre. No related: the other mass skill (mass_volume_liquid) reads grams and kilograms on a '
         'scale, above Kindergarten.',
    search='Searched for a balance, an equal-mass item and an item naming what can be measured about one object: heavier_lighter_visual forms 0 / 1 (heavier, '
           'lighter, pictures only), mass_volume_liquid forms 1 (a g or kg scale), comparing:compare_objects (length, height, thickness of two objects). None '
           'draws a balance or names the attributes of one object; balance (WRM_PROPOSALS "Balanced or Not?") and measurable_attributes '
           '(STANDARD_PROPOSALS "What Can We Measure?") are the builds.')

lesson(G + 'orderfractions',
    partial=[('fractions:order_fractions', {}, 'orders three to six fractions, most with unlike denominators (1/3, 1/2, 3/4; 1/6, 2/5, 1/2, 2/3), some shown in larger terms (2/12 for 1/6); a page of unit fractions or of one denominator only is not dealt')],
    verdict='partial',
    missing='ordering unit fractions, or fractions with the same denominator, only',
    build=['frac_compare_same_part'],
    pre=[('fractions:identify', {'forms': [1]}, 'Y3.B6.S1', 'picking the model that shows a fraction'),
         ('fractions:shade_fraction', {}, 'Y3.B6.S3', 'shading the numerator of a fraction on a model'),
         ('composing:compose_whole', {}, 'Y3.B6.S4', 'making 1 whole from smaller pieces')],
    related=[('composing:fraction_number_line', {}, 'placing a fraction on a number line')],
    note='Support lesson (source Grade 2, Fractions B, Y3 Summer), judged at Grade 2 (WRM Year 3), as the Grade 4 lane judged its "Order fractions" '
         '(Y5.json, partial, frac_compare_same_part). Its pre compare or order no unlike fractions.',
    search='Searched for ordering unit fractions or one denominator: fractions:order_fractions forms 0-2 (unlike denominators mixed in), order_frac_numline, '
           'fractions:compare denoms 2 / 3 forms 0-2 (two fractions, not an order), compare_frac_lcd (above Grade 2). None orders same-denominator or '
           'unit fractions only; frac_compare_same_part (Y5.json, passed lane) is the build.')

lesson(G + 'poundstensonesandpenceusdollarscents',
    partial=[('measurement:money_notation', {'currency': 'usd'}, 'writes an amount under $10 from $5 and $1 bills and coins with $ and the point ($8.05); never a $10 bill and never the amount split into tens, ones, dimes and pennies')],
    verdict='partial',
    missing='the place value of money: an amount to $99.99 read as tens and ones of dollars and dimes and pennies of cents ($24.53 = 2 tens, 4 ones, 5 dimes, 3 pennies)',
    build=['money_place_value'],
    pre=[('measurement:money_count', {'currency': 'usd', 'kind': 'both'}, 'Y3.B9.S1', 'counting bills and coins'),
         ('placevalue:identify', {'band': 999}, 'Y3.B1.S8', 'hundreds, tens and ones in a place-value chart'),
         ('measurement:coin_value', {'currency': 'usd'}, 'Y1.B13.S2', 'the value of each coin')],
    related=[('measurement:money_compare', {'response': 'sign'}, 'which of two amounts is more, written with < or >')],
    note='Native lesson (site flag native), the pacing\'s retitled Y4.B10.S1 "Write money using decimals" (school week W37), 2.MD.C.8. '
         'money_notation is FULL at Y4.B10.S1 (write the amount with the point); this title asks for the place value of the amount.',
    search='Searched for a money place-value item: money_notation tasks collection / words (amounts under $10, no chart), money_count kinds like / two / '
           'mixed / note / both (counts), coin_value, money_compare, money_convert (Y4\'s own option: cents to dollars; its spec plans a place chart $ | ¢, no tens of dollars), VISUAL_BUILDS vis_coin_options (a coin chart £1 / 10p / 1p, no tens of dollars), placevalue:identify (whole '
           'numbers). None splits an amount into tens, ones, dimes and pennies; money_place_value is new.')

lesson(G + 'selectmoney',
    partial=[('measurement:make_change_least_coins', {'currency': 'usd'}, 'chooses the fewest coins for an amount to 50 cents and writes how many of each; never chooses bills, and never any set that makes the amount')],
    verdict='partial',
    missing='choosing bills and coins to make an amount in dollars and cents, any way that works ($35 = $20 + $10 + $5)',
    build=['make_amount_notes'],
    pre=[('measurement:money_count', {'currency': 'usd', 'kind': 'both'}, 'Y2.B4.S3', 'counting bills and coins'),
         ('measurement:coin_value', {'currency': 'usd'}, 'Y1.B13.S2', 'the value of each coin'),
         ('measurement:equiv_coin_sets', {'currency': 'usd'}, 'Y2.B4.S5', 'checking that a set of coins makes the amount')],
    related=[('measurement:money_compare', {}, 'which set has more money')],
    note='Support lesson (source Grade 1, "Prerequisite ladder"), judged at Grade 1 (WRM Year 2), tagged as the Grade 2 lane tagged the same Support '
         'title (Y3.json, G2|-|selectmoney, critic passed); nearest WRM step Y2.B4.S4 Choose notes and coins.',
    search='Searched for choosing bills and coins to make an amount: make_change_least_coins (coins only, the fewest), equiv_coin_sets (checks a given set), '
           'money_count (counts), money (adds), enough_money (is there enough?). None chooses bills and coins any way; make_amount_notes (Y3.json, passed '
           'lane) is the build.')

lesson(G + 'sharingandgroupingfairshares',
    partial=[('division:share_into_groups', {'band': 12}, 'grouping only: 8 to 12 counters put into groups of 3, 4, 5 or 6, and the pupil says how many groups; never shares into a given number of groups and never an amount that does not share fairly')],
    verdict='partial',
    missing='sharing a small amount equally between 2, 3 or 4 (one for you, one for me), and telling a fair share from an unfair one (odd amounts that do not share)',
    build=['share_group'],
    pre=[('patterns:double', {'band': 20}, 'R.B11.S12', 'doubling a number: two equal bars'),
         ('composing:number_bonds', {'band': 10}, 'R.B11.S7', 'a number to 10 made of two parts'),
         ('counting:count_objects', {'band': 10, 'objects': 'frame'}, 'R.B11.S1', 'counting a group of objects to 10')],
    related=[('composing:odd_even', {'forms': [2], '@max': 10}, 'telling an odd number from an even number to 10')],
    note='Support lesson from "Find My Pattern" (Phase 10, from R.B16), judged at Reception: the content of R.B16 "Sharing and grouping", whose steps '
         'use the lesson\'s own share_into_groups key. The site tags 3.OA.A.2 (Grade 3 division); at the source year it is fair sharing and '
         'grouping of small amounts.',
    search='Searched for sharing into a given number of groups and for fair / unfair shares: division:share_into_groups band 12 / 24 (grouping only), '
           'div_word_problems (written ÷ stories, above Reception), fractions:fraction_of_set (fractions), composing:odd_even (odd / even numbers). None '
           'shares into a given number of groups at Reception; share_group (WRM_PROPOSALS "Share and Make Groups") is the build.')
