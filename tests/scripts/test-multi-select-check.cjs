// Standalone test for multi-select-check widget.
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
    import { renderMultiSelectCheck, checkMultiSelectCheck, setOnMultiSelectSubmit }
      from "/js/modules/widgets/multi-select-check.js";
    const q = {
      answerType: 'multi-select-check',
      text: 'Click ALL multiples of 6.',
      options: [
        { id: 'a', label: '12', correct: true  },
        { id: 'b', label: '15', correct: false },
        { id: 'c', label: '18', correct: true  },
        { id: 'd', label: '20', correct: false },
      ],
      ans: ['a', 'c'],
    };
    window.__lastSubmit = null;
    setOnMultiSelectSubmit((qq, sel) => { window.__lastSubmit = sel; });
    renderMultiSelectCheck(q, document.getElementById('container'));
    window.q = q;
    window.checkMSC = checkMultiSelectCheck;
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
        await page.waitForSelector('.msc-opt');

        // Initial: counter reads "0 of 4 selected" and submit disabled
        const initialCounter = await page.$eval('.msc-counter', el => el.textContent);
        if (!/0 of 4 selected/.test(initialCounter)) {
            throw new Error('Initial counter wrong: ' + initialCounter);
        }
        const initialSubmitDisabled = await page.$eval('.msc-submit', el => el.disabled);
        if (!initialSubmitDisabled) throw new Error('Submit should start disabled');

        // Click two correct options
        await page.click('.msc-opt[data-id="a"]');
        await page.click('.msc-opt[data-id="c"]');

        const counter2 = await page.$eval('.msc-counter', el => el.textContent);
        if (!/2 of 4 selected/.test(counter2)) {
            throw new Error('Counter after 2 clicks wrong: ' + counter2);
        }
        const ariaA = await page.$eval('.msc-opt[data-id="a"]', el => el.getAttribute('aria-pressed'));
        if (ariaA !== 'true') throw new Error('aria-pressed not toggled to true');

        // Toggle off and re-click for sanity (counter back to 1, then 2)
        await page.click('.msc-opt[data-id="a"]');
        const counter1 = await page.$eval('.msc-counter', el => el.textContent);
        if (!/1 of 4 selected/.test(counter1)) {
            throw new Error('Counter after toggle off wrong: ' + counter1);
        }
        await page.click('.msc-opt[data-id="a"]');

        // Score check (correct selection)
        const correctResult = await page.evaluate(() => window.checkMSC(window.q, ['a', 'c']));
        if (!correctResult) throw new Error('checkMultiSelectCheck returned false for correct selection');

        // Score check (wrong: missing one)
        const wrong1 = await page.evaluate(() => window.checkMSC(window.q, ['a']));
        if (wrong1) throw new Error('checkMultiSelectCheck returned true for incomplete selection');

        // Score check (wrong: extra)
        const wrong2 = await page.evaluate(() => window.checkMSC(window.q, ['a', 'b', 'c']));
        if (wrong2) throw new Error('checkMultiSelectCheck returned true for over-selection');

        // Score check (wrong: replacement)
        const wrong3 = await page.evaluate(() => window.checkMSC(window.q, ['a', 'b']));
        if (wrong3) throw new Error('checkMultiSelectCheck returned true for swapped selection');

        // Score check (empty)
        const wrongEmpty = await page.evaluate(() => window.checkMSC(window.q, []));
        if (wrongEmpty) throw new Error('checkMultiSelectCheck returned true for empty selection');

        // Submit and verify the hook fires with the selected IDs
        await page.click('.msc-submit');
        const lastSubmit = await page.evaluate(() => window.__lastSubmit);
        if (!Array.isArray(lastSubmit) || lastSubmit.length !== 2) {
            throw new Error('onMultiSelectSubmit did not receive expected selection: ' + JSON.stringify(lastSubmit));
        }
        if (!(lastSubmit.includes('a') && lastSubmit.includes('c'))) {
            throw new Error('Submitted IDs unexpected: ' + JSON.stringify(lastSubmit));
        }

        // After submit: options should be disabled (locked)
        const optsDisabled = await page.$$eval('.msc-opt', els => els.every(e => e.disabled));
        if (!optsDisabled) throw new Error('Options should be disabled after submit');

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
