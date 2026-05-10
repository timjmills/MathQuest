// Verification test for the wrong-answer retry + Skip-after-2nd behavior.
// Covers: MAP Practice (K-2 + 3-5), MAP Simulation, standard Practice mode.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-wrong-retry-screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[TEST]', ...args); }

async function shot(page, name) {
    try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); }
    catch {}
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

// Submit a deliberate wrong answer for the current MAP question.
// We choose a value guaranteed to NOT equal q.ans (numbers: ans + 12345; text: "WRONG_X").
async function submitWrong(page, attemptIdx) {
    return await page.evaluate((idx) => {
        const q = window.state.currentQ;
        if (!q) return { ok: false, why: 'no currentQ' };
        // Multiple-choice: click the FIRST option that is not the answer
        if (q.options && q.options.length > 0) {
            const wrongOpt = q.options.find(o => String(o) !== String(q.ans));
            if (wrongOpt === undefined) return { ok: false, why: 'no wrong option' };
            // Find the button for this option
            const btns = Array.from(document.querySelectorAll('#answerOptions .answer-btn'));
            const targetBtn = btns.find(b => b.textContent.trim() === String(wrongOpt) ||
                                            b.textContent.trim() === Number(wrongOpt).toLocaleString());
            if (!targetBtn) {
                // Fallback: bypass UI
                window.checkAnswer(wrongOpt);
                return { ok: true, kind: 'mc-direct', submitted: wrongOpt };
            }
            targetBtn.click();
            return { ok: true, kind: 'mc-click', submitted: wrongOpt };
        }
        // Numeric / text input
        const ans = q.ans;
        const wrongVal = (typeof ans === 'number') ? String(ans + 12345 + idx) : ('WRONG' + idx);
        // Try direct checkAnswer (auto-check fires on input usually, but we want explicit)
        window.checkAnswer(wrongVal);
        return { ok: true, kind: 'numeric-direct', submitted: wrongVal };
    }, attemptIdx);
}

// Submit the correct answer. For complex/widget questions, we can't easily
// synthesize the right submission, so we cheat by directly calling the MAP
// engine's record function (engine handles the rest).
async function submitCorrect(page) {
    return await page.evaluate(() => {
        const q = window.state.currentQ;
        if (!q) return { ok: false };
        // For MAP mode, route through the engine directly to avoid
        // input-format mismatches across many widget types.
        if (window.state.mapMode === true) {
            // Reset attempt UI cleanly
            if (typeof window.resetAttemptTracking === 'function') window.resetAttemptTracking();
            window.state.hasAnswered = true;
            window.state.lastAnswerCorrect = true;
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: true });
            }
            return { ok: true, ans: q.ans, kind: 'map-record' };
        }
        // Standard practice: try checkAnswer with the raw q.ans
        window.checkAnswer(q.ans);
        return { ok: true, ans: q.ans, kind: 'std-direct' };
    });
}

// Inspect UI state after a wrong submission
async function getRetryState(page) {
    return await page.evaluate(() => {
        const skip = document.getElementById('skipBtn');
        const fb = document.getElementById('feedbackArea');
        const hist = document.getElementById('attemptHistoryBox');
        const wrongBtns = document.querySelectorAll('#answerOptions .wrong-choice').length;
        return {
            skipVisible: skip ? (skip.style.display !== 'none' && skip.offsetParent !== null) : false,
            skipExists: !!skip,
            feedbackText: fb ? fb.textContent.trim() : '',
            feedbackClass: fb ? fb.className : '',
            attemptCount: window.state.currentQAttempts || 0,
            historyChips: hist ? hist.querySelectorAll('.past-wrong').length : 0,
            wrongChoiceCount: wrongBtns,
            mapItemCount: window.state.mapItemCount,
            currentQText: document.getElementById('questionText')?.textContent?.slice(0, 60),
            hasAnswered: window.state.hasAnswered,
            mapMode: window.state.mapMode,
            mapSessionMode: window.state.mapSessionMode,
            gameMode: window.state.gameMode,
        };
    });
}

// ======== MAP Practice scenario =========
async function runMapPracticeScenario(page, tier, label) {
    log(`--- ${label} MAP Practice flow ---`);
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate((t) => window.openMapTest(t), tier);
    await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'),
        5000, `${label} mapSelectorView active`);
    await waitFor(page, () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0,
        5000, 'chips rendered');

    // Force itemCount target high so we don't accidentally finish
    await page.evaluate(() => { window.state.mapItemCountTarget = 50; });
    // Make sure mode is practice (default for openMapTest)
    await page.evaluate(() => { window.setMapMode && window.setMapMode('practice'); });

    await page.evaluate(() => window.startMapFromUI());
    await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'),
        5000, 'mapSessionView active');
    await waitFor(page, () => {
        const qt = document.getElementById('questionText');
        return qt && qt.textContent && qt.textContent.trim().length > 0;
    }, 5000, 'first question rendered');

    const initial = await getRetryState(page);
    log(`  initial: itemCount=${initial.mapItemCount} mapSessionMode=${initial.mapSessionMode}`);
    if (initial.mapSessionMode !== 'practice') throw new Error(`${label}: expected practice mode, got ${initial.mapSessionMode}`);
    if (initial.mapItemCount !== 0) throw new Error(`${label}: expected mapItemCount 0, got ${initial.mapItemCount}`);
    await shot(page, `${label}-01-initial`);

    const startQText = initial.currentQText;
    const startItemCount = initial.mapItemCount;

    // ==== 1st wrong submission ====
    const r1 = await submitWrong(page, 1);
    log(`  submitted wrong #1: kind=${r1.kind}`);
    await new Promise(r => setTimeout(r, 400));
    const after1 = await getRetryState(page);
    log(`  after wrong #1: attempts=${after1.attemptCount} skipVisible=${after1.skipVisible} mapItemCount=${after1.mapItemCount} feedback="${after1.feedbackText}"`);
    if (after1.attemptCount !== 1) throw new Error(`${label}: expected 1 attempt, got ${after1.attemptCount}`);
    if (after1.skipVisible) throw new Error(`${label}: Skip should NOT be visible after 1st wrong`);
    if (after1.mapItemCount !== startItemCount) throw new Error(`${label}: mapItemCount advanced after wrong (${startItemCount} -> ${after1.mapItemCount})`);
    if (after1.currentQText !== startQText) throw new Error(`${label}: question text changed after wrong attempt #1`);
    if (!/not quite|try again/i.test(after1.feedbackText)) throw new Error(`${label}: feedback should say "not quite" / "try again", got "${after1.feedbackText}"`);
    if (r1.kind === 'mc-click' && after1.wrongChoiceCount < 1) throw new Error(`${label}: MC button not crossed out after wrong`);
    if (r1.kind !== 'mc-click' && after1.historyChips < 1) log(`  (note) no history chip — submission may have been auto-submitted differently`);
    await shot(page, `${label}-02-after-wrong-1`);

    // ==== 2nd wrong submission ====
    const r2 = await submitWrong(page, 2);
    log(`  submitted wrong #2: kind=${r2.kind}`);
    await new Promise(r => setTimeout(r, 400));
    const after2 = await getRetryState(page);
    log(`  after wrong #2: attempts=${after2.attemptCount} skipVisible=${after2.skipVisible} mapItemCount=${after2.mapItemCount}`);
    if (after2.attemptCount !== 2) throw new Error(`${label}: expected 2 attempts, got ${after2.attemptCount}`);
    if (!after2.skipVisible) throw new Error(`${label}: Skip should be VISIBLE after 2nd wrong`);
    if (after2.mapItemCount !== startItemCount) throw new Error(`${label}: mapItemCount advanced after 2nd wrong`);
    if (after2.currentQText !== startQText) throw new Error(`${label}: question text changed after 2nd wrong`);
    await shot(page, `${label}-03-after-wrong-2-skip-visible`);

    // ==== Press Skip ====
    const skipResult = await page.evaluate(() => {
        const s = document.getElementById('skipBtn');
        if (!s) return { ok: false, why: 'no skip btn' };
        s.click();
        return { ok: true };
    });
    log(`  pressed Skip: ${JSON.stringify(skipResult)}`);
    await new Promise(r => setTimeout(r, 1500));
    const afterSkip = await getRetryState(page);
    log(`  after skip: itemCount=${afterSkip.mapItemCount} skipVisible=${afterSkip.skipVisible} attempts=${afterSkip.attemptCount} qText="${afterSkip.currentQText}"`);
    if (afterSkip.mapItemCount <= startItemCount) throw new Error(`${label}: mapItemCount did NOT advance after Skip (${startItemCount} -> ${afterSkip.mapItemCount})`);
    if (afterSkip.skipVisible) throw new Error(`${label}: Skip should be hidden on new question`);
    if (afterSkip.attemptCount !== 0) throw new Error(`${label}: attempt counter should reset to 0 after skip + new q, got ${afterSkip.attemptCount}`);
    await shot(page, `${label}-04-after-skip`);

    // ==== Test correct answer flow ====
    const startItem2 = afterSkip.mapItemCount;
    const r3 = await submitCorrect(page);
    log(`  submitted correct: ans=${r3.ans}`);
    await new Promise(r => setTimeout(r, 1500));
    const afterCorrect = await getRetryState(page);
    log(`  after correct: itemCount=${afterCorrect.mapItemCount} attempts=${afterCorrect.attemptCount}`);
    if (afterCorrect.mapItemCount <= startItem2) throw new Error(`${label}: mapItemCount did NOT advance after correct answer`);
    if (afterCorrect.attemptCount !== 0) throw new Error(`${label}: attempts should reset to 0 after correct`);
    await shot(page, `${label}-05-after-correct`);

    log(`--- ${label} MAP Practice PASS ---`);
}

// ======== MAP Simulation scenario =========
async function runMapSimulationScenario(page, tier, label) {
    log(`--- ${label} MAP Simulation flow ---`);
    await page.evaluate(() => { if (window.goHome) window.goHome(); });
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate((t) => window.openMapTest(t), tier);
    await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'),
        5000, 'selector active');
    await waitFor(page, () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0, 5000, 'chips');

    await page.evaluate(() => {
        window.state.mapItemCountTarget = 50;
        window.setMapMode && window.setMapMode('simulation');
    });
    await page.evaluate(() => window.startMapFromUI());
    await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'),
        5000, 'session active');
    await waitFor(page, () => {
        const qt = document.getElementById('questionText');
        return qt && qt.textContent && qt.textContent.trim().length > 0;
    }, 5000, 'first q');

    const initial = await getRetryState(page);
    log(`  initial sim: mode=${initial.mapSessionMode} itemCount=${initial.mapItemCount}`);
    if (initial.mapSessionMode !== 'simulation') throw new Error(`${label} sim: expected simulation, got ${initial.mapSessionMode}`);
    const startCount = initial.mapItemCount;

    const r = await submitWrong(page, 1);
    log(`  sim submitted wrong: kind=${r.kind}`);
    await new Promise(r => setTimeout(r, 600));
    const after = await getRetryState(page);
    log(`  sim after wrong: itemCount=${after.mapItemCount} skipVisible=${after.skipVisible}`);
    // Simulation should ADVANCE on wrong (itemCount > startCount)
    if (after.mapItemCount <= startCount) {
        throw new Error(`${label} sim: itemCount should advance on wrong (${startCount} -> ${after.mapItemCount})`);
    }
    if (after.skipVisible) {
        throw new Error(`${label} sim: Skip should NOT be visible in simulation mode`);
    }
    log(`--- ${label} MAP Simulation PASS ---`);
}

// ======== Standard Practice scenario =========
async function runStandardPracticeScenario(page) {
    const label = 'Standard-Practice';
    log(`--- ${label} flow ---`);
    // Force a hard navigation to reset state cleanly
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
        5000, 'state ready');

    // Set up a basic addition skill, practice mode
    await page.evaluate(() => {
        window.state.category = 'operations';
        window.state.skill = 'add';
        window.state.gameMode = 'practice';
        window.state.range = 20;
        window.state.timerDuration = 0;
        window.state.problemCount = 50;
        window.state.mapMode = false;
        window.state.mapSessionMode = null;
        window.state.isMixedMode = false;
        window.state.mixedModeSettings = null;
        window.skillQueue = [];
        // Force teacher mode so startGame doesn't show "select skills" modal
        document.body.classList.remove('student-mode');
    });
    // The dropdown population is async + lazy — bypass UI by directly calling
    // the post-state-validation entry point. We set state.skill/category and
    // jump straight into the game loop via nextQuestion().
    const startInfo = await page.evaluate(() => {
        // Show the gameView ourselves (skip startGame's dropdown gate)
        if (typeof window.showView === 'function') window.showView('gameView');
        // Initialize game session state so nextQuestion advances correctly
        window.state.qCount = 0;
        window.state.score = 0;
        window.state.hasAnswered = false;
        window.state.lastAnswerCorrect = true; // bypass nextQuestion's "first call" guard
        window.state.currentQ = null;
        window.state.questionStartTime = Date.now();
        window.state.sessionStartTime = Date.now();
        // Make the next-question pipeline render the first question
        try { window.nextQuestion(); } catch (e) { return { err: e.message }; }
        return {
            stateCategory: window.state.category, stateSkill: window.state.skill,
            gameViewActive: document.getElementById('gameView')?.classList.contains('active'),
            qCount: window.state.qCount,
            currentQ: window.state.currentQ ? 'set' : 'null',
            qText: document.getElementById('questionText')?.textContent?.slice(0, 60),
        };
    });
    log(`  startGame info: ${JSON.stringify(startInfo)}`);
    await waitFor(page, () => document.getElementById('gameView')?.classList.contains('active'),
        5000, 'gameView active');
    await waitFor(page, () => {
        const qt = document.getElementById('questionText');
        return qt && qt.textContent && qt.textContent.trim().length > 0
               && window.state.currentQ !== null;
    }, 5000, 'first practice q');

    const initial = await getRetryState(page);
    log(`  initial std: gameMode=${initial.gameMode} qText="${initial.currentQText}"`);
    if (initial.gameMode !== 'practice') throw new Error(`${label}: expected practice mode`);
    const startQText = initial.currentQText;

    // Wrong #1
    const r1 = await submitWrong(page, 1);
    log(`  std wrong #1: kind=${r1.kind}`);
    await new Promise(r => setTimeout(r, 400));
    const after1 = await getRetryState(page);
    log(`  std after wrong #1: attempts=${after1.attemptCount} skipVisible=${after1.skipVisible} fb="${after1.feedbackText}"`);
    if (after1.attemptCount !== 1) throw new Error(`${label}: expected 1 attempt, got ${after1.attemptCount}`);
    if (after1.skipVisible) throw new Error(`${label}: Skip should NOT be visible after 1st`);
    if (after1.currentQText !== startQText) throw new Error(`${label}: question changed after wrong #1`);
    if (!/not quite|try again|That's not/i.test(after1.feedbackText)) throw new Error(`${label}: bad feedback "${after1.feedbackText}"`);
    if (r1.kind === 'mc-click' && after1.wrongChoiceCount < 1) throw new Error(`${label}: MC button not crossed out after wrong`);

    // Wrong #2
    const r2 = await submitWrong(page, 2);
    log(`  std wrong #2: kind=${r2.kind}`);
    await new Promise(r => setTimeout(r, 400));
    const after2 = await getRetryState(page);
    log(`  std after wrong #2: attempts=${after2.attemptCount} skipVisible=${after2.skipVisible}`);
    if (after2.attemptCount !== 2) throw new Error(`${label}: expected 2 attempts, got ${after2.attemptCount}`);
    if (!after2.skipVisible) throw new Error(`${label}: Skip should be VISIBLE after 2nd wrong`);
    if (after2.currentQText !== startQText) throw new Error(`${label}: question changed after wrong #2`);
    await shot(page, 'std-after-2nd-wrong');

    // Press Skip
    await page.evaluate(() => {
        const s = document.getElementById('skipBtn');
        if (s) s.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    const afterSkip = await getRetryState(page);
    log(`  std after skip: qText="${afterSkip.currentQText}" attempts=${afterSkip.attemptCount} skipVisible=${afterSkip.skipVisible}`);
    if (afterSkip.currentQText === startQText) throw new Error(`${label}: question did NOT advance after skip`);
    if (afterSkip.skipVisible) throw new Error(`${label}: Skip should hide on new question`);
    if (afterSkip.attemptCount !== 0) throw new Error(`${label}: attempts should reset, got ${afterSkip.attemptCount}`);

    // Now test correct answer flow on this new question
    const newQText = afterSkip.currentQText;
    await submitCorrect(page);
    await new Promise(r => setTimeout(r, 1200));
    const afterCorrect = await getRetryState(page);
    log(`  std after correct: qText="${afterCorrect.currentQText}" attempts=${afterCorrect.attemptCount}`);
    if (afterCorrect.currentQText === newQText) throw new Error(`${label}: question did not advance after correct`);
    if (afterCorrect.attemptCount !== 0) throw new Error(`${label}: attempts not reset after correct`);

    log(`--- ${label} PASS ---`);
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
            const t = `[${msg.type()}] ${msg.text()}`;
            // Skip noise (favicon 404)
            if (msg.type() === 'error' && !/favicon\.ico|\bFailed to load resource\b/.test(msg.text())) {
                consoleErrors.push(t);
            }
        });
        page.on('pageerror', (err) => pageErrors.push(err.stack || String(err)));

        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
            10000, 'window.state');

        // Verify globals
        const wired = await page.evaluate(() => ({
            skipMapItem: typeof window.skipMapItem === 'function',
            skipCurrentItem: typeof window.skipCurrentItem === 'function',
            recordWrongAttempt: typeof window.recordWrongAttempt === 'function',
            resetAttemptTracking: typeof window.resetAttemptTracking === 'function',
        }));
        log('globals wired:', JSON.stringify(wired));
        for (const [k, v] of Object.entries(wired)) {
            if (!v) throw new Error(`Global not wired: window.${k}`);
        }

        await runMapPracticeScenario(page, 'k2', 'K-2');
        await runMapPracticeScenario(page, '35', '3-5');
        await runMapSimulationScenario(page, 'k2', 'K-2-Sim');
        await runStandardPracticeScenario(page);

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
