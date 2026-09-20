import { state } from './state.js';
import { SKILLS, DOMAINS } from './data.js';

export function updateNumberSectionVisibility() {
    const category = document.getElementById("categorySelect").value;
    const skill = document.getElementById("skillSelect").value;
    const numberSection = document.getElementById("numberSection");
    const divisibilitySection = document.getElementById("divisibilitySection");

    // Show number selection only for multiplication and division
    const showNumbers = category === "operations" &&
                       (skill === "multiply" || skill === "divide" ||
                        skill === "mixed_mult_div" || skill === "mixed");
    numberSection.style.display = showNumbers ? "block" : "none";
    
    // Show divisibility rule selector for divisibility skills
    const showDivisibility = category === "number_theory" &&
                            (skill === "divisibility" || skill === "divisibility_sort");
    if (divisibilitySection) {
        divisibilitySection.style.display = showDivisibility ? "block" : "none";
        if (showDivisibility && !divisibilitySection.dataset.initialized) {
            initDivisorGrid();
            divisibilitySection.dataset.initialized = "true";
        }
    }
}

// State for selected divisors (on window for cross-module access)
window.selectedDivisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Initialize divisor selection grid
export function initDivisorGrid() {
    const grid = document.getElementById("divisorGrid");
    if (!grid) return;
    
    // Colors matching the divisibility chart
    const colors = {
        2: '#e53935', 3: '#fb8c00', 4: '#fdd835', 5: '#43a047', 
        6: '#00acc1', 7: '#1e88e5', 8: '#5e35b1', 9: '#d81b60', 
        10: '#6d4c41', 11: '#546e7a', 12: '#8e24aa'
    };
    
    let html = '';
    for (let d = 2; d <= 12; d++) {
        const isSelected = window.selectedDivisors.includes(d);
        html += `
            <div class="number-btn ${isSelected ? 'selected' : ''}" 
                 data-divisor="${d}" 
                 onclick="toggleDivisor(${d})"
                 style="background:${isSelected ? colors[d] : 'var(--bg-card-light)'};
                        color:${isSelected ? 'white' : 'var(--text-main)'};
                        border:2px solid ${colors[d]};
                        transition:all 0.2s ease;">
                ${d}
            </div>`;
    }
    grid.innerHTML = html;
}

// Toggle individual divisor
export function toggleDivisor(d) {
    const idx = window.selectedDivisors.indexOf(d);
    if (idx > -1) {
        // Don't allow deselecting all
        if (window.selectedDivisors.length > 1) {
            window.selectedDivisors.splice(idx, 1);
        }
    } else {
        window.selectedDivisors.push(d);
        window.selectedDivisors.sort((a, b) => a - b);
    }
    initDivisorGrid(); // Re-render
    updateSettingsCode();
}

// Toggle all divisors
export function toggleAllDivisors() {
    if (window.selectedDivisors.length === 11) {
        // All selected, select only 2
        window.selectedDivisors = [2];
    } else {
        // Select all
        window.selectedDivisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    initDivisorGrid();
    updateSettingsCode();
}

// Show full divisibility rules chart
export function showDivisibilityRulesChart() {
    showDivisibilityHelp(null);
}

export function updateTimerForRange() {
    const category = document.getElementById("categorySelect").value;
    const range = parseInt(document.getElementById("rangeSelect").value, 10);
    const timerSelect = document.getElementById("timerSelect");

    // For operations (addition/subtraction) with numbers >= 1000, default to 5 minutes
    if (category === "operations" && range >= 1000) {
        timerSelect.value = "300"; // 5 minutes
    }
    updateSettingsCode();
}

// ===== Settings Code Mapping =====
//
// The 7-character settings code is CAT(1) + SKILL(2) + RANGE(1) + DEC(1) + TIMER(1) + DIFF(1).
// The category therefore gets exactly ONE character, and there are 35 categories in SKILLS
// against 36 base-36 symbols. The alphabet is nearly exhausted; that is the whole constraint.
//
// WHY THIS TABLE WAS REWRITTEN (2026-09-20). The old table had sixteen entries, and five of
// them named categories that no longer exist (operations, estimation, geometry, data_stats,
// rounding) - left over from the category split. Worse, generateSettingsCode fell back to 'A'
// for any category it did not know, so a code for addition / subtraction / multiplication /
// division encoded as 'A', decoded to "operations", found no skills, and landed the picker on
// Mixed. The four most-used categories were silently broken. No valid code was ever issued for
// the five dead letters, so A S Y T C were free to reassign.
//
// THE SCHEME, in the order the rules are applied. Do not renumber casually: every letter here
// is a code a teacher may be holding on paper.
//   1. FROZEN. Eleven letters already resolved to real categories before this rewrite and are
//      kept EXACTLY as they were: B D E F G I L M N O X. Every OTHER letter the rules below
//      assign is pinned on the same terms from the moment this ships - the whole alphabet is
//      mirrored in FROZEN_CATEGORY_CODES, which the audit re-checks on every boot, so a letter
//      cannot move without ws-boot-smoke saying so.
//   2. MIXED BUCKETS ARE DIGITS. Each domain's own "..._mixed" category takes a digit, numbered
//      in DOMAINS order: 1 counting, 2 number ops, 3 fractions/decimals, 4 geometry,
//      5 data, 6 algebraic. So a digit 1-6 in slot 0 reads as "a Mixed bucket" at a glance.
//      all_mixed keeps its frozen X.
//   3. MNEMONIC LETTERS. Every other category takes a letter from its own name where one is
//      still free (Add, Sub, Times, diVide, Count, comPare, maKe, fRaction opeRations,
//      Quadrant, grapHs, analYsis, nUmber sense, Words).
//   4. OVERFLOW. 29 categories want letters and there are only 26, so three of the
//      lowest-traffic ones spill into digits 7-9 (angles_lines, shapes_classify, probability),
//      and two that have no free letter left in their names take the last two free letters
//      (shapes_early J, area_perimeter Z). This is arbitrary by necessity, not by choice.
//   5. '0' IS DELIBERATELY UNASSIGNED. It is the confusable twin of 'O' (order_of_operations)
//      and it is the last free symbol: the next new category has nowhere safe to go, which is
//      the moment someone should stop and redesign the slot rather than grab '0'. The audit
//      below prints the free symbols so that person sees the cliff.
//      (The one unavoidable confusion that remains is '1' counting_mixed vs 'I' integers. '1'
//      sits on the lowest-traffic category in the table - counting_mixed holds one skill - so a
//      misread costs as little as it can.)
const CATEGORY_CODES = {
    // Counting & Cardinality
    counting: 'C',              // Count        (reclaimed from the dead "rounding")
    comparing: 'P',             // comPare
    composing: 'K',             // maKe / brea-K apart
    counting_mixed: '1',        // mixed bucket, domain 1
    // Number & Operations
    addition: 'A',              // Add          (reclaimed from the dead "operations")
    subtraction: 'S',           // Sub          (reclaimed from the dead "estimation")
    multiplication: 'T',        // Times        (reclaimed from the dead "data_stats")
    division: 'V',              // diVide
    integers: 'I',              // FROZEN
    number_ops_mixed: '2',      // mixed bucket, domain 2
    // Fractions, Decimals & Percents
    fractions: 'E',             // FROZEN
    fraction_operations: 'R',   // fRaction opeRations
    decimals: 'L',              // FROZEN
    conversions: 'F',           // FROZEN
    frac_dec_mixed: '3',        // mixed bucket, domain 3
    // Geometry & Measurement
    shapes_early: 'J',          // overflow letter - no free letter left in the name
    area_perimeter: 'Z',        // overflow letter - no free letter left in the name
    angles_lines: '7',          // overflow digit
    shapes_classify: '8',       // overflow digit
    coordinates: 'Q',           // Quadrant
    measurement: 'M',           // FROZEN
    geo_mixed: '4',             // mixed bucket, domain 4
    // Data & Statistics
    graphs: 'H',                // grapHs
    data_analysis: 'Y',         // analYsis     (reclaimed from the dead "geometry")
    probability: '9',           // overflow digit
    data_mixed: '5',            // mixed bucket, domain 5
    // Algebraic Thinking
    patterns: 'B',              // FROZEN
    algebra: 'G',               // FROZEN
    order_of_operations: 'O',   // FROZEN
    placevalue: 'D',            // FROZEN
    number_sense: 'U',          // nUmber sense
    number_theory: 'N',         // FROZEN
    algebra_mixed: '6',         // mixed bucket, domain 6
    // Vocabulary
    vocabulary: 'W',            // Words
    // Everything
    all_mixed: 'X'              // FROZEN
};
const CODE_TO_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_CODES).map(([k, v]) => [v, k]));

// Every category letter, pinned. A teacher may be holding a printed code for any of them, so
// each one is re-checked on every boot rather than trusted to a reviewer's memory. Moving an
// entry here fails ws-boot-smoke, which is the only automated gate this table has:
// ws-code-snapshot pins FROZEN_SKILL_CODES and FROZEN_CATEGORY_ORDER and never reads the
// category alphabet, so without this list a letter can move in total silence.
//
// WHY ALL 35 AND NOT JUST THE ORIGINAL ELEVEN (review, 2026-09-20). The first draft pinned only
// the eleven letters that pre-dated the rewrite. Fault injection showed the cost: swapping two
// UNPINNED letters (division 'V' <-> coordinates 'Q') left both ws-boot-smoke and
// ws-code-snapshot reporting OK, while every printed settings code and MX- code for those two
// categories now opened the other category's skill list - the exact bug the rewrite existed to
// kill, one wave later and with no alarm. The 24 letters the rewrite assigned go out to
// teachers the moment it ships, so they are contract from that moment, not once someone
// remembers to promote them. Reassigning any letter is still allowed; it just has to be done
// here too, deliberately, which is the point.
const FROZEN_CATEGORY_CODES = {
    // Pre-dates the 2026-09-20 rewrite - codes for these were already in the wild.
    decimals: 'L', integers: 'I', algebra: 'G', measurement: 'M', number_theory: 'N',
    order_of_operations: 'O', patterns: 'B', placevalue: 'D', fractions: 'E',
    conversions: 'F', all_mixed: 'X',
    // Assigned by the 2026-09-20 rewrite; pinned on the same terms.
    counting: 'C', comparing: 'P', composing: 'K', counting_mixed: '1',
    addition: 'A', subtraction: 'S', multiplication: 'T', division: 'V', number_ops_mixed: '2',
    fraction_operations: 'R', frac_dec_mixed: '3',
    shapes_early: 'J', area_perimeter: 'Z', angles_lines: '7', shapes_classify: '8',
    coordinates: 'Q', geo_mixed: '4',
    graphs: 'H', data_analysis: 'Y', probability: '9', data_mixed: '5',
    number_sense: 'U', algebra_mixed: '6',
    vocabulary: 'W'
};

// Boot-time integrity check for the table above. A category with no code, a code pointing at a
// category that no longer exists, a duplicate, or a moved frozen letter are all ways to produce
// a code that decodes to the WRONG worksheet - which is exactly the bug this table was rewritten
// to kill - so they are reported loudly instead of being absorbed by a fallback.
// Returns the list of problems (empty when the table is sound) so tests can assert on it.
export function auditCategoryCodes() {
    const problems = [];
    const seen = new Map();

    for (const [cat, code] of Object.entries(FROZEN_CATEGORY_CODES)) {
        if (CATEGORY_CODES[cat] !== code) {
            problems.push(`frozen letter moved: ${cat} was '${code}', now '${CATEGORY_CODES[cat]}'`);
        }
    }
    for (const [cat, code] of Object.entries(CATEGORY_CODES)) {
        if (!/^[A-Z1-9]$/.test(code)) problems.push(`category ${cat} has an illegal code '${code}'`);
        if (seen.has(code)) problems.push(`code '${code}' is shared by ${seen.get(code)} and ${cat}`);
        seen.set(code, cat);
        if (!Array.isArray(SKILLS[cat])) problems.push(`code '${code}' names ${cat}, which is not a category in SKILLS`);
    }
    const free = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').filter(c => !seen.has(c));
    for (const cat of Object.keys(SKILLS)) {
        if (!Array.isArray(SKILLS[cat])) continue;
        if (!CATEGORY_CODES[cat]) {
            problems.push(`category ${cat} has no settings-code symbol (still free: ${free.join('') || 'NONE'})`);
        } else if (!FROZEN_CATEGORY_CODES[cat]) {
            // Without this, a letter added later would be the one unpinned entry in the table,
            // and moving it again would pass every gate silently - the gap that made the whole
            // alphabet get mirrored above. A new category is pinned when it is assigned.
            problems.push(`category ${cat} has the symbol '${CATEGORY_CODES[cat]}' but is not pinned in FROZEN_CATEGORY_CODES`);
        }
    }
    if (problems.length) {
        console.error('[settings-code] CATEGORY_CODES is broken:\n  - ' + problems.join('\n  - '));
    }
    return problems;
}
auditCategoryCodes();

const RANGE_CODES = {
    '10': '1', '20': '2', '50': '3', '100': '4',
    '1000': '5', '10000': '6', '100000': '7', '1000000': '8'
};
const CODE_TO_RANGE = Object.fromEntries(Object.entries(RANGE_CODES).map(([k, v]) => [v, k]));

const DECIMAL_CODES = { '0': '0', '1': '1', '2': '2', '3': '3' };
const CODE_TO_DECIMAL = DECIMAL_CODES;

const TIMER_CODES = {
    '0': '0', '60': '1', '120': '2', '180': '3',
    '240': '4', '300': '5', '600': '6', '900': '7'
};
const CODE_TO_TIMER = Object.fromEntries(Object.entries(TIMER_CODES).map(([k, v]) => [v, k]));

const DIFFICULTY_CODES = { easy: 'E', medium: 'M', hard: 'H' };
const CODE_TO_DIFFICULTY = { 'E': 'easy', 'M': 'medium', 'H': 'hard' };

// Attach encoding constants to window for cross-module access
Object.assign(window, {
    CATEGORY_CODES, CODE_TO_CATEGORY, FROZEN_CATEGORY_CODES, auditCategoryCodes,
    RANGE_CODES, CODE_TO_RANGE,
    DECIMAL_CODES, CODE_TO_DECIMAL,
    TIMER_CODES, CODE_TO_TIMER,
    DIFFICULTY_CODES, CODE_TO_DIFFICULTY
});

// Generate skill code from category skills list (2 chars: 00-99)

export function renderNumbers() {
    const grid = document.getElementById("numberGrid");
    const compactGrid = document.getElementById("compactNumberGrid");
    const settingsGrid = document.getElementById("settingsPanelNumberGrid");
    
    // Render main grid (teacher section)
    if (grid) {
        grid.innerHTML = "";
        state.selectedNumbers = [...DEFAULT_TABLES];
        DEFAULT_TABLES.forEach(num => {
            const btn = document.createElement("button");
            btn.className = "num-btn selected";
            btn.textContent = num;
            btn.onclick = () => toggleNumber(num);
            grid.appendChild(btn);
        });
    }
    
    // Render compact grid (both modes - main UI)
    if (compactGrid) {
        compactGrid.innerHTML = "";
        DEFAULT_TABLES.forEach(num => {
            const btn = document.createElement("button");
            btn.className = "compact-number-btn selected";
            btn.textContent = num;
            btn.onclick = () => toggleNumber(num);
            compactGrid.appendChild(btn);
        });
    }
    
    // Render settings panel grid (teacher settings)
    if (settingsGrid) {
        settingsGrid.innerHTML = "";
        DEFAULT_TABLES.forEach(num => {
            const btn = document.createElement("button");
            btn.className = "compact-number-btn selected";
            btn.textContent = num;
            btn.onclick = () => toggleNumber(num);
            settingsGrid.appendChild(btn);
        });
    }
}

export function toggleNumber(num) {
    const idx = state.selectedNumbers.indexOf(num);
    if (idx > -1) {
        state.selectedNumbers.splice(idx, 1);
    } else {
        state.selectedNumbers.push(num);
    }
    updateNumberButtonStates();
}

export function updateNumberButtonStates() {
    // Update main grid buttons
    document.querySelectorAll(".num-btn").forEach((btn) => {
        const num = parseInt(btn.textContent);
        btn.classList.toggle("selected", state.selectedNumbers.includes(num));
    });
    // Update all compact grid buttons (main UI and settings panel)
    document.querySelectorAll(".compact-number-btn").forEach((btn) => {
        const num = parseInt(btn.textContent);
        btn.classList.toggle("selected", state.selectedNumbers.includes(num));
    });
}

export function toggleAllNumbers() {
    const allSelected = state.selectedNumbers.length === DEFAULT_TABLES.length;
    state.selectedNumbers = allSelected ? [] : [...DEFAULT_TABLES];
    updateNumberButtonStates();
}

export function updateCompactNumberVisibility() {
    const compactSection = document.getElementById("compactNumberSection");
    if (!compactSection) return;
    
    // Check if any mult/div skills are in the queue or selected
    const multDivCategories = ['multiplication', 'division'];
    const multDivSkills = ['mult', 'mult_facts', 'div', 'div_facts', 'mixed_mult_div'];
    
    let showNumbers = false;
    
    // Check skill queue
    if (window.skillQueue && window.skillQueue.length > 0) {
        showNumbers = window.skillQueue.some(skill =>
            multDivCategories.includes(skill.categoryId) ||
            multDivSkills.some(s => skill.skillId && skill.skillId.includes(s))
        );
    }
    
    // Also check if mult/div quick skills are selected
    const selectedQuickSkills = document.querySelectorAll('.quick-skill-card.selected');
    selectedQuickSkills.forEach(card => {
        const onclick = card.getAttribute('onclick') || '';
        if (onclick.includes('multiplication') || onclick.includes('division')) {
            showNumbers = true;
        }
    });
    
    // Check current dropdown selection (for teacher mode)
    const categorySelect = document.getElementById("categorySelect");
    const skillSelect = document.getElementById("skillSelect");
    if (categorySelect && skillSelect) {
        const cat = categorySelect.value;
        const skill = skillSelect.value;
        if (multDivCategories.includes(cat) || 
            multDivSkills.some(s => skill.includes(s))) {
            showNumbers = true;
        }
    }
    
    compactSection.style.display = showNumbers ? "block" : "none";
}

