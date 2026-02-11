// Quiz Builder — Teacher-facing test creation UI
// 3-panel layout: Skill Grid | Preview + Add | Question List
// Layer 4: depends on state, data, quiz-storage, generate-question

import { state } from './state.js';
import { DOMAINS, SKILLS, GRADE_COLORS, getSkillGrade, gradeCircleHTML, sortByGrade } from './data.js';
import { saveTest, loadTest, listTests, deleteTest, exportTestJSON, importTestJSON, compressTestForURL } from './quiz-storage.js';

// ========= MODULE STATE =========
const qb = {
    initialized: false,
    activeDomain: null,
    activeCategory: null,
    activeGrades: new Set(),
    searchText: '',
    previewSkill: null,       // { categoryId, skillId }
    previewCache: new Map(),
    cacheOrder: [],
    maxCacheSize: 50,
    previewDebounceTimer: null,
};

let builderTest = null;

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
        questions: [],
        settings: {
            timeLimit: null,
            randomOrder: false,
            showFeedback: 'end',
            allowRetry: false,
            passingScore: 70
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
            showBuilder();
        });
    } else {
        builderTest = createNewTest();
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

    // Update quiz name input
    const nameInput = document.getElementById('quizNameInput');
    if (nameInput) nameInput.value = builderTest.name || 'Untitled Quiz';

    // Render settings content
    qbRenderSettings();
    qbRenderQuestionList();
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
        container.innerHTML = tests.map(t => `
            <div class="qb-quiz-item">
                <div>
                    <div class="qb-quiz-item-name">${escHtml(t.name)}</div>
                    <div class="qb-quiz-item-meta">${t.questions.length} question${t.questions.length !== 1 ? 's' : ''} &middot; ${new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="qb-quiz-item-actions">
                    <button class="qb-q-btn" onclick="openQuizBuilder('${t.id}')">Edit</button>
                    <button class="qb-q-btn" onclick="showQuizResults('${t.id}')">Results</button>
                    <button class="qb-q-btn danger" onclick="confirmDeleteQuiz('${t.id}')">Delete</button>
                </div>
            </div>
        `).join('');
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
            pill.style.borderColor = 'var(--bg-card-light)';
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
            pill.style.borderColor = 'var(--bg-card-light)';
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

    // Highlight clicked card
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
        return;
    }

    let html = `<div class="qb-preview-skill-label">
        ${gc ? `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>` : ''}
        ${escHtml(label)}
    </div>`;

    // Question preview
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

    // Add questions widget
    html += `<div class="qb-add-widget">`;
    html += `<span class="qb-add-widget-label">Add to quiz:</span>`;
    html += `<div class="qb-add-widget-controls">`;
    html += `<input type="number" id="qbAddNum" value="1" min="1" max="50" class="qb-add-num-input">`;
    html += `<button class="qb-add-widget-btn" onclick="qbAddFromPreview()">+ Add</button>`;
    html += `</div>`;
    html += `</div>`;

    panel.innerHTML = html;
}

export function qbAddFromPreview() {
    if (!qb.previewSkill || !builderTest) return;
    const { categoryId, skillId } = qb.previewSkill;
    const count = parseInt(document.getElementById('qbAddNum')?.value || '1');
    addMultipleQuestions(skillId, Math.max(1, Math.min(count, 50)));
}

// ========= QUESTION MANAGEMENT =========
export function addQuizQuestion(skillId) {
    addMultipleQuestions(skillId, 1);
}

export function addMultipleQuestions(skillId, count) {
    if (!builderTest) return;

    const catKey = findCategoryForSkill(skillId);
    if (!catKey) return;

    for (let i = 0; i < count; i++) {
        try {
            const qData = safeGenerateQuestion(catKey, skillId);
            if (qData) {
                builderTest.questions.push({
                    id: builderTest.questions.length,
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

    qbRenderQuestionList();
    qbUpdateCounts();
    window.showToast(`Added ${count} question${count > 1 ? 's' : ''}`, 'success');
}

export function regenerateQuizQuestion(index) {
    if (!builderTest || !builderTest.questions[index]) return;
    const q = builderTest.questions[index];

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
            qbRenderQuestionList();
            window.showToast('Question regenerated', 'success');
        }
    } catch (e) {
        console.warn('Failed to regenerate question', e);
    }
}

export function removeQuizQuestion(index) {
    if (!builderTest) return;
    builderTest.questions.splice(index, 1);
    builderTest.questions.forEach((q, i) => q.id = i);
    qbRenderQuestionList();
    qbUpdateCounts();
}

export function updateQuizQuestionPoints(index, points) {
    if (!builderTest || !builderTest.questions[index]) return;
    builderTest.questions[index].points = Math.max(1, points || 1);
    qbUpdateCounts();
}

// ========= RENDER QUESTION LIST (with visual previews) =========
function qbRenderQuestionList() {
    const list = document.getElementById('qbQuestionList');
    const empty = document.getElementById('qbEmptyQuestions');
    if (!list || !builderTest) return;

    if (builderTest.questions.length === 0) {
        list.innerHTML = '';
        if (empty) {
            empty.style.display = 'block';
            list.appendChild(empty);
        }
        return;
    }

    if (empty) empty.style.display = 'none';

    let html = '';
    for (let i = 0; i < builderTest.questions.length; i++) {
        html += qbRenderQuestionCard(builderTest.questions[i], i);
    }
    list.innerHTML = html;
}

function qbRenderQuestionCard(q, index) {
    const label = getSkillLabel(q.skillId);
    const grade = getSkillGrade(q.skillId, null);
    const gc = grade != null ? (GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' }) : null;

    let html = `<div class="qb-question-card" data-index="${index}">`;

    // Header row
    html += `<div class="qb-q-header">`;
    html += `<span class="qb-q-num">Q${index + 1}</span>`;
    if (gc) html += `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text};width:18px;height:18px;font-size:0.6rem;">${grade}</span>`;
    html += `<span class="qb-q-skill">${escHtml(label)}</span>`;
    html += `<div class="qb-q-points">`;
    html += `<input type="number" value="${q.points || 1}" min="1" max="100" onchange="updateQuizQuestionPoints(${index}, parseInt(this.value))"> pts`;
    html += `</div></div>`;

    // Visual preview of the question
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
    html += `<button class="qb-q-btn regen" onclick="regenerateQuizQuestion(${index})">&#x1f504; Regen</button>`;
    html += `<button class="qb-q-btn danger" onclick="removeQuizQuestion(${index})">&#x2715; Remove</button>`;
    html += `</div>`;

    html += `</div>`;
    return html;
}

// ========= UPDATE COUNTS & BUTTONS =========
function qbUpdateCounts() {
    if (!builderTest) return;

    const count = builderTest.questions.length;
    const points = builderTest.questions.reduce((s, q) => s + (q.points || 1), 0);

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
    ['qbShareBtn', 'qbPrintBtn', 'qbExportBtn'].forEach(id => {
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
    `;
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
    if (!builderTest || builderTest.questions.length === 0) return;
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
    if (!builderTest || builderTest.questions.length === 0) return;
    if (typeof window.printQuizTest === 'function') {
        window.printQuizTest(builderTest, { includeAnswerKey: true, includeNameField: true });
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

// ========= LEGACY HANDLERS (kept for backward compatibility) =========
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
