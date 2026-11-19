#!/usr/bin/env node
// ws-skip — the SKIP button on every student mode (lane lf-hosts, owner request 2026-11-19).
//
// Owner request: a Skip button on the practice card, the online worksheet, the quiz and the MAP test. Skip moves on without
// marking the item wrong (in the MAP test it is not scored until the end); at the END of the run, before the results, every
// skipped item comes back one at a time after "You skipped n. Let's fix them." - the SAME item - and is answered and scored
// then; a second skip leaves it "skipped" in the teacher's results. "Skipped: n" is shown; the button is 48 px, with Hint /
// Read ("Skip ⏭"); the teacher turns it off per quiz / test (default on). Boss / race keep only the old after-N-wrong-tries
// escape hatch (the clock decides those games), so they are not judged here.
//
// Rules, judged on every host (card = practice card, worksheet = online worksheet, quiz, map = MAP test) at every width:
//   SKIP-BTN        the Skip button is visible from the first moment, >= 48 x 48 px, labelled "Skip", and sits in the same
//                   tool row as Hint / Read (the card / MAP: .mq-qactions with #hintBtn; the worksheet: the card's .mq-wsbar
//                   with Hint; the quiz: the question header with Flag)
//   SKIP-COUNT      "Skipped: n" shows the right n after each skip
//   SKIP-NOT-WRONG  a skip never counts as wrong: no 'incorrect' status, streak unchanged, XP unchanged, adaptive levels,
//                   skill progress and Leitner (spaced repetition) state unchanged; MAP: RIT unchanged
//   SKIP-RETURN     at the end the intro reads "You skipped n. Let's fix them." with the real n, then every skipped item
//                   comes back IDENTICAL (text + answer + drawing) one at a time; each answered item is scored once (the
//                   score counts it once, no double row); a second skip ends it "skipped"
//   SKIP-RESULTS    a second-pass skip reads "skipped" in the teacher's results (session history / quiz results / MAP results)
//   --- added after narrow critic r1 (lf-hosts skip, 2026-11-19); these drive REAL input: typing + Enter, real clicks,
//       wrong answers, blanks, skipping the LAST item after a wrong try, and a timer that expires (card, quiz) ---
//   SKIP-END-GATE   no end screen and no session-history row while the return-pass intro or the pass is up; after it,
//                   exactly one end screen and one row (F1: a stray advance from an earlier item finished the run early)
//   SKIP-TOTAL      the session row's total is the problems dealt: score = correct / totalProblems (F2: "4/5" for 4 of 4)
//   SKIP-TIMER      a timer that expires under the intro or the pass ends the run cleanly: the intro is gone, still-skipped
//                   items are "skipped" (not wrong), no page error (F3)
//   SKIP-COUNT-MATCH the intro's n equals the "Skipped: n" shown; the pass is exactly the skipped items (not flagged-and-
//                   answered questions, not blanks never skipped); the count drops only when a returned item is answered;
//                   the card header reads "Fixing k of n" in the pass (F4, F6 worksheet, ruling R3)
//   SKIP-BLANK      a blank Next in the return pass ends the item "skipped" / not answered, never Wrong (F5)
//   SKIP-KEEP-WRONG a skip after a wrong try keeps the wrong try visible: dot "Incorrect, then skipped", the session row's
//                   skippedAfterWrong and the dashboard text (F6 card)
//   SKIP-MAP-RIT    MAP: an item still skipped after the return pass scores as incorrect for RIT (lead ruling 2026-11-19;
//                   the switch is MAP_STILL_SKIPPED_SCORES_WRONG in map-engine.js) and still reads "skipped"
//   SKIP-MAP-REDO   MAP practice: a navigator-dot redo of a skipped item does not clear "skipped" (ruling R4)
//   SKIP-OFF        the teacher setting OFF hides the button (practice + worksheet: the skill's skipAfter 0; quiz:
//                   settings.allowSkip false, kept through the quiz share link; MAP: allowSkip false, kept as -S0 in the link)
//
//   node tests/scripts/ws-skip.cjs                          # every host x tests/lib/ws-screen-widths.cjs SCREEN_WIDTHS
//   node tests/scripts/ws-skip.cjs --widths 1280,820 --hosts card,quiz --rules SKIP-RETURN
//   node tests/scripts/ws-skip.cjs --shots design/status/lf-hosts/skip   # also save the evidence PNGs (deviceScaleFactor 2)
//   node tests/scripts/ws-skip.cjs --root <checkout>        # judge another tree (ws-backtest commit-pair rows); MQ_ROOT works too
//   node tests/scripts/ws-skip.cjs --print-widths           # the widths it would render (ws-screen-widths-plan)
// Prints one line per host x width and `ws-skip: OK (n checks)` / `ws-skip: FAIL (n)`; exit 1 on FAIL.
'use strict';
const path = require('path');
const fs = require('fs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
if (arg('root')) process.env.MQ_ROOT = path.resolve(arg('root'));
const SW = require('../lib/ws-screen-widths.cjs');
const TOOL = 'ws-skip';
const WIDTHS = SW.widthsArg(argv, SW.SCREEN_WIDTHS);
if (argv.includes('--print-widths')) { console.log(`widths: ${WIDTHS.join(',')}`); process.exit(0); }
const HOSTS = arg('hosts', 'card,worksheet,quiz,map').split(',');
const RULES = new Set(arg('rules', 'SKIP-BTN,SKIP-COUNT,SKIP-NOT-WRONG,SKIP-RETURN,SKIP-RESULTS,SKIP-OFF,SKIP-END-GATE,SKIP-TOTAL,SKIP-TIMER,SKIP-COUNT-MATCH,SKIP-BLANK,SKIP-KEEP-WRONG,SKIP-MAP-RIT,SKIP-MAP-REDO').split(','));
const SHOTS = arg('shots', null);
const { open, waitFor } = require('../lib/ws-harness.cjs');

const findings = [];
let checks = 0;
function judge(rule, host, w, ok, what) {
    if (!RULES.has(rule)) return;
    checks++;
    if (!ok) findings.push(`${rule} ${host}@${w}: ${what}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** waitFor with one argument passed into the page function. */
async function waitArg(page, fn, a, timeout, label) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
        try { if (await page.evaluate(fn, a)) return true; } catch (e) { /* page busy */ }
        await sleep(100);
    }
    throw new Error(`Timeout waiting for ${label}`);
}
async function shot(page, w, name, selector) {
    if (!SHOTS) return;
    const file = path.join(path.resolve(SHOTS), `${name}-${w}.png`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (selector) { const el = await page.$(selector); if (el) { try { await el.screenshot({ path: file }); return; } catch (_) { /* not boxable: whole page */ } } }
    await page.screenshot({ path: file });
}

/** The button's box and whether it shares a tool row with the reference control. */
function btnInfo(page, btnSel, rowSel, refSel) {
    return page.evaluate((btnSel, rowSel, refSel) => {
        const b = document.querySelector(btnSel);
        if (!b) return { present: false };
        const cs = getComputedStyle(b);
        const r = b.getBoundingClientRect();
        const row = b.closest(rowSel);
        const ref = row && row.querySelector(refSel);
        return { present: true, visible: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0,
            w: Math.round(r.width), h: Math.round(r.height), text: (b.textContent || '').trim(), withRef: !!ref };
    }, btnSel, rowSel, refSel);
}
const snapState = (page) => page.evaluate(() => {
    const st = window.state;
    let ls = {};
    try { for (const k of ['mathquest_skill_progress', 'mathquest_adaptive_levels']) ls[k] = localStorage.getItem(k); } catch (e) { /* none */ }
    return JSON.stringify({ xp: st.xp, sessionXp: st.sessionXp, streak: st.sessionStreak, sr: st.spacedRepetition || null,
        skills: st.currentSessionSkills || null, ls, rit: st.mapCurrentRit, ritStreak: [st.mapCorrectStreak, st.mapIncorrectStreak] });
});
const itemKey = (q) => (q ? JSON.stringify([String(q.text || ''), String(q.ans), String(q.visual || '').length, q.cell ? JSON.stringify(q.cell).length : 0]) : null);

async function setSkipOff(page, on) {
    await page.evaluate(async (on) => {
        const m = await import('/js/modules/skill-option-store.js');
        if (on) m.setSetOptions('multiplication', 'mult_facts', { skipAfter: 0 });
        else m.deleteSetOptions('multiplication', 'mult_facts');
    }, on);
}
async function startPractice(page, mode, n, timer = 0) {
    await page.evaluate((mode, n, timer) => {
        const st = window.state;
        window.skillQueue = [];
        st.mixedModeSettings = { selectedSkills: { multiplication: ['mult_facts'] }, name: 'ws-skip', range: 100, decimalPlaces: 0,
            timeChoice: 'teacher', timer, totalProblemsEnabled: true, totalProblems: n };
        st.category = 'all_mixed'; st.skill = 'custom_mixed'; st.isMixedMode = true; st.gameMode = mode; st.infinityMode = false;
        st.quizMode = false; st.mapMode = false; st.adaptiveModeEnabled = true;
        st.sessionHistory = [];
        window.startGame();
    }, mode, n, timer);
    await sleep(400);
}
const qKey = (page) => page.evaluate((src) => (0, eval)(src)(window.state.currentQ), `(${itemKey.toString()})`);
async function answerCard(page, right = true) {
    const before = await page.evaluate(() => window.state.qCount);
    await page.evaluate((right) => { const q = window.state.currentQ; window.checkAnswer(right ? String(q.ans) : '987654'); }, right);
}

/* ------------------------------------------------------------------ practice card */
async function runCard(page, w) {
    const H = 'card';
    await setSkipOff(page, false);
    await startPractice(page, 'practice', 5);
    await waitFor(page, () => window.state.qCount === 1 && !!window.state.currentQ, 8000, 'card Q1');
    const b = await btnInfo(page, '#skipQuestionBtn', '.mq-qactions', '#hintBtn');
    judge('SKIP-BTN', H, w, b.present && b.visible, `Skip not visible on a fresh question (${JSON.stringify(b)})`);
    judge('SKIP-BTN', H, w, b.w >= 48 && b.h >= 48, `button ${b.w}x${b.h} < 48x48`);
    judge('SKIP-BTN', H, w, /Skip/.test(b.text || '') && b.withRef, `button "${b.text}" not with Hint / Read`);
    // Q1 right (streak 1)
    await answerCard(page, true);
    await waitFor(page, () => window.state.qCount === 2 && !window.state.hasAnswered, 8000, 'card Q2');
    const skipped = [];
    for (let k = 0; k < 3; k++) {
        const before = await snapState(page);
        skipped.push(await qKey(page));
        const qc = await page.evaluate(() => window.state.qCount);
        if (k === 0) await shot(page, w, 'card-skip', '#gameView');
        await page.click('#skipQuestionBtn');
        await waitArg(page, (qc) => (window.state.qCount === qc + 1 && !window.state.hasAnswered) || !!document.getElementById('skipReturnIntro'), qc, 8000, 'card after skip');
        await sleep(100);
        const after = await snapState(page);
        judge('SKIP-NOT-WRONG', H, w, before === after, `skip ${k + 1} changed XP / streak / adaptive / progress / Leitner: ${before} -> ${after}`);
        const st = await page.evaluate((i) => { const h = window.state.questionHistory[i]; return h && h.status; }, qc - 1);
        judge('SKIP-NOT-WRONG', H, w, st === 'skipped', `skipped item recorded "${st}"`);
        const cnt = await page.evaluate(() => { const e = document.getElementById('skipCountPill'); return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : ''; });
        if (k < 2) judge('SKIP-COUNT', H, w, cnt === `Skipped: ${k + 1}`, `count reads "${cnt}", want "Skipped: ${k + 1}"`);
    }
    // Q5 right -> intro
    await answerCard(page, true);
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 8000, 'card return intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-RETURN', H, w, msg === "You skipped 3. Let's fix them.", `intro reads "${msg}"`);
    await shot(page, w, 'card-return-intro');
    await page.click('#skipReturnGo');
    await sleep(300);
    // returned 1: identical, answer right; 2: skip again; 3: answer right
    for (let k = 0; k < 3; k++) {
        const key = await qKey(page);
        judge('SKIP-RETURN', H, w, key === skipped[k], `returned item ${k + 1} differs: ${key} vs ${skipped[k]}`);
        const vb = await btnInfo(page, '#skipQuestionBtn', '.mq-qactions', '#hintBtn');
        judge('SKIP-RETURN', H, w, vb.visible, 'Skip not offered again in the return pass');
        if (k === 0) await shot(page, w, 'card-return-item', '#gameView');
        const at = await page.evaluate(() => window.state._skipReturnIdx);
        if (k === 1) await page.click('#skipQuestionBtn');
        else await answerCard(page, true);
        await waitArg(page, (at) => (window.state._skipReturnIdx !== at && !window.state.hasAnswered) || (window.state.skipReturn && window.state.skipReturn.done), at, 8000, `card return ${k + 2}`);
        await sleep(150);
    }
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 8000, 'card end');
    const res = await page.evaluate(() => {
        const st = window.state;
        return { hist: st.questionHistory.map((h) => h.status), score: st.score, skipped: st.sessionHistory[0].skipped, scoreText: st.sessionHistory[0].score };
    });
    judge('SKIP-RETURN', H, w, JSON.stringify(res.hist) === JSON.stringify(['correct', 'correct', 'skipped', 'correct', 'correct']), `history ${JSON.stringify(res.hist)}`);
    judge('SKIP-RETURN', H, w, res.score === 4, `score ${res.score}, want 4 (each returned item scored once)`);
    judge('SKIP-RESULTS', H, w, res.skipped === 1, `session history skipped = ${res.skipped}, want 1`);
    const dash = await page.evaluate(() => { window.renderSessionHistory && window.renderSessionHistory(); const t = document.querySelector('#historyTableBody, .history-table, #sessionHistoryBody'); return t ? t.textContent : document.body.textContent; });
    judge('SKIP-RESULTS', H, w, /1 skipped/.test(dash), 'the dashboard history row does not read "1 skipped"');
    // OFF: the skill's skipAfter 0 hides the card button
    await page.evaluate(() => { document.querySelectorAll('.modal, .modal-overlay').forEach((m) => { m.style.display = 'none'; }); });
    await setSkipOff(page, true);
    await startPractice(page, 'practice', 3);
    await waitFor(page, () => window.state.qCount === 1, 8000, 'card off Q1');
    const off = await btnInfo(page, '#skipQuestionBtn', '.mq-qactions', '#hintBtn');
    judge('SKIP-OFF', H, w, !off.visible, 'skipAfter 0: the Skip button still shows');
    await setSkipOff(page, false);
}

/* ------------------------------------------------------------------ online worksheet */
async function runWorksheet(page, w) {
    const H = 'worksheet';
    await page.evaluate(() => { document.querySelectorAll('.modal, .modal-overlay').forEach((m) => { m.style.display = 'none'; }); });
    await setSkipOff(page, false);
    await startPractice(page, 'worksheet', 4);
    await waitFor(page, () => (window.state.worksheetQs || []).length === 4 && !!document.getElementById('ws_card_3'), 10000, 'worksheet cards');
    const b = await btnInfo(page, '#ws_card_1 .ws-skip-btn', '.mq-wsbar', '.hint-btn');
    judge('SKIP-BTN', H, w, b.present && b.visible, `card Skip not visible from the start (${JSON.stringify(b)})`);
    judge('SKIP-BTN', H, w, b.w >= 48 && b.h >= 48, `button ${b.w}x${b.h} < 48x48`);
    judge('SKIP-BTN', H, w, /Skip/.test(b.text || '') && b.withRef, `button "${b.text}" not with Hint / Read`);
    const keys = await page.evaluate((src) => window.state.worksheetQs.map((0, eval)(src)), `(${itemKey.toString()})`);
    const before = await snapState(page);
    await page.click('#ws_card_1 .ws-skip-btn');
    await page.click('#ws_card_2 .ws-skip-btn');
    await sleep(200);
    judge('SKIP-NOT-WRONG', H, w, before === (await snapState(page)), 'a worksheet skip changed XP / streak / progress state');
    const cnt = await page.evaluate(() => { const e = document.getElementById('worksheetSkipCount'); return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : ''; });
    judge('SKIP-COUNT', H, w, cnt === 'Skipped: 2', `count reads "${cnt}"`);
    await shot(page, w, 'worksheet-skipped', '#worksheetView');
    const fill = (i) => page.evaluate((i) => { const q = window.state.worksheetQs[i]; const el = document.getElementById(`ws_input_${i}`); if (el) { el.value = String(q.ans); } return !!el; }, i);
    await fill(0); await fill(3);
    await page.evaluate(() => window.checkAllWorksheet());
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 5000, 'worksheet intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-RETURN', H, w, msg === "You skipped 2. Let's fix them.", `intro reads "${msg}"`);
    await page.click('#skipReturnGo');
    await sleep(200);
    const shown = () => page.evaluate(() => [...document.querySelectorAll('#worksheetGrid > .problem-card')].filter((c) => getComputedStyle(c).display !== 'none').map((c) => c.id));
    let vis = await shown();
    judge('SKIP-RETURN', H, w, JSON.stringify(vis) === '["ws_card_1"]', `return pass 1 shows ${JSON.stringify(vis)}`);
    const k1 = await page.evaluate((src) => (0, eval)(src)(window.state.worksheetQs[1]), `(${itemKey.toString()})`);
    judge('SKIP-RETURN', H, w, k1 === keys[1], 'returned card 1 is not the same item');
    await shot(page, w, 'worksheet-return-item', '#worksheetView');
    await fill(1);
    await page.click('#wsReturnNextBtn');
    await sleep(200);
    vis = await shown();
    judge('SKIP-RETURN', H, w, JSON.stringify(vis) === '["ws_card_2"]', `return pass 2 shows ${JSON.stringify(vis)}`);
    await page.click('#ws_card_2 .ws-skip-btn');   // second skip
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 8000, 'worksheet graded');
    const res = await page.evaluate(() => ({ h: window.state.sessionHistory[0], txt: (document.getElementById('worksheetResult') || {}).textContent || '' }));
    judge('SKIP-RETURN', H, w, res.h.score === '3/3', `worksheet score ${res.h.score}, want 3/3 (the second-pass skip out of the total, each item graded once)`);
    judge('SKIP-RESULTS', H, w, res.h.skipped === 1 && /Skipped: 1/.test(res.txt), `worksheet history skipped=${res.h.skipped}, result "${res.txt.trim()}"`);
    await page.evaluate(() => { document.querySelectorAll('body > div[style*="z-index: 9999"], .mq-wsres-teacher').forEach((o) => o.remove()); });
    // OFF
    await setSkipOff(page, true);
    await startPractice(page, 'worksheet', 2);
    await waitFor(page, () => !!document.getElementById('ws_card_1'), 10000, 'worksheet off');
    const off = await page.evaluate(() => document.querySelectorAll('#worksheetGrid .ws-skip-btn').length);
    judge('SKIP-OFF', H, w, off === 0, `skipAfter 0: ${off} worksheet Skip buttons`);
    await setSkipOff(page, false);
    await page.evaluate(() => { window.showView && window.showView('homeView'); });
}

/* ------------------------------------------------------------------ quiz */
async function buildQuiz(page, allowSkip, viaLink, timeLimit = null) {
    await page.evaluate(async (allowSkip, viaLink, timeLimit) => {
        const st = window.state;
        const qs = [];
        for (let i = 0; i < 4; i++) {
            const q = window.generateQuestionFor({ category: 'multiplication', skill: 'mult_facts', range: 100, decimals: 0, seed: 7100 + i });
            q.categoryId = 'multiplication'; q.skillId = 'mult_facts';
            qs.push({ id: i, skillId: 'mult_facts', points: 1, questionData: q });
        }
        const test = { id: 'wsskip' + Date.now(), name: 'Skip check', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: qs }],
            settings: { timeLimit, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1, allowSkip } };
        const store = await import('/js/modules/quiz-storage.js');
        try { await store.saveTest(test); } catch (e) { /* no IndexedDB: results check below says so */ }
        window.__wsSkipTest = test;
        if (viaLink) window.handleQuizURL(store.compressTestForURL(test));
        else { st.currentQuiz = test; st.quizMode = true; window.handleQuizURL(store.compressTestForURL(test)); }
        const name = document.getElementById('qtStudentName');
        name.value = 'Pupil'; window.startQuizTest();
    }, allowSkip, viaLink, timeLimit);
    await sleep(300);
}
async function runQuiz(page, w) {
    const H = 'quiz';
    await buildQuiz(page, true, false);
    const ans = (flat) => page.evaluate((f) => window.submitQuizTextAnswer(f, String(window.state.quizAllQuestions[f].question.questionData.ans)), flat);
    const b = await btnInfo(page, '#qtSkipBtn', '.qt-q-header', '.qt-flag-btn');
    judge('SKIP-BTN', H, w, b.present && b.visible, `quiz Skip not visible (${JSON.stringify(b)})`);
    judge('SKIP-BTN', H, w, b.w >= 48 && b.h >= 48, `button ${b.w}x${b.h} < 48x48`);
    judge('SKIP-BTN', H, w, /Skip/.test(b.text || '') && b.withRef, `button "${b.text}" not beside Flag`);
    const texts = await page.evaluate(() => window.state.quizAllQuestions.map((x) => String(x.question.questionData.text) + '|' + x.question.questionData.ans));
    await ans(0);
    await page.evaluate(() => window.navigateQuizQuestion(1));
    await page.click('#qtSkipBtn');
    await sleep(150);
    let cnt = await page.evaluate(() => { const e = document.getElementById('qtSkipCount'); return e ? e.textContent.trim() : ''; });
    judge('SKIP-COUNT', H, w, cnt === 'Skipped: 1', `count reads "${cnt}"`);
    const flagged = await page.evaluate(() => document.querySelectorAll('.qt-q-dot.flagged').length);
    judge('SKIP-RETURN', H, w, flagged === 1, `Skip did not flag the question (the existing flag-and-return): ${flagged} flagged dots`);
    await shot(page, w, 'quiz-skipped-flagged', '#quizTakeView');
    await page.click('#qtSkipBtn');
    await sleep(150);
    await ans(3);
    await page.evaluate(() => window.showQuizReview());
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 5000, 'quiz intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-RETURN', H, w, msg === "You skipped 2. Let's fix them.", `intro reads "${msg}"`);
    await shot(page, w, 'quiz-return-intro');
    await page.click('#skipReturnGo');
    await sleep(200);
    const cur = () => page.evaluate(() => { const f = window.state.quizOrder[window.state.quizQuestionIndex]; const d = window.state.quizAllQuestions[f].question.questionData; return { f, t: String(d.text) + '|' + d.ans }; });
    let c = await cur();
    judge('SKIP-RETURN', H, w, c.f === 1 && c.t === texts[1], `return 1 is question ${c.f}`);
    await ans(1);
    await page.click('#qtReturnNext');
    await sleep(200);
    c = await cur();
    judge('SKIP-RETURN', H, w, c.f === 2 && c.t === texts[2], `return 2 is question ${c.f}`);
    await page.click('#qtSkipBtn');   // second skip -> review
    await sleep(200);
    const inReview = await page.evaluate(() => !!document.querySelector('.qt-review'));
    judge('SKIP-RETURN', H, w, inReview, 'after the return pass the review screen did not open');
    await page.evaluate(() => window.submitQuiz());
    await sleep(500);
    const r = await page.evaluate(() => { const r = window.state.currentQuizResult; return { score: r.score, a: r.answers.map((a) => (a.skipped ? 'skipped' : a.correct ? 'right' : 'wrong')), id: r.id }; });
    judge('SKIP-RETURN', H, w, r.score === 3 && JSON.stringify(r.a) === '["right","right","skipped","right"]', `quiz result ${JSON.stringify(r)}`);
    const tags = await page.evaluate(async (rid) => {
        try {
            window.showView('quizResultsView');
            await window.showStudentQuizDetail(rid, window.__wsSkipTest.id);
            await new Promise((res) => setTimeout(res, 300));
            return [...document.querySelectorAll('#quizResultsView .tvq-tag')].map((t) => t.textContent.trim());
        } catch (e) { return ['ERR ' + e.message]; }
    }, r.id);
    judge('SKIP-RESULTS', H, w, tags.filter((t) => t === 'Skipped').length === 1, `teacher quiz detail tags ${JSON.stringify(tags)}`);
    await shot(page, w, 'quiz-teacher-skipped', '#quizResultsView');
    // OFF through the share link
    await buildQuiz(page, false, true);
    const off = await btnInfo(page, '#qtSkipBtn', '.qt-q-header', '.qt-flag-btn');
    judge('SKIP-OFF', H, w, !off.present, 'allowSkip false (through the share link): the quiz Skip still shows');
    await page.evaluate(() => { window.state.quizMode = false; window.showView('homeView'); });
}

/* ------------------------------------------------------------------ MAP test */
async function runMap(page, w) {
    const H = 'map';
    const start = (allowSkip, n) => page.evaluate((allowSkip, n) => {
        window.startMapSession({ tier: '35', mode: 'simulation', bands: ['191-200', '201-210'], domains: ['OA', 'NO'], itemCount: n, allowSkip });
    }, allowSkip, n);
    await start(true, 4);
    await waitFor(page, () => window.state.mapMode && !!window.state.currentQ, 8000, 'map item 1');
    await sleep(200);
    const b = await btnInfo(page, '#skipQuestionBtn', '.mq-qactions', '#ttsBtn');
    judge('SKIP-BTN', H, w, b.present && b.visible, `MAP Skip not visible (${JSON.stringify(b)})`);
    judge('SKIP-BTN', H, w, b.w >= 48 && b.h >= 48, `button ${b.w}x${b.h} < 48x48`);
    judge('SKIP-BTN', H, w, /Skip/.test(b.text || '') && b.withRef, `button "${b.text}" not with Read`);
    const answer = () => page.evaluate(() => { window.state.hasAnswered = true; window.recordMapAnswer({ correct: true }); });
    const waitItem = (n) => waitArg(page, (n) => window.state.mapItemCount === n && !window.state.hasAnswered, n, 8000, `map item ${n + 1}`);
    await answer(); await waitItem(1);
    const keys = [];
    for (let k = 0; k < 2; k++) {
        keys.push(await qKey(page));
        const before = await snapState(page);
        if (k === 0) await shot(page, w, 'map-skip');
        await page.click('#skipQuestionBtn');
        await waitItem(2 + k);
        judge('SKIP-NOT-WRONG', H, w, before === (await snapState(page)), 'a MAP skip changed the RIT / streak / XP state');
        const cnt = await page.evaluate(() => { const e = document.getElementById('skipCountPill'); return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : ''; });
        judge('SKIP-COUNT', H, w, cnt === `Skipped: ${k + 1}`, `count reads "${cnt}"`);
    }
    const ritBeforeEnd = await page.evaluate(() => window.state.mapCurrentRit);
    await answer();
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 8000, 'map intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-RETURN', H, w, msg === "You skipped 2. Let's fix them.", `intro reads "${msg}"`);
    await shot(page, w, 'map-return-intro');
    await page.click('#skipReturnGo');
    await sleep(200);
    let k0 = await qKey(page);
    judge('SKIP-RETURN', H, w, k0 === keys[0], 'MAP returned item 1 is not the same item');
    const r0 = await page.evaluate(() => window.state.mapCurrentRit);
    await answer();
    await waitFor(page, () => !window.state.hasAnswered, 8000, 'map return 2');
    const r1 = await page.evaluate(() => window.state.mapCurrentRit);
    judge('SKIP-RETURN', H, w, r1 !== r0, 'the returned MAP item was not scored at the end (RIT unchanged)');
    k0 = await qKey(page);
    judge('SKIP-RETURN', H, w, k0 === keys[1], 'MAP returned item 2 is not the same item');
    await page.click('#skipQuestionBtn');
    await waitFor(page, () => !window.state.mapMode && !!window.state.lastMapResult, 8000, 'map results');
    await sleep(300);
    // lead ruling 2026-11-19: the item still skipped after the pass scores as incorrect for RIT, and still reads "skipped"
    const rEnd = await page.evaluate(() => ({ rit: window.state.mapCurrentRit, row: window.state.lastMapResult.history.filter((h) => h.skipped).length }));
    judge('SKIP-MAP-RIT', H, w, rEnd.rit < r1 && rEnd.row === 1, `still-skipped item: RIT ${r1} -> ${rEnd.rit} (want lower), skipped rows ${rEnd.row} (want 1)`);
    const res = await page.evaluate(() => { const r = window.state.lastMapResult; return { answered: r.answered, skipped: r.skipped, n: r.history.length, ratio: (document.getElementById('mapFinalRatio') || {}).textContent || '' }; });
    judge('SKIP-RETURN', H, w, res.n === 4 && res.answered === 3, `MAP result rows ${res.n}, answered ${res.answered} (want 4 rows, 3 answered: each item scored once)`);
    judge('SKIP-RESULTS', H, w, res.skipped === 1 && /Skipped: 1/.test(res.ratio), `MAP results skipped=${res.skipped}, ratio "${res.ratio}"`);
    await shot(page, w, 'map-results-skipped');
    // OFF (from the share link's -S0)
    const parsed = await page.evaluate(() => window.parseMapShareLink('35-SI-191,201-ON-4-S0'));
    judge('SKIP-OFF', H, w, parsed && parsed.allowSkip === false, `?map=...-S0 decodes allowSkip ${parsed && parsed.allowSkip}`);
    await start(false, 2);
    await waitFor(page, () => window.state.mapMode && !!window.state.currentQ, 8000, 'map off');
    await sleep(200);
    const off = await btnInfo(page, '#skipQuestionBtn', '.mq-qactions', '#ttsBtn');
    judge('SKIP-OFF', H, w, !off.visible, 'allowSkip false: the MAP Skip still shows');
    await page.evaluate(() => window.finalizeMapSession());
    if (RULES.has('SKIP-MAP-REDO')) await runMapRedo(page, w);
}

/* ================================================================== real-input runs (narrow critic r1, 2026-11-19) */
const endModals = (page) => page.evaluate(() => [...document.querySelectorAll('body > div')].filter((d) => /z-index: ?9999/.test(d.getAttribute('style') || '') && /Completed|Needed|Time's up|Nice work|Good try/i.test(d.textContent)).length);
const clearEnd = (page) => page.evaluate(() => { document.querySelectorAll('body > div').forEach((d) => { if (/z-index: ?9999/.test(d.getAttribute('style') || '')) d.remove(); }); document.querySelectorAll('.modal, .modal-overlay').forEach((m) => { m.style.display = 'none'; }); });
/** Type into the card's answer box and press Enter (the pupil's keyboard). */
async function typeCard(page, v) {
    await page.evaluate(() => { const i = document.getElementById('answerInput'); i.disabled = false; i.value = ''; i.focus(); });
    await page.type('#answerInput', String(v));
    await page.keyboard.press('Enter');
}
const cardAns = (page) => page.evaluate(() => String(window.state.currentQ.ans));
const waitQ = (page, n) => waitArg(page, (n) => window.state.qCount === n && !window.state.hasAnswered && !document.getElementById('skipReturnIntro'), n, 9000, `card Q${n}`);
const waitPassMove = async (page, at) => waitArg(page, (at) => (window.state._skipReturnIdx !== at && !window.state.hasAnswered) || (window.state.skipReturn && window.state.skipReturn.done), at, 9000, 'card pass advance');

async function runCardReal(page, w) {
    const H = 'card';
    await clearEnd(page);
    await setSkipOff(page, false);
    await startPractice(page, 'practice', 5);
    await waitQ(page, 1);
    await typeCard(page, await cardAns(page));                       // Q1 right
    await waitQ(page, 2);
    await typeCard(page, '987654'); await sleep(500);                  // Q2 wrong, then Skip
    await page.click('#skipQuestionBtn');
    await waitQ(page, 3);
    await page.click('#skipQuestionBtn');                             // Q3 Skip
    await waitQ(page, 4);
    await typeCard(page, await cardAns(page)); await sleep(1500);      // Q4 right (typed, Enter)
    await waitQ(page, 5);
    await typeCard(page, '987654'); await sleep(500);                  // Q5 (the LAST item) wrong, then Skip
    await page.click('#skipQuestionBtn');
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 9000, 'card intro');
    await sleep(3000);                                                 // any stray advance from an earlier item lands now
    const g = await page.evaluate(() => ({ sh: (window.state.sessionHistory || []).length, msg: document.getElementById('skipReturnMsg').textContent.trim(),
        pill: (document.getElementById('skipCountPill') || {}).textContent || '', dots: [...document.querySelectorAll('#questionDots [title], .q-dot[title]')].map((d) => d.getAttribute('title')) }));
    judge('SKIP-END-GATE', H, w, g.sh === 0 && (await endModals(page)) === 0, `under the intro: ${g.sh} session rows, ${await endModals(page)} end screens (want 0, 0)`);
    judge('SKIP-COUNT-MATCH', H, w, g.msg === "You skipped 3. Let's fix them." && g.pill.trim() === 'Skipped: 3', `intro "${g.msg}" vs count "${g.pill.trim()}"`);
    const wrongDots = g.dots.filter((t) => /Incorrect, then skipped/.test(t)).length;
    judge('SKIP-KEEP-WRONG', H, w, wrongDots === 2, `dots reading "Incorrect, then skipped": ${wrongDots} (want 2: Q2, Q5) ${JSON.stringify(g.dots)}`);
    await shot(page, w, 'card-return-intro');
    await page.click('#skipReturnGo');
    await sleep(300);
    const hdr = await page.evaluate(() => (document.getElementById('goalProgress') || {}).textContent || '');
    judge('SKIP-COUNT-MATCH', H, w, /Fixing 1 of 3/.test(hdr), `pass header reads "${hdr}", want "Fixing 1 of 3" (R3)`);
    await shot(page, w, 'card-return-item', '#gameView');
    let at = await page.evaluate(() => window.state._skipReturnIdx);
    await page.click('#skipQuestionBtn');                             // pass 1 (Q2): skip again
    await waitPassMove(page, at);
    judge('SKIP-END-GATE', H, w, (await page.evaluate(() => (window.state.sessionHistory || []).length)) === 0, 'a session row was written mid-pass');
    at = await page.evaluate(() => window.state._skipReturnIdx);
    await typeCard(page, await cardAns(page));                         // pass 2 (Q3): right
    await waitPassMove(page, at);
    await typeCard(page, '987654'); await sleep(600);                  // pass 3 (Q5): wrong, then right
    await typeCard(page, await cardAns(page));
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 9000, 'card end');
    await sleep(3000);
    const r = await page.evaluate(() => { const st = window.state; const h = st.sessionHistory; return { n: h.length, score: h[0].score, pct: h[0].percentage, sk: h[0].skipped, skw: h[0].skippedAfterWrong, hist: st.questionHistory.map((e) => e.status) }; });
    judge('SKIP-END-GATE', H, w, r.n === 1 && (await endModals(page)) === 1, `after the pass: ${r.n} session rows, ${await endModals(page)} end screens (want 1, 1)`);
    judge('SKIP-TOTAL', H, w, r.score === '4/5' && r.pct === 80, `session row ${r.score} (${r.pct} %), want 4/5 (80 %): correct / totalProblems`);
    judge('SKIP-NOT-WRONG', H, w, JSON.stringify(r.hist) === '["correct","skipped","correct","correct","correct"]', `history ${JSON.stringify(r.hist)}`);
    await clearEnd(page);
    const dash = await page.evaluate(() => { window.renderSessionHistory && window.renderSessionHistory(); return document.body.textContent; });
    judge('SKIP-KEEP-WRONG', H, w, r.sk === 1 && r.skw === 1 && /1 incorrect, then skipped/.test(dash), `row skipped ${r.sk}, skippedAfterWrong ${r.skw}, dashboard "incorrect, then skipped" ${/incorrect, then skipped/.test(dash)}`);

    // SKIP-TIMER: the game clock runs out under the return-pass intro
    await clearEnd(page);
    await startPractice(page, 'practice', 3, 60);
    await waitQ(page, 1);
    await page.click('#skipQuestionBtn');
    await waitQ(page, 2);
    await page.click('#skipQuestionBtn');
    await waitQ(page, 3);
    await typeCard(page, await cardAns(page));
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 9000, 'card timer intro');
    await page.evaluate(() => { window.state.timerRemaining = 1; });
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 6000, 'card time up').catch(() => {});
    await sleep(400);
    const t = await page.evaluate(() => { const st = window.state; const h = st.sessionHistory || []; return { intro: !!document.getElementById('skipReturnIntro'), n: h.length, sk: h[0] && h[0].skipped, hist: st.questionHistory.map((e) => e.status) }; });
    const tEnd = await endModals(page);
    judge('SKIP-TIMER', H, w, !t.intro && t.n === 1 && tEnd === 1 && t.sk === 2 && !t.hist.includes('incorrect'),
        `time up under the intro: intro still up ${t.intro}, rows ${t.n}, end screens ${tEnd}, skipped ${t.sk} (want 2), history ${JSON.stringify(t.hist)}`);
    if (t.intro) { await page.click('#skipReturnGo').catch(() => {}); await sleep(300); }
    await clearEnd(page);
}

async function runWorksheetReal(page, w) {
    const H = 'worksheet';
    await page.evaluate(() => { document.querySelectorAll('body > div[style*="z-index: 9999"], .mq-wsres-teacher').forEach((o) => o.remove()); document.querySelectorAll('.modal, .modal-overlay').forEach((m) => { m.style.display = 'none'; }); });
    await setSkipOff(page, false);
    await startPractice(page, 'worksheet', 4);
    await waitFor(page, () => (window.state.worksheetQs || []).length === 4 && !!document.getElementById('ws_card_3'), 10000, 'worksheet cards');
    const typeWs = async (i) => { const v = await page.evaluate((i) => String(window.state.worksheetQs[i].ans), i); await page.click(`#ws_input_${i}`); await page.type(`#ws_input_${i}`, v); };
    await page.click('#ws_card_1 .ws-skip-btn');
    await page.click('#ws_card_2 .ws-skip-btn');
    await typeWs(0); await typeWs(3);
    const pillTxt = () => page.evaluate(() => { const e = document.getElementById('worksheetSkipCount'); return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : ''; });
    const before = await pillTxt();
    await page.evaluate(() => window.checkAllWorksheet());
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 5000, 'worksheet intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-COUNT-MATCH', H, w, msg === "You skipped 2. Let's fix them." && before === 'Skipped: 2', `intro "${msg}" vs count "${before}"`);
    await shot(page, w, 'worksheet-return-intro');
    await page.click('#skipReturnGo');
    await sleep(250);
    const shown = await pillTxt();
    judge('SKIP-COUNT-MATCH', H, w, shown === 'Skipped: 2', `count when the first skipped card is SHOWN reads "${shown}", want "Skipped: 2" (drops only on answer)`);
    await shot(page, w, 'worksheet-return-item', '#worksheetView');
    await typeWs(1);
    await page.click('#wsReturnNextBtn');
    await sleep(250);
    const answered = await pillTxt();
    judge('SKIP-COUNT-MATCH', H, w, answered === 'Skipped: 1', `count after answering the first returned card reads "${answered}", want "Skipped: 1"`);
    await page.click('#wsReturnNextBtn');                             // card 2: blank Next
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 8000, 'worksheet graded');
    const res = await page.evaluate(() => ({ h: window.state.sessionHistory[0], fin: !!window.state.worksheetQs[2]._skipped }));
    judge('SKIP-BLANK', H, w, res.h.score === '3/3' && res.h.skipped === 1 && res.fin, `blank Next in the pass: score ${res.h.score} (want 3/3), skipped ${res.h.skipped} (want 1), card skipped ${res.fin}`);
    await page.evaluate(() => { document.querySelectorAll('body > div[style*="z-index: 9999"], .mq-wsres-teacher').forEach((o) => o.remove()); window.showView && window.showView('homeView'); });
}

async function runQuizReal(page, w) {
    const H = 'quiz';
    const typeQ = async (flat) => { const v = await page.evaluate((f) => String(window.state.quizAllQuestions[f].question.questionData.ans), flat); await page.click('#qtAnswerInput'); await page.type('#qtAnswerInput', v); await page.keyboard.press('Enter'); await sleep(150); };
    const nextBtn = async () => { await page.evaluate(() => { const b = [...document.querySelectorAll('.qt-nav-btn.next')].find((x) => getComputedStyle(x).display !== 'none'); if (b) b.click(); }); await sleep(150); };
    // Q0 typed right, Q1 Skip, Q2 flagged AND answered, Q3 blank (never skipped)
    await buildQuiz(page, true, false);
    await typeQ(0); await nextBtn();
    await page.click('#qtSkipBtn'); await sleep(150);
    await page.click('.qt-flag-btn'); await sleep(100);
    await typeQ(2); await nextBtn();
    const pill = await page.evaluate(() => { const e = document.getElementById('qtSkipCount'); return e ? e.textContent.trim() : ''; });
    await page.evaluate(() => window.showQuizReview());
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 5000, 'quiz intro');
    const msg = await page.evaluate(() => document.getElementById('skipReturnMsg').textContent.trim());
    judge('SKIP-COUNT-MATCH', H, w, msg === "You skipped 1. Let's fix them." && pill === 'Skipped: 1', `intro "${msg}" vs count "${pill}" (the pass is the skipped questions only)`);
    await shot(page, w, 'quiz-return-intro');
    await page.click('#skipReturnGo');
    await sleep(200);
    const came = [];
    for (let k = 0; k < 6; k++) {
        const nb = await page.$('#qtReturnNext');
        if (!nb) break;
        const f = await page.evaluate(() => window.state.quizOrder[window.state.quizQuestionIndex]);
        const blank = await page.evaluate(() => { const i = document.getElementById('qtAnswerInput'); return !i || !i.value.trim(); });
        came.push({ f, blank });
        await page.click('#qtReturnNext');                            // Next with nothing typed
        await sleep(200);
    }
    judge('SKIP-COUNT-MATCH', H, w, JSON.stringify(came.map((c) => c.f)) === '[1]', `the pass brought back ${JSON.stringify(came.map((c) => c.f))}, want [1] (not the flagged-and-answered Q2 nor the blank Q3)`);
    await page.evaluate(() => window.submitQuiz());
    await sleep(500);
    const a = await page.evaluate(() => window.state.currentQuizResult.answers.map((x) => (x.skipped ? 'skipped' : x.correct ? 'right' : 'wrong')));
    const bad = came.filter((c) => c.blank && a[c.f] !== 'skipped');
    judge('SKIP-BLANK', H, w, a[1] === 'skipped' && !bad.length, `blank Next in the pass ended ${JSON.stringify(bad.map((c) => `Q${c.f}=${a[c.f]}`))}; Q1 = ${a[1]} (want skipped)`);
    await page.evaluate(() => { window.state.quizMode = false; window.showView('homeView'); });

    // SKIP-TIMER: the quiz clock runs out under the return-pass intro (6 s limit)
    await buildQuiz(page, true, false, 0.1);
    await page.click('#qtSkipBtn'); await sleep(120);
    await page.click('#qtSkipBtn'); await sleep(120);
    await typeQ(2); await nextBtn();
    await typeQ(3);
    await page.evaluate(() => window.showQuizReview());
    await waitFor(page, () => !!document.getElementById('skipReturnIntro'), 5000, 'quiz timer intro');
    await waitFor(page, () => { const r = window.state.currentQuizResult; return !!(r && r.answers && r.answers.some((x) => x.skipped)); }, 9000, 'quiz time up').catch(() => {});
    await sleep(300);
    const t = await page.evaluate(() => ({ intro: !!document.getElementById('skipReturnIntro'), a: window.state.currentQuizResult.answers.map((x) => (x.skipped ? 'skipped' : x.correct ? 'right' : 'wrong')) }));
    if (t.intro) { await page.click('#skipReturnGo').catch(() => {}); await sleep(300); }   // the pupil taps the stale intro
    judge('SKIP-TIMER', H, w, !t.intro && t.a[0] === 'skipped' && t.a[1] === 'skipped', `time up under the intro: intro still up ${t.intro}, answers ${JSON.stringify(t.a)}`);
    await page.evaluate(() => { window.state.quizMode = false; window.showView('homeView'); });
}

async function runMapRedo(page, w) {
    const H = 'map';
    await page.evaluate(() => window.startMapSession({ tier: '35', mode: 'practice', bands: ['191-200', '201-210'], domains: ['OA', 'NO'], itemCount: 3, allowSkip: true }));
    await waitFor(page, () => window.state.mapMode && !!window.state.currentQ, 8000, 'map practice item 1');
    await sleep(200);
    const answer = () => page.evaluate(() => { window.state.hasAnswered = true; window.recordMapAnswer({ correct: true }); });
    await answer();
    await waitArg(page, (n) => window.state.mapItemCount === n && !window.state.hasAnswered, 1, 8000, 'map practice item 2');
    await page.click('#skipQuestionBtn');
    await waitArg(page, (n) => window.state.mapItemCount === n && !window.state.hasAnswered, 2, 8000, 'map practice item 3');
    await page.evaluate(() => window.mapJumpToItem(1));
    await sleep(200);
    await answer();
    await sleep(200);
    const still = await page.evaluate(() => !!(window.state.mapHistory[1] && window.state.mapHistory[1].skipped));
    judge('SKIP-MAP-REDO', H, w, still, 'a navigator-dot redo cleared "skipped" (the return pass must score it, R4)');
    await page.evaluate(() => { window.mapResumeCurrent && window.mapResumeCurrent(); window.finalizeMapSession(); });
}

// The real-input runs play only when one of their rules is asked for, so a backtest row of the first rules
// (skip-return, skip-not-wrong) still judges exactly what it judged on its own commits.
const R1_RULES = ['SKIP-END-GATE', 'SKIP-TOTAL', 'SKIP-TIMER', 'SKIP-COUNT-MATCH', 'SKIP-BLANK', 'SKIP-KEEP-WRONG', 'SKIP-MAP-RIT', 'SKIP-MAP-REDO'];
const FIRST_RULES = ['SKIP-BTN', 'SKIP-COUNT', 'SKIP-NOT-WRONG', 'SKIP-RETURN', 'SKIP-RESULTS', 'SKIP-OFF'];
const wantR1 = R1_RULES.some((r) => RULES.has(r));
const wantFirst = FIRST_RULES.some((r) => RULES.has(r)) || RULES.has('SKIP-MAP-RIT');
(async () => {
    const RUN = {
        card: async (p, w) => { if (wantFirst) await runCard(p, w); if (wantR1) await runCardReal(p, w); },
        worksheet: async (p, w) => { if (wantFirst) await runWorksheet(p, w); if (wantR1) await runWorksheetReal(p, w); },
        quiz: async (p, w) => { if (wantFirst) await runQuiz(p, w); if (wantR1) await runQuizReal(p, w); },
        map: async (p, w) => { if (wantFirst) await runMap(p, w); else if (RULES.has('SKIP-MAP-REDO')) await runMapRedo(p, w); },
    };
    for (const w of WIDTHS) {
        const { page, problems, close } = await open({ seed: 4242, viewport: { width: w, height: SW.heightOf(w), deviceScaleFactor: SHOTS ? 2 : 1 }, lock: TOOL });
        try {
            await page.evaluate(() => { window.confirm = () => true; window.alert = () => {}; });
            let first = true;
            for (const h of HOSTS) {
                const n0 = findings.length;
                // each host on a freshly booted page: a host's end screens and state never leak into the next
                if (!first) {
                    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                    await waitFor(page, () => typeof window.generateQuestion === 'function' && !!window.SKILLS, 30000, 'app boot');
                    await page.evaluate(() => Promise.all([window.__mqLoadDeferred, window.__mqLoadWorksheet].filter(Boolean).map((f) => f().then(() => true, () => false))));
                    await page.evaluate(() => { window.confirm = () => true; window.alert = () => {}; });
                }
                first = false;
                try {
                    await RUN[h](page, w);
                    if (SHOTS && h === 'card') {   // the teacher's session history row, from the card run just played
                        await page.evaluate(() => { document.querySelectorAll('.modal, .modal-overlay').forEach((m) => { m.style.display = 'none'; }); window.showView && window.showView('dashboardView'); window.renderSessionHistory && window.renderSessionHistory(); });
                        await sleep(300);
                        await shot(page, w, 'teacher-history-skipped', '.dashboard-history');
                    }
                }
                catch (e) { findings.push(`ERROR ${h}@${w}: ${e.message.split("\n")[0]}${((e.stack || "").match(/ws-skip\.cjs:(\d+)/) || [])[1] ? ` (ws-skip.cjs:${(e.stack.match(/ws-skip\.cjs:(\d+)/) || [])[1]})` : ""}`); }
                console.log(`  ${findings.length === n0 ? 'ok  ' : 'FAIL'} ${h}@${w}${findings.length === n0 ? '' : ` (${findings.length - n0})`}`);
            }
            const errs = problems.filter((p) => p.type === 'pageerror');
            judge('SKIP-RETURN', 'page', w, !errs.length, `page errors: ${errs.map((e) => e.text).slice(0, 3).join(' | ')}`);
        } finally { await close(); }
    }
    for (const f of findings) console.log('  ' + f);
    console.log(findings.length ? `${TOOL}: FAIL (${findings.length})` : `${TOOL}: OK (${checks} checks)`);
    process.exit(findings.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`${TOOL}: FAIL (crash: ${e.message})`); process.exit(1); });
