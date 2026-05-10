// Verify the three MAP layout polish items shipped together:
//  1. BOTH columns (question/visual on left, answer mech on right) are
//     vertically centered within the side-by-side grid row.
//  2. Visuals never clip — capped to min(560px,50vw) wide × min(420px,60vh) tall
//     in side-by-side mode.
//  3. Click-to-enlarge: clicking a non-interactive visual opens an overlay
//     at ~90% viewport. Click outside or Esc closes. For interactive visuals
//     (hot-spot, multi-select-check, ten-frame, clock-set, coord-input,
//     fraction-bar-shade, dnd-generic), a 🔍 magnifier icon appears in the
//     top-right instead.
//
// Exit codes:
//   0 — all checks pass
//   2 — at least one assertion failed
//   3 — console errors observed
//   4 — page errors thrown
//   1 — test crashed

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/';
const SHOT_DIR = path.join(__dirname, 'test-map-zoom-center-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
let fails = 0;

function log(...a) { console.log('[ZC]', ...a); }
function pass(msg) { log('   PASS: ' + msg); }
function fail(msg) { log('   FAIL: ' + msg); fails++; }

async function shot(page, name) {
    try {
        await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false });
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
    await waitFor(page, () => document.body.classList.contains('map-immersive'), 2000, 'immersive on');
}

// Forces a question of a specific shape into renderQuestion()
const SCENARIOS = [
    {
        name: 'numpad-with-large-bargraph',
        clickIsAnswer: false,
        async force(page) {
            await page.evaluate(() => {
                // Build a deliberately tall/wide bar graph SVG (700x500) to test
                // the visual cap rules.
                const visual = '<svg viewBox="0 0 700 500" width="700" height="500" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect x="0" y="0" width="700" height="500" fill="#fafafa" stroke="#999"/>' +
                    '<text x="350" y="30" text-anchor="middle" font-size="24" font-weight="700">Books Read This Month</text>' +
                    '<line x1="80" y1="450" x2="650" y2="450" stroke="#333" stroke-width="2"/>' +
                    '<line x1="80" y1="60" x2="80" y2="450" stroke="#333" stroke-width="2"/>' +
                    [3, 5, 7, 4, 6].map((v, i) => {
                        const x = 100 + i * 110, h = v * 50, y = 450 - h;
                        return `<rect x="${x}" y="${y}" width="80" height="${h}" fill="#1565c0"/>` +
                               `<text x="${x + 40}" y="475" text-anchor="middle" font-size="18">Wk${i+1}</text>` +
                               `<text x="${x + 40}" y="${y - 8}" text-anchor="middle" font-size="18" font-weight="700">${v}</text>`;
                    }).join('') +
                    '</svg>';
                window.state.currentQ = {
                    text: 'How many books were read in week 3?',
                    ans: 7,
                    answerType: 'numpad-input',
                    visual,
                    unit: '',
                };
                window.state.mapFeatures = window.state.mapFeatures || {};
                window.state.mapFeatures.numpadOnly = true;
                if (window.renderQuestion) window.renderQuestion(window.state.currentQ);
            });
            await new Promise(r => setTimeout(r, 700));
        }
    },
    {
        name: 'multi-select-check-with-visual',
        clickIsAnswer: true,
        async force(page) {
            await page.evaluate(() => {
                window.state.currentQ = {
                    text: 'Select all the even numbers shown in the chart.',
                    answerType: 'multi-select-check',
                    options: [
                        { id: '2', label: '2' }, { id: '3', label: '3' },
                        { id: '4', label: '4' }, { id: '5', label: '5' },
                        { id: '6', label: '6' }, { id: '7', label: '7' },
                    ],
                    ans: ['2', '4', '6'],
                    visual: '<svg viewBox="0 0 400 200" width="400" height="200">' +
                        '<rect x="0" y="0" width="400" height="200" fill="#e3f2fd" stroke="#1565c0"/>' +
                        '<text x="200" y="110" text-anchor="middle" font-size="48" font-weight="800">2 3 4 5 6 7</text>' +
                        '</svg>',
                };
                if (window.renderQuestion) window.renderQuestion(window.state.currentQ);
            });
            await new Promise(r => setTimeout(r, 700));
        }
    },
    {
        name: 'ten-frame',
        clickIsAnswer: true,
        async force(page) {
            await page.evaluate(() => {
                window.state.currentQ = {
                    text: 'Show the number 7 on the ten-frame.',
                    answerType: 'ten-frame',
                    targetCount: 7,
                    frameSize: 10,
                    ans: 7,
                    visual: '',
                };
                if (window.renderQuestion) window.renderQuestion(window.state.currentQ);
            });
            await new Promise(r => setTimeout(r, 700));
        }
    },
    {
        name: 'multiple-choice-with-shape',
        clickIsAnswer: false,
        async force(page) {
            await page.evaluate(() => {
                window.state.currentQ = {
                    text: 'How many sides does this shape have?',
                    answerType: 'multiple-choice',
                    options: [3, 4, 5, 6],
                    ans: 4,
                    visual: '<svg viewBox="0 0 300 300" width="300" height="300">' +
                        '<polygon points="60,60 240,60 240,240 60,240" fill="#fff3e0" stroke="#ff9800" stroke-width="4"/>' +
                        '</svg>',
                };
                if (window.renderQuestion) window.renderQuestion(window.state.currentQ);
            });
            await new Promise(r => setTimeout(r, 600));
        }
    },
];

async function measureLayout(page) {
    return page.evaluate(() => {
        const card = document.getElementById('questionCard');
        const cs = card ? getComputedStyle(card) : null;
        const visualEl = document.getElementById('visualAid');
        const visualCs = visualEl ? getComputedStyle(visualEl) : null;
        const visualSvg = visualEl ? visualEl.querySelector('svg') : null;
        const r2o = (r) => r ? { x: r.x, y: r.y, top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : null;
        const svgRect = r2o(visualSvg ? visualSvg.getBoundingClientRect() : null);
        const qText = document.getElementById('questionText');
        const qTextCs = qText ? getComputedStyle(qText) : null;
        const qTextRect = r2o(qText ? qText.getBoundingClientRect() : null);
        // Find right-column item
        const widgetHost = visualEl ? visualEl.querySelector('[id$="Host"]') : null;
        const ansOpts = document.getElementById('answerOptions');
        const ansInput = document.getElementById('answerInputArea');
        const rightEl = (widgetHost && widgetHost.offsetParent !== null) ? widgetHost
            : (ansOpts && getComputedStyle(ansOpts).display !== 'none' ? ansOpts : ansInput);
        const rightRect = r2o(rightEl ? rightEl.getBoundingClientRect() : null);
        const rightCs = rightEl ? getComputedStyle(rightEl) : null;
        const cardRect = r2o(card ? card.getBoundingClientRect() : null);
        const winH = window.innerHeight;
        const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        // Detect zoom-related elements
        const hasZoomTriggerClass = visualEl ? visualEl.classList.contains('zoom-trigger') : false;
        const hasZoomIcon = visualEl ? !!visualEl.querySelector('.zoom-icon-btn') : false;
        const overlay = document.querySelector('.zoom-overlay');
        return {
            cardDisplay: cs ? cs.display : '',
            cardCols: cs ? cs.gridTemplateColumns : '',
            cardAlignItems: cs ? cs.alignItems : '',
            visualDisplay: visualCs ? visualCs.display : '',
            qTextAlignSelf: qTextCs ? qTextCs.alignSelf : '',
            qTextRect,
            rightAlignSelf: rightCs ? rightCs.alignSelf : '',
            rightRect,
            cardRect,
            svgRect,
            winH,
            docH,
            scrollOverflow: Math.max(0, docH - winH),
            hasZoomTriggerClass,
            hasZoomIcon,
            overlayPresent: !!overlay,
        };
    });
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

        await page.setViewport({ width: 1280, height: 600 });
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitFor(page,
            () => typeof window.state === 'object' && typeof window.openMapTest === 'function',
            15000, 'app ready');
        await setupSession(page);

        // ====== Run each scenario ======
        for (const scen of SCENARIOS) {
            log(`-- scenario: ${scen.name} (clickIsAnswer=${scen.clickIsAnswer}) --`);
            await scen.force(page);
            const m = await measureLayout(page);
            log(`   cardDisplay=${m.cardDisplay} cols="${m.cardCols}" alignItems=${m.cardAlignItems}`);
            log(`   qTextAlignSelf=${m.qTextAlignSelf} rightAlignSelf=${m.rightAlignSelf}`);
            if (m.svgRect) log(`   visual SVG rect: w=${m.svgRect.width.toFixed(0)} h=${m.svgRect.height.toFixed(0)}`);
            log(`   docH=${m.docH} winH=${m.winH} overflow=${m.scrollOverflow}`);
            log(`   zoom: triggerClass=${m.hasZoomTriggerClass} icon=${m.hasZoomIcon}`);
            await shot(page, `before-${scen.name}`);

            // === Assertion 1: side-by-side grid present ===
            // (non-full-width scenarios)
            const fullWidthScenarios = ['hot-spot', 'number-line-extended'];
            const isFullWidth = fullWidthScenarios.includes(scen.name);
            if (!isFullWidth) {
                if (m.cardDisplay === 'grid') pass('card is grid');
                else fail(`card is not grid (display=${m.cardDisplay})`);
                // alignItems should be 'center' (vertical centering of both cols)
                if (m.cardAlignItems === 'center') pass('grid align-items: center');
                else fail(`grid align-items != center (got "${m.cardAlignItems}")`);
            }

            // === Assertion 2: question text is centered vertically ===
            // align-self should resolve to 'center' for #questionText
            if (m.qTextAlignSelf === 'center') pass('#questionText align-self: center');
            else fail(`#questionText align-self != center (got "${m.qTextAlignSelf}")`);

            // === Assertion 3: right column item is centered vertically ===
            if (m.rightAlignSelf === 'center') pass('right column align-self: center');
            else fail(`right column align-self != center (got "${m.rightAlignSelf}")`);

            // === Assertion 4: visual SVG capped (does not exceed viewport) ===
            if (m.svgRect) {
                if (m.svgRect.width <= 580) pass(`SVG width capped (${m.svgRect.width.toFixed(0)} <= 580)`);
                else fail(`SVG width too wide (${m.svgRect.width.toFixed(0)} > 580)`);
                if (m.svgRect.height <= 440) pass(`SVG height capped (${m.svgRect.height.toFixed(0)} <= 440)`);
                else fail(`SVG height too tall (${m.svgRect.height.toFixed(0)} > 440)`);
            }

            // === Assertion 5: zoom behavior matches expectation ===
            // Skip zoom assertions if scenario has no visual content at all
            // (e.g. ten-frame with empty q.visual — nothing to enlarge).
            const hasEnlargeable = !!m.svgRect;
            if (scen.clickIsAnswer) {
                if (hasEnlargeable) {
                    if (m.hasZoomIcon) pass('magnifier icon present (clickIsAnswer)');
                    else fail('magnifier icon missing for click-is-answer scenario');
                    if (m.hasZoomTriggerClass) fail('should NOT have zoom-trigger class on click-is-answer');
                    else pass('no auto-zoom click on click-is-answer');
                } else {
                    if (!m.hasZoomIcon && !m.hasZoomTriggerClass) pass('no zoom UI when nothing to enlarge');
                    else fail('zoom UI present despite no enlargeable content');
                }
            } else {
                if (hasEnlargeable) {
                    if (m.hasZoomTriggerClass) pass('zoom-trigger class present on non-interactive visual');
                    else fail('zoom-trigger class missing on non-interactive visual');
                    if (m.hasZoomIcon) fail('magnifier icon should NOT be present on auto-zoom visual');
                    else pass('no magnifier icon (auto-zoom uses whole-visual click)');
                }
            }

            // === Assertion 6: Open the modal and verify (skip if nothing to zoom) ===
            const shouldOpen = (scen.clickIsAnswer && m.hasZoomIcon) ||
                              (!scen.clickIsAnswer && m.hasZoomTriggerClass);
            if (shouldOpen) {
                if (scen.clickIsAnswer) {
                    await page.evaluate(() => {
                        const btn = document.querySelector('#visualAid .zoom-icon-btn');
                        if (btn) btn.click();
                    });
                } else {
                    await page.evaluate(() => {
                        const v = document.getElementById('visualAid');
                        if (v) v.click();
                    });
                }
                await new Promise(r => setTimeout(r, 300));
                const afterOpen = await page.evaluate(() => {
                    const o = document.querySelector('.zoom-overlay');
                    if (!o) return null;
                    const r2o = (rr) => rr ? { top: rr.top, left: rr.left, width: rr.width, height: rr.height } : null;
                    const r = o.getBoundingClientRect();
                    const c = o.querySelector('.zoom-content');
                    const cr = c ? c.getBoundingClientRect() : null;
                    return {
                        hasOverlay: true,
                        overlayInset: r2o(r),
                        contentRect: r2o(cr),
                        winW: window.innerWidth,
                        winH: window.innerHeight,
                    };
                });
                if (afterOpen && afterOpen.hasOverlay) {
                    pass('zoom overlay opens on click');
                    await shot(page, `zoom-modal-${scen.name}`);
                    if (afterOpen.contentRect) {
                        const cwOK = afterOpen.contentRect.width <= afterOpen.winW * 0.92 + 4;
                        const chOK = afterOpen.contentRect.height <= afterOpen.winH * 0.92 + 4;
                        if (cwOK && chOK) pass(`overlay content within 90vw x 90vh (${afterOpen.contentRect.width.toFixed(0)} x ${afterOpen.contentRect.height.toFixed(0)})`);
                        else fail(`overlay content exceeds 90% viewport (${afterOpen.contentRect.width.toFixed(0)} x ${afterOpen.contentRect.height.toFixed(0)})`);
                    }
                    await page.keyboard.press('Escape');
                    await new Promise(r => setTimeout(r, 200));
                    const afterEsc = await page.evaluate(() => !!document.querySelector('.zoom-overlay'));
                    if (!afterEsc) pass('Esc closes overlay');
                    else fail('Esc did not close overlay');
                } else {
                    fail('zoom overlay did not open on click');
                }

                // Re-open and click backdrop
                if (scen.clickIsAnswer) {
                    await page.evaluate(() => {
                        const btn = document.querySelector('#visualAid .zoom-icon-btn');
                        if (btn) btn.click();
                    });
                } else {
                    await page.evaluate(() => {
                        const v = document.getElementById('visualAid');
                        if (v) v.click();
                    });
                }
                await new Promise(r => setTimeout(r, 300));
                const reOpened = await page.evaluate(() => !!document.querySelector('.zoom-overlay'));
                if (reOpened) {
                    await page.evaluate(() => {
                        const o = document.querySelector('.zoom-overlay');
                        if (o) {
                            const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
                            o.dispatchEvent(evt);
                        }
                    });
                    await new Promise(r => setTimeout(r, 200));
                    const closedByBackdrop = await page.evaluate(() => !!document.querySelector('.zoom-overlay'));
                    if (!closedByBackdrop) pass('click outside (backdrop) closes overlay');
                    else fail('click outside did not close overlay');
                }
            }
        }

        // ====== VERDICT ======
        log('======== VERDICT ========');
        log(`fails = ${fails}`);
        if (fails > 0) exitCode = 2;
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
