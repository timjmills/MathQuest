// Data constants - DOMAINS, SKILLS, SKILL_CODES, DEFAULT_TABLES, GRADE system

export const DEFAULT_TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

// ===== GRADE LEVEL SYSTEM (CCSS-aligned) =====
export const GRADE_COLORS = {
    'K': { bg: '#26C6DA', text: '#fff', label: 'Kindergarten' },
    1: { bg: '#29B6F6', text: '#fff', label: 'Grade 1' },
    2: { bg: '#66BB6A', text: '#fff', label: 'Grade 2' },
    3: { bg: '#FDD835', text: '#333', label: 'Grade 3' },
    4: { bg: '#FFA726', text: '#fff', label: 'Grade 4' },
    5: { bg: '#EF5350', text: '#fff', label: 'Grade 5' },
    6: { bg: '#AB47BC', text: '#fff', label: 'Grade 6' },
    7: { bg: '#78909C', text: '#fff', label: 'Grade 7' },
    'M': { bg: '#9E9E9E', text: '#fff', label: 'Mixed' }
};

// CCSS-aligned grade for every skill. Category-prefixed keys resolve collisions
// (e.g. "identify" exists in both fractions and placevalue).
export const SKILL_GRADES = {
    // Counting & Cardinality (K-3)
    'count_objects': 'K', 'count_sequence': 'K',
    'compare_groups': 'K', 'compare_objects': 'K', 'classify_count': 'K',
    'number_bonds': 'K', 'make_ten': 'K', 'teen_compose': 'K',
    'more_less_10': 1, 'more_less_100': 2,
    'odd_even': 2, 'number_word_form': 2,
    'fraction_number_line': 3, 'whole_as_fraction': 3,
    // Number & Operations
    'add_three': 1, 'comparison_word': 1, 'equal_sign': 1,
    'mult_comparison': 4, 'mult_comparison_plain': 4, 'long_div_2digit': 5,
    'nl_add': 1, 'nl_sub': 1, 'nl_mult': 3, 'nl_div': 3,
    'add': 1, 'subtract': 1, 'add_facts': 1, 'sub_facts': 1,
    'add_sub_10s': 1, 'add_sub_fact_family': 1, 'number_families_add': 1, 'missing_add_sub': 1,
    'add_sub_100s': 2, 'add_word_problems': 2, 'add_word_problems_plain': 2, 'sub_word_problems': 2, 'sub_word_problems_plain': 2,
    'number_families_add_med': 2, 'number_families_add_hard': 2,
    'mixed_add_sub': 2, 'arrays_groups': 2, 'number_families_mixed': 2,
    // Explicit addition/subtraction by range & regrouping
    'add_10_no_regroup': 'K', 'add_10_regroup': 'K', 'add_10_mixed': 'K',
    'sub_10_no_regroup': 'K', 'sub_10_regroup': 'K', 'sub_10_mixed': 'K',
    'add_wp_10': 'K', 'sub_wp_10': 'K', 'add_wp_10_plain': 'K', 'sub_wp_10_plain': 'K',
    'add_20_no_regroup': 1, 'add_20_regroup': 1, 'add_20_mixed': 1,
    'sub_20_no_regroup': 1, 'sub_20_regroup': 1, 'sub_20_mixed': 1,
    'add_wp_20': 1, 'sub_wp_20': 1, 'add_wp_20_plain': 1, 'sub_wp_20_plain': 1,
    'add_50_no_regroup': 2, 'add_50_regroup': 2, 'add_50_mixed': 2,
    'sub_50_no_regroup': 2, 'sub_50_regroup': 2, 'sub_50_mixed': 2,
    'add_wp_50': 2, 'sub_wp_50': 2, 'add_wp_50_plain': 2, 'sub_wp_50_plain': 2,
    'add_100_no_regroup': 2, 'add_100_regroup': 2, 'add_100_mixed': 2,
    'sub_100_no_regroup': 2, 'sub_100_regroup': 2, 'sub_100_mixed': 2,
    'add_wp_100': 2, 'sub_wp_100': 2, 'add_wp_100_plain': 2, 'sub_wp_100_plain': 2,
    'add_1k_no_regroup': 3, 'add_1k_regroup': 3, 'add_1k_mixed': 3,
    'sub_1k_no_regroup': 3, 'sub_1k_regroup': 3, 'sub_1k_mixed': 3,
    'add_wp_1k': 3, 'sub_wp_1k': 3, 'add_wp_1k_plain': 3, 'sub_wp_1k_plain': 3,
    'add_10k_no_regroup': 4, 'add_10k_regroup': 4, 'add_10k_mixed': 4,
    'sub_10k_no_regroup': 4, 'sub_10k_regroup': 4, 'sub_10k_mixed': 4,
    'add_wp_10k': 4, 'sub_wp_10k': 4, 'add_wp_10k_plain': 4, 'sub_wp_10k_plain': 4,
    'add_100k_no_regroup': 5, 'add_100k_regroup': 5, 'add_100k_mixed': 5,
    'sub_100k_no_regroup': 5, 'sub_100k_regroup': 5, 'sub_100k_mixed': 5,
    'add_wp_100k': 5, 'sub_wp_100k': 5, 'add_wp_100k_plain': 5, 'sub_wp_100k_plain': 5,
    'add_1m_no_regroup': 5, 'add_1m_regroup': 5, 'add_1m_mixed': 5,
    'sub_1m_no_regroup': 5, 'sub_1m_regroup': 5, 'sub_1m_mixed': 5,
    'add_wp_1m': 5, 'sub_wp_1m': 5, 'add_wp_1m_plain': 5, 'sub_wp_1m_plain': 5,
    'multiply': 3, 'divide': 3, 'mult_facts': 3, 'div_facts': 3,
    'mult_word_problems': 3, 'mult_word_problems_plain': 3, 'div_word_problems': 3, 'div_word_problems_plain': 3, 'mult_div_fact_family': 3,
    'number_families_mult': 3, 'number_families_mult_med': 3,
    'missing_mult_div': 3, 'mixed_mult_div': 3, 'mult_properties': 3, 'mult_chart': 3,
    'number_families_mixed_med': 3, 'word_problems_mixed': 3, 'word_problems_mixed_plain': 3,
    'number_families_mult_hard': 4, 'number_families_mixed_hard': 4,
    'div_remainders': 4, 'area_model_mult': 4, 'area_model_div_2by1': 4,
    'area_model_mult_hard': 5, 'area_model_div_3by1': 5,
    // Integers
    'number_line_int': 6, 'compare_int': 6, 'add_int': 6, 'sub_int': 6,
    // Fraction Operations
    'add_fractions_like': 4, 'sub_fractions_like': 4, 'add_mixed_like': 4, 'sub_mixed_like': 4,
    'mult_frac_whole': 4, 'decompose_fractions': 4, 'frac_word_problems': 4, 'frac_word_problems_plain': 4, 'frac_10_100': 4,
    'add_frac_unlike': 5, 'sub_frac_unlike': 5, 'add_mixed_unlike': 5, 'sub_mixed_unlike': 5,
    'add_frac_like_nv': 4, 'sub_frac_like_nv': 4, 'add_mixed_like_nv': 4, 'sub_mixed_like_nv': 4,
    'add_frac_unlike_nv': 5, 'sub_frac_unlike_nv': 5, 'add_mixed_unlike_nv': 5, 'sub_mixed_unlike_nv': 5,
    'identify_nv': 3, 'fraction_of_set_nv': 3,
    'fraction_of_set_hard_nv': 4,
    'mult_frac_whole_nv': 4, 'decompose_frac_nv': 4, 'frac_10_100_nv': 4,
    'mult_frac_frac_nv': 5, 'div_unit_frac_nv': 5, 'frac_as_div_nv': 5, 'mult_scaling_nv': 5,
    'mixed_fraction_ops': 5,
    'mult_frac_frac': 5, 'div_unit_fraction': 5, 'frac_as_division': 5,
    'mult_scaling': 5, 'frac_mult_word': 5, 'frac_mult_word_plain': 5, 'frac_word_mixed': 4, 'frac_word_mixed_plain': 4,
    // Fractions (prefixed to avoid collision with placevalue)
    'fractions:identify': 3, 'equiv_frac_visual': 3, 'equiv_frac_nv': 3, 'fraction_of_set': 3,
    'equivalent': 4, 'fractions:compare': 4, 'simplify': 4, 'improper_mixed': 4, 'mixed_improper_visual': 4, 'fraction_of_set_hard': 4,
    // Decimals
    'compare_decimal': 4, 'round_decimals': 5,
    'add_decimal': 5, 'sub_decimal': 5, 'mult_decimal': 5,
    'div_decimal': 6,
    // Conversions
    'f_to_d': 4, 'd_to_f': 4, 'f_to_p': 6, 'p_to_f': 6,
    // Early Shapes (K-2)
    'name_2d_shapes': 'K', 'name_3d_shapes': 'K', 'shape_positions': 'K', 'compose_shapes': 'K',
    'order_objects_length': 1, 'measure_nonstandard': 1, 'shape_attributes': 1,
    'partition_shapes': 1, 'estimate_length': 2,
    // Geometry
    'additive_angles': 4, 'volume_composite': 5,
    'perimeter': 3, 'area': 3, 'area_unit_squares': 3, 'perimeter_grid': 3,
    'area_perimeter': 4, 'identify_angles': 4, 'measure_angles': 4,
    'identify_lines': 4, 'symmetry': 4, 'classify_triangles': 4,
    'classify_quads': 5, 'coordinate_q1': 5, 'coordinate_graph': 5, 'volume': 5,
    'composite_shapes': 6, 'coordinate_all': 6,
    // Measurement
    'time_hour': 1, 'time_half_hour': 1,
    'time_quarter': 2, 'time_5min': 2, 'time_1min': 2,
    'time_analog_digital': 2, 'time_match_clock': 2,
    'reading_ruler': 2, 'money_count': 2, 'money': 2,
    'elapsed_30min': 3, 'elapsed_hour': 3, 'elapsed_15min': 3,
    'elapsed_mixed': 3, 'elapsed_find_duration': 3,
    'elapsed_visual_easy': 3, 'elapsed_visual_medium': 3,
    'reading_ruler_hard': 3, 'temperature': 3,
    'elapsed_visual_hard': 4, 'capacity': 4, 'unit_conversions': 4,
    'mass_volume_liquid': 3,
    // Data & Statistics
    'tally_chart': 2,
    'bar_graph': 3, 'pictograph': 3, 'line_plot': 3,
    'line_plot_fractions': 4,
    'pie_chart': 5,
    'mean': 6, 'median': 6, 'mode': 6, 'range': 6,
    'probability_basic': 7,
    // Patterns
    'pattern_relationship': 5,
    'seq_2': 2, 'seq_5': 2, 'seq_10': 2, 'count_by_fill': 2,
    'skip_count_line': 2, 'skip_count_grid': 2, 'double': 2, 'halve': 2,
    'shape_pattern': 4, 'number_pattern': 4,
    // Algebra
    'tape_diagram': 4, 'tape_diagram_plain': 4, 'multi_step_word': 4, 'multi_step_word_plain': 4, 'algebra_word_mixed': 4, 'algebra_word_mixed_plain': 4, 'function_table_easy': 4,
    'function_table_hard': 5,
    'solve_unknown': 6, 'write_expression': 6, 'evaluate_expression': 6, 'inequalities': 6,
    // Order of Operations
    'two_ops_no_paren': 5, 'three_ops_no_paren': 5, 'paren_simple': 5, 'paren_multi': 5,
    'exponents_simple': 6,
    // Place Value (prefixed to avoid collision with fractions)
    'place_value_disks': 2, 'place_value_10x': 5, 'placevalue:identify': 2, 'value': 2,
    'placevalue:compare': 2, 'expand': 2, 'combine': 2,
    // Number Sense
    'rounding_visual': 3, 'nearest_10': 3, 'nearest_100': 3, 'nearest_1000': 3,
    'estimate_sum': 3, 'estimate_diff': 3,
    // Number Theory
    'prime_composite': 4, 'factors_identify': 4,
    'factor_tchart_easy': 4, 'factor_tchart_medium': 4, 'factor_tchart_hard': 4,
    'factor_links_easy': 4, 'factor_links_medium': 4, 'factor_links_hard': 4,
    'multiples': 4,
    'gcf_easy': 6, 'gcf_hard': 6, 'lcm': 6,
};

// Look up grade for a skill, resolving category collisions
export function getSkillGrade(skillValue, categoryId) {
    if (categoryId && SKILL_GRADES[`${categoryId}:${skillValue}`] !== undefined) {
        return SKILL_GRADES[`${categoryId}:${skillValue}`];
    }
    if (SKILL_GRADES[skillValue] !== undefined) {
        return SKILL_GRADES[skillValue];
    }
    if (skillValue && (skillValue.startsWith('mixed_') || skillValue === 'mixed' ||
        skillValue.endsWith('_all') || skillValue === 'all_domains_mixed' || skillValue === 'custom_mixed')) {
        return 'M';
    }
    return null;
}

// HTML colored circle with grade number (for rich rendering contexts)
export function gradeCircleHTML(grade) {
    if (grade === null || grade === undefined) return '';
    const c = GRADE_COLORS[grade];
    if (!c) return '';
    return `<span class="grade-circle" style="background:${c.bg};color:${c.text}" title="${c.label}">${grade}</span>`;
}

// Unicode circled number (for text-only contexts like <option> elements)
export function gradeCircleText(grade) {
    const circled = { 'K':'\u24C0', 1:'\u2460', 2:'\u2461', 3:'\u2462', 4:'\u2463', 5:'\u2464', 6:'\u2465', 7:'\u2466', 'M':'\u24C2' };
    return circled[grade] || '';
}

// Sort skills array by grade (lowest first), mixed/meta skills at end
export function sortByGrade(skills, categoryId) {
    return [...skills].sort((a, b) => {
        const ga = getSkillGrade(a.v, categoryId);
        const gb = getSkillGrade(b.v, categoryId);
        const na = ga === 'M' ? 99 : (ga || 50);
        const nb = gb === 'M' ? 99 : (gb || 50);
        return na - nb;
    });
}

export const DOMAINS = {
    counting_cardinality: {
        id: "counting_cardinality",
        name: "Counting & Cardinality",
        icon: "🔢",
        color: "#26C6DA",
        description: "Counting, comparing, and composing numbers (K-3)",
        categories: [
            { id: "counting", name: "Counting", icon: "🔢", desc: "Count objects and sequences" },
            { id: "comparing", name: "Comparing", icon: "⚖️", desc: "Compare groups and numbers" },
            { id: "composing", name: "Number Sense", icon: "🧩", desc: "Number bonds, making 10, odd/even" },
            { id: "counting_mixed", name: "Mixed Counting", icon: "🎲", desc: "All counting & cardinality skills" },
        ]
    },
    number_operations: {
        id: "number_operations",
        name: "Number & Operations",
        icon: "🔢",
        color: "#4CAF50",
        description: "Master basic operations with whole numbers and integers",
        categories: [
            { id: "addition", name: "Addition", icon: "➕", desc: "Adding whole numbers" },
            { id: "subtraction", name: "Subtraction", icon: "➖", desc: "Subtracting whole numbers" },
            { id: "multiplication", name: "Multiplication", icon: "✖️", desc: "Multiplying whole numbers" },
            { id: "division", name: "Division", icon: "➗", desc: "Dividing whole numbers" },
            { id: "integers", name: "Integers", icon: "🔢", desc: "Positive and negative numbers" },
            { id: "number_ops_mixed", name: "Mixed Operations", icon: "🎲", desc: "All operations combined" },
        ]
    },
    fractions_decimals: {
        id: "fractions_decimals",
        name: "Fractions, Decimals & Percents",
        icon: "🥧",
        color: "#2196F3",
        description: "Work with fractions, decimals, and conversions",
        categories: [
            { id: "fractions", name: "Fractions", icon: "½", desc: "Understanding and operations with fractions" },
            { id: "fraction_operations", name: "Fraction Operations", icon: "➕½", desc: "Add, subtract, multiply, divide fractions" },
            { id: "decimals", name: "Decimals", icon: "🔢", desc: "Decimal operations and comparisons" },
            { id: "conversions", name: "Conversions", icon: "🔀", desc: "Convert between fractions, decimals, and percents" },
            { id: "frac_dec_mixed", name: "Mixed FDP", icon: "🎲", desc: "All fractions, decimals & conversions" },
        ]
    },
    geometry_measurement: {
        id: "geometry_measurement",
        name: "Geometry & Measurement",
        icon: "📐",
        color: "#9C27B0",
        description: "Shapes, angles, area, perimeter, and measurement units",
        categories: [
            { id: "shapes_early", name: "Early Shapes (K-2)", icon: "🔺", desc: "Identify, compare, and compose shapes" },
            { id: "area_perimeter", name: "Area & Perimeter", icon: "⬜", desc: "Calculate area and perimeter" },
            { id: "angles_lines", name: "Angles & Lines", icon: "📐", desc: "Angles, symmetry, and line types" },
            { id: "shapes_classify", name: "Shapes", icon: "🔷", desc: "Classify triangles and quadrilaterals" },
            { id: "coordinates", name: "Coordinates", icon: "📍", desc: "Coordinate plane and graphing" },
            { id: "measurement", name: "Measurement", icon: "📏", desc: "Time, money, temperature, capacity" },
            { id: "geo_mixed", name: "Mixed Geometry", icon: "🎲", desc: "All geometry and measurement" },
        ]
    },
    data_statistics: {
        id: "data_statistics",
        name: "Data & Statistics",
        icon: "📊",
        color: "#FF9800",
        description: "Graphs, data interpretation, and probability",
        categories: [
            { id: "graphs", name: "Graphs", icon: "📈", desc: "Bar graphs, pictographs, line plots, pie charts" },
            { id: "data_analysis", name: "Data Analysis", icon: "📊", desc: "Mean, median, mode, range" },
            { id: "probability", name: "Probability", icon: "🎲", desc: "Basic probability concepts" },
            { id: "data_mixed", name: "Mixed Data", icon: "🎲", desc: "All data and statistics skills" },
        ]
    },
    algebraic_thinking: {
        id: "algebraic_thinking",
        name: "Algebraic Thinking",
        icon: "🔤",
        color: "#E91E63",
        description: "Patterns, expressions, equations, and number sense",
        categories: [
            { id: "patterns", name: "Patterns & Sequences", icon: "🔢", desc: "Number patterns and functions" },
            { id: "algebra", name: "Expressions & Equations", icon: "🔤", desc: "Variables and solving equations" },
            { id: "order_of_operations", name: "Order of Operations", icon: "🧮", desc: "PEMDAS rules" },
            { id: "placevalue", name: "Place Value", icon: "📊", desc: "Digit values and expanded form" },
            { id: "number_sense", name: "Number Sense", icon: "🎯", desc: "Rounding and estimation" },
            { id: "number_theory", name: "Number Theory", icon: "🔬", desc: "Factors, multiples, primes" },
            { id: "algebra_mixed", name: "Mixed Algebraic", icon: "🎲", desc: "All algebraic thinking skills" },
        ]
    }
};

export function getDomainByCategory(categoryId) {
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        if (domain.categories.some(cat => cat.id === categoryId)) {
            return domainId;
        }
    }
    return null;
}

// Helper to get category info
export function getCategoryInfo(categoryId) {
    for (const domain of Object.values(DOMAINS)) {
        const cat = domain.categories.find(c => c.id === categoryId);
        if (cat) return cat;
    }
    return null;
}

export const SKILLS = {
    // ========== DOMAIN 0: COUNTING & CARDINALITY (K-3) ==========
    counting: [
        { v: "count_objects", l: "Count Objects (1-20) (Visual)" },
        { v: "count_sequence", l: "Next/Before/After Number (Visual)" },
        { v: "mixed_counting", l: "Mixed Counting" },
    ],
    comparing: [
        { v: "compare_groups", l: "More/Fewer/Same Groups (Visual)" },
        { v: "compare_objects", l: "Compare Attributes (Visual)" },
        { v: "classify_count", l: "Sort & Count by Category (Visual)" },
        { v: "mixed_comparing", l: "Mixed Comparing" },
    ],
    composing: [
        { v: "number_bonds", l: "Number Bonds within 10 (Visual)" },
        { v: "make_ten", l: "Make 10 (Visual)" },
        { v: "teen_compose", l: "Teen Numbers: 10 + Ones (Visual)" },
        { v: "odd_even", l: "Odd or Even? (Visual)" },
        { v: "number_word_form", l: "Number Word Form" },
        { v: "fraction_number_line", l: "Fractions on Number Line (Visual)" },
        { v: "whole_as_fraction", l: "Whole Numbers as Fractions (Visual)" },
        { v: "mixed_composing", l: "Mixed Number Sense" },
    ],
    counting_mixed: [
        { v: "counting_all", l: "All Counting & Cardinality" },
    ],

    // ========== DOMAIN 1: NUMBER & OPERATIONS ==========
    addition: [
        { v: "add_facts", l: "Addition Facts (within 20)" },
        { v: "add_sub_10s", l: "Add & Subtract by 10s" },
        { v: "add_sub_100s", l: "Add & Subtract by 100s" },
        { v: "add", l: "Basic Addition" },
        { v: "add_word_problems", l: "Addition Word Problems" },
        { v: "add_word_problems_plain", l: "Addition Word Problems (No Pictures)" },
        { v: "add_sub_fact_family", l: "Addition Fact Families" },
        { v: "number_families_add", l: "Number Families - Easy" },
        { v: "number_families_add_med", l: "Number Families - Medium" },
        { v: "number_families_add_hard", l: "Number Families - Hard" },
        { v: "add_three", l: "Add Three Numbers (≤20)" },
        { v: "comparison_word", l: "How Many More/Fewer? (Visual)" },
        { v: "equal_sign", l: "True/False Equations (Visual)" },
        // -- Explicit addition by range & regrouping --
        { v: "add_10_no_regroup", l: "Add within 10 (No Regrouping)" },
        { v: "add_10_regroup", l: "Add within 10 (With Regrouping)" },
        { v: "add_10_mixed", l: "Add within 10" },
        { v: "add_20_no_regroup", l: "Add within 20 (No Regrouping)" },
        { v: "add_20_regroup", l: "Add within 20 (With Regrouping)" },
        { v: "add_20_mixed", l: "Add within 20" },
        { v: "add_50_no_regroup", l: "Add within 50 (No Regrouping)" },
        { v: "add_50_regroup", l: "Add within 50 (With Regrouping)" },
        { v: "add_50_mixed", l: "Add within 50" },
        { v: "add_100_no_regroup", l: "Add within 100 (No Regrouping)" },
        { v: "add_100_regroup", l: "Add within 100 (With Regrouping)" },
        { v: "add_100_mixed", l: "Add within 100" },
        { v: "add_1k_no_regroup", l: "Add within 1,000 (No Regrouping)" },
        { v: "add_1k_regroup", l: "Add within 1,000 (With Regrouping)" },
        { v: "add_1k_mixed", l: "Add within 1,000" },
        { v: "add_10k_no_regroup", l: "Add within 10,000 (No Regrouping)" },
        { v: "add_10k_regroup", l: "Add within 10,000 (With Regrouping)" },
        { v: "add_10k_mixed", l: "Add within 10,000" },
        { v: "add_100k_no_regroup", l: "Add within 100,000 (No Regrouping)" },
        { v: "add_100k_regroup", l: "Add within 100,000 (With Regrouping)" },
        { v: "add_100k_mixed", l: "Add within 100,000" },
        { v: "add_1m_no_regroup", l: "Add within 1,000,000 (No Regrouping)" },
        { v: "add_1m_regroup", l: "Add within 1,000,000 (With Regrouping)" },
        { v: "add_1m_mixed", l: "Add within 1,000,000" },
        // -- Addition word problems by range --
        { v: "add_wp_10", l: "Addition Word Problems (within 10)" },
        { v: "add_wp_10_plain", l: "Addition Word Problems (within 10, No Pictures)" },
        { v: "add_wp_20", l: "Addition Word Problems (within 20)" },
        { v: "add_wp_20_plain", l: "Addition Word Problems (within 20, No Pictures)" },
        { v: "add_wp_50", l: "Addition Word Problems (within 50)" },
        { v: "add_wp_50_plain", l: "Addition Word Problems (within 50, No Pictures)" },
        { v: "add_wp_100", l: "Addition Word Problems (within 100)" },
        { v: "add_wp_100_plain", l: "Addition Word Problems (within 100, No Pictures)" },
        { v: "add_wp_1k", l: "Addition Word Problems (within 1,000)" },
        { v: "add_wp_1k_plain", l: "Addition Word Problems (within 1,000, No Pictures)" },
        { v: "add_wp_10k", l: "Addition Word Problems (within 10,000)" },
        { v: "add_wp_10k_plain", l: "Addition Word Problems (within 10,000, No Pictures)" },
        { v: "add_wp_100k", l: "Addition Word Problems (within 100,000)" },
        { v: "add_wp_100k_plain", l: "Addition Word Problems (within 100,000, No Pictures)" },
        { v: "add_wp_1m", l: "Addition Word Problems (within 1,000,000)" },
        { v: "add_wp_1m_plain", l: "Addition Word Problems (within 1,000,000, No Pictures)" },
        { v: "nl_add", l: "Addition Number Line (Visual)" },
        { v: "mixed_addition", l: "Mixed Addition" },
    ],
    subtraction: [
        { v: "sub_facts", l: "Subtraction Facts (within 20)" },
        { v: "subtract", l: "Basic Subtraction" },
        { v: "sub_word_problems", l: "Subtraction Word Problems" },
        { v: "sub_word_problems_plain", l: "Subtraction Word Problems (No Pictures)" },
        { v: "missing_add_sub", l: "Missing Numbers (+/−)" },
        // -- Explicit subtraction by range & regrouping --
        { v: "sub_10_no_regroup", l: "Subtract within 10 (No Regrouping)" },
        { v: "sub_10_regroup", l: "Subtract within 10 (With Regrouping)" },
        { v: "sub_10_mixed", l: "Subtract within 10" },
        { v: "sub_20_no_regroup", l: "Subtract within 20 (No Regrouping)" },
        { v: "sub_20_regroup", l: "Subtract within 20 (With Regrouping)" },
        { v: "sub_20_mixed", l: "Subtract within 20" },
        { v: "sub_50_no_regroup", l: "Subtract within 50 (No Regrouping)" },
        { v: "sub_50_regroup", l: "Subtract within 50 (With Regrouping)" },
        { v: "sub_50_mixed", l: "Subtract within 50" },
        { v: "sub_100_no_regroup", l: "Subtract within 100 (No Regrouping)" },
        { v: "sub_100_regroup", l: "Subtract within 100 (With Regrouping)" },
        { v: "sub_100_mixed", l: "Subtract within 100" },
        { v: "sub_1k_no_regroup", l: "Subtract within 1,000 (No Regrouping)" },
        { v: "sub_1k_regroup", l: "Subtract within 1,000 (With Regrouping)" },
        { v: "sub_1k_mixed", l: "Subtract within 1,000" },
        { v: "sub_10k_no_regroup", l: "Subtract within 10,000 (No Regrouping)" },
        { v: "sub_10k_regroup", l: "Subtract within 10,000 (With Regrouping)" },
        { v: "sub_10k_mixed", l: "Subtract within 10,000" },
        { v: "sub_100k_no_regroup", l: "Subtract within 100,000 (No Regrouping)" },
        { v: "sub_100k_regroup", l: "Subtract within 100,000 (With Regrouping)" },
        { v: "sub_100k_mixed", l: "Subtract within 100,000" },
        { v: "sub_1m_no_regroup", l: "Subtract within 1,000,000 (No Regrouping)" },
        { v: "sub_1m_regroup", l: "Subtract within 1,000,000 (With Regrouping)" },
        { v: "sub_1m_mixed", l: "Subtract within 1,000,000" },
        // -- Subtraction word problems by range --
        { v: "sub_wp_10", l: "Subtraction Word Problems (within 10)" },
        { v: "sub_wp_10_plain", l: "Subtraction Word Problems (within 10, No Pictures)" },
        { v: "sub_wp_20", l: "Subtraction Word Problems (within 20)" },
        { v: "sub_wp_20_plain", l: "Subtraction Word Problems (within 20, No Pictures)" },
        { v: "sub_wp_50", l: "Subtraction Word Problems (within 50)" },
        { v: "sub_wp_50_plain", l: "Subtraction Word Problems (within 50, No Pictures)" },
        { v: "sub_wp_100", l: "Subtraction Word Problems (within 100)" },
        { v: "sub_wp_100_plain", l: "Subtraction Word Problems (within 100, No Pictures)" },
        { v: "sub_wp_1k", l: "Subtraction Word Problems (within 1,000)" },
        { v: "sub_wp_1k_plain", l: "Subtraction Word Problems (within 1,000, No Pictures)" },
        { v: "sub_wp_10k", l: "Subtraction Word Problems (within 10,000)" },
        { v: "sub_wp_10k_plain", l: "Subtraction Word Problems (within 10,000, No Pictures)" },
        { v: "sub_wp_100k", l: "Subtraction Word Problems (within 100,000)" },
        { v: "sub_wp_100k_plain", l: "Subtraction Word Problems (within 100,000, No Pictures)" },
        { v: "sub_wp_1m", l: "Subtraction Word Problems (within 1,000,000)" },
        { v: "sub_wp_1m_plain", l: "Subtraction Word Problems (within 1,000,000, No Pictures)" },
        { v: "nl_sub", l: "Subtraction Number Line (Visual)" },
        { v: "mixed_add_sub", l: "Mixed Addition & Subtraction" },
        { v: "mixed_subtraction", l: "Mixed Subtraction" },
    ],
    multiplication: [
        { v: "mult_facts", l: "Multiplication Facts (1-12)" },
        { v: "multiply", l: "Basic Multiplication" },
        { v: "arrays_groups", l: "Arrays & Equal Groups (Visual)" },
        { v: "mult_properties", l: "Multiplication Properties (Visual)" },
        { v: "mult_word_problems", l: "Multiplication Word Problems" },
        { v: "mult_word_problems_plain", l: "Multiplication Word Problems (No Pictures)" },
        { v: "mult_comparison", l: "Times as Many Word Problems (Visual)" },
        { v: "mult_comparison_plain", l: "Times as Many (No Pictures)" },
        { v: "area_model_mult", l: "Area Model Multiplication" },
        { v: "area_model_mult_hard", l: "Area Model (2×2 and 2×3)" },
        { v: "mult_div_fact_family", l: "Multiplication Fact Families" },
        { v: "number_families_mult", l: "Number Families - Easy" },
        { v: "number_families_mult_med", l: "Number Families - Medium" },
        { v: "number_families_mult_hard", l: "Number Families - Hard" },
        { v: "mult_chart", l: "Multiplication Chart (Visual)" },
        { v: "nl_mult", l: "Multiplication Number Line (Visual)" },
        { v: "mixed_multiplication", l: "Mixed Multiplication" },
    ],
    division: [
        { v: "div_facts", l: "Division Facts (1-12)" },
        { v: "divide", l: "Basic Division" },
        { v: "div_remainders", l: "Division with Remainders (Visual)" },
        { v: "div_word_problems", l: "Division Word Problems" },
        { v: "div_word_problems_plain", l: "Division Word Problems (No Pictures)" },
        { v: "area_model_div_2by1", l: "Area Model Division (2÷1 digit)" },
        { v: "area_model_div_3by1", l: "Area Model Division (3÷1 digit)" },
        { v: "long_div_2digit", l: "Divide by 2-Digit Numbers (Visual)" },
        { v: "missing_mult_div", l: "Missing Factors (×/÷)" },
        { v: "nl_div", l: "Division Number Line (Visual)" },
        { v: "mixed_mult_div", l: "Mixed Multiplication & Division" },
        { v: "mixed_division", l: "Mixed Division" },
    ],
    integers: [
        { v: "number_line_int", l: "Number Lines with Negatives" },
        { v: "compare_int", l: "Comparing Integers" },
        { v: "add_int", l: "Adding Integers" },
        { v: "sub_int", l: "Subtracting Integers" },
        { v: "mixed_integers", l: "Mixed Integers" },
    ],
    number_ops_mixed: [
        { v: "mixed", l: "All Four Operations (+ − × ÷)" },
        { v: "word_problems_mixed", l: "Mixed Word Problems (+−×÷) (Visual)" },
        { v: "word_problems_mixed_plain", l: "Mixed Word Problems (+−×÷) (No Pictures)" },
        { v: "number_families_mixed", l: "Number Families (All 4 Ops) - Easy" },
        { v: "number_families_mixed_med", l: "Number Families (All 4 Ops) - Medium" },
        { v: "number_families_mixed_hard", l: "Number Families (All 4 Ops) - Hard" },
        { v: "operations_all", l: "All Operations Skills" },
    ],
    
    // ========== DOMAIN 2: FRACTIONS, DECIMALS & PERCENTS ==========
    fractions: [
        { v: "identify", l: "Identify Fractions (Visual)" },
        { v: "equiv_frac_visual", l: "Equivalent Fractions (Visual)" },
        { v: "equiv_frac_nv", l: "Equivalent Fractions (No Visuals)" },
        { v: "equivalent", l: "Equivalent Fractions" },
        { v: "fraction_of_set", l: "Fraction of a Set (Visual)" },
        { v: "fraction_of_set_hard", l: "Fraction of a Set - Hard (Visual)" },
        { v: "compare", l: "Compare Fractions (>, <, =)" },
        { v: "simplify", l: "Simplify Fractions" },
        { v: "improper_mixed", l: "Improper ↔ Mixed Numbers" },
        { v: "mixed_improper_visual", l: "Mixed ↔ Improper (Visual Pizza)" },
        { v: "mixed_fractions", l: "Mixed Fractions" },
        { v: "identify_nv", l: "Identify Fractions (No Visuals)" },
        { v: "fraction_of_set_nv", l: "Fraction of a Set (No Visuals)" },
        { v: "fraction_of_set_hard_nv", l: "Fraction of a Set - Hard (No Visuals)" },
    ],
    fraction_operations: [
        // Grade 4 fraction operations
        { v: "add_fractions_like", l: "Add Fractions (Like Denom) (Visual)" },
        { v: "sub_fractions_like", l: "Subtract Fractions (Like Denom) (Visual)" },
        { v: "add_mixed_like", l: "Add Mixed Numbers (Like Denom) (Visual)" },
        { v: "sub_mixed_like", l: "Subtract Mixed Numbers (Like Denom) (Visual)" },
        { v: "mult_frac_whole", l: "Fraction × Whole Number (Visual)" },
        { v: "decompose_fractions", l: "Decompose to Unit Fractions (Visual)" },
        { v: "frac_word_problems", l: "Fraction Word Problems (+/−) (Visual)" },
        { v: "frac_word_problems_plain", l: "Fraction Word Problems (No Pictures)" },
        { v: "frac_10_100", l: "Fractions /10 as /100 (Visual)" },
        // Grade 5 fraction operations
        { v: "add_frac_unlike", l: "Add Fractions (Unlike Denom) (Visual)" },
        { v: "sub_frac_unlike", l: "Subtract Fractions (Unlike Denom) (Visual)" },
        { v: "add_mixed_unlike", l: "Add Mixed Numbers (Unlike Denom) (Visual)" },
        { v: "sub_mixed_unlike", l: "Subtract Mixed Numbers (Unlike Denom) (Visual)" },
        // Non-visual fraction operations (clean arithmetic)
        { v: "add_frac_like_nv", l: "Add Fractions (Like Denom) (No Visuals)" },
        { v: "sub_frac_like_nv", l: "Subtract Fractions (Like Denom) (No Visuals)" },
        { v: "add_frac_unlike_nv", l: "Add Fractions (Unlike Denom) (No Visuals)" },
        { v: "sub_frac_unlike_nv", l: "Subtract Fractions (Unlike Denom) (No Visuals)" },
        { v: "add_mixed_like_nv", l: "Add Mixed Numbers (Like Denom) (No Visuals)" },
        { v: "sub_mixed_like_nv", l: "Subtract Mixed Numbers (Like Denom) (No Visuals)" },
        { v: "add_mixed_unlike_nv", l: "Add Mixed Numbers (Unlike Denom) (No Visuals)" },
        { v: "sub_mixed_unlike_nv", l: "Subtract Mixed Numbers (Unlike Denom) (No Visuals)" },
        { v: "mult_frac_whole_nv", l: "Fraction × Whole Number (No Visuals)" },
        { v: "decompose_frac_nv", l: "Decompose to Unit Fractions (No Visuals)" },
        { v: "frac_10_100_nv", l: "Fractions /10 as /100 (No Visuals)" },
        { v: "mult_frac_frac_nv", l: "Fraction × Fraction (No Visuals)" },
        { v: "div_unit_frac_nv", l: "Divide with Unit Fractions (No Visuals)" },
        { v: "frac_as_div_nv", l: "Fraction as Division (No Visuals)" },
        { v: "mult_scaling_nv", l: "Multiplication as Scaling (No Visuals)" },
        { v: "mult_frac_frac", l: "Fraction × Fraction (Visual)" },
        { v: "div_unit_fraction", l: "Divide with Unit Fractions (Visual)" },
        { v: "frac_as_division", l: "Fraction as Division (a/b = a÷b) (Visual)" },
        { v: "mult_scaling", l: "Multiplication as Scaling (Visual)" },
        { v: "frac_mult_word", l: "Fraction Mult/Div Word Problems (Visual)" },
        { v: "frac_mult_word_plain", l: "Fraction Mult/Div Word (No Pictures)" },
        { v: "frac_word_mixed", l: "Mixed Fraction Word Problems (Visual)" },
        { v: "frac_word_mixed_plain", l: "Mixed Fraction Word Problems (No Pictures)" },
        { v: "mixed_fraction_ops", l: "Mixed Fraction Operations" },
    ],
    decimals: [
        { v: "add_decimal", l: "Adding Decimals" },
        { v: "sub_decimal", l: "Subtracting Decimals" },
        { v: "mult_decimal", l: "Multiplying Decimals" },
        { v: "div_decimal", l: "Dividing Decimals" },
        { v: "compare_decimal", l: "Comparing Decimals" },
        { v: "round_decimals", l: "Round Decimals (Visual)" },
        { v: "mixed_decimals", l: "Mixed Decimals" },
    ],
    conversions: [
        { v: "f_to_d", l: "Fraction → Decimal" },
        { v: "d_to_f", l: "Decimal → Fraction" },
        { v: "f_to_p", l: "Fraction → Percent" },
        { v: "p_to_f", l: "Percent → Fraction" },
        { v: "mixed_conversions", l: "Mixed Conversions" },
    ],
    frac_dec_mixed: [
        { v: "fractions_all", l: "All Fraction Skills" },
        { v: "decimals_all", l: "All Decimal Skills" },
        { v: "conversions_all", l: "All Conversion Skills" },
        { v: "fdp_all", l: "All FDP Skills" },
    ],
    
    // ========== DOMAIN 3: GEOMETRY & MEASUREMENT ==========
    shapes_early: [
        { v: "name_2d_shapes", l: "Identify 2D Shapes (Visual)" },
        { v: "name_3d_shapes", l: "Identify 3D Shapes (Visual)" },
        { v: "shape_positions", l: "Shape Positions: Above/Below/Beside (Visual)" },
        { v: "order_objects_length", l: "Order Objects by Length (Visual)" },
        { v: "measure_nonstandard", l: "Measure with Non-Standard Units (Visual)" },
        { v: "compose_shapes", l: "Combine Shapes (Visual)" },
        { v: "partition_shapes", l: "Halves/Thirds/Fourths (Visual)" },
        { v: "shape_attributes", l: "Shapes by Attributes (Visual)" },
        { v: "mixed_shapes_early", l: "Mixed Early Shapes" },
    ],
    area_perimeter: [
        { v: "area_unit_squares", l: "Area - Unit Square Counting (Visual)" },
        { v: "perimeter_grid", l: "Perimeter - Grid Counting (Visual)" },
        { v: "perimeter", l: "Perimeter Only" },
        { v: "area", l: "Area Only" },
        { v: "area_perimeter", l: "Area AND Perimeter" },
        { v: "composite_shapes", l: "Composite Shapes (L, T, U)" },
        { v: "volume", l: "Volume (Rectangular Prisms)" },
        { v: "volume_composite", l: "Composite 3D Volume (Visual)" },
        { v: "mixed_area_perimeter", l: "Mixed Area & Perimeter" },
    ],
    angles_lines: [
        { v: "identify_angles", l: "Identify Angles" },
        { v: "measure_angles", l: "Measure/Estimate Angles" },
        { v: "identify_lines", l: "Identify Lines (∥, ⊥)" },
        { v: "symmetry", l: "Lines of Symmetry" },
        { v: "additive_angles", l: "Two Angles Sum (Visual)" },
        { v: "mixed_angles_lines", l: "Mixed Angles & Lines" },
    ],
    shapes_classify: [
        { v: "classify_triangles", l: "Classify Triangles" },
        { v: "classify_quads", l: "Classify Quadrilaterals" },
        { v: "mixed_shapes", l: "Mixed Shape Classification" },
    ],
    coordinates: [
        { v: "coordinate_q1", l: "Coordinates (Quadrant I)" },
        { v: "coordinate_all", l: "Coordinates (All 4 Quadrants)" },
        { v: "coordinate_graph", l: "Coordinate Graphing" },
        { v: "mixed_coordinates", l: "Mixed Coordinates" },
    ],
    measurement: [
        // Time Reading Skills
        { v: "time_hour", l: "Time to the Hour" },
        { v: "time_half_hour", l: "Time to Half Hour" },
        { v: "time_quarter", l: "Time to Quarter Hour" },
        { v: "time_5min", l: "Time to 5 Minutes" },
        { v: "time_1min", l: "Time to the Minute" },
        // Time Matching Skills
        { v: "time_analog_digital", l: "Analog ↔ Digital Match" },
        { v: "time_match_clock", l: "Match Time to Clock" },
        // Elapsed Time Skills
        { v: "elapsed_30min", l: "Elapsed Time (30 min)" },
        { v: "elapsed_hour", l: "Elapsed Time (Hours)" },
        { v: "elapsed_15min", l: "Elapsed Time (15 min)" },
        { v: "elapsed_mixed", l: "Elapsed Time (Hours & Minutes)" },
        { v: "elapsed_find_duration", l: "Find the Duration" },
        // Visual Elapsed Time (two clocks shown)
        { v: "elapsed_visual_easy", l: "Elapsed Time Clocks - Easy (Visual)" },
        { v: "elapsed_visual_medium", l: "Elapsed Time Clocks - Medium (Visual)" },
        { v: "elapsed_visual_hard", l: "Elapsed Time Clocks - Hard (Visual)" },
        // Other Measurement
        { v: "reading_ruler", l: "Reading a Ruler (Visual)" },
        { v: "reading_ruler_hard", l: "Reading a Ruler - Quarter Inches (Visual)" },
        { v: "money_count", l: "Counting Coins & Bills (Visual)" },
        { v: "money", l: "Money & Making Change" },
        { v: "temperature", l: "Temperature (°C/°F)" },
        { v: "capacity", l: "Capacity/Volume Units" },
        { v: "unit_conversions", l: "Measurement Conversions (Visual)" },
        { v: "mass_volume_liquid", l: "Grams, kg, Liters (Visual)" },
        { v: "estimate_length", l: "Estimate Lengths (Visual)" },
        { v: "mixed_measurement", l: "Mixed Measurement" },
        { v: "mixed_time", l: "Mixed Time Skills" },
    ],
    geo_mixed: [
        { v: "geometry_all", l: "All Geometry Skills" },
        { v: "measurement_all", l: "All Measurement Skills" },
        { v: "geo_meas_all", l: "All Geometry & Measurement" },
    ],
    
    // ========== DOMAIN 4: DATA & STATISTICS ==========
    graphs: [
        { v: "bar_graph", l: "Bar Graphs" },
        { v: "pictograph", l: "Pictographs" },
        { v: "tally_chart", l: "Tally Charts" },
        { v: "line_plot", l: "Line Plots" },
        { v: "line_plot_fractions", l: "Line Plots with Fractions (Visual)" },
        { v: "pie_chart", l: "Pie Charts" },
        { v: "mixed_graphs", l: "Mixed Graphs" },
    ],
    data_analysis: [
        { v: "mean", l: "Mean (Average)" },
        { v: "median", l: "Median" },
        { v: "mode", l: "Mode" },
        { v: "range", l: "Range" },
        { v: "mixed_data_analysis", l: "Mixed Data Analysis" },
    ],
    probability: [
        { v: "probability_basic", l: "Basic Probability" },
        { v: "mixed_probability", l: "Mixed Probability" },
    ],
    data_mixed: [
        { v: "data_stats_all", l: "All Data & Stats Skills" },
    ],
    
    // ========== DOMAIN 5: ALGEBRAIC THINKING ==========
    patterns: [
        { v: "seq_2", l: "Count by 2s" },
        { v: "seq_5", l: "Count by 5s" },
        { v: "seq_10", l: "Count by 10s" },
        { v: "count_by_fill", l: "Count-By Fill-In (1-12)" },
        { v: "skip_count_line", l: "Skip Counting Number Line (Visual)" },
        { v: "skip_count_grid", l: "Skip Counting Grid (Visual)" },
        { v: "double", l: "Doubling" },
        { v: "halve", l: "Halving" },
        { v: "shape_pattern", l: "Shape Patterns (Visual)" },
        { v: "number_pattern", l: "Number Patterns" },
        { v: "pattern_relationship", l: "Two Patterns, Find Relationship (Visual)" },
        { v: "mixed_patterns", l: "Mixed Patterns" },
    ],
    algebra: [
        { v: "tape_diagram", l: "Tape Diagrams / Bar Models (Visual)" },
        { v: "tape_diagram_plain", l: "Tape Diagrams (No Pictures)" },
        { v: "multi_step_word", l: "Multi-Step Word Problems (Visual)" },
        { v: "multi_step_word_plain", l: "Multi-Step Word Problems (No Pictures)" },
        { v: "solve_unknown", l: "Solve for Unknown (x + 5 = 12)" },
        { v: "write_expression", l: "Write Expressions from Words" },
        { v: "evaluate_expression", l: "Evaluate Expressions" },
        { v: "inequalities", l: "Inequalities (>, <, ≥, ≤)" },
        { v: "function_table_easy", l: "Function Tables - Easy (Visual)" },
        { v: "function_table_hard", l: "Function Tables - Hard (Visual)" },
        { v: "algebra_word_mixed", l: "Mixed Algebra Word Problems (Visual)" },
        { v: "algebra_word_mixed_plain", l: "Mixed Algebra Word Problems (No Pictures)" },
        { v: "mixed_algebra", l: "Mixed Algebra" },
    ],
    order_of_operations: [
        { v: "two_ops_no_paren", l: "Level 1: Two Operations" },
        { v: "three_ops_no_paren", l: "Level 2: Three Operations" },
        { v: "paren_simple", l: "Level 3: Simple Parentheses" },
        { v: "paren_multi", l: "Level 4: Multiple Ops" },
        { v: "exponents_simple", l: "Level 5: Exponents" },
        { v: "mixed_order_ops", l: "Mixed Order of Operations" },
    ],
    placevalue: [
        { v: "more_less_10", l: "1 More / 1 Less / 10 More / 10 Less (Visual)" },
        { v: "more_less_100", l: "10 More / 10 Less / 100 More / 100 Less (Visual)" },
        { v: "place_value_disks", l: "Place Value Disks (Visual)" },
        { v: "place_value_10x", l: "10× and ÷10 Relationships (Visual)" },
        { v: "identify", l: "Name the Place" },
        { v: "value", l: "Value of a Digit" },
        { v: "compare", l: "Compare Numbers (>, <, =)" },
        { v: "expand", l: "Expanded Form" },
        { v: "combine", l: "Standard Form" },
        { v: "mixed_placevalue", l: "Mixed Place Value" },
    ],
    number_sense: [
        { v: "rounding_visual", l: "Rounding on Number Line (Visual)" },
        { v: "nearest_10", l: "Round to Nearest 10" },
        { v: "nearest_100", l: "Round to Nearest 100" },
        { v: "nearest_1000", l: "Round to Nearest 1,000" },
        { v: "estimate_sum", l: "Estimate Sums" },
        { v: "estimate_diff", l: "Estimate Differences" },
        { v: "mixed_number_sense", l: "Mixed Number Sense" },
    ],
    number_theory: [
        { v: "prime_composite", l: "Prime vs Composite" },
        { v: "factors_identify", l: "Identify Factors (Circle All)" },
        { v: "factor_tchart_easy", l: "Factor T-Chart - Easy (Visual)" },
        { v: "factor_tchart_medium", l: "Factor T-Chart - Medium (Visual)" },
        { v: "factor_tchart_hard", l: "Factor T-Chart - Hard (Visual)" },
        { v: "factor_links_easy", l: "Factor Links - Easy (Visual)" },
        { v: "factor_links_medium", l: "Factor Links - Medium (Visual)" },
        { v: "factor_links_hard", l: "Factor Links - Hard (Visual)" },
        { v: "multiples", l: "Multiples of a Number" },
        { v: "gcf_easy", l: "Greatest Common Factor (Easy)" },
        { v: "gcf_hard", l: "Greatest Common Factor (Hard)" },
        { v: "lcm", l: "Least Common Multiple" },
        { v: "mixed_number_theory", l: "Mixed Number Theory" },
    ],
    algebra_mixed: [
        { v: "patterns_all", l: "All Pattern Skills" },
        { v: "algebra_all", l: "All Algebra Skills" },
        { v: "order_ops_all", l: "All Order of Operations" },
        { v: "placevalue_all", l: "All Place Value Skills" },
        { v: "number_sense_all", l: "All Number Sense Skills" },
        { v: "number_theory_all", l: "All Number Theory Skills" },
        { v: "algebraic_all", l: "All Algebraic Thinking" },
    ],
    
    // ========== ALL DOMAINS MIXED ==========
    all_mixed: [
        { v: "all_domains_mixed", l: "All Skills from All Domains" },
        { v: "custom_mixed", l: "Custom Mixed (From Settings)" },
        { v: "grade_k_mixed", l: "All Kindergarten Skills" },
        { v: "grade_1_mixed", l: "All Grade 1 Skills" },
        { v: "grade_2_mixed", l: "All Grade 2 Skills" },
        { v: "grade_3_mixed", l: "All Grade 3 Skills" },
        { v: "grade_4_mixed", l: "All Grade 4 Skills" },
        { v: "grade_5_mixed", l: "All Grade 5 Skills" },
        { v: "grade_6_mixed", l: "All Grade 6 Skills" },
    ],
};

// ===== DYNAMIC SKILL LIST HELPERS =====
// These derive skill lists from DOMAINS/SKILLS so they auto-update when skills are added

/** Check if a skill ID is a meta/mixed skill (not a direct question generator) */
export function isMixedMetaSkill(v) {
    // Real playable skills that happen to start with 'mixed_' or end with '_all'
    const realPlayableSkills = new Set([
        'mixed_add_sub', 'mixed_mult_div', 'mixed_improper_visual',
        'coordinate_all',
    ]);
    if (realPlayableSkills.has(v)) return false;

    if (v === 'custom_mixed') return true;
    if (v === 'mixed') return true;
    if (v.startsWith('mixed_')) return true;
    if (v.endsWith('_all')) return true;
    if (v === 'all_domains_mixed' || v === 'counting_all') return true;
    if (v.startsWith('grade_') && v.endsWith('_mixed')) return true;
    return false;
}

/** Get all non-mixed (playable) skill IDs for a category */
export function getSkillsForCategory(categoryId) {
    const skills = SKILLS[categoryId];
    if (!Array.isArray(skills)) return [];
    return skills.filter(s => !isMixedMetaSkill(s.v)).map(s => s.v);
}

/** Get all non-mixed skill IDs for a domain (across all its categories) */
export function getSkillsForDomain(domainId) {
    const domain = DOMAINS[domainId];
    if (!domain) return [];
    const all = [];
    for (const cat of domain.categories) {
        // Skip the domain-level mixed categories (e.g., number_ops_mixed, geo_mixed)
        if (cat.id.endsWith('_mixed') || cat.id === 'all_mixed') continue;
        all.push(...getSkillsForCategory(cat.id));
    }
    return all;
}

/** Get all non-mixed skills for a grade level, returns [{skillId, categoryId}] */
export function getSkillsForGrade(grade) {
    const result = [];
    for (const [categoryId, skills] of Object.entries(SKILLS)) {
        if (!Array.isArray(skills)) continue;
        for (const skill of skills) {
            if (isMixedMetaSkill(skill.v)) continue;
            const g = getSkillGrade(skill.v, categoryId);
            if (String(g) === String(grade)) {
                result.push({ skillId: skill.v, categoryId });
            }
        }
    }
    return result;
}

/** Find which category a skill belongs to (first match) */
export function getCategoryForSkill(skillId) {
    for (const [categoryId, skills] of Object.entries(SKILLS)) {
        if (!Array.isArray(skills)) continue;
        if (skills.some(s => s.v === skillId)) return categoryId;
    }
    return null;
}

/**
 * Resolve scope for _all / domain-level / grade-level mixed skills.
 * Returns array of category IDs, or null if not a recognized scope skill.
 */
export function getMixedSkillScope(skillId) {
    // Grade-level mixed
    if (skillId.startsWith('grade_') && skillId.endsWith('_mixed')) {
        return null; // handled specially via getSkillsForGrade
    }
    // all_domains_mixed
    if (skillId === 'all_domains_mixed') {
        const cats = [];
        for (const domain of Object.values(DOMAINS)) {
            for (const cat of domain.categories) {
                if (!cat.id.endsWith('_mixed') && cat.id !== 'all_mixed') cats.push(cat.id);
            }
        }
        return cats;
    }
    // Domain-level _all skills (found in _mixed categories)
    // Check if skillId_all matches a domain
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        const mixedCat = domain.categories.find(c => c.id.endsWith('_mixed'));
        if (!mixedCat) continue;
        const mixedSkills = SKILLS[mixedCat.id];
        if (!Array.isArray(mixedSkills)) continue;
        if (!mixedSkills.some(s => s.v === skillId)) continue;

        // This skill is in this domain's mixed category
        const nonMixedCats = domain.categories
            .filter(c => !c.id.endsWith('_mixed') && c.id !== 'all_mixed')
            .map(c => c.id);

        // Known overrides checked first (where name would wrongly match a single category)
        const subsetOverrides = {
            'order_ops_all': ['order_of_operations'],
            'geometry_all': ['shapes_early', 'area_perimeter', 'angles_lines', 'shapes_classify', 'coordinates'],
            'counting_all': nonMixedCats, // Full domain despite name matching 'counting' category
        };
        if (subsetOverrides[skillId]) return subsetOverrides[skillId];

        // Check if it's a single-category _all (name minus _all matches a category)
        const base = skillId.replace(/_all$/, '');
        const matchedCat = nonMixedCats.find(catId => catId === base);
        if (matchedCat) return [matchedCat];

        // Default: covers the full domain
        return nonMixedCats;
    }
    return null;
}

export const SKILL_CODES = {};
export const CODE_TO_SKILL = {};

// Build skill code mappings automatically
(function buildSkillCodes() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (I,O,0,1)
    let codeIndex = 0;

    // Generate unique 2-char code
    function nextCode() {
        const c1 = chars[Math.floor(codeIndex / chars.length) % chars.length];
        const c2 = chars[codeIndex % chars.length];
        codeIndex++;
        return c1 + c2;
    }

    // PASS 1: Non-mixed skills (backward compatible - same order as before)
    for (const categoryId in SKILLS) {
        const skills = SKILLS[categoryId];
        if (!Array.isArray(skills)) continue;

        for (const skill of skills) {
            if (skill.v.startsWith('mixed_') || skill.v === 'mixed' || skill.v.endsWith('_all')
                || skill.v === 'custom_mixed' || skill.v === 'all_domains_mixed'
                || skill.v === 'counting_all'
                || (skill.v.startsWith('grade_') && skill.v.endsWith('_mixed'))) continue;

            const code = nextCode();
            const key = `${categoryId}:${skill.v}`;

            SKILL_CODES[key] = code;
            CODE_TO_SKILL[code] = {
                categoryId: categoryId,
                skillId: skill.v,
                skillLabel: skill.l
            };
        }
    }

    // PASS 2: Mixed/meta skills (new codes appended after existing ones)
    for (const categoryId in SKILLS) {
        const skills = SKILLS[categoryId];
        if (!Array.isArray(skills)) continue;

        for (const skill of skills) {
            // Only process mixed/meta skills in this pass
            if (skill.v === 'custom_mixed') continue; // skip - depends on settings
            const isMetaSkill = skill.v.startsWith('mixed_') || skill.v === 'mixed'
                || skill.v.endsWith('_all') || skill.v === 'all_domains_mixed'
                || skill.v === 'counting_all'
                || (skill.v.startsWith('grade_') && skill.v.endsWith('_mixed'));
            if (!isMetaSkill) continue;

            const code = nextCode();
            const key = `${categoryId}:${skill.v}`;

            SKILL_CODES[key] = code;
            CODE_TO_SKILL[code] = {
                categoryId: categoryId,
                skillId: skill.v,
                skillLabel: skill.l
            };
        }
    }

    console.log(`Built ${Object.keys(CODE_TO_SKILL).length} skill codes`);
})();

export const SKILL_TIME_CATEGORY = {
    // Quick skills (25s threshold)
    nl_add: "quick", nl_sub: "quick", nl_mult: "quick", nl_div: "quick",
    add_facts: "quick", sub_facts: "quick", mult_facts: "quick", div_facts: "quick",
    add: "quick", subtract: "quick", multiply: "quick", divide: "quick",
    add_sub_10s: "quick", add_sub_100s: "quick",
    nearest_10: "quick", nearest_100: "quick", estimate_sum: "quick", estimate_diff: "quick",
    pv_identify: "quick", pv_value: "quick",
    prime_composite: "quick", compare_int: "quick", number_line_int: "quick",
    time_hour: "quick", time_half_hour: "quick", time_quarter: "quick", time_5min: "quick", time_1min: "quick", time_analog_digital: "quick",
    identify_angles: "quick", identify_lines: "quick",
    double: "quick", halve: "quick",
    seq_2: "quick", seq_5: "quick", seq_10: "quick",
    money_count: "quick", bar_graph: "quick", pictograph: "quick", tally_chart: "quick",
    identify: "quick", compare: "quick",
    even_odd: "quick", rounding_visual: "quick", reading_ruler: "quick", reading_ruler_hard: "quick",
    arrays_groups: "quick", compare_decimal: "quick", compare_numbers: "quick",
    // New K-3 skills (quick)
    count_objects: "quick", count_sequence: "quick", compare_groups: "quick",
    compare_objects: "quick", classify_count: "quick", number_bonds: "quick", make_ten: "quick",
    teen_compose: "quick", odd_even: "quick", number_word_form: "quick",
    name_2d_shapes: "quick", name_3d_shapes: "quick", shape_positions: "quick",
    partition_shapes: "quick", equal_sign: "quick", add_three: "quick",
    // New fraction operations (extended by default)
    add_fractions_like: "quick", sub_fractions_like: "quick",
    add_frac_like_nv: "quick", sub_frac_like_nv: "quick",
    add_frac_unlike_nv: "quick", sub_frac_unlike_nv: "quick",
    add_mixed_like_nv: "quick", sub_mixed_like_nv: "quick",
    add_mixed_unlike_nv: "quick", sub_mixed_unlike_nv: "quick",
    identify_nv: "quick", equiv_frac_nv: "quick", fraction_of_set_nv: "quick", fraction_of_set_hard_nv: "quick",
    mult_frac_whole_nv: "quick", decompose_frac_nv: "quick", frac_10_100_nv: "quick",
    mult_frac_frac_nv: "quick", div_unit_frac_nv: "quick", frac_as_div_nv: "quick", mult_scaling_nv: "quick",
    mult_scaling: "quick", frac_10_100: "quick",
    place_value_10x: "quick", round_decimals: "quick",
    more_less_10: "quick", more_less_100: "quick",
    // Plain word problems (extended - 50s threshold)
    add_word_problems_plain: "extended", sub_word_problems_plain: "extended",
    mult_word_problems_plain: "extended", div_word_problems_plain: "extended",
    mult_comparison_plain: "extended", tape_diagram_plain: "extended",
    multi_step_word_plain: "extended", frac_word_problems_plain: "extended",
    frac_mult_word_plain: "extended",
    word_problems_mixed: "extended", word_problems_mixed_plain: "extended",
    frac_word_mixed: "extended", frac_word_mixed_plain: "extended",
    algebra_word_mixed: "extended", algebra_word_mixed_plain: "extended",
    // Explicit add/sub by range (computational = quick, word problems = extended)
    add_10_no_regroup: "quick", add_10_regroup: "quick", add_10_mixed: "quick",
    sub_10_no_regroup: "quick", sub_10_regroup: "quick", sub_10_mixed: "quick",
    add_20_no_regroup: "quick", add_20_regroup: "quick", add_20_mixed: "quick",
    sub_20_no_regroup: "quick", sub_20_regroup: "quick", sub_20_mixed: "quick",
    add_50_no_regroup: "quick", add_50_regroup: "quick", add_50_mixed: "quick",
    sub_50_no_regroup: "quick", sub_50_regroup: "quick", sub_50_mixed: "quick",
    add_100_no_regroup: "quick", add_100_regroup: "quick", add_100_mixed: "quick",
    sub_100_no_regroup: "quick", sub_100_regroup: "quick", sub_100_mixed: "quick",
    add_wp_10: "extended", sub_wp_10: "extended", add_wp_10_plain: "extended", sub_wp_10_plain: "extended",
    add_wp_20: "extended", sub_wp_20: "extended", add_wp_20_plain: "extended", sub_wp_20_plain: "extended",
    add_wp_50: "extended", sub_wp_50: "extended", add_wp_50_plain: "extended", sub_wp_50_plain: "extended",
    add_wp_100: "extended", sub_wp_100: "extended", add_wp_100_plain: "extended", sub_wp_100_plain: "extended",
    add_wp_1k: "extended", sub_wp_1k: "extended", add_wp_1k_plain: "extended", sub_wp_1k_plain: "extended",
    add_wp_10k: "extended", sub_wp_10k: "extended", add_wp_10k_plain: "extended", sub_wp_10k_plain: "extended",
    add_wp_100k: "extended", sub_wp_100k: "extended", add_wp_100k_plain: "extended", sub_wp_100k_plain: "extended",
    add_wp_1m: "extended", sub_wp_1m: "extended", add_wp_1m_plain: "extended", sub_wp_1m_plain: "extended"
    // Everything else defaults to "extended" (50s threshold)
};

// ========== PRINT SIZE CATEGORIES ==========
// Maps each skill ID to a print layout size. Used by the auto-layout engine
// to determine columns and spacing per problem type.
// compact=3col, standard=2col, medium=2col, wide=1col, spacious=1col+work
export const SKILL_PRINT_SIZE = {
    // === COMPACT (3 cols): one-line pure arithmetic facts, simple identification ===
    // Rules: ONLY for pure arithmetic with no visuals, one-line answers
    add_facts: "compact", sub_facts: "compact", mult_facts: "compact", div_facts: "compact",
    add: "compact", subtract: "compact", multiply: "compact", divide: "compact",
    compare: "compact", compare_int: "compact", compare_decimal: "compact",
    odd_even: "compact", prime_composite: "compact",
    identify_angles: "compact", identify_lines: "compact",
    double: "compact", halve: "compact", make_ten: "compact", add_three: "compact",
    equal_sign: "compact",
    more_less_10: "compact", more_less_100: "compact",
    count_objects: "compact", count_sequence: "compact",
    compare_groups: "compact", compare_objects: "compact",
    nearest_10: "compact", nearest_100: "compact", nearest_1000: "compact",
    identify: "compact",
    value: "compact",
    add_sub_10s: "compact", add_sub_100s: "compact",
    classify_count: "compact",

    // === STANDARD (2 cols): column math, short computations, moderate content ===
    // Rules: Most skills land here - 2-3 lines of content, fraction ops, sequences, etc.
    number_bonds: "standard", teen_compose: "standard", number_word_form: "standard",
    comparison_word: "standard",
    time_hour: "standard", time_half_hour: "standard", time_quarter: "standard",
    time_5min: "standard", time_1min: "standard", time_analog_digital: "standard",
    time_match_clock: "standard",
    money_count: "standard", money: "standard",
    seq_2: "standard", seq_5: "standard", seq_10: "standard",
    count_by_fill: "standard",
    place_value_10x: "standard", round_decimals: "standard",
    frac_10_100: "standard", mult_scaling: "standard",
    simplify: "standard", equivalent: "standard",
    whole_as_fraction: "standard",
    temperature: "standard", capacity: "standard",
    probability_basic: "standard",
    range: "standard", mode: "standard", median: "standard", mean: "standard",
    number_pattern: "standard",
    missing_add_sub: "standard", missing_mult_div: "standard",
    estimate_sum: "standard", estimate_diff: "standard",
    expand: "standard", combine: "standard",
    add_int: "standard", sub_int: "standard", number_line_int: "standard",
    solve_unknown: "standard", evaluate_expression: "standard",
    write_expression: "standard", inequalities: "standard",
    improper_mixed: "standard",
    add_fractions_like: "medium", sub_fractions_like: "medium",
    add_mixed_like: "medium", sub_mixed_like: "medium",
    add_frac_unlike: "medium", sub_frac_unlike: "medium",
    add_mixed_unlike: "medium", sub_mixed_unlike: "medium",
    add_frac_like_nv: "compact", sub_frac_like_nv: "compact",
    add_frac_unlike_nv: "standard", sub_frac_unlike_nv: "standard",
    add_mixed_like_nv: "standard", sub_mixed_like_nv: "standard",
    add_mixed_unlike_nv: "standard", sub_mixed_unlike_nv: "standard",
    identify_nv: "compact", equiv_frac_nv: "compact", fraction_of_set_nv: "compact", fraction_of_set_hard_nv: "compact",
    mult_frac_whole_nv: "compact", decompose_frac_nv: "standard", frac_10_100_nv: "compact",
    mult_frac_frac_nv: "compact", div_unit_frac_nv: "compact", frac_as_div_nv: "standard", mult_scaling_nv: "compact",
    mult_frac_whole: "standard", mult_frac_frac: "standard",
    div_unit_fraction: "standard", frac_as_division: "standard",
    decompose_fractions: "standard",
    add_decimal: "standard", sub_decimal: "standard",
    mult_decimal: "standard", div_decimal: "standard",
    f_to_d: "standard", d_to_f: "standard", f_to_p: "standard", p_to_f: "standard",
    factors_identify: "standard", multiples: "standard",
    gcf_easy: "standard", gcf_hard: "standard", lcm: "standard",
    long_div_2digit: "standard",
    // Explicit add/sub by range (column format = standard 2-col)
    add_10_no_regroup: "standard", add_10_regroup: "standard", add_10_mixed: "standard",
    sub_10_no_regroup: "standard", sub_10_regroup: "standard", sub_10_mixed: "standard",
    add_20_no_regroup: "standard", add_20_regroup: "standard", add_20_mixed: "standard",
    sub_20_no_regroup: "standard", sub_20_regroup: "standard", sub_20_mixed: "standard",
    add_50_no_regroup: "standard", add_50_regroup: "standard", add_50_mixed: "standard",
    sub_50_no_regroup: "standard", sub_50_regroup: "standard", sub_50_mixed: "standard",
    add_100_no_regroup: "standard", add_100_regroup: "standard", add_100_mixed: "standard",
    sub_100_no_regroup: "standard", sub_100_regroup: "standard", sub_100_mixed: "standard",
    add_1k_no_regroup: "standard", add_1k_regroup: "standard", add_1k_mixed: "standard",
    sub_1k_no_regroup: "standard", sub_1k_regroup: "standard", sub_1k_mixed: "standard",
    add_10k_no_regroup: "standard", add_10k_regroup: "standard", add_10k_mixed: "standard",
    sub_10k_no_regroup: "standard", sub_10k_regroup: "standard", sub_10k_mixed: "standard",
    add_100k_no_regroup: "standard", add_100k_regroup: "standard", add_100k_mixed: "standard",
    sub_100k_no_regroup: "standard", sub_100k_regroup: "standard", sub_100k_mixed: "standard",
    add_1m_no_regroup: "standard", add_1m_regroup: "standard", add_1m_mixed: "standard",
    sub_1m_no_regroup: "standard", sub_1m_regroup: "standard", sub_1m_mixed: "standard",
    two_ops_no_paren: "standard", three_ops_no_paren: "standard",
    paren_simple: "standard", paren_multi: "standard",
    exponents_simple: "standard",
    measure_angles: "standard",
    elapsed_30min: "standard", elapsed_hour: "standard",
    elapsed_15min: "standard", elapsed_mixed: "standard",
    elapsed_find_duration: "standard",
    mixed_improper_visual: "medium",
    unit_conversions: "standard",

    // === MEDIUM (2 cols): moderate visuals, arrays, fraction circles, clocks ===
    // Rules: SVG/diagram visuals that are moderate size but don't need full width
    fraction_of_set: "medium", fraction_of_set_hard: "medium",
    equiv_frac_visual: "medium", fraction_number_line: "medium",
    arrays_groups: "medium",
    skip_count_line: "medium", skip_count_grid: "medium",
    rounding_visual: "medium", place_value_disks: "medium",
    reading_ruler: "medium", reading_ruler_hard: "medium",
    area_model_mult: "medium", area_model_mult_hard: "medium",
    area_model_div_2by1: "medium", area_model_div_3by1: "medium",
    add_sub_fact_family: "wide", mult_div_fact_family: "wide",
    number_families_add: "wide", number_families_add_med: "wide", number_families_add_hard: "wide",
    number_families_mult: "wide", number_families_mult_med: "wide", number_families_mult_hard: "wide",
    number_families_mixed: "wide", number_families_mixed_med: "wide", number_families_mixed_hard: "wide",
    nl_add: "medium", nl_sub: "medium", nl_mult: "medium", nl_div: "medium",
    elapsed_visual_easy: "medium", elapsed_visual_medium: "medium", elapsed_visual_hard: "medium",
    name_2d_shapes: "medium", name_3d_shapes: "medium",
    partition_shapes: "medium", compose_shapes: "medium",
    mult_properties: "medium", div_remainders: "medium",
    mult_chart: "medium",
    factor_tchart_easy: "medium", factor_tchart_medium: "medium", factor_tchart_hard: "medium",
    factor_links_easy: "medium", factor_links_medium: "medium", factor_links_hard: "medium",
    shape_pattern: "medium",
    classify_triangles: "medium", classify_quads: "medium",
    additive_angles: "medium", symmetry: "medium",
    shape_positions: "medium",
    estimate_length: "medium", mass_volume_liquid: "medium",
    shape_attributes: "medium",
    measure_nonstandard: "medium", order_objects_length: "medium",
    line_plot_fractions: "medium",

    // === WIDE (1 col): large SVGs, graphs, coordinate grids, function tables ===
    // Rules: Full-width visuals - graphs, coordinate planes, composite geometry
    bar_graph: "wide", pictograph: "wide", line_plot: "wide",
    tally_chart: "wide", pie_chart: "wide",
    coordinate_q1: "wide", coordinate_all: "wide", coordinate_graph: "wide",
    perimeter: "wide", area: "wide", area_perimeter: "wide",
    composite_shapes: "wide",
    area_unit_squares: "wide", perimeter_grid: "wide",
    volume: "wide", volume_composite: "wide",
    function_table_easy: "wide", function_table_hard: "wide",
    tape_diagram: "wide",
    pattern_relationship: "wide",

    // === SPACIOUS (1 col + work space): word problems only ===
    add_word_problems: "spacious", sub_word_problems: "spacious",
    mult_word_problems: "spacious", div_word_problems: "spacious",
    frac_word_problems: "spacious", frac_mult_word: "spacious",
    multi_step_word: "spacious", mult_comparison: "spacious",
    add_word_problems_plain: "spacious", sub_word_problems_plain: "spacious",
    mult_word_problems_plain: "spacious", div_word_problems_plain: "spacious",
    mult_comparison_plain: "spacious", tape_diagram_plain: "spacious",
    multi_step_word_plain: "spacious", frac_word_problems_plain: "spacious",
    frac_mult_word_plain: "spacious",
    word_problems_mixed: "spacious", word_problems_mixed_plain: "spacious",
    frac_word_mixed: "spacious", frac_word_mixed_plain: "spacious",
    algebra_word_mixed: "spacious", algebra_word_mixed_plain: "spacious",
    // Explicit add/sub word problems by range
    add_wp_10: "spacious", sub_wp_10: "spacious", add_wp_10_plain: "spacious", sub_wp_10_plain: "spacious",
    add_wp_20: "spacious", sub_wp_20: "spacious", add_wp_20_plain: "spacious", sub_wp_20_plain: "spacious",
    add_wp_50: "spacious", sub_wp_50: "spacious", add_wp_50_plain: "spacious", sub_wp_50_plain: "spacious",
    add_wp_100: "spacious", sub_wp_100: "spacious", add_wp_100_plain: "spacious", sub_wp_100_plain: "spacious",
    add_wp_1k: "spacious", sub_wp_1k: "spacious", add_wp_1k_plain: "spacious", sub_wp_1k_plain: "spacious",
    add_wp_10k: "spacious", sub_wp_10k: "spacious", add_wp_10k_plain: "spacious", sub_wp_10k_plain: "spacious",
    add_wp_100k: "spacious", sub_wp_100k: "spacious", add_wp_100k_plain: "spacious", sub_wp_100k_plain: "spacious",
    add_wp_1m: "spacious", sub_wp_1m: "spacious", add_wp_1m_plain: "spacious", sub_wp_1m_plain: "spacious",
};

// Fallback: map printFormat → size when skillId isn't in SKILL_PRINT_SIZE
export const PRINT_FORMAT_SIZE = {
    'add-facts-horizontal': 'compact', 'add-facts-vertical': 'compact',
    'sub-facts-horizontal': 'compact', 'sub-facts-vertical': 'compact',
    'mult-facts-horizontal': 'compact', 'mult-facts-vertical': 'compact',
    'div-facts-horizontal': 'compact', 'div-facts-vertical': 'compact',
    'div-facts-fraction': 'compact', 'div-facts-long': 'compact',
    'basic-add': 'compact', 'basic-sub': 'compact',
    'basic-mult': 'compact', 'basic-div': 'compact',
    'column-add': 'standard', 'column-sub': 'standard', 'column-mult': 'standard',
    'long-division': 'standard', 'order-of-ops': 'standard',
    'missing-number': 'standard', 'missing-factor': 'standard',
    'estimation-sum': 'standard', 'estimation-diff': 'standard',
    'area-model-mult': 'medium', 'area-model-mult-hard': 'medium', 'area-model-div': 'medium',
    'fraction-shade': 'medium', 'fraction-identify': 'medium',
    'fraction-strip': 'medium', 'fraction-pie': 'medium',
    'fraction-compare': 'medium', 'fraction-equiv': 'medium',
    'fraction-numberline': 'medium',
    'fraction-of-set': 'medium', 'fraction-of-set-hard': 'medium',
    'equiv-frac-visual': 'medium',
    'arrays-groups': 'medium', 'mult-properties': 'medium',
    'div-remainders': 'medium',
    'skip-count-line': 'medium', 'skip-count-grid': 'medium',
    'rounding-visual': 'medium', 'place-value-disks': 'medium',
    'reading-ruler': 'medium', 'reading-ruler-hard': 'medium',
    'elapsed-visual': 'medium',
    'tape-diagram': 'wide', 'multi-step-word': 'wide',
    'line-plot-fractions': 'medium', 'function-table-easy': 'wide', 'function-table-hard': 'wide',
    'coordinate-graph': 'wide', 'bar-chart': 'wide',
    'word-add': 'spacious', 'word-sub': 'spacious',
    'word-mult': 'spacious', 'word-div': 'spacious',
    'fraction-word': 'spacious',
    'word-plain': 'spacious',
};

export const PRINT_SIZE_COLUMNS = {
    compact: 3,
    standard: 2,
    medium: 2,
    wide: 1,
    spacious: 1
};

export function getSkillPrintSize(skillId, printFormat) {
    return SKILL_PRINT_SIZE[skillId] || PRINT_FORMAT_SIZE[printFormat] || 'standard';
}
