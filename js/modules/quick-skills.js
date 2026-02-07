import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';
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
}

// ===== CUSTOMIZABLE QUICK START SKILLS =====
// Pastel color classes for quick skills
const PASTEL_COLORS = ['pastel-coral', 'pastel-peach', 'pastel-lemon', 'pastel-mint', 'pastel-sky', 'pastel-lavender', 'pastel-rose', 'pastel-aqua'];

const DEFAULT_QUICK_SKILLS = [
    { categoryId: 'addition', skillId: 'add_facts', skillLabel: '➕ Addition Facts', categoryIcon: '➕', categoryName: 'Addition', shortName: 'Addition Facts', color: 'pastel-coral', source: 'teacher' },
    { categoryId: 'subtraction', skillId: 'sub_facts', skillLabel: '➖ Subtraction Facts', categoryIcon: '➖', categoryName: 'Subtraction', shortName: 'Subtraction Facts', color: 'pastel-peach', source: 'teacher' },
    { categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: '✖️ Multiplication Facts', categoryIcon: '✖️', categoryName: 'Multiplication', shortName: 'Mult Facts', color: 'pastel-lemon', source: 'teacher' },
    { categoryId: 'division', skillId: 'div_facts', skillLabel: '➗ Division Facts', categoryIcon: '➗', categoryName: 'Division', shortName: 'Division Facts', color: 'pastel-mint', source: 'teacher' },
    { categoryId: 'number_theory', skillId: 'factor_links_easy', skillLabel: '🔬 Factor Links', categoryIcon: '🔬', categoryName: 'Number Theory', shortName: 'Factors', color: 'pastel-sky', source: 'teacher' },
    { categoryId: 'measurement', skillId: 'time_5min', skillLabel: '⏰ Telling Time', categoryIcon: '⏰', categoryName: 'Measurement', shortName: 'Time', color: 'pastel-lavender', source: 'teacher' },
    { categoryId: 'fractions', skillId: 'identify', skillLabel: '½ Fractions', categoryIcon: '½', categoryName: 'Fractions', shortName: 'Fractions', color: 'pastel-rose', source: 'teacher' },
    { categoryId: 'area_perimeter', skillId: 'area_perimeter', skillLabel: '📐 Area & Perimeter', categoryIcon: '📐', categoryName: 'Area & Perimeter', shortName: 'Geometry', color: 'pastel-aqua', source: 'teacher' },
];

window.customQuickSkills = [];
let quickSkillsEditMode = false;

export function loadQuickSkills() {
    try {
        const saved = localStorage.getItem('mathquest_quick_skills');
        if (saved) {
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
            window.customQuickSkills = [...DEFAULT_QUICK_SKILLS];
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
        
        html += `
            <div style="display:inline-flex;align-items:center;gap:4px;padding:5px 8px;background:var(--accent-purple);color:white;border-radius:6px;font-size:0.8rem;font-weight:600;">
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
    
    const skills = window.customQuickSkills.length > 0 ? window.customQuickSkills : DEFAULT_QUICK_SKILLS;
    const isTeacherMode = document.body.classList.contains('teacher-mode');
    const isStudentMode = document.body.classList.contains('student-mode');
    
    grid.innerHTML = skills.map((skill, index) => {
        const isSelected = UnifiedSkills.has(skill.skillId, skill.categoryId);
        const shortName = skill.shortName || skill.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 12);
        const colorClass = skill.color || PASTEL_COLORS[index % PASTEL_COLORS.length];
        const isStudentAdded = skill.source === 'student';
        
        if (quickSkillsEditMode) {
            // Teacher Edit mode - show remove button on all
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}" style="position:relative;">
                    <button onclick="event.stopPropagation(); removeQuickSkill(${index})" 
                        style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#ff4757;color:white;border:2px solid white;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.2);">×</button>
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${shortName}</span>
                </div>
            `;
        } else if (isStudentMode && isStudentAdded) {
            // Student mode with student-added skill - show small X
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}" style="position:relative;"
                     onclick="addQuickSkill('${skill.categoryId}', '${skill.skillId}', '${skill.skillLabel.replace(/'/g, "\\'")}', '${skill.categoryIcon}', '${skill.categoryName.replace(/'/g, "\\'")}')">
                    <button onclick="event.stopPropagation(); removeStudentQuickSkill(${index})" 
                        style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#ff6b6b;color:white;border:2px solid white;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.2);line-height:1;">×</button>
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${shortName}</span>
                    <span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:0.6rem;color:#ffd700;">⭐</span>
                </div>
            `;
        } else {
            // Normal mode - just clickable (no delete for teacher-added skills in student mode)
            return `
                <div class="quick-skill-card ${colorClass} ${isSelected ? 'selected' : ''}" 
                     onclick="addQuickSkill('${skill.categoryId}', '${skill.skillId}', '${skill.skillLabel.replace(/'/g, "\\'")}', '${skill.categoryIcon}', '${skill.categoryName.replace(/'/g, "\\'")}')">
                    <span class="skill-icon">${skill.categoryIcon}</span>
                    <span class="skill-name">${shortName}</span>
                    ${isStudentAdded ? '<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:0.6rem;color:#ffd700;">⭐</span>' : ''}
                </div>
            `;
        }
    }).join('');
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
    
    resultsDiv.innerHTML = matches.map(match => `
        <div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;"
            onmouseover="this.style.background='var(--bg-card-light)'" 
            onmouseout="this.style.background='transparent'"
            onclick="addToQuickSkills('${match.categoryId}', '${match.skillId}', '${match.skillLabel.replace(/'/g, "\\'")}', '${match.categoryIcon}', '${match.categoryName.replace(/'/g, "\\'")}')">
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
// ===== END CUSTOMIZABLE QUICK START SKILLS =====

// ===== END QUICK SKILL FUNCTIONS =====

// ===== FAVORITE SKILLS SYSTEM =====
let favoriteSkills = [];

