// ws-wrm-page-unit.mjs — node unit test for the White Rose page data: the GENERATED sequence
// (wrm-sequence-db.js) and the link rules (wrm-links.js). Run: node tests/scripts/ws-wrm-page-unit.mjs
import { readFileSync } from 'node:fs';
import { WRM_SEQUENCE } from '../../js/modules/wrm-sequence-db.js';
import { WRM_STEPS, skillsForWrmStep } from '../../js/modules/wrm.js';
import { linksFor, allLessons, lessonByKey, searchLessons, addCuratedYear, clearCurated, proposalName,
    PREREQ_CAP, RELATED_CAP, WRM_LINK_OVERRIDES } from '../../js/modules/wrm-links.js';

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
// search
ok(searchLessons('Represent numbers to 100')[0].title === 'Represent numbers to 100', 'search exact title first');
ok(searchLessons('3.NF.A.1').length > 0, 'search by CCSS code');
ok(searchLessons('zzzz').length === 0, 'search nothing');

console.log(`ws-wrm-page-unit: ${fails ? 'FAIL (' + fails + ')' : 'OK'} — ${L.length} lessons, ${mapped} mapped`);
process.exit(fails ? 1 : 0);
