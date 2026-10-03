// Wave 1 lane B (critic B r2 #1): a pupil who TYPES THE ANSWER NATURALLY into digit boxes gets every
// box green. A fact or an equation in digit boxes (ansBox 'digit') is typed in reading order, left to
// right, starting in the box that has focus; a column stack is typed ones first (SP-20), its ones box
// focused. Checked on the practice card for several items of each kind.
//   node tests/scripts/wave1-b-ansbox-entry.cjs        -> prints wave1-b-ansbox-entry: OK | FAIL
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
    ['addition', 'add_facts', { ansBox: 'digit' }, 'ltr'],
    ['multiplication', 'mult_facts', { ansBox: 'digit' }, 'ltr'],
    ['division', 'div_facts', { ansBox: 'digit' }, 'ltr'],
    // a short answer typed into the RIGHT-hand box (place value, as the key prints it) is green too
    ['division', 'div_facts', { ansBox: 'digit' }, 'right'],
    ['addition', 'add_facts', { ansBox: 'digit' }, 'right'],
    ['addition', 'add_100_regroup', {}, 'rtl'],
    ['subtraction', 'sub_100_regroup', { ansBox: 'one' }, 'rtl'],
];
(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    let bad = 0, n = 0;
    for (const [c, k, opts, dir] of CASES) {
        for (let item = 0; item < 4; item++) {
            const ans = await page.evaluate(async (c, k, opts) => {
                const st = window.state;
                window.clearSetOptions({ silent: true });
                if (Object.keys(opts).length) window.setSetOptions(c, k, opts, { silent: true });
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; st.skillOptions = null;
                window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
                await new Promise((r) => setTimeout(r, 450));
                return String(st.currentQ.ans);
            }, c, k, opts);
            const boxes = await page.$$('#visualAid input.mq-digit');
            if (!boxes.length) { console.log(`FAIL ${k} item ${item}: no digit boxes`); bad++; continue; }
            // the pupil types where the focus already is (the cell puts it there), digit by digit
            const typed = dir === 'rtl' ? [...ans].reverse().join('') : ans;
            if (dir === 'right') {
                // right-align the digits: start in the box that leaves the answer ending in the last box
                const start = Math.max(0, boxes.length - ans.length);
                await page.evaluate((i) => document.querySelectorAll('#visualAid input.mq-digit')[i].focus(), start);
            } else await page.evaluate(() => { const f = document.activeElement; if (!f || !f.classList.contains('mq-digit')) { const b = document.querySelectorAll('#visualAid input.mq-digit'); b[0].focus(); } });
            for (const ch of typed) { await page.keyboard.type(ch); await sleep(60); }
            await sleep(350);
            const r = await page.evaluate(() => Array.from(document.querySelectorAll('#visualAid input.mq-digit')).map((e) => ({ v: e.value, ok: e.classList.contains('mq-live-correct'), bad: e.classList.contains('mq-live-wrong') })));
            const filled = r.filter((x) => x.v);
            const ok = filled.length === ans.length && filled.every((x) => x.ok && !x.bad) && filled.map((x) => x.v).join('') === ans;
            n++;
            console.log(`${ok ? 'ok  ' : 'FAIL'} ${k} ${JSON.stringify(opts)} ans ${ans} typed ${dir} -> [${r.map((x) => (x.v || '_') + (x.ok ? '+' : x.bad ? 'x' : '')).join(' ')}]`);
            if (!ok) bad++;
        }
    }
    // ---- (critic B r3 D1) the ONLINE WORKSHEET: answer card 0, let the worksheet auto-advance, then
    // type card 1's answer where the focus landed. Every box of card 1 must be green and the card right.
    for (const [c, k] of [['addition', 'add_facts'], ['multiplication', 'mult_facts'], ['division', 'div_facts']]) {
        await page.evaluate(async (c, k) => {
            const st = window.state;
            window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, { ansBox: 'digit' }, { silent: true });
            if (window.__wsReseed) window.__wsReseed(7);
            st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4;
            window.initWorksheet();
            await new Promise((r) => setTimeout(r, 1500));
        }, c, k);
        const a0 = await page.evaluate(() => String(window.state.worksheetQs[0].ans));
        await page.evaluate(() => document.querySelector('#ws_card_0 input.column-answer-input').focus());
        for (const ch of a0) { await page.keyboard.type(ch); await sleep(60); }
        await sleep(1200);                                       // 400 ms advance + 350 ms focus
        const a1 = await page.evaluate(() => String(window.state.worksheetQs[1].ans));
        const where = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#ws_card_1 input.column-answer-input')); return b.indexOf(document.activeElement); });
        for (const ch of a1) { await page.keyboard.type(ch); await sleep(60); }
        await sleep(500);
        const r = await page.evaluate(() => {
            const b = Array.from(document.querySelectorAll('#ws_card_1 input.column-answer-input'));
            const rec = (window.state.worksheetAnswers || window.state.wsAnswers || {})[1];
            return { boxes: b.map((e) => ({ v: e.value, ok: e.classList.contains('mq-live-correct'), bad: e.classList.contains('mq-live-wrong') })),
                cardOk: (document.getElementById('ws_card_1').style.border || '').includes('--correct') };
        });
        const filled = r.boxes.filter((x) => x.v);
        const ok = filled.map((x) => x.v).join('') === a1 && filled.every((x) => x.ok && !x.bad) && r.cardOk;
        n++; if (!ok) bad++;
        console.log(`${ok ? 'ok  ' : 'FAIL'} worksheet ${k} digit: card 1 ans ${a1}, focus landed in box ${where} -> [${r.boxes.map((x) => (x.v || '_') + (x.ok ? '+' : x.bad ? 'x' : '')).join(' ')}] card ${r.cardOk ? 'right' : 'NOT right'}`);
    }

    // ---- (critic B r3 D3, D4, D5) one verdict live and on Check; no gap; a 1-digit answer right-aligned
    const EDGE = [
        // [skill, answer wanted, boxes typed ('_' = leave empty), expected live, expected Check]
        ['addition', 'add_facts', 7, '07', 'green', true, '_7'],
        ['multiplication', 'mult_facts', 8, '008', 'green', true, '__8'],
        ['addition', 'add_facts', 0, '00', 'green', true],
        ['multiplication', 'mult_facts', 7, '_07', 'green', true],
        ['multiplication', 'mult_facts', 12, '1_2', 'neutral', false],
        ['multiplication', 'mult_facts', 10, '1_0', 'neutral', false],
        ['multiplication', 'mult_facts', 12, '12_', 'green', true],
        ['division', 'div_facts', 9, '9_', 'green', true],
    ];
    for (const [c, k, want, typed, live, check, leaves] of EDGE) {
        const got = await page.evaluate(async (c, k, want, typed) => {
            const st = window.state;
            window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, { ansBox: 'digit' }, { silent: true });
            st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; st.skillOptions = null;
            window.showView('gameView');
            let q = null;
            for (let t = 0; t < 400; t++) { q = window.generateQuestion(); if (Number(q.ans) === want) break; }
            if (Number(q.ans) !== want) return { skip: true };
            st.currentQ = q; window.renderQuestion();
            await new Promise((r) => setTimeout(r, 450));
            const b = Array.from(document.querySelectorAll('#visualAid input.mq-digit'));
            if (b.length < typed.length) return { skip: true, n: b.length };
            const fire = (e) => { e.dispatchEvent(new Event('input', { bubbles: true })); };
            const s00 = st.score;
            // the card's own auto-advance calls transitionToNextQuestion: record that it did
            window.__mqAdv = false;
            if (!window.__mqAdvWrapped) { const t0 = window.transitionToNextQuestion; window.transitionToNextQuestion = function () { window.__mqAdv = true; return t0.apply(this, arguments); }; window.__mqAdvWrapped = true; }
            [...typed].forEach((ch, i) => { b[i].focus(); b[i].value = ch === '_' ? '' : ch; fire(b[i]); });
            b.forEach((e) => e.blur());
            await new Promise((r) => setTimeout(r, 150));
            const marks = b.filter((e) => e.value).map((e) => e.classList.contains('mq-live-correct') ? 'green' : e.classList.contains('mq-live-wrong') ? 'red' : 'neutral');
            const lv = marks.every((m) => m === 'green') ? 'green' : marks.some((m) => m === 'red') ? 'red' : 'neutral';
            const after = b.map((e) => e.value || '_').join('');
            // a right answer auto-advances the card (r4 D4: "07" like a plain "7"); else Check, by the card's own checker
            await new Promise((r) => setTimeout(r, 1500));
            // advanced = the card judged it right by itself (no Check pressed): the score rose, or the card moved on
            const advanced = window.__mqAdv === true || st.score > s00;
            let verdict = advanced;
            if (!advanced) {
                document.querySelectorAll('.feedback-area').forEach((f) => f.classList.remove('correct', 'incorrect'));
                window.submitAnswer();
                await new Promise((r) => setTimeout(r, 300));
                verdict = st.score > s00 || !!document.querySelector('.feedback-area.correct');
            }
            return { lv, after, verdict, advanced, fb: Array.from(document.querySelectorAll('.feedback-area')).map((f) => f.className + '|' + f.textContent.slice(0, 40)).join(' ; '), ha: st.hasAnswered };
        }, c, k, want, typed);
        if (got.skip) { console.log(`skip ${k} ${want} '${typed}' (no such item / boxes ${got.n})`); continue; }
        const alignOk = typed.replace(/_/g, '').length === 1 && !/^_*0/.test(typed) ? got.after.replace(/_/g, '').length === 1 && got.after.endsWith(String(want)) : true;
        // a correct entry auto-advances, whatever its leading zeros (r4 D4); it leaves right-aligned as the key prints it
        const ok = got.lv === live && got.verdict === check && alignOk && (!check || got.advanced) && (!leaves || got.after === leaves);
        n++; if (!ok) bad++;
        console.log(`${ok ? 'ok  ' : 'FAIL'} edge ${k} ans ${want} typed '${typed}' -> live ${got.lv} (want ${live}), Check ${got.verdict ? 'correct' : 'wrong'}${got.advanced ? ' (auto-advanced)' : ''} (want ${check ? 'correct' : 'wrong'}), boxes after leaving '${got.after}'${ok ? '' : ' ' + got.fb + ' ' + got.ha}`);
    }

    // ---- (critic B r4 D1) the QUIZ, through quizQuestionData + compressTestForURL: legacy skills keep the
    // option - digit draws the per-digit strip (and stores the typed value), off no black edge, one a box
    for (const [c, k] of [['division', 'divide'], ['subtraction', 'sub_facts'], ['multiplication', 'multiply']]) {
        for (const ab of ['digit', 'off', 'one']) {
            for (let it = 0; it < 2; it++) {
                await page.evaluate((c, k, ab, it) => {
                    window.clearSetOptions({ silent: true });
                    const q = window.generateQuestionFor({ category: c, skill: k, seed: 900 + it * 7, itemIndex: it, opts: { ansBox: ab } });
                    const test = { id: null, name: 'Boxes', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
                        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                    window.handleQuizURL(window.compressTestForURL(test));
                    const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                    window.startQuizTest();
                }, c, k, ab, it);
                await sleep(600);
                const r = await page.evaluate(async () => {
                    const st = window.state;
                    const qd = st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
                    const cell = document.querySelector('#quizTakeView .qt-cell');
                    const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
                    const ins = Array.from(cell.querySelectorAll('input')).filter((e) => e.type !== 'hidden' && vis(e) && !e.classList.contains('mq-carry'));
                    const strip = cell.querySelector('.ws-stack');
                    const digits = strip ? Array.from(strip.querySelectorAll('input.mq-digit, input.mq-qt-digit')) : [];
                    const black = (e) => { const cs = getComputedStyle(e); const sides = ['Top', 'Bottom', 'Left', 'Right'].filter((k) => parseFloat(cs[`border${k}Width`]) > 0 && /rgb\(0, 0, 0\)/.test(cs[`border${k}Color`]) && cs[`border${k}Style`] !== 'none').length;
                        const sh = /rgb\(0, 0, 0\)/.test(cs.boxShadow || ''); return sides >= 2 || sh; };
                    let stored = null;
                    if (digits.length) {
                        const a = String(qd.ans).replace(/[^0-9]/g, '');
                        const pad = digits.length - a.length;
                        digits.forEach((e, i) => { e.value = i >= pad ? a[i - pad] : ''; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
                        await new Promise((res) => setTimeout(res, 150));
                        const h = document.getElementById('qtAnswerInput'); stored = h ? h.value : null;
                    }
                    return { ans: String(qd.ans), ansBox: qd.ansBox, n: ins.length, digits: digits.length, ltr: !!(strip && strip.hasAttribute('data-mq-ltr')), black: ins.map(black), stored };
                });
                let ok;
                if (ab === 'digit') ok = r.digits >= r.ans.length && r.digits >= 2 && String(r.stored).replace(/^0+(?=\d)/, '') === r.ans;
                else if (ab === 'off') ok = r.n >= 1 && r.black.every((b) => !b) && r.digits <= 1;
                else ok = r.n === 1 && r.black[0] === true;
                n++; if (!ok) bad++;
                console.log(`${ok ? 'ok  ' : 'FAIL'} quiz ${k} ${ab} ans ${r.ans}: carried ansBox=${r.ansBox}, ${r.n} input(s), strip ${r.digits}${r.ltr ? ' (LTR)' : ''}, black edges [${r.black.join(',')}]${r.stored != null ? `, stored '${r.stored}'` : ''}`);
                await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
            }
        }
    }

    await app.close();
    console.log(`\n${n} items, ${bad} not all green`);
    console.log(bad ? 'wave1-b-ansbox-entry: FAIL' : 'wave1-b-ansbox-entry: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
