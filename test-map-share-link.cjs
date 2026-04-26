// Puppeteer test for MAP teacher share-link feature.
// Verifies:
//   1. Default RIT bands restored (K-2, 3-5, mixed)
//   2. generateMapShareLink() round-trip with parseMapShareLink()
//   3. Clipboard receives valid URL via copyMapShareLink()
//   4. Loading ?map= URL auto-launches the MAP session, skipping selector
//   5. state fields match what was encoded
//
// Server assumed running on http://localhost:3000/

const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3000/';

function log(...a) { console.log(...a); }
function fail(msg) {
    log('  FAIL:', msg);
    process.exitCode = 1;
}
function ok(msg) { log('  OK:  ', msg); }

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    });

    try {
        // ------- TEST 1: defaults restored ------------------------------
        log('\n=== TEST 1: Default RIT bands restored ===');
        {
            const page = await browser.newPage();
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
            await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

            // Open MAP, choose K-2 tier, then read state.
            await page.evaluate(() => window.openMapTest('k2'));
            // selectMapTier sets defaults
            await page.evaluate(() => window.selectMapTier('k2'));
            const k2Bands = await page.evaluate(() => window.state.mapSelectedBands.slice());
            const k2Expected = ['161-170', '171-180', '181-190', '191-200'];
            if (JSON.stringify(k2Bands) === JSON.stringify(k2Expected)) {
                ok('K-2 default bands match: ' + k2Bands.join(','));
            } else {
                fail(`K-2 default bands mismatch. got ${JSON.stringify(k2Bands)} want ${JSON.stringify(k2Expected)}`);
            }

            await page.evaluate(() => window.selectMapTier('35'));
            const b35 = await page.evaluate(() => window.state.mapSelectedBands.slice());
            const e35 = ['191-200', '201-210', '211-220'];
            if (JSON.stringify(b35) === JSON.stringify(e35)) {
                ok('3-5 default bands match: ' + b35.join(','));
            } else {
                fail(`3-5 default bands mismatch. got ${JSON.stringify(b35)} want ${JSON.stringify(e35)}`);
            }

            await page.evaluate(() => window.selectMapTier('mixed'));
            const bm = await page.evaluate(() => window.state.mapSelectedBands.slice());
            const em = ['171-180', '181-190', '191-200', '201-210'];
            if (JSON.stringify(bm) === JSON.stringify(em)) {
                ok('Mixed default bands match: ' + bm.join(','));
            } else {
                fail(`Mixed default bands mismatch. got ${JSON.stringify(bm)} want ${JSON.stringify(em)}`);
            }

            const critical = errors.filter(e => !/favicon|net::|cdn|404|Failed to load resource/i.test(e));
            if (critical.length) {
                fail('Console errors during defaults test: ' + critical.join(' | '));
            } else {
                ok('No console errors during defaults test');
            }
            await page.close();
        }

        // ------- TEST 2: round-trip encode/decode -----------------------
        log('\n=== TEST 2: generateMapShareLink / parseMapShareLink round-trip ===');
        {
            const page = await browser.newPage();
            await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

            // Configure the selector state explicitly.
            await page.evaluate(() => {
                window.state.mapTier = 'k2';
                window.state.mapSessionMode = 'practice';
                window.state.mapSelectedBands = ['141-150', '151-160', '161-170'];
                window.state.mapSelectedDomains = ['OA', 'NO', 'G'];
                window.state.mapItemCountTarget = 15;
            });
            const url = await page.evaluate(() => window.generateMapShareLink());
            log('  generated URL:', url);
            // Expect: ?map=k2-PR-141,151,161-ONG-15
            if (!url.includes('?map=k2-PR-141,151,161-')) {
                fail('URL missing expected tier/mode/bands prefix: ' + url);
            } else {
                ok('URL prefix matches expected tier/mode/bands');
            }
            // Domain order is preserved from selection: O, N, G
            if (!/-ONG-15$/.test(url)) {
                fail('URL suffix domains/count not as expected (want -ONG-15): ' + url);
            } else {
                ok('URL suffix matches expected domains/count');
            }

            // Now parse it back
            const param = url.split('?map=')[1];
            const parsed = await page.evaluate(p => window.parseMapShareLink(p), param);
            log('  parsed:', JSON.stringify(parsed));
            const expected = {
                tier: 'k2',
                mode: 'practice',
                bands: ['141-150', '151-160', '161-170'],
                domains: ['OA', 'NO', 'G'],
                itemCount: 15,
            };
            if (JSON.stringify(parsed) === JSON.stringify(expected)) {
                ok('Round-trip parse matches input');
            } else {
                fail('Round-trip mismatch.\n   got: ' + JSON.stringify(parsed) + '\n  want: ' + JSON.stringify(expected));
            }

            // Edge: 231+ band, all 4 domains encoded as ONMG (1 char per domain)
            const parsed2 = await page.evaluate(() => window.parseMapShareLink('35-WS-221,231-ONMG-25'));
            const exp2 = {
                tier: '35', mode: 'worksheet',
                bands: ['221-230', '231+'],
                domains: ['OA', 'NO', 'MD', 'G'],
                itemCount: 25,
            };
            if (JSON.stringify(parsed2) === JSON.stringify(exp2)) {
                ok('231+ edge case parses correctly');
            } else {
                fail('231+ edge mismatch. got ' + JSON.stringify(parsed2) + ' want ' + JSON.stringify(exp2));
            }

            // Edge: malformed input → null
            const bad = await page.evaluate(() => window.parseMapShareLink('garbage'));
            if (bad === null) ok('Malformed input returns null');
            else fail('Malformed input returned non-null: ' + JSON.stringify(bad));

            await page.close();
        }

        // ------- TEST 3: clipboard via copyMapShareLink -----------------
        log('\n=== TEST 3: copyMapShareLink writes a valid URL to clipboard ===');
        {
            const page = await browser.newPage();
            // Grant clipboard permissions for the origin.
            const ctx = browser.defaultBrowserContext();
            try {
                await ctx.overridePermissions(BASE, ['clipboard-read', 'clipboard-write']);
            } catch (e) {
                log('  (clipboard permission grant warning):', e.message);
            }
            await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

            await page.evaluate(() => {
                window.state.mapTier = 'k2';
                window.state.mapSessionMode = 'practice';
                window.state.mapSelectedBands = ['141-150', '151-160', '161-170'];
                window.state.mapSelectedDomains = ['OA', 'NO'];
                window.state.mapItemCountTarget = 10;
            });
            const returned = await page.evaluate(() => window.copyMapShareLink());
            // copyMapShareLink kicks off async work but also returns the URL we built (in our impl).
            log('  copy returned:', returned);

            // Try reading clipboard
            let clip = '';
            try {
                clip = await page.evaluate(() => navigator.clipboard.readText());
            } catch (e) {
                log('  (clipboard read failed in headless — falling back to return value)');
            }
            const url = clip || returned;
            if (typeof url === 'string' && /\?map=k2-PR-141,151,161-ON-10$/.test(url)) {
                ok('Clipboard / returned URL is valid: ' + url);
            } else {
                fail('Clipboard / return URL invalid: ' + JSON.stringify(url));
            }
            await page.close();
        }

        // ------- TEST 4: ?map= URL auto-launches session ---------------
        log('\n=== TEST 4: ?map= URL skips selector and auto-starts session ===');
        {
            const page = await browser.newPage();
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

            const shareUrl = BASE + '?map=k2-PR-141,151,161-ON-10';
            await page.goto(shareUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait briefly for the auto-launch
            await new Promise(r => setTimeout(r, 1500));

            // Check that state matches what we encoded
            const s = await page.evaluate(() => ({
                mapTier: window.state.mapTier,
                mapSessionMode: window.state.mapSessionMode,
                mapSelectedBands: (window.state.mapSelectedBands || []).slice(),
                mapSelectedDomains: (window.state.mapSelectedDomains || []).slice(),
                mapItemCountTarget: window.state.mapItemCountTarget,
                mapMode: window.state.mapMode,
            }));
            log('  state after load:', JSON.stringify(s));

            if (s.mapTier === 'k2') ok('mapTier = k2'); else fail('mapTier wrong: ' + s.mapTier);
            if (s.mapSessionMode === 'practice') ok('mapSessionMode = practice'); else fail('mapSessionMode wrong: ' + s.mapSessionMode);
            if (JSON.stringify(s.mapSelectedBands) === JSON.stringify(['141-150', '151-160', '161-170'])) ok('bands match');
            else fail('bands mismatch: ' + JSON.stringify(s.mapSelectedBands));
            if (JSON.stringify(s.mapSelectedDomains) === JSON.stringify(['OA', 'NO'])) ok('domains match');
            else fail('domains mismatch: ' + JSON.stringify(s.mapSelectedDomains));
            if (s.mapItemCountTarget === 10) ok('itemCount = 10'); else fail('itemCount wrong: ' + s.mapItemCountTarget);
            if (s.mapMode === true) ok('mapMode flag = true (engine running)');
            else fail('mapMode flag should be true after auto-launch, got: ' + s.mapMode);

            // Selector view should NOT be the active view; mapSessionView should be active.
            const sessionActive = await page.evaluate(() => {
                const v = document.getElementById('mapSessionView');
                return v && v.classList.contains('active');
            });
            const selectorActive = await page.evaluate(() => {
                const v = document.getElementById('mapSelectorView');
                return v && v.classList.contains('active');
            });
            if (sessionActive && !selectorActive) ok('mapSessionView is active, mapSelectorView is not');
            else fail(`view state wrong: sessionActive=${sessionActive} selectorActive=${selectorActive}`);

            // URL should have been cleaned
            const cleanUrl = await page.evaluate(() => window.location.search);
            if (cleanUrl === '') ok('URL search params cleaned');
            else fail('URL not cleaned: ' + cleanUrl);

            const critical = errors.filter(e => !/favicon|net::|cdn|404|Failed to load resource/i.test(e));
            if (critical.length) fail('Console errors during auto-launch: ' + critical.join(' | '));
            else ok('No console errors during auto-launch');

            await page.close();
        }

        // ------- TEST 5: worksheet mode auto-launch ---------------------
        log('\n=== TEST 5: ?map= worksheet mode auto-launches worksheet ===');
        {
            const page = await browser.newPage();
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
            await page.goto(BASE + '?map=35-WS-191,201,211-ONMG-15', { waitUntil: 'networkidle0', timeout: 30000 });
            await new Promise(r => setTimeout(r, 1500));

            const s = await page.evaluate(() => ({
                mapTier: window.state.mapTier,
                mapSelectedBands: (window.state.mapSelectedBands || []).slice(),
                mapSelectedDomains: (window.state.mapSelectedDomains || []).slice(),
                mapWorksheetActive: window.state.mapWorksheetActive,
                gameMode: window.state.gameMode,
            }));
            log('  state after worksheet load:', JSON.stringify(s));
            if (s.mapTier === '35') ok('mapTier=35');
            else fail('mapTier wrong: ' + s.mapTier);
            if (s.mapWorksheetActive === true) ok('mapWorksheetActive=true');
            else fail('mapWorksheetActive should be true: ' + s.mapWorksheetActive);

            const critical = errors.filter(e => !/favicon|net::|cdn|404|Failed to load resource/i.test(e));
            if (critical.length) fail('Console errors during WS auto-launch: ' + critical.join(' | '));
            else ok('No console errors during WS auto-launch');

            await page.close();
        }
    } finally {
        await browser.close();
    }

    if (process.exitCode && process.exitCode !== 0) {
        log('\n=== TEST FAILED ===');
    } else {
        log('\n=== ALL TESTS PASSED ===');
    }
})();
