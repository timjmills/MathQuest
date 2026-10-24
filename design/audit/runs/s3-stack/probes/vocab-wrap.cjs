// s3 r1 fix N6b: no lesson vocabulary picture wraps or runs past its column (seven pilot lessons, S/M/L).
const { open } = require('../../../../../tests/lib/ws-harness.cjs');
const SK = ['sub_50_no_regroup','sub_100_no_regroup','sub_1k_no_regroup','sub_10k_no_regroup','sub_100k_no_regroup','sub_1m_no_regroup','sub_2d_1d'];
(async () => {
  const app = await open({ seed: 7 });
  const doc = await app.browser.newPage(); await doc.goto(app.page.url());
  let bad = 0, n = 0;
  for (const s of SK) for (const size of ['S','M','L']) {
    const html = await app.page.evaluate(async (a) => { const o = await window.buildSheet({ role: 'lesson', size: a[1], seed: 7, sections: [{ skills: [{ categoryId: 'subtraction', skillId: a[0], opts: {} }] }] }); return window.sheetDocument(o.pupilHtml, 'p'); }, [s, size]);
    await doc.setContent(html, { waitUntil: 'load' }); await doc.evaluate(() => document.fonts.ready);
    const r = await doc.evaluate(() => [...document.querySelectorAll('.mq-lvpic-in')].map((w) => {
      const pic = w.firstElementChild; if (!pic) return null;
      const wr = w.closest('.mq-lvpic').getBoundingClientRect(), pr = pic.getBoundingClientRect();
      // a wrap: any text node's characters on more than one line box
      let tops = new Set();
      const tw = document.createTreeWalker(pic, NodeFilter.SHOW_TEXT);
      for (let t = tw.nextNode(); t; t = tw.nextNode()) { const rg = document.createRange(); rg.selectNodeContents(t); for (const b of rg.getClientRects()) tops.add(Math.round(b.top)); }
      const kind = pic.className;
      const rows = /stack/.test(kind) ? 2 : 1;
      return { kind, text: pic.textContent.trim().slice(0, 24), lines: tops.size, rows, over: pr.left < wr.left - 0.5 || pr.right > wr.right + 0.5, offCentre: Math.abs((pr.left + pr.right) / 2 - (wr.left + wr.right) / 2) };
    }).filter(Boolean));
    for (const p of r) { n++; if (p.lines > p.rows || p.over || p.offCentre > 4) { bad++; console.log('FAIL', s, size, JSON.stringify(p)); } }
  }
  console.log(`vocab-wrap: ${bad ? 'FAIL' : 'OK'} (${n} pictures, ${bad} wrap / overrun / off centre)`);
  await app.close(); process.exit(bad ? 1 : 0);
})();
