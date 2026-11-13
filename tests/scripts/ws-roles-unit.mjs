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
//   node tests/scripts/ws-roles-unit.mjs [--only KEYJOIN-ROLE,REVIEW-TITLE]
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

const argv = process.argv.slice(2);
const ONLY = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
const on = (id) => !ONLY || ONLY.includes(id);
const findings = [];
let checks = 0;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// planted skills: a sentence answer, a list answer, one number (control)
const PLANT = {
    prose: { ans: 'The ones digits go 0, 2, 4, 6, 8.', wrong: 'The ones digits go 1, 3, 5, 7, 9.' },
    list: { ans: '12, 15, 18', wrong: '12, 15, 19' },
    one: { ans: '42', wrong: '48' },
    // control: a unit form is written on its line (placevalue:unit_form, a passed skill) - it starts with a digit
    unit: { ans: '2 hundreds 3 tens 5 ones', wrong: '3 hundreds 2 tens 5 ones' },
};
for (const [id, p] of Object.entries(PLANT)) {
    try { registerSkill(`rolesunit:${id}`, { wrongAnswer: () => ({ value: p.wrong, misconception: 'planted', basis: 'rule' }) }); } catch (e) { /* re-run in one process */ }
}
const itemOf = (id) => {
    const p = PLANT[id];
    const q = { categoryId: 'rolesunit', skillId: id, ans: p.ans, text: 'planted', answerType: 'text' };
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
            if (!it) { findings.push(`${tag}: the role dropped the planted item`); continue; }
            html = it.render(resolveCtx({ size, state: 'answered' }), { cols: 2 });
            // the role's key short line is checked too: the slots are what a pupil fills
            const slots = leafSlots(html);
            for (const s of slots) {
                const t = s.text.replace(/&amp;/g, '&').trim();
                if (JOIN.test(t)) findings.push(`${tag}: key slot "${s.id}" holds "${t.slice(0, 30)}" - several answers in ONE slot (H1, KEYJOIN)`);
                else if (id !== 'unit' && PROSE.test(t)) findings.push(`${tag}: key slot "${s.id}" holds the sentence "${t.slice(0, 30)}" - a write line for a sentence (PAGE_TYPES 6.1 number blanks only)`);
            }
            if (id === 'one' && role !== 'error-analysis' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - no slot holds the one-number answer 42 (the frame was lost)`);
            if (id === 'one' && role === 'error-analysis' && !slots.some((s) => s.text.trim() === '42')) findings.push(`${tag}: control - the fix slot does not hold 42`);
            if (id === 'unit' && role !== 'error-analysis' && !slots.some((s) => s.text.trim() === PLANT.unit.ans)) findings.push(`${tag}: control - the unit form lost its one frame line`);
            if (id === 'list' && role !== 'error-analysis' && slots.filter((s) => /^1[258]$/.test(s.text.trim())).length !== 3) findings.push(`${tag}: the list answer is not written one part a box`);
            if (id === 'prose' && role === 'error-analysis' && !/data-ws-slot="ea-draw"/.test(html)) findings.push(`${tag}: a sentence answer's fix is not the item again (redo zone)`);
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

for (const f of findings) console.log(`  FAIL ${f}`);
console.log(findings.length ? `ws-roles-unit: FAIL - ${findings.length} finding(s) in ${checks} check(s)` : `ws-roles-unit: OK (${checks} check(s))`);
process.exit(findings.length ? 1 : 0);
