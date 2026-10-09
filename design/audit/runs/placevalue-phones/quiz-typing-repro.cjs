// the quiz with a pupil who types 4-0-5 straight through (no tap between boxes), keyboard and phone keypad
const { open } = require('../../../../tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const W of [390, 1280]) {
    const mob = W < 500;
    const app = await open({ seed: 4, viewport: { width: W, height: 900, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob } });
    const { page } = app;
    const items = await page.evaluate(() => {
      const out = [];
      for (const band of [999, 9999]) for (let seed = 1; seed < 400 && out.filter((o) => o.band === band).length < 2; seed++) {
        const q = window.generateQuestionFor({ category: 'placevalue', skill: 'unit_form', seed, itemIndex: seed % 6, opts: { band } });
        if (/0/.test(String(q.pv.n))) out.push({ band, n: q.pv.n, sets: q.inlineBlanksData.acceptedSets, qd: Object.assign(window.quizQuestionData(q), { categoryId: 'placevalue', skillId: 'unit_form' }) });
      }
      return out;
    });
    await page.evaluate((items) => {
      const questions = items.map((it, i) => ({ id: i, skillId: 'unit_form', points: 1, questionData: it.qd }));
      const test = { id: null, name: 'raw', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
      window.handleQuizURL(window.compressTestForURL(test));
      const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
      window.startQuizTest();
    }, items);
    await sleep(900);
    for (let i = 0; i < items.length; i++) {
      const digits = items[i].sets[0];
      const sel = '#quizTakeView .qt-cell input.mq-cellslot';
      if (mob) await page.tap(sel); else await page.click(sel);
      for (const d of digits) { await page.keyboard.type(String(d)); await sleep(120); }
      const vals = await page.evaluate(() => [...document.querySelectorAll('#quizTakeView .qt-cell input.mq-cellslot')].map((b) => b.value));
      console.log(`${W} n=${items[i].n} typed ${digits.join('')} -> boxes [${vals.join('|')}]`);
      if (i < items.length - 1) { if (mob) await page.tap('.qt-nav-btn.next'); else await page.click('.qt-nav-btn.next'); }
      else { if (mob) await page.tap('.qt-nav-btn.submit'); else await page.click('.qt-nav-btn.submit'); }
      await sleep(500);
    }
    const ans = await page.evaluate(() => document.querySelector('.qt-review-stat-val').textContent);
    await page.evaluate(() => window.submitQuiz()); await sleep(800);
    const res = await page.evaluate(() => window.state.currentQuizResult.answers.map((a) => `"${a.studentAnswer}" ${a.correct ? 'correct' : 'WRONG'}`));
    console.log(`${W}: review says ${ans} answered; recorded ${res.join(' ; ')}; score ${await page.evaluate(() => window.state.currentQuizResult.percentage)}%`);
    await app.close();
  }
})().catch((e) => { console.log("EXC", e.stack); process.exit(2); });
