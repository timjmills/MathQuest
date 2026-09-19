// Builds the printable mock-up pack.
//   node design/mockups/build.cjs            build every pages/*.mjs -> out/*.html, out/pdf/*.pdf, out/png/*-pN.png
//   node design/mockups/build.cjs 01         only files whose name starts with "01"
//   node design/mockups/build.cjs --no-pdf   HTML + PNG previews only
// Every page is checked: Andika must be loaded and nothing may overflow its sheet or its cell.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');
const { startServer } = require('../../tests/lib/ws-harness.cjs');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const noPdf = process.argv.includes('--no-pdf');

(async () => {
  for (const d of ['', 'pdf', 'png']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const files = fs.readdirSync(path.join(DIR, 'pages')).filter(f => f.endsWith('.mjs') && (!only.length || only.some(o => f.startsWith(o)))).sort();
  const { server, base } = await startServer();
  const browser = await puppeteer.launch({ headless: true });
  let failed = 0;
  try {
    for (const f of files) {
      const name = f.replace(/\.mjs$/, '');
      const mod = await import(pathToFileURL(path.join(DIR, 'pages', f)).href + `?t=${Date.now()}`);
      fs.writeFileSync(path.join(OUT, `${name}.html`), mod.default);

      const page = await browser.newPage();
      await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1.5 });
      await page.goto(`${base}/design/mockups/out/${name}.html`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);

      const report = await page.evaluate(() => {
        const out = { font: document.fonts.check('700 28px Andika') && document.fonts.check('400 28px Andika'), pages: 0, problems: [] };
        document.querySelectorAll('.ws-page').forEach((pg, i) => {
          out.pages++;
          const pr = pg.getBoundingClientRect();
          if (pg.scrollHeight > pg.clientHeight + 1 || pg.scrollWidth > pg.clientWidth + 1) out.problems.push(`page ${i + 1}: content overflows the sheet (${pg.scrollHeight - pg.clientHeight}px tall)`);
          pg.querySelectorAll('[data-ws-cell]').forEach((c, k) => {
            const cr = c.getBoundingClientRect();
            for (const el of c.querySelectorAll('*')) {
              const r = el.getBoundingClientRect();
              if (!r.width || !r.height) continue;
              if (r.right > cr.right + 0.75 || r.bottom > cr.bottom + 0.75 || r.left < cr.left - 0.75 || r.top < cr.top - 0.75) { out.problems.push(`page ${i + 1} cell ${k + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> sticks out of its cell`); break; }
            }
          });
          const body = pg.querySelector('.ws-body'); const br = body.getBoundingClientRect();
          if (br.bottom > pr.bottom) out.problems.push(`page ${i + 1}: body runs past the sheet`);
        });
        return out;
      });
      if (!report.font) report.problems.unshift('Andika did not load');

      const handles = await page.$$('.ws-page');
      for (let i = 0; i < handles.length; i++) await handles[i].screenshot({ path: path.join(OUT, 'png', `${name}-p${i + 1}.png`) });
      if (!noPdf) {
        await page.emulateMediaType('print');
        await page.pdf({ path: path.join(OUT, 'pdf', `${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      }
      await page.close();
      failed += report.problems.length ? 1 : 0;
      console.log(`${report.problems.length ? 'FAIL' : 'ok  '} ${name}: ${report.pages} pages${report.problems.length ? '\n     - ' + report.problems.slice(0, 8).join('\n     - ') : ''}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(failed ? 1 : 0);
})();
