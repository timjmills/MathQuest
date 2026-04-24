// Probe test for the Grade-Level Batch Assign chips (research Feature 2 / Approach D).
// Verifies:
//   1. Chips render in teacher mode with non-zero counts.
//   2. Clicking grade-3 chip adds ~Grade-3 skills to the queue.
//   3. Clicking the same chip again removes them (queue shrinks back).
//   4. Multi-select: K + 1 + 2 chips together push K+1+2 skills into the queue.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-grade-chips-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[GC]', ...args); }

async function shot(page, name) {
  try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); }
  catch (e) { log('  shot failed:', name, e.message); }
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

    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      if (msg.type() === 'error') consoleErrors.push(text);
    });
    page.on('pageerror', (err) => { pageErrors.push(err.stack || String(err)); });

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
      10000, 'window.state');

    // Make sure teacher mode is active so the chip row is visible.
    await page.evaluate(() => {
      if (typeof window.setUserRole === 'function') window.setUserRole('teacher');
    });
    await new Promise(r => setTimeout(r, 200));

    // Verify wiring.
    const wired = await page.evaluate(() => ({
      initGradeChips: typeof window.initGradeChips === 'function',
      toggleGradeChip: typeof window.toggleGradeChip === 'function',
      renderGradeChips: typeof window.renderGradeChips === 'function',
      UnifiedSkills: typeof window.UnifiedSkills === 'object',
    }));
    log('wired:', JSON.stringify(wired));
    for (const [k, v] of Object.entries(wired)) {
      if (!v) throw new Error(`Global not wired: window.${k}`);
    }

    // Render check.
    const chipInfo = await page.evaluate(() => {
      const row = document.getElementById('gradeChipsRow');
      const chips = Array.from(row ? row.querySelectorAll('.grade-chip') : []);
      return {
        rowVisible: row && getComputedStyle(row).display !== 'none',
        containerVisible: (() => {
          const c = document.getElementById('gradeChipsContainer');
          return c && getComputedStyle(c).display !== 'none';
        })(),
        chips: chips.map(c => ({
          grade: c.dataset.grade,
          countText: c.querySelector('.gc-count')?.textContent,
          active: c.classList.contains('active'),
        })),
      };
    });
    log('initial chip row:', JSON.stringify(chipInfo));

    if (!chipInfo.containerVisible) throw new Error('grade chip container not visible in teacher mode');
    if (chipInfo.chips.length !== 7) throw new Error(`expected 7 chips, got ${chipInfo.chips.length}`);
    const grades = chipInfo.chips.map(c => c.grade).join(',');
    if (grades !== 'K,1,2,3,4,5,6') throw new Error(`unexpected chip ordering: ${grades}`);

    // Capture per-grade skill counts as parsed from the chips themselves.
    const counts = {};
    for (const c of chipInfo.chips) {
      const m = c.countText && c.countText.match(/\((\d+)\)/);
      counts[c.grade] = m ? parseInt(m[1], 10) : 0;
    }
    log('counts from chips:', JSON.stringify(counts));
    for (const g of ['K', '1', '2', '3', '4', '5', '6']) {
      if (counts[g] <= 0) throw new Error(`grade ${g} has chip count of ${counts[g]} (expected > 0)`);
    }

    // Reset queue to a known empty state.
    await page.evaluate(() => { window.UnifiedSkills.clear(); });
    await new Promise(r => setTimeout(r, 250));
    const startSize = await page.evaluate(() => window.UnifiedSkills.count);
    log('start queue size:', startSize);

    await shot(page, '01-initial');

    // --- Test 1: click grade 3 → adds the grade-3 skills.
    await page.evaluate(() => window.toggleGradeChip('3'));
    await new Promise(r => setTimeout(r, 350));
    const afterAdd3 = await page.evaluate(() => ({
      queue: window.UnifiedSkills.count,
      active: document.querySelector('.grade-chip[data-grade="3"]')?.classList.contains('active'),
    }));
    log('after click grade 3:', JSON.stringify(afterAdd3));
    if (afterAdd3.queue !== counts['3']) {
      throw new Error(`grade-3 add: expected queue=${counts['3']}, got ${afterAdd3.queue}`);
    }
    if (!afterAdd3.active) throw new Error('grade-3 chip should be active after click');

    await shot(page, '02-grade3-added');

    // --- Test 2: click grade 3 again → removes them.
    await page.evaluate(() => window.toggleGradeChip('3'));
    await new Promise(r => setTimeout(r, 350));
    const afterRemove3 = await page.evaluate(() => ({
      queue: window.UnifiedSkills.count,
      active: document.querySelector('.grade-chip[data-grade="3"]')?.classList.contains('active'),
    }));
    log('after re-click grade 3:', JSON.stringify(afterRemove3));
    if (afterRemove3.queue !== 0) throw new Error(`grade-3 remove: queue should be 0, got ${afterRemove3.queue}`);
    if (afterRemove3.active) throw new Error('grade-3 chip should NOT be active after re-click');

    await shot(page, '03-grade3-removed');

    // --- Test 3: multi-select K + 1 + 2.
    await page.evaluate(() => {
      window.toggleGradeChip('K');
      window.toggleGradeChip('1');
      window.toggleGradeChip('2');
    });
    await new Promise(r => setTimeout(r, 400));
    const afterMulti = await page.evaluate(() => ({
      queue: window.UnifiedSkills.count,
      activeChips: Array.from(document.querySelectorAll('.grade-chip.active')).map(c => c.dataset.grade),
    }));
    const expected = counts['K'] + counts['1'] + counts['2'];
    log('after K+1+2:', JSON.stringify(afterMulti), 'expected queue=', expected);
    if (afterMulti.queue !== expected) {
      throw new Error(`multi-add: expected queue=${expected}, got ${afterMulti.queue}`);
    }
    const wantActive = ['K', '1', '2'].sort().join(',');
    const gotActive = [...afterMulti.activeChips].sort().join(',');
    if (gotActive !== wantActive) {
      throw new Error(`multi-add: expected active chips=${wantActive}, got ${gotActive}`);
    }

    await shot(page, '04-K-1-2-added');

    // --- Test 4: deactivate one (grade 1) — queue should shrink by counts['1'] only.
    await page.evaluate(() => window.toggleGradeChip('1'));
    await new Promise(r => setTimeout(r, 350));
    const afterRemove1 = await page.evaluate(() => ({
      queue: window.UnifiedSkills.count,
      activeChips: Array.from(document.querySelectorAll('.grade-chip.active')).map(c => c.dataset.grade),
    }));
    const wantAfterRemove1 = counts['K'] + counts['2'];
    log('after deactivate grade 1:', JSON.stringify(afterRemove1), 'expected queue=', wantAfterRemove1);
    if (afterRemove1.queue !== wantAfterRemove1) {
      throw new Error(`multi-remove: expected queue=${wantAfterRemove1}, got ${afterRemove1.queue}`);
    }

    // --- Test 5: ensure existing Quick Skills click handler still works.
    // Reset queue, then click first quick-skill card (default = add_facts).
    await page.evaluate(() => { window.UnifiedSkills.clear(); window.clearActiveGradeChips && window.clearActiveGradeChips(); });
    await new Promise(r => setTimeout(r, 250));
    await page.evaluate(() => {
      const card = document.querySelector('#quickSkillsGrid .quick-skill-card');
      if (card) card.click();
    });
    await new Promise(r => setTimeout(r, 250));
    const afterQS = await page.evaluate(() => window.UnifiedSkills.count);
    log('after click first quick-skill card:', afterQS);
    if (afterQS !== 1) throw new Error(`quick-skill click expected to add 1 skill, got ${afterQS}`);

    if (consoleErrors.length > 0) {
      log('!!! console errors:'); consoleErrors.forEach(e => log('  ', e));
      exitCode = 2;
    }
    if (pageErrors.length > 0) {
      log('!!! page errors:'); pageErrors.forEach(e => log('  ', e));
      exitCode = 3;
    }

    log('======== SUMMARY ========');
    log('counts (K,1,2,3,4,5,6):', counts);
    log('console errors:', consoleErrors.length);
    log('page errors:   ', pageErrors.length);
    log('shots:         ', SHOT_DIR);
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
