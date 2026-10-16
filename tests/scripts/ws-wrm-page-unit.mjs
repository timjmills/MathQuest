// ws-wrm-page-unit.mjs — node unit test for the White Rose page data: the GENERATED sequence
// (wrm-sequence-db.js) and the link rules (wrm-links.js). Run: node tests/scripts/ws-wrm-page-unit.mjs
//   --write-index        regenerate data/curriculum/links/index.json from the files on disk (after a merge)
//   --curated <dir,...>  also run the jargon gate over the tagging lanes' newest files
// The JARGON gate runs over EVERY teacher-facing line of the real link files (why / missing / partial /
// prior lines, MAP task notes, every Skills to be made field) through the page's own text functions.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
const { ready: jargonReady, jargonHit } = createRequire(import.meta.url)('../lib/wrm-jargon.cjs');
await jargonReady();
import { WRM_SEQUENCE } from '../../js/modules/wrm-sequence-db.js';
import { WRM_STEPS, skillsForWrmStep } from '../../js/modules/wrm.js';
import { linksFor, allLessons, lessonByKey, searchLessons, addCuratedYear, clearCurated, proposalName,
    PREREQ_CAP, RELATED_CAP, WRM_LINK_OVERRIDES, REP_PAIRS, composeWhy, composePartial, composeMissing, proposalLabel, stepsInNote, taskName, MAP_STRANDS, strandOfKey, repPairsOfText } from '../../js/modules/wrm-links.js';
import { buildQueue, passes, toCSV, CSV_HEAD, KINDS, gradesOfText, gradeOfCode, gradeOfRit, closesText, stepName } from '../../js/modules/build-queue.js';

let fails = 0;
const ok = (c, msg) => { if (!c) { fails += 1; console.log('FAIL', msg); } };
const stepIds = new Set(WRM_STEPS.map((s) => s.id));

// sequence
ok(WRM_SEQUENCE.map((g) => g.id).join() === 'PK,K,1,2,3,4,5', 'grades PK..5 in order');
const L = allLessons();
ok(L.length > 900, `>900 lessons (${L.length})`);
for (const l of L) {
    if (l.step) ok(stepIds.has(l.step), `${l.key} maps to a real step ${l.step}`);
    if (l.type === 'build') ok(!l.step, `${l.key} CCSS BUILD has no step`);
}
const mapped = L.filter((l) => l.step).length;
ok(mapped / L.length > 0.9, `>90% mapped (${mapped}/${L.length})`);
const g2 = lessonByKey('2:D1:1');
ok(g2 && g2.title === 'Represent numbers to 100' && g2.step === 'Y3.B1.S1' && g2.power && g2.weeks[0] === 'W01', 'Grade 2 D1 lesson 1 = Y3.B1.S1, power, W01');
const copied = L.find((l) => l.type === 'copied');
ok(copied && copied.from, 'copied-in lesson keeps its source grade');
ok(WRM_SEQUENCE.find((g) => g.id === '2').prior.W01.length >= 5, 'Grade 2 W01 has prior-learning steps');
ok(WRM_SEQUENCE.find((g) => g.id === '2').units.map((u) => u.id).slice(0, 2).join() === 'D1,D2', 'units in workbook order');

// mapping (critic r1 B1): an exact title maps to its exact step; no two White Rose lessons of a grade share
// a step unless their titles are the same lesson; cross-year and adapted mappings are in the report.
const norm = (t) => String(t || '').toLowerCase().replace(/[–—]/g, '-').replace(/[^a-z0-9]+/g, ' ').trim();
const stepById = new Map(WRM_STEPS.map((s) => [s.id, s]));
const YEAR_OF = { PK: 'R', K: 'Y1', 1: 'Y2', 2: 'Y3', 3: 'Y4', 4: 'Y5', 5: 'Y6' };
for (const l of L) {
    if (!l.step || l.type === 'build') continue;
    const st = stepById.get(l.step);
    const year = l.step.split('.')[0];
    const exact = WRM_STEPS.filter((s) => s.id.startsWith(year + '.') && norm(s.title) === norm(l.title));
    if (exact.length === 1) ok(l.step === exact[0].id, `${l.key} "${l.title}" maps to ${l.step}, exact title is ${exact[0].id}`);
    if (!exact.length && !l.note) ok(norm(st.title).length > 0, `${l.key} title-less map`);
}
for (const g of WRM_SEQUENCE) {
    const seen = new Map();
    for (const l of L.filter((x) => x.grade === g.id && x.step && x.type === 'wr')) {
        const prev = seen.get(l.step);
        ok(!prev || norm(prev.title) === norm(l.title) || l.note || prev.note, `${g.id}: "${prev && prev.title}" and "${l.title}" share ${l.step}`);
        seen.set(l.step, l);
    }
}
const pkMore = L.filter((l) => l.grade === 'PK' && /^1 (more|less)$/.test(l.title)).map((l) => l.step);
ok(new Set(pkMore).size === pkMore.length && pkMore.length >= 8, `Pre-K "1 more/1 less" map to distinct steps (${pkMore})`);
ok(L.find((l) => /Find the difference \(US/.test(l.title)).step === 'Y2.B4.S7', 'US money lesson adapted to Y2.B4.S7');
ok(L.filter((l) => l.note === 'ADAPT: US money').length === 5, 'five US-money lessons tagged ADAPT');

// rules
for (const l of L) {
    const r = linksFor(l);
    const d = new Set(r.direct.map((x) => x.key));
    ok(r.prereq.length <= PREREQ_CAP && r.related.length <= RELATED_CAP, `${l.key} caps`);
    ok(r.prereq.every((x) => !d.has(x.key)) && r.related.every((x) => !d.has(x.key)), `${l.key} direct never repeated`);
    const p = new Set(r.prereq.map((x) => x.key));
    ok(r.related.every((x) => !p.has(x.key)), `${l.key} related never repeats a prerequisite`);
    ok(p.size === r.prereq.length, `${l.key} prereq de-duplicated`);
    ok(r.prereq.every((x) => x.why) && r.related.every((x) => x.why), `${l.key} every link says why`);
    if (l.step) ok(r.direct.length === skillsForWrmStep(l.step, { withPartial: true }).length, `${l.key} direct = SKILL_WRM tags`);
    ok(['full', 'partial', 'gap'].includes(r.verdict), `${l.key} verdict`);
}
ok(JSON.stringify(linksFor('2:D1:1')) === JSON.stringify(linksFor('2:D1:1')), 'deterministic');
ok(linksFor('2:D1:1').prereq[0].why.startsWith('Taught before'), 'workbook prior learning comes first');
// override
const second = linksFor('2:D1:1').prereq[1].key;
WRM_LINK_OVERRIDES['Y3.B1.S1'] = { prereq: { add: ['counting:count_objects'], remove: [second] } };
const ov = linksFor('2:D1:1');
ok(ov.prereq[0].key === 'counting:count_objects' && ov.prereq[0].why === 'Added by the school', 'override add goes first');
ok(!ov.prereq.some((x) => x.key === second), 'override remove');
delete WRM_LINK_OVERRIDES['Y3.B1.S1'];
// curated data wins; absent steps fall back
addCuratedYear(JSON.parse(readFileSync(new URL('../fixtures/wrm-links-sample.json', import.meta.url))));
const c = linksFor('2:D1:1');
ok(c.source === 'curated' && c.verdict === 'partial' && c.direct.length === 2 && c.direct[1].partial, 'curated direct + partial');
ok(c.prereq.length === 1 && c.prereq[0].key === 'counting:count_objects', 'curated pre, duplicate of direct dropped');
ok(c.build[0] === 'fixture_pv_model' && proposalName('fixture_pv_model') === 'Fixture place value model', 'curated proposal name');
ok(proposalName('pattern_make') === 'Make a Pattern', 'WRM_PROPOSALS name');
ok(linksFor('2:D1:2').source === 'rules', 'absent step falls back to rules');
// curated opts survive on pre and related (critic r1 B2)
addCuratedYear({ steps: { 'Y3.B1.S2': { title: 'x', direct: [], verdict: 'gap', pre: [{ key: 'placevalue:combine', opts: { band: 99 }, why: 'Y3.B1.S1 Represent numbers to 100 (step before in the block)' }],
    related: [{ key: 'number_sense:place_on_number_line', opts: { span: 10, band: 100 }, why: 'Y2.B1.S8 Write numbers (prior learning wk W01)' }] } } });
const co = linksFor('2:D1:2');
ok(co.prereq[0].opts && co.prereq[0].opts.band === 99 && co.related[0].opts.span === 10, 'curated pre / related keep opts');
ok(!/Y\d\.B\d|prior learning|wk W/.test(co.prereq[0].why + co.related[0].why), `why lines in plain words: "${co.prereq[0].why}" / "${co.related[0].why}"`);
ok(co.prereq[0].why === 'The step before: "Represent numbers to 100".', `composed: the step before -> "${co.prereq[0].why}"`);
clearCurated();
ok(linksFor('2:D1:1').source === 'rules', 'clearCurated');
// the curated files on disk and data/curriculum/links/index.json agree
const dir = new URL('../../data/curriculum/links/', import.meta.url);
const files = existsSync(dir) ? readdirSync(dir) : [];
const onDisk = files.filter((f) => /^(R|Y[1-6])\.json$/.test(f)).map((f) => f.replace('.json', '')).sort();
const want = { years: ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].filter((y) => onDisk.includes(y)), map: files.includes('MAP.json') };
if (process.argv.includes('--write-index')) {
    writeFileSync(new URL('index.json', dir), `${JSON.stringify(want, null, 2)}\n`);
    console.log(`wrote data/curriculum/links/index.json ${JSON.stringify(want)}`);
}
const idx = JSON.parse(readFileSync(new URL('index.json', dir)));
ok(JSON.stringify(onDisk) === JSON.stringify([...idx.years].sort()), `index.json years ${JSON.stringify(idx.years)} = files on disk ${JSON.stringify(onDisk)}`);
ok(!!idx.map === files.includes('MAP.json'), `index.json map ${idx.map} = MAP.json on disk ${files.includes('MAP.json')} (fix: node tests/scripts/ws-wrm-page-unit.mjs --write-index)`);

// representation pairs and strands
ok(REP_PAIRS.length === 8, 'eight representation pairs');
const strandNames = MAP_STRANDS.map((x) => x[1]);
ok(strandNames.length === 7, 'seven MAP strands');
for (const p of REP_PAIRS) {
    for (const [st, rec] of Object.entries(p.strands)) {
        ok(strandNames.includes(st), `${p.id}: strand ${st}`);
        ok(rec.skills.length + rec.build.length > 0, `${p.id}/${st}: skills or a build`);
        for (const k of rec.skills) ok(/^[a-z_]+:[a-z0-9_]+$/.test(k), `${p.id}: key ${k}`);
    }
}
ok(strandOfKey('multiplication:arrays_groups') === 'Multiplication & division' && strandOfKey('graphs:bar_graph') === 'Data & graphing', 'strandOfKey');
ok(repPairsOfText('Read the clock and write the time in words').includes('clock-words'), 'repPairsOfText clock');

// the build queue (Skills to be made)
ok(gradesOfText('2-4').join() === '2,3,4' && gradesOfText('PK-K').join() === 'PK,K', 'gradesOfText');
ok(gradeOfCode('M.EE.3.NF.1') === '3' && gradeOfCode('8.G.A.5') === '6' && gradeOfCode('K.CC.A.1') === 'K', 'gradeOfCode');
ok(gradeOfRit('141-150') === 'K' && gradeOfRit('211-220') === '5', 'gradeOfRit');
const Q0 = buildQueue();
ok(Q0.items.length > 200 && Q0.totals.all === Q0.items.length, `queue without links files: ${Q0.items.length}`);
ok(Q0.totals.bySource.CCSS > 0 && Q0.totals.bySource.EE > 0 && Q0.totals.bySource.WRM > 0 && Q0.totals.bySource.MAP === 0, 'queue sources without MAP.json');
ok(new Set(Q0.items.map((e) => e.id)).size === Q0.items.length, 'queue de-duplicated');
for (const e of Q0.items) {
    ok(e.name && e.teaches && e.closes.length && e.representation, `${e.id}: short spec complete`);
    ok(['new', 'option', 'other'].includes(e.kind) && e.sources.length, `${e.id}: kind + source`);
}
const fx = JSON.parse(readFileSync(new URL('../fixtures/wrm-links-sample.json', import.meta.url)));
const mapFx = { rows: [{ task: 'Fixture task', strand: 'Geometry', ritBand: '181-190', status: 'missing', skills: [], proposal: 'fixture_map_one' }],
    proposals: { fixture_map_one: { kind: 'option', skill: 'shapes_early:shape_attributes', name: 'Fixture MAP option', teaches: 'pick the shape with 4 sides',
        representation: 'shapes in boxes, ring one', ccss: ['2.G.A.1'], map: [{ strand: 'Geometry', ritBand: '181-190', taskType: 'click to select' }], why: 'MAP asks it' },
    fixture_pv_model: { kind: 'new', name: 'ignored second name', teaches: 'x', representation: 'y', why: 'also MAP' } } };
const Q1 = buildQueue({ curated: [fx], map: mapFx });
const one = Q1.items.find((e) => e.id === 'fixture_map_one');
ok(one && one.sources.join() === 'MAP' && one.grades.join() === '2' && one.domain === 'G' && one.map[0].ritBand === '181-190', 'MAP proposal');
const both = Q1.items.find((e) => e.id === 'fixture_pv_model');
ok(both && both.sources.join() === 'WRM,MAP' && both.name === 'Fixture place value model', 'curated + MAP merged on one id, first name kept');
ok(Q1.items.filter((e) => passes(e, { sources: new Set(['MAP']) })).length === 2, 'filter by source');
ok(Q1.items.filter((e) => passes(e, { q: 'fixture map option' })).length === 1, 'filter by search');
ok(Q1.items.filter((e) => passes(e, { grades: new Set(['2']), domains: new Set(['G']), kinds: new Set(['option']) })).some((e) => e.id === 'fixture_map_one'), 'filter grade+domain+kind');
ok(closesText({ 'Y3.B1.S1': 'part-whole' }).join() === 'Y3.B1.S1: part-whole' && closesText(['a', 'b']).length === 2, 'closesText object / array (the CSV keeps the note as written)');
const csv = toCSV(Q1.items.slice(0, 5)).split('\r\n');
ok(csv.length === 6 && csv[0] === CSV_HEAD.join(','), 'CSV header + rows');

// PLAIN-ENGLISH gate (fix round 6: a whitelist, not a blacklist). EVERY teacher-facing line — the White Rose
// why / missing / partial lines, the "To be built" names, the MAP task notes and every Skills to be made field
// (screen and print text) — must pass js/modules/plain-words.js, the SAME check the screens use to decide
// whether a note is shown. Both data modes (no link files; every file on disk and any --curated dir). Zero hits.
const DATA = await import('../../js/modules/data.js');
const TT = await import('../../js/modules/todo-text.js');
const { setSkillLabeler } = await import('../../js/modules/wrm-links.js');
const { teacherLabel } = await import('../../js/modules/teacher-label.js');
const cleanLabel = (l) => String(l || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/^[\s½]+(?=\S)/, '').replace(/\s+/g, ' ').trim();
setSkillLabeler((id) => {
    const [a, b] = String(id).includes(':') ? String(id).split(':') : [DATA.getCategoryForSkill(id), id];
    const sk = (DATA.SKILLS[a] || []).find((x) => x.v === b);
    return sk ? teacherLabel(cleanLabel(sk.l)) : null;
});
// every skill label, as the teacher screens show it, is plain (a new label with a shorthand fails here)
for (const [c, list] of Object.entries(DATA.SKILLS)) for (const sk of list || []) {
    if (!sk || !sk.v) continue;
    const h = jargonHit(teacherLabel(cleanLabel(sk.l)), { fragment: false });
    ok(!h, `skill label not plain on the teacher screens: ${c}:${sk.v} "${sk.l}" (${h && h.name} ${h && h.at}) — write it out in js/modules/teacher-label.js or rename`);
}
// the r2–r5 critics' real lines: each must come out plain (shown whole, or replaced by a composed sentence)
const LESSON = { step: 'Y4.B1.S3', ccss: ['3.NBT.A.2'] };
const REAL = ['Y3.B1.S14 counts in 50s, which no live skill deals', '(Y4.B10.S2 Tenths as fractions, week W30)', 'ftRules only has x or / first',
    'every band stops at 999,999', 'its partWhole variant writes a part-to-whole ratio', 'the forms option is lost on the print path',
    'next steps S4-S5: the same area by b x h / 2', 'Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18; tagged there as a partial cover by a hand tagFix)',
    '(the smallest band is 5)', 'its lowest band (100) deals 51-100', 'generated with itemIndex (the print path)', 'R.B2.S1 / R.B10 compare by size: the compare words',
    'part-whole model (see Y5.B13) [rule 18: opts {"notation":["across"]} for this pupil]', 'Y1.B6.S1 and Y1.B12.S1: counting to 50, and from 50 to 100',
    'groups of 1-3 only (band 5 deals 4 and 5)', 'R.B11.S5 / S6 1 more / 1 less', 'Sum-and-difference brace; two levels) and the journey line', 'the the cat'];
for (const t of REAL) {
    for (const o of [composeWhy(t, { key: 'placevalue:compare', lesson: LESSON, group: 'prereq' }), composePartial(t, ['nl_20']), composeMissing(t, ['nl_20'])]) {
        const h = jargonHit(o); ok(!h, `real line not plain: "${t}" -> "${o}" (${h && h.name})`);
    }
}
{ const w = composeWhy('Y3.B1.S14 counts in 50s, which no live skill deals', { key: 'x:y', lesson: LESSON });
  ok(/Grade 2/.test(w) && !/\( /.test(w), `M5 orphan bracket -> "${w}" names the grade and step`); }
{ const w = composeWhy('Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18)', { lesson: LESSON });
  ok(w === 'Taught before, in Grade 1: "Count in 2s, 5s and 10s" (support block, week 18).', `composed prior learning -> "${w}"`); }
ok(composeWhy('the same number written in unit form (4 hundreds 7 tens 6 ones)', { lesson: LESSON }) === 'The same number written in unit form (4 hundreds 7 tens 6 ones)', 'a plain note is shown whole');
ok(stepsInNote('R.B11.S5 / S6').join() === 'R.B11.S5,R.B11.S6', 'stepsInNote: shorthand chain');
ok(jargonHit('Grade 2/Grade 3 reading a scale') === null && jargonHit('the the cat') && jargonHit('Grade 2: Hundreds ( tens') && jargonHit('ftRules only') && jargonHit('Use band 5'), 'the plain check: plain line passes, the r5 forms fail');

const dirs = [new URL('../../data/curriculum/links/', import.meta.url).pathname];
process.argv.forEach((a, i) => { if (a === '--curated' && process.argv[i + 1]) dirs.push(...process.argv[i + 1].split(',')); });
let jLines = 0, jBad = 0;
const jByForm = {};
const jByKind = {};
const gate = (where, out, opts) => {
    const kind = /^todo/.test(where) ? 'Skills to be made fields' : /^MAP row/.test(where) ? 'MAP task notes' : 'White Rose lesson lines';
    for (const o of [].concat(out)) {
        if (o == null || o === '') continue;
        jLines += 1;
        jByKind[kind] = (jByKind[kind] || 0) + 1;
        const h = jargonHit(o, opts);
        if (h) { jBad += 1; jByForm[h.name] = (jByForm[h.name] || 0) + 1; if (jBad <= (process.env.SHOWALL ? 9999 : 15)) console.log('NOT PLAIN', h.name, '|', where, '|', h.snippet); }
    }
};
const todoGate = (tag, Q) => {
    TT.setTodoNames(Q.items);
    for (const e of Q.items) {
        const T = TT.todoTexts(e);
        for (const [f, v] of Object.entries(T)) gate(`${tag} ${e.id} ${f}`, f === 'kind' ? [(KINDS.find((x) => x[0] === e.kind) || [])[1], ...v].join(' · ') : v);
        gate(`${tag} ${e.id} steps`, e.wrmSteps.map(stepName));
        gate(`${tag} ${e.id} map`, e.map.map(TT.mapLine), { fragment: false });
    }
};
// the share of the tagging lanes' free-text notes the screens now hide (shown whole only when plain)
const P = await import('../../js/modules/plain-words.js');
const hidden = {};
const count = (file, t) => { if (!t || typeof t !== 'string') return; const h = (hidden[file] = hidden[file] || [0, 0]); h[0] += 1; if (!P.plainNote(t)) h[1] += 1; };
todoGate('todo (no files)', buildQueue());
for (const dir of dirs) {
    const years = [];
    let map = null;
    for (const y of ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']) {
        const f = `${dir.replace(/\/$/, '')}/${y}.json`;
        if (!existsSync(f)) continue;
        const d = JSON.parse(readFileSync(f, 'utf8'));
        years.push(d);
        for (const st of Object.values(d.steps || {})) {
            for (const g of ['pre', 'related']) for (const x of st[g] || []) count(`${y}.json`, x.why);
            for (const x of st.partial || []) count(`${y}.json`, x.missing);
            count(`${y}.json`, st.missing);
        }
    }
    const mf = `${dir.replace(/\/$/, '')}/MAP.json`;
    if (existsSync(mf)) { map = JSON.parse(readFileSync(mf, 'utf8')); for (const r of map.rows || []) count('MAP.json', r.closes); }
    if (years.length || map) {
        clearCurated();
        for (const d of years) addCuratedYear(d);
        const Qc = buildQueue({ curated: years, map });
        todoGate(`todo (${dir})`, Qc);
        if (map) {
            TT.setTodoNames(Qc.items);
            for (const r of map.rows || []) {
                const note = TT.mapNote(r.closes, { proposal: r.proposal || '' });
                gate(`MAP row ${r.task}`, note);
                gate(`MAP row ${r.task} name`, taskName(r.task), { fragment: false });   // a name, not a sentence
                if (r.proposal) ok(!/^(?:today|it|this)\b/i.test(note), `M7: MAP note starts with today/it/this: ${r.task} -> "${note}"`);
                if (/equal sign/i.test(r.task || '') && r.proposal) ok(/equal sign/i.test(note) && note.length > 40, `M7: the equal-sign task names its repair: "${note}"`);
            }
        }
        // the lessons themselves, through linksFor (what the screen shows)
        for (const l of L) {
            if (!l.step || !years.some((d) => d.steps && d.steps[l.step])) continue;
            const r = linksFor(l);
            gate(`lesson ${l.key}`, [r.missing, ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), ...r.build.map(proposalLabel), ...r.preBuild.map(proposalLabel), l.title]);
        }
        clearCurated();
    }
}
// rules mode: every lesson's lines with no link files
for (const l of L) { const r = linksFor(l); gate(`lesson (rules) ${l.key}`, [r.missing, ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), l.title]); }
ok(!jBad, `plain-English gate: ${jBad} of ${jLines} teacher-facing lines ${JSON.stringify(jByForm)}`);
console.log(`plain-English gate: ${jLines} teacher-facing lines checked, ${jBad} not plain ${JSON.stringify(jByKind)}`);
console.log(`free-text notes hidden (not plain as written; the composed sentence stands): ${Object.entries(hidden).map(([f, [n, h]]) => `${f} ${h}/${n} (${Math.round((100 * h) / n)}%)`).join(', ')}`);

// search
ok(searchLessons('Represent numbers to 100')[0].title === 'Represent numbers to 100', 'search exact title first');
ok(searchLessons('3.NF.A.1').length > 0, 'search by CCSS code');
ok(searchLessons('zzzz').length === 0, 'search nothing');
ok(searchLessons('week 5', 5, '2').every((l) => l.grade === '2' && l.weeks.includes('W05')), 'search by week, own grade first');
ok(searchLessons('3.NF.A.1', 3)[0].grade === '3', 'a CCSS code ranks its own grade first');

console.log(`ws-wrm-page-unit: ${fails ? 'FAIL (' + fails + ')' : 'OK'} — ${L.length} lessons, ${mapped} mapped`);
process.exit(fails ? 1 : 0);
