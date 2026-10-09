// ws-search-terms — GATE for the skill search (owner request 2026-10-03: "list all the ways someone
// could search for it and make sure they are tagged with all of them").
//   node tests/scripts/ws-search-terms.cjs            gate: exits non-zero on failure
//   node tests/scripts/ws-search-terms.cjs --dump     per-skill term counts and concepts, family by family
//   node tests/scripts/ws-search-terms.cjs --q "take away"   show the top 10 for one query
// Node only: imports js/modules/skill-finder.js (the code every search box calls) with the standards
// and WRM terms loaded.
//   (a) every live skill has >= 5 distinct search terms beyond its label
//   (b) every query in QUERIES has its listed skills in the top 5
//   (c) no query in QUERIES returns zero results
//   (d) every PRIMARY_SKILLS phrase ranks its skill first (list and grouped picker)
//   (e) every query in TOP1 ranks an allowed skill FIRST and keeps the named wrong skills out of the top 5
//       (TOP2 pins a second place)
//   (f) EXPECT0 real words no skill teaches return nothing (never "corrected" into another word)
//   (g) CORRECTIONS: the "Showing results for" text a query gets, or none
const path = require('path');
const { pathToFileURL } = require('url');

const MOD = (f) => pathToFileURL(path.join(__dirname, '../../js/modules', f)).href;

// [query, [skills that MUST be in the top 5, as 'category:skill']]
const QUERIES = [
    // the owner's case
    ['skip counting', ['multiplication:count_by_tables']],
    ['skip count', ['multiplication:count_by_tables']],
    ['skip countin', ['multiplication:count_by_tables']],
    ['skipcounting', ['multiplication:count_by_tables']],
    ['count by', ['multiplication:count_by_tables']],
    ['counting in 3s', ['multiplication:count_by_tables']],
    ['count by 1-12', ['multiplication:count_by_tables']],
    ['count by 2s', ['patterns:seq_2']],
    ['counting in 5s', ['patterns:seq_5']],
    ['count in tens', ['patterns:seq_10']],
    ['times tables', ['multiplication:mult_facts', 'multiplication:count_by_tables']],
    ['timestables', ['multiplication:mult_facts']],
    ['times table', ['multiplication:mult_facts']],
    ['multiplication tables', ['multiplication:mult_facts']],
    ['multiplication square', ['multiplication:mult_chart']],
    // addition
    ['plus', ['addition:add_facts']],
    ['+', ['addition:add_facts']],
    ['add', ['addition:add_facts']],
    ['adding', ['addition:add_facts']],
    ['addition', ['addition:add_facts']],
    ['additon', ['addition:add_facts']],
    ['addition facts', ['addition:add_facts']],
    ['sum', ['addition:add_facts']],
    ['altogether', ['addition:add_5_pictures']],
    ['carrying', ['addition:add_100_regroup']],
    ['carry', ['addition:add_100_regroup']],
    ['regrouping addition', ['addition:add_100_regroup']],
    ['2 digit addition', ['addition:add_100_no_regroup']],
    ['two digit addition', ['addition:add_100_regroup']],
    ['3 digit addition', ['addition:add_1k_mixed']],
    ['add within 20', ['addition:add_20_mixed']],
    ['addition within 100', ['addition:add_100_mixed']],
    ['add within 1000', ['addition:add_1k_mixed']],
    ['addition no regrouping', ['addition:add_20_no_regroup']],
    ['column addition', ['addition:add_column_multi']],
    ['add three numbers', ['addition:add_three']],
    ['addition word problems', ['addition:add_word_problems']],
    ['adding story problems', ['addition:add_word_problems']],
    ['bridging ten', ['addition:add_10_regroup']],
    ['missing addend', ['addition:cloze_addition']],
    // subtraction
    ['take away', ['subtraction:sub_facts']],
    ['takeaway', ['subtraction:sub_facts']],
    ['minus', ['subtraction:sub_facts']],
    ['-', ['subtraction:sub_facts']],
    ['subtract', ['subtraction:sub_facts']],
    ['subtration', ['subtraction:sub_facts']],
    ['substraction', ['subtraction:sub_facts']],
    ['subtraction facts', ['subtraction:sub_facts']],
    ['borrowing', ['subtraction:sub_100_regroup']],
    ['borrow', ['subtraction:sub_100_regroup']],
    ['exchanging subtraction', ['subtraction:sub_20_regroup']],
    ['subtract within 20', ['subtraction:sub_20_mixed']],
    ['subtract within 100', ['subtraction:sub_100_mixed']],
    ['2 digit subtraction', ['subtraction:sub_100_no_regroup']],
    ['subtract across zeros', ['subtraction:sub_across_zeros']],
    ['subtraction word problems', ['subtraction:sub_word_problems']],
    ['difference', ['subtraction:sub_facts']],
    ['how many more', ['addition:comparison_word']],
    ['add and subtract', ['subtraction:mixed_add_sub']],
    // multiplication & division
    ['times', ['multiplication:mult_facts']],
    ['multiply', ['multiplication:mult_facts']],
    ['multipication', ['multiplication:mult_facts']],
    ['multiplcation', ['multiplication:mult_facts']],
    ['x', ['multiplication:mult_facts']],
    ['lots of', ['multiplication:multiply']],
    ['groups of', ['multiplication:arrays_groups']],
    ['arrays', ['multiplication:arrays_groups']],
    ['repeated addition', ['multiplication:repeated_add_to_mult']],
    ['area model multiplication', ['multiplication:area_model_mult']],
    ['grid method', ['multiplication:area_model_mult']],
    ['multiply by 10', ['multiplication:mult_zeros']],
    ['divide', ['division:div_facts']],
    ['division', ['division:div_facts']],
    ['divison', ['division:div_facts']],
    ['divided by', ['division:div_facts']],
    ['÷', ['division:div_facts']],
    ['sharing', ['division:share_into_groups']],
    ['share equally', ['division:share_into_groups']],
    ['remainders', ['division:div_remainders']],
    ['long division', ['division:long_div_2digit']],
    ['bus stop', ['division:box_division_easy']],
    ['fact families', ['addition:add_sub_fact_family']],
    ['multiplication fact family', ['multiplication:mult_div_fact_family']],
    ['inverse', ['subtraction:sub_check_by_adding']],
    ['four operations', ['number_ops_mixed:mixed']],
    // early number
    ['number bonds', ['composing:number_bonds']],
    ['bonds to 10', ['composing:make_ten']],
    ['make 10', ['composing:make_ten']],
    ['part whole', ['composing:number_bonds']],
    ['ten frame', ['composing:ten_frame_build']],
    ['teen numbers', ['composing:teen_compose']],
    ['counting objects', ['counting:count_objects']],
    ['how many', ['counting:count_objects']],
    ['one more one less', ['placevalue:more_less_10']],
    ['number after', ['counting:count_sequence']],
    ['odd and even', ['composing:odd_even']],
    ['even numbers', ['composing:odd_even']],
    ['hundred square', ['composing:hundreds_chart_fill']],
    ['100 square', ['composing:hundreds_chart_fill']],
    ['hundreds chart', ['composing:hundreds_chart_fill']],
    ['number grid', ['composing:hundreds_chart_fill']],
    ['more or fewer', ['comparing:compare_groups']],
    ['base ten blocks', ['composing:base10_build']],
    ['dienes', ['composing:base10_build']],
    ['number line', ['addition:nl_add']],
    ['number words', ['composing:number_word_form']],
    // place value & number sense
    ['place value', ['placevalue:place_value_disks']],
    ['tens and ones', ['placevalue:identify']],
    ['value of a digit', ['placevalue:value']],
    ['expanded form', ['placevalue:expand']],
    ['standard form', ['placevalue:combine']],
    ['compare numbers', ['placevalue:compare']],
    ['greater than less than', ['placevalue:compare']],
    ['order numbers', ['placevalue:order_least_to_greatest']],
    ['rounding', ['number_sense:nearest_10']],
    ['round to nearest 10', ['number_sense:nearest_10']],
    ['round to the nearest hundred', ['number_sense:nearest_100']],
    ['estimate', ['number_sense:estimate_sum']],
    ['doubles', ['number_sense:doubles_near_doubles']],
    ['halving', ['patterns:halve']],
    ['doubling', ['patterns:double']],
    // fractions, decimals, percents
    ['fractions', ['fractions:identify']],
    ['fracions', ['fractions:identify']],
    ['half', ['shapes_early:partition_shapes']],
    ['halves and quarters', ['shapes_early:partition_shapes']],
    ['equivalent fractions', ['fractions:equivalent']],
    ['simplify fractions', ['fractions:simplify']],
    ['lowest terms', ['fractions:simplify']],
    ['improper fractions', ['fractions:improper_mixed']],
    ['mixed numbers', ['fractions:improper_mixed']],
    ['add fractions', ['fraction_operations:add_fractions_like']],
    ['adding fractions', ['fraction_operations:add_fractions_like']],
    ['subtract fractions', ['fraction_operations:sub_fractions_like']],
    ['multiply fractions', ['fraction_operations:mult_frac_frac']],
    ['compare fractions', ['fractions:compare']],
    ['fractions on a number line', ['composing:fraction_number_line']],
    ['fraction of a set', ['fractions:fraction_of_set']],
    ['decimals', ['decimals:add_decimal']],
    ['adding decimals', ['decimals:add_decimal']],
    ['decimels', ['decimals:add_decimal']],
    ['tenths', ['number_sense:round_sort_tenths']],
    ['percent', ['conversions:percent_visual']],
    ['percentage', ['conversions:percent_visual']],
    ['%', ['conversions:percent_visual']],
    ['ratio', ['conversions:ratio_intro']],
    ['negative numbers', ['integers:number_line_int']],
    ['integers', ['integers:add_int']],
    // time & money & measures
    ['telling time', ['measurement:time_hour']],
    ['tell the time', ['measurement:time_hour']],
    ["o'clock", ['measurement:time_hour']],
    ['oclock', ['measurement:time_hour']],
    ['half past', ['measurement:time_half_hour']],
    ['quarter past', ['measurement:time_quarter']],
    ['quarter to', ['measurement:time_quarter']],
    ['clock', ['measurement:time_hour']],
    ['elapsed time', ['measurement:elapsed_30min']],
    ['am pm', ['measurement:time_sense']],
    ['money', ['measurement:money_count']],
    ['coins', ['measurement:money_count']],
    ['cents', ['measurement:money_count']],
    ['pence', ['measurement:money_count']],
    ['change', ['measurement:money_change']],
    ['measuring length', ['measurement:reading_ruler']],
    ['ruler', ['measurement:reading_ruler']],
    ['centimetres', ['measurement:length_metric']],
    ['weight', ['measurement:heavier_lighter_visual']],
    ['mass', ['measurement:mass_volume_liquid']],
    ['capacity', ['measurement:capacity']],
    ['temperature', ['measurement:temperature']],
    ['unit conversions', ['measurement:unit_conversions']],
    // geometry
    ['shapes', ['shapes_early:name_2d_shapes']],
    ['2d shapes', ['shapes_early:name_2d_shapes']],
    ['3d shapes', ['shapes_early:name_3d_shapes']],
    ['3-D shapes', ['shapes_early:name_3d_shapes']],
    ['faces edges vertices', ['shapes_early:count_edges_faces_vertices']],
    ['perimeter', ['area_perimeter:perimeter']],
    ['perimiter', ['area_perimeter:perimeter']],
    ['area', ['area_perimeter:area']],
    ['volume', ['area_perimeter:volume']],
    ['angles', ['angles_lines:identify_angles']],
    ['right angle', ['angles_lines:identify_angles']],
    ['protractor', ['angles_lines:measure_angles']],
    ['parallel lines', ['angles_lines:identify_lines']],
    ['symmetry', ['angles_lines:symmetry']],
    ['line of symmetry', ['angles_lines:symmetry']],
    ['quadrilaterals', ['shapes_classify:classify_quads']],
    ['triangles', ['shapes_classify:classify_triangles']],
    ['coordinates', ['coordinates:coordinate_q1']],
    ['reflection', ['coordinates:geo_reflect']],
    ['nets', ['shapes_classify:net_identify']],
    // data
    ['pictogram', ['graphs:pictograph']],
    ['pictograph', ['graphs:pictograph']],
    ['picture graph', ['graphs:pictograph']],
    ['bar chart', ['graphs:bar_graph']],
    ['bar graph', ['graphs:bar_graph']],
    ['tally', ['graphs:tally_chart']],
    ['tally chart', ['graphs:tally_chart']],
    ['line plot', ['graphs:line_plot']],
    ['dot plot', ['graphs:line_plot']],
    ['pie chart', ['graphs:pie_chart']],
    ['average', ['data_analysis:mean']],
    ['mean median mode', ['data_analysis:mean']],
    ['probability', ['probability:probability_basic']],
    ['chance', ['probability:probability_basic']],
    // algebra
    ['patterns', ['patterns:number_pattern']],
    ['bar model', ['algebra:tape_diagram']],
    ['tape diagram', ['algebra:tape_diagram']],
    ['order of operations', ['order_of_operations:oop_easy']],
    ['bodmas', ['order_of_operations:oop_easy']],
    ['pemdas', ['order_of_operations:oop_easy']],
    ['solve for x', ['algebra:solve_unknown']],
    ['equations', ['algebra:solve_eq_addsub']],
    ['balance equations', ['algebra:balance_addsub']],
    ['equal sign', ['addition:equal_sign']],
    ['factors', ['number_theory:factors_identify']],
    ['prime numbers', ['number_theory:prime_composite']],
    ['multiples', ['number_theory:multiples']],
    ['lcm', ['number_theory:lcm']],
    ['hcf', ['number_theory:gcf_easy']],
    ['exponents', ['order_of_operations:exponents_simple']],
    ['vocabulary', ['vocabulary:vocab_grade_K']],
    // curriculum codes and grades
    ['2.NBT.2', ['patterns:seq_2']],
    ['2.nbt.a.2', ['patterns:seq_2']],
    ['3.OA.7', ['multiplication:mult_facts']],
    ['K.CC.5', ['counting:count_objects']],
    ['EE.3.OA.8', ['multiplication:count_by_tables']],
    ['year 2 fractions', ['fractions:identify']],
    ['grade 1 fractions', ['shapes_early:partition_shapes']],
    ['grade 3 multiplication', ['multiplication:mult_facts']],
    ['kindergarten counting', ['counting:count_objects']],
    ['y3 times tables', ['multiplication:count_by_tables']],
    ['2nd grade addition', ['addition:add_50_no_regroup']],
];


// [query, the skill(s) allowed at RANK 1, and optionally skills that must NOT be in the top 5].
// Every query the round-1 critic reported (P1-P3, C1-C5, R1-R2) plus its 40-query sample.
const TOP1 = [
    // critic r1 P1: 'multiples' in mult_zeros's label must not give it skip counting or primes
    ['factors and multiples', ['number_theory:factors_identify', 'number_theory:multiples'], ['multiplication:mult_zeros']],
    ['prime', ['number_theory:prime_composite'], ['multiplication:mult_zeros']],
    ['skip counting', ['multiplication:count_by_tables'], ['multiplication:mult_zeros']],
    // P2
    ['column subtraction', ['subtraction:sub_100_regroup'], ['addition:add_column_multi', 'addition:add_20_regroup', 'addition:add_10_no_regroup']],
    ['column addition', ['addition:add_column_multi']],
    // P3
    ['divide by 2', ['patterns:halve', 'division:div_facts']],
    ['round to the nearest hundred', ['number_sense:nearest_100']],
    ['number bonds to 20', ['composing:number_bonds', 'composing:make_ten']],
    ['less', ['placevalue:more_less_10', 'comparing:compare_groups', 'placevalue:compare']],
    ['square numbers', ['order_of_operations:exponents_simple']],
    ['counting to 10', ['counting:count_objects', 'counting:count_sequence']],
    ['multiplication 2 digit by 1 digit', ['multiplication:multiply']],
    ['multiply by 1 digit', ['multiplication:multiply']],
    // C1
    ['short multiplication', ['multiplication:multiply']],
    ['standard algorithm multiplication', ['multiplication:multiply']],
    ['column multiplication', ['multiplication:multiply']],
    ['long multiplication', ['multiplication:multiply']],
    ['formal written method', ['multiplication:multiply', 'addition:add_100_regroup', 'subtraction:sub_100_regroup', 'addition:add_10_no_regroup']],
    // C2-C5
    ['subitizing', ['counting:count_objects']],
    ['subitising', ['counting:count_objects']],
    ['*', ['multiplication:mult_facts']],
    ['compound shapes', ['area_perimeter:composite_shapes']],
    ['composite shapes', ['area_perimeter:composite_shapes']],
    ['making change', ['measurement:money_change']],
    ['decimals', ['decimals:decimal_nl_drag']],
    ['percentages', ['conversions:percent_visual']],
    // R1: misspellings not in MISSPELLINGS rank like the word meant
    ['subtracton', ['subtraction:sub_facts']],
    ['rouding', ['number_sense:nearest_10']],
    ['perimter', ['area_perimeter:perimeter']],
    ['telling tme', ['measurement:time_hour']],
    ['multiplcation', ['multiplication:mult_facts']],
    ['fracton', ['fractions:identify']],
    // the critic's 40-query sample (the 31 that passed must keep passing)
    ['count by 3s', ['multiplication:count_by_tables']],
    ['times tables 7', ['multiplication:mult_facts', 'multiplication:count_by_tables']],
    ['x tables', ['multiplication:mult_facts']],
    ['long division', ['division:long_div_2digit']],
    ['dividing with remainders', ['division:div_remainders']],
    ['double digit addition', ['addition:add_100_regroup', 'addition:add_100_no_regroup', 'addition:add_100_mixed']],
    ['subtraction with regrouping', ['subtraction:sub_100_regroup', 'subtraction:sub_20_regroup']],
    ['expanded form', ['placevalue:expand']],
    ['compare numbers', ['placevalue:compare']],
    ['ordering numbers', ['placevalue:order_least_to_greatest', 'placevalue:order_greatest_to_least']],
    ['equivalent fractions', ['fractions:equivalent']],
    ['adding fractions', ['fraction_operations:add_fractions_like']],
    ['mixed numbers', ['fractions:improper_mixed']],
    ['percent of a number', ['conversions:percent_of_number']],
    ['ratio', ['conversions:ratio_intro']],
    ['negative numbers', ['integers:number_line_int']],
    ['telling the time', ['measurement:time_hour']],
    ['half past', ['measurement:time_half_hour']],
    ['quarter to', ['measurement:time_quarter']],
    ['money', ['measurement:money_count']],
    ['coins', ['measurement:money_count']],
    ['perimeter', ['area_perimeter:perimeter']],
    ['volume', ['area_perimeter:volume']],
    ['symmetry', ['angles_lines:symmetry']],
    ['coordinates', ['coordinates:coordinate_q1']],
    ['tally chart', ['graphs:tally_chart']],
    ['pictogram', ['graphs:pictograph']],
    ['bar chart', ['graphs:bar_graph']],
    ['bodmas', ['order_of_operations:oop_easy']],
    ['fact families', ['addition:add_sub_fact_family']],
    // critic r2: real words are never rewritten (P-A), divide-by variants (P-B), the grid method is not
    // short multiplication (P-C), analogue (C-A), position and direction / aera (C-C), part whole (R-A),
    // vocabulary never leads a teaching query (R-B)
    ['tile', ['area_perimeter:area_unit_squares', 'area_perimeter:area'], ['measurement:time_hour']],
    ['tiles', ['area_perimeter:area_unit_squares', 'area_perimeter:area'], ['multiplication:mult_facts']],
    ['tiling', ['area_perimeter:area_unit_squares', 'area_perimeter:area']],
    ['divide by 2', ['patterns:halve']],  // r3: 'N digit' skills are demoted below, never excluded
    ['divided by 2', ['patterns:halve']],  // r3: 'N digit' skills are demoted below, never excluded
    ['÷2', ['patterns:halve']],  // r3: 'N digit' skills are demoted below, never excluded
    ['÷ 2', ['patterns:halve']],  // r3: 'N digit' skills are demoted below, never excluded
    ['divided by 7', ['division:div_facts']],
    ['short multiplication', ['multiplication:multiply'], ['multiplication:area_model_mult_hard']],
    ['standard algorithm multiplication', ['multiplication:multiply'], ['multiplication:area_model_mult_hard']],
    ['multiply by 1 digit', ['multiplication:multiply'], ['multiplication:area_model_mult_hard']],
    ['3*4', ['multiplication:mult_facts']],
    ['7 x 8', ['multiplication:mult_facts']],
    ['analogue clock', ['measurement:time_analog_digital']],
    ['analog clock', ['measurement:time_analog_digital']],
    ['analogue', ['measurement:time_analog_digital']],
    ['position and direction', ['shapes_early:shape_positions']],
    ['aera', ['area_perimeter:area']],
    ['part whole model', ['composing:number_bonds']],
    ['grade 4 fractions', ['fractions:select_equiv_frac', 'fractions:equivalent', 'fractions:fraction_of_set_hard', 'fractions:identify', 'fractions:compare'], ['vocabulary:vocab_grade_4']],
    ['kindergarten counting', ['counting:count_objects', 'counting:count_sequence'], ['vocabulary:vocab_grade_K']],
    ['vocabulary', ['vocabulary:vocab_grade_K']],
    ['skip counting', ['multiplication:count_by_tables']],
    ['times tables 7', ['multiplication:mult_facts']],
    // critic r3 P-D: a digit count or 'N÷M' is never a divisor
    ['divide by 2 digit numbers', ['division:long_div_2digit']],
    ['Divide by 2-Digit Numbers', ['division:long_div_2digit']],
    ['divide by 2-digit', ['division:long_div_2digit']],
    ['divide 2 digit by 1 digit', ['division:box_division_easy', 'division:area_model_div_2by1']],
    ['divide 3 digit by 1 digit', ['division:box_division_hard', 'division:area_model_div_3by1']],
    ['dividing 3 digit numbers', ['division:box_division_hard', 'division:area_model_div_3by1']],
    ['divide by 1 digit', ['division:box_division_easy', 'division:box_division_hard', 'division:area_model_div_2by1', 'division:area_model_div_3by1']],
    ['Box Method Division (2÷1 digit)', ['division:box_division_easy']],
    ['Box Method Division (3÷1 digit)', ['division:box_division_hard']],
    ['Area Model Division (2÷1 digit)', ['division:area_model_div_2by1']],
    ['Area Model Division (3÷1 digit)', ['division:area_model_div_3by1']],
    ['Area of a Triangle (b×h÷2)', ['area_perimeter:area_triangle']],
    // critic r3 C-D / C-E
    ['equivalent fractions no visuals', ['fractions:equiv_frac_nv']],
    ['addition word problems no pictures', ['addition:add_word_problems_plain']],
    ['vertex', ['shapes_early:count_sides_vertices_2d']],
    // critic r4 R-D / R-E / C-F
    ['corner', ['shapes_early:shape_corners_count']],
    ['decimals to fractions', ['conversions:d_to_f']],
    ['fractions to decimals', ['conversions:f_to_d']],
    ['commutative property', ['multiplication:mult_properties']],
    ['input output', ['algebra:function_table_easy', 'algebra:function_table_hard']],
    ['clockwise', ['angles_lines:identify_angles']],
    ['midnight', ['measurement:time_sense']],
    ['10 times bigger', ['placevalue:place_value_10x']],
    ['numicon', ['composing:number_bonds', 'composing:make_ten']],
    ['quatre past', ['measurement:time_quarter']],
    // critic r5 P-E / R-F / C-G / R-G: a property query lands on a skill that deals that property
    ['commutative', ['multiplication:mult_properties']],
    ['commutative addition', ['addition:add_sub_fact_family']],
    ['commutative property of addition', ['addition:add_sub_fact_family']],
    ['turnaround facts addition', ['addition:add_sub_fact_family']],
    ['commutative property of multiplication', ['multiplication:mult_properties']],
    ['distributive property', ['algebra:distributive_expr']],
    ['zero property', ['multiplication:mult_properties']],
    ['identity property', ['multiplication:mult_properties']],
    ['identity', ['multiplication:mult_properties']],
    ['multi digit multiplication', ['multiplication:multiply']],
    ['multi-digit multiplication', ['multiplication:multiply']],
    ['skip counting', ['multiplication:count_by_tables']],
];

// [query, the second skill] for a pinned order (critic r2 P-B: Halving first, Division Facts second)
const TOP2 = [
    ['divide by 2', 'division:div_facts'], ['divided by 2', 'division:div_facts'], ['÷2', 'division:div_facts'], ['÷ 2', 'division:div_facts'],
];

// Correctly spelt words no skill teaches: 0 results is the honest answer (they must NOT be "corrected"
// into a nearby vocabulary word: compass -> compare, east -> past, days -> ways, root -> foot ...).
const EXPECT0 = ['compass directions', 'lost', 'tie', 'pond', 'may', 'compass', 'east', 'west', 'north', 'south', 'days', 'bead', 'beads', 'root', 'calendar',
    // critic r5 P-E: no skill deals the associative property (Multiplication Properties deals commutative, distributive, identity, zero)
    'associative', 'associative property', 'associative property of addition', 'associative property of multiplication'];
// [query, the correction shown, or null for none]
const CORRECTIONS = [['tile', null], ['tiles', null], ['compass', null], ['days', null], ['full', null], ['area', null],
    ['tme', 'time'], ['aera', 'area'], ['perimter', 'perimeter'], ['subtracton', 'subtraction'], ['fractoins', 'fractions'],
    ['identity', null], ['identity property', null], ['associative', null], ['zero property', null],
    ['multiplcation', 'multiplication'], ['probabilty', 'probability'], ['perimter', 'perimeter']];

(async () => {
    globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
    const log = console.log;
    console.log = () => {};
    const finder = await import(MOD('skill-finder.js'));
    const st = await import(MOD('search-terms.js'));
    await finder.warmSkillSearch();
    console.log = log;
    const args = process.argv.slice(2);
    const top = (q, n) => finder.findSkills(q).slice(0, n);

    if (args[0] === '--q') {
        for (const h of top(args[1], 10)) console.log(`${h.score.toFixed(1).padStart(6)}  ${h.key}  ${h.label}`);
        return;
    }
    const entries = finder.skillSearchEntries();
    const counts = entries.map((e) => ({ e, n: st.termCount(st.termsFor(e)), c: st.conceptsFor(e.categoryId, e.skillId, e.label) }));
    if (args[0] === '--dump') {
        let fam = '';
        for (const { e, n, c } of counts) {
            if (e.categoryId !== fam) { fam = e.categoryId; console.log(`\n## ${fam}`); }
            console.log(`${String(n).padStart(4)}  ${e.skillId.padEnd(28)} ${c.join(', ')}`);
        }
        return;
    }
    const failures = [];
    // (a)
    for (const { e, n } of counts) if (n < 5) failures.push(`(a) ${e.key} has only ${n} search terms beyond its label`);
    const ns = counts.map((x) => x.n).sort((a, b) => a - b);
    // (b) + (c)
    let passed = 0;
    for (const [q, must] of QUERIES) {
        const all = finder.findSkills(q);
        if (!all.length) { failures.push(`(c) "${q}" returns no results`); continue; }
        const keys = all.slice(0, 5).map((h) => h.key);
        const miss = must.filter((k) => !keys.includes(k));
        if (miss.length) failures.push(`(b) "${q}": ${miss.join(', ')} not in top 5 (got ${keys.join(', ')})`);
        else passed++;
    }
    // (e) rank 1 (TOP1): the right skill FIRST, and the named wrong skills out of the top 5
    let top1ok = 0;
    for (const [q, first, never = []] of TOP1) {
        const all = finder.findSkills(q);
        const keys = all.slice(0, 5).map((h) => h.key);
        if (!all.length) { failures.push(`(e) "${q}" returns no results`); continue; }
        if (!first.includes(keys[0])) { failures.push(`(e) "${q}": rank 1 is ${keys[0]}, want ${first.join(' or ')}`); continue; }
        const bad = never.filter((k) => keys.includes(k));
        if (bad.length) { failures.push(`(e) "${q}": ${bad.join(', ')} must not be in the top 5`); continue; }
        top1ok++;
    }
    console.log(`ws-search-terms: ${top1ok}/${TOP1.length} rank-1 queries pass`);
    for (const [q, second] of TOP2) {
        const k = finder.findSkills(q)[1];
        if (!k || k.key !== second) failures.push(`(e) "${q}": rank 2 is ${k && k.key}, want ${second}`);
        // the grouped pickers (Navigator, Quiz builder, Sets) show the same second card (critic r3 R-C)
        const g = finder.groupByRank(finder.findSkills(q).map((h) => h.entry));
        const flat = g.flatMap((d) => d.items.flatMap((c) => c.items.map((x) => x.key)));
        if (flat[1] !== second) failures.push(`(e) "${q}": grouped picker rank 2 is ${flat[1]}, want ${second}`);
    }
    // (h) every live skill's own label finds that skill in the top 3 (critic r3 P-D)
    let selfOk = 0;
    for (const e of entries) {
        const keys = finder.findSkills(e.label).slice(0, 3).map((h) => h.key);
        if (keys.includes(e.key)) selfOk++;
        else failures.push(`(h) label "${e.label}" does not find ${e.key} in the top 3 (got ${keys.join(', ')})`);
    }
    console.log(`ws-search-terms: ${selfOk}/${entries.length} skills found by their own label`);
    for (const q of EXPECT0) {
        const all = finder.findSkills(q);
        if (all.length) failures.push(`(f) "${q}" should find nothing (no skill teaches it) but rank 1 is ${all[0].key}`);
    }
    for (const [q, want] of CORRECTIONS) {
        const c = finder.searchCorrection(q);
        const got = c ? c.to : null;
        if (got !== want) failures.push(`(g) "${q}": correction ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
    console.log(`ws-search-terms: ${TOP2.length} rank-2, ${EXPECT0.length} expected-empty and ${CORRECTIONS.length} correction checks run`);
    // (d) primary skills: every PRIMARY_SKILLS phrase puts its skill at rank 1 in findSkills AND first in
    //     a grouped picker (groupByRank: the order teacher-sets uses; the student list and teacher
    //     library show the ranked order directly. The Navigator / Quiz builder DOM reordering is checked
    //     in a real browser by tests/scripts/ws-search-order.cjs)
    let prim = 0;
    for (const [key, phrases] of Object.entries(st.PRIMARY_SKILLS)) {
        for (const q of phrases) {
            const hits = finder.findSkills(q);
            const first = hits[0] && hits[0].key;
            const g = finder.groupByRank(hits.map((h) => h.entry));
            const groupedFirst = g[0] && g[0].items[0] && g[0].items[0].items[0] && g[0].items[0].items[0].key;
            if (first !== key) failures.push(`(d) "${q}": rank 1 is ${first}, not primary ${key}`);
            else if (groupedFirst !== key) failures.push(`(d) "${q}": grouped picker shows ${groupedFirst} first, not ${key}`);
            else prim++;
        }
    }
    console.log(`ws-search-terms: ${prim} primary-skill queries rank 1 in the list and in grouped pickers`);
    if (QUERIES.length < 150) failures.push(`query table has ${QUERIES.length} queries, needs >= 150`);
    console.log(`ws-search-terms: ${entries.length} skills, terms per skill min ${ns[0]} / median ${ns[Math.floor(ns.length / 2)]} / max ${ns[ns.length - 1]}; ${passed}/${QUERIES.length} queries pass`);
    if (failures.length) {
        for (const f of failures) console.log('  ' + f);
        console.log('ws-search-terms: FAIL');
        process.exit(1);
    }
    console.log('ws-search-terms: OK');
})().catch((e) => { console.error(e); console.log('ws-search-terms: FAIL'); process.exit(1); });
