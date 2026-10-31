#!/usr/bin/env node
// ws-visual-quality — the visual CHOICE checks (design/audit/VISUAL_QUALITY.md §4.2; WORKSHEET_DESIGN_STANDARD.md "Visual
// quality bar" VQ-1 … VQ-10). Precritic's other gates measure fit, clipping, density, ink and font; this one asks whether
// the drawing is the right one, whether every drawn part is live for the item, whether there is ONE answer place, whether
// the title is a sentence, and whether the skill is a kit cell at all. Node, no browser; generates through
// generateQuestionFor with a seed derived from `cat:skill` + the item index, so two runs of one tree are byte-identical.
//
//   node tests/scripts/ws-visual-quality.mjs                                  # every live skill
//   node tests/scripts/ws-visual-quality.mjs --skill addition:fact_family_sort [--skill a:b,c:d]
//   node tests/scripts/ws-visual-quality.mjs --category addition
//   node tests/scripts/ws-visual-quality.mjs --rules VQ-LIVE,VQ-TITLE          # only these rules
//   node tests/scripts/ws-visual-quality.mjs --fixture tests/fixtures/precritic/vq-live.fail.mjs
//   node tests/scripts/ws-visual-quality.mjs --root /other/checkout            # the app of another tree (or MQ_ROOT)
//   node tests/scripts/ws-visual-quality.mjs --self-test                       # the pure readers and rules, no app
//   options: --n 6 (items a skill) --jobs 4 (worker threads) --timeout 45 (s a skill) --json out.json --report-only
//            --baseline <file> (default tests/fixtures/precritic/vq-baseline.json) --no-baseline
//            --write-baseline (rewrites the pin with the pinned findings still present: it only SHRINKS)
//
// RULES (each reads the item's PAYLOAD, the kit's own slot attributes in the rendered cell, or the provider strings;
// only VQ-ONEANSWER on a legacy q.visual reads raw HTML, because a legacy cell has nothing else)
//   VQ-REP        a relation skill (id / label names a fact family, number family, number bond, part-whole or make ten;
//                 or its CCSS is K.OA.3 / K.OA.4) emits on every sampled item a kit cell whose template DRAWS the
//                 relation: bond, fact-family, family-check, tenframe, or word-work with its bar (VQ-1).
//   VQ-ONEANSWER  one graded response area: never a Say frame with blanks inside the cell, never a tick / choice list
//                 together with an "Answer:" line (VQ-2).
//   VQ-LIVE       word-work: the sign choices drawn are only operations the skill deals (K-2: + and − at most; 3+: the
//                 dealt operations and their inverses); no column grid while every answer is ≤ 20; no filler word
//                 (word-work.js FILLERS) in the unit bank unless the story says it (VQ-3).
//   VQ-TITLE      the I Can title the sheet prints (practice.js skillWords, the provider's strings) is a sentence: no
//                 "?", no sign pair ("+/−", "×/÷"), no "is it", no "is / are / does" after "I Can <verb>", no label
//                 that starts with another verb pasted after the verb, no doubled word (VQ-9).
//   VQ-NOLEGACY   a skill with no kit cell on any sampled item is a legacy skill; the pinned list may only shrink: a skill
//                 not on it that emits no kit cell fails (VQ-10).
//
// BASELINE  tests/fixtures/precritic/vq-baseline.json pins {rule: {cat:skill: [signature]}} at its `frozen` date, with
// `frozenCounts` per rule. A pinned finding is reported "pinned" (not a failure); any other finding FAILS. The pin may
// only shrink: --write-baseline keeps only pins still found, a rule whose pin holds more than its frozen count fails, and
// the lane's own targets (IN_SCOPE below) are never pinnable. A pinned finding no longer found is listed "stale".
//
// The never-graded register (VISUAL_QUALITY §4.1 item 5): every run prints PASSED / TEMPLATE-ONLY / NEVER-GRADED counts of
// the skills in scope (PASSED = js/modules/redesign-passed.js; TEMPLATE-ONLY = a kit skill on a template a passed skill
// uses; NEVER-GRADED = the rest), so "passed" is never assumed.
//
// Last line `ws-visual-quality: OK (...)` or `ws-visual-quality: FAIL (n) ...`; exit 0 OK, 1 FAIL, 2 usage.

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpus } from 'node:os';

const TOOL = 'ws-visual-quality';
const SCRIPT = fileURLToPath(import.meta.url);
const SCRIPT_ROOT = resolve(dirname(SCRIPT), '..', '..');
export const RULES = ['VQ-REP', 'VQ-ONEANSWER', 'VQ-LIVE', 'VQ-TITLE', 'VQ-NOLEGACY'];

/** The lane's own targets (VISUAL_QUALITY §4.4): they fail on the base and must pass after the fix; never pinned. */
export const IN_SCOPE = Object.freeze([
    'addition:add_wp_10', 'addition:add_wp_10_plain', 'addition:add_wp_20', 'addition:add_wp_20_plain',
    'subtraction:sub_wp_10', 'subtraction:sub_wp_10_plain', 'subtraction:sub_wp_20', 'subtraction:sub_wp_20_plain',
    'addition:fact_family_sort',
]);
/** Skills that hang in node (an infinite deal loop without a DOM): skipped in a sweep with a note, never silently. Empty
 *  today: the census hang on number_theory:divisibility_sort was at range 20; at the skill's own range it answers. Every
 *  skill runs under the per-skill watchdog (--timeout), so a new hang is a VQ-RUN finding, not a stuck gate. */
export const SKIP = Object.freeze({});

/* ====================================================================== pure readers (self-tested) */

export const fnv = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const OPKEY = { '+': '+', '-': '-', '−': '-', '–': '-', '×': '*', x: '*', '*': '*', '÷': '/', '/': '/' };
const OPWORD = { add: '+', subtract: '-', multiply: '*', divide: '/' };
const GLYPH = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const INVERSE = { '+': '-', '-': '+', '*': '/', '/': '*' };
export const DRAW_TEMPLATES = Object.freeze(['bond', 'fact-family', 'family', 'family-check', 'tenframe', 'part-whole', 'bar']);
const DEFAULT_FILLERS = ['boxes', 'days', 'people', 'bags', 'cars', 'books'];

/** A relation skill: its id or label names a fact / number family, a bond, part-whole or make ten; or CCSS K.OA.3/4. */
export function isRelationSkill({ id = '', label = '', ccss = [] }) {
    const t = `${id} ${label}`.toLowerCase().replace(/_/g, ' ');
    if (/\bfact famil|\bnumber famil|\bbonds?\b|part[ -]?whole|\bmake (ten|10)\b|\bmaking (ten|10)\b/.test(t)) return true;
    return (ccss || []).some((c) => /^K\.OA\.A?\.?[34]$/.test(String(c)));
}

/** Does this item's kit cell draw the relation? */
export function drawsRelation(it) {
    if (!it || it.kind !== 'kit') return false;
    if (DRAW_TEMPLATES.includes(it.template)) return true;
    return it.template === 'word-work' && !!(it.ww && it.ww.bar);
}

/** The parts of a word-work cell as the kit RENDERED them (its slot attributes, not its look). */
export function wordWorkParts(html, payload = {}) {
    const h = String(html || '');
    const signs = new Set();
    for (const m of h.matchAll(/data-ws-slot="op\d+-(add|subtract|multiply|divide)"[^>]*data-ws-shape="choice"/g)) signs.add(OPWORD[m[1]]);
    for (const m of h.matchAll(/data-mq-op="([^"]+)"/g)) if (OPKEY[m[1]]) signs.add(OPKEY[m[1]]);
    const grid = /class="mq-wwcols\b/.test(h);
    const bank = [];
    for (const m of h.matchAll(/class="mq-wwwords"[^>]*>([\s\S]*?)<\/div>/g)) {
        for (const w of m[1].matchAll(/<(?:span|button)[^>]*>([^<]+)<\/(?:span|button)>/g)) if (w[1].trim() && w[1].trim() !== '·') bank.push(w[1].trim());
    }
    const story = (Array.isArray(payload.lines) ? payload.lines : []).join(' ');
    return { signs: [...signs].sort(), grid, bank, story, bar: !!payload.bar };
}

/** The response areas of a cell's HTML: graded choice / tick lists, "Answer:" lines, a Say frame with blanks. */
export function responseAreas(html) {
    const h = String(html || '');
    // kit: a graded check / choice slot (a slot marked data-ws-graded="0" is scratch, not an answer)
    const kitChoice = [...h.matchAll(/<[^>]*data-ws-shape="(check|choice|tick)"[^>]*>/g)].filter((m) => !/data-ws-graded="0"/.test(m[0])).length;
    // legacy: the _wsTickList box (a ~1.1em square with a border, right of its label) or a ☐ glyph
    const legacyTick = (h.match(/width:\s*1(?:\.\d+)?em;\s*height:\s*1(?:\.\d+)?em;\s*border:/g) || []).length + (h.match(/☐|&#9744;/g) || []).length;
    const answerLine = /(^|>|\s)Answer:\s*(<|$|\s|_)/.test(h);
    let sayBlanks = false;
    for (const m of h.matchAll(/Say:/g)) {
        const tail = h.slice(m.index, m.index + 900).split(/<\/div>/)[0];
        if (/_{3,}|border-bottom:|data-ws-slot=|data-ws-shape=|<input/.test(tail)) { sayBlanks = true; break; }
    }
    return { choice: kitChoice + legacyTick, answerLine, sayBlanks };
}

const norm = (s) => String(s || '').toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** The verbs an I Can title or a label starts with: a label that starts with one, pasted after another, is two verbs. */
const VERBS = new Set(['add', 'subtract', 'multiply', 'divide', 'make', 'count', 'compare', 'order', 'round', 'regroup', 'solve', 'write', 'read', 'draw', 'circle', 'match', 'sort', 'build', 'tell', 'find', 'choose', 'show', 'measure', 'name', 'skip']);

/** Why an I Can title is not a sentence ([] when it is). */
export function titleProblems(title, label = '') {
    const t = String(title || '').trim();
    const out = [];
    if (!/^I Can\b/.test(t)) out.push('does not start "I Can"');
    if (/\?/.test(t)) out.push('has a "?"');
    if (/[+\-−–×÷]\s*\/\s*[+\-−–×÷]/.test(t)) out.push('has a sign pair ("+/−", "×/÷")');
    if (/\bis it\b/i.test(t)) out.push('has "is it"');
    const m = /^I Can\s+([a-z]+)\s+(.*)$/i.exec(t);
    if (m) {
        const verb = m[1].toLowerCase();
        const rest = norm(m[2]);
        if (/^(is|are|does|do|did|can)\b/.test(rest)) out.push(`"I Can ${verb}" followed by "${rest.split(' ')[0]}"`);
        const lab = norm(label);
        const w0 = lab.split(' ')[0];
        if (lab && rest.startsWith(lab) && w0 !== verb && (VERBS.has(w0) || /^(is|are|does|do)$/.test(w0))) out.push(`the label pasted after "I Can ${verb}"`);
    }
    if (/\b([a-z]+) \1\b/i.test(t.replace(/\d+/g, ''))) out.push('a doubled word');
    return out;
}

/** The sign choices a word-work cell may draw for a skill that deals `dealt` at grade `grade`. */
export function allowedSigns(dealt, grade) {
    const d = new Set(dealt);
    const g = String(grade).toUpperCase();
    const early = g === 'K' || g === '1' || g === '2';
    if (early) return d.has('+') || d.has('-') ? new Set(['+', '-']) : d;
    const a = new Set(d);
    for (const o of d) a.add(INVERSE[o]);
    return a;
}

/**
 * The findings of one skill from its facts: [{rule, key, sig, msg}]. Pure.
 * facts: {key, id, label, grade, ccss, iCan, fillers, items: [{kind, template, ops, ans, maxAns, ww, resp}]}
 */
export function judgeSkill(f, rules = RULES) {
    const out = [];
    const add = (rule, sig, msg) => { if (rules.includes(rule) && !out.some((x) => x.rule === rule && x.sig === sig)) out.push({ rule, key: f.key, sig, msg }); };
    const items = (f.items || []).filter((it) => it.kind !== 'error');
    if (!items.length) return out;
    const kit = items.filter((it) => it.kind === 'kit');
    // VQ-REP
    if (isRelationSkill(f)) {
        const bare = items.filter((it) => !drawsRelation(it));
        if (bare.length) {
            const what = [...new Set(bare.map((it) => (it.kind === 'kit' ? `template ${it.template}` : it.kind)))].join(', ');
            add('VQ-REP', 'relation-not-drawn', `names a relation but ${bare.length} of ${items.length} item(s) draw no bond / family / ten frame / bar (${what})`);
        }
    }
    // VQ-ONEANSWER
    for (const it of items) {
        const r = it.resp;
        if (!r) continue;
        if (r.sayBlanks) add('VQ-ONEANSWER', 'say-blanks', `a "Say:" frame with blanks inside the cell (${it.kind === 'kit' ? it.template : 'legacy'}): the oral frame belongs to the model, not the answer place`);
        if (r.choice > 0 && r.answerLine) add('VQ-ONEANSWER', 'choice+answer-line', 'a tick / choice list AND an "Answer:" line for one answer');
    }
    // VQ-LIVE (word-work)
    const ww = kit.filter((it) => it.template === 'word-work' && it.ww);
    if (ww.length) {
        const dealt = [...new Set(ww.flatMap((it) => it.ops || []))];
        const ok = allowedSigns(dealt, f.grade);
        const drawn = [...new Set(ww.flatMap((it) => it.ww.signs))];
        const dead = drawn.filter((o) => !ok.has(o)).sort();
        if (dead.length) add('VQ-LIVE', `dead-signs:${dead.join('')}`, `sign row offers ${dead.map((o) => GLYPH[o]).join(' ')} on a grade ${f.grade} skill that deals ${dealt.map((o) => GLYPH[o]).join(' ') || 'nothing'}`);
        const maxAns = Math.max(...ww.map((it) => Number(it.maxAns) || 0));
        if (maxAns <= 20 && ww.some((it) => it.ww.grid)) add('VQ-LIVE', 'grid-within-20', `a column digit grid on stories whose answers are all ≤ 20 (largest ${maxAns}): count on / make ten, not the column algorithm`);
        const fill = new Set(f.fillers || DEFAULT_FILLERS);
        const fillers = [...new Set(ww.flatMap((it) => it.ww.bank.filter((w) => fill.has(w) && !new RegExp(`\\b${w}\\b`, 'i').test(it.ww.story))))].sort();
        if (fillers.length) add('VQ-LIVE', 'filler-bank', `unit bank holds filler word(s) the story never says: ${fillers.join(', ')}`);
    }
    // VQ-TITLE
    const tp = titleProblems(f.iCan, f.label);
    if (tp.length) add('VQ-TITLE', 'title', `"${f.iCan}": ${tp.join('; ')}`);
    // VQ-NOLEGACY
    if (!kit.length) add('VQ-NOLEGACY', 'no-kit-cell', `no kit cell on any of ${items.length} item(s) (${[...new Set(items.map((it) => it.kind))].join(', ')})`);
    return out;
}

/* ====================================================================== the app side (worker) */

async function loadApp(root) {
    const M = (p) => pathToFileURL(join(root, 'js', 'modules', p)).href;
    const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    const store = {};
    globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
    globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
    for (const k of ['log', 'warn', 'error', 'info', 'debug']) console[k] = () => {};
    const gq = await import(M('generate-question.js'));
    const data = await import(M('data.js'));
    for (const side of ['skill-options.js', 'skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) { try { await import(M(side)); } catch (e) { /* not in this tree */ } }
    const pg = await import(M('print-generate.js'));
    try { await import(M('print-sheet.js')); } catch (e) { /* providers register through it; skillWords still answers */ }
    const kit = await import(M('sheet/index.js'));
    const practice = await import(M('sheet/roles/practice.js'));
    let standards = null; try { standards = await import(M('standards.js')); } catch (e) { standards = null; }
    let fillers = DEFAULT_FILLERS;
    try { const m = /const FILLERS = \[([^\]]*)\]/.exec(readFileSync(join(root, 'js/modules/sheet/cells/word-work.js'), 'utf8')); if (m) fillers = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]); } catch (e) { /* default */ }
    return { gq, data, pg, kit, practice, standards, fillers };
}

/** The facts of one skill (see judgeSkill). `items` given (a fixture) or generated. */
function factsOf(app, s, n, given) {
    const { gq, data, pg, kit, practice, standards, fillers } = app;
    const key = `${s.cat}:${s.id}`;
    let grade = s.grade;
    if (grade === undefined) { try { grade = data.getSkillGrade(s.id, s.cat); } catch (e) { grade = ''; } }
    let ccss = s.ccss;
    if (!ccss) { try { ccss = (standards && standards.standardsEntry(s.cat, s.id) || {}).ccss || []; } catch (e) { ccss = []; } }
    const label = s.label || (data.SKILL_FULL_LABELS && data.SKILL_FULL_LABELS[s.id]) || s.id;
    const items = [];
    let first = null;
    for (let i = 0; i < (given ? given.length : n); i++) {
        let q;
        try { q = given ? given[i] : gq.generateQuestionFor({ category: s.cat, skill: s.id, seed: (fnv(key) % 100000) * 100 + i, itemIndex: i, itemCount: n }); }
        catch (e) { items.push({ kind: 'error', msg: String(e && e.message || e).slice(0, 120) }); continue; }
        if (!q) { items.push({ kind: 'error', msg: 'no item' }); continue; }
        first = first || q;
        let spec = null;
        try { spec = pg.kitCellSpec(Object.assign({ skillId: s.id, categoryId: s.cat }, q)); } catch (e) { spec = null; }
        if (spec) {
            const payload = spec.payload || (q.cell && q.cell.payload) || {};
            let html = '';
            try { html = kit.renderCell({ cell: { template: spec.template, payload } }, { mode: 'print', size: 'M', state: 'blank' }); } catch (e) { html = ''; }
            const it = { kind: 'kit', template: spec.template, resp: responseAreas(html) };
            if (spec.template === 'word-work') {
                const steps = Array.isArray(payload.steps) ? payload.steps : [];
                it.ops = [...new Set(steps.map((st) => OPKEY[st.op]).filter(Boolean))];
                it.maxAns = Math.max(Number(payload.ans) || 0, ...steps.map((st) => Math.max(Number(st.ans) || 0, Number(st.top) || 0, Number(st.a) || 0, Number(st.b) || 0)));
                it.ww = wordWorkParts(html, payload);
            }
            items.push(it);
        } else if (q.visual) items.push({ kind: 'legacy', resp: responseAreas(q.visual) });
        else items.push({ kind: 'text', resp: null });
    }
    let iCan = s.iCan;
    if (iCan === undefined) {
        try { iCan = practice.skillWords({ categoryId: s.cat, skillId: s.id, label, answerType: first && first.answerType, printFormat: first && first.printFormat }).iCan; } catch (e) { iCan = ''; }
    }
    return { key, id: s.id, cat: s.cat, label, grade: String(grade ?? ''), ccss, iCan, fillers, items };
}

if (!isMainThread) {
    const app = await loadApp(workerData.root);
    parentPort.on('message', (m) => {
        if (m.cmd === 'skill') {
            // the watchdog's own test: VQ_TEST_HANG=cat:skill makes that skill spin forever
            if (process.env.VQ_TEST_HANG === `${m.skill.cat}:${m.skill.id}`) for (;;) { /* hang */ }
            let facts;
            try { facts = factsOf(app, m.skill, m.n); } catch (e) { facts = { key: `${m.skill.cat}:${m.skill.id}`, items: [{ kind: 'error', msg: String(e && e.message || e) }] }; }
            parentPort.postMessage({ key: facts.key, facts });
        }
    });
    parentPort.postMessage({ ready: true });
}

/* ====================================================================== self-test */

function selfTest() {
    let n = 0; const bad = [];
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    // titles
    eq('garbled fact family title', titleProblems('I Can add is it a fact family? +/−', 'Is It a Fact Family? (+/−)').length > 0, true);
    eq('good fact family title', titleProblems('I Can tell if three numbers make a fact family', 'Is It a Fact Family? (+/−)'), []);
    eq('good add title', titleProblems('I Can solve addition stories (sums to 20)', 'Addition Word Problems (within 20)'), []);
    eq('two verbs', titleProblems('I Can make regroup with base-10 blocks', 'Regroup with Base-10 Blocks').some((x) => /label pasted/.test(x)), true);
    eq('time to the hour is fine', titleProblems('I Can tell time to the hour', 'Time to the Hour'), []);
    eq('which is fine', titleProblems('I Can tell which has more money', 'Which Has More Money?'), []);
    eq('×/÷ pair', titleProblems('I Can divide missing factors ×/÷', 'Missing Factors ×/÷').length, 1);
    eq('make 10 is fine', titleProblems('I Can make 10', 'Make 10'), []);
    eq('doubled word', titleProblems('I Can add add within 10', '').includes('a doubled word'), true);
    // relation skills
    eq('fact family sort is relation', isRelationSkill({ id: 'fact_family_sort', label: 'Is It a Fact Family? (+/−)' }), true);
    eq('make ten is relation', isRelationSkill({ id: 'make_ten', label: 'Make 10' }), true);
    eq('K.OA.4 is relation', isRelationSkill({ id: 'x', label: 'x', ccss: ['K.OA.A.4'] }), true);
    eq('add within 10 is not', isRelationSkill({ id: 'add_10', label: 'Add within 10', ccss: ['K.OA.A.5'] }), false);
    // response areas
    const legacy = '<div class="ws-v2-cell"><div><span style="min-width:5.5em;">Yes</span><span style="display:inline-block;width:1.1em;height:1.1em;border:1.5px solid #000;"></span></div><div style="margin-top:10px;">Say: <span style="display:inline-block;width:2.2em;border-bottom:0.75pt solid #000;">&nbsp;</span> and</div></div>';
    eq('legacy tick + say', responseAreas(legacy), { choice: 1, answerLine: false, sayBlanks: true });
    eq('kit ungraded choice is scratch', responseAreas('<span data-ws-slot="op0-add" data-ws-shape="choice" data-ws-graded="0">+</span><span>Answer:</span>').choice, 0);
    eq('kit graded check + Answer', responseAreas('<div data-ws-slot="answer" data-ws-shape="check">x</div><span style="x">Answer:</span>'), { choice: 1, answerLine: true, sayBlanks: false });
    // word-work parts
    const wwHtml = '<span data-ws-slot="op0-add" data-ws-shape="choice" data-ws-graded="0">+</span><span data-ws-slot="op0-divide" data-ws-shape="choice" data-ws-graded="0">÷</span><div class="mq-wwcols mq-x" role="group"></div><div class="mq-wwwords" aria-label="label words" style="x"><span>shells</span><span>boxes</span></div>';
    const parts = wordWorkParts(wwHtml, { lines: ['Ben has 9 shells.'] });
    eq('ww signs', parts.signs, ['+', '/']);
    eq('ww grid', parts.grid, true);
    eq('ww bank', parts.bank, ['shells', 'boxes']);
    eq('frames: sign written, no grid', wordWorkParts('<span data-ws-slot="op0" data-ws-shape="circle" data-ws-graded="0"></span>', {}).signs, []);
    // rules
    const wwItem = (signs, grid, bank, ans = 12) => ({ kind: 'kit', template: 'word-work', ops: ['+'], maxAns: ans, ww: { signs, grid, bank, story: 'Ben has 9 shells. Lena has 3 shells.' }, resp: { choice: 0, answerLine: false, sayBlanks: false } });
    const base = { key: 'addition:add_wp_20', id: 'add_wp_20', label: 'Addition Word Problems (within 20)', grade: '1', ccss: ['1.OA.A.1'], iCan: 'I Can solve addition stories (sums to 20)' };
    eq('VQ-LIVE fails the base word-work', judgeSkill({ ...base, items: [wwItem(['+', '-', '*', '/'], true, ['shells', 'boxes', 'days'])] }).map((x) => x.sig), ['dead-signs:*/', 'grid-within-20', 'filler-bank']);
    eq('VQ-LIVE passes the sentence layout', judgeSkill({ ...base, items: [wwItem([], false, [])] }), []);
    eq('VQ-LIVE: + − on a K-2 add page is allowed', judgeSkill({ ...base, items: [wwItem(['+', '-'], false, [])] }), []);
    eq('VQ-LIVE: grade 3 × page may offer ÷, not +', judgeSkill({ ...base, grade: '3', items: [{ ...wwItem(['+', '*', '/'], false, []), ops: ['*'], maxAns: 40 }] }).map((x) => x.sig), ['dead-signs:+']);
    const ffs = { key: 'addition:fact_family_sort', id: 'fact_family_sort', label: 'Is It a Fact Family? (+/−)', grade: '1', ccss: ['1.OA.B.3'], iCan: 'I Can add is it a fact family? +/−' };
    eq('fact_family_sort base fails four rules', judgeSkill({ ...ffs, items: [{ kind: 'legacy', resp: { choice: 2, answerLine: false, sayBlanks: true } }] }).map((x) => x.rule), ['VQ-REP', 'VQ-ONEANSWER', 'VQ-TITLE', 'VQ-NOLEGACY']);
    eq('fact_family_sort fixed passes', judgeSkill({ ...ffs, iCan: 'I Can tell if three numbers make a fact family', items: [{ kind: 'kit', template: 'family-check', resp: { choice: 2, answerLine: false, sayBlanks: false } }] }), []);
    eq('--rules filters', judgeSkill({ ...ffs, items: [{ kind: 'legacy', resp: null }] }, ['VQ-TITLE']).map((x) => x.rule), ['VQ-TITLE']);
    eq('baseline sig key', pinKey({ rule: 'VQ-LIVE', key: 'a:b', sig: 'grid-within-20' }), 'VQ-LIVE|a:b|grid-within-20');
    console.log(bad.length ? `${TOOL}: FAIL (self-test, ${bad.length} of ${n})\n  ${bad.join('\n  ')}` : `${TOOL}: OK (self-test, ${n} cases)`);
    process.exit(bad.length ? 1 : 0);
}

export const pinKey = (f) => `${f.rule}|${f.key}|${f.sig}`;

/* ====================================================================== main */

async function main() {
    const argv = process.argv.slice(2);
    const has = (f) => argv.includes(f);
    const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
    const argAll = (f) => argv.flatMap((a, i) => (a === f && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
    const usage = (msg) => { console.log(`${TOOL}: ${msg}\nusage: node tests/scripts/${TOOL}.mjs [--skill cat:skill] [--category c] [--rules VQ-REP,...] [--fixture f] [--root dir] [--n 6] [--jobs 4] [--timeout 45] [--json out] [--baseline f | --no-baseline] [--write-baseline] [--report-only] [--self-test]`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); };
    const VALUED = new Set(['--skill', '--category', '--rules', '--fixture', '--root', '--n', '--jobs', '--timeout', '--json', '--baseline']);
    const FLAGS = new Set(['--no-baseline', '--write-baseline', '--report-only', '--self-test']);
    for (let i = 0; i < argv.length; i++) {
        if (VALUED.has(argv[i])) { i++; continue; }
        if (!FLAGS.has(argv[i])) usage(`unknown argument ${argv[i]}`);
    }
    if (has('--self-test')) return selfTest();
    const ROOT = resolve(arg('--root', process.env.MQ_ROOT || SCRIPT_ROOT));
    const rules = argAll('--rules').length ? argAll('--rules') : RULES;
    for (const r of rules) if (!RULES.includes(r)) usage(`unknown rule ${r} (rules: ${RULES.join(', ')})`);
    const N = Number(arg('--n', 6));
    const JOBS = Math.max(1, Number(arg('--jobs', Math.min(4, cpus().length || 2))));
    const TIMEOUT = Math.max(5, Number(arg('--timeout', 45))) * 1000;
    const T0 = Date.now();
    const baseFile = resolve(SCRIPT_ROOT, arg('--baseline', 'tests/fixtures/precritic/vq-baseline.json'));
    const useBase = !has('--no-baseline') && !arg('--fixture', null);

    let factsList = [];
    const notes = [];
    const fixture = arg('--fixture', null);
    let live = [];
    if (fixture) {
        // a fixture: {default: {skills: [{key, label, grade, ccss, iCan?, items: [q, ...]}]}}; drawn by THIS tree's kit
        const fx = (await import(pathToFileURL(isAbsolute(fixture) ? fixture : resolve(SCRIPT_ROOT, fixture)).href)).default;
        // (the app logs while it loads and draws: quiet in this thread only for that, then this tool's report prints)
        const loud = Object.fromEntries(['log', 'warn', 'error', 'info', 'debug'].map((k) => [k, console[k]]));
        try {
            const app = await loadApp(ROOT);
            for (const s of fx.skills || []) {
                const [cat, id] = s.key.split(':');
                factsList.push(factsOf(app, { cat, id, label: s.label, grade: s.grade, ccss: s.ccss || [], iCan: s.iCan }, (s.items || []).length, s.items || []));
            }
        } finally { Object.assign(console, loud); }
    } else {
        // the live skill list, in a worker (the main thread keeps a clean global scope for the watchdog)
        const { data } = await (async () => {
            const w = new Worker(`import { pathToFileURL } from 'node:url'; import { parentPort, workerData } from 'node:worker_threads';
                globalThis.window = globalThis; globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
                const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
                globalThis.document = stub(); for (const k of ['log','warn','error','info','debug']) console[k] = () => {};
                const d = await import(pathToFileURL(workerData.root + '/js/modules/data.js').href);
                const live = [];
                for (const [cat, list] of Object.entries(d.SKILLS)) for (const s of list || []) { if (!s || !s.v || s.retired || s.tombstone || s.hidden) continue; live.push({ cat, id: s.v, label: s.l || '' }); }
                parentPort.postMessage(live);`, { eval: true, workerData: { root: ROOT } });
            const d = await new Promise((res, rej) => { w.once('message', res); w.once('error', rej); });
            await w.terminate();
            return { data: d };
        })();
        live = data;
        let scope = live;
        const want = argAll('--skill');
        const cat = arg('--category', null);
        if (want.length) {
            const keys = new Set(live.map((s) => `${s.cat}:${s.id}`));
            const unknown = want.filter((k) => !keys.has(k));
            if (unknown.length) usage(`not a live skill: ${unknown.join(', ')}`);
            scope = live.filter((s) => want.includes(`${s.cat}:${s.id}`));
        }
        if (cat) scope = scope.filter((s) => s.cat === cat);
        if (!scope.length) usage('no skill in scope');
        // a known hang is skipped in a sweep; named with --skill it runs, under the watchdog
        const skipOf = (s) => SKIP[`${s.cat}:${s.id}`] && !want.includes(`${s.cat}:${s.id}`);
        for (const s of scope.filter(skipOf)) notes.push(`skipped ${s.cat}:${s.id}: ${SKIP[`${s.cat}:${s.id}`]}`);
        const todo = scope.filter((s) => !skipOf(s));
        factsList = await runPool(ROOT, todo, N, JOBS, TIMEOUT, notes);
    }

    // judge
    const findings = factsList.flatMap((f) => judgeSkill(f, rules));
    const timeouts = factsList.filter((f) => f.timeout);
    for (const f of timeouts) findings.push({ rule: 'VQ-RUN', key: f.key, sig: 'timeout', msg: `no answer in ${TIMEOUT / 1000} s (a hang in node: add it to SKIP with the reason, or fix the generator)` });
    const errored = factsList.filter((f) => !f.timeout && (f.items || []).length && f.items.every((it) => it.kind === 'error'));
    for (const f of errored) notes.push(`${f.key}: every item errored (${f.items[0].msg}); nothing judged`);

    // the baseline
    let base = { rules: {} };
    if (useBase && existsSync(baseFile)) base = JSON.parse(readFileSync(baseFile, 'utf8'));
    const pinned = new Set();
    for (const [rule, m] of Object.entries(base.rules || {})) for (const [k, sigs] of Object.entries(m)) for (const s of sigs) pinned.add(`${rule}|${k}|${s}`);
    const baseErrors = [];
    for (const k of IN_SCOPE) for (const p of pinned) if (p.split('|')[1] === k) baseErrors.push(`${k} is the lane's own target and may not be pinned (${p})`);
    for (const [rule, cnt] of Object.entries(base.frozenCounts || {})) {
        const now = Object.values((base.rules || {})[rule] || {}).reduce((a, s) => a + s.length, 0);
        if (now > cnt) baseErrors.push(`${rule}: the pin holds ${now} finding(s), above its frozen ${cnt} (the baseline may only shrink)`);
    }
    for (const f of findings) f.pinned = pinned.has(pinKey(f));
    const found = new Set(findings.map(pinKey));
    const judgedKeys = new Set(factsList.map((f) => f.key));
    const stale = [...pinned].filter((p) => rules.includes(p.split('|')[0]) && judgedKeys.has(p.split('|')[1]) && !found.has(p));

    if (has('--write-baseline')) {
        if (!existsSync(baseFile) || argAll('--skill').length || arg('--category', null) || argAll('--rules').length) usage('--write-baseline needs the full run (no --skill / --category / --rules) and an existing pin (it only shrinks)');
        const keep = {};
        for (const p of pinned) if (found.has(p)) { const [r, k, s] = p.split('|'); ((keep[r] ??= {})[k] ??= []).push(s); }
        for (const r of Object.keys(keep)) keep[r] = Object.fromEntries(Object.entries(keep[r]).sort(([a], [b]) => a.localeCompare(b)).map(([k, s]) => [k, s.sort()]));
        const counts = Object.fromEntries(Object.entries(keep).map(([r, m]) => [r, Object.values(m).reduce((a, s) => a + s.length, 0)]));
        writeFileSync(baseFile, `${JSON.stringify({ ...base, rules: keep, frozenCounts: counts }, null, 1)}\n`);
        console.log(`${TOOL}: baseline rewritten (${[...pinned].length - stale.length} pinned kept, ${stale.length} stale dropped)`);
    }

    // the register (§4.1 item 5)
    let passed = new Set();
    try { passed = (await import(pathToFileURL(join(ROOT, 'js/modules/redesign-passed.js')).href)).REDESIGN_PASSED || new Set(); } catch (e) { passed = new Set(); }
    const tplOf = (f) => new Set((f.items || []).filter((it) => it.kind === 'kit').map((it) => it.template));
    const passedTpl = new Set(factsList.filter((f) => passed.has(f.key)).flatMap((f) => [...tplOf(f)]));
    const reg = { PASSED: 0, 'TEMPLATE-ONLY': 0, 'NEVER-GRADED': 0 };
    for (const f of factsList) reg[passed.has(f.key) ? 'PASSED' : [...tplOf(f)].some((t) => passedTpl.has(t)) ? 'TEMPLATE-ONLY' : 'NEVER-GRADED']++;

    // report
    const bySkill = new Map();
    for (const f of findings) (bySkill.get(f.key) || bySkill.set(f.key, []).get(f.key)).push(f);
    console.log(`${TOOL}: ${factsList.length} skill(s), ${N} item(s) each, rules ${rules.join(' ')}; app ${ROOT === SCRIPT_ROOT ? '.' : ROOT}`);
    for (const f of factsList) {
        const fs = bySkill.get(f.key) || [];
        const status = fs.some((x) => !x.pinned) ? 'FAIL  ' : fs.length ? 'PINNED' : 'OK    ';
        if (status !== 'OK    ' || factsList.length <= 40 || argAll('--skill').length) console.log(`  ${status} ${f.key}${f.timeout ? ' (timed out)' : ''}`);
        for (const x of fs) console.log(`      ${x.pinned ? 'pinned' : 'FAIL  '} ${x.rule} ${x.msg}`);
    }
    for (const p of stale) console.log(`  stale pin (no longer found; --write-baseline drops it): ${p}`);
    for (const nt of notes) console.log(`  note ${nt}`);
    for (const e of baseErrors) console.log(`  BASELINE ${e}`);
    const perRule = Object.fromEntries([...rules, 'VQ-RUN'].map((r) => [r, { fail: findings.filter((x) => x.rule === r && !x.pinned).length, pinned: findings.filter((x) => x.rule === r && x.pinned).length }]));
    console.log(`  per rule: ${Object.entries(perRule).filter(([r, v]) => r !== 'VQ-RUN' || v.fail).map(([r, v]) => `${r} ${v.fail} new / ${v.pinned} pinned`).join('; ')}`);
    console.log(`  register: PASSED ${reg.PASSED}, TEMPLATE-ONLY ${reg['TEMPLATE-ONLY']}, NEVER-GRADED ${reg['NEVER-GRADED']} (js/modules/redesign-passed.js; "passed" is only the first)`);
    if (arg('--json', null)) writeFileSync(resolve(arg('--json')), JSON.stringify({ tool: TOOL, root: ROOT, rules, n: N, skills: factsList.length, findings, stale, notes, register: reg, baseErrors }, null, 1));
    const newF = findings.filter((x) => !x.pinned);
    const failSkills = new Set(newF.map((x) => x.key));
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    const summary = `${factsList.length} skill(s), ${findings.length - newF.length} pinned finding(s), ${stale.length} stale pin(s), ${secs} s`;
    if (newF.length || baseErrors.length) {
        console.log(`${TOOL}: FAIL (${newF.length + baseErrors.length}) ${failSkills.size} skill(s) with new findings${baseErrors.length ? `, ${baseErrors.length} baseline error(s)` : ''}; ${summary}`);
        process.exit(has('--report-only') ? 0 : 1);
    }
    console.log(`${TOOL}: OK (${summary})`);
    process.exit(0);
}

/** Each skill in a worker, with a per-skill watchdog: a skill that does not answer in time kills its worker (recorded). */
async function runPool(root, todo, n, jobs, timeout, notes) {
    const out = new Map();
    let next = 0;
    const one = () => new Promise((done) => {
        let w = null, cur = null, timer = null;
        const start = () => {
            w = new Worker(SCRIPT, { workerData: { root } });
            w.on('message', (m) => {
                if (m.ready) return feed();
                clearTimeout(timer);
                out.set(m.key, m.facts);
                feed();
            });
            w.on('error', (e) => { clearTimeout(timer); if (!cur) { notes.push(`worker failed to load the app: ${String(e && e.message || e).slice(0, 200)}`); next = todo.length; done(); return; } if (cur) { out.set(`${cur.cat}:${cur.id}`, { key: `${cur.cat}:${cur.id}`, items: [{ kind: 'error', msg: `worker: ${String(e && e.message || e).slice(0, 100)}` }] }); } restart(); });
        };
        const restart = () => { try { w.terminate(); } catch (e) { /* gone */ } if (next < todo.length) start(); else done(); };
        const feed = () => {
            if (next >= todo.length) { cur = null; w.terminate().then(done); return; }
            cur = todo[next++];
            timer = setTimeout(() => {
                const key = `${cur.cat}:${cur.id}`;
                out.set(key, { key, timeout: true, items: [] });
                cur = null;
                restart();
            }, timeout);
            w.postMessage({ cmd: 'skill', skill: cur, n });
        };
        start();
    });
    await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, one));
    return todo.map((s) => out.get(`${s.cat}:${s.id}`)).filter(Boolean);
}

if (isMainThread && resolve(process.argv[1] || "") === SCRIPT) await main();
