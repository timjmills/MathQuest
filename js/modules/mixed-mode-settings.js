import { state } from './state.js';
import { DOMAINS, SKILLS, SKILL_CODES, CODE_TO_SKILL, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade } from './data.js';

let mixedSettingsState = {
    selectedSkills: {},
    timeChoice: 'student',
    modeChoice: 'student'
};

export function openMixedSettings() {
    // Initialize the mixed skills dropdowns
    initializeMixedSkillsDropdowns();
    
    // Sync from globalSkillsList
    window.mixedSkillsList = window.globalSkillsList.map(item => ({...item}));
    renderMixedSkillsList();
    
    // Load other saved settings
    const saved = loadMixedModeSettings();
    const hasSavedSettings = saved && saved.selectedSkills &&
        Object.values(saved.selectedSkills).reduce((sum, arr) => sum + arr.length, 0) > 0;
    
    if (hasSavedSettings) {
        // Pre-set dropdowns from saved settings
        if (saved.range) {
            const rangeSelect = document.getElementById('mixedRangeSelect');
            if (rangeSelect) rangeSelect.value = saved.range;
        }
        if (saved.decimalPlaces !== undefined) {
            const decimalSelect = document.getElementById('mixedDecimalSelect');
            if (decimalSelect) decimalSelect.value = saved.decimalPlaces;
        }

        // Set time and mode choices
        setTimeChoice(saved.timeChoice || 'student');
        setModeChoice(saved.modeChoice || 'student');

        // If teacher set timer/mode, pre-select those
        if (saved.timeChoice === 'teacher' && saved.timer !== null) {
            const timerSelect = document.getElementById('mixedTimerSelect');
            if (timerSelect) timerSelect.value = saved.timer;
        }
        if (saved.modeChoice === 'teacher' && saved.mode) {
            const modeSelect = document.getElementById('mixedModeSelect');
            if (modeSelect) modeSelect.value = saved.mode;
        }

        // Restore problem goals settings
        const totalProblemsToggle = document.getElementById('mixedTotalProblemsToggle');
        const totalProblemsInput = document.getElementById('mixedTotalProblemsInput');
        const correctGoalToggle = document.getElementById('mixedCorrectGoalToggle');
        const correctGoalInput = document.getElementById('mixedCorrectGoalInput');

        if (saved.totalProblemsEnabled) {
            totalProblemsToggle.checked = true;
            totalProblemsInput.disabled = false;
            if (saved.totalProblems) totalProblemsInput.value = saved.totalProblems;
        } else {
            totalProblemsToggle.checked = false;
            totalProblemsInput.disabled = true;
        }

        if (saved.correctGoalEnabled) {
            correctGoalToggle.checked = true;
            correctGoalInput.disabled = false;
            if (saved.correctGoal) correctGoalInput.value = saved.correctGoal;
        } else {
            correctGoalToggle.checked = false;
            correctGoalInput.disabled = true;
        }
    } else {
        // No saved settings - defaults
        setTimeChoice('student');
        setModeChoice('student');

        // Reset problem goals to defaults
        document.getElementById('mixedTotalProblemsToggle').checked = false;
        document.getElementById('mixedTotalProblemsInput').disabled = true;
        document.getElementById('mixedTotalProblemsInput').value = 20;
        document.getElementById('mixedCorrectGoalToggle').checked = false;
        document.getElementById('mixedCorrectGoalInput').disabled = true;
        document.getElementById('mixedCorrectGoalInput').value = 15;
    }

    // Generate initial code
    updateMixedCode();

    // Show modal
    document.getElementById("mixedSettingsModal").style.display = "flex";
}

// ========== MIXED SETTINGS SKILL INTERFACE ==========
window.mixedSkillsList = [];
let mixedSkillSearchMouseDown = false;
let keepMixedSkillSearchOpen = false;

export function initializeMixedSkillsDropdowns() {
    const domainSelect = document.getElementById('mixedSkillsDomainSelect');
    const categorySelect = document.getElementById('mixedSkillsCategorySelect');
    const skillSelect = document.getElementById('mixedSkillsSkillSelect');
    
    if (!domainSelect) return;
    
    domainSelect.innerHTML = '<option value="">+ Domain...</option>';
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        domainSelect.innerHTML += `<option value="${domainId}">${domain.icon} ${domain.name}</option>`;
    }
    
    categorySelect.innerHTML = '<option value="">+ Category...</option>';
    categorySelect.disabled = true;
    skillSelect.innerHTML = '<option value="">+ Skill...</option>';
    skillSelect.disabled = true;
}

export function updateMixedSkillsCategorySelect() {
    const domainSelect = document.getElementById('mixedSkillsDomainSelect');
    const categorySelect = document.getElementById('mixedSkillsCategorySelect');
    const skillSelect = document.getElementById('mixedSkillsSkillSelect');
    
    const domainId = domainSelect.value;
    
    categorySelect.innerHTML = '<option value="">+ Category...</option>';
    skillSelect.innerHTML = '<option value="">+ Skill...</option>';
    skillSelect.disabled = true;
    
    if (!domainId) {
        categorySelect.disabled = true;
        return;
    }
    
    categorySelect.disabled = false;
    const domain = DOMAINS[domainId];
    if (domain) {
        for (const cat of domain.categories) {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
        }
    }
}

export function updateMixedSkillsSkillSelect() {
    const categorySelect = document.getElementById('mixedSkillsCategorySelect');
    const skillSelect = document.getElementById('mixedSkillsSkillSelect');
    
    const categoryId = categorySelect.value;
    
    skillSelect.innerHTML = '<option value="">+ Skill...</option>';
    
    if (!categoryId) {
        skillSelect.disabled = true;
        return;
    }
    
    skillSelect.disabled = false;
    const skills = SKILLS[categoryId];
    if (skills) {
        for (const skill of skills) {
            if (skill.v !== 'mixed' && !skill.v.startsWith('mixed_')) {
                const grade = getSkillGrade(skill.v, categoryId);
                const prefix = grade !== null ? gradeCircleText(grade) + ' ' : '';
                skillSelect.innerHTML += `<option value="${skill.v}">${prefix}${skill.l}</option>`;
            }
        }
    }
}

export function addMixedSkillFromSelects() {
    const domainSelect = document.getElementById('mixedSkillsDomainSelect');
    const categorySelect = document.getElementById('mixedSkillsCategorySelect');
    const skillSelect = document.getElementById('mixedSkillsSkillSelect');
    
    const domainId = domainSelect.value;
    const categoryId = categorySelect.value;
    const skillId = skillSelect.value;
    
    if (skillId) {
        const domain = DOMAINS[domainId];
        const cat = domain?.categories.find(c => c.id === categoryId);
        const skill = SKILLS[categoryId]?.find(s => s.v === skillId);
        if (skill && cat) {
            addMixedSkill({
                type: 'skill',
                id: skillId,
                categoryId: categoryId,
                domainId: domainId,
                label: skill.l.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
                fullLabel: skill.l,
                icon: cat.icon,
                categoryName: cat.name,
                color: domain?.color || '#8b5cf6',
                percent: 0
            });
        }
    } else if (categoryId) {
        const domain = DOMAINS[domainId];
        const cat = domain?.categories.find(c => c.id === categoryId);
        if (cat) {
            addMixedSkill({
                type: 'category',
                id: categoryId,
                domainId: domainId,
                label: cat.name,
                icon: cat.icon,
                color: domain?.color || '#8b5cf6',
                percent: 0
            });
        }
    } else if (domainId) {
        const domain = DOMAINS[domainId];
        if (domain) {
            addMixedSkill({
                type: 'domain',
                id: domainId,
                label: domain.name,
                icon: domain.icon,
                color: domain.color,
                percent: 0
            });
        }
    } else {
        showNotification('Please select a domain, category, or skill', 'error');
        return;
    }
    
    // Reset dropdowns
    domainSelect.value = '';
    categorySelect.innerHTML = '<option value="">+ Category...</option>';
    categorySelect.disabled = true;
    skillSelect.innerHTML = '<option value="">+ Skill...</option>';
    skillSelect.disabled = true;
}

export function addMixedSkill(item) {
    const exists = window.mixedSkillsList.some(i => i.type === item.type && i.id === item.id);
    if (exists) {
        showNotification('This item is already in the list', 'error');
        return;
    }

    window.mixedSkillsList.push(item);
    renderMixedSkillsList();
    syncMixedSkillsListToGlobal();
}

export function removeMixedSkill(index) {
    window.mixedSkillsList.splice(index, 1);
    renderMixedSkillsList();
    syncMixedSkillsListToGlobal();
}

export function renderMixedSkillsList() {
    const container = document.getElementById('mixedSkillsList');
    if (!container) return;

    if (window.mixedSkillsList.length === 0) {
        container.innerHTML = `<div id="mixedSkillsEmpty" style="text-align:center;color:#999;padding:15px;font-size:0.85rem;">
            No skills added yet. Search or browse to add skills.
        </div>`;
        window.updateMixedSkillsTotal();
        return;
    }
    
    container.innerHTML = window.mixedSkillsList.map((item, index) => {
        const typeLabel = item.type === 'domain' ? '🌐 Domain' : item.type === 'category' ? '📚 Category' : '🎯 Skill';
        const typeBadgeColor = item.type === 'domain' ? '#9b59b6' : item.type === 'category' ? '#3498db' : '#27ae60';
        
        return `
            <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:8px 10px;background:#fff;border-radius:6px;margin-bottom:6px;border-left:3px solid ${item.color || '#8b5cf6'};box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div>
                    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                        <span style="font-size:0.6rem;background:${typeBadgeColor};color:white;padding:1px 5px;border-radius:3px;">${typeLabel}</span>
                        <span style="font-weight:600;color:#1a1a2e;font-size:0.85rem;">${item.icon} ${item.label}</span>
                    </div>
                    ${item.categoryName ? `<div style="font-size:0.7rem;color:#666;">${item.categoryName}</div>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <input type="number" id="mixedSkillPercent_${index}"
                           min="0" max="100" value="${item.percent || 0}" 
                           style="width:50px;text-align:center;padding:5px 3px;border:2px solid #ddd;border-radius:5px;background:#fff;color:#1a1a2e;font-size:0.85rem;"
                           onchange="window.updateMixedSkillPercent(${index}, this.value)" 
                           oninput="window.updateMixedSkillPercent(${index}, this.value)">
                    <span style="font-weight:600;color:#666;font-size:0.85rem;">%</span>
                </div>
                <button onclick="removeMixedSkill(${index})" style="padding:3px 7px;background:transparent;border:1px solid #999;color:#666;border-radius:5px;cursor:pointer;font-size:0.85rem;" title="Remove">×</button>
            </div>
        `;
    }).join('');
    
    window.updateMixedSkillsTotal();
}

window.updateMixedSkillPercent = function(index, value) {
    const idx = parseInt(index);
    const val = parseInt(value) || 0;
    if (idx >= 0 && idx < window.mixedSkillsList.length) {
        window.mixedSkillsList[idx].percent = val;
        window.updateMixedSkillsTotal();
        syncMixedSkillsListToGlobal();
    }
};

window.updateMixedSkillsTotal = function() {
    let total = 0;
    for (let i = 0; i < window.mixedSkillsList.length; i++) {
        total += (window.mixedSkillsList[i].percent || 0);
    }

    const zeroPercentItems = window.mixedSkillsList.filter(item => !item.percent || item.percent === 0).length;
    const remaining = Math.max(0, 100 - total);
    const perZeroItem = zeroPercentItems > 0 ? Math.round(remaining / zeroPercentItems) : 0;
    
    const totalDisplay = document.getElementById('mixedSkillsTotalPercent');
    const remainingDisplay = document.getElementById('mixedSkillsRemainingPercent');
    
    if (totalDisplay) {
        totalDisplay.textContent = total + '%';
        totalDisplay.style.color = total > 100 ? '#e74c3c' : total > 0 ? '#27ae60' : '#666';
    }
    if (remainingDisplay) {
        if (zeroPercentItems > 0 && remaining > 0) {
            remainingDisplay.innerHTML = `${remaining}% <span style="font-size:0.85em;color:#888;">(~${perZeroItem}% each to ${zeroPercentItems} unweighted)</span>`;
        } else {
            remainingDisplay.textContent = remaining + '%';
        }
    }
};

export function distributeMixedSkillsEvenly() {
    if (window.mixedSkillsList.length === 0) return;
    const perItem = Math.floor(100 / window.mixedSkillsList.length);
    window.mixedSkillsList.forEach(item => item.percent = perItem);
    renderMixedSkillsList();
    syncMixedSkillsListToGlobal();
}

export function clearMixedSkillsWeights() {
    window.mixedSkillsList.forEach(item => item.percent = 0);
    renderMixedSkillsList();
    syncMixedSkillsListToGlobal();
}

export function clearMixedSkillsList() {
    window.mixedSkillsList = [];
    renderMixedSkillsList();
    syncMixedSkillsListToGlobal();
}

export function syncMixedSkillsListToGlobal() {
    window.globalSkillsList = window.mixedSkillsList.map(item => ({...item}));
    window.weightedItems = window.mixedSkillsList.map(item => ({...item}));
    updateSkillsCountBadge();
}

// Search functions for Mixed Skills
export function handleMixedSkillSearch(query) {
    const resultsDiv = document.getElementById('mixedSkillSearchResults');
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);
    
    const matches = index.filter(item => {
        return terms.every(term => item.searchText.includes(term));
    }).slice(0, 12);
    
    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:10px;color:#666;text-align:center;font-size:0.85rem;">No skills found.</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    let lastDomain = '';
    
    for (const match of matches) {
        if (match.domainId !== lastDomain) {
            if (lastDomain !== '') html += '</div>';
            html += `<div style="padding:5px 8px;background:${match.domainColor}22;font-weight:600;font-size:0.75rem;color:${match.domainColor};border-bottom:1px solid #eee;">
                ${match.domainIcon} ${match.domainName}
            </div><div>`;
            lastDomain = match.domainId;
        }
        
        const isInList = window.mixedSkillsList.some(i => i.type === 'skill' && i.id === match.skillId);
        
        html += `<div style="display:flex;align-items:center;padding:6px 8px;cursor:pointer;border-bottom:1px solid #eee;transition:background 0.2s;gap:6px;"
            onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
            <div style="flex:1;" onclick="addSkillFromMixedSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')">
                <div style="font-weight:500;color:#1a1a2e;font-size:0.85rem;">${match.skillLabel}</div>
                <div style="font-size:0.7rem;color:#666;">${match.categoryIcon} ${match.categoryName}</div>
            </div>
            <button onclick="event.stopPropagation(); addSkillFromMixedSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')"
                style="width:24px;height:24px;border-radius:50%;border:2px solid ${isInList ? '#27ae60' : '#8b5cf6'};background:${isInList ? '#27ae60' : 'transparent'};color:${isInList ? 'white' : '#8b5cf6'};cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
                title="${isInList ? 'Already added' : 'Add to list'}">
                ${isInList ? '✓' : '+'}
            </button>
        </div>`;
    }
    
    if (lastDomain !== '') html += '</div>';
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

export function addSkillFromMixedSearch(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    mixedSkillSearchMouseDown = true;
    keepMixedSkillSearchOpen = true;
    
    // Check if already in list - if so, remove it (toggle behavior)
    const existingIndex = window.mixedSkillsList.findIndex(i => i.type === 'skill' && i.id === skillId);
    
    if (existingIndex !== -1) {
        // Remove the skill
        window.mixedSkillsList.splice(existingIndex, 1);
        renderMixedSkillsList();
        updateMixedCount();
    } else {
        // Add the skill
        addMixedSkill({
            type: 'skill',
            id: skillId,
            categoryId: categoryId,
            domainId: domainId,
            label: skillLabel.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
            fullLabel: skillLabel,
            icon: categoryIcon,
            categoryName: categoryName,
            color: domainColor || '#8b5cf6',
            percent: 0
        });
    }
    
    // Refresh search
    const query = document.getElementById('mixedSkillSearchInput').value;
    if (query && query.trim().length >= 2) {
        handleMixedSkillSearch(query);
    }
    
    setTimeout(() => {
        const input = document.getElementById('mixedSkillSearchInput');
        const results = document.getElementById('mixedSkillSearchResults');
        if (input) input.focus();
        if (results) results.style.display = 'block';
        mixedSkillSearchMouseDown = false;
    }, 50);
}

export function showMixedSkillSearchResults() {
    const query = document.getElementById('mixedSkillSearchInput').value;
    if (query && query.trim().length >= 2) {
        handleMixedSkillSearch(query);
    }
}

export function hideMixedSkillSearchResults() {
    setTimeout(() => {
        if (!mixedSkillSearchMouseDown && !keepMixedSkillSearchOpen) {
            const resultsDiv = document.getElementById('mixedSkillSearchResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
        }
        keepMixedSkillSearchOpen = false;
    }, 300);
}

// Close mixed skill search results when clicking outside
document.addEventListener('click', function(e) {
    const searchInput = document.getElementById('mixedSkillSearchInput');
    const searchResults = document.getElementById('mixedSkillSearchResults');
    
    if (searchResults && searchResults.style.display !== 'none') {
        const clickedInSearch = searchInput?.contains(e.target) || 
                                searchResults?.contains(e.target) ||
                                e.target.closest('.mixed-search-container');
        if (!clickedInSearch) {
            searchResults.style.display = 'none';
        }
    }
});

export function clearMixedSkillSearch() {
    const input = document.getElementById('mixedSkillSearchInput');
    const results = document.getElementById('mixedSkillSearchResults');
    if (input) input.value = '';
    if (results) results.style.display = 'none';
    keepMixedSkillSearchOpen = false;
    mixedSkillSearchMouseDown = false;
}

export function closeMixedSettings() {
    document.getElementById("mixedSettingsModal").style.display = "none";

    // If we don't have valid mixed mode settings, reset category to a default
    const categorySelect = document.getElementById("categorySelect");
    if (!categorySelect.value || categorySelect.value === "" || categorySelect.value === "all_mixed") {
        // Check if we have valid mixed mode settings
        const hasValidSettings = state.mixedModeSettings &&
            state.mixedModeSettings.selectedSkills &&
            Object.values(state.mixedModeSettings.selectedSkills).some(arr => arr && arr.length > 0);

        if (!hasValidSettings) {
            // Reset to operations as default
            categorySelect.value = "operations";
            state.category = "operations";
            updateSkillOptions();
        }
    }
}

export function buildMixedSkillsUI(savedSkills) {
    const container = document.getElementById("mixedSkillsContainer");
    container.innerHTML = "";

    // Define Domain → Category structure matching SKILLS constant
    const DOMAINS = {
        'number_operations': {
            name: '🔢 Number & Operations',
            categories: ['addition', 'subtraction', 'multiplication', 'division', 'integers', 'number_ops_mixed']
        },
        'fractions_decimals': {
            name: '🥧 Fractions, Decimals & Percents',
            categories: ['fractions', 'decimals', 'conversions', 'frac_dec_mixed']
        },
        'geometry_measurement': {
            name: '📐 Geometry & Measurement',
            categories: ['area_perimeter', 'angles_lines', 'shapes_classify', 'coordinates', 'measurement', 'geo_mixed']
        },
        'data_statistics': {
            name: '📊 Data & Statistics',
            categories: ['graphs', 'data_analysis', 'probability', 'data_mixed']
        },
        'algebraic_thinking': {
            name: '🧮 Algebraic Thinking',
            categories: ['patterns', 'algebra', 'order_of_operations', 'placevalue', 'number_sense', 'number_theory', 'algebra_mixed']
        }
    };

    // Category display names
    const CATEGORY_NAMES = {
        addition: '➕ Addition',
        subtraction: '➖ Subtraction',
        multiplication: '✖️ Multiplication',
        division: '➗ Division',
        integers: '🔢 Integers',
        number_ops_mixed: '🎲 Mixed Operations',
        fractions: '🥧 Fractions',
        decimals: '🔢 Decimals',
        conversions: '🔀 Conversions',
        frac_dec_mixed: '🎲 Mixed FDP',
        area_perimeter: '📐 Area & Perimeter',
        angles_lines: '📏 Angles & Lines',
        shapes_classify: '🔷 Shapes',
        coordinates: '📍 Coordinates',
        measurement: '⏰ Measurement',
        geo_mixed: '🎲 Mixed Geo',
        graphs: '📊 Graphs',
        data_analysis: '📈 Data Analysis',
        probability: '🎲 Probability',
        data_mixed: '🎲 Mixed Data',
        patterns: '🔢 Patterns',
        algebra: '🔤 Algebra',
        order_of_operations: '🧮 Order of Ops',
        placevalue: '📊 Place Value',
        number_sense: '🎯 Number Sense',
        number_theory: '🔬 Number Theory',
        algebra_mixed: '🎲 Mixed Algebraic'
    };

    // Build each domain
    Object.entries(DOMAINS).forEach(([domainId, domain]) => {
        const domainDiv = document.createElement("div");
        domainDiv.className = "mixed-domain";
        domainDiv.id = `domain_${domainId}`;

        // Count total skills in domain
        let domainSkillCount = 0;
        let domainSelectedCount = 0;
        domain.categories.forEach(cat => {
            if (SKILLS[cat]) {
                const skills = SKILLS[cat].filter(s => !s.v.startsWith('mixed_') && s.v !== 'mixed');
                domainSkillCount += skills.length;
                if (savedSkills === null) {
                    domainSelectedCount += skills.length;
                } else if (savedSkills[cat]) {
                    domainSelectedCount += savedSkills[cat].length;
                }
            }
        });

        const domainAllSelected = savedSkills === null || domainSelectedCount === domainSkillCount;

        // Domain header
        let domainHTML = `
            <div class="mixed-domain-header" onclick="toggleMixedDomain('${domainId}')">
                <input type="checkbox" class="mixed-domain-checkbox" id="domain_chk_${domainId}"
                    onclick="event.stopPropagation(); toggleDomainCheckbox('${domainId}')"
                    ${domainAllSelected ? 'checked' : ''}>
                <span class="mixed-domain-name">${domain.name}</span>
                <span class="mixed-domain-count">(${domainSelectedCount}/${domainSkillCount})</span>
                <span class="mixed-domain-expand">▼</span>
            </div>
            <div class="mixed-domain-content" id="domain_content_${domainId}">
        `;

        // Build each category within domain
        domain.categories.forEach(cat => {
            if (!SKILLS[cat]) return;
            const skills = SKILLS[cat].filter(s => !s.v.startsWith('mixed_') && s.v !== 'mixed');
            if (skills.length === 0) return;
            const sortedSkills = sortByGrade(skills, cat);

            const savedCatSkills = savedSkills ? (savedSkills[cat] || []) : null;
            const allSkillsSelected = savedSkills === null || (savedCatSkills && savedCatSkills.length === skills.length);
            const catName = CATEGORY_NAMES[cat] || cat;

            domainHTML += `
                <div class="mixed-category" id="category_${cat}">
                    <div class="mixed-category-header" onclick="toggleMixedCategory('${cat}')">
                        <input type="checkbox" class="mixed-category-checkbox" id="cat_${cat}"
                            onclick="event.stopPropagation(); toggleCategoryCheckbox('${cat}', '${domainId}')"
                            ${allSkillsSelected ? 'checked' : ''}>
                        <span class="mixed-category-name">${catName}</span>
                        <span class="mixed-category-expand">▼</span>
                    </div>
                    <div class="mixed-skills-list" id="skills_${cat}">
                        ${sortedSkills.map(skill => {
                            const isChecked = savedSkills === null || (savedCatSkills && savedCatSkills.includes(skill.v));
                            const gc = gradeCircleHTML(getSkillGrade(skill.v, cat));
                            return `
                            <div class="mixed-skill-item">
                                <input type="checkbox" class="mixed-skill-checkbox"
                                    id="skill_${cat}_${skill.v}"
                                    data-category="${cat}" data-skill="${skill.v}" data-domain="${domainId}"
                                    onchange="updateSkillSelection('${cat}', '${domainId}')"
                                    ${isChecked ? 'checked' : ''}>
                                <label class="mixed-skill-label" for="skill_${cat}_${skill.v}">${gc} ${skill.l}</label>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        });

        domainHTML += `</div>`;
        domainDiv.innerHTML = domainHTML;
        container.appendChild(domainDiv);
    });

    // Update all checkboxes to reflect initial state
    Object.keys(DOMAINS).forEach(domainId => {
        updateDomainCheckbox(domainId);
    });
}

// Toggle domain expansion
export function toggleMixedDomain(domainId) {
    const content = document.getElementById(`domain_content_${domainId}`);
    const header = content.previousElementSibling;
    content.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

// Toggle domain checkbox (select/deselect all categories and skills)
export function toggleDomainCheckbox(domainId) {
    const domainCheckbox = document.getElementById(`domain_chk_${domainId}`);
    const isChecked = domainCheckbox.checked;
    
    // Get all category and skill checkboxes in this domain
    const domainContent = document.getElementById(`domain_content_${domainId}`);
    domainContent.querySelectorAll('.mixed-category-checkbox, .mixed-skill-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
    
    updateMixedCode();
}

// Update domain checkbox based on its categories
export function updateDomainCheckbox(domainId) {
    const domainCheckbox = document.getElementById(`domain_chk_${domainId}`);
    const domainContent = document.getElementById(`domain_content_${domainId}`);
    if (!domainCheckbox || !domainContent) return;

    const skillCheckboxes = domainContent.querySelectorAll('.mixed-skill-checkbox');
    const allChecked = Array.from(skillCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(skillCheckboxes).some(cb => cb.checked);

    domainCheckbox.checked = allChecked;
    domainCheckbox.indeterminate = someChecked && !allChecked;

    // Update count display
    const checkedCount = Array.from(skillCheckboxes).filter(cb => cb.checked).length;
    const totalCount = skillCheckboxes.length;
    const countSpan = domainCheckbox.parentElement.querySelector('.mixed-domain-count');
    if (countSpan) {
        countSpan.textContent = `(${checkedCount}/${totalCount})`;
    }
}

// Update category checkbox based on its skills
export function updateCategoryCheckbox(cat, domainId) {
    const catCheckbox = document.getElementById(`cat_${cat}`);
    const skillCheckboxes = document.querySelectorAll(`#skills_${cat} .mixed-skill-checkbox`);
    if (!catCheckbox || !skillCheckboxes.length) return;

    const allChecked = Array.from(skillCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(skillCheckboxes).some(cb => cb.checked);

    catCheckbox.checked = allChecked;
    catCheckbox.indeterminate = someChecked && !allChecked;

    // Also update domain checkbox
    if (domainId) {
        updateDomainCheckbox(domainId);
    }
}

// Called when a skill checkbox changes
export function updateSkillSelection(cat, domainId) {
    updateCategoryCheckbox(cat, domainId);
    updateMixedCode();
}

export function toggleMixedCategory(cat) {
    const skillsList = document.getElementById(`skills_${cat}`);
    const header = skillsList.previousElementSibling;
    skillsList.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

export function toggleCategoryCheckbox(cat, domainId) {
    const catCheckbox = document.getElementById(`cat_${cat}`);
    const skillCheckboxes = document.querySelectorAll(`#skills_${cat} .mixed-skill-checkbox`);

    skillCheckboxes.forEach(cb => {
        cb.checked = catCheckbox.checked;
    });

    updateDomainCheckbox(domainId);
    updateMixedCode();
}

export function selectAllMixedSkills() {
    document.querySelectorAll('.mixed-domain-checkbox, .mixed-category-checkbox, .mixed-skill-checkbox').forEach(cb => {
        cb.checked = true;
        cb.indeterminate = false;
    });
    // Update all domain counts
    ['number_operations', 'fractions_decimals', 'geometry_measurement', 'data_statistics', 'algebraic_thinking'].forEach(d => {
        updateDomainCheckbox(d);
    });
    updateMixedCode();
}

export function deselectAllMixedSkills() {
    document.querySelectorAll('.mixed-domain-checkbox, .mixed-category-checkbox, .mixed-skill-checkbox').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    // Update all domain counts
    ['number_operations', 'fractions_decimals', 'geometry_measurement', 'data_statistics', 'algebraic_thinking'].forEach(d => {
        updateDomainCheckbox(d);
    });
    updateMixedCode();
}

export function setTimeChoice(choice) {
    mixedSettingsState.timeChoice = choice;

    document.getElementById('timeStudentBtn').classList.toggle('active', choice === 'student');
    document.getElementById('timeTeacherBtn').classList.toggle('active', choice === 'teacher');
    document.getElementById('teacherTimeContainer').style.display = choice === 'teacher' ? 'block' : 'none';

    updateMixedCode();
}

export function setModeChoice(choice) {
    mixedSettingsState.modeChoice = choice;

    document.getElementById('modeStudentBtn').classList.toggle('active', choice === 'student');
    document.getElementById('modeTeacherBtn').classList.toggle('active', choice === 'teacher');
    document.getElementById('teacherModeContainer').style.display = choice === 'teacher' ? 'block' : 'none';

    updateMixedCode();
}

// Toggle total problems input
export function toggleTotalProblems() {
    const toggle = document.getElementById('mixedTotalProblemsToggle');
    const input = document.getElementById('mixedTotalProblemsInput');
    input.disabled = !toggle.checked;
    updateMixedCode();
}

// Toggle correct goal input
export function toggleCorrectGoal() {
    const toggle = document.getElementById('mixedCorrectGoalToggle');
    const input = document.getElementById('mixedCorrectGoalInput');
    input.disabled = !toggle.checked;
    updateMixedCode();
}

export function getSelectedMixedSkills() {
    const selected = {};
    // ALL categories from SKILLS constant (including mixed categories)
    const ALL_CATEGORIES = [
        'addition', 'subtraction', 'multiplication', 'division', 'integers', 'number_ops_mixed',
        'fractions', 'decimals', 'conversions', 'frac_dec_mixed',
        'area_perimeter', 'angles_lines', 'shapes_classify', 'coordinates', 'measurement', 'geo_mixed',
        'graphs', 'data_analysis', 'probability', 'data_mixed',
        'patterns', 'algebra', 'order_of_operations', 'placevalue', 'number_sense', 'number_theory', 'algebra_mixed'
    ];

    ALL_CATEGORIES.forEach(cat => {
        const skills = [];
        document.querySelectorAll(`#skills_${cat} .mixed-skill-checkbox:checked`).forEach(cb => {
            skills.push(cb.dataset.skill);
        });
        if (skills.length > 0) {
            selected[cat] = skills;
        }
    });

    return selected;
}

// Compact encoding: Each category's skills become a bitfield, encoded as base36
// Format: M[catBits]-[settings] where catBits is chars (one per category) and settings is 5 chars
const CATEGORY_ORDER = [
    'addition', 'subtraction', 'multiplication', 'division', 'integers', 'number_ops_mixed',
    'fractions', 'decimals', 'conversions', 'frac_dec_mixed',
    'area_perimeter', 'angles_lines', 'shapes_classify', 'coordinates', 'measurement', 'geo_mixed',
    'graphs', 'data_analysis', 'probability', 'data_mixed',
    'patterns', 'algebra', 'order_of_operations', 'placevalue', 'number_sense', 'number_theory', 'algebra_mixed'
];
window.CATEGORY_ORDER = CATEGORY_ORDER;

export function skillsToBitfield(category, selectedSkills) {
    const allSkills = SKILLS[category].filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_'));
    let bitfield = 0;
    allSkills.forEach((skill, idx) => {
        if (selectedSkills.includes(skill.v)) {
            bitfield |= (1 << idx);
        }
    });
    return bitfield;
}

export function bitfieldToSkills(category, bitfield) {
    const allSkills = SKILLS[category].filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_'));
    const selected = [];
    allSkills.forEach((skill, idx) => {
        if (bitfield & (1 << idx)) {
            selected.push(skill.v);
        }
    });
    return selected;
}

export function updateMixedCode() {
    const selected = getSelectedMixedSkills();
    const range = document.getElementById('mixedRangeSelect').value;
    const decimal = document.getElementById('mixedDecimalSelect').value;
    const difficulty = 'medium';
    const timeChoice = mixedSettingsState.timeChoice;
    const modeChoice = mixedSettingsState.modeChoice;
    const timer = timeChoice === 'teacher' ? document.getElementById('mixedTimerSelect').value : 'S';
    const mode = modeChoice === 'teacher' ? document.getElementById('mixedModeSelect').value : 'S';

    // Get problem goals
    const totalProblemsToggle = document.getElementById('mixedTotalProblemsToggle');
    const correctGoalToggle = document.getElementById('mixedCorrectGoalToggle');
    const totalProblemsEnabled = totalProblemsToggle && totalProblemsToggle.checked;
    const correctGoalEnabled = correctGoalToggle && correctGoalToggle.checked;
    const totalProblems = totalProblemsEnabled ? parseInt(document.getElementById('mixedTotalProblemsInput').value, 10) : 0;
    const correctGoal = correctGoalEnabled ? parseInt(document.getElementById('mixedCorrectGoalInput').value, 10) : 0;

    // Build compact bitfield for each category (base36 encoded)
    // Each category gets 2 chars (allows up to 36^2 = 1296 skill combinations)
    let skillCode = '';
    CATEGORY_ORDER.forEach(cat => {
        const catSkills = selected[cat] || [];
        const bitfield = skillsToBitfield(cat, catSkills);
        // Encode as base36, pad to 2 chars
        skillCode += bitfield.toString(36).toUpperCase().padStart(2, '0');
    });

    const rangeCode = RANGE_CODES[range] || '4';
    const decCode = decimal;
    const diffCode = DIFFICULTY_CODES[difficulty] || 'M';

    // Timer code: S for student choice, or actual value code
    const timerCode = timer === 'S' ? 'S' : (TIMER_CODES[timer] || '0');

    // Mode code: S for student choice, or first letter of mode
    const MODE_LETTER = { practice: 'P', timed: 'T', race: 'R', boss: 'B', worksheet: 'W' };
    const modeCode = mode === 'S' ? 'S' : (MODE_LETTER[mode] || 'P');

    // Problem goals code: encode as base36, 2 chars each (0 means disabled, 1-99 for values)
    // Format: TT = total problems (00-99), CC = correct goal (00-99)
    const totalProblemsCode = totalProblems.toString().padStart(2, '0');
    const correctGoalCode = correctGoal.toString().padStart(2, '0');

    // Final compact format: M[12-char skills][5-char settings][4-char goals] = 22 chars total
    // Example: M0F0G0H0I0J0K40MSS0800 (8 total problems, 0 correct goal = disabled)
    const code = `M${skillCode}${rangeCode}${decCode}${diffCode}${timerCode}${modeCode}${totalProblemsCode}${correctGoalCode}`;

    document.getElementById('mixedCodeDisplay').textContent = code;
}

export function copyMixedCode() {
    const code = document.getElementById('mixedCodeDisplay').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = originalText, 1500);
        });
    }
}

export function applyMixedSettings() {
    // Check if any skills are added
    if (window.mixedSkillsList.length === 0) {
        showMixedError('Please add at least one skill!');
        return;
    }

    // Convert mixedSkillsList to selectedSkills format
    const selected = {};
    for (const item of window.mixedSkillsList) {
        if (item.type === 'skill') {
            if (!selected[item.categoryId]) {
                selected[item.categoryId] = [];
            }
            if (!selected[item.categoryId].includes(item.id)) {
                selected[item.categoryId].push(item.id);
            }
        } else if (item.type === 'category') {
            const skills = SKILLS[item.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
            if (!selected[item.id]) {
                selected[item.id] = [];
            }
            skills.forEach(s => {
                if (!selected[item.id].includes(s.v)) {
                    selected[item.id].push(s.v);
                }
            });
        } else if (item.type === 'domain') {
            const domain = DOMAINS[item.id];
            if (domain) {
                domain.categories.forEach(cat => {
                    const skills = SKILLS[cat.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
                    if (!selected[cat.id]) {
                        selected[cat.id] = [];
                    }
                    skills.forEach(s => {
                        if (!selected[cat.id].includes(s.v)) {
                            selected[cat.id].push(s.v);
                        }
                    });
                });
            }
        }
    }

    // Get problem goals settings
    const totalProblemsToggle = document.getElementById('mixedTotalProblemsToggle');
    const correctGoalToggle = document.getElementById('mixedCorrectGoalToggle');
    const totalProblemsEnabled = totalProblemsToggle.checked;
    const correctGoalEnabled = correctGoalToggle.checked;
    const totalProblems = totalProblemsEnabled ? parseInt(document.getElementById('mixedTotalProblemsInput').value, 10) : null;
    const correctGoal = correctGoalEnabled ? parseInt(document.getElementById('mixedCorrectGoalInput').value, 10) : null;

    // Validate: correct goal can't be more than total problems if both are set
    if (totalProblemsEnabled && correctGoalEnabled && correctGoal > totalProblems) {
        showMixedError('Correct goal cannot exceed total problems!');
        return;
    }

    // Store mixed settings in state (including weights)
    state.mixedModeSettings = {
        selectedSkills: selected,
        skillWeights: window.mixedSkillsList.map(item => ({...item})), // Save the weights too
        range: parseInt(document.getElementById('mixedRangeSelect').value, 10),
        decimalPlaces: parseInt(document.getElementById('mixedDecimalSelect').value, 10),
        difficulty: 'medium',
        timeChoice: mixedSettingsState.timeChoice,
        modeChoice: mixedSettingsState.modeChoice,
        timer: mixedSettingsState.timeChoice === 'teacher' ?
            parseInt(document.getElementById('mixedTimerSelect').value, 10) : null,
        mode: mixedSettingsState.modeChoice === 'teacher' ?
            document.getElementById('mixedModeSelect').value : null,
        // Problem goals
        totalProblemsEnabled: totalProblemsEnabled,
        totalProblems: totalProblems,
        correctGoalEnabled: correctGoalEnabled,
        correctGoal: correctGoal
    };

    // Apply settings to main state
    state.category = 'all_mixed';
    state.skill = 'custom_mixed';
    state.range = state.mixedModeSettings.range;
    state.decimalPlaces = state.mixedModeSettings.decimalPlaces;

    // Update main page dropdowns to reflect settings
    const rangeSelect = document.getElementById('rangeSelect');
    const decimalSelect = document.getElementById('decimalSelect');

    if (rangeSelect) rangeSelect.value = state.range;
    if (decimalSelect) decimalSelect.value = state.decimalPlaces;

    // Save mixed mode settings to cookie for Play Mixed button
    saveMixedModeSettings();

    // Close modal
    document.getElementById('mixedSettingsModal').style.display = 'none';

    // If teacher set the mode, go directly to that mode
    if (state.mixedModeSettings.modeChoice === 'teacher' && state.mixedModeSettings.mode) {
        state.timerDuration = state.mixedModeSettings.timer || 0;
        if (state.mixedModeSettings.timeChoice === 'teacher') {
            document.getElementById('timerSelect').value = state.timerDuration;
        }
        selectMode(state.mixedModeSettings.mode);
    } else {
        // Let student choose - just stay on home page with settings applied
        // Update category display to show mixed mode is active
        document.getElementById("categorySelect").value = 'all_mixed';

        // Show a success message
        showMixedSuccess();
    }
}

export function showMixedError(message) {
    const footer = document.querySelector('.mixed-settings-footer');
    let errorDiv = footer.querySelector('.mixed-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'mixed-error';
        errorDiv.style.cssText = 'color: var(--incorrect); font-weight: 600; margin-bottom: 10px; text-align: center;';
        footer.insertBefore(errorDiv, footer.firstChild);
    }
    errorDiv.textContent = message;
    setTimeout(() => errorDiv.remove(), 3000);
}

export function showMixedSuccess() {
    // Brief visual feedback that settings were applied
    const skillSelect = document.getElementById('skillSelect');
    skillSelect.innerHTML = '<option value="custom_mixed" selected>🎲 Custom Mixed (Settings Applied)</option>';
    skillSelect.value = 'custom_mixed';
}
