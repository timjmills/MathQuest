// Small fixes, item 3: fractions:equivalent_fractions (the fractions "Simplify" item) answers in
// the drawing's own numerator / denominator boxes on the practice card, the online worksheet and
// the quiz. Types the RIGHT answer and a WRONG answer on each host at the Chromebook sizes
// 1366x650 and 1280x600 and checks each verdict; saves screenshots.
//
//   node tests/scripts/small-fixes-equiv-frac.cjs [--out <dir>] [--skill fractions:equivalent_fractions]
//
// Prints one line per host / viewport / answer, then `small-fixes-equiv-frac: OK` or `FAIL` (exit 1).
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = arg('out', path.join(require('os').tmpdir(), 'small-fixes-equiv-frac'));
const [C, K] = arg('skill', 'fractions:equivalent_fractions').split(':');
const VIEWPORTS = [[1366, 650], [1280, 600]];
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const wrongOf = (ans) => { const [n, d] = String(ans).split('/').map(Number); return `${n + 1}/${d}`; };

// type "n/d" into the two boxes inside `sel` (the first item's boxes)
async function typeFrac(page, sel, value) {
    const boxes = await page.$$(`${sel} input.mq-cellslot`);
    if (boxes.length !== 2) return `expected 2 boxes in the drawing, found ${boxes.length}`;
    const parts = value.split('/');
    for (let i = 0; i < 2; i++) {
        await boxes[i].evaluate(e => e.scrollIntoView({ block: 'center' }));
        await boxes[i].click({ clickCount: 3 });
        await boxes[i].evaluate(e => { e.value = ''; });
        await page.keyboard.type(parts[i], { delay: 10 });
        await boxes[i].evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));
    }
    return '';
}
const closePopups = (page) => page.evaluate(() => {
    Array.from(document.body.querySelectorAll('*')).filter(e => { const cs = getComputedStyle(e); return cs.position === 'fixed' && Number(cs.zIndex) >= 1000 && e.getBoundingClientRect().width > innerWidth * 0.6 && e.getBoundingClientRect().height > innerHeight * 0.6; }).forEach(e => { e.style.display = 'none'; });
});

(async () => {
    const app = await open({ seed: 7, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
    const { page } = app;
    const fails = [];
    const report = (host, vp, kind, ok, extra = '') => {
        const l = `${host.padEnd(9)} ${vp.padEnd(9)} ${kind.padEnd(5)} ${ok ? 'ok' : 'FAIL'} ${extra}`;
        console.log(l); if (!ok) fails.push(l);
    };
    for (const [w, h] of VIEWPORTS) {
        const vp = `${w}x${h}`;
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        for (const kind of ['right', 'wrong']) {
            // ---- practice card
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            const ans = await page.evaluate((c, k) => {
                const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
                return String(st.currentQ.ans);
            }, C, K);
            await sleep(500);
            const val = kind === 'right' ? ans : wrongOf(ans);
            const before = await page.evaluate(() => window.state.score || 0);
            let err = await typeFrac(page, '#questionPaper', val);
            if (!err) {
                await sleep(150);
                if (!(await page.evaluate(() => window.state.hasAnswered))) {
                    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn.mq-show') || document.querySelector('#answerInputArea .mq-inline-check'); if (b) b.click(); else window.submitAnswer(); });
                }
                await sleep(400);
                await page.screenshot({ path: path.join(OUT, `card-${vp}-${kind}.png`) });
                const s = await page.evaluate(() => ({ score: window.state.score || 0, answered: window.state.hasAnswered, wrongBox: !!document.querySelector('#questionPaper input.mq-cellslot.mq-wrong, #questionPaper .mq-wrong input.mq-cellslot, #questionPaper [class*="wrong"] input.mq-cellslot, #questionPaper input.mq-cellslot[class*="wrong"]'), tryAgain: /try again/i.test(document.getElementById('gameView').innerText) }));
                const ok = kind === 'right' ? s.score > before : (s.score === before && (s.wrongBox || s.tryAgain));
                report('card', vp, kind, ok, `(ans ${ans}, typed ${val}, score ${before}->${s.score}, answered ${s.answered}${kind === 'wrong' ? `, wrong mark ${s.wrongBox}, try again ${s.tryAgain}` : ''})`);
            } else report('card', vp, kind, false, err);
            await closePopups(page);

            // ---- online worksheet (3 items; the first is answered, the rest right)
            await page.evaluate((c, k) => {
                const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3;
                window.initWorksheet();
            }, C, K);
            await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1' && document.fonts.status === 'loaded'; }, { timeout: 30000 });
            await sleep(1200);
            const wsAns = await page.evaluate(() => window.state.worksheetQs.map(q => String(q.ans)));
            err = '';
            for (let i = 0; i < wsAns.length && !err; i++) {
                err = await typeFrac(page, `#ws_card_${i} .ws-cell`, i === 0 && kind === 'wrong' ? wrongOf(wsAns[0]) : wsAns[i]);
                await sleep(80);
            }
            if (!err) {
                await sleep(400);
                const res = await page.evaluate(() => { window.checkAllWorksheet(); return document.getElementById('worksheetResult').textContent.replace(/\s+/g, ' ').trim(); });
                const c0 = await page.evaluate(() => document.getElementById('ws_card_0').className);
                const c0Wrong = await page.evaluate(() => !!document.querySelector('#ws_card_0 [class*="wrong"], #ws_card_0 [class*="incorrect"]'));
                await page.evaluate(() => { Array.from(document.body.children).filter(e => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach(e => e.remove()); });
                await page.evaluate(() => document.getElementById('ws_card_0').scrollIntoView({ block: 'start' }));
                await sleep(200);
                await page.screenshot({ path: path.join(OUT, `worksheet-${vp}-${kind}.png`) });
                const m = res.match(/Score:\s*(\d+)\/(\d+)/);
                const want = kind === 'right' ? 3 : 2;
                const ok = !!m && +m[1] === want && +m[2] === 3 && (kind === 'right' ? !/incorrect|wrong/.test(c0) : /incorrect|wrong/.test(c0) || c0Wrong);
                report('worksheet', vp, kind, ok, `(${m ? m[0] : res}; card 1 marked wrong: ${/incorrect|wrong/.test(c0) || c0Wrong})`);
            } else report('worksheet', vp, kind, false, err);
            await page.evaluate(() => { Array.from(document.body.children).filter(e => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach(e => e.remove()); });

            // ---- quiz (one question)
            const qAns = await page.evaluate((c, k) => {
                const q = window.generateQuestionFor({ category: c, skill: k, seed: 4242, itemIndex: 0 });
                const test = { id: null, name: 'Probe', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
                return String(q.ans);
            }, C, K);
            await sleep(600);
            const qVal = kind === 'right' ? qAns : wrongOf(qAns);
            err = await typeFrac(page, '#quizTakeView .qt-cell', qVal);
            if (!err) {
                await page.keyboard.press('Tab');
                await sleep(250);
                await page.screenshot({ path: path.join(OUT, `quiz-${vp}-${kind}.png`) });
                await page.evaluate(async () => { await window.submitQuiz(); });
                await sleep(300);
                const r = await page.evaluate(() => { const r = window.state.currentQuizResult; return { score: r.score, total: r.totalPoints, a: (r.answers || []).map(a => a.studentAnswer) }; });
                const ok = r.total === 1 && r.a[0] === qVal && r.score === (kind === 'right' ? 1 : 0);
                report('quiz', vp, kind, ok, `(ans ${qAns}, recorded ${JSON.stringify(r.a)}, ${r.score}/${r.total})`);
            } else report('quiz', vp, kind, false, err);
            await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
        }
    }
    console.log(`screenshots: ${OUT}`);
    console.log(fails.length ? 'small-fixes-equiv-frac: FAIL' : 'small-fixes-equiv-frac: OK');
    try { await app.close(); } catch (e) { /* ignore */ }
    process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); console.log('small-fixes-equiv-frac: FAIL'); process.exit(1); });
