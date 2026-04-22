// Standalone test for number-line-extended widget.
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
  <div id="containerSingle"></div>
  <div id="containerCont"></div>
  <div id="containerMulti"></div>
  <div id="containerNeg"></div>
  <script type="module">
    import {
      renderNumberLineExtended,
      checkNumberLineExtended,
      setOnNumberLineSubmit
    } from "/js/modules/widgets/number-line-extended.js";

    // Single integer marker: place 5 on a 0-10 line snapping to whole numbers.
    const qSingle = {
      answerType: 'number-line-extended',
      text: 'Place 5 on the number line.',
      rangeMin: 0,
      rangeMax: 10,
      majorTickEvery: 1,
      minorSnap: 1,
      numberType: 'integer',
      ans: 5,
    };
    // Continuous tolerance test: place 3.5 with tolerance 0.05.
    const qCont = {
      answerType: 'number-line-extended',
      text: 'Drag the marker to 3.5.',
      rangeMin: 0,
      rangeMax: 10,
      majorTickEvery: 1,
      minorSnap: 0,        // continuous
      numberType: 'decimal',
      tolerance: 0.05,
      ans: 3.5,
    };
    // Multi-marker fractions: place 1/4, 2/4, 3/4 on a 0-1 line.
    const qMulti = {
      answerType: 'number-line-extended',
      text: 'Drag each fraction onto the number line.',
      rangeMin: 0,
      rangeMax: 1,
      majorTickEvery: 0.25,
      minorSnap: 0.25,
      numberType: 'fraction',
      ans: [
        { id: 'm0', value: 0.25, label: '1/4' },
        { id: 'm1', value: 0.5,  label: '2/4' },
        { id: 'm2', value: 0.75, label: '3/4' },
      ],
    };
    // Negative range: place -3 on a -10..10 line.
    const qNeg = {
      answerType: 'number-line-extended',
      text: 'Place -3 on the number line.',
      rangeMin: -10,
      rangeMax: 10,
      majorTickEvery: 1,
      minorSnap: 1,
      numberType: 'integer',
      ans: -3,
    };

    window.__lastSingle = null;
    window.__lastCont   = null;
    window.__lastMulti  = null;
    window.__lastNeg    = null;
    setOnNumberLineSubmit((qq, st) => {
      if (qq === qSingle) window.__lastSingle = st;
      else if (qq === qCont) window.__lastCont = st;
      else if (qq === qMulti) window.__lastMulti = st;
      else if (qq === qNeg) window.__lastNeg = st;
    });

    renderNumberLineExtended(qSingle, document.getElementById('containerSingle'));
    renderNumberLineExtended(qCont,   document.getElementById('containerCont'));
    renderNumberLineExtended(qMulti,  document.getElementById('containerMulti'));
    renderNumberLineExtended(qNeg,    document.getElementById('containerNeg'));

    window.qSingle = qSingle;
    window.qCont   = qCont;
    window.qMulti  = qMulti;
    window.qNeg    = qNeg;
    window.checkNLE = checkNumberLineExtended;
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

// Click on the SVG at a normalized x position (value in domain coords).
async function clickAtValue(page, containerSel, value, rangeMin, rangeMax) {
    const sel = `${containerSel} .nle-svg`;
    // Scroll the SVG into view first so coords land in the viewport.
    await page.$eval(sel, el => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await new Promise(r => setTimeout(r, 30));
    const box = await page.$eval(sel, (el, v, rmin, rmax) => {
        const rect = el.getBoundingClientRect();
        // Mirror the widget's viewBox x coords (PAD_X=30, SVG_W=600).
        const PAD_X = 30, SVG_W = 600;
        const t = (v - rmin) / (rmax - rmin);
        const vx = PAD_X + t * (SVG_W - 2 * PAD_X);
        // viewBox-x → screen-x via rect.width / 600.
        const scale = rect.width / SVG_W;
        return {
            x: rect.left + vx * scale,
            y: rect.top + rect.height / 2,
        };
    }, value, rangeMin, rangeMax);
    await page.mouse.click(box.x, box.y);
    await new Promise(r => setTimeout(r, 50));
}

(async () => {
    const server = await startServer();
    const port = server.address().port;
    const browser = await puppeteer.launch({ headless: 'new' });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 900, height: 1600 });
        page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); });
        page.on('console', (msg) => {
            if (msg.type() === 'error') console.error('console.error:', msg.text());
        });

        await page.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
        await page.waitForSelector('#containerSingle .nle-svg');

        // ===== Layout sanity =====
        // Major ticks for 0..10 step 1 → 11 major tick lines + 11 labels.
        const majorTicks = await page.$$eval('#containerSingle .nle-tick-major', els => els.length);
        if (majorTicks !== 11) throw new Error('Expected 11 major ticks, got ' + majorTicks);
        const tickLabels = await page.$$eval('#containerSingle .nle-tick-label', els => els.map(e => e.textContent.trim()));
        if (tickLabels.length !== 11 || tickLabels[0] !== '0' || tickLabels[10] !== '10') {
            throw new Error('Tick labels wrong: ' + JSON.stringify(tickLabels));
        }

        // ARIA: host has role=application
        const hostRole = await page.$eval('#containerSingle .nle-host', el => el.getAttribute('role'));
        if (hostRole !== 'application') throw new Error('Host role wrong: ' + hostRole);

        // ===== Single integer: click on tick at value 5, submit =====
        await clickAtValue(page, '#containerSingle', 5, 0, 10);
        // A marker should now exist
        const markerCount = await page.$$eval('#containerSingle .nle-marker', els => els.length);
        if (markerCount !== 1) throw new Error('Expected 1 marker after click, got ' + markerCount);

        // The marker should advertise aria-valuenow=5
        const ariaNow = await page.$eval('#containerSingle .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(ariaNow) !== 5) throw new Error('aria-valuenow wrong: ' + ariaNow);
        const ariaText = await page.$eval('#containerSingle .nle-marker', el => el.getAttribute('aria-valuetext'));
        if (ariaText !== '5') throw new Error('aria-valuetext wrong: ' + ariaText);

        // Slider role
        const sliderRole = await page.$eval('#containerSingle .nle-marker', el => el.getAttribute('role'));
        if (sliderRole !== 'slider') throw new Error('Marker role should be slider, got ' + sliderRole);

        // Click submit
        await page.click('#containerSingle .nle-submit');
        const submittedSingle = await page.evaluate(() => window.__lastSingle);
        if (submittedSingle !== 5) throw new Error('Single submit value: ' + submittedSingle);
        const correctSingle = await page.evaluate(() => window.checkNLE(window.qSingle, 5));
        if (!correctSingle) throw new Error('checkNLE(5 vs ans 5) should be true');
        const wrongSingle = await page.evaluate(() => window.checkNLE(window.qSingle, 7));
        if (wrongSingle) throw new Error('checkNLE(7 vs ans 5) should be false');

        // ===== Continuous w/ tolerance =====
        // Click near 3.48 on a continuous line — tolerance 0.05 should pass.
        await clickAtValue(page, '#containerCont', 3.48, 0, 10);
        await page.click('#containerCont .nle-submit');
        const submittedCont = await page.evaluate(() => window.__lastCont);
        if (typeof submittedCont !== 'number') throw new Error('Cont submit not a number: ' + submittedCont);
        if (Math.abs(submittedCont - 3.48) > 0.1) throw new Error('Cont submit not near 3.48: ' + submittedCont);
        // Direct scorer call using a value within tolerance
        const tolOk = await page.evaluate(() => window.checkNLE(window.qCont, 3.53));
        if (!tolOk) throw new Error('Tolerance check 3.53 vs ans 3.5 ±0.05 should pass');
        const tolBad = await page.evaluate(() => window.checkNLE(window.qCont, 3.7));
        if (tolBad) throw new Error('Tolerance check 3.7 vs ans 3.5 ±0.05 should fail');

        // ===== Multi-marker =====
        // Tray exists with 3 items
        const trayCount = await page.$$eval('#containerMulti .nle-tray-item', els => els.length);
        if (trayCount !== 3) throw new Error('Expected 3 tray items, got ' + trayCount);

        // Place each marker by selecting tray item then clicking on the line.
        // 1/4 → 0.25
        await page.click('#containerMulti .nle-tray-item[data-id="m0"]');
        await clickAtValue(page, '#containerMulti', 0.25, 0, 1);
        // 2/4 → 0.5
        await page.click('#containerMulti .nle-tray-item[data-id="m1"]');
        await clickAtValue(page, '#containerMulti', 0.5, 0, 1);
        // 3/4 → 0.75
        await page.click('#containerMulti .nle-tray-item[data-id="m2"]');
        await clickAtValue(page, '#containerMulti', 0.75, 0, 1);

        const markersOnLine = await page.$$eval('#containerMulti .nle-marker', els => els.length);
        if (markersOnLine !== 3) throw new Error('Expected 3 markers on multi line, got ' + markersOnLine);

        // Submit
        await page.click('#containerMulti .nle-submit');
        const submittedMulti = await page.evaluate(() => window.__lastMulti);
        if (!submittedMulti || typeof submittedMulti !== 'object') throw new Error('Multi submit not an object');
        if (Math.abs(submittedMulti.m0 - 0.25) > 0.001) throw new Error('m0 wrong: ' + submittedMulti.m0);
        if (Math.abs(submittedMulti.m1 - 0.5) > 0.001) throw new Error('m1 wrong: ' + submittedMulti.m1);
        if (Math.abs(submittedMulti.m2 - 0.75) > 0.001) throw new Error('m2 wrong: ' + submittedMulti.m2);

        const correctMulti = await page.evaluate(() => window.checkNLE(window.qMulti, { m0: 0.25, m1: 0.5, m2: 0.75 }));
        if (!correctMulti) throw new Error('Multi check should pass for exact placements');
        const wrongMulti = await page.evaluate(() => window.checkNLE(window.qMulti, { m0: 0.25, m1: 0.5, m2: 0.6 }));
        if (wrongMulti) throw new Error('Multi check should fail when one marker is off');

        // ===== Negative range + arrow keys =====
        // Click roughly at -3 first.
        await clickAtValue(page, '#containerNeg', -3, -10, 10);
        const placedNeg = await page.$eval('#containerNeg .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(placedNeg) !== -3) throw new Error('Neg placement should snap to -3, got ' + placedNeg);

        // Arrow-key nudge: focus the marker, press ArrowLeft → -4
        await page.$eval('#containerNeg .nle-marker', el => el.focus());
        await page.keyboard.press('ArrowLeft');
        await new Promise(r => setTimeout(r, 50));
        const afterLeft = await page.$eval('#containerNeg .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(afterLeft) !== -4) throw new Error('After ArrowLeft expected -4, got ' + afterLeft);

        // ArrowRight twice → -2
        await page.$eval('#containerNeg .nle-marker', el => el.focus());
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
        await page.$eval('#containerNeg .nle-marker', el => el.focus());
        await page.keyboard.press('ArrowRight');
        await new Promise(r => setTimeout(r, 30));
        const afterRight2 = await page.$eval('#containerNeg .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(afterRight2) !== -2) throw new Error('After ArrowRight×2 expected -2, got ' + afterRight2);

        // Home → -10
        await page.$eval('#containerNeg .nle-marker', el => el.focus());
        await page.keyboard.press('Home');
        await new Promise(r => setTimeout(r, 30));
        const atHome = await page.$eval('#containerNeg .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(atHome) !== -10) throw new Error('After Home expected -10, got ' + atHome);

        // End → 10
        await page.$eval('#containerNeg .nle-marker', el => el.focus());
        await page.keyboard.press('End');
        await new Promise(r => setTimeout(r, 30));
        const atEnd = await page.$eval('#containerNeg .nle-marker', el => el.getAttribute('aria-valuenow'));
        if (parseFloat(atEnd) !== 10) throw new Error('After End expected 10, got ' + atEnd);

        // Direct scorer checks for the negative case
        const negOk = await page.evaluate(() => window.checkNLE(window.qNeg, -3));
        if (!negOk) throw new Error('Neg checkNLE(-3 vs ans -3) should be true');
        const negBad = await page.evaluate(() => window.checkNLE(window.qNeg, -2));
        // tolerance defaults to minorSnap/2 = 0.5 → -2 vs -3 fails
        if (negBad) throw new Error('Neg checkNLE(-2 vs ans -3 tol 0.5) should be false');

        // Empty/missing values
        const nullChk = await page.evaluate(() => window.checkNLE(window.qSingle, null));
        if (nullChk) throw new Error('null state should not be correct');

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
