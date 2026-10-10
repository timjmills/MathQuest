// ws-wrm-page-unit.mjs — node unit test for the White Rose page data: the GENERATED sequence
// (wrm-sequence-db.js) and the link rules (wrm-links.js). Run: node tests/scripts/ws-wrm-page-unit.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { WRM_SEQUENCE } from '../../js/modules/wrm-sequence-db.js';
import { WRM_STEPS, skillsForWrmStep } from '../../js/modules/wrm.js';
import { linksFor, allLessons, lessonByKey, searchLessons, addCuratedYear, clearCurated, proposalName,
    PREREQ_CAP, RELATED_CAP, WRM_LINK_OVERRIDES, REP_PAIRS, MAP_STRANDS, strandOfKey, repPairsOfText } from '../../js/modules/wrm-links.js';
import { buildQueue, passes, toCSV, CSV_HEAD, gradesOfText, gradeOfCode, gradeOfRit } from '../../js/modules/build-queue.js';

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
clearCurated();
ok(linksFor('2:D1:1').source === 'rules', 'clearCurated');
// the curated files on disk and data/curriculum/links/index.json agree
const dir = new URL('../../data/curriculum/links/', import.meta.url);
const files = existsSync(dir) ? readdirSync(dir) : [];
const onDisk = files.filter((f) => /^(R|Y[1-6])\.json$/.test(f)).map((f) => f.replace('.json', '')).sort();
const idx = JSON.parse(readFileSync(new URL('index.json', dir)));
ok(JSON.stringify(onDisk) === JSON.stringify([...idx.years].sort()), `index.json years ${JSON.stringify(idx.years)} = files on disk ${JSON.stringify(onDisk)}`);
ok(!!idx.map === files.includes('MAP.json'), `index.json map ${idx.map} = MAP.json on disk ${files.includes('MAP.json')}`);

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
const csv = toCSV(Q1.items.slice(0, 5)).split('\r\n');
ok(csv.length === 6 && csv[0] === CSV_HEAD.join(','), 'CSV header + rows');

// search
ok(searchLessons('Represent numbers to 100')[0].title === 'Represent numbers to 100', 'search exact title first');
ok(searchLessons('3.NF.A.1').length > 0, 'search by CCSS code');
ok(searchLessons('zzzz').length === 0, 'search nothing');

console.log(`ws-wrm-page-unit: ${fails ? 'FAIL (' + fails + ')' : 'OK'} — ${L.length} lessons, ${mapped} mapped`);
process.exit(fails ? 1 : 0);
