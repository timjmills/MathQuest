// MAP MVP end-to-end smoke test
// Verifies the K-2 and 3-5 MAP flows actually work in a real browser.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-screenshots');

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleMessages = [];
const consoleErrors = [];
const pageErrors = [];

function log(...args) {
  console.log('[TEST]', ...args);
}

async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: file, fullPage: false });
    log('  📸', name + '.png');
  } catch (e) {
    log('  ⚠️ screenshot failed:', name, e.message);
  }
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const ok = await page.evaluate(fn);
      if (ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

async function runTier(page, tier, itemsToAnswer, label) {
  log(`--- ${label} flow start ---`);

  // Reset to home before tier flow
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 300));

  await shot(page, `01-home-${tier}`);

  // Open MAP test (programmatic — robust against button selector changes)
  await page.evaluate((t) => window.openMapTest(t), tier);

  // The user's openMapTest sets default bands+domains and shows mapSelectorView,
  // but does NOT call initMapSelector() (which actually renders the chips).
  // navigation.js showView('mapSelectorView') -> calls window.initMapSelector().
  // Wait for chips to render.
  await waitFor(page,
    () => document.getElementById('mapSelectorView')?.classList.contains('active'),
    5000, 'mapSelectorView active');

  // Wait for chips
  await waitFor(page,
    () => (document.querySelectorAll('#mapBandChips .rit-chip').length > 0
        && document.querySelectorAll('#mapDomainChips .domain-chip').length > 0),
    5000, 'chips rendered');

  const sel = await page.evaluate(() => ({
    bandChips: document.querySelectorAll('#mapBandChips .rit-chip').length,
    domainChips: document.querySelectorAll('#mapDomainChips .domain-chip').length,
    bandsSelected: document.querySelectorAll('#mapBandChips .rit-chip.selected').length,
    domainsSelected: document.querySelectorAll('#mapDomainChips .domain-chip.selected').length,
    stateBands: window.state.mapSelectedBands,
    stateDomains: window.state.mapSelectedDomains,
    tier: window.state.mapTier,
  }));
  log('  selector:', JSON.stringify(sel));

  if (sel.bandChips === 0) throw new Error(`${label}: no band chips rendered`);
  if (sel.domainChips !== 4) throw new Error(`${label}: expected 4 domain chips, got ${sel.domainChips}`);
  if (sel.bandsSelected < 1) throw new Error(`${label}: no bands selected by default`);
  if (sel.domainsSelected !== 4) throw new Error(`${label}: expected 4 domains selected by default`);

  await shot(page, `02-selector-${tier}`);

  // Force itemCount to the requested value to keep test fast
  await page.evaluate((n) => { window.state.mapItemCountTarget = n; }, itemsToAnswer);

  // Start session
  await page.evaluate(() => window.startMapFromUI());

  await waitFor(page,
    () => document.getElementById('mapSessionView')?.classList.contains('active'),
    5000, 'mapSessionView active');

  // Wait for question render
  await waitFor(page,
    () => {
      const qt = document.getElementById('questionText');
      return qt && qt.textContent && qt.textContent.trim().length > 0;
    },
    5000, 'first question rendered');

  const startRit = await page.evaluate(() => window.state.mapCurrentRit);
  log(`  starting RIT: ${startRit}, target items: ${itemsToAnswer}`);

  await shot(page, `03-session-start-${tier}`);

  const ritProgression = [startRit];
  let lastSeenItem = 0;

  for (let i = 0; i < itemsToAnswer; i++) {
    // Snapshot current question
    const itemInfo = await page.evaluate(() => ({
      itemCount: window.state.mapItemCount,
      qCount: window.state.qCount,
      currentRit: window.state.mapCurrentRit,
      skillId: window.state.currentQ ? window.state.currentQ._mapSkillId : null,
      domain: window.state.currentQ ? window.state.currentQ._mapDomain : null,
      questionText: document.getElementById('questionText')?.textContent?.slice(0, 80),
    }));
    log(`  item ${i + 1}: rit=${itemInfo.currentRit} skill=${itemInfo.skillId} domain=${itemInfo.domain} text="${itemInfo.questionText}"`);

    // Record an answer (alternate or all-correct based on label)
    // For RIT-progression check, do all-correct on K-2
    const correct = (label === 'K-2') ? true : (i % 2 === 0);
    await page.evaluate((c) => window.recordMapAnswer({ correct: c }), correct);

    // Engine has 350ms delay in simulation, 1100ms in practice
    // We're in 'practice' mode by default (set in openMapTest) — wait long enough
    await new Promise(r => setTimeout(r, 1400));

    const newCount = await page.evaluate(() => window.state.mapItemCount);
    if (newCount <= lastSeenItem && i > 0) {
      throw new Error(`${label}: item count did not advance after item ${i + 1} (still ${newCount})`);
    }
    lastSeenItem = newCount;

    const newRit = await page.evaluate(() => window.state.mapCurrentRit);
    ritProgression.push(newRit);

    if (i === Math.floor(itemsToAnswer / 2)) await shot(page, `04-mid-session-${tier}`);
  }

  // Wait for results view
  await waitFor(page,
    () => document.getElementById('mapResultsView')?.classList.contains('active'),
    8000, 'mapResultsView active');

  const results = await page.evaluate(() => ({
    finalRit: document.getElementById('mapFinalRit')?.textContent,
    finalSE: document.getElementById('mapFinalSE')?.textContent,
    domainCardCount: document.querySelectorAll('#mapPerDomain .rit-domain-card').length,
    lastMapResult: window.state.lastMapResult ? {
      finalRit: window.state.lastMapResult.finalRit,
      items: window.state.lastMapResult.items,
      perDomain: window.state.lastMapResult.perDomain,
    } : null,
  }));
  log(`  results: finalRit="${results.finalRit}" SE="${results.finalSE}" domainCards=${results.domainCardCount}`);
  log(`  lastMapResult:`, JSON.stringify(results.lastMapResult));
  log(`  RIT progression: [${ritProgression.join(', ')}]`);

  await shot(page, `05-results-${tier}`);

  // Validate
  if (!/^\d+$/.test(results.finalRit || '')) throw new Error(`${label}: finalRit not numeric: "${results.finalRit}"`);
  if (results.domainCardCount !== 4) throw new Error(`${label}: expected 4 domain cards, got ${results.domainCardCount}`);

  log(`--- ${label} flow PASS ---`);
  return { startRit, ritProgression, results };
}

(async () => {
  let browser;
  let exitCode = 0;
  try {
    log('launching puppeteer...');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') consoleErrors.push(text);
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.stack || String(err));
    });
    page.on('requestfailed', (req) => {
      consoleErrors.push(`[404/failed] ${req.url()} -> ${req.failure()?.errorText || 'unknown'}`);
    });
    page.on('response', (resp) => {
      if (resp.status() >= 400) {
        consoleErrors.push(`[HTTP ${resp.status()}] ${resp.url()}`);
      }
    });

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
      10000, 'window.state to exist');

    // Wired globals check
    const wired = await page.evaluate(() => ({
      openMapTest: typeof window.openMapTest === 'function',
      startMapSession: typeof window.startMapSession === 'function',
      toggleMapBand: typeof window.toggleMapBand === 'function',
      recordMapAnswer: typeof window.recordMapAnswer === 'function',
      renderMapResults: typeof window.renderMapResults === 'function',
      startMapFromUI: typeof window.startMapFromUI === 'function',
      initMapSelector: typeof window.initMapSelector === 'function',
    }));
    log('globals wired:', JSON.stringify(wired));
    for (const [k, v] of Object.entries(wired)) {
      if (!v) throw new Error(`Global not wired: window.${k}`);
    }

    const k2 = await runTier(page, 'k2', 5, 'K-2');
    const t35 = await runTier(page, '35', 3, '3-5');

    // Console / page error gate
    if (consoleErrors.length > 0) {
      log('!!! console errors:');
      consoleErrors.forEach(e => log('   ', e));
      exitCode = 2;
    }
    if (pageErrors.length > 0) {
      log('!!! page errors:');
      pageErrors.forEach(e => log('   ', e));
      exitCode = 3;
    }

    log('======== SUMMARY ========');
    log(`K-2 final RIT: ${k2.results.finalRit} (started ${k2.startRit}, all-correct, items=${k2.ritProgression.length - 1})`);
    log(`3-5 final RIT: ${t35.results.finalRit} (started ${t35.startRit}, alternating, items=${t35.ritProgression.length - 1})`);
    log(`console errors: ${consoleErrors.length}`);
    log(`page errors:    ${pageErrors.length}`);
    log(`screenshots:    ${SHOT_DIR}`);

    if (exitCode === 0) log('OVERALL: PASS');
    else log('OVERALL: FAIL');
  } catch (err) {
    log('!!! TEST CRASHED:', err.stack || err.message);
    exitCode = 1;
  } finally {
    if (browser) await browser.close();
    process.exit(exitCode);
  }
})();
