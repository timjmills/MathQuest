import { state } from './state.js';
import { DOMAINS, SKILLS, getSkillGrade, gradeCircleHTML, gradeCircleText, isMixedMetaSkill, getMixedSkillCount } from './data.js';

window.globalSkillsList = [];
export let addSkillsSearchMouseDown = false;
export let keepAddSkillsSearchOpen = false;

export function openAddSkillsModal() {
    document.getElementById('addSkillsModal').style.display = 'flex';
    initializeAddSkillsDropdowns();
    renderGlobalSkillsList();
    updateSkillsCountBadge();
}

export function closeAddSkillsModal() {
    document.getElementById('addSkillsModal').style.display = 'none';
    updateSkillsCountBadge();
}

export function updateSkillsCountBadge() {
    const badge = document.getElementById('skillsCountBadge');
    if (badge) {
        if (window.globalSkillsList.length > 0) {
            badge.textContent = window.globalSkillsList.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

export function initializeAddSkillsDropdowns() {
    const domainSelect = document.getElementById('addSkillsDomainSelect');
    const categorySelect = document.getElementById('addSkillsCategorySelect');
    const skillSelect = document.getElementById('addSkillsSkillSelect');
    
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

export function updateAddSkillsCategorySelect() {
    const domainSelect = document.getElementById('addSkillsDomainSelect');
    const categorySelect = document.getElementById('addSkillsCategorySelect');
    const skillSelect = document.getElementById('addSkillsSkillSelect');
    
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

export function updateAddSkillsSkillSelect() {
    const categorySelect = document.getElementById('addSkillsCategorySelect');
    const skillSelect = document.getElementById('addSkillsSkillSelect');
    
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

export function addSkillFromModalSelects() {
    const domainSelect = document.getElementById('addSkillsDomainSelect');
    const categorySelect = document.getElementById('addSkillsCategorySelect');
    const skillSelect = document.getElementById('addSkillsSkillSelect');
    
    const domainId = domainSelect.value;
    const categoryId = categorySelect.value;
    const skillId = skillSelect.value;
    
    if (skillId) {
        const domain = DOMAINS[domainId];
        const cat = domain?.categories.find(c => c.id === categoryId);
        const skill = SKILLS[categoryId]?.find(s => s.v === skillId);
        if (skill && cat) {
            addGlobalSkill({
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
            addGlobalSkill({
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
            addGlobalSkill({
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

export function addGlobalSkill(item) {
    const exists = window.globalSkillsList.some(i => i.type === item.type && i.id === item.id);
    if (exists) {
        showNotification('This item is already in the list', 'error');
        return;
    }
    
    window.globalSkillsList.push(item);
    renderGlobalSkillsList();
    updateSkillsCountBadge();
    
    // Also sync to weightedItems for print
    syncGlobalSkillsToWeightedItems();
}

export function removeGlobalSkill(index) {
    window.globalSkillsList.splice(index, 1);
    renderGlobalSkillsList();
    updateSkillsCountBadge();
    syncGlobalSkillsToWeightedItems();
}

export function renderGlobalSkillsList() {
    const container = document.getElementById('globalSkillsList');
    if (!container) return;
    
    if (window.globalSkillsList.length === 0) {
        container.innerHTML = `<div id="globalSkillsEmpty" style="text-align:center;color:#999;padding:20px;font-size:0.9rem;">
            No skills added yet. Search or browse to add skills.
        </div>`;
        window.updateGlobalSkillsTotal();
        return;
    }

    container.innerHTML = window.globalSkillsList.map((item, index) => {
        const typeLabel = item.type === 'domain' ? '🌐 Domain' : item.type === 'category' ? '📚 Category' : '🎯 Skill';
        const typeBadgeColor = item.type === 'domain' ? '#9b59b6' : item.type === 'category' ? '#3498db' : '#27ae60';
        
        return `
            <div style="display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 12px;background:#fff;border-radius:8px;margin-bottom:8px;border-left:3px solid ${item.color || '#8b5cf6'};box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:0.65rem;background:${typeBadgeColor};color:white;padding:1px 6px;border-radius:4px;">${typeLabel}</span>
                        ${item.type === 'skill' ? gradeCircleHTML(getSkillGrade(item.id, item.categoryId)) : ''}
                        <span style="font-weight:600;color:#1a1a2e;">${item.icon} ${item.label}</span>
                    </div>
                    ${item.categoryName ? `<div style="font-size:0.75rem;color:#666;">${item.categoryName}</div>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:5px;">
                    <input type="number" id="globalSkillPercent_${index}"
                           min="0" max="100" value="${item.percent || 0}" 
                           style="width:55px;text-align:center;padding:6px 4px;border:2px solid #ddd;border-radius:6px;background:#fff;color:#1a1a2e;font-size:0.9rem;"
                           onchange="window.updateGlobalSkillPercent(${index}, this.value)" 
                           oninput="window.updateGlobalSkillPercent(${index}, this.value)">
                    <span style="font-weight:600;color:#666;">%</span>
                </div>
                <button onclick="removeGlobalSkill(${index})" style="padding:4px 8px;background:transparent;border:1px solid #999;color:#666;border-radius:6px;cursor:pointer;font-size:0.9rem;" title="Remove">×</button>
            </div>
        `;
    }).join('');
    
    window.updateGlobalSkillsTotal();
}

window.updateGlobalSkillPercent = function(index, value) {
    const idx = parseInt(index);
    const val = parseInt(value) || 0;
    if (idx >= 0 && idx < window.globalSkillsList.length) {
        window.globalSkillsList[idx].percent = val;
        window.updateGlobalSkillsTotal();
        syncGlobalSkillsToWeightedItems();
    }
};

window.updateGlobalSkillsTotal = function() {
    let total = 0;
    for (let i = 0; i < window.globalSkillsList.length; i++) {
        total += (window.globalSkillsList[i].percent || 0);
    }
    
    const zeroPercentItems = window.globalSkillsList.filter(item => !item.percent || item.percent === 0).length;
    const remaining = Math.max(0, 100 - total);
    const perZeroItem = zeroPercentItems > 0 ? Math.round(remaining / zeroPercentItems) : 0;
    
    const totalDisplay = document.getElementById('globalSkillsTotalPercent');
    const remainingDisplay = document.getElementById('globalSkillsRemainingPercent');
    
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

export function distributeGlobalSkillsEvenly() {
    if (window.globalSkillsList.length === 0) return;
    const perItem = Math.floor(100 / window.globalSkillsList.length);
    window.globalSkillsList.forEach(item => item.percent = perItem);
    renderGlobalSkillsList();
    syncGlobalSkillsToWeightedItems();
}

export function clearGlobalSkillsWeights() {
    window.globalSkillsList.forEach(item => item.percent = 0);
    renderGlobalSkillsList();
    syncGlobalSkillsToWeightedItems();
}

export function clearGlobalSkillsList() {
    window.globalSkillsList = [];
    renderGlobalSkillsList();
    updateSkillsCountBadge();
    syncGlobalSkillsToWeightedItems();
}

// Sync global skills to the print weightedItems
export function syncGlobalSkillsToWeightedItems() {
    window.weightedItems = window.globalSkillsList.map(item => ({...item}));
    renderWeightedItemsList();
}

// Sync weightedItems back to globalSkillsList (for bidirectional sync)
export function syncWeightedItemsToGlobalSkills() {
    window.globalSkillsList = window.weightedItems.map(item => ({...item}));
    updateSkillsCountBadge();
}

// Sync mixed skills (from Mixed Settings modal) to globalSkillsList
export function syncMixedSkillsToGlobalSkills(selectedSkills) {
    // Clear current global skills list
    window.globalSkillsList = [];

    // Convert selectedSkills format to globalSkillsList format
    for (const [categoryId, skillIds] of Object.entries(selectedSkills)) {
        if (!skillIds || skillIds.length === 0) continue;
        
        // Find domain and category info
        let domainInfo = null;
        let catInfo = null;
        for (const [domainId, domain] of Object.entries(DOMAINS)) {
            const foundCat = domain.categories.find(c => c.id === categoryId);
            if (foundCat) {
                domainInfo = { id: domainId, ...domain };
                catInfo = foundCat;
                break;
            }
        }
        
        if (!catInfo) continue;
        
        // Add each skill
        skillIds.forEach(skillId => {
            const skillData = SKILLS[categoryId]?.find(s => s.v === skillId);
            if (skillData) {
                window.globalSkillsList.push({
                    type: 'skill',
                    id: skillId,
                    categoryId: categoryId,
                    domainId: domainInfo?.id,
                    label: skillData.l.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
                    fullLabel: skillData.l,
                    icon: catInfo.icon,
                    categoryName: catInfo.name,
                    color: domainInfo?.color || '#8b5cf6',
                    percent: 0
                });
            }
        });
    }
    
    // Also sync to weightedItems for print
    window.weightedItems = window.globalSkillsList.map(item => ({...item}));
    updateSkillsCountBadge();
}

// Search functions for Add Skills modal
export function handleAddSkillsSearch(query) {
    const resultsDiv = document.getElementById('addSkillsSearchResults');
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);
    
    const matches = index.filter(item => {
        return terms.every(term => item.searchText.includes(term));
    });
    
    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:12px;color:#666;text-align:center;font-size:0.9rem;">No skills found.</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    let lastDomain = '';
    
    for (const match of matches) {
        if (match.domainId !== lastDomain) {
            if (lastDomain !== '') html += '</div>';
            html += `<div style="padding:6px 10px;background:${match.domainColor}22;font-weight:600;font-size:0.8rem;color:${match.domainColor};border-bottom:1px solid #eee;">
                ${match.domainIcon} ${match.domainName}
            </div><div>`;
            lastDomain = match.domainId;
        }
        
        const isInList = window.globalSkillsList.some(i => i.type === 'skill' && i.id === match.skillId);
        
        const mixedCount = isMixedMetaSkill(match.skillId) ? getMixedSkillCount(match.skillId) : 0;
        const countSuffix = mixedCount > 0 ? ` (${mixedCount} skills)` : '';
        html += `<div style="display:flex;align-items:center;padding:8px 10px;cursor:pointer;border-bottom:1px solid #eee;transition:background 0.2s;gap:8px;"
            onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
            <div style="flex:1;" onclick="addSkillFromAddSkillsSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')">
                <div style="font-weight:500;color:#1a1a2e;font-size:0.9rem;">${match.skillLabel}${countSuffix}</div>
                <div style="font-size:0.75rem;color:#666;">${match.categoryIcon} ${match.categoryName}</div>
            </div>
            <button onclick="event.stopPropagation(); addSkillFromAddSkillsSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')"
                style="width:28px;height:28px;border-radius:50%;border:2px solid ${isInList ? '#27ae60' : '#8b5cf6'};background:${isInList ? '#27ae60' : 'transparent'};color:${isInList ? 'white' : '#8b5cf6'};cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
                title="${isInList ? 'Already added' : 'Add to list'}">
                ${isInList ? '✓' : '+'}
            </button>
        </div>`;
    }
    
    if (lastDomain !== '') html += '</div>';
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

export function addSkillFromAddSkillsSearch(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    addSkillsSearchMouseDown = true;
    keepAddSkillsSearchOpen = true;
    
    // Check if already in list - if so, remove it (toggle behavior)
    const existingIndex = window.globalSkillsList.findIndex(i => i.type === 'skill' && i.id === skillId);
    
    if (existingIndex !== -1) {
        // Remove the skill (toggle off)
        window.globalSkillsList.splice(existingIndex, 1);
        renderGlobalSkillsList();
        updateSkillsCountBadge();
        syncGlobalSkillsToWeightedItems();
    } else {
        // Add the skill
        addGlobalSkill({
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
    
    // Refresh search results
    const query = document.getElementById('addSkillsSearchInput').value;
    if (query && query.trim().length >= 2) {
        handleAddSkillsSearch(query);
    }
    
    setTimeout(() => {
        const input = document.getElementById('addSkillsSearchInput');
        const results = document.getElementById('addSkillsSearchResults');
        if (input) input.focus();
        if (results) results.style.display = 'block';
        addSkillsSearchMouseDown = false;
    }, 50);
}

export function showAddSkillsSearchResults() {
    const query = document.getElementById('addSkillsSearchInput').value;
    if (query && query.trim().length >= 2) {
        handleAddSkillsSearch(query);
    }
}

export function hideAddSkillsSearchResults() {
    setTimeout(() => {
        if (!addSkillsSearchMouseDown && !keepAddSkillsSearchOpen) {
            const resultsDiv = document.getElementById('addSkillsSearchResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
        }
        keepAddSkillsSearchOpen = false;
    }, 300);
}

// Close add skills search results when clicking outside
document.addEventListener('click', function(e) {
    const searchInput = document.getElementById('addSkillsSearchInput');
    const searchResults = document.getElementById('addSkillsSearchResults');
    
    if (searchResults && searchResults.style.display !== 'none') {
        const clickedInSearch = searchInput?.contains(e.target) || 
                                searchResults?.contains(e.target) ||
                                e.target.closest('.add-skills-search-container');
        if (!clickedInSearch) {
            searchResults.style.display = 'none';
        }
    }
});

export function clearAddSkillsSearch() {
    const input = document.getElementById('addSkillsSearchInput');
    const results = document.getElementById('addSkillsSearchResults');
    if (input) input.value = '';
    if (results) results.style.display = 'none';
    keepAddSkillsSearchOpen = false;
    addSkillsSearchMouseDown = false;
}

// Play with global skills
export function playWithGlobalSkills(mode) {
    if (window.globalSkillsList.length === 0) {
        showNotification('Please add at least one skill first', 'error');
        return;
    }
    
    closeAddSkillsModal();
    
    // Build mixed mode settings from global skills
    const selectedSkills = {};
    for (const item of window.globalSkillsList) {
        if (item.type === 'skill') {
            if (!selectedSkills[item.categoryId]) {
                selectedSkills[item.categoryId] = [];
            }
            if (!selectedSkills[item.categoryId].includes(item.id)) {
                selectedSkills[item.categoryId].push(item.id);
            }
        } else if (item.type === 'category') {
            const skills = SKILLS[item.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
            if (!selectedSkills[item.id]) {
                selectedSkills[item.id] = [];
            }
            skills.forEach(s => {
                if (!selectedSkills[item.id].includes(s.v)) {
                    selectedSkills[item.id].push(s.v);
                }
            });
        } else if (item.type === 'domain') {
            const domain = DOMAINS[item.id];
            if (domain) {
                domain.categories.forEach(cat => {
                    const skills = SKILLS[cat.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
                    if (!selectedSkills[cat.id]) {
                        selectedSkills[cat.id] = [];
                    }
                    skills.forEach(s => {
                        if (!selectedSkills[cat.id].includes(s.v)) {
                            selectedSkills[cat.id].push(s.v);
                        }
                    });
                });
            }
        }
    }
    
    state.mixedModeSettings = {
        selectedSkills: selectedSkills,
        problemCount: state.problemCount || 20,
        range: state.range || 100
    };
    state.gameMode = mode;
    state.isMixedMode = true;
    
    startGame();
}

export function openPrintWithGlobalSkills() {
    closeAddSkillsModal();
    syncGlobalSkillsToWeightedItems();
    openPrintSettings();
}

export function quizFromGlobalSkills() {
    if (window.globalSkillsList.length === 0) {
        showNotification('Please add at least one skill first', 'error');
        return;
    }
    closeAddSkillsModal();
    window.openQuizBuilder();
    // Add one question per skill after builder opens
    setTimeout(() => {
        for (const item of window.globalSkillsList) {
            if (item.type === 'skill') {
                window.addQuizQuestion(item.id);
            }
        }
    }, 100);
}

