// Critic: render count_by_tables on every page role, S/M/L, Boxes/Lines (+ one-page), pupil + key; measure arrow clearance; shoot a selection.
const path = require('path');
const fs = require('fs');
const TREE = process.env.TREE;
const OUT = process.env.OUT;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
fs.mkdirSync(OUT, { recursive: true });
const SHOOT = new Set((process.env.SHOOT || '').split(',').filter(Boolean));
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;

(async () => {
  const app = await open({ seed: 1, viewport: { width: 900, height: 1200, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  const roles = await page.evaluate(async () => (await import('./js/modules/print-sheet.js')).SHEET_ROLES.slice());
  console.log('roles', roles.join(' '));
  const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
  const VARIANTS = {
    boxes: {},
    lines: { spaces: 'line' },
    'lines-wide': { spaces: 'line', rows: [R(1000, 'custom', 14000), R(25, 'custom', 100)] },
    'boxes-times': { rows: [R(7)], times: 'each' },
    'lines-times': { rows: [R(7)], times: 'each', spaces: 'line' },
    'boxes-hex': { shape: 'hex', rows: [R(6)] },
    'onepage': { onePage: true },
    'onepage-lines': { onePage: true, spaces: 'line' },
    'onepage-wide': { onePage: true, rows: [R(100000, 'custom', 1000000), R(1000, 'custom', 14000), R(3), R(25, 'zero'), R(12, undefined, undefined, 'down')] },
  };
  const docPage = await browser.newPage();
  await docPage.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
  const results = [];
  for (const role of roles) for (const size of ['S', 'M', 'L']) for (const [vn, opts] of Object.entries(VARIANTS)) {
    if (vn.startsWith('onepage') && (size !== 'S' || !['independent', 'more-practice', 'test'].includes(role))) continue;
    const tag = `${role}-${size}-${vn}`;
    if (ONLY && !ONLY.test(tag)) continue;
    let built;
    try {
      built = await page.evaluate(async (role, size, opts) => {
        const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: opts.onePage ? 12 : 6, pages: 1, columns: 1 }], size, paper: 'A4', seed: 4242, key: true });
        return { pupil: window.sheetDocument ? window.sheetDocument(r.pupilHtml, 'p') : null, key: r.keyHtml ? window.sheetDocument(r.keyHtml, 'k') : null, pages: r.pageCount, keyPages: r.keyPageCount, items: (r.items || []).length };
      }, role, size, opts);
    } catch (e) { results.push({ tag, error: String(e.message || e).slice(0, 200) }); continue; }
    if (!built.pupil) {
      built = await page.evaluate(async (role, size, opts) => {
        const m = await import('./js/modules/print-sheet.js');
        const r = await m.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: opts.onePage ? 12 : 6, pages: 1, columns: 1 }], size, paper: 'A4', seed: 4242, key: true });
        return { pupil: m.sheetDocument(r.pupilHtml, 'p'), key: r.keyHtml ? m.sheetDocument(r.keyHtml, 'k') : null, pages: r.pageCount, keyPages: r.keyPageCount, items: (r.items || []).length };
      }, role, size, opts);
    }
    for (const which of ['pupil', 'key']) {
      const html = built[which];
      if (!html) continue;
      await docPage.setContent(html.replace('<head>', `<head><base href="${base}/">`), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await docPage.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 20000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
      const m = await docPage.evaluate(() => {
        const MM = 96 / 25.4;
        const jumps = [...document.querySelectorAll('.k2-jump')];
        let minClear = Infinity, worst = null, overlaps = 0, arrowLens = [], vOff = [];
        const rectOfGlyph = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); const rs = [...rg.getClientRects()].filter((x) => x.width > 0); if (!rs.length) return null; return { left: Math.min(...rs.map((x) => x.left)), right: Math.max(...rs.map((x) => x.right)), top: Math.min(...rs.map((x) => x.top)), bottom: Math.max(...rs.map((x) => x.bottom)) }; };
        for (const j of jumps) {
          const parts = [...j.querySelectorAll('path, polygon')];
          if (!parts.length) continue;
          const rs = parts.map((p) => p.getBoundingClientRect());
          const a = { left: Math.min(...rs.map((x) => x.left)), right: Math.max(...rs.map((x) => x.right)), top: Math.min(...rs.map((x) => x.top)), bottom: Math.max(...rs.map((x) => x.bottom)) };
          arrowLens.push((a.right - a.left) / MM);
          const line = j.closest('.k2-countrow-line') || j.parentElement.parentElement;
          const obs = [];
          for (const t of line.querySelectorAll('.k2-tile, .k2-shape, .k2-line-slot')) obs.push(t.getBoundingClientRect());
          for (const g of line.querySelectorAll('.k2-given')) { const r = rectOfGlyph(g); if (r) obs.push(r); }
          for (const g of line.querySelectorAll('.k2-tile')) { if (g.textContent.trim()) { const r = rectOfGlyph(g); if (r) obs.push(r); } }
          for (const o of obs) {
            const vOver = Math.min(o.bottom, a.bottom) - Math.max(o.top, a.top);
            if (vOver <= 0) continue;
            let gap;
            if (o.right <= a.left) gap = a.left - o.right; else if (o.left >= a.right) gap = o.left - a.right; else gap = -Math.min(o.right - a.left, a.right - o.left);
            if (gap / MM < minClear) { minClear = gap / MM; worst = { arrow: a, obs: { l: o.left, r: o.right } }; }
            if (gap < 0) overlaps++;
          }
          // vertical: arrow centre vs neighbour box centre
          const host = j.parentElement.querySelector('.k2-tile, .k2-shape, .k2-line-slot');
          if (host) { const hr = host.getBoundingClientRect(); vOff.push(((a.top + a.bottom) / 2 - (hr.top + hr.bottom) / 2) / MM); }
        }
        const pages = [...document.querySelectorAll('.ws-page')];
        const overflow = pages.filter((p) => p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2).length;
        const pts = [...document.querySelectorAll('.k2-given, .k2-tile, .k2-line-slot')].map((e) => parseFloat((/font-size:([\d.]+)pt/.exec(e.getAttribute('style') || '') || [])[1])).filter(Number.isFinite);
        const lines = document.querySelectorAll('[data-ws-shape="line"]').length;
        const emptyKeyLines = [...document.querySelectorAll('[data-ws-shape="line"]')].filter((e) => !e.textContent.trim()).length;
        const arcs = [...document.querySelectorAll('.k2-countrow svg path')].filter((p) => / Q/.test(p.getAttribute('d') || '') && !p.closest('.k2-countrow-line > span:last-child')).length;
        const perLine = [...document.querySelectorAll('.k2-countrow-body')].slice(0, 1).map((b) => [...b.querySelectorAll('.k2-countrow-line')].map((l) => l.querySelectorAll('.k2-given, .k2-tile-slot, .k2-shape:not(.k2-shape-line) .k2-tile, .k2-line-slot').length).join('+'))[0] || '';
        const rowsN = document.querySelectorAll('.k2-countrow-body').length;
        return { jumps: jumps.length, minClear: minClear === Infinity ? null : +minClear.toFixed(2), overlaps, minLen: arrowLens.length ? +Math.min(...arrowLens).toFixed(2) : null, maxV: vOff.length ? +Math.max(...vOff.map(Math.abs)).toFixed(2) : null, overflow, ptMin: pts.length ? Math.min(...pts) : null, lines, emptyKeyLines, arcs, perLine, rowsN, pages: pages.length };
      });
      results.push({ tag, which, pages: which === 'pupil' ? built.pages : built.keyPages, items: built.items, ...m });
      if (SHOOT.has(tag) || SHOOT.has('*')) {
        const n = await docPage.evaluate(() => document.querySelectorAll('.ws-page').length);
        for (let i = 0; i < Math.min(n, 2); i++) {
          const el = (await docPage.$$('.ws-page'))[i];
          await el.screenshot({ path: path.join(OUT, `${tag}-${which}-p${i + 1}.png`) });
        }
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'print-metrics.json'), JSON.stringify(results, null, 1));
  for (const r of results) console.log(JSON.stringify(r));
  console.log('problems', JSON.stringify(app.problems.slice(0, 10)));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
