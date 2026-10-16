// critic r5: "Circle 3/5 of the triangles" — tap the LAST n identical shapes (a right answer), then Check.
const path = require('path');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const k of ['fraction_of_set', 'fraction_of_set_hard']) {
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    const info = await page.evaluate((k) => {
      window.state.quizMode = false; window.skillQueue.length = 0;
      window.skillQueue.push({ categoryId: 'fractions', skillId: k, skillLabel: k });
      window.playSelectedSkills('practice');
      let q = null;
      for (let sd = 1; sd < 400; sd++) { const t = window.generateQuestionFor({ category: 'fractions', skill: k, seed: sd * 13, itemIndex: 0 }); if (t.printFormat === 'multi-select' && t.ans.length < t.options.length) { q = t; break; } }
      const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
      return { text: q.text, ans: q.ans, opts: q.options.map(o => o.id) };
    }, k);
    await sleep(1500);
    const n = info.ans.length, N = info.opts.length;
    const opts = await page.$$('.msc-opt');
    for (let i = N - n; i < N; i++) { await opts[i].click(); await sleep(120); }
    await page.screenshot({ path: path.join(OUT, `${k}-tap-last-selected.png`) });
    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); });
    await sleep(1200);
    const fb = await page.evaluate(() => ({ fb: (document.querySelector('#feedback, .feedback, .qc-feedback, .msc-result') || {}).textContent, green: document.querySelectorAll('.msc-opt.locked-correct').length, wrong: document.querySelectorAll('.msc-opt.wrong-persistent').length, missed: document.querySelectorAll('.msc-opt.missed-correct').length, score: window.state.score, streak: window.state.streak }));
    await page.screenshot({ path: path.join(OUT, `${k}-tap-last-checked.png`) });
    console.log(k, JSON.stringify(info), 'tapped last', n, 'of', N, JSON.stringify(fb));
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
