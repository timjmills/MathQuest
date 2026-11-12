// ws-vocab-answered — the render harness of the picture vocabulary screen feedback (lane lf-vocab r8, critic r6 evidence gaps:
// the answered-wrong shot was cut off at 900 px, and the quiz had no answered render). For each skill it renders the item
// answered RIGHT and WRONG, FULL PAGE, on the practice card at 390 px, the online worksheet at 1280 px (item 1 wrong / right,
// item 2 right, item 3 left empty, then Check all) and the quiz at 1280 px (instant feedback), into <out>/<skill>/.
//
//   node tests/scripts/ws-vocab-answered.cjs --out <dir> [--skills vocab_grade_pictures,vocab_pick3_words]
//
// Needs the lf-vocab manifest applied (node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab). Prints one line per shot
// and `ws-vocab-answered: OK (n shots)` / `FAIL`.
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', 'answered'));
const SK = arg('skills', 'vocab_grade_pictures,vocab_pick3_words').split(',').map((s) => s.trim()).filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// (in the page) answer one item right or wrong the way a pupil does: tap a bank word, or write the letters (wrong: the first two
// rows swapped)
function ANSWER(a) {
    const st = window.state;
    const q = a.host === 'card' ? st.currentQ : a.host === 'quiz' ? st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData : st.worksheetQs[a.i];
    const root = document.querySelector(a.sel);
    const p = q.cell.payload;
    if (q.cell.template === 'vocab-pick3') {
        const w = a.right ? p.word : p.bank.find((x) => x !== p.word);
        const b = root.querySelector(`button[data-mq-choice="${w}"]`);
        if (b) b.click();
        return w;
    }
    const L = ['A', 'B', 'C'];
    const vals = p.order.map((wi) => L[wi]);
    if (!a.right) { const t = vals[0]; vals[0] = vals[1]; vals[1] = t; }
    [...root.querySelectorAll('.mq-vm-box input')].forEach((el, n) => { el.value = vals[n]; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    return vals.join(', ');
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });
    const { page } = app;
    let shots = 0; const fails = [];
    const fresh = async () => {
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate(() => { window.speak = () => {}; });
    };
    const shoot = async (file) => {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        await page.evaluate(() => { Array.from(document.body.children).filter((e) => getComputedStyle(e).position === 'fixed' && Number(getComputedStyle(e).zIndex) >= 9000).forEach((e) => e.remove()); });
        await page.screenshot({ path: file, fullPage: true });
        shots++; console.log(`shot ${path.relative(process.cwd(), file)}`);
    };
    try {
        for (const k of SK) {
            const dir = path.join(OUT, k);
            for (const right of [false, true]) {
                const tag = right ? 'right' : 'wrong';
                // card-390
                await fresh();
                await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
                await page.evaluate((k) => {
                    const st = window.state; st.ttsEnabled = false; st.quizMode = false; st.category = 'vocabulary'; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                    window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: 'vocabulary', skill: k, seed: 7 }); window.renderQuestion();
                }, k);
                await sleep(500);
                await page.evaluate(ANSWER, { host: 'card', sel: '#questionCard', right });
                await sleep(200);
                await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b && !window.state.hasAnswered) b.click(); });
                await sleep(500);
                await shoot(path.join(dir, `answered-${tag}-card-390.png`));
                // worksheet-1280
                await fresh();
                await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
                await page.evaluate((k) => { const st = window.state; st.ttsEnabled = false; st.category = 'vocabulary'; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3; window.initWorksheet(); }, k);
                await sleep(900);
                await page.evaluate(ANSWER, { host: 'worksheet', sel: '#ws_card_0', i: 0, right });
                await page.evaluate(ANSWER, { host: 'worksheet', sel: '#ws_card_1', i: 1, right: true });
                await sleep(200);
                await page.evaluate(() => { try { window.checkWorksheetAnswer(0); } catch (e) { /* optional */ } });
                await sleep(300);
                await page.evaluate(() => window.checkAllWorksheet());
                await sleep(500);
                await shoot(path.join(dir, `answered-${tag}-worksheet-1280.png`));
                // quiz-1280, instant feedback
                await fresh();
                await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
                await page.evaluate((k) => {
                    const q = window.generateQuestionFor({ category: 'vocabulary', skill: k, seed: 7 });
                    const test = { id: null, name: 'Vocabulary', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
                        settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                    window.handleQuizURL(window.compressTestForURL(test));
                    const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                    window.startQuizTest();
                }, k);
                await sleep(800);
                const val = await page.evaluate(ANSWER, { host: 'quiz', sel: '#quizTakeView', right });
                await sleep(300);
                // (the quiz records the cell's answer on its box's change; a pick3 tap is recorded on Next - pre-existing - so
                // the harness hands the answer over as the box's change does)
                await page.evaluate((v) => { const st = window.state; window.submitQuizTextAnswer(st.quizOrder[st.quizQuestionIndex], v); }, val);
                await sleep(600);
                const shown = await page.evaluate(() => !!document.querySelector('#quizTakeView .mq-vfb'));
                if (!shown) fails.push(`${k} quiz ${tag}: no feedback shown`);
                await shoot(path.join(dir, `answered-${tag}-quiz-1280.png`));
            }
        }
    } finally { await app.close(); }
    for (const f of fails) console.log(`  - ${f}`);
    console.log(`ws-vocab-answered: ${fails.length ? `FAIL (${fails.length})` : `OK (${shots} shots)`}`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-vocab-answered: FAIL'); process.exit(1); });
