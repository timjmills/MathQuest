// PRESET skills gate (owner rule 2026-10-17, design/PRESET_SKILLS.md).
//   node tests/scripts/ws-presets-unit.mjs            [--no-baseline] [--write-baseline]   (D8 pin: see the end of the file)
//
// For every entry of js/modules/skill-presets.js:
//   1. it is a live SKILLS entry (appended, `presetOf` naming the host), its host is live and not
//      itself a preset, and every preset value is a LEGAL value of the host's option;
//   2. its options are the host's with the preset values as defaults; explicit opts win;
//   3. seeded items equal the host's items with the preset opts (same text, answer, visual);
//   4. it has a grade, a print size (the host's), SKILL_STANDARDS (a CCSS code first), >= 5 search
//      terms, a pinned share code, and the provider the sheet kit reads is the host's;
//   5. its share code round-trips: the 2-char code decodes to the preset id, and a changed option
//      (including null, the host's own default) survives encode -> decode.
// Node part (no browser) for the tables; the generation checks run in the app (puppeteer).
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// MQ_ROOT: the app tree to check (ws-backtest / state-run); the harness serves the same tree
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
let obeyNote = '';
const M = (p) => pathToFileURL(join(ROOT, 'js', 'modules', p)).href;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const realLog = console.log;
console.log = () => {};
const data = await import(M('data.js'));
const presets = await import(M('skill-presets.js'));
const opt = await import(M('skill-options.js'));
await import(M('skill-options-derived.js'));
const codec = await import(M('skill-option-codec.js'));
const frozen = await import(M('skill-codes-frozen.js'));
const standards = await import(M('standards.js'));
const terms = await import(M('search-terms.js'));
const contract = await import(M('sheet/contract.js'));
console.log = realLog;

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const J = JSON.stringify;
const entries = Object.entries(presets.SKILL_PRESETS);
check(entries.length >= 10, `only ${entries.length} presets`);

for (const [key, p] of entries) {
    const [cat, id] = key.split(':');
    const list = data.SKILLS[cat] || [];
    const me = list.find(s => s.v === id);
    check(!!me, `${key}: not in SKILLS`);
    if (!me) continue;
    check(me.presetOf === p.skill, `${key}: SKILLS entry presetOf=${me.presetOf}, table says ${p.skill}`);
    const host = list.find(s => s.v === p.skill);
    check(host && !host.retired && !host.presetOf, `${key}: host ${p.skill} is not a live non-preset skill`);
    // appended: after every frozen id of its category
    const order = frozen.FROZEN_CATEGORY_ORDER[cat] || [];
    const lastFrozen = Math.max(...order.map(v => list.findIndex(s => s.v === v)));
    check(list.indexOf(me) > lastFrozen, `${key}: not appended after the frozen ids`);
    // 1. legal values
    const hostDefs = opt.optionsFor(cat, p.skill);
    for (const [k, v] of Object.entries(p.opts)) {
        const def = hostDefs.find(d => d.id === k);
        check(!!def, `${key}: host has no option "${k}"`);
        if (!def) continue;
        const norm = opt.normalizeOptions(cat, p.skill, { [k]: v });
        check(J(norm[k]) === J(v), `${key}: ${k}=${J(v)} is not a legal host value (normalises to ${J(norm[k])})`);
    }
    // 2. defaults = preset values; explicit wins
    const d = opt.defaultOptions(cat, id);
    for (const [k, v] of Object.entries(p.opts)) check(J(d[k]) === J(v), `${key}: default ${k}=${J(d[k])}, want ${J(v)}`);
    check(J(opt.offeredOptionsFor(cat, id).map(o => o.id)) === J(opt.offeredOptionsFor(cat, p.skill).map(o => o.id)),
        `${key}: offered controls differ from the host's`);
    const firstKey = Object.keys(p.opts)[0];
    const def0 = hostDefs.find(o => o.id === firstKey);
    const other = def0 && def0.type === 'enum' ? def0.values.map(x => x.v).find(x => J(x) !== J(p.opts[firstKey])) : undefined;
    if (other !== undefined) {
        check(J(opt.normalizeOptions(cat, id, { [firstKey]: other })[firstKey]) === J(other), `${key}: explicit ${firstKey} does not win`);
        // 5. that change survives the share code
        const pay = codec.encodeOptionPayload(cat, id, { [firstKey]: other });
        check(pay !== '', `${key}: changing ${firstKey} wrote no payload`);
        check(J(codec.decodeOptionPayload(cat, id, '~' + pay)) === J({ [firstKey]: other }), `${key}: ${firstKey}=${J(other)} -> ${pay} did not round-trip`);
    }
    check(codec.encodeOptionPayload(cat, id, {}) === '', `${key}: writes a payload at its preset values`);
    // 4. tags
    check(data.getSkillGrade(id, cat) !== undefined && data.getSkillGrade(id, cat) !== null, `${key}: no grade`);
    check(data.SKILL_PRINT_SIZE[id] && data.SKILL_PRINT_SIZE[id] === data.SKILL_PRINT_SIZE[p.skill], `${key}: print size ${data.SKILL_PRINT_SIZE[id]} is not the host's ${data.SKILL_PRINT_SIZE[p.skill]}`);
    const tag = standards.SKILL_STANDARDS[key];
    check(tag && Array.isArray(tag.ccss) && tag.ccss.length && /^\d\./.test(tag.ccss[0]), `${key}: no SKILL_STANDARDS with a CCSS code first`);
    const own = terms.SKILL_TERMS[key] || [];
    const n = terms.termCount(terms.termsFor({ categoryId: cat, skillId: id, label: me.l, grade: data.getSkillGrade(id, cat) }));
    check(own.length >= 5 && n >= 5, `${key}: ${own.length} own search terms, ${n} in all`);
    const code = frozen.FROZEN_SKILL_CODES[key];
    check(!!code && data.SKILL_CODES[key] === code, `${key}: share code not pinned (${data.SKILL_CODES[key]})`);
    check(data.CODE_TO_SKILL[code] && data.CODE_TO_SKILL[code].skillId === id, `${key}: code ${code} decodes to ${J(data.CODE_TO_SKILL[code])}`);
    // provider: the host's
    const prov = contract.getProvider(cat, id);
    check(prov.presetOf === p.skill, `${key}: getProvider did not read the host's provider`);
    // pools: a preset never doubles its host in a mixed pool
    const mixed = list.find(s => /^mixed_/.test(s.v));
    if (mixed) check(!data.getMixedPoolSkills(cat, mixed.v).includes(id), `${key}: in the ${mixed.v} pool`);
}

// 6 (lane S1 check 9). The predicates: preset option id -> (item, value, host, category) -> true | false | null (the
// item cannot be read for it). Self-contained (no closure), so the page runs the same source the self-test runs.
function makeObey() {
    const rd = (q) => {
        const pl = q.cell && q.cell.payload;
        if (pl && Array.isArray(pl.operands) && pl.operands.length >= 2) return pl.operands.slice(0, 2).map(Number);
        if (Number.isFinite(q.a) && Number.isFinite(q.b)) return [q.a, q.b];
        const m = /([\d,]+)\s*[−\-+×÷]\s*([\d,]+)/.exec(String(q.text || ''));
        return m ? [+m[1].replace(/,/g, ''), +m[2].replace(/,/g, '')] : null;
    };
    const nd = (n) => String(Math.abs(Math.trunc(n))).length;
    return {
        // `tiles` on multiply / divide: "21" = a 2-digit number by a 1-digit one (the dividend for ÷)
        tiles: (q, v, host) => { if (!['multiply', 'divide'].includes(host)) return null; const o = rd(q); return o ? nd(o[0]) === Math.floor(+v / 10) && nd(o[1]) === +v % 10 : null; },
        lengths: (q, v) => { const o = rd(q); if (!o) return null; return v === 'shorter' ? nd(o[1]) < nd(o[0]) : v === 'same' ? nd(o[1]) === nd(o[0]) : null; },
        // "within N" bounds the answer: the sum / product, the minuend / dividend
        band: (q, v, host, cat) => { const o = rd(q); if (!o || !Number.isFinite(+v)) return null; const named = cat === 'addition' || cat === 'multiplication' ? Number(String(q.ans).replace(/,/g, '')) : o[0]; return Number.isFinite(named) ? named <= +v : null; },
        // D8 spread (not an option id): the named number over a deep sample reaches the first and the last fifth of
        // its digit class (10-99 for 2 digits; 2-9 for 1). null: no item read, or the named number has more than one
        // length (a product of 2 x 1 digits), so there is no single class to span.
        _spread: (items, cat) => {
            const named = items.map((q) => { const o = rd(q); return !o ? NaN : cat === 'addition' || cat === 'multiplication' ? Number(String(q.ans).replace(/,/g, '')) : o[0]; }).filter(Number.isFinite);
            if (named.length < 10) return null;
            const lens = new Set(named.map(nd));
            if (lens.size !== 1) return null;
            const d = [...lens][0];
            if (d < 2) return null;
            const lo = 10 ** (d - 1), hi = 10 ** d - 1, w = hi - lo;
            const min = Math.min(...named), max = Math.max(...named);
            const needLo = Math.floor(lo + w / 5), needHi = Math.ceil(hi - w / 5);
            return { ok: min <= needLo && max >= needHi, min, max, lo, hi, needLo, needHi, what: cat === 'addition' || cat === 'multiplication' ? 'answer' : 'first number' };
        },
    };
}
if (process.argv.includes('--self-test')) {
    const O = makeObey(), bad = [];
    const t = (c, m) => { if (!c) bad.push(m); };
    t(O.tiles({ a: 47, b: 6 }, 21, 'multiply') === true, 'tiles 21: 47 × 6 obeys');
    t(O.tiles({ a: 47, b: 36 }, 21, 'multiply') === false, 'tiles 21: 47 × 36 (a 2 × 2 item) breaks it');
    t(O.tiles({ text: '96 ÷ 4 = ?' }, 21, 'divide') === true, 'tiles 21 ÷: read from the text');
    t(O.tiles({ a: 4, b: 3 }, 21, 'area_model_mult') === null, 'tiles on another host: no predicate');
    t(O.lengths({ cell: { payload: { operands: [57, 3] } } }, 'shorter') === true && O.lengths({ a: 57, b: 23 }, 'shorter') === false, 'lengths shorter');
    t(O.band({ a: 7, b: 5, ans: 12 }, 10, 'add', 'addition') === false && O.band({ a: 9, b: 4, ans: 5 }, 10, 'sub', 'subtraction') === true, 'band bounds the sum / the minuend');
    t(O.band({ text: 'no numbers' }, 10, 'x', 'addition') === null, 'band: unreadable is null');
    // D8 spread: minuends 51-99 (pilot r1) are narrow; 21-99 (fix r1) reach the first fifth (10-27) and the last (81-99)
    const subs = (lo, hi) => Array.from({ length: 30 }, (_, i) => ({ a: lo + Math.round((hi - lo) * i / 29), b: 1 }));
    t(O._spread(subs(51, 99), 'subtraction').ok === false, 'spread: minuends 51-99 are a narrow set');
    t(O._spread(subs(21, 99), 'subtraction').ok === true, 'spread: minuends 21-99 span the class');
    t(O._spread([{ a: 12, b: 3, ans: 36 }, { a: 98, b: 7, ans: 686 }].concat(subs(10, 99).map((x) => ({ a: x.a, b: 2, ans: x.a * 2 }))), 'multiplication') === null, 'spread: a product of several lengths is not judged');
    for (const b of bad) console.error('  - ' + b);
    console.log(bad.length ? `ws-presets-unit: FAIL - self-test (${bad.length})` : 'ws-presets-unit: OK (self-test, 10 predicate cases)');
    process.exit(bad.length ? 1 : 0);
}

// 3. generation, in the app
const require = createRequire(import.meta.url);
const { open } = require('../lib/ws-harness.cjs');
const app = await open({ seed: 1 });
try {
    // (the page function and makeObey go in as source: makeObey is a function, which evaluate() cannot pass as an argument)
    const pageCheck = async (list, makeObey) => {
        const out = [];
        // the composer's own instruction reader (the module the app loaded: same URL, same registry)
        let instrKeyOf = null;
        try { instrKeyOf = (await import(new URL('js/modules/sheet/roles/compose.js', location.href).href)).instructionKeyOf || null; } catch (e) { instrKeyOf = null; }
        if (!instrKeyOf) out.push('check 7: sheet/roles/compose.js instructionKeyOf could not be loaded: the instruction key was not checked');
        let instrChecked = 0, spreadChecked = 0, spreadSkipped = 0;
        // the area model's input ids open with Date.now() (a per-call DOM id, not content): drop the clock part
        const strip = (q) => q && J2({ t: q.text, a: q.ans, v: q.visual, c: q.cell }).replace(/(data-area-idx=\\?")\d+/g, '$1');
        function J2(x) { return JSON.stringify(x); }
        const OBEY = makeObey();
        let obeyChecked = 0, obeySkipped = 0, genericChecked = 0;
        for (const [key, p] of list) {
            const [cat, id] = key.split(':');
            // A whole page of the preset, then a whole page of the host with the preset values: a page's
            // deals are cached per page (page-deal.js), so the two are compared page against page, never
            // interleaved item by item (an interleaved host item would reuse the preset page's decks).
            const page = (skill, opts) => Array.from({ length: 6 }, (_, i) =>
                window.generateQuestionFor({ category: cat, skill, opts, seed: 1000 + i * 7, itemIndex: i, itemCount: 6 }));
            const pa = page(id), pb = page(p.skill, p.opts);
            for (let i = 0; i < 6; i++) {
                const a = pa[i], b = pb[i];
                if (!a) { out.push(`${key} item ${i}: generated nothing`); continue; }
                if (strip(a) !== strip(b)) out.push(`${key} item ${i}: differs from ${p.skill} with ${J2(p.opts)}`);
                if (a.presetId !== id || a.skillId !== p.skill) out.push(`${key} item ${i}: presetId=${a.presetId} skillId=${a.skillId}`);
            }
            // 6. the preset's items OBEY its preset values (lane S1 check 9): check 3 compares the preset with the
            // host given the same values, so a host that ignores a value passes it twice. Here (a) every preset value
            // with a known predicate holds on every item, and (b) the preset's page is not the host's DEFAULT page
            // (a preset whose values change nothing is not a preset).
            for (let i = 0; i < 6; i++) {
                const a = pa[i];
                if (!a) continue;
                for (const [ok, v] of Object.entries(p.opts)) {
                    const pred = OBEY[ok];
                    const r = pred ? pred(a, v, p.skill, cat) : null;
                    if (r === null) { obeySkipped++; continue; }
                    obeyChecked++;
                    if (!r) out.push(`${key} item ${i}: does not obey its preset ${ok}=${J2(v)} (${String(a.text || '').slice(0, 40)} = ${a.ans})`);
                }
            }
            // 7. pilot critic r1 D8 (lane S1 fix r1). (a) The INSTRUCTION: the sheet's instruction key for the preset's
            // items, read the way the page composer reads it (compose.js instructionKeyOf, with the preset as the
            // section's listed skill), is the host's key for the host's items with the preset values (D8: sub_2d_1d
            // matched no listed skill and printed "Solve. Write the answer." where the host says "Subtract.").
            if (instrKeyOf) {
                const kp = instrKeyOf(pa.filter(Boolean).map((q) => ({ q })), [{ categoryId: cat, skillId: id, opts: p.opts }]);
                const kh = instrKeyOf(pb.filter(Boolean).map((q) => ({ q })), [{ categoryId: cat, skillId: p.skill, opts: p.opts }]);
                instrChecked++;
                if (kp !== kh) out.push(`${key}: instruction key "${kp}" on its own page, but its host ${p.skill} says "${kh}" (pilot D8)`);
            }
            // (b) The SPREAD: over 60 items the number "within N" bounds (minuend / dividend; sum / product) reaches
            // the first and the last fifth of its digit class (D8: minuends 51-99 only, for a 2-digit class 10-99).
            const deep = Array.from({ length: 60 }, (_, i) => window.generateQuestionFor({ category: cat, skill: id, seed: 5000 + 13 * i, itemIndex: i, itemCount: 60 }));
            const sv = ['addition', 'subtraction', 'multiplication', 'division'].includes(cat) ? OBEY._spread(deep.filter(Boolean), cat) : null;   // (the + − × ÷ ladder rungs: D8's class)
            if (sv === null) spreadSkipped++;
            else { spreadChecked++; if (!sv.ok) out.push(`${key}: narrow set: its ${sv.what} runs ${sv.min}-${sv.max} over 60 items, inside the ${sv.lo}-${sv.hi} class it must reach ${sv.needLo} or below and ${sv.needHi} or above (pilot D8)`); }
            const pd = page(p.skill, undefined);
            genericChecked++;
            if (pa.every((a, i) => a && pd[i] && strip(a) === strip(pd[i]))) out.push(`${key}: its 6 items equal ${p.skill}'s DEFAULT items: the preset values ${J2(p.opts)} change nothing`);
            // explicit opts win over the preset values
            const k = Object.keys(p.opts)[0];
            const q = window.generateQuestionFor({ category: cat, skill: id, opts: { [k]: p.opts[k] }, seed: 5 });
            if (!q || J2(q.skillOptions[k]) !== J2(p.opts[k])) out.push(`${key}: skillOptions.${k} not carried`);
            // state restored
            if (window.state.skill === p.skill) out.push(`${key}: state.skill left on the host`);
        }
        return { out, obeyChecked, obeySkipped, genericChecked, instrChecked, spreadChecked, spreadSkipped };
    };
    const res = await app.page.evaluate(`(${pageCheck.toString()})(${JSON.stringify(entries)}, ${makeObey.toString()})`);
    failures.push(...res.out);
    obeyNote = `${res.obeyChecked} item×value predicate checks (tiles / lengths / band), ${res.obeySkipped} value(s) with no predicate, ${res.genericChecked} presets checked against the host default page; D8: ${res.instrChecked} instruction keys = the host's, ${res.spreadChecked} spreads checked (${res.spreadSkipped} with no single-length named number)`;
    if (!res.instrChecked) failures.push('check 7: no preset instruction key was checked');
    if (!res.genericChecked) failures.push('check 9: no preset was checked against its host default (0 items checked)');
    // the 2-char share code opens the preset
    const codeRes = await app.page.evaluate(() => {
        const c = window.SKILL_CODES['multiplication:mult_2by2_standard'];
        const back = window.CODE_TO_SKILL[c];
        return back && back.skillId === 'mult_2by2_standard' ? '' : `code ${c} -> ${JSON.stringify(back)}`;
    });
    if (codeRes) failures.push(codeRes);
    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 3).map(p => p.text).join(' | ')}`);
} finally {
    await app.close();
}

// D8 pin (lane S1, 2026-10-24): the instruction-key / spread findings that already print on the base are pinned by their
// exact text in tests/fixtures/precritic/presets-d8.baseline.json, so a lane touching a preset fails only on a NEW one.
// Only "(pilot D8)" lines can be pinned; every other failure always fails. `--write-baseline` re-pins (STATUS note).
// `--no-baseline` judges everything (the backtest rows run on old trees, which have no pin file of their own).
{
    const fsx = await import('node:fs');
    const PIN = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'precritic', 'presets-d8.baseline.json');
    // (the 44 instruction-key findings were fixed 2026-10-30 at the root, practice.js skillWords: an instruction-key line
    // is never pinnable again, so a preset whose page prints another line than its options call for always FAILS)
    const pinnable = (f) => / \(pilot D8\)$/.test(f) && !/: instruction key "/.test(f);
    const d8 = failures.filter(pinnable);
    if (process.argv.includes('--write-baseline')) {
        fsx.writeFileSync(PIN, JSON.stringify({ note: 'ws-presets-unit pilot-D8 findings pinned on the base (lane S1, 2026-10-24): a preset whose own page uses another instruction key than its host, or a narrow set. Lower when fixed; never add one without a STATUS note.', pinned: d8.sort() }, null, 1) + '\n');
        console.log(`ws-presets-unit: pinned ${d8.length} D8 finding(s) in ${PIN}`);
    }
    let pinned = new Set();
    // only "(pilot D8)" lines are ever held (S1 critic r2 N-r2-2: a hand-added check-6 line in the pin was silenced)
    if (!process.argv.includes('--no-baseline')) { try { pinned = new Set((JSON.parse(fsx.readFileSync(PIN, 'utf8')).pinned || []).filter(pinnable)); } catch (e) { /* no pin: judge all */ } }
    const held = failures.filter((f) => pinned.has(f));
    if (held.length) console.log(`ws-presets-unit: ${held.length} pinned D8 finding(s) still print (${PIN.split('/').slice(-1)[0]})`);
    for (let i = failures.length - 1; i >= 0; i--) if (pinned.has(failures[i])) failures.splice(i, 1);
}
if (failures.length) { console.error(`ws-presets-unit: FAIL (${failures.length})`); failures.slice(0, 60).forEach(f => console.error('  - ' + f)); process.exit(1); }
console.log(`ws-presets-unit: OK (${entries.length} presets: host live, values legal, defaults = preset, explicit wins, seeded items = host items, items obey the preset values: ${obeyNote}, tags + terms + print size + pinned code, options round-trip)`);
