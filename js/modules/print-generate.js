import { state } from './state.js';
import { DOMAINS, SKILLS, isMixedMetaSkill, getSkillsForCategory, getSkillsForDomain, getSkillsForGrade, getMixedSkillScope, getCategoryForSkill, getSkillPrintSize, PRINT_FORMAT_SIZE, SKILL_FULL_LABELS } from './data.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, fracText, fractionToPercent } from './utils.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './svg-geometry.js';
import { fracHTML, fracCircleSVG, fracBarHTML } from './svg-fractions.js';
import { createAnalogClockSVG, formatTime } from './svg-clock.js';
import { getFactorPairs } from './svg-factors.js';
import { generateQuestion } from './generate-question.js';

export function generatePrintProblem() {
    // SAFETY: Track generation time to prevent freezes
    const startTime = Date.now();
    const maxTime = 500; // Max 500ms per problem
    
    // Generate a problem using current settings but return static data for printing
    const q = { text: "", ans: 0, hint: "", options: [], answerType: "number", printFormat: "horizontal", skillLabel: "" };
    const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = arr => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    };
    
    // Quick fallback problem generator
    const generateFallbackProblem = () => {
        const a = rng(1, 50);
        const b = rng(1, 50);
        q.a = a;
        q.b = b;
        q.op = "+";
        q.ans = a + b;
        q.text = `${a} + ${b} = ___`;
        q.printFormat = "column-add";
        q.skillLabel = "Add";
        return q;
    };
    
    // Safety check function
    const checkTimeout = () => {
        if (Date.now() - startTime > maxTime) {
            console.warn('Problem generation timeout, using fallback');
            return true;
        }
        return false;
    };

    // CRITICAL: Read directly from UI dropdowns since state is only set when game starts
    // This fixes the bug where print was only showing addition problems
    const categoryDropdown = document.getElementById("categorySelect");
    const skillDropdown = document.getElementById("skillSelect");
    const rangeDropdown = document.getElementById("rangeSelect");
    
    // Get values directly from dropdowns (NOT from state which may not be set yet)
    let category = categoryDropdown ? categoryDropdown.value : "operations";
    let skill = skillDropdown ? skillDropdown.value : "mixed";
    let range = rangeDropdown ? parseInt(rangeDropdown.value) : 100;
    
    // Fallback to state only if dropdowns don't exist
    if (!category) category = state.category || "operations";
    if (!skill) skill = state.skill || "add";
    if (!range || isNaN(range)) range = state.range || 100;

    const ensureTables = () => {
        if (!state.selectedNumbers || !state.selectedNumbers.length) return [1,2,3,4,5,6,7,8,9,10,11,12];
        return state.selectedNumbers;
    };

    // Helper for GCD/simplifying fractions
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const simplifyFrac = (n, d) => {
        if (!d || d === 0) return '0/1';
        const g = gcd(Math.abs(n), Math.abs(d));
        return `${n/g}/${d/g}`;
    };

    // Check if using Mixed Mode Settings from print dialog
    const useMixedSettings = document.getElementById('printSourceMixed')?.checked;
    const useCustomSettings = document.getElementById('printSourceCustom')?.checked;
    
    // Check if there are weighted items
    const weightedSkills = getWeightedSkillsForGeneration();
    const hasWeightedItems = weightedSkills && weightedSkills.length > 0;
    const totalWeightedPercent = hasWeightedItems ? weightedSkills.reduce((sum, w) => sum + (w.percent || 0), 0) : 0;
    
    // Track if weighted distribution selected a skill
    let weightedSelected = false;
    
    // Handle weighted distribution first (if there are weighted items)
    if (hasWeightedItems) {
        // If all items have 0%, distribute evenly among them
        if (totalWeightedPercent === 0) {
            // Pick randomly from all weighted items with equal probability
            const randomItem = weightedSkills[Math.floor(Math.random() * weightedSkills.length)];
            category = randomItem.category;
            skill = randomItem.skill;
            weightedSelected = true;
            if (randomItem.range) {
                range = randomItem.range;
            }
            console.log(`Even distribution selection: category=${category}, skill=${skill}`);
        } else {
            // Use percentage-based weighted selection
            const randomRoll = Math.random() * 100;
            
            let cumulativePercent = 0;
            let selectedWeighted = null;
            
            // Check if random roll falls within weighted skills
            for (const weighted of weightedSkills) {
                if (weighted.percent > 0) {
                    cumulativePercent += weighted.percent;
                    if (randomRoll < cumulativePercent) {
                        selectedWeighted = weighted;
                        break;
                    }
                }
            }
            
            if (selectedWeighted) {
                // Use the weighted skill
                category = selectedWeighted.category;
                skill = selectedWeighted.skill;
                weightedSelected = true;
                // Override range if specified (for operations)
                if (selectedWeighted.range) {
                    range = selectedWeighted.range;
                }
                console.log(`Weighted selection: category=${category}, skill=${skill}`);
            } else if (randomRoll >= totalWeightedPercent) {
                // Random roll is in the "remaining" percentage - pick from 0% items or all items
                const zeroPercentItems = weightedSkills.filter(w => !w.percent || w.percent === 0);
                if (zeroPercentItems.length > 0) {
                    const randomItem = zeroPercentItems[Math.floor(Math.random() * zeroPercentItems.length)];
                    category = randomItem.category;
                    skill = randomItem.skill;
                    weightedSelected = true;
                    if (randomItem.range) {
                        range = randomItem.range;
                    }
                    console.log(`Remaining % selection from 0% items: category=${category}, skill=${skill}`);
                }
                // If no 0% items, fall through to normal selection
            }
        }
    }
    
    // Only apply other selection methods if weighted didn't select a skill
    if (!weightedSelected) {
        if (useCustomSettings) {
            // Use custom print skills selection
            const selectedSkills = getSelectedPrintSkills();
            const availableCategories = Object.keys(selectedSkills).filter(cat =>
                selectedSkills[cat] && selectedSkills[cat].length > 0
            );
            if (availableCategories.length > 0) {
                category = pick(availableCategories);
                skill = pick(selectedSkills[category]);
            }
        } else if (useMixedSettings && state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
            // Apply mixed settings - pick random category/skill from saved mixed mode settings
            const selectedSkills = state.mixedModeSettings.selectedSkills;
            const availableCategories = Object.keys(selectedSkills).filter(cat =>
                selectedSkills[cat] && selectedSkills[cat].length > 0
            );
            if (availableCategories.length > 0) {
                category = pick(availableCategories);
                skill = pick(selectedSkills[category]);
            }
        }
    }

    // Map new categories to legacy category handling for print generation
    const printCategoryMapping = {
        'addition': 'operations', 'subtraction': 'operations', 'multiplication': 'operations',
        'division': 'operations', 'integers': 'integers', 'number_ops_mixed': 'operations',
        'counting': 'counting_cardinality', 'comparing': 'counting_cardinality', 'composing': 'counting_cardinality',
        'counting_mixed': 'counting_cardinality',
        'fractions': 'fractions', 'fraction_operations': 'fractions', 'decimals': 'decimals', 'conversions': 'conversions',
        'frac_dec_mixed': 'fractions', 'area_perimeter': 'geometry', 'angles_lines': 'geometry',
        'shapes_early': 'geometry', 'shapes_classify': 'geometry', 'coordinates': 'geometry', 'measurement': 'measurement',
        'geo_mixed': 'geometry', 'graphs': 'data_stats', 'data_analysis': 'data_stats',
        'probability': 'data_stats', 'data_mixed': 'data_stats', 'patterns': 'patterns',
        'algebra': 'algebra', 'order_of_operations': 'order_of_operations', 'placevalue': 'placevalue',
        'number_sense': 'rounding', 'number_theory': 'number_theory', 'algebra_mixed': 'algebra',
        'all_mixed': 'all_mixed',
        'domain_mixed_number_operations': 'all_mixed',
        'domain_mixed_fractions_decimals': 'all_mixed',
        'domain_mixed_geometry_measurement': 'all_mixed',
        'domain_mixed_data_statistics': 'all_mixed',
        'domain_mixed_algebraic_thinking': 'all_mixed',
        'domain_mixed_counting_cardinality': 'all_mixed'
    };

    // Handle all_mixed category and domain_mixed_* categories
    if (category === "all_mixed" || category.startsWith("domain_mixed_")) {
        // Build category lists DYNAMICALLY from DOMAINS
        const allCategories = [];
        const domainCategories = {};
        for (const [domainId, domain] of Object.entries(DOMAINS)) {
            const cats = domain.categories
                .filter(c => !c.id.endsWith('_mixed') && c.id !== 'all_mixed')
                .map(c => printCategoryMapping[c.id] || c.id);
            const uniqueCats = [...new Set(cats)];
            domainCategories[`domain_mixed_${domainId}`] = uniqueCats;
            allCategories.push(...uniqueCats);
        }
        const uniqueAllCategories = [...new Set(allCategories)];
        const safeCategories = ["operations", "fractions", "geometry", "algebra"];

        // Determine which categories to use
        let categoriesToUse = uniqueAllCategories;
        if (category.startsWith("domain_mixed_")) {
            categoriesToUse = domainCategories[category] || uniqueAllCategories;
        }

        // Check if we have mixed mode settings
        let selectedCategory = null;
        let selectedSkill = null;

        if (state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
            const selectedSkills = state.mixedModeSettings.selectedSkills;
            const availableCategories = Object.keys(selectedSkills).filter(cat =>
                selectedSkills[cat] && selectedSkills[cat].length > 0
            );
            if (availableCategories.length > 0) {
                selectedCategory = pick(availableCategories);
                if (selectedCategory && selectedSkills[selectedCategory]) {
                    selectedSkill = pick(selectedSkills[selectedCategory]);
                }
            }
        }

        // Use selected values or fallback
        if (selectedCategory) {
            category = selectedCategory;
            skill = selectedSkill || "mixed";
        } else {
            // Fallback: pick from categories to ensure problem generation
            category = pick(categoriesToUse) || pick(safeCategories) || "operations";
            skill = "mixed";
        }
    }
    
    // Build printCategoryMixedSkills DYNAMICALLY from SKILLS structure
    // Auto-updates when new skills are added to any category
    const printCategoryMixedSkills = {};
    for (const [catId, catSkills] of Object.entries(SKILLS)) {
        if (!Array.isArray(catSkills)) continue;
        const playable = getSkillsForCategory(catId);
        if (playable.length === 0) continue;
        for (const s of catSkills) {
            if (s.v.startsWith('mixed_') && s.v !== 'mixed') {
                printCategoryMixedSkills[s.v] = { category: catId, skills: playable };
            }
        }
    }
    // Special: mixed_time = only time-related skills from measurement
    printCategoryMixedSkills['mixed_time'] = {
        category: 'measurement',
        skills: getSkillsForCategory('measurement').filter(s =>
            s.startsWith('time_') || s.startsWith('elapsed_'))
    };
    // Domain-level _all skills: derive from DOMAINS
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        const mixedCat = domain.categories.find(c => c.id.endsWith('_mixed'));
        if (!mixedCat) continue;
        const mixedSkills = SKILLS[mixedCat.id];
        if (!Array.isArray(mixedSkills)) continue;
        for (const s of mixedSkills) {
            if (!s.v.endsWith('_all')) continue;
            const scope = getMixedSkillScope(s.v);
            if (scope) {
                const scopeSkills = [];
                for (const catId of scope) scopeSkills.push(...getSkillsForCategory(catId));
                if (scopeSkills.length > 0) {
                    printCategoryMixedSkills[s.v] = { category: scope[0], skills: scopeSkills };
                }
            }
        }
    }
    // all_domains_mixed and counting_all
    printCategoryMixedSkills['all_domains_mixed'] = {
        category: 'addition',
        skills: getSkillsForDomain('number_operations')
            .concat(getSkillsForDomain('counting_cardinality'))
            .concat(getSkillsForDomain('fractions_decimals'))
            .concat(getSkillsForDomain('geometry_measurement'))
            .concat(getSkillsForDomain('data_statistics'))
            .concat(getSkillsForDomain('algebraic_thinking'))
    };
    printCategoryMixedSkills['counting_all'] = {
        category: 'counting',
        skills: getSkillsForDomain('counting_cardinality')
    };
    // Grade-level mixed: derive from SKILL_GRADES
    for (const gradeKey of ['k', '1', '2', '3', '4', '5', '6']) {
        const grade = gradeKey === 'k' ? 'K' : parseInt(gradeKey);
        const gradeSkills = getSkillsForGrade(grade);
        if (gradeSkills.length > 0) {
            printCategoryMixedSkills[`grade_${gradeKey}_mixed`] = {
                category: gradeSkills[0].categoryId,
                skills: gradeSkills.map(s => s.skillId)
            };
        }
    }
    
    // Check if this is a category-specific mixed skill for print
    if (printCategoryMixedSkills[skill]) {
        const mixedConfig = printCategoryMixedSkills[skill];
        skill = pick(mixedConfig.skills);
        // Also update category to match the resolved skill so it routes to correct generator
        const resolvedCat = getCategoryForSkill(skill);
        if (resolvedCat) category = resolvedCat;
        console.log(`Print mixed skill resolved to: ${skill} (category: ${category})`);
    }
    
    const printSkillMapping = {
        'mixed_area_perimeter': 'mixed',
        'mixed_angles_lines': 'mixed', 'mixed_shapes': 'mixed', 'mixed_coordinates': 'coordinate_graph',
        'mixed_measurement': 'mixed', 'mixed_time': 'mixed', 'mixed_graphs': 'mixed', 'mixed_data_analysis': 'mixed',
        'mixed_probability': 'probability', 'mixed_patterns': 'mixed', 'mixed_algebra': 'mixed',
        'mixed_order_ops': 'mixed', 'mixed_placevalue': 'mixed', 'mixed_number_sense': 'mixed',
        'mixed_number_theory': 'mixed', 'probability_basic': 'probability', 'all_domains_mixed': 'mixed'
    };
    
    category = printCategoryMapping[category] || category;
    skill = printSkillMapping[skill] || skill;
    
    // Set skill label from SKILL_FULL_LABELS (auto-built from SKILLS in data.js)
    q.skillLabel = SKILL_FULL_LABELS[skill] || skill.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    switch (category) {
        case "operations": {
            // Facts skills - quick recall within standard ranges
            if (skill === "add_facts") {
                const a = rng(1, 99);
                const b = rng(1, 100 - a); // Ensure sum ≤ 100
                q.text = `${a} + ${b} = ?`;
                q.ans = a + b;
                q.a = a; q.b = b; q.op = '+';
                q.printFormat = Math.random() < 0.5 ? 'add-facts-horizontal' : 'add-facts-vertical';
                q.skillLabel = "Add Facts";
                break;
            }
            
            if (skill === "add_by_10s") {
                const base = rng(0, 9) * 10; // 0, 10, 20, ..., 90
                q.text = `${base} + 10 = ___`;
                q.ans = base + 10;
                q.printFormat = "horizontal";
                q.skillLabel = "Add 10s";
                break;
            }
            
            if (skill === "add_sub_10s") {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 10; // 0, 10, 20, ..., 90
                    q.text = `${base} + 10 = ___`;
                    q.ans = base + 10;
                } else {
                    const base = rng(1, 10) * 10; // 10, 20, ..., 100
                    q.text = `${base} − 10 = ___`;
                    q.ans = base - 10;
                }
                q.printFormat = "horizontal";
                q.skillLabel = "+/− 10s";
                break;
            }
            
            if (skill === "add_sub_100s") {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 100; // 0, 100, 200, ..., 900
                    q.text = `${base} + 100 = ___`;
                    q.ans = base + 100;
                } else {
                    const base = rng(1, 10) * 100; // 100, 200, ..., 1000
                    q.text = `${base} − 100 = ___`;
                    q.ans = base - 100;
                }
                q.printFormat = "horizontal";
                q.skillLabel = "+/− 100s";
                break;
            }
            
            if (skill === "sub_facts") {
                const sum = rng(10, 100);
                const b = rng(1, sum - 1);
                const a = sum - b;
                q.text = `${sum} − ${b} = ?`;
                q.ans = a;
                q.a = sum; q.b = b; q.op = '-';
                q.printFormat = Math.random() < 0.5 ? 'sub-facts-horizontal' : 'sub-facts-vertical';
                q.skillLabel = "Sub Facts";
                break;
            }
            
            if (skill === "mult_facts") {
                const a = rng(2, 12);
                const b = rng(2, 12);
                q.text = `${a} × ${b} = ?`;
                q.ans = a * b;
                q.a = a; q.b = b; q.op = '×';
                q.printFormat = Math.random() < 0.5 ? 'mult-facts-horizontal' : 'mult-facts-vertical';
                q.skillLabel = "Mult Facts";
                break;
            }
            
            if (skill === "div_facts") {
                const b = rng(2, 12);
                const ans = rng(2, 12);
                const a = b * ans;
                q.text = `${a} ÷ ${b} = ?`;
                q.ans = ans;
                q.a = a; q.b = b; q.op = '÷';
                const roll = Math.random();
                if (roll < 0.33) q.printFormat = 'div-facts-horizontal';
                else if (roll < 0.66) q.printFormat = 'div-facts-fraction';
                else q.printFormat = 'div-facts-long';
                q.skillLabel = "Div Facts";
                break;
            }
            
            // Check for new specialized skills first
            if (skill === "add_sub_fact_family") {
                const addend1 = rng(1, Math.min(range, 20));
                const addend2 = rng(1, Math.min(range, 20));
                const sum = addend1 + addend2;
                
                q.text = `Fact Family: ${addend1}, ${addend2}, ${sum}`;
                q.ans = `${sum}, ${sum}, ${addend2}, ${addend1}`;
                q.factFamilyData = {
                    numbers: [addend1, addend2, sum],
                    equations: [
                        { text: `${addend1} + ${addend2} = ___`, ans: sum },
                        { text: `${addend2} + ${addend1} = ___`, ans: sum },
                        { text: `${sum} − ${addend1} = ___`, ans: addend2 },
                        { text: `${sum} − ${addend2} = ___`, ans: addend1 }
                    ]
                };
                q.printFormat = "fact-family-add-sub";
                break;
            }
            
            if (skill === "mult_div_fact_family") {
                const factor1 = rng(2, 12);
                const factor2 = rng(2, 12);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                q.text = `Fact Family: ${factor1}, ${factor2}, ${product}`;
                q.ans = isSquare ? `${product}, ${factor2}` : `${product}, ${product}, ${factor2}, ${factor1}`;
                q.factFamilyData = {
                    numbers: [factor1, factor2, product],
                    isSquare: isSquare,
                    equations: isSquare ? [
                        { text: `${factor1} × ${factor2} = ___`, ans: product },
                        { text: `${product} ÷ ${factor1} = ___`, ans: factor2 }
                    ] : [
                        { text: `${factor1} × ${factor2} = ___`, ans: product },
                        { text: `${factor2} × ${factor1} = ___`, ans: product },
                        { text: `${product} ÷ ${factor1} = ___`, ans: factor2 },
                        { text: `${product} ÷ ${factor2} = ___`, ans: factor1 }
                    ]
                };
                q.printFormat = "fact-family-mult-div";
                break;
            }
            
            // Number Families - Addition/Subtraction (Print Generation)
            if (skill.startsWith("number_families_add")) {
                const isEasy = skill === "number_families_add";
                const isMedium = skill === "number_families_add_med";
                const isHard = skill === "number_families_add_hard";
                
                const maxNum = Math.min(range, isEasy ? 10 : isMedium ? 20 : 50);
                const addend1 = rng(1, maxNum);
                const addend2 = rng(1, maxNum);
                const sum = addend1 + addend2;
                
                const familyData = {
                    a: addend1,
                    b: addend2,
                    c: sum,
                    equations: [
                        { nums: [addend1, addend2, sum], op: '+', type: 'add' },
                        { nums: [addend2, addend1, sum], op: '+', type: 'add' },
                        { nums: [sum, addend1, addend2], op: '−', type: 'sub' },
                        { nums: [sum, addend2, addend1], op: '−', type: 'sub' }
                    ],
                    missingPositions: []
                };
                
                // Set missing positions based on difficulty
                if (isEasy) {
                    familyData.equations.forEach(() => familyData.missingPositions.push([2]));
                } else if (isMedium) {
                    familyData.missingPositions = [[0, 2], [1, 2], [1, 2], [0, 2]];
                } else {
                    familyData.equations.forEach(() => familyData.missingPositions.push([0, 1, 2]));
                }
                
                q.text = `Number Family: ${addend1}, ${addend2}, ${sum}`;
                q.ans = `${addend1}, ${addend2}, ${sum}`;
                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'add_sub',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-add-sub";
                break;
            }
            
            // Number Families - Multiplication/Division (Print Generation)
            if (skill.startsWith("number_families_mult")) {
                const isEasy = skill === "number_families_mult";
                const isMedium = skill === "number_families_mult_med";
                const isHard = skill === "number_families_mult_hard";
                
                const maxFactor = isEasy ? 5 : isMedium ? 10 : 12;
                const factor1 = rng(2, maxFactor);
                const factor2 = rng(2, maxFactor);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
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
                    ],
                    missingPositions: []
                };
                
                // Set missing positions based on difficulty
                if (isEasy) {
                    familyData.equations.forEach(() => familyData.missingPositions.push([2]));
                } else if (isMedium) {
                    if (isSquare) {
                        familyData.missingPositions = [[0, 2], [1, 2]];
                    } else {
                        familyData.missingPositions = [[0, 2], [1, 2], [1, 2], [0, 2]];
                    }
                } else {
                    familyData.equations.forEach(() => familyData.missingPositions.push([0, 1, 2]));
                }
                
                q.text = `Number Family: ${factor1}, ${factor2}, ${product}`;
                q.ans = `${factor1}, ${factor2}, ${product}`;
                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'mult_div',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-mult-div";
                break;
            }
            
            // Mixed Number Families - ALL 4 Operations (Print Generation)
            if (skill.startsWith("number_families_mixed")) {
                const isEasy = skill === "number_families_mixed";
                const isMedium = skill === "number_families_mixed_med";
                const isHard = skill === "number_families_mixed_hard";
                
                // Pick two numbers that work well for all operations
                const maxNum = isEasy ? 5 : isMedium ? 8 : 10;
                const a = rng(2, maxNum);
                const b = rng(2, maxNum);
                const sum = a + b;
                const product = a * b;
                const isSquare = a === b;
                
                // Build ALL equations - addition, subtraction, multiplication, division
                const equations = [];
                
                // Addition equations
                equations.push({ nums: [a, b, sum], op: '+', type: 'add' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, sum], op: '+', type: 'add' });
                }
                
                // Subtraction equations
                equations.push({ nums: [sum, a, b], op: '−', type: 'sub' });
                if (!isSquare) {
                    equations.push({ nums: [sum, b, a], op: '−', type: 'sub' });
                }
                
                // Multiplication equations
                equations.push({ nums: [a, b, product], op: '×', type: 'mult' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, product], op: '×', type: 'mult' });
                }
                
                // Division equations
                equations.push({ nums: [product, a, b], op: '÷', type: 'div' });
                if (!isSquare) {
                    equations.push({ nums: [product, b, a], op: '÷', type: 'div' });
                }
                
                // Set missing positions based on difficulty
                const missingPositions = [];
                if (isEasy) {
                    equations.forEach(() => missingPositions.push([2]));
                } else if (isMedium) {
                    equations.forEach((eq, idx) => {
                        if (idx % 2 === 0) {
                            missingPositions.push([0, 2]);
                        } else {
                            missingPositions.push([1, 2]);
                        }
                    });
                } else {
                    equations.forEach(() => missingPositions.push([0, 1, 2]));
                }
                
                q.text = `Number Family (All 4 Ops): Complete using ${a} and ${b}`;
                q.ans = `${a}, ${b}, ${sum}, ${product}`;
                q.numberFamilyData = {
                    a: a, b: b, sum: sum, product: product,
                    equations: equations,
                    missingPositions: missingPositions,
                    isSquare: isSquare,
                    operationType: 'all_four',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-all-four";
                break;
            }
            
            if (skill === "missing_add_sub") {
                const positions = ['first_add', 'second_add', 'sum', 'minuend', 'subtrahend', 'difference'];
                const position = pick(positions);
                
                let a, b, c;
                if (position === 'first_add') {
                    b = rng(1, Math.min(range, 50));
                    c = rng(b + 1, Math.min(range, 99));
                    a = c - b;
                    q.text = `___ + ${b} = ${c}`;
                    q.ans = a;
                } else if (position === 'second_add') {
                    a = rng(1, Math.min(range, 50));
                    c = rng(a + 1, Math.min(range, 99));
                    b = c - a;
                    q.text = `${a} + ___ = ${c}`;
                    q.ans = b;
                } else if (position === 'sum') {
                    a = rng(1, Math.min(range, 50));
                    b = rng(1, Math.min(range, 50));
                    q.text = `${a} + ${b} = ___`;
                    q.ans = a + b;
                } else if (position === 'minuend') {
                    b = rng(1, Math.min(range, 50));
                    c = rng(1, Math.min(range, 50));
                    a = b + c;
                    q.text = `___ − ${b} = ${c}`;
                    q.ans = a;
                } else if (position === 'subtrahend') {
                    a = rng(10, Math.min(range, 99));
                    c = rng(1, a - 1);
                    b = a - c;
                    q.text = `${a} − ___ = ${c}`;
                    q.ans = b;
                } else {
                    a = rng(10, Math.min(range, 99));
                    b = rng(1, a - 1);
                    q.text = `${a} − ${b} = ___`;
                    q.ans = a - b;
                }
                q.missingNumberData = { position };
                q.printFormat = "missing-number";
                break;
            }
            
            if (skill === "missing_mult_div") {
                const positions = ['first_factor', 'second_factor', 'product', 'dividend', 'divisor', 'quotient'];
                const position = pick(positions);
                
                let a, b, c;
                if (position === 'first_factor') {
                    b = rng(2, 12);
                    c = rng(2, 12) * b;
                    a = c / b;
                    q.text = `___ × ${b} = ${c}`;
                    q.ans = a;
                } else if (position === 'second_factor') {
                    a = rng(2, 12);
                    c = a * rng(2, 12);
                    b = c / a;
                    q.text = `${a} × ___ = ${c}`;
                    q.ans = b;
                } else if (position === 'product') {
                    a = rng(2, 12);
                    b = rng(2, 12);
                    q.text = `${a} × ${b} = ___`;
                    q.ans = a * b;
                } else if (position === 'dividend') {
                    b = rng(2, 12);
                    c = rng(2, 12);
                    a = b * c;
                    q.text = `___ ÷ ${b} = ${c}`;
                    q.ans = a;
                } else if (position === 'divisor') {
                    c = rng(2, 12);
                    b = rng(2, 12);
                    a = b * c;
                    q.text = `${a} ÷ ___ = ${c}`;
                    q.ans = b;
                } else {
                    b = rng(2, 12);
                    c = rng(2, 12);
                    a = b * c;
                    q.text = `${a} ÷ ${b} = ___`;
                    q.ans = c;
                }
                q.missingNumberData = { position, a, b, c };
                q.printFormat = "missing-factor";
                break;
            }
            
            // Area Model Multiplication (Print)
            if (skill === "area_model_mult") {
                // Generate appropriate numbers for area model
                const problemType = Math.random() < 0.6 ? '2digit' : '3digit';
                
                let multiplier, multiplicand, parts;
                
                if (problemType === '2digit') {
                    multiplier = rng(2, 9);
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = tens + ones;
                    parts = [
                        { value: tens },
                        { value: ones }
                    ];
                } else {
                    multiplier = rng(2, 6);
                    const hundreds = rng(1, 3) * 100;
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = hundreds + tens + ones;
                    parts = [
                        { value: hundreds },
                        { value: tens },
                        { value: ones }
                    ];
                }
                
                const product = multiplier * multiplicand;
                q.ans = product;
                q.text = `Use the area model to find ${multiplier} × ${multiplicand}`;
                q.areaModelData = { multiplier, multiplicand, parts, product };
                q.printFormat = "area-model-mult";
                break;
            }
            
            // Area Model Multiplication - Hard (2×2 and 2×3 grids) - Print
            if (skill === "area_model_mult_hard") {
                const problemType = Math.random() < 0.6 ? '2x2' : '2x3';
                
                let num1, num2, rowParts, colParts;
                
                if (problemType === '2x2') {
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = tens2 + ones2;
                    rowParts = [tens1, ones1];
                    colParts = [tens2, ones2];
                } else {
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const hundreds2 = rng(1, 3) * 100;
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = hundreds2 + tens2 + ones2;
                    rowParts = [tens1, ones1];
                    colParts = [hundreds2, tens2, ones2];
                }
                
                const product = num1 * num2;
                q.ans = product;
                q.text = `Use the area model to find ${num1} × ${num2}`;
                q.areaModelData = { 
                    num1, num2, rowParts, colParts, product,
                    isGrid: true,
                    gridType: problemType
                };
                q.printFormat = "area-model-mult-hard";
                break;
            }
            
            // Area Model Division - 2-digit by 1-digit (Print)
            if (skill === "area_model_div_2by1") {
                // Pre-defined friendly division problems for 2-digit ÷ 1-digit
                const friendlyProblems = [
                    [24, 2], [36, 2], [48, 2], [52, 2], [64, 2], [76, 2], [84, 2], [96, 2],
                    [36, 3], [39, 3], [45, 3], [48, 3], [54, 3], [57, 3], [63, 3], [69, 3], [72, 3], [75, 3], [78, 3], [81, 3], [84, 3], [93, 3], [96, 3],
                    [48, 4], [52, 4], [56, 4], [64, 4], [68, 4], [72, 4], [76, 4], [84, 4], [88, 4], [92, 4], [96, 4],
                    [55, 5], [65, 5], [75, 5], [85, 5], [95, 5], [60, 5], [70, 5], [80, 5], [90, 5],
                    [42, 6], [48, 6], [54, 6], [66, 6], [72, 6], [78, 6], [84, 6], [96, 6],
                    [42, 7], [49, 7], [56, 7], [63, 7], [77, 7], [84, 7], [91, 7], [98, 7],
                    [48, 8], [56, 8], [64, 8], [72, 8], [80, 8], [88, 8], [96, 8],
                    [45, 9], [54, 9], [63, 9], [72, 9], [81, 9], [90, 9], [99, 9]
                ];
                
                const [dividend, divisor] = pick(friendlyProblems);
                const quotient = dividend / divisor;
                
                // Split into friendly parts
                const tensBase = Math.floor(dividend / 10) * 10;
                let part1 = Math.floor(tensBase / divisor) * divisor;
                if (part1 === 0) part1 = divisor * Math.floor(dividend / divisor / 2);
                const part2 = dividend - part1;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                break;
            }
            
            // Area Model Division - 3-digit by 1-digit (Print)
            if (skill === "area_model_div_3by1") {
                // Pre-defined friendly division problems for 3-digit ÷ 1-digit
                const friendlyProblems = [
                    [124, 2, 100, 24], [136, 2, 100, 36], [148, 2, 100, 48], [162, 2, 100, 62], [174, 2, 100, 74], [186, 2, 100, 86],
                    [246, 2, 200, 46], [258, 2, 200, 58], [264, 2, 200, 64], [276, 2, 200, 76],
                    [126, 3, 90, 36], [135, 3, 90, 45], [144, 3, 90, 54], [153, 3, 120, 33], [162, 3, 120, 42], [171, 3, 150, 21],
                    [213, 3, 180, 33], [234, 3, 180, 54], [243, 3, 180, 63], [261, 3, 180, 81], [279, 3, 270, 9],
                    [124, 4, 80, 44], [136, 4, 80, 56], [148, 4, 120, 28], [156, 4, 120, 36], [168, 4, 120, 48],
                    [212, 4, 160, 52], [236, 4, 200, 36], [248, 4, 200, 48], [264, 4, 200, 64],
                    [125, 5, 100, 25], [135, 5, 100, 35], [145, 5, 100, 45], [155, 5, 100, 55], [165, 5, 150, 15],
                    [215, 5, 200, 15], [235, 5, 200, 35], [255, 5, 200, 55], [275, 5, 250, 25], [295, 5, 250, 45],
                    [126, 6, 90, 36], [138, 6, 90, 48], [156, 6, 120, 36], [174, 6, 120, 54], [186, 6, 180, 6],
                    [234, 6, 180, 54], [252, 6, 180, 72], [276, 6, 240, 36], [294, 6, 240, 54],
                    [126, 7, 70, 56], [147, 7, 70, 77], [168, 7, 140, 28], [189, 7, 140, 49], 
                    [231, 7, 210, 21], [252, 7, 210, 42], [273, 7, 210, 63], [294, 7, 280, 14],
                    [128, 8, 80, 48], [152, 8, 80, 72], [168, 8, 160, 8], [184, 8, 160, 24],
                    [232, 8, 160, 72], [248, 8, 240, 8], [264, 8, 240, 24], [296, 8, 240, 56],
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
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                break;
            }
            
            // ===== WORD PROBLEMS FOR PRINT =====
            
            // Addition Word Problems (Print)
            if (skill === "add_word_problems") {
                const items = ['apples', 'cookies', 'stars', 'books', 'pencils', 'balls', 'flowers', 'stickers'];
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason'];
                const item = pick(items);
                const name1 = pick(names);
                let name2 = pick(names);
                while (name2 === name1) name2 = pick(names);
                
                const a = rng(5, Math.min(range, 50));
                const b = rng(5, Math.min(range, 50));
                const answer = a + b;
                
                const templates = [
                    `${name1} has ${a} ${item}. ${name2} gives ${name1} ${b} more. How many ${item} does ${name1} have now?`,
                    `There are ${a} ${item} in a basket. ${name1} adds ${b} more. How many ${item} are there in all?`,
                    `${name1} picks ${a} ${item}. Then picks ${b} more. How many ${item} did ${name1} pick altogether?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.printFormat = "word-problem";
                break;
            }
            
            // Subtraction Word Problems (Print)
            if (skill === "sub_word_problems") {
                const items = ['apples', 'cookies', 'balloons', 'books', 'stickers', 'flowers', 'balls'];
                const verbs = ['ate', 'gave away', 'lost', 'used', 'returned'];
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const item = pick(items);
                const verb = pick(verbs);
                const name1 = pick(names);
                
                const total = rng(15, Math.min(range, 50));
                const taken = rng(3, total - 2);
                const answer = total - taken;
                
                const templates = [
                    `${name1} has ${total} ${item}. ${name1} ${verb} ${taken} of them. How many ${item} does ${name1} have left?`,
                    `There were ${total} ${item}. ${taken} were ${verb}. How many are left?`,
                    `${name1} started with ${total} ${item} and ${verb} ${taken}. How many remain?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.printFormat = "word-problem";
                break;
            }
            
            // Multiplication Word Problems (Print)
            if (skill === "mult_word_problems") {
                const items = ['apples', 'cookies', 'stickers', 'flowers', 'books', 'balloons'];
                const containers = ['basket', 'box', 'sheet', 'vase', 'shelf', 'bunch'];
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const idx = rng(0, items.length - 1);
                const item = items[idx];
                const container = containers[idx];
                const name1 = pick(names);
                
                const groups = rng(2, 8);
                const perGroup = rng(2, 9);
                const answer = groups * perGroup;
                
                const templates = [
                    `${name1} has ${groups} ${container}s. Each ${container} has ${perGroup} ${item}. How many ${item} does ${name1} have in all?`,
                    `There are ${groups} ${container}s with ${perGroup} ${item} in each. How many ${item} are there altogether?`,
                    `${name1} bought ${groups} ${container}s of ${item}. Each has ${perGroup}. What is the total?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.printFormat = "word-problem";
                break;
            }
            
            // Division Word Problems (Print)
            if (skill === "div_word_problems") {
                const items = ['apples', 'cookies', 'stickers', 'flowers', 'books', 'balloons'];
                const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                const item = pick(items);
                const name1 = pick(names);
                
                const groups = rng(2, 8);
                const perGroup = rng(2, 9);
                const total = groups * perGroup;
                const answer = perGroup;
                
                const recipients = ['friends', 'boxes', 'bags', 'plates', 'shelves'];
                const recipient = pick(recipients);
                
                const templates = [
                    `${name1} has ${total} ${item} to share equally among ${groups} ${recipient}. How many ${item} will each get?`,
                    `There are ${total} ${item}. They need to be shared equally among ${groups} ${recipient}. How many does each get?`,
                    `${name1} wants to divide ${total} ${item} into ${groups} equal groups. How many in each group?`,
                ];
                
                q.text = pick(templates);
                q.ans = answer;
                q.printFormat = "word-problem";
                break;
            }
            
            // Regular operations
            let ops = [];
            // Match skill values from SKILLS constant
            if (skill === "mixed") ops = ["+", "-", "×", "÷"];
            else if (skill === "mixed_add_sub") ops = ["+", "-"];
            else if (skill === "mixed_mult_div") ops = ["×", "÷"];
            else if (skill === "add" || skill === "addition") ops = ["+"];
            else if (skill === "subtract" || skill === "subtraction") ops = ["-"];
            else if (skill === "multiply" || skill === "multiplication") ops = ["×"];
            else if (skill === "divide" || skill === "division") ops = ["÷"];
            else ops = ["+", "-", "×", "÷"]; // Default to all ops if skill not recognized
            
            const op = pick(ops);
            let a = rng(1, Math.min(range, 100));
            let b = rng(1, Math.min(range, 100));

            if (op === "+") {
                if (range >= 100) {
                    a = rng(10, Math.min(range, 999));
                    b = rng(10, Math.min(range, 999));
                    q.printFormat = "column-add";
                }
                q.ans = a + b;
                q.a = a;
                q.b = b;
                q.op = "+";
                q.text = `${a.toLocaleString()} + ${b.toLocaleString()} = ___`;
            } else if (op === "-") {
                if (a < b) [a, b] = [b, a];
                if (range >= 100) {
                    a = rng(50, Math.min(range, 999));
                    b = rng(1, a - 1);
                    q.printFormat = "column-sub";
                }
                q.ans = a - b;
                q.a = a;
                q.b = b;
                q.op = "−";
                q.text = `${a.toLocaleString()} − ${b.toLocaleString()} = ___`;
            } else if (op === "×") {
                const useFullTables = [10, 20, 50, 100].includes(range);
                if (useFullTables) {
                    a = pick(ensureTables());
                    b = rng(1, 12);
                    q.printFormat = "horizontal";
                } else {
                    a = rng(11, 99);
                    b = rng(2, 9);
                    q.printFormat = "column-mult";
                }
                q.ans = a * b;
                q.a = Math.max(a, b);
                q.b = Math.min(a, b);
                q.op = "×";
                q.text = `${q.a} × ${q.b} = ___`;
            } else if (op === "÷") {
                const divisor = pick(ensureTables());
                const result = rng(1, 12);
                a = divisor * result;
                b = divisor;
                q.ans = result;
                q.a = a;
                q.b = b;
                q.op = "÷";
                
                // Division notation variety (Feature 2)
                const notation = pick(['symbol', 'fraction', 'bracket']);
                q.divisionNotation = notation;
                if (notation === 'symbol') {
                    q.text = `${a} ÷ ${b} = ___`;
                } else if (notation === 'fraction') {
                    q.text = `${a}/${b} = ___`;
                } else {
                    q.text = `${b})${a} = ___`;
                }
                q.printFormat = "division-variety";
            }
            break;
        }

        case "order_of_operations": {
            // Progressive skill levels for PEMDAS (print version)
            let ooSkill = skill;
            if (ooSkill === "mixed" || !ooSkill) {
                ooSkill = pick(["two_ops_no_paren", "three_ops_no_paren", "paren_simple", "paren_multi", "exponents_simple", "exponents_mixed", "full_pemdas"]);
            }

            // Helper to generate safe numbers
            const safeNum = (min, max) => rng(min, max);

            let expression = "";
            let answer = 0;

            if (ooSkill === "two_ops_no_paren") {
                const pattern = pick(["a+b*c", "a-b*c", "a*b+c", "a*b-c", "a+b/c", "a-b/c"]);
                
                if (pattern === "a+b*c") {
                    const a = safeNum(1, 20);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} + ${b} × ${c}`;
                    answer = a + (b * c);
                } else if (pattern === "a-b*c") {
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const a = safeNum(b * c + 1, b * c + 20);
                    expression = `${a} - ${b} × ${c}`;
                    answer = a - (b * c);
                } else if (pattern === "a*b+c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, 20);
                    expression = `${a} × ${b} + ${c}`;
                    answer = (a * b) + c;
                } else if (pattern === "a*b-c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(1, Math.min(a * b - 1, 15));
                    expression = `${a} × ${b} - ${c}`;
                    answer = (a * b) - c;
                } else if (pattern === "a+b/c") {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10);
                    const a = safeNum(1, 20);
                    expression = `${a} + ${b} ÷ ${c}`;
                    answer = a + (b / c);
                } else {
                    const c = safeNum(2, 10);
                    const b = c * safeNum(2, 10);
                    const a = safeNum(b / c + 1, 30);
                    expression = `${a} - ${b} ÷ ${c}`;
                    answer = a - (b / c);
                }
            } else if (ooSkill === "three_ops_no_paren") {
                const pattern = pick(["a+b*c-d", "a*b+c*d", "a+b+c*d", "a*b-c+d"]);
                
                if (pattern === "a+b*c-d") {
                    const a = safeNum(5, 20);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 5);
                    const d = safeNum(1, Math.min(a + b * c - 1, 10));
                    expression = `${a} + ${b} × ${c} - ${d}`;
                    answer = a + (b * c) - d;
                } else if (pattern === "a*b+c*d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 6);
                    expression = `${a} × ${b} + ${c} × ${d}`;
                    answer = (a * b) + (c * d);
                } else if (pattern === "a+b+c*d") {
                    const a = safeNum(5, 15);
                    const b = safeNum(5, 15);
                    const c = safeNum(2, 8);
                    const d = safeNum(2, 5);
                    expression = `${a} + ${b} + ${c} × ${d}`;
                    answer = a + b + (c * d);
                } else {
                    const a = safeNum(3, 10);
                    const b = safeNum(2, 8);
                    const c = safeNum(1, Math.min(a * b - 2, 15));
                    const d = safeNum(1, 10);
                    expression = `${a} × ${b} - ${c} + ${d}`;
                    answer = (a * b) - c + d;
                }
            } else if (ooSkill === "paren_simple") {
                const pattern = pick(["(a+b)*c", "(a-b)*c", "a*(b+c)", "a*(b-c)", "(a+b)/c"]);
                
                if (pattern === "(a+b)*c") {
                    const a = safeNum(2, 10);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 8);
                    expression = `(${a} + ${b}) × ${c}`;
                    answer = (a + b) * c;
                } else if (pattern === "(a-b)*c") {
                    const b = safeNum(2, 8);
                    const a = safeNum(b + 2, 15);
                    const c = safeNum(2, 8);
                    expression = `(${a} - ${b}) × ${c}`;
                    answer = (a - b) * c;
                } else if (pattern === "a*(b+c)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 10);
                    const c = safeNum(2, 10);
                    expression = `${a} × (${b} + ${c})`;
                    answer = a * (b + c);
                } else if (pattern === "a*(b-c)") {
                    const a = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const b = safeNum(c + 2, 15);
                    expression = `${a} × (${b} - ${c})`;
                    answer = a * (b - c);
                } else {
                    const c = safeNum(2, 8);
                    const sum = c * safeNum(2, 10);
                    const a = safeNum(1, sum - 1);
                    const b = sum - a;
                    expression = `(${a} + ${b}) ÷ ${c}`;
                    answer = (a + b) / c;
                }
            } else if (ooSkill === "paren_multi") {
                const pattern = pick(["(a+b)*c+d", "(a+b)*(c+d)", "a*(b+c)-d", "(a-b)*c+d"]);
                
                if (pattern === "(a+b)*c+d") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} + ${b}) × ${c} + ${d}`;
                    answer = (a + b) * c + d;
                } else if (pattern === "(a+b)*(c+d)") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 6);
                    expression = `(${a} + ${b}) × (${c} + ${d})`;
                    answer = (a + b) * (c + d);
                } else if (pattern === "a*(b+c)-d") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    const c = safeNum(2, 8);
                    const d = safeNum(1, Math.min(a * (b + c) - 1, 15));
                    expression = `${a} × (${b} + ${c}) - ${d}`;
                    answer = a * (b + c) - d;
                } else {
                    const b = safeNum(2, 6);
                    const a = safeNum(b + 2, 12);
                    const c = safeNum(2, 6);
                    const d = safeNum(1, 15);
                    expression = `(${a} - ${b}) × ${c} + ${d}`;
                    answer = (a - b) * c + d;
                }
            } else if (ooSkill === "exponents_simple") {
                const pattern = pick(["a^2", "a^2+b", "a^2-b", "a^3"]);
                
                if (pattern === "a^2") {
                    const a = safeNum(2, 12);
                    expression = `${a}²`;
                    answer = a * a;
                } else if (pattern === "a^2+b") {
                    const a = safeNum(2, 10);
                    const b = safeNum(1, 20);
                    expression = `${a}² + ${b}`;
                    answer = (a * a) + b;
                } else if (pattern === "a^2-b") {
                    const a = safeNum(3, 10);
                    const b = safeNum(1, Math.min(a * a - 1, 15));
                    expression = `${a}² - ${b}`;
                    answer = (a * a) - b;
                } else {
                    const a = safeNum(2, 5);
                    expression = `${a}³`;
                    answer = a * a * a;
                }
            } else if (ooSkill === "exponents_mixed") {
                const pattern = pick(["a^2+b*c", "a*b^2", "(a+b)^2", "a^2-b^2"]);
                
                if (pattern === "a^2+b*c") {
                    const a = safeNum(2, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    expression = `${a}² + ${b} × ${c}`;
                    answer = (a * a) + (b * c);
                } else if (pattern === "a*b^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 8);
                    expression = `${a} × ${b}²`;
                    answer = a * (b * b);
                } else if (pattern === "(a+b)^2") {
                    const a = safeNum(2, 6);
                    const b = safeNum(2, 6);
                    expression = `(${a} + ${b})²`;
                    answer = (a + b) * (a + b);
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, a - 1);
                    expression = `${a}² - ${b}²`;
                    answer = (a * a) - (b * b);
                }
            } else {
                // Full PEMDAS
                const pattern = pick(["(a+b)^2-c*d", "a^2+(b+c)*d", "a^2+b^2-c"]);
                
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
                    } else {
                        expression = `(${a} + ${b})² + ${c} × ${d}`;
                        answer = squared + product;
                    }
                } else if (pattern === "a^2+(b+c)*d") {
                    const a = safeNum(3, 8);
                    const b = safeNum(2, 6);
                    const c = safeNum(2, 6);
                    const d = safeNum(2, 5);
                    expression = `${a}² + (${b} + ${c}) × ${d}`;
                    answer = (a * a) + (b + c) * d;
                } else {
                    const a = safeNum(4, 10);
                    const b = safeNum(2, 6);
                    const c = safeNum(1, 15);
                    expression = `${a}² + ${b}² - ${c}`;
                    answer = (a * a) + (b * b) - c;
                }
            }

            q.text = `${expression} = ___`;
            q.ans = answer;
            q.printFormat = "order-of-ops";
            q.expression = expression;
            break;
        }

        case "patterns": {
            // Determine pattern skill
            let patternSkill = skill;
            if (skill === "mixed" || !skill) {
                patternSkill = pick(["seq_2", "seq_5", "seq_10", "seq_100", "plus_minus_10", "plus_minus_100", "random_step", "next_three", "function_table_easy", "function_table_hard", "double", "halve"]);
            }

            const start = rng(1, Math.min(range, 50));
            
            // Helper to pick 2-3 unique missing indices from a range
            const pickMissingIndices = (maxIdx) => {
                const numMissing = rng(2, 3);
                const indices = [];
                const available = [];
                for (let i = 1; i < maxIdx; i++) available.push(i); // Skip first element
                while (indices.length < numMissing && available.length > 0) {
                    const randIdx = Math.floor(Math.random() * available.length);
                    indices.push(available[randIdx]);
                    available.splice(randIdx, 1);
                }
                return indices.sort((a, b) => a - b);
            };

            if (patternSkill === "seq_2") {
                const seq = [start, start + 2, start + 4, start + 6, start + 8, start + 10, start + 12];
                const missingIndices = pickMissingIndices(7);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `Skip count by 2: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step: 2 };
            } else if (patternSkill === "seq_5") {
                const base = rng(1, 20) * 5;
                const seq = [base, base + 5, base + 10, base + 15, base + 20, base + 25, base + 30];
                const missingIndices = pickMissingIndices(7);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `Skip count by 5: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step: 5 };
            } else if (patternSkill === "seq_10") {
                const base = rng(1, 10) * 10;
                const seq = [base, base + 10, base + 20, base + 30, base + 40, base + 50, base + 60];
                const missingIndices = pickMissingIndices(7);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `Skip count by 10: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step: 10 };
            } else if (patternSkill === "seq_100") {
                const base = rng(1, 5) * 100;
                const seq = [base, base + 100, base + 200, base + 300, base + 400, base + 500, base + 600];
                const missingIndices = pickMissingIndices(7);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `Skip count by 100: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step: 100 };
            } else if (patternSkill === "plus_minus_10" || patternSkill === "plus_minus_100") {
                const step = patternSkill === "plus_minus_10" ? 10 : 100;
                const direction = Math.random() > 0.5 ? 1 : -1;
                const baseStart = step === 10 ? rng(20, 80) : rng(200, 800);
                const seq = [];
                for (let i = 0; i < 7; i++) {
                    seq.push(baseStart + (direction * step * i));
                }
                const missingIndices = pickMissingIndices(7);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `${direction > 0 ? '+' : '−'} ${step} pattern: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step: step * direction };
            } else if (patternSkill === "next_three") {
                const step = rng(2, 10) * (Math.random() > 0.5 ? 1 : -1);
                const seq = [start, start + step, start + step * 2];
                const next1 = start + step * 3;
                const next2 = start + step * 4;
                const next3 = start + step * 5;
                q.ans = `${next1}, ${next2}, ${next3}`;
                q.answerType = "text";
                q.text = `What are the next 3 numbers? ${seq.join(", ")}, ___, ___, ___`;
            } else if (patternSkill === "function_table_easy" || patternSkill === "function_table_hard") {
                const rule = pick(["+5", "+10", "+15", "+20", "×2", "×3", "×4", "-5", "-10"]);
                
                // Generate 6 unique input values
                const inputs = [];
                const usedInputs = new Set();
                while (inputs.length < 6) {
                    let val;
                    if (inputs.length < 2) val = rng(1, 15);
                    else if (inputs.length < 4) val = rng(16, 35);
                    else val = rng(36, 60);
                    if (!usedInputs.has(val)) {
                        usedInputs.add(val);
                        inputs.push(val);
                    }
                }
                inputs.sort((a, b) => a - b); // Sort for cleaner presentation
                
                // Calculate outputs based on rule
                let outputs;
                if (rule === "+5") outputs = inputs.map(x => x + 5);
                else if (rule === "+10") outputs = inputs.map(x => x + 10);
                else if (rule === "+15") outputs = inputs.map(x => x + 15);
                else if (rule === "+20") outputs = inputs.map(x => x + 20);
                else if (rule === "×2") outputs = inputs.map(x => x * 2);
                else if (rule === "×3") outputs = inputs.map(x => x * 3);
                else if (rule === "×4") outputs = inputs.map(x => x * 4);
                else if (rule === "-5") outputs = inputs.map(x => x - 5);
                else outputs = inputs.map(x => x - 10);
                
                // Easy: 1-2 missing values; Hard: 5 missing values
                const numMissing = patternSkill === "function_table_hard" ? 5 : rng(1, 2);
                const allIndices = [0, 1, 2, 3, 4, 5];
                const missingIndices = [];
                while (missingIndices.length < numMissing) {
                    const idx = pick(allIndices.filter(i => !missingIndices.includes(i)));
                    missingIndices.push(idx);
                }
                missingIndices.sort((a, b) => a - b);

                // Answer includes rule and missing values for answer key
                const answerValues = missingIndices.map(i => outputs[i]).join(", ");
                q.ans = `Rule: ${rule} | Values: ${answerValues}`;
                q.printFormat = patternSkill === "function_table_hard" ? "function-table-hard" : "function-table-easy";
                q.tableData = { inputs, outputs, missingIndices, rule };
                q.text = `Find the rule and complete the table.`;
            } else if (patternSkill === "double") {
                const base = rng(5, 50);
                q.ans = base * 2;
                q.text = `Double ${base} = ___`;
            } else if (patternSkill === "halve") {
                const base = rng(4, 50) * 2;
                q.ans = base / 2;
                q.text = `Half of ${base} = ___`;
            } else {
                // random_step - also with 2-3 missing
                const step = rng(2, 12);
                const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4, start + step * 5];
                const missingIndices = pickMissingIndices(6);
                const answers = missingIndices.map(i => seq[i]);
                missingIndices.forEach(i => seq[i] = "___");
                q.ans = answers.join(", ");
                q.text = `Pattern: ${seq.join(", ")}`;
                q.printFormat = "pattern-sequence";
                q.patternData = { sequence: seq, missingIndices, step };
            }
            break;
        }

        case "rounding": {
            let roundingSkill = skill;
            if (skill === "mixed" || skill === "mixed_whole" || !skill) {
                roundingSkill = pick(["nearest_10", "nearest_100", "nearest_1000"]);
            }

            // Rounding Table: generate full table for print
            if (roundingSkill === "rounding_table") {
                const cols = [];
                cols.push({ label: 'Nearest 10', place: 10 });
                if (range >= 100) cols.push({ label: 'Nearest 100', place: 100 });
                if (range >= 1000) cols.push({ label: 'Nearest 1,000', place: 1000 });
                const rowCount = rng(6, 8);
                const maxNum = Math.max(cols[cols.length - 1].place * 2, Math.min(range, 9999));
                const minNum = cols[cols.length - 1].place + 1;
                const rows = [];
                const usedNums = new Set();
                for (let i = 0; i < rowCount; i++) {
                    let num;
                    do { num = rng(minNum, maxNum); } while (usedNums.has(num));
                    usedNums.add(num);
                    const row = { number: num };
                    for (const col of cols) {
                        row[`nearest${col.place}`] = Math.round(num / col.place) * col.place;
                    }
                    rows.push(row);
                }
                q.roundingTableData = { rows, columns: cols };
                q.printFormat = 'rounding-table';
                q.text = 'Round each number to the given place value.';
                q.ans = rows.map(r => {
                    const vals = cols.map(c => r[`nearest${c.place}`].toLocaleString());
                    return `${r.number.toLocaleString()}: ${vals.join(', ')}`;
                }).join(' | ');
                q.skillLabel = 'Rounding Table';
                break;
            }

            let place = 10;
            if (roundingSkill === "nearest_10") place = 10;
            else if (roundingSkill === "nearest_100") place = 100;
            else if (roundingSkill === "nearest_1000") place = 1000;
            else if (roundingSkill === "nearest_tenth") {
                const num = (rng(10, 99) / 10).toFixed(2);
                q.ans = (Math.round(parseFloat(num) * 10) / 10).toFixed(1);
                q.text = `Round ${num} to the nearest tenth = ___`;
                break;
            } else if (roundingSkill === "nearest_hundredth") {
                const num = (rng(100, 999) / 100).toFixed(3);
                q.ans = (Math.round(parseFloat(num) * 100) / 100).toFixed(2);
                q.text = `Round ${num} to the nearest hundredth = ___`;
                break;
            }

            const max = Math.max(place * 2, Math.min(range, 10000));
            const num = rng(place, max);
            q.ans = Math.round(num / place) * place;
            q.text = `Round ${num.toLocaleString()} to the nearest ${place.toLocaleString()} = ___`;
            break;
        }

        case "placevalue": {
            let placeSkill = skill;
            if (skill === "mixed" || !skill) {
                placeSkill = pick(["identify", "expand", "order_asc", "order_desc", "compare"]);
            }

            if (placeSkill === "identify" || placeSkill === "identify_digit" || placeSkill === "value") {
                const num = rng(100, Math.min(range, 99999));
                const digits = num.toString().split('');
                const pos = rng(0, digits.length - 1);
                const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
                const placeName = placeNames[digits.length - 1 - pos];
                q.ans = parseInt(digits[pos]);
                q.text = `What digit is in the ${placeName} place of ${num.toLocaleString()}? ___`;
            } else if (placeSkill === "expand" || placeSkill === "expanded" || placeSkill === "expanded_form") {
                const num = rng(100, Math.min(range, 9999));
                const digits = num.toString().split('').map(Number);
                const places = [1, 10, 100, 1000, 10000, 100000];
                const expanded = digits.map((d, i) => d * places[digits.length - 1 - i]).filter(v => v > 0);
                q.ans = expanded.join(" + ");
                q.answerType = "text";
                q.text = `Write ${num.toLocaleString()} in expanded form: ___`;
            } else if (placeSkill === "combine") {
                // Combine parts into a number
                const num = rng(100, Math.min(range, 9999));
                const digits = num.toString().split('').map(Number);
                const places = [1, 10, 100, 1000, 10000];
                const expanded = digits.map((d, i) => d * places[digits.length - 1 - i]).filter(v => v > 0);
                q.ans = num;
                q.text = `What number equals ${expanded.join(" + ")}? ___`;
            } else if (placeSkill === "order_asc") {
                const nums = [];
                while (nums.length < 4) {
                    const n = rng(10, Math.min(range, 9999));
                    if (!nums.includes(n)) nums.push(n);
                }
                const sorted = [...nums].sort((a, b) => a - b);
                q.ans = sorted.join(" < ");
                q.answerType = "text";
                q.printFormat = "ordering";
                q.orderData = { nums, direction: "asc" };
                q.text = `Order from smallest to largest: ${nums.join(", ")} → ___`;
            } else if (placeSkill === "order_desc") {
                const nums = [];
                while (nums.length < 4) {
                    const n = rng(10, Math.min(range, 9999));
                    if (!nums.includes(n)) nums.push(n);
                }
                const sorted = [...nums].sort((a, b) => b - a);
                q.ans = sorted.join(" > ");
                q.answerType = "text";
                q.printFormat = "ordering";
                q.orderData = { nums, direction: "desc" };
                q.text = `Order from largest to smallest: ${nums.join(", ")} → ___`;
            } else if (placeSkill === "compare") {
                const a = rng(100, Math.min(range, 9999));
                let b = rng(100, Math.min(range, 9999));
                while (b === a) b = rng(100, Math.min(range, 9999));
                q.ans = a > b ? ">" : a < b ? "<" : "=";
                q.answerType = "symbol";
                q.text = `${a.toLocaleString()} ___ ${b.toLocaleString()}  (>, <, or =)`;
            } else {
                // Default identify digit
                const num = rng(100, Math.min(range, 9999));
                const digits = num.toString().split('');
                const pos = rng(0, digits.length - 1);
                const placeNames = ['ones', 'tens', 'hundreds', 'thousands'];
                const placeName = placeNames[digits.length - 1 - pos];
                q.ans = parseInt(digits[pos]);
                q.text = `What digit is in the ${placeName} place of ${num.toLocaleString()}? ___`;
            }
            break;
        }

        case "fractions": {
            let fracSkill = skill;
            if (skill === "mixed" || !skill) {
                fracSkill = pick(["identify", "equivalent", "compare", "simplify", "of_number", "improper_mixed", "add", "sub", "add_unlike", "sub_unlike"]);
            }

            const standardDenoms = [2, 3, 4, 5, 6, 8, 10];
            const denom = pick(standardDenoms);
            const num1 = rng(1, denom - 1);

            if (fracSkill === "identify") {
                // 🟢 Level 1: Identify fractions
                q.ans = `${num1}/${denom}`;
                q.answerType = "text";
                q.text = `Write the fraction: ${num1} out of ${denom} = ___`;
            } else if (fracSkill === "equivalent") {
                // 🟢 Level 1: Equivalent fractions
                const multiplier = pick([2, 3, 4]);
                const expandedNum = num1 * multiplier;
                const expandedDenom = denom * multiplier;
                if (Math.random() < 0.5) {
                    q.ans = expandedNum;
                    q.text = `Find the missing number: ${num1}/${denom} = ___/${expandedDenom}`;
                } else {
                    q.ans = expandedDenom;
                    q.text = `Find the missing number: ${num1}/${denom} = ${expandedNum}/___`;
                }
            } else if (fracSkill === "improper_mixed") {
                // 🟡 Level 2: Improper fractions and mixed numbers
                const den = pick([2, 3, 4, 5, 6, 8]);
                const wholes = rng(1, 4);
                const extraNum = rng(1, den - 1);
                const totalNum = wholes * den + extraNum;
                
                const mode = pick(["improper_to_mixed", "mixed_to_improper"]);
                
                if (mode === "improper_to_mixed") {
                    q.ans = `${wholes} ${extraNum}/${den}`;
                    q.answerType = "text";
                    q.printFormat = "improper-to-mixed";
                    q.fractionData = { totalNum, den, wholes, extraNum };
                    q.text = `Convert to mixed number: ${totalNum}/${den} = ___`;
                } else {
                    q.ans = `${totalNum}/${den}`;
                    q.answerType = "text";
                    q.printFormat = "mixed-to-improper";
                    q.fractionData = { totalNum, den, wholes, extraNum };
                    q.text = `Convert to improper fraction: ${wholes} ${extraNum}/${den} = ___`;
                }
            } else if (fracSkill === "of_number") {
                const multiple = rng(2, 10);
                const whole = multiple * denom;
                q.ans = (num1 * whole) / denom;
                q.text = `What is ${num1}/${denom} of ${whole}? ___`;
                q.printFormat = "fraction-of";
                q.fractionData = { num: num1, denom, whole };
            } else if (fracSkill === "add") {
                const num2 = rng(1, Math.max(1, denom - num1));
                q.ans = num1 + num2;
                if (q.ans >= denom) {
                    q.ans = simplifyFrac(q.ans, denom);
                    q.answerType = "text";
                }
                q.printFormat = "fraction-op";
                q.fractionData = { num1, num2, denom, op: "+" };
                q.text = `${num1}/${denom} + ${num2}/${denom} = ___`;
            } else if (fracSkill === "sub") {
                const num2 = rng(1, num1);
                q.ans = num1 - num2;
                q.printFormat = "fraction-op";
                q.fractionData = { num1, num2, denom, op: "−" };
                q.text = `${num1}/${denom} − ${num2}/${denom} = ___`;
            } else if (fracSkill === "simplify") {
                const multiplier = pick([2, 3, 4]);
                const simpleNum = rng(1, 5);
                const simpleDenom = rng(simpleNum + 1, 8);
                const rawNum = simpleNum * multiplier;
                const rawDenom = simpleDenom * multiplier;
                q.ans = simplifyFrac(rawNum, rawDenom);
                q.answerType = "text";
                q.text = `Simplify: ${rawNum}/${rawDenom} = ___`;
                q.printFormat = "fraction-simplify";
                q.fractionData = { rawNum, rawDenom };
            } else if (fracSkill === "compare") {
                const denom2 = pick(standardDenoms);
                const num2 = rng(1, denom2 - 1);
                const val1 = num1 / denom;
                const val2 = num2 / denom2;
                q.ans = val1 > val2 ? ">" : val1 < val2 ? "<" : "=";
                q.answerType = "symbol";
                q.printFormat = "fraction-compare";
                q.fractionData = { num1, denom1: denom, num2, denom2 };
                q.text = `${num1}/${denom} ___ ${num2}/${denom2}  (>, <, or =)`;
            } else if (fracSkill === "add_unlike") {
                // 🔴 Level 4: Add fractions with unlike denominators
                const denomPairs = [
                    {d1: 2, d2: 4, lcd: 4}, {d1: 2, d2: 6, lcd: 6}, {d1: 3, d2: 6, lcd: 6},
                    {d1: 4, d2: 8, lcd: 8}, {d1: 2, d2: 3, lcd: 6}, {d1: 3, d2: 4, lcd: 12}
                ];
                const pair = pick(denomPairs);
                const n1 = rng(1, pair.d1 - 1);
                const n2 = rng(1, pair.d2 - 1);
                const converted1 = n1 * (pair.lcd / pair.d1);
                const converted2 = n2 * (pair.lcd / pair.d2);
                const resultNum = converted1 + converted2;
                q.ans = simplifyFrac(resultNum, pair.lcd);
                q.answerType = "text";
                q.printFormat = "fraction-unlike-op";
                q.fractionData = { num1: n1, denom1: pair.d1, num2: n2, denom2: pair.d2, op: "+", lcd: pair.lcd };
                q.text = `${n1}/${pair.d1} + ${n2}/${pair.d2} = ___`;
            } else if (fracSkill === "sub_unlike") {
                // 🔴 Level 4: Subtract fractions with unlike denominators
                const denomPairs = [
                    {d1: 2, d2: 4, lcd: 4}, {d1: 2, d2: 6, lcd: 6}, {d1: 3, d2: 6, lcd: 6},
                    {d1: 4, d2: 8, lcd: 8}, {d1: 2, d2: 3, lcd: 6}, {d1: 3, d2: 4, lcd: 12}
                ];
                const pair = pick(denomPairs);
                let n1 = rng(1, pair.d1 - 1);
                let n2 = rng(1, pair.d2 - 1);
                let converted1 = n1 * (pair.lcd / pair.d1);
                let converted2 = n2 * (pair.lcd / pair.d2);
                // Ensure larger minus smaller
                if (converted1 < converted2) {
                    [n1, n2] = [n2, n1];
                    [converted1, converted2] = [converted2, converted1];
                }
                const resultNum = converted1 - converted2;
                q.ans = simplifyFrac(Math.abs(resultNum), pair.lcd);
                q.answerType = "text";
                q.printFormat = "fraction-unlike-op";
                q.fractionData = { num1: n1, denom1: pair.d1, num2: n2, denom2: pair.d2, op: "−", lcd: pair.lcd };
                q.text = `${n1}/${pair.d1} − ${n2}/${pair.d2} = ___`;
            } else {
                // Default: of_number
                const multiple = rng(2, 10);
                const whole = multiple * denom;
                q.ans = (num1 * whole) / denom;
                q.text = `What is ${num1}/${denom} of ${whole}? ___`;
            }
            break;
        }

        case "conversions": {
            let convSkill = skill;
            if (skill === "mixed" || !skill) {
                convSkill = pick(["f_to_d", "d_to_f", "f_to_p", "p_to_f", "length_metric", "mass_metric", "time"]);
            }

            const conversionFracs = [
                {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                {n: 1, d: 10}, {n: 3, d: 10}, {n: 7, d: 10}
            ];

            if (convSkill === "f_to_d") {
                const frac = pick(conversionFracs);
                const decimal = +(frac.n / frac.d).toFixed(2);
                q.ans = decimal;
                q.text = `Convert ${frac.n}/${frac.d} to a decimal = ___`;
                q.printFormat = "conversion";
                q.conversionData = { from: `${frac.n}/${frac.d}`, type: "f_to_d" };
            } else if (convSkill === "d_to_f") {
                const frac = pick(conversionFracs);
                const decimal = +(frac.n / frac.d).toFixed(2);
                q.ans = simplifyFrac(frac.n, frac.d);
                q.answerType = "text";
                q.text = `Convert ${decimal} to a fraction = ___`;
                q.printFormat = "conversion";
            } else if (convSkill === "f_to_p") {
                const frac = pick(conversionFracs);
                const percent = Math.round((frac.n / frac.d) * 100);
                q.ans = percent + "%";
                q.answerType = "text";
                q.text = `Convert ${frac.n}/${frac.d} to a percent = ___`;
            } else if (convSkill === "p_to_f") {
                const percents = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
                const p = pick(percents);
                q.ans = simplifyFrac(p, 100);
                q.answerType = "text";
                q.text = `Convert ${p}% to a fraction = ___`;
            } else if (convSkill === "length_metric" || convSkill === "length") {
                const type = pick(["cm_m", "m_cm", "mm_cm", "cm_mm", "m_km", "km_m"]);
                if (type === "cm_m") {
                    const cm = pick([100, 200, 250, 300, 500, 150, 450]);
                    q.ans = cm / 100;
                    q.text = `${cm} cm = ___ m`;
                } else if (type === "m_cm") {
                    const m = pick([1, 2, 3, 4, 5, 1.5, 2.5]);
                    q.ans = m * 100;
                    q.text = `${m} m = ___ cm`;
                } else if (type === "mm_cm") {
                    const mm = pick([10, 20, 30, 50, 100, 25, 45]);
                    q.ans = mm / 10;
                    q.text = `${mm} mm = ___ cm`;
                } else if (type === "cm_mm") {
                    const cm = pick([1, 2, 3, 5, 10, 1.5, 2.5]);
                    q.ans = cm * 10;
                    q.text = `${cm} cm = ___ mm`;
                } else if (type === "m_km") {
                    const m = pick([1000, 2000, 3000, 5000, 500, 1500, 2500]);
                    q.ans = m / 1000;
                    q.text = `${m.toLocaleString()} m = ___ km`;
                } else {
                    const km = pick([1, 2, 3, 5, 0.5, 1.5, 2.5]);
                    q.ans = km * 1000;
                    q.text = `${km} km = ___ m`;
                }
            } else if (convSkill === "mass_metric" || convSkill === "weight") {
                const type = pick(["g_kg", "kg_g", "mg_g", "g_mg"]);
                if (type === "g_kg") {
                    const g = pick([1000, 2000, 3000, 5000, 500, 1500, 2500]);
                    q.ans = g / 1000;
                    q.text = `${g.toLocaleString()} g = ___ kg`;
                } else if (type === "kg_g") {
                    const kg = pick([1, 2, 3, 5, 0.5, 1.5, 2.5]);
                    q.ans = kg * 1000;
                    q.text = `${kg} kg = ___ g`;
                } else if (type === "mg_g") {
                    const mg = pick([1000, 2000, 5000, 500, 250]);
                    q.ans = mg / 1000;
                    q.text = `${mg.toLocaleString()} mg = ___ g`;
                } else {
                    const g = pick([1, 2, 3, 5, 0.5, 1.5]);
                    q.ans = g * 1000;
                    q.text = `${g} g = ___ mg`;
                }
            } else if (convSkill === "time") {
                const type = pick(["min_sec", "sec_min", "hr_min", "min_hr", "day_hr", "hr_day"]);
                if (type === "min_sec") {
                    const min = pick([1, 2, 3, 5, 10, 1.5, 2.5]);
                    q.ans = min * 60;
                    q.text = `${min} minute${min !== 1 ? 's' : ''} = ___ seconds`;
                } else if (type === "sec_min") {
                    const sec = pick([60, 120, 180, 300, 90, 150, 240]);
                    q.ans = sec / 60;
                    q.text = `${sec} seconds = ___ minutes`;
                } else if (type === "hr_min") {
                    const hr = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = hr * 60;
                    q.text = `${hr} hour${hr !== 1 ? 's' : ''} = ___ minutes`;
                } else if (type === "min_hr") {
                    const min = pick([60, 120, 180, 240, 300, 30, 90, 150]);
                    q.ans = min / 60;
                    q.text = `${min} minutes = ___ hours`;
                } else if (type === "day_hr") {
                    const day = pick([1, 2, 3, 5, 7, 0.5]);
                    q.ans = day * 24;
                    q.text = `${day} day${day !== 1 ? 's' : ''} = ___ hours`;
                } else {
                    const hr = pick([24, 48, 72, 12, 36, 96]);
                    q.ans = hr / 24;
                    q.text = `${hr} hours = ___ days`;
                }
            } else {
                // Default length conversion
                const cm = rng(100, 500);
                q.ans = cm / 100;
                q.text = `${cm} cm = ___ m`;
            }
            break;
        }

        case "decimals": {
            let decSkill = skill;
            if (skill === "mixed" || !skill) {
                decSkill = pick(["add_decimal", "sub_decimal", "mult_decimal", "div_decimal", "compare_decimal", "order_decimal", "number_line_decimal"]);
            }
            
            // Helper to generate decimal numbers
            const genDecimal = (maxWhole, decPlaces) => {
                const whole = rng(0, maxWhole);
                const decimal = rng(1, Math.pow(10, decPlaces) - 1);
                return parseFloat(`${whole}.${decimal.toString().padStart(decPlaces, '0')}`);
            };
            
            if (decSkill === "add_decimal") {
                const places = pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                q.ans = parseFloat((a + b).toFixed(places));
                q.text = `${a} + ${b} = ___`;
                q.decimalData = { a, b, op: '+', places };
                q.printFormat = "decimal-column-add";
            } else if (decSkill === "sub_decimal") {
                const places = pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                if (b > a) [a, b] = [b, a];
                q.ans = parseFloat((a - b).toFixed(places));
                q.text = `${a} - ${b} = ___`;
                q.decimalData = { a, b, op: '-', places };
                q.printFormat = "decimal-column-sub";
            } else if (decSkill === "mult_decimal") {
                const places = pick([1, 2]);
                let a = genDecimal(9, places);
                let b = rng(2, 9);
                q.ans = parseFloat((a * b).toFixed(places + 1));
                q.text = `${a} × ${b} = ___`;
                q.decimalData = { a, b, op: '×', places };
                q.printFormat = "decimal-mult";
            } else if (decSkill === "div_decimal") {
                const divisor = pick([2, 4, 5, 10]);
                const quotient = genDecimal(9, 1);
                const dividend = parseFloat((quotient * divisor).toFixed(2));
                q.ans = quotient;
                q.text = `${dividend} ÷ ${divisor} = ___`;
                q.decimalData = { dividend, divisor, quotient };
                q.printFormat = "decimal-div";
            } else if (decSkill === "compare_decimal") {
                const places = pick([1, 2, 3]);
                let a = genDecimal(9, places);
                let b = genDecimal(9, places);
                while (a === b) b = genDecimal(9, places);
                const correctSymbol = a > b ? ">" : "<";
                q.ans = correctSymbol;
                q.answerType = "choice";
                q.text = `Compare: ${a} ___ ${b}`;
                q.decimalData = { a, b, answer: correctSymbol };
                q.printFormat = "decimal-compare";
            } else if (decSkill === "order_decimal") {
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
                q.ans = answer.join(", ");
                q.answerType = "text";
                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}: ${nums.join(", ")}`;
                q.decimalData = { nums, sorted: answer, direction };
                q.printFormat = "decimal-order";
            } else if (decSkill === "number_line_decimal") {
                const wholeStart = rng(0, 5);
                const wholeEnd = wholeStart + 1;
                const targetDecimal = parseFloat((wholeStart + (rng(1, 9) / 10)).toFixed(1));
                q.ans = targetDecimal;
                q.text = `What decimal is shown on the number line? ___`;
                q.decimalData = { wholeStart, wholeEnd, target: targetDecimal };
                q.printFormat = "decimal-number-line";
            }
            break;
        }

        case "estimation": {
            let estSkill = skill;
            if (skill === "mixed" || !skill) {
                estSkill = pick(["estimate_sum", "estimate_diff", "estimate_prod", "compatible_numbers", "frontend_estimation"]);
            }
            
            if (estSkill === "estimate_sum") {
                const roundTo = pick([10, 100]);
                let a = rng(roundTo === 10 ? 12 : 101, roundTo === 10 ? 98 : 999);
                let b = rng(roundTo === 10 ? 12 : 101, roundTo === 10 ? 98 : 999);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded + bRounded;
                const actual = a + b;
                q.ans = estimate;
                q.text = `Estimate: ${a} + ${b} = ___ (round to nearest ${roundTo})`;
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '+', strategy: 'rounding' };
                q.printFormat = "estimation-sum";
            } else if (estSkill === "estimate_diff") {
                const roundTo = pick([10, 100]);
                let a = rng(roundTo === 10 ? 50 : 500, roundTo === 10 ? 98 : 999);
                let b = rng(roundTo === 10 ? 12 : 101, a - 10);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const bRounded = Math.round(b / roundTo) * roundTo;
                const estimate = aRounded - bRounded;
                const actual = a - b;
                q.ans = estimate;
                q.text = `Estimate: ${a} - ${b} = ___ (round to nearest ${roundTo})`;
                q.estimationData = { a, b, aRounded, bRounded, estimate, actual, roundTo, op: '-', strategy: 'rounding' };
                q.printFormat = "estimation-diff";
            } else if (estSkill === "estimate_prod") {
                const roundTo = 10;
                let a = rng(12, 49);
                let b = rng(2, 9);
                const aRounded = Math.round(a / roundTo) * roundTo;
                const estimate = aRounded * b;
                const actual = a * b;
                q.ans = estimate;
                q.text = `Estimate: ${a} × ${b} = ___ (round to nearest ${roundTo})`;
                q.estimationData = { a, b, aRounded, bRounded: b, estimate, actual, roundTo, op: '×', strategy: 'rounding' };
                q.printFormat = "estimation-prod";
            } else if (estSkill === "compatible_numbers") {
                const divisor = pick([3, 4, 5, 6, 7, 8, 9]);
                const targetQuotient = rng(5, 15);
                const compatible = divisor * targetQuotient;
                const dividend = compatible + rng(-divisor + 1, divisor - 1);
                const estimate = targetQuotient;
                const actual = Math.round(dividend / divisor * 10) / 10;
                q.ans = estimate;
                q.text = `Use compatible numbers: ${dividend} ÷ ${divisor} ≈ ___`;
                q.estimationData = { dividend, divisor, compatible, estimate, actual, a: dividend, b: divisor, op: '÷', strategy: 'compatible' };
                q.printFormat = "estimation-compatible";
            } else if (estSkill === "frontend_estimation") {
                let a = rng(100, 999);
                let b = rng(100, 999);
                const op = pick(['+', '-']);
                const aFront = Math.floor(a / 100) * 100;
                const bFront = Math.floor(b / 100) * 100;
                let estimate, actual;
                if (op === '+') {
                    estimate = aFront + bFront;
                    actual = a + b;
                } else {
                    const [larger, smaller] = a > b ? [a, b] : [b, a];
                    const largerFront = Math.floor(larger / 100) * 100;
                    const smallerFront = Math.floor(smaller / 100) * 100;
                    estimate = largerFront - smallerFront;
                    actual = larger - smaller;
                    a = larger;
                    b = smaller;
                }
                q.ans = estimate;
                q.text = `Front-end estimate: ${a} ${op} ${b} ≈ ___`;
                q.estimationData = { a, b, aFront: Math.floor(a / 100) * 100, bFront: Math.floor(b / 100) * 100, estimate, actual, op, strategy: 'frontend' };
                q.printFormat = "estimation-frontend";
            }
            break;
        }

        case "integers": {
            let intSkill = skill;
            if (skill === "mixed" || !skill) {
                intSkill = pick(["number_line_int", "compare_int", "add_int", "sub_int"]);
            }
            
            if (intSkill === "number_line_int") {
                const target = rng(-10, 10);
                q.ans = target;
                q.text = `What integer is at the arrow on the number line? ___`;
                q.integerData = { target };
                q.printFormat = "integer-number-line";
            } else if (intSkill === "compare_int") {
                let a = rng(-20, 20);
                let b = rng(-20, 20);
                while (a === b) b = rng(-20, 20);
                q.ans = a > b ? ">" : "<";
                q.answerType = "choice";
                q.text = `Compare: ${a} ___ ${b}`;
                q.integerData = { a, b };
                q.printFormat = "integer-compare";
            } else if (intSkill === "add_int") {
                let a = rng(-15, 15);
                let b = rng(-15, 15);
                q.ans = a + b;
                q.text = `${a} + ${b >= 0 ? b : '(' + b + ')'} = ___`;
                q.integerData = { a, b, op: '+' };
                q.printFormat = "integer-add";
            } else if (intSkill === "sub_int") {
                let a = rng(-15, 15);
                let b = rng(-15, 15);
                q.ans = a - b;
                q.text = `${a} − ${b >= 0 ? b : '(' + b + ')'} = ___`;
                q.integerData = { a, b, op: '-' };
                q.printFormat = "integer-sub";
            }
            break;
        }

        case "algebra": {
            let algSkill = skill;
            if (skill === "mixed" || !skill) {
                algSkill = pick(["solve_unknown", "write_expression", "evaluate_expression", "inequalities"]);
            }
            
            if (algSkill === "solve_unknown") {
                const ops = ['+', '-', '×'];
                const op = pick(ops);
                let answer, known, total;
                if (op === '+') {
                    answer = rng(1, 20);
                    known = rng(1, 20);
                    total = answer + known;
                    q.text = `Solve: x + ${known} = ${total}   x = ___`;
                } else if (op === '-') {
                    answer = rng(5, 25);
                    known = rng(1, answer - 1);
                    total = answer - known;
                    q.text = `Solve: x − ${known} = ${total}   x = ___`;
                } else {
                    answer = rng(2, 12);
                    known = rng(2, 10);
                    total = answer * known;
                    q.text = `Solve: ${known}x = ${total}   x = ___`;
                }
                q.ans = answer;
                q.algebraData = { op, answer, known, total };
                q.printFormat = "algebra-solve";
            } else if (algSkill === "write_expression") {
                const templates = [
                    { words: "the sum of a number and", phrase: 'n + ' },
                    { words: "a number minus", phrase: 'n − ' },
                    { words: "the product of a number and", phrase: 'n × ' },
                ];
                const template = pick(templates);
                const num = rng(2, 15);
                q.text = `Write expression: "${template.words} ${num}" = ___`;
                q.ans = template.phrase + num;
                q.answerType = "text";
                q.algebraData = { template: template.words, num };
                q.printFormat = "algebra-write";
            } else if (algSkill === "evaluate_expression") {
                const varVal = rng(2, 10);
                const ops = ['+', '-', '×'];
                const op = pick(ops);
                const num = rng(1, 12);
                let expression, result;
                if (op === '+') { expression = `n + ${num}`; result = varVal + num; }
                else if (op === '-') { expression = `n − ${num}`; result = varVal - num; }
                else { expression = `n × ${num}`; result = varVal * num; }
                q.text = `Evaluate ${expression} when n = ${varVal}. Answer = ___`;
                q.ans = result;
                q.algebraData = { expression, varVal, result };
                q.printFormat = "algebra-evaluate";
            } else if (algSkill === "inequalities") {
                const symbols = ['>', '<', '≥', '≤'];
                const symbol = pick(symbols);
                const boundary = rng(1, 15);
                const testVal = rng(boundary - 5, boundary + 5);
                let isTrue;
                if (symbol === '>') isTrue = testVal > boundary;
                else if (symbol === '<') isTrue = testVal < boundary;
                else if (symbol === '≥') isTrue = testVal >= boundary;
                else isTrue = testVal <= boundary;
                q.text = `Is ${testVal} ${symbol} ${boundary} true or false? ___`;
                q.ans = isTrue ? "True" : "False";
                q.answerType = "choice";
                q.algebraData = { testVal, symbol, boundary, isTrue };
                q.printFormat = "algebra-inequality";
            }
            break;
        }

        case "geometry": {
            let geoSkill = skill;
            if (skill === "mixed" || !skill) {
                geoSkill = pick(["perimeter", "area", "area_perimeter", "volume", "identify_angles", "identify_lines", "symmetry", "coordinate_q1", "coordinate_all", "classify_triangles", "classify_quads", "area_word_problems", "perimeter_word_problems", "composite_shapes"]);
            }
            
            if (geoSkill === "perimeter") {
                const shapeType = pick(["rectangle", "square"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, 15);
                    const width = rng(2, Math.min(length - 1, 12));
                    q.ans = 2 * (length + width);
                    q.text = `Perimeter of rectangle: l = ${length}, w = ${width}. P = ___`;
                    q.geometryData = { shape: 'rectangle', length, width };
                } else {
                    const side = rng(3, 15);
                    q.ans = 4 * side;
                    q.text = `Perimeter of square: s = ${side}. P = ___`;
                    q.geometryData = { shape: 'square', side };
                }
                q.printFormat = "geometry-perimeter";
            } else if (geoSkill === "area") {
                const shapeType = pick(["rectangle", "square", "triangle"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, 12);
                    const width = rng(2, 10);
                    q.ans = length * width;
                    q.text = `Area of rectangle: l = ${length}, w = ${width}. A = ___`;
                    q.geometryData = { shape: 'rectangle', length, width };
                } else if (shapeType === "square") {
                    const side = rng(2, 12);
                    q.ans = side * side;
                    q.text = `Area of square: s = ${side}. A = ___`;
                    q.geometryData = { shape: 'square', side };
                } else {
                    const base = rng(4, 12);
                    const height = rng(2, 10);
                    q.ans = (base * height) / 2;
                    q.text = `Area of triangle: b = ${base}, h = ${height}. A = ___`;
                    q.geometryData = { shape: 'triangle', base, height };
                }
                q.printFormat = "geometry-area";
            } else if (geoSkill === "area_perimeter") {
                // Combined area AND perimeter
                const shapeType = pick(["rectangle", "square"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, 12);
                    const width = rng(2, Math.min(length - 1, 10));
                    const area = length * width;
                    const perimeter = 2 * (length + width);
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.text = `Rectangle: l = ${length}, w = ${width}. Find perimeter AND area.`;
                    q.geometryData = { shape: 'rectangle', length, width, area, perimeter };
                } else {
                    const side = rng(3, 12);
                    const area = side * side;
                    const perimeter = 4 * side;
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.text = `Square: s = ${side}. Find perimeter AND area.`;
                    q.geometryData = { shape: 'square', side, area, perimeter };
                }
                q.printFormat = "geometry-area-perimeter";
            } else if (geoSkill === "area_word_problems" || geoSkill === "perimeter_word_problems" || geoSkill === "area_perimeter_word") {
                // Word problems
                const isArea = geoSkill === "area_word_problems" || geoSkill === "area_perimeter_word";
                const length = rng(8, 20);
                const width = rng(5, 15);
                const contexts = ["garden", "room", "field", "pool", "floor"];
                const ctx = pick(contexts);
                
                if (isArea) {
                    const area = length * width;
                    q.ans = area;
                    q.text = `A ${ctx} is ${length} feet long and ${width} feet wide. What is the area? A = ___`;
                    q.geometryData = { length, width, area, context: ctx };
                    q.printFormat = "geometry-word-area";
                } else {
                    const perimeter = 2 * (length + width);
                    q.ans = perimeter;
                    q.text = `A ${ctx} is ${length} feet long and ${width} feet wide. What is the perimeter? P = ___`;
                    q.geometryData = { length, width, perimeter, context: ctx };
                    q.printFormat = "geometry-word-perimeter";
                }
            } else if (geoSkill === "composite_shapes") {
                // Composite shape
                const w1 = rng(4, 8), h1 = rng(5, 9), w2 = rng(2, 4);
                const area = (w1 * h1) + (w2 * (h1 - 3));
                q.ans = area;
                q.text = `Find the area of this L-shaped figure. A = ___`;
                q.geometryData = { compositeType: 'L-shape', dims: { w1, h1, w2 } };
                q.printFormat = "geometry-composite";
            } else if (geoSkill === "volume") {
                const length = rng(2, 8);
                const width = rng(2, 6);
                const height = rng(2, 6);
                q.ans = length * width * height;
                q.text = `Volume: l = ${length}, w = ${width}, h = ${height}. V = ___`;
                q.geometryData = { length, width, height };
                q.printFormat = "geometry-volume";
            } else if (geoSkill === "identify_angles") {
                const types = [{name:"acute",range:[20,80]},{name:"right",range:[90,90]},{name:"obtuse",range:[100,170]}];
                const type = pick(types);
                const angle = type.range[0] === type.range[1] ? type.range[0] : rng(type.range[0], type.range[1]);
                q.text = `What type of angle is ${angle}°? ___`;
                q.ans = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                q.answerType = "choice";
                q.geometryData = { angle, type: type.name };
                q.printFormat = "geometry-angles";
            } else if (geoSkill === "identify_lines") {
                const lineTypes = ["parallel", "perpendicular", "intersecting"];
                const lineType = pick(lineTypes);
                const lineStyles = ["lines", "rays", "segments"];
                const lineStyle = pick(lineStyles);
                const orientations = ["horizontal", "diagonal1", "diagonal2", "vertical"];
                const orientation = pick(orientations);
                const styleLabel = lineStyle === "lines" ? "lines" : lineStyle === "rays" ? "rays" : "line segments";
                q.text = `What type of ${styleLabel} are shown? ___`;
                q.ans = lineType.charAt(0).toUpperCase() + lineType.slice(1);
                q.answerType = "choice";
                q.geometryData = { lineType, lineStyle, orientation };
                q.printFormat = "geometry-lines";
            } else if (geoSkill === "symmetry") {
                const shapes = [{name:"square",lines:4},{name:"rectangle",lines:2},{name:"equilateral triangle",lines:3}];
                const shape = pick(shapes);
                q.text = `How many lines of symmetry does a ${shape.name} have? ___`;
                q.ans = shape.lines;
                q.geometryData = { shape: shape.name, lines: shape.lines };
                q.printFormat = "geometry-symmetry";
            } else if (geoSkill === "classify_triangles") {
                const types = [{name:"equilateral",desc:"3 equal sides"},{name:"isosceles",desc:"2 equal sides"},{name:"scalene",desc:"no equal sides"}];
                const type = pick(types);
                q.text = `A triangle with ${type.desc} is called ___.`;
                q.ans = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                q.answerType = "choice";
                q.geometryData = { triType: type.name };
                q.printFormat = "geometry-triangles";
            } else if (geoSkill === "classify_quads") {
                const quads = [{name:"square",desc:"4 equal sides, 4 right angles"},{name:"rectangle",desc:"4 right angles, opposite sides equal"},{name:"rhombus",desc:"4 equal sides"}];
                const quad = pick(quads);
                q.text = `A quadrilateral with ${quad.desc} is called ___.`;
                q.ans = quad.name.charAt(0).toUpperCase() + quad.name.slice(1);
                q.answerType = "choice";
                q.geometryData = { quad: quad.name };
                q.printFormat = "geometry-quads";
            } else if (geoSkill === "coordinate_q1" || geoSkill === "coordinate_all" || geoSkill === "coordinate_graph") {
                // Coordinate graphing for print
                const quadrantMode = geoSkill === "coordinate_q1" ? "quadrant1" : geoSkill === "coordinate_all" ? "all_quadrants" : pick(["quadrant1", "all_quadrants"]);
                const problemType = pick(["identify", "plot"]);
                const numPoints = rng(1, 3);
                
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
                    points.push({ x, y, label: String.fromCharCode(65 + p) });
                }
                
                if (problemType === "identify") {
                    q.text = numPoints === 1 ? `What are the coordinates of point ${points[0].label}?` : `Name the coordinates of each point.`;
                } else {
                    const coordList = points.map(p => `${p.label}(${p.x}, ${p.y})`).join(', ');
                    q.text = `Plot: ${coordList}`;
                }
                q.ans = points.map(p => `(${p.x}, ${p.y})`).join(', ');
                q.answerType = "coordinate-multi";
                q.geometryData = { points, quadrantMode, problemType };
                q.printFormat = "geometry-coordinates";
            }
            break;
        }

        case "measurement": {
            let measSkill = skill;
            
            // Map legacy skills to new skills
            if (skill === "tell_time") {
                measSkill = pick(['time_hour', 'time_half_hour', 'time_quarter', 'time_5min']);
            } else if (skill === "clock_conversion") {
                measSkill = 'time_analog_digital';
            } else if (skill === "elapsed_time") {
                measSkill = pick(['elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed']);
            }
            
            if (skill === "mixed" || !skill || skill === "mixed_measurement" || skill === "mixed_time") {
                // Dynamic time skills list - auto-updates when new time/elapsed skills are added
                const allTimeSkills = getSkillsForCategory('measurement').filter(s =>
                    s.startsWith('time_') || s.startsWith('elapsed_'));
                const allMeasSkills = getSkillsForCategory('measurement');
                if (skill === "mixed_time") {
                    measSkill = pick(allTimeSkills);
                } else {
                    measSkill = pick(allMeasSkills);
                }
            }
            
            // ===== TIME TO THE HOUR (Print) =====
            if (measSkill === "time_hour") {
                const hour = rng(1, 12);
                const minute = 0;
                const timeStr = `${hour}:00`;
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_hour' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== TIME TO HALF HOUR (Print) =====
            else if (measSkill === "time_half_hour") {
                const hour = rng(1, 12);
                const minute = pick([0, 30]);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_half_hour' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== TIME TO QUARTER HOUR (Print) =====
            else if (measSkill === "time_quarter") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45]);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_quarter' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== TIME TO 5 MINUTES (Print) =====
            else if (measSkill === "time_5min") {
                const hour = rng(1, 12);
                const minute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_5min' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== TIME TO THE MINUTE (Print) =====
            else if (measSkill === "time_1min") {
                const hour = rng(1, 12);
                const minute = rng(0, 59);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_1min' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== ANALOG TO DIGITAL (Print) =====
            else if (measSkill === "time_analog_digital") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                q.text = `Write the digital time for this clock:`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, skill: 'time_analog_digital' };
                q.printFormat = "measurement-time-clock";
            }
            
            // ===== MATCH TIME TO CLOCK (Print) =====
            else if (measSkill === "time_match_clock") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45]);
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                // Create time in words
                const hourWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
                const minWords = { 0: "o'clock", 15: 'fifteen', 30: 'thirty', 45: 'forty-five' };
                const timeWords = minute === 0 ? `${hourWords[hour]} o'clock` : `${hourWords[hour]} ${minWords[minute]}`;
                q.text = `Draw hands on the clock to show ${timeWords}:`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { hour, minute, timeStr, timeWords, skill: 'time_match_clock' };
                q.printFormat = "measurement-time-draw";
            }
            
            // ===== ELAPSED TIME - 30 MIN (Print) =====
            else if (measSkill === "elapsed_30min") {
                const startHour = rng(1, 11);
                const startMin = pick([0, 30]);
                let endHour = startHour;
                let endMin = startMin + 30;
                if (endMin >= 60) { endMin -= 60; endHour += 1; }
                const timeStr = `${endHour}:${endMin.toString().padStart(2, '0')}`;
                q.text = `It is ${startHour}:${startMin.toString().padStart(2, '0')}. What time will it be in 30 minutes?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { startHour, startMin, endHour, endMin, elapsed: 30, skill: 'elapsed_30min' };
                q.printFormat = "measurement-elapsed-clock";
            }
            
            // ===== ELAPSED TIME - HOURS (Print) =====
            else if (measSkill === "elapsed_hour") {
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                let endHour = startHour + elapsedHours;
                if (endHour > 12) endHour -= 12;
                const timeStr = `${endHour}:${startMin.toString().padStart(2, '0')}`;
                q.text = `It is ${startHour}:${startMin.toString().padStart(2, '0')}. What time will it be in ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { startHour, startMin, endHour, endMin: startMin, elapsedHours, skill: 'elapsed_hour' };
                q.printFormat = "measurement-elapsed-clock";
            }
            
            // ===== ELAPSED TIME - 15 MIN (Print) =====
            else if (measSkill === "elapsed_15min") {
                const startHour = rng(1, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedMin = pick([15, 30, 45]);
                let endHour = startHour;
                let endMin = startMin + elapsedMin;
                if (endMin >= 60) { endMin -= 60; endHour += 1; }
                if (endHour > 12) endHour -= 12;
                const timeStr = `${endHour}:${endMin.toString().padStart(2, '0')}`;
                q.text = `It is ${startHour}:${startMin.toString().padStart(2, '0')}. What time will it be in ${elapsedMin} minutes?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { startHour, startMin, endHour, endMin, elapsedMin, skill: 'elapsed_15min' };
                q.printFormat = "measurement-elapsed-clock";
            }
            
            // ===== ELAPSED TIME - MIXED (Print) =====
            else if (measSkill === "elapsed_mixed") {
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 3);
                const elapsedMin = pick([15, 30, 45]);
                let endHour = startHour + elapsedHours;
                let endMin = startMin + elapsedMin;
                if (endMin >= 60) { endMin -= 60; endHour += 1; }
                if (endHour > 12) endHour -= 12;
                const timeStr = `${endHour}:${endMin.toString().padStart(2, '0')}`;
                q.text = `It is ${startHour}:${startMin.toString().padStart(2, '0')}. What time will it be in ${elapsedHours} hr ${elapsedMin} min?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.measurementData = { startHour, startMin, endHour, endMin, elapsedHours, elapsedMin, skill: 'elapsed_mixed' };
                q.printFormat = "measurement-elapsed-clock";
            }
            
            // ===== FIND DURATION (Print) =====
            else if (measSkill === "elapsed_find_duration") {
                const startHour = rng(8, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                const elapsedMin = pick([0, 15, 30, 45]);
                let endHour = startHour + elapsedHours;
                let endMin = startMin + elapsedMin;
                if (endMin >= 60) { endMin -= 60; endHour += 1; }
                const totalMinutes = elapsedHours * 60 + elapsedMin;
                q.text = `Start: ${startHour}:${startMin.toString().padStart(2, '0')} AM, End: ${endHour > 12 ? endHour - 12 : endHour}:${endMin.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}. How many minutes elapsed?`;
                q.ans = totalMinutes;
                q.measurementData = { startHour, startMin, endHour, endMin, totalMinutes, skill: 'elapsed_find_duration' };
                q.printFormat = "measurement-elapsed-find";
            }

            // ===== ELAPSED TIME CLOCKS - VISUAL (Print) =====
            else if (measSkill === "elapsed_visual_easy" || measSkill === "elapsed_visual_medium" || measSkill === "elapsed_visual_hard") {
                let startMinOptions, elapsedOptions;
                if (measSkill === "elapsed_visual_easy") {
                    startMinOptions = [0, 30];
                    elapsedOptions = [30, 60, 90, 120, 150, 180];
                } else if (measSkill === "elapsed_visual_medium") {
                    startMinOptions = [0, 15, 30, 45];
                    elapsedOptions = [15, 30, 45, 60, 75, 90, 105, 120];
                } else {
                    startMinOptions = [];
                    for (let m = 0; m < 60; m += 5) startMinOptions.push(m);
                    elapsedOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 105, 120, 135, 150];
                }
                const startHour = rng(1, 11);
                const startMin = pick(startMinOptions);
                const elapsedTotal = pick(elapsedOptions);
                let endHour = startHour;
                let endMin = startMin + elapsedTotal;
                while (endMin >= 60) { endMin -= 60; endHour += 1; }
                if (endHour > 12) endHour -= 12;
                const eHrs = Math.floor(elapsedTotal / 60);
                const eMins = elapsedTotal % 60;
                let answerText;
                if (eHrs === 0) answerText = `${eMins} minutes`;
                else if (eMins === 0) answerText = `${eHrs} hour${eHrs > 1 ? 's' : ''}`;
                else answerText = `${eHrs} hr ${eMins} min`;
                const clockType = pick(['analog-analog', 'digital-digital', 'analog-digital', 'digital-analog']);
                q.text = `How much time has passed from the first clock to the second?`;
                q.ans = answerText;
                q.answerType = "text";
                q.measurementData = { startHour, startMin, endHour, endMin, elapsedTotal, clockType, answerText, skill: measSkill };
                q.printFormat = "measurement-elapsed-visual";
            }

            // ===== MONEY (Print) =====
            else if (measSkill === "money") {
                const cost = rng(1, 9) + rng(0, 99) / 100;
                const paid = Math.ceil(cost);
                const change = parseFloat((paid - cost).toFixed(2));
                q.ans = change;
                q.text = `Cost: $${cost.toFixed(2)}, Paid: $${paid.toFixed(2)}. Change = $___`;
                q.measurementData = { cost, paid, change };
                q.printFormat = "measurement-money";
            }
            
            // ===== CAPACITY (Print) =====
            else if (measSkill === "capacity") {
                const conversions = [{from:"mL",to:"L",factor:1000,values:[1000,2000,500]},{from:"cups",to:"pints",factor:2,values:[2,4,6]}];
                const conv = pick(conversions);
                const value = pick(conv.values);
                q.ans = value / conv.factor;
                q.text = `${value} ${conv.from} = ___ ${conv.to}`;
                q.measurementData = { from: conv.from, to: conv.to, value };
                q.printFormat = "measurement-capacity";
            }
            
            // ===== TEMPERATURE (Print) =====
            else if (measSkill === "temperature") {
                const temp = rng(-10, 40);
                const unit = pick(["°C", "°F"]);
                q.ans = temp;
                q.text = `What temperature is shown? ___ ${unit}`;
                q.measurementData = { temp, unit };
                q.printFormat = "measurement-temp";
            }
            
            break;
        }

        case "data_stats": {
            let dataSkill = skill;
            if (skill === "mixed" || !skill) {
                dataSkill = pick(["mean", "median", "mode", "range"]);
            }
            
            if (dataSkill === "mean") {
                const count = pick([4, 5]);
                const nums = Array.from({length: count}, () => rng(2, 20));
                const sum = nums.reduce((a, b) => a + b, 0);
                const mean = sum / count;
                q.ans = Number.isInteger(mean) ? mean : parseFloat(mean.toFixed(1));
                q.text = `Find the mean: ${nums.join(", ")} = ___`;
                q.dataData = { nums, sum, mean: q.ans, type: 'mean' };
                q.printFormat = "data-mean";
            } else if (dataSkill === "median") {
                const count = pick([5, 7]);
                const nums = Array.from({length: count}, () => rng(1, 20)).sort((a, b) => a - b);
                q.ans = nums[Math.floor(count / 2)];
                q.text = `Find the median: ${nums.join(", ")} = ___`;
                q.dataData = { nums, type: 'median' };
                q.printFormat = "data-median";
            } else if (dataSkill === "mode") {
                const mode = rng(1, 15);
                let nums = [mode, mode, mode];
                while (nums.length < 6) {
                    const n = rng(1, 20);
                    if (n !== mode) nums.push(n);
                }
                nums = nums.sort(() => Math.random() - 0.5);
                q.ans = mode;
                q.text = `Find the mode: ${nums.join(", ")} = ___`;
                q.dataData = { nums, mode, type: 'mode' };
                q.printFormat = "data-mode";
            } else if (dataSkill === "range") {
                const nums = Array.from({length: 5}, () => rng(1, 50)).sort((a, b) => a - b);
                q.ans = nums[nums.length - 1] - nums[0];
                q.text = `Find the range: ${nums.join(", ")} = ___`;
                q.dataData = { nums, type: 'range' };
                q.printFormat = "data-range";
            }
            break;
        }

        case "number_theory": {
            let ntSkill = skill;
            if (skill === "mixed" || !skill) {
                ntSkill = pick(["prime_composite", "factors_identify", "factor_tchart_easy", "factor_tchart_medium", "factor_tchart_hard", "factor_links_easy", "factor_links_medium", "factor_links_hard", "multiples", "gcf_easy", "gcf_hard", "lcm", "divisibility", "even_odd"]);
            }
            
            // Helper functions
            const getFactors = (n) => {
                const factors = [];
                for (let i = 1; i <= n; i++) { if (n % i === 0) factors.push(i); }
                return factors;
            };
            const getFactorPairs = (n) => {
                const pairs = [];
                for (let i = 1; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) pairs.push([i, n / i]);
                }
                return pairs;
            };
            const isPrimeNum = (n) => {
                if (n < 2) return false;
                for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) return false; }
                return true;
            };
            
            if (ntSkill === "prime_composite") {
                // Enhanced: Multiple problem types for print
                const problemType = pick(["classify_list", "compare_two", "single"]);
                
                if (problemType === "classify_list") {
                    // Sort numbers into prime or composite
                    const count = rng(6, 8);
                    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
                    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
                    const numPrimes = rng(2, Math.min(4, count - 2));
                    
                    const selectedPrimes = [];
                    const selectedComposites = [];
                    while (selectedPrimes.length < numPrimes) {
                        const p = pick(primes);
                        if (!selectedPrimes.includes(p)) selectedPrimes.push(p);
                    }
                    while (selectedComposites.length < count - numPrimes) {
                        const c = pick(composites);
                        if (!selectedComposites.includes(c)) selectedComposites.push(c);
                    }
                    
                    const allNums = [...selectedPrimes, ...selectedComposites].sort(() => Math.random() - 0.5);
                    q.text = `Sort into prime or composite: ${allNums.join(", ")}`;
                    q.ans = `Prime: ${selectedPrimes.sort((a,b)=>a-b).join(", ")} | Composite: ${selectedComposites.sort((a,b)=>a-b).join(", ")}`;
                    q.answerType = "classification";
                    q.numberTheoryData = { allNums, primes: selectedPrimes, composites: selectedComposites, type: 'prime_composite_classify' };
                    q.printFormat = "nt-prime-classify";
                } else if (problemType === "compare_two") {
                    // Compare two numbers with justification
                    const primesList = [7, 11, 13, 17, 19, 23, 29, 31, 37];
                    const compositesList = [12, 15, 18, 20, 21, 24, 25, 26, 27, 28, 30];
                    const prime = pick(primesList);
                    const composite = pick(compositesList);
                    const nums = Math.random() < 0.5 ? [prime, composite] : [composite, prime];
                    const factorPairs = getFactorPairs(composite);
                    
                    q.text = `Which is composite: ${nums[0]} or ${nums[1]}? Explain with a factor pair.`;
                    q.ans = `${composite} is composite because ${factorPairs[1][0]} × ${factorPairs[1][1]} = ${composite}`;
                    q.answerType = "justify";
                    q.numberTheoryData = { nums, prime, composite, factorPairs, type: 'prime_composite_compare' };
                    q.printFormat = "nt-prime-compare";
                } else {
                    const primesList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
                    const compositesList = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20];
                    const isPrime = Math.random() < 0.5;
                    const num = isPrime ? pick(primesList) : pick(compositesList);
                    q.text = `Is ${num} prime or composite? ___`;
                    q.ans = isPrime ? "Prime" : "Composite";
                    q.answerType = "choice";
                    q.numberTheoryData = { num, isPrime, type: 'prime_composite' };
                    q.printFormat = "nt-prime";
                }
            } else if (ntSkill === "factors_identify" || ntSkill === "factors") {
                // Identify Factors - Circle all factors (like the reference image)
                const num = pick([12, 16, 18, 20, 24, 30, 36, 40, 48]);
                const allFactors = getFactors(num);
                
                // Create sequential display list 1 to max (like reference image)
                const maxDisplay = Math.max(...allFactors, 10);
                const displayList = [];
                for (let i = 1; i <= maxDisplay; i++) {
                    displayList.push(i);
                }
                if (!displayList.includes(num)) displayList.push(num);
                displayList.sort((a, b) => a - b);
                
                q.text = `Circle ALL the factors of ${num}:`;
                q.ans = allFactors.join(", ");
                q.answerType = "multi-select";
                q.numberTheoryData = { num, factors: allFactors, displayList, type: 'factors_identify' };
                q.printFormat = "nt-factors-identify";
                
            } else if (ntSkill === "factor_tchart_easy") {
                // Factor T-Chart EASY - with factor bank only
                const num = pick([12, 16, 18, 20, 24, 30, 36]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                
                q.text = `Build a Factor T-Chart for ${num}`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.numberTheoryData = { num, factorPairs, allFactors, bankFactors: scrambledFactors, type: 'factor_tchart_easy' };
                q.printFormat = "nt-factor-tchart-easy";
                
            } else if (ntSkill === "factor_tchart_medium") {
                // Factor T-Chart MEDIUM - factor bank + 3 distractors
                const num = pick([18, 20, 24, 30, 36, 40, 48]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                // Add 3 distractor numbers
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) distractors.push(i);
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);
                
                q.text = `Build a Factor T-Chart for ${num}`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.numberTheoryData = { num, factorPairs, allFactors, distractors, bankFactors: bankWithDistractors, type: 'factor_tchart_medium' };
                q.printFormat = "nt-factor-tchart-medium";
                
            } else if (ntSkill === "factor_tchart_hard") {
                // Factor T-Chart HARD - NO factor bank
                const num = pick([24, 30, 36, 40, 42, 48, 56, 60, 72]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                q.text = `Build a Factor T-Chart for ${num}`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "t-chart";
                q.numberTheoryData = { num, factorPairs, allFactors, type: 'factor_tchart_hard' };
                q.printFormat = "nt-factor-tchart-hard";
                
            } else if (ntSkill === "factor_links_easy") {
                // Factor Links EASY - with factor bank
                const num = pick([12, 16, 18, 20, 24, 30, 36]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                
                q.text = `Complete the factor links for ${num}.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.numberTheoryData = { 
                    num, factorPairs, allFactors, bankFactors: scrambledFactors,
                    numPairs: factorPairs.length, type: 'factor_links_easy' 
                };
                q.printFormat = "factor-links-easy";
                
            } else if (ntSkill === "factor_links_medium") {
                // Factor Links MEDIUM - factor bank + 3 distractors
                const num = pick([18, 20, 24, 30, 36, 40, 48]);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                
                const distractors = [];
                for (let i = 2; i <= num; i++) {
                    if (num % i !== 0 && distractors.length < 3) distractors.push(i);
                }
                const bankWithDistractors = [...allFactors, ...distractors].sort(() => Math.random() - 0.5);
                
                q.text = `Complete the factor links for ${num}.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.numberTheoryData = { 
                    num, factorPairs, allFactors, distractors, bankFactors: bankWithDistractors,
                    numPairs: factorPairs.length, type: 'factor_links_medium' 
                };
                q.printFormat = "factor-links-medium";
                
            } else if (ntSkill === "factor_links_hard" || ntSkill === "factor_links") {
                // Factor Links HARD - NO factor bank
                const num = pick([24, 30, 36, 40, 42, 48, 56, 60, 72, 80]);
                const factorPairs = getFactorPairs(num);
                
                q.text = `Complete the factor links for ${num}.`;
                q.ans = factorPairs.map(p => `${p[0]} × ${p[1]}`).join(", ");
                q.answerType = "factor-links";
                q.numberTheoryData = { 
                    num, factorPairs,
                    numPairs: factorPairs.length, type: 'factor_links_hard' 
                };
                q.printFormat = "factor-links-hard";
                
            } else if (ntSkill === "factor_tchart_drag") {
                // Interactive Factor T-Chart for print
                const targetNums = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48, 56, 60];
                const num = pick(targetNums);
                const factorPairs = getFactorPairs(num);
                const allFactors = getFactors(num);
                const scrambledFactors = [...allFactors].sort(() => Math.random() - 0.5);
                
                q.text = `Build a factor T-chart for ${num}. Drag factors from the bank. Smaller factor on LEFT!`;
                q.ans = factorPairs.map(p => `${p[0]}×${p[1]}`).join(", ");
                q.answerType = "tchart-drag";
                q.numberTheoryData = { 
                    num, 
                    factorPairs, 
                    allFactors,
                    scrambledFactors,
                    type: 'factor_tchart_drag' 
                };
                q.printFormat = "nt-factor-tchart-drag";
            } else if (ntSkill === "multiples") {
                // Enhanced: Multiple problem types for print
                const problemType = pick(["identify_multiples", "list_multiples"]);
                
                if (problemType === "identify_multiples") {
                    // Circle all multiples from a list
                    const num = pick([3, 4, 5, 6, 7, 8, 9]);
                    const multiples = [];
                    for (let i = 1; i <= 6; i++) multiples.push(num * i);
                    const nonMultiples = [];
                    for (let i = 1; i <= 60 && nonMultiples.length < 4; i++) {
                        if (i % num !== 0 && !multiples.includes(i)) nonMultiples.push(i);
                    }
                    const displayList = [...multiples.slice(0, 5), ...nonMultiples.slice(0, 4)].sort((a, b) => a - b);
                    const correctMultiples = displayList.filter(n => n % num === 0);
                    
                    q.text = `Circle all multiples of ${num}: ${displayList.join(", ")}`;
                    q.ans = correctMultiples.join(", ");
                    q.answerType = "multi-select";
                    q.numberTheoryData = { num, displayList, correctMultiples, type: 'multiples_identify' };
                    q.printFormat = "nt-multiples-identify";
                } else {
                    const num = pick([2, 3, 4, 5, 6, 7, 8, 9]);
                    const multiples = Array.from({length: 5}, (_, i) => num * (i + 1));
                    q.ans = multiples.join(", ");
                    q.answerType = "text";
                    q.text = `First 5 multiples of ${num}: ___`;
                    q.numberTheoryData = { num, multiples, type: 'multiples' };
                    q.printFormat = "nt-multiples";
                }
            } else if (ntSkill === "gcf_easy" || ntSkill === "gcf") {
                // GCF EASY - with factor bank + distractors
                const pairs = [[12, 18], [15, 20], [16, 24], [18, 27], [20, 30], [24, 36], [12, 16], [18, 24]];
                const [a, b] = pick(pairs);
                const findGCF = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                const gcf = findGCF(a, b);
                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));
                
                // Add distractors
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
                q.text = `GCF of ${a} and ${b} = ___`;
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, bankA, bankB, commonFactors, type: 'gcf_easy' };
                q.printFormat = "nt-gcf-easy";
                
            } else if (ntSkill === "gcf_hard") {
                // GCF HARD - no factor bank
                const pairs = [[24, 36], [18, 30], [20, 35], [28, 42], [30, 45], [36, 48], [24, 40], [32, 48]];
                const [a, b] = pick(pairs);
                const findGCF = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                const gcf = findGCF(a, b);
                const factorsA = getFactors(a);
                const factorsB = getFactors(b);
                const commonFactors = factorsA.filter(f => factorsB.includes(f));
                
                q.ans = gcf;
                q.text = `GCF of ${a} and ${b} = ___`;
                q.numberTheoryData = { a, b, gcf, factorsA, factorsB, commonFactors, type: 'gcf_hard' };
                q.printFormat = "nt-gcf-hard";
                
            } else if (ntSkill === "lcm") {
                const pairs = [[3, 4], [4, 5], [3, 5], [4, 6], [6, 8], [5, 6]];
                const [a, b] = pick(pairs);
                const findGCF = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
                const lcm = (a * b) / findGCF(a, b);
                const multiplesA = Array.from({length: Math.ceil(lcm/a) + 2}, (_, i) => a * (i + 1));
                const multiplesB = Array.from({length: Math.ceil(lcm/b) + 2}, (_, i) => b * (i + 1));
                q.ans = lcm;
                q.text = `LCM of ${a} and ${b} = ___`;
                q.numberTheoryData = { a, b, lcm, multiplesA, multiplesB, type: 'lcm' };
                q.printFormat = "nt-lcm";
            } else if (ntSkill === "divisibility") {
                const divisors = [2, 3, 5, 9, 10];
                const divisor = pick(divisors);
                const isDivisible = Math.random() < 0.5;
                const num = isDivisible ? divisor * rng(10, 50) : divisor * rng(10, 50) + rng(1, divisor - 1);
                q.text = `Is ${num} divisible by ${divisor}? ___`;
                q.ans = isDivisible ? "Yes" : "No";
                q.answerType = "choice";
                q.numberTheoryData = { num, divisor, isDivisible, type: 'divisibility' };
                q.printFormat = "nt-divisibility";
            } else if (ntSkill === "even_odd") {
                const num = rng(1, 500);
                q.text = `Is ${num} even or odd? ___`;
                q.ans = num % 2 === 0 ? "Even" : "Odd";
                q.answerType = "choice";
                q.numberTheoryData = { num, isEven: num % 2 === 0, type: 'even_odd' };
                q.printFormat = "nt-even-odd";
            }
            break;
        }

        case "all_mixed": {
            // For all_mixed, pick a random SKILL with equal probability, then generate
            // Build skill lists DYNAMICALLY from SKILLS structure (auto-updates with new skills)
            const printCategorySkillMap = {};
            for (const [catId, catSkills] of Object.entries(SKILLS)) {
                if (!Array.isArray(catSkills)) continue;
                const playable = getSkillsForCategory(catId);
                if (playable.length === 0) continue;
                // Map to print category key (merges related categories like addition→operations)
                const mappedCat = printCategoryMapping[catId] || catId;
                if (mappedCat === 'all_mixed') continue; // Skip mixed-only categories
                if (!printCategorySkillMap[mappedCat]) printCategorySkillMap[mappedCat] = [];
                printCategorySkillMap[mappedCat].push(...playable);
            }

            // Build domain-specific category groups DYNAMICALLY from DOMAINS
            const printDomainCategories = {};
            for (const [domainId, domain] of Object.entries(DOMAINS)) {
                const cats = domain.categories
                    .filter(c => !c.id.endsWith('_mixed') && c.id !== 'all_mixed')
                    .map(c => printCategoryMapping[c.id] || c.id);
                printDomainCategories[`domain_mixed_${domainId}`] = [...new Set(cats)];
            }

            // Determine which categories to use
            let categoriesToUse = Object.keys(printCategorySkillMap);
            
            // FLATTEN all skills from selected categories into one list for EQUAL probability
            let allSkillsFlattened = [];
            categoriesToUse.forEach(cat => {
                if (printCategorySkillMap[cat]) {
                    allSkillsFlattened = allSkillsFlattened.concat(printCategorySkillMap[cat]);
                }
            });
            
            // Pick a random skill with EQUAL probability
            const randomSkill = pick(allSkillsFlattened);
            
            // Determine category from the skill
            let randomCategory = 'operations';
            for (const [cat, skills] of Object.entries(printCategorySkillMap)) {
                if (skills.includes(randomSkill)) {
                    randomCategory = cat;
                    break;
                }
            }
            
            // Generate problem based on the selected skill
            // Operations
            if (randomSkill === 'add' || randomSkill === 'subtract' || randomSkill === 'multiply' || randomSkill === 'divide') {
                const op = randomSkill === 'add' ? '+' : randomSkill === 'subtract' ? '-' : randomSkill === 'multiply' ? '×' : '÷';
                let a, b;
                if (op === '+' || op === '-') {
                    a = rng(10, Math.min(range, 500));
                    b = rng(10, Math.min(range, 500));
                    if (op === '-' && a < b) [a, b] = [b, a];
                    q.ans = op === '+' ? a + b : a - b;
                    q.printFormat = op === '+' ? 'column-add' : 'column-sub';
                } else if (op === '×') {
                    a = rng(10, 99);
                    b = rng(2, 12);
                    q.ans = a * b;
                    q.printFormat = 'column-mult';
                } else {
                    b = rng(2, 12);
                    q.ans = rng(2, 20);
                    a = b * q.ans;
                    q.printFormat = 'long-division';
                }
                q.a = a; q.b = b; q.op = op;
                q.text = `${a} ${op === '-' ? '−' : op} ${b} = ?`;
            }
            // FACTS skills - quick recall within standard ranges
            else if (randomSkill === 'add_facts') {
                // Addition facts within 100
                const a = rng(1, 99);
                const b = rng(1, 100 - a); // Ensure sum ≤ 100
                q.ans = a + b;
                q.text = `${a} + ${b} = ?`;
                q.a = a; q.b = b; q.op = '+';
                // Randomly choose horizontal or vertical format (50/50 mix)
                q.printFormat = Math.random() < 0.5 ? 'add-facts-horizontal' : 'add-facts-vertical';
                q.skillLabel = 'Add Facts';
            }
            else if (randomSkill === 'sub_facts') {
                // Subtraction facts within 100
                const sum = rng(10, 100);
                const b = rng(1, sum - 1);
                const a = sum - b;
                q.ans = a;
                q.text = `${sum} − ${b} = ?`;
                q.a = sum; q.b = b; q.op = '-';
                // Randomly choose horizontal or vertical format (50/50 mix)
                q.printFormat = Math.random() < 0.5 ? 'sub-facts-horizontal' : 'sub-facts-vertical';
                q.skillLabel = 'Sub Facts';
            }
            else if (randomSkill === 'mult_facts') {
                // Multiplication facts to 144 (12×12)
                const a = rng(2, 12);
                const b = rng(2, 12);
                q.ans = a * b;
                q.text = `${a} × ${b} = ?`;
                q.a = a; q.b = b; q.op = '×';
                // Randomly choose horizontal or vertical format (50/50 mix)
                q.printFormat = Math.random() < 0.5 ? 'mult-facts-horizontal' : 'mult-facts-vertical';
                q.skillLabel = 'Mult Facts';
            }
            else if (randomSkill === 'div_facts') {
                // Division facts to 144 (products up to 12×12)
                const b = rng(2, 12);
                const ans = rng(2, 12);
                const a = b * ans;
                q.ans = ans;
                q.text = `${a} ÷ ${b} = ?`;
                q.a = a; q.b = b; q.op = '÷';
                // Randomly choose between 3 formats: fraction, long division, horizontal
                const formatRoll = Math.random();
                if (formatRoll < 0.33) {
                    q.printFormat = 'div-facts-horizontal';
                } else if (formatRoll < 0.66) {
                    q.printFormat = 'div-facts-fraction';
                } else {
                    q.printFormat = 'div-facts-long';
                }
                q.skillLabel = 'Div Facts';
            }
            // Integers
            else if (randomCategory === 'integers') {
                if (randomSkill === 'number_line_int' || randomSkill === 'compare_int') {
                    const a = rng(-20, 20);
                    const b = rng(-20, 20);
                    q.text = `Compare: ${a} ___ ${b}`;
                    q.ans = a > b ? '>' : a < b ? '<' : '=';
                    q.answerType = 'text';
                } else {
                    const a = rng(-15, 15);
                    const b = rng(-15, 15);
                    if (randomSkill === 'add_int') {
                        q.ans = a + b;
                        q.text = `${a} + ${b >= 0 ? b : '(' + b + ')'} = ?`;
                    } else {
                        q.ans = a - b;
                        q.text = `${a} − ${b >= 0 ? b : '(' + b + ')'} = ?`;
                    }
                }
                q.printFormat = 'horizontal';
            }
            // Fractions
            else if (randomCategory === 'fractions') {
                const num = rng(1, 5);
                const den = rng(num + 1, 10);
                q.text = `Write the fraction: ${num} out of ${den}`;
                q.ans = `${num}/${den}`;
                q.answerType = 'text';
                q.printFormat = 'horizontal';
            }
            // Decimals
            else if (randomCategory === 'decimals') {
                const a = parseFloat((rng(10, 99) / 10).toFixed(1));
                const b = parseFloat((rng(10, 99) / 10).toFixed(1));
                const op = randomSkill.includes('add') ? '+' : randomSkill.includes('sub') ? '-' : pick(['+', '-']);
                if (op === '+') {
                    q.ans = parseFloat((a + b).toFixed(2));
                    q.text = `${a} + ${b} = ?`;
                } else {
                    const [larger, smaller] = a >= b ? [a, b] : [b, a];
                    q.ans = parseFloat((larger - smaller).toFixed(2));
                    q.text = `${larger} − ${smaller} = ?`;
                }
                q.printFormat = 'horizontal';
            }
            // Conversions
            else if (randomCategory === 'conversions') {
                const commonFracs = [
                    { frac: '1/2', dec: 0.5, pct: 50 },
                    { frac: '1/4', dec: 0.25, pct: 25 },
                    { frac: '3/4', dec: 0.75, pct: 75 }
                ];
                const item = pick(commonFracs);
                if (randomSkill === 'f_to_d') {
                    q.text = `Convert ${item.frac} to a decimal`;
                    q.ans = item.dec;
                } else if (randomSkill === 'd_to_f') {
                    q.text = `Convert ${item.dec} to a fraction`;
                    q.ans = item.frac;
                    q.answerType = 'text';
                } else if (randomSkill === 'f_to_p') {
                    q.text = `Convert ${item.frac} to a percent`;
                    q.ans = item.pct;
                } else {
                    q.text = `Convert ${item.pct}% to a fraction`;
                    q.ans = item.frac;
                    q.answerType = 'text';
                }
                q.printFormat = 'horizontal';
            }
            // Geometry
            else if (randomCategory === 'geometry') {
                const shape = pick(['square', 'rectangle']);
                if (shape === 'square') {
                    const side = rng(2, 12);
                    q.text = `Perimeter of square with side ${side}?`;
                    q.ans = side * 4;
                } else {
                    const l = rng(4, 12);
                    const w = rng(2, l - 1);
                    q.text = `Perimeter of ${l}×${w} rectangle?`;
                    q.ans = 2 * (l + w);
                }
                q.printFormat = 'horizontal';
            }
            // Measurement
            else if (randomCategory === 'measurement') {
                const convs = [
                    { q: 'How many inches in 2 feet?', a: 24 },
                    { q: 'How many cm in 1 meter?', a: 100 },
                    { q: 'How many minutes in 2 hours?', a: 120 }
                ];
                const conv = pick(convs);
                q.text = conv.q;
                q.ans = conv.a;
                q.printFormat = 'horizontal';
            }
            // Data/Stats
            else if (randomCategory === 'data_stats') {
                const data = [rng(2, 15), rng(2, 15), rng(2, 15), rng(2, 15)];
                const sum = data.reduce((a, b) => a + b, 0);
                q.text = `Mean of: ${data.join(', ')}?`;
                q.ans = sum / data.length;
                q.printFormat = 'horizontal';
            }
            // Order of Operations
            else if (randomCategory === 'order_of_operations') {
                const a = rng(2, 8), b = rng(2, 6), c = rng(1, 5);
                q.text = `${a} + ${b} × ${c} = ?`;
                q.ans = a + (b * c);
                q.expression = `${a} + ${b} × ${c}`;
                q.printFormat = 'order-of-ops';
            }
            // Patterns
            else if (randomCategory === 'patterns') {
                const start = rng(1, 10);
                const step = randomSkill === 'seq_2' ? 2 : randomSkill === 'seq_5' ? 5 : randomSkill === 'seq_10' ? 10 : rng(2, 5);
                const seq = [start, start + step, start + step * 2, '___'];
                q.text = `Continue: ${seq.join(', ')}`;
                q.ans = start + step * 3;
                q.printFormat = 'horizontal';
            }
            // Algebra
            else if (randomCategory === 'algebra') {
                const x = rng(2, 15);
                const b = rng(1, 10);
                const sum = x + b;
                q.text = `Solve: x + ${b} = ${sum}`;
                q.ans = x;
                q.printFormat = 'horizontal';
            }
            // Place Value
            else if (randomCategory === 'placevalue') {
                const num = rng(100, 9999);
                const places = ['ones', 'tens', 'hundreds', 'thousands'];
                const place = pick(places.slice(0, num.toString().length));
                const placeIdx = places.indexOf(place);
                const digit = parseInt(num.toString().split('').reverse()[placeIdx]);
                q.text = `What digit is in the ${place} place of ${num.toLocaleString()}?`;
                q.ans = digit;
                q.printFormat = 'horizontal';
            }
            // Number Theory
            else if (randomCategory === 'number_theory') {
                if (randomSkill === 'prime_composite') {
                    const num = pick([2, 3, 5, 7, 11, 13, 4, 6, 8, 9, 10, 12]);
                    const isPrime = [2, 3, 5, 7, 11, 13].includes(num);
                    q.text = `Is ${num} prime or composite?`;
                    q.ans = isPrime ? 'prime' : 'composite';
                    q.answerType = 'text';
                } else {
                    const num = rng(10, 30);
                    q.text = `List all factors of ${num}`;
                    q.ans = 'varies';
                    q.answerType = 'text';
                }
                q.printFormat = 'horizontal';
            }
            // Counting & Cardinality (K-2) — delegate to generateQuestion
            else if (randomCategory === 'counting_cardinality') {
                try {
                    const savedCat = state.category;
                    const savedSkill = state.skill;
                    state.category = 'counting_cardinality';
                    state.skill = randomSkill;
                    const screenQ = generateQuestion();
                    state.category = savedCat;
                    state.skill = savedSkill;
                    if (screenQ && screenQ.text) {
                        q.text = screenQ.text;
                        q.ans = screenQ.ans;
                        if (screenQ.visual) q.visual = screenQ.visual;
                        q.printFormat = screenQ.printFormat || 'horizontal';
                        q.skillLabel = screenQ.skillLabel || q.skillLabel;
                        q.options = screenQ.options;
                        q.answerType = screenQ.answerType;
                    }
                } catch (e) {
                    const n = rng(1, 20);
                    q.text = `What number comes after ${n}?`;
                    q.ans = n + 1;
                    q.printFormat = 'horizontal';
                }
            }
            // Estimation
            else if (randomCategory === 'estimation') {
                const num = rng(10, 99);
                q.text = `Round ${num} to the nearest 10`;
                q.ans = Math.round(num / 10) * 10;
                q.printFormat = 'horizontal';
            }
            // Default fallback
            else {
                const a = rng(10, 99);
                const b = rng(2, 20);
                q.ans = a + b;
                q.text = `${a} + ${b} = ?`;
                q.printFormat = 'horizontal';
            }
            break;
        }

        case "counting_cardinality": {
            // Delegate to screen question generator for counting/K-2 skills
            try {
                const savedCat = state.category;
                const savedSkill = state.skill;
                state.category = category;
                state.skill = skill;
                const screenQ = generateQuestion();
                state.category = savedCat;
                state.skill = savedSkill;
                if (screenQ && screenQ.text) {
                    q.text = screenQ.text;
                    q.ans = screenQ.ans;
                    if (screenQ.visual) q.visual = screenQ.visual;
                    q.printFormat = screenQ.printFormat || 'horizontal';
                    q.skillLabel = screenQ.skillLabel || q.skillLabel;
                    q.options = screenQ.options;
                    q.answerType = screenQ.answerType;
                }
            } catch (e) {
                // Fallback: simple counting question
                const n = rng(1, 20);
                q.text = `What number comes after ${n}?`;
                q.ans = n + 1;
                q.printFormat = 'horizontal';
            }
            break;
        }

        default: {
            // Default to simple addition
            const a = rng(1, 50);
            const b = rng(1, 50);
            q.ans = a + b;
            q.a = a;
            q.b = b;
            q.op = "+";
            q.printFormat = "column-add";
            q.text = `${a} + ${b} = ___`;
        }
    }

    // Fallback: For visual skills not handled above, delegate to generateQuestion()
    // This reuses the rich visual generation from generate-question.js
    const visualSkills = new Set([
        'arrays_groups', 'mult_properties', 'mult_chart', 'div_remainders',
        'fraction_of_set', 'fraction_of_set_hard', 'equiv_frac_visual',
        'area_unit_squares', 'perimeter_grid',
        'reading_ruler', 'reading_ruler_hard', 'money_count',
        'line_plot_fractions',
        'function_table_easy', 'function_table_hard',
        'tape_diagram', 'multi_step_word',
        'skip_count_line', 'skip_count_grid',
        'rounding_visual', 'place_value_disks',
        // Counting & Cardinality (K)
        'count_objects', 'count_sequence', 'compare_groups', 'compare_objects',
        'classify_count', 'number_bonds', 'make_ten', 'teen_compose',
        // Fraction Operations (4-5)
        'add_fractions_like', 'sub_fractions_like', 'add_mixed_like', 'sub_mixed_like',
        'mult_frac_whole', 'decompose_fractions', 'frac_word_problems', 'frac_10_100',
        'add_frac_unlike', 'sub_frac_unlike', 'add_mixed_unlike', 'sub_mixed_unlike',
        'mult_frac_frac', 'div_unit_fraction', 'frac_as_division', 'mult_scaling', 'frac_mult_word',
        'fraction_number_line', 'whole_as_fraction',
        // K-2 Shapes & Measurement
        'name_2d_shapes', 'name_3d_shapes', 'shape_positions',
        'order_objects_length', 'measure_nonstandard', 'compose_shapes', 'partition_shapes',
        'shape_attributes', 'estimate_length', 'mass_volume_liquid',
        // Arithmetic Extensions
        'add_three', 'comparison_word', 'equal_sign', 'mult_comparison',
        // Geometry & Conversions
        'additive_angles', 'unit_conversions', 'volume_composite',
        // Grade 5 Advanced
        'round_decimals', 'long_div_2digit', 'place_value_10x',
        // Patterns & Misc
        'odd_even', 'number_word_form', 'pattern_relationship',
        'more_less_10', 'more_less_100'
    ]);
    if (visualSkills.has(skill) && (!q.text || q.text === "")) {
        try {
            const savedCat = state.category;
            const savedSkill = state.skill;
            state.category = category;
            state.skill = skill;
            const generated = generateQuestion();
            state.category = savedCat;
            state.skill = savedSkill;
            if (generated && generated.text) {
                q.text = generated.text;
                q.ans = generated.ans;
                q.visual = generated.visual;
                q.printFormat = generated.printFormat || q.printFormat;
                q.skillLabel = generated.skillLabel || q.skillLabel;
                q.measurementData = generated.measurementData;
                q.dataData = generated.dataData;
                q.options = generated.options;
                q.answerType = generated.answerType;
            }
        } catch (e) {
            console.warn('Visual skill fallback failed:', e);
        }
    }

    return q;
}

export function formatProblemForPrint(problem, index, columns = 2, sizeCategory = '', showSkillLabels = true) {
    // Use full skill label from SKILL_FULL_LABELS (auto-built from SKILLS in data.js)
    // Falls back to problem.skillLabel which is already set during generation
    const skillLabel = problem.skillLabel || SKILL_FULL_LABELS[problem.skillId] || '';

    // Determine effective display mode from sizeCategory
    const isCompact = sizeCategory === 'compact';
    const isSpacious = sizeCategory === 'spacious';

    // Detect text duplication: visual already contains the question text
    const visualText = (problem.visual || '').replace(/<[^>]*>/g, '').trim();
    const plainText = (problem.text || '').replace(/<[^>]*>/g, '').replace(/\s*=\s*___/g, '').trim();
    const visualContainsText = plainText.length > 20 && visualText.includes(plainText.substring(0, 30));

    // Show short skill label after problem number (controlled by showSkillLabels param)
    const headerHtml = isCompact
        ? `<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:2px;">
            <span class="problem-number" style="font-weight:700;font-size:0.85rem;">${index + 1}.</span>
            ${showSkillLabels && skillLabel ? `<span style="font-size:0.65rem;color:#888;">${skillLabel}</span>` : ''}
           </div>`
        : `<div class="problem-header" style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;border-bottom:1px solid #eee;padding-bottom:4px;">
            <span class="problem-number" style="font-weight:700;font-size:1rem;">${index + 1}.</span>
            ${showSkillLabels && skillLabel ? `<span style="font-size:0.75rem;color:#888;">${skillLabel}</span>` : ''}
           </div>`;

    // Extra CSS class for compact problems
    const sizeClass = isCompact ? ' ws-problem-compact' : '';

    // Legacy num for handlers that still use it (will be phased out)
    const num = headerHtml;
    
    // ========== FAST FACTS COMPACT MODE (10+ columns) ==========
    if (columns >= 10) {
        const a = problem.a || 0;
        const b = problem.b || 0;
        // Normalize operator symbol for display
        const rawOp = problem.op || '+';
        const op = rawOp === '*' ? '\u00d7' : rawOp === '/' ? '\u00f7' : rawOp === '-' ? '\u2212' : rawOp;
        // Ultra-compact vertical format: no number, no header, tiny font
        return `<div class="worksheet-problem fast-fact" style="padding:2px 1px;text-align:center;">
            <div style="display:inline-block;text-align:right;font-size:0.7rem;line-height:1.15;">
                <div>${a}</div>
                <div style="border-bottom:1px solid #333;"><span style="margin-right:3px;">${op}</span>${b}</div>
                <div style="min-height:0.85rem;">&nbsp;</div>
            </div>
        </div>`;
    }

    // ========== IXL-STYLE PASTEL COLOR PALETTE ==========
    const PASTEL_COLORS = {
        yellow: { fill: '#fffde7', border: '#d4c85c', text: '#333' },      // Whole/reference strip
        purple: { fill: '#e8d4f0', border: '#9b7bb8', text: '#333' },      // First fraction (lavender)
        blue: { fill: '#d4e5f7', border: '#7bafd4', text: '#333' },        // Second fraction (like denom)
        pink: { fill: '#f5d4e8', border: '#d47ba8', text: '#333' },        // Second fraction (unlike denom)
        white: { fill: '#ffffff', border: '#999999', text: '#333' }        // Empty segments
    };
    
    // ========== GLOBAL PRINT VISUAL HELPER - IXL PASTEL COLORS ==========
    // Creates pie chart SVG with IXL-style light colors
    const printPieChartLight = (numerator, denominator, size = 100, fillColor = PASTEL_COLORS.purple.fill, borderColor = PASTEL_COLORS.purple.border) => {
        // Safety: clamp denominator to prevent infinite loops
        const safeDen = Math.max(1, Math.min(denominator || 1, 20));
        const safeNum = Math.max(0, Math.min(numerator || 0, safeDen));
        
        const cx = size / 2;
        const cy = size / 2;
        const r = (size / 2) - 4;
        const sliceAngle = 360 / safeDen;
        let slices = '';
        
        for (let i = 0; i < safeDen; i++) {
            const startAngle = (i * sliceAngle) - 90;
            const endAngle = startAngle + sliceAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const fill = i < safeNum ? fillColor : '#fff';
            slices += `<path d="${path}" fill="${fill}" stroke="#333" stroke-width="1.5"/>`;
        }
        
        // Add division lines for clarity - BLACK for visibility
        let lines = '';
        for (let i = 0; i < safeDen; i++) {
            const angle = (i * sliceAngle - 90) * Math.PI / 180;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            lines += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#333" stroke-width="1"/>`;
        }
        
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle;">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#333" stroke-width="2"/>
            ${slices}
            ${lines}
        </svg>`;
    };
    
    // Creates multiple pie circles for improper fractions
    const printFractionCirclesLight = (num, den, size = 90, fillColor = PASTEL_COLORS.blue.fill, borderColor = '#333') => {
        // Safety: prevent issues with invalid values
        const safeDen = Math.max(1, Math.min(den || 1, 20));
        const safeNum = Math.max(0, Math.min(num || 0, 100)); // Allow improper fractions up to 100
        
        const wholes = Math.min(Math.floor(safeNum / safeDen), 10); // Max 10 whole circles
        const remainder = safeNum % safeDen;
        let result = '';
        
        // Create full circles (limited to 10)
        for (let w = 0; w < wholes; w++) {
            result += printPieChartLight(safeDen, safeDen, size, fillColor, borderColor);
        }
        
        // Create partial circle for remainder
        if (remainder > 0 || wholes === 0) {
            result += printPieChartLight(remainder, safeDen, size, fillColor, borderColor);
        }
        
        return result;
    };
    
    // Creates IXL-style fraction strip model with labels
    const printFractionStripModel = (num1, den1, num2, den2, op = '+') => {
        // Create strip segments with labels inside (with safety limits)
        const makeStrip = (num, den, fillColor, borderColor) => {
            const safeDen = Math.max(1, Math.min(den || 1, 12));
            const safeNum = Math.max(0, Math.min(num || 0, safeDen));
            
            const segments = Array.from({length: safeDen}, (_, i) => {
                const isFilled = i < safeNum;
                return `<div style="flex:1;height:36px;display:flex;align-items:center;justify-content:center;
                    background:${isFilled ? fillColor : '#fff'};
                    border:1.5px solid #333;border-left:${i === 0 ? '1.5px' : '0'} solid #333;
                    font-size:0.75rem;font-weight:600;color:#333;">
                    <span style="display:flex;flex-direction:column;align-items:center;line-height:1.1;">
                        <span>1</span><span style="border-top:1px solid #333;padding-top:1px;">${safeDen}</span>
                    </span>
                </div>`;
            }).join('');
            return `<div style="display:flex;width:100%;max-width:300px;border-radius:4px;overflow:hidden;">${segments}</div>`;
        };
        
        // Create reference "1 whole" strip
        const wholeStrip = `<div style="height:32px;background:${PASTEL_COLORS.yellow.fill};border:2px solid ${PASTEL_COLORS.yellow.border};
            border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#333;max-width:300px;">1</div>`;
        
        return `
            <div style="background:${PASTEL_COLORS.yellow.fill};border:2px solid ${PASTEL_COLORS.yellow.border};border-radius:8px;padding:12px;margin:10px 0;">
                ${wholeStrip}
                <div style="margin-top:8px;">
                    ${makeStrip(num1, den1, PASTEL_COLORS.purple.fill, PASTEL_COLORS.purple.border)}
                    <div style="display:flex;align-items:center;gap:8px;margin-left:-25px;">
                        <span style="font-size:1.3rem;font-weight:700;color:#333;width:25px;text-align:center;">${op}</span>
                        ${makeStrip(num2, den2 || den1, PASTEL_COLORS.pink.fill, PASTEL_COLORS.pink.border)}
                    </div>
                </div>
            </div>`;
    };
    
    // Creates fraction strip model like IXL (legacy support)
    const printFractionStripLight = (num, den, fillClass = 'filled', showLabels = true) => {
        const fillColor = fillClass === 'filled' ? PASTEL_COLORS.purple.fill : PASTEL_COLORS.blue.fill;
        const segments = Array.from({length: den}, (_, i) => {
            const isFilled = i < num;
            const label = showLabels ? `<span style="font-size:0.7rem;color:#333;">1/${den}</span>` : '';
            return `<span class="fraction-strip-segment ${isFilled ? fillClass : 'empty'}" style="background:${isFilled ? fillColor : '#fff'};border-color:#333;">${label}</span>`;
        }).join('');
        return `<div class="fraction-strip" style="border-color:#333;">${segments}</div>`;
    };
    // ========== END GLOBAL PRINT VISUAL HELPER ==========
    
    // Determine if problem needs full width (spans all columns)
    // Only used when NOT in auto-layout mode (auto mode uses sub-grids instead)
    function needsFullWidth(p) {
        const fullWidthFormats = [
            // Coordinate grids - fixed-size SVG grids
            'coordinate-graph', 'coordinate-identify', 'coordinate-quadrant',
            'geometry-coordinates',
            // Charts with axes - need width for labels
            'bar-chart', 'line-plot', 'pictograph',
            // Large geometry/visual formats
            'tape-diagram', 'function-table', 'function-table-easy', 'function-table-hard',
            'line-plot-fractions', 'tally-chart',
            // Word problems
            'word-problem', 'word-problem-add', 'word-problem-sub', 'word-problem-mult', 'word-problem-div',
            'multi-step-word', 'word-plain',
            // Geometry with large SVGs
            'geometry-area-perimeter', 'geometry-perimeter-grid', 'geometry-area-unit',
            'geometry-volume', 'geometry-composite-area',
        ];
        return fullWidthFormats.includes(p.printFormat);
    }
    
    const fullWidthClass = needsFullWidth(problem) ? ' full-width' : '';
    
    // Helper function to determine answer line width based on expected answer
    function getAnswerLineWidth(problem) {
        const text = problem.text || "";
        const ans = problem.ans;
        const ansType = problem.answerType;
        
        // Expanded form needs long line (e.g., "500 + 40 + 3")
        if (text.toLowerCase().includes("expanded form")) {
            return "220px";
        }
        
        // Next three numbers needs long line (e.g., "25, 30, 35")
        if (text.includes("next 3") || text.includes("___, ___, ___")) {
            return "180px";
        }
        
        // Ordering answers need medium-long lines
        if (text.toLowerCase().includes("order from") || ansType === "ordering") {
            return "60px"; // Per number slot
        }
        
        // Time conversions with labels
        if (text.includes("hours") && text.includes("minutes") && text.includes("___")) {
            return "time"; // Special handling
        }
        if (text.includes("days") && text.includes("hours") && text.includes("___")) {
            return "time"; // Special handling
        }
        if (text.includes("minutes") && text.includes("seconds") && text.includes("___")) {
            return "time"; // Special handling
        }
        
        // Symbol answers (>, <, =)
        if (ansType === "symbol" || (typeof ans === "string" && [">", "<", "="].includes(ans))) {
            return "40px";
        }
        
        // Fraction text answers (e.g., "1/2")
        if (ansType === "text" && typeof ans === "string" && ans.includes("/")) {
            return "80px";
        }
        
        // Percent answers
        if (typeof ans === "string" && ans.includes("%")) {
            return "70px";
        }
        
        // Pattern with missing number
        if (text.includes("Pattern:") || text.includes("Skip count")) {
            return "60px";
        }
        
        // Double/halve
        if (text.includes("Double") || text.includes("Half of")) {
            return "70px";
        }
        
        // Rounding
        if (text.toLowerCase().includes("round")) {
            // Estimate based on answer size
            const ansStr = String(ans);
            return Math.max(70, ansStr.length * 12) + "px";
        }
        
        // Decimal answers
        if (typeof ans === "number" && !Number.isInteger(ans)) {
            return "80px";
        }
        
        // Large number answers (1000+)
        if (typeof ans === "number" && ans >= 1000) {
            return "90px";
        }
        
        // Default for simple numbers
        return "60px";
    }
    
    // ========== PLAIN WORD PROBLEMS (no picture, work area) ==========
    if (problem.printFormat === 'word-plain' || (problem.skillId && problem.skillId.endsWith('_plain'))) {
        const text = problem.text || '';
        const showLabel = showSkillLabels && !!skillLabel;
        const isMultiStep = (problem.skillId || '').includes('multi_step') || (problem.printFormat || '').includes('multi-step');

        return `<div class="worksheet-problem ws-problem-spacious" style="padding:14px 16px;page-break-inside:avoid;">
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;border-bottom:2px solid #eee;padding-bottom:6px;">
                <span style="font-weight:700;font-size:1.05rem;">${index + 1}.</span>
                ${showLabel ? `<span style="font-size:0.75rem;color:#999;font-style:italic;">${skillLabel}</span>` : ''}
            </div>
            <div style="font-size:1.15rem;line-height:1.75;margin-bottom:8px;">${text}</div>
            <div class="ws-work-space">
                <div class="ws-work-space-label">Show your work:</div>
            </div>
            ${isMultiStep ? `
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;align-items:baseline;">
                <span style="font-weight:600;font-size:0.95rem;white-space:nowrap;">Step 1:</span>
                <span style="flex:1;min-width:80px;border-bottom:2px solid #999;">&nbsp;</span>
                <span style="font-weight:600;font-size:0.95rem;white-space:nowrap;">Step 2:</span>
                <span style="flex:1;min-width:80px;border-bottom:2px solid #999;">&nbsp;</span>
            </div>` : ''}
            <div style="display:flex;align-items:baseline;gap:10px;margin-top:12px;">
                <span style="font-weight:700;font-size:1.1rem;white-space:nowrap;">Answer:</span>
                <span style="flex:1;border-bottom:3px solid #333;min-height:1.4em;">&nbsp;</span>
            </div>
        </div>`;
    }

    // ========== WORD PROBLEMS WITH VISUAL (word-problem format from gen-operations) ==========
    if (problem.printFormat === 'word-problem') {
        const wpText = problem.text || '';
        const showLabel = showSkillLabels && !!skillLabel;

        return `<div class="worksheet-problem ws-problem-spacious" style="padding:14px 16px;page-break-inside:avoid;">
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;border-bottom:2px solid #eee;padding-bottom:6px;">
                <span style="font-weight:700;font-size:1.05rem;">${index + 1}.</span>
                ${showLabel ? `<span style="font-size:0.75rem;color:#999;font-style:italic;">${skillLabel}</span>` : ''}
            </div>
            <div style="font-size:1.15rem;line-height:1.75;margin-bottom:8px;">${wpText}</div>
            <div class="ws-work-space">
                <div class="ws-work-space-label">Show your work:</div>
            </div>
            <div style="display:flex;align-items:baseline;gap:10px;margin-top:12px;">
                <span style="font-weight:700;font-size:1.1rem;white-space:nowrap;">Answer:</span>
                <span style="flex:1;border-bottom:3px solid #333;min-height:1.4em;">&nbsp;</span>
            </div>
        </div>`;
    }

    // Column addition/subtraction
    if (problem.printFormat === "column-add" || problem.printFormat === "column-sub") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        const op = problem.op || "+";
        const maxLen = Math.max(a.toString().length, b.toString().length);
        const ansLen = Math.max((a + b).toString().length, maxLen + 1);
        const boxWidth = 28;
        const boxGap = 4;
        
        // Create work boxes (carrying boxes above)
        const carryBoxes = Array.from({length: ansLen}, () => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;border:1.5px dashed #aaa;border-radius:4px;"></div>`
        ).join('');
        
        // Create answer boxes below
        const answerBoxes = Array.from({length: ansLen}, () => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`
        ).join('');
        
        // Pad numbers to align right
        const aDigits = a.toString().padStart(ansLen, ' ');
        const bDigits = b.toString().padStart(ansLen, ' ');
        
        // Create digit display
        const aDisplay = aDigits.split('').map(d => 
            `<div style="width:${boxWidth}px;text-align:center;font-weight:700;font-size:1.2rem;">${d === ' ' ? '&nbsp;' : d}</div>`
        ).join('');
        
        const bDisplay = bDigits.split('').map(d => 
            `<div style="width:${boxWidth}px;text-align:center;font-weight:700;font-size:1.2rem;">${d === ' ' ? '&nbsp;' : d}</div>`
        ).join('');
        
        const regroupLabel = problem.printFormat === "column-sub"
            ? '<div style="font-size:0.65rem;color:#888;text-align:center;margin-top:-2px;">Regroup?</div>'
            : '';

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;flex-direction:column;align-items:flex-end;gap:${boxGap}px;font-family:'Courier New',monospace;">
                        <!-- Carry/borrow boxes -->
                        <div style="display:flex;gap:${boxGap}px;">${carryBoxes}</div>
                        ${regroupLabel}
                        <!-- First number -->
                        <div style="display:flex;gap:${boxGap}px;">${aDisplay}</div>
                        <!-- Operator and second number -->
                        <div style="display:flex;gap:${boxGap}px;align-items:center;">
                            <span style="font-weight:700;font-size:1.3rem;margin-right:6px;">${op}</span>
                            ${bDisplay}
                        </div>
                        <!-- Line -->
                        <div style="width:100%;border-bottom:3px solid #444;margin:4px 0;"></div>
                        <!-- Answer boxes -->
                        <div style="display:flex;gap:${boxGap}px;">${answerBoxes}</div>
                    </div>
                </div>
            </div>`;
    }
    
    // ===== ADDITION FACTS FORMATS =====
    // Addition facts - HORIZONTAL format
    if (problem.printFormat === "add-facts-horizontal") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <span style="font-size:1.1rem;">${a} + ${b} = <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #333;">&nbsp;</span></span>
                </div>
            </div>`;
    }
    
    // Addition facts - VERTICAL format (clean like reference)
    if (problem.printFormat === "add-facts-vertical") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-block;text-align:right;font-size:1.1rem;">
                        <div>${a}</div>
                        <div style="border-bottom:1.5px solid #333;"><span style="margin-right:6px;">+</span>${b}</div>
                    </div>
                </div>
            </div>`;
    }
    
    // ===== SUBTRACTION FACTS FORMATS =====
    // Subtraction facts - HORIZONTAL format
    if (problem.printFormat === "sub-facts-horizontal") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <span style="font-size:1.1rem;">${a} − ${b} = <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #333;">&nbsp;</span></span>
                </div>
            </div>`;
    }
    
    // Subtraction facts - VERTICAL format (clean like reference)
    if (problem.printFormat === "sub-facts-vertical") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-block;text-align:right;font-size:1.1rem;">
                        <div>${a}</div>
                        <div style="border-bottom:1.5px solid #333;"><span style="margin-right:6px;">−</span>${b}</div>
                    </div>
                </div>
            </div>`;
    }
    
    // ===== MULTIPLICATION FACTS FORMATS =====
    // Multiplication facts - HORIZONTAL format
    if (problem.printFormat === "mult-facts-horizontal") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <span style="font-size:1.1rem;">${a} × ${b} = <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #333;">&nbsp;</span></span>
                </div>
            </div>`;
    }
    
    // Multiplication facts - VERTICAL format (clean like reference)
    if (problem.printFormat === "mult-facts-vertical") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-block;text-align:right;font-size:1.1rem;">
                        <div>${a}</div>
                        <div style="border-bottom:1.5px solid #333;"><span style="margin-right:6px;">×</span>${b}</div>
                    </div>
                </div>
            </div>`;
    }
    
    // Division facts - HORIZONTAL format
    if (problem.printFormat === "div-facts-horizontal") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <span style="font-size:1.1rem;">${a} ÷ ${b} = <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #333;">&nbsp;</span></span>
                </div>
            </div>`;
    }
    
    // Division facts - FRACTION style (a/b = ___)
    if (problem.printFormat === "div-facts-fraction") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;align-items:center;gap:8px;font-size:1.1rem;">
                        <div style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.2;">
                            <span>${a}</span>
                            <div style="width:100%;height:1.5px;background:#333;"></div>
                            <span>${b}</span>
                        </div>
                        <span>= ____</span>
                    </div>
                </div>
            </div>`;
    }
    
    // Division facts - LONG DIVISION style (traditional bracket)
    if (problem.printFormat === "div-facts-long") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;align-items:flex-start;font-size:1.1rem;">
                        <span style="margin-top:14px;margin-right:1px;">${b}</span>
                        <div style="display:flex;flex-direction:column;">
                            <div style="min-width:30px;height:14px;border-bottom:1.5px solid #333;"></div>
                            <div style="border-left:1.5px solid #333;padding-left:4px;">${a}</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Division facts - VERTICAL format - redirect to long division style
    if (problem.printFormat === "div-facts-vertical") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;align-items:flex-start;font-size:1.1rem;">
                        <span style="margin-top:14px;margin-right:1px;">${b}</span>
                        <div style="display:flex;flex-direction:column;">
                            <div style="min-width:30px;height:14px;border-bottom:1.5px solid #333;"></div>
                            <div style="border-left:1.5px solid #333;padding-left:4px;">${a}</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Column multiplication
    if (problem.printFormat === "column-mult") {
        const a = problem.a || 0;
        const b = problem.b || 0;
        const result = a * b;
        const aStr = a.toString();
        const bStr = b.toString();
        const ansLen = result.toString().length;
        const maxLen = Math.max(aStr.length, bStr.length, ansLen);
        const boxWidth = 28;
        const boxGap = 4;
        
        // Create carry boxes
        const carryBoxes = Array.from({length: maxLen + 1}, () => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;border:1.5px dashed #aaa;border-radius:4px;"></div>`
        ).join('');
        
        // Create answer boxes
        const answerBoxes = Array.from({length: ansLen}, () => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`
        ).join('');
        
        // Pad numbers
        const aDigits = aStr.padStart(maxLen + 1, ' ');
        const bDigits = bStr.padStart(maxLen + 1, ' ');
        
        const aDisplay = aDigits.split('').map(d => 
            `<div style="width:${boxWidth}px;text-align:center;font-weight:700;font-size:1.2rem;">${d === ' ' ? '&nbsp;' : d}</div>`
        ).join('');
        
        const bDisplay = bDigits.split('').map(d => 
            `<div style="width:${boxWidth}px;text-align:center;font-weight:700;font-size:1.2rem;">${d === ' ' ? '&nbsp;' : d}</div>`
        ).join('');
        
        // Work area for multi-digit multiplication
        let workArea = '';
        if (bStr.length > 1) {
            // Show partial products work area
            const partialBoxes = Array.from({length: ansLen + 1}, () => 
                `<div style="width:${boxWidth}px;height:${boxWidth}px;border:1px dashed #999;border-radius:3px;"></div>`
            ).join('');
            
            workArea = `
                <div style="display:flex;gap:${boxGap}px;margin-top:4px;">${partialBoxes}</div>
                <div style="display:flex;gap:${boxGap}px;margin-top:4px;">${partialBoxes}</div>
                <div style="width:100%;height:1px;background:#999;margin:4px 0;"></div>`;
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;flex-direction:column;align-items:flex-end;gap:${boxGap}px;font-family:'Courier New',monospace;">
                        <!-- Carry boxes -->
                        <div style="display:flex;gap:${boxGap}px;">${carryBoxes}</div>
                        <!-- First number -->
                        <div style="display:flex;gap:${boxGap}px;">${aDisplay}</div>
                        <!-- Operator and second number -->
                        <div style="display:flex;gap:${boxGap}px;align-items:center;">
                            <span style="font-weight:700;font-size:1.3rem;margin-right:6px;">×</span>
                            ${bDisplay}
                        </div>
                        <!-- Line -->
                        <div style="width:100%;border-bottom:3px solid #444;margin:4px 0;"></div>
                        <!-- Work area for partial products (if multi-digit) -->
                        ${workArea}
                        <!-- Answer boxes -->
                        <div style="display:flex;gap:${boxGap}px;">${answerBoxes}</div>
                    </div>
                </div>
            </div>`;
    }
    
    // Area Model Multiplication (Print)
    if (problem.printFormat === "area-model-mult" && problem.areaModelData) {
        const amd = problem.areaModelData;
        const { multiplier, multiplicand, parts, product } = amd;
        const colors = ['#5fd4c3', '#f8b878', '#f8a0c8']; // teal, orange, pink
        
        // Calculate box sizes based on number of digits in partial product
        // Each box should be relatively equal, just slightly larger for more digits
        const numParts = parts.length;
        const baseBoxWidth = 70; // Base width for each section
        const rectHeight = 65;
        
        // Calculate partial products to determine answer box sizes
        const partialProducts = parts.map(p => multiplier * p.value);
        
        return `
            <div class="worksheet-problem${sizeClass}">
                ${num}
                <div class="problem-content" style="padding:8px;">
                    <div style="font-weight:600;margin-bottom:6px;font-size:0.95rem;">Use the model to find <strong>${multiplier} × ${multiplicand}</strong>.</div>
                    <div style="font-style:italic;color:#666;margin-bottom:8px;font-size:0.8rem;">First, find the area of each rectangle.</div>

                    <!-- Area Model Grid -->
                    <div style="display:inline-block;margin-bottom:10px;">
                        <!-- Top labels (place values) -->
                        <div style="display:flex;margin-left:26px;margin-bottom:3px;">
                            ${parts.map((p, i) => {
                                const digitCount = partialProducts[i].toString().length;
                                const sectionWidth = baseBoxWidth + (digitCount - 1) * 8;
                                return `<div style="width:${sectionWidth}px;text-align:center;font-weight:700;font-size:0.9rem;">${p.value}</div>`;
                            }).join('')}
                        </div>

                        <!-- Main grid with multiplier on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1rem;margin-right:6px;width:20px;text-align:center;">${multiplier}</div>
                            <div style="display:flex;border:2px solid #555;border-radius:3px;overflow:hidden;">
                                ${parts.map((p, i) => {
                                    const digitCount = partialProducts[i].toString().length;
                                    const sectionWidth = baseBoxWidth + (digitCount - 1) * 8;
                                    const innerBoxWidth = 40 + digitCount * 10;
                                    return `
                                        <div style="width:${sectionWidth}px;height:${rectHeight}px;background:${colors[i % colors.length]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <div style="width:${innerBoxWidth}px;height:26px;border:2px solid #fff;border-radius:4px;background:rgba(255,255,255,0.95);"></div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Total calculation -->
                    <div style="font-style:italic;color:#666;font-size:0.8rem;">Then, find the total area.</div>
                    <div style="margin-top:6px;display:flex;align-items:center;gap:6px;font-size:1rem;font-weight:600;">
                        <span>${multiplier} × ${multiplicand} = </span>
                        <div style="width:${50 + product.toString().length * 12}px;height:28px;border:2px solid #555;border-radius:6px;background:#fff;"></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Area Model Multiplication - Hard (2×2 and 2×3 grids) - Print
    if (problem.printFormat === "area-model-mult-hard" && problem.areaModelData) {
        const amd = problem.areaModelData;
        const { num1, num2, rowParts, colParts, product } = amd;
        const colors = [
            ['#f8e473', '#5fd4c3', '#dda0dd'],  // Row 1: yellow, teal, plum
            ['#f8b878', '#f8a0c8', '#98d8c8']   // Row 2: orange, pink, mint
        ];
        
        const baseBoxWidth = 70;
        const baseBoxHeight = 55;
        
        // Calculate partial products for sizing
        const getPartialProduct = (r, c) => rowParts[r] * colParts[c];
        
        return `
            <div class="worksheet-problem${sizeClass}">
                ${num}
                <div class="problem-content" style="padding:8px;">
                    <div style="font-weight:600;margin-bottom:6px;font-size:0.95rem;">Use the model to find <strong>${num1} × ${num2}</strong>.</div>
                    <div style="font-style:italic;color:#666;margin-bottom:8px;font-size:0.8rem;">First, find the area of each rectangle.</div>

                    <!-- Area Model 2D Grid -->
                    <div style="display:inline-block;margin-bottom:10px;">
                        <!-- Top labels (column values) -->
                        <div style="display:flex;margin-left:30px;margin-bottom:3px;">
                            ${colParts.map((col, c) => {
                                const maxDigits = Math.max(...rowParts.map(r => (r * col).toString().length));
                                const cellWidth = baseBoxWidth + (maxDigits - 2) * 8;
                                return `<div style="width:${cellWidth}px;text-align:center;font-weight:700;font-size:0.9rem;">${col}</div>`;
                            }).join('')}
                        </div>

                        <!-- Grid rows -->
                        ${rowParts.map((row, r) => {
                            return `
                            <div style="display:flex;align-items:center;">
                                <div style="font-weight:700;font-size:1rem;margin-right:6px;width:24px;text-align:center;">${row}</div>
                                <div style="display:flex;border:2px solid #555;${r === 0 ? 'border-radius:3px 3px 0 0;' : 'border-top:none;border-radius:0 0 3px 3px;'}overflow:hidden;">
                                    ${colParts.map((col, c) => {
                                        const partialVal = row * col;
                                        const digitCount = partialVal.toString().length;
                                        const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                        const innerBoxWidth = 40 + digitCount * 10;
                                        const colorRow = r % 2;
                                        const colorCol = c % colors[colorRow].length;
                                        const bgColor = colors[colorRow][colorCol];
                                        return `
                                        <div style="width:${cellWidth}px;height:${baseBoxHeight}px;background:${bgColor};display:flex;align-items:center;justify-content:center;${c > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <div style="width:${innerBoxWidth}px;height:24px;border:2px solid #fff;border-radius:4px;background:rgba(255,255,255,0.95);"></div>
                                        </div>
                                    `}).join('')}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>

                    <!-- Total calculation -->
                    <div style="font-style:italic;color:#666;font-size:0.8rem;">Then, find the total area.</div>
                    <div style="margin-top:6px;display:flex;align-items:center;gap:6px;font-size:1rem;font-weight:600;">
                        <span>${num1} × ${num2} = </span>
                        <div style="width:${50 + product.toString().length * 12}px;height:28px;border:2px solid #555;border-radius:6px;background:#fff;"></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Area Model Division - Print
    if (problem.printFormat === "area-model-div" && problem.areaModelDivData) {
        const amd = problem.areaModelDivData;
        const { divisor, dividend, quotient, parts } = amd;
        const colors = ['#f8b878', '#f8a0c8']; // orange, pink
        
        // Determine if it's 2-digit or 3-digit based on quotient
        const is3Digit = quotient >= 100;
        const baseBoxWidth = is3Digit ? 90 : 75;
        const rectHeight = 60;
        
        return `
            <div class="worksheet-problem${sizeClass}">
                ${num}
                <div class="problem-content" style="padding:8px;">
                    <div style="font-weight:600;margin-bottom:6px;font-size:0.95rem;">Use the model to find <strong>${dividend} ÷ ${divisor}</strong>.</div>
                    <div style="font-style:italic;color:#666;margin-bottom:8px;font-size:0.8rem;">First, find the missing side lengths.</div>

                    <!-- Area Model Grid -->
                    <div style="display:inline-block;margin-bottom:10px;">
                        <!-- Top labels (unknown - answer boxes) -->
                        <div style="display:flex;margin-left:26px;margin-bottom:3px;">
                            ${parts.map((p, i) => {
                                const sectionWidth = baseBoxWidth + (i === 0 ? 15 : 0);
                                const boxWidth = 40 + p.quotient.toString().length * 8;
                                return `
                                    <div style="width:${sectionWidth}px;text-align:center;">
                                        <div style="display:inline-block;width:${boxWidth}px;height:22px;border:2px solid #888;border-radius:4px;background:white;"></div>
                                    </div>`;
                            }).join('')}
                        </div>

                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1rem;margin-right:6px;width:20px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #555;border-radius:3px;overflow:hidden;">
                                ${parts.map((p, i) => {
                                    const sectionWidth = baseBoxWidth + (i === 0 ? 15 : 0);
                                    return `
                                        <div style="width:${sectionWidth}px;height:${rectHeight}px;background:${colors[i % colors.length]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <span style="font-weight:700;font-size:1rem;">${p.value}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Quotient calculation -->
                    <div style="font-style:italic;color:#666;font-size:0.8rem;">Then, find the quotient.</div>
                    <div style="margin-top:6px;display:flex;align-items:center;gap:6px;font-size:1rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <div style="width:${45 + quotient.toString().length * 12}px;height:28px;border:2px solid #555;border-radius:6px;background:#fff;"></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Long division
    if (problem.printFormat === "long-division") {
        const a = problem.a || 0; // dividend
        const b = problem.b || 0; // divisor
        const quotient = Math.floor(a / b);
        const remainder = a % b;
        const ansLen = quotient.toString().length;
        const dividendLen = a.toString().length;
        const boxWidth = 30;
        const boxGap = 3;
        const totalWidth = (dividendLen + 1) * (boxWidth + boxGap);
        
        // Create quotient answer boxes (aligned right over dividend)
        const quotientBoxes = Array.from({length: ansLen}, () => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`
        ).join('');
        
        // Create dividend digit boxes
        const dividendBoxes = a.toString().split('').map(d => 
            `<div style="width:${boxWidth}px;height:${boxWidth}px;text-align:center;font-weight:700;font-size:1.1rem;line-height:${boxWidth}px;border:1px solid #ddd;border-radius:3px;">${d}</div>`
        ).join('');
        
        // Calculate work rows needed (one per quotient digit)
        const workRows = Math.max(ansLen, 2);
        
        // Generate work grid with subtraction lines
        let workGridHTML = '';
        for (let row = 0; row < workRows; row++) {
            // Subtraction row (product to subtract)
            workGridHTML += `
                <div style="display:flex;gap:${boxGap}px;align-items:center;margin-top:${row === 0 ? '0' : '4px'};">
                    <span style="font-size:0.9rem;color:#666;width:20px;">−</span>
                    ${Array.from({length: dividendLen + 1}, () => 
                        `<div style="width:${boxWidth}px;height:${boxWidth - 6}px;border-bottom:1.5px solid #333;"></div>`
                    ).join('')}
                </div>
                <!-- Difference row (result after subtraction) -->
                <div style="display:flex;gap:${boxGap}px;margin-left:20px;">
                    ${Array.from({length: dividendLen + 1}, () => 
                        `<div style="width:${boxWidth}px;height:${boxWidth - 4}px;border:1px dashed #ccc;border-radius:2px;"></div>`
                    ).join('')}
                </div>`;
            
            // Bring down arrow indicator (except last row)
            if (row < workRows - 1) {
                workGridHTML += `
                    <div style="display:flex;gap:${boxGap}px;margin-left:20px;margin-top:2px;">
                        ${Array.from({length: dividendLen + 1}, (_, i) => 
                            i === dividendLen - workRows + row + 1 ? 
                            `<div style="width:${boxWidth}px;text-align:center;color:#999;font-size:0.8rem;">↓</div>` :
                            `<div style="width:${boxWidth}px;"></div>`
                        ).join('')}
                    </div>`;
            }
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-block;font-family:'Courier New',monospace;">
                        <!-- Main division structure -->
                        <div style="display:flex;align-items:flex-start;gap:6px;">
                            <!-- Divisor -->
                            <div style="font-weight:700;font-size:1.3rem;padding-top:${boxWidth + 15}px;">${b}</div>
                            
                            <!-- Division bracket and dividend -->
                            <div style="display:flex;flex-direction:column;">
                                <!-- Quotient boxes (answer) -->
                                <div style="display:flex;gap:${boxGap}px;justify-content:flex-end;padding-right:${boxGap}px;margin-bottom:4px;">
                                    ${quotientBoxes}
                                </div>
                                
                                <!-- Division bracket with dividend -->
                                <div style="display:flex;">
                                    <div style="width:10px;border-left:2.5px solid #333;border-top:2.5px solid #333;border-top-left-radius:8px;"></div>
                                    <div style="border-top:2.5px solid #333;padding:6px ${boxGap}px 8px ${boxGap}px;">
                                        <div style="display:flex;gap:${boxGap}px;">
                                            ${dividendBoxes}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Work grid for long division steps -->
                                <div style="margin-left:10px;margin-top:8px;">
                                    ${workGridHTML}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Remainder box -->
                        ${remainder > 0 ? `
                            <div style="margin-top:12px;margin-left:${boxWidth + 10}px;display:flex;align-items:center;gap:8px;">
                                <span style="font-weight:600;color:#666;">Remainder:</span>
                                <div style="width:${boxWidth + 10}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>`;
    }
    
    // Order of Operations — 2-column layout with spacious show-your-work area
    if (problem.printFormat === "order-of-ops") {
        const expression = problem.expression || problem.text.replace(" = ___", "").replace(/\s*=\s*\?/, "").trim();
        const answerWidth = Math.max(70, problem.ans.toString().length * 16 + 40);

        // Use actual steps from generator if available, else estimate from operations
        let stepCount;
        if (problem.oooSteps && problem.oooSteps.length > 0) {
            stepCount = problem.oooSteps.length;
        } else {
            const hasParens = expression.includes('(') || expression.includes('[');
            const hasExponents = expression.includes('^') || /[²³⁴⁵]/.test(expression) || /<sup>/.test(expression);
            const multDivCount = (expression.match(/[×÷]/g) || []).length;
            const addSubCount = (expression.match(/[+−\u2212-]/g) || []).length;
            stepCount = multDivCount + addSubCount + (hasParens ? 1 : 0) + (hasExponents ? 1 : 0);
        }
        // Ensure at least 4 lines, cap at 6
        stepCount = Math.max(4, Math.min(6, stepCount));

        // Build step work lines — plain numbered blank lines
        const stepLines = Array.from({length: stepCount}, () => `
            <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                <div style="flex:1;border-bottom:1.5px solid #bbb;height:28px;"></div>
            </div>
        `).join('');

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="padding:12px 14px;">
                ${num}
                <div class="problem-content" style="width:100%;">
                    <div style="display:flex;align-items:center;gap:10px;font-size:1.25rem;padding:6px 0 10px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-weight:600;">
                        <span>${expression}</span>
                        <span style="font-size:1.1rem;color:#555;">=</span>
                        <span style="display:inline-block;min-width:${answerWidth}px;border-bottom:2.5px solid #333;height:1.5em;"></span>
                    </div>
                    <div style="margin-top:4px;padding:8px 10px;background:#fafafa;border:1px solid #ddd;border-radius:5px;">
                        <div style="font-size:0.7rem;font-weight:600;color:#666;margin-bottom:4px;">Show your work:</div>
                        <div style="font-size:0.7rem;color:#888;margin-bottom:10px;font-style:italic;">Rewrite the expression after each step. Underline the operation you solve.</div>
                        ${stepLines}
                        <div style="display:flex;align-items:flex-end;margin-top:10px;padding-top:6px;border-top:1.5px dashed #999;">
                            <div style="min-width:90px;font-weight:700;color:#333;font-size:0.8rem;padding-bottom:2px;">Answer:</div>
                            <div style="flex:1;border-bottom:2px solid #555;height:26px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Compare Expressions — two OoO expressions with comparison box
    if (problem.printFormat === "compare-expressions" && problem.compareData) {
        const cd = problem.compareData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="padding:12px 14px;">
                ${num}
                <div class="problem-content" style="width:100%;">
                    <div style="font-size:0.8rem;color:#666;margin-bottom:6px;">Fill in the box with <, >, or =</div>
                    <div style="display:flex;align-items:center;gap:10px;font-size:1.2rem;padding:8px 0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-weight:600;flex-wrap:wrap;">
                        <span>${cd.leftExpr}</span>
                        <span style="display:inline-block;width:30px;height:30px;border:2px solid #333;border-radius:3px;"></span>
                        <span>${cd.rightExpr}</span>
                    </div>
                    <div style="margin-top:8px;padding:8px 10px;background:#fafafa;border:1px solid #ddd;border-radius:5px;">
                        <div style="font-size:0.7rem;font-weight:600;color:#666;margin-bottom:6px;">Show your work:</div>
                        <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                            <div style="min-width:50px;color:#777;font-size:0.75rem;font-weight:600;padding-bottom:2px;">Left:</div>
                            <div style="flex:1;border-bottom:1.5px solid #bbb;height:26px;"></div>
                        </div>
                        <div style="display:flex;align-items:flex-end;margin-bottom:6px;">
                            <div style="min-width:50px;color:#777;font-size:0.75rem;font-weight:600;padding-bottom:2px;">Right:</div>
                            <div style="flex:1;border-bottom:1.5px solid #bbb;height:26px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Fraction operations (add/sub) - same denominator - compact bar model
    if (problem.printFormat === "fraction-op" && problem.fractionData) {
        const fd = problem.fractionData;

        // Safety check for valid fraction data
        if (!fd.denom || fd.denom < 1 || fd.denom > 20) {
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div style="display:flex;align-items:center;gap:8px;font-size:1.1rem;">
                            <span>${fd.num1 || '?'}/${fd.denom || '?'}</span>
                            <span>${fd.op || '+'}</span>
                            <span>${fd.num2 || '?'}/${fd.denom || '?'}</span>
                            <span>=</span>
                            <span style="border-bottom:2px solid #333;min-width:60px;">&nbsp;</span>
                        </div>
                    </div>
                </div>`;
        }

        // Compact bar model - colored segments, max 180px wide
        const makeCompactBar = (numVal, denVal, fillColor) => {
            const safeNum = Math.max(0, Math.min(numVal || 0, 20));
            const safeDen = Math.max(1, Math.min(denVal || 1, 12));
            const segW = Math.min(28, Math.floor(180 / safeDen));
            let segments = '';
            for (let i = 0; i < safeDen; i++) {
                segments += `<div style="width:${segW}px;height:22px;background:${i < safeNum ? fillColor : '#fff'};border:1.5px solid #555;${i > 0 ? 'border-left:none;' : ''}"></div>`;
            }
            return `<div style="display:flex;max-width:180px;">${segments}</div>`;
        };

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        ${makeCompactBar(fd.num1, fd.denom, '#e8d4f0')}
                        <span style="font-size:0.8rem;font-weight:600;color:#555;">${fd.num1}/${fd.denom}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-weight:700;font-size:1rem;width:14px;">${fd.op}</span>
                        ${makeCompactBar(fd.num2, fd.denom, '#d4e5f7')}
                        <span style="font-size:0.8rem;font-weight:600;color:#555;">${fd.num2}/${fd.denom}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;font-size:1.1rem;">
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.num1}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom}</span>
                        </div>
                        <span style="font-weight:700;">${fd.op}</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.num2}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom}</span>
                        </div>
                        <span style="font-weight:700;">=</span>
                        <span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;margin:0 4px;"><span style="min-width:30px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span><span style="width:100%;height:2px;background:#333;margin:2px 0;"></span><span style="min-width:30px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span></span>
                    </div>
                </div>
            </div>`;
    }

    // Fraction of a number
    if (problem.printFormat === "fraction-of" && problem.fractionData) {
        const fd = problem.fractionData;
        
        // Create print circle SVG with LIGHT PASTEL COLORS
        const printCircleSVG = (num, den, size = 70, fillColor = '#d4b8e8', borderColor = '#9b7bb8') => {
            const cx = size / 2;
            const cy = size / 2;
            const r = (size / 2) - 4;
            const sliceAngle = 360 / den;
            let slices = '';
            
            for (let i = 0; i < den; i++) {
                const startAngle = (i * sliceAngle) - 90;
                const endAngle = startAngle + sliceAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = sliceAngle > 180 ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                const fill = i < num ? fillColor : '#fff';
                slices += `<path d="${path}" fill="${fill}" stroke="${borderColor}" stroke-width="2"/>`;
            }
            
            // Add division lines for clarity
            let lines = '';
            for (let i = 0; i < den; i++) {
                const angle = (i * sliceAngle - 90) * Math.PI / 180;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                lines += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${borderColor}" stroke-width="1.5"/>`;
            }
            
            return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align: middle;">
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${borderColor}" stroke-width="2.5"/>
                ${slices}
                ${lines}
            </svg>`;
        };
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="print-frac-equation">
                        ${printCircleSVG(fd.num, fd.denom, 32)}
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.num}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom}</span>
                        </div>
                        <span style="font-size: 1.2rem; margin: 0 5px;">of</span>
                        <span style="font-weight: bold; font-size: 1.4rem;">${fd.whole}</span>
                        <span class="frac-op">=</span>
                        <span style="flex:1; border-bottom: 2px solid #333;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }

    // Fraction simplify
    if (problem.printFormat === "fraction-simplify" && problem.fractionData) {
        const fd = problem.fractionData;

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px;">
                        ${printPieChartLight(fd.rawNum, fd.rawDenom, 32)}
                    </div>
                    <div class="print-frac-equation">
                        <span style="font-weight: 600;">Simplify:</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.rawNum}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.rawDenom}</span>
                        </div>
                        <span style="font-size: 1.3rem; margin: 0 6px;">→</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator" style="border: 2px solid #333; border-radius: 3px; min-width: 30px; display: inline-block;">&nbsp;</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator" style="border: 2px solid #333; border-radius: 3px; min-width: 30px; display: inline-block;">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Improper fraction to mixed number
    if (problem.printFormat === "improper-to-mixed" && problem.fractionData) {
        const fd = problem.fractionData;

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px; display: flex; gap: 3px; flex-wrap: wrap; max-width: 140px;">
                        ${printFractionCirclesLight(fd.totalNum, fd.den, 28)}
                    </div>
                    <div class="print-frac-equation">
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.totalNum}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.den}</span>
                        </div>
                        <span style="font-size: 1.3rem; margin: 0 6px;">=</span>
                        <span style="min-width:22px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;text-align:center;">&nbsp;</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator" style="border: 2px solid #333; border-radius: 3px; min-width: 22px; display: inline-block;">&nbsp;</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.den}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Mixed number to improper fraction
    if (problem.printFormat === "mixed-to-improper" && problem.fractionData) {
        const fd = problem.fractionData;
        const totalNum = fd.totalNum || (fd.wholes * fd.den + fd.extraNum);

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px; display: flex; gap: 3px; flex-wrap: wrap; max-width: 140px;">
                        ${printFractionCirclesLight(totalNum, fd.den, 28)}
                    </div>
                    <div class="print-frac-equation">
                        <span style="font-size: 1.2rem; font-weight: 700; margin: 0 3px;">${fd.wholes}</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.extraNum}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.den}</span>
                        </div>
                        <span style="font-size: 1.3rem; margin: 0 6px;">=</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator" style="border: 2px solid #333; border-radius: 3px; min-width: 30px; display: inline-block;">&nbsp;</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.den}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Mixed ↔ Improper Visual (dual answer: mixed number AND improper fraction)
    if (problem.printFormat === "mixed-improper-visual") {
        const fd = problem.fractionData || {};
        const den = fd.den || 4;
        const wholes = fd.wholes || 1;
        const extraNum = fd.extraNum || 1;
        const totalNum = fd.totalNum || (wholes * den + extraNum);

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px; display: flex; gap: 3px; flex-wrap: wrap; max-width: 160px;">
                        ${printFractionCirclesLight(totalNum, den, 28)}
                    </div>
                    <div style="font-size:0.95rem;margin-bottom:8px;">Write as a mixed number <strong>and</strong> an improper fraction:</div>
                    <div class="print-frac-equation" style="gap:10px;">
                        <span style="font-weight:600;font-size:0.85rem;">Mixed:</span>
                        <span style="min-width:22px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;text-align:center;">&nbsp;</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator" style="border: 2px solid #333; border-radius: 3px; min-width: 22px; display: inline-block;">&nbsp;</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator" style="border: 2px solid #333; border-radius: 3px; min-width: 22px; display: inline-block;">&nbsp;</span>
                        </div>
                        <span style="font-size: 1.3rem; margin: 0 6px;">=</span>
                        <span style="font-weight:600;font-size:0.85rem;">Improper:</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator" style="border: 2px solid #333; border-radius: 3px; min-width: 30px; display: inline-block;">&nbsp;</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator" style="border: 2px solid #333; border-radius: 3px; min-width: 30px; display: inline-block;">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Fraction compare
    if (problem.printFormat === "fraction-compare" && problem.fractionData) {
        const fd = problem.fractionData;

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="print-frac-equation" style="gap: 8px;">
                        ${printPieChartLight(fd.num1, fd.denom1, 32, PASTEL_COLORS.purple.fill)}
                        <div class="fraction-display">
                            <span class="numerator">${fd.num1}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom1}</span>
                        </div>
                        <span style="min-width:30px;min-height:24px;border:2px solid #333;border-radius:3px;display:inline-block;text-align:center;font-size:1.2rem;">&nbsp;</span>
                        <div class="fraction-display">
                            <span class="numerator">${fd.num2}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom2}</span>
                        </div>
                        ${printPieChartLight(fd.num2, fd.denom2, 32, PASTEL_COLORS.blue.fill)}
                    </div>
                    <div style="margin-top: 6px; font-size: 0.85rem; color: #555;">Circle: &gt; , &lt; , or =</div>
                </div>
            </div>`;
    }
    
    // Unlike denominator fraction operations - compact bar model
    if (problem.printFormat === "fraction-unlike-op" && problem.fractionData) {
        const fd = problem.fractionData;

        // Safety check for valid fraction data
        if (!fd.denom1 || !fd.denom2 || fd.denom1 < 1 || fd.denom2 < 1 || fd.denom1 > 20 || fd.denom2 > 20) {
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div style="display:flex;align-items:center;gap:8px;font-size:1.1rem;">
                            <span>${fd.num1 || '?'}/${fd.denom1 || '?'}</span>
                            <span>${fd.op || '+'}</span>
                            <span>${fd.num2 || '?'}/${fd.denom2 || '?'}</span>
                            <span>=</span>
                            <span style="border-bottom:2px solid #333;min-width:60px;">&nbsp;</span>
                        </div>
                    </div>
                </div>`;
        }

        // Compact bar model for unlike denominators
        const makeCompactBarUnlike = (numVal, denVal, fillColor) => {
            const safeNum = Math.max(0, Math.min(numVal || 0, 20));
            const safeDen = Math.max(1, Math.min(denVal || 1, 12));
            const segW = Math.min(28, Math.floor(180 / safeDen));
            let segments = '';
            for (let i = 0; i < safeDen; i++) {
                segments += `<div style="width:${segW}px;height:22px;background:${i < safeNum ? fillColor : '#fff'};border:1.5px solid #555;${i > 0 ? 'border-left:none;' : ''}"></div>`;
            }
            return `<div style="display:flex;max-width:180px;">${segments}</div>`;
        };

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        ${makeCompactBarUnlike(fd.num1, fd.denom1, '#d4e5f7')}
                        <span style="font-size:0.8rem;font-weight:600;color:#555;">${fd.num1}/${fd.denom1}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-weight:700;font-size:1rem;width:14px;">${fd.op}</span>
                        ${makeCompactBarUnlike(fd.num2, fd.denom2, '#f5d4e8')}
                        <span style="font-size:0.8rem;font-weight:600;color:#555;">${fd.num2}/${fd.denom2}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;font-size:1.1rem;margin-bottom:6px;">
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.num1}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom1}</span>
                        </div>
                        <span style="font-weight:700;">${fd.op}</span>
                        <div class="fraction-display fraction-display-lg">
                            <span class="numerator">${fd.num2}</span>
                            <div class="fraction-bar"></div>
                            <span class="denominator">${fd.denom2}</span>
                        </div>
                        <span style="font-weight:700;">=</span>
                        <span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;margin:0 4px;"><span style="min-width:30px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span><span style="width:100%;height:2px;background:#333;margin:2px 0;"></span><span style="min-width:30px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span></span>
                    </div>
                    <div style="font-size:0.85rem;color:#555;padding:4px 8px;border:1.5px solid #ccc;border-radius:4px;display:inline-block;">
                        LCD = ${fd.lcd} &rarr;
                        <span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-size:0.9rem;">
                            <span style="border-bottom:2px dashed #333;min-width:18px;">&nbsp;</span>
                            <span>${fd.lcd}</span>
                        </span>
                        ${fd.op}
                        <span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-size:0.9rem;">
                            <span style="border-bottom:2px dashed #333;min-width:18px;">&nbsp;</span>
                            <span>${fd.lcd}</span>
                        </span>
                    </div>
                </div>
            </div>`;
    }
    
    // Function table
    if ((problem.printFormat === "function-table-easy" || problem.printFormat === "function-table-hard") && problem.tableData) {
        const td = problem.tableData;
        // Handle both old format (single missingIdx) and new format (missingIndices array)
        const missingSet = new Set(td.missingIndices || [td.missingIdx]);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px; font-weight: 600;">Find the rule and complete the table:</div>
                    <table style="border-collapse: collapse; font-size: 1.1rem;">
                        <tr>
                            <td style="border: 2px solid #333; padding: 10px 12px; font-weight: bold; background: #e8e8e8; text-align: center;">IN</td>
                            ${td.inputs.map(i => `<td style="border: 2px solid #333; padding: 10px 15px; text-align: center; min-width: 45px;">${i}</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="border: 2px solid #333; padding: 10px 12px; font-weight: bold; background: #e8e8e8; text-align: center;">OUT</td>
                            ${td.outputs.map((o, i) => `<td style="border: 2px solid #333; padding: 10px 15px; text-align: center; min-width: 45px; ${missingSet.has(i) ? 'background: #f9f9f9;' : ''}">${missingSet.has(i) ? '' : o}</td>`).join('')}
                        </tr>
                    </table>
                    <div style="margin-top: 8px; font-size: 0.9rem; color: #666;">Rule: ________________</div>
                </div>
            </div>`;
    }
    
    // Pattern sequence with multiple blanks
    if (problem.printFormat === "pattern-sequence" && problem.patternData) {
        const pd = problem.patternData;
        const missingSet = new Set(pd.missingIndices || []);
        
        // Determine box width based on largest number in sequence
        const maxNum = Math.max(...pd.sequence.filter(s => s !== "___").map(n => Math.abs(n)));
        const boxWidth = Math.max(50, maxNum.toString().length * 14 + 20);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 10px; font-weight: 600;">${problem.text.split(":")[0]}:</div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        ${pd.sequence.map((val, i) => {
                            if (val === "___" || missingSet.has(i)) {
                                return `<span style="display: inline-block; min-width: ${boxWidth}px; padding: 8px 12px; border: 2px dashed #666; border-radius: 6px; text-align: center; background: #f9f9f9;">&nbsp;</span>`;
                            } else {
                                return `<span style="display: inline-block; min-width: ${boxWidth}px; padding: 8px 12px; border: 2px solid #333; border-radius: 6px; text-align: center; font-weight: bold;">${val}</span>`;
                            }
                        }).join('<span style="color: #999;">,</span>')}
                    </div>
                </div>
            </div>`;
    }
    
    // Count-By Fill-In pattern
    if (problem.printFormat === "pattern-count-by-fill" && problem.patternData) {
        const pd = problem.patternData;
        const countBy = pd.countBy || 2;
        const sequence = pd.sequence || [];
        
        // Determine box width based on largest number
        const maxNum = Math.max(...sequence.map(s => s.value));
        const boxWidth = Math.max(40, maxNum.toString().length * 12 + 16);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:12px;">Count by ${countBy}s - Fill in the missing numbers:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                        ${sequence.map(s => s.shown 
                            ? `<span style="display:inline-block;min-width:${boxWidth}px;padding:8px 10px;border:2px solid #2196f3;border-radius:6px;text-align:center;font-weight:700;background:#e3f2fd;color:#1565c0;">${s.value}</span>`
                            : `<span style="display:inline-block;min-width:${boxWidth}px;padding:8px 10px;border:2px dashed #ff9800;border-radius:6px;text-align:center;background:#fff8e1;">&nbsp;</span>`
                        ).join('')}
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:#666;">Pattern: +${countBy} each time</div>
                </div>
            </div>`;
    }
    
    // Decimal addition/subtraction column format
    if ((problem.printFormat === "decimal-column-add" || problem.printFormat === "decimal-column-sub") && problem.decimalData) {
        const dd = problem.decimalData;
        const a = dd.a;
        const b = dd.b;
        const op = dd.op;
        const places = dd.places;
        
        // Find decimal position and align
        const aStr = a.toString();
        const bStr = b.toString();
        const aDecPos = aStr.indexOf('.');
        const bDecPos = bStr.indexOf('.');
        
        // Pad to align decimal points
        const maxIntLen = Math.max(aDecPos, bDecPos);
        const maxDecLen = Math.max(aStr.length - aDecPos - 1, bStr.length - bDecPos - 1);
        const totalLen = maxIntLen + 1 + maxDecLen + 1; // +1 for decimal, +1 for potential carry
        
        const boxWidth = 26;
        const boxGap = 3;
        
        // Create boxes
        const carryBoxes = Array.from({length: totalLen}, () => 
            `<div style="width:${boxWidth}px;height:20px;border:1.5px dashed #aaa;border-radius:3px;"></div>`
        ).join('');
        
        const answerBoxes = Array.from({length: totalLen}, (_, i) => {
            // Mark decimal position
            const decimalPos = maxIntLen;
            if (i === decimalPos) {
                return `<div style="width:12px;font-weight:700;font-size:1.5rem;text-align:center;">.</div>`;
            }
            return `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`;
        }).join('');
        
        // Format numbers with aligned decimals
        const formatNum = (num) => {
            const str = num.toString();
            const decPos = str.indexOf('.');
            const intPart = str.slice(0, decPos).padStart(maxIntLen, ' ');
            const decPart = str.slice(decPos + 1).padEnd(maxDecLen, '0');
            return intPart + '.' + decPart;
        };
        
        const aFormatted = formatNum(a);
        const bFormatted = formatNum(b);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:inline-flex;flex-direction:column;align-items:flex-end;gap:${boxGap}px;font-family:'Courier New',monospace;">
                        <!-- Carry/borrow boxes -->
                        <div style="display:flex;gap:${boxGap}px;font-size:0.8rem;">${carryBoxes}</div>
                        <!-- First number -->
                        <div style="display:flex;gap:${boxGap}px;font-size:1.2rem;font-weight:700;">${aFormatted.split('').map(c => `<div style="width:${c === '.' ? 12 : boxWidth}px;text-align:center;">${c === ' ' ? '&nbsp;' : c}</div>`).join('')}</div>
                        <!-- Operator and second number -->
                        <div style="display:flex;gap:${boxGap}px;align-items:center;">
                            <span style="font-weight:700;font-size:1.3rem;margin-right:4px;">${op}</span>
                            <div style="display:flex;gap:${boxGap}px;font-size:1.2rem;font-weight:700;">${bFormatted.split('').map(c => `<div style="width:${c === '.' ? 12 : boxWidth}px;text-align:center;">${c === ' ' ? '&nbsp;' : c}</div>`).join('')}</div>
                        </div>
                        <!-- Line -->
                        <div style="width:100%;border-bottom:3px solid #444;margin:4px 0;"></div>
                        <!-- Answer boxes with decimal -->
                        <div style="display:flex;gap:${boxGap}px;align-items:center;">${answerBoxes}</div>
                    </div>
                    <div style="margin-top:8px;font-size:0.85rem;border:1px solid #ccc;padding:4px 8px;border-radius:4px;font-style:italic;">Tip: Line up the decimal points!</div>
                </div>
            </div>`;
    }
    
    // Decimal multiplication format
    if (problem.printFormat === "decimal-mult" && problem.decimalData) {
        const dd = problem.decimalData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.3rem;font-weight:600;margin-bottom:8px;">${dd.a} × ${dd.b} = ________</div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;font-size:0.9rem;">
                        <div style="margin-bottom:5px;">Step 1: Multiply as whole numbers</div>
                        <div style="margin-bottom:5px;">Step 2: Count decimal places: <span style="border-bottom:1px solid #333;padding:0 10px;">___</span></div>
                        <div>Step 3: Place decimal in answer</div>
                    </div>
                </div>
            </div>`;
    }
    
    // Decimal division format
    if (problem.printFormat === "decimal-div" && problem.decimalData) {
        const dd = problem.decimalData;
        const dividendStr = dd.dividend.toString();
        const quotientLen = dd.quotient.toString().length + 1;
        const boxWidth = 26;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:flex-start;gap:5px;font-family:'Courier New',monospace;">
                        <div style="font-size:1.3rem;font-weight:700;padding-top:25px;">${dd.divisor}</div>
                        <div style="border-left:2.5px solid #333;border-top:2.5px solid #333;padding:5px 10px;border-radius:0 8px 0 0;">
                            <!-- Quotient boxes -->
                            <div style="display:flex;gap:3px;margin-bottom:5px;">
                                ${Array(quotientLen).fill(0).map(() => `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`).join('')}
                            </div>
                            <!-- Dividend -->
                            <div style="font-size:1.3rem;font-weight:700;letter-spacing:3px;">${dividendStr}</div>
                        </div>
                    </div>
                    <div style="margin-top:10px;border-top:1px dashed #ccc;padding-top:8px;">
                        <div style="font-size:0.85rem;color:#666;">Work space:</div>
                        <div style="height:60px;border:1px solid #ddd;border-radius:4px;margin-top:5px;"></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Decimal compare format
    if (problem.printFormat === "decimal-compare" && problem.decimalData) {
        const dd = problem.decimalData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:15px;font-size:1.4rem;font-weight:600;">
                        <span>${dd.a}</span>
                        <span style="width:50px;height:40px;border:2px solid #333;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;"></span>
                        <span>${dd.b}</span>
                    </div>
                    <div style="margin-top:8px;font-size:0.9rem;color:#666;">Circle: &gt; &nbsp; &lt; &nbsp; =</div>
                </div>
            </div>`;
    }
    
    // Decimal order format
    if (problem.printFormat === "decimal-order" && problem.decimalData) {
        const dd = problem.decimalData;
        const direction = dd.direction === "asc" ? "least to greatest" : "greatest to least";
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom:8px;font-weight:600;">Order from ${direction}:</div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                        ${dd.nums.map(n => `<span style="padding:8px 14px;border:2px solid #333;border-radius:8px;font-weight:600;">${n}</span>`).join('')}
                    </div>
                    <div style="display:flex;align-items:baseline;gap:6px;">
                        ${dd.nums.map((_, i) => `<span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>${i < dd.nums.length - 1 ? `<span style="font-size:1.2rem;">${dd.direction === 'asc' ? '<' : '>'}</span>` : ''}`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Decimal number line format
    if (problem.printFormat === "decimal-number-line" && problem.decimalData) {
        const dd = problem.decimalData;
        const tickPos = ((dd.target - dd.wholeStart) / (dd.wholeEnd - dd.wholeStart)) * 100;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom:10px;font-weight:600;">What decimal is shown?</div>
                    <svg width="280" height="60" viewBox="0 0 280 60" style="max-width:100%;">
                        <!-- Main line -->
                        <line x1="20" y1="30" x2="260" y2="30" stroke="#333" stroke-width="2"/>
                        <!-- End ticks -->
                        <line x1="20" y1="20" x2="20" y2="40" stroke="#333" stroke-width="2"/>
                        <line x1="260" y1="20" x2="260" y2="40" stroke="#333" stroke-width="2"/>
                        <!-- Tenth ticks -->
                        ${Array(11).fill(0).map((_, i) => `<line x1="${20 + i * 24}" y1="25" x2="${20 + i * 24}" y2="35" stroke="#333" stroke-width="1"/>`).join('')}
                        <!-- Labels -->
                        <text x="20" y="55" text-anchor="middle" font-size="12">${dd.wholeStart}</text>
                        <text x="260" y="55" text-anchor="middle" font-size="12">${dd.wholeEnd}</text>
                        <!-- Arrow -->
                        <polygon points="${20 + tickPos * 2.4 - 6},12 ${20 + tickPos * 2.4 + 6},12 ${20 + tickPos * 2.4},22" fill="#333"/>
                    </svg>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }

    // Estimation formats with two-step workspace
    if (problem.printFormat && problem.printFormat.startsWith("estimation-") && problem.estimationData) {
        const ed = problem.estimationData;
        const strategyLabel = {
            'rounding': `Round to nearest ${ed.roundTo}`,
            'compatible': 'Find compatible numbers',
            'frontend': 'Use front-end digits'
        }[ed.strategy] || 'Estimate';
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content" style="max-width:100%;">
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;">${ed.a} ${ed.op} ${ed.b}</div>
                    
                    <!-- Green estimation box only - constrained width -->
                    <div style="background:#e8f5e9;border:2px solid #4caf50;border-radius:8px;padding:12px;max-width:300px;">
                        <div style="font-weight:600;color:#2e7d32;margin-bottom:8px;font-size:0.9rem;">📏 Estimate (${strategyLabel})</div>
                        <div style="display:flex;gap:15px;align-items:center;margin-bottom:10px;font-size:1rem;flex-wrap:wrap;">
                            <div>${ed.a} → <span style="border-bottom:2px dashed #4caf50;min-width:60px;display:inline-block;">&nbsp;</span></div>
                            <div>${ed.b} → <span style="border-bottom:2px dashed #4caf50;min-width:60px;display:inline-block;">&nbsp;</span></div>
                        </div>
                        <div style="font-weight:600;font-size:1rem;">Est: <span style="border:2px solid #4caf50;border-radius:4px;padding:4px 15px;min-width:90px;display:inline-block;background:white;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // ============================================
    // INTEGERS PRINT FORMATS
    // ============================================
    
    // Integer number line
    if (problem.printFormat === "integer-number-line" && problem.integerData) {
        const id = problem.integerData;
        const target = id.target;
        const minVal = Math.min(-10, target - 3);
        const maxVal = Math.max(10, target + 3);
        const range = maxVal - minVal;
        const tickPos = ((target - minVal) / range) * 100;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom:10px;font-weight:600;">What integer is shown?</div>
                    <svg width="300" height="70" viewBox="0 0 300 70" style="max-width:100%;">
                        <!-- Main line -->
                        <line x1="20" y1="35" x2="280" y2="35" stroke="#333" stroke-width="2"/>
                        <!-- Zero marker (thicker) -->
                        <line x1="${20 + ((-minVal) / range) * 260}" y1="20" x2="${20 + ((-minVal) / range) * 260}" y2="50" stroke="#333" stroke-width="3"/>
                        <!-- Tick marks -->
                        ${Array(range + 1).fill(0).map((_, i) => {
                            const val = minVal + i;
                            const x = 20 + (i / range) * 260;
                            const isZero = val === 0;
                            return `<line x1="${x}" y1="${isZero ? 20 : 28}" x2="${x}" y2="${isZero ? 50 : 42}" stroke="#333" stroke-width="${isZero ? 2 : 1}"/>
                                    ${(val % 5 === 0 || isZero) ? `<text x="${x}" y="62" text-anchor="middle" font-size="10">${val}</text>` : ''}`;
                        }).join('')}
                        <!-- Arrow -->
                        <polygon points="${20 + tickPos * 2.6 - 6},12 ${20 + tickPos * 2.6 + 6},12 ${20 + tickPos * 2.6},22" fill="#e53935"/>
                    </svg>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Integer compare
    if (problem.printFormat === "integer-compare" && problem.integerData) {
        const id = problem.integerData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:15px;font-size:1.4rem;font-weight:600;">
                        <span style="color:${id.a < 0 ? '#e53935' : '#333'};">${id.a}</span>
                        <span style="width:50px;height:40px;border:2px solid #333;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;"></span>
                        <span style="color:${id.b < 0 ? '#e53935' : '#333'};">${id.b}</span>
                    </div>
                    <div style="margin-top:8px;font-size:0.9rem;color:#666;">Circle: &gt; &nbsp; &lt; &nbsp; =</div>
                </div>
            </div>`;
    }
    
    // Integer add/subtract with number line
    if ((problem.printFormat === "integer-add" || problem.printFormat === "integer-sub") && problem.integerData) {
        const id = problem.integerData;
        const op = id.op === '+' ? '+' : '−';
        
        // Calculate number line range based on the actual numbers in the problem
        const allNums = [id.a, id.b, id.op === '+' ? id.a + id.b : id.a - id.b];
        const minVal = Math.min(...allNums);
        const maxVal = Math.max(...allNums);
        
        // Create a range that comfortably includes all values
        const buffer = 3;
        let lineMin = Math.min(minVal - buffer, -5);
        let lineMax = Math.max(maxVal + buffer, 5);
        
        // Ensure we have at least 10 tick marks and always include 0
        if (lineMin > 0) lineMin = 0;
        if (lineMax < 0) lineMax = 0;
        
        // Round to nice numbers
        lineMin = Math.floor(lineMin / 5) * 5;
        lineMax = Math.ceil(lineMax / 5) * 5;
        
        const range = lineMax - lineMin;
        const numTicks = Math.min(range + 1, 25); // At most 25 ticks
        const tickStep = Math.max(1, Math.ceil(range / 24));
        
        // Build tick marks
        const ticks = [];
        for (let val = lineMin; val <= lineMax; val += tickStep) {
            ticks.push(val);
        }
        
        const tickSpacing = 260 / (ticks.length - 1);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:baseline;gap:8px;font-size:1.4rem;font-weight:700;margin-bottom:12px;">
                        <span style="color:${id.a < 0 ? '#e53935' : '#333'};">${id.a < 0 ? '(' + id.a + ')' : id.a}</span>
                        <span>${op}</span>
                        <span style="color:${id.b < 0 ? '#e53935' : '#333'};">${id.b < 0 ? '(' + id.b + ')' : id.b}</span>
                        <span>=</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                    </div>
                    <!-- Number line for work - range adjusted to include problem values -->
                    <svg width="300" height="50" viewBox="0 0 300 50" style="max-width:100%;">
                        <line x1="15" y1="25" x2="285" y2="25" stroke="#333" stroke-width="2"/>
                        <!-- Arrowheads -->
                        <polygon points="285,25 278,21 278,29" fill="#333"/>
                        <polygon points="15,25 22,21 22,29" fill="#333"/>
                        ${ticks.map((val, i) => {
                            const x = 20 + i * tickSpacing;
                            const isZero = val === 0;
                            const labelEvery = tickStep >= 3 ? 1 : (tickStep >= 2 ? 2 : 5);
                            const showLabel = val === lineMin || val === lineMax || isZero || i % labelEvery === 0;
                            return `<line x1="${x}" y1="20" x2="${x}" y2="30" stroke="#333" stroke-width="${isZero ? 2 : 1}"/>
                                    ${showLabel ? `<text x="${x}" y="45" text-anchor="middle" font-size="9" font-weight="${isZero ? 'bold' : 'normal'}">${val}</text>` : ''}`;
                        }).join('')}
                    </svg>
                </div>
            </div>`;
    }
    
    // ============================================
    // ALGEBRA PRINT FORMATS
    // ============================================
    
    // Algebra solve for unknown
    if (problem.printFormat === "algebra-solve" && problem.algebraData) {
        const ad = problem.algebraData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:12px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
                        <span style="font-style:italic;color:#1565c0;">x</span> ${ad.op} ${ad.known} = ${ad.total}
                    </div>
                    <!-- Balance scale visual -->
                    <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-bottom:10px;">
                        <div style="font-weight:600;color:#1565c0;margin-bottom:8px;">⚖️ Balance Scale</div>
                        <div style="display:flex;justify-content:space-around;align-items:center;">
                            <div style="text-align:center;padding:10px 20px;border:2px solid #1565c0;border-radius:8px;background:white;">
                                <span style="font-style:italic;color:#1565c0;">x</span> ${ad.op} ${ad.known}
                            </div>
                            <span style="font-size:1.5rem;">=</span>
                            <div style="text-align:center;padding:10px 20px;border:2px solid #1565c0;border-radius:8px;background:white;">
                                ${ad.total}
                            </div>
                        </div>
                    </div>
                    <div style="font-weight:600;">Step 1: Use inverse operation</div>
                    <div style="margin:8px 0;padding:8px;border:1px dashed #999;border-radius:4px;min-height:30px;"></div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:8px;"><span style="white-space:nowrap;"><span style="font-style:italic;">x</span> =</span><span style="flex:1;border-bottom:2px solid #1565c0;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Algebra write expression
    if (problem.printFormat === "algebra-write" && problem.algebraData) {
        const ad = problem.algebraData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.1rem;margin-bottom:12px;">${ad.template}</div>
                    <div style="background:#e3f2fd;padding:10px;border-radius:8px;margin-bottom:10px;">
                        <div style="font-weight:600;color:#1565c0;margin-bottom:5px;">📝 Key Words</div>
                        <div style="font-size:0.85rem;display:flex;gap:15px;flex-wrap:wrap;">
                            <span><b>sum</b> → +</span>
                            <span><b>difference</b> → −</span>
                            <span><b>product</b> → ×</span>
                            <span><b>quotient</b> → ÷</span>
                            <span><b>more than</b> → +</span>
                            <span><b>less than</b> → −</span>
                        </div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Expression:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Algebra evaluate expression
    if (problem.printFormat === "algebra-evaluate" && problem.algebraData) {
        const ad = problem.algebraData;
        const vn = ad.varName || 'n';
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">${ad.expression}  at  ${vn} = ${ad.varVal}</div>
                    <div style="margin:8px 0;">
                        <span style="font-weight:600;">Substitute:</span> <span style="border-bottom:1px dashed #999;min-width:180px;display:inline-block;">&nbsp;</span>
                    </div>
                    <div style="margin:8px 0;">
                        <span style="font-weight:600;">Calculate:</span> <span style="border-bottom:1px dashed #999;min-width:180px;display:inline-block;">&nbsp;</span>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:10px;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Algebra inequality
    if (problem.printFormat === "algebra-inequality" && problem.algebraData) {
        const ad = problem.algebraData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;">
                        Is ${ad.testVal} ${ad.symbol} ${ad.boundary} true or false?
                    </div>
                    <!-- Number line -->
                    <svg width="250" height="50" viewBox="0 0 250 50" style="max-width:100%;margin:10px 0;">
                        <line x1="20" y1="25" x2="230" y2="25" stroke="#333" stroke-width="2"/>
                        ${Array(11).fill(0).map((_, i) => {
                            const val = ad.boundary - 5 + i;
                            const x = 20 + i * 21;
                            const isBoundary = val === ad.boundary;
                            return `<line x1="${x}" y1="18" x2="${x}" y2="32" stroke="${isBoundary ? '#e53935' : '#333'}" stroke-width="${isBoundary ? 2 : 1}"/>
                                    <text x="${x}" y="45" text-anchor="middle" font-size="9" fill="${isBoundary ? '#e53935' : '#333'}">${val}</text>`;
                        }).join('')}
                    </svg>
                    <div style="display:flex;gap:20px;margin-top:10px;">
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:20px;height:20px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> True
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:20px;height:20px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> False
                        </label>
                    </div>
                </div>
            </div>`;
    }
    
    // ============================================
    // NEW UNIT 6 PRINT FORMATS
    // ============================================

    // Algebra two-step equations — spacious with work area
    if (problem.printFormat === "algebra-twostep") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:12px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
                        ${problem.text.replace(/^Solve:\s*/, '')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:#fafafa;border-radius:6px;border:1px solid #e0e0e0;">
                        <div style="font-size:0.75rem;font-weight:600;color:#555;margin-bottom:8px;">Show your work:</div>
                        <div style="display:flex;align-items:center;margin-bottom:4px;">
                            <div style="width:55px;color:#888;font-size:0.7rem;font-weight:500;">Step 1:</div>
                            <div style="flex:1;border-bottom:1px solid #ccc;height:26px;background:white;border-radius:2px;"></div>
                        </div>
                        <div style="display:flex;align-items:center;margin-bottom:4px;">
                            <div style="width:55px;color:#888;font-size:0.7rem;font-weight:500;">Step 2:</div>
                            <div style="flex:1;border-bottom:1px solid #ccc;height:26px;background:white;border-radius:2px;"></div>
                        </div>
                        <div style="display:flex;align-items:center;margin-bottom:4px;">
                            <div style="width:55px;color:#888;font-size:0.7rem;font-weight:500;">Step 3:</div>
                            <div style="flex:1;border-bottom:1px solid #ccc;height:26px;background:white;border-radius:2px;"></div>
                        </div>
                        <div style="display:flex;align-items:center;margin-top:8px;padding-top:6px;border-top:1px dashed #999;">
                            <div style="font-weight:700;color:#333;font-size:0.8rem;">Answer:</div>
                            <div style="flex:1;margin-left:10px;border:2px solid #555;height:28px;background:#fff;border-radius:4px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Algebra write equation from words — spacious with equation blank
    if (problem.printFormat === "algebra-write-eq") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;margin-bottom:12px;line-height:1.5;">${problem.text}</div>
                    <div style="background:#e3f2fd;padding:10px;border-radius:8px;margin-bottom:12px;">
                        <div style="font-weight:600;color:#1565c0;margin-bottom:5px;">Key Words</div>
                        <div style="font-size:0.8rem;display:flex;gap:12px;flex-wrap:wrap;">
                            <span><b>plus/more</b> → +</span>
                            <span><b>minus/less</b> → −</span>
                            <span><b>times/twice</b> → ×</span>
                            <span><b>divided</b> → ÷</span>
                            <span><b>is/equals</b> → =</span>
                        </div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:8px;">
                        <span style="white-space:nowrap;">Equation:</span>
                        <span style="flex:1;border-bottom:2px solid #333;min-height:28px;">&nbsp;</span>
                    </div>
                    <div style="margin-top:12px;padding:8px;border:1px dashed #999;border-radius:4px;min-height:40px;">
                        <div style="font-size:0.7rem;color:#888;margin-bottom:4px;">Work space:</div>
                    </div>
                </div>
            </div>`;
    }

    // Fraction ordering — show fractions with blanks to fill order
    if (problem.printFormat === "fraction-order") {
        const items = problem.orderItems || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:12px 0;">
                        ${items.map(f => `<div style="padding:8px 14px;border:2px solid #1565c0;border-radius:8px;font-size:1.2rem;font-weight:600;">${f}</div>`).join('')}
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;justify-content:center;margin-top:12px;">
                        ${items.map((_, i) => `<span style="display:inline-block;width:55px;border-bottom:2px solid #333;text-align:center;height:28px;">&nbsp;</span>${i < items.length - 1 ? '<span style="font-size:1rem;color:#888;"> , </span>' : ''}`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // Fractions on number line — show SVG number line with letters
    if (problem.printFormat === "fraction-numline-order" && problem.visual) {
        const cleanVis = (problem.visual || '').replace(/<div[^>]*color:\s*var\(--accent-purple\)[^>]*>.*?<\/div>/gi, '');
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1rem;margin-bottom:8px;">${problem.text}</div>
                    ${cleanVis}
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:10px;">
                        <span>Answer:</span>
                        <span style="display:inline-block;min-width:60px;border-bottom:2px solid #333;height:24px;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }

    // Benchmark fractions — MC with benchmarks
    if (problem.printFormat === "fraction-benchmark") {
        const opts = problem.options || ["0", "1/4", "1/2", "3/4", "1"];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                        ${opts.map(o => `<label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span>
                            <span style="font-size:1.1rem;font-weight:600;">${o}</span>
                        </label>`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // Compare fractions with LCD — show conversion work area
    if (problem.printFormat === "fraction-compare-lcd") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.1rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="background:#fafafa;padding:10px;border-radius:6px;border:1px solid #e0e0e0;margin:8px 0;">
                        <div style="font-size:0.75rem;color:#555;margin-bottom:6px;">Find the LCD and convert:</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">LCD =</span>
                            <span style="display:inline-block;width:40px;border-bottom:1px solid #999;height:20px;">&nbsp;</span>
                        </div>
                        <div style="border-bottom:1px solid #ccc;height:24px;margin-bottom:4px;"></div>
                        <div style="border-bottom:1px solid #ccc;height:24px;"></div>
                    </div>
                    <div style="display:flex;gap:15px;margin-top:8px;">
                        ${[">", "<", "="].map(s => `<label style="display:flex;align-items:center;gap:5px;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span>
                            <span style="font-size:1.3rem;font-weight:700;">${s}</span>
                        </label>`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // Round fractions — MC
    if (problem.printFormat === "fraction-round") {
        const opts = problem.options || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                        ${opts.map(o => `<label style="display:flex;align-items:center;gap:5px;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span>
                            <span style="font-size:1.1rem;font-weight:600;">${o}</span>
                        </label>`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // Estimate fraction operations — MC
    if (problem.printFormat === "fraction-estimate") {
        const opts = problem.options || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="background:#fafafa;padding:8px;border-radius:6px;margin:8px 0;border:1px solid #e0e0e0;">
                        <div style="font-size:0.75rem;color:#555;margin-bottom:4px;">Round each fraction to a benchmark (0, 1/2, or 1):</div>
                        <div style="border-bottom:1px solid #ccc;height:24px;margin-bottom:4px;"></div>
                        <div style="border-bottom:1px solid #ccc;height:24px;"></div>
                    </div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                        ${opts.map(o => `<label style="display:flex;align-items:center;gap:5px;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span>
                            <span style="font-size:1.1rem;">${o}</span>
                        </label>`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // Percent grid — 10x10 grid with answer blank
    if (problem.printFormat === "percent-grid" && problem.visual) {
        const cleanVis2 = (problem.visual || '').replace(/<div[^>]*color:\s*var\(--accent-purple\)[^>]*>.*?<\/div>/gi, '');
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1rem;margin-bottom:8px;">${problem.text}</div>
                    ${cleanVis2}
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:10px;">
                        <span>Answer:</span>
                        <span style="display:inline-block;min-width:80px;border-bottom:2px solid #333;height:24px;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }

    // Percent of a number — with bar model
    if (problem.printFormat === "percent-of") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.1rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="background:#fafafa;padding:8px;border-radius:6px;margin:8px 0;border:1px solid #e0e0e0;">
                        <div style="font-size:0.75rem;color:#555;margin-bottom:4px;">Show your work:</div>
                        <div style="border-bottom:1px solid #ccc;height:24px;margin-bottom:4px;"></div>
                        <div style="border-bottom:1px solid #ccc;height:24px;"></div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:8px;">
                        <span>Answer:</span>
                        <span style="display:inline-block;min-width:80px;border-bottom:2px solid #333;height:24px;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }

    // Find whole from percent
    if (problem.printFormat === "percent-find-whole") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.1rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="background:#fafafa;padding:8px;border-radius:6px;margin:8px 0;border:1px solid #e0e0e0;">
                        <div style="font-size:0.75rem;color:#555;margin-bottom:4px;">Show your work:</div>
                        <div style="border-bottom:1px solid #ccc;height:24px;margin-bottom:4px;"></div>
                        <div style="border-bottom:1px solid #ccc;height:24px;"></div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;margin-top:8px;">
                        <span>Answer:</span>
                        <span style="display:inline-block;min-width:80px;border-bottom:2px solid #333;height:24px;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }

    // Order FDP — show values with ordering blanks
    if (problem.printFormat === "fdp-order") {
        const items = problem.orderItems || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1rem;margin-bottom:10px;">${problem.text}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0;">
                        ${items.map(v => `<div style="padding:8px 14px;border:2px solid #7b1fa2;border-radius:8px;font-size:1.1rem;font-weight:600;">${v}</div>`).join('')}
                    </div>
                    <div style="background:#fafafa;padding:8px;border-radius:6px;margin:8px 0;border:1px solid #e0e0e0;">
                        <div style="font-size:0.7rem;color:#555;margin-bottom:4px;">Convert all to decimals:</div>
                        <div style="border-bottom:1px solid #ccc;height:22px;"></div>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;justify-content:center;margin-top:10px;">
                        ${items.map((_, i) => `<span style="display:inline-block;width:55px;border-bottom:2px solid #333;text-align:center;height:26px;">&nbsp;</span>${i < items.length - 1 ? '<span style="font-size:1rem;color:#888;"> , </span>' : ''}`).join('')}
                    </div>
                </div>
            </div>`;
    }

    // ============================================
    // GEOMETRY PRINT FORMATS
    // ============================================
    
    // Geometry perimeter/area with shape diagrams
    if ((problem.printFormat === "geometry-perimeter" || problem.printFormat === "geometry-area") && problem.geometryData) {
        const gd = problem.geometryData;
        const isPerimeter = problem.printFormat === "geometry-perimeter";
        let shapeHTML = '';
        
        if (gd.shape === 'rectangle') {
            shapeHTML = `
                <svg width="150" height="100" viewBox="0 0 150 100">
                    <rect x="25" y="20" width="100" height="60" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="75" y="14" text-anchor="middle" font-size="11">${gd.length} units</text>
                    <text x="130" y="55" text-anchor="start" font-size="11">${gd.width}</text>
                </svg>`;
        } else if (gd.shape === 'square') {
            shapeHTML = `
                <svg width="130" height="110" viewBox="0 0 130 110">
                    <rect x="20" y="20" width="80" height="80" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="60" y="14" text-anchor="middle" font-size="12">${gd.side} units</text>
                </svg>`;
        } else if (gd.shape === 'triangle') {
            shapeHTML = `
                <svg width="150" height="110" viewBox="0 0 150 110">
                    <polygon points="75,10 20,90 130,90" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="75" y="105" text-anchor="middle" font-size="11">base: ${gd.base} units</text>
                    <line x1="75" y1="10" x2="75" y2="90" stroke="#999" stroke-width="1" stroke-dasharray="4"/>
                    <text x="85" y="55" font-size="10">h: ${gd.height}</text>
                </svg>`;
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the ${isPerimeter ? 'perimeter' : 'area'}:</div>
                    <div style="display:flex;gap:20px;align-items:flex-start;">
                        ${shapeHTML}
                        <div style="flex:1;">
                            <div style="background:#f5f5f5;padding:8px;border-radius:6px;font-size:0.85rem;margin-bottom:10px;">
                                ${isPerimeter ? '<b>Perimeter</b> = add all sides' : gd.shape === 'triangle' ? '<b>Area</b> = ½ × base × height' : '<b>Area</b> = length × width'}
                            </div>
                            <div style="border:1px dashed #999;padding:10px;border-radius:4px;min-height:40px;margin-bottom:8px;"></div>
                            <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">${isPerimeter ? 'Perimeter' : 'Area'}:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>${isPerimeter ? 'units' : 'sq units'}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry volume
    if (problem.printFormat === "geometry-volume" && problem.geometryData) {
        const gd = problem.geometryData;
        const l = gd.length, w = gd.width, h = gd.height;
        
        // Create a more realistic 3D rectangular prism
        // Scale factors for display
        const scale = 8;
        const lPx = Math.min(l * scale, 80);
        const wPx = Math.min(w * scale * 0.6, 40); // Perspective scaling
        const hPx = Math.min(h * scale, 60);
        
        // Base coordinates
        const x0 = 20, y0 = 90;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Find the volume:</div>
                    <div style="display:flex;gap:25px;align-items:flex-start;flex-wrap:wrap;">
                        <!-- Improved 3D rectangular prism -->
                        <svg width="180" height="130" viewBox="0 0 180 130" style="flex-shrink:0;">
                            <!-- Back face (hidden but adds depth) -->
                            <polygon points="${x0 + wPx},${y0 - hPx - wPx * 0.5} ${x0 + lPx + wPx},${y0 - hPx - wPx * 0.5} ${x0 + lPx + wPx},${y0 - wPx * 0.5} ${x0 + wPx},${y0 - wPx * 0.5}" 
                                     fill="#e8e8e8" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>
                            
                            <!-- Bottom face -->
                            <polygon points="${x0},${y0} ${x0 + lPx},${y0} ${x0 + lPx + wPx},${y0 - wPx * 0.5} ${x0 + wPx},${y0 - wPx * 0.5}" 
                                     fill="#bbdefb" stroke="#333" stroke-width="1.5"/>
                            
                            <!-- Front face -->
                            <rect x="${x0}" y="${y0 - hPx}" width="${lPx}" height="${hPx}" 
                                  fill="#e3f2fd" stroke="#333" stroke-width="2"/>
                            
                            <!-- Right face -->
                            <polygon points="${x0 + lPx},${y0} ${x0 + lPx + wPx},${y0 - wPx * 0.5} ${x0 + lPx + wPx},${y0 - hPx - wPx * 0.5} ${x0 + lPx},${y0 - hPx}" 
                                     fill="#90caf9" stroke="#333" stroke-width="2"/>
                            
                            <!-- Top face -->
                            <polygon points="${x0},${y0 - hPx} ${x0 + lPx},${y0 - hPx} ${x0 + lPx + wPx},${y0 - hPx - wPx * 0.5} ${x0 + wPx},${y0 - hPx - wPx * 0.5}" 
                                     fill="#64b5f6" stroke="#333" stroke-width="2"/>
                            
                            <!-- Dimension labels with lines -->
                            <!-- Length label -->
                            <line x1="${x0}" y1="${y0 + 8}" x2="${x0 + lPx}" y2="${y0 + 8}" stroke="#333" stroke-width="1"/>
                            <line x1="${x0}" y1="${y0 + 5}" x2="${x0}" y2="${y0 + 11}" stroke="#333" stroke-width="1"/>
                            <line x1="${x0 + lPx}" y1="${y0 + 5}" x2="${x0 + lPx}" y2="${y0 + 11}" stroke="#333" stroke-width="1"/>
                            <text x="${x0 + lPx/2}" y="${y0 + 20}" font-size="12" font-weight="bold" text-anchor="middle">${l}</text>
                            
                            <!-- Width label -->
                            <text x="${x0 + lPx + wPx + 8}" y="${y0 - wPx * 0.25}" font-size="12" font-weight="bold">${w}</text>
                            
                            <!-- Height label -->
                            <line x1="${x0 - 8}" y1="${y0}" x2="${x0 - 8}" y2="${y0 - hPx}" stroke="#333" stroke-width="1"/>
                            <line x1="${x0 - 11}" y1="${y0}" x2="${x0 - 5}" y2="${y0}" stroke="#333" stroke-width="1"/>
                            <line x1="${x0 - 11}" y1="${y0 - hPx}" x2="${x0 - 5}" y2="${y0 - hPx}" stroke="#333" stroke-width="1"/>
                            <text x="${x0 - 15}" y="${y0 - hPx/2 + 4}" font-size="12" font-weight="bold" text-anchor="end">${h}</text>
                        </svg>
                        
                        <div style="flex:1;min-width:200px;">
                            <div style="background:#e3f2fd;padding:10px 12px;border-radius:8px;border:2px solid #2196f3;margin-bottom:12px;">
                                <div style="font-weight:700;color:#1565c0;margin-bottom:4px;">Volume Formula</div>
                                <div style="font-size:1rem;">V = length × width × height</div>
                            </div>
                            <div style="margin:10px 0;font-size:1rem;">
                                V = <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;text-align:center;">&nbsp;</span> × 
                                <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;text-align:center;">&nbsp;</span> × 
                                <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;text-align:center;">&nbsp;</span>
                            </div>
                            <div style="border:1px dashed #999;padding:10px;border-radius:6px;min-height:35px;margin-bottom:10px;background:#fafafa;"></div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-weight:700;font-size:1rem;">Volume =</span>
                                <span style="flex:1;border:2px solid #333;border-radius:4px;padding:4px 15px;background:#fff;">&nbsp;</span>
                                <span style="font-weight:600;">cubic units</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Composite Volume — strip formula breakdown, show workspace instead
    if (problem.printFormat === "geometry-volume-composite" && problem.visual) {
        // Strip the formula breakdown div that gives away the answer
        let cleanVis = problem.visual
            .replace(/<div[^>]*>Bottom:.*?<\/div>/gi, '')
            .replace(/<div[^>]*>Total Volume =.*?<\/div>/gi, '');
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the total volume of the composite solid:</div>
                    ${printVisualWrap(cleanVis)}
                    <div style="margin-top:10px;font-size:0.95rem;line-height:2.2;">
                        <div>Prism A: <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> × <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> × <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> = <span style="border-bottom:2px solid #555;min-width:50px;display:inline-block;">&nbsp;</span> cubic units</div>
                        <div>Prism B: <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> × <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> × <span style="border-bottom:2px solid #333;min-width:30px;display:inline-block;">&nbsp;</span> = <span style="border-bottom:2px solid #555;min-width:50px;display:inline-block;">&nbsp;</span> cubic units</div>
                        <div style="margin-top:4px;font-weight:700;">Total Volume = <span style="border-bottom:2px solid #555;min-width:50px;display:inline-block;">&nbsp;</span> + <span style="border-bottom:2px solid #555;min-width:50px;display:inline-block;">&nbsp;</span> = <span style="border-bottom:2.5px solid #333;min-width:60px;display:inline-block;">&nbsp;</span> cubic units</div>
                    </div>
                </div>
            </div>`;
    }

    // Geometry angles
    if (problem.printFormat === "geometry-angle" && problem.geometryData) {
        const gd = problem.geometryData;
        // Draw angle based on type
        const angleRad = (gd.angle * Math.PI) / 180;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Identify this angle:</div>
                    <div style="display:flex;gap:20px;align-items:center;">
                        <svg width="100" height="80" viewBox="0 0 100 80">
                            <line x1="10" y1="60" x2="90" y2="60" stroke="#333" stroke-width="2"/>
                            <line x1="10" y1="60" x2="${10 + 70 * Math.cos(-angleRad)}" y2="${60 + 70 * Math.sin(-angleRad)}" stroke="#333" stroke-width="2"/>
                            <path d="M 30 60 A 20 20 0 0 0 ${10 + 20 * Math.cos(-angleRad)} ${60 + 20 * Math.sin(-angleRad)}" fill="none" stroke="#e53935" stroke-width="2"/>
                            ${gd.angle === 90 ? '<rect x="10" y="50" width="10" height="10" fill="none" stroke="#333" stroke-width="1"/>' : ''}
                        </svg>
                        <div>
                            <div style="background:#f5f5f5;padding:8px;border-radius:6px;font-size:0.85rem;margin-bottom:10px;">
                                <div><b>Acute:</b> less than 90°</div>
                                <div><b>Right:</b> exactly 90°</div>
                                <div><b>Obtuse:</b> more than 90°</div>
                                <div><b>Straight:</b> exactly 180°</div>
                            </div>
                            <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">This angle is:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry measure angle
    if (problem.printFormat === "geometry-measure-angle" && problem.geometryData) {
        const gd = problem.geometryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Estimate this angle (in degrees):</div>
                    <svg width="120" height="90" viewBox="0 0 120 90">
                        <line x1="15" y1="70" x2="105" y2="70" stroke="#333" stroke-width="2"/>
                        <line x1="15" y1="70" x2="${15 + 80 * Math.cos(-(gd.angle * Math.PI) / 180)}" y2="${70 + 80 * Math.sin(-(gd.angle * Math.PI) / 180)}" stroke="#333" stroke-width="2"/>
                        <path d="M 40 70 A 25 25 0 0 0 ${15 + 25 * Math.cos(-(gd.angle * Math.PI) / 180)} ${70 + 25 * Math.sin(-(gd.angle * Math.PI) / 180)}" fill="none" stroke="#1565c0" stroke-width="2"/>
                        <text x="45" y="60" font-size="12" fill="#1565c0">?°</text>
                    </svg>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Angle measure:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>&deg;</span></div>
                </div>
            </div>`;
    }
    
    // Geometry coordinate graphing
    if (problem.printFormat === "geometry-coordinate" && problem.geometryData) {
        const gd = problem.geometryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">${gd.mode === 'plot' ? `Plot the point (${gd.x}, ${gd.y})` : 'Name the coordinates of point A'}:</div>
                    <svg width="240" height="240" viewBox="0 0 240 240">
                        <!-- Grid -->
                        ${Array(11).fill(0).map((_, i) => `
                            <line x1="${25 + i * 19}" y1="25" x2="${25 + i * 19}" y2="215" stroke="#ddd" stroke-width="1"/>
                            <line x1="25" y1="${25 + i * 19}" x2="215" y2="${25 + i * 19}" stroke="#ddd" stroke-width="1"/>
                        `).join('')}
                        <!-- Axes -->
                        <line x1="120" y1="25" x2="120" y2="215" stroke="#333" stroke-width="2"/>
                        <line x1="25" y1="120" x2="215" y2="120" stroke="#333" stroke-width="2"/>
                        <!-- Labels -->
                        <text x="220" y="124" font-size="12">x</text>
                        <text x="124" y="22" font-size="12">y</text>
                        ${[-5,-4,-3,-2,-1,1,2,3,4,5].map(n => `
                            <text x="${120 + n * 19 - 4}" y="134" font-size="11">${n}</text>
                            <text x="${n < 0 ? 96 : 104}" y="${120 - n * 19 + 4}" font-size="11">${n}</text>
                        `).join('')}
                        ${gd.mode === 'identify' ? `<circle cx="${120 + gd.x * 19}" cy="${120 - gd.y * 19}" r="6" fill="#e53935"/>
                            <text x="${126 + gd.x * 19}" y="${114 - gd.y * 19}" font-size="12" fill="#e53935">A</text>` : ''}
                    </svg>
                    ${gd.mode === 'identify' ? `<div style="margin-top:8px;">Coordinates: ( <span style="border-bottom:1px solid #333;min-width:25px;display:inline-block;">&nbsp;</span> , <span style="border-bottom:1px solid #333;min-width:25px;display:inline-block;">&nbsp;</span> )</div>` : ''}
                </div>
            </div>`;
    }
    
    // Also handle geometry-coordinates (alternative naming)
    if (problem.printFormat === "geometry-coordinates" && problem.geometryData) {
        const gd = problem.geometryData;
        const points = gd.points || [{ x: gd.x || 0, y: gd.y || 0, label: 'A' }];
        const quadrantMode = gd.quadrantMode || 'all_quadrants';
        const problemType = gd.problemType || gd.mode || 'identify';
        
        // Grid setup - larger for readability
        const gridSize = quadrantMode === 'quadrant1' ? 260 : 280;
        const gridSpacing = quadrantMode === 'quadrant1' ? 22 : 24;
        const padding = 15;
        const origin = quadrantMode === 'quadrant1' 
            ? { x: padding, y: gridSize - padding - 4 } 
            : { x: gridSize / 2, y: gridSize / 2 };
        
        // Build grid lines
        let gridLines = '';
        let axisLabels = '';
        
        if (quadrantMode === 'quadrant1') {
            for (let i = 0; i <= 10; i++) {
                gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="${padding - 4}" x2="${origin.x + i * gridSpacing}" y2="${gridSize - padding + 4}" stroke="#ddd" stroke-width="1"/>`;
                gridLines += `<line x1="${padding - 4}" y1="${origin.y - i * gridSpacing}" x2="${gridSize - padding + 4}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                if (i % 2 === 0) {
                    axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 14}" text-anchor="middle" font-size="11">${i}</text>`;
                    if (i > 0) axisLabels += `<text x="${origin.x - 10}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" font-size="11">${i}</text>`;
                }
            }
        } else {
            for (let i = -5; i <= 5; i++) {
                gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="${padding - 4}" x2="${origin.x + i * gridSpacing}" y2="${gridSize - padding + 4}" stroke="#ddd" stroke-width="1"/>`;
                gridLines += `<line x1="${padding - 4}" y1="${origin.y - i * gridSpacing}" x2="${gridSize - padding + 4}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                if (i % 2 !== 0 || i === 0) {
                    axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 14}" text-anchor="middle" font-size="10">${i}</text>`;
                    if (i !== 0) axisLabels += `<text x="${origin.x - 10}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" font-size="10">${i}</text>`;
                }
            }
        }
        
        // Build points
        let pointsSVG = '';
        const colors = ['#e53935', '#43a047', '#1e88e5'];
        points.forEach((p, idx) => {
            const px = origin.x + p.x * gridSpacing;
            const py = origin.y - p.y * gridSpacing;
            if (problemType === 'identify') {
                pointsSVG += `<circle cx="${px}" cy="${py}" r="5" fill="${colors[idx]}"/>`;
                const labelX = p.x >= 8 ? px - 8 : px + 8;
                const labelY = p.y >= 8 ? py + 12 : py - 6;
                const anchor = p.x >= 8 ? 'end' : 'start';
                pointsSVG += `<text x="${labelX}" y="${labelY}" font-size="12" font-weight="bold" fill="${colors[idx]}" text-anchor="${anchor}">${p.label}</text>`;
            } else {
                pointsSVG += `<circle cx="${px}" cy="${py}" r="6" fill="none" stroke="${colors[idx]}" stroke-width="2" stroke-dasharray="3,3"/>`;
            }
        });
        
        // Build answer inputs - COMPACT
        let answerArea = '';
        if (problemType === 'identify') {
            answerArea = `<div style="margin-top:6px;font-size:0.8rem;">
                ${points.map((p, idx) => `<span style="margin-right:8px;"><span style="font-weight:700;color:${colors[idx]};">${p.label}:</span> <span style="border-bottom:1px solid #333;min-width:60px;display:inline-block;">&nbsp;</span></span>`).join('')}
            </div>`;
        } else {
            const coordList = points.map(p => `${p.label}(${p.x},${p.y})`).join(' ');
            answerArea = `<div style="margin-top:5px;font-size:0.8rem;"><strong>Plot:</strong> ${coordList}</div>`;
        }
        
        const title = problemType === 'identify' 
            ? (points.length === 1 ? `Coordinates of ${points[0].label}:` : 'Name coordinates:')
            : `Plot point${points.length > 1 ? 's' : ''}:`;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:5px;font-size:0.85rem;">${title}</div>
                    <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="display:block;max-width:100%;">
                        ${gridLines}
                        <line x1="${quadrantMode === 'quadrant1' ? origin.x : padding - 4}" y1="${origin.y}" x2="${gridSize - padding + 4}" y2="${origin.y}" stroke="#333" stroke-width="2"/>
                        <line x1="${origin.x}" y1="${quadrantMode === 'quadrant1' ? gridSize - padding + 4 : padding - 4}" x2="${origin.x}" y2="${padding - 4}" stroke="#333" stroke-width="2"/>
                        ${axisLabels}
                        <text x="${gridSize - padding + 8}" y="${origin.y - 4}" font-size="12" font-weight="bold">x</text>
                        <text x="${origin.x + 6}" y="${padding - 1}" font-size="12" font-weight="bold">y</text>
                        ${pointsSVG}
                    </svg>
                    ${answerArea}
                </div>
            </div>`;
    }
    
    // Geometry - Identify angles (acute, right, obtuse, straight)
    if (problem.printFormat === "geometry-angles" && problem.geometryData) {
        const gd = problem.geometryData;
        const angle = gd.angle || 45;
        const radians = (angle * Math.PI) / 180;
        const isRight = angle === 90;
        const isStraight = angle === 180;
        
        // Position vertex and ray length for best visibility based on angle size
        // Ensure all rays stay within the SVG bounds (0-150 x, 0-110 y)
        let cx, cy, rayLen;
        if (angle <= 90) {
            // Acute and right angles - vertex on left
            cx = 25; cy = 75; rayLen = 85;
        } else if (angle <= 120) {
            // Small obtuse angles - vertex more centered
            cx = 55; cy = 75; rayLen = 55;
        } else if (angle < 180) {
            // Large obtuse angles - vertex centered, shorter rays
            cx = 75; cy = 70; rayLen = 50;
        } else {
            // Straight angle (180°)
            cx = 75; cy = 60; rayLen = 55;
        }
        
        // Calculate second ray endpoint
        let x2 = cx + rayLen * Math.cos(radians);
        let y2 = cy - rayLen * Math.sin(radians);
        
        // Clamp endpoints to stay within SVG bounds with padding
        const padding = 10;
        if (x2 < padding) {
            const scale = (cx - padding) / (cx - x2);
            x2 = padding;
            y2 = cy - (cy - y2) * scale;
        }
        if (y2 < padding) {
            const scale = (cy - padding) / (cy - y2);
            y2 = padding;
            x2 = cx + (x2 - cx) * scale;
        }
        
        // Arc radius
        const arcRadius = Math.min(22, rayLen * 0.3);
        const arcX2 = cx + arcRadius * Math.cos(radians);
        const arcY2 = cy - arcRadius * Math.sin(radians);
        
        let angleIndicator = '';
        if (isRight) {
            // Right angle square
            angleIndicator = `<path d="M ${cx + 15} ${cy} L ${cx + 15} ${cy - 15} L ${cx} ${cy - 15}" fill="none" stroke="#1565c0" stroke-width="2"/>`;
        } else if (isStraight) {
            // Straight angle arc
            angleIndicator = `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx - arcRadius} ${cy}" fill="none" stroke="#1565c0" stroke-width="2"/>`;
        } else {
            // Normal arc (counter-clockwise from horizontal to angled ray)
            angleIndicator = `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${arcX2} ${arcY2}" fill="none" stroke="#1565c0" stroke-width="2"/>`;
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">What type of angle is this?</div>
                    <svg width="150" height="110" viewBox="0 0 150 110">
                        <!-- First ray (horizontal, to the right) -->
                        <line x1="${cx}" y1="${cy}" x2="${cx + rayLen}" y2="${cy}" stroke="#333" stroke-width="2.5"/>
                        <!-- Second ray (at angle, counter-clockwise) -->
                        <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="2.5"/>
                        <!-- Angle indicator (arc or square) -->
                        ${angleIndicator}
                        <!-- Vertex dot -->
                        <circle cx="${cx}" cy="${cy}" r="4" fill="#333"/>
                        <!-- Degree label below the vertex -->
                        <text x="${cx + 15}" y="${cy + 22}" font-size="14" font-weight="bold" fill="#333">${angle}°</text>
                    </svg>
                    <div style="margin-top:10px;display:flex;gap:15px;flex-wrap:wrap;">
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> Acute
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> Right
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> Obtuse
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> Straight
                        </label>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Identify lines (parallel, perpendicular, intersecting)
    if (problem.printFormat === "geometry-lines" && problem.geometryData) {
        const gd = problem.geometryData;
        const lineType = gd.lineType || 'parallel';
        const lineStyle = gd.lineStyle || 'lines';
        const orientation = gd.orientation || 'horizontal';
        
        // Determine line style label
        const styleLabel = lineStyle === "lines" ? "Lines" : lineStyle === "rays" ? "Rays" : "Line Segments";
        
        // === STANDARDIZED VISUAL CONSTANTS (matching screen version) ===
        const STROKE_WIDTH = 1.8;
        const STROKE_COLOR = '#333';
        const ARROW_SIZE = 5;
        const ENDPOINT_RADIUS = 2.5;
        const MARKER_COLOR = '#1565c0';
        const MARKER_WIDTH = 1.2;
        
        const svgWidth = 140;
        const svgHeight = 100;
        const cx = 70;
        const cy = 50;
        
        // Clean arrow markers with small, proportional heads
        const arrowDefs = `<defs>
            <marker id="print-arrow-end" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="${ARROW_SIZE - 1}" refY="${ARROW_SIZE/2}" orient="auto">
                <path d="M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE/2} L 0 ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round"/>
            </marker>
            <marker id="print-arrow-start" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="1" refY="${ARROW_SIZE/2}" orient="auto-start-reverse">
                <path d="M ${ARROW_SIZE} 0 L 0 ${ARROW_SIZE/2} L ${ARROW_SIZE} ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round"/>
            </marker>
        </defs>`;
        
        // Build line attributes based on style
        let lineAttrs = `stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round"`;
        if (lineStyle === "lines") {
            lineAttrs += ' marker-end="url(#print-arrow-end)" marker-start="url(#print-arrow-start)"';
        } else if (lineStyle === "rays") {
            lineAttrs += ' marker-end="url(#print-arrow-end)"';
        }
        
        // Helper for endpoint dots
        const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="${ENDPOINT_RADIUS}" fill="${STROKE_COLOR}"/>`;
        
        let linesSVG = arrowDefs;
        let endpoints = '';
        let markers = '';
        
        const lineLen = 50;
        const gap = 24;
        
        if (lineType === 'parallel') {
            if (orientation === 'vertical') {
                const x1 = cx - gap/2;
                const x2 = cx + gap/2;
                const y1 = cy - lineLen/2;
                const y2 = cy + lineLen/2;
                
                linesSVG += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(x1, y1) + dot(x1, y2) + dot(x2, y1) + dot(x2, y2);
                } else if (lineStyle === "rays") {
                    endpoints = dot(x1, y2) + dot(x2, y2);
                }
                
                // Parallel tick marks
                markers = `<line x1="${x1-3}" y1="${cy-3}" x2="${x1+3}" y2="${cy+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${x1-3}" y1="${cy+4}" x2="${x1+3}" y2="${cy+10}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${x2-3}" y1="${cy-3}" x2="${x2+3}" y2="${cy+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${x2-3}" y1="${cy+4}" x2="${x2+3}" y2="${cy+10}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
                          
            } else if (orientation === 'diagonal1' || orientation === 'diagonal2') {
                const angle = orientation === 'diagonal1' ? 25 : -25;
                const rad = angle * Math.PI / 180;
                const dx = lineLen * Math.cos(rad) / 2;
                const dy = lineLen * Math.sin(rad) / 2;
                const offsetY = gap * Math.cos(rad);
                
                linesSVG += `<line x1="${cx - dx}" y1="${cy - dy - offsetY/2}" x2="${cx + dx}" y2="${cy + dy - offsetY/2}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${cx - dx}" y1="${cy - dy + offsetY/2}" x2="${cx + dx}" y2="${cy + dy + offsetY/2}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(cx - dx, cy - dy - offsetY/2) + dot(cx + dx, cy + dy - offsetY/2) +
                               dot(cx - dx, cy - dy + offsetY/2) + dot(cx + dx, cy + dy + offsetY/2);
                } else if (lineStyle === "rays") {
                    endpoints = dot(cx - dx, cy - dy - offsetY/2) + dot(cx - dx, cy - dy + offsetY/2);
                }
            } else {
                // Horizontal
                const y1 = cy - gap/2;
                const y2 = cy + gap/2;
                const x1 = cx - lineLen/2;
                const x2 = cx + lineLen/2;
                
                linesSVG += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${x1}" y1="${y2}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(x1, y1) + dot(x2, y1) + dot(x1, y2) + dot(x2, y2);
                } else if (lineStyle === "rays") {
                    endpoints = dot(x1, y1) + dot(x1, y2);
                }
                
                // Parallel tick marks
                markers = `<line x1="${cx-3}" y1="${y1-3}" x2="${cx+3}" y2="${y1+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${cx+4}" y1="${y1-3}" x2="${cx+10}" y2="${y1+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${cx-3}" y1="${y2-3}" x2="${cx+3}" y2="${y2+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                          <line x1="${cx+4}" y1="${y2-3}" x2="${cx+10}" y2="${y2+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
            }
        } else if (lineType === 'perpendicular') {
            if (orientation === 'diagonal1' || orientation === 'diagonal2') {
                // Rotated perpendicular
                const halfLen = lineLen / 2;
                const diag = halfLen * 0.707;
                
                linesSVG += `<line x1="${cx - diag}" y1="${cy - diag}" x2="${cx + diag}" y2="${cy + diag}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${cx + diag}" y1="${cy - diag}" x2="${cx - diag}" y2="${cy + diag}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(cx - diag, cy - diag) + dot(cx + diag, cy + diag) +
                               dot(cx + diag, cy - diag) + dot(cx - diag, cy + diag);
                } else if (lineStyle === "rays") {
                    endpoints = dot(cx - diag, cy - diag) + dot(cx + diag, cy - diag);
                }
                
                // Right angle marker
                markers = `<rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}" transform="rotate(45, ${cx}, ${cy})"/>`;
            } else {
                // Standard horizontal + vertical
                const halfLen = lineLen / 2;
                
                linesSVG += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${cx}" y1="${cy - halfLen}" x2="${cx}" y2="${cy + halfLen}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(cx - halfLen, cy) + dot(cx + halfLen, cy) +
                               dot(cx, cy - halfLen) + dot(cx, cy + halfLen);
                } else if (lineStyle === "rays") {
                    endpoints = dot(cx - halfLen, cy) + dot(cx, cy + halfLen);
                }
                
                // Right angle marker
                const sq = 6;
                markers = `<path d="M ${cx + sq} ${cy} L ${cx + sq} ${cy - sq} L ${cx} ${cy - sq}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;
            }
        } else {
            // Intersecting
            const halfLen = lineLen / 2;
            
            if (orientation === 'diagonal1' || orientation === 'diagonal2') {
                const angle1 = 30;
                const angle2 = -50;
                const rad1 = angle1 * Math.PI / 180;
                const rad2 = angle2 * Math.PI / 180;
                
                linesSVG += `<line x1="${cx - halfLen * Math.cos(rad1)}" y1="${cy - halfLen * Math.sin(rad1)}" 
                                  x2="${cx + halfLen * Math.cos(rad1)}" y2="${cy + halfLen * Math.sin(rad1)}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${cx - halfLen * Math.cos(rad2)}" y1="${cy - halfLen * Math.sin(rad2)}" 
                                  x2="${cx + halfLen * Math.cos(rad2)}" y2="${cy + halfLen * Math.sin(rad2)}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                               dot(cx + halfLen * Math.cos(rad1), cy + halfLen * Math.sin(rad1)) +
                               dot(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2)) +
                               dot(cx + halfLen * Math.cos(rad2), cy + halfLen * Math.sin(rad2));
                } else if (lineStyle === "rays") {
                    endpoints = dot(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                               dot(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2));
                }
            } else {
                // One horizontal, one diagonal
                const angle = 55;
                const rad = angle * Math.PI / 180;
                
                linesSVG += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                linesSVG += `<line x1="${cx - halfLen * Math.cos(rad)}" y1="${cy + halfLen * Math.sin(rad)}" 
                                  x2="${cx + halfLen * Math.cos(rad)}" y2="${cy - halfLen * Math.sin(rad)}" ${lineAttrs}/>`;
                
                if (lineStyle === "segments") {
                    endpoints = dot(cx - halfLen, cy) + dot(cx + halfLen, cy) +
                               dot(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad)) +
                               dot(cx + halfLen * Math.cos(rad), cy - halfLen * Math.sin(rad));
                } else if (lineStyle === "rays") {
                    endpoints = dot(cx - halfLen, cy) +
                               dot(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad));
                }
            }
        }
        
        linesSVG += endpoints + markers;
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">What type of ${styleLabel.toLowerCase()} are shown?</div>
                    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                        ${linesSVG}
                    </svg>
                    <div style="margin-top:10px;display:flex;gap:15px;flex-wrap:wrap;">
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:16px;height:16px;border:1.5px solid #333;border-radius:50%;display:inline-block;"></span> Parallel
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:16px;height:16px;border:1.5px solid #333;border-radius:50%;display:inline-block;"></span> Perpendicular
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                            <span style="width:16px;height:16px;border:1.5px solid #333;border-radius:50%;display:inline-block;"></span> Intersecting
                        </label>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Lines of symmetry
    if (problem.printFormat === "geometry-symmetry" && problem.geometryData) {
        const gd = problem.geometryData;
        const shape = gd.shape || 'square';
        
        // Create shape with symmetry lines shown
        const shapeMap = {
            'square': `<rect x="35" y="20" width="70" height="70" fill="none" stroke="#333" stroke-width="2"/>`,
            'rectangle': `<rect x="25" y="30" width="90" height="50" fill="none" stroke="#333" stroke-width="2"/>`,
            'circle': `<circle cx="70" cy="55" r="35" fill="none" stroke="#333" stroke-width="2"/>`,
            'equilateral triangle': `<polygon points="70,15 30,85 110,85" fill="none" stroke="#333" stroke-width="2"/>`,
            'isosceles triangle': `<polygon points="70,15 35,85 105,85" fill="none" stroke="#333" stroke-width="2"/>`,
            'regular hexagon': `<polygon points="70,20 105,35 105,75 70,90 35,75 35,35" fill="none" stroke="#333" stroke-width="2"/>`
        };
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">How many lines of symmetry does this shape have?</div>
                    <svg width="140" height="110" viewBox="0 0 140 110">
                        ${shapeMap[shape] || shapeMap['square']}
                    </svg>
                    <div style="margin-top:8px;">
                        <span style="font-weight:600;">Shape:</span> ${shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Lines of symmetry:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Geometry - Classify triangles
    if (problem.printFormat === "geometry-triangles" && problem.geometryData) {
        const gd = problem.geometryData;
        const triType = gd.triType || 'equilateral';
        const byWhat = gd.byWhat || 'sides';
        
        const triangleShapes = {
            'equilateral': `<polygon points="70,15 25,85 115,85" fill="none" stroke="#333" stroke-width="2"/>`,
            'isosceles': `<polygon points="70,15 30,85 110,85" fill="none" stroke="#333" stroke-width="2"/>
                          <line x1="47" y1="50" x2="52" y2="50" stroke="#333" stroke-width="2"/>
                          <line x1="88" y1="50" x2="93" y2="50" stroke="#333" stroke-width="2"/>`,
            'scalene': `<polygon points="30,20 20,85 120,75" fill="none" stroke="#333" stroke-width="2"/>`,
            'right': `<polygon points="25,20 25,85 115,85" fill="none" stroke="#333" stroke-width="2"/>
                      <rect x="25" y="73" width="12" height="12" fill="none" stroke="#1565c0" stroke-width="2"/>`,
            'acute': `<polygon points="70,15 25,80 115,80" fill="none" stroke="#333" stroke-width="2"/>`,
            'obtuse': `<polygon points="90,15 15,75 125,75" fill="none" stroke="#333" stroke-width="2"/>`
        };
        
        const options = byWhat === 'sides' 
            ? ['Equilateral', 'Isosceles', 'Scalene']
            : ['Right', 'Acute', 'Obtuse'];
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Classify this triangle by its ${byWhat}:</div>
                    <svg width="140" height="100" viewBox="0 0 140 100">
                        ${triangleShapes[triType] || triangleShapes['equilateral']}
                    </svg>
                    <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap;">
                        ${options.map(opt => `
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <span style="width:18px;height:18px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> ${opt}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Classify quadrilaterals
    if (problem.printFormat === "geometry-quads" && problem.geometryData) {
        const gd = problem.geometryData;
        const quad = gd.quad || 'square';
        
        const quadShapes = {
            'square': `<rect x="30" y="20" width="80" height="80" fill="none" stroke="#333" stroke-width="2"/>
                       <rect x="30" y="20" width="10" height="10" fill="none" stroke="#333" stroke-width="1"/>
                       <rect x="100" y="20" width="10" height="10" fill="none" stroke="#333" stroke-width="1"/>
                       <rect x="30" y="90" width="10" height="10" fill="none" stroke="#333" stroke-width="1"/>
                       <rect x="100" y="90" width="10" height="10" fill="none" stroke="#333" stroke-width="1"/>`,
            'rectangle': `<rect x="20" y="30" width="100" height="60" fill="none" stroke="#333" stroke-width="2"/>
                          <rect x="20" y="30" width="8" height="8" fill="none" stroke="#333" stroke-width="1"/>
                          <rect x="112" y="30" width="8" height="8" fill="none" stroke="#333" stroke-width="1"/>
                          <rect x="20" y="82" width="8" height="8" fill="none" stroke="#333" stroke-width="1"/>
                          <rect x="112" y="82" width="8" height="8" fill="none" stroke="#333" stroke-width="1"/>`,
            'rhombus': `<polygon points="70,15 120,55 70,95 20,55" fill="none" stroke="#333" stroke-width="2"/>
                        <line x1="42" y1="33" x2="47" y2="38" stroke="#333" stroke-width="2"/>
                        <line x1="93" y1="33" x2="98" y2="38" stroke="#333" stroke-width="2"/>
                        <line x1="42" y1="72" x2="47" y2="77" stroke="#333" stroke-width="2"/>
                        <line x1="93" y1="72" x2="98" y2="77" stroke="#333" stroke-width="2"/>`,
            'parallelogram': `<polygon points="35,25 115,25 105,85 25,85" fill="none" stroke="#333" stroke-width="2"/>
                              <path d="M 70 22 L 75 25 L 70 28" fill="none" stroke="#1565c0" stroke-width="2"/>
                              <path d="M 60 82 L 65 85 L 60 88" fill="none" stroke="#1565c0" stroke-width="2"/>`,
            'trapezoid': `<polygon points="40,25 100,25 120,85 20,85" fill="none" stroke="#333" stroke-width="2"/>
                          <path d="M 68 22 L 72 25 L 68 28" fill="none" stroke="#1565c0" stroke-width="2"/>
                          <path d="M 68 82 L 72 85 L 68 88" fill="none" stroke="#1565c0" stroke-width="2"/>`
        };
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">What type of quadrilateral is this?</div>
                    <svg width="140" height="110" viewBox="0 0 140 110">
                        ${quadShapes[quad] || quadShapes['square']}
                    </svg>
                    <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;font-size:0.9rem;">
                        ${['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid'].map(opt => `
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;">
                                <span style="width:16px;height:16px;border:2px solid #333;border-radius:50%;display:inline-block;"></span> ${opt}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Area AND Perimeter (combined)
    if (problem.printFormat === "geometry-area-perimeter" && problem.geometryData) {
        const gd = problem.geometryData;
        let shapeHTML = '';
        
        if (gd.shape === 'rectangle') {
            shapeHTML = `
                <svg width="170" height="100" viewBox="0 0 170 100">
                    <rect x="30" y="15" width="110" height="70" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="85" y="10" text-anchor="middle" font-size="12">${gd.length} units</text>
                    <text x="85" y="98" text-anchor="middle" font-size="12">${gd.length} units</text>
                    <text x="18" y="55" text-anchor="end" font-size="12">${gd.width}</text>
                    <text x="152" y="55" text-anchor="start" font-size="12">${gd.width}</text>
                </svg>`;
        } else {
            shapeHTML = `
                <svg width="130" height="110" viewBox="0 0 130 110">
                    <rect x="20" y="20" width="80" height="80" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="60" y="14" text-anchor="middle" font-size="12">${gd.side} units</text>
                </svg>`;
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find BOTH the perimeter AND area:</div>
                    ${shapeHTML}
                    <div style="background:#f5f5f5;padding:8px;border-radius:6px;font-size:0.85rem;margin:10px 0;">
                        <b>Perimeter</b> = add all sides &nbsp;|&nbsp; <b>Area</b> = length × width
                    </div>
                    <div style="display:flex;gap:20px;margin-top:10px;">
                        <div style="display:flex;align-items:baseline;gap:8px;"><span style="font-weight:600;white-space:nowrap;">Perimeter:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>units</span></div>
                        <div style="display:flex;align-items:baseline;gap:8px;"><span style="font-weight:600;white-space:nowrap;">Area:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>sq units</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Composite shapes
    if (problem.printFormat === "geometry-composite" && problem.geometryData) {
        const gd = problem.geometryData;
        let compositeSVG = '';
        
        if (gd.compositeType === 'L-shape') {
            compositeSVG = `
                <svg width="140" height="120" viewBox="0 0 140 120">
                    <path d="M 20,20 L 80,20 L 80,50 L 50,50 L 50,100 L 20,100 Z" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="50" y="15" text-anchor="middle" font-size="10">${gd.dims?.w1 || 6}</text>
                    <text x="12" y="60" text-anchor="middle" font-size="10">${gd.dims?.h1 || 8}</text>
                    <text x="35" y="112" text-anchor="middle" font-size="10">${gd.dims?.w2 || 3}</text>
                </svg>`;
        } else {
            compositeSVG = `
                <svg width="160" height="100" viewBox="0 0 160 100">
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke="#333" stroke-width="2"/>
                    <rect x="80" y="35" width="60" height="45" fill="none" stroke="#333" stroke-width="2"/>
                    <text x="50" y="15" text-anchor="middle" font-size="10">${gd.dims?.rect1W || 6}</text>
                    <text x="110" y="92" text-anchor="middle" font-size="10">${gd.dims?.rect2W || 6}</text>
                </svg>`;
        }
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the area of this composite shape:</div>
                    ${compositeSVG}
                    <div style="background:#f5f5f5;padding:8px;border-radius:6px;font-size:0.85rem;margin:10px 0;">
                        <b>Hint:</b> Break into rectangles, find each area, then add them together.
                    </div>
                    <div style="border:1px dashed #999;padding:10px;border-radius:4px;min-height:50px;margin-bottom:8px;"></div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Total Area:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>sq units</span></div>
                </div>
            </div>`;
    }
    
    // Geometry - Area word problems
    if (problem.printFormat === "geometry-word-area" && problem.geometryData) {
        const gd = problem.geometryData;
        // Clean up the text - remove "A = ___" or "= ___" at the end
        let cleanText = problem.text.replace(/\s*[AP]?\s*=\s*___\s*$/, '');
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;line-height:1.5;margin-bottom:10px;">${cleanText}</div>
                    <div style="display:flex;gap:15px;align-items:flex-start;">
                        <svg width="120" height="80" viewBox="0 0 120 80">
                            <rect x="10" y="10" width="100" height="60" fill="none" stroke="#333" stroke-width="2"/>
                            <text x="60" y="6" text-anchor="middle" font-size="10">${gd.length} ${gd.context?.unit || 'ft'}</text>
                            <text x="118" y="45" text-anchor="start" font-size="10">${gd.width}</text>
                        </svg>
                        <div style="flex:1;">
                            <div style="background:#e8f5e9;padding:8px;border-radius:6px;font-size:0.85rem;margin-bottom:10px;">
                                <b>Area</b> = length × width
                            </div>
                            <div style="border:1px dashed #999;padding:8px;border-radius:4px;min-height:35px;margin-bottom:8px;"></div>
                            <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>square ${gd.context?.unit || 'ft'}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Geometry - Perimeter word problems
    if (problem.printFormat === "geometry-word-perimeter" && problem.geometryData) {
        const gd = problem.geometryData;
        // Clean up the text - remove "P = ___" or "= ___" at the end
        let cleanText = problem.text.replace(/\s*[AP]?\s*=\s*___\s*$/, '');
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.05rem;line-height:1.5;margin-bottom:10px;">${cleanText}</div>
                    <div style="display:flex;gap:15px;align-items:flex-start;">
                        <svg width="120" height="80" viewBox="0 0 120 80">
                            <rect x="10" y="10" width="100" height="60" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="5,3"/>
                            <text x="60" y="6" text-anchor="middle" font-size="10">${gd.length} ${gd.context?.unit || 'ft'}</text>
                            <text x="60" y="78" text-anchor="middle" font-size="10">${gd.length}</text>
                            <text x="5" y="45" text-anchor="end" font-size="10">${gd.width}</text>
                            <text x="115" y="45" text-anchor="start" font-size="10">${gd.width}</text>
                        </svg>
                        <div style="flex:1;">
                            <div style="background:#fff3e0;padding:8px;border-radius:6px;font-size:0.85rem;margin-bottom:10px;">
                                <b>Perimeter</b> = add all sides
                            </div>
                            <div style="border:1px dashed #999;padding:8px;border-radius:4px;min-height:35px;margin-bottom:8px;"></div>
                            <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>${gd.context?.unit || 'ft'}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Scaffolded word problem (interactive version for worksheets)
    if (problem.printFormat === "geometry-word-scaffolded" && problem.geometryData) {
        const gd = problem.geometryData;
        const askFor = gd.askFor || 'area';
        const unitLabel = askFor === 'area' ? `square ${gd.context?.unit || 'units'}` : (gd.context?.unit || 'units');
        
        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content">
                    <div style="font-size:0.95rem;line-height:1.5;margin-bottom:12px;border-left:3px solid #666;padding-left:10px;">${text}</div>
                    <div style="display:flex;gap:20px;align-items:flex-start;">
                        <svg width="100" height="70" viewBox="0 0 100 70">
                            <rect x="10" y="10" width="80" height="50" fill="#f5f5f5" stroke="#333" stroke-width="2"/>
                            <text x="50" y="6" text-anchor="middle" font-size="9">${gd.length}</text>
                            <text x="5" y="38" text-anchor="end" font-size="9">${gd.width}</text>
                        </svg>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;color:#666;margin-bottom:6px;">What are you finding?</div>
                            <div style="display:flex;gap:15px;margin-bottom:10px;">
                                <span style="padding:4px 12px;border:1.5px solid #333;border-radius:4px;font-size:0.8rem;">☐ Area</span>
                                <span style="padding:4px 12px;border:1.5px solid #333;border-radius:4px;font-size:0.8rem;">☐ Perimeter</span>
                            </div>
                            <div style="font-size:0.8rem;color:#666;margin-bottom:4px;">Show your work:</div>
                            <div style="border:1px dashed #999;padding:10px;border-radius:4px;min-height:30px;margin-bottom:8px;"></div>
                            <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>${unitLabel}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // ============================================
    // MEASUREMENT PRINT FORMATS
    // ============================================
    
    // Telling time - clock face
    if (problem.printFormat === "measurement-clock" && problem.measurementData) {
        const md = problem.measurementData;
        const hourAngle = ((md.hour % 12) + md.minute / 60) * 30 - 90;
        const minuteAngle = md.minute * 6 - 90;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">What time is shown?</div>
                    <svg width="130" height="130" viewBox="0 0 130 130">
                        <circle cx="65" cy="65" r="55" fill="white" stroke="#333" stroke-width="3"/>
                        <!-- Hour markers -->
                        ${[12,1,2,3,4,5,6,7,8,9,10,11].map((h, i) => {
                            const angle = (i * 30 - 60) * Math.PI / 180;
                            return `<text x="${65 + 42 * Math.cos(angle)}" y="${65 + 42 * Math.sin(angle) + 4}" text-anchor="middle" font-size="11" font-weight="600">${h}</text>`;
                        }).join('')}
                        <!-- Minute ticks -->
                        ${Array(60).fill(0).map((_, i) => {
                            const angle = (i * 6 - 90) * Math.PI / 180;
                            const len = i % 5 === 0 ? 8 : 4;
                            return `<line x1="${65 + 48 * Math.cos(angle)}" y1="${65 + 48 * Math.sin(angle)}" x2="${65 + (55 - len) * Math.cos(angle)}" y2="${65 + (55 - len) * Math.sin(angle)}" stroke="#333" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`;
                        }).join('')}
                        <!-- Hour hand -->
                        <line x1="65" y1="65" x2="${65 + 28 * Math.cos(hourAngle * Math.PI / 180)}" y2="${65 + 28 * Math.sin(hourAngle * Math.PI / 180)}" stroke="#333" stroke-width="4" stroke-linecap="round"/>
                        <!-- Minute hand -->
                        <line x1="65" y1="65" x2="${65 + 40 * Math.cos(minuteAngle * Math.PI / 180)}" y2="${65 + 40 * Math.sin(minuteAngle * Math.PI / 180)}" stroke="#1565c0" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="65" cy="65" r="4" fill="#333"/>
                    </svg>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Time:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Clock Conversion: Digital ↔ Analog
    if (problem.printFormat === "measurement-clock-conversion" && problem.measurementData) {
        const md = problem.measurementData;
        const hourAngle = ((md.hour % 12) + md.minute / 60) * 30 - 90;
        const minuteAngle = md.minute * 6 - 90;
        
        // Create filled analog clock SVG (with hands)
        const analogClockFilled = `
            <svg width="140" height="140" viewBox="0 0 130 130" style="display:block;">
                <circle cx="65" cy="65" r="55" fill="white" stroke="#333" stroke-width="3"/>
                ${[12,1,2,3,4,5,6,7,8,9,10,11].map((h, i) => {
                    const angle = (i * 30 - 60) * Math.PI / 180;
                    return `<text x="${65 + 42 * Math.cos(angle)}" y="${65 + 42 * Math.sin(angle) + 4}" text-anchor="middle" font-size="11" font-weight="600">${h}</text>`;
                }).join('')}
                ${Array(60).fill(0).map((_, i) => {
                    const angle = (i * 6 - 90) * Math.PI / 180;
                    const len = i % 5 === 0 ? 8 : 4;
                    return `<line x1="${65 + 48 * Math.cos(angle)}" y1="${65 + 48 * Math.sin(angle)}" x2="${65 + (55 - len) * Math.cos(angle)}" y2="${65 + (55 - len) * Math.sin(angle)}" stroke="#333" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`;
                }).join('')}
                <line x1="65" y1="65" x2="${65 + 28 * Math.cos(hourAngle * Math.PI / 180)}" y2="${65 + 28 * Math.sin(hourAngle * Math.PI / 180)}" stroke="#333" stroke-width="4" stroke-linecap="round"/>
                <line x1="65" y1="65" x2="${65 + 40 * Math.cos(minuteAngle * Math.PI / 180)}" y2="${65 + 40 * Math.sin(minuteAngle * Math.PI / 180)}" stroke="#1565c0" stroke-width="3" stroke-linecap="round"/>
                <circle cx="65" cy="65" r="4" fill="#333"/>
            </svg>`;
        
        // Create blank analog clock SVG (no hands - for drawing)
        const analogClockBlank = `
            <svg width="140" height="140" viewBox="0 0 130 130" style="display:block;">
                <circle cx="65" cy="65" r="55" fill="white" stroke="#333" stroke-width="3"/>
                ${[12,1,2,3,4,5,6,7,8,9,10,11].map((h, i) => {
                    const angle = (i * 30 - 60) * Math.PI / 180;
                    return `<text x="${65 + 42 * Math.cos(angle)}" y="${65 + 42 * Math.sin(angle) + 4}" text-anchor="middle" font-size="11" font-weight="600">${h}</text>`;
                }).join('')}
                ${Array(60).fill(0).map((_, i) => {
                    const angle = (i * 6 - 90) * Math.PI / 180;
                    const len = i % 5 === 0 ? 8 : 4;
                    return `<line x1="${65 + 48 * Math.cos(angle)}" y1="${65 + 48 * Math.sin(angle)}" x2="${65 + (55 - len) * Math.cos(angle)}" y2="${65 + (55 - len) * Math.sin(angle)}" stroke="#333" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`;
                }).join('')}
                <circle cx="65" cy="65" r="5" fill="#333"/>
                <text x="65" y="95" text-anchor="middle" fill="#999" font-size="8">Draw hands</text>
            </svg>`;
        
        // Digital clock display
        const digitalDisplay = `
            <div style="display:inline-block;background:#1a1a2e;color:#fff;font-family:'Courier New',monospace;font-size:1.5rem;font-weight:700;padding:10px 15px;border-radius:8px;border:3px solid #333;letter-spacing:2px;">
                ${md.timeStr} <span style="font-size:0.7rem;color:#ccc;">${md.ampm}</span>
            </div>`;

        // Digital clock blank (for writing)
        const digitalBlank = `
            <div style="display:inline-block;background:#1a1a2e;font-family:'Courier New',monospace;font-size:1.5rem;font-weight:700;padding:10px 15px;border-radius:8px;border:3px solid #333;">
                <span style="color:#fff;border-bottom:2px solid #fff;">__</span><span style="color:#fff;">:</span><span style="color:#fff;border-bottom:2px solid #fff;">__</span>
                <span style="font-size:0.7rem;color:#ccc;margin-left:5px;">AM / PM</span>
            </div>`;
        
        if (md.direction === "digital_to_analog") {
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div style="font-weight:600;margin-bottom:10px;">Draw the clock hands to show this time:</div>
                        <div style="display:flex;gap:25px;align-items:center;flex-wrap:wrap;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:#666;margin-bottom:5px;">Digital Time:</div>
                                ${digitalDisplay}
                            </div>
                            <div style="font-size:1.5rem;color:#666;">→</div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:#666;margin-bottom:5px;">Draw on Analog:</div>
                                ${analogClockBlank}
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div style="font-weight:600;margin-bottom:10px;">Write the digital time shown:</div>
                        <div style="display:flex;gap:25px;align-items:center;flex-wrap:wrap;">
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:#666;margin-bottom:5px;">Analog Clock:</div>
                                ${analogClockFilled}
                            </div>
                            <div style="font-size:1.5rem;color:#666;">→</div>
                            <div style="text-align:center;">
                                <div style="font-size:0.8rem;color:#666;margin-bottom:5px;">Write Digital:</div>
                                ${digitalBlank}
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    }
    
    // Money/making change
    if (problem.printFormat === "measurement-money" && problem.measurementData) {
        const md = problem.measurementData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.1rem;margin-bottom:10px;">${problem.text.replace(' = ___', '')}</div>
                    <div style="background:#e8f5e9;padding:10px;border-radius:8px;margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Amount Given:</span>
                            <span style="font-weight:600;">$${md.given ? md.given.toFixed(2) : '___'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Cost:</span>
                            <span style="font-weight:600;">$${md.cost ? md.cost.toFixed(2) : '___'}</span>
                        </div>
                        <div style="border-top:1px solid #4caf50;padding-top:5px;display:flex;align-items:baseline;gap:8px;">
                            <span style="font-weight:600;white-space:nowrap;">Change:</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // ============================================
    // DATA & STATISTICS PRINT FORMATS
    // ============================================
    
    // Mean calculation
    if (problem.printFormat === "data-mean" && problem.dataData) {
        const ds = problem.dataData;
        const nums = ds.nums || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the mean (average):</div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                        ${nums.map(v => `<span style="padding:6px 12px;border:2px solid #333;border-radius:6px;font-weight:600;">${v}</span>`).join('')}
                    </div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;">
                        <div style="margin-bottom:8px;"><b>Step 1:</b> Add all values</div>
                        <div style="border:1px dashed #999;padding:8px;border-radius:4px;min-height:25px;margin-bottom:8px;"></div>
                        <div style="margin-bottom:8px;"><b>Step 2:</b> Divide by count (${nums.length})</div>
                        <div style="border:1px dashed #999;padding:8px;border-radius:4px;min-height:25px;margin-bottom:8px;"></div>
                        <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Mean =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Median calculation
    if (problem.printFormat === "data-median" && problem.dataData) {
        const ds = problem.dataData;
        const nums = ds.nums || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the median:</div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                        ${nums.map(v => `<span style="padding:6px 12px;border:2px solid #333;border-radius:6px;font-weight:600;">${v}</span>`).join('')}
                    </div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;">
                        <div style="margin-bottom:8px;"><b>Step 1:</b> Order from least to greatest</div>
                        <div style="display:flex;gap:5px;align-items:center;margin-bottom:8px;">
                            ${nums.map(() => `<span style="width:35px;border-bottom:1px solid #333;">&nbsp;</span><span>→</span>`).join('').slice(0, -10)}
                        </div>
                        <div style="margin-bottom:8px;"><b>Step 2:</b> Find the middle value</div>
                        <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Median =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Mode calculation
    if (problem.printFormat === "data-mode" && problem.dataData) {
        const ds = problem.dataData;
        const nums = ds.nums || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">Find the mode (most frequent):</div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                        ${nums.map(v => `<span style="padding:6px 12px;border:2px solid #333;border-radius:6px;font-weight:600;">${v}</span>`).join('')}
                    </div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;">
                        <div style="margin-bottom:8px;"><b>Count each value:</b></div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:5px;margin-bottom:8px;">
                            ${[...new Set(nums)].map(v => `<div>${v}: <span style="border-bottom:1px solid #999;min-width:20px;display:inline-block;">&nbsp;</span></div>`).join('')}
                        </div>
                        <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Mode =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Range calculation
    if (problem.printFormat === "data-range" && problem.dataData) {
        const ds = problem.dataData;
        const nums = ds.nums || [];
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Find the range:</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                        ${nums.map(v => `<span style="padding:8px 14px;border:2px solid #333;border-radius:6px;font-weight:600;font-size:1.1rem;">${v}</span>`).join('')}
                    </div>
                    <div style="background:#f5f5f5;padding:12px;border-radius:8px;">
                        <div style="display:flex;gap:30px;margin-bottom:12px;flex-wrap:wrap;">
                            <div style="display:flex;align-items:baseline;gap:8px;flex:1;">
                                <span style="font-weight:600;white-space:nowrap;">Maximum:</span>
                                <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            </div>
                            <div style="display:flex;align-items:baseline;gap:8px;flex:1;">
                                <span style="font-weight:600;white-space:nowrap;">Minimum:</span>
                                <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            </div>
                        </div>
                        <div style="margin-bottom:10px;font-weight:600;color:#555;">Range = Maximum − Minimum</div>
                        <div style="display:flex;align-items:baseline;gap:8px;">
                            <span style="font-weight:700;font-size:1.1rem;white-space:nowrap;">Range =</span>
                            <span style="flex:1;border:2px solid #333;border-radius:4px;padding:4px 20px;background:#fff;">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Probability
    if (problem.printFormat === "data-probability" && problem.dataData) {
        const ds = problem.dataData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom:10px;">${problem.text.replace(' ___', '')}</div>
                    <div style="background:#fff3e0;padding:10px;border-radius:8px;margin-bottom:10px;">
                        <div><b>Favorable outcomes:</b> <span style="border-bottom:1px solid #333;min-width:30px;display:inline-block;">&nbsp;</span></div>
                        <div><b>Total outcomes:</b> ${ds.total}</div>
                        <div style="margin-top:8px;"><b>Probability =</b> favorable ÷ total</div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Bar/line graphs
    if (problem.printFormat === "data-graph" && problem.dataData) {
        const ds = problem.dataData;
        const values = ds.values || [];
        const categories = ds.categories || ds.labels || [];
        const maxVal = Math.max(...values, 1);
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:8px;">${ds.context || ds.title || 'Use the graph to answer:'}</div>
                    <svg width="200" height="120" viewBox="0 0 200 120">
                        <!-- Y axis -->
                        <line x1="35" y1="10" x2="35" y2="95" stroke="#333" stroke-width="1"/>
                        <!-- X axis -->
                        <line x1="35" y1="95" x2="190" y2="95" stroke="#333" stroke-width="1"/>
                        <!-- Bars -->
                        ${categories.map((label, i) => {
                            const barHeight = (values[i] / maxVal) * 70;
                            const x = 45 + i * 35;
                            return `<rect x="${x}" y="${95 - barHeight}" width="25" height="${barHeight}" fill="#1565c0"/>
                                    <text x="${x + 12}" y="108" text-anchor="middle" font-size="8">${label.substring(0,4)}</text>`;
                        }).join('')}
                        <!-- Y labels -->
                        ${[0, Math.round(maxVal/2), maxVal].map((v, i) => `<text x="30" y="${95 - i * 35}" text-anchor="end" font-size="8">${v}</text>`).join('')}
                    </svg>
                    <div style="margin-top:8px;">${ds.question || problem.text}</div>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-top:5px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // ============================================
    // NUMBER THEORY PRINT FORMATS
    // ============================================
    
    // Prime vs Composite
    if (problem.printFormat === "numtheory-prime" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:10px;">Is ${nt.number} prime or composite?</div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;margin-bottom:10px;">
                        <div style="margin-bottom:8px;"><b>Find all factors:</b></div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                            ${Array(6).fill(0).map(() => `<span style="width:35px;height:30px;border:1px solid #999;border-radius:4px;display:inline-block;"></span>`).join('')}
                        </div>
                        <div style="font-size:0.85rem;color:#666;">
                            <b>Prime:</b> exactly 2 factors (1 and itself)<br/>
                            <b>Composite:</b> more than 2 factors
                        </div>
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">${nt.number} is:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Factors
    if (problem.printFormat === "numtheory-factors" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">List all factors of ${nt.number}:</div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;">
                        <div style="margin-bottom:8px;"><b>Factor pairs:</b></div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px;">
                            ${Array(4).fill(0).map(() => `<div style="display:flex;gap:5px;align-items:center;"><span style="width:30px;border-bottom:1px solid #999;">&nbsp;</span> × <span style="width:30px;border-bottom:1px solid #999;">&nbsp;</span> = ${nt.number}</div>`).join('')}
                        </div>
                        <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">All factors:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // GCF
    if (problem.printFormat === "numtheory-gcf" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;">Find the GCF of ${nt.a} and ${nt.b}</div>
                    <div style="display:flex;gap:10px;margin-bottom:6px;">
                        <div style="flex:1;"><b style="font-size:0.85rem;">Factors of ${nt.a}:</b><div style="border:1px dashed #666;min-height:22px;margin-top:2px;border-radius:3px;"></div></div>
                        <div style="flex:1;"><b style="font-size:0.85rem;">Factors of ${nt.b}:</b><div style="border:1px dashed #666;min-height:22px;margin-top:2px;border-radius:3px;"></div></div>
                    </div>
                    <div style="font-size:0.85rem;"><b>Common:</b> _______ <b>GCF =</b> ____</div>
                </div>
            </div>`;
    }
    
    // LCM
    if (problem.printFormat === "numtheory-lcm" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;">Find the LCM of ${nt.a} and ${nt.b}</div>
                    <div style="display:flex;gap:10px;margin-bottom:6px;">
                        <div style="flex:1;"><b style="font-size:0.85rem;">Multiples of ${nt.a}:</b><div style="border:1px dashed #666;min-height:22px;margin-top:2px;border-radius:3px;"></div></div>
                        <div style="flex:1;"><b style="font-size:0.85rem;">Multiples of ${nt.b}:</b><div style="border:1px dashed #666;min-height:22px;margin-top:2px;border-radius:3px;"></div></div>
                    </div>
                    <div style="font-size:0.85rem;"><b>Common:</b> _______ <b>LCM =</b> ____</div>
                </div>
            </div>`;
    }
    
    // Divisibility
    if (problem.printFormat === "numtheory-divisibility" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Is ${nt.number} divisible by ${nt.divisor}?</div>
                    <div style="background:#e3f2fd;padding:10px;border-radius:8px;margin-bottom:10px;font-size:0.85rem;">
                        <b>Divisibility Rules:</b><br/>
                        <b>2:</b> ends in 0,2,4,6,8 • <b>3:</b> digit sum ÷ 3 • <b>5:</b> ends in 0 or 5<br/>
                        <b>6:</b> divisible by 2 AND 3 • <b>9:</b> digit sum ÷ 9 • <b>10:</b> ends in 0
                    </div>
                    <div style="margin-bottom:8px;">Show your test:</div>
                    <div style="border:1px dashed #999;padding:8px;border-radius:4px;min-height:35px;margin-bottom:10px;"></div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>(Yes/No)</span></div>
                </div>
            </div>`;
    }
    
    // ============================================
    // ENHANCED NUMBER THEORY PRINT FORMATS (nt-)
    // ============================================
    
    // Prime/Composite Classification (sort multiple numbers)
    if (problem.printFormat === "nt-prime-classify" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:12px;font-size:1.1rem;">Sort these numbers into PRIME or COMPOSITE:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:15px;">
                        ${nt.allNums.map(n => `<span style="padding:10px 18px;border:2px solid #333;border-radius:8px;font-size:1.3rem;font-weight:700;">${n}</span>`).join('')}
                    </div>
                    <div style="display:flex;gap:20px;">
                        <div style="flex:1;border:2px solid #27ae60;border-radius:10px;padding:12px;">
                            <div style="font-weight:700;color:#27ae60;margin-bottom:10px;text-align:center;font-size:1.1rem;">PRIME</div>
                            <div style="font-size:0.8rem;color:#666;text-align:center;margin-bottom:10px;">(exactly 2 factors: 1 and itself)</div>
                            <div style="min-height:50px;border:1px dashed #27ae60;border-radius:6px;padding:8px;"></div>
                        </div>
                        <div style="flex:1;border:2px solid #e67e22;border-radius:10px;padding:12px;">
                            <div style="font-weight:700;color:#e67e22;margin-bottom:10px;text-align:center;font-size:1.1rem;">COMPOSITE</div>
                            <div style="font-size:0.8rem;color:#666;text-align:center;margin-bottom:10px;">(more than 2 factors)</div>
                            <div style="min-height:50px;border:1px dashed #e67e22;border-radius:6px;padding:8px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Prime/Composite Compare with Justification
    if (problem.printFormat === "nt-prime-compare" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:15px;font-size:1.1rem;">Which number is composite? Circle it and explain why.</div>
                    <div style="display:flex;justify-content:center;gap:40px;margin:20px 0;">
                        <span style="padding:15px 30px;border:3px solid #333;border-radius:12px;font-size:2rem;font-weight:700;">${nt.nums[0]}</span>
                        <span style="padding:15px 30px;border:3px solid #333;border-radius:12px;font-size:2rem;font-weight:700;">${nt.nums[1]}</span>
                    </div>
                    <div style="background:#f5f5f5;padding:15px;border-radius:10px;">
                        <div style="font-weight:600;margin-bottom:10px;">Explain why it is composite:</div>
                        <div style="border:1px dashed #999;padding:8px;border-radius:6px;min-height:40px;margin-bottom:12px;background:white;"></div>
                        <div style="font-weight:600;margin-bottom:8px;">Show a factor pair that proves it:</div>
                        <div style="display:flex;align-items:center;gap:10px;justify-content:center;font-size:1.3rem;">
                            <span style="width:45px;height:38px;border:2px solid #3498db;border-radius:6px;display:inline-block;background:white;"></span>
                            <span style="font-weight:700;">×</span>
                            <span style="width:45px;height:38px;border:2px solid #3498db;border-radius:6px;display:inline-block;background:white;"></span>
                            <span style="font-weight:700;">=</span>
                            <span style="width:50px;border-bottom:3px solid #444;display:inline-block;text-align:center;">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Single Prime/Composite
    if (problem.printFormat === "nt-prime" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Is <span style="font-size:1.4rem;font-weight:700;">${nt.num}</span> prime or composite?</div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;margin-bottom:10px;font-size:0.85rem;">
                        <b>Prime:</b> exactly 2 factors (1 and itself)<br/>
                        <b>Composite:</b> more than 2 factors
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Factors Identification (circle all factors)
    if (problem.printFormat === "nt-factors-identify" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;">Circle ALL factors of ${nt.num}:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;">
                        ${nt.displayList.map(n => `<span style="padding:4px 8px;border:1.5px solid #333;border-radius:4px;font-size:0.9rem;font-weight:600;min-width:24px;text-align:center;">${n}</span>`).join('')}
                    </div>
                    <div style="font-size:0.7rem;color:#666;">Tip: Factor divides evenly with no remainder</div>
                </div>
            </div>`;
    }
    
    // Factor T-Chart Building (old format - redirect to easy)
    if (problem.printFormat === "nt-factors-tchart" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const numPairs = nt.factorPairs.length;
        const bankFactors = nt.scrambledFactors || [];
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;">Factor T-Chart for ${nt.num}</div>
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                        <div style="flex-shrink:0;">
                            <div style="text-align:center;font-size:1.4rem;font-weight:700;border-bottom:2px solid #333;padding-bottom:4px;">${nt.num}</div>
                            <div style="display:flex;border-left:2px solid #333;">
                                <div style="min-width:52px;border-right:2px solid #333;">
                                    ${Array(numPairs).fill(0).map(() => `<div style="height:36px;border-bottom:1px solid #ccc;display:flex;align-items:center;justify-content:center;">
                                        <span style="width:40px;height:30px;border:1px solid #666;border-radius:2px;display:inline-block;"></span>
                                    </div>`).join('')}
                                </div>
                                <div style="min-width:52px;">
                                    ${Array(numPairs).fill(0).map(() => `<div style="height:36px;border-bottom:1px solid #ccc;display:flex;align-items:center;justify-content:center;">
                                        <span style="width:40px;height:30px;border:1px solid #666;border-radius:2px;display:inline-block;"></span>
                                    </div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div style="background:#f5f5f5;padding:6px;border-radius:4px;border:1px solid #999;flex:1;min-width:0;">
                            <div style="font-weight:600;font-size:0.75rem;margin-bottom:4px;">Factor Bank:</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;">
                                ${bankFactors.map(f => `<span style="padding:2px 6px;background:white;border:1px solid #666;border-radius:3px;font-weight:700;font-size:0.8rem;">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:6px;font-size:0.7rem;color:#666;">Each row: ___ × ___ = ${nt.num}</div>
                </div>
            </div>`;
    }
    
    // Factor T-Chart EASY (with factor bank) - compact for two-column
    if (problem.printFormat === "nt-factor-tchart-easy" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const numPairs = nt.factorPairs.length;
        const bankFactors = nt.bankFactors || nt.scrambledFactors || [];
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:1.4rem;font-weight:700;border:2px solid #333;padding:3px 10px;border-radius:4px;">${nt.num}</span>
                        <span style="font-size:0.8rem;color:#666;">Factor Bank: ${bankFactors.join(', ')}</span>
                    </div>
                    <table style="border-collapse:collapse;margin:0;">
                        ${nt.factorPairs.map(() => `<tr>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">×</td>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">= ${nt.num}</td>
                        </tr>`).join('')}
                    </table>
                </div>
            </div>`;
    }
    
    // Factor T-Chart MEDIUM (factor bank + distractors)
    if (problem.printFormat === "nt-factor-tchart-medium" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const numPairs = nt.factorPairs.length;
        const bankFactors = nt.bankFactors || [];
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:1.4rem;font-weight:700;border:2px solid #333;padding:3px 10px;border-radius:4px;">${nt.num}</span>
                        <span style="font-size:0.75rem;color:#666;">Bank (some NOT factors!): ${bankFactors.join(', ')}</span>
                    </div>
                    <table style="border-collapse:collapse;margin:0;">
                        ${nt.factorPairs.map(() => `<tr>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">×</td>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">= ${nt.num}</td>
                        </tr>`).join('')}
                    </table>
                </div>
            </div>`;
    }
    
    // Factor T-Chart HARD (NO factor bank)
    if (problem.printFormat === "nt-factor-tchart-hard" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const numPairs = nt.factorPairs.length;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:1.4rem;font-weight:700;border:2px solid #333;padding:3px 10px;border-radius:4px;">${nt.num}</span>
                        <span style="font-size:0.75rem;color:#666;">Find all ${numPairs} pairs (tip: check 1 to ${Math.floor(Math.sqrt(nt.num))})</span>
                    </div>
                    <table style="border-collapse:collapse;margin:0;">
                        ${nt.factorPairs.map(() => `<tr>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">×</td>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">= ${nt.num}</td>
                        </tr>`).join('')}
                    </table>
                </div>
            </div>`;
    }
    
    // Interactive Factor T-Chart (Drag & Drop version for print)
    if (problem.printFormat === "nt-factor-tchart-drag" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const numPairs = nt.factorPairs.length;
        const bankFactors = nt.scrambledFactors || nt.allFactors || [];
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:1.4rem;font-weight:700;border:2px solid #333;padding:3px 10px;border-radius:4px;">${nt.num}</span>
                        <span style="font-size:0.8rem;color:#666;">Factor Bank: ${bankFactors.join(', ')}</span>
                    </div>
                    <table style="border-collapse:collapse;margin:0;">
                        ${nt.factorPairs.map(() => `<tr>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">×</td>
                            <td style="border:1px solid #666;width:40px;height:30px;text-align:center;"></td>
                            <td style="padding:0 6px;font-size:1rem;">= ${nt.num}</td>
                        </tr>`).join('')}
                    </table>
                </div>
            </div>`;
    }
    
    // Count Factors
    if (problem.printFormat === "nt-factors" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom:6px;"><b>List all factors of ${nt.num}:</b></div>
                    <div style="border:1px dashed #666;padding:6px;border-radius:4px;min-height:25px;margin-bottom:6px;"></div>
                    <div>Total factors: ____</div>
                </div>
            </div>`;
    }
    
    // Factor Links EASY - with factor bank - compact version
    if (problem.printFormat === "factor-links-easy" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const bankFactors = nt.bankFactors || [];
        const linksSVG = createFactorLinksSVG(nt.num, {
            width: 300, height: 195, forPrint: true, showAnswers: false, maxPairs: nt.numPairs || 6
        });
        
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    ${linksSVG}
                    <div style="font-weight:600;font-size:0.75rem;color:#333;margin-top:4px;">Bank: ${bankFactors.join(', ')}</div>
                </div>
            </div>`;
    }
    
    // Factor Links MEDIUM - factor bank + distractors
    if (problem.printFormat === "factor-links-medium" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const bankFactors = nt.bankFactors || [];
        const linksSVG = createFactorLinksSVG(nt.num, {
            width: 300, height: 195, forPrint: true, showAnswers: false, maxPairs: nt.numPairs || 6
        });
        
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    ${linksSVG}
                    <div style="font-weight:600;font-size:0.7rem;color:#333;margin-top:4px;">Bank: ${bankFactors.join(', ')} <span style="color:#999;font-size:0.6rem;">*some are NOT factors</span></div>
                </div>
            </div>`;
    }
    
    // Factor Links HARD - NO factor bank
    if ((problem.printFormat === "factor-links-hard" || problem.printFormat === "factor-links") && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const linksSVG = createFactorLinksSVG(nt.num, {
            width: 300, height: 195, forPrint: true, showAnswers: false, maxPairs: nt.numPairs || 6
        });
        
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    ${linksSVG}
                    <div style="font-weight:500;font-size:0.65rem;color:#666;margin-top:4px;">Find all factor pairs (hint: check 1-${Math.floor(Math.sqrt(nt.num))})</div>
                </div>
            </div>`;
    }
    
    // Multiples Identification (circle all multiples)
    if (problem.printFormat === "nt-multiples-identify" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:4px;">Circle multiples of ${nt.num}:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                        ${nt.displayList.map(n => `<span style="padding:3px 6px;border:1.5px solid #333;border-radius:4px;font-size:0.85rem;font-weight:600;min-width:22px;text-align:center;">${n}</span>`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // List Multiples (supports different counts: 5, 8, 10, 12)
    if (problem.printFormat === "nt-multiples" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const count = nt.count || 5;
        const displayCount = Math.min(count, 10);
        
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:4px;">First ${count} multiples of ${nt.num}:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;">
                        ${Array(displayCount).fill(0).map((_, i) => `<span style="width:28px;height:22px;border:1px solid #333;border-radius:3px;display:inline-block;"></span>`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Fill-in Multiples sequence
    if (problem.printFormat === "nt-multiples-fill" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const sequence = nt.sequence || [];
        
        // Calculate box width based on largest number
        const maxVal = Math.max(...sequence.map(s => s.value));
        const boxWidth = Math.max(38, maxVal.toString().length * 12 + 14);
        
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Fill in the missing multiples of <span style="font-size:1.2rem;font-weight:700;color:#9c27b0;">${nt.num}</span>:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                        ${sequence.map(s => s.shown 
                            ? `<span style="display:inline-flex;min-width:${boxWidth}px;height:34px;padding:0 8px;border:2px solid #9c27b0;border-radius:6px;align-items:center;justify-content:center;font-weight:700;background:#f3e5f5;color:#6a1b9a;">${s.value}</span>`
                            : `<span style="display:inline-flex;min-width:${boxWidth}px;height:34px;padding:0 8px;border:2px dashed #ff9800;border-radius:6px;align-items:center;justify-content:center;background:#fff8e1;"></span>`
                        ).join('')}
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:#666;">Pattern: Skip count by ${nt.num}</div>
                </div>
            </div>`;
    }
    
    // GCF EASY - factor boxes shown for both numbers
    if ((problem.printFormat === "nt-gcf-easy" || problem.printFormat === "nt-gcf") && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const factorsA = nt.factorsA || [];
        const factorsB = nt.factorsB || [];
        const common = nt.commonFactors || [];

        const makeBoxes = (factors) => factors.map(f =>
            `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 3px;border:1.5px solid #444;border-radius:3px;font-size:0.8rem;font-weight:600;${common.includes(f) ? 'background:#fff3cd;border-color:#b45309;' : ''}">${f}</span>`
        ).join('');

        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;font-size:0.95rem;">GCF of ${nt.a} and ${nt.b}</div>
                    <div style="font-size:0.65rem;color:#666;margin-bottom:6px;line-height:1.4;">
                        1) Look at each number's factors &nbsp; 2) Circle shared factors &nbsp; 3) Pick the greatest
                    </div>
                    <div style="margin-bottom:6px;padding:6px;background:#f9f9f9;border-radius:4px;">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
                            <span style="font-weight:700;font-size:1rem;min-width:28px;">${nt.a}</span>
                            <span style="font-size:0.65rem;color:#666;">(${factorsA.length} factors)</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;">${makeBoxes(factorsA)}</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
                            <span style="font-weight:700;font-size:1rem;min-width:28px;">${nt.b}</span>
                            <span style="font-size:0.65rem;color:#666;">(${factorsB.length} factors)</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:3px;">${makeBoxes(factorsB)}</div>
                    </div>
                    <div style="background:#f5f5f5;padding:5px 6px;border-radius:4px;font-size:0.8rem;">
                        <b>Shared:</b> _____________ &nbsp; <b>GCF =</b> ____
                    </div>
                </div>
            </div>`;
    }

    // GCF HARD - empty factor boxes for students to fill
    if (problem.printFormat === "nt-gcf-hard" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const factorsA = nt.factorsA || [];
        const factorsB = nt.factorsB || [];

        const makeEmptyBoxes = (count) => Array(count).fill(0).map(() =>
            `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1.5px solid #888;border-radius:3px;font-size:0.75rem;color:#bbb;">?</span>`
        ).join('');

        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;font-size:0.95rem;">GCF of ${nt.a} and ${nt.b}</div>
                    <div style="font-size:0.65rem;color:#666;margin-bottom:6px;line-height:1.4;">
                        1) Find all factors of each number &nbsp; 2) Circle shared factors &nbsp; 3) Pick the greatest
                    </div>
                    <div style="margin-bottom:6px;padding:6px;background:#f9f9f9;border-radius:4px;">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
                            <span style="font-weight:700;font-size:1rem;min-width:28px;">${nt.a}</span>
                            <span style="font-size:0.65rem;color:#666;">(${factorsA.length} factors)</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;">${makeEmptyBoxes(factorsA.length)}</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
                            <span style="font-weight:700;font-size:1rem;min-width:28px;">${nt.b}</span>
                            <span style="font-size:0.65rem;color:#666;">(${factorsB.length} factors)</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:3px;">${makeEmptyBoxes(factorsB.length)}</div>
                    </div>
                    <div style="background:#f5f5f5;padding:5px 6px;border-radius:4px;font-size:0.8rem;">
                        <b>Shared:</b> _____________ &nbsp; <b>GCF =</b> ____
                    </div>
                </div>
            </div>`;
    }
    
    // Enhanced LCM
    if (problem.printFormat === "nt-lcm" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Find the LCM of ${nt.a} and ${nt.b}:</div>
                    <div style="background:#f5f5f5;padding:12px;border-radius:8px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:10px;">
                            <div>
                                <div style="font-weight:600;margin-bottom:5px;">Multiples of ${nt.a}:</div>
                                <div style="border:1px dashed #3498db;padding:8px;border-radius:6px;min-height:35px;background:white;"></div>
                            </div>
                            <div>
                                <div style="font-weight:600;margin-bottom:5px;">Multiples of ${nt.b}:</div>
                                <div style="border:1px dashed #3498db;padding:8px;border-radius:6px;min-height:35px;background:white;"></div>
                            </div>
                        </div>
                        <div style="margin-bottom:8px;"><b>Common multiples:</b> <span style="border-bottom:1px dashed #999;min-width:120px;display:inline-block;">&nbsp;</span></div>
                        <div style="display:flex;align-items:baseline;gap:8px;font-weight:700;font-size:1.1rem;"><span style="white-space:nowrap;">LCM (least) =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                    </div>
                </div>
            </div>`;
    }
    
    // Enhanced Divisibility
    if (problem.printFormat === "nt-divisibility" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const rules = {
            2: "ends in 0, 2, 4, 6, or 8",
            3: "sum of digits divisible by 3",
            4: "last 2 digits divisible by 4",
            5: "ends in 0 or 5",
            6: "divisible by both 2 AND 3",
            7: "double last digit, subtract from rest",
            8: "last 3 digits divisible by 8",
            9: "sum of digits divisible by 9",
            10: "ends in 0",
            11: "alternating sum of digits divisible by 11",
            12: "divisible by both 3 AND 4"
        };
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Is <span style="font-size:1.3rem;font-weight:700;">${nt.num}</span> divisible by <span style="font-size:1.3rem;font-weight:700;">${nt.divisor}</span>?</div>
                    <div style="background:#e3f2fd;padding:10px;border-radius:8px;margin-bottom:10px;">
                        <b>Rule for ${nt.divisor}:</b> ${rules[nt.divisor] || 'Check if it divides evenly'}
                    </div>
                    <div style="margin-bottom:8px;"><b>Show your work:</b></div>
                    <div style="border:1px dashed #999;padding:8px;border-radius:6px;min-height:40px;margin-bottom:10px;background:white;"></div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>(Yes / No)</span></div>
                </div>
            </div>`;
    }
    
    // Divisibility Sorting Worksheet
    if (problem.printFormat === "nt-divisibility-sort" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        const divisor = nt.divisor;
        const numbers = nt.numbers || [];
        
        // Divisibility rules reference
        const rules = {
            2: "Last digit is 0, 2, 4, 6, or 8",
            3: "Sum of all digits divisible by 3",
            4: "Last 2 digits divisible by 4",
            5: "Last digit is 0 or 5",
            6: "Divisible by BOTH 2 AND 3",
            7: "Double last digit, subtract from rest",
            8: "Last 3 digits divisible by 8",
            9: "Sum of all digits divisible by 9",
            10: "Last digit is 0",
            11: "Alternating sum of digits = 0 or ÷11",
            12: "Divisible by BOTH 3 AND 4"
        };
        
        return `
            <div class="worksheet-problem" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;font-size:1.1rem;margin-bottom:10px;text-align:center;">
                        Sort these numbers by divisibility by <span style="font-size:1.4rem;color:#1565c0;">${divisor}</span>
                    </div>
                    
                    <!-- Rule reminder box -->
                    <div style="background:#e8f5e9;padding:8px 12px;border-radius:8px;margin-bottom:12px;border-left:4px solid #4caf50;">
                        <strong>Rule for ${divisor}:</strong> ${rules[divisor] || 'Check if it divides evenly'}
                    </div>
                    
                    <!-- Sorting boxes -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px;">
                        <div style="border:3px solid #4caf50;border-radius:10px;padding:10px;min-height:100px;background:#f1f8e9;">
                            <div style="font-weight:700;color:#2e7d32;margin-bottom:8px;text-align:center;border-bottom:2px dashed #4caf50;padding-bottom:5px;">
                                ✓ Divisible by ${divisor}
                            </div>
                            <div style="min-height:70px;"></div>
                        </div>
                        <div style="border:3px solid #f44336;border-radius:10px;padding:10px;min-height:100px;background:#ffebee;">
                            <div style="font-weight:700;color:#c62828;margin-bottom:8px;text-align:center;border-bottom:2px dashed #f44336;padding-bottom:5px;">
                                ✗ NOT Divisible by ${divisor}
                            </div>
                            <div style="min-height:70px;"></div>
                        </div>
                    </div>
                    
                    <!-- Numbers to sort -->
                    <div style="text-align:center;margin-top:10px;">
                        <div style="font-weight:600;margin-bottom:8px;">Write each number in the correct box:</div>
                        <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
                            ${numbers.map(n => `
                                <div style="padding:12px 20px;background:linear-gradient(135deg,#e3f2fd,#bbdefb);border:2px solid #1976d2;border-radius:10px;font-size:1.4rem;font-weight:700;color:#0d47a1;">
                                    ${n}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Even/Odd
    if (problem.printFormat === "nt-even-odd" && problem.numberTheoryData) {
        const nt = problem.numberTheoryData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:600;margin-bottom:10px;">Is <span style="font-size:1.5rem;font-weight:700;">${nt.num}</span> even or odd?</div>
                    <div style="background:#f5f5f5;padding:10px;border-radius:8px;margin-bottom:10px;font-size:0.85rem;">
                        <b>Even:</b> ends in 0, 2, 4, 6, 8<br/>
                        <b>Odd:</b> ends in 1, 3, 5, 7, 9
                    </div>
                    <div style="display:flex;align-items:baseline;gap:8px;font-weight:600;"><span style="white-space:nowrap;">The ones digit is:</span><span style="min-width:30px;border-bottom:1px solid #999;">&nbsp;</span><span style="white-space:nowrap;">so ${nt.num} is</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // Ordering numbers
    if (problem.printFormat === "ordering" && problem.orderData) {
        const od = problem.orderData;
        const direction = od.direction === "asc" ? "smallest to largest" : "largest to smallest";
        const maxNumLen = Math.max(...od.nums.map(n => n.toString().length));
        const boxWidth = Math.max(50, maxNumLen * 12 + 20);
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div style="margin-bottom: 8px;">Order from ${direction}:</div>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 10px;">
                        ${od.nums.map(n => `<span style="padding: 8px 15px; border: 2px solid #333; border-radius: 8px; font-weight: bold;">${n.toLocaleString()}</span>`).join('')}
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="flex:1; border-bottom: 2px solid #333;">&nbsp;</span>
                        <span>${od.direction === "asc" ? "<" : ">"}</span>
                        <span style="flex:1; border-bottom: 2px solid #333;">&nbsp;</span>
                        <span>${od.direction === "asc" ? "<" : ">"}</span>
                        <span style="flex:1; border-bottom: 2px solid #333;">&nbsp;</span>
                        <span>${od.direction === "asc" ? "<" : ">"}</span>
                        <span style="flex:1; border-bottom: 2px solid #333;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }
    
    // Smart handling for default horizontal format based on question type
    const text = problem.text || "";
    const lineWidth = getAnswerLineWidth(problem);
    
    // Special handling for time conversions with two blanks
    if (lineWidth === "time") {
        // Parse the text to create proper labeled blanks
        if (text.includes("hours") && text.includes("minutes") && !text.includes("days")) {
            const parts = text.split("=");
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">
                            <span style="white-space:nowrap;">${parts[0].trim()} =</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>hr</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>min</span>
                        </div>
                    </div>
                </div>`;
        }
        if (text.includes("days") && text.includes("hours")) {
            const parts = text.split("=");
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">
                            <span style="white-space:nowrap;">${parts[0].trim()} =</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>days</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>hr</span>
                        </div>
                    </div>
                </div>`;
        }
        if (text.includes("minutes") && text.includes("seconds")) {
            const parts = text.split("=");
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">
                            <span style="white-space:nowrap;">${parts[0].trim()} =</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>min</span>
                            <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                            <span>sec</span>
                        </div>
                    </div>
                </div>`;
        }
    }
    
    // Special handling for expanded form - needs much longer line
    if (text.toLowerCase().includes("expanded form")) {
        const numMatch = text.match(/(\d[\d,]*)/);
        const num_to_expand = numMatch ? numMatch[1].replace(/,/g, '') : "";
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="horizontal-problem">
                        <span>Write ${num_to_expand} in expanded form:</span>
                    </div>
                    <div style="margin-top: 8px; border-bottom: 2px solid #333;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Special handling for "next 3 numbers" patterns
    if (text.includes("___, ___, ___")) {
        const parts = text.split("___, ___, ___");
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">
                        <span style="white-space:nowrap;">${parts[0]}</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        <span>,</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        <span>,</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }
    
    // Fact Family - Addition/Subtraction
    if (problem.printFormat === "fact-family-add-sub" && problem.factFamilyData) {
        const data = problem.factFamilyData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:8px;font-size:1.15rem;">Fact Family (+/&#x2212;)</div>
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;padding:6px 12px;border:1px solid #ccc;border-radius:6px;display:inline-block;">
                        Numbers: ${data.numbers[0]}, ${data.numbers[1]}, ${data.numbers[2]}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        ${data.equations.map(eq => `<div style="padding:8px 10px;background:#f5f5f5;border-radius:4px;font-size:1.2rem;">
                            ${eq.text.replace('___', '<span style="display:inline-block;min-width:40px;border-bottom:3px solid #444;">&nbsp;</span>')}
                        </div>`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Fact Family - Multiplication/Division
    if (problem.printFormat === "fact-family-mult-div" && problem.factFamilyData) {
        const data = problem.factFamilyData;
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:8px;font-size:1.15rem;">Fact Family (&#xd7;/&#xf7;)</div>
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;padding:6px 12px;border:1px solid #ccc;border-radius:6px;display:inline-block;">
                        Numbers: ${data.numbers[0]}, ${data.numbers[1]}, ${data.numbers[2]}
                    </div>
                    <div style="display:grid;grid-template-columns:${data.isSquare ? '1fr' : '1fr 1fr'};gap:8px;">
                        ${data.equations.map(eq => `<div style="padding:8px 10px;background:#f5f5f5;border-radius:4px;font-size:1.2rem;">
                            ${eq.text.replace('___', '<span style="display:inline-block;min-width:40px;border-bottom:3px solid #444;">&nbsp;</span>')}
                        </div>`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    // Number Family - Addition/Subtraction (Enhanced with alignment)
    if (problem.printFormat === "number-family-add-sub" && problem.numberFamilyData) {
        const data = problem.numberFamilyData;

        const createCell = (value, isMissing) => {
            if (isMissing) {
                return `<span style="display:inline-block;width:50px;height:36px;border:2px solid #333;border-radius:4px;text-align:center;line-height:32px;background:#fff;">&nbsp;</span>`;
            }
            return `<span style="display:inline-block;width:50px;height:36px;text-align:center;line-height:36px;font-weight:700;font-size:1.3rem;">${value}</span>`;
        };

        const equationsHTML = data.equations.map((eq, idx) => {
            const missing = data.missingPositions[idx];

            return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 10px;background:#f8f9fa;border-radius:4px;">
                ${createCell(eq.nums[0], missing.includes(0))}
                <span style="width:24px;text-align:center;font-size:1.3rem;font-weight:700;">${eq.op}</span>
                ${createCell(eq.nums[1], missing.includes(1))}
                <span style="width:24px;text-align:center;font-size:1.3rem;font-weight:700;">=</span>
                ${createCell(eq.nums[2], missing.includes(2))}
            </div>`;
        }).join('');

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;font-size:1.15rem;">Number Family (+/&#x2212;)</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:8px;padding:5px 12px;border:2px solid #ccc;border-radius:6px;display:inline-block;">
                        ${data.a}, ${data.b}, ${data.c}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${equationsHTML}
                    </div>
                </div>
            </div>`;
    }
    
    // Number Family - Multiplication/Division (Enhanced with alignment)
    if (problem.printFormat === "number-family-mult-div" && problem.numberFamilyData) {
        const data = problem.numberFamilyData;

        const createCell = (value, isMissing) => {
            if (isMissing) {
                return `<span style="display:inline-block;width:50px;height:36px;border:2px solid #333;border-radius:4px;text-align:center;line-height:32px;background:#fff;">&nbsp;</span>`;
            }
            return `<span style="display:inline-block;width:50px;height:36px;text-align:center;line-height:36px;font-weight:700;font-size:1.3rem;">${value}</span>`;
        };

        const equationsHTML = data.equations.map((eq, idx) => {
            const missing = data.missingPositions[idx];

            return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 10px;background:#f8f9fa;border-radius:4px;">
                ${createCell(eq.nums[0], missing.includes(0))}
                <span style="width:24px;text-align:center;font-size:1.3rem;font-weight:700;">${eq.op}</span>
                ${createCell(eq.nums[1], missing.includes(1))}
                <span style="width:24px;text-align:center;font-size:1.3rem;font-weight:700;">=</span>
                ${createCell(eq.nums[2], missing.includes(2))}
            </div>`;
        }).join('');

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:6px;font-size:1.15rem;">Number Family (&#xd7;/&#xf7;)</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:8px;padding:5px 12px;border:2px solid #ccc;border-radius:6px;display:inline-block;">
                        ${data.a}, ${data.b}, ${data.c}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${equationsHTML}
                    </div>
                </div>
            </div>`;
    }
    
    // Number Family - All 4 Operations (Addition, Subtraction, Multiplication, Division)
    if (problem.printFormat === "number-family-all-four" && problem.numberFamilyData) {
        const data = problem.numberFamilyData;

        const createCell = (value, isMissing) => {
            if (isMissing) {
                return `<span style="display:inline-block;width:46px;height:32px;border:2px solid #333;border-radius:3px;text-align:center;line-height:28px;background:#fff;">&nbsp;</span>`;
            }
            return `<span style="display:inline-block;width:46px;height:32px;text-align:center;line-height:32px;font-weight:700;font-size:1.2rem;">${value}</span>`;
        };

        // Separate equations by type
        const addSubEqs = data.equations.filter(eq => eq.type === 'add' || eq.type === 'sub');
        const multDivEqs = data.equations.filter(eq => eq.type === 'mult' || eq.type === 'div');

        const renderEquation = (eq) => {
            const idx = data.equations.indexOf(eq);
            const missing = data.missingPositions[idx];

            return `<div style="display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 8px;background:#f8f9fa;border-radius:4px;">
                ${createCell(eq.nums[0], missing.includes(0))}
                <span style="width:20px;text-align:center;font-weight:700;font-size:1.2rem;">${eq.op}</span>
                ${createCell(eq.nums[1], missing.includes(1))}
                <span style="width:20px;text-align:center;font-weight:700;font-size:1.2rem;">=</span>
                ${createCell(eq.nums[2], missing.includes(2))}
            </div>`;
        };

        const addSubHTML = addSubEqs.map(eq => renderEquation(eq)).join('');
        const multDivHTML = multDivEqs.map(eq => renderEquation(eq)).join('');

        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}" style="page-break-inside:avoid;">
                ${num}
                <div class="problem-content">
                    <div style="font-weight:700;margin-bottom:5px;font-size:1.15rem;">Number Family (All 4 Ops)</div>
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:8px;padding:4px 10px;border:2px solid #ccc;border-radius:6px;display:inline-block;">
                        ${data.a} &amp; ${data.b} &#x2192; Sum: ${data.sum}, Product: ${data.product}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div>
                            <div style="font-weight:600;margin-bottom:4px;font-size:1rem;">+/&#x2212;</div>
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                ${addSubHTML}
                            </div>
                        </div>
                        <div>
                            <div style="font-weight:600;margin-bottom:4px;font-size:1rem;">&#xd7;/&#xf7;</div>
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                ${multDivHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Missing Number - Addition/Subtraction
    if (problem.printFormat === "missing-number") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;font-size:1.3rem;">
                        ${problem.text.replace('___', '<span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>')}
                    </div>
                </div>
            </div>`;
    }
    
    // Missing Factor - Multiplication/Division
    if (problem.printFormat === "missing-factor") {
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;font-size:1.3rem;">
                        ${problem.text.replace('___', '<span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>')}
                    </div>
                </div>
            </div>`;
    }
    
    // Division with notation variety
    if (problem.printFormat === "division-variety" && problem.divisionNotation) {
        const a = problem.a;
        const b = problem.b;
        const notation = problem.divisionNotation;
        const quotient = Math.floor(a / b);
        const quotientLen = quotient.toString().length;
        const dividendLen = a.toString().length;
        const boxWidth = 26;
        const boxGap = 3;
        
        if (notation === 'fraction') {
            // Fraction notation - simple display
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div class="horizontal-problem" style="display:flex;align-items:center;gap:5px;">
                            <div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 10px;">
                                <span style="border-bottom:3px solid #444;padding:2px 10px;font-size:1.3rem;font-weight:600;">${a}</span>
                                <span style="padding:2px 10px;font-size:1.3rem;font-weight:600;">${b}</span>
                            </div> = <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        </div>
                    </div>
                </div>`;
        } else if (notation === 'bracket') {
            // Long division bracket notation with work boxes
            const quotientBoxes = Array.from({length: quotientLen}, () => 
                `<div style="width:${boxWidth}px;height:${boxWidth}px;border:2px solid #555;border-radius:4px;background:#fff;"></div>`
            ).join('');
            
            const dividendDigits = a.toString().split('').map(d => 
                `<div style="width:${boxWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${d}</div>`
            ).join('');
            
            // Work rows for long division
            let workRows = '';
            for (let i = 0; i < Math.min(quotientLen, 3); i++) {
                workRows += `
                    <div style="display:flex;gap:${boxGap}px;align-items:center;margin-top:4px;">
                        <span style="font-size:0.85rem;color:#666;width:16px;">−</span>
                        ${Array.from({length: dividendLen}, () => 
                            `<div style="width:${boxWidth}px;height:${boxWidth-4}px;border-bottom:1.5px solid #333;"></div>`
                        ).join('')}
                    </div>
                    <div style="display:flex;gap:${boxGap}px;margin-left:16px;margin-top:2px;">
                        ${Array.from({length: dividendLen}, () => 
                            `<div style="width:${boxWidth}px;height:${boxWidth-4}px;border:1px dashed #ccc;border-radius:2px;"></div>`
                        ).join('')}
                    </div>`;
            }
            
            return `
                <div class="worksheet-problem full-width">
                    ${num}
                    <div class="problem-content">
                        <div style="display:inline-block;font-family:'Courier New',monospace;">
                            <div style="display:flex;align-items:flex-start;gap:5px;">
                                <!-- Divisor -->
                                <div style="font-weight:700;font-size:1.2rem;padding-top:${boxWidth + 12}px;">${b}</div>
                                
                                <!-- Division structure -->
                                <div style="display:flex;flex-direction:column;">
                                    <!-- Quotient boxes -->
                                    <div style="display:flex;gap:${boxGap}px;justify-content:flex-end;padding-right:${boxGap}px;margin-bottom:3px;">
                                        ${quotientBoxes}
                                    </div>
                                    
                                    <!-- Division bracket with dividend -->
                                    <div style="display:flex;">
                                        <div style="width:8px;border-left:2.5px solid #333;border-top:2.5px solid #333;border-top-left-radius:6px;"></div>
                                        <div style="border-top:2.5px solid #333;padding:5px ${boxGap}px 6px ${boxGap}px;">
                                            <div style="display:flex;gap:${boxGap}px;">
                                                ${dividendDigits}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Work area -->
                                    <div style="margin-left:8px;margin-top:6px;">
                                        ${workRows}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            // Symbol notation (÷)
            return `
                <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                    ${num}
                    <div class="problem-content">
                        <div class="horizontal-problem" style="display:flex;align-items:center;gap:5px;">
                            <span style="font-size:1.3rem;font-weight:600;white-space:nowrap;">${a} ÷ ${b}</span> = <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        </div>
                    </div>
                </div>`;
        }
    }
    
    // ===== TIME CLOCK PRINT FORMATS =====
    // Designed for two-column layout: clock on top, question/answer below
    
    // Time to clock - show analog clock for students to read
    if (problem.printFormat === "measurement-time-clock" && problem.measurementData) {
        const { hour, minute } = problem.measurementData;
        const clockSVG = createAnalogClockSVG(hour, minute, { size: 160, colorScheme: 'gray', forPrint: true });
        
        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="margin-bottom:12px;">${clockSVG}</div>
                    <div style="font-size:0.95rem;margin-bottom:8px;">What time does this clock show?</div>
                    <div style="width:100%;border-bottom:2px solid #333;padding:4px 10px;font-size:1.1rem;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Time with clock to draw hands
    if (problem.printFormat === "measurement-time-draw" && problem.measurementData) {
        const { timeWords } = problem.measurementData;
        // Empty clock for drawing
        const emptyClockSVG = createAnalogClockSVG(12, 0, { size: 160, colorScheme: 'gray', forPrint: true });
        // Remove the hands from the SVG (just show the face)
        const clockFaceOnly = emptyClockSVG.replace(/<line[^>]*stroke-width="[46]"[^>]*\/>/g, '');
        
        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="margin-bottom:12px;">${clockFaceOnly}</div>
                    <div style="font-size:0.95rem;">Draw hands to show:</div>
                    <div style="font-weight:bold;font-size:1.05rem;margin-top:4px;">${timeWords}</div>
                </div>
            </div>`;
    }
    
    // Elapsed time with starting clock
    if (problem.printFormat === "measurement-elapsed-clock" && problem.measurementData) {
        const { startHour, startMin } = problem.measurementData;
        const clockSVG = createAnalogClockSVG(startHour, startMin, { size: 160, colorScheme: 'gray', forPrint: true });
        
        return `
            <div class="worksheet-problem" style="min-height:220px;">
                ${num}
                <div class="problem-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="margin-bottom:8px;">${clockSVG}</div>
                    <div style="font-size:0.8rem;color:#666;margin-bottom:8px;">Start Time</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;max-width:180px;">${text}</div>
                    <div style="display:flex;align-items:baseline;gap:8px;width:100%;">
                        <span style="font-weight:600;font-size:0.9rem;white-space:nowrap;">Answer:</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                    </div>
                </div>
            </div>`;
    }
    
    // Elapsed Time Visual (two clocks side by side)
    if (problem.printFormat === "measurement-elapsed-visual" && problem.measurementData) {
        const { startHour, startMin, endHour, endMin, clockType } = problem.measurementData;
        const clockSize = 120;

        // Build clock 1
        let clock1;
        if (clockType === 'analog-analog' || clockType === 'analog-digital') {
            clock1 = createAnalogClockSVG(startHour, startMin, { size: clockSize, colorScheme: 'gray', forPrint: true, showAllNumbers: true });
        } else {
            const h = startHour > 12 ? startHour - 12 : startHour;
            const ampm = startHour >= 12 ? 'PM' : 'AM';
            clock1 = `<div style="display:inline-flex;flex-direction:column;align-items:center;">
                <div style="background:#222;border-radius:8px;padding:12px 18px;border:2px solid #555;">
                    <span style="font-family:'JetBrains Mono',monospace;font-size:1.8rem;color:#fff;font-weight:700;">${h}:${startMin.toString().padStart(2,'0')}</span>
                    <span style="font-size:0.9rem;margin-left:4px;color:#ccc;">${ampm}</span>
                </div>
            </div>`;
        }

        // Build clock 2
        let clock2;
        if (clockType === 'analog-analog' || clockType === 'digital-analog') {
            clock2 = createAnalogClockSVG(endHour, endMin, { size: clockSize, colorScheme: 'gray', forPrint: true, showAllNumbers: true });
        } else {
            const h = endHour > 12 ? endHour - 12 : endHour;
            const ampm = endHour >= 12 ? 'PM' : 'AM';
            clock2 = `<div style="display:inline-flex;flex-direction:column;align-items:center;">
                <div style="background:#222;border-radius:8px;padding:12px 18px;border:2px solid #555;">
                    <span style="font-family:'JetBrains Mono',monospace;font-size:1.8rem;color:#fff;font-weight:700;">${h}:${endMin.toString().padStart(2,'0')}</span>
                    <span style="font-size:0.9rem;margin-left:4px;color:#ccc;">${ampm}</span>
                </div>
            </div>`;
        }

        return `
            <div class="worksheet-problem" style="min-height:210px;">
                ${num}
                <div class="problem-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:10px;">
                        <div style="text-align:center;">
                            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;font-weight:600;">Start</div>
                            ${clock1}
                        </div>
                        <div style="font-size:1.5rem;color:#333;font-weight:900;">→</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;font-weight:600;">End</div>
                            ${clock2}
                        </div>
                    </div>
                    <div style="font-size:0.85rem;margin-bottom:8px;">How much time has passed?</div>
                    <div style="display:flex;align-items:baseline;gap:6px;width:100%;">
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        <span style="font-size:0.85rem;">hr</span>
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        <span style="font-size:0.85rem;">min</span>
                    </div>
                </div>
            </div>`;
    }

    // Find elapsed time duration
    if (problem.printFormat === "measurement-elapsed-find" && problem.measurementData) {
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    <div style="font-size:0.95rem;margin-bottom:10px;">${text}</div>
                    <div style="display:flex;align-items:baseline;gap:8px;">
                        <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                        <span>minutes</span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;color:#666;font-size:0.85rem;">
                        <span>(or</span>
                        <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #666;text-align:center;">&nbsp;</span>
                        <span>hr</span>
                        <span style="display:inline-block;min-width:35px;border-bottom:1.5px solid #666;text-align:center;">&nbsp;</span>
                        <span>min)</span>
                    </div>
                </div>
            </div>`;
    }
    
    // TIME - Generic measurement-time format (has measurementData with hour/minute)
    if (problem.printFormat === "measurement-time" && problem.measurementData) {
        const { hour, minute } = problem.measurementData;
        const clockSVG = createAnalogClockSVG(hour, minute, { size: 160, colorScheme: 'gray', forPrint: true });
        
        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="margin-bottom:12px;">${clockSVG}</div>
                    <div style="font-size:0.95rem;margin-bottom:8px;">What time does this clock show?</div>
                    <div style="width:100%;border-bottom:2px solid #333;padding:4px 10px;font-size:1.1rem;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Replace ___ in text with properly sized answer line
    if (text.includes("___")) {
        const formattedText = text.replace(/___/g, `<span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>`);
        return `
            <div class="worksheet-problem${fullWidthClass}${sizeClass}">
                ${num}
                <div class="problem-content">
                    <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">${formattedText}</div>
                </div>
            </div>`;
    }
    
    // ===== DATA VISUALIZATIONS =====
    // Bar Graph - render SVG chart
    if (problem.printFormat === "data-bar-graph" && problem.dataData) {
        const dd = problem.dataData;
        const categories = dd.categories || [];
        const values = dd.values || [];
        const maxVal = Math.max(...values, 10);
        const barWidth = 35;
        const barGap = 12;
        const graphHeight = 120;
        const graphWidth = categories.length * (barWidth + barGap) + 60;
        const scale = (graphHeight - 25) / maxVal;
        
        const barsSVG = values.map((v, i) => {
            const x = 50 + i * (barWidth + barGap);
            const barHeight = Math.max(v * scale, 2);
            return `
                <rect x="${x}" y="${graphHeight - barHeight}" width="${barWidth}" height="${barHeight}" fill="#666" stroke="#333" stroke-width="1"/>
                <text x="${x + barWidth/2}" y="${graphHeight + 12}" font-size="8" text-anchor="middle">${(categories[i] || '').substring(0, 5)}</text>
            `;
        }).join('');
        
        const yLabels = [0, Math.ceil(maxVal/2), maxVal].map((val) => `
            <text x="42" y="${graphHeight - val * scale + 3}" font-size="8" text-anchor="end">${val}</text>
            <line x1="45" y1="${graphHeight - val * scale}" x2="${graphWidth - 5}" y2="${graphHeight - val * scale}" stroke="#ccc" stroke-width="0.5"/>
        `).join('');
        
        return `
            <div class="worksheet-problem" style="min-height:180px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    <svg width="${graphWidth}" height="${graphHeight + 25}" viewBox="0 0 ${graphWidth} ${graphHeight + 25}" style="display:block;margin:0 auto 8px;">
                        <line x1="45" y1="5" x2="45" y2="${graphHeight}" stroke="#333" stroke-width="1.5"/>
                        <line x1="45" y1="${graphHeight}" x2="${graphWidth - 5}" y2="${graphHeight}" stroke="#333" stroke-width="1.5"/>
                        ${yLabels}
                        ${barsSVG}
                    </svg>
                    <div style="font-size:0.85rem;margin-bottom:6px;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                </div>
            </div>`;
    }

    // Pictograph - render picture graph
    if (problem.printFormat === "data-pictograph" && problem.dataData) {
        const dd = problem.dataData;
        const categories = dd.categories || [];
        const values = dd.values || [];
        const scale = dd.scale || 2;
        const icon = "●";
        
        const rowsHTML = categories.map((cat, i) => {
            const numIcons = Math.floor((values[i] || 0) / scale);
            const halfIcon = ((values[i] || 0) % scale) >= scale/2 ? "◐" : "";
            return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0;">
                <span style="min-width:60px;font-size:0.75rem;text-align:right;">${(cat || '').substring(0, 8)}</span>
                <span style="font-size:0.9rem;">${icon.repeat(numIcons)}${halfIcon}</span>
            </div>`;
        }).join('');
        
        return `
            <div class="worksheet-problem" style="min-height:160px;">
                ${num}
                <div class="problem-content">
                    <div style="font-size:0.7rem;color:#666;margin-bottom:6px;">Key: ${icon} = ${scale}</div>
                    ${rowsHTML}
                    <div style="font-size:0.85rem;margin-top:8px;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;margin-top:4px;">&nbsp;</div>
                </div>
            </div>`;
    }

    // Line Plot - render dot plot
    if (problem.printFormat === "data-line-plot" && problem.dataData) {
        const dd = problem.dataData;
        const dataPoints = dd.dataPoints || dd.values || [];
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        
        // Count occurrences
        const counts = {};
        dataPoints.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        
        const plotWidth = (max - min + 1) * 25 + 40;
        let plotSVG = `<line x1="20" y1="70" x2="${plotWidth - 10}" y2="70" stroke="#333" stroke-width="1.5"/>`;
        
        for (let v = min; v <= max; v++) {
            const x = 30 + (v - min) * 25;
            plotSVG += `<text x="${x}" y="85" font-size="9" text-anchor="middle">${v}</text>`;
            const count = counts[v] || 0;
            for (let d = 0; d < count; d++) {
                plotSVG += `<circle cx="${x}" cy="${65 - d * 12}" r="4" fill="#333"/>`;
            }
        }
        
        return `
            <div class="worksheet-problem" style="min-height:140px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    <svg width="${plotWidth}" height="95" viewBox="0 0 ${plotWidth} 95" style="display:block;margin:0 auto 8px;">${plotSVG}</svg>
                    <div style="font-size:0.85rem;margin-bottom:6px;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Tally Chart
    if (problem.printFormat === "data-tally" && problem.dataData) {
        const dd = problem.dataData;
        const categories = dd.categories || [];
        const values = dd.values || [];
        
        const tallyMark = (n) => {
            const groups = Math.floor(n / 5);
            const remainder = n % 5;
            return "卌".repeat(groups) + "|".repeat(remainder);
        };
        
        const rowsHTML = categories.map((cat, i) => `
            <div style="display:flex;border-bottom:1px solid #ddd;padding:3px 0;">
                <span style="min-width:70px;font-size:0.8rem;">${(cat || '').substring(0, 10)}</span>
                <span style="font-family:monospace;font-size:0.9rem;letter-spacing:2px;">${tallyMark(values[i] || 0)}</span>
            </div>
        `).join('');
        
        return `
            <div class="worksheet-problem" style="min-height:140px;">
                ${num}
                <div class="problem-content">
                    <div style="border:1px solid #333;padding:6px;margin-bottom:8px;">${rowsHTML}</div>
                    <div style="font-size:0.85rem;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;margin-top:4px;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Pie Chart
    if (problem.printFormat === "data-pie" && problem.dataData) {
        const dd = problem.dataData;
        const categories = dd.categories || [];
        const values = dd.values || [];
        const total = values.reduce((a, b) => a + b, 0) || 1;
        
        let startAngle = -90;
        const slices = values.map((v, i) => {
            const angle = (v / total) * 360;
            const endAngle = startAngle + angle;
            const largeArc = angle > 180 ? 1 : 0;
            const x1 = 60 + 45 * Math.cos(startAngle * Math.PI / 180);
            const y1 = 60 + 45 * Math.sin(startAngle * Math.PI / 180);
            const x2 = 60 + 45 * Math.cos(endAngle * Math.PI / 180);
            const y2 = 60 + 45 * Math.sin(endAngle * Math.PI / 180);
            const path = `M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const fills = ['#ccc', '#999', '#666', '#444', '#bbb'];
            startAngle = endAngle;
            return `<path d="${path}" fill="${fills[i % fills.length]}" stroke="#333" stroke-width="1"/>`;
        }).join('');
        
        const legend = categories.map((cat, i) => `${(cat || '').substring(0, 6)}: ${values[i]}`).join(' | ');
        
        return `
            <div class="worksheet-problem" style="min-height:170px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    <svg width="120" height="120" viewBox="0 0 120 120" style="display:block;margin:0 auto;">
                        <circle cx="60" cy="60" r="45" fill="#fff" stroke="#333" stroke-width="1"/>
                        ${slices}
                    </svg>
                    <div style="font-size:0.65rem;color:#666;margin:4px 0;">${legend}</div>
                    <div style="font-size:0.85rem;margin-bottom:6px;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                </div>
            </div>`;
    }

    // ===== MEASUREMENT FORMATS =====
    // Elapsed Time with clocks
    if (problem.printFormat === "measurement-elapsed" && problem.measurementData) {
        const md = problem.measurementData;
        const startClock = createAnalogClockSVG(md.startHour || 9, md.startMin || 0, { size: 160, colorScheme: 'gray', forPrint: true });

        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    <div style="margin-bottom:8px;">${startClock}</div>
                    <div style="font-size:0.8rem;color:#666;">Start Time</div>
                    <div style="font-size:0.85rem;margin:8px 0;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:4px;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Clock Matching (analog to digital)
    if (problem.printFormat === "measurement-clock-match" && problem.measurementData) {
        const md = problem.measurementData;
        const clock = createAnalogClockSVG(md.hour || 3, md.minute || 0, { size: 160, colorScheme: 'gray', forPrint: true });

        return `
            <div class="worksheet-problem" style="min-height:200px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    ${clock}
                    <div style="font-size:0.85rem;margin:10px 0;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:4px;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Temperature
    if (problem.printFormat === "measurement-temp" && problem.measurementData) {
        const md = problem.measurementData;
        const temp = md.temperature || md.temp || 70;
        const thermHeight = 80;
        const fillHeight = Math.min(thermHeight * (temp / 120), thermHeight);
        
        const thermSVG = `
            <svg width="40" height="100" viewBox="0 0 40 100">
                <rect x="12" y="5" width="16" height="${thermHeight}" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
                <rect x="14" y="${5 + thermHeight - fillHeight}" width="12" height="${fillHeight}" fill="#c00"/>
                <circle cx="20" cy="90" r="8" fill="#c00" stroke="#333" stroke-width="1"/>
                <text x="32" y="15" font-size="7">100°</text>
                <text x="32" y="45" font-size="7">50°</text>
                <text x="32" y="80" font-size="7">0°</text>
            </svg>`;
        
        return `
            <div class="worksheet-problem" style="min-height:150px;">
                ${num}
                <div class="problem-content" style="text-align:center;">
                    ${thermSVG}
                    <div style="font-size:0.85rem;margin:8px 0;">${text}</div>
                    <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                </div>
            </div>`;
    }
    
    // Capacity
    if (problem.printFormat === "measurement-capacity" && problem.measurementData) {
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="font-size:0.85rem;margin-bottom:8px;">${text}</div>
                    <div style="display:flex;gap:15px;margin-bottom:8px;">
                        <div style="text-align:center;">
                            <div style="width:30px;height:50px;border:2px solid #333;border-radius:0 0 5px 5px;margin:0 auto;"></div>
                            <div style="font-size:0.7rem;">Cup</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="width:40px;height:55px;border:2px solid #333;border-radius:0 0 5px 5px;margin:0 auto;"></div>
                            <div style="font-size:0.7rem;">Pint</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="width:45px;height:60px;border:2px solid #333;border-radius:0 0 5px 5px;margin:0 auto;"></div>
                            <div style="font-size:0.7rem;">Quart</div>
                        </div>
                    </div>
                    <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                </div>
            </div>`;
    }

    // ===== ESTIMATION FORMATS =====
    // Estimation with number line visual
    if ((problem.printFormat === "estimation-sum" || problem.printFormat === "estimation-diff" || 
         problem.printFormat === "estimation-prod" || problem.printFormat === "estimation-compatible" ||
         problem.printFormat === "estimation-frontend") && problem.estimationData) {
        const ed = problem.estimationData;
        
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="font-size:0.9rem;margin-bottom:8px;">${text}</div>
                    <div style="display:flex;gap:20px;align-items:flex-start;">
                        <div style="flex:1;">
                            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">Round each number:</div>
                            <div style="display:flex;gap:10px;margin-bottom:8px;">
                                <span style="border-bottom:1.5px solid #666;min-width:60px;text-align:center;">&nbsp;</span>
                                <span style="border-bottom:1.5px solid #666;min-width:60px;text-align:center;">&nbsp;</span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">Estimate:</div>
                            <div style="border-bottom:2px solid #333;padding:3px;">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    // Estimation without estimationData - simpler format
    if (problem.printFormat && problem.printFormat.startsWith("estimation-") && !problem.estimationData) {
        return `
            <div class="worksheet-problem">
                ${num}
                <div class="problem-content">
                    <div style="font-size:0.9rem;margin-bottom:10px;">${text}</div>
                    <div style="font-size:0.8rem;color:#666;margin-bottom:6px;">Show your rounding:</div>
                    <div style="border:1px dashed #999;padding:15px;border-radius:4px;margin-bottom:8px;min-height:30px;"></div>
                    <div style="display:flex;align-items:baseline;gap:8px;"><span style="font-weight:600;white-space:nowrap;">Estimate:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
                </div>
            </div>`;
    }
    
    // ========== NEW VISUAL SKILLS PRINT FORMATTERS ==========
    // CSS variable wrapper for reusing screen visuals in print context
    const printVisualWrap = (visual) => {
        // Strip screen-only decorations from visuals for print
        let cleaned = (visual || '')
            // Strip purple skill title headers embedded in visuals
            .replace(/<div[^>]*color:\s*var\(--accent-purple\)[^>]*>.*?<\/div>/gi, '')
            // Strip emoji characters (house, colored circles, stars, etc.)
            .replace(/[\u{1F3E0}\u{1F3E1}\u{1F7E0}\u{1F7E1}\u{1F7E2}\u{1F7E3}\u{1F7E4}\u{2B50}\u{1F31F}\u{2795}\u{2796}\u{2716}\u{FE0F}\u{2797}]/gu, '')
            // Strip "(sq)" screen-only label
            .replace(/\(sq\)/g, '')
            // Strip colored left borders on divs (screen-only decoration)
            .replace(/border-left:\s*\d+px\s+solid\s+(?:var\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)\s*;?/gi, '');
        // Strip visual-equation divs that give away operations in word problems
        cleaned = cleaned.replace(/<div\s+class="visual-equation"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
        cleaned = cleaned.replace(/<div\s+class="visual-equation"[^>]*>[\s\S]*?<\/div>/gi, '');
        // Strip LCD hint sections that reveal fraction conversion steps
        cleaned = cleaned.replace(/<div[^>]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.08\)[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
        return `<div class="print-visual-wrap" style="--accent-green:#22c55e;--accent-orange:#f59e0b;--accent-cyan:#0891b2;--accent-purple:#9333ea;--bg-card:#fff;--bg-card-light:#f5f5f5;--border-light:#e5e5e5;--text-bright:#333;--text-dim:#666;max-width:100%;overflow:hidden;">${cleaned}</div>`;
    };

    // Arrays & Equal Groups
    if (problem.printFormat === "arrays-groups" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Multiplication Properties
    if (problem.printFormat === "mult-properties" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Division with Remainders
    if (problem.printFormat === "div-remainders" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Fraction of a Set
    if ((problem.printFormat === "fraction-of-set" || problem.printFormat === "fraction-of-set-hard") && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Equivalent Fractions Visual - dedicated print handler with pie charts
    // Multiple print types for worksheet variety: shade, fill numbers, compare
    if (problem.printFormat === "equiv-frac-visual" && problem.fractionData) {
        const fd = problem.fractionData;
        const sz = 49; // Circle size - reduced 30% for print compactness
        const pt = fd.printType || 'both_shaded';

        // Helper: fraction notation with optional blanks
        const fracNotation = (n, d, blankNum, blankDen) => {
            const numPart = blankNum
                ? `<span style="display:inline-block;min-width:22px;border-bottom:2px solid #333;">&nbsp;</span>`
                : `<span style="font-size:1rem;font-weight:600;">${n}</span>`;
            const denPart = blankDen
                ? `<span style="display:inline-block;min-width:22px;border-bottom:2px solid #333;">&nbsp;</span>`
                : `<span style="font-size:1rem;font-weight:600;">${d}</span>`;
            return `<div style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.1;">
                ${numPart}<div style="width:22px;border-bottom:2px solid #333;margin:1px 0;"></div>${denPart}
            </div>`;
        };

        // Helper: circle + fraction side-by-side (fraction on right of circle)
        const circleWithFrac = (circle, frac) => `<div style="display:flex;align-items:center;gap:6px;">${circle}${frac}</div>`;

        // Helper: empty circle (unshaded, only division lines visible)
        const emptyCircle = (den) => printPieChartLight(0, den, sz, '#fff', '#999');

        let inner = '';

        if (pt === 'both_shaded') {
            // Both circles shaded, student writes fractions and tells if equivalent
            const c1 = printPieChartLight(fd.num1, fd.den1, sz);
            const c2 = printPieChartLight(fd.num2, fd.den2, sz, PASTEL_COLORS.blue.fill);
            const f1 = fracNotation(0, 0, true, true);
            const f2 = fracNotation(0, 0, true, true);
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Write each fraction. Are they equivalent?</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="display:inline-block;width:26px;height:20px;border:2px solid #333;border-radius:3px;text-align:center;line-height:20px;">&nbsp;</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        } else if (pt === 'shade_second') {
            // First circle shaded with fraction, second empty for student to shade
            const c1 = printPieChartLight(fd.num1, fd.den1, sz);
            const c2 = emptyCircle(fd.den2);
            const f1 = fracNotation(fd.num1, fd.den1, false, false);
            const f2 = fracNotation(0, 0, true, true);
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Shade an equivalent fraction. Write it.</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="font-size:1.3rem;font-weight:700;">=</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        } else if (pt === 'fill_numbers') {
            // Both circles shaded, student fills in fraction numbers only
            const c1 = printPieChartLight(fd.num1, fd.den1, sz);
            const c2 = printPieChartLight(fd.num2, fd.den2, sz, PASTEL_COLORS.blue.fill);
            const f1 = fracNotation(fd.num1, fd.den1, false, false);
            const f2 = fracNotation(0, 0, true, true);
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Write the equivalent fraction shown.</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="font-size:1.3rem;font-weight:700;">=</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        } else if (pt === 'compare') {
            // Both shaded with fractions shown, student writes = or ≠
            const c1 = printPieChartLight(fd.num1, fd.den1, sz);
            const c2 = printPieChartLight(fd.num2, fd.den2, sz, PASTEL_COLORS.blue.fill);
            const f1 = fracNotation(fd.num1, fd.den1, false, false);
            const f2 = fracNotation(fd.num2, fd.den2, false, false);
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Write = or \u2260. Are these equivalent?</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="display:inline-block;width:26px;height:20px;border:2px solid #333;border-radius:3px;text-align:center;line-height:20px;">&nbsp;</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        } else if (pt === 'shade_both_compare') {
            // Both circles empty with fractions, student shades both then compares
            const c1 = emptyCircle(fd.den1);
            const c2 = emptyCircle(fd.den2);
            const f1 = fracNotation(fd.num1, fd.den1, false, false);
            const f2 = fracNotation(fd.num2, fd.den2, false, false);
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Shade both fractions. Write = or \u2260.</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="display:inline-block;width:26px;height:20px;border:2px solid #333;border-radius:3px;text-align:center;line-height:20px;">&nbsp;</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        } else if (pt === 'missing_number') {
            // Both circles shaded, one fraction number missing
            const c1 = printPieChartLight(fd.num1, fd.den1, sz);
            const c2 = printPieChartLight(fd.num2, fd.den2, sz, PASTEL_COLORS.blue.fill);
            const f1 = fracNotation(fd.num1, fd.den1, false, false);
            const f2 = fracNotation(fd.num2, fd.den2, fd.missingPart === 'num2', fd.missingPart === 'den2');
            inner = `<div style="font-size:0.85rem;margin-bottom:6px;font-weight:600;">Find the missing number.</div>
                <div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;">
                    ${circleWithFrac(c1, f1)}
                    <span style="font-size:1.3rem;font-weight:700;">=</span>
                    ${circleWithFrac(c2, f2)}
                </div>`;
        }

        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">${inner}</div></div>`;
    }

    // Equivalent Fractions Visual - fallback for problems without fractionData
    if (problem.printFormat === "equiv-frac-visual" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Area with Unit Squares
    if (problem.printFormat === "area-unit-squares" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Area =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>sq units</span></div>
        </div></div>`;
    }

    // Perimeter on Grid
    if (problem.printFormat === "perimeter-grid" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Perimeter =</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span><span>units</span></div>
        </div></div>`;
    }

    // Reading a Ruler
    if ((problem.printFormat === "reading-ruler" || problem.printFormat === "reading-ruler-hard") && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Money Count (coins & bills)
    if (problem.printFormat === "money-count" && problem.measurementData) {
        const md = problem.measurementData;
        let moneyVisual = '';
        if (md.mode === 'coins' && md.coins) {
            const coinStyles = { 1: {bg:'#b87333',border:'#8b5a2b',color:'#fff',size:28,label:'1'},
                5: {bg:'#c0c0c0',border:'#999',color:'#333',size:32,label:'5'},
                10: {bg:'#d4d4d4',border:'#aaa',color:'#333',size:34,label:'10'},
                20: {bg:'#c9b037',border:'#a89030',color:'#fff',size:36,label:'20'},
                50: {bg:'#b8b8b8',border:'#777',color:'#333',size:40,label:'50'} };
            const coins = md.coins.map(v => {
                const s = coinStyles[v] || coinStyles[1];
                return `<div style="display:inline-flex;flex-direction:column;align-items:center;margin:3px;"><div style="display:flex;align-items:center;justify-content:center;width:${s.size}px;height:${s.size}px;border-radius:50%;background:${s.bg};border:2px solid ${s.border};color:${s.color};font-size:${Math.max(10,s.size*0.4)}px;font-weight:800;">${s.label}</div><span style="font-size:7px;color:#666;">Cents</span></div>`;
            }).join('');
            moneyVisual = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:10px;border:1px solid #ddd;border-radius:8px;">${coins}</div>`;
        } else if (md.mode === 'bills' && md.bills) {
            const billShades = { 1:'#a8d5a2', 2:'#9dd09d', 5:'#8bc98a', 10:'#6fbf6f', 20:'#58b058', 50:'#449944', 100:'#338833', 500:'#226e22', 1000:'#1a601a' };
            const bills = md.bills.map(v => {
                const shade = billShades[v] || '#a8d5a2';
                return `<div style="display:inline-flex;align-items:center;justify-content:center;width:60px;height:28px;border-radius:4px;background:${shade};border:1.5px solid #2a5a2a;color:#fff;font-size:11px;font-weight:700;margin:3px;">$${v}</div>`;
            }).join('');
            moneyVisual = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:10px;border:1px solid #ddd;border-radius:8px;">${bills}</div>`;
        } else {
            moneyVisual = printVisualWrap(problem.visual);
        }
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${moneyVisual}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;"><span style="font-weight:600;white-space:nowrap;">Total:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Line Plot with Fractions
    if (problem.printFormat === "line-plot-fractions" && problem.dataData) {
        const dd = problem.dataData;
        const positions = dd.positions || [];
        const countsByPos = dd.countsByPos || {};
        const svgW = 320;
        const svgH = 120;
        const leftPad = 20;
        const rightPad = 20;
        const lineY = svgH - 30;
        const uniquePos = [...new Set(positions)].sort((a,b) => {
            const parseF = (s) => { const p = s.split('/'); return p.length === 2 ? parseInt(p[0])/parseInt(p[1]) : parseFloat(s); };
            return parseF(a) - parseF(b);
        });
        const spacing = uniquePos.length > 1 ? (svgW - leftPad - rightPad) / (uniquePos.length - 1) : svgW / 2;
        let ticksAndLabels = '';
        let xMarks = '';
        uniquePos.forEach((pos, i) => {
            const x = uniquePos.length > 1 ? leftPad + i * spacing : svgW / 2;
            ticksAndLabels += `<line x1="${x}" y1="${lineY - 5}" x2="${x}" y2="${lineY + 5}" stroke="#333" stroke-width="1.5"/>`;
            ticksAndLabels += `<text x="${x}" y="${lineY + 20}" text-anchor="middle" font-size="9" fill="#333">${pos}</text>`;
            const count = countsByPos[pos] || 0;
            for (let j = 0; j < count; j++) {
                xMarks += `<text x="${x}" y="${lineY - 12 - j * 14}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">X</text>`;
            }
        });
        const linePlotSVG = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
            <line x1="${leftPad}" y1="${lineY}" x2="${svgW - rightPad}" y2="${lineY}" stroke="#333" stroke-width="2"/>
            ${ticksAndLabels}${xMarks}
        </svg>`;
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            <div style="text-align:center;">${linePlotSVG}</div>
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Tape Diagram
    if (problem.printFormat === "tape-diagram" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Multi-Step Word Problems
    if (problem.printFormat === "multi-step-word" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1.15rem;line-height:1.75;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div class="ws-work-space" style="min-height:80px;">
                <div class="ws-work-space-label">Show your work:</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;align-items:baseline;">
                <span style="font-weight:600;font-size:0.95rem;white-space:nowrap;">Step 1:</span>
                <span style="flex:1;min-width:80px;border-bottom:2px solid #999;">&nbsp;</span>
                <span style="font-weight:600;font-size:0.95rem;white-space:nowrap;">Step 2:</span>
                <span style="flex:1;min-width:80px;border-bottom:2px solid #999;">&nbsp;</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:10px;margin-top:12px;">
                <span style="font-weight:700;font-size:1.1rem;white-space:nowrap;">Answer:</span>
                <span style="flex:1;border-bottom:3px solid #333;min-height:1.4em;">&nbsp;</span>
            </div>
        </div></div>`;
    }

    // Skip Counting Number Line
    if (problem.printFormat === "skip-count-line" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Skip Counting Grid
    if (problem.printFormat === "skip-count-grid" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Rounding Visual (number line)
    if (problem.printFormat === "rounding-visual" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Rounding Table (NUMBER | NEAREST 10 | NEAREST 100 | NEAREST 1000)
    if (problem.printFormat === "rounding-table" && problem.roundingTableData) {
        const td = problem.roundingTableData;
        const cols = td.columns || [];
        const rows = td.rows || [];
        let tableHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-top:4px;">
            <thead><tr>
                <th style="border:2px solid #333;padding:6px 10px;background:#f0f0f0;font-weight:700;text-align:center;">Number</th>`;
        for (const col of cols) {
            tableHTML += `<th style="border:2px solid #333;padding:6px 10px;background:#f0f0f0;font-weight:700;text-align:center;">${col.label}</th>`;
        }
        tableHTML += `</tr></thead><tbody>`;
        for (const row of rows) {
            tableHTML += `<tr><td style="border:2px solid #333;padding:5px 10px;text-align:center;font-weight:600;">${row.number.toLocaleString()}</td>`;
            for (const col of cols) {
                tableHTML += `<td style="border:2px solid #333;padding:5px 10px;text-align:center;"><span style="display:inline-block;min-width:50px;border-bottom:2px solid #333;">&nbsp;</span></td>`;
            }
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody></table>`;
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            <div style="font-size:0.95rem;margin-bottom:6px;font-weight:600;">Round each number to the given place value.</div>
            ${tableHTML}
        </div></div>`;
    }

    // Place Value Disks
    if (problem.printFormat === "place-value-disks" && problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Fraction Number Line
    if (problem.printFormat === "fraction-number-line" && problem.visual) {
        // Strip onclick handlers and interactive buttons for print
        let printVis = problem.visual
            .replace(/\s*onclick="[^"]*"/g, '')
            .replace(/<button[^>]*id="checkPlacementBtn"[^>]*>.*?<\/button>/g, '')
            .replace(/style="cursor:pointer;"/g, '')
            .replace(/class="fnl-tick-target[^"]*"/g, 'class="fnl-tick-target"');
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(printVis)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Odd/Even (interactive select type)
    if (problem.printFormat === "odd-even" && problem.visual) {
        let printVis = problem.visual
            .replace(/\s*onclick="[^"]*"/g, '')
            .replace(/<button[^>]*id="checkOddEvenBtn"[^>]*>.*?<\/button>/g, '')
            .replace(/style="cursor:pointer;/g, 'style="');
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(printVis)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Number line hop visuals (nl-add, nl-sub, nl-mult, nl-div)
    if (problem.printFormat && problem.printFormat.startsWith('nl-') && problem.visual) {
        let printVis = problem.visual.replace(/var\(--[^)]+\)/g, '#333');
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(printVis)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;">
                <span style="font-weight:600;white-space:nowrap;">Answer:</span>
                <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
            </div>
        </div></div>`;
    }

    // ===== NV Fraction Skills — Unified Worksheet-Style Handler =====
    if (problem.printFormat && problem.printFormat.endsWith('-nv')) {
        const rawText = (problem.text || '').replace(/\s*=\s*\??\s*$/, '').replace(/\?$/, '').trim();

        const fracFont = "system-ui, -apple-system, 'Segoe UI', sans-serif";

        // Helper: stacked fraction display using print CSS classes
        const stackFrac = (n, d) => `<div class="fraction-display" style="margin:0 4px;"><span class="numerator">${n}</span><div class="fraction-bar"></div><span class="denominator">${d}</span></div>`;

        // Empty fraction answer box (numerator + bar + denominator boxes)
        const fracAnsBox = `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1;margin-left:8px;"><span style="min-width:36px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span><span style="width:100%;height:2px;background:#333;margin:2px 0;min-width:36px;"></span><span style="min-width:36px;min-height:22px;border:2px solid #333;border-radius:3px;display:inline-block;">&nbsp;</span></span>`;

        // Empty single-value answer box
        const singleAnsBox = `<span style="min-width:40px;min-height:24px;border:2px solid #333;border-radius:4px;display:inline-block;vertical-align:middle;margin-left:8px;">&nbsp;</span>`;

        // Tokenize rawText into fractions, operators, and plain text, then render each
        // This avoids regex conflicts between operator wrapping and fraction HTML insertion
        const opStyle = 'font-size:1.3rem;font-weight:700;margin:0 4px;';
        const wrapOp = (ch) => `<span style="${opStyle}">${ch}</span>`;

        // Split by mixed numbers, fractions, operators — preserving delimiters
        // Matches: mixed numbers (2 3/4), fractions (3/4), operators (+−×÷=), or text chunks
        const tokens = rawText.match(/\d+\s+\d+\/\d+|\d+\/\d+|[+\-\u2212\u00d7\u00f7×÷=]|[^+\-\u2212\u00d7\u00f7×÷=\d\/]+|\d+/g) || [rawText];

        let rendered = tokens.map(tok => {
            // Mixed number: 2 3/4
            const mixedMatch = tok.match(/^(\d+)\s+(\d+)\/(\d+)$/);
            if (mixedMatch) return `<span style="font-size:1.2rem;font-weight:600;margin-right:2px;">${mixedMatch[1]}</span>${stackFrac(mixedMatch[2], mixedMatch[3])}`;
            // Simple fraction: 3/4
            const fracMatch = tok.match(/^(\d+)\/(\d+)$/);
            if (fracMatch) return stackFrac(fracMatch[1], fracMatch[2]);
            // Operators
            if (/^[+\u2212\u00d7\u00f7×÷=]$/.test(tok)) return wrapOp(tok);
            if (tok === '-') return wrapOp('−');
            // Plain text or number
            return tok;
        }).join(' ');

        // Detect whether this is an equation (fraction arithmetic) or a word-style problem
        const hasFracOp = /\d+\/\d+\s*[+\-\u2212\u00d7\u00f7×÷*]/.test(rawText) || /[+\-\u2212\u00d7\u00f7×÷*]\s*\d+\/\d+/.test(rawText);
        const hasEquals = rawText.includes('=');

        // Check if answer is a simple number (not a fraction) — use plain box instead
        const ans = String(problem.answer || problem.ans || '');
        const ansIsFraction = /\//.test(ans) || /\d+\s+\d+\/\d+/.test(ans);
        const answerBox = ansIsFraction ? fracAnsBox : singleAnsBox;

        let content;
        if (hasFracOp || hasEquals) {
            // Equation style: expression = [answer box]
            rendered = rendered.replace(/\s*<span[^>]*>[=]<\/span>\s*$/, '');
            content = `<div class="print-frac-equation" style="gap:8px;">
                ${rendered}
                <span style="font-size:1.3rem;font-weight:700;margin:0 4px;">=</span>
                ${answerBox}
            </div>`;
        } else {
            // Word problem / identification style: text then answer box
            content = `<div style="font-family:${fracFont};">
                <div style="font-size:1rem;margin-bottom:8px;">${rendered}</div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-weight:600;">Answer:</span>${answerBox}
                </div>
            </div>`;
        }

        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">${content}</div></div>`;
    }

    // Generic visual fallback: any skill with a visual that wasn't caught above
    if (problem.visual) {
        return `<div class="worksheet-problem${fullWidthClass}${sizeClass}">${num}<div class="problem-content">
            ${visualContainsText ? '' : `<div style="font-size:1rem;margin-bottom:8px;">${text}</div>`}
            ${printVisualWrap(problem.visual)}
            <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;"><span style="font-weight:600;white-space:nowrap;">Answer:</span><span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span></div>
        </div></div>`;
    }

    // Work space for spacious (word problem) layouts - proper dashed box
    const workSpaceHTML = isSpacious
        ? `<div class="ws-work-space"><div class="ws-work-space-label">Show your work:</div></div>`
        : '';

    // Spacious layout gets word-problem-style formatting with prominent answer line
    if (isSpacious) {
        return `
        <div class="worksheet-problem${fullWidthClass}${sizeClass}">
            ${num}
            <div class="problem-content">
                <div style="font-size:1.15rem;line-height:1.75;margin-bottom:8px;">${text}</div>
                ${workSpaceHTML}
                <div style="display:flex;align-items:baseline;gap:10px;margin-top:12px;">
                    <span style="font-weight:700;font-size:1.1rem;white-space:nowrap;">Answer:</span>
                    <span style="flex:1;border-bottom:3px solid #333;min-height:1.4em;">&nbsp;</span>
                </div>
            </div>
        </div>`;
    }

    // Default: add answer line at the end if no blanks in text
    return `
        <div class="worksheet-problem${fullWidthClass}${sizeClass}">
            ${num}
            <div class="problem-content">
                <div class="horizontal-problem" style="display:flex;align-items:baseline;gap:8px;">
                    ${text}
                    <span style="flex:1;border-bottom:2px solid #333;">&nbsp;</span>
                </div>
            </div>
        </div>`;
}

export function generateWorksheetHTML() {
    // Synchronous version for downloads - simpler and faster
    const title = document.getElementById('printWorksheetTitle').value || 'Math Practice Worksheet';
    let problemCount = Math.min(parseInt(document.getElementById('printProblemCount').value) || 20, 100);
    const columns = parseInt(document.getElementById('printLayout').value) || 2;
    const includeAnswerKey = document.getElementById('printIncludeAnswerKey').checked;
    let numSets = Math.min(parseInt(document.getElementById('printNumSets')?.value || 1), 5);
    const isGreyscale = document.getElementById('printStyleGreyscale')?.checked || false;
    
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    // Support 1-10 columns
    const gridCols = `repeat(${columns}, 1fr)`;
    const gridGap = columns >= 10 ? '6px 4px' : columns >= 6 ? '10px 8px' : columns >= 3 ? '15px 12px' : '22px 20px';
    const getSetLabel = (i) => String.fromCharCode(65 + i);
    const greyscaleStyle = isGreyscale ? 'filter: grayscale(100%);' : '';
    
    let allSetsHTML = '';
    
    for (let setNum = 0; setNum < numSets; setNum++) {
        const problems = [];
        
        for (let i = 0; i < problemCount; i++) {
            try {
                const p = generatePrintProblem();
                problems.push(p && p.text ? p : { text: `${i+10} + ${i+5} = ___`, ans: i+15, printFormat: 'horizontal' });
            } catch (e) {
                problems.push({ text: `${i+10} + ${i+5} = ___`, ans: i+15, printFormat: 'horizontal' });
            }
        }
        
        const problemsHTML = problems.map((p, i) => formatProblemForPrint(p, i, columns)).join('');
        
        let answerKeyHTML = '';
        if (includeAnswerKey) {
            const answersHTML = problems.map((p, i) => {
                let ansDisplay = p.ans;
                if (p.printFormat === 'rounding-table' && p.roundingTableData) {
                    const td = p.roundingTableData;
                    ansDisplay = td.rows.map(r => {
                        const vals = td.columns.map(c => r[`nearest${c.place}`].toLocaleString());
                        return `${r.number.toLocaleString()}: ${vals.join(', ')}`;
                    }).join(' | ');
                }
                const label = p.skillLabel || '';
                return `<div class="answer-key-item"><span class="answer-key-num">${i + 1}.</span><span class="answer-key-ans">${ansDisplay}</span>${label ? `<span style="color:#666;font-size:0.75em;margin-left:4px;">(${label})</span>` : ''}</div>`;
            }).join('');
            answerKeyHTML = `<div class="answer-key-section"><div class="answer-key-title">📝 Answer Key</div><div class="answer-key-grid">${answersHTML}</div></div>`;
        }

        const pageBreak = setNum > 0 ? 'page-break-before: always;' : '';
        const setLabel = numSets > 1 ? `<div style="text-align:right;font-weight:700;">Set ${getSetLabel(setNum)}</div>` : '';

        if (setNum > 0) {
            allSetsHTML += `<div class="ws-page-break-indicator">\u2014 Page Break \u2014</div>`;
        }
        allSetsHTML += `
            <div class="worksheet-set" style="${pageBreak}${greyscaleStyle}">
                ${setLabel}
                <div class="worksheet-header">
                    <div class="worksheet-title">${title}</div>
                    <div class="worksheet-info-row">
                        <div class="worksheet-field"><span class="worksheet-field-label">Name:</span><span class="worksheet-field-line"></span></div>
                        <div class="worksheet-field"><span class="worksheet-field-label">Date:</span><span class="worksheet-field-line"></span></div>
                        <div class="worksheet-field" style="max-width:120px;"><span class="worksheet-field-label">Score:</span><span class="worksheet-field-line" style="position:relative;"><span style="position:absolute;right:0;bottom:2px;font-size:0.9em;color:#333;">/ ${problems.length}</span></span></div>
                    </div>
                </div>
                <div class="worksheet-problems" style="grid-template-columns: ${gridCols};gap:${gridGap};">${problemsHTML}</div>
                ${answerKeyHTML}
            </div>`;
    }

    return allSetsHTML;
}

// Generate step-by-step solution for a problem
export function generateWorkedSolution(problem) {
    const steps = [];
    const p = problem;
    
    // ========================================
    // BASIC OPERATIONS (column format)
    // ========================================
    if (p.printFormat === 'column-add' || p.printFormat === 'column-sub') {
        const a = p.a, b = p.b;
        steps.push(`<strong>Problem:</strong> ${a} ${p.op} ${b}`);
        
        if (p.op === '+') {
            const aStr = a.toString(), bStr = b.toString();
            steps.push(`Step 1: Line up by place value`);
            steps.push(`Step 2: Add each column right to left`);
            if (a >= 100 || b >= 100) {
                const placeNames = ['ones', 'tens', 'hundreds', 'thousands'];
                let carry = 0;
                for (let i = 0; i < Math.min(3, Math.max(aStr.length, bStr.length)); i++) {
                    const aDigit = parseInt(aStr[aStr.length - 1 - i] || '0');
                    const bDigit = parseInt(bStr[bStr.length - 1 - i] || '0');
                    const sum = aDigit + bDigit + carry;
                    carry = Math.floor(sum / 10);
                    steps.push(`  ${placeNames[i]}: ${aDigit} + ${bDigit}${carry > 0 && sum >= 10 ? ' = ' + sum + ' (carry 1)' : ' = ' + (sum % 10)}`);
                }
            }
            steps.push(`<strong>Answer: ${a + b}</strong>`);
        } else {
            steps.push(`Step 1: Line up by place value`);
            steps.push(`Step 2: Subtract each column right to left`);
            steps.push(`Step 3: Borrow when top digit < bottom digit`);
            steps.push(`<strong>Answer: ${Math.abs(a - b)}</strong>`);
        }
    }
    else if (p.printFormat === 'column-mult') {
        const a = p.a, b = p.b;
        steps.push(`<strong>Problem:</strong> ${a} × ${b}`);
        const bStr = b.toString();
        if (bStr.length === 1) {
            steps.push(`Step 1: Multiply ${a} × ${b}`);
        } else {
            steps.push(`Step 1: Multiply by ones digit: ${a} × ${bStr[bStr.length-1]} = ${a * parseInt(bStr[bStr.length-1])}`);
            steps.push(`Step 2: Multiply by tens digit: ${a} × ${bStr[bStr.length-2]}0 = ${a * parseInt(bStr[bStr.length-2]) * 10}`);
            steps.push(`Step 3: Add partial products`);
        }
        steps.push(`<strong>Answer: ${a * b}</strong>`);
    }
    else if (p.printFormat === 'long-division') {
        const dividend = p.a, divisor = p.b;
        const quotient = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;
        steps.push(`<strong>Problem:</strong> ${dividend} ÷ ${divisor}`);
        steps.push(`Step 1: How many times does ${divisor} go into ${dividend}?`);
        steps.push(`Step 2: ${divisor} × ${quotient} = ${divisor * quotient}`);
        steps.push(`Step 3: ${dividend} - ${divisor * quotient} = ${remainder}`);
        steps.push(remainder > 0 ? `<strong>Answer: ${quotient} R ${remainder}</strong>` : `<strong>Answer: ${quotient}</strong>`);
    }
    // ========================================
    // ORDER OF OPERATIONS
    // ========================================
    else if (p.printFormat === 'order-of-ops') {
        const expr = p.expression || p.text.replace(' = ___', '');
        steps.push(`<strong>Problem:</strong> ${expr}`);
        steps.push(`<strong>PEMDAS:</strong>`);
        steps.push(`  P - Parentheses first`);
        steps.push(`  E - Exponents next`);
        steps.push(`  M/D - Multiply/Divide left to right`);
        steps.push(`  A/S - Add/Subtract left to right`);
        if (p.oooSteps && p.oooSteps.length) {
            p.oooSteps.forEach((s, i) => steps.push(`Step ${i+1}: ${s}`));
        }
        steps.push(`<strong>Answer: ${p.ans}</strong>`);
    }
    else if (p.printFormat === 'compare-expressions' && p.compareData) {
        const cd = p.compareData;
        steps.push(`<strong>Left:</strong> ${cd.leftExpr} = ${cd.leftVal}`);
        steps.push(`<strong>Right:</strong> ${cd.rightExpr} = ${cd.rightVal}`);
        steps.push(`<strong>Answer: ${cd.leftVal} ${cd.symbol} ${cd.rightVal}</strong>`);
    }
    // ========================================
    // FRACTIONS
    // ========================================
    else if (p.printFormat === 'fraction-op' && p.fractionData) {
        const fd = p.fractionData;
        steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom} ${fd.op} ${fd.num2}/${fd.denom}`);
        steps.push(`Step 1: Same denominator - ${fd.op === '+' ? 'add' : 'subtract'} numerators`);
        const result = fd.op === '+' ? fd.num1 + fd.num2 : fd.num1 - fd.num2;
        steps.push(`Step 2: ${fd.num1} ${fd.op} ${fd.num2} = ${result}`);
        steps.push(`<strong>Answer: ${result}/${fd.denom}</strong>`);
    }
    else if (p.printFormat === 'fraction-unlike-op' && p.fractionData) {
        const fd = p.fractionData;
        steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} ${fd.op} ${fd.num2}/${fd.denom2}`);
        steps.push(`Step 1: Find LCD = ${fd.lcd}`);
        steps.push(`Step 2: Convert: ${fd.num1}/${fd.denom1} = ${fd.convertedNum1}/${fd.lcd}`);
        steps.push(`Step 3: Convert: ${fd.num2}/${fd.denom2} = ${fd.convertedNum2}/${fd.lcd}`);
        steps.push(`Step 4: ${fd.op === '+' ? 'Add' : 'Subtract'}: ${fd.convertedNum1} ${fd.op} ${fd.convertedNum2}`);
        steps.push(`<strong>Answer: ${p.ans}</strong>`);
    }
    else if (p.printFormat === 'improper-to-mixed' && p.fractionData) {
        const fd = p.fractionData;
        steps.push(`<strong>Problem:</strong> Convert ${fd.totalNum}/${fd.den} to mixed number`);
        steps.push(`Step 1: Divide: ${fd.totalNum} ÷ ${fd.den} = ${fd.wholes} R ${fd.extraNum}`);
        steps.push(`Step 2: Whole number = ${fd.wholes}`);
        steps.push(`Step 3: Remainder = new numerator = ${fd.extraNum}`);
        steps.push(`<strong>Answer: ${fd.wholes} ${fd.extraNum}/${fd.den}</strong>`);
    }
    else if (p.printFormat === 'mixed-to-improper' && p.fractionData) {
        const fd = p.fractionData;
        steps.push(`<strong>Problem:</strong> Convert ${fd.wholes} ${fd.extraNum}/${fd.den} to improper`);
        steps.push(`Step 1: Multiply: ${fd.wholes} × ${fd.den} = ${fd.wholes * fd.den}`);
        steps.push(`Step 2: Add numerator: ${fd.wholes * fd.den} + ${fd.extraNum} = ${fd.totalNum}`);
        steps.push(`<strong>Answer: ${fd.totalNum}/${fd.den}</strong>`);
    }
    else if (p.fractionData && !p.printFormat) {
        const fd = p.fractionData;
        if (fd.op === '×' || fd.op === '*') {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} × ${fd.num2}/${fd.denom2}`);
            steps.push(`Step 1: Multiply numerators: ${fd.num1} × ${fd.num2} = ${fd.num1 * fd.num2}`);
            steps.push(`Step 2: Multiply denominators: ${fd.denom1} × ${fd.denom2} = ${fd.denom1 * fd.denom2}`);
            steps.push(`Step 3: Simplify if possible`);
        } else if (fd.op === '÷') {
            steps.push(`<strong>Problem:</strong> ${fd.num1}/${fd.denom1} ÷ ${fd.num2}/${fd.denom2}`);
            steps.push(`Step 1: Keep first fraction`);
            steps.push(`Step 2: Change ÷ to ×`);
            steps.push(`Step 3: Flip second fraction`);
            steps.push(`Step 4: ${fd.num1}/${fd.denom1} × ${fd.denom2}/${fd.num2}`);
        } else if (fd.symbol) {
            steps.push(`<strong>Problem:</strong> Compare fractions`);
            steps.push(`Step 1: Cross multiply`);
            steps.push(`Step 2: ${fd.num1} × ${fd.denom2} = ${fd.num1 * fd.denom2}`);
            steps.push(`Step 3: ${fd.num2} × ${fd.denom1} = ${fd.num2 * fd.denom1}`);
        }
        steps.push(`<strong>Answer: ${p.ans}</strong>`);
    }
    // ========================================
    // DECIMALS
    // ========================================
    else if (p.decimalData) {
        const dd = p.decimalData;
        if (dd.op === '+') {
            steps.push(`<strong>Problem:</strong> ${dd.a} + ${dd.b}`);
            steps.push(`Step 1: Line up decimal points`);
            steps.push(`Step 2: Add zeros as placeholders`);
            steps.push(`Step 3: Add each column`);
            steps.push(`Step 4: Bring down decimal point`);
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        } else if (dd.op === '-' || dd.op === '−') {
            steps.push(`<strong>Problem:</strong> ${dd.a} - ${dd.b}`);
            steps.push(`Step 1: Line up decimal points`);
            steps.push(`Step 2: Add zeros as placeholders`);
            steps.push(`Step 3: Subtract each column`);
            steps.push(`Step 4: Bring down decimal point`);
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        } else if (dd.op === '×' || dd.op === '*') {
            steps.push(`<strong>Problem:</strong> ${dd.a} × ${dd.b}`);
            steps.push(`Step 1: Multiply as whole numbers (ignore decimals)`);
            steps.push(`Step 2: Count total decimal places: ${(dd.aPlaces || 0) + (dd.bPlaces || 0)}`);
            steps.push(`Step 3: Place decimal that many places from right`);
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        } else if (dd.dividend !== undefined) {
            steps.push(`<strong>Problem:</strong> ${dd.dividend} ÷ ${dd.divisor}`);
            steps.push(`Step 1: Set up long division`);
            steps.push(`Step 2: Move decimal if needed`);
            steps.push(`Step 3: Divide normally`);
            steps.push(`Step 4: Align decimal in answer`);
            steps.push(`<strong>Answer: ${dd.quotient}</strong>`);
        } else if (dd.answer && (dd.answer === '>' || dd.answer === '<' || dd.answer === '=')) {
            steps.push(`<strong>Problem:</strong> Compare ${dd.a} and ${dd.b}`);
            steps.push(`Step 1: Line up decimal points`);
            steps.push(`Step 2: Compare digit by digit from left`);
            steps.push(`<strong>Answer: ${dd.a} ${dd.answer} ${dd.b}</strong>`);
        } else if (dd.sorted) {
            steps.push(`<strong>Problem:</strong> Order decimals`);
            steps.push(`Step 1: Line up decimals to compare`);
            steps.push(`Step 2: Order from ${dd.direction === 'asc' ? 'least to greatest' : 'greatest to least'}`);
            steps.push(`<strong>Answer: ${dd.sorted.join(', ')}</strong>`);
        } else if (dd.target !== undefined) {
            steps.push(`<strong>Problem:</strong> Identify decimal on number line`);
            steps.push(`Step 1: Find whole numbers at ends`);
            steps.push(`Step 2: Count tick marks (each = 0.1)`);
            steps.push(`<strong>Answer: ${dd.target}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // ESTIMATION
    // ========================================
    else if (p.estimationData) {
        const ed = p.estimationData;
        if (ed.strategy === 'rounding') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.a} ${ed.op} ${ed.b}`);
            steps.push(`<strong>Strategy:</strong> Round to nearest ${ed.roundTo}`);
            steps.push(`Step 1: ${ed.a} → ${ed.aRounded}`);
            steps.push(`Step 2: ${ed.b} → ${ed.bRounded}`);
            steps.push(`Step 3: ${ed.aRounded} ${ed.op} ${ed.bRounded} = ${ed.estimate}`);
            steps.push(`<strong>Estimate: ${ed.estimate}</strong>`);
            if (ed.actual) steps.push(`Actual: ${ed.actual}`);
        } else if (ed.strategy === 'compatible') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.dividend} ÷ ${ed.divisor}`);
            steps.push(`<strong>Strategy:</strong> Compatible Numbers`);
            steps.push(`Step 1: Find number close to ${ed.dividend} divisible by ${ed.divisor}`);
            steps.push(`Step 2: ${ed.dividend} → ${ed.compatible}`);
            steps.push(`Step 3: ${ed.compatible} ÷ ${ed.divisor} = ${ed.estimate}`);
            steps.push(`<strong>Estimate: ${ed.estimate}</strong>`);
        } else if (ed.strategy === 'frontend') {
            steps.push(`<strong>Problem:</strong> Estimate ${ed.a} ${ed.op} ${ed.b}`);
            steps.push(`<strong>Strategy:</strong> Front-End Estimation`);
            steps.push(`Step 1: Use front digits only`);
            steps.push(`Step 2: ${ed.a} → ${ed.aFront}, ${ed.b} → ${ed.bFront}`);
            steps.push(`Step 3: ${ed.aFront} ${ed.op} ${ed.bFront} = ${ed.estimate}`);
            steps.push(`<strong>Estimate: ${ed.estimate}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${ed.estimate || p.ans}</strong>`);
        }
    }
    // ========================================
    // INTEGERS
    // ========================================
    else if (p.integerData) {
        const id = p.integerData;
        if (id.op === '+') {
            steps.push(`<strong>Problem:</strong> ${id.a} + ${id.b}`);
            const sameSign = (id.a >= 0) === (id.b >= 0);
            if (sameSign) {
                steps.push(`Rule: Same signs → Add, keep the sign`);
                steps.push(`Step 1: |${id.a}| + |${id.b}| = ${Math.abs(id.a) + Math.abs(id.b)}`);
            } else {
                steps.push(`Rule: Different signs → Subtract, use larger's sign`);
                steps.push(`Step 1: |${id.a}| = ${Math.abs(id.a)}, |${id.b}| = ${Math.abs(id.b)}`);
                steps.push(`Step 2: Subtract: ${Math.abs(Math.abs(id.a) - Math.abs(id.b))}`);
            }
            steps.push(`<strong>Answer: ${id.result}</strong>`);
        } else if (id.op === '-' || id.op === '−') {
            steps.push(`<strong>Problem:</strong> ${id.a} - ${id.b}`);
            steps.push(`Rule: Subtracting = Adding the opposite`);
            steps.push(`Step 1: ${id.a} - ${id.b} = ${id.a} + (${-id.b})`);
            steps.push(`Step 2: Apply addition rules`);
            steps.push(`<strong>Answer: ${id.result}</strong>`);
        } else if (id.answer) {
            steps.push(`<strong>Problem:</strong> Compare ${id.a} and ${id.b}`);
            steps.push(`Rule: On number line, right is greater`);
            steps.push(`<strong>Answer: ${id.a} ${id.answer} ${id.b}</strong>`);
        } else if (id.target !== undefined) {
            steps.push(`<strong>Problem:</strong> Find integer on number line`);
            steps.push(`Step: Count from 0 (right=positive, left=negative)`);
            steps.push(`<strong>Answer: ${id.target}</strong>`);
        }
    }
    // ========================================
    // ALGEBRA
    // ========================================
    else if (p.algebraData) {
        const ad = p.algebraData;
        if (ad.answer !== undefined && ad.op && ad.known !== undefined) {
            const inverseOps = {'+': '−', '-': '+', '×': '÷', '÷': '×'};
            steps.push(`<strong>Problem:</strong> x ${ad.op} ${ad.known} = ${ad.total}`);
            steps.push(`Step 1: Use inverse operation (${inverseOps[ad.op]})`);
            steps.push(`Step 2: x = ${ad.total} ${inverseOps[ad.op]} ${ad.known}`);
            steps.push(`<strong>Answer: x = ${ad.answer}</strong>`);
        } else if (ad.expression && ad.varVal !== undefined) {
            steps.push(`<strong>Problem:</strong> Evaluate ${ad.expression} when n = ${ad.varVal}`);
            steps.push(`Step 1: Substitute ${ad.varVal} for n`);
            steps.push(`Step 2: Follow order of operations`);
            steps.push(`<strong>Answer: ${ad.result}</strong>`);
        } else if (ad.template) {
            steps.push(`<strong>Problem:</strong> Write expression for:`);
            steps.push(`"${ad.template}"`);
            steps.push(`Key words: sum(+), difference(-), product(×), quotient(÷)`);
            steps.push(`<strong>Answer: ${ad.answer || p.ans}</strong>`);
        } else if (ad.testVal !== undefined) {
            const meanings = {'>': 'greater than', '<': 'less than', '≥': 'greater/equal', '≤': 'less/equal'};
            steps.push(`<strong>Problem:</strong> Is ${ad.testVal} ${ad.symbol} ${ad.boundary}?`);
            steps.push(`Step 1: ${ad.symbol} means "${meanings[ad.symbol]}"`);
            steps.push(`Step 2: Test: Is ${ad.testVal} ${meanings[ad.symbol]} ${ad.boundary}?`);
            steps.push(`<strong>Answer: ${ad.isTrue ? 'TRUE' : 'FALSE'}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // GEOMETRY
    // ========================================
    else if (p.geometryData) {
        const gd = p.geometryData;
        if (gd.perimeter !== undefined) {
            steps.push(`<strong>Problem:</strong> Find perimeter of ${gd.shape}`);
            if (gd.shape === 'rectangle') {
                steps.push(`Formula: P = 2l + 2w`);
                steps.push(`Step: P = 2(${gd.length}) + 2(${gd.width})`);
                steps.push(`Step: P = ${2*gd.length} + ${2*gd.width}`);
            } else if (gd.shape === 'square') {
                steps.push(`Formula: P = 4s`);
                steps.push(`Step: P = 4 × ${gd.side}`);
            } else if (gd.shape === 'triangle') {
                steps.push(`Formula: P = a + b + c`);
                steps.push(`Step: Add all three sides`);
            }
            steps.push(`<strong>Answer: ${gd.perimeter} units</strong>`);
        } else if (gd.area !== undefined) {
            steps.push(`<strong>Problem:</strong> Find area of ${gd.shape}`);
            if (gd.shape === 'rectangle') {
                steps.push(`Formula: A = l × w`);
                steps.push(`Step: A = ${gd.length} × ${gd.width}`);
            } else if (gd.shape === 'square') {
                steps.push(`Formula: A = s²`);
                steps.push(`Step: A = ${gd.side} × ${gd.side}`);
            } else if (gd.shape === 'triangle') {
                steps.push(`Formula: A = ½ × b × h`);
                steps.push(`Step: A = ½ × ${gd.base} × ${gd.height}`);
                steps.push(`Step: A = ${gd.base * gd.height} ÷ 2`);
            }
            steps.push(`<strong>Answer: ${gd.area} square units</strong>`);
        } else if (gd.volume !== undefined) {
            steps.push(`<strong>Problem:</strong> Find volume`);
            steps.push(`Formula: V = l × w × h`);
            steps.push(`Step: V = ${gd.length} × ${gd.width} × ${gd.height}`);
            steps.push(`<strong>Answer: ${gd.volume} cubic units</strong>`);
        } else if (gd.angleType) {
            steps.push(`<strong>Problem:</strong> Identify angle type`);
            steps.push(`Acute: < 90°, Right: = 90°, Obtuse: > 90°, Straight: = 180°`);
            if (gd.degrees) steps.push(`This angle: ${gd.degrees}°`);
            steps.push(`<strong>Answer: ${gd.angleType}</strong>`);
        } else if (gd.degrees !== undefined && !gd.angleType) {
            steps.push(`<strong>Problem:</strong> Measure the angle`);
            steps.push(`Step 1: Place protractor at vertex`);
            steps.push(`Step 2: Align with one ray`);
            steps.push(`Step 3: Read where other ray crosses`);
            steps.push(`<strong>Answer: ${gd.degrees}°</strong>`);
        } else if (gd.lineType) {
            steps.push(`<strong>Problem:</strong> Identify line relationship`);
            steps.push(`Parallel: never meet | Perpendicular: meet at 90°`);
            steps.push(`<strong>Answer: ${gd.lineType}</strong>`);
        } else if (gd.symmetryLines !== undefined) {
            steps.push(`<strong>Problem:</strong> Count lines of symmetry`);
            steps.push(`Definition: Line that divides into matching halves`);
            steps.push(`<strong>Answer: ${gd.symmetryLines} line(s)</strong>`);
        } else if (gd.x !== undefined && gd.y !== undefined) {
            steps.push(`<strong>Problem:</strong> Identify/plot point`);
            steps.push(`Format: (x, y) = (right/left, up/down)`);
            steps.push(`Step 1: Start at origin (0,0)`);
            steps.push(`Step 2: Move ${gd.x} ${gd.x >= 0 ? 'right' : 'left'}`);
            steps.push(`Step 3: Move ${gd.y} ${gd.y >= 0 ? 'up' : 'down'}`);
            steps.push(`<strong>Answer: (${gd.x}, ${gd.y})</strong>`);
        } else if (gd.triangleType) {
            steps.push(`<strong>Problem:</strong> Classify triangle`);
            steps.push(`By sides: Equilateral (3=), Isosceles (2=), Scalene (0=)`);
            steps.push(`By angles: Acute (all<90), Right (one=90), Obtuse (one>90)`);
            steps.push(`<strong>Answer: ${gd.triangleType}</strong>`);
        } else if (gd.quadType) {
            steps.push(`<strong>Problem:</strong> Classify quadrilateral`);
            steps.push(`Square: 4 equal sides, 4 right angles`);
            steps.push(`Rectangle: opposite sides equal, 4 right angles`);
            steps.push(`Parallelogram: opposite sides parallel`);
            steps.push(`<strong>Answer: ${gd.quadType}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // MEASUREMENT
    // ========================================
    else if (p.measurementData) {
        const md = p.measurementData;
        if (md.hour !== undefined && md.minute !== undefined) {
            steps.push(`<strong>Problem:</strong> Read the clock`);
            steps.push(`Step 1: Short hand (hour) → ${md.hour}`);
            steps.push(`Step 2: Long hand (minute) → ${md.minute} min`);
            steps.push(`  (each number = 5 minutes)`);
            steps.push(`<strong>Answer: ${md.hour}:${md.minute.toString().padStart(2, '0')}</strong>`);
        } else if (md.startHour !== undefined && md.endHour !== undefined) {
            steps.push(`<strong>Problem:</strong> Find elapsed time`);
            steps.push(`Start: ${md.startHour}:${(md.startMin||0).toString().padStart(2,'0')}`);
            steps.push(`End: ${md.endHour}:${(md.endMin||0).toString().padStart(2,'0')}`);
            steps.push(`Step 1: Count hours`);
            steps.push(`Step 2: Count extra minutes`);
            steps.push(`<strong>Answer: ${md.totalMins || md.elapsed} minutes</strong>`);
        } else if (md.celsius !== undefined || md.fahrenheit !== undefined) {
            steps.push(`<strong>Problem:</strong> Temperature conversion`);
            if (md.direction === 'C_to_F') {
                steps.push(`Formula: °F = (°C × 9/5) + 32`);
                steps.push(`Step: (${md.celsius} × 9/5) + 32`);
                steps.push(`<strong>Answer: ${md.fahrenheit}°F</strong>`);
            } else {
                steps.push(`Formula: °C = (°F - 32) × 5/9`);
                steps.push(`Step: (${md.fahrenheit} - 32) × 5/9`);
                steps.push(`<strong>Answer: ${md.celsius}°C</strong>`);
            }
        } else if (md.change !== undefined) {
            steps.push(`<strong>Problem:</strong> Calculate change`);
            const paid = md.paid || md.given;
            steps.push(`Paid: $${paid ? paid.toFixed(2) : '?'}`);
            steps.push(`Cost: $${md.cost.toFixed(2)}`);
            steps.push(`Step: Subtract cost from amount paid`);
            steps.push(`<strong>Answer: $${md.change.toFixed(2)}</strong>`);
        } else if (md.conversion) {
            steps.push(`<strong>Problem:</strong> Convert ${md.value} ${md.from}`);
            steps.push(`Conversion: ${md.factor}`);
            steps.push(`<strong>Answer: ${md.answer} ${md.to}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // DATA & STATISTICS
    // ========================================
    else if (p.dataData) {
        const ds = p.dataData;
        const nums = ds.nums || [];
        if (ds.mean !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the mean`);
            steps.push(`Data: ${nums.join(', ')}`);
            steps.push(`Step 1: Add all values`);
            steps.push(`  ${nums.join(' + ')} = ${ds.sum}`);
            steps.push(`Step 2: Divide by count (${nums.length})`);
            steps.push(`  ${ds.sum} ÷ ${nums.length} = ${ds.mean}`);
            steps.push(`<strong>Answer: ${ds.mean}</strong>`);
        } else if (ds.median !== undefined) {
            const sorted = [...nums].sort((a,b) => a-b);
            steps.push(`<strong>Problem:</strong> Find the median`);
            steps.push(`Data: ${nums.join(', ')}`);
            steps.push(`Step 1: Put in order: ${sorted.join(', ')}`);
            steps.push(`Step 2: Find middle value`);
            if (sorted.length % 2 === 0) {
                steps.push(`  (Even count: average middle two)`);
            }
            steps.push(`<strong>Answer: ${ds.median}</strong>`);
        } else if (ds.mode !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the mode`);
            steps.push(`Data: ${nums.join(', ')}`);
            steps.push(`Step: Find most frequent value`);
            const counts = {};
            nums.forEach(v => counts[v] = (counts[v]||0) + 1);
            Object.keys(counts).forEach(k => steps.push(`  ${k}: appears ${counts[k]} time(s)`));
            steps.push(`<strong>Answer: ${ds.mode}</strong>`);
        } else if (ds.range !== undefined) {
            steps.push(`<strong>Problem:</strong> Find the range`);
            steps.push(`Data: ${nums.join(', ')}`);
            steps.push(`Step 1: Find max: ${ds.max}`);
            steps.push(`Step 2: Find min: ${ds.min}`);
            steps.push(`Step 3: Subtract: ${ds.max} - ${ds.min}`);
            steps.push(`<strong>Answer: ${ds.range}</strong>`);
        } else if (ds.probability !== undefined || ds.favorable !== undefined) {
            steps.push(`<strong>Problem:</strong> Find probability`);
            steps.push(`Formula: P = favorable ÷ total`);
            steps.push(`Favorable outcomes: ${ds.favorable}`);
            steps.push(`Total outcomes: ${ds.total}`);
            steps.push(`<strong>Answer: ${ds.favorable}/${ds.total}</strong>`);
        } else if (ds.graphType) {
            steps.push(`<strong>Problem:</strong> Read the ${ds.graphType}`);
            steps.push(`Step 1: Read title and labels`);
            steps.push(`Step 2: Find data point`);
            steps.push(`Step 3: Read the value`);
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // NUMBER THEORY
    // ========================================
    else if (p.numberTheoryData) {
        const nt = p.numberTheoryData;
        
        if (nt.type === 'prime_composite_classify') {
            steps.push(`<strong>Problem:</strong> Sort into prime/composite`);
            steps.push(`Numbers: ${nt.allNums.join(', ')}`);
            steps.push(`Prime = exactly 2 factors | Composite = 3+ factors`);
            nt.allNums.forEach(n => {
                const isPrime = nt.primes.includes(n);
                if (isPrime) {
                    steps.push(`• ${n}: factors 1, ${n} → PRIME`);
                } else {
                    for (let i = 2; i <= Math.sqrt(n); i++) {
                        if (n % i === 0) {
                            steps.push(`• ${n}: ${i} × ${n/i} → COMPOSITE`);
                            break;
                        }
                    }
                }
            });
            steps.push(`<strong>Prime: ${nt.primes.sort((a,b)=>a-b).join(', ')}</strong>`);
            steps.push(`<strong>Composite: ${nt.composites.sort((a,b)=>a-b).join(', ')}</strong>`);
        }
        else if (nt.type === 'prime_composite_compare') {
            steps.push(`<strong>Problem:</strong> Which is composite: ${nt.nums[0]} or ${nt.nums[1]}?`);
            steps.push(`${nt.prime}: factors 1, ${nt.prime} → PRIME`);
            steps.push(`${nt.composite}: factor pairs:`);
            nt.factorPairs.forEach(p => steps.push(`  ${p[0]} × ${p[1]} = ${nt.composite}`));
            steps.push(`→ COMPOSITE`);
            steps.push(`<strong>Answer: ${nt.composite}</strong>`);
        }
        else if (nt.type === 'prime_composite') {
            const factors = [];
            for (let i = 1; i <= nt.num; i++) { if (nt.num % i === 0) factors.push(i); }
            steps.push(`<strong>Problem:</strong> Is ${nt.num} prime or composite?`);
            steps.push(`Step 1: Find factors: ${factors.join(', ')}`);
            steps.push(`Step 2: Count: ${factors.length} factors`);
            steps.push(`<strong>Answer: ${nt.isPrime ? 'PRIME' : 'COMPOSITE'}</strong>`);
        }
        else if (nt.type === 'factors_identify') {
            steps.push(`<strong>Problem:</strong> Circle factors of ${nt.num}`);
            nt.displayList.forEach(n => {
                const isFactor = nt.num % n === 0;
                steps.push(`• ${nt.num} ÷ ${n} = ${isFactor ? nt.num/n + ' ✓' : (nt.num/n).toFixed(2) + ' ✗'}`);
            });
            steps.push(`<strong>Answer: ${nt.factors.join(', ')}</strong>`);
        }
        else if (nt.type === 'factors_tchart') {
            steps.push(`<strong>Problem:</strong> Factor T-chart for ${nt.num}`);
            steps.push(`Factor pairs:`);
            nt.factorPairs.forEach(p => steps.push(`  ${p[0]} × ${p[1]} = ${nt.num}`));
            steps.push(`<strong>All factors: ${nt.allFactors.join(', ')}</strong>`);
        }
        else if (nt.type === 'factor_tchart_drag') {
            steps.push(`<strong>Problem:</strong> Build T-chart for ${nt.num}`);
            steps.push(`<strong>Rule:</strong> Smaller factor on LEFT, larger on RIGHT`);
            steps.push(`<strong>Completed T-Chart:</strong>`);
            steps.push(`<div style="margin:10px 0 10px 20px;">`);
            steps.push(`<div style="font-weight:700;border-bottom:3px solid #444;display:inline-block;width:100px;text-align:center;">${nt.num}</div>`);
            nt.factorPairs.forEach(p => {
                steps.push(`<div style="display:flex;gap:15px;"><span style="min-width:40px;text-align:center;">${p[0]}</span><span>×</span><span style="min-width:40px;text-align:center;">${p[1]}</span><span>=</span><span>${nt.num} ✓</span></div>`);
            });
            steps.push(`</div>`);
            steps.push(`<strong>${nt.factorPairs.length} factor pairs total</strong>`);
        }
        else if (nt.type === 'factors') {
            steps.push(`<strong>Problem:</strong> How many factors does ${nt.num} have?`);
            steps.push(`Factors: ${nt.factors.join(', ')}`);
            steps.push(`<strong>Answer: ${nt.factors.length} factors</strong>`);
        }
        else if (nt.type === 'multiples_identify') {
            steps.push(`<strong>Problem:</strong> Circle multiples of ${nt.num}`);
            nt.displayList.forEach(n => {
                const isMult = n % nt.num === 0;
                steps.push(`• ${n}: ${isMult ? nt.num + '×' + n/nt.num + ' ✓' : 'not divisible ✗'}`);
            });
            steps.push(`<strong>Answer: ${nt.correctMultiples.join(', ')}</strong>`);
        }
        else if (nt.type === 'multiples') {
            steps.push(`<strong>Problem:</strong> First 5 multiples of ${nt.num}`);
            for (let i = 1; i <= 5; i++) steps.push(`  ${nt.num} × ${i} = ${nt.num * i}`);
            steps.push(`<strong>Answer: ${nt.multiples.join(', ')}</strong>`);
        }
        else if (nt.type === 'gcf') {
            steps.push(`<strong>Problem:</strong> GCF of ${nt.a} and ${nt.b}`);
            steps.push(`Factors of ${nt.a}: ${nt.factorsA.join(', ')}`);
            steps.push(`Factors of ${nt.b}: ${nt.factorsB.join(', ')}`);
            steps.push(`Common: ${nt.commonFactors.join(', ')}`);
            steps.push(`<strong>Answer: GCF = ${nt.gcf}</strong>`);
        }
        else if (nt.type === 'lcm') {
            steps.push(`<strong>Problem:</strong> LCM of ${nt.a} and ${nt.b}`);
            steps.push(`Multiples of ${nt.a}: ${nt.multiplesA.slice(0,6).join(', ')}...`);
            steps.push(`Multiples of ${nt.b}: ${nt.multiplesB.slice(0,6).join(', ')}...`);
            steps.push(`<strong>Answer: LCM = ${nt.lcm}</strong>`);
        }
        else if (nt.type === 'divisibility') {
            const rules = {2:'ends 0,2,4,6,8', 3:'digit sum÷3', 5:'ends 0,5', 6:'÷2 AND ÷3', 9:'digit sum÷9', 10:'ends 0'};
            steps.push(`<strong>Problem:</strong> Is ${nt.num} divisible by ${nt.divisor}?`);
            steps.push(`Rule: ${rules[nt.divisor]}`);
            steps.push(`<strong>Answer: ${nt.isDivisible ? 'YES' : 'NO'}</strong>`);
        }
        else if (nt.type === 'even_odd') {
            steps.push(`<strong>Problem:</strong> Is ${nt.num} even or odd?`);
            steps.push(`Ones digit: ${nt.num % 10}`);
            steps.push(`Even: 0,2,4,6,8 | Odd: 1,3,5,7,9`);
            steps.push(`<strong>Answer: ${nt.isEven ? 'EVEN' : 'ODD'}</strong>`);
        }
        else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // PATTERNS
    // ========================================
    else if (p.patternData) {
        const pd = p.patternData;
        steps.push(`<strong>Problem:</strong> Find the pattern`);
        if (pd.sequence) steps.push(`Sequence: ${pd.sequence.join(', ')}, ...`);
        if (pd.rule) steps.push(`Rule: ${pd.rule}`);
        if (pd.step) steps.push(`Each term ${pd.step > 0 ? 'increases' : 'decreases'} by ${Math.abs(pd.step)}`);
        steps.push(`<strong>Answer: ${p.ans}</strong>`);
    }
    // ========================================
    // ROUNDING
    // ========================================
    else if (p.roundingData) {
        const rd = p.roundingData;
        steps.push(`<strong>Problem:</strong> Round ${rd.original} to nearest ${rd.place}`);
        steps.push(`Step 1: Find the ${rd.place} digit`);
        steps.push(`Step 2: Look at digit to the RIGHT`);
        steps.push(`Step 3: 5+ → round UP, 4- → round DOWN`);
        if (rd.decisionDigit !== undefined) {
            steps.push(`Decision digit: ${rd.decisionDigit} → ${rd.decisionDigit >= 5 ? 'UP' : 'DOWN'}`);
        }
        steps.push(`<strong>Answer: ${rd.rounded}</strong>`);
    }
    // ========================================
    // PLACE VALUE
    // ========================================
    else if (p.placeValueData) {
        const pv = p.placeValueData;
        if (pv.expanded) {
            steps.push(`<strong>Problem:</strong> Write ${pv.number} in expanded form`);
            steps.push(`Step: Break down by place value`);
            steps.push(`<strong>Answer: ${pv.expanded}</strong>`);
        } else if (pv.digit !== undefined) {
            steps.push(`<strong>Problem:</strong> Find digit in ${pv.place} place`);
            steps.push(`Number: ${pv.number}`);
            steps.push(`<strong>Answer: ${pv.digit}</strong>`);
        } else if (pv.value) {
            steps.push(`<strong>Problem:</strong> Value of digit in ${pv.place} place`);
            steps.push(`<strong>Answer: ${pv.value}</strong>`);
        } else {
            steps.push(`<strong>Answer: ${p.ans}</strong>`);
        }
    }
    // ========================================
    // CONVERSIONS
    // ========================================
    else if (p.conversionData) {
        const cd = p.conversionData;
        steps.push(`<strong>Problem:</strong> Convert ${cd.value} ${cd.from} to ${cd.to}`);
        if (cd.conversionFact) steps.push(`Conversion: ${cd.conversionFact}`);
        if (cd.factor) {
            steps.push(`${cd.operation === 'multiply' ? 'Multiply' : 'Divide'} by ${cd.factor}`);
        }
        steps.push(`<strong>Answer: ${cd.answer} ${cd.to}</strong>`);
    }
    // ========================================
    // DEFAULT FALLBACK
    // ========================================
    else {
        steps.push(`<strong>Problem:</strong> ${(p.text || '').replace(' = ___', '').replace('___', '?')}`);
        steps.push(`<strong>Answer: ${p.ans}</strong>`);
    }
    
    return steps;
}

// Format worked solution for printing
export function formatWorkedSolutionForPrint(problem, index) {
    const steps = generateWorkedSolution(problem);
    return `
        <div class="worked-solution-item">
            <div class="worked-solution-num">${index + 1}.</div>
            <div class="worked-solution-steps">
                ${steps.map(s => `<div class="solution-step">${s}</div>`).join('')}
            </div>
        </div>`;
}

// Toggle answer key type visibility
export function toggleAnswerKeyType(el) {
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

async function previewWorksheet() {
    const previewContent = document.getElementById('printPreviewContent');
    const previewContainer = document.getElementById('printPreviewContainer');
    
    // Show loading with progress
    previewContent.innerHTML = `
        <div style="text-align:center;padding:40px;">
            <div style="font-size:1.5rem;margin-bottom:15px;">⏳ Generating worksheet...</div>
            <div style="width:300px;height:20px;background:#e0e0e0;border-radius:10px;margin:20px auto;overflow:hidden;">
                <div id="progressBar" style="width:0%;height:100%;background:linear-gradient(90deg,#4caf50,#8bc34a);transition:width 0.2s;"></div>
            </div>
            <div id="progressText" style="font-size:0.9rem;color:#666;">Preparing... 0%</div>
        </div>`;
    previewContainer.style.display = 'block';
    
    // Allow UI to render
    await new Promise(r => setTimeout(r, 50));
    
    try {
        const worksheetHTML = await generateWorksheetHTMLAsync();
        previewContent.innerHTML = worksheetHTML;
        document.getElementById('printOutputContent').innerHTML = worksheetHTML;
        closePrintSettings();
    } catch (err) {
        console.error('Error generating worksheet:', err);
        previewContent.innerHTML = `
            <div style="text-align:center;padding:40px;color:#d32f2f;">
                <div style="font-size:1.2rem;margin-bottom:10px;">❌ Error generating worksheet</div>
                <div style="font-size:0.9rem;">${err.message || 'Unknown error'}</div>
                <div style="margin-top:15px;">
                    <button onclick="closePrintPreview()" style="padding:8px 16px;cursor:pointer;border-radius:6px;border:1px solid #ccc;">Close</button>
                </div>
            </div>`;
    }
}

async function generateWorksheetHTMLAsync() {
    const title = document.getElementById('printWorksheetTitle').value || 'Math Practice Worksheet';
    let problemCount = parseInt(document.getElementById('printProblemCount').value) || 20;
    const columns = parseInt(document.getElementById('printLayout').value) || 2;
    const includeAnswerKey = document.getElementById('printIncludeAnswerKey').checked;
    const showInstructions = document.getElementById('printShowInstructions').checked;
    const useWorkedSolutions = document.getElementById('answerKeyWorked')?.checked || false;
    const separatePage = document.getElementById('printSolutionsSeparate')?.checked || false;
    let numSets = parseInt(document.getElementById('printNumSets')?.value || 1);
    const isGreyscale = document.getElementById('printStyleGreyscale')?.checked || false;
    
    // SAFETY: Clamp values - allow up to 100 problems
    problemCount = Math.max(1, Math.min(100, problemCount));
    numSets = Math.max(1, Math.min(10, numSets));
    
    // Greyscale filter style
    const greyscaleStyle = isGreyscale ? 'filter: grayscale(100%);' : '';
    
    const labelSets = document.getElementById('printLabelSets')?.checked !== false;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    // Support 1-10 columns
    const gridCols = `repeat(${columns}, 1fr)`;
    const gridGap = columns >= 10 ? '6px 4px' : columns >= 6 ? '10px 8px' : columns >= 3 ? '15px 12px' : '22px 20px';

    const getSetLabel = (index) => index < 26 ? String.fromCharCode(65 + index) : 'A' + String.fromCharCode(65 + (index - 26));
    
    const totalProblems = problemCount * numSets;
    let generatedCount = 0;
    
    const updateProgress = (current, total, message) => {
        const pct = Math.round((current / total) * 100);
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        if (bar) bar.style.width = pct + '%';
        if (text) text.textContent = message || `Generating problems... ${pct}%`;
    };
    
    let allSetsHTML = '';
    
    for (let setNum = 0; setNum < numSets; setNum++) {
        const problems = [];
        
        // Generate problems in small chunks to keep UI responsive
        for (let i = 0; i < problemCount; i++) {
            // Yield to UI every 5 problems
            if (i % 5 === 0) {
                updateProgress(generatedCount, totalProblems, `Set ${setNum + 1}/${numSets}: Problem ${i + 1}/${problemCount}`);
                await new Promise(r => setTimeout(r, 0));
            }
            
            try {
                const problem = generatePrintProblem();
                if (problem && problem.text) {
                    problems.push(problem);
                } else {
                    // Fallback problem
                    const a = Math.floor(Math.random() * 50) + 1;
                    const b = Math.floor(Math.random() * 50) + 1;
                    problems.push({ text: `${a} + ${b} = ___`, ans: a + b, printFormat: 'horizontal' });
                }
            } catch (e) {
                console.warn('Problem generation failed, using fallback:', e);
                const a = Math.floor(Math.random() * 50) + 1;
                const b = Math.floor(Math.random() * 50) + 1;
                problems.push({ text: `${a} + ${b} = ___`, ans: a + b, printFormat: 'horizontal' });
            }
            generatedCount++;
        }
        
        let instructions = '';
        if (showInstructions) {
            instructions = `<div style="margin-bottom: 20px; font-style: italic; color: #666; font-size: 0.9rem;">
                Solve each problem. Show your work when needed. Write your final answer clearly.
            </div>`;
        }
        
        // Format problems (also chunk this)
        updateProgress(generatedCount, totalProblems, `Formatting Set ${setNum + 1}...`);
        await new Promise(r => setTimeout(r, 0));
        
        const problemsHTML = problems.map((p, i) => formatProblemForPrint(p, i, columns)).join('');
        
        let answerKeyHTML = '';
        if (includeAnswerKey) {
            if (useWorkedSolutions) {
                const workedHTML = problems.map((p, i) => formatWorkedSolutionForPrint(p, i)).join('');
                answerKeyHTML = `
                    <div class="answer-key-section worked-solutions" ${separatePage ? 'style="page-break-before: always;"' : ''}>
                        <div class="answer-key-title">📚 Worked Solutions${numSets > 1 && labelSets ? ` - Set ${getSetLabel(setNum)}` : ''}</div>
                        <div class="worked-solutions-grid">${workedHTML}</div>
                    </div>`;
            } else {
                const answersHTML = problems.map((p, i) => {
                    let ansDisplay = p.ans;
                    if (p.printFormat === 'rounding-table' && p.roundingTableData) {
                        const td = p.roundingTableData;
                        ansDisplay = td.rows.map(r => {
                            const vals = td.columns.map(c => r[`nearest${c.place}`].toLocaleString());
                            return `${r.number.toLocaleString()}: ${vals.join(', ')}`;
                        }).join(' | ');
                    }
                    const label = p.skillLabel || '';
                    return `<div class="answer-key-item">
                        <span class="answer-key-num">${i + 1}.</span>
                        <span class="answer-key-ans">${ansDisplay}</span>
                        ${label ? `<span style="color:#666;font-size:0.75em;margin-left:4px;">(${label})</span>` : ''}
                    </div>`;
                }).join('');
                answerKeyHTML = `
                    <div class="answer-key-section" ${separatePage ? 'style="page-break-before: always;"' : ''}>
                        <div class="answer-key-title">📝 Answer Key${numSets > 1 && labelSets ? ` - Set ${getSetLabel(setNum)}` : ''}</div>
                        <div class="answer-key-grid">${answersHTML}</div>
                    </div>`;
            }
        }
        
        const setLabel = numSets > 1 && labelSets ? `<div style="text-align:right;font-weight:700;font-size:1.1rem;color:#333;margin-bottom:5px;">Set ${getSetLabel(setNum)}</div>` : '';
        const pageBreak = setNum > 0 ? 'page-break-before: always;' : '';

        if (setNum > 0) {
            allSetsHTML += `<div class="ws-page-break-indicator">\u2014 Page Break \u2014</div>`;
        }
        allSetsHTML += `
            <div class="worksheet-set" style="${pageBreak}${greyscaleStyle}">
                ${setLabel}
                <div class="worksheet-header">
                    <div class="worksheet-title">${title}</div>
                    <div class="worksheet-info-row">
                        <div class="worksheet-field"><span class="worksheet-field-label">Name:</span><span class="worksheet-field-line"></span></div>
                        <div class="worksheet-field"><span class="worksheet-field-label">Date:</span><span class="worksheet-field-line"></span></div>
                        <div class="worksheet-field" style="max-width:120px;"><span class="worksheet-field-label">Score:</span><span class="worksheet-field-line" style="position:relative;"><span style="position:absolute;right:0;bottom:2px;font-size:0.9em;color:#333;">/ ${problems.length}</span></span></div>
                    </div>
                </div>
                ${instructions}
                <div class="worksheet-problems" style="grid-template-columns: ${gridCols};gap:${gridGap};">
                    ${problemsHTML}
                </div>
                ${answerKeyHTML}
            </div>`;
    }
    
    updateProgress(totalProblems, totalProblems, 'Complete!');
    return allSetsHTML;
}

export function closePrintPreview() {
    document.getElementById('printPreviewContainer').style.display = 'none';
    // Re-open the print settings modal
    openPrintSettings();
}

export async function printWorksheet() {
    const previewEl = document.getElementById('printPreviewContent');
    const outputEl = document.getElementById('printOutputContent');
    const outputContainer = document.getElementById('printOutput');

    if (!previewEl || !outputEl || !outputContainer) {
        alert('Print elements not found. Please try again.');
        console.error('Missing elements:', { previewEl: !!previewEl, outputEl: !!outputEl, outputContainer: !!outputContainer });
        return;
    }

    const content = previewEl.innerHTML;

    if (!content || content.trim() === '' || content.includes('Generating worksheet')) {
        alert('Please generate a worksheet preview first before printing.');
        return;
    }

    // Copy content to print output div
    outputEl.innerHTML = content;
    outputContainer.style.display = 'block';

    // Wait for DOM to be ready with images/SVGs loaded
    const waitForRender = () => new Promise(resolve => {
        // Give browser time to lay out and paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    });

    await waitForRender();
    // Additional delay scaled to content size
    const contentSize = content.length;
    const delay = Math.min(2000, Math.max(200, Math.floor(contentSize / 1000) * 50));
    await new Promise(r => setTimeout(r, delay));
    window.print();

    // Hide after print dialog closes
    setTimeout(() => {
        outputContainer.style.display = 'none';
    }, 500);
}

export async function downloadPDF() {
    const previewEl = document.getElementById('printPreviewContent');
    if (!previewEl) {
        alert('Print preview element not found. Please try again.');
        return;
    }

    const content = previewEl.innerHTML;

    if (!content || content.trim() === '' || content.includes('Generating worksheet')) {
        alert('Please generate a worksheet preview first before downloading as PDF.');
        return;
    }

    const titleEl = document.getElementById('printWorksheetTitle');
    const title = (titleEl && titleEl.value) ? titleEl.value : 'Math Worksheet';

    // Build the print document with proper styling
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.25in; color: black; background: white; line-height: 1.4; font-size: 12pt; }
.worksheet-set { margin-bottom: 20px; }
.worksheet-header { margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
.worksheet-title { font-size: 1.2rem; font-weight: 700; text-align: center; margin-bottom: 10px; }
.worksheet-info-row { display: flex; justify-content: space-between; gap: 15px; }
.worksheet-field { display: flex; align-items: baseline; gap: 8px; flex: 1; }
.worksheet-field-label { font-weight: 600; white-space: nowrap; }
.worksheet-field-line { flex: 1; border-bottom: 1px solid #333; min-width: 80px; }
.worksheet-problems { display: grid; gap: 20px; }
.worksheet-problem { display: flex; flex-direction: column; align-items: flex-start; page-break-inside: avoid; padding: 8px 10px; }
.worksheet-problem.full-width { grid-column: 1 / -1; }
.problem-header { width: 100%; display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
.problem-number { font-weight: 700; }
.problem-content { width: 100%; text-align: left; max-width: 100%; overflow: hidden; }
.column-problem { font-family: Courier New, monospace; font-size: 1.5rem; text-align: right; display: inline-block; }
.column-problem .operand { display: block; }
.column-problem .operator-line { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 4px; }
.column-problem .answer-line { height: 1.8em; border-bottom: 2px solid #999; }
.long-division { font-family: Courier New, monospace; font-size: 1.5rem; display: inline-flex; align-items: flex-end; gap: 2px; }
.fraction-display { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 4px; }
.fraction-display .numerator, .fraction-display .denominator { padding: 3px 6px; text-align: center; }
.fraction-display .fraction-bar { width: 100%; height: 2px; background: #333; }
.fraction-display-lg { font-size: 1.5rem; }
.fraction-display-lg .numerator, .fraction-display-lg .denominator { padding: 4px 14px; }
.fraction-display-lg .fraction-bar { height: 3px; }
.print-frac-equation { display: flex; align-items: center; justify-content: flex-start; gap: 15px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; flex-wrap: wrap; }
.print-frac-equation .frac-op { font-size: 1.6rem; font-weight: 700; }
.answer-key-section { margin-top: 20px; padding-top: 15px; border-top: 2px double #333; }
.answer-key-title { font-size: 1rem; font-weight: 700; text-align: center; margin-bottom: 12px; }
.answer-key-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px 10px; font-size: 0.85rem; }
.answer-key-item { display: flex; gap: 5px; }
.answer-key-num { font-weight: 700; min-width: 20px; }
svg { max-width: 100%; height: auto; }
.print-visual-wrap { max-width: 100%; overflow: hidden; box-sizing: border-box; }
.print-visual-wrap svg { max-width: 100%; height: auto; }
.print-visual-wrap .frac-bar-segment { width: 26px !important; height: 26px !important; margin: 0 !important; padding: 0 !important; }
.print-visual-wrap .frac-bar-visual { display: flex; flex-wrap: wrap; max-width: 250px; gap: 1px !important; }
.print-visual-wrap [style*="display:flex"], .print-visual-wrap [style*="display: flex"] { max-width: 100%; flex-wrap: wrap !important; overflow: hidden; }
.frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; }
.frac .num { border-bottom: 2px solid #333; padding: 0 4px 2px; }
.frac .den { padding: 2px 4px 0; }
.fast-fact { padding: 2px 1px !important; }
.fast-fact .problem-header, .fast-fact .problem-number { display: none !important; }
.ws-subgrid { display:grid; width:100%; margin-bottom:4px; }
.ws-subgrid-compact { grid-template-columns:repeat(3,1fr); gap:12px 10px; }
.ws-subgrid-standard { grid-template-columns:repeat(2,1fr); gap:20px 16px; }
.ws-subgrid-medium { grid-template-columns:repeat(2,1fr); gap:24px 18px; }
.ws-subgrid-wide { grid-template-columns:1fr; gap:28px; }
.ws-subgrid-spacious { grid-template-columns:1fr; gap:32px; }
.ws-problem-compact { padding:3px 5px !important; }
.ws-problem-compact .problem-header { border-bottom:none !important; margin-bottom:2px !important; padding-bottom:0 !important; }
.ws-problem-compact .problem-number { font-size:0.85rem; }
.ws-problem-spacious { padding:14px 16px !important; page-break-inside:avoid; }
.ws-work-space { border:2px dashed #ccc; padding:10px 12px; border-radius:6px; min-height:100px; margin:8px 0 4px; width:100%; box-sizing:border-box; }
.ws-work-space-label { font-size:0.8rem; color:#999; font-weight:600; }
.ws-subgrid + .ws-subgrid { margin-top:22px; padding-top:14px; border-top:2px solid #ccc; }
.worksheet-problems + .worksheet-problems { margin-top:22px; padding-top:14px; border-top:2px solid #ccc; }
@media print {
    @page { size: letter; margin: 0.3in; }
    body { padding: 0; }
    .worksheet-set { page-break-after: always; }
    .worksheet-set:last-child { page-break-after: auto; }
}
    </style>
</head>
<body>
${content}
</body>
</html>`;

    // Create a hidden iframe for printing
    let printFrame = document.getElementById('pdfPrintFrame');
    if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'pdfPrintFrame';
        printFrame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        document.body.appendChild(printFrame);
    }

    // Write content to iframe
    const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
    const doc = frameDoc.document || frameDoc;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Wait for iframe content to fully load
    const waitForIframeReady = () => new Promise((resolve) => {
        const checkReady = () => {
            if (doc.readyState === 'complete') {
                resolve();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        // Start checking after a minimum delay
        setTimeout(checkReady, 200);
    });

    // Add a maximum wait timeout as safety net
    const maxWait = new Promise(r => setTimeout(r, 5000));
    await Promise.race([waitForIframeReady(), maxWait]);

    try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
    } catch (e) {
        console.error('Print error:', e);
        // Fallback: try opening in new window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 500);
        } else {
            alert('Could not open print dialog. Please try the "Print" button instead, or check your popup blocker settings.');
        }
    }
}

export function downloadWorksheet() {
    const previewEl = document.getElementById('printPreviewContent');
    if (!previewEl) {
        alert('Print preview element not found. Please try again.');
        return;
    }
    
    let worksheetHTML = previewEl.innerHTML;
    
    // If preview is empty, try generating fresh
    if (!worksheetHTML || worksheetHTML.trim() === '' || worksheetHTML.includes('Generating worksheet')) {
        try {
            worksheetHTML = generateWorksheetHTML();
        } catch(e) {
            alert('Error generating worksheet. Please try the preview button first.');
            console.error('Worksheet generation error:', e);
            return;
        }
    }
    
    const titleEl = document.getElementById('printWorksheetTitle');
    const title = (titleEl && titleEl.value) ? titleEl.value : 'Math Worksheet';
    const numSetsEl = document.getElementById('printNumSets');
    const numSets = numSetsEl ? (parseInt(numSetsEl.value) || 1) : 1;
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
* { box-sizing: border-box; }
body {
    font-family: Arial, Helvetica, sans-serif;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.2in 0.25in;
    color: black;
    background: white;
    line-height: 1.4;
    font-size: 12pt;
}
.worksheet-set { margin-bottom: 20px; overflow: hidden; }
.worksheet-header { margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 8px; }
.worksheet-title { font-size: 1.1rem; font-weight: 700; text-align: center; margin-bottom: 10px; }
.worksheet-info-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.worksheet-field { display: flex; align-items: baseline; gap: 5px; flex: 1; }
.worksheet-field-label { font-weight: 600; white-space: nowrap; font-size: 0.8rem; }
.worksheet-field-line { flex: 1; border-bottom: 1px solid #333; min-width: 60px; }
.worksheet-problems { display: grid; gap: 20px; overflow: hidden; width: 100%; }
.worksheet-problem {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    page-break-inside: avoid;
    margin-bottom: 2px;
    overflow: hidden;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
}
.problem-header {
    width: 100%;
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 3px;
}
.worksheet-problem.full-width { grid-column: 1 / -1; width: 100%; }
.problem-number { font-weight: 700; flex-shrink: 0; color: #333; font-size: 1rem; margin-bottom: 2px; }
.problem-content { 
    flex: 1; 
    min-width: 0; 
    max-width: 100%;
    overflow: hidden; 
    word-wrap: break-word; 
    overflow-wrap: break-word;
    box-sizing: border-box;
}
/* CRITICAL: Force all child elements to respect container width */
.problem-content * {
    max-width: 100% !important;
    box-sizing: border-box !important;
}
.problem-content > div { 
    max-width: 100% !important; 
    overflow: hidden;
}
.problem-content svg { 
    max-width: 100% !important; 
    height: auto !important; 
    display: block;
}
/* Scale down complex problems to fit */
.problem-content [style*="display:grid"],
.problem-content [style*="display: grid"],
.problem-content [style*="display:flex"],
.problem-content [style*="display: flex"] {
    max-width: 100% !important;
    overflow: hidden;
    flex-wrap: wrap !important;
}
/* Constrain estimation boxes */
.problem-content [style*="background:#e8f5e9"],
.problem-content [style*="background: #e8f5e9"] {
    max-width: 320px !important;
}
/* Constrain strip models */
.problem-content [style*="background:#fffde7"],
.problem-content [style*="background: #fffde7"] {
    max-width: 100% !important;
    overflow: hidden;
}
.column-problem { font-family: 'Courier New', monospace; font-size: 1.5rem; line-height: 1.4; text-align: right; display: inline-block; }
.column-problem .operand { display: block; }
.column-problem .operator-line { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 4px; gap: 4px; }
.column-problem .answer-line { height: 1.8em; border-bottom: 2px solid #999; }
.long-division { font-family: 'Courier New', monospace; font-size: 1.5rem; display: inline-flex; align-items: flex-end; gap: 2px; }
.long-division .divisor { padding-right: 3px; font-weight: bold; }
.long-division .dividend-box { display: flex; flex-direction: column; }
.long-division .quotient-line { height: 1.8em; border-bottom: 2px solid #999; min-width: 80px; }
.long-division .dividend { border-top: 2px solid #333; border-left: 2px solid #333; border-top-left-radius: 6px; padding: 3px 10px 3px 6px; }
.horizontal-problem { font-size: 1.4rem; display: flex; align-items: baseline; gap: 6px; }
.horizontal-problem .answer-blank { flex: 1; border-bottom: 2px solid #333; }
.print-answer-flex { display: flex; align-items: baseline; gap: 8px; }
.print-answer-flex .answer-line-fill { flex: 1; border-bottom: 2px solid #333; }
.fraction-display { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 4px; }
.fraction-display .numerator, .fraction-display .denominator { padding: 2px 6px; min-width: 16px; text-align: center; font-size: 0.9em; }
.fraction-display .fraction-bar { width: 100%; height: 2px; background: #333; }
.fraction-display-lg { font-size: 1.5rem; }
.fraction-display-lg .numerator, .fraction-display-lg .denominator { padding: 4px 14px; }
.fraction-display-lg .fraction-bar { height: 3px; }
.print-frac-equation { display: flex; align-items: center; justify-content: flex-start; gap: 15px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; flex-wrap: wrap; }
.print-frac-equation .frac-op { font-size: 1.6rem; font-weight: 700; }
table { border-collapse: collapse; max-width: 100% !important; font-size: 0.8rem; }
table td, table th { border: 1px solid #333; padding: 3px 6px; }
.answer-key-section { margin-top: 15px; padding-top: 10px; border-top: 2px double #333; }
.answer-key-title { font-size: 0.95rem; font-weight: 700; text-align: center; margin-bottom: 10px; }
.answer-key-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px 8px; font-size: 0.75rem; }
.answer-key-item { display: flex; gap: 3px; overflow: hidden; }
.answer-key-num { font-weight: 700; min-width: 18px; }
.answer-key-ans { color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.worksheet-footer { margin-top: 15px; text-align: center; font-size: 0.65rem; color: #666; }
.worked-solutions-grid { display: flex; flex-direction: column; gap: 6px; }
.worked-solution-item { display: flex; gap: 5px; padding: 5px; background: #f9f9f9; border-radius: 3px; }
.worked-solution-num { font-weight: 700; min-width: 18px; }
.worked-solution-steps { flex: 1; font-size: 0.8rem; }
.solution-step { margin-bottom: 2px; }
/* Force SVGs to scale */
svg { max-width: 100% !important; height: auto !important; display: block; }
.print-visual-wrap { max-width: 100%; overflow: hidden; box-sizing: border-box; }
.print-visual-wrap svg { max-width: 100% !important; height: auto !important; }
.print-visual-wrap .frac-bar-segment { width: 26px !important; height: 26px !important; margin: 0 !important; padding: 0 !important; }
.print-visual-wrap .frac-bar-visual { display: flex; flex-wrap: wrap; max-width: 250px; gap: 1px !important; }
.print-visual-wrap [style*="display:flex"], .print-visual-wrap [style*="display: flex"] { max-width: 100% !important; flex-wrap: wrap !important; overflow: hidden; }
.frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; }
.frac .num { border-bottom: 2px solid #333; padding: 0 4px 2px; }
.frac .den { padding: 2px 4px 0; }
.ws-subgrid { display:grid; width:100%; margin-bottom:4px; }
.ws-subgrid-compact { grid-template-columns:repeat(3,1fr); gap:12px 10px; }
.ws-subgrid-standard { grid-template-columns:repeat(2,1fr); gap:20px 16px; }
.ws-subgrid-medium { grid-template-columns:repeat(2,1fr); gap:24px 18px; }
.ws-subgrid-wide { grid-template-columns:1fr; gap:28px; }
.ws-subgrid-spacious { grid-template-columns:1fr; gap:32px; }
.ws-problem-compact { padding:3px 5px !important; }
.ws-problem-compact .problem-header { border-bottom:none !important; margin-bottom:2px !important; padding-bottom:0 !important; }
.ws-problem-compact .problem-number { font-size:0.85rem; }
.ws-problem-spacious { padding:14px 16px !important; page-break-inside:avoid; }
.ws-work-space { border:2px dashed #ccc; padding:10px 12px; border-radius:6px; min-height:100px; margin:8px 0 4px; width:100%; box-sizing:border-box; }
.ws-work-space-label { font-size:0.8rem; color:#999; font-weight:600; }
.ws-subgrid + .ws-subgrid { margin-top:22px; padding-top:14px; border-top:2px solid #ccc; }
.worksheet-problems + .worksheet-problems { margin-top:22px; padding-top:14px; border-top:2px solid #ccc; }
@media print {
    @page { size: 8.5in 11in; margin: 0.25in; }
    body { padding: 0; }
    .worksheet-problem { page-break-inside: avoid; overflow: hidden; }
    .worksheet-set { page-break-after: always; }
    .worksheet-set:last-child { page-break-after: auto; }
    .worksheet-problems { gap: 18px; }
}
    </style>
</head>
<body>
${worksheetHTML}
</body>
</html>`;
    
    // Create download link
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    const setsLabel = numSets > 1 ? `-${numSets}sets` : '';
    a.href = url;
    a.download = `math-worksheet-${date}${setsLabel}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Close modals when clicking outside
const printSettingsEl = document.getElementById('printSettingsModal');
if (printSettingsEl) {
    printSettingsEl.addEventListener('click', function(e) {
        if (e.target === this) closePrintSettings();
    });
}
