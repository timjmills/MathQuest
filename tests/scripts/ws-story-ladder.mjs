#!/usr/bin/env node
// ws-story-ladder — LADDER: a page that deals several story kinds deals them in the card's ladder order, and a Guided /
// lesson page practises only the kind its Model shows (word-stories critic r1 F6, 2026-11-13: the compare preset's
// independent page dealt 2 'fewer than' items then 9 trap items, the practice card opened on the trap, Guided practised the
// trap under a 'fewer' Model, and the lesson modelled the trap while it practised 'fewer'). PEDAGOGY P-1, P-WP-1, P-WP-3.
//
//   node tests/scripts/ws-story-ladder.mjs                                  # the word-stories skills (4 hosts + 3 presets)
//   node tests/scripts/ws-story-ladder.mjs --skill subtraction:sub_wp_compare_smaller [--skill a:b,c:d]
//   node tests/scripts/ws-story-ladder.mjs --root <tree> | MQ_ROOT=<tree>
//
// CONFIGS: the skill's default options, and on a host the multi-kind ticks [0, 3], [3, 4, 5], [4, 5] (each a ladder of
// kinds in list order). A config dealing one kind only is not judged. The deal is print-sheet's: item i =
// generateQuestionFor({opts, seed: base + i, itemIndex: i, itemCount}) with itemCount unset (the count left to the page)
// and set to the page's count. The kind is the item's story tag (q.wpSchema, else q._variant).
//
//   LADDER-FIRST   item 0 is the ladder's first kind (the consistent 'fewer than' before the trap)
//   LADDER-PAGE    on a first page of 4 to 12 items no kind outnumbers the kind before it in the ladder
//   GUIDED-SUBSET  a Model + 3 Guided page (items 0-3, itemCount unset and 4): every Guided kind is the Model's kind
//   SCREEN-FIRST   the practice card's first question (no item index; gameMode practice, question 1) is the first kind
//   LESSON-SAME    a skill with a lesson (lessons/library.js practiceRef): its Model / Guided / Practice deal (items 0-7
//                  with the lesson's practice options) is ONE kind
//
// Last line `ws-story-ladder: OK (...)`, `FAIL (n) ...` or `N/A (...)` (exit 4: no skill in scope deals story kinds).

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-story-ladder';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const argAll = (f) => argv.flatMap((a, i) => (a === f && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    if (!['--skill', '--root'].includes(argv[i])) { console.log(`${TOOL}: unknown flag ${argv[i]}`); process.exit(2); }
    i++;
}
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || HERE));
const DEFAULT_SKILLS = [
    'addition:add_word_problems', 'addition:add_word_problems_plain', 'subtraction:sub_word_problems', 'subtraction:sub_word_problems_plain',
    'addition:add_wp_change_unknown', 'subtraction:sub_wp_change_unknown', 'subtraction:sub_wp_compare_smaller',
];
const SKILLS = argAll('--skill').length ? argAll('--skill') : DEFAULT_SKILLS;
const HOST_TICKS = [[0, 3], [3, 4, 5], [4, 5]];
// The card's ladder (word-stories card §3, P-WP-2 / P-WP-3; the forms help: "What is left is the easiest; the start is the
// hardest"): the forms positions, easiest first. A page's kinds come in this order.
const LADDER = { add: [0, 2, 3, 1], sub: [0, 1, 3, 4, 5, 2] };
const fnv = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

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
        const st = await import(M('state.js'));
        let lib = null; try { lib = await import(M('lessons/library.js')); } catch (e) { lib = null; }
        return { gq, so, state: st.state, lib };
    } finally { for (const k of Object.keys(quiet)) console[k] = quiet[k]; }
}

async function main() {
    const { gq, so, state, lib } = await loadApp(ROOT);
    const findings = [];
    let judged = 0;
    const kindOf = (q) => (q && (q.wpSchema || q._variant)) || '?';
    const deal = (cat, id, opts, n, itemCount, tag) => {
        const base = (fnv(`${cat}:${id}|${tag}`) % 100000) * 100;
        const out = [];
        for (let i = 0; i < n; i++) {
            let q = null;
            const quiet = console.log; console.log = () => {};
            try { q = gq.generateQuestionFor(Object.assign({ category: cat, skill: id, seed: base + i, itemIndex: i, itemCount }, opts ? { opts } : {})); } catch (e) { q = null; } finally { console.log = quiet; }
            out.push(kindOf(q));
        }
        return out;
    };
    for (const key of SKILLS) {
        const [cat, id] = key.split(':');
        let defs = [];
        try { defs = so.offeredOptionsFor(cat, id) || []; } catch (e) { defs = []; }
        const forms = defs.find((d) => d.id === 'forms');
        if (!forms) continue;
        const configs = [null];
        if (/^(add|sub)_word_problems(_plain)?$/.test(id)) {
            const vals = (forms.values || []).map((v) => v.v);
            for (const t of HOST_TICKS) if (t.every((v) => vals.includes(v))) configs.push({ forms: t });
        }
        for (const opts of configs) {
            const tag = opts ? JSON.stringify(opts) : 'default';
            const where = `${key} ${tag}`;
            const ladderOf = (kinds) => { const seen = []; for (const k of kinds) if (!seen.includes(k)) seen.push(k); return seen; };
            // the expected ladder: each ticked value's own kind (the value dealt alone), in the card's order
            const ticks = opts ? opts.forms : (forms.default || []).map(Number);
            const host = cat === 'addition' ? 'add' : 'sub';
            const pre = !/^(add|sub)_word_problems(_plain)?$/.test(id);
            const hostId = pre ? (host === 'add' ? 'add_word_problems' : 'sub_word_problems') : id;
            const rank = LADDER[host];
            const ordered = ticks.slice().sort((x, y) => rank.indexOf(x) - rank.indexOf(y));
            const ladder = ladderOf(ordered.map((v) => deal(cat, hostId, Object.assign({}, opts || {}, { forms: [v] }, pre ? { band: 20 } : {}), 1, undefined, `${tag}|${v}`)[0]));
            if (ladder.length < 2) continue;
            judged++;
            const run = deal(cat, id, opts, 24, undefined, tag);
            if (run[0] !== ladder[0]) findings.push(`${where}: LADDER-FIRST item 0 is ${run[0]}, the ladder's first kind is ${ladder[0]}`);
            for (const ic of [undefined, 'page']) {
                for (let P = 4; P <= 12; P++) {
                    const page = deal(cat, id, opts, P, ic === 'page' ? P : undefined, tag);
                    if (page[0] !== ladder[0]) { findings.push(`${where}: LADDER-FIRST page of ${P} (itemCount ${ic || 'unset'}) opens on ${page[0]}`); continue; }
                    const cnt = ladder.map((k) => page.filter((x) => x === k).length);
                    for (let r = 1; r < ladder.length; r++) if (cnt[r] > cnt[r - 1]) { findings.push(`${where}: LADDER-PAGE page of ${P} (itemCount ${ic || 'unset'}) deals ${cnt[r]} ${ladder[r]} to ${cnt[r - 1]} ${ladder[r - 1]} (${page.join(' ')})`); break; }
                }
                const g = deal(cat, id, opts, 4, ic === 'page' ? 4 : undefined, tag);
                const off = g.slice(1).filter((k) => k !== g[0]);
                if (off.length) findings.push(`${where}: GUIDED-SUBSET Model ${g[0]}, Guided ${g.slice(1).join(' ')} (itemCount ${ic || 'unset'})`);
            }
            // the practice card: no item index, question 1 of a practice game
            const keep = { gameMode: state.gameMode, qCount: state.qCount };
            try {
                state.gameMode = 'practice'; state.qCount = 1;
                let q = null;
                const quiet = console.log; console.log = () => {};
                try { q = gq.generateQuestionFor(Object.assign({ category: cat, skill: id, seed: 4242 }, opts ? { opts } : {})); } catch (e) { q = null; } finally { console.log = quiet; }
                if (kindOf(q) !== ladder[0]) findings.push(`${where}: SCREEN-FIRST the practice card's question 1 is ${kindOf(q)}`);
            } finally { state.gameMode = keep.gameMode; state.qCount = keep.qCount; }
        }
        // the lesson
        let ref = null;
        try { ref = lib && typeof lib.practiceRef === 'function' ? lib.practiceRef(`skill:${key}`) : null; } catch (e) { ref = null; }
        if (ref && ref.categoryId === cat && ref.skillId === id) {
            const ks = deal(cat, id, ref.opts || null, 8, undefined, 'lesson');
            judged++;
            if (new Set(ks).size > 1) findings.push(`${key} lesson: LESSON-SAME its Model / Guided / Practice deal mixes ${[...new Set(ks)].join(' + ')} (${ks.join(' ')})`);
        }
    }
    for (const f of findings.slice(0, 40)) console.log(`  FAIL ${f}`);
    if (!judged) { console.log(`${TOOL}: N/A (no skill in ${SKILLS.join(', ')} deals more than one story kind)`); process.exit(4); }
    if (findings.length) { console.log(`${TOOL}: FAIL (${findings.length}) ${judged} ladder(s) judged`); process.exit(1); }
    console.log(`${TOOL}: OK (${judged} ladder(s) and lesson deal(s) judged: first kind first, page order kept, Guided = Model's kind)`);
}

main().catch((e) => { console.log(`${TOOL}: FAIL (crash: ${e && e.stack || e})`); process.exit(1); });
