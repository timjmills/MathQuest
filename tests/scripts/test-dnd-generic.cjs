// Standalone test for dnd-generic widget.
// Spins up a tiny HTTP server, loads the page in puppeteer, and exercises
// both modes (order + categorize) via the click-and-click fallback path.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = __dirname;

function buildHtml(modeBlock) {
    return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/css/map-mode.css">
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import { renderDndGeneric, checkDndGeneric, setOnDndSubmit }
      from "/js/modules/widgets/dnd-generic.js";
    ${modeBlock}
    window.__lastSubmit = null;
    setOnDndSubmit((qq, st) => { window.__lastSubmit = st; });
    renderDndGeneric(q, document.getElementById('container'));
    window.q = q;
    window.checkDND = checkDndGeneric;
    window.__ready = true;
  </script>
</body></html>`;
}

const ORDER_HTML = buildHtml(`
    const q = {
      answerType: 'dnd-generic',
      dndMode: 'order',
      text: 'Drag the fractions to least → greatest order.',
      orderLabel: 'least to greatest',
      tiles: [
        { id: 't0', label: '1/2' },
        { id: 't1', label: '3/4' },
        { id: 't2', label: '1/4' },
        { id: 't3', label: '2/3' },
      ],
      ans: ['t2', 't0', 't3', 't1'],
    };
`);

const CAT_HTML = buildHtml(`
    const q = {
      answerType: 'dnd-generic',
      dndMode: 'categorize',
      text: 'Sort the numbers into Even or Odd.',
      tiles: [
        { id: 't0', label: '4'  },
        { id: 't1', label: '7'  },
        { id: 't2', label: '12' },
        { id: 't3', label: '9'  },
      ],
      bins: [
        { id: 'binA', label: 'Even' },
        { id: 'binB', label: 'Odd' },
      ],
      ans: { t0: 'binA', t1: 'binB', t2: 'binA', t3: 'binB' },
    };
`);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
};

let CURRENT_HTML = ORDER_HTML;

function startServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let url = req.url.split('?')[0];
            if (url === '/' || url === '/test.html') {
                res.writeHead(200, { 'Content-Type': MIME['.html'] });
                res.end(CURRENT_HTML);
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

async function clickByDataId(page, id) {
    await page.click(`.dnd-tile[data-id="${id}"]`);
}

async function loadPage(page, port) {
    await page.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
    await page.waitForSelector('.dnd-tile');
}

async function runOrderTests(page, port) {
    CURRENT_HTML = ORDER_HTML;
    await loadPage(page, port);

    // Pure-function checks first (no DOM interaction needed)
    const correctPure = await page.evaluate(() =>
        window.checkDND(window.q, ['t2', 't0', 't3', 't1'])
    );
    if (!correctPure) throw new Error('order: pure check returned false for correct order');
    const wrongPure = await page.evaluate(() =>
        window.checkDND(window.q, ['t0', 't1', 't2', 't3'])
    );
    if (wrongPure) throw new Error('order: pure check returned true for wrong order');

    // Slots present
    const slotCount = await page.$$eval('.dnd-slot', els => els.length);
    if (slotCount !== 4) throw new Error('order: expected 4 slots, got ' + slotCount);

    // Click t2 → click slot 0
    await clickByDataId(page, 't2');
    await page.click('.dnd-slot[data-slot="0"]');
    // Click t0 → click slot 1
    await clickByDataId(page, 't0');
    await page.click('.dnd-slot[data-slot="1"]');
    // Click t3 → click slot 2
    await clickByDataId(page, 't3');
    await page.click('.dnd-slot[data-slot="2"]');
    // Click t1 → click slot 3
    await clickByDataId(page, 't1');
    await page.click('.dnd-slot[data-slot="3"]');

    // Submit should now be enabled
    const submitEnabled = await page.$eval('.dnd-submit', el => !el.disabled);
    if (!submitEnabled) throw new Error('order: submit not enabled after placing all tiles');

    await page.click('.dnd-submit');
    const submittedOrder = await page.evaluate(() => window.__lastSubmit);
    if (!Array.isArray(submittedOrder) || submittedOrder.join(',') !== 't2,t0,t3,t1') {
        throw new Error('order: onDndSubmit got unexpected order: ' + JSON.stringify(submittedOrder));
    }
    const isCorrectFromHandler = await page.evaluate(() =>
        window.checkDND(window.q, window.__lastSubmit)
    );
    if (!isCorrectFromHandler) throw new Error('order: round-trip check failed');

    console.log('order mode: PASS');

    // Now test wrong-order: re-load fresh and place in wrong order
    await loadPage(page, port);
    await clickByDataId(page, 't0');
    await page.click('.dnd-slot[data-slot="0"]');
    await clickByDataId(page, 't1');
    await page.click('.dnd-slot[data-slot="1"]');
    await clickByDataId(page, 't2');
    await page.click('.dnd-slot[data-slot="2"]');
    await clickByDataId(page, 't3');
    await page.click('.dnd-slot[data-slot="3"]');
    await page.click('.dnd-submit');
    const wrongFromHandler = await page.evaluate(() =>
        window.checkDND(window.q, window.__lastSubmit)
    );
    if (wrongFromHandler) throw new Error('order: wrong sequence scored as correct');
    console.log('order mode wrong-sequence: PASS');

    // ARIA checks
    await loadPage(page, port);
    const hasAppRole = await page.$eval('.dnd-host', el => el.getAttribute('role') === 'application');
    if (!hasAppRole) throw new Error('order: host missing role=application');
    const hasLive = await page.$eval('.dnd-live', el => el.getAttribute('aria-live') === 'polite');
    if (!hasLive) throw new Error('order: missing aria-live region');
    const tilePressedInit = await page.$eval('.dnd-tile[data-id="t0"]', el => el.getAttribute('aria-pressed'));
    if (tilePressedInit !== 'false') throw new Error('order: aria-pressed should start false');
    await clickByDataId(page, 't0');
    const tilePressedAfter = await page.$eval('.dnd-tile[data-id="t0"]', el => el.getAttribute('aria-pressed'));
    if (tilePressedAfter !== 'true') throw new Error('order: aria-pressed should be true after pickup');
    const tileActive = await page.$eval('.dnd-tile[data-id="t0"]', el => el.classList.contains('tile-active'));
    if (!tileActive) throw new Error('order: tile-active class missing after pickup');
    console.log('order mode ARIA: PASS');
}

async function runCategorizeTests(page, port) {
    CURRENT_HTML = CAT_HTML;
    await loadPage(page, port);

    // Pure-function checks
    const correctPure = await page.evaluate(() =>
        window.checkDND(window.q, { t0: 'binA', t1: 'binB', t2: 'binA', t3: 'binB' })
    );
    if (!correctPure) throw new Error('categorize: pure check returned false for correct placements');

    const wrongPure = await page.evaluate(() =>
        window.checkDND(window.q, { t0: 'binB', t1: 'binA', t2: 'binA', t3: 'binB' })
    );
    if (wrongPure) throw new Error('categorize: pure check returned true for wrong placements');

    // Bins present
    const binCount = await page.$$eval('.dnd-bin', els => els.length);
    if (binCount !== 2) throw new Error('categorize: expected 2 bins, got ' + binCount);

    // Click t0 → click Even bin
    await clickByDataId(page, 't0');
    await page.click('.dnd-bin[data-bin="binA"]');
    await clickByDataId(page, 't1');
    await page.click('.dnd-bin[data-bin="binB"]');
    await clickByDataId(page, 't2');
    await page.click('.dnd-bin[data-bin="binA"]');
    await clickByDataId(page, 't3');
    await page.click('.dnd-bin[data-bin="binB"]');

    // Submit enabled?
    const submitEnabled = await page.$eval('.dnd-submit', el => !el.disabled);
    if (!submitEnabled) throw new Error('categorize: submit not enabled after placing all tiles');

    await page.click('.dnd-submit');
    const placements = await page.evaluate(() => window.__lastSubmit);
    if (!placements || placements.t0 !== 'binA' || placements.t1 !== 'binB' ||
        placements.t2 !== 'binA' || placements.t3 !== 'binB') {
        throw new Error('categorize: onDndSubmit got unexpected placements: ' + JSON.stringify(placements));
    }
    const correctFromHandler = await page.evaluate(() =>
        window.checkDND(window.q, window.__lastSubmit)
    );
    if (!correctFromHandler) throw new Error('categorize: round-trip check failed');
    console.log('categorize mode: PASS');

    // Wrong placements
    await loadPage(page, port);
    await clickByDataId(page, 't0');
    await page.click('.dnd-bin[data-bin="binB"]');  // wrong: 4 in Odd
    await clickByDataId(page, 't1');
    await page.click('.dnd-bin[data-bin="binA"]');  // wrong: 7 in Even
    await clickByDataId(page, 't2');
    await page.click('.dnd-bin[data-bin="binA"]');
    await clickByDataId(page, 't3');
    await page.click('.dnd-bin[data-bin="binB"]');
    await page.click('.dnd-submit');
    const wrongFromHandler = await page.evaluate(() =>
        window.checkDND(window.q, window.__lastSubmit)
    );
    if (wrongFromHandler) throw new Error('categorize: wrong placement scored as correct');
    console.log('categorize mode wrong-placement: PASS');

    // ARIA checks
    await loadPage(page, port);
    const hasAppRole = await page.$eval('.dnd-host', el => el.getAttribute('role') === 'application');
    if (!hasAppRole) throw new Error('categorize: host missing role=application');
    const hasLive = await page.$eval('.dnd-live', el => el.getAttribute('aria-live') === 'polite');
    if (!hasLive) throw new Error('categorize: missing aria-live region');
    console.log('categorize mode ARIA: PASS');
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

        await runOrderTests(page, port);
        await runCategorizeTests(page, port);

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
