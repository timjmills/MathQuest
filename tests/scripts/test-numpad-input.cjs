// Standalone test for numpad-input widget.
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
  <div id="containerInt"></div>
  <div id="containerFrac"></div>
  <div id="containerNeg"></div>
  <div id="containerForms"></div>
  <script type="module">
    import { renderNumpadInput, checkNumpadInput, setOnNumpadSubmit }
      from "/js/modules/widgets/numpad-input.js";

    // Integer answer
    const qInt = {
      answerType: 'numpad-input',
      text: 'How many apples are there?',
      ans: 7,
      unit: 'apples',
    };
    // Fraction answer (decimal-equivalent)
    const qFrac = {
      answerType: 'numpad-input',
      text: 'What fraction of the bar is shaded?',
      ans: 0.5,
    };
    // Negative number answer
    const qNeg = {
      answerType: 'numpad-input',
      text: 'What is -8 + 5?',
      ans: -3,
    };
    // Accepted-forms variant (e.g., trailing zero)
    const qForms = {
      answerType: 'numpad-input',
      text: 'Type seven',
      ans: 7,
      acceptedForms: ['7', '07'],
    };

    window.__lastSubmitInt = null;
    window.__lastSubmitFrac = null;
    window.__lastSubmitNeg = null;
    window.__lastSubmitForms = null;

    setOnNumpadSubmit((qq, value) => {
      if (qq === qInt) window.__lastSubmitInt = value;
      else if (qq === qFrac) window.__lastSubmitFrac = value;
      else if (qq === qNeg) window.__lastSubmitNeg = value;
      else if (qq === qForms) window.__lastSubmitForms = value;
    });

    renderNumpadInput(qInt, document.getElementById('containerInt'));
    renderNumpadInput(qFrac, document.getElementById('containerFrac'));
    renderNumpadInput(qNeg, document.getElementById('containerNeg'));
    renderNumpadInput(qForms, document.getElementById('containerForms'));

    window.qInt = qInt;
    window.qFrac = qFrac;
    window.qNeg = qNeg;
    window.qForms = qForms;
    window.checkNP = checkNumpadInput;
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

async function clickKey(page, container, key) {
    const sel = `${container} .np-btn[data-key="${key}"]`;
    await page.click(sel);
    await new Promise(r => setTimeout(r, 30));
}

async function getInputValue(page, container) {
    return await page.$eval(`${container} .np-input`, el => el.value);
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
        await page.waitForSelector('#containerInt .np-pad');

        // ===== Layout sanity =====
        const btnCount = await page.$$eval('#containerInt .np-btn', els => els.length);
        if (btnCount !== 16) throw new Error('Expected 16 numpad buttons, got ' + btnCount);

        // Display has the unit
        const unitText = await page.$eval('#containerInt .np-unit', el => el.textContent);
        if (!/apples/.test(unitText)) throw new Error('Unit not rendered: ' + unitText);

        // Input has aria-label from q.text
        const ariaLabel = await page.$eval('#containerInt .np-input', el => el.getAttribute('aria-label'));
        if (!/apples/.test(ariaLabel)) throw new Error('Input aria-label wrong: ' + ariaLabel);

        // ARIA on a few buttons
        const aria7 = await page.$eval('#containerInt .np-btn[data-key="7"]', el => el.getAttribute('aria-label'));
        if (aria7 !== 'digit 7') throw new Error('Aria for 7 wrong: ' + aria7);
        const ariaBack = await page.$eval('#containerInt .np-btn[data-key="back"]', el => el.getAttribute('aria-label'));
        if (ariaBack !== 'backspace') throw new Error('Aria for backspace wrong: ' + ariaBack);

        // ===== Integer test: click 7, submit -> correct =====
        await clickKey(page, '#containerInt', '7');
        let v = await getInputValue(page, '#containerInt');
        if (v !== '7') throw new Error('After click 7, value should be "7", got "' + v + '"');

        await clickKey(page, '#containerInt', 'submit');
        const submittedInt = await page.evaluate(() => window.__lastSubmitInt);
        if (submittedInt !== '7') throw new Error('Int submit value: ' + submittedInt);
        const correctInt = await page.evaluate(() => window.checkNP(window.qInt, '7'));
        if (!correctInt) throw new Error('checkNumpadInput(7 vs ans 7) should be true');

        // After submit, buttons should be locked
        const submitDisabled = await page.$eval('#containerInt .np-btn[data-key="submit"]', el => el.disabled);
        if (!submitDisabled) throw new Error('Submit should be locked after first submit');

        // Wrong answer check
        const wrongInt = await page.evaluate(() => window.checkNP(window.qInt, '12'));
        if (wrongInt) throw new Error('checkNumpadInput(12 vs ans 7) should be false');

        // ===== Backspace test: build "1", "0", backspace -> "1", value should not match 7 =====
        // (Fresh container — use containerForms which is unlocked.)
        await clickKey(page, '#containerForms', '1');
        await clickKey(page, '#containerForms', '0');
        v = await getInputValue(page, '#containerForms');
        if (v !== '10') throw new Error('After 1,0 should be "10", got: ' + v);

        await clickKey(page, '#containerForms', 'back');
        v = await getInputValue(page, '#containerForms');
        if (v !== '1') throw new Error('After backspace should be "1", got: ' + v);

        const wrong1 = await page.evaluate(() => window.checkNP(window.qForms, '1'));
        if (wrong1) throw new Error('checkNumpadInput(1 vs ans 7) should be false');

        // acceptedForms: '07' should match
        const correct07 = await page.evaluate(() => window.checkNP(window.qForms, '07'));
        if (!correct07) throw new Error('acceptedForms "07" should match ans 7');

        // ===== Clear test =====
        // Add more digits then clear
        await clickKey(page, '#containerForms', '2');
        await clickKey(page, '#containerForms', '3');
        v = await getInputValue(page, '#containerForms');
        if (v !== '123') throw new Error('After 1+back+2+3 should be "123", got: ' + v);

        await clickKey(page, '#containerForms', 'clear');
        v = await getInputValue(page, '#containerForms');
        if (v !== '') throw new Error('After clear, input should be empty, got: ' + v);

        // ===== Fraction test: 1/2 vs ans 0.5 =====
        await clickKey(page, '#containerFrac', '1');
        await clickKey(page, '#containerFrac', '/');
        await clickKey(page, '#containerFrac', '2');
        v = await getInputValue(page, '#containerFrac');
        if (v !== '1/2') throw new Error('After 1,/,2 should be "1/2", got: ' + v);

        const correctFrac = await page.evaluate(() => window.checkNP(window.qFrac, '1/2'));
        if (!correctFrac) throw new Error('checkNumpadInput(1/2 vs ans 0.5) should be true');

        // Decimal form should also pass
        const correctDec = await page.evaluate(() => window.checkNP(window.qFrac, '0.5'));
        if (!correctDec) throw new Error('checkNumpadInput(0.5 vs ans 0.5) should be true');
        const correctDec2 = await page.evaluate(() => window.checkNP(window.qFrac, '.5'));
        if (!correctDec2) throw new Error('checkNumpadInput(.5 vs ans 0.5) should be true');

        // Equivalent fraction "2/4" should also pass
        const correctEquiv = await page.evaluate(() => window.checkNP(window.qFrac, '2/4'));
        if (!correctEquiv) throw new Error('checkNumpadInput(2/4 vs ans 0.5) should be true');

        await clickKey(page, '#containerFrac', 'submit');
        const submittedFrac = await page.evaluate(() => window.__lastSubmitFrac);
        if (submittedFrac !== '1/2') throw new Error('Frac submit value: ' + submittedFrac);

        // Slash should be no-op when one already exists
        // (Fresh test on a brand-new value via containerInt — but it's locked.
        // We can verify the slash-no-op behavior via checkNP-only path: no DOM
        // needed, but let's be thorough by not breaking existing assertions.)

        // ===== Negative test: minus + 3 vs ans -3 =====
        await clickKey(page, '#containerNeg', '3');
        await clickKey(page, '#containerNeg', '-');
        v = await getInputValue(page, '#containerNeg');
        if (v !== '-3') throw new Error('After 3,- should toggle to "-3", got: ' + v);

        await clickKey(page, '#containerNeg', 'submit');
        const submittedNeg = await page.evaluate(() => window.__lastSubmitNeg);
        if (submittedNeg !== '-3') throw new Error('Neg submit value: ' + submittedNeg);
        const correctNeg = await page.evaluate(() => window.checkNP(window.qNeg, '-3'));
        if (!correctNeg) throw new Error('checkNumpadInput(-3 vs ans -3) should be true');
        const wrongNeg = await page.evaluate(() => window.checkNP(window.qNeg, '3'));
        if (wrongNeg) throw new Error('checkNumpadInput(3 vs ans -3) should be false');

        // Empty / partial inputs return false
        const emptyChk = await page.evaluate(() => window.checkNP(window.qInt, ''));
        if (emptyChk) throw new Error('Empty value should not be correct');
        const dashChk = await page.evaluate(() => window.checkNP(window.qInt, '-'));
        if (dashChk) throw new Error('Bare "-" should not be correct');

        // Tolerance test (numeric with tolerance)
        const tolOk = await page.evaluate(() => window.checkNP({ ans: 3.14, tolerance: 0.05 }, '3.13'));
        if (!tolOk) throw new Error('checkNumpadInput with tolerance 0.05 should accept 3.13 vs 3.14');
        const tolBad = await page.evaluate(() => window.checkNP({ ans: 3.14, tolerance: 0.01 }, '3.20'));
        if (tolBad) throw new Error('checkNumpadInput with tolerance 0.01 should reject 3.20 vs 3.14');

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
