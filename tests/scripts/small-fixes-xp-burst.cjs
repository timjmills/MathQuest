// small-fixes-xp-burst: the "+N XP" burst must never be drawn over the question.
// Answers a question right in practice, boss and race at the two Chromebook
// viewports (1366x650, 1280x600) and samples the .mq-xp-burst rect for its whole
// life, asserting it never intersects #questionCard (the question/answer content
// and the card around it) and stays on screen.
//
// Run: node tests/scripts/small-fixes-xp-burst.cjs   (SHOT_DIR=<dir> saves a mid-burst screenshot)
const { open } = require('../lib/ws-harness.cjs');

const VIEWPORTS = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }];
const MODES = ['practice', 'boss', 'race'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];

(async () => {
    for (const vp of VIEWPORTS) {
        const { page, close, problems } = await open({ viewport: { ...vp, deviceScaleFactor: 1 } });
        page.on('dialog', (d) => d.accept().catch(() => {}));   // exitGame() may confirm()
        try {
            for (const mode of MODES) {
                await page.evaluate((mode) => {
                    window.state.quizMode = false;
                    window.skillQueue.length = 0;
                    window.skillQueue.push({ categoryId: 'addition', skillId: 'add_facts', skillLabel: 'Addition Facts' });
                    window.playSelectedSkills(mode);
                }, mode);
                await sleep(1200);
                const answered = await page.evaluate(() => {
                    const q = window.state.currentQ;
                    const inp = document.getElementById('answerInput');
                    if (!q || !inp || inp.offsetParent === null) {
                        const box = document.querySelector('#questionCard input:not([type=hidden])');
                        if (!box) return 'no input';
                        box.value = String(q.ans);
                        box.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        inp.value = String(q.ans);
                    }
                    window.submitAnswer();
                    return 'ok';
                });
                const samples = [];
                let shot = false;
                for (let t = 0; t < 1700; t += 100) {
                    const s = await page.evaluate(() => {
                        const b = document.querySelector('.mq-xp-burst');
                        if (!b) return null;
                        const r = b.getBoundingClientRect();
                        const c = document.getElementById('questionCard').getBoundingClientRect();
                        const hit = r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top;
                        const onScreen = r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
                        return { r: [r.left, r.top, r.right, r.bottom].map(Math.round), c: [c.left, c.top, c.right, c.bottom].map(Math.round), hit, onScreen };
                    });
                    if (s) {
                        samples.push(s);
                        if (!shot && t >= 300 && process.env.SHOT_DIR) {
                            await page.screenshot({ path: `${process.env.SHOT_DIR}/xp-${mode}-${vp.width}x${vp.height}.png` });
                            shot = true;
                        }
                    }
                    await sleep(100);
                }
                const tag = `${mode} ${vp.width}x${vp.height}`;
                if (answered !== 'ok') failures.push(`${tag}: could not answer (${answered})`);
                else if (!samples.length) failures.push(`${tag}: no XP burst appeared after a correct answer`);
                else {
                    const bad = samples.filter((s) => s.hit);
                    const off = samples.filter((s) => !s.onScreen);
                    if (bad.length) failures.push(`${tag}: burst over #questionCard ${JSON.stringify(bad[0])}`);
                    if (off.length) failures.push(`${tag}: burst off screen ${JSON.stringify(off[0])}`);
                    console.log(`${bad.length || off.length ? 'FAIL' : 'ok  '} ${tag}: ${samples.length} samples, burst ${JSON.stringify(samples[0].r)} card ${JSON.stringify(samples[0].c)}`);
                }
                await page.evaluate(() => { try { window.exitGame(); } catch (e) {} });
                await sleep(300);
            }
            for (const p of problems) failures.push(`${vp.width}x${vp.height} ${p.type}: ${p.text}`);
        } finally { await close(); }
    }
    if (failures.length) { failures.forEach((f) => console.error('  x', f)); console.log('small-fixes-xp-burst: FAIL'); process.exit(1); }
    console.log('small-fixes-xp-burst: OK');
})().catch((e) => { console.error(e); console.log('small-fixes-xp-burst: FAIL'); process.exit(1); });
