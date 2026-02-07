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

// Settings Code Mapping
const CATEGORY_CODES = {
    operations: 'A', decimals: 'L', estimation: 'S', integers: 'I', algebra: 'G', 
    geometry: 'Y', measurement: 'M', data_stats: 'T', number_theory: 'N',
    order_of_operations: 'O', patterns: 'B', rounding: 'C',
    placevalue: 'D', fractions: 'E', conversions: 'F',
    all_mixed: 'X'
};
const CODE_TO_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_CODES).map(([k, v]) => [v, k]));

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
    CATEGORY_CODES, CODE_TO_CATEGORY,
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

