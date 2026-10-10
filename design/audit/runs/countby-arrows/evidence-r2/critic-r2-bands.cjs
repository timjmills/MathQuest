const path = require('path'); const TREE = process.env.TREE;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
const R = (step) => ({ step });
(async () => {
  const app = await open({ seed: 1, viewport: { width: 900, height: 1200, deviceScaleFactor: 1 } }); const { page, browser, base } = app;
  const doc = await browser.newPage(); await doc.setViewport({ width: 900, height: 1200 });
  const V = { 'lines-3dig': { spaces: 'line', rows: [R(9), R(11), R(12), R(3), R(4), R(6)] }, 'boxes-3dig': { rows: [R(9), R(11), R(12), R(3), R(4), R(6)] }, lines: { spaces: 'line' }, onepageLines: { onePage: true, spaces: 'line' } };
  for (const role of ['independent', 'test', 'more-practice', 'guided', 'review', 'mixed-practice']) for (const size of ['S', 'M', 'L']) for (const [vn, opts] of Object.entries(V)) {
    if (vn.startsWith('onepage') && (size !== 'S' || role !== 'independent')) continue;
    const html = await page.evaluate(async (role, size, opts) => { const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: opts.onePage ? 12 : 6, pages: 1, columns: 1 }], size, paper: 'A4', seed: 4242, key: true }); return window.sheetDocument(r.pupilHtml, 'p'); }, role, size, opts);
    await doc.setContent(html.replace('<head>', `<head><base href="${base}/">`), { waitUntil: 'domcontentloaded' });
    await doc.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 20000 }).catch(() => {});
    const m = await doc.evaluate(() => {
      const out = [];
      for (const b of document.querySelectorAll('.k2-countrow-body')) {
        let cell = b; while (cell && !(cell.matches && cell.matches('[data-ws-cell], .ws-cell'))) cell = cell.parentElement;
        if (!cell) continue;
        const c = cell.getBoundingClientRect();
        const ink = [...cell.querySelectorAll('.k2-given, .k2-line-slot, .k2-tile, .k2-shape, .k2-jump, .k2-steptab, [data-ws-steptab], .k2-countrow-line')].map((e) => e.getBoundingClientRect()).filter((r) => r.height > 0);
        const top = Math.min(...ink.map((r) => r.top)), bot = Math.max(...ink.map((r) => r.bottom));
        out.push([Math.round(c.height), +((top - c.top) / c.height).toFixed(2), +((c.bottom - bot) / c.height).toFixed(2)]);
      }
      return out;
    });
    const worst = Math.max(...m.map((x) => Math.max(x[1], x[2])));
    console.log(`${role}-${size}-${vn}`.padEnd(32), 'worst band', worst, JSON.stringify(m));
  }
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
