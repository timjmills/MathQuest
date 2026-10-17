// critic r8: Review pages, pupil AND key. node rv8.cjs <repo> <skills> <sizes> <seedOffsets> [pngdir]
// Per page: problems, how many are the Mixed Review band (pool 'earlier') and from which skill, rows,
// bottom strip, overflow, key facsimile, and per-cell ink slack (H13: empty band >= 30 % of the cell).
const path = require('path'), fs = require('fs');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const SK = process.argv[3].split(',');
const SIZES = process.argv[4].split(',');
const SEEDS = process.argv[5].split(',').map(Number);
const PNG = process.argv[6] || null;
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const MEAS = () => Array.from(document.querySelectorAll('.ws-page')).map(pg => {
  const pr = pg.getBoundingClientRect();
  const foot = pg.querySelector('.ws-foot');
  const fr = foot ? foot.getBoundingClientRect() : pr;
  const cells = Array.from(pg.querySelectorAll('.ws-cell')).filter(c => !c.parentElement.closest('.ws-cell'));
  const rects = cells.map(c => c.getBoundingClientRect());
  const rows = {}; rects.forEach(r => { const t = Math.round(r.top); rows[t] = Math.max(rows[t] || 0, r.height); });
  const hs = Object.values(rows).map(Math.round);
  const lastB = rects.length ? Math.max(...rects.map(r => r.bottom)) : pr.top;
  let over = 0;
  const slack = cells.map((c, i) => {
    const r = rects[i]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    c.querySelectorAll('*').forEach(e => {
      const q = e.getBoundingClientRect();
      if (q.width && q.height && (q.right > r.right + 2 || q.bottom > r.bottom + 2 || q.left < r.left - 2)) over++;
      const leaf = !e.children.length || e.tagName.toLowerCase() === 'svg';
      if (!leaf || !q.width || !q.height || e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return;
      if (q.width > r.width - 4 && q.height > r.height - 4) return;
      x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom);
    });
    if (x1 < 0) return { v: 100, h: 100 };
    return { v: Math.round(100 * (1 - (y1 - y0) / r.height)), h: Math.round(100 * (1 - (x1 - x0) / r.width)) };
  });
  const tabs = Array.from(pg.querySelectorAll('.ws-band-title, .ws-section-title, h2, h3')).map(e => e.textContent.trim()).filter(Boolean).slice(0, 4);
  return { n: cells.length, rows: hs.join('/'), strip: Math.round(100 * (fr.top - lastB) / pr.height), over, bodyOver: lastB > fr.top + 1 ? 1 : 0,
    vmax: Math.max(0, ...slack.map(s => s.v)), hmax: Math.max(0, ...slack.map(s => s.h)), slack: slack.map(s => s.v + '/' + s.h).join(' '), tabs,
    geo: rects.map(r => [Math.round(r.left - pr.left), Math.round(r.top - pr.top), Math.round(r.width), Math.round(r.height)].join(',')).join(';') };
});
(async () => {
  if (PNG) fs.mkdirSync(PNG, { recursive: true });
  const app = await open({ seed: 1 });
  const { page } = app;
  const sheet = await app.browser.newPage();
  await sheet.setViewport({ width: 900, height: 1200 });
  await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
  for (const s of SK) { const [c, k] = s.split(':');
    for (const size of SIZES) for (const sk of SEEDS) {
      const seed = (hash(`${c}__${k}:print`) + sk) >>> 0;
      const r = await page.evaluate(async ({ c, k, size, seed }) => {
        try {
          const o = await window.buildSheet({ role: 'review', sections: [{ skills: [{ categoryId: c, skillId: k }] }], size, look: 'auto', key: true, seed });
          const main = o.items.filter(it => it.pool !== 'earlier').length;
          const earl = o.items.filter(it => it.pool === 'earlier');
          const tmpl = [...new Set(earl.map(it => it.template))].join('+');
          return { n: o.items.length, main, earlier: earl.length, eskill: [...new Set(earl.map(it => it.skill))].join('+'), tmpl, pages: o.pageCount, keyPages: o.keyPageCount,
            pupil: window.sheetDocument(o.pupilHtml, k), key: window.sheetDocument(o.keyHtml, k + ' key') };
        } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
      }, { c, k, size, seed });
      const tag = `${k} ${size} s${sk}`;
      if (r.err) { console.log(tag, 'ERR', r.err); continue; }
      const res = {};
      for (const w of ['pupil', 'key']) {
        await sheet.setContent(r[w], { waitUntil: 'load', timeout: 60000 }); await new Promise(z => setTimeout(z, 250));
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        res[w] = await sheet.evaluate(MEAS);
        if (PNG) { const els = await sheet.$$('.ws-page'); for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(PNG, `${k}-review-${size}-s${sk}-${w}-p${i + 1}.png`) }); }
      }
      const P = res.pupil, K = res.key, flags = [];
      if (P.length !== K.length) flags.push(`KEYPAGES ${P.length}/${K.length}`);
      P.forEach((p, i) => {
        if (p.strip > 20) flags.push(`STRIP p${i + 1} ${p.strip}%`);
        if (p.over || p.bodyOver) flags.push(`OVERFLOW p${i + 1} ${p.over}/${p.bodyOver}`);
        if (p.vmax >= 30 || p.hmax >= 30) flags.push(`SLACK p${i + 1} v${p.vmax} h${p.hmax}`);
        const q = K[i];
        if (q) { if (q.n !== p.n) flags.push(`KEYN p${i + 1} ${p.n}/${q.n}`); else if (q.geo !== p.geo) flags.push(`KEYGEO p${i + 1}`); }
      });
      if (r.n < 6) flags.push(`THIN n${r.n}`);
      console.log(tag, `n${r.n} main ${r.main} mixed ${r.earlier} [${r.eskill || '-'} ${r.tmpl || ''}] pages ${r.pages}/${r.keyPages}`,
        P.map(p => `[n${p.n} rows ${p.rows} strip ${p.strip}% slack ${p.slack}]`).join(' '), flags.length ? 'FLAGS ' + flags.join(' | ') : 'ok');
    }
  }
  console.log('rv8 done');
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
