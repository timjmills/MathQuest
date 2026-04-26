// MAP Worksheet + Print smoke test
// Verifies (1) Worksheet mode routes to worksheetView with multiple problems,
// (2) Print as worksheet from MAP results opens the print dialog with skills,
// (3) Print this selection from MAP selector opens the print dialog with skills.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[TEST]', ...args); }

async function shot(page, name) {
  try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); log('  📸', name + '.png'); }
  catch (e) { log('  ⚠️ screenshot failed:', name, e.message); }
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await page.evaluate(fn)) return true; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

async function flowWorksheet(page, tier) {
  log(`--- Worksheet mode (${tier}) ---`);
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 250));

  await page.evaluate(t => window.openMapTest(t), tier);
  await waitFor(page,
    () => document.getElementById('mapSelectorView')?.classList.contains('active'),
    5000, 'mapSelectorView active');
  await waitFor(page,
    () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
    5000, 'chips');

  // Verify the new Worksheet mode button exists
  const hasWsBtn = await page.evaluate(() => !!document.getElementById('mapModeWorksheet'));
  if (!hasWsBtn) throw new Error(`${tier}: mapModeWorksheet button missing from selector`);

  // Verify the new Print-from-selector button exists
  const hasPrintSelectorBtn = await page.evaluate(() => !!document.getElementById('mapPrintBtn'));
  if (!hasPrintSelectorBtn) throw new Error(`${tier}: mapPrintBtn button missing from selector`);

  // Click the Worksheet mode button
  await page.evaluate(() => window.setMapMode('worksheet'));
  const modeOk = await page.evaluate(() => window.state.mapSessionMode === 'worksheet'
    && document.getElementById('mapModeWorksheet').classList.contains('selected'));
  if (!modeOk) throw new Error(`${tier}: setMapMode('worksheet') did not set state and class`);

  // Smaller item count for speed
  await page.evaluate(() => { window.state.mapItemCountTarget = 6; });

  await shot(page, `ws-01-selector-${tier}`);

  // Start: should route to worksheetView with multiple problems
  await page.evaluate(() => window.startMapFromUI());

  await waitFor(page,
    () => document.getElementById('worksheetView')?.classList.contains('active'),
    8000, 'worksheetView active');

  // Wait for problem cards to render
  await waitFor(page,
    () => document.querySelectorAll('#worksheetGrid .problem-card').length >= 2,
    10000, 'multiple problem cards');

  const wsInfo = await page.evaluate(() => ({
    cards: document.querySelectorAll('#worksheetGrid .problem-card').length,
    qsLen: Array.isArray(window.state.worksheetQs) ? window.state.worksheetQs.length : 0,
    queueLen: Array.isArray(window.skillQueue) ? window.skillQueue.length : 0,
    gameMode: window.state.gameMode,
    mapWorksheetActive: window.state.mapWorksheetActive,
    hasCheckBtn: !!document.querySelector('#worksheetView button[onclick*="checkAllWorksheet"]')
                  || !!document.querySelector('#worksheetView .check-btn')
                  || !!Array.from(document.querySelectorAll('#worksheetView button')).find(b => /check|submit/i.test(b.textContent || '')),
  }));
  log(`  worksheet: cards=${wsInfo.cards} qsLen=${wsInfo.qsLen} queueLen=${wsInfo.queueLen} gameMode=${wsInfo.gameMode} mapWorksheetActive=${wsInfo.mapWorksheetActive} hasCheckBtn=${wsInfo.hasCheckBtn}`);

  if (wsInfo.cards < 2) throw new Error(`${tier}: only ${wsInfo.cards} worksheet cards rendered`);
  if (wsInfo.gameMode !== 'worksheet') throw new Error(`${tier}: gameMode is ${wsInfo.gameMode}, not 'worksheet'`);
  if (wsInfo.queueLen < 1) throw new Error(`${tier}: skillQueue is empty (length ${wsInfo.queueLen})`);
  await shot(page, `ws-02-worksheet-${tier}`);
  log(`  ✓ Worksheet mode (${tier}) PASS`);
}

async function flowPrintFromSelector(page, tier) {
  log(`--- Print-from-selector (${tier}) ---`);
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 250));

  await page.evaluate(t => window.openMapTest(t), tier);
  await waitFor(page,
    () => document.getElementById('mapSelectorView')?.classList.contains('active'),
    5000, 'mapSelectorView active');
  await waitFor(page,
    () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
    5000, 'chips');

  // Click the print-from-selector button
  await page.evaluate(() => window.printMapFromSelector());

  // Wait for print modal
  await waitFor(page,
    () => {
      const m = document.getElementById('simplePrintModal');
      return m && m.style.display !== 'none' && m.querySelector('#printSectionsContainer');
    },
    8000, 'simplePrintModal opened');

  // Allow the post-open setTimeout to apply MAP Practice label/count
  await new Promise(r => setTimeout(r, 200));

  const dlg = await page.evaluate(() => ({
    sections: Array.isArray(window.printSections) ? window.printSections.length : 0,
    skillsInSec: window.printSections && window.printSections[0] ? window.printSections[0].skills.length : 0,
    label: window.printSections && window.printSections[0] ? window.printSections[0].label : null,
    problemCount: window.printSections && window.printSections[0] ? window.printSections[0].problemCount : null,
    skillNames: window.printSections && window.printSections[0]
      ? window.printSections[0].skills.slice(0, 5).map(s => s.skillId)
      : [],
  }));
  log(`  print dialog: sections=${dlg.sections} skills=${dlg.skillsInSec} label="${dlg.label}" problemCount=${dlg.problemCount}`);
  log(`  first skills: ${dlg.skillNames.join(', ')}`);

  if (dlg.sections === 0) throw new Error(`${tier}: no print sections built`);
  if (dlg.skillsInSec === 0) throw new Error(`${tier}: print section has no skills`);
  await shot(page, `print-selector-${tier}`);

  // Close it
  await page.evaluate(() => window.closeSimplePrintModal());
  log(`  ✓ Print-from-selector (${tier}) PASS`);
}

async function flowPrintFromResults(page, tier) {
  log(`--- Print-from-results (${tier}) ---`);
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 250));

  // Run a tiny adaptive practice session: 2 items
  await page.evaluate(t => window.openMapTest(t), tier);
  await waitFor(page,
    () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
    5000, 'chips');
  await page.evaluate(() => window.setMapMode('practice'));
  await page.evaluate(() => { window.state.mapItemCountTarget = 2; });
  await page.evaluate(() => window.startMapFromUI());

  await waitFor(page,
    () => document.getElementById('mapSessionView')?.classList.contains('active'),
    5000, 'mapSessionView active');
  await waitFor(page,
    () => document.getElementById('questionText')?.textContent?.trim().length > 0,
    5000, 'first q');

  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.recordMapAnswer({ correct: true }));
    await new Promise(r => setTimeout(r, 1300));
  }

  await waitFor(page,
    () => document.getElementById('mapResultsView')?.classList.contains('active'),
    8000, 'mapResultsView active');

  // Now click the existing "Print as worksheet" button
  await page.evaluate(() => window.printMapSession());

  await waitFor(page,
    () => {
      const m = document.getElementById('simplePrintModal');
      return m && m.style.display !== 'none' && m.querySelector('#printSectionsContainer');
    },
    8000, 'simplePrintModal opened');

  await new Promise(r => setTimeout(r, 200));

  const dlg = await page.evaluate(() => ({
    sections: Array.isArray(window.printSections) ? window.printSections.length : 0,
    skillsInSec: window.printSections && window.printSections[0] ? window.printSections[0].skills.length : 0,
    label: window.printSections && window.printSections[0] ? window.printSections[0].label : null,
  }));
  log(`  results print: sections=${dlg.sections} skills=${dlg.skillsInSec} label="${dlg.label}"`);
  if (dlg.skillsInSec === 0) throw new Error(`${tier}: results print has no skills`);
  await shot(page, `print-results-${tier}`);

  await page.evaluate(() => window.closeSimplePrintModal());
  log(`  ✓ Print-from-results (${tier}) PASS`);
}

(async () => {
  let browser, exitCode = 0;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${m.type()}] ${m.text()}`); });
    page.on('pageerror', e => pageErrors.push(e.stack || String(e)));
    page.on('requestfailed', req => consoleErrors.push(`[reqfail] ${req.url()} -> ${req.failure()?.errorText}`));
    page.on('response', resp => { if (resp.status() >= 400) consoleErrors.push(`[HTTP ${resp.status()}] ${resp.url()}`); });

    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object', 10000, 'state');

    // Globals wired
    const wired = await page.evaluate(() => ({
      printMapFromSelector: typeof window.printMapFromSelector === 'function',
      printMapSkillsAsWorksheet: typeof window.printMapSkillsAsWorksheet === 'function',
      setMapMode: typeof window.setMapMode === 'function',
    }));
    log('globals wired:', JSON.stringify(wired));
    for (const [k, v] of Object.entries(wired)) {
      if (!v) throw new Error(`Global not wired: window.${k}`);
    }

    await flowWorksheet(page, 'k2');
    await flowPrintFromSelector(page, '35');
    await flowPrintFromResults(page, '35');

    // Filter out pre-existing favicon noise (and the generic "Failed to load
    // resource: 404" companion to the favicon network failure).
    const realErrors = consoleErrors.filter(e =>
      !/favicon\.ico/.test(e) &&
      !/Failed to load resource: the server responded with a status of 404/.test(e)
    );
    if (realErrors.length) {
      log('!!! console errors:'); realErrors.forEach(e => log('   ', e));
      exitCode = 2;
    }
    if (pageErrors.length) {
      log('!!! page errors:'); pageErrors.forEach(e => log('   ', e));
      exitCode = 3;
    }

    log('======== SUMMARY ========');
    log(`console errors (non-favicon): ${realErrors.length}`);
    log(`page errors: ${pageErrors.length}`);
    if (exitCode === 0) log('OVERALL: PASS'); else log('OVERALL: FAIL');
  } catch (err) {
    log('!!! TEST CRASHED:', err.stack || err.message);
    exitCode = 1;
  } finally {
    if (browser) await browser.close();
    process.exit(exitCode);
  }
})();
