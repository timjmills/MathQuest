// ws-screen-grade — the screen grades a word-work story exactly as its PAPER KEY does (lane lf-hosts 2026-11-13; precritic
// two-step r11: "letter / estimate SCREEN scoring" - on screen the letter equation and the estimate were only marked as
// typed, while paper grades both: two_step_letter_equation's 3 × 9 + 12 = n was right on screen with any equation, and
// two_step_estimate_check's estimate was never scored).
//
//   node tests/scripts/ws-screen-grade.cjs --skills algebra:two_step_letter_equation,algebra:two_step_estimate_check
//   node tests/scripts/ws-screen-grade.cjs --skills a:b --n 40 --hosts card,quiz,worksheet
//   node tests/scripts/ws-screen-grade.cjs --self-test                  # the response builder, no browser
//
// For every skill it deals --n seeded items (generateQuestionFor, seeds 1..n; default 30) and reads the PAPER KEY of each from
// the kit cell drawn answered (the facsimile key: the `answer`, `equation` and `es-r` slots as printed, and each box of the
// equation). It then writes responses into the screen twin's own boxes, as a pupil types them, on the practice card (every
// item: the Check button's verdict), the quiz and the online worksheet (the first items: the value the host composes from its
// boxes, judged by the host's verdict function), and holds the screen verdict to the paper key's verdict (the key's graded
// slots and their `accept` forms, gradeSlots) on the same written values:
//   GRADE-RIGHT   the key's own values                          paper right -> the screen must say right
//   GRADE-EQUIV   an equivalent form the key accepts: the Step 1 numbers turned around (+ / ×), signs typed x * / -
//   GRADE-WRONG   a wrong answer; a wrong equation number; a wrong equation sign; a wrong estimate; a blank equation /
//                 estimate with the right answer                paper wrong -> the screen must say wrong
//   GRADE-AGREE   on every response, screen verdict == paper verdict (the finding names the skill, seed, host and case)
// A response whose paper verdict is not the one its case expects is a finding too (the key, not the screen, is then wrong).
// An item with no graded part beyond its answer is graded on the answer cases (right / wrong / working left blank).
// Prints one line per skill and `ws-screen-grade: OK (...)` / `ws-screen-grade: FAIL (n)`; exit 1 on FAIL, 2 on usage.
// MQ_ROOT serves another checkout (tests/lib/ws-harness.cjs). Run through tests/scripts/mq-browser-run.sh.
'use strict';
const TOOL = 'ws-screen-grade';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ pure: the responses of one item */
const ASCII = { '×': 'x', '÷': '/', '−': '-', '+': '+' };
const OTHER = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
/**
 * The responses for an item from its printed key: {case, expect, answer, parts: {equation: [5 box values], 'es-r': [v]},
 * paper: {answer, equation, 'es-r'}} - `parts` is what is typed into the screen boxes, `paper` what the pupil writes on paper
 * (the equation as one line, read off the same boxes and the printed brackets). Pure.
 */
function responsesFor(key) {
    const out = [];
    const eqLine = (b) => `${key.brk ? '(' : ''}${b[0]}${b[1]}${b[2]}${key.brk ? ')' : ''}${b[3]}${b[4]}=n`;
    const mk = (kase, expect, answer, eqBoxes, est) => {
        const parts = {}, paper = { answer: String(answer) };
        if (key.parts.includes('equation')) { parts.equation = eqBoxes; paper.equation = eqBoxes.some((v) => v === '') ? '' : eqLine(eqBoxes.map((v) => (/^[x*X]$/.test(v) ? '×' : v === '/' ? '÷' : v === '-' ? '−' : v))); }
        if (key.parts.includes('es-r')) { parts['es-r'] = [String(est)]; paper['es-r'] = String(est); }
        out.push({ kase, expect, answer: String(answer), parts, paper });
    };
    const eq = key.eqBoxes || [];
    const est = key.est;
    mk('right', true, key.answer, eq, est);
    mk('wrong-answer', false, Number(key.answer) + 1, eq, est);
    if (key.parts.includes('equation')) {
        mk('equiv-signs-typed', true, key.answer, eq.map((v, i) => (i % 2 ? ASCII[v] || v : v)), est);
        if ((eq[1] === '+' || eq[1] === '×') && eq[0] !== eq[2]) mk('equiv-turn-around', true, key.answer, [eq[2], eq[1], eq[0], eq[3], eq[4]], est);
        mk('wrong-equation-number', false, key.answer, [eq[0], eq[1], eq[2], eq[3], String(Number(eq[4]) + 1)], est);
        mk('wrong-equation-sign', false, key.answer, [eq[0], eq[1], eq[2], OTHER[eq[3]] || eq[3], eq[4]], est);
        mk('blank-equation', false, key.answer, ['', '', '', '', ''], est);
    }
    if (key.parts.includes('es-r')) {
        mk('wrong-estimate', false, key.answer, eq, Number(est) + 10);
        mk('blank-estimate', false, key.answer, eq, '');
    }
    return out;
}

function selfTest() {
    const bad = []; let n = 0;
    const ok = (name, c) => { n++; if (!c) bad.push(name); };
    const L = responsesFor({ answer: '58', parts: ['equation'], eqBoxes: ['5', '×', '9', '+', '13'], brk: false });
    ok('letter: 7 cases', L.length === 7);
    ok('letter right line', L[0].paper.equation === '5×9+13=n' && L[0].expect === true);
    ok('letter turn-around', L.some((r) => r.kase === 'equiv-turn-around' && r.paper.equation === '9×5+13=n'));
    ok('letter typed signs on paper read as glyphs', L.find((r) => r.kase === 'equiv-signs-typed').paper.equation === '5×9+13=n');
    ok('letter typed signs on screen are ascii', L.find((r) => r.kase === 'equiv-signs-typed').parts.equation[1] === 'x');
    ok('letter wrong sign', L.find((r) => r.kase === 'wrong-equation-sign').paper.equation === '5×9−13=n');
    const B = responsesFor({ answer: '42', parts: ['equation'], eqBoxes: ['5', '+', '9', '×', '3'], brk: true });
    ok('brackets kept', B[0].paper.equation === '(5+9)×3=n');
    ok('÷ first: no turn-around', !responsesFor({ answer: '4', parts: ['equation'], eqBoxes: ['20', '÷', '5', '+', '3'] }).some((r) => r.kase === 'equiv-turn-around'));
    const E = responsesFor({ answer: '94', parts: ['es-r'], est: 100 });
    ok('estimate: 4 cases', E.length === 4 && E.find((r) => r.kase === 'wrong-estimate').paper['es-r'] === '110');
    ok('plain: right + wrong', responsesFor({ answer: '7', parts: [] }).length === 2);
    for (const b of bad) console.log(`  ${b}`);
    console.log(`${TOOL} --self-test: ${n - bad.length}/${n}`);
    console.log(bad.length ? `${TOOL}: FAIL (self-test, ${bad.length})` : `${TOOL}: OK (self-test, ${n} cases)`);
    process.exit(bad.length ? 1 : 0);
}

/* ------------------------------------------------------------------ in the page */
// The printed key of a seeded item, read off the kit cell drawn ANSWERED (the facsimile key), and its payload's graded parts.
async function keyInPage({ cat, skill, seed }) {
    const K = await import('/js/modules/sheet/index.js');
    // (one item per seed, kept: a generator's fresh-deal memory deals a DIFFERENT story on a second call with the same seed)
    const q = window.generateQuestionFor({ category: cat, skill, seed });
    (window.__wsGrade = window.__wsGrade || {})[`${cat}:${skill}:${seed}`] = q;
    if (!q || !q.cell || q.cell.template !== 'word-work') return { skip: 'not a word-work item' };
    const p = q.cell.payload;
    const html = K.renderCell(q, { mode: 'print', size: 'M', look: 'ican', state: 'answered' });
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, '') : '');
    // the graded parts beyond the answer are read off the PAPER KEY's graded slots (never off the screen code under test)
    const ks = (K.cellAnswerKey(q) || {}).slots || {};
    const parts = ['equation', 'es-r'].filter((id) => ks[id] && ks[id].graded !== false);
    const key = { answer: String(q.ans), parts, layout: p.layout || 'columns' };
    const g = doc.querySelector('[data-ws-slot="equation"]');
    if (parts.includes('equation')) {
        if (!g) return { error: 'the key prints no equation slot' };
        key.eqBoxes = ['fr0-a', 'op0', 'fr0-b', 'op1', 'fr1-b'].map((id) => txt(g.querySelector(`[data-ws-slot="${id}"]`)));
        key.brk = /^\(/.test(txt(g));
        key.eqPrinted = txt(g);
    }
    if (parts.includes('es-r')) key.est = txt(doc.querySelector('[data-ws-slot="es-r"]'));
    const ans = doc.querySelector('[data-ws-slot="answer"]');
    if (ans && txt(ans) && txt(ans).replace(/,/g, '') !== String(q.ans)) return { error: `the key prints answer ${txt(ans)}, q.ans ${q.ans}` };
    return { key };
}
// The paper verdict: the key's graded slots and their accept forms (gradeSlots), on the values as written on paper.
async function paperVerdictInPage({ cat, skill, seed, values }) {
    const K = await import('/js/modules/sheet/index.js');
    const q = window.__wsGrade[`${cat}:${skill}:${seed}`];
    const r = K.gradeSlots(K.cellAnswerKey ? K.cellAnswerKey(q) : null, values);
    // an item whose key is graded per digit (the columns answer row): the answer's digits right-aligned
    const slots = (K.cellAnswerKey(q) || {}).slots || {};
    if (Object.keys(slots).some((k) => /^ans-\d+$/.test(k))) {
        const T = Object.keys(slots).filter((k) => /^ans-\d+$/.test(k)).length;
        const d = String(values.answer || '').padStart(T, ' ');
        const v2 = Object.assign({}, values);
        for (let i = 0; i < T; i++) v2[`ans-${i}`] = d[i] === ' ' ? '' : d[i];
        return K.gradeSlots(K.cellAnswerKey(q), v2).correct;
    }
    return r.correct;
}
// Types one response into a host's cell `root`: the answer box(es) and each graded part's boxes, as a pupil types.
function typeInPage({ sel, answer, parts }) {
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    const put = (el, v) => { el.focus(); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    const ans = [...root.querySelectorAll('input.mq-cellslot')].filter((el) => !el.closest('[data-mq-part]'));
    if (!ans.length) return { error: 'no answer box in the cell' };
    if (ans.length === 1) put(ans[0], answer);
    else { const d = String(answer).padStart(ans.length, ' '); ans.forEach((el, i) => put(el, d[i] === ' ' ? '' : d[i])); }
    for (const [id, vals] of Object.entries(parts || {})) {
        const boxes = [...root.querySelectorAll(`[data-mq-part="${id}"] input`)];
        if (boxes.length !== vals.length) return { error: `part ${id}: ${boxes.length} box(es) on screen, ${vals.length} value(s) in the key` };
        boxes.forEach((el, i) => put(el, vals[i]));
    }
    return { ok: true };
}

/* ------------------------------------------------------------------ the run */
async function main() {
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'n', 'hosts', 'host-items']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && m[1] !== 'self-test')) { console.log(`${TOOL}: unknown argument ${argv[i]}`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const skills = String(arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
    if (!skills.length) { console.log(`${TOOL}: give --skills cat:skill,...`); console.log(`${TOOL}: FAIL (usage: an empty run checks nothing)`); process.exit(2); }
    const N = Math.max(1, +arg('n', '30'));
    const HOSTS = String(arg('hosts', 'card,quiz,worksheet')).split(',').map((s) => s.trim());
    const HOST_ITEMS = Math.max(1, +arg('host-items', '3'));
    const { open } = require('../lib/ws-harness.cjs');
    const T0 = Date.now();
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => d.accept().catch(() => {}));
    const findings = [];
    let judged = 0, graded = 0;
    const summary = [];
    try {
        const live = await page.evaluate(() => { const o = []; for (const [c, l] of Object.entries(window.SKILLS)) for (const s of l || []) if (s && s.v && !s.retired) o.push(`${c}:${s.v}`); return o; });
        for (const k of skills) if (!live.includes(k)) findings.push(`${k}: not a live skill`);
        for (const s of skills.filter((k) => live.includes(k))) {
            const [cat, skill] = s.split(':');
            let n = 0, parts = new Set(), cases = 0;
            const judge = (host, seed, r, screen, paper) => {
                judged++;
                if (paper !== r.expect) findings.push(`GRADE-KEY ${s} seed ${seed} ${r.kase}: the paper key says ${paper ? 'right' : 'wrong'}, the case is ${r.expect ? 'right' : 'wrong'}`);
                if (screen !== paper) findings.push(`GRADE-AGREE ${s} seed ${seed} ${host} ${r.kase}: screen ${screen === null ? 'no verdict' : screen ? 'right' : 'wrong'}, paper ${paper ? 'right' : 'wrong'} (answer ${r.answer}${Object.entries(r.paper).filter(([id]) => id !== 'answer').map(([id, v]) => `, ${id} ${v || '(blank)'}`).join('')})`);
            };
            const keys = [];
            for (let seed = 1; seed <= N; seed++) {
                const kr = await page.evaluate(keyInPage, { cat, skill, seed });
                if (kr.skip) continue;
                if (kr.error) { findings.push(`${s} seed ${seed}: ${kr.error}`); continue; }
                keys.push({ seed, key: kr.key });
            }
            if (!keys.length) { findings.push(`${s}: no word-work item in ${N} seeds (nothing graded)`); continue; }
            // ---- the practice card: every item, every case, the real Check
            if (HOSTS.includes('card')) {
                await page.evaluate((cat, skill) => { const st = window.state; st.category = cat; st.skill = skill; st.gameMode = 'practice'; st.isMixedMode = false; st.quizMode = false; window.showView('gameView'); }, cat, skill);
                for (const { seed, key } of keys) {
                    n++;
                    key.parts.forEach((p) => parts.add(p));
                    for (const r of responsesFor(key)) {
                        cases++;
                        await page.evaluate((cat, skill, seed) => {
                            for (const id of window.__wsGradeTimers || []) clearTimeout(id);
                            window.__wsGradeTimers = [];
                            const st = window.state; st.hasAnswered = false; st.currentQAttempts = 0;
                            // a fresh copy each case: a wrong case climbs the support ladder on the item it was given
                            st.currentQ = JSON.parse(JSON.stringify(window.__wsGrade[`${cat}:${skill}:${seed}`]));
                            window.renderQuestion();
                        }, cat, skill, seed);
                        await page.evaluate(() => {
                            if (window.__wsGradeTimerHook) return;
                            window.__wsGradeTimerHook = true; window.__wsGradeTimers = [];
                            const st = window.setTimeout;
                            window.setTimeout = function (...a) { const id = st.apply(this, a); window.__wsGradeTimers.push(id); return id; };
                        });
                        await sleep(60);
                        const t = await page.evaluate(typeInPage, { sel: '#visualAid', answer: r.answer, parts: r.parts });
                        await sleep(80);
                        if (t.error) { findings.push(`${s} seed ${seed} card ${r.kase}: ${t.error}`); continue; }
                        const screen = await page.evaluate(() => {
                            if (!window.state.hasAnswered) window.submitAnswer();
                            // the card's own late timers (the move to the next item after a right answer) are cleared, so they
                            // never redraw the card under the next case (the auto-check on a right part started them at typing)
                            for (const id of window.__wsGradeTimers || []) clearTimeout(id);
                            window.__wsGradeTimers = [];
                            const f = document.getElementById('feedbackArea');
                            if (f && /mq-ladder-feedback/.test(f.className)) return false;   // a calm wrong answer: the ladder's rung
                            // right: the feedback says so; wrong: the attempt is recorded (a calm wrong answer climbs the support
                            // ladder with its own message, never the "incorrect" class)
                            return f && /\bcorrect\b/.test(f.className) ? true : (window.state.currentQAttempts > 0 || (f && /\bincorrect\b/.test(f.className))) ? false : null;
                        });
                        const paper = await page.evaluate(paperVerdictInPage, { cat, skill, seed, values: r.paper });
                        graded++;
                        judge('card', seed, r, screen, paper);
                    }
                }
            }
            // ---- the quiz: the first items; the value the quiz composes from its boxes, judged by the quiz's verdict
            if (HOSTS.includes('quiz')) {
                for (const { seed, key } of keys.slice(0, HOST_ITEMS)) {
                    for (const r of responsesFor(key)) {
                        const ok = await page.evaluate((cat, skill, seed) => {
                            try {
                                const q = window.__wsGrade[`${cat}:${skill}:${seed}`];
                                const test = { id: null, name: 'Grade check', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: skill, points: 1, questionData: window.quizQuestionData(q) }] }],
                                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                                window.handleQuizURL(window.compressTestForURL(test));
                                const nm = document.getElementById('qtStudentName'); nm.value = 'Check'; nm.dispatchEvent(new Event('input'));
                                window.startQuizTest();
                                return true;
                            } catch (e) { return e.message; }
                        }, cat, skill, seed);
                        if (ok !== true) { findings.push(`${s} seed ${seed} quiz: ${ok}`); break; }
                        await sleep(150);
                        const t = await page.evaluate(typeInPage, { sel: '#quizTakeView .qt-question-card', answer: r.answer, parts: r.parts });
                        if (t.error) { findings.push(`${s} seed ${seed} quiz ${r.kase}: ${t.error}`); continue; }
                        const screen = await page.evaluate(async (cat, skill, seed) => {
                            const S = await import('/js/modules/screen-cell.js');
                            const inp = document.getElementById('qtAnswerInput');
                            const qd = window.quizQuestionData(window.__wsGrade[`${cat}:${skill}:${seed}`]);
                            const v = S.slotAnswerMatches(inp ? inp.value : '', qd);
                            return typeof v === 'boolean' ? v : null;
                        }, cat, skill, seed);
                        const paper = await page.evaluate(paperVerdictInPage, { cat, skill, seed, values: r.paper });
                        graded++;
                        // an item with no graded part answers through the quiz's own number compare: no slot verdict is right there
                        if (screen === null && !key.parts.length) continue;
                        judge('quiz', seed, r, screen, paper);
                    }
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
                }
            }
            // ---- the online worksheet: its own dealt items (the skill's options); the value it composes, its verdict path
            if (HOSTS.includes('worksheet') && keys[0].key.parts.length) {
                await page.evaluate((c, k, n) => { if (window.__wsReseed) window.__wsReseed(4242); const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.quizMode = false; st.problemCount = n; window.initWorksheet(); }, cat, skill, HOST_ITEMS);
                await sleep(500);
                const wsKeys = await page.evaluate(async () => {
                    const K = await import('/js/modules/sheet/index.js');
                    return (window.state.worksheetQs || []).map((q, i) => {
                        if (!q || !q.cell || q.cell.template !== 'word-work') return null;
                        const p = q.cell.payload;
                        const html = K.renderCell(q, { mode: 'print', size: 'M', look: 'ican', state: 'answered' });
                        const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
                        const txt = (el) => (el ? el.textContent.replace(/\s+/g, '') : '');
                        const ks = (K.cellAnswerKey(q) || {}).slots || {};
                        const parts = ['equation', 'es-r'].filter((id) => ks[id] && ks[id].graded !== false);
                        const key = { answer: String(q.ans), parts };
                        const g = doc.querySelector('[data-ws-slot="equation"]');
                        if (g) { key.eqBoxes = ['fr0-a', 'op0', 'fr0-b', 'op1', 'fr1-b'].map((id) => txt(g.querySelector(`[data-ws-slot="${id}"]`))); key.brk = /^\(/.test(txt(g)); }
                        if (parts.includes('es-r')) key.est = txt(doc.querySelector('[data-ws-slot="es-r"]'));
                        return { i, key };
                    }).filter(Boolean);
                });
                for (const { i, key } of wsKeys) {
                    for (const r of responsesFor(key)) {
                        const t = await page.evaluate(typeInPage, { sel: `#ws_card_${i}`, answer: r.answer, parts: r.parts });
                        if (t.error) { findings.push(`${s} worksheet card ${i + 1} ${r.kase}: ${t.error}`); continue; }
                        const v = await page.evaluate(async (i, values) => {
                            const S = await import('/js/modules/screen-cell.js');
                            const K = await import('/js/modules/sheet/index.js');
                            const q = window.state.worksheetQs[i];
                            const inp = document.getElementById(`ws_input_${i}`);
                            const s = S.slotAnswerMatches(inp ? inp.value : '', q);
                            return { screen: typeof s === 'boolean' ? s : null, paper: K.gradeSlots(K.cellAnswerKey(q), values).correct };
                        }, i, r.paper);
                        graded++;
                        judge('worksheet', `ws${i + 1}`, r, v.screen, v.paper);
                    }
                }
            }
            summary.push(`${s} - ${n} item(s) x ${cases ? (cases / Math.max(1, n)).toFixed(1) : 0} case(s) on the card; graded parts: answer${[...parts].map((p) => `, ${p}`).join('')}`);
            console.log(summary[summary.length - 1]);
        }
        if (app.problems.length) findings.push(`console: ${app.problems.slice(0, 3).map((p) => String(p.text).split('\n')[0]).join(' | ')}`);
    } catch (e) {
        findings.push(`crash: ${e && e.message}`);
    } finally { await app.close(); }
    for (const f of findings.slice(0, 60)) console.log(`  ${f}`);
    if (findings.length > 60) console.log(`  ... ${findings.length - 60} more`);
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (!graded && !findings.length) findings.push('nothing graded');
    console.log(findings.length ? `${TOOL}: FAIL (${findings.length}) (${judged} verdicts compared; ${secs} s)` : `${TOOL}: OK (${skills.length} skill(s), ${judged} screen verdicts = paper key verdicts; ${secs} s)`);
    process.exit(findings.length ? 1 : 0);
}
main().catch((e) => { console.log(`${TOOL}: ${e && e.stack || e}`); console.log(`${TOOL}: FAIL (error)`); process.exit(1); });

module.exports = { responsesFor };
