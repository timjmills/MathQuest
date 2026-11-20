#!/usr/bin/env node
// ws-guided-cellfit.cjs - CELL-FITS (lf-roles r16 F3, lead 2026-11-20): on every Guided page after the first, every top-level
// [data-ws-cell] holds its content (scrollHeight <= clientHeight + 1 px). A two-step story Guided L carried its hinted try on page
// 2 in a row sized without the hint line: the grey line sat on the cell's bottom edge and the rule did not print.
//   node tests/scripts/ws-guided-cellfit.cjs [--skills cat:skill,..] [--sizes M,L] [--seeds 1,2,591220]
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
// HINT-UNIFORM (--only HINT-UNIFORM; lead F4, ruling GUIDED-HINT-DROP-P1 2026-11-20): across the two-step presets the first try
// carries the same hint kind (the words before the first ':', "Step 1"), EXCEPT the ruled case: page 1 holds the Model and one try
// and the hinted try would not fit - the plan's note "GUIDED-HINT-DROP-P1 (ruled)", printed here as a ruled note. A first try with
// no hint and no ruled note, a ruled note on a page 1 holding more than Model + 1, or two hint kinds, FAIL.
//   --fixture f.json judges recorded rows [{key, hint, ruled, p1}] with no browser (the backtest's planted states).
// GUIDED-HINT-LEAK (box numbers) (--only HINT-LEAK; lead W2 ruling 2026-11-20, critic r15 W2): no Guided hint prints a NUMBER that a
// scored box of the SAME try expects. The box values are the numbers the try's key cell writes that its pupil cell does not (a
// multiset difference of whole-number tokens, the hint's own text left out). The circled sign may stay (the designed Step-1 trace):
// "Step 1: circle +. ___ + ___ = ___." passes, "22 + 14 = 36" and "22 + 14 = ___" fail. --skills widens it (passed-skill sweep);
// --fixture judges recorded rows [{key, hint, boxes}]. A number printed in the try's own question text (the pupil cell's text
// outside the hint) is GIVEN, not a secret, and is exempt (lead ruling 2026-11-20, lf-roles r18: "932 and 932" on compare).
// HINT-OVERMASK (--only HINT-OVERMASK; lead ruling 2026-11-20, lf-roles r18): a Guided hint may not show a gap "___" where its
// unmasked source (hintOf(it, {raw: true}), the same pick) had a number printed in the try's question text (q.text): the W2
// mask blanked given story numbers ("The numbers are 4 and 9." -> "The numbers are ___ and ___."). Default sweep: the two-step
// presets plus the passed word-work and place-value skills it changed; --skills overrides. --fixture rows [{key, hint, raw, q,
// drawn}] (drawn: a place-value cell's printed numeral and its digits, also given).
// Prints `ws-guided-cellfit: OK` / `FAIL (n)`.
const path = require('path');
const H = require(path.join(__dirname, '..', 'lib', 'ws-harness.cjs'));
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const SKILLS = arg('skills', 'algebra:multi_step_word_plain,algebra:two_step_add_then_div,algebra:two_step_mult_div_first').split(',');
const SIZES = arg('sizes', 'M,L').split(',');
const SEEDS = arg('seeds', '1,2,591220').split(',').map(Number);
const ONLY = arg('only', '');
const on = (r) => !ONLY || ONLY.split(',').includes(r);
const FIXTURE = arg('fixture', '');
const OVERMASK_SKILLS = ['addition:add_wp_10', 'addition:add_wp_20', 'addition:add_wp_10_plain', 'addition:add_wp_20_plain', 'subtraction:sub_wp_10', 'subtraction:sub_wp_20', 'subtraction:sub_wp_10_plain', 'subtraction:sub_wp_20_plain', 'placevalue:identify', 'placevalue:value', 'placevalue:compare'];
const PRESETS = ['algebra:multi_step_word_plain', 'algebra:two_step_mult_div_first', 'algebra:two_step_add_then_mult', 'algebra:two_step_add_then_div'];
/** Judge GUIDED-HINT-LEAK rows [{key, hint, boxes}]: a hint number token that is a box value. */
function judgeLeak(rows) {
    const bad = [];
    for (const r of rows) {
        const given = new Set((r.given || []).map(String));
        const nums = (String(r.hint).match(/\d+(?:\.\d+)?/g) || []).filter((n) => !/^Step$/.test(n));
        const label = /^\s*Step\s+(\d+)\s*:/.exec(r.hint);
        const hit = nums.filter((n, i) => !(label && i === 0 && n === label[1]) && !given.has(n) && (r.boxes || []).map(String).includes(n));
        if (hit.length) bad.push(`GUIDED-HINT-LEAK ${r.key}: the hint "${r.hint}" prints ${[...new Set(hit)].join(', ')}, which a box of the same try expects (${r.boxes.join(', ')})`);
    }
    return bad;
}
/** Judge HINT-OVERMASK rows [{key, hint, raw, q, drawn}]: a gap where the raw hint had a number the question prints. */
function judgeOvermask(rows) {
    const bad = [];
    const TOK = /___|\d+(?:\.\d+)?/g;
    for (const r of rows) {
        if (!r.hint || !r.raw || r.hint === r.raw) continue;
        const qn = new Set([...(String(r.q || '').replace(/,(?=\d{3}\b)/g, '').match(/\d+(?:\.\d+)?/g) || []), ...(r.drawn || [])].flatMap((n) => [n, String(Number(n))]));
        const h = String(r.hint).match(TOK) || [], w = String(r.raw).replace(/,(?=\d{3}\b)/g, '').match(TOK) || [];
        if (h.length !== w.length) continue;
        const hit = w.filter((n, i) => h[i] === '___' && n !== '___' && qn.has(n));
        if (hit.length) bad.push(`HINT-OVERMASK ${r.key}: the hint "${r.hint}" gaps ${[...new Set(hit)].join(', ')}, printed in the question ("${String(r.q).slice(0, 80)}"); unmasked "${r.raw}"`);
    }
    return bad;
}
/** Judge HINT-UNIFORM rows [{key, hint, ruled, p1}]: returns [findings, ruled notes]. */
function judgeUniform(rows) {
    const bad = [], notes = [], kinds = new Map();
    for (const r of rows) {
        if (r.hint) { const k = String(r.hint).split(':')[0].trim(); if (!kinds.has(k)) kinds.set(k, r.key); }
        if (r.hint && r.ruled) bad.push(`HINT-UNIFORM ${r.key}: the first try has its hint, yet the plan notes GUIDED-HINT-DROP-P1`);
        else if (!r.hint && !r.ruled) bad.push(`HINT-UNIFORM ${r.key}: the first try has no hint and the plan names no ruled drop (GUIDED-HINT-DROP-P1)`);
        else if (r.ruled && r.p1 !== 2) bad.push(`HINT-UNIFORM ${r.key}: a ruled drop on a page 1 holding ${r.p1} cells (the ruling covers Model + 1 try)`);
        else if (r.ruled) notes.push(`ruled GUIDED-HINT-DROP-P1 ${r.key}: Model + 1 try on page 1, the hinted try would not fit`);
    }
    if (kinds.size > 1) bad.push(`HINT-UNIFORM: ${kinds.size} hint kinds on the first tries (${[...kinds].map(([k, at]) => `"${k}" ${at}`).join(', ')})`);
    return [bad, notes];
}
if (FIXTURE) {
    const fx = JSON.parse(require('fs').readFileSync(path.resolve(FIXTURE), 'utf8'));
    const [bad, notes] = fx.rule === 'GUIDED-HINT-LEAK' ? [judgeLeak(fx.rows), []] : fx.rule === 'HINT-OVERMASK' ? [judgeOvermask(fx.rows), []] : judgeUniform(fx.rows);
    notes.forEach((x) => console.log('  NOTE ' + x)); bad.forEach((x) => console.log('  ' + x));
    console.log(bad.length ? `ws-guided-cellfit: FAIL (${bad.length})` : 'ws-guided-cellfit: OK');
    process.exit(bad.length ? 1 : 0);
}
(async () => {
    const app = await H.open({});
    const bad = await app.page.evaluate(async (SKILLS, SIZES, SEEDS) => {
        const out = [];
        for (const k of SKILLS) for (const size of SIZES) for (const seed of SEEDS) {
            const [categoryId, skillId] = k.split(':');
            const b = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }], columns: 'auto' }], size, paper: 'A4', seed, key: false });
            if (b.error) { out.push(`${k} ${size} seed ${seed}: ${b.error}`); continue; }
            const d = document.createElement('div'); d.innerHTML = b.pupilHtml; document.body.appendChild(d); await document.fonts.ready;
            [...d.querySelectorAll('.ws-page')].forEach((pg, pi) => { if (!pi) return; [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')).forEach((c, ci) => {
                const over = c.scrollHeight - c.clientHeight; if (over > 1) out.push(`CELL-FITS ${k} guided ${size} seed ${seed} p${pi + 1} cell ${ci + 1}: content ${over} px past the cell`); }); });
            d.remove();
        }
        return out;
    }, on('CELL-FITS') ? SKILLS : [], SIZES, SEEDS);
    if (on('HINT-UNIFORM')) {
        const rows = await app.page.evaluate(async (P, SIZES, SEEDS) => {
            const out = [];
            for (const k of P) for (const size of SIZES) for (const seed of SEEDS) {
                const [categoryId, skillId] = k.split(':');
                const b = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed, key: false });
                const d = document.createElement('div'); d.innerHTML = b.pupilHtml || '';
                const top = (pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                const pages = [...d.querySelectorAll('.ws-page')];
                const cells = pages[0] ? top(pages[0]) : [];
                // (the first try: the cell after the Model, on page 2 when page 1 holds the Model alone)
                const firstTry = cells[1] || (pages[1] && top(pages[1])[0]);
                const h = firstTry && firstTry.querySelector('.mq-hintline');
                out.push({ key: `${k} ${size} seed ${seed}`, hint: h ? h.textContent.trim() : '', ruled: (b.notes || []).some((n) => /GUIDED-HINT-DROP-P1/.test(n)), p1: cells.length });
            }
            return out;
        }, PRESETS, SIZES, SEEDS);
        const [ub, notes] = judgeUniform(rows);
        notes.forEach((x) => console.log('  NOTE ' + x));
        bad.push(...ub);
    }
    if (on('HINT-LEAK')) {
        const LK = argv.includes('--skills') ? SKILLS : PRESETS;
        const rows = await app.page.evaluate(async (P, SIZES, SEEDS) => {
            const out = [];
            const top = (pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
            const nums = (t) => (String(t).match(/\d+(?:\.\d+)?/g) || []);
            for (const k of P) for (const size of SIZES) for (const seed of SEEDS) {
                const [categoryId, skillId] = k.split(':');
                const b = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed, key: true });
                if (b.error) continue;
                const P1 = document.createElement('div'); P1.innerHTML = b.pupilHtml || '';
                const K1 = document.createElement('div'); K1.innerHTML = b.keyHtml || '';
                const pp = [...P1.querySelectorAll('.ws-page')], kp = [...K1.querySelectorAll('.ws-page')];
                pp.forEach((pg, pi) => { const kc = kp[pi] ? top(kp[pi]) : []; top(pg).forEach((c, ci) => {
                    const h = c.querySelector('.mq-hintline'); if (!h || !kc[ci]) return;
                    const hint = h.textContent.trim();
                    const pupil = nums(c.textContent.replace(h.textContent, ''));
                    const kh = kc[ci].querySelector('.mq-hintline');
                    const boxes = nums(kh ? kc[ci].textContent.replace(kh.textContent, '') : kc[ci].textContent).slice();
                    for (const n of pupil) { const i = boxes.indexOf(n); if (i > -1) boxes.splice(i, 1); }
                    out.push({ key: `${k} guided ${size} seed ${seed} p${pi + 1} cell ${ci + 1}`, hint, boxes: [...new Set(boxes)], given: [...new Set(pupil)] });
                }); });
            }
            return out;
        }, LK, SIZES, SEEDS);
        bad.push(...judgeLeak(rows));
    }
    if (on('HINT-OVERMASK')) {
        const OM = argv.includes('--skills') ? SKILLS : [...PRESETS, ...OVERMASK_SKILLS];
        const rows = await app.page.evaluate(async (P, SIZES, SEEDS) => {
            const G = await import('/js/modules/sheet/roles/guided.js');
            const out = [];
            for (const k of P) for (const size of SIZES) for (const seed of SEEDS) {
                const [categoryId, skillId] = k.split(':');
                const b = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed, key: false });
                if (b.error) continue;
                // (the plan's own items - every object with a q in its pages - are what hintOf read; a page's hint line draws its
                // gaps as rules, so the printed text is matched with its gaps taken out)
                const flat = (t) => String(t).replace(/___/g, '').replace(/\s+/g, ' ').trim();
                const shown = new Set([...(new DOMParser().parseFromString(b.pupilHtml || '', 'text/html')).querySelectorAll('.mq-hintline')].map((h) => flat(h.textContent)));
                const items = [], seen = new Set();
                const walk = (o) => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); if (o.q && o.skill) items.push({ ...o, template: o.template || (o.q.cell && o.q.cell.template) }); for (const v of Object.values(o)) walk(v); };
                walk(b.plan && b.plan.pages);
                items.forEach((it, i) => {
                    const hint = G.hintOf(it); if (!hint || !shown.has(flat(hint))) return;
                    out.push({ key: `${k} guided ${size} seed ${seed} item ${i + 1}`, hint, raw: G.hintOf(it, { raw: true }), q: String((it.q && it.q.text) || '').replace(/<[^>]*>/g, ' '),
                        // (a place-value cell prints its number - payload n - with one digit underlined: the numeral and its digits are given)
                        drawn: (() => { const n = it.q && it.q.cell && it.q.cell.payload && it.q.cell.payload.n; return Number.isFinite(Number(n)) && n !== '' && n != null ? [String(n), ...String(n).replace(/\D/g, '').split('')] : []; })() });
                });
            }
            return out;
        }, OM, SIZES, SEEDS);
        bad.push(...judgeOvermask(rows));
    }
    bad.forEach((x) => console.log('  ' + x));
    console.log(bad.length ? `ws-guided-cellfit: FAIL (${bad.length})` : 'ws-guided-cellfit: OK');
    process.stdout.write("", () => process.exit(bad.length ? 1 : 0));   // (a long FAIL list is flushed before exit: ws-backtest reads the last line)
})().catch((e) => { console.log('ws-guided-cellfit: FAIL (error ' + (e && e.message) + ')'); process.exit(1); });
