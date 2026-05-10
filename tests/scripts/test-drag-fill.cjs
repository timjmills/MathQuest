// Standalone test for drag-fill widget.
// Spins up a tiny HTTP server, loads the page in puppeteer, and exercises
// fraction layout (num+den), single-slot, click-and-click, and drag-and-drop.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = __dirname;

function buildHtml(qLiteral) {
    return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import { renderDragFill, checkDragFill, setOnDragFillSubmit }
      from "/js/modules/widgets/drag-fill.js";
    ${qLiteral}
    window.__lastSubmit = null;
    setOnDragFillSubmit((qq, st) => { window.__lastSubmit = st; });
    renderDragFill(q, document.getElementById('container'));
    window.q = q;
    window.checkDF = checkDragFill;
    window.__ready = true;
  </script>
</body></html>`;
}

const FRACTION_HTML = buildHtml(`
    const q = {
      answerType: 'drag-fill',
      text: 'Drag numbers to make 2/3 equivalent: ?/9',
      slots: [
        { id: 'num', label: 'numerator', acceptedValues: [6] },
        { id: 'den', label: 'denominator', acceptedValues: [9] },
      ],
      palette: ['2','3','4','5','6','7','8','9'],
      ans: { num: '6', den: '9' },
      layout: 'fraction',
      printFormat: 'drag-fill',
      skillLabel: 'Equivalent Fractions',
    };
`);

const SINGLE_SLOT_HTML = buildHtml(`
    const q = {
      answerType: 'drag-fill',
      text: 'Fill in the missing digit: 2_5 = two hundred forty-five',
      slots: [
        { id: 'tens', label: 'tens digit' },
      ],
      palette: ['1','2','3','4','5','6','7','8','9'],
      ans: { tens: '4' },
      layout: 'inline',
    };
`);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
};

let CURRENT_HTML = FRACTION_HTML;

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

async function loadPage(page, port) {
    await page.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
    await page.waitForSelector('.df-tile');
    await page.waitForSelector('.df-slot');
}

async function runFractionTests(page, port) {
    CURRENT_HTML = FRACTION_HTML;
    await loadPage(page, port);

    // Pure-function checks
    const correctPure = await page.evaluate(() =>
        window.checkDF(window.q, { num: '6', den: '9' })
    );
    if (!correctPure) throw new Error('fraction: pure check returned false for correct answer');
    const wrongPure = await page.evaluate(() =>
        window.checkDF(window.q, { num: '4', den: '9' })
    );
    if (wrongPure) throw new Error('fraction: pure check returned true for wrong answer');

    // Slot count
    const slotCount = await page.$$eval('.df-slot', els => els.length);
    if (slotCount !== 2) throw new Error('fraction: expected 2 slots, got ' + slotCount);

    // Palette tile count
    const tileCount = await page.$$eval('.df-tile', els => els.length);
    if (tileCount !== 8) throw new Error('fraction: expected 8 palette tiles, got ' + tileCount);

    // Click-and-click: tile "6" → slot "num"
    await page.click('.df-tile[data-value="6"]');
    // Tile should now be aria-pressed="true"
    const pressed = await page.$eval('.df-tile[data-value="6"]', el => el.getAttribute('aria-pressed'));
    if (pressed !== 'true') throw new Error('fraction: tile aria-pressed should be true after click');

    await page.click('.df-slot[data-slot-id="num"]');
    // Slot should now have data-value="6"
    const numVal = await page.$eval('.df-slot[data-slot-id="num"]', el => el.dataset.value);
    if (numVal !== '6') throw new Error('fraction: num slot value expected "6", got "' + numVal + '"');

    // After placement, the active selection should be cleared (tile aria-pressed back to false)
    const pressedAfter = await page.$eval('.df-tile[data-value="6"]', el => el.getAttribute('aria-pressed'));
    if (pressedAfter !== 'false') throw new Error('fraction: tile aria-pressed should be false after placement');

    // Tiles are RE-USABLE: tile 6 is still in the palette (not removed)
    const stillThere = await page.$('.df-tile[data-value="6"]');
    if (!stillThere) throw new Error('fraction: tile "6" should remain in palette (re-usable)');

    // Place 9 in den
    await page.click('.df-tile[data-value="9"]');
    await page.click('.df-slot[data-slot-id="den"]');

    // Submit should now be enabled
    const submitDisabled = await page.$eval('.df-submit', el => el.disabled);
    if (submitDisabled) throw new Error('fraction: submit should be enabled after both slots filled');

    // Click submit
    await page.click('.df-submit');
    const submitted = await page.evaluate(() => window.__lastSubmit);
    if (!submitted || submitted.num !== '6' || submitted.den !== '9') {
        throw new Error('fraction: onDragFillSubmit got unexpected state: ' + JSON.stringify(submitted));
    }
    const correctRoundTrip = await page.evaluate(() => window.checkDF(window.q, window.__lastSubmit));
    if (!correctRoundTrip) throw new Error('fraction: round-trip check failed');

    console.log('fraction layout (correct path): PASS');

    // ---- Wrong placement scoring ----
    await loadPage(page, port);
    await page.click('.df-tile[data-value="4"]');
    await page.click('.df-slot[data-slot-id="num"]');
    await page.click('.df-tile[data-value="9"]');
    await page.click('.df-slot[data-slot-id="den"]');
    await page.click('.df-submit');
    const wrongSt = await page.evaluate(() => window.__lastSubmit);
    if (wrongSt.num !== '4' || wrongSt.den !== '9') {
        throw new Error('fraction wrong: state mismatch: ' + JSON.stringify(wrongSt));
    }
    const wrongScored = await page.evaluate(() => window.checkDF(window.q, window.__lastSubmit));
    if (wrongScored) throw new Error('fraction wrong: incorrect placement scored as correct');
    console.log('fraction layout (wrong placement): PASS');

    // ---- Click-to-clear filled slot ----
    await loadPage(page, port);
    await page.click('.df-tile[data-value="6"]');
    await page.click('.df-slot[data-slot-id="num"]');
    let numAfterFill = await page.$eval('.df-slot[data-slot-id="num"]', el => el.dataset.value);
    if (numAfterFill !== '6') throw new Error('clear: slot should be filled before clear');
    // No active tile — clicking the filled slot should clear it
    await page.click('.df-slot[data-slot-id="num"]');
    const numAfterClear = await page.$eval('.df-slot[data-slot-id="num"]',
        el => el.dataset.value || '');
    if (numAfterClear !== '') throw new Error('clear: slot should be empty after click-clear, got "' + numAfterClear + '"');
    console.log('fraction layout (click-to-clear): PASS');

    // ---- ARIA ----
    await loadPage(page, port);
    const hasAppRole = await page.$eval('.df-host', el => el.getAttribute('role') === 'application');
    if (!hasAppRole) throw new Error('aria: host missing role=application');
    const hasLive = await page.$eval('.df-live', el => el.getAttribute('aria-live') === 'polite');
    if (!hasLive) throw new Error('aria: missing aria-live region');
    const slotRole = await page.$eval('.df-slot[data-slot-id="num"]', el => el.getAttribute('role'));
    if (slotRole !== 'textbox') throw new Error('aria: slot role should be textbox, got ' + slotRole);
    const slotLabel = await page.$eval('.df-slot[data-slot-id="num"]', el => el.getAttribute('aria-label'));
    if (!slotLabel || slotLabel.indexOf('numerator') === -1) {
        throw new Error('aria: slot aria-label missing slot label, got "' + slotLabel + '"');
    }
    const tileRole = await page.$eval('.df-tile[data-value="6"]', el => el.getAttribute('role'));
    if (tileRole !== 'button') throw new Error('aria: tile role should be button, got ' + tileRole);
    const tileLabel = await page.$eval('.df-tile[data-value="6"]', el => el.getAttribute('aria-label'));
    if (tileLabel !== 'Number 6') throw new Error('aria: tile aria-label expected "Number 6", got "' + tileLabel + '"');
    console.log('fraction layout ARIA: PASS');
}

async function runSingleSlotTests(page, port) {
    CURRENT_HTML = SINGLE_SLOT_HTML;
    await loadPage(page, port);

    // Pure check
    const correctPure = await page.evaluate(() => window.checkDF(window.q, { tens: '4' }));
    if (!correctPure) throw new Error('single: pure check returned false for correct answer');
    const wrongPure = await page.evaluate(() => window.checkDF(window.q, { tens: '7' }));
    if (wrongPure) throw new Error('single: pure check returned true for wrong answer');

    const slotCount = await page.$$eval('.df-slot', els => els.length);
    if (slotCount !== 1) throw new Error('single: expected 1 slot, got ' + slotCount);

    // Submit disabled before fill
    const disabledBefore = await page.$eval('.df-submit', el => el.disabled);
    if (!disabledBefore) throw new Error('single: submit should start disabled');

    // Click-and-click
    await page.click('.df-tile[data-value="4"]');
    await page.click('.df-slot[data-slot-id="tens"]');
    const submitDisabled = await page.$eval('.df-submit', el => el.disabled);
    if (submitDisabled) throw new Error('single: submit should be enabled after fill');
    await page.click('.df-submit');
    const submitted = await page.evaluate(() => window.__lastSubmit);
    if (!submitted || submitted.tens !== '4') {
        throw new Error('single: submitted state mismatch: ' + JSON.stringify(submitted));
    }
    const ok = await page.evaluate(() => window.checkDF(window.q, window.__lastSubmit));
    if (!ok) throw new Error('single: round-trip check failed');
    console.log('single-slot mode: PASS');

    // Re-usable tile: fresh load, place tile twice across two attempts (clear then re-fill)
    await loadPage(page, port);
    // First fill
    await page.click('.df-tile[data-value="3"]');
    await page.click('.df-slot[data-slot-id="tens"]');
    let v = await page.$eval('.df-slot[data-slot-id="tens"]', el => el.dataset.value);
    if (v !== '3') throw new Error('reuse: first fill failed, got ' + v);
    // Clear by clicking the filled slot
    await page.click('.df-slot[data-slot-id="tens"]');
    v = await page.$eval('.df-slot[data-slot-id="tens"]', el => el.dataset.value || '');
    if (v !== '') throw new Error('reuse: clear failed, got "' + v + '"');
    // Re-use the same tile (it should still be in the palette)
    await page.click('.df-tile[data-value="3"]');
    await page.click('.df-slot[data-slot-id="tens"]');
    v = await page.$eval('.df-slot[data-slot-id="tens"]', el => el.dataset.value);
    if (v !== '3') throw new Error('reuse: second fill failed, got ' + v);
    console.log('single-slot tile re-use: PASS');
}

async function runDragDropTest(page, port) {
    // Synthesise a native drop via dataTransfer-like dispatching. Puppeteer's
    // built-in drag is limited in headless mode, so we fire the events manually.
    CURRENT_HTML = FRACTION_HTML;
    await loadPage(page, port);

    const dropResult = await page.evaluate(() => {
        function fire(el, type, dt) {
            const ev = new DragEvent(type, {
                bubbles: true, cancelable: true, dataTransfer: dt,
            });
            el.dispatchEvent(ev);
        }
        // Build a minimal DataTransfer-like via the real one
        const dt = new DataTransfer();
        const tile = document.querySelector('.df-tile[data-value="6"]');
        const numSlot = document.querySelector('.df-slot[data-slot-id="num"]');
        const denSlot = document.querySelector('.df-slot[data-slot-id="den"]');
        fire(tile, 'dragstart', dt);
        fire(numSlot, 'dragover', dt);
        fire(numSlot, 'drop', dt);
        fire(tile, 'dragend', dt);
        // Drop tile "9" into denominator
        const dt2 = new DataTransfer();
        const tile9 = document.querySelector('.df-tile[data-value="9"]');
        fire(tile9, 'dragstart', dt2);
        fire(denSlot, 'dragover', dt2);
        fire(denSlot, 'drop', dt2);
        fire(tile9, 'dragend', dt2);
        return {
            num: numSlot.dataset.value || '',
            den: denSlot.dataset.value || '',
        };
    });
    if (dropResult.num !== '6' || dropResult.den !== '9') {
        throw new Error('drag-drop: synthetic drop did not fill slots: ' + JSON.stringify(dropResult));
    }
    console.log('native drag-drop (synthetic events): PASS');
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

        await runFractionTests(page, port);
        await runSingleSlotTests(page, port);
        await runDragDropTest(page, port);

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
