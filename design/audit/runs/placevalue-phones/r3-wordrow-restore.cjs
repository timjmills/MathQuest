const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 5, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => {
    const c = 'addition', k = 'add_wp_1k';
    const questions = [0, 1].map((i) => ({ id: i, skillId: k, points: 1, questionData: Object.assign(window.quizQuestionData(window.generateQuestionFor({ category: c, skill: k, seed: 301, itemIndex: 1 })), { categoryId: c, skillId: k }) }));
    const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
    window.handleQuizURL(window.compressTestForURL(test));
    const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest();
  });
  await sleep(900);
  const dump = (label) => page.evaluate((label) => { const ins = [...document.querySelectorAll('.qt-question-card input.mq-cellslot')]; ins.forEach((b, j) => { b.dataset.qp = 'q' + j; });
     const st = window.state; const fi = st.quizOrder[st.quizQuestionIndex];
     return label + ' vals=[' + ins.map((b) => b.value || '_').join('|') + '] inRow=' + ins.map((b) => !!b.closest('.mq-wwans')).join(',') + ' rec=' + JSON.stringify((window.__quizAnswers || null)); }, label);
  console.log(await dump('start'));
  const exp = await page.evaluate(() => [...document.querySelectorAll('.qt-question-card input.mq-cellslot')].map((b) => b.parentElement.getAttribute('data-mq-expect')));
  console.log('expect', JSON.stringify(exp));
  const plan = process.env.PLAN === 'right' ? exp.map((e, j) => [j, e]).filter(([j, e]) => e) : [[1, exp[1] || '8'], [2, exp[2] || '1']];
  for (const [j, d] of plan) { await page.click(`[data-qp="q${j}"]`); await page.keyboard.type(d); await sleep(200); console.log(await dump(`after box${j}=${d}`)); }
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(300);
  console.log(await dump('blurred'));
  await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(400); await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(600);
  console.log(await dump('back'), await page.evaluate(() => document.querySelector('.qt-topbar-right').textContent.replace(/\s+/g, ' ')));
  await page.screenshot({ path: __dirname + '/wwrow-' + (process.env.PLAN || 'part') + '-' + require('path').basename(T) + '.png' });
  await app.close();
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
