// Quiz Builder — Teacher-facing test creation UI
// 3-panel layout: Skill Grid | Preview + Add | Question List (with sections)
// Layer 4: depends on state, data, quiz-storage, generate-question
//
// Teacher style (2026-09-25): the builder is drawn with the --tv-* tokens (css/teacher-quiz.css).
// One primary action (Save quiz); Settings, Copy pupil link and Print beside it; Results, Live
// monitor and Export JSON under "More". Filters are plain chips (All + the domains, levels K-6).
// The preview column and every question card show the item as the black-and-white paper cell
// of the teacher previews (teacher-preview.js), and the preview column stays visible at tablet
// widths (it is the only way to add questions). Skills are buttons, so the keyboard reaches them.

import { state } from './state.js';
import { DOMAINS, SKILLS, GRADE_COLORS, getSkillGrade, sortByGrade, isMixedMetaSkill } from './data.js';
import { shuffle } from './utils.js';
import { saveTest, loadTest, listTests, deleteTest, exportTestJSON, importTestJSON, compressTestForURL, migrateTestToSections, getAllQuestionsFlat, getTotalQuestionCount } from './quiz-storage.js';
import { icon, cleanLabel, levelText, copyText } from './teacher-ui.js';
import { mountSample, mountQuestion } from './teacher-preview.js';
import { isTeacher, note, goQuizzes } from './teacher-quiz-ui.js';
import { quizQuestionData } from './quiz-take.js';

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
    previewIndex: 0,        // which seeded example the teacher preview shows ("Another example")
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
        fixedDifficulty: state.fixedDifficulty,
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
        state.fixedDifficulty = true;   // a printed/previewed set is the skill the teacher picked
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

/** A fresh builder opens with an empty preview column (no skill from the last quiz). */
function resetPreview() {
    qb.previewSkill = null;
    qb.previewIndex = 0;
    document.querySelectorAll('.qb-skill-card.previewing').forEach(c => c.classList.remove('previewing'));
    const panel = document.getElementById('qbPreviewContent');
    if (panel) panel.innerHTML = '<div class="qb-preview-empty">Choose a skill to see an example question. Then add as many questions as you need.</div>';
    const addBar = document.getElementById('qbPreviewAddBar');
    if (addBar) addBar.innerHTML = '';
}

function showBuilder() {
    resetPreview();
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
    // In the teacher view the Quizzes screen is the quiz list.
    if (isTeacher() && window.tvGo) { closeQuizSettings(); window.tvGo('quizzes'); return; }
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

/**
 * Delete a quiz and its results. With no id it deletes the quiz open in the builder (More → Delete),
 * then goes back to the Quizzes list.
 */
export async function confirmDeleteQuiz(id) {
    const fromBuilder = !id;
    if (fromBuilder) id = builderTest && builderTest.id;
    if (!id) { note('This quiz is not saved yet'); return; }
    const name = fromBuilder && builderTest ? (builderTest.name || 'this quiz') : 'this quiz';
    if (!confirm(`Delete “${name}” and all its results?`)) return;
    await deleteTest(id);
    if (fromBuilder) builderTest = null;
    note('Quiz deleted');
    if (fromBuilder && isTeacher()) goQuizzes(); else openMyQuizzes();
}

// ========= INITIALIZE: BUILD THE SKILL GRID =========
function qbInitialize() {
    const gridPanel = document.getElementById('qbGridPanel');
    if (!gridPanel) return;

    let html = '';

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<div class="qb-domain-section" data-qb-domain="${domainId}">`;
        html += `<div class="qb-domain-header" style="border-color:${domain.color};color:${domain.color};">`;
        html += `<span class="qb-domain-icon" aria-hidden="true">${domain.icon}</span> ${domain.name}`;
        html += `</div>`;

        for (const cat of domain.categories) {
            const skills = SKILLS[cat.id];
            if (!skills || skills.length === 0) continue;
            // Skip categories that contain ONLY meta/mixed skills
            const hasRealSkills = skills.some(s => !isMixedMetaSkill(s.v));
            if (!hasRealSkills) continue;

            const sorted = sortByGrade(skills, cat.id);

            html += `<div class="qb-category-group" data-qb-category="${cat.id}" data-qb-domain="${domainId}">`;
            html += `<div class="qb-category-header">`;
            html += `<span class="qb-cat-icon" aria-hidden="true">${cat.icon}</span> ${cat.name}`;
            html += `</div>`;
            html += `<div class="qb-skills-row">`;

            for (const skill of sorted) {
                // Skip meta/mixed skills
                if (isMixedMetaSkill(skill.v)) continue;

                const grade = getSkillGrade(skill.v, cat.id);
                const gc = GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' };
                const rawLabel = skill.l.replace(/\s*\(Visual\)\s*/g, '').replace(/^[^\w]*/, '');
                const cleanLabel = rawLabel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const safeLabel = skill.l.toLowerCase().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                html += `<button type="button" class="qb-skill-card" `;
                html += `data-qb-skill="${skill.v}" data-qb-cat="${cat.id}" data-qb-domain="${domainId}" `;
                html += `data-qb-grade="${grade || ''}" data-qb-label="${safeLabel}" `;
                html += `onclick="qbPreviewClick('${cat.id}','${skill.v}')" `;
                html += `onmouseenter="qbPreviewHover('${cat.id}','${skill.v}')" `;
                html += `onfocus="qbPreviewHover('${cat.id}','${skill.v}')" `;
                html += `>`;
                if (grade !== null && grade !== undefined) {
                    html += `<span class="qb-skill-grade" style="background:${gc.bg};color:${gc.text}">${grade}</span>`;
                }
                html += `<span class="qb-skill-name">${cleanLabel}</span>`;
                html += `</button>`;
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
// Teacher view: short chip labels so all the domains fit on one row (the full name is the title).
const DOMAIN_SHORT = {
    'Counting & Cardinality': 'Counting',
    'Number & Operations': 'Operations',
    'Fractions, Decimals & Percents': 'Fractions & decimals',
    'Geometry & Measurement': 'Geometry & measures',
    'Data & Statistics': 'Data',
    'Algebraic Thinking': 'Algebra',
    'Math Vocabulary': 'Vocabulary',
};

/**
 * Teacher view: ONE filter row, the same as the Skills library's (search, a Level select and a
 * Domain select). The pupil-era chip rows and the category drop-down are not drawn.
 */
function qbBuildTeacherFilters() {
    const levels = document.getElementById('qbGradeFilter');
    const domains = document.getElementById('qbDomainFilter');
    const cat = document.getElementById('qbCategorySelect');
    if (cat) { cat.hidden = true; cat.value = ''; }
    qb.activeCategory = null;
    if (domains) { domains.innerHTML = ''; domains.hidden = true; }
    if (!levels) return;
    const lv = ['K', 1, 2, 3, 4, 5, 6].map(g => `<option value="${g}">${levelText(g)}</option>`).join('');
    const dm = Object.entries(DOMAINS).map(([id, d]) => `<option value="${id}">${DOMAIN_SHORT[d.name] || d.name}</option>`).join('');
    levels.setAttribute('role', 'group');
    levels.setAttribute('aria-label', 'Filters');
    levels.classList.add('tvq-selects');
    levels.innerHTML = `<label class="tv-sr" for="qbLevelSelect">Level</label><select id="qbLevelSelect" class="tv-select"><option value="">All levels</option>${lv}</select>`
        + `<label class="tv-sr" for="qbDomainSelect">Domain</label><select id="qbDomainSelect" class="tv-select"><option value="">All domains</option>${dm}</select>`;
    const ls = levels.querySelector('#qbLevelSelect');
    const ds = levels.querySelector('#qbDomainSelect');
    const cur = [...qb.activeGrades][0];
    if (cur) ls.value = cur;
    if (qb.activeDomain) ds.value = qb.activeDomain;
    ls.addEventListener('change', () => { qb.activeGrades = new Set(ls.value ? [ls.value] : []); qbApplyFilters(); });
    ds.addEventListener('change', () => { qb.activeDomain = ds.value || null; qbApplyFilters(); });
}

function qbBuildDomainPills() {
    const container = document.getElementById('qbDomainFilter');
    if (!container) return;
    if (isTeacher()) { qbBuildTeacherFilters(); return; }
    container.hidden = false;

    let html = `<span class="qb-filter-label" id="qbDomainLabel">Domain:</span>`;
    html += `<button type="button" class="qb-domain-pill active" aria-pressed="true" data-qb-filter-domain="" onclick="qbFilterDomain('')">All</button>`;

    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        html += `<button type="button" class="qb-domain-pill" aria-pressed="false" data-qb-filter-domain="${domainId}" `;
        html += `style="--pill-bg:${domain.color}" `;
        const short = isTeacher() ? (DOMAIN_SHORT[domain.name] || domain.name) : domain.name;
        html += `${short !== domain.name ? `title="${domain.name}" ` : ''}onclick="qbFilterDomain('${domainId}')"><span class="qb-pill-icon" aria-hidden="true">${domain.icon} </span>${short}</button>`;
    }

    container.innerHTML = html;
}

function qbBuildGradePills() {
    const container = document.getElementById('qbGradeFilter');
    if (!container) return;
    if (isTeacher()) return;   // qbBuildTeacherFilters drew the teacher's one filter row
    container.classList.remove('tvq-selects');
    const cat = document.getElementById('qbCategorySelect');
    if (cat) cat.hidden = false;

    let html = `<span class="qb-filter-label">${isTeacher() ? 'Level' : 'Grade'}:</span>`;
    // K-6: the app has no grade 7 skills (a 7 chip filtered to nothing).
    const grades = ['K', 1, 2, 3, 4, 5, 6];

    for (const g of grades) {
        const gc = GRADE_COLORS[g] || { bg: '#9E9E9E', text: '#fff' };
        html += `<button type="button" class="qb-grade-pill" aria-pressed="false" aria-label="Level ${g}" data-qb-filter-grade="${g}" `;
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
                const catSkills = SKILLS[cat.id];
                if (!catSkills || !catSkills.some(s => !isMixedMetaSkill(s.v))) continue;
                html += `<option value="${cat.id}">${cat.name}</option>`;
            }
        }
    } else {
        for (const domain of Object.values(DOMAINS)) {
            for (const cat of domain.categories) {
                const catSkills = SKILLS[cat.id];
                if (!catSkills || !catSkills.some(s => !isMixedMetaSkill(s.v))) continue;
                html += `<option value="${cat.id}">${cat.name}</option>`;
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
        pill.setAttribute('aria-pressed', String(isActive));
        if (isTeacher()) { pill.style.background = ''; pill.style.borderColor = ''; return; }
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
        pill.setAttribute('aria-pressed', String(isActive));
        if (isTeacher()) { pill.style.background = ''; pill.style.borderColor = ''; pill.style.color = ''; return; }
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
    if (isTeacher()) {
        const same = qb.previewSkill && qb.previewSkill.categoryId === categoryId && qb.previewSkill.skillId === skillId;
        if (!same) qb.previewIndex = 0;
        qb.previewSkill = { categoryId, skillId };
        renderTeacherPreview(categoryId, skillId);
        return;
    }

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
    if (isTeacher()) {
        qb.previewIndex = (qb.previewIndex + 1) % 50;
        renderTeacherPreview(qb.previewSkill.categoryId, qb.previewSkill.skillId);
        return;
    }
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

/** The preview column in the teacher view: the skill's sample as a paper cell, plus Add. */
function renderTeacherPreview(categoryId, skillId) {
    const panel = document.getElementById('qbPreviewContent');
    if (!panel) return;
    const skills = SKILLS[categoryId] || [];
    const skillDef = skills.find(s => s.v === skillId);
    const label = cleanLabel(skillDef ? skillDef.l : skillId);
    const grade = getSkillGrade(skillId, categoryId);
    let catName = '';
    for (const d of Object.values(DOMAINS)) { const c = d.categories.find(x => x.id === categoryId); if (c) { catName = c.name; break; } }
    panel.innerHTML = `<div class="tvq-prev">
      <div><div class="tv-h3">${escHtml(label)}</div><div class="tv-skill-meta">${escHtml([grade != null ? levelText(grade) : '', catName].filter(Boolean).join(' · '))}</div></div>
      <div class="tvp-frame tvq-prev-frame"></div>
      <button type="button" class="tv-btn tvq-btn-sm" onclick="qbRefreshPreview()">${icon('reset', 16)}<span>Another example</span></button>
    </div>`;
    mountSample(panel.querySelector('.tvq-prev-frame'), categoryId, skillId, undefined, qb.previewIndex);

    const addBar = document.getElementById('qbPreviewAddBar');
    if (addBar) {
        const targetSection = builderTest ? builderTest.sections[qb.activeSection] : null;
        const targetLabel = targetSection ? targetSection.label : 'Problem Set A';
        const prev = document.getElementById('qbAddNum');
        const n = prev ? prev.value : '1';
        addBar.innerHTML = `<div class="tvq-addbar">
          <label class="tv-label" for="qbAddNum">How many questions</label>
          <div class="tvq-addrow">
            <input type="number" id="qbAddNum" value="${escHtml(n)}" min="1" max="50" class="tv-input tvq-num" inputmode="numeric">
            <button type="button" class="tv-btn tvq-btn-accent" onclick="qbAddFromPreview()">${icon('plus', 18)}<span>Add to quiz</span></button>
          </div>
          <p class="tv-cap">Into ${escHtml(targetLabel)}</p>
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
    note('Section added', 'success');
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
    note('Section removed', 'success');
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
    note(`${section.label} shuffled`, 'success');
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
    note(`Moved to ${toSection.label}`, 'success');
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
                    questionData: quizQuestionData(qData),
                    points: 1
                });
            }
        } catch (e) {
            console.warn('Failed to generate question for', skillId, e);
        }
    }

    qbRenderSectionList();
    qbUpdateCounts();
    note(`Added ${count} question${count > 1 ? 's' : ''} to ${section.label}`, 'success');
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
            q.questionData = quizQuestionData(qData);
            qbRenderSectionList();
            note('Question regenerated', 'success');
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
                questionData: quizQuestionData(qData),
                points: q.points
            });
            section.questions.forEach((qq, i) => qq.id = i);
            qbRenderSectionList();
            qbUpdateCounts();
            note('Question duplicated', 'success');
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

// ========= DRAG-AND-DROP FOR QUESTIONS BETWEEN SECTIONS =========
let qbDragData = null;

export function handleQbQuestionDragStart(e, sIdx, qIdx) {
    qbDragData = { sIdx, qIdx };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sIdx}:${qIdx}`);
    e.target.style.opacity = '0.4';
}

export function handleQbQuestionDragEnd(e) {
    e.target.style.opacity = '1';
    qbDragData = null;
    document.querySelectorAll('.qb-section-body').forEach(el => {
        el.style.background = '';
    });
}

export function handleQbSectionDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
}

export function handleQbSectionDragLeave(e) {
    e.currentTarget.style.background = '';
}

export function handleQbSectionDrop(e, toSIdx) {
    e.preventDefault();
    e.currentTarget.style.background = '';
    if (!qbDragData) return;
    const { sIdx: fromSIdx, qIdx } = qbDragData;
    if (fromSIdx === toSIdx) return;
    moveQuestionToSection(fromSIdx, qIdx, toSIdx);
    qbDragData = null;
}

// ========= RENDER SECTION LIST =========
function qbRenderSectionList() {
    const list = document.getElementById('qbQuestionList');
    let empty = document.getElementById('qbEmptyQuestions');
    // A render with questions replaces the list's markup (and the empty note with it).
    if (!empty && list) {
        empty = document.createElement('div');
        empty.className = 'qb-empty';
        empty.id = 'qbEmptyQuestions';
        empty.textContent = 'No questions yet. Choose a skill, then Add to quiz.';
    }
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
        html += `<button type="button" class="qb-section-collapse" aria-expanded="${!isCollapsed}" aria-label="${isCollapsed ? 'Show' : 'Hide'} the questions in ${escHtml(section.label)}" onclick="event.stopPropagation();toggleSectionCollapse(${sIdx})">${isCollapsed ? icon('chevR', 16) : icon('chevD', 16)}</button>`;
        html += `<input class="qb-section-label-input" value="${escHtml(section.label)}" aria-label="Section name" onclick="event.stopPropagation()" onchange="updateSectionLabel(${sIdx}, this.value)" style="border-color:${color}">`;
        if (isTeacher()) {
            const n = section.questions.length;
            html += `<span class="qb-section-count">${n} question${n !== 1 ? 's' : ''}</span>`;
        } else {
            html += `<span class="qb-section-count">${section.questions.length} Q${section.questions.length !== 1 ? 's' : ''}</span>`;
            html += `<span class="qb-section-layout-badge">${colLabel}</span>`;
        }
        html += `</div>`;
        html += `<div class="qb-section-actions" onclick="event.stopPropagation()">`;

        // Layout dropdown
        html += `<select class="qb-section-layout-select" aria-label="Printed layout of ${escHtml(section.label)}" onchange="updateSectionLayout(${sIdx}, parseInt(this.value), this.options[this.selectedIndex].dataset.spacing)">`;
        for (const preset of SECTION_LAYOUT_PRESETS) {
            const selected = section.layout.columns === preset.columns ? ' selected' : '';
            html += `<option value="${preset.columns}" data-spacing="${preset.spacing}"${selected}>${preset.name} (${preset.columns} per row)</option>`;
        }
        html += `</select>`;

        html += `<button type="button" class="qb-q-btn" onclick="shuffleSectionQuestions(${sIdx})" title="Shuffle questions" aria-label="Shuffle the questions in ${escHtml(section.label)}">${icon('shuffle', 16)}</button>`;
        if (sIdx > 0) html += `<button type="button" class="qb-q-btn" onclick="reorderSection(${sIdx}, -1)" title="Move up" aria-label="Move ${escHtml(section.label)} up">${icon('up', 16)}</button>`;
        if (sIdx < builderTest.sections.length - 1) html += `<button type="button" class="qb-q-btn" onclick="reorderSection(${sIdx}, 1)" title="Move down" aria-label="Move ${escHtml(section.label)} down">${icon('down', 16)}</button>`;
        if (builderTest.sections.length > 1) html += `<button type="button" class="qb-q-btn danger" onclick="removeSection(${sIdx})" title="Remove section" aria-label="Remove ${escHtml(section.label)}">${icon('trash', 16)}</button>`;
        html += `</div>`;
        html += `</div>`;

        // Section body (collapsible)
        if (!isCollapsed) {
            html += `<div class="qb-section-body" ondragover="handleQbSectionDragOver(event)" ondrop="handleQbSectionDrop(event,${sIdx})" ondragleave="handleQbSectionDragLeave(event)">`;

            if (section.instructions) {
                html += `<div class="qb-section-instructions">${escHtml(section.instructions)}</div>`;
            }

            for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
                html += qbRenderQuestionCard(section.questions[qIdx], sIdx, qIdx, globalIdx);
                globalIdx++;
            }

            if (section.questions.length === 0) {
                html += `<div class="qb-section-empty">No questions yet. Choose a skill, then Add to quiz.</div>`;
            }

            html += `</div>`;
        } else {
            globalIdx += section.questions.length;
        }

        html += `</div>`;
    }

    // Add Section button
    html += `<button type="button" class="qb-add-section-btn" onclick="addSection()">${isTeacher() ? `${icon('plus', 16)}<span>Add a section</span>` : '+ Add Section'}</button>`;

    list.innerHTML = html;
    if (isTeacher()) mountQuestionCells(list);
}

/** Teacher view: draw each question card's item as a black-and-white paper cell. */
function mountQuestionCells(list) {
    list.querySelectorAll('[data-qb-cell]').forEach((frame) => {
        const [sIdx, qIdx] = frame.dataset.qbCell.split(':').map(Number);
        const q = builderTest && builderTest.sections[sIdx] ? builderTest.sections[sIdx].questions[qIdx] : null;
        if (!q || !q.questionData) return;
        try { mountQuestion(frame, q.questionData, q.skillId); } catch (e) { /* a preview never breaks the builder */ }
    });
}

function qbRenderQuestionCardTeacher(q, sectionIdx, localIdx, globalIdx) {
    const label = cleanLabel(getSkillLabel(q.skillId));
    const n = globalIdx + 1;
    let move = '';
    if (builderTest.sections.length > 1) {
        move = `<select class="tv-select tvq-move" aria-label="Move question ${n} to another section" onchange="if(this.value!=='')moveQuestionToSection(${sectionIdx},${localIdx},parseInt(this.value));this.value=''">`;
        move += `<option value="">Move to…</option>`;
        for (let s = 0; s < builderTest.sections.length; s++) {
            if (s !== sectionIdx) move += `<option value="${s}">${escHtml(builderTest.sections[s].label)}</option>`;
        }
        move += `</select>`;
    }
    return `<div class="qb-question-card tvq-qcard" data-section="${sectionIdx}" data-index="${localIdx}" draggable="true" ondragstart="handleQbQuestionDragStart(event,${sectionIdx},${localIdx})" ondragend="handleQbQuestionDragEnd(event)">
  <div class="qb-q-header">
    <span class="tvq-grip" title="Drag to move" aria-hidden="true">${icon('grip', 16)}</span>
    <span class="qb-q-num">Q${n}</span>
    <span class="tvq-grow"></span>
    <label class="qb-q-points"><span class="tv-sr">Points for question ${n}</span><input type="number" class="tv-input" value="${q.points || 1}" min="1" max="100" onchange="updateQuizQuestionPoints(${sectionIdx}, ${localIdx}, parseInt(this.value))"><span aria-hidden="true">pts</span></label>
  </div>
  <div class="qb-q-skill">${escHtml(label)}</div>
  <div class="tvp-frame tvq-qframe" data-qb-cell="${sectionIdx}:${localIdx}"></div>
  <div class="tvq-qfoot">
    <span class="tv-cap tvq-ans">Answer: <strong>${escHtml(String(q.questionData.ans))}</strong></span>
    <div class="qb-q-actions">
      <button type="button" class="tv-icon-btn" title="New question" aria-label="New question for Q${n}" onclick="regenerateQuizQuestion(${sectionIdx}, ${localIdx})">${icon('reset', 18)}</button>
      <button type="button" class="tv-icon-btn" title="Duplicate" aria-label="Duplicate Q${n}" onclick="duplicateQuizQuestion(${sectionIdx}, ${localIdx})">${icon('copy', 18)}</button>
      ${move}
      <button type="button" class="tv-icon-btn tvq-danger" title="Remove" aria-label="Remove Q${n}" onclick="removeQuizQuestion(${sectionIdx}, ${localIdx})">${icon('trash', 18)}</button>
    </div>
  </div>
</div>`;
}

function qbRenderQuestionCard(q, sectionIdx, localIdx, globalIdx) {
    if (isTeacher()) return qbRenderQuestionCardTeacher(q, sectionIdx, localIdx, globalIdx);
    const label = getSkillLabel(q.skillId);
    const grade = getSkillGrade(q.skillId, null);
    const gc = grade != null ? (GRADE_COLORS[grade] || { bg: '#9E9E9E', text: '#fff' }) : null;

    let html = `<div class="qb-question-card" data-section="${sectionIdx}" data-index="${localIdx}" draggable="true" ondragstart="handleQbQuestionDragStart(event,${sectionIdx},${localIdx})" ondragend="handleQbQuestionDragEnd(event)">`;

    // Header row
    html += `<div class="qb-q-header">`;
    html += `<span style="cursor:grab;color:var(--text-dim);font-size:0.75rem;margin-right:2px;" title="Drag to move">&#9776;</span>`;
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
    if (pointsEl) pointsEl.textContent = `${points} point${points !== 1 ? 's' : ''}`;

    const toolbarInfo = document.getElementById('qbToolbarInfo');
    if (toolbarInfo) toolbarInfo.textContent = `${count} question${count !== 1 ? 's' : ''} \u00B7 ${points} point${points !== 1 ? 's' : ''} in all`;

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
    const deleteBtn = document.getElementById('qbDeleteBtn');
    if (deleteBtn) deleteBtn.disabled = !builderTest.id;
    const jump = document.getElementById('qbQuestionJumpCount');
    if (jump) jump.textContent = `${count} question${count !== 1 ? 's' : ''}`;
    const monitorBtn = document.getElementById('qbMonitorBtn');
    if (monitorBtn) monitorBtn.disabled = !builderTest.id || !hasQuestions;
}

/** More → Results / Live monitor for the quiz being edited (saved first). */
export async function openBuilderResults() {
    if (!builderTest || !builderTest.id) { note('Save the quiz first'); return; }
    window.showQuizResults(builderTest.id);
}

export async function openBuilderMonitor() {
    if (!builderTest || getTotalQuestionCount(builderTest) === 0) return;
    await saveQuiz();
    window.openQuizMonitor(builderTest.id);
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
    if (key === 'shuffleWithinSections') {
        const hadFocus = document.activeElement && document.activeElement.id;
        qbRenderSettings();
        if (hadFocus) document.getElementById(hadFocus)?.focus();
    }
}

let settingsReturnFocus = null;

function settingsKeydown(e) {
    const overlay = document.getElementById('quizSettingsOverlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeQuizSettings(); return; }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the dialog.
    const f = Array.from(overlay.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export function openQuizSettings() {
    const overlay = document.getElementById('quizSettingsOverlay');
    if (!overlay) return;
    // A child of <body>, so its scrim covers the whole window (the teacher sidebar too).
    if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
    settingsReturnFocus = document.activeElement;
    overlay.classList.add('active');
    qbRenderSettings();
    document.addEventListener('keydown', settingsKeydown);
    const first = overlay.querySelector('select, input, button');
    if (first) first.focus();
}

export function closeQuizSettings() {
    const overlay = document.getElementById('quizSettingsOverlay');
    const wasOpen = overlay && overlay.classList.contains('active');
    if (overlay) overlay.classList.remove('active');
    document.removeEventListener('keydown', settingsKeydown);
    if (wasOpen && settingsReturnFocus && settingsReturnFocus.isConnected) settingsReturnFocus.focus();
    settingsReturnFocus = null;
}

function settingSwitch(id, key, on, label, desc) {
    return `<button type="button" class="tvq-switch-btn" id="${id}" role="switch" aria-checked="${!!on}"
        onclick="const v=this.getAttribute('aria-checked')!=='true';this.setAttribute('aria-checked',String(v));updateQuizSetting('${key}', v)">
      <span class="tvq-switch-text"><span class="tv-h3">${label}</span><span class="tv-cap">${desc}</span></span><span class="tv-switch" aria-hidden="true"></span>
    </button>`;
}

function settingSelect(id, label, onchange, options, desc) {
    return `<div class="tvq-field">
      <label class="tv-label" for="${id}">${label}</label>
      <select class="tv-select" id="${id}" onchange="${onchange}"${desc ? ` aria-describedby="${id}D"` : ''}>${options}</select>
      ${desc ? `<p class="tv-cap" id="${id}D">${desc}</p>` : ''}
    </div>`;
}

function qbRenderSettings() {
    const container = document.getElementById('qbSettingsContent');
    if (!container || !builderTest) return;

    const s = builderTest.settings;
    const opt = (v, text, on) => `<option value="${v}"${on ? ' selected' : ''}>${text}</option>`;
    const times = [0, 5, 10, 15, 20, 30, 45, 60];
    container.innerHTML = `
      <section class="tvq-group" aria-labelledby="qbSetOnlineH">
        <h3 class="tvq-group-h" id="qbSetOnlineH">Taking the quiz online</h3>
        <div class="tvq-fields">
          ${settingSelect('qbSetTime', 'Time limit', "updateQuizSetting('timeLimit', this.value === '0' ? null : parseInt(this.value))",
              times.map(t => opt(t, t ? `${t} minutes` : 'No limit', t ? s.timeLimit === t : !s.timeLimit)).join(''))}
          ${settingSelect('qbSetFeedback', 'Show pupils', "updateQuizSetting('showFeedback', this.value)",
              opt('instant', 'Right or wrong after each question', s.showFeedback === 'instant') + opt('end', 'Their answers after they submit', s.showFeedback === 'end') + opt('none', 'Their score only', s.showFeedback === 'none'))}
          ${settingSelect('qbSetSections', 'Sections', "updateQuizSetting('sectionMode', this.value)",
              opt('sequential', 'One section at a time', s.sectionMode === 'sequential') + opt('mixed', 'All questions mixed together', s.sectionMode === 'mixed'))}
          <div class="tvq-field">
            <label class="tv-label" for="qbSetPass">Pass mark</label>
            <div class="tvq-suffix"><input type="number" class="tv-input" id="qbSetPass" value="${Number(s.passingScore) || 0}" min="0" max="100" onchange="updateQuizSetting('passingScore', Math.max(0, Math.min(100, parseInt(this.value) || 0)))"><span aria-hidden="true">%</span></div>
          </div>
        </div>
      </section>
      <section class="tvq-group" aria-labelledby="qbSetShuffleH">
        <h3 class="tvq-group-h" id="qbSetShuffleH">Shuffling</h3>
        ${settingSwitch('qbSetRandom', 'randomOrder', s.randomOrder, 'Online: a different order for each pupil', 'Each pupil gets the same questions in their own order.')}
        ${settingSwitch('qbSetShufflePrint', 'shuffleWithinSections', s.shuffleWithinSections, 'Printed: shuffle within each section', 'Mixes the question order on paper. Sections stay in place.')}
        ${settingSelect('qbSetVersions', 'Printed versions', "updateQuizSetting('printVersions', parseInt(this.value))",
            [1, 2, 3, 4, 5, 6].map(n => opt(n, `${n} version${n > 1 ? 's' : ''}`, s.printVersions === n)).join(''),
            s.shuffleWithinSections ? 'Each version has its own order and its own answer key.' : 'Turn on “Printed: shuffle within each section” to print more than one version.')}
      </section>
    `;
    const versions = document.getElementById('qbSetVersions');
    if (versions && !s.shuffleWithinSections) versions.disabled = true;
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
    note(isTeacher() ? 'Quiz saved' : 'Quiz saved!', 'success');
}

export async function generateQuizLink() {
    if (!builderTest || getTotalQuestionCount(builderTest) === 0) return;
    await saveQuiz();
    const compressed = compressTestForURL(builderTest);
    const url = window.location.origin + window.location.pathname + '?quiz=' + compressed;
    if (url.length > 8000) {
        note('Quiz too large for a link. Use Export JSON instead.', 'error');
        return;
    }
    if (await copyText(url)) note(isTeacher() ? 'Pupil link copied' : 'Student link copied to clipboard!', 'success');
    else prompt('Copy this student link:', url);
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
    note('Quiz exported!', 'success');
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
            note('Quiz imported!', 'success');
            openMyQuizzes();
        } catch (err) {
            note('Invalid quiz file', 'error');
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
