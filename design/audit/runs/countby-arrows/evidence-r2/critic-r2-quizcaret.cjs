const path = require('path'); const TREE = process.env.TREE;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } }); const { page } = app;
  for (const spaces of ['box', 'line']) {
    await page.evaluate(async (spaces) => {
      const opts = spaces === 'line' ? { rows: [{ step: 7 }], spaces } : { rows: [{ step: 7 }] };
      const q0 = window.generateQuestionFor({ category: 'multiplication', skill: 'count_by_tables', seed: 12, itemIndex: 0, opts });
      const questions = [{ id: 0, skillId: 'count_by_tables', points: 1, questionData: window.quizQuestionData(q0) }];
      const test = { id: null, name: 'C', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
      window.handleQuizURL(window.compressTestForURL(test));
      const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest();
      await new Promise((r) => setTimeout(r, 1300));
    }, spaces);
    const ins = []; for (const i of await page.$$('.k2-countrow input.mq-cellslot')) if (await i.evaluate((e) => !!e.offsetParent)) ins.push(i);
    const ml = await ins[0].evaluate((e) => e.getAttribute('maxlength'));
    await ins[0].click(); await sleep(200);
    for (const ch of '2128') { await page.keyboard.type(ch); await sleep(80); }
    await sleep(500);
    const r = await page.evaluate(() => { const ins = [...document.querySelectorAll('.k2-countrow input.mq-cellslot')].filter((e) => e.offsetParent); return { focus: ins.indexOf(document.activeElement), vals: ins.slice(0, 3).map((e) => e.value), pulse: ins.indexOf(document.querySelector('.mq-active-box')) }; });
    await page.keyboard.press('Tab'); await sleep(300);
    const t = await page.evaluate(() => { const ins = [...document.querySelectorAll('.k2-countrow input.mq-cellslot')].filter((e) => e.offsetParent); return ins.indexOf(document.activeElement); });
    console.log(spaces, 'maxlength', ml, JSON.stringify(r), 'after Tab focus', t);
  }
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
