// ws-twin-fit-reset — TWIN-FIT-RESET (lf-algebra for lf-hosts, lead 2026-11-20): screen-cell.js fitTwinRows fits a kit twin to its
// cell by lowering --mq-k2, once per (cell width, element count) key. It only ever lowered it, so a fit run while the two-up
// worksheet grid was still settling (a briefly narrower cell) kept the smaller drawing for good: number_patterns_rule cards 2-5 at
// 1024 printed 22.9 px digits where the drawing fits at 26.5 px (ws-worksheet-reflow WS-DIGIT). This check takes a fitted twin on the
// worksheet, narrows its cell and fits it, restores the cell and fits it again: the twin must come back to the --mq-k2 it had before.
// (lf-hosts 2026-11-20: the probe skill is composing:ten_frame_build - number_patterns_rule draws the count-row twin since cbt, which
// no longer shrinks, so a 200 px cell shrank nothing and the probe exercised no fit; the ten frame still shrinks there)
//
//   node tests/scripts/ws-twin-fit-reset.cjs [--skill cat:skill] [--width 1024]
//   MQ_ROOT=<tree> judges another checkout (ws-backtest commit-pair rows).
// Last line `ws-twin-fit-reset: OK (...)` / `FAIL - ...`; exit 1 on FAIL, 2 on error.
'use strict';
const TOOL = 'ws-twin-fit-reset';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
(async () => {
    const H = require((process.env.MQ_ROOT || require('path').resolve(__dirname, '..', '..')) + '/tests/lib/ws-harness.cjs');
    const [cat, sk] = String(arg('skill', 'composing:ten_frame_build')).split(':');
    const W = Number(arg('width', 1024));
    let app;
    try {
        app = await H.open({});
        const { page } = app;
        page.on('dialog', (d) => d.accept().catch(() => {}));
        await page.setViewport({ width: W, height: 900, deviceScaleFactor: 1 });
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate((c, k) => { if (window.__wsReseed) window.__wsReseed(11); if (window.setUserRole) window.setUserRole('student', { persist: false }); const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); }, cat, sk);
        await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => new Promise((r) => setTimeout(r, 1200)));
        const r = await page.evaluate(async () => {
            const sc = await import(new URL('js/modules/screen-cell.js', location.href).href);
            const twins = [...document.querySelectorAll('#worksheetGrid .k2-twin')];
            if (!twins.length) return { err: 'no kit twin on the worksheet' };
            const k2 = (t) => parseFloat(getComputedStyle(t).getPropertyValue('--mq-k2')) || 0;
            const out = [];
            for (const [i, t] of twins.entries()) {
                const cell = t.closest('.mq-scell, .ws-cell, #visualAid') || t.parentElement;
                const before = k2(t);
                cell.style.width = '200px'; cell.style.maxWidth = '200px';
                sc.fitTwinRows(cell);
                const narrow = k2(t);
                cell.style.width = ''; cell.style.maxWidth = '';
                sc.fitTwinRows(cell);
                const after = k2(t);
                out.push({ i, before, narrow, after });
            }
            return { out };
        });
        if (r.err) { console.log(`${TOOL}: FAIL - error ${r.err}`); process.exitCode = 2; return; }
        const bad = r.out.filter((x) => x.after < x.before - 0.01);
        const shrank = r.out.filter((x) => x.narrow < x.before - 0.01).length;
        for (const x of r.out) console.log(`  twin ${x.i + 1}: --mq-k2 ${x.before.toFixed(2)} -> narrow ${x.narrow.toFixed(2)} -> restored ${x.after.toFixed(2)}`);
        if (!shrank) { console.log(`${TOOL}: FAIL - the narrow cell shrank no twin (the probe did not exercise the fit)`); process.exitCode = 1; return; }
        if (bad.length) { console.log(`${TOOL}: FAIL - ${bad.length} of ${r.out.length} twin(s) stayed shrunk after their cell widened again (TWIN-FIT-RESET, ${cat}:${sk} @${W})`); process.exitCode = 1; }
        else console.log(`${TOOL}: OK (${r.out.length} twin(s) narrowed and restored to their own --mq-k2, ${cat}:${sk} @${W})`);
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.message || e).split('\n')[0]}`); process.exitCode = 2; }
    finally { if (app) await app.close(); }
})();
