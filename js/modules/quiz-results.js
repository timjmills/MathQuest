// Quiz Results — Teacher-facing analytics and CSV export
// Layer 5: depends on state, data, quiz-storage, ui-core

import { SKILLS } from './data.js';
import { compressTestForURL, loadTest, listTests, getResultsForTest, exportResultsCSV, saveResult, migrateTestToSections, getAllQuestionsFlat, getGlobalOffset, getTotalQuestionCount } from './quiz-storage.js';
import { shuffle } from './utils.js';
import { icon, cleanLabel, copyText, fmtDay } from './teacher-ui.js';
import { note, backHTML, goQuizzes } from './teacher-quiz-ui.js';

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

// ---- Show Results View ----
//
// Teacher screen (2026-09-25): drawn in the teacher style (--tv-* tokens, css/teacher-quiz.css).
// Back sits on the left; CSV export, importing results and Google Forms live under "More"; the
// empty state offers the pupil link. Only the teacher reaches this view (pupils see their own
// result card in quiz-take.js, which is unchanged).

export function closeQuizResults() { goQuizzes(); }

function resultsRoot() {
    const el = document.getElementById('quizResultsView');
    if (el) el.classList.add('tvq');
    return el;
}

/** Copy the pupil link of a quiz (the empty state's primary action). */
export async function copyQuizLinkFromResults(testId) {
    const test = await loadTest(testId);
    if (!test) return;
    const url = `${location.origin}${location.pathname}?quiz=${compressTestForURL(test)}`;
    if (url.length > 8000) { note('This quiz is too large for a link. Export it as JSON instead.', 'error'); return; }
    if (await copyText(url)) note('Pupil link copied', 'success');
    else prompt('Copy this quiz link:', url);
}

const pctClass = (pct) => (pct >= 80 ? 'is-strong' : pct >= 50 ? 'is-mid' : 'is-weak');

function barRow(label, pct, right, title) {
    return `<div class="tvq-bar-row">
      <span class="tvq-bar-label" title="${escHtml(title || label)}">${escHtml(label)}</span>
      <span class="tvq-bar" role="img" aria-label="${escHtml(label)}: ${pct}%"><span class="tvq-bar-fill ${pctClass(pct)}" style="width:${Math.max(0, Math.min(100, pct))}%"></span></span>
      <span class="tvq-bar-pct">${right}</span>
    </div>`;
}

function statTiles(tiles) {
    return `<div class="tvq-stats">${tiles.map(([v, l, cls]) => `<div class="tv-card tvq-stat"><div class="tvq-stat-val${cls ? ' ' + cls : ''}">${v}</div><div class="tv-cap">${l}</div></div>`).join('')}</div>`;
}

function summaryHTML(list, withPct) {
    const groups = [
        ['is-weak', 'Needs practice', list.filter(x => x.pct < 50)],
        ['is-mid', 'Developing', list.filter(x => x.pct >= 50 && x.pct < 80)],
        ['is-strong', 'Strong', list.filter(x => x.pct >= 80)],
    ];
    const rows = groups.filter(g => g[2].length).map(([cls, name, items]) => `<div class="tvq-sum-row"><span class="tvq-tag ${cls}">${name}</span><span class="tv-body">${items.map(x => escHtml(x.label) + (withPct ? ` (${x.pct}%)` : '')).join(', ')}</span></div>`);
    return rows.length ? `<div class="tvq-summary">${rows.join('')}</div>` : '';
}

export async function showQuizResults(testId) {
    if (!testId) {
        showQuizResultsSelector();
        return;
    }

    const test = await loadTest(testId);
    const results = await getResultsForTest(testId);
    const container = resultsRoot();
    if (!container) return;

    window.showView('quizResultsView');
    window.scrollTo(0, 0);

    if (!test) {
        container.innerHTML = `<div class="tvq-page">
  <div class="tvq-topline">${backHTML('Quizzes', 'closeQuizResults()')}</div>
  <header class="tv-header"><div><h1 class="tv-h1">Results</h1><p class="tv-sub">This quiz was not found. It may have been deleted.</p></div></header>
</div>`;
        return;
    }

    migrateTestToSections(test);
    const allQs = getAllQuestionsFlat(test);
    const analytics = calculateQuizAnalytics(test, allQs, results);
    const pass = test.settings.passingScore || 70;
    const safeId = escHtml(testId);

    const more = `<div class="tv-menu-wrap">
      <button type="button" class="tv-btn" aria-haspopup="true" aria-expanded="false" onclick="tvqMenu(this)">${icon('dots', 18)}<span>More</span></button>
      <div class="tv-menu" hidden>
        <button type="button" onclick="exportQuizCSV('${safeId}')"${results.length ? '' : ' disabled'}>${icon('download', 16)}<span>Export results (CSV)</span></button>
        <button type="button" onclick="importStudentResultsFile('${safeId}')">${icon('upload', 16)}<span>Import pupil results</span></button>
        <button type="button" onclick="exportQuizToGoogleForms('${safeId}')">${icon('external', 16)}<span>Export to Google Forms</span></button>
      </div>
    </div>`;

    const rows = results.map((r) => {
        const timeMins = r.completedAt && r.startedAt ? Math.max(0, Math.round((r.completedAt - r.startedAt) / 60000)) : null;
        const ok = r.percentage >= pass;
        return `<tr>
          <td data-label="Pupil"><button type="button" class="tv-cell-title tv-link-row" onclick="showStudentQuizDetail('${escHtml(r.id)}', '${safeId}')">${escHtml(r.studentName || 'Anonymous')}</button></td>
          <td data-label="Score">${r.score}/${r.totalPoints} <span class="tv-muted">(${r.percentage}%)</span></td>
          <td data-label="Time">${timeMins == null ? '–' : timeMins < 1 ? 'Under 1 min' : `${timeMins} min`}</td>
          <td data-label="Date">${r.completedAt ? escHtml(fmtDay(r.completedAt)) : '–'}</td>
          <td data-label="Result"><span class="tvq-tag ${ok ? 'is-strong' : 'is-weak'}">${ok ? 'Passed' : 'Below pass mark'}</span></td>
        </tr>`;
    }).join('');

    container.innerHTML = `<div class="tvq-page">
  <div class="tvq-topline">${backHTML('Quizzes', 'closeQuizResults()')}</div>
  <header class="tv-header">
    <div class="tvq-title"><h1 class="tv-h1">${escHtml(test.name || 'Untitled Quiz')}</h1><p class="tv-sub">Results · ${results.length} submission${results.length !== 1 ? 's' : ''} · pass mark ${pass}%</p></div>
    <div class="tv-header-actions">
      <button type="button" class="tv-btn" onclick="copyQuizLinkFromResults('${safeId}')">${icon('link', 18)}<span>Copy pupil link</span></button>
      ${more}
    </div>
  </header>
  ${results.length > 0 ? `
  ${statTiles([[analytics.avgScore + '%', 'Average score'], [analytics.passRate + '%', 'Passed'], [analytics.highest + '%', 'Highest'], [analytics.lowest + '%', 'Lowest']])}
  <section class="tv-card tv-flush" aria-labelledby="tvqResH">
    <div class="tv-card-head"><div class="tv-row"><h2 class="tv-h2" id="tvqResH">Pupils</h2><span class="tv-cap">Open a name to see each answer</span></div></div>
    <table class="tv-table tvq-rows">
      <thead><tr><th scope="col">Pupil</th><th scope="col" style="width:150px;">Score</th><th scope="col" style="width:96px;">Time</th><th scope="col" style="width:120px;">Date</th><th scope="col" style="width:170px;">Result</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
  <div class="tvq-two">
    <section class="tv-card" aria-labelledby="tvqSkillH">
      <div><h2 class="tv-h2" id="tvqSkillH">Skills, weakest first</h2><p class="tv-cap">Share of right answers across all pupils</p></div>
      <div class="tvq-bars">${analytics.skillAnalysis.map(sa => barRow(sa.label, sa.pct, `${sa.pct}%`, `${sa.label} · questions ${sa.questionNums.join(', ')}`)).join('')}</div>
      ${summaryHTML(analytics.skillAnalysis, true)}
    </section>
    <section class="tv-card" aria-labelledby="tvqQH">
      <div><h2 class="tv-h2" id="tvqQH">Each question</h2><p class="tv-cap">Share of pupils who answered it right</p></div>
      <div class="tvq-bars">${analytics.perQuestion.map((pq, i) => barRow(`Q${i + 1} · ${getSkillLabel(allQs[i].question.skillId)}`, pq.pct, `${pq.pct}%`)).join('')}</div>
    </section>
  </div>` : `
  <section class="tv-card">
    <div class="tv-empty-lg">
      <span class="tv-empty-icon" aria-hidden="true">${icon('bars', 22)}</span>
      <div class="tv-h3">No results yet</div>
      <p class="tv-cap">Share the quiz link with your class. Results appear here when pupils submit on this device, or when you import their result files.</p>
      <button type="button" class="tv-btn tv-btn-primary" onclick="copyQuizLinkFromResults('${safeId}')">${icon('link', 18)}<span>Copy pupil link</span></button>
    </div>
  </section>`}
</div>`;
}

// ---- Quiz selector (when no testId provided) ----

async function showQuizResultsSelector() {
    let tests = [];
    try { tests = await listTests(); } catch (e) { tests = []; }
    const container = resultsRoot();
    if (!container) return;

    window.showView('quizResultsView');
    tests.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

    container.innerHTML = `<div class="tvq-page">
  <div class="tvq-topline">${backHTML('Quizzes', 'closeQuizResults()')}</div>
  <header class="tv-header"><div><h1 class="tv-h1">Quiz results</h1><p class="tv-sub">Choose a quiz to see how pupils did.</p></div></header>
  <section class="tv-card tv-flush" aria-label="Quizzes">
    ${tests.length === 0 ? `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('sheet', 22)}</span><div class="tv-h3">No quizzes yet</div><p class="tv-cap">Create a quiz first.</p></div>`
        : `<ul class="tvq-list">${tests.map(t => {
            const qCount = t.sections ? getTotalQuestionCount(t) : (t.questions ? t.questions.length : 0);
            return `<li class="tvq-list-row">
              <div class="tvq-list-main"><span class="tv-cell-title">${escHtml(t.name || 'Untitled Quiz')}</span><span class="tv-cell-sub">${qCount} question${qCount === 1 ? '' : 's'} · ${escHtml(fmtDay(t.updatedAt || t.createdAt))}</span></div>
              <button type="button" class="tv-btn" onclick="showQuizResults('${escHtml(t.id)}')">${icon('bars', 18)}<span>Results</span></button>
            </li>`;
        }).join('')}</ul>`}
  </section>
</div>`;
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

    const container = resultsRoot();
    if (!container) return;

    const pass = result.percentage >= (test.settings.passingScore || 70);
    const timeMins = result.completedAt && result.startedAt
        ? Math.max(0, Math.round((result.completedAt - result.startedAt) / 60000))
        : 0;

    const qRow = (i, q) => {
        const a = result.answers && result.answers[i];
        const tag = a ? (a.correct ? '<span class="tvq-tag is-strong">Right</span>' : '<span class="tvq-tag is-weak">Wrong</span>') : '<span class="tvq-tag">Skipped</span>';
        const label = escHtml(getSkillLabel(q.skillId));
        return `<tr>
          <td data-label="Question">Q${i + 1}</td>
          <td data-label="Skill"><span class="tv-cell-title tvq-plain" title="${label}">${label}</span></td>
          <td data-label="Pupil's answer">${a ? escHtml(String(a.studentAnswer || '–')) : '–'}</td>
          <td data-label="Right answer">${escHtml(String(q.questionData.ans))}</td>
          <td data-label="Result">${tag}</td>
        </tr>`;
    };

    let questionTableHtml = '';
    if (multiSection) {
        for (let sIdx = 0; sIdx < test.sections.length; sIdx++) {
            const section = test.sections[sIdx];
            const sectionQs = allQs.filter(q => q.sectionIdx === sIdx);
            if (sectionQs.length === 0) continue;
            questionTableHtml += `<tr class="tvq-section-row"><th scope="rowgroup" colspan="5">${escHtml(section.label)}</th></tr>`;
            for (const qItem of sectionQs) questionTableHtml += qRow(qItem.globalIdx, qItem.question);
        }
    } else {
        for (let i = 0; i < allQs.length; i++) questionTableHtml += qRow(i, allQs[i].question);
    }

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

    container.innerHTML = `<div class="tvq-page">
  <div class="tvq-topline">${backHTML('All results', `showQuizResults('${escHtml(testId)}')`)}</div>
  <header class="tv-header"><div class="tvq-title"><h1 class="tv-h1">${escHtml(result.studentName || 'Anonymous')}</h1><p class="tv-sub">${escHtml(test.name || 'Untitled Quiz')}</p></div></header>
  ${statTiles([[`${result.score}/${result.totalPoints}`, 'Score'], [`${result.percentage}%`, pass ? 'Passed' : 'Below pass mark', pass ? 'is-strong' : 'is-weak'], [timeMins < 1 ? 'Under 1 min' : `${timeMins} min`, 'Time taken'], [result.completedAt ? escHtml(fmtDay(result.completedAt)) : '–', 'Date']])}
  <section class="tv-card tv-flush" aria-labelledby="tvqAnsH">
    <div class="tv-card-head"><h2 class="tv-h2" id="tvqAnsH">Answers</h2></div>
    <table class="tv-table tvq-rows">
      <thead><tr><th scope="col" style="width:72px;">#</th><th scope="col">Skill</th><th scope="col" style="width:150px;">Pupil's answer</th><th scope="col" style="width:150px;">Right answer</th><th scope="col" style="width:112px;">Result</th></tr></thead>
      <tbody>${questionTableHtml}</tbody>
    </table>
  </section>
  <section class="tv-card" aria-labelledby="tvqStuSkillH">
    <div><h2 class="tv-h2" id="tvqStuSkillH">Skills</h2><p class="tv-cap">Right answers out of questions, weakest first</p></div>
    <div class="tvq-bars">${studentSkills.map(sk => barRow(sk.label, sk.pct, `${sk.correct}/${sk.total}`)).join('')}</div>
    ${summaryHTML(studentSkills, false)}
  </section>
</div>`;
    window.scrollTo(0, 0);
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
                // Always show answer line (no multiple choice)
                html += '<div class="q-answer-line"></div>';
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
