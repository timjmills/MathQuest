const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const V of ['1366x650', '1366x650t', '1280x602']) {
    const [W, H] = V.replace(/t$/, '').split('x').map(Number); const touch = /t$/.test(V);
    const app = await open({ seed: 5, viewport: { width: W, height: H, deviceScaleFactor: 1, hasTouch: touch } });
    const { page } = app;
    await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
    const start = async (c, k, opts) => { await page.evaluate((c, k, opts) => {
        const questions = [0, 1, 2, 3].map((i) => ({ id: i, skillId: k, points: 1, questionData: Object.assign(window.quizQuestionData(window.generateQuestionFor({ category: c, skill: k, seed: 300 + i, itemIndex: i, opts })), { categoryId: c, skillId: k }) }));
        const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest();
      }, c, k, opts); await sleep(900); };
    const boxes = () => page.evaluate(() => { const card = document.querySelector('.qt-question-card'); const st = window.state; const q = st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
        const ins = [...card.querySelectorAll('input.mq-cellslot')].filter((b) => b.getBoundingClientRect().width > 0); ins.forEach((b, j) => { b.dataset.qp = 'q' + j; });
        const ww = [...card.querySelectorAll('input.mq-wwork')].map((b) => `${b.getAttribute('data-mq-kind') || ''}:${b.getAttribute('data-mq-expect')}:${b.maxLength}`);
        return { ans: String(q.ans), n: ins.length, exp: ins.map((b) => b.parentElement && b.parentElement.getAttribute('data-mq-expect')), ww }; });
    const put = async (j, d) => { const sel = `[data-qp="q${j}"]`; if (touch) await page.tap(sel); else await page.click(sel); await page.keyboard.type(d); await sleep(80); };
    const status = async () => { await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(300); await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(300);
        return page.evaluate(() => { const top = [...document.querySelectorAll('.qt-topbar-right span')].map((s) => s.textContent).join(' '); const dots = [...document.querySelectorAll('.qt-q-dot')].map((d) => d.classList.contains('answered') ? 'A' : '-').join(''); return `${top} dots ${dots}`; }); };
    // 1) unit_form: all right on Q1..Q4 then check count; 2) negatives
    for (const [c, k, opts] of [['placevalue', 'unit_form', { band: 9999 }], ['placevalue', 'unit_form', { band: 999, rename: 'more' }], ['placevalue', 'place_value_disks', { band: 999, task: 'count' }], ['placevalue', 'place_value_disks', { band: 9999 }], ['addition', 'add_wp_1k', null]]) {
      await page.reload({ waitUntil: 'networkidle2' }); await page.waitForFunction(() => typeof window.generateQuestionFor === 'function', { timeout: 30000 });
      await start(c, k, opts);
      const log = [];
      for (let i = 0; i < 4; i++) {
        const b = await boxes();
        // Q1 right, Q2 partial (leave the last fillable box empty), Q3 right, Q4 left blank
        if (i === 0 || i === 2 || i === 1) {
          if (b.n > 1 && b.exp.every((e) => e !== null)) {
            const idx = b.exp.map((e, j) => (e === '' ? -1 : j)).filter((j) => j >= 0);
            const use = i === 1 ? idx.slice(0, -1) : idx;
            for (const j of use) await put(j, b.exp[j]);
          } else if (b.n > 1) {
            const digs = b.ans.match(/\d+/g) || [];
            const use = i === 1 ? digs.slice(0, -1) : digs;
            if (use.length) { const sel = '[data-qp="q0"]'; if (touch) await page.tap(sel); else await page.click(sel); for (const d of use) { await page.keyboard.type(d); await sleep(80); } }
          } else {
            if (i === 1) { /* a one-box item cannot be partial: answer it wrong-short */ }
            const sel = b.n ? '[data-qp="q0"]' : '#qtAnswerInput';
            if (touch) await page.tap(sel); else await page.click(sel); await page.keyboard.type(i === 1 ? '9' : b.ans.replace(/[^0-9.]/g, ''));
          }
        }
        log.push(`Q${i + 1} ans=${b.ans} n=${b.n} exp=[${b.exp}]${b.ww.length && i === 0 ? ' ww=' + b.ww.join(',') : ''}`);
        if (i < 3) { await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(450); }
      }
      const st = await status();
      const rev = await page.evaluate(() => { window.showQuizReview(); return [...document.querySelectorAll('.qt-review-stat-val')].map((e) => e.textContent).join('/'); });
      await page.evaluate(async () => { await window.submitQuiz(); }); await sleep(400);
      const res = await page.evaluate(() => { const r = window.state.currentQuizResult; return `${r.score}/${r.totalPoints} ${JSON.stringify(r.answers.map((a) => [a.studentAnswer, a.correct, !!a.partial]))}`; });
      console.log(`${V} ${c}:${k} ${JSON.stringify(opts)} | ${st} | review ${rev} | ${res}\n   ${log.join('\n   ')}`);
    }
    await app.close();
  }
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
