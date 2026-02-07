import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';

window.weightedItems = [];

export function togglePrintSource(row) {
    const radio = row.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    
    // Clear queued skills when changing source (unless from search queue)
    if (!window.queuedSkillsFromSearch) {
        window.queuedSkillsFullInfo = null;
    }
    
    // Show/hide custom skills section
    const printSkillsSection = document.getElementById('printSkillsSection');
    const isCustom = document.getElementById('printSourceCustom')?.checked;
    if (printSkillsSection) {
        printSkillsSection.style.display = isCustom ? 'block' : 'none';
        if (isCustom && !printSkillsSection.dataset.initialized) {
            buildPrintSkillsUI();
            printSkillsSection.dataset.initialized = 'true';
        }
    }
    
    // Update weighted section based on new source
    setTimeout(() => {
        initializeWeightedSectionOnOpen();
    }, 50);
}

// Build print-specific skills selection UI with domain organization
export function buildPrintSkillsUI() {
    const container = document.getElementById("printSkillsContainer");
    if (!container) return;
    container.innerHTML = "";
    
    // Build UI organized by domain
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        // Create domain section
        const domainDiv = document.createElement("div");
        domainDiv.className = "print-domain-section";
        domainDiv.style.cssText = "margin-bottom:15px;border:1px solid var(--border-light);border-radius:8px;overflow:hidden;";
        
        // Domain header
        const domainHeader = document.createElement("div");
        domainHeader.className = "print-domain-header";
        domainHeader.style.cssText = `background:${domain.color}22;padding:10px 12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border-light);`;
        domainHeader.innerHTML = `
            <span style="font-size:1.2rem;">${domain.icon}</span>
            <span style="flex:1;">${domain.name}</span>
            <span class="domain-expand" style="font-size:0.8rem;color:var(--text-dim);">▼</span>
        `;
        domainHeader.onclick = () => {
            domainContent.style.display = domainContent.style.display === 'none' ? 'block' : 'none';
            domainHeader.querySelector('.domain-expand').textContent = domainContent.style.display === 'none' ? '▶' : '▼';
        };
        domainDiv.appendChild(domainHeader);
        
        // Domain content (categories)
        const domainContent = document.createElement("div");
        domainContent.style.cssText = "padding:8px;";
        
        domain.categories.forEach(cat => {
            const skills = SKILLS[cat.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
            if (skills.length === 0) return;
            
            const catDiv = document.createElement("div");
            catDiv.className = "mixed-category";
            catDiv.innerHTML = `
                <div class="mixed-category-header" onclick="togglePrintCategory('${cat.id}')">
                    <input type="checkbox" class="print-category-checkbox" id="printcat_${cat.id}"
                        onclick="event.stopPropagation(); togglePrintCategoryCheckbox('${cat.id}')"
                        checked>
                    <span class="mixed-category-name">${cat.icon} ${cat.name}</span>
                    <span class="mixed-category-expand">▼</span>
                </div>
                <div class="mixed-skills-list" id="printskills_${cat.id}">
                    ${skills.map(skill => `
                        <div class="mixed-skill-item">
                            <input type="checkbox" class="print-skill-checkbox"
                                id="printskill_${cat.id}_${skill.v}"
                                data-category="${cat.id}" data-skill="${skill.v}"
                                onchange="updatePrintCategoryCheckbox('${cat.id}')"
                                checked>
                            <label class="mixed-skill-label" for="printskill_${cat.id}_${skill.v}">${skill.l}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            domainContent.appendChild(catDiv);
        });
        
        domainDiv.appendChild(domainContent);
        container.appendChild(domainDiv);
    }
}

export function togglePrintCategory(cat) {
    const header = document.querySelector(`#printskills_${cat}`).previousElementSibling;
    const skillsList = document.getElementById(`printskills_${cat}`);
    if (header && skillsList) {
        header.classList.toggle('expanded');
        skillsList.classList.toggle('expanded');
    }
}

export function togglePrintCategoryCheckbox(cat) {
    const catCheckbox = document.getElementById(`printcat_${cat}`);
    const skillCheckboxes = document.querySelectorAll(`#printskills_${cat} .print-skill-checkbox`);
    skillCheckboxes.forEach(cb => cb.checked = catCheckbox.checked);
    // Update the weighted section
    updateWeightedSectionFromSelections();
}

export function updatePrintCategoryCheckbox(cat) {
    const catCheckbox = document.getElementById(`printcat_${cat}`);
    const skillCheckboxes = document.querySelectorAll(`#printskills_${cat} .print-skill-checkbox`);
    if (!catCheckbox || !skillCheckboxes.length) return;
    
    const allChecked = Array.from(skillCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(skillCheckboxes).some(cb => cb.checked);
    catCheckbox.checked = allChecked;
    catCheckbox.indeterminate = someChecked && !allChecked;
    // Update the weighted section
    updateWeightedSectionFromSelections();
}

export function selectAllPrintSkills() {
    document.querySelectorAll('.print-category-checkbox, .print-skill-checkbox').forEach(cb => cb.checked = true);
    updateWeightedSectionFromSelections();
}

export function deselectAllPrintSkills() {
    document.querySelectorAll('.print-category-checkbox, .print-skill-checkbox').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    updateWeightedSectionFromSelections();
}

// Build weighted section from currently selected print skills or mixed mode
export function updateWeightedSectionFromSelections() {
    // Don't update if we have queued skills from search (they take priority)
    if (window.queuedSkillsFullInfo && window.queuedSkillsFullInfo.length > 0) return;
    
    // Get currently selected skills from print custom selection
    const selectedSkills = getSelectedPrintSkillsWithInfo();
    
    if (selectedSkills.length === 0) {
        const container = document.getElementById('queuedSkillsWeightedSection');
        if (container) container.style.display = 'none';
        return;
    }
    
    // Store for the weighted section (reuse the same structure)
    window.queuedSkillsFullInfo = selectedSkills;
    buildQueuedSkillsWeightedSection();
}

// Get selected print skills with full info for weighted display
export function getSelectedPrintSkillsWithInfo() {
    const selected = [];
    
    // Iterate through all domains and categories to find checked skills
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const cat of domain.categories) {
            const skillCheckboxes = document.querySelectorAll(`#printskills_${cat.id} .print-skill-checkbox:checked`);
            skillCheckboxes.forEach(cb => {
                const skillId = cb.dataset.skill;
                const skillData = SKILLS[cat.id]?.find(s => s.v === skillId);
                if (skillData) {
                    selected.push({
                        domainId: domainId,
                        categoryId: cat.id,
                        skillId: skillId,
                        skillLabel: skillData.l,
                        categoryIcon: cat.icon,
                        categoryName: cat.name,
                        domainColor: domain.color
                    });
                }
            });
        }
    }
    
    return selected;
}

// Also build from mixed mode settings when using current game settings
export function buildWeightedFromMixedSettings() {
    if (!state.mixedModeSettings || !state.mixedModeSettings.selectedSkills) return [];
    
    const selected = [];
    const mixedSkills = state.mixedModeSettings.selectedSkills;
    
    for (const [categoryId, skills] of Object.entries(mixedSkills)) {
        if (!skills || skills.length === 0) continue;
        
        // Find the domain and category info
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
        
        skills.forEach(skillId => {
            const skillData = SKILLS[categoryId]?.find(s => s.v === skillId);
            if (skillData) {
                selected.push({
                    domainId: domainInfo.id,
                    categoryId: categoryId,
                    skillId: skillId,
                    skillLabel: skillData.l,
                    categoryIcon: catInfo.icon,
                    categoryName: catInfo.name,
                    domainColor: domainInfo.color
                });
            }
        });
    }
    
    return selected;
}

// Initialize weighted section when opening print settings
export function initializeWeightedSectionOnOpen() {
    // Check source: queued skills > custom selection > mixed mode > current skill
    if (window.queuedSkillsFullInfo && window.queuedSkillsFullInfo.length > 0) {
        // Already have queued skills from search
        buildQueuedSkillsWeightedSection();
        return;
    }
    
    // Check if using custom selection source
    const isCustom = document.getElementById('printSourceCustom')?.checked;
    if (isCustom) {
        updateWeightedSectionFromSelections();
        return;
    }
    
    // Check if using mixed mode
    const isMixed = document.getElementById('printSourceMixed')?.checked;
    if (isMixed && state.mixedModeSettings && state.mixedModeSettings.selectedSkills) {
        window.queuedSkillsFullInfo = buildWeightedFromMixedSettings();
        buildQueuedSkillsWeightedSection();
        return;
    }
    
    // Using current skill - create single skill entry
    const currentSkillId = document.getElementById('skillSelect')?.value;
    const currentCategoryId = document.getElementById('categorySelect')?.value;
    const currentDomainId = document.getElementById('domainSelect')?.value;
    
    if (currentSkillId && currentCategoryId && currentDomainId !== 'all_domains') {
        const domain = DOMAINS[currentDomainId];
        const cat = domain?.categories.find(c => c.id === currentCategoryId);
        const skillData = SKILLS[currentCategoryId]?.find(s => s.v === currentSkillId);
        
        if (domain && cat && skillData) {
            window.queuedSkillsFullInfo = [{
                domainId: currentDomainId,
                categoryId: currentCategoryId,
                skillId: currentSkillId,
                skillLabel: skillData.l,
                categoryIcon: cat.icon,
                categoryName: cat.name,
                domainColor: domain.color
            }];
            buildQueuedSkillsWeightedSection();
        }
    }
}

// ===== Weighted Distribution Functions =====

// Store weighted skills configuration
let weightedSkillsConfig = [];

// Dynamically generate weighted skills from SKILLS constant to ensure consistency
// This ensures landing page, custom print, and weighted distribution all use same skills
export function generateWeightedSkillsFromDomains() {
    const result = {};
    
    // Iterate through all domains and their categories
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const category of domain.categories) {
            const categorySkills = SKILLS[category.id];
            if (!categorySkills) continue;
            
            // Filter out "mixed" skills and map to weighted format
            const skills = categorySkills
                .filter(s => !s.v.startsWith('mixed_') && s.v !== 'mixed')
                .map(s => ({
                    id: s.v,
                    label: s.l.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, '') // Remove emoji prefixes
                }));
            
            if (skills.length > 0) {
                // Use category id as key, with domain context in display
                result[category.id] = skills;
            }
        }
    }
    
    return result;
}

// Generate the weighted skills object
const allSkillsForWeighting = generateWeightedSkillsFromDomains();

// Helper to get category display name for weighted UI
export function getWeightedCategoryLabel(categoryId) {
    for (const domain of Object.values(DOMAINS)) {
        const cat = domain.categories.find(c => c.id === categoryId);
        if (cat) return `${cat.icon} ${cat.name}`;
    }
    return categoryId;
}

// ===== Unified Weighted Items System =====
// Stores items as: { type: 'domain'|'category'|'skill', id: string, label: string, icon: string, color: string, percent: number }

// Initialize the weighted dropdowns
export function initializeWeightedDropdowns() {
    const domainSelect = document.getElementById('weightedDomainSelect');
    const categorySelect = document.getElementById('weightedCategorySelect');
    const skillSelect = document.getElementById('weightedSkillSelect');
    
    if (!domainSelect) return;
    
    // Populate domain dropdown
    domainSelect.innerHTML = '<option value="">+ Add Domain...</option>';
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        domainSelect.innerHTML += `<option value="${domainId}">${domain.icon} ${domain.name}</option>`;
    }
    
    // Reset category and skill
    categorySelect.innerHTML = '<option value="">+ Add Category...</option>';
    categorySelect.disabled = true;
    skillSelect.innerHTML = '<option value="">+ Add Skill...</option>';
    skillSelect.disabled = true;
}

export function updateWeightedCategorySelect() {
    const domainSelect = document.getElementById('weightedDomainSelect');
    const categorySelect = document.getElementById('weightedCategorySelect');
    const skillSelect = document.getElementById('weightedSkillSelect');
    
    const domainId = domainSelect.value;
    
    categorySelect.innerHTML = '<option value="">+ Add Category...</option>';
    skillSelect.innerHTML = '<option value="">+ Add Skill...</option>';
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

export function updateWeightedSkillSelect() {
    const categorySelect = document.getElementById('weightedCategorySelect');
    const skillSelect = document.getElementById('weightedSkillSelect');
    
    const categoryId = categorySelect.value;
    
    skillSelect.innerHTML = '<option value="">+ Add Skill...</option>';
    
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

export function addWeightedItemFromSelects() {
    const domainSelect = document.getElementById('weightedDomainSelect');
    const categorySelect = document.getElementById('weightedCategorySelect');
    const skillSelect = document.getElementById('weightedSkillSelect');
    
    const domainId = domainSelect.value;
    const categoryId = categorySelect.value;
    const skillId = skillSelect.value;
    
    // Determine what to add (most specific selection wins)
    if (skillId) {
        // Add specific skill
        const domain = DOMAINS[domainId];
        const cat = domain?.categories.find(c => c.id === categoryId);
        const skill = SKILLS[categoryId]?.find(s => s.v === skillId);
        if (skill && cat) {
            addWeightedItem({
                type: 'skill',
                id: skillId,
                categoryId: categoryId,
                domainId: domainId,
                label: skill.l.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
                fullLabel: skill.l,
                icon: cat.icon,
                categoryName: cat.name,
                color: domain?.color || 'var(--accent-cyan)',
                percent: 0
            });
        }
    } else if (categoryId) {
        // Add entire category
        const domain = DOMAINS[domainId];
        const cat = domain?.categories.find(c => c.id === categoryId);
        if (cat) {
            addWeightedItem({
                type: 'category',
                id: categoryId,
                domainId: domainId,
                label: cat.name,
                icon: cat.icon,
                color: domain?.color || 'var(--accent-cyan)',
                percent: 0
            });
        }
    } else if (domainId) {
        // Add entire domain
        const domain = DOMAINS[domainId];
        if (domain) {
            addWeightedItem({
                type: 'domain',
                id: domainId,
                label: domain.name,
                icon: domain.icon,
                color: domain.color,
                percent: 0
            });
        }
    } else {
        alert('Please select a domain, category, or skill to add.');
        return;
    }
    
    // Reset dropdowns
    domainSelect.value = '';
    categorySelect.innerHTML = '<option value="">+ Add Category...</option>';
    categorySelect.disabled = true;
    skillSelect.innerHTML = '<option value="">+ Add Skill...</option>';
    skillSelect.disabled = true;
}

export function addWeightedItem(item) {
    // Check for duplicates
    const exists = window.weightedItems.some(i => i.type === item.type && i.id === item.id);
    if (exists) {
        showNotification('This item is already in the list', 'error');
        return;
    }
    
    window.weightedItems.push(item);
    renderWeightedItemsList();
    syncWeightedItemsToGlobalSkills();
}

export function removeWeightedItem(index) {
    window.weightedItems.splice(index, 1);
    renderWeightedItemsList();
    syncWeightedItemsToGlobalSkills();
}

export function renderWeightedItemsList() {
    const container = document.getElementById('weightedItemsList');
    const emptyMsg = document.getElementById('weightedItemsEmpty');
    
    if (!container) return;
    
    if (window.weightedItems.length === 0) {
        container.innerHTML = `<div id="weightedItemsEmpty" style="text-align:center;color:#666;padding:20px;font-size:0.9rem;">
            No items added yet. Search above or use the dropdowns to add skills.
        </div>`;
        window.updateWeightedTotal();
        return;
    }
    
    container.innerHTML = window.weightedItems.map((item, index) => {
        const typeLabel = item.type === 'domain' ? '🌐 Domain' : item.type === 'category' ? '📚 Category' : '🎯 Skill';
        const typeBadgeColor = item.type === 'domain' ? '#9b59b6' : item.type === 'category' ? '#3498db' : '#27ae60';
        
        return `
            <div class="weighted-item-row" style="display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 12px;background:#f5f5f5;border-radius:8px;margin-bottom:8px;border-left:3px solid ${item.color || '#0891b2'};">
                <div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:0.65rem;background:${typeBadgeColor};color:white;padding:1px 6px;border-radius:4px;">${typeLabel}</span>
                        <span style="font-weight:600;color:#1a1a2e;">${item.icon} ${item.label}</span>
                    </div>
                    ${item.categoryName ? `<div style="font-size:0.75rem;color:#666;">${item.categoryName}</div>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:5px;">
                    <input type="number" class="weighted-item-percent" id="weightedPercent_${index}"
                           min="0" max="100" value="${item.percent || 0}" 
                           style="width:55px;text-align:center;padding:6px 4px;border:2px solid #ddd;border-radius:6px;background:#fff;color:#1a1a2e;font-size:0.9rem;"
                           onchange="window.updateWeightedItemPercent(${index}, this.value)" 
                           oninput="window.updateWeightedItemPercent(${index}, this.value)">
                    <span style="font-weight:600;color:#666;">%</span>
                </div>
                <button onclick="removeWeightedItem(${index})" style="padding:4px 8px;background:transparent;border:1px solid #999;color:#666;border-radius:6px;cursor:pointer;font-size:0.9rem;" title="Remove">×</button>
            </div>
        `;
    }).join('');
    
    window.updateWeightedTotal();
}

// Make these functions globally accessible
window.updateWeightedItemPercent = function(index, value) {
    const idx = parseInt(index);
    const val = parseInt(value) || 0;
    if (idx >= 0 && idx < window.weightedItems.length) {
        window.weightedItems[idx].percent = val;
        window.updateWeightedTotal();
        syncWeightedItemsToGlobalSkills();
    }
};

window.updateWeightedTotal = function() {
    // Recalculate from the array
    let total = 0;
    for (let i = 0; i < window.weightedItems.length; i++) {
        total += (window.weightedItems[i].percent || 0);
    }
    console.log('updateWeightedTotal called, total:', total);
    
    // Count items with 0%
    const zeroPercentItems = window.weightedItems.filter(item => !item.percent || item.percent === 0).length;
    const remaining = Math.max(0, 100 - total);
    const perZeroItem = zeroPercentItems > 0 ? Math.round(remaining / zeroPercentItems) : 0;
    
    const totalDisplay = document.getElementById('weightedTotalPercent');
    const remainingDisplay = document.getElementById('weightedRemainingPercent');
    const warningDisplay = document.getElementById('weightedWarning');
    
    if (totalDisplay) {
        totalDisplay.textContent = total + '%';
        totalDisplay.style.color = total > 100 ? '#e74c3c' : total > 0 ? '#27ae60' : '#666';
    }
    if (remainingDisplay) {
        if (zeroPercentItems > 0 && remaining > 0) {
            remainingDisplay.innerHTML = `${remaining}% <span style="font-size:0.85em;color:#666;">(~${perZeroItem}% each to ${zeroPercentItems} unweighted item${zeroPercentItems > 1 ? 's' : ''})</span>`;
        } else {
            remainingDisplay.textContent = remaining + '%';
        }
    }
    if (warningDisplay) {
        warningDisplay.style.display = total > 100 ? 'block' : 'none';
    }
}

export function distributeWeightedEvenly() {
    if (window.weightedItems.length === 0) return;
    const perItem = Math.floor(100 / window.weightedItems.length);
    window.weightedItems.forEach(item => item.percent = perItem);
    renderWeightedItemsList();
}

export function clearAllWeights() {
    window.weightedItems.forEach(item => item.percent = 0);
    renderWeightedItemsList();
}

export function clearWeightedList() {
    window.weightedItems = [];
    renderWeightedItemsList();
    syncWeightedItemsToGlobalSkills();
}

// Get weighted items for generation (converts to the format used by print generation)
// Returns ALL items, including those with 0% (for even distribution of remainder)
export function getWeightedItemsForGeneration() {
    const result = [];
    
    for (const item of window.weightedItems) {
        const percent = item.percent || 0;
        
        if (item.type === 'skill') {
            result.push({
                category: item.categoryId,
                skill: item.id,
                percent: percent,
                range: 100
            });
        } else if (item.type === 'category') {
            // Expand category to all its skills, split percentage
            const skills = SKILLS[item.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
            const perSkill = percent / Math.max(1, skills.length);
            skills.forEach(skill => {
                result.push({
                    category: item.id,
                    skill: skill.v,
                    percent: perSkill,
                    range: 100
                });
            });
        } else if (item.type === 'domain') {
            // Expand domain to all categories and skills
            const domain = DOMAINS[item.id];
            if (domain) {
                let totalSkills = 0;
                domain.categories.forEach(cat => {
                    const skills = SKILLS[cat.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
                    totalSkills += skills.length;
                });
                
                const perSkill = percent / Math.max(1, totalSkills);
                domain.categories.forEach(cat => {
                    const skills = SKILLS[cat.id]?.filter(s => s.v !== 'mixed' && !s.v.startsWith('mixed_')) || [];
                    skills.forEach(skill => {
                        result.push({
                            category: cat.id,
                            skill: skill.v,
                            percent: perSkill,
                            range: 100
                        });
                    });
                });
            }
        }
    }
    
    return result;
}

// ===== Print Settings Skill Search =====
let printSearchMouseDown = false;

export function handlePrintSkillSearch(query) {
    const resultsDiv = document.getElementById('printSkillSearchResults');
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);
    
    // Find matches - all terms must match
    const matches = index.filter(item => {
        return terms.every(term => item.searchText.includes(term));
    });
    
    // Limit to 12 results for the smaller modal
    const limitedMatches = matches.slice(0, 12);
    
    if (limitedMatches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:12px;color:var(--text-dim);text-align:center;font-size:0.9rem;">No skills found. Try different keywords.</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Group by domain
    let html = '';
    let lastDomain = '';
    
    for (const match of limitedMatches) {
        if (match.domainId !== lastDomain) {
            if (lastDomain !== '') {
                html += '</div>';
            }
            html += `<div style="padding:6px 10px;background:${match.domainColor}22;font-weight:600;font-size:0.8rem;color:${match.domainColor};border-bottom:1px solid var(--border);">
                ${match.domainIcon} ${match.domainName}
            </div><div>`;
            lastDomain = match.domainId;
        }
        
        // Check if already in weighted list
        const isInList = window.weightedItems.some(i => i.type === 'skill' && i.id === match.skillId);
        
        html += `<div class="print-search-result-item" style="display:flex;align-items:center;padding:8px 10px;cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.2s;gap:8px;"
            onmouseover="this.style.background='var(--bg-card-light)'" onmouseout="this.style.background='transparent'">
            <div style="flex:1;" onclick="addSkillFromPrintSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')">
                <div style="font-weight:500;color:var(--text);font-size:0.9rem;">${match.skillLabel}</div>
                <div style="font-size:0.75rem;color:var(--text-dim);">${match.categoryIcon} ${match.categoryName}</div>
            </div>
            <button onclick="event.stopPropagation(); addSkillFromPrintSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${match.domainColor}')"
                style="width:28px;height:28px;border-radius:50%;border:2px solid ${isInList ? 'var(--correct)' : 'var(--accent-cyan)'};background:${isInList ? 'var(--correct)' : 'transparent'};color:${isInList ? 'white' : 'var(--accent-cyan)'};cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
                onmouseover="if(!this.dataset.added){this.style.background='var(--accent-cyan)';this.style.color='white';}" 
                onmouseout="if(!this.dataset.added){this.style.background='transparent';this.style.color='var(--accent-cyan)';}"
                title="${isInList ? 'Already added' : 'Add to list'}"
                ${isInList ? 'data-added="true"' : ''}>
                ${isInList ? '✓' : '+'}
            </button>
        </div>`;
    }
    
    if (lastDomain !== '') {
        html += '</div>';
    }
    
    if (matches.length > 12) {
        html += `<div style="padding:8px;text-align:center;color:var(--text-dim);font-size:0.8rem;background:var(--bg-card-light);">
            Showing 12 of ${matches.length} results. Type more to narrow.
        </div>`;
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

export function addSkillFromPrintSearch(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    printSearchMouseDown = true;
    keepPrintSearchOpen = true;
    
    // Check if already in weighted list - if so, remove it (toggle behavior)
    const existingIndex = window.weightedItems.findIndex(i => i.type === 'skill' && i.id === skillId);
    
    if (existingIndex !== -1) {
        // Remove the skill
        window.weightedItems.splice(existingIndex, 1);
        renderWeightedItemsList();
        syncWeightedItemsToGlobalSkills();
    } else {
        // Add to weighted items
        addWeightedItem({
            type: 'skill',
            id: skillId,
            categoryId: categoryId,
            domainId: domainId,
            label: skillLabel.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
            fullLabel: skillLabel,
            icon: categoryIcon,
            categoryName: categoryName,
            color: domainColor || 'var(--accent-cyan)',
            percent: 0
        });
    }
    
    // Refresh search results to show updated checkmark
    const query = document.getElementById('printSkillSearchInput').value;
    if (query && query.trim().length >= 2) {
        handlePrintSkillSearch(query);
    }
    
    // Keep search open and focused
    setTimeout(() => {
        const input = document.getElementById('printSkillSearchInput');
        const results = document.getElementById('printSkillSearchResults');
        if (input) input.focus();
        if (results) results.style.display = 'block';
        printSearchMouseDown = false;
    }, 50);
}

export function showPrintSearchResults() {
    const query = document.getElementById('printSkillSearchInput').value;
    if (query && query.trim().length >= 2) {
        handlePrintSkillSearch(query);
    }
}

let keepPrintSearchOpen = false;

export function hidePrintSearchResults() {
    // Only hide if not actively interacting and not flagged to keep open
    setTimeout(() => {
        if (!printSearchMouseDown && !keepPrintSearchOpen) {
            const resultsDiv = document.getElementById('printSkillSearchResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
        }
        keepPrintSearchOpen = false;
    }, 300);
}

// Close print skill search results when clicking outside
document.addEventListener('click', function(e) {
    const searchInput = document.getElementById('printSkillSearchInput');
    const searchResults = document.getElementById('printSkillSearchResults');
    
    if (searchResults && searchResults.style.display !== 'none') {
        const clickedInSearch = searchInput?.contains(e.target) || 
                                searchResults?.contains(e.target) ||
                                e.target.closest('.print-search-container');
        if (!clickedInSearch) {
            searchResults.style.display = 'none';
        }
    }
});

export function clearPrintSkillSearch() {
    const input = document.getElementById('printSkillSearchInput');
    const results = document.getElementById('printSkillSearchResults');
    if (input) input.value = '';
    if (results) results.style.display = 'none';
    keepPrintSearchOpen = false;
    printSearchMouseDown = false;
}

// Populate weighted items from queued skills (from search)
export function populateWeightedFromQueue() {
    if (!window.queuedSkillsFullInfo || window.queuedSkillsFullInfo.length === 0) return;
    
    // Add each queued skill as a weighted item
    window.queuedSkillsFullInfo.forEach(skill => {
        addWeightedItem({
            type: 'skill',
            id: skill.skillId,
            categoryId: skill.categoryId,
            domainId: skill.domainId,
            label: skill.skillLabel.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, ''),
            fullLabel: skill.skillLabel,
            icon: skill.categoryIcon,
            categoryName: skill.categoryName,
            color: skill.domainColor || 'var(--accent-cyan)',
            percent: 0
        });
    });
    
    // Clear the queue after populating
    window.queuedSkillsFullInfo = null;
}

// Legacy function mappings for backward compatibility
// weightedSkillsConfig is already declared earlier

export function toggleWeightedDistribution() {
    // No longer needed - section is always visible
}

export function addWeightedSkill() {
    // Redirect to new system - just focus the domain dropdown
    document.getElementById('weightedDomainSelect')?.focus();
}

// Old functions kept for backward compatibility but redirect to new system
export function updateWeightedSkillSelection(index) {
    // Legacy - no longer used
}

export function updateWeightedRangeSelection(index) {
    // Legacy - no longer used
}

export function updateWeightedSkillOptions(index) {
    // Legacy - no longer used
}

export function removeWeightedSkill(index) {
    // Legacy - no longer used
}

export function updateWeightedTotal() {
    let total = 0;
    weightedSkillsConfig.forEach((config, index) => {
        if (config) {
            const percentInput = document.getElementById(`weighted_percent_${index}`);
            if (percentInput) {
                config.percent = parseInt(percentInput.value) || 0;
                total += config.percent;
                
                // Also update skill selection
                const skillSelect = document.getElementById(`weighted_skill_${index}`);
                if (skillSelect) {
                    config.skill = skillSelect.value;
                }
                
                // Update range selection
                const rangeSelect = document.getElementById(`weighted_range_${index}`);
                if (rangeSelect) {
                    config.range = parseInt(rangeSelect.value) || 100;
                }
            }
        }
    });
    
    // Update display
    const totalDisplay = document.getElementById('weightedTotalPercent');
    const remainingDisplay = document.getElementById('weightedRemainingPercent');
    const warningDisplay = document.getElementById('weightedWarning');
    
    if (totalDisplay) {
        totalDisplay.textContent = total + '%';
        totalDisplay.style.color = total > 100 ? '#e74c3c' : 'var(--accent-green)';
    }
    if (remainingDisplay) {
        remainingDisplay.textContent = Math.max(0, 100 - total);
    }
    if (warningDisplay) {
        warningDisplay.style.display = total > 100 ? 'block' : 'none';
    }
}

export function getWeightedSkillsForGeneration() {
    // Use the new unified weighted items system
    return getWeightedItemsForGeneration();
}

// Get selected print skills
export function getSelectedPrintSkills() {
    const selectedSkills = {};
    // Use ALL category IDs from DOMAINS, not a hardcoded list
    const allCategoryIds = [];
    for (const domain of Object.values(DOMAINS)) {
        domain.categories.forEach(cat => {
            allCategoryIds.push(cat.id);
        });
    }
    
    allCategoryIds.forEach(cat => {
        selectedSkills[cat] = [];
        document.querySelectorAll(`#printskills_${cat} .print-skill-checkbox:checked`).forEach(cb => {
            selectedSkills[cat].push(cb.dataset.skill);
        });
    });
    
    // Also map old category names to new ones for backward compatibility
    // This maps the UI category IDs to the switch case categories
    const categoryMapping = {
        'addition': 'operations',
        'subtraction': 'operations', 
        'multiplication': 'operations',
        'division': 'operations',
        'number_ops_mixed': 'operations',
        'frac_dec_mixed': 'fractions',
        'area_perimeter': 'geometry',
        'angles_lines': 'geometry',
        'shapes_classify': 'geometry',
        'coordinates': 'geometry',
        'geo_mixed': 'geometry',
        'graphs': 'data_stats',
        'data_analysis': 'data_stats',
        'probability': 'data_stats',
        'data_mixed': 'data_stats',
        'number_sense': 'estimation',
        'algebra_mixed': 'algebra'
    };
    
    // Create a consolidated result with mapped categories
    const mappedSkills = {};
    for (const [cat, skills] of Object.entries(selectedSkills)) {
        if (skills.length > 0) {
            const mappedCat = categoryMapping[cat] || cat;
            if (!mappedSkills[mappedCat]) {
                mappedSkills[mappedCat] = [];
            }
            mappedSkills[mappedCat].push(...skills);
        }
    }
    
    return mappedSkills;
}

