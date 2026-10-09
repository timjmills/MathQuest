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
        // R4-4, ruling (c): once the question is answered, count all says "Touched N" in the quiz too
        await wrongQuiz(page); await sleep(1200);
        const c2 = await centre(page, B, 0);
        if (c2) { await page.touchscreen.tap(c2.x, c2.y); await sleep(300); }
        ok(/^Touched \d+$/.test((await said(page, '#quizTakeView')) || ''), `R4-4: count all says "Touched N" after the quiz answer: "${await said(page, '#quizTakeView')}"`);
    } finally {
        if (problems.length) fails.push('quiz console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

/* ---- critic r4 cases (R4-6) ---- */

const TN = (root) => `[...document.querySelectorAll('${root} .ws-tn')].length`;
/** A wrong answer on the practice card: the answer + 1, typed into the stack's digit boxes or the answer box. */
const wrongCard = (page) => page.evaluate(() => {
    const st = window.state; st.hasAnswered = false;
    const v = String(Number(String(st.currentQ.ans).replace(/,/g, '')) + 1);
    const boxes = [...document.querySelectorAll('#visualAid input.mq-digit')];
    if (boxes.length) { const pad = boxes.length - v.length; boxes.forEach((b, i) => { b.value = i >= pad ? v.charAt(i - pad) : ''; }); }
    const i = document.getElementById('answerInput'); if (i) i.value = v;
    window.submitAnswer();
});
const wrongWorksheet = (page, i) => page.evaluate((i) => {
    const q = window.state.worksheetQs[i];
    const v = String(Number(String(q.ans).replace(/,/g, '')) + 1);
    const card = document.getElementById(`ws_card_${i}`);
    const cols = [...card.querySelectorAll('.column-answer-input')].filter((c) => c.offsetParent);
    if (cols.length) { const pad = cols.length - v.length; cols.forEach((c, k) => { c.value = k >= pad ? v.charAt(k - pad) : ''; }); window.checkWorksheetAnswerFromColumns(i); return; }
    const digits = [...card.querySelectorAll('input.mq-digit')];
    if (digits.length) { const pad = digits.length - v.length; digits.forEach((b, k) => { b.value = k >= pad ? v.charAt(k - pad) : ''; b.dispatchEvent(new Event('input', { bubbles: true })); }); }
    const inp = document.getElementById(`ws_input_${i}`); inp.value = v;
    window.checkWorksheetAnswer(i);
}, i);
const startQuiz = (page, c, k, seed = 301) => page.evaluate((c, k, seed) => {
    const questions = [];
    for (let i = 0; i < 2; i++) {
        const q = window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i });
        questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
    }
    const test = { id: null, name: 'Q', createdAt: null, updatedAt: null, sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: true, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
    window.handleQuizURL(window.compressTestForURL(test));
    const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
    window.startQuizTest(); window.scrollTo(0, 0);
}, c, k, seed);
/** A wrong answer in the quiz, then the question drawn again (the quiz shows its feedback on a redraw). */
const wrongQuiz = (page) => page.evaluate(() => {
    const st = window.state; const flat = st.quizOrder[st.quizQuestionIndex];
    const q = st.quizAllQuestions[flat].question.questionData;
    window.submitQuizTextAnswer(flat, String(Number(String(q.ans).replace(/,/g, '')) + 1));
    window.navigateQuizQuestion(1); window.navigateQuizQuestion(-1); window.scrollTo(0, 0);
});

/** R4-1, owner ruling (b): a wrong answer keeps the teacher's touch marks and ADDS the next support, on every host. */
async function realKeep(fails) {
    const { page, problems, close } = await open({ seed: 21, viewport: VP });
    try {
        await READY(page);
        for (const [c, k, sup] of [['subtraction', 'subtract', 'touch'], ['subtraction', 'subtract', 'touchall'], ['addition', 'add_column_multi', 'touch'], ['addition', 'add_column_multi', 'touchall'], ['addition', 'add_facts', 'touch']]) {
            const tag = `keep ${k} ${sup}`;
            await setSkill(page, c, k, sup);
            // card
            // an item the teacher's option can draw on (count back needs a one-digit number to dot)
            let n0 = 0;
            for (let t = 0; t < 10 && !n0; t++) { await startCard(page, c, k); await sleep(700); n0 = await page.evaluate(TN('#visualAid')); }
            if (!n0) { fails.push(`${tag} card: no teacher numerals to keep`); continue; }
            await wrongCard(page); await sleep(900);
            const n1 = await page.evaluate(TN('#visualAid'));
            const look = await page.evaluate(() => ({ fb: (document.getElementById('feedbackArea') || {}).textContent || '', arrow: !!document.querySelector('#visualAid [data-ws-support-on="startarrow"]'), lad: (document.querySelector('#visualAid [data-mq-ladder]') || { getAttribute: () => '' }).getAttribute('data-mq-ladder') }));
            if (n1 !== n0) fails.push(`${tag} card: wrong 1 changed the numerals ${n0} -> ${n1} ("${look.fb}")`);
            if (look.arrow && !/Now use the arrow too\./.test(look.fb)) fails.push(`${tag} card: the arrow is added but the message is "${look.fb}"`);
            if (/^Not yet\. Use /.test(look.fb.trim())) fails.push(`${tag} card: the message drops the teacher's dots: "${look.fb}"`);
            if (k === 'add_facts') continue;
            // worksheet
            await page.evaluate((c, k) => { const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4; window.initWorksheet(); window.scrollTo(0, 0); }, c, k);
            await sleep(1200);
            const w0 = await page.evaluate(TN('#ws_card_0'));
            await wrongWorksheet(page, 0); await sleep(900);
            const w1 = await page.evaluate(TN('#ws_card_0'));
            const wl = await page.evaluate(() => !!document.querySelector('#ws_card_0 [data-mq-ladder]'));
            if (!wl) fails.push(`${tag} worksheet: the wrong answer did not climb the ladder`);
            if (w1 !== w0 || !w0) fails.push(`${tag} worksheet: wrong 1 changed the numerals ${w0} -> ${w1}`);
            await page.evaluate(() => { document.querySelectorAll('body > .modal-overlay, body > [style*="z-index: 9999"]').forEach((e) => e.remove()); });
            // quiz
            let q0 = 0;
            for (let t = 0; t < 10 && !q0; t++) { await startQuiz(page, c, k, 301 + 7 * t); await sleep(900); q0 = await page.evaluate(TN('#quizTakeView .qt-cell')); }
            await wrongQuiz(page); await sleep(1200);
            const q1 = await page.evaluate(TN('#quizTakeView .qt-cell'));
            const qfb = await page.evaluate(() => (document.querySelector('#quizTakeView .qt-feedback') || {}).textContent || '');
            if (q1 !== q0 || !q0) fails.push(`${tag} quiz: wrong 1 changed the numerals ${q0} -> ${q1} ("${qfb}")`);
            await page.evaluate(() => { window.state.quizMode = false; });
        }
    } finally {
        if (problems.length) fails.push('keep console: ' + JSON.stringify(problems.slice(0, 3)));
        await close();
    }
}

/** R4-2, R4-3: a column stack counts per column, a 0 is no target, Start again is never under a box. */
async function realStack(fails) {
    const ok = (c, m) => { if (!c) fails.push('stack: ' + m); };
    for (const vp of [VP, { width: 1280, height: 600, deviceScaleFactor: 1, hasTouch: true }]) {
        const { page, problems, close } = await open({ seed: 33, viewport: vp });
        const at = `@${vp.width}x${vp.height}`;
        try {
            await READY(page);
            await setSkill(page, 'addition', 'add_column_multi', 'touch');
            let tries = 0;
            do { await startCard(page, 'addition', 'add_column_multi'); await sleep(800); tries++; }
            while (tries < 6 && (await page.evaluate(() => document.querySelectorAll('#gameView .ws-tn[role="button"]').length)) < 2);
            const labels = await page.evaluate(() => [...document.querySelectorAll('#gameView .ws-tn[role="button"]')].map((b) => b.getAttribute('aria-label')));
            ok(labels.length >= 2, `${at} numerals on the stack: ${labels.length}`);
            ok(labels.every((l) => !/^0:/.test(l)), `${at} R4-3: no target on a 0: ${JSON.stringify(labels)}`);
            for (const phase of ['start', 'wrong1']) {
                if (phase === 'wrong1') { await wrongCard(page); await sleep(1000); }
                const fb = await page.evaluate(() => (document.getElementById('feedbackArea') || {}).textContent || '');
                if (phase === 'wrong1') ok(!/Say \d+\. Touch the dots on \d+/.test(fb), `${at} R4-3: column words, not the whole sum: "${fb}"`);
                // two numerals in different columns: x centres differ
                const pts = await page.evaluate(() => [...document.querySelectorAll('#gameView .ws-tn[role="button"]')].map((b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: Number((/: (\d+) touch/.exec(b.getAttribute('aria-label')) || [])[1]) }; }));
                pts.sort((a, b) => b.x - a.x);
                const ones = pts[0];
                const other = pts.find((p) => Math.abs(p.x - ones.x) > 20);
                await page.click('#gameView .mq-tn-reset').catch(() => {});
                await page.touchscreen.tap(ones.x, ones.y); await sleep(200);
                if (ones.n >= 2) { await page.touchscreen.tap(ones.x, ones.y); await sleep(200); }
                const want = Math.min(2, ones.n);
                ok((await said(page, '#gameView')) === `Touched ${want}`, `${at} ${phase} R4-3: the ones column counts alone: "${await said(page, '#gameView')}" (want Touched ${want})`);
                if (other) {
                    await page.touchscreen.tap(other.x, other.y); await sleep(200);
                    ok((await said(page, '#gameView')) === 'Touched 1', `${at} ${phase} R4-3: another column starts its own count: "${await said(page, '#gameView')}"`);
                }
                // R4-2: Start again is hit-testable at its centre and clears
                const hit = await page.evaluate(() => {
                    const b = document.querySelector('#gameView .mq-tn-reset'); if (!b) return { err: 'no button' };
                    b.scrollIntoView({ block: 'center' });
                    const r = b.getBoundingClientRect();
                    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    const said = document.querySelector('#gameView .mq-tn-said').getBoundingClientRect();
                    const boxes = [...document.querySelectorAll('#visualAid input')].map((i) => i.getBoundingClientRect()).filter((q) => q.height);
                    const under = boxes.some((q) => q.bottom > Math.min(r.top, said.top) + 1 && q.top < Math.max(r.bottom, said.bottom) && q.right > Math.min(r.left, said.left) && q.left < Math.max(r.right, said.right));
                    return { x: r.left + r.width / 2, y: r.top + r.height / 2, me: e === b, h: Math.round(r.height), lines: Math.round(r.height / parseFloat(getComputedStyle(b).lineHeight || '20')), under };
                });
                ok(hit.me, `${at} ${phase} R4-2: Start again is the element at its own centre`);
                ok(!hit.under, `${at} ${phase} R4-2: no answer box overlaps the count line`);
                ok(hit.h >= 44, `${at} ${phase} Start again is at least 44 px tall: ${hit.h}`);
                await page.touchscreen.tap(hit.x, hit.y); await sleep(250);
                ok((await page.evaluate(GREYS('#gameView'))) === 0, `${at} ${phase} R4-2: a tap on Start again clears the stack`);
            }
        } finally {
            if (problems.length) fails.push('stack console: ' + JSON.stringify(problems.slice(0, 3)));
            await close();
        }
    }
}

/** R4-5: a ladder rung that brings the numerals (no teacher option) puts the count on the message's row: only that row appears. */
async function realRow(fails) {
    const ok = (c, m) => { if (!c) fails.push('row: ' + m); };
    const { page, problems, close } = await open({ seed: 41, viewport: VP });
    try {
        await READY(page);
        await setSkill(page, 'addition', 'add_facts', null);
        await startCard(page, 'addition', 'add_facts'); await sleep(900);
        const checkSel = await page.evaluate(() => { const b = [...document.querySelectorAll('#gameView button')].find((x) => /check|submit/i.test(x.textContent) && x.offsetParent); if (b && !b.id) b.id = 'tt-check2'; return b ? '#' + b.id : null; });
        const t0 = await top(page, checkSel);
        const cellH = () => page.evaluate(() => Math.round(document.querySelector('#visualAid .mq-scell, #visualAid').getBoundingClientRect().height));
        const h0 = await cellH();
        await wrongCard(page); await sleep(1000);
        const r = await page.evaluate(() => {
            const fb = document.getElementById('feedbackArea');
            const bar = document.querySelector('#gameView .mq-tn-count');
            return { tn: document.querySelectorAll('#visualAid .ws-tn').length, inRow: !!(bar && fb && fb.contains(bar)), bars: document.querySelectorAll('#gameView .mq-tn-count').length, fbH: fb ? Math.round(fb.getBoundingClientRect().height + parseFloat(getComputedStyle(fb).marginTop) + parseFloat(getComputedStyle(fb).marginBottom)) : 0 };
        });
        if (!r.tn) { fails.push('row: the add_facts ladder drew no touch numerals at wrong 1'); return; }
        ok(r.bars === 1 && r.inRow, `card: the count line sits in the ladder message's row: ${JSON.stringify(r)}`);
        const c = await centre(page, '#gameView .ws-tn[role="button"]', 0);
        await page.touchscreen.tap(c.x, c.y); await sleep(300);
        ok(/^Touched 1$/.test((await said(page, '#gameView')) || ''), `card: the row counts: "${await said(page, '#gameView')}"`);
        const t1 = await top(page, checkSel);
        // the numerals themselves may draw a little taller than the plain digits; nothing else may grow
        const grow = Math.max(0, (await cellH()) - h0);
        ok(t1 - t0 <= r.fbH + grow + 2, `card: only the message row is added (${t0} -> ${t1}, row ${r.fbH}, numerals ${grow})`);
        // the quiz: the same, after its redraw
        await startQuiz(page, 'addition', 'add_facts'); await sleep(1200);
        await wrongQuiz(page); await sleep(1200);
        const q = await page.evaluate(() => { const fb = document.querySelector('#quizTakeView .qt-feedback'); const bar = document.querySelector('#quizTakeView .mq-tn-count'); return { tn: document.querySelectorAll('#quizTakeView .ws-tn').length, inRow: !!(bar && fb && fb.contains(bar)), bars: document.querySelectorAll('#quizTakeView .mq-tn-count').length }; });
        if (q.tn) ok(q.bars === 1 && q.inRow, `quiz: the count line sits in the ladder message's row: ${JSON.stringify(q)}`);
    } finally {
        if (problems.length) fails.push('row console: ' + JSON.stringify(problems.slice(0, 3)));
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
    for (const run of [realCard, realTimes, realWorksheet, realQuiz, realKeep, realStack, realRow]) {
        try { await run(fails); } catch (e) { fails.push(`${run.name}: ${String(e && e.stack || e)}`); }
    }
    if (problems.length) fails.push('console: ' + JSON.stringify(problems.slice(0, 3)));
    fails.forEach((f) => console.log('  ' + f));
    console.log(`ws-touch-tap: ${fails.length ? 'FAIL' : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})();
