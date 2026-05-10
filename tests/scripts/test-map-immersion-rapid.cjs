// MAP UX overhaul test:
//   1) immersion mode hides nav-bar / studentBanner / floatingTimer when
//      mapSessionView is active and restores them after finalize/exit.
//   2) rapid-guess detection triggers an overlay banner after 3 consecutive
//      answers submitted in <3s each (MAP Practice only).
//   3) results screen shows total session duration as M:SS.
//
// Runs against http://localhost:8080/index.html (the same dev server used by
// test-map-smoke.cjs).
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-immersion-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...a) { console.log('[TEST]', ...a); }

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

let failed = false;
function expect(cond, msg) {
    if (!cond) { console.log('  FAIL: ' + msg); failed = true; }
    else { console.log('  OK:   ' + msg); }
}

async function bodyHasClass(page, cls) {
    return page.evaluate(c => document.body.classList.contains(c), cls);
}

async function isHidden(page, sel) {
    return page.evaluate(s => {
        const el = document.querySelector(s);
        if (!el) return null; // not in DOM (still acceptable as hidden)
        const cs = getComputedStyle(el);
        return cs.display === 'none' || cs.visibility === 'hidden';
    }, sel);
}

async function runTier(page, tier, label) {
    log(`\n========== ${label} immersion + rapid-guess ==========`);
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 300));

    // Open MAP Practice mode
    await page.evaluate(t => window.openMapTest(t), tier);
    await waitFor(page,
        () => document.getElementById('mapSelectorView')?.classList.contains('active'),
        5000, 'mapSelectorView active');
    await waitFor(page,
        () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
        5000, 'chips rendered');

    // Pin to practice mode + small item count
    await page.evaluate(() => {
        if (typeof window.setMapMode === 'function') window.setMapMode('practice');
        window.state.mapItemCountTarget = 5;
    });

    await page.evaluate(() => window.startMapFromUI());
    await waitFor(page,
        () => document.getElementById('mapSessionView')?.classList.contains('active'),
        5000, 'mapSessionView active');
    await waitFor(page,
        () => document.getElementById('questionText')?.textContent?.trim().length > 0,
        5000, 'first question rendered');

    await shot(page, `01-immersion-${tier}`);

    // ---- 1. Immersion checks ----
    expect(await bodyHasClass(page, 'map-immersive'),
        `${label}: body.map-immersive class is set during session`);
    const navHidden = await isHidden(page, '.nav-bar');
    expect(navHidden === true,
        `${label}: top nav-bar is display:none in immersive mode (got ${navHidden})`);
    const stsHidden = await isHidden(page, '#studentBanner');
    expect(stsHidden === true || stsHidden === null,
        `${label}: studentBanner hidden or not in DOM (got ${stsHidden})`);
    const gsbHidden = await isHidden(page, '#gameStatsBanner');
    expect(gsbHidden === true || gsbHidden === null,
        `${label}: gameStatsBanner hidden or not in DOM (got ${gsbHidden})`);
    const ftHidden = await isHidden(page, '#floatingTimer');
    expect(ftHidden === true || ftHidden === null,
        `${label}: floatingTimer hidden or not in DOM (got ${ftHidden})`);

    // map-session-banner should remain visible
    const banner = await page.evaluate(() => {
        const el = document.querySelector('#mapSessionView .map-session-banner');
        if (!el) return null;
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    expect(banner === true,
        `${label}: map-session-banner remains visible during immersion`);

    // ---- 3. Verify mapSessionMode === 'practice' so rapid-guess applies
    const mode = await page.evaluate(() => window.state.mapSessionMode);
    log(`  session mode = ${mode}`);
    expect(mode === 'practice', `${label}: session mode is 'practice'`);

    // ---- 2. Rapid-guess: simulate UI-style fast answers ----
    // First item is exempt from the gate (no prior to compare against), so we
    // need 4 clicks total: click 1 = item 0 (exempt), clicks 2-4 = three
    // consecutive rapid responses that should hit the streak threshold.
    log('  --- simulating 4 rapid answers (1 exempt + 3 streak) ---');
    let bannerSeen = false;
    // Bump up the target so we don't end the session before the 4th click
    await page.evaluate(() => { window.state.mapItemCountTarget = 10; });
    for (let i = 0; i < 4; i++) {
        const itemBefore = await page.evaluate(() => window.state.mapItemCount);
        // Force render time = now so this click counts as <3s, AND set the
        // synthetic "last user click" stamp so the engine treats this as a
        // real student click (not a programmatic test bypass).
        await page.evaluate(() => {
            window.state.lastQuestionRenderTime = Date.now();
            window.state._lastUserClickTime = Date.now();
        });
        log(`    click ${i + 1}: itemCount=${itemBefore}, streak=${await page.evaluate(() => window.state.rapidGuessStreak)}`);
        await page.evaluate(() => window.recordMapAnswer({ correct: true }));
        await new Promise(r => setTimeout(r, 200));
        if (i === 3) {
            const ov = await page.$('#rapidGuessOverlay');
            if (ov) { bannerSeen = true; await shot(page, `02-rapid-banner-${tier}`); }
        }
        // Wait for engine to advance (1100ms practice delay)
        await new Promise(r => setTimeout(r, 1300));
    }
    expect(bannerSeen, `${label}: rapid-guess overlay banner appeared after 3 consecutive rapid answers (item 0 exempt)`);

    // Wait for banner to dismiss (5s timer started when shown above; we already
    // waited ~1.5s, so wait the rest)
    await new Promise(r => setTimeout(r, 4500));
    const stillThere = await page.$('#rapidGuessOverlay');
    expect(!stillThere, `${label}: banner auto-dismissed after 5s`);

    // ---- Slow answer should NOT trigger banner ----
    log('  --- submitting slow answer (>3s gap) ---');
    // Wait for current question
    await waitFor(page,
        () => document.getElementById('questionText')?.textContent?.trim().length > 0,
        5000, 'next question rendered');
    // Force render time 5s ago (well above the 3s threshold), but set the
    // click stamp to NOW so the gate runs (else clickWasRecent would be false
    // and the gate skips entirely, hiding the streak-reset behaviour we want
    // to verify).
    await page.evaluate(() => {
        window.state.lastQuestionRenderTime = Date.now() - 5000;
        window.state._lastUserClickTime = Date.now();
        window.state.rapidGuessStreak = 0;
    });
    const itemsLeft = await page.evaluate(() => state.mapItemCountTarget - state.mapItemCount);
    if (itemsLeft > 0) {
        await page.evaluate(() => window.recordMapAnswer({ correct: true }));
        await new Promise(r => setTimeout(r, 600));
        const stillThere2 = await page.$('#rapidGuessOverlay');
        expect(!stillThere2, `${label}: slow answer did NOT show banner`);
        const streakAfter = await page.evaluate(() => window.state.rapidGuessStreak);
        expect(streakAfter === 0, `${label}: rapidGuessStreak reset to 0 after slow answer (got ${streakAfter})`);
    }

    // ---- Force-finalize the session to check immersion exit + duration ----
    log('  --- finalizing session ---');
    await page.evaluate(() => {
        // Push to results: pretend we hit the count cap.
        window.state.mapItemCount = window.state.mapItemCountTarget;
        if (typeof window.finalizeMapSession === 'function') window.finalizeMapSession();
    });
    await waitFor(page,
        () => document.getElementById('mapResultsView')?.classList.contains('active'),
        5000, 'mapResultsView active');
    await shot(page, `03-results-${tier}`);

    expect(!(await bodyHasClass(page, 'map-immersive')),
        `${label}: body.map-immersive class removed after finalize`);

    // Duration display
    const dur = await page.$eval('#mapResultsView .rit-duration', el => el.textContent).catch(() => null);
    log(`  duration text: "${dur}"`);
    expect(/^Total time: \d+:\d{2}$/.test(dur || ''),
        `${label}: results show "Total time: M:SS" (got "${dur}")`);
}

(async () => {
    let browser;
    let exitCode = 0;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        page.on('console', msg => {
            const t = `[${msg.type()}] ${msg.text()}`;
            // Filter out the pre-existing 404 noise from missing static assets
            // (e.g. favicon) — those existed before this change and aren't ours.
            if (msg.type() === 'error' && !/Failed to load resource.*404/i.test(msg.text())) {
                consoleErrors.push(t);
            }
        });
        page.on('pageerror', err => pageErrors.push(err.stack || String(err)));

        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
            10000, 'window.state ready');

        await runTier(page, 'k2', 'K-2');
        await runTier(page, '35', '3-5');

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
