// Standard-resolution (DPR 1) proof of the screen single-dot outline (owner exception R2-4):
// 4 and 5 (and 6-9 for comparison) as touch numerals at 40 and 48 px, plain beside touch.
//   node tests/scripts/ws-touchdots-dpr1.cjs [--out design/audit/runs/touchdots/dpr1-45.png]
const path = require('path');
const puppeteer = require('puppeteer');
const { startServer, chromePath, ROOT } = require('../lib/ws-harness.cjs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', path.join(ROOT, 'design/audit/runs/touchdots/dpr1-45.png')));

(async () => {
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 520, height: 260, deviceScaleFactor: 1 });
        await page.goto(`${base}/css/fonts/Andika-OFL.txt`);
        await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${base}/css/fonts/andika.css">
            <style>body{margin:12px;background:#fff;font-family:Andika;font-feature-settings:"cv04" 1}div{line-height:1.3;white-space:nowrap}</style></head>
            <body><div id="a" style="font-size:40px"></div><div id="b" style="font-size:48px"></div></body></html>`);
        await page.evaluate(async (b) => {
            const td = await import(`${b}/js/modules/sheet/touchdots.js`);
            const row = (px) => ['4', '5', '6', '9'].map((d) => `${d}${td.touchNumeralHTML(d, { em: px, unit: 'px' })}`).join(' &nbsp;');
            document.getElementById('a').innerHTML = row(40);
            document.getElementById('b').innerHTML = row(48);
            await document.fonts.ready;
        }, base);
        await page.screenshot({ path: OUT });
        console.log(`ws-touchdots-dpr1: OK -> ${path.relative(ROOT, OUT)}`);
    } finally {
        await browser.close();
        server.close();
    }
})().catch((e) => { console.error(e); console.log('ws-touchdots-dpr1: FAIL'); process.exit(1); });
