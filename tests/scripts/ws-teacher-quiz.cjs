// The quiz screens in the teacher style: Quizzes list, Quiz builder, Quiz settings, Live monitor,
// Quiz results, Export to Google Forms and Progress. Drives the real UI in teacher mode and a
// pupil in a second tab (their answers must reach the Live monitor), then checks the design
// contract: one primary action, no emoji chrome, no grade 7, a visible "All" chip, the preview
// column at 820 px, 44 px targets, row cards below 900 px, no italics, no console errors.
//
//   node tests/scripts/ws-teacher-quiz.cjs
//   SHOTS=/some/dir node tests/scripts/ws-teacher-quiz.cjs   # also save screenshots
const fs = require('fs');
const path = require('path');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const SHOTS = process.env.SHOTS || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u;

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const app = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page, browser } = app;
  page.on('dialog', (d) => d.accept());
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); };
  const click = async (sel) => {
    await page.waitForSelector(sel, { visible: true, timeout: 8000 });
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
    await page.click(sel);
    await sleep(250);
  };
  // Visible controls under a root that are shorter than 44 px.
  const smallTargets = (root) => page.evaluate((root) => {
    const el = typeof root === 'string' ? document.querySelector(root) : null;
    if (!el) return ['(no root ' + root + ')'];
    return Array.from(el.querySelectorAll('button, input, select, a.tv-btn')).filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 43.5 && getComputedStyle(b).visibility !== 'hidden';
    }).map((b) => `${(b.textContent || b.getAttribute('aria-label') || b.id || b.className).trim().slice(0, 24)}=${Math.round(b.getBoundingClientRect().height)}`);
  }, root);
  const visibleText = (sel) => page.evaluate((sel) => { const el = document.querySelector(sel); return el ? el.innerText : ''; }, sel);

  try {
    await page.evaluate(() => window.setUserRole('teacher'));
    await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher mode');

    // ---- Quizzes → Create quiz
    await page.evaluate(() => window.tvGo('quizzes'));
    await sleep(300);
    await page.type('#tvQuizName', 'Teacher quiz check');
    await click('#teacherMain [data-q="create"]');
    await waitFor(page, () => document.getElementById('quizBuilderView').classList.contains('active'), 5000, 'builder');
    await sleep(300);
    check((await page.$eval('#quizNameInput', (e) => e.value)) === 'Teacher quiz check', 'builder did not take the quiz name');

    // Filters: K-6 only, All visible and pressed, no emoji chrome
    const filters = await page.evaluate(() => {
      const grades = Array.from(document.querySelectorAll('.qb-grade-pill')).map((b) => b.dataset.qbFilterGrade);
      const all = document.querySelector('.qb-domain-pill[data-qb-filter-domain=""]');
      const r = all.getBoundingClientRect(); const cs = getComputedStyle(all);
      return { grades, allVisible: r.width > 0 && r.height > 0 && cs.color !== cs.backgroundColor, allPressed: all.getAttribute('aria-pressed') };
    });
    check(filters.grades.join(',') === 'K,1,2,3,4,5,6', `level chips are ${filters.grades.join(',')}`);
    check(filters.allVisible && filters.allPressed === 'true', 'the All chip is not visible and pressed');
    const chrome = await visibleText('#qbBuilderContainer .tvq-bhead') + (await visibleText('#qbBuilderContainer .tvq-filters')) + (await visibleText('#qbGridPanel'));
    check(!EMOJI.test(chrome), 'emoji in the builder chrome');
    const primaries = await page.$$eval('#qbBuilderContainer .tv-btn-primary', (b) => b.filter((x) => x.offsetParent).length);
    check(primaries === 1, `builder has ${primaries} primary buttons`);

    // Preview (teacher-preview paper cell) → Add to quiz
    await click('.qb-skill-card[data-qb-skill="add_facts"]');
    await sleep(900);
    check(await page.$eval('#qbPreviewContent', (e) => !!e.querySelector('.tvq-prev-frame .tvp-stage')), 'preview did not draw the sample cell');
    await page.$eval('#qbAddNum', (e) => { e.value = '3'; });
    await click('#qbPreviewAddBar .tv-btn');
    await click('.qb-skill-card[data-qb-skill="mult_facts"]');
    await page.$eval('#qbAddNum', (e) => { e.value = '2'; });
    await click('#qbPreviewAddBar .tv-btn');
    await sleep(300);
    const qs = await page.evaluate(() => ({ n: document.querySelectorAll('.qb-question-card').length, cells: document.querySelectorAll('.qb-question-card .tvq-qframe .tvp-stage').length, count: document.getElementById('qbQuestionCount').textContent }));
    check(qs.n === 5 && qs.count === '5', `expected 5 questions, got ${JSON.stringify(qs)}`);
    check(qs.cells === 5, `question cards drew ${qs.cells}/5 paper cells`);
    await click('.qb-grade-pill[data-qb-filter-grade="3"]');
    check(await page.$eval('.qb-grade-pill[data-qb-filter-grade="3"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'level chip does not press');
    await click('.qb-grade-pill[data-qb-filter-grade="3"]');
    await shot('builder-1280');
    const smallB = await smallTargets('#quizBuilderView');
    check(!smallB.length, `builder targets under 44px: ${smallB.join(', ')}`);

    // Save, pupil link
    await click('.tvq-bhead .tv-btn-primary');
    const quizId = await page.evaluate(async () => { const t = (await window.listTests()).find((x) => x.name === 'Teacher quiz check'); return t ? t.id : null; });
    check(!!quizId, 'quiz was not saved');
    await click('#qbShareBtn');

    // Settings dialog: switches, the versions reason, Esc, the scrim covers the sidebar
    await click('.tvq-bhead [onclick="openQuizSettings()"]');
    const dlg = await page.evaluate(() => {
      const o = document.getElementById('quizSettingsOverlay');
      const r = o.getBoundingClientRect();
      return { open: o.classList.contains('active'), left: r.left, versionsDisabled: document.getElementById('qbSetVersions').disabled, reason: document.getElementById('qbSetVersionsD').textContent };
    });
    check(dlg.open && dlg.left === 0, 'settings dialog scrim does not cover the window');
    check(dlg.versionsDisabled && /Turn on/.test(dlg.reason), 'disabled Printed versions has no reason');
    await shot('settings-1280');
    await click('#qbSetShufflePrint');
    check(await page.$eval('#qbSetVersions', (e) => !e.disabled), 'shuffle switch did not enable versions');
    await click('#qbSetShufflePrint');
    const smallS = await smallTargets('#quizSettingsOverlay');
    check(!smallS.length, `settings targets under 44px: ${smallS.join(', ')}`);
    await page.keyboard.press('Escape');
    await sleep(200);
    check(await page.$eval('#quizSettingsOverlay', (e) => !e.classList.contains('active')), 'Esc does not close settings');

    // 820 px: the preview column is still there, and Add is reachable
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
    await page.evaluate(() => window.qbPreviewClick('multiplication', 'mult_facts'));
    await sleep(400);
    const at820 = await page.evaluate(() => {
      const p = document.querySelector('.qb-preview-panel').getBoundingClientRect();
      const add = document.querySelector('#qbPreviewAddBar .tv-btn');
      const a = add ? add.getBoundingClientRect() : { width: 0 };
      return { pw: p.width, ph: p.height, add: a.width, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    check(at820.pw > 200 && at820.ph > 150 && at820.add > 0, `no preview column at 820: ${JSON.stringify(at820)}`);
    check(at820.overflow <= 0, `builder scrolls sideways at 820 (${at820.overflow}px)`);
    await shot('builder-820');
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

    // ---- Live monitor, with a pupil answering in another tab
    await click('.tvq-bhead .tv-menu-wrap > .tv-btn');
    await click('#qbMonitorBtn');
    await waitFor(page, () => document.getElementById('quizMonitorView').classList.contains('active'), 5000, 'monitor');
    const link = await page.evaluate(async (id) => `${location.origin}${location.pathname}?quiz=${window.compressTestForURL(await window.loadTest(id))}`, quizId);
    const pupil = await browser.newPage();
    pupil.on('dialog', (d) => d.accept());
    await pupil.goto(link, { waitUntil: 'networkidle2' });
    await waitFor(pupil, () => !!document.getElementById('qtStudentName'), 20000, 'pupil landing');
    await pupil.type('#qtStudentName', 'Pupil A');
    await pupil.click('#qtStartBtn');
    await sleep(300);
    for (let i = 0; i < 5; i++) {
      await pupil.evaluate(() => { const f = window.state.quizOrder[window.state.quizQuestionIndex]; window.submitQuizTextAnswer(f, String(window.state.quizAllQuestions[f].question.questionData.ans)); window.navigateQuizQuestion(1); });
      await sleep(80);
    }
    await pupil.evaluate(() => window.submitQuiz());
    await sleep(600);
    await page.bringToFront();
    await waitFor(page, () => document.querySelectorAll('#quizMonitorView .qm-grid tbody tr').length === 1, 8000, 'pupil row in the monitor');
    await click('#quizMonitorView .tvq-switches .tvq-switch-btn:nth-child(3)');
    const mon = await page.evaluate(() => ({ right: document.querySelectorAll('#quizMonitorView td.qm-cell-correct').length, primaries: document.querySelectorAll('#quizMonitorView .tv-btn-primary').length }));
    check(mon.right === 5, `monitor shows ${mon.right}/5 right answers`);
    check(mon.primaries === 1, `monitor has ${mon.primaries} primary buttons`);
    const smallM = await smallTargets('#quizMonitorView');
    check(!smallM.length, `monitor targets under 44px: ${smallM.join(', ')}`);
    await shot('monitor-1280');
    // Monitor with no quiz picked (the old crash path) and from the Quizzes list
    const noArg = await page.evaluate(async () => { try { await window.openQuizMonitor(); return document.getElementById('quizMonitorView').classList.contains('active') ? 'ok' : 'not shown'; } catch (e) { return 'THROW ' + e.message; } });
    check(noArg === 'ok', `openQuizMonitor() → ${noArg}`);
    await page.evaluate(() => window.tvGo('quizzes'));
    await sleep(300);
    await click(`#teacherMain [data-q="monitor"][data-id="${quizId}"]`);
    check(await page.$eval('#quizMonitorView', (e) => e.classList.contains('active')), 'Quizzes → Monitor did not open the monitor');

    // ---- Finish → results; student detail; More menu; Google Forms
    await click('#quizMonitorView .tv-btn-primary');
    await waitFor(page, () => document.getElementById('quizResultsView').classList.contains('active') && !!document.querySelector('#quizResultsView tbody tr'), 5000, 'results');
    await shot('results-1280');
    const res = await page.evaluate(() => ({ rows: document.querySelectorAll('#quizResultsView tbody tr').length, text: document.getElementById('quizResultsView').innerText }));
    check(res.rows === 1 && /Pupil A/.test(res.text), 'results do not list the pupil');
    check(!EMOJI.test(res.text), 'emoji in quiz results');
    const smallR = await smallTargets('#quizResultsView');
    check(!smallR.length, `results targets under 44px: ${smallR.join(', ')}`);
    await click('#quizResultsView .tv-link-row');
    check(/Answers/.test(await visibleText('#quizResultsView')), 'student detail did not open');
    await click('#quizResultsView .tvq-back');
    await click('#quizResultsView .tv-menu-wrap > .tv-btn');
    check((await page.$$eval('#quizResultsView .tv-menu button', (b) => b.length)) === 3, 'results More menu is not CSV / Import / Google');
    await page.evaluate(() => document.querySelectorAll('#quizResultsView .tv-menu button')[2].click());
    await sleep(300);
    const gex = await page.evaluate(() => { const b = document.querySelector('#googleExportOverlay .modal-close'); const r = b ? b.getBoundingClientRect() : { width: 0, height: 0 }; return { w: r.width, h: r.height }; });
    check(gex.w >= 44 && gex.h >= 44, `Google Forms close button is ${gex.w}x${gex.h}`);
    await shot('google-1280');
    await page.evaluate(() => window.closeGoogleExportModal());
    const gexNoArg = await page.evaluate(() => { try { window.openGoogleExportModal(); const ok = !!document.getElementById('googleExportOverlay'); window.closeGoogleExportModal(); return ok ? 'ok' : 'no dialog'; } catch (e) { return 'THROW ' + e.message; } });
    check(gexNoArg === 'ok', `openGoogleExportModal() → ${gexNoArg}`);

    // ---- Progress: fixed columns, no emoji, no italics, row cards below 900 px
    await page.evaluate(() => {
      const today = new Date().toISOString().split('T')[0];
      window.state.sessionHistory = [
        { date: today, day: 'Fri', time: '11:57 PM', duration: '< 1 min', mode: '🐉 Boss Battle', challenge: '(Addition) Add within 20', score: '0/1', result: '⏸️ Exited', percentage: 0, incomplete: true },
        { date: today, day: 'Fri', time: '10:02 AM', duration: '6 min', mode: '🎓 Practice', challenge: 'Multiplication facts', score: '18/20', result: '✅ Win', percentage: 90 },
      ];
      window.tvGo('progress');
    });
    await sleep(300);
    const prog = await page.evaluate(() => {
      const s = document.querySelector('[data-screen="progress"]');
      const skill = s.querySelector('tbody td:nth-child(2)');
      return { text: s.innerText, italic: Array.from(s.querySelectorAll('tr, td')).some((e) => getComputedStyle(e).fontStyle === 'italic'), skillW: skill ? skill.getBoundingClientRect().width : 0 };
    });
    check(!EMOJI.test(prog.text), 'emoji in Progress');
    check(!prog.italic, 'italic rows in Progress');
    check(prog.skillW > 200, `Progress skill column is ${Math.round(prog.skillW)}px at 1280`);
    const smallP = await smallTargets('[data-screen="progress"]');
    check(!smallP.length, `progress targets under 44px: ${smallP.join(', ')}`);
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
    await sleep(200);
    const prog820 = await page.evaluate(() => {
      const s = document.querySelector('[data-screen="progress"]');
      return { thead: getComputedStyle(s.querySelector('thead')).display, row: getComputedStyle(s.querySelector('tbody tr')).display, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    check(prog820.thead === 'none' && prog820.row === 'grid', `Progress is not row cards at 820: ${JSON.stringify(prog820)}`);
    check(prog820.overflow <= 0, 'Progress scrolls sideways at 820');
    await shot('progress-820');
    await page.evaluate(() => window.tvGo('quizzes'));
    await sleep(300);
    const q820 = await page.evaluate(() => { const n = document.querySelector('[data-screen="quizzes"] tbody .tv-cell-title'); return n ? n.getBoundingClientRect().width : 0; });
    check(q820 > 200, `quiz names collapse at 820 (${Math.round(q820)}px)`);
    const smallQ = await smallTargets('[data-screen="quizzes"]');
    check(!smallQ.length, `quizzes targets under 44px: ${smallQ.join(', ')}`);
    await pupil.close();
  } catch (e) {
    failures.push('crash: ' + (e.stack || e.message));
  }

  for (const p of app.problems) failures.push(`${p.type}: ${p.text}`);
  await app.close();
  if (failures.length) {
    for (const f of failures) console.log('  - ' + f);
    console.log('ws-teacher-quiz: FAIL');
    process.exit(1);
  }
  console.log('ws-teacher-quiz: OK');
})();
