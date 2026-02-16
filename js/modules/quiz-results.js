// Quiz Results — Teacher-facing analytics and CSV export
// Layer 5: depends on state, data, quiz-storage, ui-core

import { SKILLS } from './data.js';
import { loadTest, listTests, getResultsForTest, exportResultsCSV, saveResult, migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount } from './quiz-storage.js';
import { shuffle } from './utils.js';

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

// ---- Show Results View ----

export async function showQuizResults(testId) {
    if (!testId) {
        showQuizResultsSelector();
        return;
    }

    const test = await loadTest(testId);
    const results = await getResultsForTest(testId);
    const container = document.getElementById('quizResultsView');
    if (!container) return;

    window.showView('quizResultsView');

    if (!test) {
        container.innerHTML = `
            <div class="quiz-header">
                <h2>Results</h2>
                <button class="btn btn-sm btn-secondary" onclick="showView('homeView')">Back</button>
            </div>
            <div class="qb-empty">Quiz not found. It may have been deleted.</div>
        `;
        return;
    }

    migrateTestToSections(test);
    const allQs = getAllQuestionsFlat(test);
    const totalCount = allQs.length;

    // Calculate analytics
    const analytics = calculateQuizAnalytics(test, allQs, results);

    container.innerHTML = `
        <div class="quiz-header">
            <div>
                <h2>${escHtml(test.name)} — Results</h2>
                <span style="font-size:0.85rem;color:var(--text-dim);">${results.length} submission${results.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="quiz-header-actions">
                <button class="qb-toolbar-btn export" onclick="exportQuizCSV('${testId}')">Export CSV</button>
                <button class="qb-toolbar-btn import" onclick="importStudentResultsFile('${testId}')">Import Results</button>
                <button class="btn btn-sm btn-secondary" onclick="openMyQuizzes()">Back</button>
            </div>
        </div>

        <div class="qr-container">
            ${results.length > 0 ? `
                <div class="qr-summary">
                    <div class="qr-stat-card">
                        <div class="qr-stat-val">${analytics.avgScore}%</div>
                        <div class="qr-stat-label">Average Score</div>
                    </div>
                    <div class="qr-stat-card">
                        <div class="qr-stat-val">${analytics.passRate}%</div>
                        <div class="qr-stat-label">Pass Rate</div>
                    </div>
                    <div class="qr-stat-card">
                        <div class="qr-stat-val">${analytics.highest}%</div>
                        <div class="qr-stat-label">Highest</div>
                    </div>
                    <div class="qr-stat-card">
                        <div class="qr-stat-val">${analytics.lowest}%</div>
                        <div class="qr-stat-label">Lowest</div>
                    </div>
                </div>

                <div class="qr-table-wrap">
                    <table class="qr-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Score</th>
                                <th>%</th>
                                <th>Time</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => {
                                const timeMins = r.completedAt && r.startedAt
                                    ? Math.round((r.completedAt - r.startedAt) / 60000)
                                    : '—';
                                const date = r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—';
                                const pass = r.percentage >= (test.settings.passingScore || 70);
                                return `<tr onclick="showStudentQuizDetail('${r.id}', '${testId}')" style="cursor:pointer;">
                                    <td><strong>${escHtml(r.studentName)}</strong></td>
                                    <td>${r.score}/${r.totalPoints}</td>
                                    <td>${r.percentage}%</td>
                                    <td>${timeMins} min</td>
                                    <td>${date}</td>
                                    <td class="${pass ? 'qr-pass' : 'qr-fail'}">${pass ? 'Pass' : 'Fail'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="qr-q-analysis">
                    <h3 style="margin:0 0 12px;">Skill Strengths & Weaknesses</h3>
                    <div style="font-size:0.82rem;color:var(--text-dim);margin-bottom:12px;">Skills sorted from weakest to strongest across all students</div>
                    ${analytics.skillAnalysis.map(sa => {
                        const isLow = sa.pct < 50;
                        const isHigh = sa.pct >= 80;
                        const icon = isHigh ? '<span style="color:#059669;">&#9650;</span>' : (isLow ? '<span style="color:#dc2626;">&#9660;</span>' : '<span style="color:#f97316;">&#9679;</span>');
                        return `<div class="qr-q-bar-row">
                            <span class="qr-q-bar-label" style="min-width:auto;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(sa.label)}">${icon} ${escHtml(sa.label)}</span>
                            <div class="qr-q-bar-bg">
                                <div class="qr-q-bar-fill ${isLow ? 'low' : ''}" style="width:${sa.pct}%"></div>
                            </div>
                            <span class="qr-q-bar-pct">${sa.pct}%</span>
                            <span style="font-size:0.72rem;color:var(--text-dim);min-width:55px;">Q${sa.questionNums.join(',')}</span>
                        </div>`;
                    }).join('')}
                    ${analytics.skillAnalysis.length > 0 ? `
                        <div style="margin-top:16px;padding:12px;background:var(--bg-card-light);border-radius:10px;">
                            <div style="font-weight:700;font-size:0.9rem;margin-bottom:8px;">Summary</div>
                            ${(() => {
                                const weak = analytics.skillAnalysis.filter(s => s.pct < 50);
                                const strong = analytics.skillAnalysis.filter(s => s.pct >= 80);
                                const mid = analytics.skillAnalysis.filter(s => s.pct >= 50 && s.pct < 80);
                                let html = '';
                                if (strong.length > 0) {
                                    html += '<div style="margin-bottom:6px;"><span style="color:#059669;font-weight:700;">Strong areas:</span> ' + strong.map(s => escHtml(s.label) + ' (' + s.pct + '%)').join(', ') + '</div>';
                                }
                                if (mid.length > 0) {
                                    html += '<div style="margin-bottom:6px;"><span style="color:#f97316;font-weight:700;">Developing:</span> ' + mid.map(s => escHtml(s.label) + ' (' + s.pct + '%)').join(', ') + '</div>';
                                }
                                if (weak.length > 0) {
                                    html += '<div><span style="color:#dc2626;font-weight:700;">Needs practice:</span> ' + weak.map(s => escHtml(s.label) + ' (' + s.pct + '%)').join(', ') + '</div>';
                                }
                                if (!html) html = '<div style="color:var(--text-dim);">No data yet</div>';
                                return html;
                            })()}
                        </div>
                    ` : ''}
                </div>

                <div class="qr-q-analysis" style="margin-top:16px;">
                    <h3 style="margin:0 0 12px;">Per-Question Analysis</h3>
                    ${analytics.perQuestion.map((pq, i) => {
                        const isLow = pq.pct < 50;
                        const skillLabel = escHtml(getSkillLabel(allQs[i].question.skillId));
                        return `<div class="qr-q-bar-row">
                            <span class="qr-q-bar-label">Q${i + 1}</span>
                            <div class="qr-q-bar-bg" title="${skillLabel}">
                                <div class="qr-q-bar-fill ${isLow ? 'low' : ''}" style="width:${pq.pct}%"></div>
                            </div>
                            <span class="qr-q-bar-pct">${pq.pct}%</span>
                        </div>`;
                    }).join('')}
                </div>
            ` : `
                <div class="qb-empty">No submissions yet. Share the quiz link with students to collect results.</div>
            `}
        </div>
    `;
}

// ---- Quiz selector (when no testId provided) ----

async function showQuizResultsSelector() {
    const tests = await listTests();
    const container = document.getElementById('quizResultsView');
    if (!container) return;

    window.showView('quizResultsView');

    container.innerHTML = `
        <div class="quiz-header">
            <h2>Quiz Results</h2>
            <button class="btn btn-sm btn-secondary" onclick="showView('homeView')">Back</button>
        </div>
        <div class="qb-quiz-list">
            ${tests.length === 0 ? '<div class="qb-empty">No quizzes found.</div>' :
            tests.map(t => {
                const qCount = t.sections ? getTotalQuestionCount(t) : (t.questions ? t.questions.length : 0);
                return `
                <div class="qb-quiz-item" onclick="showQuizResults('${t.id}')">
                    <div>
                        <div class="qb-quiz-item-name">${escHtml(t.name)}</div>
                        <div class="qb-quiz-item-meta">${qCount} questions &middot; ${new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

// ---- Analytics ----

function calculateQuizAnalytics(test, allQs, results) {
    if (results.length === 0) {
        return { avgScore: 0, passRate: 0, highest: 0, lowest: 0, perQuestion: [], skillAnalysis: [] };
    }

    const percentages = results.map(r => r.percentage);
    const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const passScore = test.settings.passingScore || 70;
    const passCount = results.filter(r => r.percentage >= passScore).length;
    const passRate = Math.round((passCount / results.length) * 100);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    // Per-question analysis (using flattened question list)
    const perQuestion = allQs.map((qItem, i) => {
        let correct = 0;
        let total = 0;
        for (const r of results) {
            if (r.answers && r.answers[i]) {
                total++;
                if (r.answers[i].correct) correct++;
            }
        }
        return { pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
    });

    // Skill-level analysis: group questions by skillId
    const skillMap = {};
    allQs.forEach((qItem, i) => {
        const skillId = qItem.question.skillId;
        if (!skillMap[skillId]) {
            skillMap[skillId] = { skillId, label: getSkillLabel(skillId), correct: 0, total: 0, questionNums: [] };
        }
        skillMap[skillId].questionNums.push(i + 1);
        for (const r of results) {
            if (r.answers && r.answers[i]) {
                skillMap[skillId].total++;
                if (r.answers[i].correct) skillMap[skillId].correct++;
            }
        }
    });

    const skillAnalysis = Object.values(skillMap).map(s => ({
        ...s,
        pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
    }));
    skillAnalysis.sort((a, b) => a.pct - b.pct); // weakest first

    return { avgScore, passRate, highest, lowest, perQuestion, skillAnalysis };
}

// ---- Student Detail ----

export async function showStudentQuizDetail(resultId, testId) {
    const test = await loadTest(testId);
    const results = await getResultsForTest(testId);
    const result = results.find(r => r.id === resultId);
    if (!test || !result) return;

    migrateTestToSections(test);
    const allQs = getAllQuestionsFlat(test);
    const multiSection = test.sections.length > 1;

    const container = document.getElementById('quizResultsView');
    if (!container) return;

    const pass = result.percentage >= (test.settings.passingScore || 70);
    const timeMins = result.completedAt && result.startedAt
        ? Math.round((result.completedAt - result.startedAt) / 60000)
        : 0;

    // Build question table (grouped by section if multi-section)
    let questionTableHtml = '';
    if (multiSection) {
        for (let sIdx = 0; sIdx < test.sections.length; sIdx++) {
            const section = test.sections[sIdx];
            const sectionQs = allQs.filter(q => q.sectionIdx === sIdx);
            if (sectionQs.length === 0) continue;

            questionTableHtml += `<tr><td colspan="5" style="font-weight:800;color:var(--accent-purple);padding-top:12px;border-bottom:2px solid var(--accent-purple);">${escHtml(section.label)}</td></tr>`;

            for (const qItem of sectionQs) {
                const i = qItem.globalIdx;
                const q = qItem.question;
                const a = result.answers && result.answers[i];
                questionTableHtml += `<tr>
                    <td>Q${i + 1}</td>
                    <td>${escHtml(getSkillLabel(q.skillId))}</td>
                    <td>${a ? escHtml(String(a.studentAnswer || '—')) : '—'}</td>
                    <td>${escHtml(String(q.questionData.ans))}</td>
                    <td class="${a && a.correct ? 'qr-pass' : 'qr-fail'}">${a ? (a.correct ? 'Correct' : 'Incorrect') : 'Skipped'}</td>
                </tr>`;
            }
        }
    } else {
        for (let i = 0; i < allQs.length; i++) {
            const q = allQs[i].question;
            const a = result.answers && result.answers[i];
            questionTableHtml += `<tr>
                <td>Q${i + 1}</td>
                <td>${escHtml(getSkillLabel(q.skillId))}</td>
                <td>${a ? escHtml(String(a.studentAnswer || '—')) : '—'}</td>
                <td>${escHtml(String(q.questionData.ans))}</td>
                <td class="${a && a.correct ? 'qr-pass' : 'qr-fail'}">${a ? (a.correct ? 'Correct' : 'Incorrect') : 'Skipped'}</td>
            </tr>`;
        }
    }

    // Build student skill analysis
    const studentSkillMap = {};
    allQs.forEach((qItem, i) => {
        const skillId = qItem.question.skillId;
        if (!studentSkillMap[skillId]) {
            studentSkillMap[skillId] = { label: getSkillLabel(skillId), correct: 0, total: 0 };
        }
        studentSkillMap[skillId].total++;
        const a = result.answers && result.answers[i];
        if (a && a.correct) studentSkillMap[skillId].correct++;
    });
    const studentSkills = Object.values(studentSkillMap).map(s => ({
        ...s,
        pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
    }));
    studentSkills.sort((a, b) => a.pct - b.pct);
    const weak = studentSkills.filter(s => s.pct < 50);
    const strong = studentSkills.filter(s => s.pct >= 80);
    const mid = studentSkills.filter(s => s.pct >= 50 && s.pct < 80);

    container.innerHTML = `
        <div class="quiz-header">
            <div>
                <h2>${escHtml(result.studentName)}'s Results</h2>
                <span style="font-size:0.85rem;color:var(--text-dim);">${escHtml(test.name)}</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="showQuizResults('${testId}')">Back</button>
        </div>
        <div class="qr-container">
            <div class="qr-summary">
                <div class="qr-stat-card">
                    <div class="qr-stat-val">${result.score}/${result.totalPoints}</div>
                    <div class="qr-stat-label">Score</div>
                </div>
                <div class="qr-stat-card">
                    <div class="qr-stat-val ${pass ? 'qr-pass' : 'qr-fail'}">${result.percentage}%</div>
                    <div class="qr-stat-label">${pass ? 'Passed' : 'Failed'}</div>
                </div>
                <div class="qr-stat-card">
                    <div class="qr-stat-val">${timeMins} min</div>
                    <div class="qr-stat-label">Time Taken</div>
                </div>
                <div class="qr-stat-card">
                    <div class="qr-stat-val">${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : '—'}</div>
                    <div class="qr-stat-label">Date</div>
                </div>
            </div>

            <div class="qr-table-wrap">
                <table class="qr-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Skill</th>
                            <th>Student Answer</th>
                            <th>Correct Answer</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${questionTableHtml}
                    </tbody>
                </table>
            </div>

            <div class="qr-q-analysis" style="margin-top:16px;">
                <h3 style="margin:0 0 8px;">Skill Analysis</h3>
                ${studentSkills.map(s => {
                    const isLow = s.pct < 50;
                    const icon = s.pct >= 80 ? '<span style="color:#059669;">&#9650;</span>' : (isLow ? '<span style="color:#dc2626;">&#9660;</span>' : '<span style="color:#f97316;">&#9679;</span>');
                    return '<div class="qr-q-bar-row">' +
                        '<span class="qr-q-bar-label" style="min-width:auto;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + icon + ' ' + escHtml(s.label) + '</span>' +
                        '<div class="qr-q-bar-bg"><div class="qr-q-bar-fill ' + (isLow ? 'low' : '') + '" style="width:' + s.pct + '%"></div></div>' +
                        '<span class="qr-q-bar-pct">' + s.correct + '/' + s.total + '</span>' +
                        '</div>';
                }).join('')}
                <div style="margin-top:12px;padding:10px;background:var(--bg-card-light);border-radius:8px;font-size:0.88rem;">
                    ${strong.length > 0 ? '<div style="margin-bottom:4px;"><span style="color:#059669;font-weight:700;">Strong:</span> ' + strong.map(s => escHtml(s.label)).join(', ') + '</div>' : ''}
                    ${mid.length > 0 ? '<div style="margin-bottom:4px;"><span style="color:#f97316;font-weight:700;">Developing:</span> ' + mid.map(s => escHtml(s.label)).join(', ') + '</div>' : ''}
                    ${weak.length > 0 ? '<div><span style="color:#dc2626;font-weight:700;">Needs practice:</span> ' + weak.map(s => escHtml(s.label)).join(', ') + '</div>' : ''}
                </div>
            </div>
        </div>
    `;
}

// ---- CSV Export ----

export async function exportQuizCSV(testId) {
    const csv = await exportResultsCSV(testId);
    if (!csv) {
        window.showToast('No results to export', 'error');
        return;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('CSV exported!', 'success');
}

// ---- Import Student Results ----

export function importStudentResultsFile(testId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    input.onchange = async (e) => {
        let imported = 0;
        for (const file of e.target.files) {
            try {
                const text = await file.text();
                const result = JSON.parse(text);
                // Override testId to associate with this quiz
                result.testId = testId;
                result.id = null; // generate new ID
                await saveResult(result);
                imported++;
            } catch (err) {
                console.warn('Failed to import result file:', file.name, err);
            }
        }
        if (imported > 0) {
            window.showToast(`Imported ${imported} result${imported > 1 ? 's' : ''}`, 'success');
            showQuizResults(testId);
        } else {
            window.showToast('No valid result files found', 'error');
        }
    };
    input.click();
}

// ---- Print Quiz with Answer Key (Section-Aware + Shuffle Versions) ----

const SPACING_MAP = { compact: '6px 4px', normal: '15px 12px', spacious: '25px 20px' };

export function printQuizTest(quiz, options = {}) {
    const { includeAnswerKey = true, includeNameField = true, shuffleWithinSections = false, printVersions = 1 } = options;

    migrateTestToSections(quiz);
    const allQs = getAllQuestionsFlat(quiz);
    const totalPoints = allQs.reduce((s, item) => s + (item.question.points || 1), 0);
    const multiSection = quiz.sections.length > 1;
    const numVersions = Math.max(1, Math.min(6, printVersions || 1));

    let html = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <title>${escHtml(quiz.name)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Nunito', sans-serif; margin: 20px 40px; color: #1a1a2e; }
            h1 { font-size: 1.5rem; margin-bottom: 4px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; position: relative; }
            .version-label { position: absolute; top: 0; right: 0; font-size: 0.9rem; font-weight: 700; color: #8b5cf6; padding: 4px 12px; border: 2px solid #8b5cf6; border-radius: 8px; }
            .name-line { margin-top: 8px; font-size: 1rem; }
            .name-line span { display: inline-block; width: 250px; border-bottom: 1px solid #333; margin-left: 8px; }
            .section-header { font-size: 1.1rem; font-weight: 800; color: #1a1a2e; border-bottom: 2px solid #8b5cf6; padding: 8px 0 4px; margin: 18px 0 10px; }
            .section-instructions { font-size: 0.85rem; color: #666; font-style: italic; margin-bottom: 8px; }
            .section-grid { display: grid; gap: 15px 12px; }
            .question { page-break-inside: avoid; }
            .q-num { font-weight: 800; color: #8b5cf6; }
            .q-text { font-size: 1rem; margin: 4px 0; line-height: 1.5; }
            .q-visual { margin: 8px 0; }
            .q-answer-line { margin-top: 8px; border-bottom: 1px solid #ccc; width: 200px; height: 24px; }
            .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-width: 400px; margin-top: 8px; }
            .q-option { padding: 6px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; }
            .q-points { float: right; font-size: 0.8rem; color: #666; }
            .answer-key { page-break-before: always; }
            .answer-key h2 { border-bottom: 2px solid #333; padding-bottom: 8px; }
            .ak-item { display: flex; gap: 10px; padding: 4px 0; border-bottom: 1px solid #eee; font-size: 0.95rem; }
            .ak-num { font-weight: 700; min-width: 40px; }
            .ak-ans { font-weight: 700; color: #059669; }
            @media print {
                body { margin: 15mm; }
                .no-print { display: none; }
            }
        </style>
    </head><body>`;

    // Generate each version
    for (let v = 0; v < numVersions; v++) {
        // Header
        html += `<div class="header">`;
        if (numVersions > 1) {
            html += `<div class="version-label">Version ${v + 1}</div>`;
        }
        html += `<h1>${escHtml(quiz.name)}</h1>`;
        if (includeNameField) {
            html += `<div class="name-line">Name: <span>&nbsp;</span> Date: <span style="width:150px;">&nbsp;</span></div>`;
        }
        html += `<div style="font-size:0.85rem;color:#666;margin-top:4px;">${allQs.length} Questions &middot; ${totalPoints} Points${quiz.settings.timeLimit ? ' &middot; ' + quiz.settings.timeLimit + ' minutes' : ''}</div>`;
        html += '</div>';

        // Render each section
        for (let sIdx = 0; sIdx < quiz.sections.length; sIdx++) {
            const section = quiz.sections[sIdx];
            const globalOffset = getGlobalOffset(quiz, sIdx);

            // Section header (only show if multi-section)
            if (multiSection) {
                html += `<div class="section-header">${escHtml(section.label)}</div>`;
                if (section.instructions) {
                    html += `<div class="section-instructions">${escHtml(section.instructions)}</div>`;
                }
            }

            // Build question list for this section
            let sectionQuestions = section.questions.map((q, i) => ({
                question: q,
                globalNum: globalOffset + i + 1 // 1-based canonical number
            }));

            // Shuffle within section for different versions
            if (shuffleWithinSections && numVersions > 1) {
                sectionQuestions = shuffle([...sectionQuestions]);
            }

            // Render section grid with per-section columns
            const cols = section.layout ? section.layout.columns || 2 : 2;
            const spacing = section.layout ? (SPACING_MAP[section.layout.spacing] || SPACING_MAP.normal) : SPACING_MAP.normal;

            html += `<div class="section-grid" style="grid-template-columns: repeat(${cols}, 1fr); gap: ${spacing};">`;

            for (const sq of sectionQuestions) {
                const qd = sq.question.questionData;
                html += `<div class="question">
                    <div><span class="q-num">Q${sq.globalNum}.</span> <span class="q-points">(${sq.question.points || 1} pt${(sq.question.points || 1) > 1 ? 's' : ''})</span></div>
                    <div class="q-text">${qd.text || ''}</div>`;
                if (qd.visual) {
                    html += `<div class="q-visual">${qd.visual}</div>`;
                }
                if (qd.options && qd.options.length > 0 && qd.answerType === 'multiple-choice') {
                    html += '<div class="q-options">';
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    qd.options.forEach((opt, j) => {
                        html += `<div class="q-option">${letters[j] || (j + 1)}. ${escHtml(String(opt))}</div>`;
                    });
                    html += '</div>';
                } else {
                    html += '<div class="q-answer-line"></div>';
                }
                html += '</div>';
            }

            html += '</div>'; // section-grid
        }

        // Page break between versions (not after last)
        if (v < numVersions - 1) {
            html += '<div style="page-break-after:always;"></div>';
        }
    }

    // Answer Key (canonical order, one copy for all versions)
    if (includeAnswerKey) {
        html += `<div class="answer-key">
            <h2>Answer Key — ${escHtml(quiz.name)}</h2>`;
        for (let i = 0; i < allQs.length; i++) {
            const q = allQs[i].question;
            const qd = q.questionData;
            let ansDisplay = String(qd.ans);
            if (qd.options && qd.options.length > 0 && qd.answerType === 'multiple-choice') {
                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                const idx = qd.options.indexOf(qd.ans);
                if (idx >= 0) ansDisplay = letters[idx] + '. ' + String(qd.ans);
            }
            html += `<div class="ak-item">
                <span class="ak-num">Q${i + 1}</span>
                <span class="ak-ans">${escHtml(ansDisplay)}</span>
                <span style="color:#888;font-size:0.82rem;">${escHtml(getSkillLabel(q.skillId))}</span>
            </div>`;
        }
        html += '</div>';
    }

    html += `<div class="no-print" style="text-align:center;margin-top:30px;">
        <button onclick="window.print()" style="padding:10px 30px;font-size:1rem;background:#8b5cf6;color:white;border:none;border-radius:10px;cursor:pointer;">Print</button>
    </div>`;
    html += '</body></html>';

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}
