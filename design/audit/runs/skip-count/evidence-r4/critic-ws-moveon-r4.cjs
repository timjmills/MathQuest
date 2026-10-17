const { open } = require('/home/user/MathQuest/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const W of [1366, 683]) for (const sk of ['skip_count_grid','skip_count_line']) for (const mode of ['comma','Enter','Tab']) for (let run = 0; run < 2; run++) {
  const app = await open({ seed: 5 + run, viewport: { width: W, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  await page.evaluate((sk) => { const st = window.state; st.range = 100; st.isMixedMode = false; st.quizMode = false; st.skillOptions = null; st.category = 'patterns'; st.skill = sk; st.gameMode = 'worksheet'; st.problemCount = 2; window.initWorksheet(); }, sk);
  await sleep(1200);
  const info = await page.evaluate(() => {
    const r = document.querySelector('#ws_card_0'); const els = [...r.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)')];
    els.forEach((e, i) => e.setAttribute('data-t', String(i)));
    const q = window.state.worksheetQs[0];
    return { n: els.length, ans: q.ans, vals: q.cell && q.cell.payload.values.join(','), text: r.innerText.slice(0, 200).replace(/\n/g, ' ') , max: els.map((e) => e.maxLength) };
  });
  
  const exp = String(info.ans).split(/\s*,\s*/);
  await (await page.$('[data-t="0"]')).click(); await sleep(150);
  const log = [];
  for (let i = 0; i < exp.length; i++) {
    await page.keyboard.type(exp[i], { delay: 40 }); await sleep(100);
    if (i < exp.length - 1) { if (mode === 'comma') await page.keyboard.type(','); else await page.keyboard.press(mode); } await sleep(250);
    log.push(await page.evaluate(() => { const a = document.activeElement; return `${a && a.tagName}.${a && a.getAttribute('data-t')} tagged=${document.querySelectorAll('[data-t]').length} vals=${[...document.querySelectorAll('[data-t]')].map((e) => e.value).join('|')}`; }));
  }
  const fin = await page.evaluate(() => [...document.querySelectorAll('[data-t]')].map((e) => e.value).join(',').replace(/,/g, ', ')); console.log(W, sk, mode, run, fin === exp.join(', ') ? 'OK' : 'BAD got ' + fin + ' want ' + exp.join(', '));
  await app.close();
  }
})();
