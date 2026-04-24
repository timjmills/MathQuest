// Grade-Level Batch Assign chips (Adaptive Mode Research — Feature 2 / Approach D)
// One row of 7 colored chips (K, 1, 2, 3, 4, 5, 6) above the Quick Start grid.
// Click → adds every skill with that grade to the queue. Click again → removes them.
// Multi-select supported (clicking K then 1 then 2 = K + 1 + 2).
//
// Wired to UnifiedSkills.add() / removeBySkillId(). Mixed/meta skills are excluded.

import { DOMAINS, SKILLS, GRADE_COLORS, getSkillGrade, getDomainByCategory, isMixedMetaSkill } from './data.js';
import { UnifiedSkills } from './unified-skills.js';

// Order shown in the row (M intentionally excluded per spec; 7 has only 1 skill — also skipped).
const CHIP_GRADES = ['K', '1', '2', '3', '4', '5', '6'];

// Tracks which grade chips are currently active (added to queue by chip click).
const _activeGrades = new Set();

// Cache of {grade -> Array<{categoryId, skillId, skillLabel, categoryIcon, categoryName, domainId, domainColor}>}
let _grade2skillsCache = null;

function buildGrade2SkillsIndex() {
    if (_grade2skillsCache) return _grade2skillsCache;
    const index = {};
    for (const g of CHIP_GRADES) index[g] = [];

    for (const [categoryId, skillList] of Object.entries(SKILLS)) {
        if (!Array.isArray(skillList)) continue;

        const domainId = getDomainByCategory(categoryId);
        const domain = domainId ? DOMAINS[domainId] : null;
        const domainColor = domain ? domain.color : '#8b5cf6';
        const catInfo = domain ? domain.categories.find(c => c.id === categoryId) : null;
        const categoryName = catInfo ? catInfo.name : categoryId;
        const categoryIcon = catInfo ? catInfo.icon : '📚';

        for (const skill of skillList) {
            if (isMixedMetaSkill(skill.v)) continue;
            const grade = getSkillGrade(skill.v, categoryId);
            if (grade === null || grade === undefined) continue;
            const gradeStr = String(grade);
            if (!index[gradeStr]) continue; // skips 'M', '7', etc.
            index[gradeStr].push({
                categoryId,
                skillId: skill.v,
                skillLabel: skill.l,
                categoryIcon,
                categoryName,
                domainId: domainId || '',
                domainColor
            });
        }
    }
    _grade2skillsCache = index;
    return index;
}

function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderGradeChips() {
    const row = document.getElementById('gradeChipsRow');
    if (!row) return;

    const index = buildGrade2SkillsIndex();
    const html = CHIP_GRADES.map(g => {
        const meta = GRADE_COLORS[g] || GRADE_COLORS[Number(g)] || { bg: '#888', text: '#fff', label: `Grade ${g}` };
        const count = index[g].length;
        const isActive = _activeGrades.has(g);
        const checkMark = isActive ? '<span class="gc-check" aria-hidden="true">✓</span>' : '';
        return `<button type="button"
            class="grade-chip grade-chip-${g} ${isActive ? 'active' : ''}"
            data-grade="${g}"
            aria-pressed="${isActive}"
            aria-label="${escapeAttr(meta.label)} — ${count} skills${isActive ? ', selected' : ''}"
            title="${escapeAttr(meta.label)} (${count} skills)"
            onclick="window.toggleGradeChip('${g}')"
            style="background:${isActive ? meta.bg : '#fff'};color:${isActive ? meta.text : meta.bg};border-color:${meta.bg};">
            ${checkMark}<span class="gc-grade">${g}</span><span class="gc-count">(${count})</span>
        </button>`;
    }).join('');
    row.innerHTML = html;
}

export function toggleGradeChip(grade) {
    const g = String(grade);
    if (!CHIP_GRADES.includes(g)) return;

    const index = buildGrade2SkillsIndex();
    const skills = index[g] || [];
    if (skills.length === 0) {
        if (typeof showNotification === 'function') showNotification(`No Grade ${g} skills available.`, 'info');
        return;
    }

    const meta = GRADE_COLORS[g] || GRADE_COLORS[Number(g)] || { label: `Grade ${g}` };
    const wasActive = _activeGrades.has(g);

    if (wasActive) {
        // Remove all skills of this grade from the queue.
        let removed = 0;
        for (const s of skills) {
            if (UnifiedSkills.has(s.skillId, s.categoryId)) {
                UnifiedSkills.removeBySkillId(s.skillId);
                removed++;
            }
        }
        _activeGrades.delete(g);
        if (typeof showNotification === 'function') {
            showNotification(`✗ Removed ${removed} ${meta.label} skill${removed === 1 ? '' : 's'}`, 'info');
        }
    } else {
        // Add every skill with this grade.
        let added = 0;
        for (const s of skills) {
            const ok = UnifiedSkills.add({
                domainId: s.domainId,
                categoryId: s.categoryId,
                skillId: s.skillId,
                skillLabel: s.skillLabel,
                categoryIcon: s.categoryIcon,
                categoryName: s.categoryName,
                domainColor: s.domainColor
            });
            if (ok) added++;
        }
        _activeGrades.add(g);
        if (typeof showNotification === 'function') {
            showNotification(`✓ Added ${added} ${meta.label} skill${added === 1 ? '' : 's'}`, 'success');
        }
    }

    // Re-render chips to reflect active state, and refresh quick skill cards too.
    renderGradeChips();
    if (typeof renderQuickSkillsGrid === 'function') {
        renderQuickSkillsGrid();
    }
}

export function getActiveGradeChips() {
    return Array.from(_activeGrades);
}

export function clearActiveGradeChips() {
    _activeGrades.clear();
    renderGradeChips();
}

export function initGradeChips() {
    // Render the row (idempotent — safe to call multiple times).
    renderGradeChips();
}
