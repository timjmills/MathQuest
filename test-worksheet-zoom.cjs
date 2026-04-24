// Worksheet zoom probe
// Verifies (1) magnifier icon is invisible by default on each card,
// (2) becomes visible on hover of the parent card, (3) clicking the card's
// visual area opens the .zoom-overlay, (4) closing the overlay removes it.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-worksheet-zoom-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[ZOOM]', ...args); }
async function shot(page, name) {
  try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); log('  shot', name + '.png'); }
  catch (e) { log('  shot failed:', name, e.message); }
}
async function waitFor(page, fn, timeout = 10000, label = 'condition') {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await page.evaluate(fn)) return true; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout waiting for ${label}`);
}

(async () => {
  let browser, exitCode = 0;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${m.type()}] ${m.text()}`); });
    page.on('pageerror', e => pageErrors.push(e.stack || String(e)));

    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object', 10000, 'state');

    // Force teacher role so worksheet mode is reachable.
    await page.evaluate(() => {
      if (typeof window.setUserRole === 'function') window.setUserRole('teacher');
    });
    await new Promise(r => setTimeout(r, 200));

    // Drive a worksheet via the MAP worksheet path (already known to work
    // from test-map-worksheet-print.cjs). Use a skill-rich tier with a
    // moderate item count so we get >=3 cards.
    await page.evaluate(() => window.openMapTest('35'));
    await waitFor(page,
      () => document.getElementById('mapSelectorView')?.classList.contains('active'),
      6000, 'mapSelectorView active');
    await waitFor(page,
      () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
      6000, 'chips');
    await page.evaluate(() => window.setMapMode('worksheet'));
    await page.evaluate(() => { window.state.mapItemCountTarget = 8; });
    await page.evaluate(() => window.startMapFromUI());

    await waitFor(page,
      () => document.getElementById('worksheetView')?.classList.contains('active'),
      10000, 'worksheetView active');
    await waitFor(page,
      () => document.querySelectorAll('#worksheetGrid .problem-card').length >= 3,
      15000, 'at least 3 problem cards');

    // Give layout/CSS a tick to settle (transitions, etc.)
    await new Promise(r => setTimeout(r, 500));
    await shot(page, '01-worksheet-rendered');

    // === Part A: magnifier icon hidden by default ===
    // Find a card that has a magnify button at all (.ws-magnify-btn is only
    // injected for visual cards). If none has one, the test still validates
    // .zoom-icon-btn (none should be visible).
    const visualBtnAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#worksheetGrid .problem-card'));
      const out = { totalCards: cards.length, withMagnifyBtn: 0, magnifyOpacities: [], zoomIconCount: 0 };
      cards.forEach(c => {
        const btn = c.querySelector('.ws-magnify-btn');
        if (btn) {
          out.withMagnifyBtn++;
          const cs = window.getComputedStyle(btn);
          out.magnifyOpacities.push(parseFloat(cs.opacity));
        }
        out.zoomIconCount += c.querySelectorAll('.zoom-icon-btn').length;
      });
      return out;
    });
    log('  audit:', JSON.stringify(visualBtnAudit));

    // Every magnify button should be invisible (opacity 0) before hover.
    const allHiddenInitially = visualBtnAudit.magnifyOpacities.every(o => o === 0);
    if (!allHiddenInitially) {
      throw new Error(`Magnify buttons NOT hidden by default. Opacities: ${JSON.stringify(visualBtnAudit.magnifyOpacities)}`);
    }
    log('  PASS: all magnify buttons start with opacity 0');

    // === Part B: hover reveals magnifier ===
    if (visualBtnAudit.withMagnifyBtn > 0) {
      const targetIdx = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#worksheetGrid .problem-card'));
        for (let i = 0; i < cards.length; i++) {
          if (cards[i].querySelector('.ws-magnify-btn')) return i;
        }
        return -1;
      });
      log(`  hovering card index ${targetIdx}`);

      // Scroll the card into view first
      await page.evaluate(idx => {
        const card = document.querySelectorAll('#worksheetGrid .problem-card')[idx];
        if (card) card.scrollIntoView({ block: 'center' });
      }, targetIdx);
      await new Promise(r => setTimeout(r, 200));

      await page.hover(`#worksheetGrid .problem-card:nth-of-type(${targetIdx + 1})`);
      await new Promise(r => setTimeout(r, 350)); // CSS transition (.15s) + buffer

      const afterHover = await page.evaluate(idx => {
        const card = document.querySelectorAll('#worksheetGrid .problem-card')[idx];
        const btn = card && card.querySelector('.ws-magnify-btn');
        if (!btn) return null;
        const cs = window.getComputedStyle(btn);
        return { opacity: parseFloat(cs.opacity), visible: cs.visibility };
      }, targetIdx);
      log(`  after hover: ${JSON.stringify(afterHover)}`);

      if (!afterHover || afterHover.opacity < 0.9) {
        throw new Error(`Magnify button opacity NOT 1 after hover (got ${afterHover && afterHover.opacity})`);
      }
      log('  PASS: magnify button opacity becomes 1 on hover');
      await shot(page, '02-card-hovered');
    } else {
      log('  (no .ws-magnify-btn cards in this batch — skipping hover assertion)');
    }

    // === Part C: clicking the card's visual area opens .zoom-overlay ===
    // Find a card whose answerType is NOT a click-is-answer type AND has
    // a visual that wasn't hijacked (must contain .zoom-trigger class).
    const zoomTargetIdx = await page.evaluate(() => {
      const ZOOM_CLICK_IS_ANSWER_TYPES = ['hot-spot','multi-select-check','fraction-bar-shade','ten-frame','clock-set','coord-plot','coord-input','dnd-generic','drag-fill'];
      const qs = (window.state && window.state.worksheetQs) || [];
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        if (!q || (q.answerType && ZOOM_CLICK_IS_ANSWER_TYPES.includes(q.answerType))) continue;
        const card = document.getElementById(`ws_card_${i}`);
        if (!card) continue;
        const visual = card.querySelector('.ws-card-visual.zoom-trigger');
        if (visual && visual.innerHTML && visual.innerHTML.trim().length > 10) return i;
      }
      return -1;
    });
    log(`  zoom-target index: ${zoomTargetIdx}`);

    if (zoomTargetIdx >= 0) {
      // Scroll into view and click directly on the visual (not on input/btn)
      await page.evaluate(idx => {
        const card = document.getElementById(`ws_card_${idx}`);
        if (card) card.scrollIntoView({ block: 'center' });
      }, zoomTargetIdx);
      await new Promise(r => setTimeout(r, 200));

      // Click the visual using a synthetic click on the wrapper (avoids
      // accidentally hitting an input). The handler does its own
      // closest('input,button,...') guard, so a wrapper-level synthetic
      // click is the cleanest way to verify zoom triggers.
      await page.evaluate(idx => {
        const card = document.getElementById(`ws_card_${idx}`);
        const visual = card.querySelector('.ws-card-visual');
        // Dispatch a real click event on the wrapper itself
        visual.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }, zoomTargetIdx);
      await new Promise(r => setTimeout(r, 250));

      const overlayAppeared = await page.evaluate(() => !!document.querySelector('.zoom-overlay'));
      if (!overlayAppeared) throw new Error('Clicking visual did NOT open .zoom-overlay');
      log('  PASS: .zoom-overlay appeared after click');
      await shot(page, '03-zoom-overlay-open');

      // Close the modal
      await page.evaluate(() => {
        const ov = document.querySelector('.zoom-overlay');
        const btn = ov && ov.querySelector('.zoom-close');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 200));
      const overlayGone = await page.evaluate(() => !document.querySelector('.zoom-overlay'));
      if (!overlayGone) throw new Error('.zoom-overlay still present after close');
      log('  PASS: .zoom-overlay removed after close');
      await shot(page, '04-zoom-closed');
    } else {
      log('  WARN: no eligible non-click-is-answer card found — zoom-click flow not exercised');
    }

    // Filter favicon noise
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
