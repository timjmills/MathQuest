// r6: online worksheet - tap the LAST n of a count-graded list (and n-1 on another seed), CHECK ALL.
const path = require('path');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1366, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const k of ['fraction_of_set', 'fraction_of_set_hard']) for (const mode of ['right', 'short']) {
    let done = false;
    for (let seed = 7919; seed < 7919 + 40 && !done; seed++) {
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
      await page.evaluate((k, seed) => { if (window.__wsReseed) window.__wsReseed(seed); const st = window.state; st.category = 'fractions'; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.showView('worksheetView'); window.initWorksheet(); }, k, seed);
      try { await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 20000 }); } catch (e) {}
      await sleep(1500);
      const lists = await page.evaluate(() => window.state.worksheetQs.map((q, i) => (q.selectCount ? { i, n: q.selectCount, N: q.options.length } : null)).filter(Boolean));
      if (!lists.length) continue;
      const L = lists[0];
      const opts = await page.$$(`#wsMscHost_${L.i} .msc-opt`);
      const tap = mode === 'right' ? L.n : L.n - 1;
      for (let j = L.N - tap; j < L.N; j++) { await opts[j].evaluate(e => e.scrollIntoView({ block: 'center' })); await opts[j].click(); await sleep(40); }
      const r = await page.evaluate((i) => {
        window.checkAllWorksheet();
        const host = document.getElementById(`wsMscHost_${i}`);
        return { res: document.getElementById('worksheetResult').textContent.replace(/\s+/g, ' ').trim().slice(0, 60), tagsWrong: host.querySelectorAll('.wrong-flash, .wrong-persistent, .missed-correct').length, green: host.querySelectorAll('.correct-flash').length, fb: (host.querySelector('.ws-msc-feedback') || {}).textContent || '', card: document.getElementById(`ws_card_${i}`).className };
      }, L.i);
      await page.evaluate((i) => document.getElementById(`ws_card_${i}`).scrollIntoView({ block: 'center' }), L.i); await sleep(300);
      await page.screenshot({ path: path.join(OUT, `${k}-ws-count-${mode}.png`) });
      console.log(k, mode, `seed ${seed} card ${L.i + 1}: tapped the last ${tap} of ${L.N} (need ${L.n})`, JSON.stringify(r));
      done = true;
    }
    if (!done) console.log(k, mode, 'no list dealt in 40 seeds');
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
