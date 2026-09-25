// One answer area per item (owner ruling 2026-09-26): "In problems like this where they give a
// blank, it should not have a separate answer area." When a cell draws its own answer places -
// the "[ ]:[ ]" of a time, the boxes of a sentence, a fraction's two boxes, "[ ] R [ ]" - those
// places ARE the answer inputs, and the host's separate answer field is hidden.
//
// For every live skill and every screen host (the practice card, the card inside a MAP session,
// the online worksheet, the quiz)
// this renders items and reports a DOUBLED answer area: the cell holds answer places (drawn
// blanks that are not inputs, or its own inputs) AND the host's own answer field is visible.
//
//   node tests/scripts/ws-screen-slots.cjs                       # every live skill, all hosts
//   node tests/scripts/ws-screen-slots.cjs --skills measurement:time_5min,division:div_remainders
//   node tests/scripts/ws-screen-slots.cjs --category measurement --hosts card
//   node tests/scripts/ws-screen-slots.cjs --from 200 --to 300   # a slice of the skill list
//   node tests/scripts/ws-screen-slots.cjs --report-only         # print, never exit 1
//
// Prints one line per doubled skill x host, a count, then `ws-screen-slots: OK` or `FAIL`.
const { open, listSkills } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const ONLY = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const CATEGORY = arg('category', '');
const HOSTS = (arg('hosts', 'card,map,worksheet,quiz') || '').split(',');
const FROM = parseInt(arg('from', '0'), 10);
const TO = parseInt(arg('to', '100000'), 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// In the page: does this cell draw answer places, and is a separate host field visible?
function DETECT(cellSel, hostSel, textSel) {
    const vis = (el) => {
        if (!el || !el.isConnected) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.closest('[hidden], .mq-sr');
    };
    const cell = document.querySelector(cellSel);
    if (!cell) return { error: 'no cell' };
    const host = hostSel ? Array.from(document.querySelectorAll(hostSel)).find(vis) : null;
    const hostInput = host ? (host.matches('input') ? host : host.querySelector('input:not([type=hidden])')) : null;
    // the host's own answer area is still there, with its input showing (an input adopted into the
    // cell has left that area)
    const hostVisible = !!hostInput && vis(hostInput);
    const inHost = (el) => !!host && host.contains(el);
    // drawn answer places that are not inputs
    const SHAPES = /^(box|line|circle|time|fraction|mixed|unit|unit-open|cell|box-unknown)$/;
    const drawn = Array.from(cell.querySelectorAll('[data-mq-cell], [data-mq-blank], [data-ws-slot]')).filter((el) => {
        if (inHost(el) || !vis(el) || el.querySelector('input, select, textarea')) return false;
        if (el.matches('input, select, textarea')) return false;
        if (el.getAttribute('data-ws-graded') === '0') return false;
        if (el.hasAttribute('data-ws-slot') && !SHAPES.test(el.getAttribute('data-ws-shape') || '')) return false;
        return !(el.textContent || '').trim();
    });
    // the cell's own typed answer inputs (working rows and regroup boxes are not answers)
    const inputs = Array.from(cell.querySelectorAll('input[type=text], input:not([type]), input[inputmode]'))
        .filter((i) => vis(i) && i !== hostInput && !inHost(i) && !i.classList.contains('mq-opswork') && !i.classList.contains('mq-carry')
            && !i.classList.contains('column-carry-input') && !i.hasAttribute('data-mq-work'));
    // a legacy drawing's blank written as underscores ("5 + ___ = 8")
    let under = 0;
    const tw = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
        const t = tw.currentNode;
        if (/_{3,}/.test(t.nodeValue || '') && t.parentElement && vis(t.parentElement) && !inHost(t.parentElement)) under++;
    }
    // SUSPECTS (reported, not failed): an empty drawn box or rule the size of an answer place,
    // outside the drag / build widgets whose empty zones are drop targets
    const WIDGET = '.dnd-host, .pvdd-host, .pvb-host, .tfb-host, .b10-host, .nle-host, .cs-host, .df-host, [data-mq-model], [data-ws-zone], svg, table, .mq-kittwin, .k2-twin';
    const suspects = drawn.length || under ? [] : Array.from(cell.querySelectorAll('span, div')).filter((el) => {
        if (inHost(el) || !vis(el) || (el.textContent || '').trim() || el.querySelector('input, svg, img, canvas, select, button') || el.closest(WIDGET)) return false;
        if (el.children.length) return false;
        const cs = getComputedStyle(el);
        const bw = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0);
        const r = el.getBoundingClientRect();
        const box = bw.every((w) => w >= 1) && r.width >= 28 && r.width <= 200 && r.height >= 22 && r.height <= 110;
        const rule = bw[2] >= 1 && !bw[0] && !bw[1] && !bw[3] && r.width >= 30 && r.width <= 260;
        return box || rule;
    }).length;
    // a PAPER verb on screen (RUBRIC H7, PEDAGOGY 10.2): visible text the pupil reads, in verb
    // position (sentence start, after a sentence end or after an expression)
    const PAPER = /(^|[.?!:;]\s+|[0-9)=?]\s+)(Write|Circle|Mark|Draw|Shade|Check one|Check the|Cross out|Underline|Trace|Color|Colour|Cut out|Glue)\b(?=\s+\S)/;
    const tRoot = textSel ? document.querySelector(textSel) : cell;
    const paper = [];
    if (tRoot) {
        const w2 = document.createTreeWalker(tRoot, NodeFilter.SHOW_TEXT);
        while (w2.nextNode()) {
            const t = w2.currentNode;
            const el = t.parentElement;
            if (!el || !vis(el) || el.closest('.mq-sr, script, style, [aria-hidden="true"], .hint-popup, .qt-q-header, .mq-wsbar')) continue;
            const m = PAPER.exec((t.nodeValue || '').replace(/\s+/g, ' ').trim());
            if (m) paper.push((t.nodeValue || '').trim().slice(0, 50));
        }
    }
    return { hostVisible, drawn: drawn.length, under, inputs: inputs.length, suspects, paper,
        doubled: hostVisible && (drawn.length > 0 || inputs.length > 0 || under > 0),
        suspect: hostVisible && !(drawn.length > 0 || inputs.length > 0 || under > 0) && suspects > 0 };
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    let skills = await listSkills(page);
    skills = skills.filter((s) => !/retired|tombstone/i.test(s.label || ''));
    if (ONLY.length) skills = skills.filter((s) => ONLY.includes(`${s.categoryId}:${s.skillId}`));
    if (CATEGORY) skills = skills.filter((s) => s.categoryId === CATEGORY);
    skills = skills.slice(FROM, TO);
    const doubled = [];
    const suspects = [];
    const paperVerbs = [];
    let mapOn = false;
    let checked = 0;
    // MAP turns the whole page into its session (body.map-immersive): it runs as its own pass,
    // after the other hosts, so a card render is never taken for a MAP one.
    const passes = [HOSTS.filter((h) => h !== 'map'), HOSTS.includes('map') ? ['map'] : []].filter((p) => p.length);
    for (const pass of passes) for (let n = 0; n < skills.length; n++) {
        const { categoryId: c, skillId: k } = skills[n];
        const key = `${c}:${k}`;
        if (n % 25 === 0) {
            mapOn = false;
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
        }
        const note = (host, r) => {
            checked++;
            if (r && r.paper && r.paper.length) paperVerbs.push(`${key.padEnd(44)} ${host.padEnd(10)} paper verb on screen: "${r.paper[0]}"`);
            if (r && r.doubled) doubled.push(`${key.padEnd(44)} ${host.padEnd(10)} host field + ${r.drawn} drawn place(s), ${r.under} underscore blank(s), ${r.inputs} cell input(s)`);
            else if (r && r.suspect) suspects.push(`${key.padEnd(44)} ${host.padEnd(10)} host field + ${r.suspects} empty drawn box(es) (check by eye)`);
        };
        try {
            if (pass.includes('card')) {
                const ok = await page.evaluate((c, k) => {
                    try {
                        const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                        window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); return true;
                    } catch (e) { return false; }
                }, c, k);
                if (ok) { await sleep(350); note('card', await page.evaluate(DETECT, '#visualAid', '#answerInputArea', '#questionPaper')); }
            }
            if (pass.includes('map')) {
                // MAP borrows the practice card with the paper wrapper off (the owner's time card)
                if (!mapOn) {
                    await page.evaluate(() => { try { window.startMapSession({ tier: 'mixed', bands: ['161-170', '171-180', '181-190', '191-200'], domains: ['OA', 'NO', 'MD', 'G'], itemCount: 0, mode: 'practice' }); } catch (e) { /* no MAP */ } });
                    await sleep(1200);
                }
                const ok = await page.evaluate(async (c, k) => {
                    try {
                        const st = window.state;
                        st.category = c; st.skill = k; st.hasAnswered = false;
                        st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 11 });
                        window.renderQuestion(); return !!st.mapMode;
                    } catch (e) { return false; }
                }, c, k);
                mapOn = ok;
                if (ok) { await sleep(350); note('map', await page.evaluate(DETECT, '#visualAid', '#answerInputArea', '#questionCard')); }
            }
            if (pass.includes('worksheet')) {
                const ok = await page.evaluate((c, k) => {
                    try {
                        const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 2;
                        window.initWorksheet(); return true;
                    } catch (e) { return false; }
                }, c, k);
                if (ok) {
                    await sleep(450);
                    const nq = await page.evaluate(() => (window.state.worksheetQs || []).length);
                    let worst = null;
                    for (let i = 0; i < nq; i++) {
                        const r = await page.evaluate(DETECT, `#ws_card_${i} .mq-wspaper`, `#ws_card_${i} .mq-answerrow`);
                        if (r && r.doubled) { worst = r; break; }
                        worst = worst || r;
                    }
                    note('worksheet', worst);
                }
            }
            if (pass.includes('quiz')) {
                const ok = await page.evaluate((c, k) => {
                    try {
                        const q = window.generateQuestionFor({ category: c, skill: k, seed: 7, itemIndex: 0 });
                        const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
                        const test = { id: null, name: 'Slots', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                        window.handleQuizURL(window.compressTestForURL(test));
                        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                        window.startQuizTest(); return true;
                    } catch (e) { return false; }
                }, c, k);
                if (ok) { await sleep(400); note('quiz', await page.evaluate(DETECT, '#quizTakeView .mq-qtpaper', '#quizTakeView .qt-answer-area')); }
                await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
            }
        } catch (e) {
            console.log(`${key} ERR ${String(e.message || e).split('\n')[0]}`);
        }
    }
    await app.close();
    doubled.forEach((l) => console.log(l));
    paperVerbs.forEach((l) => console.log(l));
    if (suspects.length) { console.log('\nsuspects (an empty drawn box beside a visible host field; not failed):'); suspects.forEach((l) => console.log('  ' + l)); }
    console.log(`\n${skills.length} skills, ${checked} host renders, ${doubled.length} doubled answer area(s), ${paperVerbs.length} paper verb(s) on screen`);
    if ((doubled.length || paperVerbs.length) && !has('report-only')) { console.log('ws-screen-slots: FAIL'); process.exit(1); }
    console.log('ws-screen-slots: OK');
})().catch((e) => { console.error(e); console.log('ws-screen-slots: FAIL'); process.exit(1); });
