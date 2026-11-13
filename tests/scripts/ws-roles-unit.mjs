// ws-roles-unit - node unit checks of the SHARED page roles (lane lf-roles, 2026-11-13), no browser.
// Each check builds a role's cell around a planted item and reads the key it writes.
//
//   KEYJOIN-ROLE  a role's OWN answer slot (a frame line "The answer is ____", a Reason It answer, an Error Analysis fix)
//                 holds ONE value: a several-part answer ("12, 15, 18", the parts of a number pattern or a function table)
//                 is written one part a box, and a sentence answer ("The ones digits go 0, 2, 4, 6, 8.") is never written
//                 into a write line (PAGE_TYPES 6.1 "number blanks only"; RUBRIC H1; ws-cell-checks KEYJOIN, which found it on
//                 lf-algebra's pattern_features / function_table_easy / number_patterns_rule pages, lf-algebra r6).
//                 Control: a one-number answer keeps its one frame slot with the number in it.
//
//   REVIEW-TITLE  a Review budgets its body under the title it PRINTS ("Review: <topic>", measured by the bridge through
//                 input.titleLinesOf), never under a one-line "Review" (lf-algebra growing_shape_patterns Review L: the body
//                 ran 1.3 mm over under a two-line title). Also: "draw and count" titles as "drawing and counting".
//
//   MOD-ACROSS    a Scripted Model of a TALL state (a 74 mm function table) whose beside-text layout needs two pages lays its
//                 states 2 + 2 on one page, each step text over its state (fte Model M: two half-empty pages, text cells 60-80 %
//                 empty; EB-BAND / EB-SIDE). A one-page beside model keeps its layout.
//
//   INSTR-FOLLOWS a True or False? page whose statements all have sentence answers (no frame) does not say "Finish the
//                 sentence." (lf-roles critic r1 R1).
//   REVIEW-MIXED  a Review whose "Review: <topic>" title would wrap keeps its Mixed Review band (falls back to "Review";
//                 critic r1 R9: growing_shape_patterns Review L lost it).
//
//   KEY-TRUE-BLANK a True statement's key leaves the frame empty (PT-TOF-2; critic r1/r2 R5).
//
//   GUIDED-MODEL-SPAN a Guided page of narrow column stacks at S (4 columns, the ceiling 10 tries) whose plain grid the
//                 ceiling trims to Model + 7 (S 8 < M 9, ws-capacity-pin SIZE-ORDER; subtraction sub_50 / sub_100 no regroup,
//                 sub_2d_1d) lays the worked Model over TWO cells of row 1, its working written beside it, so Model + 10
//                 tries fill 3 whole rows (lead ruling (e), 2026-11-13). Control: at M (3 columns, 9 cells fill the grid)
//                 the Model keeps one cell.
//   GUIDED-STACK-SIDE a narrow column stack's Guided grid leaves under 30 % beside the stack (EB-SIDE), keeps S 11 / M 9 / L 6,
//                 fills every row (the Model spanning the cells that complete it) and centres each cell in its row (EB-BAND; r8b).
//   GUIDED-MODEL-ROW a Model whose worked lines run under it never makes the try beside it sit in a row it fills under 70 %
//                 (lf-builds chart_to_120 Guided M / L, EB-BAND 42 % / 36 %; r8b (a)).
//
//   node tests/scripts/ws-roles-unit.mjs [--only KEYJOIN-ROLE,REVIEW-TITLE,MOD-ACROSS,INSTR-FOLLOWS,REVIEW-MIXED,KEY-TRUE-BLANK,GUIDED-MODEL-SPAN,GUIDED-STACK-SIDE,GUIDED-MODEL-ROW]
// Last line `ws-roles-unit: OK (...)` / `ws-roles-unit: FAIL - n finding(s)`; exit 1 on FAIL.
// MQ_ROOT=<tree> checks another checkout's roles (ws-backtest commit-pair rows).
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mod = (rel) => import(pathToFileURL(path.join(ROOT, 'js/modules/sheet', rel)).href);
const { registerSkill } = await mod('contract.js');
const { resolveCtx } = await mod('tokens.js');
const TF = await mod('roles/true-false.js');
const RI = await mod('roles/reason-it.js');
const EA = await mod('roles/error-analysis.js');
const RV = await mod('roles/review.js');
const CO = await mod('roles/compose.js');
const SM = await mod('roles/scripted-model.js');
const PSC = await mod('roles/pre-skill-check.js');
const TS = await mod('roles/test.js');
const GD = await mod('roles/guided.js');

const argv = process.argv.slice(2);
const ONLY = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
const on = (id) => !ONLY || ONLY.includes(id);
const findings = [];
let checks = 0;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// planted skills: a sentence answer, a list answer, one number (control)
const PLANT = {
    prose: { ans: 'The ones digits go 0, 2, 4, 6, 8.', wrong: 'The ones digits go 1, 3, 5, 7, 9.' },
    proseopts: { ans: 'Every number is even.', wrong: 'Every number is odd.', options: ['Every number is even.', 'Every number is odd.', 'The numbers go odd, even.'] },
    list: { ans: '12, 15, 18', wrong: '12, 15, 19' },
    // LIST-HOMOGENEOUS: a count row's missing terms + its rule (number_patterns_rule; critic r2 N1)
    rule: { ans: '13, 15, 17, 2', wrong: '13, 15, 18, 2', payload: { ruleBox: { pre: 'Rule: add', post: 'each time', value: '2' } } },
    rule2: { ans: '4, 2', wrong: '5, 2', payload: { ruleBox: { pre: 'Rule: divide by', post: '', value: '2' } } },
    one: { ans: '42', wrong: '48' },
    // control: a unit form is written on its line (placevalue:unit_form, a passed skill) - it starts with a digit
    unit: { ans: '2 hundreds 1 ten 1 one', wrong: '1 hundred 2 tens 1 one' },
};
for (const [id, p] of Object.entries(PLANT)) {
    try { registerSkill(`rolesunit:${id}`, { wrongAnswer: () => ({ value: p.wrong, misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run in one process */ }
}
const itemOf = (id) => {
    const p = PLANT[id];
    const q = Object.assign({ categoryId: 'rolesunit', skillId: id, ans: p.ans, text: 'planted', answerType: 'text' }, p.options ? { options: p.options } : {}, p.payload ? { cell: { template: 'count-row', payload: p.payload } } : {});
    // the skill's own cell: its finished work as printed text, no slot of its own (the role's slots are what is checked)
    const render = (c, o = {}) => `<div class="ws-cell-work">${esc(o.shown !== undefined ? o.shown : (c.state === 'blank' ? '' : p.ans))}</div>`;
    return { q, key: { value: p.ans, display: p.ans, slots: {} }, render, template: 'planted', footprint: { wMm: 60, hMm: 30, maxCols: 2 }, fclass: 'standard' };
};
// the leaf slots of a key: [{id, text}] (a slot that holds other slots, or an open zone, is not one answer)
const leafSlots = (html) => {
    const out = [];
    const re = /<span\b([^>]*\bdata-ws-slot="([^"]+)"[^>]*)>([^<]*)<\/span>/g;
    for (let m = re.exec(html); m; m = re.exec(html)) if (!/data-ws-shape="open"/.test(m[1])) out.push({ id: m[2], text: m[3] });
    return out;
};
const JOIN = /\d\s*,\s+\d/;
const PROSE = /[A-Za-z]{2,}(\s+\S+){2,}/;

if (on('KEYJOIN-ROLE')) {
    const roles = [
        ['true-false', TF, (it) => TF.prepare(it, { wrong: true, index: 0, seed: 1 })],
        ['reason-it', RI, (it) => RI.prepare(it, { wrong: true, index: 0, seed: 1 })],
        ['error-analysis', EA, (it) => EA.prepare(it, { wrong: true, index: 0, seed: 1 })],
    ];
    for (const [role, , prep] of roles) for (const id of Object.keys(PLANT)) for (const size of ['S', 'M', 'L']) {
        checks++;
        const tag = `${role} ${id} ${size}`;
        let html;
        try {
            const it = prep(itemOf(id));
            if (!it) { if (!(role === 'error-analysis' && id === 'prose')) findings.push(`${tag}: the role dropped the planted item`); continue; }
            if (role === 'error-analysis' && id === 'prose') findings.push(`${tag}: a sentence answer with no choices kept on Error Analysis (no low-writing fix shape: skip it)`);
            html = it.render(resolveCtx({ size, state: 'answered' }), { cols: 2 });
            // the role's key short line is checked too: the slots are what a pupil fills
            const slots = leafSlots(html);
            for (const s of slots) {
                const t = s.text.replace(/&amp;/g, '&').trim();
                if (JOIN.test(t)) findings.push(`${tag}: key slot "${s.id}" holds "${t.slice(0, 30)}" - several answers in ONE slot (H1, KEYJOIN)`);
                else if (!(id === 'unit' && role === 'error-analysis') && PROSE.test(t) && !/^[✓]?$/.test(t)) findings.push(`${tag}: key slot "${s.id}" holds the sentence "${t.slice(0, 30)}" - a write line for a sentence (PAGE_TYPES 6.1 number blanks only)`);
            }
            if (id === 'one' && role === 'reason-it' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - no slot holds the one-number answer 42 (the frame was lost)`);
            if (id === 'one' && role === 'error-analysis' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - the fix slot does not hold 42`);
            if (id === 'unit' && role !== 'error-analysis' && slots.filter((s) => /^[12]$/.test(s.text.trim())).length !== 3) findings.push(`${tag}: a unit form answer is not written a number a line (its words printed after each)`);
            if (id === 'unit' && role !== 'error-analysis' && /\bten\b|\bone\b|\bhundred\b/.test(html.replace(/<[^>]+>/g, ' ').replace(/2 hundreds 1 ten 1 one|1 hundred 2 tens 1 one/g, ''))) findings.push(`${tag}: a frame word is singular - it gives the value away (FIX-WORDS)`);
            if (id === 'unit' && role !== 'error-analysis' && slots.some((s) => /[A-Za-z]{3}/.test(s.text))) findings.push(`${tag}: a unit form's words written into a slot`);
            if (id === 'list' && role === 'true-false' && slots.filter((s) => /^1[258]$/.test(s.text.trim())).length !== 3) findings.push(`${tag}: the list answer is not written one part a box`);
            if (id === 'rule' && role === 'true-false' && !/Rule: add <span[^>]*data-ws-slot="(?:tf|ri)-ans-3"[^>]*>2<\/span> each time/.test(html)) findings.push(`${tag}: the rule part of a list is not named "Rule: add [ ] each time" (LIST-HOMOGENEOUS)`);
            if (id === 'rule2' && role === 'true-false' && !/Rule: divide by <span[^>]*data-ws-slot="(?:tf|ri)-ans-1"/.test(html)) findings.push(`${tag}: a two-part answer's rule is not named (critic r3 D3)`);
            if (/^(list|rule|rule2)$/.test(id) && role === 'reason-it' && /data-ws-slot="ri-ans/.test(html)) findings.push(`${tag}: a Reason It list answer printed an answer frame (the named panel holds it; critic r3 D1/D2/D5)`);
            if (id === 'proseopts' && role === 'error-analysis' && !/data-ws-slot="ea-pick-\d"/.test(html)) findings.push(`${tag}: a sentence answer with choices is not fixed by checking the right one`);
            if (id === 'prose' && role === 'true-false' && /class="mq-frame/.test(html)) findings.push(`${tag}: a sentence answer printed a frame row (PT-TOF-4)`);
        } catch (e) { findings.push(`${tag}: ERROR ${String(e && e.stack || e).split('\n').slice(0, 2).join(' ')}`); }
    }
}

if (on('REVIEW-TITLE')) {
    checks += 2;
    const iCan = 'I Can draw and count the next term of a growing pattern';
    const t = CO.topicOf(iCan);
    if (t !== 'drawing and counting the next term of a growing pattern') findings.push(`REVIEW-TITLE: topicOf("${iCan}") = "${t}" (want "drawing and counting ...")`);
    const asked = [];
    const it = Object.assign(itemOf('one'), { pool: 'main' });
    try {
        RV.plan({ ctx: { size: 'L' }, skills: [{ categoryId: 'rolesunit', skillId: 'one', iCan, grade: 4 }], items: [it, it, it, it, it, it].map((x) => Object.assign({}, x)), titleLinesOf: (txt) => { asked.push(txt); return 2; } });
    } catch (e) { findings.push(`REVIEW-TITLE: plan ERROR ${String(e && e.message || e).slice(0, 120)}`); }
    if (!asked.some((x) => /^Review: /.test(x))) findings.push(`REVIEW-TITLE: the Review never measured its printed title "Review: <topic>" (asked: ${JSON.stringify(asked).slice(0, 80)})`);
}

if (on('MOD-ACROSS')) {
    const steps = ['The rule is n + 1: add 1.', '1 + 1 = 2. Write 2.', '6 + 1 = 7. Write 7.', 'Fill in every row the same way.'];
    try { registerSkill('rolesunit:tall', { workedSteps: () => steps.map((text) => ({ text })) }); } catch (e) { /* re-run */ }
    for (const [id, hMm, want] of [['tall', 74, 1], ['short', 30, 1]]) {
        checks++;
        const it = Object.assign(itemOf('one'), { pool: 'main', footprint: { wMm: 70, hMm, maxCols: 2 } });
        it.q = Object.assign({}, it.q, { skillId: 'tall' });
        try {
            const pl = SM.plan({ ctx: { size: 'M' }, skills: [{ categoryId: 'rolesunit', skillId: 'tall', iCan: 'I Can use a rule', grade: 4 }], items: [it] });
            const pages = (pl.pages || []).length;
            if (pages !== want) findings.push(`MOD-ACROSS ${id} (${hMm} mm state): the 4-state Model takes ${pages} pages (want ${want})`);
        } catch (e) { findings.push(`MOD-ACROSS ${id}: plan ERROR ${String(e && e.message || e).slice(0, 120)}`); }
    }
}

const pageText = (pl) => JSON.stringify(pl);
if (on('MOD-MARKS')) {
    // PT-MOD-1 (lf-algebra r8 via the lead): a function table's Model states carry the marks of steps 1..k (traceSlots), and its
    // five states lay 3 + 2 on one page (states 1-3 drew the same blank table over three pages)
    checks++;
    const steps5 = ['The rule is n + 1.', '1 + 1 = 2. Write 2.', '6 + 1 = 7. Write 7.', '14 + 1 = 15. Write 15.', 'Fill in every row.'];
    const mk = [[], [{ slot: 'o0', value: '2' }], [{ slot: 'o1', value: '7' }], [{ slot: 'o2', value: '15' }], [{ slot: 'o3', value: '19' }]];
    try { registerSkill('rolesunit:ftmod', { workedSteps: () => steps5.map((text, i) => ({ text, marks: mk[i] })) }); } catch (e) { /* re-run */ }
    const seen = [];
    const it = Object.assign(itemOf('one'), { pool: 'main', footprint: { wMm: 50, hMm: 64, maxCols: 3 } });
    it.q = Object.assign({}, it.q, { skillId: 'ftmod', cell: { template: 'function-table', payload: {} } });
    const r0 = it.render;
    it.render = (c, o = {}) => { if (o.payload && o.payload.traceSlots) seen.push(Object.keys(o.payload.traceSlots).length); return r0(c, o); };
    try {
        const pl = SM.plan({ ctx: { size: 'M' }, skills: [{ categoryId: 'rolesunit', skillId: 'ftmod', iCan: 'I Can use a rule', grade: 4 }], items: [it] });
        const html = JSON.stringify(pl);
        if ((pl.pages || []).length !== 1) findings.push(`MOD-MARKS: a 5-state function-table Model takes ${(pl.pages || []).length} pages (want 1, 3 + 2)`);
        void html;
    } catch (e) { findings.push(`MOD-MARKS: plan ERROR ${String(e && e.message || e).slice(0, 120)}`); }
    const mm = typeof SM.marksFor === 'function' ? SM.marksFor(it, steps5) : null;
    const sizes = mm ? mm.map((x) => Object.keys(x).length) : [];
    if (sizes.join(',') !== '0,1,2,3,4') findings.push(`MOD-MARKS: the states do not carry the marks of steps 1..k (traceSlots sizes ${JSON.stringify(sizes)})`);
    // MOD-MARKS-INK (critic r5b D2, PT-MOD-1 / P-LC-9): earlier steps' marks print black, ONLY the newest step's are trace grey,
    // so each state names its own new slots - and a final "fill in every row" that re-marks the earlier answers adds only the new one
    const mk2 = mk.slice(0, 4).concat([[{ slot: 'o0', value: '2' }, { slot: 'o1', value: '7' }, { slot: 'o2', value: '15' }, { slot: 'o3', value: '19' }]]);
    try { registerSkill('rolesunit:ftmod2', { workedSteps: () => steps5.map((text, i) => ({ text, marks: mk2[i] })) }); } catch (e) { /* re-run */ }
    const it2 = Object.assign({}, it, { q: Object.assign({}, it.q, { skillId: 'ftmod2' }) });
    const mm2 = typeof SM.marksFor === 'function' ? SM.marksFor(it2, steps5) : null;
    const fresh = mm2 ? mm2.map((x) => JSON.stringify(x.__new || null)) : [];
    if (fresh.join('|') !== '[]|["o0"]|["o1"]|["o2"]|["o3"]') findings.push(`MOD-MARKS-INK: each Model state must name only its own new marks (grey; the earlier ones black) - got ${fresh.join(' ')}`);
}
if (on('PSC-2PG-BALANCE')) {
    // lead ruling R13 (2026-11-13): a Pre-skill Check at L may run to 2 pages - balanced (2 + 2 for four prerequisites), never a
    // page of one item, no prerequisite dropped, the FULL header (name, date, score, title) on every page, the key the same pages
    checks++;
    for (const hMm of [56, 62, 70]) {
        const items = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) items.push(Object.assign(itemOf('one'), { pool: `q${i}`, footprint: { wMm: 150, hMm, maxCols: 1 } }));
        let pl = null;
        try { pl = PSC.plan({ ctx: { size: 'L' }, skills: [{ categoryId: 'rolesunit', skillId: 'one', iCan: 'I Can add', grade: 2 }], items, seed: 1 }); }
        catch (e) { findings.push(`PSC-2PG-BALANCE: plan ERROR ${String(e && e.message || e).slice(0, 120)}`); continue; }
        const pages = pl.pages || [];
        const bandsOf = (pg) => (pg.sections || []).filter((x) => x.kind === 'band' || x.kind === 'row').length;
        const counts = pages.map(bandsOf);
        if (counts.reduce((a, b) => a + b, 0) !== 4) findings.push(`PSC-2PG-BALANCE: h ${hMm} - ${counts.reduce((a, b) => a + b, 0)} of 4 prerequisites printed`);
        if (pages.length === 2 && Math.abs(counts[0] - counts[1]) > 0) findings.push(`PSC-2PG-BALANCE: h ${hMm} - two pages split ${counts.join(' + ')} (want 2 + 2)`);
        if (pages.length > 2) findings.push(`PSC-2PG-BALANCE: h ${hMm} - ${pages.length} pages (want at most 2)`);
        pages.slice(1).forEach((pg, i) => { const h = pg.header || {}; if (!h.title || h.score === false || h.date === false) findings.push(`PSC-2PG-BALANCE: h ${hMm} - page ${i + 2} prints the short header (title "${h.title || ''}", date ${h.date}, score ${h.score}); every page gets the full header`); });
    }
}
if (on('RI-ONEANSWER')) {
    // lead ruling F8 (2026-11-13, PT-RSN-4 "Circle A or B. The answer is __."): one Reason It item asks for the answer ONCE - the
    // A / B choice plus at most one answer frame; no "__ is correct." line repeating the choice
    checks++;
    const ctx = resolveCtx({ size: 'M' });
    for (const id of ['one', 'list', 'unit', 'prose']) {
        const p = RI.prepare(itemOf(id), { seed: 1, index: 0 });
        if (!p) continue;
        const html = p.render(Object.assign({}, ctx, { state: 'key' }), { cols: 1 });
        const frames = (html.match(/The answer is/g) || []).length;
        if (/is correct\./.test(html)) findings.push(`RI-ONEANSWER: ${id} - the item still asks "__ is correct." after the A / B circle`);
        if (frames > 1) findings.push(`RI-ONEANSWER: ${id} - ${frames} answer frames (want at most 1)`);
        const slots = Object.keys((p.key && p.key.slots) || {}).filter((k) => !/^ri-[ab]$/.test(k) && !/^ri-ans/.test(k));
        if (slots.length) findings.push(`RI-ONEANSWER: ${id} - extra answer slots ${slots.join(', ')}`);
    }
}
if (on('RI-LAYOUT')) {
    // critic r6c D1 / D3 (lead ruling 2026-11-13): Reason It work that fits half the cell keeps A and B SIDE BY SIDE (the response a
    // full-width row under them) - stacking it held one item a page (H5); only work wider than half the cell stacks, from the top
    checks++;
    const ctx = resolveCtx({ size: 'M' });
    const lay = (wMm) => {
        const it = Object.assign(itemOf('one'), { template: 'stack', footprint: { wMm, hMm: 40, maxCols: 1 } });
        const p = RI.prepare(it, { seed: 1, index: 0 });
        const h = p ? p.render(Object.assign({}, ctx, { state: 'blank' }), { cols: 1 }) : '';
        return /grid-template-columns:1fr 1fr/.test(h) ? 'under' : /grid-template-columns:1fr minmax\(52mm,auto\)/.test(h) ? (/margin-top:0/.test(h) ? 'stacked-top' : 'stacked') : 'beside';
    };
    const want = { 40: 'beside', 70: 'under', 85: 'under', 100: 'stacked-top' };
    for (const [w, k] of Object.entries(want)) { const got = lay(Number(w)); if (got !== k) findings.push(`RI-LAYOUT: work ${w} mm lays out ${got} (want ${k})`); }
    // (a true ink width is held to the panel's INNER width: 61 mm of compare ink crossed the box rules beside, lf-placevalue)
    const inkLay = (inkWMm) => {
        const it = Object.assign(itemOf('one'), { template: 'pv', footprint: { wMm: 40, inkWMm, hMm: 30, maxCols: 1 } });
        const p = RI.prepare(it, { seed: 1, index: 0 });
        const h = p ? p.render(Object.assign({}, ctx, { state: 'blank' }), { cols: 1 }) : '';
        return /grid-template-columns:1fr 1fr/.test(h) ? 'under' : 'beside';
    };
    if (inkLay(61.2) !== 'under') findings.push(`RI-LAYOUT: 61.2 mm of ink beside a 57.5 mm panel lays out ${inkLay(61.2)} (want under)`);
    if (inkLay(50) !== 'beside') findings.push(`RI-LAYOUT: 50 mm of ink lays out ${inkLay(50)} (want beside)`);
}
if (on('LINE-TELL')) {
    // lf-roles r10 (a key's "hundreds" past a 2-digit line; then "no" on a short line beside "yes" on a long one): a word answer's
    // line is one width, whatever the word, so its length never tells which word is right - and it holds the longest word
    checks++;
    const ws = ['no', 'yes', 'ones', 'tens', 'hundreds', 'thousands'].map((w) => CO.answerPlace('x', w).digits);
    if (new Set(ws).size !== 1) findings.push(`LINE-TELL: word answers get lines of ${ws.join(' / ')} digits (want one width)`);
    if (Math.min(...ws) < 6) findings.push(`LINE-TELL: a word answer's line is ${Math.min(...ws)} digits (want 6, the longest word)`);
    // (critic r6d E1: a number line holds the longer of the right and the wrong answer - 29 on a 2-digit line ruled out a shown 141)
    const nd = CO.answerPlace('x', '29', null, ['141']).digits;
    if (nd !== 3) findings.push(`LINE-TELL: the answer 29 against a shown wrong 141 gets a ${nd}-digit line (want 3: the longer of the two)`);
}
if (on('EA-REDO-ALIGN')) {
    // lf-algebra critic r2 G2: an Error Analysis REDO item (a count row written again under itself) starts its pupil work at the
    // cell's left like the redraw zone under it - the widened work centred the train 60 px right of its copy
    checks++;
    const ctx = resolveCtx({ size: 'L' });
    const it = Object.assign(itemOf('rule'), { template: 'count-row', footprint: { wMm: 90, hMm: 30, maxCols: 1 } });
    const p = EA.prepare(it, { seed: 1, index: 0, wrong: true });
    if (!p) findings.push('EA-REDO-ALIGN: the planted count-row item was not dealt');
    else {
        const h = p.render(Object.assign({}, ctx, { state: 'blank' }), { cols: 1, workW: 90 });
        const m = /class="mq-judge-work" style="([^"]*)"/.exec(h);
        if (!m) findings.push('EA-REDO-ALIGN: no pupil-work block rendered');
        else if (/align-items:center/.test(m[1])) findings.push(`EA-REDO-ALIGN: a redo item's widened work is centred (${m[1].slice(0, 80)}) - its copy starts at the left`);
    }
}
if (on('TEST-LEVEL')) {
    // lf-algebra r8 (via the lead): a Test lays its items out at scaffold level 0, so the bridge measures them at level 0 - measured at
    // level 1 (the default), a function table's heights were the guided ones and the Test page planned the wrong rows
    checks++;
    const lv = typeof TS.MEASURE_LEVEL === 'function' ? TS.MEASURE_LEVEL() : TS.MEASURE_LEVEL;
    if (lv !== 0) findings.push(`TEST-LEVEL: the Test role measures its items at level ${lv} (want 0, the level it lays them out at)`);
}
if (on('FIX-MINIMAL')) {
    // lead ruling N9 (2026-11-13): an item carries exactly ONE error - a list's later parts follow the correct rule, so the fix
    // changes one part (a propagated wrong "12, 15, 19, 22" against "12, 15, 18, 21" made the pupil rewrite every later term)
    checks++;
    try { registerSkill('rolesunit:prop', { wrongAnswer: () => ({ value: '12, 15, 19, 22', misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run */ }
    const it = itemOf('one');
    it.q = Object.assign({}, it.q, { skillId: 'prop', ans: '12, 15, 18, 21' });
    const w = CO.wrongOf(it);
    const diff = w ? String(w.value).split(/,\s*/).filter((v, i) => v !== ['12', '15', '18', '21'][i]).length : -1;
    if (diff !== 1) findings.push(`FIX-MINIMAL: the shown wrong list "${w && w.value}" differs from the answer in ${diff} parts (want exactly 1)`);
}
if (on('KEY-TRUE-BLANK')) {
    // PT-TOF-2 (critic r1/r2 R5): a True statement's key leaves the frame empty; a False one fills it
    for (const [wrong, want] of [[false, ''], [true, '42']]) {
        checks++;
        const it = TF.prepare(itemOf('one'), { wrong, index: 0, seed: 1 });
        const html = it.render(resolveCtx({ size: 'M', state: 'answered' }), { cols: 2 });
        const v = (leafSlots(html).find((x) => x.id === 'tf-ans') || {}).text;
        if (String(v || '').trim() !== want) findings.push(`KEY-TRUE-BLANK: a ${wrong ? 'False' : 'True'} statement's key frame holds "${v}" (want "${want}")`);
    }
}
if (on('INSTR-FOLLOWS')) {
    checks++;
    try {
        const its = [0, 1, 2, 3].map((i) => TF.prepare(itemOf('prose'), { wrong: i % 2 === 0, index: i, seed: 1 })).filter(Boolean).map((x) => Object.assign(x, { pool: 'main' }));
        const pl = TF.plan({ ctx: { size: 'M' }, skills: [{ categoryId: 'rolesunit', skillId: 'prose', iCan: 'I Can find what a pattern shows', grade: 4 }], items: its });
        if (/Finish the sentence/.test(pageText(pl))) findings.push('INSTR-FOLLOWS: an all-sentence True or False? page still says "Finish the sentence."');
    } catch (e) { findings.push(`INSTR-FOLLOWS: ERROR ${String(e && e.message || e).slice(0, 120)}`); }
}
if (on('REVIEW-MIXED')) {
    checks++;
    const iCan = 'I Can draw and count the next term of a growing pattern';
    const main = [0, 1, 2, 3, 4, 5].map(() => Object.assign(itemOf('one'), { pool: 'main' }));
    const earlier = [0, 1, 2, 3].map(() => Object.assign(itemOf('one'), { pool: 'earlier' }));
    try {
        const pl = RV.plan({ ctx: { size: 'L' }, skills: [{ categoryId: 'rolesunit', skillId: 'one', iCan, grade: 4 }], items: [...main, ...earlier], titleLinesOf: (t) => (t.length > 50 ? 2 : 1) });
        const t = pageText(pl);
        if (!/Mixed Review/.test(t)) findings.push('REVIEW-MIXED: the Review lost its Mixed Review band under a title that wraps');
        if (/Review: drawing and counting the next term of/.test(t)) findings.push('REVIEW-MIXED: a title that wraps was printed');
        if (!/Review: drawing and counting the next term/.test(t)) findings.push('REVIEW-MIXED: the topic was dropped (want it shortened at a phrase break, critic r3 D4)');
        // N5: the title is decided at L for every size (a title that wraps at L is "Review" at S too)
        checks++;
        const plS = RV.plan({ ctx: { size: 'S' }, skills: [{ categoryId: 'rolesunit', skillId: 'one', iCan, grade: 4 }], items: [...main, ...earlier], titleLinesOf: (t2, z) => ((z || 'S') === 'L' && t2.length > 50 ? 2 : 1) });
        if (/next term of a growing/.test(pageText(plS))) findings.push('REVIEW-MIXED: S printed the long topic title that L cannot hold (one title at every size, PT-FRM-6)');
    } catch (e) { findings.push(`REVIEW-MIXED: ERROR ${String(e && e.message || e).slice(0, 120)}`); }
}

if (on('GUIDED-MODEL-SPAN')) {
    // lead ruling (e) 2026-11-13 (ws-capacity-pin SIZE-ORDER on Guided: three subtraction stack pages printed S 8 < M 9): a planted
    // column stack (24 mm wide, 38 mm tall: 3 columns leave 31 % beside it, 4 columns hold it) with worked steps of its own
    try {
        registerSkill('rolesunit:gspan', {
            workedSteps: () => [{ text: 'Ones: 8 − 3 = 5. Write 5.' }, { text: 'Tens: 4 − 2 = 2. Write 2.' }, { text: 'The answer is 25.' }, { text: 'Check: 25 + 23 = 48.' }],
            wrongAnswer: () => ({ value: '35', misconception: 'planted', basis: 'rule' }),
        });
    } catch (e) { /* re-run */ }
    const stackItem = (i, size) => {
        const h = { S: 38, M: 46.9, L: 55.7 }[size];
        const q = { categoryId: 'rolesunit', skillId: 'gspan', ans: '25', text: `48 − 23 = ?`, answerType: 'number', seed: i, cell: { template: 'stack', payload: {} } };
        const render = (c, o = {}) => `<div class="ws-cell-work">48<br>− 23<br>${esc(o.shown !== undefined ? o.shown : (c.state === 'blank' ? '' : '25'))}</div>`;
        const measured = Object.fromEntries([1, 2, 3, 4, 5].map((c) => [c, { hMm: h, fits: true, slackMm: (186 / c - 24) / 2 }]));
        return { q, key: { value: '25', display: '25', slots: {} }, render, template: 'stack', pool: 'main', measured, footprint: { wMm: 24, hMm: h, maxCols: 4 }, fclass: 'standard' };
    };
    for (const [size, want, span] of [['S', 11, true], ['M', 9, false]]) {
        checks++;
        try {
            const input = { ctx: { size }, skills: [{ categoryId: 'rolesunit', skillId: 'gspan', iCan: 'I Can subtract in columns', grade: 2 }], items: Array.from({ length: 16 }, (_, i) => stackItem(i, size)) };
            const pl = GD.plan(input);
            const n = pl && pl.meta && pl.meta.items;
            const html = (pl.pages || []).map((pg) => (pg.sections || []).map((s) => (s.content && s.content.items ? s.content.items.map((c) => `<i style="${c.style || ''}">${c.render ? c.render(Object.assign({}, resolveCtx({ size }), { state: 'blank' })) : ''}</i>`).join('') : '')).join('')).join('');
            const hasSpan = /grid-column:\s*span 2/.test(html);
            if (n !== want) findings.push(`GUIDED-MODEL-SPAN ${size}: the page holds ${n} cells (want ${want}: ${span ? 'the Model over two cells + 10 tries, 3 whole rows' : 'Model + 8, 3 whole rows'})`);
            if (hasSpan !== span) findings.push(`GUIDED-MODEL-SPAN ${size}: the Model ${hasSpan ? 'spans' : 'does not span'} two cells (want ${span ? 'two' : 'one'})`);
            if (span && hasSpan && !/Ones: 8 − 3 = 5\./.test(html)) findings.push(`GUIDED-MODEL-SPAN ${size}: the two-cell Model has no working beside it (an empty band either side of the stack, EB-SIDE)`);
            if (span && /Write 5/.test(html)) findings.push(`GUIDED-MODEL-SPAN ${size}: the working beside the Model repeats "Write 5." (the traced digit says it)`);
        } catch (e) { findings.push(`GUIDED-MODEL-SPAN ${size}: ERROR ${String(e && e.stack || e).split('\n').slice(0, 2).join(' ')}`); }
    }
}

if (on('GUIDED-STACK-SIDE')) {
    // lf-roles r8b (coordinator via the lead: the stack Guided pages of the 7 subtraction skills failed EB-SIDE at S 32.4 % / M 31.7 %
    // and EB-BAND at L 34.8 %): a planted 16 mm column stack (S/M/L heights of sub_50) is laid in a column count whose side band is
    // under 30 % of the cell (the measured slack beside it), keeps its capacity (S 11, M 9, L >= 6), every row full, and its cells
    // centred in their rows
    try { registerSkill('rolesunit:gside', { workedSteps: () => [{ text: 'Ones: 8 − 3 = 5. Write 5.' }, { text: 'Tens: 4 − 2 = 2. Write 2.' }, { text: 'The answer is 25.' }, { text: 'Check: 25 + 23 = 48.' }], wrongAnswer: () => ({ value: '35', misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run */ }
    const W = { S: 16.2, M: 22.5, L: 28.4 };
    const item = (i, size) => {
        const h = { S: 38, M: 46.9, L: 55.7 }[size];
        const q = { categoryId: 'rolesunit', skillId: 'gside', ans: '25', text: '48 − 23 = ?', answerType: 'number', seed: i, cell: { template: 'stack', payload: {} } };
        const render = (c, o = {}) => `<div class="ws-cell-work">48<br>− 23<br>${esc(o.shown !== undefined ? o.shown : (c.state === 'blank' ? '' : '25'))}</div>`;
        const measured = Object.fromEntries([1, 2, 3, 4, 5].map((c) => [c, { hMm: h, fits: true, slackMm: (186 / c - 0.5 - W[size]) / 2 }]));
        return { q, key: { value: '25', display: '25', slots: {} }, render, template: 'stack', pool: 'main', measured, footprint: { measure: true, wMm: null, maxCols: 6 }, fclass: 'standard' };
    };
    for (const [size, want] of [['S', 11], ['M', 9], ['L', 6]]) {
        checks++;
        try {
            const pl = GD.plan({ ctx: { size }, skills: [{ categoryId: 'rolesunit', skillId: 'gside', iCan: 'I Can subtract in columns', grade: 2 }], items: Array.from({ length: 16 }, (_, i) => item(i, size)) });
            const f = pl.meta.fits[0];
            const side = (186 / f.cols - 0.5 - W[size]) / 2 / (186 / f.cols - 0.5);
            const parts = (pl.pages || []).flatMap((pg) => (pg.sections || []).map((s) => s.content).filter((c) => c && c.items));
            const cells = parts.flatMap((c) => c.items);
            const span = cells.reduce((a, c) => { const m = /grid-column:\s*span\s+(\d+)/.exec(c.style || ''); return a + (m ? Number(m[1]) - 1 : 0); }, 0);
            if (side >= 0.30) findings.push(`GUIDED-STACK-SIDE ${size}: ${f.cols} columns leave ${(side * 100).toFixed(1)} % beside the stack (EB-SIDE, want < 30 %)`);
            if (pl.meta.items < want) findings.push(`GUIDED-STACK-SIDE ${size}: ${pl.meta.items} cells (want at least ${want}: capacity and SIZE-ORDER kept)`);
            if ((cells.length + span) % f.cols !== 0) findings.push(`GUIDED-STACK-SIDE ${size}: ${cells.length} cells + ${span} spanned in ${f.cols} columns leave a part row`);
            if (cells.some((c) => !/justify-content:center/.test(c.style || ''))) findings.push(`GUIDED-STACK-SIDE ${size}: a stack cell is not centred in its row (EB-BAND under a stretched row)`);
        } catch (e) { findings.push(`GUIDED-STACK-SIDE ${size}: ERROR ${String(e && e.stack || e).split('\n').slice(0, 2).join(' ')}`); }
    }
}

if (on('GUIDED-MODEL-ROW')) {
    // lf-roles r8b (a), via the lead: lf-builds chart_to_120 Guided M / L - the Model (a chart window, its one worked line wrapped
    // UNDER it: no full-row Model, which would push the third try off the page) shared row 1 with a 60 mm try, and the row stretch
    // made that row 115 mm: a 42 % / 36 % band beside the try (EB-BAND). The Model's row is held to what the tries beside it fill
    // (at least 70 %), never under the Model's own height. Planted: 60 mm items, one 88-character worked line.
    const line = 'Count on from 47 along the row: 48, 49, 50, then down the column.';
    try { registerSkill('rolesunit:grow', { workedSteps: () => [{ text: line }], wrongAnswer: () => ({ value: '58', misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run */ }
    const item = (i) => {
        const q = { categoryId: 'rolesunit', skillId: 'grow', ans: '57', text: 'Fill in the chart.', answerType: 'number', seed: i };
        const render = (c, o = {}) => `<div class="ws-cell-work">chart ${esc(o.shown !== undefined ? o.shown : (c.state === 'blank' ? '' : '57'))}</div>`;
        const measured = Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: 60, fits: c <= 2, slackMm: 6 }]));
        return { q, key: { value: '57', display: '57', slots: {} }, render, template: 'planted', pool: 'main', measured, footprint: { measure: true, wMm: null, maxCols: 2 }, fclass: 'standard' };
    };
    for (const size of ['M', 'L']) {
        checks++;
        try {
            const pl = GD.plan({ ctx: { size }, skills: [{ categoryId: 'rolesunit', skillId: 'grow', iCan: 'I Can count on a chart', grade: 1 }], items: Array.from({ length: 12 }, (_, i) => item(i)) });
            const part = (pl.pages[0].sections || []).map((s) => s.content).find((c) => c && c.items);
            const cols = part.cols;
            const own = part.spanFirst || new RegExp(`grid-column:\\s*(1 / -1|span ${cols})`).test(part.items[0].style || '');
            const fr = part.rowsTpl ? part.rowsTpl.split(/\s+/).map((t) => parseFloat(t)) : Array(part.rows).fill(1);
            const gridH = parseFloat(part.height);
            const row0 = (gridH * fr[0]) / fr.reduce((a, b) => a + b, 0);
            // (the try beside the Model needs tryRowMm - 61 mm and its hint - and the Model modelRowMm; the row may be as tall as the
            // Model needs, never stretched so the try fills under 70 % of it; a tree without these fields reads 61 mm and no Model need)
            const f0 = pl.meta.fits[0];
            const tryMm = Number(f0.tryRowMm) || 61;
            const need = Math.max(Number(f0.modelRowMm) || 0, tryMm / 0.7);
            if (cols > 1 && !own && part.items.length > 1 && tryMm < 0.7 * row0 && row0 > need + 0.5) findings.push(`GUIDED-MODEL-ROW ${size}: a ${tryMm} mm try shares the Model's ${row0.toFixed(1)} mm row, stretched past ${need.toFixed(1)} mm (${((1 - tryMm / row0) * 100).toFixed(0)} % of it empty beside the try: EB-BAND)`);
            if (pl.meta.items < 4) findings.push(`GUIDED-MODEL-ROW ${size}: ${pl.meta.items} cells (want the Model and 3 tries at least)`);
        } catch (e) { findings.push(`GUIDED-MODEL-ROW ${size}: ERROR ${String(e && e.stack || e).split('\n').slice(0, 2).join(' ')}`); }
    }
}

for (const f of findings) console.log(`  FAIL ${f}`);
console.log(findings.length ? `ws-roles-unit: FAIL - ${findings.length} finding(s) in ${checks} check(s)` : `ws-roles-unit: OK (${checks} check(s))`);
process.exit(findings.length ? 1 : 0);
