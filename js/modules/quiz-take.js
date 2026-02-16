// Quiz Take — Student test-taking experience
// Layer 4: depends on state, data, utils, quiz-storage, ui-core

import { state } from './state.js';
import { SKILLS } from './data.js';
import { shuffle } from './utils.js';
import { saveResult, decompressTestFromURL, migrateTestToSections, getAllQuestionsFlat, getTotalQuestionCount } from './quiz-storage.js';
import { broadcastQuizJoin, broadcastQuizAnswer, broadcastQuizSubmit } from './quiz-monitor.js';

let quizTimerInterval = null;
let quizStartTime = 0;
let quizTimeLimit = 0; // ms, 0 = no limit
let quizAnswers = [];  // { studentAnswer, correct, timeSpent } indexed by globalIdx
let quizFlags = [];    // boolean array indexed by globalIdx
let quizQuestionStartTime = 0;
let quizPhase = 'landing'; // 'landing' | 'active' | 'review' | 'results'

function getSkillLabel(skillId) {
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) return sk.l;
        }
    }
    return skillId;
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

// ---- URL Parameter Handling ----

export function handleQuizURL(quizParam) {
    const test = decompressTestFromURL(quizParam);
    if (!test) {
        window.showToast('Invalid quiz link', 'error');
        return;
    }
    migrateTestToSections(test);
    state.currentQuiz = test;
    state.quizMode = true;
    showQuizLanding();
    window.showView('quizTakeView');
}

// ---- Landing Screen ----

function showQuizLanding() {
    const test = state.currentQuiz;
    if (!test) return;
    quizPhase = 'landing';

    const container = document.getElementById('quizTakeView');
    if (!container) return;

    const allQs = getAllQuestionsFlat(test);
    const totalCount = allQs.length;
    const totalPoints = allQs.reduce((s, item) => s + (item.question.points || 1), 0);

    const timeBadge = test.settings.timeLimit
        ? `<span class="qt-landing-badge">${test.settings.timeLimit} min</span>`
        : '<span class="qt-landing-badge">No time limit</span>';

    container.innerHTML = `
        <div class="qt-landing">
            <h2>${escHtml(test.name)}</h2>
            <div class="qt-landing-info">
                <span class="qt-landing-badge">${totalCount} question${totalCount !== 1 ? 's' : ''}</span>
                ${timeBadge}
                <span class="qt-landing-badge">${totalPoints} points</span>
            </div>
            <input type="text" class="qt-name-input" id="qtStudentName" placeholder="Enter your name..." autocomplete="off">
            <div>
                <button class="qt-start-btn" id="qtStartBtn" onclick="startQuizTest()" disabled>Start Test</button>
            </div>
        </div>
    `;

    // Enable start button when name entered
    const nameInput = document.getElementById('qtStudentName');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const btn = document.getElementById('qtStartBtn');
            if (btn) btn.disabled = !nameInput.value.trim();
        });
        nameInput.focus();
    }
}

// ---- Start Test ----

export function startQuizTest() {
    const test = state.currentQuiz;
    if (!test) return;

    const nameInput = document.getElementById('qtStudentName');
    const studentName = nameInput ? nameInput.value.trim() : 'Anonymous';
    if (!studentName) return;

    // Initialize quiz state
    quizPhase = 'active';
    state.quizQuestionIndex = 0;
    state.quizSectionIndex = 0;

    // Build flat question list from sections
    const allQs = getAllQuestionsFlat(test);
    state.quizAllQuestions = allQs;

    const totalCount = allQs.length;
    quizAnswers = allQs.map(() => ({ studentAnswer: '', correct: false, timeSpent: 0 }));
    quizFlags = allQs.map(() => false);

    // Build question order based on sectionMode
    const sectionMode = test.settings.sectionMode || 'sequential';

    if (sectionMode === 'mixed') {
        // Flatten all sections, shuffle globally
        state.quizOrder = shuffle(allQs.map((_, i) => i));
    } else {
        // Sequential: sections in order, optional shuffle within each section
        const order = [];
        for (let sIdx = 0; sIdx < test.sections.length; sIdx++) {
            const sectionIndices = [];
            for (let i = 0; i < allQs.length; i++) {
                if (allQs[i].sectionIdx === sIdx) sectionIndices.push(i);
            }
            if (test.settings.randomOrder) {
                order.push(...shuffle(sectionIndices));
            } else {
                order.push(...sectionIndices);
            }
        }
        state.quizOrder = order;
    }

    // Initialize result
    const totalPoints = allQs.reduce((s, item) => s + (item.question.points || 1), 0);
    state.currentQuizResult = {
        id: null,
        testId: test.id,
        studentName: studentName,
        startedAt: Date.now(),
        completedAt: null,
        answers: quizAnswers,
        score: 0,
        totalPoints: totalPoints,
        percentage: 0
    };

    // Timer
    quizStartTime = Date.now();
    quizTimeLimit = test.settings.timeLimit ? test.settings.timeLimit * 60 * 1000 : 0;

    if (quizTimeLimit > 0) {
        quizTimerInterval = setInterval(updateQuizTimer, 1000);
    }

    quizQuestionStartTime = Date.now();

    // Broadcast join to monitor dashboard
    broadcastQuizJoin(test.id, studentName);

    renderQuizInterface();
}

// ---- Timer ----

function updateQuizTimer() {
    if (quizPhase !== 'active') {
        clearInterval(quizTimerInterval);
        return;
    }

    const elapsed = Date.now() - quizStartTime;
    const remaining = quizTimeLimit - elapsed;

    if (remaining <= 0) {
        clearInterval(quizTimerInterval);
        submitQuiz();
        return;
    }

    const timerEl = document.getElementById('qtTimer');
    if (timerEl) {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        timerEl.className = 'qt-timer';
        if (remaining < 60000) timerEl.classList.add('danger');
        else if (remaining < 180000) timerEl.classList.add('warning');
    }
}

// ---- Render Quiz Interface ----

function renderQuizInterface() {
    const test = state.currentQuiz;
    if (!test) return;

    const container = document.getElementById('quizTakeView');
    if (!container) return;

    const allQs = state.quizAllQuestions;
    const total = allQs.length;
    const flatIdx = state.quizOrder[state.quizQuestionIndex];
    const qItem = allQs[flatIdx];
    const answered = quizAnswers.filter(a => a.studentAnswer !== '').length;
    const progressPct = ((state.quizQuestionIndex + 1) / total * 100).toFixed(0);

    // Section header (sequential mode with multiple sections)
    const sectionMode = test.settings.sectionMode || 'sequential';
    const multiSection = test.sections.length > 1;
    let sectionHeaderHtml = '';
    if (sectionMode === 'sequential' && multiSection) {
        const section = test.sections[qItem.sectionIdx];
        sectionHeaderHtml = `<div class="qt-section-header">${escHtml(section.label)}${section.instructions ? '<span style="font-weight:400;font-size:0.82rem;margin-left:8px;color:var(--text-dim);">' + escHtml(section.instructions) + '</span>' : ''}</div>`;
    }

    // Build dot grid (with section separators in sequential mode)
    let dotGridHtml = '';
    if (sectionMode === 'sequential' && multiSection) {
        let prevSectionIdx = -1;
        state.quizOrder.forEach((fIdx, i) => {
            const item = allQs[fIdx];
            if (prevSectionIdx !== -1 && item.sectionIdx !== prevSectionIdx) {
                dotGridHtml += '<div class="qt-q-grid-separator"></div>';
            }
            prevSectionIdx = item.sectionIdx;
            let cls = 'qt-q-dot';
            if (i === state.quizQuestionIndex) cls += ' current';
            if (quizAnswers[fIdx].studentAnswer !== '') cls += ' answered';
            if (quizFlags[fIdx]) cls += ' flagged';
            dotGridHtml += `<div class="${cls}" onclick="jumpToQuizQuestion(${i})">${i + 1}</div>`;
        });
    } else {
        dotGridHtml = state.quizOrder.map((fIdx, i) => {
            let cls = 'qt-q-dot';
            if (i === state.quizQuestionIndex) cls += ' current';
            if (quizAnswers[fIdx].studentAnswer !== '') cls += ' answered';
            if (quizFlags[fIdx]) cls += ' flagged';
            return `<div class="${cls}" onclick="jumpToQuizQuestion(${i})">${i + 1}</div>`;
        }).join('');
    }

    container.innerHTML = `
        <div class="qt-topbar">
            <div class="qt-topbar-left">
                <span>${escHtml(state.currentQuizResult?.studentName || '')}</span>
                <span style="color:var(--text-dim);">Q${state.quizQuestionIndex + 1} of ${total}</span>
            </div>
            <div class="qt-topbar-right">
                ${quizTimeLimit > 0 ? '<span class="qt-timer" id="qtTimer">--:--</span>' : ''}
                <span style="font-size:0.85rem;color:var(--text-dim);">${answered}/${total} answered</span>
            </div>
        </div>
        <div class="qt-progress">
            <div class="qt-progress-bar" style="width:${progressPct}%"></div>
        </div>
        ${sectionHeaderHtml}
        <div class="qt-question-card">
            ${renderQuizQuestion(qItem, flatIdx)}
        </div>
        <div class="qt-nav">
            <button class="qt-nav-btn prev" onclick="navigateQuizQuestion(-1)" ${state.quizQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
            <div class="qt-q-grid">
                ${dotGridHtml}
            </div>
            ${state.quizQuestionIndex < total - 1
                ? '<button class="qt-nav-btn next" onclick="navigateQuizQuestion(1)">Next</button>'
                : '<button class="qt-nav-btn submit" onclick="showQuizReview()">Review & Submit</button>'}
        </div>
    `;

    // Update timer immediately
    if (quizTimeLimit > 0) updateQuizTimer();

    // Restore answer if already answered
    restoreAnswer(flatIdx);
}

function renderQuizQuestion(qItem, flatIdx) {
    const q = qItem.question;
    const qd = q.questionData;
    const label = qd.skillLabel || getSkillLabel(q.skillId);
    const answer = quizAnswers[flatIdx];
    const test = state.currentQuiz;
    const showInstantFeedback = test.settings.showFeedback === 'instant' && answer.studentAnswer !== '';

    let feedbackHtml = '';
    if (showInstantFeedback) {
        feedbackHtml = answer.correct
            ? '<div class="qt-feedback correct">Correct!</div>'
            : `<div class="qt-feedback incorrect">Incorrect. The answer is: ${escHtml(String(qd.ans))}</div>`;
    }

    let answerHtml = '';
    if (qd.options && qd.options.length > 0 && qd.answerType === 'multiple-choice') {
        answerHtml = `<div class="qt-mc-options">
            ${qd.options.map(opt => {
                const sel = String(answer.studentAnswer) === String(opt) ? ' selected' : '';
                return `<div class="qt-mc-option${sel}" onclick="submitQuizMC(${flatIdx}, '${escHtml(String(opt)).replace(/'/g, "\\'")}')">${escHtml(String(opt))}</div>`;
            }).join('')}
        </div>`;
    } else {
        answerHtml = `<div class="qt-answer-area">
            <input type="text" class="qt-answer-input" id="qtAnswerInput"
                placeholder="Type your answer..." value="${escHtml(String(answer.studentAnswer || ''))}"
                onchange="submitQuizTextAnswer(${flatIdx}, this.value)"
                onkeydown="if(event.key==='Enter'){submitQuizTextAnswer(${flatIdx}, this.value)}">
        </div>`;
    }

    return `
        <div class="qt-q-header">
            <span class="qt-q-num">Q${state.quizQuestionIndex + 1}</span>
            <span class="qt-q-skill">${escHtml(label)}</span>
            <button class="qt-flag-btn ${quizFlags[flatIdx] ? 'flagged' : ''}" onclick="flagQuizQuestion(${flatIdx})">
                ${quizFlags[flatIdx] ? 'Flagged' : 'Flag'}
            </button>
        </div>
        ${qd.visual ? `<div class="qt-visual-aid">${qd.visual}</div>` : ''}
        <div class="qt-question-text">${qd.text || ''}</div>
        ${answerHtml}
        ${feedbackHtml}
    `;
}

function restoreAnswer(flatIdx) {
    const answer = quizAnswers[flatIdx];
    const qd = state.quizAllQuestions[flatIdx].question.questionData;
    if (answer.studentAnswer !== '' && (!qd.options || qd.answerType !== 'multiple-choice')) {
        const input = document.getElementById('qtAnswerInput');
        if (input) input.value = answer.studentAnswer;
    }
}

// ---- Answer Submission ----

export function submitQuizMC(flatIdx, value) {
    recordAnswer(flatIdx, value);
    renderQuizInterface();
}

export function submitQuizTextAnswer(flatIdx, value) {
    recordAnswer(flatIdx, value.trim());
    renderQuizInterface();
}

function recordAnswer(flatIdx, studentAnswer) {
    const qItem = state.quizAllQuestions[flatIdx];
    const qd = qItem.question.questionData;
    const timeSpent = Date.now() - quizQuestionStartTime;

    // Check correctness
    let correct = false;
    const sNorm = String(studentAnswer).trim().toLowerCase();
    const aNorm = String(qd.ans).trim().toLowerCase();

    if (sNorm === aNorm) {
        correct = true;
    } else {
        // Numeric comparison
        const sNum = parseFloat(sNorm);
        const aNum = parseFloat(aNorm);
        if (!isNaN(sNum) && !isNaN(aNum) && Math.abs(sNum - aNum) < 0.001) {
            correct = true;
        }
    }

    quizAnswers[flatIdx] = { studentAnswer: String(studentAnswer), correct, timeSpent };

    // Broadcast answer to monitor dashboard
    broadcastQuizAnswer(flatIdx, studentAnswer, correct);
}

// ---- Navigation ----

export function navigateQuizQuestion(direction) {
    const total = state.quizAllQuestions.length;
    const newIdx = state.quizQuestionIndex + direction;
    if (newIdx < 0 || newIdx >= total) return;

    // Save text answer before navigating
    const flatIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(flatIdx, input.value.trim());
    }

    state.quizQuestionIndex = newIdx;
    quizQuestionStartTime = Date.now();
    renderQuizInterface();
}

export function jumpToQuizQuestion(displayIndex) {
    // Save current answer first
    const flatIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(flatIdx, input.value.trim());
    }

    state.quizQuestionIndex = displayIndex;
    quizQuestionStartTime = Date.now();
    renderQuizInterface();
}

export function flagQuizQuestion(flatIdx) {
    quizFlags[flatIdx] = !quizFlags[flatIdx];
    renderQuizInterface();
}

// ---- Review Screen ----

export function showQuizReview() {
    // Save current answer
    const flatIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(flatIdx, input.value.trim());
    }

    quizPhase = 'review';
    const test = state.currentQuiz;
    const container = document.getElementById('quizTakeView');
    if (!container || !test) return;

    const allQs = state.quizAllQuestions;
    const total = allQs.length;
    const answered = quizAnswers.filter(a => a.studentAnswer !== '').length;
    const flagged = quizFlags.filter(f => f).length;
    const unanswered = total - answered;

    // Build review list, optionally grouped by section
    const sectionMode = test.settings.sectionMode || 'sequential';
    const multiSection = test.sections.length > 1;
    let reviewListHtml = '';

    if (sectionMode === 'sequential' && multiSection) {
        // Group by section — iterate in display order, insert headers on section change
        let currentSIdx = -1;
        state.quizOrder.forEach((fIdx, displayIdx) => {
            const sIdx = allQs[fIdx].sectionIdx;
            if (sIdx !== currentSIdx) {
                currentSIdx = sIdx;
                const section = test.sections[sIdx];
                const sectionQs = allQs.filter(q => q.sectionIdx === sIdx);
                const sAnswered = sectionQs.filter(q => quizAnswers[q.globalIdx].studentAnswer !== '').length;
                reviewListHtml += `<div class="qt-section-header" style="margin-top:${displayIdx > 0 ? '12px' : '0'};">${escHtml(section.label)} (${sAnswered}/${sectionQs.length})</div>`;
            }
            const a = quizAnswers[fIdx];
            const f = quizFlags[fIdx];
            let status = '';
            if (a.studentAnswer === '') status = '<span class="qt-review-status" style="color:#f97316;">&#9711;</span>';
            else status = '<span class="qt-review-status" style="color:#06D6A0;">&#10003;</span>';
            if (f) status += ' <span style="color:#f97316;font-size:0.8rem;">flagged</span>';
            const qText = escHtml((allQs[fIdx].question.questionData.text || '').replace(/<[^>]*>/g, '')).substring(0, 60);
            reviewListHtml += `<div class="qt-review-item" onclick="jumpFromReview(${displayIdx})">
                ${status}
                <span>Q${displayIdx + 1}: ${qText}</span>
            </div>`;
        });
    } else {
        // Flat list
        state.quizOrder.forEach((fIdx, displayIdx) => {
            const a = quizAnswers[fIdx];
            const f = quizFlags[fIdx];
            let status = '';
            if (a.studentAnswer === '') status = '<span class="qt-review-status" style="color:#f97316;">&#9711;</span>';
            else status = '<span class="qt-review-status" style="color:#06D6A0;">&#10003;</span>';
            if (f) status += ' <span style="color:#f97316;font-size:0.8rem;">flagged</span>';
            const qText = escHtml((allQs[fIdx].question.questionData.text || '').replace(/<[^>]*>/g, '')).substring(0, 60);
            reviewListHtml += `<div class="qt-review-item" onclick="jumpFromReview(${displayIdx})">
                ${status}
                <span>Q${displayIdx + 1}: ${qText}</span>
            </div>`;
        });
    }

    container.innerHTML = `
        <div class="qt-review">
            <h3>Review Your Answers</h3>
            <div class="qt-review-summary">
                <div class="qt-review-stat">
                    <div class="qt-review-stat-val">${answered}</div>
                    <div class="qt-review-stat-label">Answered</div>
                </div>
                <div class="qt-review-stat">
                    <div class="qt-review-stat-val" style="color:#f97316;">${unanswered}</div>
                    <div class="qt-review-stat-label">Unanswered</div>
                </div>
                <div class="qt-review-stat">
                    <div class="qt-review-stat-val" style="color:#f97316;">${flagged}</div>
                    <div class="qt-review-stat-label">Flagged</div>
                </div>
            </div>
            <div class="qt-review-list">
                ${reviewListHtml}
            </div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
                <button class="qt-nav-btn prev" onclick="backFromReview()">Back to Questions</button>
                <button class="qt-nav-btn submit" onclick="submitQuiz()">Submit Test</button>
            </div>
        </div>
    `;
}

export function jumpFromReview(displayIndex) {
    quizPhase = 'active';
    state.quizQuestionIndex = displayIndex;
    quizQuestionStartTime = Date.now();
    renderQuizInterface();
}

export function backFromReview() {
    quizPhase = 'active';
    renderQuizInterface();
}

// ---- Submit Test ----

export async function submitQuiz() {
    // Save current answer if still on a question
    if (quizPhase === 'active') {
        const flatIdx = state.quizOrder[state.quizQuestionIndex];
        const input = document.getElementById('qtAnswerInput');
        if (input && input.value.trim()) {
            recordAnswer(flatIdx, input.value.trim());
        }
    }

    quizPhase = 'results';
    if (quizTimerInterval) {
        clearInterval(quizTimerInterval);
        quizTimerInterval = null;
    }

    const test = state.currentQuiz;
    const result = state.currentQuizResult;
    if (!test || !result) return;

    // Calculate score across all sections
    const allQs = state.quizAllQuestions;
    let score = 0;
    for (let i = 0; i < allQs.length; i++) {
        if (quizAnswers[i].correct) {
            score += allQs[i].question.points || 1;
        }
    }

    result.completedAt = Date.now();
    result.answers = quizAnswers;
    result.score = score;
    result.percentage = Math.round((score / result.totalPoints) * 100);

    // Broadcast submission to monitor dashboard
    broadcastQuizSubmit(result);

    // Save result
    try {
        await saveResult(result);
    } catch (e) {
        console.warn('Failed to save quiz result:', e);
    }

    showQuizResults();
}

// ---- Results Screen ----

function showQuizResults() {
    const test = state.currentQuiz;
    const result = state.currentQuizResult;
    const container = document.getElementById('quizTakeView');
    if (!container || !test || !result) return;

    const allQs = state.quizAllQuestions;
    const pass = result.percentage >= (test.settings.passingScore || 70);
    const timeTaken = result.completedAt && result.startedAt
        ? Math.round((result.completedAt - result.startedAt) / 60000)
        : 0;

    const showBreakdown = test.settings.showFeedback !== 'none';
    const multiSection = test.sections.length > 1;

    // Build question breakdown
    let breakdownHtml = '';
    if (showBreakdown) {
        if (multiSection) {
            // Group by section
            let currentSIdx = -1;
            state.quizOrder.forEach((fIdx, displayIdx) => {
                const sIdx = allQs[fIdx].sectionIdx;
                if (sIdx !== currentSIdx) {
                    currentSIdx = sIdx;
                    breakdownHtml += `<h4 style="margin:16px 0 6px;font-size:0.9rem;">${escHtml(test.sections[sIdx].label)}</h4>`;
                }
                const q = allQs[fIdx].question;
                const a = result.answers[fIdx];
                const icon = a && a.correct
                    ? '<span class="correct-icon">&#10003;</span>'
                    : '<span class="incorrect-icon">&#10007;</span>';
                let detail = '';
                if (a && !a.correct && test.settings.showFeedback === 'end') {
                    detail = `<span style="font-size:0.78rem;color:var(--text-dim);">Answer: ${escHtml(String(q.questionData.ans))}</span>`;
                }
                breakdownHtml += `<div class="qt-result-q">
                    ${icon}
                    <span>Q${displayIdx + 1}</span>
                    <span style="flex:1;font-size:0.82rem;color:var(--text-dim);">${escHtml((q.questionData.text || '').replace(/<[^>]*>/g, '')).substring(0, 50)}</span>
                    ${detail}
                </div>`;
            });
        } else {
            // Flat list
            state.quizOrder.forEach((fIdx, displayIdx) => {
                const q = allQs[fIdx].question;
                const a = result.answers[fIdx];
                const icon = a && a.correct
                    ? '<span class="correct-icon">&#10003;</span>'
                    : '<span class="incorrect-icon">&#10007;</span>';
                let detail = '';
                if (a && !a.correct && test.settings.showFeedback === 'end') {
                    detail = `<span style="font-size:0.78rem;color:var(--text-dim);">Answer: ${escHtml(String(q.questionData.ans))}</span>`;
                }
                breakdownHtml += `<div class="qt-result-q">
                    ${icon}
                    <span>Q${displayIdx + 1}</span>
                    <span style="flex:1;font-size:0.82rem;color:var(--text-dim);">${escHtml((q.questionData.text || '').replace(/<[^>]*>/g, '')).substring(0, 50)}</span>
                    ${detail}
                </div>`;
            });
        }
    }

    container.innerHTML = `
        <div class="qt-results">
            <div class="qt-score-circle ${pass ? 'pass' : 'fail'}">${result.percentage}%</div>
            <h2 style="margin:0 0 4px;">${pass ? 'Passed!' : 'Keep Practicing'}</h2>
            <p style="color:var(--text-dim);margin:0 0 8px;">${escHtml(test.name)}</p>
            <div class="qt-result-details">
                <div class="qt-result-stat">
                    <div class="qt-result-stat-val">${result.score}/${result.totalPoints}</div>
                    <div class="qt-result-stat-label">Score</div>
                </div>
                <div class="qt-result-stat">
                    <div class="qt-result-stat-val">${result.percentage}%</div>
                    <div class="qt-result-stat-label">Percentage</div>
                </div>
                <div class="qt-result-stat">
                    <div class="qt-result-stat-val">${timeTaken} min</div>
                    <div class="qt-result-stat-label">Time</div>
                </div>
            </div>
            ${showBreakdown ? `
                <div class="qt-result-breakdown">
                    <h4 style="margin:0 0 10px;">Question Breakdown</h4>
                    ${breakdownHtml}
                </div>
            ` : ''}
            <div class="qt-result-actions">
                <button class="qb-toolbar-btn export" onclick="downloadQuizStudentResults()">Download Results</button>
                <button class="qb-toolbar-btn primary" onclick="goHome()">Home</button>
            </div>
        </div>
    `;
}

export function downloadQuizStudentResults() {
    const result = state.currentQuizResult;
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-result-${result.studentName || 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
