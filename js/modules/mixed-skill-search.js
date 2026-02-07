import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';

export let mixedSkillSearchMouseDown = false;
export let keepMixedSkillSearchOpen = false;

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
                skillSelect.innerHTML += `<option value="${skill.v}">${skill.l}</option>`;
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

