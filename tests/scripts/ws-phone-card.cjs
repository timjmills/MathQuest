// ws-phone-card — the practice card at phone width (390 px): nothing a pupil needs is cut off sideways, and typing
// goes where the pupil writes first. (pilot-su-c critic r1 D5: at 390 px the 6-digit stack lost its ones column, rule
// and ones box at the cell edge, and from 4 digits the first focused box was the leftmost, not the ones box. No gate
// looked at 390 px: ws-chromebook-fit measures 1366 / 1280 heights, ws-screen-slots never focuses.)
//
//   node tests/scripts/ws-phone-card.cjs --skills subtraction:sub_1m_no_regroup,subtraction:sub_100_no_regroup
//   node tests/scripts/ws-phone-card.cjs --skills a:b --sizes 390x844,390x664 --items 3 --shots <dir>
//   node tests/scripts/ws-phone-card.cjs --self-test           # the entry-order and clip rules on a fixture page
//
// For every skill, size and seeded item (default 390x844 and 390x664, 3 items: a fresh page each, the card opened as a
// pupil opens it, playSelectedSkills('practice'), seeded) it checks, at scrollY as the app leaves it after load:
//   CLIP-X    the page does not scroll sideways (documentElement.scrollWidth <= innerWidth), and none of the question
//             text, the drawn problem (every visible element inside #questionPaper), the answer inputs and Check / Next
//             is cut off sideways: each lies inside the viewport's width AND inside every ancestor up to #questionCard
//             whose overflow-x clips (hidden / clip / auto / scroll) by more than 1 px.
//   FOCUS     the answer input the pupil writes first has the keyboard focus after load: the first non-optional answer
//             input in ENTRY order (DOM order, except that a row of column digit boxes is entered ones first, right to
//             left, as active-box.js / wireStackEntry order it; regroup and carry boxes are optional and never first).
//             On a column item (the kit stack, or a legacy column-* cell) that is the ONES box, found structurally,
//             never by pixel row (critic r6 D2: the focused legacy box is lifted 3-4 px by .mq-active-box): its
//             data-ws-slot / data-slot "ans-0", else the legacy data-col "<id>-ans-<i>" with the largest i, else the
//             last answer box of its cell in DOM order. A wrong focus is named by its place (ones = place 0) by the
//             same rule. An item with no typed answer (choices, a drawing) has no FOCUS check (listed as n/a).
//   INVIEW    that focused input lies inside the viewport (both axes).
// Every finding names the skill, size, item and the element. Page errors raised while a skill rendered are its own.
//   A14       "siblings clean": after the lane's skills, the probe runs on the approved skills pinned in
//             tests/fixtures/precritic/phone-card-siblings.json (--siblings-file; two legacy column twins, a kit stack
//             skill, a K skill; --sibling-items N, default min(--items, 2)). If any approved sibling fails, the probe
//             misjudges approved skills, so the TOOL fails ("A14 siblings not clean"), whatever the lane did.
//             --no-siblings-check skips it (named in the last line).
//
// Prints one line per (skill, size, item) and `ws-phone-card: OK (...)` / `ws-phone-card: FAIL - ...`; exit 1 on FAIL
// (0 with --report-only), 2 on a usage error. An empty run (no skill, an unknown key) is a FAIL, never OK. Run through
// /tmp/mq-browser-run.sh. MQ_ROOT serves another checkout (tests/lib/ws-harness.cjs).
'use strict';
const fs = require('fs');
const path = require('path');
const { open, ROOT } = require('../lib/ws-harness.cjs');

const TOOL = 'ws-phone-card';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (...a) => console.log(...a);
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* In the page: the checks. Pure DOM, so the self-test runs it on a fixture page too. */
function PROBE() {
    const W = innerWidth, H = innerHeight, TOL = 1;
    const card = document.getElementById('questionCard');
    if (!card) return { error: 'no #questionCard' };
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const name = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        const slot = el.getAttribute && el.getAttribute('data-ws-slot') ? `[${el.getAttribute('data-ws-slot')}]` : '';
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18);
        return `${el.tagName.toLowerCase()}${id}${cls}${slot}${t && !/^(input|svg)$/i.test(el.tagName) ? ` "${t}"` : ''}`;
    };
    const OPTIONAL = /carry|regroup/i;
    const isOptional = (el) => OPTIONAL.test(String(el.className)) || /regroup|carry/i.test((el.closest('[data-mq-kind]') || el).getAttribute('data-mq-kind') || '') || /^regroup/.test(el.getAttribute('data-ws-slot') || '');
    const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
    const inputs = Array.from(card.querySelectorAll('input, textarea, [contenteditable="true"]'))
        .filter((el) => !(el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase())))
        .filter(vis).filter((el) => !el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container'));
    // entry order: a run of column digit boxes in one stack and one row is entered ones first (right to left)
    const DIGIT = 'input.mq-digit, input.column-answer-input';
    const order = [];
    for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];
        if (!el.matches(DIGIT) || isOptional(el)) { order.push(el); continue; }
        const stk = el.closest('.ws-stack, .column-problem, [data-mq-cell]') || el.parentElement;
        const top = Math.round(el.getBoundingClientRect().top);
        const run = [el];
        while (i + 1 < inputs.length) {
            const nx = inputs[i + 1];
            if (!nx.matches(DIGIT) || isOptional(nx) || Math.round(nx.getBoundingClientRect().top) !== top || (nx.closest('.ws-stack, .column-problem, [data-mq-cell]') || nx.parentElement) !== stk) break;
            run.push(nx); i++;
        }
        order.push(...run.reverse());
    }
    let graded = order.filter((el) => !isOptional(el));
    // a column item (the kit stack, or a legacy column cell) is written ones first whatever its inputs are called
    // (SP-20). The ones box is found STRUCTURALLY, never by pixel row (critic r6 D2: the focused legacy box
    // `.column-answer-input.mq-active-box` sits 3-4 px above its row, so a 2 px row tolerance picked the tens box):
    //   1. its place attribute: data-ws-slot / data-slot "ans-<place>" (the kit stack and its screen twin), place 0;
    //   2. the legacy column's data-col "<id>-ans-<i>": boxes are numbered left to right, so place = (largest i) - i;
    //   3. else DOM order: the bottom answer row is the last row of a column cell and its rightmost box comes last, so
    //      place = the number of answer boxes after it in the same cell.
    const q = window.state && window.state.currentQ;
    const columnItem = !!q && ((q.cell && q.cell.template === 'stack') || /^column-/.test(String(q.printFormat || '')));
    const cellOf = (el) => el.closest('.ws-stack, .column-problem, [data-mq-cell]') || el.parentElement;
    const placeOf = (el) => {
        const sl = /^ans-(\d+)$/.exec(el.getAttribute('data-ws-slot') || el.getAttribute('data-slot') || '');
        if (sl) return { place: +sl[1], how: 'its place attribute' };
        const dc = /^(.*)-ans-(\d+)$/.exec(el.getAttribute('data-col') || '');
        if (dc) {
            const idx = graded.map((g) => /^(.*)-ans-(\d+)$/.exec(g.getAttribute('data-col') || '')).filter((m) => m && m[1] === dc[1]).map((m) => +m[2]);
            return { place: Math.max(...idx) - +dc[2], how: 'its data-col column index' };
        }
        const same = graded.filter((g) => g.matches(DIGIT) && cellOf(g) === cellOf(el));
        const at = same.indexOf(el);
        return at < 0 ? null : { place: same.length - 1 - at, how: 'DOM order in its cell' };
    };
    let onesHow = '';
    if (columnItem && graded.length > 1) {
        const ones = graded.find((el) => { const p = placeOf(el); return p && p.place === 0; });
        if (ones) { onesHow = placeOf(ones).how; graded = [ones, ...graded.filter((el) => el !== ones)]; }
    }
    const findings = [];
    // CLIP-X
    const over = document.documentElement.scrollWidth - innerWidth;
    if (over > TOL) findings.push({ rule: 'CLIP-X', msg: `the page scrolls sideways by ${over} px at ${W} px` });
    const paper = document.getElementById('questionPaper');
    const go = [document.getElementById('qcCheckBtn'), document.getElementById('nextBtn'), document.querySelector('#answerInputArea .mq-inline-check')].filter(vis);
    const qtext = Array.from(card.querySelectorAll('#questionText, .question-text, .mq-qtext')).filter(vis);
    const subjects = [...qtext, ...(paper && vis(paper) ? Array.from(paper.querySelectorAll('*')).filter((e) => vis(e) && !e.closest('svg defs')) : []), ...inputs, ...go];
    const clippers = (el) => {
        const out = [];
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX;
            if (ox !== 'visible') out.push(a);
            if (a === card) break;
        }
        return out;
    };
    const seen = new Set();
    const cut = [];
    for (const el of subjects) {
        if (seen.has(el)) continue;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.width < 1) continue;
        let why = '';
        if (r.left < -TOL || r.right > W + TOL) why = `${Math.round(Math.max(-r.left, r.right - W))} px outside the ${W} px viewport`;
        else for (const a of clippers(el)) {
            const ar = a.getBoundingClientRect();
            const bl = parseFloat(getComputedStyle(a).borderLeftWidth) || 0, br = parseFloat(getComputedStyle(a).borderRightWidth) || 0;
            const L = ar.left + bl, R = ar.right - br;
            if (r.left < L - TOL || r.right > R + TOL) { why = `cut by ${name(a)} (overflow-x ${getComputedStyle(a).overflowX}): ${Math.round(Math.max(L - r.left, r.right - R))} px hidden`; break; }
        }
        if (why) cut.push({ el, why });
    }
    // one finding per clipping box (or per element outside the viewport), naming the first few cut elements
    const groups = new Map();
    for (const x of cut) { const k = x.why.replace(/: \d+ px hidden$/, ''); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
    for (const [k, list] of groups) findings.push({ rule: 'CLIP-X', msg: `${list.length} element(s) ${/^cut by/.test(k) ? '' : 'each '}${list[0].why}; e.g. ${list.slice(0, 4).map((x) => name(x.el)).join(', ')}` });
    // FOCUS / INVIEW
    const act = document.activeElement;
    let focus = 'n/a';
    if (graded.length) {
        const want = graded[0];
        if (act === want) focus = 'ok';
        else {
            focus = 'FAIL';
            // the place of the focused box, by the same structural rule that picked the ones box (never a pixel row)
            const pa = act && graded.includes(act) && columnItem ? placeOf(act) : null;
            const where = act && act !== document.body ? `${name(act)}${graded.includes(act) ? (columnItem ? (pa ? ` (the answer box at place ${pa.place}, counted from the ones = place 0, by ${pa.how}; ${graded.length} answer boxes)` : ` (an answer box of ${graded.length} with no place)`) : ` (answer box ${graded.indexOf(act) + 1} of ${graded.length} in entry order)`) : ''}` : 'nothing (body)';
            findings.push({ rule: 'FOCUS', msg: `focus is on ${where}; the pupil writes first in ${columnItem ? `the ones box (place 0, by ${onesHow || 'entry order'}) ` : ''}${name(want)}` });
        }
        const fr = (act && graded.includes(act) ? act : want).getBoundingClientRect();
        if (fr.left < -TOL || fr.right > W + TOL || fr.top < -TOL || fr.bottom > H + TOL) findings.push({ rule: 'INVIEW', msg: `the first answer box is not in view (left ${Math.round(fr.left)}, right ${Math.round(fr.right)}, top ${Math.round(fr.top)}, bottom ${Math.round(fr.bottom)} in ${W} x ${H})` });
    }
    return { focus, columnItem, onesHow, inputs: graded.length, findings: findings.map((f) => ({ rule: f.rule, msg: f.msg })), paperW: paper ? Math.round(paper.getBoundingClientRect().width) : 0 };
}

const FIXTURE = (variant) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px sans-serif}#questionCard{width:370px;margin:0 10px;overflow:hidden}
.ws-stack{display:grid;grid-template-columns:repeat(4,${variant === 'clip' ? '120px' : '40px'})}</style>
<div id="questionCard"><div id="questionText">Subtract.</div><div id="questionPaper"><div class="ws-stack">
<span>4</span><span>3</span><span>6</span><span>7</span>
<input class="mq-digit" data-ws-slot="ans-3"><input class="mq-digit" data-ws-slot="ans-2"><input class="mq-digit" data-ws-slot="ans-1"><input class="mq-digit" data-ws-slot="ans-0">
</div></div><button id="qcCheckBtn">Check</button></div>
<script>document.querySelectorAll('input.mq-digit')[${variant === 'focus' ? 0 : 3}].focus()</script>`;
// critic r6 D2: the legacy column twin (add_10k_regroup, sub_1m_regroup): data-col "<id>-ans-<i>" boxes left to right,
// the focused one lifted 4 px by .mq-active-box. 'lifted' focuses the ones box (ok); 'lifted-tens' the tens box (FAIL).
const LEGACY = (variant) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px sans-serif}#questionCard{width:370px;margin:0 10px}
.column-answer-input{width:24px;height:24px}.mq-active-box{position:relative;top:-4px}</style>
<div id="questionCard"><div id="questionText">Add.</div><div id="questionPaper"><div class="column-problem"><div>4 3 6 7</div><div>+ 1 2 2 1</div>
<div><input class="column-answer-input" data-col="q1-ans-0"><input class="column-answer-input" data-col="q1-ans-1"><input class="column-answer-input" data-col="q1-ans-2"><input class="column-answer-input" data-col="q1-ans-3"></div>
</div></div><button id="qcCheckBtn">Check</button></div>
<script>window.state = { currentQ: { printFormat: 'column-addition' } }; (() => { const b = document.querySelectorAll('input.column-answer-input')[${variant === 'lifted' ? 3 : 2}]; b.classList.add('mq-active-box'); b.focus(); })();</script>`;

async function selfTest() {
    const puppeteer = require('puppeteer');
    const { chromePath } = require('../lib/ws-harness.cjs');
    const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath(), args: ['--no-sandbox'] });
    const fails = [];
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 390, height: 844 });
        const run = async (v) => { await page.setContent(FIXTURE(v)); await page.waitForFunction(() => document.readyState === 'complete'); return page.evaluate(PROBE); };
        const good = await run('good');
        if (good.findings.length || good.focus !== 'ok') fails.push(`good fixture: ${JSON.stringify(good)}`);
        const f = await run('focus');
        if (!f.findings.some((x) => x.rule === 'FOCUS')) fails.push('leftmost box focused: no FOCUS finding');
        const c = await run('clip');
        if (!c.findings.some((x) => x.rule === 'CLIP-X')) fails.push('stack wider than the card: no CLIP-X finding');
        const runL = async (v) => { await page.setContent(LEGACY(v)); await page.waitForFunction(() => document.readyState === 'complete'); await page.evaluate(() => document.querySelector('.mq-active-box').focus()); return page.evaluate(PROBE); };
        const lifted = await runL('lifted');
        if (lifted.focus !== 'ok' || lifted.findings.length) fails.push(`legacy ones box lifted 4 px by .mq-active-box and focused: must be ok (${JSON.stringify(lifted.findings)})`);
        const tens = await runL('lifted-tens');
        const tf = tens.findings.find((x) => x.rule === 'FOCUS');
        if (!tf || !/place 1,/.test(tf.msg) || !/place 0/.test(tf.msg)) fails.push(`legacy tens box focused: a FOCUS finding naming place 1 and the ones box (place 0) (${JSON.stringify(tens.findings)})`);
    } finally { await browser.close(); }
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 5 fixture pages)`);
    process.exit(fails.length ? 1 : 0);
}

async function main() {
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'sizes', 'items', 'shots', 'json', 'siblings-file', 'sibling-items']);
    const BOOL = new Set(['report-only', 'self-test', 'no-siblings-check']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const skills = String(arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
    if (!skills.length) { say(`${TOOL}: give --skills cat:skill,...`); say(`${TOOL}: FAIL - usage (an empty run checks nothing)`); process.exit(2); }
    const sizes = String(arg('sizes', '390x844,390x664')).split(',').map((s) => { const m = /^(\d+)x(\d+)$/.exec(s.trim()); return m ? { w: +m[1], h: +m[2] } : null; });
    if (sizes.some((s) => !s)) { say(`${TOOL}: --sizes takes WxH,...`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const ITEMS = Math.max(1, +arg('items', '3'));
    const SHOTS = arg('shots', null);
    // A14 "siblings clean" (critic r6 D2): the approved skills of the pinned list must pass, or the probe is wrong
    let sibs = [];
    if (!has('no-siblings-check')) {
        const sf = path.resolve(__dirname, '..', '..', arg('siblings-file', 'tests/fixtures/precritic/phone-card-siblings.json'));
        try { sibs = (JSON.parse(fs.readFileSync(sf, 'utf8')).skills || []).filter((k) => !skills.includes(k)); } catch (e) { say(`${TOOL}: cannot read the A14 siblings list ${sf}: ${e.message}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    }
    const SIB_ITEMS = Math.max(1, +arg('sibling-items', String(Math.min(ITEMS, 2))));
    const T0 = Date.now();
    const app = await open({ seed: 1, viewport: { width: sizes[0].w, height: sizes[0].h, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => d.accept().catch(() => {}));
    const fails = [], sibFails = [];
    const rows = [], sibRows = [];
    let mark = 0;
    const take = () => { const p = app.problems.slice(mark); mark = app.problems.length; return p; };
    const measure = async (list, items, out, outFails, label) => {
        for (const size of sizes) {
            await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
            for (const s of list) {
                const [c, k] = s.split(':');
                for (let it = 0; it < items; it++) {
                    const tag = `${label}${s} ${size.w}x${size.h} item ${it + 1}`;
                    let m;
                    try {
                        await page.reload({ waitUntil: 'networkidle2' });
                        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS, { timeout: 30000 });
                        await page.evaluate((c, k, seed) => {
                            if (window.__wsReseed) window.__wsReseed(seed);
                            if (window.setUserRole) window.setUserRole('student', { persist: false });
                            window.state.quizMode = false;
                            window.skillQueue.length = 0;
                            window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
                            window.playSelectedSkills('practice');
                        }, c, k, hash(`${s}:phone:${it}`));
                        await sleep(900);
                        try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                        await sleep(400);
                        m = await page.evaluate(PROBE);
                        if (m.error) throw new Error(m.error);
                    } catch (e) { outFails.push(`${tag}: ERR ${e.message}`); say(`${tag}: ERR ${e.message}`); continue; }
                    for (const p of take()) m.findings.push({ rule: 'PAGE-ERROR', msg: `[${p.type}] ${String(p.text).split('\n')[0].slice(0, 160)}` });
                    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${label ? 'sibling-' : ''}${size.w}x${size.h}-${c}-${k}-${it + 1}.png`) }); }
                    for (const f of m.findings) outFails.push(`${tag}: ${f.rule} ${f.msg}`);
                    out.push({ skill: s, size: `${size.w}x${size.h}`, item: it + 1, focus: m.focus, ones: m.onesHow || null, inputs: m.inputs, findings: m.findings });
                    say(`${tag}: ${m.findings.length ? 'FAIL' : 'ok'} (focus ${m.focus}${m.columnItem ? ` (column: ones first, the ones box by ${m.onesHow || 'entry order'})` : ''}, ${m.inputs} answer box(es), paper ${m.paperW} px)${m.findings.length ? '\n' + m.findings.map((f) => `    ${f.rule} ${f.msg}`).join('\n') : ''}`);
                }
            }
        }
    };
    try {
        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS, { timeout: 30000 });
        const live = await page.evaluate(() => { const o = []; for (const [c, l] of Object.entries(window.SKILLS)) for (const s of l || []) if (s && s.v && !s.retired) o.push(`${c}:${s.v}`); return o; });
        const unknown = skills.filter((k) => !live.includes(k));
        if (unknown.length) { say(`${TOOL}: not live skill(s): ${unknown.join(', ')}`); say(`${TOOL}: FAIL - unknown skill(s) ${unknown.join(', ')}`); await app.close(); process.exit(1); }
        const deadSibs = sibs.filter((k) => !live.includes(k));
        for (const k of deadSibs) sibFails.push(`A14 sibling ${k} is not a live skill in this tree`);
        sibs = sibs.filter((k) => live.includes(k));
        take();
        await measure(skills, ITEMS, rows, fails, '');
        if (sibs.length) { say(`A14 siblings clean: ${sibs.length} approved skill(s) the probe must pass`); await measure(sibs, SIB_ITEMS, sibRows, sibFails, 'A14 sibling '); }
    } finally { await app.close(); }
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills, sizes: sizes.map((z) => `${z.w}x${z.h}`), items: ITEMS, rows, fails, siblingsCheck: { skills: sibs, items: SIB_ITEMS, rows: sibRows, fails: sibFails }, seconds: +secs }, null, 1) + '\n');
    const want = skills.length * sizes.length * ITEMS;
    if (rows.length < want && !fails.length) fails.push(`only ${rows.length} of ${want} renders measured`);
    const byRule = {};
    for (const r of rows) for (const f of r.findings) byRule[f.rule] = (byRule[f.rule] || 0) + 1;
    const a14 = has('no-siblings-check') ? 'A14 siblings check skipped (--no-siblings-check)' : sibFails.length ? `A14 siblings NOT clean: ${sibFails.length} finding(s) on approved skill(s) ${[...new Set(sibFails.map((f) => f.split(' ')[2]))].join(', ')}` : `A14 siblings clean (${sibs.length} approved skill(s) × ${sizes.length} size(s) × ${SIB_ITEMS} item(s))`;
    const tail = `${skills.length} skill(s) × ${sizes.length} size(s) × ${ITEMS} item(s): ${rows.length} of ${want} renders measured; ${a14}; ${secs} s`;
    let line;
    if (sibFails.length) line = `${TOOL}: FAIL - the probe misjudges approved skills (A14 siblings not clean), so its verdict cannot be trusted: ${sibFails.slice(0, 3).join(' | ').slice(0, 400)}${fails.length ? `; the lane's own: ${fails.length} finding(s)` : ''} (${tail})`;
    else if (fails.length) line = `${TOOL}: FAIL - ${fails.length} finding(s) (${Object.entries(byRule).map(([k, v]) => `${k} ${v}`).join(', ') || 'render errors'}) (${tail})`;
    else line = `${TOOL}: OK (${tail})`;
    say(line);
    process.exit((fails.length || sibFails.length) && !has('report-only') ? 1 : 0);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(1); });
