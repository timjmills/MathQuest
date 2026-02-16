// generate-question.js - Dispatcher: routes to domain-specific question generators
import { state } from './state.js';
import { DEFAULT_TABLES } from './data.js';
import { randInt, pick, buildNumericOptions } from './utils.js';

// Domain-specific generators
import { generateOperationsQuestion, generateIntegersQuestion } from './gen-operations.js';
import { generateFractionsQuestion, generateConversionsQuestion, generateDecimalsQuestion } from './gen-fractions.js';
import { generateGeometryQuestion } from './gen-geometry.js';
import { generateMeasurementQuestion } from './gen-measurement.js';
import { generateDataStatsQuestion } from './gen-data-stats.js';
import { generateOrderOfOpsQuestion, generatePatternsQuestion, generateRoundingQuestion, generatePlaceValueQuestion, generateEstimationQuestion, generateAlgebraQuestion } from './gen-algebraic.js';
import { generateNumberTheoryQuestion } from './gen-number-theory.js';
import { generateCountingQuestion } from './gen-counting.js';

export function generateQuestion() {
    const q = { text: "", ans: 0, hint: "", options: [], answerType: "number", visual: "", skillLabel: "" };
    const rng = (min, max) => randInt(min, max);
    const range = state.range;

    // Helper function to apply decimal places to a number
    const applyDecimals = (num) => {
        if (state.decimalPlaces === 0) return num;
        const shift = Math.pow(10, state.decimalPlaces);
        const decimalPart = rng(1, shift - 1) / shift;
        return parseFloat((num + decimalPart).toFixed(state.decimalPlaces));
    };

    const ensureTables = () => {
        if (!state.selectedNumbers.length) state.selectedNumbers = [...DEFAULT_TABLES];
        return state.selectedNumbers;
    };

    const helpers = { rng, range, applyDecimals, ensureTables };

    // Map new categories to legacy category handling
    const categoryMapping = {
        // Number & Operations categories
        'addition': 'operations',
        'subtraction': 'operations',
        'multiplication': 'operations',
        'division': 'operations',
        'integers': 'integers',
        'number_ops_mixed': 'operations',
        // Domain-level mixed categories (auto-generated)
        'domain_mixed_number_operations': 'all_mixed',
        'domain_mixed_fractions_decimals': 'all_mixed',
        'domain_mixed_geometry_measurement': 'all_mixed',
        'domain_mixed_data_statistics': 'all_mixed',
        'domain_mixed_algebraic_thinking': 'all_mixed',
        // Counting & Cardinality
        'counting': 'counting_cardinality',
        'comparing': 'counting_cardinality',
        'composing': 'counting_cardinality',
        'counting_mixed': 'counting_cardinality',
        // Fractions, Decimals & Percents categories
        'fractions': 'fractions',
        'fraction_operations': 'fractions',
        'decimals': 'decimals',
        'conversions': 'conversions',
        'frac_dec_mixed': 'fractions',
        // Geometry & Measurement categories
        'area_perimeter': 'geometry',
        'angles_lines': 'geometry',
        'shapes_classify': 'geometry',
        'shapes_early': 'geometry',
        'coordinates': 'geometry',
        'measurement': 'measurement',
        'geo_mixed': 'geometry',
        // Data & Statistics categories
        'graphs': 'data_stats',
        'data_analysis': 'data_stats',
        'probability': 'data_stats',
        'data_mixed': 'data_stats',
        // Algebraic Thinking categories
        'patterns': 'patterns',
        'algebra': 'algebra',
        'order_of_operations': 'order_of_operations',
        'placevalue': 'placevalue',
        'number_sense': 'rounding',
        'number_theory': 'number_theory',
        'algebra_mixed': 'algebra',
        // Mixed
        'all_mixed': 'all_mixed'
    };

    // Map new skill names to legacy skill names
    const skillMapping = {
        'mixed_area_perimeter': 'mixed',
        'mixed_angles_lines': 'mixed',
        'mixed_shapes': 'mixed',
        'mixed_coordinates': 'coordinate_graph',
        'mixed_measurement': 'mixed',
        'mixed_graphs': 'mixed',
        'mixed_data_analysis': 'mixed',
        'mixed_probability': 'probability',
        'mixed_patterns': 'mixed',
        'mixed_algebra': 'mixed',
        'mixed_order_ops': 'mixed',
        'mixed_placevalue': 'mixed',
        'mixed_number_sense': 'mixed',
        'mixed_number_theory': 'mixed',
        'probability_basic': 'probability',
        'all_domains_mixed': 'mixed',
        'fdp_all': 'mixed',
        'geo_meas_all': 'mixed',
        'algebraic_all': 'mixed',
        'number_sense_all': 'mixed',
    };

    // Handle category-specific mixed skills - randomly pick from all skills in that category
    const categoryMixedSkills = {
        'mixed_addition': {
            category: 'addition',
            skills: ['add_facts', 'add_sub_10s', 'add_sub_100s', 'add', 'add_word_problems', 'add_sub_fact_family', 'number_families_add', 'number_families_add_med', 'number_families_add_hard']
        },
        'mixed_subtraction': {
            category: 'subtraction',
            skills: ['sub_facts', 'subtract', 'sub_word_problems', 'missing_add_sub', 'mixed_add_sub']
        },
        'mixed_multiplication': {
            category: 'multiplication',
            skills: ['mult_facts', 'multiply', 'arrays_groups', 'mult_properties', 'mult_chart', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard', 'mult_div_fact_family', 'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard']
        },
        'mixed_division': {
            category: 'division',
            skills: ['div_facts', 'divide', 'div_remainders', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1', 'missing_mult_div', 'mixed_mult_div']
        },
        'mixed_integers': {
            category: 'integers',
            skills: ['number_line_int', 'compare_int', 'add_int', 'sub_int']
        },
        'mixed_fractions': {
            category: 'fractions',
            skills: ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed', 'mixed_improper_visual', 'fraction_of_set', 'fraction_of_set_hard', 'equiv_frac_visual']
        },
        'mixed_decimals': {
            category: 'decimals',
            skills: ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal']
        },
        'mixed_conversions': {
            category: 'conversions',
            skills: ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f']
        },
        'operations_all': {
            category: 'operations',
            skills: [
                'add_facts', 'add', 'add_word_problems', 'add_sub_fact_family', 'number_families_add', 'number_families_add_med', 'number_families_add_hard',
                'sub_facts', 'subtract', 'sub_word_problems', 'missing_add_sub', 'mixed_add_sub',
                'mult_facts', 'multiply', 'arrays_groups', 'mult_properties', 'mult_chart', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard', 'mult_div_fact_family',
                'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard',
                'div_facts', 'divide', 'div_remainders', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1', 'missing_mult_div', 'mixed_mult_div',
                'number_line_int', 'compare_int', 'add_int', 'sub_int',
                'number_families_mixed', 'number_families_mixed_med', 'number_families_mixed_hard'
            ]
        },
        'mixed_area_perimeter': {
            category: 'geometry',
            skills: ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume', 'area_unit_squares', 'perimeter_grid']
        },
        'mixed_angles_lines': {
            category: 'geometry',
            skills: ['identify_angles', 'measure_angles', 'identify_lines', 'symmetry']
        },
        'mixed_shapes': {
            category: 'geometry',
            skills: ['classify_triangles', 'classify_quads']
        },
        'mixed_coordinates': {
            category: 'geometry',
            skills: ['coordinate_q1', 'coordinate_all', 'coordinate_graph']
        },
        'mixed_measurement': {
            category: 'measurement',
            skills: ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                     'time_analog_digital', 'time_match_clock',
                     'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                     'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard',
                     'money', 'money_count', 'temperature', 'capacity', 'reading_ruler', 'reading_ruler_hard']
        },
        'mixed_time': {
            category: 'measurement',
            skills: ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                     'time_analog_digital', 'time_match_clock',
                     'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                     'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard']
        },
        'geometry_all': {
            category: 'geometry',
            skills: [
                'perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                'area_unit_squares', 'perimeter_grid',
                'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                'classify_triangles', 'classify_quads',
                'coordinate_q1', 'coordinate_all', 'coordinate_graph'
            ]
        },
        'measurement_all': {
            category: 'measurement',
            skills: ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                     'time_analog_digital', 'time_match_clock',
                     'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                     'money', 'money_count', 'temperature', 'capacity', 'reading_ruler', 'reading_ruler_hard']
        },
        'geo_meas_all': {
            category: 'geometry',
            skills: [
                'perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                'area_unit_squares', 'perimeter_grid',
                'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                'classify_triangles', 'classify_quads',
                'coordinate_q1', 'coordinate_all', 'coordinate_graph',
                'time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                'time_analog_digital', 'time_match_clock',
                'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                'money', 'money_count', 'temperature', 'capacity', 'reading_ruler', 'reading_ruler_hard'
            ]
        },
        'mixed_graphs': {
            category: 'data_stats',
            skills: ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart', 'line_plot_fractions']
        },
        'mixed_data_analysis': {
            category: 'data_stats',
            skills: ['mean', 'median', 'mode', 'range']
        },
        'mixed_probability': {
            category: 'data_stats',
            skills: ['probability_basic']
        },
        'data_stats_all': {
            category: 'data_stats',
            skills: [
                'bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart', 'line_plot_fractions',
                'mean', 'median', 'mode', 'range',
                'probability_basic'
            ]
        },
        'mixed_patterns': {
            category: 'patterns',
            skills: ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve', 'skip_count_line', 'skip_count_grid', 'shape_pattern', 'number_pattern']
        },
        'mixed_algebra': {
            category: 'algebra',
            skills: ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table_easy', 'function_table_hard', 'tape_diagram', 'multi_step_word']
        },
        'mixed_order_ops': {
            category: 'order_of_operations',
            skills: ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple']
        },
        'mixed_placevalue': {
            category: 'placevalue',
            skills: ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine', 'place_value_disks']
        },
        'mixed_number_sense': {
            category: 'number_sense',
            skills: ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff', 'rounding_visual']
        },
        'mixed_number_theory': {
            category: 'number_theory',
            skills: ['prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm']
        },
        'patterns_all': {
            category: 'patterns',
            skills: ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve', 'skip_count_line', 'skip_count_grid', 'shape_pattern', 'number_pattern']
        },
        'algebra_all': {
            category: 'algebra',
            skills: ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table_easy', 'function_table_hard', 'tape_diagram', 'multi_step_word']
        },
        'order_ops_all': {
            category: 'order_of_operations',
            skills: ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple']
        },
        'placevalue_all': {
            category: 'placevalue',
            skills: ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine', 'place_value_disks']
        },
        'number_sense_all': {
            category: 'number_sense',
            skills: ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff', 'rounding_visual']
        },
        'number_theory_all': {
            category: 'number_theory',
            skills: ['prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm']
        },
        'algebraic_all': {
            category: 'algebra',
            skills: [
                'seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve',
                'skip_count_line', 'skip_count_grid', 'shape_pattern', 'number_pattern',
                'solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table_easy', 'function_table_hard',
                'tape_diagram', 'multi_step_word',
                'two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple',
                'pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine', 'place_value_disks',
                'nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff', 'rounding_visual',
                'prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm'
            ]
        },
        'fractions_all': {
            category: 'fractions',
            skills: ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed', 'mixed_improper_visual', 'fraction_of_set', 'fraction_of_set_hard', 'equiv_frac_visual']
        },
        'decimals_all': {
            category: 'decimals',
            skills: ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal']
        },
        'conversions_all': {
            category: 'conversions',
            skills: ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f']
        },
        'fdp_all': {
            category: 'fractions',
            skills: [
                'identify', 'equivalent', 'compare', 'simplify', 'improper_mixed', 'mixed_improper_visual',
                'fraction_of_set', 'fraction_of_set_hard', 'equiv_frac_visual',
                'add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal',
                'f_to_d', 'd_to_f', 'f_to_p', 'p_to_f'
            ]
        }
    };

    // Check if this is a category-specific mixed skill
    let actualSkill = state.skill;
    if (categoryMixedSkills[state.skill]) {
        const mixedConfig = categoryMixedSkills[state.skill];
        actualSkill = pick(mixedConfig.skills);
        console.log(`Mixed skill ${state.skill} resolved to: ${actualSkill}`);
    }

    // Set skill label for display
    q.skillLabel = window.getSkillLabelForQuestion ? window.getSkillLabelForQuestion(actualSkill, state.category) : '';
    q.skillId = actualSkill;

    // Get the mapped category and skill
    let mappedCategory = categoryMapping[state.category] || state.category;
    const mappedSkill = skillMapping[actualSkill] || actualSkill;

    // Skill-level category overrides: some skills live in a different generator than their UI category
    const skillCategoryOverride = {
        'round_decimals': 'rounding',           // In decimals UI category, but gen code is in rounding handler
        'function_table_easy': 'patterns',      // In algebra UI category, but gen code is in patterns handler
        'function_table_hard': 'patterns',      // In algebra UI category, but gen code is in patterns handler
        'order_objects_length': 'measurement',   // In shapes_early UI category, but gen code is in measurement handler
        'measure_nonstandard': 'measurement',    // In shapes_early UI category, but gen code is in measurement handler
        'estimate_length': 'measurement',        // In shapes_early UI category, but gen code is in measurement handler
        'fraction_number_line': 'fractions',     // In composing UI category, but gen code is in fractions handler
        'whole_as_fraction': 'fractions',        // In composing UI category, but gen code is in fractions handler
        'odd_even': 'patterns',                  // In composing UI category, but gen code is in patterns handler
        'number_word_form': 'placevalue',        // In composing UI category, but gen code is in placevalue handler
    };
    if (skillCategoryOverride[mappedSkill]) {
        mappedCategory = skillCategoryOverride[mappedSkill];
    }

    // Dispatch to domain-specific generator
    switch (mappedCategory) {
        case "operations":
            generateOperationsQuestion(q, mappedSkill, helpers);
            break;
        case "integers":
            generateIntegersQuestion(q, mappedSkill, helpers);
            break;
        case "fractions":
            generateFractionsQuestion(q, mappedSkill, helpers);
            break;
        case "conversions":
            generateConversionsQuestion(q, mappedSkill, helpers);
            break;
        case "decimals":
            generateDecimalsQuestion(q, mappedSkill, helpers);
            break;
        case "geometry":
            generateGeometryQuestion(q, mappedSkill, helpers);
            break;
        case "measurement":
            generateMeasurementQuestion(q, mappedSkill, helpers);
            break;
        case "data_stats":
            generateDataStatsQuestion(q, mappedSkill, helpers);
            break;
        case "order_of_operations":
            generateOrderOfOpsQuestion(q, mappedSkill, helpers);
            break;
        case "patterns":
            generatePatternsQuestion(q, mappedSkill, helpers);
            break;
        case "rounding":
            generateRoundingQuestion(q, mappedSkill, helpers);
            break;
        case "placevalue":
            generatePlaceValueQuestion(q, mappedSkill, helpers);
            break;
        case "estimation":
            generateEstimationQuestion(q, mappedSkill, helpers);
            break;
        case "algebra":
            generateAlgebraQuestion(q, mappedSkill, helpers);
            break;
        case "number_theory":
            generateNumberTheoryQuestion(q, mappedSkill, helpers);
            break;
        case "counting_cardinality":
            generateCountingQuestion(q, mappedSkill, helpers);
            break;
        case "all_mixed": {
            // Mixed - All Categories: pick a random SKILL with equal probability
            const domainCategories = {
                'domain_mixed_number_operations': ["operations", "integers"],
                'domain_mixed_fractions_decimals': ["fractions", "decimals", "conversions"],
                'domain_mixed_geometry_measurement': ["geometry", "measurement"],
                'domain_mixed_data_statistics': ["data_stats"],
                'domain_mixed_algebraic_thinking': ["patterns", "algebra", "order_of_operations", "placevalue", "rounding", "estimation", "number_theory"]
            };

            const categorySkillMap = {
                'operations': ['add', 'subtract', 'multiply', 'divide',
                               'add_facts', 'sub_facts', 'mult_facts', 'div_facts',
                               'add_sub_10s', 'add_sub_100s',
                               'add_word_problems', 'sub_word_problems', 'mult_word_problems', 'div_word_problems',
                               'area_model_mult', 'area_model_mult_hard', 'area_model_div_2by1', 'area_model_div_3by1',
                               'add_sub_fact_family', 'mult_div_fact_family',
                               'number_families_add', 'number_families_add_med', 'number_families_add_hard',
                               'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard',
                               'number_families_mixed', 'number_families_mixed_med', 'number_families_mixed_hard',
                               'missing_add_sub', 'missing_mult_div', 'mixed_add_sub', 'mixed_mult_div',
                               'arrays_groups', 'mult_properties', 'mult_chart', 'div_remainders'],
                'addition': ['add', 'add_facts', 'add_sub_10s', 'add_sub_100s', 'add_word_problems', 'add_sub_fact_family',
                             'number_families_add', 'number_families_add_med', 'number_families_add_hard'],
                'subtraction': ['subtract', 'sub_facts', 'sub_word_problems', 'missing_add_sub', 'mixed_add_sub'],
                'multiplication': ['multiply', 'mult_facts', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard',
                                   'mult_div_fact_family', 'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard',
                                   'arrays_groups', 'mult_properties', 'mult_chart'],
                'division': ['divide', 'div_facts', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1',
                             'missing_mult_div', 'mixed_mult_div', 'div_remainders'],
                'integers': ['number_line_int', 'compare_int', 'add_int', 'sub_int'],
                'fractions': ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed', 'mixed_improper_visual',
                              'fraction_of_set', 'fraction_of_set_hard', 'equiv_frac_visual'],
                'decimals': ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal'],
                'conversions': ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f'],
                'geometry': ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                             'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                             'classify_triangles', 'classify_quads',
                             'coordinate_q1', 'coordinate_all', 'coordinate_graph',
                             'area_unit_squares', 'perimeter_grid'],
                'area_perimeter': ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                                   'area_unit_squares', 'perimeter_grid'],
                'angles_lines': ['identify_angles', 'measure_angles', 'identify_lines', 'symmetry'],
                'shapes_classify': ['classify_triangles', 'classify_quads'],
                'coordinates': ['coordinate_q1', 'coordinate_all', 'coordinate_graph'],
                'measurement': ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                                'time_analog_digital', 'time_match_clock',
                                'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                                'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard',
                                'money', 'money_count', 'temperature', 'capacity', 'reading_ruler', 'reading_ruler_hard'],
                'data_stats': ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart',
                               'mean', 'median', 'mode', 'range', 'probability_basic', 'line_plot_fractions'],
                'graphs': ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart', 'line_plot_fractions'],
                'data_analysis': ['mean', 'median', 'mode', 'range'],
                'probability': ['probability_basic'],
                'order_of_operations': ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple'],
                'estimation': ['estimate_sum', 'estimate_diff', 'nearest_10', 'nearest_100', 'nearest_1000'],
                'patterns': ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve',
                             'skip_count_line', 'skip_count_grid'],
                'algebra': ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table_easy', 'function_table_hard',
                            'tape_diagram', 'multi_step_word'],
                'placevalue': ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine', 'place_value_disks'],
                'rounding': ['nearest_10', 'nearest_100', 'nearest_1000', 'rounding_visual'],
                'number_sense': ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff', 'rounding_visual'],
                'number_theory': ['prime_composite', 'factors', 'factor_pairs', 'factors_identify',
                                  'factor_tchart_easy', 'factor_tchart_medium', 'factor_tchart_hard',
                                  'factor_links', 'factor_links_easy', 'factor_links_medium', 'factor_links_hard',
                                  'multiples', 'gcf', 'gcf_easy', 'gcf_hard', 'lcm'],
                'counting_cardinality': ['count_objects', 'count_sequence', 'compare_groups', 'compare_objects',
                                         'classify_count', 'number_bonds', 'make_ten', 'teen_compose']
            };

            const originalCategory = state.category;
            let categoriesToUse = Object.keys(categorySkillMap);
            if (originalCategory && originalCategory.startsWith('domain_mixed_')) {
                categoriesToUse = domainCategories[originalCategory] || categoriesToUse;
            }

            let allSkillsFlattened = [];
            categoriesToUse.forEach(cat => {
                if (categorySkillMap[cat]) {
                    allSkillsFlattened = allSkillsFlattened.concat(categorySkillMap[cat]);
                }
            });

            let targetCategory, targetSkill;
            let skillsWithCategories = [];

            try {
                if (state.skill === "custom_mixed" && state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
                    const selectedSkills = state.mixedModeSettings.selectedSkills;
                    Object.keys(selectedSkills).forEach(cat => {
                        if (selectedSkills[cat] && selectedSkills[cat].length > 0) {
                            selectedSkills[cat].forEach(skillId => {
                                skillsWithCategories.push({ skill: skillId, category: cat });
                            });
                        }
                    });
                    console.log(`custom_mixed: Found ${skillsWithCategories.length} skills:`, skillsWithCategories);
                }
            } catch (err) {
                console.error("Error in all_mixed custom skill selection:", err);
            }

            if (skillsWithCategories.length > 0) {
                const picked = pick(skillsWithCategories);
                targetSkill = picked.skill;
                targetCategory = picked.category;
                console.log(`custom_mixed picked: skill=${targetSkill}, category=${targetCategory}`);
            } else if (allSkillsFlattened.length > 0) {
                targetSkill = pick(allSkillsFlattened);
                for (const [cat, skills] of Object.entries(categorySkillMap)) {
                    if (skills.includes(targetSkill)) {
                        targetCategory = cat;
                        break;
                    }
                }
            }

            if (!targetCategory) {
                targetCategory = pick(categoriesToUse);
            }
            if (!targetSkill) {
                const skillsForCategory = categorySkillMap[targetCategory];
                targetSkill = skillsForCategory ? pick(skillsForCategory) : 'add';
            }

            const savedCategory = state.category;
            const savedSkill = state.skill;

            state.category = targetCategory;
            state.skill = targetSkill;

            console.log(`all_mixed recursive call: category=${state.category}, skill=${state.skill}`);

            const recursiveQ = generateQuestion();
            Object.assign(q, recursiveQ);

            state.category = savedCategory;
            state.skill = savedSkill;

            q.skillLabel = window.getSkillLabelForQuestion ? window.getSkillLabelForQuestion(targetSkill, targetCategory) : '';
            q.skillId = targetSkill;

            break;
        }
        default:
            q.text = "10 + 10 = ?";
            q.ans = 20;
            q.options = buildNumericOptions(20);
    }

    // Strip numeric MC options to force typed answers.
    if (q.options && q.options.length > 0) {
        const allNumeric = q.options.every(opt => {
            const s = String(opt).trim();
            return s !== '' && !isNaN(Number(s));
        });
        if (allNumeric) {
            q.options = [];
        }
    }

    return q;
}
