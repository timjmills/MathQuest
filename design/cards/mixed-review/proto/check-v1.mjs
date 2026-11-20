// design/cards/mixed-review/proto/check-v1.mjs
// The machine check of DEALER V1 (dealer-v1.mjs): every property the card's §2, §3 and §7a claim, proved on pinned
// fixtures (fixtures/case-*.json over the pinned pools fixtures/pool-*.json). Each property has PASS fixtures (the dealer
// as written) and FAIL fixtures (a broken input or a `_mutate` flag that breaks one rule); a FAIL fixture must be CAUGHT,
// and when it names `catchText` it must be caught FOR THAT REASON (the violation text contains it).
//
//   node design/cards/mixed-review/proto/check-v1.mjs           # every fixture + the trace; `check-v1: OK (n props, m fixtures; trace ...)`
//   node design/cards/mixed-review/proto/check-v1.mjs --table   # print the card §3 capacity table (generated)
//   node design/cards/mixed-review/proto/check-v1.mjs --show <case>   # print one fixture's deal
//   node design/cards/mixed-review/proto/check-v1.mjs --fill    # props k, l, j2 over every pool x N x size x order x 300 seeds
//   node design/cards/mixed-review/proto/check-v1.mjs --trace   # the card's rule -> property trace alone (+ its FAIL fixtures)
//   node design/cards/mixed-review/proto/check-v1.mjs --pin     # re-take the V1 pins and the golden codes (only while V1 is unreleased)
//
// Properties: a determinism + code round trip (items, seeds, ~options) · b no skill over ceil(N/2) · c at most 3 skills a
// page · d no avoidable adjacency (a single-skill page exempt) · e exact N (2-up: each half 1..5) · f the week · g adapt ·
// h the size table, the kind -> class table and the ceilings · i the V1 freeze (sha256 of the dealer, interleave.js, rng.js
// and the frozen V1 table; the golden codes replay to their pinned items) · j shelves (a short shelf only last, never over
// k; a legacy cell never M1) · j2 a flat skill holds >= 2 items on every page it is on · k FILL (no page but a sheet's last
// under half full) · l no page holds fewer than 2 items · m every item seed is the card's formula.
// c, e, k, l, j2 RECOMPUTE from the shelves plus the pool (and this file's own copy of the 12.1 tables); no property reads
// the dealer's reported fill, skills or class.
// In the product these become MIX-REVIEW-SHARE (a, i, m), -COUNT (b, c, d, e, h, j, j2, k, l), -POOL (b, c, d, g) and
// -WEEK (f). Exit 0 on OK, 1 on FAIL.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as PROTO from './dealer-v1.mjs';
import { deriveSeed } from '../../../../js/modules/sheet/rng.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
// The dealer and the fixtures this file checks: the prototype by default; `configure()` points them at the PRODUCT dealer
// (js/modules/mixed-review.js) and tests/fixtures/mix-review/ for tests/scripts/ws-mix-review.mjs (card §9b step 1: the
// product checks' Node cores ARE these properties). Pools live in FIX (proto) or FIX/pools (product).
let D = PROTO;
let FIX = join(HERE, 'fixtures');
let POOLS = FIX;
const CARD = join(HERE, '..', 'mixed-review.md');
const readJ = (f) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));
let pools = {};
const poolOf = (ref) => (Array.isArray(ref) ? ref : ref === 'v1-registry' ? readJ('v1-registry.json').rows : (pools[ref] ||= JSON.parse(readFileSync(join(POOLS, `${ref}.json`), 'utf8'))));
/** Point the properties at another dealer module and fixture folder (ws-mix-review: the product). */
export function configure({ dealer, fixDir, poolDir, frozenFiles }) {
    D = dealer; FIX = fixDir; POOLS = poolDir || fixDir; pools = {};
    if (frozenFiles) Object.assign(FROZEN_FILES, frozenFiles);
}
const J = (x) => JSON.stringify(x);

/* ---------------------------------------------------- this check's OWN copy of the tables (never the dealer's) */
/** WORKSHEET_DESIGN_STANDARD 12.1: Review 12 / 8-12 (compact L 10, typical L 8), Wide-visual rows 4 / 3. */
const OWN_CAP = { m: { compact: 12, typical: 12, wide: 4 }, l: { compact: 10, typical: 8, wide: 3 } };
/** 12.1: plain word-problem rows 3 / 3 and long division (L 4) are wide; fact / equation compact; legacy typical. */
const OWN_KIND_CLASS = { fact: 'compact', equation: 'compact', stack: 'typical', 'visual-half': 'typical', table: 'typical',
    text: 'typical', legacy: 'typical', 'visual-full': 'wide', division: 'wide', 'word-problem': 'wide',
    'word-problem-long': 'wide',                                    // L9: 12.1 plain rows "2 if 4-5 lines" at L
    'family-check': 'typical', choice: 'typical', 'arrays-turn': 'typical', 'word-work': 'typical', 'count-row': 'wide', picture: 'wide' };
const OWN_KIND_CAP = { 'word-problem': { m: 3, l: 3 }, 'word-problem-long': { m: 3, l: 2 } };
/** L9 (lead ruling 2026-11-20): long word problems are dealt in PAIRS only. */
const OWN_KIND_PAIR = ['word-problem-long'];
const clsOfRow = (r) => (r.kind ? OWN_KIND_CLASS[r.kind] : r.fc);
const capOfRow = (r, size, cap = OWN_CAP) => Math.min(cap[size][clsOfRow(r)], r.kind && OWN_KIND_CAP[r.kind] ? OWN_KIND_CAP[r.kind][size] : Infinity);
const rowIn = (input, id) => poolOf(input.pool).find((x) => x.id === id);
/** Per page, recomputed: items by skill from the shelves, and the fill (sum of count / cap of the skill's class). */
function pageFacts(input, p, size) {
    const by = {}; for (const s of p.shelves) by[s.skill] = (by[s.skill] || 0) + s.items.length;
    const fill = Object.entries(by).reduce((a, [id, c]) => a + c / capOfRow(rowIn(input, id), size), 0);
    return { by, fill, n: Object.values(by).reduce((a, c) => a + c, 0) };
}
/** The 10 StaticFootprint kinds, read from SKILL_CELL_CONTRACT.md 3.5 (a new kind there fails h until V1 maps it). */
function contractKinds() {
    const src = readFileSync(join(REPO, 'design/SKILL_CELL_CONTRACT.md'), 'utf8');
    const m = /@property \{('fact'[^}]+)\} kind/.exec(src);
    return m ? m[1].split('|').map((k) => k.replace(/'/g, '')) : [];
}

/* ----------------------------------------------------------------------------------------------- the properties */
const sheetsOf = (out) => (out.days ? out.days : [out]);
const listOf = (out) => sheetsOf(out).map((s) => s.items.map((it) => [it.n, it.skill, it.opts || '', it.seed, it.page]));

function propA(input, mut, run) {
    const v = [];
    const o1 = run(input, mut); const o2 = run(input, mut);
    if (J(o1) !== J(o2)) v.push('the same input gave two different outputs');
    if (o1.error) return v;
    const codes = [D.encode(input, o1, mut)];
    if (input.week) for (let d = 1; d <= 5; d++) codes.push(D.encode({ ...input, day: d }, o1, mut));
    codes.forEach((code, idx) => {
        const dec = D.decode(code);
        if (dec.error) { v.push(`${code}: refused: ${dec.error}`); return; }
        const rin = D.replayInput(dec, poolOf(input.pool));
        if (rin.error) { v.push(`${code}: ${rin.error}`); return; }
        const o3 = rin.week && rin.day ? D.deal(rin) : rin.week ? D.week(rin) : D.deal(rin);
        const want = idx === 0 ? o1 : o1.days[idx - 1];
        if (o3.error) { v.push(`${code}: replay refused: ${o3.error}`); return; }
        if (J(listOf(o3)) !== J(listOf(want))) v.push(`${code}: decode -> re-deal gives another item list (numbers, skills, options, seeds, pages)`);
        if (J(sheetsOf(o3).map((s) => s.pages.map((p) => p.n))) !== J(sheetsOf(want).map((s) => s.pages.map((p) => p.n)))) v.push(`${code}: another page split`);
        if (idx === 0 && !input.week) {
            const cnt = {}; for (const it of o1.items) cnt[it.code] = (cnt[it.code] || 0) + 1;
            for (const s of dec.skills) if (cnt[s.code] !== s.count) v.push(`${code}: ${s.code} count ${s.count} != dealt ${cnt[s.code]}`);
        }
        for (const it of sheetsOf(want).flatMap((s) => s.items)) if (it.opts && !dec.skills.some((s) => s.code === it.code && s.opts === it.opts)) { v.push(`${code}: ${it.code}~${it.opts} options not carried in the code`); break; }
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
function propC(input, out) {        // recomputed: distinct skills in the page's shelves, never p.skills
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => { const k = new Set(p.shelves.map((s) => s.skill)).size; if (k > 3) v.push(`day ${sh.day} page ${i + 1}: ${k} skills in its shelves`); });
    return v;
}
/** Adjacent same-skill pairs in a sequence, and the fewest any order of those keys allows: max(0, 2*major - T - 1). */
export function adjacency(keys) {
    let pairs = 0; for (let i = 1; i < keys.length; i++) if (keys[i] === keys[i - 1]) pairs++;
    const c = {}; for (const k of keys) c[k] = (c[k] || 0) + 1;
    const major = Math.max(0, ...Object.values(c));
    return { pairs, min: Math.max(0, 2 * major - keys.length - 1), skills: Object.keys(c).length };
}
const GRADE_RANK = { K: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, M: 7 };
function propD(input, out) {
    const v = [];
    const order = input.order || 'mixed';
    if (order !== 'mixed') {        // easyhard: shelves by placement grade K -> 6+ (M last); area: AREA_ORDER, then grade
        const keyOf = (id) => { const r = rowIn(input, id); const g = GRADE_RANK[r.grade] ?? 9; return order === 'area' ? D.AREA_ORDER.indexOf(r.area) * 10 + g : g; };
        for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => { const ks = p.shelves.map((s) => keyOf(s.skill)); if (ks.some((k, j) => j && k < ks[j - 1])) v.push(`day ${sh.day} page ${i + 1}: ${order} shelves out of order`); });
        return v;
    }
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        const a = adjacency(p.shelves.map((s) => s.skill));
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
        const shelfSum = sh.pages.reduce((a, p) => a + p.shelves.reduce((b, s) => b + s.items.length, 0), 0);
        if (shelfSum !== ns.length) v.push(`day ${sh.day}: shelves hold ${shelfSum}, items ${ns.length}`);
        const fits = input.N === 5 && sh.pages.length === 1 && pageFacts(input, sh.pages[0], sh.size).fill <= 0.5 + 1e-9;   // recomputed
        if (fits !== !!sh.twoUp) v.push(`day ${sh.day}: 2-up ${!!sh.twoUp}, but the 5 ${fits ? 'fit' : 'do not fit'} a half page (fill recomputed from the shelves)`);
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
    out.days.forEach((d) => { if (d.daySeed !== deriveSeed('mixed-review-week', input.seed, d.day)) v.push(`day ${d.day}: day seed is not deriveSeed('mixed-review-week', S, ${d.day})`); });
    if (new Set(out.days.map((d) => J(d.items.map((it) => [it.skill, it.seed])))).size !== 5) v.push('two days are the same sheet');
    const seen = new Set(); const sets = [];
    out.days.forEach((d) => {
        const set = new Set();
        d.pages.forEach((p) => [...new Set(p.shelves.map((s) => s.skill))].forEach((id) => {     // the page's skills, from its shelves
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
        const c = {}; for (const s of p.shelves) if (!p.topUp.includes(s.skill)) c[s.skill] = (c[s.skill] || 0) + s.items.length;   // the page's own skills; a fill top-up is sized by fill, not weight
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
        if (J(cap) !== J(OWN_CAP)) v.push(`CAP ${J(cap)} differs from 12.1 ${J(OWN_CAP)}`);
        for (const [cls, ref] of Object.entries(input.tableCheck)) for (const size of ['m', 'l']) for (const N of D.COUNTS) {
            const o = D.deal({ pool: poolOf(ref), N, seed: 7, size, order: 'mixed' }, mut);
            const want = TABLE()[`${size}:${cls}:${N}`];
            if (J(o.pages.map((p) => p.n)) !== J(want.pages)) v.push(`${size} ${cls} N=${N}: pages ${o.pages.map((p) => p.n).join('+')}, table ${want.pages.join('+')}`);
            if (!!o.twoUp !== want.twoUp) v.push(`${size} ${cls} N=${N}: 2-up ${!!o.twoUp}, table ${want.twoUp}`);
        }
    }
    if (input.kindCheck) {          // r3 D4: the frozen kind -> class table covers every contract kind and equals 12.1
        const kinds = contractKinds();
        const kc = mut.kindClass ? { ...D.KIND_CLASS, ...mut.kindClass } : D.KIND_CLASS;
        if (kinds.length !== 10) v.push(`SKILL_CELL_CONTRACT 3.5 lists ${kinds.length} kinds, expected 10`);
        for (const k of kinds) if (!kc[k]) v.push(`kind ${k} has no V1 class`);
        for (const k of kinds) if (kc[k] && kc[k] !== OWN_KIND_CLASS[k]) v.push(`kind ${k}: V1 class ${kc[k]}, 12.1 says ${OWN_KIND_CLASS[k]}`);
        if (J(D.KIND_CAP) !== J(OWN_KIND_CAP)) v.push(`KIND_CAP ${J(D.KIND_CAP)} differs from 12.1 ${J(OWN_KIND_CAP)}`);
    }
    if (out) for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        const size = sh.size;
        const { fill } = pageFacts(input, p, size);  // recomputed with this file's 12.1 tables
        if (fill > 1 + 1e-9) v.push(`day ${sh.day} page ${i + 1}: ${p.n} problems fill ${fill.toFixed(2)} pages (${size})`);
        const shelves = p.arrangement === 'm1' ? Math.ceil(p.shelves.length / D.SHELF[size][clsOfRow(rowIn(input, p.shelves[0].skill))]) : p.shelves.length;
        if (shelves > D.SHELF_MAX[size]) v.push(`day ${sh.day} page ${i + 1}: ${shelves} shelves > ${D.SHELF_MAX[size]}`);
    });
    return v;
}
/** The V1 freeze: every file the deal depends on, by sha256. */
export const FROZEN_FILES = { dealer: 'design/cards/mixed-review/proto/dealer-v1.mjs', interleave: 'js/modules/sheet/interleave.js',
    rng: 'js/modules/sheet/rng.js', registry: 'design/cards/mixed-review/proto/fixtures/v1-registry.json' };
const shaOf = (key, append = '') => createHash('sha256').update(readFileSync(join(REPO, FROZEN_FILES[key]), 'utf8') + append).digest('hex');
/** Replay one golden code through the FROZEN table (or, in a FAIL fixture, a changed "live" registry). */
function replayCode(code, table, mut = {}) {
    const dec = D.decode(code);
    if (dec.error) return { error: dec.error };
    const rin = D.replayInput(dec, table);
    if (rin.error) return rin;
    return rin.week && !rin.day ? D.week(rin, mut) : D.deal(rin, mut);
}
const goldenOf = (o) => ({ pages: sheetsOf(o).map((s) => s.pages.map((p) => p.n)), items: listOf(o) });
function propI(input, _out, mut) {
    const v = [];
    const pins = readJ('frozen.json').sha256;
    for (const key of Object.keys(FROZEN_FILES)) {
        const sha = shaOf(key, (input.append || {})[key] || '');
        if (sha !== pins[key]) v.push(`${FROZEN_FILES[key]} sha256 ${sha.slice(0, 12)} != the V1 pin ${String(pins[key]).slice(0, 12)} (a change to what V1 deals ships as V2)`);
    }
    if (input.golden) {
        let table = readJ('v1-registry.json').rows;
        if (input.liveRegistry) table = table.map((r) => (input.liveRegistry[r.code] ? { ...r, ...input.liveRegistry[r.code] } : r));
        for (const g of readJ('golden-v1.json').codes) {
            const o = replayCode(g.code, table, mut);
            if (o.error) { v.push(`golden ${g.code}: ${o.error}`); continue; }
            const got = goldenOf(o);
            if (J(got.pages) !== J(g.pages)) v.push(`golden ${g.code}: pages ${J(got.pages)} != pinned ${J(g.pages)}`);
            else if (J(got.items) !== J(g.items)) v.push(`golden ${g.code}: the item list differs from the pinned one`);
        }
    }
    return v;
}
function propJ(input, out, mut) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        if (p.shelves.some((s) => clsOfRow(rowIn(input, s.skill)) && rowIn(input, s.skill).kind === 'legacy') && p.arrangement === 'm1') v.push(`day ${sh.day} page ${i + 1}: a legacy cell in the M1 arrangement`);
        if (p.arrangement !== 'grouped') return;
        const bySkill = {};
        p.shelves.forEach((s) => (bySkill[s.skill] ||= []).push(s.items.length));
        const k = (id) => D.SHELF[sh.size][clsOfRow(rowIn(input, id))];
        for (const [id, sizes] of Object.entries(bySkill)) sizes.forEach((n, j) => {
            if (n > k(id)) v.push(`day ${sh.day} page ${i + 1}: a ${id} shelf of ${n} > k ${k(id)}`);
            if (n < k(id) && j !== sizes.length - 1) v.push(`day ${sh.day} page ${i + 1}: a short ${id} shelf (${n} of ${k(id)}) is not its last`);
        });
    });
    return v;
}
/** j2 (r3 D3): every FLAT skill (compact, typical) on a page holds at least 2 items there; recomputed from the shelves. */
function propJ2(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        for (const [id, c] of Object.entries(pageFacts(input, p, sh.size).by)) if (clsOfRow(rowIn(input, id)) !== 'wide' && c < 2) v.push(`day ${sh.day} page ${i + 1}: flat skill ${id} holds ${c} item`);
    });
    return v;
}
/** k FILL (lead ruling 2026-11-20): no page but a sheet's LAST is under half full; fill recomputed from the shelves. */
export const FILL_POOLS = ['pool-large', 'pool-compact', 'pool-typical', 'pool-wide', 'pool-2mix', 'pool-3mix', 'pool-2', 'pool-6', 'pool-kinds', 'pool-legacy', 'pool-wplong'];
/** p PAIRS (lead ruling 2026-11-20, card §10 L9): a long word-problem skill holds an EVEN count (>= 2) on every page it is on,
 *  so its sheet total is even; recomputed from the shelves with this file's own pair list. */
function propP(input, out, mut = {}) {
    const v = [];
    const pairs = poolOf(input.pool).filter((r) => OWN_KIND_PAIR.includes(r.kind));      // a pool of long word problems alone
    if (pairs.length >= 2 && !D.deal({ pool: pairs, N: 5, seed: input.seed, size: input.size }, mut).error) v.push('a pool of long word problems alone is dealt at the odd N = 5 (it must be refused)');
    for (const sh of sheetsOf(out)) {
        const tot = {};
        sh.pages.forEach((p, i) => {
            for (const [id, c] of Object.entries(pageFacts(input, p, sh.size).by)) {
                const r = rowIn(input, id);
                if (!r || !OWN_KIND_PAIR.includes(r.kind)) continue;
                tot[id] = (tot[id] || 0) + c;
                if (c % 2 || c < 2) v.push(`day ${sh.day} page ${i + 1}: long word problem ${id} holds ${c} (dealt in pairs only)`);
            }
        });
        for (const [id, c] of Object.entries(tot)) if (c % 2) v.push(`day ${sh.day}: long word problem ${id} totals ${c}, not even`);
    }
    return v;
}
function propK(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => {
        if (i === sh.pages.length - 1) return;      // the last page of an exact-N sheet may be under half (the teacher chose N)
        const { fill } = pageFacts(input, p, sh.size);
        if (fill * 2 < 1 - 1e-9) v.push(`day ${sh.day} page ${i + 1} of ${sh.pages.length}: fill ${fill.toFixed(3)} < 1/2 (recomputed; reported ${p.fill})`);
    });
    return v;
}
/** l (r3 D2, RUBRIC H5 "a lone item on a page"): no page, the last included, holds fewer than 2 items. */
function propL(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) sh.pages.forEach((p, i) => { const n = pageFacts(input, p, sh.size).n; if (n < 2) v.push(`day ${sh.day} page ${i + 1} of ${sh.pages.length}: ${n} item alone`); });
    return v;
}
/** m (r3 D5): item i (0-based) seed = deriveSeed('mixed-review', S', day, i) (four parts; try r >= 1 adds r as a fifth),
 *  S' = S on a single sheet (day 0), the day seed deriveSeed('mixed-review-week', S, d) on day d of a week. */
function propM(input, out) {
    const v = [];
    for (const sh of sheetsOf(out)) {
        const sp = out.days ? deriveSeed('mixed-review-week', input.seed, sh.day) : input.seed;
        sh.items.forEach((it, i) => { if (it.seed !== deriveSeed('mixed-review', sp, out.days ? sh.day : 0, i)) v.push(`day ${sh.day} item ${it.n}: seed ${it.seed} is not the four-part formula`); });
    }
    return v.slice(0, 3);
}
/** n (pool): every dealt skill passes this file's OWN filter (ticked grade by placement, ticked area, MIXED / NOSTD never,
 *  only-8/10, untick), and a pool under 2 skills is refused, never dealt. */
function ownPool(input) {
    const f = input.filters || {}; const g = f.grades && f.grades.length ? f.grades.map(String) : null;
    return poolOf(input.pool).filter((s) => s.area !== 'MIXED' && s.area !== 'NOSTD'
        && (!g || (s.placement && s.placement.length ? s.placement : [s.grade]).map(String).some((x) => g.includes(x)) || (s.grade === 'M' && !(s.placement && s.placement.length)))
        && (!f.areas || !f.areas.length || f.areas.includes(s.area)) && (!f.onlyPassed || s.passed) && !(f.untick || []).includes(s.id));
}
function propN(input, out) {
    const own = ownPool(input); const ids = new Set(own.map((s) => s.id));
    if (own.length < 2) return out && !out.error ? [`a pool of ${own.length} skill(s) was dealt, not refused`] : [];
    if (!out || out.error) return [`a pool of ${own.length} skills was refused: ${out && out.error}`];
    const v = [];
    for (const sh of sheetsOf(out)) for (const it of sh.items) if (!ids.has(it.skill)) { v.push(`day ${sh.day}: ${it.skill} is not in the filtered pool`); break; }
    return v;
}
export const PROPS = { a: propA, b: propB, c: propC, d: propD, e: propE, f: propF, g: propG, h: propH, i: propI, j: propJ, j2: propJ2, k: propK, l: propL, m: propM, n: propN, p: propP };
const NEEDS_OUT = new Set(['n', 'b', 'c', 'd', 'e', 'f', 'g', 'j', 'j2', 'k', 'l', 'm', 'p']);

/* ------------------------------------------------------------------------------------------------- the trace */
// r3 ROOT CAUSE: the card stated deal rules no property asserted. --trace reads the card and FAILS on any normative
// sentence of §2, §3, §7a or a PT-MXR rule (a sentence with must / never / at most / at least / always / exactly /
// no skill / every / refused, and EVERY sentence of a numbered rule) that carries no tag, or a tag that names nothing:
//   [P:b,c]  check-v1 properties (keys of PROPS)       [X:MIX-REVIEW-HOSTS]  a §8 product check or gate (browser / app)
// In §2 (the deal) only [P:...] counts. Elsewhere [X:...] is allowed for what no Node property can see.
const NORM = /\b(must|never|at most|at least|always|exactly|no skill|every|refused)\b/i;
const TAG = /\[(P|X):([^\]]+)\]/g;
function unitsOf(md) {
    const lines = md.split('\n');
    const at = (re, from = 0) => lines.findIndex((l, i) => i >= from && re.test(l));
    const spans = [];
    const s2 = at(/^## 2\. /), s3 = at(/^## 3\. /), s4 = at(/^## 4\. /), s7a = at(/^### 7a\. /), s8 = at(/^## 8\. /), s9a = at(/^### 9a\. /), s9b = at(/^### 9b\. /);
    if ([s2, s3, s4, s7a, s8, s9a, s9b].some((x) => x < 0)) return { error: 'a section heading (## 2. / ## 3. / ## 4. / ### 7a. / ## 8. / ### 9a. / ### 9b.) is missing' };
    spans.push(['§2', s2 + 1, s3], ['§3', s3 + 1, s4], ['§7a', s7a + 1, s8], ['PT-MXR', s9a + 1, s9b]);
    const units = [];
    const cellsOf = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
    for (const [sec, a, b] of spans) {
        let fence = false; let cur = null; let decCol = -1;
        const flush = () => { if (cur) units.push(cur); cur = null; };
        for (let i = a; i < b; i++) {
            let l = lines[i];
            if (sec === 'PT-MXR') { if (!l.startsWith('+')) { flush(); continue; } l = l.slice(1); }
            if (/^\s*```/.test(l)) { fence = !fence; flush(); continue; }
            if (fence || /^\s*#/.test(l)) { flush(); decCol = -1; continue; }
            if (!l.trim()) { flush(); decCol = -1; continue; }
            if (/^\s*\|[-: |]+\|\s*$/.test(l)) { flush(); continue; }
            const row = /^\s*\|/.test(l);
            if (row && /^\s*\|[-: |]+\|\s*$/.test(lines[i + 1] || '')) {       // a table header: find its Decision column
                flush(); decCol = cellsOf(l).findIndex((c) => /^Decision$/i.test(c)); continue;
            }
            const bullet = /^\s*(?:[-*]|\d+\.)\s/.test(l);
            const item = bullet || row;
            const numbered = (sec === '§2' && /^\s*\d+\.\s/.test(l)) || (sec === 'PT-MXR' && /^- \*\*PT-MXR-\d/.test(l));
            const mxr = sec === 'PT-MXR' && /^- \*\*PT-MXR-\d/.test(l);
            if (sec === 'PT-MXR' && !mxr && !(cur && cur.mxr && /^\s{2}\S/.test(l))) { flush(); continue; }   // only the PT-MXR bullets
            // card §10 L3 (critic r4 D4): the trace INVERTS its default. Every sentence of a §2 / §3 / §7a bullet and of a §7a
            // Decision cell is normative unless it is marked [I]; other units (paragraphs, other table rows) by keyword.
            const force = sec !== 'PT-MXR' && bullet;
            if (row && sec === '§7a' && decCol >= 0) { flush(); units.push({ sec, line: i + 1, text: cellsOf(l)[decCol] || '', numbered: false, mxr: false, force: true }); continue; }
            if (item || !cur) { flush(); cur = { sec, line: i + 1, text: l.trim(), numbered, mxr, force }; }
            else cur.text += ' ' + l.trim();
        }
        flush();
    }
    return { units, s8text: lines.slice(s8, s9a).join('\n') };
}
function sentencesOf(text) {
    const protect = text.replace(/^(?:[-*]|\d+\.)\s+/, '').replace(/(PT-MXR-\d+)\./g, '$1\u2024').replace(/\b(e\.g|i\.e|vs|cf|etc)\./g, '$1․');
    // split before a capital, a code span, bold, a tag or a bracket; and (card §10 L3) before ANY word after a tag's "]. "
    const parts = protect.split(/(?<=[.!?])\s+(?=[A-Z`*[(])|(?<=\]\.)\s+(?=[a-z0-9])/);
    const out = [];
    for (const p0 of parts) {
        const m = /^((?:\[[PX]:[^\]]+\]\s*)+)(.*)$/.exec(p0);
        if (m && out.length) { out[out.length - 1] += ' ' + m[1].trim(); if (m[2].trim()) out.push(m[2]); } else out.push(p0);
    }
    return out.map((s) => s.replace(/․/g, '.'));
}
export function trace(md) {
    const u = unitsOf(md);
    if (u.error) return { bad: [u.error], n: 0, p: 0, x: 0, cited: new Set() };
    const xIds = new Set([...u.s8text.matchAll(/\b(MIX-REVIEW-[A-Z]+|ws-[a-z0-9-]+)\b/g)].map((m) => m[1]));
    const bad = []; const cited = new Set(); let n = 0, p = 0, x = 0;
    for (const unit of u.units) for (const s of sentencesOf(unit.text)) {
        const tags = [...s.matchAll(TAG)].map((m) => ({ k: m[1], ids: m[2].split(',').map((t) => t.trim()) }));
        for (const t of tags) for (const id of t.ids) {
            if (t.k === 'P' && !PROPS[id]) bad.push(`${unit.sec} line ${unit.line}: [P:${id}] names no check-v1 property: "${s.slice(0, 90)}"`);
            if (t.k === 'X' && !xIds.has(id)) bad.push(`${unit.sec} line ${unit.line}: [X:${id}] names no §8 check or gate: "${s.slice(0, 90)}"`);
            if (t.k === 'P') cited.add(id);
        }
        if (/\[I\]/.test(s)) continue;                 // marked informational
        const norm = unit.numbered || unit.force || NORM.test(s.replace(TAG, ''));
        if (!norm) continue;
        n++;
        const hasP = tags.some((t) => t.k === 'P'); const hasX = tags.some((t) => t.k === 'X');
        if (hasP) p++; else if (hasX) x++;
        if (!hasP && !(hasX && unit.sec !== '§2')) bad.push(`${unit.sec} line ${unit.line}: normative sentence with no ${unit.sec === '§2' ? '[P:...]' : '[P:...] or [X:...]'} tag: "${s.slice(0, 110)}"`);
    }
    for (const id of Object.keys(PROPS)) if (!cited.has(id)) bad.push(`property ${id} is cited by no card sentence`);
    return { bad, n, p, x, cited };
}
function runTrace(log) {
    const md = readFileSync(CARD, 'utf8');
    const res = trace(md);
    const fails = [];
    for (const f of readdirSync(FIX).filter((f) => /^trace-fail-.*\.json$/.test(f)).sort()) {
        const fx = readJ(f);
        const lines = md.split('\n'); const at = lines.findIndex((l) => l.startsWith(fx.insert.after));
        lines.splice(at + 1, 0, fx.insert.text);
        const r = trace(lines.join('\n'));
        const hit = r.bad.find((b) => b.includes(fx.catchText));
        if (hit) log(`  CAUGHT ${f.replace(/\.json$/, '')} (trace: ${hit.slice(0, 110)})`); else fails.push(`${f}: planted sentence NOT caught (want "${fx.catchText}")`);
    }
    return { ...res, fails };
}

/* ------------------------------------------------------------------------------------------------- the runner */
const run = (input, mut = {}) => (input.week && !input.day ? D.week(input, mut) : D.deal(input, mut));
function expand(fx) {
    const base = { ...fx.input };
    const sw = fx.sweep;
    if (!sw) return [base];
    const out = [];
    for (const pool of fx.pools || [base.pool]) for (const N of sw.N || [base.N]) for (const size of sw.size || [base.size]) for (const order of sw.order || [base.order]) for (const seed of sw.seed || [base.seed]) out.push({ ...base, pool, N, size, order, seed });
    return out;
}
/** One fixture's violations. `hooks.tamper(out, input)` (ws-mix-review) edits the plan after the deal, for FAIL states
 *  no `_mutate` seam of the frozen dealer can produce (a 2-up half misnumbered, a lying comeback ...). */
export function runFixture(fx, hooks = {}) {
    const mut = { ...(fx.mutate || {}) };
    if (mut.cap) mut.cap = Object.fromEntries(['m', 'l'].map((k) => [k, { ...D.CAP[k], ...(mut.cap[k] || {}) }]));
    const viol = [];
    for (const input of expand(fx)) {
        const inp = { ...input, pool: poolOf(input.pool) };
        const out = fx.props.some((p) => NEEDS_OUT.has(p) || p === 'h') && !input.tableOnly ? run(inp, mut) : null;
        if (out && !out.error && hooks.tamper) hooks.tamper(out, inp);
        if (out && out.error && !input.expectRefusal) { viol.push(`refused: ${out.error}`); continue; }
        if (input.expectRefusal) { for (const r of propN(input, out)) viol.push(`(n) N=${input.N}: ${r}`); continue; }
        for (const p of fx.props) {
            const res = p === 'a' ? propA({ ...inp, pool: input.pool }, mut, (i, m) => run({ ...i, pool: poolOf(i.pool) }, m))
                : PROPS[p]({ ...input }, out, mut);
            for (const r of res) viol.push(`(${p}) N=${input.N} ${input.size} ${input.order} S=${input.seed}: ${r}`);
        }
    }
    return viol;
}

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (IS_MAIN) await main();
async function main() {
const args = process.argv.slice(2);
if (args[0] === '--table') {
    const t = D.capacityTable();
    const cell = (s, c, N) => { const x = t[`${s}:${c}:${N}`]; return x.twoUp ? '1 (2-up: 5 and 5)' : `${x.pages.length} (${x.pages.join(' + ')})`; };
    console.log('| N | M compact / typical (12) | M wide (4) | L compact (10) | L typical (8) | L wide (3) |\n|--:|---|---|---|---|---|');
    for (const N of D.COUNTS) console.log(`| ${N} | ${cell('m', 'typical', N)} | ${cell('m', 'wide', N)} | ${cell('l', 'compact', N)} | ${cell('l', 'typical', N)} | ${cell('l', 'wide', N)} |`);
    return void process.exit(0);
}
if (args[0] === '--fill') {      // props k, l, j2 over every pool x N x size x order x 300 seeds (+ 40 weeks a cell)
    const mut = args.includes('--separate-pages') ? { separatePages: true } : args.includes('--no-lone-guard') ? { noLoneGuard: true, flatOne: true } : args.includes('--no-pairs') ? { noPairs: true } : {};
    let badAll = 0;
    for (const ref of FILL_POOLS) {
        let pages = 0, under = 0, notLast = 0, lone = 0, flat1 = 0, lastUnder = 0, odd = 0, refused = 0;
        const input0 = { pool: ref };
        const look = (o) => o.pages.forEach((p, i) => {
            pages++;
            const f = pageFacts(input0, p, o.size);
            if (f.fill * 2 < 1 - 1e-9) { under++; if (i !== o.pages.length - 1) notLast++; else lastUnder++; }
            if (f.n < 2) lone++;
            for (const [id, c] of Object.entries(f.by)) if (clsOfRow(rowIn(input0, id)) !== 'wide' && c < 2) flat1++;
            for (const [id, c] of Object.entries(f.by)) if (OWN_KIND_PAIR.includes(rowIn(input0, id).kind) && c % 2) odd++;
        });
        for (const N of D.COUNTS) for (const size of ['m', 'l']) for (const order of ['mixed', 'easyhard', 'area']) for (let seed = 1; seed <= 300; seed++) {
            const o = D.deal({ pool: poolOf(ref), N, seed, size, order }, mut);
            if (o.error) { refused++; continue; }
            if (!o.twoUp) look(o);
            if (seed <= 40 && order === 'mixed') D.week({ pool: poolOf(ref), N, seed, size, order, week: 1 }, mut).days.forEach((d) => { if (!d.twoUp) look(d); });
        }
        badAll += notLast + lone + flat1 + odd + refused;
        console.log(`  ${ref}: of ${pages} pages, ${notLast} non-last under half full, ${lone} with one item, ${flat1} flat skills with one item, ${odd} odd long word-problem counts, ${refused} refused (${lastUnder} last pages under half, allowed)`);
    }
    console.log(badAll ? `check-v1 --fill: FAIL (${badAll} pages break k, l, j2 or p)` : 'check-v1 --fill: OK (0 non-last pages under half full, 0 one-item pages, 0 one-item flat skills, 0 odd long word-problem counts)');
    return void process.exit(badAll ? 1 : 0);
}
if (args[0] === '--pin') {       // re-take the pins and regenerate the golden codes (only while V1 is unreleased: card stage)
    const sha256 = Object.fromEntries(Object.keys(FROZEN_FILES).map((k) => [k, shaOf(k)]));
    writeFileSync(join(FIX, 'frozen.json'), JSON.stringify({ files: FROZEN_FILES, sha256, note: 'V1 freeze (card r3 D1): the dealer, the two kit files it imports and the frozen V1 table, by sha256. A change to any of them that changes a deal ships as V2 (a new dealer file with frozen copies of what it imports); this pin moves with the files at build step 2 (re-taken on the import-path diff only).' }, null, 1) + '\n');
    const g = readJ('golden-v1.json'); const table = readJ('v1-registry.json').rows;
    g.codes = g.specs.map((sp) => {
        const input = { ...sp, pool: table };
        const o = input.week ? D.week({ ...input, day: undefined }) : D.deal(input);
        const code = D.encode(sp, o);
        const want = goldenOf(sp.day ? o.days[sp.day - 1] : o);
        if (J(goldenOf(replayCode(code, table))) !== J(want)) { console.log(`check-v1 --pin: FAIL (${code} does not replay to its own deal)`); return void process.exit(1); }
        return { code, ...want };
    });
    writeFileSync(join(FIX, 'golden-v1.json'), JSON.stringify(g, null, 1) + '\n');
    console.log(`check-v1 --pin: ${J(Object.fromEntries(Object.entries(sha256).map(([k, v]) => [k, v.slice(0, 12)])))}; ${g.codes.length} golden codes`);
    return void process.exit(0);
}
if (args[0] === '--trace') {
    const t = runTrace(console.log);
    const bad = [...t.bad, ...t.fails];
    console.log(bad.length ? `check-v1 --trace: FAIL (${bad.length})\n  ${bad.join('\n  ')}` : `check-v1 --trace: OK (${t.n} normative sentences: ${t.p} by a property, ${t.x} by a product check; ${t.cited.size} of ${Object.keys(PROPS).length} properties cited)`);
    return void process.exit(bad.length ? 1 : 0);
}
const files = readdirSync(FIX).filter((f) => /^case-.*\.json$/.test(f)).sort();
if (args[0] === '--show') {
    const fx = readJ(`case-${args[1]}.json`); const inp = { ...expand(fx)[0] }; inp.pool = poolOf(inp.pool);
    console.log(JSON.stringify(run(inp, fx.mutate || {}), (k, v) => (k === 'chosen' ? undefined : v), 1));
    return void process.exit(0);
}
const bad = []; const props = new Set(); const tally = {};
for (const f of files) {
    const fx = readJ(f);
    const viol = runFixture(fx);
    for (const p of fx.props) { props.add(p); tally[p] ||= { pass: 0, fail: 0 }; tally[p][fx.expect]++; }
    const hit = viol.find((x) => x.startsWith(`(${fx.catch})`) && (!fx.catchText || x.includes(fx.catchText)));
    if (fx.expect === 'pass' && viol.length) bad.push(`${f}: PASS fixture has ${viol.length} violation(s):\n      ${viol.slice(0, 6).join('\n      ')}`);
    else if (fx.expect === 'fail' && !hit) bad.push(`${f}: FAIL fixture NOT caught by (${fx.catch})${fx.catchText ? ` "${fx.catchText}"` : ''} [${viol.slice(0, 2).join('; ')}]`);
    else console.log(`  ${fx.expect === 'pass' ? 'PASS  ' : 'CAUGHT'} ${f.replace(/^case-|\.json$/g, '')}${fx.expect === 'fail' ? ` (${fx.catch}: ${hit.replace(/^\(\w+\) /, '').slice(0, 110)})` : ''}`);
}
for (const p of Object.keys(PROPS)) if (!tally[p] || !tally[p].pass || !tally[p].fail) bad.push(`property ${p} lacks a PASS or a FAIL fixture (${J(tally[p] || {})})`);
const t = runTrace(console.log);
bad.push(...t.bad.map((b) => `trace: ${b}`), ...t.fails.map((b) => `trace: ${b}`));
if (bad.length) { console.log(`check-v1: FAIL (${bad.length})\n  ${bad.join('\n  ')}`); return void process.exit(1); }
console.log(`check-v1: OK (${props.size} props, ${files.length} fixtures; trace ${t.n} normative sentences, ${t.p} by a property, ${t.x} by a product check)`);
}
