// critic r6: More Practice letters - head vs base, with and without explicit letters.
// MQ_ROOT=<tree> node mp-regress.cjs <harness-root> [skills] [sizes] [seeds]
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const SK = (process.argv[3] || 'addition:add_column_multi,addition:add_facts,addition:number_families_add,multiplication:dot_array_mult,addition:mixed_addition,composing:mixed_composing,number_ops_mixed:number_families_mixed,fractions:fraction_of_set,fractions:fraction_of_set_hard,fraction_operations:add_fractions_like').split(',');
const SIZES = (process.argv[4] || 'S,M,L').split(',');
const SEEDS = (process.argv[5] || '0,1,2').split(',').map(Number);
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
(async () => {
  const app = await open({ seed: 1 });
  const { page } = app;
  const sheet = await app.browser.newPage();
  await sheet.setViewport({ width: 900, height: 1200 });
  await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
  for (const s of SK) { const [c, k] = s.split(':');
    for (const size of SIZES) for (const sk of SEEDS) for (const mode of ['none', 'AB']) {
      const seed = (hash(`${c}__${k}:print`) + sk) >>> 0;
      await page.evaluate(sd => { if (window.__wsReseed) window.__wsReseed(sd); }, seed);
      const r = await page.evaluate(async ({ c, k, size, seed, mode }) => {
        try {
          const req = { role: 'more-practice', sections: [{ skills: [{ categoryId: c, skillId: k }] }], size, look: 'ican', key: true, seed };
          if (mode === 'AB') req.letters = ['A', 'B'];
          const o = await window.buildSheet(req);
          const per = {}; o.items.forEach(it => { per[it.letter || '?'] = (per[it.letter || '?'] || 0) + 1; });
          return { per, pages: o.pageCount, keyPages: o.keyPageCount, html: window.sheetDocument(o.pupilHtml, k) };
        } catch (e) { return { err: String(e).slice(0, 200) }; }
      }, { c, k, size, seed, mode });
      if (r.err) { console.log(k, size, 's' + sk, mode, 'ERR', r.err); continue; }
      await sheet.setContent(r.html, { waitUntil: 'load', timeout: 60000 }); await new Promise(z => setTimeout(z, 300));
      await sheet.evaluate(() => document.fonts && document.fonts.ready);
      const m = await sheet.evaluate(() => Array.from(document.querySelectorAll('.ws-page')).map(pg => {
        const pr = pg.getBoundingClientRect();
        const cells = Array.from(pg.querySelectorAll('.ws-cell')).filter(c => !c.parentElement.closest('.ws-cell')).map(c => c.getBoundingClientRect());
        const rows = {}; cells.forEach(r => { const t = Math.round(r.top); rows[t] = Math.max(rows[t] || 0, r.height); });
        const hs = Object.values(rows).map(Math.round);
        const foot = pg.querySelector('.ws-footer, footer, [class*="foot"]');
        const lastB = cells.length ? Math.max(...cells.map(r => r.bottom)) : pr.top;
        const fb = foot ? foot.getBoundingClientRect().top : pr.bottom;
        return { n: cells.length, rows: hs.join('/'), strip: Math.round(100 * (fb - lastB) / pr.height) };
      }));
      console.log(k, size, 's' + sk, mode, JSON.stringify(r.per), 'pages', r.pages, 'key', r.keyPages, m.map(p => `[n${p.n} rows ${p.rows} strip ${p.strip}%]`).join(' '));
    }
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
