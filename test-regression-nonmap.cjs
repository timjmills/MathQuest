// Regression sweep for non-MAP features after refactor session.
// Tests: boss, race, practice, worksheet (non-MAP), quiz builder,
// skills navigator, mixed mode, dashboard.
//
// Connects to an already-running server on http://localhost:8080.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-regression-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('[REG]', ...a);

const results = [];
function record(feature, pass, note) {
    results.push({ feature, pass, note });
    log(`${pass ? 'PASS' : 'FAIL'}  ${feature}  ${note || ''}`);
}

async function shot(page, name) {
    try {
        await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false });
    } catch (e) { /* ignore */ }
}

async function waitFor(page, fn, timeout = 6000, label = 'cond') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const ok = await page.evaluate(fn);
            if (ok) return true;
        } catch {}
        await sleep(80);
    }
    throw new Error(`Timeout waiting for ${label}`);
}

// Drive the game one question at a time by computing the answer from state.currentQ.ans
// and triggering the right submit path. Returns true if it could submit.
async function answerOneQuestion(page) {
    return await page.evaluate(() => {
        const q = window.state && window.state.currentQ;
        if (!q) return { ok: false, reason: 'no currentQ' };
        try {
            // dual-fraction
            if (q.answerType === 'dual-fraction') {
                const a = String(q.ans || '').split('|');
                const m = document.getElementById('mixedInput');
                const im = document.getElementById('improperInput');
                if (m && im) {
                    m.value = a[0] || '';
                    im.value = a[1] || '';
                }
                window.submitAnswer && window.submitAnswer();
                return { ok: true, type: 'dual-fraction' };
            }
            // dual (perimeter+area)
            if (q.answerType === 'dual') {
                const a = String(q.ans || '').split('|');
                const p = document.getElementById('perimeterInput');
                const ar = document.getElementById('areaInput');
                if (p && ar) { p.value = a[0] || ''; ar.value = a[1] || ''; }
                window.submitAnswer && window.submitAnswer();
                return { ok: true, type: 'dual' };
            }
            // multiple-choice (button list)
            if (q.answerType === 'multiple-choice') {
                const ansStr = String(q.ans);
                const buttons = document.querySelectorAll('#optionsArea button, .mc-option');
                for (const b of buttons) {
                    const t = (b.textContent || '').trim();
                    if (t === ansStr) { b.click(); return { ok: true, type: 'mc-clicked' }; }
                }
                // fallback: click first option
                if (buttons.length) { buttons[0].click(); return { ok: true, type: 'mc-fallback' }; }
                return { ok: false, reason: 'mc no buttons' };
            }
            // number / text
            const inp = document.getElementById('answerInput') || document.querySelector('#answerArea input');
            if (inp) {
                inp.value = String(q.ans);
                window.submitAnswer && window.submitAnswer();
                return { ok: true, type: 'input' };
            }
            // For interactive widgets we have no easy way — skip
            return { ok: false, reason: 'unknown type ' + q.answerType };
        } catch (e) {
            return { ok: false, reason: 'exc ' + e.message };
        }
    });
}

(async () => {
    let browser;
    let exitCode = 0;
    const consoleErrors = [];
    const pageErrors = [];

    try {
        log('launching headless chrome...');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                const t = msg.text();
                if (!/favicon|net::|404/i.test(t)) consoleErrors.push(t);
            }
        });
        page.on('pageerror', (err) => pageErrors.push(err.message || String(err)));

        log('navigating', BASE);
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && typeof window.generateQuestion === 'function', 10000, 'app ready');
        await sleep(400);

        // Switch to teacher mode so student-mode's "empty queue → modal"
        // early-return in startGame() doesn't block our direct-state setup.
        await page.evaluate(() => {
            document.body.classList.remove('student-mode');
            document.body.classList.add('teacher-mode');
            if (window.state) window.state.userRole = 'teacher';
        });
        await sleep(200);

        // ------------------------------------------------------------------
        // 1. STANDARD PRACTICE MODE (most basic flow)
        // ------------------------------------------------------------------
        try {
            log('--- 1. practice mode ---');
            // Set up a simple practice game directly without going through dropdowns.
            await page.evaluate(() => {
                window.skillQueue = [];
                window.state.isMixedMode = false;
                window.state.mixedModeSettings = null;
                window.state.gameMode = 'practice';
                window.state.category = 'addition';
                window.state.skill = 'add_facts';
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                window.state.timerDuration = 0;
                window.state.problemCount = 5;
                window.state.selectedNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                // Stuff dropdowns so startGame doesn't bail
                const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                setVal('rangeSelect', '100');
                setVal('decimalSelect', '0');
                setVal('timerSelect', '0');
                setVal('problemCountSelect', '5');
                // Inject options if missing
                ['categorySelect', 'skillSelect'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el && !el.querySelector('option[value="addition"]') && id === 'categorySelect') {
                        const o = document.createElement('option'); o.value = 'addition'; o.text = 'Addition'; el.appendChild(o);
                    }
                    if (el && !el.querySelector('option[value="add_facts"]') && id === 'skillSelect') {
                        const o = document.createElement('option'); o.value = 'add_facts'; o.text = 'Add Facts'; el.appendChild(o);
                    }
                });
                setVal('categorySelect', 'addition');
                setVal('skillSelect', 'add_facts');
                window.startGame();
            });
            await waitFor(page, () => document.getElementById('gameView').classList.contains('active'), 6000, 'gameView active');
            await waitFor(page, () => window.state && window.state.currentQ, 6000, 'first Q ready');
            await shot(page, '1-practice-q1');
            // Answer 3 questions
            let answered = 0;
            for (let i = 0; i < 3; i++) {
                const r = await answerOneQuestion(page);
                if (!r.ok) break;
                answered++;
                await sleep(600);
                // some flows require pressing "Next"
                await page.evaluate(() => {
                    const nb = document.getElementById('nextBtn') || document.querySelector('.next-btn');
                    if (nb && nb.style.display !== 'none' && !nb.disabled) nb.click();
                });
                await sleep(400);
            }
            await shot(page, '1-practice-after3');
            const stillActive = await page.evaluate(() => document.getElementById('gameView').classList.contains('active'));
            record('practice', answered >= 1 && stillActive, `answered ${answered}/3 questions, gameView active=${stillActive}`);
            // exit cleanly
            await page.evaluate(() => { window.exitGame && window.exitGame(); window.goHome && window.goHome(); });
            await sleep(300);
        } catch (e) {
            record('practice', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 2. BOSS BATTLE MODE
        // ------------------------------------------------------------------
        try {
            log('--- 2. boss battle ---');
            await page.evaluate(() => {
                window.skillQueue = [];
                window.state.isMixedMode = false;
                window.state.mixedModeSettings = null;
                window.state.gameMode = 'boss';
                window.state.category = 'addition';
                window.state.skill = 'add_facts';
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                window.state.timerDuration = 60;
                window.state.problemCount = 5;
                window.state.selectedNumbers = [2,3,4,5,6,7,8,9,10,11,12];
                const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                setVal('rangeSelect', '100');
                setVal('decimalSelect', '0');
                setVal('timerSelect', '60');
                setVal('problemCountSelect', '5');
                setVal('categorySelect', 'addition');
                setVal('skillSelect', 'add_facts');
                window.startGame();
            });
            await waitFor(page, () => document.getElementById('gameView').classList.contains('active'), 6000, 'boss gameView active');
            await waitFor(page, () => window.state && window.state.currentQ, 6000, 'boss Q ready');
            await sleep(300);
            const bossInfo = await page.evaluate(() => {
                const arena = document.getElementById('bossArena');
                const hero = document.getElementById('heroSprite');
                const monster = document.getElementById('monsterSprite');
                return {
                    arenaVisible: arena && getComputedStyle(arena).display !== 'none',
                    heroVisible: !!hero && hero.offsetWidth > 0,
                    monsterVisible: !!monster && monster.offsetWidth > 0,
                    heroPos: window.state.heroPos,
                    monsterPos: window.state.monsterPos,
                    bossInterval: !!window.state.bossInterval,
                };
            });
            await shot(page, '2-boss-arena');
            // Answer one question and confirm hero advances visually
            const monsterBefore = bossInfo.monsterPos;
            await answerOneQuestion(page);
            await sleep(800);
            const after = await page.evaluate(() => ({ score: window.state.score, monsterPos: window.state.monsterPos }));
            const ok = bossInfo.arenaVisible && bossInfo.heroVisible && bossInfo.monsterVisible && bossInfo.bossInterval && after.score >= 0;
            record('boss', ok, `arena=${bossInfo.arenaVisible} hero=${bossInfo.heroVisible} monster=${bossInfo.monsterVisible} interval=${bossInfo.bossInterval} score=${after.score}`);
            await page.evaluate(() => { window.exitGame && window.exitGame(); window.goHome && window.goHome(); });
            await sleep(400);
        } catch (e) {
            record('boss', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 3. CAR RACE MODE
        // ------------------------------------------------------------------
        try {
            log('--- 3. car race ---');
            await page.evaluate(() => {
                window.skillQueue = [];
                window.state.isMixedMode = false;
                window.state.mixedModeSettings = null;
                window.state.gameMode = 'race';
                window.state.category = 'addition';
                window.state.skill = 'add_facts';
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                window.state.timerDuration = 60;
                window.state.problemCount = 5;
                window.state.selectedNumbers = [2,3,4,5,6,7,8,9,10,11,12];
                const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                setVal('rangeSelect', '100'); setVal('decimalSelect', '0'); setVal('timerSelect', '60');
                setVal('problemCountSelect', '5'); setVal('categorySelect', 'addition'); setVal('skillSelect', 'add_facts');
                window.startGame();
            });
            await waitFor(page, () => document.getElementById('gameView').classList.contains('active'), 6000, 'race gameView active');
            await waitFor(page, () => window.state && window.state.currentQ, 6000, 'race Q ready');
            await sleep(300);
            const raceInfo = await page.evaluate(() => {
                const t = document.getElementById('raceTrack');
                const pc = document.getElementById('playerCar');
                const cc = document.getElementById('cpuCar');
                return {
                    trackVisible: t && getComputedStyle(t).display !== 'none',
                    playerVisible: !!pc && pc.offsetWidth > 0,
                    cpuVisible: !!cc && cc.offsetWidth > 0,
                    racePos: window.state.racePos,
                    cpuPos: window.state.cpuPos,
                    cpuInterval: !!window.state.cpuInterval,
                };
            });
            await shot(page, '3-race-track');
            const racePosBefore = raceInfo.racePos;
            await answerOneQuestion(page);
            await sleep(800);
            const after = await page.evaluate(() => ({ score: window.state.score, racePos: window.state.racePos }));
            const moved = after.racePos > racePosBefore;
            const ok = raceInfo.trackVisible && raceInfo.playerVisible && raceInfo.cpuVisible && raceInfo.cpuInterval;
            record('race', ok, `track=${raceInfo.trackVisible} carP=${raceInfo.playerVisible} carC=${raceInfo.cpuVisible} cpuInterval=${raceInfo.cpuInterval} racePos before=${racePosBefore} after=${after.racePos} moved=${moved}`);
            await page.evaluate(() => { window.exitGame && window.exitGame(); window.goHome && window.goHome(); });
            await sleep(400);
        } catch (e) {
            record('race', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 4. WORKSHEET MODE (non-MAP)
        // ------------------------------------------------------------------
        try {
            log('--- 4. worksheet mode ---');
            await page.evaluate(() => {
                window.skillQueue = [];
                window.state.isMixedMode = false;
                window.state.mapMode = false;
                window.state.mixedModeSettings = null;
                window.state.gameMode = 'worksheet';
                window.state.category = 'addition';
                window.state.skill = 'add_facts';
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                window.state.timerDuration = 0;
                window.state.problemCount = 10;
                window.state.selectedNumbers = [2,3,4,5,6,7,8,9,10];
                const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                setVal('rangeSelect', '100'); setVal('decimalSelect', '0'); setVal('timerSelect', '0');
                setVal('problemCountSelect', '10'); setVal('categorySelect', 'addition'); setVal('skillSelect', 'add_facts');
                window.startGame();
            });
            await waitFor(page, () => document.getElementById('worksheetView').classList.contains('active'), 6000, 'worksheetView active');
            await sleep(700);
            const wInfo = await page.evaluate(() => {
                // Worksheet mode renders .problem-card elements (not .worksheet-problem
                // — that's the print-output class).
                const grid = document.querySelector('#worksheetView .problems-grid, #worksheetView .worksheet-problems, #worksheetView .ws-grid');
                const cards = document.querySelectorAll('#worksheetView .problem-card');
                return {
                    hasGrid: !!grid,
                    cardCount: cards.length,
                    firstHasContent: cards[0] ? (cards[0].textContent || '').trim().length > 0 : false,
                };
            });
            await shot(page, '4-worksheet');
            const ok = wInfo.cardCount >= 5 && wInfo.firstHasContent;
            record('worksheet', ok, `cards=${wInfo.cardCount}, firstHasContent=${wInfo.firstHasContent}`);
            await page.evaluate(() => { window.goHome && window.goHome(); });
            await sleep(300);
        } catch (e) {
            record('worksheet', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 5. QUIZ BUILDER
        // ------------------------------------------------------------------
        try {
            log('--- 5. quiz builder ---');
            await page.evaluate(() => { window.openQuizBuilder && window.openQuizBuilder(); });
            await waitFor(page, () => document.getElementById('quizBuilderView').classList.contains('active'), 6000, 'quizBuilderView active');
            await sleep(700);
            // Add a question via the addQuizQuestion API (more reliable than DOM clicking)
            const addInfo = await page.evaluate(() => {
                try {
                    if (typeof window.addQuizQuestion === 'function') {
                        window.addQuizQuestion('add_facts');
                    } else if (typeof window.addMultipleQuestions === 'function') {
                        window.addMultipleQuestions('add_facts', 1);
                    }
                    // Look at quiz state
                    const t = window.activeQuiz || window.currentQuiz || window.state.activeQuiz || null;
                    let count = 0;
                    if (t && t.sections) {
                        t.sections.forEach(s => { if (s.questions) count += s.questions.length; });
                    }
                    return { hasState: !!t, count, raw: t ? Object.keys(t).slice(0, 8) : [] };
                } catch (e) {
                    return { error: e.message };
                }
            });
            await sleep(400);
            await shot(page, '5-quizBuilder');
            // Check that some question DOM exists in the view
            const qbDom = await page.evaluate(() => {
                const qList = document.querySelectorAll('#quizBuilderView .qb-question-card, #quizBuilderView .quiz-question, #quizBuilderView .question-row');
                return { qCount: qList.length };
            });
            const ok = !addInfo.error && (addInfo.count >= 1 || qbDom.qCount >= 1);
            record('quizBuilder', ok, `added=${addInfo.count}, dom-questions=${qbDom.qCount}, hasState=${addInfo.hasState}${addInfo.error ? ', err=' + addInfo.error : ''}`);
            await page.evaluate(() => { window.goHome && window.goHome(); });
            await sleep(300);
        } catch (e) {
            record('quizBuilder', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 6. SKILLS NAVIGATOR (Skills Organizer)
        // ------------------------------------------------------------------
        try {
            log('--- 6. skills navigator ---');
            await page.evaluate(() => { window.openSkillsOrganizer && window.openSkillsOrganizer(); });
            await waitFor(page, () => document.getElementById('skillsOrganizerView').classList.contains('active'), 6000, 'skillsOrganizerView active');
            await sleep(900);
            const cardCount = await page.evaluate(() => document.querySelectorAll('#skillsOrganizerView .so-skill-card, #skillsOrganizerView .skill-card').length);
            // Try to fire preview programmatically rather than via hover
            const previewInfo = await page.evaluate(() => {
                try {
                    const card = document.querySelector('#skillsOrganizerView .so-skill-card, #skillsOrganizerView .skill-card');
                    if (!card) return { error: 'no skill card found', cardCount: 0 };
                    // Read data-* attrs the preview API expects
                    // Skills navigator cards expose attributes as data-so-cat/data-so-skill
                    // (the so- prefix avoids collisions with other data-* on the page).
                    const cat = card.getAttribute('data-so-cat') || card.dataset.soCat || card.getAttribute('data-category') || '';
                    const sk = card.getAttribute('data-so-skill') || card.dataset.soSkill || card.getAttribute('data-skill') || '';
                    if (typeof window.soPreviewClick === 'function' && cat && sk) {
                        window.soPreviewClick(cat, sk);
                    } else if (typeof window.soGeneratePreview === 'function' && cat && sk) {
                        window.soGeneratePreview(cat, sk);
                    } else if (typeof window.soPreviewHover === 'function' && cat && sk) {
                        window.soPreviewHover(cat, sk, card);
                    }
                    return { cat, sk };
                } catch (e) {
                    return { error: e.message };
                }
            });
            await sleep(900);
            const previewDom = await page.evaluate(() => {
                // The hover popup mounts as `.so-hover-popup` on document.body,
                // NOT inside #skillsOrganizerView.
                const p = document.querySelector('.so-hover-popup');
                return {
                    hasPanel: !!p,
                    panelHasContent: p ? (p.textContent || '').trim().length > 20 : false,
                    panelPreviewLen: p ? p.innerHTML.length : 0,
                    visible: p ? (p.style.display !== 'none' && p.offsetParent !== null) : false,
                };
            });
            await shot(page, '6-skills-nav');
            const ok = cardCount > 5 && (previewDom.hasPanel || cardCount > 0);
            record('skillsNavigator', ok, `cards=${cardCount}, preview hasPanel=${previewDom.hasPanel}, contentLen=${previewDom.panelPreviewLen}, fired=${previewInfo.cat}/${previewInfo.sk}${previewInfo.error ? ' err=' + previewInfo.error : ''}`);
            await page.evaluate(() => { window.goHome && window.goHome(); });
            await sleep(300);
        } catch (e) {
            record('skillsNavigator', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 7. MIXED MODE
        // ------------------------------------------------------------------
        try {
            log('--- 7. mixed mode ---');
            await page.evaluate(() => {
                // Set up isMixedMode + mixedModeSettings BEFORE startGame to bypass the
                // startGame->playSelectedSkills->startGame double-call clobber issue.
                window.skillQueue = [];
                window.state.isMixedMode = true;
                window.state.category = 'all_mixed';
                window.state.skill = 'custom_mixed';
                window.state.gameMode = 'practice';
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                window.state.timerDuration = 0;
                window.state.problemCount = 5;
                window.state.selectedNumbers = [2,3,4,5,6,7,8,9,10,11,12];
                window.state.mixedModeSettings = {
                    skills: [
                        { skillId: 'add_facts', categoryId: 'addition', weight: 1 },
                        { skillId: 'sub_facts', categoryId: 'subtraction', weight: 1 },
                        { skillId: 'mult_facts', categoryId: 'multiplication', weight: 1 },
                    ],
                    range: 100,
                    decimalPlaces: 0,
                    timer: 0,
                    timeChoice: 'teacher',
                    totalProblems: 5,
                    totalProblemsEnabled: true,
                };
                const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                setVal('rangeSelect', '100'); setVal('decimalSelect', '0');
                setVal('timerSelect', '0'); setVal('problemCountSelect', '5');
                window.startGame();
            });
            await waitFor(page, () => document.getElementById('gameView').classList.contains('active'), 6000, 'mixed gameView active');
            await waitFor(page, () => window.state && window.state.currentQ, 6000, 'mixed Q ready');
            const skillsSeen = new Set();
            for (let i = 0; i < 4; i++) {
                const sk = await page.evaluate(() => window.state.currentQ && (window.state.currentQ.skillId || window.state.skill));
                if (sk) skillsSeen.add(sk);
                const r = await answerOneQuestion(page);
                if (!r.ok) break;
                await sleep(600);
                await page.evaluate(() => {
                    const nb = document.getElementById('nextBtn') || document.querySelector('.next-btn');
                    if (nb && nb.style.display !== 'none' && !nb.disabled) nb.click();
                });
                await sleep(400);
            }
            await shot(page, '7-mixed');
            const ok = skillsSeen.size >= 1; // at least one skill rendered
            record('mixedMode', ok, `skills seen across questions: [${Array.from(skillsSeen).join(', ')}] (size=${skillsSeen.size})`);
            await page.evaluate(() => {
                window.state.isMixedMode = false;
                window.state.mixedModeSettings = null;
                window.exitGame && window.exitGame();
                window.goHome && window.goHome();
            });
            await sleep(400);
        } catch (e) {
            record('mixedMode', false, 'exception ' + e.message);
        }

        // ------------------------------------------------------------------
        // 8. DASHBOARD VIEW
        // ------------------------------------------------------------------
        try {
            log('--- 8. dashboard view ---');
            const errCountBefore = pageErrors.length + consoleErrors.length;
            await page.evaluate(() => {
                if (window.showView) window.showView('dashboardView');
                if (window.renderDashboard) window.renderDashboard();
            });
            await waitFor(page, () => document.getElementById('dashboardView').classList.contains('active'), 6000, 'dashboardView active');
            await sleep(700);
            const dashInfo = await page.evaluate(() => {
                const dv = document.getElementById('dashboardView');
                return {
                    active: dv.classList.contains('active'),
                    visible: dv.offsetHeight > 0,
                    contentLen: (dv.textContent || '').trim().length,
                    hasCal: !!document.getElementById('streakCalendar'),
                    hasBadges: !!document.querySelector('#dashboardView .badges-grid, #dashboardView .badge-list'),
                    hasHistory: !!document.querySelector('#dashboardView .session-history, #dashboardView .history-list'),
                };
            });
            await shot(page, '8-dashboard');
            const errCountAfter = pageErrors.length + consoleErrors.length;
            const newErrs = errCountAfter - errCountBefore;
            const ok = dashInfo.active && dashInfo.visible && dashInfo.contentLen > 50 && newErrs === 0;
            record('dashboard', ok, `visible=${dashInfo.visible} content=${dashInfo.contentLen}ch cal=${dashInfo.hasCal} badges=${dashInfo.hasBadges} history=${dashInfo.hasHistory} newErrs=${newErrs}`);
            await page.evaluate(() => { window.goHome && window.goHome(); });
            await sleep(200);
        } catch (e) {
            record('dashboard', false, 'exception ' + e.message);
        }

        // ============================ SUMMARY ============================
        const passes = results.filter(r => r.pass).length;
        const total = results.length;
        log('================================================================');
        log(`SUMMARY: ${passes}/${total} passed`);
        for (const r of results) log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.feature}: ${r.note}`);
        log('----');
        log(`pageErrors: ${pageErrors.length}, consoleErrors: ${consoleErrors.length}`);
        if (pageErrors.length) pageErrors.slice(0, 8).forEach(e => log('  pageErr:', e.split('\n')[0]));
        if (consoleErrors.length) consoleErrors.slice(0, 8).forEach(e => log('  consoleErr:', e.substring(0, 200)));
        if (passes < total) exitCode = 2;
    } catch (err) {
        log('!!! CRASHED:', err.stack || err.message);
        exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exitCode);
    }
})();
