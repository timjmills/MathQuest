// Round 4 SVG visual smoke test — renders the 8 reference cases at 1280x600.
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SHOT_DIR = path.join(__dirname, 'test-round4-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><link rel="icon" href="data:,">
<style>
body { font-family: "Open Sans", system-ui, sans-serif; padding: 16px; background: #f7f9fc; }
h2 { margin: 6px 0 4px; font-size: 13px; color: #333; }
.case { background: white; padding: 12px; margin-bottom: 12px; border: 1px solid #e6e8ec; border-radius: 6px; }
</style>
</head><body>
<div id="root">loading…</div>
<script type="module">
  import { createNumberLine, createBase10Blocks, createHopNumberLine } from './js/modules/svg-base10.js';
  import { createAnalogClockSVG } from './js/modules/svg-clock.js';
  import { createFactorLinksSVG, getFactorPairs } from './js/modules/svg-factors.js';

  const root = document.getElementById('root');
  root.innerHTML = '';

  function add(title, html) {
    const div = document.createElement('div');
    div.className = 'case';
    div.innerHTML = '<h2>' + title + '</h2>' + html;
    root.appendChild(div);
  }

  add('Number line 0-10 (highlight 7)', createNumberLine(0, 10, 7));
  add('Number line -5 to 5 (highlight -2)', createNumberLine(-5, 5, -2));
  add('Base-10 blocks for 147 (1 hundred + 4 tens + 7 ones)', createBase10Blocks(147));
  add('Hop number line 0-20 (5+8)', createHopNumberLine({
    min: 0, max: 20, step: 2, hops: [{from:0,to:5,label:'+5'},{from:5,to:13,label:'+8'}], highlightEnd: 13, showAnswer: false
  }));
  add('Analog clock 3:30', createAnalogClockSVG(3, 30, { size: 180 }));
  add('Analog clock 7:45', createAnalogClockSVG(7, 45, { size: 180 }));
  add('T-chart / factor links of 24 (showAnswers)', createFactorLinksSVG(24, { width: 320, height: 220, showAnswers: true }));
  add('Factor links of 12 (blank)', createFactorLinksSVG(12, { width: 280, height: 200, showAnswers: false }));

  window.__ready = true;
<\/script>
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(__dirname, '_round4_render.html'), HTML);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 600 });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto('http://localhost:8080/_round4_render.html', { waitUntil: 'networkidle0', timeout: 15000 });
  try {
    await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
  } catch (e) {
    console.error('NOT READY:', e.message);
  }

  await page.screenshot({ path: path.join(SHOT_DIR, 'all-cases.png'), fullPage: true });

  // Per-case crops
  const cases = await page.$$('.case');
  for (let i = 0; i < cases.length; i++) {
    const title = (await cases[i].$eval('h2', el => el.textContent)).replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    await cases[i].screenshot({ path: path.join(SHOT_DIR, (i+1) + '_' + title.slice(0,40) + '.png') });
  }

  console.log('Rendered', cases.length, 'cases.');
  if (errors.length) {
    console.error('ERRORS:');
    errors.forEach(e => console.error('  ' + e));
    process.exitCode = 1;
  } else {
    console.log('No console errors.');
  }
  await browser.close();
})();
