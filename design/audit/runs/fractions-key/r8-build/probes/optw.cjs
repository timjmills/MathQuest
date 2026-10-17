const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => { const app = await open({ seed: 1 }); const { page } = app;
  const sheet = await app.browser.newPage(); await sheet.setViewport({ width: 900, height: 1200 }); await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
  for (const size of ['S', 'M', 'L']) {
    const html = await page.evaluate(async (size) => { const o = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'fraction_operations', skillId: 'sub_fractions_like' }] }], size, look: 'ican', seed: 5, key: true }); return window.sheetDocument(o.pupilHtml, 'x'); }, size);
    await sheet.setContent(html, { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 400));
    const m = await sheet.evaluate(() => { const mm = 96 / 25.4; const l = document.querySelector('.opt-list'); if (!l) return null; const cs = getComputedStyle(l); const opts = [...l.querySelectorAll('.opt')].map(o => (o.getBoundingClientRect().width / mm).toFixed(1)); const cell = l.closest('.ws-cell'); const p = document.querySelector('.ms-prompt');
      return { listW: (l.getBoundingClientRect().width / mm).toFixed(1), cellW: (cell.getBoundingClientRect().width / mm).toFixed(1), gap: cs.columnGap, opts, promptH: (p.getBoundingClientRect().height / mm).toFixed(1), n: document.querySelectorAll('.ws-cell').length }; });
    console.log(size, JSON.stringify(m));
  }
  await app.close(); })();
