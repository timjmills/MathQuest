// Chromebook (1280x600) layout audit — quizBuilder, quizTake, quizResults, dashboard, skillsOrganizer
// Verifies no horizontal scroll at 1280x600 viewport on each view.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-chromebook-views');

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const log = (...a) => console.log('[CHROMEBOOK]', ...a);

async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: file, fullPage: false });
    log('  shot:', name + '.png');
  } catch (e) {
    log('  WARN screenshot failed:', name, e.message);
  }
}

async function shotFull(page, name) {
  const file = path.join(SHOT_DIR, `${name}-full.png`);
  try {
    await page.screenshot({ path: file, fullPage: true });
    log('  shot full:', name + '-full.png');
  } catch (e) {
    log('  WARN full screenshot failed:', name, e.message);
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

async function measure(page, label) {
  const m = await page.evaluate(() => ({
    bodyW: document.body.scrollWidth,
    bodyH: document.body.scrollHeight,
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    activeView: document.querySelector('.view.active')?.id || 'none',
    horizScroll: document.body.scrollWidth > window.innerWidth + 1,
    horizOverflowEls: (() => {
      const out = [];
      document.querySelectorAll('.view.active *').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'hidden' && getComputedStyle(el).overflowX !== 'auto' && getComputedStyle(el).overflowX !== 'scroll') {
          if (el.offsetWidth > window.innerWidth + 1) {
            out.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0,2).join('.')} w=${el.offsetWidth}`);
          }
        }
      });
      return out.slice(0, 8);
    })(),
  }));
  log(` [${label}]`, JSON.stringify(m));
  return m;
}

(async () => {
  let browser;
  let exitCode = 0;
  const results = [];
  const consoleErrors = [];
  const pageErrors = [];

  try {
    log('launching puppeteer...');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 600 });

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[err] ${msg.text()}`);
    });
    page.on('pageerror', (err) => pageErrors.push(err.stack || String(err)));

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null, 10000, 'state ready');

    // --- 1) quizBuilderView (empty) ---
    log('--- quizBuilderView (empty) ---');
    await page.evaluate(() => window.openQuizBuilder());
    await waitFor(page, () => document.getElementById('quizBuilderView')?.classList.contains('active'), 5000, 'qbView active');
    await new Promise(r => setTimeout(r, 600));
    results.push({ view: 'quizBuilder', ...(await measure(page, 'quizBuilder')) });
    await shot(page, '01-quizBuilder');

    // Add a skill to populate question panel
    await page.evaluate(() => {
      // try clicking the first .qb-skill-card if present
      const card = document.querySelector('.qb-skill-card');
      if (card) card.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await shot(page, '01b-quizBuilder-with-preview');

    // --- 2) skillsOrganizerView ---
    log('--- skillsOrganizerView ---');
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => window.openSkillsOrganizer());
    await waitFor(page, () => document.getElementById('skillsOrganizerView')?.classList.contains('active'), 5000, 'soView active');
    await new Promise(r => setTimeout(r, 600));
    results.push({ view: 'skillsOrganizer', ...(await measure(page, 'skillsOrganizer')) });
    await shot(page, '02-skillsOrganizer');

    // --- 3) dashboardView ---
    log('--- dashboardView ---');
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => window.showView && window.showView('dashboardView'));
    await waitFor(page, () => document.getElementById('dashboardView')?.classList.contains('active'), 5000, 'dashView active');
    await new Promise(r => setTimeout(r, 600));
    results.push({ view: 'dashboard', ...(await measure(page, 'dashboard')) });
    await shot(page, '03-dashboard');
    await shotFull(page, '03-dashboard');

    // --- 4) quizTakeView ---
    // To enter the quiz-take screen we need a quiz to take. We can fake one by populating window.activeQuiz state.
    log('--- quizTakeView (synthetic) ---');
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 200));
    // Try to find startTakeQuiz or enterQuizTake function
    const qtAttempt = await page.evaluate(() => {
      // Fake taking — just show the view if it exists
      if (window.showView) {
        window.showView('quizTakeView');
        return document.getElementById('quizTakeView')?.classList.contains('active');
      }
      return false;
    });
    if (qtAttempt) {
      await new Promise(r => setTimeout(r, 500));
      results.push({ view: 'quizTake', ...(await measure(page, 'quizTake')) });
      await shot(page, '04-quizTake');
    } else {
      log('  (skipped quizTake — could not enter view)');
    }

    // --- 5) quizResultsView ---
    log('--- quizResultsView (synthetic) ---');
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 200));
    const qrAttempt = await page.evaluate(() => {
      if (window.showView) {
        window.showView('quizResultsView');
        return document.getElementById('quizResultsView')?.classList.contains('active');
      }
      return false;
    });
    if (qrAttempt) {
      await new Promise(r => setTimeout(r, 500));
      results.push({ view: 'quizResults', ...(await measure(page, 'quizResults')) });
      await shot(page, '05-quizResults');
    } else {
      log('  (skipped quizResults — could not enter view)');
    }

    // ---- Summary ----
    log('======== SUMMARY ========');
    let failed = 0;
    for (const r of results) {
      const ok = !r.horizScroll;
      log(`${ok ? 'PASS' : 'FAIL'} ${r.view.padEnd(18)} bodyW=${r.bodyW} horizScroll=${r.horizScroll}${r.horizOverflowEls.length ? ' overflow=' + r.horizOverflowEls.join('|') : ''}`);
      if (!ok) failed++;
    }
    log(`pageErrors: ${pageErrors.length}, consoleErrors: ${consoleErrors.length}`);
    if (pageErrors.length) pageErrors.slice(0, 3).forEach(e => log('  pageErr:', e.split('\n')[0]));
    if (failed > 0) {
      log(`OVERALL: FAIL — ${failed} view(s) had horizontal scroll`);
      exitCode = 2;
    } else {
      log('OVERALL: PASS — no horizontal scroll detected');
    }
  } catch (err) {
    log('!!! CRASHED:', err.stack || err.message);
    exitCode = 1;
  } finally {
    if (browser) await browser.close();
    process.exit(exitCode);
  }
})();
