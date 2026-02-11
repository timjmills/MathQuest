// Quiz Take — Student test-taking experience
// Layer 4: depends on state, data, utils, quiz-storage, ui-core

import { state } from './state.js';
import { SKILLS } from './data.js';
import { shuffle } from './utils.js';
import { saveResult, decompressTestFromURL } from './quiz-storage.js';

let quizTimerInterval = null;
let quizStartTime = 0;
let quizTimeLimit = 0; // ms, 0 = no limit
let quizAnswers = [];  // { studentAnswer, correct, timeSpent }
let quizFlags = [];    // boolean array
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

    const timeBadge = test.settings.timeLimit
        ? `<span class="qt-landing-badge">${test.settings.timeLimit} min</span>`
        : '<span class="qt-landing-badge">No time limit</span>';

    container.innerHTML = `
        <div class="qt-landing">
            <h2>${escHtml(test.name)}</h2>
            <div class="qt-landing-info">
                <span class="qt-landing-badge">${test.questions.length} question${test.questions.length !== 1 ? 's' : ''}</span>
                ${timeBadge}
                <span class="qt-landing-badge">${test.questions.reduce((s, q) => s + (q.points || 1), 0)} points</span>
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
    quizAnswers = test.questions.map(() => ({ studentAnswer: '', correct: false, timeSpent: 0 }));
    quizFlags = test.questions.map(() => false);

    // Set question order
    if (test.settings.randomOrder) {
        state.quizOrder = shuffle(test.questions.map((_, i) => i));
    } else {
        state.quizOrder = test.questions.map((_, i) => i);
    }

    // Initialize result
    state.currentQuizResult = {
        id: null,
        testId: test.id,
        studentName: studentName,
        startedAt: Date.now(),
        completedAt: null,
        answers: quizAnswers,
        score: 0,
        totalPoints: test.questions.reduce((s, q) => s + (q.points || 1), 0),
        percentage: 0
    };

    // Timer
    quizStartTime = Date.now();
    quizTimeLimit = test.settings.timeLimit ? test.settings.timeLimit * 60 * 1000 : 0;

    if (quizTimeLimit > 0) {
        quizTimerInterval = setInterval(updateQuizTimer, 1000);
    }

    quizQuestionStartTime = Date.now();
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

    const qIdx = state.quizOrder[state.quizQuestionIndex];
    const q = test.questions[qIdx];
    const total = test.questions.length;
    const answered = quizAnswers.filter(a => a.studentAnswer !== '').length;
    const progressPct = ((state.quizQuestionIndex + 1) / total * 100).toFixed(0);

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
        <div class="qt-question-card">
            ${renderQuizQuestion(q, qIdx)}
        </div>
        <div class="qt-nav">
            <button class="qt-nav-btn prev" onclick="navigateQuizQuestion(-1)" ${state.quizQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
            <div class="qt-q-grid">
                ${state.quizOrder.map((origIdx, i) => {
                    let cls = 'qt-q-dot';
                    if (i === state.quizQuestionIndex) cls += ' current';
                    if (quizAnswers[origIdx].studentAnswer !== '') cls += ' answered';
                    if (quizFlags[origIdx]) cls += ' flagged';
                    return `<div class="${cls}" onclick="jumpToQuizQuestion(${i})">${i + 1}</div>`;
                }).join('')}
            </div>
            ${state.quizQuestionIndex < total - 1
                ? '<button class="qt-nav-btn next" onclick="navigateQuizQuestion(1)">Next</button>'
                : '<button class="qt-nav-btn submit" onclick="showQuizReview()">Review & Submit</button>'}
        </div>
    `;

    // Update timer immediately
    if (quizTimeLimit > 0) updateQuizTimer();

    // Restore answer if already answered
    restoreAnswer(qIdx);
}

function renderQuizQuestion(q, qIdx) {
    const qd = q.questionData;
    const label = qd.skillLabel || getSkillLabel(q.skillId);
    const answer = quizAnswers[qIdx];
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
                return `<div class="qt-mc-option${sel}" onclick="submitQuizMC(${qIdx}, '${escHtml(String(opt)).replace(/'/g, "\\'")}')">${escHtml(String(opt))}</div>`;
            }).join('')}
        </div>`;
    } else {
        answerHtml = `<div class="qt-answer-area">
            <input type="text" class="qt-answer-input" id="qtAnswerInput"
                placeholder="Type your answer..." value="${escHtml(String(answer.studentAnswer || ''))}"
                onchange="submitQuizTextAnswer(${qIdx}, this.value)"
                onkeydown="if(event.key==='Enter'){submitQuizTextAnswer(${qIdx}, this.value)}">
        </div>`;
    }

    return `
        <div class="qt-q-header">
            <span class="qt-q-num">Q${state.quizQuestionIndex + 1}</span>
            <span class="qt-q-skill">${escHtml(label)}</span>
            <button class="qt-flag-btn ${quizFlags[qIdx] ? 'flagged' : ''}" onclick="flagQuizQuestion(${qIdx})">
                ${quizFlags[qIdx] ? 'Flagged' : 'Flag'}
            </button>
        </div>
        ${qd.visual ? `<div class="qt-visual-aid">${qd.visual}</div>` : ''}
        <div class="qt-question-text">${qd.text || ''}</div>
        ${answerHtml}
        ${feedbackHtml}
    `;
}

function restoreAnswer(qIdx) {
    const answer = quizAnswers[qIdx];
    if (answer.studentAnswer !== '' && (!state.currentQuiz.questions[qIdx].questionData.options || state.currentQuiz.questions[qIdx].questionData.answerType !== 'multiple-choice')) {
        const input = document.getElementById('qtAnswerInput');
        if (input) input.value = answer.studentAnswer;
    }
}

// ---- Answer Submission ----

export function submitQuizMC(qIdx, value) {
    recordAnswer(qIdx, value);
    renderQuizInterface();
}

export function submitQuizTextAnswer(qIdx, value) {
    recordAnswer(qIdx, value.trim());
    renderQuizInterface();
}

function recordAnswer(qIdx, studentAnswer) {
    const q = state.currentQuiz.questions[qIdx];
    const qd = q.questionData;
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

    quizAnswers[qIdx] = { studentAnswer: String(studentAnswer), correct, timeSpent };
}

// ---- Navigation ----

export function navigateQuizQuestion(direction) {
    const total = state.currentQuiz.questions.length;
    const newIdx = state.quizQuestionIndex + direction;
    if (newIdx < 0 || newIdx >= total) return;

    // Save text answer before navigating
    const qIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(qIdx, input.value.trim());
    }

    state.quizQuestionIndex = newIdx;
    quizQuestionStartTime = Date.now();
    renderQuizInterface();
}

export function jumpToQuizQuestion(displayIndex) {
    // Save current answer first
    const qIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(qIdx, input.value.trim());
    }

    state.quizQuestionIndex = displayIndex;
    quizQuestionStartTime = Date.now();
    renderQuizInterface();
}

export function flagQuizQuestion(qIdx) {
    quizFlags[qIdx] = !quizFlags[qIdx];
    renderQuizInterface();
}

// ---- Review Screen ----

export function showQuizReview() {
    // Save current answer
    const qIdx = state.quizOrder[state.quizQuestionIndex];
    const input = document.getElementById('qtAnswerInput');
    if (input && input.value.trim()) {
        recordAnswer(qIdx, input.value.trim());
    }

    quizPhase = 'review';
    const test = state.currentQuiz;
    const container = document.getElementById('quizTakeView');
    if (!container || !test) return;

    const answered = quizAnswers.filter(a => a.studentAnswer !== '').length;
    const flagged = quizFlags.filter(f => f).length;
    const unanswered = test.questions.length - answered;

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
                ${state.quizOrder.map((origIdx, i) => {
                    const a = quizAnswers[origIdx];
                    const f = quizFlags[origIdx];
                    let status = '';
                    if (a.studentAnswer === '') status = '<span class="qt-review-status" style="color:#f97316;">&#9711;</span>';
                    else status = '<span class="qt-review-status" style="color:#06D6A0;">&#10003;</span>';
                    if (f) status += ' <span style="color:#f97316;font-size:0.8rem;">flagged</span>';
                    return `<div class="qt-review-item" onclick="jumpFromReview(${i})">
                        ${status}
                        <span>Q${i + 1}: ${escHtml(test.questions[origIdx].questionData.text || '').substring(0, 60)}</span>
                    </div>`;
                }).join('')}
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
        const qIdx = state.quizOrder[state.quizQuestionIndex];
        const input = document.getElementById('qtAnswerInput');
        if (input && input.value.trim()) {
            recordAnswer(qIdx, input.value.trim());
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

    // Calculate score
    let score = 0;
    for (let i = 0; i < test.questions.length; i++) {
        if (quizAnswers[i].correct) {
            score += test.questions[i].points || 1;
        }
    }

    result.completedAt = Date.now();
    result.answers = quizAnswers;
    result.score = score;
    result.percentage = Math.round((score / result.totalPoints) * 100);

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

    const pass = result.percentage >= (test.settings.passingScore || 70);
    const timeTaken = result.completedAt && result.startedAt
        ? Math.round((result.completedAt - result.startedAt) / 60000)
        : 0;

    const showBreakdown = test.settings.showFeedback !== 'none';

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
                    ${state.quizOrder.map((origIdx, i) => {
                        const q = test.questions[origIdx];
                        const a = result.answers[origIdx];
                        const icon = a.correct
                            ? '<span class="correct-icon">&#10003;</span>'
                            : '<span class="incorrect-icon">&#10007;</span>';
                        let detail = '';
                        if (!a.correct && test.settings.showFeedback === 'end') {
                            detail = `<span style="font-size:0.78rem;color:var(--text-dim);">Answer: ${escHtml(String(q.questionData.ans))}</span>`;
                        }
                        return `<div class="qt-result-q">
                            ${icon}
                            <span>Q${i + 1}</span>
                            <span style="flex:1;font-size:0.82rem;color:var(--text-dim);">${escHtml((q.questionData.text || '').replace(/<[^>]*>/g, '')).substring(0, 50)}</span>
                            ${detail}
                        </div>`;
                    }).join('')}
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
