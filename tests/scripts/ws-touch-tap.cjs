// SUPPORTS.md S1.8: touch numerals are tappable on screen. Checks, in the real app:
//  - each NUMBER is one target of at least 44 x 44 px (a tap 21 px off its centre still lands on it)
//  - a tap counts the nearest mark with a touch left and greys it; a double takes two taps
//  - the running count shows under the cell ("Touched N"), "Start again" clears it
//  - keyboard: the number is a button, Enter counts the next mark in order
//   node tests/scripts/ws-touch-tap.cjs
const { open } = require('../lib/ws-harness.cjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VP = { width: 1366, height: 650, deviceScaleFactor: 1, hasTouch: true };
const READY = (page) => page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
const GREYS = (sel) => `[...document.querySelectorAll('${sel} .ws-tn circle')].filter((c) => c.getAttribute('fill') === '#949494' || c.getAttribute('stroke') === '#949494').length`;
const top = (page, sel) => page.evaluate((s) => { const e = typeof s === 'string' ? document.querySelector(s) : null; return e ? Math.round(e.getBoundingClientRect().top) : null; }, sel);
const setSkill = (page, c, k, sup) => page.evaluate((c, k, sup) => {
    window.clearSetOptions({ silent: true });
    if (sup) {
        const def = window.offeredOptionsFor(c, k).find((d) => d.id === 'support' && d.supportsModel);
        window.setSetOptions(c, k, { support: [...new Set([...(def.default || []), sup])] }, { silent: true });
    }
    window.setHelpAfterWrong('ladder');
}, c, k, sup);
const startCard = (page, c, k) => page.evaluate((c, k) => {
    const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
    window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); window.scrollTo(0, 0);
}, c, k);
const centre = (page, sel, i = 0) => page.evaluate((s, i) => { const e = document.querySelectorAll(s)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel, i);
const said = (page, root) => page.evaluate((r) => { const b = document.querySelector(`${r} .mq-tn-said`); return b ? b.textContent : null; }, root);
const aeIsTn = (page) => page.evaluate(() => !!(document.activeElement && document.activeElement.matches('.ws-tn[data-mq-tn]')));

/** Practice card, count all (teacher option) on add_facts: R3-1, R3-2, R3-4, R3-5, R3-6, owner ruling (c). */
async function realCard(fails) {
    const ok = (c, m) => { if (!c) fails.push('card: ' + m); };
    const { page, problems, close } = await open({ seed: 7, viewport: VP });
    try {
        await READY(page);
        await setSkill(page, 'addition', 'add_facts', 'touchall');
        await startCard(page, 'addition', 'add_facts');
        await sleep(1200);
        const B = '#gameView .ws-tn[role="button"]';
        const nb = await page.evaluate((s) => document.querySelectorAll(s).length, B);
        ok(nb === 2, `count all draws both numbers as targets: ${nb}`);
        const checkSel = await page.evaluate(() => { const b = [...document.querySelectorAll('#gameView button')].find((x) => /check|submit/i.test(x.textContent) && x.offsetParent); if (b && !b.id) b.id = 'tt-check'; return b ? '#' + b.id : null; });
        const check0 = await top(page, checkSel);
        await page.focus('#answerInput');
        const c0 = await centre(page, B, 0);
        await page.touchscreen.tap(c0.x, c0.y);
        await sleep(300);
        ok((await top(page, checkSel)) === check0, `R3-4: Check does not move on the first tap (${check0} -> ${await top(page, checkSel)})`);
        ok(!(await aeIsTn(page)), 'R3-2: a tap does not take the focus');
        await page.keyboard.type('1');
        ok((await page.evaluate(() => document.getElementById('answerInput').value)) === '1', 'R3-2: a digit typed after a tap lands in the answer box');
        await page.evaluate(() => { document.getElementById('answerInput').value = ''; });
        ok((await said(page, '#gameView')) === '', `ruling (c): count all shows no number before the pupil answers: "${await said(page, '#gameView')}"`);
        // R3-1: keyboard counting is not taken over by the active box
        await page.click('#gameView .mq-tn-reset');
        const lastLabel = await page.evaluate((s) => { const b = [...document.querySelectorAll(s)].pop(); b.focus(); return b.getAttribute('aria-label'); }, B);
        const n = Number((/: (\d+) touch/.exec(lastLabel) || [])[1]);
        for (let i = 0; i < n; i++) { await page.keyboard.press('Enter'); await sleep(250); }
        await sleep(1200);
        ok(await aeIsTn(page), 'R3-1: focus stays on the number while counting with Enter');
        ok((await page.evaluate(GREYS('#gameView'))) === n, `R3-1: ${n} Enters grey ${n} touches: ${await page.evaluate(GREYS('#gameView'))}`);
        // wrong answer: the ladder keeps the teacher's count-all marks (R3-6) and the count resets with the redraw (R3-5)
        await page.evaluate(() => { const st = window.state; st.hasAnswered = false; const i = document.getElementById('answerInput'); i.value = String(Number(st.currentQ.ans) + 1); window.submitAnswer(); });
        await sleep(900);
        ok((await page.evaluate((s) => document.querySelectorAll(s).length, B)) === 2, 'R3-6: both numbers keep their dots after a wrong answer');
        const g1 = await page.evaluate(GREYS('#gameView'));
        const s1 = await said(page, '#gameView');
        ok(g1 === 0 ? (s1 === '') : true, `R3-5: the count line matches the redrawn cell: greys ${g1}, "${s1}"`);
        const c1 = await centre(page, B, 0);
        await page.touchscreen.tap(c1.x, c1.y); await sleep(250);
        ok(/^Touched \d+$/.test((await said(page, '#gameView')) || ''), `ruling (c): after an answer, count all says "Touched N": "${await said(page, '#gameView')}" greys ${await page.evaluate(GREYS('#gameView'))} ans ${await page.evaluate(() => document.querySelectorAll('#gameView .mq-ladder-extra, #gameView [data-mq-ladder]').length)}`);
        await page.click('#gameView .mq-tn-reset'); await sleep(150);
        ok((await page.evaluate(GREYS('#gameView'))) === 0, 'R3-5: Start again clears the LIVE cell');
    } finally {
        if (problems.length) fails.push('card console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

/** × on the practice card: the count-by line (owner ruling (a)). */
async function realTimes(fails) {
    const ok = (c, m) => { if (!c) fails.push('times: ' + m); };
    const { page, problems, close } = await open({ seed: 11, viewport: VP });
    try {
        await READY(page);
        await setSkill(page, 'multiplication', 'mult_facts', 'touch');
        let tries = 0;
        do { await startCard(page, 'multiplication', 'mult_facts'); await sleep(700); tries++; }
        while (tries < 8 && !(await page.evaluate(() => document.querySelector('#gameView .ws-tn[role="button"]'))));
        const s0 = await said(page, '#gameView');
        ok(/^How much is \d+ [a-z]+\?$/.test(s0 || ''), `prompt from the start: "${s0}"`);
        const c = await centre(page, '#gameView .ws-tn[role="button"]', 0);
        for (let i = 0; i < 2; i++) { await page.touchscreen.tap(c.x, c.y); await sleep(200); }
        ok(/^\d+, \d+ \(counting by [a-z]+\)$/.test((await said(page, '#gameView')) || ''), `count-by line: "${await said(page, '#gameView')}"`);
    } finally {
        if (problems.length) fails.push('times console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

/** Online worksheet: 40 px on every card from the start (R3-3), no growth on a wrong answer or a tap (R3-4), tap then type (R3-2). */
async function realWorksheet(fails) {
    const ok = (c, m) => { if (!c) fails.push('worksheet: ' + m); };
    const { page, problems, close } = await open({ seed: 5, viewport: VP });
    try {
        await READY(page);
        await setSkill(page, 'addition', 'add_facts', null);
        await page.evaluate(() => { const st = window.state; st.category = 'addition'; st.skill = 'add_facts'; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); window.scrollTo(0, 0); });
        await sleep(1200);
        const m = () => page.evaluate(() => [0, 1, 2, 3].map((i) => { const cd = document.getElementById('ws_card_' + i); const v = cd.querySelector('.ws-card-visual'); return { px: getComputedStyle(v).getPropertyValue('--mq-digit').trim(), h: Math.round(cd.getBoundingClientRect().height) }; }));
        const before = await m();
        ok(before.every((c) => c.px === '40px'), `R3-3: every card at 40 px from the start: ${JSON.stringify(before)}`);
        await page.evaluate(() => { const q = window.state.worksheetQs[1]; const inp = document.getElementById('ws_input_1'); inp.value = String(Number(q.ans) + 1); window.checkWorksheetAnswer(1); });
        await sleep(800);
        const after = await m();
        ok(after.every((c) => c.px === '40px'), `R3-3: still 40 px after a wrong answer: ${JSON.stringify(after)}`);
        // the ladder's own message line is the only thing a wrong answer may add (pre-existing ladder behaviour)
        const msg = await page.evaluate(() => { const e = document.querySelector('#ws_card_1 .mq-ladder-extra'); if (!e) return 0; const cs = getComputedStyle(e); return Math.round(e.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom) + parseFloat(getComputedStyle(e.parentElement).rowGap || 0) || 0); });
        ok(after[0].h - before[0].h <= msg, `R3-3: the row grows by no more than the ladder message (${msg}): ${before.map((c) => c.h)} -> ${after.map((c) => c.h)}`);
        const B = '#ws_card_1 .ws-tn[role="button"]';
        const c = await centre(page, B, 0);
        if (!c) { fails.push('worksheet: no touch numeral on card 1 after a wrong answer'); return; }
        const h0 = await m();
        await page.focus('#ws_input_1');
        await page.evaluate(() => { document.getElementById('ws_input_1').value = ''; });
        await page.touchscreen.tap(c.x, c.y); await sleep(300);
        const h1 = await m();
        ok(JSON.stringify(h0.map((x) => x.h)) === JSON.stringify(h1.map((x) => x.h)), `R3-4: no card grows on the first tap: ${h0.map((x) => x.h)} -> ${h1.map((x) => x.h)}`);
        await page.keyboard.type('5');
        ok((await page.evaluate(() => document.getElementById('ws_input_1').value)) === '5', 'R3-2: a digit typed after a tap lands in the answer box');
    } finally {
        if (problems.length) fails.push('worksheet console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

/** Quiz with the teacher's count-all option: tap then type (R3-2), Next does not move (R3-4), keyboard (R3-1). */
async function realQuiz(fails) {
    const ok = (c, m) => { if (!c) fails.push('quiz: ' + m); };
    const { page, problems, close } = await open({ seed: 9, viewport: VP });
    try {
        await READY(page);
        await setSkill(page, 'addition', 'add_facts', 'touchall');
        await page.evaluate(() => {
            const questions = [];
            for (let i = 0; i < 3; i++) {
                const q = window.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: 77 + i, itemIndex: i });
                questions.push({ id: i, skillId: 'add_facts', points: 1, questionData: window.quizQuestionData(q) });
            }
            const test = { id: null, name: 'Q', createdAt: null, updatedAt: null, sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: true, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
            window.startQuizTest(); window.scrollTo(0, 0);
        });
        await sleep(1200);
        const B = '#quizTakeView .ws-tn[role="button"]';
        const c = await centre(page, B, 0);
        if (!c) { fails.push('quiz: no touch numerals'); return; }
        const nextSel = await page.evaluate(() => { const b = [...document.querySelectorAll('#quizTakeView button')].find((x) => x.offsetParent && /next|submit|check/i.test(x.textContent)); if (b && !b.id) b.id = 'tt-next'; return b ? '#' + b.id : null; });
        const n0 = await top(page, nextSel);
        await page.focus('#qtAnswerInput');
        await page.touchscreen.tap(c.x, c.y); await sleep(300);
        ok((await top(page, nextSel)) === n0, `R3-4: Next does not move on the first tap (${n0} -> ${await top(page, nextSel)})`);
        await page.keyboard.type('4');
        ok((await page.evaluate(() => document.getElementById('qtAnswerInput').value)) === '4', 'R3-2: a digit typed after a tap lands in the answer box');
        await page.evaluate(() => { document.getElementById('qtAnswerInput').value = ''; });
        await page.click('#quizTakeView .mq-tn-reset');
        await page.evaluate((s) => document.querySelector(s).focus(), B);
        for (let i = 0; i < 3; i++) { await page.keyboard.press('Enter'); await sleep(250); }
        await sleep(1200);
        ok(await aeIsTn(page), 'R3-1: focus stays on the number while counting with Enter');
        ok((await page.evaluate(GREYS('#quizTakeView'))) === 3, `R3-1: 3 Enters grey 3 touches: ${await page.evaluate(GREYS('#quizTakeView'))}`);
    } finally {
        if (problems.length) fails.push('quiz console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

(async () => {
    const { page, problems, close } = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const fails = [];
    const ok = (c, m) => { if (!c) fails.push(m); };
    try {
        await page.evaluate(async () => {
            const k = await import('./js/modules/sheet/index.js');
            const v = document.getElementById('gameView');
            v.style.display = 'block'; v.classList.add('active');
            const host = document.createElement('div');
            host.id = 'tt-host'; host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;background:#fff';
            host.innerHTML = `<div class="mq-scell" style="font-family:Andika;font-size:40px;padding:40px">`
                + `<span id="n7">${k.touchNumeralHTML('7', { em: 40, unit: 'px' })}</span> + `
                + `<span id="n12">${k.touchNumeralHTML('1', { em: 40, unit: 'px' })}${k.touchNumeralHTML('2', { em: 40, unit: 'px' })}</span></div>`;
            v.prepend(host);
            await document.fonts.ready;
        });
        await page.waitForFunction(() => document.querySelector('#n7 .ws-tn[data-mq-tn]'), { timeout: 5000 });
        const info = await page.evaluate(() => {
            document.getElementById('tt-host').scrollIntoView({ block: 'center' });
            const r = (s) => s.getBoundingClientRect();
            const a = r(document.querySelector('#n7 .ws-tn'));
            const t = document.querySelectorAll('#n12 .ws-tn');
            return {
                a: { x: a.left + a.width / 2, y: a.top + a.height / 2 },
                roles: [...document.querySelectorAll('#tt-host [role="button"]')].length,
                hidden2: t[1].getAttribute('aria-hidden'),
                label: document.querySelector('#n7 .ws-tn').getAttribute('aria-label'),
            };
        });
        ok(info.roles === 2, `one button per NUMBER (7 and 12): got ${info.roles}`);
        ok(info.hidden2 === 'true', 'the 2 of 12 is part of the 12 target');
        ok(/^7: 7 touch dots/.test(info.label || ''), `aria-label: ${info.label}`);
        // 44 px target: the point 21 px above / below the centre still hits the 7
        for (const dy of [-21, 21]) {
            const hit = await page.evaluate((x, y) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest && e.closest('#n7 .ws-tn')); }, info.a.x, info.a.y + dy);
            ok(hit, `tap target reaches ${dy} px from the 7's centre`);
        }
        const greys = () => page.evaluate(() => [...document.querySelectorAll('#n7 g.ws-td-mark')].map((g) => [...g.querySelectorAll('circle')].map((c) => c.getAttribute('fill') === '#949494' || c.getAttribute('stroke') === '#949494' ? 1 : 0).reduce((s, v) => s + v, 0)));
        const said = () => page.evaluate(() => { const b = document.querySelector('#tt-host .mq-tn-count .mq-tn-said'); return b ? b.textContent : null; });
        for (let i = 0; i < 7; i++) await page.mouse.click(info.a.x, info.a.y);
        const g = await greys();
        ok(g.reduce((s, v) => s + v, 0) === 7, `7 taps grey 7 touches: ${JSON.stringify(g)}`);
        ok((await said()) === '', `count all (every number dotted): no number before the pupil answers: ${await said()}`);
        await page.mouse.click(info.a.x, info.a.y);
        ok((await greys()).reduce((s, v) => s + v, 0) === 7, 'an 8th tap on a fully counted 7 counts nothing');
        await page.click('#tt-host .mq-tn-reset');
        ok((await greys()).every((v) => v === 0), 'Start again clears every mark');
        ok((await said()) === '', `Start again empties the count line (its space stays): ${await said()}`);
        await page.focus('#n12 .ws-tn[role="button"]');
        for (let i = 0; i < 3; i++) await page.keyboard.press('Enter');
        ok((await page.evaluate(() => [...document.querySelectorAll('#n12 circle')].filter((c) => c.getAttribute('fill') === '#949494' || c.getAttribute('stroke') === '#949494').length)) === 3, "Enter counts the 12's marks in order");
    } catch (e) {
        fails.push(String(e && e.stack || e));
    } finally {
        await close();
    }
    // R3-8: the REAL hosts (practice card, online worksheet, quiz) at Chromebook size, touch screen
    for (const run of [realCard, realTimes, realWorksheet, realQuiz]) {
        try { await run(fails); } catch (e) { fails.push(`${run.name}: ${String(e && e.stack || e)}`); }
    }
    if (problems.length) fails.push('console: ' + JSON.stringify(problems.slice(0, 3)));
    fails.forEach((f) => console.log('  ' + f));
    console.log(`ws-touch-tap: ${fails.length ? 'FAIL' : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})();
