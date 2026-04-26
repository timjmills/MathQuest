// generate-question.js - Dispatcher: routes to domain-specific question generators
import { state } from './state.js';
import { DEFAULT_TABLES, SKILLS, DOMAINS, SKILL_GRADES, getSkillGrade, isMixedMetaSkill, getSkillsForCategory, getSkillsForDomain, getSkillsForGrade, getCategoryForSkill, getMixedSkillScope } from './data.js';
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

// Plain (no-picture) word problem variants - map to base skill for generation
const PLAIN_WORD_SKILLS = {
    'add_word_problems_plain': 'add_word_problems',
    'sub_word_problems_plain': 'sub_word_problems',
    'mult_word_problems_plain': 'mult_word_problems',
    'div_word_problems_plain': 'div_word_problems',
    'mult_comparison_plain': 'mult_comparison',
    'tape_diagram_plain': 'tape_diagram',
    'multi_step_word_plain': 'multi_step_word',
    'frac_word_problems_plain': 'frac_word_problems',
    'frac_mult_word_plain': 'frac_mult_word',
    'word_problems_mixed_plain': 'word_problems_mixed',
    'frac_word_mixed_plain': 'frac_word_mixed',
    'algebra_word_mixed_plain': 'algebra_word_mixed',
    // Explicit range word problem plain variants
    'add_wp_10_plain': 'add_wp_10', 'sub_wp_10_plain': 'sub_wp_10',
    'add_wp_20_plain': 'add_wp_20', 'sub_wp_20_plain': 'sub_wp_20',
    'add_wp_50_plain': 'add_wp_50', 'sub_wp_50_plain': 'sub_wp_50',
    'add_wp_100_plain': 'add_wp_100', 'sub_wp_100_plain': 'sub_wp_100',
    'add_wp_1k_plain': 'add_wp_1k', 'sub_wp_1k_plain': 'sub_wp_1k',
    'add_wp_10k_plain': 'add_wp_10k', 'sub_wp_10k_plain': 'sub_wp_10k',
    'add_wp_100k_plain': 'add_wp_100k', 'sub_wp_100k_plain': 'sub_wp_100k',
    'add_wp_1m_plain': 'add_wp_1m', 'sub_wp_1m_plain': 'sub_wp_1m',
};

// Mixed word problem skills → randomly pick from component sub-skills
const MIXED_WORD_SKILLS = {
    'word_problems_mixed': ['add_word_problems', 'sub_word_problems', 'mult_word_problems', 'div_word_problems', 'mult_comparison'],
    'frac_word_mixed': ['frac_word_problems', 'frac_mult_word'],
    'algebra_word_mixed': ['tape_diagram', 'multi_step_word'],
};

export function generateQuestion() {
    // Whole-Program Adaptive Mode (opt-in): bias state.range / state.decimalPlaces
    // (or swap to an _easy/_hard variant) BEFORE generation, then restore at the
    // end so user-selected settings are never permanently mutated. MAP mode
    // (state.mapMode) is fully owned by map-engine.js and is NEVER touched here.
    // Worksheet (state.gameMode==='worksheet') and Quiz (state.quizMode===true)
    // are also carved out — they are fixed-difficulty by design (teachers want
    // predictable problem sets). The applyAdaptiveSettingsForNextQuestion helper
    // double-checks these flags, but we skip the call entirely as a fast path.
    let _adaptiveSkillId = null;
    let _restoreAdaptive = null;
    const _adaptiveAllowed = state.adaptiveModeEnabled && !state.mapMode
        && state.gameMode !== 'worksheet' && state.quizMode !== true;
    if (typeof window !== 'undefined' && _adaptiveAllowed
        && typeof window.applyAdaptiveSettingsForNextQuestion === 'function') {
        _adaptiveSkillId = state.skill;
        _restoreAdaptive = window.applyAdaptiveSettingsForNextQuestion(_adaptiveSkillId);
    }

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

    // Detect plain (no-picture) word problem variants before routing
    const isPlainWord = PLAIN_WORD_SKILLS.hasOwnProperty(state.skill);
    const originalPlainSkill = isPlainWord ? state.skill : null;
    if (isPlainWord) {
        // Temporarily swap to base skill for generation, restore at end
        state.skill = PLAIN_WORD_SKILLS[state.skill];
    }

    // Resolve mixed word problem skills → pick a random component sub-skill
    if (MIXED_WORD_SKILLS[state.skill]) {
        state.skill = pick(MIXED_WORD_SKILLS[state.skill]);
    }

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

    // Build category-specific mixed skills DYNAMICALLY from SKILLS structure
    // This auto-updates when new skills are added to any category
    const categoryMixedSkills = {};
    for (const [catId, catSkills] of Object.entries(SKILLS)) {
        if (!Array.isArray(catSkills)) continue;
        const playable = getSkillsForCategory(catId);
        if (playable.length === 0) continue;
        // Find all mixed_* entries in this category (single-category mixed skills)
        for (const s of catSkills) {
            if (s.v.startsWith('mixed_') && s.v !== 'mixed') {
                categoryMixedSkills[s.v] = { category: catId, skills: playable };
            }
        }
    }
    // Special: mixed_time = only time-related skills from measurement
    categoryMixedSkills['mixed_time'] = {
        category: 'measurement',
        skills: getSkillsForCategory('measurement').filter(s =>
            s.startsWith('time_') || s.startsWith('elapsed_'))
    };

    // Check if this is a mixed skill and resolve it
    let actualSkill = state.skill;
    let forcedMappedCategory = null;

    // Domain-level _all, grade-level, and all_domains_mixed → force all_mixed recursive path
    // EXCLUSIONS: real concrete skills that happen to end in "_all" (e.g.
    // coordinate_all = "Coordinates (All 4 Quadrants)") MUST dispatch to their
    // own generator, not to the recursive mixed path.
    const _realAllSkills = new Set(['coordinate_all']);
    if ((state.skill.endsWith('_all') && !_realAllSkills.has(state.skill))
        || state.skill === 'all_domains_mixed' || state.skill === 'counting_all'
        || (state.skill.startsWith('grade_') && state.skill.endsWith('_mixed'))) {
        forcedMappedCategory = 'all_mixed';
    } else if (categoryMixedSkills[state.skill]) {
        // Single-category mixed - pick a skill and continue with normal dispatch
        const mixedConfig = categoryMixedSkills[state.skill];
        actualSkill = pick(mixedConfig.skills);
        console.log(`Mixed skill ${state.skill} resolved to: ${actualSkill}`);

        // Re-apply plain/mixed-word resolution since the resolved skill may be
        // a _plain variant or a _word_mixed meta-skill that needs further resolution
        if (PLAIN_WORD_SKILLS.hasOwnProperty(actualSkill)) {
            actualSkill = PLAIN_WORD_SKILLS[actualSkill];
        }
        if (MIXED_WORD_SKILLS[actualSkill]) {
            actualSkill = pick(MIXED_WORD_SKILLS[actualSkill]);
        }
    }

    // Set skill label for display
    q.skillLabel = window.getSkillLabelForQuestion ? window.getSkillLabelForQuestion(actualSkill, state.category) : '';
    q.skillId = actualSkill;

    // Get the mapped category and skill
    let mappedCategory = categoryMapping[state.category] || state.category;
    const mappedSkill = skillMapping[actualSkill] || actualSkill;

    // Force all_mixed for domain/grade level mixed skills
    if (forcedMappedCategory) {
        mappedCategory = forcedMappedCategory;
    }

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
        'compose_whole': 'fractions',            // In composing UI category; gen code is in gen-fractions.js
        'odd_even': 'patterns',                  // In composing UI category, but gen code is in patterns handler
        'select_even_odd': 'patterns',           // MAP-style multi-select; gen code in patterns handler
        'number_word_form': 'placevalue',        // In composing UI category, but gen code is in placevalue handler
        'estimate_sum': 'estimation',            // In number_sense UI category, but gen code is in estimation handler
        'estimate_diff': 'estimation',           // In number_sense UI category, but gen code is in estimation handler
        'estimate_sums_diffs': 'estimation',     // In number_sense UI category, but gen code is in estimation handler
        'estimate_products': 'estimation',       // In number_sense UI category, but gen code is in estimation handler
        'make_a_ten': 'estimation',              // In number_sense UI category, but gen code is in estimation handler
        'doubles_near_doubles': 'estimation',    // In number_sense UI category, but gen code is in estimation handler
        'compensation': 'estimation',            // In number_sense UI category, but gen code is in estimation handler
        // Phase 5 batch 1: addition/subtraction-with-pictures live in gen-counting.js
        'add_5_pictures': 'counting_cardinality',
        'sub_5_pictures': 'counting_cardinality',
        // Phase 5 batch 3: perimeter_intro lives in gen-measurement.js despite area_perimeter UI category
        'perimeter_intro': 'measurement',
        // Ordering skills: gen code is in placevalue handler (gen-algebraic.js)
        'order_least_to_greatest': 'placevalue',
        'order_greatest_to_least': 'placevalue',
        'order_negatives': 'placevalue',
        // Grid-fill counting/sequencing skills — gen code is in patterns handler (gen-algebraic.js)
        'number_seq_fill': 'patterns',
        // Build-expression (drag tiles): addsub variant lives in gen-operations.js
        // (multdiv variant lives in gen-algebraic.js algebra branch — no override needed).
        'build_expr_addsub': 'operations',
    };
    if (!forcedMappedCategory && skillCategoryOverride[mappedSkill]) {
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
            // Build categorySkillMap DYNAMICALLY from SKILLS structure
            const categorySkillMap = {};
            for (const [catId, catSkills] of Object.entries(SKILLS)) {
                if (!Array.isArray(catSkills)) continue;
                const playable = getSkillsForCategory(catId);
                if (playable.length > 0) {
                    categorySkillMap[catId] = playable;
                }
            }

            // Build domain→categories mapping DYNAMICALLY from DOMAINS
            const domainCategories = {};
            for (const [domainId, domain] of Object.entries(DOMAINS)) {
                const cats = domain.categories
                    .filter(c => !c.id.endsWith('_mixed') && c.id !== 'all_mixed')
                    .map(c => c.id)
                    .filter(c => categorySkillMap[c]);
                domainCategories[`domain_mixed_${domainId}`] = cats;
                // Also map the _mixed category itself (e.g. number_ops_mixed)
                const mixedCat = domain.categories.find(c => c.id.endsWith('_mixed'));
                if (mixedCat) domainCategories[mixedCat.id] = cats;
            }

            const originalCategory = state.category;
            const originalSkill = state.skill;
            let categoriesToUse = Object.keys(categorySkillMap);

            // Determine scope based on what kind of mixed skill this is
            if (originalSkill && originalSkill.startsWith('grade_') && originalSkill.endsWith('_mixed')) {
                // Grade-level mixed: get all skills for that grade
                const gradeStr = originalSkill.replace('grade_', '').replace('_mixed', '');
                const grade = gradeStr === 'k' ? 'K' : parseInt(gradeStr);
                const gradeSkills = getSkillsForGrade(grade);
                if (gradeSkills.length > 0) {
                    // Build per-category lists for this grade
                    const gradeCatMap = {};
                    for (const { skillId, categoryId } of gradeSkills) {
                        if (!gradeCatMap[categoryId]) gradeCatMap[categoryId] = [];
                        gradeCatMap[categoryId].push(skillId);
                    }
                    // Override categorySkillMap with grade-specific skills
                    for (const cat of Object.keys(categorySkillMap)) {
                        delete categorySkillMap[cat];
                    }
                    Object.assign(categorySkillMap, gradeCatMap);
                    categoriesToUse = Object.keys(gradeCatMap);
                }
            } else if (originalSkill && (originalSkill.endsWith('_all') || originalSkill === 'all_domains_mixed' || originalSkill === 'counting_all')) {
                // _all skill: use getMixedSkillScope to find categories
                const scope = getMixedSkillScope(originalSkill);
                if (scope && scope.length > 0) {
                    categoriesToUse = scope.filter(c => categorySkillMap[c]);
                }
            } else if (originalCategory && (originalCategory.startsWith('domain_mixed_') || domainCategories[originalCategory])) {
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
    // Preserve options for interactive types and non-numeric MC (operator symbols, words).
    if (q.options && q.options.length > 0) {
        const keepOptionsTypes = [
            'interactive', 'clock-choice', 'odd-even-select',
            'number-line-place', 'divisibility-sort', 'tchart-drag',
            'area-model', 'number-family', 'fact-family',
            'dual', 'dual-fraction', 'coordinate-multi',
            'multi-select-check', 'dnd-generic', 'hot-spot',
            'ten-frame', 'numpad-input', 'number-line-extended',
            'clock-set'
        ];
        // Keep MC when options are non-numeric (operator symbols, text choices)
        const hasNonNumericOptions = q.options.some(o => typeof o === 'string' && isNaN(Number(o)));
        if (!keepOptionsTypes.includes(q.answerType) && !hasNonNumericOptions) {
            q.options = [];
            // Convert MC/choice types to text input
            if (q.answerType === 'multiple-choice' || q.answerType === 'choice' || q.answerType === 'symbol') {
                q.answerType = 'text';
            }
        }
    }

    // Plain word problems: strip visuals and restore original skill on state
    if (isPlainWord && originalPlainSkill) {
        q.visual = '';
        q.printFormat = 'word-plain';
        q.skillId = originalPlainSkill;
        state.skill = originalPlainSkill;
    }

    // Auto-promote text-input fraction answers to fraction-input (stacked
    // numerator/denominator boxes). Triggers when:
    //   - answerType is "text" or unset
    //   - q.ans is a slash-form fraction string like "3/4", "-2/8", "5/12"
    //   - q.options is empty (no MC override)
    //   - the question isn't a worksheet (worksheets use their own renderer)
    // Mixed numbers ("2 3/4"), decimals, "=" / "≠" answers, and quotient-
    // remainder answers are explicitly excluded so they keep the text box.
    if ((q.answerType === 'text' || !q.answerType)
        && (!q.options || q.options.length === 0)
        && typeof q.ans === 'string'
        && /^-?\d+\/-?\d+$/.test(q.ans.trim())
        && state.gameMode !== 'worksheet'
        && state.quizMode !== true) {
        q.answerType = 'fraction-input';
    }

    // Adaptive mode: tag the question with its level for downstream UI, then
    // restore any temporarily-overridden state (range / decimals / skill swap).
    // Same carve-out as the pre-generation hook above.
    if (typeof window !== 'undefined' && _adaptiveAllowed
        && typeof window.applyAdaptiveLevelToQuestion === 'function') {
        window.applyAdaptiveLevelToQuestion(q, _adaptiveSkillId);
    }
    if (typeof _restoreAdaptive === 'function') {
        _restoreAdaptive();
    }

    return q;
}
