// Probe test for the redesigned factors_identify skill (fill-in-the-blanks
// factor pair list, factor-pairs answerType, auto-advance focus, submit flow).
//
// Verifies:
//   1. Generator produces q.answerType === 'factor-pairs' with q.factorPairData.
//   2. Visual renders <= 4 .fp-input cells.
//   3. Filling correct values triggers auto-advance focus to the next blank.
//   4. submitFactorPairs() sets state.lastAnswerCorrect === true on all-correct.

const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8080/index.html';
const RUNS = 6; // sample multiple problems to cover varied N values

function log(...args) { console.log('[FP-TEST]', ...args); }

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

(async () => {
  let browser;
  let exitCode = 0;
  const consoleErrors = [];
  const pageErrors = [];

  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[err] ${msg.text()}`);
    });
    page.on('pageerror', (err) => { pageErrors.push(err.stack || String(err)); });

    log('navigating to', BASE);
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
      10000, 'window.state');
    await waitFor(page, () => typeof window.generateQuestion === 'function',
      10000, 'window.generateQuestion');

    // ====== Phase 1: Generator-only assertions over multiple runs ======
    const sampleResults = [];
    for (let run = 0; run < RUNS; run++) {
      const result = await page.evaluate(() => {
        // Configure state to mimic a real session
        window.state.skill = 'factors_identify';
        window.state.category = 'number_theory';
        window.state.range = 100;
        window.state.gameMode = 'practice';
        // Build a fresh question object exactly like game-control would
        let q;
        try {
          q = window.generateQuestion();
        } catch (e) {
          return { error: 'generateQuestion threw: ' + (e.stack || e.message) };
        }
        if (!q) return { error: 'generateQuestion returned falsy' };
        return {
          answerType: q.answerType,
          printFormat: q.printFormat,
          text: q.text,
          ans: q.ans,
          hasFactorPairData: !!q.factorPairData,
          num: q.factorPairData?.num,
          pairs: q.factorPairData?.pairs,
          blanks: q.factorPairData?.blanks,
          visualHasInputs: typeof q.visual === 'string' && q.visual.includes('class="fp-input"'),
          visualLength: typeof q.visual === 'string' ? q.visual.length : 0,
        };
      });
      sampleResults.push(result);
      log(`run ${run + 1}: N=${result.num} pairs=${JSON.stringify(result.pairs)} blanks=${result.blanks?.length}`);
      if (result.error) throw new Error(result.error);
      if (result.answerType !== 'factor-pairs') throw new Error(`run ${run + 1}: answerType=${result.answerType}, expected factor-pairs`);
      if (result.printFormat !== 'factor-pairs') throw new Error(`run ${run + 1}: printFormat=${result.printFormat}`);
      if (!result.hasFactorPairData) throw new Error(`run ${run + 1}: missing factorPairData`);
      if (!Array.isArray(result.pairs) || result.pairs.length === 0) throw new Error(`run ${run + 1}: no pairs`);
      if (!Array.isArray(result.blanks) || result.blanks.length === 0) throw new Error(`run ${run + 1}: no blanks`);
      if (result.blanks.length > 4) throw new Error(`run ${run + 1}: ${result.blanks.length} blanks (>4 cap violated)`);
      if (!result.visualHasInputs) throw new Error(`run ${run + 1}: visual has no .fp-input cells`);
      // Verify each blank's answer is a valid factor of N
      for (const b of result.blanks) {
        if (result.num % b.answer !== 0) {
          throw new Error(`run ${run + 1}: blank answer ${b.answer} is not a factor of ${result.num}`);
        }
      }
    }
    log(`Phase 1 PASS — ${RUNS} generators all valid, all blanks <= 4`);

    // ====== Phase 2: Render + auto-advance + submit-correct ======
    // Render one problem into the live game view via the actual flow.
    await page.evaluate(() => {
      window.state.skill = 'factors_identify';
      window.state.category = 'number_theory';
      window.state.range = 100;
      window.state.gameMode = 'practice';
      window.state.totalQuestions = 0;
      window.state.score = 0;
      window.state.sessionStreak = 0;
      window.state.hasAnswered = false;
      window.state.lastAnswerCorrect = false;
      window.state.currentQAttempts = 0;
      // Build & render a question directly to the game view DOM
      const q = window.generateQuestion();
      window.state.currentQ = q;
      // Show game view
      if (typeof window.showView === 'function') window.showView('gameView');
      window.renderQuestion(q);
    });

    await waitFor(page,
      () => document.querySelectorAll('#visualAid .fp-input').length > 0,
      5000, '.fp-input rendered');

    const renderInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('#visualAid .fp-input'));
      return {
        inputCount: inputs.length,
        answers: inputs.map(i => i.dataset.answer),
        num: window.state.currentQ.factorPairData.num,
      };
    });
    log(`Phase 2 render: ${renderInfo.inputCount} blanks for N=${renderInfo.num}, answers=${renderInfo.answers}`);
    if (renderInfo.inputCount === 0) throw new Error('no .fp-input rendered in DOM');
    if (renderInfo.inputCount > 4) throw new Error(`${renderInfo.inputCount} .fp-input elements (>4 cap violated)`);

    // Type the FIRST correct answer and check focus auto-advances.
    if (renderInfo.inputCount >= 2) {
      const focusInfo = await page.evaluate(async () => {
        const inputs = Array.from(document.querySelectorAll('#visualAid .fp-input'));
        const first = inputs[0];
        first.focus();
        // Set value + dispatch input event (matches the listener in question-render.js)
        first.value = first.dataset.answer;
        first.dispatchEvent(new Event('input', { bubbles: true }));
        // Give the listener a tick
        await new Promise(r => setTimeout(r, 50));
        const focused = document.activeElement;
        return {
          focusedClass: focused?.className,
          focusedAnswer: focused?.dataset?.answer,
          focusedIndex: inputs.indexOf(focused),
        };
      });
      log(`Phase 2 focus: after filling input[0], focus is now on input[${focusInfo.focusedIndex}] (answer=${focusInfo.focusedAnswer})`);
      if (focusInfo.focusedIndex !== 1) {
        throw new Error(`auto-advance failed: expected focus on input[1], got input[${focusInfo.focusedIndex}]`);
      }
    } else {
      log('Phase 2 focus: only 1 blank, skipping auto-advance check');
    }

    // Now fill ALL inputs with correct values and submit.
    const submitResult = await page.evaluate(async () => {
      const inputs = Array.from(document.querySelectorAll('#visualAid .fp-input'));
      inputs.forEach(inp => {
        inp.value = inp.dataset.answer;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await new Promise(r => setTimeout(r, 50));
      // Reset hasAnswered to allow submit (the auto-advance keystroke flow does NOT submit)
      window.state.hasAnswered = false;
      window.state.lastAnswerCorrect = false;
      // Call the in-widget submit
      window.submitFactorPairs();
      await new Promise(r => setTimeout(r, 100));
      return {
        lastAnswerCorrect: window.state.lastAnswerCorrect,
        hasAnswered: window.state.hasAnswered,
        score: window.state.score,
        correctMarked: Array.from(document.querySelectorAll('#visualAid .fp-input.correct')).length,
        wrongMarked: Array.from(document.querySelectorAll('#visualAid .fp-input.wrong')).length,
      };
    });
    log(`Phase 2 submit: ${JSON.stringify(submitResult)}`);
    if (submitResult.lastAnswerCorrect !== true) throw new Error('lastAnswerCorrect !== true after correct submit');
    if (!submitResult.hasAnswered) throw new Error('hasAnswered !== true after correct submit');
    if (submitResult.wrongMarked !== 0) throw new Error(`unexpected wrong-marked inputs: ${submitResult.wrongMarked}`);
    if (submitResult.correctMarked !== renderInfo.inputCount) throw new Error(`correctMarked=${submitResult.correctMarked}, expected ${renderInfo.inputCount}`);

    // ====== Phase 3: Wrong-answer flow ======
    await page.evaluate(() => {
      window.state.hasAnswered = false;
      window.state.lastAnswerCorrect = false;
      window.state.currentQAttempts = 0;
      window.state.skill = 'factors_identify';
      window.state.category = 'number_theory';
      const q = window.generateQuestion();
      window.state.currentQ = q;
      window.renderQuestion(q);
    });
    await waitFor(page,
      () => document.querySelectorAll('#visualAid .fp-input').length > 0,
      5000, 'second render');
    const wrongResult = await page.evaluate(async () => {
      const inputs = Array.from(document.querySelectorAll('#visualAid .fp-input'));
      // Fill all with WRONG values (use 999, guaranteed not a factor of any tested N)
      inputs.forEach(inp => {
        inp.value = '999';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await new Promise(r => setTimeout(r, 50));
      window.state.hasAnswered = false;
      window.submitFactorPairs();
      await new Promise(r => setTimeout(r, 100));
      return {
        lastAnswerCorrect: window.state.lastAnswerCorrect,
        attempts: window.state.currentQAttempts,
        wrongMarked: Array.from(document.querySelectorAll('#visualAid .fp-input.wrong')).length,
        inputCount: inputs.length,
      };
    });
    log(`Phase 3 wrong: ${JSON.stringify(wrongResult)}`);
    if (wrongResult.lastAnswerCorrect === true) throw new Error('lastAnswerCorrect should NOT be true on wrong submit');
    if (wrongResult.attempts < 1) throw new Error(`attempts not incremented: ${wrongResult.attempts}`);
    if (wrongResult.wrongMarked !== wrongResult.inputCount) throw new Error(`expected all ${wrongResult.inputCount} inputs marked wrong, got ${wrongResult.wrongMarked}`);

    if (consoleErrors.length > 0) {
      log('!!! console errors:'); consoleErrors.forEach(e => log('  ', e));
      exitCode = 2;
    }
    if (pageErrors.length > 0) {
      log('!!! page errors:'); pageErrors.forEach(e => log('  ', e));
      exitCode = 3;
    }

    log('======== SUMMARY ========');
    log(`Phase 1 (generator): PASS (${RUNS} runs)`);
    log(`Phase 2 (render + auto-advance + correct submit): PASS`);
    log(`Phase 3 (wrong submit): PASS`);
    log(`console errors: ${consoleErrors.length}, page errors: ${pageErrors.length}`);
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
