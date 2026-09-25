// Render the S1 touch-dot specimen to PNG.
//   node design/specimens/render-touch-dots.cjs            -> design/specimens/touch-dots.png
//   node design/specimens/render-touch-dots.cjs --zoom DIR -> also 3x crops of each section in DIR
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { startServer, chromePath } = require('../../tests/lib/ws-harness.cjs');

const args = process.argv.slice(2);
const ZOOM = args.includes('--zoom') ? args[args.indexOf('--zoom') + 1] : null;

(async () => {
  const { server, base } = await startServer();
  const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
    await page.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${base}/design/specimens/touch-dots.html`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__ready === true, { timeout: 30000 });
    const out = path.join(__dirname, 'touch-dots.png');
    await page.screenshot({ path: out, fullPage: true });
    console.log('wrote', path.relative(process.cwd(), out));
    // close-ups for review: the digits and the 28 pt fact row at 4x
    await page.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 4 });
    for (const [sel, name] of [['#digits', 'touch-dots-digits.png'], ['#facts .ws-sheet', 'touch-dots-facts-L.png']]) {
      const el = await page.$(sel);
      const file = path.join(__dirname, name);
      await el.screenshot({ path: file });
      console.log('wrote', path.relative(process.cwd(), file));
    }
    await page.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 2 });
    if (ZOOM) {
      fs.mkdirSync(ZOOM, { recursive: true });
      const hs = await page.$$eval('h2', (els) => els.map((e) => e.getBoundingClientRect().top + window.scrollY));
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      const cuts = [...hs, H];
      await page.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 4 });
      for (let i = 0; i < hs.length; i++) {
        for (let y = cuts[i]; y < cuts[i + 1]; y += 420) {
          const file = path.join(ZOOM, `sec${i + 1}-${Math.round(y)}.png`);
          await page.screenshot({ path: file, clip: { x: 0, y, width: 1320, height: Math.min(420, cuts[i + 1] - y) } });
        }
      }
      console.log('zoom crops in', ZOOM);
    }
  } finally {
    await browser.close();
    server.close();
  }
  if (errors.length) { console.error('page errors:', errors); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
