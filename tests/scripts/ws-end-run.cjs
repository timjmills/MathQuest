#!/usr/bin/env node
// ws-end-run — a practice-card run ENDS EXACTLY ONCE (lane lf-hosts, skip critic r2 F3/F4, lead-routed 2026-11-20).
//
// Rules, judged at 1280 with REAL input (typing into the answer box + Enter, no Skip):
//   END-ONCE  a fixed-length practice run (5 problems) of mult_facts and of sub_word_problems, every item typed right and
//             entered: exactly 1 end modal, exactly 1 session-history row, and the row's score = correct/total (5/5).
//             (F3: the card checks the answer live while the pupil types AND Enter submits, so several advance / finish
//             paths fired: 3 end modals and 3 rows reading "4/4, 4/3, 4/3".)
//   END-INF   infinite practice: 3 items answered, the 4th on screen, Finish: the row counts 3 (score = 3/3), not the
//             unanswered 4th (F4: "2/4").
//
//   node tests/scripts/ws-end-run.cjs [--rules END-ONCE,END-INF] [--root <checkout>]   (MQ_ROOT works too)
// Prints `ws-end-run: OK (n checks)` / `ws-end-run: FAIL (n)`; exit 1 on FAIL.
'use strict';
const path = require('path');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
if (arg('root')) process.env.MQ_ROOT = path.resolve(arg('root'));
const { open, waitFor } = require('../lib/ws-harness.cjs');
const TOOL = 'ws-end-run';
const RULES = new Set(arg('rules', 'END-ONCE,END-INF').split(','));
const W = 1280;
const findings = [];
let checks = 0;
const judge = (rule, what, ok, msg) => { if (!RULES.has(rule)) return; checks++; if (!ok) findings.push(`${rule} ${what}: ${msg}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitArg(page, fn, a, timeout, label) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) { try { if (await page.evaluate(fn, a)) return true; } catch (e) { /* busy */ } await sleep(100); }
    throw new Error(`Timeout waiting for ${label}`);
}
const endModals = (page) => page.evaluate(() => [...document.querySelectorAll('body > div')].filter((d) => /z-index: ?9999/.test(d.getAttribute('style') || '') && /Completed|Needed|Time's up|Nice work|Good try|Score:/i.test(d.textContent)).length);
async function typeEnter(page, v) {
    await page.evaluate(() => { const i = document.getElementById('answerInput'); i.disabled = false; i.value = ''; i.focus(); });
    await page.type('#answerInput', String(v), { delay: 30 });
    await page.keyboard.press('Enter');
}
async function start(page, skill, cat, n, infinite) {
    await page.evaluate((skill, cat, n, infinite) => {
        const st = window.state;
        window.skillQueue = [];
        st.mixedModeSettings = { selectedSkills: { [cat]: [skill] }, name: 'ws-end-run', range: 100, decimalPlaces: 0,
            timeChoice: 'teacher', timer: 0, totalProblemsEnabled: !infinite, totalProblems: infinite ? 0 : n };
        st.category = 'all_mixed'; st.skill = 'custom_mixed'; st.isMixedMode = true; st.gameMode = 'practice';
        st.infinityMode = !!infinite; st.quizMode = false; st.mapMode = false;
        st.sessionHistory = [];
        window.startGame();
    }, skill, cat, n, infinite);
}
const waitQ = (page, n) => waitArg(page, (n) => window.state.qCount === n && !window.state.hasAnswered && !!window.state.currentQ
    && !!document.getElementById('answerInput'), n, 20000, `Q${n}`);

async function runOnce(page, cat, skill) {
    const N = 5;
    await start(page, skill, cat, N, false);
    for (let k = 1; k <= N; k++) {
        await waitQ(page, k);
        await typeEnter(page, await page.evaluate(() => String(window.state.currentQ.ans)));
    }
    // let every live-check / Enter / auto-advance timer run out before reading the end
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 20000, 'end row').catch(() => {});
    await sleep(4000);
    const r = await page.evaluate(() => ({ rows: (window.state.sessionHistory || []).map((h) => h.score) }));
    const m = await endModals(page);
    judge('END-ONCE', skill, m === 1, `${m} end modals (want 1)`);
    judge('END-ONCE', skill, r.rows.length === 1, `${r.rows.length} session rows (${r.rows.join(', ')}; want 1)`);
    judge('END-ONCE', skill, r.rows[0] === `${N}/${N}`, `row score "${r.rows[0]}" (want ${N}/${N})`);
}
async function runInf(page) {
    await start(page, 'mult_facts', 'multiplication', 0, true);
    for (let k = 1; k <= 3; k++) {
        await waitQ(page, k);
        await typeEnter(page, await page.evaluate(() => String(window.state.currentQ.ans)));
    }
    await waitQ(page, 4);                       // the 4th item is on screen, never answered
    await page.evaluate(() => window.finishPracticeRun());
    await waitFor(page, () => (window.state.sessionHistory || []).length > 0, 10000, 'end row').catch(() => {});
    await sleep(1500);
    const rows = await page.evaluate(() => (window.state.sessionHistory || []).map((h) => h.score));
    judge('END-INF', 'mult_facts', rows.length === 1 && rows[0] === '3/3', `rows ${JSON.stringify(rows)} (want ["3/3"])`);
}
const clear = (page) => page.evaluate(() => { document.querySelectorAll('body > div').forEach((d) => { if (/z-index: ?9999/.test(d.getAttribute('style') || '')) d.remove(); }); });

(async () => {
    const { page, problems, close } = await open({ seed: 4242, viewport: { width: W, height: 800 }, lock: TOOL });
    try {
        await page.evaluate(() => { window.confirm = () => true; window.alert = () => {}; });
        const runs = [];
        if (RULES.has('END-ONCE')) runs.push(() => runOnce(page, 'multiplication', 'mult_facts'), () => runOnce(page, 'subtraction', 'sub_word_problems'));
        if (RULES.has('END-INF')) runs.push(() => runInf(page));
        for (const run of runs) {
            try { await run(); } catch (e) { findings.push(`ERROR: ${e.message.split('\n')[0]}`); }
            await clear(page);
            await page.evaluate(() => { try { window.exitGame && window.exitGame(); } catch (e) { /* */ } });
            await sleep(500);
        }
        const errs = problems.filter((p) => p.type === 'pageerror');
        if (errs.length) findings.push(`page errors: ${errs.map((e) => e.text).slice(0, 3).join(' | ')}`);
    } finally { await close(); }
    for (const f of findings) console.log('  ' + f);
    console.log(findings.length ? `${TOOL}: FAIL (${findings.length})` : `${TOOL}: OK (${checks} checks)`);
    process.exit(findings.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`${TOOL}: FAIL (crash: ${e.message})`); process.exit(1); });
