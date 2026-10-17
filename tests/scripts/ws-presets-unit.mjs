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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
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

// 3. generation, in the app
const require = createRequire(import.meta.url);
const { open } = require('../lib/ws-harness.cjs');
const app = await open({ seed: 1 });
try {
    const res = await app.page.evaluate((list) => {
        const out = [];
        const strip = (q) => q && J2({ t: q.text, a: q.ans, v: q.visual, c: q.cell });
        function J2(x) { return JSON.stringify(x); }
        for (const [key, p] of list) {
            const [cat, id] = key.split(':');
            for (let i = 0; i < 6; i++) {
                const seed = 1000 + i * 7;
                const a = window.generateQuestionFor({ category: cat, skill: id, seed, itemIndex: i, itemCount: 6 });
                const b = window.generateQuestionFor({ category: cat, skill: p.skill, opts: p.opts, seed, itemIndex: i, itemCount: 6 });
                if (!a) { out.push(`${key} item ${i}: generated nothing`); continue; }
                if (strip(a) !== strip(b)) out.push(`${key} item ${i}: differs from ${p.skill} with ${J2(p.opts)}`);
                if (a.presetId !== id || a.skillId !== p.skill) out.push(`${key} item ${i}: presetId=${a.presetId} skillId=${a.skillId}`);
            }
            // explicit opts win over the preset values
            const k = Object.keys(p.opts)[0];
            const q = window.generateQuestionFor({ category: cat, skill: id, opts: { [k]: p.opts[k] }, seed: 5 });
            if (!q || J2(q.skillOptions[k]) !== J2(p.opts[k])) out.push(`${key}: skillOptions.${k} not carried`);
            // state restored
            if (window.state.skill === p.skill) out.push(`${key}: state.skill left on the host`);
        }
        return out;
    }, entries);
    failures.push(...res);
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
console.log(`ws-presets-unit: OK (${entries.length} presets: host live, values legal, defaults = preset, explicit wins, seeded items = host items, tags + terms + print size + pinned code, options round-trip)`);
