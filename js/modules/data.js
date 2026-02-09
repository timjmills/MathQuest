// Data constants - DOMAINS, SKILLS, SKILL_CODES, DEFAULT_TABLES

export const DEFAULT_TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export const DOMAINS = {
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
    // ========== DOMAIN 1: NUMBER & OPERATIONS ==========
    addition: [
        { v: "add_facts", l: "🟢 Addition Facts (within 20)" },
        { v: "add_sub_10s", l: "🟢 Add & Subtract by 10s" },
        { v: "add_sub_100s", l: "🟢 Add & Subtract by 100s" },
        { v: "add", l: "🟢 Basic Addition" },
        { v: "add_word_problems", l: "🟢 Addition Word Problems" },
        { v: "add_sub_fact_family", l: "🟡 Addition Fact Families" },
        { v: "number_families_add", l: "🟢 Number Families - Easy" },
        { v: "number_families_add_med", l: "🟡 Number Families - Medium" },
        { v: "number_families_add_hard", l: "🟠 Number Families - Hard" },
        { v: "mixed_addition", l: "🎲 Mixed Addition" },
    ],
    subtraction: [
        { v: "sub_facts", l: "🟢 Subtraction Facts (within 20)" },
        { v: "subtract", l: "🟢 Basic Subtraction" },
        { v: "sub_word_problems", l: "🟢 Subtraction Word Problems" },
        { v: "missing_add_sub", l: "🟡 Missing Numbers (+/−)" },
        { v: "mixed_add_sub", l: "🟡 Mixed Addition & Subtraction" },
        { v: "mixed_subtraction", l: "🎲 Mixed Subtraction" },
    ],
    multiplication: [
        { v: "mult_facts", l: "🟢 Multiplication Facts (1-12)" },
        { v: "multiply", l: "🟢 Basic Multiplication" },
        { v: "arrays_groups", l: "🟢 Arrays & Equal Groups (Visual)" },
        { v: "mult_properties", l: "🟡 Multiplication Properties (Visual)" },
        { v: "mult_word_problems", l: "🟢 Multiplication Word Problems" },
        { v: "area_model_mult", l: "🟡 Area Model Multiplication" },
        { v: "area_model_mult_hard", l: "🟠 Area Model (2×2 and 2×3)" },
        { v: "mult_div_fact_family", l: "🟡 Multiplication Fact Families" },
        { v: "number_families_mult", l: "🟢 Number Families - Easy" },
        { v: "number_families_mult_med", l: "🟡 Number Families - Medium" },
        { v: "number_families_mult_hard", l: "🟠 Number Families - Hard" },
        { v: "mixed_multiplication", l: "🎲 Mixed Multiplication" },
    ],
    division: [
        { v: "div_facts", l: "🟢 Division Facts (1-12)" },
        { v: "divide", l: "🟢 Basic Division" },
        { v: "div_remainders", l: "🟡 Division with Remainders (Visual)" },
        { v: "div_word_problems", l: "🟢 Division Word Problems" },
        { v: "area_model_div_2by1", l: "🟡 Area Model Division (2÷1 digit)" },
        { v: "area_model_div_3by1", l: "🟠 Area Model Division (3÷1 digit)" },
        { v: "missing_mult_div", l: "🟡 Missing Factors (×/÷)" },
        { v: "mixed_mult_div", l: "🟡 Mixed Multiplication & Division" },
        { v: "mixed_division", l: "🎲 Mixed Division" },
    ],
    integers: [
        { v: "number_line_int", l: "🟢 Number Lines with Negatives" },
        { v: "compare_int", l: "🟢 Comparing Integers" },
        { v: "add_int", l: "🟡 Adding Integers" },
        { v: "sub_int", l: "🟡 Subtracting Integers" },
        { v: "mixed_integers", l: "🎲 Mixed Integers" },
    ],
    number_ops_mixed: [
        { v: "mixed", l: "🔴 All Four Operations (+ − × ÷)" },
        { v: "number_families_mixed", l: "🟢 Number Families (All 4 Ops) - Easy" },
        { v: "number_families_mixed_med", l: "🟡 Number Families (All 4 Ops) - Medium" },
        { v: "number_families_mixed_hard", l: "🟠 Number Families (All 4 Ops) - Hard" },
        { v: "operations_all", l: "🎲 All Operations Skills" },
    ],
    
    // ========== DOMAIN 2: FRACTIONS, DECIMALS & PERCENTS ==========
    fractions: [
        { v: "identify", l: "🟢 Identify Fractions (Visual)" },
        { v: "equiv_frac_visual", l: "🟢 Equivalent Fractions (Visual)" },
        { v: "equivalent", l: "🟢 Equivalent Fractions" },
        { v: "fraction_of_set", l: "🟢 Fraction of a Set (Visual)" },
        { v: "fraction_of_set_hard", l: "🟠 Fraction of a Set - Hard (Visual)" },
        { v: "compare", l: "🟡 Compare Fractions (>, <, =)" },
        { v: "simplify", l: "🟡 Simplify Fractions" },
        { v: "improper_mixed", l: "🟡 Improper ↔ Mixed Numbers" },
        { v: "mixed_fractions", l: "🎲 Mixed Fractions" },
    ],
    decimals: [
        { v: "add_decimal", l: "🟢 Adding Decimals" },
        { v: "sub_decimal", l: "🟢 Subtracting Decimals" },
        { v: "mult_decimal", l: "🟡 Multiplying Decimals" },
        { v: "div_decimal", l: "🟡 Dividing Decimals" },
        { v: "compare_decimal", l: "🟡 Comparing Decimals" },
        { v: "mixed_decimals", l: "🎲 Mixed Decimals" },
    ],
    conversions: [
        { v: "f_to_d", l: "🟢 Fraction → Decimal" },
        { v: "d_to_f", l: "🟢 Decimal → Fraction" },
        { v: "f_to_p", l: "🟡 Fraction → Percent" },
        { v: "p_to_f", l: "🟡 Percent → Fraction" },
        { v: "mixed_conversions", l: "🎲 Mixed Conversions" },
    ],
    frac_dec_mixed: [
        { v: "fractions_all", l: "🥧 All Fraction Skills" },
        { v: "decimals_all", l: "🔢 All Decimal Skills" },
        { v: "conversions_all", l: "🔀 All Conversion Skills" },
        { v: "fdp_all", l: "🎲 All FDP Skills" },
    ],
    
    // ========== DOMAIN 3: GEOMETRY & MEASUREMENT ==========
    area_perimeter: [
        { v: "area_unit_squares", l: "🟢 Area - Unit Square Counting (Visual)" },
        { v: "perimeter_grid", l: "🟢 Perimeter - Grid Counting (Visual)" },
        { v: "perimeter", l: "🟢 Perimeter Only" },
        { v: "area", l: "🟢 Area Only" },
        { v: "area_perimeter", l: "🟡 Area AND Perimeter" },
        { v: "composite_shapes", l: "🟠 Composite Shapes (L, T, U)" },
        { v: "volume", l: "🟡 Volume (Rectangular Prisms)" },
        { v: "mixed_area_perimeter", l: "🎲 Mixed Area & Perimeter" },
    ],
    angles_lines: [
        { v: "identify_angles", l: "🟢 Identify Angles" },
        { v: "measure_angles", l: "🟡 Measure/Estimate Angles" },
        { v: "identify_lines", l: "🟢 Identify Lines (∥, ⊥)" },
        { v: "symmetry", l: "🟡 Lines of Symmetry" },
        { v: "mixed_angles_lines", l: "🎲 Mixed Angles & Lines" },
    ],
    shapes_classify: [
        { v: "classify_triangles", l: "🟡 Classify Triangles" },
        { v: "classify_quads", l: "🟠 Classify Quadrilaterals" },
        { v: "mixed_shapes", l: "🎲 Mixed Shape Classification" },
    ],
    coordinates: [
        { v: "coordinate_q1", l: "🟢 Coordinates (Quadrant I)" },
        { v: "coordinate_all", l: "🟡 Coordinates (All 4 Quadrants)" },
        { v: "coordinate_graph", l: "🟠 Coordinate Graphing" },
        { v: "mixed_coordinates", l: "🎲 Mixed Coordinates" },
    ],
    measurement: [
        // Time Reading Skills
        { v: "time_hour", l: "🟢 Time to the Hour" },
        { v: "time_half_hour", l: "🟢 Time to Half Hour" },
        { v: "time_quarter", l: "🟡 Time to Quarter Hour" },
        { v: "time_5min", l: "🟡 Time to 5 Minutes" },
        { v: "time_1min", l: "🟠 Time to the Minute" },
        // Time Matching Skills
        { v: "time_analog_digital", l: "🟢 Analog ↔ Digital Match" },
        { v: "time_match_clock", l: "🟡 Match Time to Clock" },
        // Elapsed Time Skills
        { v: "elapsed_30min", l: "🟢 Elapsed Time (30 min)" },
        { v: "elapsed_hour", l: "🟢 Elapsed Time (Hours)" },
        { v: "elapsed_15min", l: "🟡 Elapsed Time (15 min)" },
        { v: "elapsed_mixed", l: "🟠 Elapsed Time (Hours & Minutes)" },
        { v: "elapsed_find_duration", l: "🟠 Find the Duration" },
        // Visual Elapsed Time (two clocks shown)
        { v: "elapsed_visual_easy", l: "🟢 Elapsed Time Clocks - Easy (Visual)" },
        { v: "elapsed_visual_medium", l: "🟡 Elapsed Time Clocks - Medium (Visual)" },
        { v: "elapsed_visual_hard", l: "🟠 Elapsed Time Clocks - Hard (Visual)" },
        // Other Measurement
        { v: "reading_ruler", l: "🟢 Reading a Ruler (Visual)" },
        { v: "reading_ruler_hard", l: "🟠 Reading a Ruler - Quarter Inches (Visual)" },
        { v: "money_count", l: "🟢 Counting Coins & Bills (Visual)" },
        { v: "money", l: "🟢 Money & Making Change" },
        { v: "temperature", l: "🟡 Temperature (°C/°F)" },
        { v: "capacity", l: "🟠 Capacity/Volume Units" },
        { v: "mixed_measurement", l: "🎲 Mixed Measurement" },
        { v: "mixed_time", l: "🎲 Mixed Time Skills" },
    ],
    geo_mixed: [
        { v: "geometry_all", l: "📐 All Geometry Skills" },
        { v: "measurement_all", l: "📏 All Measurement Skills" },
        { v: "geo_meas_all", l: "🎲 All Geometry & Measurement" },
    ],
    
    // ========== DOMAIN 4: DATA & STATISTICS ==========
    graphs: [
        { v: "bar_graph", l: "🟢 Bar Graphs" },
        { v: "pictograph", l: "🟢 Pictographs" },
        { v: "tally_chart", l: "🟢 Tally Charts" },
        { v: "line_plot", l: "🟡 Line Plots" },
        { v: "line_plot_fractions", l: "🟡 Line Plots with Fractions (Visual)" },
        { v: "pie_chart", l: "🟡 Pie Charts" },
        { v: "mixed_graphs", l: "🎲 Mixed Graphs" },
    ],
    data_analysis: [
        { v: "mean", l: "🟡 Mean (Average)" },
        { v: "median", l: "🟡 Median" },
        { v: "mode", l: "🟡 Mode" },
        { v: "range", l: "🟡 Range" },
        { v: "mixed_data_analysis", l: "🎲 Mixed Data Analysis" },
    ],
    probability: [
        { v: "probability_basic", l: "🟠 Basic Probability" },
        { v: "mixed_probability", l: "🎲 Mixed Probability" },
    ],
    data_mixed: [
        { v: "data_stats_all", l: "📊 All Data & Stats Skills" },
    ],
    
    // ========== DOMAIN 5: ALGEBRAIC THINKING ==========
    patterns: [
        { v: "seq_2", l: "🟢 Count by 2s" },
        { v: "seq_5", l: "🟢 Count by 5s" },
        { v: "seq_10", l: "🟢 Count by 10s" },
        { v: "count_by_fill", l: "🟡 Count-By Fill-In (1-12)" },
        { v: "skip_count_line", l: "🟢 Skip Counting Number Line (Visual)" },
        { v: "skip_count_grid", l: "🟡 Skip Counting Grid (Visual)" },
        { v: "double", l: "🟢 Doubling" },
        { v: "halve", l: "🟢 Halving" },
        { v: "mixed_patterns", l: "🎲 Mixed Patterns" },
    ],
    algebra: [
        { v: "tape_diagram", l: "🟡 Tape Diagrams / Bar Models (Visual)" },
        { v: "multi_step_word", l: "🟠 Multi-Step Word Problems (Visual)" },
        { v: "solve_unknown", l: "🟢 Solve for Unknown (x + 5 = 12)" },
        { v: "write_expression", l: "🟡 Write Expressions from Words" },
        { v: "evaluate_expression", l: "🟡 Evaluate Expressions" },
        { v: "inequalities", l: "🟠 Inequalities (>, <, ≥, ≤)" },
        { v: "function_table_easy", l: "🟢 Function Tables - Easy (Visual)" },
        { v: "function_table_hard", l: "🔴 Function Tables - Hard (Visual)" },
        { v: "mixed_algebra", l: "🎲 Mixed Algebra" },
    ],
    order_of_operations: [
        { v: "two_ops_no_paren", l: "🟢 Level 1: Two Operations" },
        { v: "three_ops_no_paren", l: "🟢 Level 2: Three Operations" },
        { v: "paren_simple", l: "🟡 Level 3: Simple Parentheses" },
        { v: "paren_multi", l: "🟡 Level 4: Multiple Ops" },
        { v: "exponents_simple", l: "🟠 Level 5: Exponents" },
        { v: "mixed_order_ops", l: "🎲 Mixed Order of Operations" },
    ],
    placevalue: [
        { v: "place_value_disks", l: "🟡 Place Value Disks (Visual)" },
        { v: "identify", l: "🟢 Name the Place" },
        { v: "value", l: "🟢 Value of a Digit" },
        { v: "compare", l: "🟡 Compare Numbers (>, <, =)" },
        { v: "expand", l: "🟠 Expanded Form" },
        { v: "combine", l: "🟠 Standard Form" },
        { v: "mixed_placevalue", l: "🎲 Mixed Place Value" },
    ],
    number_sense: [
        { v: "rounding_visual", l: "🟢 Rounding on Number Line (Visual)" },
        { v: "nearest_10", l: "🟢 Round to Nearest 10" },
        { v: "nearest_100", l: "🟢 Round to Nearest 100" },
        { v: "nearest_1000", l: "🟡 Round to Nearest 1,000" },
        { v: "estimate_sum", l: "🟢 Estimate Sums" },
        { v: "estimate_diff", l: "🟢 Estimate Differences" },
        { v: "mixed_number_sense", l: "🎲 Mixed Number Sense" },
    ],
    number_theory: [
        { v: "prime_composite", l: "🟢 Prime vs Composite" },
        { v: "factors_identify", l: "🟢 Identify Factors (Circle All)" },
        { v: "factor_tchart_easy", l: "🟢 Factor T-Chart - Easy (Visual)" },
        { v: "factor_tchart_medium", l: "🟡 Factor T-Chart - Medium (Visual)" },
        { v: "factor_tchart_hard", l: "🟠 Factor T-Chart - Hard (Visual)" },
        { v: "factor_links_easy", l: "Factor Links - Easy (Visual)" },
        { v: "factor_links_medium", l: "Factor Links - Medium (Visual)" },
        { v: "factor_links_hard", l: "Factor Links - Hard (Visual)" },
        { v: "multiples", l: "🟢 Multiples of a Number" },
        { v: "gcf_easy", l: "🟢 Greatest Common Factor (Easy)" },
        { v: "gcf_hard", l: "🟡 Greatest Common Factor (Hard)" },
        { v: "lcm", l: "🟡 Least Common Multiple" },
        { v: "mixed_number_theory", l: "🎲 Mixed Number Theory" },
    ],
    algebra_mixed: [
        { v: "patterns_all", l: "🔢 All Pattern Skills" },
        { v: "algebra_all", l: "🔤 All Algebra Skills" },
        { v: "order_ops_all", l: "🧮 All Order of Operations" },
        { v: "placevalue_all", l: "📊 All Place Value Skills" },
        { v: "number_sense_all", l: "🎯 All Number Sense Skills" },
        { v: "number_theory_all", l: "🔬 All Number Theory Skills" },
        { v: "algebraic_all", l: "🎲 All Algebraic Thinking" },
    ],
    
    // ========== ALL DOMAINS MIXED ==========
    all_mixed: [
        { v: "all_domains_mixed", l: "🎲 All Skills from All Domains" },
        { v: "custom_mixed", l: "🎯 Custom Mixed (From Settings)" },
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
    arrays_groups: "quick", compare_decimal: "quick", compare_numbers: "quick"
    // Everything else defaults to "extended" (50s threshold)
};
