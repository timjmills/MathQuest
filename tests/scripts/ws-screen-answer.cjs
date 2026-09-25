// Screen answer round-trip: on each screen host (the practice card, the online worksheet, the
// quiz) a pupil enters the RIGHT answer the way the cell asks for it - digits typed into the
// stack's boxes, list numbers tapped into a cloze, counters tapped into a ten frame, blocks
// tapped into a chart, a q R r typed into two boxes - and the host must mark it correct.
//
//   node tests/scripts/ws-screen-answer.cjs                       # the 24 redone skills
//   node tests/scripts/ws-screen-answer.cjs --skills addition:add,composing:base10_build
//   node tests/scripts/ws-screen-answer.cjs --hosts card,quiz
//   node tests/scripts/ws-screen-answer.cjs --family pv           # P9 place value, rounding, estimation
//
// Prints one line per skill and host, then `ws-screen-answer: OK` or `FAIL` (exit 1).
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const DEFAULT = [
    'counting:count_objects', 'counting:number_seq_fill', 'comparing:compare_groups', 'composing:number_bonds',
    'composing:hundreds_chart_fill', 'composing:ten_frame_build', 'composing:base10_build', 'addition:add_facts',
    'addition:add', 'addition:add_sub_fact_family', 'addition:add_wp_10', 'addition:number_line_add',
    'addition:cloze_addition', 'addition:add_column_multi', 'subtraction:subtract', 'subtraction:sub_5_pictures',
    'multiplication:mult_facts', 'multiplication:arrays_groups', 'multiplication:area_model_mult',
    'multiplication:mult_chart', 'division:div_facts', 'division:div_remainders', 'division:long_div_2digit',
    'division:share_into_groups',
];
// P9 place value / rounding / estimation (`--family pv`): one skill per response the family uses
// (a ring, a word, boxes per place, inline blanks, the disk mat, a sign, a check box, a table).
const PV = [
    'placevalue:identify', 'placevalue:value', 'placevalue:expand', 'placevalue:combine', 'placevalue:unit_form',
    'placevalue:compare', 'placevalue:more_less_10', 'placevalue:place_value_10x', 'placevalue:pv_disks_build',
    'number_sense:nearest_100', 'number_sense:between_tens', 'number_sense:rounding_table',
    'number_sense:estimate_sum', 'number_sense:estimate_diff',
];
const SKILLS = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const LIST = SKILLS.length ? SKILLS : arg('family', '') === 'pv' ? PV : DEFAULT;
const HOSTS = (arg('hosts', 'card,worksheet,quiz') || '').split(',');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// In the page: decide what the pupil does in one cell to give the right answer. Every target is
// tagged `data-sa="<n>"`; the plan is a list of {n, type: 'text', value} | {n, type: 'click'}.
function PLAN(rootSel, which) {
    const root = document.querySelector(rootSel);
    const st = window.state;
    const q = which.host === 'card' ? st.currentQ
        : which.host === 'worksheet' ? st.worksheetQs[which.i]
            : st.quizAllQuestions[st.quizOrder[st.quizQuestionIndex]].question.questionData;
    if (!root || !q) return { error: 'no cell' };
    let n = 0;
    const plan = [];
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const tag = (el, step) => { if (!el.dataset.sa) el.dataset.sa = String(++n + Math.floor(Math.random() * 1e6) * 100); plan.push({ sa: el.dataset.sa, ...step }); };
    const all = (sel) => Array.from(root.querySelectorAll(sel)).filter(vis);
    const parts = (ans) => (Array.isArray(ans) ? ans.map(String) : String(ans).split(/\s*,\s*|\s+R\s+/i)).map(s => s.trim());
    const ans = q.ans;

    // Working first, as a pupil does it (regrade 2): jump on the number line to the answer's
    // tick (run() then checks an arc was drawn), and write in long division's working rows. The
    // answer is still given below; the working must never change the verdict.
    const nl = all('.mq-nl-tick');
    if (nl.length) {
        const land = nl.find(t => t.querySelector('.mq-nl-lab') && t.querySelector('.mq-nl-lab').textContent.trim() === String(ans));
        if (land && !land.classList.contains('mq-nl-start')) tag(land, { type: 'click', check: 'nl' });   // + 0 has no jump
    }
    all('input.mq-opswork').slice(0, 2).forEach(w => tag(w, { type: 'text', value: '9', check: 'work' }));

    // the kit's model: tap boxes of the ten frame, or + under each base-ten zone
    const model = root.querySelector('[data-mq-model]');
    if (model && model.dataset.mqBuilt === '1') {
        const t = Number(model.dataset.mqTarget || q.target || ans);
        if (model.dataset.mqModel === 'ten-frame') { Array.from(model.querySelectorAll('td')).slice(0, t).forEach(c => tag(c, { type: 'click' })); return { plan, q: String(t) }; }
        const places = String(model.dataset.mqPlaces || '10,1').split(',').map(Number);
        const pairs = Array.from(model.querySelectorAll('.mq-b10pair'));
        let rest = t;
        places.forEach((p, i) => { const k = Math.floor(rest / p); rest -= k * p; const plus = pairs[i] && pairs[i].querySelector('[data-d="1"]'); for (let j = 0; j < k; j++) tag(plus, { type: 'click' }); });
        return { plan, q: String(t) };
    }
    // a build mat: tap counters into the frame / blocks into the chart
    const tfb = all('.tfb-cell');
    if (tfb.length) { const t = Number(q.target || ans); tfb.slice(0, t).forEach(c => tag(c, { type: 'click' })); return { plan, q: String(ans) }; }
    const b10 = all('.b10-palette-block');
    if (b10.length) {
        const t = Number(q.target || ans);
        const byPlace = (p) => b10.find(b => Number(b.dataset.place) === p);
        [[100, Math.floor(t / 100)], [10, Math.floor((t % 100) / 10)], [1, t % 10]].forEach(([p, k]) => {
            const b = byPlace(p);
            if (!b && k) { if (p === 100) { const ten = byPlace(10); for (let i = 0; i < k * 10; i++) tag(ten, { type: 'click' }); } return; }
            for (let i = 0; i < k; i++) tag(b, { type: 'click' });
        });
        return { plan, q: String(ans) };
    }
    // the place-value disk mat (P9 pv-build): tap each zone once per disk, then Submit. The tap
    // is dispatched on the zone itself: a mouse click at the zone's centre would land on a disk
    // already there and take it away, which is what the mat is meant to do.
    const pvz = all('.pvb-zone');
    if (pvz.length) {
        const t = Number(q.target || ans);
        pvz.forEach(z => { const p = Number(z.dataset.place); for (let j = 0; j < Math.floor(t / p) % 10; j++) tag(z, { type: 'domclick' }); });
        const sub = root.querySelector('.pvb-submit');
        if (sub) tag(sub, { type: 'domclick' });
        return { plan, q: String(t) };
    }
    // a choice (a printed word to ring, "Round up / Round down", a closest estimate): tap the one
    // whose text is the answer
    const choice = all('.answer-btn, .ws-mc-option, .mc-option');
    if (choice.length && (q.answerType === 'multiple-choice' || q.answerType === 'choice' || q.answerType === 'symbol')) {
        const want = String(ans).trim().toLowerCase();
        const hit = choice.find(b => b.textContent.trim().toLowerCase() === want);
        if (hit) { tag(hit, { type: 'click' }); return { plan, q: String(ans) }; }
    }
    // a printed "Check one box." list: tap the right row
    const rows = all('.mq-tickrow');
    if (rows.length && q.printAnswer) {
        const want = String(q.printAnswer).toLowerCase().trim();
        const row = rows.find(r => r.children[0].textContent.toLowerCase().trim() === want);
        if (row) tag(row, { type: 'click' });
        return { plan, q: String(q.printAnswer) };
    }
    // a stack: one digit per box, right-aligned
    const digits = all('input.column-answer-input, input.mq-qt-digit');
    if (digits.length) {
        const d = String(ans).replace(/[^0-9]/g, '');
        const pad = digits.length - d.length;
        digits.forEach((b, i) => { if (i >= pad) tag(b, { type: 'text', value: d.charAt(i - pad) }); });
        return { plan, q: String(ans) };
    }
    // expanded form (P9): one box per place, the zero part written 0
    const ex = all('input.expanded-input-box, input.ws-expanded-input');
    if (ex.length && Array.isArray(q.expandedValues)) {
        ex.forEach(c => { const v = q.expandedValues[Number(c.dataset.expandedIdx)]; tag(c, { type: 'text', value: String(v) }); });
        return { plan, q: String(ans) };
    }
    // several typed cells
    const ib = all('input.ib-cell');
    if (ib.length) { const set = q.inlineBlanksData.acceptedSets[0]; ib.forEach((c, i) => tag(c, { type: 'text', value: String(set[i]) })); return { plan, q: set.join(', ') }; }
    const gf = all('input.gf-cell');
    if (gf.length) {
        gf.forEach(c => { const cell = q.gridFill.cells.find(x => x.row === +c.dataset.row && x.col === +c.dataset.col && x.blank); tag(c, { type: 'text', value: String(cell.value) }); });
        return { plan, q: String(ans) };
    }
    const fam = all('input.fact-family-input, input.number-family-input, input.area-model-input, input.area-model-total');
    if (fam.length && fam.every(c => c.dataset.answer !== undefined)) { fam.forEach(c => tag(c, { type: 'text', value: c.dataset.answer })); return { plan, q: String(ans) }; }
    // a cloze: tap each list's right number
    const tiles = all('.mq-banktile');
    if (tiles.length) {
        parts(ans).forEach((v, k) => { const t = tiles.find(x => x.dataset.mqBankFor === String(k) && x.dataset.v === v); if (t) tag(t, { type: 'click' }); });
        return { plan, q: String(ans) };
    }
    const slots = all('input.mq-cellslot, input.cloze-cell');
    if (slots.length) {
        const sets = q.inlineBlanksData && q.inlineBlanksData.acceptedSets;
        const joinEl = slots[0].closest('[data-mq-join]');
        if (joinEl && joinEl.getAttribute('data-mq-join') === '') {
            // one digit per box (a quotient strip), right-aligned
            const d = String(ans).replace(/[^0-9]/g, ''); const pad = slots.length - d.length;
            slots.forEach((c, i) => { if (i >= pad) tag(c, { type: 'text', value: d.charAt(i - pad) }); });
            return { plan, q: d };
        }
        const vals = sets ? sets[0].map(String) : parts(ans);
        slots.forEach((c, i) => tag(c, { type: 'text', value: vals[i] }));
        return { plan, q: vals.join(', ') };
    }
    // one typed slot
    const one = all('input.mq-slot, input.qt-answer-input, input.worksheet-input, #answerInput, .ca-answer-input');
    if (one.length) {
        const d = String(ans);
        if (one[0].classList.contains('ca-answer-input')) {
            const ca = all('.ca-answer-input'); const dd = d.replace(/[^0-9]/g, ''); const pad = ca.length - dd.length;
            ca.forEach((b, i) => { if (i >= pad) tag(b, { type: 'text', value: dd.charAt(i - pad) }); });
        } else tag(one[0], { type: 'text', value: d });
        return { plan, q: d };
    }
    return { error: `no answer control (${q.answerType})` };
}

async function run(page, sel, which) {
    const r = await page.evaluate(PLAN, sel, which);
    if (r.error) return r;
    for (const step of r.plan) {
        const el = await page.$(`[data-sa="${step.sa}"]`);
        if (!el) return { error: `lost target ${step.sa}` };
        await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
        if (step.type === 'click') { await el.click(); await sleep(40); continue; }
        if (step.type === 'domclick') { await el.evaluate(e => e.click()); await sleep(40); continue; }
        await el.click({ clickCount: 3 });
        await el.evaluate(e => { e.value = ''; });
        await page.keyboard.type(step.value, { delay: 10 });
        await el.evaluate(e => e.dispatchEvent(new Event('change', { bubbles: true })));
    }
    if (r.plan.some(s => s.check === 'nl')) {
        const arcs = await page.evaluate(s => document.querySelectorAll(`${s} .mq-nl-arcs path`).length, sel);
        if (!arcs) return { error: 'tap-to-jump drew no arc' };
    }
    if (r.plan.some(s => s.check === 'work')) {
        const kept = await page.evaluate(s => Array.from(document.querySelectorAll(`${s} input.mq-opswork`)).filter(i => i.value === '9').length, sel);
        if (!kept) return { error: 'long-division working rows did not take a digit' };
    }
    return r;
}

const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    const fails = [];
    for (const s of LIST) {
        const [c, k] = s.split(':');
        const line = [];
        // a fresh page per skill: a right answer schedules the next question, and a timer left
        // over from one skill must not replace the next skill's item mid-entry
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        if (HOSTS.includes('card')) {
            await page.evaluate((c, k, seed) => {
                if (window.__wsReseed) window.__wsReseed(seed);
                const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
            }, c, k, hash(s + ':answer'));
            await sleep(500);
            const before = await page.evaluate(() => window.state.score || 0);
            const r = await run(page, '#questionPaper', { host: 'card' });
            await page.evaluate(() => { window.__saDone = true; });
            if (r.error) { line.push(`card ERR ${r.error}`); fails.push(`${s} card: ${r.error}`); }
            else {
                await sleep(150);
                const btn = await page.$('#qcCheckBtn.mq-show');
                if (btn && !(await page.evaluate(() => window.state.hasAnswered))) await btn.click();
                await sleep(500);
                const after = await page.evaluate(() => window.state.score || 0);
                const ok = after > before;
                line.push(`card ${ok ? 'ok' : 'WRONG'}`);
                if (!ok) fails.push(`${s} card: typed ${r.q}, not marked correct${btn ? '' : ' (no Check shown)'}`);
            }
        }
        // a celebration pop-up of the card (badge, level) would sit over the next host
        await sleep(300);
        await page.evaluate(() => {
            Array.from(document.body.querySelectorAll('*')).filter(e => { const cs = getComputedStyle(e); return cs.position === 'fixed' && Number(cs.zIndex) >= 1000 && e.getBoundingClientRect().width > innerWidth * 0.6 && e.getBoundingClientRect().height > innerHeight * 0.6; }).forEach(e => { e.style.display = 'none'; });
        });
        if (HOSTS.includes('worksheet')) {
            await page.evaluate((c, k, seed) => {
                if (window.__wsReseed) window.__wsReseed(seed);
                const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3;
                window.initWorksheet();
            }, c, k, hash(s + ':ws'));
            await sleep(700);
            const n = await page.evaluate(() => window.state.worksheetQs.length);
            let err = '';
            for (let i = 0; i < n; i++) {
                const r = await run(page, `#ws_card_${i} .ws-cell`, { host: 'worksheet', i });
                if (r.error) { err = `item ${i + 1}: ${r.error}`; break; }
                await sleep(80);
            }
            if (err) { line.push(`worksheet ERR ${err}`); fails.push(`${s} worksheet: ${err}`); }
            else {
                await sleep(500);
                const res = await page.evaluate(() => { window.checkAllWorksheet(); return document.getElementById('worksheetResult').textContent.replace(/\s+/g, ' ').trim(); });
                const m = res.match(/Score:\s*(\d+)\/(\d+)/);
                const ok = m && m[1] === m[2] && +m[2] > 0;
                line.push(`worksheet ${ok ? 'ok' : 'WRONG'} (${m ? `${m[1]}/${m[2]}` : res})`);
                if (!ok) fails.push(`${s} worksheet: ${res}`);
            }
            // the score pop-up covers the page; a pupil closes it before the next task
            await page.evaluate(() => { Array.from(document.body.children).filter(e => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach(e => e.remove()); });
        }
        if (HOSTS.includes('quiz')) {
            await page.evaluate((c, k, seed) => {
                const questions = [];
                for (let i = 0; i < 3; i++) {
                    const q = window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i });
                    questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
                }
                const test = { id: null, name: 'Answer', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
            }, c, k, hash(s + ':quizans'));
            await sleep(500);
            let err = '';
            for (let i = 0; i < 3; i++) {
                const r = await run(page, '#quizTakeView .qt-cell', { host: 'quiz' });
                if (r.error) { err = `Q${i + 1}: ${r.error}`; break; }
                await page.keyboard.press('Tab');
                await sleep(250);
                if (i < 2) { await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(350); }
            }
            if (err) { line.push(`quiz ERR ${err}`); fails.push(`${s} quiz: ${err}`); }
            else {
                await page.evaluate(() => window.showQuizReview && window.showQuizReview());
                await page.evaluate(async () => { await window.submitQuiz(); });
                await sleep(300);
                const res = await page.evaluate(() => { const r = window.state.currentQuizResult; return { score: r.score, total: r.totalPoints, answers: (r.answers || []).map(a => a.studentAnswer) }; });
                const ok = res.score === res.total && res.total > 0;
                line.push(`quiz ${ok ? 'ok' : 'WRONG'} (${res.score}/${res.total})`);
                if (!ok) fails.push(`${s} quiz: ${res.score}/${res.total} answers ${JSON.stringify(res.answers)}`);
            }
            await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
        }
        console.log(`${s.padEnd(34)} ${line.join(' | ')}`);
    }
    if (app.problems.length) fails.push(...app.problems.slice(0, 8).map(p => `[${p.type}] ${p.text}`));
    await app.close();
    if (fails.length) { console.log('\n' + fails.join('\n')); console.log('ws-screen-answer: FAIL'); process.exit(1); }
    console.log('ws-screen-answer: OK');
})().catch(e => { console.error(e); console.log('ws-screen-answer: FAIL'); process.exit(1); });
