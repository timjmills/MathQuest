// Does every option a teacher is SHOWN really do what it says, everywhere?  (owner, 2026-09-25)
//
//   node tests/scripts/ws-options-verify.cjs                    # every live skill with options
//   node tests/scripts/ws-options-verify.cjs --skill add_facts   # one skill (id, any category)
//   node tests/scripts/ws-options-verify.cjs --category addition
//   node tests/scripts/ws-options-verify.cjs --report            # also write design/audit/OPTIONS-VERIFY.md
//   node tests/scripts/ws-options-verify.cjs --json out.json     # raw results
//   node tests/scripts/ws-options-verify.cjs --n 12              # items per check (default 12)
//
// "Each option panel needs to have an 8/10 or above. And all parts of the option need to be made
// sure it's working for both print and screen." This is the machine half of that audit
// (design/audit/OPTIONS-RUBRIC.md, criterion O4). For every live skill and every value of every
// option in offeredOptionsFor() — the controls the teacher actually sees — it checks:
//
//   (a) GEN    seeded generateQuestionFor() with the value gives items that DIFFER from the
//              default and satisfy the option's PREDICATE where one is checkable (the table
//              PREDICATES below: a constant restricts the facts, decimals counts places, a band
//              bounds the numbers, a step / direction / operation is the one asked for, ...).
//   (b) PRINT  buildSheet() with the value prints a different sheet from the default, the same
//              predicate holds on the printed items, and every scalar answer is in the key.
//   (c) SCREEN the value is put in the set's option store (skill-option-store.js), the way a
//              queue, a share link or a Quick Start card puts it there, and the two screen paths
//              that read the store are sampled: the online worksheet (generateQuestionFor with no
//              opts, gameMode 'worksheet') and live practice (plain generateQuestion(), which the
//              quiz builder and boss / race also call). The practice item is rendered into the
//              real #questionCard once per value. Both must honour the value like (a).
//   (d) TRIP   optionSuffix() -> decodeOptionPayload() gives back exactly packOptions(value):
//              the value survives a share link / MX- code.
//
// plus STATIC checks on the definition itself (label, legal default, codec key, no duplicate
// value labels) — the machine-checkable part of O5.
//
// MAX NUMBER. Every check runs at the app's default Max Number (100), because that is what a
// teacher gets. A value that changes nothing there but does change the items at Max Number
// 1,000,000 is reported as GATED: the control exists and works, but only after the teacher also
// raises a setting that is not on the panel. That is a failure of the option (O4), not a pass.
//
// Output: `ws-options-verify: OK` or `ws-options-verify: FAIL` with the failures grouped by the
// generator file that owns the skill. Exit code 1 on FAIL (use --report-only to suppress).
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);
const N = parseInt(arg('n', '12'), 10);
const ONLY = arg('skill', null);
const CAT = arg('category', null);
const REPORT = has('report');
const REPORT_ONLY = has('report-only');
const JSON_OUT = arg('json', null);
const VERBOSE = has('verbose');
const DEADLINE_MS = parseInt(arg('deadline', '60000'), 10);
const BIG_RANGE = 10000000;   // a nearest-million item needs Numbers to 10,000,000

function seedFor(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 1000000;
}

// ---------------------------------------------------------------------------------------------
// Everything below this function runs IN THE PAGE (it is serialised by page.evaluate).
// ---------------------------------------------------------------------------------------------
async function verifyInPage({ categoryId, skillId, label, n, baseSeed, bigRange, dbg }) {
    const SO = await import('/js/modules/skill-options.js');
    const W = window;
    const st = W.state;
    const APP_RANGE = st.range;          // 100, the app default
    const APP_DP = st.decimalPlaces;     // 0
    // The decimals every generation below runs at. It is APP_DP except while a Decimal places
    // value that equals APP_DP is under test (see `baseFor` in the run loop).
    let DP = APP_DP;

    // ---------- text helpers ----------
    const _ta = document.createElement('textarea');
    const plain = (s) => {
        const noTags = String(s == null ? '' : s).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
        _ta.innerHTML = noTags;
        return _ta.value.replace(/−/g, '-').replace(/\s+/g, ' ').trim();
    };
    const nums = (s) => (String(s).replace(/(\d),(?=\d{3}\b)/g, '$1').match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
    const dps = (s) => (String(s).replace(/(\d),(?=\d{3}\b)/g, '$1').match(/\d+\.\d+/g) || []).map(m => m.split('.')[1].length);
    const qText = (q) => plain(q.text) + ' ' + plain(q.printText || '');
    const ansNum = (q) => {
        if (typeof q.ans === 'number') return q.ans;
        if (typeof q.ans === 'string' && /^-?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(q.ans.trim())) return Number(q.ans.replace(/,/g, ''));
        return null;
    };
    const factOf = (q) => {
        if (Number.isFinite(q.a) && Number.isFinite(q.b) && q.op) return { a: q.a, b: q.b, op: String(q.op) };
        const m = plain(q.text).replace(/(\d),(?=\d{3}\b)/g, '$1').match(/(-?\d+(?:\.\d+)?)\s*([+\-×x÷\/*])\s*(-?\d+(?:\.\d+)?)/);
        return m ? { a: Number(m[1]), b: Number(m[3]), op: m[2] } : null;
    };
    const pageNums = (q) => {
        const out = nums(qText(q));
        if (q.pv) { if (Number.isFinite(q.pv.n)) out.push(q.pv.n); if (Array.isArray(q.pv.tiles)) out.push(...q.pv.tiles); }
        const a = ansNum(q); if (a !== null) out.push(a);
        return out.map(Math.abs);
    };
    const normVisual = (v) => String(v || '').replace(/\s(id|for|aria-labelledby|aria-describedby|aria-controls|data-uid)="[^"]*"/g, '')
        .replace(/url\(#[^)]*\)/g, 'url()').replace(/href="#[^"]*"/g, 'href=""').replace(/\d{11,}/g, 'T');
    const sig = (q) => {
        if (!q) return 'null';
        const keep = {};
        for (const k of Object.keys(q).sort()) {
            // `pv` is the generator's own bookkeeping (it echoes the band back): an item whose pupil-facing
            // fields are identical is the same item, whatever pv says.
            if (['visual', 'seed', '_adaptiveLevel', 'skillOptions', 'categoryId', 'requestedSkillId', 'pv'].includes(k)) continue;
            if (typeof q[k] === 'function') continue;
            keep[k] = q[k];
        }
        let body; try { body = JSON.stringify(keep); } catch (e) { body = String(q.text) + '|' + String(q.ans); }
        return (body + '§' + normVisual(q.visual)).replace(/\d{11,}/g, 'T');
    };
    const sigList = (items) => items.map(sig).join('\n');
    const opKind = /^(subtraction)/.test(categoryId) || /sub/.test(skillId) ? '-' : /division|div/.test(categoryId + skillId) ? '/' : /mult/.test(categoryId + skillId) ? 'x' : '+';
    const notationOf = (q) => {
        if (q.notation) return q.notation;
        const f = String(q.printFormat || '');
        if (/horizontal|across/.test(f)) return 'across';
        if (/long|bracket/.test(f)) return 'bracket';
        if (/fraction/.test(f)) return 'fraction';
        if (/vertical|stack|column/.test(f)) return 'stacked';
        return null;
    };

    // ---------- the predicate table: option id -> (value, items, ctx) => [fail[], warn[]] ----------
    // `items` are full question objects on GEN / SCREEN, and {text, ans} on PRINT (ctx.surface).
    // A predicate that cannot read what it needs on a surface returns nothing: "not checkable".
    const P = {
        constant(v, items) {
            const set = Array.isArray(v) ? v : [v];
            const bad = [];
            for (const q of items) {
                const f = factOf(q); if (!f) continue;
                // ÷: the 0 set is 0 ÷ n (dividing BY 0 is undefined), so a ticked 0 is honoured by
                // a zero dividend (skill-options.js div_facts, "0 (zero shared: 0 ÷ n)").
                const ok = (opKind === '/' && set.includes(0) && f.a === 0)
                    || ((opKind === '-' || opKind === '/') ? set.includes(f.b) : (set.includes(f.a) || set.includes(f.b)));
                if (!ok) bad.push(`${f.a} ${f.op} ${f.b}`);
            }
            return [bad.length ? [`fact outside the ticked set {${set}}: ${bad.slice(0, 3).join(', ')}`] : [], []];
        },
        notation(v, items, ctx) {
            if (ctx.surface === 'print') return [[], []];
            const set = Array.isArray(v) ? v : [v];
            const got = items.map(notationOf);
            if (got.every(x => x === null)) return [[], ['items carry no notation to check']];
            const hit = got.filter(x => set.includes(x)).length;
            const f = [], w = [];
            for (const want of set) if (!got.includes(want)) f.push(`no item written "${want}" (got ${[...new Set(got)].join('/')})`);
            if (!f.length && hit < got.length) w.push(`${got.length - hit}/${got.length} items overruled to ${[...new Set(got.filter(x => !set.includes(x)))].join('/')} (multi-digit exception)`);
            return [f, w];
        },
        decimals(v, items) {
            if (v === null) return [[], []];
            if (typeof v === 'boolean') {       // a yes/no "Decimals" switch (place_value_10x)
                const any = items.some(q => dps(qText(q)).length);
                return [v && !any ? ['"Decimals" on but no decimal appears'] : (!v && any ? ['decimals appear with "Decimals" off'] : []), []];
            }
            // The answer counts too: "Half of 47" has its tenths in the answer, an order task in
            // its answer list.
            const withAns = (q) => qText(q) + ' ' + (typeof q.ans === 'number' || typeof q.ans === 'string' ? String(q.ans) : '');
            const all = items.flatMap(q => dps(withAns(q)));
            if (v === 0) return [all.some(d => d > 0) ? [`decimals appear with "Whole numbers"`] : [], []];
            if (!all.includes(v)) return [[`no number with ${v} decimal place(s)`], []];
            return [[], all.some(d => d > v) ? [`some numbers have more than ${v} places`] : []];
        },
        range(v, items) {
            if (v === null) return [[], []];
            const ans = items.map(ansNum).filter(x => x !== null).map(Math.abs);
            const txt = items.flatMap(q => nums(qText(q))).map(Math.abs);
            const maxA = ans.length ? Math.max(...ans) : null;
            const maxT = txt.length ? Math.max(...txt) : null;
            if ((maxA !== null && maxA <= v) || (maxT !== null && maxT <= v)) return [[], []];
            if (maxA === null && maxT === null) return [[], []];
            return [[], [`"Up to ${v}" but the answer reaches ${maxA} and the numbers ${maxT}`]];
        },
        band(v, items) {
            const all = items.flatMap(pageNums);
            if (!all.length) return [[], []];
            const mx = Math.max(...all);
            const f = mx > v ? [`"Numbers to ${v}" but a number reaches ${mx}`] : [];
            const w = !f.length && mx <= v / 10 ? [`band ${v} never used: largest number ${mx}`] : [];
            return [f, w];
        },
        step(v, items) {
            const bad = [];
            for (const q of items) {
                const a = ansNum(q); const t = nums(qText(q));
                if (a === null || !t.length) continue;
                if (!t.some(x => Math.abs(Math.abs(a - x) - v) < 1e-9)) bad.push(`${qText(q).slice(0, 40)} = ${a}`);
            }
            return [bad.length ? [`answer is not ${v} away: ${bad.slice(0, 2).join(' | ')}`] : [], []];
        },
        dir(v, items) {
            const words = items.map(q => qText(q).toLowerCase());
            const more = words.filter(s => /\bmore\b/.test(s)).length, less = words.filter(s => /\bless\b/.test(s)).length;
            if (!more && !less) return [[], []];
            if (v === 'more' && less) return [[`"More" but ${less} item(s) ask for less`], []];
            if (v === 'less' && more) return [[`"Less" but ${more} item(s) ask for more`], []];
            if (v === 'both' && (!more || !less)) return [[`"Both" but only one direction appears`], []];
            return [[], []];
        },
        op(v, items) {
            const want = v === '/' ? '÷' : '×';
            const t = items.map(q => qText(q));
            const bad = t.filter(s => /[×÷]/.test(s) && !s.includes(want));
            return [bad.length ? [`asked for ${want}, ${bad.length} item(s) use the other operation`] : [], []];
        },
        power(v, items) {
            const set = Array.isArray(v) ? v : [v];
            const bad = [];
            for (const q of items) {
                const p = q.pv && q.pv.power; if (p && !set.includes(p)) bad.push(p);
            }
            return [bad.length ? [`power outside {${set}}: ${bad.slice(0, 3)}`] : [], []];
        },
        place(v, items) {
            const bad = items.map(ansNum).filter(a => a !== null && a % v !== 0);
            return [bad.length ? [`answers not multiples of ${v}: ${bad.slice(0, 3)}`] : [], []];
        },
        places(v, items) {
            const set = Array.isArray(v) ? v : [v];
            const bad = items.filter(q => q.pv && q.pv.place && !set.includes(q.pv.place)).map(q => q.pv.place);
            return [bad.length ? [`place outside {${set}}: ${bad.slice(0, 3)}`] : [], []];
        },
        tiles(v, items) {
            const bad = items.filter(q => q.pv && Array.isArray(q.pv.tiles) && q.pv.tiles.length !== Number(v)).map(q => q.pv.tiles.length);
            return [bad.length ? [`${v} tiles asked, got ${bad.slice(0, 3)}`] : [], []];
        },
        midpoint(v, items) {
            const half = (q) => q.pv && q.pv.place && Number.isFinite(q.pv.n) && (q.pv.n % q.pv.place) === q.pv.place / 2;
            const withPv = items.filter(q => q.pv && q.pv.place && Number.isFinite(q.pv.n));
            if (!withPv.length) return [[], []];
            const h = withPv.filter(half).length;
            if (v === 'only' && h < withPv.length) return [[`"Only halfway" but ${withPv.length - h} item(s) are not halfway`], []];
            if (v === 'never' && h) return [[`"Never" but ${h} halfway item(s)`], []];
            return [[], []];
        },
        zeroPlace(v, items) {
            const ns = items.map(q => q.pv && q.pv.n).filter(Number.isFinite);
            if (!ns.length) return [[], []];
            const z = ns.filter(x => /0/.test(String(x).replace(/^-/, '')));
            if (v === 'always' && z.length < ns.length) return [[`"Every number" but ${ns.length - z.length} number(s) have no zero`], []];
            if (v === 'none' && z.length) return [[], [`"Never" but ${z.length} number(s) contain a zero digit (${z.slice(0, 3)})`]];
            if (v === 'some' && !z.length) return [[`"Some numbers" but none has a zero`], []];
            return [[], []];
        },
        response(v, items, ctx) {
            if (ctx.surface === 'print') return [[], []];
            const at = items.map(q => String(q.answerType || ''));
            const multi = at.filter(a => /multi-select/.test(a)).length;
            if (v === 'which-numbers' && multi < at.length) return [[`"Pick the numbers" but ${at.length - multi} item(s) ask for an answer`], []];
            if (v === 'standard' && multi) return [[`"Work it out" but ${multi} item(s) are pick-the-numbers`], []];
            if (v === 'array-builder' && !at.some(a => /array/.test(a))) return [[`"Build the array" but no item is an array builder (${[...new Set(at)]})`], []];
            if (v === 'circle-all' && !items.some(q => /circle every|every number|rounds? to/i.test(qText(q)))) return [[], [`"Circle every number" wording not found`]];
            return [[], []];
        },
        task(v, items) {
            const t = items.map(q => qText(q));
            if (v === 'reasonable' && !t.some(s => /reasonable/i.test(s))) return [[`"Is it reasonable?" but no item asks it`], []];
            if (v === 'closest' && !t.some(s => /closest|best estimate|nearest estimate/i.test(s))) return [[`"Closest estimate" but no item asks it`], []];
            return [[], []];
        },
    };
    const runPred = (def, value, items, surface) => {
        const fn = P[def.id];
        if (!fn || !items.length) return { fails: [], warns: [], checked: false };
        const [f, w] = fn(value, items, { surface, def });
        return { fails: f, warns: w, checked: true };
    };

    // ---------- the values to try ----------
    const defs = W.offeredOptionsFor(categoryId, skillId);
    const tries = [];
    for (const def of defs) {
        if (def.type === 'bool') { tries.push({ def, value: !def.default }); continue; }
        if (def.type === 'int') { tries.push({ def, value: def.min }, { def, value: def.max }); continue; }
        if (def.type === 'enum') { for (const x of def.values) if (JSON.stringify(x.v) !== JSON.stringify(def.default)) tries.push({ def, value: x.v, vl: x.l }); continue; }
        if (def.type === 'set') {
            const all = def.values.map(x => x.v);
            for (const x of def.values) if (JSON.stringify([x.v]) !== JSON.stringify(def.default)) tries.push({ def, value: [x.v], vl: x.l });
            if (all.length > 1 && JSON.stringify(all) !== JSON.stringify(def.default)) tries.push({ def, value: all, vl: def.allLabel || 'all' });
        }
    }

    // ---------- static (definition) checks ----------
    const statics = [];
    const { OPTION_KEYS } = await import('/js/modules/skill-option-codec.js');
    for (const def of defs) {
        if (!def.label) statics.push(`${def.id}: no label`);
        if (!OPTION_KEYS[def.id]) statics.push(`${def.id}: no share-code key (the choice cannot travel in a link)`);
        if (def.values) {
            const ls = def.values.map(x => x.l);
            if (new Set(ls).size !== ls.length) statics.push(`${def.id}: duplicate value labels`);
            if (def.values.length < 2) statics.push(`${def.id}: only one value — a control with no choice`);
            const legal = def.values.map(x => JSON.stringify(x.v));
            const dflt = def.type === 'set' ? def.default : [def.default];
            if (def.type === 'set' ? !dflt.every(d => legal.includes(JSON.stringify(d))) : !legal.includes(JSON.stringify(def.default))) statics.push(`${def.id}: default ${JSON.stringify(def.default)} is not one of its values`);
        }
    }

    // ---------- generation ----------
    const gen = (opts, range, extra = {}) => {
        const out = [];
        for (let i = 0; i < n; i++) {
            let q = null;
            try { q = W.generateQuestionFor({ category: categoryId, skill: skillId, range, decimals: DP, opts, seed: baseSeed + i, itemIndex: i, ...extra }); } catch (e) { q = { __error: String(e && e.message || e) }; }
            if (q) out.push(q);
        }
        return out;
    };
    const genSig = (items) => sigList(items);
    // Determinism: the default twice.
    const d1 = gen({}, APP_RANGE), d2 = gen({}, APP_RANGE);
    const stable = genSig(d1) === genSig(d2);
    const coarse = (items) => items.map(q => nums(qText(q)).join(',') + '|' + JSON.stringify(q.ans === undefined ? null : q.ans) + '|' + (q.notation || q.printFormat || '') + '|' + (q.answerType || '')).join('\n');
    const coarseStable = coarse(d1) === coarse(d2);
    const dflt = { [`${APP_RANGE}|${APP_DP}`]: d1 };
    const dfltAt = (r) => { const k = `${r}|${DP}`; return dflt[k] || (dflt[k] = gen({}, r)); };
    const differs = (a, b) => stable ? genSig(a) !== genSig(b) : (coarseStable ? coarse(a) !== coarse(b) : null);

    // ---------- print ----------
    const sheetCache = {};
    const sheet = async (opts, range) => {
        const key = JSON.stringify([opts, range, DP]);
        if (sheetCache[key]) return sheetCache[key];
        const saved = st.range, savedDp = st.decimalPlaces;
        st.range = range; st.decimalPlaces = DP;
        let res;
        try {
            const r = await W.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId, skillId, opts }], count: 6, columns: 'auto' }], seed: baseSeed, key: true });
            res = { items: r.items.map(i => ({ text: i.text, ans: i.ans })), pupil: normVisual(r.pupilHtml), key: plain(r.keyHtml).replace(/(\d),(?=\d{3}\b)/g, '$1'), pupilText: plain(r.pupilHtml).replace(/(\d),(?=\d{3}\b)/g, '$1'), title: plain(r.pupilHtml).slice(0, 400) };
        } catch (e) { res = { error: String(e && e.message || e) }; }
        finally { st.range = saved; st.decimalPlaces = savedDp; }
        sheetCache[key] = res;
        return res;
    };

    // ---------- screen ----------
    const screen = (opts, range) => {
        const saved = { category: st.category, skill: st.skill, range: st.range, decimalPlaces: st.decimalPlaces, skillOptions: st.skillOptions, gameMode: st.gameMode, isMixedMode: st.isMixedMode, fixedDifficulty: st.fixedDifficulty, adaptive: st.adaptiveModeEnabled };
        const res = { worksheet: [], practice: [], render: null };
        try {
            W.clearSetOptions({ silent: true });
            if (opts) W.setSetOptions(categoryId, skillId, opts, { silent: true });
            // online worksheet: no opts -> the store
            st.range = range;
            for (let i = 0; i < n; i++) {
                let q = null;
                try { q = W.generateQuestionFor({ category: categoryId, skill: skillId, range, decimals: DP, seed: baseSeed + i, itemIndex: i, gameMode: 'worksheet' }); } catch (e) { q = null; }
                if (q) res.worksheet.push(q);
            }
            // live practice: plain generateQuestion() with nothing set but the store
            st.category = categoryId; st.skill = skillId; st.range = range; st.decimalPlaces = DP;
            st.skillOptions = null; st.gameMode = 'practice'; st.isMixedMode = false; st.fixedDifficulty = true; st.adaptiveModeEnabled = false;
            if (W.__wsReseed) W.__wsReseed(baseSeed);
            for (let i = 0; i < n; i++) {
                let q = null;
                try { q = W.generateQuestion(); } catch (e) { q = null; }
                if (q) res.practice.push(q);
            }
            // one real render into the question card
            try {
                if (res.practice[0]) {
                    st.currentQ = res.practice[0];
                    W.renderQuestion();
                    const card = document.getElementById('questionCard');
                    res.render = card ? { ok: card.textContent.trim().length > 0 || !!card.querySelector('svg,input,button') } : { ok: false, why: 'no #questionCard' };
                }
            } catch (e) { res.render = { ok: false, why: String(e && e.message || e) }; }
        } finally {
            W.clearSetOptions({ silent: true });
            Object.assign(st, { category: saved.category, skill: saved.skill, range: saved.range, decimalPlaces: saved.decimalPlaces, skillOptions: saved.skillOptions, gameMode: saved.gameMode, isMixedMode: saved.isMixedMode, fixedDifficulty: saved.fixedDifficulty, adaptiveModeEnabled: saved.adaptive });
        }
        return res;
    };
    const screenDefault = {};
    const screenDflt = (r) => { const k = `${r}|${DP}`; return screenDefault[k] || (screenDefault[k] = screen(null, r)); };

    // ---------- run ----------
    const results = [];
    for (const t of tries) {
        const { def, value } = t;
        const opts = { [def.id]: value };
        if (dbg) console.log(`[verify] ${categoryId}:${skillId} ${def.id}=${JSON.stringify(value)}`);
        const r = { option: def.id, label: def.label, value, valueLabel: t.vl || String(value), fails: [], warns: [], checks: {} };
        const fail = (surface, msg) => r.fails.push(`${surface}: ${msg}`);
        const warn = (surface, msg) => r.warns.push(`${surface}: ${msg}`);

        // (d) round trip — independent of generation
        try {
            const packed = W.packOptions(categoryId, skillId, opts);
            const suffix = W.optionSuffix(categoryId, skillId, opts);
            const back = W.decodeOptionPayload(categoryId, skillId, suffix);
            r.checks.trip = JSON.stringify(back) === JSON.stringify(packed) ? 'ok' : 'fail';
            if (r.checks.trip === 'fail') fail('trip', `packed ${JSON.stringify(packed)} -> "${suffix}" -> ${JSON.stringify(back)}`);
        } catch (e) { r.checks.trip = 'fail'; fail('trip', String(e && e.message || e)); }

        // (a) generation at the app's Max Number, then at the big one when inert / refused
        // A Max Number / Decimal places value EQUAL to the app setting is, by definition, the same
        // page as "use the setting". It is tested against a different base setting instead: the
        // smallest other value the control offers, so the comparison says whether choosing it
        // changes the page for a teacher whose setting is elsewhere.
        const other = (vals, v) => vals.filter(x => x !== null && x !== v).sort((a, b) => a - b)[0];
        let range = APP_RANGE;
        DP = APP_DP;
        const ownSetting = def.id === 'range' || def.id === 'decimals';
        if (def.id === 'range' && value === APP_RANGE) range = other(def.values.map(x => x.v), value) ?? APP_RANGE * 10;
        if (def.id === 'decimals' && value === APP_DP) DP = other(def.values.map(x => x.v), value) ?? 1;
        r.base = { range, decimals: DP };
        let items = gen(opts, range);
        let base = dfltAt(range);
        let diff = differs(items, base);
        const errs = items.filter(q => q.__error);
        if (errs.length) fail('gen', `${errs.length} item(s) threw: ${errs[0].__error}`);
        if (!ownSetting && (!items.length || diff === false)) {
            const bigItems = gen(opts, bigRange);
            const bigDiff = bigItems.length ? differs(bigItems, dfltAt(bigRange)) : false;
            if (bigItems.length && bigDiff) {
                r.gated = true;
                fail('gen', items.length ? `does nothing at Max Number ${APP_RANGE}; only works once Max Number is raised (gated)` : `refused at Max Number ${APP_RANGE} (no items); works at ${bigRange} (gated)`);
                range = bigRange; items = bigItems; base = dfltAt(bigRange); diff = true;
            }
        }
        if (!items.length) { fail('gen', 'no items at any Max Number'); r.checks.gen = 'fail'; }
        else {
            if (diff === false) fail('gen', 'items identical to the default (the control does nothing)');
            if (diff === null) warn('gen', 'generator not reproducible; difference not checkable, predicate only');
            const pr = runPred(def, value, items, 'gen');
            pr.fails.forEach(m => fail('gen', m)); pr.warns.forEach(m => warn('gen', m));
            r.checks.gen = r.fails.some(f => f.startsWith('gen:')) ? 'fail' : 'ok';
            r.sample = items.slice(0, 2).map(q => `${plain(q.text).slice(0, 70)} = ${typeof q.ans === 'object' ? JSON.stringify(q.ans).slice(0, 30) : q.ans}`);
        }

        // (b) print
        const ps = await sheet(opts, range), pd = await sheet({}, range);
        if (ps.error) { fail('print', `buildSheet threw: ${ps.error}`); r.checks.print = 'fail'; }
        else if (!ps.items.length) { fail('print', 'sheet has no items'); r.checks.print = 'fail'; }
        else {
            const same = !pd.error && ps.pupil === pd.pupil && JSON.stringify(ps.items) === JSON.stringify(pd.items);
            if (same && diff !== null) fail('print', 'printed sheet identical to the default sheet');
            const pr = runPred(def, value, ps.items, 'print');
            pr.fails.forEach(m => fail('print', m)); pr.warns.forEach(m => warn('print', m));
            // Digits may sit in separate grid boxes, so compare with all white space removed, and
            // require the answer to occur more often in the key than on the pupil page.
            const squash = (x) => String(x).replace(/\s+/g, '');
            const occ = (hay, nd) => { let c = 0, i = -1; while ((i = hay.indexOf(nd, i + 1)) !== -1) c++; return c; };
            const keyS = squash(ps.key), pupS = squash(ps.pupilText);
            const missing = ps.items.filter(i => (typeof i.ans === 'number' || typeof i.ans === 'string') && String(i.ans).trim()
                && (() => { const a = squash(plain(String(i.ans)).replace(/(\d),(?=\d{3}\b)/g, '$1')); return occ(keyS, a) <= occ(pupS, a); })());
            if (missing.length) warn('print', `${missing.length}/${ps.items.length} answer(s) not found in the key text (e.g. "${missing[0].ans}")`);
            if (def.id === 'constant') {
                const title = SO.factSetTitle(categoryId, skillId, opts);
                if (title && !ps.title.includes(title)) warn('print', `sheet is not titled "${title}" (P-31)`);
            }
            r.checks.print = r.fails.some(f => f.startsWith('print:')) ? 'fail' : 'ok';
        }

        // (c) screen
        const sc = screen(opts, range), sd = screenDflt(range);
        for (const [host, list, dl] of [['worksheet', sc.worksheet, sd.worksheet], ['practice', sc.practice, sd.practice]]) {
            if (!list.length) { fail(`screen/${host}`, 'no items'); continue; }
            const dd = differs(list, dl);
            if (dd === false) fail(`screen/${host}`, 'items identical to the default (store not honoured)');
            const pr = runPred(def, value, list, 'screen');
            pr.fails.forEach(m => fail(`screen/${host}`, m));
        }
        if (sc.render && !sc.render.ok) fail('screen/card', `render failed: ${sc.render.why || 'empty card'}`);
        r.checks.screen = r.fails.some(f => f.startsWith('screen')) ? 'fail' : 'ok';
        results.push(r);
    }
    return { key: `${categoryId}:${skillId}`, categoryId, skillId, label, stable, coarseStable, statics, options: defs.map(d => ({ id: d.id, label: d.label, type: d.type, n: d.values ? d.values.length : 2, default: d.default })), results };
}

// ---------------------------------------------------------------------------------------------
// Which generator file owns a skill: from generate-question.js' own routing tables, read in the page.
// ---------------------------------------------------------------------------------------------
const GEN_FILE = {
    addition: 'gen-operations.js', subtraction: 'gen-operations.js', multiplication: 'gen-operations.js', division: 'gen-operations.js',
    integers: 'gen-operations.js', number_ops_mixed: 'gen-operations.js',
    fractions: 'gen-fractions.js', fraction_operations: 'gen-fractions.js', decimals: 'gen-fractions.js', conversions: 'gen-fractions.js',
    area_perimeter: 'gen-geometry.js', angles: 'gen-geometry.js', shapes: 'gen-geometry.js', coordinates: 'gen-geometry.js', geometry: 'gen-geometry.js',
    measurement: 'gen-measurement.js', time: 'gen-measurement.js', money: 'gen-measurement.js',
    graphs: 'gen-data-stats.js', data_analysis: 'gen-data-stats.js', probability: 'gen-data-stats.js', statistics: 'gen-data-stats.js',
    patterns: 'gen-algebraic.js', algebra: 'gen-algebraic.js', order_of_operations: 'gen-algebraic.js', expressions: 'gen-algebraic.js',
    counting: 'gen-counting.js', comparing: 'gen-counting.js', composing: 'gen-counting.js',
    number_theory: 'gen-number-theory.js', vocabulary: 'gen-vocabulary.js',
};
function genFileFor(r) {
    if (/^(placevalue|number_sense)$/.test(r.categoryId) && r.options.some(o => ['band', 'midpoint', 'task', 'tiles', 'support', 'step', 'zeroPlace', 'op', 'places'].includes(o.id))) return 'gen-pv.js';
    return GEN_FILE[r.categoryId] || (r.categoryId === 'placevalue' || r.categoryId === 'number_sense' ? 'gen-algebraic.js' : `(${r.categoryId})`);
}

(async () => {
    let app = await open({ seed: 1 });
    const problems = [];
    const hookDebug = (a) => { if (has('debug')) a.page.on('console', m => { if (m.text().startsWith('[verify]')) console.log(m.text()); }); };
    hookDebug(app);
    await app.page.evaluate(() => { if (window.state) window.state.adaptiveModeEnabled = false; });
    const skills = await app.page.evaluate(() => {
        const out = [];
        for (const [categoryId, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) {
                if (s.retired || s.v === 'custom_mixed') continue;
                const offered = window.offeredOptionsFor(categoryId, s.v);
                out.push({ categoryId, skillId: s.v, label: s.l, nOffered: offered.length });
            }
        }
        return out;
    });
    const all = skills.filter(s => (!ONLY || s.skillId === ONLY) && (!CAT || s.categoryId === CAT));
    const todo = all.filter(s => s.nOffered > 0);
    const results = [];
    const t0 = Date.now();
    for (const s of todo) {
        const key = `${s.categoryId}:${s.skillId}`;
        let timer;
        const deadline = new Promise(res => { timer = setTimeout(() => res({ timeout: true }), DEADLINE_MS); });
        const run = app.page.evaluate(verifyInPage, { categoryId: s.categoryId, skillId: s.skillId, label: s.label, n: N, baseSeed: seedFor(key), bigRange: BIG_RANGE, dbg: has('debug') })
            .catch(e => ({ crash: String(e && e.message || e) }));
        let r = await Promise.race([run, deadline]);
        clearTimeout(timer);
        if (r.timeout || r.crash) {
            r = { key, categoryId: s.categoryId, skillId: s.skillId, label: s.label, statics: [], options: [], results: [{ option: '*', value: '*', fails: [r.timeout ? `verifier: timed out after ${DEADLINE_MS} ms` : `verifier: page crashed: ${r.crash}`], warns: [], checks: {} }] };
            problems.push(...app.problems);
            try { await app.close(); } catch (e) { /* gone */ }
            app = await open({ seed: 1 });
            await app.page.evaluate(() => { if (window.state) window.state.adaptiveModeEnabled = false; });
        }
        r.genFile = genFileFor(r);
        results.push(r);
        if (VERBOSE || ONLY) {
            console.log(`${key}  (${r.results.length} values)`);
            for (const x of r.results) console.log(`   ${x.fails.length ? 'FAIL' : 'ok  '} ${x.option}=${JSON.stringify(x.value)}  ${[...x.fails, ...x.warns.map(w => 'warn ' + w)].join(' ; ')}`);
            for (const m of r.statics) console.log(`   STATIC ${m}`);
        } else if (results.length % 25 === 0) process.stdout.write(`  ${results.length}/${todo.length} (${Math.round((Date.now() - t0) / 1000)}s)\n`);
    }
    problems.push(...app.problems);
    await app.close();

    // ---------- summarise ----------
    const values = results.flatMap(r => r.results.map(x => ({ ...x, key: r.key, genFile: r.genFile })));
    const failV = values.filter(v => v.fails.length);
    const failS = results.filter(r => r.results.some(x => x.fails.length) || r.statics.length);
    const byFile = {};
    for (const v of failV) (byFile[v.genFile] = byFile[v.genFile] || []).push(v);
    for (const r of results) for (const m of r.statics) (byFile[r.genFile] = byFile[r.genFile] || []).push({ key: r.key, option: 'static', value: '', fails: [m], warns: [] });
    const counts = {
        skillsLive: all.length, skillsWithOptions: todo.length, skillsWithoutOptions: all.length - todo.length,
        values: values.length, valuesPass: values.length - failV.length, valuesFail: failV.length,
        skillsPass: todo.length - failS.length, skillsFail: failS.length,
        gated: values.filter(v => v.gated).length,
        bySurface: ['trip', 'gen', 'print', 'screen'].reduce((o, k) => { o[k] = values.filter(v => v.checks && v.checks[k] === 'fail').length; return o; }, {}),
    };
    const pageErrors = problems.filter(p => p.type === 'pageerror');

    if (JSON_OUT) fs.writeFileSync(path.resolve(JSON_OUT), JSON.stringify({ counts, results, noOptions: all.filter(s => !s.nOffered).map(s => `${s.categoryId}:${s.skillId}`) }, null, 1));

    if (REPORT) {
        const md = [];
        const today = new Date().toISOString().slice(0, 10);
        md.push('# Option verifier — machine report', '');
        md.push(`Generated by \`node tests/scripts/ws-options-verify.cjs --report\` on ${today}. Do not edit by hand; re-run the script.`, '');
        md.push('What it checks, per skill and per value of every option the teacher is shown (`offeredOptionsFor`): ' +
            '**gen** seeded `generateQuestionFor` differs from the default and meets the option\'s predicate; ' +
            '**print** `buildSheet` (independent, 6 items) differs, meets the predicate and its key holds the answers; ' +
            '**screen** the set\'s option store drives the online worksheet and live practice paths the same way, and the practice card renders; ' +
            '**trip** `optionSuffix` → `decodeOptionPayload` gives the value back. ' +
            `Run at the app default Max Number (100); a value that only works at Max Number ${BIG_RANGE.toLocaleString('en-US')} is reported as **gated**. Rubric: \`design/audit/OPTIONS-RUBRIC.md\` (O4).`, '');
        md.push('## Counts', '', '| | |', '|---|---|');
        md.push(`| Live skills | ${counts.skillsLive} |`, `| Skills with at least one option shown | ${counts.skillsWithOptions} |`, `| Skills with NO option shown | ${counts.skillsWithoutOptions} |`);
        md.push(`| Option values checked | ${counts.values} |`, `| Values passing every surface | ${counts.valuesPass} |`, `| Values failing | ${counts.valuesFail} |`);
        md.push(`| … of which gated behind Max Number | ${counts.gated} |`);
        md.push(`| Failing surface counts (a value can fail several) | gen ${counts.bySurface.gen} · print ${counts.bySurface.print} · screen ${counts.bySurface.screen} · trip ${counts.bySurface.trip} |`);
        md.push(`| Skills whose every option value passes | ${counts.skillsPass} / ${counts.skillsWithOptions} |`, '');
        md.push('## Failures by generator file', '');
        for (const file of Object.keys(byFile).sort()) {
            const list = byFile[file];
            md.push(`### ${file} — ${new Set(list.map(v => v.key)).size} skill(s), ${list.length} value(s)`, '');
            md.push('| Skill | Option = value | Failure |', '|---|---|---|');
            for (const v of list) md.push(`| \`${v.key}\` | ${v.option}${v.option === 'static' ? '' : ' = `' + JSON.stringify(v.value) + '`'} | ${v.fails.join('<br>').replace(/\|/g, '\\|')} |`);
            md.push('');
        }
        md.push('## Warnings (not failures)', '', 'Soft predicates: Max Number bounds, overruled notation, answers the key text search could not find.', '');
        md.push('| Skill | Option = value | Warning |', '|---|---|---|');
        for (const v of values.filter(x => x.warns.length)) md.push(`| \`${v.key}\` | ${v.option} = \`${JSON.stringify(v.value)}\` | ${v.warns.join('<br>').replace(/\|/g, '\\|')} |`);
        md.push('', '## Every skill with options', '', '| Skill | Generator | Options shown | Values | Fail | Surfaces failing |', '|---|---|---|---|---|---|');
        for (const r of results) {
            const f = r.results.filter(x => x.fails.length);
            const surf = [...new Set(f.flatMap(x => x.fails.map(m => m.split(':')[0])))].join(', ');
            md.push(`| \`${r.key}\` | ${r.genFile} | ${r.options.map(o => o.id).join(', ')} | ${r.results.length} | ${f.length}${r.statics.length ? ` +${r.statics.length} static` : ''} | ${surf} |`);
        }
        md.push('', '## Skills with no option shown', '', 'These skills show the teacher no Options control at all. See OPTIONS-AUDIT.md for which ones should have one.', '');
        const noOpt = all.filter(s => !s.nOffered);
        const byCat = {};
        for (const s of noOpt) (byCat[s.categoryId] = byCat[s.categoryId] || []).push(s.skillId);
        md.push('| Category | Count | Skills |', '|---|---|---|');
        for (const [c, l] of Object.entries(byCat)) md.push(`| ${c} | ${l.length} | ${l.map(x => '`' + x + '`').join(' ')} |`);
        fs.writeFileSync(path.join(ROOT, 'design', 'audit', 'OPTIONS-VERIFY.md'), md.join('\n') + '\n');
    }

    console.log(`skills: ${counts.skillsWithOptions} with options (${counts.skillsWithoutOptions} with none) · values ${counts.values}: ${counts.valuesPass} pass, ${counts.valuesFail} fail (${counts.gated} gated) · skills passing ${counts.skillsPass}/${counts.skillsWithOptions}`);
    if (pageErrors.length) console.log(`page errors during the run: ${pageErrors.length} (first: ${pageErrors[0].text})`);
    if (failV.length || results.some(r => r.statics.length)) {
        console.log('ws-options-verify: FAIL');
        if (!VERBOSE && !ONLY) {
            for (const file of Object.keys(byFile).sort()) {
                console.log(`  ${file}: ${new Set(byFile[file].map(v => v.key)).size} skill(s), ${byFile[file].length} value(s)`);
                for (const v of byFile[file].slice(0, 6)) console.log(`    - ${v.key} ${v.option}=${JSON.stringify(v.value)}: ${v.fails[0]}`);
                if (byFile[file].length > 6) console.log(`    … ${byFile[file].length - 6} more`);
            }
        }
        if (!REPORT_ONLY) process.exit(1);
    } else console.log('ws-options-verify: OK');
})();
