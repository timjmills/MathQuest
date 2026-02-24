import { state } from './state.js';
import { DOMAINS, SKILLS, getSkillGrade, gradeCircleHTML, gradeCircleText, sortByGrade, isMixedMetaSkill, getMixedSkillCount } from './data.js';

export function updateCategoryOptions() {
    const domainSelect = document.getElementById("domainSelect");
    const categorySelect = document.getElementById("categorySelect");
    
    if (!domainSelect || !categorySelect) {
        console.error("Domain or category dropdown not found");
        return;
    }
    
    const domainId = domainSelect.value;
    let optionsHTML = '';
    
    // Helper to create option with tooltip
    const createOption = (value, label, fullText) => {
        const tooltip = fullText || label;
        return `<option value="${value}" title="${tooltip}">${label}</option>`;
    };
    
    if (domainId === 'all_domains') {
        // Show all categories from all domains
        optionsHTML = createOption('all_mixed', '🎲 Mixed Mode (All Categories)', 'Mixed Mode - All Categories from All Domains');
        for (const domain of Object.values(DOMAINS)) {
            optionsHTML += `<optgroup label="${domain.icon} ${domain.name}">`;
            domain.categories.forEach(cat => {
                optionsHTML += createOption(cat.id, `${cat.icon} ${cat.name}`, `${domain.name} › ${cat.name}`);
            });
            optionsHTML += '</optgroup>';
        }
    } else if (DOMAINS[domainId]) {
        // Show only categories for selected domain
        const domain = DOMAINS[domainId];
        domain.categories.forEach(cat => {
            optionsHTML += createOption(cat.id, `${cat.icon} ${cat.name}`, cat.name);
        });
        // Add mixed option for this domain
        optionsHTML += createOption(`domain_mixed_${domainId}`, `🎲 Mixed (All ${domain.name})`, `Mixed Mode - All ${domain.name} Skills`);
    } else {
        // Fallback
        optionsHTML = createOption('operations', '➕ Basic Operations', 'Basic Operations');
    }
    
    categorySelect.innerHTML = optionsHTML;
}

// Update breadcrumb navigation display
export function updateBreadcrumb() {
    const domainSelect = document.getElementById("domainSelect");
    const categorySelect = document.getElementById("categorySelect");
    const skillSelect = document.getElementById("skillSelect");
    const breadcrumbDomain = document.getElementById("breadcrumbDomain");
    const breadcrumbCategory = document.getElementById("breadcrumbCategory");
    const breadcrumbSkill = document.getElementById("breadcrumbSkill");
    
    if (!domainSelect || !categorySelect || !skillSelect) return;
    if (!breadcrumbDomain || !breadcrumbCategory || !breadcrumbSkill) return;
    
    const domainId = domainSelect.value;
    const categoryId = categorySelect.value;
    const skillId = skillSelect.value;
    
    // Update domain breadcrumb
    if (domainId === 'all_domains') {
        breadcrumbDomain.textContent = '🎲 All Domains';
        breadcrumbDomain.style.color = 'var(--accent-orange)';
    } else if (DOMAINS[domainId]) {
        const domain = DOMAINS[domainId];
        breadcrumbDomain.textContent = `${domain.icon} ${domain.name}`;
        breadcrumbDomain.style.color = domain.color;
    }
    
    // Update category breadcrumb
    if (categoryId === 'all_mixed' || categoryId.startsWith('domain_mixed_')) {
        breadcrumbCategory.textContent = '🎲 Mixed';
    } else {
        const catInfo = getCategoryInfo(categoryId);
        if (catInfo) {
            breadcrumbCategory.textContent = catInfo.name;
        } else {
            breadcrumbCategory.textContent = categoryId;
        }
    }
    
    // Update skill breadcrumb
    const selectedOption = skillSelect.options[skillSelect.selectedIndex];
    if (selectedOption) {
        // Remove emoji prefix for cleaner display
        let skillName = selectedOption.text.replace(/^[\u2460-\u2466\u24C2]\s*/, '');
        breadcrumbSkill.textContent = skillName;
    }
}

export function updateSkillOptions() {
    const categorySelect = document.getElementById("categorySelect");
    const skillSelect = document.getElementById("skillSelect");
    
    if (!categorySelect || !skillSelect) {
        console.error("Dropdowns not found");
        return;
    }
    
    let category = categorySelect.value;

    // If we're in all_mixed with custom_mixed selected and have settings, preserve the selection
    const currentSkill = skillSelect.value;
    const preserveCustomMixed = (category === 'all_mixed' && currentSkill === 'custom_mixed' && state.mixedModeSettings);
    
    // Helper to get clean label for tooltip (remove emoji prefix)
    const getTooltipText = (label) => {
        return label;
    };

    // Handle domain_mixed_* categories (mixed mode for a specific domain)
    if (category.startsWith('domain_mixed_')) {
        const domainId = category.replace('domain_mixed_', '');
        const domain = DOMAINS[domainId];
        if (domain) {
            // Create mixed options for all categories in this domain
            let optionsHTML = `<option value="mixed" title="Mixed - All Skills in ${domain.name}">🎲 Mixed (All Skills in Domain)</option>`;
            domain.categories.forEach(cat => {
                const catSkills = SKILLS[cat.id];
                if (catSkills && catSkills.length > 0) {
                    optionsHTML += `<optgroup label="${cat.icon} ${cat.name}">`;
                    const sorted = sortByGrade(catSkills, cat.id);
                    sorted.forEach(skill => {
                        const tooltip = `${cat.name} › ${getTooltipText(skill.l)}`;
                        const grade = getSkillGrade(skill.v, cat.id);
                        const prefix = grade !== null ? gradeCircleText(grade) + ' ' : '';
                        const mixedCount = isMixedMetaSkill(skill.v) ? getMixedSkillCount(skill.v) : 0;
                        const countSuffix = mixedCount > 0 ? ` (${mixedCount} skills)` : '';
                        optionsHTML += `<option value="${cat.id}:${skill.v}" title="${tooltip}">${prefix}${skill.l}${countSuffix}</option>`;
                    });
                    optionsHTML += '</optgroup>';
                }
            });
            skillSelect.innerHTML = optionsHTML;
            updateNumberSectionVisibility();
            updateTimerForRange();
            return;
        }
    }
    
    // Get skills for this category
    const categorySkills = SKILLS[category];
    
    // Build options HTML - escape HTML special characters in labels
    const escapeHTML = (str) => {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    let optionsHTML = '';
    if (categorySkills && Array.isArray(categorySkills) && categorySkills.length > 0) {
        const sorted = sortByGrade(categorySkills, category);
        sorted.forEach(skill => {
            const tooltip = getTooltipText(skill.l);
            const grade = getSkillGrade(skill.v, category);
            const prefix = grade !== null ? gradeCircleText(grade) + ' ' : '';
            const mixedCount = isMixedMetaSkill(skill.v) ? getMixedSkillCount(skill.v) : 0;
            const countSuffix = mixedCount > 0 ? ` (${mixedCount} skills)` : '';
            optionsHTML += `<option value="${escapeHTML(skill.v)}" title="${escapeHTML(tooltip)}">${prefix}${escapeHTML(skill.l)}${countSuffix}</option>`;
        });
    } else {
        // Fallback if category not found
        console.warn("No skills found for category:", category, "Available:", Object.keys(SKILLS));
        optionsHTML = '<option value="mixed" title="Mixed Mode">🎲 Mixed</option>';
    }
    
    // Set the options using innerHTML
    skillSelect.innerHTML = optionsHTML;

    // Restore custom_mixed selection if we had it
    if (preserveCustomMixed) {
        skillSelect.value = 'custom_mixed';
    }

    updateNumberSectionVisibility();
    updateTimerForRange();
}

// ===== INLINE DROPDOWN FUNCTIONS (Teacher Mode) =====
export function initInlineDropdowns() {
    const domainSelect = document.getElementById("domainSelectInline");
    if (!domainSelect) return;

    // Save current selections before repopulating
    const prevDomain = domainSelect.value;

    // Always populate
    let domainHTML = '<option value="" disabled selected>Select Domain...</option>';
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        domainHTML += `<option value="${domainId}">${domain.icon} ${domain.name}</option>`;
    }
    domainSelect.innerHTML = domainHTML;

    // Restore previous domain selection if it still exists
    if (prevDomain && domainSelect.querySelector(`option[value="${prevDomain}"]`)) {
        domainSelect.value = prevDomain;
    }

    // Initialize categories and skills (will also restore category selection)
    updateCategoryOptionsInline();
}

export function updateCategoryOptionsInline() {
    const domainSelect = document.getElementById("domainSelectInline");
    const categorySelect = document.getElementById("categorySelectInline");

    if (!domainSelect || !categorySelect) return;

    // Save current category selection before repopulating
    const prevCategory = categorySelect.value;

    const domainId = domainSelect.value;
    let optionsHTML = '';

    if (domainId && DOMAINS[domainId]) {
        const domain = DOMAINS[domainId];
        optionsHTML = `<option value="__all__">${domain.icon} All Categories</option>`;
        domain.categories.forEach(cat => {
            // Skip mixed categories
            if (cat.id.endsWith('_mixed') || cat.id === 'mixed') return;
            optionsHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
        });
    } else {
        optionsHTML = '<option value="" disabled selected>Select Category...</option>';
    }

    categorySelect.innerHTML = optionsHTML;

    // Restore previous category selection if it still exists
    if (prevCategory && categorySelect.querySelector(`option[value="${prevCategory}"]`)) {
        categorySelect.value = prevCategory;
    }

    updateSkillOptionsInline();
}

export function updateSkillOptionsInline() {
    // Legacy function - redirect to new list function
    updateSkillListInline();
}

export function updateSkillListInline() {
    const categorySelect = document.getElementById("categorySelectInline");
    const skillList = document.getElementById("skillListInline");
    
    if (!categorySelect || !skillList) return;
    
    const domainSelect = document.getElementById("domainSelectInline");
    const domainId = domainSelect?.value || '';
    const domain = DOMAINS[domainId];
    const domainColor = domain?.color || '#8b5cf6';

    const categoryId = categorySelect.value;

    // Show placeholder when no category selected
    if (!categoryId) {
        skillList.innerHTML = '<div style="padding:12px;color:var(--text-dim);text-align:center;font-size:0.85rem;line-height:1.5;">Select a <b>Domain</b> and <b>Category</b> above, then tap skills to add them</div>';
        return;
    }

    // Build list of categories to show
    const categoriesToShow = [];
    if (categoryId === '__all__' && domain) {
        domain.categories.forEach(cat => {
            if (cat.id.endsWith('_mixed') || cat.id === 'mixed') return;
            categoriesToShow.push(cat);
        });
    } else {
        const category = domain?.categories.find(c => c.id === categoryId);
        if (category) categoriesToShow.push(category);
    }

    let html = '';
    for (const cat of categoriesToShow) {
        const catId = cat.id;
        const catIcon = cat.icon || '📚';
        const catName = cat.name || catId;
        const categorySkills = SKILLS[catId];

        if (!categorySkills || !Array.isArray(categorySkills)) continue;

        // Add category header when showing all
        if (categoryId === '__all__') {
            html += `<div style="width:100%;font-weight:700;font-size:0.8rem;color:var(--text-dim);padding:6px 0 2px;border-bottom:1px solid var(--bg-card-light);margin-top:${html ? '8px' : '0'};">${catIcon} ${catName}</div>`;
        }

        const sorted = sortByGrade(categorySkills, catId);
        sorted.forEach(skill => {
            // Skip mixed skills
            if (skill.v.startsWith('mixed_') || skill.v === 'mixed' || skill.v.endsWith('_all')) return;

            const isInQueue = UnifiedSkills.has(skill.v, catId);
            const bgColor = isInQueue ? 'var(--accent-green)' : 'var(--bg-card-light)';
            const textColor = isInQueue ? 'white' : 'var(--text-bright)';
            const borderColor = isInQueue ? 'var(--accent-green)' : 'rgba(0,0,0,0.2)';

            html += `<button onclick="addSkillFromList('${domainId}', '${catId}', '${skill.v}', '${skill.l.replace(/'/g, "\\'")}', '${catIcon}', '${catName.replace(/'/g, "\\'")}', '${domainColor}')"
                style="padding:6px 12px;font-size:0.8rem;border-radius:6px;border:2px solid ${borderColor};background:${bgColor};color:${textColor};cursor:pointer;transition:all 0.2s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;"
                onmouseover="if(!this.classList.contains('added')){this.style.background='var(--accent-purple)';this.style.color='white';this.style.borderColor='var(--accent-purple)';}"
                onmouseout="if(!this.classList.contains('added')){this.style.background='${isInQueue ? 'var(--accent-green)' : 'var(--bg-card-light)'}';this.style.color='${isInQueue ? 'white' : 'var(--text-bright)'}';this.style.borderColor='${isInQueue ? 'var(--accent-green)' : 'rgba(0,0,0,0.2)'}';}"
                class="${isInQueue ? 'added' : ''}"
                title="${isInQueue ? 'Already added - click to remove' : 'Click to add'}">
                ${isInQueue ? '✓ ' : ''}${(() => { const g = getSkillGrade(skill.v, catId); return g !== null ? gradeCircleHTML(g) + ' ' : ''; })()}${skill.l}
            </button>`;
        });
    }
    
    if (html === '') {
        html = '<div style="padding:10px;color:var(--text-dim);text-align:center;">No skills available</div>';
    }
    
    skillList.innerHTML = html;
}

export function addSkillFromList(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    // Toggle behavior - if already in queue, remove it
    if (UnifiedSkills.has(skillId, categoryId)) {
        UnifiedSkills.removeBySkillId(skillId);
        showNotification('Removed from queue', 'info');
    } else {
        const added = UnifiedSkills.add({
            domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor
        });
        if (added) {
            showNotification('✓ Added to queue!', 'success');
        }
    }
    // updateSkillListInline() is already called by syncAll() → updateAllUI()
    // No duplicate call needed
}

export function addSkillFromDropdown() {
    // Legacy function - no longer used with list interface
    // Keeping for backwards compatibility
    const domainSelect = document.getElementById("domainSelectInline");
    const categorySelect = document.getElementById("categorySelectInline");
    const skillSelect = document.getElementById("skillSelectInline");

    if (!domainSelect || !categorySelect || !skillSelect) return;

    const domainId = domainSelect.value;
    const categoryId = categorySelect.value;
    const skillId = skillSelect.value;

    if (!skillId) {
        showNotification('Please select a skill', 'error');
        return;
    }
    
    // Get skill info
    const domain = DOMAINS[domainId];
    const categoryInfo = domain?.categories?.find(c => c.id === categoryId);
    const skillInfo = SKILLS[categoryId]?.find(s => s.v === skillId);
    
    if (!skillInfo) {
        showNotification('Skill not found', 'error');
        return;
    }
    
    // Check if already in queue
    if (UnifiedSkills.has(skillId, categoryId)) {
        showNotification('Skill already selected!', 'info');
        return;
    }
    
    // Add to unified skills
    UnifiedSkills.add({
        domainId: domainId,
        categoryId: categoryId,
        skillId: skillId,
        skillLabel: skillInfo.l,
        categoryIcon: categoryInfo?.icon || '📚',
        categoryName: categoryInfo?.name || categoryId,
        domainColor: domain?.color || '#4CAF50'
    });
    
    const cleanLabel = skillInfo.l.replace(/^[🟢🟡🟠🔴🎲]+\s*/, '');
    showNotification(`✓ Added: ${cleanLabel}`, 'success');
    
    updateQuickSkillCards();
    updateCompactNumberVisibility();
}
// ===== END INLINE DROPDOWN FUNCTIONS =====

// ===== Skill Search Functions =====

// Build searchable skill index
