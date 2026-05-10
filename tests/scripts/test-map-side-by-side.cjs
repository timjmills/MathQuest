// Verify MAP side-by-side layout (question left, answer right) works at 1280×600
// for representative widget types: numpad, multi-select, MC, dnd, hot-spot,
// number-line-extended, clock-set, ten-frame, coord, number-family.
//
// Each scenario:
//  1. Mounts a forced question of the target answerType
//  2. Asserts: questionCard is grid (display:grid, 2 cols) — except opt-out skills
//  3. Asserts: docHeight ≤ viewportHeight + small slack (no/minimal scroll)
//  4. Asserts: Submit button is in viewport
//  5. Captures before/after screenshot
//
// Exit codes:
//   0 — all scenarios pass
//   2 — at least one scenario failed assertions
//   3 — console errors observed
//   4 — page errors thrown
//   1 — test crashed

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/';
const SHOT_DIR = path.join(__dirname, 'test-map-side-by-side-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...a) { console.log('[SBS]', ...a); }

async function shot(page, name, fullPage = false) {
    try {
        await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage });
        log('  shot ' + name + '.png');
    } catch (e) { log('  shot fail ' + name + ': ' + e.message); }
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Timeout waiting for ' + label);
}

async function setupSession(page) {
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 250));
    await page.evaluate(() => window.openMapTest('k2'));
    await waitFor(page,
        () => document.getElementById('mapSelectorView')?.classList.contains('active'),
        5000, 'mapSelectorView active');
    await waitFor(page,
        () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
        5000, 'chips rendered');
    await page.evaluate(() => { window.state.mapItemCountTarget = 5; });
    await page.evaluate(() => window.startMapFromUI());
    await waitFor(page,
        () => document.getElementById('mapSessionView')?.classList.contains('active'),
        5000, 'mapSessionView active');
    await waitFor(page,
        () => document.getElementById('questionText')?.textContent?.trim().length > 0,
        8000, 'first question rendered');
    // Make sure body.map-immersive is set (set by startMapSession)
    await waitFor(page, () => document.body.classList.contains('map-immersive'), 2000, 'immersive on');
}

// Each scenario forces a representative question into renderQuestion().
const SCENARIOS = [
    {
        name: 'numpad-input',
        widget: 'numpadInputHost',
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const visual = '<svg viewBox="0 0 600 120" width="100%" style="max-width:600px;">' +
                    '<line x1="40" y1="60" x2="560" y2="60" stroke="#333" stroke-width="3"/>' +
                    Array.from({length: 11}, (_, i) => {
                        const x = 40 + i * 52;
                        return `<line x1="${x}" y1="50" x2="${x}" y2="70" stroke="#333" stroke-width="2"/>` +
                               `<text x="${x}" y="95" text-anchor="middle" font-size="18" fill="#333">${i}</text>`;
                    }).join('') +
                    `<circle cx="${40 + 7 * 52}" cy="60" r="10" fill="#1565c0"/></svg>`;
                const q = {
                    text: 'What number is the dot pointing to?',
                    ans: 7,
                    answerType: 'numpad-input',
                    visual,
                    unit: '',
                };
                window.state.currentQ = q;
                window.state.mapFeatures = window.state.mapFeatures || {};
                window.state.mapFeatures.numpadOnly = true;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'multi-select-check',
        widget: 'multiSelectHost',
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Select all the even numbers.',
                    answerType: 'multi-select-check',
                    options: [
                        { id: '2', label: '2' }, { id: '3', label: '3' },
                        { id: '4', label: '4' }, { id: '5', label: '5' },
                        { id: '6', label: '6' }, { id: '7', label: '7' },
                    ],
                    ans: ['2', '4', '6'],
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'multiple-choice',
        widget: null,  // uses #answerOptions buttons, no widget host
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Which shape has 3 sides?',
                    answerType: 'multiple-choice',
                    options: ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
                    ans: 'Triangle',
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 400));
        }
    },
    {
        name: 'ten-frame',
        widget: 'tenFrameHost',
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Show the number 7 on the ten-frame.',
                    answerType: 'ten-frame',
                    targetCount: 7,
                    frameSize: 10,
                    ans: 7,
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'dnd-order',
        widget: 'dndGenericHost',
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Drag the numbers in order from least to greatest.',
                    answerType: 'dnd-generic',
                    dndMode: 'order',
                    tiles: [
                        { id: 't1', label: '5' },
                        { id: 't2', label: '2' },
                        { id: 't3', label: '8' },
                        { id: 't4', label: '1' },
                    ],
                    ans: ['t4', 't2', 't1', 't3'],
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'hot-spot',
        widget: 'hotSpotHost',
        sideBySide: false,  // opts out via :has() selector — full width
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Click on the obtuse angle.',
                    answerType: 'hot-spot',
                    background: '<svg viewBox="0 0 400 200" width="400" height="200">' +
                        '<rect x="0" y="0" width="400" height="200" fill="#fafafa" stroke="#999"/>' +
                        '<line x1="100" y1="150" x2="180" y2="50" stroke="#1565c0" stroke-width="3"/>' +
                        '<line x1="100" y1="150" x2="200" y2="150" stroke="#1565c0" stroke-width="3"/>' +
                        '</svg>',
                    regions: [
                        { id: 'a', shape: 'circle', cx: 100, cy: 150, r: 30 },
                    ],
                    ans: ['a'],
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'number-line-extended',
        widget: 'numberLineExtendedHost',
        sideBySide: false,  // opts out via :has() — full width
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Place 5 on the number line.',
                    answerType: 'number-line-extended',
                    nleConfig: {
                        min: 0, max: 10, majorStep: 1, minorStep: 1,
                        markers: [{ id: 'm1', value: null, target: 5, label: '5' }],
                    },
                    ans: { m1: 5 },
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
    {
        name: 'clock-set',
        widget: 'clockSetHost',
        sideBySide: true,
        async force(page) {
            await page.evaluate(async () => {
                const q = {
                    text: 'Set the clock to 3:30.',
                    answerType: 'clock-set',
                    targetHour: 3,
                    targetMinute: 30,
                    minuteStep: 5,
                    showDigital: true,
                    ans: { hour: 3, minute: 30 },
                    visual: '',
                };
                window.state.currentQ = q;
                if (window.renderQuestion) window.renderQuestion(q);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
];

async function measureScenario(page, scenario) {
    return page.evaluate((scen) => {
        const card = document.getElementById('questionCard');
        const cs = card ? getComputedStyle(card) : null;
        const docH = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
        );
        const winH = window.innerHeight;
        const winW = window.innerWidth;
        const visualEl = document.getElementById('visualAid');
        const visualCs = visualEl ? getComputedStyle(visualEl) : null;
        const widgetHost = scen.widget ? document.getElementById(scen.widget) : null;
        const widgetRect = widgetHost ? widgetHost.getBoundingClientRect() : null;
        const qText = document.getElementById('questionText');
        const qTextRect = qText ? qText.getBoundingClientRect() : null;
        // Find the submit button - varies per widget
        const submitSelectors = ['.np-submit', '.msc-submit', '.tf-submit',
            '.dnd-submit', '.hs-submit', '.nle-submit', '.cs-submit',
            '#answerInputArea button', '#answerOptions button'];
        let submitEl = null, submitSel = null;
        for (const s of submitSelectors) {
            const el = document.querySelector(s);
            if (el && el.offsetParent !== null) {
                submitEl = el;
                submitSel = s;
                break;
            }
        }
        const submitRect = submitEl ? submitEl.getBoundingClientRect() : null;
        const submitVisible = submitRect
            ? (submitRect.bottom <= winH && submitRect.top >= 0)
            : null;
        // For side-by-side check: at >= 900px, card should be display:grid with 2 cols
        const isGrid = cs ? cs.display === 'grid' : false;
        const cols = cs ? cs.gridTemplateColumns : '';
        const colCount = cols.split(' ').filter(c => c.trim().length > 0).length;
        // Where is widget vs question text horizontally?
        let widgetIsRightOfText = null;
        if (widgetRect && qTextRect) {
            widgetIsRightOfText = widgetRect.left > qTextRect.right - 5;
        }
        return {
            docH, winH, winW,
            hasScroll: docH > winH + 1,
            scrollOverflow: Math.max(0, docH - winH),
            cardDisplay: cs ? cs.display : '',
            cardCols: cols,
            cardColCount: colCount,
            isGrid,
            visualDisplay: visualCs ? visualCs.display : '',
            widgetRect: widgetRect ? { left: widgetRect.left, right: widgetRect.right, top: widgetRect.top, bottom: widgetRect.bottom, w: widgetRect.width, h: widgetRect.height } : null,
            qTextRect: qTextRect ? { left: qTextRect.left, right: qTextRect.right, top: qTextRect.top, bottom: qTextRect.bottom } : null,
            widgetIsRightOfText,
            submitSel,
            submitRect: submitRect ? { top: submitRect.top, bottom: submitRect.bottom, left: submitRect.left } : null,
            submitVisible,
            bodyClass: document.body.className,
        };
    }, { widget: scenario.widget });
}

let scenarioFails = 0;

async function runScenario(page, scenario, vpLabel) {
    log(`-- ${vpLabel} :: ${scenario.name} --`);
    try {
        await scenario.force(page);
        const m = await measureScenario(page, scenario);
        log(`   docH=${m.docH} winH=${m.winH} overflow=${m.scrollOverflow} grid=${m.isGrid}(cols=${m.cardColCount}) submitVisible=${m.submitVisible} submitSel=${m.submitSel}`);
        if (m.qTextRect) log(`   qText rect: L=${m.qTextRect.left.toFixed(0)} R=${m.qTextRect.right.toFixed(0)}`);
        if (m.widgetRect) log(`   widget rect: L=${m.widgetRect.left.toFixed(0)} R=${m.widgetRect.right.toFixed(0)} (right-of-text=${m.widgetIsRightOfText})`);
        await shot(page, `${vpLabel}-${scenario.name}`);

        // Assertions
        const passes = [];
        const fails = [];

        // 1. Card should be display:grid in side-by-side scenarios at >= 900px
        if (scenario.sideBySide && m.winW >= 900) {
            if (m.isGrid && m.cardColCount === 2) passes.push('card is 2-col grid');
            else fails.push(`card is NOT 2-col grid (display=${m.cardDisplay} colCount=${m.cardColCount} cols="${m.cardCols}")`);
        }
        // For full-width scenarios at >= 900px, card should be 1-col grid (or revert)
        if (!scenario.sideBySide && m.winW >= 900 && m.isGrid) {
            if (m.cardColCount === 1) passes.push('full-width card is 1-col');
            else fails.push(`full-width opt-out broken (colCount=${m.cardColCount})`);
        }

        // 2. Widget should be to the right of question text in side-by-side mode
        if (scenario.sideBySide && scenario.widget && m.winW >= 900 && m.widgetIsRightOfText !== null) {
            if (m.widgetIsRightOfText) passes.push('widget is right of question text');
            else fails.push('widget is NOT right of question text');
        }

        // 3. Document should not have significant scroll (allow tiny slack)
        if (m.scrollOverflow <= 8) passes.push(`no scroll (overflow=${m.scrollOverflow}px)`);
        else fails.push(`scroll overflow ${m.scrollOverflow}px`);

        // 4. Submit button must be visible (or null if scenario doesn't have one)
        if (m.submitVisible === true) passes.push('submit visible');
        else if (m.submitVisible === false) fails.push('submit NOT visible in viewport');
        // null is acceptable (some MC don't need an explicit submit)

        passes.forEach(p => log('   PASS: ' + p));
        fails.forEach(f => { log('   FAIL: ' + f); scenarioFails++; });
        return { name: scenario.name, vpLabel, passes, fails };
    } catch (err) {
        log('   CRASH: ' + (err.stack || err.message));
        scenarioFails++;
        return { name: scenario.name, vpLabel, passes: [], fails: ['crash: ' + err.message] };
    }
}

(async () => {
    let browser;
    let exitCode = 0;
    try {
        log('launch puppeteer');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', (msg) => {
            const t = `[${msg.type()}] ${msg.text()}`;
            if (msg.type() === 'error' && !/Failed to load resource.*404/.test(t)) {
                consoleErrors.push(t);
            }
        });
        page.on('pageerror', (e) => pageErrors.push(e.stack || String(e)));
        page.on('requestfailed', (req) => {
            const url = req.url();
            if (url.endsWith('.js') || url.endsWith('.css')) {
                consoleErrors.push('[reqfail] ' + url + ' -> ' + (req.failure()?.errorText || '?'));
            }
        });

        // ====== Phase A: 1280×600 (target Chromebook) ======
        log('=== 1280×600 (target) ===');
        await page.setViewport({ width: 1280, height: 600 });
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitFor(page,
            () => typeof window.state === 'object' && typeof window.openMapTest === 'function',
            15000, 'app ready');
        await setupSession(page);
        const phaseA = [];
        for (const s of SCENARIOS) {
            phaseA.push(await runScenario(page, s, '1280x600'));
        }

        // ====== Phase B: 1280×800 regression ======
        log('=== 1280×800 (regression) ===');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitFor(page,
            () => typeof window.state === 'object' && typeof window.openMapTest === 'function',
            15000, 'app ready');
        await setupSession(page);
        const phaseB = [];
        // Spot check 3 scenarios at 1280×800
        for (const s of [SCENARIOS[0], SCENARIOS[1], SCENARIOS[7]]) {
            phaseB.push(await runScenario(page, s, '1280x800'));
        }

        // ====== Phase C: 1366×768 regression ======
        log('=== 1366×768 (regression) ===');
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitFor(page,
            () => typeof window.state === 'object' && typeof window.openMapTest === 'function',
            15000, 'app ready');
        await setupSession(page);
        const phaseC = [];
        for (const s of [SCENARIOS[0], SCENARIOS[2]]) {
            phaseC.push(await runScenario(page, s, '1366x768'));
        }

        // ====== Phase D: 800×600 — narrow, single-column fallback ======
        log('=== 800×600 (narrow fallback) ===');
        await page.setViewport({ width: 800, height: 600 });
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitFor(page,
            () => typeof window.state === 'object' && typeof window.openMapTest === 'function',
            15000, 'app ready');
        await setupSession(page);
        // At narrow viewport, the card should NOT be grid (single-column fallback)
        await SCENARIOS[0].force(page);
        const m800 = await measureScenario(page, SCENARIOS[0]);
        log(`   800x600: cardDisplay=${m800.cardDisplay} (should be block) isGrid=${m800.isGrid}`);
        await shot(page, '800x600-numpad-narrow-fallback');
        if (m800.cardDisplay === 'block') log('   PASS: narrow fallback to block');
        else { log('   FAIL: narrow viewport still grid'); scenarioFails++; }

        // ====== Verdict ======
        log('======== VERDICT ========');
        log(`scenarioFails = ${scenarioFails}`);
        if (scenarioFails > 0) exitCode = 2;
        if (consoleErrors.length) {
            log('console errors:');
            consoleErrors.forEach(e => log('   ' + e));
            exitCode = exitCode || 3;
        }
        if (pageErrors.length) {
            log('page errors:');
            pageErrors.forEach(e => log('   ' + e));
            exitCode = exitCode || 4;
        }
        log(exitCode === 0 ? 'OVERALL: PASS' : 'OVERALL: FAIL');
    } catch (err) {
        log('CRASH: ' + (err.stack || err.message));
        exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exitCode);
    }
})();
