// Box Method Division — end-to-end smoke test
// Verifies generation, render, and submit/check flow.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-box-division-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[BOX-DIV]', ...args); }

async function shot(page, name) {
  try {
    await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false });
    log('  shot', name);
  } catch (e) { log('  shot fail', name, e.message); }
}

async function waitFor(page, fn, timeout = 8000, label = 'cond') {
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
    log('launching puppeteer...');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(e.stack || String(e)));

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
      10000, 'window.state');

    // ============= TEST 1: box_division_easy generation =============
    log('--- TEST 1: box_division_easy generates clean 2-box question ---');
    const easyQ = await page.evaluate(() => {
      window.state.skill = 'box_division_easy';
      window.state.category = 'division';
      const q = window.generateQuestion();
      window.state.currentQ = q;
      return {
        ans: window.state.currentQ.ans,
        text: window.state.currentQ.text,
        answerType: window.state.currentQ.answerType,
        printFormat: window.state.currentQ.printFormat,
        boxData: window.state.currentQ.boxDivisionData,
        visualLen: (window.state.currentQ.visual || '').length,
      };
    });
    log('  generated:', JSON.stringify({
      text: easyQ.text, ans: easyQ.ans, type: easyQ.answerType,
      pf: easyQ.printFormat, steps: easyQ.boxData?.steps?.length,
      divisor: easyQ.boxData?.divisor, dividend: easyQ.boxData?.dividend,
      remainder: easyQ.boxData?.remainder,
    }));
    if (easyQ.answerType !== 'box-division') throw new Error('answerType mismatch (easy)');
    if (easyQ.printFormat !== 'box-division') throw new Error('printFormat mismatch (easy)');
    if (!easyQ.boxData) throw new Error('boxDivisionData missing (easy)');
    if (easyQ.boxData.steps.length !== 2) throw new Error(`expected 2 steps for easy, got ${easyQ.boxData.steps.length}`);
    if (easyQ.boxData.remainder !== 0) throw new Error('easy must be clean division (no remainder)');
    if (easyQ.boxData.divisor < 2 || easyQ.boxData.divisor > 9) throw new Error(`bad divisor ${easyQ.boxData.divisor}`);
    if (easyQ.boxData.dividend < 10 || easyQ.boxData.dividend > 99) throw new Error(`bad dividend ${easyQ.boxData.dividend}`);
    if (easyQ.boxData.dividend / easyQ.boxData.divisor !== easyQ.ans) throw new Error('quotient mismatch');
    log('  PASS — easy generation OK');

    // ============= TEST 2: box_division_hard generation =============
    log('--- TEST 2: box_division_hard generates 3-box question ---');
    const hardSamples = [];
    for (let i = 0; i < 8; i++) {
      const sample = await page.evaluate(() => {
        window.state.skill = 'box_division_hard';
        window.state.category = 'division';
        const q = window.generateQuestion();
        window.state.currentQ = q;
        return {
          ans: q.ans, dividend: q.boxDivisionData?.dividend,
          divisor: q.boxDivisionData?.divisor,
          remainder: q.boxDivisionData?.remainder,
          steps: q.boxDivisionData?.steps?.length,
          type: q.answerType,
        };
      });
      hardSamples.push(sample);
    }
    log('  hard samples:', JSON.stringify(hardSamples.slice(0, 4)));
    for (const s of hardSamples) {
      if (s.steps !== 3) throw new Error(`hard expected 3 steps, got ${s.steps}`);
      if (s.dividend < 100 || s.dividend > 999) throw new Error(`bad hard dividend ${s.dividend}`);
      if (s.type !== 'box-division') throw new Error('hard answerType mismatch');
    }
    const hadRemainder = hardSamples.some(s => s.remainder > 0);
    log(`  hard: had remainder in ${hardSamples.filter(s => s.remainder > 0).length}/${hardSamples.length} samples (expected ~30%)`);
    log('  PASS — hard generation OK', hadRemainder ? '(remainder branch hit)' : '(all clean — OK by chance)');

    // ============= TEST 3: render and submit correct =============
    log('--- TEST 3: render box_division_easy in game flow & submit correct ---');
    // Force a fresh easy question into the game view.
    const setup = await page.evaluate(() => {
      // Mimic playing this single skill in practice mode.
      window.state.skill = 'box_division_easy';
      window.state.category = 'division';
      window.state.gameMode = 'practice';
      window.state.mapMode = false;
      window.state.score = 0;
      window.state.sessionStreak = 0;
      window.state.hasAnswered = false;
      const q = window.generateQuestion();
      window.state.currentQ = q;
      // Render directly (skip the start-game flow to keep this isolated).
      // Show the gameView so DOM elements exist.
      if (window.showView) window.showView('gameView');
      window.renderQuestion(q);
      return {
        steps: q.boxDivisionData.steps,
        dividend: q.boxDivisionData.dividend,
        divisor: q.boxDivisionData.divisor,
      };
    });
    await new Promise(r => setTimeout(r, 200));

    await shot(page, 'rendered-easy');

    const inputs = await page.evaluate(() => {
      const va = document.getElementById('visualAid');
      return {
        boxes: va.querySelectorAll('.bx-box-wrap').length,
        roofs: va.querySelectorAll('.bx-roof').length,
        subs: va.querySelectorAll('.bx-sub').length,
        rems: va.querySelectorAll('.bx-rem').length,
        visible: va.style.display !== 'none',
      };
    });
    log('  rendered:', JSON.stringify(inputs));
    if (inputs.boxes !== 2) throw new Error(`expected 2 boxes rendered, got ${inputs.boxes}`);
    if (inputs.roofs !== 2 || inputs.subs !== 2 || inputs.rems !== 2)
      throw new Error('expected 2 of each input type');
    if (!inputs.visible) throw new Error('visualAid not visible');

    // Fill correct answers per step.
    await page.evaluate((stepsIn) => {
      const va = document.getElementById('visualAid');
      stepsIn.forEach((s, i) => {
        const r = va.querySelector(`.bx-roof[data-i="${i}"]`);
        const sub = va.querySelector(`.bx-sub[data-i="${i}"]`);
        const rem = va.querySelector(`.bx-rem[data-i="${i}"]`);
        if (r) { r.value = String(s.roof); r.dispatchEvent(new Event('input', {bubbles:true})); }
        if (sub) { sub.value = String(s.sub); sub.dispatchEvent(new Event('input', {bubbles:true})); }
        if (rem) { rem.value = String(s.rem); rem.dispatchEvent(new Event('input', {bubbles:true})); }
      });
    }, setup.steps);
    await new Promise(r => setTimeout(r, 100));
    await shot(page, 'filled-correct');

    // Submit.
    const result = await page.evaluate(() => {
      window.submitAnswer();
      return {
        last: window.state.lastAnswerCorrect,
        score: window.state.score,
        feedback: (document.getElementById('feedbackArea')?.innerText || '').slice(0, 100),
      };
    });
    log('  after submit:', JSON.stringify(result));
    if (result.last !== true) throw new Error('lastAnswerCorrect should be true');
    if (result.score < 1) throw new Error('score should have incremented');
    log('  PASS — correct submit OK');

    // ============= TEST 4: wrong answer flow =============
    log('--- TEST 4: wrong answer is rejected and lastAnswerCorrect stays false ---');
    const wrong = await page.evaluate(() => {
      window.state.skill = 'box_division_easy';
      window.state.category = 'division';
      window.state.gameMode = 'practice';
      window.state.mapMode = false;
      window.state.hasAnswered = false;
      window.state.lastAnswerCorrect = null;
      const q = window.generateQuestion();
      window.state.currentQ = q;
      if (window.showView) window.showView('gameView');
      window.renderQuestion(q);
      const va = document.getElementById('visualAid');
      // Fill all roofs with 9 (almost certainly wrong).
      va.querySelectorAll('.bx-roof, .bx-sub, .bx-rem').forEach(el => {
        el.value = '9'; el.dispatchEvent(new Event('input', {bubbles:true}));
      });
      window.submitAnswer();
      return {
        last: window.state.lastAnswerCorrect,
        hasAnswered: window.state.hasAnswered,
        feedbackText: (document.getElementById('feedbackArea')?.innerText || '').slice(0, 80),
      };
    });
    log('  wrong submit:', JSON.stringify(wrong));
    if (wrong.last === true) throw new Error('wrong answer was accepted as correct');
    if (wrong.hasAnswered === true) throw new Error('hasAnswered should remain false on wrong');
    log('  PASS — wrong answer rejected');

    // ============= TEST 5: print format works =============
    log('--- TEST 5: print format renders without throwing ---');
    const printResult = await page.evaluate(() => {
      window.state.skill = 'box_division_hard';
      window.state.category = 'division';
      const q = window.generateQuestion();
      window.state.currentQ = q;
      if (typeof window.formatProblemForPrint !== 'function') {
        return { ok: false, err: 'formatProblemForPrint not on window' };
      }
      try {
        const html = window.formatProblemForPrint(q, 0, 1, 'wide', true);
        return { ok: true, len: html.length, hasBoxes: html.includes('bx-roof-print') };
      } catch (e) {
        return { ok: false, err: e.message };
      }
    });
    log('  print:', JSON.stringify(printResult));
    if (!printResult.ok) throw new Error('print format threw: ' + printResult.err);
    if (!printResult.hasBoxes) throw new Error('print HTML missing roof boxes');
    log('  PASS — print format OK');

    log('======== SUMMARY ========');
    log('console errors:', consoleErrors.length);
    log('page errors:   ', pageErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach(e => log('  CON:', e));
    }
    if (pageErrors.length > 0) {
      pageErrors.slice(0, 5).forEach(e => log('  PG:', e));
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
