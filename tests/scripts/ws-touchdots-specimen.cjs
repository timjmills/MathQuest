// The touch-numeral SPECIMEN: 0-9 at every digit size the app uses, plain beside touch, the trace
// variants and a registration row (design/audit/runs/touchdots/specimen.html).
//   node tests/scripts/ws-touchdots-specimen.cjs [--out design/audit/runs/touchdots/specimen.png]
// Also checks, in the browser, that a touch numeral's host span has the plain digit's exact box.
const path = require('path');
const puppeteer = require('puppeteer');
const { startServer, chromePath, waitFor, ROOT } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', path.join(ROOT, 'design/audit/runs/touchdots/specimen.png')));

(async () => {
    const { server, base } = await startServer();
    const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
    page.on('pageerror', (e) => { console.log('pageerror', e.message); });
    await page.goto(base + '/design/audit/runs/touchdots/specimen.html', { waitUntil: 'networkidle2', timeout: 60000 });
    let bad = 0;
    try {
        await waitFor(page, () => document.body.getAttribute('data-ready') === '1', 15000, 'specimen');
        const boxes = await page.evaluate(() => Array.from(document.querySelectorAll('.pair')).map((p) => {
            const [a, b] = p.children;
            const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
            return { d: a.textContent, w: [ra.width, rb.width], h: [ra.height, rb.height], y: [ra.bottom, rb.bottom] };
        }));
        boxes.forEach((x) => {
            if (Math.abs(x.w[0] - x.w[1]) > 0.5 || Math.abs(x.y[0] - x.y[1]) > 0.5) { bad++; console.log('MOVED', JSON.stringify(x)); }
        });
        await page.screenshot({ path: OUT, fullPage: true });
        console.log(`specimen: ${boxes.length} pairs, ${bad} moved -> ${path.relative(ROOT, OUT)}`);
    } finally {
        await browser.close();
        if (server) server.close();
    }
    console.log(bad ? 'ws-touchdots-specimen: FAIL' : 'ws-touchdots-specimen: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-touchdots-specimen: FAIL'); process.exit(1); });
