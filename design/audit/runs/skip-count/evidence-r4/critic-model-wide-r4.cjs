// critic r4 (skip-count lane): the scripted-model sheets that small-fixes-model-pages reports as gaining pages
// (count_by_tables, seed 4242 as that gate uses, key on), shot full page with the app's own fonts (a <base> so Andika
// loads), plus the page count and the states on each page. MQ_ROOT=<tree> shoots another checkout.
// node design/audit/runs/skip-count/evidence-r4/critic-model-wide-r4.cjs <outdir> [prefix]
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.argv[2]; const PFX = process.argv[3] || 'head'; fs.mkdirSync(OUT, { recursive: true });
const R = (step, start, at) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {});
const JOBS = [
  ['s25000-onepage', { rows: [R(25000)], onePage: true }, ['S', 'M', 'L'], ['A4', 'Letter']],
  ['s25000', { rows: [R(25000)] }, ['S', 'M', 'L'], ['A4', 'Letter']],
  ['w7', { rows: [R(100000, 'custom', 1000000)] }, ['S', 'M', 'L'], ['A4', 'Letter']],
  ['w7-lines', { rows: [R(100000, 'custom', 1000000)], spaces: 'line' }, ['M', 'L'], ['A4']],
];
(async () => {
  const app = await open({ seed: 1, viewport: { width: 900, height: 1200, deviceScaleFactor: 1 } });
  const { page } = app;
  const p2 = await app.browser.newPage();
  await p2.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
  const href = await page.evaluate(() => location.href);
  const lines = [];
  for (const [name, opts, sizes, papers] of JOBS) for (const size of sizes) for (const paper of papers) {
    const o = await page.evaluate(async ({ opts, size, paper }) => {
      const r = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }] }], size, paper, seed: 4242, key: true });
      const d = document.createElement('div'); d.innerHTML = r.pupilHtml || '';
      const pages = [...d.querySelectorAll('.ws-page, .mq-page, section.page')].map((pg) => pg.querySelectorAll('.mq-steptext, .mq-steptop').length);
      return { html: window.sheetDocument(r.pupilHtml, 'P'), pages: r.pageCount, perPage: pages, steps: [...d.querySelectorAll('.mq-steptext span, .mq-steptop')].map((x) => x.textContent.trim()).slice(0, 8) };
    }, { opts, size, paper });
    await p2.setContent(o.html.replace(/<head>/i, `<head><base href="${href}">`), { waitUntil: 'load' }).catch(() => {});
    await p2.evaluate(() => document.fonts && document.fonts.ready); await new Promise((r) => setTimeout(r, 500));
    const f = `${PFX}-${name}-${size}-${paper}.png`;
    await p2.screenshot({ path: path.join(OUT, f), fullPage: true });
    lines.push(`${f}: pages ${o.pages} perPage ${JSON.stringify(o.perPage)} steps ${JSON.stringify(o.steps)}`);
  }
  fs.writeFileSync(path.join(OUT, `${PFX}-model-wide.txt`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
