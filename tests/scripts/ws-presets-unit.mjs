// PRESET skills gate (owner rule 2026-10-17, design/PRESET_SKILLS.md).
//   node tests/scripts/ws-presets-unit.mjs
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
    for (const b of bad) console.error('  - ' + b);
    console.log(bad.length ? `ws-presets-unit: FAIL - self-test (${bad.length})` : 'ws-presets-unit: OK (self-test, 7 predicate cases)');
    process.exit(bad.length ? 1 : 0);
}

// 3. generation, in the app
const require = createRequire(import.meta.url);
const { open } = require('../lib/ws-harness.cjs');
const app = await open({ seed: 1 });
try {
    // (the page function and makeObey go in as source: makeObey is a function, which evaluate() cannot pass as an argument)
    const pageCheck = (list, makeObey) => {
        const out = [];
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
        return { out, obeyChecked, obeySkipped, genericChecked };
    };
    const res = await app.page.evaluate(`(${pageCheck.toString()})(${JSON.stringify(entries)}, ${makeObey.toString()})`);
    failures.push(...res.out);
    obeyNote = `${res.obeyChecked} item×value predicate checks (tiles / lengths / band), ${res.obeySkipped} value(s) with no predicate, ${res.genericChecked} presets checked against the host default page`;
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

if (failures.length) { console.error(`ws-presets-unit: FAIL (${failures.length})`); failures.slice(0, 40).forEach(f => console.error('  - ' + f)); process.exit(1); }
console.log(`ws-presets-unit: OK (${entries.length} presets: host live, values legal, defaults = preset, explicit wins, seeded items = host items, items obey the preset values: ${obeyNote}, tags + terms + print size + pinned code, options round-trip)`);
