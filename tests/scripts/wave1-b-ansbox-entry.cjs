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
    await app.close();
    console.log(`\n${n} items, ${bad} not all green`);
    console.log(bad ? 'wave1-b-ansbox-entry: FAIL' : 'wave1-b-ansbox-entry: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
