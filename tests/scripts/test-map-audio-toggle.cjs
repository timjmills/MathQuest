// MAP audio toggle test:
//   1) #mapAudioToggle exists with position:fixed during a session
//   2) Click flips state.ttsEnabled and toggles audio-on/audio-off classes
//   3) finalizeMapSession removes the button and exits immersion
//   4) releaseMapSessionScaffold also removes the button
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-audio-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
let failed = false;

function log(...a) { console.log('[TEST]', ...a); }
function expect(cond, msg) {
    if (!cond) { console.log('  FAIL: ' + msg); failed = true; }
    else { console.log('  OK:   ' + msg); }
}

async function shot(page, name) {
    try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); }
    catch (e) { log('shot fail:', name, e.message); }
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

(async () => {
    let browser;
    let exitCode = 0;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        page.on('console', msg => {
            if (msg.type() === 'error' && !/Failed to load resource.*404/i.test(msg.text())) {
                consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
            }
        });
        page.on('pageerror', err => pageErrors.push(err.stack || String(err)));

        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
            10000, 'window.state ready');

        // ---------- Tier K-2 ----------
        log('\n========== K-2 audio toggle ==========');
        await page.evaluate(() => window.openMapTest('k2'));
        await waitFor(page,
            () => document.getElementById('mapSelectorView')?.classList.contains('active'),
            5000, 'mapSelectorView active');
        await waitFor(page,
            () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
            5000, 'chips rendered');
        await page.evaluate(() => {
            if (typeof window.setMapMode === 'function') window.setMapMode('practice');
            window.state.mapItemCountTarget = 5;
        });
        await page.evaluate(() => window.startMapFromUI());
        await waitFor(page,
            () => document.getElementById('mapSessionView')?.classList.contains('active'),
            5000, 'mapSessionView active');
        await waitFor(page,
            () => !!document.getElementById('mapAudioToggle'),
            5000, '#mapAudioToggle injected');

        await shot(page, '01-toggle-visible');

        // ---- 1. Button exists with fixed position ----
        const btnInfo = await page.evaluate(() => {
            const el = document.getElementById('mapAudioToggle');
            if (!el) return null;
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return {
                position: cs.position,
                zIndex: cs.zIndex,
                display: cs.display,
                top: r.top,
                right: window.innerWidth - r.right,
                text: el.textContent,
                hasOn: el.classList.contains('audio-on'),
                hasOff: el.classList.contains('audio-off'),
            };
        });
        log('  btnInfo:', JSON.stringify(btnInfo));
        expect(btnInfo !== null, 'mapAudioToggle exists in DOM');
        expect(btnInfo.position === 'fixed', `position is fixed (got ${btnInfo.position})`);
        expect(parseInt(btnInfo.zIndex, 10) >= 9999, `z-index >= 9999 (got ${btnInfo.zIndex})`);
        expect(btnInfo.display !== 'none', 'button is visible (display != none)');
        expect(btnInfo.top < 50, `button near top of viewport (got top=${btnInfo.top})`);
        expect(btnInfo.right < 50, `button near right edge (got right=${btnInfo.right})`);

        // ---- 2. Initial state matches state.ttsEnabled ----
        const initial = await page.evaluate(() => !!window.state.ttsEnabled);
        log('  initial ttsEnabled =', initial);
        if (initial) {
            expect(btnInfo.hasOn && !btnInfo.hasOff, 'audio-on class set when ttsEnabled=true');
        } else {
            expect(btnInfo.hasOff && !btnInfo.hasOn, 'audio-off class set when ttsEnabled=false');
        }

        // ---- 3. Click flips state ----
        await page.click('#mapAudioToggle');
        await new Promise(r => setTimeout(r, 200));
        const afterFirstClick = await page.evaluate(() => {
            const el = document.getElementById('mapAudioToggle');
            return {
                tts: !!window.state.ttsEnabled,
                hasOn: el.classList.contains('audio-on'),
                hasOff: el.classList.contains('audio-off'),
                text: el.textContent,
            };
        });
        log('  after 1st click:', JSON.stringify(afterFirstClick));
        expect(afterFirstClick.tts === !initial,
            `state.ttsEnabled flipped from ${initial} to ${afterFirstClick.tts}`);
        if (afterFirstClick.tts) {
            expect(afterFirstClick.hasOn && !afterFirstClick.hasOff,
                'audio-on class applied after toggle to ON');
            expect(/🔊/.test(afterFirstClick.text), 'label shows speaker icon when ON');
        } else {
            expect(afterFirstClick.hasOff && !afterFirstClick.hasOn,
                'audio-off class applied after toggle to OFF');
            expect(/🔇/.test(afterFirstClick.text), 'label shows muted icon when OFF');
        }

        await shot(page, '02-after-toggle');

        // ---- 4. Click again returns to original ----
        await page.click('#mapAudioToggle');
        await new Promise(r => setTimeout(r, 200));
        const afterSecondClick = await page.evaluate(() => !!window.state.ttsEnabled);
        expect(afterSecondClick === initial,
            `state.ttsEnabled toggled back to ${initial} (got ${afterSecondClick})`);

        // ---- 5. Cookie persisted ----
        // setCookie JSON.stringifies and URL-encodes, so the cookie value will
        // be e.g. %221%22 (encoded "1") or %220%22 (encoded "0"). Decode and
        // strip wrapping quotes before comparing.
        const cookieVal = await page.evaluate(() => {
            const m = document.cookie.match(/mathquest_tts=([^;]+)/);
            if (!m) return null;
            try { return decodeURIComponent(m[1]).replace(/^"|"$/g, ''); }
            catch (_) { return m[1]; }
        });
        log('  cookie mathquest_tts =', cookieVal);
        expect(cookieVal === '0' || cookieVal === '1',
            `cookie persisted as 0 or 1 (got ${cookieVal})`);

        // ---- 6. finalizeMapSession removes the button ----
        await page.evaluate(() => {
            window.state.mapItemCount = window.state.mapItemCountTarget;
            if (typeof window.finalizeMapSession === 'function') window.finalizeMapSession();
        });
        await waitFor(page,
            () => document.getElementById('mapResultsView')?.classList.contains('active'),
            5000, 'mapResultsView active');
        const removedAfterFinalize = await page.evaluate(() => !document.getElementById('mapAudioToggle'));
        expect(removedAfterFinalize, 'mapAudioToggle removed after finalizeMapSession');
        const immersionGoneAfterFinalize = await page.evaluate(
            () => !document.body.classList.contains('map-immersive'));
        expect(immersionGoneAfterFinalize, 'body.map-immersive removed after finalize');

        await shot(page, '03-after-finalize');

        // ---------- Test releaseMapSessionScaffold path ----------
        log('\n========== releaseMapSessionScaffold path ==========');
        await page.evaluate(() => { if (window.goHome) window.goHome(); });
        await new Promise(r => setTimeout(r, 300));
        await page.evaluate(() => window.openMapTest('35'));
        await waitFor(page,
            () => document.getElementById('mapSelectorView')?.classList.contains('active'),
            5000, 'mapSelectorView 3-5 active');
        await waitFor(page,
            () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
            5000, 'chips rendered');
        await page.evaluate(() => {
            if (typeof window.setMapMode === 'function') window.setMapMode('practice');
            window.state.mapItemCountTarget = 5;
        });
        await page.evaluate(() => window.startMapFromUI());
        await waitFor(page,
            () => document.getElementById('mapSessionView')?.classList.contains('active'),
            5000, 'mapSessionView active (35)');
        await waitFor(page,
            () => !!document.getElementById('mapAudioToggle'),
            5000, '#mapAudioToggle injected (35)');
        expect(await page.evaluate(() => !!document.getElementById('mapAudioToggle')),
            'toggle present in 3-5 session');

        // Trigger releaseMapSessionScaffold via goHome (the navigation path
        // that uses it for mid-session bail-outs).
        await page.evaluate(() => {
            if (typeof window.releaseMapSessionScaffold === 'function') {
                window.releaseMapSessionScaffold();
            }
        });
        await new Promise(r => setTimeout(r, 200));
        const removedAfterRelease = await page.evaluate(() => !document.getElementById('mapAudioToggle'));
        expect(removedAfterRelease, 'mapAudioToggle removed after releaseMapSessionScaffold');

        log('\n========== SUMMARY ==========');
        log(`console errors: ${consoleErrors.length}`);
        log(`page errors:    ${pageErrors.length}`);
        if (consoleErrors.length) consoleErrors.forEach(e => log(' err:', e));
        if (pageErrors.length) pageErrors.forEach(e => log(' page-err:', e));
        if (failed || consoleErrors.length || pageErrors.length) {
            log('OVERALL: FAIL');
            exitCode = 1;
        } else {
            log('OVERALL: PASS');
        }
    } catch (err) {
        log('!!! CRASH:', err.stack || err.message);
        exitCode = 2;
    } finally {
        if (browser) await browser.close();
        process.exit(exitCode);
    }
})();
