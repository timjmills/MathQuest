const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
const JOBS = JSON.parse(fs.readFileSync(process.env.JOBS, 'utf8'));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 900, height: 1300, deviceScaleFactor: 1.5 } }); const { page } = app; page.setDefaultTimeout(0);
  try {
    for (const j of JOBS) {
      const req = { role: j.role, sections: [{ skills: [{ categoryId: j.c, skillId: j.s }] }], letters: j.role === 'more-practice' ? ['A', 'B'] : undefined, size: j.size || 'L', paper: 'A4', seed: 4242, key: j.key };
      const html = await page.evaluate(async (req) => { try { const r = await window.buildSheet(req); return window.sheetDocument(r.docHtml, 'x'); } catch (e) { return 'ERR ' + e.message; } }, req);
      if (html.startsWith('ERR')) { console.log(j.name, html); continue; }
      await page.evaluate(async (html) => { let f = document.getElementById('shotf'); if (f) f.remove(); f = document.createElement('iframe'); f.id = 'shotf'; f.style.cssText = 'position:fixed;left:0;top:0;width:880px;height:20000px;z-index:99999;background:#fff;border:0'; document.body.appendChild(f); await new Promise((ok) => { f.onload = ok; f.srcdoc = html; }); if (f.contentDocument.fonts) await f.contentDocument.fonts.ready; await new Promise((r) => setTimeout(r, 400)); }, html);
      const fr = await (await page.$('#shotf')).contentFrame();
      const pages = await fr.$$('section.ws-page');
      const modes = await fr.evaluate(() => [...document.querySelectorAll('section.ws-page')].map((s) => (s.getAttribute('data-ws-mode') || '?')[0].toUpperCase()).join(''));
      console.log(j.name, 'order', modes);
      for (const idx of (j.pages || [])) { if (pages[idx]) { await pages[idx].scrollIntoView(); await pages[idx].screenshot({ path: path.join(OUT, `${j.name}-p${idx + 1}.png`) }); } }
    }
  } finally { await app.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
