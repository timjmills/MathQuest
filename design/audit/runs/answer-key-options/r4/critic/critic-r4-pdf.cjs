const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const app = await open({ seed: 1 }); const { page } = app; page.setDefaultTimeout(0);
  try {
    const jobs = [
      ['ns-lesson-nl_add-L-copy', { role: 'lesson', sections: [{ skills: [{ categoryId: 'addition', skillId: 'nl_add' }] }], size: 'L', paper: 'A4', seed: 4242, key: { on: true, placement: 'after-page', style: 'copy', newSheet: true } }],
      ['ns-mp-add_wp_10-S-short', { role: 'more-practice', letters: ['A', 'B'], sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_wp_10' }] }], size: 'S', paper: 'A4', seed: 4242, key: { on: true, placement: 'after-page', style: 'short', newSheet: true } }],
      ['end-test-area_model-M-copy', { role: 'test', sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'area_model_mult' }] }], size: 'M', paper: 'A4', seed: 4242, key: { on: true, placement: 'end', style: 'copy' } }],
    ];
    for (const [name, req] of jobs) {
      const html = await page.evaluate(async (req) => { const r = await window.buildSheet(req); return window.sheetDocument(r.docHtml, 'x'); }, req);
      const p = await app.browser.newPage();
      await p.goto(app.base + '/index.html', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await p.setContent(html.replace('<head>', `<head><base href="${app.base}/">`), { waitUntil: 'networkidle0' });
      await p.evaluate(() => document.fonts.ready);
      await p.pdf({ path: path.join(OUT, name + '.pdf'), preferCSSPageSize: true, printBackground: true });
      await p.close();
      console.log(name, 'ok');
    }
  } finally { await app.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
