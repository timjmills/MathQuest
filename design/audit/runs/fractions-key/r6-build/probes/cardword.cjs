const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  const r = await page.evaluate(() => {
    window.state.quizMode = false; window.skillQueue.length = 0;
    window.skillQueue.push({ categoryId: 'fractions', skillId: 'fraction_of_set', skillLabel: 'x' });
    window.playSelectedSkills('practice');
    let q; for (let sd = 1; sd < 400; sd++) { const t = window.generateQuestionFor({ category: 'fractions', skill: 'fraction_of_set', seed: sd * 13, itemIndex: 0 }); if (t.cell && t.cell.payload && t.cell.payload.task === 'word') { q = t; break; } }
    window.state.hasAnswered = false; window.state.currentQ = q; window.renderQuestion();
    return { text: q.text, visual: String(q.visual).slice(0, 120) };
  });
  await sleep(1200);
  const d = await page.evaluate(() => { const qt = document.getElementById('questionText'); return { html: qt.innerHTML.slice(0, 400), cls: qt.className, paper: document.getElementById('questionPaper').className, k2: !!document.querySelector('#questionPaper .k2-twin') }; });
  console.log(JSON.stringify(r), '\n', JSON.stringify(d, null, 1));
  await app.close();
})();
