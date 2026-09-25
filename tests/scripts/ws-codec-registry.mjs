// The share-code option-key registry is APPEND-ONLY, and old apps skip what they do not know.
//
//   node tests/scripts/ws-codec-registry.mjs            # the gate
//   node tests/scripts/ws-codec-registry.mjs --pin      # add NEW entries to the pinned baseline
//
// Pure node (no browser). Prints `ws-codec-registry: OK` or `ws-codec-registry: FAIL (n)` and exits
// non-zero on failure, like ws-boot-smoke / ws-layout-unit.
//
// 1. PINNED. Every key (one-letter and digit + letter), every key block, every value token and
//    every numeric set member in js/modules/skill-option-keys.js is compared with
//    tests/baselines/codec-registry.snapshot.json. An entry that CHANGED or DISAPPEARED fails: a
//    shipped link would decode differently. A NEW entry is reported; `--pin` appends it (it never
//    rewrites an existing entry).
// 2. WELL-FORMED. Keys are unique; one-letter keys are A–Z; multi keys are a digit then a letter,
//    inside a block marked 'assigned', and never inside another wave's reserved range; every union
//    token table gives each value its own character from A–Z 0–9.
// 3. COVERED. Every option every live skill declares (skill-options.js, with the derived and pool
//    options registered) has a key, every string value has a token, and every numeric set member is
//    in the union (so the registry lists everything a later branch must not reuse).
// 4. OLD APPS. For every live skill whose options include a digit + letter key, codes are written
//    with those options changed (alone, and beside a one-letter option) and read by
//      - the NEW decoder: the options come back exactly;
//      - the DEPLOYED decoder (tests/fixtures/deployed-skill-option-codec.mjs, copied from git):
//        it must return exactly what the new decoder returns for the one-letter fields alone, and
//        the skill's defaults ({}) when there are none — a digit + letter field is skipped, never
//        read as some other option. The payload may never start with a digit.
//    And the other way: every one-letter-only code decodes identically in both decoders.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const BASELINE = path.join(ROOT, 'tests', 'baselines', 'codec-registry.snapshot.json');
const PIN = process.argv.includes('--pin');

// data.js reads localStorage at import time.
const mem = {};
globalThis.localStorage = globalThis.localStorage || {
    getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; },
};
const quiet = console.log;
console.log = () => {};
const REG = await import('../../js/modules/skill-option-keys.js');
const SO = await import('../../js/modules/skill-options.js');
await import('../../js/modules/skill-options-derived.js');
await import('../../js/modules/skill-options-pools.js');
const DATA = await import('../../js/modules/data.js');
const NEW = await import('../../js/modules/skill-option-codec.js');
const OLD = await import('../fixtures/deployed-skill-option-codec.mjs');
console.log = quiet;

const fails = [];
const notes = [];
const fail = (m) => { if (fails.length < 80) fails.push(m); else if (fails.length === 80) fails.push('... more'); };

/* ------------------------------------------------------------------ 1. the pinned snapshot */
function current() {
    const tokens = {};
    for (const id of Object.keys(REG.OPTION_KEYS)) tokens[id] = Object.fromEntries(Object.entries(REG.tokenUnion(id)).map(([v, t]) => [String(v), t]));
    const blocks = {};
    for (const [d, b] of Object.entries(REG.KEY_BLOCKS)) blocks[d] = { owner: b.owner, status: b.status, keys: b.keys };
    return {
        oneLetterKeys: { ...REG.ONE_LETTER_KEYS },
        multiKeys: { ...REG.MULTI_KEYS },
        blocks,
        tokens,
        scalarOnly: { ...REG.SCALAR_ONLY },
        subranges: Object.fromEntries((REG.KEY_SUBRANGES || []).map((sr) => [sr.keys, sr.owner])),
    };
}
const now = current();
let base = null;
try { base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); } catch (e) { base = null; }
if (!base) {
    if (!PIN) fail(`no baseline at ${path.relative(ROOT, BASELINE)} — run with --pin once`);
    base = { oneLetterKeys: {}, multiKeys: {}, blocks: {}, tokens: {}, scalarOnly: {} };
}
const added = [];
function compareFlat(section, a, b) {
    for (const [k, v] of Object.entries(a)) {
        if (!(k in b)) fail(`${section}.${k} DELETED (pinned ${JSON.stringify(v)})`);
        else if (JSON.stringify(b[k]) !== JSON.stringify(v)) fail(`${section}.${k} CHANGED: pinned ${JSON.stringify(v)}, now ${JSON.stringify(b[k])}`);
    }
    for (const k of Object.keys(b)) if (!(k in a)) added.push(`${section}.${k} = ${JSON.stringify(b[k])}`);
}
compareFlat('oneLetterKeys', base.oneLetterKeys, now.oneLetterKeys);
compareFlat('multiKeys', base.multiKeys, now.multiKeys);
compareFlat('scalarOnly', base.scalarOnly, now.scalarOnly);
compareFlat('subranges', base.subranges || {}, now.subranges);
// A block may move from 'reserved' / 'spare' to 'assigned' (its wave merged) and gain keys, but its
// owner never changes once set, and an assigned block never goes back.
for (const [d, b] of Object.entries(base.blocks)) {
    const c = now.blocks[d];
    if (!c) { fail(`block ${d} DELETED`); continue; }
    if (b.owner && c.owner !== b.owner) fail(`block ${d} owner CHANGED: "${b.owner}" -> "${c.owner}"`);
    if (b.status === 'assigned' && c.status !== 'assigned') fail(`block ${d} was assigned, now ${c.status}`);
    if (JSON.stringify(b) !== JSON.stringify(c)) added.push(`blocks.${d} = ${JSON.stringify(c)} (was ${JSON.stringify(b)})`);
}
for (const d of Object.keys(now.blocks)) if (!(d in base.blocks)) added.push(`blocks.${d} = ${JSON.stringify(now.blocks[d])}`);
for (const [id, tab] of Object.entries(base.tokens)) {
    if (!(id in now.tokens)) { fail(`tokens.${id} DELETED`); continue; }
    compareFlat(`tokens.${id}`, tab, now.tokens[id]);
}
for (const id of Object.keys(now.tokens)) if (!(id in base.tokens)) added.push(`tokens.${id} = ${JSON.stringify(now.tokens[id])}`);

if (PIN && !fails.length) {
    // Append only: every pinned entry is kept as it was; new ones are added.
    const merged = JSON.parse(JSON.stringify(base));
    merged.subranges = merged.subranges || {};
    for (const s of ['oneLetterKeys', 'multiKeys', 'scalarOnly', 'subranges']) for (const [k, v] of Object.entries(now[s])) if (!(k in merged[s])) merged[s][k] = v;
    for (const [d, b] of Object.entries(now.blocks)) merged.blocks[d] = b;
    for (const [id, tab] of Object.entries(now.tokens)) {
        merged.tokens[id] = merged.tokens[id] || {};
        for (const [v, t] of Object.entries(tab)) if (!(v in merged.tokens[id])) merged.tokens[id][v] = t;
    }
    fs.writeFileSync(BASELINE, JSON.stringify(merged, null, 2) + '\n');
    notes.push(`pinned ${added.length} new entr${added.length === 1 ? 'y' : 'ies'}`);
} else if (added.length) {
    notes.push(`${added.length} NEW entr${added.length === 1 ? 'y is' : 'ies are'} not pinned yet (run --pin in the same change):`);
    for (const a of added.slice(0, 40)) notes.push(`  + ${a}`);
}

/* ------------------------------------------------------------------ 2. well-formed */
const allKeys = Object.entries(REG.OPTION_KEYS);
const byKey = {};
for (const [id, k] of allKeys) {
    if (byKey[k]) fail(`key ${k} is given to both ${byKey[k]} and ${id}`);
    byKey[k] = id;
}
for (const [id, k] of Object.entries(REG.ONE_LETTER_KEYS)) if (!/^[A-Z]$/.test(k)) fail(`one-letter key of ${id} is "${k}"`);
const rangeOf = (keys) => {
    const m = /^(\d)([A-Z])-\1([A-Z])$/.exec(keys || '');
    return m ? { d: m[1], from: m[2], to: m[3] } : null;
};
for (const [id, k] of Object.entries(REG.MULTI_KEYS)) {
    if (!/^\d[A-Z]$/.test(k)) { fail(`multi key of ${id} is "${k}" (want a digit then a letter)`); continue; }
    if (!REG.MULTI_KEY_RE.test(k)) fail(`MULTI_KEY_RE does not match ${k}`);
    const b = REG.KEY_BLOCKS[k[0]];
    if (!b || b.status !== 'assigned') fail(`${id} = ${k}: block ${k[0]} is ${b ? b.status : 'missing'}, not assigned`);
    const r = b && rangeOf(b.keys);
    const inSub = (REG.KEY_SUBRANGES || []).some((sr) => { const q = rangeOf(sr.keys); return q && q.d === k[0] && k[1] >= q.from && k[1] <= q.to; });
    if (b && b.status === 'assigned' && !inSub && (!r || k[1] < r.from || k[1] > r.to)) fail(`${id} = ${k} lies outside block ${k[0]}'s declared keys ${b && b.keys} and every sub-range`);
}
// Sub-ranges: well-formed, after their block's own keys, never overlapping one another.
{
    const seen = [];
    for (const sr of (REG.KEY_SUBRANGES || [])) {
        const q = rangeOf(sr.keys);
        if (!q) { fail(`sub-range "${sr.keys}" is not a range like 3B-3M`); continue; }
        const b = REG.KEY_BLOCKS[q.d], r = b && rangeOf(b.keys);
        if (r && q.from <= r.to) fail(`sub-range ${sr.keys} overlaps block ${q.d}'s own keys ${b.keys}`);
        for (const o of seen) if (o.d === q.d && !(q.to < o.from || q.from > o.to)) fail(`sub-range ${sr.keys} overlaps another sub-range`);
        seen.push(q);
    }
}
for (const [d, b] of Object.entries(REG.KEY_BLOCKS)) {
    if (!/^\d$/.test(d)) fail(`block "${d}" is not a digit`);
    if (!['assigned', 'reserved', 'spare'].includes(b.status)) fail(`block ${d} status ${b.status}`);
    if (b.keys && !rangeOf(b.keys)) fail(`block ${d} keys "${b.keys}" is not a range like 5A-5M`);
    if (b.keys && rangeOf(b.keys).d !== d) fail(`block ${d} declares keys in another block (${b.keys})`);
}
if (Object.keys(REG.KEY_BLOCKS).length !== 10) fail('KEY_BLOCKS must list all ten digits');
for (const id of Object.keys(REG.OPTION_KEYS)) {
    let u = null;
    try { u = REG.tokenUnion(id); } catch (e) { fail(e.message); continue; }
    const chars = Object.values(u);
    if (new Set(chars).size !== chars.length) fail(`${id}: two values share a token`);
    for (const t of chars) if (!/^[A-Z0-9]$/.test(t)) fail(`${id}: token "${t}" is not one of A-Z 0-9`);
}
for (const id of Object.keys(REG.VALUE_TOKENS)) if (!(id in REG.OPTION_KEYS)) fail(`VALUE_TOKENS.${id} has no key`);
for (const id of Object.keys(REG.NUMERIC_SET_VALUES)) if (!(id in REG.OPTION_KEYS)) fail(`NUMERIC_SET_VALUES.${id} has no key`);
for (const id of Object.keys(REG.OPTION_KEYS)) {
    const has = Object.keys(REG.tokenUnion(id)).length > 0;
    if (!has && !(id in REG.SCALAR_ONLY)) fail(`${id}: no token table and not listed in SCALAR_ONLY`);
}
if (NEW.OPTION_KEYS !== REG.OPTION_KEYS || NEW.VALUE_TOKENS !== REG.VALUE_TOKENS) fail('skill-option-codec.js does not read its keys and tokens from the registry');

/* ------------------------------------------------------------------ 3. every live option covered */
const live = [];
for (const [cat, list] of Object.entries(DATA.SKILLS)) {
    if (!Array.isArray(list)) continue;
    for (const s of list) if (s && !s.retired) live.push([cat, s.v]);
}
let defCount = 0;
for (const [cat, id] of live) {
    for (const d of SO.optionsFor(cat, id)) {
        defCount++;
        const where = `${cat}:${id} ${d.id}`;
        if (!REG.OPTION_KEYS[d.id]) { fail(`${where}: no key in the registry`); continue; }
        if (d.tokens) {
            for (const [v, t] of Object.entries(d.tokens)) if (!/^[A-Z0-9]+$/.test(String(t)) || String(t).length !== (d.tokenWidth || 1)) fail(`${where}: own token "${t}" for ${v}`);
            continue;
        }
        const u = REG.tokenUnion(d.id);
        for (const x of d.values || []) {
            if (typeof x.v === 'string' && !(x.v in u)) fail(`${where}: value "${x.v}" has no token`);
            if (typeof x.v === 'number' && d.type === 'set' && !(String(x.v) in u)) fail(`${where}: set member ${x.v} is not in NUMERIC_SET_VALUES.${d.id}`);
            if (typeof x.v === 'number' && d.type !== 'set' && !(Number.isInteger(x.v) && x.v >= 0)) fail(`${where}: scalar ${x.v} cannot be written as decimal digits`);
        }
    }
}

/* ------------------------------------------------------------------ 4. the deployed decoder */
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const nonDefault = (d) => {
    if (d.type === 'bool') return !d.default;
    if (d.type === 'int') return d.max !== d.default ? d.max : d.min;
    const vs = (d.values || []).map((x) => x.v);
    if (d.type === 'set') {
        const one = vs.find((v) => !eq([v], d.default));
        return one === undefined ? null : [one];
    }
    const e = vs.find((v) => !eq(v, d.default));
    return e === undefined ? null : e;
};
const oldTokenKnown = (optId, v) => typeof v === 'number' || !!(OLD.VALUE_TOKENS[optId] && Object.prototype.hasOwnProperty.call(OLD.VALUE_TOKENS[optId], v));
function oldKnown(cat, id, packed) {
    const out = {};
    let dropped = false;
    for (const [k, v] of Object.entries(packed)) {
        if (Array.isArray(v)) { const f = v.filter((x) => oldTokenKnown(k, x)); dropped = dropped || f.length !== v.length; out[k] = f; }
        else if (typeof v === 'string' && !oldTokenKnown(k, v)) dropped = true;
        else out[k] = v;
    }
    return dropped ? SO.packOptions(cat, id, SO.normalizeOptions(cat, id, out)) : packed;
}
const stripMulti = (payload) => payload.split('_').filter((f) => f && !REG.MULTI_KEY_RE.test(f)).join('_');
let multiSkills = 0, codes = 0;
for (const [cat, id] of live) {
    const defs = SO.optionsFor(cat, id);
    const multi = defs.filter((d) => REG.MULTI_KEY_RE.test(REG.OPTION_KEYS[d.id] || ''));
    const single = defs.filter((d) => /^[A-Z]$/.test(REG.OPTION_KEYS[d.id] || ''));
    const cases = [];
    // the one-letter options alone (both decoders must agree exactly)
    for (const d of single) { const v = nonDefault(d); if (v !== null) cases.push({ [d.id]: v }); }
    if (multi.length) {
        multiSkills++;
        for (const d of multi) {
            const v = nonDefault(d);
            if (v === null) continue;
            cases.push({ [d.id]: v });                                   // multi alone -> "~_5A…"
            for (const s of single.slice(0, 2)) { const w = nonDefault(s); if (w !== null) cases.push({ [s.id]: w, [d.id]: v }); }
        }
        const all = {};
        for (const d of defs) { const v = nonDefault(d); if (v !== null) all[d.id] = v; }
        cases.push(all);
    }
    for (const opts of cases) {
        const want = SO.packOptions(cat, id, SO.normalizeOptions(cat, id, opts));
        const payload = NEW.encodeOptionPayload(cat, id, opts);
        if (!payload) continue;
        codes++;
        const tag = `${cat}:${id} ${JSON.stringify(opts)} -> ~${payload}`;
        if (/^\d/.test(payload)) fail(`${tag}: the payload starts with a digit (an old app drops it as a later version)`);
        if (!/^[A-Z0-9_]+$/.test(payload)) fail(`${tag}: unsafe character`);
        const back = NEW.decodeOptionPayload(cat, id, payload);
        if (!eq(back, want)) fail(`${tag}: new decoder read ${JSON.stringify(back)}, want ${JSON.stringify(want)}`);
        const oldRead = OLD.decodeOptionPayload(cat, id, payload);
        // A VALUE appended to a one-letter key after the deployed build (P9's `support: strip`,
        // `response: bank` ...) has a token the deployed decoder's table lacks: it skips that
        // field and the option stays at its default. That is the graceful path, not a misread,
        // so such a field is left out of what the deployed decoder must read. A token it DOES
        // know must still read the same value (checked below, unchanged).
        const oldKnows = (f) => {
            const optId = Object.keys(OLD.OPTION_KEYS).find((k) => OLD.OPTION_KEYS[k] === f[0]);
            const table = optId && OLD.VALUE_TOKENS[optId];
            const body = f.slice(1);
            if (!table || /^\d+$/.test(body)) return true;
            const known = new Set(Object.values(table));
            return body.length === 1 ? known.has(body) : true;
        };
        const oneLetter = stripMulti(payload).split('_').filter((f) => f && oldKnows(f)).join('_');
        // S2: a SET field may mix known and new tokens (the support set's touch dots and panes); the
        // deployed decoder drops the new values of it and reads the rest.
        const expectOld = oneLetter ? oldKnown(cat, id, NEW.decodeOptionPayload(cat, id, oneLetter)) : {};
        if (!eq(oldRead, expectOld)) fail(`${tag}: the DEPLOYED decoder read ${JSON.stringify(oldRead)}, want ${JSON.stringify(expectOld)}`);
        if (!oneLetter && !eq(oldRead, {})) fail(`${tag}: the DEPLOYED decoder did not load the defaults`);
        // The deployed ENCODER's code for the same options (one-letter only) reads identically in both.
        const oldPayload = OLD.encodeOptionPayload(cat, id, opts);
        if (oldPayload && !eq(NEW.decodeOptionPayload(cat, id, oldPayload), OLD.decodeOptionPayload(cat, id, oldPayload))) {
            fail(`${cat}:${id} deployed code ~${oldPayload} decodes differently now`);
        }
    }
}
// Hand-written forms: a multi field in front of a one-letter field, and junk digit fields.
{
    const probe = live.find(([c, s]) => SO.optionsFor(c, s).some((d) => d.id === 'forms') && SO.optionsFor(c, s).some((d) => d.id === 'level'));
    if (probe) {
        const [c, s] = probe;
        const L = NEW.encodeOptionPayload(c, s, { level: nonDefault(SO.optionsFor(c, s).find((d) => d.id === 'level')) });
        if (!/^L/.test(L)) fail(`${c}:${s}: no level field to probe with (${L})`);
        for (const p of [`_5B0_${L}`, `_9Z12_${L}`, '_5', `${L}_0Q`, '_4A1', `${L}_5B01`]) {
            const o = OLD.decodeOptionPayload(c, s, p);
            const n = NEW.decodeOptionPayload(c, s, p);
            const hasL = p.includes(L);
            if (o.forms !== undefined) fail(`${c}:${s} ~${p}: the deployed decoder read forms ${JSON.stringify(o.forms)}`);
            if ((o.level !== undefined) !== hasL) fail(`${c}:${s} ~${p}: the deployed decoder level ${JSON.stringify(o.level)}`);
            if (hasL && !eq(n.level, o.level)) fail(`${c}:${s} ~${p}: level differs new ${JSON.stringify(n.level)} / old ${JSON.stringify(o.level)}`);
        }
    } else fail('no live skill with both forms and level to probe');
}

/* ------------------------------------------------------------------ report */
console.log(`registry: ${Object.keys(REG.ONE_LETTER_KEYS).length} one-letter keys, ${Object.keys(REG.MULTI_KEYS).length} digit + letter keys, `
    + `${Object.keys(REG.OPTION_KEYS).filter((id) => Object.keys(REG.tokenUnion(id)).length).length} union token tables`);
console.log(`live: ${live.length} skills, ${defCount} option defs; ${multiSkills} skills carry a digit + letter key; ${codes} codes read by both decoders`);
for (const n of notes) console.log(n);
if (fails.length) {
    for (const f of fails) console.log('  FAIL ' + f);
    console.log(`ws-codec-registry: FAIL (${fails.length})`);
    process.exit(1);
}
console.log('ws-codec-registry: OK');
