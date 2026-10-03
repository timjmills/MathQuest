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
        ['addition', 'add_facts', 7, '07', 'green', true],
        ['addition', 'add_facts', 0, '00', 'green', true],
        ['multiplication', 'mult_facts', 7, '_07', 'green', true],
        ['multiplication', 'mult_facts', 12, '1_2', 'neutral', false],
        ['multiplication', 'mult_facts', 10, '1_0', 'neutral', false],
        ['multiplication', 'mult_facts', 12, '12_', 'green', true],
        ['division', 'div_facts', 9, '9_', 'green', true],
    ];
    for (const [c, k, want, typed, live, check] of EDGE) {
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
            [...typed].forEach((ch, i) => { b[i].focus(); b[i].value = ch === '_' ? '' : ch; fire(b[i]); });
            b.forEach((e) => e.blur());
            await new Promise((r) => setTimeout(r, 300));
            const marks = b.filter((e) => e.value).map((e) => e.classList.contains('mq-live-correct') ? 'green' : e.classList.contains('mq-live-wrong') ? 'red' : 'neutral');
            const lv = marks.every((m) => m === 'green') ? 'green' : marks.some((m) => m === 'red') ? 'red' : 'neutral';
            const after = b.map((e) => e.value || '_').join('');
            // Check: the card's submit, by its own checker
            const s0 = st.score;
            document.querySelectorAll('.feedback-area').forEach((f) => f.classList.remove('correct', 'incorrect'));
            window.submitAnswer();
            await new Promise((r) => setTimeout(r, 300));
            const verdict = st.score > s0 || !!document.querySelector('.feedback-area.correct');
            return { lv, after, verdict, fb: Array.from(document.querySelectorAll('.feedback-area')).map((f) => f.className + '|' + f.textContent.slice(0, 40)).join(' ; '), ha: st.hasAnswered };
        }, c, k, want, typed);
        if (got.skip) { console.log(`skip ${k} ${want} '${typed}' (no such item / boxes ${got.n})`); continue; }
        const alignOk = typed.replace(/_/g, '').length === 1 && !/^_*0/.test(typed) ? got.after.replace(/_/g, '').length === 1 && got.after.endsWith(String(want)) : true;
        const ok = got.lv === live && got.verdict === check && alignOk;
        n++; if (!ok) bad++;
        console.log(`${ok ? 'ok  ' : 'FAIL'} edge ${k} ans ${want} typed '${typed}' -> live ${got.lv} (want ${live}), Check ${got.verdict ? 'correct' : 'wrong'} (want ${check ? 'correct' : 'wrong'}), boxes after leaving '${got.after}'${ok ? '' : ' ' + got.fb + ' ' + got.ha}`);
    }

    await app.close();
    console.log(`\n${n} items, ${bad} not all green`);
    console.log(bad ? 'wave1-b-ansbox-entry: FAIL' : 'wave1-b-ansbox-entry: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
