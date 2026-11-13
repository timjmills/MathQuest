#!/usr/bin/env node
// ws-key-arith — TF-EVAL: every number sentence a thinking page PRINTS or KEYS is true arithmetic, and every True / False
// verdict matches the sentence it judges (word-stories critic r1 F1, 2026-11-13: the add host's missing-part kinds printed
// "19 + 3 = 16" as the finish line of True or False?, and the correct work "41 − 23 = 18" was keyed False).
//
//   node tests/scripts/ws-key-arith.mjs                                   # the word-stories skills (the 4 hosts + 3 presets)
//   node tests/scripts/ws-key-arith.mjs --skill addition:add_word_problems [--skill a:b,c:d]
//   node tests/scripts/ws-key-arith.mjs --root <tree> | MQ_ROOT=<tree>     # the app of another tree (backtests)
//   node tests/scripts/ws-key-arith.mjs --n 12 --json out.json --report-only
//
// THE DEAL. For each skill, every offered value of its `forms` option ALONE (the default mix too) crossed with every offered
// value of its `band` option (L29: each value is a page of its own); --n items each (default 12), seeded
// generateQuestionFor(seed = fnv(cat:skill|opts) + i, itemIndex i, itemCount n). Node, no browser.
//
// THE PAGES (each item drawn through the role's own `prepare` and the pure kit, the host's draw emulated as print-sheet's
// render does: a shown value puts the cell in state 'wrong' with that value)
//   true-false     both flags (the shown claim right / wrong). (1) The finish line "a ∘ b = ____" with its keyed answer is
//                  true; (2) the drawn work "a ∘ b = shown" is true exactly when the key ticks True.
//   error-analysis both flags. On the right flag the pupil's work line printed in the cell ("a ∘ b = v") and the drawn work
//                  are true.
//   reason-it      A right / B right. The panel keyed right draws a true sentence, and A and B draw different work.
//   story          P-WP-22 (critic r1 F12): a money story counts coins; it never names a currency (dollars, cents ...).
// A sentence is read from the kit's slot attributes (the number-sentence boxes fr0-a / op0 / fr0-b / answer, the column
// rows w0-top-* / w0-sign / w0-bottom-* / ans-*, the neutral row w0-a / w0-sign / w0-b / answer); a cell with none of them
// (a two-step story, a picture) is not judged.
//
// Last line `ws-key-arith: OK (...)`, `ws-key-arith: FAIL (n) ...` or `ws-key-arith: N/A (...)`; exit 0 OK, 1 FAIL, 2 usage,
// 4 N/A (no skill in scope draws a one-step word-work item: nothing judged, never OK).

import { resolve, dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-key-arith';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const argAll = (f) => argv.flatMap((a, i) => (a === f && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const KNOWN = new Set(['--skill', '--root', '--n', '--json', '--report-only']);
for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    if (!KNOWN.has(argv[i])) { console.log(`${TOOL}: unknown flag ${argv[i]}`); process.exit(2); }
    if (argv[i] !== '--report-only') i++;
}
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || HERE));
const N = Number(arg('--n', 12));
const DEFAULT_SKILLS = [
    'addition:add_word_problems', 'addition:add_word_problems_plain', 'subtraction:sub_word_problems', 'subtraction:sub_word_problems_plain',
    'addition:add_wp_change_unknown', 'subtraction:sub_wp_change_unknown', 'subtraction:sub_wp_compare_smaller',
];
const SKILLS = argAll('--skill').length ? argAll('--skill') : DEFAULT_SKILLS;

const fnv = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const OPK = { '+': '+', '-': '-', '−': '-', '×': '*', 'x': '*', '*': '*', '÷': '/', '/': '/' };
const num = (s) => { const t = String(s ?? '').replace(/[,\s]/g, ''); return /^-?\d+$/.test(t) ? Number(t) : null; };
const evalOp = (a, o, b) => (o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b ? a / b : NaN) : NaN);

/** The slots of a rendered cell: {id: text}. */
function slotsOf(html) {
    const out = {};
    for (const m of String(html).matchAll(/data-ws-slot="([^"]+)"[^>]*>([^<]*)</g)) if (!(m[1] in out)) out[m[1]] = m[2].trim();
    return out;
}
/** The one-step sentence a rendered cell draws: {a, op, b, v, text} or null. */
export function drawnSentence(html) {
    const s = slotsOf(html);
    const digits = (pre) => {
        const ks = Object.keys(s).filter((k) => new RegExp(`^${pre}-\\d+$`).test(k)).sort((x, y) => Number(x.split('-').pop()) - Number(y.split('-').pop()));
        return ks.length ? num(ks.map((k) => s[k]).join('')) : null;
    };
    let a = null, op = null, b = null, v = null;
    if ('fr0-a' in s) { a = num(s['fr0-a']); op = OPK[s.op0]; b = num(s['fr0-b']); v = num(s.answer); }
    else if ('w0-a' in s) { a = num(s['w0-a']); op = OPK[s['w0-sign']]; b = num(s['w0-b']); v = num(s.answer); }
    else if (Object.keys(s).some((k) => /^w0-top-\d+$/.test(k)) && !Object.keys(s).some((k) => /^w1-/.test(k))) {
        a = digits('w0-top'); b = digits('w0-bottom'); op = OPK[s['w0-sign']]; v = digits('ans');
    }
    if (a === null || b === null || v === null || !op) return null;
    return { a, op, b, v, text: `${a} ${op} ${b} = ${v}` };
}
const truthOf = (s) => (s ? evalOp(s.a, s.op, s.b) === s.v : null);
/** Every "a ∘ b = c" printed as text in the html (tags stripped). */
function textSentences(html) {
    const t = String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ');
    return [...t.matchAll(/(\d[\d,]*)\s*([+\-−×÷])\s*(\d[\d,]*)\s*=\s*(\d[\d,]*)/g)].map((m) => ({ a: num(m[1]), op: OPK[m[2]], b: num(m[3]), v: num(m[4]), text: m[0] }));
}

async function loadApp(root) {
    const M = (p) => pathToFileURL(join(root, 'js', 'modules', p)).href;
    const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    const store = {};
    globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
    globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
    const quiet = {};
    for (const k of ['log', 'warn', 'error', 'info', 'debug']) { quiet[k] = console[k]; console[k] = () => {}; }
    try {
        const gq = await import(M('generate-question.js'));
        const so = await import(M('skill-options.js'));
        for (const side of ['skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) { try { await import(M(side)); } catch (e) { /* not in this tree */ } }
        try { await import(M('print-sheet.js')); } catch (e) { /* providers register through it */ }
        const kit = await import(M('sheet/index.js'));
        const tf = await import(M('sheet/roles/true-false.js'));
        const ea = await import(M('sheet/roles/error-analysis.js'));
        const ri = await import(M('sheet/roles/reason-it.js'));
        return { gq, so, kit, tf, ea, ri };
    } finally { for (const k of Object.keys(quiet)) console[k] = quiet[k]; }
}

/** The configs of one skill: each offered forms value alone (and the default), crossed with each offered band value. */
function configsOf(so, cat, id) {
    let defs = [];
    try { defs = so.offeredOptionsFor(cat, id) || []; } catch (e) { defs = []; }
    const forms = defs.find((d) => d.id === 'forms');
    const band = defs.find((d) => d.id === 'band');
    const fv = [null, ...((forms && forms.values) || []).map((v) => v.v)];
    const bv = band ? (band.values || []).map((v) => v.v) : [undefined];
    const out = [];
    for (const f of fv) for (const b of bv) {
        const o = {};
        if (f !== null) o.forms = [f];
        if (b !== undefined) o.band = b;
        out.push(o);
    }
    return out;
}

async function main() {
    const app = await loadApp(ROOT);
    const { gq, so, kit, tf, ea, ri } = app;
    const findings = [];
    let judged = 0, sentences = 0;
    const per = {};
    for (const key of SKILLS) {
        const [cat, id] = key.split(':');
        per[key] = { configs: 0, items: 0, findings: 0 };
        for (const opts of configsOf(so, cat, id)) {
            per[key].configs++;
            const tag = JSON.stringify(opts);
            const base = fnv(`${key}|${tag}`) % 100000;
            for (let i = 0; i < N; i++) {
                let q;
                const quiet = console.log; console.log = () => {};
                try { q = gq.generateQuestionFor({ category: cat, skill: id, opts, seed: base * 100 + i, itemIndex: i, itemCount: N }); } catch (e) { q = null; } finally { console.log = quiet; }
                if (!q || !q.cell || q.cell.template !== 'word-work') continue;
                q = Object.assign({ categoryId: cat, skillId: id }, q);
                const payload = q.cell.payload || {};
                if (!Array.isArray(payload.steps) || payload.steps.length !== 1) continue;
                per[key].items++;
                const draw = (c, o = {}) => {
                    const shown = o.shown !== undefined && o.shown !== null && o.shown !== '' ? String(o.shown) : null;
                    return kit.renderCell({ cell: { template: 'word-work', payload: Object.assign({}, payload, o.payload || {}) } },
                        Object.assign({ mode: 'print', size: 'M' }, c, { state: shown === null ? c.state : 'wrong', wrong: shown === null ? c.wrong : { value: shown, slots: Object.assign({}, o.shownSlots || {}) }, columns: o.cols || 2 }));
                };
                const it = { q, template: 'word-work', key: { value: String(q.ans) }, footprint: {}, render: draw, fclass: 'word' };
                const where = `${key} ${tag} item ${i}`;
                const bad = (role, msg) => { findings.push({ key, opts: tag, item: i, role, msg }); per[key].findings++; };
                const ctxB = { mode: 'print', size: 'M', state: 'blank' };
                // ---- P-WP-22 (critic r1 F12): money is a plain number of coins, never a currency word
                const cur = /\b(dollars?|cents?|pounds?|euros?)\b/i.exec(String(q.text || ''));
                if (cur) bad('story', `P-WP-22: the story names a currency ("${cur[0]}"): "${String(q.text).slice(0, 70)}" (${where})`);
                // ---- True or False?
                for (const wrong of [false, true]) {
                    let p = null;
                    try { p = tf.prepare(it, { wrong }); } catch (e) { p = null; }
                    if (!p) continue;
                    judged++;
                    const html = p.render(ctxB);
                    const k = (p.key && p.key.slots) || {};
                    const fin = /class="mq-frame">([^<]*)</.exec(html);
                    const stem = fin ? /(\d[\d,]*)\s*([+\-−×÷])\s*(\d[\d,]*)\s*=\s*$/.exec(fin[1]) : null;
                    if (stem) {
                        sentences++;
                        // (the frame's keyed answer; a True statement's key may leave the frame empty - PT-TOF-2 - and the frame
                        // still asks for the item's own answer)
                        const kv = num(k['tf-ans'] && k['tf-ans'].value);
                        const s = { a: num(stem[1]), op: OPK[stem[2]], b: num(stem[3]), v: kv !== null ? kv : num(q.ans) };
                        if (truthOf(s) !== true) bad('true-false', `finish line "${fin[1].trim()} ${s.v}" is false (${where})`);
                    }
                    const work = drawnSentence(html);
                    if (work) {
                        sentences++;
                        const keyedTrue = !!(k['tf-true'] && k['tf-true'].value);
                        // the work SOLVES the story when it is true arithmetic, in the story's solving sign, with the answer
                        // (an "added" claim drawn as 61 + 3 = 64 is true arithmetic and a False claim: the wrong operation, F7)
                        const solving = OPK[payload.steps[0].op] || payload.steps[0].op;
                        const solves = truthOf(work) === true && work.op === solving && work.v === num(q.ans);
                        if (solves !== keyedTrue) bad('true-false', `drawn work "${work.text}" ${solves ? 'solves' : 'does not solve'} the story but is keyed ${keyedTrue ? 'True' : 'False'} (${where})`);
                        // SIGNMATCH (F7): a False claim's answer is never the OTHER sign's result printed under the story's sign
                        if (!keyedTrue && work.op === solving && truthOf(work) === false) {
                            const otherV = evalOp(work.a, solving === '+' ? '-' : '+', work.b);
                            if ((solving === '+' || solving === '-') && (work.v === otherV || work.v === Math.abs(otherV))) bad('true-false', `"${work.text}": the other sign's answer printed under the story's sign (F7, SIGNMATCH) (${where})`);
                        }
                    }
                }
                // ---- Error analysis (the right flag: the pupil's work is right, so every sentence it prints is true)
                {
                    let p = null;
                    try { p = ea.prepare(it, { wrong: false }); } catch (e) { p = null; }
                    if (p) {
                        judged++;
                        let html = '';
                        try { html = p.render(ctxB); } catch (e) { html = ''; }
                        for (const s of textSentences(html)) { sentences++; if (truthOf(s) !== true) bad('error-analysis', `right work printed as "${s.text}" (${where})`); }
                        const work = drawnSentence(html);
                        if (work) { sentences++; if (truthOf(work) !== true) bad('error-analysis', `right work drawn as "${work.text}" (${where})`); }
                    }
                }
                // ---- Reason It (A right, then B right)
                for (const aRight of [true, false]) {
                    let p = null;
                    try { p = ri.prepare(it, { wrong: aRight, seed: 1, index: i }); } catch (e) { p = null; }
                    if (!p) continue;
                    judged++;
                    let html = '';
                    try { html = p.render(ctxB); } catch (e) { html = ''; }
                    const boxes = html.split('class="mq-abbox"').slice(1).map((h) => h.split('class="mq-abresp"')[0]);
                    if (boxes.length < 2) continue;
                    const [A, B] = boxes.map(drawnSentence);
                    if (!A || !B) continue;
                    sentences += 2;
                    const right = aRight ? A : B;
                    if (truthOf(right) !== true) bad('reason-it', `the panel keyed right (${aRight ? 'A' : 'B'}) draws "${right.text}", which is false (${where})`);
                    if (A.text === B.text) bad('reason-it', `A and B draw the same work "${A.text}" (${where})`);
                }
            }
        }
    }
    for (const [k, v] of Object.entries(per)) console.log(`  ${v.findings ? 'FAIL' : 'OK  '} ${k}: ${v.configs} config(s), ${v.items} item(s), ${v.findings} finding(s)`);
    const shownMax = 30;
    for (const f of findings.slice(0, shownMax)) console.log(`      [${f.role}] ${f.msg}`);
    if (findings.length > shownMax) console.log(`      ... ${findings.length - shownMax} more`);
    if (arg('--json', null)) writeFileSync(resolve(arg('--json')), JSON.stringify({ findings, per }, null, 1));
    const items = Object.values(per).reduce((s, v) => s + v.items, 0);
    // nothing in scope draws a one-step word-work sentence: not judged, never OK (exit 4, precritic reads it as N/A)
    if (!items) { console.log(`${TOOL}: N/A (no one-step word-work item in ${SKILLS.join(', ')})`); process.exit(4); }
    if (findings.length) { console.log(`${TOOL}: FAIL (${findings.length}) ${judged} page items, ${sentences} sentences judged`); process.exit(has('--report-only') ? 0 : 1); }
    console.log(`${TOOL}: OK (${SKILLS.length} skill(s), ${items} items, ${judged} page items, ${sentences} sentences true)`);
}

main().catch((e) => { console.log(`${TOOL}: FAIL (crash: ${e && e.stack || e})`); process.exit(1); });
