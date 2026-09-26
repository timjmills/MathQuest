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
    // P10 time + money: the two-box time slot, the h / min slot, a coin count, the money slot,
    // a check-one-box decision and the fewest-coins table
    'measurement:time_quarter', 'measurement:elapsed_find_duration', 'measurement:money_count',
    'measurement:money_notation', 'measurement:enough_money', 'measurement:make_change_least_coins',
    // function tables (2026-09-25): one box per blank, a sign typed into the rule circle
    'algebra:function_table_easy', 'algebra:function_table_hard',
    // 2026-09-25: count by 1-12, number patterns, the chart to fill, x / ÷ on a number line
    'multiplication:count_by_tables', 'patterns:number_patterns_rule', 'multiplication:mult_chart_easy',
    'multiplication:nl_mult', 'division:nl_div',
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
const OPTS = (() => { const v = arg('opts', null); return v ? JSON.parse(v) : null; })();
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
        const land = nl.find(t => t.querySelector('.mq-nl-lab') && t.querySelector('.mq-nl-lab').textContent.trim().replace('\u2212', '-') === String(ans));
        if (land && !land.classList.contains('mq-nl-start')) tag(land, { type: 'click', check: 'nl' });   // + 0 has no jump
    }
    all('input.mq-opswork').slice(0, 2).forEach(w => tag(w, { type: 'text', value: '9', check: 'work' }));

    // a fraction model to shade (frac-model, O6 AP3): tap as many parts as the answer counts.
    // Dispatched on the part itself: a wedge's box centre can lie in the next wedge.
    const shadeParts = all('.shade-target');
    if (shadeParts.length && q.answerType === 'shade-parts') {
        const t = Number(q.shadeTarget != null ? q.shadeTarget : ans);
        shadeParts.slice(0, t).forEach(g => tag(g, { type: 'domclick' }));
        // the practice card grades the shading on its own Submit (question-render.js shade-parts)
        const sp = which.host === 'card' ? document.querySelector('.sp-submit') : null;
        if (sp && vis(sp)) tag(sp, { type: 'domclick' });
        return { plan, q: String(t) };
    }
    // put the number on the line (nl-place): tap each number tile, then its tick
    const nlpTicks = all('.mq-nlp-tick');
    const nlpPay = q.cell && q.cell.template === 'nl-place' ? q.cell.payload : null;
    if (nlpTicks.length && nlpPay) {
        const tiles = Array.from(root.querySelectorAll('[data-nlp-chip]'));
        nlpPay.chips.forEach((c, k) => {
            if (tiles[k]) tag(tiles[k], { type: 'domclick' });
            const t = nlpTicks.find(x => Number(x.dataset.i) === c.at);
            if (t) tag(t, { type: 'domclick' });
        });
        return { plan, q: String(ans) };
    }
    // a sign circle (frac-model, pv compare): tap the sign tile that is the answer
    const signTiles = all('.mq-signtile');
    if (signTiles.length) {
        const hit = signTiles.find(b => b.textContent.trim() === String(ans).trim());
        if (hit) { tag(hit, { type: 'click' }); return { plan, q: String(ans) }; }
    }
    // Round on a number line (round_nl_*): tap the line where the number is (the dot), then
    // write the rounded number in the one visible box. The dot's slot is hidden: only a tap fills it.
    const rl = all('.mq-rl');
    if (rl.length && q.inlineBlanksData) {
        const set = q.inlineBlanksData.acceptedSets[0].map(String);
        tag(rl[0], { type: 'rl', value: String(rl[0].dataset.mqRlN) });
        const box = all('input.ib-cell, input.mq-cellslot');
        if (!box.length) return { error: 'round line: no box for the rounded number' };
        tag(box[box.length - 1], { type: 'text', value: set[1] });
        return { plan, q: set.join(', ') };
    }

    // the kit's model: tap boxes of the ten frame, or + under each base-ten zone
    const model = root.querySelector('[data-mq-model]');
    if (model && model.dataset.mqBuilt === '1') {
        const t = Number(model.dataset.mqTarget || q.target || ans);
        if (model.dataset.mqModel === 'ten-frame') { Array.from(model.querySelectorAll('td')).slice(0, t).forEach(c => tag(c, { type: 'click' })); return { plan, q: String(t) }; }
        // a picture graph to build (AP2 round 6): draw each row's number of pictures, box by box
        if (model.dataset.mqModel === 'picture-build') {
            String(ans).split(',').map(Number).forEach((v, r) => Array.from(model.querySelectorAll(`[data-pb-row="${r}"]`)).slice(0, v)
                .forEach(g => tag(g, { type: 'domclick' })));
            return { plan, q: String(ans) };
        }
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
        // P10: a time `[ ]:[ ]`, an amount `[ ].[ ]` and a duration `[ ] h [ ] min` split the
        // answer at their own printed separator.
        const jn = joinEl ? joinEl.getAttribute('data-mq-join') : null;
        let vals = sets ? sets[0].map(String) : parts(ans);
        if (jn === ':' || jn === '.') vals = String(ans).split(jn);
        if (jn === ' h ') { const m = /(\d+)\s*h\s*(\d+)/.exec(String(ans)); if (m) vals = [m[1], m[2]]; }
        // a fraction [n]/[d], a mixed number [w] [n]/[d] (frac-model): the answer's own parts
        if (jn === '/' || jn === 'mixed') {
            const a = String(ans).trim();
            const m = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(a) || (/^\d+$/.test(a) ? [a, a] : []);
            vals = jn === '/' ? [m[2] || m[1] || '', m[3] || '1'] : [m[1] || '', m[2] || '', m[3] || ''];
            slots.forEach((c, i) => { if (vals[i]) tag(c, { type: 'text', value: vals[i] }); });
            return { plan, q: String(ans) };
        }
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
    // perimeter AND area (dual): one box each
    const dual = all('input.dual-answer-input');
    if (dual.length && q.dualAnswers) {
        dual.forEach(c => { const v = /area/i.test(c.id) ? q.dualAnswers.area : q.dualAnswers.perimeter; tag(c, { type: 'text', value: String(v) }); });
        return { plan, q: `P=${q.dualAnswers.perimeter}, A=${q.dualAnswers.area}` };
    }
    // read a point's coordinates (coord-input): ( x , y ) per point, then the card's own Check
    const cix = all('input.ci-x');
    if (cix.length && q.coordinateData && Array.isArray(q.coordinateData.points)) {
        const pts = q.coordinateData.points;
        cix.forEach(c => { const p = pts[Number(c.dataset.point)]; if (p) tag(c, { type: 'text', value: String(p.x) }); });
        all('input.ci-y').forEach(c => { const p = pts[Number(c.dataset.point)]; if (p) tag(c, { type: 'text', value: String(p.y) }); });
        const sub = root.querySelector('.ci-submit');
        if (sub && which.host === 'card') tag(sub, { type: 'domclick' });
        return { plan, q: pts.map(p => `(${p.x}, ${p.y})`).join(' ') };
    }
    // plot points (coord-plot): tap each lattice point, then Submit
    const hits = all('.cp-hit');
    if (q.answerType === 'coord-plot') {
        const pts = Array.isArray(ans) ? ans : [ans];
        const hitsAll = Array.from(root.querySelectorAll('.cp-hit'));
        pts.forEach(p => { const h = hitsAll.find(c => Number(c.dataset.x) === p.x && Number(c.dataset.y) === p.y); if (h) tag(h, { type: 'evclick' }); });
        const sub = root.querySelector('.cp-submit');
        if (sub) tag(sub, { type: 'domclick' });
        if (hits.length || hitsAll.length) return { plan, q: pts.map(p => `(${p.x}, ${p.y})`).join(' ') };
    }
    // a tick list ("Click ALL ..."): tap every right option, then Submit (multi-select-check)
    const msc = all('.msc-opt');
    if (msc.length && Array.isArray(ans)) {
        ans.forEach(id => { const o = msc.find(b => b.dataset.id === String(id)); if (o) tag(o, { type: 'click' }); });
        const sub = root.querySelector('.msc-submit');
        if (sub) tag(sub, { type: 'domclick' });
        return { plan, q: ans.join(', ') };
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
        if (step.type === 'domclick') { await el.evaluate(e => (e.click ? e.click() : e.dispatchEvent(new MouseEvent('click', { bubbles: true })))); await sleep(40); continue; }
        if (step.type === 'evclick') { await el.evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))); await sleep(60); continue; }
        if (step.type === 'rl') {
            // A real mouse tap on the line at the number's place (the kit's line geometry).
            const pt = await el.evaluate((e, v) => {
                const svg = e.querySelector('svg'); const r = svg.getBoundingClientRect();
                const w = +svg.dataset.rlW, h = +svg.dataset.rlH, pad = +svg.dataset.rlPad, len = +svg.dataset.rlLen, ax = +svg.dataset.rlAxis;
                const lo = +e.dataset.mqRlLo, hi = +e.dataset.mqRlHi;
                return { x: r.left + r.width * ((pad + len * (v - lo) / (hi - lo)) / w), y: r.top + r.height * (ax / h) };
            }, Number(step.value));
            await page.mouse.click(pt.x, pt.y);
            await sleep(60);
            const dotOn = await el.evaluate(e => { const d = e.querySelector('.mq-rl-dot'); return !!d && d.getAttribute('visibility') === 'visible'; });
            if (!dotOn) {
                const hit = await page.evaluate((x, y) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className}` : 'nothing'; }, pt.x, pt.y);
                return { error: `round line: the tap at (${Math.round(pt.x)}, ${Math.round(pt.y)}) placed no dot (it hit ${hit})` };
            }
            continue;
        }
        // A box can be briefly unclickable while the worksheet scrolls to the next card: focus it
        // instead, as a pupil's tap would, rather than abort the whole run.
        try { await el.click({ clickCount: 3 }); } catch (e) { await el.evaluate(x => x.focus()); }
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

const has = k => process.argv.includes('--' + k);

// The live green mark (screen-cell.js wireLiveCorrect), typed with the keyboard as a pupil does.
async function liveGreen(page) {
    const fails = [];
    const green = (sel) => page.evaluate((s) => { const el = document.querySelector(s); return el ? el.classList.contains('mq-live-correct') : null; }, sel);
    const typeInto = async (sel, text) => {
        await page.evaluate((s) => { const el = document.querySelector(s); if (el) { el.value = ''; el.focus(); } }, sel);
        await page.keyboard.type(text, { delay: 15 });
        await sleep(60);
    };
    const expect = (label, got, want) => { if (got !== want) fails.push(`live green: ${label}: ${got === null ? 'no such input' : got ? 'green' : 'not green'}, want ${want ? 'green' : 'not green'}`); };
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    // 1. a column addition that regroups: 47 + 38 = 85 (a ten is carried into the tens)
    await page.evaluate(() => {
        const st = window.state; st.quizMode = false; st.category = 'addition'; st.skill = 'add'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        window.showView('gameView');
        st.currentQ = { text: '47 + 38 = ?', ans: 85, answerType: 'number', options: [], hint: '', regroup: true,
            visual: '<div>Column Addition</div><input class="column-answer-input">' };
        window.renderQuestion();
    });
    await sleep(400);
    const carry = '#questionPaper input.mq-carry[data-ws-slot="regroup-1"]';
    const ones = '#questionPaper input.mq-digit[data-ws-slot="ans-0"]';
    const tens = '#questionPaper input.mq-digit[data-ws-slot="ans-1"]';
    await typeInto(carry, '2'); expect('regroup box, wrong digit 2', await green(carry), false);
    await typeInto(carry, '1'); expect('regroup box, right digit 1', await green(carry), true);
    await typeInto(ones, '5'); expect('ones digit 5', await green(ones), true);
    await typeInto(tens, '7'); expect('tens digit 7 (wrong)', await green(tens), false);
    // 2. a whole-number slot: 6 + 7 = [ ] turns green only at "13", never at "1"
    await page.evaluate(() => {
        const st = window.state; st.hasAnswered = false;
        st.currentQ = { text: '6 + 7 = ?', ans: 13, answerType: 'number', options: [], hint: '', visual: '' };
        window.renderQuestion();
    });
    await sleep(400);
    await typeInto('#answerInput', '1'); expect('whole answer, prefix "1" of 13', await green('#answerInput'), false);
    await page.keyboard.type('3', { delay: 15 }); await sleep(60);
    expect('whole answer "13"', await green('#answerInput'), true);
    await typeInto('#answerInput', '14'); expect('whole answer "14" (wrong)', await green('#answerInput'), false);
    // 3. a quiz: secret without instant feedback, green with it
    for (const fb of ['end', 'instant']) {
        await page.evaluate((fb) => {
            const q = { text: '6 + 7 = ?', ans: 13, answerType: 'number', options: [], hint: '', visual: '' };
            const test = { id: null, name: 'Live', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: 'add', points: 1, questionData: window.quizQuestionData(q) }] }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: fb, allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
            window.startQuizTest();
        }, fb);
        await sleep(500);
        await typeInto('#qtAnswerInput', '13');
        expect(`quiz with ${fb} feedback, "13"`, await green('#qtAnswerInput'), fb === 'instant');
        await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
    }
    return fails;
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
        // --opts '{"band":10}' (O6, 2026-09-25): the skill's options in the set's option store, which
        // the card, the online worksheet and the quiz all read, so a non-default value is answered too.
        if (OPTS) await page.evaluate((c, k, o) => { window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, o, { silent: true }); }, c, k, OPTS);
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
                // a DOM click: the button can re-lay out between the lookup and a mouse click (flake)
                if (btn && !(await page.evaluate(() => window.state.hasAnswered))) await btn.evaluate(b => { if (b.isConnected && b.classList.contains('mq-show')) b.click(); });
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
                if (!ok) {
                    // which cards: the answer type and the card's verdict class
                    const per = await page.evaluate(() => window.state.worksheetQs.map((q, i) => {
                        const c = document.getElementById(`ws_card_${i}`);
                        return `${i + 1}:${q.answerType}:${c ? (c.className.match(/\b(correct|incorrect|wrong)\b/) || ['?'])[0] : '?'}`;
                    }).join(' '));
                    fails.push(`${s} worksheet: ${res} [${per}]`);
                }
            }
            // the score pop-up covers the page; a pupil closes it before the next task
            await page.evaluate(() => { Array.from(document.body.children).filter(e => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach(e => e.remove()); });
        }
        if (HOSTS.includes('quiz')) {
            await page.evaluate((c, k, seed, opts) => {
                const questions = [];
                for (let i = 0; i < 3; i++) {
                    const q = window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i, ...(opts ? { opts } : {}) });
                    questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
                }
                const test = { id: null, name: 'Answer', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
            }, c, k, hash(s + ':quizans'), OPTS);
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
    // Green as soon as it is right (owner request 2026-09-25): a regroup box turns green on its
    // digit, a whole-number slot only once the whole number is in (never on a correct prefix),
    // nothing turns green for a wrong value, and a quiz without instant feedback stays secret.
    if (!has('no-live')) {
        const live = await liveGreen(page);
        console.log(`${'live green (card, quiz)'.padEnd(34)} ${live.length ? 'FAIL' : 'ok'}`);
        fails.push(...live);
    }
    if (app.problems.length) fails.push(...app.problems.slice(0, 8).map(p => `[${p.type}] ${p.text}`));
    await app.close();
    if (fails.length) { console.log('\n' + fails.join('\n')); console.log('ws-screen-answer: FAIL'); process.exit(1); }
    console.log('ws-screen-answer: OK');
})().catch(e => { console.error(e); console.log('ws-screen-answer: FAIL'); process.exit(1); });
