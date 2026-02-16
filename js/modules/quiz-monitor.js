// Quiz Monitor — Socrative-style live quiz monitoring dashboard
// Layer 6: depends on state, data, quiz-storage, ui-core

import { SKILLS } from './data.js';
import { loadTest, listTests, getResultsForTest, migrateTestToSections, getAllQuestionsFlat, getTotalQuestionCount, compressTestForURL } from './quiz-storage.js';

// ---- Module State ----

const mon = {
    testId: null,
    test: null,
    allQs: [],
    students: new Map(),   // name → { name, startedAt, answers[], score, percentage, completed, online }
    showNames: true,
    showResponses: true,
    showResults: false,
    channel: null,          // BroadcastChannel
    pollInterval: null,     // IndexedDB polling interval
    refreshInterval: null,  // UI refresh interval
    paused: false
};

// ---- Question header colors (cycle through for Socrative look) ----
const Q_COLORS = [
    '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16',
    '#a855f7', '#0ea5e9', '#eab308', '#22c55e', '#f43f5e'
];

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

// ---- Open Monitor: Quiz Selector ----

export async function openQuizMonitor(testId) {
    window.showView('quizMonitorView');
    if (testId) {
        startMonitoring(testId);
    } else {
        showMonitorSelector();
    }
}

async function showMonitorSelector() {
    const tests = await listTests();
    const container = document.getElementById('quizMonitorView');
    if (!container) return;

    container.innerHTML = `
        <div class="qm-selector">
            <div class="qm-selector-header">
                <h2>Live Quiz Monitor</h2>
                <button class="btn btn-sm btn-secondary" onclick="showView('homeView')">Back</button>
            </div>
            <p class="qm-selector-desc">Select a quiz to monitor student progress in real time.</p>
            <div class="qm-quiz-list">
                ${tests.length === 0 ? '<div class="qb-empty">No quizzes found. Create a quiz first.</div>' :
                tests.map(t => {
                    const qCount = t.sections ? getTotalQuestionCount(t) : (t.questions ? t.questions.length : 0);
                    return `
                    <div class="qm-quiz-card" onclick="openQuizMonitor('${t.id}')">
                        <div class="qm-quiz-card-name">${escHtml(t.name)}</div>
                        <div class="qm-quiz-card-meta">${qCount} questions &middot; ${new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;
}

// ---- Start Monitoring ----

async function startMonitoring(testId) {
    // Clean up previous
    stopMonitoring();

    mon.testId = testId;
    mon.test = await loadTest(testId);
    if (!mon.test) {
        window.showToast('Quiz not found', 'error');
        showMonitorSelector();
        return;
    }

    migrateTestToSections(mon.test);
    mon.allQs = getAllQuestionsFlat(mon.test);
    mon.students = new Map();
    mon.paused = false;
    mon.showNames = true;
    mon.showResponses = true;
    mon.showResults = false;

    // Load existing results from IndexedDB
    await loadResultsFromDB();

    // Set up BroadcastChannel for real-time updates
    try {
        mon.channel = new BroadcastChannel(`mathquest-quiz-${testId}`);
        mon.channel.onmessage = (e) => handleStudentMessage(e.data);
    } catch (err) {
        // BroadcastChannel not supported — fall back to polling only
        console.warn('BroadcastChannel not available:', err);
    }

    // Poll IndexedDB every 5 seconds for imported results
    mon.pollInterval = setInterval(() => loadResultsFromDB(), 5000);

    // Refresh UI every 2 seconds
    mon.refreshInterval = setInterval(() => renderMonitorGrid(), 2000);

    renderMonitorGrid();
}

export function stopMonitoring() {
    if (mon.channel) {
        mon.channel.close();
        mon.channel = null;
    }
    if (mon.pollInterval) {
        clearInterval(mon.pollInterval);
        mon.pollInterval = null;
    }
    if (mon.refreshInterval) {
        clearInterval(mon.refreshInterval);
        mon.refreshInterval = null;
    }
}

// ---- Load Results from IndexedDB ----

async function loadResultsFromDB() {
    if (!mon.testId) return;
    const results = await getResultsForTest(mon.testId);
    for (const r of results) {
        const name = r.studentName || 'Anonymous';
        const student = getOrCreateStudent(name);
        student.completed = !!r.completedAt;
        student.score = r.score || 0;
        student.percentage = r.percentage || 0;
        student.startedAt = r.startedAt || Date.now();
        // Merge answers
        if (r.answers) {
            for (let i = 0; i < r.answers.length; i++) {
                if (r.answers[i] && r.answers[i].studentAnswer !== '') {
                    student.answers[i] = {
                        studentAnswer: r.answers[i].studentAnswer,
                        correct: r.answers[i].correct
                    };
                }
            }
        }
        // Recalculate score from answers
        recalcStudentScore(student);
    }
}

function getOrCreateStudent(name) {
    if (!mon.students.has(name)) {
        mon.students.set(name, {
            name,
            startedAt: Date.now(),
            answers: new Array(mon.allQs.length).fill(null),
            score: 0,
            percentage: 0,
            completed: false,
            online: false
        });
    }
    return mon.students.get(name);
}

function recalcStudentScore(student) {
    let score = 0;
    let totalPoints = 0;
    for (let i = 0; i < mon.allQs.length; i++) {
        const pts = mon.allQs[i].question.points || 1;
        totalPoints += pts;
        if (student.answers[i] && student.answers[i].correct) {
            score += pts;
        }
    }
    student.score = score;
    student.percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
}

// ---- BroadcastChannel Message Handling ----

function handleStudentMessage(data) {
    if (!data || !data.type) return;

    switch (data.type) {
        case 'join': {
            const student = getOrCreateStudent(data.studentName);
            student.online = true;
            student.startedAt = data.startedAt || Date.now();
            break;
        }
        case 'answer': {
            const student = getOrCreateStudent(data.studentName);
            student.online = true;
            if (data.flatIdx >= 0 && data.flatIdx < mon.allQs.length) {
                student.answers[data.flatIdx] = {
                    studentAnswer: data.studentAnswer || '',
                    correct: !!data.correct
                };
            }
            recalcStudentScore(student);
            break;
        }
        case 'submit': {
            const student = getOrCreateStudent(data.studentName);
            student.completed = true;
            student.online = false;
            if (data.answers) {
                for (let i = 0; i < data.answers.length; i++) {
                    if (data.answers[i] && data.answers[i].studentAnswer !== '') {
                        student.answers[i] = {
                            studentAnswer: data.answers[i].studentAnswer,
                            correct: data.answers[i].correct
                        };
                    }
                }
            }
            recalcStudentScore(student);
            student.percentage = data.percentage || student.percentage;
            break;
        }
        case 'leave': {
            const student = mon.students.get(data.studentName);
            if (student) student.online = false;
            break;
        }
    }

    // Instant UI update on message
    renderMonitorGrid();
}

// ---- Broadcast from quiz-take (called externally) ----

export function broadcastQuizJoin(testId, studentName) {
    try {
        const ch = new BroadcastChannel(`mathquest-quiz-${testId}`);
        ch.postMessage({ type: 'join', studentName, startedAt: Date.now() });
        // Keep channel alive for subsequent messages
        window._quizBroadcastChannel = ch;
        window._quizBroadcastTestId = testId;
        window._quizBroadcastName = studentName;
    } catch (e) { /* ignore */ }
}

export function broadcastQuizAnswer(flatIdx, studentAnswer, correct) {
    const ch = window._quizBroadcastChannel;
    if (!ch) return;
    ch.postMessage({
        type: 'answer',
        studentName: window._quizBroadcastName,
        flatIdx,
        studentAnswer: String(studentAnswer),
        correct
    });
}

export function broadcastQuizSubmit(result) {
    const ch = window._quizBroadcastChannel;
    if (!ch) return;
    ch.postMessage({
        type: 'submit',
        studentName: result.studentName,
        answers: result.answers,
        score: result.score,
        percentage: result.percentage
    });
    // Close channel
    ch.close();
    window._quizBroadcastChannel = null;
}

// ---- Render Monitor Dashboard ----

function renderMonitorGrid() {
    const container = document.getElementById('quizMonitorView');
    if (!container || !mon.test) return;

    // Check if we're still on monitor view
    if (container.style.display === 'none') {
        stopMonitoring();
        return;
    }

    const totalQs = mon.allQs.length;
    const studentList = Array.from(mon.students.values());
    const studentCount = studentList.length;
    const onlineCount = studentList.filter(s => s.online).length;
    const completedCount = studentList.filter(s => s.completed).length;

    // Calculate per-question class totals
    const classTotals = [];
    for (let q = 0; q < totalQs; q++) {
        let correct = 0;
        let attempted = 0;
        for (const s of studentList) {
            if (s.answers[q]) {
                attempted++;
                if (s.answers[q].correct) correct++;
            }
        }
        classTotals.push({ correct, attempted, pct: attempted > 0 ? Math.round((correct / attempted) * 100) : null });
    }

    // Class average
    const classAvg = studentList.length > 0
        ? Math.round(studentList.reduce((sum, s) => sum + s.percentage, 0) / studentList.length)
        : 0;

    // Build question header cells
    let qHeaders = '';
    for (let q = 0; q < totalQs; q++) {
        const color = Q_COLORS[q % Q_COLORS.length];
        const skillLabel = getSkillLabel(mon.allQs[q].question.skillId);
        qHeaders += `<th class="qm-q-header" style="--q-color:${color}" title="${escHtml(skillLabel)}">
            <div class="qm-q-num">${q + 1}</div>
        </th>`;
    }

    // Build student rows
    let studentRows = '';
    for (const s of studentList) {
        const statusDot = s.completed ? 'completed' : (s.online ? 'online' : 'offline');
        const nameDisplay = mon.showNames ? escHtml(s.name) : `Student ${studentList.indexOf(s) + 1}`;

        let answerCells = '';
        for (let q = 0; q < totalQs; q++) {
            const a = s.answers[q];
            if (!a || a.studentAnswer === undefined) {
                answerCells += '<td class="qm-cell qm-cell-empty"></td>';
            } else if (mon.showResponses) {
                if (mon.showResults) {
                    answerCells += a.correct
                        ? '<td class="qm-cell qm-cell-correct"><span class="qm-check">&#10003;</span></td>'
                        : '<td class="qm-cell qm-cell-incorrect"><span class="qm-cross">&#10007;</span></td>';
                } else {
                    answerCells += '<td class="qm-cell qm-cell-answered"><span class="qm-dot-filled">&#9679;</span></td>';
                }
            } else {
                answerCells += '<td class="qm-cell qm-cell-hidden"></td>';
            }
        }

        const scoreDisplay = mon.showResults ? `${s.percentage}%` : '—';

        studentRows += `<tr class="qm-student-row">
            <td class="qm-name-cell">
                <span class="qm-status-dot ${statusDot}"></span>
                <span class="qm-student-name">${nameDisplay}</span>
            </td>
            <td class="qm-score-cell">${scoreDisplay}</td>
            ${answerCells}
        </tr>`;
    }

    // Build class total row
    let totalCells = '';
    for (let q = 0; q < totalQs; q++) {
        const t = classTotals[q];
        if (t.pct !== null && mon.showResults) {
            const cls = t.pct >= 70 ? 'high' : (t.pct >= 50 ? 'mid' : 'low');
            totalCells += `<td class="qm-total-cell qm-total-${cls}">${t.pct}%</td>`;
        } else {
            totalCells += '<td class="qm-total-cell">—</td>';
        }
    }

    container.innerHTML = `
        <div class="qm-dashboard">
            <!-- Top Bar -->
            <div class="qm-topbar">
                <div class="qm-topbar-left">
                    <button class="qm-back-btn" onclick="stopMonitoring();openQuizMonitor()">&#x2190;</button>
                    <h2 class="qm-quiz-title">${escHtml(mon.test.name)}</h2>
                    <span class="qm-quiz-badge">${totalQs} Qs</span>
                </div>
                <div class="qm-topbar-right">
                    <button class="qm-action-btn qm-btn-pause" onclick="toggleMonitorPause()">
                        ${mon.paused ? '<span>&#9654;</span> Resume' : '<span>&#10074;&#10074;</span> Pause'}
                    </button>
                    <button class="qm-action-btn qm-btn-finish" onclick="finishMonitoring()">Finish Activity</button>
                    <button class="qm-action-btn qm-btn-invite" onclick="inviteStudents()">Invite Students</button>
                </div>
            </div>

            <!-- Toggle Bar -->
            <div class="qm-toggle-bar">
                <label class="qm-toggle">
                    <span>Show Names</span>
                    <input type="checkbox" ${mon.showNames ? 'checked' : ''} onchange="toggleMonitorOption('showNames', this.checked)">
                    <span class="qm-toggle-slider"></span>
                </label>
                <label class="qm-toggle">
                    <span>Show Responses</span>
                    <input type="checkbox" ${mon.showResponses ? 'checked' : ''} onchange="toggleMonitorOption('showResponses', this.checked)">
                    <span class="qm-toggle-slider"></span>
                </label>
                <label class="qm-toggle">
                    <span>Show Results</span>
                    <input type="checkbox" ${mon.showResults ? 'checked' : ''} onchange="toggleMonitorOption('showResults', this.checked)">
                    <span class="qm-toggle-slider"></span>
                </label>
                <div class="qm-toggle-stats">
                    <span class="qm-stat-pill online">${onlineCount} online</span>
                    <span class="qm-stat-pill completed">${completedCount} done</span>
                    <span class="qm-stat-pill total">${studentCount} total</span>
                </div>
            </div>

            <!-- Grid Table -->
            <div class="qm-grid-wrap">
                ${studentCount === 0 ? `
                    <div class="qm-empty-state">
                        <div class="qm-empty-icon">&#128100;</div>
                        <h3>Waiting for students...</h3>
                        <p>Share the quiz link to get started. Student responses will appear here in real time.</p>
                        <button class="qm-action-btn qm-btn-invite" onclick="inviteStudents()" style="margin-top:12px;">Invite Students</button>
                    </div>
                ` : `
                    <table class="qm-grid">
                        <thead>
                            <tr>
                                <th class="qm-header-name">Student</th>
                                <th class="qm-header-score">Score</th>
                                ${qHeaders}
                            </tr>
                        </thead>
                        <tbody>
                            ${studentRows}
                        </tbody>
                        <tfoot>
                            <tr class="qm-class-total">
                                <td class="qm-total-label">Class Total</td>
                                <td class="qm-total-avg">${mon.showResults ? classAvg + '%' : '—'}</td>
                                ${totalCells}
                            </tr>
                        </tfoot>
                    </table>
                `}
            </div>

            <!-- Footer -->
            <div class="qm-footer">
                <span>${studentCount} student${studentCount !== 1 ? 's' : ''}</span>
                <span class="qm-footer-dot">&middot;</span>
                <span>${completedCount} completed</span>
                <span class="qm-footer-dot">&middot;</span>
                <span>Auto-refreshing</span>
            </div>
        </div>
    `;
}

// ---- Monitor Actions ----

export function toggleMonitorPause() {
    mon.paused = !mon.paused;
    if (mon.paused) {
        if (mon.refreshInterval) clearInterval(mon.refreshInterval);
        mon.refreshInterval = null;
    } else {
        mon.refreshInterval = setInterval(() => renderMonitorGrid(), 2000);
    }
    renderMonitorGrid();
}

export function toggleMonitorOption(option, value) {
    mon[option] = value;
    renderMonitorGrid();
}

export async function inviteStudents() {
    if (!mon.test) return;
    const compressed = compressTestForURL(mon.test);
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?quiz=${compressed}`;

    if (link.length > 8000) {
        window.showToast('Quiz too large for URL sharing. Export JSON instead.', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(link);
        window.showToast('Quiz link copied! Share with students.', 'success');
    } catch (e) {
        // Fallback: show in prompt
        prompt('Copy this quiz link:', link);
    }
}

export function finishMonitoring() {
    // Send finish signal to all students
    if (mon.channel) {
        mon.channel.postMessage({ type: 'finish' });
    }
    stopMonitoring();
    // Go to results view
    if (mon.testId) {
        window.showQuizResults(mon.testId);
    }
}
