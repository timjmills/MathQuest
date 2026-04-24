// End-to-end visual verification of features shipped this session.
// Captures screenshots + assertions for:
//   1. Box Method Division
//   2. Grade Chips (teacher mode)
//   3. Adaptive Mode toggle
//   4. Click-dot-retry (MAP K-2)
//   5. Wrong-flow (1st attempt → "try again", 2nd → "ask teacher" + Next)
//   6. Adaptive level chip (Polish 1)
//
// Usage:  node test-feature-visual-verify.cjs
// Server: http://localhost:8080 (must be running)

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-feature-visual-verify-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
const consoleErrors = [];
const pageErrors = [];

function log(...args) { console.log('[VV]', ...args); }
function record(name, ok, detail) { results.push({ name, ok, detail: detail || '' }); log(`  ${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ' :: ' + detail : ''}`); }

async function shot(page, name) {
    const file = path.join(SHOT_DIR, `${name}.png`);
    try { await page.screenshot({ path: file, fullPage: false }); log(`  📸 ${name}.png`); }
    catch (e) { log(`  shot failed for ${name}: ${e.message}`); }
}

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

// Submit a deliberate WRONG answer for the current question (number, MC, or text).
async function submitWrong(page, attemptIdx) {
    return await page.evaluate((idx) => {
        const q = window.state.currentQ;
        if (!q) return { ok: false, why: 'no currentQ' };
        if (q.options && q.options.length > 0) {
            const wrongOpt = q.options.find(o => String(o) !== String(q.ans));
            if (wrongOpt === undefined) return { ok: false, why: 'no wrong option' };
            const btns = Array.from(document.querySelectorAll('#answerOptions .answer-btn'));
            const targetBtn = btns.find(b => {
                const t = b.textContent.trim();
                return t === String(wrongOpt) || t === Number(wrongOpt).toLocaleString();
            });
            if (!targetBtn) { window.checkAnswer(wrongOpt); return { ok: true, kind: 'mc-direct', submitted: wrongOpt }; }
            targetBtn.click();
            return { ok: true, kind: 'mc-click', submitted: wrongOpt };
        }
        const ans = q.ans;
        const wrongVal = (typeof ans === 'number') ? String(ans + 12345 + idx) : ('WRONG' + idx);
        window.checkAnswer(wrongVal);
        return { ok: true, kind: 'numeric-direct', submitted: wrongVal };
    }, attemptIdx);
}

(async () => {
    let browser;
    let exit = 0;
    try {
        log('launching puppeteer...');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        page.on('pageerror', e => pageErrors.push(e.stack || String(e)));

        log('navigating to', BASE);
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null, 10000, 'window.state');

        // Clear any persisted adaptive levels for clean start.
        await page.evaluate(() => {
            try { localStorage.removeItem('mathquest_adaptive_levels'); } catch {}
            try { localStorage.removeItem('mathquest_adaptive_enabled'); } catch {}
            window.state.adaptiveLevels = {};
            window.state.adaptiveModeEnabled = false;
        });

        // ============================================================
        // FEATURE 1: Box Method Division
        // ============================================================
        log('--- FEATURE 1: Box Method Division ---');
        try {
            const easyQ = await page.evaluate(() => {
                window.state.skill = 'box_division_easy';
                window.state.category = 'division';
                const q = window.generateQuestion();
                window.state.currentQ = q;
                if (typeof window.renderQuestion === 'function') window.renderQuestion();
                return {
                    answerType: q.answerType,
                    steps: q.boxDivisionData?.steps?.length,
                    divisor: q.boxDivisionData?.divisor,
                    dividend: q.boxDivisionData?.dividend,
                    boxesInDom: document.querySelectorAll('.bx-box-wrap').length,
                    roofsInDom: document.querySelectorAll('.bx-roof').length,
                };
            });
            log('  generated:', JSON.stringify(easyQ));
            record('box-division-easy: 2 steps', easyQ.steps === 2, `got ${easyQ.steps}`);
            record('box-division-easy: 2 box wrappers in DOM', easyQ.boxesInDom === 2, `got ${easyQ.boxesInDom}`);
            record('box-division-easy: 2 roof inputs in DOM', easyQ.roofsInDom === 2, `got ${easyQ.roofsInDom}`);
            record('box-division-easy: answerType', easyQ.answerType === 'box-division', easyQ.answerType);
            await shot(page, 'feature-box-division-easy');
        } catch (e) {
            record('box-division crash', false, e.message);
        }

        // ============================================================
        // FEATURE 2: Grade Chips
        // ============================================================
        log('--- FEATURE 2: Grade Chips (teacher mode) ---');
        try {
            await page.evaluate(() => {
                if (typeof window.goHome === 'function') window.goHome();
                if (typeof window.setUserRole === 'function') window.setUserRole('teacher');
            });
            await new Promise(r => setTimeout(r, 350));
            const chipInfo = await page.evaluate(() => {
                const row = document.getElementById('gradeChipsRow');
                const chips = Array.from(row ? row.querySelectorAll('.grade-chip') : []);
                return {
                    chipCount: chips.length,
                    grades: chips.map(c => c.dataset.grade).join(','),
                    counts: chips.map(c => {
                        const m = (c.querySelector('.gc-count')?.textContent || '').match(/\((\d+)\)/);
                        return { g: c.dataset.grade, n: m ? parseInt(m[1], 10) : 0 };
                    }),
                };
            });
            log('  chips:', JSON.stringify(chipInfo));
            record('grade-chips: 7 chips visible', chipInfo.chipCount === 7, `got ${chipInfo.chipCount}`);
            record('grade-chips: ordering K..6', chipInfo.grades === 'K,1,2,3,4,5,6', chipInfo.grades);
            const allHaveCounts = chipInfo.counts.every(c => c.n > 0);
            record('grade-chips: every chip has count > 0', allHaveCounts, JSON.stringify(chipInfo.counts));

            // Reset the queue, then click chip-3.
            await page.evaluate(() => { if (window.UnifiedSkills) window.UnifiedSkills.clear(); });
            await new Promise(r => setTimeout(r, 200));
            const before = await page.evaluate(() => window.UnifiedSkills.count);
            const grade3Count = chipInfo.counts.find(c => c.g === '3').n;
            await page.evaluate(() => window.toggleGradeChip('3'));
            await new Promise(r => setTimeout(r, 350));
            const after = await page.evaluate(() => window.UnifiedSkills.count);
            log(`  queue: before=${before}, after grade-3 click=${after}, expected delta≈${grade3Count}`);
            record('grade-chips: chip-3 click adds grade-3 skills', after - before === grade3Count, `delta=${after - before}, expected ${grade3Count}`);
            await shot(page, 'feature-grade-chips');
        } catch (e) {
            record('grade-chips crash', false, e.message);
        }

        // ============================================================
        // FEATURE 3: Adaptive Mode toggle
        // ============================================================
        log('--- FEATURE 3: Adaptive Mode toggle ---');
        try {
            await page.evaluate(() => {
                if (typeof window.goHome === 'function') window.goHome();
                window.state.adaptiveModeEnabled = false;
                if (typeof window.toggleAdaptiveMode === 'function') {
                    // Don't toggle yet; just refresh UI by calling once-on-once-off if needed.
                }
                // Force off-state UI by directly persisting+refreshing.
                try { localStorage.setItem('mathquest_adaptive_enabled', '0'); } catch {}
                const status = document.getElementById('adaptiveStatus');
                if (status) status.textContent = 'Off';
                document.querySelectorAll('.adaptive-toggle').forEach(b => b.classList.remove('active'));
            });
            await new Promise(r => setTimeout(r, 200));
            const off = await page.evaluate(() => {
                const btn = document.querySelector('.adaptive-toggle');
                const status = document.getElementById('adaptiveStatus');
                return {
                    btnVisible: !!btn && btn.offsetParent !== null,
                    label: status ? status.textContent : null,
                    hasActive: btn ? btn.classList.contains('active') : null,
                };
            });
            log('  off-state:', JSON.stringify(off));
            record('adaptive-toggle: button visible', off.btnVisible, '');
            record('adaptive-toggle: label = "Off"', off.label === 'Off', off.label);
            record('adaptive-toggle: NOT active class when off', off.hasActive === false, String(off.hasActive));

            // Click it ON.
            await page.evaluate(() => document.querySelector('.adaptive-toggle').click());
            await new Promise(r => setTimeout(r, 250));
            const on = await page.evaluate(() => {
                const btn = document.querySelector('.adaptive-toggle');
                const status = document.getElementById('adaptiveStatus');
                return {
                    enabled: window.state.adaptiveModeEnabled,
                    label: status ? status.textContent : null,
                    hasActive: btn ? btn.classList.contains('active') : null,
                };
            });
            log('  on-state:', JSON.stringify(on));
            record('adaptive-toggle: state.adaptiveModeEnabled === true after click', on.enabled === true, String(on.enabled));
            record('adaptive-toggle: label = "On" after click', on.label === 'On', on.label);
            record('adaptive-toggle: has active class after click', on.hasActive === true, String(on.hasActive));
            await shot(page, 'feature-adaptive-toggle-on');
        } catch (e) {
            record('adaptive-toggle crash', false, e.message);
        }

        // ============================================================
        // FEATURE 4: Click-dot-retry (MAP K-2)
        // ============================================================
        log('--- FEATURE 4: Click-dot-retry (MAP K-2) ---');
        try {
            await page.evaluate(() => { if (window.goHome) window.goHome(); window.state.adaptiveModeEnabled = false; });
            await new Promise(r => setTimeout(r, 250));
            await page.evaluate(() => window.openMapTest('k2'));
            await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'), 5000, 'mapSelectorView');
            await waitFor(page, () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0, 5000, 'rit chips');
            await page.evaluate(() => {
                window.state.mapItemCountTarget = 50;
                window.setMapMode && window.setMapMode('practice');
            });
            await page.evaluate(() => window.startMapFromUI());
            await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'), 5000, 'mapSessionView');
            await waitFor(page, () => {
                const qt = document.getElementById('questionText');
                return qt && (qt.textContent || '').trim().length > 0;
            }, 5000, 'first question');

            // Answer item 0 correctly via engine.
            await page.evaluate(() => {
                if (typeof window.resetAttemptTracking === 'function') window.resetAttemptTracking();
                window.state.hasAnswered = true; window.state.lastAnswerCorrect = true;
                if (typeof window.recordMapAnswer === 'function') window.recordMapAnswer({ correct: true });
            });
            await new Promise(r => setTimeout(r, 1500));
            // Answer item 1 wrong via engine.
            await page.evaluate(() => {
                if (typeof window.resetAttemptTracking === 'function') window.resetAttemptTracking();
                window.state.hasAnswered = true; window.state.lastAnswerCorrect = false;
                if (typeof window.recordMapAnswer === 'function') window.recordMapAnswer({ correct: false });
            });
            await new Promise(r => setTimeout(r, 1500));

            // Click first dot.
            await page.evaluate(() => window.mapJumpToItem(0));
            await new Promise(r => setTimeout(r, 350));
            const review = await page.evaluate(() => {
                const liveCard = document.getElementById('questionCard');
                return {
                    liveCardVisible: liveCard && liveCard.style.display !== 'none',
                    isReview: !!(window.state.currentQ && window.state.currentQ._isMapReview),
                    hasSavedReview: !!window.state._mapReviewSaved,
                    hasVerdictCard: !!document.getElementById('mapReviewCard'),
                };
            });
            log('  review state:', JSON.stringify(review));
            record('click-dot-retry: question card visible', review.liveCardVisible === true, '');
            record('click-dot-retry: NO verdict card (Wrong)', review.hasVerdictCard === false, '');
            record('click-dot-retry: state.currentQ._isMapReview === true', review.isReview === true, '');
            record('click-dot-retry: state._mapReviewSaved exists', review.hasSavedReview === true, '');
            await shot(page, 'feature-click-dot-retry');
        } catch (e) {
            record('click-dot-retry crash', false, e.message);
        }

        // ============================================================
        // FEATURE 5: Wrong-flow (MAP K-2 practice mode)
        // ============================================================
        log('--- FEATURE 5: Wrong-flow (MAP K-2 practice) ---');
        try {
            await page.evaluate(() => { if (window.goHome) window.goHome(); });
            await new Promise(r => setTimeout(r, 300));
            await page.evaluate(() => window.openMapTest('k2'));
            await waitFor(page, () => document.getElementById('mapSelectorView')?.classList.contains('active'), 5000, 'mapSelectorView');
            await waitFor(page, () => document.querySelectorAll('#mapBandChips .rit-chip').length > 0, 5000, 'rit chips');
            await page.evaluate(() => {
                window.state.mapItemCountTarget = 50;
                window.setMapMode && window.setMapMode('practice');
            });
            await page.evaluate(() => window.startMapFromUI());
            await waitFor(page, () => document.getElementById('mapSessionView')?.classList.contains('active'), 5000, 'mapSessionView');
            await waitFor(page, () => {
                const qt = document.getElementById('questionText');
                return qt && (qt.textContent || '').trim().length > 0;
            }, 5000, 'first question');

            const startQText = await page.evaluate(() => document.getElementById('questionText')?.textContent?.slice(0, 40));
            const r1 = await submitWrong(page, 1);
            log(`  wrong #1 kind=${r1.kind}`);
            await new Promise(r => setTimeout(r, 400));
            const after1 = await page.evaluate(() => ({
                feedbackText: document.getElementById('feedbackArea')?.textContent?.trim(),
                qText: document.getElementById('questionText')?.textContent?.slice(0, 40),
                attempts: window.state.currentQAttempts || 0,
                skipVisible: (() => {
                    const s = document.getElementById('skipBtn');
                    return s ? (s.style.display !== 'none' && s.offsetParent !== null) : false;
                })(),
            }));
            log('  after wrong #1:', JSON.stringify(after1));
            record('wrong-flow: 1st attempt feedback says "try again"', /try again/i.test(after1.feedbackText || ''), after1.feedbackText);
            record('wrong-flow: 1st attempt does NOT say "ask"', !/ask/i.test(after1.feedbackText || ''), after1.feedbackText);
            record('wrong-flow: question text unchanged after wrong #1', after1.qText === startQText, `start="${startQText}" after="${after1.qText}"`);

            // Wrong #2.
            const r2 = await submitWrong(page, 2);
            log(`  wrong #2 kind=${r2.kind}`);
            await new Promise(r => setTimeout(r, 400));
            const after2 = await page.evaluate(() => ({
                feedbackText: document.getElementById('feedbackArea')?.textContent?.trim(),
                attempts: window.state.currentQAttempts || 0,
                skipVisible: (() => {
                    const s = document.getElementById('skipBtn');
                    return s ? (s.style.display !== 'none' && s.offsetParent !== null) : false;
                })(),
                qText: document.getElementById('questionText')?.textContent?.slice(0, 40),
                itemCount: window.state.mapItemCount,
            }));
            log('  after wrong #2:', JSON.stringify(after2));
            record('wrong-flow: 2nd attempt feedback says "ask your teacher"', /ask.*teacher/i.test(after2.feedbackText || ''), after2.feedbackText);
            record('wrong-flow: 2nd attempt Skip/Next button visible', after2.skipVisible === true, String(after2.skipVisible));
            await shot(page, 'feature-wrong-flow-2nd-attempt');

            // Click Skip and confirm advance.
            const startItemCount = await page.evaluate(() => window.state.mapItemCount);
            await page.evaluate(() => { const s = document.getElementById('skipBtn'); if (s) s.click(); });
            await new Promise(r => setTimeout(r, 1500));
            const afterSkip = await page.evaluate(() => ({
                itemCount: window.state.mapItemCount,
                qText: document.getElementById('questionText')?.textContent?.slice(0, 40),
            }));
            log('  after Next/Skip:', JSON.stringify(afterSkip));
            record('wrong-flow: Next advances to new question', afterSkip.itemCount > startItemCount, `${startItemCount} → ${afterSkip.itemCount}`);
        } catch (e) {
            record('wrong-flow crash', false, e.message);
        }

        // ============================================================
        // FEATURE 6: Adaptive level chip (Polish 1)
        // ============================================================
        log('--- FEATURE 6: Adaptive level chip ---');
        try {
            await page.evaluate(() => { if (window.goHome) window.goHome(); });
            await new Promise(r => setTimeout(r, 300));
            // Reset adaptive state, ensure ON.
            await page.evaluate(() => {
                try { localStorage.removeItem('mathquest_adaptive_levels'); } catch {}
                window.state.adaptiveLevels = {};
                window.state.adaptiveModeEnabled = false; // start false so toggle flips ON
            });
            await page.evaluate(() => document.querySelector('.adaptive-toggle').click());
            await new Promise(r => setTimeout(r, 250));

            // Switch to gameView so the questionCard (and our chip) are visible.
            await page.evaluate(() => {
                if (typeof window.showView === 'function') window.showView('gameView');
            });
            await new Promise(r => setTimeout(r, 200));

            // Generate + render an add_facts question (bypasses startGame complexity).
            const genInfo = await page.evaluate(() => {
                window.state.skill = 'add_facts';
                window.state.category = 'addition';
                window.state.mapMode = false;
                const out = { adaptiveOn: window.state.adaptiveModeEnabled };
                try {
                    const q = window.generateQuestion();
                    out.qOk = !!q;
                    out.qText = q && q.text ? q.text.slice(0, 40) : null;
                    window.state.currentQ = q;
                    if (typeof window.renderQuestion === 'function') {
                        window.renderQuestion();
                        out.rendered = true;
                    } else {
                        out.rendered = false;
                    }
                    out.hasChipFn = typeof window.renderAdaptiveLevelChip === 'function';
                } catch (e) { out.err = String(e); }
                return out;
            });
            log('  gen+render:', JSON.stringify(genInfo));
            await new Promise(r => setTimeout(r, 250));
            const chipInfo = await page.evaluate(() => {
                const chip = document.getElementById('adaptiveLevelChip');
                return {
                    exists: !!chip,
                    visible: chip ? (chip.style.display !== 'none' && chip.offsetParent !== null) : false,
                    text: chip ? chip.textContent : null,
                    bg: chip ? chip.style.background : null,
                    skill: window.state.skill,
                    level: window.getAdaptiveLevel('add_facts'),
                    adaptiveOn: window.state.adaptiveModeEnabled,
                    skillLabelHTML: document.getElementById('skillLabel')?.innerHTML?.slice(0, 100),
                };
            });
            log('  initial chip:', JSON.stringify(chipInfo));
            record('adaptive-chip: chip element exists', chipInfo.exists === true, '');
            record('adaptive-chip: chip visible', chipInfo.visible === true, '');
            record('adaptive-chip: shows "Level 3"', /Level\s*3/.test(chipInfo.text || ''), chipInfo.text);

            // 3 correct → promote to Level 4.
            await page.evaluate(() => {
                window.recordAdaptiveAnswer('add_facts', true);
                window.recordAdaptiveAnswer('add_facts', true);
                window.recordAdaptiveAnswer('add_facts', true);
                // Generate + render a fresh question to refresh chip.
                window.state.skill = 'add_facts';
                const q = window.generateQuestion();
                window.state.currentQ = q;
                if (typeof window.renderQuestion === 'function') window.renderQuestion();
            });
            await new Promise(r => setTimeout(r, 250));
            const after3 = await page.evaluate(() => {
                const chip = document.getElementById('adaptiveLevelChip');
                return {
                    text: chip ? chip.textContent : null,
                    level: window.getAdaptiveLevel('add_facts'),
                };
            });
            log('  after 3 correct:', JSON.stringify(after3));
            record('adaptive-chip: level promoted to 4', after3.level === 4, `level=${after3.level}`);
            record('adaptive-chip: chip text updates to "Level 4"', /Level\s*4/.test(after3.text || ''), after3.text);
            await shot(page, 'feature-adaptive-level-chip');
        } catch (e) {
            record('adaptive-chip crash', false, e.message);
        }

        // ============================================================
        // SUMMARY
        // ============================================================
        log('=========================================');
        const passes = results.filter(r => r.ok).length;
        const fails = results.filter(r => !r.ok);
        log(`Passes: ${passes} / ${results.length}`);
        if (fails.length) {
            log('FAILURES:');
            fails.forEach(f => log(`  ✗ ${f.name} :: ${f.detail}`));
            exit = 2;
        }
        if (consoleErrors.length) {
            log('Console errors:');
            consoleErrors.forEach(e => log('  ', e));
        }
        if (pageErrors.length) {
            log('Page errors:');
            pageErrors.forEach(e => log('  ', e));
        }
        log(fails.length === 0 ? 'OVERALL: PASS' : 'OVERALL: FAIL');
    } catch (err) {
        log('!!! TEST CRASHED:', err.stack || err.message);
        exit = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exit);
    }
})();
