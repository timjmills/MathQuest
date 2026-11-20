// design/cards/mixed-review/proto/check-v1.mjs
// The machine check of DEALER V1 (dealer-v1.mjs): every property the card's §2, §3 and §7a claim, proved on pinned
// fixtures (fixtures/case-*.json over the pinned pools fixtures/pool-*.json). Each property has PASS fixtures (the dealer
// as written) and FAIL fixtures (a broken input or a `_mutate` flag that breaks one rule); a FAIL fixture must be CAUGHT.
//
//   node design/cards/mixed-review/proto/check-v1.mjs           # every fixture; prints `check-v1: OK (n props, m fixtures)`
//   node design/cards/mixed-review/proto/check-v1.mjs --table   # print the card §3 capacity table (generated)
//   node design/cards/mixed-review/proto/check-v1.mjs --show <case>   # print one fixture's deal
//   node design/cards/mixed-review/proto/check-v1.mjs --fill    # INFORMATIONAL: pages under half full (card §3 open H5 item)
//
// Properties: a determinism + code round trip · b no skill over ceil(N/2) · c at most 3 skills a page · d no avoidable
// adjacency (a single-skill page exempt) · e exact N (2-up: each half 1..5) · f the week · g adapt · h the size table and
// the ceilings · i the V1 freeze (sha256 of dealer-v1.mjs) · j shelves (a short shelf only last, never over k).
// In the product these become MIX-REVIEW-SHARE (a, i), -COUNT (b, c, d, e, h, j), -POOL (b, c, d, g) and -WEEK (f).
// Exit 0 on OK, 1 on FAIL.

import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './dealer-v1.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, 'fixtures');
const readJ = (f) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));
const pools = {};
const poolOf = (ref) => (Array.isArray(ref) ? ref : (pools[ref] ||= readJ(`${ref}.json`)));
const J = (x) => JSON.stringify(x);

/* ----------------------------------------------------------------------------------------------- the properties */
const sheetsOf = (out) => (out.days ? out.days : [out]);
const listOf = (out) => sheetsOf(out).map((s) => s.items.map((it) => [it.n, it.skill, it.seed, it.page]));

function propA(input, mut, run) {
    const v = [];
    const o1 = run(input, mut); const o2 = run(input, mut);
    if (J(o1) !== J(o2)) v.push('the same input gave two different outputs');
    if (o1.error) return v;
    const codes = [D.encode(input, o1, mut)];
    if (input.week) for (let d = 1; d <= 5; d++) codes.push(D.encode({ ...input, day: d }, o1, mut));
    codes.forEach((code, idx) => {
        const dec = D.decode(code);
        if (dec.error) { v.push(`${code}: ${dec.error}`); return; }
        const rin = D.replayInput(dec, poolOf(input.pool));
        const o3 = rin.week && rin.day ? D.deal(rin) : rin.week ? D.week(rin) : D.deal(rin);
        const want = idx === 0 ? o1 : o1.days[idx - 1];
        if (o3.error) { v.push(`${code}: replay refused: ${o3.error}`); return; }
        if (J(listOf(o3)) !== J(listOf(want))) v.push(`${code}: decode -> re-deal gives another item list`);
        if (J(sheetsOf(o3).map((s) => s.pages.map((p) => p.n))) !== J(sheetsOf(want).map((s) => s.pages.map((p) => p.n)))) v.push(`${code}: another page split`);
        if (idx === 0 && !input.week) {
            const cnt = {}; for (const it of o1.items) cnt[it.code] = (cnt[it.code] || 0) + 1;
            for (const s of dec.skills) if (cnt[s.code] !== s.count) v.push(`${code}: ${s.code} count ${s.count} != dealt ${cnt[s.code]}`);
        }
    });
    return v;
}
function propB(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) {
        const t = {}; for (const it of sh.items) t[it.skill] = (t[it.skill] || 0) + 1;
        for (const [k, n] of Object.entries(t)) if (n > Math.ceil(input.N / 2)) v.push(`day ${sh.day}: ${k} has ${n} > ceil(${input.N}/2)`);
    }
    return v;
}
function propC(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => { if (new Set(p.skills).size > D.MAX_SKILLS_PAGE) v.push(`day ${sh.day} page ${i + 1}: ${p.skills.length} skills`); });
    return v;
}
/** Adjacent same-skill pairs in a sequence, and the fewest any order of those keys allows: max(0, 2*major - T - 1). */
export function adjacency(keys) {
    let pairs = 0; for (let i = 1; i < keys.length; i++) if (keys[i] === keys[i - 1]) pairs++;
    const c = {}; for (const k of keys) c[k] = (c[k] || 0) + 1;
    const major = Math.max(0, ...Object.values(c));
    return { pairs, min: Math.max(0, 2 * major - keys.length - 1), skills: Object.keys(c).length };
}
function propD(input, out) {
    const v = [];
    if ((input.order || 'mixed') !== 'mixed') return v;
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        const keys = p.arrangement === 'm1' ? p.shelves.map((s) => s.skill) : p.shelves.map((s) => s.skill);
        const a = adjacency(keys);
        if (a.skills < 2) return;                   // a single-skill page is exempt (r2 resolution 1)
        if (a.pairs > a.min) v.push(`day ${sh.day} page ${i + 1} (${p.arrangement}): ${a.pairs} adjacent pairs, ${a.min} unavoidable`);
    });
    return v;
}
function propE(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) {
        const ns = sh.items.map((it) => it.n);
        if (ns.length !== input.N) v.push(`day ${sh.day}: ${ns.length} items, N = ${input.N}`);
        if (J(ns) !== J(Array.from({ length: ns.length }, (_, i) => i + 1))) v.push(`day ${sh.day}: not numbered 1..n`);
        const pageSum = sh.pages.reduce((a, p) => a + p.n, 0);
        if (pageSum !== ns.length) v.push(`day ${sh.day}: pages hold ${pageSum}, items ${ns.length}`);
        const fits = input.N === 5 && sh.pages.length === 1 && sh.pages[0].fill <= 0.5;
        if (fits !== !!sh.twoUp) v.push(`day ${sh.day}: 2-up ${!!sh.twoUp}, but the 5 ${fits ? 'fit' : 'do not fit'} a half page`);
        if (sh.twoUp) for (const h of sh.halves || []) if (J(h) !== '[1,2,3,4,5]') v.push(`day ${sh.day}: a 2-up half is not numbered 1-5`);
        if (sh.twoUp && (!sh.halves || sh.halves.length !== 2)) v.push(`day ${sh.day}: 2-up without two halves`);
    }
    return v;
}
function propF(input, out) {
    const v = [];
    if (!out.days) return ['not a week'];
    const pool = D.filterPool(poolOf(input.pool), input.filters).map((s) => s.id);
    if (out.days.length !== 5) v.push(`${out.days.length} days`);
    if (new Set(out.days.map((d) => d.daySeed)).size !== 5) v.push('two days share a seed');
    if (new Set(out.days.map((d) => J(d.items.map((it) => [it.skill, it.seed])))).size !== 5) v.push('two days are the same sheet');
    const seen = new Set(); const sets = [];
    out.days.forEach((d) => {
        const set = new Set();
        d.pages.forEach((p) => p.skills.forEach((id) => {
            const repeat = seen.has(id) || set.has(id);
            const comeback = id === d.comeback && !set.has(id);
            if (repeat && !comeback && pool.some((x) => !seen.has(x) && !set.has(x))) v.push(`day ${d.day}: ${id} repeats while ${pool.filter((x) => !seen.has(x) && !set.has(x)).length} pool skill(s) are unseen`);
            set.add(id);
        }));
        set.forEach((id) => seen.add(id)); sets.push(set);
        if (d.day >= 3 && d.comeback && !sets[d.day - 3].has(d.comeback)) v.push(`day ${d.day}: comeback ${d.comeback} was not on day ${d.day - 2}`);
    });
    const kMax = Math.max(...sets.map((s) => s.size));
    if (pool.length >= 2 * kMax) for (let d = 1; d < 5; d++) for (const id of sets[d]) if (sets[d - 1].has(id)) v.push(`${id} on days ${d} and ${d + 1}`);
    return v;
}
function propG(input, out) {
    const v = [];
    if (!input.adapt) return ['not an adapt fixture'];
    const L = new Set(input.listed || []);
    for (const it of out.items) if (!L.has(it.code)) v.push(`adapt dealt ${it.skill} (${it.code}), not on the code's list`);
    out.pages.forEach((p, i) => {
        const c = {}; for (const s of p.shelves) c[s.skill] = (c[s.skill] || 0) + s.items.length;
        const ns = Object.values(c);
        if (Math.max(...ns) - Math.min(...ns) > 1) v.push(`page ${i + 1}: counts ${ns.join(' + ')} are weighted, not the even deal`);
    });
    return v.concat(propB(input, out), propC(input, out), propE(input, out));
}
const TABLE = () => readJ('size-table.json');
function propH(input, out, mut) {
    const v = [];
    const cap = mut.cap || D.CAP;
    if (input.tableCheck) {
        const t = D.capacityTable(cap);
        if (J(t) !== J(TABLE())) v.push('capacityTable differs from the pinned fixtures/size-table.json');
        for (const [cls, ref] of Object.entries(input.tableCheck)) for (const size of ['m', 'l']) for (const N of D.COUNTS) {
            const o = D.deal({ pool: poolOf(ref), N, seed: 7, size, order: 'mixed' }, mut);
            const want = TABLE()[`${size}:${cls}:${N}`];
            if (J(o.pages.map((p) => p.n)) !== J(want.pages)) v.push(`${size} ${cls} N=${N}: pages ${o.pages.map((p) => p.n).join('+')}, table ${want.pages.join('+')}`);
            if (!!o.twoUp !== want.twoUp) v.push(`${size} ${cls} N=${N}: 2-up ${!!o.twoUp}, table ${want.twoUp}`);
        }
    }
    if (out) for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        const size = sh.size;
        // fill: each item 1 / CAP[size][its class] of a page (a uniform page: n <= its table capacity)
        const fill = p.shelves.reduce((a, s) => a + s.items.length / D.CAP[size][poolOf(input.pool).find((x) => x.id === s.skill).fc], 0);
        if (fill > 1 + 1e-9) v.push(`day ${sh.day} page ${i + 1}: ${p.n} problems fill ${fill.toFixed(2)} pages (${size}, ${p.cls.join('/')})`);
        if (p.rows > D.SHELF_MAX[size]) v.push(`day ${sh.day} page ${i + 1}: ${p.rows} shelves > ${D.SHELF_MAX[size]}`);
    });
    return v;
}
function propI(input) {
    const src = readFileSync(join(HERE, 'dealer-v1.mjs'), 'utf8') + (input.appendToDealer || '');
    const sha = createHash('sha256').update(src).digest('hex');
    const pin = readJ('frozen.json').sha256;
    return sha === pin ? [] : [`dealer-v1.mjs sha256 ${sha.slice(0, 12)} != the V1 pin ${pin.slice(0, 12)} (a change to the V1 dealer ships as V2)`];
}
function propJ(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        if (p.arrangement !== 'grouped') return;
        const bySkill = {};
        p.shelves.forEach((s) => (bySkill[s.skill] ||= []).push(s.items.length));
        const k = (id) => D.SHELF[sh.size][poolOf(input.pool).find((x) => x.id === id).fc];
        for (const [id, sizes] of Object.entries(bySkill)) sizes.forEach((n, j) => {
            if (n > k(id)) v.push(`day ${sh.day} page ${i + 1}: a ${id} shelf of ${n} > k ${k(id)}`);
            if (n < k(id) && j !== sizes.length - 1) v.push(`day ${sh.day} page ${i + 1}: a short ${id} shelf (${n} of ${k(id)}) is not its last`);
        });
    });
    return v;
}
const PROPS = { a: propA, b: propB, c: propC, d: propD, e: propE, f: propF, g: propG, h: propH, i: propI, j: propJ };
const NEEDS_OUT = new Set(['b', 'c', 'd', 'e', 'f', 'g', 'j']);

/* ------------------------------------------------------------------------------------------------- the runner */
const run = (input, mut = {}) => (input.week && !input.day ? D.week(input, mut) : D.deal(input, mut));
function expand(fx) {
    const base = { ...fx.input };
    const sw = fx.sweep;
    if (!sw) return [base];
    const out = [];
    for (const N of sw.N || [base.N]) for (const size of sw.size || [base.size]) for (const order of sw.order || [base.order]) for (const seed of sw.seed || [base.seed]) out.push({ ...base, N, size, order, seed });
    return out;
}
function runFixture(fx) {
    const mut = fx.mutate || {};
    if (mut.cap) mut.cap = Object.fromEntries(['m', 'l'].map((k) => [k, { ...D.CAP[k], ...(mut.cap[k] || {}) }]));
    const viol = [];
    for (const input of expand(fx)) {
        input.pool = fx.input.pool;
        const inp = { ...input, pool: poolOf(input.pool) };
        const out = fx.props.some((p) => NEEDS_OUT.has(p) || p === 'h') && !input.tableOnly ? run(inp, mut) : null;
        if (out && out.error) { viol.push(`refused: ${out.error}`); continue; }
        for (const p of fx.props) {
            const res = p === 'a' ? propA({ ...inp, pool: input.pool }, mut, (i, m) => run({ ...i, pool: poolOf(i.pool) }, m))
                : p === 'i' ? propI(input) : PROPS[p]({ ...input }, out, mut);
            for (const r of res) viol.push(`(${p}) N=${input.N} ${input.size} ${input.order} S=${input.seed}: ${r}`);
        }
    }
    return viol;
}

const args = process.argv.slice(2);
if (args[0] === '--table') {
    const t = D.capacityTable();
    const cell = (s, c, N) => { const x = t[`${s}:${c}:${N}`]; return x.twoUp ? '1 (2-up: 5 and 5)' : `${x.pages.length} (${x.pages.join(' + ')})`; };
    console.log('| N | M compact / typical (12) | M wide (4) | L compact (10) | L typical (8) | L wide (3) |\n|--:|---|---|---|---|---|');
    for (const N of D.COUNTS) console.log(`| ${N} | ${cell('m', 'typical', N)} | ${cell('m', 'wide', N)} | ${cell('l', 'compact', N)} | ${cell('l', 'typical', N)} | ${cell('l', 'wide', N)} |`);
    process.exit(0);
}
if (args[0] === '--fill') {      // INFORMATIONAL (not a gate): pages under half full, the open H5 item of card §3
    for (const ref of ['pool-large', 'pool-compact', 'pool-typical', 'pool-wide', 'pool-2mix']) {
        let pages = 0, under = 0, notLast = 0;
        for (const N of D.COUNTS) for (const size of ['m', 'l']) for (let seed = 1; seed <= 300; seed++) {
            const o = D.deal({ pool: poolOf(ref), N, seed, size, order: 'mixed' });
            if (o.twoUp) continue;
            o.pages.forEach((p, i) => { pages++; if (p.fill * 2 < 1) { under++; if (i !== o.pages.length - 1) notLast++; } });
        }
        console.log(`  ${ref}: ${under} of ${pages} pages under half full (${notLast} not the sheet's last page)`);
    }
    process.exit(0);
}
const files = readdirSync(FIX).filter((f) => /^case-.*\.json$/.test(f)).sort();
if (args[0] === '--show') {
    const fx = readJ(`case-${args[1]}.json`); const inp = { ...expand(fx)[0] }; inp.pool = poolOf(inp.pool);
    console.log(JSON.stringify(run(inp, fx.mutate || {}), (k, v) => (k === 'chosen' ? undefined : v), 1));
    process.exit(0);
}
const bad = []; const props = new Set(); const tally = {};
for (const f of files) {
    const fx = readJ(f);
    const viol = runFixture(fx);
    for (const p of fx.props) { props.add(p); tally[p] ||= { pass: 0, fail: 0 }; tally[p][fx.expect]++; }
    if (fx.expect === 'pass' && viol.length) bad.push(`${f}: PASS fixture has ${viol.length} violation(s):\n      ${viol.slice(0, 6).join('\n      ')}`);
    else if (fx.expect === 'fail' && !viol.some((x) => x.startsWith(`(${fx.catch})`))) bad.push(`${f}: FAIL fixture NOT caught by (${fx.catch}) [${viol.slice(0, 2).join('; ')}]`);
    else console.log(`  ${fx.expect === 'pass' ? 'PASS  ' : 'CAUGHT'} ${f.replace(/^case-|\.json$/g, '')}${fx.expect === 'fail' ? ` (${fx.catch}: ${viol.find((x) => x.startsWith(`(${fx.catch})`)).replace(/^\(\w\) /, '').slice(0, 110)})` : ''}`);
}
for (const p of Object.keys(PROPS)) if (!tally[p] || !tally[p].pass || !tally[p].fail) bad.push(`property ${p} lacks a PASS or a FAIL fixture (${J(tally[p] || {})})`);
if (bad.length) { console.log(`check-v1: FAIL (${bad.length})\n  ${bad.join('\n  ')}`); process.exit(1); }
console.log(`check-v1: OK (${props.size} props, ${files.length} fixtures)`);
