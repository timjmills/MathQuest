// Critic r2: the quiz "answered" count with several-box answers whose row has boxes that stay blank
// (word-work answer rows wider than the answer). A right answer must count as answered.
const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SK = (process.env.SKILLS || 'addition:add_wp_100,subtraction:sub_wp_100,addition:add_wp_1k,multiplication:mult_word_problems,division:div_word_problems,algebra:multi_step_word,algebra:tape_diagram,division:share_into_groups,addition:add_word_problems').split(',');
(async () => {
  for (const W of [390, 1280]) {
    const mob = W < 500;
    const app = await open({ seed: 5, viewport: { width: W, height: 900, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob } });
    const { page } = app;
    for (const s of SK) {
      const [c, k] = s.split(':');
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
      await page.evaluate((c, k) => {
        const questions = [0, 1, 2, 3].map((i) => ({ id: i, skillId: k, points: 1, questionData: Object.assign(window.quizQuestionData(window.generateQuestionFor({ category: c, skill: k, seed: 300 + i, itemIndex: i })), { categoryId: c, skillId: k }) }));
        const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest();
      }, c, k);
      await sleep(900);
      const rows = [];
      for (let i = 0; i < 4; i++) {
        const info = await page.evaluate(() => {
          const card = document.querySelector('.qt-question-card');
          const st = window.state; const q = st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
          const ins = [...card.querySelectorAll('input.mq-cellslot')].filter((b) => b.getBoundingClientRect().width > 0);
          ins.forEach((b, j) => { b.dataset.qp = 'q' + j; });
          return { ans: String(q.ans), n: ins.length, exp: ins.map((b) => (b.parentElement && b.parentElement.getAttribute('data-mq-expect'))), host: !!card.querySelector('.mq-wwans') };
        });
        // type the answer: word-work rows by their expected digit; leave blank-expected boxes empty
        let typed = '';
        if (info.host && info.exp.every((e) => e !== null)) {
          for (let j = 0; j < info.n; j++) { if (info.exp[j] === '') continue; const sel = `[data-qp="q${j}"]`; if (mob) await page.tap(sel); else await page.click(sel); await page.keyboard.type(info.exp[j]); typed += info.exp[j]; await sleep(60); }
        } else {
          const sel = info.n ? '[data-qp="q0"]' : '#qtAnswerInput';
          try { if (mob) await page.tap(sel); else await page.click(sel); await page.keyboard.type(info.ans.replace(/[^0-9.]/g, '')); typed = info.ans; } catch (e) { typed = 'ERR ' + e.message.slice(0, 40); }
        }
        await sleep(200);
        const dot = await page.evaluate((i) => { const d = document.querySelectorAll('.qt-q-dot')[i]; return d ? d.classList.contains('answered') : null; }, i);
        rows.push(`Q${i + 1} ans=${info.ans} boxes=${info.n} exp=[${info.exp.join(',')}] typed=${typed} dot=${dot}`);
        if (i < 3) { await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(500); }
      }
      // the dot of the last question is drawn on the next render: go back one and forward
      await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(300);
      await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(300);
      const rev = await page.evaluate(() => { window.showQuizReview(); return [...document.querySelectorAll('.qt-review-stat-val')].map((e) => e.textContent).join('/'); });
      await page.evaluate(async () => { await window.submitQuiz(); }); await sleep(400);
      const res = await page.evaluate(() => { const r = window.state.currentQuizResult; return `${r.score}/${r.totalPoints} ${JSON.stringify(r.answers.map((a) => [a.studentAnswer, a.correct, a.partial]))}`; });
      console.log(`${W} ${s}: review stats ${rev}; result ${res}\n   ${rows.join('\n   ')}`);
    }
    await app.close();
  }
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
