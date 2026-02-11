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
    'mult_comparison': 4, 'long_div_2digit': 5,
    'add': 1, 'subtract': 1, 'add_facts': 1, 'sub_facts': 1,
    'add_sub_10s': 1, 'add_sub_fact_family': 1, 'number_families_add': 1, 'missing_add_sub': 1,
    'add_sub_100s': 2, 'add_word_problems': 2, 'sub_word_problems': 2,
    'number_families_add_med': 2, 'number_families_add_hard': 2,
    'mixed_add_sub': 2, 'arrays_groups': 2, 'number_families_mixed': 2,
    'multiply': 3, 'divide': 3, 'mult_facts': 3, 'div_facts': 3,
    'mult_word_problems': 3, 'div_word_problems': 3, 'mult_div_fact_family': 3,
    'number_families_mult': 3, 'number_families_mult_med': 3,
    'missing_mult_div': 3, 'mixed_mult_div': 3, 'mult_properties': 3, 'mult_chart': 3,
    'number_families_mixed_med': 3,
    'number_families_mult_hard': 4, 'number_families_mixed_hard': 4,
    'div_remainders': 4, 'area_model_mult': 4, 'area_model_div_2by1': 4,
    'area_model_mult_hard': 5, 'area_model_div_3by1': 5,
    // Integers
    'number_line_int': 6, 'compare_int': 6, 'add_int': 6, 'sub_int': 6,
    // Fraction Operations
    'add_fractions_like': 4, 'sub_fractions_like': 4, 'add_mixed_like': 4, 'sub_mixed_like': 4,
    'mult_frac_whole': 4, 'decompose_fractions': 4, 'frac_word_problems': 4, 'frac_10_100': 4,
    'add_frac_unlike': 5, 'sub_frac_unlike': 5, 'add_mixed_unlike': 5, 'sub_mixed_unlike': 5,
    'mult_frac_frac': 5, 'div_unit_fraction': 5, 'frac_as_division': 5,
    'mult_scaling': 5, 'frac_mult_word': 5,
    // Fractions (prefixed to avoid collision with placevalue)
    'fractions:identify': 3, 'equiv_frac_visual': 3, 'fraction_of_set': 3,
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
    // Algebra
    'tape_diagram': 4, 'multi_step_word': 4, 'function_table_easy': 4,
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
        { v: "add_sub_fact_family", l: "Addition Fact Families" },
        { v: "number_families_add", l: "Number Families - Easy" },
        { v: "number_families_add_med", l: "Number Families - Medium" },
        { v: "number_families_add_hard", l: "Number Families - Hard" },
        { v: "add_three", l: "Add Three Numbers (≤20)" },
        { v: "comparison_word", l: "How Many More/Fewer? (Visual)" },
        { v: "equal_sign", l: "True/False Equations (Visual)" },
        { v: "mixed_addition", l: "Mixed Addition" },
    ],
    subtraction: [
        { v: "sub_facts", l: "Subtraction Facts (within 20)" },
        { v: "subtract", l: "Basic Subtraction" },
        { v: "sub_word_problems", l: "Subtraction Word Problems" },
        { v: "missing_add_sub", l: "Missing Numbers (+/−)" },
        { v: "mixed_add_sub", l: "Mixed Addition & Subtraction" },
        { v: "mixed_subtraction", l: "Mixed Subtraction" },
    ],
    multiplication: [
        { v: "mult_facts", l: "Multiplication Facts (1-12)" },
        { v: "multiply", l: "Basic Multiplication" },
        { v: "arrays_groups", l: "Arrays & Equal Groups (Visual)" },
        { v: "mult_properties", l: "Multiplication Properties (Visual)" },
        { v: "mult_word_problems", l: "Multiplication Word Problems" },
        { v: "mult_comparison", l: "Times as Many Word Problems (Visual)" },
        { v: "area_model_mult", l: "Area Model Multiplication" },
        { v: "area_model_mult_hard", l: "Area Model (2×2 and 2×3)" },
        { v: "mult_div_fact_family", l: "Multiplication Fact Families" },
        { v: "number_families_mult", l: "Number Families - Easy" },
        { v: "number_families_mult_med", l: "Number Families - Medium" },
        { v: "number_families_mult_hard", l: "Number Families - Hard" },
        { v: "mult_chart", l: "Multiplication Chart (Visual)" },
        { v: "mixed_multiplication", l: "Mixed Multiplication" },
    ],
    division: [
        { v: "div_facts", l: "Division Facts (1-12)" },
        { v: "divide", l: "Basic Division" },
        { v: "div_remainders", l: "Division with Remainders (Visual)" },
        { v: "div_word_problems", l: "Division Word Problems" },
        { v: "area_model_div_2by1", l: "Area Model Division (2÷1 digit)" },
        { v: "area_model_div_3by1", l: "Area Model Division (3÷1 digit)" },
        { v: "long_div_2digit", l: "Divide by 2-Digit Numbers (Visual)" },
        { v: "missing_mult_div", l: "Missing Factors (×/÷)" },
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
        { v: "number_families_mixed", l: "Number Families (All 4 Ops) - Easy" },
        { v: "number_families_mixed_med", l: "Number Families (All 4 Ops) - Medium" },
        { v: "number_families_mixed_hard", l: "Number Families (All 4 Ops) - Hard" },
        { v: "operations_all", l: "All Operations Skills" },
    ],
    
    // ========== DOMAIN 2: FRACTIONS, DECIMALS & PERCENTS ==========
    fractions: [
        { v: "identify", l: "Identify Fractions (Visual)" },
        { v: "equiv_frac_visual", l: "Equivalent Fractions (Visual)" },
        { v: "equivalent", l: "Equivalent Fractions" },
        { v: "fraction_of_set", l: "Fraction of a Set (Visual)" },
        { v: "fraction_of_set_hard", l: "Fraction of a Set - Hard (Visual)" },
        { v: "compare", l: "Compare Fractions (>, <, =)" },
        { v: "simplify", l: "Simplify Fractions" },
        { v: "improper_mixed", l: "Improper ↔ Mixed Numbers" },
        { v: "mixed_improper_visual", l: "Mixed ↔ Improper (Visual Pizza)" },
        { v: "mixed_fractions", l: "Mixed Fractions" },
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
        { v: "frac_10_100", l: "Fractions /10 as /100 (Visual)" },
        // Grade 5 fraction operations
        { v: "add_frac_unlike", l: "Add Fractions (Unlike Denom) (Visual)" },
        { v: "sub_frac_unlike", l: "Subtract Fractions (Unlike Denom) (Visual)" },
        { v: "add_mixed_unlike", l: "Add Mixed Numbers (Unlike Denom) (Visual)" },
        { v: "sub_mixed_unlike", l: "Subtract Mixed Numbers (Unlike Denom) (Visual)" },
        { v: "mult_frac_frac", l: "Fraction × Fraction (Visual)" },
        { v: "div_unit_fraction", l: "Divide with Unit Fractions (Visual)" },
        { v: "frac_as_division", l: "Fraction as Division (a/b = a÷b) (Visual)" },
        { v: "mult_scaling", l: "Multiplication as Scaling (Visual)" },
        { v: "frac_mult_word", l: "Fraction Mult/Div Word Problems (Visual)" },
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
        { v: "pattern_relationship", l: "Two Patterns, Find Relationship (Visual)" },
        { v: "mixed_patterns", l: "Mixed Patterns" },
    ],
    algebra: [
        { v: "tape_diagram", l: "Tape Diagrams / Bar Models (Visual)" },
        { v: "multi_step_word", l: "Multi-Step Word Problems (Visual)" },
        { v: "solve_unknown", l: "Solve for Unknown (x + 5 = 12)" },
        { v: "write_expression", l: "Write Expressions from Words" },
        { v: "evaluate_expression", l: "Evaluate Expressions" },
        { v: "inequalities", l: "Inequalities (>, <, ≥, ≤)" },
        { v: "function_table_easy", l: "Function Tables - Easy (Visual)" },
        { v: "function_table_hard", l: "Function Tables - Hard (Visual)" },
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
    ],
};

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
    
    // Process each category and skill
    for (const categoryId in SKILLS) {
        const skills = SKILLS[categoryId];
        if (!Array.isArray(skills)) continue;
        
        for (const skill of skills) {
            // Skip mixed/all skills from code system
            if (skill.v.startsWith('mixed_') || skill.v === 'mixed' || skill.v.endsWith('_all')) continue;
            
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
    mult_scaling: "quick", frac_10_100: "quick",
    place_value_10x: "quick", round_decimals: "quick",
    more_less_10: "quick", more_less_100: "quick"
    // Everything else defaults to "extended" (50s threshold)
};
