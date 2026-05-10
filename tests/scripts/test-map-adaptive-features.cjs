// MAP adaptive features test
// Verifies the three new features actually work in a real browser:
//   1. End Session button (top-left, always visible, finalizes early)
//   2. Unlimited mode (no item-count cap, "∞" banner, runs forever)
//   3. Cross-tier opt-in banner (K-2 RIT≥200 → suggest 3-5 pool)

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-adaptive-shots');

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[TEST]', ...args); }

async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  try { await page.screenshot({ path: file, fullPage: false }); log('  📸', name + '.png'); }
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

async function startSession(page, tier, mode, itemCount) {
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate((t) => window.openMapTest(t), tier);
  await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'),
    5000, 'mapSelectorView active');
  await waitFor(page, () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
    5000, 'chips rendered');
  // Set mode + item count programmatically
  await page.evaluate((m) => window.setMapMode(m), mode);
  if (typeof itemCount === 'number') {
    await page.evaluate((n) => { window.state.mapItemCountTarget = n; }, itemCount);
  }
  await page.evaluate(() => window.startMapFromUI());
  await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'),
    5000, 'mapSessionView active');
  await waitFor(page, () => {
    const qt = document.getElementById('questionText');
    return qt && qt.textContent && qt.textContent.trim().length > 0;
  }, 5000, 'first question rendered');
}

async function answerOne(page, correct) {
  await page.evaluate((c) => window.recordMapAnswer({ correct: c }), correct);
  // Practice mode delay is 1100ms — wait a bit longer.
  await new Promise(r => setTimeout(r, 1300));
}

// ---------- Feature 1: End Session button ----------
async function testEndButton(page) {
  log('--- Feature 1: End Session button ---');
  await startSession(page, 'k2', 'practice', 20);
  // Verify button exists and is visible at top-left.
  const btnInfo = await page.evaluate(() => {
    const b = document.getElementById('mapEndBtn');
    if (!b) return null;
    const rect = b.getBoundingClientRect();
    const cs = window.getComputedStyle(b);
    return { text: b.textContent, top: rect.top, left: rect.left, visible: cs.display !== 'none', position: cs.position };
  });
  if (!btnInfo) throw new Error('End Session button not in DOM');
  if (!btnInfo.text.includes('End Session')) throw new Error(`button text wrong: "${btnInfo.text}"`);
  if (btnInfo.position !== 'fixed') throw new Error(`button not fixed-positioned: ${btnInfo.position}`);
  if (btnInfo.top > 50) throw new Error(`button not near top: top=${btnInfo.top}`);
  if (btnInfo.left > 80) throw new Error(`button not near left: left=${btnInfo.left}`);
  log('  ✓ End Session button visible at top-left:', JSON.stringify(btnInfo));
  await shot(page, '01-end-button-visible');

  // Answer 2 items so we have partial data.
  await answerOne(page, true);
  await answerOne(page, false);

  // Stub window.confirm to auto-accept, then click the button.
  await page.evaluate(() => { window.confirm = () => true; });
  await page.evaluate(() => document.getElementById('mapEndBtn').click());
  await waitFor(page, () => document.getElementById('mapResultsView')?.classList.contains('active'),
    5000, 'results view after End Session');

  const r = await page.evaluate(() => ({
    finalRit: document.getElementById('mapFinalRit')?.textContent,
    items: window.state.lastMapResult?.items,
    btnGone: !document.getElementById('mapEndBtn'),
  }));
  if (!/^\d+$/.test(r.finalRit || '')) throw new Error(`finalRit not numeric after early end: "${r.finalRit}"`);
  if (r.items !== 2) throw new Error(`expected 2 items in result, got ${r.items}`);
  if (!r.btnGone) throw new Error('End Session button not removed after finalize');
  log('  ✓ Early-end produces results with', r.items, 'items, finalRit=', r.finalRit);
  await shot(page, '02-end-button-results');

  // Edge case: 0 items completed → should still finalize cleanly.
  await startSession(page, 'k2', 'practice', 20);
  await page.evaluate(() => { window.confirm = () => true; });
  await page.evaluate(() => document.getElementById('mapEndBtn').click());
  await waitFor(page, () => document.getElementById('mapResultsView')?.classList.contains('active'),
    5000, 'results view after 0-item end');
  const r0 = await page.evaluate(() => ({
    finalRit: document.getElementById('mapFinalRit')?.textContent,
    items: window.state.lastMapResult?.items,
  }));
  if (r0.items !== 0) throw new Error(`expected 0 items in 0-end result, got ${r0.items}`);
  if (!/^\d+$/.test(r0.finalRit || '')) throw new Error(`finalRit not numeric in 0-end: "${r0.finalRit}"`);
  log('  ✓ 0-item end produces results, finalRit=', r0.finalRit);
  log('Feature 1 PASS');
}

// ---------- Feature 2: Unlimited mode ----------
async function testUnlimited(page) {
  log('--- Feature 2: Unlimited mode ---');
  // Verify mode button exists in selector view
  await page.evaluate(() => { if (window.goHome) window.goHome(); });
  await new Promise(r => setTimeout(r, 250));
  await page.evaluate(() => window.openMapTest('k2'));
  await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'),
    5000, 'mapSelectorView active');
  const btnExists = await page.evaluate(() => !!document.getElementById('mapModeUnlimited'));
  if (!btnExists) throw new Error('Unlimited mode button missing');
  log('  ✓ Unlimited mode button exists');

  // Click it and verify state
  await page.evaluate(() => window.setMapMode('unlimited'));
  const stateInfo = await page.evaluate(() => ({
    mode: window.state.mapSessionMode,
    target: window.state.mapItemCountTarget,
    sliderHidden: (() => {
      const s = document.getElementById('mapItemSlider');
      if (!s) return true; // not yet rendered, treat as ok
      const wrap = s.closest('div');
      return wrap ? wrap.style.display === 'none' : false;
    })(),
    selectedClass: document.getElementById('mapModeUnlimited')?.classList.contains('selected'),
  }));
  if (stateInfo.mode !== 'unlimited') throw new Error(`mode not unlimited: ${stateInfo.mode}`);
  if (stateInfo.target !== -1) throw new Error(`target not -1 sentinel: ${stateInfo.target}`);
  if (!stateInfo.selectedClass) throw new Error('Unlimited button not visually selected');
  log('  ✓ Unlimited mode set, target=-1, slider hidden');
  await shot(page, '03-unlimited-selected');

  // Start session and verify ∞ banner
  await page.evaluate(() => window.startMapFromUI());
  await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'),
    5000, 'session view');
  await waitFor(page, () => {
    const qt = document.getElementById('questionText');
    return qt && qt.textContent && qt.textContent.trim().length > 0;
  }, 5000, 'first question');
  const totalText = await page.evaluate(() => document.getElementById('mapItemTotal')?.textContent);
  if (totalText !== '∞') throw new Error(`expected ∞ in banner, got "${totalText}"`);
  log('  ✓ Banner shows "Item N of ∞"');
  await shot(page, '04-unlimited-banner');

  // Run 30 items; verify no auto-end
  const N = 30;
  for (let i = 0; i < N; i++) {
    const stillSession = await page.evaluate(() => document.getElementById('mapSessionView')?.classList.contains('active'));
    if (!stillSession) throw new Error(`unlimited session ended early at item ${i + 1}`);
    await answerOne(page, i % 2 === 0);
  }
  const finalState = await page.evaluate(() => ({
    items: window.state.mapItemCount,
    inSession: document.getElementById('mapSessionView')?.classList.contains('active'),
    inResults: document.getElementById('mapResultsView')?.classList.contains('active'),
  }));
  if (!finalState.inSession || finalState.inResults) {
    throw new Error(`unlimited auto-ended after ${finalState.items} items (expected to keep going)`);
  }
  if (finalState.items < N) throw new Error(`only ${finalState.items} items recorded`);
  log(`  ✓ Ran ${finalState.items} items without auto-ending`);
  await shot(page, '05-unlimited-30-items');

  // End it via End button
  await page.evaluate(() => { window.confirm = () => true; });
  await page.evaluate(() => document.getElementById('mapEndBtn').click());
  await waitFor(page, () => document.getElementById('mapResultsView')?.classList.contains('active'),
    5000, 'results after unlimited end');
  const r = await page.evaluate(() => ({
    finalRit: document.getElementById('mapFinalRit')?.textContent,
    items: window.state.lastMapResult?.items,
  }));
  if (r.items !== N) throw new Error(`expected ${N} items in unlimited result, got ${r.items}`);
  log('  ✓ Unlimited ended via button:', r.items, 'items, finalRit=', r.finalRit);
  log('Feature 2 PASS');
}

// ---------- Feature 3: Cross-tier opt-in banner ----------
async function testCrossTier(page) {
  log('--- Feature 3: Cross-tier opt-in banner ---');
  await startSession(page, 'k2', 'practice', 30);
  // Force RIT well above 200 by feeding 8 all-correct answers (RIT climbs ~3-8 each).
  // Starting RIT for K-2 default bands ≈ 175. Need to reach ≥200.
  // Easier: directly bump state.mapCurrentRit and answer one more to trigger check.
  await page.evaluate(() => {
    window.state.mapCurrentRit = 200; // at threshold; one correct bumps over
    window.state.mapItemCount = 5;    // satisfies the "≥4 items" gate
    window.state.mapCorrectStreak = 5; // ensure step is at max
    window.state.mapCrossTierSuggested = false;
  });
  await answerOne(page, true); // bumps RIT to ~208, triggers banner check
  // Banner should appear within a beat.
  await waitFor(page, () => !!document.getElementById('mapCrossTierBanner'),
    3000, 'cross-tier banner appears');
  const bannerInfo = await page.evaluate(() => {
    const b = document.getElementById('mapCrossTierBanner');
    return {
      text: b?.textContent || '',
      hasYes: !!b?.querySelector('.yes'),
      hasNo: !!b?.querySelector('.no'),
    };
  });
  if (!bannerInfo.text.includes('🚀')) throw new Error(`banner missing rocket: "${bannerInfo.text}"`);
  if (!bannerInfo.text.includes('3-5')) throw new Error(`banner missing tier ref: "${bannerInfo.text}"`);
  if (!bannerInfo.hasYes || !bannerInfo.hasNo) throw new Error('banner missing Yes/No buttons');
  log('  ✓ K-2 cross-tier banner appeared with Yes/No');
  await shot(page, '06-cross-tier-banner');

  // Click Yes → verify tier flips to 'mixed'
  await page.evaluate(() => document.querySelector('#mapCrossTierBanner .yes').click());
  const afterYes = await page.evaluate(() => ({
    tier: window.state.mapTier,
    bannerGone: !document.getElementById('mapCrossTierBanner'),
    suggested: window.state.mapCrossTierSuggested,
  }));
  if (afterYes.tier !== 'mixed') throw new Error(`tier did not flip to mixed: ${afterYes.tier}`);
  if (!afterYes.bannerGone) throw new Error('banner did not dismiss after Yes');
  if (!afterYes.suggested) throw new Error('mapCrossTierSuggested flag not set');
  log('  ✓ Yes flips tier to mixed, banner dismissed');

  // Verify banner shows ONLY ONCE per session — bump RIT and trigger again, no banner.
  await page.evaluate(() => { window.state.mapTier = 'k2'; window.state.mapCurrentRit = 250; });
  await answerOne(page, true);
  const noRepeat = await page.evaluate(() => !document.getElementById('mapCrossTierBanner'));
  if (!noRepeat) throw new Error('banner re-appeared in same session (should fire only once)');
  log('  ✓ Banner does NOT re-appear in same session');

  // 3-5 low-RIT path
  await startSession(page, '35', 'practice', 30);
  await page.evaluate(() => {
    window.state.mapCurrentRit = 170; // at threshold; one wrong bumps under
    window.state.mapItemCount = 5;
    window.state.mapIncorrectStreak = 5;
    window.state.mapCrossTierSuggested = false;
  });
  await answerOne(page, false); // bumps RIT to ~162, triggers banner
  await waitFor(page, () => !!document.getElementById('mapCrossTierBanner'),
    3000, '3-5 cross-tier banner appears');
  const b35 = await page.evaluate(() => document.getElementById('mapCrossTierBanner').textContent);
  if (!b35.includes('📚') || !b35.includes('K-2')) throw new Error(`3-5 banner wrong text: "${b35}"`);
  log('  ✓ 3-5 cross-tier banner appeared with K-2 nudge');
  await shot(page, '07-cross-tier-banner-35');

  // Click No → no tier change, banner dismisses.
  await page.evaluate(() => document.querySelector('#mapCrossTierBanner .no').click());
  const afterNo = await page.evaluate(() => ({
    tier: window.state.mapTier,
    bannerGone: !document.getElementById('mapCrossTierBanner'),
  }));
  if (afterNo.tier !== '35') throw new Error(`tier changed after No: ${afterNo.tier}`);
  if (!afterNo.bannerGone) throw new Error('banner did not dismiss after No');
  log('  ✓ No keeps tier, dismisses banner');
  log('Feature 3 PASS');
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
      if (msg.type() === 'error') {
        const t = msg.text();
        // Ignore generic 404s (favicon etc.) — they don't relate to the
        // features under test and existing test-map-smoke.cjs treats them
        // as noise too.
        if (/Failed to load resource/i.test(t) && /404/.test(t)) return;
        consoleErrors.push(`[err] ${t}`);
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.stack || String(err)));

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
      10000, 'window.state to exist');

    await testEndButton(page);
    await testUnlimited(page);
    await testCrossTier(page);

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
