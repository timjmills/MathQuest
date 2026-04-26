// skills-organizer.js - Full-screen skill browsing, preview, and queue management
// Layer 3: depends on state, data, utils, unified-skills, generate-question

import { state } from './state.js';
import { DOMAINS, SKILLS, GRADE_COLORS, getSkillGrade, gradeCircleHTML, sortByGrade, isMixedMetaSkill } from './data.js';
import { UnifiedSkills } from './unified-skills.js';

// ========= MODULE STATE =========
const so = {
    initialized: false,
    activeDomain: null,       // null = "All"
    activeCategory: null,     // null = "All"
    activeGrades: new Set(),  // empty = all grades
    searchText: '',
    previewSkill: null,       // { categoryId, skillId }
    previewCache: new Map(),  // LRU cache: "cat:skill" -> question object
    cacheOrder: [],           // for LRU eviction
    maxCacheSize: 50,
    previewDebounceTimer: null,
};

// ========= OPEN / CLOSE =========
export function openSkillsOrganizer() {
    if (!so.initialized) {
        soInitialize();
    }
    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
    window.showView('skillsOrganizerView');
}

// ========= INITIALIZE: BUILD THE GRID =========
export function soInitialize() {
    const gridPanel = document.getElementById('soGridPanel');
    if (!gridPanel) return;

    let html = '';

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<div class="so-domain-section" data-so-domain="${domainId}">`;
        html += `<div class="so-domain-header" style="border-color:${domain.color};color:${domain.color};">`;
        html += `<span class="so-domain-icon">${domain.icon}</span> ${domain.name}`;
        html += `</div>`;

        for (const cat of domain.categories) {
            const skills = SKILLS[cat.id];
            if (!skills || skills.length === 0) continue;

            // Skip categories that contain ONLY meta/mixed skills
            const hasRealSkills = skills.some(s => !isMixedMetaSkill(s.v));
            if (!hasRealSkills) continue;

            // Sort by grade
            const sorted = sortByGrade(skills, cat.id);

            html += `<div class="so-category-group" data-so-category="${cat.id}" data-so-domain="${domainId}">`;
            html += `<div class="so-category-header">`;
            html += `<span>${cat.icon}</span> ${cat.name}`;
            html += `</div>`;
            html += `<div class="so-skills-row">`;

            for (const skill of sorted) {
                // Skip meta/mixed skills
                if (isMixedMetaSkill(skill.v)) continue;

                const grade = getSkillGrade(skill.v, cat.id);
                const gc = GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' };
                const rawLabel = skill.l.replace(/\s*\(Visual\)\s*/g, '').replace(/^[^\w]*/, '');
                const cleanLabel = rawLabel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                // Escape for HTML attributes
                const safeLabel = skill.l.toLowerCase().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                html += `<div class="so-skill-card" `;
                html += `data-so-skill="${skill.v}" data-so-cat="${cat.id}" data-so-domain="${domainId}" `;
                html += `data-so-grade="${grade || ''}" data-so-label="${safeLabel}" `;
                html += `onclick="soToggleSkill('${cat.id}','${skill.v}')" `;
                html += `onmouseenter="soPreviewHover('${cat.id}','${skill.v}',this)" onmouseleave="soPreviewLeave()" `;
                html += `>`;
                if (grade !== null && grade !== undefined) {
                    html += `<span class="so-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>`;
                }
                html += `<span class="so-skill-name" title="${safeLabel}">${cleanLabel}</span>`;
                html += `</div>`;
            }

            html += `</div></div>`; // close skills-row and category-group
        }

        html += `</div>`; // close domain-section
    }

    html += `<div class="so-no-results" id="soNoResults" style="display:none;">No skills match your filters.</div>`;
    gridPanel.innerHTML = html;

    // Build domain filter pills
    soBuildDomainPills();
    soBuildGradePills();

    so.initialized = true;
}

// ========= BUILD FILTER PILLS =========
function soBuildDomainPills() {
    const container = document.getElementById('soDomainFilter');
    if (!container) return;

    let html = `<span class="so-filter-label">Domain:</span>`;
    html += `<button class="so-domain-pill active" data-so-filter-domain="" onclick="soFilterDomain('')">All</button>`;

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<button class="so-domain-pill" data-so-filter-domain="${domainId}" `;
        html += `style="--pill-bg:${domain.color}" `;
        html += `onclick="soFilterDomain('${domainId}')" title="${domain.name}">${domain.icon} ${domain.name}</button>`;
    }

    container.innerHTML = html;
}

function soBuildGradePills() {
    const container = document.getElementById('soGradeFilter');
    if (!container) return;

    let html = `<span class="so-filter-label">Grade:</span>`;
    const grades = ['K', 1, 2, 3, 4, 5, 6, 7];

    for (const g of grades) {
        const gc = GRADE_COLORS[g] || { bg: '#9E9E9E', text: '#fff' };
        html += `<button class="so-grade-pill" data-so-filter-grade="${g}" `;
        html += `style="--grade-bg:${gc.bg};--grade-text:${gc.text}" `;
        html += `onclick="soFilterGrade('${g}')">${g}</button>`;
    }

    container.innerHTML = html;
}

// ========= CATEGORY DROPDOWN =========
export function soUpdateCategoryDropdown() {
    const sel = document.getElementById('soCategorySelect');
    if (!sel) return;

    let html = `<option value="">All Categories</option>`;

    if (so.activeDomain) {
        const domain = DOMAINS[so.activeDomain];
        if (domain) {
            for (const cat of domain.categories) {
                const catSkills = SKILLS[cat.id];
                if (!catSkills || !catSkills.some(s => !isMixedMetaSkill(s.v))) continue;
                html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            }
        }
    } else {
        for (const domain of Object.values(DOMAINS)) {
            for (const cat of domain.categories) {
                const catSkills = SKILLS[cat.id];
                if (!catSkills || !catSkills.some(s => !isMixedMetaSkill(s.v))) continue;
                html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            }
        }
    }

    sel.innerHTML = html;
    if (so.activeCategory) sel.value = so.activeCategory;
}

// ========= FILTER HANDLERS =========
export function soFilterDomain(domainId) {
    so.activeDomain = domainId || null;
    so.activeCategory = null;

    // Update pill styles
    document.querySelectorAll('.so-domain-pill').forEach(pill => {
        const d = pill.dataset.soFilterDomain;
        const isActive = (d === (domainId || ''));
        pill.classList.toggle('active', isActive);
        if (isActive && domainId) {
            const domain = DOMAINS[domainId];
            if (domain) {
                pill.style.background = domain.color;
                pill.style.borderColor = domain.color;
            }
        } else if (isActive) {
            pill.style.background = 'var(--accent-cyan)';
            pill.style.borderColor = 'var(--accent-cyan)';
        } else {
            pill.style.background = 'var(--bg-card)';
            pill.style.borderColor = 'rgba(0,0,0,0.18)';
        }
    });

    soUpdateCategoryDropdown();
    soApplyFilters();
}

export function soFilterCategory() {
    const sel = document.getElementById('soCategorySelect');
    so.activeCategory = sel?.value || null;
    soApplyFilters();
}

export function soFilterGrade(grade) {
    if (so.activeGrades.has(String(grade))) {
        so.activeGrades.delete(String(grade));
    } else {
        so.activeGrades.add(String(grade));
    }

    // Update pill styles
    document.querySelectorAll('.so-grade-pill').forEach(pill => {
        const g = pill.dataset.soFilterGrade;
        const isActive = so.activeGrades.has(g);
        pill.classList.toggle('active', isActive);
        if (isActive) {
            const gc = GRADE_COLORS[isNaN(g) ? g : parseInt(g)] || { bg: '#9E9E9E' };
            pill.style.background = gc.bg;
            pill.style.borderColor = gc.bg;
            pill.style.color = gc.text || '#fff';
        } else {
            pill.style.background = 'var(--bg-card)';
            pill.style.borderColor = 'rgba(0,0,0,0.18)';
            pill.style.color = 'var(--text-bright)';
        }
    });

    soApplyFilters();
}

export function soSearchInput(value) {
    so.searchText = (value || '').toLowerCase().trim();
    soApplyFilters();
}

// ========= APPLY FILTERS (AND logic) =========
export function soApplyFilters() {
    const cards = document.querySelectorAll('.so-skill-card');
    const catGroups = document.querySelectorAll('.so-category-group');
    const domSections = document.querySelectorAll('.so-domain-section');
    let totalVisible = 0;

    cards.forEach(card => {
        let show = true;

        // Domain filter
        if (so.activeDomain && card.dataset.soDomain !== so.activeDomain) {
            show = false;
        }

        // Category filter
        if (show && so.activeCategory && card.dataset.soCat !== so.activeCategory) {
            show = false;
        }

        // Grade filter
        if (show && so.activeGrades.size > 0) {
            const cardGrade = card.dataset.soGrade;
            if (!so.activeGrades.has(String(cardGrade))) {
                show = false;
            }
        }

        // Search filter
        if (show && so.searchText) {
            const label = card.dataset.soLabel || '';
            if (!label.includes(so.searchText)) {
                show = false;
            }
        }

        card.style.display = show ? '' : 'none';
        if (show) totalVisible++;
    });

    // Hide empty category groups
    catGroups.forEach(group => {
        const visibleCards = group.querySelectorAll('.so-skill-card:not([style*="display: none"])');
        group.style.display = visibleCards.length > 0 ? '' : 'none';
    });

    // Hide empty domain sections
    domSections.forEach(section => {
        const visibleGroups = section.querySelectorAll('.so-category-group:not([style*="display: none"])');
        section.style.display = visibleGroups.length > 0 ? '' : 'none';
    });

    // Show/hide no results message
    const noResults = document.getElementById('soNoResults');
    if (noResults) {
        noResults.style.display = totalVisible === 0 ? 'block' : 'none';
    }
}

// ========= TOGGLE SKILL (add/remove from queue) =========
export function soToggleSkill(categoryId, skillId) {
    const has = UnifiedSkills.has(skillId, categoryId);

    if (has) {
        // Remove
        const idx = UnifiedSkills.skills.findIndex(s => s.skillId === skillId && s.categoryId === categoryId);
        if (idx !== -1) UnifiedSkills.removeByIndex(idx);
    } else {
        // Find skill info
        const skillInfo = findSkillInfo(categoryId, skillId);
        if (skillInfo) {
            UnifiedSkills.add(skillInfo);
        }
    }

    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
}

function findSkillInfo(categoryId, skillId) {
    const skills = SKILLS[categoryId];
    if (!skills) return null;

    const skill = skills.find(s => s.v === skillId);
    if (!skill) return null;

    // Find domain
    let domainId = '', domainColor = '#8b5cf6', categoryIcon = '', categoryName = '';
    for (const [dId, domain] of Object.entries(DOMAINS)) {
        const cat = domain.categories.find(c => c.id === categoryId);
        if (cat) {
            domainId = dId;
            domainColor = domain.color;
            categoryIcon = cat.icon;
            categoryName = cat.name;
            break;
        }
    }

    return {
        domainId,
        categoryId,
        skillId,
        skillLabel: skill.l,
        categoryIcon,
        categoryName,
        domainColor,
        percent: 0
    };
}

// ========= REFRESH SELECTED STATES =========
function soRefreshSelected() {
    document.querySelectorAll('.so-skill-card').forEach(card => {
        const skillId = card.dataset.soSkill;
        const catId = card.dataset.soCat;
        const isSelected = UnifiedSkills.has(skillId, catId);
        card.classList.toggle('selected', isSelected);
    });
}

// ========= RENDER QUEUE PANEL =========
export function soRenderQueuePanel() {
    const list = document.getElementById('soQueueList');
    const empty = document.getElementById('soQueueEmpty');
    if (!list) return;

    const skills = UnifiedSkills.getAll();

    if (skills.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        soUpdateActionButtons(false);
        return;
    }

    if (empty) empty.style.display = 'none';
    soUpdateActionButtons(true);

    list.innerHTML = skills.map((skill, i) => {
        const rawQLabel = skill.skillLabel.replace(/^[^\w]*/, '').replace(/\s*\(Visual\)\s*/g, '');
        const cleanLabel = rawQLabel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const gc = gradeCircleHTML(getSkillGrade(skill.skillId, skill.categoryId));
        return `<div class="so-queue-item"
            onmouseenter="soPreviewHover('${skill.categoryId}','${skill.skillId}',this)"
            onmouseleave="soPreviewLeave()">
            <span style="color:${skill.domainColor || '#8b5cf6'}">${skill.categoryIcon || ''}</span>
            ${gc}
            <span class="so-queue-item-label" title="${skill.skillLabel}">${cleanLabel}</span>
            <button class="so-queue-item-remove" onclick="soRemoveFromQueue(${i})" title="Remove">&times;</button>
        </div>`;
    }).join('');
}

export function soRemoveFromQueue(index) {
    UnifiedSkills.removeByIndex(index);
    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
}

export function soClearQueue() {
    UnifiedSkills.clear();
    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
}

function soUpdateHeaderCount() {
    const badge = document.getElementById('soHeaderCountBadge');
    if (badge) badge.textContent = UnifiedSkills.count;
    const countWrap = document.getElementById('soHeaderCount');
    if (countWrap) countWrap.style.display = UnifiedSkills.count > 0 ? 'flex' : 'none';
}

function soUpdateActionButtons(enabled) {
    document.querySelectorAll('.so-action-btn').forEach(btn => {
        // Clear button always enabled
        if (btn.classList.contains('so-action-clear')) return;
        btn.disabled = !enabled;
    });
}

// ========= PREVIEW SYSTEM (hover popup) =========
// Popup appears after 750ms hover on a skill card.
// Stays open while mouse is on the card or the popup.
// Closes after a 200ms grace period when mouse leaves both.

let _popupEl = null;       // reusable popup div
let _popupCardEl = null;   // card element the popup is anchored to
let _mouseOnCard = false;
let _mouseOnPopup = false;
let _popupCloseTimer = null;
let _popupVisible = false;

function _getOrCreatePopup() {
    if (_popupEl) return _popupEl;
    _popupEl = document.createElement('div');
    _popupEl.className = 'so-hover-popup';
    _popupEl.style.display = 'none';
    document.body.appendChild(_popupEl);

    _popupEl.addEventListener('mouseenter', () => {
        _mouseOnPopup = true;
        clearTimeout(_popupCloseTimer);
    });
    _popupEl.addEventListener('mouseleave', () => {
        _mouseOnPopup = false;
        _schedulePopupClose();
    });

    return _popupEl;
}

function _positionPopup(popup, cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const popupWidth = 350;
    const popupHeight = popup.offsetHeight || 300;

    // Try right side first
    let left = rect.right + 10;
    let top = rect.top;

    // If goes off right edge, put on left
    if (left + popupWidth > window.innerWidth) {
        left = rect.left - popupWidth - 10;
    }
    // If goes off left, center below
    if (left < 0) {
        left = Math.max(10, rect.left);
        top = rect.bottom + 10;
    }
    // Keep in viewport vertically
    if (top + popupHeight > window.innerHeight) {
        top = Math.max(10, window.innerHeight - popupHeight - 10);
    }

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

function _schedulePopupClose() {
    clearTimeout(_popupCloseTimer);
    _popupCloseTimer = setTimeout(() => {
        if (!_mouseOnCard && !_mouseOnPopup) {
            _hidePopup();
        }
    }, 200);
}

function _hidePopup() {
    if (_popupEl) {
        _popupEl.style.display = 'none';
    }
    _popupVisible = false;
    _popupCardEl = null;
}

export function soPreviewHover(categoryId, skillId, cardEl) {
    _mouseOnCard = true;
    clearTimeout(_popupCloseTimer);

    const isSameSkill = so.previewSkill &&
        so.previewSkill.categoryId === categoryId &&
        so.previewSkill.skillId === skillId;

    clearTimeout(so.previewDebounceTimer);

    if (_popupVisible && !isSameSkill) {
        // Popup already visible from another card — swap content immediately
        _popupCardEl = cardEl || _popupCardEl;
        soGeneratePreview(categoryId, skillId);
    } else if (!_popupVisible) {
        // No popup showing — wait 750ms before opening
        _popupCardEl = cardEl;
        so.previewDebounceTimer = setTimeout(() => {
            soGeneratePreview(categoryId, skillId);
            _popupVisible = true;
        }, 750);
    }
    // If same skill, do nothing — popup is already correct
}

export function soPreviewLeave() {
    _mouseOnCard = false;
    clearTimeout(so.previewDebounceTimer);
    _schedulePopupClose();
}

export function soPreviewClick(categoryId, skillId) {
    clearTimeout(so.previewDebounceTimer);
    // For mobile tap: find the card element from the DOM
    if (!_popupCardEl) {
        _popupCardEl = document.querySelector(`.so-skill-card[data-so-skill="${skillId}"][data-so-cat="${categoryId}"]`);
    }
    soGeneratePreview(categoryId, skillId);
    _popupVisible = true;
}

export function soGeneratePreview(categoryId, skillId) {
    const cacheKey = `${categoryId}:${skillId}`;

    // Check cache
    let q = so.previewCache.get(cacheKey);
    if (!q) {
        // Generate question with state save/restore
        q = safeGenerateQuestion(categoryId, skillId);
        if (q) {
            // LRU cache management
            if (so.cacheOrder.length >= so.maxCacheSize) {
                const oldest = so.cacheOrder.shift();
                so.previewCache.delete(oldest);
            }
            so.previewCache.set(cacheKey, q);
            so.cacheOrder.push(cacheKey);
        }
    }

    so.previewSkill = { categoryId, skillId };
    renderPreview(q, categoryId, skillId);
}

export function soRefreshPreview() {
    if (!so.previewSkill) return;
    const { categoryId, skillId } = so.previewSkill;
    const cacheKey = `${categoryId}:${skillId}`;

    // Remove from cache to force regeneration
    so.previewCache.delete(cacheKey);
    const idx = so.cacheOrder.indexOf(cacheKey);
    if (idx !== -1) so.cacheOrder.splice(idx, 1);

    soGeneratePreview(categoryId, skillId);
}

function safeGenerateQuestion(categoryId, skillId) {
    // Save only the properties that generateQuestion() reads/mutates
    const saved = {
        category: state.category,
        skill: state.skill,
        difficulty: state.difficulty,
        range: state.range,
        decimalPlaces: state.decimalPlaces,
        isMixedMode: state.isMixedMode,
        gameMode: state.gameMode,
        hasAnswered: state.hasAnswered,
        currentQ: state.currentQ,
        qCount: state.qCount,
        selectedNumbers: [...state.selectedNumbers],
    };

    try {
        state.category = categoryId;
        state.skill = skillId;
        state.isMixedMode = false;
        state.gameMode = 'practice';

        const q = window.generateQuestion();
        return q;
    } catch (e) {
        console.warn('Preview generation failed for', categoryId, skillId, e);
        return null;
    } finally {
        Object.assign(state, saved);
    }
}

function renderPreview(q, categoryId, skillId) {
    const popup = _getOrCreatePopup();

    // Find skill label
    const skills = SKILLS[categoryId];
    const skillDef = skills?.find(s => s.v === skillId);
    const label = skillDef ? skillDef.l : skillId;

    if (!q) {
        popup.innerHTML = `
            <div class="so-popup-label">${label}</div>
            <div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.85rem;">
                Could not generate preview for this skill.
            </div>`;
    } else {
        // Render an option/answer for the preview. Most options are strings or
        // numbers, but some skills (e.g. multi-select with HTML payloads) emit
        // plain objects. Fall back gracefully so we never show "[object Object]".
        const renderOptHTML = (opt) => {
            if (opt == null) return '';
            if (typeof opt === 'string' || typeof opt === 'number') return String(opt);
            // Object option — try common shapes used across generators
            if (typeof opt === 'object') {
                if (opt.svg) return opt.svg;
                if (opt.html) return opt.html;
                if (opt.label) return String(opt.label);
                if (opt.text != null) return String(opt.text);
                if (opt.value != null) return String(opt.value);
                if (opt.id != null) return String(opt.id);
            }
            return '';
        };
        const optKey = (opt) => {
            if (opt == null) return '';
            if (typeof opt === 'object') {
                if (opt.id != null) return String(opt.id);
                if (opt.value != null) return String(opt.value);
                if (opt.label) return String(opt.label);
                if (opt.text != null) return String(opt.text);
                return '';
            }
            return String(opt);
        };
        const renderAnswerHTML = (ans) => {
            if (ans == null) return '';
            if (Array.isArray(ans)) {
                const parts = ans.map(a => {
                    if (a == null) return '';
                    if (typeof a === 'object') {
                        // For complex answer objects, prefer the visible label/id
                        return optKey(a) || '(visual)';
                    }
                    return String(a);
                }).filter(Boolean);
                return parts.length ? parts.join(', ') : '(see question)';
            }
            if (typeof ans === 'object') {
                return optKey(ans) || '(see question)';
            }
            return String(ans);
        };

        let html = `<div class="so-popup-label">${label}</div>`;
        html += `<div class="so-popup-question">${q.text || ''}</div>`;

        if (q.visual) {
            html += `<div class="so-popup-visual">${q.visual}</div>`;
        }

        const ansKey = optKey(q.ans);
        if (q.options && q.options.length > 0) {
            html += `<div class="so-popup-options">`;
            for (const opt of q.options) {
                const optHTML = renderOptHTML(opt);
                if (!optHTML) continue;
                const isCorrect = optKey(opt) === ansKey;
                html += `<span class="so-popup-option${isCorrect ? ' correct' : ''}">${optHTML}</span>`;
            }
            html += `</div>`;
        }

        html += `<div class="so-popup-answer">Answer: ${renderAnswerHTML(q.ans)}</div>`;

        if (q.hint) {
            html += `<div class="so-popup-hint">Hint: ${q.hint}</div>`;
        }

        html += `<button class="so-popup-refresh" onclick="soRefreshPreview()">Regenerate</button>`;
        popup.innerHTML = html;
    }

    // Show and position
    popup.style.display = 'block';
    if (_popupCardEl) {
        _positionPopup(popup, _popupCardEl);
    }
}

// ========= ACTION BAR HANDLERS =========
export function soPlay(mode) {
    if (UnifiedSkills.count === 0) {
        window.showToast('Select skills first!', '#ef4444');
        return;
    }
    window.showView('homeView');
    window.playSelectedSkills(mode);
}

export function soPrint() {
    if (UnifiedSkills.count === 0) {
        window.showToast('Select skills first!', '#ef4444');
        return;
    }
    window.showView('homeView');
    window.printFromQueue();
}

export function soShare() {
    if (UnifiedSkills.count === 0) {
        window.showToast('Select skills first!', '#ef4444');
        return;
    }
    window.generateShareableLink();
    window.showToast('Link generated! Check the share settings panel.', 'var(--accent-green)');
}

export function soShowCode() {
    if (UnifiedSkills.count === 0) {
        window.showToast('Select skills first!', '#ef4444');
        return;
    }
    const code = window.generateSkillCode();
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            window.showToast('Code copied: ' + code, 'var(--accent-purple)');
        }).catch(() => {
            window.showToast('Code: ' + code, 'var(--accent-purple)');
        });
    }
}

export function soQuiz() {
    if (UnifiedSkills.count === 0) {
        window.showToast('Select skills first!', '#ef4444');
        return;
    }
    // Open quiz builder and add questions from selected skills
    window.openQuizBuilder();
    // After builder opens, add questions from each selected skill
    setTimeout(() => {
        const skills = UnifiedSkills.getAll();
        for (const sk of skills) {
            window.addQuizQuestion(sk.skillId);
        }
    }, 100);
}

// ========= SELECT ALL VISIBLE =========
export function soSelectAllVisible() {
    const cards = document.querySelectorAll('.so-skill-card:not([style*="display: none"])');
    cards.forEach(card => {
        const skillId = card.dataset.soSkill;
        const catId = card.dataset.soCat;
        if (!UnifiedSkills.has(skillId, catId)) {
            const info = findSkillInfo(catId, skillId);
            if (info) UnifiedSkills.add(info);
        }
    });
    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
}

// ========= DESELECT ALL VISIBLE =========
export function soDeselectAllVisible() {
    const cards = document.querySelectorAll('.so-skill-card:not([style*="display: none"])');
    cards.forEach(card => {
        const skillId = card.dataset.soSkill;
        const catId = card.dataset.soCat;
        if (UnifiedSkills.has(skillId, catId)) {
            UnifiedSkills.remove(skillId, catId);
        }
    });
    soRefreshSelected();
    soRenderQueuePanel();
    soUpdateHeaderCount();
}
