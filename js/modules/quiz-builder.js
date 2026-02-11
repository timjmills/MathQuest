// Quiz Builder — Teacher-facing test creation UI
// Layer 4: depends on state, data, utils, quiz-storage, generate-question, ui-core, skill-search

import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';
import { shuffle } from './utils.js';
import { saveTest, loadTest, listTests, deleteTest, exportTestJSON, importTestJSON, compressTestForURL } from './quiz-storage.js';

let builderTest = null;  // current test being edited
let builderSkillIndex = null; // skill search index for builder
let selectedSkillId = null; // currently selected skill in picker

function getSkillLabel(skillId) {
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) return sk.l;
        }
    }
    return skillId;
}

function buildSkillSearchIndex() {
    if (builderSkillIndex) return builderSkillIndex;
    builderSkillIndex = [];
    for (const [domKey, dom] of Object.entries(DOMAINS)) {
        for (const cat of dom.categories) {
            if (cat.id.endsWith('_mixed')) continue;
            const skills = SKILLS[cat.id] || [];
            for (const sk of skills) {
                if (sk.v.startsWith('mixed_') || sk.v.endsWith('_mixed') || sk.v === 'all_mixed' || sk.v === 'custom_mixed') continue;
                builderSkillIndex.push({
                    id: sk.v,
                    label: sk.l,
                    category: cat.name,
                    domain: dom.name,
                    domainIcon: dom.icon,
                    searchText: (sk.l + ' ' + cat.name + ' ' + dom.name).toLowerCase()
                });
            }
        }
    }
    return builderSkillIndex;
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

// ---- Public API ----

export function openQuizBuilder(testId) {
    if (testId) {
        loadTest(testId).then(test => {
            builderTest = test || createNewTest();
            renderBuilder();
        });
    } else {
        builderTest = createNewTest();
        renderBuilder();
    }
    window.showView('quizBuilderView');
}

export async function openMyQuizzes() {
    const tests = await listTests();
    const container = document.getElementById('quizBuilderView');
    if (!container) return;
    container.innerHTML = `
        <div class="quiz-header">
            <h2>My Quizzes</h2>
            <div class="quiz-header-actions">
                <button class="qb-toolbar-btn primary" onclick="openQuizBuilder()">+ New Quiz</button>
                <button class="qb-toolbar-btn import" onclick="importQuizFile()">Import JSON</button>
                <button class="btn btn-sm btn-secondary" onclick="showView('homeView')">Back</button>
            </div>
        </div>
        <div class="qb-quiz-list" id="quizListContainer">
            ${tests.length === 0 ? '<div class="qb-empty">No quizzes yet. Create your first one!</div>' :
            tests.map(t => `
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
            `).join('')}
        </div>
    `;
    window.showView('quizBuilderView');
}

export async function confirmDeleteQuiz(id) {
    if (!confirm('Delete this quiz and all its results?')) return;
    await deleteTest(id);
    openMyQuizzes();
}

function renderBuilder() {
    const container = document.getElementById('quizBuilderView');
    if (!container || !builderTest) return;

    const totalPoints = builderTest.questions.reduce((s, q) => s + (q.points || 1), 0);

    container.innerHTML = `
        <div class="quiz-header">
            <div style="display:flex;align-items:center;gap:10px;flex:1;">
                <button class="btn btn-sm btn-secondary" onclick="openMyQuizzes()">← Back</button>
                <input type="text" id="quizNameInput" value="${escHtml(builderTest.name)}"
                    style="font-size:1.1rem;font-weight:800;border:none;background:transparent;color:var(--text-bright);flex:1;min-width:120px;padding:4px 8px;"
                    onchange="updateQuizName(this.value)" placeholder="Quiz name...">
            </div>
            <div class="quiz-header-actions">
                <button class="qb-toolbar-btn primary" onclick="saveQuiz()">Save</button>
            </div>
        </div>
        <div class="qb-layout">
            <div class="qb-picker">
                <div class="qb-picker-title">Add Questions</div>
                <input type="text" class="qb-search" id="qbSkillSearch" placeholder="Search skills..."
                    oninput="handleQuizSkillSearch(this.value)">
                <div id="qbSearchResults" class="qb-search-results" style="display:none;"></div>
                <div class="qb-add-count" id="qbAddCount" style="display:none;">
                    <span style="font-size:0.85rem;font-weight:600;">Add</span>
                    <input type="number" id="qbAddNum" value="1" min="1" max="50">
                    <span style="font-size:0.85rem;">questions</span>
                    <button class="qb-q-btn regen" onclick="addSelectedQuestions()">Add</button>
                </div>
                <div id="qbSkillBrowser"></div>
            </div>
            <div class="qb-questions">
                <div class="qb-questions-title">
                    <span>Questions (${builderTest.questions.length})</span>
                    <span style="font-size:0.85rem;color:var(--text-dim);">${totalPoints} points</span>
                </div>
                <div id="qbQuestionList">
                    ${builderTest.questions.length === 0
                        ? '<div class="qb-empty">No questions yet. Search or browse skills on the left to add questions.</div>'
                        : builderTest.questions.map((q, i) => renderQuestionCard(q, i)).join('')}
                </div>
            </div>
        </div>
        <div class="qb-toolbar">
            <div class="qb-toolbar-info">
                ${builderTest.questions.length} question${builderTest.questions.length !== 1 ? 's' : ''} &middot; ${totalPoints} total points
            </div>
            <div class="qb-toolbar-actions">
                <button class="qb-toolbar-btn settings" onclick="openQuizSettings()">Settings</button>
                <button class="qb-toolbar-btn share" onclick="generateQuizLink()" ${builderTest.questions.length === 0 ? 'disabled' : ''}>Share Link</button>
                <button class="qb-toolbar-btn print" onclick="printQuiz()" ${builderTest.questions.length === 0 ? 'disabled' : ''}>Print</button>
                <button class="qb-toolbar-btn export" onclick="exportQuiz()" ${builderTest.questions.length === 0 ? 'disabled' : ''}>Export JSON</button>
                <button class="qb-toolbar-btn results" onclick="showQuizResults('${builderTest.id || ''}')" ${!builderTest.id ? 'disabled' : ''}>Results</button>
            </div>
        </div>
        <div class="qb-settings-overlay" id="quizSettingsOverlay">
            <div class="qb-settings-panel">
                <h3>Quiz Settings</h3>
                <div class="qb-setting-row">
                    <span class="qb-setting-label">Time Limit</span>
                    <select class="qb-setting-input" id="qbTimeLimit" onchange="updateQuizSetting('timeLimit', this.value === '0' ? null : parseInt(this.value))">
                        <option value="0" ${!builderTest.settings.timeLimit ? 'selected' : ''}>No Limit</option>
                        <option value="5" ${builderTest.settings.timeLimit === 5 ? 'selected' : ''}>5 minutes</option>
                        <option value="10" ${builderTest.settings.timeLimit === 10 ? 'selected' : ''}>10 minutes</option>
                        <option value="15" ${builderTest.settings.timeLimit === 15 ? 'selected' : ''}>15 minutes</option>
                        <option value="20" ${builderTest.settings.timeLimit === 20 ? 'selected' : ''}>20 minutes</option>
                        <option value="30" ${builderTest.settings.timeLimit === 30 ? 'selected' : ''}>30 minutes</option>
                        <option value="45" ${builderTest.settings.timeLimit === 45 ? 'selected' : ''}>45 minutes</option>
                        <option value="60" ${builderTest.settings.timeLimit === 60 ? 'selected' : ''}>60 minutes</option>
                    </select>
                </div>
                <div class="qb-setting-row">
                    <span class="qb-setting-label">Randomize Order</span>
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" id="qbRandomOrder" ${builderTest.settings.randomOrder ? 'checked' : ''} onchange="updateQuizSetting('randomOrder', this.checked)">
                        <span style="font-size:0.85rem;">Shuffle question order per student</span>
                    </label>
                </div>
                <div class="qb-setting-row">
                    <span class="qb-setting-label">Show Feedback</span>
                    <select class="qb-setting-input" id="qbFeedback" onchange="updateQuizSetting('showFeedback', this.value)">
                        <option value="instant" ${builderTest.settings.showFeedback === 'instant' ? 'selected' : ''}>After each question</option>
                        <option value="end" ${builderTest.settings.showFeedback === 'end' ? 'selected' : ''}>After submission</option>
                        <option value="none" ${builderTest.settings.showFeedback === 'none' ? 'selected' : ''}>Score only</option>
                    </select>
                </div>
                <div class="qb-setting-row">
                    <span class="qb-setting-label">Passing Score</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <input type="number" class="qb-setting-input" id="qbPassScore" value="${builderTest.settings.passingScore}" min="0" max="100" style="width:70px;" onchange="updateQuizSetting('passingScore', parseInt(this.value))">
                        <span style="font-size:0.85rem;">%</span>
                    </div>
                </div>
                <div style="text-align:right;margin-top:16px;">
                    <button class="qb-toolbar-btn primary" onclick="closeQuizSettings()">Done</button>
                </div>
            </div>
        </div>
    `;

    renderSkillBrowser();
}

function renderQuestionCard(q, index) {
    const label = getSkillLabel(q.skillId);
    // Strip HTML for preview text
    let preview = q.questionData.text || '';
    preview = preview.replace(/<[^>]*>/g, '').substring(0, 100);
    if (preview.length >= 100) preview += '...';

    return `
        <div class="qb-question-card" data-index="${index}">
            <div class="qb-q-header">
                <span class="qb-q-num">Q${index + 1}</span>
                <span class="qb-q-skill">${escHtml(label)}</span>
                <div class="qb-q-points">
                    <input type="number" value="${q.points || 1}" min="1" max="100"
                        onchange="updateQuizQuestionPoints(${index}, parseInt(this.value))"> pts
                </div>
            </div>
            <div class="qb-q-text">${preview || '<em>Visual question</em>'}</div>
            <div class="qb-q-actions">
                <button class="qb-q-btn regen" onclick="regenerateQuizQuestion(${index})">Regen</button>
                <button class="qb-q-btn danger" onclick="removeQuizQuestion(${index})">Remove</button>
            </div>
        </div>
    `;
}

function renderSkillBrowser() {
    const container = document.getElementById('qbSkillBrowser');
    if (!container) return;

    let html = '';
    for (const [domKey, dom] of Object.entries(DOMAINS)) {
        html += `<div style="margin-top:12px;">
            <div style="font-weight:700;font-size:0.85rem;color:var(--accent-cyan);margin-bottom:4px;">${dom.icon} ${dom.name}</div>`;
        for (const cat of dom.categories) {
            if (cat.id.endsWith('_mixed')) continue;
            const skills = SKILLS[cat.id] || [];
            const playableSkills = skills.filter(s => !s.v.startsWith('mixed_') && !s.v.endsWith('_mixed') && s.v !== 'all_mixed' && s.v !== 'custom_mixed');
            if (playableSkills.length === 0) continue;
            html += `<div style="margin-left:8px;margin-bottom:6px;">
                <div style="font-size:0.8rem;font-weight:600;color:var(--text-dim);margin-bottom:2px;">${cat.name}</div>`;
            for (const sk of playableSkills) {
                html += `<div class="qb-search-item" onclick="selectQuizSkill('${sk.v}')" style="margin-left:4px;padding:5px 8px;font-size:0.8rem;">
                    ${escHtml(sk.l)}
                </div>`;
            }
            html += '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

export function handleQuizSkillSearch(query) {
    const resultsDiv = document.getElementById('qbSearchResults');
    if (!resultsDiv) return;

    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    const index = buildSkillSearchIndex();
    const q = query.toLowerCase();
    const matches = index.filter(s => s.searchText.includes(q)).slice(0, 20);

    if (matches.length === 0) {
        resultsDiv.style.display = 'none';
        return;
    }

    resultsDiv.innerHTML = matches.map(s => `
        <div class="qb-search-item" onclick="selectQuizSkill('${s.id}')">
            <span>${escHtml(s.label)}</span>
            <span style="font-size:0.7rem;color:var(--text-dim);">${s.category}</span>
        </div>
    `).join('');
    resultsDiv.style.display = 'block';
}

export function selectQuizSkill(skillId) {
    selectedSkillId = skillId;
    const addCount = document.getElementById('qbAddCount');
    const searchResults = document.getElementById('qbSearchResults');
    if (addCount) {
        addCount.style.display = 'flex';
        const label = getSkillLabel(skillId);
        addCount.querySelector('span').textContent = `Add "${label}"`;
    }
    if (searchResults) searchResults.style.display = 'none';
    const searchInput = document.getElementById('qbSkillSearch');
    if (searchInput) searchInput.value = getSkillLabel(skillId);
}

export function addSelectedQuestions() {
    if (!selectedSkillId || !builderTest) return;
    const count = parseInt(document.getElementById('qbAddNum')?.value || '1');
    addMultipleQuestions(selectedSkillId, Math.max(1, Math.min(count, 50)));
}

export function addQuizQuestion(skillId) {
    addMultipleQuestions(skillId, 1);
}

export function addMultipleQuestions(skillId, count) {
    if (!builderTest) return;

    // Temporarily set state for question generation
    const origSkill = state.skill;
    const origCategory = state.category;

    // Find category for this skill
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) {
                state.category = catKey;
                state.skill = skillId;
                break;
            }
        }
    }

    for (let i = 0; i < count; i++) {
        try {
            const qData = window.generateQuestion();
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
        } catch (e) {
            console.warn('Failed to generate question for', skillId, e);
        }
    }

    state.skill = origSkill;
    state.category = origCategory;

    renderBuilder();
    window.showToast(`Added ${count} question${count > 1 ? 's' : ''}`, 'success');
}

export function regenerateQuizQuestion(index) {
    if (!builderTest || !builderTest.questions[index]) return;
    const q = builderTest.questions[index];

    const origSkill = state.skill;
    const origCategory = state.category;

    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === q.skillId) {
                state.category = catKey;
                state.skill = q.skillId;
                break;
            }
        }
    }

    try {
        const qData = window.generateQuestion();
        q.questionData = {
            text: qData.text,
            ans: qData.ans,
            hint: qData.hint,
            options: qData.options,
            answerType: qData.answerType,
            visual: qData.visual,
            skillLabel: qData.skillLabel
        };
        renderBuilder();
        window.showToast('Question regenerated', 'success');
    } catch (e) {
        console.warn('Failed to regenerate question', e);
    }

    state.skill = origSkill;
    state.category = origCategory;
}

export function removeQuizQuestion(index) {
    if (!builderTest) return;
    builderTest.questions.splice(index, 1);
    // Re-number
    builderTest.questions.forEach((q, i) => q.id = i);
    renderBuilder();
}

export function updateQuizQuestionPoints(index, points) {
    if (!builderTest || !builderTest.questions[index]) return;
    builderTest.questions[index].points = Math.max(1, points || 1);
}

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
}

export function closeQuizSettings() {
    const overlay = document.getElementById('quizSettingsOverlay');
    if (overlay) overlay.classList.remove('active');
}

export async function saveQuiz() {
    if (!builderTest) return;
    const saved = await saveTest(builderTest);
    builderTest = saved;
    renderBuilder();
    window.showToast('Quiz saved!', 'success');
}

export async function generateQuizLink() {
    if (!builderTest || builderTest.questions.length === 0) return;

    // Save first
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

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}
