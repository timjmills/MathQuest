// Standalone test for clock-set widget.
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
  <div id="containerA"></div>
  <div id="containerB"></div>
  <div id="containerC"></div>
  <script type="module">
    import {
      renderClockSet,
      checkClockSet,
      setOnClockSetSubmit
    } from "/js/modules/widgets/clock-set.js";

    // Default snap=5: target 3:30
    const qA = {
      answerType: 'clock-set',
      text: 'Set the clock to 3:30.',
      ans: { hour: 3, minute: 30 },
      initialHour: 12,        // displayed as 12 → stored as 0
      initialMinute: 0,
      minuteSnap: 5,
      showDigital: true,
    };
    // Snap=15, target 9:45
    const qB = {
      answerType: 'clock-set',
      text: 'Set the clock to 9:45.',
      ans: { hour: 9, minute: 45 },
      initialHour: 12,
      initialMinute: 0,
      minuteSnap: 15,
    };
    // Snap=1, target 7:23
    const qC = {
      answerType: 'clock-set',
      text: 'Set the clock to 7:23.',
      ans: { hour: 7, minute: 23 },
      initialHour: 7,
      initialMinute: 0,
      minuteSnap: 1,
    };

    window.__lastA = null;
    window.__lastB = null;
    window.__lastC = null;
    setOnClockSetSubmit((qq, st) => {
      if (qq === qA) window.__lastA = st;
      else if (qq === qB) window.__lastB = st;
      else if (qq === qC) window.__lastC = st;
    });

    renderClockSet(qA, document.getElementById('containerA'));
    renderClockSet(qB, document.getElementById('containerB'));
    renderClockSet(qC, document.getElementById('containerC'));

    window.qA = qA;
    window.qB = qB;
    window.qC = qC;
    window.checkCS = checkClockSet;
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
        await page.setViewport({ width: 900, height: 1600 });
        page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); });
        page.on('console', (msg) => {
            if (msg.type() === 'error') console.error('console.error:', msg.text());
        });

        await page.goto(`http://127.0.0.1:${port}/test.html`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.__ready === true, { timeout: 5000 });
        await page.waitForSelector('#containerA .cs-clock');

        // ===== Layout sanity =====
        // 12 numerals.
        const numCount = await page.$$eval('#containerA .cs-numeral', els => els.length);
        if (numCount !== 12) throw new Error('Expected 12 numerals, got ' + numCount);

        // 60 minute ticks (12 major + 48 minor).
        const tickCount = await page.$$eval('#containerA .cs-tick', els => els.length);
        if (tickCount !== 60) throw new Error('Expected 60 ticks, got ' + tickCount);
        const majorCount = await page.$$eval('#containerA .cs-tick-major', els => els.length);
        if (majorCount !== 12) throw new Error('Expected 12 major ticks, got ' + majorCount);

        // ARIA: host has role=application
        const hostRole = await page.$eval('#containerA .cs-host', el => el.getAttribute('role'));
        if (hostRole !== 'application') throw new Error('Host role wrong: ' + hostRole);

        // Hour and minute hands present, both with role=slider and proper aria-valuemin/max
        const hourRole = await page.$eval('#containerA .cs-hour', el => el.getAttribute('role'));
        const minRole = await page.$eval('#containerA .cs-minute', el => el.getAttribute('role'));
        if (hourRole !== 'slider') throw new Error('Hour hand role should be slider, got ' + hourRole);
        if (minRole !== 'slider') throw new Error('Minute hand role should be slider, got ' + minRole);

        const hourMax = await page.$eval('#containerA .cs-hour', el => el.getAttribute('aria-valuemax'));
        if (hourMax !== '11') throw new Error('Hour aria-valuemax should be 11, got ' + hourMax);
        const minMax = await page.$eval('#containerA .cs-minute', el => el.getAttribute('aria-valuemax'));
        if (minMax !== '59') throw new Error('Minute aria-valuemax should be 59, got ' + minMax);

        // Initial digital readout shows 12:00
        const initDigital = await page.$eval('#containerA .cs-digital', el => el.textContent.trim());
        if (initDigital !== '12:00') throw new Error('Initial digital should be 12:00, got ' + initDigital);

        // ===== qA: click + on hour 3 times → hour shows 3 =====
        for (let i = 0; i < 3; i++) {
            await page.click('#containerA [data-act="hour-up"]');
            await new Promise(r => setTimeout(r, 30));
        }
        const hourReadoutA = await page.$eval('#containerA [data-role="hour-readout"]', el => el.textContent.trim());
        if (hourReadoutA !== '3') throw new Error('After +hour×3 readout should be 3, got ' + hourReadoutA);
        const hourValnow = await page.$eval('#containerA .cs-hour', el => el.getAttribute('aria-valuenow'));
        if (hourValnow !== '3') throw new Error('Hour aria-valuenow should be 3, got ' + hourValnow);
        const hourValtext = await page.$eval('#containerA .cs-hour', el => el.getAttribute('aria-valuetext'));
        if (!/3 o.clock/.test(hourValtext)) throw new Error('Hour aria-valuetext wrong: ' + hourValtext);

        // ===== qA: click + on minute 6 times (snap=5) → minute shows 30 =====
        for (let i = 0; i < 6; i++) {
            await page.click('#containerA [data-act="min-up"]');
            await new Promise(r => setTimeout(r, 30));
        }
        const minReadoutA = await page.$eval('#containerA [data-role="minute-readout"]', el => el.textContent.trim());
        if (minReadoutA !== '30') throw new Error('After +min×6 (snap=5) readout should be 30, got ' + minReadoutA);
        const minValnow = await page.$eval('#containerA .cs-minute', el => el.getAttribute('aria-valuenow'));
        if (minValnow !== '30') throw new Error('Minute aria-valuenow should be 30, got ' + minValnow);

        // Digital readout should now show 3:30
        const dispA = await page.$eval('#containerA .cs-digital', el => el.textContent.trim());
        if (dispA !== '3:30') throw new Error('Digital should be 3:30, got ' + dispA);

        // ===== qA: submit → check correctness =====
        await page.click('#containerA .cs-submit');
        const submittedA = await page.evaluate(() => window.__lastA);
        if (!submittedA || submittedA.hour !== 3 || submittedA.minute !== 30) {
            throw new Error('qA submit: ' + JSON.stringify(submittedA));
        }
        const okA = await page.evaluate(() => window.checkCS(window.qA, { hour: 3, minute: 30 }));
        if (!okA) throw new Error('checkClockSet should return true for {3, 30} on qA');
        const wrongA = await page.evaluate(() => window.checkCS(window.qA, { hour: 3, minute: 25 }));
        if (wrongA) throw new Error('checkClockSet should return false for {3, 25} on qA');

        // Submit lock test: button should be disabled.
        const submitDisabled = await page.$eval('#containerA .cs-submit', el => el.disabled);
        if (!submitDisabled) throw new Error('Submit should be disabled after click');

        // Hands should have pointerEvents=none after lock.
        const hourPE = await page.$eval('#containerA .cs-hour', el => el.style.pointerEvents);
        if (hourPE !== 'none') throw new Error('Hour hand pointer-events should be none after lock');

        // ===== qB: snap=15. Click +min 3 times → 45. Click +hour 9 times → 9. =====
        for (let i = 0; i < 3; i++) {
            await page.click('#containerB [data-act="min-up"]');
            await new Promise(r => setTimeout(r, 20));
        }
        const minB = await page.$eval('#containerB [data-role="minute-readout"]', el => el.textContent.trim());
        if (minB !== '45') throw new Error('qB: snap=15 +min×3 should be 45, got ' + minB);

        for (let i = 0; i < 9; i++) {
            await page.click('#containerB [data-act="hour-up"]');
            await new Promise(r => setTimeout(r, 20));
        }
        const hourB = await page.$eval('#containerB [data-role="hour-readout"]', el => el.textContent.trim());
        if (hourB !== '9') throw new Error('qB: +hour×9 from 12 should be 9, got ' + hourB);

        await page.click('#containerB .cs-submit');
        const submittedB = await page.evaluate(() => window.__lastB);
        if (!submittedB || submittedB.hour !== 9 || submittedB.minute !== 45) {
            throw new Error('qB submit: ' + JSON.stringify(submittedB));
        }

        // ===== qC: snap=1, arrow keys =====
        // Initial hour=7, minute=0. ArrowUp on minute hand 23 times → 23.
        await page.$eval('#containerC .cs-minute', el => el.focus());
        for (let i = 0; i < 23; i++) {
            await page.keyboard.press('ArrowUp');
            await new Promise(r => setTimeout(r, 8));
        }
        const minC = await page.$eval('#containerC [data-role="minute-readout"]', el => el.textContent.trim());
        if (minC !== '23') throw new Error('qC: 23 ArrowUp on minute should give 23, got ' + minC);

        // ArrowDown twice → 21
        await page.$eval('#containerC .cs-minute', el => el.focus());
        await page.keyboard.press('ArrowDown');
        await new Promise(r => setTimeout(r, 20));
        await page.$eval('#containerC .cs-minute', el => el.focus());
        await page.keyboard.press('ArrowDown');
        await new Promise(r => setTimeout(r, 20));
        const minC2 = await page.$eval('#containerC [data-role="minute-readout"]', el => el.textContent.trim());
        if (minC2 !== '21') throw new Error('qC: ArrowDown×2 should give 21, got ' + minC2);

        // Wrap-around: -hour from 0 should go to 11.
        // (qC starts at hour 7; - 7 times → 0; - once → 11)
        await page.$eval('#containerC .cs-hour', el => el.focus());
        for (let i = 0; i < 7; i++) {
            await page.keyboard.press('ArrowDown');
            await new Promise(r => setTimeout(r, 8));
        }
        const hourC0 = await page.$eval('#containerC [data-role="hour-readout"]', el => el.textContent.trim());
        // Display: 0 → '12'
        if (hourC0 !== '12') throw new Error('qC: 7 ArrowDown should give display 12 (hour 0), got ' + hourC0);
        await page.$eval('#containerC .cs-hour', el => el.focus());
        await page.keyboard.press('ArrowDown');
        await new Promise(r => setTimeout(r, 20));
        const hourC1 = await page.$eval('#containerC [data-role="hour-readout"]', el => el.textContent.trim());
        if (hourC1 !== '11') throw new Error('qC: ArrowDown wrap should give 11, got ' + hourC1);

        // ===== Direct scorer checks =====
        const okC = await page.evaluate(() => window.checkCS(window.qC, { hour: 7, minute: 23 }));
        if (!okC) throw new Error('checkClockSet should return true for {7, 23} on qC');
        const wrongC = await page.evaluate(() => window.checkCS(window.qC, { hour: 7, minute: 22 }));
        if (wrongC) throw new Error('checkClockSet should return false for {7, 22} on qC');

        // Null/undefined safety
        const nullChk = await page.evaluate(() => window.checkCS(window.qA, null));
        if (nullChk) throw new Error('null state should not be correct');

        // Hand position check: at 3:30, hour-hand x2/y2 should NOT point straight at "3" (90 deg)
        // because the minute is 30 → hour hand has rotated halfway between 3 and 4.
        // At hour 3, minute 30: hour angle = 3*30 + 0.5*30 = 105 deg.
        // Just verify the hand attributes have reasonable values (not at default).
        // (qA is locked; check qB which is also locked at 9:45.)
        // At 9:45 hour angle = 9*30 + 0.75*30 = 292.5 deg.
        const hourX2_B = await page.$eval('#containerB .cs-hour', el => parseFloat(el.getAttribute('x2')));
        const hourY2_B = await page.$eval('#containerB .cs-hour', el => parseFloat(el.getAttribute('y2')));
        // Center is 120,120; hour hand length 55. At 292.5 deg from north (CW),
        // x = 120 + 55*sin(292.5°) = 120 + 55*-0.9239 = ~69.2
        // y = 120 - 55*cos(292.5°) = 120 - 55*0.3827 = ~98.95
        if (Math.abs(hourX2_B - 69.2) > 2 || Math.abs(hourY2_B - 99.0) > 2) {
            throw new Error(`Hour hand position at 9:45 wrong: x2=${hourX2_B}, y2=${hourY2_B}`);
        }

        console.log('Widget tests pass');
    } finally {
        await browser.close();
        server.close();
    }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
