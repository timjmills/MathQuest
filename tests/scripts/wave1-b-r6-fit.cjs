// Wave 1 lane B, critic r5 D3 and D6, on screen.
//   D3: add_three at ansBox 'digit' - every digit box lies inside its frame and is hit at its centre,
//       on the card, the online worksheet and the quiz, at 390 / 820 / 1280, for 4 seeds.
//   D6: missing_add_sub / missing_mult_div at 'digit' - a blank BEFORE "=" is the same digit strip as
//       one after it (one slot shape per section), and its right answer, typed, scores on the card.
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-b-r6-fit.cjs
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(__dirname, '..', '..', 'design', 'audit', 'runs', 'wave1-B', 'r6');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0, bad = 0;
const ok = (good, msg) => { n++; if (!good) bad++; console.log(`${good ? 'ok  ' : 'FAIL'} ${msg}`); };

async function quizWith(page, q, k) {
    await page.evaluate((q, k) => {
        const test = { id: null, name: 'Fit', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
    }, q, k);
    await sleep(700);
}

// every strip box: inside its frame (paper / cell / card), on screen, and the topmost element at its centre
const boxesFit = (page, frameSel) => page.evaluate((frameSel) => {
    const strip = Array.from(document.querySelectorAll('[data-mq-ltr]')).find((s) => s.getBoundingClientRect().width > 0);
    if (!strip) return { none: true };
    const frame = strip.closest(frameSel) || strip.parentElement;
    const f = frame.getBoundingClientRect();
    const boxes = Array.from(strip.querySelectorAll('input')).filter((e) => e.getBoundingClientRect().width > 0);
    return { none: false, n: boxes.length, vw: innerWidth, sw: document.documentElement.scrollWidth, list: boxes.map((e) => {
        const b = e.getBoundingClientRect();
        const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return { over: Math.round(Math.max(b.right - f.right, f.left - b.left)), hit: top === e, w: Math.round(b.width) };
    }) };
}, frameSel);

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    for (const w of [390, 820, 1280]) {
        await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
        for (const seed of [3, 7, 11, 19]) {
            const q = await page.evaluate((seed) => window.generateQuestionFor({ category: 'addition', skill: 'add_three', seed, itemIndex: 0, opts: { ansBox: 'digit' } }), seed);
            // card
            await page.evaluate((q) => {
                const st = window.state; window.clearSetOptions({ silent: true }); window.setSetOptions('addition', 'add_three', { ansBox: 'digit' }, { silent: true });
                st.quizMode = false; st.category = 'addition'; st.skill = 'add_three'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                window.showView('gameView'); st.currentQ = q; window.renderQuestion();
            }, q);
            await sleep(600);
            await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
            let r = await boxesFit(page, '.mq-scell, #questionPaper, #questionCard');
            ok(!r.none && r.list.every((x) => x.over <= 0 && x.hit) && r.sw <= r.vw, `card add_three digit ${w} seed ${seed}: ${r.none ? 'no strip' : r.list.map((x) => `over ${x.over} hit ${x.hit ? 'yes' : 'NO'}`).join(' | ')} scroll ${r.sw}/${r.vw}`);
            if (seed === 7) { const el = await page.$('#questionCard'); if (el) await el.screenshot({ path: path.join(OUT, `card-add_three-digit-${w}.png`) }); }
            // quiz
            await quizWith(page, q, 'add_three');
            r = await boxesFit(page, '.qt-cell, .qt-question-card');
            ok(!r.none && r.list.every((x) => x.over <= 0 && x.hit) && r.sw <= r.vw, `quiz add_three digit ${w} seed ${seed}: ${r.none ? 'no strip' : r.list.map((x) => `over ${x.over} hit ${x.hit ? 'yes' : 'NO'}`).join(' | ')} scroll ${r.sw}/${r.vw}`);
            if (seed === 7) { const el = await page.$('.qt-question-card'); if (el) await el.screenshot({ path: path.join(OUT, `quiz-add_three-digit-${w}.png`) }); }
            await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
        }
        // worksheet
        await page.evaluate(() => {
            const st = window.state; window.clearSetOptions({ silent: true }); window.setSetOptions('addition', 'add_three', { ansBox: 'digit' }, { silent: true });
            st.quizMode = false; st.category = 'addition'; st.skill = 'add_three'; st.gameMode = 'worksheet'; st.problemCount = 4; st.isMixedMode = false;
            window.initWorksheet();
        });
        await sleep(1500);
        const ws = await page.evaluate(() => Array.from(document.querySelectorAll('.problem-card')).map((card) => {
            const f = card.getBoundingClientRect();
            return Array.from(card.querySelectorAll('[data-mq-ltr] input')).map((e) => { const b = e.getBoundingClientRect(); return Math.round(Math.max(b.right - f.right, f.left - b.left)); });
        }));
        ok(ws.length > 0 && ws.every((c) => c.length >= 2 && c.every((o) => o <= 0)), `worksheet add_three digit ${w}: overs ${JSON.stringify(ws)}`);
    }

    // D6: a blank before "=" at 'digit' is a digit strip too, and its right answer scores
    await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 });
    for (const [c, k] of [['subtraction', 'missing_add_sub'], ['division', 'missing_mult_div']]) {
        const shapes = { strip: 0, other: 0 }; let scored = 0, tried = 0;
        for (let seed = 1; seed <= 24; seed++) {
            const info = await page.evaluate(async (c, k, seed) => {
                const st = window.state; window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, { ansBox: 'digit' }, { silent: true });
                const q = window.generateQuestionFor({ category: c, skill: k, seed, itemIndex: seed, opts: { ansBox: 'digit' } });
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                window.showView('gameView'); st.currentQ = q; window.renderQuestion();
                await new Promise((r) => setTimeout(r, 450));
                const d = document.getElementById('mqWorkedDismiss'); if (d) d.click();
                const strip = document.querySelector('#visualAid [data-mq-ltr]');
                const plain = document.getElementById('answerInputArea');
                const before = !/=\s*(\?|_+)\s*$/.test(String(q.text || ''));
                return { text: q.text, ans: String(q.ans), strip: !!strip, before, plainShown: !!(plain && plain.offsetParent), score: st.score };
            }, c, k, seed);
            if (info.strip && !info.plainShown) shapes.strip++; else shapes.other++;
            if (info.before && info.strip && tried < 3) {
                tried++;
                await page.focus('#visualAid [data-mq-ltr] input.mq-digit');
                for (const ch of info.ans) { await page.keyboard.type(ch); await sleep(40); }
                await sleep(900);
                const s2 = await page.evaluate(() => window.state.score);
                if (s2 === info.score + 1) scored++;
                await sleep(4000);                                   // let the card's own move to the next item finish
                if (tried === 1) { const el = await page.$('#questionCard'); if (el) await el.screenshot({ path: path.join(OUT, `card-${k}-blank-first-digit-390.png`) }); }
                console.log(`     ${k} '${info.text}' ans ${info.ans}: score ${info.score} -> ${s2}`);
            }
        }
        ok(shapes.other === 0, `card ${k} digit: every item draws the digit strip (${shapes.strip} strip, ${shapes.other} other)`);
        ok(tried > 0 && scored === tried, `card ${k} digit: a blank-first item typed right scores (${scored}/${tried})`);
    }
    await app.close();
    console.log(`\n${n} checks, ${bad} failed`);
    console.log(bad ? 'wave1-b-r6-fit: FAIL' : 'wave1-b-r6-fit: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
