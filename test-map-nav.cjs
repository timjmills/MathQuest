// MAP question navigator end-to-end test.
// Verifies the colored dot strip + back/forward arrows + click-to-jump
// review flow added on top of the adaptive engine.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-map-nav-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[NAV-TEST]', ...args); }

async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  try { await page.screenshot({ path: file, fullPage: false }); log('  shot', name); }
  catch (e) { log('  shot fail', name, e.message); }
}

async function waitFor(page, fn, timeout, label) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await page.evaluate(fn)) return true; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

(async () => {
  let browser;
  let exit = 0;
  try {
    log('launching browser...');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => pageErrors.push(e.stack || String(e)));

    log('navigate', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object', 10000, 'state ready');

    // Verify the new globals are wired
    const wired = await page.evaluate(() => ({
      mapJumpToItem: typeof window.mapJumpToItem === 'function',
      mapResumeCurrent: typeof window.mapResumeCurrent === 'function',
      mapNavBack: typeof window.mapNavBack === 'function',
      mapNavForward: typeof window.mapNavForward === 'function',
    }));
    log('globals wired:', JSON.stringify(wired));
    for (const [k, v] of Object.entries(wired)) {
      if (!v) throw new Error(`Global not wired: window.${k}`);
    }

    // Open MAP K-2 selector
    await page.evaluate(() => window.openMapTest('k2'));
    await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'),
      5000, 'mapSelectorView active');

    // Force target to 6 items
    await page.evaluate(() => { window.state.mapItemCountTarget = 6; });

    // Start session
    await page.evaluate(() => window.startMapFromUI());
    await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'),
      5000, 'mapSessionView active');

    // Wait for question render + nav bar
    await waitFor(page, () => document.querySelectorAll('#mapNavDots .map-nav-dot').length === 6,
      5000, 'nav bar rendered with 6 dots');

    // Snapshot initial state
    const init = await page.evaluate(() => ({
      dotCount: document.querySelectorAll('#mapNavDots .map-nav-dot').length,
      currentIdx: Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'))
        .findIndex(d => d.classList.contains('current')),
      backDisabled: document.getElementById('mapNavBack').disabled,
      forwardDisabled: document.getElementById('mapNavForward').disabled,
      itemCount: window.state.mapItemCount,
      reviewing: window.state.mapReviewingIndex,
    }));
    log('initial:', JSON.stringify(init));
    if (init.dotCount !== 6) throw new Error(`expected 6 dots, got ${init.dotCount}`);
    if (init.currentIdx !== 0) throw new Error(`expected current dot at 0, got ${init.currentIdx}`);
    if (!init.backDisabled) throw new Error('back arrow should be disabled at item 0');
    if (!init.forwardDisabled) throw new Error('forward arrow should be disabled at item 0');
    await shot(page, '01-initial');

    // Answer 3 items: correct, wrong, correct
    const pattern = [true, false, true];
    for (let i = 0; i < pattern.length; i++) {
      await page.evaluate((c) => window.recordMapAnswer({ correct: c }), pattern[i]);
      // Engine has 1100ms delay in practice mode
      await new Promise(r => setTimeout(r, 1400));
    }

    // Should now be on item 4 (index 3); items 0..2 colored
    const after3 = await page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'));
      return {
        dotCount: dots.length,
        classes: dots.map(d => d.className),
        currentIdx: dots.findIndex(d => d.classList.contains('current')),
        itemCount: window.state.mapItemCount,
        history: window.state.mapHistory.map(h => ({ correct: h.correct, skill: h.skillId })),
        backDisabled: document.getElementById('mapNavBack').disabled,
        forwardDisabled: document.getElementById('mapNavForward').disabled,
      };
    });
    log('after 3 answers:', JSON.stringify(after3, null, 2));
    if (after3.itemCount !== 3) throw new Error(`expected itemCount=3, got ${after3.itemCount}`);
    if (after3.currentIdx !== 3) throw new Error(`expected current at idx 3, got ${after3.currentIdx}`);
    // Dot 0: correct, Dot 1: wrong, Dot 2: correct, Dot 3: current+unanswered
    if (!after3.classes[0].includes('correct')) throw new Error(`dot 0 should be correct: "${after3.classes[0]}"`);
    if (!after3.classes[1].includes('wrong')) throw new Error(`dot 1 should be wrong: "${after3.classes[1]}"`);
    if (!after3.classes[2].includes('correct')) throw new Error(`dot 2 should be correct: "${after3.classes[2]}"`);
    if (!after3.classes[3].includes('current')) throw new Error(`dot 3 should be current: "${after3.classes[3]}"`);
    if (!after3.classes[3].includes('unanswered')) throw new Error(`dot 3 should be unanswered: "${after3.classes[3]}"`);
    if (!after3.classes[4].includes('unanswered')) throw new Error(`dot 4 should be unanswered: "${after3.classes[4]}"`);
    if (!after3.classes[5].includes('unanswered')) throw new Error(`dot 5 should be unanswered: "${after3.classes[5]}"`);
    if (after3.backDisabled) throw new Error('back arrow should be enabled at item 3');
    if (!after3.forwardDisabled) throw new Error('forward arrow should be disabled (we ARE at current)');
    await shot(page, '02-after-3-answers');

    // Click dot for item 1 (index 0) -> review mode
    await page.evaluate(() => window.mapJumpToItem(0));
    await new Promise(r => setTimeout(r, 200));

    const review = await page.evaluate(() => {
      const banner = document.getElementById('mapReviewBanner');
      // NEW behavior (per user spec): clicking a navigator dot re-renders
      // the original question (interactive again) so the student can retry
      // — does NOT show a "✗ Wrong / RIT 190 → 187" verdict card.
      const liveCard = document.getElementById('questionCard');
      const qText = document.getElementById('questionText');
      const dots = Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'));
      return {
        bannerVisible: banner && banner.style.display !== 'none' && getComputedStyle(banner).display !== 'none',
        bannerHTML: banner ? banner.innerHTML.slice(0, 80) : null,
        // The question card stays VISIBLE in re-attempt mode (not hidden).
        liveCardVisible: liveCard && liveCard.style.display !== 'none',
        // The question text re-rendered from history.
        qTextHasContent: qText && (qText.textContent || '').trim().length > 0,
        // Re-attempt mode: state.currentQ is now the historical question with _isMapReview flag.
        currentQIsReview: !!(window.state.currentQ && window.state.currentQ._isMapReview),
        currentIdx: dots.findIndex(d => d.classList.contains('current')),
        reviewingIndex: window.state.mapReviewingIndex,
        navOpen: window.state.mapNavigationOpen,
        backDisabled: document.getElementById('mapNavBack').disabled,
        forwardDisabled: document.getElementById('mapNavForward').disabled,
      };
    });
    log('review (item 0):', JSON.stringify(review, null, 2));
    if (!review.bannerVisible) throw new Error('review banner should be visible');
    if (!review.liveCardVisible) throw new Error('live questionCard should be VISIBLE in re-attempt mode');
    if (!review.qTextHasContent) throw new Error('question text should be re-rendered from history');
    if (!review.currentQIsReview) throw new Error('state.currentQ should be flagged _isMapReview');
    if (review.currentIdx !== 0) throw new Error(`expected current dot at 0 in review, got ${review.currentIdx}`);
    if (review.reviewingIndex !== 0) throw new Error('state.mapReviewingIndex should be 0');
    if (!review.navOpen) throw new Error('state.mapNavigationOpen should be true');
    if (review.backDisabled !== true) throw new Error('back arrow should be disabled at idx 0');
    if (review.forwardDisabled !== false) throw new Error('forward arrow should be enabled in review');
    await shot(page, '03-reviewing-item-1');

    // Click "Resume current question"
    await page.evaluate(() => window.mapResumeCurrent());
    await new Promise(r => setTimeout(r, 200));

    const resumed = await page.evaluate(() => {
      const banner = document.getElementById('mapReviewBanner');
      const card = document.getElementById('mapReviewCard');
      const liveCard = document.getElementById('questionCard');
      const dots = Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'));
      return {
        bannerHidden: !banner || banner.style.display === 'none',
        reviewCardGone: !card,
        liveCardVisible: liveCard && liveCard.style.display !== 'none',
        currentIdx: dots.findIndex(d => d.classList.contains('current')),
        reviewingIndex: window.state.mapReviewingIndex,
        navOpen: window.state.mapNavigationOpen,
      };
    });
    log('resumed:', JSON.stringify(resumed));
    if (!resumed.bannerHidden) throw new Error('banner should be hidden after resume');
    if (!resumed.reviewCardGone) throw new Error('review card should be removed after resume');
    if (!resumed.liveCardVisible) throw new Error('live card should be visible after resume');
    if (resumed.currentIdx !== 3) throw new Error(`expected current at 3 after resume, got ${resumed.currentIdx}`);
    if (resumed.reviewingIndex !== -1) throw new Error('reviewingIndex should be -1');
    if (resumed.navOpen) throw new Error('navOpen should be false');
    await shot(page, '04-resumed');

    // Test back arrow: should jump to item index 2 (current=3 -> back to 2)
    await page.evaluate(() => window.mapNavBack());
    await new Promise(r => setTimeout(r, 200));
    const back1 = await page.evaluate(() => ({
      reviewingIndex: window.state.mapReviewingIndex,
      currentIdx: Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'))
        .findIndex(d => d.classList.contains('current')),
      // NEW behavior: re-attempt mode renders the original question (no
      // verdict card). Validate via _isMapReview flag instead.
      currentQIsReview: !!(window.state.currentQ && window.state.currentQ._isMapReview),
    }));
    log('after back:', JSON.stringify(back1));
    if (back1.reviewingIndex !== 2) throw new Error(`expected reviewingIndex=2, got ${back1.reviewingIndex}`);
    if (back1.currentIdx !== 2) throw new Error(`expected current at 2, got ${back1.currentIdx}`);
    if (!back1.currentQIsReview) throw new Error('currentQ should be flagged _isMapReview after back');
    await shot(page, '05-back-to-2');

    // Test forward arrow: 2 -> 3 (live current)
    await page.evaluate(() => window.mapNavForward());
    await new Promise(r => setTimeout(r, 200));
    const fwd1 = await page.evaluate(() => ({
      reviewingIndex: window.state.mapReviewingIndex,
      currentIdx: Array.from(document.querySelectorAll('#mapNavDots .map-nav-dot'))
        .findIndex(d => d.classList.contains('current')),
      bannerVisible: (() => { const b = document.getElementById('mapReviewBanner'); return b && b.style.display !== 'none'; })(),
      liveCardVisible: (() => { const c = document.getElementById('questionCard'); return c && c.style.display !== 'none'; })(),
    }));
    log('after forward:', JSON.stringify(fwd1));
    if (fwd1.reviewingIndex !== -1) throw new Error(`forward from last answered should resume current; got reviewingIndex=${fwd1.reviewingIndex}`);
    if (fwd1.currentIdx !== 3) throw new Error(`expected current at 3 after forward+resume, got ${fwd1.currentIdx}`);
    if (fwd1.bannerVisible) throw new Error('banner should be hidden after forward to current');
    if (!fwd1.liveCardVisible) throw new Error('live card should be visible after forward to current');
    await shot(page, '06-forward-to-current');

    // Try jumping to an unanswered item (should be ignored)
    await page.evaluate(() => window.mapJumpToItem(5));
    await new Promise(r => setTimeout(r, 100));
    const noJump = await page.evaluate(() => window.state.mapReviewingIndex);
    if (noJump !== -1) throw new Error(`should NOT jump to unanswered; reviewingIndex=${noJump}`);
    log('jump-to-unanswered correctly ignored');

    // Console / page error gate
    if (consoleErrors.length > 0) {
      log('!!! console errors:');
      consoleErrors.forEach(e => log('  ', e));
      exit = 2;
    }
    if (pageErrors.length > 0) {
      log('!!! page errors:');
      pageErrors.forEach(e => log('  ', e));
      exit = 3;
    }

    if (exit === 0) log('OVERALL: PASS');
    else log('OVERALL: FAIL');
  } catch (err) {
    log('!!! TEST CRASHED:', err.stack || err.message);
    exit = 1;
  } finally {
    if (browser) await browser.close();
    process.exit(exit);
  }
})();
