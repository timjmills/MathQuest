// search-terms.js — the skill-search thesaurus and ranking engine (owner request 2026-10-03:
// "list all the ways someone could search for it and make sure they are tagged with all of them").
//
// PURE DATA + PURE FUNCTIONS. No DOM, no window, no state, no imports. skill-finder.js joins this to
// SKILLS, the standards and the WRM steps and is what every search box calls.
//
//   CONCEPTS        concept id -> every word a teacher, pupil or parent might type for it
//                   (word forms, symbols, UK/US terms, common phrasings)
//   CONCEPT_RULES   the mapping table: a regex over 'category:skillId label' -> the concepts it teaches
//   SKILL_TERMS     hand-written extra terms per 'category:skillId' (vague labels, exemplar skills)
//   MISSPELLINGS    common misspellings -> the word meant (query side; edit-distance fuzz backs it up)
//
// A NEW SKILL must get search terms here in the same change (a CONCEPT_RULES hit and, if its label
// is vague, a SKILL_TERMS entry). `node tests/scripts/ws-search-terms.cjs` is the gate.
//
// Ranking (searchIndex): exact label match > label word > hand-written term > concept term >
// standards / WRM / grade code > fuzzy or misspelt word. Every query word must match somewhere.
// An unknown word is rewritten to its nearest vocabulary word first. Equal scores are broken by how
// many query words hit the LABEL, then the skill's family, and only then by catalogue order.

/* ================================================================= concepts */

export const CONCEPTS = {
    addition: ['add', 'adding', 'addition', 'added', 'adds', 'plus', '+', 'sum', 'sums', 'total', 'totals', 'altogether', 'in all',
        'combine', 'combining', 'join', 'joining', 'put together', 'how many altogether', 'and makes', 'increase'],
    subtraction: ['subtract', 'subtracting', 'subtraction', 'subtracted', 'minus', 'take away', 'takeaway', 'taking away', 'take from',
        'difference', 'differences', 'how many left', 'left over', 'remove', 'decrease'],
    regroup_add: ['regroup', 'regrouping', 'with regrouping', 'carry', 'carrying', 'carry over', 'carry the one', 'exchange',
        'exchanging', 'renaming', 'rename', 'bridging ten', 'bridge ten', 'crossing ten', 'cross the tens', 'trading', 'make a ten'],
    regroup_sub: ['regroup', 'regrouping', 'with regrouping', 'borrow', 'borrowing', 'exchange', 'exchanging', 'renaming', 'rename',
        'trading', 'decompose a ten', 'break a ten', 'bridging ten', 'crossing ten'],
    no_regroup: ['no regrouping', 'without regrouping', 'no carrying', 'without carrying', 'no borrowing', 'without borrowing',
        'no exchange', 'no exchanging', 'no renaming', 'simple'],
    // the written column method; the operation word lives in column_add / column_sub / column_mult only, so
    // 'column subtraction' never reaches an addition skill (critic r1 P2)
    column: ['column', 'columns', 'column method', 'vertical', 'stacked', 'line up',
        'standard algorithm', 'written method', 'formal method', 'formal written method', 'algorithm'],
    column_add: ['column addition', 'vertical addition', 'written addition', 'standard algorithm addition'],
    column_sub: ['column subtraction', 'vertical subtraction', 'written subtraction', 'standard algorithm subtraction'],
    column_mult: ['column multiplication', 'short multiplication', 'long multiplication', 'standard algorithm',
        'standard algorithm multiplication', 'formal written method', 'written method', 'written multiplication',
        'vertical multiplication', 'column method', 'column', 'columns', '2 digit by 1 digit', '2 digit by 2 digit',
        'multiply by 1 digit', 'multiply by 2 digit', 'multi digit multiplication'],
    subitizing: ['subitizing', 'subitising', 'subitize', 'subitise', 'quick look', 'quick images', 'dot patterns', 'dot pattern',
        'dice patterns', 'how many without counting'],
    multiplication: ['multiply', 'multiplying', 'multiplication', 'multiplied', 'multiplied by', 'times', 'x', '×', 'product', 'products',
        'lots of', 'groups of', 'sets of', 'rows of', 'repeated addition'],
    times_tables: ['times tables', 'times table', 'timestables', 'tables', 'multiplication tables', 'multiplication table',
        'multiplication facts', 'times facts', '2 times table', '5 times table', '10 times table', '12 times table'],
    division: ['divide', 'dividing', 'division', 'divided', 'divided by', '÷', '/', 'share', 'sharing', 'share equally', 'shared',
        'equal shares', 'quotient', 'quotients', 'divisor', 'dividend', 'grouping', 'how many groups', 'split'],
    remainder: ['remainder', 'remainders', 'r', 'left over', 'leftover', 'leftovers', 'not exact'],
    long_division: ['long division', 'short division', 'bus stop', 'bus stop method', 'chunking', 'partial quotients', 'box method',
        'standard algorithm'],
    area_model: ['area model', 'box method', 'grid method', 'partial products', 'long multiplication', 'distributive', 'break apart'],
    facts: ['facts', 'number facts', 'basic facts', 'fact fluency', 'fluency', 'mental math', 'mental maths', 'recall', 'quick recall',
        'drill', 'speed', 'math facts', 'maths facts', 'flash cards'],
    word_problems: ['word problems', 'word problem', 'story problems', 'story problem', 'worded problems', 'problem solving', 'real life',
        'in context', 'stories', 'reasoning'],
    fact_family: ['fact family', 'fact families', 'related facts', 'inverse', 'inverse operations', 'number family', 'number families',
        'fact triangle', 'part whole', 'turn around facts'],
    number_bonds: ['number bonds', 'number bond', 'bonds', 'bonds to 10', 'bonds to ten', 'number pairs', 'pairs to 10', 'part whole',
        'part part whole', 'partition', 'partitioning', 'decompose', 'compose', 'cherry model', 'make 10', 'ways to make'],
    ten_frame: ['ten frame', 'ten frames', 'tens frame', '10 frame', 'five frame', 'tenframe', 'counters'],
    counting: ['count', 'counting', 'counts', 'how many', 'count objects', 'one to one', 'cardinality', 'counting on', 'count on',
        'numbers to 20', 'number recognition', 'numerals'],
    number_sequence: ['next number', 'number after', 'number before', 'one more', 'one less', 'before and after', 'missing number',
        'number order', 'counting sequence', 'count forwards', 'count backwards'],
    skip_count: ['skip counting', 'skip count', 'skipcounting', 'skip', 'count by', 'counting by', 'count in', 'counting in',
        'counting in 2s', 'counting in 5s', 'counting in 10s', 'count by 2s', 'count by 5s', 'count by 10s', 'multiples',
        'step counting', 'counting in steps', 'counting in multiples', 'number pattern'],
    odd_even: ['odd', 'even', 'odd and even', 'odd or even', 'odd numbers', 'even numbers', 'evens', 'odds', 'pairs'],
    place_value: ['place value', 'placevalue', 'pv', 'tens and ones', 'ones', 'units', 'tens', 'hundreds', 'thousands', 'digit', 'digits',
        'value of a digit', 'place value chart', 'place value counters', 'place value disks', 'partition', 'partitioning', 'base ten'],
    base10: ['base ten', 'base 10', 'base ten blocks', 'base 10 blocks', 'dienes', 'flats', 'rods', 'longs', 'cubes', 'mab',
        'tens and ones', 'place value blocks'],
    hundred_chart: ['hundred square', 'hundreds square', '100 square', 'hundreds chart', 'hundred chart', '100 chart', 'number grid',
        'number square', 'number chart', '120 chart', '1000 chart'],
    number_line: ['number line', 'number lines', 'numberline', 'number track', 'jumps', 'hops', 'empty number line', 'open number line'],
    compare: ['compare', 'comparing', 'comparison', 'greater than', 'less than', 'more than', 'fewer than', 'greater', 'bigger', 'smaller',
        'larger', 'more', 'fewer', 'same', 'equal', '>', '<', '=', 'inequality symbols', 'alligator', 'crocodile'],
    ordering: ['order', 'ordering', 'least to greatest', 'greatest to least', 'smallest to largest', 'largest to smallest',
        'ascending', 'descending', 'sort', 'put in order'],
    rounding: ['round', 'rounding', 'round off', 'nearest', 'round to the nearest', 'nearest 10', 'nearest ten', 'nearest 100',
        'nearest hundred', 'approximate', 'roundup'],
    estimate: ['estimate', 'estimating', 'estimation', 'estimates', 'approximate', 'approximately', 'about', 'roughly',
        'reasonableness', 'check with rounding'],
    strategies: ['mental strategies', 'strategy', 'strategies', 'mental math', 'mental maths', 'doubles', 'near doubles', 'make a ten',
        'compensation', 'bridging', 'bridging ten'],
    doubling: ['double', 'doubles', 'doubling', 'twice', 'times 2', 'half', 'halves', 'halving', 'halve'],
    fractions: ['fraction', 'fractions', 'frac', 'numerator', 'denominator', 'part of a whole', 'parts of a whole', 'half', 'halves',
        'quarter', 'quarters', 'fourth', 'fourths', 'third', 'thirds', 'fifths', 'sixths', 'eighths', 'tenths', 'unit fraction',
        'unit fractions', 'equal parts', '1/2', '1/4'],
    equivalent_fractions: ['equivalent fractions', 'equivalent', 'equivalence', 'equal fractions', 'same value', 'fraction wall',
        'fraction strips'],
    simplify: ['simplify', 'simplifying', 'simplest form', 'lowest terms', 'reduce', 'reducing', 'cancel', 'cancelling'],
    mixed_numbers: ['mixed number', 'mixed numbers', 'improper fraction', 'improper fractions', 'improper', 'top heavy',
        'top heavy fractions', 'whole and a part'],
    fraction_ops: ['fraction operations', 'operations with fractions', 'fraction calculations', 'denominators'],
    decimals: ['decimal', 'decimals', 'decimal point', 'point', 'tenths', 'hundredths', 'thousandths', 'decimal places', 'dp'],
    percent: ['percent', 'percents', 'percentage', 'percentages', 'per cent', '%', 'out of 100', 'hundred grid'],
    fdp: ['fractions decimals percents', 'fractions decimals and percentages', 'fdp', 'convert', 'converting', 'conversion',
        'equivalent forms'],
    ratio: ['ratio', 'ratios', 'rate', 'rates', 'unit rate', 'proportion', 'proportional', 'per', 'colon', 'double number line',
        'ratio table', 'scaling'],
    integers: ['integer', 'integers', 'negative numbers', 'negative', 'negatives', 'positive and negative', 'below zero',
        'minus numbers', 'opposites', 'absolute value', 'signed numbers'],
    time: ['time', 'telling time', 'tell the time', 'telling the time', 'tell time', 'clock', 'clocks', 'analog', 'analogue',
        'digital', 'oclock', "o'clock", 'hour', 'hours', 'minute', 'minutes', 'half past', 'quarter past', 'quarter to',
        'clock face', 'hands', 'hour hand', 'minute hand'],
    time_hour: ["o'clock", 'oclock', 'o clock', 'on the hour', 'whole hour', 'hour hand'],
    time_half: ['half past', 'half hour', 'half an hour', 'thirty', '30 minutes', ':30'],
    time_quarter: ['quarter past', 'quarter to', 'quarter hour', 'quarter of an hour', '15 minutes', 'fifteen minutes'],
    time_minutes: ['5 minutes', 'five minutes', 'minutes past', 'minutes to', 'to the minute', 'nearest minute', 'count by 5s'],
    elapsed: ['elapsed time', 'elapsed', 'how long', 'later', 'earlier', 'duration', 'time difference', 'start time', 'end time',
        'time intervals', 'after', 'before'],
    money: ['money', 'coins', 'coin', 'cents', 'cent', 'pence', 'penny', 'pennies', 'nickel', 'nickels', 'dime', 'dimes',
        'quarters', 'dollar', 'dollars', 'pounds', 'notes', 'bills', 'change', 'price', 'prices', 'cost', 'shopping', 'spend',
        'buy', '£', '$', '¢'],
    length: ['length', 'lengths', 'measure', 'measuring', 'measurement', 'long', 'longer', 'shorter', 'tall', 'taller', 'height',
        'ruler', 'rulers', 'cm', 'centimetre', 'centimetres', 'centimeter', 'centimeters', 'metre', 'meter', 'metres', 'meters',
        'inch', 'inches', 'foot', 'feet', 'yard', 'yards', 'mm', 'km'],
    mass: ['mass', 'weight', 'weigh', 'weighing', 'heavy', 'heavier', 'light', 'lighter', 'grams', 'gram', 'kilograms', 'kilogram',
        'kg', 'g', 'scales', 'balance scales', 'pounds', 'ounces'],
    capacity: ['capacity', 'volume', 'liquid', 'litres', 'liters', 'litre', 'liter', 'millilitres', 'milliliters', 'ml', 'cups',
        'pints', 'quarts', 'gallons', 'jug'],
    temperature: ['temperature', 'thermometer', 'degrees', 'celsius', 'fahrenheit', 'hot', 'cold', 'warm'],
    units: ['convert', 'converting', 'conversion', 'conversions', 'unit conversion', 'change units', 'metric', 'customary',
        'imperial', 'units of measure'],
    shapes_2d: ['2d shapes', '2d', '2 d', 'two dimensional', 'flat shapes', 'plane shapes', 'shapes', 'shape', 'polygon',
        'polygons', 'circle', 'square', 'triangle', 'rectangle', 'hexagon', 'pentagon', 'octagon', 'oval', 'rhombus',
        'sides', 'corners', 'vertices', 'shape names', 'name shapes'],
    shapes_3d: ['3d shapes', '3d', '3 d', 'three dimensional', 'solid shapes', 'solids', 'shapes', 'shape', 'cube', 'cuboid',
        'sphere', 'cone', 'cylinder', 'pyramid', 'prism', 'faces', 'edges', 'vertices', 'rectangular prism'],
    quadrilaterals: ['quadrilateral', 'quadrilaterals', 'square', 'rectangle', 'rhombus', 'trapezoid', 'trapezium', 'parallelogram',
        'kite', 'four sided'],
    triangles: ['triangle', 'triangles', 'equilateral', 'isosceles', 'scalene', 'right triangle', 'right angled triangle'],
    perimeter: ['perimeter', 'perimiter', 'parimeter', 'distance around', 'around the outside', 'border', 'fence', 'edge length'],
    area: ['area', 'square units', 'squares', 'cover', 'covers', 'surface', 'inside', 'square centimetres', 'square cm',
        'length times width', 'l x w'],
    volume: ['volume', 'cubic units', 'cubes', 'cubic', 'rectangular prism', 'cuboid', 'box', 'l x w x h'],
    angles: ['angle', 'angles', 'degrees', 'protractor', 'right angle', 'acute', 'obtuse', 'straight angle', 'reflex', 'turn',
        'turns', 'measure angles'],
    lines: ['lines', 'line', 'parallel', 'perpendicular', 'line segment', 'segment', 'ray', 'rays', 'intersecting'],
    symmetry: ['symmetry', 'symmetrical', 'symmetric', 'line of symmetry', 'lines of symmetry', 'mirror line', 'mirror',
        'reflective symmetry', 'fold'],
    coordinates: ['coordinates', 'coordinate', 'coordinate grid', 'coordinate plane', 'ordered pairs', 'ordered pair',
        'x axis', 'y axis', 'axes', 'plot points', 'plotting points', 'quadrant', 'quadrants', 'graphing', 'grid'],
    transformations: ['transformation', 'transformations', 'reflection', 'reflect', 'flip', 'rotation', 'rotate', 'turn',
        'translation', 'translate', 'slide', 'move'],
    graphs: ['graph', 'graphs', 'chart', 'charts', 'data', 'data handling', 'statistics', 'stats', 'interpret data', 'read a graph',
        'reading graphs', 'key', 'scale'],
    bar_graph: ['bar graph', 'bar graphs', 'bar chart', 'bar charts', 'column graph', 'block graph', 'block diagram'],
    pictogram: ['pictogram', 'pictograms', 'pictograph', 'pictographs', 'picture graph', 'picture graphs', 'picture chart', 'symbols'],
    tally: ['tally', 'tallies', 'tally chart', 'tally charts', 'tally marks', 'frequency table', 'frequency'],
    line_plot: ['line plot', 'line plots', 'dot plot', 'dot plots'],
    pie_chart: ['pie chart', 'pie charts', 'circle graph', 'pie graph'],
    statistics: ['statistics', 'stats', 'average', 'averages', 'mean', 'median', 'mode', 'range', 'middle', 'most common', 'spread',
        'variability', 'data set', 'central tendency'],
    probability: ['probability', 'chance', 'likely', 'unlikely', 'certain', 'impossible', 'spinner', 'dice', 'odds', 'outcomes'],
    patterns: ['pattern', 'patterns', 'sequence', 'sequences', 'rule', 'rules', 'next term', 'repeating pattern', 'growing pattern',
        'term', 'terms', 'what comes next'],
    algebra: ['algebra', 'algebraic', 'equation', 'equations', 'unknown', 'unknowns', 'variable', 'variables', 'solve', 'solving',
        'missing number', 'letter', 'expression', 'expressions'],
    order_of_operations: ['order of operations', 'bodmas', 'bidmas', 'pemdas', 'gemdas', 'brackets', 'parentheses', 'exponents',
        'indices', 'powers', 'which first'],
    number_theory: ['factor', 'factors', 'multiple', 'multiples', 'prime', 'primes', 'prime numbers', 'composite', 'gcf', 'hcf', 'gcd',
        'greatest common factor', 'highest common factor', 'lcm', 'least common multiple', 'lowest common multiple', 'divisibility',
        'divisible', 'factor pairs'],
    balance: ['balance', 'balancing', 'equal sign', 'equals', 'equals sign', '=', 'true or false', 'true false', 'same as',
        'equivalent equations', 'both sides'],
    missing_number: ['missing number', 'missing numbers', 'missing', 'unknown', 'fill in', 'blank', 'blanks', 'find the missing',
        'missing addend', 'missing factor'],
    number_words: ['number words', 'word form', 'words', 'written numbers', 'number names', 'spell numbers', 'spelling numbers',
        'numbers in words', 'write in words', 'numeral'],
    expanded_form: ['expanded form', 'expanded notation', 'expand', 'partition', 'partitioning', 'standard form', 'unit form',
        'write the number'],
    vocabulary: ['vocabulary', 'vocab', 'words', 'definitions', 'key words', 'keywords', 'glossary', 'terms', 'word wall',
        'math words', 'maths words', 'matching'],
    bar_model: ['bar model', 'bar models', 'tape diagram', 'tape diagrams', 'strip diagram', 'singapore', 'part whole model',
        'model drawing'],
    inverse_check: ['inverse', 'inverse operation', 'check', 'checking', 'check your answer'],
    arrays: ['array', 'arrays', 'rows and columns', 'rows', 'equal groups', 'groups of', 'repeated addition', 'unequal groups'],
    partition_shapes: ['halves', 'thirds', 'fourths', 'quarters', 'equal parts', 'equal shares', 'partition shapes', 'cut in half'],
    compare_attributes: ['longer', 'shorter', 'taller', 'bigger', 'smaller', 'heavier', 'lighter', 'compare length',
        'compare size', 'measurable attributes'],
    sorting: ['sort', 'sorting', 'classify', 'classifying', 'classification', 'group', 'categories', 'venn', 'carroll'],
    position: ['position', 'positional language', 'position and direction', 'direction', 'directions', 'left', 'right', 'above', 'below', 'beside', 'next to', 'in front', 'behind', 'under', 'over'],
    composing_shapes: ['compose shapes', 'combine shapes', 'put shapes together', 'pattern blocks', 'tangrams', 'make a shape'],
    mixed_review: ['mixed', 'mixed review', 'review', 'revision', 'all', 'everything', 'assessment', 'test prep', 'spiral review'],
    exponents: ['exponent', 'exponents', 'powers', 'squared', 'cubed', 'indices', 'index'],
    teen_numbers: ['teen numbers', 'teens', 'teen', '11 to 19', 'ten and some ones', '10 and ones'],
    visual: ['pictures', 'visual', 'with pictures', 'picture', 'visuals', 'model'],
};

/* ================================================================= the mapping table */

// Each rule is [regex over `${categoryId}:${skillId}`, [concept ids]] — the SKILL ID, never the label
// (critic r1 P1: 'multiples' in the label "Multiply by 10, 100 and Multiples of Ten" gave mult_zeros
// skip counting and primes). A rule that must read the label says so: [re, [...], { label: true }]
// and then tests `${categoryId}:${skillId} ${label}`. Every rule that matches adds its concepts.
// Checked by hand family by family (see the gate's per-family dump).
export const CONCEPT_RULES = [
    // ---- operations
    [/^addition:/, ['addition']],
    [/^subtraction:(?!mixed_add_sub)/, ['subtraction']],
    [/^subtraction:mixed_add_sub|^addition:(add_sub|number_families|fact_family|comparison_word|equal_sign)|missing_add_sub/, ['addition', 'subtraction']],
    [/^addition:add_\d+[km]?_regroup|^addition:.*bridging ten|^addition:add_column|add_missing_digit/, ['regroup_add', 'column', 'column_add'], { label: true }],
    [/^subtraction:sub_\d+[km]?_regroup|across_zeros|sub_missing_digit/, ['regroup_sub', 'column', 'column_sub']],
    [/no_regroup/, ['no_regroup', 'column']],
    [/^(addition|subtraction):(add|sub)_(1k|10k|100k|1m|100|50)_/, ['column']],
    [/^addition:(add_\w*no_regroup|add_(1k|10k|100k|1m|100|50)_)/, ['column_add']],
    [/^subtraction:(sub_\w*no_regroup|sub_(1k|10k|100k|1m|100|50)_)/, ['column_sub']],
    [/^multiplication:(mult_placeholder_zero|mult_missing_digit|multiply)$/, ['column_mult']],
    [/^counting:count_objects$|^composing:ten_frame_build$|^comparing:compare_groups$/, ['subitizing']],
    [/_mixed\b.*within|add_\d+k?m?_mixed|sub_\d+k?m?_mixed/, ['regroup_add', 'regroup_sub', 'no_regroup']],
    [/(add|sub|mult|div)_facts/, ['facts']],
    [/^multiplication:/, ['multiplication']],
    [/^division:/, ['division']],
    [/mult_facts|mult_chart|count_by_tables|count_by_fill|skip_count_grid/, ['times_tables']],
    [/remainder/, ['remainder']],
    [/long_div|box_division|area_model_div|div_fix_estimate|div_zero_in_quotient/, ['long_division']],
    [/area_model_mult|area_distributive|distributive/, ['area_model']],
    [/word_problems|_wp_|(?<!number)_word|unknown_start|remainder_contexts|remainder_interpret|multi_step|frac_as_div_word|unit_conversion_word|mult_comparison/, ['word_problems']],
    [/fact_family|number_families|fact_family_sort/, ['fact_family']],
    [/number_bonds|make_ten|teen_compose|cloze_addition|compose_whole/, ['number_bonds']],
    [/make_ten|make_a_ten|ten_frame/, ['ten_frame']],
    [/arrays_groups|dot_array|repeated_add|equal_or_unequal|share_into_groups|mult_properties/, ['arrays']],
    [/check_by|sub_check|div_check/, ['inverse_check']],
    [/missing|cloze|which_sign|missing_factor/, ['missing_number'], { label: true }],
    [/number_ops_mixed:/, ['addition', 'subtraction', 'multiplication', 'division', 'mixed_review']],
    [/mixed_mult_div/, ['multiplication', 'division']],
    [/integers:/, ['integers']],
    [/add_int/, ['addition']], [/sub_int/, ['subtraction']],
    [/compare_int|order_negatives|ordering_rationals/, ['compare', 'ordering']],
    [/number_line|nl_|_nl|numline|rounding_visual|between_tens|double_num_line/, ['number_line']],
    // ---- counting & early number
    [/^counting:|^counting_mixed:|count_objects|classify_count/, ['counting']],
    [/count_sequence|number_seq_fill|number_chart_fill|hundreds_chart_fill|more_less_10/, ['number_sequence']],
    [/hundreds_chart|number_chart_fill|number_seq_fill|skip_count_grid|count_by_step|count_by_powers/, ['hundred_chart']],
    [/^comparing:/, ['compare']],
    [/compare_objects|order_objects_length|heavier_lighter/, ['compare_attributes']],
    [/classify_count|divisibility_sort|compose_from_attributes|shape_attributes/, ['sorting']],
    [/teen_compose|ten_frame_build_teen/, ['teen_numbers']],
    [/tens_foundation|base10|place_value_disks|pv_disks|unit_form/, ['place_value', 'base10']],
    [/odd_even|select_even_odd/, ['odd_even']],
    [/number_word_form|number_word_names/, ['number_words']],
    // ---- skip counting & patterns
    [/seq_\d|count_by|skip_count|time_fives_ring|:multiples$/, ['skip_count']],
    [/^patterns:|pattern/, ['patterns']],
    [/patterns:double|patterns:halve|doubles_near/, ['doubling']],
    // ---- place value & number sense
    [/^placevalue:/, ['place_value']],
    [/placevalue:compare|compare_decimal|compare_thousandths|order_least|order_greatest|placevalue:order/, ['compare', 'ordering']],
    [/placevalue:expand|placevalue:combine|unit_form/, ['expanded_form']],
    [/place_value_10x|mult_zeros/, ['place_value']],
    [/round|nearest_/, ['rounding']],
    [/estimate/, ['estimate'], { label: true }],
    [/make_a_ten|doubles_near|compensation/, ['strategies']],
    [/make_a_ten/, ['regroup_add']],
    // ---- fractions, decimals, percents
    [/^fractions:|^fraction_operations:|fraction_number_line|whole_as_fraction|compose_whole|line_plot_fractions|partition_shapes|benchmark/, ['fractions']],
    [/equiv_frac|select_equiv|fractions:equivalent|frac_10_100/, ['equivalent_fractions']],
    [/simplify/, ['simplify']],
    [/improper|mixed_like|mixed_unlike|mixed_nl_drag|round_fractions|mixed_improper/, ['mixed_numbers']],
    [/^fraction_operations:/, ['fraction_ops']],
    [/add_frac|add_mixed|fraction_bar_ops|frac_word_problems|estimate_frac/, ['addition']],
    [/sub_frac|sub_mixed|fraction_bar_ops|frac_word_problems|estimate_frac/, ['subtraction']],
    [/mult_frac|mult_scaling|frac_mult_word/, ['multiplication']],
    [/div_unit_frac|frac_as_div|frac_mult_word/, ['division']],
    [/fractions:compare|compare_frac|order_frac|fractions:order/, ['compare', 'ordering']],
    [/^decimals:|f_to_d|d_to_f|d_to_p|p_to_d|round_decimals|round_thousandths|round_sort_tenths|round_sort_hundredths|frac_10_100/, ['decimals']],
    [/add_decimal/, ['addition']], [/sub_decimal/, ['subtraction']], [/mult_decimal/, ['multiplication']], [/div_decimal/, ['division']],
    [/order_decimals/, ['ordering']],
    [/percent|_to_p|p_to_|pct|fdp/, ['percent']],
    [/^conversions:(f_|d_|p_|order_fdp|mixed)|fdp|conversions_all/, ['fdp']],
    [/(^|[\s_:])ratios?(?![a-z])|unit_rate|double_num_line/, ['ratio'], { label: true }],
    [/partition_shapes/, ['partition_shapes']],
    // ---- geometry
    [/name_2d|shape_name_match_2d|count_sides_vertices_2d|shape_corners|compose_shapes|compose_hexagon|compose_rect|shape_attributes|compose_from_attributes|shape_positions|hotspot_quads|classify_quads|classify_triangles|shape_pattern/, ['shapes_2d']],
    [/name_3d|shape_name_match_3d|edges_faces|net_identify|cross_section|net_surface/, ['shapes_3d']],
    [/quads/, ['quadrilaterals']],
    [/triangle/, ['triangles']],
    [/shape_positions/, ['position']],
    [/compose_shapes|compose_hexagon|compose_rect/, ['composing_shapes']],
    [/:\w*perimeter|coord_polygon|composite_shapes/, ['perimeter']],
    [/composite_shapes|area_polygon_decompose/, ['area', 'shapes_2d']],
    [/:\w*area|net_surface/, ['area']],
    [/:\w*volume(?!_liquid)/, ['volume']],
    [/[\s_:]angles?(?![a-z])|^angles_lines:(identify_angles|measure|additive|mixed)/, ['angles'], { label: true }],
    [/identify_lines|symmetry/, ['lines']],
    [/symmetry/, ['symmetry']],
    [/^coordinates:(coord|mixed)/, ['coordinates']],
    [/geo_reflect|geo_rotate|geo_translate/, ['transformations', 'coordinates']],
    [/mixed_shapes|geometry_all|geo_meas_all/, ['shapes_2d', 'shapes_3d']],
    [/geometry_all|geo_meas_all/, ['angles', 'area', 'perimeter', 'coordinates']],
    // ---- measurement
    [/time_|clock|elapsed|mixed_time/, ['time']],
    [/time_hour/, ['time_hour']],
    [/time_half/, ['time_half']],
    [/time_quarter/, ['time_quarter']],
    [/time_5min|time_1min|time_fives/, ['time_minutes']],
    [/elapsed/, ['elapsed']],
    [/money|coin|enough_money|make_change/, ['money'], { label: true }],
    [/ruler|length|measure_nonstandard|estimate_length|order_objects_length|unit_conversion|measurement_all/, ['length'], { label: true }],
    [/heavier|mass_volume|unit_conversions/, ['mass']],
    [/capacity|mass_volume_liquid/, ['capacity']],
    [/temperature/, ['temperature']],
    [/unit_conversion|length_customary|length_metric|measurement:capacity|mass_volume/, ['units']],
    [/^measurement:mixed_measurement|measurement_all|geo_meas_all/, ['length', 'mass', 'time', 'money']],
    // ---- data
    [/^graphs:|pictograph_intro|bar_graph_intro|histogram|box_plot|^data_mixed:/, ['graphs']],
    [/bar_graph/, ['bar_graph']],
    [/pictograph/, ['pictogram']],
    [/tally/, ['tally']],
    [/line_plot/, ['line_plot']],
    [/pie_chart/, ['pie_chart']],
    [/^data_analysis:|data_stats_all/, ['statistics']],
    [/^probability:|data_stats_all/, ['probability']],
    // ---- algebra
    [/^algebra:|algebra_all|algebraic_all/, ['algebra']],
    [/tape_diagram/, ['bar_model']],
    [/balance|equal_sign|compare_expressions/, ['balance']],
    [/inequalities/, ['compare']],
    [/^order_of_operations:|order_ops_all/, ['order_of_operations']],
    [/exponent|oop_hard/, ['exponents']],
    [/^number_theory:|number_theory_all/, ['number_theory']],
    [/function_table/, ['patterns']],
    // ---- mixed pools and vocabulary
    [/:mixed|_all\b|:mixed$|all_/, ['mixed_review']],
    [/^vocabulary:/, ['vocabulary']],
    [/vocab_.*_operations/, ['addition', 'subtraction', 'multiplication', 'division']],
    [/vocab_.*_geometry/, ['shapes_2d']], [/vocab_.*_data/, ['graphs']], [/vocab_.*_fractions/, ['fractions']],
    [/vocab_.*_measurement/, ['length', 'time']], [/vocab_.*_algebra/, ['patterns']], [/vocab_.*_counting/, ['counting']],
    [/\(visual\)|pictures/, ['visual'], { label: true }],
    [/fractions_all/, ['fractions', 'fraction_ops']], [/decimals_all/, ['decimals']],
    [/mixed_composing/, ['number_bonds', 'place_value', 'odd_even', 'ten_frame', 'fractions']],
    [/patterns_all/, ['skip_count']], [/placevalue_all/, ['place_value', 'expanded_form', 'compare']],
    [/number_sense_all|mixed_number_sense/, ['rounding', 'estimate', 'strategies']],
    [/estimate_sum|estimate_diff|estimate_sums/, ['addition', 'subtraction']], [/estimate_products/, ['multiplication']],
    [/estimate_quotient/, ['division']],
];

/* ================================================================= hand-written terms */

// Extra terms for skills whose label is vague, and for the exemplar skill of a concept (so "plus"
// leads with the addition facts). Keys are 'categoryId:skillId'. Merge rule: a union of lists.
export const SKILL_TERMS = {
    'multiplication:count_by_tables': ['skip counting', 'skip count', 'skip counting by 1 to 12', 'count by', 'counting by',
        'count in', 'counting in', 'count in 2s', 'count in 3s', 'count in 4s', 'count in 5s', 'count in 6s', 'count in 7s',
        'count in 8s', 'count in 9s', 'count in 10s', 'count in 11s', 'count in 12s', 'times tables', 'times table',
        'multiplication tables', 'tables', 'multiples', 'multiples of', 'counting in multiples', 'skip countin'],
    'patterns:seq_2': ['skip counting', 'skip count by 2', 'count in twos', 'counting in 2s', 'twos', 'even numbers', '2 times table'],
    'patterns:seq_5': ['skip counting', 'skip count by 5', 'count in fives', 'counting in 5s', 'fives', '5 times table'],
    'patterns:seq_10': ['skip counting', 'skip count by 10', 'count in tens', 'counting in 10s', 'tens', '10 times table'],
    'patterns:count_by_fill': ['skip counting', 'skip count fill in', 'count by', 'times tables', 'multiples'],
    'patterns:skip_count_line': ['skip counting', 'skip count', 'jumps on a number line', 'hops on a number line', 'count by'],
    'patterns:skip_count_grid': ['skip counting', 'skip count', 'hundred square', 'hundreds chart', 'number grid', 'count by'],
    'addition:add_facts': ['plus', 'addition facts', 'add facts', 'adding', 'sum', 'basic addition facts', 'number facts', 'within 20', 'mental addition'],
    'addition:add': ['plus', 'adding', 'sum', 'simple addition', 'basic', 'easy addition'],
    'addition:add_5_pictures': ['plus', 'adding with pictures', 'count all', 'altogether', 'in all', 'beginning addition'],
    'subtraction:sub_facts': ['take away', 'takeaway', 'difference', 'subtract', 'minus', 'subtraction facts', 'subtract facts', 'basic subtraction facts', 'number facts', 'within 20'],
    'subtraction:subtract': ['take away', 'minus', 'simple subtraction', 'basic', 'easy subtraction'],
    'subtraction:sub_5_pictures': ['take away', 'cross out', 'how many left', 'beginning subtraction', 'minus'],
    'multiplication:mult_facts': ['x', 'multiply', 'times tables', 'times table', 'times', 'multiplication facts', 'tables', 'multiplication tables', 'x tables',
        ...Array.from({ length: 12 }, (_, i) => `${i + 1} times table`), ...Array.from({ length: 12 }, (_, i) => `times tables ${i + 1}`)],
    'multiplication:mult_chart': ['times tables', 'multiplication square', 'multiplication grid', 'tables chart'],
    'multiplication:mult_chart_easy': ['times tables', 'multiplication square', 'multiplication grid'],
    'division:div_facts': ['divide', 'division', 'divided by', 'division facts', 'divide by 2', 'divide by 3', 'divide by 4', 'divide by 5', 'divide by 6', 'divide by 7', 'divide by 8', 'divide by 9', 'sharing', 'share', 'division tables', 'inverse of times tables'],
    'division:divide': ['divided by', 'sharing', 'share', 'simple division'],
    'division:share_into_groups': ['sharing', 'share equally', 'fair share', 'equal groups'],
    'addition:add_100_regroup': ['carrying', 'carry', '2 digit addition with carrying', 'double digit addition'],
    'addition:add_20_regroup': ['carrying', 'bridging ten', 'make ten'],
    'addition:add_1k_regroup': ['carrying', '3 digit addition with carrying'],
    'subtraction:sub_100_regroup': ['borrowing', 'borrow', '2 digit subtraction with borrowing', 'double digit subtraction'],
    'subtraction:sub_20_regroup': ['borrowing', 'bridging ten'],
    'subtraction:sub_1k_regroup': ['borrowing', '3 digit subtraction with borrowing'],
    'subtraction:sub_across_zeros': ['borrowing across zeros', 'borrowing', 'zeros', 'subtract from 100', 'subtract from 1000'],
    'composing:number_bonds': ['number bonds', 'bonds to 10', 'part whole', 'cherry', 'ways to make 10', 'number bonds to 20', 'bonds to 20', 'number bonds to 10', 'numicon'],
    'composing:make_ten': ['bonds to 10', 'number bonds to 10', 'pairs that make 10', 'ten frame', 'numicon'],
    'composing:hundreds_chart_fill': ['hundred square', '100 square', 'hundreds chart', 'number square', 'missing numbers'],
    'composing:number_chart_fill': ['hundred square', 'number square', 'number grid', '1000 chart'],
    'composing:odd_even': ['odd and even', 'odd or even', 'pairs', 'evens and odds'],
    'composing:tens_foundation_visual': ['tens', 'bundles of ten', 'groups of ten', 'place value'],
    'measurement:time_hour': ["o'clock", 'oclock', 'telling time', 'tell the time', 'clock', 'hour'],
    'measurement:time_half_hour': ['half past', 'half hour', 'telling time', 'clock', 'thirty'],
    'measurement:time_quarter': ['quarter past', 'quarter to', 'telling time', 'clock'],
    'measurement:time_5min': ['five minutes', 'telling time', 'clock', 'minutes past'],
    'measurement:time_1min': ['nearest minute', 'telling time', 'clock'],
    'measurement:clock_parts': ['clock face', 'hands', 'hour hand', 'minute hand', 'telling time'],
    'measurement:time_sense': ['am', 'pm', 'am pm', 'morning', 'afternoon', 'evening', 'night', 'midnight', 'noon', 'midday'],
    'measurement:money_count': ['counting money', 'count coins', 'coins', 'cents', 'pence', 'money'],
    'measurement:coin_value': ['coin names', 'coins', 'penny', 'nickel', 'dime', 'quarter', 'pence', 'cents', 'value of coins'],
    'measurement:pictograph_intro': ['pictogram', 'picture graph', 'pictograph'],
    'graphs:pictograph': ['pictogram', 'picture graph', 'picture graphs'],
    'graphs:build_pictograph': ['pictogram', 'make a pictogram', 'draw a pictogram'],
    'graphs:tally_chart': ['tally', 'tally marks', 'frequency'],
    'graphs:bar_graph': ['bar chart', 'column graph'],
    'number_ops_mixed:mixed': ['all operations', 'four operations', '4 operations', 'plus minus times divide', 'mixed operations', 'arithmetic'],
    'number_ops_mixed:operations_all': ['all operations', 'everything', 'mixed operations', 'arithmetic'],
    'number_ops_mixed:which_sign': ['missing sign', 'missing operation', 'which operation', 'plus or minus', 'symbols'],
    'number_sense:compensation': ['round and adjust', 'adjusting', 'mental math strategy'],
    'number_sense:make_a_ten': ['bridge through ten', 'bridging ten', 'make 10'],
    'number_sense:doubles_near_doubles': ['doubles plus one', 'near doubles', 'double facts'],
    'counting:count_objects': ['how many', 'counting objects', 'count pictures', 'one to one counting', 'counting to 10', 'count to 10',
        'counting to 20', 'count to 20', 'numbers to 10', 'subitizing', 'subitising'],
    'counting:count_sequence': ['what comes next', 'number after', 'number before', 'one more one less'],
    'placevalue:identify': ['place value', 'tens and ones', 'hundreds tens ones', 'which place', 'ones tens hundreds', 'place name', 'digit place'],
    'placevalue:value': ['digit value', 'what is the digit worth', 'value of the underlined digit'],
    'placevalue:expand': ['expanded', 'partition', 'expanded notation'],
    'placevalue:combine': ['standard form', 'write the number', 'from expanded form'],
    'placevalue:compare': ['greater than', 'less than', 'compare numbers', 'bigger number'],
    'shapes_early:partition_shapes': ['half', 'fractions', 'halves', 'quarters', 'fourths', 'thirds', 'equal parts', 'fractions of shapes'],
    'fractions:identify': ['what fraction', 'name the fraction', 'fraction pictures', 'shaded part'],
    'conversions:percent_of_number': ['percent of', 'percentage of an amount', 'percent of a quantity'],
    'algebra:solve_unknown': ['solve for x', 'find x', 'missing number'],
    'algebra:balance_addsub': ['balance', 'equal sign', 'balancing equations', 'equals means same as'],
    'addition:equal_sign': ['equal sign', 'equals', 'true or false', 'balance'],
    'data_analysis:mean': ['average', 'mean average'],
    'data_analysis:range': ['data range', 'spread', 'highest minus lowest'],
    'data_analysis:mode': ['most common', 'most often'],
    'data_analysis:median': ['middle number', 'middle value'],
    'vocabulary:vocab_grade_K': ['kindergarten words', 'math words'],
    'division:long_div_2digit': ['long division', 'divide by two digits', '2 digit divisor', 'standard algorithm'],
    'placevalue:order_least_to_greatest': ['order numbers', 'ordering numbers', 'smallest to biggest'],
    'placevalue:order_greatest_to_least': ['order numbers', 'ordering numbers', 'biggest to smallest'],
    'fraction_operations:add_fractions_like': ['add fractions', 'adding fractions', 'same denominator', 'like denominators'],
    'fraction_operations:sub_fractions_like': ['subtract fractions', 'subtracting fractions', 'same denominator', 'like denominators'],
    'fraction_operations:add_frac_unlike': ['add fractions', 'adding fractions', 'common denominator', 'unlike denominators', 'different denominators'],
    'fraction_operations:sub_frac_unlike': ['subtract fractions', 'subtracting fractions', 'common denominator', 'unlike denominators'],
    'fraction_operations:mult_frac_frac': ['multiply fractions', 'multiplying fractions', 'fraction times fraction'],
    'fraction_operations:mult_frac_whole': ['multiply fractions', 'fraction times whole number', 'multiplying fractions by whole numbers'],
    'fraction_operations:div_unit_fraction': ['divide fractions', 'dividing fractions'],
    'conversions:percent_visual': ['percent', 'percentage', 'hundred grid', 'out of 100'],
    'measurement:reading_ruler': ['measuring length', 'measure length', 'measuring', 'ruler', 'inches', 'centimetres'],
    'measurement:length_metric': ['centimetres', 'centimeters', 'cm', 'metres', 'meters', 'millimetres', 'kilometres', 'metric length'],
    'measurement:length_customary': ['inches', 'feet', 'yards', 'miles', 'customary length', 'imperial'],
    'area_perimeter:area': ['area', 'area of a rectangle', 'length times width', 'square units', 'tile', 'tiles', 'tiling', 'tiled'],
    'measurement:time_analog_digital': ['analog clock', 'analogue clock', 'analog and digital', 'analogue and digital', 'analog to digital'],
    'area_perimeter:area_unit_squares': ['tile', 'tiles', 'tiling', 'tiled', 'tiling a rectangle', 'cover with tiles', 'count the squares', 'unit squares'],
    'area_perimeter:perimeter': ['perimeter', 'distance around', 'perimeter of a rectangle'],
    'area_perimeter:volume': ['volume', 'cubic units', 'volume of a cuboid', 'volume of a box'],
    'order_of_operations:oop_easy': ['order of operations', 'bodmas', 'bidmas', 'pemdas', 'which operation first'],
    'number_theory:lcm': ['lcm', 'lowest common multiple', 'least common multiple', 'common multiples'],
    'number_theory:gcf_easy': ['hcf', 'gcf', 'gcd', 'highest common factor', 'greatest common divisor', 'common factors'],
    'number_theory:gcf_hard': ['hcf', 'gcf', 'gcd', 'highest common factor'],
    'number_theory:factors_identify': ['factors', 'find the factors', 'factor pairs'],
    'number_theory:prime_composite': ['prime numbers', 'primes', 'composite numbers'],
    'number_theory:multiples': ['multiples', 'list multiples', 'multiples of a number'],
    'shapes_early:name_2d_shapes': ['shapes', '2d shapes', 'flat shapes', 'shape names', 'name the shape'],
    'shapes_early:name_3d_shapes': ['3d shapes', 'solid shapes', '3d shape names'],
    'angles_lines:identify_angles': ['angles', 'right angle', 'acute', 'obtuse', 'types of angles', 'clockwise', 'anticlockwise', 'counterclockwise', 'quarter turn', 'half turn', 'turns'],
    // critic r3 C-E
    'shapes_early:count_sides_vertices_2d': ['vertex', 'corner'],
    // critic r5 P-E / C-G: what _mpTypes really deals (commutative, distributive, identity, zero), never associative
    'multiplication:mult_properties': ['commutative', 'commutative property', 'commutative property of multiplication', 'turnaround facts',
        'distributive property', 'distributive property of multiplication', 'identity', 'identity property', 'identity property of multiplication',
        'zero property', 'zero property of multiplication', 'property of zero', 'property of one', 'properties of multiplication', 'multiplication properties'],
    // the addition turnaround (commutative) facts: a fact family deals a + b = c and b + a = c (1.OA.B.3)
    'addition:add_sub_fact_family': ['commutative', 'commutative property', 'commutative property of addition', 'commutative addition',
        'turnaround facts', 'turn around facts', 'turnaround', 'addition turnaround facts', 'related facts'],
    'algebra:function_table_easy': ['input output', 'in out', 'function machine'],
    'algebra:function_table_hard': ['input output', 'in out', 'function machine'],
    'placevalue:place_value_10x': ['10 times bigger', 'ten times bigger', '10 times smaller', 'ten times as much'],
    'angles_lines:symmetry': ['symmetry', 'line of symmetry', 'symmetrical', 'mirror line'],
    'coordinates:coordinate_q1': ['coordinates', 'coordinate grid', 'plot points', 'ordered pairs', 'first quadrant'],
    'graphs:line_plot': ['line plot', 'dot plot'],
    'graphs:pie_chart': ['pie chart', 'circle graph'],
    'probability:probability_basic': ['probability', 'chance', 'likely', 'unlikely'],
    'patterns:number_pattern': ['patterns', 'number patterns', 'sequences', 'what comes next'],
    'algebra:tape_diagram': ['bar model', 'tape diagram', 'part whole model'],
    'algebra:solve_eq_addsub': ['equations', 'solve equations', 'one step equations'],
    'integers:number_line_int': ['negative numbers', 'below zero', 'integers on a number line'],
    'integers:add_int': ['integers', 'adding negative numbers'],
    'decimals:add_decimal': ['adding decimals', 'decimal addition'],
    'fractions:equivalent': ['equivalent fractions', 'equal fractions'],
    'fractions:simplify': ['simplify fractions', 'lowest terms', 'simplest form', 'reduce fractions'],
    'fractions:improper_mixed': ['improper fractions', 'mixed numbers', 'top heavy fractions'],
    'fractions:compare': ['compare fractions', 'which fraction is bigger'],
    'fractions:fraction_of_set': ['fraction of a set', 'fraction of a group', 'fraction of an amount'],
    'conversions:ratio_intro': ['ratio', 'ratios', 'write a ratio'],
    'measurement:heavier_lighter_visual': ['weight', 'heavy', 'light', 'heavier', 'lighter', 'compare weight'],
    'measurement:mass_volume_liquid': ['mass', 'grams', 'kilograms', 'litres', 'liters'],
    'measurement:capacity': ['capacity', 'liquid volume', 'cups pints quarts gallons'],
    'measurement:temperature': ['temperature', 'thermometer'],
    'measurement:unit_conversions': ['unit conversions', 'converting units', 'convert measurements'],
    'measurement:elapsed_30min': ['elapsed time', 'how much later', 'time later'],
    'measurement:money_change': ['change', 'giving change', 'how much change', 'making change', 'make change', 'find the change'],
    // critic r1 additions (P3, C1, C2, C4, C5)
    'multiplication:multiply': ['times', 'multiplying', 'lots of', 'column multiplication', 'short multiplication', 'long multiplication', 'standard algorithm',
        'standard algorithm multiplication', 'formal written method', 'written method', '2 digit by 1 digit',
        '3 digit by 1 digit', '2 digit by 2 digit', 'multiply by 1 digit', 'multiply by 2 digit', 'multiplication 2 digit by 1 digit',
        'multi digit multiplication', 'multidigit multiplication'],
    'patterns:halve': ['divide by 2', 'half of', 'halving', 'halve', 'find half', 'half of a number'],
    'order_of_operations:exponents_simple': ['square numbers', 'square number', 'squared', 'cube numbers', 'cubed', 'powers'],
    'area_perimeter:composite_shapes': ['compound shapes', 'composite shapes', 'rectilinear shapes', 'l shapes', 'compound area', 'compound perimeter'],
    'decimals:decimal_nl_drag': ['decimals', 'decimal place value', 'tenths and hundredths', 'decimals on a number line'],
};

/* ================================================================= misspellings */

/* ================================================================= primary skills */

// The PRIMARY skill for a concept: for these exact queries it ranks first, above every match but an
// exact label match. Keyed by 'categoryId:skillId' (a union merges cleanly); phrases are normalised.
export const PRIMARY_SKILLS = {
    // critic r4 R-D / R-E / C-F
    'shapes_early:shape_corners_count': ['corner', 'corners', 'count corners'],
    'conversions:d_to_f': ['decimals to fractions', 'decimal to fraction', 'decimal to fractions', 'decimals to fraction', 'convert decimals to fractions'],
    'conversions:f_to_d': ['fractions to decimals', 'fraction to decimal', 'fraction to decimals', 'fractions to decimal', 'convert fractions to decimals'],
    // critic r5: no skill deals the associative property, so 'associative' finds nothing (REAL_WORDS keeps it uncorrected);
    // 'distributive property' leads with the skill named for it (R-F); 'zero / identity property' reach the skill that deals them (C-G)
    'multiplication:mult_properties': ['commutative property', 'commutative', 'properties of multiplication', 'multiplication properties',
        'commutative property of multiplication', 'distributive property of multiplication', 'zero property', 'zero property of multiplication',
        'identity property', 'identity property of multiplication', 'identity', 'property of zero', 'property of one'],
    'algebra:distributive_expr': ['distributive property', 'distributive property of expressions'],
    'addition:add_sub_fact_family': ['commutative addition', 'commutative property of addition', 'commutative property addition',
        'turnaround facts addition', 'addition turnaround facts', 'turn around facts addition'],
    'multiplication:count_by_tables': ['skip counting', 'skip count', 'skipcounting', 'skip countin', 'count by', 'counting by',
        'count in', 'counting in', 'counting in multiples', 'skip counting by 1 to 12'],
    'multiplication:mult_facts': ['times tables', 'times table', 'timestables', 'multiplication tables', 'multiplication facts', 'times', 'multiply', 'multiplication', 'x', 'times x'],
    'addition:add_facts': ['plus', 'add', 'adding', 'addition', 'addition facts', 'sum'],
    'subtraction:sub_facts': ['take away', 'takeaway', 'minus', 'subtract', 'subtraction', 'subtraction facts', 'difference'],
    'division:div_facts': ['divide', 'division', 'divided by', 'division facts'],
    'division:share_into_groups': ['sharing', 'share equally', 'fair share'],
    'addition:add_100_regroup': ['carrying', 'carry'],
    'subtraction:sub_100_regroup': ['borrowing', 'borrow'],
    'composing:number_bonds': ['number bonds', 'number bond', 'part whole', 'part whole model', 'part-whole model', 'cherry model', 'number bonds to 20', 'bonds to 20'],
    'composing:make_ten': ['bonds to 10', 'make 10', 'make ten'],
    'composing:hundreds_chart_fill': ['hundred square', '100 square', 'hundreds chart', 'hundred chart', 'number square'],
    'composing:odd_even': ['odd and even', 'odd or even', 'even numbers', 'odd numbers'],
    'measurement:time_hour': ['telling time', 'tell the time', 'oclock', 'clock'],
    'measurement:time_half_hour': ['half past'],
    'measurement:time_quarter': ['quarter past', 'quarter to'],
    'measurement:money_count': ['money', 'coins', 'counting money'],
    'graphs:pictograph': ['pictogram', 'pictograph', 'picture graph'],
    'graphs:tally_chart': ['tally', 'tally chart', 'tally marks'],
    'graphs:bar_graph': ['bar chart', 'bar graph'],
    'fractions:identify': ['fractions', 'fraction'],
    'placevalue:place_value_disks': ['place value'],
    'order_of_operations:oop_easy': ['order of operations', 'bodmas', 'bidmas', 'pemdas'],
    'algebra:tape_diagram': ['bar model', 'tape diagram'],
    'area_perimeter:perimeter': ['perimeter'],
    'area_perimeter:area': ['area'],
    'angles_lines:symmetry': ['symmetry', 'line of symmetry'],
    // critic r1 additions
    'multiplication:multiply': ['column multiplication', 'short multiplication', 'long multiplication', 'standard algorithm multiplication',
        'multiply by 1 digit', '2 digit by 1 digit', 'multiplication 2 digit by 1 digit',
        // critic r5 R-G: 'digit' is not the Missing Digit skill
        'multi digit multiplication', 'multidigit multiplication', 'multi digit multiply', 'multiply multi digit numbers', 'multiplying multi digit numbers'],
    'patterns:halve': ['divide by 2', 'halving', 'halve', 'half of'],
    'order_of_operations:exponents_simple': ['square numbers', 'square number', 'squared'],
    'counting:count_objects': ['counting to 10', 'count to 10', 'counting to 20', 'count to 20', 'subitizing', 'subitising'],
    'area_perimeter:composite_shapes': ['compound shapes', 'composite shapes'],
    'measurement:money_change': ['making change', 'make change', 'giving change', 'find the change'],
    'decimals:decimal_nl_drag': ['decimals', 'decimal'],
    'conversions:percent_visual': ['percent', 'percentage', 'percentages', 'percents'],    'number_sense:nearest_10': ['rounding', 'round', 'round off'],
    'subtraction:sub_100_regroup': ['column subtraction', 'column method subtraction'],
};

export const MISSPELLINGS = {
    quatre: 'quarter', quater: 'quarter',
    multipication: 'multiplication', multiplcation: 'multiplication', multiplacation: 'multiplication', mulitplication: 'multiplication',
    multiplicaton: 'multiplication', multiplikation: 'multiplication', multply: 'multiply', mutiply: 'multiply', multipy: 'multiply',
    subtration: 'subtraction', subraction: 'subtraction', substraction: 'subtraction', subtracion: 'subtraction', subtact: 'subtract',
    substract: 'subtract', subract: 'subtract', subtrat: 'subtract',
    additon: 'addition', addtion: 'addition', adition: 'addition', addision: 'addition', additoin: 'addition',
    divison: 'division', divsion: 'division', devision: 'division', divishion: 'division', devide: 'divide', divid: 'divide',
    fracions: 'fractions', fractons: 'fractions', fracton: 'fraction', fration: 'fraction', fractoins: 'fractions', frations: 'fractions',
    decimels: 'decimals', decimles: 'decimals', desimals: 'decimals', decmal: 'decimal',
    perimiter: 'perimeter', parimeter: 'perimeter', perimetre: 'perimeter', perameter: 'perimeter',
    arear: 'area', aria: 'area', angels: 'angles', angel: 'angle', symetry: 'symmetry', simetry: 'symmetry', semetry: 'symmetry',
    geometery: 'geometry', probablity: 'probability', probabilty: 'probability', percnt: 'percent', precent: 'percent',
    pictogragh: 'pictograph', grapgh: 'graph', grahp: 'graph', graf: 'graph',
    countin: 'counting', counitng: 'counting', couting: 'counting', skipcounting: 'skip counting', skipcount: 'skip count',
    timestables: 'times tables', timetables: 'times tables', timestable: 'times table', tabels: 'tables', tabls: 'tables',
    regroupping: 'regrouping', regroop: 'regroup', regrouing: 'regrouping', borowing: 'borrowing', barrowing: 'borrowing',
    carying: 'carrying', carrieing: 'carrying', numbr: 'number', nubmer: 'number', numer: 'number', vaule: 'value', valu: 'value',
    roundig: 'rounding', estamate: 'estimate', estimat: 'estimate', equivelent: 'equivalent',
    equivalant: 'equivalent', eqivalent: 'equivalent', quater: 'quarter', quaters: 'quarters', haf: 'half', halfs: 'halves',
    clok: 'clock', mony: 'money', monye: 'money', coines: 'coins', shapse: 'shapes', shaps: 'shapes',
    triangel: 'triangle', rectangel: 'rectangle', sqaure: 'square', cirlce: 'circle', hexigon: 'hexagon',
    quadrilatral: 'quadrilateral', integars: 'integers', intergers: 'integers', negitive: 'negative', exponant: 'exponents',
    algabra: 'algebra', algebr: 'algebra', equasion: 'equation', equasions: 'equations', expresion: 'expression',
    paterns: 'patterns', patern: 'pattern', sequance: 'sequence', facter: 'factor', facters: 'factors', multipul: 'multiple',
    multipuls: 'multiples', prim: 'prime', compostie: 'composite', remander: 'remainder', remainer: 'remainder',
    mesurement: 'measurement', measurment: 'measurement', mesure: 'measure', lenght: 'length', lenth: 'length', wieght: 'weight',
    capasity: 'capacity', tempreture: 'temperature', temprature: 'temperature', vocabulery: 'vocabulary', vocabluary: 'vocabulary',
    hundered: 'hundred', hundert: 'hundred', thousend: 'thousand', tallys: 'tally', talley: 'tally', avarage: 'average',
    averge: 'average', meadian: 'median', kindergarden: 'kindergarten', 
};

/* ================================================================= normalisation */

const STOP = new Set(['the', 'a', 'an', 'and', 'of', 'to', 'with', 'for', 'on', 'is', 'my', 'me', 'practice', 'practise',
    'worksheet', 'worksheets', 'math', 'maths', 'mathematics', 'skill', 'skills', 'activity', 'activities', 'games', 'game',
    'questions', 'question', 'sheet', 'sheets', 'do', 'i', 'learn', 'learning', 'kids', 'help', 'or', 'in', 'by', 'up']);
// Words dropped from the match but kept in the phrase ("count by", "quarter to", "how many").
const HARD_STOP = new Set(['practice', 'practise', 'worksheet', 'worksheets', 'math', 'maths', 'mathematics', 'skill', 'skills',
    'activity', 'activities', 'games', 'game', 'questions', 'question', 'sheet', 'sheets', 'kids', 'help', 'learn', 'learning']);
// Word families folded to one root on both sides, so 'addition' finds 'Add within 20'.
const ROOTS = {
    addition: 'add', adding: 'add', added: 'add', adds: 'add',
    subtraction: 'subtract', subtracting: 'subtract', subtracted: 'subtract', subtracts: 'subtract',
    multiplication: 'multiply', multiplying: 'multiply', multiplied: 'multiply', multiplies: 'multiply',
    division: 'divide', dividing: 'divide', divided: 'divide', divides: 'divide',
    counting: 'count', counts: 'count', counted: 'count', rounding: 'round', rounded: 'round',
    measuring: 'measure', measurement: 'measure', measurements: 'measure', comparing: 'compare', comparison: 'compare',
    ordering: 'order', estimating: 'estimate', estimation: 'estimate', doubling: 'double', halving: 'halve', halves: 'half',
    fractions: 'fraction', decimals: 'decimal', percentages: 'percent', percentage: 'percent', percents: 'percent',
    analogue: 'analog', color: 'colour', colors: 'colour', coloring: 'colour', simplifying: 'simplify', graphs: 'graph', charts: 'chart', angles: 'angle', shapes: 'shape', patterns: 'pattern',
};

const ORD = { first: '1', second: '2', third: '3', fourth: '4', fifth: '5', sixth: '6', '1st': '1', '2nd': '2', '3rd': '3', '4th': '4', '5th': '5', '6th': '6' };

/** Lower-case, symbols to words, punctuation out. Keeps '.' and '/' between alphanumerics (2.nbt.2, 1/2). */
export function normalize(s) {
    return String(s == null ? '' : s).toLowerCase()
        .replace(/[’'`]/g, '')
        .replace(/[×*]/g, ' times x ').replace(/÷/g, ' divide ').replace(/\+/g, ' plus ').replace(/−/g, ' minus ')
        .replace(/(^|\s)-(\s|$)/g, ' minus ').replace(/%/g, ' percent ').replace(/[£$¢]/g, ' money ').replace(/°/g, ' degrees ')
        .replace(/[<>≤≥≠]/g, ' compare ').replace(/=/g, ' equals ').replace(/&/g, ' and ')
        .replace(/½/g, ' 1/2 half ').replace(/¼/g, ' 1/4 quarter ').replace(/¾/g, ' 3/4 ').replace(/∥/g, ' parallel ').replace(/⊥/g, ' perpendicular ')
        .replace(/(\d),(?=\d{3})/g, '$1')
        .replace(/(\d)k\b/g, '$1000').replace(/(\d)m\b/g, '$1000000')
        .replace(/([a-z0-9])[./]([a-z0-9])/g, '$1\u0001$2').replace(/([a-z0-9])[./]([a-z0-9])/g, '$1\u0001$2')
        .replace(/[^a-z0-9\u0001]+/g, ' ')
        .replace(/\u0001/g, (m, off, str) => '.')
        .trim();
}

/** Light stemming used on both sides: plural s, -ing. */
export function stem(w) {
    if (ROOTS[w]) return ROOTS[w];
    if (/^\d/.test(w) || w.includes('.')) return w;
    if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
    else if (w.length > 4 && w.endsWith('ies')) w = w.slice(0, -3) + 'y';
    else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
    return w;
}

/** Tokens of a normalised string, with 'year 3' -> y3, 'grade 2' / '2nd grade' -> g2. */
export function tokens(s, { query = false } = {}) {
    const raw = normalize(s).split(' ').filter(Boolean);
    const out = [];
    for (let i = 0; i < raw.length; i++) {
        let w = raw[i];
        const nx = raw[i + 1];
        if ((w === 'year' || w === 'yr') && nx && /^\d$/.test(nx)) { out.push('y' + nx); i++; continue; }
        if (w === 'grade' && nx && (/^(\d|k)$/.test(nx) || ORD[nx])) { out.push('g' + (ORD[nx] || nx)); i++; continue; }
        if (ORD[w] && nx === 'grade') { out.push('g' + ORD[w]); i++; continue; }
        if (w === 'kindergarten' || w === 'kinder' || w === 'kindergarden') { out.push('gk'); continue; }
        if (query && MISSPELLINGS[w]) { for (const x of normalize(MISSPELLINGS[w]).split(' ')) out.push(x); continue; }
        out.push(w);
    }
    return query ? out.filter((w) => !STOP.has(w)) : out;
}

/* ================================================================= per-skill terms */

const N_WORD = { 10: 'ten', 20: 'twenty', 50: 'fifty', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million' };
const DIGITS = { 10: 1, 50: 2, 100: 2, 1000: 3, 10000: 4, 100000: 5, 1000000: 6 };
const DIGIT_WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

function withinTerms(skillId) {
    const m = skillId.match(/_(\d+)(k|m)?(?:_|$)/);
    if (!m || !/^(add|sub)_/.test(skillId)) return [];
    const n = +m[1] * (m[2] === 'k' ? 1000 : m[2] === 'm' ? 1000000 : 1);
    if (!DIGITS[n]) return [];
    const d = DIGITS[n];
    const out = [`within ${n}`, `up to ${n}`, `numbers to ${n}`, `to ${n}`, `within ${N_WORD[n]}`, `${d} digit`, `${DIGIT_WORD[d]} digit`];
    if (d === 1) out.push('single digit', 'one digit');
    if (d === 2) out.push('double digit', 'two digit numbers', '2 digit numbers');
    if (n === 20) out.push('teen numbers', 'bridging ten');
    return out;
}

/** 'nearest_100' -> 'round to the nearest hundred', 'nearest 100' ... (critic r1 P3). */
function nearestTerms(skillId) {
    const m = skillId.match(/^nearest_(\d+)$/);
    if (!m || !N_WORD[+m[1]]) return [];
    const n = +m[1], w = N_WORD[n];
    return [`nearest ${n}`, `nearest ${w}`, `round to the nearest ${n}`, `round to the nearest ${w}`, `rounding to the nearest ${w}`,
        `round to ${n}`, `round to ${w}`];
}

/** Grade words: grade 2 -> 'grade 2', g2, '2nd grade', 'year 3', y3. */
export function gradeTerms(grade) {
    const g = grade == null ? 'M' : String(grade);
    if (g === 'K') return ['grade k', 'gk', 'kindergarten', 'kinder', 'k', 'year 1', 'y1', 'reception', 'early years', 'foundation'];
    if (/^\d$/.test(g)) {
        const n = +g;
        const ord = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'][n];
        return [`grade ${n}`, `g${n}`, `${ord} grade`, `year ${n + 1}`, `y${n + 1}`];
    }
    return ['multi grade', 'all grades', 'mixed grades'];
}

/** Concepts a skill teaches, from the mapping table. */
export function conceptsFor(categoryId, skillId, label) {
    const id = `${categoryId}:${skillId}`;
    const withLabel = `${id} ${String(label || '').toLowerCase()}`;
    const out = new Set();
    for (const [re, list, o] of CONCEPT_RULES) if (re.test(o && o.label ? withLabel : id)) for (const c of list) out.add(c);
    return [...out];
}

/**
 * Every search term of a skill, grouped by tier:
 *   { label, extra: [...], concept: [...], code: [...] }
 * entry = { categoryId, skillId, label, categoryName, domainName, grade,
 *           codes: ['3.OA.C.7', '3.OA.7', ...], wrm: [{ id, title }] }
 */
export function termsFor(entry) {
    const key = `${entry.categoryId}:${entry.skillId}`;
    const extra = [...(SKILL_TERMS[key] || []), ...withinTerms(entry.skillId), ...nearestTerms(entry.skillId)];
    const concept = [];
    for (const c of conceptsFor(entry.categoryId, entry.skillId, entry.label)) concept.push(...(CONCEPTS[c] || []));
    concept.push(entry.categoryName || '', entry.categoryId.replace(/_/g, ' '), entry.skillId.replace(/_/g, ' '));
    const grade = gradeTerms(entry.grade);
    const code = [...(entry.codes || []), entry.domainName || ''];
    for (const w of entry.wrm || []) {
        code.push(w.id, w.title);
        const y = String(w.id).match(/^(Y\d|R)\b/);
        if (y) grade.push(y[1] === 'R' ? 'reception' : `year ${y[1].slice(1)}`);
    }
    // 'no regrouping' / 'without carrying' rank below the positive words, so 'carrying' leads with regrouping skills
    for (let i = concept.length - 1; i >= 0; i--) if (/^(no|without)\s/.test(concept[i])) code.push(...concept.splice(i, 1));
    for (let i = extra.length - 1; i >= 0; i--) if (/^(no|without)\s/.test(extra[i])) code.push(...extra.splice(i, 1));
    // the '(No Pictures)' / '(No Visuals)' / 'No Parens' variant is found by that text (critic r3 C-D)
    for (const m of String(entry.label || '').matchAll(/\b(?:no|without)\s+\w+/gi)) code.push(m[0]);
    if (/\bno (pictures|visuals)\b|_plain$|_nv$/i.test(`${entry.label} ${entry.skillId}`)) code.push('no pictures', 'no visuals', 'no pics', 'plain', 'text only', 'pictures', 'visuals');
    const clean = (l) => [...new Set(l.map((t) => normalize(t)).filter(Boolean))];
    return { label: normalize(entry.label), extra: clean(extra), grade: clean(grade), concept: clean(concept), code: clean(code) };
}

/** Distinct terms beyond the label (the gate's measure). */
export function termCount(t) {
    const lab = new Set([t.label, ...t.label.split(' ')]);
    const all = new Set([...t.extra, ...t.grade, ...t.concept, ...t.code]);
    let n = 0;
    for (const x of all) if (!lab.has(x)) n++;
    return n;
}

/* ================================================================= index + ranking */

const W_LABEL = 3, W_EXTRA = 2.6, W_GRADE = 2.6, W_CONCEPT = 2, W_CODE = 1.5, W_FUZZY = 1;

function tokSet(phrases) {
    const s = new Set();
    for (const p of phrases) for (const w of tokens(p)) { s.add(w); s.add(stem(w)); }
    return s;
}

/** Build a search index over entries (see termsFor). Each entry may carry any extra fields. */
export function buildSearchIndex(entries) {
    const items = entries.map((e, order) => {
        const t = termsFor(e);
        const labelBare = normalize(String(e.label || '').replace(/\([^)]*\)/g, ' '));
        // 'No Regrouping' in a label must not make the skill a label hit for 'regrouping'
        const labelPos = String(e.label || '').replace(/\b(no|without)\s+\w+/gi, ' ');
        return {
            entry: e, order, terms: t, labelBare,
            sets: [tokSet([labelPos]), tokSet(t.extra), tokSet(t.grade), tokSet(t.concept), tokSet(t.code)],
            vocab: /^vocab/.test(e.skillId) || e.categoryId === 'vocabulary',
            wp: /word|_wp_|story/.test(`${e.label} ${e.skillId}`.toLowerCase()),
            phrases: { extra: t.extra, concept: t.concept },
            primary: (PRIMARY_SKILLS[`${e.categoryId}:${e.skillId}`] || []).map((x) => normalize(x)),
            demote: (/^mixed|_all$|^all_|^operations_all|^vocab/.test(e.skillId) ? 0.4 : 0) + (/no pictures|no visuals|_plain|_nv$/.test(`${e.label} ${e.skillId}`.toLowerCase()) ? 0.2 : 0),
        };
    });
    const df = new Map();
    for (const it of items) {
        const seen = new Set();
        for (const s of it.sets) for (const w of s) seen.add(w);
        for (const w of seen) df.set(w, (df.get(w) || 0) + 1);
        it.family = new Set([...tokSet([e2fam(it.entry)])].filter((w) => w.length >= 4 && !FAM_GENERIC.has(w)));
    }
    return { items, vocab: [...df.keys()], df };
}

const FAM_GENERIC = new Set(['number', 'numbers', 'sense', 'mixed', 'early', 'line', 'lines', 'all']);

/** The family words of a skill (its category id and name), for the relevance tie-break. */
function e2fam(e) { return `${String(e.categoryId || '').replace(/_/g, ' ')} ${e.categoryName || ''}`; }

function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    // optimal string alignment: a swapped pair ('aera') is one edit
    let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        let best = i;
        for (let j = 1; j <= b.length; j++) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
            if (cur[j] < best) best = cur[j];
        }
        if (best > max) return max + 1;
        prev2 = prev;
        prev = cur;
    }
    return prev[b.length];
}

// Correctly spelt English words that are not in the skill vocabulary. They are never "corrected" into a
// vocabulary word ('tile' is not 'time', 'compass' is not 'compare'); a search for one honestly finds
// what carries it, or nothing (critic r2 P-A).
export const REAL_WORDS = new Set(('lost tie ties pond may sole seed spit bride tile tiles tiling tiled compass north south east west northeast days day week weeks month ' +
    'months year years root roots full empty bead beads rekenrek abacus calendar date dates season seasons ' +
    'fill pill mill will till tall tell toll bell ball wall call fall hall ' +
    'cat cats dog dogs hat bat rat mat sat pat fat car bar far jar star stair chair fair hair pair air ' +
    'cake bake lake make take wake rake sake fake ' +
    'bed red fed led wed head read bread lead dead ' +
    'book look cook hook took foot boot hoot loot rook room ' +
    'game came name same tame lame ' +
    'ways rays bays pays says lays ' +
    'past last fast mast cast vast rest best test nest west vest pest ' +
    'worth north birth earth ' +
    'like bike hike mike pike ' +
    'line fine mine nine pine wine dine kine ' +
    'rope hope pope cope dope mope ' +
    'tree free three trees ' +
    'sun run fun bun gun nun ' +
    'box fox socks rocks clocks blocks locks ' +
    'pen ten hen men den ' +
    'pin tin bin win fin sin kin ' +
    'map cap gap lap nap tap sap ' +
    'dot hot lot pot rot cot not got ' +
    'cup pup ' +
    'egg eggs leg legs peg pegs ' +
    'apple apples orange oranges banana bananas ' +
    'sweet sweets cookie cookies candy ' +
    'train trains plane planes boat boats ' +
    'toy toys doll dolls ' +
    'school class teacher pupil pupils student students ' +
    'easy hard harder easier ' +
    'big small large little long short tall ' +
    'hot cold warm ' +
    'fruit fruits flower flowers ' +
    'pizza pie pies ' +
    'dice die ' +
    'string strings ' +
    'paper pencil ruler ' +
    'chair table tables desk ' +
    'coin coins note notes ' +
    'page pages ' +
    'shop shopping ' +
    'kids child children ' +
    'friend friends ' +
    'house houses ' +
    'garden ' +
    'water milk juice ' +
    'bag bags ' +
    'animal animals ' +
    'spring summer autumn winter fall ' +
    'associative associate '+
    'pay pays paid bank banks sell sells sold spell team teams title titles moon pear '+
    'monday tuesday wednesday thursday friday saturday sunday').split(/\s+/).filter(Boolean));

/** Words the query corrects: [{ at, from, to }]. A word is corrected only when it is not a known word,
 *  the nearest vocabulary word starts with the same letter, and it is a keyboard slip away: one edit
 *  (a dropped, extra, changed or swapped letter) for a word of 6 letters or fewer, two for a longer one. */
export function correctWords(index, q) {
    const out = [];
    q.forEach((w, at) => {
        if (isNumTok(w) || w.length < 3 || w.includes('.') || REAL_WORDS.has(w) || REAL_WORDS.has(stem(w)) || STOP.has(w)) return;
        const sw = stem(w);
        if (index.vocab.some((v) => v === w || v === sw || (w.length >= 4 && (v.startsWith(w) || v.startsWith(sw))))) return;
        const max = w.length <= 6 ? 1 : 2;
        const cands = [];
        for (const v of index.vocab) {
            if (v[0] !== w[0] || isNumTok(v) || v.length < 3 || STOP.has(v) || v.includes('.')) continue;
            // a short word is corrected only for a dropped letter ('tme') or a swapped pair ('aera'): a changed or
            // extra letter in a short word is usually a different real word ('boy' / 'box', 'race' / 'rate')
            if (w.length <= 5 && !(droppedLetter(w, v) || swappedPair(w, v))) continue;
            const d = editDistance(w, v, max);
            if (d <= max) cands.push({ v, d });
        }
        cands.sort((a, b) => a.d - b.d || (index.df.get(b.v) || 0) - (index.df.get(a.v) || 0) || b.v.length - a.v.length);
        if (cands.length) out.push({ at, from: w, to: cands[0].v });
    });
    return out;
}

function droppedLetter(w, v) {
    if (v.length !== w.length + 1) return false;
    for (let i = 0; i < v.length; i++) if (v.slice(0, i) + v.slice(i + 1) === w) return true;
    return false;
}
function swappedPair(w, v) {
    if (v.length !== w.length) return false;
    for (let i = 0; i < w.length - 1; i++) if (w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2) === v) return true;
    return false;
}

/** The corrections a query gets, for the "Showing results for ..." line: { from: 'tme', to: 'telling time' } or null. */
export function queryCorrection(index, query) {
    const q = tokens(query, { query: true });
    if (!q.length) return null;
    const fixes = correctWords(index, q);
    const spelt = normalize(query).split(' ').some((w) => MISSPELLINGS[w]);
    if (!fixes.length && !spelt) return null;
    const shown = normalize(query).split(' ').map((w) => MISSPELLINGS[w] || w);
    const fixedShown = shown.map((w) => { const f = fixes.find((x) => x.from === w); return f ? f.to : w; });
    return { from: String(query).trim(), to: fixedShown.join(' ') };
}

const isNumTok = (w) => /^\d+[a-z]?$/.test(w) || /^[gy][\dk]$/.test(w);

function tokHits(set, q) {
    if (set.has(q)) return true;
    const sq = stem(q);
    if (set.has(sq)) return true;
    if (isNumTok(q) || q.length < 3) return false;
    for (const w of set) {
        if (!(w.startsWith(q) || (sq.length >= 3 && w.startsWith(sq)))) continue;
        // a place name never reaches its fraction: 'hundred' is not 'hundredths', 'ten' not 'tenths'
        if (/^ths?$/.test(w.slice(q.length)) || /^ths?$/.test(w.slice(sq.length))) continue;
        return true;
    }
    return false;
}

/**
 * Rank the index for a query. Returns [{ entry, score }] best first (every query word matched).
 * Case- and punctuation-insensitive; misspellings are corrected and near-misses matched.
 */
export function searchIndex(index, query) {
    let q = tokens(query, { query: true });
    if (!q.length) q = tokens(query);
    if (!q.length) return [];
    let phraseToks = tokens(query).filter((w) => !HARD_STOP.has(w));
    const wantsVocab = q.some((w) => /^(vocab|words?$|definition|glossary|terms?$|keyword)/.test(w));
    const wantsWords = q.some((w) => /^(word|story|stories|problem|context|real)/.test(w));
    // a likely keyboard slip is corrected to its nearest vocabulary word ('subtracton' -> 'subtraction',
    // 'tme' -> 'time', 'aera' -> 'area'); a correctly spelt real word is never rewritten (critic r2 P-A)
    const fixes = correctWords(index, q);
    const fuzz = q.map(() => []);
    for (const f of fixes) {
        const j = phraseToks.indexOf(f.from);
        if (j >= 0) phraseToks[j] = f.to;
        q[f.at] = f.to;
    }
    // 'divided by 2', 'divide 2' (from '÷2') and 'dividing by 2' all read as 'divide by 2' (critic r2 P-B)
    // Only a bare divisor: never before digit/digits/numbers, never inside 'N÷M' or 'b×h÷2' (critic r3 P-D)
    let phrase = (phraseToks.join(' ') || q.join(' ')).replace(/(^|\s)(\S+ )?(?:divide|divided|dividing|divides)(?: by)? (\d+)(?= (\S+)|$)/g,
        (m, sp, prev, n, next) => ((prev && /^(\d+|[a-z]|times|x) $/.test(prev)) || (next && /^(digit|digits|numbers?|divide|by|times|x)$/.test(next))
            ? m : `${sp}${prev || ''}divide by ${n}`));
    // a fact-sized product typed as a sum ('3*4', '7 x 8') reads as the times tables (critic r2 P-C)
    const fact = phrase.match(/^(\d{1,2}) (?:times x|times|x) (\d{1,2})$/);
    if (fact && +fact[1] <= 12 && +fact[2] <= 12) phrase = 'times x';
    const qFam = q.map((w) => stem(w));
    // the divisor in 'divide by 2' is not the '2' of '2÷1 digit', '2-Digit' or 'b×h÷2' (critic r2 P-B)
    const divBy = (phrase.match(/\bdivide by (\d+)(?! (?:digit|digits|numbers?|divide|by|times|x)\b)(?= |$)/) || [])[1];
    const divNoise = divBy && new RegExp(`(^| )${divBy} (digit|divide)|divide ${divBy}( |$)`);
    const out = [];
    for (const it of index.items) {
        let score = 0, labelHits = 0;
        let ok = true;
        // a label whose N is 'N digit' / 'N÷M', or a skill without this divisor, is demoted, never excluded (critic r3 P-D, R-C)
        let divPen = 0;
        if (divBy && !it.phrases.extra.includes(`divide by ${divBy}`)) divPen = divNoise.test(it.terms.label) ? 20 : 4;
        // a label that names its own divisors ('Divide by 10, 100, 1,000') is not a 'divide by 2' skill (critic r3 R-C)
        const ownDiv = divBy && it.terms.label.match(/\bdivide by ((?:\d+ ?)+)/);
        if (ownDiv && !ownDiv[1].trim().split(' ').includes(divBy)) continue;
        for (let i = 0; i < q.length && ok; i++) {
            const w = q[i];
            if (tokHits(it.sets[0], w)) { score += W_LABEL; labelHits++; }
            else if (tokHits(it.sets[0], w)) { score += W_LABEL; labelHits++; }
            else if (tokHits(it.sets[1], w)) score += W_EXTRA;
            else if (tokHits(it.sets[2], w)) score += W_GRADE;
            else if (tokHits(it.sets[3], w)) score += W_CONCEPT;
            else if (tokHits(it.sets[4], w)) score += W_CODE;
            else if (fuzz[i].some((v) => it.sets.some((s) => s.has(v)))) score += W_FUZZY;
            else ok = false;
        }
        if (!ok) continue;
        score -= divPen;
        // a vocabulary skill never leads a teaching query by matching its label (critic r2 R-B)
        if (it.vocab && !wantsVocab) score -= 3;
        else if (it.labelBare === phrase || it.terms.label === phrase) score += 100;
        else if (q.length > 1 && labelPhrase(it.labelBare, phrase)) score += 15;
        if (phrase.length >= 1) {
            if (it.primary.includes(phrase) || it.primary.includes(q.join(' '))) score += 60;
            if (it.phrases.extra.includes(phrase)) score += 14;
            else if (it.phrases.concept.includes(phrase)) score += 6;
        }
        score -= it.demote + (it.wp && !wantsWords ? 0.3 : 0);
        // relevance for equal scores (critic r1 R2): words in the label, then the family, then catalogue order
        const fam = qFam.filter((w) => it.family.has(w)).length;
        out.push({ entry: it.entry, score, labelHits, fam, order: it.order });
    }
    out.sort((a, b) => b.score - a.score || b.labelHits - a.labelHits || b.fam - a.fam || a.order - b.order);
    return out.map(({ entry, score }) => ({ entry, score }));
}

/** The phrase appears in the label as whole words — and a number in it is not the start of 'N digit'
 *  ('divide by 2' is not 'Divide by 2-Digit Numbers'). */
function labelPhrase(label, phrase) {
    const hay = ` ${label} `;
    let at = hay.indexOf(` ${phrase} `);
    while (at >= 0) {
        const rest = hay.slice(at + phrase.length + 2);
        if (!(/\d$/.test(phrase) && /^digit/.test(rest))) return true;
        at = hay.indexOf(` ${phrase} `, at + 1);
    }
    return false;
}
