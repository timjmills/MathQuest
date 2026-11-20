// ws-hint-shots (lf-placevalue HINT-NO-BLANK, 2026-11-20): the practice card's help after three wrong answers, the hint
// popup and the Show Solution popup, for the critic - and a text / DOM dump of that help to compare two trees.
//
//   node tests/scripts/ws-hint-shots.cjs --skills cat:skill,.. [--seeds 3,7] [--widths 1280,820] [--shots <dir>] [--dump <file.json>]
// MQ_ROOT=<tree> serves another checkout (ws-harness), so the same dump is taken on master and on the lane.
// Prints `ws-hint-shots: OK` (it renders; it judges nothing).
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = String(arg('skills', '')).split(',').filter(Boolean);
const SEEDS = String(arg('seeds', '3')).split(',').map(Number);
const WIDTHS = String(arg('widths', '1280')).split(',').map(Number);
const SHOTS = arg('shots', '');
const DUMP = arg('dump', '');

async function render(page, key) {
    return page.evaluate(async (key) => {
        const [cat, skill] = key.split(':');
        const st = window.state;
        if (window.clearSetOptions) window.clearSetOptions({ silent: true });
        st.category = cat; st.skill = skill; st.range = cat === 'placevalue' ? 1000 : 100; st.decimalPlaces = 0;
        st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        if (window.showView) window.showView('gameView');
        const q = window.generateQuestion(); st.currentQ = q; window.renderQuestion();
        const sl = await import('/js/modules/support-ladder.js');
        for (let k = 1; k <= 3; k++) sl.practiceLadderWrong(q, `zz${k}`);
        const box = document.querySelector('#questionCard .mq-ladder-worked');
        return {
            key, text: String(q.text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), ans: q.ans,
            box: box ? box.outerHTML : null, boxText: box ? box.textContent.replace(/\s+/g, ' ').trim() : null,
            hint: q.hint || null, say: sl.sayFor(q, { cat, skill }), steps: sl.workedStepsFor(q, { cat, skill }),
        };
    }, key);
}

async function clipShot(page, sel, file) {
    const el = await page.$(sel);
    if (!el) return false;
    await el.screenshot({ path: file }).catch(() => {});
    return true;
}

(async () => {
    const dump = [];
    for (const w of WIDTHS) {
        for (const key of SKILLS) {
            for (const seed of SEEDS) {
                const { page, close } = await open({ seed, viewport: { width: w, height: 1000, deviceScaleFactor: 1 } });
                try {
                    const r = await render(page, key);
                    await new Promise((res) => setTimeout(res, 200));
                    if (w === WIDTHS[0]) dump.push(Object.assign({ seed }, r));
                    if (SHOTS) {
                        fs.mkdirSync(SHOTS, { recursive: true });
                        const base = path.join(SHOTS, `${key.replace(':', '_')}-${w}-s${seed}`);
                        await clipShot(page, '#questionCard', `${base}-card.png`);
                        await page.evaluate(() => window.showHint && window.showHint());
                        await new Promise((res) => setTimeout(res, 150));
                        await page.screenshot({ path: `${base}-hint.png` });
                        await page.evaluate(() => { if (window.closeHintPopup) window.closeHintPopup(); if (window.showSolutionPopup) window.showSolutionPopup(); });
                        await new Promise((res) => setTimeout(res, 150));
                        await clipShot(page, '#solutionModal > div', `${base}-solution.png`);
                    }
                    console.log(`  ${key} @${w} seed ${seed}: box ${r.box ? 'shown' : 'hidden'}; Say "${r.say}"`);
                } finally { await close(); }
            }
        }
    }
    if (DUMP) fs.writeFileSync(DUMP, JSON.stringify(dump, null, 1));
    console.log('ws-hint-shots: OK');
})();
