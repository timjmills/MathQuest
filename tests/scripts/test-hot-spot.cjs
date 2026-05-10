// Standalone test for hot-spot widget.
// Spins up a tiny HTTP server, loads the page in puppeteer, and exercises
// both the renderer and the scorer for multi- and single-select modes.

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
  <div id="container2"></div>
  <script type="module">
    import { renderHotSpot, checkHotSpot, setOnHotSpotSubmit }
      from "/js/modules/widgets/hot-spot.js";

    // Multi-select: 3 rectangular hot-spots, h0 and h2 are correct.
    const qMulti = {
      answerType: 'hot-spot',
      text: 'Click ALL the right angles.',
      backgroundSvg: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect x="0" y="0" width="400" height="300" fill="#fff" stroke="#333" stroke-width="2"/></svg>',
      hotSpots: [
        { id: 'h0', shape: 'rect', x: 20,  y: 20, w: 80, h: 80, label: 'Top-left' },
        { id: 'h1', shape: 'rect', x: 160, y: 20, w: 80, h: 80, label: 'Top-middle' },
        { id: 'h2', shape: 'rect', x: 300, y: 20, w: 80, h: 80, label: 'Top-right' },
      ],
      ans: ['h0', 'h2'],
      selectMode: 'multi',
    };

    // Single-select: same shape, only h1 correct.
    const qSingle = {
      answerType: 'hot-spot',
      text: 'Click the obtuse angle.',
      backgroundSvg: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect x="0" y="0" width="400" height="300" fill="#fff" stroke="#333" stroke-width="2"/></svg>',
      hotSpots: [
        { id: 'h0', shape: 'rect',    x: 20, y: 20, w: 80, h: 80, label: 'Spot 0' },
        { id: 'h1', shape: 'circle',  cx: 200, cy: 60, r: 40,    label: 'Spot 1' },
        { id: 'h2', shape: 'polygon', points: '300,20 380,20 340,100', label: 'Spot 2' },
      ],
      ans: 'h1',
      selectMode: 'single',
    };

    window.__multiSubmit = null;
    window.__singleSubmit = null;
    setOnHotSpotSubmit((qq, ids) => {
      if (qq === qMulti) window.__multiSubmit = ids.slice().sort();
      else window.__singleSubmit = ids.slice();
    });

    renderHotSpot(qMulti, document.getElementById('container'));
    renderHotSpot(qSingle, document.getElementById('container2'));

    window.qMulti = qMulti;
    window.qSingle = qSingle;
    window.checkHS = checkHotSpot;
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
        await page.waitForSelector('#container .hs-region');
        await page.waitForSelector('#container2 .hs-region');

        // ===== Multi-select mode =====
        // 3 regions exist
        const regionsM = await page.$$eval('#container .hs-region', els => els.length);
        if (regionsM !== 3) throw new Error('Expected 3 multi regions, got ' + regionsM);

        // Initial counter
        const cInit = await page.$eval('#container .hs-counter', el => el.textContent);
        if (!/0 of 3 selected/.test(cInit)) throw new Error('Multi initial counter wrong: ' + cInit);

        // Submit disabled at start
        const subDisInit = await page.$eval('#container .hs-submit', el => el.disabled);
        if (!subDisInit) throw new Error('Multi submit should start disabled');

        // Click h0
        await page.click('#container .hs-region[data-id="h0"]');
        // Wait for the post-click refresh (50ms)
        await new Promise(r => setTimeout(r, 100));
        const cAfter1 = await page.$eval('#container .hs-counter', el => el.textContent);
        if (!/1 of 3 selected/.test(cAfter1)) throw new Error('Counter after h0 click wrong: ' + cAfter1);
        const h0Sel = await page.$eval('#container .hs-region[data-id="h0"]', el => el.classList.contains('selected'));
        if (!h0Sel) throw new Error('h0 should be selected after click');
        const h0Aria = await page.$eval('#container .hs-region[data-id="h0"]', el => el.getAttribute('aria-pressed'));
        if (h0Aria !== 'true') throw new Error('h0 aria-pressed should be true');

        // Click h2
        await page.click('#container .hs-region[data-id="h2"]');
        await new Promise(r => setTimeout(r, 100));
        const cAfter2 = await page.$eval('#container .hs-counter', el => el.textContent);
        if (!/2 of 3 selected/.test(cAfter2)) throw new Error('Counter after h2 click wrong: ' + cAfter2);

        // Verify checkHotSpot returns true for {h0,h2}
        const correct1 = await page.evaluate(() => window.checkHS(window.qMulti, ['h0', 'h2']));
        if (!correct1) throw new Error('checkHotSpot multi returned false for [h0,h2] vs ans [h0,h2]');
        const correct1b = await page.evaluate(() => window.checkHS(window.qMulti, ['h2', 'h0']));
        if (!correct1b) throw new Error('checkHotSpot multi should be set-equal (order-insensitive)');

        // Wrong region only
        const wrong1 = await page.evaluate(() => window.checkHS(window.qMulti, ['h1']));
        if (wrong1) throw new Error('checkHotSpot multi returned true for [h1] vs ans [h0,h2]');

        // Partial match
        const wrong2 = await page.evaluate(() => window.checkHS(window.qMulti, ['h0']));
        if (wrong2) throw new Error('checkHotSpot multi returned true for [h0] vs ans [h0,h2]');

        // Extra selection
        const wrong3 = await page.evaluate(() => window.checkHS(window.qMulti, ['h0', 'h1', 'h2']));
        if (wrong3) throw new Error('checkHotSpot multi returned true for [h0,h1,h2] vs ans [h0,h2]');

        // Toggle off h0 by re-clicking
        await page.click('#container .hs-region[data-id="h0"]');
        await new Promise(r => setTimeout(r, 100));
        const cAfter3 = await page.$eval('#container .hs-counter', el => el.textContent);
        if (!/1 of 3 selected/.test(cAfter3)) throw new Error('Counter after toggle-off h0 wrong: ' + cAfter3);

        // Re-click h0 to re-select, then submit
        await page.click('#container .hs-region[data-id="h0"]');
        await new Promise(r => setTimeout(r, 100));
        const subDisBefore = await page.$eval('#container .hs-submit', el => el.disabled);
        if (subDisBefore) throw new Error('Multi submit should be enabled with 2 selected');
        await page.click('#container .hs-submit');
        await new Promise(r => setTimeout(r, 100));
        const lastM = await page.evaluate(() => window.__multiSubmit);
        if (!lastM || lastM.length !== 2 || lastM[0] !== 'h0' || lastM[1] !== 'h2') {
            throw new Error('Multi onHotSpotSubmit got wrong ids: ' + JSON.stringify(lastM));
        }
        const subAfter = await page.$eval('#container .hs-submit', el => el.disabled);
        if (!subAfter) throw new Error('Multi submit should be locked after submit');

        // ===== Single-select mode =====
        // Click h0 first
        await page.click('#container2 .hs-region[data-id="h0"]');
        await new Promise(r => setTimeout(r, 100));
        const sCounter1 = await page.$eval('#container2 .hs-counter', el => el.textContent);
        if (!/Region selected/.test(sCounter1)) throw new Error('Single counter after h0 wrong: ' + sCounter1);
        const sSelCount1 = await page.$$eval('#container2 .hs-region.selected', els => els.length);
        if (sSelCount1 !== 1) throw new Error('Should have 1 selected after first click, got ' + sSelCount1);

        // Click h1 — should REPLACE h0 (single mode)
        await page.click('#container2 .hs-region[data-id="h1"]');
        await new Promise(r => setTimeout(r, 100));
        const sSelCount2 = await page.$$eval('#container2 .hs-region.selected', els => els.length);
        if (sSelCount2 !== 1) throw new Error('Single mode should still have only 1 selected after second click, got ' + sSelCount2);
        const h1Sel = await page.$eval('#container2 .hs-region[data-id="h1"]', el => el.classList.contains('selected'));
        if (!h1Sel) throw new Error('h1 should be selected after replace-click');
        const h0SelAfter = await page.$eval('#container2 .hs-region[data-id="h0"]', el => el.classList.contains('selected'));
        if (h0SelAfter) throw new Error('h0 should be deselected after single-mode replace');

        // Verify single-mode scoring
        const sCorrect = await page.evaluate(() => window.checkHS(window.qSingle, ['h1']));
        if (!sCorrect) throw new Error('checkHotSpot single returned false for [h1] vs ans h1');
        const sWrong1 = await page.evaluate(() => window.checkHS(window.qSingle, ['h0']));
        if (sWrong1) throw new Error('checkHotSpot single returned true for [h0] vs ans h1');
        const sWrong2 = await page.evaluate(() => window.checkHS(window.qSingle, ['h1', 'h2']));
        if (sWrong2) throw new Error('checkHotSpot single returned true for two-element selection');
        const sWrong3 = await page.evaluate(() => window.checkHS(window.qSingle, []));
        if (sWrong3) throw new Error('checkHotSpot single returned true for empty selection');

        // Submit single
        await page.click('#container2 .hs-submit');
        await new Promise(r => setTimeout(r, 100));
        const lastS = await page.evaluate(() => window.__singleSubmit);
        if (!lastS || lastS.length !== 1 || lastS[0] !== 'h1') {
            throw new Error('Single onHotSpotSubmit got wrong ids: ' + JSON.stringify(lastS));
        }

        // ARIA + role coverage
        const hasAppRole = await page.$eval('#container .hs-host', el => el.getAttribute('role') === 'application');
        if (!hasAppRole) throw new Error('Host missing role=application');
        const hasButtonRole = await page.$eval('#container .hs-region', el => el.getAttribute('role') === 'button');
        if (!hasButtonRole) throw new Error('Region missing role=button');
        const hasAriaLive = await page.$eval('#container .hs-counter', el => el.getAttribute('aria-live') === 'polite');
        if (!hasAriaLive) throw new Error('Counter missing aria-live=polite');

        // Mixed shape coverage: rect + circle + polygon all present in single container
        const rectCount = await page.$$eval('#container2 rect.hs-region', els => els.length);
        const circleCount = await page.$$eval('#container2 circle.hs-region', els => els.length);
        const polyCount = await page.$$eval('#container2 polygon.hs-region', els => els.length);
        if (rectCount !== 1 || circleCount !== 1 || polyCount !== 1) {
            throw new Error(`Expected 1 of each shape, got rect=${rectCount} circle=${circleCount} polygon=${polyCount}`);
        }

        // Background SVG was rendered (the white bg rect)
        const bgRendered = await page.$eval('#container .hs-bg-wrap svg', el => !!el);
        if (!bgRendered) throw new Error('Background SVG not rendered');

        // Overlay viewBox matches background viewBox
        const overlayVB = await page.$eval('#container .hs-overlay', el => el.getAttribute('viewBox'));
        if (overlayVB !== '0 0 400 300') throw new Error('Overlay viewBox should be 0 0 400 300, got: ' + overlayVB);

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
