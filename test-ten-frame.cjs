// Standalone test for ten-frame widget.
// Spins up a tiny HTTP server, loads the page in puppeteer, and exercises
// both the renderer and the scorer.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = __dirname;
const TEST_HTML = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/css/map-mode.css">
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import { renderTenFrame, checkTenFrame, setOnTenFrameSubmit }
      from "/js/modules/widgets/ten-frame.js";
    const q = {
      answerType: 'ten-frame',
      text: 'Click the boxes to show 7.',
      ans: 7,
      initialDots: 0,
      maxDots: 10,
    };
    window.__lastSubmit = null;
    setOnTenFrameSubmit((qq, count) => { window.__lastSubmit = count; });
    renderTenFrame(q, document.getElementById('container'));
    window.q = q;
    window.checkTF = checkTenFrame;
    window.__ready = true;
  </script>
</body></html>`;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
};

function startServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let url = req.url.split('?')[0];
            if (url === '/' || url === '/test.html') {
                res.writeHead(200, { 'Content-Type': MIME['.html'] });
                res.end(TEST_HTML);
                return;
            }
            const filePath = path.join(ROOT, url);
            if (!filePath.startsWith(ROOT)) {
                res.writeHead(403); res.end('Forbidden'); return;
            }
            fs.readFile(filePath, (err, buf) => {
                if (err) { res.writeHead(404); res.end('Not found'); return; }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
                res.end(buf);
            });
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
        server.on('error', reject);
    });
}

(async () => {
    const server = await startServer();
    const port = server.address().port;
    const browser = await puppeteer.launch({ headless: 'new' });
    try {
        const page = await browser.newPage();
        page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); });
        page.on('console', (msg) => {
            if (msg.type() === 'error') console.error('console.error:', msg.text());
        });

        await page.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
        await page.waitForSelector('.tf-cell');

        // Initial: 10 cells exist, counter reads "0 of 10 filled."
        const cellCount = await page.$$eval('.tf-cell', els => els.length);
        if (cellCount !== 10) throw new Error('Expected 10 cells, got ' + cellCount);

        const initialCounter = await page.$eval('.tf-counter', el => el.textContent);
        if (!/0 of 10 filled/.test(initialCounter)) {
            throw new Error('Initial counter wrong: ' + initialCounter);
        }
        const filledCountInit = await page.$$eval('.tf-cell.filled', els => els.length);
        if (filledCountInit !== 0) throw new Error('Initial filled count not 0: ' + filledCountInit);

        // Verify grid is 5x2 (tf-10 class on frame)
        const hasTf10 = await page.$eval('.tf-frame', el => el.classList.contains('tf-10'));
        if (!hasTf10) throw new Error('Frame should have tf-10 class for 5x2 grid');

        // Click + button 3 times
        await page.click('.tf-plus');
        await page.click('.tf-plus');
        await page.click('.tf-plus');
        const c3 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/3 of 10 filled/.test(c3)) throw new Error('Counter after +3 wrong: ' + c3);
        const filled3 = await page.$$eval('.tf-cell.filled', els => els.length);
        if (filled3 !== 3) throw new Error('Filled cells after +3 should be 3, got ' + filled3);

        // Click - button once
        await page.click('.tf-minus');
        const c2 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/2 of 10 filled/.test(c2)) throw new Error('Counter after - wrong: ' + c2);

        // Click cell at data-index 5 — should fill up to 6 (left-to-right top-to-bottom)
        await page.click('.tf-cell[data-index="5"]');
        const c6 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/6 of 10 filled/.test(c6)) throw new Error('Counter after cell-click idx5 wrong: ' + c6);

        // Click cell at data-index 2 (which is filled) — should clear back to count=2
        await page.click('.tf-cell[data-index="2"]');
        const cBack2 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/2 of 10 filled/.test(cBack2)) throw new Error('Counter after toggle-fill back wrong: ' + cBack2);

        // Clear button → 0
        await page.click('.tf-clear');
        const c0 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/0 of 10 filled/.test(c0)) throw new Error('Counter after clear wrong: ' + c0);

        // Score check (correct)
        const correct = await page.evaluate(() => window.checkTF(window.q, 7));
        if (!correct) throw new Error('checkTenFrame returned false for count=7 ans=7');
        // Score check (wrong)
        const wrong1 = await page.evaluate(() => window.checkTF(window.q, 6));
        if (wrong1) throw new Error('checkTenFrame returned true for count=6 ans=7');
        const wrong2 = await page.evaluate(() => window.checkTF(window.q, 0));
        if (wrong2) throw new Error('checkTenFrame returned true for count=0 ans=7');

        // ARIA: live region present, role=grid, role=gridcell
        const hasGridRole = await page.$eval('.tf-frame', el => el.getAttribute('role') === 'grid');
        if (!hasGridRole) throw new Error('Frame missing role=grid');
        const hasGridCell = await page.$eval('.tf-cell', el => el.getAttribute('role') === 'gridcell');
        if (!hasGridCell) throw new Error('Cell missing role=gridcell');
        const hasAriaLive = await page.$eval('.tf-counter', el => el.getAttribute('aria-live') === 'polite');
        if (!hasAriaLive) throw new Error('Counter missing aria-live=polite');

        // Bring count to 7 and submit; verify hook fires with 7
        for (let i = 0; i < 7; i++) await page.click('.tf-plus');
        const c7 = await page.$eval('.tf-counter', el => el.textContent);
        if (!/7 of 10 filled/.test(c7)) throw new Error('Counter at 7 wrong: ' + c7);

        await page.click('.tf-submit');
        const lastSubmit = await page.evaluate(() => window.__lastSubmit);
        if (lastSubmit !== 7) {
            throw new Error('onTenFrameSubmit did not receive 7, got: ' + lastSubmit);
        }

        // After submit, controls should be locked
        const submitDisabled = await page.$eval('.tf-submit', el => el.disabled);
        if (!submitDisabled) throw new Error('Submit should be disabled after submit');
        const plusDisabled = await page.$eval('.tf-plus', el => el.disabled);
        if (!plusDisabled) throw new Error('+ should be disabled after submit');

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
