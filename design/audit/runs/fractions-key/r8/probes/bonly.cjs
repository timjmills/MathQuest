// critic r8: does letter B of an A,B request hold as many problems as B requested alone (letters ['B'])?
// node bonly.cjs <repo> <cat:skill:size:offset,...> [pngdir]
const path = require('path'), fs = require('fs');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const PNG = process.argv[4] || null;
(async () => {
  if (PNG) fs.mkdirSync(PNG, { recursive: true });
  const app = await open({ seed: 1 }); const { page } = app;
  const sheet = await app.browser.newPage(); await sheet.setViewport({ width: 900, height: 1200 }); await sheet.goto(page.url(), { waitUntil: 'domcontentloaded' });
  for (const job of process.argv[3].split(',')) {
    const [c, k, size, off] = job.split(':'); const seed = (hash(`${c}__${k}:print`) + Number(off)) >>> 0;
    const out = {};
    for (const letters of [['A', 'B'], ['B'], ['A']]) {
      const r = await page.evaluate(async ({ c, k, size, seed, letters }) => {
        const o = await window.buildSheet({ role: 'more-practice', sections: [{ skills: [{ categoryId: c, skillId: k }] }], size, look: 'ican', key: true, seed, letters });
        const per = {}; o.items.forEach(it => { per[it.letter || '?'] = (per[it.letter || '?'] || 0) + 1; });
        return { per, html: window.sheetDocument(o.pupilHtml, k) };
      }, { c, k, size, seed, letters });
      out[letters.join('')] = r.per;
      if (PNG) { await sheet.setContent(r.html, { waitUntil: 'load' }); await new Promise(z => setTimeout(z, 250)); const els = await sheet.$$('.ws-page'); for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(PNG, `${k}-mp-${size}-s${off}-${letters.join('')}-p${i + 1}.png`) }); }
    }
    const bad = (out.AB.B || 0) < (out.B.B || 0) || (out.AB.A || 0) < (out.A.A || 0);
    console.log(k, size, 's' + off, 'AB', JSON.stringify(out.AB), 'B-alone', JSON.stringify(out.B), 'A-alone', JSON.stringify(out.A), bad ? 'LESS' : 'ok');
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
