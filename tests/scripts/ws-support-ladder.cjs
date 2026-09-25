// The SUPPORT LADDER for wrong answers (js/modules/support-ladder.js, owner request 2026-09-25).
//
// On each screen host - the practice card, an online worksheet card, and a quiz with INSTANT
// feedback - the pupil answers the same item wrong three times, then right. After each wrong
// answer the test checks:
//   wrong 1   a support is drawn in the item's cell (the skill's first declared one)
//   wrong 2   a SECOND support is added, of a different kind, and the first is still there
//   wrong 3   the worked steps for this item are shown
//   always    the answer is nowhere in what the ladder drew (S8), the entry is kept on the card,
//             no red flood, and a quiz does not say "The answer is"
// and after the right answer that the item scores. A quiz without instant feedback must show no
// ladder at all, and "Help after a wrong answer: none" must turn the ladder off.
//
//   node tests/scripts/ws-support-ladder.cjs
//   node tests/scripts/ws-support-ladder.cjs --skills addition:add_facts --hosts card
//   node tests/scripts/ws-support-ladder.cjs --shots /tmp/ladder      # screenshots at 1280 and 390
//
// Prints one line per skill and host, then `ws-support-ladder: OK` or `FAIL` (exit 1).
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const DEFAULT = ['addition:add_facts', 'subtraction:subtract', 'measurement:time_quarter', 'counting:count_objects'];
// `--wide`: one skill per family on the practice card, and every card checker the ladder runs on
// (the word-work cell, rounding on a number line, box division, perimeter + area, fraction boxes,
// the draw-the-hands clock). A skill may carry options after a `|`: `measurement:time_quarter|{"response":"draw"}`.
const WIDE = ['multiplication:mult_facts', 'division:div_facts', 'division:box_division_easy', 'addition:add_wp_20',
    'addition:add_word_problems', 'number_sense:round_nl_thousands', 'number_sense:nearest_100', 'measurement:money_count',
    'measurement:time_quarter|{"response":"draw"}', 'area_perimeter:area_perimeter', 'fractions:write_fraction',
    'algebra:function_table_easy', 'placevalue:value', 'comparing:compare_groups', 'composing:number_bonds'];
const LIST = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const SKILLS = LIST.length ? LIST : has('wide') ? WIDE : DEFAULT;
const HOSTS = (arg('hosts', has('wide') ? 'card' : 'card,worksheet,quiz') || '').split(',');
const SHOTS = arg('shots', null);
const WIDTHS = SHOTS ? [1280, 390] : [1280];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// In the page: the item's wrong answers (three different ones) and its right one, as typed.
function ANSWERS(which) {
    const st = window.state;
    const q = which.host === 'card' ? st.currentQ
        : which.host === 'worksheet' ? st.worksheetQs[which.i]
            : st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
    const a = String(q.ans);
    const t = /^(\d{1,2}):(\d{2})$/.exec(a);
    let wrong;
    if (t) {
        const h = Number(t[1]);
        wrong = [1, 2, 3].map((k) => `${((h - 1 + k) % 12) + 1}:${t[2]}`);
    } else {
        const n = Number(a.replace(/,/g, ''));
        wrong = [1, 2, 3].map((k) => String(n + k));
    }
    return { right: a, wrong };
}

// In the page: what the ladder drew for the item, and whether it shows the answer.
async function LOOK(which) {
    const L = await import('/js/modules/support-ladder.js');
    const st = window.state;
    const q = which.host === 'card' ? st.currentQ
        : which.host === 'worksheet' ? st.worksheetQs[which.i]
            : st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
    const root = document.querySelector(which.sel);
    if (!root || !q) return { error: 'no cell' };
    const s = L.shownOf(q);
    const drawn = Array.from(root.querySelectorAll('[data-mq-ladder], .mq-ladder-extra, .mq-ladder-tiles, .mq-ladder-under'));
    const kitOn = [...Array.from(root.querySelectorAll('.ws-supported')).map((el) => el.getAttribute('data-ws-supports') || ''),
        ...Array.from(root.querySelectorAll('[data-mq-ladder]:not(svg)')).map((el) => el.getAttribute('data-mq-ladder') || '')].join(' ');
    const dots = root.querySelectorAll('.ws-td, [data-ws-tally]').length;
    const extraOn = (Array.from(root.querySelectorAll('[data-mq-ladder-on]')).map((el) => el.getAttribute('data-mq-ladder-on')).join(' ')
        + ' ' + Array.from(root.querySelectorAll('.mq-ww[data-mq-ladder]')).map((el) => (el.getAttribute('data-mq-ladder') || '').replace('hl', 'wpCues').replace('bar', 'wpBar').replace('kb', 'wpBank')).join(' ')).trim();
    const ring = !!root.querySelector('svg[data-mq-ladder="ring"]');
    const worked = !!root.querySelector('.mq-ladder-worked');
    // the text the ladder added (inputs excluded: the pupil's entry is not the ladder's)
    const textOf = (el) => { const c = el.cloneNode(true); c.querySelectorAll('input, textarea, select').forEach((x) => x.remove()); return c.textContent || ''; };
    // the step checklist numbers its lines (1, 2, 3, 4): fixed words, never the item's numbers
    const text = drawn.map((el) => { const c = el.cloneNode(true); c.querySelectorAll('[data-mq-ladder-on="steps"]').forEach((x) => x.remove()); return textOf(c); }).join(' | ');
    const a = String(q.ans);
    const nums = (String(q.text || '').match(/\d[\d,]*/g) || []).map((x) => x.replace(/,/g, ''));
    const ops = Array.isArray(q.operands) ? q.operands.map(String) : [];
    const given = new Set([...nums, ...ops]);
    const t = /^(\d{1,2}):(\d{2})$/.exec(a);
    // the whole answer never; for a fact whose answer is also a given number, nothing to test
    const tokens = t ? [a] : given.has(a.replace(/,/g, '')) ? [] : [a.replace(/,/g, '')];
    const leaks = tokens.filter((tok) => new RegExp(`(^|[^\\d:])${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d])`).test(text.replace(/,(?=\d{3})/g, '')));
    // the worked steps: no part of a time either
    const wtext = worked ? textOf(root.querySelector('.mq-ladder-worked')) : '';
    if (t && worked) {
        const hh = String(Number(t[1])), mm = t[2];
        if (new RegExp(`(^|[^\\d])${mm}(?![\\d])`).test(wtext)) leaks.push(`minutes ${mm} in the worked steps`);
        if (new RegExp(`(^|[^\\d])${hh}(?![\\d:])`).test(wtext.replace(/Short hand|hour/g, ''))) leaks.push(`hour ${hh} in the worked steps`);
    }
    const input = which.host === 'card' ? document.getElementById('answerInput') : which.host === 'worksheet' ? document.getElementById(`ws_input_${which.i}`) : document.getElementById('qtAnswerInput');
    const card = which.host === 'worksheet' ? document.getElementById(`ws_card_${which.i}`) : document.getElementById('questionCard');
    const red = which.host === 'card' ? !!(card && card.classList.contains('incorrect-bg'))
        : which.host === 'worksheet' ? /incorrect/.test(card ? card.style.border : '') : false;
    const fb = which.host === 'quiz' ? (document.querySelector('#quizTakeView .qt-feedback') || {}).textContent || ''
        : which.host === 'card' ? (document.getElementById('feedbackArea') || {}).textContent || '' : '';
    return {
        n: s.n, ids: s.ids, drawnIds: s.drawnIds, spent: s.spent, kitOn, dots, extraOn, ring, worked, leaks, red, fb: fb.trim(),
        entry: input && input.type !== 'hidden' && input.offsetParent ? input.value : null, ans: a,
        len: L.ladderOf(q) ? L.ladderOf(q).rungs.length : 0,
    };
}

// In the page: answer the practice card's item the way its answer type takes it. k = 0 the right
// answer, k = 1..3 three different wrong ones.
function CARD_ANSWER(k) {
    const st = window.state;
    const q = st.currentQ;
    st.hasAnswered = false;
    const bump = (v) => { const n = Number(String(v).replace(/,/g, '')); return Number.isFinite(n) ? String(n + k) : `${v}${k ? 'x'.repeat(k) : ''}`; };
    const t = q.answerType;
    if (t === 'dual' && q.dualAnswers) {
        const p = document.getElementById('perimeterInput'), a = document.getElementById('areaInput');
        if (p && !p.disabled) p.value = bump(q.dualAnswers.perimeter);
        if (a && !a.disabled) a.value = String(q.dualAnswers.area);
        window.submitAnswer();
        return 'dual';
    }
    if (t === 'inline-blanks' && q.inlineBlanksData) {
        const cells = Array.from(document.querySelectorAll('#gameView .ib-cell'));
        const set = q.inlineBlanksData.acceptedSets[0];
        cells.forEach((c, i) => { c.value = i === cells.length - 1 ? bump(set[i]) : String(set[i]); });
        window.submitInlineBlanks();
        return 'inline';
    }
    if (t === 'fraction-input') {
        const [n, d] = String(q.ans).split('/');
        document.getElementById('fiNum').value = bump(n);
        document.getElementById('fiDen').value = String(d);
        window.checkFractionInputAnswer();
        return 'fraction';
    }
    if (t === 'box-division') {
        const ins = Array.from(document.querySelectorAll('#visualAid .bx-roof, #visualAid .bx-sub, #visualAid .bx-rem'));
        ins.forEach((el, i) => { el.value = i === 0 ? bump(el.dataset.answer) : String(el.dataset.answer); });
        window.submitAnswer();
        return 'box';
    }
    if (t === 'clock-set') {
        const host = document.querySelector('#visualAid .cs-host');
        const click = (act) => host.querySelector(`[data-act="${act}"]`).click();
        const read = (r) => Number(host.querySelector(`[data-role="${r}-readout"]`).textContent);
        const wantH = (((q.ans.hour + k) % 12) + 12) % 12 || 12, wantM = q.ans.minute;
        for (let i = 0; i < 13 && read('hour') !== wantH; i++) click('hour-up');
        for (let i = 0; i < 61 && read('minute') !== wantM; i++) click('min-up');
        host.querySelector('.cs-submit').click();
        return 'clock-set';
    }
    const inp = document.getElementById('answerInput');
    const a = String(q.ans);
    const tm = /^(\d{1,2}):(\d{2})$/.exec(a);
    const v = k === 0 ? a : tm ? `${((Number(tm[1]) - 1 + k) % 12) + 1}:${tm[2]}` : bump(a);
    if (inp) inp.value = v;
    window.submitAnswer();
    return 'typed';
}

async function giveCard(page, k) {
    await page.evaluate(CARD_ANSWER, k);
    await sleep(400);
}

async function giveWorksheet(page, i, value) {
    await page.evaluate((i, v) => {
        const card = document.getElementById(`ws_card_${i}`);
        const cols = Array.from(card.querySelectorAll('.column-answer-input'));
        const q = window.state.worksheetQs[i];
        if (cols.length && q.isVerticalFormat !== false && getComputedStyle(cols[0]).display !== 'none' && cols[0].offsetParent) {
            const d = String(v).replace(/[^0-9]/g, '');
            const pad = cols.length - d.length;
            cols.forEach((c, k) => { c.value = k >= pad ? d.charAt(k - pad) : ''; });
            window.checkWorksheetAnswerFromColumns(i);
        } else {
            const inp = document.getElementById(`ws_input_${i}`);
            inp.value = v;
            window.checkWorksheetAnswer(i);
        }
    }, i, value);
    await sleep(350);
}

async function giveQuiz(page, value) {
    await page.evaluate((v) => {
        const flat = window.state.quizOrder[window.state.quizQuestionIndex];
        window.submitQuizTextAnswer(flat, v);
    }, value);
    await sleep(350);
}

// The checks after wrong answer k (1, 2, 3) on one host.
function judge(k, r, host, fails, tag) {
    const F = (m) => fails.push(`${tag} wrong ${k}: ${m}`);
    if (r.error) return F(r.error);
    // a short ladder (worked steps only, or one support) is spent early: the host's own behaviour
    if (r.len && k > r.len) { if (!r.worked) F('spent without ever showing the worked steps'); if (r.n !== r.len) F(`ladder at ${r.n}, want ${r.len}`); return; }
    if (r.n !== k) F(`ladder at ${r.n}, want ${k}`);
    if (r.leaks.length) F(`the answer shows: ${r.leaks.join(', ')}`);
    if (r.red) F('red flood on a ladder step');
    if (host === 'card' && r.entry !== null && r.entry === '') F('the entry was cleared');
    if (host === 'quiz' && /answer is/i.test(r.fb)) F(`quiz feedback gives the answer: "${r.fb}"`);
    const supports = r.ids.filter((x) => x !== 'worked');
    const isDrawn = (id) => r.kitOn.split(/\s+/).includes(id) || r.extraOn.split(/\s+/).includes(id) || (id === 'ring' && r.ring);
    const drawnAny = r.kitOn.trim() || r.extraOn.trim() || r.ring;
    if (k === 1 && !(r.ids.length === 1 && (drawnAny || r.worked))) F(`nothing drawn (${JSON.stringify(r)})`);
    if (k === 1 && /touch/.test(r.ids[0] || '') && !r.dots) F('touch dots named but none on the digits');
    if (k === 2 && supports.length >= 2 && !(new Set(supports).size === 2)) F('the second support repeats the first');
    if (k >= 2 && !r.drawnIds.every(isDrawn)) F(`not every support is drawn: ${r.drawnIds.join(', ')} vs kit "${r.kitOn}" extra "${r.extraOn}"`);
    if (k === 3 && !r.worked) F('no worked steps');
}

async function shot(page, host, skill, k, w) {
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const sel = host === 'card' ? '#questionCard' : host === 'worksheet' ? '#ws_card_0' : '#quizTakeView .qt-question-card';
    const el = await page.$(sel);
    if (!el) return;
    await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
    await sleep(120);
    const file = path.join(SHOTS, `ladder-${skill.replace(':', '-')}-${host}-wrong${k}-${w}.png`);
    try { await el.screenshot({ path: file }); } catch (e) { /* off-screen */ }
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    const fails = [];
    for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: w < 600 ? 844 : 900, deviceScaleFactor: 1 });
        for (const spec of SKILLS) {
            const [s, optJson] = spec.split('|');
            const [c, k] = s.split(':');
            const line = [];
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            await page.evaluate(() => { window.setHelpAfterWrong('ladder'); window.state.ttsEnabled = true; });
            if (optJson) await page.evaluate((c, k, o) => { window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, o, { silent: true }); }, c, k, JSON.parse(optJson));
            if (HOSTS.includes('card')) {
                const tag = `${s} card @${w}`;
                await page.evaluate((c, k, seed) => {
                    if (window.__wsReseed) window.__wsReseed(seed);
                    const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                    window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
                }, c, k, hash(s + ':ladder'));
                await sleep(500);
                const before = await page.evaluate(() => window.state.score || 0);
                const seen = [];
                for (let n = 1; n <= 3; n++) {
                    await giveCard(page, n);
                    const r = await page.evaluate(LOOK, { host: 'card', sel: '#questionPaper' });
                    judge(n, r, 'card', fails, tag);
                    seen.push(r.ids.join('+') || '-');
                    await shot(page, 'card', s, n, w);
                }
                await giveCard(page, 0);
                const after = await page.evaluate(() => window.state.score || 0);
                if (!(after > before)) fails.push(`${tag}: the right answer did not score`);
                const help = await page.evaluate((k) => JSON.stringify((window.state.sessionHelp || {})[k] || {}), k);
                if (help === '{}') fails.push(`${tag}: the session data did not record the ladder`);
                line.push(`card ${seen[seen.length - 1]} ${after > before ? 'scored' : 'NOT SCORED'} ${help}`);
            }
            await page.evaluate(() => {
                Array.from(document.body.querySelectorAll('*')).filter((e) => { const cs = getComputedStyle(e); return cs.position === 'fixed' && Number(cs.zIndex) >= 1000 && e.getBoundingClientRect().width > innerWidth * 0.6 && e.getBoundingClientRect().height > innerHeight * 0.6; }).forEach((e) => { e.style.display = 'none'; });
            });
            if (HOSTS.includes('worksheet')) {
                const tag = `${s} worksheet @${w}`;
                await page.evaluate((c, k, seed) => {
                    if (window.__wsReseed) window.__wsReseed(seed);
                    const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3;
                    window.initWorksheet();
                }, c, k, hash(s + ':ladder-ws'));
                await sleep(700);
                const ans = await page.evaluate(ANSWERS, { host: 'worksheet', i: 0 });
                const seen = [];
                for (let n = 1; n <= 3; n++) {
                    await giveWorksheet(page, 0, ans.wrong[n - 1]);
                    const r = await page.evaluate(LOOK, { host: 'worksheet', i: 0, sel: '#ws_card_0 .ws-cell' });
                    judge(n, r, 'worksheet', fails, tag);
                    seen.push(r.ids.join('+') || '-');
                    await shot(page, 'worksheet', s, n, w);
                }
                await giveWorksheet(page, 0, ans.right);
                const ok = await page.evaluate(() => /correct/.test(document.getElementById('ws_card_0').style.border));
                if (!ok) fails.push(`${tag}: the right answer was not marked correct`);
                line.push(`worksheet ${seen[seen.length - 1]} ${ok ? 'correct' : 'NOT CORRECT'}`);
                await page.evaluate(() => { Array.from(document.body.children).filter((e) => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach((e) => e.remove()); });
            }
            if (HOSTS.includes('quiz')) {
                for (const fbMode of ['instant', 'end']) {
                    const tag = `${s} quiz(${fbMode}) @${w}`;
                    await page.evaluate((c, k, seed, fbMode) => {
                        const questions = [];
                        for (let i = 0; i < 2; i++) {
                            const q = window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i });
                            questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
                        }
                        const test = { id: null, name: 'Ladder', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                            settings: { timeLimit: null, randomOrder: false, showFeedback: fbMode, allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                        window.handleQuizURL(window.compressTestForURL(test));
                        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                        window.startQuizTest();
                    }, c, k, hash(s + ':ladder-quiz'), fbMode);
                    await sleep(500);
                    const ans = await page.evaluate(ANSWERS, { host: 'quiz' });
                    if (fbMode === 'end') {
                        await giveQuiz(page, ans.wrong[0]);
                        const r = await page.evaluate(LOOK, { host: 'quiz', sel: '#quizTakeView .qt-cell' });
                        if (r.n || r.kitOn.includes('touch') || r.extraOn || r.worked) fails.push(`${tag}: a test-style quiz drew the ladder`);
                        line.push(`quiz(end) ${r.n ? 'LADDER' : 'none'}`);
                    } else {
                        const seen = [];
                        for (let n = 1; n <= 3; n++) {
                            await giveQuiz(page, ans.wrong[n - 1]);
                            const r = await page.evaluate(LOOK, { host: 'quiz', sel: '#quizTakeView .qt-cell' });
                            judge(n, r, 'quiz', fails, tag);
                            seen.push(r.ids.join('+') || '-');
                            await shot(page, 'quiz', s, n, w);
                        }
                        await giveQuiz(page, ans.right);
                        const fb = await page.evaluate(() => (document.querySelector('#quizTakeView .qt-feedback') || {}).textContent || '');
                        if (!/Correct/.test(fb)) fails.push(`${tag}: the right answer was not marked correct ("${fb.trim()}")`);
                        line.push(`quiz(instant) ${seen[seen.length - 1]} ${/Correct/.test(fb) ? 'correct' : 'NOT CORRECT'}`);
                    }
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
                }
            }
            console.log(`${(s + ' @' + w).padEnd(40)} ${line.join(' | ')}`);
        }
    }
    // "Help after a wrong answer: none" turns the ladder off (the card's own behaviour).
    if (HOSTS.includes('card')) {
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate(() => {
            window.setHelpAfterWrong('none');
            const st = window.state; st.quizMode = false; st.category = 'addition'; st.skill = 'add_facts'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
            window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
        });
        await sleep(400);
        await giveCard(page, 1);
        const r = await page.evaluate(LOOK, { host: 'card', sel: '#questionPaper' });
        if (r.n) fails.push('help "none": the ladder still ran');
        // worked example only
        await page.evaluate(() => {
            window.setHelpAfterWrong('worked');
            const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion();
        });
        await sleep(400);
        await giveCard(page, 1);
        const r2 = await page.evaluate(LOOK, { host: 'card', sel: '#questionPaper' });
        if (!(r2.worked && r2.ids.join() === 'worked')) fails.push(`help "worked": want the worked steps alone, got ${r2.ids.join('+')}`);
        await page.evaluate(() => window.setHelpAfterWrong('ladder'));
        console.log(`settings: none -> ${r.n ? 'LADDER' : 'off'}, worked -> ${r2.ids.join('+')}`);
    }
    const errs = app.problems.filter((p) => !/favicon|ERR_FILE_NOT_FOUND|net::/.test(p.text));
    errs.slice(0, 5).forEach((p) => fails.push(`console: ${p.type}: ${p.text}`));
    await app.close();
    if (fails.length) {
        fails.forEach((f) => console.log('  - ' + f));
        console.log('ws-support-ladder: FAIL');
        process.exit(1);
    }
    console.log('ws-support-ladder: OK');
})().catch((e) => { console.error(e); console.log('ws-support-ladder: FAIL'); process.exit(1); });
