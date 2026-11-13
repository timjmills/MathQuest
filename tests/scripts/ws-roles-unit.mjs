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
//   node tests/scripts/ws-roles-unit.mjs [--only KEYJOIN-ROLE,REVIEW-TITLE,MOD-ACROSS,INSTR-FOLLOWS,REVIEW-MIXED]
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
    one: { ans: '42', wrong: '48' },
    // control: a unit form is written on its line (placevalue:unit_form, a passed skill) - it starts with a digit
    unit: { ans: '2 hundreds 1 ten 1 one', wrong: '1 hundred 2 tens 1 one' },
};
for (const [id, p] of Object.entries(PLANT)) {
    try { registerSkill(`rolesunit:${id}`, { wrongAnswer: () => ({ value: p.wrong, misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run in one process */ }
}
const itemOf = (id) => {
    const p = PLANT[id];
    const q = Object.assign({ categoryId: 'rolesunit', skillId: id, ans: p.ans, text: 'planted', answerType: 'text' }, p.options ? { options: p.options } : {});
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
            if (id === 'one' && role !== 'error-analysis' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - no slot holds the one-number answer 42 (the frame was lost)`);
            if (id === 'one' && role === 'error-analysis' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - the fix slot does not hold 42`);
            if (id === 'unit' && role !== 'error-analysis' && slots.filter((s) => /^[12]$/.test(s.text.trim())).length !== 3) findings.push(`${tag}: a unit form answer is not written a number a line (its words printed after each)`);
            if (id === 'unit' && role !== 'error-analysis' && /\bten\b|\bone\b|\bhundred\b/.test(html.replace(/<[^>]+>/g, ' ').replace(/2 hundreds 1 ten 1 one|1 hundred 2 tens 1 one/g, ''))) findings.push(`${tag}: a frame word is singular - it gives the value away (FIX-WORDS)`);
            if (id === 'unit' && role !== 'error-analysis' && slots.some((s) => /[A-Za-z]{3}/.test(s.text))) findings.push(`${tag}: a unit form's words written into a slot`);
            if (id === 'list' && role !== 'error-analysis' && slots.filter((s) => /^1[258]$/.test(s.text.trim())).length !== 3) findings.push(`${tag}: the list answer is not written one part a box`);
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
        const pl = RV.plan({ ctx: { size: 'L' }, skills: [{ categoryId: 'rolesunit', skillId: 'one', iCan, grade: 4 }], items: [...main, ...earlier], titleLinesOf: (t) => (t.length > 40 ? 2 : 1) });
        const t = pageText(pl);
        if (!/Mixed Review/.test(t)) findings.push('REVIEW-MIXED: the Review lost its Mixed Review band under a title that wraps');
        if (/Review: drawing/.test(t)) findings.push('REVIEW-MIXED: a title that wraps was printed (want the fixed "Review")');
    } catch (e) { findings.push(`REVIEW-MIXED: ERROR ${String(e && e.message || e).slice(0, 120)}`); }
}

for (const f of findings) console.log(`  FAIL ${f}`);
console.log(findings.length ? `ws-roles-unit: FAIL - ${findings.length} finding(s) in ${checks} check(s)` : `ws-roles-unit: OK (${checks} check(s))`);
process.exit(findings.length ? 1 : 0);
