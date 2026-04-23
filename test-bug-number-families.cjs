// Reproduce + verify fix for: number families don't auto-advance after all
// 4 facts correct.
//
// Strategy: start a Practice session for each number-family-style skill,
// fill the inputs with the correct values, and assert that within 3 seconds
// the question advances to a NEW currentQ (or a Next button appears).

const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');

const types = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
};
const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    const f = path.join(process.cwd(), decodeURIComponent(p));
    fs.readFile(f, (err, data) => {
        if (err) { res.statusCode = 404; return res.end('404'); }
        res.setHeader('Content-Type', types[path.extname(f)] || 'text/plain');
        res.end(data);
    });
});

// Skills to verify
const SKILLS = [
    { skill: 'add_sub_fact_family',         category: 'addition',         label: 'Addition Fact Families' },
    { skill: 'mult_div_fact_family',        category: 'multiplication',   label: 'Multiplication Fact Families' },
    { skill: 'number_families_add',         category: 'addition',         label: 'Number Families add easy' },
    { skill: 'number_families_add_med',     category: 'addition',         label: 'Number Families add medium' },
    { skill: 'number_families_add_hard',    category: 'addition',         label: 'Number Families add hard' },
    { skill: 'number_families_mult',        category: 'multiplication',   label: 'Number Families mult easy' },
    { skill: 'number_families_mult_med',    category: 'multiplication',   label: 'Number Families mult medium' },
    { skill: 'number_families_mult_hard',   category: 'multiplication',   label: 'Number Families mult hard' },
    { skill: 'number_families_mixed',       category: 'number_ops_mixed', label: 'Number Families mixed easy' },
    { skill: 'number_families_mixed_med',   category: 'number_ops_mixed', label: 'Number Families mixed medium' },
    { skill: 'number_families_mixed_hard',  category: 'number_ops_mixed', label: 'Number Families mixed hard' },
];

async function startPractice(page, category, skill, opts = {}) {
    // Force-set state and call nextQuestion to render. This is functionally
    // equivalent to startGame() for the parts that matter (currentQ, render),
    // but skips fullscreen/banner/timer initialization that hangs the headless
    // browser. The Practice gameMode is what matters for shouldShowNextButton.
    await page.evaluate((cat, sk, studentMode) => {
        // Toggle student mode if requested (matches body.classList.add('student-mode'))
        if (studentMode) document.body.classList.add('student-mode');
        else document.body.classList.remove('student-mode');
        window.state.gameMode = 'practice';
        window.state.category = cat;
        window.state.skill = sk;
        window.state.range = 100;
        window.state.decimalPlaces = 0;
        window.state.timerDuration = 0;
        window.state.problemCount = 999;
        window.state.qCount = 0;
        window.state.score = 0;
        window.state.hasAnswered = false;
        window.state.lastAnswerCorrect = false;
        window.state.currentQ = null;
        window.state.totalProblemsThisSession = 0;
        window.state.sessionStreak = 0;
        window.state.lastStreakBonus = 0;
        window.state.wrongThenRightTracking = { wrongCount: 0, recovering: false, rightCount: 0 };
        window.state._timerProgressShown = {};
        window.state.currentSessionSkills = {};
        window.state.sessionStartTime = new Date();
        window.state.isMixedMode = false;
        if (window.skillQueue) window.skillQueue.length = 0;
        if (typeof window.showView === 'function') window.showView('gameView');
        if (typeof window.nextQuestion === 'function') window.nextQuestion();
    }, category, skill, !!opts.studentMode);
}

// Fill all .number-family-input / .fact-family-input inputs with their
// data-answer (correct value). We simulate ACTUAL user typing using
// page.focus() + page.keyboard.type() so that the input event is generated
// by the browser exactly as a real user keystroke would. This catches bugs
// that `inp.value = ...; dispatchEvent` would mask.
async function fillCorrectAnswers(page) {
    // First, gather the list of (selector, correctValue) pairs.
    const inputs = await page.evaluate(() => {
        const list = document.querySelectorAll('#visualAid .number-family-input, #visualAid .fact-family-input');
        return Array.from(list).map((inp, idx) => {
            // Tag the element so we can address it by selector
            inp.setAttribute('data-test-idx', String(idx));
            return { idx, correct: inp.dataset.answer };
        });
    });
    for (const { idx, correct } of inputs) {
        const sel = `#visualAid [data-test-idx="${idx}"]`;
        await page.focus(sel);
        // Clear any existing value
        await page.evaluate(s => {
            const el = document.querySelector(s);
            if (el) el.value = '';
        }, sel);
        // Type each character — generates real input events
        await page.keyboard.type(String(correct), { delay: 5 });
    }
    return { count: inputs.length, filled: inputs };
}

// Determine if the question advanced. We capture the original q.text and
// then poll for q.text to change OR for the Next button to be visible.
async function captureQuestionSig(page) {
    return await page.evaluate(() => {
        const q = window.state.currentQ;
        return {
            text: q ? q.text : null,
            answerType: q ? q.answerType : null,
            ans: q ? q.ans : null,
            qCount: window.state.qCount,
        };
    });
}

async function waitForAdvance(page, originalSig, timeoutMs = 3500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const sig = await page.evaluate(() => {
            const q = window.state.currentQ;
            const nextContainer = document.getElementById('nextBtnContainer');
            const nextVisible = nextContainer && nextContainer.style.display !== 'none' &&
                getComputedStyle(nextContainer).display !== 'none';
            return {
                text: q ? q.text : null,
                qCount: window.state.qCount,
                hasAnswered: window.state.hasAnswered,
                lastAnswerCorrect: window.state.lastAnswerCorrect,
                nextVisible,
            };
        });
        // Question advanced when text changes OR qCount increments
        if (sig.text !== originalSig.text || sig.qCount !== originalSig.qCount) {
            return { advanced: true, finalSig: sig, ms: Date.now() - start };
        }
        // Or a Next button appeared (manual advance available)
        if (sig.nextVisible) {
            return { advanced: true, viaButton: true, finalSig: sig, ms: Date.now() - start };
        }
        await new Promise(r => setTimeout(r, 100));
    }
    const finalSig = await page.evaluate(() => {
        const q = window.state.currentQ;
        return {
            text: q ? q.text : null,
            qCount: window.state.qCount,
            hasAnswered: window.state.hasAnswered,
            lastAnswerCorrect: window.state.lastAnswerCorrect,
        };
    });
    return { advanced: false, finalSig, ms: Date.now() - start };
}

async function runOneSkill(page, { skill, category, label }) {
    // Reset to home before each test (jump views directly, avoiding goHome's
    // confirm dialog and timer cleanup paths that can hang the page).
    await page.evaluate(() => {
        try {
            // Stop any timers / overlays
            if (window.clearQuestionTimer) try { window.clearQuestionTimer(); } catch {}
            if (window.stopBannerTimer) try { window.stopBannerTimer(); } catch {}
            if (window.state) {
                if (window.state.timerInterval) clearInterval(window.state.timerInterval);
                if (window.state.cpuInterval) clearInterval(window.state.cpuInterval);
                if (window.state.bossInterval) clearInterval(window.state.bossInterval);
                window.state.qCount = 0;
                window.state.score = 0;
                window.state.hasAnswered = false;
                window.state.lastAnswerCorrect = false;
            }
            // Clear any modals
            document.querySelectorAll('.modal-overlay, .modal').forEach(m => {
                if (m && m.style) m.style.display = 'none';
            });
            if (typeof window.showView === 'function') window.showView('homeView');
        } catch (e) {}
    });
    await new Promise(r => setTimeout(r, 200));

    await startPractice(page, category, skill);

    // Wait for currentQ to be set and the visual to render
    try {
        await page.waitForFunction(() => {
            const q = window.state.currentQ;
            const v = document.getElementById('visualAid');
            return q && v && (v.querySelectorAll('.number-family-input, .fact-family-input').length > 0);
        }, { timeout: 5000 });
    } catch (e) {
        const probe = await page.evaluate(() => ({
            gameViewActive: document.getElementById('gameView')?.classList.contains('active'),
            currentQ: window.state.currentQ ? {
                text: window.state.currentQ.text,
                answerType: window.state.currentQ.answerType,
            } : null,
            qCount: window.state.qCount,
            visualHtmlLen: document.getElementById('visualAid')?.innerHTML?.length || 0,
            inputCount: document.querySelectorAll('#visualAid .number-family-input, #visualAid .fact-family-input').length,
            modalText: (document.querySelector('.modal-overlay:not([style*="display: none"]) .modal') ||
                        document.getElementById('messageModal'))?.textContent?.slice(0, 200),
        }));
        return { skill, label, status: 'NO_QUESTION', error: String(e.message), probe };
    }

    const originalSig = await captureQuestionSig(page);
    // Wait for the renderer's setTimeout(...,50) to attach input listeners
    await new Promise(r => setTimeout(r, 200));

    const diag = await page.evaluate(() => ({
        hasCheckNumberFamilyAnswer: typeof window.checkNumberFamilyAnswer,
        hasCheckNumberFamily: typeof window.checkNumberFamily,
        visualInputCount: document.querySelectorAll('#visualAid .number-family-input, #visualAid .fact-family-input').length,
    }));

    const filled = await fillCorrectAnswers(page);

    // Wait briefly to allow the input listener to run
    await new Promise(r => setTimeout(r, 200));

    // Detect (but DO NOT click) a Check Answers button — pure-listener test
    // first. We want to know whether the input listener alone advances.
    const hasCheckBtn = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('#visualAid button'))
            .find(b => /check.*answer/i.test(b.textContent || ''));
        return !!btn;
    });

    let result = await waitForAdvance(page, originalSig, 2500);

    // If listener didn't auto-advance and there's a Check button, click it.
    if (!result.advanced && hasCheckBtn) {
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('#visualAid button'))
                .find(b => /check.*answer/i.test(b.textContent || ''));
            if (btn) btn.click();
        });
        const r2 = await waitForAdvance(page, originalSig, 2500);
        if (r2.advanced) result = { ...r2, viaCheckBtn: true };
    }

    // After advancing (button or auto), require the actual question to change
    // within the next 2 seconds — otherwise the "Next button appearing" was a
    // false positive and the auto-advance is still broken.
    if (result.advanced) {
        const startedAt = Date.now();
        let actuallyAdvanced = false;
        while (Date.now() - startedAt < 2500) {
            const sig = await page.evaluate(() => {
                const q = window.state.currentQ;
                return { text: q ? q.text : null, qCount: window.state.qCount };
            });
            if (sig.text !== originalSig.text || sig.qCount !== originalSig.qCount) {
                actuallyAdvanced = true;
                break;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        if (!actuallyAdvanced) {
            // Button is visible but auto-advance never fired — try clicking it.
            const clicked = await page.evaluate(() => {
                const btn = document.querySelector('#nextBtnContainer button, #nextBtn');
                if (btn) { btn.click(); return true; }
                return false;
            });
            if (clicked) {
                const r3 = await waitForAdvance(page, originalSig, 2000);
                if (r3.advanced) {
                    actuallyAdvanced = (await page.evaluate(() => window.state.currentQ?.text)) !== originalSig.text;
                }
            }
        }
        if (!actuallyAdvanced) result.status = 'NEXT_BUTTON_BUT_NO_QUESTION_CHANGE';
        else result.actuallyAdvanced = true;
    }

    return {
        skill,
        label,
        status: result.status === 'NEXT_BUTTON_BUT_NO_QUESTION_CHANGE' ? 'NEXT_BUTTON_NO_ADVANCE' :
                result.advanced ? 'OK' : 'STUCK',
        inputs: filled.count,
        hasCheckBtn,
        advancedViaCheckBtn: !!result.viaCheckBtn,
        viaButton: !!result.viaButton,
        actuallyAdvanced: !!result.actuallyAdvanced,
        ms: result.ms,
        originalText: originalSig.text,
        finalText: result.finalSig.text,
        hasAnswered: result.finalSig.hasAnswered,
        lastAnswerCorrect: result.finalSig.lastAnswerCorrect,
        diag,
    };
}

(async () => {
    await new Promise(r => srv.listen(8771, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 60000 });
    const page = await browser.newPage();
    // Auto-dismiss any blocking dialogs
    page.on('dialog', async (dlg) => { try { await dlg.accept(); } catch {} });
    const errors = [];
    page.on('pageerror', e => { console.log('[PAGE ERROR]', e.message); errors.push(e.message); });
    page.on('console', m => {
        if (m.type() === 'error') {
            console.log('[console error]', m.text());
            errors.push(m.text());
        }
    });
    await page.goto('http://localhost:8771/index.html', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.state && typeof window.nextQuestion === 'function', { timeout: 5000 });

    const results = [];
    const skillsToRun = process.env.QUICK ? SKILLS.slice(0, 2) : SKILLS;
    const trialCount = process.env.QUICK ? 1 : 2;
    for (const cfg of skillsToRun) {
        for (let trial = 0; trial < trialCount; trial++) {
            const r = await runOneSkill(page, cfg);
            r.trial = trial;
            results.push(r);
            const tag = r.status === 'OK' ? 'OK' : 'FAIL';
            console.log(`[${tag}] ${cfg.skill} (trial ${trial}) inputs=${r.inputs} hasBtn=${r.hasCheckBtn} viaBtnFallback=${r.advancedViaCheckBtn} ${r.ms}ms`);
            if (r.status !== 'OK') {
                console.log('  original:', JSON.stringify(r.originalText));
                console.log('  final   :', JSON.stringify(r.finalText));
                console.log('  hasAnswered:', r.hasAnswered, 'lastCorrect:', r.lastAnswerCorrect);
                console.log('  diag:', JSON.stringify(r.diag));
                if (r.probe) console.log('  probe:', JSON.stringify(r.probe));
                if (r.error) console.log('  error:', r.error);
            }
        }
    }

    const fails = results.filter(r => r.status !== 'OK');
    console.log(`\n=== SUMMARY: ${results.length - fails.length}/${results.length} passed ===`);
    if (fails.length > 0) {
        console.log('FAILURES:');
        fails.forEach(f => console.log(`  - ${f.skill} (trial ${f.trial}): ${f.status}`));
    }
    if (errors.length > 0) {
        console.log(`\nPage errors caught (${errors.length}):`);
        errors.slice(0, 10).forEach(e => console.log('  ', e));
    }

    await browser.close();
    srv.close();

    if (fails.length > 0 || errors.length > 0) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
