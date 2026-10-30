// Wave 1 lane B: shoot a GREEN (right) and a RED (wrong) answer box on the practice card, so the box
// rule is seen to leave Lane A2's per-box marks in charge. Writes PNGs to the folder given (default
// design/audit/runs/wave1-B/final/live).
//   node tests/scripts/wave1-b-livebox-shot.cjs [outDir]
const path = require('path');
const fs = require('fs');
const { open, ROOT } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'design/audit/runs/wave1-B/final/live'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    const report = [];
    for (const [c, k, opts] of [['addition', 'add_100_regroup', {}], ['division', 'div_facts', {}], ['addition', 'add_facts', { ansBox: 'digit' }]]) {
        const ans = await page.evaluate(async (c, k, opts) => {
            const st = window.state;
            window.clearSetOptions({ silent: true });
            if (Object.keys(opts).length) window.setSetOptions(c, k, opts, { silent: true });
            st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; st.skillOptions = null;
            window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
            await new Promise((r) => setTimeout(r, 500));
            return String(st.currentQ.ans);
        }, c, k, opts);
        const digits = await page.$$('#visualAid input.mq-digit');
        if (digits.length >= 2) {
            // the ones box right, the tens box wrong
            const d = ans.padStart(digits.length, ' ');
            await digits[digits.length - 1].click(); await page.keyboard.type(d[d.length - 1]); await sleep(150);
            await digits[digits.length - 2].click(); await page.keyboard.type(String((Number(d[d.length - 2]) + 1) % 10)); await sleep(400);
        } else {
            const inp = await page.$('#answerInput');
            await inp.click(); await page.keyboard.type(String(Number(ans) + 1)); await sleep(600);
        }
        const st = await page.evaluate(() => [...document.querySelectorAll('#visualAid input, #answerInput')].filter((e) => e.getBoundingClientRect().width).map((e) => {
            const cs = getComputedStyle(e);
            return { ok: e.classList.contains('mq-live-correct'), bad: e.classList.contains('mq-live-wrong'), border: `${cs.borderTopStyle} ${cs.borderTopColor}`, bg: cs.backgroundColor };
        }));
        report.push({ skill: k, opts, boxes: st });
        const card = await page.$('#questionCard');
        await card.screenshot({ path: path.join(OUT, `${k}${opts.ansBox ? '-' + opts.ansBox : ''}-live-1280.png`) });
    }
    await app.close();
    console.log(JSON.stringify(report, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
