// Quiz Monitor — Socrative-style live quiz monitoring dashboard
// Layer 6: depends on state, data, quiz-storage, ui-core
//
// Teacher screen (2026-09-25): #quizMonitorView is drawn in the teacher style (--tv-* tokens,
// css/teacher-quiz.css): a header with Back on the left and one primary action (Finish), three
// switches for what the grid shows, and a neutral student x question grid. The grid re-renders
// every 2 s but only touches the DOM when its markup changed, so keyboard focus survives.

import { SKILLS } from './data.js';
import { loadTest, listTests, getResultsForTest, migrateTestToSections, getAllQuestionsFlat, getTotalQuestionCount, compressTestForURL } from './quiz-storage.js';
import { icon, cleanLabel, copyText, fmtDay } from './teacher-ui.js';
import { note, backHTML, goQuizzes } from './teacher-quiz-ui.js';

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
    paused: false,
    lastHTML: ''            // the last markup drawn (skip identical re-renders)
};

function getSkillLabel(skillId) {
    for (const catKey in SKILLS) {
        for (const sk of SKILLS[catKey]) {
            if (sk.v === skillId) return cleanLabel(sk.l);
        }
    }
    return skillId;
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

/** Leave the monitor: back to the teacher Quizzes screen, or the pupil home. */
export function closeQuizMonitor() {
    stopMonitoring();
    mon.testId = null;
    mon.test = null;
    mon.lastHTML = '';
    goQuizzes();
}

function monitorRoot() {
    const view = document.getElementById('quizMonitorView');
    if (!view) return null;
    view.classList.add('tvq');
    return view;
}

// ---- Open Monitor: Quiz Selector ----

export async function openQuizMonitor(testId) {
    if (!monitorRoot()) return;
    window.showView('quizMonitorView');
    window.scrollTo(0, 0);
    if (testId) {
        startMonitoring(testId);
    } else {
        stopMonitoring();
        mon.test = null;
        showMonitorSelector();
    }
}

async function showMonitorSelector() {
    let tests = [];
    try { tests = await listTests(); } catch (e) { tests = []; }
    const container = monitorRoot();
    if (!container) return;
    mon.lastHTML = '';
    tests.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

    container.innerHTML = `
<div class="tvq-page">
  <div class="tvq-topline">${backHTML('Quizzes', 'closeQuizMonitor()')}</div>
  <header class="tv-header">
    <div><h1 class="tv-h1">Live monitor</h1><p class="tv-sub">Choose a quiz to watch pupils answer it in real time.</p></div>
  </header>
  <section class="tv-card tv-flush" aria-label="Quizzes">
    ${tests.length === 0
        ? `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('sheet', 22)}</span><div class="tv-h3">No quizzes yet</div><p class="tv-cap">Create a quiz first, then monitor it here.</p>
             <button type="button" class="tv-btn tv-btn-primary" onclick="closeQuizMonitor()">${icon('plus', 18)}<span>Create a quiz</span></button></div>`
        : `<ul class="tvq-list">${tests.map((t) => {
            const qCount = t.sections ? getTotalQuestionCount(t) : (t.questions ? t.questions.length : 0);
            return `<li class="tvq-list-row">
              <div class="tvq-list-main"><span class="tv-cell-title">${escHtml(t.name || 'Untitled Quiz')}</span><span class="tv-cell-sub">${qCount} question${qCount === 1 ? '' : 's'} · ${escHtml(fmtDay(t.updatedAt || t.createdAt))}</span></div>
              <button type="button" class="tv-btn" onclick="openQuizMonitor('${escHtml(t.id)}')">${icon('eye', 18)}<span>Monitor</span></button>
            </li>`;
        }).join('')}</ul>`}
  </section>
</div>`;
}

// ---- Start Monitoring ----

async function startMonitoring(testId) {
    // Clean up previous
    stopMonitoring();

    mon.testId = testId;
    mon.test = await loadTest(testId);
    if (!mon.test) {
        note('Quiz not found', 'error');
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

function switchHTML(key, label, on) {
    return `<button type="button" class="tvq-switch-btn" role="switch" aria-checked="${on}" onclick="toggleMonitorOption('${key}', ${!on})"><span class="tvq-switch-label">${label}</span><span class="tv-switch" aria-hidden="true"></span></button>`;
}

function renderMonitorGrid() {
    const container = document.getElementById('quizMonitorView');
    if (!container || !mon.test) return;

    // Left the monitor (another view is showing): stop polling.
    if (!container.classList.contains('active')) {
        stopMonitoring();
        return;
    }

    const totalQs = mon.allQs.length;
    const studentList = Array.from(mon.students.values());
    const studentCount = studentList.length;
    const onlineCount = studentList.filter(s => s.online).length;
    const completedCount = studentList.filter(s => s.completed).length;

    // Per-question class totals
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

    const classAvg = studentList.length > 0
        ? Math.round(studentList.reduce((sum, s) => sum + s.percentage, 0) / studentList.length)
        : 0;

    let qHeaders = '';
    for (let q = 0; q < totalQs; q++) {
        const skillLabel = getSkillLabel(mon.allQs[q].question.skillId);
        qHeaders += `<th scope="col" class="qm-q-header" title="Q${q + 1}: ${escHtml(skillLabel)}"><span class="tv-sr">Question </span>${q + 1}</th>`;
    }

    let studentRows = '';
    studentList.forEach((s, idx) => {
        const status = s.completed ? 'completed' : (s.online ? 'online' : 'offline');
        const statusText = s.completed ? 'Finished' : (s.online ? 'Answering' : 'Away');
        const nameDisplay = mon.showNames ? escHtml(s.name) : `Pupil ${idx + 1}`;

        let answerCells = '';
        for (let q = 0; q < totalQs; q++) {
            const a = s.answers[q];
            if (!a || a.studentAnswer === undefined) {
                answerCells += '<td class="qm-cell qm-cell-empty"><span class="tv-sr">Not answered</span></td>';
            } else if (mon.showResponses) {
                if (mon.showResults) {
                    answerCells += a.correct
                        ? `<td class="qm-cell qm-cell-correct" title="${escHtml(String(a.studentAnswer))}">${icon('check', 16)}<span class="tv-sr">Right</span></td>`
                        : `<td class="qm-cell qm-cell-incorrect" title="${escHtml(String(a.studentAnswer))}">${icon('x', 16)}<span class="tv-sr">Wrong</span></td>`;
                } else {
                    answerCells += '<td class="qm-cell qm-cell-answered"><span class="qm-dot" aria-hidden="true"></span><span class="tv-sr">Answered</span></td>';
                }
            } else {
                answerCells += '<td class="qm-cell qm-cell-hidden"><span class="tv-sr">Hidden</span></td>';
            }
        }

        const scoreDisplay = mon.showResults ? `${s.percentage}%` : '<span class="tv-muted">–</span>';
        studentRows += `<tr>
            <th scope="row" class="qm-name-cell"><span class="qm-status ${status}" title="${statusText}" aria-hidden="true"></span><span class="qm-student-name">${nameDisplay}</span><span class="tv-sr"> (${statusText})</span></th>
            <td class="qm-score-cell">${scoreDisplay}</td>
            ${answerCells}
        </tr>`;
    });

    let totalCells = '';
    for (let q = 0; q < totalQs; q++) {
        const t = classTotals[q];
        if (t.pct !== null && mon.showResults) {
            const cls = t.pct >= 70 ? 'high' : (t.pct >= 50 ? 'mid' : 'low');
            totalCells += `<td class="qm-total-cell qm-total-${cls}">${t.pct}%</td>`;
        } else {
            totalCells += '<td class="qm-total-cell"><span class="tv-muted">–</span></td>';
        }
    }

    const html = `
<div class="tvq-page">
  <div class="tvq-topline">${backHTML('Quizzes', 'closeQuizMonitor()')}</div>
  <header class="tv-header">
    <div class="tvq-title">
      <h1 class="tv-h1">${escHtml(mon.test.name || 'Untitled Quiz')}</h1>
      <p class="tv-sub">Live monitor · ${totalQs} question${totalQs === 1 ? '' : 's'} · ${mon.paused ? 'Paused' : 'Updating every few seconds'}</p>
    </div>
    <div class="tv-header-actions">
      <button type="button" class="tv-btn" onclick="inviteStudents()">${icon('link', 18)}<span>Copy pupil link</span></button>
      <button type="button" class="tv-btn" onclick="toggleMonitorPause()" aria-pressed="${mon.paused}">${icon(mon.paused ? 'play' : 'pause', 18)}<span>${mon.paused ? 'Resume' : 'Pause'}</span></button>
      <button type="button" class="tv-btn tv-btn-primary" onclick="finishMonitoring()">${icon('check', 18)}<span>Finish and see results</span></button>
    </div>
  </header>
  <section class="tv-card tvq-monbar" aria-label="What the grid shows">
    <div class="tvq-switches">
      ${switchHTML('showNames', 'Show names', mon.showNames)}
      ${switchHTML('showResponses', 'Show answers', mon.showResponses)}
      ${switchHTML('showResults', 'Show right and wrong', mon.showResults)}
    </div>
    <p class="tvq-counts" aria-live="polite"><span><strong>${onlineCount}</strong> answering</span><span><strong>${completedCount}</strong> finished</span><span><strong>${studentCount}</strong> joined</span></p>
  </section>
  <section class="tv-card tv-flush" aria-label="Pupils and questions">
    ${studentCount === 0 ? `
      <div class="tv-empty-lg">
        <span class="tv-empty-icon" aria-hidden="true">${icon('eye', 22)}</span>
        <div class="tv-h3">Waiting for pupils</div>
        <p class="tv-cap">Share the quiz link. Each pupil appears here as soon as they start, with a mark for every question they answer.</p>
        <button type="button" class="tv-btn tv-btn-primary" onclick="inviteStudents()">${icon('link', 18)}<span>Copy pupil link</span></button>
      </div>` : `
      <div class="qm-grid-wrap">
        <table class="qm-grid">
          <thead><tr><th scope="col" class="qm-header-name">Pupil</th><th scope="col" class="qm-header-score">Score</th>${qHeaders}</tr></thead>
          <tbody>${studentRows}</tbody>
          <tfoot><tr><th scope="row" class="qm-total-label">Class</th><td class="qm-total-avg">${mon.showResults ? classAvg + '%' : '<span class="tv-muted">–</span>'}</td>${totalCells}</tr></tfoot>
        </table>
      </div>
      <p class="tvq-legend tv-cap"><span><span class="qm-status online"></span> Answering</span><span><span class="qm-status completed"></span> Finished</span><span><span class="qm-status offline"></span> Away</span><span>Hover a question number for its skill.</span></p>`}
  </section>
</div>`;

    if (html === mon.lastHTML) return;
    // Keep keyboard focus on the same control across a re-render.
    const act = document.activeElement;
    let focusKey = null;
    if (act && container.contains(act)) {
        focusKey = act.getAttribute('onclick') || null;
    }
    const scroller = container.querySelector('.qm-grid-wrap');
    const sx = scroller ? scroller.scrollLeft : 0;
    container.innerHTML = html;
    mon.lastHTML = html;
    const wrap = container.querySelector('.qm-grid-wrap');
    if (wrap && sx) wrap.scrollLeft = sx;
    if (focusKey) {
        const base = focusKey.replace(/,\s*(true|false)\)$/, '');
        const next = Array.from(container.querySelectorAll('[onclick]')).find((el) => (el.getAttribute('onclick') || '').replace(/,\s*(true|false)\)$/, '') === base);
        if (next) next.focus();
    }
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
        note('This quiz is too large for a link. Export it as JSON instead.', 'error');
        return;
    }
    if (await copyText(link)) note('Pupil link copied', 'success');
    else prompt('Copy this quiz link:', link);
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
