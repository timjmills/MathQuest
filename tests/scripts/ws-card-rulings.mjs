// ws-card-rulings — does the generator obey the spec card's NUMERIC rulings, and does the option panel offer nothing
// the card says is not offered? (pilot-su-c critic r1: D1 "zero cases flood the 2-digit pages" broke card §9.4, and
// D6 "the option panel offers the band option" broke card §7; no machine check read the card.)
//
//   node tests/scripts/ws-card-rulings.mjs --skill subtraction:sub_100_no_regroup            # the cards that rule on it
//   node tests/scripts/ws-card-rulings.mjs --card design/cards/subtraction/subtraction.md   # every skill the card rules on
//   node tests/scripts/ws-card-rulings.mjs --rulings tests/fixtures/precritic/pilot-su-c/rulings.json --root <tree>
//   node tests/scripts/ws-card-rulings.mjs --skill a:b --check rulings     # only the numeric rulings (300 items a skill)
//   node tests/scripts/ws-card-rulings.mjs --skill a:b --check offered     # only the not-offered list (no generation)
//   node tests/scripts/ws-card-rulings.mjs --self-test                     # the predicates and the block parser, no app
//
// OPTIONS
//   --root <dir>      the app tree to load (default MQ_ROOT, else this repository)
//   --n N             items per (ruling scope, option set) (default 300), seeds 1..N mixed with the skill key (fnv),
//                     generateQuestionFor({category, skill, opts, seed, itemIndex}) — so a run is reproducible
//   --json <file>     the results as JSON        --report-only   print everything, exit 0
//
// THE RULINGS BLOCK (machine-readable; one per card, in the card's markdown, beside its spec-card comment)
//   <!-- rulings
//   { "v": 1,
//     "skills": ["subtraction:sub_50_no_regroup", ...],          the skills the card rules on (category:skill)
//     "rulings": [ { "id": "R-BAND-50", "source": "§9.2", "skills": ["subtraction:sub_50_no_regroup"],
//                    "opts": {"zeros": "off"},                    option values to sample with (default: the defaults)
//                    "assert": "<kind>", ...args } ],
//     "notOffered": [ { "id": "N-BAND", "source": "§7", "skills": [...], "option": "band" },
//                     { "id": "N-ACROSS", "option": "notation", "values": ["across"] } ] }
//   -->
//   A ruling or notOffered entry without "skills" applies to every skill of the block. The same JSON may also sit in a
//   fenced ```rulings block, or in a .json file given with --rulings (a fixture; the card is not edited).
//   ASSERT KINDS (every item of the sample must pass, except maxShare / minShare which bound a share of the sample)
//     range      {of: "a"|"b"|"ans", min, max}           the number is inside [min, max]
//     digits     {of, eq | min | max}                      its digit count (eq may be "a" / "b": the same as that number's)
//     noRegroup  {op: "-"|"+"}                             "-": every digit of b is at most the digit above it (aligned
//                                                          right); "+": no column sum reaches 10
//     boxes      {eq}                                      the answer strip's box count (q.cell.payload.ansDigits)
//     maxShare   {when, max}  minShare {when, min}         the share of items where the predicate holds
//   PREDICATES (when)
//     "zeroCase"    a column leaves 0 or the answer is shorter than the minuend (an answer digit, read at the minuend's
//                   width, is 0) — card "zero cases" (n − n, 40 − 20, 47 − 42)
//     "columnZero"  an answer digit inside the answer's own length is 0      "ansShorter"  fewer answer digits than a
//     {"eq": ["b", 1]}   a field equals a number (or another field: ["a", "b"])
//   The operands come from q.cell.payload.operands, else q.a / q.b, else the first "a − b" / "a + b" of q.text; ans
//   is q.ans. An item none of these read is a FAIL (the ruling cannot be checked), never a skip.
//   NOT OFFERED: offeredOptionsFor(category, skill) (js/modules/skill-options.js: what the panel shows) must not carry
//   the option id (no "values"), or must not carry any of the listed values.
//
// Last line `ws-card-rulings: OK (...)` or `ws-card-rulings: FAIL - ...`; exit 1 on FAIL (0 with --report-only), 2 on a
// usage / setup error. A skill in --skill scope that no card rules on prints `ws-card-rulings: NO-RULINGS (...)`, exit 4:
// nothing was checked, which ws-precritic reports as SKIPPED, never PASS.
import { pathToFileURL } from 'node:url';
import { join, resolve, dirname, relative } from 'node:path';
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-card-rulings';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const argAll = (f) => argv.flatMap((a, i) => (a === f && i + 1 < argv.length ? String(argv[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || HERE));
const N = +arg('--n', '300');
const CHECK = arg('--check', 'all');
const say = (...a) => process.stdout.write(a.join(' ') + '\n');
const usage = (m) => { say(`${TOOL}: ${m}`); say(`${TOOL}: FAIL - usage`); process.exit(2); };

/* ------------------------------------------------------------------ the block */
export function parseRulings(text, file = '') {
    const m = /<!--\s*rulings\s*\n([\s\S]*?)-->/.exec(text) || /```rulings\s*\n([\s\S]*?)```/.exec(text);
    const raw = m ? m[1] : (/\.json$/.test(file) ? text : null);
    if (raw == null) return null;
    let j;
    try { j = JSON.parse(raw); } catch (e) { throw new Error(`${file}: the rulings block is not JSON (${e.message})`); }
    if (!Array.isArray(j.skills) || !j.skills.length) throw new Error(`${file}: the rulings block has no "skills"`);
    for (const k of j.skills) if (!/^[a-z0-9_]+:[a-z0-9_]+$/i.test(k)) throw new Error(`${file}: "${k}" is not category:skill`);
    const KINDS = new Set(['range', 'digits', 'noRegroup', 'boxes', 'maxShare', 'minShare']);
    (j.rulings || []).forEach((r, i) => {
        if (!r.id) r.id = `R${i + 1}`;
        if (!KINDS.has(r.assert)) throw new Error(`${file}: ruling ${r.id}: unknown assert "${r.assert}" (${[...KINDS].join(', ')})`);
        for (const k of r.skills || []) if (!j.skills.includes(k)) throw new Error(`${file}: ruling ${r.id} names ${k}, which is not in the block's "skills"`);
    });
    (j.notOffered || []).forEach((n, i) => { if (!n.id) n.id = `N${i + 1}`; if (!n.option) throw new Error(`${file}: notOffered ${n.id} has no "option"`); });
    j.file = file;
    return j;
}

/** Every rulings block under design/cards of the tree. */
function cardBlocks(root) {
    const dir = join(root, 'design', 'cards');
    const out = [];
    if (!existsSync(dir)) return out;
    const walk = (d) => {
        for (const n of readdirSync(d)) {
            const p = join(d, n);
            if (statSync(p).isDirectory()) walk(p);
            else if (/\.md$/.test(n)) { const b = parseRulings(readFileSync(p, 'utf8'), relative(root, p)); if (b) out.push(b); }
        }
    };
    walk(dir);
    return out;
}

/* ------------------------------------------------------------------ predicates */
const digitsOf = (n) => String(Math.abs(Math.trunc(n))).length;
export const PRED = {
    zeroCase: (x) => { const w = digitsOf(x.a); const s = String(x.ans).padStart(w, '0'); return s.includes('0'); },
    columnZero: (x) => String(x.ans).includes('0'),
    ansShorter: (x) => digitsOf(x.ans) < digitsOf(x.a),
};
export function predicate(when) {
    if (typeof when === 'string') { if (!PRED[when]) throw new Error(`unknown predicate "${when}"`); return PRED[when]; }
    if (when && Array.isArray(when.eq)) { const [f, v] = when.eq; return (x) => x[f] === (typeof v === 'string' ? x[v] : v); }
    throw new Error(`unknown predicate ${JSON.stringify(when)}`);
}
export function itemPasses(r, x) {
    switch (r.assert) {
        case 'range': return x[r.of] >= r.min && x[r.of] <= r.max;
        case 'digits': {
            const d = digitsOf(x[r.of]);
            const eq = typeof r.eq === 'string' ? digitsOf(x[r.eq]) : r.eq;
            return (eq == null || d === eq) && (r.min == null || d >= r.min) && (r.max == null || d <= r.max);
        }
        case 'noRegroup': {
            const A = String(x.a).split('').reverse().map(Number), B = String(x.b).split('').reverse().map(Number);
            if ((r.op || '-') === '-') return x.a >= x.b && B.every((d, k) => d <= (A[k] || 0));
            return A.every((d, k) => d + (B[k] || 0) <= 9) && B.every((d, k) => d + (A[k] || 0) <= 9);
        }
        case 'boxes': return x.boxes === r.eq;
        default: return true;
    }
}
const fmtItem = (x) => `${x.a} ${x.op || '−'} ${x.b} = ${x.ans}${x.boxes != null ? ` [${x.boxes} boxes]` : ''}`;

/** {a, b, ans, boxes, op} from a generated question, or null. */
export function readItem(q) {
    if (!q) return null;
    const p = q.cell && q.cell.payload;
    let a, b, op;
    if (p && Array.isArray(p.operands) && p.operands.length >= 2) { [a, b] = p.operands.map(Number); op = p.op; }
    else if (Number.isFinite(q.a) && Number.isFinite(q.b)) { a = q.a; b = q.b; }
    else {
        const m = /([\d,]+)\s*([−\-+])\s*([\d,]+)/.exec(String(q.text || ''));
        if (m) { a = +m[1].replace(/,/g, ''); b = +m[3].replace(/,/g, ''); op = m[2]; }
    }
    const ans = Number(String(q.ans).replace(/,/g, ''));
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(ans)) return null;
    return { a, b, ans, op, boxes: p && p.ansDigits != null ? +p.ansDigits : null };
}

/* ------------------------------------------------------------------ self-test */
function selfTest() {
    const fails = [];
    const t = (c, m) => { if (!c) fails.push(m); };
    t(PRED.zeroCase({ a: 33, b: 32, ans: 1 }), 'zeroCase 33-32');
    t(PRED.zeroCase({ a: 40, b: 20, ans: 20 }), 'zeroCase 40-20');
    t(!PRED.zeroCase({ a: 47, b: 21, ans: 26 }), 'not zeroCase 47-21');
    t(PRED.zeroCase({ a: 4567, b: 4321, ans: 246 }), 'zeroCase shorter answer');
    t(itemPasses({ assert: 'noRegroup' }, { a: 47, b: 21 }), 'noRegroup 47-21');
    t(!itemPasses({ assert: 'noRegroup' }, { a: 42, b: 27 }), 'regroup 42-27');
    t(!itemPasses({ assert: 'noRegroup', op: '+' }, { a: 47, b: 25 }), 'add regroup 47+25');
    t(itemPasses({ assert: 'digits', of: 'b', eq: 'a' }, { a: 47, b: 21 }), 'digits eq a');
    t(!itemPasses({ assert: 'digits', of: 'b', eq: 'a' }, { a: 47, b: 2 }), 'digits b shorter');
    t(itemPasses({ assert: 'range', of: 'a', min: 21, max: 50 }, { a: 50 }), 'range edge');
    t(predicate({ eq: ['b', 1] })({ b: 1 }), 'eq b 1');
    t(predicate({ eq: ['a', 'b'] })({ a: 3, b: 3 }), 'eq a b');
    const it = readItem({ text: '4,367 − 2,244 = ?', ans: 2123 });
    t(it && it.a === 4367 && it.b === 2244, 'readItem from comma text');
    t(readItem({ cell: { payload: { operands: [57, 23], op: '-', ansDigits: 2 } }, ans: 34 }).boxes === 2, 'readItem boxes');
    const blk = parseRulings('x\n<!-- rulings\n{"v":1,"skills":["a:b"],"rulings":[{"assert":"range","of":"a","min":1,"max":9}],"notOffered":[{"option":"band"}]}\n-->\n', 'card.md');
    t(blk && blk.rulings[0].id === 'R1' && blk.notOffered[0].id === 'N1', 'parse block');
    t(parseRulings('no block', 'x.md') === null, 'no block -> null');
    let threw = false; try { parseRulings('<!-- rulings\n{"skills":["a:b"],"rulings":[{"assert":"bogus"}]}\n-->', 'y.md'); } catch (e) { threw = true; }
    t(threw, 'unknown assert throws');
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 17 cases)`);
    process.exit(fails.length ? 1 : 0);
}

/* ------------------------------------------------------------------ the app in node */
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
        const data = await import(M('data.js'));
        const so = await import(M('skill-options.js'));
        for (const side of ['skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) { try { await import(M(side)); } catch (e) { /* not in this tree */ } }
        return { gq, data, so };
    } finally { for (const k of Object.keys(quiet)) console[k] = quiet[k]; }
}
const fnv = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

async function main() {
    if (has('--self-test')) return selfTest();
    const known = new Set(['--skill', '--card', '--rulings', '--root', '--n', '--check', '--json', '--report-only', '--self-test']);
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('--')) continue;
        if (!known.has(argv[i])) usage(`unknown flag ${argv[i]}`);
        if (!['--report-only', '--self-test'].includes(argv[i])) i++;
    }
    if (!['all', 'rulings', 'offered'].includes(CHECK)) usage(`--check ${CHECK}: give rulings, offered or all`);
    if (!(N > 0)) usage('--n must be > 0');
    const T0 = Date.now();
    const scope = argAll('--skill');
    // ---- the blocks
    let blocks = [];
    for (const f of argAll('--rulings').concat(argAll('--card'))) {
        const p = resolve(HERE, f);
        if (!existsSync(p)) usage(`${f}: no such file`);
        const b = parseRulings(readFileSync(p, 'utf8'), relative(HERE, p));
        if (!b) usage(`${f}: no rulings block (<!-- rulings {json} --> or a fenced \`\`\`rulings block); see the header of tests/scripts/${TOOL}.mjs`);
        blocks.push(b);
    }
    if (!blocks.length) {
        if (!scope.length) usage('give --skill, --card or --rulings');
        blocks = cardBlocks(ROOT).filter((b) => b.skills.some((k) => scope.includes(k)));
    }
    const ruled = new Set(blocks.flatMap((b) => b.skills));
    const keys = scope.length ? scope : [...ruled];
    const unruled = keys.filter((k) => !ruled.has(k));
    if (!blocks.length) {
        say(`${TOOL}: no card under ${relative(HERE, join(ROOT, 'design', 'cards')) || 'design/cards'} has a rulings block for ${unruled.join(', ')}`);
        say(`${TOOL}: NO-RULINGS (${unruled.length} skill(s) in scope, nothing checked)`);
        process.exit(4);
    }
    const app = await loadApp(ROOT);
    const live = new Map();
    for (const [cat, list] of Object.entries(app.data.SKILLS)) for (const s of list || []) if (s && s.v && !s.retired) live.set(`${cat}:${s.v}`, s);
    const results = [];
    const fail = (o) => results.push(Object.assign({ ok: false }, o));
    const pass = (o) => results.push(Object.assign({ ok: true }, o));
    for (const b of blocks) {
        const inScope = (list) => (list && list.length ? list : b.skills).filter((k) => keys.includes(k));
        // ---- numeric rulings
        if (CHECK !== 'offered') for (const r of b.rulings || []) {
            for (const key of inScope(r.skills)) {
                const [category, skill] = key.split(':');
                if (!live.has(key)) { fail({ block: b.file, id: r.id, key, kind: 'ruling', msg: `${key} is not a live skill in ${ROOT === HERE ? 'this tree' : ROOT}` }); continue; }
                const items = [];
                let unread = 0, errors = 0, firstErr = '';
                for (let i = 0; i < N; i++) {
                    let q = null;
                    try { q = app.gq.generateQuestionFor({ category, skill, opts: r.opts || undefined, seed: (fnv(`${key}:${JSON.stringify(r.opts || {})}`) + i) >>> 0, itemIndex: i, itemCount: N }); } catch (e) { errors++; firstErr = firstErr || e.message; continue; }
                    const x = readItem(q);
                    if (!x) { unread++; continue; }
                    items.push(x);
                }
                const head = { block: b.file, id: r.id, key, kind: 'ruling', source: r.source || '', assert: r.assert, opts: r.opts || {} };
                if (errors || unread) { fail(Object.assign(head, { msg: `${errors} of ${N} item(s) threw${firstErr ? ` (${firstErr.slice(0, 80)})` : ''}, ${unread} unreadable (no operands): the ruling cannot be checked` })); continue; }
                if (r.assert === 'maxShare' || r.assert === 'minShare') {
                    const p = predicate(r.when);
                    const hits = items.filter(p);
                    const share = hits.length / items.length;
                    const ok = r.assert === 'maxShare' ? share <= r.max : share >= r.min;
                    const msg = `${typeof r.when === 'string' ? r.when : JSON.stringify(r.when)} on ${hits.length} of ${items.length} items (${(share * 100).toFixed(1)}%; ${r.assert === 'maxShare' ? 'at most' : 'at least'} ${((r.assert === 'maxShare' ? r.max : r.min) * 100).toFixed(0)}%)${hits.length ? `; e.g. ${hits.slice(0, 4).map(fmtItem).join(', ')}` : ''}`;
                    (ok ? pass : fail)(Object.assign(head, { msg, n: items.length, hits: hits.length }));
                } else {
                    const bad = items.filter((x) => !itemPasses(r, x));
                    const what = r.assert === 'range' ? `${r.of} in ${r.min}..${r.max}` : r.assert === 'digits' ? `${r.of} has ${r.eq != null ? `${r.eq} digit(s)` : `${r.min || 1}..${r.max || '∞'} digits`}` : r.assert === 'boxes' ? `${r.eq} answer box(es)` : `no regrouping (${r.op || '-'})`;
                    const msg = bad.length ? `${what}: ${bad.length} of ${items.length} items break it, e.g. ${bad.slice(0, 4).map(fmtItem).join(', ')}` : `${what}: all ${items.length} items`;
                    (bad.length ? fail : pass)(Object.assign(head, { msg, n: items.length, hits: bad.length }));
                }
            }
        }
        // ---- not offered
        if (CHECK !== 'rulings') for (const n of b.notOffered || []) {
            for (const key of inScope(n.skills)) {
                const [category, skill] = key.split(':');
                const head = { block: b.file, id: n.id, key, kind: 'offered', source: n.source || '', option: n.option };
                let offered;
                try { offered = app.so.offeredOptionsFor(category, skill) || []; } catch (e) { fail(Object.assign(head, { msg: `offeredOptionsFor threw: ${e.message}` })); continue; }
                const o = offered.find((d) => d && d.id === n.option);
                if (!o) { pass(Object.assign(head, { msg: `${n.option} not offered` })); continue; }
                if (!n.values) { fail(Object.assign(head, { msg: `offers "${n.option}" (${o.label || ''}${Array.isArray(o.values) ? `: ${o.values.map((v) => (v && typeof v === 'object' ? v.v : v)).join(' / ')}` : ''}), which the card lists as not offered` })); continue; }
                const vals = (o.values || []).map((v) => (v && typeof v === 'object' ? v.v : v));
                const banned = n.values.filter((v) => vals.some((x) => String(x) === String(v)));
                (banned.length ? fail : pass)(Object.assign(head, { msg: banned.length ? `offers ${n.option} = ${banned.join(', ')}, which the card lists as not offered` : `${n.option} offered without ${n.values.join(', ')}` }));
            }
        }
    }
    // ---- report
    const pad = (s, w) => String(s).padEnd(w);
    say(`${TOOL}: ${blocks.map((b) => b.file).join(', ')} on ${ROOT === HERE ? 'this tree' : ROOT}; ${keys.length} skill(s), ${N} items per ruling`);
    for (const r of results) say(`  ${r.ok ? 'ok  ' : 'FAIL'} ${pad(r.key, 36)} ${pad(r.id, 18)} ${r.source ? `(${r.source}) ` : ''}${r.msg}`);
    const bad = results.filter((r) => !r.ok);
    const nR = results.filter((r) => r.kind === 'ruling').length, nO = results.filter((r) => r.kind === 'offered').length;
    if (unruled.length) say(`  no rulings for: ${unruled.join(', ')} (not checked)`);
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('--json')) writeFileSync(resolve(arg('--json')), JSON.stringify({ tool: TOOL, root: ROOT, blocks: blocks.map((b) => b.file), skills: keys, unruled, n: N, results, seconds: +secs }, null, 1) + '\n');
    if (!results.length) { say(`${TOOL}: NO-RULINGS (the blocks hold no ${CHECK === 'offered' ? 'notOffered entries' : CHECK === 'rulings' ? 'rulings' : 'rulings or notOffered entries'} for the skills in scope; nothing checked)`); process.exit(4); }
    const tail = `${nR} ruling check(s), ${nO} not-offered check(s), ${keys.length - unruled.length} skill(s)${unruled.length ? `, ${unruled.length} without rulings` : ''}; ${secs} s`;
    say(bad.length ? `${TOOL}: FAIL - ${bad.length} broken: ${[...new Set(bad.map((r) => `${r.id} ${r.key.split(':')[1]}`))].slice(0, 6).join('; ')} (${tail})` : `${TOOL}: OK (${tail})`);
    process.exit(bad.length && !has('--report-only') ? 1 : 0);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(2); });
