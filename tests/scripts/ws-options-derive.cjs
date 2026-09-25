// Which settings does each skill's generator ACTUALLY read?  (owner request 2026-09-24)
//
//   node tests/scripts/ws-options-derive.cjs            # re-derive, write js/modules/skill-options-derived.js
//   node tests/scripts/ws-options-derive.cjs --check    # re-derive, exit 1 if the committed table is stale
//   node tests/scripts/ws-options-derive.cjs --skill add_facts --verbose
//
// "Design so every skill has options and a default" — but an option a generator ignores is a lie
// on a teacher's screen: he ticks "Up to 20", the page comes back identical, and he stops
// trusting every other control in the dialog. So nothing here is guessed from a skill's name or
// from reading its source. For every live skill it GENERATES the same 60 seeded items under
// different settings and keeps a setting only if the items change:
//
//   Max Number     ranges 10 · 20 · 50 · 100 · 1,000 · 10,000 · 100,000 · 1,000,000
//   Decimal places 0 · 1 · 2 · 3
//   Support level  3 · 2 · 1 · 0   (the universal option; kept only where it changes the item)
//
// Values whose 60 items are identical form one class, and ONE value per class is offered.
// A skill that caps at 100 therefore offers 10 · 20 · 50 · 100 and never "Up to 1,000", which
// would print exactly the same page as "Up to 100". Every item is generated through
// generateQuestionFor({ seed, itemIndex }) with the seed fixed per item, so the only thing that
// differs between two runs is the setting under test.
//
// DETERMINISM GUARD. Each skill is first generated TWICE at the same setting. If the two runs
// differ (a generator that reads the clock, or carries a cursor from item to item), comparing two
// settings would prove nothing, so the skill falls back to a coarser signature — the numbers in
// its text and answer only — and is marked `coarse`. If even that is unstable it is marked
// `unstable` and offered nothing.
//
// THE OPTION PATH (owner, 2026-09-25: "don't keep values that do nothing"). Phase 1 measures what
// the generator reads through the app SETTING (state.range / decimalPlaces). A value is then offered
// only if choosing it AS THE SKILL'S OWN OPTION ({ opts: { range: v } }, with the app setting left
// at its default) really changes the items: a mixed pool whose members drop the parent's options on
// the way down, or a generator that reads Max Number somewhere the option cannot reach, measured as
// "changes the items" in phase 1 and did nothing on the teacher's page. Phase 2 re-measures every
// kept value through the option and drops the ones that come back identical to the default, and the
// ones that make the skill refuse (return no item).
//
// A kept value must also move at least one item in six (a printed page of six should show it).
//
// POLICY, on top of the measurement (the same owner rule):
//   * K-2 skills (getSkillGrade 0-2) are never offered Decimal places: a decimal on a K-2 page is
//     outside the grade, whatever the generator does with it.
//   * "Whole numbers" (decimals 0) is not offered where the items at 0 still carry decimals: a
//     decimal skill that cannot be whole would break the value's own promise.
//
// The output is committed. Re-run this whenever a generator changes what it reads; --check is
// what a CI step would call.
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);
const N = parseInt(arg('n', '60'), 10);
const ONLY = arg('skill', null);
const VERBOSE = has('verbose');
const CHECK = has('check');
const OUT = path.join(ROOT, 'js', 'modules', 'skill-options-derived.js');

const RANGES = [10, 20, 50, 100, 1000, 10000, 100000, 1000000];
const DECIMALS = [0, 1, 2, 3];
const LEVELS = [3, 2, 1, 0];
const BASE_RANGE = 100;      // the app's default Max Number
const BASE_DECIMALS = 0;

// fnv1a, the same per-skill seed ws-content-audit uses, so item i is the same item in both tools.
function seedFor(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 1000000;
}

// Runs in the page. Returns one hash per requested configuration. A configuration with `grant`
// first registers a temporary measured entry for the skill (so its own `range` / `decimals` option
// is legal and reaches the generator), and puts the committed table back afterwards.
async function sampleInPage({ categoryId, skillId, n, baseSeed, configs }) {
    const SO = await import('/js/modules/skill-options.js');
    const DO = await import('/js/modules/skill-options-derived.js');
    const fnv = (s) => {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
        return (h >>> 0).toString(36);
    };
    // Strip what legitimately differs between two identical items: generated element ids and the
    // references to them, and the adaptive tag.
    const normVisual = (v) => String(v || '')
        .replace(/\s(id|for|aria-labelledby|aria-describedby)="[^"]*"/g, '')
        .replace(/url\(#[^)]*\)/g, 'url()')
        .replace(/href="#[^"]*"/g, 'href=""');
    const fine = (q) => {
        if (!q) return 'null';
        const keep = {};
        for (const k of Object.keys(q).sort()) {
            if (k === 'visual' || k === 'seed' || k === '_adaptiveLevel' || k === 'skillOptions') continue;
            const v = q[k];
            if (typeof v === 'function') continue;
            keep[k] = v;
        }
        let body;
        try { body = JSON.stringify(keep); } catch (e) { body = String(q.text) + '|' + String(q.ans); }
        // A run of 11+ numerals is a Date.now() stamp some widgets bake into an attribute.
        return (body + '§' + normVisual(q.visual)).replace(/\d{11,}/g, 'T');
    };
    const coarse = (q) => {
        if (!q) return 'null';
        const plain = (String(q.text || '') + ' ' + JSON.stringify(q.ans === undefined ? null : q.ans)).replace(/<[^>]+>/g, ' ');
        return (plain.match(/-?\d+(?:\.\d+)?/g) || []).join(',');
    };
    const stats = (list) => {
        let maxNum = 0, maxDp = 0;
        for (const t of list) for (const m of (t.match(/-?\d+(?:\.\d+)?/g) || [])) {
            const n = Math.abs(parseFloat(m));
            if (Number.isFinite(n) && n > maxNum) maxNum = n;
            const dp = m.includes('.') ? m.split('.')[1].length : 0;
            if (dp > maxDp) maxDp = dp;
        }
        return { maxNum, maxDp };
    };
    const out = [];
    for (const c of configs) {
        const f = [], k = [];
        if (c.grant) SO.registerDerivedOptions({ ...DO.DERIVED_OPTIONS, [`${categoryId}:${skillId}`]: c.grant });
        try {
            for (let i = 0; i < n; i++) {
                let q = null;
                try {
                    q = window.generateQuestionFor({
                        category: categoryId, skill: skillId, range: c.range, decimals: c.decimals,
                        opts: c.opts || {}, seed: baseSeed + i, itemIndex: i,
                    });
                } catch (e) { q = { __error: String((e && e.message) || e) }; }
                f.push(fine(q)); k.push(coarse(q));
            }
        } finally {
            if (c.grant) SO.registerDerivedOptions(DO.DERIVED_OPTIONS);
        }
        out.push({ fine: fnv(f.join('\n')), coarse: fnv(k.join('\n')), errors: f.filter(x => x.includes('__error')).length,
            nulls: f.filter(x => x === 'null').length, perFine: f.map(fnv), perCoarse: k.map(fnv), ...stats(k) });
    }
    return out;
}

// One value per class of identical outputs. The representative is the app default when it is in
// the class (so "Up to 100" is offered rather than "Up to 10" for a skill that caps at 100), and
// otherwise the smallest member, which is where that behaviour starts.
function distinct(values, hashes, prefer) {
    const classes = new Map();
    values.forEach((v, i) => {
        if (!classes.has(hashes[i])) classes.set(hashes[i], []);
        classes.get(hashes[i]).push(v);
    });
    return [...classes.values()]
        .map(members => (members.includes(prefer) ? prefer : members[0]))
        .sort((a, b) => a - b);
}

// A generator that loops for ever at some setting (a band too small for its constraints) would
// hang the whole sweep. Each configuration therefore gets a deadline; a setting that misses it is
// recorded under `hang`, is never offered, and the page is thrown away and reopened.
const DEADLINE_MS = parseInt(arg('deadline', '20000'), 10);
let app = null;
const problems = [];
async function boot() {
    if (app) { problems.push(...app.problems); try { await app.close(); } catch (e) { /* already gone */ } }
    app = await open({ seed: 1 });
    // Live play must not bias anything while we measure.
    await app.page.evaluate(() => { if (window.state) window.state.adaptiveModeEnabled = false; });
}
async function measure(s, baseSeed, config) {
    let timer;
    const deadline = new Promise(resolve => { timer = setTimeout(() => resolve(null), DEADLINE_MS); });
    const run = app.page.evaluate(sampleInPage, { categoryId: s.categoryId, skillId: s.skillId, n: N, baseSeed, configs: [config] })
        .then(r => r[0]).catch(() => null);
    const r = await Promise.race([run, deadline]);
    clearTimeout(timer);
    if (r === null) await boot();
    return r;
}

(async () => {
    await boot();
    const skills = await app.page.evaluate(() => {
        const out = [];
        for (const [categoryId, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) {
                if (s.retired || s.v === 'custom_mixed') continue;
                const grade = window.getSkillGrade ? window.getSkillGrade(s.v, categoryId) : null;
                out.push({ categoryId, skillId: s.v, label: s.l, meta: !!(window.isMixedMetaSkill && window.isMixedMetaSkill(s.v)), grade });
            }
        }
        return out;
    });
    const todo = ONLY ? skills.filter(s => s.skillId === ONLY) : skills;
    const table = {};
    const t0 = Date.now();
    let done = 0;
    for (const s of todo) {
        const key = `${s.categoryId}:${s.skillId}`;
        const baseSeed = seedFor(key);
        const base = { range: BASE_RANGE, decimals: BASE_DECIMALS };
        const configs = [
            base, base,                                                          // determinism
            ...RANGES.map(r => ({ range: r, decimals: BASE_DECIMALS })),
            ...DECIMALS.map(d => ({ range: BASE_RANGE, decimals: d })),
            ...LEVELS.map(l => ({ ...base, opts: { level: [l] } })),
        ];
        const res = [];
        for (const c of configs) res.push(await measure(s, baseSeed, c));
        const [a, b] = res;
        let mode = 'fine';
        if (!a || !b) mode = 'unstable';
        else if (a.fine !== b.fine) mode = a.coarse === b.coarse ? 'coarse' : 'unstable';
        // STATISTICAL FALLBACK. A generator that remembers the previous item (to avoid a repeat)
        // cannot reproduce a run exactly, but it can still be seen to read a setting: the largest
        // number and the most decimal places across 60 items move with Max Number and Decimals.
        // Two values are one class unless their largest numbers differ by half again, and the
        // two base runs must agree within that tolerance or nothing is concluded.
        const RATIO = 1.5;
        const near = (x, y) => (x === 0 && y === 0) || (Math.max(x, y) / Math.max(1e-9, Math.min(x, y)) < RATIO);
        // Not for a mixed pool: its items come from a different skill each time, so its largest
        // number measures the pool's luck, not a setting.
        if (mode === 'unstable' && !s.meta && a && b && near(a.maxNum, b.maxNum) && a.maxDp === b.maxDp) mode = 'stat';
        const statClasses = (vals, rs, key, prefer, same) => {
            const classes = [];
            vals.forEach((v, i) => {
                const r = rs[i];
                if (!r) return;
                const c = classes.find(cl => same(cl.x, r[key]));
                if (c) c.members.push(v); else classes.push({ x: r[key], members: [v] });
            });
            return classes.map(cl => (cl.members.includes(prefer) ? prefer : cl.members[0])).sort((p, q) => p - q);
        };
        // A hung setting gets a hash of its own that nothing else can share, and is then dropped.
        const h = (r, i) => (!r ? `HANG${i}` : mode === 'coarse' ? r.coarse : r.fine);
        const hangs = [];
        const rRes = res.slice(2, 2 + RANGES.length);
        const dRes = res.slice(2 + RANGES.length, 2 + RANGES.length + DECIMALS.length);
        const lRes = res.slice(2 + RANGES.length + DECIMALS.length);
        const entry = {};
        if (mode === 'stat') {
            RANGES.forEach((r, i) => { if (!rRes[i]) hangs.push(`range ${r}`); });
            DECIMALS.forEach((d, i) => { if (!dRes[i]) hangs.push(`decimals ${d}`); });
            const ranges = statClasses(RANGES, rRes, 'maxNum', BASE_RANGE, near);
            const decimals = statClasses(DECIMALS, dRes, 'maxDp', BASE_DECIMALS, (x, y) => x === y);
            if (ranges.length > 1) entry.range = ranges;
            if (decimals.length > 1) entry.decimals = decimals;
        } else if (mode !== 'unstable') {
            RANGES.forEach((r, i) => { if (!rRes[i]) hangs.push(`range ${r}`); });
            DECIMALS.forEach((d, i) => { if (!dRes[i]) hangs.push(`decimals ${d}`); });
            LEVELS.forEach((l, i) => { if (!lRes[i]) hangs.push(`level ${l}`); });
            const ok = (vals, rs) => vals.filter((v, i) => rs[i]);
            const ranges = distinct(ok(RANGES, rRes), rRes.filter(Boolean).map(h), BASE_RANGE);
            const decimals = distinct(ok(DECIMALS, dRes), dRes.filter(Boolean).map(h), BASE_DECIMALS);
            // Level: offered only when some level changes the item compared with the default [1].
            const lv = LEVELS.slice().sort((x, y) => x - y);
            const lvRes = lv.map(l => lRes[LEVELS.indexOf(l)]);
            const levels = distinct(ok(lv, lvRes), lvRes.filter(Boolean).map(h), 1);
            if (ranges.length > 1) entry.range = ranges;
            if (decimals.length > 1) entry.decimals = decimals;
            if (levels.length > 1) entry.level = levels.slice().sort((x, y) => y - x);
        }
        // ---- policy: no decimals on a K-2 page; no "Whole numbers" where 0 still deals decimals.
        if (entry.decimals && typeof s.grade === 'number' && s.grade <= 2) delete entry.decimals;
        if (entry.decimals) {
            const at0 = dRes[DECIMALS.indexOf(0)];
            if (at0 && at0.maxDp > 0) entry.decimals = entry.decimals.filter(d => d !== 0);
            if (entry.decimals.length < 2) delete entry.decimals;
        }
        // ---- phase 2: the option path. Each kept value, chosen as the skill's OWN option with the
        // app setting at its default, must change the items and must not make the skill refuse.
        const sameAsBase = (r) => (mode === 'stat' ? (near(r.maxNum, a.maxNum) && r.maxDp === a.maxDp)
            : mode === 'coarse' ? r.coarse === a.coarse : r.fine === a.fine);
        for (const [id, base0] of [['range', BASE_RANGE], ['decimals', BASE_DECIMALS]]) {
            if (!entry[id]) continue;
            const grant = { range: RANGES, decimals: DECIMALS };
            const keep = [];
            const seen = [];
            for (const v of entry[id]) {
                if (v === base0) { keep.push(v); continue; }
                const r = await measure(s, baseSeed, { ...base, opts: { [id]: v }, grant });
                if (!r || r.errors || r.nulls > a.nulls || sameAsBase(r)) continue;
                // It must change the page a teacher prints: at least one item in six, so a
                // six-item sheet can be expected to show it. A value that moves one item type in
                // ten (money_count "Up to 1,000" reaches only the rare mixed-bills item) reads as
                // "does nothing" on the page and is not offered.
                if (mode !== 'stat') {
                    const mine = mode === 'coarse' ? r.perCoarse : r.perFine;
                    const theirs = mode === 'coarse' ? a.perCoarse : a.perFine;
                    const moved = mine.filter((h, i) => h !== theirs[i]).length;
                    // A mixed pool must show it on one item in three: its members vary, so a thinner effect is luck.
                    if (moved < Math.ceil(mine.length / (s.meta ? 3 : 6))) continue;
                }
                // Two option values that print the same page are one choice (keep the first).
                const sig = mode === 'stat' ? `${r.maxNum}|${r.maxDp}` : mode === 'coarse' ? r.coarse : r.fine;
                if (seen.includes(sig)) continue;
                seen.push(sig);
                keep.push(v);
            }
            if (keep.filter(v => v !== base0).length) entry[id] = keep.sort((x, y) => x - y);
            else delete entry[id];
        }
        if (mode !== 'fine') entry.mode = mode;
        if (hangs.length) entry.hang = hangs;
        const errors = res.reduce((n, r) => n + (r ? r.errors : 0), 0);
        if (errors) entry.errors = errors;
        table[key] = entry;
        done++;
        if (VERBOSE || ONLY) console.log(key, JSON.stringify(entry));
        else if (done % 50 === 0) process.stdout.write(`  ${done}/${todo.length} (${Math.round((Date.now() - t0) / 1000)}s)\n`);
    }
    problems.push(...app.problems);
    await app.close();
    const pageErrors = problems.filter(p => p.type === 'pageerror');

    if (ONLY) return;

    // ---- write / check -----------------------------------------------------------------------
    const keys = Object.keys(table).sort();
    const count = (f) => keys.filter(k => f(table[k])).length;
    const summary = {
        skills: keys.length,
        range: count(e => e.range),
        decimals: count(e => e.decimals),
        level: count(e => e.level),
        none: count(e => !e.range && !e.decimals && !e.level),
        coarse: count(e => e.mode === 'coarse'),
        stat: count(e => e.mode === 'stat'),
        unstable: count(e => e.mode === 'unstable'),
        hang: count(e => e.hang),
    };
    const lines = keys.map(k => `    ${JSON.stringify(k)}: ${JSON.stringify(table[k])},`);
    const src = `// GENERATED by tests/scripts/ws-options-derive.cjs — do not edit by hand. Re-run the script.
//
// What each live skill's generator was MEASURED to honour: the same ${N} seeded items generated
// under each setting, a value kept only when its items differ from every smaller value kept.
//   range     Max Number values that change the items (the skill's own "Max Number" option)
//   decimals  decimal places that change the items   (the skill's own "Decimal places" option)
//   level     support levels that change the items    (the universal option, where it is real)
//   mode      'coarse' = compared on numbers only (the full item was not reproducible);
//             'stat' = not reproducible item for item (the generator remembers its last item),
//               so compared on the largest number / most decimal places across the 60 items;
//             'unstable' = not reproducible at all, so nothing is offered
//   hang      settings whose ${N} items did not finish inside the deadline — never offered
// A skill with {} honours none of the three; it still carries the universal level in the model
// (skill-options.js), but no control is shown for it — see offeredOptionsFor().
//
// Summary: ${JSON.stringify(summary)}
import { registerDerivedOptions } from './skill-options.js';

export const DERIVED_SUMMARY = ${JSON.stringify(summary)};

export const DERIVED_OPTIONS = {
${lines.join('\n')}
};

registerDerivedOptions(DERIVED_OPTIONS);
`;
    if (CHECK) {
        const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
        const strip = s => s.replace(/^\/\/ Summary:.*$/m, '');
        if (strip(cur) !== strip(src)) {
            console.error('ws-options-derive: STALE — js/modules/skill-options-derived.js no longer matches what the generators read. Re-run without --check.');
            process.exit(1);
        }
        console.log(`ws-options-derive: OK (table current) ${JSON.stringify(summary)}`);
        return;
    }
    fs.writeFileSync(OUT, src);
    console.log(`ws-options-derive: wrote ${path.relative(ROOT, OUT)} ${JSON.stringify(summary)}${pageErrors.length ? `  (${pageErrors.length} page errors)` : ''}`);
})().catch(e => { console.error(e); process.exit(1); });
