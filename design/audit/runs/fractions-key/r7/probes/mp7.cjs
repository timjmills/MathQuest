// critic r7: More Practice per letter, pupil AND key: one side per letter, even rows, overflow, key facsimile.
// node mp7.cjs <repo> <skills> <sizes> <seedOffsets> [modes=AB] [pngdir]
const path = require('path'), fs = require('fs');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const SK = process.argv[3].split(',');
const SIZES = process.argv[4].split(',');
const SEEDS = process.argv[5].split(',').map(Number);
const MODES = (process.argv[6] || 'AB').split(',');
const PNG = process.argv[7] || null;
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const MEAS = () => Array.from(document.querySelectorAll('.ws-page')).map(pg => {
  const pr = pg.getBoundingClientRect();
  const tab = (pg.querySelector('.ws-tabbox') || {}).textContent || '';
  const foot = pg.querySelector('.ws-foot');
  const fr = foot ? foot.getBoundingClientRect() : pr;
  const footRight = foot ? (foot.querySelectorAll('span')[1] || {}).textContent : '';
  const cells = Array.from(pg.querySelectorAll('.ws-cell')).filter(c => !c.parentElement.closest('.ws-cell'));
  const rects = cells.map(c => c.getBoundingClientRect());
  const rows = {}; rects.forEach(r => { const t = Math.round(r.top); rows[t] = Math.max(rows[t] || 0, r.height); });
  const hs = Object.values(rows).map(Math.round);
  const lastB = rects.length ? Math.max(...rects.map(r => r.bottom)) : pr.top;
  let over = 0;
  cells.forEach((c, i) => { const r = rects[i]; c.querySelectorAll('*').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && q.height && (q.right > r.right + 2 || q.bottom > r.bottom + 2 || q.left < r.left - 2)) over++; }); });
  const bodyOver = lastB > fr.top + 1 ? 1 : 0;
  const wide = rects.filter(r => r.width > pr.width * 0.7).length;
  const ink = pg.querySelectorAll('[class*="key"], .ws-key, .k').length;
  return { letter: (tab.match(/Practice ([A-J])/) || [])[1] || '?', foot: footRight, n: cells.length, rows: hs.join('/'), even: hs.length ? Math.max(...hs) - Math.min(...hs) : 0, strip: Math.round(100 * (fr.top - lastB) / pr.height), over, bodyOver, wide, geo: rects.map(r => [Math.round(r.left - pr.left), Math.round(r.top - pr.top), Math.round(r.width), Math.round(r.height)].join(',')).join(';') };
});
(async () => {
  if (PNG) fs.mkdirSync(PNG, { recursive: true });
  const app = await open({ seed: 1 });
  const { page } = app;
  const sheet = await app.browser.newPage();
  await sheet.setViewport({ width: 900, height: 1200 });
  await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
  let bad = 0;
  for (const s of SK) { const [c, k] = s.split(':');
    for (const size of SIZES) for (const sk of SEEDS) for (const mode of MODES) {
      const seed = sk > 1000 ? sk : (hash(`${c}__${k}:print`) + sk) >>> 0;
      await page.evaluate(sd => { if (window.__wsReseed) window.__wsReseed(sd); }, seed);
      const r = await page.evaluate(async ({ c, k, size, seed, mode }) => {
        try {
          const req = { role: 'more-practice', sections: [{ skills: [{ categoryId: c, skillId: k }] }], size, look: 'ican', key: true, seed };
          if (mode === 'AB') req.letters = ['A', 'B'];
          const o = await window.buildSheet(req);
          const per = {}; o.items.forEach(it => { per[it.letter || '?'] = (per[it.letter || '?'] || 0) + 1; });
          return { per, pages: o.pageCount, keyPages: o.keyPageCount, pupil: window.sheetDocument(o.pupilHtml, k), key: window.sheetDocument(o.keyHtml, k + ' key') };
        } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
      }, { c, k, size, seed, mode });
      const tag = `${k} ${size} s${sk} ${mode}`;
      if (r.err) { console.log(tag, 'ERR', r.err); bad++; continue; }
      const res = {};
      for (const w of ['pupil', 'key']) {
        await sheet.setContent(r[w], { waitUntil: 'load', timeout: 60000 }); await new Promise(z => setTimeout(z, 250));
        await sheet.evaluate(() => document.fonts && document.fonts.ready);
        res[w] = await sheet.evaluate(MEAS);
        if (PNG) { const els = await sheet.$$('.ws-page'); for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(PNG, `${k}-mp-${size}-s${sk}-${mode}-${w}-p${i + 1}.png`) }); }
      }
      const P = res.pupil, K = res.key, flags = [];
      const lettersSeen = P.map(p => p.letter);
      const dup = lettersSeen.filter((l, i) => lettersSeen.indexOf(l) !== i);
      if (dup.length) flags.push('MULTISIDE ' + dup.join(''));
      if (P.length !== K.length) flags.push(`KEYPAGES ${P.length}/${K.length}`);
      P.forEach((p, i) => {
        if (p.strip > 20) flags.push(`STRIP p${i + 1} ${p.strip}%`);
        if (p.even > 4) flags.push(`UNEVEN p${i + 1} ${p.rows}`);
        if (p.over || p.bodyOver) flags.push(`OVERFLOW p${i + 1} ${p.over}/${p.bodyOver}`);
        if (p.letter !== '?' && !p.foot.includes('Form ' + p.letter)) flags.push(`FOOT p${i + 1} ${p.letter}:${p.foot}`);
        const q = K[i];
        if (q) { if (q.n !== p.n) flags.push(`KEYN p${i + 1} ${p.n}/${q.n}`); else if (q.geo !== p.geo) flags.push(`KEYGEO p${i + 1}`); if (q.over || q.bodyOver) flags.push(`KEYOVER p${i + 1}`); if (q.letter !== p.letter) flags.push(`KEYLET p${i + 1}`); if (q.foot !== p.foot && !q.foot.includes('Form ' + p.letter)) flags.push(`KEYFOOT p${i+1} ${q.foot}`); }
      });
      if (flags.length) bad++;
      console.log(tag, JSON.stringify(r.per), 'pages', r.pages, 'key', r.keyPages, P.map(p => `[${p.letter} n${p.n} rows ${p.rows} strip ${p.strip}% foot "${p.foot}"]`).join(' '), flags.length ? 'FLAGS ' + flags.join(' | ') : 'ok');
    }
  }
  console.log('mp7 done, flagged', bad);
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
