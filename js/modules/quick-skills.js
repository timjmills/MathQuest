import { state } from './state.js';
import { DOMAINS, SKILLS, getDomainByCategory, getSkillGrade, gradeCircleHTML, GRADE_COLORS } from './data.js';
import { setCookie, getCookie } from './storage.js';

export function addQuickSkill(categoryId, skillId, skillLabel, categoryIcon, categoryName) {
    // Get domain ID from category
    const domainId = getDomainByCategory(categoryId) || 'number_operations';
    const domain = DOMAINS[domainId];
    const domainColor = domain ? domain.color : '#4CAF50';
    
    // Check if skill is already in queue - if so, remove it (toggle behavior)
    if (UnifiedSkills.has(skillId, categoryId)) {
        // Remove the skill using UnifiedSkills
        UnifiedSkills.removeBySkillId(skillId);
        showNotification(`✗ Removed ${skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '')}`, 'info');
        updateQuickSkillCards();
        updateCompactNumberVisibility();
        return;
    }
    
    // Add to skill queue using UnifiedSkills
    const added = UnifiedSkills.add({
        domainId: domainId,
        categoryId: categoryId,
        skillId: skillId,
        skillLabel: skillLabel,
        categoryIcon: categoryIcon,
        categoryName: categoryName,
        domainColor: domainColor
    });
    
    if (added) {
        showNotification(`✓ Added ${skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '')}!`, 'success');
        // Update quick skill card visual
        updateQuickSkillCards();
        // Update number selection visibility for mult/div
        updateCompactNumberVisibility();
    }
}

export function updateQuickSkillCards() {
    // Re-render quick skills grid to update selection states
    if (typeof renderQuickSkillsGrid === 'function') {
        renderQuickSkillsGrid();
    }

    // Also update favorite cards
    if (typeof updateFavoriteCards === 'function') {
        updateFavoriteCards();
    }

    // Show/hide the Clear button based on whether skills are selected
    updateClearButtonVisibility();
}

export function updateClearButtonVisibility() {
    const clearBtn = document.getElementById('clearAllSkillsBtn');
    if (clearBtn) {
        clearBtn.style.display = UnifiedSkills.count > 0 ? 'inline-flex' : 'none';
    }
}

export function clearAllSelectedSkills() {
    if (UnifiedSkills.count === 0) return;
    UnifiedSkills.clear();
    renderQuickSkillsGrid();
    updateClearButtonVisibility();
    updateCompactNumberVisibility();
    showNotification('All skills cleared', 'info');
}

// ===== CUSTOMIZABLE QUICK START SKILLS =====
// Pastel color classes for quick skills
const PASTEL_COLORS = ['pastel-coral', 'pastel-peach', 'pastel-lemon', 'pastel-mint', 'pastel-sky', 'pastel-lavender', 'pastel-rose', 'pastel-aqua'];

const DEFAULT_QUICK_SKILLS = [
    { categoryId: 'addition', skillId: 'add_facts', skillLabel: '➕ Addition Facts', categoryIcon: '➕', categoryName: 'Addition', shortName: 'Addition Facts', color: 'pastel-coral', source: 'default' },
    { categoryId: 'subtraction', skillId: 'sub_facts', skillLabel: '➖ Subtraction Facts', categoryIcon: '➖', categoryName: 'Subtraction', shortName: 'Subtraction Facts', color: 'pastel-peach', source: 'default' },
    { categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: '✖️ Multiplication Facts', categoryIcon: '✖️', categoryName: 'Multiplication', shortName: 'Mult Facts', color: 'pastel-lemon', source: 'default' },
    { categoryId: 'division', skillId: 'div_facts', skillLabel: '➗ Division Facts', categoryIcon: '➗', categoryName: 'Division', shortName: 'Division Facts', color: 'pastel-mint', source: 'default' },
];

const QUICK_SKILLS_VERSION = 2;

window.customQuickSkills = [];
let quickSkillsEditMode = false;
let quickStartLocked = false;

// Load lock state from cookie on module init
try {
    quickStartLocked = getCookie('mathquest_qs_locked') === '1';
} catch(e) {}

export function loadQuickSkills() {
    try {
        const savedVersion = parseInt(localStorage.getItem('mathquest_quick_skills_version') || '0', 10);
        const saved = localStorage.getItem('mathquest_quick_skills');
        if (saved && savedVersion >= QUICK_SKILLS_VERSION) {
            window.customQuickSkills = JSON.parse(saved);
            // Ensure colors and source are assigned to loaded skills
            window.customQuickSkills.forEach((skill, i) => {
                if (!skill.color) {
                    skill.color = PASTEL_COLORS[i % PASTEL_COLORS.length];
                }
                if (!skill.source) {
                    skill.source = 'teacher'; // Legacy skills default to teacher
                }
            });
        } else {
            // Version mismatch or no saved data — reset to defaults
            window.customQuickSkills = [...DEFAULT_QUICK_SKILLS];
            saveQuickSkills();
        }
    } catch (e) {
        console.log('Could not load quick skills:', e);
        window.customQuickSkills = [...DEFAULT_QUICK_SKILLS];
    }
    renderQuickSkillsGrid();
}

export function saveQuickSkills() {
    try {
        localStorage.setItem('mathquest_quick_skills', JSON.stringify(window.customQuickSkills));
        localStorage.setItem('mathquest_quick_skills_version', String(QUICK_SKILLS_VERSION));
    } catch (e) {
        console.log('Could not save quick skills:', e);
    }
}

// Update the student skills display (simple inline list with X buttons)
export function updateStudentSkillsDisplay() {
    const display = document.getElementById('studentSkillsDisplay');
    const list = document.getElementById('studentSkillsList');
    
    if (!display || !list) return;
    
    const isStudentMode = document.body.classList.contains('student-mode');
    
    if (UnifiedSkills.count === 0 || !isStudentMode) {
        display.style.display = 'none';
        return;
    }
    
    display.style.display = 'block';
    
    let html = '';
    UnifiedSkills.skills.forEach((skill, index) => {
        const shortName = skill.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 20);
        const icon = skill.categoryIcon || '📚';
        const gradeHTML = gradeCircleHTML(getSkillGrade(skill.skillId, skill.categoryId));

        html += `
            <div style="display:inline-flex;align-items:center;gap:4px;padding:5px 8px;background:var(--accent-purple);color:white;border-radius:6px;font-size:0.8rem;font-weight:600;">
                ${gradeHTML}
                <span>${icon}</span>
                <span>${shortName}</span>
                <button onclick="event.stopPropagation(); UnifiedSkills.removeByIndex(${index})"
                    style="background:rgba(255,255,255,0.3);border:none;color:white;width:18px;height:18px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;margin-left:2px;"
                    title="Remove">×</button>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

export function renderQuickSkillsGrid() {
    const grid = document.getElementById('quickSkillsGrid');
    if (!grid) return;

    const skills = window.customQuickSkills;
    const isTeacherMode = document.body.classList.contains('teacher-mode');
    const isStudentMode = document.body.classList.contains('student-mode');
    const isLocked = quickStartLocked && isStudentMode;

    if (skills.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:18px 12px;color:var(--text-dim);font-size:0.85rem;">No quick skills yet. Use the search or reset to add some!</div>`;
        updateClearButtonVisibility();
        return;
    }

    grid.innerHTML = skills.map((skill, index) => {
        const isSelected = UnifiedSkills.has(skill.skillId, skill.categoryId);
        const displayName = skill.shortName || skill.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '');
        const grade = getSkillGrade(skill.skillId, skill.categoryId);
        const gradeColor = grade !== null && GRADE_COLORS[grade] ? GRADE_COLORS[grade] : null;
        const gradeBadge = gradeColor ? `<span style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:${gradeColor.bg};color:${gradeColor.text};font-size:0.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);z-index:5;">${grade}</span>` : '';
        const source = skill.source || 'teacher';
        // Default skills use pastel colors; added skills (teacher/link/student) get blue tint
        const colorClass = source === 'default'
            ? (skill.color || PASTEL_COLORS[index % PASTEL_COLORS.length])
            : 'qs-added';

        // Determine if X button should show based on source and mode:
        // default: never removable
        // student: removable by student (X shown) and teacher in edit mode
        // link/teacher: not removable by student, removable by teacher in edit mode
        let showRemoveBtn = false;
        if (quickSkillsEditMode) {
            showRemoveBtn = true; // Teacher edit mode: remove ALL skills including defaults
        } else if (isStudentMode && source === 'student' && !isLocked) {
            showRemoveBtn = true; // Student mode: remove own additions (only if not locked)
        }

        if (quickSkillsEditMode && showRemoveBtn) {
            // Teacher Edit mode - show remove button on non-default skills
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}" style="position:relative;">
                    ${gradeBadge}
                    <button onclick="event.stopPropagation(); removeQuickSkill(${index})"
                        style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#ff4757;color:white;border:2px solid white;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.2);">×</button>
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${displayName}</span>
                </div>
            `;
        } else if (isStudentMode && source === 'student' && !quickSkillsEditMode && !isLocked) {
            // Student mode with student-added skill - show small X
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}" style="position:relative;"
                     onclick="addQuickSkill('${skill.categoryId}', '${skill.skillId}', '${skill.skillLabel.replace(/'/g, "\\'")}', '${skill.categoryIcon}', '${skill.categoryName.replace(/'/g, "\\'")}')">
                    ${gradeBadge}
                    <button onclick="event.stopPropagation(); removeStudentQuickSkill(${index})"
                        style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#ff6b6b;color:white;border:2px solid white;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.2);line-height:1;">×</button>
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${displayName}</span>
                    <span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:0.6rem;color:#ffd700;">&#11088;</span>
                </div>
            `;
        } else {
            // Normal mode - just clickable
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}"
                     onclick="addQuickSkill('${skill.categoryId}', '${skill.skillId}', '${skill.skillLabel.replace(/'/g, "\\'")}', '${skill.categoryIcon}', '${skill.categoryName.replace(/'/g, "\\'")}')">
                    ${gradeBadge}
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${displayName}</span>
                    ${source === 'student' ? '<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:0.6rem;color:#ffd700;">&#11088;</span>' : ''}
                </div>
            `;
        }
    }).join('');

    // Hide student add button if locked
    const addBtn = document.getElementById('addQuickSkillBtn');
    if (addBtn && isStudentMode) {
        addBtn.style.display = isLocked ? 'none' : 'flex';
    }

    // Show/hide clear button
    updateClearButtonVisibility();
}

export function toggleQuickSkillsEditMode() {
    quickSkillsEditMode = !quickSkillsEditMode;
    
    const editPanel = document.getElementById('quickSkillsEditPanel');
    const editBtnText = document.getElementById('editQuickSkillsBtnText');
    const hint = document.getElementById('quickSkillsHint');
    
    if (editPanel) editPanel.style.display = quickSkillsEditMode ? 'block' : 'none';
    if (editBtnText) editBtnText.textContent = quickSkillsEditMode ? 'Done' : 'Edit';
    if (hint) hint.style.display = quickSkillsEditMode ? 'none' : 'block';
    
    renderQuickSkillsGrid();
    
    // Clear search when exiting edit mode
    if (!quickSkillsEditMode) {
        const searchInput = document.getElementById('quickSkillSearchInput');
        const searchResults = document.getElementById('quickSkillSearchResults');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.style.display = 'none';
    }
}

export function toggleQuickStartLock() {
    quickStartLocked = !quickStartLocked;
    setCookie('mathquest_qs_locked', quickStartLocked ? '1' : '0', 365);

    // Update lock button visual
    const lockBtn = document.getElementById('qsLockBtn');
    if (lockBtn) {
        lockBtn.innerHTML = quickStartLocked ? '🔒' : '🔓';
        lockBtn.title = quickStartLocked ? 'Quick Start is locked for students' : 'Quick Start is unlocked for students';
        lockBtn.style.background = quickStartLocked ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #06D6A0, #4CC9F0)';
    }

    // Update student UI - hide/show add button
    const addBtn = document.getElementById('addQuickSkillBtn');
    const isStudentMode = document.body.classList.contains('student-mode');
    if (addBtn && isStudentMode) {
        addBtn.style.display = quickStartLocked ? 'none' : 'flex';
    }

    renderQuickSkillsGrid();
    showNotification(quickStartLocked ? 'Quick Start locked for students' : 'Quick Start unlocked for students', 'info');
}

export function isQuickStartLocked() {
    return quickStartLocked;
}

export function setQuickStartLocked(locked) {
    quickStartLocked = locked;
    setCookie('mathquest_qs_locked', locked ? '1' : '0', 365);
    const lockBtn = document.getElementById('qsLockBtn');
    if (lockBtn) {
        lockBtn.innerHTML = locked ? '🔒' : '🔓';
        lockBtn.title = locked ? 'Quick Start is locked for students' : 'Quick Start is unlocked for students';
        lockBtn.style.background = locked ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #06D6A0, #4CC9F0)';
    }
    renderQuickSkillsGrid();
}

export function removeQuickSkill(index) {
    if (index >= 0 && index < window.customQuickSkills.length) {
        window.customQuickSkills.splice(index, 1);
        saveQuickSkills();
        renderQuickSkillsGrid();
        showNotification('Removed from Quick Start', 'info');
    }
}

// Students can only remove their own starred skills
export function removeStudentQuickSkill(index) {
    if (index >= 0 && index < window.customQuickSkills.length) {
        const skill = window.customQuickSkills[index];
        if (skill.source === 'student') {
            window.customQuickSkills.splice(index, 1);
            saveQuickSkills();
            renderQuickSkillsGrid();
            showNotification('Removed starred skill', 'info');
        }
    }
}

export function addToQuickSkills(categoryId, skillId, skillLabel, categoryIcon, categoryName, source = 'teacher') {
    // Check if already exists
    const exists = window.customQuickSkills.some(s => s.skillId === skillId && s.categoryId === categoryId);
    if (exists) {
        // If student trying to add and it exists, remove it (toggle behavior)
        if (source === 'student') {
            const index = window.customQuickSkills.findIndex(s => s.skillId === skillId && s.categoryId === categoryId);
            if (index > -1 && window.customQuickSkills[index].source === 'student') {
                window.customQuickSkills.splice(index, 1);
                saveQuickSkills();
                renderQuickSkillsGrid();
                showNotification('Removed from Quick Start', 'info');
                return;
            }
        }
        showNotification('Already in Quick Start!', 'info');
        return;
    }
    
    // Limit to 16 skills (increased from 12 to accommodate starred skills)
    if (window.customQuickSkills.length >= 16) {
        showNotification('Quick Start is full (max 16). Remove some first.', 'error');
        return;
    }
    
    const shortName = skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 12);
    
    // Assign a pastel color based on position
    const colorIndex = window.customQuickSkills.length % PASTEL_COLORS.length;
    
    window.customQuickSkills.push({
        categoryId,
        skillId,
        skillLabel,
        categoryIcon,
        categoryName,
        shortName,
        color: PASTEL_COLORS[colorIndex],
        source: source
    });
    
    saveQuickSkills();
    renderQuickSkillsGrid();
    showNotification(`⚡ Added to Quick Start!`, 'success');
    
    // Clear search
    const searchInput = document.getElementById('quickSkillSearchInput');
    const searchResults = document.getElementById('quickSkillSearchResults');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.style.display = 'none';
}

export function resetQuickSkillsToDefault() {
    if (confirm('Reset Quick Start to default skills?')) {
        window.customQuickSkills = [...DEFAULT_QUICK_SKILLS];
        saveQuickSkills();
        renderQuickSkillsGrid();
        showNotification('Quick Start reset to defaults', 'success');
    }
}

export function addAllFacts() {
    const factSkills = [
        { categoryId: 'addition', skillId: 'add_facts', skillLabel: '➕ Addition Facts', categoryIcon: '➕', categoryName: 'Addition', shortName: 'Addition Facts' },
        { categoryId: 'subtraction', skillId: 'sub_facts', skillLabel: '➖ Subtraction Facts', categoryIcon: '➖', categoryName: 'Subtraction', shortName: 'Subtraction Facts' },
        { categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: '✖️ Multiplication Facts', categoryIcon: '✖️', categoryName: 'Multiplication', shortName: 'Mult Facts' },
        { categoryId: 'division', skillId: 'div_facts', skillLabel: '➗ Division Facts', categoryIcon: '➗', categoryName: 'Division', shortName: 'Division Facts' },
    ];

    let added = 0;
    for (const fact of factSkills) {
        const exists = window.customQuickSkills.some(s => s.skillId === fact.skillId && s.categoryId === fact.categoryId);
        if (!exists && window.customQuickSkills.length < 16) {
            window.customQuickSkills.push({
                ...fact,
                color: PASTEL_COLORS[window.customQuickSkills.length % PASTEL_COLORS.length],
                source: 'default'
            });
            added++;
        }
    }

    if (added > 0) {
        saveQuickSkills();
        renderQuickSkillsGrid();
        showNotification(`Added ${added} fact skill${added > 1 ? 's' : ''} to Quick Start!`, 'success');
    } else {
        showNotification('All 4 facts already in Quick Start!', 'info');
    }
}

export function handleQuickSkillSearch(query) {
    const resultsDiv = document.getElementById('quickSkillSearchResults');
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);

    // Find matches
    const matches = index.filter(item => {
        return terms.every(term => item.searchText.includes(term));
    }).slice(0, 10);

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:10px;color:var(--text-dim);text-align:center;">No skills found</div>';
        resultsDiv.style.display = 'block';
        return;
    }

    // Determine source: if student is adding via "+" button (not teacher edit mode), use 'student'
    const isStudentMode = document.body.classList.contains('student-mode');
    const addSource = (isStudentMode && !quickSkillsEditMode) ? 'student' : 'teacher';

    resultsDiv.innerHTML = matches.map(match => `
        <div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;"
            onmouseover="this.style.background='var(--bg-card-light)'"
            onmouseout="this.style.background='transparent'"
            onclick="addToQuickSkills('${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}', '${addSource}')">
            <span>${match.categoryIcon}</span>
            <span style="flex:1;font-size:0.9rem;">${match.skillLabel.replace(/^[🟢🟡🟠🔴]+\s*/, '')}</span>
            <span style="color:var(--accent-green);font-weight:600;">+ Add</span>
        </div>
    `).join('');

    resultsDiv.style.display = 'block';
}

export function showQuickSkillSearchResults() {
    const input = document.getElementById('quickSkillSearchInput');
    if (input && input.value.length >= 2) {
        handleQuickSkillSearch(input.value);
    }
}
// Student "+" button: opens search panel for adding skills (source: 'student')
export function toggleStudentAddSkill() {
    if (quickStartLocked) return; // Locked by teacher
    const editPanel = document.getElementById('quickSkillsEditPanel');
    if (!editPanel) return;

    const isOpen = editPanel.style.display === 'block';
    editPanel.style.display = isOpen ? 'none' : 'block';

    // Hide the "Reset to Default" button for students
    const isStudentMode = document.body.classList.contains('student-mode');
    if (isStudentMode) {
        const resetBtn = editPanel.querySelector('[onclick*="resetQuickSkillsToDefault"]');
        if (resetBtn) resetBtn.style.display = 'none';
    }

    // Clear search when closing
    if (isOpen) {
        const searchInput = document.getElementById('quickSkillSearchInput');
        const searchResults = document.getElementById('quickSkillSearchResults');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.style.display = 'none';
    }
}

// Load skills from a code string into Quick Start grid (source: 'link')
export function setQuickSkillsFromCode(codeString) {
    if (!codeString) return;

    const parts = codeString.toUpperCase().trim().replace(/\s+/g, '').split('-');
    const newSkills = [];

    for (const part of parts) {
        if (part.length < 2) continue;
        const code = part.substring(0, 2);
        const skillInfo = window.CODE_TO_SKILL ? window.CODE_TO_SKILL[code] : null;
        if (!skillInfo) continue;

        // Look up full info from DOMAINS
        const domainId = getDomainByCategory(skillInfo.categoryId);
        const domain = DOMAINS[domainId];
        const categoryInfo = domain?.categories?.find(c => c.id === skillInfo.categoryId);
        const shortName = skillInfo.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 12);

        newSkills.push({
            categoryId: skillInfo.categoryId,
            skillId: skillInfo.skillId,
            skillLabel: skillInfo.skillLabel,
            categoryIcon: categoryInfo?.icon || '📚',
            categoryName: categoryInfo?.name || skillInfo.categoryId,
            shortName: shortName,
            color: PASTEL_COLORS[newSkills.length % PASTEL_COLORS.length],
            source: 'link'
        });
    }

    if (newSkills.length === 0) return;

    // Remove any existing 'link' source skills, keep defaults and student-added
    window.customQuickSkills = window.customQuickSkills.filter(s => s.source !== 'link');

    // Add the new link skills
    for (const skill of newSkills) {
        // Avoid duplicates
        const exists = window.customQuickSkills.some(s => s.skillId === skill.skillId && s.categoryId === skill.categoryId);
        if (!exists && window.customQuickSkills.length < 16) {
            window.customQuickSkills.push(skill);
        }
    }

    saveQuickSkills();
    renderQuickSkillsGrid();
    showNotification('Skills loaded from teacher link!', 'success');
}

// ===== END CUSTOMIZABLE QUICK START SKILLS =====

// ===== END QUICK SKILL FUNCTIONS =====

// ===== FAVORITE SKILLS SYSTEM =====
let favoriteSkills = [];

