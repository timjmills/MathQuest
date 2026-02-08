import { state } from './state.js';
import { SKILLS, DOMAINS } from './data.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, fracText, fractionToPercent } from './utils.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './svg-geometry.js';
import { fracHTML, fracCircleSVG, fracBarHTML, fracWithVisual, fracEquationHTML, fracCompareHTML } from './svg-fractions.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, getElapsedTime, formatTime, formatTimeWithAMPM, timeToWords, numberToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify } from './svg-clock.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine } from './svg-base10.js';
import { getFactorPairs, createFactorLinksSVG } from './svg-factors.js';

export function generateQuestion() {
    const q = { text: "", ans: 0, hint: "", options: [], answerType: "number", visual: "", skillLabel: "" };
    const rng = (min, max) => randInt(min, max);
    const range = state.range;

    // Helper function to apply decimal places to a number
    const applyDecimals = (num) => {
        if (state.decimalPlaces === 0) return num;
        const shift = Math.pow(10, state.decimalPlaces);
        return parseFloat((num + Math.random() * (1 / shift)).toFixed(state.decimalPlaces));
    };

    const ensureTables = () => {
        if (!state.selectedNumbers.length) state.selectedNumbers = [...DEFAULT_TABLES];
        return state.selectedNumbers;
    };
    
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
        // Fractions, Decimals & Percents categories
        'fractions': 'fractions',
        'decimals': 'decimals',
        'conversions': 'conversions',
        'frac_dec_mixed': 'fractions',
        // Geometry & Measurement categories
        'area_perimeter': 'geometry',
        'angles_lines': 'geometry',
        'shapes_classify': 'geometry',
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
        'number_sense': 'rounding', // Maps to rounding/estimation
        'number_theory': 'number_theory',
        'algebra_mixed': 'algebra',
        // Mixed
        'all_mixed': 'all_mixed'
    };
    
    // Map new skill names to legacy skill names
    // NOTE: Category-specific mixed skills (mixed_addition, mixed_multiplication, etc.) 
    // are handled specially below - they pick randomly from all skills in their category
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
            skills: ['mult_facts', 'multiply', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard', 'mult_div_fact_family', 'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard']
        },
        'mixed_division': {
            category: 'division',
            skills: ['div_facts', 'divide', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1', 'missing_mult_div', 'mixed_mult_div']
        },
        'mixed_integers': {
            category: 'integers',
            skills: ['number_line_int', 'compare_int', 'add_int', 'sub_int']
        },
        'mixed_fractions': {
            category: 'fractions',
            skills: ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed']
        },
        'mixed_decimals': {
            category: 'decimals',
            skills: ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal']
        },
        'mixed_conversions': {
            category: 'conversions',
            skills: ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f']
        },
        // operations_all includes ALL skills from the Number & Operations DOMAIN
        // This means: addition, subtraction, multiplication, division, AND integers
        'operations_all': {
            category: 'operations',
            skills: [
                // Addition skills
                'add_facts', 'add', 'add_word_problems', 'add_sub_fact_family', 'number_families_add', 'number_families_add_med', 'number_families_add_hard',
                // Subtraction skills
                'sub_facts', 'subtract', 'sub_word_problems', 'missing_add_sub', 'mixed_add_sub',
                // Multiplication skills
                'mult_facts', 'multiply', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard', 'mult_div_fact_family', 
                'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard',
                // Division skills
                'div_facts', 'divide', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1', 'missing_mult_div', 'mixed_mult_div',
                // Integers skills
                'number_line_int', 'compare_int', 'add_int', 'sub_int',
                // Mixed number families (all 4 ops)
                'number_families_mixed', 'number_families_mixed_med', 'number_families_mixed_hard'
            ]
        },
        // GEOMETRY & MEASUREMENT - ALL skills included
        'mixed_area_perimeter': {
            category: 'geometry',
            skills: ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume']
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
                     'money', 'temperature', 'capacity']
        },
        'mixed_time': {
            category: 'measurement',
            skills: ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                     'time_analog_digital', 'time_match_clock',
                     'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                     'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard']
        },
        // geometry_all includes ALL geometry category skills
        'geometry_all': {
            category: 'geometry',
            skills: [
                // Area & Perimeter
                'perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                // Angles & Lines
                'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                // Shape Classification
                'classify_triangles', 'classify_quads',
                // Coordinates
                'coordinate_q1', 'coordinate_all', 'coordinate_graph'
            ]
        },
        // measurement_all includes ALL measurement category skills
        'measurement_all': {
            category: 'measurement',
            skills: ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min', 
                     'time_analog_digital', 'time_match_clock',
                     'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                     'money', 'temperature', 'capacity']
        },
        // geo_meas_all includes ALL skills from Geometry & Measurement DOMAIN
        'geo_meas_all': {
            category: 'geometry',
            skills: [
                // Area & Perimeter
                'perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                // Angles & Lines
                'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                // Shape Classification
                'classify_triangles', 'classify_quads',
                // Coordinates
                'coordinate_q1', 'coordinate_all', 'coordinate_graph',
                // Measurement - Time skills
                'time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min', 
                'time_analog_digital', 'time_match_clock',
                'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                // Other measurement
                'money', 'temperature', 'capacity'
            ]
        },
        // DATA & STATISTICS DOMAIN - ALL skills included
        'mixed_graphs': {
            category: 'data_stats',
            skills: ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart']
        },
        'mixed_data_analysis': {
            category: 'data_stats',
            skills: ['mean', 'median', 'mode', 'range']
        },
        'mixed_probability': {
            category: 'data_stats',
            skills: ['probability_basic']
        },
        // data_stats_all includes ALL skills from Data & Statistics DOMAIN
        'data_stats_all': {
            category: 'data_stats',
            skills: [
                // Graphs
                'bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart',
                // Data Analysis
                'mean', 'median', 'mode', 'range',
                // Probability
                'probability_basic'
            ]
        },
        // ALGEBRAIC THINKING DOMAIN - ALL skills included
        'mixed_patterns': {
            category: 'patterns',
            skills: ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve']
        },
        'mixed_algebra': {
            category: 'algebra',
            skills: ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table']
        },
        'mixed_order_ops': {
            category: 'order_of_operations',
            skills: ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple']
        },
        'mixed_placevalue': {
            category: 'placevalue',
            skills: ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine']
        },
        'mixed_number_sense': {
            category: 'number_sense',
            skills: ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff']
        },
        'mixed_number_theory': {
            category: 'number_theory',
            skills: ['prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm']
        },
        'patterns_all': {
            category: 'patterns',
            skills: ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve']
        },
        'algebra_all': {
            category: 'algebra',
            skills: ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table']
        },
        'order_ops_all': {
            category: 'order_of_operations',
            skills: ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple']
        },
        'placevalue_all': {
            category: 'placevalue',
            skills: ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine']
        },
        'number_sense_all': {
            category: 'number_sense',
            skills: ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff']
        },
        'number_theory_all': {
            category: 'number_theory',
            skills: ['prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm']
        },
        // algebraic_all includes ALL skills from Algebraic Thinking DOMAIN
        'algebraic_all': {
            category: 'algebra',
            skills: [
                // Patterns
                'seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve',
                // Algebra
                'solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table',
                // Order of Operations
                'two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple',
                // Place Value
                'pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine',
                // Number Sense (Rounding & Estimation)
                'nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff',
                // Number Theory
                'prime_composite', 'factors', 'factor_links', 'multiples', 'gcf', 'lcm'
            ]
        },
        // FRACTIONS, DECIMALS & PERCENTS DOMAIN - ALL skills included
        'fractions_all': {
            category: 'fractions',
            skills: ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed']
        },
        'decimals_all': {
            category: 'decimals',
            skills: ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal']
        },
        'conversions_all': {
            category: 'conversions',
            skills: ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f']
        },
        // fdp_all includes ALL skills from Fractions, Decimals & Percents DOMAIN
        'fdp_all': {
            category: 'fractions',
            skills: [
                // Fractions
                'identify', 'equivalent', 'compare', 'simplify', 'improper_mixed',
                // Decimals
                'add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal',
                // Conversions
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
    q.skillLabel = getSkillLabelForQuestion(actualSkill, state.category);
    
    // Get the mapped category and skill
    const mappedCategory = categoryMapping[state.category] || state.category;
    const mappedSkill = skillMapping[actualSkill] || actualSkill;

    switch (mappedCategory) {
        case "operations": {
            // Check for new specialized skills first
            if (mappedSkill === "add_sub_fact_family") {
                // Addition/Subtraction Fact Families
                const addend1 = rng(1, Math.min(range, 20));
                const addend2 = rng(1, Math.min(range, 20));
                const sum = addend1 + addend2;
                
                // Create all four equations
                const equations = [
                    { text: `${addend1} + ${addend2} = ___`, ans: sum, type: 'add' },
                    { text: `${addend2} + ${addend1} = ___`, ans: sum, type: 'add' },
                    { text: `${sum} − ${addend1} = ___`, ans: addend2, type: 'sub' },
                    { text: `${sum} − ${addend2} = ___`, ans: addend1, type: 'sub' }
                ];
                
                // Randomly choose which blanks to show (all 4, or 2 given/2 blank)
                const showAll = Math.random() < 0.6;
                
                q.text = `Fact Family: ${addend1}, ${addend2}, ${sum}`;
                q.ans = showAll ? `${sum}, ${sum}, ${addend2}, ${addend1}` : equations[0].ans;
                q.answerType = "fact-family";
                q.hint = `These three numbers make a fact family! Addition and subtraction are related.`;
                
                q.factFamilyData = {
                    numbers: [addend1, addend2, sum],
                    equations: equations,
                    showAll: showAll
                };
                q.printFormat = "fact-family-add-sub";
                
                // Visual for screen
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🏠 Addition/Subtraction Fact Family</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${addend1}</span>, <span style="color:var(--accent-cyan);">${addend2}</span>, <span style="color:var(--accent-green);">${sum}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:350px;margin:0 auto;">
                        ${equations.map((eq, i) => `<div style="padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${eq.type === 'add' ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                            <div style="font-size:1.1rem;">${eq.text.replace('___', '<input type="text" class="fact-family-input" data-eq="' + i + '" data-answer="' + eq.ans + '" style="width:50px;height:30px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1rem;background:var(--bg-card-light);" placeholder="?">')}</div>
                        </div>`).join('')}
                    </div>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        Fill in all four equations using the same three numbers.
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            if (mappedSkill === "mult_div_fact_family") {
                // Multiplication/Division Fact Families
                const factor1 = rng(2, 12);
                const factor2 = rng(2, 12);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 or 4 depending on square)
                const equations = isSquare ? [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' }
                ] : [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${factor2} × ${factor1} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' },
                    { text: `${product} ÷ ${factor2} = ___`, ans: factor1, type: 'div' }
                ];
                
                // Apply division notation variety (Feature 2)
                const divNotations = ['symbol', 'fraction', 'bracket'];
                equations.forEach(eq => {
                    if (eq.type === 'div') {
                        const notation = pick(divNotations);
                        if (notation === 'fraction') {
                            eq.displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;"><span style="border-bottom:2px solid currentColor;padding:0 5px;">${product}</span><span style="padding:0 5px;">${eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2}</span></div> = ___`;
                        } else if (notation === 'bracket') {
                            const divisor = eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2;
                            eq.displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${product}</span> = ___`;
                        } else {
                            eq.displayText = eq.text;
                        }
                    } else {
                        eq.displayText = eq.text;
                    }
                });
                
                q.text = `Fact Family: ${factor1}, ${factor2}, ${product}${isSquare ? ' (square number)' : ''}`;
                q.ans = equations.map(e => e.ans).join(', ');
                q.answerType = "fact-family";
                q.hint = `Multiplication and division are related! ${factor1} × ${factor2} = ${product}, so ${product} ÷ ${factor1} = ${factor2}`;
                
                q.factFamilyData = {
                    numbers: [factor1, factor2, product],
                    equations: equations,
                    isSquare: isSquare
                };
                q.printFormat = "fact-family-mult-div";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🏠 Multiplication/Division Fact Family</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                        ${isSquare ? '<span style="font-size:0.8rem;color:var(--text-dim);"> (square)</span>' : ''}
                    </div>
                    <div style="display:grid;grid-template-columns:${isSquare ? '1fr' : '1fr 1fr'};gap:12px;max-width:${isSquare ? '200px' : '400px'};margin:0 auto;">
                        ${equations.map((eq, i) => `<div style="padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                            <div style="font-size:1.1rem;">${(eq.displayText || eq.text).replace('___', '<input type="text" class="fact-family-input" data-eq="' + i + '" data-answer="' + eq.ans + '" style="width:50px;height:30px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1rem;background:var(--bg-card-light);" placeholder="?">')}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            // ========================================
            // NUMBER FAMILIES - ENHANCED IMPLEMENTATION
            // ========================================
            
            // Addition/Subtraction Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_add")) {
                const isEasy = mappedSkill === "number_families_add";
                const isMedium = mappedSkill === "number_families_add_med";
                const isHard = mappedSkill === "number_families_add_hard";
                
                // Generate appropriate numbers based on range
                const maxNum = Math.min(range, isEasy ? 10 : isMedium ? 20 : 50);
                const addend1 = rng(1, maxNum);
                const addend2 = rng(1, maxNum);
                const sum = addend1 + addend2;
                
                // Create the four equations with consistent structure
                // Each equation: [num1, op, num2, equals, result]
                const familyData = {
                    a: addend1,
                    b: addend2,
                    c: sum,
                    equations: [
                        { nums: [addend1, addend2, sum], op: '+', type: 'add' },
                        { nums: [addend2, addend1, sum], op: '+', type: 'add' },
                        { nums: [sum, addend1, addend2], op: '−', type: 'sub' },
                        { nums: [sum, addend2, addend1], op: '−', type: 'sub' }
                    ]
                };
                
                // Determine which positions to hide based on difficulty
                // Each equation has 3 positions: [0, 1, 2] for the three numbers
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: 1-2 numbers missing total, always the result
                    familyData.equations.forEach((eq, idx) => {
                        missingPositions.push([2]); // Only result missing
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing numbers - vary by position
                    familyData.equations.forEach((eq, idx) => {
                        if (idx === 0) missingPositions.push([0, 2]); // First num and result
                        else if (idx === 1) missingPositions.push([1, 2]); // Second num and result
                        else if (idx === 2) missingPositions.push([1, 2]); // Second num and result
                        else missingPositions.push([0, 2]); // First num and result
                    });
                } else {
                    // Hard: All numbers missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual with aligned columns
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:45px;height:36px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:45px;height:36px;line-height:36px;text-align:center;font-size:1.1rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };
                
                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'add' ? 'var(--accent-green)' : 'var(--accent-orange)';
                    
                    return `<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.3rem;font-weight:700;width:25px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.3rem;font-weight:700;width:25px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');
                
                q.text = `Number Family: Complete all equations`;
                q.ans = `${addend1}, ${addend2}, ${sum}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${addend1}, ${addend2}, ${sum}) make a number family! Addition and subtraction are related.`;
                
                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'add_sub',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-add-sub";
                
                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';
                const showNumbers = !isHard;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">🏠 Addition/Subtraction Number Family <span style="font-size:0.85rem;">(${difficultyLabel})</span></div>
                    ${showNumbers ? `<div style="font-size:1.2rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${addend1}</span>, <span style="color:var(--accent-cyan);">${addend2}</span>, <span style="color:var(--accent-green);">${sum}</span>
                    </div>` : '<div style="font-size:1rem;margin-bottom:15px;padding:8px;background:var(--bg-card);border-radius:8px;color:var(--text-dim);">Find the three numbers that complete all equations!</div>'}
                    <div style="display:flex;flex-direction:column;gap:10px;max-width:320px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                break;
            }
            
            // Multiplication/Division Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_mult")) {
                const isEasy = mappedSkill === "number_families_mult";
                const isMedium = mappedSkill === "number_families_mult_med";
                const isHard = mappedSkill === "number_families_mult_hard";
                
                // Generate factors based on difficulty
                const maxFactor = isEasy ? 5 : isMedium ? 10 : 12;
                const factor1 = rng(2, maxFactor);
                const factor2 = rng(2, maxFactor);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 for squares, 4 for non-squares)
                const familyData = {
                    a: factor1,
                    b: factor2,
                    c: product,
                    isSquare: isSquare,
                    equations: isSquare ? [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' }
                    ] : [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [factor2, factor1, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' },
                        { nums: [product, factor2, factor1], op: '÷', type: 'div' }
                    ]
                };
                
                // Determine missing positions based on difficulty
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: Only result missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([2]);
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing
                    familyData.equations.forEach((eq, idx) => {
                        if (eq.type === 'mult') {
                            missingPositions.push(idx % 2 === 0 ? [0, 2] : [1, 2]);
                        } else {
                            missingPositions.push(idx % 2 === 0 ? [1, 2] : [0, 2]);
                        }
                    });
                } else {
                    // Hard: All missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:45px;height:36px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:45px;height:36px;line-height:36px;text-align:center;font-size:1.1rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };
                
                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)';
                    
                    return `<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.3rem;font-weight:700;width:25px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.3rem;font-weight:700;width:25px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');
                
                q.text = `Number Family: Complete all equations`;
                q.ans = `${factor1}, ${factor2}, ${product}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${factor1}, ${factor2}, ${product}) make a number family! Multiplication and division are related.`;
                
                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'mult_div',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-mult-div";
                
                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';
                const showNumbers = !isHard;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">🏠 Multiplication/Division Number Family <span style="font-size:0.85rem;">(${difficultyLabel})</span>${isSquare ? ' <span style="font-size:0.8rem;color:var(--text-dim);">(square)</span>' : ''}</div>
                    ${showNumbers ? `<div style="font-size:1.2rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                    </div>` : '<div style="font-size:1rem;margin-bottom:15px;padding:8px;background:var(--bg-card);border-radius:8px;color:var(--text-dim);">Find the three numbers that complete all equations!</div>'}
                    <div style="display:flex;flex-direction:column;gap:10px;max-width:320px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                break;
            }
            
            // Mixed Number Families - ALL 4 Operations (Easy/Medium/Hard)
            // Shows addition, subtraction, multiplication, AND division in one problem
            if (mappedSkill.startsWith("number_families_mixed")) {
                const isEasy = mappedSkill === "number_families_mixed";
                const isMedium = mappedSkill === "number_families_mixed_med";
                const isHard = mappedSkill === "number_families_mixed_hard";
                
                // Pick two numbers that work well for all operations
                const maxNum = isEasy ? 5 : isMedium ? 8 : 10;
                const a = rng(2, maxNum);
                const b = rng(2, maxNum);
                const sum = a + b;
                const product = a * b;
                const isSquare = a === b;
                
                // Build ALL equations - addition, subtraction, multiplication, division
                const equations = [];
                
                // Addition equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, sum], op: '+', type: 'add' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, sum], op: '+', type: 'add' });
                }
                
                // Subtraction equations (2 equations)
                equations.push({ nums: [sum, a, b], op: '−', type: 'sub' });
                if (!isSquare) {
                    equations.push({ nums: [sum, b, a], op: '−', type: 'sub' });
                }
                
                // Multiplication equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, product], op: '×', type: 'mult' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, product], op: '×', type: 'mult' });
                }
                
                // Division equations (2 equations)
                equations.push({ nums: [product, a, b], op: '÷', type: 'div' });
                if (!isSquare) {
                    equations.push({ nums: [product, b, a], op: '÷', type: 'div' });
                }
                
                // Set missing positions based on difficulty
                const missingPositions = [];
                if (isEasy) {
                    // Easy: only answers missing
                    equations.forEach(() => missingPositions.push([2]));
                } else if (isMedium) {
                    // Medium: mix of blanks
                    equations.forEach((eq, idx) => {
                        if (idx % 2 === 0) {
                            missingPositions.push([0, 2]);
                        } else {
                            missingPositions.push([1, 2]);
                        }
                    });
                } else {
                    // Hard: all positions missing
                    equations.forEach(() => missingPositions.push([0, 1, 2]));
                }
                
                const familyData = {
                    a: a,
                    b: b,
                    sum: sum,
                    product: product,
                    isSquare: isSquare,
                    equations: equations,
                    missingPositions: missingPositions,
                    operationType: 'all_four'
                };
                
                // Create input box helper
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:45px;height:36px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    }
                    return `<span style="font-size:1.2rem;font-weight:700;width:45px;text-align:center;display:inline-block;">${value}</span>`;
                };
                
                // Create visual with two columns: Add/Sub on left, Mult/Div on right
                const addSubEqs = equations.filter(eq => eq.type === 'add' || eq.type === 'sub');
                const multDivEqs = equations.filter(eq => eq.type === 'mult' || eq.type === 'div');
                
                const renderEquation = (eq, eqIdx) => {
                    const globalIdx = equations.indexOf(eq);
                    const missing = missingPositions[globalIdx];
                    const borderColor = (eq.type === 'add' || eq.type === 'mult') ? 'var(--accent-green)' : 'var(--accent-orange)';
                    
                    return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], globalIdx, 0, missing.includes(0))}
                        <span style="font-size:1.2rem;font-weight:700;width:22px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], globalIdx, 1, missing.includes(1))}
                        <span style="font-size:1.2rem;font-weight:700;width:22px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], globalIdx, 2, missing.includes(2))}
                    </div>`;
                };
                
                const addSubHTML = addSubEqs.map((eq, idx) => renderEquation(eq, idx)).join('');
                const multDivHTML = multDivEqs.map((eq, idx) => renderEquation(eq, idx)).join('');
                
                q.text = `Number Family: Complete ALL equations using ${a} and ${b}`;
                q.ans = `${a}, ${b}, ${sum}, ${product}`;
                q.answerType = "number-family";
                q.hint = `Use ${a} and ${b} for all equations! Sum = ${sum}, Product = ${product}`;
                
                q.numberFamilyData = {
                    ...familyData,
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-all-four";
                
                const difficultyLabel = isEasy ? '🟢 Easy' : isMedium ? '🟡 Medium' : '🟠 Hard';
                const showNumbers = !isHard;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">🏠 Number Family - All 4 Operations <span style="font-size:0.85rem;">(${difficultyLabel})</span></div>
                    ${showNumbers ? `<div style="font-size:1.1rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Base Numbers: <span style="color:var(--accent-orange);">${a}</span> and <span style="color:var(--accent-cyan);">${b}</span>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">Sum: ${sum} | Product: ${product}</div>
                    </div>` : '<div style="font-size:1rem;margin-bottom:15px;padding:8px;background:var(--bg-card);border-radius:8px;color:var(--text-dim);">Find the two base numbers that complete ALL equations!</div>'}
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;max-width:600px;margin:0 auto;">
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:0.9rem;">➕➖ Add/Subtract</div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                ${addSubHTML}
                            </div>
                        </div>
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:0.9rem;">✖️➗ Multiply/Divide</div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                ${multDivHTML}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                break;
            }
            
            if (mappedSkill === "missing_add_sub") {
                // Missing Numbers - Addition/Subtraction
                const positions = ['first_add', 'second_add', 'sum', 'minuend', 'subtrahend', 'difference'];
                const position = pick(positions);
                
                let a, b, c, text, ans;
                
                if (position === 'first_add') {
                    b = rng(1, Math.min(range, 50));
                    c = rng(b + 1, Math.min(range, 99));
                    a = c - b;
                    text = `___ + ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_add') {
                    a = rng(1, Math.min(range, 50));
                    c = rng(a + 1, Math.min(range, 99));
                    b = c - a;
                    text = `${a} + ___ = ${c}`;
                    ans = b;
                } else if (position === 'sum') {
                    a = rng(1, Math.min(range, 50));
                    b = rng(1, Math.min(range, 50));
                    c = a + b;
                    text = `${a} + ${b} = ___`;
                    ans = c;
                } else if (position === 'minuend') {
                    b = rng(1, Math.min(range, 50));
                    c = rng(1, Math.min(range, 50));
                    a = b + c;
                    text = `___ − ${b} = ${c}`;
                    ans = a;
                } else if (position === 'subtrahend') {
                    a = rng(10, Math.min(range, 99));
                    c = rng(1, a - 1);
                    b = a - c;
                    text = `${a} − ___ = ${c}`;
                    ans = b;
                } else { // difference
                    a = rng(10, Math.min(range, 99));
                    b = rng(1, a - 1);
                    c = a - b;
                    text = `${a} − ${b} = ___`;
                    ans = c;
                }
                
                q.text = text;
                q.ans = ans;
                q.hint = position.includes('add') || position === 'sum' 
                    ? `Think: What number makes this addition true?` 
                    : `Think: What number makes this subtraction true?`;
                q.missingNumberData = { position, a, b, c };
                q.printFormat = "missing-number";
                q.options = buildNumericOptions(ans);
                break;
            }
            
            if (mappedSkill === "missing_mult_div") {
                // Missing Factors - Multiplication/Division
                const positions = ['first_factor', 'second_factor', 'product', 'dividend', 'divisor', 'quotient'];
                const position = pick(positions);
                
                let a, b, c, text, ans, displayText;
                
                if (position === 'first_factor') {
                    b = rng(2, 12);
                    c = rng(2, 12) * b;
                    a = c / b;
                    text = `___ × ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_factor') {
                    a = rng(2, 12);
                    c = a * rng(2, 12);
                    b = c / a;
                    text = `${a} × ___ = ${c}`;
                    ans = b;
                } else if (position === 'product') {
                    a = rng(2, 12);
                    b = rng(2, 12);
                    c = a * b;
                    text = `${a} × ${b} = ___`;
                    ans = c;
                } else if (position === 'dividend') {
                    b = rng(2, 12);
                    c = rng(2, 12);
                    a = b * c;
                    text = `___ ÷ ${b} = ${c}`;
                    ans = a;
                } else if (position === 'divisor') {
                    c = rng(2, 12);
                    b = rng(2, 12);
                    a = b * c;
                    text = `${a} ÷ ___ = ${c}`;
                    ans = b;
                } else { // quotient
                    b = rng(2, 12);
                    c = rng(2, 12);
                    a = b * c;
                    text = `${a} ÷ ${b} = ___`;
                    ans = c;
                }
                
                // Apply division notation variety for division problems
                if (position.includes('divid') || position === 'quotient') {
                    const notation = pick(['symbol', 'fraction', 'bracket']);
                    if (notation === 'fraction') {
                        const dividend = position === 'dividend' ? '___' : a;
                        const divisor = position === 'divisor' ? '___' : b;
                        const quotient = position === 'quotient' ? '___' : c;
                        displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:5px;"><span style="border-bottom:2px solid currentColor;padding:2px 8px;">${dividend}</span><span style="padding:2px 8px;">${divisor}</span></div> = ${quotient}`;
                    } else if (notation === 'bracket') {
                        const dividend = position === 'dividend' ? '___' : a;
                        const divisor = position === 'divisor' ? '___' : b;
                        const quotient = position === 'quotient' ? '___' : c;
                        displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${dividend}</span> = ${quotient}`;
                    } else {
                        displayText = text;
                    }
                } else {
                    displayText = text;
                }
                
                q.text = text;
                q.ans = ans;
                q.hint = position.includes('factor') || position === 'product'
                    ? `Think: What number completes this multiplication?`
                    : `Think: What number completes this division?`;
                q.missingNumberData = { position, a, b, c, displayText };
                q.printFormat = "missing-factor";
                
                q.visual = `<div style="text-align:center;font-size:1.5rem;font-weight:600;margin:20px 0;">
                    ${displayText || text}
                </div>`;
                q.options = buildNumericOptions(ans);
                break;
            }
            
            // Area Model Multiplication
            if (mappedSkill === "area_model_mult") {
                // Generate appropriate numbers for area model
                // Type 1: single digit × 2-digit (e.g., 4 × 16)
                // Type 2: single digit × 3-digit (e.g., 3 × 135)
                const problemType = Math.random() < 0.6 ? '2digit' : '3digit';
                
                let multiplier, multiplicand, parts;
                const colors = ['#5fd4c3', '#f8b878', '#f8a0c8']; // teal, orange, pink
                
                if (problemType === '2digit') {
                    multiplier = rng(2, 9);
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = tens + ones;
                    parts = [
                        { value: tens, width: 60, color: colors[0] },
                        { value: ones, width: 30, color: colors[1] }
                    ];
                } else {
                    multiplier = rng(2, 6);
                    const hundreds = rng(1, 3) * 100;
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = hundreds + tens + ones;
                    parts = [
                        { value: hundreds, width: 50, color: colors[0] },
                        { value: tens, width: 35, color: colors[1] },
                        { value: ones, width: 25, color: colors[2] }
                    ];
                }
                
                const product = multiplier * multiplicand;
                q.ans = product;
                q.text = `Use the area model to find ${multiplier} × ${multiplicand}`;
                q.hint = `Break ${multiplicand} into parts: ${parts.map(p => p.value).join(' + ')}. Multiply each part by ${multiplier}, then add the results.`;
                q.answerType = "area-model";
                q.areaModelData = { multiplier, multiplicand, parts, product };
                q.printFormat = "area-model-mult";
                
                // Calculate partial products for answers
                const partialProducts = parts.map(p => multiplier * p.value);
                
                // Generate visual with colored rectangles and input boxes
                // Use balanced box sizes based on digit count of partial products
                const baseBoxWidth = 75; // Base width for each section
                const rectHeight = 75;
                const uniqueIdArea = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${multiplier} × ${multiplicand}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the area of each rectangle.</div>
                    
                    <!-- Area Model Grid -->
                    <div style="display:inline-block;position:relative;">
                        <!-- Top labels (place values) -->
                        <div style="display:flex;margin-left:35px;margin-bottom:5px;">
                            ${parts.map((p, i) => {
                                const digitCount = partialProducts[i].toString().length;
                                const sectionWidth = baseBoxWidth + (digitCount - 1) * 10;
                                return `<div style="width:${sectionWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${p.value}</div>`;
                            }).join('')}
                        </div>
                        
                        <!-- Main grid with multiplier on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:25px;text-align:center;">${multiplier}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => {
                                    const digitCount = partialProducts[i].toString().length;
                                    const sectionWidth = baseBoxWidth + (digitCount - 1) * 10;
                                    const inputWidth = 45 + digitCount * 12;
                                    return `
                                    <div style="width:${sectionWidth}px;height:${rectHeight}px;background:${p.color};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <input type="text" class="area-model-input" data-area-idx="${uniqueIdArea}-part-${i}" data-answer="${partialProducts[i]}"
                                            style="width:${inputWidth}px;height:36px;border:2px solid #fff;border-radius:6px;background:rgba(255,255,255,0.9);text-align:center;font-size:1rem;font-weight:600;" placeholder="">
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the total area.</div>
                    <div style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${multiplier} × ${multiplicand} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdArea}-total" data-answer="${product}"
                            style="width:${60 + product.toString().length * 12}px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            // Area Model Multiplication - Hard (2×2 and 2×3 grids)
            if (mappedSkill === "area_model_mult_hard") {
                // Type: 2-digit × 2-digit (2×2 grid) or 2-digit × 3-digit (2×3 grid)
                const problemType = Math.random() < 0.6 ? '2x2' : '2x3';
                const colors = [
                    ['#f8e473', '#5fd4c3'],  // Row 1: yellow, teal
                    ['#f8b878', '#f8a0c8']   // Row 2: orange, pink
                ];
                
                let num1, num2, rowParts, colParts;
                
                if (problemType === '2x2') {
                    // 2-digit × 2-digit (e.g., 31 × 29)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [tens2, ones2];  // Top (columns)
                } else {
                    // 2-digit × 3-digit (e.g., 24 × 135)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const hundreds2 = rng(1, 3) * 100;
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = hundreds2 + tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [hundreds2, tens2, ones2];  // Top (columns)
                }
                
                const product = num1 * num2;
                q.ans = product;
                q.text = `Use the area model to find ${num1} × ${num2}`;
                q.hint = `Break ${num1} into ${rowParts.join(' + ')} and ${num2} into ${colParts.join(' + ')}. Find each rectangle's area, then add them all.`;
                q.answerType = "area-model";
                q.areaModelData = { 
                    num1, num2, rowParts, colParts, product,
                    isGrid: true,
                    gridType: problemType
                };
                q.printFormat = "area-model-mult-hard";
                
                // Calculate all partial products (row × col)
                const partialProducts = [];
                for (let r = 0; r < rowParts.length; r++) {
                    for (let c = 0; c < colParts.length; c++) {
                        partialProducts.push({
                            row: r,
                            col: c,
                            value: rowParts[r] * colParts[c]
                        });
                    }
                }
                
                const uniqueIdArea = Date.now() + Math.random().toString(36).substr(2, 9);
                const baseBoxWidth = 85;
                const baseBoxHeight = 75;
                
                // Generate the 2D grid visual
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${num1} × ${num2}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the area of each rectangle.</div>
                    
                    <!-- Area Model 2D Grid -->
                    <div style="display:inline-block;position:relative;">
                        <!-- Top labels (column values) -->
                        <div style="display:flex;margin-left:45px;margin-bottom:5px;">
                            ${colParts.map((col, c) => {
                                const digitCount = Math.max(...rowParts.map(r => (r * col).toString().length));
                                const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                return `<div style="width:${cellWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${col}</div>`;
                            }).join('')}
                        </div>
                        
                        <!-- Grid rows -->
                        ${rowParts.map((row, r) => {
                            return `
                            <div style="display:flex;align-items:center;${r > 0 ? '' : ''}">
                                <!-- Row label -->
                                <div style="font-weight:700;font-size:1.2rem;margin-right:10px;width:35px;text-align:center;">${row}</div>
                                <!-- Row cells -->
                                <div style="display:flex;border:2px solid #555;${r === 0 ? 'border-radius:4px 4px 0 0;' : 'border-top:none;border-radius:0 0 4px 4px;'}overflow:hidden;">
                                    ${colParts.map((col, c) => {
                                        const partialVal = row * col;
                                        const digitCount = partialVal.toString().length;
                                        const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                        const inputWidth = 50 + digitCount * 10;
                                        const colorRow = r % 2;
                                        const colorCol = c % 2;
                                        const bgColor = colors[colorRow][colorCol] || colors[0][0];
                                        return `
                                        <div style="width:${cellWidth}px;height:${baseBoxHeight}px;background:${bgColor};display:flex;align-items:center;justify-content:center;${c > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <input type="text" class="area-model-input" data-area-idx="${uniqueIdArea}-cell-${r}-${c}" data-answer="${partialVal}"
                                                style="width:${inputWidth}px;height:36px;border:2px solid #fff;border-radius:6px;background:rgba(255,255,255,0.9);text-align:center;font-size:1rem;font-weight:600;" placeholder="">
                                        </div>
                                    `}).join('')}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                    
                    <!-- Total calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the total area.</div>
                    <div style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${num1} × ${num2} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdArea}-total" data-answer="${product}"
                            style="width:${60 + product.toString().length * 12}px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            // Area Model Division - 2-digit by 1-digit (e.g., 55 ÷ 5)
            if (mappedSkill === "area_model_div_2by1") {
                // Pre-defined friendly division problems for 2-digit ÷ 1-digit
                // Format: [dividend, divisor] where dividend splits into nice parts
                const friendlyProblems = [
                    // Divisor 2: splits into even tens + even ones
                    [24, 2], [36, 2], [48, 2], [52, 2], [64, 2], [76, 2], [84, 2], [96, 2],
                    // Divisor 3: splits into multiples of 3
                    [36, 3], [39, 3], [45, 3], [48, 3], [54, 3], [57, 3], [63, 3], [69, 3], [72, 3], [75, 3], [78, 3], [81, 3], [84, 3], [93, 3], [96, 3],
                    // Divisor 4: splits into multiples of 4  
                    [48, 4], [52, 4], [56, 4], [64, 4], [68, 4], [72, 4], [76, 4], [84, 4], [88, 4], [92, 4], [96, 4],
                    // Divisor 5: splits into multiples of 5
                    [55, 5], [65, 5], [75, 5], [85, 5], [95, 5], [60, 5], [70, 5], [80, 5], [90, 5],
                    // Divisor 6: splits into multiples of 6
                    [42, 6], [48, 6], [54, 6], [66, 6], [72, 6], [78, 6], [84, 6], [96, 6],
                    // Divisor 7: splits into multiples of 7
                    [42, 7], [49, 7], [56, 7], [63, 7], [77, 7], [84, 7], [91, 7], [98, 7],
                    // Divisor 8: splits into multiples of 8
                    [48, 8], [56, 8], [64, 8], [72, 8], [80, 8], [88, 8], [96, 8],
                    // Divisor 9: splits into multiples of 9
                    [45, 9], [54, 9], [63, 9], [72, 9], [81, 9], [90, 9], [99, 9]
                ];
                
                const [dividend, divisor] = pick(friendlyProblems);
                const quotient = dividend / divisor;
                
                // Split into friendly parts (largest multiple of divisor*10 that fits, plus remainder)
                // For example: 55 ÷ 5 → 50 + 5
                const tensBase = Math.floor(dividend / 10) * 10;
                let part1 = Math.floor(tensBase / divisor) * divisor;
                // Make sure part1 is a "round" number when possible
                if (part1 === 0) part1 = divisor * Math.floor(dividend / divisor / 2);
                const part2 = dividend - part1;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>
                    
                    <!-- Area Model Grid -->
                    <div style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${80 + (i === 0 ? 20 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv}-top-${i}" data-answer="${p.quotient}"
                                        style="width:50px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${80 + (i === 0 ? 20 : 0)}px;height:70px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv}-total" data-answer="${quotient}"
                            style="width:60px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            // Area Model Division - 3-digit by 1-digit (e.g., 927 ÷ 9)
            if (mappedSkill === "area_model_div_3by1") {
                // Pre-defined friendly division problems for 3-digit ÷ 1-digit
                // Format: [dividend, divisor, part1, part2] - pre-calculated friendly splits
                const friendlyProblems = [
                    // Divisor 2: nice even splits
                    [124, 2, 100, 24], [136, 2, 100, 36], [148, 2, 100, 48], [162, 2, 100, 62], [174, 2, 100, 74], [186, 2, 100, 86],
                    [246, 2, 200, 46], [258, 2, 200, 58], [264, 2, 200, 64], [276, 2, 200, 76],
                    // Divisor 3: multiples of 3
                    [126, 3, 90, 36], [135, 3, 90, 45], [144, 3, 90, 54], [153, 3, 120, 33], [162, 3, 120, 42], [171, 3, 150, 21],
                    [213, 3, 180, 33], [234, 3, 180, 54], [243, 3, 180, 63], [261, 3, 180, 81], [279, 3, 270, 9],
                    // Divisor 4: multiples of 4
                    [124, 4, 80, 44], [136, 4, 80, 56], [148, 4, 120, 28], [156, 4, 120, 36], [168, 4, 120, 48],
                    [212, 4, 160, 52], [236, 4, 200, 36], [248, 4, 200, 48], [264, 4, 200, 64],
                    // Divisor 5: multiples of 5
                    [125, 5, 100, 25], [135, 5, 100, 35], [145, 5, 100, 45], [155, 5, 100, 55], [165, 5, 150, 15],
                    [215, 5, 200, 15], [235, 5, 200, 35], [255, 5, 200, 55], [275, 5, 250, 25], [295, 5, 250, 45],
                    // Divisor 6: multiples of 6
                    [126, 6, 90, 36], [138, 6, 90, 48], [156, 6, 120, 36], [174, 6, 120, 54], [186, 6, 180, 6],
                    [234, 6, 180, 54], [252, 6, 180, 72], [276, 6, 240, 36], [294, 6, 240, 54],
                    // Divisor 7: multiples of 7
                    [126, 7, 70, 56], [147, 7, 70, 77], [168, 7, 140, 28], [189, 7, 140, 49], 
                    [231, 7, 210, 21], [252, 7, 210, 42], [273, 7, 210, 63], [294, 7, 280, 14],
                    // Divisor 8: multiples of 8
                    [128, 8, 80, 48], [152, 8, 80, 72], [168, 8, 160, 8], [184, 8, 160, 24],
                    [232, 8, 160, 72], [248, 8, 240, 8], [264, 8, 240, 24], [296, 8, 240, 56],
                    // Divisor 9: multiples of 9
                    [126, 9, 90, 36], [153, 9, 90, 63], [171, 9, 90, 81], [189, 9, 180, 9],
                    [234, 9, 180, 54], [261, 9, 180, 81], [279, 9, 270, 9], [297, 9, 270, 27]
                ];
                
                const problem = pick(friendlyProblems);
                const dividend = problem[0];
                const divisor = problem[1];
                const part1 = problem[2];
                const part2 = problem[3];
                const quotient = dividend / divisor;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv3 = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>
                    
                    <!-- Area Model Grid -->
                    <div style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${90 + (i === 0 ? 30 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv3}-top-${i}" data-answer="${p.quotient}"
                                        style="width:55px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${90 + (i === 0 ? 30 : 0)}px;height:75px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv3}-total" data-answer="${quotient}"
                            style="width:70px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                break;
            }
            
            // ===== WORD PROBLEMS WITH VISUALS =====
            
            // Addition Word Problems
            if (mappedSkill === "add_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', color: 'pink', context: 'fruit basket' },
                    { item: '⭐', name: 'stars', color: 'yellow', context: 'sticker chart' },
                    { item: '📚', name: 'books', color: 'blue', context: 'library' },
                    { item: '🍪', name: 'cookies', color: 'orange', context: 'cookie jar' },
                    { item: '🎈', name: 'balloons', color: 'purple', context: 'party' },
                    { item: '🌸', name: 'flowers', color: 'pink', context: 'garden' },
                    { item: '🏀', name: 'balls', color: 'orange', context: 'gym' },
                    { item: '✏️', name: 'pencils', color: 'yellow', context: 'desk' },
                ];
                
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Mia', 'Lucas'];
                const scenario = pick(scenarios);
                const name1 = pick(names);
                let name2 = pick(names);
                while (name2 === name1) name2 = pick(names);
                
                // Use adaptive difficulty for range
                const adaptiveRange = getAdaptiveRange(range);
                const maxNum = Math.min(adaptiveRange, 50);
                const a = rng(2, maxNum);
                const b = rng(2, maxNum);
                const answer = a + b;
                
                const templates = [
                    `${name1} has ${a} ${scenario.name}. ${name2} gives ${name1} ${b} more ${scenario.name}. How many ${scenario.name} does ${name1} have now?`,
                    `There are ${a} ${scenario.name} in the ${scenario.context}. ${name1} adds ${b} more. How many ${scenario.name} are there in all?`,
                    `${name1} picks ${a} ${scenario.name}. Then ${name1} picks ${b} more. How many ${scenario.name} did ${name1} pick altogether?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Add the two amounts: ${a} + ${b} = ?`;
                
                // Create visual with pastel groups
                const group1Items = Array(Math.min(a, 15)).fill(scenario.item).join('');
                const group2Items = Array(Math.min(b, 15)).fill(scenario.item).join('');
                
                q.visual = `<div class="word-problem-visual">
                    <div class="word-problem-scene">
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.3rem;">${group1Items}</div>
                            <div class="visual-label">${a} ${scenario.name}</div>
                        </div>
                        <div style="font-size:2rem;color:#7209b7;font-weight:700;">+</div>
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.3rem;">${group2Items}</div>
                            <div class="visual-label">${b} ${scenario.name}</div>
                        </div>
                    </div>
                    <div class="visual-equation">
                        <span>${a}</span>
                        <span class="op">+</span>
                        <span>${b}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                break;
            }
            
            // Subtraction Word Problems
            if (mappedSkill === "sub_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', color: 'pink', verb: 'ate' },
                    { item: '🍪', name: 'cookies', color: 'orange', verb: 'ate' },
                    { item: '🎈', name: 'balloons', color: 'purple', verb: 'popped' },
                    { item: '📚', name: 'books', color: 'blue', verb: 'returned' },
                    { item: '⭐', name: 'stickers', color: 'yellow', verb: 'gave away' },
                    { item: '🌸', name: 'flowers', color: 'pink', verb: 'picked' },
                    { item: '🏀', name: 'balls', color: 'orange', verb: 'lost' },
                ];
                
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason'];
                const scenario = pick(scenarios);
                const name1 = pick(names);
                
                const adaptiveRange = getAdaptiveRange(range);
                const maxNum = Math.min(adaptiveRange, 50);
                const total = rng(10, maxNum);
                const taken = rng(2, total - 1);
                const answer = total - taken;
                
                const templates = [
                    `${name1} has ${total} ${scenario.name}. ${name1} ${scenario.verb} ${taken} of them. How many ${scenario.name} does ${name1} have left?`,
                    `There were ${total} ${scenario.name}. ${taken} were ${scenario.verb}. How many are left?`,
                    `${name1} started with ${total} ${scenario.name} and ${scenario.verb} ${taken}. How many ${scenario.name} remain?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Subtract: ${total} - ${taken} = ?`;
                
                // Visual showing crossing out items
                const totalItems = Array(Math.min(total, 20)).fill(scenario.item);
                const remainingHTML = totalItems.map((item, i) => 
                    i < taken 
                        ? `<span style="opacity:0.3;text-decoration:line-through;">${item}</span>`
                        : `<span>${item}</span>`
                ).join('');
                
                q.visual = `<div class="word-problem-visual">
                    <div style="text-align:center;margin-bottom:10px;">
                        <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">Started with ${total}, ${scenario.verb} ${taken}:</div>
                        <div class="visual-group group-${scenario.color}" style="max-width:300px;">
                            <div style="font-size:1.3rem;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;">${remainingHTML}</div>
                        </div>
                    </div>
                    <div class="visual-equation">
                        <span>${total}</span>
                        <span class="op">−</span>
                        <span>${taken}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                break;
            }
            
            // Multiplication Word Problems
            if (mappedSkill === "mult_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', container: 'basket', containerPlural: 'baskets' },
                    { item: '🍪', name: 'cookies', container: 'box', containerPlural: 'boxes' },
                    { item: '⭐', name: 'stickers', container: 'sheet', containerPlural: 'sheets' },
                    { item: '🌸', name: 'flowers', container: 'vase', containerPlural: 'vases' },
                    { item: '📚', name: 'books', container: 'shelf', containerPlural: 'shelves' },
                    { item: '🎈', name: 'balloons', container: 'bunch', containerPlural: 'bunches' },
                    { item: '🏀', name: 'balls', container: 'bag', containerPlural: 'bags' },
                ];
                
                const scenario = pick(scenarios);
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const name1 = pick(names);
                
                // Use facts-friendly numbers
                const groups = rng(2, 6);
                const perGroup = rng(2, 8);
                const answer = groups * perGroup;
                
                const templates = [
                    `${name1} has ${groups} ${groups === 1 ? scenario.container : scenario.containerPlural}. Each ${scenario.container} has ${perGroup} ${scenario.name}. How many ${scenario.name} does ${name1} have in all?`,
                    `There are ${groups} ${scenario.containerPlural} with ${perGroup} ${scenario.name} in each. How many ${scenario.name} are there altogether?`,
                    `${name1} bought ${groups} ${scenario.containerPlural} of ${scenario.name}. Each ${scenario.container} contains ${perGroup} ${scenario.name}. What is the total number of ${scenario.name}?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Multiply: ${groups} groups × ${perGroup} in each = ?`;
                
                // Create array visual
                const arrayRows = [];
                for (let r = 0; r < Math.min(groups, 6); r++) {
                    const rowItems = Array(Math.min(perGroup, 8)).fill(scenario.item).join(' ');
                    arrayRows.push(`<div class="array-row">${rowItems.split(' ').map(i => `<span style="font-size:1.4rem;">${i}</span>`).join('')}</div>`);
                }
                
                q.visual = `<div class="word-problem-visual">
                    <div class="array-visual">
                        <div class="array-label">${groups} rows × ${perGroup} in each row</div>
                        ${arrayRows.join('')}
                    </div>
                    <div class="visual-equation">
                        <span>${groups}</span>
                        <span class="op">×</span>
                        <span>${perGroup}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                break;
            }
            
            // Division Word Problems
            if (mappedSkill === "div_word_problems") {
                const scenarios = [
                    { item: '🍎', name: 'apples', action: 'share equally among' },
                    { item: '🍪', name: 'cookies', action: 'divide equally among' },
                    { item: '⭐', name: 'stickers', action: 'give equally to' },
                    { item: '🌸', name: 'flowers', action: 'put equally in' },
                    { item: '📚', name: 'books', action: 'place equally on' },
                    { item: '🎈', name: 'balloons', action: 'give equally to' },
                ];
                
                const scenario = pick(scenarios);
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const name1 = pick(names);
                
                // Ensure clean division
                const groups = rng(2, 6);
                const perGroup = rng(2, 8);
                const total = groups * perGroup;
                const answer = perGroup;
                
                const recipients = ['friends', 'boxes', 'bags', 'plates', 'shelves', 'children'];
                const recipient = pick(recipients);
                
                const templates = [
                    `${name1} has ${total} ${scenario.name} to ${scenario.action} ${groups} ${recipient}. How many ${scenario.name} will each ${recipient.slice(0, -1)} get?`,
                    `There are ${total} ${scenario.name}. They need to be shared equally among ${groups} ${recipient}. How many does each get?`,
                    `${name1} wants to divide ${total} ${scenario.name} into ${groups} equal groups. How many ${scenario.name} will be in each group?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.hint = `Divide: ${total} ÷ ${groups} = ?`;
                
                // Create equal groups visual
                const groupVisuals = [];
                for (let g = 0; g < Math.min(groups, 5); g++) {
                    const groupItems = Array(Math.min(perGroup, 6)).fill(scenario.item).map(i => 
                        `<span class="equal-group-item">${i}</span>`
                    ).join('');
                    groupVisuals.push(`<div class="equal-group">${groupItems}</div>`);
                }
                
                q.visual = `<div class="word-problem-visual">
                    <div style="text-align:center;margin-bottom:10px;">
                        <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">${total} ${scenario.name} shared equally into ${groups} groups:</div>
                    </div>
                    <div class="equal-groups-visual">
                        ${groupVisuals.join('')}
                    </div>
                    <div class="visual-equation">
                        <span>${total}</span>
                        <span class="op">÷</span>
                        <span>${groups}</span>
                        <span class="equals">=</span>
                        <span class="answer-box"></span>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(answer);
                break;
            }
            
            // Regular operations (original logic)
            let ops = [];
            let factsMode = false; // For limiting to fact ranges
            let factsRange = 20; // Default for addition/subtraction facts
            let addSub10s = false; // For add/subtract by 10s skill
            let addSub100s = false; // For add/subtract by 100s skill
            
            if (mappedSkill === "mixed" || mappedSkill === "operations_all" || state.skill === "operations_all") ops = ["+", "-", "×", "÷"];
            else if (mappedSkill === "mixed_add_sub") ops = ["+", "-"];
            else if (mappedSkill === "mixed_mult_div") ops = ["×", "÷"];
            // Facts skills - restricted ranges for quick recall
            else if (mappedSkill === "add_facts") { ops = ["+"]; factsMode = true; factsRange = 20; }
            else if (mappedSkill === "add_sub_10s") { ops = ["+", "-"]; addSub10s = true; }
            else if (mappedSkill === "add_sub_100s") { ops = ["+", "-"]; addSub100s = true; }
            else if (mappedSkill === "sub_facts") { ops = ["-"]; factsMode = true; factsRange = 20; }
            else if (mappedSkill === "mult_facts") { ops = ["×"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "div_facts") { ops = ["÷"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "add" || mappedSkill === "addition") ops = ["+"];
            else if (mappedSkill === "subtract" || mappedSkill === "subtraction") ops = ["-"];
            else if (mappedSkill === "multiply" || mappedSkill === "multiplication") ops = ["×"];
            else if (mappedSkill === "divide" || mappedSkill === "division") ops = ["÷"];
            // Handle category-based mixed modes
            else if (state.category === "number_ops_mixed") ops = ["+", "-", "×", "÷"];
            else if (state.category === "addition") ops = ["+"];
            else if (state.category === "subtraction") ops = ["-"];
            else if (state.category === "multiplication") ops = ["×"];
            else if (state.category === "division") ops = ["÷"];
            else ops = ["+"]; // Default to addition if skill not recognized
            const op = pick(ops);
            
            // Handle Add/Subtract by 10s skill
            if (addSub10s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 10; // 0, 10, 20, ..., 90
                    q.text = `${base} + 10 = ?`;
                    q.ans = base + 10;
                    q.hint = `When adding 10, the tens digit goes up by 1. ${base} + 10 = ${base + 10}`;
                    q.options = genOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                } else {
                    const base = rng(1, 10) * 10; // 10, 20, ..., 100
                    q.text = `${base} − 10 = ?`;
                    q.ans = base - 10;
                    q.hint = `When subtracting 10, the tens digit goes down by 1. ${base} − 10 = ${base - 10}`;
                    q.options = genOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                }
                break;
            }
            
            // Handle Add/Subtract by 100s skill
            if (addSub100s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 100; // 0, 100, 200, ..., 900
                    q.text = `${base} + 100 = ?`;
                    q.ans = base + 100;
                    q.hint = `When adding 100, the hundreds digit goes up by 1. ${base} + 100 = ${base + 100}`;
                    q.options = genOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                } else {
                    const base = rng(1, 10) * 100; // 100, 200, ..., 1000
                    q.text = `${base} − 100 = ?`;
                    q.ans = base - 100;
                    q.hint = `When subtracting 100, the hundreds digit goes down by 1. ${base} − 100 = ${base - 100}`;
                    q.options = genOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                }
                break;
            }
            
            // For facts mode, use restricted ranges
            let a, b;
            if (factsMode) {
                if (op === "+" || op === "-") {
                    // Addition/subtraction facts within 20
                    a = rng(1, factsRange);
                    b = rng(1, factsRange - a); // Ensure sum ≤ 20
                    if (b < 1) b = 1;
                } else {
                    // Multiplication/division facts (1-12 tables)
                    a = rng(1, factsRange);
                    b = rng(1, factsRange);
                }
            } else {
                a = rng(1, range);
                b = rng(1, range);
            }

            if (op === "×") {
                // Determine if this is a basic fact (12×12 or less) or needs column multiplication
                // For ranges 10, 20, 50, 100: use basic 12×12 tables
                const useFullTables = [10, 20, 50, 100].includes(range);
                
                if (useFullTables) {
                    // Basic multiplication facts (1-12 × 1-12) - can be horizontal or simple vertical
                    a = pick(ensureTables());
                    b = rng(1, 12);
                    q.ans = a * b;
                    q.hint = `Think: ${b} groups of ${a}. Count by ${a}s: ${Array.from({length: Math.min(b, 5)}, (_, i) => a * (i + 1)).join(", ")}${b > 5 ? ", ..." : ""}`;
                    
                    // Add visual hint with array for smaller numbers
                    if (a <= 10 && b <= 10) {
                        q.hintVisual = createDotArray(b, a, `${b} rows × ${a} = ${a * b}`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">${b} groups of ${a}:<br>${Array.from({length: Math.min(b, 4)}, () => a).join(" + ")}${b > 4 ? " + ..." : ""} = <span style="color:var(--accent-green);">${a * b}</span></div>`;
                    }
                    // Basic facts can use horizontal format (multiple choice)
                } else {
                    // ALWAYS use column multiplication for problems beyond 12×12
                    // Determine problem type: 2-digit × 1-digit OR 2-digit × 2-digit
                    const problemType = Math.random() < 0.7 ? '2x1' : '2x2';
                    
                    if (problemType === '2x1') {
                        a = rng(13, 99); // 2-digit (must be > 12)
                        b = rng(2, 9);   // 1-digit
                    } else {
                        a = rng(11, 49); // 2-digit (keep reasonable)
                        b = rng(11, 29); // 2-digit
                    }
                    
                    q.ans = a * b;
                    const uniqueIdMult = Date.now() + Math.random().toString(36).substr(2, 9);
                    
                    // Parse digits for display
                    const ones_b = b % 10;
                    const tens_b = Math.floor(b / 10);
                    const isTwoDigitMultiplier = b >= 10;
                    
                    // Calculate partial products with EXACT digit counts
                    const partial1 = a * ones_b;
                    const partial2 = isTwoDigitMultiplier ? a * tens_b * 10 : 0; // Include the 0
                    const answerLen = q.ans.toString().length;
                    const partial1Len = partial1.toString().length;
                    const partial2Len = isTwoDigitMultiplier ? partial2.toString().length : 0;
                    
                    // Display width based on largest number we need to show
                    const displayWidth = Math.max(a.toString().length, b.toString().length, answerLen);
                    const paddedMultA = a.toString().padStart(displayWidth, ' ').split('');
                    const paddedMultB = b.toString().padStart(displayWidth, ' ').split('');
                    
                    // Carry boxes = one fewer than the number of digits in what we're multiplying
                    const carryBoxCount = a.toString().length;
                    
                    q.hint = isTwoDigitMultiplier 
                        ? `Multiply ${a} × ${ones_b} first, then ${a} × ${tens_b}0, then add the partial products.`
                        : `Multiply each digit: ${a} × ${b}. Carry when needed.`;
                    
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Multiplication</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-purple);">
                            <!-- Carry boxes for first multiplication -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry1-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-purple);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-purple);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <!-- First number -->
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:10px;">&nbsp;</span>${paddedMultA.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <!-- Second number with × -->
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:10px;">×</span>${paddedMultB.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>

                            <!-- Partial Product 1: multiply by ones digit -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-orange);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${ones_b} =</span>
                            </div>
                            <div style="padding-top:2px;${isTwoDigitMultiplier ? '' : 'border-bottom:3px solid #444;padding-bottom:6px;'}">
                                <span style="margin-right:10px;">&nbsp;</span>${Array(partial1Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p1-${i}" style="width:22px;height:22px;border:1px solid var(--accent-orange);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>

                            ${isTwoDigitMultiplier ? `
                            <!-- Partial Product 2: multiply by tens digit (with trailing 0) -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-cyan);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${tens_b}0 =</span>
                            </div>
                            <div style="border-bottom:3px solid #444;padding-top:2px;padding-bottom:6px;">
                                <span style="margin-right:10px;">+</span>${Array(partial2Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p2-${i}" style="width:22px;height:22px;border:1px solid var(--accent-cyan);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>
                            
                            <!-- Carry boxes for final addition -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-top:4px;margin-bottom:2px;padding-right:2px;">
                                ${Array(answerLen - 1).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry2-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-green);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-green);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            ` : ''}

                            <!-- Final Answer row -->
                            <div style="padding-top:${isTwoDigitMultiplier ? '2px' : '8px'};font-size:0.7rem;color:var(--accent-green);text-align:left;font-weight:700;">
                                <span style="margin-left:4px;">Final Answer:</span>
                            </div>
                            <div style="padding-top:2px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:10px;">=</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdMult}-ans-${i}" style="width:22px;height:24px;border:2px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.8rem;color:var(--text-secondary);">
                            ${isTwoDigitMultiplier ? 'Step 1: Multiply by ones • Step 2: Multiply by tens (add 0) • Step 3: Add' : 'Multiply each digit, carry when needed'}
                        </div>
                    </div>`;
                    
                    q.options = []; // No multiple choice for column multiplication
                }
            } else if (op === "÷") {
                // For ranges 10, 20, 50, 100: ignore range and use full 12×12 tables
                const useFullTables = [10, 20, 50, 100].includes(range);

                // Mix of formats: 50% long division style, 50% horizontal
                const useLongDiv = Math.random() < 0.5;

                if (useLongDiv && useFullTables) {
                    // Simple long division style for 12×12 facts (divisor⟌dividend with answer on top)
                    const divisor = pick(ensureTables());
                    const result = rng(1, 12);
                    a = divisor * result;  // Dividend (up to 144)
                    b = divisor;
                    q.ans = result;
                    q.hint = `How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array
                    if (a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }

                    const uniqueIdSimpleDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const divDigitsSimple = a.toString().split('');
                    q.visual = `<!-- Long Division --><div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-cyan);">Long Division</div>
                        <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                            <div style="display:flex;align-items:flex-start;gap:6px;">
                                <!-- Divisor on the left -->
                                <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-top:50px;">${b}</div>

                                <!-- Division bracket with answer on top -->
                                <div>
                                    <!-- Answer boxes on top -->
                                    <div style="display:flex;justify-content:center;gap:4px;margin-bottom:4px;">
                                        ${divDigitsSimple.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSimpleDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.3rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                    </div>
                                    <!-- Division bracket (top line and left hook) with dividend -->
                                    <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 15px 8px 12px;border-top-left-radius:8px;">
                                        <div style="display:flex;gap:4px;">
                                            ${divDigitsSimple.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.5rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>
                                    </div>
                                    <!-- Work area for subtraction -->
                                    <div style="margin-left:12px;margin-top:8px;">
                                        <div style="display:flex;gap:4px;align-items:center;">
                                            <span style="font-size:0.9rem;color:var(--text-dim);width:16px;">−</span>
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                        <div style="border-top:2px solid #444;margin:4px 0 4px 16px;"></div>
                                        <div style="display:flex;gap:4px;margin-left:16px;">
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px dashed var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            ${b} ) ${a} &nbsp;•&nbsp; Divide, Multiply, Subtract
                        </div>
                    </div>`;
                } else if (useLongDiv && !useFullTables) {
                    // Long division for larger problems: 2-digit ÷ 1-digit
                    b = rng(2, 9); // divisor (single digit)
                    const result = rng(2, 12); // quotient
                    a = b * result; // dividend (ensures clean division, will be 2-digit)
                    q.ans = result;
                    q.hint = `Use long division: How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}`;

                    // Visual long division - format depends on problem size
                    const divDigits = a.toString().split('');
                    const quotientLen = result.toString().length;
                    const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const needsWorkingArea = a > 144; // Only show working area for problems larger than 144/12

                    // Worked example hint with steps
                    const firstDigit = parseInt(divDigits[0]);
                    const quotientFirstDigit = Math.floor(firstDigit / b);
                    const remainder1 = firstDigit - (quotientFirstDigit * b);
                    q.hintVisual = `<div style="text-align:left;font-size:0.85rem;line-height:1.6;">
                        <div style="font-weight:700;color:var(--accent-cyan);margin-bottom:8px;">Worked Example: ${a} ÷ ${b}</div>
                        <div style="padding-left:10px;">
                            <div><strong>Step 1:</strong> How many ${b}s in ${a}?</div>
                            <div><strong>Step 2:</strong> ${b} × ${result} = ${a}</div>
                            <div><strong>Answer:</strong> <span style="color:var(--accent-green);font-weight:700;">${result}</span></div>
                            <div style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.1);border-radius:6px;text-align:center;font-family:monospace;">
                                <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
                                    <span>${b}</span>
                                    <span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:4px 12px 4px 8px;border-top-left-radius:6px;">${a}</span>
                                </div>
                                <div style="color:var(--accent-green);font-weight:700;margin-top:4px;">= ${result}</div>
                            </div>
                        </div>
                    </div>`;

                    if (needsWorkingArea) {
                        // Full format with working area for larger problems
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:8px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);padding-bottom:10px;">${b}</div>

                                    <div style="min-width:${divDigits.length * 40 + 20}px;">
                                        <!-- Quotient (answer) on top with label -->
                                        <div style="font-size:0.75rem;color:var(--accent-green);text-align:left;margin-bottom:2px;font-weight:700;">
                                            Answer:
                                        </div>
                                        <div style="display:flex;gap:4px;padding-left:15px;margin-bottom:4px;">
                                            ${divDigits.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;color:var(--accent-green);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                        </div>

                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:8px 10px 8px 15px;border-top-left-radius:8px;margin-bottom:10px;">
                                            ${divDigits.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.3rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>

                                        <!-- Working area label -->
                                        <div style="font-size:0.75rem;color:var(--text-dim);text-align:left;margin-bottom:4px;padding-left:4px;">
                                            Work area:
                                        </div>

                                        <!-- Working area for multiply/subtract steps (interactive) -->
                                        <div style="padding-left:15px;">
                                            ${Array(4).fill(0).map((_, rowIdx) => `
                                                <div style="display:flex;gap:4px;margin-bottom:8px;">
                                                    ${divDigits.map((_, colIdx) => `<input type="text" maxlength="2" class="column-work-input" data-col="${uniqueIdDiv}-work-${rowIdx}-${colIdx}" style="width:36px;height:30px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                                Divide • Multiply • Subtract • Bring down • Repeat
                            </div>
                        </div>`;
                    } else {
                        // Simple format without working area for smaller problems (≤144)
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:4px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-bottom:8px;">${b}</div>

                                    <!-- Division bracket with answer on top -->
                                    <div>
                                        <!-- Answer box on top -->
                                        <div style="display:flex;justify-content:center;margin-bottom:4px;">
                                            <input type="text" maxlength="2" class="column-answer-input" data-col="${uniqueIdDiv}-quot-0" style="width:70px;height:45px;border:3px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.5rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">
                                        </div>
                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 20px 8px 15px;border-top-left-radius:8px;">
                                            <span style="font-size:1.8rem;font-weight:700;">${a}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.9rem;color:var(--text-secondary);">
                                ${b} ) ${a} = ?
                            </div>
                        </div>`;
                    }
                } else {
                    // Regular division facts (based on 1-12 tables, ignores max number range)
                    const divisor = pick(ensureTables());
                    const result = rng(1, 12);
                    a = divisor * result;  // Dividend can be up to 144, regardless of range setting
                    b = divisor;
                    q.ans = result;
                    q.hint = `How many groups of ${b} can you make from ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array
                    if (a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }
                }
            } else if (op === "-") {
                // For facts mode, always use simple horizontal format
                // For non-facts: Within 100: 50% mix between column and horizontal
                // More than 100: Always use column subtraction
                const useColumnSub = factsMode ? false : (range > 100 ? true : (range >= 20 && Math.random() < 0.5));

                if (useColumnSub) {
                    // Column subtraction: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minSubVal = Math.max(10, Math.floor(range / 4));
                    a = rng(Math.min(minSubVal, range - 1), range);
                    b = rng(Math.max(1, Math.floor(a / 4)), Math.max(2, Math.floor(a * 0.7)));
                    q.ans = a - b;
                    q.hint = `Use column subtraction: Line up the digits by place value. Start from the ones column and work left. Borrow if needed!`;

                    // Visual column subtraction with EXACT digit counts
                    const answerLen = q.ans.toString().length;
                    const displayLen = a.toString().length; // Minuend determines width
                    const subDigitsA = a.toString().split('');
                    const subDigitsB = b.toString().padStart(displayLen, ' ').split('');
                    const uniqueIdSub = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Subtraction</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-pink);">
                            <!-- Regrouping boxes for borrowing (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${subDigitsA.map((_, i) => `<input type="text" maxlength="2" class="column-carry-input" data-col="${uniqueIdSub}-borrow-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-orange);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-orange);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${subDigitsA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">−</span>${subDigitsB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSub}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for borrowing
                        </div>
                    </div>`;
                } else {
                    // Regular subtraction (mental math)
                    if (a < b) [a, b] = [b, a];
                    q.ans = a - b;
                    q.hint = `Start at ${a.toLocaleString()} and count back ${b.toLocaleString()}. Or think: ${q.ans.toLocaleString()} + ${b.toLocaleString()} = ${a.toLocaleString()}`;
                    // Number line for subtraction
                    if (a <= 100) {
                        const minVal = Math.max(0, q.ans - 5);
                        const maxVal = a + 5;
                        q.visual = `<div style="text-align:center;"><div style="font-weight:700;margin-bottom:30px;">Start at ${a.toLocaleString()}, jump back ${b.toLocaleString()}</div>${createNumberLine(minVal, maxVal, a, q.ans)}</div>`;
                    } else {
                        q.visual = `<div style="font-weight:700;">${a.toLocaleString()} − ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count back ${b.toLocaleString()}</div>`;
                    }
                }
            } else {
                // Addition: For facts mode, always use simple horizontal format
                // For non-facts: Within 100: 50% mix between column and horizontal
                // More than 100: Always use column addition
                const useColumnAdd = factsMode ? false : (range > 100 ? true : (range >= 20 && Math.random() < 0.5));

                if (useColumnAdd) {
                    // Column addition: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minAddVal = Math.max(5, Math.floor(range / 4));
                    a = rng(Math.min(minAddVal, range - 1), range);
                    b = rng(Math.min(minAddVal, range - 1), range);
                    q.ans = a + b;
                    q.hint = `Use column addition: Line up the digits by place value. Start from the ones column and work left. Carry if the sum is 10 or more!`;

                    // Visual column addition with interactive input boxes
                    // Use EXACT digit counts for each number
                    const answerLen = q.ans.toString().length;
                    const displayLen = Math.max(a.toString().length, b.toString().length);
                    const paddedAddA = a.toString().padStart(displayLen, ' ').split('');
                    const paddedAddB = b.toString().padStart(displayLen, ' ').split('');
                    const carryBoxCount = displayLen; // One carry box per column
                    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Addition</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-green);">
                            <!-- Regrouping boxes for carrying (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueId}-carry-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-cyan);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.75rem;color:var(--accent-cyan);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${paddedAddA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">+</span>${paddedAddB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for carrying
                        </div>
                    </div>`;
                } else {
                    // Regular addition (mental math)
                    q.ans = a + b;
                    q.hint = `Start at ${a.toLocaleString()} and count up ${b.toLocaleString()}. Or: ${a.toLocaleString()} + ${b.toLocaleString()} = ?`;
                    // Number line for addition
                    if (q.ans <= 100) {
                        const minVal = Math.max(0, a - 5);
                        const maxVal = q.ans + 5;
                        q.visual = `<div style="text-align:center;"><div style="font-weight:700;margin-bottom:30px;">Start at ${a.toLocaleString()}, jump forward ${b.toLocaleString()}</div>${createNumberLine(minVal, maxVal, a, q.ans)}</div>`;
                    } else {
                        q.visual = `<div style="font-weight:700;">${a.toLocaleString()} + ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count up ${b.toLocaleString()}</div>`;
                    }
                }
            }
            q.text = `${a.toLocaleString()} ${op} ${b.toLocaleString()} = ?`;
            q.a = a;
            q.b = b;
            q.op = op;
            
            // Set printFormat for facts skills (mixed horizontal/vertical)
            if (factsMode) {
                if (op === '+') {
                    q.printFormat = Math.random() < 0.5 ? 'add-facts-horizontal' : 'add-facts-vertical';
                    q.skillLabel = 'Add Facts';
                } else if (op === '-' || op === '−') {
                    q.printFormat = Math.random() < 0.5 ? 'sub-facts-horizontal' : 'sub-facts-vertical';
                    q.skillLabel = 'Sub Facts';
                } else if (op === '×') {
                    q.printFormat = Math.random() < 0.5 ? 'mult-facts-horizontal' : 'mult-facts-vertical';
                    q.skillLabel = 'Mult Facts';
                } else if (op === '÷') {
                    const roll = Math.random();
                    if (roll < 0.33) q.printFormat = 'div-facts-horizontal';
                    else if (roll < 0.66) q.printFormat = 'div-facts-fraction';
                    else q.printFormat = 'div-facts-long';
                    q.skillLabel = 'Div Facts';
                }
            }
            q.options = buildNumericOptions(q.ans);
            break;
        }

        case "order_of_operations": {
            // Progressive skill levels for PEMDAS
            let ooSkill = mappedSkill;
            if (ooSkill === "mixed" || !ooSkill) {
                ooSkill = pick(["two_ops_no_paren", "three_ops_no_paren", "paren_simple", "paren_multi", "exponents_simple", "exponents_mixed", "full_pemdas"]);
            }

            // Helper to generate safe numbers for operations
            const safeNum = (min, max) => rng(min, max);
            
            // Helper to pick operation
            const pickOp = (ops) => pick(ops);
            
            // Helper to format expression for display
            const formatExp = (exp) => exp.replace(/\*/g, '×').replace(/\//g, '÷').replace(/\^/g, '<sup>').replace(/\^(\d+)/g, '<sup>$1</sup>');

            let expression = "";
            let answer = 0;
            let hint = "";
            let steps = [];

            if (ooSkill === "two_ops_no_paren") {
                // Level 1: Two operations, no parentheses
                // Examples: 3 + 4 × 2, 8 - 6 ÷ 2, 5 × 3 + 4
                const pattern = pick(["a+b*c", "a-b*c", "a*b+c", "a*b-c", "a+b/c", "a-b/c"]);
                
                if (pattern === "a+b*c") {
                    const a = safeNum(1, 20);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} + ${b} × ${c}`;
                    answer = a + (b * c);
                    steps = [`First: ${b} × ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before adding!";
                } else if (pattern === "a-b*c") {
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const a = safeNum(b * c + 1, b * c + 20);
                    expression = `${a} - ${b} × ${c}`;
                    answer = a - (b * c);
                    steps = [`First: ${b} × ${c} = ${b * c}`, `Then: ${a} - ${b * c} = ${answer}`];
                    hint = "Remember: Multiply before subtracting!";
                } else if (pattern === "a*b+c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, 20);
                    expression = `${a} × ${b} + ${c}`;
                    answer = (a * b) + c;
                    steps = [`First: ${a} × ${b} = ${a * b}`, `Then: ${a * b} + ${c} = ${answer}`];
                    hint = "Multiply first, then add.";
                } else if (pattern === "a*b-c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, Math.min(a * b - 1, 15));
                    expression = `${a} × ${b} - ${c}`;
                    answer = (a * b) - c;
                    steps = [`First: ${a} × ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${answer}`];
                    hint = "Multiply first, then subtract.";
                } else if (pattern === "a+b/c") {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10); // Ensure clean division
                    const a = safeNum(1, 20);
                    expression = `${a} + ${b} ÷ ${c}`;
                    answer = a + (b / c);
                    steps = [`First: ${b} ÷ ${c} = ${b / c}`, `Then: ${a} + ${b / c} = ${answer}`];
                    hint = "Remember: Divide before adding!";
                } else {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10);
                    const a = safeNum(b / c + 1, 30);
                    expression = `${a} - ${b} ÷ ${c}`;
                    answer = a - (b / c);
                    steps = [`First: ${b} ÷ ${c} = ${b / c}`, `Then: ${a} - ${b / c} = ${answer}`];
                    hint = "Remember: Divide before subtracting!";
                }
            } else if (ooSkill === "three_ops_no_paren") {
                // Level 2: Three operations, no parentheses
                const pattern = pick(["a+b*c-d", "a*b+c*d", "a+b+c*d", "a*b-c+d"]);
                
                if (pattern === "a+b*c-d") {
                    const a = safeNum(5, 20);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const d = safeNum(1, Math.min(a + b * c - 1, 10));
                    expression = `${a} + ${b} × ${c} - ${d}`;
                    answer = a + (b * c) - d;
                    steps = [`First: ${b} × ${c} = ${b * c}`, `Then: ${a} + ${b * c} = ${a + b * c}`, `Finally: ${a + b * c} - ${d} = ${answer}`];
                    hint = "Do multiplication first, then work left to right.";
                } else if (pattern === "a*b+c*d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    expression = `${a} × ${b} + ${c} × ${d}`;
                    answer = (a * b) + (c * d);
                    steps = [`First: ${a} × ${b} = ${a * b}`, `And: ${c} × ${d} = ${c * d}`, `Then: ${a * b} + ${c * d} = ${answer}`];
                    hint = "Do both multiplications first, then add.";
                } else if (pattern === "a+b+c*d") {
                    const a = safeNum(5, 15);
                    const b = safeNum(5, 15);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 5);
                    expression = `${a} + ${b} + ${c} × ${d}`;
                    answer = a + b + (c * d);
                    steps = [`First: ${c} × ${d} = ${c * d}`, `Then: ${a} + ${b} + ${c * d} = ${answer}`];
                    hint = "Multiplication comes first!";
                } else {
                    const a = safeNum(3, 10);
                    const b = safeNum(2, 8);
                    const c = safeNum(1, Math.min(a * b - 2, 15));
                    const d = safeNum(1, 10);
                    expression = `${a} × ${b} - ${c} + ${d}`;
                    answer = (a * b) - c + d;
                    steps = [`First: ${a} × ${b} = ${a * b}`, `Then: ${a * b} - ${c} = ${a * b - c}`, `Finally: ${a * b - c} + ${d} = ${answer}`];
                    hint = "Multiply first, then work left to right.";
                }
            } else if (ooSkill === "paren_simple") {
                // Level 3: Simple parentheses
                const pattern = pick(["(a+b)*c", "(a-b)*c", "a*(b+c)", "a*(b-c)", "(a+b)/c"]);
                
                if (pattern === "(a+b)*c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 8);
                    expression = `(${a} + ${b}) × ${c}`;
                    answer = (a + b) * c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} × ${c} = ${answer}`];
                    hint = "Parentheses first! Add inside, then multiply.";
                } else if (pattern === "(a-b)*c") {
                    const b = safeNum(2, 8);
                    const a = safeNum(b + 2, 15);
                    const c = safeNum(2, 8);
                    expression = `(${a} - ${b}) × ${c}`;
                    answer = (a - b) * c;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then: ${a - b} × ${c} = ${answer}`];
                    hint = "Parentheses first! Subtract inside, then multiply.";
                } else if (pattern === "a*(b+c)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} × (${b} + ${c})`;
                    answer = a * (b + c);
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then: ${a} × ${b + c} = ${answer}`];
                    hint = "Always do parentheses first!";
                } else if (pattern === "a*(b-c)") {
                    const a = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const b = safeNum(c + 2, 15);
                    expression = `${a} × (${b} - ${c})`;
                    answer = a * (b - c);
                    steps = [`First (parentheses): ${b} - ${c} = ${b - c}`, `Then: ${a} × ${b - c} = ${answer}`];
                    hint = "Parentheses first!";
                } else {
                    const c = safeNum(2, 8);
                    const sum = c * safeNum(2, 10);
                    const a = safeNum(1, sum - 1);
                    const b = sum - a;
                    expression = `(${a} + ${b}) ÷ ${c}`;
                    answer = (a + b) / c;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then: ${a + b} ÷ ${c} = ${answer}`];
                    hint = "Add inside parentheses first, then divide.";
                }
            } else if (ooSkill === "paren_multi") {
                // Level 4: Parentheses with multiple operations
                const pattern = pick(["(a+b)*c+d", "(a+b)*(c+d)", "a*(b+c)-d", "(a-b)*c+d"]);
                
                if (pattern === "(a+b)*c+d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} + ${b}) × ${c} + ${d}`;
                    answer = (a + b) * c + d;
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then multiply: ${a + b} × ${c} = ${(a + b) * c}`, `Finally add: ${(a + b) * c} + ${d} = ${answer}`];
                    hint = "P then M then A: Parentheses, Multiply, Add";
                } else if (pattern === "(a+b)*(c+d)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 6);
                    expression = `(${a} + ${b}) × (${c} + ${d})`;
                    answer = (a + b) * (c + d);
                    steps = [`First parentheses: ${a} + ${b} = ${a + b}`, `Second parentheses: ${c} + ${d} = ${c + d}`, `Then multiply: ${a + b} × ${c + d} = ${answer}`];
                    hint = "Do BOTH parentheses first, then multiply!";
                } else if (pattern === "a*(b+c)-d") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const d = safeNum(1, Math.min(a * (b + c) - 1, 15));
                    expression = `${a} × (${b} + ${c}) - ${d}`;
                    answer = a * (b + c) - d;
                    steps = [`First (parentheses): ${b} + ${c} = ${b + c}`, `Then multiply: ${a} × ${b + c} = ${a * (b + c)}`, `Finally subtract: ${a * (b + c)} - ${d} = ${answer}`];
                    hint = "Parentheses → Multiply → Subtract";
                } else {
                    const b = safeNum(2, 6);
                    const a = safeNum(b + 2, 12);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} - ${b}) × ${c} + ${d}`;
                    answer = (a - b) * c + d;
                    steps = [`First (parentheses): ${a} - ${b} = ${a - b}`, `Then multiply: ${a - b} × ${c} = ${(a - b) * c}`, `Finally add: ${(a - b) * c} + ${d} = ${answer}`];
                    hint = "Parentheses → Multiply → Add";
                }
            } else if (ooSkill === "exponents_simple") {
                // Level 5: Simple exponents
                const pattern = pick(["a^2", "a^2+b", "a^2-b", "a^3"]);
                
                if (pattern === "a^2") {
                    const a = safeNum(2, 12);
                    expression = `${a}²`;
                    answer = a * a;
                    steps = [`${a}² means ${a} × ${a}`, `${a} × ${a} = ${answer}`];
                    hint = "The small 2 means multiply the number by itself!";
                } else if (pattern === "a^2+b") {
                    const a = safeNum(2, 10);
                    const b = safeNum(1, 20);
                    expression = `${a}² + ${b}`;
                    answer = (a * a) + b;
                    steps = [`First: ${a}² = ${a} × ${a} = ${a * a}`, `Then: ${a * a} + ${b} = ${answer}`];
                    hint = "Exponents before addition!";
                } else if (pattern === "a^2-b") {
                    const a = safeNum(3, 10);
                    const b = safeNum(1, Math.min(a * a - 1, 15));
                    expression = `${a}² - ${b}`;
                    answer = (a * a) - b;
                    steps = [`First: ${a}² = ${a} × ${a} = ${a * a}`, `Then: ${a * a} - ${b} = ${answer}`];
                    hint = "Exponents before subtraction!";
                } else {
                    const a = safeNum(2, 5);
                    expression = `${a}³`;
                    answer = a * a * a;
                    steps = [`${a}³ means ${a} × ${a} × ${a}`, `${a} × ${a} = ${a * a}`, `${a * a} × ${a} = ${answer}`];
                    hint = "The small 3 means multiply the number by itself 3 times!";
                }
            } else if (ooSkill === "exponents_mixed") {
                // Level 6: Exponents with operations
                const pattern = pick(["a^2+b*c", "a*b^2", "(a+b)^2", "a^2-b^2"]);
                
                if (pattern === "a^2+b*c") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    expression = `${a}² + ${b} × ${c}`;
                    answer = (a * a) + (b * c);
                    steps = [`First exponent: ${a}² = ${a * a}`, `Then multiply: ${b} × ${c} = ${b * c}`, `Finally add: ${a * a} + ${b * c} = ${answer}`];
                    hint = "Exponents and multiplication before addition!";
                } else if (pattern === "a*b^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    expression = `${a} × ${b}²`;
                    answer = a * (b * b);
                    steps = [`First exponent: ${b}² = ${b * b}`, `Then multiply: ${a} × ${b * b} = ${answer}`];
                    hint = "Exponent first, then multiply!";
                } else if (pattern === "(a+b)^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 6);
                    expression = `(${a} + ${b})²`;
                    answer = (a + b) * (a + b);
                    steps = [`First (parentheses): ${a} + ${b} = ${a + b}`, `Then square: ${a + b}² = ${a + b} × ${a + b} = ${answer}`];
                    hint = "Parentheses first, then apply the exponent!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, a - 1);
                    expression = `${a}² - ${b}²`;
                    answer = (a * a) - (b * b);
                    steps = [`First: ${a}² = ${a * a}`, `Then: ${b}² = ${b * b}`, `Finally: ${a * a} - ${b * b} = ${answer}`];
                    hint = "Calculate both squares, then subtract!";
                }
            } else {
                // Level 7: Full PEMDAS challenge
                const pattern = pick(["(a+b)^2-c*d", "a^2+(b+c)*d", "(a*b+c)^2", "a^2+b^2-c"]);
                
                if (pattern === "(a+b)^2-c*d") {
                    const a = safeNum(2, 5);
                    const b = safeNum(2, 5);
                    const c = safeNum(2, 5);
                    const d = safeNum(2, 5);
                    const squared = (a + b) * (a + b);
                    const product = c * d;
                    if (squared > product) {
                        expression = `(${a} + ${b})² - ${c} × ${d}`;
                        answer = squared - product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}² = ${squared}`, `Multiply: ${c} × ${d} = ${product}`, `Subtract: ${squared} - ${product} = ${answer}`];
                    } else {
                        expression = `(${a} + ${b})² + ${c} × ${d}`;
                        answer = squared + product;
                        steps = [`Parentheses: ${a} + ${b} = ${a + b}`, `Exponent: ${a + b}² = ${squared}`, `Multiply: ${c} × ${d} = ${product}`, `Add: ${squared} + ${product} = ${answer}`];
                    }
                    hint = "PEMDAS: Parentheses → Exponents → Multiply → Add/Subtract";
                } else if (pattern === "a^2+(b+c)*d") {
                    const a = safeNum(3, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 5);
                    expression = `${a}² + (${b} + ${c}) × ${d}`;
                    answer = (a * a) + (b + c) * d;
                    steps = [`Exponent: ${a}² = ${a * a}`, `Parentheses: ${b} + ${c} = ${b + c}`, `Multiply: ${b + c} × ${d} = ${(b + c) * d}`, `Add: ${a * a} + ${(b + c) * d} = ${answer}`];
                    hint = "Handle exponents and parentheses first!";
                } else if (pattern === "(a*b+c)^2") {
                    const a = safeNum(2, 4);
                    const b = safeNum(2, 4);
                    const c = safeNum(1, 5);
                    const inside = a * b + c;
                    expression = `(${a} × ${b} + ${c})²`;
                    answer = inside * inside;
                    steps = [`Inside parentheses - multiply: ${a} × ${b} = ${a * b}`, `Inside parentheses - add: ${a * b} + ${c} = ${inside}`, `Square the result: ${inside}² = ${answer}`];
                    hint = "Solve inside the parentheses first, then square!";
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, 6);
                    const c = safeNum(1, 15);
                    expression = `${a}² + ${b}² - ${c}`;
                    answer = (a * a) + (b * b) - c;
                    steps = [`First: ${a}² = ${a * a}`, `Then: ${b}² = ${b * b}`, `Add: ${a * a} + ${b * b} = ${a * a + b * b}`, `Subtract: ${a * a + b * b} - ${c} = ${answer}`];
                    hint = "Calculate both exponents first!";
                }
            }

            q.text = `${expression} = ?`;
            q.ans = answer;
            q.hint = hint;
            
            // Create visual with step-by-step breakdown
            const stepsHTML = steps.map((s, i) => `<div style="margin: 5px 0;"><strong>Step ${i + 1}:</strong> ${s}</div>`).join('');
            q.hintVisual = `<div style="text-align:left;font-size:0.9rem;padding:10px;background:rgba(255,255,255,0.1);border-radius:8px;">
                <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🧮 PEMDAS Steps:</div>
                ${stepsHTML}
            </div>`;
            
            q.options = buildNumericOptions(answer);
            break;
        }

        case "patterns": {
            const start = rng(1, range);
            // allowRuleQ: only true for mixed patterns, not specific ones like seq_2, seq_5, etc.
            const patternQ = (step, allowRuleQ = false) => {
                const seq = [start, start + step, start + step * 2, start + step * 3];

                // Only ask for rule identification when it's a mixed pattern (50% chance)
                const askForRule = allowRuleQ && Math.random() < 0.5;

                if (askForRule) {
                    // Rule identification question
                    const isAdd = step > 0;
                    const absStep = Math.abs(step);
                    const ruleText = isAdd ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${seq[0].toLocaleString()}, ${seq[1].toLocaleString()}, ${seq[2].toLocaleString()}, ${seq[3].toLocaleString()}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    // Wrong operation
                    wrongRules.push(isAdd ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    // Wrong step amount
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    // Visual showing the sequence with question marks for the rule
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">🔍 Find the Rule</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[0].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[1].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[2].toLocaleString()}</span>
                            <span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>
                            <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[3].toLocaleString()}</span>
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Ask for a missing number at any position (1st, 2nd, 3rd, or 4th)
                    const missingPos = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
                    q.ans = seq[missingPos];
                    q.hint = `Each number ${step > 0 ? "increases" : "decreases"} by ${Math.abs(step).toLocaleString()}. Pattern: ${step > 0 ? '+' : '−'}${Math.abs(step).toLocaleString()}`;

                    // Build sequence display with ___ at the missing position
                    const seqDisplay = seq.map((n, i) => i === missingPos ? '___' : n.toLocaleString());
                    q.text = `Complete: ${seqDisplay.join(', ')}`;

                    const arrow = step > 0 ? `+${Math.abs(step).toLocaleString()}→` : `−${Math.abs(step).toLocaleString()}→`;
                    const posLabels = ['1st', '2nd', '3rd', '4th'];
                    q.visual = `<div style="text-align:center;">
                        <div style="margin-bottom:10px;font-size:0.9rem;color:var(--text-secondary);">Find the <strong style="color:var(--accent-green);">${posLabels[missingPos]}</strong> number</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                        ${seq.map((n, i) => {
                            if (i === missingPos) {
                                return `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:8px 14px;border-radius:10px;min-width:40px;text-align:center;">___</span>`;
                            } else {
                                return `<span style="background:var(--accent-cyan);color:white;padding:8px 14px;border-radius:10px;">${n.toLocaleString()}</span>`;
                            }
                        }).join(`<span style="color:var(--accent-orange);">${arrow}</span>`)}
                        </div>
                    </div>`;
                }
            };
            // For mixed, pick a random skill from patterns (including doubling/halving)
            let patternSkill = mappedSkill;
            if (mappedSkill === "mixed") {
                patternSkill = pick(["seq_2", "seq_5", "seq_10", "seq_100", "count_by_fill", "plus_minus_10", "plus_minus_100", "random_step", "identify_rule", "next_three", "function_table", "double", "halve"]);
            } else if (mappedSkill === "mixed_double_halve") {
                patternSkill = pick(["double", "halve"]);
            }

            if (patternSkill === "seq_2") patternQ(2);
            else if (patternSkill === "seq_5") patternQ(5);
            else if (patternSkill === "seq_10") patternQ(10);
            else if (patternSkill === "seq_100") patternQ(100);
            else if (patternSkill === "count_by_fill") {
                // Count-By Fill-In (1-12): Partially filled skip counting sequences
                const countBy = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                const sequenceLength = 12;
                const allNumbers = Array.from({length: sequenceLength}, (_, i) => countBy * (i + 1));
                
                // Determine how many to show (4-6 shown, rest hidden)
                const showCount = pick([4, 5, 6]);
                const showIndices = new Set();
                
                // Always show first one or two for context
                showIndices.add(0);
                if (Math.random() > 0.3) showIndices.add(1);
                
                // Add more random shown indices
                while (showIndices.size < showCount) {
                    showIndices.add(Math.floor(Math.random() * sequenceLength));
                }
                
                const sequence = allNumbers.map((val, i) => ({
                    value: val,
                    shown: showIndices.has(i),
                    position: i + 1
                }));
                
                const missingValues = sequence.filter(s => !s.shown).map(s => s.value);
                
                q.text = `Complete the count-by-${countBy}s sequence`;
                q.ans = missingValues.join(", ");
                q.answerType = "text";
                q.hint = `Skip count by ${countBy}: ${countBy}, ${countBy*2}, ${countBy*3}...`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">🔢 Count by ${countBy}s</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Fill in the missing numbers in the sequence</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px auto;max-width:500px;">
                        ${sequence.map(s => s.shown 
                            ? `<span style="padding:12px 16px;background:var(--accent-cyan);color:white;border-radius:8px;font-weight:700;font-size:1.1rem;min-width:45px;">${s.value}</span>`
                            : `<span style="padding:12px 16px;border:2px dashed var(--accent-orange);border-radius:8px;font-weight:600;min-width:45px;color:var(--accent-orange);">?</span>`
                        ).join('')}
                    </div>
                    <div style="margin-top:15px;font-size:0.85rem;color:var(--text-dim);">
                        Pattern: +${countBy} each time
                    </div>
                </div>`;
                
                q.patternData = { countBy, sequence, missingValues, type: 'count_by_fill' };
                q.printFormat = "pattern-count-by-fill";
            }
            else if (patternSkill === "identify_rule") {
                // Dedicated "Identify the Rule" skill - always asks for rule identification
                const stepOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const absStep = pick(stepOptions);
                const isAdd = Math.random() > 0.4; // 60% add, 40% subtract
                const step = isAdd ? absStep : -absStep;

                // For subtraction, start higher to avoid negative numbers
                const ruleStart = isAdd ? rng(1, Math.min(range, 50)) : rng(absStep * 4, range);
                const seq = [ruleStart, ruleStart + step, ruleStart + step * 2, ruleStart + step * 3];

                const ruleText = isAdd ? `Add ${absStep}` : `Subtract ${absStep}`;

                q.text = `What is the rule? ${seq.map(n => n.toLocaleString()).join(", ")}`;
                q.answerType = "text";
                q.ans = ruleText;
                q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                // Generate wrong answers
                const wrongRules = [];
                // Wrong operation
                wrongRules.push(isAdd ? `Subtract ${absStep}` : `Add ${absStep}`);
                // Wrong step amounts
                wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 1}`);
                if (absStep > 1) {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep - 1}`);
                } else {
                    wrongRules.push(`${isAdd ? 'Add' : 'Subtract'} ${absStep + 2}`);
                }

                q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">🔍 Find the Rule</div>
                    <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;font-weight:700;">
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[0].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[1].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[2].toLocaleString()}</span>
                        <span style="background:var(--accent-orange);color:white;padding:6px 10px;border-radius:8px;font-size:0.85rem;">?</span>
                        <span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${seq[3].toLocaleString()}</span>
                    </div>
                    <div style="margin-top:15px;font-size:0.95rem;color:var(--text-secondary);">Is the pattern <strong style="color:var(--accent-green);">Add</strong> or <strong style="color:var(--accent-pink);">Subtract</strong>? By how much?</div>
                </div>`;
            } else if (patternSkill === "plus_minus_10") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 10: ${start.toLocaleString()} → ?`;
                q.ans = start + (plus ? 10 : -10);
                q.hint = `Jump ${plus ? "forward" : "back"} 10 on the number line.`;
                const minVal = Math.min(start, q.ans) - 5;
                const maxVal = Math.max(start, q.ans) + 5;
                q.visual = `<div style="text-align:center;"><div style="font-weight:700;margin-bottom:30px;">${plus ? "Jump forward" : "Jump back"} 10</div>${createNumberLine(Math.max(0, minVal), maxVal, start, q.ans)}</div>`;
            } else if (patternSkill === "plus_minus_100") {
                const plus = Math.random() > 0.5;
                q.text = `${plus ? "Add" : "Subtract"} 100: ${start.toLocaleString()} → ?`;
                q.ans = start + (plus ? 100 : -100);
                q.hint = `Jump ${plus ? "forward" : "back"} 100. The hundreds digit changes!`;
                q.visual = `<div style="font-weight:700;font-size:1.3rem;">${start.toLocaleString()} <span style="color:var(--accent-orange);">${plus ? "+" : "−"} 100</span> = <span style="color:var(--accent-green);">?</span></div>`;
            } else if (patternSkill === "next_three") {
                // Next 3 Numbers - give pattern, ask for next 3 OR identify the rule
                const baseStep = pick([2, 3, 4, 5, 10, 11, 12, 25, 50]);
                const isSubtract = Math.random() < 0.4; // 40% chance of subtraction pattern
                const step = isSubtract ? -baseStep : baseStep;

                // For subtraction, start higher to avoid negative numbers
                const minStart = isSubtract ? baseStep * 6 : 1;
                const maxStart = Math.min(range, isSubtract ? range : 100);
                const patternStart = rng(minStart, maxStart);

                const showSeq = [patternStart, patternStart + step, patternStart + step * 2];
                const nextThree = [patternStart + step * 3, patternStart + step * 4, patternStart + step * 5];

                // Only ask for rule identification when in mixed mode (40% chance)
                const askForRule = mappedSkill === "mixed" && Math.random() < 0.4;

                if (askForRule) {
                    // Rule identification variant
                    const absStep = Math.abs(step);
                    const ruleText = step > 0 ? `Add ${absStep.toLocaleString()}` : `Subtract ${absStep.toLocaleString()}`;

                    q.text = `What is the rule? ${showSeq.map(n => n.toLocaleString()).join(", ")}`;
                    q.answerType = "text";
                    q.ans = ruleText;
                    q.hint = `Look at how each number changes. Is it getting bigger (add) or smaller (subtract)? By how much?`;

                    // Generate wrong answers
                    const wrongRules = [];
                    wrongRules.push(step > 0 ? `Subtract ${absStep.toLocaleString()}` : `Add ${absStep.toLocaleString()}`);
                    wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 1).toLocaleString()}`);
                    if (absStep > 1) {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep - 1).toLocaleString()}`);
                    } else {
                        wrongRules.push(`${step > 0 ? 'Add' : 'Subtract'} ${(absStep + 2).toLocaleString()}`);
                    }

                    q.options = shuffle([q.ans, ...wrongRules.slice(0, 3)]);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">🔍 Find the Rule</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${n.toLocaleString()}</span>`).join('<span style="background:var(--accent-orange);color:white;padding:6px 12px;border-radius:8px;font-size:0.9rem;">?</span>')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-secondary);">Is the pattern <strong>Add</strong> or <strong>Subtract</strong>? By how much?</div>
                    </div>`;
                } else {
                    // Original: ask for next 3 numbers
                    q.text = `What are the next 3 numbers? ${showSeq.map(n => n.toLocaleString()).join(", ")}, ___, ___, ___`;
                    q.answerType = "text";
                    q.ans = nextThree.map(n => n.toLocaleString()).join(", ");
                    q.hint = `Find the pattern: each number ${step > 0 ? 'increases' : 'decreases'} by ${Math.abs(step)}. ${step > 0 ? 'Add' : 'Subtract'} ${Math.abs(step)} three more times!`;

                    // Wrong answers with different patterns
                    const wrongs = new Set();
                    let patternAttempts = 0;
                    while (wrongs.size < 3 && patternAttempts < 30) {
                        patternAttempts++;
                        const wrongStep = step + pick([-2, -1, 1, 2, 3]);
                        if (wrongStep !== step && wrongStep !== 0) {
                            const wrongAns = [patternStart + wrongStep * 3, patternStart + wrongStep * 4, patternStart + wrongStep * 5];
                            if (wrongAns.every(n => n >= 0)) { // Avoid negative numbers
                                wrongs.add(wrongAns.map(n => n.toLocaleString()).join(", "));
                            }
                        }
                    }
                    q.options = shuffle([q.ans, ...wrongs]);

                    const arrow = step > 0 ? `+${Math.abs(step)}` : `−${Math.abs(step)}`;
                    const blankBox = `<span style="background:var(--bg-card-light);border:3px dashed var(--accent-green);color:var(--accent-green);padding:10px 16px;border-radius:10px;min-width:40px;text-align:center;">___</span>`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Find the pattern:</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-weight:700;">
                            ${showSeq.map(n => `<span style="background:var(--accent-cyan);color:white;padding:10px 16px;border-radius:10px;">${n.toLocaleString()}</span>`).join('<span style="color:var(--text-dim);">,</span>')}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                            <span style="color:var(--text-dim);">,</span>
                            ${blankBox}
                        </div>
                        <div style="margin-top:12px;font-size:0.9rem;color:var(--accent-orange);">${arrow} each time</div>
                    </div>`;
                }
            } else if (patternSkill === "function_table") {
                // Function Tables - vertical IN/OUT table with rule at bottom
                // Add/subtract amounts based on range: within 20, 25, 50, 100, 200
                let addSubRules = [];
                if (range <= 20) {
                    // Add/subtract within 1-10
                    for (let n = 2; n <= 10; n++) addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n });
                    for (let n = 2; n <= 5; n++) addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n });
                } else if (range <= 50) {
                    // Add/subtract within 1-20
                    for (let n = 2; n <= 20; n++) addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n });
                    for (let n = 2; n <= 15; n++) addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n });
                } else if (range <= 100) {
                    // Add/subtract within 1-50
                    const addAmounts = [5, 7, 9, 10, 11, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50];
                    const subAmounts = [5, 7, 10, 12, 15, 20, 25, 30];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                } else if (range <= 200) {
                    // Add/subtract within 1-100
                    const addAmounts = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100];
                    const subAmounts = [10, 15, 20, 25, 30, 40, 50];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                } else {
                    // Add/subtract within 1-200
                    const addAmounts = [25, 50, 75, 100, 125, 150, 175, 200];
                    const subAmounts = [25, 50, 75, 100, 150];
                    addAmounts.forEach(n => addSubRules.push({ name: `Add ${n}`, fn: x => x + n, sub: n }));
                    subAmounts.forEach(n => addSubRules.push({ name: `Subtract ${n}`, fn: x => x - n, sub: n }));
                }

                // Add multiply rules for smaller ranges
                const multiplyRules = [];
                if (range <= 100) {
                    multiplyRules.push({ name: "Multiply by 2", fn: x => x * 2 });
                    multiplyRules.push({ name: "Multiply by 3", fn: x => x * 3 });
                    multiplyRules.push({ name: "Multiply by 4", fn: x => x * 4 });
                    multiplyRules.push({ name: "Multiply by 5", fn: x => x * 5 });
                }

                const allRules = [...addSubRules, ...multiplyRules];
                const rule = pick(allRules);

                // Generate 5 random IN values based on range (larger numbers allowed)
                const inValues = [];
                const usedVals = new Set();
                const isSubtract = rule.name.includes("Subtract");
                const subAmount = rule.sub || 0;

                // Determine IN value range
                const minIn = isSubtract ? Math.max(subAmount + 5, 10) : 1;
                const maxIn = Math.min(range, isSubtract ? range : range * 0.8);

                while (inValues.length < 5) {
                    const val = rng(minIn, Math.max(minIn + 10, maxIn));
                    if (!usedVals.has(val)) {
                        usedVals.add(val);
                        inValues.push(val);
                    }
                }
                inValues.sort((a, b) => a - b);
                const outValues = inValues.map(x => rule.fn(x));

                // Number of missing OUT values based on difficulty
                // Easy: 1-2, Medium: 3, Hard: all 5
                const missingCount = state.difficulty === "hard" ? 5 : (state.difficulty === "medium" ? 3 : pick([1, 2]));

                // Pick which indices are missing
                const allIndices = [0, 1, 2, 3, 4];
                const missingIndices = shuffle(allIndices).slice(0, missingCount);

                // Answer is comma-separated list of missing OUT values (in table order)
                const missingAnswers = [];
                for (let i = 0; i < 5; i++) {
                    if (missingIndices.includes(i)) {
                        missingAnswers.push(outValues[i]);
                    }
                }

                if (missingCount === 1) {
                    q.ans = missingAnswers[0];
                    q.text = `Function Table: What is the OUT value for IN = ${inValues[missingIndices[0]]}?`;
                } else {
                    q.answerType = "text";
                    q.ans = missingAnswers.join(", ");
                    q.text = `Function Table: Fill in the missing OUT values (top to bottom, comma-separated)`;
                }
                q.hint = `Apply the rule "${rule.name}" to each IN value. Example: ${inValues[0]} → ${outValues[0]}`;

                // Store expected answers for validation
                q.functionTableAnswers = missingIndices.map(i => outValues[i]);
                q.functionTableMissingIndices = missingIndices.sort((a, b) => a - b);

                // Generate unique ID for this function table
                const funcTableId = Date.now() + Math.random().toString(36).substr(2, 9);

                // Build table rows with input fields for missing values
                const tableRows = inValues.map((inVal, i) => {
                    const isMissing = missingIndices.includes(i);
                    const outCell = isMissing
                        ? `<td style="padding:4px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">
                            <input type="text" class="func-table-input" data-func-table="${funcTableId}" data-row="${i}"
                                style="width:50px;height:32px;border:2px solid var(--accent-cyan);border-radius:6px;
                                text-align:center;font-size:1rem;font-weight:700;font-family:inherit;
                                background:var(--bg-card-light);color:var(--text-primary);"
                                placeholder="">
                           </td>`
                        : `<td style="padding:10px 25px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">${outValues[i]}</td>`;
                    return `<tr>
                        <td style="padding:10px 25px;border:2px solid var(--text-primary);text-align:center;min-width:60px;">${inVal}</td>
                        ${outCell}
                    </tr>`;
                }).join('');

                q.visual = `<!-- Function Table -->
                <div style="text-align:center;">
                    <table style="margin:0 auto;border-collapse:collapse;font-size:1.1rem;border:2px solid var(--text-primary);">
                        <tr>
                            <th style="padding:10px 25px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:800;min-width:60px;">IN</th>
                            <th style="padding:10px 25px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:800;min-width:60px;">OUT</th>
                        </tr>
                        ${tableRows}
                        <tr>
                            <td colspan="2" style="padding:10px 20px;border:2px solid var(--text-primary);background:var(--bg-card);font-weight:700;text-align:center;">
                                <span style="color:var(--text-secondary);">Rule:</span> <span style="color:var(--accent-purple);font-weight:800;">${rule.name}</span>
                            </td>
                        </tr>
                    </table>
                </div>`;

                // No multiple choice - answers go in the table inputs
                q.options = [];
            } else if (patternSkill === "double" || patternSkill === "halve") {
                // Doubling and Halving skills (moved from separate category)
                const maxForDouble = range;
                const maxForHalve = Math.floor(range / 2);

                // Bar graph for doubling
                const createDoubleBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Double = Add another equal bar</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-purple));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Original</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:20px;">→</div>
                            <div style="text-align:center;">
                                <div style="display:flex;flex-direction:column;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:60px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;border-bottom:2px dashed white;">${base.toLocaleString()}</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-green));width:60px;height:80px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Doubled = ?</div>
                            </div>
                        </div>
                    </div>`;
                };

                // Bar graph for halving
                const createHalveBarGraph = (base) => {
                    return `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;">Half = Split the bar into 2 equal parts</div>
                        <div style="display:flex;align-items:flex-end;justify-content:center;gap:30px;">
                            <div style="text-align:center;">
                                <div style="background:linear-gradient(180deg,var(--accent-purple),var(--accent-cyan));width:60px;height:160px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">${base.toLocaleString()}</div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Whole</div>
                            </div>
                            <div style="font-size:1.5rem;color:var(--accent-orange);margin-bottom:60px;">→</div>
                            <div style="text-align:center;">
                                <div style="display:flex;gap:8px;">
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                    <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:50px;height:80px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:0.9rem;">?</div>
                                </div>
                                <div style="font-size:0.8rem;margin-top:4px;color:var(--text-secondary);">Two halves</div>
                            </div>
                        </div>
                    </div>`;
                };

                if (patternSkill === "double") {
                    const base = rng(2, maxForDouble);
                    q.text = `Double ${base.toLocaleString()}`;
                    q.ans = base * 2;
                    q.hint = `Double means ×2. Think: ${base.toLocaleString()} + ${base.toLocaleString()} = ?`;
                    q.visual = createDoubleBarGraph(base);
                } else {
                    // If decimals are enabled, allow odd numbers (result will be .5)
                    const allowOdd = state.decimalPlaces > 0;
                    let base;
                    if (allowOdd) {
                        // Allow any number (odd or even)
                        base = rng(2, range);
                    } else {
                        // Only even numbers (no decimals)
                        const half = rng(1, maxForHalve);
                        base = half * 2;
                    }
                    const halfResult = base / 2;
                    q.text = `Half of ${base.toLocaleString()}`;
                    q.ans = allowOdd ? halfResult : Math.floor(halfResult);
                    q.hint = `Half means ÷2. Split ${base.toLocaleString()} into 2 equal parts.`;
                    q.visual = createHalveBarGraph(base);
                }
            } else {
                // random_step in mixed mode - allow rule identification questions
                const step = rng(1, 12) * (Math.random() > 0.5 ? 1 : -1);
                patternQ(step, mappedSkill === "mixed");
            }
            q.options = q.options.length ? q.options : buildNumericOptions(q.ans);
            break;
        }
        case "rounding": {
            // Visual Style 1: Number line with dot marker
            const createNumberLineVisual = (num, lowerBound, upperBound, place) => {
                const midpoint = lowerBound + place / 2;
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;">Where does ${num.toLocaleString()} fall?</div>
                    <div style="position:relative;max-width:400px;margin:0 auto;">
                        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;margin-bottom:5px;">
                            <span style="color:var(--accent-cyan);">${lowerBound.toLocaleString()}</span>
                            <span style="color:var(--text-dim);">${midpoint.toLocaleString()}</span>
                            <span style="color:var(--accent-cyan);">${upperBound.toLocaleString()}</span>
                        </div>
                        <div style="height:12px;background:linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 50%, var(--accent-cyan) 100%);border-radius:6px;position:relative;">
                            <div style="position:absolute;left:50%;top:-2px;bottom:-2px;width:3px;background:var(--text-dim);transform:translateX(-50%);"></div>
                            <div style="position:absolute;left:${((num - lowerBound) / place) * 100}%;top:-8px;transform:translateX(-50%);">
                                <div style="width:20px;height:20px;background:var(--accent-orange);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>
                        <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">← Round Down | Round Up →</div>
                    </div>
                </div>`;
            };

            // Visual Style 2: Bar graph comparison
            const createBarGraphVisual = (num, lowerBound, upperBound, place) => {
                const distToLower = num - lowerBound;
                const distToUpper = upperBound - num;
                const maxDist = Math.max(distToLower, distToUpper);
                const lowerHeight = Math.round((distToLower / maxDist) * 100);
                const upperHeight = Math.round((distToUpper / maxDist) * 100);
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;">Which is ${num.toLocaleString()} closer to?</div>
                    <div style="display:flex;align-items:flex-end;justify-content:center;gap:40px;height:140px;">
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <div style="background:var(--accent-cyan);color:var(--text-on-accent);padding:4px 10px;border-radius:8px;font-weight:800;font-size:0.9rem;margin-bottom:6px;">${distToLower}</div>
                            <div style="background:linear-gradient(180deg,var(--accent-cyan),var(--accent-purple));width:70px;height:${Math.max(20, 100 - lowerHeight)}px;border-radius:8px 8px 0 0;"></div>
                            <div style="font-weight:800;margin-top:6px;color:var(--accent-cyan);">${lowerBound.toLocaleString()}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);">away</div>
                        </div>
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <div style="background:var(--accent-green);color:var(--text-on-accent);padding:4px 10px;border-radius:8px;font-weight:800;font-size:0.9rem;margin-bottom:6px;">${distToUpper}</div>
                            <div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));width:70px;height:${Math.max(20, 100 - upperHeight)}px;border-radius:8px 8px 0 0;"></div>
                            <div style="font-weight:800;margin-top:6px;color:var(--accent-green);">${upperBound.toLocaleString()}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);">away</div>
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-secondary);">Shorter bar = Closer = Round to that number!</div>
                </div>`;
            };

            // Visual Style 3: Simple boxes with arrow
            const createBoxVisual = (num, lowerBound, upperBound, checkDigit) => {
                return `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;">Look at the ${checkDigit} digit</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:15px;flex-wrap:wrap;">
                        <div style="background:var(--accent-cyan);padding:15px 20px;border-radius:12px;color:white;font-weight:800;">${lowerBound.toLocaleString()}</div>
                        <div style="font-size:1.2rem;color:var(--text-dim);">←</div>
                        <div style="background:var(--accent-orange);padding:18px 22px;border-radius:12px;color:white;font-weight:900;font-size:1.2rem;box-shadow:0 4px 15px rgba(255,159,28,0.4);">${num.toLocaleString()}</div>
                        <div style="font-size:1.2rem;color:var(--text-dim);">→</div>
                        <div style="background:var(--accent-green);padding:15px 20px;border-radius:12px;color:white;font-weight:800;">${upperBound.toLocaleString()}</div>
                    </div>
                    <div style="margin-top:12px;font-size:0.95rem;color:var(--text-secondary);">If ${checkDigit} digit is 0-4: round down ← | If 5-9: round up →</div>
                </div>`;
            };

            // Pick random visual style
            const pickRoundingVisual = (num, lowerBound, upperBound, place, checkDigit) => {
                const style = Math.floor(Math.random() * 3);
                if (style === 0) return createNumberLineVisual(num, lowerBound, upperBound, place);
                if (style === 1) return createBarGraphVisual(num, lowerBound, upperBound, place);
                return createBoxVisual(num, lowerBound, upperBound, checkDigit);
            };

            const makeWhole = (place) => {
                const max = Math.max(place * 2, range);
                const num = rng(place, max);
                q.text = `Round ${num.toLocaleString()} to the nearest ${place.toLocaleString()}`;
                q.ans = Math.round(num / place) * place;
                const lowerBound = Math.floor(num / place) * place;
                const upperBound = lowerBound + place;
                const checkDigit = place === 10 ? "ones" : place === 100 ? "tens" : place === 1000 ? "hundreds" : "digit";
                q.hint = `Look at the ${checkDigit} digit. Is ${num} closer to ${lowerBound.toLocaleString()} or ${upperBound.toLocaleString()}? If ${checkDigit} is 5 or more, round up!`;
                q.visual = pickRoundingVisual(num, lowerBound, upperBound, place, checkDigit);
                q.options = buildNumericOptions(q.ans);
            };
            // For mixed, pick a random rounding skill; mixed_whole only uses whole number rounding
            const roundingSkill = mappedSkill === "mixed" ? pick(["nearest_10", "nearest_100", "nearest_1000", "nearest_tenth", "nearest_hundredth", "nearest_thousandth"])
                : mappedSkill === "mixed_whole" ? pick(["nearest_10", "nearest_100", "nearest_1000"])
                : mappedSkill;

            if (roundingSkill === "nearest_10") makeWhole(10);
            else if (roundingSkill === "nearest_100") makeWhole(100);
            else if (roundingSkill === "nearest_1000") makeWhole(1000);
            else {
                const decimals = { nearest_tenth: 1, nearest_hundredth: 2, nearest_thousandth: 3 };
                const places = decimals[roundingSkill] || 1;
                const num = +(Math.random() * range).toFixed(places + 1);
                const factor = Math.pow(10, places);
                const placeName = ["tenth","hundredth","thousandth"][places-1];
                q.text = `Round ${num} to the nearest ${placeName}`;
                q.ans = Math.round(num * factor) / factor;
                q.hint = `Look at the digit after the ${placeName} place. If it's 5 or more, round up!`;
                q.visual = `<div style="font-weight:700;font-size:1.2rem;text-align:center;">
                    <span style="color:var(--text-bright);">${num}</span><br>
                    <span style="font-size:0.9rem;color:var(--text-dim);">Check the digit after the ${placeName} place</span>
                </div>`;
                q.options = buildNumericOptions(q.ans);
            }
            break;
        }
        case "placevalue": {
            // For mixed, pick random skill from all place value skills
            const placeSkill = mappedSkill === "mixed" ? pick(["value", "identify", "compare", "expand", "combine", "order_asc", "order_desc"]) : mappedSkill;

            if (placeSkill === "compare") {
                // 🟡 Level 2: Compare Numbers (>, <, =)
                const numDigits = rng(3, 5);
                const base = rng(Math.pow(10, numDigits - 1), Math.pow(10, numDigits) - 100);
                
                const diffType = pick(["different", "same", "close"]);
                let num1, num2;
                
                if (diffType === "same") {
                    num1 = base;
                    num2 = base;
                } else if (diffType === "close") {
                    num1 = base;
                    num2 = base + rng(1, 9);
                } else {
                    num1 = base;
                    num2 = base + rng(10, 500) * (Math.random() < 0.5 ? 1 : -1);
                    if (num2 < Math.pow(10, numDigits - 1)) num2 = base + rng(10, 500);
                }
                
                if (Math.random() < 0.5 && num1 !== num2) {
                    [num1, num2] = [num2, num1];
                }
                
                q.text = `Compare: ${num1.toLocaleString()} ___ ${num2.toLocaleString()}`;
                q.ans = num1 > num2 ? ">" : num1 < num2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Compare digit by digit from left to right. Which number is greater?`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-cyan);">${num1.toLocaleString()}</div>
                        <div style="font-size:2rem;color:var(--accent-orange);">?</div>
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-purple);">${num2.toLocaleString()}</div>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Is it >, <, or = ?</div>
                </div>`;
            } else if (placeSkill === "value" || placeSkill === "identify") {
                // Original place value skills
                const numDigits = rng(3,6);
                const max = Math.pow(10, numDigits) - 1;
                const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

                // Generate a number with unique digits to avoid ambiguity
                let num, numStr, idx, digit, placeIndex;
                let attempts = 0;
                const maxAttempts = 50;

                do {
                    num = rng(Math.pow(10, numDigits - 1), max);
                    numStr = num.toString();
                    idx = randInt(0, numStr.length - 1);
                    digit = parseInt(numStr[idx], 10);
                    placeIndex = numStr.length - 1 - idx;
                    attempts++;

                    // Check if this digit appears only once in the number
                    const digitCount = numStr.split('').filter(d => d === digit.toString()).length;
                    if (digitCount === 1) break; // Found a unique digit position

                } while (attempts < maxAttempts);

                // If we couldn't find unique digit, reference by place name instead
                const digitCount = numStr.split('').filter(d => d === digit.toString()).length;
                const usePositionReference = digitCount > 1;

                const highlightedNum = numStr.split("").map((d, i) => {
                    if (i === idx) return `<span style="background:var(--accent-orange);color:white;padding:4px 8px;border-radius:6px;font-weight:900;">${d}</span>`;
                    return `<span style="padding:4px 8px;">${d}</span>`;
                }).join("");

                if (placeSkill === "value") {
                    // Reference by place if digit appears multiple times
                    if (usePositionReference) {
                        q.text = `What is the value of the digit in the ${placeNames[placeIndex]} place in ${num.toLocaleString()}?`;
                    } else {
                        q.text = `What is the value of ${digit} in ${num.toLocaleString()}?`;
                    }
                    q.ans = digit * Math.pow(10, placeIndex);
                    q.options = buildNumericOptions(q.ans);
                    q.hint = `The ${digit} is in the ${placeNames[placeIndex]} place. Multiply: ${digit} × ${"1".padEnd(placeIndex+1,"0")} = ?`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-size:2rem;font-weight:700;margin-bottom:10px;letter-spacing:2px;">${highlightedNum}</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">The highlighted digit ${digit} is in the <span style="color:var(--accent-orange);font-weight:700;">${placeNames[placeIndex]}</span> place</div>
                        <div style="margin-top:10px;font-weight:700;">${digit} × ${"1".padEnd(placeIndex+1,"0")} = ?</div>
                    </div>`;
                } else {
                    // For identify, always reference by place since we're asking about the place
                    if (usePositionReference) {
                        q.text = `Look at the highlighted digit in ${num.toLocaleString()}. Which place is it in?`;
                    } else {
                        q.text = `Which place is the digit ${digit} in ${num.toLocaleString()}?`;
                    }
                    q.answerType = "text";
                    q.ans = placeNames[placeIndex];
                    q.options = shuffle([placeNames[placeIndex], ...shuffle(placeNames.filter(p=>p!==placeNames[placeIndex])).slice(0,3)]);
                    q.hint = `Count positions from the right: ones (1st), tens (2nd), hundreds (3rd), thousands (4th)...`;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-size:2rem;font-weight:700;margin-bottom:10px;letter-spacing:2px;">${highlightedNum}</div>
                        <div style="display:flex;justify-content:center;gap:4px;font-size:0.7rem;color:var(--text-dim);flex-wrap:wrap;">
                            ${numStr.split("").reverse().map((d, i) => `<span style="padding:2px 6px;${numStr.length - 1 - idx === i ? 'background:var(--accent-orange);color:white;border-radius:4px;' : ''}">${placeNames[i]}</span>`).reverse().join("")}
                        </div>
                    </div>`;
                }
            } else if (placeSkill === "expand" || placeSkill === "combine") {
                // Partitioning skills
                const minNum = Math.max(10, Math.floor(range / 10));
                const num = rng(minNum, Math.min(range, 999999));
                const digits = num.toString().split("").map(Number);
                const expanded = digits.map((d,i)=>(d*Math.pow(10,digits.length-i-1)).toLocaleString()).join(" + ");
                const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

                if (placeSkill === "expand") {
                    // Randomly choose between input boxes and multiple choice
                    const expandMode = pick(["input", "choice"]);

                    if (expandMode === "input") {
                        // Interactive expanded form with input boxes
                        q.text = `Write the expanded form of ${num.toLocaleString()}:`;
                        q.answerType = "interactive";
                        q.interactiveType = "expanded";
                        q.expandedNumber = num;
                        q.expandedDigits = digits;
                        q.expandedValues = digits.map((d, i) => d * Math.pow(10, digits.length - i - 1));
                        q.ans = q.expandedValues.join(",");
                        q.options = [];
                        q.hint = `Break apart each digit by its place value. ${digits[0]} is in the ${placeNames[digits.length-1]} place...`;
                        q.visual = "";
                    } else {
                        // Multiple choice mode
                        q.text = `Which option shows the expanded form of ${num.toLocaleString()}?`;
                        q.answerType = "text";
                        q.ans = expanded;
                        const wrongs = new Set();
                        let attempts = 0;
                        while (wrongs.size < 3 && attempts < 50) {
                            attempts++;
                            const wrongExp = shuffle([...digits]).map((d,i)=>(d*Math.pow(10,digits.length-i-1)).toLocaleString()).join(" + ");
                            if (wrongExp !== expanded) wrongs.add(wrongExp);
                        }
                        while (wrongs.size < 3) {
                            wrongs.add((num + wrongs.size + 1).toString().split("").map((d,i,a)=>(parseInt(d)*Math.pow(10,a.length-i-1)).toLocaleString()).join(" + "));
                        }
                        q.options = shuffle([q.ans, ...wrongs]);
                        q.hint = `Break apart each digit by its place value. ${digits[0]} is in the ${placeNames[digits.length-1]} place...`;
                        q.visual = `<div style="text-align:center;">
                            <div style="font-size:2rem;font-weight:900;margin-bottom:15px;">${num.toLocaleString()}</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);">What is each digit worth in its place?</div>
                        </div>`;
                    }
                } else {
                    q.text = `What number equals ${expanded}?`;
                    q.ans = num;
                    q.options = buildNumericOptions(num);
                    q.hint = `Add all the parts together: ${expanded} = ?`;
                    q.visual = `<div style="text-align:center;">
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${digits.map((d, i) => {
                                const value = d * Math.pow(10, digits.length - i - 1);
                                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)'];
                                return `<div style="background:${colors[digits.length - i - 1] || colors[0]};color:white;padding:8px 14px;border-radius:10px;font-weight:700;">${value.toLocaleString()}</div>`;
                            }).join('<span style="font-size:1.5rem;color:var(--text-dim);">+</span>')}
                        </div>
                        <div style="margin-top:10px;font-weight:700;font-size:1.2rem;color:var(--accent-green);">= ?</div>
                    </div>`;
                }
            } else {
                // Ordering skills (order_asc or order_desc)
                // Ensure unique numbers to avoid confusion
                const arrSet = new Set();
                while (arrSet.size < 4) {
                    arrSet.add(rng(1, range));
                }
                const arr = Array.from(arrSet);
                const sortedAsc = [...arr].sort((a,b)=>a-b);
                const sortedDesc = [...arr].sort((a,b)=>b-a);
                const isAsc = placeSkill === "order_asc";
                const asc = sortedAsc.map(n => n.toLocaleString()).join(" → ");
                const desc = sortedDesc.map(n => n.toLocaleString()).join(" → ");

                const ascPhrases = [
                    { text: "smallest to largest", icon: "🔼 Smallest → Largest", hint: "smallest" },
                    { text: "least to greatest", icon: "🔼 Least → Greatest", hint: "least" },
                    { text: "increasing order", icon: "📈 Increasing Order", hint: "smallest" }
                ];
                const descPhrases = [
                    { text: "largest to smallest", icon: "🔽 Largest → Smallest", hint: "largest" },
                    { text: "greatest to least", icon: "🔽 Greatest → Least", hint: "greatest" },
                    { text: "decreasing order", icon: "📉 Decreasing Order", hint: "largest" }
                ];
                const phrase = isAsc ? pick(ascPhrases) : pick(descPhrases);
                const sortedArr = isAsc ? sortedAsc : sortedDesc;

                // Randomly choose between 3 modes: input boxes, click-to-order, or multiple choice
                const orderMode = pick(["input", "click", "choice"]);

                if (orderMode === "input") {
                    // Input boxes mode - students type each number
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "input";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Write the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then write it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else if (orderMode === "click") {
                    // Click-to-order mode - students click numbers in sequence
                    q.answerType = "interactive";
                    q.interactiveType = "ordering";
                    q.orderMode = "click";
                    q.orderDirection = isAsc ? "asc" : "desc";
                    q.orderIcon = phrase.icon;
                    q.numbers = arr;
                    q.sortedNumbers = sortedArr;
                    q.text = `Click the numbers in order from ${phrase.text}:`;
                    q.ans = sortedArr.join(",");
                    q.hint = `Find the ${phrase.hint} number first, then click it. Then find the next ${phrase.hint}, and so on.`;
                    q.options = [];
                    q.visual = "";
                } else {
                    // Multiple choice mode - pick the correct order
                    q.answerType = "text";
                    q.text = `Which list is in order from ${phrase.text}?`;
                    q.ans = isAsc ? asc : desc;
                    q.hint = `Find the ${phrase.hint} number first, then the next ${phrase.hint}, and so on.`;
                    const wrongs = new Set();
                    let orderAttempts = 0;
                    while (wrongs.size < 3 && orderAttempts < 50) {
                        orderAttempts++;
                        const wrongOrder = shuffle([...arr]).map(n => n.toLocaleString()).join(" → ");
                        if (wrongOrder !== q.ans) wrongs.add(wrongOrder);
                    }
                    q.options = shuffle([q.ans, ...wrongs]);
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;">Compare these numbers:</div>
                        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                            ${arr.map(n => `<div style="background:var(--accent-cyan);color:white;padding:12px 18px;border-radius:12px;font-weight:800;font-size:1.1rem;">${n.toLocaleString()}</div>`).join("")}
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">${phrase.icon}</div>
                    </div>`;
                }
            }
            break;
        }
        case "fractions": {
            // Use only denominators that give standard/clean decimal equivalents
            const standardFractions = [
                {n: 1, d: 2}, {n: 1, d: 3}, {n: 2, d: 3},
                {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4},
                {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                {n: 1, d: 6}, {n: 5, d: 6},
                {n: 1, d: 8}, {n: 3, d: 8}, {n: 5, d: 8}, {n: 7, d: 8}
            ];
            const frac = pick(standardFractions);
            const numerator = frac.n;
            const denominator = frac.d;

            // For mixed, pick random fraction skill with weighted distribution
            let fracSkill = mappedSkill;
            if (fracSkill === "mixed") {
                fracSkill = pick(["identify", "equivalent", "compare", "simplify", "of_number", "improper_mixed", "add", "sub", "add_unlike", "sub_unlike"]);
            }
            
            if (fracSkill === "identify") {
                // 🟢 Level 1: Identify fractions from visual
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(1, den - 1);
                q.text = `What fraction is shaded?`;
                q.ans = simplifyFraction(num, den);
                q.answerType = "text";
                const wrongs = new Set();
                wrongs.add(`${den - num}/${den}`);
                wrongs.add(`${num}/${den + 1}`);
                wrongs.add(`${Math.min(num + 1, den)}/${den}`);
                q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                q.hint = `Count the shaded parts (numerator) and total parts (denominator).`;
                
                // Use SVG circle visual
                q.visual = `<div style="text-align:center;">
                    <div style="margin-bottom:20px;">
                        ${fracCircleSVG(num, den, 120, 'var(--accent-cyan)', 'var(--bg-card-light)')}
                    </div>
                    <div style="display:flex;justify-content:center;margin-bottom:10px;">
                        ${fracBarHTML(num, den, 'var(--accent-cyan)')}
                    </div>
                    <div style="font-size:0.95rem;color:var(--text-dim);font-weight:500;">
                        <span style="color:var(--accent-cyan);font-weight:700;">${num}</span> shaded out of <span style="font-weight:700;">${den}</span> total parts
                    </div>
                </div>`;
            } else if (fracSkill === "equivalent") {
                // 🟢 Level 1: Equivalent fractions
                const simpleDen = pick([2, 3, 4, 5]);
                const simpleNum = rng(1, simpleDen - 1);
                const multiplier = rng(2, 4);
                const expandedNum = simpleNum * multiplier;
                const expandedDen = simpleDen * multiplier;
                
                if (Math.random() < 0.5) {
                    q.text = `Find the missing number:`;
                    q.ans = expandedNum;
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            ${fracHTML(simpleNum, simpleDen, '2xl')}
                            <span class="frac-equals">=</span>
                            <span class="frac frac-2xl">
                                <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                                <span class="den">${expandedDen}</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;">
                            ${fracCircleSVG(simpleNum, simpleDen, 80, 'var(--accent-cyan)')}
                            <span style="font-size:2rem;color:var(--accent-green);">=</span>
                            ${fracCircleSVG(expandedNum, expandedDen, 80, 'var(--accent-purple)')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                            Multiply top and bottom by <strong>${multiplier}</strong>
                        </div>
                    </div>`;
                } else {
                    q.text = `Find the missing number:`;
                    q.ans = expandedDen;
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            ${fracHTML(simpleNum, simpleDen, '2xl')}
                            <span class="frac-equals">=</span>
                            <span class="frac frac-2xl">
                                <span class="num">${expandedNum}</span>
                                <span class="den" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:25px;">
                            ${fracCircleSVG(simpleNum, simpleDen, 80, 'var(--accent-cyan)')}
                            <span style="font-size:2rem;color:var(--accent-green);">=</span>
                            ${fracCircleSVG(expandedNum, expandedDen, 80, 'var(--accent-purple)')}
                        </div>
                        <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                            Multiply top and bottom by <strong>${multiplier}</strong>
                        </div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
                q.hint = `Multiply both numerator and denominator by the same number to get equivalent fractions.`;
            } else if (fracSkill === "compare") {
                // 🟡 Level 2: Compare fractions
                const denoms = [2, 3, 4, 5, 6, 8];
                const d1 = pick(denoms);
                const d2 = pick(denoms);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const val1 = n1 / d1;
                const val2 = n2 / d2;
                
                q.text = `Which fraction is larger?`;
                q.ans = val1 > val2 ? ">" : val1 < val2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Convert to same denominator, or compare how close each is to 1.`;
                
                q.visual = `<div style="text-align:center;">
                    <div class="frac-compare-visual">
                        <div class="frac-compare-box" style="background:rgba(0,188,212,0.1);border:2px solid var(--accent-cyan);border-radius:16px;">
                            ${fracCircleSVG(n1, d1, 100, '#00bcd4')}
                            <div style="margin-top:10px;">
                                ${fracHTML(n1, d1, 'xl')}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                            <span class="compare-symbol" style="font-size:3.5rem;">?</span>
                            <div style="display:flex;gap:10px;">
                                <span style="padding:8px 16px;background:var(--bg-card);border-radius:8px;font-weight:700;font-size:1.3rem;cursor:pointer;">&gt;</span>
                                <span style="padding:8px 16px;background:var(--bg-card);border-radius:8px;font-weight:700;font-size:1.3rem;cursor:pointer;">&lt;</span>
                                <span style="padding:8px 16px;background:var(--bg-card);border-radius:8px;font-weight:700;font-size:1.3rem;cursor:pointer;">=</span>
                            </div>
                        </div>
                        <div class="frac-compare-box" style="background:rgba(156,39,176,0.1);border:2px solid var(--accent-purple);border-radius:16px;">
                            ${fracCircleSVG(n2, d2, 100, '#9c27b0')}
                            <div style="margin-top:10px;">
                                <span class="frac frac-xl" style="color:var(--accent-purple);">
                                    <span class="num">${n2}</span>
                                    <span class="den">${d2}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>`;
            } else if (fracSkill === "of_number") {
                // 🟡 Level 2: Fraction of a number
                const maxMultiple = Math.floor(Math.min(range, 100) / denominator);
                const multiple = rng(1, Math.max(1, maxMultiple));
                const whole = multiple * denominator;
                q.text = `What is ${numerator}/${denominator} of ${whole}?`;
                q.ans = (numerator * whole) / denominator;
                q.options = buildNumericOptions(q.ans);
                q.hint = `Step 1: ${whole} ÷ ${denominator} = ${whole/denominator}. Step 2: ${whole/denominator} × ${numerator} = ?`;
                
                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:20px;">
                        ${fracHTML(numerator, denominator, '2xl')}
                        <span style="font-size:1.8rem;margin:0 10px;">of</span>
                        <span style="font-size:2.5rem;font-weight:800;color:var(--accent-purple);">${whole}</span>
                        <span class="frac-equals">=</span>
                        <span style="min-width:60px;font-size:2.5rem;color:var(--accent-green);font-weight:800;">?</span>
                    </div>
                    <div style="margin-bottom:15px;">
                        ${fracCircleSVG(numerator, denominator, 100, 'var(--accent-cyan)')}
                    </div>
                    <div style="font-size:0.95rem;color:var(--text-dim);">
                        Find <strong style="color:var(--accent-cyan);">${numerator}</strong> out of <strong>${denominator}</strong> equal parts of <strong style="color:var(--accent-purple);">${whole}</strong>
                    </div>
                </div>`;
            } else if (fracSkill === "simplify") {
                // 🟡 Level 2: Simplify fractions
                const multiplier = randInt(2,4);
                const rawNum = numerator * multiplier;
                const rawDen = denominator * multiplier;
                q.text = `Simplify this fraction:`;
                q.answerType = "text";
                q.ans = simplifyFraction(rawNum, rawDen);
                const wrongs = new Set();
                let simpAttempts = 0;
                while (wrongs.size < 3 && simpAttempts < 30) {
                    simpAttempts++;
                    const wrongSimp = simplifyFraction(rawNum + randInt(-3,3), rawDen);
                    if (wrongSimp !== q.ans) wrongs.add(wrongSimp);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Find a number that divides both ${rawNum} and ${rawDen} evenly. Try dividing by ${multiplier}!`;
                
                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:20px;">
                        <span class="frac frac-2xl" style="color:var(--accent-orange);">
                            <span class="num">${rawNum}</span>
                            <span class="den">${rawDen}</span>
                        </span>
                        <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">→</span>
                        <span class="frac frac-2xl">
                            <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 16px;border:2px dashed var(--accent-green);">?</span>
                            <span class="den" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 16px;border:2px dashed var(--accent-green);">?</span>
                        </span>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        ${fracCircleSVG(rawNum, rawDen, 80, '#ff9800')}
                        <span style="font-size:1.5rem;color:var(--accent-green);">=</span>
                        ${fracCircleSVG(numerator, denominator, 80, '#4caf50')}
                    </div>
                    <div style="background:rgba(255,255,255,0.1);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <span style="font-size:0.95rem;color:var(--text-dim);">
                            Divide both by <strong style="color:var(--accent-cyan);">${multiplier}</strong>: 
                            <span style="color:var(--accent-orange);">${rawNum}</span> ÷ ${multiplier} = <strong>${numerator}</strong>, 
                            <span style="color:var(--accent-orange);">${rawDen}</span> ÷ ${multiplier} = <strong>${denominator}</strong>
                        </span>
                    </div>
                </div>`;
            } else if (fracSkill === "improper_mixed") {
                // 🟡 Level 2: Convert between improper fractions and mixed numbers
                const den = pick([2, 3, 4, 5, 6, 8]);
                const wholes = rng(1, 4); // 1-4 whole parts
                const extraNum = rng(1, den - 1); // Additional fraction part
                const totalNum = wholes * den + extraNum; // Total numerator for improper fraction
                
                // Randomly choose: show improper and ask for mixed, OR show mixed and ask for improper
                const mode = pick(["improper_to_mixed", "mixed_to_improper", "visual_to_both"]);
                
                if (mode === "improper_to_mixed") {
                    q.text = `Convert to a mixed number:`;
                    q.ans = `${wholes} ${extraNum}/${den}`;
                    q.answerType = "text";
                    const wrongs = new Set();
                    wrongs.add(`${wholes + 1} ${extraNum}/${den}`);
                    wrongs.add(`${wholes - 1 > 0 ? wholes - 1 : wholes + 2} ${extraNum}/${den}`);
                    wrongs.add(`${wholes} ${extraNum + 1 > den - 1 ? 1 : extraNum + 1}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Divide ${totalNum} by ${den}. The quotient is the whole number, the remainder is the numerator.`;
                    
                    // Create visual with multiple circles
                    const circlesHTML = Array.from({length: wholes}, () => 
                        fracCircleSVG(den, den, 60, 'var(--accent-cyan)')
                    ).join('') + fracCircleSVG(extraNum, den, 60, 'var(--accent-cyan)');
                    
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            <span class="frac frac-2xl" style="color:var(--accent-orange);">
                                <span class="num">${totalNum}</span>
                                <span class="den">${den}</span>
                            </span>
                            <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">=</span>
                            <span style="font-size:2rem;color:var(--accent-green);font-weight:700;">? <sup>?</sup>⁄<sub>?</sub></span>
                        </div>
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                            ${circlesHTML}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            ${totalNum} ÷ ${den} = ${wholes} remainder ${extraNum}
                        </div>
                    </div>`;
                } else if (mode === "mixed_to_improper") {
                    q.text = `Convert to an improper fraction:`;
                    q.ans = `${totalNum}/${den}`;
                    q.answerType = "text";
                    const wrongs = new Set();
                    wrongs.add(`${totalNum + den}/${den}`);
                    wrongs.add(`${totalNum - den > 0 ? totalNum - den : totalNum + 2}/${den}`);
                    wrongs.add(`${wholes + extraNum}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Multiply ${wholes} × ${den} = ${wholes * den}, then add ${extraNum} to get the numerator.`;
                    
                    const circlesHTML = Array.from({length: wholes}, () => 
                        fracCircleSVG(den, den, 60, 'var(--accent-purple)')
                    ).join('') + fracCircleSVG(extraNum, den, 60, 'var(--accent-purple)');
                    
                    q.visual = `<div style="text-align:center;">
                        <div class="frac-equation" style="margin-bottom:20px;">
                            <span style="font-size:2.2rem;font-weight:700;color:var(--accent-purple);">
                                ${wholes}<span class="frac frac-xl" style="margin-left:8px;">
                                    <span class="num">${extraNum}</span>
                                    <span class="den">${den}</span>
                                </span>
                            </span>
                            <span style="font-size:2rem;margin:0 20px;color:var(--accent-green);">=</span>
                            <span class="frac frac-2xl" style="color:var(--accent-green);">
                                <span class="num" style="background:rgba(76,175,80,0.2);border-radius:6px;padding:4px 12px;border:2px dashed var(--accent-green);">?</span>
                                <span class="den">${den}</span>
                            </span>
                        </div>
                        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                            ${circlesHTML}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            (${wholes} × ${den}) + ${extraNum} = ?
                        </div>
                    </div>`;
                } else {
                    // visual_to_both: Show visual and ask for BOTH forms
                    q.text = `Write this amount as an improper fraction AND a mixed number:`;
                    q.ans = `${totalNum}/${den}`;
                    q.answerType = "text";
                    q.secondAnswer = `${wholes} ${extraNum}/${den}`;
                    const wrongs = new Set();
                    wrongs.add(`${totalNum + 1}/${den}`);
                    wrongs.add(`${totalNum - 1}/${den}`);
                    wrongs.add(`${wholes}/${den}`);
                    q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                    q.hint = `Count total shaded parts for improper. Count full circles for whole number.`;
                    
                    const circlesHTML = Array.from({length: wholes}, (_, i) => `
                        <div style="text-align:center;">
                            ${fracCircleSVG(den, den, 70, 'var(--accent-cyan)')}
                            <div style="font-size:0.8rem;color:var(--text-dim);">Full</div>
                        </div>
                    `).join('') + `
                        <div style="text-align:center;">
                            ${fracCircleSVG(extraNum, den, 70, 'var(--accent-cyan)')}
                            <div style="font-size:0.8rem;color:var(--text-dim);">${extraNum}/${den}</div>
                        </div>
                    `;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;margin-bottom:20px;">
                            ${circlesHTML}
                        </div>
                        <div style="background:rgba(255,255,255,0.1);padding:15px 20px;border-radius:12px;">
                            <div style="display:flex;justify-content:center;gap:30px;align-items:center;">
                                <div>
                                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:5px;">Improper Fraction:</div>
                                    <span class="frac frac-xl" style="color:var(--accent-orange);">
                                        <span class="num" style="border-bottom:2px dashed var(--accent-orange);min-width:30px;">?</span>
                                        <span class="den">${den}</span>
                                    </span>
                                </div>
                                <span style="font-size:1.5rem;color:var(--accent-green);">=</span>
                                <div>
                                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:5px;">Mixed Number:</div>
                                    <span style="font-size:1.5rem;color:var(--accent-purple);font-weight:700;">
                                        <span style="border-bottom:2px dashed var(--accent-purple);">?</span>
                                        <span class="frac frac-lg" style="margin-left:5px;">
                                            <span class="num" style="border-bottom:2px dashed var(--accent-purple);min-width:20px;">?</span>
                                            <span class="den">${den}</span>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
            } else if (fracSkill === "add" || fracSkill === "sub") {
                // 🟠 Level 3: Add/Subtract fractions with SAME denominator
                const num2 = randInt(1, Math.min(denominator - 1, denominator - numerator + 2));
                const opSymbol = fracSkill === "add" ? "+" : "−";
                q.text = `Calculate:`;
                const result = fracSkill === "add" ? numerator + num2 : Math.abs(numerator - num2);
                q.ans = simplifyFraction(result, denominator);
                q.answerType = "text";
                const wrongs = new Set();
                let fracAttempts = 0;
                while (wrongs.size < 3 && fracAttempts < 30) {
                    fracAttempts++;
                    const offset = randInt(-2, 2);
                    if (offset === 0) continue;
                    wrongs.add(simplifyFraction(Math.abs(result + offset), denominator));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Same denominator! Just ${fracSkill === "add" ? "add" : "subtract"} the numerators: ${numerator} ${opSymbol} ${num2} = ${result}`;
                
                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:25px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${numerator}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-equals">=</span>
                        <span class="frac-answer-box">
                            <span class="answer-num">?</span>
                            <span class="answer-bar"></span>
                            <span class="answer-den">${denominator}</span>
                        </span>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:15px;">
                        <div style="text-align:center;">
                            ${fracCircleSVG(numerator, denominator, 80, '#00bcd4')}
                        </div>
                        <span style="font-size:2rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        <div style="text-align:center;">
                            ${fracCircleSVG(num2, denominator, 80, '#9c27b0')}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
                        ${fracBarHTML(numerator, denominator, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(num2, denominator, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else if (fracSkill === "add_unlike" || fracSkill === "sub_unlike") {
                // 🔴 Level 4: Add/Subtract fractions with UNLIKE denominators
                const denomPairs = [
                    {d1: 2, d2: 4, lcd: 4},
                    {d1: 2, d2: 6, lcd: 6},
                    {d1: 3, d2: 6, lcd: 6},
                    {d1: 4, d2: 8, lcd: 8},
                    {d1: 2, d2: 3, lcd: 6},
                    {d1: 3, d2: 4, lcd: 12}
                ];
                const pair = pick(denomPairs);
                const n1 = rng(1, pair.d1 - 1);
                const n2 = rng(1, pair.d2 - 1);
                
                const mult1 = pair.lcd / pair.d1;
                const mult2 = pair.lcd / pair.d2;
                const converted1 = n1 * mult1;
                const converted2 = n2 * mult2;
                
                const isAdd = fracSkill === "add_unlike";
                const opSymbol = isAdd ? "+" : "−";
                
                let num1Final = n1, den1Final = pair.d1;
                let num2Final = n2, den2Final = pair.d2;
                let conv1Final = converted1, conv2Final = converted2;
                let resultNum = isAdd ? converted1 + converted2 : converted1 - converted2;
                
                if (!isAdd && converted1 < converted2) {
                    [num1Final, num2Final] = [n2, n1];
                    [den1Final, den2Final] = [pair.d2, pair.d1];
                    [conv1Final, conv2Final] = [converted2, converted1];
                    resultNum = converted2 - converted1;
                }
                
                q.text = `Calculate:`;
                q.ans = simplifyFraction(Math.abs(resultNum), pair.lcd);
                q.answerType = "text";
                
                const wrongs = new Set();
                wrongs.add(`${num1Final + num2Final}/${den1Final + den2Final}`);
                wrongs.add(simplifyFraction(Math.abs(resultNum) + 1, pair.lcd));
                wrongs.add(simplifyFraction(Math.max(1, Math.abs(resultNum) - 1), pair.lcd));
                
                q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                q.hint = `Step 1: Find LCD (${pair.lcd}). Step 2: Convert fractions. Step 3: ${isAdd ? 'Add' : 'Subtract'} numerators.`;
                
                q.visual = `<div style="text-align:center;">
                    <!-- Original equation -->
                    <div class="frac-equation" style="margin-bottom:20px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${num1Final}</span>
                            <span class="den">${den1Final}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2Final}</span>
                            <span class="den">${den2Final}</span>
                        </span>
                    </div>
                    
                    <!-- Visual comparison -->
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:20px;">
                        ${fracCircleSVG(num1Final, den1Final, 70, '#00bcd4')}
                        <span style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        ${fracCircleSVG(num2Final, den2Final, 70, '#9c27b0')}
                    </div>
                    
                    <!-- Conversion step -->
                    <div style="background:rgba(255,255,255,0.08);padding:15px 20px;border-radius:12px;margin-bottom:15px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">
                            <strong>Find common denominator:</strong> LCD = <strong style="color:var(--accent-green);">${pair.lcd}</strong>
                        </div>
                        <div class="frac-equation" style="padding:10px;background:transparent;">
                            <span class="frac frac-xl" style="color:var(--accent-cyan);">
                                <span class="num">${conv1Final}</span>
                                <span class="den">${pair.lcd}</span>
                            </span>
                            <span class="frac-op">${opSymbol}</span>
                            <span class="frac frac-xl" style="color:var(--accent-purple);">
                                <span class="num">${conv2Final}</span>
                                <span class="den">${pair.lcd}</span>
                            </span>
                            <span class="frac-equals">=</span>
                            <span class="frac-answer-box">
                                <span class="answer-num">?</span>
                                <span class="answer-bar"></span>
                                <span class="answer-den">${pair.lcd}</span>
                            </span>
                        </div>
                    </div>
                    
                    <!-- Bar visualization with LCD -->
                    <div style="display:flex;justify-content:center;gap:8px;">
                        ${fracBarHTML(conv1Final, pair.lcd, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(conv2Final, pair.lcd, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else {
                // Default to simplify
                const multiplier = randInt(2,4);
                const rawNum = numerator * multiplier;
                const rawDen = denominator * multiplier;
                q.text = `Simplify: ${rawNum}/${rawDen}`;
                q.answerType = "text";
                q.ans = simplifyFraction(rawNum, rawDen);
                const wrongs = new Set();
                let simpAttempts = 0;
                while (wrongs.size < 3 && simpAttempts < 30) {
                    simpAttempts++;
                    const wrongSimp = simplifyFraction(rawNum + randInt(-3,3), rawDen);
                    if (wrongSimp !== q.ans) wrongs.add(wrongSimp);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Find a number that divides both ${rawNum} and ${rawDen} evenly. Try dividing by ${multiplier}!`;
                q.visual = `<div style="text-align:center;">
                    <div style="margin-bottom:15px;">
                        ${fracHTML(rawNum, rawDen, 'xl')}
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Divide top and bottom by the same number</div>
                </div>`;
            }
            break;
        }
        case "conversions": {
            // Standard fractions for clean decimal conversions
            // Only include fractions where denominator divides evenly into 10, 100, or 1000
            // and numerator/denominator gives a nice terminating decimal
            const conversionFractions = [
                {n: 1, d: 2, hint: "Half of 1 is 0.5"}, // 0.5
                {n: 1, d: 4, hint: "1/4 = 25/100 = 0.25"}, {n: 2, d: 4, hint: "2/4 = 1/2 = 0.5"}, {n: 3, d: 4, hint: "3/4 = 75/100 = 0.75"}, // 0.25, 0.5, 0.75
                {n: 1, d: 5, hint: "1/5 = 2/10 = 0.2"}, {n: 2, d: 5, hint: "2/5 = 4/10 = 0.4"}, {n: 3, d: 5, hint: "3/5 = 6/10 = 0.6"}, {n: 4, d: 5, hint: "4/5 = 8/10 = 0.8"}, // 0.2, 0.4, 0.6, 0.8
                {n: 1, d: 10, hint: "1/10 = 0.1"}, {n: 3, d: 10, hint: "3/10 = 0.3"}, {n: 7, d: 10, hint: "7/10 = 0.7"}, {n: 9, d: 10, hint: "9/10 = 0.9"}, // 0.1, 0.3, 0.7, 0.9
                {n: 1, d: 100, hint: "1/100 = 0.01"}, {n: 7, d: 100, hint: "7/100 = 0.07"}, {n: 25, d: 100, hint: "25/100 = 0.25"}, {n: 50, d: 100, hint: "50/100 = 0.50"} // 0.01, 0.07, 0.25, 0.50
            ];
            // For mixed, pick random conversion skill
            const convSkill = mappedSkill === "mixed" ? pick(["f_to_d", "d_to_f", "f_to_p", "p_to_f", "length_metric", "mass_metric", "time"]) : mappedSkill;
            if (convSkill === "f_to_d") {
                const frac = pick(conversionFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimalAns = +(numerator / denominator).toFixed(3);
                q.text = `Convert to decimal: ${numerator}/${denominator}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);

                // Generate helpful hint based on denominator
                let hintText = frac.hint || `${numerator} ÷ ${denominator} = ${decimalAns}`;
                if (denominator === 10) {
                    hintText = `Tenths: ${numerator}/10 = 0.${numerator}`;
                } else if (denominator === 100) {
                    hintText = `Hundredths: ${numerator}/100 = 0.${numerator.toString().padStart(2, '0')}`;
                } else if (denominator === 5) {
                    hintText = `Multiply top and bottom by 2: ${numerator}/5 = ${numerator * 2}/10 = 0.${numerator * 2}`;
                } else if (denominator === 4) {
                    hintText = `Multiply top and bottom by 25: ${numerator}/4 = ${numerator * 25}/100 = 0.${(numerator * 25).toString().padStart(2, '0')}`;
                } else if (denominator === 2) {
                    hintText = `Multiply top and bottom by 5: ${numerator}/2 = ${numerator * 5}/10 = 0.${numerator * 5}`;
                }
                q.hint = hintText;

                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">→</span>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--accent-green);">0.???</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Convert to tenths or hundredths first!</div>
                </div>`;
            } else if (convSkill === "d_to_f") {
                const simpleFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                    {n: 1, d: 10}, {n: 3, d: 10}, {n: 7, d: 10}, {n: 9, d: 10}
                ];
                const frac = pick(simpleFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimal = +(numerator / denominator).toFixed(2);
                q.text = `Convert ${decimal} to a fraction (simplest form).`;
                q.answerType = "text";
                q.ans = simplifyFraction(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(simpleFractions);
                    const wrongAns = simplifyFraction(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${decimal} means "${decimal.toString().split('.')[1] || '0'}" out of "${Math.pow(10, (decimal.toString().split('.')[1] || '0').length)}". Simplify if needed!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-cyan);">${decimal}</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">→</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "f_to_p") {
                // Only use fractions that convert to whole number percentages
                const percentFractions = [
                    {n: 1, d: 2}, // 50%
                    {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4}, // 25%, 50%, 75%
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}, // 20%, 40%, 60%, 80%
                    {n: 1, d: 10}, {n: 2, d: 10}, {n: 3, d: 10}, {n: 4, d: 10}, {n: 5, d: 10}, {n: 6, d: 10}, {n: 7, d: 10}, {n: 8, d: 10}, {n: 9, d: 10}, // 10-90%
                    {n: 1, d: 20}, {n: 2, d: 20}, {n: 3, d: 20}, {n: 4, d: 20}, {n: 5, d: 20}, // 5%, 10%, 15%, 20%, 25%
                    {n: 1, d: 100}, {n: 5, d: 100}, {n: 10, d: 100}, {n: 25, d: 100}, {n: 50, d: 100}, {n: 75, d: 100} // 1%, 5%, 10%, 25%, 50%, 75%
                ];
                const frac = pick(percentFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                q.text = `Convert to percent: ${numerator}/${denominator}`;
                q.answerType = "text";
                q.ans = fractionToPercent(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(percentFractions);
                    const wrongAns = fractionToPercent(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `To convert to percent: (${numerator} ÷ ${denominator}) × 100 = ?%`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">→</span>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--accent-green);">?%</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Percent = out of 100</div>
                </div>`;
            } else if (convSkill === "p_to_f") {
                const percent = pick([10,20,25,50,75]);
                q.text = `Convert ${percent}% to a fraction.`;
                q.answerType = "text";
                q.ans = simplifyFraction(percent, 100);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const p = pick([15,30,40,60,80]);
                    wrongs.add(simplifyFraction(p, 100));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${percent}% means ${percent}/100. Now simplify by finding a common factor!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-purple);">${percent}%</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">→</span>
                        ${fracHTML(percent, 100, 'lg')}
                        <span style="font-size:2rem;color:var(--accent-orange);">→</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "length_metric") {
                // 🟠 Level 3: Length conversions (cm, m, km)
                const convType = pick(["cm_to_m", "m_to_cm", "m_to_km", "km_to_m", "mm_to_cm", "cm_to_mm"]);
                
                if (convType === "cm_to_m") {
                    const cm = pick([100, 200, 250, 300, 500, 150, 450]) ;
                    q.ans = cm / 100;
                    q.text = `Convert ${cm} cm to meters.`;
                    q.hint = `100 cm = 1 m. Divide by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📏 ${cm} centimeters = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">100 cm = 1 m</div>
                    </div>`;
                } else if (convType === "m_to_cm") {
                    const m = pick([1, 2, 3, 4, 5, 1.5, 2.5, 3.5]);
                    q.ans = m * 100;
                    q.text = `Convert ${m} m to centimeters.`;
                    q.hint = `1 m = 100 cm. Multiply by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📏 ${m} meters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 m = 100 cm</div>
                    </div>`;
                } else if (convType === "m_to_km") {
                    const m = pick([1000, 2000, 3000, 5000, 500, 1500, 2500]);
                    q.ans = m / 1000;
                    q.text = `Convert ${m.toLocaleString()} m to kilometers.`;
                    q.hint = `1000 m = 1 km. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">🛣️ ${m.toLocaleString()} meters = ? kilometers</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 m = 1 km</div>
                    </div>`;
                } else if (convType === "km_to_m") {
                    const km = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = km * 1000;
                    q.text = `Convert ${km} km to meters.`;
                    q.hint = `1 km = 1000 m. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">🛣️ ${km} kilometers = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 km = 1000 m</div>
                    </div>`;
                } else if (convType === "mm_to_cm") {
                    const mm = pick([10, 20, 30, 50, 100, 25, 15, 45]);
                    q.ans = mm / 10;
                    q.text = `Convert ${mm} mm to centimeters.`;
                    q.hint = `10 mm = 1 cm. Divide by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📏 ${mm} millimeters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">10 mm = 1 cm</div>
                    </div>`;
                } else {
                    const cm = pick([1, 2, 3, 5, 10, 1.5, 2.5, 4.5]);
                    q.ans = cm * 10;
                    q.text = `Convert ${cm} cm to millimeters.`;
                    q.hint = `1 cm = 10 mm. Multiply by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📏 ${cm} centimeters = ? millimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 cm = 10 mm</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "mass_metric") {
                // 🟠 Level 3: Mass conversions (g, kg)
                const convType = pick(["g_to_kg", "kg_to_g", "mg_to_g", "g_to_mg"]);
                
                if (convType === "g_to_kg") {
                    const g = pick([1000, 2000, 3000, 5000, 500, 1500, 2500, 250]);
                    q.ans = g / 1000;
                    q.text = `Convert ${g.toLocaleString()} g to kilograms.`;
                    q.hint = `1000 g = 1 kg. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⚖️ ${g.toLocaleString()} grams = ? kilograms</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 g = 1 kg</div>
                    </div>`;
                } else if (convType === "kg_to_g") {
                    const kg = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = kg * 1000;
                    q.text = `Convert ${kg} kg to grams.`;
                    q.hint = `1 kg = 1000 g. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⚖️ ${kg} kilograms = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 kg = 1000 g</div>
                    </div>`;
                } else if (convType === "mg_to_g") {
                    const mg = pick([1000, 2000, 5000, 500, 100, 250]);
                    q.ans = mg / 1000;
                    q.text = `Convert ${mg.toLocaleString()} mg to grams.`;
                    q.hint = `1000 mg = 1 g. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⚖️ ${mg.toLocaleString()} milligrams = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 mg = 1 g</div>
                    </div>`;
                } else {
                    const g = pick([1, 2, 3, 5, 0.5, 1.5, 2.5]);
                    q.ans = g * 1000;
                    q.text = `Convert ${g} g to milligrams.`;
                    q.hint = `1 g = 1000 mg. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⚖️ ${g} grams = ? milligrams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 g = 1000 mg</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "time") {
                // 🔴 Level 4: Time conversions
                const convType = pick(["min_to_sec", "hr_to_min", "sec_to_min", "min_to_hr", "days_to_hr", "hr_to_days"]);
                
                if (convType === "min_to_sec") {
                    const min = pick([1, 2, 3, 5, 10, 15, 1.5, 2.5]);
                    q.ans = min * 60;
                    q.text = `Convert ${min} minute${min !== 1 ? 's' : ''} to seconds.`;
                    q.hint = `1 minute = 60 seconds. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⏱️ ${min} minute${min !== 1 ? 's' : ''} = ? seconds</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 min = 60 sec</div>
                    </div>`;
                } else if (convType === "hr_to_min") {
                    const hr = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = hr * 60;
                    q.text = `Convert ${hr} hour${hr !== 1 ? 's' : ''} to minutes.`;
                    q.hint = `1 hour = 60 minutes. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⏰ ${hr} hour${hr !== 1 ? 's' : ''} = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 hr = 60 min</div>
                    </div>`;
                } else if (convType === "sec_to_min") {
                    const sec = pick([60, 120, 180, 300, 600, 90, 150, 240]);
                    q.ans = sec / 60;
                    q.text = `Convert ${sec} seconds to minutes.`;
                    q.hint = `60 seconds = 1 minute. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⏱️ ${sec} seconds = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 sec = 1 min</div>
                    </div>`;
                } else if (convType === "min_to_hr") {
                    const min = pick([60, 120, 180, 240, 300, 30, 90, 150]);
                    q.ans = min / 60;
                    q.text = `Convert ${min} minutes to hours.`;
                    q.hint = `60 minutes = 1 hour. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">⏰ ${min} minutes = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 min = 1 hr</div>
                    </div>`;
                } else if (convType === "days_to_hr") {
                    const days = pick([1, 2, 3, 5, 7, 0.5]);
                    q.ans = days * 24;
                    q.text = `Convert ${days} day${days !== 1 ? 's' : ''} to hours.`;
                    q.hint = `1 day = 24 hours. Multiply by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📅 ${days} day${days !== 1 ? 's' : ''} = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 day = 24 hr</div>
                    </div>`;
                } else {
                    const hr = pick([24, 48, 72, 12, 36, 96, 120]);
                    q.ans = hr / 24;
                    q.text = `Convert ${hr} hours to days.`;
                    q.hint = `24 hours = 1 day. Divide by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">📅 ${hr} hours = ? days</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">24 hr = 1 day</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else {
                // Default: fraction to decimal
                const conversionFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}
                ];
                const frac = pick(conversionFractions);
                const decimalAns = +(frac.n / frac.d).toFixed(2);
                q.text = `Convert to decimal: ${frac.n}/${frac.d}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);
                q.hint = `Divide ${frac.n} by ${frac.d}`;
                q.visual = `<div style="text-align:center;">
                    ${fracHTML(frac.n, frac.d, 'xl')}
                    <span style="font-size:2rem;margin:0 15px;">→</span>
                    <span style="font-size:1.5rem;color:var(--accent-green);">?</span>
                </div>`;
            }
            break;
        }
        case "decimals": {
            // Decimals Category
            const decSkill = mappedSkill === "mixed" ? pick(["add_decimal", "sub_decimal", "mult_decimal", "div_decimal", "compare_decimal", "order_decimal", "number_line_decimal"]) : mappedSkill;
            
            // Helper to generate decimal numbers
            const genDecimal = (maxWhole, decPlaces) => {
                const whole = rng(0, maxWhole);
                const decimal = rng(1, Math.pow(10, decPlaces) - 1);
                return parseFloat(`${whole}.${decimal.toString().padStart(decPlaces, '0')}`);
            };
            
            if (decSkill === "add_decimal") {
                // Adding decimals
                const places = pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                q.ans = parseFloat((a + b).toFixed(places));
                q.text = `${a} + ${b} = ?`;
                q.hint = `Line up the decimal points, then add!`;
                
                // Create column addition visual
                const maxLen = Math.max(a.toString().length, b.toString().length, q.ans.toString().length) + 1;
                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
                
                q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Adding Decimals</div>
                    <div style="display:inline-block;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-green);">
                        <div style="text-align:right;font-size:1.3rem;">
                            <div style="margin-bottom:5px;letter-spacing:3px;">${a.toString().padStart(maxLen, ' ')}</div>
                            <div style="border-bottom:3px solid #444;padding-bottom:5px;letter-spacing:3px;">+ ${b.toString().padStart(maxLen - 2, ' ')}</div>
                        </div>
                        <div style="text-align:right;margin-top:8px;">
                            ${Array(maxLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:28px;border:1.5px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1.1rem;margin:0 1px;">`).join('')}
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">💡 Line up the decimal points!</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '+', places };
                q.printFormat = "decimal-column-add";
            } else if (decSkill === "sub_decimal") {
                // Subtracting decimals
                const places = pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                if (b > a) [a, b] = [b, a]; // Ensure positive result
                q.ans = parseFloat((a - b).toFixed(places));
                q.text = `${a} - ${b} = ?`;
                q.hint = `Line up the decimal points, then subtract!`;
                
                const maxLen = Math.max(a.toString().length, b.toString().length, q.ans.toString().length) + 1;
                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
                
                q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Subtracting Decimals</div>
                    <div style="display:inline-block;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-orange);">
                        <div style="text-align:right;font-size:1.3rem;">
                            <div style="margin-bottom:5px;letter-spacing:3px;">${a.toString().padStart(maxLen, ' ')}</div>
                            <div style="border-bottom:3px solid #444;padding-bottom:5px;letter-spacing:3px;">- ${b.toString().padStart(maxLen - 2, ' ')}</div>
                        </div>
                        <div style="text-align:right;margin-top:8px;">
                            ${Array(maxLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:28px;border:1.5px solid var(--accent-orange);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1.1rem;margin:0 1px;">`).join('')}
                        </div>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">💡 Line up the decimal points!</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '-', places };
                q.printFormat = "decimal-column-sub";
            } else if (decSkill === "mult_decimal") {
                // Multiplying decimals
                const places = pick([1, 2]);
                let a = genDecimal(9, places);
                let b = rng(2, 9);
                q.ans = parseFloat((a * b).toFixed(places + 1));
                q.text = `${a} × ${b} = ?`;
                q.hint = `Multiply as if whole numbers, then place the decimal!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Multiplying Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${a} × ${b} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:250px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            <div>1️⃣ Multiply: ${Math.round(a * Math.pow(10, places))} × ${b} = ${Math.round(a * Math.pow(10, places)) * b}</div>
                            <div>2️⃣ Count decimal places: ${places}</div>
                            <div>3️⃣ Place decimal in answer</div>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '×', places };
                q.printFormat = "decimal-mult";
            } else if (decSkill === "div_decimal") {
                // Dividing decimals
                const divisor = pick([2, 4, 5, 10]);
                const quotient = genDecimal(9, 1);
                const dividend = parseFloat((quotient * divisor).toFixed(2));
                q.ans = quotient;
                q.text = `${dividend} ÷ ${divisor} = ?`;
                q.hint = `Divide as normal, keeping track of the decimal!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Dividing Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${dividend} ÷ ${divisor} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:200px;font-family:monospace;">
                        <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
                            <span style="font-size:1.3rem;">${divisor}</span>
                            <span style="border-left:2px solid currentColor;border-top:2px solid currentColor;padding:5px 10px;font-size:1.3rem;">${dividend}</span>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { dividend, divisor, quotient };
                q.printFormat = "decimal-div";
            } else if (decSkill === "compare_decimal") {
                // Comparing decimals
                const places = pick([1, 2, 3]);
                let a = genDecimal(9, places);
                let b = genDecimal(9, places);
                while (a === b) b = genDecimal(9, places);
                
                const correctSymbol = a > b ? ">" : a < b ? "<" : "=";
                q.text = `Compare: ${a} ___ ${b}`;
                q.ans = correctSymbol;
                q.answerType = "choice";
                q.hint = `Compare digit by digit from left to right!`;
                q.options = [">", "<", "="];
                
                // Create visual comparison with place value grid
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Compare Decimals</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="color:var(--accent-green);font-weight:700;">${a}</span>
                        <span style="margin:0 15px;border:2px dashed var(--text-dim);padding:5px 15px;border-radius:8px;">?</span>
                        <span style="color:var(--accent-orange);font-weight:700;">${b}</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:10px;margin-top:15px;">
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">></div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;"><</div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">=</div>
                    </div>
                </div>`;
                q.decimalData = { a, b, answer: correctSymbol };
                q.printFormat = "decimal-compare";
            } else if (decSkill === "order_decimal") {
                // Ordering decimals
                const count = pick([4, 5]);
                const places = pick([1, 2]);
                let nums = [];
                for (let i = 0; i < count; i++) {
                    let n = genDecimal(9, places);
                    while (nums.includes(n)) n = genDecimal(9, places);
                    nums.push(n);
                }
                const sorted = [...nums].sort((x, y) => x - y);
                const direction = pick(["asc", "desc"]);
                const answer = direction === "asc" ? sorted : sorted.reverse();
                
                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}: ${nums.join(", ")}`;
                q.ans = answer.join(", ");
                q.answerType = "text";
                q.hint = `Compare decimal values carefully!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Order Decimals</div>
                    <div style="font-size:0.9rem;margin-bottom:15px;">${direction === "asc" ? "Smallest → Largest" : "Largest → Smallest"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:15px 0;">
                        ${nums.map(n => `<div style="padding:10px 15px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;font-weight:600;">${n}</div>`).join('')}
                    </div>
                    <div style="margin-top:15px;display:flex;justify-content:center;gap:5px;align-items:center;">
                        ${Array(count).fill(0).map((_, i) => `<input type="text" style="width:50px;height:35px;border:2px solid var(--accent-green);border-radius:6px;text-align:center;font-size:1rem;" placeholder="${i + 1}">`).join('<span style="font-size:1.2rem;"> → </span>')}
                    </div>
                </div>`;
                q.decimalData = { nums, sorted: answer, direction };
                q.printFormat = "decimal-order";
            } else if (decSkill === "number_line_decimal") {
                // Decimals on number line
                const wholeStart = rng(0, 5);
                const wholeEnd = wholeStart + 1;
                const targetDecimal = parseFloat((wholeStart + (rng(1, 9) / 10)).toFixed(1));
                
                q.text = `What decimal is shown on the number line?`;
                q.ans = targetDecimal;
                q.hint = `Count the tick marks between ${wholeStart} and ${wholeEnd}!`;
                
                // Create SVG number line
                const tickPosition = ((targetDecimal - wholeStart) / (wholeEnd - wholeStart)) * 100;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Decimals on Number Line</div>
                    <svg width="320" height="80" viewBox="0 0 320 80" style="max-width:100%;">
                        <!-- Main line -->
                        <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="3"/>
                        <!-- End caps -->
                        <line x1="20" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="3"/>
                        <line x1="300" y1="30" x2="300" y2="50" stroke="currentColor" stroke-width="3"/>
                        <!-- Tick marks for tenths -->
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + (i * 28);
                            const isMajor = i === 0 || i === 10;
                            return `<line x1="${x}" y1="${isMajor ? 30 : 35}" x2="${x}" y2="${isMajor ? 50 : 45}" stroke="currentColor" stroke-width="${isMajor ? 2 : 1}"/>`;
                        }).join('')}
                        <!-- Labels -->
                        <text x="20" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeStart}</text>
                        <text x="300" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeEnd}</text>
                        <!-- Arrow pointing to target -->
                        <polygon points="${20 + tickPosition * 2.8 - 8},20 ${20 + tickPosition * 2.8 + 8},20 ${20 + tickPosition * 2.8},32" fill="var(--accent-green)"/>
                        <text x="${20 + tickPosition * 2.8}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { wholeStart, wholeEnd, target: targetDecimal };
                q.printFormat = "decimal-number-line";
            }
            break;
        }
        case "estimation": {
            // Estimation Category
            const estSkill = mappedSkill === "mixed" ? pick(["estimate_sum", "estimate_diff", "estimate_prod", "compatible_numbers", "frontend_estimation"]) : mappedSkill;
            
            if (estSkill === "estimate_sum") {
                // Estimate sums by rounding
                const roundTo = pick([10, 100]);
                let a = rng(roundTo === 10 ? 12 : 101, roundTo === 10 ? 98 : 999);
                let b = rng(roundTo === 10 ? 12 : 101, roundTo === 10 ? 98 : 999);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded + bRounded;
                const actual = a + b;
                
                q.text = `Estimate: ${a} + ${b}`;
                q.ans = estimate;
                q.hint = `Round each number to the nearest ${roundTo}, then add!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📏 Estimate the Sum</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} + ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a}</div>
                                <div style="font-size:1.2rem;">→ <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b}</div>
                                <div style="font-size:1.2rem;">→ <span style="color:var(--accent-green);font-weight:700;">${bRounded}</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Add the rounded numbers</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} + ${bRounded} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '+', strategy: 'rounding' };
                q.printFormat = "estimation-sum";
            } else if (estSkill === "estimate_diff") {
                // Estimate differences by rounding
                const roundTo = pick([10, 100]);
                let a = rng(roundTo === 10 ? 50 : 500, roundTo === 10 ? 98 : 999);
                let b = rng(roundTo === 10 ? 12 : 101, a - 10);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded - bRounded;
                const actual = a - b;
                
                q.text = `Estimate: ${a} - ${b}`;
                q.ans = estimate;
                q.hint = `Round each number to the nearest ${roundTo}, then subtract!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📏 Estimate the Difference</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} - ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${a}</div>
                                <div style="font-size:1.2rem;">→ <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:var(--text-dim);">${b}</div>
                                <div style="font-size:1.2rem;">→ <span style="color:var(--accent-green);font-weight:700;">${bRounded}</span></div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Subtract the rounded numbers</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} - ${bRounded} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '-', strategy: 'rounding' };
                q.printFormat = "estimation-diff";
            } else if (estSkill === "estimate_prod") {
                // Estimate products by rounding
                const roundTo = 10;
                let a = rng(12, 49);
                let b = rng(2, 9);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const estimate = aRounded * b;
                const actual = a * b;
                
                q.text = `Estimate: ${a} × ${b}`;
                q.ans = estimate;
                q.hint = `Round ${a} to the nearest ${roundTo}, then multiply!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📏 Estimate the Product</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${a} × ${b}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Round to nearest ${roundTo}</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:0.9rem;color:var(--text-dim);">${a} → <span style="color:var(--accent-green);font-weight:700;">${aRounded}</span></div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Multiply</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${aRounded} × ${b} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { a, b, aRounded, bRounded: b, estimate, actual, roundTo, op: '×', strategy: 'rounding' };
                q.printFormat = "estimation-prod";
            } else if (estSkill === "compatible_numbers") {
                // Compatible numbers for division
                const divisor = pick([3, 4, 5, 6, 7, 8, 9]);
                const targetQuotient = rng(5, 15);
                const compatible = divisor * targetQuotient;
                // Create dividend that's close to compatible
                const dividend = compatible + rng(-divisor + 1, divisor - 1);
                const estimate = targetQuotient;
                const actual = Math.round(dividend / divisor * 10) / 10;
                
                q.text = `Use compatible numbers to estimate: ${dividend} ÷ ${divisor}`;
                q.ans = estimate;
                q.hint = `Find a number close to ${dividend} that divides evenly by ${divisor}!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📏 Compatible Numbers</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${dividend} ÷ ${divisor}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Find compatible dividend</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">What number close to ${dividend} divides evenly by ${divisor}?</div>
                        <div style="text-align:center;margin:10px 0;">
                            <div style="font-size:1.1rem;">${dividend} → <span style="color:var(--accent-green);font-weight:700;">${compatible}</span></div>
                            <div style="font-size:0.8rem;color:var(--text-dim);">(because ${compatible} ÷ ${divisor} = ${targetQuotient})</div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: Divide</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${compatible} ÷ ${divisor} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                q.estimationData = { dividend, divisor, compatible, estimate, actual, op: '÷', strategy: 'compatible' };
                q.printFormat = "estimation-compatible";
            } else if (estSkill === "frontend_estimation") {
                // Front-end estimation
                const a = rng(100, 999);
                const b = rng(100, 999);
                const op = pick(['+', '-']);
                
                // Get front-end digits (hundreds place)
                const aFront = Math.floor(a / 100) * 100;
                const bFront = Math.floor(b / 100) * 100;
                
                let estimate, actual;
                if (op === '+') {
                    estimate = aFront + bFront;
                    actual = a + b;
                } else {
                    // Ensure a > b for subtraction
                    const [larger, smaller] = a > b ? [a, b] : [b, a];
                    const largerFront = Math.floor(larger / 100) * 100;
                    const smallerFront = Math.floor(smaller / 100) * 100;
                    estimate = largerFront - smallerFront;
                    actual = larger - smaller;
                    q.estimationData = { a: larger, b: smaller, aFront: largerFront, bFront: smallerFront, estimate, actual, op, strategy: 'frontend' };
                }
                
                q.text = `Use front-end estimation: ${op === '+' ? a : (a > b ? a : b)} ${op} ${op === '+' ? b : (a > b ? b : a)}`;
                q.ans = estimate;
                q.hint = `Use only the front (hundreds) digits to estimate!`;
                
                const displayA = op === '+' ? a : (a > b ? a : b);
                const displayB = op === '+' ? b : (a > b ? b : a);
                const displayAFront = op === '+' ? aFront : (a > b ? aFront : bFront);
                const displayBFront = op === '+' ? bFront : (a > b ? bFront : aFront);
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📏 Front-End Estimation</div>
                    <div style="font-size:1.5rem;margin:15px 0;">${displayA} ${op} ${displayB}</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-cyan);">Step 1: Use front-end digits only</div>
                        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayA.toString()[0]}</span><span style="color:var(--text-dim);">${displayA.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">→ ${displayAFront}</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:1.2rem;font-family:monospace;"><span style="color:var(--accent-green);font-weight:700;">${displayB.toString()[0]}</span><span style="color:var(--text-dim);">${displayB.toString().slice(1)}</span></div>
                                <div style="font-size:0.9rem;">→ ${displayBFront}</div>
                            </div>
                        </div>
                        <div style="font-weight:600;margin-top:10px;color:var(--accent-cyan);">Step 2: ${op === '+' ? 'Add' : 'Subtract'}</div>
                        <div style="font-size:1.3rem;margin-top:5px;">${displayAFront} ${op} ${displayBFront} = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(estimate);
                if (!q.estimationData) {
                    q.estimationData = { a: displayA, b: displayB, aFront: displayAFront, bFront: displayBFront, estimate, actual, op, strategy: 'frontend' };
                }
                q.printFormat = "estimation-frontend";
            }
            break;
        }
        case "integers": {
            // Integers Category
            const intSkill = mappedSkill === "mixed" ? pick(["number_line_int", "compare_int", "add_int", "sub_int"]) : mappedSkill;
            
            if (intSkill === "number_line_int") {
                // Number lines with negatives
                const target = rng(-10, 10);
                q.ans = target;
                q.text = `What integer is shown on the number line?`;
                q.hint = `Zero is in the middle. Numbers to the left are negative!`;
                
                const tickPos = ((target + 10) / 20) * 100;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Integer Number Line</div>
                    <svg width="340" height="80" viewBox="0 0 340 80" style="max-width:100%;">
                        <line x1="20" y1="40" x2="320" y2="40" stroke="currentColor" stroke-width="2"/>
                        ${Array(21).fill(0).map((_, i) => {
                            const x = 20 + i * 15;
                            const val = i - 10;
                            const isMajor = val % 5 === 0;
                            return `<line x1="${x}" y1="${isMajor ? 30 : 35}" x2="${x}" y2="${isMajor ? 50 : 45}" stroke="currentColor" stroke-width="${isMajor ? 2 : 1}"/>
                            ${isMajor ? `<text x="${x}" y="65" text-anchor="middle" fill="currentColor" font-size="11">${val}</text>` : ''}`;
                        }).join('')}
                        <polygon points="${20 + tickPos * 3 - 6},18 ${20 + tickPos * 3 + 6},18 ${20 + tickPos * 3},28" fill="var(--accent-green)"/>
                        <text x="${20 + tickPos * 3}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(target);
                q.integerData = { target };
                q.printFormat = "integer-number-line";
            } else if (intSkill === "compare_int") {
                // Comparing integers
                let a = rng(-20, 20);
                let b = rng(-20, 20);
                while (a === b) b = rng(-20, 20);
                const symbol = a > b ? ">" : "<";
                q.ans = symbol;
                q.answerType = "choice";
                q.text = `Compare: ${a} ___ ${b}`;
                q.hint = `On a number line, the number further RIGHT is greater!`;
                q.options = [">", "<", "="];
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Compare Integers</div>
                    <div style="font-size:2.2rem;margin:20px 0;">
                        <span style="color:${a < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${a}</span>
                        <span style="margin:0 20px;border:2px dashed var(--text-dim);padding:8px 20px;border-radius:8px;">?</span>
                        <span style="color:${b < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${b}</span>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:10px;">💡 Think: Which is further right on the number line?</div>
                </div>`;
                q.integerData = { a, b, answer: symbol };
                q.printFormat = "integer-compare";
            } else if (intSkill === "add_int") {
                // Adding integers
                let a = rng(-15, 15);
                let b = rng(-15, 15);
                const result = a + b;
                q.ans = result;
                q.text = `${a} + ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Same signs: add and keep sign. Different signs: subtract and keep sign of larger!`;
                
                const aColor = a < 0 ? '#e74c3c' : '#27ae60';
                const bColor = b < 0 ? '#e74c3c' : '#27ae60';
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Adding Integers</div>
                    <div style="font-size:1.8rem;margin:15px 0;">
                        <span style="color:${aColor};font-weight:700;padding:5px 12px;background:rgba(${a < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${a}</span>
                        <span style="margin:0 10px;font-weight:700;">+</span>
                        <span style="color:${bColor};font-weight:700;padding:5px 12px;background:rgba(${b < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${b >= 0 ? b : '(' + b + ')'}</span>
                        <span style="margin:0 10px;">=</span>
                        <span style="border-bottom:3px solid #444;padding:0 15px;font-weight:700;">?</span>
                    </div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin-top:15px;font-size:0.85rem;">
                        <div style="color:var(--text-dim);">🟢 Positive chips: ${a >= 0 ? a : 0} + ${b >= 0 ? b : 0} = ${(a >= 0 ? a : 0) + (b >= 0 ? b : 0)}</div>
                        <div style="color:var(--text-dim);">🔴 Negative chips: ${a < 0 ? Math.abs(a) : 0} + ${b < 0 ? Math.abs(b) : 0} = ${(a < 0 ? Math.abs(a) : 0) + (b < 0 ? Math.abs(b) : 0)}</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '+' };
                q.printFormat = "integer-add";
            } else if (intSkill === "sub_int") {
                // Subtracting integers
                let a = rng(-15, 15);
                let b = rng(-15, 15);
                const result = a - b;
                q.ans = result;
                q.text = `${a} − ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Subtracting is the same as adding the opposite! ${a} − ${b} = ${a} + ${-b}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">➖ Subtracting Integers</div>
                    <div style="font-size:1.6rem;margin:15px 0;">
                        <span style="font-weight:700;">${a}</span>
                        <span style="margin:0 8px;font-weight:700;">−</span>
                        <span style="font-weight:700;">${b >= 0 ? b : '(' + b + ')'}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">✨ Add the Opposite!</div>
                        <div style="font-size:1.3rem;">${a} + <span style="color:var(--accent-orange);font-weight:700;">${-b >= 0 ? '(+' + (-b) + ')' : '(' + (-b) + ')'}</span> = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '-' };
                q.printFormat = "integer-sub";
            }
            break;
        }
        case "algebra": {
            // Algebraic Thinking Category
            const algSkill = mappedSkill === "mixed" ? pick(["solve_unknown", "write_expression", "evaluate_expression", "inequalities"]) : mappedSkill;
            
            if (algSkill === "solve_unknown") {
                // Solve for unknown (x + 5 = 12)
                const ops = ['+', '-', '×'];
                const op = pick(ops);
                let answer, known, total;
                
                if (op === '+') {
                    answer = rng(1, 20);
                    known = rng(1, 20);
                    total = answer + known;
                    q.text = `Solve: x + ${known} = ${total}`;
                    q.hint = `To isolate x, subtract ${known} from both sides!`;
                } else if (op === '-') {
                    answer = rng(5, 25);
                    known = rng(1, answer - 1);
                    total = answer - known;
                    q.text = `Solve: x − ${known} = ${total}`;
                    q.hint = `To isolate x, add ${known} to both sides!`;
                } else {
                    answer = rng(2, 12);
                    known = rng(2, 10);
                    total = answer * known;
                    q.text = `Solve: ${known}x = ${total}`;
                    q.hint = `To isolate x, divide both sides by ${known}!`;
                }
                
                q.ans = answer;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔤 Solve for Unknown</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;">
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${op === '×' ? known + 'x' : 'x ' + (op === '-' ? '−' : '+') + ' ' + known}</div>
                        </div>
                        <div style="font-size:2rem;font-weight:700;">=</div>
                        <div style="background:var(--bg-card);padding:20px 30px;border-radius:12px;border:3px solid var(--accent-cyan);">
                            <div style="font-size:1.5rem;font-weight:700;">${total}</div>
                        </div>
                    </div>
                    <div style="font-size:1.3rem;margin-top:15px;">x = <span style="border-bottom:3px solid var(--accent-green);padding:0 20px;font-weight:700;">?</span></div>
                </div>`;
                q.options = buildNumericOptions(answer);
                q.algebraData = { op, answer, known, total };
                q.printFormat = "algebra-solve";
            } else if (algSkill === "write_expression") {
                // Write expressions from words
                const templates = [
                    { words: "the sum of a number and", op: '+', phrase: 'n + ' },
                    { words: "a number plus", op: '+', phrase: 'n + ' },
                    { words: "the difference of a number and", op: '-', phrase: 'n − ' },
                    { words: "a number minus", op: '-', phrase: 'n − ' },
                    { words: "the product of a number and", op: '×', phrase: 'n × ' },
                    { words: "a number times", op: '×', phrase: 'n × ' },
                    { words: "a number divided by", op: '÷', phrase: 'n ÷ ' },
                ];
                const template = pick(templates);
                const num = rng(2, 15);
                
                q.text = `Write an expression: "${template.words} ${num}"`;
                q.ans = template.phrase + num;
                q.answerType = "text";
                q.hint = `"Sum" means +, "difference" means −, "product" means ×, "quotient" means ÷`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔤 Write an Expression</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;margin:15px auto;max-width:300px;">
                        <div style="font-size:1.1rem;font-style:italic;color:var(--text-dim);">"${template.words} ${num}"</div>
                    </div>
                    <div style="margin:20px 0;font-size:0.9rem;">
                        <div style="display:inline-block;background:rgba(52,152,219,0.15);padding:10px 15px;border-radius:8px;margin:5px;">
                            <strong>Key Words:</strong><br/>
                            sum/plus = + | difference/minus = −<br/>
                            product/times = × | quotient/divided = ÷
                        </div>
                    </div>
                    <div style="font-size:1.2rem;margin-top:15px;">Expression: <span style="border-bottom:2px solid var(--accent-green);padding:0 30px;min-width:80px;display:inline-block;">&nbsp;</span></div>
                </div>`;
                q.algebraData = { template: template.words, num, answer: template.phrase + num };
                q.printFormat = "algebra-write";
            } else if (algSkill === "evaluate_expression") {
                // Evaluate expressions with variables
                const varVal = rng(2, 10);
                const ops = ['+', '-', '×'];
                const op = pick(ops);
                const num = rng(1, 12);
                let expression, result;
                
                if (op === '+') {
                    expression = `n + ${num}`;
                    result = varVal + num;
                } else if (op === '-') {
                    expression = `n − ${num}`;
                    result = varVal - num;
                } else {
                    expression = `n × ${num}`;
                    result = varVal * num;
                }
                
                q.text = `Evaluate ${expression} when n = ${varVal}`;
                q.ans = result;
                q.hint = `Substitute ${varVal} for n, then calculate!`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔤 Evaluate Expression</div>
                    <div style="font-size:1.4rem;margin:15px 0;">
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-cyan);">${expression}</span>
                        <span style="margin:0 10px;">when</span>
                        <span style="background:var(--bg-card);padding:8px 15px;border-radius:8px;border:2px solid var(--accent-orange);">n = ${varVal}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:20px auto;max-width:250px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Step 1: Substitute</div>
                        <div style="font-size:1.2rem;">${expression.replace('n', `<span style="color:var(--accent-orange);font-weight:700;">${varVal}</span>`)}</div>
                        <div style="font-weight:600;color:var(--accent-cyan);margin-top:10px;margin-bottom:8px;">Step 2: Calculate</div>
                        <div style="font-size:1.2rem;">= <span style="border-bottom:2px dashed var(--accent-green);padding:0 15px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.algebraData = { expression, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "inequalities") {
                // Inequalities
                const symbols = ['>', '<', '≥', '≤'];
                const symbol = pick(symbols);
                const boundary = rng(1, 15);
                const testVal = rng(boundary - 5, boundary + 5);
                
                let isTrue;
                if (symbol === '>') isTrue = testVal > boundary;
                else if (symbol === '<') isTrue = testVal < boundary;
                else if (symbol === '≥') isTrue = testVal >= boundary;
                else isTrue = testVal <= boundary;
                
                q.text = `Is ${testVal} ${symbol} ${boundary} true or false?`;
                q.ans = isTrue ? "True" : "False";
                q.answerType = "choice";
                q.options = ["True", "False"];
                q.hint = `> means greater than, < means less than, ≥ means greater than or equal, ≤ means less than or equal`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔤 Inequalities</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="font-weight:700;">${testVal}</span>
                        <span style="margin:0 15px;color:var(--accent-cyan);font-weight:700;">${symbol}</span>
                        <span style="font-weight:700;">${boundary}</span>
                    </div>
                    <svg width="280" height="50" viewBox="0 0 280 50" style="margin:15px auto;display:block;">
                        <line x1="20" y1="25" x2="260" y2="25" stroke="currentColor" stroke-width="2"/>
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + i * 24;
                            const val = boundary - 5 + i;
                            return `<line x1="${x}" y1="20" x2="${x}" y2="30" stroke="currentColor" stroke-width="1"/>
                            <text x="${x}" y="45" text-anchor="middle" fill="currentColor" font-size="10">${val}</text>`;
                        }).join('')}
                        <circle cx="${20 + (testVal - (boundary - 5)) * 24}" cy="25" r="8" fill="var(--accent-green)"/>
                    </svg>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        > greater than | < less than | ≥ greater or equal | ≤ less or equal
                    </div>
                </div>`;
                q.algebraData = { testVal, symbol, boundary, isTrue };
                q.printFormat = "algebra-inequality";
            }
            break;
        }
        case "geometry": {
            // Geometry Category
            const geoSkill = mappedSkill === "mixed" ? pick(["perimeter", "area", "area_perimeter", "composite_shapes", "area_word_problems", "perimeter_word_problems", "volume", "identify_angles", "measure_angles", "identify_lines", "symmetry", "coordinate_q1", "coordinate_all", "classify_triangles", "classify_quads"]) : mappedSkill;
            
            if (geoSkill === "perimeter") {
                // Perimeter
                const shapeType = pick(["rectangle", "square"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, 15);
                    const width = rng(2, Math.min(length - 1, 12));
                    const perimeter = 2 * (length + width);
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a rectangle: length = ${length}, width = ${width}`;
                    q.hint = `Perimeter = 2 × (length + width) = 2 × (${length} + ${width})`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Perimeter</div>
                        <svg width="200" height="140" viewBox="0 0 200 140">
                            <rect x="30" y="20" width="140" height="90" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="100" y="12" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="100" y="125" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="15" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                            <text x="185" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                        </svg>
                        <div style="margin-top:10px;">P = 2(l + w) = 2(${length} + ${width}) = <span style="border-bottom:2px solid var(--accent-green);padding:0 10px;">?</span></div>
                    </div>`;
                    q.geometryData = { shape: 'rectangle', length, width, perimeter };
                } else {
                    const side = rng(3, 15);
                    const perimeter = 4 * side;
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a square with side = ${side}`;
                    q.hint = `Perimeter of square = 4 × side = 4 × ${side}`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Perimeter</div>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <rect x="30" y="30" width="100" height="100" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="80" y="22" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                            <text x="15" y="85" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                        </svg>
                        <div style="margin-top:10px;">P = 4s = 4 × ${side} = <span style="border-bottom:2px solid var(--accent-green);padding:0 10px;">?</span></div>
                    </div>`;
                    q.geometryData = { shape: 'square', side, perimeter };
                }
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "geometry-perimeter";
            } else if (geoSkill === "area") {
                // Area
                const shapeType = pick(["rectangle", "square", "triangle"]);
                let shapeSVG = '';
                
                if (shapeType === "rectangle") {
                    const length = rng(3, 12);
                    const width = rng(2, 10);
                    const area = length * width;
                    q.ans = area;
                    q.text = `Find the area of a rectangle: length = ${length}, width = ${width}`;
                    q.hint = `Area = length × width = ${length} × ${width}`;
                    q.geometryData = { shape: 'rectangle', length, width, area };
                    shapeSVG = createRectangleSVG(length, width, true, false);
                } else if (shapeType === "square") {
                    const side = rng(2, 12);
                    const area = side * side;
                    q.ans = area;
                    q.text = `Find the area of a square with side = ${side}`;
                    q.hint = `Area = side × side = ${side} × ${side}`;
                    q.geometryData = { shape: 'square', side, area };
                    shapeSVG = createSquareSVG(side, true, false);
                } else {
                    const base = rng(4, 12);
                    const height = rng(2, 10);
                    const area = (base * height) / 2;
                    q.ans = area;
                    q.text = `Find the area of a triangle: base = ${base}, height = ${height}`;
                    q.hint = `Area = ½ × base × height = ½ × ${base} × ${height}`;
                    q.geometryData = { shape: 'triangle', base, height, area };
                    shapeSVG = createTriangleSVG('default', base, height, true, false);
                }
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Area</div>
                    ${shapeSVG}
                    <div style="font-size:1.2rem;margin:15px 0;">Area = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> square units</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "geometry-area";
            } else if (geoSkill === "volume") {
                // Volume of rectangular prism
                const length = rng(2, 8);
                const width = rng(2, 6);
                const height = rng(2, 6);
                const volume = length * width * height;
                
                q.ans = volume;
                q.text = `Find the volume: length = ${length}, width = ${width}, height = ${height}`;
                q.hint = `Volume = length × width × height = ${length} × ${width} × ${height}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Volume</div>
                    ${create3DBoxSVG(length, width, height, false)}
                    <div style="font-size:1.1rem;margin-top:10px;">V = l × w × h = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> cubic units</div>
                </div>`;
                q.options = buildNumericOptions(volume);
                q.geometryData = { length, width, height, volume };
                q.printFormat = "geometry-volume";
            } else if (geoSkill === "identify_angles") {
                // Identify angles
                const angleTypes = [
                    { name: "acute", range: [20, 80], desc: "less than 90°" },
                    { name: "right", range: [90, 90], desc: "exactly 90°" },
                    { name: "obtuse", range: [100, 170], desc: "between 90° and 180°" },
                    { name: "straight", range: [180, 180], desc: "exactly 180°" }
                ];
                const angleType = pick(angleTypes);
                const angle = angleType.range[0] === angleType.range[1] ? angleType.range[0] : rng(angleType.range[0], angleType.range[1]);
                
                q.text = `What type of angle is this?`;
                q.ans = angleType.name.charAt(0).toUpperCase() + angleType.name.slice(1);
                q.answerType = "choice";
                q.options = ["Acute", "Right", "Obtuse", "Straight"];
                q.hint = `Acute < 90° | Right = 90° | Obtuse: 90°-180° | Straight = 180°`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Identify This Angle</div>
                    ${createAngleSVG(angle, 140, true, false)}
                    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px;">
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Acute < 90°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Right = 90°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Obtuse 90°-180°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Straight = 180°</div>
                    </div>
                </div>`;
                q.geometryData = { angle, type: angleType.name };
                q.printFormat = "geometry-angles";
            } else if (geoSkill === "measure_angles") {
                // Measure/estimate angles
                const angles = [30, 45, 60, 90, 120, 135, 150];
                const angle = pick(angles);
                
                q.ans = angle;
                q.text = `What is the measure of this angle in degrees?`;
                q.hint = `Compare to known angles: 90° is a right angle, 45° is half of that, 180° is a straight line`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Measure This Angle</div>
                    ${createAngleSVG(angle, 160, false, false)}
                    <div style="margin-top:10px;font-size:1.2rem;">? degrees</div>
                    <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
                        <span>Reference: 45° | 90° | 135° | 180°</span>
                    </div>
                </div>`;
                q.options = [30, 45, 60, 90, 120, 135, 150].filter(a => Math.abs(a - angle) <= 30 || a === angle);
                if (!q.options.includes(angle)) q.options.push(angle);
                q.options = [...new Set(q.options)].sort((a, b) => a - b).slice(0, 4);
                q.geometryData = { angle };
                q.printFormat = "geometry-measure-angle";
            } else if (geoSkill === "identify_lines") {
                // Identify lines - with clean, standardized visuals
                const lineTypes = ["parallel", "perpendicular", "intersecting"];
                const lineType = pick(lineTypes);
                
                // Randomly choose line style: lines (arrows both ends), rays (one arrow), segments (dots)
                const lineStyles = ["lines", "rays", "segments"];
                const lineStyle = pick(lineStyles);
                
                // Random orientation variation
                const orientations = ["horizontal", "diagonal1", "diagonal2", "vertical"];
                const orientation = pick(orientations);
                
                q.text = `What type of lines are shown?`;
                q.ans = lineType.charAt(0).toUpperCase() + lineType.slice(1);
                q.answerType = "choice";
                q.options = ["Parallel", "Perpendicular", "Intersecting"];
                q.hint = `Parallel lines never meet (∥), Perpendicular lines form 90° angles (⊥), Intersecting lines cross at a point`;
                
                // === STANDARDIZED VISUAL CONSTANTS ===
                const STROKE_WIDTH = 2;           // Consistent line weight
                const STROKE_COLOR = '#4a9eff';   // Clean blue color
                const ARROW_SIZE = 6;             // Small, proportional arrowheads
                const ENDPOINT_RADIUS = 3;        // Uniform endpoint dots
                const MARKER_COLOR = '#22c55e';   // Green for right angle/parallel markers
                const MARKER_WIDTH = 1.5;         // Thin marker lines
                
                // SVG viewBox centered at 80,50 with padding
                const svgWidth = 160;
                const svgHeight = 100;
                const cx = 80;  // Center x
                const cy = 50;  // Center y
                
                // Clean arrow markers with smaller, proportional heads
                const arrowMarker = `<defs>
                    <marker id="arrow-end" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="${ARROW_SIZE - 1}" refY="${ARROW_SIZE/2}" orient="auto">
                        <path d="M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE/2} L 0 ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.5" stroke-linejoin="round"/>
                    </marker>
                    <marker id="arrow-start" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="1" refY="${ARROW_SIZE/2}" orient="auto-start-reverse">
                        <path d="M ${ARROW_SIZE} 0 L 0 ${ARROW_SIZE/2} L ${ARROW_SIZE} ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.5" stroke-linejoin="round"/>
                    </marker>
                </defs>`;
                
                // Helper for clean endpoint dots
                const endpoint = (x, y) => `<circle cx="${x}" cy="${y}" r="${ENDPOINT_RADIUS}" fill="${STROKE_COLOR}"/>`;
                
                // Build line attributes based on style
                let lineAttrs = `stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round"`;
                if (lineStyle === "lines") {
                    lineAttrs += ' marker-end="url(#arrow-end)" marker-start="url(#arrow-start)"';
                } else if (lineStyle === "rays") {
                    lineAttrs += ' marker-end="url(#arrow-end)"';
                }
                
                let linesSvg = arrowMarker;
                let endpoints = '';
                let markers = ''; // For parallel/perpendicular indicators
                
                // Standard line length for consistency
                const lineLen = 55;
                const gap = 28; // Gap between parallel lines
                
                if (lineType === "parallel") {
                    if (orientation === "horizontal") {
                        // Two horizontal parallel lines, centered
                        const y1 = cy - gap/2;
                        const y2 = cy + gap/2;
                        const x1 = cx - lineLen/2;
                        const x2 = cx + lineLen/2;
                        
                        linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${x1}" y1="${y2}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(x1, y1) + endpoint(x2, y1) + endpoint(x1, y2) + endpoint(x2, y2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(x1, y1) + endpoint(x1, y2);
                        }
                        
                        // Parallel tick marks (small diagonal lines)
                        const tickX = cx;
                        markers = `<line x1="${tickX-3}" y1="${y1-4}" x2="${tickX+3}" y2="${y1+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX+5}" y1="${y1-4}" x2="${tickX+11}" y2="${y1+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX-3}" y1="${y2-4}" x2="${tickX+3}" y2="${y2+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX+5}" y1="${y2-4}" x2="${tickX+11}" y2="${y2+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
                                  
                    } else if (orientation === "vertical") {
                        // Two vertical parallel lines, centered
                        const x1 = cx - gap/2;
                        const x2 = cx + gap/2;
                        const y1 = cy - lineLen/2;
                        const y2 = cy + lineLen/2;
                        
                        linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(x1, y1) + endpoint(x1, y2) + endpoint(x2, y1) + endpoint(x2, y2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(x1, y2) + endpoint(x2, y2);
                        }
                        
                        // Parallel tick marks
                        const tickY = cy;
                        markers = `<line x1="${x1-4}" y1="${tickY-3}" x2="${x1+4}" y2="${tickY+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x1-4}" y1="${tickY+5}" x2="${x1+4}" y2="${tickY+11}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x2-4}" y1="${tickY-3}" x2="${x2+4}" y2="${tickY+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x2-4}" y1="${tickY+5}" x2="${x2+4}" y2="${tickY+11}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
                                  
                    } else {
                        // Diagonal parallel lines
                        const angle = orientation === "diagonal1" ? 25 : -25;
                        const rad = angle * Math.PI / 180;
                        const dx = lineLen * Math.cos(rad) / 2;
                        const dy = lineLen * Math.sin(rad) / 2;
                        
                        // Perpendicular offset for second line
                        const offsetX = gap * Math.sin(rad) * (angle > 0 ? -1 : 1);
                        const offsetY = gap * Math.cos(rad);
                        
                        linesSvg += `<line x1="${cx - dx}" y1="${cy - dy - offsetY/2}" x2="${cx + dx}" y2="${cy + dy - offsetY/2}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - dx}" y1="${cy - dy + offsetY/2}" x2="${cx + dx}" y2="${cy + dy + offsetY/2}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - dx, cy - dy - offsetY/2) + endpoint(cx + dx, cy + dy - offsetY/2) +
                                       endpoint(cx - dx, cy - dy + offsetY/2) + endpoint(cx + dx, cy + dy + offsetY/2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - dx, cy - dy - offsetY/2) + endpoint(cx - dx, cy - dy + offsetY/2);
                        }
                    }
                    
                } else if (lineType === "perpendicular") {
                    if (orientation === "horizontal" || orientation === "vertical") {
                        // Standard perpendicular (one horizontal, one vertical) centered
                        const halfLen = lineLen / 2;
                        
                        linesSvg += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx}" y1="${cy - halfLen}" x2="${cx}" y2="${cy + halfLen}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx + halfLen, cy) +
                                       endpoint(cx, cy - halfLen) + endpoint(cx, cy + halfLen);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx, cy + halfLen);
                        }
                        
                        // Right angle square marker (small, precise)
                        const sq = 8;
                        markers = `<path d="M ${cx + sq} ${cy} L ${cx + sq} ${cy - sq} L ${cx} ${cy - sq}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
                        
                    } else {
                        // Rotated perpendicular (45 degrees)
                        const halfLen = lineLen / 2;
                        const diag = halfLen * 0.707; // cos(45°) = sin(45°) ≈ 0.707
                        
                        linesSvg += `<line x1="${cx - diag}" y1="${cy - diag}" x2="${cx + diag}" y2="${cy + diag}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx + diag}" y1="${cy - diag}" x2="${cx - diag}" y2="${cy + diag}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - diag, cy - diag) + endpoint(cx + diag, cy + diag) +
                                       endpoint(cx + diag, cy - diag) + endpoint(cx - diag, cy + diag);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - diag, cy - diag) + endpoint(cx + diag, cy - diag);
                        }
                        
                        // Rotated right angle marker
                        const sq = 7;
                        markers = `<path d="M ${cx + sq} ${cy} L ${cx} ${cy - sq}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <path d="M ${cx} ${cy - sq} L ${cx - sq} ${cy}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}" stroke-dasharray="0"/>
                                  <rect x="${cx - 3}" y="${cy - 3}" width="6" height="6" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}" transform="rotate(45, ${cx}, ${cy})"/>`;
                    }
                    
                } else {
                    // Intersecting (not perpendicular) - cross at non-90° angle
                    if (orientation === "diagonal1" || orientation === "diagonal2") {
                        // X-shape intersection
                        const angle1 = 30;
                        const angle2 = -50;
                        const rad1 = angle1 * Math.PI / 180;
                        const rad2 = angle2 * Math.PI / 180;
                        const halfLen = lineLen / 2;
                        
                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad1)}" y1="${cy - halfLen * Math.sin(rad1)}" 
                                          x2="${cx + halfLen * Math.cos(rad1)}" y2="${cy + halfLen * Math.sin(rad1)}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad2)}" y1="${cy - halfLen * Math.sin(rad2)}" 
                                          x2="${cx + halfLen * Math.cos(rad2)}" y2="${cy + halfLen * Math.sin(rad2)}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                                       endpoint(cx + halfLen * Math.cos(rad1), cy + halfLen * Math.sin(rad1)) +
                                       endpoint(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2)) +
                                       endpoint(cx + halfLen * Math.cos(rad2), cy + halfLen * Math.sin(rad2));
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                                       endpoint(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2));
                        }
                        
                    } else {
                        // One horizontal, one diagonal
                        const halfLen = lineLen / 2;
                        const angle = 55;
                        const rad = angle * Math.PI / 180;
                        
                        linesSvg += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad)}" y1="${cy + halfLen * Math.sin(rad)}" 
                                          x2="${cx + halfLen * Math.cos(rad)}" y2="${cy - halfLen * Math.sin(rad)}" ${lineAttrs}/>`;
                        
                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx + halfLen, cy) +
                                       endpoint(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad)) +
                                       endpoint(cx + halfLen * Math.cos(rad), cy - halfLen * Math.sin(rad));
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen, cy) +
                                       endpoint(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad));
                        }
                    }
                }
                
                // Add endpoints and markers
                linesSvg += endpoints + markers;
                
                // Line style label
                const styleLabel = lineStyle === "lines" ? "Lines" : lineStyle === "rays" ? "Rays" : "Line Segments";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:0.95rem;">📐 Identify These ${styleLabel}</div>
                    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">${linesSvg}</svg>
                </div>`;
                q.geometryData = { lineType, lineStyle, orientation };
                q.printFormat = "geometry-lines";
            } else if (geoSkill === "symmetry") {
                // Lines of symmetry
                const shapes = [
                    { name: "square", lines: 4 },
                    { name: "rectangle", lines: 2 },
                    { name: "equilateral triangle", lines: 3 },
                    { name: "isosceles triangle", lines: 1 },
                    { name: "regular hexagon", lines: 6 }
                ];
                const shape = pick(shapes);
                
                q.text = `How many lines of symmetry does this shape have?`;
                q.ans = shape.lines;
                q.hint = `A line of symmetry divides a shape into two identical halves. This is a ${shape.name}.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Lines of Symmetry</div>
                    ${createShapeSVG(shape.name, false)}
                    <div style="margin-top:10px;font-size:1.1rem;text-transform:capitalize;font-weight:600;">${shape.name}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:5px;">Count the lines that divide this shape into matching halves</div>
                </div>`;
                q.options = buildNumericOptions(shape.lines);
                q.geometryData = { shape: shape.name, lines: shape.lines };
                q.printFormat = "geometry-symmetry";
            } else if (geoSkill === "coordinate_graph" || geoSkill === "coordinate_q1" || geoSkill === "coordinate_all") {
                // Coordinate graphing with multiple modes
                // Determine quadrant mode based on skill selection
                let quadrantMode;
                if (geoSkill === "coordinate_q1") {
                    quadrantMode = "quadrant1";
                } else if (geoSkill === "coordinate_all") {
                    quadrantMode = "all_quadrants";
                } else {
                    // Mixed - random
                    quadrantMode = pick(["quadrant1", "all_quadrants"]);
                }
                const problemType = pick(["identify", "plot"]);
                const numPoints = rng(1, 3);
                
                // Generate points based on quadrant mode
                const points = [];
                const usedCoords = new Set();
                for (let p = 0; p < numPoints; p++) {
                    let x, y;
                    do {
                        if (quadrantMode === "quadrant1") {
                            x = rng(1, 10);
                            y = rng(1, 10);
                        } else {
                            x = rng(-5, 5);
                            y = rng(-5, 5);
                        }
                    } while (usedCoords.has(`${x},${y}`) || (x === 0 && y === 0));
                    usedCoords.add(`${x},${y}`);
                    points.push({ x, y, label: String.fromCharCode(65 + p) }); // A, B, C
                }
                
                // Build answers
                const answers = points.map(p => `(${p.x}, ${p.y})`);
                q.ans = answers.join(', ');
                q.answerType = "coordinate-multi";
                q.coordinateData = { points, quadrantMode, problemType };
                
                // Grid setup based on quadrant mode
                const gridSize = quadrantMode === "quadrant1" ? 220 : 240;
                const gridSpacing = 20;
                const origin = quadrantMode === "quadrant1" ? { x: 20, y: gridSize - 20 } : { x: gridSize / 2, y: gridSize / 2 };
                const maxCoord = quadrantMode === "quadrant1" ? 10 : 5;
                
                // Build SVG grid
                let gridLines = '';
                let axisLabels = '';
                
                if (quadrantMode === "quadrant1") {
                    // Quadrant 1 only - positive x and y
                    for (let i = 0; i <= 10; i++) {
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#ddd" stroke-width="1"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                        if (i % 2 === 0) {
                            axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="10">${i}</text>`;
                            if (i > 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="10">${i}</text>`;
                        }
                    }
                } else {
                    // All quadrants
                    for (let i = -5; i <= 5; i++) {
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#ddd" stroke-width="1"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                        if (i !== 0 && Math.abs(i) % 2 !== 0 || i === 0) {
                            axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="9">${i}</text>`;
                            if (i !== 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="9">${i}</text>`;
                        }
                    }
                }
                
                // Build points SVG (for identify mode) or empty circles (for plot mode)
                let pointsSVG = '';
                points.forEach((p, idx) => {
                    const px = origin.x + p.x * gridSpacing;
                    const py = origin.y - p.y * gridSpacing;
                    const colors = ['#e53935', '#43a047', '#1e88e5'];
                    if (problemType === "identify") {
                        // Show the points, student identifies coordinates
                        pointsSVG += `<circle cx="${px}" cy="${py}" r="7" fill="${colors[idx]}"/>`;
                        // Position label to not overlap with point - offset based on quadrant
                        const labelOffsetX = p.x >= 0 ? 12 : -12;
                        const labelOffsetY = p.y >= 0 ? -10 : 15;
                        pointsSVG += `<text x="${px + labelOffsetX}" y="${py + labelOffsetY}" fill="${colors[idx]}" font-size="14" font-weight="bold" text-anchor="${p.x >= 0 ? 'start' : 'end'}">${p.label}</text>`;
                    } else {
                        // Plot mode - show empty target circles
                        pointsSVG += `<circle cx="${px}" cy="${py}" r="8" fill="none" stroke="${colors[idx]}" stroke-width="2" stroke-dasharray="4,2"/>`;
                        pointsSVG += `<text x="${px + 12}" y="${py - 8}" fill="${colors[idx]}" font-size="12" font-weight="bold">${p.label}</text>`;
                    }
                });
                
                // Build answer input area
                let answerInputs = '';
                if (problemType === "identify") {
                    q.text = numPoints === 1 
                        ? `What are the coordinates of point ${points[0].label}?`
                        : `What are the coordinates of each point?`;
                    q.hint = `Read the x-coordinate (horizontal) first, then y-coordinate (vertical). Format: (x, y)`;
                    
                    answerInputs = `<div style="margin-top:15px;text-align:left;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:10px;padding:8px;background:var(--bg-card);border-radius:6px;">
                            📝 <strong>Format:</strong> (x, y) &nbsp; Example: (3, 5)
                        </div>
                        ${points.map((p, idx) => `
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                                <span style="font-weight:700;color:${['#e53935', '#43a047', '#1e88e5'][idx]};min-width:20px;">${p.label}:</span>
                                <input type="text" id="coordInput_${idx}" class="coord-answer-input" placeholder="(x, y)" 
                                    style="flex:1;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:var(--bg-card);">
                            </div>
                        `).join('')}
                    </div>`;
                } else {
                    // Plot mode
                    const coordList = points.map(p => `${p.label}: (${p.x}, ${p.y})`).join(', ');
                    q.text = numPoints === 1 
                        ? `Plot point ${points[0].label} at (${points[0].x}, ${points[0].y})`
                        : `Plot these points: ${coordList}`;
                    q.hint = `Find the x-value on the horizontal axis, then go up/down to the y-value. Mark each point with a dot.`;
                    
                    answerInputs = `<div style="margin-top:15px;text-align:center;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">
                            🎯 Points to plot: <strong>${coordList}</strong>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-dim);padding:8px;background:var(--bg-card);border-radius:6px;display:inline-block;">
                            💡 Find x on horizontal axis, then move up/down to y
                        </div>
                    </div>`;
                }
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📐 Coordinate ${quadrantMode === "quadrant1" ? "(Quadrant I)" : "(All Quadrants)"}</div>
                    <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                        ${gridLines}
                        <!-- Axes -->
                        <line x1="${quadrantMode === "quadrant1" ? origin.x : 10}" y1="${origin.y}" x2="${gridSize - 10}" y2="${origin.y}" stroke="currentColor" stroke-width="2"/>
                        <line x1="${origin.x}" y1="${quadrantMode === "quadrant1" ? gridSize - 10 : 10}" x2="${origin.x}" y2="10" stroke="currentColor" stroke-width="2"/>
                        <!-- Axis labels -->
                        ${axisLabels}
                        <text x="${gridSize - 8}" y="${origin.y - 8}" fill="currentColor" font-size="12" font-weight="bold">x</text>
                        <text x="${origin.x + 8}" y="18" fill="currentColor" font-size="12" font-weight="bold">y</text>
                        <!-- Points -->
                        ${pointsSVG}
                    </svg>
                    ${answerInputs}
                </div>`;
                q.geometryData = { points, quadrantMode, problemType, mode: problemType };
                q.printFormat = "geometry-coordinates";
            } else if (geoSkill === "classify_triangles") {
                // Classify triangles
                const types = [
                    { name: "equilateral", desc: "3 equal sides, 3 equal angles (60°)" },
                    { name: "isosceles", desc: "2 equal sides, 2 equal angles" },
                    { name: "scalene", desc: "no equal sides, no equal angles" },
                    { name: "right", desc: "one 90° angle" },
                    { name: "acute", desc: "all angles less than 90°" },
                    { name: "obtuse", desc: "one angle greater than 90°" }
                ];
                const byWhat = pick(["sides", "angles"]);
                const triType = byWhat === "sides" ? pick(types.slice(0, 3)) : pick(types.slice(3));
                
                q.text = `What type of triangle is shown?`;
                q.ans = triType.name.charAt(0).toUpperCase() + triType.name.slice(1);
                q.answerType = "choice";
                q.options = byWhat === "sides" ? ["Equilateral", "Isosceles", "Scalene"] : ["Right", "Acute", "Obtuse"];
                q.hint = `${triType.name.charAt(0).toUpperCase() + triType.name.slice(1)}: ${triType.desc}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Classify This Triangle</div>
                    ${createTriangleSVG(triType.name, 0, 0, false, false)}
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">
                        Classify by ${byWhat}: ${byWhat === "sides" ? "equal sides count" : "angle types"}
                    </div>
                </div>`;
                q.geometryData = { triType: triType.name, byWhat };
                q.printFormat = "geometry-triangles";
            } else if (geoSkill === "classify_quads") {
                // Classify quadrilaterals
                const quads = [
                    { name: "square", desc: "4 equal sides, 4 right angles" },
                    { name: "rectangle", desc: "opposite sides equal, 4 right angles" },
                    { name: "rhombus", desc: "4 equal sides, opposite angles equal" },
                    { name: "parallelogram", desc: "2 pairs of parallel sides" },
                    { name: "trapezoid", desc: "exactly 1 pair of parallel sides" }
                ];
                const quad = pick(quads);
                
                q.text = `What type of quadrilateral is shown?`;
                q.ans = quad.name.charAt(0).toUpperCase() + quad.name.slice(1);
                q.answerType = "choice";
                q.options = ["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezoid"];
                q.hint = `${quad.name.charAt(0).toUpperCase() + quad.name.slice(1)}: ${quad.desc}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📐 Classify This Quadrilateral</div>
                    ${createShapeSVG(quad.name, false)}
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">
                        Look at the sides and angles to identify this shape.
                    </div>
                </div>`;
                q.geometryData = { quad: quad.name };
                q.printFormat = "geometry-quads";
            } else if (geoSkill === "area_perimeter") {
                // Combined Area AND Perimeter
                const shapeType = pick(["rectangle", "square"]);
                let length, width, area, perimeter;
                
                if (shapeType === "rectangle") {
                    length = rng(4, 14);
                    width = rng(3, Math.min(length - 1, 10));
                    area = length * width;
                    perimeter = 2 * (length + width);
                    q.geometryData = { shape: 'rectangle', length, width, area, perimeter };
                } else {
                    const side = rng(3, 12);
                    length = side;
                    width = side;
                    area = side * side;
                    perimeter = 4 * side;
                    q.geometryData = { shape: 'square', side, area, perimeter };
                }
                
                q.text = `Find BOTH the perimeter AND area of this shape.`;
                q.answerType = "dual"; // Special type for dual answers
                q.dualAnswers = { perimeter, area };
                q.ans = `P=${perimeter}, A=${area}`;
                q.hint = `Perimeter = distance around (add all sides). Area = space inside (length × width)`;
                
                q.visual = `<div style="text-align:center;">
                    ${createLabeledRectSVG(length, width, false)}
                    <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                            <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter" 
                                style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                            <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Perimeter Hint</button>
                        </div>
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                            <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                            <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Area Hint</button>
                        </div>
                    </div>
                </div>`;
                q.perimeterHint = `Perimeter = 2 × (${length} + ${width}) = 2 × ${length + width}`;
                q.areaHint = `Area = ${length} × ${width}`;
                q.printFormat = "geometry-area-perimeter";
            } else if (geoSkill === "composite_shapes") {
                // Composite shapes (L-shapes, T-shapes)
                const shapeType = pick(["L", "T"]);
                
                if (shapeType === "L") {
                    // L-shape
                    const topWidth = rng(2, 5);
                    const topHeight = rng(3, 6);
                    const bottomWidth = rng(topWidth + 2, topWidth + 5);
                    const totalHeight = topHeight + rng(2, 4);
                    const bottomHeight = totalHeight - topHeight;
                    
                    // Area = top rectangle + bottom extension
                    const area = (topWidth * topHeight) + (bottomWidth * bottomHeight);
                    // Perimeter = all outer edges
                    const perimeter = topWidth + topHeight + (bottomWidth - topWidth) + bottomHeight + bottomWidth + totalHeight;
                    
                    q.geometryData = { 
                        shapeType: 'L',
                        dims: { topWidth, topHeight, bottomWidth, totalHeight },
                        area, perimeter 
                    };
                    
                    q.text = `Find BOTH the perimeter AND area of this L-shape.`;
                    q.answerType = "dual";
                    q.dualAnswers = { perimeter, area };
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.hint = `Break into rectangles. Area = sum of parts. Perimeter = all outer edges.`;
                    
                    q.visual = `<div style="text-align:center;">
                        ${createLShapeSVG({ topWidth, topHeight, bottomWidth, totalHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter" 
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Area Hint</button>
                            </div>
                        </div>
                    </div>`;
                    q.perimeterHint = `Add all outer edges: ${topWidth} + ${topHeight} + ${bottomWidth - topWidth} + ${bottomHeight} + ${bottomWidth} + ${totalHeight}`;
                    q.areaHint = `Split into 2 rectangles: (${topWidth} × ${topHeight}) + (${bottomWidth} × ${bottomHeight})`;
                } else {
                    // T-shape
                    const topWidth = rng(6, 10);
                    const topHeight = rng(2, 4);
                    const stemWidth = rng(2, Math.floor(topWidth / 2));
                    const stemHeight = rng(3, 6);
                    
                    const area = (topWidth * topHeight) + (stemWidth * stemHeight);
                    const perimeter = topWidth + topHeight + ((topWidth - stemWidth) / 2) + stemHeight + stemWidth + stemHeight + ((topWidth - stemWidth) / 2) + topHeight;
                    
                    q.geometryData = { 
                        shapeType: 'T',
                        dims: { topWidth, topHeight, stemWidth, stemHeight },
                        area, perimeter 
                    };
                    
                    q.text = `Find BOTH the perimeter AND area of this T-shape.`;
                    q.answerType = "dual";
                    q.dualAnswers = { perimeter, area };
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.hint = `Break into rectangles. Area = sum of parts. Perimeter = all outer edges.`;
                    
                    q.visual = `<div style="text-align:center;">
                        ${createTShapeSVG({ topWidth, topHeight, stemWidth, stemHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter" 
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">💡 Area Hint</button>
                            </div>
                        </div>
                    </div>`;
                    q.perimeterHint = `Add all outer edges around the T shape`;
                    q.areaHint = `Split into 2 rectangles: (${topWidth} × ${topHeight}) + (${stemWidth} × ${stemHeight})`;
                }
                q.printFormat = "geometry-composite";
            } else if (geoSkill === "area_word_problems") {
                // Area word problems
                const contexts = [
                    { item: "garden", action: "cover with mulch", unit: "meters", unitSq: "square meters" },
                    { item: "poster", action: "cover with paper", unit: "meters", unitSq: "square meters" },
                    { item: "room", action: "carpet", unit: "feet", unitSq: "square feet" },
                    { item: "wall", action: "paint", unit: "meters", unitSq: "square meters" },
                    { item: "table", action: "cover with a tablecloth", unit: "feet", unitSq: "square feet" },
                    { item: "pool cover", action: "need", unit: "meters", unitSq: "square meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(4, 12);
                const width = rng(2, 8);
                const area = length * width;
                
                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${ctx.unitSq} do you need to ${ctx.action}?`;
                q.ans = area;
                q.hint = `This is an AREA problem (covering a surface). Area = length × width = ${length} × ${width}`;
                
                q.visual = `<div style="text-align:center;">
                    ${createWordProblemShapeSVG(length, width, false, false)}
                    <div style="margin-top:15px;background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:350px;margin-left:auto;margin-right:auto;">
                        <div style="font-weight:700;margin-bottom:10px;">📝 What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" checked style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>
                        <div style="font-weight:700;margin-bottom:5px;">Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., ${area} ${ctx.unitSq}" 
                            style="width:100%;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:white;">
                    </div>
                </div>`;
                q.answerType = "word_problem";
                q.expectedType = "area";
                q.expectedUnit = ctx.unitSq;
                q.geometryData = { length, width, area, context: ctx };
                q.printFormat = "geometry-word-area";
            } else if (geoSkill === "perimeter_word_problems") {
                // Perimeter word problems
                const contexts = [
                    { item: "garden", action: "fence around", unit: "meters", unitLin: "meters" },
                    { item: "picture frame", action: "put trim around", unit: "inches", unitLin: "inches" },
                    { item: "playground", action: "put a fence around", unit: "meters", unitLin: "meters" },
                    { item: "room", action: "put baseboard around", unit: "feet", unitLin: "feet" },
                    { item: "pool", action: "put tiles around the edge of", unit: "meters", unitLin: "meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(5, 15);
                const width = rng(3, 10);
                const perimeter = 2 * (length + width);
                
                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${ctx.unitLin} of material do you need to ${ctx.action}?`;
                q.ans = perimeter;
                q.hint = `This is a PERIMETER problem (going around the edge). Perimeter = 2 × (length + width) = 2 × (${length} + ${width})`;
                
                q.visual = `<div style="text-align:center;">
                    ${createWordProblemShapeSVG(length, width, false, false)}
                    <div style="margin-top:15px;background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:350px;margin-left:auto;margin-right:auto;">
                        <div style="font-weight:700;margin-bottom:10px;">📝 What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" checked style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>
                        <div style="font-weight:700;margin-bottom:5px;">Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., ${perimeter} ${ctx.unitLin}" 
                            style="width:100%;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:white;">
                    </div>
                </div>`;
                q.answerType = "word_problem";
                q.expectedType = "perimeter";
                q.expectedUnit = ctx.unitLin;
                q.geometryData = { length, width, perimeter, context: ctx };
                q.printFormat = "geometry-word-perimeter";
            } else if (geoSkill === "area_perimeter_word") {
                // Scaffolded word problem (like Image 3)
                const contexts = [
                    { item: "poster", action: "cover", edgeAction: "frame", unit: "meters" },
                    { item: "garden", action: "cover with grass", edgeAction: "fence", unit: "meters" },
                    { item: "room", action: "carpet", edgeAction: "put baseboard around", unit: "feet" },
                    { item: "pool", action: "cover", edgeAction: "tile around", unit: "meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(4, 12);
                const width = rng(2, 8);
                const area = length * width;
                const perimeter = 2 * (length + width);
                
                // Randomly choose whether to ask for area or perimeter
                const askFor = pick(["area", "perimeter"]);
                const correctAnswer = askFor === "area" ? area : perimeter;
                const unitLabel = askFor === "area" ? `square ${ctx.unit}` : ctx.unit;
                const actionText = askFor === "area" ? ctx.action : ctx.edgeAction;
                
                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${unitLabel} of material do you need to ${actionText}?`;
                q.ans = correctAnswer;
                
                q.visual = `<div style="text-align:center;">
                    <div style="background:var(--bg-card);padding:15px;border-radius:10px;margin-bottom:15px;text-align:left;max-width:400px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:1.1rem;line-height:1.6;">${q.text}</div>
                    </div>
                    
                    ${createWordProblemShapeSVG(length, width, true, false)}
                    
                    <div style="background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:380px;margin:15px auto;">
                        <div style="font-weight:700;margin-bottom:10px;">📏 Label the shape (what are the dimensions?):</div>
                        <div style="display:flex;gap:10px;margin-bottom:15px;">
                            <button class="dimension-btn" onclick="this.classList.toggle('selected')" style="padding:8px 20px;border:2px solid var(--accent-cyan);border-radius:8px;background:white;cursor:pointer;font-weight:600;">Length</button>
                            <button class="dimension-btn" onclick="this.classList.toggle('selected')" style="padding:8px 20px;border:2px solid var(--accent-cyan);border-radius:8px;background:white;cursor:pointer;font-weight:600;">Width</button>
                        </div>
                        
                        <div style="font-weight:700;margin-bottom:10px;">🤔 What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" ${askFor === 'area' ? '' : ''} style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" ${askFor === 'perimeter' ? '' : ''} style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>
                        
                        <div style="font-weight:700;margin-bottom:5px;">✏️ Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., 20 ${unitLabel}" 
                            style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:white;">
                            
                        <button class="hint-btn-small" onclick="showWordProblemHint()" style="margin-top:10px;width:100%;padding:10px;font-size:1rem;">💡 Need Help?</button>
                    </div>
                </div>`;
                
                q.answerType = "scaffolded_word";
                q.expectedType = askFor;
                q.expectedUnit = unitLabel;
                q.hint = askFor === "area" 
                    ? `Area = length × width = ${length} × ${width}. Remember to include "square ${ctx.unit}"!`
                    : `Perimeter = 2 × (length + width) = 2 × (${length} + ${width}). Remember to include "${ctx.unit}"!`;
                q.geometryData = { length, width, area, perimeter, askFor, context: ctx };
                q.printFormat = "geometry-word-scaffolded";
            }
            break;
        }
        case "measurement": {
            // Measurement Category - Expanded Time Skills
            const allTimeSkills = ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                                  'time_analog_digital', 'time_match_clock',
                                  'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                                  'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard'];
            const allMeasSkills = [...allTimeSkills, 'money', 'temperature', 'capacity'];
            
            let measSkill = mappedSkill;
            if (mappedSkill === "mixed" || mappedSkill === "mixed_measurement") {
                measSkill = pick(allMeasSkills);
            } else if (mappedSkill === "mixed_time") {
                measSkill = pick(allTimeSkills);
            } else if (mappedSkill === "tell_time") {
                // Legacy mapping
                measSkill = pick(['time_hour', 'time_half_hour', 'time_quarter', 'time_5min']);
            } else if (mappedSkill === "clock_conversion") {
                measSkill = 'time_analog_digital';
            } else if (mappedSkill === "elapsed_time") {
                measSkill = pick(['elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed']);
            }
            
            const colorScheme = pick(['blue', 'purple', 'green', 'cyan', 'orange']);
            
            // ===== TIME TO THE HOUR =====
            if (measSkill === "time_hour") {
                const hour = rng(1, 12);
                const minute = 0;
                const timeStr = formatTime(hour, minute);
                
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The short hand (hour hand) points to ${hour}. The long hand points to 12, which means ${minute} minutes.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Time to the Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 160, colorScheme })}
                </div>`;
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_hour' };
                q.printFormat = "measurement-time";
            }
            
            // ===== TIME TO HALF HOUR =====
            else if (measSkill === "time_half_hour") {
                const hour = rng(1, 12);
                const minute = pick([0, 30]);
                const timeStr = formatTime(hour, minute);
                
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = minute === 0 
                    ? `The long hand at 12 means o'clock (${minute} minutes).`
                    : `The long hand at 6 means half past (30 minutes).`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Time to Half Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 160, colorScheme })}
                </div>`;
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_half_hour' };
                q.printFormat = "measurement-time";
            }
            
            // ===== TIME TO QUARTER HOUR =====
            else if (measSkill === "time_quarter") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45]);
                const timeStr = formatTime(hour, minute);
                
                const minuteHints = {
                    0: "at 12 means o'clock",
                    15: "at 3 means quarter past (15 minutes)",
                    30: "at 6 means half past (30 minutes)",
                    45: "at 9 means quarter to (45 minutes)"
                };
                
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The long hand ${minuteHints[minute]}.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Time to Quarter Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 160, colorScheme })}
                </div>`;
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_quarter' };
                q.printFormat = "measurement-time";
            }
            
            // ===== TIME TO 5 MINUTES =====
            else if (measSkill === "time_5min") {
                const hour = rng(1, 12);
                const minute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
                const timeStr = formatTime(hour, minute);
                
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `Count by 5s from 12. The long hand is at ${minute === 0 ? 12 : minute / 5}, which is ${minute} minutes.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Time to 5 Minutes</div>
                    ${createMagnifiableClock(hour, minute, { size: 160, colorScheme, showMinuteTicks: true })}
                </div>`;
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_5min' };
                q.printFormat = "measurement-time";
            }
            
            // ===== TIME TO THE MINUTE =====
            else if (measSkill === "time_1min") {
                const hour = rng(1, 12);
                const minute = rng(0, 59);
                const timeStr = formatTime(hour, minute);
                
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The hour hand is near ${hour}. Count each small tick mark for minutes: ${minute} minutes.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Time to the Minute</div>
                    ${createMagnifiableClock(hour, minute, { size: 160, colorScheme, showMinuteTicks: true })}
                </div>`;
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_1min' };
                q.printFormat = "measurement-time";
            }
            
            // ===== ANALOG TO DIGITAL MATCHING =====
            else if (measSkill === "time_analog_digital") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
                const timeStr = formatTime(hour, minute);
                const direction = pick(['analog_to_digital', 'digital_to_analog']);
                
                if (direction === 'analog_to_digital') {
                    // Show analog clock, pick digital answer
                    q.text = `Which digital clock shows the same time?`;
                    q.ans = timeStr;
                    q.answerType = "text";
                    q.hint = `Read the analog clock: hour hand near ${hour}, minute hand at ${minute === 0 ? 12 : minute / 5 || minute}.`;
                    
                    // Create wrong digital options
                    const wrongTime1 = addTime(hour, minute, 1, 0);
                    const wrongTime2 = addTime(hour, minute, 0, 15);
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Analog → Digital</div>
                        <div style="margin-bottom:20px;">
                            ${createMagnifiableClock(hour, minute, { size: 150, colorScheme })}
                        </div>
                        <div style="font-weight:600;margin-bottom:15px;color:var(--text-dim);">Which digital clock shows the same time?</div>
                        <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
                            ${createDigitalClockHTML(hour, minute, { colorScheme: 'yellow', size: 'medium' })}
                            ${createDigitalClockHTML(wrongTime1.hour, wrongTime1.minute, { colorScheme: 'yellow', size: 'medium' })}
                        </div>
                    </div>`;
                } else {
                    // Show digital clock, pick analog answer
                    q.text = `Which analog clock shows ${timeStr}?`;
                    q.ans = timeStr;
                    q.answerType = "text";
                    q.hint = `The digital clock shows ${hour}:${minute.toString().padStart(2, '0')}. Find the analog clock with hour hand near ${hour}.`;
                    
                    const wrongHour = hour === 12 ? 1 : hour + 1;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Digital → Analog</div>
                        <div style="margin-bottom:20px;">
                            ${createDigitalClockHTML(hour, minute, { colorScheme: 'yellow', size: 'large' })}
                        </div>
                        <div style="font-weight:600;margin-bottom:15px;color:var(--text-dim);">Which clock shows this time?</div>
                        <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
                            ${createClockChoiceWithMagnify(hour, minute, 'blue', timeStr, 130)}
                            ${createClockChoiceWithMagnify(wrongHour, minute, 'purple', formatTime(wrongHour, minute), 130)}
                        </div>
                    </div>`;
                }
                
                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, direction, skill: 'time_analog_digital' };
                q.printFormat = "measurement-clock-match";
            }
            
            // ===== MATCH TIME TO CLOCK =====
            else if (measSkill === "time_match_clock") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
                const timeStr = formatTime(hour, minute);
                const timeWords = timeToWords(hour, minute);
                
                // Create a wrong clock
                const wrongOptions = [
                    { h: hour === 12 ? 1 : hour + 1, m: minute }, // Off by 1 hour
                    { h: hour, m: (minute + 30) % 60 }, // Off by 30 min
                    { h: Math.floor(minute / 5) || 12, m: hour * 5 } // Swapped hands
                ];
                const wrong = pick(wrongOptions);
                
                q.text = `Which clock shows ${timeWords}?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `${timeWords} means ${timeStr}. Look for the clock with hour hand near ${hour}.`;
                
                // Randomize order
                const clocksData = shuffle([
                    { h: hour, m: minute, correct: true },
                    { h: wrong.h, m: wrong.m, correct: false }
                ]);
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🕐 Match Time to Clock</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:20px;color:var(--accent-cyan);">"${timeWords}"</div>
                    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
                        ${clocksData.map((c, i) => 
                            createClockChoiceWithMagnify(c.h, c.m, i === 0 ? 'blue' : 'purple', formatTime(c.h, c.m), 140)
                        ).join('')}
                    </div>
                </div>`;
                
                q.options = [formatTime(clocksData[0].h, clocksData[0].m), formatTime(clocksData[1].h, clocksData[1].m)];
                q.measurementData = { hour, minute, timeStr, timeWords, skill: 'time_match_clock' };
                q.printFormat = "measurement-clock-match";
            }
            
            // ===== ELAPSED TIME - 30 MINUTES =====
            else if (measSkill === "elapsed_30min") {
                const startHour = rng(1, 11);
                const startMin = pick([0, 30]);
                const direction = pick(['forward', 'backward']);
                
                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, 0, 30);
                    questionText = `What time will it be in 30 minutes?`;
                } else {
                    result = subtractTime(startHour, startMin, 0, 30);
                    questionText = `What time was it 30 minutes ago?`;
                }
                
                const startStr = formatTime(startHour, startMin);
                const answerStr = formatTime(result.hour, result.minute);
                
                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = direction === 'forward' 
                    ? `Move the minute hand halfway around the clock (30 minutes).`
                    : `Move the minute hand backward halfway around the clock.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (+/- 30 min)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 150, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} 30 minutes</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;
                
                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: 0, minutes: 30 }, skill: 'elapsed_30min' };
                q.printFormat = "measurement-elapsed";
            }
            
            // ===== ELAPSED TIME - HOURS =====
            else if (measSkill === "elapsed_hour") {
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                const direction = pick(['forward', 'backward']);
                
                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, elapsedHours, 0);
                    questionText = `What time will it be in ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}?`;
                } else {
                    result = subtractTime(startHour, startMin, elapsedHours, 0);
                    questionText = `What time was it ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} ago?`;
                }
                
                const startStr = formatTime(startHour, startMin);
                const answerStr = formatTime(result.hour, result.minute);
                
                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `The minute hand stays the same. ${direction === 'forward' ? 'Add' : 'Subtract'} ${elapsedHours} to the hour.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Hours)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 150, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;
                
                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: elapsedHours, minutes: 0 }, skill: 'elapsed_hour' };
                q.printFormat = "measurement-elapsed";
            }
            
            // ===== ELAPSED TIME - 15 MINUTES =====
            else if (measSkill === "elapsed_15min") {
                const startHour = rng(1, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedMin = pick([15, 30, 45]);
                const direction = pick(['forward', 'backward']);
                
                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, 0, elapsedMin);
                    questionText = `What time will it be in ${elapsedMin} minutes?`;
                } else {
                    result = subtractTime(startHour, startMin, 0, elapsedMin);
                    questionText = `What time was it ${elapsedMin} minutes ago?`;
                }
                
                const answerStr = formatTime(result.hour, result.minute);
                
                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `${elapsedMin} minutes = ${elapsedMin / 15} quarter${elapsedMin > 15 ? 's' : ''} of the clock.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Minutes)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 150, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} ${elapsedMin} minutes</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;
                
                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: 0, minutes: elapsedMin }, skill: 'elapsed_15min' };
                q.printFormat = "measurement-elapsed";
            }
            
            // ===== ELAPSED TIME - MIXED (HOURS AND MINUTES) =====
            else if (measSkill === "elapsed_mixed") {
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 3);
                const elapsedMin = pick([15, 30, 45]);
                
                const result = addTime(startHour, startMin, elapsedHours, elapsedMin);
                const answerStr = formatTime(result.hour, result.minute);
                
                q.text = `What time will it be in ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} and ${elapsedMin} minutes?`;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `First add ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}, then add ${elapsedMin} minutes.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Hours & Minutes)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 150, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">+ ${elapsedHours} hr ${elapsedMin} min</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;
                
                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, elapsed: { hours: elapsedHours, minutes: elapsedMin }, skill: 'elapsed_mixed' };
                q.printFormat = "measurement-elapsed";
            }
            
            // ===== FIND THE DURATION =====
            else if (measSkill === "elapsed_find_duration") {
                const startHour = rng(8, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                const elapsedMin = pick([0, 15, 30, 45]);
                
                const end = addTime(startHour, startMin, elapsedHours, elapsedMin);
                const startAMPM = 'A.M.';
                const endAMPM = end.hour >= 12 ? 'P.M.' : 'A.M.';
                
                const totalMinutes = elapsedHours * 60 + elapsedMin;
                
                q.text = `Find the elapsed time.`;
                q.ans = totalMinutes;
                q.hint = `Count the hours first, then add the minutes. Total = ${elapsedHours} × 60 + ${elapsedMin} = ${totalMinutes} minutes.`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Find the Duration</div>
                    <div style="display:inline-block;background:linear-gradient(135deg, #f3e5f5, #e8f5e9);padding:20px 30px;border-radius:12px;border:2px solid #ce93d8;margin-bottom:20px;">
                        <div style="font-size:1.1rem;margin-bottom:8px;"><b>Start:</b> ${formatTime(startHour, startMin)} ${startAMPM}</div>
                        <div style="font-size:1.1rem;"><b>End:</b> ${formatTime(end.hour % 12 || 12, end.minute)} ${endAMPM}</div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:15px;margin-top:15px;">
                        <div style="text-align:center;">
                            <input type="number" id="elapsedHoursInput" placeholder="?" 
                                style="width:60px;height:40px;text-align:center;font-size:1.2rem;border:2px solid var(--accent-cyan);border-radius:8px;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">hours</div>
                        </div>
                        <div style="text-align:center;">
                            <input type="number" id="elapsedMinutesInput" placeholder="?"
                                style="width:60px;height:40px;text-align:center;font-size:1.2rem;border:2px solid var(--accent-cyan);border-radius:8px;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">minutes</div>
                        </div>
                    </div>
                </div>`;
                
                q.options = buildNumericOptions(totalMinutes);
                q.measurementData = { startHour, startMin, endHour: end.hour, endMin: end.minute, elapsedHours, elapsedMin, totalMinutes, skill: 'elapsed_find_duration' };
                q.printFormat = "measurement-elapsed-find";
            }

            // ===== ELAPSED TIME CLOCKS (VISUAL) - Easy / Medium / Hard =====
            else if (measSkill === "elapsed_visual_easy" || measSkill === "elapsed_visual_medium" || measSkill === "elapsed_visual_hard") {
                // Determine difficulty parameters
                let startMinOptions, elapsedOptions, diffLabel;
                if (measSkill === "elapsed_visual_easy") {
                    startMinOptions = [0, 30];
                    elapsedOptions = [30, 60, 90, 120, 150, 180];
                    diffLabel = "Easy";
                } else if (measSkill === "elapsed_visual_medium") {
                    startMinOptions = [0, 15, 30, 45];
                    elapsedOptions = [15, 30, 45, 60, 75, 90, 105, 120];
                    diffLabel = "Medium";
                } else {
                    startMinOptions = [];
                    for (let m = 0; m < 60; m += 1) startMinOptions.push(m);
                    elapsedOptions = [];
                    for (let m = 5; m <= 180; m += 5) elapsedOptions.push(m);
                    // Also include some non-round numbers for hard
                    elapsedOptions.push(7, 13, 22, 37, 43, 53, 67, 83, 97, 113, 127, 143);
                    diffLabel = "Hard";
                }

                const startHour = rng(1, 11);
                const startMin = pick(startMinOptions);
                const elapsedTotal = pick(elapsedOptions);
                const end = addTime(startHour, startMin, 0, elapsedTotal);
                const endHour = end.hour;
                const endMin = end.minute;

                // Format elapsed time for display
                const eHrs = Math.floor(elapsedTotal / 60);
                const eMins = elapsedTotal % 60;
                let answerText;
                if (eHrs === 0) answerText = `${eMins} minute${eMins !== 1 ? 's' : ''}`;
                else if (eMins === 0) answerText = `${eHrs} hour${eHrs !== 1 ? 's' : ''}`;
                else answerText = `${eHrs} hr ${eMins} min`;

                // Generate distractors
                const distractorSet = new Set();
                distractorSet.add(answerText);
                const offsets = [15, 30, -15, -30, 60, -60, 45, -45, 10, -10, 20, -20];
                for (const off of offsets) {
                    if (distractorSet.size >= 4) break;
                    const alt = elapsedTotal + off;
                    if (alt > 0 && alt <= 300 && alt !== elapsedTotal) {
                        const h = Math.floor(alt / 60);
                        const m = alt % 60;
                        let txt;
                        if (h === 0) txt = `${m} minute${m !== 1 ? 's' : ''}`;
                        else if (m === 0) txt = `${h} hour${h !== 1 ? 's' : ''}`;
                        else txt = `${h} hr ${m} min`;
                        distractorSet.add(txt);
                    }
                }
                // Fill remaining slots if needed
                while (distractorSet.size < 4) {
                    const alt = rng(10, 180);
                    if (alt !== elapsedTotal) {
                        const h = Math.floor(alt / 60);
                        const m = alt % 60;
                        let txt;
                        if (h === 0) txt = `${m} minute${m !== 1 ? 's' : ''}`;
                        else if (m === 0) txt = `${h} hour${h !== 1 ? 's' : ''}`;
                        else txt = `${h} hr ${m} min`;
                        distractorSet.add(txt);
                    }
                }

                q.ans = answerText;
                q.answerType = "multiple-choice";
                q.options = shuffle([...distractorSet]);
                q.text = `How much time has passed from the first clock to the second?`;
                q.hint = eHrs > 0
                    ? `Count the hours first (${eHrs}), then count the extra minutes (${eMins}).`
                    : `Count how many minutes the minute hand has moved.`;

                // Pick clock display type: analog-analog, digital-digital, or mixed
                const clockType = pick(['analog-analog', 'digital-digital', 'analog-digital', 'digital-analog']);
                const color1 = pick(['blue', 'purple', 'yellow']);
                const color2 = color1 === 'blue' ? 'purple' : 'blue';

                // Build screen visual (magnifiable)
                let clock1HTML, clock2HTML;
                if (clockType.startsWith('analog')) {
                    clock1HTML = createMagnifiableClock(startHour, startMin, { size: 140, colorScheme: color1 });
                } else {
                    clock1HTML = createDigitalClockHTML(startHour, startMin, { size: 'large', colorScheme: color1, showAMPM: true });
                }
                if (clockType.endsWith('analog')) {
                    clock2HTML = createMagnifiableClock(endHour, endMin, { size: 140, colorScheme: color2 });
                } else {
                    clock2HTML = createDigitalClockHTML(endHour, endMin, { size: 'large', colorScheme: color2, showAMPM: true });
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time Clocks (${diffLabel})</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                        <div style="text-align:center;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">Start</div>
                            ${clock1HTML}
                        </div>
                        <div style="font-size:2rem;color:var(--accent-cyan);font-weight:900;">→</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">End</div>
                            ${clock2HTML}
                        </div>
                    </div>
                    <div style="font-size:1.05rem;font-weight:700;margin-top:18px;color:var(--text-bright);">How much time has passed?</div>
                </div>`;

                q.measurementData = {
                    startHour, startMin, endHour, endMin, elapsedTotal,
                    clockType, color1, color2, answerText,
                    skill: measSkill
                };
                q.printFormat = "measurement-elapsed-visual";
            }

            // ===== TEMPERATURE =====
            else if (measSkill === "temperature") {
                const mode = pick(["read", "convert"]);
                if (mode === "read") {
                    const temp = rng(-10, 40);
                    const unit = pick(["°C", "°F"]);
                    q.ans = temp;
                    q.text = `What temperature is shown? (${unit})`;
                    q.hint = `Read the thermometer scale carefully`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🌡️ Temperature</div>
                        <div style="font-size:2rem;font-weight:700;color:${temp < 0 ? '#3498db' : temp > 30 ? '#e74c3c' : '#27ae60'};">${temp}${unit}</div>
                    </div>`;
                    q.measurementData = { temp, unit };
                } else {
                    const celsius = rng(0, 40);
                    const fahrenheit = Math.round(celsius * 9 / 5 + 32);
                    const direction = pick(["c_to_f", "f_to_c"]);
                    
                    if (direction === "c_to_f") {
                        q.ans = fahrenheit;
                        q.text = `Convert ${celsius}°C to Fahrenheit`;
                        q.hint = `°F = (°C × 9/5) + 32`;
                    } else {
                        q.ans = celsius;
                        q.text = `Convert ${fahrenheit}°F to Celsius`;
                        q.hint = `°C = (°F - 32) × 5/9`;
                    }
                    q.measurementData = { celsius, fahrenheit, direction };
                }
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "measurement-temp";
            }
            
            // ===== MONEY =====
            else if (measSkill === "money") {
                const mode = pick(["make_change", "total"]);
                if (mode === "make_change") {
                    const cost = rng(1, 9) + rng(0, 99) / 100;
                    const paid = Math.ceil(cost);
                    const change = parseFloat((paid - cost).toFixed(2));
                    
                    q.ans = change;
                    q.text = `You paid $${paid.toFixed(2)} for something that cost $${cost.toFixed(2)}. What is your change?`;
                    q.hint = `Change = Amount paid - Cost`;
                    q.measurementData = { cost, paid, change };
                } else {
                    const items = [
                        rng(1, 5) + rng(0, 99) / 100,
                        rng(1, 3) + rng(0, 99) / 100
                    ];
                    const total = parseFloat(items.reduce((a, b) => a + b, 0).toFixed(2));
                    
                    q.ans = total;
                    q.text = `Find the total: $${items[0].toFixed(2)} + $${items[1].toFixed(2)}`;
                    q.hint = `Add the dollars, then add the cents`;
                    q.measurementData = { items, total };
                }
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">💰 Money</div>
                    <div style="font-size:1.2rem;margin:15px 0;">Answer: $<span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span></div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "measurement-money";
            }
            
            // ===== CAPACITY =====
            else if (measSkill === "capacity") {
                const conversions = [
                    { from: "mL", to: "L", factor: 1000, values: [1000, 2000, 500, 250, 1500] },
                    { from: "L", to: "mL", factor: 0.001, values: [1, 2, 3, 0.5, 1.5] },
                    { from: "cups", to: "pints", factor: 2, values: [2, 4, 6, 8] },
                    { from: "pints", to: "quarts", factor: 2, values: [2, 4, 6, 8] },
                    { from: "quarts", to: "gallons", factor: 4, values: [4, 8, 12, 16] }
                ];
                const conv = pick(conversions);
                const value = pick(conv.values);
                const answer = value / conv.factor;
                
                q.ans = answer;
                q.text = `Convert: ${value} ${conv.from} = ___ ${conv.to}`;
                q.hint = `${conv.factor} ${conv.from} = 1 ${conv.to}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">📏 Capacity</div>
                    <div style="font-size:1.3rem;margin:15px 0;">${value} ${conv.from} = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> ${conv.to}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Reference: ${conv.factor} ${conv.from} = 1 ${conv.to}</div>
                </div>`;
                q.options = buildNumericOptions(answer);
                q.measurementData = { from: conv.from, to: conv.to, value, answer };
                q.printFormat = "measurement-capacity";
            }
            break;
        }
        case "data_stats": {
            // Data & Statistics Category - CCSS Aligned for Grades 3-5
            const dataSkill = mappedSkill === "mixed" ? pick(["bar_graph", "line_plot", "pictograph", "tally_chart", "pie_chart", "mean", "median", "mode", "range", "probability"]) : mappedSkill;
            
            // Real-world contexts for graphs
            const contexts = [
                { title: "Favorite Pets", categories: ["Dogs", "Cats", "Fish", "Birds", "Hamsters"], icon: "🐾" },
                { title: "Sports Played", categories: ["Soccer", "Baseball", "Basketball", "Tennis", "Swimming"], icon: "⚽" },
                { title: "Favorite Fruits", categories: ["Apples", "Bananas", "Oranges", "Grapes", "Strawberries"], icon: "🍎" },
                { title: "Weather This Week", categories: ["Mon", "Tue", "Wed", "Thu", "Fri"], icon: "🌤️" },
                { title: "Books Read", categories: ["Jan", "Feb", "Mar", "Apr", "May"], icon: "📚" }
            ];
            
            // Colors for charts
            const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
            
            if (dataSkill === "mean") {
                // Mean (average) - CCSS 5.MD
                const count = pick([4, 5, 6]);
                const nums = Array.from({length: count}, () => rng(2, 20));
                const sum = nums.reduce((a, b) => a + b, 0);
                const mean = sum / count;
                
                q.ans = Number.isInteger(mean) ? mean : parseFloat(mean.toFixed(1));
                q.text = `Find the mean: ${nums.join(", ")}`;
                q.hint = `Mean = Sum of all values ÷ Number of values = ${sum} ÷ ${count}`;
                q.ccss = "5.MD.B.2";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Mean (Average)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:8px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:linear-gradient(135deg, #4ECDC4, #45B7D1);color:white;border-radius:8px;font-weight:700;font-size:1.2rem;">${n}</span>`).join('')}
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;border:2px solid var(--border-light);">
                        <div style="font-size:0.95rem;margin-bottom:8px;">📝 <b>Step 1:</b> Add all values</div>
                        <div style="font-size:1rem;color:var(--accent-cyan);margin-bottom:8px;">${nums.join(' + ')} = ${sum}</div>
                        <div style="font-size:0.95rem;margin-bottom:8px;">📝 <b>Step 2:</b> Divide by count (${count})</div>
                        <div style="font-size:1rem;">Mean = ${sum} ÷ ${count} = <span style="border-bottom:3px solid var(--accent-green);padding:2px 15px;font-weight:700;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.dataData = { nums, sum, mean: q.ans, type: 'mean' };
                q.printFormat = "data-mean";
                
            } else if (dataSkill === "median") {
                // Median - CCSS 5.MD.B.2
                const count = pick([5, 7, 9]);
                const nums = Array.from({length: count}, () => rng(1, 25)).sort((a, b) => a - b);
                const median = nums[Math.floor(count / 2)];
                
                q.ans = median;
                q.text = `Find the median: ${nums.join(", ")}`;
                q.hint = `Median is the middle number when in order. Cross off from both ends!`;
                q.ccss = "5.MD.B.2";
                
                const midIdx = Math.floor(count / 2);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Median (Middle Value)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;align-items:center;">
                        ${nums.map((n, i) => `<span style="padding:10px 14px;background:${i === midIdx ? 'linear-gradient(135deg, #FF6B6B, #ee5a24)' : 'var(--bg-card)'};color:${i === midIdx ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${i === midIdx ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('<span style="color:var(--text-dim);">→</span>')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">✨ Already ordered! Find the <b>middle</b> number (position ${midIdx + 1} of ${count})</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(median);
                q.dataData = { nums, median, type: 'median' };
                q.printFormat = "data-median";
                
            } else if (dataSkill === "mode") {
                // Mode - CCSS 5.MD.B.2
                const mode = rng(3, 18);
                const modeCount = rng(3, 4);
                let nums = Array(modeCount).fill(mode);
                while (nums.length < modeCount + rng(4, 6)) {
                    const n = rng(1, 25);
                    if (n !== mode && nums.filter(x => x === n).length < 2) nums.push(n);
                }
                nums = nums.sort(() => Math.random() - 0.5);
                
                q.ans = mode;
                q.text = `Find the mode: ${nums.join(", ")}`;
                q.hint = `Mode is the number that appears most often. Count how many times each number appears!`;
                q.ccss = "5.MD.B.2";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Mode (Most Frequent)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:${n === mode ? 'linear-gradient(135deg, #96CEB4, #45B7D1)' : 'var(--bg-card)'};color:${n === mode ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${n === mode ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">🔍 Which number appears the <b>most</b> times?</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(mode);
                q.dataData = { nums, mode, modeCount, type: 'mode' };
                q.printFormat = "data-mode";
                
            } else if (dataSkill === "range") {
                // Range - CCSS 4.MD.B.4
                const nums = Array.from({length: rng(5, 8)}, () => rng(5, 50)).sort((a, b) => a - b);
                const range = nums[nums.length - 1] - nums[0];
                
                q.ans = range;
                q.text = `Find the range: ${nums.join(", ")}`;
                q.hint = `Range = Highest value - Lowest value = ${nums[nums.length-1]} - ${nums[0]}`;
                q.ccss = "4.MD.B.4";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Range (Spread)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map((n, i) => `<span style="padding:10px 14px;background:${i === 0 ? 'linear-gradient(135deg, #45B7D1, #4ECDC4)' : i === nums.length-1 ? 'linear-gradient(135deg, #FF6B6B, #ee5a24)' : 'var(--bg-card)'};color:${i === 0 || i === nums.length-1 ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;">${n}</span>`).join('')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin-top:10px;display:inline-block;">
                        <span style="color:#45B7D1;font-weight:700;">Lowest: ${nums[0]}</span>
                        <span style="margin:0 15px;">→</span>
                        <span style="color:#FF6B6B;font-weight:700;">Highest: ${nums[nums.length-1]}</span>
                    </div>
                    <div style="margin-top:10px;font-size:1.1rem;">
                        Range = ${nums[nums.length-1]} - ${nums[0]} = <span style="border-bottom:3px solid var(--accent-green);padding:2px 15px;font-weight:700;">?</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(range);
                q.dataData = { nums, range, min: nums[0], max: nums[nums.length-1], type: 'range' };
                q.printFormat = "data-range";
                
            } else if (dataSkill === "bar_graph") {
                // Bar Graph - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numBars = pick([4, 5]);
                const categories = context.categories.slice(0, numBars);
                const values = categories.map(() => rng(2, 12));
                const maxVal = Math.max(...values);
                const questionTypes = ["which_highest", "which_lowest", "specific_value", "total", "difference"];
                const questionType = pick(questionTypes);
                
                q.ccss = "3.MD.B.3";
                
                if (questionType === "which_highest") {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the most?`;
                } else if (questionType === "which_lowest") {
                    const minIdx = values.indexOf(Math.min(...values));
                    q.ans = categories[minIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the least?`;
                } else if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many chose ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total of all responses?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const idx1 = rng(0, categories.length - 1);
                    let idx2 = rng(0, categories.length - 1);
                    while (idx2 === idx1) idx2 = rng(0, categories.length - 1);
                    q.ans = Math.abs(values[idx1] - values[idx2]);
                    q.text = `${context.title}: What is the difference between ${categories[idx1]} and ${categories[idx2]}?`;
                    q.options = buildNumericOptions(q.ans);
                }
                
                q.hint = `Read the bar graph carefully! Each bar shows a different value.`;
                
                // Create SVG bar graph
                const barWidth = 40;
                const barGap = 15;
                const graphHeight = 140;
                const graphWidth = categories.length * (barWidth + barGap) + 60;
                const scale = (graphHeight - 30) / maxVal;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Bar Graph</div>
                    <svg width="${graphWidth}" height="${graphHeight + 40}" viewBox="0 0 ${graphWidth} ${graphHeight + 40}" style="display:block;margin:0 auto;">
                        <!-- Y-axis -->
                        <line x1="45" y1="10" x2="45" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- X-axis -->
                        <line x1="45" y1="${graphHeight}" x2="${graphWidth - 10}" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- Y-axis labels -->
                        ${[0, Math.ceil(maxVal/2), maxVal].map((val, i) => `
                            <text x="40" y="${graphHeight - val * scale + 5}" font-size="11" fill="var(--text-dim)" text-anchor="end">${val}</text>
                            <line x1="43" y1="${graphHeight - val * scale}" x2="${graphWidth - 10}" y2="${graphHeight - val * scale}" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="3"/>
                        `).join('')}
                        <!-- Bars -->
                        ${values.map((v, i) => {
                            const x = 55 + i * (barWidth + barGap);
                            const barHeight = v * scale;
                            return `
                                <rect x="${x}" y="${graphHeight - barHeight}" width="${barWidth}" height="${barHeight}" 
                                      fill="${chartColors[i % chartColors.length]}" rx="4" ry="4"/>
                                <text x="${x + barWidth/2}" y="${graphHeight - barHeight - 5}" font-size="12" fill="var(--text-main)" text-anchor="middle" font-weight="700">${v}</text>
                                <text x="${x + barWidth/2}" y="${graphHeight + 15}" font-size="10" fill="var(--text-main)" text-anchor="middle">${categories[i].substring(0, 6)}</text>
                            `;
                        }).join('')}
                    </svg>
                </div>`;
                q.dataData = { categories, values, context: context.title, questionType, type: 'bar_graph' };
                q.printFormat = "data-bar-graph";
                
            } else if (dataSkill === "pictograph") {
                // Pictograph - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numRows = pick([3, 4, 5]);
                const categories = context.categories.slice(0, numRows);
                const scale = pick([2, 5, 10]);
                const values = categories.map(() => rng(1, 6) * scale);
                const icons = ["⭐", "🔵", "🍎", "📚", "🎈"];
                const icon = pick(icons);
                
                const questionType = pick(["specific_value", "total", "which_most"]);
                q.ccss = "3.MD.B.3";
                
                if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many for ${categories[idx]}? (Each ${icon} = ${scale})`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total? (Each ${icon} = ${scale})`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which has the most? (Each ${icon} = ${scale})`;
                }
                
                q.hint = `Count the symbols and multiply by ${scale}!`;
                
                // Create pictograph
                const maxIcons = Math.ceil(Math.max(...values) / scale);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Pictograph</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;text-align:left;">
                        <div style="font-weight:600;margin-bottom:10px;text-align:center;padding:8px;background:var(--bg-card-light);border-radius:6px;">Key: ${icon} = ${scale}</div>
                        ${categories.map((cat, i) => {
                            const numIcons = values[i] / scale;
                            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                <span style="width:80px;font-weight:600;font-size:0.9rem;">${cat}</span>
                                <span style="font-size:1.3rem;letter-spacing:4px;">${icon.repeat(numIcons)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
                q.dataData = { categories, values, scale, icon, context: context.title, type: 'pictograph' };
                q.printFormat = "data-pictograph";
                
            } else if (dataSkill === "line_plot") {
                // Line Plot with fractions - CCSS 4.MD.B.4, 5.MD.B.2
                const denominators = [4, 8];
                const denom = pick(denominators);
                const fractions = [];
                const counts = {};
                
                // Generate data points (lengths in fractions of an inch)
                for (let i = 0; i < rng(8, 12); i++) {
                    const num = rng(0, denom * 2);
                    const frac = num / denom;
                    fractions.push(frac);
                    counts[frac] = (counts[frac] || 0) + 1;
                }
                
                const uniqueFracs = Object.keys(counts).map(Number).sort((a, b) => a - b);
                const maxCount = Math.max(...Object.values(counts));
                
                const questionType = pick(["most_common", "total_points", "count_specific"]);
                q.ccss = denom === 4 ? "4.MD.B.4" : "5.MD.B.2";
                
                const formatFrac = (f) => {
                    if (f === Math.floor(f)) return String(f);
                    const whole = Math.floor(f);
                    const rem = f - whole;
                    const num = Math.round(rem * denom);
                    if (whole > 0) return `${whole} ${num}/${denom}`;
                    return `${num}/${denom}`;
                };
                
                if (questionType === "most_common") {
                    const maxFrac = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a);
                    q.ans = formatFrac(parseFloat(maxFrac[0]));
                    q.answerType = "choice";
                    q.options = uniqueFracs.slice(0, 4).map(f => formatFrac(f));
                    if (!q.options.includes(q.ans)) q.options[0] = q.ans;
                    q.text = `Plant Heights: Which measurement is most common?`;
                } else if (questionType === "total_points") {
                    q.ans = fractions.length;
                    q.text = `Plant Heights: How many plants were measured in total?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const targetFrac = pick(uniqueFracs);
                    q.ans = counts[targetFrac];
                    q.text = `Plant Heights: How many plants measured ${formatFrac(targetFrac)} inches?`;
                    q.options = buildNumericOptions(q.ans);
                }
                
                q.hint = `Count the X marks above each measurement!`;
                
                // Create line plot SVG
                const plotWidth = 320;
                const plotHeight = 120;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">🌱 Plant Heights (inches)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Line Plot</div>
                    <svg width="${plotWidth}" height="${plotHeight}" viewBox="0 0 ${plotWidth} ${plotHeight}" style="display:block;margin:0 auto;">
                        <!-- Number line -->
                        <line x1="20" y1="${plotHeight - 25}" x2="${plotWidth - 20}" y2="${plotHeight - 25}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- Tick marks and X's -->
                        ${uniqueFracs.map((frac, i) => {
                            const x = 30 + (frac / (Math.max(...uniqueFracs) + 0.5)) * (plotWidth - 60);
                            const count = counts[frac];
                            return `
                                <line x1="${x}" y1="${plotHeight - 30}" x2="${x}" y2="${plotHeight - 20}" stroke="var(--text-main)" stroke-width="2"/>
                                <text x="${x}" y="${plotHeight - 5}" font-size="10" fill="var(--text-main)" text-anchor="middle">${formatFrac(frac)}</text>
                                ${Array(count).fill(0).map((_, j) => `
                                    <text x="${x}" y="${plotHeight - 35 - j * 14}" font-size="14" fill="${chartColors[i % chartColors.length]}" text-anchor="middle" font-weight="700">×</text>
                                `).join('')}
                            `;
                        }).join('')}
                    </svg>
                </div>`;
                q.dataData = { fractions, counts, denom, type: 'line_plot' };
                q.printFormat = "data-line-plot";
                
            } else if (dataSkill === "tally_chart") {
                // Tally Chart - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numRows = pick([3, 4, 5]);
                const categories = context.categories.slice(0, numRows);
                const values = categories.map(() => rng(3, 15));
                
                const questionType = pick(["specific_value", "total", "which_most"]);
                q.ccss = "3.MD.B.3";
                
                if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many tallies for ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total of all tallies?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which has the most tallies?`;
                }
                
                q.hint = `Remember: |||| (crossed) = 5. Count groups of 5 plus extras!`;
                
                // Create tally marks
                const makeTally = (n) => {
                    const groups = Math.floor(n / 5);
                    const extras = n % 5;
                    let result = '';
                    for (let i = 0; i < groups; i++) {
                        result += '<span style="position:relative;margin-right:10px;"><span style="letter-spacing:-2px;">||||</span><span style="position:absolute;left:0;top:50%;transform:rotate(-20deg);width:100%;">―</span></span>';
                    }
                    result += '<span style="letter-spacing:-2px;">' + '|'.repeat(extras) + '</span>';
                    return result;
                };
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Tally Chart</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;min-width:250px;">
                        <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;font-weight:600;padding-bottom:8px;border-bottom:2px solid var(--border-light);margin-bottom:8px;">
                            <span>Category</span><span>Tallies</span><span>Count</span>
                        </div>
                        ${categories.map((cat, i) => `
                            <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                <span style="font-weight:600;font-size:0.9rem;">${cat}</span>
                                <span style="font-size:1.2rem;color:${chartColors[i % chartColors.length]};">${makeTally(values[i])}</span>
                                <span style="font-weight:700;color:var(--accent-cyan);">${values[i]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
                q.dataData = { categories, values, context: context.title, type: 'tally_chart' };
                q.printFormat = "data-tally";
                
            } else if (dataSkill === "pie_chart") {
                // Pie Chart - CCSS 5.MD.B.2
                const context = pick(contexts);
                const numSlices = pick([3, 4]);
                const categories = context.categories.slice(0, numSlices);
                
                // Generate percentages that add to 100
                let remaining = 100;
                const percents = [];
                for (let i = 0; i < numSlices - 1; i++) {
                    const p = rng(15, Math.min(40, remaining - 15 * (numSlices - i - 1)));
                    percents.push(p);
                    remaining -= p;
                }
                percents.push(remaining);
                
                const questionType = pick(["largest", "specific", "combined"]);
                q.ccss = "5.MD.B.2";
                
                if (questionType === "largest") {
                    const maxIdx = percents.indexOf(Math.max(...percents));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the largest share?`;
                } else if (questionType === "specific") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = percents[idx];
                    q.text = `${context.title}: What percent chose ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const idx1 = 0, idx2 = 1;
                    q.ans = percents[idx1] + percents[idx2];
                    q.text = `${context.title}: What percent chose ${categories[idx1]} OR ${categories[idx2]} combined?`;
                    q.options = buildNumericOptions(q.ans);
                }
                
                q.hint = `Read the percentages shown in the pie chart!`;
                
                // Create pie chart SVG
                const cx = 100, cy = 100, r = 80;
                let currentAngle = -90; // Start at top
                
                const slices = percents.map((p, i) => {
                    const angle = (p / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;
                    
                    const startRad = startAngle * Math.PI / 180;
                    const endRad = endAngle * Math.PI / 180;
                    
                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy + r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy + r * Math.sin(endRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const midAngle = (startAngle + endAngle) / 2 * Math.PI / 180;
                    const labelX = cx + (r * 0.65) * Math.cos(midAngle);
                    const labelY = cy + (r * 0.65) * Math.sin(midAngle);
                    
                    return `
                        <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" 
                              fill="${chartColors[i]}" stroke="white" stroke-width="2"/>
                        <text x="${labelX}" y="${labelY}" font-size="12" fill="white" text-anchor="middle" font-weight="700">${p}%</text>
                    `;
                }).join('');
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Pie Chart</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                        <svg width="200" height="200" viewBox="0 0 200 200">${slices}</svg>
                        <div style="text-align:left;">
                            ${categories.map((cat, i) => `
                                <div style="display:flex;align-items:center;gap:8px;margin:5px 0;">
                                    <span style="width:16px;height:16px;background:${chartColors[i]};border-radius:3px;"></span>
                                    <span style="font-size:0.9rem;">${cat} (${percents[i]}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
                q.dataData = { categories, percents, context: context.title, type: 'pie_chart' };
                q.printFormat = "data-pie";
                
            } else if (dataSkill === "probability") {
                // Basic probability - CCSS 4.MD.B.4
                const scenarios = [
                    { item: "marble", container: "bag", colors: ["red", "blue", "green"], counts: [3, 4, 3], icons: ["🔴", "🔵", "🟢"] },
                    { item: "ball", container: "box", colors: ["yellow", "orange", "purple"], counts: [2, 5, 3], icons: ["🟡", "🟠", "🟣"] },
                    { item: "candy", container: "jar", colors: ["pink", "white", "brown"], counts: [4, 3, 3], icons: ["🩷", "⚪", "🟤"] }
                ];
                const scenario = pick(scenarios);
                const total = scenario.counts.reduce((a, b) => a + b, 0);
                const favorableIdx = rng(0, scenario.colors.length - 1);
                const favorable = scenario.colors[favorableIdx];
                const favorableCount = scenario.counts[favorableIdx];
                
                q.text = `A ${scenario.container} has ${scenario.counts.map((c, i) => `${c} ${scenario.colors[i]}`).join(", ")} ${scenario.item}s. What is the probability of picking a ${favorable} one?`;
                q.ans = `${favorableCount}/${total}`;
                q.answerType = "text";
                q.hint = `Probability = Favorable outcomes / Total outcomes = ${favorableCount} / ${total}`;
                q.ccss = "4.MD.B.4";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">🎲 Probability</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:16px;display:inline-block;margin:10px 0;">
                        <div style="font-size:2rem;letter-spacing:4px;margin-bottom:10px;">
                            ${scenario.counts.map((c, i) => scenario.icons[i].repeat(c)).join(' ')}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            ${scenario.counts.map((c, i) => `${scenario.icons[i]} ${scenario.colors[i]}: ${c}`).join(' | ')}
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:1.1rem;">
                        P(${favorable}) = <span style="border:2px solid var(--accent-green);padding:5px 20px;border-radius:8px;font-weight:700;">?</span>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Total ${scenario.item}s: ${total}</div>
                </div>`;
                q.dataData = { scenario, favorableCount, total, favorable, type: 'probability' };
                q.printFormat = "data-probability";
            }
            break;
        }
        case "number_theory": {
            // Number Theory Category - Enhanced with multi-number classification
            const ntSkill = mappedSkill === "mixed" ? pick(["prime_composite", "factors_identify", "factor_tchart_easy", "factor_tchart_medium", "factor_tchart_hard", "factor_links_easy", "factor_links_medium", "factor_links_hard", "multiples", "gcf_easy", "gcf_hard", "lcm", "divisibility", "divisibility_sort", "even_odd"]) : mappedSkill;
            
            // Helper function to get all factors
            const getFactors = (n) => {
                const factors = [];
                for (let i = 1; i <= n; i++) {
                    if (n % i === 0) factors.push(i);
                }
                return factors;
            };
            
            // Helper to get factor pairs
            const getFactorPairs = (n) => {
                const pairs = [];
                for (let i = 1; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) pairs.push([i, n / i]);
                }
                return pairs;
            };
            
            // Helper to check if prime
            const isPrimeNum = (n) => {
                if (n < 2) return false;
                for (let i = 2; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) return false;
                }
                return true;
            };
            
            if (ntSkill === "prime_composite") {
                // Enhanced: Multiple problem types
                const problemType = pick(["classify_list", "compare_two", "single"]);
                
                if (problemType === "classify_list") {
                    // Sort 6-8 numbers into prime or composite
                    const count = rng(6, 8);
                    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
                    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36];
                    
                    const numPrimes = rng(2, Math.min(4, count - 2));
                    const numComposites = count - numPrimes;
                    
                    const selectedPrimes = [];
                    const selectedComposites = [];
                    while (selectedPrimes.length < numPrimes) {
                        const p = pick(primes);
                        if (!selectedPrimes.includes(p)) selectedPrimes.push(p);
                    }
                    while (selectedComposites.length < numComposites) {
                        const c = pick(composites);
                        if (!selectedComposites.includes(c)) selectedComposites.push(c);
                    }
                    
                    const allNums = [...selectedPrimes, ...selectedComposites].sort(() => Math.random() - 0.5);
                    
                    q.text = `Sort these numbers into prime or composite:`;
                    q.ans = `Prime: ${selectedPrimes.sort((a,b)=>a-b).join(", ")} | Composite: ${selectedComposites.sort((a,b)=>a-b).join(", ")}`;
                    q.answerType = "classification";
                    q.hint = `Prime numbers have exactly 2 factors (1 and itself). Composite numbers have more than 2 factors.`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Sort: Prime or Composite?</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:20px 0;">
                            ${allNums.map(n => `<div class="nt-classify-item" data-num="${n}" data-prime="${isPrimeNum(n)}" 
                                style="padding:12px 18px;background:var(--bg-card);border:2px solid var(--text-dim);border-radius:10px;font-size:1.3rem;font-weight:700;cursor:pointer;transition:all 0.2s;"
                                onclick="this.classList.toggle('selected');this.style.borderColor=this.classList.contains('selected')?'var(--accent-green)':'var(--text-dim)';this.style.background=this.classList.contains('selected')?'rgba(39,174,96,0.2)':'var(--bg-card)';">${n}</div>`).join('')}
                        </div>
                        <div style="display:flex;justify-content:center;gap:30px;margin-top:20px;">
                            <div style="text-align:center;min-width:120px;">
                                <div style="font-weight:700;color:var(--accent-green);margin-bottom:8px;">PRIME</div>
                                <div style="border:2px dashed var(--accent-green);border-radius:8px;min-height:60px;padding:10px;">
                                    <span style="color:var(--text-dim);font-size:0.9rem;">2 factors only</span>
                                </div>
                            </div>
                            <div style="text-align:center;min-width:120px;">
                                <div style="font-weight:700;color:var(--accent-orange);margin-bottom:8px;">COMPOSITE</div>
                                <div style="border:2px dashed var(--accent-orange);border-radius:8px;min-height:60px;padding:10px;">
                                    <span style="color:var(--text-dim);font-size:0.9rem;">3+ factors</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    q.numberTheoryData = { 
                        allNums, 
                        primes: selectedPrimes, 
                        composites: selectedComposites, 
                        type: 'prime_composite_classify' 
                    };
                    q.printFormat = "nt-prime-classify";
                } else if (problemType === "compare_two") {
                    // Compare two numbers with justification
                    const primes = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
                    const composites = [12, 15, 18, 20, 21, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36];
                    
                    const prime = pick(primes);
                    const composite = pick(composites);
                    const nums = Math.random() < 0.5 ? [prime, composite] : [composite, prime];
                    const factorPairs = getFactorPairs(composite);
                    
                    q.text = `Which number is composite? ${nums[0]} or ${nums[1]}. Explain why.`;
                    q.ans = composite;
                    q.hint = `A composite number can be divided evenly by numbers other than 1 and itself.`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Prime vs Composite - Compare & Justify</div>
                        <div style="display:flex;justify-content:center;gap:40px;margin:25px 0;">
                            <div style="text-align:center;padding:20px 30px;background:var(--bg-card);border-radius:12px;border:3px solid var(--text-dim);cursor:pointer;" 
                                 onclick="this.style.borderColor='var(--accent-green)';this.nextElementSibling.style.borderColor='var(--text-dim)';">
                                <div style="font-size:2.5rem;font-weight:700;">${nums[0]}</div>
                            </div>
                            <div style="text-align:center;padding:20px 30px;background:var(--bg-card);border-radius:12px;border:3px solid var(--text-dim);cursor:pointer;"
                                 onclick="this.style.borderColor='var(--accent-green)';this.previousElementSibling.style.borderColor='var(--text-dim)';">
                                <div style="font-size:2.5rem;font-weight:700;">${nums[1]}</div>
                            </div>
                        </div>
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;margin:15px auto;max-width:350px;">
                            <div style="font-weight:600;margin-bottom:10px;">Justify your answer:</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;">_____ is composite because:</div>
                            <div style="display:flex;gap:10px;justify-content:center;align-items:center;">
                                <input type="text" style="width:40px;height:35px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="?">
                                <span style="font-size:1.3rem;">×</span>
                                <input type="text" style="width:40px;height:35px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="?">
                                <span style="font-size:1.3rem;">=</span>
                                <span style="font-size:1.3rem;font-weight:700;">${composite}</span>
                            </div>
                        </div>
                    </div>`;
                    q.options = [nums[0], nums[1]];
                    q.numberTheoryData = { 
                        nums, 
                        prime, 
                        composite, 
                        factorPairs,
                        type: 'prime_composite_compare' 
                    };
                    q.printFormat = "nt-prime-compare";
                } else {
                    // Single number classification
                    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
                    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
                    const isPrime = Math.random() < 0.5;
                    const num = isPrime ? pick(primes) : pick(composites);
                    
                    q.text = `Is ${num} prime or composite?`;
                    q.ans = isPrime ? "Prime" : "Composite";
                    q.answerType = "choice";
                    q.options = ["Prime", "Composite"];
                    q.hint = `Prime = only divisible by 1 and itself. Composite = has more factors`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Prime or Composite?</div>
                        <div style="font-size:3rem;font-weight:700;margin:20px 0;">${num}</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">Prime: only factors are 1 and itself<br/>Composite: has more than 2 factors</div>
                    </div>`;
                    q.numberTheoryData = { num, isPrime, type: 'prime_composite' };
                    q.printFormat = "nt-prime";
                }
            } else if (ntSkill === "factors_identify" || ntSkill === "factors") {
                // Identify Factors - Circle all factors from a list
                const targetNums = [12, 16, 18, 20, 24, 30, 36, 40, 48];
                const num = pick(targetNums);
                const allFactors = getFactors(num);
                
                // Generate list with factors and some non-factors (like the reference image)
                const nonFactors = [];
                for (let i = 2; i <= Math.min(num, 20); i++) {
                    if (num % i !== 0 && nonFactors.length < 5) nonFactors.push(i);
                }
                // Create sequential list 1 to max+some
                const maxDisplay = Math.max(...allFactors, 10);
                const displayList = [];
                for (let i = 1; i <= maxDisplay; i++) {
                    displayList.push(i);
                }
                // Add the number itself if not already there
                if (!displayList.includes(num)) displayList.push(num);
                displayList.sort((a, b) => a - b);
                
                q.text = `Circle ALL the factors of ${num}:`;
                q.ans = allFactors.join(", ");
                q.answerType = "multi-select";
                q.hint = `A factor divides evenly into ${num} with no remainder. Try: Does ${num} ÷ (each number) have a remainder?`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Circle ALL the factors of ${num}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:20px auto;max-width:450px;">
                        ${displayList.map(n => `<div class="factor-item" data-num="${n}" data-factor="${num % n === 0}"
                            style="padding:12px 16px;background:var(--bg-card);border:2px solid var(--text-dim);border-radius:8px;font-size:1.2rem;font-weight:600;cursor:pointer;min-width:45px;transition:all 0.2s;"
                            onclick="this.classList.toggle('selected');this.style.borderColor=this.classList.contains('selected')?'var(--accent-green)':'var(--text-dim)';this.style.background=this.classList.contains('selected')?'rgba(39,174,96,0.2)':'var(--bg-card)';">${n}</div>`).join('')}
                    </div>
                    <div style="margin-top:15px;padding:12px;background:linear-gradient(135deg, #fff3e0, #ffe0b2);border-radius:8px;border-left:4px solid #ff9800;">
                        <div style="font-size:0.9rem;"
                            <b>💡 Tip:</b> A factor divides evenly into ${num} with no remainder.<br/>
                            Try: Does ${num} ÷ (each number) have a remainder?
                        </div>
                    </div>
                </div>`;
                q.numberTheoryData = { 
                    num, 
                    factors: allFactors, 
                    displayList,
                    type: 'factors_identify' 
                };
                q.printFormat = "nt-factors-identify";
                
            } else if (ntSkill === "factor_tchart_easy") {
                // Factor T-Chart EASY - with factor bank only
                const targetNums = [12, 16, 18, 20, 24, 30, 36];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                
                q.text = `Build a Factor T-Chart for ${num}. Use each factor from the bank once.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.hint = `Each row shows a factor pair: ___ × ___ = ${num}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-green);">🟢 Factor T-Chart for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:30px;flex-wrap:wrap;">
                        <!-- T-Chart -->
                        <div style="display:inline-block;">
                            <div style="font-size:1.8rem;font-weight:700;border-bottom:3px solid #444;padding-bottom:8px;margin-bottom:5px;text-align:center;">${num}</div>
                            <div style="display:flex;border-left:3px solid var(--accent-green);">
                                <div style="min-width:70px;border-right:3px solid var(--accent-green);">
                                    ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tchart-input" data-row="${i}" data-side="left" style="width:50px;height:32px;border:2px solid var(--accent-green);border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                    </div>`).join('')}
                                </div>
                                <div style="min-width:70px;">
                                    ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tchart-input" data-row="${i}" data-side="right" style="width:50px;height:32px;border:2px solid var(--accent-green);border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <!-- Factor Bank -->
                        <div style="background:linear-gradient(135deg, #e8f5e9, #c8e6c9);padding:15px;border-radius:10px;border:2px solid #4caf50;">
                            <div style="font-weight:700;color:#2e7d32;margin-bottom:10px;">Factor Bank</div>
                            <div style="font-size:0.85rem;color:#666;margin-bottom:10px;">Use each factor once:</div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                                ${scrambledFactors.map(f => `<span style="padding:8px 14px;background:white;border:2px solid #4caf50;border-radius:6px;font-weight:600;font-size:1.1rem;">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        💡 Each row shows a factor pair: ___ × ___ = ${num}
                    </div>
                </div>`;
                q.numberTheoryData = { 
                    num, 
                    factorPairs, 
                    allFactors,
                    bankFactors: scrambledFactors,
                    type: 'factor_tchart_easy' 
                };
                q.printFormat = "nt-factor-tchart-easy";
                
            } else if (ntSkill === "factor_tchart_medium") {
                // Factor T-Chart MEDIUM - factor bank + 3 distractors
                const targetNums = [18, 20, 24, 30, 36, 40, 48];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                // Add 3 distractor numbers (non-factors)
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) {
                        distractors.push(i);
                    }
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);
                
                q.text = `Build a Factor T-Chart for ${num}. Use only the factors - watch out for extras!`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.hint = `Not all numbers in the bank are factors! Check: Does ${num} ÷ number = whole number?`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-yellow);">🟡 Factor T-Chart for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:30px;flex-wrap:wrap;">
                        <!-- T-Chart -->
                        <div style="display:inline-block;">
                            <div style="font-size:1.8rem;font-weight:700;border-bottom:3px solid #444;padding-bottom:8px;margin-bottom:5px;text-align:center;">${num}</div>
                            <div style="display:flex;border-left:3px solid #f9a825;">
                                <div style="min-width:70px;border-right:3px solid #f9a825;">
                                    ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tchart-input" data-row="${i}" data-side="left" style="width:50px;height:32px;border:2px solid #f9a825;border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                    </div>`).join('')}
                                </div>
                                <div style="min-width:70px;">
                                    ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                        <input type="text" class="tchart-input" data-row="${i}" data-side="right" style="width:50px;height:32px;border:2px solid #f9a825;border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <!-- Factor Bank with distractors -->
                        <div style="background:linear-gradient(135deg, #fff8e1, #ffecb3);padding:15px;border-radius:10px;border:2px solid #ff8f00;">
                            <div style="font-weight:700;color:#e65100;margin-bottom:10px;">Number Bank</div>
                            <div style="font-size:0.85rem;color:#666;margin-bottom:10px;">Some are NOT factors!</div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                                ${bankWithDistractors.map(f => `<span style="padding:8px 14px;background:white;border:2px solid #ff8f00;border-radius:6px;font-weight:600;font-size:1.1rem;">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:0.9rem;color:var(--text-dim);">
                        Note: Watch out! Not all numbers are factors of ${num}
                    </div>
                </div>`;
                q.numberTheoryData = { 
                    num, 
                    factorPairs, 
                    allFactors,
                    distractors,
                    bankFactors: bankWithDistractors,
                    type: 'factor_tchart_medium' 
                };
                q.printFormat = "nt-factor-tchart-medium";
                
            } else if (ntSkill === "factor_tchart_hard") {
                // Factor T-Chart HARD - NO factor bank
                const targetNums = [24, 30, 36, 40, 42, 48, 56, 60, 72];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                q.text = `Build a Factor T-Chart for ${num}. Find all the factor pairs!`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.hint = `Start with 1 × ${num}, then try 2, 3, 4... Does it divide evenly?`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-orange);">🟠 Factor T-Chart for ${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Find ALL the factor pairs (no number bank!)</div>
                    <div style="display:inline-block;">
                        <div style="font-size:2rem;font-weight:700;border-bottom:3px solid #444;padding-bottom:8px;margin-bottom:5px;text-align:center;">${num}</div>
                        <div style="display:flex;border-left:3px solid var(--accent-orange);">
                            <div style="min-width:80px;border-right:3px solid var(--accent-orange);">
                                ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                    <input type="text" class="tchart-input" data-row="${i}" data-side="left" style="width:55px;height:32px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                </div>`).join('')}
                            </div>
                            <div style="min-width:80px;">
                                ${factorPairs.map((_, i) => `<div style="height:42px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--text-dim);">
                                    <input type="text" class="tchart-input" data-row="${i}" data-side="right" style="width:55px;height:32px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1.1rem;background:var(--bg-card-light);" placeholder="">
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:20px;padding:12px;background:linear-gradient(135deg, #e3f2fd, #bbdefb);border-radius:8px;border-left:4px solid #1976d2;">
                        <div style="font-size:0.9rem;color:#0d47a1;">
                            <b>💡 Strategy:</b> Start with 1 × ${num}, then check: Does 2 divide evenly? Does 3? Keep going until you reach √${num} ≈ ${Math.floor(Math.sqrt(num))}
                        </div>
                    </div>
                </div>`;
                q.numberTheoryData = { 
                    num, 
                    factorPairs, 
                    allFactors,
                    type: 'factor_tchart_hard' 
                };
                q.printFormat = "nt-factor-tchart-hard";
                
            } else if (ntSkill === "factor_links_easy") {
                // Factor Links EASY - with factor bank
                const targetNums = [12, 16, 18, 20, 24, 30, 36];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a'];
                
                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    const color = colors[i % colors.length];
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }
                
                q.text = `Complete the factor links for ${num}. Use each factor once.`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Each arc connects a factor pair that multiplies to ${num}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-green);">Factor Links for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <!-- Factor Bank -->
                    <div style="margin-top:15px;background:linear-gradient(135deg, #e8f5e9, #c8e6c9);padding:12px;border-radius:10px;border:2px solid #4caf50;display:inline-block;">
                        <div style="font-weight:700;color:#2e7d32;margin-bottom:8px;">Factor Bank</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                            ${scrambledFactors.map(f => `<span style="padding:6px 12px;background:white;border:2px solid #4caf50;border-radius:6px;font-weight:600;">${f}</span>`).join('')}
                        </div>
                    </div>
                </div>`;
                
                q.numberTheoryData = { 
                    num, 
                    factorPairs,
                    allFactors,
                    bankFactors: scrambledFactors,
                    numPairs: factorPairs.length,
                    type: 'factor_links_easy' 
                };
                q.printFormat = "factor-links-easy";
                
            } else if (ntSkill === "factor_links_medium") {
                // Factor Links MEDIUM - factor bank + 3 distractors
                const targetNums = [18, 20, 24, 30, 36, 40, 48];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                // Add 3 distractor numbers
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) {
                        distractors.push(i);
                    }
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);
                const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a'];
                
                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    const color = colors[i % colors.length];
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }
                
                q.text = `Complete the factor links for ${num}. Watch out for non-factors!`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Not all numbers in the bank are factors! Check: Does ${num} ÷ number = whole number?`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:#f9a825;">Factor Links for ${num}</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <!-- Number Bank with distractors -->
                    <div style="margin-top:15px;background:linear-gradient(135deg, #fff8e1, #ffecb3);padding:12px;border-radius:10px;border:2px solid #ff8f00;display:inline-block;">
                        <div style="font-weight:700;color:#e65100;margin-bottom:8px;">Number Bank (some are NOT factors!)</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
                            ${bankWithDistractors.map(f => `<span style="padding:6px 12px;background:white;border:2px solid #ff8f00;border-radius:6px;font-weight:600;">${f}</span>`).join('')}
                        </div>
                    </div>
                </div>`;
                
                q.numberTheoryData = { 
                    num, 
                    factorPairs,
                    allFactors,
                    distractors,
                    bankFactors: bankWithDistractors,
                    numPairs: factorPairs.length,
                    type: 'factor_links_medium' 
                };
                q.printFormat = "factor-links-medium";
                
            } else if (ntSkill === "factor_links_hard" || ntSkill === "factor_links") {
                // Factor Links HARD - NO factor bank
                const targetNums = [24, 30, 36, 40, 42, 48, 56, 60, 72, 80];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a'];
                
                let inputsHTML = '';
                for (let i = 0; i < factorPairs.length; i++) {
                    const color = colors[i % colors.length];
                    const pair = factorPairs[i];
                    inputsHTML += `
                        <div class="links-pair" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;">
                            <input type="text" class="links-input" data-answer="${pair[0]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                            <span style="color:${color};font-weight:700;font-size:1.1rem;">×</span>
                            <input type="text" class="links-input" data-answer="${pair[1]}"
                                style="width:45px;height:34px;border:3px solid ${color};border-radius:8px;text-align:center;font-size:1rem;font-weight:600;background:white;"
                                placeholder="?" oninput="checkLinksInput(this)">
                        </div>`;
                }
                
                q.text = `Complete the factor links for ${num}. Find all factor pairs!`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.hint = `Start with 1 × ${num}, then try 2, 3, 4... Stop at √${num} ≈ ${Math.floor(Math.sqrt(num))}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-orange);">Factor Links for ${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Find ALL the factor pairs (no number bank!)</div>
                    <div style="display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;">
                        <div style="flex-shrink:0;">
                            ${createFactorLinksSVG(num, { width: 260, height: 170, showAnswers: false })}
                        </div>
                        <div style="min-width:160px;padding:12px;background:var(--bg-card);border-radius:12px;">
                            <div style="font-weight:600;margin-bottom:10px;color:var(--text-dim);">Factor Pairs</div>
                            ${inputsHTML}
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:12px;background:linear-gradient(135deg, #e3f2fd, #bbdefb);border-radius:8px;border-left:4px solid #1976d2;display:inline-block;">
                        <div style="font-size:0.9rem;color:#0d47a1;">
                            <b>💡 Strategy:</b> Start with 1 × ${num}, check 2, 3, 4... until √${num} ≈ ${Math.floor(Math.sqrt(num))}
                        </div>
                    </div>
                </div>`;
                
                q.numberTheoryData = { 
                    num, 
                    factorPairs,
                    numPairs: factorPairs.length,
                    type: 'factor_links_hard' 
                };
                q.printFormat = "factor-links-hard";
                
            } else if (ntSkill === "factor_tchart_drag") {
                // Interactive Factor T-Chart with Drag & Drop
                const targetNums = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48, 56, 60];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                
                q.text = `Drag factors to build a T-chart for ${num}`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "tchart-drag";
                q.hint = `Find pairs of numbers that multiply to ${num}. Smaller number goes on the LEFT!`;
                
                // Generate unique ID for this T-chart instance
                const tchartId = 'tchart-' + Date.now();
                
                q.visual = `<div style="text-align:center;" id="${tchartId}-container">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Factor T-Chart Builder</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">
                        Drag factors from the bank to create pairs that multiply to <strong>${num}</strong>
                    </div>
                    
                    <!-- T-Chart Structure -->
                    <div id="${tchartId}" class="tchart-interactive" data-target="${num}" data-pairs="${factorPairs.length}" style="display:inline-block;margin:15px auto;min-width:220px;">
                        <div style="font-size:2rem;font-weight:700;border-bottom:4px solid var(--accent-cyan);padding-bottom:10px;margin-bottom:5px;background:linear-gradient(135deg,var(--accent-purple),var(--accent-cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${num}</div>
                        <div style="display:flex;border-left:4px solid var(--accent-cyan);">
                            <div style="min-width:100px;border-right:4px solid var(--accent-cyan);">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">← Smaller</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-drop-left" data-row="${i}" data-side="left"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);background:var(--bg-card);transition:all 0.2s;"
                                    ondragover="event.preventDefault();this.style.background='rgba(39,174,96,0.2)';this.style.borderColor='var(--accent-green)';"
                                    ondragleave="this.style.background='var(--bg-card)';this.style.borderColor='var(--text-dim)';"
                                    ondrop="handleTchartDrop(event,'${tchartId}',${i},'left',${num})">
                                    <span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>
                                </div>`).join('')}
                            </div>
                            <div style="min-width:100px;">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">Larger →</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-drop-right" data-row="${i}" data-side="right"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);background:var(--bg-card);transition:all 0.2s;"
                                    ondragover="event.preventDefault();this.style.background='rgba(39,174,96,0.2)';this.style.borderColor='var(--accent-green)';"
                                    ondragleave="this.style.background='var(--bg-card)';this.style.borderColor='var(--text-dim)';"
                                    ondrop="handleTchartDrop(event,'${tchartId}',${i},'right',${num})">
                                    <span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>
                                </div>`).join('')}
                            </div>
                            <div style="min-width:60px;display:flex;flex-direction:column;">
                                <div style="font-size:0.75rem;color:var(--text-dim);padding:4px;border-bottom:1px solid var(--text-dim);">Check</div>
                                ${factorPairs.map((_, i) => `<div class="tchart-check" data-row="${i}"
                                    style="height:50px;display:flex;align-items:center;justify-content:center;border-bottom:2px dashed var(--text-dim);font-size:1.2rem;">
                                    <span class="check-icon" style="opacity:0.3;">?</span>
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Factor Bank -->
                    <div id="${tchartId}-bank" style="margin-top:20px;background:var(--bg-card);padding:15px;border-radius:10px;">
                        <div style="font-weight:600;margin-bottom:10px;color:var(--accent-orange);">📦 Factor Bank</div>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:10px;">Drag each factor to the correct spot</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;">
                            ${scrambledFactors.map(f => `<div class="factor-tile" draggable="true" data-value="${f}"
                                style="padding:12px 18px;background:linear-gradient(135deg,var(--bg-card-light),var(--bg-card));border:3px solid var(--accent-orange);border-radius:8px;font-weight:700;font-size:1.3rem;cursor:grab;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.2);"
                                ondragstart="event.dataTransfer.setData('text/plain',${f});this.style.opacity='0.5';this.style.transform='scale(0.95)';"
                                ondragend="this.style.opacity='1';this.style.transform='scale(1)';">${f}</div>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Feedback area -->
                    <div id="${tchartId}-feedback" style="margin-top:15px;padding:10px;border-radius:8px;display:none;"></div>
                    
                    <!-- Reset button -->
                    <button onclick="resetTchart('${tchartId}',${JSON.stringify(scrambledFactors).replace(/"/g, "'")})" 
                        style="margin-top:15px;padding:8px 20px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:6px;color:var(--text);cursor:pointer;font-weight:600;">
                        🔄 Reset T-Chart
                    </button>
                </div>`;
                
                q.numberTheoryData = { 
                    num, 
                    factorPairs, 
                    allFactors,
                    scrambledFactors,
                    tchartId,
                    type: 'factor_tchart_drag' 
                };
                q.printFormat = "nt-factor-tchart-drag";
            } else if (ntSkill === "multiples") {
                // Enhanced: Multiple problem types with more variety
                const problemType = pick(["identify_multiples", "list_multiples", "fill_sequence"]);
                
                if (problemType === "identify_multiples") {
                    // Circle all multiples from a list
                    const num = pick([3, 4, 5, 6, 7, 8, 9]);
                    const count = 10;
                    
                    // Generate some multiples
                    const multiples = [];
                    for (let i = 1; i <= 6; i++) {
                        multiples.push(num * i);
                    }
                    
                    // Generate some non-multiples
                    const nonMultiples = [];
                    for (let i = 1; i <= 60 && nonMultiples.length < 4; i++) {
                        if (i % num !== 0 && !multiples.includes(i)) {
                            nonMultiples.push(i);
                        }
                    }
                    
                    const displayList = [...multiples.slice(0, 5), ...nonMultiples.slice(0, 4)].sort((a, b) => a - b);
                    const correctMultiples = displayList.filter(n => n % num === 0);
                    
                    q.text = `Circle all the multiples of ${num}:`;
                    q.ans = correctMultiples.join(", ");
                    q.answerType = "multi-select";
                    q.hint = `Multiples of ${num} are numbers you get when multiplying ${num} by 1, 2, 3, 4...`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">🔢 Identify All Multiples of ${num}</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Click all numbers that are multiples of ${num}</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:20px auto;max-width:400px;">
                            ${displayList.map(n => `<div class="multiple-item" data-num="${n}" data-multiple="${n % num === 0}"
                                style="padding:12px 16px;background:var(--bg-card);border:2px solid var(--text-dim);border-radius:8px;font-size:1.2rem;font-weight:600;cursor:pointer;min-width:45px;transition:all 0.2s;"
                                onclick="this.classList.toggle('selected');this.style.borderColor=this.classList.contains('selected')?'var(--accent-green)':'var(--text-dim)';this.style.background=this.classList.contains('selected')?'rgba(39,174,96,0.2)':'var(--bg-card)';">${n}</div>`).join('')}
                        </div>
                        <div style="margin-top:15px;font-size:0.85rem;color:var(--text-dim);">
                            Think: ${num} × ? = each number
                        </div>
                    </div>`;
                    q.numberTheoryData = { 
                        num, 
                        displayList,
                        correctMultiples,
                        type: 'multiples_identify' 
                    };
                    q.printFormat = "nt-multiples-identify";
                } else if (problemType === "list_multiples") {
                    // List first N multiples - now with variety (5, 8, 10, or 12)
                    const num = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    const count = pick([5, 8, 10, 12]);
                    const multiples = Array.from({length: count}, (_, i) => num * (i + 1));
                    
                    q.text = `List the first ${count} multiples of ${num}`;
                    q.ans = multiples.join(", ");
                    q.answerType = "text";
                    q.hint = `Multiples are ${num} × 1, ${num} × 2, ${num} × 3...`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 List Multiples</div>
                        <div style="font-size:1.3rem;margin:15px 0;">First ${count} multiples of <span style="color:var(--accent-cyan);font-weight:700;">${num}</span></div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px 0;">
                            ${Array(Math.min(count, 6)).fill(0).map((_, i) => `<span style="padding:8px 12px;border:2px dashed var(--accent-green);border-radius:6px;">${num}×${i+1}</span>`).join('')}
                            ${count > 6 ? '<span style="padding:8px 12px;">...</span>' : ''}
                        </div>
                    </div>`;
                    q.numberTheoryData = { num, multiples, count, type: 'multiples_list' };
                    q.printFormat = "nt-multiples";
                } else {
                    // Fill in missing multiples in a sequence
                    const num = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    const allMultiples = Array.from({length: 12}, (_, i) => num * (i + 1));
                    
                    // Show some, hide others randomly
                    const showCount = pick([4, 5, 6]); // How many to show
                    const showIndices = new Set();
                    while (showIndices.size < showCount) {
                        showIndices.add(Math.floor(Math.random() * 12));
                    }
                    
                    const sequence = allMultiples.map((val, i) => ({
                        value: val,
                        shown: showIndices.has(i),
                        position: i + 1
                    }));
                    
                    const missingValues = sequence.filter(s => !s.shown).map(s => s.value);
                    
                    q.text = `Fill in the missing multiples of ${num}`;
                    q.ans = missingValues.join(", ");
                    q.answerType = "text";
                    q.hint = `Count by ${num}s: ${num}, ${num*2}, ${num*3}...`;
                    
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Complete the Multiples of ${num}</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:15px auto;max-width:500px;">
                            ${sequence.map(s => s.shown 
                                ? `<span style="padding:10px 14px;background:var(--accent-cyan);color:white;border-radius:6px;font-weight:600;min-width:40px;">${s.value}</span>`
                                : `<span style="padding:10px 14px;border:2px dashed var(--accent-purple);border-radius:6px;min-width:40px;">?</span>`
                            ).join('')}
                        </div>
                    </div>`;
                    q.numberTheoryData = { num, sequence, missingValues, type: 'multiples_fill' };
                    q.printFormat = "nt-multiples-fill";
                }
            } else if (ntSkill === "gcf_easy" || ntSkill === "gcf") {
                // GCF EASY - with factor lists + distractors
                const pairs = [[12, 18], [15, 20], [16, 24], [18, 27], [20, 30], [24, 36], [12, 16], [18, 24]];
                const [a, b] = pick(pairs);
                
                const findGCF = (x, y) => {
                    while (y) { [x, y] = [y, x % y]; }
                    return x;
                };
                const gcf = findGCF(a, b);
                
                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));
                
                // Add distractors to each factor list
                const addDistractors = (factors, num) => {
                    const distractors = [];
                    for (let i = 2; i <= num + 5; i++) {
                        if (!factors.includes(i) && distractors.length < 2) distractors.push(i);
                    }
                    return [...factors, ...distractors].sort((x, y) => x - y);
                };
                const bankA = addDistractors(factorsA, a);
                const bankB = addDistractors(factorsB, b);
                
                q.ans = gcf;
                q.text = `Find the GCF of ${a} and ${b}. Use the T-charts to list factors.`;
                q.hint = `Circle/select factors from each bank, then find the greatest one both numbers share`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-green);">🟢 Greatest Common Factor (GCF)</div>
                    <div style="font-size:1.3rem;margin:10px 0;">GCF(${a}, ${b}) = ?</div>
                    
                    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;margin:20px 0;">
                        <!-- T-Chart for first number -->
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;min-width:140px;">
                            <div style="font-size:1.4rem;font-weight:700;border-bottom:3px solid #333;padding-bottom:6px;margin-bottom:10px;">${a}</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">Circle factors of ${a}:</div>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
                                ${bankA.map(f => `<span class="gcf-factor" data-num="${f}" data-factor="${a % f === 0}" 
                                    style="padding:6px 10px;background:${factorsA.includes(f)?'rgba(76,175,80,0.2)':'var(--bg-card-light)'};border:2px solid ${factorsA.includes(f)?'#4caf50':'var(--text-dim)'};border-radius:6px;font-weight:600;cursor:pointer;"
                                    onclick="this.style.background=this.style.background.includes('76,175,80')?'var(--bg-card-light)':'rgba(76,175,80,0.3)'">${f}</span>`).join('')}
                            </div>
                        </div>
                        
                        <!-- T-Chart for second number -->
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;min-width:140px;">
                            <div style="font-size:1.4rem;font-weight:700;border-bottom:3px solid #2196f3;padding-bottom:6px;margin-bottom:10px;">${b}</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">Circle factors of ${b}:</div>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
                                ${bankB.map(f => `<span class="gcf-factor" data-num="${f}" data-factor="${b % f === 0}" 
                                    style="padding:6px 10px;background:${factorsB.includes(f)?'rgba(33,150,243,0.2)':'var(--bg-card-light)'};border:2px solid ${factorsB.includes(f)?'#2196f3':'var(--text-dim)'};border-radius:6px;font-weight:600;cursor:pointer;"
                                    onclick="this.style.background=this.style.background.includes('33,150,243')?'var(--bg-card-light)':'rgba(33,150,243,0.3)'">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#e8f5e9,#e3f2fd);padding:12px;border-radius:8px;margin-top:15px;">
                        <div style="font-weight:600;margin-bottom:6px;">Common Factors:</div>
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                            ${commonFactors.map(f => `<span style="padding:6px 12px;background:white;border:2px solid #9c27b0;border-radius:6px;font-weight:700;">${f}</span>`).join('')}
                        </div>
                        <div style="margin-top:8px;font-size:0.9rem;color:#7b1fa2;">The <b>greatest</b> common factor is: <span style="font-size:1.2rem;">___</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(gcf);
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, bankA, bankB, commonFactors, type: 'gcf_easy' };
                q.printFormat = "nt-gcf-easy";
                
            } else if (ntSkill === "gcf_hard") {
                // GCF HARD - no factor lists provided
                const pairs = [[24, 36], [18, 30], [20, 35], [28, 42], [30, 45], [36, 48], [24, 40], [32, 48]];
                const [a, b] = pick(pairs);
                
                const findGCF = (x, y) => {
                    while (y) { [x, y] = [y, x % y]; }
                    return x;
                };
                const gcf = findGCF(a, b);
                
                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));
                
                q.ans = gcf;
                q.text = `Find the GCF of ${a} and ${b}. List all factors yourself!`;
                q.hint = `First list ALL factors of ${a}, then ALL factors of ${b}, then find the greatest one they share`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-orange);">🟡 Greatest Common Factor (GCF)</div>
                    <div style="font-size:1.3rem;margin:10px 0;">GCF(${a}, ${b}) = ?</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:15px;">Find ALL factors yourself - no lists provided!</div>
                    
                    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;margin:20px 0;">
                        <!-- Empty T-Chart for first number -->
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;min-width:160px;">
                            <div style="font-size:1.4rem;font-weight:700;border-bottom:3px solid #333;padding-bottom:6px;margin-bottom:10px;">${a}</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">List factors of ${a}:</div>
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
                                ${Array(6).fill(0).map(() => `<input type="text" style="width:40px;height:32px;border:2px solid #ff9800;border-radius:4px;text-align:center;font-weight:600;background:var(--bg-card-light);" placeholder="?">`).join('')}
                            </div>
                        </div>
                        
                        <!-- Empty T-Chart for second number -->
                        <div style="background:var(--bg-card);padding:15px;border-radius:10px;min-width:160px;">
                            <div style="font-size:1.4rem;font-weight:700;border-bottom:3px solid #333;padding-bottom:6px;margin-bottom:10px;">${b}</div>
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">List factors of ${b}:</div>
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
                                ${Array(6).fill(0).map(() => `<input type="text" style="width:40px;height:32px;border:2px solid #ff9800;border-radius:4px;text-align:center;font-weight:600;background:var(--bg-card-light);" placeholder="?">`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);padding:12px;border-radius:8px;margin-top:15px;border-left:4px solid #ff9800;">
                        <div style="font-size:0.9rem;"
                            <b>💡 Strategy:</b> List factors of each number (1, 2, 3...), then circle the ones they share. The biggest circled number is the GCF!
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(gcf);
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, commonFactors, type: 'gcf_hard' };
                q.printFormat = "nt-gcf-hard";
                
            } else if (ntSkill === "lcm") {
                // Least Common Multiple
                const pairs = [[3, 4], [4, 5], [3, 5], [4, 6], [6, 8], [5, 6]];
                const [a, b] = pick(pairs);
                
                const findLCM = (x, y) => {
                    const findGCF = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                    return (x * y) / findGCF(x, y);
                };
                const lcm = findLCM(a, b);
                
                const multiplesA = Array.from({length: Math.ceil(lcm/a) + 2}, (_, i) => a * (i + 1));
                const multiplesB = Array.from({length: Math.ceil(lcm/b) + 2}, (_, i) => b * (i + 1));
                
                q.ans = lcm;
                q.text = `Find the LCM of ${a} and ${b}`;
                q.hint = `List multiples of each until you find the smallest one they share`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Least Common Multiple</div>
                    <div style="font-size:1.5rem;margin:15px 0;">LCM(${a}, ${b}) = ?</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:8px;margin:10px auto;max-width:350px;">
                        <div style="margin-bottom:10px;">
                            <span style="font-weight:600;">Multiples of ${a}:</span>
                            <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:5px;">
                                ${multiplesA.slice(0, 8).map(m => `<span style="padding:4px 8px;background:${m === lcm?'rgba(39,174,96,0.4)':'var(--bg-card-light)'};border-radius:4px;font-size:0.9rem;${m===lcm?'font-weight:700;':''}">${m}</span>`).join('')}
                            </div>
                        </div>
                        <div>
                            <span style="font-weight:600;">Multiples of ${b}:</span>
                            <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:5px;">
                                ${multiplesB.slice(0, 8).map(m => `<span style="padding:4px 8px;background:${m === lcm?'rgba(39,174,96,0.4)':'var(--bg-card-light)'};border-radius:4px;font-size:0.9rem;${m===lcm?'font-weight:700;':''}">${m}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(lcm);
                q.numberTheoryData = { a, b, lcm, multiplesA, multiplesB, type: 'lcm' };
                q.printFormat = "nt-lcm";
            } else if (ntSkill === "divisibility") {
                // Divisibility rules - full support for 1-12
                // Use selected divisors if available, otherwise default to all
                const availableDivisors = (typeof selectedDivisors !== 'undefined' && selectedDivisors.length > 0) 
                    ? selectedDivisors 
                    : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const divisor = pick(availableDivisors);
                const isDivisible = Math.random() < 0.5;
                let num;
                
                if (isDivisible) {
                    num = divisor * rng(10, 99);
                } else {
                    num = divisor * rng(10, 99) + rng(1, divisor - 1);
                }
                
                q.text = `Is ${num} divisible by ${divisor}?`;
                q.ans = isDivisible ? "Yes" : "No";
                q.answerType = "choice";
                q.options = ["Yes", "No"];
                
                const rules = {
                    2: "Even numbers (last digit is 0, 2, 4, 6, or 8)",
                    3: "Sum of all digits is divisible by 3",
                    4: "Last two digits form a number divisible by 4",
                    5: "Last digit is 0 or 5",
                    6: "Divisible by BOTH 2 AND 3",
                    7: "Double the last digit, subtract from the rest - result divisible by 7",
                    8: "Last three digits form a number divisible by 8",
                    9: "Sum of all digits is divisible by 9",
                    10: "Last digit is 0",
                    11: "Alternating sum of digits is divisible by 11 (or 0)",
                    12: "Divisible by BOTH 3 AND 4"
                };
                q.hint = `Rule for ${divisor}: ${rules[divisor]}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Divisibility Rules</div>
                    <div style="font-size:2rem;font-weight:700;margin:15px 0;">${num}</div>
                    <div style="font-size:1.2rem;margin:10px 0;">Is this divisible by <span style="color:var(--accent-cyan);font-weight:700;">${divisor}</span>?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:15px auto;max-width:320px;font-size:0.9rem;border:1px solid var(--border-light);">
                        <strong>Rule for ${divisor}:</strong><br/>${rules[divisor]}
                    </div>
                </div>`;
                q.numberTheoryData = { num, divisor, isDivisible, type: 'divisibility' };
                q.printFormat = "nt-divisibility";
            } else if (ntSkill === "divisibility_sort") {
                // Divisibility Sorting - drag 4 numbers into correct boxes
                // Use selected divisors if available
                const availableDivisors = (typeof selectedDivisors !== 'undefined' && selectedDivisors.length > 0) 
                    ? selectedDivisors 
                    : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const divisor = pick(availableDivisors);
                
                // Generate 4 numbers - mix of divisible and not divisible
                const numbers = [];
                const numDivisible = rng(1, 3); // 1 to 3 divisible numbers
                
                // Add divisible numbers
                for (let i = 0; i < numDivisible; i++) {
                    let num;
                    do {
                        num = divisor * rng(5, 99);
                    } while (numbers.includes(num));
                    numbers.push(num);
                }
                
                // Add non-divisible numbers
                for (let i = numDivisible; i < 4; i++) {
                    let num;
                    do {
                        num = divisor * rng(5, 99) + rng(1, divisor - 1);
                    } while (numbers.includes(num) || num % divisor === 0);
                    numbers.push(num);
                }
                
                // Shuffle numbers
                const shuffled = [...numbers].sort(() => Math.random() - 0.5);
                
                // Determine correct answers
                const divisibleNums = shuffled.filter(n => n % divisor === 0);
                const notDivisibleNums = shuffled.filter(n => n % divisor !== 0);
                
                q.text = `Sort these numbers: Which are divisible by ${divisor}?`;
                q.answerType = "divisibility-sort";
                q.divisibilitySortData = {
                    divisor,
                    numbers: shuffled,
                    divisible: divisibleNums,
                    notDivisible: notDivisibleNums
                };
                q.ans = `Divisible: ${divisibleNums.join(', ')} | Not: ${notDivisibleNums.join(', ')}`;
                
                // Divisibility rules for help popup
                const rules = {
                    1: { rule: "All integers are divisible by 1", example: "123, 500, 7" },
                    2: { rule: "Last digit is 0, 2, 4, 6, or 8", example: "128 (ends in 8)" },
                    3: { rule: "Sum of digits is divisible by 3", example: "375 → 3+7+5=15 → divisible by 3" },
                    4: { rule: "Last 2 digits form a number divisible by 4", example: "528 → 28÷4=7 ✓" },
                    5: { rule: "Last digit is 0 or 5", example: "345, 910" },
                    6: { rule: "Divisible by BOTH 2 AND 3", example: "756 (even & 7+5+6=18)" },
                    7: { rule: "Double last digit, subtract from rest", example: "161 → 16-2×1=14 → 14÷7=2 ✓" },
                    8: { rule: "Last 3 digits divisible by 8", example: "5128 → 128÷8=16 ✓" },
                    9: { rule: "Sum of digits is divisible by 9", example: "126 → 1+2+6=9 ✓" },
                    10: { rule: "Last digit is 0", example: "680, 200" },
                    11: { rule: "Alternating sum of digits divisible by 11", example: "121 → 1-2+1=0 ✓" },
                    12: { rule: "Divisible by BOTH 3 AND 4", example: "144 → sum=9, last 2=44" }
                };
                
                const ruleInfo = rules[divisor];
                q.hint = `Rule for ${divisor}: ${ruleInfo.rule}. Example: ${ruleInfo.example}`;
                
                // Build interactive visual with drag-and-drop boxes
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <div style="font-weight:700;color:var(--accent-purple);">🔢 Divisibility Sorting</div>
                        <button class="hint-btn-small" onclick="showDivisibilityHelp(${divisor})" style="padding:6px 12px;font-size:0.85rem;background:var(--accent-purple);color:white;border:none;border-radius:6px;cursor:pointer;">
                            📖 Rules Help
                        </button>
                    </div>
                    
                    <div style="font-size:1.1rem;margin-bottom:15px;">
                        Sort these numbers by divisibility by <span style="color:var(--accent-cyan);font-weight:700;font-size:1.4rem;">${divisor}</span>
                    </div>
                    
                    <!-- Numbers to drag -->
                    <div id="divSortNumbers" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:15px 0;min-height:60px;padding:10px;background:var(--bg-card-light);border-radius:10px;">
                        ${shuffled.map((n, i) => `
                            <div class="div-sort-number" draggable="true" data-num="${n}" data-index="${i}" 
                                style="padding:12px 18px;background:linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));color:white;border-radius:10px;font-size:1.3rem;font-weight:700;cursor:grab;user-select:none;box-shadow:0 3px 10px rgba(0,0,0,0.2);transition:transform 0.15s,box-shadow 0.15s;"
                                onmousedown="this.style.cursor='grabbing'"
                                onmouseup="this.style.cursor='grab'"
                                onclick="toggleDivSortNumber(this, ${divisor})">
                                ${n}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Drop zones -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px;">
                        <div id="divSortYes" class="div-sort-box" data-type="yes"
                            style="min-height:100px;padding:15px;border:3px dashed var(--correct);border-radius:12px;background:rgba(6,214,160,0.1);"
                            ondragover="event.preventDefault();this.style.background='rgba(6,214,160,0.25)'"
                            ondragleave="this.style.background='rgba(6,214,160,0.1)'"
                            ondrop="dropDivSortNumber(event, 'yes', ${divisor})">
                            <div style="font-weight:700;color:var(--correct);margin-bottom:10px;font-size:0.95rem;">✓ Divisible by ${divisor}</div>
                            <div class="div-sort-dropped" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px;"></div>
                        </div>
                        <div id="divSortNo" class="div-sort-box" data-type="no"
                            style="min-height:100px;padding:15px;border:3px dashed var(--incorrect);border-radius:12px;background:rgba(239,71,111,0.1);"
                            ondragover="event.preventDefault();this.style.background='rgba(239,71,111,0.25)'"
                            ondragleave="this.style.background='rgba(239,71,111,0.1)'"
                            ondrop="dropDivSortNumber(event, 'no', ${divisor})">
                            <div style="font-weight:700;color:var(--incorrect);margin-bottom:10px;font-size:0.95rem;">✗ NOT Divisible by ${divisor}</div>
                            <div class="div-sort-dropped" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top:12px;font-size:0.85rem;color:var(--text-dim);">
                        Tap a number, then tap a box to sort (or drag & drop)
                    </div>
                </div>`;
                
                q.numberTheoryData = { divisor, numbers: shuffled, divisibleNums, notDivisibleNums, type: 'divisibility_sort' };
                q.printFormat = "nt-divisibility-sort";
            } else if (ntSkill === "even_odd") {
                // Even and odd
                const num = rng(1, 500);
                const isEven = num % 2 === 0;
                
                q.text = `Is ${num} even or odd?`;
                q.ans = isEven ? "Even" : "Odd";
                q.answerType = "choice";
                q.options = ["Even", "Odd"];
                q.hint = `Even numbers end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">🔢 Even or Odd?</div>
                    <div style="font-size:3rem;font-weight:700;margin:20px 0;">${num}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Look at the ones digit: ${num % 10}</div>
                </div>`;
                q.numberTheoryData = { num, isEven, type: 'even_odd' };
                q.printFormat = "nt-even-odd";
            }
            break;
        }
        case "all_mixed": {
            // Mixed - All Categories: pick a random SKILL with equal probability
            // Domain-specific category groups
            const domainCategories = {
                'domain_mixed_number_operations': ["operations", "integers"],
                'domain_mixed_fractions_decimals': ["fractions", "decimals", "conversions"],
                'domain_mixed_geometry_measurement': ["geometry", "measurement"],
                'domain_mixed_data_statistics': ["data_stats"],
                'domain_mixed_algebraic_thinking': ["patterns", "algebra", "order_of_operations", "placevalue", "rounding", "estimation", "number_theory"]
            };
            
            // Complete skill lists for each category (MUST include ALL skills for proper mapping)
            const categorySkillMap = {
                'operations': ['add', 'subtract', 'multiply', 'divide', 
                               'add_facts', 'sub_facts', 'mult_facts', 'div_facts',  // FACTS SKILLS
                               'add_sub_10s', 'add_sub_100s',  // 10s and 100s skills
                               'add_word_problems', 'sub_word_problems', 'mult_word_problems', 'div_word_problems', 
                               'area_model_mult', 'area_model_mult_hard', 'area_model_div_2by1', 'area_model_div_3by1', 
                               'add_sub_fact_family', 'mult_div_fact_family', 
                               'number_families_add', 'number_families_add_med', 'number_families_add_hard',
                               'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard',
                               'number_families_mixed', 'number_families_mixed_med', 'number_families_mixed_hard',
                               'missing_add_sub', 'missing_mult_div', 'mixed_add_sub', 'mixed_mult_div'],
                // Also map individual operation categories to operations
                'addition': ['add', 'add_facts', 'add_sub_10s', 'add_sub_100s', 'add_word_problems', 'add_sub_fact_family', 
                             'number_families_add', 'number_families_add_med', 'number_families_add_hard'],
                'subtraction': ['subtract', 'sub_facts', 'sub_word_problems', 'missing_add_sub', 'mixed_add_sub'],
                'multiplication': ['multiply', 'mult_facts', 'mult_word_problems', 'area_model_mult', 'area_model_mult_hard',
                                   'mult_div_fact_family', 'number_families_mult', 'number_families_mult_med', 'number_families_mult_hard'],
                'division': ['divide', 'div_facts', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1',
                             'missing_mult_div', 'mixed_mult_div'],
                'integers': ['number_line_int', 'compare_int', 'add_int', 'sub_int'],
                'fractions': ['identify', 'equivalent', 'compare', 'simplify', 'improper_mixed'],
                'decimals': ['add_decimal', 'sub_decimal', 'mult_decimal', 'div_decimal', 'compare_decimal'],
                'conversions': ['f_to_d', 'd_to_f', 'f_to_p', 'p_to_f'],
                'geometry': ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume',
                             'identify_angles', 'measure_angles', 'identify_lines', 'symmetry',
                             'classify_triangles', 'classify_quads',
                             'coordinate_q1', 'coordinate_all', 'coordinate_graph'],
                'area_perimeter': ['perimeter', 'area', 'area_perimeter', 'composite_shapes', 'volume'],
                'angles_lines': ['identify_angles', 'measure_angles', 'identify_lines', 'symmetry'],
                'shapes_classify': ['classify_triangles', 'classify_quads'],
                'coordinates': ['coordinate_q1', 'coordinate_all', 'coordinate_graph'],
                'measurement': ['time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min',
                                'time_analog_digital', 'time_match_clock',
                                'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
                                'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard',
                                'money', 'temperature', 'capacity'],
                'data_stats': ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart',
                               'mean', 'median', 'mode', 'range', 'probability_basic'],
                'graphs': ['bar_graph', 'pictograph', 'tally_chart', 'line_plot', 'pie_chart'],
                'data_analysis': ['mean', 'median', 'mode', 'range'],
                'probability': ['probability_basic'],
                'order_of_operations': ['two_ops_no_paren', 'three_ops_no_paren', 'paren_simple', 'paren_multi', 'exponents_simple'],
                'estimation': ['estimate_sum', 'estimate_diff', 'nearest_10', 'nearest_100', 'nearest_1000'],
                'number_sense': ['nearest_10', 'nearest_100', 'nearest_1000', 'estimate_sum', 'estimate_diff'],
                'patterns': ['seq_2', 'seq_5', 'seq_10', 'count_by_fill', 'double', 'halve'],
                'algebra': ['solve_unknown', 'write_expression', 'evaluate_expression', 'inequalities', 'function_table'],
                'placevalue': ['pv_identify', 'pv_value', 'pv_compare', 'expand', 'combine'],
                'rounding': ['nearest_10', 'nearest_100', 'nearest_1000'],
                'number_theory': ['prime_composite', 'factors', 'factor_pairs', 'factors_identify', 
                                  'factor_tchart_easy', 'factor_tchart_medium', 'factor_tchart_hard', 
                                  'factor_links', 'factor_links_easy', 'factor_links_medium', 'factor_links_hard', 
                                  'multiples', 'gcf', 'gcf_easy', 'gcf_hard', 'lcm']
            };
            
            // Determine which categories to use based on original category
            const originalCategory = state.category;
            let categoriesToUse = Object.keys(categorySkillMap); // All categories by default
            if (originalCategory && originalCategory.startsWith('domain_mixed_')) {
                categoriesToUse = domainCategories[originalCategory] || categoriesToUse;
            }
            
            // FLATTEN all skills from selected categories into one list for EQUAL probability
            let allSkillsFlattened = [];
            categoriesToUse.forEach(cat => {
                if (categorySkillMap[cat]) {
                    allSkillsFlattened = allSkillsFlattened.concat(categorySkillMap[cat]);
                }
            });
            
            // Handle custom_mixed with user-selected skills
            let targetCategory, targetSkill;
            
            // For custom_mixed, we need to preserve category-skill pairs
            let skillsWithCategories = [];
            
            try {
                if (state.skill === "custom_mixed" && state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
                    const selectedSkills = state.mixedModeSettings.selectedSkills;
                    // Build array of {skill, category} pairs to preserve category info
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
            
            // Pick a random skill - use skillsWithCategories if available (custom_mixed mode)
            if (skillsWithCategories.length > 0) {
                // Pick from custom-selected skills with their categories preserved
                const picked = pick(skillsWithCategories);
                targetSkill = picked.skill;
                targetCategory = picked.category;
                console.log(`custom_mixed picked: skill=${targetSkill}, category=${targetCategory}`);
            } else if (allSkillsFlattened.length > 0) {
                // Fallback: pick from flattened list and lookup category
                targetSkill = pick(allSkillsFlattened);
                // Determine category from the skill
                for (const [cat, skills] of Object.entries(categorySkillMap)) {
                    if (skills.includes(targetSkill)) {
                        targetCategory = cat;
                        break;
                    }
                }
            }
            
            // Fallback
            if (!targetCategory) {
                targetCategory = pick(categoriesToUse);
            }
            if (!targetSkill) {
                const skillsForCategory = categorySkillMap[targetCategory];
                targetSkill = skillsForCategory ? pick(skillsForCategory) : 'add';
            }
            
            // Save current state
            const savedCategory = state.category;
            const savedSkill = state.skill;
            
            // Temporarily set state to the target category/skill
            state.category = targetCategory;
            state.skill = targetSkill;
            
            // Apply skill mapping
            const mappedTargetSkill = skillMapping[targetSkill] || targetSkill;
            
            // Console log for debugging
            console.log(`all_mixed: targetCategory=${targetCategory}, targetSkill=${targetSkill}, mappedSkill=${mappedTargetSkill}`);
            
            // Now delegate to the proper case by re-entering the switch
            // We need to call the actual generation logic for each category
            
            // Map categories to their switch cases
            const caseMapping = {
                'operations': 'operations',
                'integers': 'operations',
                'addition': 'operations',
                'subtraction': 'operations', 
                'multiplication': 'operations',
                'division': 'operations',
                'fractions': 'fractions',
                'decimals': 'decimals',
                'conversions': 'fractions',
                'geometry': 'geometry',
                'area_perimeter': 'geometry',
                'angles_lines': 'geometry',
                'shapes_classify': 'geometry',
                'coordinates': 'geometry',
                'measurement': 'measurement',
                'data_stats': 'data_stats',
                'graphs': 'data_stats',
                'data_analysis': 'data_stats',
                'probability': 'data_stats',
                'order_of_operations': 'order_of_operations',
                'estimation': 'estimation',
                'number_sense': 'estimation',
                'patterns': 'algebra',
                'algebra': 'algebra',
                'placevalue': 'placevalue',
                'rounding': 'rounding',
                'number_theory': 'number_theory'
            };
            
            const targetCase = caseMapping[targetCategory] || 'operations';
            
            // FIXED: Use recursive call to properly generate question with selected skill
            // State is already set to targetCategory/targetSkill at lines 20742-20743
            // We DON'T restore state here - let it stay as targetCategory/targetSkill
            
            console.log(`all_mixed recursive call: category=${state.category}, skill=${state.skill}`);
            
            // Call generateQuestion recursively - since state.category is now the actual 
            // category (like 'addition'), not 'all_mixed', this won't cause infinite recursion
            const recursiveQ = generateQuestion();
            
            // Copy all properties from recursive result to q
            Object.assign(q, recursiveQ);
            
            // Restore original state after generation
            state.category = savedCategory;
            state.skill = savedSkill;
            
            // Set skill label for the question
            q.skillLabel = getSkillLabelForQuestion(targetSkill, targetCategory);
            
            break;
        }
        default:
            q.text = "10 + 10 = ?";
            q.ans = 20;
            q.options = buildNumericOptions(20);
    }

    if (state.difficulty === "hard" || !q.options.length) q.options = [];

    return q;
}

