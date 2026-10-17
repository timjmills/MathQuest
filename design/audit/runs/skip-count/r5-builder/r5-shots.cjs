// builder r5 (skip-count lane, from critic-model-wide-r4.cjs): the D12 Model sheets (step 25,000 + one page), the 7-digit Model and
// an S Independent page of 7-digit numbers (N10), each pupil page and key, plus page counts and states per page.
// (was: the scripted-model sheets that small-fixes-model-pages reports as gaining pages
// (count_by_tables, seed 4242 as that gate uses, key on), shot full page with the app's own fonts (a <base> so Andika
// loads), plus the page count and the states on each page. MQ_ROOT=<tree> shoots another checkout.
// node design/audit/runs/skip-count/r5-builder/r5-shots.cjs <outdir> [prefix]
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.argv[2]; const PFX = process.argv[3] || 'head'; fs.mkdirSync(OUT, { recursive: true });
const R = (step, start, at) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {});
const JOBS = [
  ['s25000-onepage', { rows: [R(25000)], onePage: true }, ['S', 'M', 'L'], ['A4', 'Letter'], 'scripted-model'],
  ['w7', { rows: [R(100000, 'custom', 1000000)] }, ['S', 'M', 'L'], ['A4', 'Letter'], 'scripted-model'],
  ['w7-onepage', { rows: [R(100000, 'custom', 1000000)], onePage: true }, ['S'], ['A4', 'Letter'], 'scripted-model'],
  ['w7-indep', { rows: [R(100000, 'custom', 1000000)] }, ['S'], ['A4'], 'independent'],
  ['w7-guided', { rows: [R(100000, 'custom', 1000000)] }, ['S'], ['A4'], 'guided'],
  ['w7-lines-indep', { rows: [R(100000, 'custom', 1000000)], spaces: 'line' }, ['S'], ['A4'], 'independent'],
];
(async () => {
  const app = await open({ seed: 1, viewport: { width: 900, height: 1200, deviceScaleFactor: 1 } });
  const { page } = app;
  const p2 = await app.browser.newPage();
  await p2.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
  const href = await page.evaluate(() => location.href);
  const lines = [];
  for (const [name, opts, sizes, papers, role] of JOBS) for (const size of sizes) for (const paper of papers) for (const which of ['pupil', 'key']) {
    const o = await page.evaluate(async ({ opts, size, paper, role, which }) => {
      const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }] }], size, paper, seed: 4242, key: true });
      const d = document.createElement('div'); const h = which === 'key' ? r.keyHtml : r.pupilHtml; d.innerHTML = h || '';
      const pages = [...d.querySelectorAll('section.ws-page')].map((pg) => pg.querySelectorAll('.k2-countrow').length);
      return { html: window.sheetDocument(h, 'P', { paper }), pages: which === 'key' ? r.keyPageCount : r.pageCount, perPage: pages, steps: [...d.querySelectorAll('.mq-steptext span, .mq-steptop')].map((x) => x.textContent.trim()).slice(0, 8) };
    }, { opts, size, paper, role, which });
    await p2.setContent(o.html.replace(/<head>/i, `<head><base href="${href}">`), { waitUntil: 'load' }).catch(() => {});
    await p2.evaluate(() => document.fonts && document.fonts.ready); await new Promise((r) => setTimeout(r, 500));
    const f = `${PFX}-${name}-${size}-${paper}-${which}.png`;
    await p2.screenshot({ path: path.join(OUT, f), fullPage: true });
    lines.push(`${f}: pages ${o.pages} rows per page ${JSON.stringify(o.perPage)} steps ${JSON.stringify(o.steps)}`);
  }
  fs.writeFileSync(path.join(OUT, `${PFX}-model-wide.txt`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
