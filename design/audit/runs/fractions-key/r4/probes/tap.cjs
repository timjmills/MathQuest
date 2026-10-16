const path = require('path');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const [c, k] of [['fraction_operations', 'add_frac_unlike'], ['fraction_operations', 'sub_fractions_like']]) {
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    const info = await page.evaluate((c, k) => {
      window.state.quizMode = false; window.skillQueue.length = 0;
      window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
      window.playSelectedSkills('practice');
      let q = null;
      for (let sd = 1; sd < 400; sd++) { const t = window.generateQuestionFor({ category: c, skill: k, seed: sd, itemIndex: 0 }); if (t.printFormat === 'multi-select') { const ids = Array.isArray(t.ans) ? t.ans : JSON.parse(t.ans); if (ids.length >= 2) { q = t; break; } } }
      const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
      return { ans: q.ans, opts: q.options.map(o => o.id) };
    }, c, k);
    await sleep(1500);
    const ids = Array.isArray(info.ans) ? info.ans : JSON.parse(info.ans);
    // tap one right and one wrong option
    const wrong = info.opts.find(o => !ids.map(String).includes(String(o)));
    const opts = await page.$$('.msc-opt');
    const idx = (id) => info.opts.indexOf(id);
    await opts[idx(ids[0])].click(); await sleep(200);
    await opts[idx(wrong)].click(); await sleep(300);
    await page.screenshot({ path: path.join(OUT, `${k}-tap-selected.png`) });
    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); });
    await sleep(900);
    await page.screenshot({ path: path.join(OUT, `${k}-tap-checked.png`) });
    console.log(k, JSON.stringify(info), 'wrong', wrong);
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
