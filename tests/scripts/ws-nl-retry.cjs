// Owner bug 2026-11-15: "on the number line if a student gets it wrong they cannot move it afterwards".
// The practice card's drag-a-marker number line (answerType number-line-extended, e.g.
// number_sense:place_on_number_line) locked its marker for good after a WRONG Submit. Here a pupil
// puts the marker in the wrong place, submits, then moves it: the marker must move, its red mark must
// clear, Submit must work again, and a CORRECT second Submit must lock the marker.
//   node tests/scripts/ws-nl-retry.cjs      -> ws-nl-retry: OK | FAIL
const { open, renderScreen } = require('../lib/ws-harness.cjs');
const SKILLS = [{ categoryId: 'number_sense', skillId: 'place_on_number_line' }];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
    const { page, close } = await open({ seed: 7 });
    const fails = [];
    for (const sk of SKILLS) {
        const id = `${sk.categoryId}:${sk.skillId}`;
        try {
            await renderScreen(page, sk);
            await page.waitForSelector('#questionCard .nle-host svg', { timeout: 10000 });
            const q = await page.evaluate(() => { const q = window.state.currentQ; return { at: q.answerType, ans: q.ans }; });
            if (q.at !== 'number-line-extended' || typeof q.ans !== 'number') { fails.push(`${id}: not a single-marker number-line-extended item (${q.at})`); continue; }
            const svgBox = async () => (await page.$('#questionCard .nle-host svg')).boundingBox();
            const marker = () => page.evaluate(() => { const c = document.querySelector('#questionCard .nle-marker'); return c ? { v: Number(c.getAttribute('aria-valuenow')), wrong: c.classList.contains('wrong-flash') } : null; });
            const clickAt = async (fx) => { const b = await svgBox(); await page.mouse.click(b.x + b.width * fx, b.y + b.height * 0.5); await sleep(150); return marker(); };
            // map the line: two clicks give value = a + k * fraction
            const m1 = await clickAt(0.3), m2 = await clickAt(0.7);
            const k = (m2.v - m1.v) / 0.4, a = m1.v - k * 0.3;
            const fAns = (q.ans - a) / k;
            const fWrong = fAns > 0.5 ? 0.15 : 0.85;
            const w = await clickAt(fWrong);
            const submit = () => page.evaluate(() => { document.querySelector('#questionCard .nle-submit').click(); });
            await submit(); await sleep(300);
            const afterWrong = await marker();
            const fb1 = await page.evaluate(() => document.getElementById('feedbackArea').className);
            const moved = await clickAt(fAns);
            const subDisabled = await page.evaluate(() => document.querySelector('#questionCard .nle-submit').disabled);
            await submit(); await sleep(300);
            const fb2 = await page.evaluate(() => document.getElementById('feedbackArea').className);
            const tryMove = await clickAt(fWrong);
            const ok = w.v !== q.ans && /incorrect/.test(fb1) && afterWrong.wrong
                && moved.v === q.ans && !moved.wrong && !subDisabled
                && /\bcorrect\b/.test(fb2) && !/incorrect/.test(fb2) && tryMove.v === q.ans;
            console.log(`${id}: ans=${q.ans} wrong at ${w.v} -> ${fb1} | moved to ${moved.v} red=${moved.wrong} submit-disabled=${subDisabled} | recheck ${fb2} | after correct a tap leaves it at ${tryMove.v} ${ok ? 'PASS' : 'FAIL'}`);
            if (!ok) fails.push(id);
        } catch (e) { fails.push(`${id}: ${e.message}`); console.log(`${id}: ERROR ${e.message}`); }
    }
    await close();
    console.log(fails.length ? `ws-nl-retry: FAIL (${fails.join('; ')})` : 'ws-nl-retry: OK');
    process.exit(fails.length ? 1 : 0);
})();
