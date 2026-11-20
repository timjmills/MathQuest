// ws-fit-floor — the host fit pass (screen-cell.js fitTwinRows) on drawn kit twins (lane lf-hosts, lead / lf-algebra 2026-11-20:
// "host fit digit floor; fit only ever lowers").
//
//   FIT-FLOOR  on every host (practice card, online worksheet, quiz) at 820 / 1024 / 1280 / 1366, on twin-drawn skills, the FIT never
//              takes a twin's digits below the 29 px worksheet floor (WORKSHEET_DIGIT_PX, tests/lib/ws-screen-widths.cjs): a twin's
//              smallest numeral is >= 29 px, or - where the drawing's own size (the twin with the fit's --mq-k2 taken off) is already
//              under 29 px - no smaller than that own size (raising a template's own size is the template's job, and the card /
//              quiz floors of 48 / 56 px are ws-screen-slots SCREEN-DIGIT's). And no horizontal scroll: the page is no wider than
//              the window, and no drawn element of a twin runs past its cell's edge (the cell clips). The NARROW probe (at 1024) also
//              narrows each twin's cell to 300 px - just under the narrowest real cell, a 2-up worksheet column at 820 - and fits it
//              again through fitTwinRows: the same floor holds (on 9ae9ccd5d the word-work twin fell 27.1 -> 25.6 px there).
//   FIT-RESET  a host fitted at 820 and then widened to 1280 (a window resize) draws its twins at the size a fresh render at 1280
//              gives (0.5 px): a fit never keeps the smaller size an earlier, narrower width left behind.
//
//   node tests/scripts/ws-fit-floor.cjs [--skills a:b,c:d] [--hosts card,worksheet,quiz] [--widths 820,1024] [--narrow 300]
//   MQ_ROOT=<tree> judges another checkout (ws-backtest commit-pair rows).
// Last line `ws-fit-floor: OK (...)` / `FAIL - ...`; exit 1 on FAIL, 2 on error.
'use strict';
const path = require('path');
const TOOL = 'ws-fit-floor';
const ROOT = process.env.MQ_ROOT || path.resolve(__dirname, '..', '..');
const SW = require('../lib/ws-screen-widths.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
// the lead's sample (twin-drawn skills) plus three wide kit drawings whose own digits are over 29 px (bond, ten frame, money columns)
const SAMPLE = ['patterns:number_patterns_rule', 'counting:count_sequence', 'multiplication:count_by_tables', 'subtraction:sub_word_problems', 'placevalue:expand',
    'composing:number_bonds', 'composing:ten_frame_build', 'measurement:money'];
const SKILLS = String(arg('skills', SAMPLE.join(','))).split(',').filter(Boolean);
const HOSTS = String(arg('hosts', 'card,worksheet,quiz')).split(',').filter(Boolean);
const WIDTHS = SW.widthsArg(process.argv, [820, 1024, 1280, 1366]);
const FLOOR = SW.WORKSHEET_DIGIT_PX;
const TOL = 0.5;
const ROOTS = { card: '#visualAid', worksheet: '#worksheetGrid', quiz: '#quizTakeView .mq-qtpaper' };
// the NARROW probe: at this width each twin's cell is narrowed to NARROW_PX and fitted again (a drawing that does not fit)
const NARROW_AT = WIDTHS.includes(1024) ? 1024 : WIDTHS[0];
const NARROW_PX = Number(arg('narrow', 300));   // (just under the narrowest real cell: a 2-up worksheet column at 820 is 320 px)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** In the page: every visible twin under `sel` - its smallest numeral fitted and at its own size, and its overflow. */
function MEASURE(sel) {
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const digitMin = (t) => {
        let px = Infinity;
        const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
            if (!/\d/.test(n.nodeValue || '')) continue;
            const el = n.parentElement;
            // (SVG labels scale with their drawing's viewBox, so their font-size is not the drawn size: HTML numerals only)
            if (!el || !vis(el) || el.closest('svg, .mq-sr, [aria-hidden="true"], .mq-wsbar, .k2-keys, [data-mq-screen-only]')) continue;
            px = Math.min(px, parseFloat(getComputedStyle(el).fontSize) || Infinity);
        }
        return px === Infinity ? 0 : Math.round(px * 10) / 10;
    };
    const twins = Array.from(root.querySelectorAll('.k2-twin')).filter(vis);
    const out = twins.map((t) => {
        const cell = t.closest('.mq-scell, .ws-cell, #visualAid') || t.parentElement;
        const fitted = digitMin(t);
        const inline = t.style.getPropertyValue('--mq-k2');
        let own = fitted;
        if (inline) { t.style.removeProperty('--mq-k2'); own = digitMin(t); t.style.setProperty('--mq-k2', inline); }
        const cb = cell.getBoundingClientRect();
        let over = 0;
        for (const el of t.querySelectorAll('*')) {
            if (!vis(el)) continue;
            // (a row that scrolls inside its own box is not clipped by the cell)
            if (el.closest('[data-mq-swiperow]') && el.closest('[data-mq-swiperow]') !== el) continue;
            const r = el.getBoundingClientRect();
            over = Math.max(over, r.right - cb.right, cb.left - r.left);
        }
        return { fitted, own, over: Math.round(over * 10) / 10, k2: parseFloat(getComputedStyle(t).getPropertyValue('--mq-k2')) || 0 };
    });
    return { twins: out, hscroll: Math.max(0, document.documentElement.scrollWidth - window.innerWidth) };
}

/**
 * In the page: the NARROW probe. Each twin's cell is narrowed to `px` (a cell the drawing does not fit: a quiz column, a
 * three-up worksheet try) and fitted again through the module's own fitTwinRows; then measured as MEASURE does and restored.
 */
async function NARROW(sel, px) {
    const sc = await import(new URL('js/modules/screen-cell.js', location.href).href);
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    const twins = Array.from(root.querySelectorAll('.k2-twin')).filter((t) => t.getBoundingClientRect().width > 0);
    const digitMin = (t) => {
        let m = Infinity;
        const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
            if (!/\d/.test(n.nodeValue || '')) continue;
            const el = n.parentElement;
            if (!el || !el.getClientRects().length || el.closest('svg, .mq-sr, [aria-hidden="true"], .mq-wsbar, .k2-keys, [data-mq-screen-only]')) continue;
            m = Math.min(m, parseFloat(getComputedStyle(el).fontSize) || Infinity);
        }
        return m === Infinity ? 0 : Math.round(m * 10) / 10;
    };
    const out = [];
    for (const t of twins) {
        const cell = t.closest('.mq-scell, .ws-cell, #visualAid') || t.parentElement;
        const own = digitMin(t);
        const sw = cell.style.width, smw = cell.style.maxWidth, sminw = cell.style.minWidth;
        cell.style.width = `${px}px`; cell.style.maxWidth = `${px}px`; cell.style.minWidth = '0';
        sc.fitTwinRows(cell);
        const cb = cell.getBoundingClientRect();
        let over = 0;
        for (const el of t.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || (el.closest('[data-mq-swiperow]') && el.closest('[data-mq-swiperow]') !== el)) continue;
            over = Math.max(over, r.right - cb.right, cb.left - r.left);
        }
        out.push({ own, fitted: digitMin(t), over: Math.round(over * 10) / 10, tpl: t.getAttribute('data-mq-template') || '' });
        cell.style.width = sw; cell.style.maxWidth = smw; cell.style.minWidth = sminw;
        sc.fitTwinRows(cell);
    }
    return { twins: out };
}

async function render(page, host, c, k, again) {
    try { return await render1(page, host, c, k); } catch (e) {
        if (!again) throw e;
        await again();                       // (one retry on a fresh page: the quiz's name screen sometimes never lands)
        return render1(page, host, c, k);
    }
}
async function render1(page, host, c, k) {
    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
    const ok = await page.evaluate((host, c, k) => {
        try {
            const st = window.state;
            if (host === 'card') {
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; window.showView('gameView');
                st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 3 }); if (!st.currentQ) return 'no item'; window.renderQuestion(); return true;
            }
            if (host === 'worksheet') {
                if (window.__wsReseed) window.__wsReseed(11);
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); return true;
            }
            const q = window.generateQuestionFor({ category: c, skill: k, seed: 7, itemIndex: 0 });
            const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
            const test = { id: null, name: 'Fit', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test)); return 'quiz';
        } catch (e) { return String((e && e.message) || e).slice(0, 120); }
    }, host, c, k);
    if (ok === 'quiz') {
        // (the quiz's name screen can land a frame late after handleQuizURL)
        await page.waitForSelector('#qtStudentName', { timeout: 8000 });
        await page.evaluate(() => { const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input')); window.startQuizTest(); });
    } else if (ok !== true) throw new Error(`${host} did not render (${ok})`);
    if (host === 'worksheet') await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 900)))));
}

(async () => {
    const H = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
    let app;
    const fails = [];
    let n = 0;
    try {
        app = await H.open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
        const { page } = app;
        page.on('dialog', (d) => d.accept().catch(() => {}));
        const fresh = async (w) => {
            await page.setViewport({ width: w, height: SW.heightOf(w), deviceScaleFactor: 1 });
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS && typeof window.generateQuestionFor === 'function', { timeout: 30000 });
            await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } if (window.setUserRole) window.setUserRole('student', { persist: false }); });
            try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
        };
        const fmt = (m) => m.twins.map((t) => `${t.fitted}${t.own !== t.fitted ? `(own ${t.own})` : ''}`).join(' ');
        const freshAt = {};
        for (const w of WIDTHS) {
            for (const s of SKILLS) {
                const [c, k] = s.split(':');
                for (const host of HOSTS) {
                    const key = `${s} ${host}@${w}`;
                    try {
                        await fresh(w);
                        await render(page, host, c, k, () => fresh(w));
                        const m = await page.evaluate(MEASURE, ROOTS[host]);
                        if (m.error) throw new Error(m.error);
                        n++;
                        freshAt[key] = m;
                        const v = [];
                        m.twins.forEach((t, i) => {
                            if (t.fitted > 0 && t.fitted < FLOOR - TOL && t.fitted < t.own - TOL) v.push(`FIT-FLOOR twin ${i + 1}: the fit drew ${t.fitted} px digits (own size ${t.own} px, floor ${FLOOR})`);
                            if (t.over > 1.5) v.push(`FIT-FLOOR twin ${i + 1} runs ${t.over} px past its cell`);
                        });
                        if (m.hscroll > 1) v.push(`FIT-FLOOR the page scrolls sideways (${m.hscroll} px)`);
                        if (w === NARROW_AT && m.twins.length) {
                            const nm = await page.evaluate(NARROW, ROOTS[host], NARROW_PX);
                            if (nm.error) throw new Error(nm.error);
                            nm.twins.forEach((t, i) => {
                                if (t.fitted > 0 && t.fitted < FLOOR - TOL && t.fitted < t.own - TOL) v.push(`FIT-FLOOR narrow ${NARROW_PX} px twin ${i + 1} (${t.tpl}): the fit drew ${t.fitted} px digits (own ${t.own} px, floor ${FLOOR})`);
                                // (overflow in the synthetic narrow cell is printed, not judged: a drawing with a fixed minimum - the bond's
                                // 72 px boxes - is its template's; overflow is judged on the real renders above)
                            });
                            console.log(`  ${(key + ` narrow ${NARROW_PX}`).padEnd(52)} ${nm.twins.map((t) => `${t.tpl}:${t.own}->${t.fitted}${t.over > 1.5 ? ` over ${t.over}` : ''}`).join(' ')}`);
                        }
                        console.log(`  ${key.padEnd(52)} ${m.twins.length ? `twin digits ${fmt(m)}` : 'no twin'}${v.length ? '\n    ' + v.join('\n    ') : ''}`);
                        v.forEach((f) => fails.push(`${key}: ${f}`));
                    } catch (e) { fails.push(`${key}: error ${String(e.message || e).split('\n')[0]}`); console.log(`  ${key} ERR ${e.message}`); }
                }
            }
        }
        // FIT-RESET: 820, then a window resize to 1280, against a fresh render at 1280
        if (WIDTHS.includes(820) && WIDTHS.includes(1280)) {
            for (const s of SKILLS) {
                const [c, k] = s.split(':');
                for (const host of HOSTS) {
                    const key = `${s} ${host} 820->1280`;
                    try {
                        const ref = freshAt[`${s} ${host}@1280`];
                        if (!ref || !ref.twins.length) continue;
                        await fresh(820);
                        await render(page, host, c, k, () => fresh(820));
                        await page.setViewport({ width: 1280, height: SW.heightOf(1280), deviceScaleFactor: 1 });
                        await sleep(1400);
                        const m = await page.evaluate(MEASURE, ROOTS[host]);
                        if (m.error) throw new Error(m.error);
                        n++;
                        const lo = Math.min(...m.twins.map((t) => t.fitted).filter((x) => x > 0)), want = Math.min(...ref.twins.map((t) => t.fitted).filter((x) => x > 0));
                        const bad = m.twins.length === ref.twins.length ? m.twins.map((t, i) => [i, t.fitted, ref.twins[i].fitted]).filter(([, a, b]) => a < b - TOL) : [];
                        const v = bad.map(([i, a, b]) => `FIT-RESET twin ${i + 1}: ${a} px after the resize, ${b} px on a fresh render at 1280`);
                        if (m.twins.length !== ref.twins.length && lo < want - TOL) v.push(`FIT-RESET smallest digit ${lo} px after the resize, ${want} px fresh`);
                        console.log(`  ${key.padEnd(52)} resized ${fmt(m)} | fresh ${fmt(ref)}${v.length ? '\n    ' + v.join('\n    ') : ''}`);
                        v.forEach((f) => fails.push(`${key}: ${f}`));
                    } catch (e) { fails.push(`${key}: error ${String(e.message || e).split('\n')[0]}`); console.log(`  ${key} ERR ${e.message}`); }
                }
            }
        }
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.message || e).split('\n')[0]}`); process.exitCode = 2; return; }
    finally { if (app) await app.close(); }
    if (fails.length) { console.log(`${TOOL}: FAIL - ${fails.length} finding(s) in ${n} host renders: ${fails.slice(0, 4).join(' | ').slice(0, 700)}`); process.exitCode = 1; }
    else console.log(`${TOOL}: OK (${SKILLS.length} skill(s) x ${HOSTS.length} host(s) x ${WIDTHS.length} widths + resize 820 -> 1280: twin digits never fitted under ${FLOOR} px, no sideways scroll, a resize refits from the drawing's own size)`);
})();
