// Quiz Builder — Teacher-facing test creation UI
// 3-panel layout: Skill Grid | Preview + Add | Question List (with sections)
// Layer 4: depends on state, data, quiz-storage, generate-question

import { state } from './state.js';
import { DOMAINS, SKILLS, GRADE_COLORS, getSkillGrade, sortByGrade } from './data.js';
import { shuffle } from './utils.js';
import { saveTest, loadTest, listTests, deleteTest, exportTestJSON, importTestJSON, compressTestForURL, migrateTestToSections, getAllQuestionsFlat, getTotalQuestionCount } from './quiz-storage.js';

// ========= MODULE STATE =========
const qb = {
    initialized: false,
    activeDomain: null,
    activeCategory: null,
    activeGrades: new Set(),
    searchText: '',
    previewSkill: null,
    previewCache: new Map(),
    cacheOrder: [],
    maxCacheSize: 50,
    previewDebounceTimer: null,
    activeSection: 0,
    collapsedSections: {},
};

let builderTest = null;

// ========= CONSTANTS =========
const SECTION_LAYOUT_PRESETS = [
    { name: 'Word Problems', columns: 1, spacing: 'spacious', icon: '\u{1F4DD}' },
    { name: 'Standard',      columns: 2, spacing: 'normal',   icon: '\u{1F4CB}' },
    { name: 'Practice',      columns: 3, spacing: 'normal',   icon: '\u{270F}\u{FE0F}' },
    { name: 'Drill',         columns: 5, spacing: 'compact',  icon: '\u{26A1}' },
    { name: 'Fast Facts',    columns: 8, spacing: 'compact', icon: '\u{1F525}' },
];

const SPACING_MAP = { compact: '6px 4px', normal: '15px 12px', spacious: '25px 20px' };

// ========= PRINT FORMAT HELPER =========
// Parses simple arithmetic from question text and renders in worksheet print style
// (vertical operations, long division brackets, horizontal with answer lines)
function formatFactForPrint(text, globalIdx, columns) {
    if (!text) return null;

    const patterns = [
        { re: /^(\d+)\s*\+\s*(\d+)\s*=\s*\??$/, op: '+', type: 'add' },
        { re: /^(\d+)\s*[\-\u2212\u2013]\s*(\d+)\s*=\s*\??$/, op: '\u2212', type: 'sub' },
        { re: /^(\d+)\s*[\u00d7x\*]\s*(\d+)\s*=\s*\??$/, op: '\u00d7', type: 'mult' },
        { re: /^(\d+)\s*[\u00f7\/]\s*(\d+)\s*=\s*\??$/, op: '\u00f7', type: 'div' },
    ];

    for (const pat of patterns) {
        const m = text.match(pat.re);
        if (!m) continue;
        const a = parseInt(m[1]);
        const b = parseInt(m[2]);
        const fs = columns >= 8 ? '0.75rem' : columns >= 5 ? '0.9rem' : '1.05rem';
        const blankW = columns >= 8 ? '20px' : columns >= 5 ? '25px' : '35px';

        if (pat.type === 'div') {
            const divFmt = globalIdx % 3;
            if (divFmt === 0) {
                return `<span style="font-size:${fs};">${a} \u00f7 ${b} = <span style="display:inline-block;min-width:${blankW};border-bottom:1.5px solid #333;">&nbsp;</span></span>`;
            } else if (divFmt === 1) {
                return `<div style="display:inline-flex;align-items:flex-start;font-size:${fs};">
                    <span style="margin-top:14px;margin-right:1px;">${b}</span>
                    <div style="display:flex;flex-direction:column;">
                        <div style="min-width:${blankW};height:14px;border-bottom:1.5px solid #333;"></div>
                        <div style="border-left:1.5px solid #333;padding-left:4px;">${a}</div>
                    </div>
                </div>`;
            } else {
                return `<div style="display:inline-flex;align-items:center;gap:6px;font-size:${fs};">
                    <div style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.2;">
                        <span>${a}</span>
                        <div style="width:100%;height:1.5px;background:#333;"></div>
                        <span>${b}</span>
                    </div>
                    <span>= <span style="display:inline-block;min-width:${blankW};border-bottom:1.5px solid #333;">&nbsp;</span></span>
                </div>`;
            }
        }

        const useVertical = globalIdx % 2 === 1;
        if (useVertical) {
            return `<div style="display:inline-block;text-align:right;font-size:${fs};">
                <div>${a}</div>
                <div style="border-bottom:1.5px solid #333;"><span style="margin-right:6px;">${pat.op}</span>${b}</div>
            </div>`;
        } else {
            return `<span style="font-size:${fs};">${a} ${pat.op} ${b} = <span style="display:inline-block;min-width:${blankW};border-bottom:1.5px solid #333;">&nbsp;</span></span>`;
        }
    }

    return null;
}
const SECTION_COLORS = ['#ec4899', '#8b5cf6', '#0891b2', '#f97316', '#06D6A0', '#6366f1'];

// ========= HELPERS =========
function getSkillLabel(skillId) {
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) return sk.l;
        }
    }
    return skillId;
}

function findCategoryForSkill(skillId) {
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) return catKey;
        }
    }
    return null;
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function createNewTest() {
    return {
        id: null,
        name: 'Untitled Quiz',
        createdAt: null,
        updatedAt: null,
        sections: [{
            id: 0,
            label: 'Problem Set A',
            layout: { columns: 2, spacing: 'normal' },
            instructions: '',
            questions: []
        }],
        settings: {
            timeLimit: null,
            randomOrder: false,
            showFeedback: 'end',
            allowRetry: false,
            passingScore: 70,
            sectionMode: 'sequential',
            shuffleWithinSections: false,
            printVersions: 1
        }
    };
}

// ========= SAFE GENERATE QUESTION =========
function safeGenerateQuestion(categoryId, skillId) {
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
        return window.generateQuestion();
    } catch (e) {
        console.warn('QB preview generation failed for', categoryId, skillId, e);
        return null;
    } finally {
        Object.assign(state, saved);
    }
}

// ========= OPEN / CLOSE =========
export function openQuizBuilder(testId) {
    if (testId) {
        loadTest(testId).then(test => {
            builderTest = test || createNewTest();
            migrateTestToSections(builderTest);
            qb.activeSection = 0;
            qb.collapsedSections = {};
            showBuilder();
        });
    } else {
        builderTest = createNewTest();
        qb.activeSection = 0;
        qb.collapsedSections = {};
        showBuilder();
    }
    window.showView('quizBuilderView');
}

function showBuilder() {
    const myQuizzes = document.getElementById('qbMyQuizzesContainer');
    const builder = document.getElementById('qbBuilderContainer');
    if (myQuizzes) myQuizzes.style.display = 'none';
    if (builder) builder.style.display = 'block';

    if (!qb.initialized) {
        qbInitialize();
    }

    const nameInput = document.getElementById('quizNameInput');
    if (nameInput) nameInput.value = builderTest.name || 'Untitled Quiz';

    qbRenderSettings();
    qbRenderSectionList();
    qbUpdateCounts();
}

export async function openMyQuizzes() {
    const myQuizzes = document.getElementById('qbMyQuizzesContainer');
    const builder = document.getElementById('qbBuilderContainer');
    if (myQuizzes) myQuizzes.style.display = 'block';
    if (builder) builder.style.display = 'none';

    window.showView('quizBuilderView');

    const tests = await listTests();
    const container = document.getElementById('quizListContainer');
    if (!container) return;

    if (tests.length === 0) {
        container.innerHTML = '<div class="qb-empty">No quizzes yet. Create your first one!</div>';
    } else {
        container.innerHTML = tests.map(t => {
            const qCount = t.sections ? t.sections.reduce((s, sec) => s + sec.questions.length, 0) : (t.questions || []).length;
            return `
            <div class="qb-quiz-item">
                <div>
                    <div class="qb-quiz-item-name">${escHtml(t.name)}</div>
                    <div class="qb-quiz-item-meta">${qCount} question${qCount !== 1 ? 's' : ''} &middot; ${new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="qb-quiz-item-actions">
                    <button class="qb-q-btn" onclick="openQuizBuilder('${t.id}')">Edit</button>
                    <button class="qb-q-btn" onclick="openQuizMonitor('${t.id}')" style="background:#8b5cf6;color:white;">Monitor</button>
                    <button class="qb-q-btn" onclick="showQuizResults('${t.id}')">Results</button>
                    <button class="qb-q-btn danger" onclick="confirmDeleteQuiz('${t.id}')">Delete</button>
                </div>
            </div>`;
        }).join('');
    }
}

export async function confirmDeleteQuiz(id) {
    if (!confirm('Delete this quiz and all its results?')) return;
    await deleteTest(id);
    openMyQuizzes();
}

// ========= INITIALIZE: BUILD THE SKILL GRID =========
function qbInitialize() {
    const gridPanel = document.getElementById('qbGridPanel');
    if (!gridPanel) return;

    let html = '';

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<div class="qb-domain-section" data-qb-domain="${domainId}">`;
        html += `<div class="qb-domain-header" style="border-color:${domain.color};color:${domain.color};">`;
        html += `<span class="qb-domain-icon">${domain.icon}</span> ${domain.name}`;
        html += `</div>`;

        for (const cat of domain.categories) {
            const skills = SKILLS[cat.id];
            if (!skills || skills.length === 0) continue;
            if (cat.id.endsWith('_mixed')) continue;

            const sorted = sortByGrade(skills, cat.id);

            html += `<div class="qb-category-group" data-qb-category="${cat.id}" data-qb-domain="${domainId}">`;
            html += `<div class="qb-category-header">`;
            html += `<span>${cat.icon}</span> ${cat.name}`;
            html += `</div>`;
            html += `<div class="qb-skills-row">`;

            for (const skill of sorted) {
                if (skill.v.startsWith('mixed_') || skill.v.endsWith('_all') || skill.v === 'mixed' || skill.v === 'custom_mixed') continue;

                const grade = getSkillGrade(skill.v, cat.id);
                const gc = GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' };
                const rawLabel = skill.l.replace(/\s*\(Visual\)\s*/g, '').replace(/^[^\w]*/, '');
                const cleanLabel = rawLabel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const safeLabel = skill.l.toLowerCase().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                html += `<div class="qb-skill-card" `;
                html += `data-qb-skill="${skill.v}" data-qb-cat="${cat.id}" data-qb-domain="${domainId}" `;
                html += `data-qb-grade="${grade || ''}" data-qb-label="${safeLabel}" `;
                html += `onclick="qbPreviewClick('${cat.id}','${skill.v}')" `;
                html += `onmouseenter="qbPreviewHover('${cat.id}','${skill.v}')" `;
                html += `>`;
                if (grade !== null && grade !== undefined) {
                    html += `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>`;
                }
                html += `<span class="qb-skill-name">${cleanLabel}</span>`;
                html += `</div>`;
            }

            html += `</div></div>`;
        }

        html += `</div>`;
    }

    html += `<div class="qb-no-results" id="qbNoResults" style="display:none;">No skills match your filters.</div>`;
    gridPanel.innerHTML = html;

    qbBuildDomainPills();
    qbBuildGradePills();

    qb.initialized = true;
}

// ========= BUILD FILTER PILLS =========
function qbBuildDomainPills() {
    const container = document.getElementById('qbDomainFilter');
    if (!container) return;

    let html = `<span class="qb-filter-label">Domain:</span>`;
    html += `<button class="qb-domain-pill active" data-qb-filter-domain="" onclick="qbFilterDomain('')">All</button>`;

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<button class="qb-domain-pill" data-qb-filter-domain="${domainId}" `;
        html += `style="--pill-bg:${domain.color}" `;
        html += `onclick="qbFilterDomain('${domainId}')">${domain.icon} ${domain.name}</button>`;
    }

    container.innerHTML = html;
}

function qbBuildGradePills() {
    const container = document.getElementById('qbGradeFilter');
    if (!container) return;

    let html = `<span class="qb-filter-label">Grade:</span>`;
    const grades = ['K', 1, 2, 3, 4, 5, 6, 7];

    for (const g of grades) {
        const gc = GRADE_COLORS[g] || { bg: '#9E9E9E', text: '#fff' };
        html += `<button class="qb-grade-pill" data-qb-filter-grade="${g}" `;
        html += `style="--grade-bg:${gc.bg};--grade-text:${gc.text}" `;
        html += `onclick="qbFilterGrade('${g}')">${g}</button>`;
    }

    container.innerHTML = html;
}

// ========= CATEGORY DROPDOWN =========
function qbUpdateCategoryDropdown() {
    const sel = document.getElementById('qbCategorySelect');
    if (!sel) return;

    let html = `<option value="">All Categories</option>`;

    if (qb.activeDomain) {
        const domain = DOMAINS[qb.activeDomain];
        if (domain) {
            for (const cat of domain.categories) {
                if (cat.id.endsWith('_mixed')) continue;
                html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            }
        }
    } else {
        for (const domain of Object.values(DOMAINS)) {
            for (const cat of domain.categories) {
                if (cat.id.endsWith('_mixed')) continue;
                html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            }
        }
    }

    sel.innerHTML = html;
    if (qb.activeCategory) sel.value = qb.activeCategory;
}

// ========= FILTER HANDLERS =========
export function qbFilterDomain(domainId) {
    qb.activeDomain = domainId || null;
    qb.activeCategory = null;

    document.querySelectorAll('.qb-domain-pill').forEach(pill => {
        const d = pill.dataset.qbFilterDomain;
        const isActive = (d === (domainId || ''));
        pill.classList.toggle('active', isActive);
        if (isActive && domainId) {
            const domain = DOMAINS[domainId];
            if (domain) {
                pill.style.background = domain.color;
                pill.style.borderColor = domain.color;
            }
        } else if (isActive) {
            pill.style.background = 'var(--accent-purple)';
            pill.style.borderColor = 'var(--accent-purple)';
        } else {
            pill.style.background = 'var(--bg-card)';
            pill.style.borderColor = 'rgba(0,0,0,0.18)';
        }
    });

    qbUpdateCategoryDropdown();
    qbApplyFilters();
}

export function qbFilterCategory() {
    const sel = document.getElementById('qbCategorySelect');
    qb.activeCategory = sel?.value || null;
    qbApplyFilters();
}

export function qbFilterGrade(grade) {
    if (qb.activeGrades.has(String(grade))) {
        qb.activeGrades.delete(String(grade));
    } else {
        qb.activeGrades.add(String(grade));
    }

    document.querySelectorAll('.qb-grade-pill').forEach(pill => {
        const g = pill.dataset.qbFilterGrade;
        const isActive = qb.activeGrades.has(g);
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

    qbApplyFilters();
}

export function qbSearchInput(value) {
    qb.searchText = (value || '').toLowerCase().trim();
    qbApplyFilters();
}

// ========= APPLY FILTERS (AND logic) =========
function qbApplyFilters() {
    const cards = document.querySelectorAll('.qb-skill-card');
    const catGroups = document.querySelectorAll('.qb-category-group');
    const domSections = document.querySelectorAll('.qb-domain-section');
    let totalVisible = 0;

    cards.forEach(card => {
        let show = true;

        if (qb.activeDomain && card.dataset.qbDomain !== qb.activeDomain) show = false;
        if (show && qb.activeCategory && card.dataset.qbCat !== qb.activeCategory) show = false;
        if (show && qb.activeGrades.size > 0) {
            if (!qb.activeGrades.has(String(card.dataset.qbGrade))) show = false;
        }
        if (show && qb.searchText) {
            const label = card.dataset.qbLabel || '';
            if (!label.includes(qb.searchText)) show = false;
        }

        card.style.display = show ? '' : 'none';
        if (show) totalVisible++;
    });

    catGroups.forEach(group => {
        const visible = group.querySelectorAll('.qb-skill-card:not([style*="display: none"])');
        group.style.display = visible.length > 0 ? '' : 'none';
    });

    domSections.forEach(section => {
        const visible = section.querySelectorAll('.qb-category-group:not([style*="display: none"])');
        section.style.display = visible.length > 0 ? '' : 'none';
    });

    const noResults = document.getElementById('qbNoResults');
    if (noResults) noResults.style.display = totalVisible === 0 ? 'block' : 'none';
}

// ========= PREVIEW SYSTEM =========
export function qbPreviewHover(categoryId, skillId) {
    clearTimeout(qb.previewDebounceTimer);
    qb.previewDebounceTimer = setTimeout(() => {
        qbGeneratePreview(categoryId, skillId);
    }, 300);
}

export function qbPreviewClick(categoryId, skillId) {
    clearTimeout(qb.previewDebounceTimer);
    qbGeneratePreview(categoryId, skillId);

    document.querySelectorAll('.qb-skill-card').forEach(c => c.classList.remove('previewing'));
    const card = document.querySelector(`.qb-skill-card[data-qb-skill="${skillId}"][data-qb-cat="${categoryId}"]`);
    if (card) card.classList.add('previewing');
}

function qbGeneratePreview(categoryId, skillId) {
    const panel = document.getElementById('qbPreviewContent');
    if (!panel) return;

    const cacheKey = `${categoryId}:${skillId}`;

    let q = qb.previewCache.get(cacheKey);
    if (!q) {
        q = safeGenerateQuestion(categoryId, skillId);
        if (q) {
            if (qb.cacheOrder.length >= qb.maxCacheSize) {
                const oldest = qb.cacheOrder.shift();
                qb.previewCache.delete(oldest);
            }
            qb.previewCache.set(cacheKey, q);
            qb.cacheOrder.push(cacheKey);
        }
    }

    qb.previewSkill = { categoryId, skillId };
    renderPreview(q, categoryId, skillId);
}

export function qbRefreshPreview() {
    if (!qb.previewSkill) return;
    const { categoryId, skillId } = qb.previewSkill;
    const cacheKey = `${categoryId}:${skillId}`;

    qb.previewCache.delete(cacheKey);
    const idx = qb.cacheOrder.indexOf(cacheKey);
    if (idx !== -1) qb.cacheOrder.splice(idx, 1);

    qbGeneratePreview(categoryId, skillId);
}

function renderPreview(q, categoryId, skillId) {
    const panel = document.getElementById('qbPreviewContent');
    if (!panel) return;

    const skills = SKILLS[categoryId];
    const skillDef = skills?.find(s => s.v === skillId);
    const label = skillDef ? skillDef.l : skillId;
    const grade = getSkillGrade(skillId, categoryId);
    const gc = grade != null ? (GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' }) : null;

    if (!q) {
        panel.innerHTML = `
            <div class="qb-preview-skill-label">
                ${gc ? `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>` : ''}
                ${escHtml(label)}
            </div>
            <div class="qb-preview-section">
                <div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.85rem;">
                    Could not generate preview for this skill.
                </div>
            </div>`;
        const addBar = document.getElementById('qbPreviewAddBar');
        if (addBar) addBar.innerHTML = '';
        return;
    }

    // Section target indicator
    const targetSection = builderTest ? builderTest.sections[qb.activeSection] : null;
    const targetLabel = targetSection ? targetSection.label : 'Problem Set A';

    let html = `<div class="qb-preview-skill-label">
        ${gc ? `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>` : ''}
        ${escHtml(label)}
    </div>`;

    html += `<div class="qb-preview-section">`;
    html += `<div class="qb-preview-question">${q.text || ''}</div>`;

    if (q.visual) {
        html += `<div class="qb-preview-visual">${q.visual}</div>`;
    }

    if (q.options && q.options.length > 0) {
        html += `<div class="qb-preview-options">`;
        for (const opt of q.options) {
            const isCorrect = String(opt) === String(q.ans);
            html += `<span class="qb-preview-option${isCorrect ? ' correct' : ''}">${opt}</span>`;
        }
        html += `</div>`;
    }

    html += `<div class="qb-preview-answer">Answer: ${q.ans}</div>`;

    if (q.hint) {
        html += `<div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px;">Hint: ${q.hint}</div>`;
    }

    html += `<button class="qb-preview-refresh" onclick="qbRefreshPreview()">&#x1f504; New Question</button>`;
    html += `</div>`;

    panel.innerHTML = html;

    // Render add widget into the pinned bar
    const addBar = document.getElementById('qbPreviewAddBar');
    if (addBar) {
        addBar.innerHTML = `<div class="qb-add-widget">
            <span class="qb-add-widget-label">Add to: ${escHtml(targetLabel)}</span>
            <div class="qb-add-widget-controls">
                <input type="number" id="qbAddNum" value="1" min="1" class="qb-add-num-input">
                <button class="qb-add-widget-btn" onclick="qbAddFromPreview()">+ Add</button>
            </div>
        </div>`;
    }
}

export function qbAddFromPreview() {
    if (!qb.previewSkill || !builderTest) return;
    const { categoryId, skillId } = qb.previewSkill;
    const count = parseInt(document.getElementById('qbAddNum')?.value || '1');
    addMultipleQuestions(skillId, Math.max(1, count));
}

// ========= SECTION MANAGEMENT =========
export function addSection() {
    if (!builderTest) return;
    const nextIdx = builderTest.sections.length;
    const letter = String.fromCharCode(65 + nextIdx);
    builderTest.sections.push({
        id: nextIdx,
        label: 'Problem Set ' + letter,
        layout: { columns: 2, spacing: 'normal' },
        instructions: '',
        questions: []
    });
    qb.activeSection = nextIdx;
    qbRenderSectionList();
    qbUpdateCounts();
    window.showToast('Section added', 'success');
}

export function removeSection(sIdx) {
    if (!builderTest || builderTest.sections.length <= 1) return;
    const section = builderTest.sections[sIdx];
    if (section.questions.length > 0 && !confirm(`Remove "${section.label}" with ${section.questions.length} question(s)?`)) return;

    builderTest.sections.splice(sIdx, 1);
    // Re-index
    builderTest.sections.forEach((s, i) => s.id = i);
    if (qb.activeSection >= builderTest.sections.length) qb.activeSection = builderTest.sections.length - 1;
    qb.collapsedSections = {};
    qbRenderSectionList();
    qbUpdateCounts();
    window.showToast('Section removed', 'success');
}

export function reorderSection(sIdx, dir) {
    if (!builderTest) return;
    const newIdx = sIdx + dir;
    if (newIdx < 0 || newIdx >= builderTest.sections.length) return;

    const sections = builderTest.sections;
    [sections[sIdx], sections[newIdx]] = [sections[newIdx], sections[sIdx]];
    sections.forEach((s, i) => s.id = i);
    if (qb.activeSection === sIdx) qb.activeSection = newIdx;
    else if (qb.activeSection === newIdx) qb.activeSection = sIdx;
    qbRenderSectionList();
}

export function setActiveSection(sIdx) {
    if (!builderTest || sIdx < 0 || sIdx >= builderTest.sections.length) return;
    qb.activeSection = sIdx;
    qbRenderSectionList();
    // Update preview widget label
    if (qb.previewSkill) {
        const { categoryId, skillId } = qb.previewSkill;
        qbGeneratePreview(categoryId, skillId);
    }
}

export function updateSectionLayout(sIdx, columns, spacing) {
    if (!builderTest || !builderTest.sections[sIdx]) return;
    builderTest.sections[sIdx].layout = { columns, spacing: spacing || 'normal' };
    qbRenderSectionList();
}

export function updateSectionLabel(sIdx, label) {
    if (!builderTest || !builderTest.sections[sIdx]) return;
    builderTest.sections[sIdx].label = label || 'Section ' + (sIdx + 1);
}

export function updateSectionInstructions(sIdx, text) {
    if (!builderTest || !builderTest.sections[sIdx]) return;
    builderTest.sections[sIdx].instructions = text || '';
}

export function toggleSectionCollapse(sIdx) {
    qb.collapsedSections[sIdx] = !qb.collapsedSections[sIdx];
    qbRenderSectionList();
}

export function shuffleSectionQuestions(sIdx) {
    if (!builderTest || !builderTest.sections[sIdx]) return;
    const section = builderTest.sections[sIdx];
    if (section.questions.length < 2) return;
    shuffle(section.questions);
    section.questions.forEach((q, i) => q.id = i);
    qbRenderSectionList();
    window.showToast(`${section.label} shuffled`, 'success');
}

export function moveQuestionToSection(fromSIdx, qIdx, toSIdx) {
    if (!builderTest) return;
    const fromSection = builderTest.sections[fromSIdx];
    const toSection = builderTest.sections[toSIdx];
    if (!fromSection || !toSection) return;

    const [q] = fromSection.questions.splice(qIdx, 1);
    toSection.questions.push(q);
    fromSection.questions.forEach((qq, i) => qq.id = i);
    toSection.questions.forEach((qq, i) => qq.id = i);
    qbRenderSectionList();
    qbUpdateCounts();
    window.showToast(`Moved to ${toSection.label}`, 'success');
}

// ========= QUESTION MANAGEMENT =========
export function addQuizQuestion(skillId) {
    addMultipleQuestions(skillId, 1);
}

export function addMultipleQuestions(skillId, count) {
    if (!builderTest) return;

    const catKey = findCategoryForSkill(skillId);
    if (!catKey) return;

    const section = builderTest.sections[qb.activeSection];
    if (!section) return;

    for (let i = 0; i < count; i++) {
        try {
            const qData = safeGenerateQuestion(catKey, skillId);
            if (qData) {
                section.questions.push({
                    id: section.questions.length,
                    skillId: skillId,
                    questionData: {
                        text: qData.text,
                        ans: qData.ans,
                        hint: qData.hint,
                        options: qData.options,
                        answerType: qData.answerType,
                        visual: qData.visual,
                        skillLabel: qData.skillLabel
                    },
                    points: 1
                });
            }
        } catch (e) {
            console.warn('Failed to generate question for', skillId, e);
        }
    }

    qbRenderSectionList();
    qbUpdateCounts();
    window.showToast(`Added ${count} question${count > 1 ? 's' : ''} to ${section.label}`, 'success');
}

export function regenerateQuizQuestion(sectionIdx, questionIdx) {
    if (!builderTest || !builderTest.sections[sectionIdx]) return;
    const q = builderTest.sections[sectionIdx].questions[questionIdx];
    if (!q) return;

    const catKey = findCategoryForSkill(q.skillId);
    if (!catKey) return;

    try {
        const qData = safeGenerateQuestion(catKey, q.skillId);
        if (qData) {
            q.questionData = {
                text: qData.text,
                ans: qData.ans,
                hint: qData.hint,
                options: qData.options,
                answerType: qData.answerType,
                visual: qData.visual,
                skillLabel: qData.skillLabel
            };
            qbRenderSectionList();
            window.showToast('Question regenerated', 'success');
        }
    } catch (e) {
        console.warn('Failed to regenerate question', e);
    }
}

export function duplicateQuizQuestion(sectionIdx, questionIdx) {
    if (!builderTest || !builderTest.sections[sectionIdx]) return;
    const section = builderTest.sections[sectionIdx];
    const q = section.questions[questionIdx];
    if (!q) return;

    const catKey = findCategoryForSkill(q.skillId);
    if (!catKey) return;

    try {
        const qData = safeGenerateQuestion(catKey, q.skillId);
        if (qData) {
            section.questions.splice(questionIdx + 1, 0, {
                id: section.questions.length,
                skillId: q.skillId,
                questionData: {
                    text: qData.text,
                    ans: qData.ans,
                    hint: qData.hint,
                    options: qData.options,
                    answerType: qData.answerType,
                    visual: qData.visual,
                    skillLabel: qData.skillLabel
                },
                points: q.points
            });
            section.questions.forEach((qq, i) => qq.id = i);
            qbRenderSectionList();
            qbUpdateCounts();
            window.showToast('Question duplicated', 'success');
        }
    } catch (e) {
        console.warn('Failed to duplicate question', e);
    }
}

export function removeQuizQuestion(sectionIdx, questionIdx) {
    if (!builderTest || !builderTest.sections[sectionIdx]) return;
    const section = builderTest.sections[sectionIdx];
    section.questions.splice(questionIdx, 1);
    section.questions.forEach((q, i) => q.id = i);
    qbRenderSectionList();
    qbUpdateCounts();
}

export function updateQuizQuestionPoints(sectionIdx, questionIdx, points) {
    if (!builderTest || !builderTest.sections[sectionIdx]) return;
    const q = builderTest.sections[sectionIdx].questions[questionIdx];
    if (q) {
        q.points = Math.max(1, points || 1);
        qbUpdateCounts();
    }
}

// ========= RENDER SECTION LIST =========
function qbRenderSectionList() {
    const list = document.getElementById('qbQuestionList');
    const empty = document.getElementById('qbEmptyQuestions');
    if (!list || !builderTest) return;

    const totalQs = getTotalQuestionCount(builderTest);

    if (totalQs === 0 && builderTest.sections.length <= 1) {
        list.innerHTML = '';
        if (empty) {
            empty.style.display = 'block';
            list.appendChild(empty);
        }
        return;
    }

    if (empty) empty.style.display = 'none';

    let html = '';
    let globalIdx = 0;

    for (let sIdx = 0; sIdx < builderTest.sections.length; sIdx++) {
        const section = builderTest.sections[sIdx];
        const isActive = sIdx === qb.activeSection;
        const isCollapsed = qb.collapsedSections[sIdx];
        const color = SECTION_COLORS[sIdx % SECTION_COLORS.length];
        const colLabel = section.layout.columns + '-col';

        html += `<div class="qb-section-group${isActive ? ' active' : ''}">`;

        // Section header
        html += `<div class="qb-section-header${isActive ? ' active' : ''}" style="--section-color:${color}" onclick="setActiveSection(${sIdx})">`;
        html += `<div class="qb-section-header-left">`;
        html += `<button class="qb-section-collapse" onclick="event.stopPropagation();toggleSectionCollapse(${sIdx})">${isCollapsed ? '&#9654;' : '&#9660;'}</button>`;
        html += `<input class="qb-section-label-input" value="${escHtml(section.label)}" onclick="event.stopPropagation()" onchange="updateSectionLabel(${sIdx}, this.value)" style="border-color:${color}">`;
        html += `<span class="qb-section-count">${section.questions.length} Q${section.questions.length !== 1 ? 's' : ''}</span>`;
        html += `<span class="qb-section-layout-badge">${colLabel}</span>`;
        html += `</div>`;
        html += `<div class="qb-section-actions" onclick="event.stopPropagation()">`;

        // Layout dropdown
        html += `<select class="qb-section-layout-select" onchange="updateSectionLayout(${sIdx}, parseInt(this.value), this.options[this.selectedIndex].dataset.spacing)">`;
        for (const preset of SECTION_LAYOUT_PRESETS) {
            const selected = section.layout.columns === preset.columns ? ' selected' : '';
            html += `<option value="${preset.columns}" data-spacing="${preset.spacing}"${selected}>${preset.icon} ${preset.name}</option>`;
        }
        html += `</select>`;

        html += `<button class="qb-q-btn" onclick="shuffleSectionQuestions(${sIdx})" title="Shuffle questions">&#x1f500;</button>`;
        if (sIdx > 0) html += `<button class="qb-q-btn" onclick="reorderSection(${sIdx}, -1)" title="Move up">&#x2B06;</button>`;
        if (sIdx < builderTest.sections.length - 1) html += `<button class="qb-q-btn" onclick="reorderSection(${sIdx}, 1)" title="Move down">&#x2B07;</button>`;
        if (builderTest.sections.length > 1) html += `<button class="qb-q-btn danger" onclick="removeSection(${sIdx})" title="Remove section">&#x2715;</button>`;
        html += `</div>`;
        html += `</div>`;

        // Section body (collapsible)
        if (!isCollapsed) {
            html += `<div class="qb-section-body">`;

            if (section.instructions) {
                html += `<div class="qb-section-instructions">${escHtml(section.instructions)}</div>`;
            }

            for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
                html += qbRenderQuestionCard(section.questions[qIdx], sIdx, qIdx, globalIdx);
                globalIdx++;
            }

            if (section.questions.length === 0) {
                html += `<div class="qb-section-empty">No questions. Click skills on the left to add.</div>`;
            }

            html += `</div>`;
        } else {
            globalIdx += section.questions.length;
        }

        html += `</div>`;
    }

    // Add Section button
    html += `<button class="qb-add-section-btn" onclick="addSection()">+ Add Section</button>`;

    list.innerHTML = html;
}

function qbRenderQuestionCard(q, sectionIdx, localIdx, globalIdx) {
    const label = getSkillLabel(q.skillId);
    const grade = getSkillGrade(q.skillId, null);
    const gc = grade != null ? (GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' }) : null;

    let html = `<div class="qb-question-card" data-section="${sectionIdx}" data-index="${localIdx}">`;

    // Header row
    html += `<div class="qb-q-header">`;
    html += `<span class="qb-q-num">Q${globalIdx + 1}</span>`;
    if (gc) html += `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text};width:18px;height:18px;font-size:0.6rem;">${grade}</span>`;
    html += `<span class="qb-q-skill">${escHtml(label)}</span>`;
    html += `<div class="qb-q-points">`;
    html += `<input type="number" value="${q.points || 1}" min="1" max="100" onchange="updateQuizQuestionPoints(${sectionIdx}, ${localIdx}, parseInt(this.value))"> pts`;
    html += `</div></div>`;

    // Visual preview
    html += `<div class="qb-q-preview">`;
    if (q.questionData.text) {
        html += `<div class="qb-q-text">${q.questionData.text}</div>`;
    }
    if (q.questionData.visual) {
        html += `<div class="qb-q-visual">${q.questionData.visual}</div>`;
    }
    if (q.questionData.options && q.questionData.options.length > 0) {
        html += `<div class="qb-q-options">`;
        for (const opt of q.questionData.options) {
            const isCorrect = String(opt) === String(q.questionData.ans);
            html += `<span class="qb-q-option${isCorrect ? ' correct' : ''}">${opt}</span>`;
        }
        html += `</div>`;
    }
    html += `<div class="qb-q-answer">Answer: ${q.questionData.ans}</div>`;
    html += `</div>`;

    // Actions row
    html += `<div class="qb-q-actions">`;
    html += `<button class="qb-q-btn regen" onclick="regenerateQuizQuestion(${sectionIdx}, ${localIdx})">&#x1f504; Regen</button>`;
    html += `<button class="qb-q-btn duplicate" onclick="duplicateQuizQuestion(${sectionIdx}, ${localIdx})">&#x2795; Dup</button>`;

    // Move to section dropdown (only if multiple sections)
    if (builderTest.sections.length > 1) {
        html += `<select class="qb-q-btn" onchange="if(this.value!=='')moveQuestionToSection(${sectionIdx},${localIdx},parseInt(this.value));this.value=''" style="max-width:80px;">`;
        html += `<option value="">Move...</option>`;
        for (let s = 0; s < builderTest.sections.length; s++) {
            if (s !== sectionIdx) {
                html += `<option value="${s}">${escHtml(builderTest.sections[s].label)}</option>`;
            }
        }
        html += `</select>`;
    }

    html += `<button class="qb-q-btn danger" onclick="removeQuizQuestion(${sectionIdx}, ${localIdx})">&#x2715;</button>`;
    html += `</div>`;

    html += `</div>`;
    return html;
}

// ========= UPDATE COUNTS & BUTTONS =========
function qbUpdateCounts() {
    if (!builderTest) return;

    const allQs = getAllQuestionsFlat(builderTest);
    const count = allQs.length;
    const points = allQs.reduce((s, item) => s + (item.question.points || 1), 0);

    const countEl = document.getElementById('qbQuestionCount');
    if (countEl) countEl.textContent = count;

    const pointsEl = document.getElementById('qbTotalPoints');
    if (pointsEl) pointsEl.textContent = `${points} points`;

    const toolbarInfo = document.getElementById('qbToolbarInfo');
    if (toolbarInfo) toolbarInfo.textContent = `${count} question${count !== 1 ? 's' : ''} \u00B7 ${points} total points`;

    const countWrap = document.getElementById('qbHeaderCount');
    if (countWrap) countWrap.style.display = count > 0 ? 'flex' : 'none';

    const badge = document.getElementById('qbHeaderCountBadge');
    if (badge) badge.textContent = count;

    const hasQuestions = count > 0;
    ['qbShareBtn', 'qbPrintBtn', 'qbPreviewBtn', 'qbExportBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !hasQuestions;
    });

    const resultsBtn = document.getElementById('qbResultsBtn');
    if (resultsBtn) resultsBtn.disabled = !builderTest.id;
}

// ========= SETTINGS =========
export function updateQuizName(name) {
    if (!builderTest) return;
    builderTest.name = name || 'Untitled Quiz';
}

export function updateQuizSetting(key, value) {
    if (!builderTest) return;
    builderTest.settings[key] = value;
    // Re-render settings if shuffle/versions changed (to show/hide dependent fields)
    if (key === 'shuffleWithinSections') qbRenderSettings();
}

export function openQuizSettings() {
    const overlay = document.getElementById('quizSettingsOverlay');
    if (overlay) overlay.classList.add('active');
    qbRenderSettings();
}

export function closeQuizSettings() {
    const overlay = document.getElementById('quizSettingsOverlay');
    if (overlay) overlay.classList.remove('active');
}

function qbRenderSettings() {
    const container = document.getElementById('qbSettingsContent');
    if (!container || !builderTest) return;

    const s = builderTest.settings;
    container.innerHTML = `
        <div class="qb-setting-row">
            <span class="qb-setting-label">Time Limit</span>
            <select class="qb-setting-input" onchange="updateQuizSetting('timeLimit', this.value === '0' ? null : parseInt(this.value))">
                <option value="0" ${!s.timeLimit ? 'selected' : ''}>No Limit</option>
                <option value="5" ${s.timeLimit === 5 ? 'selected' : ''}>5 minutes</option>
                <option value="10" ${s.timeLimit === 10 ? 'selected' : ''}>10 minutes</option>
                <option value="15" ${s.timeLimit === 15 ? 'selected' : ''}>15 minutes</option>
                <option value="20" ${s.timeLimit === 20 ? 'selected' : ''}>20 minutes</option>
                <option value="30" ${s.timeLimit === 30 ? 'selected' : ''}>30 minutes</option>
                <option value="45" ${s.timeLimit === 45 ? 'selected' : ''}>45 minutes</option>
                <option value="60" ${s.timeLimit === 60 ? 'selected' : ''}>60 minutes</option>
            </select>
        </div>
        <div class="qb-setting-row">
            <span class="qb-setting-label">Section Mode (Online)</span>
            <select class="qb-setting-input" onchange="updateQuizSetting('sectionMode', this.value)">
                <option value="sequential" ${s.sectionMode === 'sequential' ? 'selected' : ''}>Sequential (section by section)</option>
                <option value="mixed" ${s.sectionMode === 'mixed' ? 'selected' : ''}>Mixed (all questions shuffled)</option>
            </select>
        </div>
        <div class="qb-setting-row">
            <span class="qb-setting-label">Randomize Order</span>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" ${s.randomOrder ? 'checked' : ''} onchange="updateQuizSetting('randomOrder', this.checked)">
                <span style="font-size:0.85rem;">Shuffle per student</span>
            </label>
        </div>
        <div class="qb-setting-row">
            <span class="qb-setting-label">Show Feedback</span>
            <select class="qb-setting-input" onchange="updateQuizSetting('showFeedback', this.value)">
                <option value="instant" ${s.showFeedback === 'instant' ? 'selected' : ''}>After each question</option>
                <option value="end" ${s.showFeedback === 'end' ? 'selected' : ''}>After submission</option>
                <option value="none" ${s.showFeedback === 'none' ? 'selected' : ''}>Score only</option>
            </select>
        </div>
        <div class="qb-setting-row">
            <span class="qb-setting-label">Passing Score</span>
            <div style="display:flex;align-items:center;gap:6px;">
                <input type="number" class="qb-setting-input" value="${s.passingScore}" min="0" max="100" style="width:70px;" onchange="updateQuizSetting('passingScore', parseInt(this.value))">
                <span style="font-size:0.85rem;">%</span>
            </div>
        </div>
        <div class="qb-setting-row">
            <span class="qb-setting-label">Shuffle for Print</span>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" ${s.shuffleWithinSections ? 'checked' : ''} onchange="updateQuizSetting('shuffleWithinSections', this.checked)">
                <span style="font-size:0.85rem;">Shuffle questions within sections</span>
            </label>
        </div>
        <div class="qb-setting-row" ${!s.shuffleWithinSections ? 'style="opacity:0.4;pointer-events:none;"' : ''}>
            <span class="qb-setting-label">Print Versions</span>
            <select class="qb-setting-input" onchange="updateQuizSetting('printVersions', parseInt(this.value))">
                ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${s.printVersions === n ? 'selected' : ''}>${n} version${n > 1 ? 's' : ''}</option>`).join('')}
            </select>
        </div>
    `;
}

// ========= PREVIEW MODAL =========
export function openQuizPreview() {
    if (!builderTest || getTotalQuestionCount(builderTest) === 0) return;
    const overlay = document.getElementById('quizPreviewOverlay');
    if (overlay) overlay.classList.add('active');
    switchPreviewTab('screen');
}

export function closeQuizPreview() {
    const overlay = document.getElementById('quizPreviewOverlay');
    if (overlay) overlay.classList.remove('active');
}

export function switchPreviewTab(tab) {
    document.getElementById('previewTabScreen')?.classList.toggle('active', tab === 'screen');
    document.getElementById('previewTabPrint')?.classList.toggle('active', tab === 'print');

    if (tab === 'screen') renderScreenPreview();
    else renderPrintPreview();
}

function renderScreenPreview() {
    const body = document.getElementById('quizPreviewBody');
    const footer = document.getElementById('quizPreviewFooter');
    if (!body || !builderTest) return;

    let html = '<div class="qb-screen-preview">';
    html += `<h3 style="margin:0 0 12px;">${escHtml(builderTest.name)}</h3>`;
    let globalIdx = 0;

    for (const section of builderTest.sections) {
        const cols = section.layout.columns;
        html += `<div class="qb-screen-section">`;
        html += `<div class="qb-screen-section-header">${escHtml(section.label)}</div>`;
        if (section.instructions) {
            html += `<div class="qb-screen-section-instructions">${escHtml(section.instructions)}</div>`;
        }

        // Use grid layout for compact sections (3+ columns)
        if (cols >= 3) {
            const spacing = SPACING_MAP[section.layout.spacing] || SPACING_MAP.normal;
            html += `<div style="display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:${spacing}">`;
        }

        for (const q of section.questions) {
            globalIdx++;
            const qd = q.questionData;
            const factHtml = cols >= 3 ? formatFactForPrint(qd.text, globalIdx, cols) : null;

            if (factHtml) {
                html += `<div class="qb-screen-question" style="text-align:center;padding:6px 4px;">`;
                html += `<div style="font-weight:700;font-size:${cols >= 8 ? '0.65rem' : '0.8rem'};margin-bottom:2px;color:var(--accent-purple);">${globalIdx}.</div>`;
                html += factHtml;
                html += `</div>`;
            } else {
                html += `<div class="qb-screen-question">`;
                html += `<span class="qb-screen-q-num">Q${globalIdx}.</span> `;
                html += `<span>${qd.text || ''}</span>`;
                if (qd.visual) html += `<div class="qb-screen-q-visual">${qd.visual}</div>`;
                if (qd.options && qd.options.length > 0 && qd.answerType === 'multiple-choice') {
                    html += `<div class="qb-screen-q-options">`;
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    qd.options.forEach((opt, j) => {
                        html += `<span class="qb-screen-q-option">${letters[j] || (j + 1)}. ${escHtml(String(opt))}</span>`;
                    });
                    html += `</div>`;
                } else {
                    html += `<div class="qb-screen-q-answer-line">___________</div>`;
                }
                html += `</div>`;
            }
        }

        if (cols >= 3) html += `</div>`;
        html += `</div>`;
    }

    html += '</div>';
    body.innerHTML = html;
    if (footer) footer.innerHTML = '';
}

function renderPrintPreview() {
    const body = document.getElementById('quizPreviewBody');
    const footer = document.getElementById('quizPreviewFooter');
    if (!body || !builderTest) return;

    let html = '<div class="qb-print-page">';

    // Header
    html += `<div class="qb-print-header">`;
    html += `<h2 style="margin:0 0 4px;font-size:1.3rem;">${escHtml(builderTest.name)}</h2>`;
    html += `<div style="font-size:0.85rem;color:#666;">Name: _____________ Date: _________</div>`;
    const totalQs = getTotalQuestionCount(builderTest);
    const totalPts = getAllQuestionsFlat(builderTest).reduce((s, item) => s + (item.question.points || 1), 0);
    html += `<div style="font-size:0.8rem;color:#999;margin-top:2px;">${totalQs} Questions &middot; ${totalPts} Points</div>`;
    html += `</div>`;

    let globalIdx = 0;

    for (const section of builderTest.sections) {
        const cols = section.layout.columns;
        const spacing = SPACING_MAP[section.layout.spacing] || SPACING_MAP.normal;

        html += `<div class="qb-print-section">`;
        html += `<div class="qb-print-section-header">${escHtml(section.label)}</div>`;
        if (section.instructions) {
            html += `<div style="font-size:0.82rem;color:#555;margin-bottom:8px;font-style:italic;">${escHtml(section.instructions)}</div>`;
        }
        html += `<div class="qb-print-section-grid" style="grid-template-columns:repeat(${cols}, 1fr);gap:${spacing}">`;

        for (const q of section.questions) {
            globalIdx++;
            const qd = q.questionData;

            // For compact sections (3+ columns), try worksheet-style formatting
            const factHtml = cols >= 3 ? formatFactForPrint(qd.text, globalIdx, cols) : null;

            if (factHtml) {
                // Worksheet-style: number + formatted math
                html += `<div class="qb-print-question" style="text-align:center;">`;
                html += `<div style="font-weight:700;font-size:${cols >= 8 ? '0.65rem' : '0.8rem'};margin-bottom:2px;">${globalIdx}.</div>`;
                html += factHtml;
                if (cols < 10) {
                    html += `<div style="min-height:16px;"></div>`;
                }
                html += `</div>`;
            } else {
                // Standard text format for word problems, visuals, etc.
                html += `<div class="qb-print-question">`;
                html += `<strong style="color:#8b5cf6;">Q${globalIdx}.</strong> `;
                html += `${qd.text || ''}`;
                if (cols <= 2 && qd.visual) {
                    html += `<div style="margin:4px 0;">${qd.visual}</div>`;
                }
                if (qd.options && qd.options.length > 0 && qd.answerType === 'multiple-choice') {
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px;font-size:0.8rem;">`;
                    qd.options.forEach((opt, j) => {
                        html += `<span>${letters[j] || (j + 1)}. ${escHtml(String(opt))}</span>`;
                    });
                    html += `</div>`;
                } else {
                    html += `<div style="border-bottom:1px solid #ccc;margin-top:6px;width:80%;height:18px;"></div>`;
                }
                html += `</div>`;
            }
        }

        html += `</div></div>`;
    }

    html += '</div>';
    body.innerHTML = html;

    if (footer) {
        footer.innerHTML = `<button class="qb-toolbar-btn print" onclick="printQuiz()">Print</button>`;
    }
}

// ========= SAVE / EXPORT / SHARE / PRINT =========
export async function saveQuiz() {
    if (!builderTest) return;
    const saved = await saveTest(builderTest);
    builderTest = saved;
    qbUpdateCounts();
    window.showToast('Quiz saved!', 'success');
}

export async function generateQuizLink() {
    if (!builderTest || getTotalQuestionCount(builderTest) === 0) return;
    await saveQuiz();
    const compressed = compressTestForURL(builderTest);
    const url = window.location.origin + window.location.pathname + '?quiz=' + compressed;
    if (url.length > 8000) {
        window.showToast('Quiz too large for URL. Use Export JSON instead.', 'error');
        return;
    }
    try {
        await navigator.clipboard.writeText(url);
        window.showToast('Student link copied to clipboard!', 'success');
    } catch (e) {
        prompt('Copy this student link:', url);
    }
}

export function printQuiz() {
    if (!builderTest || getTotalQuestionCount(builderTest) === 0) return;
    if (typeof window.printQuizTest === 'function') {
        window.printQuizTest(builderTest, {
            includeAnswerKey: true,
            includeNameField: true,
            shuffleWithinSections: builderTest.settings.shuffleWithinSections,
            printVersions: builderTest.settings.printVersions || 1
        });
    }
}

export async function exportQuiz() {
    if (!builderTest) return;
    await saveQuiz();
    const json = await exportTestJSON(builderTest.id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (builderTest.name || 'quiz') + '.json';
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('Quiz exported!', 'success');
}

export async function importQuizFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
            await importTestJSON(text);
            window.showToast('Quiz imported!', 'success');
            openMyQuizzes();
        } catch (err) {
            window.showToast('Invalid quiz file', 'error');
        }
    };
    input.click();
}

// ========= LEGACY HANDLERS =========
export function handleQuizSkillSearch(query) {
    qbSearchInput(query);
}

export function selectQuizSkill(skillId) {
    const catKey = findCategoryForSkill(skillId);
    if (catKey) qbPreviewClick(catKey, skillId);
}

export function addSelectedQuestions() {
    qbAddFromPreview();
}
