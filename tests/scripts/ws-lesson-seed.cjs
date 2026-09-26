// THE LESSON SEED (design/LESSON_LIBRARY_PLAN.md §1-2, phase 0): one DRAFT record for every WRM small
// step, derived from what the repo already knows - the step's title, year, block, grade, v3 CCSS and
// EE codes (data/curriculum/wrm-steps.json via js/modules/wrm.js), the skills tagged to it
// (SKILL_WRM), the family whose lane owns it and a first guess at its archetype. A lesson lane starts
// a lesson from its seed record; the seed never overrides a written lesson.
//
// It also writes the PREREQUISITE FALLBACK (js/modules/lessons/prereq-db.js): for every live skill,
// the prerequisite skills a lesson-less skill defaults to (LESSON_LIBRARY_PLAN.md §8e, "Mix in
// prerequisite skills"): the skills of the CCSS standard(s) a grade before its primary code, in the
// same domain, then the skills of the two WRM small steps before its first step in its block - most basic first.
// library.js prerequisiteSkillsFor() reads it for a skill with no lesson.
//
//   node tests/scripts/ws-lesson-seed.cjs             # write seed-db.js and prereq-db.js
//   node tests/scripts/ws-lesson-seed.cjs --check     # fail when either file is out of date
//   node tests/scripts/ws-lesson-seed.cjs --json      # print the records
//
// Node only (no browser). The output is deterministic: two runs of one tree write the same bytes.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'js/modules/lessons/seed-db.js');
const OUT_PRE = path.join(ROOT, 'js/modules/lessons/prereq-db.js');
const MAX_PRE = 5;
const has = (k) => process.argv.includes('--' + k);

/** The family (lesson lane) of a WRM block, by its name. Reception and Y1 number are early number. */
function familyOf(blockName, yearId) {
    const n = String(blockName || '').toLowerCase();
    if (/statistic/.test(n)) return 'data';
    if (/algebra/.test(n)) return 'algebra';
    if (/fraction|decimal|percent|ratio/.test(n)) return 'fractions';
    if (/time|money/.test(n)) return 'timemoney';
    if (/shape|angle|position|direction|geometry|symmetry|circles and triangles|shapes with|spatial/.test(n)) return 'geometry';
    if (/length|height|mass|weight|capacity|volume|area|perimeter|measure|converting units/.test(n)) return 'measure';
    if (/multiplication|division|multiply|divide|times/.test(n)) return 'multdiv';
    if (/addition|subtraction|add|subtract/.test(n)) return yearId === 'R' ? 'early' : 'addsub';
    if (/place value/.test(n)) return yearId === 'R' || yearId === 'Y1' ? 'early' : 'placevalue';
    return yearId === 'R' || yearId === 'Y1' ? 'early' : 'placevalue';
}

/** A first guess at a step's archetype (§6), from its title and family. A lesson lane confirms it. */
function archetypeOf(title, family) {
    const t = String(title || '').toLowerCase();
    if (/problem/.test(t) && !/problem solving - efficient/.test(t)) return 'story';
    if (/round|number line|negative|estimate on|between/.test(t)) return 'line';
    if (/column|written method|formal method|long multiplication|long division|short division|(two|three|four)-digit numbers \(|2-digit numbers \(|3-digit numbers \(|4-digit numbers \(/.test(t)) return 'column';
    if (/bond|part-whole|parts and wholes|fact famil|missing|bar model|inverse/.test(t)) return 'partwhole';
    if (/equal groups|array|share|grouping|groups of/.test(t)) return 'groups';
    if (/place value|partition|tens and ones|hundreds|thousands|base 10|counters|multiply by 10|divide by 10|compare and order|represent numbers/.test(t)) return 'pv';
    if (/count|how many|subitise|one more|one less/.test(t)) return family === 'early' ? 'count' : 'pv';
    const byFamily = { fractions: 'fraction', measure: 'measure', timemoney: 'timemoney', geometry: 'shape', data: 'data', algebra: 'partwhole', early: 'count', placevalue: 'pv', addsub: 'fact', multdiv: 'fact' };
    return byFamily[family] || 'fact';
}

(async () => {
    const wrm = await import(pathToFileURL(path.join(ROOT, 'js/modules/wrm.js')).href);
    const years = new Map(wrm.WRM_YEARS.map((y) => [y.id, y]));
    const blocks = new Map(wrm.WRM_BLOCKS.map((b) => [b.id, b]));
    const rows = wrm.WRM_STEPS.map((s) => {
        const yearId = s.id.split('.')[0];
        const blockId = s.id.replace(/\.S\d+$/, '');
        const b = blocks.get(blockId) || {};
        const y = years.get(yearId) || {};
        const family = familyOf(b.name, yearId);
        const skills = wrm.skillsForWrmStep(s.id, { withPartial: true });
        return {
            id: s.id, title: s.title, year: yearId, grade: y.usGrade || '', block: blockId, blockName: b.name || '',
            ccss: s.ccss || [], ee: s.ee || [], flag: s.flag || '',
            family, archetype: archetypeOf(s.title, family),
            skills: skills.filter((x) => !x.partial).map((x) => x.key),
            partial: skills.filter((x) => x.partial).map((x) => x.key),
        };
    });
    if (has('json')) { console.log(JSON.stringify(rows, null, 1)); return; }
    const byFamily = {};
    for (const r of rows) byFamily[r.family] = (byFamily[r.family] || 0) + 1;
    const lines = rows.map((r) => `    ${JSON.stringify([r.id, r.title, r.grade, r.blockName, r.ccss, r.ee, r.family, r.archetype, r.skills, r.partial, r.flag])},`);
    const out = `// seed-db.js - GENERATED by \`node tests/scripts/ws-lesson-seed.cjs\` from the WRM small steps
// (js/modules/wrm.js: data/curriculum/wrm-steps.json and SKILL_WRM). Do not edit by hand.
//
// One DRAFT lesson record per WRM small step (design/LESSON_LIBRARY_PLAN.md §1): the lesson id is the
// step id. A written lesson (lessons/families/*.js) always wins over its seed; the seed says what a
// lesson lane starts from - the title, grade, block, codes, the family that owns it, a first guess at
// the archetype, and the skills tagged to the step (full, then partial).
//
// ${rows.length} steps; by family: ${Object.entries(byFamily).sort().map(([f, n]) => `${f} ${n}`).join(', ')}.

const F = ['id', 'title', 'grade', 'blockName', 'ccss', 'ee', 'family', 'archetype', 'skills', 'partial', 'flag'];
const ROWS = [
${lines.join('\n')}
];

/** Every seed record, in curriculum order. */
export const SEEDS = Object.freeze(ROWS.map((r) => Object.freeze(Object.fromEntries(F.map((k, i) => [k, r[i]])))));
const BY_ID = new Map(SEEDS.map((s) => [s.id, s]));

/** The seed record of a WRM step id, or null. */
export function seedOf(id) {
    return BY_ID.get(String(id || '')) || null;
}

export default { SEEDS, seedOf };
`;
    // ---- the prerequisite fallback of every live skill
    const mem = {};
    globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    const log = console.log;
    console.log = () => {};
    const data = await import(pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href).finally(() => { console.log = log; });
    const std = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards.js')).href);
    const live = [];
    for (const [cat, list] of Object.entries(data.SKILLS)) for (const sk of list || []) if (sk && sk.v && !sk.retired && !(data.isRetiredSkill && data.isRetiredSkill(cat, sk.v))) live.push(`${cat}:${sk.v}`);
    const liveSet = new Set(live);
    const stepIndex = new Map(wrm.WRM_STEPS.map((st, i) => [st.id, i]));
    const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
    const pre = {};
    for (const key of live) {
        const [cat, sid] = key.split(':');
        const out = [];
        const add = (k, why) => { if (k !== key && liveSet.has(k) && !out.some((x) => x[0] === k)) out.push([k, why]); };
        // The CCSS progression: the standards of the grade before, same domain, its skills.
        const code = std.primaryStandard(cat, sid);
        const rec = code ? std.CCSS_STANDARDS.find((r) => r.code === code) : null;
        if (rec) {
            const g = GRADES.indexOf(rec.grade);
            const before = g > 0 ? std.CCSS_STANDARDS.filter((r) => r.grade === GRADES[g - 1] && r.domain === rec.domain) : [];
            // The same cluster letter first (the closest idea), then the domain's other clusters.
            before.sort((a, b) => (a.cluster === rec.cluster ? 0 : 1) - (b.cluster === rec.cluster ? 0 : 1));
            for (const r of before) { const ks = std.skillsForStandard(r.code); if (ks.length) add(ks[0], `ccss ${r.short || r.code}`); if (out.length >= 2) break; }
        }
        // The two WRM small steps before the skill's first step.
        const steps = wrm.wrmFor(cat, sid).map((x) => x.id).filter((id) => stepIndex.has(id)).sort((a, b) => stepIndex.get(a) - stepIndex.get(b));
        if (steps.length) {
            const i = stepIndex.get(steps[0]);
            const block = (id) => id.replace(/\.S\d+$/, '');
            for (const j of [i - 2, i - 1]) {
                if (j < 0) continue;
                const st = wrm.WRM_STEPS[j];
                // (Within the step's own block: the step before a block's first step is another topic.)
                if (block(st.id) !== block(steps[0])) continue;
                for (const k of wrm.skillsForWrmStep(st.id)) add(k, `wrm ${st.id}`);
            }
        }
        if (out.length) pre[key] = out.slice(-MAX_PRE);
    }
    // Compact: every skill key once, then each skill's list as [index, why] pairs.
    const keys = [...new Set(Object.entries(pre).flatMap(([k, v]) => [k, ...v.map((x) => x[0])]))].sort();
    const at = new Map(keys.map((k, i) => [k, i]));
    const preOut = `// prereq-db.js - GENERATED by \`node tests/scripts/ws-lesson-seed.cjs\` from js/modules/wrm.js (SKILL_WRM, the
// small steps) and js/modules/standards.js (the CCSS codes and their skills). Do not edit by hand.
//
// The PREREQUISITE FALLBACK of a skill that has no lesson yet (design/LESSON_LIBRARY_PLAN.md §8e): the
// skills of the CCSS standards a grade before its primary code (same domain, same cluster first), then
// the skills of the two WRM small steps before its first step (in its block) - most basic first, at most ${MAX_PRE}.
// A skill WITH a lesson takes its lesson's \`prereqs\` instead (lessons/library.js prerequisiteSkillsFor).
//
// ${Object.keys(pre).length} of ${live.length} live skills have a fallback list.

const K = ${JSON.stringify(keys)};
const P = {
${Object.entries(pre).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `    ${at.get(k)}: ${JSON.stringify(v.map(([kk, why]) => [at.get(kk), why]))},`).join('\n')}
};

/** The fallback prerequisite skills of a skill: [{key, why}], most basic first ([] when none). */
export function prereqFallback(key) {
    const i = K.indexOf(String(key || ''));
    return i < 0 || !P[i] ? [] : P[i].map(([j, why]) => ({ key: K[j], why }));
}

export default { prereqFallback };
`;
    if (has('check')) {
        const stale = [[OUT, out], [OUT_PRE, preOut]].filter(([f, t]) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '') !== t).map(([f]) => path.relative(ROOT, f));
        if (stale.length) { console.log(`ws-lesson-seed: FAIL (${stale.join(', ')} out of date: run node tests/scripts/ws-lesson-seed.cjs)`); process.exit(1); }
        console.log(`ws-lesson-seed: OK (${rows.length} steps, ${Object.keys(pre).length} prerequisite fallbacks, both files up to date)`);
        return;
    }
    fs.writeFileSync(OUT, out);
    fs.writeFileSync(OUT_PRE, preOut);
    console.log(`ws-lesson-seed: wrote ${rows.length} seed records to ${path.relative(ROOT, OUT)} (${Object.entries(byFamily).sort().map(([f, n]) => `${f} ${n}`).join(', ')})`);
    console.log(`ws-lesson-seed: wrote ${Object.keys(pre).length} prerequisite fallbacks (of ${live.length} live skills) to ${path.relative(ROOT, OUT_PRE)}`);
})().catch((e) => { console.error(e); process.exit(1); });
